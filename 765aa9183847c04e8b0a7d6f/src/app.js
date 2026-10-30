import { readState, writeState } from "./db.js";

/* ---------------- 基础食物库（每 100g 近似营养值） ---------------- */
const DEFAULT_FOODS = [
  {n:"米饭(熟)",c:25.9,p:2.6,f:0.3,k:116}, {n:"馒头",c:47,p:7,f:1.1,k:221},
  {n:"全麦面包",c:48,p:9,f:3.5,k:246}, {n:"面条(煮)",c:24.3,p:2.7,f:0.4,k:110},
  {n:"燕麦片(干)",c:61,p:13.2,f:6.7,k:367}, {n:"红薯",c:20.1,p:1.1,f:0.2,k:86},
  {n:"玉米",c:22.8,p:4,p:1.2,k:112}, {n:"土豆",c:17.2,p:2,f:0.1,k:77},
  {n:"糙米(熟)",c:23,p:2.7,f:0.9,k:111}, {n:"小米粥",c:8.4,p:1.4,f:0.7,k:46},
  {n:"鸡蛋",c:1.1,p:13.3,f:8.8,k:144}, {n:"鸡胸肉",c:2.5,p:19.4,f:5,k:133},
  {n:"鸡腿肉",c:0,p:16,f:13,k:181}, {n:"牛肉(瘦)",c:1.2,p:20.2,f:4.2,k:106},
  {n:"猪里脊",c:0.7,p:20.3,f:6.2,k:155}, {n:"三文鱼",c:0,p:20.4,f:13.4,k:208},
  {n:"鲈鱼",c:0,p:18.6,f:3.4,k:105}, {n:"虾仁",c:1.5,p:18.6,f:0.8,k:93},
  {n:"巴沙鱼",c:0,p:17,f:3,k:89}, {n:"牛奶",c:4.8,p:3.2,f:3.6,k:54},
  {n:"无糖酸奶",c:3.2,p:10,f:0.4,k:60}, {n:"豆浆(无糖)",c:1.8,p:6,f:1.6,k:31},
  {n:"奶酪",c:1.3,p:25,f:23,k:350}, {n:"豆腐",c:3.4,p:8.1,f:3.7,k:81},
  {n:"鸡蛋白粉",c:0,p:50,f:2,k:400}, {n:"蛋白粉",c:5,p:80,f:6,k:400},
  {n:"西兰花",c:6.6,p:4.1,f:0.6,k:36}, {n:"菠菜",c:2.8,p:2.6,f:0.3,k:28},
  {n:"生菜",c:2,p:1.3,f:0.3,k:16}, {n:"黄瓜",c:2.9,p:0.8,f:0.2,k:16},
  {n:"番茄",c:4,p:0.9,f:0.2,k:20}, {n:"胡萝卜",c:8.8,p:1,f:0.2,k:39},
  {n:"茄子",c:4.9,p:1.1,f:0.2,k:23}, {n:"青椒",c:5.4,p:1,f:0.2,k:22},
  {n:"香菇",c:5.2,p:2.2,f:0.3,k:26}, {n:"苹果",c:13.5,p:0.2,f:0.2,k:53},
  {n:"香蕉",c:22,p:1.4,f:0.2,k:93}, {n:"橙子",c:11.1,p:0.8,f:0.2,k:48},
  {n:"葡萄",c:10.3,p:0.5,f:0.2,k:45}, {n:"蓝莓",c:14.5,p:0.7,f:0.3,k:57},
  {n:"西瓜",c:6.8,p:0.6,f:0.1,k:25}, {n:"牛油果",c:8.5,p:2,f:15.3,k:171},
  {n:"花生",c:21.7,p:24.8,f:44.3,k:574}, {n:"杏仁",c:21.6,p:21.2,f:50.6,k:578},
  {n:"核桃",c:13.7,p:15.2,f:65.2,k:646}, {n:"花生酱",c:20,p:25,f:50,k:600},
  {n:"橄榄油",c:0,p:0,f:100,k:899}, {n:"食用油",c:0,p:0,f:100,k:899},
  {n:"黄油",c:0.9,p:0.9,f:82,k:717}, {n:"白砂糖",c:100,p:0,f:0,k:400},
  {n:"蜂蜜",c:82,p:0.4,f:0,k:321}, {n:"可乐",c:10.6,p:0,f:0,k:43},
  {n:"黑咖啡",c:0,p:0.2,f:0,k:1}, {n:"拿铁(中杯)",c:5.4,p:3,f:6.2,k:68},
  {n:"薯片",c:49.7,p:6.6,f:34.6,k:548}, {n:"巧克力",c:59.4,p:6.2,f:35.7,k:546},
  {n:"蛋糕",c:55,p:5,f:20,k:350}, {n:"冰淇淋",c:24,p:3.5,f:11,k:207},
  {n:"啤酒",c:3.6,p:0.5,f:0,k:43}, {n:"蛋白粉(乳清)",c:4,p:78,f:5,k:400},
  {n:"紫薯",c:20,p:1.3,f:0.2,k:82}, {n:"藜麦(熟)",c:21.3,p:4.4,f:1.9,k:120},
  {n:"意面(煮)",c:25,p:5,f:1.1,k:131}, {n:"包子(肉)",c:30,p:8,f:8,k:227}
];

