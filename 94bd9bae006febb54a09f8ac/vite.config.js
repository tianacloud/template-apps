import {defineConfig} from 'vite';
export default defineConfig({build:{outDir:'dist',emptyOutDir:true,lib:{entry:'src/main.js',formats:['es'],fileName:()=> 'assets/app.js',cssFileName:'app'},rollupOptions:{output:{inlineDynamicImports:true,assetFileNames:'assets/[name][extname]'}}}});
