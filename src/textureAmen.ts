import { GL_FLOAT, GL_LINEAR, GL_R32F, GL_RED, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER } from './gl-constants';
import { gl } from './gl';
import amenOpus from './assets/amen.opus?inline';
import { audio } from './audio';

// -- texture --------------------------------------------------------------------------------------
const width = 4096;
const height = 4;

/**
 * The 2D texture containing the sample of amen breaks.
 */
export const textureAmen = gl.createTexture()!;

gl.bindTexture(GL_TEXTURE_2D, textureAmen);

// -- load sample ----------------------------------------------------------------------------------
const res = await fetch(amenOpus);
const arrayBuffer = await res.arrayBuffer();
const audioBuffer = await audio.decodeAudioData(arrayBuffer);

// -- convert to texture ---------------------------------------------------------------------------
const channelData = audioBuffer.getChannelData(0); // mono
const array = new Float32Array(width * height);
array.set(channelData);

gl.texImage2D(
  GL_TEXTURE_2D, // target
  0, // level
  GL_R32F, // internalformat
  width,
  height,
  0, // border
  GL_RED, // format
  GL_FLOAT, // type
  array, // pixels
);

gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

// -- export the texture? --------------------------------------------------------------------------
// if (import.meta.env.DEV) {
//   function toCanvas(array: Float32Array, width: number, height: number): HTMLCanvasElement {
//     const canvas = document.createElement('canvas');
//     canvas.width = width;
//     canvas.height = height;
//     const ctx = canvas.getContext('2d')!;

//     const imageData = ctx.createImageData(width, height);
//     for (let i = 0; i < width * height; i++) {
//       const v = (array[i] * 0.5 + 0.5) * 255;
//       imageData.data[i * 4 + 0] = v;
//       imageData.data[i * 4 + 1] = v;
//       imageData.data[i * 4 + 2] = v;
//       imageData.data[i * 4 + 3] = 255;
//     }
//     ctx.putImageData(imageData, 0, 0);

//     return canvas;
//   }

//   const canvas = toCanvas(array, width, height);
//   document.body.appendChild(canvas);
// }
