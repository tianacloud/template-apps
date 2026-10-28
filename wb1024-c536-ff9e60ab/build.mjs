import {readFile,mkdir,writeFile,cp} from 'node:fs/promises';
const html=await readFile('index.html','utf8');
const body=html.split('<body class="theme-gallery" data-realm="echo" data-appearance="classic">')[1].split('<script src="./script.js"></script>')[0];
const js=await readFile('script.js','utf8');
await mkdir('dist/assets',{recursive:true});
const bootstrap=`document.body.className="theme-gallery"; document.body.dataset.realm="echo"; document.body.dataset.appearance="classic"; document.getElementById("app").innerHTML=${JSON.stringify(body)}; const css=document.createElement("link"); css.rel="stylesheet";css.href=new URL("styles.css",import.meta.url);document.head.appendChild(css);\n`;
await writeFile('dist/assets/app.js',bootstrap+js.replaceAll('"./assets/works_v2/','new URL("works_v2/').replace(/new URL\("(works_v2\/[^"]+)"/g,'new URL("$1",import.meta.url).href'));
await cp('styles.css','dist/assets/styles.css'); await cp('assets/works_v2','dist/assets/works_v2',{recursive:true});await cp('public/icon.png','dist/icon.png');
const source=JSON.parse(await readFile('source.json','utf8')); console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:source.git_instance_id}));
