import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/assets',{recursive:true}); copyFileSync('src/app.js','dist/assets/app.js'); copyFileSync('public/icon.png','dist/icon.png'); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js'}));
