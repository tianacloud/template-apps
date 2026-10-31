import DOMPurify from 'dompurify';
import { sql } from './sql.js';
export async function mount(root, {files}) {
const link=document.createElement('link'); link.rel='stylesheet'; link.href=new URL('./style.css',import.meta.url).href; document.head.appendChild(link);
root.innerHTML = DOMPurify.sanitize("\n\n<div id=\"login\" data-page-node-id=\"0W2o76r1y0knQ4GrElLyw6\">\n  <div class=\"login-card\" data-page-node-id=\"zczt0vBArZ6QHX6KHNOjRF\">\n    <h1 data-page-node-id=\"SsMMjHdvoHzdDF70FDPdqK\">企业内部物资进销存</h1>\n    <div class=\"sub\" data-page-node-id=\"bqOx3baL5HHvSYviN5N3je\">办公 / 劳保用品管理平台 · V4 交互原型</div>\n    <div class=\"field\" data-page-node-id=\"zFcUqTSMjrWQCoYKDmgq37\">\n      <label data-page-node-id=\"0azBkldYxfNSXbL6mE0dZW\">用户名</label>\n      <input id=\"login-user\" placeholder=\"请输入用户名\" data-page-node-id=\"ZFtJpu8lk8vszTnSQZ19IR\">\n    </div>\n    \n        <button class=\"btn\" style=\"width:100%\" data-hclick=\"0\" data-page-node-id=\"ohMlKzQrNcalvztp5kK5ra\">登 录</button>\n    <div style=\"text-align:center;color:var(--muted);font-size:11px;margin-top:14px;\" data-page-node-id=\"RE2G1XWDqGyMSdu7gv1sL7\">演示角色仅用于流程模拟，业务数据保存在云端数据库<br data-page-node-id=\"A7EB70z7Owd9txRBXJgnPJ\">演示账号：小王（行政专员）/ 小李（技术部专员）/ 小张（技术部主管）/ 行政主管 / 分管副总，选择演示角色进入</div>\n  </div>\n</div>\n\n<div id=\"app\" data-page-node-id=\"0qLSN7eJr9gDKNrRGhonx6\">\n  <div class=\"topbar\" data-page-node-id=\"ilcFbMs3AwDNuCwmFtuSF9\">\n    <button class=\"menu-btn\" data-hclick=\"1\" aria-label=\"菜单\" data-page-node-id=\"B5LywWoOrwV2nEr9Lq3A09\">☰</button>\n    <div class=\"logo\" data-page-node-id=\"NMCc3vMzXTEb5Vnj3DyuRN\">📦 物资进销存</div>\n    <div class=\"spacer\" data-page-node-id=\"8GVeBgdAHIHC3DnUAKkmuS\"></div>\n    <div class=\"who\" data-page-node-id=\"bsYwCnsfXVl46sse8B3V3B\">角色：<b id=\"who-role\" data-page-node-id=\"sIDQwQ5VbR86BI3N0sDma8\"></b> · <span id=\"who-name\" data-page-node-id=\"soeOJJ2CiDYnp8Ql5nDfU6\"></span></div>\n    <button class=\"btn ghost sm\" data-hclick=\"2\" style=\"margin-left:14px;\" data-page-node-id=\"5Ev6D6oHGnKsANGDDTvpvB\">退出</button>\n  </div>\n  <div class=\"layout\" data-page-node-id=\"9nT5n87dQOpHrjBAXvPXD8\">\n    <div class=\"sidebar-backdrop\" id=\"sidebar-backdrop\" data-hclick=\"3\" data-page-node-id=\"85bHKf8aLvdFN8eCQxZAS6\"></div>\n    <div class=\"sidebar\" id=\"sidebar\" data-page-node-id=\"x6On7LjRB9Q8wHeXfvYH8T\"></div>\n    <div class=\"content\" id=\"content\" data-page-node-id=\"mBq4gZIFvTZB7Gyy3gLmSp\"></div>\n  </div>\n</div>\n\n<div class=\"modal-mask\" id=\"modal\" data-page-node-id=\"gE375xZRJXeuc1pYh4cbdY\"><div class=\"modal\" id=\"modal-box\" data-page-node-id=\"EMYkYn8Z7vl8086BFn3YE0\"></div></div>\n<div class=\"toast\" id=\"toast\" data-page-node-id=\"sob7ZcgMkZDYuzHTAtz5Pt\"></div>\n\n");

/* ===================== 数据层 ===================== */

const USERS=[
  {username:'小王',name:'小王',role:'admin',roleName:'行政专员',dept:'行政部'},
  {username:'小李',name:'小李',role:'staff',roleName:'技术部专员',dept:'技术部'},
  {username:'小张',name:'小张',role:'deptLead',roleName:'技术部主管',dept:'技术部'},
  {username:'行政主管',name:'行政主管',role:'adminLead',roleName:'行政主管',dept:'行政部'},
  {username:'分管副总',name:'分管副总',role:'vp',roleName:'分管副总',dept:'行政部'}
];
const DEPTS=['工程部','行政部','人事部','财务部','市场部','生产部','采购部','总经办'];
const seed=()=>({
  currentUser:null,
  materials:[
    {id:1,code:'WL001',name:'A4打印纸',spec:'70g 500张/包',unit:'包',cat:'办公用品',supplier:'甲办公用品供应商',price:25,stock:40,warnQty:20,expire:'',location:'A架-1',owner:'行政部'},
    {id:2,code:'WL002',name:'中性笔',spec:'0.5mm 黑',unit:'支',cat:'办公用品',supplier:'晨光',price:2,stock:8,warnQty:30,expire:'',location:'A架-2',owner:'行政部'},
    {id:3,code:'LB001',name:'一次性口罩',spec:'医用 50只/盒',unit:'盒',cat:'劳保用品',supplier:'乙劳保用品供应商',price:35,stock:60,warnQty:20,expire:'2027-06-30',location:'B柜-1',owner:'行政部'},
    {id:4,code:'LB002',name:'棉纱手套',spec:'加厚',unit:'副',cat:'劳保用品',supplier:'丙劳保用品供应商',price:6,stock:90,warnQty:40,expire:'',location:'B柜-2',owner:'行政部'},
    {id:5,code:'WL003',name:'文件夹',spec:'A4 双夹',unit:'个',cat:'办公用品',supplier:'甲办公用品供应商',price:9,stock:55,warnQty:25,expire:'',location:'A架-3',owner:'行政部'}
  ],
  suppliers:[
    {id:1,name:'甲办公用品供应商',contact:'王经理',phone:'13800000001',addr:'本地',type:'经销商',salesCategory:'办公用品',products:'打印纸/笔类/文件夹',contracted:'是',isTemplate:'是',contractType:'框架协议',templateName:'办公用品采购框架合同',contractNo:'HT2026-001',contractStart:'2026-01-01',contractEnd:'2026-12-31',manager:'小王',contractProgress:'执行中',remarks:'长期合作供应商',fax:'',email:'',bank:'',account:'',taxNo:''},
    {id:2,name:'乙劳保用品供应商',contact:'李经理',phone:'13800000002',addr:'本地',type:'厂家',salesCategory:'劳保用品',products:'口罩/手套/防护服',contracted:'是',isTemplate:'否',contractType:'单次合同',templateName:'',contractNo:'HT2026-002',contractStart:'2026-03-01',contractEnd:'2026-09-30',manager:'小王',contractProgress:'执行中',remarks:'医用耗材定点',fax:'',email:'',bank:'',account:'',taxNo:''},
    {id:3,name:'丙劳保用品供应商',contact:'赵经理',phone:'13800000003',addr:'本地',type:'经销商',salesCategory:'劳保用品',products:'手套/防护眼镜',contracted:'否',isTemplate:'否',contractType:'',templateName:'',contractNo:'',contractStart:'',contractEnd:'',manager:'小王',contractProgress:'未签约',remarks:'待开发',fax:'',email:'',bank:'',account:'',taxNo:''}
  ],
  demands:[
    {id:1,no:'XQ2026-001',applyDate:'2026-07-16',date:'2026-07-16',applicant:'小李',dept:'技术部',isRepeat:'否',items:[{cat:'劳保用品',name:'棉纱手套',spec:'加厚',q:20,unit:'副'}],reason:'车间使用',expectedUse:'2026-07-20',recommend:'',budget:'',status:'pending_dept',deptApprover:'',receiver:'',assignee:'',note:''},
    {id:2,no:'XQ2026-002',applyDate:'2026-07-18',date:'2026-07-18',applicant:'小王',dept:'行政部',isRepeat:'否',items:[{cat:'办公用品',name:'中性笔',spec:'0.5mm 黑',q:50,unit:'支'},{cat:'办公用品',name:'A4打印纸',spec:'70g 500张/包',q:10,unit:'包'}],reason:'日常办公',expectedUse:'2026-07-22',recommend:'',budget:'',status:'pending_adminLead',deptApprover:'',receiver:'',assignee:'',note:''}
  ],
  purchaseReqs:[
    {id:1,no:'CGSQ2026-001',date:'2026-07-19',applicant:'小王',dept:'行政部',requester:'小王',requesterDept:'行政部',items:[{p:2,q:50,price:2,name:'中性笔',spec:'0.5mm 黑',brand:'晨光'},{p:1,q:30,price:25,name:'A4打印纸',spec:'70g 500张/包',brand:'甲办公'}],reason:'补充日常办公',status:'pending_admin',approverLead:'',approverVp:'',note:''}
  ],
  purchases:[
    {id:1,no:'RK2026-001',date:'2026-07-10',supplier:'甲办公用品供应商',refReq:'',items:[{p:1,q:50,price:25,location:'A架-1',owner:'行政部'}],handler:'小王',status:'done'},
    {id:2,no:'RK2026-002',date:'2026-07-15',supplier:'乙劳保用品供应商',refReq:'',items:[{p:3,q:60,price:35,location:'B柜-1',owner:'行政部'}],handler:'小王',status:'done'}
  ],
  issues:[
    {id:1,no:'LY2026-001',date:'2026-07-16',applicant:'小李',dept:'技术部',items:[{p:4,q:20}],reason:'车间使用',status:'done',approver:'行政主管',cc:'行政专员',note:''}
  ],
  flows:[
    {id:1,date:'2026-07-10',type:'in',ref:'RK2026-001',p:1,q:50,after:90,op:'小王'},
    {id:2,date:'2026-07-15',type:'in',ref:'RK2026-002',p:3,q:60,after:60,op:'小王'},
    {id:3,date:'2026-07-16',type:'out',ref:'LY2026-001',p:4,q:20,after:90,op:'行政部'}
  ],
  counts:[],
  settings:{}
});
let DB=seed();
let revision=0, saving=false, failed=false, recoveredAttachments=[], editingSupplierId=0;
const status=document.createElement('div');
status.setAttribute('role','status');
Object.assign(status.style,{position:'fixed',inset:'0',zIndex:'99999',background:'rgba(255,255,255,.92)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',textAlign:'center'});
root.appendChild(status);
function statePayload(){ const {currentUser,...data}=DB; return JSON.stringify(data); }
async function load(){
  const result=await sql('SELECT revision, payload FROM inventory_state WHERE id = 1');
  if(result.rows.length){ const row=result.rows[0]; const value=JSON.parse(row.payload); if(!value.materials) throw new Error('数据格式错误'); DB={...value,currentUser:null}; revision=Number(row.revision); }
  else { DB=seed(); const payload=statePayload(); await sql('INSERT OR IGNORE INTO inventory_state (id, revision, payload) VALUES (1, 0, ?)',[payload]); const read=await sql('SELECT revision, payload FROM inventory_state WHERE id = 1'); if(!read.rows.length) throw new Error('初始化未确认'); revision=Number(read.rows[0].revision); DB={...JSON.parse(read.rows[0].payload),currentUser:null}; }
}
function save(){
  if(failed || saving) return;
  const payload=statePayload(), expected=revision; saving=true; status.style.display='flex'; status.textContent='正在保存，请稍候…';
  (async()=>{
    try {
      const result=await sql('UPDATE inventory_state SET payload = ?, revision = revision + 1 WHERE id = 1 AND revision = ?', [payload,expected]);
      if(result.affectedRows!==1) throw new Error('数据已被其他会话修改，请重新加载后检查。');
      revision=expected+1; recoveredAttachments=recoveredAttachments.filter(item=>!payload.includes(item.path)); if(recoveredAttachments.length) sessionStorage.setItem('pending-inventory-upload',JSON.stringify(recoveredAttachments)); else sessionStorage.removeItem('pending-inventory-upload'); saving=false; status.style.display='none';
    } catch(error) {
      failed=true; saving=false; status.textContent='保存未确认或数据已被其他会话修改。请重新加载并核对记录后再操作；不要重复提交。';
    }
  })();
}

const mat=id=>DB.materials.find(x=>x.id===id)||{};
const mname=id=>mat(id).name||'-'; const mprice=id=>mat(id).price||0;
const prItemName=i=>i.name||mname(i.p)||'-';
const prItemSpec=i=>i.spec||mat(i.p).spec||'-';
const nextNo=prefix=>{ const all=[...DB.demands,...DB.purchaseReqs,...DB.purchases,...DB.issues,...DB.counts]; const n=all.filter(x=>x.no&&x.no.startsWith(prefix)).length+1; return prefix+String(n).padStart(3,'0'); };
function sanitizeRows(html){const template=document.createElement('template'); template.innerHTML=DOMPurify.sanitize('<table><tbody>'+html+'</tbody></table>'); return template.content.querySelector('tbody')?.innerHTML || ''; }
function sanitizeCells(html){const template=document.createElement('template'); template.innerHTML=DOMPurify.sanitize('<table><tbody><tr>'+html+'</tr></tbody></table>'); return template.content.querySelector('tr')?.innerHTML || ''; }
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=id=>{const e=document.getElementById(id);return e?e.value:'';};
const num=id=>Number(val(id))||0;

/* ===================== 登录 ===================== */
function doLogin(){
  const user=val('login-user').trim();
  if(!user){ toast('请输入演示角色'); return; }
  const u=USERS.find(x=>x.username===user||x.name===user)||{username:user,name:user,role:'staff',roleName:'员工',dept:'未知部门'};
  DB.currentUser={...u}; enter();
}
function doLogout(){ DB.currentUser=null; document.getElementById('app').style.display='none'; document.getElementById('login').style.display='flex'; }
function enter(){
  const u=DB.currentUser; if(!u) return;
  document.getElementById('login').style.display='none'; document.getElementById('app').style.display='block';
  document.getElementById('who-role').textContent=u.roleName;
  document.getElementById('who-name').textContent=u.name;
  buildSidebar(); showView('dashboard');
}

/* ===================== 侧边栏 ===================== */
function buildSidebar(){
  const r=DB.currentUser.role;
  const pending=countPending();
  const isAdmin=['admin','adminLead','vp'].includes(r);
  const items=[{v:'dashboard',ic:'🏠',t:'仪表盘'}];
  items.push({sec:'需求与任务'});
  items.push({v:'demand',ic:'📝',t:'需求提报'},{v:'demandList',ic:'📋',t:'需求列表'});
  if(isAdmin) items.push({v:'task',ic:'🎯',t:'任务分配'});
  items.push({sec:'采购'});
  if(isAdmin) items.push({v:'purReq',ic:'📑',t:'采购申请'},{v:'stockIn',ic:'📥',t:'采购入库'});
  items.push({sec:'领用与库存'});
  items.push({v:'issue',ic:'📤',t:'领用申请'},{v:'approve',ic:'✅',t:'审批中心',badge:pending});
  if(isAdmin) items.push({v:'inventory',ic:'🗃️',t:'库存统计'},{v:'count',ic:'🔍',t:'盘点'});
  items.push({sec:'我的'}); items.push({v:'myrec',ic:'👤',t:'我的记录'});
  if(isAdmin){ items.push({sec:'基础数据'}); items.push({v:'materials',ic:'📦',t:'物资档案'},{v:'suppliers',ic:'🏭',t:'供应商'}); }
  if(isAdmin){ items.push({sec:'统计与设置'}); items.push({v:'cost',ic:'💰',t:'成本统计'},{v:'settings',ic:'⚙️',t:'系统设置'}); }
  let html='';
  items.forEach(it=>{ if(it.sec) html+=`<div class="nav-sec">${it.sec}</div>`; else html+=`<div class="nav-item" data-v="${it.v}" data-hclick="4" data-aclick="${encodeURIComponent(JSON.stringify(it.v))}">${it.ic}<span>${it.t}</span>${it.badge?`<span class="badge">${it.badge}</span>`:''}</div>`; });
  document.getElementById('sidebar').innerHTML=DOMPurify.sanitize(html);
}
function countPending(){
  const r=DB.currentUser.role; const u=DB.currentUser; let n=0;
  if(r==='deptLead') n+=DB.demands.filter(d=>d.status==='pending_dept'&&d.dept===u.dept).length;
  if(r==='adminLead') n+=DB.demands.filter(d=>d.status==='pending_adminLead').length;
  if(r==='vp') n+=DB.demands.filter(d=>d.status==='pending_vp').length;
  if(['admin','adminLead','vp'].includes(r)) n+=DB.issues.filter(x=>x.status==='pending').length;
  if(r==='adminLead') n+=DB.purchaseReqs.filter(x=>x.status==='pending_admin').length;
  if(r==='vp') n+=DB.purchaseReqs.filter(x=>x.status==='pending_vp').length;
  return n;
}
function showView(v){ document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.v===v)); const c=document.getElementById('content'); (VIEWS[v]||renderDashboard)(c); closeSidebar(); }
function toggleSidebar(){ const s=document.getElementById('sidebar'); const b=document.getElementById('sidebar-backdrop'); s.classList.toggle('open'); b.classList.toggle('show'); }
function closeSidebar(){ const s=document.getElementById('sidebar'); const b=document.getElementById('sidebar-backdrop'); s.classList.remove('open'); b.classList.remove('show'); }
const VIEWS={dashboard:renderDashboard,demand:renderDemand,demandList:renderDemandList,task:renderTask,purReq:renderPurReq,stockIn:renderStockIn,issue:renderIssue,approve:renderApprove,inventory:renderInventory,count:renderCount,materials:renderMaterials,suppliers:renderSuppliers,cost:renderCost,settings:renderSettings,myrec:renderMyRec};

