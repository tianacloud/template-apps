import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuickEntry} from '../src/quick-entry.js';
import {sampleWorkspace} from '../src/rules.js';
import {renderEvents,renderCalendar,selectEventCategory} from '../src/interface.js';

test('choosing a quick-entry category replaces an inferred icon without changing the schedule',()=>{
 const draft=parseQuickEntry('明天15点 面试','2026-10-24').draft;
 const original=structuredClone(draft);
 const selected=selectEventCategory(draft,'travel');
 assert.equal(draft.appearanceEmoji,'📝');
 assert.equal(selected.appearanceEmoji,'✈️');
 assert.equal(selected.appearanceCategory,'travel');
 assert.equal(selected.date,original.date);
 assert.equal(selected.time,original.time);
 assert.deepEqual(draft,original);
});

test('an existing event retains its explicit icon and fills only a missing icon',()=>{
 const draft=parseQuickEntry('明天 婚礼','2026-10-24').draft;
 assert.equal(draft.appearanceEmoji,'💍');
 assert.equal(selectEventCategory(draft,'travel',true).appearanceEmoji,'💍');
 delete draft.appearanceEmoji;
 assert.equal(selectEventCategory(draft,'travel',true).appearanceEmoji,'✈️');
});

test('a missing event icon stays optional and the main card uses its neutral fallback',()=>{
 const draft=parseQuickEntry('2099年10月25日 项目回顾','2026-10-24').draft;
 assert.equal(draft.appearanceEmoji,undefined);
 const render=e=>renderEvents({all:[e],list:[e],settings:{quote:false,menu:false,festivalSuggestions:false},archived:false});
 const neutral=render(draft);
 assert.match(neutral,/class="hero-emoji">⭐️<\/div>/);
 assert.match(neutral,/class="event-title">📌 项目回顾<\/div>/);
 assert.match(render(selectEventCategory(draft,'birthday')),/class="hero-emoji">🎂<\/div>/);
 const legacy={...draft,category:'出行',appearanceCategory:'travel'};
 const workspace=sampleWorkspace('2099-10-25');workspace.events=[legacy];
 assert.match(render(legacy),/class="event-title">✈️ 项目回顾<\/div>/);
 assert.match(renderCalendar({w:workspace,month:'2099-10',selectedDay:'2099-10-25'}),/class="grow">📌 项目回顾<\/span>/);
});
