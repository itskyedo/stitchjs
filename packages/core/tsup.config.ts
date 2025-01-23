import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    external: [],
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    shims: true,
    minify: !options.watch,
  };
});
