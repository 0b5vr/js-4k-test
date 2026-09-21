import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { terserMinifyOptions } from './terserMinifyOptions';
import Inspect from 'vite-plugin-inspect';
import { shaderMinifierPlugin } from './plugins/vite-shader-minifier-plugin';
import { trimChunkPlugin } from './plugins/vite-trim-chunk-plugin';

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        ...(
          mode === 'prod'
            ? { 'webgl-memory': `${__dirname}/src/dummy.ts` } // don't want to import webgl-memory when it's prod build
            : {}
        ),
      },
    },
    build: {
      target: 'esnext',
      minify: mode === 'prod' ? 'terser' : false,
      terserOptions: mode === 'prod' ? terserMinifyOptions : undefined,
      sourcemap: 'hidden', // emit the map, but without the `sourceMappingURL` comment
      polyfillModulePreload: false, // size
      rollupOptions: {
        plugins: [
          visualizer({
            json: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ],
      },
    },
    plugins: [
      Inspect(),
      shaderMinifierPlugin({
        minify: true, // mode === 'prod',
        batch: true,
        batchShuffleSeed: 0,
        minifierOptions: {
          preserveExternals: true,
          aggressiveInlining: true,
          noSequence: true,
        },
      }),
      trimChunkPlugin(),
    ],
  };
});
