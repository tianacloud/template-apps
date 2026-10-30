import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import * as rules from '../src/rules.js';
const seed=[rules.sampleWorkspace()];
await mkdir('.browser-fixture',{recursive:true});
const adapter=`export class Repository {
 async list(){return structuredClone(window.__fixture.data);}
 async get(id){const f=window.__fixture;f.readRequests.push(id);if(f.holdReads)await new Promise(r=>f.readWaiters.push(r));if(f.readError)throw Error(f.readError);return structuredClone(f.data.find(x=>x.id===id)||null);}
 async save(doc){const f=window.__fixture,snapshot=structuredClone(doc);f.saveRequests.push(snapshot);f.activeSaves++;f.maxConcurrentSaves=Math.max(f.maxConcurrentSaves,f.activeSaves);try{if(f.holdSaves)await new Promise(r=>f.saveWaiters.push(r));if(f.saveError)throw Error(f.saveError);const current=f.data.find(x=>x.id===doc.id);if(current&&current.revision!==(snapshot.revision||0)||!current&&(snapshot.revision||0)!==0){const error=Error('其他标签页已更新');error.code='CAS_CONFLICT';throw error;}const next={...snapshot,revision:(snapshot.revision||0)+1,updatedAt:new Date().toISOString()};f.data=[next,...f.data.filter(x=>x.id!==next.id)];if(f.saveErrorAfterWrite)throw Error(f.saveErrorAfterWrite);return structuredClone(next);}finally{f.activeSaves--;}}
 async remove(doc){const f=window.__fixture;f.data=f.data.filter(x=>x.id!==doc.id);}
}`;
await build({entryPoints:['src/main.js'],bundle:true,format:'esm',outfile:'.browser-fixture/app.js',loader:{'.css':'text'},define:{__SHOWCASE__:'false'},plugins:[{name:'synthetic-repository',setup(b){b.onResolve({filter:/^\.\/db\.js$/},()=>({path:'db',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:adapter}));}}]});
const setup=`window.__fixture={data:${JSON.stringify(seed)},holdReads:false,holdSaves:false,saveError:'',readError:'',saveErrorAfterWrite:'',readRequests:[],saveRequests:[],readWaiters:[],saveWaiters:[],activeSaves:0,maxConcurrentSaves:0,releaseReads(){this.holdReads=false;this.readWaiters.splice(0).forEach(r=>r());},releaseSaves(){this.holdSaves=false;this.saveWaiters.splice(0).forEach(r=>r());}};`;
await writeFile('.browser-fixture/index.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script>'+setup+'</script><div id="app"></div><script type="module" src="./app.js"></script></html>');
console.log('Synthetic in-memory repository fixture only; not cloud validation.');
