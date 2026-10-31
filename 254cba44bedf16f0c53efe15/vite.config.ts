import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    lib: { entry: 'src/main.ts', formats: ['es'], fileName: 'assets/app', cssFileName: 'assets/app' },
    emptyOutDir: true,
  },
  test: { include: ['tests/unit/**/*.test.ts', 'tests/sqlite/**/*.test.ts'] },
});
