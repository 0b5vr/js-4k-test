/**
 * Specify the length of the intro.
 *
 * The intro stops using GPU after the time exceeds this value.
 * If you don't like this behavior, you can set {@link STOP_RENDERING_AFTER_END} to `false`.
 */
export const INTRO_LENGTH = 60;

/**
 * Delays the start of the demo.
 *
 * Chrome shows the "Press Esc to exit full screen" dialog after you enter fullscreen for 5 sec,
 * so it's recommended to leave it to be `5`.
 */
export const START_DELAY = 5;

/**
 * Specify the square root of size of music buffer.
 *
 * `MUSIC_BUFFER_SIZE_SQRT * MUSIC_BUFFER_SIZE_SQRT / sampleRate` will be the length in seconds you have in your music.
 *
 * - `1024` == 1048576 samples == 21.845 sec in 48000Hz
 * - `2048` == 4194304 samples == 87.381 sec in 48000Hz
 * - `4096` == 16777216 samples == 349.525 sec in 48000Hz
 */
export const MUSIC_BUFFER_SIZE_SQRT = 4096;

// == the despair zone =============================================================================

/**
 * Stop rendering after the time exceeds {@link INTRO_LENGTH}.
 *
 * You can save several bytes if you set this to `false`,
 * but the GPU is going to continue running even after the demo ends.
 */
export const STOP_RENDERING_AFTER_END = true;
