import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {makeUpdate} from '../src/merge.js';
const empty=()=>({archive:{},favorites:{},stats:{answered:0,correct:0,rounds:0},theme:'light'});
function apply(db, before, after) {
  const change=makeUpdate(before,after);
  if(change) db.prepare(change.sql).run(...change.args.map(x=>x.type==='integer'?Number(x.value):x.value));
}
const read=db=>JSON.parse(db.prepare('select payload from progress where id=1').get().payload);
test('independent edits, removals and statistics merge against the current row',()=>{
 const db=new DatabaseSync(':memory:'); db.exec('create table progress(id integer primary key,payload text not null)');
 const a=empty(),b=empty();
 const aa=structuredClone(a); aa.archive['en2zh:abandon']={at:1,ok:true};aa.stats.answered=1;aa.stats.correct=1;
 const bb=structuredClone(b); bb.archive['cloze:modify']={at:2,ok:false};bb.stats.answered=1; bb.favorites.modify=2;
 apply(db,a,aa);apply(db,b,bb);
 let result=read(db);assert.deepEqual(Object.keys(result.archive).sort(),['cloze:modify','en2zh:abandon']);assert.equal(result.stats.answered,2);assert.equal(result.stats.correct,1);assert.equal(result.favorites.modify,2);
 const stale=structuredClone(result), deleting=structuredClone(result), removed=structuredClone(deleting);delete removed.archive['en2zh:abandon'];delete removed.favorites.modify;
 apply(db,deleting,removed);const later=structuredClone(stale);later.archive['en2zh:another']={at:3,ok:true};later.stats.answered++;apply(db,stale,later);
 result=read(db);assert.equal(result.archive['en2zh:abandon'],undefined);assert.equal(result.favorites.modify,undefined);assert.ok(result.archive['cloze:modify']);assert.ok(result.archive['en2zh:another']);assert.equal(result.stats.answered,3);
 const old=structuredClone(result), one=structuredClone(old), two=structuredClone(old);delete one.archive['cloze:modify'];two.archive['cloze:modify']={at:4,ok:true};apply(db,old,one);apply(db,old,two);assert.equal(read(db).archive['cloze:modify'].ok,true);
});
