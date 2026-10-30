import {exportWithPhotos} from './photos.js';
import {TEMPLATE_SOURCE_URL} from './source-link.js';
import React,{useState,useEffect,useMemo,useSyncExternalStore} from 'react';
import {AppContext,Icon,Button,IconButton,Tag,PageTitle,SectionHead,Empty,Modal,Field,Confirm,saveDownload} from './ui.jsx';
import {today,weekDays,addDays,daysAgo,fmt,kgTo,clone,startSession,nextRoutine,countDone,volume} from './domain.js';
import {LineChart} from './visuals.jsx';
import {Plans} from './Plans.jsx';
import {Workout} from './Workout.jsx';
import {Exercises} from './Exercises.jsx';
import {Progress,WeightEditor} from './Progress.jsx';
import {Settings} from './Settings.jsx';
import {Home} from './Home.jsx';
import {MediaSetupDialog} from './MediaSetup.jsx';

const tabs=[['home','概览','你的训练，从这里开始'],['plan','训练计划','让每一周更有方向'],['workout','开始训练','专注当下的每一组'],['progress','训练进度','看见时间的积累'],['exercises','动作库','找到适合你的动作']];
export default function App({store,catalogue,media=null,files=null}) {
  useSyncExternalStore(store.subscribe,store.snapshot);
  const [route,setRoute]=useState(()=>window.location.hash.replace(/^#\//,'')||'home');
  const [toast,setToast]=useState('');const [weightModal,setWeightModal]=useState(false);const [reloadConfirm,setReloadConfirm]=useState(false);
  const [mediaSetupOpen,setMediaSetupOpen]=useState(false);
  useEffect(()=>{const f=()=>setRoute(window.location.hash.replace(/^#\//,'')||'home');window.addEventListener('hashchange',f);return()=>window.removeEventListener('hashchange',f);},[]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(t);},[toast]);
  useEffect(()=>{const before=e=>{if(store.dirty.size){e.preventDefault();e.returnValue='';}};const visible=()=>{if(document.visibilityState==='visible'&&!store.dirty.size&&!store.busy&&!store.editing)store.load().catch(()=>{});};window.addEventListener('beforeunload',before);document.addEventListener('visibilitychange',visible);return()=>{window.removeEventListener('beforeunload',before);document.removeEventListener('visibilitychange',visible);};},[store]);
  const page=route.split('/')[0];const go=(r)=>{window.location.hash=`/${r}`;};
  const custom=store.list('exercise');const all=useMemo(()=>[...catalogue,...custom], [catalogue,store.tick]);const index=useMemo(()=>new Map(all.map(e=>[e.id,e])),[all]);
  const routines=store.list('routine').sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  const workouts=store.list('workout').sort((a,b)=>(b.date+String(b.finishedAt||0)).localeCompare(a.date+String(a.finishedAt||0)));
  const weights=store.list('weight').sort((a,b)=>a.date.localeCompare(b.date));const active=store.get('active','current');const unit=store.setting('unit','kg');
  const commit=async(kind,id,value)=>{store.set(kind,id,value);if(!await store.flush())throw new Error(store.error);};
  const run=async(fn)=>{try{return await fn();}catch(e){setToast(e.message||'操作失败，请检查连接');return false;}};
  const remove=async(kind,id)=>{store.remove(kind,id);if(!await store.flush())throw new Error(store.error);};
  const start=(routine)=>run(async()=>{if(active){go('workout');return;}const session=startSession(routine,workouts,index);await commit('active','current',session);go('workout');});
  const ctx={store,all,index,routines,workouts,weights,active,unit,go,route,media,files,toast:setToast,run,commit,remove,start,showWeight:()=>setWeightModal(true),showMediaSetup:()=>setMediaSetupOpen(true)};
  const current=tabs.find(t=>t[0]===page);const status=store.error?'保存需要处理':store.busy||store.dirty.size?'正在保存…':store.demo?'示例体验':'已保存到云端';
  return <AppContext.Provider value={ctx}><div className={`app-shell ${page==='workout'&&active?'active-workout':''}`}>
    <div className="main-shell"><header className="topbar"><div className="mobile-brand"><Icon name="workout"/><strong>open<span className="accent">Gym</span></strong></div><span className="topbar-label">{current?.[2]||'为自己，保持记录'}</span><div className="topbar-right"><span className="top-date">{new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric',weekday:'long'})}</span><div className={`status-pill ${store.error?'bad':''}`} title={status}><span/>{status}</div><IconButton name="settings" label="设置" onClick={()=>go('settings')}/><span className="avatar">{store.setting('name','你').slice(0,1)}</span></div></header>
      {store.demo&&<div className="demo-banner"><span>示例体验 · 数据仅保留在本页</span><button type="button" onClick={()=>{store.reset();go('home');setToast('示例数据已恢复');}}>恢复示例</button></div>}
      {store.error&&<div className="error-banner" role="alert"><Icon name="info"/><span>{store.error}</span><button type="button" onClick={()=>run(()=>store.reconcile())}>核对并保存</button><button type="button" onClick={()=>run(async()=>saveDownload(`openGym-本页备份-${today()}.json`,await exportWithPhotos(store,files)))}>导出本页备份</button><button type="button" onClick={()=>setReloadConfirm(true)}>读取云端</button></div>}
      <main>{!store.ready?<div className="loading"><div className="spinner"/><h2>{store.error?'暂时无法读取训练空间':'正在读取你的训练空间'}</h2><p>{store.error?'请检查登录和网络，随后重新连接。':'连接云端数据库…'}</p>{store.error&&<Button variant="secondary" onClick={()=>store.boot?.()}>重新连接</Button>}</div>:page==='home'?<Home/>:page==='plan'?<Plans/>:page==='workout'?<Workout/>:page==='progress'?<Progress/>:page==='exercises'?<Exercises/>:page==='settings'?<Settings/>:<Home/>}</main><div className="connection-indicator" role="status">{status}</div><footer className="desktop-footer"><span>为坚持而生。为自己而练。</span><a href={TEMPLATE_SOURCE_URL} target="_blank" rel="noreferrer">开源 · AGPL-3.0</a></footer>
    </div><nav className="mobile-nav" aria-label="主导航">{tabs.map(([id,label])=><a href={`#/${id}`} key={id} className={`${page===id?'selected':''} ${id==='workout'?'start':''}`}><span><Icon name={id==='workout'?'play':id==='exercises'?'workout':id}/></span><small>{id==='plan'?'计划':id==='progress'?'进度':id==='workout'&&active?'训练中':label}</small></a>)}</nav>
    {mediaSetupOpen&&<MediaSetupDialog onClose={()=>setMediaSetupOpen(false)}/>}{weightModal&&<WeightEditor onClose={()=>setWeightModal(false)}/>}{reloadConfirm&&<Confirm title="读取云端版本？" onClose={()=>setReloadConfirm(false)} onConfirm={()=>run(async()=>{await store.discardAndReload();setReloadConfirm(false);go('home');})}>本页尚未保存的修改将被替换。可以先导出本页备份以保留输入。</Confirm>}{toast&&<div className="toast" role="status"><Icon name="info" size={18}/>{toast}</div>}
  </div></AppContext.Provider>;
}
