import {defineConfig} from "vite";
export default defineConfig({build:{target:"esnext",lib:{entry:"src/main.js",formats:["es"],fileName:()=>"assets/app.js",cssFileName:"assets/app"},outDir:"dist",emptyOutDir:true}});