/* ===================== 仪表盘（工作台） ===================== */
function catDonut(){
  const map={}; DB.materials.forEach(p=>{ map[p.cat]=(map[p.cat]||0)+p.stock*p.price; });
  const entries=Object.entries(map); const total=entries.reduce((s,e)=>s+e[1],0)||1;
  const colors=['#2f6fed','#1faa6b','#e8a33d','#7a5cf0','#e0584b','#21b3c9'];
  let acc=0; const segs=entries.map((e,i)=>{ const frac=e[1]/total; const a0=acc*2*Math.PI-Math.PI/2; acc+=frac; const a1=acc*2*Math.PI-Math.PI/2; const r=48; const x0=(50+r*Math.cos(a0)).toFixed(2), y0=(50+r*Math.sin(a0)).toFixed(2); const x1=(50+r*Math.cos(a1)).toFixed(2), y1=(50+r*Math.sin(a1)).toFixed(2); const large=frac>0.5?1:0; return `<path d="M50 50 L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${colors[i%colors.length]}"><title>${e[0]}: ¥${Math.round(e[1]).toLocaleString()}</title></path>`; }).join('');
  const legend=entries.map((e,i)=>`<div style="font-size:12px;margin:3px 0;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${colors[i%colors.length]};margin-right:6px;"></span>${e[0]} ¥${Math.round(e[1]).toLocaleString()}</div>`).join('');
  return `<div style="display:flex;align-items:center;"><svg viewBox="0 0 100 100" width="160" height="160" style="overflow:visible;">${segs}</svg><div style="margin-left:12px;">${legend}</div></div>`;
}
function renderDashboard(c){
  const u=DB.currentUser; const r=u.role;
  const canSeeAdmin=u.dept==='行政部'||r==='vp';
  const low=DB.materials.filter(p=>p.stock<=p.warnQty).length;
  const pending=countPending();
  const stockVal=DB.materials.reduce((s,p)=>s+p.stock*p.price,0);
  const myDemandsTodo=DB.demands.filter(d=>d.applicant===u.name&&d.status!=='received').length;
  const myIssuesTodo=DB.issues.filter(x=>x.applicant===u.name&&x.status==='pending').length;
  const myTodo=myDemandsTodo+myIssuesTodo;
  const ym=new Date().toISOString().slice(0,7);
  const monthPur=DB.purchases.filter(p=>(p.date||'').slice(0,7)===ym).reduce((s,p)=>s+p.items.reduce((a,i)=>a+i.q*i.price,0),0);
  const monthIssue=DB.issues.filter(x=>x.status==='done'&&(x.date||'').slice(0,7)===ym).reduce((s,x)=>s+x.items.reduce((a,i)=>a+i.q*mprice(i.p),0),0);
  const hour=new Date().getHours(); const greet=hour<12?'上午好':hour<18?'下午好':'晚上好';
  const dateStr=new Date().toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  // 供应商合同到期提醒
  const now=new Date();
  const expiring=DB.suppliers.filter(s=>{
    if(!s.contractEnd) return false;
    const end=new Date(s.contractEnd);
    const days=(end-now)/(1000*60*60*24);
    return days>=-7 && days<=30;
  }).sort((a,b)=>new Date(a.contractEnd)-new Date(b.contractEnd));
  const contractAlertHtml=canSeeAdmin&&expiring.length?`<div class="card" style="background:#fff7e6;border:1px solid #ffd591;margin-bottom:16px;"><div style="display:flex;align-items:center;gap:10px;"><span style="font-size:22px;">⚠️</span><div><div style="font-weight:700;color:#d46b08;font-size:15px;">供应商合同即将到期提醒</div><div style="color:#873800;font-size:13px;margin-top:4px;">${expiring.map(s=>`${s.name}（合同终止：${s.contractEnd}）`).join('、')}</div></div></div></div>`:'';
  // 待办列表（按角色）
  const todos=[];
  if(r==='deptLead') todos.push({t:'待审批需求',n:DB.demands.filter(d=>d.status==='pending_dept'&&d.dept===u.dept).length,v:'demandList'});
  if(r==='adminLead') todos.push({t:'待审批需求',n:DB.demands.filter(d=>d.status==='pending_adminLead').length,v:'demandList'});
  if(r==='vp'){ todos.push({t:'待审批需求',n:DB.demands.filter(d=>d.status==='pending_vp').length,v:'demandList'}); todos.push({t:'待审批采购',n:DB.purchaseReqs.filter(p=>p.status==='pending_vp').length,v:'purReq'}); }
  if(r==='adminLead') todos.push({t:'待审批采购',n:DB.purchaseReqs.filter(p=>p.status==='pending_admin').length,v:'purReq'});
  if(['admin','adminLead','vp'].includes(r)) todos.push({t:'待审批领用',n:DB.issues.filter(x=>x.status==='pending').length,v:'approve'});
  if(canSeeAdmin){
    todos.push({t:'待执行任务',n:DB.demands.filter(d=>d.status==='assigned'&&!d.done).length,v:'task'});
    todos.push({t:'低库存预警项',n:low,v:'inventory'});
  }
  todos.push({t:'我的提交待办',n:myTodo,v:'myrec'});
  const todoHtml=todos.filter(x=>x.n>0).length?todos.map(x=>`<div class="todo-item" data-hclick="5" data-aclick="${encodeURIComponent(JSON.stringify(x.v))}"><span class="t">${x.t}</span><span class="cnt ${x.t.indexOf('低库存')>=0?'red':(x.t.indexOf('待审批')>=0||x.t.indexOf('待执行')>=0?'amber':'green')}">${x.n}</span></div>`).join(''):'<div class="empty">暂无待办 🎉</div>';
  // 重点关注动态
  const feeds=[];
  const filterByPerm=(arr,getDept,getApplicant)=>arr.filter(x=>{
    if(canSeeAdmin) return true;
    if(r==='deptLead') return getDept(x)===u.dept;
    return getApplicant(x)===u.name;
  });
  filterByPerm(DB.demands,d=>d.dept,d=>d.applicant).forEach(d=>feeds.push({date:d.date,text:'需求提报 '+d.no+' · '+d.applicant+'（'+d.dept+'）'}));
  if(canSeeAdmin||r==='deptLead') DB.purchaseReqs.forEach(p=>feeds.push({date:p.date,text:'采购申请 '+p.no+' · '+p.applicant}));
  else DB.purchaseReqs.filter(p=>p.applicant===u.name).forEach(p=>feeds.push({date:p.date,text:'采购申请 '+p.no+' · '+p.applicant}));
  filterByPerm(DB.issues,x=>x.dept,x=>x.applicant).forEach(x=>feeds.push({date:x.date,text:'领用申请 '+x.no+' · '+x.applicant}));
  if(canSeeAdmin) DB.purchases.forEach(p=>feeds.push({date:p.date,text:'采购入库 '+p.no+' · '+p.supplier}));
  feeds.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const top=feeds.slice(0,5);
  const feedHtml=top.length?top.map(f=>`<div class="feed-item"><span class="fd">${f.date||''}</span><span>${f.text}</span></div>`).join(''):'<div class="empty">暂无动态</div>';
  const lowRows=DB.materials.filter(p=>p.stock<=p.warnQty);
  const lowHtml=lowRows.length?`<table><thead><tr><th>物料编码</th><th>名称</th><th>规格</th><th>当前库存</th><th>库存预警数量</th><th>状态</th></tr></thead><tbody>${lowRows.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td>${p.spec}</td><td>${p.stock}${p.unit}</td><td>${p.warnQty}${p.unit}</td><td><span class="tag low">需补货</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无低库存物品 🎉</div>';
  const statsHtml=canSeeAdmin?`
      <div class="card stat clickable" data-hclick="6"><div class="label">物资种类</div><div class="num">${DB.materials.length}</div></div>
      <div class="card stat clickable" data-hclick="7"><div class="label">库存总额(估)</div><div class="num green">¥${stockVal.toLocaleString()}</div></div>
      <div class="card stat clickable" data-hclick="8"><div class="label">低库存预警</div><div class="num ${low?'red':'green'}">${low}</div></div>
      <div class="card stat clickable" data-hclick="9"><div class="label">待我审批</div><div class="num ${pending?'amber':'green'}">${pending}</div></div>
      <div class="card stat clickable" data-hclick="10"><div class="label">我的待办</div><div class="num ${myTodo?'amber':'green'}">${myTodo}</div></div>
      <div class="card stat"><div class="label">本月采购金额</div><div class="num">¥${monthPur.toLocaleString()}</div></div>
      <div class="card stat"><div class="label">本月领用金额</div><div class="num green">¥${monthIssue.toLocaleString()}</div></div>
      <div class="card stat clickable" data-hclick="11"><div class="label">合同续约提醒</div><div class="num ${expiring.length?'red':'green'}">${expiring.length}</div></div>`:`
      <div class="card stat clickable" data-hclick="12"><div class="label">待我审批</div><div class="num ${pending?'amber':'green'}">${pending}</div></div>
      <div class="card stat clickable" data-hclick="13"><div class="label">我的待办</div><div class="num ${myTodo?'amber':'green'}">${myTodo}</div></div>`;
  const bottomHtml=canSeeAdmin?`
    <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:16px;">
      <div class="card"><h3 style="margin-bottom:12px;">今日 / 本周待办</h3>${todoHtml}</div>
      <div class="card"><h3 style="margin-bottom:12px;">库存分类占比</h3>${catDonut()}</div>
    </div>
    <div class="card" style="margin-top:16px;"><h3 style="margin-bottom:12px;">重点关注（最新动态）</h3>${feedHtml}</div>
    <details class="card" style="margin-top:16px;"><summary>低库存预警清单（${low}）</summary><div style="margin-top:10px;">${lowHtml}</div></details>`:`
    <div class="grid" style="grid-template-columns:1fr;margin-top:16px;">
      <div class="card"><h3 style="margin-bottom:12px;">今日 / 本周待办</h3>${todoHtml}</div>
    </div>
    <div class="card" style="margin-top:16px;"><h3 style="margin-bottom:12px;">重点关注（最新动态）</h3>${feedHtml}</div>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><div><span class="greet">${greet}，${u.name}！</span><span class="date">${dateStr}</span></div></div>
    ${contractAlertHtml}
    <div class="grid stats">${statsHtml}</div>${bottomHtml}`);
}

/* ===================== 物资档案 ===================== */
function renderMaterials(c){
  const rows=DB.materials.map(p=>`<tr><td>${p.code}</td><td>${p.name}</td><td>${p.spec}</td><td>${p.unit}</td><td>${p.cat}</td><td>${p.supplier}</td><td>¥${p.price}</td><td>${p.stock}${p.unit}</td><td>${p.location}</td><td>${p.stock<=p.warnQty?'<span class="tag low">低</span>':'<span class="tag ok">正常</span>'}</td><td>${p.expire||'-'}</td></tr>`).join('');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>物资档案</h2><span class="desc">维护物资基础信息</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="14">📥 Excel 导入</button><button class="btn sm" data-hclick="15" style="margin-left:8px;">+ 新建物资</button></div>
    <div class="card"><table><thead><tr><th>物料编码</th><th>名称</th><th>规格</th><th>单位</th><th>类别</th><th>默认供应商</th><th>单价</th><th>库存</th><th>存放位置</th><th>状态</th><th>效期</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
function showImport(){ openModal(`<h3>Excel 导入</h3><div class="body">当前不支持导入物资档案，可手动新建。参考字段：<br><b>物料编码 / 名称 / 规格型号 / 单位 / 类别 / 默认供应商 / 参考单价 / 库存预警数量 / 存放位置 / 责任人 / 保质期</b><br><br></div><div class="foot"><button class="btn" data-hclick="16">知道了</button></div>`); }
function addMaterial(){ openModal(`<h3>新建物资</h3><div class="body"><div class="form-row"><div class="field"><label>物料编码</label><input id="nm-code" placeholder="如 WL006"></div><div class="field"><label>名称</label><input id="nm-name"></div></div><div class="form-row"><div class="field"><label>规格型号</label><input id="nm-spec"></div><div class="field"><label>单位</label><input id="nm-unit" placeholder="个/包/盒"></div><div class="field"><label>类别</label><select id="nm-cat"><option value="">请选择</option><option>基础办公用品</option><option>劳保用品</option><option>固定资产</option></select></div></div><div class="form-row"><div class="field"><label>默认供应商</label><input id="nm-sup"></div><div class="field"><label>单价(¥)</label><input id="nm-price" type="number"></div><div class="field"><label>存放位置</label><input id="nm-loc"></div></div><div class="form-row"><div class="field"><label>库存预警数量</label><input id="nm-warn" type="number" value="0"></div><div class="field"><label>责任人</label><input id="nm-owner" value="行政部"></div></div></div><div class="foot"><button class="btn ghost" data-hclick="17">取消</button><button class="btn" data-hclick="18">保存</button></div>`); }
function saveMaterial(){ const code=val('nm-code').trim(), name=val('nm-name').trim(); if(!code||!name){toast('请填编码和名称');return;} const id=Math.max(0,...DB.materials.map(p=>p.id))+1; DB.materials.push({id,code,name,spec:val('nm-spec'),unit:val('nm-unit')||'个',cat:val('nm-cat')||'未分类',supplier:val('nm-sup'),price:num('nm-price'),stock:0,warnQty:num('nm-warn'),expire:'',location:val('nm-loc'),owner:val('nm-owner')||'行政部'}); save(); closeModal(); renderMaterials(document.getElementById('content')); toast('已新建物资'); }

/* ===================== 供应商 ===================== */
function renderSuppliers(c){
  const now=new Date();
  const expiring=DB.suppliers.filter(s=>{
    if(!s.contractEnd) return false;
    const end=new Date(s.contractEnd);
    const days=(end-now)/(1000*60*60*24);
    return days>=-7 && days<=30;
  }).sort((a,b)=>new Date(a.contractEnd)-new Date(b.contractEnd));
  const filtering=!!DB.__filterExpiring;
  const list=filtering?expiring:DB.suppliers;
  const rows=list.map(s=>`<tr><td>${s.name}</td><td>${s.contact}</td><td>${s.phone}</td><td>${s.addr}</td><td>${s.type||'-'}</td><td>${DB.purchases.filter(p=>p.supplier===s.name).length} 笔入库</td><td><button class="btn ghost sm" data-hclick="19" data-aclick="${encodeURIComponent(JSON.stringify(s.id))}">详细信息</button></td></tr>`).join('');
  const filterBanner=filtering&&expiring.length?`<div class="card" style="background:#fff7e6;border:1px solid #ffd591;margin-bottom:16px;"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px;"><div><div style="font-weight:700;color:#d46b08;font-size:15px;">⚠️ 当前仅显示合同即将到期的供应商</div><div style="color:#873800;font-size:13px;margin-top:4px;">${expiring.map(s=>`${s.name}（终止：${s.contractEnd}）`).join('、')}</div></div><button class="btn ghost sm" data-hclick="20">清除筛选</button></div></div>`:filtering?'<div class="card" style="background:#f6ffed;border:1px solid #b7eb8f;margin-bottom:16px;"><div style="color:#389e0d;font-size:14px;">✅ 当前筛选：合同即将到期供应商 — 暂无到期记录</div></div>':'';
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>供应商管理</h2><span class="desc">录入与汇总</span><div class="spacer"></div>${filtering?'<button class="btn ghost sm" data-hclick="21">清除筛选</button>':''}<button class="btn sm" data-hclick="22" style="margin-left:8px;">+ 新建供应商</button></div>${filterBanner}<div class="card"><table><thead><tr><th>名称</th><th>联系人</th><th>电话</th><th>地址</th><th>类型</th><th>入库笔数</th><th>操作</th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="empty">无供应商</td></tr>'}</tbody></table></div>`);
}
function showSuppliersExpiring(){ DB.__filterExpiring=true; showView('suppliers'); }
function clearSupplierFilter(){ DB.__filterExpiring=false; showView('suppliers'); }
function openSupplierDetail(id){
  const s=DB.suppliers.find(x=>x.id===id); if(!s) return;
  const c=document.getElementById('content');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>供应商详情 · ${s.name}</h2><span class="desc">${s.type||''}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="23">返回列表</button></div>
    <div class="card">
      <div class="sup-group-title">基本信息</div>
      <div class="detail-row"><div class="label">供应商名称</div><div class="value">${s.name}</div></div>
      <div class="detail-row"><div class="label">供应商类型</div><div class="value">${s.type||'-'}</div></div>
      <div class="detail-row"><div class="label">联系人</div><div class="value">${s.contact||'-'}</div></div>
      <div class="detail-row"><div class="label">电话</div><div class="value">${s.phone||'-'}</div></div>
      <div class="detail-row"><div class="label">地址</div><div class="value">${s.addr||'-'}</div></div>
      <div class="detail-row"><div class="label">销售品类</div><div class="value">${s.salesCategory||'-'}</div></div>
      <div class="detail-row"><div class="label">具体产品</div><div class="value">${s.products||'-'}</div></div>
      <div class="sup-group-title">合同信息</div>
      <div class="detail-row"><div class="label">是否签合同</div><div class="value">${s.contracted||'-'}</div></div>
      <div class="detail-row"><div class="label">合同属性</div><div class="value">${s.contractType||'-'}</div></div>
      <div class="detail-row"><div class="label">合同模板</div><div class="value">${s.isTemplate||'-'}</div></div>
      <div class="detail-row"><div class="label">模板名称</div><div class="value">${s.templateName||'-'}</div></div>
      <div class="detail-row"><div class="label">合同编号</div><div class="value">${s.contractNo||'-'}</div></div>
      <div class="detail-row"><div class="label">合同开始日期</div><div class="value">${s.contractStart||'-'}</div></div>
      <div class="detail-row"><div class="label">合同终止日期</div><div class="value">${s.contractEnd||'-'}</div></div>
      <div class="detail-row"><div class="label">管理人</div><div class="value">${s.manager||'-'}</div></div>
      <div class="detail-row"><div class="label">合同进度</div><div class="value">${s.contractProgress||'-'}</div></div>
      <div class="detail-row"><div class="label">合同附件</div><div class="value">${s.attachments&&s.attachments.length?s.attachments.map(f=>`<div>📎 <button class="btn ghost sm" data-file-path="${encodeURIComponent(f.path)}" data-file-name="${encodeURIComponent(f.name)}">${escapeHtml(f.name)}</button></div>`).join(''):'-'}</div></div>
      <div class="detail-row"><div class="label">备注</div><div class="value">${s.remarks||'-'}</div></div>
      <div class="sup-group-title">财务信息</div>
      <div class="detail-row"><div class="label">传真</div><div class="value">${s.fax||'-'}</div></div>
      <div class="detail-row"><div class="label">邮箱</div><div class="value">${s.email||'-'}</div></div>
      <div class="detail-row"><div class="label">开户行</div><div class="value">${s.bank||'-'}</div></div>
      <div class="detail-row"><div class="label">银行账号</div><div class="value">${s.account||'-'}</div></div>
      <div class="detail-row"><div class="label">税号</div><div class="value">${s.taxNo||'-'}</div></div>
      <div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="24">返回列表</button><button class="btn" data-hclick="25" data-aclick="${encodeURIComponent(JSON.stringify(s.id))}">修改</button></div>
    </div>`);
}
function editSupplier(id){
  editingSupplierId=id||0;
  const s=id?DB.suppliers.find(x=>x.id===id):null;
  window.__spAttachments=s?[...(s.attachments||[])]:[]; for(const item of recoveredAttachments) if(item.supplierId===editingSupplierId && !window.__spAttachments.some(f=>f.path===item.path)) window.__spAttachments.push(item);
  const c=document.getElementById('content');
  const sel=(idv,cur)=>idv===cur?'selected':'';
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>${s?'修改供应商 '+s.name:'新建供应商'}</h2><span class="desc">${s?'修改后保存':'录入供应商档案'}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="26">返回列表</button></div>
    <div class="card">
      <div class="form-row"><div class="field"><label>名称</label><input id="sp-name" value="${s?s.name:''}"></div><div class="field"><label>联系人</label><input id="sp-contact" value="${s?s.contact:''}"></div></div>
      <div class="form-row"><div class="field"><label>电话</label><input id="sp-phone" value="${s?s.phone:''}"></div><div class="field"><label>地址</label><input id="sp-addr" value="${s?s.addr:''}"></div><div class="field"><label>供应商类型</label><input id="sp-type" placeholder="厂家/经销商/电商" value="${s?s.type:''}"></div></div>
      <div class="form-row"><div class="field"><label>销售品类</label><input id="sp-sales" value="${s?s.salesCategory:''}"></div><div class="field"><label>具体产品</label><input id="sp-products" value="${s?s.products:''}"></div></div>
      <div class="form-row"><div class="field"><label>是否签合同</label><select id="sp-contracted"><option ${sel('否',s?s.contracted:'')}>否</option><option ${sel('是',s?s.contracted:'')}>是</option></select></div><div class="field"><label>合同属性</label><input id="sp-ctype" value="${s?s.contractType:''}"></div><div class="field"><label>是否合同模板</label><select id="sp-tpl"><option ${sel('否',s?s.isTemplate:'')}>否</option><option ${sel('是',s?s.isTemplate:'')}>是</option></select></div></div>
      <div class="form-row"><div class="field"><label>模板名称</label><input id="sp-tplname" value="${s?s.templateName:''}"></div><div class="field"><label>合同编号</label><input id="sp-cno" value="${s?s.contractNo:''}"></div></div>
      <div class="form-row"><div class="field"><label>合同开始</label><input id="sp-cstart" type="date" value="${s?s.contractStart:''}"></div><div class="field"><label>合同结束</label><input id="sp-cend" type="date" value="${s?s.contractEnd:''}"></div><div class="field"><label>管理人</label><input id="sp-manager" value="${s?s.manager:''}"></div><div class="field"><label>合同进度</label><input id="sp-progress" value="${s?s.contractProgress:''}"></div></div>
      <div class="form-row"><div class="field"><label>传真</label><input id="sp-fax" value="${s?s.fax:''}"></div><div class="field"><label>邮箱</label><input id="sp-email" value="${s?s.email:''}"></div></div>
      <div class="form-row"><div class="field"><label>开户行</label><input id="sp-bank" value="${s?s.bank:''}"></div><div class="field"><label>银行账号</label><input id="sp-account" value="${s?s.account:''}"></div><div class="field"><label>税号</label><input id="sp-tax" value="${s?s.taxNo:''}"></div></div>
      <div class="form-row" style="margin-top:10px;"><div class="field" style="flex:1;"><label>合同附件</label><input type="file" id="sp-files" multiple data-hchange="27"><div id="sp-file-list" style="margin-top:6px;font-size:13px;color:#555;">${window.__spAttachments.map(f=>`<div>📎 ${escapeHtml(f.name)}</div>`).join('')}</div></div></div>
      <div class="form-row"><div class="field"><label>备注</label><input id="sp-remarks" value="${s?s.remarks:''}"></div></div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="28">取消</button><button class="btn" data-hclick="29" data-aclick="${encodeURIComponent(JSON.stringify(id||0))}">保存</button></div>
    </div>`);
}
async function attachSupplierFiles(input){
  if(!files?.put){ alert('文件服务未就绪，无法上传附件。'); return; }
  status.style.display='flex'; status.textContent='正在上传附件，请稍候…';
  try {
    for(const file of input.files){
      const path=`attachments/${crypto.randomUUID()}`; let uploadId;
      try {
        const receipt=await files.put(path,file,{onPrepared:r=>{uploadId=r.id; recoveredAttachments.push({path,uploadId,name:file.name,supplierId:editingSupplierId}); sessionStorage.setItem('pending-inventory-upload',JSON.stringify(recoveredAttachments));}});
        if(!receipt?.completed) throw Error('上传未确认');
        if(!recoveredAttachments.some(item=>item.path===path)) { recoveredAttachments.push({name:file.name,path,supplierId:editingSupplierId}); sessionStorage.setItem('pending-inventory-upload',JSON.stringify(recoveredAttachments)); }
        window.__spAttachments.push({name:file.name,path});
      } catch(e){ throw Error(`附件上传结果未确认${uploadId?'，请联系管理员核对上传记录':''}，请勿重复上传。`); }
    }
    const list=document.getElementById('sp-file-list');
    if(list) list.innerHTML=DOMPurify.sanitize(window.__spAttachments.map(f=>`<div>📎 ${escapeHtml(f.name)}</div>`).join(''));
    status.style.display='none'; input.value='';
  } catch(e){ failed=true; status.textContent=e.message; }
}

