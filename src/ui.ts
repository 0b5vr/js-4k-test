import uiHtml from './assets/ui.html?html';

document.body.innerHTML = uiHtml;

export const [button, canvas] = document.body.childNodes as unknown as [HTMLParagraphElement, HTMLCanvasElement];
