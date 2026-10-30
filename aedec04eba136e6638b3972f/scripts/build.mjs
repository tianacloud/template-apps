import { build } from 'vite';
import { readFile, stat } from 'node:fs/promises';
const commit = process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit ?? '')) throw new Error('A full source commit is required');
const source=JSON.parse(await readFile('source.json','utf8'));
if (process.env.TIANA_TEMPLATE_BUILD !== '1') for (const key of ['database_instance_id','git_instance_id']) if (!/^[A-Za-z0-9_-]{1,128}$/.test(source[key]??'') || source[key].startsWith('__TIANA_')) throw new Error('Bind verified resources in source.json');
await build(); await stat('dist/assets/app.js');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
