import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    lib: { entry: 'src/main.js', formats: ['es'], fileName: 'assets/app', cssFileName: 'assets/app' },
    emptyOutDir: true,
  },
});
