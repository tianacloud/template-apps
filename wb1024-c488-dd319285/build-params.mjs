import fs from 'node:fs'; const s=JSON.parse(fs.readFileSync('source.json')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({...s,entry:'assets/app.js'}));