function saveSupplier(id){
  const name=val('sp-name').trim(); if(!name){toast('请填名称');return;}
  const data={name,contact:val('sp-contact'),phone:val('sp-phone'),addr:val('sp-addr'),type:val('sp-type'),salesCategory:val('sp-sales'),products:val('sp-products'),contracted:val('sp-contracted'),isTemplate:val('sp-tpl'),contractType:val('sp-ctype'),templateName:val('sp-tplname'),contractNo:val('sp-cno'),contractStart:val('sp-cstart'),contractEnd:val('sp-cend'),manager:val('sp-manager'),contractProgress:val('sp-progress'),remarks:val('sp-remarks'),fax:val('sp-fax'),email:val('sp-email'),bank:val('sp-bank'),account:val('sp-account'),taxNo:val('sp-tax'),attachments:(window.__spAttachments||[])};
  if(id){ const s=DB.suppliers.find(x=>x.id===id); if(s){ Object.assign(s,data); toast('已保存修改'); } }
  else { const newId=Math.max(0,...DB.suppliers.map(s=>s.id))+1; DB.suppliers.push({id:newId,...data}); toast('已添加供应商'); }
  window.__spAttachments=[]; save(); showView('suppliers');
}

/* ===================== 搜索选人组件 ===================== */
function buildSearch(id,label,placeholder,source,onPick){
  return `<div class="field"><label>${label}</label><div class="searchbox" id="box-${id}"><input id="${id}" placeholder="${placeholder}" autocomplete="off" data-hinput="30" data-ainput="${encodeURIComponent(JSON.stringify(id))},${encodeURIComponent(JSON.stringify(onPick??null))},${encodeURIComponent(JSON.stringify(source))}"><div class="list" id="list-${id}" style="display:none"></div></div></div>`;
}
function filterSearch(id,source,onPick){
  const v=document.getElementById(id).value.trim().toLowerCase(); const list=document.getElementById('list-'+id); if(!v){ list.style.display='none'; return; }
  const hits=source.filter(x=>x.toLowerCase().includes(v)).slice(0,8); if(!hits.length){list.style.display='none';return;}
  list.innerHTML=DOMPurify.sanitize(hits.map(x=>`<div data-hclick="31" data-aclick="${encodeURIComponent(JSON.stringify(id))},${encodeURIComponent(JSON.stringify(x))},${encodeURIComponent(JSON.stringify(onPick??null))}">${x}</div>`).join('')); list.style.display='block';
}
function pickSearch(id,txt,onPick){ document.getElementById(id).value=txt; document.getElementById('list-'+id).style.display='none'; if(onPick) onPick(txt); }

/* ===================== 需求提报（全员+搜索+自由文本） ===================== */
function renderDemand(c){
  const u=DB.currentUser;
  const flowHint=u.role==='adminLead'||u.role==='deptLead'?'💡 您当前为行政主管/部门领导，提交后直接进入「分管副总」审批。':u.role==='admin'&&u.dept==='行政部'?'💡 您当前为行政专员，提交后由「行政主管」审批，通过后转「分管副总」审批并分配执行人。':'💡 提交后由「部门领导」审批，通过后转「分管副总」审批并分配执行人（行政专员/主管）。';
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>需求提报</h2><span class="desc">需求人 → 直接上级/行政主管 → 分管副总 → 行政部承接</span></div><div class="card">
      <div class="hint">${flowHint}</div>
      <div class="form-row"><div class="field"><label>申请日期</label><input id="dm-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>${buildSearch('dm-ap','申请人','请输入姓名搜索',USERS.map(x=>x.name))}${buildSearch('dm-dept','部门','请输入部门搜索',DEPTS)}<div class="field"><label>是否重复性采购</label><select id="dm-repeat"><option>否</option><option>是</option></select></div></div>
      <div id="dm-lines"></div><button class="add-line" data-hclick="32">+ 增加物品</button>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>预计使用时间</label><input id="dm-use" type="date" value="2026-07-25"></div><div class="field"><label>推荐厂家/链接</label><input id="dm-rec"></div><div class="field"><label>预算范围</label><input id="dm-budget" placeholder="如：200-300元"></div></div>
      <div class="form-row"><div class="field"><label>用途说明</label><textarea id="dm-reason" rows="2"></textarea></div></div>
      <div style="margin-top:14px;"><b>审批流程</b>${buildDemandFlow(null)}</div>
      <div class="right" style="margin-top:14px;"><button class="btn" data-hclick="33">提交需求</button></div></div>`);
  // 默认值
  setTimeout(()=>{ document.getElementById('dm-ap').value=u.name; document.getElementById('dm-dept').value=u.dept||''; },0);
  addDmLine();
}
function addDmLine(){
  const wrap=document.getElementById('dm-lines'); const d=document.createElement('div'); d.className='line-item'; d.innerHTML=DOMPurify.sanitize(`<div class="field" style="flex:0 0 140px;"><label>物资分类</label><select class="dm-cat"><option value="">请选择</option><option value="办公、劳保用品">办公、劳保用品</option><option value="其他物资">其他物资</option></select></div><div class="field name"><label>物料名称</label><input class="dm-name" placeholder="如：A4打印纸"></div><div class="field spec"><label>规格</label><input class="dm-spec" placeholder="如：70g 500张/包"></div><div class="field qty"><label>数量</label><input type="number" class="dm-q" value="1" min="1"></div><div class="field qty" style="flex:0 0 80px;"><label>单位</label><input class="dm-unit" placeholder="如：个"></div><button class="btn ghost sm" data-hclick="34">✕</button>`); wrap.appendChild(d);
}
function getDemandStatusByApplicant(name){
  const applicant=USERS.find(x=>x.name===name);
  if(!applicant) return 'pending_dept';
  if(applicant.role==='adminLead'||applicant.role==='deptLead') return 'pending_vp';
  if(applicant.role==='admin'&&applicant.dept==='行政部') return 'pending_adminLead';
  return 'pending_dept';
}
function submitDemand(){
  const u=DB.currentUser; const ap=val('dm-ap').trim(); if(!ap){toast('请填申请人');return;}
  const lines=[...document.querySelectorAll('#dm-lines .line-item')].map(n=>({cat:n.querySelector('.dm-cat').value.trim(),name:n.querySelector('.dm-name').value.trim(),spec:n.querySelector('.dm-spec').value.trim(),q:Number(n.querySelector('.dm-q').value),unit:n.querySelector('.dm-unit').value.trim()}));
  if(!lines.length||!lines[0].name){toast('请至少填写一行物料');return;}
  const no=nextNo('XQ2026-'); const today=val('dm-date'); const status=getDemandStatusByApplicant(ap);
  const statusText={pending_dept:'待部门领导审批',pending_adminLead:'待行政主管审批',pending_vp:'待分管副总审批'}[status];
  DB.demands.push({id:Math.max(0,...DB.demands.map(x=>x.id))+1,no,applyDate:today,date:today,applicant:ap,dept:val('dm-dept').trim()||u.dept||'未填',isRepeat:val('dm-repeat'),items:lines,reason:val('dm-reason'),expectedUse:val('dm-use'),recommend:val('dm-rec'),budget:val('dm-budget'),status,deptApprover:'',receiver:'',assignee:'',note:''}); save(); buildSidebar(); renderDemand(document.getElementById('content')); toast('需求已提交，'+statusText);
}

/* ===================== 需求列表 ===================== */
function renderDemandList(c){
  const u=DB.currentUser;
  const canSeeAdmin=u.dept==='行政部'||u.role==='vp';
  const isLead=u.role==='deptLead';
  const desc=canSeeAdmin?'全流程跟踪（全部部门）':isLead?'本部门需求（我与下属）':'我提交的需求';
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>需求列表</h2><span class="desc">${desc}</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/申请人/部门/物品" data-hinput="35"></div>
    <div class="card"><table><thead><tr><th>单号</th><th>申请日期</th><th>申请人</th><th>部门</th><th>物品</th><th>执行人</th><th>状态</th><th>操作</th></tr></thead><tbody id="demand-tbody">${demandRows('')}</tbody></table></div>`);
}
function demandRows(f){
  const u=DB.currentUser;
  const canSeeAdmin=u.dept==='行政部'||u.role==='vp';
  const isLead=u.role==='deptLead';
  const k=(f||'').trim().toLowerCase();
  const list=DB.demands.slice().reverse().filter(d=>{
    if(canSeeAdmin){ /* 全部门可见 */ }
    else if(isLead){ if(d.dept!==u.dept) return false; }
    else { if(d.applicant!==u.name) return false; }
    if(!k) return true;
    return d.no.toLowerCase().includes(k)||d.applicant.toLowerCase().includes(k)||d.dept.toLowerCase().includes(k)||d.items.some(i=>(i.name||'').toLowerCase().includes(k));
  });
  if(!list.length) return '<tr><td colspan="8" class="empty">无匹配结果</td></tr>';
  return list.map(d=>{
    const st=d.status==='pending_adminLead'?'<span class="tag pending">待行政主管审批</span>':d.status==='pending_dept'?'<span class="tag pending">待部门审批</span>':d.status==='pending_vp'?'<span class="tag step">待副总审批/分配</span>':d.status==='assigned'?'<span class="tag assign">已分配·执行中</span>':d.status==='rejected'?'<span class="tag rejected">已驳回</span>':'<span class="tag received">已完成</span>';
    return `<tr><td>${d.no}</td><td>${d.applyDate||d.date}</td><td>${d.applicant}</td><td>${d.dept}</td><td>${d.items.map(i=>(i.cat?i.cat+' · ':'')+i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td>${d.assignee||'—'}</td><td>${st}</td><td><button class="btn ghost sm" data-hclick="36" data-aclick="${encodeURIComponent(JSON.stringify(d.id))}">查看</button></td></tr>`;
  }).join('');
}
function filterDemandList(v){ const tb=document.getElementById('demand-tbody'); if(tb) tb.innerHTML=sanitizeRows(demandRows(v)); }
function openDemand(id){
  const d=DB.demands.find(x=>x.id===id); if(!d) return;
  const c=document.getElementById('content');
  const canApproveAdminLead=DB.currentUser.role==='adminLead'&&d.status==='pending_adminLead';
  const canApproveDept=DB.currentUser.role==='deptLead'&&d.status==='pending_dept'&&d.dept===DB.currentUser.dept;
  const canApproveVp=DB.currentUser.role==='vp'&&d.status==='pending_vp';
  const canEdit=(d.applicant===DB.currentUser.name||['admin','adminLead','vp'].includes(DB.currentUser.role))&&d.status!=='received';
  const stTag=d.status==='pending_adminLead'?'<span class="tag pending">待行政主管审批</span>':d.status==='pending_dept'?'<span class="tag pending">待部门审批</span>':d.status==='pending_vp'?'<span class="tag step">待副总审批/分配</span>':d.status==='assigned'?'<span class="tag assign">已分配·执行中</span>':d.status==='rejected'?'<span class="tag rejected">已驳回</span>':'<span class="tag received">已完成</span>';
  const itemsList=`<div style="margin-top:4px;">${d.items.map((i,idx)=>`<div style="margin-bottom:10px;padding:10px 12px;background:#f8f9fa;border-radius:6px;"><div style="font-weight:600;margin-bottom:4px;">物品 ${idx+1}：${i.name}</div><div style="color:#555;font-size:13px;line-height:1.7;">规格型号：${i.spec||'-'}<br>数量：${i.q} ${i.unit||''}<br>物资分类：${i.cat||'-'}</div></div>`).join('')}</div>`;
  const actions=canApproveAdminLead?`<div class="form-row" style="margin-top:10px;"><div class="field"><label>行政主管审批意见（可选）</label><input id="dm-note"></div></div><div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="37">返回列表</button><button class="btn green" data-hclick="38" data-aclick="${encodeURIComponent(JSON.stringify(id))}">通过并转分管副总</button></div>`
    :canApproveDept?`<div class="form-row" style="margin-top:10px;"><div class="field"><label>部门领导审批意见（可选）</label><input id="dm-note"></div></div><div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="39">返回列表</button><button class="btn green" data-hclick="40" data-aclick="${encodeURIComponent(JSON.stringify(id))}">通过并转分管副总</button></div>`
    :canApproveVp?`<div class="form-row" style="margin-top:10px;"><div class="field"><label>分配执行人</label><select id="dm-assignee"><option value="">请选择</option><option value="行政专员" ${d.assignee==='行政专员'?'selected':''}>行政专员</option><option value="行政主管" ${d.assignee==='行政主管'?'selected':''}>行政主管</option></select></div></div><div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="41">返回列表</button><button class="btn red sm" data-hclick="42" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn purple" data-hclick="43" data-aclick="${encodeURIComponent(JSON.stringify(id))}">审批通过并分配</button></div>`
    :`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="44">返回列表</button>${canEdit?`<button class="btn" data-hclick="45" data-aclick="${encodeURIComponent(JSON.stringify(id))}">修改</button>`:''}</div>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>需求详情 ${d.no}</h2><span class="desc">${stTag}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="46">返回列表</button></div>
    <div class="card">
      <div class="detail-row"><div class="label">申请日期</div><div class="value">${d.applyDate||d.date}</div></div>
      <div class="detail-row"><div class="label">申请人</div><div class="value">${d.applicant}（${d.dept}）</div></div>
      <div class="detail-row"><div class="label">是否重复采购</div><div class="value">${d.isRepeat}</div></div>
      <div class="detail-row"><div class="label">预计使用</div><div class="value">${d.expectedUse||'-'}</div></div>
      <div class="detail-row"><div class="label">预算范围</div><div class="value">${d.budget||'-'}</div></div>
      <div class="detail-row"><div class="label">推荐厂家</div><div class="value">${d.recommend||'-'}</div></div>
      <div class="detail-row"><div class="label">用途说明</div><div class="value">${d.reason||'-'}</div></div>
      <div class="detail-row"><div class="label">执行人</div><div class="value">${d.assignee||'-'}</div></div>
      <div class="detail-row" style="align-items:flex-start;"><div class="label">物品明细</div><div class="value">${itemsList}</div></div>
      <div style="margin-top:14px;"><b>审批流程</b>${buildDemandFlow(d)}</div>
      ${actions}
    </div>`);
}
function approveDemandAdminLead(id){ const d=DB.demands.find(x=>x.id===id); d.status='pending_vp'; d.deptApprover=DB.currentUser.name; d.note=val('dm-note'); save(); buildSidebar(); showView('demandList'); toast('已通过，转分管副总'); }
function approveDemandDept(id){ const d=DB.demands.find(x=>x.id===id); d.status='pending_vp'; d.deptApprover=DB.currentUser.name; d.note=val('dm-note'); save(); buildSidebar(); showView('demandList'); toast('已通过，转分管副总'); }
function approveDemandVp(id){ const a=val('dm-assignee').trim(); if(!a){toast('请填执行人');return;} const d=DB.demands.find(x=>x.id===id); d.status='assigned'; d.approverVp=DB.currentUser.name; d.assignee=a; save(); buildSidebar(); showView('demandList'); toast('已审批并分配给 '+a); }
function rejectDemand(id){ const d=DB.demands.find(x=>x.id===id); d.status='rejected'; save(); buildSidebar(); showView('demandList'); toast('已驳回需求'); }

/* ===================== 任务分配（跳转采购申请） ===================== */
function renderTask(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>任务分配</h2><span class="desc">分管副总审批并分配已承接需求给行政专员/主管</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/申请人/部门/物品/执行人" data-hinput="47"></div><div class="hint">说明：需求经部门领导审批后，转分管副总审批并分配执行人（行政专员或行政主管）。执行人点击「生成采购申请」后跳转到采购申请页面，由专员手工填写后提交。</div><div class="card"><table><thead><tr><th>需求单号</th><th>申请人</th><th>部门</th><th>物品</th><th>执行人</th><th>操作</th></tr></thead><tbody id="task-tbody">${taskRows('')}</tbody></table></div>`);
}
function taskRows(f){
  const k=(f||'').trim().toLowerCase();
  const todo=DB.demands.filter(d=>d.status==='assigned'&&!d.done).filter(d=>!k||d.no.toLowerCase().includes(k)||d.applicant.toLowerCase().includes(k)||d.dept.toLowerCase().includes(k)||(d.assignee||'').toLowerCase().includes(k)||d.items.some(i=>(i.name||'').toLowerCase().includes(k))).slice().sort((a,b)=>((b.applyDate||b.date||'').localeCompare(a.applyDate||a.date||'')));
  if(!todo.length) return '<tr><td colspan="6" class="empty">暂无待分配/执行的需求</td></tr>';
  return todo.map(d=>`<tr><td>${d.no}</td><td>${d.applicant}</td><td>${d.dept}</td><td>${d.items.map(i=>(i.cat?i.cat+' · ':'')+i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td>${d.assignee}</td><td><button class="btn ghost sm" data-hclick="48" data-aclick="${encodeURIComponent(JSON.stringify(d.id))}">生成采购申请</button></td></tr>`).join('');
}
function filterTask(v){ const tb=document.getElementById('task-tbody'); if(tb) tb.innerHTML=sanitizeRows(taskRows(v)); }
function goPurReq(did){ newPurReq(did); }
function goStockIn(pid){ newStockIn(pid); }

