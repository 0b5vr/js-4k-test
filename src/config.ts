/**
 * Specify the length of the intro.
 *
 * The intro stops using GPU after the time exceeds this value.
 * If you don't like this behavior, you can set {@link STOP_RENDERING_AFTER_END} to `false`.
 */
export const INTRO_LENGTH = 60;

// == the despair zone =============================================================================

/**
 * Stop rendering after the time exceeds {@link INTRO_LENGTH}.
 *
 * You can save several bytes if you set this to `false`,
 * but the GPU is going to continue running even after the demo ends.
 */
export const STOP_RENDERING_AFTER_END = true;