const MEALS=["早餐","午餐","晚餐","加餐"];
const MEAL_CLS={"早餐":"m1","午餐":"m2","晚餐":"m3","加餐":"m4"};
let lib=DEFAULT_FOODS.map(f=>({...f})), logs={}, goal={cal:2000,carb:250,prot:130,fat:65};
let cur=today(), version=null, queue=Promise.resolve(), failed=false;
function validData(d){
  const num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
  const food=x=>x&&typeof x.n==='string'&&x.n.length<=200&&['k','c','p','f'].every(k=>num(x[k]));
  const record=x=>x&&typeof x.name==='string'&&x.name.length<=200&&MEALS.includes(x.meal)&&['amt','k','c','p','f'].every(k=>num(x[k]));
  return d&&Array.isArray(d.lib)&&d.lib.every(food)&&d.logs&&typeof d.logs==='object'&&!Array.isArray(d.logs)&&Object.entries(d.logs).every(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(v)&&v.every(record))&&d.goal&&['cal','carb','prot','fat'].every(k=>num(d.goal[k]));
}
function today(){const d=new Date();return fmt(d);}
function fmt(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function status(text){document.getElementById('storageStatus').textContent=text;}
function save(){
  const value=JSON.stringify({lib,logs,goal});
  status('正在保存…');
  queue=queue.then(async()=>{
    if(failed)return;
    try { version=await writeState(value,version); status('已保存到云端数据库'); }
    catch(e) { failed=true; status('保存未确认或数据已在其他窗口更改。请导出备份，重新打开后核对。'); }
  });
}
try {
  const saved=await readState();
  if(saved){const data=JSON.parse(saved.value);if(!validData(data))throw Error('数据格式不正确');lib=data.lib;logs=data.logs;goal=data.goal;version=Number(saved.version);}
  status('已连接云端数据库');
} catch(e) {
  document.body.innerHTML='<p role="alert">无法读取云端数据，请检查登录与网络后重新打开。</p>';
  throw e;
}
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),1700);}
function findFood(name){const q=name.trim().toLowerCase();if(!q)return null;
  let hit=lib.find(f=>f.n.toLowerCase()===q);
  if(!hit)hit=lib.find(f=>f.n.toLowerCase().includes(q)||q.includes(f.n.toLowerCase()));
  return hit;}

/* ---------------- 渲染 ---------------- */
function totals(date){
  const arr=logs[date]||[];const t={c:0,p:0,f:0,k:0};
  arr.forEach(i=>{t.c+=i.c;t.p+=i.p;t.f+=i.f;t.k+=i.k});
  return t;
}

