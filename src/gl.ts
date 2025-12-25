import { canvas } from './ui';

/**
 * The main WebGL2 rendering context.
 */
export const gl = canvas.getContext('webgl2')!;

gl.getExtension('EXT_color_buffer_float');
gl.getExtension('OES_texture_float_linear');
