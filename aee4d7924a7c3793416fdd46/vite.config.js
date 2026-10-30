import {defineConfig} from 'vite'; export default defineConfig({build:{lib:{entry:'main.js',formats:['es'],fileName:'assets/app',cssFileName:'assets/app'},outDir:'dist'}});
