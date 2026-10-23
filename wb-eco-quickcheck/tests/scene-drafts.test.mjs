import test from 'node:test';
import assert from 'node:assert/strict';
import {newCase,switchCaseScene,validateCase} from '../src/rules.js';

test('scene changes and a saved JSON roundtrip preserve each scene without sharing mutable checks',()=>{
 const original=newCase();original.checks[0].state='issue';original.checks[0].note='合成许可异常待核';
 let current=switchCaseScene(original,'废水');current.checks[1].state='na';current.checks[1].note='合成不适用说明';
 assert.equal(original.scene,'排污许可');assert.equal(original.checks[0].note,'合成许可异常待核');
 current=switchCaseScene(validateCase(JSON.parse(JSON.stringify(current))),'排污许可');
 assert.equal(current.checks[0].state,'issue');assert.equal(current.checks[0].note,'合成许可异常待核');
 current.checks=current.checks.map(v=>({...v,state:'pending',note:''}));
 current=switchCaseScene(current,'废水');assert.equal(current.checks[1].state,'na');assert.equal(current.checks[1].note,'合成不适用说明');
 current=switchCaseScene(current,'排污许可');assert(current.checks.every(v=>v.state==='pending'&&v.note===''));validateCase(current);
});

test('old records remain valid while invalid hidden scene data cannot be loaded',()=>{
 const old=newCase();delete old.sceneChecks;validateCase(old);
 const next=switchCaseScene(old,'自动监测');validateCase(next);
 next.sceneChecks['排污许可'][0].state='invalid';assert.throws(()=>validateCase(next));
 assert.throws(()=>switchCaseScene(old,'constructor'));assert.equal(old.scene,'排污许可');assert.equal(old.sceneChecks,undefined);
});
