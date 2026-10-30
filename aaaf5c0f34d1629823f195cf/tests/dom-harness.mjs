import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {parseHTML} from 'linkedom';
export const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
export const settle=()=>new Promise(r=>setImmediate(r));
export async function mount(repository,exportsCode,hash=''){
 const base=fileURLToPath(new URL('../',import.meta.url)),source=await readFile(base+'src/main.js','utf8');
 const result=await build({stdin:{contents:source+'\n'+exportsCode,resolveDir:base+'src',sourcefile:base+'src/main.js'},write:false,bundle:true,format:'iife',globalName:'TestApp',loader:{'.css':'text'},define:{__SHOWCASE__:'true'},plugins:[{name:'test-adapters',setup(b){b.onResolve({filter:/\/demo\.js$|^\.\/demo\.js$/},()=>({path:'repository',namespace:'test'}));b.onResolve({filter:/stage(-lite)?\.js$/},()=>({path:'stage',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},a=>({contents:a.path==='repository'?'export class MemoryRepository {constructor(){return globalThis.__repo}}':'export const createLiteStage=()=>({set(){},frame(){},camera(){}});export const createStage=createLiteStage;',loader:'js'}));}}]});
 const {document,window}=parseHTML('<html><head></head><body><div id="app"></div></body></html>');
 Object.defineProperty(window.HTMLSelectElement.prototype,'value',{configurable:true,get(){return [...this.options].find(o=>o.selected)?.value||'';},set(v){for(const o of this.options)o.selected=o.value===String(v);}});
 const location={hash},context=vm.createContext({document,location,window:{addEventListener(){},scrollTo(){}},crypto:webcrypto,structuredClone,console,setTimeout,clearTimeout,setInterval,clearInterval,performance,requestAnimationFrame(){},__repo:repository});
 vm.runInContext(result.outputFiles[0].text,context);await settle();
 return {app:context.TestApp,document,location,click(selector){document.querySelector(selector).dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));},input(selector,value){const el=document.querySelector(selector);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));}};
}
