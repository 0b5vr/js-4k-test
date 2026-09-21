import { GL_COLOR_ATTACHMENT0, GL_FLOAT, GL_FRAMEBUFFER, GL_RG, GL_RG32F, GL_TEXTURE0, GL_TEXTURE1, GL_TEXTURE_2D, GL_TRIANGLES } from './gl-constants';
import { ENABLE_SEEKING, EXPORT_WAV, INTRO_LENGTH, MUSIC_BUFFER_SIZE_SQRT, MUSIC_SAMPLE_RATE, START_DELAY } from './config';
import { audio } from './audio';
import { exportWav } from './utils/exportWav';
import { textureFbm } from './textureFbm';
import { gl } from './gl';
import { programMusic } from './programMusic';
import { promiseTextureAmen } from './promiseTextureAmen';

// -- texture --------------------------------------------------------------------------------------
const texture = gl.createTexture()!;

gl.bindTexture(GL_TEXTURE_2D, texture);
gl.texStorage2D(GL_TEXTURE_2D, 1, GL_RG32F, MUSIC_BUFFER_SIZE_SQRT, MUSIC_BUFFER_SIZE_SQRT);

// -- framebuffer ----------------------------------------------------------------------------------
const framebuffer = gl.createFramebuffer()!;

gl.bindFramebuffer(GL_FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(
  GL_FRAMEBUFFER,
  GL_COLOR_ATTACHMENT0,
  GL_TEXTURE_2D,
  texture,
  0,
);

// -- audio ----------------------------------------------------------------------------------------
const buffer = audio.createBuffer(
  2,
  MUSIC_BUFFER_SIZE_SQRT * MUSIC_BUFFER_SIZE_SQRT,
  MUSIC_SAMPLE_RATE,
);
const channels = [
  buffer.getChannelData(0),
  buffer.getChannelData(1),
];
const pixels = new Float32Array(2 * MUSIC_BUFFER_SIZE_SQRT * MUSIC_BUFFER_SIZE_SQRT);

let bufferSource = audio.createBufferSource();
bufferSource.buffer = buffer;
bufferSource.connect(audio.destination);

// -- render ---------------------------------------------------------------------------------------
// the amen sample is loaded asynchronously, so we have to wait for it before rendering the music
promiseTextureAmen.then((textureAmen) => {
  // -- program ----------------------------------------------------------------------------------
  gl.useProgram(programMusic);

  // -- uniforms ---------------------------------------------------------------------------------
  gl.activeTexture(GL_TEXTURE0);
  gl.bindTexture(GL_TEXTURE_2D, textureFbm);

  gl.activeTexture(GL_TEXTURE1);
  gl.bindTexture(GL_TEXTURE_2D, textureAmen);

  gl.uniform1i(
    gl.getUniformLocation(programMusic, 'A'),
    1,
  );

  // -- render -----------------------------------------------------------------------------------
  gl.bindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, MUSIC_BUFFER_SIZE_SQRT, MUSIC_BUFFER_SIZE_SQRT);
  gl.drawArrays(GL_TRIANGLES, 0, 3);

  // -- read pixels ------------------------------------------------------------------------------
  gl.readPixels(0, 0, MUSIC_BUFFER_SIZE_SQRT, MUSIC_BUFFER_SIZE_SQRT, GL_RG, GL_FLOAT, pixels);

  // -- audio ------------------------------------------------------------------------------------
  pixels.map((v, i) => (
    channels[i % 2][~~(i / 2)] = v
  ));

  if (EXPORT_WAV) {
    exportWav(channels, MUSIC_SAMPLE_RATE);
  }

  bufferSource.start(START_DELAY);
});

// -- controls -------------------------------------------------------------------------------------
/**
 * The {@link audio} realm time when the music begins playing.
 * This variable will be modified when we seek.
 *
 * The value of this variable is only meaningful when {@link ENABLE_SEEKING} is `true`.
 * Do not use this variable outside of the `ENABLE_SEEKING` block for the sake of tree-shaking.
 */
export let seekBeginTime = START_DELAY;

// Enable seeking with the arrow keys when `ENABLE_SEEKING` is `true`
if (ENABLE_SEEKING) {
  /**
   * Seek to the specified time.
   */
  const seekTo = (time: number): void => {
    bufferSource.stop();

    bufferSource = audio.createBufferSource();
    bufferSource.buffer = buffer;

    seekBeginTime = Math.min(audio.currentTime - time, audio.currentTime);
    const offset = audio.currentTime - seekBeginTime;
    bufferSource.connect(audio.destination);
    bufferSource.start(audio.currentTime, offset);
  };

  /**
   * Seek by the specified delta.
   */
  const seekBy = (delta: number): void => {
    seekTo(audio.currentTime - seekBeginTime + delta);
  };

  window.addEventListener('keydown', (event) => {
    let timeStep = 5.0;
    if (event.shiftKey) { timeStep = 60.0; }
    if (event.altKey) { timeStep = 1.0 / 60.0; }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      seekBy(-timeStep);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      seekBy(timeStep);
    } else if (event.key === 'Home') {
      event.preventDefault();
      seekTo(0.0);
    } else if (event.key === 'End') {
      event.preventDefault();
      seekTo(INTRO_LENGTH);
    }
  });
}

// -- hot ------------------------------------------------------------------------------------------
if (import.meta.hot) {
  import.meta.hot.accept('./programMusic', async (mod) => {
    if (mod == null) { return; }
    const { programMusic } = mod;
    const textureAmen = await promiseTextureAmen;

    // -- program ----------------------------------------------------------------------------------
    gl.useProgram(programMusic);

    // -- uniforms ---------------------------------------------------------------------------------
    gl.activeTexture(GL_TEXTURE0);
    gl.bindTexture(GL_TEXTURE_2D, textureFbm);

    gl.activeTexture(GL_TEXTURE1);
    gl.bindTexture(GL_TEXTURE_2D, textureAmen);

    gl.uniform1i(
      gl.getUniformLocation(programMusic, 'A'),
      1,
    );

    // -- render -----------------------------------------------------------------------------------
    gl.bindFramebuffer(GL_FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, MUSIC_BUFFER_SIZE_SQRT, MUSIC_BUFFER_SIZE_SQRT);
    gl.drawArrays(GL_TRIANGLES, 0, 3);

    // -- read pixels ------------------------------------------------------------------------------
    gl.readPixels(0, 0, MUSIC_BUFFER_SIZE_SQRT, MUSIC_BUFFER_SIZE_SQRT, GL_RG, GL_FLOAT, pixels);

    // -- audio ------------------------------------------------------------------------------------
    pixels.map((v, i) => (
      channels[i % 2][~~(i / 2)] = v
    ));

    bufferSource.stop();

    bufferSource = audio.createBufferSource();
    bufferSource.buffer = buffer;

    const offset = audio.currentTime - seekBeginTime;
    bufferSource.connect(audio.destination);
    bufferSource.start(audio.currentTime, offset);
  });
}
