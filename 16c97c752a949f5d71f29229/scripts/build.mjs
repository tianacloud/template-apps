import { build } from 'vite';
import { readFile, stat } from 'node:fs/promises';
const commit = process.argv[2];
if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(commit || '')) throw Error('需要完整源码提交号');
const source = JSON.parse(await readFile('source.json', 'utf8'));
if (process.env.TIANA_TEMPLATE_BUILD !== '1' && (!source.git_instance_id || source.git_instance_id.startsWith('__TIANA_'))) throw Error('请先填写 Git 实例 ID');
await build();
await stat('dist/assets/app.js'); await stat('dist/icon.png');
console.log('TIANA_PROJECT_PARAMS ' + JSON.stringify({entry:'assets/app.js',...source,source_commit:commit}));
