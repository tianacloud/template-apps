import fs from 'node:fs'; const s=JSON.parse(fs.readFileSync('source.json')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:s.git_instance_id}));
