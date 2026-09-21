import { GL_COMPILE_STATUS, GL_FRAGMENT_SHADER, GL_LINK_STATUS, GL_VERTEX_SHADER } from './gl-constants';
import { gl } from './gl';
import quadVert from './assets/quad.vert?shader';
import { LOG_SHADER_ERRORS } from './config';

// -- vert -----------------------------------------------------------------------------------------
/**
 * The `quad.vert` shader which is compiled once and reused for all programs
 */
const vertexShader = gl.createShader(GL_VERTEX_SHADER)!;

gl.shaderSource(vertexShader, quadVert);
gl.compileShader(vertexShader);

if (LOG_SHADER_ERRORS) {
  if (!gl.getShaderParameter(vertexShader, GL_COMPILE_STATUS)) {
    console.error(quadVert);
    throw new Error(gl.getShaderInfoLog(vertexShader) ?? undefined);
  }
}

/**
 * Programs already compiled in this session, keyed by their source string.
 *
 * DEV ONLY - will be eliminated in the prod build.
 */
const cache: Record<string, WebGLProgram> = {};

/**
 * Receives a fragment shader string and returns a WebGLProgram that renders the it.
 */
export function lazyQuadProgram(frag: string): WebGLProgram {
  if (import.meta.hot) {
    // if the shader code is identical to a previous one, reuse the program from cache
    if (cache[frag]) { return cache[frag]; }
  }

  // -- frag ---------------------------------------------------------------------------------------
  const fragmentShader = gl.createShader(GL_FRAGMENT_SHADER)!;

  gl.shaderSource(fragmentShader, frag);
  gl.compileShader(fragmentShader);

  if (LOG_SHADER_ERRORS) {
    if (!gl.getShaderParameter(fragmentShader, GL_COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(fragmentShader);
      gl.deleteShader(fragmentShader);
      console.error(frag);
      throw new Error(log ?? undefined);
    }
  }

  // -- program ------------------------------------------------------------------------------------
  const program = gl.createProgram()!;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (LOG_SHADER_ERRORS) {
    if (!gl.getProgramParameter(program!, GL_LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program!);
      gl.deleteProgram(program);
      throw new Error(log ?? undefined);
    }
  }

  // -- return -------------------------------------------------------------------------------------
  if (import.meta.hot) {
    cache[frag] = program;
  }

  return program;
}
