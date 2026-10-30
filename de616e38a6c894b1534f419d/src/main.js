import { createTianaFetch } from '@tianacloud/serverless';
const style=document.createElement("style");style.textContent="\n:root{\n  --bg:#080b12; --bg2:#0d1220; --panel:rgba(255,255,255,.045); --line:rgba(255,255,255,.1);\n  --ink:#e6edf7; --ink2:#8b98ae; --ink3:#5c6880;\n  --grn:#22c55e; --cyn:#22d3ee; --vio:#a78bfa; --amb:#f59e0b; --red:#ef4444;\n  --mono:\"JetBrains Mono\",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;\n}\n*{box-sizing:border-box}\nhtml,body{height:100%}\nbody{\n  margin:0;background:\n    radial-gradient(1200px 600px at 15% -10%,rgba(34,211,238,.13),transparent 60%),\n    radial-gradient(900px 500px at 95% 0%,rgba(167,139,250,.13),transparent 60%),\n    var(--bg);\n  color:var(--ink);font-family:ui-sans-serif,-apple-system,\"Segoe UI\",\"Microsoft YaHei\",sans-serif;\n  -webkit-font-smoothing:antialiased;overflow-x:hidden;\n}\n#rain{position:fixed;inset:0;z-index:0;opacity:.32;pointer-events:none}\n.wrap{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:22px 16px 60px}\nheader{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:18px}\n.logo{\n  width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-weight:800;\n  font-family:var(--mono);font-size:19px;color:#04121a;\n  background:linear-gradient(135deg,var(--cyn),var(--grn));box-shadow:0 6px 22px rgba(34,211,238,.32)\n}\nh1{font-size:21px;margin:0;letter-spacing:.3px}\nh1 span{color:var(--cyn)}\n.sub{color:var(--ink2);font-size:12.5px;font-family:var(--mono);margin-top:3px}\n.badge{margin-left:auto;font-family:var(--mono);font-size:11.5px;color:var(--ink2);\n  border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:var(--panel)}\n.badge b{color:var(--amb)}\n\n.grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start}\n@media(max-width:900px){.grid{grid-template-columns:1fr}}\n\n.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px}\n.card h3{margin:0 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--ink3);font-family:var(--mono)}\n\n.board{\n  display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:rgba(0,0,0,.28);\n  border:1px solid var(--line);border-radius:16px;padding:10px;user-select:none;touch-action:none\n}\n.cell{aspect-ratio:1;border-radius:11px;background:rgba(255,255,255,.035);display:grid;place-items:center;\n  font-family:var(--mono);font-weight:700;font-size:clamp(17px,5.2vw,30px);color:var(--ink3);\n  transition:background .12s,transform .12s}\n.cell.p{background:var(--c1,#1b2436);color:var(--t1,#fff);animation:pop .13s ease-out}\n@keyframes pop{from{transform:scale(.72)}to{transform:scale(1)}}\n.cell.c2{background:#243046;color:#9fb3d1}\n.cell.c4{background:#1d3b4d;color:#7fd7ee}\n.cell.c8{background:#124a52;color:#5ff0d8}\n.cell.c16{background:#0f5b46;color:#7dffc4}\n.cell.c32{background:#17603a;color:#b6ffcf}\n.cell.c64{background:#1f6b2f;color:#d8ffd4}\n.cell.c128{background:#3f7a12;color:#f0ffb8}\n.cell.c256{background:#6b7a0d;color:#fbffb0}\n.cell.c512{background:#8a6d0b;color:#ffe9a3}\n.cell.c1024{background:linear-gradient(135deg,#22c55e,#22d3ee);color:#04121a;box-shadow:0 0 22px rgba(34,211,238,.45)}\n.cell.c2048{background:linear-gradient(135deg,#a78bfa,#f472b6);color:#14061f;box-shadow:0 0 26px rgba(167,139,250,.55)}\n.cell.ghost{opacity:.16}\n\n.hud{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}\n.stat{flex:1;min-width:96px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:9px 12px}\n.stat i{display:block;font-style:normal;font-size:10.5px;color:var(--ink3);letter-spacing:1.4px;font-family:var(--mono)}\n.stat b{font-size:19px;font-family:var(--mono)}\n.stat b.hot{color:var(--amb)}\n\n.btns{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}\nbutton{\n  font-family:var(--mono);font-size:12.5px;color:var(--ink);background:rgba(255,255,255,.06);\n  border:1px solid var(--line);border-radius:10px;padding:9px 13px;cursor:pointer;transition:.15s\n}\nbutton:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.25)}\nbutton:active{transform:scale(.97)}\nbutton.pri{background:linear-gradient(135deg,rgba(34,211,238,.9),rgba(34,197,94,.9));color:#04121a;border:0;font-weight:700}\nbutton:disabled{opacity:.4;cursor:not-allowed}\n\n.tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}\n.tabs button{padding:7px 12px;font-size:12px}\n.tabs button.on{background:rgba(34,211,238,.16);border-color:rgba(34,211,238,.5);color:#9ff0ff}\n\n.list{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto}\n.row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.035);border:1px solid var(--line);\n  border-radius:10px;padding:9px 11px;font-size:12.5px}\n.row .r{width:20px;color:var(--ink3);font-family:var(--mono)}\n.row .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.row .s{font-family:var(--mono);color:var(--amb)}\n.row.me{border-color:rgba(34,211,238,.5);background:rgba(34,211,238,.08)}\n.row .del{background:none;border:0;color:var(--ink3);padding:2px 4px;cursor:pointer}\n.row .del:hover{color:var(--red)}\n\n.medals{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}\n.medal{background:rgba(255,255,255,.035);border:1px solid var(--line);border-radius:10px;padding:9px;text-align:center;font-size:11px;color:var(--ink3)}\n.medal.on{border-color:rgba(245,158,11,.55);background:rgba(245,158,11,.12);color:#ffd894}\n.medal .i{font-size:19px;display:block;margin-bottom:3px}\n.medal.on .i{filter:drop-shadow(0 0 8px rgba(245,158,11,.6))}\n\n.note{font-size:12.5px;line-height:1.75;color:var(--ink2)}\n.note b{color:var(--ink)}\n.note code{font-family:var(--mono);background:rgba(255,255,255,.07);padding:1px 5px;border-radius:5px;font-size:12px}\n.kv{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:12.5px;color:var(--ink2);font-family:var(--mono)}\n.kv b{color:var(--ink)}\ndetails{margin-top:10px}\nsummary{cursor:pointer;font-size:12.5px;color:var(--cyn);font-family:var(--mono);padding:6px 0}\nsummary:hover{text-decoration:underline}\n\n#over{position:fixed;inset:0;z-index:9;display:none;place-items:center;background:rgba(4,6,12,.86);backdrop-filter:blur(5px)}\n#over.on{display:grid}\n.ov{width:min(460px,92vw);background:linear-gradient(160deg,rgba(34,211,238,.1),rgba(167,139,250,.1));\n  border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:24px;text-align:center}\n.ov h2{margin:0 0 6px;font-size:22px}\n.ov p{color:var(--ink2);font-size:13px;line-height:1.7;margin:0 0 16px}\n.ov .big{font-size:38px;font-family:var(--mono);color:var(--amb);margin:6px 0}\n.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);z-index:12;\n  background:rgba(10,16,28,.96);border:1px solid var(--line);border-radius:11px;padding:11px 17px;\n  font-size:12.5px;font-family:var(--mono);opacity:0;transition:.25s;pointer-events:none}\n.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}\n.foot{margin-top:22px;text-align:center;color:var(--ink3);font-size:11.5px;font-family:var(--mono);line-height:1.9}\n";document.head.append(style);
document.body.innerHTML="\n<canvas id=\"rain\"></canvas>\n<div class=\"wrap\">\n  <header>\n    <div class=\"logo\">1024</div>\n    <div>\n      <h1>CodeMerge <span>1024</span></h1>\n      <div class=\"sub\">merge code blocks → ship the 1024 build</div>\n    </div>\n    <div class=\"badge\">🎯 目标 <b>合成 1024</b> · 每日挑战可玩</div>\n  </header>\n\n  <div class=\"grid\">\n    <div>\n      <div class=\"hud\">\n        <div class=\"stat\"><i>SCORE</i><b id=\"score\">0</b></div>\n        <div class=\"stat\"><i>BEST</i><b class=\"hot\" id=\"best\">0</b></div>\n        <div class=\"stat\"><i>MAX TILE</i><b id=\"mx\">2</b></div>\n        <div class=\"stat\"><i>MODE</i><b id=\"mode\" style=\"font-size:14px\">经典</b></div>\n      </div>\n      <div class=\"card\">\n        <div class=\"board\" id=\"board\"></div>\n        <div class=\"btns\">\n          <button class=\"pri\" id=\"btnNew\">↻ 重新开始</button>\n          <button id=\"btnUndo\">↶ 撤销</button>\n          <button id=\"btnShuffle\">🔀 洗牌</button>\n          <button id=\"btnDaily\">🗓 每日挑战</button>\n          <button id=\"btnSound\">🔊 音效</button>\n        </div>\n      </div>\n    </div>\n\n    <div>\n      <div class=\"card\" style=\"margin-bottom:16px\">\n        <h3>排行榜 · 云端</h3>\n        <div class=\"list\" id=\"rank\"></div>\n        <div class=\"btns\"><button id=\"btnClear\" style=\"width:100%\">清空排行榜</button></div>\n      </div>\n      <div class=\"card\" style=\"margin-bottom:16px\">\n        <h3>成就徽章</h3>\n        <div class=\"medals\" id=\"medals\"></div>\n      </div>\n      <div class=\"card\">\n        <h3>玩法说明</h3>\n        <div class=\"note\">\n          方向键 / <code>WASD</code> / 手机滑动 移动方块，相同数字自动合并。<br>\n          数字是\"代码块\"：<b>2=变量</b>、<b>4=函数</b>、<b>8=类</b>、<b>16=模块</b>、<b>32=服务</b>、<b>64=集群</b>、<b>128=流水线</b>、<b>256=网关</b>、<b>512=中台</b>、<b>1024=上线</b>。<br>\n          合到 <b>1024</b> 即完成一次\"造物\"，可继续挑战 2048。\n          <div class=\"kv\" style=\"margin-top:10px\">\n            <b>每日挑战</b><span>按日期生成的固定序列，全天同局</span>\n            <b>云端存档</b><span>分数/成就/榜单保存在应用数据库</span>\n            <b>音效</b><span>WebAudio 合成，可随时关闭</span>\n          </div>\n        </div>\n        <details><summary>▸ 代码块命名表（完整 11 级）</summary>\n          <div class=\"note\" id=\"lvl\"></div>\n        </details>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"foot\">\n    云端记录 · 随时继续挑战 · <span id=\"footdate\"></span><br>\n    CodeMerge 1024\n  </div>\n</div>\n\n<div id=\"over\"><div class=\"ov\">\n  <div style=\"font-size:38px\">🚀</div>\n  <h2 id=\"ovt\">造物完成！</h2>\n  <div class=\"big\" id=\"ovs\">1024</div>\n  <p id=\"ovd\"></p>\n  <div class=\"btns\" style=\"justify-content:center\">\n    <button class=\"pri\" id=\"ovNew\">再来一局</button>\n    <button id=\"ovClose\">看看排行榜</button>\n  </div>\n</div></div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
"use strict";
const SIZE=4;
let rankings=[], dbFetch, connection, writes=Promise.resolve(), saveFailed=false, revision=0;
const loading=document.createElement("div"); loading.style.cssText="position:fixed;inset:0;z-index:100;background:#080b12;display:grid;place-items:center"; loading.textContent="正在读取云端记录…"; document.body.append(loading);
const NAMES={2:"变量",4:"函数",8:"类",16:"模块",32:"服务",64:"集群",128:"流水线",256:"网关",512:"中台",1024:"上线",2048:"重构"};
let grid=[],score=0,best=0,over=false,won=false,hist=[],mode="经典",dailySeed=0,soundOn=true,medals={};

