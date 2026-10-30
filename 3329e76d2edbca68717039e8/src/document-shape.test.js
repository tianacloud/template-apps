import test from 'node:test';
import assert from 'node:assert/strict';
import {fromDocument,toDocument,removeCandidate} from './document-shape.js';
test('v1 saved document round-trips through restored UI without changing scores or directions',()=>{let id=0;const d={name:'选 Offer',title:'原有决策',options:['甲','乙','丙'],criteria:[['成本',8,false],['质量',6,true]],scores:[[7,2,5],[4,9,6]],step:3};const ui=fromDocument(d,()=>String(++id));assert.deepEqual(toDocument(ui),d);ui.scores[ui.criteria[0].id][1]=3;assert.equal(d.scores[0][1],2);assert.equal(toDocument(ui).scores[0][1],3)});
test('removing a middle candidate retains each remaining candidate score',()=>{let id=0;const ui=fromDocument({title:'比较',options:['甲','乙','丙'],criteria:[['成本',8,false],['质量',6,true]],scores:[[7,2,5],[4,9,6]],step:1},()=>String(++id));removeCandidate(ui,ui.options[1].id);assert.deepEqual(toDocument(ui).scores,[[7,5],[4,6]])});
