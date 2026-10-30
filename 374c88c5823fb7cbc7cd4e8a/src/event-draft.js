import {validateWorkspace} from './rules.js';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function beginEventDraft(event,persisted){return {draft:structuredClone(event),original:persisted?structuredClone(event):null,changed:false,error:'',confirm:false,persisted};}
export function mergeEventDraft(workspace,state,event){
 const index=workspace.events.findIndex(e=>e.id===event.id);
 if(state.original&&(index<0||!equal(workspace.events[index],state.original)))throw Error('这条日程已发生变化。你的编辑草稿仍保留，请先对照云端记录。');
 if(!state.original&&index>=0)throw Error('日程编号已存在，请保留草稿并重新打开核对。');
 const next=structuredClone(workspace);if(index<0)next.events.push(structuredClone(event));else next.events.splice(index,1,structuredClone(event));return validateWorkspace(next);
}