/* ---------- 存储 ---------- */
async function execute(sql,args=[]){
  const response=await dbFetch(connection.origin+"/v3/pipeline",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({requests:[{type:"execute",stmt:{sql,args,want_rows:true}},{type:"close"}]})});
  if(!response.ok) throw Error("数据库请求结果未知");
  const result=(await response.json()).results?.[0];
  if(result?.type!=="ok" || result.response?.type!=="execute") throw Error("数据库操作失败或结果未知");
  return result.response.result;
}
async function load(){
  if(typeof window.tiana?.auth?.getAccessToken!=="function") throw Error("账户认证尚未就绪");
  connection=await window.tiana.connection();
  if(connection.sql_api!=="hrana-v3") throw Error("数据库协议不受支持");
  dbFetch=createTianaFetch({origin:connection.origin,auth:window.tiana.auth,requestBodyMode:"buffered"});
  const result=await execute("SELECT data, revision FROM game_state WHERE id=1");
  if (!result.rows?.length) throw Error("数据库尚未初始化");
  const s=JSON.parse(result.rows[0][0].value);
  revision=Number(result.rows[0][1].value);
  if(!Number.isSafeInteger(revision)) throw Error("记录版本无效");
  best=s.best||0; medals=s.medals||{}; soundOn=s.soundOn!==false; rankings=Array.isArray(s.rankings)?s.rankings:[];
}
function save(){
  const data=JSON.stringify({best,medals,soundOn,rankings});
  writes=writes.then(async()=>{
    if(saveFailed) return;
    const result=await execute("UPDATE game_state SET data=?, revision=revision+1 WHERE id=1 AND revision=?",[{type:"text",value:data},{type:"integer",value:String(revision)}]);
    if(Number(result.affected_row_count) !== 1) throw Error("记录已在其他页面更改，请重新打开应用");
    revision++;
  }).catch(()=>{
    saveFailed=true;
    const warning=document.createElement("div"); warning.style.cssText="position:fixed;z-index:20;top:0;left:0;right:0;padding:12px;background:#8b1a1a;color:white;text-align:center";
    warning.textContent="记录发生冲突或保存结果未知，请重新打开应用检查云端记录；后续变更不会保存。"; document.body.append(warning);
  });
}

