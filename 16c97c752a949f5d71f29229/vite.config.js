import { defineConfig } from 'vite';
export default defineConfig({build:{emptyOutDir:true,rollupOptions:{input:'src/main.js',output:{entryFileNames:'assets/app.js',assetFileNames:'assets/[name][extname]'}}}});
