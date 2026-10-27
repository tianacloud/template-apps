import { defineConfig } from 'vite';
export default defineConfig({define: {'process.env.NODE_ENV': JSON.stringify('production')},build:{target:'esnext',lib:{entry:'src/main.js',formats:['es'],fileName:'assets/app',cssFileName:'assets/app'},emptyOutDir:true}});