/* ---------- 音效 ---------- */
let ac=null;
function beep(f,dur,vol,type){if(!soundOn)return;try{
  ac=ac||new (window.AudioContext||window.webkitAudioContext)();
  if(ac.state==="suspended")ac.resume();
  const o=ac.createOscillator(),g=ac.createGain();
  o.type=type||"sine";o.frequency.value=f;o.connect(g);g.connect(ac.destination);
  g.gain.setValueAtTime(vol||.08,ac.currentTime);
  g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+(dur||.1));
  o.start();o.stop(ac.currentTime+(dur||.1)+.02);
}catch(e){}}
const sMove=()=>beep(180,.05,.05,"triangle"), sMerge=()=>{beep(520,.09,.07,"square");setTimeout(()=>beep(780,.1,.06,"square"),60);}, sOver=()=>{beep(220,.3,.08,"sawtooth");}, sWin=()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,.18,.07,"square"),i*110));};

/* ---------- 核心 2048 ---------- */
function empty(){return Array.from({length:SIZE},()=>Array(SIZE).fill(0));}
function clone(g){return g.map(r=>r.slice());}
function addRandClassic(g){const es=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!g[r][c])es.push([r,c]);
  if(!es.length)return g;const p=es[Math.floor(Math.random()*es.length)];g[p[0]][p[1]]=Math.random()<.9?2:4;return g;}
