import { defineConfig } from 'vite';
export default defineConfig({build:{lib:{entry:'app.js',formats:['es'],fileName:()=> 'assets/app.js'}}});
