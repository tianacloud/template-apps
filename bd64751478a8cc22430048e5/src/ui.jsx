import React,{useEffect,useRef,useContext,createContext,useState} from 'react';
export const AppContext=createContext(null);
export const useGym=()=>useContext(AppContext);
const paths={
  pause:'M8 5v14M16 5v14',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  home:'m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  plan:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM7 14h2m3 0h2m3 0h1M7 18h2m3 0h2',
  workout:'M6 6v12m12-12v12M3 9v6m18-6v6M6 12h12',
  progress:'M4 20V10m5 10V4m6 16v-7m5 7V7',
  exercises:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  settings:'m9 3-1 3-3 1-2 3 2 2v3l3 2 1 3h6l1-3 3-2v-3l2-2-2-3-3-1-1-3zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  plus:'M12 5v14M5 12h14', check:'m5 12 4 4L19 6', close:'m6 6 12 12M6 18 18 6',arrow:'M4 12h16m-6-6 6 6-6 6',chevron:'m9 5 7 7-7 7',back:'m15 5-7 7 7 7',
  play:'m8 4 12 8-12 8z',clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  cloud:'M6 18h12a4 4 0 0 0 0-8h-1a6 6 0 1 0-11 8m3-5 3 3 5-5',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  weight:'M6 4h12l3 17H3L6 4zM9 8h6m-3 0-1 3',fire:'M13 2c2 5-4 7-1 10 2-1 3-3 3-5 5 4 6 10 2 13-3 3-9 2-11-2-3-5 2-8 3-11-1 5 3 5 4-5z',
  trophy:'M8 3h8v7a4 4 0 0 1-8 0zM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 3v7m-4 0h8',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',
  edit:'m15 4 5 5-11 11-6 1 1-6L15 4zM13 6l5 5',trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',copy:'M9 9h12v12H9zM5 15H3V3h12v2',
  loop:'m4 8 4-4-4-3M4 4h12a5 5 0 0 1 5 5m-1 7-4 4 4 3m0-3H8a5 5 0 0 1-5-5',info:'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  photo:'M3 5h18v15H3zM3 17l6-6 5 5 3-3 4 4M17 9h.01',sun:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0-6v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
  bolt:'m13 2-9 12h7l-1 8 10-13h-7z',minus:'M5 12h14',more:'M5 12h.01M12 12h.01M19 12h.01',up:'m7 14 5-5 5 5',down:'m7 10 5 5 5-5'
};
export function Icon({name,size=20,...props}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]||paths.workout}/></svg>;}
export function Button({children,icon,variant='',className='',...props}){return <button type="button" className={`button ${variant} ${className}`} {...props}>{icon&&<Icon name={icon} size={18}/>}<span>{children}</span></button>;}
export function IconButton({name,label,...props}){return <button type="button" className="icon-button" aria-label={label} title={label} {...props}><Icon name={name}/></button>;}
export function Tag({children,color}){return <span className="tag" style={color?{color,background:`${color}18`}:undefined}>{children}</span>;}
export function PageTitle({eyebrow,title,subtitle,children,className=''}){const gym=useGym();return <div className={`hdr page-heading ${className}`}><div><h1>{title}</h1>{subtitle&&<p className="sub">{subtitle}</p>}</div><div className="heading-actions">{children}{gym?.route?.split('/')[0]==='home'&&<IconButton name="settings" label="设置" onClick={()=>gym.go('settings')}/>} {gym?.route?.split('/')[0]==='settings'&&<IconButton name="back" label="返回概览" onClick={()=>gym.go('home')}/>}</div></div>;}
export function SectionHead({title,children}){return <div className="section-head"><h2>{title}</h2>{children}</div>;}
export function Empty({icon='workout',title,children,action}){return <div className="empty"><span className="empty-icon"><Icon name={icon} size={30}/></span><h3>{title}</h3><p>{children}</p>{action}</div>;}
export function Modal({title,subtitle,onClose,children,wide=false}) {
  const ref=useRef(null);
  useEffect(()=>{const prev=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.querySelector('input,button,select,textarea')?.focus();const onKey=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const els=[...ref.current.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(x=>!x.disabled);if(!els.length)return;const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',onKey);return()=>{document.body.style.overflow=old;document.removeEventListener('keydown',onKey);prev?.focus?.();};},[]);
  return <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`modal ${wide?'wide':''}`} ref={ref}><div className="modal-header"><div><h2 id="dialog-title">{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><IconButton name="close" label="关闭" onClick={onClose}/></div><div className="modal-body">{children}</div></section></div>;
}
export function Field({label,hint,children}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
export function Numeric({value,onChange,label,min=0,max=2000,step=1,...props}){return <input aria-label={label} type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} {...props}/>;}
export function Confirm({title,children,onConfirm,onClose,danger=false}){return <Modal title={title} onClose={onClose}><p className="confirm-text">{children}</p><div className="modal-actions"><Button variant="secondary" onClick={onClose}>取消</Button><Button variant={danger?'danger':''} onClick={onConfirm}>确认</Button></div></Modal>;}
export function Note({children}){return <div className="note"><Icon name="info" size={18}/><span>{children}</span></div>;}
export function SearchBox({value,onChange,placeholder='搜索动作名称…'}){return <div className="searchbox"><Icon name="search"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder}/>{value&&<IconButton name="close" label="清空搜索" onClick={()=>onChange('')}/>}</div>;}
export const saveDownload=(name,value,type='application/json')=>{const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);};