function renderSummary(){
  const t=totals(cur);
  document.getElementById("rCal").textContent=Math.round(t.k);
  document.getElementById("rGoal").textContent=goal.cal;
  const pct=goal.cal>0?t.k/goal.cal:0;
  const arc=document.getElementById("ringArc");
  arc.setAttribute("stroke-dashoffset",515.2*(1-Math.min(pct,1)));
  arc.style.stroke=pct>1.1?"var(--danger)":(pct>1?"var(--fat)":"var(--cal)");
  const map=[["Carb","carb",t.c],["Prot","prot",t.p],["Fat","fat",t.f],["Cal",null,t.k]];
  map.forEach(([K,key,val])=>{
    document.getElementById("s"+K).innerHTML=(Math.round(val*10)/10)+(key?"<span>g</span>":"<span>kcal</span>");
    const g=key?goal[key]:goal.cal;
    const p=g>0?val/g:0;
    document.getElementById("b"+K).style.width=Math.min(p*100,100)+"%";
    const hint=document.getElementById("g"+K);
    if(key){hint.textContent="目标 "+Math.round(g)+"g"+(p>1.05?" · 已超出":" · 还可 "+Math.max(0,Math.round(g-val))+"g");
      hint.className="hint"+(p>1.05?" over":"");}
    else{hint.textContent=p>1.05?"超出 "+Math.round(val-goal.cal)+" kcal":"剩余 "+Math.max(0,Math.round(goal.cal-val))+" kcal";
      hint.className="hint"+(p>1.05?" over":"");}
  });
  // 宏量供能占比
  const kc=t.c*4, kp=t.p*4, kf=t.f*9, tot=kc+kp+kf;
  const tip=document.getElementById("macroTip");
  if(tot<=0){tip.textContent="还没有记录，先添加一项食物吧。";return;}
  const pc=n=>Math.round(n/tot*100);
  tip.innerHTML=`供能占比：碳水 <b>${pc(kc)}%</b> · 蛋白质 <b>${pc(kp)}%</b> · 脂肪 <b>${pc(kf)}%</b>　|　`+
    (kc/tot>=.5?"当前碳水占比较高，注意耐受与训练表现。":kf/tot>=.4?"脂肪占比偏高，建议下调烹调油。":kp/tot>=.4?"蛋白质偏高，均衡一点更利于长期坚持。":"结构均衡，保持这个节奏。");
}

function renderLog(){
  const arr=logs[cur]||[];const box=document.getElementById("logBox");
  if(!arr.length){box.innerHTML='<div class="empty">这一天还没有任何饮食记录</div>';return;}
  let h='<table><thead><tr><th>食物</th><th>餐次</th><th>重量</th><th>热量</th><th>碳水</th><th>蛋白质</th><th>脂肪</th><th></th></tr></thead><tbody>';
  MEALS.forEach(m=>{
    const items=arr.map((x,i)=>[x,i]).filter(([x])=>x.meal===m);
    if(!items.length)return;
    const s=items.reduce((a,[x])=>({k:a.k+x.k,c:a.c+x.c,p:a.p+x.p,f:a.f+x.f}),{k:0,c:0,p:0,f:0});
    h+=`<tr style="background:#fbfcfe"><td colspan="2" style="padding:6px 8px"><span class="meal-tag ${MEAL_CLS[m]}">${m}</span></td>
      <td class="num" style="padding:6px 8px;color:var(--muted)"></td>
      <td class="num" style="padding:6px 8px;font-weight:700">${Math.round(s.k)}</td>
      <td class="num" style="padding:6px 8px">${r1(s.c)}</td>
      <td class="num" style="padding:6px 8px">${r1(s.p)}</td>
      <td class="num" style="padding:6px 8px">${r1(s.f)}</td><td></td></tr>`;
    items.forEach(([x,i])=>{
      h+=`<tr><td>${esc(x.name)}</td><td style="text-align:center;color:var(--muted);font-size:12px">${x.meal}</td>
      <td class="num" style="color:var(--muted)">${x.amt}g</td><td class="num">${Math.round(x.k)}</td>
      <td class="num">${r1(x.c)}</td><td class="num">${r1(x.p)}</td><td class="num">${r1(x.f)}</td>
      <td style="width:34px"><button class="mini" data-del="${i}">删</button></td></tr>`;
    });
  });
  h+='</tbody></table>';
  box.innerHTML=h;
  box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
    logs[cur].splice(+b.dataset.del,1); if(!logs[cur].length) delete logs[cur];
    save();renderLog();renderSummary();renderHist();toast("正在保存删除");
  });
}
const r1=n=>Math.round(n*10)/10;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]))}

