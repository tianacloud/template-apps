import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {removeCandidate,toDocument} from './document-shape.js';

test('actual scene controller restores complete preset scores after deleting the middle candidate and switching scenes',async()=>{
 const source=await readFile(new URL('./main.js',import.meta.url),'utf8');
 const start=source.indexOf('var TEMPLATES=');const end=source.indexOf('function blank(){',start);
 assert.ok(start>=0&&end>start,'Actual preset/controller source boundaries must exist');
 let saved=0,rendered=0;
 const context=vm.createContext({save(){saved++},renderAll(){rendered++}});
 // Run the real preset declarations and loadTpl controller; only rendering/persistence are stubbed.
 new vm.Script(source.slice(start,end),{filename:'actual-main-scene-controller.js'}).runInContext(context);
 const original=JSON.parse(JSON.stringify(context.TEMPLATES));
 for(let scene=0;scene<original.length;scene++){
  context.loadTpl(scene);
  assert.deepEqual(JSON.parse(JSON.stringify(toDocument(context.S).scores)),original[scene].scores);
  removeCandidate(context.S,context.S.options[1].id);
  assert.deepEqual(JSON.parse(JSON.stringify(toDocument(context.S).scores)),original[scene].scores.map(row=>[row[0],row[2]]));
  context.loadTpl((scene+1)%original.length);
  context.loadTpl(scene);
  const restored=JSON.parse(JSON.stringify(toDocument(context.S)));
  assert.deepEqual(restored.options,original[scene].options);
  assert.deepEqual(restored.scores,original[scene].scores);
  assert.deepEqual(JSON.parse(JSON.stringify(context.TEMPLATES)),original,'Presets must remain unchanged by current-document deletion');
 }
 assert.equal(saved,original.length*3);assert.equal(rendered,saved);
});
