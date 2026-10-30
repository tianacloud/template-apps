import { useMemo, useRef, useState } from 'react';
import { useApp, Dialog, Field, Form, SaveButton, ErrorNote, Icon, type Modal } from './ui';
import { ProjectEditor } from './project-editor';
import { type Entry, uid, minutesText, completionFor, remainingTask } from './model';
import { addDays, capacity, repeatDates, type Repeat, validDay, distance } from './dates';
import { makeEntry, complete, partialComplete, partialSuggestion, scheduleTask, scheduleEntry, removeEntry, applyReplan } from './actions';
import { previewReplan, editPreview } from './planning';
import { unusualActual } from './advanced';
import { exportCsv, exportIcs, download } from './exports';

function useEditor() {
  const app=useApp(),base=useRef(app.revision),[error,setError]=useState('');
  const save=async(fn:Parameters<typeof app.commit>[0])=>{
    try{await app.commit(fn,base.current);app.close();}catch(e){setError((e as Error).message);}
  };
  return {...app,error,setError,save};
}
function EntryEditor({id,date}:{id?:string;date?:string}) {
  const {data,busy,close,save,error,setError}=useEditor(),old=data.entries.find(e=>e.id===id);
  const [entry,setEntry]=useState<Entry>(()=>old?structuredClone(old):makeEntry({date:date??null}));
  const [rule,setRule]=useState<Repeat>('none'),[endDate,setEndDate]=useState(date?addDays(date,30):'');
  const [weekdays,setWeekdays]=useState<number[]>([]),[deleting,setDeleting]=useState(false);
  const record=old&&completionFor(data,old),[actual,setActual]=useState(record?.actual==null?'':String(record.actual)),[excluded,setExcluded]=useState(record?.excluded??false);
  let repeating:{dates:string[];truncated:boolean}|null=null,repeatError='';
  if(!old&&rule!=='none')try{repeating=repeatDates(entry.date??'',endDate,rule,weekdays);}catch(e){repeatError=(e as Error).message;}
  const patch=(value:Partial<Entry>)=>setEntry(v=>({...v,...value}));
  const submit=()=>{
    if(repeatError){setError(repeatError);return;}
    void save(s=>{
      const item={...entry,title:entry.title.trim()};
      if(item.start&&item.end){const a=item.start.split(':').map(Number),b=item.end.split(':').map(Number);item.minutes=b[0]*60+b[1]-a[0]*60-a[1];}
      if(old){
        s.entries=s.entries.map(e=>e.id===id?{...item,version:e.version+1}:e);
        const c=s.completions.find(c=>c.entryId===id);
        if(c){if(actual!==''&&(!Number.isSafeInteger(Number(actual))||Number(actual)<=0))throw new Error('实际用时须为正整数');c.actual=actual===''?null:Number(actual);c.excluded=excluded;}
      }else if(repeating){const seriesId=uid();s.entries.push(...repeating.dates.map(date=>({...item,id:uid(),date,seriesId})));}
      else s.entries.push(item);
    });
  };
  return <Dialog title={old?'编辑事项':'记下一件事'} onClose={()=>!busy&&close()} footer={<><span>{old&&<button className="danger-text" onClick={()=>setDeleting(true)}>删除事项</button>}</span><div className="row"><button onClick={close} disabled={busy}>取消</button><SaveButton form="entry-editor" onSave={submit} disabled={busy}>保存事项</SaveButton></div></>}>
    <Form id="entry-editor" onSave={submit}><fieldset disabled={busy}><ErrorNote error={error}/><Field label="事项标题"><input autoFocus aria-label="事项标题" required maxLength={80} placeholder="想推进什么？" value={entry.title} onChange={e=>patch({title:e.target.value})}/></Field><div className="form-grid"><Field label="安排日期" hint="留空先放进任务池"><input type="date" aria-label="安排日期" value={entry.date??''} onChange={e=>{patch({date:e.target.value||null});if(e.target.value&&!endDate)setEndDate(addDays(e.target.value,30));}}/></Field><Field label="预计分钟"><input aria-label="预计分钟" type="number" min={1} max={525600} disabled={entry.done} value={entry.minutes} onChange={e=>patch({minutes:Number(e.target.value)})}/></Field></div><div className="form-grid"><Field label="开始时间"><input type="time" aria-label="开始时间" disabled={entry.done} value={entry.start} onChange={e=>patch({start:e.target.value})}/></Field><Field label="结束时间" hint="填写时间段后按时段计算计划量"><input type="time" aria-label="结束时间" disabled={entry.done} value={entry.end} onChange={e=>patch({end:e.target.value})}/></Field></div><div className="form-grid"><Field label="关联项目"><select aria-label="关联项目" disabled={entry.done} value={entry.projectId??''} onChange={e=>patch({projectId:e.target.value||null,moduleId:null})}><option value="">独立事项</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="事项截止日"><input aria-label="事项截止日" type="date" value={entry.due??''} onChange={e=>patch({due:e.target.value||null})}/></Field></div><Field label="备注"><textarea aria-label="事项备注" maxLength={2000} value={entry.notes} placeholder="补充一点上下文…" onChange={e=>patch({notes:e.target.value})}/></Field>
      {!old&&<><Field label="重复"><select aria-label="重复规则" value={rule} onChange={e=>setRule(e.target.value as Repeat)}>{[['none','不重复'],['daily','每天'],['workdays','工作日'],['weekly','每周'],['biweekly','每两周'],['monthly','每月'],['custom','指定星期']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>{rule!=='none'&&<div className="inline-panel"><Field label="重复结束日"><input aria-label="重复结束日" type="date" required value={endDate} onChange={e=>setEndDate(e.target.value)}/></Field>{rule==='custom'&&<div className="weekday-picks">{[1,2,3,4,5,6,0].map(d=><label key={d}><input type="checkbox" checked={weekdays.includes(d)} onChange={e=>setWeekdays(v=>e.target.checked?[...v,d]:v.filter(x=>x!==d))}/>周{'日一二三四五六'[d]}</label>)}</div>}{repeating&&<p>共 {repeating.dates.length} 次 · {repeating.dates[0]} 至 {repeating.dates.at(-1)}{repeating.truncated?'（已达 120 次上限）':''}</p>}<ErrorNote error={repeatError}/></div>}</>}
      {record&&<div className="inline-panel"><h3>完成用时</h3><p>当时计划 {minutesText(record.planned)}</p><Field label="实际分钟" hint="留空按计划用时统计"><input type="number" min={1} aria-label="实际分钟" value={actual} onChange={e=>setActual(e.target.value)}/></Field><label className="check-label"><input type="checkbox" checked={excluded} onChange={e=>setExcluded(e.target.checked)}/>特殊情况，不参与估算校准</label></div>}
      {deleting&&<div className="confirm-panel" role="alert"><strong>删除「{entry.title}」？</strong><p>同时删除本次完成记录，其他重复事项保留。</p><div className="row"><button type="button" onClick={()=>setDeleting(false)}>取消删除</button><button type="button" className="danger" onClick={()=>void save(s=>removeEntry(s,entry.id))}>确认删除</button></div></div>}
    </fieldset></Form></Dialog>;
}
function CompleteEditor({entryId,taskId,partial=false}:{entryId?:string;taskId?:string;partial?:boolean}) {
  const {data,today,busy,close,save,error}=useEditor(),entry=data.entries.find(e=>e.id===entryId),task=data.tasks.find(t=>t.id===taskId);
  const total=entry?.minutes??(task?remainingTask(data,task):0),title=entry?.title??task?.title??'事项';
  const [amount,setAmount]=useState(partial?Math.max(1,Math.floor(total/2)):total),[actual,setActual]=useState(''),[excluded,setExcluded]=useState(false);
  const [customDate,setCustomDate]=useState<string|null>(null);
  const preview=useMemo(()=>{
    if(!partial||!entry||amount<=0||amount>=total||!Number.isInteger(amount))return null;
    return partialSuggestion(data,entry.id,amount,today);
  },[partial,entry,amount,total,data,today]);
  const suggested=preview?.changes[0]?.date??'',remainderDate=customDate??suggested;
  const submit=()=>void save(s=>{
    let id=entryId;
    if(!id&&taskId)id=scheduleTask(s,taskId,today)?.id;
    if(!id)throw new Error('没有可完成的工作，请刷新');
    if(partial&&preview)partialComplete(s,id,amount,actual===''?null:Number(actual),excluded,remainderDate||null,preview.fingerprint,today);
    else if(partial)throw new Error('本次完成量须小于当前计划量');
    else complete(s,id,actual===''?null:Number(actual),excluded,today);
  });
  return <Dialog title={partial?'记录一点进展':'完成这一步'} onClose={()=>!busy&&close()} footer={<div className="row"><button disabled={busy} onClick={close}>取消</button><SaveButton disabled={busy||partial&&!preview} form="complete-editor" onSave={submit}>确认{partial?'进度':'完成'}</SaveButton></div>}>
    <Form id="complete-editor" onSave={submit}><fieldset disabled={busy}><ErrorNote error={error}/><div className="completion-title"><span className="round-check"><Icon name="check" size={26}/></span><h3>{title}</h3><p>预计 {minutesText(total)} · 每一小步都算数</p></div>{partial&&<Field label="本次完成计划分钟" hint={`剩余 ${minutesText(Math.max(0,total-amount))}`}><input type="number" aria-label="本次完成计划分钟" min={1} max={total-1} required value={amount} onChange={e=>setAmount(Number(e.target.value))}/></Field>}
      <Field label="实际用了多少分钟？" hint="可以留空，按本次完成的计划量统计"><input autoFocus type="number" min={1} max={525600} aria-label="实际分钟" placeholder={String(amount)} value={actual} onChange={e=>setActual(e.target.value)}/></Field><div className="time-presets">{[.5,.75,1,1.25,1.5].map(r=><button key={r} type="button" className={Number(actual)===Math.max(1,Math.round(amount*r))?'selected':''} onClick={()=>setActual(String(Math.max(1,Math.round(amount*r))))}>{Math.max(1,Math.round(amount*r))} 分</button>)}</div><label className="check-label"><input type="checkbox" checked={excluded} onChange={e=>setExcluded(e.target.checked)}/>这次有特殊情况，不计入用时校准</label>{actual&&unusualActual(data,entry?.moduleId??task?.moduleId??null,Number(actual),entryId)&&<p className="notice">这次用时与历史平均差异较大；如果是特殊情况，可以排除校准，实际投入仍会保留。</p>}
      {partial&&<section className="inline-panel"><h3>余下的工作</h3><Field label="剩余安排到"><input type="date" aria-label="剩余安排到" min={today} value={remainderDate} onChange={e=>setCustomDate(e.target.value)}/></Field><div className="row"><button type="button" onClick={()=>setCustomDate(null)}>用建议日期</button><button type="button" onClick={()=>setCustomDate('')}>先放回任务池</button></div>{preview?.warnings.map(w=><p className="notice" key={w}>{w}</p>)}<small>{remainderDate?`剩余 ${minutesText(total-amount)} 安排到 ${remainderDate}`:'剩余工作保留在任务池'}</small></section>}
    </fieldset></Form></Dialog>;
}
function ScheduleEditor({entryId,taskId}:{entryId?:string;taskId?:string}) {
  const {data,today,busy,close,save,error}=useEditor(),entry=data.entries.find(e=>e.id===entryId),task=data.tasks.find(t=>t.id===taskId);
  const [date,setDate]=useState(entry?.date??today);
  return <Dialog title="给任务安排时间" onClose={()=>!busy&&close()} footer={<div className="row"><button disabled={busy} onClick={close}>取消</button><button disabled={busy} className="primary" onClick={()=>void save(s=>{if(taskId)scheduleTask(s,taskId,date||null);else if(entryId)scheduleEntry(s,entryId,date||null);})}>保存安排</button></div>}><ErrorNote error={error}/><h3>{entry?.title??task?.title}</h3><Field label="安排日期" hint="留空会放回任务池"><input type="date" aria-label="新的安排日期" value={date} onChange={e=>setDate(e.target.value)}/></Field><div className="row"><button onClick={()=>setDate(today)}>今天</button><button onClick={()=>setDate(addDays(today,1))}>明天</button><button onClick={()=>setDate('')}>放回任务池</button></div></Dialog>;
}
function ReplanEditor() {
  const {data,today,busy,close,save,error}=useEditor(),[preview,setPreview]=useState(()=>previewReplan(data,today));
  return <Dialog title="智能安排预览" wide onClose={()=>!busy&&close()} footer={<div className="row"><button disabled={busy} onClick={close}>取消</button><button className="primary" disabled={busy||!preview.changes.length} onClick={()=>void save(s=>applyReplan(s,preview))}>确认应用</button></div>}><p className="muted">参考未来 21 天的空余时间。确认后才会修改安排，项目期限保持原值。</p><ErrorNote error={error}/>{preview.warnings.map(w=><p className="notice" key={w}>{w}</p>)}{preview.changes.map(c=><div className="replan-row" key={c.id}><div><strong>{data.entries.find(e=>e.id===c.id)?.title}</strong><small>原安排 {c.previousDate??'未安排'} · {minutesText(c.minutes)}</small></div><Icon name="arrow" size={18}/><div><input type="date" min={today} aria-label={`调整日期：${data.entries.find(e=>e.id===c.id)?.title}`} value={c.date} disabled={busy} onChange={e=>{if(validDay(e.target.value))setPreview(editPreview(data,preview,c.id,e.target.value));}}/>{(c.pastTarget||c.pastDeadline)&&<small className="warning-text">{c.pastDeadline?'超过截止日':'进入缓冲期'}</small>}</div></div>)}{!preview.changes.length&&<p>没有可以调整的安排。</p>}<details className="capacity-details"><summary>查看每日容量与安排量</summary>{preview.days.filter(d=>d.load>0).map(d=><div className="small-entry" key={d.date}><span>{d.date}</span><strong className={d.load>d.capacity?'warning-text':''}>{minutesText(d.load)} / {minutesText(d.capacity)}</strong></div>)}</details></Dialog>;
}
function CapacityEditor({date}:{date:string}) {
  const {data,busy,close,save,error}=useEditor(),[value,setValue]=useState(capacity(date,data.settings));
  return <Dialog title="这一天，可以投入多少？" onClose={()=>!busy&&close()} footer={<div className="row"><button disabled={busy} onClick={()=>void save(s=>{delete s.settings.overrides[date];})}>恢复每周设置</button><button disabled={busy} className="primary" onClick={()=>void save(s=>{s.settings.overrides[date]=value;})}>保存容量</button></div>}><p>{date}</p><ErrorNote error={error}/><Field label="可投入分钟"><input type="number" min={0} max={1440} step={15} aria-label="可投入分钟" value={value} onChange={e=>setValue(Number(e.target.value))}/></Field><div className="time-presets">{[0,60,120,240,480].map(n=><button className={value===n?'selected':''} key={n} onClick={()=>setValue(n)}>{n===0?'休息日':`${n/60} 小时`}</button>)}</div><p className="muted">只修改这一天的容量，已有正数目标当天仍会保留。</p></Dialog>;
}
function SettingsEditor() {
  const {data,today,busy,close,save,error}=useEditor(),[settings,setSettings]=useState(()=>structuredClone(data.settings));
  return <Dialog title="找到自己的节奏" onClose={()=>!busy&&close()} footer={<div className="row"><button disabled={busy} onClick={close}>取消</button><SaveButton disabled={busy} form="settings-editor" onSave={()=>void save(s=>{s.settings=settings;})}>保存设置</SaveButton></div>}><Form id="settings-editor" onSave={()=>void save(s=>{s.settings=settings;})}><fieldset disabled={busy}><ErrorNote error={error}/><h3>时间偏好</h3><div className="form-grid"><Field label="时区"><input aria-label="时区" list="time-zones" value={settings.timeZone} onChange={e=>setSettings({...settings,timeZone:e.target.value})}/><datalist id="time-zones">{['Asia/Shanghai','Asia/Tokyo','Europe/London','America/New_York','America/Los_Angeles','Pacific/Kiritimati','UTC'].map(v=><option key={v} value={v}/>)}</datalist></Field><Field label="一天从几点开始"><select aria-label="业务日起点" value={settings.startHour} onChange={e=>setSettings({...settings,startHour:Number(e.target.value)})}>{Array.from({length:11},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></Field></div><h3>每周可投入时间</h3><p className="muted">以分钟填写，0 表示休息日。</p><div className="weekly-settings">{[1,2,3,4,5,6,0].map(d=><Field key={d} label={`周${'日一二三四五六'[d]}`}><input aria-label={`周${'日一二三四五六'[d]}可投入分钟`} type="number" min={0} max={1440} step={15} value={settings.weekly[d]} onChange={e=>setSettings({...settings,weekly:settings.weekly.map((n,i)=>i===d?Number(e.target.value):n)})}/></Field>)}</div><label className="setting-check"><span><strong>均衡每日建议</strong><small>根据容量比例与其他项目的负载分配</small></span><input type="checkbox" checked={settings.balance} onChange={e=>setSettings({...settings,balance:e.target.checked})}/></label><label className="setting-check"><span><strong>中国大陆节假日默认休息</strong><small>包含 2025–2026 年公布的假期；调休工作日由个人设置</small></span><input type="checkbox" checked={settings.holidayRest} onChange={e=>setSettings({...settings,holidayRest:e.target.checked})}/></label>{!['2025','2026'].includes(today.slice(0,4))&&settings.holidayRest&&<p className="notice">当前年份未包含节假日数据，请使用单日容量覆盖安排假期。</p>}<label className="setting-check"><span><strong>完成时询问实际用时</strong><small>关闭后按计划用时记录；仍可在事项中修改</small></span><input type="checkbox" checked={settings.askActual} onChange={e=>setSettings({...settings,askActual:e.target.checked})}/></label><h3>单日覆盖</h3>{Object.keys(settings.overrides).length?Object.entries(settings.overrides).sort().map(([d,n])=><div className="small-entry" key={d}><span>{d} · {minutesText(n)}</span><button type="button" className="text-button" onClick={()=>{const overrides={...settings.overrides};delete overrides[d];setSettings({...settings,overrides});}}>恢复周设置</button></div>):<p className="muted">在今日或日历里调整单日容量。</p>}</fieldset></Form></Dialog>;
}
function ExportEditor() {
  const {data,today,close,demo}=useApp(),[from,setFrom]=useState(addDays(today,-29)),[to,setTo]=useState(today),[error,setError]=useState('');
  const run=(format:'csv'|'ics')=>{try{if(!validDay(from)||!validDay(to)||distance(from,to)<0)throw new Error('请选择有效的日期区间');const text=format==='csv'?exportCsv(data,from,to):exportIcs(data,from,to);download(text,`日积-${from}-${to}.${format}`,format==='csv'?'text/csv;charset=utf-8':'text/calendar;charset=utf-8');setError('');}catch(e){setError((e as Error).message);}};
  return <Dialog title="带走你的投入记录" onClose={close}><p className="muted">{demo?'安装应用后可导出文件；这里展示可选择的格式。':'选择日期范围，在此设备生成文件。'}</p><div className="form-grid"><Field label="开始日期"><input aria-label="导出开始日" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></Field><Field label="结束日期"><input aria-label="导出结束日" type="date" value={to} onChange={e=>setTo(e.target.value)}/></Field></div><ErrorNote error={error}/><div className="export-options"><button disabled={demo} onClick={()=>run('csv')}><Icon name="tasks" size={25}/><strong>表格 CSV</strong><span>事项、项目、计划与实际用时</span><Icon name="export"/></button><button disabled={demo} onClick={()=>run('ics')}><Icon name="calendar" size={25}/><strong>日历 ICS</strong><span>导入你常用的日历工具</span><Icon name="export"/></button></div><p className="muted">只导出所选区间中已安排日期的事项。</p></Dialog>;
}
export function Editors({modal}:{modal:Modal}) {
  switch(modal.kind){
    case 'project':return <ProjectEditor id={modal.id}/>;
    case 'entry':return <EntryEditor id={modal.id} date={modal.date}/>;
    case 'complete':return <CompleteEditor {...modal}/>;
    case 'schedule':return <ScheduleEditor {...modal}/>;
    case 'replan':return <ReplanEditor/>;
    case 'settings':return <SettingsEditor/>;
    case 'capacity':return <CapacityEditor date={modal.date}/>;
    case 'export':return <ExportEditor/>;
  }
}
