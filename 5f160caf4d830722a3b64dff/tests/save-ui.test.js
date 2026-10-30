import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';

const bundle=await build({entryPoints:['src/main.js'],bundle:true,format:'iife',write:false,loader:{'.css':'text'},plugins:[{name:'actual-controller-test',setup(b){b.onResolve({filter:/\.\/db\.js$/},()=>({path:'sql',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const sql=(...args)=>window.testSql(...args)',loader:'js'}))}}]});
function fixture(insert,selectAll=null){
 const dom=new JSDOM('<!doctype html><div id="app"></div>',{url:'https://example.invalid/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,rows=new Map();let now=0,raf=null,writes=0,historyReads=0;const calls=[];
 w.scrollTo=()=>{};w.requestAnimationFrame=cb=>(raf=cb,1);w.cancelAnimationFrame=()=>{raf=null};Object.defineProperty(w.performance,'now',{value:()=>now});w.Math.random=()=>.5;
 w.testSql=async(q,args=[])=>{calls.push({q,args:[...args]});if(q.includes('app_preferences'))return [];if(q.startsWith('SELECT id FROM'))return rows.has(args[0])?[{id:args[0]}]:[];if(q.startsWith('SELECT'))return selectAll?selectAll({rows,count:++historyReads}):[...rows.values()].sort((a,b)=>b.score-a.score).slice(0,5);if(q.startsWith('INSERT')){writes++;return insert({args:[...args],rows,writes})}throw Error('Unexpected SQL in controller test')};
 w.eval(bundle.outputFiles[0].text);
 return {w,dom,rows,calls,get writes(){return writes},async flush(){for(let i=0;i<35;i++)await Promise.resolve()},click(selector){const e=w.document.querySelector(selector);assert.ok(e,selector);e.click()},key(key){w.document.dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}))},finish(){now=45001;assert.ok(raf);raf(now)},close(){dom.window.close()}};
}
function commit(rows,args){rows.set(args[0],{id:args[0],score:Number(args[1]),summary:args[2],created_at:args[3]})}

test('actual controller automatically saves once; pending blocks native and synthetic replay, response loss confirms the same ID',async()=>{
 let release;const held=new Promise(r=>release=r),f=fixture(async({args,rows})=>{commit(rows,args);await held;throw Error('Actual transport fixture: committed response lost')});
 try{await f.flush();f.click('#btn-start');f.finish();await f.flush();assert.equal(f.writes,1);assert.equal(f.rows.size,1);assert.equal(f.w.document.querySelector('#s-over').hidden,false);assert.equal(f.w.document.querySelector('#btn-again').disabled,true);
  f.w.document.querySelector('#btn-again').dispatchEvent(new f.w.MouseEvent('click',{bubbles:true}));f.key('Enter');await f.flush();assert.equal(f.writes,1);assert.equal(f.w.document.querySelector('#s-play').hidden,true);
  release();await f.flush();assert.equal(f.writes,1);assert.equal(f.rows.size,1);assert.equal(f.w.document.querySelector('#btn-again').disabled,false);assert.equal(f.w.document.querySelectorAll('.lb-row.me').length,1);
  f.w.document.querySelector('#btn-retry-save').dispatchEvent(new f.w.MouseEvent('click',{bubbles:true}));await f.flush();assert.equal(f.writes,1);f.click('#btn-again');assert.equal(f.w.document.querySelector('#s-play').hidden,false);assert.equal(f.w.document.querySelectorAll('#board .on').length,0);
 }finally{release();f.close()}
});

test('unconfirmed automatic save retains frozen payload and stable ID until explicit reread-and-save retry',async()=>{
 const f=fixture(async({args,rows,writes})=>{if(writes===1)throw Error('Unconfirmed fixture response');commit(rows,args)});
 try{await f.flush();f.click('#btn-start');f.finish();await f.flush();assert.equal(f.writes,1);assert.equal(f.rows.size,0);assert.equal(f.w.document.querySelector('#btn-retry-save').hidden,false);assert.equal(f.w.document.querySelector('#btn-again').disabled,true);f.key(' ');assert.equal(f.w.document.querySelector('#s-play').hidden,true);
  const first=f.calls.find(x=>x.q.startsWith('INSERT'));f.click('#btn-retry-save');await f.flush();const attempts=f.calls.filter(x=>x.q.startsWith('INSERT'));assert.equal(attempts.length,2);assert.deepEqual(attempts[1].args,first.args);assert.equal(f.rows.size,1);assert.equal(f.w.document.querySelector('#btn-again').disabled,false);assert.ok(f.calls.filter(x=>x.q.startsWith('SELECT id FROM')).length>=3);
 }finally{f.close()}
});

test('restored idle/play Enter controls and captured Bresenham drag retain the original half-slope cells',async()=>{
 const f=fixture(async({args,rows})=>commit(rows,args));
 try{await f.flush();f.key('Enter');assert.equal(f.w.document.querySelector('#s-play').hidden,false);f.key('Enter');assert.equal(f.w.document.querySelector('#ticket-no').textContent,'002');
  let capture=null;const b=f.w.document.querySelector('#board');b.setPointerCapture=id=>capture=id;f.w.document.elementFromPoint=x=>f.w.document.querySelector(`[data-i="${x===0?0:10}"]`);
  for(const [type,x]of [['pointerdown',0],['pointermove',10]]){const e=new f.w.Event(type,{bubbles:true,cancelable:true});Object.defineProperties(e,{clientX:{value:x},clientY:{value:0},pointerId:{value:7}});b.dispatchEvent(e)}
  assert.equal(capture,7);assert.deepEqual([...f.w.document.querySelectorAll('#board .on')].map(x=>Number(x.dataset.i)),[0,1,10]);f.key('r');assert.equal(f.w.document.querySelectorAll('#board .on').length,0);f.key('2');assert.equal(f.w.document.querySelector('[data-tool="1"]').getAttribute('aria-pressed'),'true');f.key('x');assert.equal(f.w.document.querySelector('[data-tool="erase"]').getAttribute('aria-pressed'),'true');assert.equal(f.writes,0);
 }finally{f.close()}
});

test('an older same-page history response cannot erase the newer confirmed leaderboard',async()=>{
 let release;const oldResponse=new Promise(r=>release=r),f=fixture(async({args,rows})=>commit(rows,args),({rows,count})=>count===1?oldResponse:[...rows.values()]);
 try{f.click('#btn-start');f.finish();await f.flush();assert.equal(f.rows.size,1);assert.equal(f.w.document.querySelectorAll('.lb-row.me').length,1);release([]);await f.flush();assert.equal(f.w.document.querySelectorAll('.lb-row.me').length,1);assert.equal(f.writes,1)}finally{release([]);f.close()}
});

test('a confirmed save with failed leaderboard read offers an in-report read-only recovery',async()=>{
 const f=fixture(async({args,rows})=>commit(rows,args),({rows,count})=>{if(count===2)throw Error('History read unavailable');return [...rows.values()]});
 try{await f.flush();f.click('#btn-start');f.finish();await f.flush();assert.equal(f.rows.size,1);assert.equal(f.writes,1);const b=f.w.document.querySelector('#btn-reload-result-records');assert.ok(b);assert.equal(b.hidden,false);assert.equal(b.closest('#s-over').hidden,false);assert.equal(f.w.document.querySelector('#btn-again').disabled,false);assert.match(f.w.document.querySelector('#cloud-state').textContent,/记录已保存/);f.click('#btn-reload-result-records');await f.flush();assert.equal(f.writes,1);assert.equal(f.w.document.querySelectorAll('.lb-row.me').length,1);assert.equal(b.hidden,true);assert.equal(f.w.document.querySelector('#cloud-state').hidden,true)}finally{f.close()}
});
