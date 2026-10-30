import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const demo=process.env.XINYU_SHOWCASE==='1';
export default defineConfig({define:{__XINYU_DEMO__:JSON.stringify(demo)},plugins:demo?[{name:'demo-storage',enforce:'pre',resolveId(id,importer){if(id==='./storage.js' && importer?.endsWith('/api.js')) return resolve('src/demo-storage.js');}}]:[],build:{target:'esnext',rollupOptions:demo?{output:{inlineDynamicImports:true}}:{},lib:{entry:demo?'src/demo-main.js':'src/main.js',formats:['es'],fileName:'assets/app'},outDir:demo?process.env.XINYU_SHOWCASE_OUT:'dist',emptyOutDir:true}});
