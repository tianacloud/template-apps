export const localDay=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const initialState=()=>({settings:{examDate:'2027-07-01',dailyGoal:20,nickname:'',autoNext:false},attempts:[],mistakes:{},bookmarks:[]});
export function record(state,event){
 if(state.attempts.some(e=>e.id===event.id))return state;
 const next=structuredClone(state);next.attempts.push(event);
 if(event.correct){if(next.mistakes[event.qid])next.mistakes[event.qid].mastered=true}
 else {const old=next.mistakes[event.qid];next.mistakes[event.qid]={wrongCount:(old?.wrongCount||0)+1,addedAt:old?.addedAt||event.at,lastWrong:event.at,mastered:false}}
 return next;
}
export function stats(state,module){const rows=state.attempts.filter(e=>!module||e.module===module),right=rows.filter(e=>e.correct).length;return{total:rows.length,right,accuracy:rows.length?Math.round(100*right/rows.length):null}}
export function recent(state,n,now=new Date()){return Array.from({length:n},(_,i)=>{const date=new Date(now);date.setDate(date.getDate()-(n-1-i));const key=localDay(date),rows=state.attempts.filter(e=>e.date===key);return{key,total:rows.length,right:rows.filter(e=>e.correct).length}})}
export function streak(state,now=new Date()){
 const keys=new Set(state.attempts.map(e=>e.date));let date=new Date(now),count=0;if(!keys.has(localDay(date)))date.setDate(date.getDate()-1);
 while(keys.has(localDay(date))){count++;date.setDate(date.getDate()-1)}return count;
}
export function validateImport(value,ids){
 const dateValid=key=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return false;const d=new Date(key+'T00:00:00');return !Number.isNaN(d.getTime())&&localDay(d)===key};
 if(!value||typeof value!=='object'||!value.settings||!Array.isArray(value.attempts)||!value.mistakes||!Array.isArray(value.bookmarks))throw Error('学习数据结构不完整');
 if(!dateValid(value.settings.examDate)||!Number.isInteger(value.settings.dailyGoal)||value.settings.dailyGoal<1||value.settings.dailyGoal>500)throw Error('考试日期或每日目标无效');
 if(typeof value.settings.nickname!=='string'||value.settings.nickname.length>30||typeof value.settings.autoNext!=='boolean')throw Error('昵称或自动跳转设置无效');
 const seen=new Set();for(const e of value.attempts){if(!ids.has(e.qid)||typeof e.id!=='string'||seen.has(e.id)||typeof e.correct!=='boolean'||!Number.isFinite(e.at)||!dateValid(e.date))throw Error('作答记录无效或重复');seen.add(e.id)}
 for(const [qid,m] of Object.entries(value.mistakes))if(!ids.has(qid)||!Number.isInteger(m.wrongCount)||m.wrongCount<1||typeof m.mastered!=='boolean')throw Error('错题记录无效');
 if(value.bookmarks.some(x=>typeof x!=='string'))throw Error('收藏记录无效');return value;
}
