import {mkdirSync,copyFileSync,readFileSync} from "node:fs";
mkdirSync("dist/assets",{recursive:true}); copyFileSync("app.js","dist/assets/app.js"); copyFileSync("icon.png","dist/icon.png"); const source=JSON.parse(readFileSync("source.json")); console.log("TIANA_PROJECT_PARAMS "+JSON.stringify({entry:"assets/app.js",git_instance_id:source.git_instance_id}));
