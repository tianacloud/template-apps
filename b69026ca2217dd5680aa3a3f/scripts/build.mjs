import {build} from 'vite'; import {readFile,stat} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit??'')) throw new Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8')); if(process.env.TIANA_TEMPLATE_BUILD!=='1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw new Error('请绑定 Git');
await build(); await stat('dist/assets/app.js'); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
