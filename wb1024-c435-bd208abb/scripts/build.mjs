import {build} from 'vite';
import {readFile} from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
await build({configFile:false,build:{lib:{entry:'src/main.js',formats:['es'],fileName:'assets/app',cssFileName:'assets/app'},emptyOutDir:true}});
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
