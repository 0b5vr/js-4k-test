import { HEIGHT, WIDTH } from './constants';
import { button, canvas } from './ui';
import { render } from './render';
import { audio } from './audio';
import { FULLSCREEN } from './config';

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
  if (FULLSCREEN) {
    canvas.requestFullscreen();
  } else {
    canvas.style = 'position:fixed;inset:0;width:100%;height:100%;object-fit:contain;background:#000';
    document.body.appendChild(canvas);
  }

  audio.resume();
  update();
};
