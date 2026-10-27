import {readFileSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
rmSync('dist',{recursive:true,force:true}); mkdirSync('dist/assets',{recursive:true});
const body=read('src/body.html'), css=read('src/assets/css/style.css');
const scripts=['icons','data-veg-fruit','data-animal','data-special','app'].map(n=>read(`src/assets/js/${n}.js`)).join('\n;\n');
writeFileSync('dist/assets/app.js',`document.head.insertAdjacentHTML('beforeend',${JSON.stringify('<style>'+css+'</style>')});document.getElementById('app').innerHTML=${JSON.stringify(body)};\n${scripts}`);
cpSync('public/icon.png','dist/icon.png');
const config=JSON.parse(read('source.json')); console.log('TIANA_PROJECT_PARAMS='+JSON.stringify({entry:'assets/app.js',git_instance_id:config.git_instance_id}));
