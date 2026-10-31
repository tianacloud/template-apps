import {build} from 'vite';
import {readFile} from 'node:fs/promises';
const source=JSON.parse(await readFile('source.json','utf8'));
await build();
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id}));
