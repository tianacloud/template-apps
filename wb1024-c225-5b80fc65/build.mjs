import fs from 'node:fs/promises';
await fs.rm('dist',{recursive:true,force:true}); await fs.mkdir('dist/assets',{recursive:true});
const [body,css,logic,params] = await Promise.all(['src/body.html','src/style.css','src/logic.js','source.json'].map(p=>fs.readFile(p,'utf8')));
const prefix = `const assetBase = new URL('../images/', import.meta.url).href;\nconst style = document.createElement('style'); style.textContent = ${JSON.stringify(css)}; document.head.appendChild(style);\ndocument.title = '五千年，等你来挖 · 七年级历史寻宝记';\ndocument.body.innerHTML = ${JSON.stringify(body)}.replaceAll('__ASSET_BASE__', assetBase);\n`;
await fs.writeFile('dist/assets/app.js',prefix+logic.replace(/"__ASSET_BASE__([^" ]+)"/g, (_, file) => `new URL(${JSON.stringify(file)}, assetBase).href`));
await fs.cp('public/images','dist/images',{recursive:true}); await fs.copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',...JSON.parse(params)}));
