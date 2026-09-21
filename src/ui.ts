import { HEIGHT, WIDTH } from './constants';

document.body.innerHTML = `<p>click</p><canvas width=${WIDTH} height=${HEIGHT} style=cursor:none;width:0>`;

export const [button, canvas] = document.body.childNodes as unknown as [HTMLParagraphElement, HTMLCanvasElement];
