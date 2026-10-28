import {mkdir,copyFile,readFile} from "node:fs/promises";
const commit=process.argv[2]; if(!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit||"")) throw Error("完整提交必需");
await mkdir("dist",{recursive:true}); for(const f of ["app.js","app.css"]) await copyFile("src/"+f,"dist/"+f); for(const f of ["icon.png","globe-3d.zip"]) await copyFile("public/"+f,"dist/"+f); const source=JSON.parse(await readFile("source.json")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"app.js",...source}));
