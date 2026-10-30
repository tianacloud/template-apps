import test from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as sleep} from 'node:timers/promises';
import {WorkspaceSync} from '../src/workspace-sync.js';
import {MemoryRepository} from '../src/demo.js';
import {sampleWorkspace,blankWorkspace,replaceWorkspace} from '../src/rules.js';
import {beginEventDraft,mergeEventDraft} from '../src/event-draft.js';

const clone=structuredClone;
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
async function until(check){for(let i=0;i<500;i++){if(check())return;await sleep(2);}assert.fail('expected async step did not complete');}
const workspace=()=>sampleWorkspace('2026-10-23');

test('debounce coalesces edits; delayed snapshots serialize and never clear newer edits',async t=>{
 const initial=workspace(),repo=new MemoryRepository([initial]),save=repo.save.bind(repo),gates=[deferred(),deferred()],calls=[];let active=0,maxActive=0;
 repo.save=async snapshot=>{const index=calls.length;calls.push(clone(snapshot));maxActive=Math.max(maxActive,++active);try{await gates[index].promise;return await save(snapshot);}finally{active--;}};
 let local=clone(initial);const sync=new WorkspaceSync({repository:repo,initial,delay:8,onMetadata:metadata=>Object.assign(local,metadata)});t.after(()=>sync.dispose());
 local.notes[0].text='第一次';sync.commit(local);local.notes[0].text='同一批最终文字';sync.commit(local);
 await until(()=>calls.length===1);assert.equal(calls[0].notes[0].text,'同一批最终文字');
 local.notes[0].text='请求中继续输入';sync.commit(local);local.notes[0].text='尚未提交的输入';
 assert.equal(calls.length,1);gates[0].resolve();await until(()=>calls.length===2);
 assert.equal(sync.state.dirty,true);assert.equal(local.notes[0].text,'尚未提交的输入');assert.equal(calls[1].notes[0].text,'请求中继续输入');assert.equal(calls[1].revision,2);assert.equal(maxActive,1);
 gates[1].resolve();await sync.flush();assert.equal(sync.state.dirty,false);assert.equal(sync.state.revision,3);assert.equal((await repo.get('workspace')).notes[0].text,'请求中继续输入');assert.equal(local.notes[0].text,'尚未提交的输入');
});

test('a lost write receipt is independently read back without replaying it or losing a later edit',async t=>{
 const initial=workspace(),repo=new MemoryRepository([initial]),save=repo.save.bind(repo),get=repo.get.bind(repo),readGate=deferred(),readStarted=deferred();let writes=0,reads=0;
 repo.save=async snapshot=>{writes++;const saved=await save(snapshot);if(writes===1)throw Error('response lost after commit');return saved;};
 repo.get=async id=>{reads++;if(reads===1){readStarted.resolve();await readGate.promise;}return get(id);};
 const sync=new WorkspaceSync({repository:repo,initial,delay:60000});t.after(()=>sync.dispose());const local=clone(initial);local.notes[0].text='已到云端';sync.commit(local);const first=sync.flush();await readStarted.promise;
 local.notes[0].text='回读期间新输入';sync.commit(local);readGate.resolve();await first;
 assert.equal(writes,1);assert.equal(reads,1);assert.equal(sync.state.dirty,true);assert.equal(sync.current.notes[0].text,'回读期间新输入');
 await sync.flush();assert.equal(writes,2);assert.equal(sync.state.dirty,false);assert.equal((await get('workspace')).notes[0].text,'回读期间新输入');
});

test('unconfirmed failure pauses auto writes; explicit retry reads first and saves the latest input',async t=>{
 const initial=workspace(),repo=new MemoryRepository([initial]),save=repo.save.bind(repo),get=repo.get.bind(repo),steps=[];let online=false;
 repo.save=async snapshot=>{steps.push('write:'+snapshot.notes[0].text);if(!online)throw Error('disconnected');return save(snapshot);};repo.get=async id=>{steps.push('read');if(!online)throw Error('disconnected');return get(id);};
 const sync=new WorkspaceSync({repository:repo,initial,delay:5});t.after(()=>sync.dispose());const local=clone(initial);local.notes[0].text='第一次';sync.commit(local);await sync.flush();assert.equal(sync.state.phase,'unknown');
 local.notes[0].text='断网期间继续修改';sync.commit(local);await sleep(20);assert.deepEqual(steps,['write:第一次','read']);await sync.retry();assert.equal(sync.state.phase,'unknown');assert.equal(steps.filter(s=>s.startsWith('write:')).length,1);
 online=true;await sync.retry();assert.deepEqual(steps.slice(-2),['read','write:断网期间继续修改']);assert.equal(sync.state.dirty,false);assert.equal((await get('workspace')).notes[0].text,'断网期间继续修改');
});

