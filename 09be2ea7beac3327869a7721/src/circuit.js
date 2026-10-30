
/* =====================================================================
   1. 元件几何 / 参数定义
   ===================================================================== */
const PAD = 0;

const GEO = {
  battery: {
    label:'直流电源', w:100, h:60, prefix:'E',
    terms:[{x:10,y:30,side:'l'},{x:90,y:30,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="30" x2="40" y2="30"/>
      <line x1="60" y1="30" x2="90" y2="30"/>
      <line x1="45" y1="11" x2="45" y2="49" stroke-width="2.6"/>
      <line x1="56" y1="19" x2="56" y2="41" stroke-width="2.6"/>
      <text x="48" y="52" text-anchor="middle">−</text>
      <text x="48" y="10" text-anchor="middle">+</text>`
  },
  resistor: {
    label:'定值电阻', w:100, h:52, prefix:'R',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="32" y2="26"/>
      <line x1="68" y1="26" x2="90" y2="26"/>
      <rect x="32" y="11" width="36" height="30" rx="3"/>`
  },
  lamp: {
    label:'小灯泡', w:100, h:56, prefix:'HL',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="35" y2="26"/>
      <line x1="65" y1="26" x2="90" y2="26"/>
      <circle class="glass" cx="50" cy="26" r="15"/>
      <line x1="40" y1="16" x2="60" y2="36"/>
      <line x1="60" y1="16" x2="40" y2="36"/>`
  },
  capacitor: {
    label:'电容', w:100, h:56, prefix:'C',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="43" y2="26"/>
      <line x1="57" y1="26" x2="90" y2="26"/>
      <line x1="43" y1="8" x2="43" y2="44" stroke-width="2.6"/>
      <line x1="57" y1="8" x2="57" y2="44" stroke-width="2.6"/>`
  },
  inductor: {
    label:'电感线圈', w:100, h:52, prefix:'L',
    terms:[{x:10,y:30,side:'l'},{x:90,y:30,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="30" x2="28" y2="30"/>
      <path d="M28,30 a6.5,6.5 0 0 1 13,0 a6.5,6.5 0 0 1 13,0 a6.5,6.5 0 0 1 13,0"/>
      <line x1="67" y1="30" x2="90" y2="30"/>`
  },
  motor: {
    label:'电动机', w:100, h:56, prefix:'M',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="35" y2="26"/>
      <line x1="65" y1="26" x2="90" y2="26"/>
      <circle cx="50" cy="26" r="15"/>
      <g class="rotor"><text x="50" y="31" text-anchor="middle" class="sym">M</text></g>`
  },
  rheostat: {
    label:'滑动变阻器', w:124, h:64, prefix:'RP',
    terms:[{x:10,y:40,side:'l'},{x:62,y:12,side:'t'},{x:114,y:40,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="40" x2="38" y2="40"/>
      <line x1="86" y1="40" x2="114" y2="40"/>
      <rect x="38" y="28" width="48" height="24" rx="2"/>
      <line x1="62" y1="12" x2="62" y2="27"/>
      <path class="fill" d="M57.5,25 L62,31 L66.5,25 Z"/>
      <text x="62" y="11" text-anchor="middle">P</text>`
  },
  voltmeter: {
    label:'电压表', w:100, h:56, prefix:'V',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="35" y2="26"/>
      <line x1="65" y1="26" x2="90" y2="26"/>
      <circle cx="50" cy="26" r="15"/>
      <text x="50" y="31" text-anchor="middle" class="sym">V</text>`
  },
  ammeter: {
    label:'电流表', w:100, h:56, prefix:'A',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="35" y2="26"/>
      <line x1="65" y1="26" x2="90" y2="26"/>
      <circle cx="50" cy="26" r="15"/>
      <text x="50" y="31" text-anchor="middle" class="sym">A</text>`
  },
  switch: {
    label:'开关', w:100, h:52, prefix:'S',
    terms:[{x:10,y:26,side:'l'},{x:90,y:26,side:'r'}],
    glyph:()=>`
      <line x1="10" y1="26" x2="30" y2="26"/>
      <line x1="70" y1="26" x2="90" y2="26"/>
      <circle class="fill" cx="30" cy="26" r="3.2"/>
      <circle class="fill" cx="70" cy="26" r="3.2"/>
      <line class="blade" x1="30" y1="26" x2="70" y2="10"/>`
  }
};

const PARAMS = {
  battery:  [{key:'E', label:'电动势 E', unit:'V', min:0, max:100, step:0.5, def:6},
             {key:'r', label:'内阻 r（0=理想）', unit:'Ω', min:0, max:50, step:0.1, def:0}],
  resistor: [{key:'R', label:'阻值 R', unit:'Ω', min:0.1, max:10000, step:1, def:10}],
  lamp:     [{key:'Un', label:'额定电压', unit:'V', min:0.1, max:60, step:0.1, def:3.8},
             {key:'Pn', label:'额定功率', unit:'W', min:0.01, max:200, step:0.05, def:0.3}],
  capacitor:[{key:'C', label:'电容 C', unit:'μF', min:1, max:100000, step:100, def:1000},
             {key:'Vmax', label:'耐压', unit:'V', min:1, max:500, step:1, def:25}],
  inductor: [{key:'L', label:'电感 L', unit:'mH', min:1, max:10000, step:10, def:100}],
  motor:    [{key:'R', label:'线圈电阻', unit:'Ω', min:0.1, max:1000, step:0.5, def:5},
             {key:'Ue', label:'额定电压', unit:'V', min:0.5, max:60, step:0.5, def:3}],
  rheostat: [{key:'R', label:'最大阻值', unit:'Ω', min:1, max:500, step:1, def:20},
             {key:'f', label:'滑片位置', unit:'', min:0, max:1, step:0.01, def:0.5, range:true}],
  voltmeter:[{key:'Rv', label:'内阻 R_V', unit:'MΩ', min:1, max:1000000, step:100, def:1000}],
  ammeter:  [{key:'Ra', label:'内阻 R_A', unit:'Ω', min:0.0001, max:5, step:0.001, def:0.001}],
  switch:   [{key:'closed', label:'开关闭合', bool:true, def:true}]
};

/* =====================================================================
   2. 基础工具
   ===================================================================== */
const $ = s => document.querySelector(s);
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v));
const R2 = n => Math.round(n*100)/100;

function fmt(v){
  if(v===undefined||v===null||!isFinite(v)) return '—';
  const a = Math.abs(v);
  if(a < 1e-6) return '0';       // 1 μA / 1 μV 以下按 0 显示
  if(a >= 1e4) return v.toExponential(2);
  if(a >= 1000) return v.toFixed(0);
  if(a >= 100) return v.toFixed(1);
  if(a >= 1) return v.toFixed(2);
  if(a >= 0.01) return v.toFixed(3);
  if(a >= 1e-4) return v.toFixed(4);
  return v.toExponential(1);
}

/* =====================================================================
   3. 电路求解器（改进节点电压法 MNA）
   ---- SOLVER START ----
   ===================================================================== */
const R_INDUCTOR = 0.01;   // 直流稳态下电感的等效电阻（近似短路）
const R_SWITCH_CLOSED = 0.01;
const R_MIN = 0.01;

function lampResistance(c){
  const Un = Math.max(c.params.Un, 0.05), Pn = Math.max(c.params.Pn, 1e-4);
  return Math.max(Un*Un/Pn, R_MIN);
}

function compConductance(c){
  switch(c.type){
    case 'resistor':  return 1/Math.max(c.params.R, R_MIN);
    case 'lamp':      return 1/lampResistance(c);
    case 'motor':     return 1/Math.max(c.params.R, R_MIN);
    case 'inductor':  return 1/R_INDUCTOR;
    case 'ammeter':   return 1/Math.max(c.params.Ra, 1e-6);
    case 'voltmeter': return 1/Math.max(c.params.Rv*1e6, 1);
    case 'switch':    return c.params.closed ? 1/R_SWITCH_CLOSED : 0;
    case 'capacitor': return 0;         // 直流稳态：断路
    default:          return 0;
  }
}

function solveLinear(A, z, m){
  for(let col=0; col<m; col++){
    let piv = col;
    for(let r=col+1; r<m; r++) if(Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    if(Math.abs(A[piv][col]) < 1e-15) return null;
    if(piv !== col){
      const t = A[piv]; A[piv] = A[col]; A[col] = t;
      const s = z[piv]; z[piv] = z[col]; z[col] = s;
    }
    const pv = A[col][col];
    for(let r=col+1; r<m; r++){
      const f = A[r][col]/pv;
      if(!f) continue;
      for(let c=col; c<m; c++) A[r][c] -= f*A[col][c];
      z[r] -= f*z[col];
    }
  }
  const x = new Float64Array(m);
  for(let r=m-1; r>=0; r--){
    let s = z[r];
    for(let c=r+1; c<m; c++) s -= A[r][c]*x[c];
    x[r] = s/A[r][r];
  }
  return x;
}

function solveCircuit(comps, wires){
  const res = {ok:false, hasSource:false, readings:{}, warnings:[], batI:0, totalP:0, nodeCount:0};

  /* --- 3.1 并查集：导线把端口连成节点 --- */
  const parent = new Map();
  const find = k => {
    if(!parent.has(k)) parent.set(k,k);
    let p = parent.get(k);
    if(p !== k){ p = find(p); parent.set(k,p); }
    return p;
  };
  const union = (a,b)=>{ const ra=find(a), rb=find(b); if(ra!==rb) parent.set(ra,rb); };

  comps.forEach(c=>{
    const n = GEO[c.type].terms.length;
    for(let i=0;i<n;i++) find(c.id+':'+i);
  });
  wires.forEach(w=>{
    if(parent.has(w.a) && parent.has(w.b)) union(w.a, w.b);
  });

  const batteries = comps.filter(c=>c.type==='battery');
  res.hasSource = batteries.length > 0;
  if(batteries.length === 0){
    res.warnings.push({level:'warn', text:'还没有放置电源，电路无法工作。'});
    return res;
  }

  /* --- 3.2 节点编号 --- */
  const groundRoot = find(batteries[0].id+':1');
  let n = 0;
  const nodeIdx = new Map();
  const nodeId = root => {
    if(root === groundRoot) return -1;
    if(!nodeIdx.has(root)) nodeIdx.set(root, n++);
    return nodeIdx.get(root);
  };

  const termNode = new Map();
  comps.forEach(c=>{
    GEO[c.type].terms.forEach((t,i)=>{ termNode.set(c.id+':'+i, nodeId(find(c.id+':'+i))); });
  });
  const batMid = new Map();
  batteries.forEach((c,i)=>{ batMid.set(c.id, nodeId('@mid'+c.id)); });

  const M = n + batteries.length;
  const A = [];
  for(let i=0;i<M;i++) A.push(new Float64Array(M));
  const z = new Float64Array(M);

  function stampG(a,b,gv){
    if(!(gv > 0)) return;
    if(a >= 0) A[a][a] += gv;
    if(b >= 0) A[b][b] += gv;
    if(a >= 0 && b >= 0){ A[a][b] -= gv; A[b][a] -= gv; }
  }

  /* --- 3.3 元件填充 --- */
  comps.forEach(c=>{
    if(c.type === 'battery') return;
    const T = i => termNode.get(c.id+':'+i);
    if(c.type === 'rheostat'){
      const Rm = Math.max(c.params.R, 0.5);
      const f  = clamp(c.params.f, 0, 1);
      stampG(T(0), T(1), 1/Math.max(Rm*f, R_MIN));
      stampG(T(1), T(2), 1/Math.max(Rm*(1-f), R_MIN));
      return;
    }
    const gv = compConductance(c);
    if(gv > 0) stampG(T(0), T(1), gv);
  });

  /* --- 3.4 电源：理想电压源 + 内阻 --- */
  const batIndex = new Map();
  batteries.forEach((c,i)=>{
    batIndex.set(c.id, i);
    const p   = termNode.get(c.id+':0');
    const q   = termNode.get(c.id+':1');
    const mid = batMid.get(c.id);
    const k   = n + i;
    const E   = Math.max(c.params.E, 0);
    const r   = Math.max(c.params.r, 0.001);
    if(p >= 0){ A[k][p] += 1; A[p][k] += 1; }
    A[k][mid] -= 1; A[mid][k] -= 1;
    z[k] = E;
    stampG(mid, q, 1/r);
  });

  for(let i=0;i<n;i++) A[i][i] += 1e-12;   // 防止悬空节点导致矩阵奇异

  const x = solveLinear(A, z, M);
  if(!x){
    res.warnings.push({level:'bad', text:'电路方程组无解，请检查是否存在电源被导线直接短接。'});
    return res;
  }
  const V = nd => (nd < 0 ? 0 : x[nd]);

  /* --- 3.5 读取每个元件的电压 / 电流 / 功率 --- */
  comps.forEach(c=>{
    const T = i => termNode.get(c.id+':'+i);
    const Vt = i => V(T(i));
    const out = {type:c.type, U:0, I:0, P:0, note:''};

    if(c.type === 'battery'){
      // MNA 中电流变量定义为“由 + 端流入电源”，故取反才是电源输出的电流
      out.I = -x[n + batIndex.get(c.id)];
      out.U = Vt(0) - Vt(1);
      out.P = out.U * out.I;
      res.batI = out.I;
      res.readings[c.id] = out;
      return;
    }

    if(c.type === 'rheostat'){
      const Rm = Math.max(c.params.R, 0.5);
      const f  = clamp(c.params.f, 0, 1);
      const Rap = Math.max(Rm*f, R_MIN), Rpb = Math.max(Rm*(1-f), R_MIN);
      const Iap = (Vt(0) - Vt(1))/Rap;
      const Ipb = (Vt(1) - Vt(2))/Rpb;
      out.Rap = Rap; out.Rpb = Rpb; out.Iap = Iap; out.Ipb = Ipb;
      out.U = Vt(0) - Vt(2);
      out.I = Math.abs(Iap) >= Math.abs(Ipb) ? Iap : Ipb;
      out.P = Math.abs(Iap*Iap*Rap) + Math.abs(Ipb*Ipb*Rpb);
      out.note = `接入 A–P：${fmt(Rap)} Ω ｜ P–B：${fmt(Rpb)} Ω`;
      res.readings[c.id] = out;
      return;
    }

    const u  = Vt(0) - Vt(1);
    const gv = compConductance(c);
    const i  = u * gv;
    out.U = u;
    out.I = i;
    out.P = Math.abs(u*i);

    if(c.type === 'capacitor'){
      const C = Math.max(c.params.C, 1) * 1e-6;
      out.I = 0; out.P = 0;
      out.Q = C * Math.abs(u);
      out.note = `直流稳态断路，带电量 Q = ${fmt(out.Q*1e6)} μC`;
    }
    if(c.type === 'inductor'){
      out.note = '直流稳态视为短路（等效 0.01 Ω）';
    }
    if(c.type === 'voltmeter'){ out.U = Math.abs(u); }
    if(c.type === 'ammeter'){ out.I = i; }
    if(c.type === 'switch' && !c.params.closed){ out.I = 0; out.P = 0; }

    res.readings[c.id] = out;
  });

  /* --- 3.6 状态判断 --- */
  const batRead = res.readings[batteries[0].id];
  const mainI = Math.abs(res.batI || 0);
  let totalP = 0;
  comps.forEach(c=>{
    if(c.type === 'battery') return;
    totalP += res.readings[c.id].P;
  });
  res.totalP = totalP;

  if(mainI > 8){
    res.warnings.push({level:'bad', text:`干路电流高达 ${fmt(mainI)} A，已属短路，请检查是否有元件被导线短接。`});
  }else if(mainI < 1e-7 && batteries.length){
    res.warnings.push({level:'warn', text:'电路中没有电流：可能开关断开、或存在断路（电容在直流稳态下就是断路）。'});
  }
  if(batRead && Math.abs(batRead.U) > 1e-9 && Math.abs(batRead.U - Math.max(batteries[0].params.E,0)) > 1e-9 && mainI > 1e-7){
    // 端电压小于电动势属正常，仅提示
  }

  res.ok = true;
  res.nodeCount = n;
  return res;
}
/* ---- SOLVER END ---- */

/* =====================================================================
   4. 状态
   ===================================================================== */
const state = {
  mode:'sim',
  comps:[],
  wires:[],
  selected:null,          // {kind:'comp'|'wire', id}
  nextId:1,
  last:null,
  test:{answers:{}, submitted:false, result:null}
};

const stage = $('#stage');
const svg   = $('#wires');

function getComp(id){ return state.comps.find(c=>c.id === id); }
function getWire(id){ return state.wires.find(w=>w.id === id); }
function termPos(ref){
  const [cid, idx] = ref.split(':');
  const c = getComp(cid);
  if(!c) return null;
  const t = GEO[c.type].terms[+idx];
  return {x:c.x + t.x, y:c.y + t.y, side:t.side};
}
function isWired(c){
  const n = GEO[c.type].terms.length;
  for(let i=0;i<n;i++){
    if(!state.wires.some(w=>w.a === c.id+':'+i || w.b === c.id+':'+i)) return false;
  }
  return true;
}

/* =====================================================================
   5. 元件增删
   ===================================================================== */
function defaultParams(type){
  const p = {};
  PARAMS[type].forEach(d=>{ p[d.key] = d.def; });
  return p;
}
function nextName(type){
  const pre = GEO[type].prefix;
  let i = 1;
  while(state.comps.some(c=>c.name === pre+i)) i++;
  return pre + i;
}
function addComp(type, x, y, params){
  const g = GEO[type];
  const c = {
    id:'c'+(state.nextId++),
    type, x:Math.round(x), y:Math.round(y),
    name:nextName(type),
    params: Object.assign(defaultParams(type), params||{})
  };
  state.comps.push(c);
  buildCompEl(c);
  return c;
}
function removeComp(id){
  const c = getComp(id);
  if(!c) return;
  state.comps = state.comps.filter(x=>x.id !== id);
  state.wires = state.wires.filter(w=>!w.a.startsWith(id+':') && !w.b.startsWith(id+':'));
  const el = stage.querySelector('.comp[data-id="'+id+'"]');
  if(el) el.remove();
  if(state.selected && state.selected.kind === 'comp' && state.selected.id === id) state.selected = null;
  refresh(true);
}
function addWire(a, b){
  if(a === b) return;
  if(state.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a))) return;
  state.wires.push({id:'w'+(state.nextId++), a, b});
  refresh(true);
}

/* =====================================================================
   6. 渲染
   ===================================================================== */
function buildCompEl(c){
  const g = GEO[c.type];
  const el = document.createElement('div');
  el.className = 'comp';
  el.dataset.id = c.id;
  el.style.cssText = `left:${c.x}px;top:${c.y}px;width:${g.w}px;height:${g.h}px`;
  let terms = '';
  g.terms.forEach((t,i)=>{
    terms += `<div class="term" data-term="${i}" style="left:${t.x}px;top:${t.y}px"></div>`;
  });
  el.innerHTML = `
    <div class="frame"></div>
    <svg class="glyph" viewBox="0 0 ${g.w} ${g.h}">${g.glyph()}</svg>
    ${terms}
    <button class="del" title="删除元件">×</button>
    <div class="tname">${c.name}</div>`;
  stage.appendChild(el);
  return el;
}

function compEl(id){ return stage.querySelector('.comp[data-id="'+id+'"]'); }

function syncCompPos(c){
  const el = compEl(c.id);
  if(el) el.style.cssText = `left:${c.x}px;top:${c.y}px;width:${GEO[c.type].w}px;height:${GEO[c.type].h}px`;
}

/* --- 导线路径：短线头 + 直角折弯 --- */
function wirePath(a, b){
  const stub = 16;
  const dv = {l:[-1,0], r:[1,0], t:[0,-1], b:[0,1]};
  const d1 = dv[a.side] || [1,0], d2 = dv[b.side] || [-1,0];
  const p1 = {x:a.x + d1[0]*stub, y:a.y + d1[1]*stub};
  const p2 = {x:b.x + d2[0]*stub, y:b.y + d2[1]*stub};
  const bend = (b.side === 'l' || b.side === 'r')
      ? {x:p1.x, y:p2.y}
      : {x:p2.x, y:p1.y};
  const pts = [{x:a.x,y:a.y}, p1, bend, p2, {x:b.x,y:b.y}];
  let d = '';
  let prev = null;
  pts.forEach(p=>{
    if(prev && Math.hypot(p.x-prev.x, p.y-prev.y) < 0.6) return;
    d += (d ? ' L' : 'M') + R2(p.x) + ' ' + R2(p.y);
    prev = p;
  });
  return d;
}

const flowEls = new Map();   // wireId -> {el, dir, speed, off}

function drawWires(){
  svg.innerHTML = '';
  flowEls.clear();
  state.wires.forEach(w=>{
    const a = termPos(w.a), b = termPos(w.b);
    if(!a || !b) return;
    const d = wirePath(a, b);

    const p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d', d);
    p.setAttribute('class', 'w' + (state.selected && state.selected.kind==='wire' && state.selected.id===w.id ? ' sel' : ''));
    p.dataset.wire = w.id;
    svg.appendChild(p);

    const fl = document.createElementNS('http://www.w3.org/2000/svg','path');
    fl.setAttribute('d', d);
    fl.setAttribute('class', 'flow');
    fl.style.opacity = '0';
    svg.appendChild(fl);
    flowEls.set(w.id, {el:fl, dir:1, speed:0, off:0});

    const hit = document.createElementNS('http://www.w3.org/2000/svg','path');
    hit.setAttribute('d', d);
    hit.setAttribute('class', 'hit');
    hit.dataset.wire = w.id;
    svg.appendChild(hit);
  });
  if(wiring){
    const p = document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d', `M${wiring.p0.x} ${wiring.p0.y} L${wiring.x} ${wiring.y}`);
    p.setAttribute('class','ghost');
    svg.appendChild(p);
  }
}

/* --- 端子电流方向（用于流动虚线） --- */
function termFlow(c, idx){
  // 返回 +1 表示“正向电流”时电流由元件流入导线
  if(c.type === 'battery') return idx === 0 ? 1 : -1;
  return idx === 0 ? -1 : 1;
}

function updateVisuals(){
  const res = state.last;
  state.comps.forEach(c=>{
    const el = compEl(c.id);
    if(!el) return;
    const r = res && res.readings[c.id];

    // 选中态
    el.classList.toggle('sel', !!(state.selected && state.selected.kind==='comp' && state.selected.id===c.id));
    // 未接入
    const idle = !isWired(c) && !res?.hasSource;
    el.classList.toggle('idle', idle);

    // 灯泡亮度
    if(c.type === 'lamp'){
      const glass = el.querySelector('.glass');
      const b = r ? clamp(r.P / Math.max(c.params.Pn, 1e-4), 0, 1.6) : 0;
      const k = Math.min(1, b);
      glass.style.fill = `rgba(251,191,36,${0.06 + 0.94*k})`;
      glass.style.filter = k > 0.02 ? `drop-shadow(0 0 ${6+10*k}px rgba(251,191,36,${0.35+0.5*k}))` : 'none';
      el.querySelector('.glyph').style.filter = k > 0.5 ? `drop-shadow(0 0 6px rgba(251,191,36,.5))` : 'none';
    }
    // 电机转动
    if(c.type === 'motor'){
      const rotor = el.querySelector('.rotor');
      const spin = r && Math.abs(r.I) > 0.005;
      rotor.style.transformOrigin = '50px 26px';
      rotor.style.transformBox = 'view-box';
      rotor.style.animation = spin ? `spin ${clamp(1.6/Math.max(Math.abs(r.I),0.02),0.25,3)}s linear infinite` : 'none';
    }
    // 开关刀闸
    if(c.type === 'switch'){
      const blade = el.querySelector('.blade');
      blade.setAttribute('x2', 70);
      blade.setAttribute('y2', c.params.closed ? 26 : 10);
    }
    // 读数气泡
    let badge = el.querySelector('.badge');
    const showBadge = state.mode === 'sim' && state.selected && state.selected.kind==='comp' && state.selected.id===c.id && r;
    if(showBadge){
      if(!badge){
        badge = document.createElement('div');
        badge.className = 'badge';
        el.appendChild(badge);
      }
      badge.textContent = c.type==='voltmeter'
        ? `读数 ${fmt(r.U)} V`
        : c.type==='ammeter'
          ? `读数 ${fmt(r.I)} A`
          : `U ${fmt(r.U)} V ｜ I ${fmt(r.I)} A`;
    }else if(badge){
      badge.remove();
    }
  });

  // 导线电流动画参数
  state.wires.forEach(w=>{
    const info = flowEls.get(w.id);
    if(!info) return;
    const [cid, idxS] = w.a.split(':');
    const c = getComp(cid);
    const r = res && res.readings[cid];
    let I = 0;
    if(c && r && c.type !== 'rheostat'){
      I = r.I * termFlow(c, +idxS);
    }
    const mag = Math.abs(I);
    if(mag > 2e-3 && state.mode !== 'x'){
      info.speed = clamp(26 + 210*Math.log10(1 + mag*40), 0, 460);
      info.dir = Math.sign(I) || 1;
      info.el.style.opacity = '0.95';
    }else{
      info.speed = 0;
      info.el.style.opacity = '0';
    }
  });
}

let lastT = performance.now();
function tick(now){
  const dt = Math.min(0.06, (now - lastT)/1000);
  lastT = now;
  flowEls.forEach(info=>{
    if(!info.speed) return;
    info.off -= info.dir * info.speed * dt;
    info.el.style.strokeDashoffset = info.off + 'px';
  });
  requestAnimationFrame(tick);
}

/* =====================================================================
   7. 右侧面板
   ===================================================================== */
function paramField(c, d){
  const v = c.params[d.key];
  if(d.bool){
    return `<div class="field">
      <label>${d.label}</label>
      <button class="btn" data-toggle="closed" style="padding:4px 12px;${v?'background:#e8f7ee;border-color:#bbe8cc;color:#15803d':''}">${v?'已闭合':'已断开'}</button>
    </div>`;
  }
  if(d.range){
    return `<div class="range-row">
      <div class="field" style="margin-bottom:2px">
        <label>${d.label}</label>
        <span id="fVal" style="font-size:12px;font-weight:700">${(v*100).toFixed(0)}%</span>
      </div>
      <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-param="${d.key}">
    </div>`;
  }
  return `<div class="field">
    <label>${d.label}</label>
    <div class="inp">
      <input type="number" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-param="${d.key}">
      <span class="unit">${d.unit}</span>
    </div>
  </div>`;
}

function simPanelHTML(){
  const sel = state.selected;
  const res = state.last;
  let head = '';

  if(sel && sel.kind === 'comp'){
    const c = getComp(sel.id);
    if(c){
      const r = res && res.readings[c.id];
      const total = GEO[c.type].terms.length;
      const wiredN = GEO[c.type].terms.filter((t,i)=>
        state.wires.some(w=>w.a === c.id+':'+i || w.b === c.id+':'+i)).length;
      const sub = wiredN === 0 ? '尚未接入电路'
                : (wiredN < total && c.type !== 'rheostat') ? '有端口未接线'
                : '已接入电路';
      head += `<div class="card">
        <div class="card-title">元件参数 <span style="font-weight:500;color:#b6c0cf">${c.name}</span></div>
        <div class="cname"><span class="dot"></span>${GEO[c.type].label}</div>
        <div class="csub">${sub}</div>
        ${PARAMS[c.type].map(d=>paramField(c,d)).join('')}
      </div>
      <div class="card">
        <div class="card-title">测量数据</div>
        <div class="metrics">
          <div class="metric"><span>${c.type==='voltmeter'?'读数 U':'电压 U'}</span><b id="mU">—<i>V</i></b></div>
          <div class="metric"><span>${c.type==='ammeter'?'读数 I':'电流 I'}</span><b id="mI">—<i>A</i></b></div>
          <div class="metric wide"><span>功率 P</span><b id="mP">—<i>W</i></b></div>
          ${c.type==='capacitor'?'<div class="metric wide"><span>带电量 Q</span><b id="mQ">—<i>μC</i></b></div>':''}
        </div>
        <div style="margin-top:10px;font-size:12px;color:#94a3b8" id="mNote"></div>
      </div>`;
    }
  }else if(sel && sel.kind === 'wire'){
    head += `<div class="card">
      <div class="card-title">导线</div>
      <p class="hint">已选中一根导线，按 <code>Delete</code> 可删除。</p>
      <button class="btn" id="btnDelWire" style="width:100%">删除这根导线</button>
    </div>`;
  }else{
    head += `<div class="card">
      <div class="empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c3cddf" stroke-width="1.6">
          <path d="M4 12h4m8 0h4M8 8h8v8H8z"/>
        </svg>
        <div>点击画板上的任意元件<br>查看它的电压与电流</div>
      </div>
    </div>`;
  }

  const b = state.comps.find(c=>c.type === 'battery');
  const br = b && res && res.readings[b.id];
  let statePill = '<span class="pill warn">未接通</span>';
  if(res && res.ok){
    if(Math.abs(res.batI) > 8) statePill = '<span class="pill bad">短路</span>';
    else if(Math.abs(res.batI) > 1e-6) statePill = '<span class="pill ok">通路</span>';
    else statePill = '<span class="pill warn">断路</span>';
  }
  const warn = (res && res.warnings.length)
    ? res.warnings.map(w=>`<div style="margin-top:9px;font-size:12px;line-height:1.6;color:${w.level==='bad'?'#b91c1c':'#b45309'};background:${w.level==='bad'?'#fef2f2':'#fffbeb'};padding:7px 9px;border-radius:8px">${w.text}</div>`).join('')
    : '';

  const overview = `<div class="card">
    <div class="card-title">电路概览</div>
    <div class="overview">
      <div class="ovrow"><span>电路状态</span><span id="ovState">${statePill}</span></div>
      <div class="ovrow"><span>干路电流</span><b id="ovI">—</b></div>
      <div class="ovrow"><span>电源端电压</span><b id="ovU">—</b></div>
      <div class="ovrow"><span>总功率</span><b id="ovP">—</b></div>
      <div class="ovrow"><span>元件 / 导线</span><b>${state.comps.length} / ${state.wires.length}</b></div>
    </div>
    ${warn}
  </div>`;

  return head + overview;
}

function patchSim(){
  const sel = state.selected, res = state.last;
  const b = state.comps.find(c=>c.type === 'battery');
  const br = b && res && res.readings[b.id];
  const ovI = $('#ovI'), ovU = $('#ovU'), ovP = $('#ovP'), ovS = $('#ovState');
  if(ovI) ovI.textContent = br ? fmt(Math.abs(br.I)) + ' A' : '—';
  if(ovU) ovU.textContent = br ? fmt(Math.abs(br.U)) + ' V' : '—';
  if(ovP) ovP.textContent = res && res.ok ? fmt(res.totalP) + ' W' : '—';
  if(ovS){
    let html = '<span class="pill warn">未接通</span>';
    if(res && res.ok){
      if(Math.abs(res.batI) > 8) html = '<span class="pill bad">短路</span>';
      else if(Math.abs(res.batI) > 1e-6) html = '<span class="pill ok">通路</span>';
      else html = '<span class="pill warn">断路</span>';
    }
    ovS.innerHTML = html;
  }
  if(sel && sel.kind === 'comp'){
    const c = getComp(sel.id);
    const r = res && res.readings[c.id];
    const mU = $('#mU'), mI = $('#mI'), mP = $('#mP'), mQ = $('#mQ'), mN = $('#mNote');
    if(mU) mU.innerHTML = r ? `${fmt(r.U)}<i>V</i>` : '—';
    if(mI) mI.innerHTML = r ? `${fmt(r.I)}<i>A</i>` : '—';
    if(mP) mP.innerHTML = r ? `${fmt(r.P)}<i>W</i>` : '—';
    if(mQ) mQ.innerHTML = r && r.Q !== undefined ? `${fmt(r.Q*1e6)}<i>μC</i>` : '—';
    if(mN) mN.textContent = r ? (r.note || '') : '';
  }
}

/* ---------------- 测试面板 ---------------- */
function paramSummary(c){
  const p = c.params;
  switch(c.type){
    case 'battery':   return `E = ${fmt(p.E)} V，内阻 r = ${fmt(p.r)} Ω`;
    case 'resistor':  return `R = ${fmt(p.R)} Ω`;
    case 'lamp':      return `额定 ${fmt(p.Un)} V / ${fmt(p.Pn)} W，视为阻值不变的纯电阻（R = ${fmt(lampResistance(c))} Ω）`;
    case 'capacitor': return `C = ${fmt(p.C)} μF，直流稳态视为断路`;
    case 'inductor':  return `L = ${fmt(p.L)} mH，直流稳态视为短路`;
    case 'motor':     return `线圈电阻 R = ${fmt(p.R)} Ω，视为纯电阻`;
    case 'rheostat':  return `最大阻值 ${fmt(p.R)} Ω，滑片在 ${(clamp(p.f,0,1)*100).toFixed(0)}%（接入的 A–P 段 = ${fmt(Math.max(p.R*clamp(p.f,0,1), 0.01))} Ω）`;
    case 'voltmeter': return `内阻 R_V = ${fmt(p.Rv)} MΩ（近似理想）`;
    case 'ammeter':   return `内阻 R_A = ${fmt(p.Ra)} Ω（近似理想）`;
    case 'switch':    return p.closed ? '闭合' : '断开';
  }
  return '';
}

function testFields(){
  const out = [];
  state.comps.forEach(c=>{
    if(!isWired(c)) return;
    if(c.type === 'switch') return;          // 开关不作为考查对象
    if(c.type === 'voltmeter'){
      out.push({c, key:'U', label:'读数', unit:'V'});
    }else if(c.type === 'ammeter'){
      out.push({c, key:'I', label:'读数', unit:'A'});
    }else if(c.type === 'battery'){
      out.push({c, key:'I', label:'干路电流', unit:'A'});
      out.push({c, key:'U', label:'端电压', unit:'V'});
    }else if(c.type === 'rheostat'){
      out.push({c, key:'I', label:'A→P 电流', unit:'A'});
      out.push({c, key:'U', label:'U<sub>AB</sub>', unit:'V'});
    }else{
      out.push({c, key:'I', label:'电流 I', unit:'A'});
      out.push({c, key:'U', label:'电压 U', unit:'V'});
    }
  });
  return out;
}

function testPanelHTML(){
  const fields = testFields();
  const s = state.test;
  let qs = '';
  let lastId = null;
  fields.forEach(f=>{
    const key = f.c.id + ':' + f.key;
    if(f.c.id !== lastId){
      if(lastId !== null) qs += '</div>';
      qs += `<div class="q"><div class="q-name">${f.c.name} <em>${GEO[f.c.type].label}</em></div>
        <div class="q-param">${paramSummary(f.c)}</div><div class="q-fields">`;
      lastId = f.c.id;
    }
    const val = s.answers[key] !== undefined ? s.answers[key] : '';
    qs += `<div class="qf"><label>${f.label} (${f.unit})</label>
      <input type="number" step="any" data-ans="${key}" value="${val}" placeholder="?"></div>`;
  });
  if(lastId !== null) qs += '</div></div>';

  const body = fields.length
    ? qs
    : `<p class="hint">当前电路还没有完整接好元件。请先在画板上把元件两个端口都用导线连上，再来作答。</p>`;

  const btn = fields.length
    ? `<button class="btn primary" id="btnSubmit" style="width:100%;margin-top:12px;padding:9px">提交批改</button>`
    : '';

  const resHTML = s.submitted && s.result ? resultHTML() : '';

  return `<div class="card">
      <div class="card-title">测试模式</div>
      <p class="hint">电路正常通电，但<strong>读数已隐藏</strong>。请根据各元件参数，用欧姆定律、串并联规律算出每个元件的电压与电流，填入下表（按<strong>大小</strong>填写，正负号不影响判分）。</p>
      ${body}
      ${btn}
    </div>
    ${resHTML}`;
}

function resultHTML(){
  const r = state.test.result;
  if(!r) return '';
  const color = r.score >= 85 ? '#16a34a' : r.score >= 60 ? '#d97706' : '#dc2626';
  const bg    = r.score >= 85 ? '#e8f7ee' : r.score >= 60 ? '#fef3e2' : '#fdecec';
  const rows = r.rows.map(row=>`
    <div class="ans-row ${row.ok?'':'bad'}">
      <span class="k">${row.label}</span>
      <span class="v">${row.user}</span>
      <span class="t">${row.truth}</span>
      <span class="m" style="color:${row.ok?'#16a34a':'#dc2626'}">${row.ok?'✓':'✗'}</span>
    </div>`).join('');
  return `<div class="card">
    <div class="card-title">批改结果</div>
    <div class="score-wrap">
      <div class="score" style="background:${bg};color:${color}">${r.score}<small>分</small></div>
      <div style="font-size:12.5px;line-height:1.7;color:#64748b">
        答对 <b style="color:${color}">${r.correct}</b> / ${r.total} 项<br>
        <span style="color:#94a3b8">容差：读数误差 3%</span>
      </div>
    </div>
    <div class="ans-table">
      <div class="ans-row" style="background:transparent;color:#94a3b8;font-size:11px">
        <span class="k">项目</span><span class="v">你的</span><span class="t">正确</span><span class="m"></span>
      </div>
      ${rows}
    </div>
    <button class="btn" id="btnRetry" style="width:100%;margin-top:12px">重新作答</button>
  </div>`;
}

function buildPanel(){
  const body = $('#panelBody');
  if(state.mode === 'sim'){
    body.innerHTML = simPanelHTML();
    bindSimPanel();
    patchSim();
  }else{
    body.innerHTML = testPanelHTML();
    bindTestPanel();
  }
}

function bindSimPanel(){
  const body = $('#panelBody');
  body.querySelectorAll('input[data-param]').forEach(inp=>{
    const isRange = inp.type === 'range';
    const handler = ()=>{
      const sel = state.selected;
      if(!sel || sel.kind !== 'comp') return;
      const c = getComp(sel.id);
      const d = PARAMS[c.type].find(p=>p.key === inp.dataset.param);
      let v = parseFloat(inp.value);
      if(isNaN(v)) return;
      if(d.min !== undefined) v = clamp(v, d.min, d.max);
      c.params[inp.dataset.param] = v;
      if(isRange){
        const lab = body.querySelector('#fVal');
        if(lab) lab.textContent = (v*100).toFixed(0) + '%';
      }
      invalidateTest();
      refresh(false);
    };
    inp.addEventListener(isRange ? 'input' : 'change', handler);
  });
  body.querySelectorAll('button[data-toggle]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sel = state.selected;
      if(!sel || sel.kind !== 'comp') return;
      const c = getComp(sel.id);
      c.params.closed = !c.params.closed;
      invalidateTest();
      buildPanel();
      refresh(false);
    });
  });
  const dw = $('#btnDelWire');
  if(dw) dw.addEventListener('click', ()=>{
    if(state.selected && state.selected.kind === 'wire'){
      state.wires = state.wires.filter(w=>w.id !== state.selected.id);
      state.selected = null;
      refresh(true);
    }
  });
}

function bindTestPanel(){
  const body = $('#panelBody');
  body.querySelectorAll('input[data-ans]').forEach(inp=>{
    inp.addEventListener('input', ()=>{
      state.test.answers[inp.dataset.ans] = inp.value;
    });
  });
  const sb = $('#btnSubmit');
  if(sb) sb.addEventListener('click', gradeTest);
  const rb = $('#btnRetry');
  if(rb) rb.addEventListener('click', ()=>{
    state.test.answers = {};
    state.test.submitted = false;
    state.test.result = null;
    buildPanel();
  });
}

function gradeTest(){
  const fields = testFields();
  const res = state.last;
  if(!fields.length || !res) return;
  const rows = [];
  let correct = 0;
  fields.forEach(f=>{
    const key = f.c.id + ':' + f.key;
    const raw = state.test.answers[key];
    const user = parseFloat(raw);
    const r = res.readings[f.c.id];
    const truth = r ? Math.abs(r[f.key]) : 0;
    const tol = Math.max(truth*0.03, 0.005);
    const ok = !isNaN(user) && Math.abs(Math.abs(user) - truth) <= tol;
    if(ok) correct++;
    rows.push({
      label: `${f.c.name} · ${f.label.replace(/<[^>]+>/g,'')} (${f.unit})`,
      user: isNaN(user) ? '未填' : fmt(user),
      truth: fmt(truth),
      ok
    });
  });
  const score = Math.round(correct/fields.length*100);
  state.test.submitted = true;
  state.test.result = {score, correct, total:fields.length, rows};
  buildPanel();
}

function invalidateTest(){
  if(state.mode === 'test' && state.test.submitted){
    state.test.submitted = false;
    state.test.result = null;
  }
}

/* =====================================================================
   8. 统一刷新
   ===================================================================== */
function refresh(structural){
  state.last = solveCircuit(state.comps, state.wires);
  if(structural) drawWires();
  else{
    // 位置变化时也要重画导线
    drawWires();
  }
  updateVisuals();
  if(state.mode === 'sim') patchSim();
  if(structural) invalidateTest();
  if(structural) buildPanel();
}

/* =====================================================================
   9. 交互：拖动元件 / 拉线 / 删除
   ===================================================================== */
let dragState = null;
let wiring = null;

function stagePoint(e){
  const r = stage.getBoundingClientRect();
  return {x:e.clientX - r.left, y:e.clientY - r.top};
}

stage.addEventListener('pointerdown', e=>{
  const termEl = e.target.closest && e.target.closest('.term');
  const compEl_ = e.target.closest && e.target.closest('.comp');

  if(e.target.closest && e.target.closest('.del')) return;   // 删除按钮交给 click 处理
  if(termEl && compEl_){
    const ref = compEl_.dataset.id + ':' + termEl.dataset.term;
    const p0 = termPos(ref);
    wiring = {ref, p0, x:p0.x, y:p0.y, el:termEl};
    drawWires();
    e.preventDefault();
    return;
  }
  if(compEl_ && !e.target.classList.contains('del')){
    const id = compEl_.dataset.id;
    const c = getComp(id);
    const p = stagePoint(e);
    dragState = {id, ox:p.x - c.x, oy:p.y - c.y, moved:false, el:compEl_};
    compEl_.classList.add('dragging');
    stage.setPointerCapture(e.pointerId);
    e.preventDefault();
    return;
  }
  const wireEl = e.target.closest && e.target.closest('[data-wire]');
  if(wireEl){
    select({kind:'wire', id:wireEl.dataset.wire});
    return;
  }
  select(null);
});

window.addEventListener('pointermove', e=>{
  if(!dragState && !wiring) return;
  const p = stagePoint(e);
  if(dragState){
    const c = getComp(dragState.id);
    if(!c) return;
    const g = GEO[c.type];
    let nx = p.x - dragState.ox, ny = p.y - dragState.oy;
    nx = clamp(nx, 0, stage.clientWidth - g.w);
    ny = clamp(ny, 0, stage.clientHeight - g.h);
    nx = Math.round(nx/10)*10; ny = Math.round(ny/10)*10;
    if(Math.abs(nx-c.x) > 1 || Math.abs(ny-c.y) > 1) dragState.moved = true;
    c.x = nx; c.y = ny;
    syncCompPos(c);
    drawWires();
  }
  if(wiring){
    wiring.x = p.x; wiring.y = p.y;
    drawWires();
  }
});

function endPointer(e){
  if(dragState){
    const el = dragState.el;
    el.classList.remove('dragging');
    const moved = dragState.moved;
    const id = dragState.id;
    dragState = null;
    if(!moved){
      select({kind:'comp', id});
    }else{
      refresh(false);
    }
  }
  if(wiring){
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const tEl = target && target.closest ? target.closest('.term') : null;
    const cEl = tEl && tEl.closest('.comp');
    if(tEl && cEl){
      const ref2 = cEl.dataset.id + ':' + tEl.dataset.term;
      if(ref2 !== wiring.ref) addWire(wiring.ref, ref2);
    }
    wiring = null;
    drawWires();
  }
}
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', e=>{ dragState = null; wiring = null; drawWires(); });

stage.addEventListener('contextmenu', e=>{
  const compEl_ = e.target.closest && e.target.closest('.comp');
  if(compEl_){ e.preventDefault(); removeComp(compEl_.dataset.id); return; }
  const wireEl = e.target.closest && e.target.closest('[data-wire]');
  if(wireEl){
    e.preventDefault();
    state.wires = state.wires.filter(w=>w.id !== wireEl.dataset.wire);
    state.selected = null;
    refresh(true);
  }
});

stage.addEventListener('click', e=>{
  const delBtn = e.target.closest && e.target.closest('.del');
  if(delBtn){
    const cid = delBtn.closest('.comp').dataset.id;
    removeComp(cid);
  }
});

document.addEventListener('keydown', e=>{
  if(e.key !== 'Delete' && e.key !== 'Backspace') return;
  const tag = (e.target.tagName || '').toLowerCase();
  if(tag === 'input' || tag === 'textarea') return;
  if(!state.selected) return;
  e.preventDefault();
  if(state.selected.kind === 'comp') removeComp(state.selected.id);
  else{
    state.wires = state.wires.filter(w=>w.id !== state.selected.id);
    state.selected = null;
    refresh(true);
  }
});

function select(sel){
  state.selected = sel;
  stage.querySelectorAll('.comp').forEach(el=>{
    el.classList.toggle('sel', !!(sel && sel.kind==='comp' && el.dataset.id === sel.id));
  });
  // 仅改变选中状态，不重新求解、不使测试成绩失效
  drawWires();
  updateVisuals();
  buildPanel();
}

/* =====================================================================
   10. 组件库 / 顶栏
   ===================================================================== */
function paletteIcon(type){
  const g = GEO[type];
  return `<svg width="42" height="24" viewBox="0 0 ${g.w} ${g.h}" style="flex:0 0 auto">
    <g style="fill:none;stroke:#3a4762;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">${g.glyph()}</g>
    <style>.pitem svg text{fill:#7b8798;font-size:10px;font-weight:700}
    .pitem svg .glass{fill:#fdf6e3}</style>
  </svg>`;
}

const PALETTE_ORDER = ['battery','switch','resistor','lamp','rheostat','capacitor','inductor','motor','ammeter','voltmeter'];

function buildPalette(){
  const list = $('#paletteList');
  list.innerHTML = PALETTE_ORDER.map(t=>
    `<div class="pitem" data-type="${t}">${paletteIcon(t)}<span>${GEO[t].label}</span></div>`
  ).join('');

  list.querySelectorAll('.pitem').forEach(item=>{
    item.addEventListener('pointerdown', e=>{
      e.preventDefault();
      const type = item.dataset.type;
      const g = GEO[type];
      const p = stagePoint(e);
      // 从元件库拖出：直接生成并跟随鼠标
      const c = addComp(type, clamp(p.x - g.w/2, 10, stage.clientWidth-g.w-10), clamp(p.y - g.h/2, 10, stage.clientHeight-g.h-10));
      refresh(false);
      dragState = {id:c.id, ox:g.w/2, oy:g.h/2, moved:true, el:compEl(c.id)};
      dragState.el.classList.add('dragging');
      select({kind:'comp', id:c.id});
    });
  });
}

$('#modeSeg').addEventListener('click', e=>{
  const b = e.target.closest('button[data-mode]');
  if(!b) return;
  state.mode = b.dataset.mode;
  $('#modeSeg').querySelectorAll('button').forEach(x=>x.classList.toggle('on', x === b));
  state.test.submitted = false;
  state.test.result = null;
  buildPanel();
  refresh(false);
});

$('#btnClear').addEventListener('click', ()=>{
  if(!state.comps.length) return;
  if(!confirm('清空画板上所有元件与导线？')) return;
  state.comps = []; state.wires = []; state.selected = null;
  stage.querySelectorAll('.comp').forEach(el=>el.remove());
  state.test = {answers:{}, submitted:false, result:null};
  refresh(true);
});

/* =====================================================================
   11. 实验模板
   ===================================================================== */
const PRESETS = [
  {
    name:'① 串联电路（分压规律）',
    comps:[
      ['battery',   300, 350, {E:6, r:0}],
      ['switch',    100, 100, {closed:true}],
      ['resistor',  300, 100, {R:10}],
      ['resistor',  520, 100, {R:20}],
      ['ammeter',   700, 350, {Ra:0.001}],
      ['voltmeter', 300, 230, {Rv:1000}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,4,0],[4,1,0,1],[5,0,2,0],[5,1,2,1]]
  },
  {
    name:'② 并联电路（分流规律）',
    comps:[
      ['battery',   100, 260, {E:6, r:0.2}],
      ['switch',    100, 100, {closed:true}],
      ['resistor',  420, 100, {R:6}],
      ['resistor',  420, 240, {R:3}],
      ['ammeter',   640, 170, {Ra:0.001}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[1,1,3,0],[2,1,4,0],[3,1,4,0],[4,1,0,1]]
  },
  {
    name:'③ 伏安法测电阻（限流接法）',
    comps:[
      ['battery',   100, 360, {E:12, r:0}],
      ['switch',    100, 120, {closed:true}],
      ['rheostat',  260, 110, {R:20, f:0.4}],
      ['resistor',  480, 120, {R:10}],
      ['ammeter',   700, 120, {Ra:0.001}],
      ['voltmeter', 480, 260, {Rv:1000}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,4,0],[4,1,0,1],[5,0,3,0],[5,1,3,1]]
  },
  {
    name:'④ 电容充电（直流稳态）',
    comps:[
      ['battery',   120, 320, {E:6, r:0}],
      ['switch',    120, 120, {closed:true}],
      ['resistor',  340, 120, {R:1000}],
      ['capacitor', 560, 120, {C:1000}],
      ['voltmeter', 560, 260, {Rv:1000}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,1],[4,0,3,0],[4,1,3,1]]
  },
  {
    name:'⑤ 电动机工作',
    comps:[
      ['battery',  120, 300, {E:6, r:0}],
      ['switch',   120, 120, {closed:true}],
      ['motor',     380, 120, {R:5}],
      ['ammeter',  620, 200, {Ra:0.001}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,1]]
  },
  {
    name:'⑥ 电感（直流稳态）',
    comps:[
      ['battery',  120, 300, {E:6, r:0}],
      ['switch',   120, 120, {closed:true}],
      ['resistor', 360, 120, {R:10}],
      ['inductor', 580, 120, {L:100}],
      ['ammeter',  580, 260, {Ra:0.001}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,4,0],[4,1,0,1]]
  },
  {
    name:'⑦ 测量电源电动势与内阻',
    comps:[
      ['battery',   100, 360, {E:6, r:0.8}],
      ['switch',    100, 120, {closed:true}],
      ['ammeter',   300, 120, {Ra:0.001}],
      ['rheostat',  520, 110, {R:10, f:0.5}],
      ['voltmeter', 100, 240, {Rv:1000}]
    ],
    wires:[[0,0,1,0],[1,1,2,0],[2,1,3,0],[3,1,0,1],[4,0,0,0],[4,1,0,1]]
  }
];

function loadPreset(idx){
  state.comps = []; state.wires = []; state.selected = null;
  stage.querySelectorAll('.comp').forEach(el=>el.remove());
  state.test = {answers:{}, submitted:false, result:null};

  const p = PRESETS[idx];
  const created = p.comps.map(([type,x,y,params])=> addComp(type, x, y, params));
  p.wires.forEach(([ci,ti,cj,tj])=>{
    addWireRaw(created[ci].id + ':' + ti, created[cj].id + ':' + tj);
  });
  refresh(true);
}
function addWireRaw(a,b){ state.wires.push({id:'w'+(state.nextId++), a, b}); }

function buildPresetSelect(){
  const s = $('#presetSel');
  PRESETS.forEach((p,i)=>{
    const o = document.createElement('option');
    o.value = String(i); o.textContent = p.name;
    s.appendChild(o);
  });
  s.addEventListener('change', ()=>{
    if(s.value === '') return;
    loadPreset(+s.value);
    s.value = '';
  });
}

/* =====================================================================
   12. 启动
   ===================================================================== */
buildPalette();
buildPresetSelect();
loadPreset(0);
requestAnimationFrame(tick);
