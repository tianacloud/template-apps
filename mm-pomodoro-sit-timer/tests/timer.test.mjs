import test from 'node:test';
import assert from 'node:assert/strict';
import { elapsed, reconcile, seeded } from '../src/backend.js';

test('late completion is credited once even when checked repeatedly', () => {
  const s={phase:'running',startedAt:Date.now()-70000,remainingSec:60,focusSec:8,completedSessions:2,reminderSeq:2};
  assert.equal(reconcile(s),true);
  assert.deepEqual([s.phase,s.remainingSec,s.focusSec,s.completedSessions,s.reminderSeq],['reminded',0,68,3,3]);
  assert.equal(reconcile(s),false);
  assert.deepEqual([s.focusSec,s.completedSessions,s.reminderSeq],[68,3,3]);
});

test('paused time remains frozen and elapsed is capped at the deadline', () => {
  assert.equal(elapsed({phase:'paused',remainingSec:42,startedAt:Date.now()-999999}),0);
  assert.equal(elapsed({phase:'running',remainingSec:42,startedAt:Date.now()-999999}),42);
  assert.equal(elapsed({phase:'running',remainingSec:42,startedAt:Date.now()+999999}),0);
});

test('each shuffled pass contains every track exactly once', () => {
  for(const n of [1,2,3,5,20,500]) for(let cycle=0;cycle<8;cycle++) {
    const order=seeded(n,cycle);
    assert.equal(order.length,n);
    assert.deepEqual([...order].sort((a,b)=>a-b),Array.from({length:n},(_,i)=>i));
    assert.deepEqual(order,seeded(n,cycle));
  }
});