/* ===================== 采购申请（页面 + 双模式 + 审批流） ===================== */
function renderPurReq(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>采购申请</h2><span class="desc">专员 → 行政主管 → 分管副总</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/采购人/部门/物品" data-hinput="49"><button class="btn sm" data-hclick="50" style="margin-left:8px;">+ 新建采购申请</button></div>
    <div class="card"><table><thead><tr><th>单号</th><th>日期</th><th>采购人</th><th>物品</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody id="purreq-tbody">${purReqRows('')}</tbody></table></div>`);
}
function purReqRows(f){
  const k=(f||'').trim().toLowerCase();
  const list=DB.purchaseReqs.slice().reverse().filter(p=>!k||p.no.toLowerCase().includes(k)||p.applicant.toLowerCase().includes(k)||p.dept.toLowerCase().includes(k)||p.items.some(i=>(prItemName(i)||'').toLowerCase().includes(k)));
  if(!list.length) return '<tr><td colspan="7" class="empty">无匹配结果</td></tr>';
  return list.map(p=>{
    const total=p.items.reduce((s,i)=>s+i.q*(i.price||0),0);
    const st=p.status==='pending_admin'?'<span class="tag pending">待主管审</span>':p.status==='pending_vp'?'<span class="tag step">待副总审</span>':p.status==='rejected'?'<span class="tag rejected">已驳回</span>':'<span class="tag done">已通过</span>';
    return `<tr><td>${p.no}</td><td>${p.date}</td><td>${p.applicant}</td><td>${p.items.map(i=>prItemName(i)+'×'+i.q).join('、')}</td><td>¥${total.toLocaleString()}</td><td>${st}</td><td><button class="btn ghost sm" data-hclick="51" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">详情</button> <button class="btn ghost sm" data-hclick="52" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">修改</button></td></tr>`;
  }).join('');
}
function filterPurReq(v){ const tb=document.getElementById('purreq-tbody'); if(tb) tb.innerHTML=sanitizeRows(purReqRows(v)); }
function newPurReq(did){
  const u=DB.currentUser;
  const prefill=did?DB.demands.find(d=>d.id===did):null;
  // 清空内容区，显示新建表单
  const c=document.getElementById('content');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>新建采购申请</h2><span class="desc">${prefill?'来自需求 '+prefill.no:'常规采购 / 新物资采购'}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="53">返回列表</button></div>
    <div class="card">
      <div class="seg" style="margin-bottom:14px;"><button class="on" id="seg-normal" data-hclick="54">常规重复采购</button><button id="seg-new" data-hclick="55">新物资采购</button></div>
      <div class="hint" id="pr-hint">常规物资：输入物料编码，自动带出名称、规格、单位、类别。</div>
      <div class="form-row"><div class="field"><label>采购人</label><input id="pr-ap" value="${u.name}"></div><div class="field"><label>部门</label><input id="pr-dept" value="行政部"></div><div class="field"><label>日期</label><input id="pr-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div>
      <div class="form-row"><div class="field"><label>申请事由</label><input id="pr-reason" placeholder="如：补充日常办公" value="${prefill?'需求'+prefill.no:''}"></div><div class="field"><label>需求人</label><input id="pr-requester" value="${prefill?prefill.applicant:''}"></div><div class="field"><label>需求部门</label><input id="pr-requester-dept" value="${prefill?prefill.dept:''}"></div></div>
      <div class="form-row"><div class="field"><label>下单方式</label><select id="pr-orderway" data-hchange="56"><option value="">请选择</option><option value="A办公用品集采供应商">A办公用品集采供应商</option><option value="B办公用品集采供应商">B办公用品集采供应商</option><option value="其他方式下单">其他方式下单</option></select></div><div class="field"><label>支付方式</label><select id="pr-payway"><option value="">请选择</option><option value="垫付报销">垫付报销</option><option value="对公转账">对公转账</option><option value="冲抵备用金">冲抵备用金</option><option value="集采月结">集采月结</option></select></div><div class="field"><label>入库地址</label><select id="pr-warehouse"><option value="">请选择入库地址</option><option>总部大楼</option><option>分仓A</option><option>分仓B</option></select></div></div>
      <div class="form-row"><div class="field"><label>实际支付总金额（可后补）</label><input id="pr-actual" type="number" placeholder="实际支付金额，可与申请金额不一致"></div><div class="field"><label>差异说明</label><input id="pr-diffnote" placeholder="如价格波动原因"></div><div class="field"><label>备注</label><input id="pr-note" placeholder="其他说明"></div></div>
      <div id="pr-lines"></div><button class="add-line" data-hclick="57">+ 增加物品</button>
      <div class="right" style="margin-top:10px;font-size:15px;font-weight:700;">合计：<span id="pr-total">¥0</span></div>
      <div style="margin-top:14px;"><b>审批流程</b>${buildFlow({applicant:u.name,date:'2026-07-21',status:'pending_admin',approverLead:'',approverVp:''})}</div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="58">取消</button><button class="btn" data-hclick="59">提交审批</button></div>
    </div>`);
  window.__prMode='normal';
  if(prefill&&prefill.items){
    // 根据需求物品是否在物资档案里，决定默认模式；混合时以常规模式为底
    const allMatched=prefill.items.every(i=>DB.materials.some(m=>m.name===i.name));
    setPrMode(allMatched?'normal':'new');
    prefill.items.forEach(i=>addPrLine(i));
  } else addPrLine();
}
function setPrMode(mode){
  window.__prMode=mode;
  document.getElementById('seg-normal').className=mode==='normal'?'on':'';
  document.getElementById('seg-new').className=mode==='new'?'on':'';
  document.getElementById('pr-hint').textContent=mode==='normal'?'常规物资：输入物料编码，自动带出名称、规格、单位、类别。':'新物资：物料编码/名称/规格/单位/类别全部手动填写。';
}
function onOrderWayChange(v){
  const pay=document.getElementById('pr-payway');
  if(pay && v && v.includes('集采')) pay.value='集采月结';
}
function addPrLine(item){
  const mode=window.__prMode||'normal'; const wrap=document.getElementById('pr-lines'); const d=document.createElement('div'); d.className='line-item';
  const i=item||{}; const m=DB.materials.find(x=>x.name===i.name)||{};
  const matched=!!m.code;
  if(mode==='normal'){
    d.innerHTML=DOMPurify.sanitize(`<div class="field code" style="flex:0 0 110px;"><label>物料编码</label><div class="searchbox"><input class="pr-code" placeholder="输入编码搜索" autocomplete="off" data-hinput="60" value="${matched?m.code:''}"><div class="list" style="display:none"></div></div></div><div class="field" style="flex:0 0 90px;"><label>类别</label><input class="pr-cat" value="${matched?m.cat:''}" ${matched?'readonly':''}></div><div class="field name"><label>物料名称</label><input class="pr-name" value="${i.name||''}" ${matched?'readonly':''}></div><div class="field spec"><label>规格型号</label><input class="pr-spec" value="${i.spec||''}" ${matched?'readonly':''}></div><div class="field" style="flex:0 0 110px;"><label>品牌/店铺</label><input class="pr-brand" value="${i.brand!==undefined?i.brand:(matched?m.supplier:'')}" placeholder="自动带入默认供应商，可改"></div><div class="field" style="flex:0 0 60px;"><label>单位</label><input class="pr-unit" value="${matched?m.unit:(i.unit||'')}" ${matched?'readonly':''}></div><div class="field qty"><label>数量</label><input type="number" class="pr-q" value="${i.q||10}" data-hchange="61"></div><div class="field price"><label>单价</label><input type="number" class="pr-pr" value="${matched?m.price:0}" data-hchange="62"></div><div class="field price"><label>金额</label><input type="number" class="pr-amt" value="0" readonly></div><button class="btn ghost sm" data-hclick="63">✕</button>`);
  } else {
    const catOptions=['基础办公用品','劳保用品','固定资产','其他'].map(o=>`<option value="${o}" ${matched&&m.cat===o?'selected':''}>${o}</option>`).join('');
    d.innerHTML=DOMPurify.sanitize(`<div class="field code" style="flex:0 0 110px;"><label>物料编码</label><input class="pr-code" placeholder="新编码或临时" value="${matched?m.code:''}"></div><div class="field" style="flex:0 0 130px;"><label>类别</label><select class="pr-cat">${catOptions}</select></div><div class="field name"><label>物料名称</label><input class="pr-name" placeholder="手动填写" value="${i.name||''}"></div><div class="field spec"><label>规格型号</label><input class="pr-spec" placeholder="手动填写" value="${i.spec||''}"></div><div class="field" style="flex:0 0 110px;"><label>品牌/店铺</label><input class="pr-brand" value="${i.brand!==undefined?i.brand:(matched?m.supplier:'')}" placeholder="自动带入默认供应商，可改"></div><div class="field" style="flex:0 0 60px;"><label>单位</label><input class="pr-unit" placeholder="个/包" value="${i.unit||''}"></div><div class="field qty"><label>数量</label><input type="number" class="pr-q" value="${i.q||10}" data-hchange="64"></div><div class="field price"><label>单价</label><input type="number" class="pr-pr" value="${matched?m.price:0}" data-hchange="65"></div><div class="field price"><label>金额</label><input type="number" class="pr-amt" value="0" readonly></div><button class="btn ghost sm" data-hclick="66">✕</button>`);
  }
  wrap.appendChild(d);
  calcPrLine(d.querySelector('.pr-q'));
}
function filterPrCode(input){
  const v=input.value.trim().toLowerCase(); const list=input.nextElementSibling; if(!v){list.style.display='none';return;}
  const hits=DB.materials.filter(x=>x.code.toLowerCase().includes(v)||x.name.toLowerCase().includes(v)).slice(0,8); if(!hits.length){list.style.display='none';return;}
  list.innerHTML=DOMPurify.sanitize(hits.map(m=>`<div data-hclick="67" data-aclick="${encodeURIComponent(JSON.stringify(m.id))}">${m.code} ${m.name}（${m.spec}）</div>`).join('')); list.style.display='block';
}
function fillPrLine(input,mid){
  const m=mat(mid); const line=input.closest('.line-item');
  input.value=m.code; line.querySelector('.pr-name').value=m.name; line.querySelector('.pr-name').readOnly=true; line.querySelector('.pr-spec').value=m.spec; line.querySelector('.pr-spec').readOnly=true; line.querySelector('.pr-q').value=10; line.querySelector('.pr-pr').value=m.price;
  line.querySelector('.list').style.display='none';
  const unit=line.querySelector('.pr-unit'); if(unit){ unit.value=m.unit; unit.readOnly=true; }
  const cat=line.querySelector('.pr-cat'); if(cat){ cat.value=m.cat; cat.readOnly=true; }
  const brand=line.querySelector('.pr-brand'); if(brand){ brand.value=m.supplier||''; }
  calcPrLine(input);
}
function calcPrLine(el){ const line=el.closest('.line-item'); const q=Number(line.querySelector('.pr-q').value)||0; const pr=Number(line.querySelector('.pr-pr').value)||0; line.querySelector('.pr-amt').value=(q*pr).toFixed(2); updatePrTotal(); }
function updatePrTotal(){ const total=[...document.querySelectorAll('#pr-lines .line-item')].reduce((s,n)=>s+(Number(n.querySelector('.pr-amt').value)||0),0); const el=document.getElementById('pr-total'); if(el) el.textContent='¥'+total.toLocaleString(); }
function savePurReq(){
  const lines=[...document.querySelectorAll('#pr-lines .line-item')].map(n=>{
    const code=n.querySelector('.pr-code').value.trim();
    const name=n.querySelector('.pr-name').value.trim();
    const m=DB.materials.find(x=>x.code===code)||DB.materials.find(x=>x.name===name);
    return {p:m?m.id:0, q:Number(n.querySelector('.pr-q').value)||0, price:Number(n.querySelector('.pr-pr').value)||0, name:m?m.name:name, spec:m?m.spec:(n.querySelector('.pr-spec').value.trim()), unit:m?m.unit:(n.querySelector('.pr-unit')?n.querySelector('.pr-unit').value.trim():''), cat:m?m.cat:(n.querySelector('.pr-cat')?n.querySelector('.pr-cat').value.trim():''), brand:n.querySelector('.pr-brand')?n.querySelector('.pr-brand').value.trim():'', code:code};
  });
  if(!lines.length||!lines[0].name){toast('请至少填写一行');return;}
  const no=nextNo('CGSQ2026-'); DB.purchaseReqs.push({id:Math.max(0,...DB.purchaseReqs.map(x=>x.id))+1,no,date:val('pr-date'),applicant:val('pr-ap'),dept:val('pr-dept'),requester:val('pr-requester'),requesterDept:val('pr-requester-dept'),items:lines,reason:val('pr-reason'),orderWay:val('pr-orderway'),payWay:val('pr-payway'),warehouse:val('pr-warehouse'),note:val('pr-note'),actualPay:Number(val('pr-actual'))||0,diffNote:val('pr-diffnote'),status:'pending_admin',approverLead:'',approverVp:''}); save(); buildSidebar(); showView('purReq'); toast('采购申请已提交');
}
function openPurReq(id){
  const p=DB.purchaseReqs.find(x=>x.id===id); if(!p) return;
  const c=document.getElementById('content');
  const total=p.items.reduce((s,i)=>s+i.q*(i.price||0),0);
  const flow=buildFlow(p);
  const isAdmin=['admin','adminLead','vp'].includes(DB.currentUser.role);
  const canLead=DB.currentUser.role==='adminLead'&&p.status==='pending_admin';
  const canVp=DB.currentUser.role==='vp'&&p.status==='pending_vp';
  const canEdit=(p.applicant===DB.currentUser.name||['admin','adminLead','vp'].includes(DB.currentUser.role))&&p.status!=='done';
  const stTag=p.status==='pending_admin'?'<span class="tag pending">待主管审</span>':p.status==='pending_vp'?'<span class="tag step">待副总审</span>':p.status==='rejected'?'<span class="tag rejected">已驳回</span>':'<span class="tag done">已通过</span>';
  const itemsTable=`<table class="inline-table" style="margin-top:4px;"><thead><tr><th>物料编码</th><th>类别</th><th>物料名称</th><th>品牌/店铺</th><th>规格型号</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead><tbody>${p.items.map(i=>`<tr><td>${i.code||'-'}</td><td>${i.cat||'-'}</td><td>${prItemName(i)}</td><td>${i.brand||'-'}</td><td>${i.spec||'-'}</td><td>${i.unit||'-'}</td><td>${i.q}</td><td>¥${(i.price||0).toLocaleString()}</td><td>¥${(i.q*(i.price||0)).toLocaleString()}</td></tr>`).join('')}</tbody></table>`;
  const actions=p.status==='done'&&isAdmin?`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="68">返回列表</button><button class="btn" data-hclick="69" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">新建入库单</button></div>`
    :canLead?`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="70">返回列表</button><button class="btn red sm" data-hclick="71" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="72" data-aclick="${encodeURIComponent(JSON.stringify(id))}">主管通过→转副总</button></div>`
    :canVp?`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="73">返回列表</button><button class="btn red sm" data-hclick="74" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="75" data-aclick="${encodeURIComponent(JSON.stringify(id))}">副总通过</button></div>`
    :`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="76">返回列表</button>${canEdit?`<button class="btn" data-hclick="77" data-aclick="${encodeURIComponent(JSON.stringify(id))}">修改</button>`:''}</div>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>采购申请详情 ${p.no}</h2><span class="desc">${stTag}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="78">返回列表</button></div>
    <div class="card">
      <div class="detail-row"><div class="label">采购人</div><div class="value">${p.applicant}（${p.dept}）</div></div>
      <div class="detail-row"><div class="label">日期</div><div class="value">${p.date}</div></div>
      <div class="detail-row"><div class="label">申请事由</div><div class="value">${p.reason||'-'}</div></div>
      <div class="detail-row"><div class="label">需求人/部门</div><div class="value">${p.requester||'-'} / ${p.requesterDept||'-'}</div></div>
      <div class="detail-row"><div class="label">下单方式</div><div class="value">${p.orderWay||'-'}</div></div>
      <div class="detail-row"><div class="label">支付方式</div><div class="value">${p.payWay||'-'}</div></div>
      <div class="detail-row"><div class="label">入库地址</div><div class="value">${p.warehouse||'-'}</div></div>
      <div class="detail-row"><div class="label">实际支付总金额</div><div class="value">${p.actualPay?'¥'+p.actualPay.toLocaleString():'-'}</div></div>
      <div class="detail-row"><div class="label">差异说明</div><div class="value">${p.diffNote||'-'}</div></div>
      <div class="detail-row"><div class="label">备注</div><div class="value">${p.note||'-'}</div></div>
      <div class="detail-row"><div class="label">物品明细</div><div class="value">${itemsTable}</div></div>
      <div class="detail-row"><div class="label">合计金额</div><div class="value" style="font-size:16px;font-weight:700;color:var(--brand);">¥${total.toLocaleString()}</div></div>
      <div style="margin-top:14px;"><b>审批流程</b>${flow}</div>
      ${actions}
    </div>`);
}
function buildFlow(p){
  const steps=[
    {t:'提交申请',who:p.applicant,time:p.date,done:true},
    {t:'行政主管审批',who:p.approverLead||'待审批',time:p.approverLead?'2026-07-21':'',done:!!p.approverLead||p.status==='pending_vp'||p.status==='done'},
    {t:'分管副总审批',who:p.approverVp||'待审批',time:p.approverVp?'2026-07-21':'',done:!!p.approverVp||p.status==='done'}
  ];
  if(p.status==='rejected') steps.push({t:'已驳回',who:'审批人',time:'',done:true});
  return `<div class="flowline">${steps.map(s=>`<div class="item ${s.done?'done':''} ${!s.done&&s.who==='待审批'?'active':''}"><div class="who">${s.t} ${s.who!=='待审批'?'· '+s.who:''}</div><div class="when">${s.time||'等待中'}</div></div>`).join('')}</div>`;
}
function buildDemandFlow(d){
  const applicant=USERS.find(x=>x.name===(d?d.applicant:''));
  const isAdminStaff=applicant&&applicant.role==='admin'&&applicant.dept==='行政部';
  const isLeader=applicant&&(applicant.role==='adminLead'||applicant.role==='deptLead');
  if(!d){
    const steps=[{t:'提交申请',who:'需求人',time:'填写后提交',done:false,active:true}];
    if(isAdminStaff) steps.push({t:'行政主管审批',who:'待审批',time:'等待中',done:false,active:false});
    else if(!isLeader) steps.push({t:'部门领导审批',who:'待审批',time:'等待中',done:false,active:false});
    steps.push({t:'分管副总审批 / 分配执行人',who:'待审批',time:'等待中',done:false,active:false});
    return `<div class="flowline">${steps.map((s,i)=>`<div class="item ${s.done?'done':''} ${s.active?'active':''}"><div class="who">${s.t} ${s.who!=='待审批'?'· '+s.who:''}</div><div class="when">${s.time||'等待中'}</div></div>`).join('')}</div>`;
  }
  const steps=[{t:'提交申请',who:d.applicant,time:d.applyDate||d.date,done:true,active:false}];
  if(isAdminStaff){
    steps.push({t:'行政主管审批',who:d.deptApprover||'待审批',time:d.deptApprover?'2026-07-21':'',done:!!d.deptApprover||d.status==='pending_vp'||d.status==='assigned'||d.status==='received',active:d.status==='pending_adminLead'});
  } else if(!isLeader){
    steps.push({t:'部门领导审批',who:d.deptApprover||'待审批',time:d.deptApprover?'2026-07-21':'',done:!!d.deptApprover||d.status==='pending_vp'||d.status==='assigned'||d.status==='received',active:d.status==='pending_dept'});
  }
  steps.push({t:'分管副总审批 / 分配执行人',who:d.approverVp?d.approverVp+(d.assignee?' → '+d.assignee:''):'待审批',time:d.approverVp?'2026-07-21':'',done:!!d.approverVp||d.status==='assigned'||d.status==='received',active:d.status==='pending_vp'});
  if(d.status==='rejected') steps.push({t:'已驳回',who:'审批人',time:'',done:true,active:false});
  return `<div class="flowline">${steps.map(s=>`<div class="item ${s.done?'done':''} ${s.active?'active':''}"><div class="who">${s.t} ${s.who!=='待审批'?'· '+s.who:''}</div><div class="when">${s.time||'等待中'}</div></div>`).join('')}</div>`;
}
function buildIssueFlow(x){
  if(!x){
    return `<div class="flowline"><div class="item active"><div class="who">提交申请 · 领用人</div><div class="when">填写后提交</div></div><div class="item"><div class="who">行政主管审批</div><div class="when">等待中</div></div><div class="item"><div class="who">抄送行政专员</div><div class="when">等待中</div></div></div>`;
  }
  if(x.issueType==='laobao'){
    const steps=[
      {t:'提交申请',who:x.applicant,time:x.date,done:true},
      {t:'人资部审批',who:x.hrApprover||'待审批',time:x.hrApprover?'2026-07-21':'',done:!!x.hrApprover||['material_approved','done'].includes(x.status)},
      {t:'物资部审批',who:x.materialApprover||'待审批',time:x.materialApprover?'2026-07-21':'',done:!!x.materialApprover||x.status==='done'},
      {t:'审批领导审批',who:x.finalApprover||'待审批',time:x.finalApprover?'2026-07-21':'',done:!!x.finalApprover||x.status==='done'}
    ];
    if(x.status==='rejected') steps.push({t:'已驳回',who:'审批人',time:'',done:true});
    return `<div class="flowline">${steps.map(s=>`<div class="item ${s.done?'done':''} ${!s.done&&s.who==='待审批'?'active':''}"><div class="who">${s.t} ${s.who!=='待审批'?'· '+s.who:''}</div><div class="when">${s.time||'等待中'}</div></div>`).join('')}</div>`;
  }
  const steps=[
    {t:'提交申请',who:x.applicant,time:x.date,done:true},
    {t:'行政主管审批',who:x.approver||'待审批',time:x.approver?'2026-07-21':'',done:!!x.approver||x.status==='done'},
    {t:'抄送行政专员',who:x.cc||'待抄送',time:x.cc?'2026-07-21':'',done:!!x.cc||x.status==='done'}
  ];
  if(x.status==='rejected') steps.push({t:'已驳回',who:'审批人',time:'',done:true});
  return `<div class="flowline">${steps.map(s=>`<div class="item ${s.done?'done':''} ${!s.done&&s.who==='待审批'?'active':''}"><div class="who">${s.t} ${s.who!=='待审批'?'· '+s.who:''}</div><div class="when">${s.time||'等待中'}</div></div>`).join('')}</div>`;
}
function approvePurLead(id){ const p=DB.purchaseReqs.find(x=>x.id===id); p.status='pending_vp'; p.approverLead=DB.currentUser.name; save(); buildSidebar(); showView('purReq'); toast('已通过，转分管副总'); }
function approvePurVp(id){ const p=DB.purchaseReqs.find(x=>x.id===id); p.status='done'; p.approverVp=DB.currentUser.name; save(); buildSidebar(); showView('purReq'); toast('采购申请已批准，可入库'); }
function rejectPurReq(id){ const p=DB.purchaseReqs.find(x=>x.id===id); p.status='rejected'; save(); buildSidebar(); showView('purReq'); toast('已驳回'); }

