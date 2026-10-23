import statutes from './statutes.json' with {type:'json'};
import general from './general-provisions.json' with {type:'json'};
export {statutes,general};
export function uid(){const values=new Uint32Array(4);globalThis.crypto.getRandomValues(values);return Array.from(values,n=>n.toString(16).padStart(8,'0')).join('');}
const hints={
 'code-1102':['无证排污','无排污许可证','未取得排污许可证'],
 'code-1103':['超许可浓度','超许可排放量','证载种类'],
 'code-1104-1':['曝气池停运','设施停运','设施闲置','不运行','停止曝气','不投药'],
 'code-1108':['暗管','软管','雨水沟','渗井','渗坑','偷排','逃避监管','不正常运行','稀释在线','伪造监测数据'],
 'code-1086':['未监测','未联网','未安装自动监测','未建台账'],
 'code-1088':['监测造假','篡改数据','修改数据','伪造数据','指使监测'],
 'monitor-44':['监测造假','篡改数据','伪造数据','指使监测'],
 'code-1091':['监测机构','检测机构','虚假监测报告'],
 'code-1095-书':['未批先建','报告书','未报批'], 'code-1095-表':['未批先建','报告表','未报批'],
 'code-1120':['VOCs','挥发性有机物','油气回收','集气罩','废气未收集'],
 'code-1130':['露天堆放','物料未覆盖','恶臭','围挡低','扬尘物料'],
 'code-1175-1':['危险废物标志','危废标识','未设置识别标志'],
 'code-1175-5':['无资质处置','无证接收','危废委托','无许可证单位'],
 'code-1175-8':['擅自转移','未经批准转移'],
 'code-1185':['夜间施工','建筑施工噪声','无连续施工证明'],
 'code-1229':['拒绝检查','阻挠检查','拒不提供资料','围堵执法'],
 'code-1233':['未建立责任制度','污染防治责任制度']};
