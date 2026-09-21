document.body.innerHTML = '<p>click</p><canvas style=cursor:none;width:0>';

export const [button, canvas] = document.body.childNodes as unknown as [HTMLParagraphElement, HTMLCanvasElement];
