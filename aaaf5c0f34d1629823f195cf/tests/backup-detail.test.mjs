import test from 'node:test';
import assert from 'node:assert/strict';
import {samplePatients,validatePatient} from '../src/rules.js';
import {detail} from '../src/interface.js';
test('nested malformed treatment details cannot pass backup validation and break a reopened record',()=>{
 const valid=structuredClone(samplePatients()[0]);
 valid.assessments[0].details={'度普利尤单抗':{used:'正在使用',effect:'部分好转',adverse:'无',adverseText:''}};
 assert.equal(validatePatient(valid),valid);
 assert.match(detail({patient:valid,assessment:valid.assessments[0]}),/部分好转/);
 for(const invalid of [null,{effect:{unexpected:'object'}}]){
  const bad=structuredClone(valid);bad.assessments[0].details['度普利尤单抗']=invalid;
  assert.throws(()=>validatePatient(bad),/治疗详情/);
 }
 const legacy=structuredClone(valid);delete legacy.assessments[0].details;
 assert.equal(validatePatient(legacy),legacy);
});
