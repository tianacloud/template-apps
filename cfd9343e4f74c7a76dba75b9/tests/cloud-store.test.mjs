import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {openPracticeStore} from '../cloud-store.js';
const schema=readFileSync(new URL('../schema.sql',import.meta.url),'utf8');
const settle=async store=>{for(let i=0;i<100&&store.unsaved();i++)await new Promise(resolve=>setTimeout(resolve,2));};
function fixture(){
  const db=new DatabaseSync(':memory:');db.exec(schema);
  let lose=false,writes=0;
  const execute=async(sql,args=[])=>{
    const rows=db.prepare(sql).all(...args.map(a=>a.type==='integer'?Number(a.value):a.value));
    if(sql.startsWith('UPDATE')){writes++;if(lose){lose=false;throw new Error('response lost after commit');}}
    return rows.map(row=>Object.fromEntries(Object.entries(row).map(([k,v])=>[k,typeof v==='number'?String(v):v])));
  };
  return{db,execute,loseNextWrite(){lose=true;},get writes(){return writes;}};
}
test('saved statistics survive reopen and remain isolated by application',async()=>{
  const f=fixture(),a=await openPracticeStore(f.execute,'app-a',()=>{});
  const data=JSON.stringify({stats:{simpleDer:{correct:2,error:1}}});a.set(data);await settle(a);
  assert.equal((await openPracticeStore(f.execute,'app-a',()=>{})).get(),data);
  assert.deepEqual(JSON.parse((await openPracticeStore(f.execute,'app-b',()=>{})).get()),{stats:{}});f.db.close();
});
test('a stale page cannot overwrite the newer cloud statistics',async()=>{
  const f=fixture(),messages=[];
  const a=await openPracticeStore(f.execute,'app-a',()=>{}),b=await openPracticeStore(f.execute,'app-a',(text)=>messages.push(text));
  a.set('{"stats":{"correct":3}}');await settle(a);b.set('{"stats":{"correct":1}}');await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(b.get(),'{"stats":{"correct":1}}');assert.ok(b.unsaved());assert.ok(messages.some(text=>text.includes('其他页面')));
  await b.retry();assert.equal((await openPracticeStore(f.execute,'app-a',()=>{})).get(),'{"stats":{"correct":3}}');f.db.close();
});
test('a lost response is reconciled without repeating the committed write',async()=>{
  const f=fixture(),a=await openPracticeStore(f.execute,'app-a',()=>{});f.loseNextWrite();
  a.set('{"stats":{"correct":4}}');await settle(a);assert.equal(a.unsaved(),false);assert.equal(f.writes,1);
  assert.equal((await openPracticeStore(f.execute,'app-a',()=>{})).get(),'{"stats":{"correct":4}}');f.db.close();
});
