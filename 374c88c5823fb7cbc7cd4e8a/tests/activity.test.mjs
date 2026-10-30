import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleWorkspace} from '../src/rules.js';
import {eventIsActive,eventClock,calendarEventsForDay} from '../src/interface.js';

const timestamp=(day,hour,minute=0,second=0)=>new Date(2026,9,day,hour,minute,second).getTime();
const event=()=>({...sampleWorkspace('2026-10-24').events[0],id:'activity-boundary',date:'2026-10-24',time:'15:00',duration:2,pinned:false});

test('a multi-day activity starts at its selected time and hides the start countdown only then',()=>{
 const e=event();
 assert.equal(eventIsActive(e,timestamp(24,14,59,59)),false);
 assert.equal(eventClock(e,timestamp(24,14,59,59)),'0天 00:00:01');
 assert.equal(eventIsActive(e,timestamp(24,15)),true);
 assert.equal(eventClock(e,timestamp(24,15)),'');
 assert.equal(eventIsActive(e,timestamp(25,23,59,59)),true);
 assert.equal(eventIsActive(e,timestamp(26,0)),false);
 assert.equal(eventIsActive({...e,time:''},timestamp(24,11,59,59)),false);
 assert.equal(eventIsActive({...e,time:''},timestamp(24,12)),true);
});

test('calendar spans appear during the activity, while future multi-day plans mark their starting date',()=>{
 const e=event();
 assert.deepEqual(calendarEventsForDay([e],'2026-10-25',timestamp(24,14)),[]);
 assert.deepEqual(calendarEventsForDay([e],'2026-10-25',timestamp(24,15)).map(x=>x.id),[e.id]);
 const future={...e,date:'2026-10-30',time:'09:00'};
 assert.deepEqual(calendarEventsForDay([future],'2026-10-30',timestamp(24,1)).map(x=>x.id),[e.id]);
 assert.deepEqual(calendarEventsForDay([future],'2026-10-31',timestamp(24,1)),[]);
 assert.deepEqual(calendarEventsForDay([future],'2026-10-31',timestamp(31,10)).map(x=>x.id),[e.id]);
 assert.deepEqual(calendarEventsForDay([{...future,archived:true}],'2026-10-31',timestamp(31,10)),[]);
});
