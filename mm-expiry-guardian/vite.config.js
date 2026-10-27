import {defineConfig} from 'vite';
export default defineConfig({build:{lib:{entry:'src/main.js',formats:['es'],fileName:'assets/app',cssFileName:'assets/app'},outDir:'dist',emptyOutDir:true}});
