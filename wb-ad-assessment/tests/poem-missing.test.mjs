import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {poemScore,poemBand,newDraft,addAssessment,validatePatient,toCsv} from '../src/rules.js';
import {detail,patientCards,chart,trend} from '../src/interface.js';

test('one blank POEM item counts zero; two or more blanks never produce a total or severity',()=>{
 assert.equal(poemScore([4,4,null,4,4,4,4]),24);
 assert.equal(poemScore([0,0,null,0,0,0,0]),0);
 assert.equal(poemScore([4,null,null,4,4,4,4]),null);
 assert.equal(poemScore(Array(7).fill(null)),null);
 assert.equal(poemBand(null),'未评分');
 assert.throws(()=>poemBand(undefined));
});

test('blank answers survive record backup/reopen, export and chart gaps without a false zero',()=>{
 const d={...newDraft(),name:'合成缺答',caseNo:'SYN-MISSING',age:32,gender:'女',poem:Array(7).fill(2),nrs:6,concerns:['止痒']};
 let p=addAssessment(d,null,'2026-06-01T00:00:00Z');
 p=addAssessment({...d,poem:[null,null,2,2,2,2,2]},p,'2026-06-02T00:00:00Z');
 p=addAssessment({...d,poem:[null,2,2,2,2,2,2]},p,'2026-06-03T00:00:00Z');
 const reopened=JSON.parse(JSON.stringify(p));validatePatient(reopened);
 assert.deepEqual(reopened.assessments.map(a=>a.poemScore),[12,null,14]);
 const gap=reopened.assessments[1];
 assert.equal(gap.poem[0],null);
 const markup=detail({patient:reopened,assessment:gap});
 assert.match(markup,/缺答 2 题，不计算总分/);
 assert.match(markup,/未评分/);
 assert.doesNotMatch(markup,/undefined|null分|POEM 0/);
 assert.match(patientCards({patients:[{...reopened,assessments:[gap]}],query:''}),/POEM 未评分/);
 assert.match(detail({patient:reopened,assessment:reopened.assessments[0]}),/缺答 1 题，按 0 分计入总分/);
 const rows=toCsv([reopened]).slice(1).split('\r\n').map(row=>row.split(',').map(c=>c.slice(1,-1)));
 assert.equal(rows[0][8],'POEM缺答题数');
 assert.equal(rows[1][5],'12');assert.equal(rows[1][8],'1');
 assert.equal(rows[2][5],'');assert.equal(rows[2][8],'2');
 const {document}=parseHTML(chart(reopened,'poem',28,'#0f9d8f'));
 assert.equal(document.querySelectorAll('circle').length,2);
 assert.equal(document.querySelectorAll('path').length,2);
 assert.ok([...document.querySelectorAll('path')].every(path=>!path.getAttribute('d').includes('L')));
 assert.match(trend({patient:reopened}),/未评分为空，不补零、不跨缺口连线/);
});
