import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CloudRepository, Conflict, Uncertain, type Runtime, type Repository, type Snapshot } from './storage';
import { businessDay } from './dates';
import { freezeToday } from './planning';
import { Context, Icon, type Modal } from './ui';
import { Screens } from './screens';
import { Editors } from './editors';
import css from './style.css';
import type { Workspace } from './model';

export const navigation = [
  {id:'today',name:'今日',icon:'today'},{id:'calendar',name:'日历',icon:'calendar'},
  {id:'projects',name:'项目',icon:'projects'},{id:'tasks',name:'任务',icon:'tasks'},
  {id:'stats',name:'复盘',icon:'stats'},
];
export function App({repository,demo=false,onReset}:{repository:Repository;demo?:boolean;onReset?:()=>void}) {
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),current=useRef(snapshot);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),busyRef=useRef(false);
  const [modal,setModal]=useState<Modal|null>(null),[page,setPage]=useState(()=>location.hash.slice(1)||'today');
  const [date,setDate]=useState(''),[now,setNow]=useState(Date.now());
  const [saved,setSaved]=useState('');
  const replace=useCallback((value:Snapshot)=>{current.current=value;setSnapshot(value);},[]);
  const load=useCallback(async()=>{
    try {setError('');const value=await repository.load();replace(value);setDate(d=>d||businessDay(value.data.settings));}
    catch(e){setError(e instanceof Error?e.message:'读取失败');}
  },[repository,replace]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    const tick=()=>setNow(Date.now()),timer=setInterval(tick,15000);
    const route=()=>setPage(navigation.some(n=>n.id===location.hash.slice(1))?location.hash.slice(1):'today');
    window.addEventListener('focus',tick);window.addEventListener('hashchange',route);
    return ()=>{clearInterval(timer);window.removeEventListener('focus',tick);window.removeEventListener('hashchange',route);};
  },[]);
  const today=snapshot?businessDay(snapshot.data.settings,now):'';
  const commit=useCallback(async(change:(s:Workspace)=>void,expected?:number)=>{
    if(busyRef.current||!current.current)throw new Error('正在保存，请稍候');
    if(repository.pending)throw new Uncertain();
    if(expected!==undefined&&expected!==current.current.revision)throw new Error('数据已经更新。草稿尚未保存，请关闭窗口后重新打开。');
    busyRef.current=true;setBusy(true);setError('');
    try{
      const previous=current.current,next=structuredClone(previous.data);
      change(next);freezeToday(next,businessDay(next.settings));
      const result=await repository.save(previous,next);
      replace(result);setSaved('已保存');
    }catch(e){
      if(e instanceof Conflict){const latest=await repository.load();replace(latest);}
      setError(e instanceof Error?e.message:'保存失败');
      throw e;
    }finally{busyRef.current=false;setBusy(false);}
  },[repository,replace]);
  useEffect(()=>{
    if(!snapshot||busyRef.current||repository.pending)return;
    const draft=structuredClone(snapshot.data);
    if(freezeToday(draft,today))void commit(s=>{s.targets=draft.targets;}).catch(()=>{});
  },[snapshot,today,commit,repository]);
  const navigate=(id:string)=>{location.hash=id;setPage(id);};
  const verify=async()=>{
    try{setBusy(true);const result=await repository.verifyPending();replace(result);setError('');setSaved('已核实保存结果');}
    catch(e){setError(e instanceof Error?e.message:'尚无法核实');}finally{setBusy(false);}
  };
  const nav=<nav aria-label="主导航">{navigation.map(n=><button key={n.id} className={page===n.id?'active':''} aria-current={page===n.id?'page':undefined} onClick={()=>navigate(n.id)}><Icon name={n.icon}/><span>{n.name}</span>{page===n.id&&<i/>}</button>)}</nav>;
  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="#today"><span className="brand-mark">日</span><span>日积<small>每一天，都有进展</small></span></a>{nav}
      <div className="sidebar-bottom"><p>把时间留给<br/>真正想完成的事。</p><button onClick={()=>setModal({kind:'export'})}><Icon name="export"/>导出记录</button><button onClick={()=>setModal({kind:'settings'})}><Icon name="settings"/>偏好设置</button><div className="identity"><span className="avatar">我</span><span>{demo?'演示工作区':'Tiana 个人工作区'}<small>{demo?'合成数据 · 仅当前页面':'个人计划，安心记录'}</small></span></div></div>
    </aside>
    <main className="workspace">
      <div className="mobile-brand"><a href="#today" className="brand"><span className="brand-mark">日</span>日积</a><div className="row"><button className="icon-button" aria-label="导出记录" onClick={()=>setModal({kind:'export'})}><Icon name="export"/></button><button className="icon-button" aria-label="偏好设置" onClick={()=>setModal({kind:'settings'})}><Icon name="settings"/></button></div></div>
      {demo&&<div className="demo-banner"><span>示例体验 · 数据仅保留在本页</span><button onClick={onReset}>恢复示例</button></div>}
      {error&&<div className="app-error" role="alert"><span>{error}</span>{repository.pending?<button onClick={verify} disabled={busy}>核实保存结果</button>:<button onClick={()=>void load()} disabled={busy}>重新读取</button>}</div>}
      {!snapshot?<div className="loading-panel"><span className="brand-mark">日</span><h2>{error?'暂时无法打开工作区':'正在打开你的工作区'}</h2><p>连接个人计划与投入记录</p>{error&&<button onClick={()=>void load()}>重新连接</button>}</div>:
        <Context.Provider value={{data:snapshot.data,revision:snapshot.revision,today,date:date||today,busy,demo,repository,setDate,open:setModal,close:()=>setModal(null),commit,navigate}}>
          <div className="save-state" role="status"><i className={busy?'working':''}/>{busy?'保存中…':repository.pending?'等待核实':saved||'已连接'}<button className="icon-button" aria-label="重新读取数据" disabled={busy||repository.pending} onClick={()=>void load()}><Icon name="refresh" size={14}/></button></div>
          <fieldset disabled={busy||repository.pending} className="app-fieldset"><Screens page={page}/></fieldset>
          {modal&&<Editors modal={modal}/>}
        </Context.Provider>}
    </main><div className="mobile-nav">{nav}</div>
  </div>;
}
export function applyStyles() {
  const style=document.createElement('style');style.textContent=css;document.head.append(style);
  document.documentElement.lang='zh-CN';document.title='日积 · 每一天，都有进展';
}
export async function mount(element:HTMLElement,runtime:Runtime) {
  applyStyles();
  createRoot(element).render(<App repository={new CloudRepository(runtime)}/>);
}
