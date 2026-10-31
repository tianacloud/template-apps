import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, dayDistance, due, rangeFor, bucketsFor, shiftAnchor } from '../src/domain.js';
test('reminders use latest completion or first reminder and survive month boundaries',()=>{
  assert.equal(due({interval_days:3,last_at:'2026-01-30T09:31'},'2026-02-01').date,'2026-02-02');
  assert.equal(due({interval_days:7,first_due:'2026-10-15'},'2026-10-16').label,'已逾期 1 天');
  assert.equal(due({interval_days:7,last_at:'2026-10-09T09:31'},'2026-10-16').state,'today');
  assert.equal(addDays('2024-02-28',1),'2024-02-29');
  assert.equal(dayDistance('2026-03-07','2026-03-09'),2);
});
test('day, week, month and year use the requested calendar ranges',()=>{
  assert.deepEqual(rangeFor('day','2026-10-16'),{start:'2026-10-10',end:'2026-10-16'});
  assert.deepEqual(rangeFor('week','2026-10-18'),{start:'2026-10-12',end:'2026-10-18'});
  assert.deepEqual(rangeFor('month','2024-02-29'),{start:'2024-02-01',end:'2024-02-29'});
  assert.deepEqual(rangeFor('year','2026-10-16'),{start:'2026-01-01',end:'2026-12-31'});
  assert.throws(()=>rangeFor('custom','2026-10-16',{start:'2026-10-17',end:'2026-10-16'}));
  assert.equal(shiftAnchor('month','2026-01-31',1),'2026-02-01');
});
test('charts retain zero days, multiple completions and all twelve months',()=>{
  const counts=[{day:'2026-10-01',count:'2'},{day:'2026-10-03',count:'1'}];
  const daily=bucketsFor({start:'2026-10-01',end:'2026-10-03'},counts,'custom');
  assert.deepEqual(daily.map(b=>b.count),[2,0,1]);
  const monthly=bucketsFor(rangeFor('year','2026-10-16'),counts,'year');
  assert.equal(monthly.length,12); assert.equal(monthly[9].count,3); assert.equal(monthly[0].count,0);
});
