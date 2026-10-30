import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAlg} from '../src/notation.js';
const tokens=text=>parseAlg(text).out.map(x=>x.tok);
test('normalizes uppercase whole turns, alternate primes and superscript half turns',()=>{
 assert.deepEqual(tokens('X Y Z R’ U² M′2'),['x','y','z','R′','U2','M2']);
});
test('groups and repeated half turns retain notation meaning',()=>{
 assert.deepEqual(tokens('(R U)2'),['R','U','R','U']);
 assert.deepEqual(tokens('R23'),['R2','R2','R2']);
});
test('mixed invalid input preserves legal turns and reports the invalid token',()=>{
 const result=parseAlg('R Q U');assert.deepEqual(result.out.map(x=>x.tok),['R','U']);assert.deepEqual(result.bad,['Q']);
});
test('wide turns apply only to outer faces',()=>{
 assert.deepEqual(tokens('r Rw Fw′'),['Rw','Rw','Fw′']);
 const result=parseAlg('Mw xw');assert.equal(result.out.length,0);assert.deepEqual(result.bad,['Mw','xw']);
});
test('unfinished opening group retains legal content and extra closing group is reported',()=>{
 assert.deepEqual(tokens('(R U'),['R','U']);assert.deepEqual(parseAlg('R )').bad,[')']);
});
