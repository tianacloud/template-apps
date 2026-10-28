import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist',{recursive:true});
await copyFile('index.html','dist/index.html'); await copyFile('public/icon.png','dist/icon.png');
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'index.html'}));
