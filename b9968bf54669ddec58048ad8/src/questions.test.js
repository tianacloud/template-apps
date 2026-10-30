import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const bank=JSON.parse(await readFile(new URL('../template-files/questions.json',import.meta.url)));
test('五模块100题结构完整，ID、答案和解析均有效',()=>{
 const seen=new Set();assert.equal(Object.keys(bank).length,5);
 for(const module of Object.values(bank)){assert.equal(module.questions.length,20);for(const q of module.questions){assert.ok(!seen.has(q.id));seen.add(q.id);assert.equal(q.options.length,4);assert.ok(q.options.every(x=>typeof x==='string'&&x.trim()));assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert.ok(q.stem.trim()&&q.explain.trim());assert.ok(q.points.length)}}
 assert.equal(seen.size,100);
});
test('数量关系20题按独立算式核对正确选项',()=>{
 const expected=[195,36/(5+4),(36-4*(3+2))/2,(120*.8-80)/80*100,4*3,120/(60/30+60/20),40-(25+20-8),1/(1/20+1/30+1/60),6*4*3,6**2+1,(200*.25-200*.2)/(1-.25),2**3+1,5*4,(125-100)/125*100,3*360/12,500*1.2*1.15,(79+20*2)/7,3**2,100/(6+3+1),400/(6-4)];
 bank.shuliang.questions.forEach((q,i)=>{const selected=Number(q.options[q.answer].match(/[\d.]+/)[0]);assert.ok(Math.abs(selected-expected[i])<.04,`${q.id}: ${selected} vs ${expected[i]}`)});
});
test('资料分析20题独立计算，随机题含完整所需材料',()=>{
 const expected=[480/1.2,62/1.24,62/480*100,(1200-1000)/1000*100,3850/7000*100,84000/1200,6300/2100,68000-68000/1.055,40-32,180000*1000/1500000,(750-500)/500*100,24000/48000*100,(420+380+450+510+480+560)/6,1250/.8,180/1200*100,32/1.25,5600/800,1.8/.06,(483-420)/420*100,483/560*100];
 bank.ziliao.questions.forEach((q,i)=>{const selected=Number(q.options[q.answer].match(/[\d.]+/)[0]);assert.ok(Math.abs(selected-expected[i])<=.51,`${q.id}: ${selected} vs ${expected[i]}`);assert.ok(!q.stem.includes('承上题'));if(i===1)assert.ok(q.material.includes('62')&&q.material.includes('24%'))});
});
