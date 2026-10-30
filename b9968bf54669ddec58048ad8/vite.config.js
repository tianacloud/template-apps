import {defineConfig} from 'vite';
import {runtimeNotices} from './scripts/runtime-notices.mjs';
export default defineConfig(({mode})=>({plugins:[runtimeNotices(mode)],define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{lib:{entry:mode==='showcase'?'src/showcase-entry.js':'src/entry.js',formats:['es'],fileName:()=> 'assets/app.js'},outDir:'dist',emptyOutDir:true}}));
