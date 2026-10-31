import { addDays, dayKey, minuteKey } from './domain.js';
export const demo = true;
let events, tags, records;
const today = dayKey();
const at = (offset, time='09:30') => `${addDays(today,offset)}T${time}`;
export function resetDemo() {
  tags = [{id:'home',name:'家务清洁'},{id:'plants',name:'绿植养护'},{id:'care',name:'个人护理'},{id:'reading',name:'自我充电'}];
  events = [
    {id:'water',name:'给绿植浇水',interval_days:3,first_due:today,tags:['plants'],icon:'plant',color:'green',archived:0,created_at:at(-90)},
    {id:'sheets',name:'换洗床单',interval_days:14,first_due:today,tags:['home'],icon:'shirt',color:'orange',archived:0,created_at:at(-90)},
    {id:'fridge',name:'清理冰箱',interval_days:30,first_due:today,tags:['home'],icon:'sparkles',color:'blue',archived:0,created_at:at(-90)},
    {id:'vacuum',name:'给家里吸尘',interval_days:7,first_due:today,tags:['home'],icon:'home',color:'green',archived:0,created_at:at(-90)},
    {id:'toothbrush',name:'更换牙刷',interval_days:90,first_due:today,tags:['care'],icon:'heart',color:'pink',archived:0,created_at:at(-90)},
    {id:'read',name:'留点时间读书',interval_days:2,first_due:today,tags:['reading'],icon:'book',color:'purple',archived:0,created_at:at(-90)},
    {id:'old',name:'给阳台换盆',interval_days:180,first_due:today,tags:['plants'],icon:'plant',color:'green',archived:1,created_at:at(-180)},
  ];
  records = [];
  for (let i=0;i<16;i++) records.push({id:`w${i}`,event_id:'water',occurred_at:at(-4-i*3,i%2?'18:15':'09:30'),duration:10,note:i===0?'土壤已经干了，给龟背竹和琴叶榕浇透水。':i===1?'顺便擦了擦叶子，今天又长出一片新叶。':'',photos:[],created_at:at(-4-i*3)});
  for (const [key,offset,interval,duration,note] of [['sheets',-14,14,35,'换上了晒过太阳的床单。'],['fridge',-21,30,45,'整理了冷藏区，把快到期的食物放在前面。'],['vacuum',-5,7,25,'客厅和卧室都清理好了。'],['toothbrush',-45,90,2,'换了一支软毛牙刷。'],['read',-1,2,30,'读了几页喜欢的书。']]) for(let i=0;i<4;i++) records.push({id:`${key}${i}`,event_id:key,occurred_at:at(offset-i*interval,'20:10'),duration,note:i===0?note:'',photos:[],created_at:at(offset-i*interval)});
}
resetDemo();
export async function loadHome() { return { events:events.map(e=>({...e,tags:[...e.tags],count:records.filter(r=>r.event_id===e.id).length,minutes:records.filter(r=>r.event_id===e.id).reduce((n,r)=>n+r.duration,0),last_at:records.filter(r=>r.event_id===e.id).sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at))[0]?.occurred_at||null})),tags:tags.map(t=>({...t})) }; }
export async function saveEvent(event) { const index=events.findIndex(e=>e.id===event.id); if(index<0) events.push({...event,tags:[...event.tags]}); else events[index]={...event,tags:[...event.tags]}; }
export async function saveTag(tag) { if(tags.some(t=>t.name===tag.name&&t.id!==tag.id))throw new Error('已经有这个标签了。'); const index=tags.findIndex(t=>t.id===tag.id);if(index<0)tags.push({...tag});else tags[index]={...tag}; }
export async function deleteTag(id) { tags=tags.filter(t=>t.id!==id); }
export async function loadHistory(id,range,offset=0) { const rows=records.filter(r=>r.event_id===id&&r.occurred_at.slice(0,10)>=range.start&&r.occurred_at.slice(0,10)<=range.end).sort((a,b)=>b.occurred_at.localeCompare(a.occurred_at)||b.id.localeCompare(a.id));const counts={};for(const r of rows)counts[r.occurred_at.slice(0,10)]=(counts[r.occurred_at.slice(0,10)]||0)+1;return {records:rows.slice(offset,offset+40).map(r=>({...r,photos:[...r.photos]})),counts:Object.entries(counts).map(([day,count])=>({day,count})),total:rows.length,minutes:rows.reduce((n,r)=>n+r.duration,0)}; }
export async function saveRecord(record) { const index=records.findIndex(r=>r.id===record.id);if(index<0)records.push({...record,photos:[...record.photos]});else records[index]={...record,photos:[...record.photos]}; }
export async function deleteRecord(id) { records=records.filter(r=>r.id!==id); }
