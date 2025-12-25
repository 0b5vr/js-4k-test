#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

// compeko - pack JavaScript into a self-extracting html+deflate
// v2.0.1

// Copyright (c) 2022-2024 0b5vr
// SPDX-License-Identifier: MIT

// Usage:
// - prepare a js code, which will be fed into `eval`
// - install Deno as your runtime
// - install zopfli and make it visible via PATH
// - run: `deno run --allow-read --allow-write --allow-run compeko.ts input.js output.html`

// Shoutouts to:
// - gasman, for pnginator ... https://gist.github.com/gasman/2560551
// - Charles Boccato, for JsExe ... https://www.pouet.net/prod.php?which=59298
// - subzey, for fetchcrunch ... https://github.com/subzey/fetchcrunch
//   - Achieves almost the same concept. Referred several tricks of the header code

// =================================================================================================

// -- modules --------------------------------------------------------------------------------------
import { relative } from 'https://deno.land/std@0.221.0/path/relative.ts';
import { expandGlob } from 'https://deno.land/std@0.221.0/fs/expand_glob.ts';

// -- sanity check ---------------------------------------------------------------------------------
if (Deno.args.length < 2) {
  console.error('Usage: deno run --allow-read --allow-write --allow-run compeko.ts input.js output.html');
  Deno.exit(1);
}

try {
  const zopfliHelp = new Deno.Command('zopfli', { args: ['-h'] });
  await zopfliHelp.output();
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    console.error('\x1b[31mzopfli is not installed or not visible via PATH\x1b[0m');
    Deno.exit(1);
  } else {
    throw e;
  }
}

// -- file stuff -----------------------------------------------------------------------------------
const inputGlob = Deno.args[0];
const inputEntry = await expandGlob(inputGlob).next();
const inputPath = inputEntry?.value?.path;

if (!inputPath) {
  console.error(`\x1b[31mGlob did not match: ${inputGlob}\x1b[0m`);
  Deno.exit(1);
}
const inputPathRelative = relative('.', inputPath);
console.info(`Input file: \x1b[34m${inputPathRelative}\x1b[0m`);

const outputPath = Deno.args[1];
console.info(`Output file: \x1b[34m${outputPath}\x1b[0m`);

// -- main -----------------------------------------------------------------------------------------
console.info('Compressing the file...');

const inputFile = await Deno.readTextFile(inputPath);
const inputSize = inputFile.length;
console.info(`Input size: \x1b[32m${inputSize.toLocaleString()} bytes\x1b[0m`);

const zopfli = new Deno.Command('zopfli', {
  args: ['-c', '-i100', '--deflate', inputPath],
});
const compressed = (await zopfli.output()).stdout;

// extra: output deflate
{
  const outputPathBase = outputPath.match(/(.*)\..+$/)?.[1];
  if (!outputPathBase) {
    console.error('\x1b[31mCannot extract base name for deflate output\x1b[0m');
    Deno.exit(1);
  }

  const deflatePath = `${outputPathBase}.deflate.bin`;
  await Deno.writeFile(deflatePath, compressed);
}

const header = '<svg onload="fetch`#`.then(t=>t.blob()).then(t=>new Response(t.slice(156).stream().pipeThrough(new DecompressionStream(\'deflate-raw\'))).text()).then(eval)">';
const headerBuffer = new TextEncoder().encode(header);

const concated = new Uint8Array(headerBuffer.length + compressed.length);
concated.set(headerBuffer);
concated.set(compressed, headerBuffer.length);

const outputSize = concated.length;
const percentage = (100.0 * (outputSize / inputSize)).toFixed(3);
console.info(`Output size: \x1b[32m${outputSize.toLocaleString()} bytes\x1b[0m (${percentage} %)`);

await Deno.writeFile(outputPath, concated);

console.info('Done \x1b[32m✓\x1b[0m');
