import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import {prescription,startSession,volume,oneRM,toKg,kgTo,validateRecord,clone} from '../src/domain.js';
import {GymStore} from '../src/storage.js';
import {previewCSV,previewJSON,parseCSV} from '../src/imports.js';

const cfg={exerciseId:'bench',mode:'reps',sets:3,reps:8,weight:50,rest:90,policy:'linear',increment:2.5,min:8,max:12};
const entry=(reps=[8,8,8],done=[true,true,true])=>({exerciseId:'bench',mode:'reps',target:clone(cfg),sets:reps.map((r,i)=>({id:'s'+i,reps:r,weight:50,done:done[i],kind:'normal',rir:''}))});
const workout=e=>({id:'w',name:'测试训练',date:'2026-10-20',routineId:'r',entries:[e]});
test('progression never raises load after a missing, unchecked or short set',()=>{for(const e of [entry([8,8]),entry([8,8,7]),entry([8,8,8],[true,true,false])])assert.equal(prescription(cfg,[workout(e)],'r').weight,50);assert.equal(prescription(cfg,[workout(entry())],'r').weight,52.5);});
test('three actual failures suggest a 10% deload; other routines do not change targets',()=>{const failed=workout(entry([7,7,7]));assert.equal(prescription(cfg,[failed,failed,failed],'r').weight,45);assert.equal(prescription(cfg,[{...failed,routineId:'other'}],'r').reason,'首次训练，使用计划目标');});
test('double progression keeps its changing rep target in the finished session',()=>{const config={...cfg,policy:'double'};const routine={id:'r',name:'训练',exercises:[config]};const catalogue=new Map([['bench',{id:'bench',name:'卧推',muscle:'chest'}]]);let past=[];for(let expected=8;expected<=12;expected++){const w=startSession(routine,past,catalogue);assert.equal(w.entries[0].sets[0].reps,expected);assert.equal(w.entries[0].target.reps,expected);w.entries[0].sets.forEach(s=>s.done=true);w.id='w'+expected;w.date='2026-10-'+String(expected+1).padStart(2,'0');past.push(w);}const next=startSession(routine,past,catalogue);assert.equal(next.entries[0].sets[0].reps,8);assert.equal(next.entries[0].sets[0].weight,52.5);});
test('volume excludes warmups, incomplete rows and timed/cardio exercise modes',()=>{const w=workout(entry());w.entries[0].sets.push({weight:100,reps:10,done:true,kind:'warmup'},{weight:100,reps:10,done:false,kind:'normal'});w.entries.push({mode:'time',sets:[{weight:50,reps:60,done:true}]},{mode:'cardio',sets:[{weight:50,reps:30,done:true}]});assert.equal(volume(w),1200);assert.equal(oneRM(100,1),100);assert.equal(oneRM(60,10),80);assert.equal(oneRM(100,13),null);assert.equal(oneRM(0,8),null);assert.ok(Math.abs(toKg(kgTo(77,'lb'),'lb')-77)<1e-8);});
test('CSV import handles quoted names, apostrophes, duplicate imports and unknown actions',()=>{const csv='Date,Workout Name,Exercise Name,Weight (kg),Reps\n2026-10-20,Pull,"O\'Reilly, row",20,10\n2026-10-20,Pull,"O\'Reilly, row",20,8';const out=previewCSV(csv,[],new Set());assert.equal(out.records.filter(r=>r.kind==='workout').length,1);assert.equal(out.records.find(r=>r.kind==='workout').payload.entries[0].sets.length,2);assert.equal(out.records.find(r=>r.kind==='exercise').payload.name,"O'Reilly, row");const existing=new Set(out.records.map(r=>`${r.kind}:${r.id}`));assert.equal(previewCSV(csv,[],existing).records.length,0);assert.throws(()=>parseCSV('x,y\n"unclosed'),/引号/);});
test('CSV parenthesized kg and lb column headers preserve load and training volume',()=>{
  const catalogue=[{id:'0043',name:'杠铃全蹲',en:'barbell full squat',muscle:'quadriceps',mode:'reps'}];
  for(const [header,expected] of [['Weight (kg)',20],['Weight (lb)',toKg(20,'lb')],['  Weight (kg)  ',20],['Weight',20]]){
    const csv=`Date,Workout Name,Exercise Name,${header},Reps\n2026-10-21,CSV validation,barbell full squat,20,10\n2026-10-21,CSV validation,barbell full squat,20,8`;
    const imported=previewCSV(csv,catalogue,new Set());
    assert.equal(imported.issues.length,0);
    const workout=imported.records.find(r=>r.kind==='workout').payload;
    assert.equal(workout.entries[0].sets[0].weight,expected,header);
    assert.equal(workout.entries[0].sets[1].weight,expected,header);
    assert.ok(Math.abs(volume(workout)-expected*18)<1e-9,header);
  }
});
test('backup rejects unknown records and does not overwrite existing data',()=>{const data={format:'opengym-tiana',version:1,records:[{kind:'weight',id:'weight-one',payload:{date:'2026-02-30',weight:70}},{kind:'weight',id:'weight-two',payload:{date:'2026-02-28',weight:70}}]};const out=previewJSON(JSON.stringify(data),new Set(['weight:weight-two']));assert.equal(out.records.length,0);assert.equal(out.issues.length,1);assert.equal(out.skipped,1);assert.equal(validateRecord('photo',{date:'2026-10-20',image:'data:text/html;base64,AAAA'}),false);});
async function database(){const db=new DatabaseSync(':memory:');db.exec(await readFile(new URL('../schema.sql',import.meta.url),'utf8'));return {db,execute:async(sql,args=[])=>db.prepare(sql).all(...args)};}
test('SQLite compare-and-swap preserves the first window and keeps a conflicting draft',async()=>{const {db,execute}=await database();const a=new GymStore(execute),b=new GymStore(execute);await a.load();await b.load();a.set('weight','one',{date:'2026-10-20',weight:70});assert.equal(await a.flush(),true);b.set('weight','one',{date:'2026-10-20',weight:75});assert.equal(await b.flush(),false);assert.equal(JSON.parse(db.prepare('SELECT payload FROM gym_records').get().payload).weight,70);assert.equal(b.get('weight','one').weight,75);assert.equal(b.dirty.size,1);assert.equal(await b.reconcile(),false);});
test('a committed write with a lost response is read back, never replayed',async()=>{const {execute}=await database();let mutations=0;const channel=async(sql,args)=>{const rows=await execute(sql,args);if(sql.startsWith('INSERT')){mutations++;throw new Error('response lost');}return rows;};const store=new GymStore(channel);await store.load();store.set('weight','one',{date:'2026-10-20',weight:70});assert.equal(await store.flush(),true);assert.equal(mutations,1);assert.equal(store.dirty.size,0);});
test('an edit made during a slow save is saved as the next revision',async()=>{const {db,execute}=await database();let hold,entered;const gated=new Promise(r=>entered=r);let first=true;const store=new GymStore(async(sql,args)=>{if(first&&sql.startsWith('INSERT')){first=false;entered();await new Promise(r=>hold=r);}return execute(sql,args);});await store.load();store.set('weight','one',{date:'2026-10-20',weight:70});const saving=store.flush();await gated;store.set('weight','one',{date:'2026-10-20',weight:72});hold();assert.equal(await saving,true);const row=db.prepare('SELECT payload,revision FROM gym_records').get();assert.equal(JSON.parse(row.payload).weight,72);assert.equal(row.revision,2);});
test('deletion is a tombstone and survives reload without appearing in export',async()=>{const {execute,db}=await database();const store=new GymStore(execute);await store.load();store.set('weight','one',{date:'2026-10-20',weight:70});await store.flush();store.remove('weight','one');await store.flush();const second=new GymStore(execute);await second.load();assert.equal(second.list('weight').length,0);assert.equal(second.export().records.length,0);assert.equal(db.prepare('SELECT deleted FROM gym_records').get().deleted,1);});

test('exercise view and media size settings survive SQLite reload and backup validation',async()=>{
  const {execute}=await database();const first=new GymStore(execute);await first.load();
  first.setSetting('exerciseView','cards');first.setSetting('mediaSize','mini');assert.equal(await first.flush(),true);
  const reopened=new GymStore(execute);await reopened.load();assert.equal(reopened.setting('exerciseView'),'cards');assert.equal(reopened.setting('mediaSize'),'mini');
  const backup=previewJSON(JSON.stringify(reopened.export()),new Set());assert.equal(backup.issues.length,0);assert.equal(backup.records.length,2);
  for(const value of ['full','mini','off'])assert.equal(validateRecord('setting',{value},'mediaSize'),true);
  for(const value of ['list','cards'])assert.equal(validateRecord('setting',{value},'exerciseView'),true);
  assert.equal(validateRecord('setting',{value:'arbitrary'},'mediaSize'),false);assert.equal(validateRecord('setting',{value:'arbitrary'},'exerciseView'),false);
  assert.equal(validateRecord('setting',{value:'cards'},'unknownSetting'),false);
});
