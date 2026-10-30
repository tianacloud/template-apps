import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createScenario,rank,normalized,sensitivity,validate} from './model.js';
test('工作样例归一化结果与反向评分',()=>{assert.deepEqual(rank(createScenario()).map(x=>x.score.toFixed(1)),['70.6','69.1','66.0']);assert.equal(normalized(1,false),1);assert.equal(normalized(10,false),.1)});
test('反转采样重新比较全部方案',()=>{const s=createScenario();const changes=sensitivity(s);assert.equal(changes[0].name,'稳定性');assert.ok(changes[0].percent<20);assert.equal(changes[0].winner,s.options[1]);for(const c of changes){const w=s.criteria.map(x=>x[1]);w[s.criteria.findIndex(x=>x[0]===c.name)]*=c.factor;assert.equal(rank(s,w)[0].name,c.winner)}});
test('同分保持原顺序，非法矩阵拒绝',()=>{const s=createScenario();s.scores=s.scores.map(row=>row.map(()=>5));s.criteria.forEach(c=>c[2]=true);assert.deepEqual(rank(s).map(r=>r.index),[0,1,2]);assert.deepEqual(sensitivity(s),[]);s.scores[0][0]=NaN;assert.throws(()=>validate(s))});
