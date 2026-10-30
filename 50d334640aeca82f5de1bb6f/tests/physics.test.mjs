import test from 'node:test';
import assert from 'node:assert/strict';
import {overlap,moveBody,blockedBody} from '../src/physics.js';
const coupe={x:0,z:0,heading:0,hx:1.3,hz:2.4};
test('the front of a car stops at a wall even across a long frame',()=>{
 const wall={x:0,z:10,hx:20,hz:.1};
 const result=moveBody(coupe,0,30,0,[wall]);
 assert.ok(result.hit);assert.ok(result.z<7.51&&result.z>7.2);assert.equal(overlap(result,wall),false);
});
test('cars contact nose-to-tail and side-to-side without passing through',()=>{
 for(const target of [{...coupe,z:8},{...coupe,x:8,heading:Math.PI/2}]){
  const result=moveBody(coupe,target.x*2,target.z*2,0,[target]);
  assert.ok(result.hit);assert.equal(overlap(result,target),false);
 }
});
test('rotating a long vehicle stops before its corner enters a building',()=>{
 const wall={x:2,z:0,hx:.1,hz:8};
 const result=moveBody(coupe,0,0,Math.PI/2,[wall]);
 assert.ok(result.hit);assert.ok(result.heading<Math.PI/2);assert.equal(overlap(result,wall),false);
});
test('glancing contact allows movement along a wall',()=>{
 const wall={x:3,z:0,hx:.5,hz:80};
 const result=moveBody(coupe,5,15,0,[wall]);
 assert.ok(result.hit);assert.ok(result.z>14);assert.ok(result.x<1.21);assert.equal(overlap(result,wall),false);
});
test('the whole vehicle remains inside the coast boundary',()=>{
 const result=moveBody({...coupe,x:149},20,0,0,[]);
 assert.ok(result.hit);assert.ok(result.x+result.hx<=154);assert.equal(blockedBody(result,[]),false);
});
