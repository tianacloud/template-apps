import {validateRecord,validDate,uid,toKg,num} from './domain.js';
export function parseCSV(text) {
  const delimiter=text.split('\n')[0].includes(';')?';':',';const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===delimiter&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(x=>x.trim()))rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw new Error('CSV 引号不完整');row.push(field);if(row.some(x=>x.trim()))rows.push(row);return rows;
}
const hash = value => {let h=2166136261;for(const c of value)h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16);};
export function previewJSON(text,existing) {
  const input=JSON.parse(text);if(input.format!=='opengym-tiana'||input.version!==1||!Array.isArray(input.records)||input.records.length>10000)throw new Error('请选择本应用导出的 JSON 备份');
  const records=[],issues=[],seen=new Set();let skipped=0;
  input.records.forEach((r,i)=>{const k=`${r.kind}:${r.id}`;if(!/^[\w.:-]{1,160}$/.test(r.id||'')||!validateRecord(r.kind,r.payload,r.id)){issues.push(`第 ${i+1} 条记录无效`);return;}if(seen.has(k)||existing.has(k)){skipped++;return;}seen.add(k);records.push(r);});return {records,issues,skipped};
}
function csvDate(value) {const t=value.trim();if(validDate(t.slice(0,10)))return t.slice(0,10);const m=t.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);if(m){const d=`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;if(validDate(d))return d;}const d=new Date(t);if(!Number.isFinite(d.getTime()))return '';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function previewCSV(text,catalogue,existing) {
  const rows=parseCSV(text.replace(/^\uFEFF/,''));if(rows.length<2)throw new Error('CSV 中没有训练记录');if(rows.length>50000)throw new Error('每次最多导入 50000 行');
  const headers=rows.shift().map(s=>s.trim().toLowerCase().replace(/[_()]/g,' ').replace(/\s+/g,' ').trim());
  const find=(...names)=>headers.findIndex(h=>names.includes(h));
  const dateAt=find('date','start time','日期'),nameAt=find('exercise name','exercise','exercise title','动作'),weightAt=find('weight','weight kg','weight lb','重量'),repsAt=find('reps','repetitions','次数'),titleAt=find('workout name','title','routine','训练'),secondsAt=(find('seconds','duration seconds')>=0?find('seconds','duration seconds'):find('duration')),typeAt=find('set type','set order','set');
  if(dateAt<0||nameAt<0||(repsAt<0&&secondsAt<0))throw new Error('未识别训练 CSV，需要日期、动作名称和次数或时长列');
  const lookup=new Map(catalogue.flatMap(e=>[[e.name.toLowerCase(),e],[e.en?.toLowerCase(),e]]));const groups=new Map(),custom=new Map(),issues=[];
  rows.forEach((r,i)=>{
    const date=csvDate(r[dateAt]||''),name=(r[nameAt]||'').trim(),reps=num(r[repsAt]),sec=num(r[secondsAt]),w=num(r[weightAt]),title=(r[titleAt]||'导入的训练').slice(0,120);
    if(!date||!name||(!reps&&!sec)||w<0||w>2000||reps>10000){issues.push(`第 ${i+2} 行的日期、动作或数字无效`);return;}
    let exercise=lookup.get(name.toLowerCase());if(!exercise){const id='import-ex-'+hash(name.toLowerCase());exercise={id,name:name.slice(0,120),en:name,equipment:'',muscle:'abs',mode:sec&&!reps?'time':'reps',steps:[]};custom.set(id,exercise);}
    const key=date+'|'+(r[dateAt]||'')+'|'+title;let workout=groups.get(key);if(!workout){workout={id:'csv-'+hash(key),name:title,date,startedAt:new Date(date+'T12:00:00').getTime(),finishedAt:new Date(date+'T12:00:00').getTime(),duration:0,routineId:null,note:'从 CSV 导入',entries:[]};groups.set(key,workout);}
    let entry=workout.entries.find(e=>e.exerciseId===exercise.id);if(!entry){entry={id:uid(),exerciseId:exercise.id,name:exercise.name,muscle:exercise.muscle,mode:sec&&!reps?'time':'reps',rest:90,sets:[]};workout.entries.push(entry);}
    entry.sets.push({id:uid(),weight:toKg(w,headers[weightAt]?.includes('lb')?'lb':'kg'),reps:reps||sec,kind:/warmup|warm up|^w$/i.test(r[typeAt]||'')?'warmup':/drop/i.test(r[typeAt]||'')?'drop':'normal',rir:'',done:true});
  });
  const all=[...custom.values()].map(e=>({kind:'exercise',id:e.id,payload:e})).concat([...groups.values()].map(w=>({kind:'workout',id:w.id,payload:w})));let skipped=0;
  const records=all.filter(r=>{if(existing.has(`${r.kind}:${r.id}`)){skipped++;return false;}if(!validateRecord(r.kind,r.payload)){issues.push('部分训练超出允许范围，已跳过');return false;}return true;});return {records,issues,skipped};
}
