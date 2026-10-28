import {cpSync,mkdirSync,rmSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist',{recursive:true}); cpSync('public','dist',{recursive:true});
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:'__TIANA_GIT_INSTANCE_ID_437bf2af__'}));
