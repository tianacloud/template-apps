import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CloudRepository, Conflict, Uncertain, type Runtime, type Repository, type Snapshot } from './storage';
import { businessDay } from './dates';
import { freezeToday } from './planning';
import { Context, Icon, Dialog, type Modal } from './ui';
import { Screens } from './screens';
import { EchoCalendar, EchoToday, EchoBook, EchoMe, ExportPage, MoonMark } from './workbench';
import { Editors } from './editors';
import css from './style.css';
import type { Workspace } from './model';

export const navigation = [
  {id:'calendar',name:'日历',icon:'calendar'},
  {id:'today',name:'今日概览',icon:'today'},
  {id:'list',name:'全部事项',icon:'tasks'},
  {id:'stats',name:'数据统计',icon:'stats'},
  {id:'export',name:'导出',icon:'export'},
  {id:'book',name:'回响之书',icon:'book'},
  {id:'projects',name:'我的项目',icon:'projects'},
  {id:'me',name:'我的',icon:'user'},
];
const route=()=>{
  const id=location.hash.slice(1);
  return id==='tasks'?'list':navigation.some(n=>n.id===id)?id:window.innerWidth<=850?'today':'calendar';
};
export function App({repository,demo=false,onReset}:{repository:Repository;demo?:boolean;onReset?:()=>void}) {
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),current=useRef(snapshot);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),busyRef=useRef(false);
  const [modal,setModal]=useState<Modal|null>(null),[page,setPage]=useState(route);
  const [date,setDate]=useState(''),[now,setNow]=useState(Date.now()),[saved,setSaved]=useState('');
  const [poolOpen,setPoolOpen]=useState(()=>window.innerWidth>850),[collapsed,setCollapsed]=useState(false);
  const [appearance,setAppearance]=useState(false);
  const theme=snapshot?.data.settings.theme || 'warm';
  const replace=useCallback((value:Snapshot)=>{current.current=value;setSnapshot(value);},[]);
  const load=useCallback(async()=>{
    try{setError('');const value=await repository.load();replace(value);setDate(d=>d||businessDay(value.data.settings));}
    catch(e){setError(e instanceof Error?e.message:'读取失败');}
  },[repository,replace]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
  },[theme]);
  useEffect(()=>{
    const tick=()=>setNow(Date.now()),timer=setInterval(tick,15000),changeRoute=()=>setPage(route());
    const key=(e:KeyboardEvent)=>{
      if(e.key.toLowerCase()==='n'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!(e.target as HTMLElement).closest('input,textarea,select,[contenteditable],dialog')){
        e.preventDefault();setModal({kind:'entry'});
      }
    };
    window.addEventListener('focus',tick);window.addEventListener('hashchange',changeRoute);window.addEventListener('keydown',key);
    return()=>{clearInterval(timer);window.removeEventListener('focus',tick);window.removeEventListener('hashchange',changeRoute);window.removeEventListener('keydown',key);};
  },[]);
  const today=snapshot?businessDay(snapshot.data.settings,now):'';
  const commit=useCallback(async(change:(s:Workspace)=>void,expected?:number)=>{
    if(busyRef.current||!current.current)throw new Error('正在保存，请稍候');
    if(repository.pending)throw new Uncertain();
    if(expected!==undefined&&expected!==current.current.revision)throw new Error('数据已经更新。草稿尚未保存，请关闭窗口后重新打开。');
    busyRef.current=true;setBusy(true);setError('');
    try{
      const previous=current.current,next=structuredClone(previous.data);change(next);freezeToday(next,businessDay(next.settings));
      const result=await repository.save(previous,next);replace(result);setSaved('已保存');
    }catch(e){if(e instanceof Conflict){const latest=await repository.load();replace(latest);}setError(e instanceof Error?e.message:'保存失败');throw e;}
    finally{busyRef.current=false;setBusy(false);}
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
  const navItem=(n:typeof navigation[number])=><a key={n.id} href={`#${n.id}`} className={page===n.id?'active':''} aria-current={page===n.id?'page':undefined} title={n.name}><Icon name={n.icon} size={18}/><span>{n.name}</span></a>;
  return <div className={`echo-shell ${page==='calendar'&&poolOpen?'has-pool':''} ${collapsed?'sidebar-collapsed':''}`}>
    <aside className="echo-sidebar" aria-label="导航">
      <div className="echo-brand-row"><a className="echo-brand" href="#calendar"><MoonMark/><span><strong>日有回响 <b>DayEcho</b></strong><small>把 deadline 拆成今天</small></span></a><button className="bare collapse-button" aria-label={collapsed?'展开侧栏':'收起侧栏'} onClick={()=>setCollapsed(!collapsed)}><Icon name="panel" size={15}/></button></div>
      <button className="new-button" onClick={()=>setModal({kind:'entry'})} title="新建事项 (N)"><Icon name="plus" size={19}/><span>新建</span><kbd>N</kbd></button>
      <nav className="echo-nav" aria-label="页面">{navItem(navigation[0])}<p>工具</p>{navigation.slice(1,6).map(navItem)}</nav>
      <div className="sidebar-projects"><div className="sidebar-projects-heading"><a href="#projects">我的项目</a><button className="bare" aria-label="新建计划项目" onClick={()=>setModal({kind:'project'})}><Icon name="plus" size={16}/></button></div>
        {snapshot?.data.projects.length?<div className="sidebar-project-list">{snapshot.data.projects.map(p=><button key={p.id} onClick={()=>setModal({kind:'project',id:p.id})}><i className="dot" style={{background:p.color}}/><span>{p.name}</span></button>)}</div>:<p>有 deadline 的大事，建成项目后会出现在这里。</p>}
      </div>
      <div className="echo-sidebar-bottom"><div className="row between"><button className="bare settings-button" onClick={()=>setModal({kind:'settings'})}><span className="user-badge"><Icon name="user" size={16}/></span><span>设置</span></button><button className="bare" aria-label="显示模式" title="主题与显示" onClick={()=>setAppearance(true)}><Icon name="today" size={18}/></button></div><div className="connection-state" role="status"><i className={busy?'working':''}/>{busy?'正在保存…':repository.pending?'等待核实':demo?'示例体验 · 仅本页':saved||'个人工作区'}<button className="bare" aria-label="重新读取数据" disabled={busy||repository.pending} onClick={()=>void load()}><Icon name="refresh" size={12}/></button></div></div>
    </aside>
    <main className={`echo-workspace page-${page} ${demo?'demo-mode':''}`} aria-label="主内容">
      {demo&&<div className="demo-notice"><span>示例体验 · 数据仅保留在本页</span><button onClick={onReset}>恢复示例</button></div>}
      {error&&<div className="app-error" role="alert"><span>{error}</span>{repository.pending?<button onClick={verify} disabled={busy}>核实保存结果</button>:<button onClick={()=>void load()} disabled={busy}>重新读取</button>}</div>}
      {!snapshot?<div className="loading-panel"><MoonMark/><h2>{error?'暂时无法打开工作区':'正在打开你的每一天'}</h2><p>让每一份投入，都有回响。</p>{error&&<button onClick={()=>void load()}>重新连接</button>}</div>:
      <Context.Provider value={{data:snapshot.data,revision:snapshot.revision,today,date:date||today,busy,demo,repository,setDate,poolOpen,setPoolOpen,open:setModal,close:()=>setModal(null),commit,navigate}}>
        <fieldset disabled={busy||repository.pending} className="app-fieldset">
          {page==='calendar'?<EchoCalendar/>:page==='today'?<EchoToday/>:page==='book'?<EchoBook/>:page==='export'?<ExportPage/>:page==='me'?<EchoMe onAppearance={()=>setAppearance(true)}/>:<div className="standard-page"><Screens page={page==='list'?'tasks':page}/></div>}
        </fieldset>
        {modal&&<Editors modal={modal}/>}
        {appearance&&<Dialog title="换一种心情" onClose={()=>setAppearance(false)}><p className="muted">选一个喜欢的颜色，陪你过好每一天。</p><div className="theme-grid">{[['warm','杏日暖白','#dfa282'],['sage','青苔微风','#94a38c'],['blue','晴空雾蓝','#91a9c3'],['rose','莓果暮色','#c697a5'],['night','静谧夜晚','#534c4b']].map(([id,name,color])=><button key={id} className={theme===id?'chosen':''} disabled={busy||repository.pending} onClick={()=>void commit(s=>{s.settings.theme=id;}).catch(()=>{})}><i style={{background:color}}/>{name}{theme===id&&<Icon name="check" size={15}/>}</button>)}</div></Dialog>}
      </Context.Provider>}
    </main>
    <nav className="echo-mobile-nav" aria-label="主要页面"><a href="#today" className={page==='today'?'active':''}><Icon name="today"/><span>今天</span></a><a href="#calendar" className={page==='calendar'?'active':''}><Icon name="calendar"/><span>日历</span></a><button className="mobile-new" aria-label="新建" onClick={()=>setModal({kind:'entry'})}><Icon name="plus" size={26}/></button><a href="#projects" className={page==='projects'?'active':''}><Icon name="projects"/><span>计划</span></a><a href="#me" className={page==='me'?'active':''}><Icon name="user"/><span>我的</span></a></nav>
  </div>;
}
export function applyStyles() {
  const style=document.createElement('style');style.textContent=css;document.head.append(style);
  document.documentElement.lang='zh-CN';document.title='日有回响 DayEcho · 把 deadline 拆成今天';
}
export async function mount(element:HTMLElement,runtime:Runtime) {
  applyStyles();createRoot(element).render(<App repository={new CloudRepository(runtime)}/>);
}
