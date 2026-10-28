import {mkdir,copyFile,readFile} from "node:fs/promises";
await mkdir("dist/assets",{recursive:true});
for(const [a,b] of [["src/main.js","dist/assets/app.js"],["src/style.css","dist/assets/app.css"],["src/quiz.js","dist/assets/quiz.js"],["public/icon.png","dist/icon.png"]]) await copyFile(a,b);
const s=JSON.parse(await readFile("source.json","utf8")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:s.git_instance_id}));