let addRand=addRandClassic;
function slideRow(row){
  const a=row.filter(v=>v);const out=[];
  for(let i=0;i<a.length;i++){if(a[i]===a[i+1]){out.push(a[i]*2);i++;}else out.push(a[i]);}
  while(out.length<SIZE)out.push(0);
  let gain=0;for(let i=0;i<SIZE-1;i++)if(out[i]&&out[i]===out[i+1+0]&&row.indexOf(out[i])!==-1){}
  return out;
}
function slide(g,dir){
  const out=empty();let moved=false,gain=0;
  for(let i=0;i<SIZE;i++){
    let line=[];
    for(let j=0;j<SIZE;j++){
      if(dir==="l")line.push(g[i][j]);
      else if(dir==="r")line.push(g[i][SIZE-1-j]);
      else if(dir==="u")line.push(g[j][i]);
      else line.push(g[SIZE-1-j][i]);
    }
    const vals=line.filter(v=>v);const merged=[];
    for(let k=0;k<vals.length;k++){
      if(vals[k]===vals[k+1]){merged.push(vals[k]*2);gain+=vals[k]*2;k++;}
      else merged.push(vals[k]);
    }
    while(merged.length<SIZE)merged.push(0);
    for(let j=0;j<SIZE;j++){
      const v=merged[j];
      if(dir==="l")out[i][j]=v;
      else if(dir==="r")out[i][SIZE-1-j]=v;
      else if(dir==="u")out[j][i]=v;
      else out[SIZE-1-j][i]=v;
    }
    for(let j=0;j<SIZE;j++){const v=dir==="l"?out[i][j]:dir==="r"?out[i][SIZE-1-j]:dir==="u"?out[j][i]:out[SIZE-1-j][i];
      const ov=dir==="l"?g[i][j]:dir==="r"?g[i][SIZE-1-j]:dir==="u"?g[j][i]:g[SIZE-1-j][i];
      if(v!==ov)moved=true;}
  }
  return{grid:out,moved,gain};
}
function canMove(g){
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(!g[r][c])return true;
    if(c<SIZE-1&&g[r][c]===g[r][c+1])return true;
    if(r<SIZE-1&&g[r][c]===g[r+1][c])return true;}
  return false;
}
function maxTile(g){let m=0;for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(g[r][c]>m)m=g[r][c];return m;}
function move(dir){
  if(over)return;
  const snap=clone(grid);
  const res=slide(grid,dir);
  if(!res.moved){beep(90,.04,.03,"sine");return;}
  hist.push({g:snap,s:score});
  if(hist.length>60)hist.shift();
  grid=res.grid;score+=res.gain;
  addRand(grid);
  if(res.gain>0){sMerge();checkMedals();}
  else sMove();
  if(score>best){best=score;save();}
  if(!won&&maxTile(grid)>=1024){won=true;onWin();}
  if(!canMove(grid)){over=true;sOver();setTimeout(showOver,320);}
  render();
}
function undo(){
  if(!hist.length)return toast("没有可撤销的步骤");
  const h=hist.pop();grid=h.g;score=h.s;over=false;render();toast("已撤销一步");
}
function shuffle(){
  const before=clone(grid);
  const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c])cells.push(grid[r][c]);
  if(cells.length<2)return toast("方块太少，无法洗牌");
  for(let i=cells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cells[i],cells[j]]=[cells[j],cells[i]];}
  let k=0;for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c])grid[r][c]=cells[k++];
  hist.push({g:before,s:score});
  addRand(grid);render();toast("已洗牌");
}

