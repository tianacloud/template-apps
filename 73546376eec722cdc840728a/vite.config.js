import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{outDir:'dist',emptyOutDir:true,lib:{entry:'src/app.js',formats:['es'],fileName:()=> 'assets/app.js'},rollupOptions:{output:{assetFileNames:'assets/[name][extname]'}}}});
