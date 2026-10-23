import {build} from 'vite';
import {readFile,writeFile,rm} from 'node:fs/promises';
await build({mode:'showcase',build:{outDir:'.showcase-build'}});
const script=(await readFile('.showcase-build/assets/app.js','utf8')).replaceAll('</script','<\/script');
const html='<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>示例体验</title><div id="app"></div><script type="module">'+script+'</script></html>';
if(Buffer.byteLength(html)>500000)throw Error('预览超过500KB');
await writeFile('showcase/preview.html',html);await rm('.showcase-build',{recursive:true,force:true});