/* ---------- 每日挑战（按日期种子固定序列） ---------- */
function dateSeed(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function startDaily(){
  mode="每日挑战";dailySeed=dateSeed();score=0;over=false;won=false;hist=[];grid=empty();
  let s=dailySeed;
  const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  for(let i=0;i<2;i++){const r=Math.floor(rnd()*SIZE),c=Math.floor(rnd()*SIZE);grid[r][c]=i?4:2;}
  addRand=addRandDaily(rnd);
  document.getElementById("mode").textContent="每日 "+dailySeed;
  render();toast("每日挑战已载入 · 序列 "+dailySeed);
}
function addRandDaily(rnd){return function(g){const es=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!g[r][c])es.push([r,c]);
  if(!es.length)return g;const p=es[Math.floor(rnd()*es.length)];g[p[0]][p[1]]=rnd()<.9?2:4;return g;};}

/* ---------- 成就 ---------- */
const MEDALS=[
  {k:"m1",i:"🚀",t:"首次上线(1024)",f:s=>s.max>=1024},
  {k:"m2",i:"🏗️",t:"合并 100 次",f:s=>s.merge>=100},
  {k:"m3",i:"💎",t:"2048 重构",f:s=>s.max>=2048},
  {k:"m4",i:"📈",t:"分数破 5000",f:s=>s.score>=5000},
  {k:"m5",i:"🔥",t:"分数破 20000",f:s=>s.score>=20000},
  {k:"m6",i:"🧱",t:"铺满 15 格",f:s=>s.filled>=15},
  {k:"m7",i:"🌀",t:"洗牌大师",f:s=>s.shuffle>=1},
  {k:"m8",i:"🌙",t:"夜猫子(02:00-05:00)",f:s=>s.night>=1}
];
let stats={merge:0,shuffle:0,night:0,max:0,score:0,filled:0};
function checkMedals(){
  stats.merge++;stats.score=score;stats.max=maxTile(grid);
  let filled=0;for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(grid[r][c])filled++;
  stats.filled=filled;
  const h=new Date().getHours();if(h>=2&&h<5)stats.night=1;
  let got=null;
  MEDALS.forEach(m=>{if(!medals[m.k]&&m.f(stats)){medals[m.k]=1;got=m;}});
  if(got){save();sWin();toast("🏅 解锁成就 · "+got.t);}
}
function renderMedals(){
  const box=document.getElementById("medals");box.innerHTML="";
  MEDALS.forEach(m=>{
    const d=document.createElement("div");
    d.className="medal"+(medals[m.k]?" on":"");
    d.innerHTML='<span class="i">'+m.i+'</span>'+m.t;
    box.appendChild(d);
  });
}