test('CAS conflict preserves local edits, refuses overwrite retry, and guards edits during reload',async t=>{
 const initial=workspace(),repo=new MemoryRepository([initial]),get=repo.get.bind(repo),save=repo.save.bind(repo);const remote=clone(initial);remote.notes[0].text='另一个标签页';await save(remote);let writes=0,readGate=null;
 repo.save=async doc=>{writes++;return save(doc);};repo.get=async id=>{if(readGate)await readGate.promise;return get(id);};
 const sync=new WorkspaceSync({repository:repo,initial,delay:60000});t.after(()=>sync.dispose());const local=clone(initial);local.notes[0].text='本页输入';sync.commit(local);await sync.flush();assert.equal(sync.state.phase,'conflict');assert.equal(sync.current.notes[0].text,'本页输入');await sync.retry();assert.equal(writes,1);
 readGate=deferred();const reload=sync.reload();local.notes[0].text='读取期间又改了';sync.commit(local);readGate.resolve();assert.deepEqual(await reload,{adopted:false});assert.equal(sync.current.notes[0].text,'读取期间又改了');assert.equal(writes,1);
 readGate=null;const confirmed=await sync.reload();assert.equal(confirmed.adopted,true);assert.equal(confirmed.document.notes[0].text,'另一个标签页');assert.equal(sync.state.dirty,false);assert.equal(writes,1);
});

test('unconfirmed event input stays outside unrelated saves; confirming merges it with newer work',async t=>{
 let local=workspace();const repo=new MemoryRepository([local]),save=repo.save.bind(repo),gate=deferred(),calls=[];repo.save=async doc=>{calls.push(clone(doc));if(calls.length===1)await gate.promise;return save(doc);};
 const sync=new WorkspaceSync({repository:repo,initial:local,delay:60000,onMetadata:metadata=>Object.assign(local,metadata)});t.after(()=>sync.dispose());
 const draft=beginEventDraft({...local.events[0],id:'new-unconfirmed-event'},false);draft.draft.title='新建但未确认';const existing=beginEventDraft(local.events[0],true);existing.draft.note='仍在详情输入中';
 local.notes[0].text='另一个已确认便签';sync.commit(local);const first=sync.flush();await until(()=>calls.length===1);draft.draft.title='保存等待期间继续写详情';
 assert.equal(calls[0].events.length,1);assert.notEqual(calls[0].events[0].note,existing.draft.note);assert.equal(local.events.length,1);
 gate.resolve();await first;assert.equal(draft.draft.title,'保存等待期间继续写详情');assert.equal(existing.draft.note,'仍在详情输入中');
 local=mergeEventDraft(local,draft,draft.draft);local=mergeEventDraft(local,existing,existing.draft);sync.commit(local);await sync.flush();const actual=await repo.get('workspace');assert.equal(actual.notes[0].text,'另一个已确认便签');assert.equal(actual.events[1].title,'保存等待期间继续写详情');assert.equal(actual.events[0].note,'仍在详情输入中');
});

test('a stale detail draft cannot overwrite a changed event after explicit remote reload',()=>{
 const original=workspace(),draft=beginEventDraft(original.events[0],true);draft.draft.note='本页详情未确认';const reloaded=clone(original);reloaded.events[0].title='云端其他修改';const before=clone(reloaded);
 assert.throws(()=>mergeEventDraft(reloaded,draft,draft.draft),/草稿仍保留/);assert.deepEqual(reloaded,before);assert.equal(draft.draft.note,'本页详情未确认');
});

test('fresh workspaces insert correctly; invalid replacement never enters the save queue',async t=>{
 const initial=blankWorkspace(),repo=new MemoryRepository([]),sync=new WorkspaceSync({repository:repo,initial,exists:false,delay:60000});t.after(()=>sync.dispose());let next=replaceWorkspace(initial,workspace());sync.commit(next);await sync.flush();assert.equal(sync.state.revision,1);assert.equal((await repo.get('workspace')).notes.length,1);
 const before=clone(sync.current),invalid=clone(next);invalid.settings=null;assert.throws(()=>sync.commit(invalid));assert.deepEqual(sync.current,before);assert.equal(sync.state.dirty,false);await sync.flush();assert.equal((await repo.get('workspace')).revision,1);
});

test('a mismatched save receipt cannot clear dirty state or replace the current content',async t=>{
 const initial=workspace(),repo=new MemoryRepository([initial]),get=repo.get.bind(repo);let reads=0;repo.save=async()=>({...initial,revision:99});repo.get=async id=>{reads++;return get(id);};
 const sync=new WorkspaceSync({repository:repo,initial,delay:60000});t.after(()=>sync.dispose());const local=clone(initial);local.notes[0].text='必须保留的输入';sync.commit(local);await sync.flush();
 assert.equal(reads,1);assert.equal(sync.state.phase,'unknown');assert.equal(sync.state.dirty,true);assert.equal(sync.state.revision,1);assert.equal(sync.current.notes[0].text,'必须保留的输入');
});
