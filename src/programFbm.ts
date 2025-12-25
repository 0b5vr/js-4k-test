import { lazyQuadProgram } from './lazyQuadProgram';
import fbmFrag from './assets/fbm.frag?shader';

/**
 * A WebGLProgram that renders the 3D fbm noise.
 */
export const programFbm = lazyQuadProgram( fbmFrag );