/* ---------- 排行榜 ---------- */
function rank(){return rankings.slice();}
function setRank(r){rankings=r;save();}
function pushRank(){
  const r=rank();r.push({name:nick(),score:score,t:new Date().toLocaleString("zh-CN",{hour12:false})});
  r.sort((a,b)=>b.score-a.score);setRank(r.slice(0,20));
}
function nick(){return "码农";}
function renderRank(){
  const box=document.getElementById("rank");box.innerHTML="";
  const r=rank();
  if(!r.length){box.innerHTML='<div class="row"><span class="n" style="color:var(--ink3)">还没有记录 · 玩一局留下名字</span></div>';return;}
  r.forEach((it,i)=>{
    const d=document.createElement("div");
    d.className="row"+(it.name===nick()?" me":"");
    d.innerHTML='<span class="r">#'+(i+1)+'</span><span class="n">'+esc(it.name)+'</span><span class="s">'+it.score+'</span><button class="del" title="删除">✕</button>';
    d.querySelector(".del").onclick=()=>{const rr=rank().filter(x=>!(x.name===it.name&&x.score===it.score&&x.t===it.t));setRank(rr);renderRank();};
    box.appendChild(d);
  });
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

/* ---------- 渲染 ---------- */
const board=document.getElementById("board");
function render(){
  board.innerHTML="";
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const v=grid[r][c],d=document.createElement("div");
    d.className="cell"+(v?" p":"")+(v?" c"+v:"");
    if(v)d.textContent=v;
    board.appendChild(d);
  }
  document.getElementById("score").textContent=score;
  document.getElementById("best").textContent=best;
  document.getElementById("mx").textContent=maxTile(grid);
  renderMedals();
}
function showOver(){
  pushRank();renderRank();
  document.getElementById("ovt").textContent="无可用步";
  document.getElementById("ovs").textContent=score;
  document.getElementById("ovd").innerHTML="本次得分 <b>"+score+"</b> · 历史最佳 <b>"+best+"</b><br>棋盘已满 —— 代码合并失败，再来一次？";
  document.getElementById("over").classList.add("on");
}
function onWin(){
  sWin();
  document.getElementById("ovt").textContent="造物完成 · 1024 上线";
  document.getElementById("ovs").textContent=1024;
  document.getElementById("ovd").innerHTML="你把代码块合并到了 <b>1024</b>，成功上线一次造物。<br>本局得分 <b>"+score+"</b>，继续挑战 2048 吧。";
  document.getElementById("over").classList.add("on");
}

