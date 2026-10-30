import test from 'node:test';
import assert from 'node:assert/strict';
import LunarLib from 'lunar-javascript';
import {lunarYearEnd,parseEvent,nextOccurrence,calendarInfo,sampleWorkspace,readWorkspaceBackup,replaceWorkspace} from '../src/rules.js';
import {festivalsInYear,festivalSuggestions} from '../src/festivals.js';
import {parseQuickEntry} from '../src/quick-entry.js';
import {almanacInfo} from '../src/almanac.js';

test('lunar year end follows the next New Year across 29/30 day twelfth months',()=>{
 assert.equal(lunarYearEnd(2023),'2024-02-09');assert.equal(lunarYearEnd(2024),'2025-01-28');
 const event=parseEvent('每年除夕 团圆','2025-01-01');assert.equal(event.lunar.lastDay,true);
 const lengths=new Set();for(let year=2024;year<=2034;year++){
  const expected=LunarLib.Lunar.fromYmd(year+1,1,1).getSolar().next(-1).toYmd();
  assert.equal(lunarYearEnd(year),expected);lengths.add(calendarInfo(expected).day);
  assert.equal(nextOccurrence(event,expected.slice(0,4)+'-01-01'),expected);
 }
 assert.deepEqual([...lengths].sort(),[29,30]);
 assert.equal(festivalsInYear(2026).find(f=>f.title==='除夕').date,'2026-02-16');
 assert.equal(festivalsInYear(2026).length,24);assert.deepEqual(festivalSuggestions([],'2099-12-31'),[]);
});
test('quick entry distinguishes explicit dates, recurrence and fallback without accepting invalid dates',()=>{
 const high=parseQuickEntry('下周五下午3点 面试','2026-10-23');assert.equal(high.confidence,'high');assert.equal(high.draft.date,'2026-10-30');assert.equal(high.draft.time,'15:00');
 assert.equal(parseQuickEntry('每周一 晨跑','2026-10-23').confidence,'medium');
 const fallback=parseQuickEntry('合成无日期事项','2026-10-23');assert.equal(fallback.confidence,'low');assert.equal(fallback.draft.date,'2026-10-23');assert.equal(fallback.draft.title,'合成无日期事项');
 assert.throws(()=>parseQuickEntry('2026-02-31 见面','2026-01-01'));
 assert.equal(parseQuickEntry('明年春节','2026-10-23').draft.duration,8);
});
test('almanac presents day fields and cultural activity vocabulary',()=>{
 assert.deepEqual(almanacInfo('2026-10-23'),{ganZhi:'庚午日',jianChu:'成',chong:'冲子鼠',yi:['开业庆典','成果验收','婚嫁礼仪','签约合作'],ji:['诉讼','拆卸','破土']});
});
test('new display/reminder/year-end backup fields cannot corrupt or replace the current draft',()=>{
 let current=sampleWorkspace('2026-10-23');current.notes[0].text='保留的未保存输入';const original=structuredClone(current);
 const event=parseEvent('每年除夕 团圆','2025-01-01');event.appearanceEmoji='🐉';event.appearanceColor='blue';event.reminderDays=[1,7];
 const valid=structuredClone(current);valid.events=[event];const encoded=w=>JSON.stringify({format:'timecraft-v1',workspace:w});
 assert.equal(readWorkspaceBackup(encoded(valid)).events[0].lunar.lastDay,true);
 for(const mutate of [e=>e.appearanceEmoji='<img src=x>',e=>e.appearanceColor='constructor',e=>e.reminderDays=[7,7],e=>e.lunar.lastDay='yes',e=>e.date='2025-01-27']){
  const bad=structuredClone(valid);mutate(bad.events[0]);assert.throws(()=>{current=replaceWorkspace(current,readWorkspaceBackup(encoded(bad)));});assert.deepEqual(current,original);
 }
 const flag=structuredClone(valid);flag.events[0].appearanceEmoji='🇨🇳';assert.doesNotThrow(()=>readWorkspaceBackup(encoded(flag)));
});
