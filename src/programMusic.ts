import { lazyQuadProgram } from './lazyQuadProgram';
import musicFrag from './assets/music.frag?shader';

/**
 * A WebGLProgram that renders the music.
 */
export const programMusic = lazyQuadProgram(musicFrag);
