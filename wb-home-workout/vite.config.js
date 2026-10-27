import {defineConfig} from 'vite';
export default defineConfig({build:{lib:{entry:'src/main.js',formats:['es'],fileName:()=> 'assets/app.js'},outDir:'dist',emptyOutDir:true}});
