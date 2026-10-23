import test from 'node:test';
import assert from 'node:assert/strict';
import {parseEvent,nextOccurrence,calendarInfo,distance,cents,streak,orderEvents,sampleWorkspace,validateWorkspace} from '../src/rules.js';
test('every Tuesday/Thursday chooses all weekdays and retains later weekday in current week',()=>{const e=parseEvent('每周二、四 练琴','2026-10-21');assert.equal(e.date,'2026-10-22');assert.equal(nextOccurrence(e,'2026-10-21'),'2026-10-22');assert.equal(nextOccurrence(e,'2026-10-23'),'2026-10-27');assert.equal(nextOccurrence(e,'2026-10-28'),'2026-10-29');});
test('monthly day 31 clamps February and restores March day 31',()=>{const e=parseEvent('每月31日 对账','2026-02-20');assert.equal(e.date,'2026-02-28');assert.equal(e.monthDay,31);assert.equal(nextOccurrence(e,'2026-03-01'),'2026-03-31');assert.equal(nextOccurrence(e,'2026-04-01'),'2026-04-30');const past=parseEvent('每月31日 对账','2026-02-28');assert.equal(nextOccurrence(past,'2026-03-01'),'2026-03-31');});
test('explicit relative year applies before month/day rollover',()=>{assert.equal(parseEvent('明年3月5日 复查','2026-01-10').date,'2027-03-05');assert.equal(parseEvent('后年3月5日 复查','2026-01-10').date,'2028-03-05');assert.equal(parseEvent('今年3月5日 复查','2026-10-21').date,'2026-03-05');assert.equal(parseEvent('去年3月5日 复查','2026-01-10').date,'2025-03-05');});
test('clock and exact date parser retain literal date and reject invalid inputs',()=>{const e=parseEvent('明天下午3点 合成面试','2026-10-22');assert.equal(e.date,'2026-10-23');assert.equal(e.time,'15:00');assert.equal(e.prep,14);assert.throws(()=>parseEvent('2026-02-31 见面','2026-01-01'));assert.throws(()=>parseEvent('有空读书','2026-01-01'));});
test('lunar calendar, calendar-day distance and money are deterministic',()=>{assert.equal(calendarInfo('2026-10-22').lunar,'九月十三');assert.equal(distance('2026-03-07','2026-03-09'),2);assert.equal(cents('0.29'),29);assert.equal(cents('1.10'),110);assert.throws(()=>cents('0.001'));});
test('check-ins are counted by the declared daily/weekly schedule',()=>{assert.equal(streak({frequency:'weekdays',target:1,checkins:['2026-10-16','2026-10-19']},'2026-10-19'),2);assert.equal(streak({frequency:'weekly',target:2,checkins:['2026-10-19','2026-10-20']},'2026-10-22'),1);assert.doesNotThrow(()=>validateWorkspace(sampleWorkspace('2026-10-22')));});

test('daily streak requires today while weekday streak skips the weekend',()=>{
 const friday=['2026-10-23'];
 assert.equal(streak({frequency:'daily',checkins:friday},'2026-10-24'),0);
 assert.equal(streak({frequency:'weekdays',checkins:friday},'2026-10-24'),1);
 assert.equal(streak({frequency:'weekdays',checkins:friday},'2026-10-26'),0);
 assert.equal(streak({frequency:'daily',checkins:[...friday,'2026-10-24']},'2026-10-24'),2);
});

test('event order prioritizes pins and ongoing plans then absolute day distance',()=>{
 const event=(id,date,extra={})=>({...sampleWorkspace('2026-10-24').events[0],id,title:id,date,time:'',duration:1,pinned:false,...extra});
 const rows=[event('old','2026-10-01'),event('yesterday','2026-10-23'),event('tomorrow','2026-10-25'),event('ongoing','2026-10-23',{duration:3}),event('pinned','2027-01-01',{pinned:true})];
 assert.deepEqual(orderEvents(rows,'2026-10-24').map(e=>e.id),['pinned','ongoing','yesterday','tomorrow','old']);
 assert.deepEqual(rows.map(e=>e.id),['old','yesterday','tomorrow','ongoing','pinned']);
});
