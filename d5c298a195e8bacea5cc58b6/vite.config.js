import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

// `showcase` mode swaps the SQLite repository for in-memory sample data.
export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: mode === 'showcase'
    ? { alias: { './data/repository.js': fileURLToPath(new URL('./src/data/memory.js', import.meta.url)) } }
    : {},
  build: {
    lib: { entry: mode === 'showcase' ? 'src/showcase.js' : 'src/main.js', formats: ['es'], fileName: 'assets/app', cssFileName: 'assets/app' },
    outDir: mode === 'showcase' ? 'dist-showcase' : 'dist',
    emptyOutDir: true,
  },
}));
