import {defineConfig} from 'vite';
export default defineConfig({publicDir:false,build:{target:'esnext',lib:{entry:'src/main.js',formats:['es'],fileName:()=> 'assets/app.js',cssFileName:'assets/app'},emptyOutDir:true}});
