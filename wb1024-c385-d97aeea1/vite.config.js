import { defineConfig } from 'vite';
export default defineConfig({base:'./',define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{lib:{entry:'src/main.js',formats:['es'],fileName:()=> 'assets/app.js'},rollupOptions:{output:{assetFileNames:'assets/[name][extname]'}}}});