/* ---------- toast ---------- */
let tt=null;
function toast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("on");
  clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),1900);}

/* ---------- 交互 ---------- */
document.addEventListener("keydown",e=>{
  const k=e.key.toLowerCase();
  const m={arrowleft:"l",arrowright:"r",arrowup:"u",arrowdown:"d",a:"l",d:"r",w:"u",s:"d"};
  if(m[k]){e.preventDefault();move(m[k]);}
  else if(k==="z"&&e.ctrlKey){e.preventDefault();undo();}
});
let sx=0,sy=0;
board.addEventListener("touchstart",e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;},{passive:true});
board.addEventListener("touchend",e=>{
  const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  move(Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u"));
},{passive:true});
document.getElementById("btnNew").onclick=()=>{mode="经典";addRand=addRandClassic;document.getElementById("mode").textContent="经典";score=0;over=false;won=false;hist=[];grid=empty();addRand(grid);addRand(grid);render();toast("新的一局开始了");};
document.getElementById("btnUndo").onclick=undo;
document.getElementById("btnShuffle").onclick=()=>{stats.shuffle++;checkMedals();shuffle();};
document.getElementById("btnDaily").onclick=startDaily;
document.getElementById("btnSound").onclick=e=>{soundOn=!soundOn;save();e.target.textContent=soundOn?"🔊 音效":"🔇 静音";toast(soundOn?"音效已开":"音效已关");};
document.getElementById("btnClear").onclick=()=>{if(!confirm("清空排行榜记录？"))return;setRank([]);renderRank();toast("已清空");};
document.getElementById("ovNew").onclick=()=>{document.getElementById("over").classList.remove("on");document.getElementById("btnNew").click();};
document.getElementById("ovClose").onclick=()=>document.getElementById("over").classList.remove("on");

/* ---------- 代码雨背景 ---------- */
(function(){
  const cv=document.getElementById("rain"),ctx=cv.getContext("2d");
  let cols,drop,fs=15,W,H;
  function size(){W=cv.width=innerWidth;H=cv.height=innerHeight;fs=15;cols=Math.floor(W/fs);drop=Array(cols).fill(1);}
  size();addEventListener("resize",size);
  const GLY="01{}[]<>/*+-=&%$#@ABCDEFKLMNOP";
  function draw(){
    ctx.fillStyle="rgba(8,11,18,.09)";ctx.fillRect(0,0,W,H);
    ctx.font=fs+"px monospace";
    for(let i=0;i<cols;i++){
      const ch=GLY[(Math.random()*GLY.length)|0];
      ctx.fillStyle=Math.random()<.12?"rgba(34,211,238,.9)":"rgba(120,190,170,.55)";
      ctx.fillText(ch,i*fs,drop[i]*fs);
      if(drop[i]*fs>H&&Math.random()>.975)drop[i]=0;
      drop[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- 启动 ---------- */
async function start(){
try { await load(); loading.remove(); } catch(e) { document.body.textContent="无法读取云端记录，请重新打开应用或检查登录状态。"; return; }
grid=empty();addRand(grid);addRand(grid);
document.getElementById("best").textContent=best;
document.getElementById("footdate").textContent="Build "+dateSeed();
document.getElementById("btnSound").textContent=soundOn?"🔊 音效":"🔇 静音";
document.getElementById("lvl").innerHTML=Object.keys(NAMES).map(k=>"<b>"+k+"</b> · "+NAMES[k]).join(" &nbsp;→&nbsp; ");
render();renderRank();
}
start();
})();
