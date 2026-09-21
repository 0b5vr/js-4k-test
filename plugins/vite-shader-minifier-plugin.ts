import { normalizePath, Plugin } from 'vite';
import { promisify } from 'util';
import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { Xorshift } from '@0b5vr/experimental';

const exec = promisify(cp.exec);

/**
 * Regex that matches shader files (i.e. the file imported via `?shader` query param).
 */
const fileRegex = /\?shader$/;

/**
 * Regex that matches the `#pragma shader_minifier_plugin bypass` directive.
 */
const bypassRegex = /^#pragma shader_minifier_plugin bypass$/m;

/**
 * Options for the shader minifier.
 */
export interface ShaderMinifierOptions {
  format?: string;
  hlsl?: boolean;
  fieldNames?: string;
  preserveExternals?: boolean;
  preserveAllGlobals?: boolean;
  noInlining?: boolean;
  aggressiveInlining?: boolean;
  noRenaming?: boolean;
  noRenamingList?: string[];
  noSequence?: boolean;
  noRemoveUnused?: boolean;
  noOverloading?: boolean;
  moveDeclarations?: boolean;
  preprocess?: boolean;
}

/**
 * Generates the minifier options string from the given {@link ShaderMinifierOptions}.
 */
function buildMinifierOptionsString(options: ShaderMinifierOptions): string {
  let str = '';

  if (options.format) {
    str += `--format ${options.format} `;
  }

  if (options.hlsl) {
    str += '--hlsl ';
  }

  if (options.fieldNames) {
    str += `--field-names ${options.fieldNames} `;
  }

  if (options.preserveExternals) {
    str += '--preserve-externals ';
  }

  if (options.preserveAllGlobals) {
    str += '--preserve-all-globals ';
  }

  if (options.noInlining) {
    str += '--no-inlining ';
  }

  if (options.aggressiveInlining) {
    str += '--aggressive-inlining ';
  }

  if (options.noRenaming) {
    str += '--no-renaming ';
  }

  if (options.noRenamingList) {
    str += `--no-renaming-list ${options.noRenamingList.join(',')} `;
  }

  if (options.noSequence) {
    str += '--no-sequence ';
  }

  if (options.noRemoveUnused) {
    str += '--no-remove-unused ';
  }

  if (options.noOverloading) {
    str += '--no-overloading ';
  }

  if (options.moveDeclarations) {
    str += '--move-declarations ';
  }

  if (options.preprocess) {
    str += '--preprocess ';
  }

  return str;
}

/**
 * Shuffles an array using Fisher-Yates and the given RNG.
 */
function arrayShuffle<T>(array: T[], random: () => number): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Minify a set of shader sources through a single shader_minifier invocation,
 * and return a map from each input key to its minified output.
 *
 * @param sources Map from an arbitrary key to shader source string.
 * @param options The minifier options to pass.
 * @returns Map from each key in `sources` to its minified output.
 */
async function runShaderMinifier(
  sources: Map<string, string>,
  options: Omit<ShaderMinifierOptions, 'format'>,
): Promise<Map<string, string>> {
  const minifierOptionsString = buildMinifierOptionsString({ ...options, format: 'json' });

  // tempy only provides esm exports, so we must use dynamic imports here
  const tempy = await import('tempy');

  return await tempy.temporaryDirectoryTask(async (tmpDir) => {
    const filePathKeyMap = new Map<string, string>();

    // Write each shader source to a temporary file, and remember which key it corresponds to
    let i = 0;
    for (const [key, src] of sources) {
      const filePath = normalizePath(path.join(tmpDir, `${i++}.frag`));
      await fs.promises.writeFile(filePath, src, { encoding: 'utf8' });
      filePathKeyMap.set(filePath, key);
    }

    // Build the command line arguments for shader_minifier
    const args = [...filePathKeyMap.keys()].map((file) => `"${file}"`).join(' '); // "0.frag" "1.frag" ...
    const outputPath = normalizePath(path.join(tmpDir, 'output.json'));
    const command = `shader_minifier ${args} ${minifierOptionsString} -o "${outputPath}"`;

    // Run shader_minifier
    await exec(command).catch((error: any) => {
      throw new Error(error.stdout || error.message);
    });

    // Parse the JSON output from shader_minifier
    const resultJson = JSON.parse(await fs.promises.readFile(outputPath, { encoding: 'utf8' })) as {
      shaders: Record<string, string>;
    };

    // Collect the minified shaders from the JSON output and map them back to their original keys
    const result = new Map<string, string>();
    for (const [filePath, key] of filePathKeyMap) {
      const minified = resultJson.shaders[filePath];

      if (minified == null) {
        throw new Error(`shader_minifier produced no output for "${key}"`);
      }

      result.set(key, minified);
    }

    return result;
  });
}

/**
 * Usage:
 *
 * - Collect shader sources and register them with {@link register}.
 *   This returns a placeholder string that can be used in the code to be replaced later.
 * - Call {@link resolveAll} to minify all registered shaders in one batch
 *   and get a map from placeholder string to minified output.
 */
class ShaderPlaceholderBatch {
  #placeholderSourceMap = new Map<string, { id: string; src: string }>();
  #placeholderCount = 0;
  #promisePlaceholderMinifiedMap: Promise<Map<string, string>> | null = null;

