import { HEIGHT, WIDTH } from './constants';
import { button, canvas } from './ui';
import { render } from './render';
import { audio } from './audio';

canvas.width = WIDTH;
canvas.height = HEIGHT;

/**
 * The main update loop.
 */
function update(): void {
  requestAnimationFrame(update);
  render();
}

button.onclick = () => {
  canvas.requestFullscreen();
  audio.resume();
  update();
};
