import { defineConfig } from 'vite';
export default defineConfig({base:'./',define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{emptyOutDir:true,lib:{entry:'src/main.js',formats:['es'],fileName:()=> 'assets/app.js',cssFileName:'app'},rollupOptions:{output:{assetFileNames:'assets/[name][extname]'}}}});
