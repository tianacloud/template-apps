import {build} from 'esbuild';import {writeFile,mkdir,readFile} from 'node:fs/promises';
await mkdir('.preview',{recursive:true});
const licenseBanner='/*!\n'+(await readFile('THIRD_PARTY_NOTICES.txt','utf8')).replaceAll('*/','* /')+'\n*/';
const out=await build({entryPoints:['src/main.js'],bundle:true,format:'iife',write:false,minify:true,target:'es2022',loader:{'.css':'text'},define:{__SHOWCASE__:'true','process.env.NODE_ENV':'"production"'},legalComments:'none',banner:{js:licenseBanner}});
const meta=JSON.parse(await readFile('metadata.json','utf8'));const js=out.outputFiles[0].text.replaceAll('</script','<\\/script');
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+meta.display_name+'</title></head><body><div id="app"></div><script>'+js+'</script></body></html>';
if(Buffer.byteLength(html)>500000)throw Error('预览超过500000字节');await writeFile('showcase/preview.html',html);
await writeFile('.preview/index.html','<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#eee}iframe{border:0;width:100%;height:100vh}</style><iframe sandbox="allow-scripts" src="../showcase/preview.html"></iframe></html>');console.log(JSON.stringify({previewBytes:Buffer.byteLength(html)}));
