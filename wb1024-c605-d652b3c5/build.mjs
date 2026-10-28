import {cp, mkdir, rm, writeFile, readFile, readdir} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('public','dist/assets',{recursive:true});
for (const name of await readdir('public')) {
  if (!name.endsWith('.html')) continue;
  const html=await readFile(`public/${name}`,'utf8');
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw Error(`Missing script in ${name}`);
  const script=`${name}.js`;
  await writeFile(`dist/assets/${script}`,match[1]);
  await writeFile(`dist/assets/${name}`,html.replace(match[0],`<script src="${script}"></script>`));
}
await cp('public/icon.png','dist/icon.png');
await writeFile('dist/assets/app.js',`location.replace(new URL('./index.html',import.meta.url).href);`);
const source=JSON.parse(await readFile('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
