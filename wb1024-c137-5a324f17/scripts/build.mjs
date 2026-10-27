import {readFile,mkdir,writeFile,copyFile,rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[0-9a-f]{40}$/.test(commit||'')) throw Error('需要完整提交号');
const source=JSON.parse(await readFile('source.json','utf8')); if(!process.env.TIANA_TEMPLATE_BUILD && source.git_instance_id.startsWith('__TIANA_')) throw Error('请填写 Git 实例');
const icon='data:image/png;base64,'+(await readFile('public/icon.png')).toString('base64'); const html=(await readFile('src/body.html','utf8')).replace('__ICON__',icon); const css=await readFile('src/style.css','utf8');
const scripts=await Promise.all(['store.js','engine.js','app.js'].map(p=>readFile('src/'+p,'utf8')));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true}); await copyFile('public/icon.png','dist/icon.png');
await writeFile('dist/assets/app.js',`document.head.insertAdjacentHTML('beforeend', ${JSON.stringify('<style>'+css+'</style>')}); document.getElementById('app').innerHTML=${JSON.stringify(html)};\n`+scripts.join('\n'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...source}));