  /**
   * Registers a shader source and returns the corresponding placeholder string.
   * The shader source will be minified later in a batch when {@link resolveAll} is called.
   */
  register(id: string, src: string): string {
    const placeholder = `__SHADER_MINIFIER_PLACEHOLDER_${this.#placeholderCount}__`;
    this.#placeholderSourceMap.set(placeholder, { id, src });
    this.#placeholderCount++;

    return placeholder;
  }

  /**
   * Minifies every registered shader in one batch and returns a map from placeholder string
   * to minified output map.
   */
  async resolveAll(
    minifierOptions: ShaderMinifierOptions,
    shuffleSeed: number,
  ): Promise<Map<string, string>> {
    // This might be called multiple times;
    // having a cached promise ensures that we only run the batch once
    this.#promisePlaceholderMinifiedMap ??= this.#runBatch(minifierOptions, shuffleSeed);
    return this.#promisePlaceholderMinifiedMap;
  }

  async #runBatch(
    minifierOptions: ShaderMinifierOptions,
    shuffleSeed: number,
  ): Promise<Map<string, string>> {
    if (this.#placeholderSourceMap.size === 0) {
      return new Map();
    }

    let sortedEntries = [...this.#placeholderSourceMap].sort(([, a], [, b]) => a.id.localeCompare(b.id));

    if (shuffleSeed !== 0) {
      const xorshift = new Xorshift(shuffleSeed);
      const gen = () => xorshift.gen();
      sortedEntries = arrayShuffle(sortedEntries, gen);
    }

    const sources = new Map(sortedEntries.map(([placeholder, { src }]) => [placeholder, src]));

    return await runShaderMinifier(sources, minifierOptions);
  }
}

/**
 * Options for the {@link shaderMinifierPlugin}.
 */
export interface ShaderMinifierPluginOptions {
  /**
   * When `true`, every shader file imported via `?shader` is minified using shader minifier.
   * Change this to `false` to bypass the minification.
   */
  minify: boolean;

  /**
   * Options to pass to shader minifier.
   * See the shader minifier documentation for the available options.
   */
  minifierOptions: Omit<ShaderMinifierOptions, 'format'>;

  /**
   * When `true`, every shader file imported via `?shader` is registered and then all registered
   * shader sources are minified together in a single `shader_minifier` invocation.
   * This means that all identical signatures across all shader files are renamed consistently,
   * which makes the output more compression friendly.
   *
   * When `false`, every shader file is minified independently.
   *
   * This option does not affect the dev server, which always minifies shaders independently.
   */
  batch: boolean;

  /**
   * Seed for shuffling the order in which registered shaders are fed into `shader_minifier`
   * in batch mode.
   * Shader_minifier's cross-file renaming depends on input order, which can affect
   * the minified output size, so trying different seeds lets us hunt for a smaller result.
   *
   * When the value is `0`, the order is not shuffled.
   */
  batchShuffleSeed: number;
}

export const shaderMinifierPlugin: (
  options: ShaderMinifierPluginOptions,
) => Plugin = ({ minify, minifierOptions, batch, batchShuffleSeed }) => {
  /**
   * `true` if the dev server is running.
   * It will be set in the `configResolved` hook.
   * It will be used to determine whether to batch minify shaders or not.
   */
  let isServe = false;

  const shaderBatch = new ShaderPlaceholderBatch();

  return {
    name: 'shader-minifier',
    enforce: 'pre',
    configResolved(config) {
      isServe = config.command === 'serve';
    },
    async transform(src: string, id: string) {
      if (!fileRegex.test(id)) {
        return;
      }

      if (!minify) {
        return `export default \`${src}\`;`;
      }

      if (bypassRegex.test(src)) {
        console.warn(`#pragma shader_minifier_plugin bypass detected in ${id}. Bypassing shader minifier`);

        return `export default \`${src}\`;`;
      }

      if (!batch || isServe) {
        // single file mode: minify the shader source right away.
        const minifierResultMap = await runShaderMinifier(new Map([[id, src]]), minifierOptions);
        const minified = minifierResultMap.get(id)!;

        return {
          code: `export default \`${minified}\`;`,
        };
      } else {
        // batch mode: register the shader source and return a placeholder string
        // The actual minification will happen later in `renderChunk` hook,
        // once the whole required shader sources have been collected.
        const placeholder = shaderBatch.register(id, src);

        return {
          code: `export default \`${placeholder}\`;`,
        };
      }
    },
    async renderChunk(code) {
      // This hook only takes effect in batch mode.
      // In this hook, we minify all registered shader sources in one batch
      // and replace the placeholders in the code with the minified output.

      const resolved = await shaderBatch.resolveAll(minifierOptions, batchShuffleSeed);
      if (resolved.size === 0) {
        return null;
      }

      let newCode = code;
      let changed = false;

      for (const [placeholder, minified] of resolved) {
        if (newCode.includes(placeholder)) {
          newCode = newCode.split(placeholder).join(minified);
          changed = true;
        }
      }

      return changed ? { code: newCode, map: null } : null;
    },
  };
};
