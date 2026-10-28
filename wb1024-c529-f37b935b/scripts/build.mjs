import {execFileSync} from 'node:child_process';
import {readFileSync,copyFileSync} from 'node:fs';
execFileSync('npx',['vite','build'],{stdio:'inherit'});
copyFileSync('public/icon.png','dist/icon.png');
const p=JSON.parse(readFileSync('source.json','utf8'));
console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',...p}));