/* ===================== 采购入库（明细表联动） ===================== */
function renderStockIn(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>采购入库</h2><span class="desc">关联采购申请，输入编码/名称自动带出规格</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/供应商/物品" data-hinput="79"><button class="btn sm" data-hclick="80" style="margin-left:8px;">+ 新建入库单</button></div>
    <div class="card"><h3 style="margin-bottom:10px;">近期入库</h3><table><thead><tr><th>单号</th><th>日期</th><th>供应商</th><th>物品</th><th>关联申请</th><th>状态</th><th>操作</th></tr></thead><tbody id="stockin-tbody">${stockInRows('')}</tbody></table></div>`);
}
function stockInRows(f){
  const k=(f||'').trim().toLowerCase();
  const list=DB.purchases.slice().reverse().filter(p=>!k||p.no.toLowerCase().includes(k)||p.supplier.toLowerCase().includes(k)||p.items.some(i=>(mname(i.p)||'').toLowerCase().includes(k)));
  if(!list.length) return '<tr><td colspan="7" class="empty">无匹配结果</td></tr>';
  return list.map(p=>`<tr><td>${p.no}</td><td>${p.date}</td><td>${p.supplier}</td><td>${p.items.map(i=>mname(i.p)+'×'+i.q).join('、')}</td><td>${p.refReq||'-'}</td><td><span class="tag done">已入库</span></td><td><button class="btn ghost sm" data-hclick="81" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">详情</button> <button class="btn ghost sm" data-hclick="82" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">修改</button></td></tr>`).join('');
}
function filterStockIn(v){ const tb=document.getElementById('stockin-tbody'); if(tb) tb.innerHTML=sanitizeRows(stockInRows(v)); }
function newStockIn(pid){
  const c=document.getElementById('content');
  const prefill=pid?DB.purchaseReqs.find(p=>p.id===pid):null;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>新建采购入库单</h2><span class="desc">填写物料编码或名称，自动带出规格、单位、类别</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="83">返回列表</button></div>
    <div class="card">
      <div class="form-row"><div class="field"><label>入库单号</label><input id="si-no" value="${nextNo('RK2026-')}" disabled></div><div class="field"><label>日期</label><input id="si-date" type="date" value="2026-07-21"></div><div class="field"><label>经办人</label><input id="si-handler" value="${DB.currentUser.name}"></div></div>
      <div class="form-row"><div class="field" style="flex:1;"><label>关联采购申请（可选）</label><select id="si-req" data-hchange="84"><option value="">不关联</option>${DB.purchaseReqs.filter(p=>p.status==='done').map(p=>`<option value="${p.no}" ${prefill&&p.no===prefill.no?'selected':''}>${p.no}</option>`).join('')}</select></div></div>
      <table class="inline-table" style="margin-top:10px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>供应商</th><th>单位</th><th>类别</th><th>数量</th><th>单价</th><th>金额</th><th>存放位置</th><th>责任人</th><th></th></tr></thead><tbody id="si-lines"></tbody></table>
      <div style="margin-top:10px;"><button class="add-line" data-hclick="85">+ 增加一行</button></div>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>备注</label><textarea id="si-note" rows="2"></textarea></div></div>
      <div class="right"><button class="btn ghost" data-hclick="86">取消</button><button class="btn" data-hclick="87">确认入库</button></div>
    </div>`);
  if(prefill) setTimeout(()=>fillFromPurReq(prefill.no),0); else addSiLine();
}
function addSiLine(){
  const tbody=document.getElementById('si-lines'); const tr=document.createElement('tr'); tr.innerHTML=sanitizeCells(`<td><div class="searchbox"><input class="si-code" placeholder="编码/名称" autocomplete="off" data-hinput="88" style="min-width:120px"><div class="list" style="display:none"></div></div></td><td><input class="si-name" readonly></td><td><input class="si-spec" readonly></td><td><input class="si-sup" placeholder="默认供应商" style="width:90px"></td><td><input class="si-unit" readonly style="width:50px"></td><td><input class="si-cat" readonly style="width:70px"></td><td><input type="number" class="si-q" value="0" style="width:60px" data-hchange="89"></td><td><input type="number" class="si-pr" value="0" style="width:70px" data-hchange="90"></td><td><input class="si-amt" readonly style="width:70px"></td><td><input class="si-loc" style="width:90px"></td><td><input class="si-owner" style="width:70px"></td><td><button class="btn ghost sm" data-hclick="91">✕</button></td>`);
  tbody.appendChild(tr);
}
function filterSiCode(input){
  const v=input.value.trim().toLowerCase(); const list=input.nextElementSibling; if(!v){list.style.display='none';return;}
  const hits=DB.materials.filter(x=>x.code.toLowerCase().includes(v)||x.name.toLowerCase().includes(v)).slice(0,8); if(!hits.length){list.style.display='none';return;}
  list.innerHTML=DOMPurify.sanitize(hits.map(m=>`<div data-hclick="92" data-aclick="${encodeURIComponent(JSON.stringify(m.id))}">${m.code} ${m.name}（${m.spec}）</div>`).join('')); list.style.display='block';
}
function fillSiLine(input,mid){
  const m=mat(mid); const tr=input.closest('tr'); input.value=m.code; tr.querySelector('.si-name').value=m.name; tr.querySelector('.si-spec').value=m.spec; tr.querySelector('.si-sup').value=m.supplier||''; tr.querySelector('.si-unit').value=m.unit; tr.querySelector('.si-cat').value=m.cat; tr.querySelector('.si-pr').value=m.price; tr.querySelector('.si-loc').value=m.location; tr.querySelector('.si-owner').value=m.owner; calcSiLine(tr.querySelector('.si-q'));
}
function calcSiLine(el){ const tr=el.closest('tr'); const q=Number(tr.querySelector('.si-q').value)||0; const pr=Number(tr.querySelector('.si-pr').value)||0; tr.querySelector('.si-amt').value=(q*pr).toFixed(2); }
function fillFromPurReq(reqNo){
  const req=DB.purchaseReqs.find(p=>p.no===reqNo);
  const tbody=document.getElementById('si-lines'); tbody.innerHTML=DOMPurify.sanitize('');
  if(!req){ addSiLine(); return; }
  req.items.forEach(i=>{
    addSiLine();
    const tr=tbody.lastElementChild;
    const m=DB.materials.find(x=>x.id===i.p);
    if(m){
      tr.querySelector('.si-code').value=m.code;
      tr.querySelector('.si-name').value=m.name;
      tr.querySelector('.si-spec').value=m.spec;
      tr.querySelector('.si-sup').value=i.brand||m.supplier||'';
      tr.querySelector('.si-unit').value=m.unit;
      tr.querySelector('.si-cat').value=m.cat;
      tr.querySelector('.si-pr').value=i.price||m.price||0;
      tr.querySelector('.si-loc').value=m.location;
      tr.querySelector('.si-owner').value=m.owner;
    } else {
      tr.querySelector('.si-code').value=i.code||'';
      tr.querySelector('.si-name').value=i.name||'';
      tr.querySelector('.si-spec').value=i.spec||'';
      tr.querySelector('.si-sup').value=i.brand||'';
      tr.querySelector('.si-unit').value=i.unit||'';
      tr.querySelector('.si-cat').value=i.cat||'';
      tr.querySelector('.si-pr').value=i.price||0;
    }
    tr.querySelector('.si-q').value=i.q||0;
    calcSiLine(tr.querySelector('.si-q'));
  });
}
function saveStockIn(){
  const lines=[...document.querySelectorAll('#si-lines tr')].map(tr=>{
    const code=tr.querySelector('.si-code').value.trim(); const m=DB.materials.find(x=>x.code===code);
    return {p:m?m.id:0, q:Number(tr.querySelector('.si-q').value)||0, price:Number(tr.querySelector('.si-pr').value)||0, supplier:tr.querySelector('.si-sup').value, location:tr.querySelector('.si-loc').value, owner:tr.querySelector('.si-owner').value, name:tr.querySelector('.si-name').value, spec:tr.querySelector('.si-spec').value, unit:tr.querySelector('.si-unit').value, cat:tr.querySelector('.si-cat').value, code:code};
  }).filter(l=>l.name||l.code);
  if(!lines.length){toast('请至少添加一行');return;}
  const sups=[...new Set(lines.map(l=>l.supplier).filter(Boolean))];
  if(!sups.length){toast('请至少填写一行供应商信息');return;}
  const sup=sups.join(' / ');
  // 新物资自动创建档案
  lines.forEach(l=>{
    if(!l.p && l.code && l.name){
      const exist=DB.materials.find(x=>x.code===l.code);
      if(!exist){
        const newId=Math.max(0,...DB.materials.map(m=>m.id))+1;
        DB.materials.push({id:newId,code:l.code,name:l.name,spec:l.spec||'',unit:l.unit||'个',cat:l.cat||'未分类',supplier:l.supplier||'',price:l.price||0,stock:0,warnQty:0,expire:'',location:l.location||'',owner:l.owner||'行政部'});
        l.p=newId;
      }
    }
  });
  const no=val('si-no'); DB.purchases.push({id:Math.max(0,...DB.purchases.map(x=>x.id))+1,no,date:val('si-date'),supplier:sup,refReq:val('si-req'),items:lines,handler:val('si-handler'),note:val('si-note'),status:'done'});
  lines.forEach(l=>{ if(l.p){ const m=mat(l.p); m.stock+=l.q; DB.flows.push({id:Math.max(0,...DB.flows.map(f=>f.id))+1,date:val('si-date'),type:'in',ref:no,p:l.p,q:l.q,after:m.stock,op:val('si-handler')}); } });
  save(); buildSidebar(); showView('stockIn'); toast('入库成功，库存已更新');
}
function openStockIn(id){
  const p=DB.purchases.find(x=>x.id===id); if(!p) return;
  const c=document.getElementById('content');
  const total=p.items.reduce((s,i)=>s+i.q*(i.price||0),0);
  const itemsTable=`<table class="inline-table" style="margin-top:4px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>供应商</th><th>单位</th><th>类别</th><th>数量</th><th>单价</th><th>金额</th><th>存放位置</th><th>责任人</th></tr></thead><tbody>${p.items.map(i=>`<tr><td>${i.code||'-'}</td><td>${mname(i.p)||i.name}</td><td>${i.spec||'-'}</td><td>${i.supplier||'-'}</td><td>${i.unit||'-'}</td><td>${i.cat||'-'}</td><td>${i.q}</td><td>¥${(i.price||0).toLocaleString()}</td><td>¥${(i.q*(i.price||0)).toLocaleString()}</td><td>${i.location||'-'}</td><td>${i.owner||'-'}</td></tr>`).join('')}</tbody></table>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>入库详情 ${p.no}</h2><span class="desc"><span class="tag done">已入库</span></span><div class="spacer"></div><button class="btn ghost sm" data-hclick="93">返回列表</button></div>
    <div class="card">
      <div class="detail-row"><div class="label">入库单号</div><div class="value">${p.no}</div></div>
      <div class="detail-row"><div class="label">日期</div><div class="value">${p.date}</div></div>
      <div class="detail-row"><div class="label">经办人</div><div class="value">${p.handler||'-'}</div></div>
      <div class="detail-row"><div class="label">供应商</div><div class="value">${p.supplier||'-'}</div></div>
      <div class="detail-row"><div class="label">关联采购申请</div><div class="value">${p.refReq||'-'}</div></div>
      <div class="detail-row"><div class="label">备注</div><div class="value">${p.note||'-'}</div></div>
      <div class="detail-row"><div class="label">物品明细</div><div class="value">${itemsTable}</div></div>
      <div class="detail-row"><div class="label">合计金额</div><div class="value" style="font-size:16px;font-weight:700;color:var(--brand);">¥${total.toLocaleString()}</div></div>
      <div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="94">返回列表</button><button class="btn" data-hclick="95" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">修改</button></div>
    </div>`);
}

/* ===================== 领用申请（全员+编码联动） ===================== */
function renderIssue(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>领用申请</h2><span class="desc">普通物资：行政主管审批 → 抄送专员；劳保用品：人资部 → 物资部 → 审批领导</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/领用人/部门/物品" data-hinput="96"><button class="btn sm" data-hclick="97" style="margin-left:8px;">+ 新建领用</button></div>
    <div class="card"><div class="hint">💡 普通物资由行政主管审批通过即出库；劳保用品（如国际部出行装备）走：领用人 → 人资部 → 物资部 → 审批领导，支持非企微架构人员。</div><h3 style="margin-bottom:10px;">领用记录</h3><table><thead><tr><th>单号</th><th>领用日期</th><th>领用人</th><th>领用部门</th><th>物品</th><th>状态</th><th>操作</th></tr></thead><tbody id="issue-tbody">${issueRows('')}</tbody></table></div>`);
}
function issueRows(f){
  const u=DB.currentUser;
  const canSeeAdmin=u.dept==='行政部'||u.role==='vp';
  const isAdmin=['admin','adminLead','vp'].includes(u.role);
  const isLead=u.role==='deptLead';
  const k=(f||'').trim().toLowerCase();
  const list=DB.issues.slice().reverse().filter(p=>{
    if(canSeeAdmin){ /* 全部门可见 */ }
    else if(isLead){ if(p.dept!==u.dept) return false; }
    else { if(p.applicant!==u.name) return false; }
    if(!k) return true;
    return p.no.toLowerCase().includes(k)||p.applicant.toLowerCase().includes(k)||p.dept.toLowerCase().includes(k)||p.items.some(i=>(mname(i.p)||'').toLowerCase().includes(k));
  });
  if(!list.length) return '<tr><td colspan="7" class="empty">无匹配结果</td></tr>';
  return list.map(p=>{
    const typeTag=p.issueType==='laobao'?'<span class="tag step">劳保</span>':'';
    const st=p.status==='rejected'?'<span class="tag rejected">已驳回</span>':p.status==='done'?'<span class="tag done">已出库</span>':'<span class="tag pending">审批中</span>';
    const canAct=isAdmin && p.status==='pending' && p.issueType!=='laobao';
    const actBtns=canAct?`<button class="btn green sm" data-hclick="98" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">通过</button> <button class="btn red sm" data-hclick="99" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">驳回</button> `:'';
    return `<tr><td>${p.no}</td><td>${p.date}</td><td>${p.applicant} ${typeTag}</td><td>${p.dept}</td><td>${p.items.map(i=>mname(i.p)+'×'+i.q).join('、')}</td><td>${st}</td><td>${actBtns}<button class="btn ghost sm" data-hclick="100" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">查看</button></td></tr>`;
  }).join('');
}
function filterIssue(v){ const tb=document.getElementById('issue-tbody'); if(tb) tb.innerHTML=sanitizeRows(issueRows(v)); }
function newIssue(){
  const u=DB.currentUser; const c=document.getElementById('content');
  const isAdminDept=(u.dept==='行政部');
  const tabs=isAdminDept
    ?`<div class="seg" style="margin-bottom:14px;"><button class="on" id="seg-is-normal" data-hclick="101">普通物资</button><button id="seg-is-laobao" data-hclick="102">劳保用品（国际部出行）</button></div>`
    :`<div class="seg" style="margin-bottom:14px;"><button class="on" id="seg-is-normal">普通物资</button></div>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>新建领用申请</h2><span class="desc">${isAdminDept?'普通物资 / 劳保用品':'普通物资'}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="103">📥 导入本地表格</button><input type="file" id="is-file" accept=".xlsx,.xls,.csv" style="display:none" data-hchange="104"><button class="btn ghost sm" data-hclick="105" style="margin-left:8px;">返回列表</button></div>
    <div class="card">
      ${tabs}
      <input type="hidden" id="is-type" value="normal">
      <div class="hint" id="is-hint">💡 输入物料编码/名称即自动带出规格型号、单位。提交后由「行政主管」审批，通过即出库减库存并抄送行政专员。</div>
      <div class="form-row"><div class="field" style="flex:1;">${buildSearch('is-ap','领用人','请输入姓名搜索',USERS.map(x=>x.name))}</div><div class="field" style="flex:1;">${buildSearch('is-dept','领用部门','请输入部门搜索',DEPTS)}</div><div class="field" style="flex:0 0 160px;"><label>领用日期</label><input id="is-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div>
      <div class="form-row" id="ext-row" style="display:none;"><div class="field"><label>外部领用人姓名</label><input id="is-ext-ap" placeholder="如：国际部员工姓名"></div><div class="field"><label>外部部门</label><input id="is-ext-dept" placeholder="如：国际部"></div></div>
      <table class="inline-table" style="margin-top:10px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>数量</th><th></th></tr></thead><tbody id="is-lines"></tbody></table>
      <div style="margin-top:10px;"><button class="add-line" data-hclick="106">+ 增加一行</button></div>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>用途说明</label><textarea id="is-reason" rows="2"></textarea></div></div>
      <div style="margin-top:14px;"><b>审批流程</b>${buildIssueFlow(null)}</div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="107">取消</button><button class="btn" data-hclick="108">提交审批</button></div>
    </div>`);
  window.__issueMode='normal';
  setTimeout(()=>{ document.getElementById('is-ap').value=u.name; document.getElementById('is-dept').value=u.dept||''; },0);
  addIsLine();
}
function setIssueMode(mode){
  window.__issueMode=mode;
  const n=document.getElementById('seg-is-normal'); const l=document.getElementById('seg-is-laobao');
  if(n) n.className=mode==='normal'?'on':'';
  if(l) l.className=mode==='laobao'?'on':'';
  document.getElementById('is-type').value=mode;
  const hint=document.getElementById('is-hint');
  const extRow=document.getElementById('ext-row');
  if(mode==='laobao'){
    if(hint) hint.innerHTML=DOMPurify.sanitize('💡 劳保用品领用：由行政部代国际部人员提交；审批流为：领用人 → 人资部 → 物资部 → 审批领导。');
    if(extRow) extRow.style.display='';
  } else {
    if(hint) hint.innerHTML=DOMPurify.sanitize('💡 输入物料编码/名称即自动带出规格型号、单位。提交后由「行政主管」审批，通过即出库减库存并抄送行政专员。');
    if(extRow) extRow.style.display='none';
  }
}
function parseCSV(text){
  text=text.replace(/^\uFEFF/,'');
  const rows=[]; let row=[], cell='', inQ=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(inQ){
      if(ch==='"' && next==='"'){ cell+='"'; i++; }
      else if(ch==='"'){ inQ=false; }
      else { cell+=ch; }
    } else {
      if(ch==='"'){ inQ=true; }
      else if(ch===','||ch==='\t'){ row.push(cell); cell=''; }
      else if(ch==='\r'||ch==='\n'){ row.push(cell); if(row.length>1||cell.trim()!=='') rows.push(row); row=[]; cell=''; if(ch==='\r'&&next==='\n') i++; }
      else { cell+=ch; }
    }
  }
  if(cell||row.length){ row.push(cell); rows.push(row); }
  return rows.map(r=>r.map(c=>c.trim()));
}
function mapIssueHeader(rows){
  if(!rows.length) return null;
  const first=rows[0].map(c=>c.toLowerCase().replace(/\s/g,''));
  const map={};
  first.forEach((h,idx)=>{
    if(/序|编号|no/.test(h)) map._idx=idx;
    if(/物资类别|类别|分类|cat/.test(h)) map.cat=idx;
    if(/物料编码|编码|code/.test(h)) map.code=idx;
    if(/名称|物品|品名|name|物料/.test(h)&&!/(编码|类别|型号|颜色)/.test(h)) map.name=idx;
    if(/型号|颜色|规格|spec/.test(h)) map.spec=idx;
    if(/数量|qty/.test(h)) map.qty=idx;
    if(/单位|unit/.test(h)) map.unit=idx;
    if(/备注|remark/.test(h)) map.remark=idx;
  });
  return map;
}
function importIssueExcel(input){
  const file=input.files[0]; if(!file){ return; }
  const name=file.name.toLowerCase();
  if(name.endsWith('.xlsx')||name.endsWith('.xls')){ toast('暂不支持直接读取 .xlsx，请先另存为 CSV 后导入'); input.value=''; return; }
  if(!name.endsWith('.csv')){ toast('仅支持 .csv 文件'); input.value=''; return; }
  const reader=new FileReader();
  reader.onload=e=>{
    const rows=parseCSV(e.target.result).filter(r=>r.some(c=>c.trim()!==''));
    const tbody=document.getElementById('is-lines'); let added=0;
    if(!tbody){ toast('未找到领用明细表格'); input.value=''; return; }
    const colMap=mapIssueHeader(rows);
    const dataStart=colMap&&(colMap.name!==undefined||colMap.code!==undefined)?1:0;
    for(let i=dataStart;i<rows.length;i++){
      const r=rows[i];
      let code='', pname='', spec='', unit='', qty=1, cat='';
      if(colMap){
        code=colMap.code!==undefined?(r[colMap.code]||''):'';
        pname=colMap.name!==undefined?(r[colMap.name]||''):'';
        spec=colMap.spec!==undefined?(r[colMap.spec]||''):'';
        unit=colMap.unit!==undefined?(r[colMap.unit]||''):'';
        qty=colMap.qty!==undefined?Number(r[colMap.qty])||1:1;
        cat=colMap.cat!==undefined?(r[colMap.cat]||''):'';
      } else {
        code=r[0]||''; pname=r[1]||''; spec=r[2]||''; unit=r[3]||''; qty=Number(r[4])||1;
      }
      if(!code && !pname) continue;
      // 跳过表头/汇总行
      const first=(code+pname).toLowerCase();
      if(/^(序号|物资类别|名称|型号|数量|单位|备注|编码|物料|合计|总计|领用人)/.test(first)) continue;
      addIsLine();
      const tr=tbody.lastElementChild;
      tr.querySelector('.is-code').value=code;
      tr.querySelector('.is-name').value=pname;
      if(spec) tr.querySelector('.is-spec').value=spec;
      if(unit) tr.querySelector('.is-unit').value=unit;
      if(qty) tr.querySelector('.is-q').value=qty;
      if(cat && tr.querySelector('.is-cat')) tr.querySelector('.is-cat').value=cat;
      added++;
    }
    toast(added>0?'已导入 '+added+' 行':'未识别到有效数据，请检查表头是否包含「名称/数量/单位」');
    input.value='';
  };
  reader.onerror=()=>{ toast('文件读取失败，请重试'); input.value=''; };
  reader.readAsText(file,'utf-8');
}
function addIsLine(){
  const tbody=document.getElementById('is-lines'); const tr=document.createElement('tr'); tr.innerHTML=sanitizeCells(`<td><div class="searchbox"><input class="is-code" placeholder="编码/名称" autocomplete="off" data-hinput="109" style="min-width:120px"><div class="list" style="display:none"></div></div></td><td><input class="is-name" readonly></td><td><input class="is-spec" readonly></td><td><input class="is-unit" readonly style="width:50px"></td><td><input type="number" class="is-q" value="1" style="width:60px"></td><td><button class="btn ghost sm" data-hclick="110">✕</button></td>`);
  tbody.appendChild(tr);
}
function filterIsCode(input){
  const v=input.value.trim().toLowerCase(); const list=input.nextElementSibling; if(!v){list.style.display='none';return;}
  const hits=DB.materials.filter(x=>x.code.toLowerCase().includes(v)||x.name.toLowerCase().includes(v)).slice(0,8); if(!hits.length){list.style.display='none';return;}
  list.innerHTML=DOMPurify.sanitize(hits.map(m=>`<div data-hclick="111" data-aclick="${encodeURIComponent(JSON.stringify(m.id))}">${m.code} ${m.name}（库存${m.stock}${m.unit}）</div>`).join('')); list.style.display='block';
}
function fillIsLine(input,mid){
  const m=mat(mid); const tr=input.closest('tr'); input.value=m.code; tr.querySelector('.is-name').value=m.name; tr.querySelector('.is-spec').value=m.spec; tr.querySelector('.is-unit').value=m.unit;
}
function saveIssue(){
  const type=val('is-type')||'normal';
  const ap=type==='laobao'?(val('is-ext-ap').trim()||val('is-ap').trim()):val('is-ap').trim();
  if(!ap){toast('请填领用人');return;}
  const dept=type==='laobao'?(val('is-ext-dept').trim()||val('is-dept').trim()||'国际部'):val('is-dept').trim()||'未填';
  const lines=[...document.querySelectorAll('#is-lines tr')].map(tr=>{ const code=tr.querySelector('.is-code').value.trim(); const m=DB.materials.find(x=>x.code===code); return {p:m?m.id:0, q:Number(tr.querySelector('.is-q').value)||0}; }).filter(l=>l.p);
  if(!lines.length){toast('请至少选择一行物料');return;}
  for(const l of lines){ const m=mat(l.p); if(m&&m.stock<l.q){ toast('「'+m.name+'」库存不足'); return; } }
  const no=nextNo('LY2026-'); DB.issues.push({id:Math.max(0,...DB.issues.map(x=>x.id))+1,no,date:val('is-date'),applicant:ap,dept:dept,issueType:type,extApplicant:type==='laobao'?val('is-ext-ap').trim():'',extDept:type==='laobao'?val('is-ext-dept').trim():'',items:lines,reason:val('is-reason'),status:'pending',approver:'',hrApprover:'',materialApprover:'',finalApprover:'',cc:'',note:''}); save(); buildSidebar(); showView('issue'); toast('领用已提交');
}

