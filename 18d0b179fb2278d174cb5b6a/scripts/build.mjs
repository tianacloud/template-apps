import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
const commit=process.argv[2]; if(!/^[a-f0-9]{40,64}$/.test(commit||'')) throw Error('完整提交号必需');
const source=JSON.parse(await readFile('source.json','utf8'));
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
const html=await readFile('index.html','utf8'); const body=html.split('<body>')[1].split('<script src=')[0]; const inline=html.split('<script>')[1].split('</script>')[0];
const data=await readFile('assets/data.js','utf8'); const app=await readFile('assets/app.js','utf8');
await writeFile('dist/assets/app.js',`const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./style.css',import.meta.url);document.head.appendChild(style);document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${data}\n${app}\n${inline}`);
await cp('assets/style.css','dist/assets/style.css'); await cp('icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
