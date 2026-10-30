import css from './style.css';
import * as ui from './interface.js';
import {SYMPTOMS,FREQUENCIES,SIGNS,TREATMENTS,CONCERNS,uid,number,poemScore,poemBand,scoradScore,newDraft,validateBasic,validateAssessment,validatePatient,addAssessment,toCsv,samplePatients} from './rules.js';
import {MemoryRepository} from './demo.js';
const PREVIEW=__SHOWCASE__;
const style=document.createElement('style');style.textContent=css;document.head.append(style);document.title='AD 门诊评估';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const root=document.querySelector('#app');let repo,patients=[],draft=newDraft(),step=0,query='',view='welcome',patientId=null,assessmentId=null,scoreDraft=null,busy=false,modalAction=null,errorText='',isError=false;
const screenPositions=new Map();let renderedScreen='',toastTimer,toastVisible=false;
const pageNames=ui.stepTitles;
const parseNumber=v=>v.trim()===''?null:Number(v);
const dt=v=>new Date(v).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
const activePatient=()=>patients.find(p=>p.id===patientId);
const activeAssessment=()=>activePatient()?.assessments.find(a=>a.id===assessmentId)||activePatient()?.assessments.slice().sort((a,b)=>Date.parse(b.time)-Date.parse(a.time))[0];
const $=s=>root.querySelector(s);
function notify(text,error=false){errorText=text;isError=error;toastVisible=Boolean(text);const node=$('#notice');if(node){node.textContent=text;node.className=text?'notice '+(error?'error':''):'';}const toast=$('#toast');toast?.classList.toggle('show',Boolean(text));clearTimeout(toastTimer);if(text)toastTimer=setTimeout(()=>{toastVisible=false;$('#toast')?.classList.remove('show');},2500);}
function route(){const [first,id,assess]=(location.hash.replace(/^#\/?/,'').split('/').map(v=>{try{return decodeURIComponent(v);}catch{return '';}}));view=['new','welcome','success','patients','detail','trend','scorad'].includes(first)?first:'welcome';patientId=id||patientId;assessmentId=assess||assessmentId;if(view==='scorad'&&!scoreDraft)prepareScorad();render();}
function go(next,id=patientId,assess=assessmentId){const hash='#/'+next+(id?'/'+encodeURIComponent(id):'')+(assess&&['detail','scorad'].includes(next)?'/'+encodeURIComponent(assess):'');if(location.hash===hash){view=next;render();}else location.hash=hash;}
function viewContext(){return {preview:PREVIEW,view,draft,step,patients,query,patient:activePatient(),assessment:activeAssessment(),scoreDraft,busy,errorText,isError,toastVisible};}
function render(){const previous=$('.screen');if(previous&&renderedScreen)screenPositions.set(renderedScreen,previous.scrollTop||0);const c=viewContext(),content=view==='welcome'?ui.welcome():view==='success'?ui.success():view==='new'?renderWizard():view==='patients'?renderPatients():view==='trend'?renderTrend():view==='scorad'?renderScorad():renderDetail();root.innerHTML=ui.frame(c,content);renderedScreen=view+(view==='new'?'/'+step:'')+(['detail','trend','scorad'].includes(view)?'/'+patientId+'/'+assessmentId:'');const screen=$('.screen');if(screen){const top=screenPositions.get(renderedScreen)||0;if(screen.scrollTo)screen.scrollTo({top,behavior:'instant'});else screen.scrollTop=top;}lockControls();}
function lockControls(){root.querySelectorAll('button,input,textarea,select').forEach(el=>{if(busy){if(!el.hasAttribute('data-locked'))el.dataset.locked=el.disabled?'1':'0';el.disabled=true;}else if(el.hasAttribute('data-locked')){el.disabled=el.dataset.locked==='1';delete el.dataset.locked;}});root.querySelectorAll('a').forEach(el=>{if(busy){el.setAttribute('aria-disabled','true');el.tabIndex=-1;}else{el.removeAttribute('aria-disabled');el.removeAttribute('tabindex');}});}
function renderWizard(){return ui.wizard(viewContext());}
function selectedDrugs(){return ['biologic','jak'].flatMap(k=>draft.treat[k].filter(v=>v!=='无'));}
function patientCards(){return ui.patientCards(viewContext());}
function renderPatients(){return ui.patients(viewContext());}
function renderDetail(){return ui.detail(viewContext());}
function prepareScorad(){const a=activeAssessment();scoreDraft=a?.scorad?structuredClone(a.scorad):{A:null,B:Array(6).fill(null),C:[null,null],note:''};}
function scoreSummary(){return ui.scoreSummary(scoreDraft);}
function renderScorad(){return ui.scorad(viewContext());}
function renderTrend(){return ui.trend(viewContext());}
function previousStep(){if(step===0){notify('');go('welcome',null);return;}step=step===5&&!selectedDrugs().length?3:Math.max(0,step-1);notify('');render();}
function nextStep(){
 try{if(step===0)validateBasic(draft);if(step===1)poemScore(draft.poem);if(step===2){if(draft.nrs===null){$('#nrsErr').hidden=false;throw Error('请选择瘙痒程度');}number(draft.nrs,0,10,true);}if(step===5&&!draft.concerns.length&&!draft.other.trim())throw Error('请至少选择一项希望改善的问题');}catch(e){if(step===0){for(const [key,invalid] of Object.entries({name:!draft.name.trim(),caseNo:!draft.caseNo.trim(),age:!Number.isInteger(draft.age)||draft.age<0||draft.age>120,gender:!draft.gender}))$('#f-'+key)?.classList.toggle('invalid',invalid);}notify(e.message,true);return;}
 step=step===3&&!selectedDrugs().length?5:Math.min(6,step+1);notify('');render();
}
function updateNrs(el){if(busy)return;draft.nrs=number(Number(el.value),0,10,true);if($('#nrsBig'))$('#nrsBig').textContent=String(draft.nrs);if($('#nrsErr'))$('#nrsErr').hidden=true;}
function modal(title,body,label,callback){$('#modal').innerHTML=`<div class="overlay"><section role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${body}<div class="modal-actions"><button data-action="close-modal">取消</button><button data-action="confirm-modal" class="primary">${esc(label)}</button></div></section></div>`;modalAction=callback;$('#modal button')?.focus();}
async function refresh(){if(!repo)throw Error('数据库尚未连接，请重新登录后打开。');patients=(await repo.list()).map(validatePatient);render();}
async function submit(){validateBasic(draft);validateAssessment(draft);const p=patients.find(p=>p.caseNo===draft.caseNo.trim()),result=addAssessment(draft,p);busy=true;render();try{const saved=await repo.save(result);patients=patients.filter(x=>x.id!==saved.id);patients.unshift(saved);draft=newDraft();step=0;patientId=saved.id;assessmentId=saved.assessments[0].id;notify('本次评估已保存');go('success');}finally{busy=false;render();}}
function saveFile(text,name,type){if(PREVIEW)return;const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
root.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||b.disabled||busy)return;try{
 if(b.dataset.go){if(b.dataset.go==='scorad')prepareScorad();go(b.dataset.go,b.dataset.go==='patients'||b.dataset.go==='new'?null:patientId);return;}
 if(b.dataset.gender){draft.gender=b.dataset.gender;render();return;}
 if(b.dataset.poem){const[i,v]=b.dataset.poem.split(',').map(Number);draft.poem[i]=draft.poem[i]===v?null:v;render();return;}
 if(b.dataset.nrs!==undefined){draft.nrs=+b.dataset.nrs;render();return;}
 if(b.dataset.scoreSubjective){const[i,v]=b.dataset.scoreSubjective.split(',').map(Number);scoreDraft.C[i]=v;render();return;}
 if(b.dataset.treatment){const[k,v]=b.dataset.treatment.split('|'),arr=draft.treat[k];draft.treat[k]=v==='无'?['无']:arr.includes(v)?arr.filter(x=>x!==v):[...arr.filter(x=>x!=='无'),v];render();return;}
 if(b.dataset.drug){const[drug,key,val]=b.dataset.drug.split('|');draft.details[drug]??={};draft.details[drug][key]=val;render();return;}
 if(b.dataset.concern){const c=b.dataset.concern;draft.concerns=draft.concerns.includes(c)?draft.concerns.filter(x=>x!==c):[...draft.concerns,c];render();return;}
 if(b.dataset.patient){patientId=b.dataset.patient;assessmentId=null;scoreDraft=null;go('detail');return;}
 if(b.dataset.visit){assessmentId=b.dataset.visit;scoreDraft=null;go('detail');return;}
 if(b.dataset.scoreSign){const[i,v]=b.dataset.scoreSign.split(',').map(Number);scoreDraft.B[i]=v;render();return;}
 switch(b.dataset.action){
 case'begin':step=0;notify('');go('new',null);break;
 case'records':notify('');go('patients',null);break;
 case'home':if(view==='success'){draft=newDraft();step=0;}notify('');go('welcome',null);break;
 case'back':if(view==='new')previousStep();else go(view==='detail'?'patients':'detail',view==='detail'?null:patientId);break;
 case'next':nextStep();break;
 case'prev':previousStep();break;
 case'submit':if(!repo)throw Error('数据库尚未连接，填写内容已保留。');await submit();break;
 case'refresh':await refresh();notify('已重新读取档案');break;
 case'followup':{const p=activePatient();if(!p)break;draft={...newDraft(),name:p.name,caseNo:p.caseNo,age:p.age,gender:p.gender};step=0;go('new',null);break;}
 case'scorad':prepareScorad();go('scorad');break;
 case'save-scorad':{const r=scoradScore(scoreDraft),p=structuredClone(activePatient()),a=p.assessments.find(x=>x.id===activeAssessment().id);a.scorad={...structuredClone(scoreDraft),score:r.score,time:new Date().toISOString()};busy=true;render();try{const saved=await repo.save(p);patients=patients.map(x=>x.id===saved.id?saved:x);notify('SCORAD 已保存，六项体征已计入总分。');go('detail');}finally{busy=false;render();}break;}
 case'delete-patient':{const p=activePatient();modal('删除整个档案',`<p>将删除“${esc(p.name)} / ${esc(p.caseNo)}”及其中 ${p.assessments.length} 次评估。</p>`,'删除',async()=>{await repo.remove(p);patients=patients.filter(x=>x.id!==p.id);patientId=null;assessmentId=null;go('patients',null);notify('已删除选定档案');});break;}
 case'delete-visit':{const p=activePatient(),a=activeAssessment();modal('删除本次评估',`<p>确认删除 ${dt(a.time)} 的评估及对应 SCORAD？其他评估会保留。</p>`,'删除',async()=>{const next={...structuredClone(p),assessments:p.assessments.filter(x=>x.id!==a.id)};const saved=await repo.save(next);patients=patients.map(x=>x.id===saved.id?saved:x);assessmentId=null;go('detail');notify('已删除选定评估');});break;}
 case'edit-profile':{const p=activePatient();modal('编辑基本资料',`<label class="field">记录代号<input id="edit-name" maxlength="80" value="${esc(p.name)}"></label><label class="field">病例号<input id="edit-case" maxlength="80" value="${esc(p.caseNo)}"></label><label class="field">年龄<input type="number" id="edit-age" min="0" max="120" value="${p.age}"></label><label class="field">性别<select id="edit-gender">${['男','女','其他 / 未提供'].map(g=>`<option ${p.gender===g?'selected':''}>${g}</option>`).join('')}</select></label>`,'保存',async()=>{const next={...structuredClone(p),name:$('#edit-name').value.trim(),caseNo:$('#edit-case').value.trim(),age:parseNumber($('#edit-age').value),gender:$('#edit-gender').value};next.title=next.name;validateBasic(next);const saved=await repo.save(next);patients=patients.map(x=>x.id===saved.id?saved:x);render();notify('基本资料已保存');});break;}
 case'backup':saveFile(JSON.stringify({format:'ad-assessment-v1',patients},null,2),'ad-records.json','application/json');break;
 case'csv':saveFile(toCsv(patients),'ad-records.csv','text/csv;charset=utf-8');break;
 case'import':$('#backup-file').click();break;
 case'close-modal':$('#modal').innerHTML='';modalAction=null;break;
 case'confirm-modal':{const fn=modalAction;busy=true;lockControls();b.textContent='正在处理…';try{await fn?.();modalAction=null;busy=false;render();}catch(err){busy=false;lockControls();b.textContent='重新检查后确认';throw err;}break;}
 case'references':modal('量表与使用说明','<p>©Copyright University of Nottingham 2004。保留所有权利。POEM - 自我完成 - 简体中文（中国），版本日期：2025 年 1 月 30 日。原始工具：Charman、Venn、Williams，2004。</p><p>POEM 七项等权计分0–4，合计0–28。无法回答时可留空；仅一项缺答按0分计，两项及以上缺答不计算总分。重复点选已选答案可将该题留空。缺答不等同于明确选择“0天”。</p><p>SCORAD：European Task Force on Atopic Dermatitis，1993（DOI 10.1159/000247298）。A/5 + 7B/2 + C，最大103。B为六项0–3的数值之和；干燥在非炎症皮肤上评定。</p><p>POEM个人非商业使用和商业使用有不同授权条件，须按实际用途遵守权利人的使用条件；免费分发不等于非商业使用。量表辅助记录不能替代临床判断。</p>','关闭',()=>{});break;
 case'reset':repo.reset();patients=await repo.list();draft=newDraft();scoreDraft=null;step=0;patientId=null;assessmentId=null;view='welcome';screenPositions.clear();location.hash='#/welcome';notify('示例已恢复');render();break;
 }
 }catch(err){busy=false;notify(err.message,true);if(!$('#modal')?.textContent)render();}});
root.addEventListener('input',e=>{if(busy)return;const el=e.target;if(el.hasAttribute('data-nrs-range'))updateNrs(el);if(el.dataset.field){draft[el.dataset.field]=el.dataset.field==='age'?parseNumber(el.value):el.value;}
 if(el.id==='search'){query=el.value;$('#patient-cards').innerHTML=patientCards();}
 if(el.dataset.adverse){draft.details[el.dataset.adverse]??={};draft.details[el.dataset.adverse].adverseText=el.value;}
 if(el.hasAttribute('data-score-area')){scoreDraft.A=parseNumber(el.value);$('#score-summary').innerHTML=scoreSummary();}
 if(el.hasAttribute('data-score-note'))scoreDraft.note=el.value;
});
root.addEventListener('pointerup',e=>{if(e.target.hasAttribute?.('data-nrs-range'))updateNrs(e.target);});
root.addEventListener('keyup',e=>{if(e.target.hasAttribute?.('data-nrs-range')&&['Home','End','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown'].includes(e.key))updateNrs(e.target);});
root.addEventListener('change',async e=>{if(busy)return;if(e.target.hasAttribute?.('data-nrs-range')){updateNrs(e.target);return;}if(e.target.id!=='backup-file')return;const f=e.target.files[0];if(!f)return;try{if(f.size>5*1024*1024)throw Error('备份文件上限5 MB');const data=JSON.parse(await f.text());if(data.format!=='ad-assessment-v1'||!Array.isArray(data.patients)||data.patients.length>500)throw Error('备份格式不正确或档案超过500份');data.patients.forEach(validatePatient);modal('导入备份',`<p>导入 ${data.patients.length} 份档案。已有病例号会跳过，不覆盖当前资料。</p>`,'开始导入',async()=>{let imported=0,skipped=0;try{for(const original of data.patients){if(patients.some(p=>p.caseNo===original.caseNo.trim())){skipped++;continue;}const d={...structuredClone(original),id:uid(),revision:0};const saved=await repo.save(d);patients.unshift(saved);imported++;}render();notify('已导入 '+imported+' 份，跳过 '+skipped+' 份已有档案');}catch(err){notify('已导入 '+imported+' 份后停止：'+err.message,true);throw err;}});}catch(err){notify(err.message,true);}e.target.value='';});
root.addEventListener('click',e=>{if(busy&&e.target.closest('a'))e.preventDefault();});
window.addEventListener('hashchange',()=>{if(!busy)route();});
async function init(){route();try{repo=PREVIEW?new MemoryRepository(samplePatients()):new (await import('./db.js')).Repository();patients=(await repo.list()).map(validatePatient);if(view==='scorad')prepareScorad();render();}catch(e){notify(e.message,true);}}
init();
