import { GL_COMPILE_STATUS, GL_FRAGMENT_SHADER, GL_LINK_STATUS, GL_VERTEX_SHADER } from './gl-constants';
import { gl } from './gl';
import quadVert from './assets/quad.vert?shader';
import { LOG_SHADER_ERRORS } from './config';

/**
 * Simply receives a fragment shader source and returns a WebGLProgram that renders a full-screen quad.
 */
export function lazyQuadProgram(frag: string): WebGLProgram {
  // -- vert ---------------------------------------------------------------------------------------
  const vertexShader = gl.createShader(GL_VERTEX_SHADER)!;

  gl.shaderSource(vertexShader, quadVert);
  gl.compileShader(vertexShader);

  if (LOG_SHADER_ERRORS) {
    if (!gl.getShaderParameter(vertexShader, GL_COMPILE_STATUS)) {
      console.error(quadVert);
      throw new Error(gl.getShaderInfoLog(vertexShader) ?? undefined);
    }
  }

  // -- frag ---------------------------------------------------------------------------------------
  const fragmentShader = gl.createShader(GL_FRAGMENT_SHADER)!;

  gl.shaderSource(fragmentShader, frag);
  gl.compileShader(fragmentShader);

  if (LOG_SHADER_ERRORS) {
    if (!gl.getShaderParameter(fragmentShader, GL_COMPILE_STATUS)) {
      console.error(frag);
      throw new Error(gl.getShaderInfoLog(fragmentShader) ?? undefined);
    }
  }

  // -- program ------------------------------------------------------------------------------------
  const program = gl.createProgram()!;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);

  if (LOG_SHADER_ERRORS) {
    if (!gl.getProgramParameter(program!, GL_LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program!) ?? undefined);
    }
  }

  // -- return -------------------------------------------------------------------------------------
  return program;
}