function renderLib(){
  document.getElementById("foodList").innerHTML=lib.map(f=>`<option value="${esc(f.n)}">`).join("");
  document.getElementById("libList").innerHTML=lib.map((f,i)=>`
    <div class="frow"><div class="nm">${esc(f.n)} <small>/100g</small></div>
    <div style="width:56px;text-align:right" class="num">${Math.round(f.k)}k</div>
    <div style="width:52px;text-align:right;color:var(--carb)" class="num">${f.c}g</div>
    <div style="width:52px;text-align:right;color:var(--prot)" class="num">${f.p}g</div>
    <div style="width:52px;text-align:right;color:var(--fat)" class="num">${f.f}g</div>
    <button class="mini" data-libdel="${i}">删</button></div>`).join("");
  document.querySelectorAll("[data-libdel]").forEach(b=>b.onclick=()=>{lib.splice(+b.dataset.libdel,1);save();renderLib();toast("正在保存食物库");});
}

function renderHist(){
  const keys=Object.keys(logs).filter(k=>logs[k]&&logs[k].length).sort().reverse().slice(0,42);
  const box=document.getElementById("histBox");
  if(!keys.length){box.innerHTML='<div class="empty">暂无历史数据</div>';return;}
  box.innerHTML=keys.map(k=>{const t=totals(k);const p=goal.cal>0?t.k/goal.cal:0;
    return `<div class="hitem ${k===cur?'on':''}" data-date="${k}">
      <b style="color:${p>1.05?'var(--danger)':(p>.85?'var(--fat)':'var(--text)')}">${Math.round(t.k)}</b>
      <small>${k.slice(5)} · ${Math.round(t.c)}/${Math.round(t.p)}/${Math.round(t.f)}g</small></div>`;}).join("");
  box.querySelectorAll("[data-date]").forEach(e=>e.onclick=()=>{cur=e.dataset.date;document.getElementById("datePick").value=cur;renderAll();});
}

function renderPreview(){
  const hit=findFood(document.getElementById("fName").value);
  const amt=parseFloat(document.getElementById("fAmt").value)||0;
  const f=hit||{k:0,c:0,p:0,f:0};
  const r=amt/100;
  document.getElementById("pCal").innerHTML=Math.round(f.k*r)+"<span>kcal</span>";
  document.getElementById("pCarb").innerHTML=r1(f.c*r)+"<span>g</span>";
  document.getElementById("pProt").innerHTML=r1(f.p*r)+"<span>g</span>";
  document.getElementById("pFat").innerHTML=r1(f.f*r)+"<span>g</span>";
}
function renderAll(){renderSummary();renderLog();renderHist();}

/* ---------------- 交互 ---------------- */
function addRecord(){
  const nameEl=document.getElementById("fName");
  const name=nameEl.value.trim();
  if(!name){toast("请输入食物名称");return;}
  const amt=parseFloat(document.getElementById("fAmt").value);
  if(!Number.isFinite(amt)||!(amt>0)){toast("请输入有效重量");return;}
  const meal=document.getElementById("fMeal").value;
  const hit=findFood(name);
  let f;
  if(hit)f={k:hit.k*amt/100,c:hit.c*amt/100,p:hit.p*amt/100,f:hit.f*amt/100};
  else{
    const raw=prompt(`食物库中没有「${name}」。\n请输入每 100g 的营养成分，用逗号分隔：热量kcal,碳水g,蛋白g,脂肪g`,
      [hit?hit.k:200,hit?hit.c:30,hit?hit.p:10,hit?hit.f:7].join(","));
    if(raw===null)return;
    const v=raw.split(/[,，\s]+/).map(Number);
    if(v.length<4||v.some(x=>!Number.isFinite(x)||x<0)){toast("格式不正确，已取消");return;}
    const per={n:name,k:v[0],c:v[1],p:v[2],f:v[3]};
    lib.push(per);save();renderLib();
    f={k:per.k*amt/100,c:per.c*amt/100,p:per.p*amt/100,f:per.f*amt/100};
  }
  (logs[cur]=logs[cur]||[]).push({name,amt,meal,k:f.k,c:f.c,p:f.p,f:f.f,t:Date.now()});
  save();renderAll();nameEl.value="";renderPreview();toast(`正在保存 ${name} ${amt}g（${Math.round(f.k)} kcal）`);
}