/* ===================== 审批中心 ===================== */
function renderApprove(c){
  const r=DB.currentUser.role; let html=`<div class="page-head"><h2>审批中心</h2><span class="desc">当前角色待办汇总</span></div>`;
  if(r==='deptLead'){
    const list=DB.demands.filter(d=>d.status==='pending_dept'&&d.dept===DB.currentUser.dept);
    html+=`<div class="card"><h3 style="margin-bottom:10px;">需求提报（待部门领导审批）</h3>${list.length?`<table><thead><tr><th>单号</th><th>申请人</th><th>部门</th><th>物品</th><th>操作</th></tr></thead><tbody>${list.map(d=>`<tr><td>${d.no}</td><td>${d.applicant}</td><td>${d.dept}</td><td>${d.items.map(i=>i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td><button class="btn green sm" data-hclick="112" data-aclick="${encodeURIComponent(JSON.stringify(d.id))}">去审批</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`;
  }
  if(r==='vp'){
    const list=DB.demands.filter(d=>d.status==='pending_vp');
    html+=`<div class="card"><h3 style="margin-bottom:10px;">需求提报（待分管副总审批/分配）</h3>${list.length?`<table><thead><tr><th>单号</th><th>申请人</th><th>部门</th><th>物品</th><th>操作</th></tr></thead><tbody>${list.map(d=>`<tr><td>${d.no}</td><td>${d.applicant}</td><td>${d.dept}</td><td>${d.items.map(i=>i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td><button class="btn green sm" data-hclick="113" data-aclick="${encodeURIComponent(JSON.stringify(d.id))}">去审批</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`;
  }
  if(r==='adminLead'){
    const dList=DB.demands.filter(d=>d.status==='pending_adminLead');
    html+=`<div class="card"><h3 style="margin-bottom:10px;">需求提报（待行政主管审批）</h3>${dList.length?`<table><thead><tr><th>单号</th><th>申请人</th><th>部门</th><th>物品</th><th>操作</th></tr></thead><tbody>${dList.map(d=>`<tr><td>${d.no}</td><td>${d.applicant}</td><td>${d.dept}</td><td>${d.items.map(i=>i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td><button class="btn green sm" data-hclick="114" data-aclick="${encodeURIComponent(JSON.stringify(d.id))}">去审批</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`;
    const list=DB.purchaseReqs.filter(p=>p.status==='pending_admin');
    html+=`<div class="card" style="margin-top:14px;"><h3 style="margin-bottom:10px;">采购申请（待行政主管审批）</h3>${list.length?`<table><thead><tr><th>单号</th><th>申请人</th><th>物品</th><th>操作</th></tr></thead><tbody>${list.map(p=>`<tr><td>${p.no}</td><td>${p.applicant}</td><td>${p.items.map(i=>prItemName(i)+'×'+i.q).join('、')}</td><td><button class="btn green sm" data-hclick="115" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">去审批</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`;
  }
  if(r==='vp'){
    const list=DB.purchaseReqs.filter(p=>p.status==='pending_vp');
    html+=`<div class="card"><h3 style="margin-bottom:10px;">采购申请（待分管副总审批）</h3>${list.length?`<table><thead><tr><th>单号</th><th>申请人</th><th>物品</th><th>操作</th></tr></thead><tbody>${list.map(p=>`<tr><td>${p.no}</td><td>${p.applicant}</td><td>${p.items.map(i=>prItemName(i)+'×'+i.q).join('、')}</td><td><button class="btn green sm" data-hclick="116" data-aclick="${encodeURIComponent(JSON.stringify(p.id))}">去审批</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`;
  }
  if(['admin','adminLead','vp'].includes(r)){
    const normal=DB.issues.filter(x=>x.status==='pending'&&x.issueType!=='laobao');
    const laobaoHR=DB.issues.filter(x=>x.status==='pending'&&x.issueType==='laobao');
    const laobaoM=DB.issues.filter(x=>x.status==='hr_approved'&&x.issueType==='laobao');
    const laobaoL=DB.issues.filter(x=>x.status==='material_approved'&&x.issueType==='laobao');
    html+=`<div class="card" style="margin-top:14px;"><h3 style="margin-bottom:10px;">领用申请待办</h3>`;
    const rows=[...normal.map(x=>({x,step:'行政主管审批',act:`<button class="btn green sm" data-hclick="117" data-aclick="${encodeURIComponent(JSON.stringify(x.id))}">去审批</button>`})),...laobaoHR.map(x=>({x,step:'人资部审批',act:`<button class="btn green sm" data-hclick="118" data-aclick="${encodeURIComponent(JSON.stringify(x.id))}">去审批</button>`})),...laobaoM.map(x=>({x,step:'物资部审批',act:`<button class="btn green sm" data-hclick="119" data-aclick="${encodeURIComponent(JSON.stringify(x.id))}">去审批</button>`})),...laobaoL.map(x=>({x,step:'审批领导',act:`<button class="btn green sm" data-hclick="120" data-aclick="${encodeURIComponent(JSON.stringify(x.id))}">去审批</button>`}))];
    html+=rows.length?`<table><thead><tr><th>单号</th><th>类型</th><th>申请人</th><th>部门</th><th>当前步骤</th><th>物品</th><th>操作</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.x.no}</td><td>${r.x.issueType==='laobao'?'<span class="tag step">劳保</span>':'普通'}</td><td>${r.x.applicant}</td><td>${r.x.dept}</td><td>${r.step}</td><td>${r.x.items.map(i=>mname(i.p)+'×'+i.q).join('、')}</td><td>${r.act}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>';
    html+=`</div>`;
  }
  if(!['deptLead','adminLead','vp','admin'].includes(r)) html+='<div class="empty">当前角色无审批待办</div>';
  c.innerHTML=DOMPurify.sanitize(html);
}
function approveIssue(id){ const x=DB.issues.find(i=>i.id===id); x.status='done'; x.approver=DB.currentUser.name; x.cc='行政专员'; x.items.forEach(l=>{ const m=mat(l.p); if(m) m.stock=Math.max(0,m.stock-l.q); DB.flows.push({id:Math.max(0,...DB.flows.map(f=>f.id))+1,date:x.date,type:'out',ref:x.no,p:l.p,q:l.q,after:mat(l.p)?mat(l.p).stock:0,op:DB.currentUser.name}); }); save(); buildSidebar(); showView('issue'); toast('已出库，库存已扣减'); }
function approveIssueHR(id){ const x=DB.issues.find(i=>i.id===id); x.status='hr_approved'; x.hrApprover=DB.currentUser.name; save(); buildSidebar(); showView('issue'); toast('人资部已通过，转物资部'); }
function approveIssueMaterial(id){ const x=DB.issues.find(i=>i.id===id); x.status='material_approved'; x.materialApprover=DB.currentUser.name; save(); buildSidebar(); showView('issue'); toast('物资部已通过，转审批领导'); }
function approveIssueFinal(id){ const x=DB.issues.find(i=>i.id===id); x.status='done'; x.finalApprover=DB.currentUser.name; x.items.forEach(l=>{ const m=mat(l.p); if(m) m.stock=Math.max(0,m.stock-l.q); DB.flows.push({id:Math.max(0,...DB.flows.map(f=>f.id))+1,date:x.date,type:'out',ref:x.no,p:l.p,q:l.q,after:mat(l.p)?mat(l.p).stock:0,op:DB.currentUser.name}); }); save(); buildSidebar(); showView('issue'); toast('领导已审批，库存已扣减'); }
function rejectIssue(id){ const x=DB.issues.find(i=>i.id===id); x.status='rejected'; save(); buildSidebar(); showView('issue'); toast('已驳回领用'); }
function openIssue(id){
  const x=DB.issues.find(i=>i.id===id); if(!x) return;
  const c=document.getElementById('content');
  const isAdmin=['admin','adminLead','vp'].includes(DB.currentUser.role);
  const canEdit=(x.applicant===DB.currentUser.name||isAdmin)&&x.status!=='done';
  const isLaobao=x.issueType==='laobao';
  const stTag=x.status==='rejected'?'<span class="tag rejected">已驳回</span>':x.status==='done'?'<span class="tag done">已出库</span>':'<span class="tag pending">审批中</span>';
  const typeTag=isLaobao?'<span class="tag step">劳保用品</span>':'<span class="tag ok">普通物资</span>';
  const itemsTable=`<table class="inline-table" style="margin-top:4px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>数量</th></tr></thead><tbody>${x.items.map(i=>{ const m=mat(i.p); return `<tr><td>${m?m.code:(i.code||'-')}</td><td>${mname(i.p)}</td><td>${m?m.spec:(i.spec||'-')}</td><td>${m?m.unit:(i.unit||'-')}</td><td>${i.q}</td></tr>`; }).join('')}</tbody></table>`;
  let actions='';
  if(isLaobao){
    if(x.status==='pending') actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="121">返回列表</button><button class="btn red sm" data-hclick="122" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="123" data-aclick="${encodeURIComponent(JSON.stringify(id))}">人资部通过</button></div>`;
    else if(x.status==='hr_approved') actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="124">返回列表</button><button class="btn red sm" data-hclick="125" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="126" data-aclick="${encodeURIComponent(JSON.stringify(id))}">物资部通过</button></div>`;
    else if(x.status==='material_approved') actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="127">返回列表</button><button class="btn red sm" data-hclick="128" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="129" data-aclick="${encodeURIComponent(JSON.stringify(id))}">领导审批通过并出库</button></div>`;
    else actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="130">返回列表</button>${canEdit?`<button class="btn" data-hclick="131" data-aclick="${encodeURIComponent(JSON.stringify(id))}">修改</button>`:''}</div>`;
  } else {
    if(x.status==='pending'&&isAdmin) actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="132">返回列表</button><button class="btn red sm" data-hclick="133" data-aclick="${encodeURIComponent(JSON.stringify(id))}">驳回</button><button class="btn green" data-hclick="134" data-aclick="${encodeURIComponent(JSON.stringify(id))}">审批通过并出库</button></div>`;
    else actions=`<div style="margin-top:14px;" class="right"><button class="btn ghost" data-hclick="135">返回列表</button>${canEdit?`<button class="btn" data-hclick="136" data-aclick="${encodeURIComponent(JSON.stringify(id))}">修改</button>`:''}</div>`;
  }
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>领用详情 ${x.no}</h2><span class="desc">${typeTag} ${stTag}</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="137">返回列表</button></div>
    <div class="card">
      <div class="detail-row"><div class="label">领用日期</div><div class="value">${x.date}</div></div>
      <div class="detail-row"><div class="label">领用人</div><div class="value">${x.applicant}${x.extApplicant?'（外部：'+x.extApplicant+'）':''}（${x.dept}）</div></div>
      <div class="detail-row"><div class="label">用途说明</div><div class="value">${x.reason||'-'}</div></div>
      <div class="detail-row"><div class="label">物品明细</div><div class="value">${itemsTable}</div></div>
      <div style="margin-top:14px;"><b>审批流程</b>${buildIssueFlow(x)}</div>
      ${actions}
    </div>`);
}

/* ===================== 库存统计 ===================== */
function renderInventory(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>库存统计</h2><span class="desc">实时库存 = 入库累计 - 出库累计，低于库存预警数量触发预警</span><div class="spacer"></div><input class="list-search" placeholder="搜索编码/名称/规格/类别" data-hinput="138"><button class="btn ghost sm" data-hclick="139" style="margin-left:8px;">⬇ 导出</button></div>
    <div class="card"><table><thead><tr><th>物料编码</th><th>名称</th><th>规格型号</th><th>单位</th><th>类别</th><th>入库数</th><th>出库数</th><th>库存数</th><th>库存金额</th><th>库存预警数量</th><th>状态</th><th>采购建议</th></tr></thead><tbody id="inv-tbody">${inventoryRows('')}</tbody></table></div>`);
}
function inventoryRows(f){
  const k=(f||'').trim().toLowerCase();
  const list=DB.materials.filter(p=>!k||p.code.toLowerCase().includes(k)||p.name.toLowerCase().includes(k)||(p.spec||'').toLowerCase().includes(k)||(p.cat||'').toLowerCase().includes(k));
  if(!list.length) return '<tr><td colspan="12" class="empty">无匹配结果</td></tr>';
  return list.map(p=>{
    const inQ=DB.flows.filter(x=>x.type==='in'&&x.p===p.id).reduce((s,x)=>s+x.q,0);
    const outQ=DB.flows.filter(x=>x.type==='out'&&x.p===p.id).reduce((s,x)=>s+x.q,0);
    const warn=p.stock<=p.warnQty; const suggest=warn?Math.max(p.warnQty*2-p.stock, Math.ceil(outQ/3)):0;
    return `<tr><td>${p.code}</td><td>${p.name}</td><td>${p.spec}</td><td>${p.unit}</td><td>${p.cat}</td><td>${inQ}</td><td>${outQ}</td><td><b>${p.stock}</b></td><td>¥${(p.stock*p.price).toLocaleString()}</td><td>${p.warnQty}</td><td>${warn?'<span class="tag low">预警</span>':'<span class="tag ok">正常</span>'}</td><td>${warn?`<span class="tag pending">建议采购${suggest}${p.unit}</span>`:'-'}</td></tr>`;
  }).join('');
}
function filterInventory(v){ const tb=document.getElementById('inv-tbody'); if(tb) tb.innerHTML=sanitizeRows(inventoryRows(v)); }

/* ===================== 盘点 ===================== */
function renderCount(c){
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>盘点</h2><span class="desc">导出盘点报表，实地核对后回填实盘数</span><div class="spacer"></div><input class="list-search" placeholder="搜索单号/盘点人/日期" data-hinput="140"><button class="btn sm" data-hclick="141" style="margin-left:8px;">+ 生成盘点表</button></div>
    <div class="card"><table><thead><tr><th>盘点单号</th><th>日期</th><th>盘点人</th><th>物品数</th><th>状态</th><th>操作</th></tr></thead><tbody id="count-tbody">${countRows('')}</tbody></table></div>`);
}
function countRows(f){
  const k=(f||'').trim().toLowerCase();
  const list=DB.counts.slice().reverse().filter(c=>!k||c.no.toLowerCase().includes(k)||(c.counter||'').toLowerCase().includes(k)||(c.date||'').toLowerCase().includes(k));
  if(!list.length) return '<tr><td colspan="6" class="empty">暂无盘点任务</td></tr>';
  return list.map(k=>{ return `<tr><td>${k.no}</td><td>${k.date}</td><td>${k.counter}</td><td>${k.items.length}</td><td><span class="tag ${k.done?'done':'wait'}">${k.done?'已完成':'待盘点'}</span></td><td><button class="btn ghost sm" data-hclick="142" data-aclick="${encodeURIComponent(JSON.stringify(k.id))}">查看</button> <button class="btn ghost sm" data-hclick="143" data-aclick="${encodeURIComponent(JSON.stringify(k.id))}">导出</button></td></tr>`; }).join('');
}
function filterCount(v){ const tb=document.getElementById('count-tbody'); if(tb) tb.innerHTML=sanitizeRows(countRows(v)); }
function newCount(){ const no=nextNo('PD2026-'); const items=DB.materials.map(p=>({p:p.id,sysQty:p.stock,realQty:'',diff:0,status:'待盘'})); DB.counts.push({id:Math.max(0,...DB.counts.map(x=>x.id))+1,no,date:'2026-07-21',items,counter:DB.currentUser.name,done:false,note:''}); save(); renderCount(document.getElementById('content')); toast('已生成盘点表 '+no); }
function openCount(id){
  const k=DB.counts.find(x=>x.id===id); if(!k) return;
  const c=document.getElementById('content');
  const rows=k.items.map((it,idx)=>{ const m=mat(it.p); const diff=it.realQty!==''?(Number(it.realQty)-it.sysQty):0; return `<tr><td>${m.code}</td><td>${m.name}</td><td>${m.spec}</td><td>${m.unit}</td><td>${m.cat}</td><td>${it.sysQty}</td><td><input style="width:90px" type="number" value="${it.realQty}" data-hinput="144" data-ainput="${encodeURIComponent(JSON.stringify(k.id))},${encodeURIComponent(JSON.stringify(idx))}"></td><td id="cnt-diff-${k.id}-${idx}">${it.realQty!==''?(diff>0?'+'+diff:diff):'-'}</td><td id="cnt-st-${k.id}-${idx}">${diff<0?'<span class="tag low">亏</span>':diff>0?'<span class="tag ok">盈</span>':'<span class="tag wait">平</span>'}</td><td>${k.counter}</td><td><input style="width:100px" value="${it.note||''}" data-hchange="145" data-achange="${encodeURIComponent(JSON.stringify(k.id))},${encodeURIComponent(JSON.stringify(idx))}"></td></tr>`; }).join('');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>盘点表 ${k.no}</h2><span class="desc">实地核对后回填实盘数</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="146">返回列表</button><button class="btn ghost sm" data-hclick="147" data-aclick="${encodeURIComponent(JSON.stringify(k.id))}" style="margin-left:8px;">⬇ 导出盘点表</button><button class="btn sm" data-hclick="148" data-aclick="${encodeURIComponent(JSON.stringify(k.id))}" style="margin-left:8px;">完成盘点</button></div>
    <div class="card count-scroll"><table class="inline-table count"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>类别</th><th>库存数量</th><th>实盘数量</th><th>盈亏数量</th><th>状态</th><th>盘点人</th><th>备注</th></tr></thead><tbody>${rows}</tbody></table></div>`);
}
function updCountLive(kid,idx,v){ const k=DB.counts.find(x=>x.id===kid); k.items[idx].realQty=v; k.items[idx].diff=Number(v)-k.items[idx].sysQty; save(); const diff=k.items[idx].diff; const dEl=document.getElementById('cnt-diff-'+kid+'-'+idx); const sEl=document.getElementById('cnt-st-'+kid+'-'+idx); if(dEl) dEl.textContent=v===''?'':(diff>0?'+'+diff:diff); if(sEl) sEl.innerHTML=DOMPurify.sanitize(diff<0?'<span class="tag low">亏</span>':diff>0?'<span class="tag ok">盈</span>':'<span class="tag wait">平</span>'); }
function updCountNote(kid,idx,v){ const k=DB.counts.find(x=>x.id===kid); k.items[idx].note=v; save(); }
function exportCount(id){
  const k=DB.counts.find(x=>x.id===id); if(!k) return;
  const headers=['物料编码','物料名称','规格型号','单位','类别','库存数量','实盘数量','盈亏数量','状态','盘点人','备注'];
  const rows=k.items.map(it=>{ const m=mat(it.p); const diff=it.realQty!==''?(Number(it.realQty)-it.sysQty):0; const status=diff<0?'亏':diff>0?'盈':'平'; return [m.code,m.name,m.spec,m.unit,m.cat,it.sysQty,it.realQty===''?'':it.realQty,diff,status,k.counter,it.note||'']; });
  const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`盘点表_${k.no}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast('已导出 CSV 盘点表');
}
function finishCount(kid){ const k=DB.counts.find(x=>x.id===kid); k.done=true; save(); renderCount(document.getElementById('content')); toast('盘点已完成'); }

/* ===================== 成本统计 ===================== */
function svgLineChart(labels,vals){
  if(!vals.length) return '<div class="empty">暂无数据</div>';
  const W=600,H=210,pad=34; const max=Math.max(1,...vals); const n=vals.length;
  const stepX=n>1?(W-2*pad)/(n-1):0;
  const xy=i=>{ const x=pad+(n>1?i*stepX:(W-pad)/2); const y=H-pad-(vals[i]/max)*(H-2*pad); return [x,y]; };
  const pts=vals.map((v,i)=>{ const [x,y]=xy(i); return x.toFixed(1)+','+y.toFixed(1); }).join(' ');
  const area=`${pad},${H-pad} `+pts+` ${pad+(n>1?(n-1)*stepX:0)},${H-pad}`;
  const dots=vals.map((v,i)=>{ const [x,y]=xy(i); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="#2f6fed"/><text x="${x.toFixed(1)}" y="${(H-10)}" font-size="11" fill="#7a8699" text-anchor="middle">${labels[i]}</text><text x="${x.toFixed(1)}" y="${(y-8).toFixed(1)}" font-size="10" fill="#2f6fed" text-anchor="middle">¥${Math.round(v).toLocaleString()}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px"><polygon points="${area}" fill="#eef3ff"/><polyline points="${pts}" fill="none" stroke="#2f6fed" stroke-width="2"/>${dots}</svg>`;
}
function renderCost(c){
  const inCost=DB.purchases.reduce((s,p)=>s+p.items.reduce((a,i)=>a+i.q*i.price,0),0);
  const outCost=DB.issues.filter(x=>x.status==='done').reduce((s,x)=>s+x.items.reduce((a,i)=>a+i.q*mprice(i.p),0),0);
  const stockVal=DB.materials.reduce((s,p)=>s+p.stock*p.price,0);
  const deptMap={}; DB.issues.filter(x=>x.status==='done').forEach(x=>{ const cost=x.items.reduce((s,i)=>s+i.q*mprice(i.p),0); deptMap[x.dept]=(deptMap[x.dept]||0)+cost; });
  const depts=Object.keys(deptMap); const maxD=Math.max(1,...depts.map(d=>deptMap[d]));
  const supMap={}; DB.purchases.forEach(p=>{ supMap[p.supplier]=(supMap[p.supplier]||0)+p.items.reduce((a,i)=>a+i.q*i.price,0); });
  const sups=Object.keys(supMap);
  // 各物资类型采购金额（按采购申请 items 的 cat 汇总）
  const catMap={}; DB.purchaseReqs.forEach(p=>p.items.forEach(i=>{ const c2=i.cat||mat(i.p).cat||'未分类'; catMap[c2]=(catMap[c2]||0)+i.q*(i.price||0); }));
  const cats=Object.keys(catMap); const maxC=Math.max(1,...cats.map(d=>catMap[d]));
  // 供应商类型采购金额（按供应商 type 汇总）
  const supTypeMap={}; DB.purchases.forEach(p=>{ const s=DB.suppliers.find(x=>x.name===p.supplier); const t=s?s.type:'未知'; supTypeMap[t]=(supTypeMap[t]||0)+p.items.reduce((a,i)=>a+i.q*i.price,0); });
  const supTypes=Object.keys(supTypeMap); const maxT=Math.max(1,...supTypes.map(d=>supTypeMap[d]));
  // 月度采购趋势
  const monthMap={}; DB.purchases.forEach(p=>{ const m=(p.date||'').slice(0,7); if(m) monthMap[m]=(monthMap[m]||0)+p.items.reduce((a,i)=>a+i.q*i.price,0); });
  const months=Object.keys(monthMap).sort(); const monthVals=months.map(m=>monthMap[m]);
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>成本统计</h2><span class="desc">入库成本 / 领用成本 / 部门费用 / 供应商 / 趋势</span></div>
    <div class="grid stats"><div class="card stat"><div class="label">累计采购成本</div><div class="num">¥${inCost.toLocaleString()}</div></div><div class="card stat"><div class="label">累计领用成本</div><div class="num green">¥${outCost.toLocaleString()}</div></div><div class="card stat"><div class="label">当前库存价值</div><div class="num amber">¥${stockVal.toLocaleString()}</div></div><div class="card stat"><div class="label">净流出(领用)</div><div class="num">¥${(outCost).toLocaleString()}</div></div></div>
    <div class="card" style="margin-top:16px;"><h3 style="margin-bottom:12px;">各部门领用费用</h3>${depts.length?`<div class="bar-chart">${depts.map(d=>`<div class="col"><div class="bar" style="height:${deptMap[d]/maxD*100}%"></div><div class="cap">${d}<br>¥${deptMap[d].toLocaleString()}</div></div>`).join('')}</div>`:'<div class="empty">暂无</div>'}</div>
    <div class="card" style="margin-top:16px;"><h3 style="margin-bottom:12px;">各物资类型采购金额</h3>${cats.length?`<div class="bar-chart">${cats.map(d=>{ const pct=catMap[d]/maxC*100; return `<div class="col"><div class="bar" style="height:${pct}%;background:${d==='劳保用品'?'#1faa6b':'#2f6fed'}"></div><div class="cap">${d}<br>¥${catMap[d].toLocaleString()}</div></div>`; }).join('')}</div>`:'<div class="empty">暂无</div>'}</div>
    <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:16px;">
      <div class="card"><h3 style="margin-bottom:10px;">各供应商采购额</h3>${sups.length?`<table><thead><tr><th>供应商</th><th>采购额</th></tr></thead><tbody>${sups.map(s=>`<tr><td>${s}</td><td>¥${supMap[s].toLocaleString()}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>
      <div class="card"><h3 style="margin-bottom:10px;">供应商类型采购金额</h3>${supTypes.length?`<table><thead><tr><th>供应商类型</th><th>采购额</th></tr></thead><tbody>${supTypes.map(t=>`<tr><td>${t}</td><td>¥${supTypeMap[t].toLocaleString()}</td></tr>`).join('')}</tbody></table><div class="bar-chart" style="height:120px;margin-top:10px;">${supTypes.map(t=>`<div class="col"><div class="bar" style="height:${supTypeMap[t]/maxT*100}%"></div><div class="cap">${t}<br>¥${supTypeMap[t].toLocaleString()}</div></div>`).join('')}</div>`:'<div class="empty">暂无</div>'}</div>
    </div>
    <div class="card" style="margin-top:16px;"><h3 style="margin-bottom:12px;">月度采购趋势</h3>${svgLineChart(months,monthVals)}</div>`);
}

/* ===================== 我的记录 ===================== */
function renderMyRec(c){
  const u=DB.currentUser; const dm=DB.demands.filter(d=>d.applicant===u.name); const is=DB.issues.filter(x=>x.applicant===u.name);
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>我的记录</h2></div><div class="card"><h3 style="margin-bottom:10px;">我的需求提报</h3>${dm.length?`<table><thead><tr><th>单号</th><th>物品</th><th>状态</th></tr></thead><tbody>${dm.map(d=>`<tr><td>${d.no}</td><td>${d.items.map(i=>i.name+'×'+i.q+(i.unit?i.unit:'')+(i.spec?'（'+i.spec+'）':'')).join('、')}</td><td><span class="tag ${d.status==='received'?'received':d.status==='assigned'?'assign':'pending'}">${d.status}</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div><div class="card" style="margin-top:14px;"><h3 style="margin-bottom:10px;">我的领用</h3>${is.length?`<table><thead><tr><th>单号</th><th>物品</th><th>状态</th></tr></thead><tbody>${is.map(x=>`<tr><td>${x.no}</td><td>${x.items.map(i=>mname(i.p)+'×'+i.q).join('、')}</td><td><span class="tag ${x.status==='done'?'done':'pending'}">${x.status==='done'?'已出库':'待审批'}</span></td></tr>`).join('')}</tbody></table>`:'<div class="empty">暂无</div>'}</div>`);
}

/* ===================== 系统设置 ===================== */
const PERM_ROLES=[{k:'staff',t:'员工/全员'},{k:'deptLead',t:'部门领导'},{k:'admin',t:'行政专员'},{k:'adminLead',t:'行政主管'},{k:'vp',t:'分管副总'}];
const PERM_FEATURES=['需求提报','部门审批(需求)','副总审批/分配需求','任务分配','采购申请','采购主管审批','采购副总审批','采购入库','领用申请','领用审批(行政)','库存/盘点','成本/报表','供应商/档案'];
function permDefault(f,r){
  if(['需求提报','领用申请'].includes(f)) return 'visible';
  const map={'部门审批(需求)':['deptLead'],'副总审批/分配需求':['vp'],'任务分配':['admin','adminLead','vp'],'采购申请':['admin','adminLead','vp'],'采购主管审批':['adminLead'],'采购副总审批':['vp'],'采购入库':['admin','adminLead','vp'],'领用审批(行政)':['admin','adminLead','vp'],'库存/盘点':['admin','adminLead','vp'],'成本/报表':['admin','adminLead','vp'],'供应商/档案':['admin','adminLead','vp']};
  return (map[f]&&map[f].includes(r))?'visible':'hidden';
}
function defaultPerm(){ const m={}; PERM_FEATURES.forEach(f=>{ m[f]={}; PERM_ROLES.forEach(r=>{ m[f][r.k]=permDefault(f,r.k); }); }); return m; }
function renderSettings(c){
  const u=DB.currentUser; if(!['admin','adminLead','vp'].includes(u.role)){ c.innerHTML=DOMPurify.sanitize('<div class="empty">无权限</div>'); return; }
  const perm=DB.settings.permissions||defaultPerm();
  const info=DB.settings.company||{name:'示例科技有限公司',sysName:'物资进销存管理系统',backup:'02:00',notify:['企业微信']};
  let rows='';
  PERM_FEATURES.forEach(f=>{ rows+=`<tr><td>${f}</td>`+PERM_ROLES.map(r=>`<td><select class="perm-sel" data-f="${f}" data-r="${r.k}"><option value="visible" ${perm[f][r.k]==='visible'?'selected':''}>可见</option><option value="hidden" ${perm[f][r.k]==='hidden'?'selected':''}>不可见</option></select></td>`).join('')+`</tr>`; });
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>系统设置</h2><span class="desc">权限矩阵 / 公司信息 / 数据备份</span></div>
    <div class="card" style="margin-bottom:16px;"><h3 style="margin-bottom:12px;">公司信息</h3>
      <div class="form-row"><div class="field"><label>公司名称</label><input id="co-name" value="${info.name||''}"></div><div class="field"><label>系统名称</label><input id="co-sys" value="${info.sysName||''}"></div></div>
      <div class="form-row"><div class="field"><label>备份时间</label><input id="co-backup" value="${info.backup||''}" placeholder="如 02:00"></div><div class="field"><label>通知方式</label><div style="padding-top:6px;">${['企业微信','邮件','短信'].map(n=>`<label class="switch" style="margin-right:16px"><input type="checkbox" class="co-notify" value="${n}" ${(info.notify||[]).includes(n)?'checked':''}> ${n}</label>`).join('')}</div></div></div>
      <div style="margin-top:10px;"><button class="btn" data-hclick="149">保存公司信息</button></div>
    </div>
    <div class="card" style="margin-bottom:16px;">
      <h3 style="margin-bottom:10px;">角色权限矩阵（可编辑）</h3>
      <table><thead><tr><th>功能</th>${PERM_ROLES.map(r=>`<th>${r.t}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
      <div style="margin-top:12px;"><button class="btn green" data-hclick="150">保存权限设置</button></div>
    </div>
    <div class="card">
      <h3 style="margin-bottom:10px;">数据管理</h3>
      <button class="btn purple" data-hclick="151">💾 数据备份</button>
      <div class="hint" style="margin-top:14px;">🔒 <b>涉密控制</b>：字段级（成本/单价对普通员工隐藏）、页面级（供应商报价/成本报表仅指定角色可见）、数据级（员工只看本人/本部门记录）。</div>
      <div class="hint" style="margin-top:8px;">💾 <b>部署方案</b>：群晖 NAS + Docker 内网部署，数据存在 NAS 硬盘，每日自动备份副本。</div>
      <div style="margin-top:14px;"><button class="btn ghost sm" data-hclick="152">重置演示数据</button></div>
    </div>`);
}
function savePerm(){ const perm={}; PERM_FEATURES.forEach(f=>{ perm[f]={}; PERM_ROLES.forEach(r=>{ const el=document.querySelector('.perm-sel[data-f="'+f+'"][data-r="'+r.k+'"]'); perm[f][r.k]=el?el.value:'hidden'; }); }); DB.settings.permissions=perm; save(); toast('权限设置已保存'); }
function saveSettings(){ const notify=[...document.querySelectorAll('.co-notify')].filter(x=>x.checked).map(x=>x.value); DB.settings.company={name:val('co-name'),sysName:val('co-sys'),backup:val('co-backup'),notify}; save(); toast('公司信息已保存'); }
function backupData(){ const blob=new Blob([statePayload()],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='inventory-records.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast('已导出业务记录，附件文件不包含在内'); }

/* ===================== 单据修改（修改后重新走审批） ===================== */
function editDemand(id){
  const d=DB.demands.find(x=>x.id===id); if(!d) return;
  const c=document.getElementById('content');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>修改需求 ${d.no}</h2><span class="desc">修改后将重新提交审批</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="153">返回列表</button></div><div class="card">
      <div class="hint">💡 修改后单据状态将按申请人角色重置为初始审批节点，原审批记录清空。</div>
      <div class="form-row"><div class="field"><label>申请日期</label><input id="dm-date" type="date" value="${d.applyDate||d.date}"></div>${buildSearch('dm-ap','申请人','请输入姓名搜索',USERS.map(x=>x.name))}${buildSearch('dm-dept','部门','请输入部门搜索',DEPTS)}<div class="field"><label>是否重复性采购</label><select id="dm-repeat"><option ${d.isRepeat==='否'?'selected':''}>否</option><option ${d.isRepeat==='是'?'selected':''}>是</option></select></div></div>
      <div id="dm-lines"></div><button class="add-line" data-hclick="154">+ 增加物品</button>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>预计使用时间</label><input id="dm-use" type="date" value="${d.expectedUse}"></div><div class="field"><label>推荐厂家/链接</label><input id="dm-rec" value="${d.recommend||''}"></div><div class="field"><label>预算范围</label><input id="dm-budget" value="${d.budget||''}"></div></div>
      <div class="form-row"><div class="field"><label>用途说明</label><textarea id="dm-reason" rows="2">${d.reason||''}</textarea></div></div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="155">取消</button><button class="btn" data-hclick="156" data-aclick="${encodeURIComponent(JSON.stringify(id))}">保存并重新提交</button></div></div>`);
  setTimeout(()=>{ document.getElementById('dm-ap').value=d.applicant; document.getElementById('dm-dept').value=d.dept; },0);
  d.items.forEach(i=>{ addDmLine(); const line=document.querySelectorAll('#dm-lines .line-item'); const last=line[line.length-1]; last.querySelector('.dm-cat').value=i.cat||''; last.querySelector('.dm-name').value=i.name; last.querySelector('.dm-spec').value=i.spec||''; last.querySelector('.dm-q').value=i.q; last.querySelector('.dm-unit').value=i.unit||''; });
}
function saveDemandEdit(id){
  const d=DB.demands.find(x=>x.id===id);
  const lines=[...document.querySelectorAll('#dm-lines .line-item')].map(n=>({cat:n.querySelector('.dm-cat').value.trim(),name:n.querySelector('.dm-name').value.trim(),spec:n.querySelector('.dm-spec').value.trim(),q:Number(n.querySelector('.dm-q').value),unit:n.querySelector('.dm-unit').value.trim()}));
  if(!lines.length||!lines[0].name){toast('请至少填写一行物料');return;}
  d.applyDate=val('dm-date'); d.date=val('dm-date'); d.applicant=val('dm-ap'); d.dept=val('dm-dept').trim()||d.dept; d.isRepeat=val('dm-repeat'); d.items=lines; d.reason=val('dm-reason'); d.expectedUse=val('dm-use'); d.recommend=val('dm-rec'); d.budget=val('dm-budget'); d.status=getDemandStatusByApplicant(d.applicant); d.deptApprover=''; d.approverVp=''; d.receiver=''; d.assignee=''; save(); buildSidebar(); showView('demandList'); toast('需求已修改并重新提交审批');
}

function editPurReq(id){
  const p=DB.purchaseReqs.find(x=>x.id===id); if(!p) return;
  const u=DB.currentUser; const c=document.getElementById('content');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>修改采购申请 ${p.no}</h2><span class="desc">修改后将重新提交审批</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="157">返回列表</button></div><div class="card">
      <div class="hint">💡 修改后单据状态将重置为「待行政主管审批」，原审批记录清空。</div>
      <div class="form-row"><div class="field"><label>采购人</label><input id="pr-ap" value="${p.applicant}"></div><div class="field"><label>部门</label><input id="pr-dept" value="${p.dept}"></div><div class="field"><label>日期</label><input id="pr-date" type="date" value="${p.date}"></div></div>
      <div class="form-row"><div class="field"><label>申请事由</label><input id="pr-reason" value="${p.reason||''}"></div><div class="field"><label>需求人</label><input id="pr-requester" value="${p.requester||''}"></div><div class="field"><label>需求部门</label><input id="pr-requester-dept" value="${p.requesterDept||''}"></div></div>
      <div class="form-row"><div class="field"><label>下单方式</label><select id="pr-orderway" data-hchange="158"><option value="">请选择</option><option value="A办公用品集采供应商" ${p.orderWay==='A办公用品集采供应商'?'selected':''}>A办公用品集采供应商</option><option value="B办公用品集采供应商" ${p.orderWay==='B办公用品集采供应商'?'selected':''}>B办公用品集采供应商</option><option value="其他方式下单" ${p.orderWay==='其他方式下单'?'selected':''}>其他方式下单</option></select></div><div class="field"><label>支付方式</label><select id="pr-payway"><option value="">请选择</option><option value="垫付报销" ${p.payWay==='垫付报销'?'selected':''}>垫付报销</option><option value="对公转账" ${p.payWay==='对公转账'?'selected':''}>对公转账</option><option value="冲抵备用金" ${p.payWay==='冲抵备用金'?'selected':''}>冲抵备用金</option><option value="集采月结" ${p.payWay==='集采月结'?'selected':''}>集采月结</option></select></div><div class="field"><label>入库地址</label><select id="pr-warehouse"><option value="">请选择入库地址</option><option ${p.warehouse==='总部大楼'?'selected':''}>总部大楼</option><option ${p.warehouse==='分仓A'?'selected':''}>分仓A</option><option ${p.warehouse==='分仓B'?'selected':''}>分仓B</option></select></div></div>
      <div class="form-row"><div class="field"><label>实际支付总金额（可后补）</label><input id="pr-actual" type="number" value="${p.actualPay||''}" placeholder="实际支付金额，可与申请金额不一致"></div><div class="field"><label>差异说明</label><input id="pr-diffnote" value="${p.diffNote||''}" placeholder="如价格波动原因"></div><div class="field"><label>备注</label><input id="pr-note" value="${p.note||''}"></div></div>
      <div id="pr-lines"></div><button class="add-line" data-hclick="159">+ 增加物品</button>
      <div class="right" style="margin-top:10px;font-size:15px;font-weight:700;">合计：<span id="pr-total">¥0</span></div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="160">取消</button><button class="btn" data-hclick="161" data-aclick="${encodeURIComponent(JSON.stringify(id))}">保存并重新提交</button></div></div>`);
  window.__prMode='normal';
  p.items.forEach(i=>{ addPrLine(i); const line=document.querySelectorAll('#pr-lines .line-item'); const last=line[line.length-1]; last.querySelector('.pr-brand').value=i.brand||''; calcPrLine(last.querySelector('.pr-q')); });
}
function savePurReqEdit(id){
  const p=DB.purchaseReqs.find(x=>x.id===id);
  const lines=[...document.querySelectorAll('#pr-lines .line-item')].map(n=>{
    const code=n.querySelector('.pr-code').value.trim(); const name=n.querySelector('.pr-name').value.trim();
    const m=DB.materials.find(x=>x.code===code)||DB.materials.find(x=>x.name===name);
    return {p:m?m.id:0, q:Number(n.querySelector('.pr-q').value)||0, price:Number(n.querySelector('.pr-pr').value)||0, name:m?m.name:name, spec:m?m.spec:(n.querySelector('.pr-spec').value.trim()), unit:m?m.unit:(n.querySelector('.pr-unit')?n.querySelector('.pr-unit').value.trim():''), cat:m?m.cat:(n.querySelector('.pr-cat')?n.querySelector('.pr-cat').value.trim():''), brand:n.querySelector('.pr-brand')?n.querySelector('.pr-brand').value.trim():'', code:code};
  });
  if(!lines.length||!lines[0].name){toast('请至少填写一行');return;}
  p.date=val('pr-date'); p.applicant=val('pr-ap'); p.dept=val('pr-dept'); p.requester=val('pr-requester'); p.requesterDept=val('pr-requester-dept'); p.items=lines; p.reason=val('pr-reason'); p.orderWay=val('pr-orderway'); p.payWay=val('pr-payway'); p.warehouse=val('pr-warehouse'); p.note=val('pr-note'); p.actualPay=Number(val('pr-actual'))||0; p.diffNote=val('pr-diffnote'); p.status='pending_admin'; p.approverLead=''; p.approverVp=''; save(); buildSidebar(); showView('purReq'); toast('采购申请已修改并重新提交审批');
}

function editStockIn(id){
  const p=DB.purchases.find(x=>x.id===id); if(!p) return;
  const c=document.getElementById('content');
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>修改入库单 ${p.no}</h2><span class="desc">修改后将重新计算库存</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="162">返回列表</button></div><div class="card">
      <div class="hint">💡 保存时会先扣减原入库数量，再按新数量重新入库。</div>
      <div class="form-row"><div class="field"><label>入库单号</label><input id="si-no" value="${p.no}" disabled></div><div class="field"><label>日期</label><input id="si-date" type="date" value="${p.date}"></div><div class="field"><label>经办人</label><input id="si-handler" value="${p.handler}"></div></div>
      <div class="form-row"><div class="field"><label>供应商</label><input id="si-sup" value="${p.supplier}"></div><div class="field"><label>关联采购申请（可选）</label><select id="si-req" data-hchange="163"><option value="">不关联</option>${DB.purchaseReqs.filter(pr=>pr.status==='done').map(pr=>`<option value="${pr.no}" ${p.refReq===pr.no?'selected':''}>${pr.no}</option>`).join('')}</select></div></div>
      <table class="inline-table" style="margin-top:10px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>供应商</th><th>单位</th><th>类别</th><th>数量</th><th>单价</th><th>金额</th><th>存放位置</th><th>责任人</th><th></th></tr></thead><tbody id="si-lines"></tbody></table>
      <div style="margin-top:10px;"><button class="add-line" data-hclick="164">+ 增加一行</button></div>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>备注</label><textarea id="si-note" rows="2">${p.note||''}</textarea></div></div>
      <div class="right"><button class="btn ghost" data-hclick="165">取消</button><button class="btn" data-hclick="166" data-aclick="${encodeURIComponent(JSON.stringify(id))}">保存</button></div></div>`);
  p.items.forEach(i=>{ addSiLine(); const tr=document.querySelectorAll('#si-lines tr'); const last=tr[tr.length-1]; const m=DB.materials.find(x=>x.id===i.p); if(m){ last.querySelector('.si-code').value=m.code; last.querySelector('.si-name').value=m.name; last.querySelector('.si-spec').value=m.spec; last.querySelector('.si-sup').value=i.supplier||m.supplier||''; last.querySelector('.si-unit').value=m.unit; last.querySelector('.si-cat').value=m.cat; } else { last.querySelector('.si-code').value=i.code||''; last.querySelector('.si-name').value=i.name||''; last.querySelector('.si-spec').value=i.spec||''; last.querySelector('.si-sup').value=i.supplier||''; last.querySelector('.si-unit').value=i.unit||''; last.querySelector('.si-cat').value=i.cat||''; } last.querySelector('.si-q').value=i.q; last.querySelector('.si-pr').value=i.price; last.querySelector('.si-loc').value=i.location||''; last.querySelector('.si-owner').value=i.owner||''; calcSiLine(last.querySelector('.si-q')); });
}
function saveStockInEdit(id){
  const p=DB.purchases.find(x=>x.id===id);
  const sup=val('si-sup').trim(); if(!sup){toast('请填供应商');return;}
  const lines=[...document.querySelectorAll('#si-lines tr')].map(tr=>{
    const code=tr.querySelector('.si-code').value.trim(); const m=DB.materials.find(x=>x.code===code);
    return {p:m?m.id:0, q:Number(tr.querySelector('.si-q').value)||0, price:Number(tr.querySelector('.si-pr').value)||0, supplier:tr.querySelector('.si-sup').value, location:tr.querySelector('.si-loc').value, owner:tr.querySelector('.si-owner').value, name:tr.querySelector('.si-name').value, spec:tr.querySelector('.si-spec').value, unit:tr.querySelector('.si-unit').value, cat:tr.querySelector('.si-cat').value, code:code};
  }).filter(l=>l.name||l.code);
  if(!lines.length){toast('请至少添加一行');return;}
  // 先扣减原数量
  p.items.forEach(l=>{ if(l.p){ const m=mat(l.p); m.stock=Math.max(0,m.stock-l.q); } });
  p.date=val('si-date'); p.supplier=sup; p.refReq=val('si-req'); p.items=lines; p.handler=val('si-handler'); p.note=val('si-note');
  lines.forEach(l=>{ if(l.p){ const m=mat(l.p); m.stock+=l.q; } });
  save(); buildSidebar(); showView('stockIn'); toast('入库单已修改，库存已重新计算');
}

function editIssue(id){
  const x=DB.issues.find(i=>i.id===id); if(!x) return;
  const c=document.getElementById('content'); const isLaobao=x.issueType==='laobao';
  const u=DB.currentUser; const isAdminDept=(u.dept==='行政部');
  const tabs=isAdminDept
    ?`<div class="seg" style="margin-bottom:14px;"><button class="${!isLaobao?'on':''}" id="seg-is-normal" data-hclick="167">普通物资</button><button class="${isLaobao?'on':''}" id="seg-is-laobao" data-hclick="168">劳保用品（国际部出行）</button></div>`
    :`<div class="seg" style="margin-bottom:14px;"><button class="on" id="seg-is-normal">普通物资</button></div>`;
  c.innerHTML=DOMPurify.sanitize(`<div class="page-head"><h2>修改领用申请 ${x.no}</h2><span class="desc">修改后将重新提交审批</span><div class="spacer"></div><button class="btn ghost sm" data-hclick="169">返回列表</button></div><div class="card">
      <div class="hint">💡 若原领用已出库，保存时会先恢复库存；单据状态重置为待审批。</div>
      ${tabs}
      <input type="hidden" id="is-type" value="${x.issueType||'normal'}">
      <div class="hint" id="is-hint">${isLaobao?'💡 劳保用品领用：由行政部代国际部人员提交；审批流为：领用人 → 人资部 → 物资部 → 审批领导。':'💡 输入物料编码/名称即自动带出规格型号、单位。提交后由「行政主管」审批，通过即出库减库存并抄送行政专员。'}</div>
      <div class="form-row"><div class="field" style="flex:1;">${buildSearch('is-ap','领用人','请输入姓名搜索',USERS.map(u=>u.name))}</div><div class="field" style="flex:1;">${buildSearch('is-dept','领用部门','请输入部门搜索',DEPTS)}</div><div class="field" style="flex:0 0 160px;"><label>领用日期</label><input id="is-date" type="date" value="${x.date}"></div></div>
      <div class="form-row" id="ext-row" style="display:${isLaobao?'':'none'};"><div class="field"><label>外部领用人姓名</label><input id="is-ext-ap" value="${x.extApplicant||''}" placeholder="如：国际部员工姓名"></div><div class="field"><label>外部部门</label><input id="is-ext-dept" value="${x.extDept||''}" placeholder="如：国际部"></div></div>
      <table class="inline-table" style="margin-top:10px;"><thead><tr><th>物料编码</th><th>物料名称</th><th>规格型号</th><th>单位</th><th>数量</th><th></th></tr></thead><tbody id="is-lines"></tbody></table>
      <div style="margin-top:10px;"><button class="add-line" data-hclick="170">+ 增加一行</button></div>
      <div class="form-row" style="margin-top:10px;"><div class="field"><label>用途说明</label><textarea id="is-reason" rows="2">${x.reason||''}</textarea></div></div>
      <div class="right" style="margin-top:14px;"><button class="btn ghost" data-hclick="171">取消</button><button class="btn" data-hclick="172" data-aclick="${encodeURIComponent(JSON.stringify(id))}">保存并重新提交</button></div></div>`);
  window.__issueMode=x.issueType||'normal';
  setTimeout(()=>{ document.getElementById('is-ap').value=x.applicant; document.getElementById('is-dept').value=x.dept; },0);
  x.items.forEach(i=>{ addIsLine(); const tr=document.querySelectorAll('#is-lines tr'); const last=tr[tr.length-1]; const m=DB.materials.find(x=>x.id===i.p); if(m){ last.querySelector('.is-code').value=m.code; last.querySelector('.is-name').value=m.name; last.querySelector('.is-spec').value=m.spec; last.querySelector('.is-unit').value=m.unit; } last.querySelector('.is-q').value=i.q; });
}
function saveIssueEdit(id){
  const x=DB.issues.find(i=>i.id===id);
  // 若已出库，先恢复库存
  if(x.status==='done'){ x.items.forEach(l=>{ const m=mat(l.p); if(m) m.stock+=l.q; }); }
  const type=val('is-type')||'normal';
  const lines=[...document.querySelectorAll('#is-lines tr')].map(tr=>{ const code=tr.querySelector('.is-code').value.trim(); const m=DB.materials.find(x=>x.code===code); return {p:m?m.id:0, q:Number(tr.querySelector('.is-q').value)||0}; }).filter(l=>l.p);
  if(!lines.length){toast('请至少选择一行物料');return;}
  for(const l of lines){ const m=mat(l.p); if(m&&m.stock<l.q){ toast('「'+m.name+'」库存不足'); return; } }
  x.date=val('is-date'); x.applicant=type==='laobao'?(val('is-ext-ap').trim()||val('is-ap').trim()):val('is-ap'); x.dept=type==='laobao'?(val('is-ext-dept').trim()||val('is-dept').trim()||'国际部'):val('is-dept').trim()||x.dept; x.issueType=type; x.extApplicant=type==='laobao'?val('is-ext-ap').trim():''; x.extDept=type==='laobao'?val('is-ext-dept').trim():''; x.items=lines; x.reason=val('is-reason'); x.status='pending'; x.approver=''; x.hrApprover=''; x.materialApprover=''; x.finalApprover=''; x.cc=''; save(); buildSidebar(); showView('issue'); toast('领用申请已修改并重新提交审批');
}

/* ===================== 弹窗/Toast ===================== */
function openModal(html, wide){ document.getElementById('modal-box').className = wide? 'modal wide':'modal'; document.getElementById('modal-box').innerHTML=DOMPurify.sanitize(html); document.getElementById('modal').classList.add('show'); }
function closeModal(){ document.getElementById('modal').classList.remove('show'); }
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800); }

load().then(async()=>{ const raw=sessionStorage.getItem('pending-inventory-upload'); if(raw){const pending=JSON.parse(raw); if(!Array.isArray(pending) || !files?.uploadStatus) throw Error('待核对上传'); for(const item of pending){ if(!item.uploadId) throw Error('待核对上传'); let result=await files.uploadStatus(item.uploadId); if(!result.completed) result=await files.completeUpload(item.uploadId); if(!result.completed) throw Error('待核对上传'); recoveredAttachments.push(item); } alert('已恢复附件上传，请打开相应供应商编辑页面并保存附件。'); } status.style.display='none'; }).catch(()=>{ failed=true; status.textContent='无法读取数据库或确认先前附件上传，请检查登录、网络及上传记录后重新加载。'; });

Object.assign(window, {load,save,doLogin,doLogout,enter,buildSidebar,countPending,showView,toggleSidebar,closeSidebar,catDonut,renderDashboard,renderMaterials,showImport,addMaterial,saveMaterial,renderSuppliers,showSuppliersExpiring,clearSupplierFilter,openSupplierDetail,editSupplier,attachSupplierFiles,saveSupplier,buildSearch,filterSearch,pickSearch,renderDemand,addDmLine,getDemandStatusByApplicant,submitDemand,renderDemandList,demandRows,filterDemandList,openDemand,approveDemandAdminLead,approveDemandDept,approveDemandVp,rejectDemand,renderTask,taskRows,filterTask,goPurReq,goStockIn,renderPurReq,purReqRows,filterPurReq,newPurReq,setPrMode,onOrderWayChange,addPrLine,filterPrCode,fillPrLine,calcPrLine,updatePrTotal,savePurReq,openPurReq,buildFlow,buildDemandFlow,buildIssueFlow,approvePurLead,approvePurVp,rejectPurReq,renderStockIn,stockInRows,filterStockIn,newStockIn,addSiLine,filterSiCode,fillSiLine,calcSiLine,fillFromPurReq,saveStockIn,openStockIn,renderIssue,issueRows,filterIssue,newIssue,setIssueMode,parseCSV,mapIssueHeader,importIssueExcel,addIsLine,filterIsCode,fillIsLine,saveIssue,renderApprove,approveIssue,approveIssueHR,approveIssueMaterial,approveIssueFinal,rejectIssue,openIssue,renderInventory,inventoryRows,filterInventory,renderCount,countRows,filterCount,newCount,openCount,updCountLive,updCountNote,exportCount,finishCount,svgLineChart,renderCost,renderMyRec,permDefault,defaultPerm,renderSettings,savePerm,saveSettings,backupData,editDemand,saveDemandEdit,editPurReq,savePurReqEdit,editStockIn,saveStockInEdit,editIssue,saveIssueEdit,openModal,closeModal,toast});

window.resetDemo=()=>{if(confirm('重置原型演示数据？')){const user=DB.currentUser; DB=seed(); DB.currentUser=user; save(); enter(); toast('已重置');}};

const actionHandlers = [
function(event){doLogin()},
function(event){toggleSidebar()},
function(event){doLogout()},
function(event){toggleSidebar()},
function(event,v0){showView(v0)},
function(event,v0){showView(v0)},
function(event){showView('materials')},
function(event){showView('inventory')},
function(event){showView('inventory')},
function(event){showView('approve')},
function(event){showView('myrec')},
function(event){showSuppliersExpiring()},
function(event){showView('approve')},
function(event){showView('myrec')},
function(event){showImport()},
function(event){addMaterial()},
function(event){closeModal()},
function(event){closeModal()},
function(event){saveMaterial()},
function(event,v0){openSupplierDetail(v0)},
function(event){clearSupplierFilter()},
function(event){clearSupplierFilter()},
function(event){editSupplier()},
function(event){showView('suppliers')},
function(event){showView('suppliers')},
function(event,v0){editSupplier(v0)},
function(event){showView('suppliers')},
function(event){attachSupplierFiles(this)},
function(event){showView('suppliers')},
function(event,v0){saveSupplier(v0)},
function(event,v0,v1,v2){filterSearch(v0,v2,v1)},
function(event,v0,v1,v2){pickSearch(v0,v1,v2)},
function(event){addDmLine()},
function(event){submitDemand()},
function(event){this.parentNode.remove()},
function(event){filterDemandList(this.value)},
function(event,v0){openDemand(v0)},
function(event){showView('demandList')},
function(event,v0){approveDemandAdminLead(v0)},
function(event){showView('demandList')},
function(event,v0){approveDemandDept(v0)},
function(event){showView('demandList')},
function(event,v0){rejectDemand(v0)},
function(event,v0){approveDemandVp(v0)},
function(event){showView('demandList')},
function(event,v0){editDemand(v0)},
function(event){showView('demandList')},
function(event){filterTask(this.value)},
function(event,v0){goPurReq(v0)},
function(event){filterPurReq(this.value)},
function(event){newPurReq()},
function(event,v0){openPurReq(v0)},
function(event,v0){editPurReq(v0)},
function(event){showView('purReq')},
function(event){setPrMode('normal')},
function(event){setPrMode('new')},
function(event){onOrderWayChange(this.value)},
function(event){addPrLine()},
function(event){showView('purReq')},
function(event){savePurReq()},
function(event){filterPrCode(this)},
function(event){calcPrLine(this)},
function(event){calcPrLine(this)},
function(event){this.parentNode.remove()},
function(event){calcPrLine(this)},
function(event){calcPrLine(this)},
function(event){this.parentNode.remove()},
function(event,v0){fillPrLine(this.parentNode.previousElementSibling,v0)},
function(event){showView('purReq')},
function(event,v0){goStockIn(v0)},
function(event){showView('purReq')},
function(event,v0){rejectPurReq(v0)},
function(event,v0){approvePurLead(v0)},
function(event){showView('purReq')},
function(event,v0){rejectPurReq(v0)},
function(event,v0){approvePurVp(v0)},
function(event){showView('purReq')},
function(event,v0){editPurReq(v0)},
function(event){showView('purReq')},
function(event){filterStockIn(this.value)},
function(event){newStockIn()},
function(event,v0){openStockIn(v0)},
function(event,v0){editStockIn(v0)},
function(event){showView('stockIn')},
function(event){fillFromPurReq(this.value)},
function(event){addSiLine()},
function(event){showView('stockIn')},
function(event){saveStockIn()},
function(event){filterSiCode(this)},
function(event){calcSiLine(this)},
function(event){calcSiLine(this)},
function(event){this.closest('tr').remove()},
function(event,v0){fillSiLine(this.parentNode.previousElementSibling,v0)},
function(event){showView('stockIn')},
function(event){showView('stockIn')},
function(event,v0){editStockIn(v0)},
function(event){filterIssue(this.value)},
function(event){newIssue()},
function(event,v0){if(confirm('确认通过该领用申请并出库减库存？')){approveIssue(v0);}},
function(event,v0){if(confirm('确认驳回该领用申请？')){rejectIssue(v0);}},
function(event,v0){openIssue(v0)},
function(event){setIssueMode('normal')},
function(event){setIssueMode('laobao')},
function(event){document.getElementById('is-file').click()},
function(event){importIssueExcel(this)},
function(event){showView('issue')},
function(event){addIsLine()},
function(event){showView('issue')},
function(event){saveIssue()},
function(event){filterIsCode(this)},
function(event){this.closest('tr').remove()},
function(event,v0){fillIsLine(this.parentNode.previousElementSibling,v0)},
function(event,v0){openDemand(v0)},
function(event,v0){openDemand(v0)},
function(event,v0){openDemand(v0)},
function(event,v0){openPurReq(v0)},
function(event,v0){openPurReq(v0)},
function(event,v0){openIssue(v0)},
function(event,v0){openIssue(v0)},
function(event,v0){openIssue(v0)},
function(event,v0){openIssue(v0)},
function(event){showView('issue')},
function(event,v0){rejectIssue(v0)},
function(event,v0){approveIssueHR(v0)},
function(event){showView('issue')},
function(event,v0){rejectIssue(v0)},
function(event,v0){approveIssueMaterial(v0)},
function(event){showView('issue')},
function(event,v0){rejectIssue(v0)},
function(event,v0){approveIssueFinal(v0)},
function(event){showView('issue')},
function(event,v0){editIssue(v0)},
function(event){showView('issue')},
function(event,v0){rejectIssue(v0)},
function(event,v0){approveIssue(v0)},
function(event){showView('issue')},
function(event,v0){editIssue(v0)},
function(event){showView('issue')},
function(event){filterInventory(this.value)},
function(event){toast('此页面暂不支持导出 Excel')},
function(event){filterCount(this.value)},
function(event){newCount()},
function(event,v0){openCount(v0)},
function(event,v0){exportCount(v0)},
function(event,v0,v1){updCountLive(v0,v1,this.value)},
function(event,v0,v1){updCountNote(v0,v1,this.value)},
function(event){renderCount(document.getElementById('content'))},
function(event,v0){exportCount(v0)},
function(event,v0){finishCount(v0)},
function(event){saveSettings()},
function(event){savePerm()},
function(event){backupData()},
function(event){resetDemo()},
function(event){showView('demandList')},
function(event){addDmLine()},
function(event){showView('demandList')},
function(event,v0){saveDemandEdit(v0)},
function(event){showView('purReq')},
function(event){onOrderWayChange(this.value)},
function(event){addPrLine()},
function(event){showView('purReq')},
function(event,v0){savePurReqEdit(v0)},
function(event){showView('stockIn')},
function(event){fillFromPurReq(this.value)},
function(event){addSiLine()},
function(event){showView('stockIn')},
function(event,v0){saveStockInEdit(v0)},
function(event){setIssueMode('normal')},
function(event){setIssueMode('laobao')},
function(event){showView('issue')},
function(event){addIsLine()},
function(event){showView('issue')},
function(event,v0){saveIssueEdit(v0)}
];
const eventHandlers=[];
for (const kind of ['click','change','input']) { const handler=function(event) {
 const el=event.target.closest('[data-h'+kind+']'); if(!el) return;
 const raw=el.getAttribute('data-a'+kind); const args=raw ? raw.split(',').map(x=>JSON.parse(decodeURIComponent(x))) : [];
 actionHandlers[Number(el.getAttribute('data-h'+kind))].call(el,event,...args);
}; document.addEventListener(kind,handler); eventHandlers.push([kind,handler]); }
const downloadHandler=async event=>{ const el=event.target.closest('[data-file-path]'); if(!el)return; try { const response=await files.get(decodeURIComponent(el.dataset.filePath)); if(!response.ok) throw Error(); const url=URL.createObjectURL(await response.blob()); const a=document.createElement('a'); a.href=url; a.download=decodeURIComponent(el.dataset.fileName); a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); } catch { alert('附件读取失败，请检查连接后重试。'); } };
root.addEventListener('click',downloadHandler);
return ()=>{ for(const [kind,handler] of eventHandlers) document.removeEventListener(kind,handler); root.removeEventListener('click',downloadHandler); link.remove(); root.replaceChildren(); };
}
