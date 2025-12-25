import { lazyQuadProgram } from './lazyQuadProgram';
import raymarchFrag from './assets/raymarch.frag?shader';

/**
 * A WebGLProgram that renders the main scene.
 */
export const programRaymarch = lazyQuadProgram( raymarchFrag );