document.getElementById("addBtn").onclick=addRecord;
document.getElementById("fName").addEventListener("keydown",e=>{if(e.key==="Enter")addRecord();});
document.getElementById("fAmt").addEventListener("input",renderPreview);
document.getElementById("fName").addEventListener("input",renderPreview);

document.getElementById("datePick").value=cur;
document.getElementById("datePick").onchange=e=>{cur=e.target.value||cur;renderAll();};
function shift(d){const p=cur.split("-").map(Number);const dt=new Date(p[0],p[1]-1,p[2]+d);
  const s=fmt(dt);cur=s>today()?today():s;document.getElementById("datePick").value=cur;renderAll();}
document.getElementById("prevDay").onclick=()=>shift(-1);
document.getElementById("nextDay").onclick=()=>shift(1);
document.getElementById("todayBtn").onclick=()=>{cur=today();document.getElementById("datePick").value=cur;renderAll();};

// tabs
document.querySelectorAll(".sec-tabs button").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".sec-tabs button").forEach(x=>x.classList.remove("on"));
  b.classList.add("on");
  ["today","lib","hist"].forEach(t=>document.getElementById("tab-"+t).classList.toggle("hidden",t!==b.dataset.tab));
});

// 目标
document.getElementById("setBtn").onclick=()=>{
  const c=prompt("每日目标热量 (kcal)", goal.cal); if(c===null)return;
  const a=prompt("碳水目标 (g)", Math.round(goal.carb/goal.cal*parseFloat(c))); if(a===null)return;
  const p=prompt("蛋白质目标 (g)", Math.round(goal.prot/goal.cal*parseFloat(c))); if(p===null)return;
  const f=prompt("脂肪目标 (g)", Math.round(goal.fat/goal.cal*parseFloat(c))); if(f===null)return;
  if([c,a,p,f].some(x=>!Number.isFinite(+x)||+x<0)){toast("请输入有效目标");return;}
  goal={cal:+c||2000,carb:+a||0,prot:+p||0,fat:+f||0};
  save();renderAll();toast("正在保存目标");
};

// 食物库
document.getElementById("libAdd").onclick=()=>{
  const n=document.getElementById("lName").value.trim();
  if(!n){toast("请输入名称");return;}
  const base=parseFloat(document.getElementById("lAmt").value)||100;
  const f={n,k:+(+document.getElementById("lCal").value||0),c:+(+document.getElementById("lCarb").value||0),
    p:+(+document.getElementById("lProt").value||0),f:+(+document.getElementById("lFat").value||0)};
  if(!Number.isFinite(base)||base<=0||[f.k,f.c,f.p,f.f].some(x=>!Number.isFinite(x)||x<0)){toast("请输入有效营养数值");return;}
  // 按用户输入的基准量换算成 /100g
  const s=100/base;
  const per={n,k:f.k*s,c:f.c*s,p:f.p*s,f:f.f*s};
  lib.push(per);save();renderLib();
  ["lName","lCal","lCarb","lProt","lFat"].forEach(id=>document.getElementById(id).value="");
  toast("正在保存食物库");
};
document.getElementById("libReset").onclick=()=>{
  if(confirm("确定恢复默认食物库？自定义条目将丢失。")){
    lib=DEFAULT_FOODS.map(f=>({...f}));save();renderLib();toast("正在保存食物库");}
};

// 导入导出
document.getElementById("expBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify({lib,logs,goal},null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="nutrition-"+today()+".json";a.click();
  toast("已导出备份文件");
};
document.getElementById("impBtn").onclick=()=>document.getElementById("impFile").click();
document.getElementById("impFile").onchange=e=>{
  const f=e.target.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const d=JSON.parse(r.result);
    if(!validData(d))throw Error("文件格式不正确");
    lib=d.lib;logs=d.logs;goal=d.goal;
    save();renderLib();renderAll();toast("正在保存导入数据");
  }catch(err){toast("文件格式不正确");}};
  r.readAsText(f); e.target.value="";
};

renderLib();renderAll();renderPreview();
