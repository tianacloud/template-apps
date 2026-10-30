import {validPhoto} from './photos.js';
export const uid = () => globalThis.crypto?.randomUUID?.() || Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
export const clone = value => JSON.parse(JSON.stringify(value));
export const today = () => dateISO(new Date());
export function dateISO(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function addDays(d,n) { const x=new Date(`${d}T12:00:00`);x.setDate(x.getDate()+n);return dateISO(x); }
export const daysAgo = (d,ref=today()) => Math.round((new Date(ref+'T12:00:00')-new Date(d+'T12:00:00'))/86400000);
export const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s||'') && dateISO(new Date(s+'T12:00:00'))===s;
export const num = (v,fallback=0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
export const fmt = v => Number(v||0).toLocaleString('zh-CN',{maximumFractionDigits:1});
export const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
export const kgTo = (v,unit='kg') => unit==='lb' ? v*2.2046226218 : v;
export const toKg = (v,unit='kg') => unit==='lb' ? v/2.2046226218 : v;
export const round = n => Math.round(n*100)/100;
export const MUSCLES = {chest:'胸部',back:'背部',shoulders:'肩部',biceps:'肱二头肌',triceps:'肱三头肌',forearms:'前臂',abs:'核心',quads:'股四头肌',hamstrings:'腘绳肌',glutes:'臀部',calves:'小腿',cardio:'心肺'};
export const EQUIPMENT = {'body weight':'徒手',barbell:'杠铃',dumbbell:'哑铃',cable:'绳索',leverage:'固定器械','leverage machine':'固定器械','smith machine':'史密斯',kettlebell:'壶铃',band:'弹力带','resistance band':'弹力带','assisted':'辅助器械','stability ball':'健身球','weighted':'负重','roller':'滚轮','rope':'绳索','wheel roller':'腹肌轮','sled machine':'倒蹬机','medicine ball':'药球','olympic barbell':'奥杆','trap bar':'六角杠'};
export function muscleOf(raw='') {
  const s=raw.toLowerCase();
  if (/pector|chest/.test(s)) return 'chest'; if (/lat|back|trap|rhomboid/.test(s)) return 'back';
  if (/delt|shoulder/.test(s)) return 'shoulders'; if (/bicep/.test(s)) return 'biceps'; if (/tricep/.test(s)) return 'triceps';
  if (/forearm|brachiorad/.test(s)) return 'forearms'; if (/quad|adductor|sartorius/.test(s)) return 'quads';
  if (/hamstring/.test(s)) return 'hamstrings'; if (/glut/.test(s)) return 'glutes'; if (/calf|calve|soleus/.test(s)) return 'calves';
  if (/cardio/.test(s)) return 'cardio'; return 'abs';
}
export function modeOf(e={}) { if (e.mode) return e.mode; if (/cardio/.test(e.category)||/stationary bike|treadmill|elliptical|running|walking/.test(e.en||'')) return 'cardio';if (/plank|dead hang|wall sit/.test(e.en||'')) return 'time'; return 'reps'; }
export const defaultConfig = e => ({exerciseId:e.id,mode:modeOf(e),sets:3,reps:modeOf(e)==='time'?30:modeOf(e)==='cardio'?15:10,weight:0,speed:0,rest:90,policy:'off',increment:2.5,min:8,max:12,super:''});
export const countDone = w => (w.entries||[]).reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);
export const workSets = e => (e.sets||[]).filter(s=>s.kind!=='warmup');
export const volume = w => (w.entries||[]).reduce((n,e)=>n+(e.mode==='reps'?workSets(e).filter(s=>s.done).reduce((s,x)=>s+num(x.weight)*num(x.reps),0):0),0);
export function oneRM(weight,reps) { return Number.isFinite(weight)&&Number.isInteger(reps)&&weight>0&&reps>0&&reps<=12 ? round(reps===1?weight:weight*(1+reps/30)) : null; }
export const completedAll = (entry,config) => {
  const sets=workSets(entry);const count=entry.target?.sets??config.sets;const target=entry.target?.reps??config.reps;
  return sets.length>=count && sets.slice(0,count).every(s=>s.done && num(s.reps)>=target);
};
export function prescription(config,workouts,routineId) {
  const past=workouts.filter(w=>w.routineId===routineId && w.entries?.some(e=>e.exerciseId===config.exerciseId)).sort((a,b)=>(b.date+b.id).localeCompare(a.date+a.id));
  const entries=past.map(w=>w.entries.find(e=>e.exerciseId===config.exerciseId));const prev=entries[0];
  if (!prev) return {...config,reason:'首次训练，使用计划目标'};
  const performed=workSets(prev).filter(s=>s.done);const base=performed.at(-1)?.weight??config.weight;
  let result={...config,weight:base,reason:'沿用上次实际重量'};
  if (config.policy==='off'||config.mode==='cardio') return result;
  if (entries.length>=3 && entries.slice(0,3).every(e=>!completedAll(e,config))) return {...result,weight:round(base*0.9),reason:'连续三次未达标，建议减重 10%'};
  if (!completedAll(prev,config)) return {...result,reason:'上次未完成全部目标，保持重量'};
  if (config.policy==='time') return {...result,reps:(prev.target?.reps??config.reps)+(config.increment||5),reason:'上次全部达标，增加计时时长'};
  if (config.policy==='double') {
    const top=config.max||12,low=config.min||8;
    const hitTop=workSets(prev).slice(0,prev.target?.sets??config.sets).every(s=>s.done&&s.reps>=top);
    return hitTop?{...result,weight:round(base+config.increment),reps:low,reason:'全部达到次数上界，加重并回到下界'}:{...result,reps:Math.min(top,(prev.target?.reps??config.reps)+1),reason:'上次全部达标，先增加一次'};
  }
  return {...result,weight:round(base+config.increment),reason:'上次所有目标均完成，增加设定重量'};
}
export function startSession(routine,workouts,catalogue) {
  return {id:uid(),name:routine?.name||'自由训练',routineId:routine?.id||null,date:today(),startedAt:Date.now(),duration:0,note:'',entries:(routine?.exercises||[]).map(c=>{
    const e=catalogue.get(c.exerciseId)||{id:c.exerciseId,name:'自定义动作',muscle:'abs'};
    const p=prescription(c,workouts,routine.id);
    return {id:uid(),exerciseId:e.id,name:e.name,muscle:muscleOf(e.muscle),equipment:e.equipment,mode:c.mode||modeOf(e),target:{...clone(c),reps:p.reps,weight:p.weight},reason:p.reason,rest:c.rest,super:c.super||'',sets:Array.from({length:c.sets},()=>({id:uid(),weight:p.weight,reps:p.reps,speed:c.speed||0,rir:'',kind:'normal',done:false}))};
  })};
}
export const finishSession = w => ({...clone(w),entries:w.entries.map(e=>({...e,sets:e.sets.filter(s=>s.done)})).filter(e=>e.sets.length),duration:w.editing?w.duration:Math.max(1,Math.round((Date.now()-w.startedAt)/1000)),finishedAt:Date.now(),editing:undefined});
const starterData = {
  ppl:[['推日 · 胸肩三头',[['0025',4,8],['0047',3,10],['0426',3,10],['0334',3,12],['0241',3,12]]],['拉日 · 背部二头',[['2330',4,10],['0027',4,8],['1323',3,10],['0031',3,10],['0313',3,12]]],['腿日 · 下肢',[['0043',4,8],['0085',3,10],['0739',3,12],['0585',3,12],['0605',4,15]]]],
  upper:[['上肢 A',[['0025',3,8],['2330',3,10],['0047',2,10],['1323',2,10],['0334',2,12]]],['下肢 A',[['0043',3,8],['0085',3,8],['0739',2,10],['0586',2,12]]],['上肢 B',[['0047',3,8],['0027',3,8],['0426',2,10],['0241',2,12]]],['下肢 B',[['0739',3,10],['0085',2,10],['0585',2,12],['0605',3,15]]]],
  full:[['全身 A',[['0043',3,8],['0025',3,8],['2330',3,10],['0334',2,12]]],['全身 B',[['0085',3,8],['0047',3,10],['1323',3,10],['0585',2,12]]],['全身 C',[['0739',3,10],['0025',2,10],['0027',3,10],['0605',3,15]]]],
  five:[['5×5 A',[['0043',5,5],['0025',5,5],['0027',5,5]]],['5×5 B',[['0085',1,5],['0047',5,5],['2330',5,5]]]]
};
export function starter(type,catalogue) { return (starterData[type]||starterData.full).map(([name,entries],i)=>({id:uid(),name,color:['#b3ee62','#82b8ff','#f2ad66','#c3a1ff'][i%4],days:(type==='upper'?[1,2,4,5]:[1,3,5]).filter((_,n)=>type==='five'?n%2===i:n===i),exercises:entries.map(([id,sets,reps])=>({...defaultConfig(catalogue.get(id)||{id}),sets,reps,policy:'linear'})),createdAt:Date.now()+i})); }
export function nextRoutine(routines,workouts,mode='weekly',date=today(),override) {
  if (override!==undefined) return routines.find(r=>r.id===override)||null;
  if (mode==='rotation') { const recent=workouts.filter(w=>routines.some(r=>r.id===w.routineId)).sort((a,b)=>(b.date+b.finishedAt).localeCompare(a.date+a.finishedAt))[0];return routines[(routines.findIndex(r=>r.id===recent?.routineId)+1)%routines.length]||null; }
  return routines.find(r=>r.days.includes(new Date(date+'T12:00:00').getDay()))||null;
}
export function muscleTotals(workouts,range=7) { const map={};for(const w of workouts.filter(w=>daysAgo(w.date)>=0&&daysAgo(w.date)<range)) for(const e of w.entries||[]) {const n=workSets(e).filter(s=>s.done).length;map[e.muscle]=(map[e.muscle]||0)+n;}return map; }
export function validateRecord(kind,value,id) {
  if (!value || typeof value!=='object'||Array.isArray(value)) return false;
  if (kind==='setting') {
    const v=value.value;
    if(!Object.hasOwn(value,'value')||(!['string','number','boolean'].includes(typeof v)&&v!==null))return false;
    if(id==='name')return typeof v==='string'&&v.trim().length>0&&v.length<=40;
    if(id==='unit')return ['kg','lb'].includes(v);
    if(id==='weekStart')return [0,1].includes(v);
    if(id==='schedule')return ['weekly','rotation'].includes(v);
    if(id==='exerciseView')return ['list','cards'].includes(v);
    if(id==='mediaSize')return ['full','mini','off'].includes(v);
    if(id==='goal')return v===null||(Number.isFinite(v)&&v>0&&v<=700);
    return id===undefined&&JSON.stringify(value).length<10000;
  }
  if (kind==='weight') return validDate(value.date)&&Number.isFinite(value.weight)&&value.weight>0&&value.weight<=700;
  if (kind==='routine') return typeof value.name==='string'&&value.name.length>0&&value.name.length<=120&&Array.isArray(value.days)&&value.days.every(x=>Number.isInteger(x)&&x>=0&&x<=6)&&Array.isArray(value.exercises)&&value.exercises.length<=100&&value.exercises.every(e=>typeof e.exerciseId==='string'&&e.sets>=1&&e.sets<=30&&e.reps>0&&e.reps<=10000&&num(e.weight)>=0&&num(e.weight)<=2000&&e.rest>=0&&e.rest<=900);
  if (kind==='workout'||kind==='active') return typeof value.name==='string'&&value.name.length<=120&&validDate(value.date)&&Array.isArray(value.entries)&&value.entries.length<=100&&value.entries.every(e=>typeof e.exerciseId==='string'&&typeof e.name==='string'&&['reps','time','cardio'].includes(e.mode)&&Array.isArray(e.sets)&&e.sets.length<=100&&e.sets.every(s=>typeof s.done==='boolean'&&Number.isFinite(s.reps)&&s.reps>0&&s.reps<=10000&&Number.isFinite(s.weight)&&s.weight>=0&&s.weight<=2000&&(s.rir===''||s.rir==null||(num(s.rir)>=0&&num(s.rir)<=10))));
  if (kind==='exercise') return typeof value.id==='string'&&typeof value.name==='string'&&value.name.length>0&&value.name.length<=120&&['reps','time','cardio'].includes(value.mode);
  if (kind==='override') return validDate(value.date)&&(value.routineId===null||typeof value.routineId==='string');
  if (kind==='photo') return validDate(value.date)&&validPhoto(value);
  return false;
}
