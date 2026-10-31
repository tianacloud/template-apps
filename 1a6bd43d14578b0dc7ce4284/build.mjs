import {readFile, readdir, mkdir, rm, copyFile} from 'node:fs/promises';
import {build} from 'esbuild';
const cfg=JSON.parse(await readFile('source.json','utf8'));
if(!process.env.TIANA_TEMPLATE_BUILD && Object.values(cfg).some(v=>v.startsWith('__TIANA_'))) throw Error('请填写实例 ID');
const images={};
for(const file of await readdir('public/images')) {
  const bytes=await readFile('public/images/'+file);
  if(bytes.length>16384) throw Error('图片超过内嵌上限: '+file);
  images[file]='data:image/webp;base64,'+bytes.toString('base64');
}
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/entry.js'],outfile:'dist/assets/app.js',bundle:true,format:'esm',loader:{'.html':'text','.css':'text'},plugins:[{name:'inline-images',setup(b){b.onResolve({filter:/^inline-images$/},()=>({path:'images',namespace:'inline-images'}));b.onLoad({filter:/.*/,namespace:'inline-images'},()=>({contents:'export default '+JSON.stringify(images),loader:'js'}));}}]});
await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...cfg}));
