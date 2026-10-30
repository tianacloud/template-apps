import { build } from 'vite';
import { readFile, stat } from 'node:fs/promises';
const commit=process.argv[2];
if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||'')) throw new Error('需要完整源码提交号');
const source=JSON.parse(await readFile('source.json','utf8'));
if (!process.env.TIANA_TEMPLATE_BUILD && (!/^[A-Za-z0-9_-]{1,128}$/.test(source.git_instance_id)||source.git_instance_id.startsWith('__'))) throw new Error('请先配置实例 ID');
await build(); await stat('dist/assets/app.js'); await stat('dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',database_instance_id:source.database_instance_id,git_instance_id:source.git_instance_id,source_commit:commit}));
