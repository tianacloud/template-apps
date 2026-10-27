import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw Error('Provide full source commit');
await mkdir('dist',{recursive:true});
const body=await readFile('src/body.html','utf8'),css=await readFile('src/styles.css','utf8');
const scripts=await Promise.all(['rules','samples','app'].map(x=>readFile(`src/${x}.js`,'utf8')));
await writeFile('dist/app.js',`document.title='车辆年检到期提醒工具';document.head.insertAdjacentHTML('beforeend',${JSON.stringify('<style>'+css+'</style>')});document.querySelector('#app').innerHTML=${JSON.stringify(body)};\n`+scripts.join('\n'));
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'app.js',...JSON.parse(await readFile('source.json','utf8')),source_commit:commit}));
