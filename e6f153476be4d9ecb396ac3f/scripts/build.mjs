import {build} from 'vite';
import {readFile} from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
