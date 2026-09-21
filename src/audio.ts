import { ENABLE_SEEKING } from './config';

/**
 * The main audio context.
 */
export const audio = new AudioContext();
audio.suspend();

// -- controls -------------------------------------------------------------------------------------
// Enable play / pause with the spacebar when `ENABLE_SEEKING` is `true`
if (ENABLE_SEEKING) {
  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();

      // simply suspend / resume the audio context and call it play / pause for now
      if (audio.state === 'running') {
        audio.suspend();
      } else {
        audio.resume();
      }
    }
  });
}