const generic=['污染物','生态环境','有关','规定','行为','单位','按照','未按','项目','管理','排放'];
function termsFor(r){const words=(r.title.match(/[\u4e00-\u9fff]{2,}/g)||[]).flatMap(w=>{const out=[];for(let i=0;i<w.length-1;i++)out.push(w.slice(i,i+2));return out;}).filter(w=>!generic.includes(w));return [...new Set([...(hints[r.id]||[]),...words])];}
export function matchRules(description,category='全部'){const q=String(description||'').trim().toLowerCase();if(q.length<2)return [];return statutes.filter(r=>category==='全部'||r.category===category).map(r=>{const hits=termsFor(r).filter(t=>q.includes(t.toLowerCase())),specific=hits.filter(t=>(hints[r.id]||[]).includes(t));return {rule:r,hits,score:specific.length*12+hits.reduce((n,t)=>n+Math.min(5,t.length),0)};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.rule.id.localeCompare(b.rule.id)).slice(0,12);}
export function formatRange(range){return range.minWan==null?'可处 '+range.maxWan+' 万元以下':range.minWan+'–'+range.maxWan+' 万元';}
export function calculateRange(range,percent,basis){if(!basis?.trim())throw Error('请填写本次使用的有效裁量基准名称/条目');if(range.minWan==null)throw Error('条文未明示数值下限，本工具不补造下限');if(typeof percent!=='number'||!Number.isFinite(percent)||percent<0||percent>100)throw Error('幅度内位置为0–100的数值');return {amountWan:Math.round((range.minWan+(range.maxWan-range.minWan)*percent/100)*1e6)/1e6,minWan:range.minWan,maxWan:range.maxWan,percent,basis:basis.trim(),formula:`${range.minWan} + (${range.maxWan} − ${range.minWan}) × ${percent}%`};}
export const FACTORS=[['harm','主动消除或减轻危害后果','从轻或减轻'],['repair','有效采取生态环境修复措施','从轻或减轻'],['compensation','及时缴纳赔偿金','从轻或减轻'],['minor','违法行为轻微、及时改正且没有危害后果','不予处罚'],['first','初次违法、危害后果轻微且及时改正','可以不予处罚'],['malicious','恶意损害生态环境','依法从重'],['refusal','拒不改正违法行为','依法从重'],['serious','造成严重危害后果','依法从重'],['repeat','多次实施违法行为被处罚','依法从重']].map(([id,text,effect])=>({id,text,effect}));
const scenes={
 '排污许可':[['许可范围与实际情况','核对有效期、排口、污染物种类及变更资料'],['许可浓度与许可量','核对适用期间、监测报告及许可要求'],['生产与治理设施','核对运行工况、台账、用电及药剂记录'],['自行监测和设备','核对方案、设备、联网及原始记录'],['台账与执行报告','核查记录内容、报告周期与留存资料'],['信息公开','留存公开页面及核查时点']],
 '自动监测':[['设备和参数','比对设备状态、参数设置和相关备案资料'],['采样点位与管路','核查旁路、稀释、遮挡及采样环境并记录所见'],['视频与联网','按适用要求核查点位视频、自动设备联网和异常报告'],['运维校准','核查维护保养、检定校准和耗材记录'],['原始与上传数据','比对数据、异常时段和数据缺口，不仅凭稳定曲线判断'],['生产工况','交叉核对生产负荷、污染治理运行及手工监测记录']],
 '危废':[['识别标志','核查标志、包装标签与实际废物对应关系'],['分类和防护','核查相容性、容器、防渗、分区和收集措施'],['计划与管理台账','比对管理计划、申报、库存与记录'],['转移过程','核对转移联单、批准条件及接收去向'],['许可证与经营范围','核查委托和接收主体许可、有效期及范围'],['应急措施','核查适用应急预案、防范措施和物资记录']],
 '废水':[['排放口','核对设置依据、排口位置及实际用途'],['排放路径','沿可见路径核查软管、雨沟、暗管、渗井等并固定位置'],['处理设施','记录曝气、加药、污泥处理和生产工况'],['监测比对','记录采样条件、检测结果与时段，核查是否可比较'],['雨污分流','核查雨水排口和初期雨水设施实际情况'],['污泥去向','核查属性判定、贮存、合同和转移处置材料']],
 '废气':[['收集方式','核查密闭、收集、集气装置及实际工况'],['治理设施','记录运行参数、耗材与旁路阀状态'],['异常排放','记录异常排放路径、时段及相关证据'],['物料贮存','核查密闭、围挡高度和覆盖状况'],['无组织排放','记录厂界和恶臭防治措施，按需核查监测资料'],['监测条件','核查采样孔、平台和适用技术规范']],
 '扬尘工地':[['围挡和出入口','记录围挡、车辆冲洗设施实际状况'],['土方作业','核查覆盖、分段施工和洒水等防尘降尘措施'],['清运与堆存','记录建筑土方清运和防尘覆盖情况'],['闲置地块','核实不能开工时长及相应绿化、铺装或覆盖措施'],['运输车辆','核查密闭、防遗撒和适用运输路线'],['应急措施','核查是否处于适用应急响应及有关停止作业要求']]};
export const CHECKLISTS=Object.fromEntries(Object.entries(scenes).map(([name,items],s)=>[name,items.map(([title,hint],i)=>({id:`scene-${s}-${i}`,title,hint}))]));
export const STATES={pending:'待核实',yes:'已核实',issue:'发现问题',na:'不适用'};
export function newCase(){return {id:uid(),title:'未命名核查记录',revision:0,date:(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(),description:'',note:'',ruleIds:[],factors:[],scene:'排污许可',sceneChecks:{},checks:CHECKLISTS['排污许可'].map(i=>({id:i.id,state:'pending',note:''})),scenario:null};}
const text=(v,max,required=false)=>typeof v==='string'&&v.length<=max&&(!required||v.trim().length>0);
const validChecks=(scene,checks)=>Object.hasOwn(CHECKLISTS,scene)&&Array.isArray(checks)&&checks.length===CHECKLISTS[scene].length&&new Set(checks.map(v=>v?.id)).size===checks.length&&checks.every(v=>v&&CHECKLISTS[scene].some(item=>item.id===v.id)&&Object.hasOwn(STATES,v.state)&&text(v.note,2000));
export function switchCaseScene(c,next){if(!Object.hasOwn(CHECKLISTS,next)||!validChecks(c.scene,c.checks))throw Error('检查场景或当前清单无效');if(next===c.scene)return c;const history={...(c.sceneChecks||{}),[c.scene]:structuredClone(c.checks)},checks=history[next]||CHECKLISTS[next].map(item=>({id:item.id,state:'pending',note:''}));if(!validChecks(next,checks))throw Error('保存的场景清单无效');delete history[next];return {...c,scene:next,checks:structuredClone(checks),sceneChecks:history};}
export function validateCase(c){if(!c||typeof c!=='object'||!/^[-_A-Za-z0-9]{1,80}$/.test(c.id)||!text(c.title,120,true)||!text(c.description,10000)||!text(c.note,10000)||!/^\d{4}-\d\d-\d\d$/.test(c.date)||Number.isNaN(Date.parse(c.date+'T12:00:00'))||new Date(c.date+'T12:00:00').getDate()!==Number(c.date.slice(-2)))throw Error('记录基本信息无效');if(!Array.isArray(c.ruleIds)||c.ruleIds.some(id=>!statutes.some(r=>r.id===id))||!Array.isArray(c.factors)||c.factors.some(id=>!FACTORS.some(f=>f.id===id)))throw Error('引用条款或核查情节无效');if(!validChecks(c.scene,c.checks))throw Error('检查清单无效');if(c.sceneChecks!==undefined&&(!c.sceneChecks||typeof c.sceneChecks!=='object'||Array.isArray(c.sceneChecks)||Object.entries(c.sceneChecks).some(([scene,checks])=>scene===c.scene||!validChecks(scene,checks))))throw Error('其他场景清单无效');if(c.scenario){const r=statutes.find(r=>r.id===c.scenario.ruleId),range=r?.ranges[c.scenario.rangeIndex];if(!range)throw Error('幅度测算档次无效');calculateRange(range,c.scenario.percent,c.scenario.basis);}return c;}
export function caseText(c){validateCase(c);return `现场核查记录：${c.title}\n日期：${c.date}\n\n现场描述\n${c.description||'未填写'}\n\n候选/引用条款（待结合事实与要件审核）\n${c.ruleIds.map(id=>{const r=statutes.find(r=>r.id===id);return r.law+' 第'+r.article+'条 '+r.title+'\n'+r.url;}).join('\n')||'未选择'}\n\n${c.scene}检查清单\n${c.checks.map((i,n)=>`${n+1}. ${CHECKLISTS[c.scene].find(x=>x.id===i.id).title}：[${STATES[i.state]}] ${i.note}`).join('\n')}\n\n法定情节核查（不自动赋予加减百分比）\n${c.factors.map(id=>{const f=FACTORS.find(f=>f.id===id);return f.text+'：'+f.effect;}).join('\n')||'未选择'}\n\n幅度算术记录\n${c.scenario?(()=>{const r=statutes.find(r=>r.id===c.scenario.ruleId),v=calculateRange(r.ranges[c.scenario.rangeIndex],c.scenario.percent,c.scenario.basis);return r.law+' 第'+r.article+'条，'+r.ranges[c.scenario.rangeIndex].label+'\n'+v.formula+' = '+v.amountWan+' 万元\n使用者填写的基准：'+v.basis;})():'未记录'}\n\n补充备注\n${c.note||'未填写'}\n\n信息为个人核查辅助，须核对事实、适用条文与有效裁量基准。`;}
export function sampleCases(){const c=newCase();c.id='sample-inspection';c.revision=1;c.title='合成示例 · 废水排放路径核查';c.date='2026-10-22';c.description='现场见一段软管连接雨水沟，需核实来源、实际排水成分和设施运行情况。';c.scene='废水';c.checks=CHECKLISTS['废水'].map((i,n)=>({id:i.id,state:n===1?'issue':'pending',note:n===1?'仅为合成示例，尚需核对排放事实和证据。':''}));c.ruleIds=['code-1108'];return [c];}
