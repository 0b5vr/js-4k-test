import { Plugin } from 'vite';

/**
 * Trims the trailing newline Rollup puts at the end of each chunk.
 */
export const trimChunkPlugin: () => Plugin = () => ({
  name: 'trim-chunk',
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === 'chunk') {
        chunk.code = chunk.code.trimEnd();
      }
    }
  },
});
