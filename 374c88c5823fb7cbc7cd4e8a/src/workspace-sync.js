import {blankWorkspace,validateWorkspace} from './rules.js';

export class WorkspaceSaveError extends Error{
 constructor(code,message){super(message);this.name='WorkspaceSaveError';this.code=code;}
}
const sorted=value=>Array.isArray(value)?value.map(sorted):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,sorted(value[key])])):value;
export const sameWorkspaceContent=(a,b)=>{if(!a||!b)return a===b;const content=doc=>{const copy=structuredClone(doc);delete copy.revision;delete copy.updatedAt;return JSON.stringify(sorted(copy));};return content(a)===content(b);};

export class WorkspaceSync{
 constructor({repository,initial,exists=true,delay=180,onState=()=>{},onMetadata=()=>{}}){
  this.repository=repository;this.current=structuredClone(validateWorkspace(initial));this.confirmed=structuredClone(initial);this.exists=exists;this.revision=initial.revision||0;
  this.version=0;this.savedVersion=0;this.delay=delay;this.onState=onState;this.onMetadata=onMetadata;this.timer=null;this.inFlight=null;this.activeJob=null;this.reading=false;this.blocked=null;this.uncertain=null;this.disposed=false;
 }
 get state(){return {phase:this.reading?'checking':this.blocked?.kind||(this.activeJob?'saving':this.version>this.savedVersion?'queued':'idle'),dirty:this.version>this.savedVersion,saving:Boolean(this.activeJob),checking:this.reading,version:this.version,savedVersion:this.savedVersion,revision:this.revision,error:this.blocked?.message||'',canRetry:Boolean(this.blocked&&this.blocked.kind!=='conflict'&&!this.activeJob&&!this.reading)};}
 status(){return this.state;}
 _emit(){if(!this.disposed)this.onState(this.status());}
 _cancel(){if(this.timer!==null){clearTimeout(this.timer);this.timer=null;}}
 _schedule(delay=this.delay){this._cancel();if(this.disposed||this.activeJob||this.reading||this.blocked||this.version===this.savedVersion)return;this.timer=setTimeout(()=>{this.timer=null;void this.flush();},delay);}
 commit(document){if(this.disposed)throw Error('工作区保存已结束');const next=structuredClone(validateWorkspace(document));next.revision=this.revision;if(this.confirmed.updatedAt!==undefined)next.updatedAt=this.confirmed.updatedAt;else delete next.updatedAt;if(sameWorkspaceContent(next,this.current))return;this.current=next;this.version++;this._emit();this._schedule();}
 _matches(actual,job){return actual&&actual.revision===job.revision+1&&sameWorkspaceContent(actual,job.snapshot);}
 _unchanged(actual){return actual?actual.revision===this.revision&&sameWorkspaceContent(actual,this.confirmed):!this.exists&&this.revision===0;}
 _ack(actual,job){
  validateWorkspace(actual);this.confirmed=structuredClone(actual);this.exists=true;this.revision=actual.revision;this.savedVersion=job.version;
  this.current.revision=actual.revision;if(actual.updatedAt!==undefined)this.current.updatedAt=actual.updatedAt;else delete this.current.updatedAt;
  this.blocked=null;this.uncertain=null;if(!this.disposed)this.onMetadata({revision:actual.revision,updatedAt:actual.updatedAt});
 }
 async _read(){const actual=await this.repository.get('workspace');if(actual)validateWorkspace(actual);return actual;}
 async _write(job){
  try{
   const saved=await this.repository.save(structuredClone(job.snapshot));
   if(!this._matches(saved,job))throw new WorkspaceSaveError('UNKNOWN','保存回执与本次修改不一致。');
   this._ack(saved,job);
  }catch(error){
   if(error?.code==='CAS_CONFLICT'){this.blocked={kind:'conflict',message:'其他标签页已更新。当前修改已保留，请导出备份或重新读取后对照。'};this.uncertain=null;return;}
   this.uncertain=job;
   try{
    const actual=await this._read();
    if(this._matches(actual,job)){this._ack(actual,job);return;}
    if(!this._unchanged(actual)){this.blocked={kind:'conflict',message:'云端版本已有变化。当前修改已保留，请导出备份或重新读取后对照。'};return;}
   }catch{}
   this.blocked={kind:'unknown',message:'保存结果未确认，当前修改仍在本页。请核实并重试，或重新读取；不会自动重复写入。'};
  }
 }
 flush(){
  this._cancel();if(this.inFlight)return this.inFlight;
  if(this.blocked||this.reading||this.version===this.savedVersion)return Promise.resolve(this.status());
  const snapshot=structuredClone(this.current);snapshot.revision=this.revision;const job={snapshot,revision:this.revision,version:this.version};this.activeJob=job;this._emit();
  this.inFlight=Promise.resolve().then(()=>this._write(job)).finally(()=>{this.inFlight=null;this.activeJob=null;this._emit();this._schedule(0);});return this.inFlight;
 }
 async retry(){
  if(this.activeJob||this.reading||this.blocked?.kind==='conflict')return this.status();
  this._cancel();this.reading=true;this._emit();
  try{
   const actual=await this._read();
   if(this.uncertain&&this._matches(actual,this.uncertain))this._ack(actual,this.uncertain);
   else if(this._unchanged(actual)){this.blocked=null;this.uncertain=null;}
   else{this.blocked={kind:'conflict',message:'云端版本已有变化。当前修改已保留，请先对照或重新读取。'};return this.status();}
  }catch{this.blocked={kind:'unknown',message:'仍无法核实云端，当前输入已保留。请恢复连接后再核实。'};return this.status();}
  finally{this.reading=false;this._emit();}
  await this.flush();return this.status();
 }
 async reload(){
  if(this.activeJob||this.reading)throw Error('正在确认保存结果，请稍后重新读取。');
  this._cancel();const version=this.version;this.reading=true;this._emit();
  try{
   const actual=await this._read();
   if(version!==this.version){this.blocked={kind:'unknown',message:'读取期间又有新修改，已保留本页输入。请再次核实或重新读取。'};return {adopted:false};}
   const next=actual||blankWorkspace();this.current=structuredClone(next);this.confirmed=structuredClone(next);this.revision=next.revision||0;this.exists=Boolean(actual);this.version++;this.savedVersion=this.version;this.blocked=null;this.uncertain=null;this.onMetadata({revision:this.revision,updatedAt:next.updatedAt});return {adopted:true,document:structuredClone(next)};
  }catch(error){this.blocked={kind:'unknown',message:'重新读取失败，本页修改仍保留。'};throw error;}
  finally{this.reading=false;this._emit();}
 }
 dispose(){this._cancel();this.disposed=true;}
}
