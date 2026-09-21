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
export const START_DELAY = import.meta.env.DEV ? 0 : 5;

/**
 * The sample rate the music is generated at.
 * This is a constant value regardless of the playback environment's sample rate.
 *
 * The generated {@link AudioBuffer} is created with this sample rate,
 * and the browser will automatically resample it to match the {@link AudioContext}'s sample rate on playback.
 */
export const MUSIC_SAMPLE_RATE = 48000;

/**
 * Specify the square root of size of music buffer.
 *
 * `MUSIC_BUFFER_SIZE_SQRT * MUSIC_BUFFER_SIZE_SQRT / MUSIC_SAMPLE_RATE` will be the length in seconds you have in your music.
 *
 * - `1024` == 1048576 samples == 21.845 sec in 48000Hz
 * - `2048` == 4194304 samples == 87.381 sec in 48000Hz
 * - `4096` == 16777216 samples == 349.525 sec in 48000Hz
 */
export const MUSIC_BUFFER_SIZE_SQRT = 4096;

// == dev stuff ====================================================================================

/**
 * Whether to log shader compilation errors to the console.
 *
 * This obviously increases the size of the final build.
 */
export const LOG_SHADER_ERRORS = import.meta.env.DEV;

/**
 * Whether to enable seeking in dev mode.
 *
 * This obviously increases the size of the final build.
 */
export const ENABLE_SEEKING = import.meta.env.DEV;

/**
 * Whether to enter fullscreen mode when the user clicks the start button.
 *
 * Fullscreen mode has much smaller footprint compared to the windowed one,
 * so it's recommended to set this to `true` in the prod build.
 */
export const FULLSCREEN = !import.meta.env.DEV;

/**
 * Whether to export the generated music as a WAV file.
 *
 * This obviously increases the size of the final build.
 */
export const EXPORT_WAV = false;

// == the despair zone =============================================================================

/**
 * Stop rendering before the time reaches `0`.
 *
 * You can save several bytes if you set this to `false`,
 * but the `render()` function will be called even before the demo starts, which probably causes error messages in the console.
 */
export const STOP_RENDERING_BEFORE_START = true;

/**
 * Stop rendering after the time exceeds {@link INTRO_LENGTH}.
 *
 * You can save several bytes if you set this to `false`,
 * but the GPU is going to continue running even after the demo ends.
 */
export const STOP_RENDERING_AFTER_END = true;
