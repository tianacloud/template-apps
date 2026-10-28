import {defineConfig} from 'vite';
export default defineConfig({build:{lib:{entry:'src/app.js',formats:['es'],fileName:()=> 'assets/app.js'},cssCodeSplit:false,rollupOptions:{output:{assetFileNames:'assets/[name][extname]'}}}});
