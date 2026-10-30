import {defineConfig} from 'vite';
export default defineConfig({build:{emptyOutDir:true, target:'esnext', rollupOptions:{input:'src/entry.js', output:{entryFileNames:'assets/app.js', inlineDynamicImports:true}}}});
