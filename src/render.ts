import { GL_FRAMEBUFFER, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRIANGLE_STRIP } from './gl-constants';
import { HEIGHT, WIDTH } from './constants';
import { INTRO_LENGTH, STOP_RENDERING_AFTER_END } from './config';
import { audio } from './audio';
import { fbmTexture } from './fbmTexture';
import { gl } from './gl';
import { devMusicBeginTime } from './music';
import { programRaymarch } from './programRaymarch';

let programRaymarchHot = programRaymarch;

/**
 * Renders the main scene.
 */
export function render(): void {
  let time = audio.currentTime;

  if (import.meta.env.DEV) {
    time -= devMusicBeginTime;
  }

  // prevent using a GPU after the content ends
  if (STOP_RENDERING_AFTER_END) {
    if (time > INTRO_LENGTH) { return; }
  }

  // -- program ------------------------------------------------------------------------------------
  gl.useProgram(programRaymarchHot);

  // -- uniforms -----------------------------------------------------------------------------------
  gl.activeTexture(GL_TEXTURE0);
  gl.bindTexture(GL_TEXTURE_2D, fbmTexture);

  gl.uniform1f(
    gl.getUniformLocation(programRaymarchHot, 't'),
    time,
  );
  gl.uniform1i(
    gl.getUniformLocation(programRaymarchHot, 'f'),
    0,
  );

  // -- render -------------------------------------------------------------------------------------
  gl.bindFramebuffer(GL_FRAMEBUFFER, null);
  gl.viewport(0, 0, WIDTH, HEIGHT);
  gl.drawArrays(GL_TRIANGLE_STRIP, 0, 4);
}

// -- hot ------------------------------------------------------------------------------------------
if (import.meta.hot) {
  import.meta.hot.accept('./programRaymarch', (mod) => {
    if (mod == null) { return; }
    programRaymarchHot = mod.programRaymarch;
  });
}
