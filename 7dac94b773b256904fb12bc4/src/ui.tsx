import { createContext, useContext, useEffect, useRef, useId, type ReactNode } from 'react';
import type { Workspace, Entry, Task } from './model';
import { minutesText, projectWork, remainingTask, spent } from './model';
import type { Repository } from './storage';
import { businessDay } from './dates';

export type Modal =
  | {kind:'project';id?:string}
  | {kind:'entry';id?:string;date?:string}
  | {kind:'complete';entryId?:string;taskId?:string;partial?:boolean}
  | {kind:'schedule';entryId?:string;taskId?:string}
  | {kind:'replan'}
  | {kind:'settings'}
  | {kind:'export'}
  | {kind:'capacity';date:string};
export interface AppContext {
  data: Workspace; revision: number; today: string; date: string; busy: boolean; demo: boolean;
  repository: Repository; setDate(date:string):void; open(modal:Modal):void; close():void;
  commit(change:(s:Workspace)=>void, expected?:number):Promise<void>;
  navigate(page:string):void;
}
export const Context = createContext<AppContext | null>(null);
export function useApp() {const c=useContext(Context);if(!c)throw new Error('应用尚未就绪');return c;}
const paths: Record<string,string> = {
  today:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17m10-10 1.4-1.4 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  calendar:'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2M7 2v4m10-4v4M3 10h18M7 14h2m4 0h4m-10 4h2',
  projects:'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 3h18',
  tasks:'M9 5h12M9 12h12M9 19h12M2 5l2 2 3-4M2 12l2 2 3-4M2 19l2 2 3-4',
  stats:'M4 3v18h18M8 17v-5m5 5V7m5 10V4',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  export:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  plus:'M12 4v16M4 12h16', close:'M6 6l12 12M6 18 18 6', check:'m5 12 4 4L19 6',
  left:'m15 5-7 7 7 7',right:'m9 5 7 7-7 7',refresh:'M20 8a8 8 0 1 0 0 8M20 3v5h-5',
  arrow:'M4 12h16m-6-6 6 6-6 6',clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  edit:'m4 16 11-11 4 4L8 20H4v-4ZM13 7l4 4',search:'M15.5 15.5 21 21M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
};
export function Icon({name,size=20}:{name:string;size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] ?? paths.tasks}/></svg>;
}
export function Dialog({title,children,footer,onClose,wide=false}:{title:string;children:ReactNode;footer?:ReactNode;onClose:()=>void;wide?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null),titleId=useId();
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    ref.current?.showModal();
    return ()=>{ref.current?.close();previous?.focus();};
  },[]);
  return <dialog ref={ref} aria-labelledby={titleId} className={wide?'wide':''} onCancel={e=>{e.preventDefault();onClose();}}>
    <header className="dialog-head"><div><span className="eyebrow">日积 / MAKE PROGRESS</span><h2 id={titleId}>{title}</h2></div><button className="icon-button" aria-label="关闭窗口" onClick={onClose}><Icon name="close"/></button></header>
    <div className="dialog-body">{children}</div>{footer && <footer className="dialog-foot">{footer}</footer>}
  </dialog>;
}
export function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}) {
  return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;
}
function saveValidForm(id:string,save:()=>void) {
  const form=document.getElementById(id) as HTMLFormElement|null;
  if(form?.reportValidity())save();
}
export function Form({id,onSave,children}:{id:string;onSave:()=>void;children:ReactNode}) {
  return <form id={id} onSubmit={e=>e.preventDefault()} onKeyDown={e=>{
    if(e.key==='Enter'&&!e.nativeEvent.isComposing&&e.target instanceof HTMLInputElement&&
      !['checkbox','radio','color','file','range'].includes(e.target.type)){
      e.preventDefault();saveValidForm(id,onSave);
    }
  }}>{children}</form>;
}
export function SaveButton({form,onSave,disabled,children}:{form:string;onSave:()=>void;disabled:boolean;children:ReactNode}) {
  // Explicit local actions also work in an iframe without allow-forms.
  return <button type="button" className="primary" disabled={disabled} onClick={()=>saveValidForm(form,onSave)}>{children}</button>;
}
export function Empty({title,detail,action}:{title:string;detail?:string;action?:ReactNode}) {
  return <div className="empty"><div className="empty-icon"><Icon name="calendar" size={28}/></div><h3>{title}</h3>{detail&&<p>{detail}</p>}{action}</div>;
}
export function ErrorNote({error}:{error:string}) {return error?<p className="error" role="alert">{error}</p>:null;}
export function Progress({value,label}:{value:number;label:string}) {
  return <div className="progress" role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>;
}
export function ProjectProgress({id}:{id:string}) {
  const {data}=useApp(),w=projectWork(data,id),ratio=w.total?w.done/w.total*100:0;
  return <><div className="row between"><span className="muted">{w.doneCount} / {w.count} 项完成</span><strong>{Math.round(ratio)}%</strong></div><Progress value={ratio} label="项目完成比例"/></>;
}
export function TaskRow({entry,task}:{entry?:Entry;task?:Task}) {
  const {data,open,commit,busy}=useApp();
  const project=data.projects.find(p=>p.id===(entry?.projectId??task?.projectId));
  const title=entry?.title??task!.title;
  const minutes=entry ? entry.done?spent(data,entry):entry.minutes : remainingTask(data,task!);
  const done=entry?.done??false;
  const doComplete=async()=>{
    if(done) {
      const {undoComplete}=await import('./actions');
      await commit(s=>undoComplete(s,entry!.id)).catch(()=>{});
    } else if(!data.settings.askActual) {
      const {scheduleTask,complete}=await import('./actions');
      await commit(s=>{
        const id=entry?.id??(task?scheduleTask(s,task.id,businessDay(s.settings))?.id:undefined);
        if(id)complete(s,id,null,false);
      }).catch(()=>{});
    } else open({kind:'complete',entryId:entry?.id,taskId:task?.id});
  };
  return <div className={`task-row ${done?'is-done':''}`} draggable={!done} onDragStart={e=>e.dataTransfer.setData('application/riji',JSON.stringify({entryId:entry?.id,taskId:task?.id}))}>
    <button disabled={busy} className={`complete-button ${done?'checked':''}`} aria-label={`${done?'撤销完成':'完成'}：${title}`} onClick={doComplete}>{done&&<Icon name="check" size={15}/>}</button>
    <button className="task-title" onClick={()=>open(done?{kind:'entry',id:entry!.id}:entry?.taskId||task ? {kind:'project',id:project?.id} : {kind:'entry',id:entry?.id})}><strong>{title}</strong><span>{project&&<><i className="dot" style={{background:project.color}}/>{project.name}<b>·</b></>}{entry?.date??'未安排'}{entry?.start&&` ${entry.start}–${entry.end}`}</span></button>
    <span className="duration">{minutesText(minutes)}{done&&<small>已投入</small>}</span>
    <div className="task-actions">{!done&&entry&&entry.minutes>1&&<button className="text-button" onClick={()=>open({kind:'complete',entryId:entry.id,partial:true})}>部分完成</button>}
    {!done&&<button className="icon-button" aria-label={`安排日期：${title}`} onClick={()=>open({kind:'schedule',entryId:entry?.id,taskId:task?.id})}><Icon name="calendar" size={17}/></button>}</div>
  </div>;
}
