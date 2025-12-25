import uiHtml from './assets/ui.html?html';

document.body.innerHTML = uiHtml;

/**
 * The button to start the experience.
 */
export const button = document.querySelector('button') as HTMLButtonElement;

/**
 * The main canvas element.
 */
export const canvas = document.querySelector('canvas') as HTMLCanvasElement;
