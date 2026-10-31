import { createTianaFetch } from '@tianacloud/serverless';
const style = document.createElement("style"); style.textContent = "\n:root{\n  --bg:#0d1117; --panel:#161b22; --panel2:#1c2330; --line:#2d333f;\n  --ink:#e6edf3; --ink2:#9da7b3; --ink3:#6e7681;\n  --green:#3fb950; --purple:#a371f7; --yellow:#d29922; --red:#f85149; --blue:#58a6ff;\n}\n*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}\nhtml,body{height:100%}\nbody{\n  background:var(--bg); color:var(--ink);\n  font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;\n  min-height:100vh; overflow-x:hidden;\n  background-image:\n    radial-gradient(600px 300px at 15% -5%, rgba(163,113,247,.10), transparent),\n    radial-gradient(700px 350px at 85% 0%, rgba(63,185,80,.08), transparent);\n}\n.wrap{max-width:860px;margin:0 auto;padding:28px 18px 60px}\nheader{text-align:center;margin-bottom:26px}\n.badge{display:inline-block;font-size:12px;color:var(--green);border:1px solid rgba(63,185,80,.4);\n  background:rgba(63,185,80,.08);border-radius:999px;padding:4px 14px;letter-spacing:2px;margin-bottom:12px}\nh1{font-size:34px;font-weight:800;letter-spacing:1px;\n  background:linear-gradient(90deg,#3fb950,#58a6ff,#a371f7);-webkit-background-clip:text;background-clip:text;color:transparent}\n.sub{color:var(--ink2);font-size:14px;margin-top:8px}\n.tabs{display:flex;gap:10px;justify-content:center;margin:22px 0 20px;flex-wrap:wrap}\n.tab{border:1px solid var(--line);background:var(--panel);color:var(--ink2);border-radius:12px;\n  padding:10px 20px;font-size:14px;cursor:pointer;transition:.18s;font-weight:600}\n.tab:hover{border-color:var(--green);color:var(--ink)}\n.tab.on{background:linear-gradient(135deg,rgba(63,185,80,.18),rgba(88,166,255,.12));\n  border-color:var(--green);color:#fff}\n.panel{display:none;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:26px 22px;\n  box-shadow:0 10px 40px rgba(0,0,0,.35)}\n.panel.on{display:block;animation:fade .3s ease}\n@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}\n/* ── 木鱼 ── */\n.merit-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}\n.stat{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:10px 18px;text-align:center;min-width:110px}\n.stat b{display:block;font-size:24px;color:var(--yellow);font-variant-numeric:tabular-nums}\n.stat span{font-size:12px;color:var(--ink3)}\n.muyu-stage{position:relative;text-align:center;padding:34px 0 10px;user-select:none}\n.muyu{font-size:120px;display:inline-block;cursor:pointer;transition:transform .06s;filter:drop-shadow(0 8px 24px rgba(210,153,34,.25))}\n.muyu:active{transform:scale(.9)}\n.float{position:absolute;left:50%;font-size:22px;font-weight:800;color:var(--yellow);pointer-events:none;\n  animation:floatup 1s ease forwards;text-shadow:0 2px 10px rgba(0,0,0,.5)}\n@keyframes floatup{from{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-90px)}}\n.combo{font-size:13px;color:var(--ink2);min-height:20px;margin-top:8px}\n.auto-row{display:flex;gap:10px;justify-content:center;margin-top:14px;flex-wrap:wrap}\n.btn{border:1px solid var(--line);background:var(--panel2);color:var(--ink);border-radius:10px;\n  padding:9px 18px;font-size:13px;cursor:pointer;transition:.15s;font-weight:600}\n.btn:hover{border-color:var(--purple)}\n.btn.primary{background:linear-gradient(135deg,#238636,#2ea043);border-color:#2ea043}\n.btn.primary:hover{filter:brightness(1.1)}\n.quote{text-align:center;color:var(--ink3);font-size:13px;margin-top:20px;font-style:italic;min-height:20px}\n/* ── 合成1024 ── */\n.g-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px}\n.g-board{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:var(--panel2);\n  border:1px solid var(--line);border-radius:14px;padding:12px;touch-action:none}\n.cell{aspect-ratio:1;background:#0d1117;border-radius:10px;display:flex;align-items:center;justify-content:center;\n  font-weight:800;font-size:clamp(16px,4.5vw,28px);color:var(--ink);transition:background .12s;font-variant-numeric:tabular-nums}\n.cell.pop{animation:pop .18s ease}\n@keyframes pop{0%{transform:scale(.6)}100%{transform:scale(1)}}\n.g-hint{color:var(--ink3);font-size:12px;text-align:center;margin-top:12px}\n.g-over{display:none;text-align:center;padding:16px}\n.g-over.show{display:block}\n/* ── 通用 ── */\nfooter{text-align:center;color:var(--ink3);font-size:12px;margin-top:34px;line-height:1.8}\n.kbd{background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:1px 7px;font-size:12px;color:var(--ink2)}\n@media(max-width:560px){h1{font-size:26px}.muyu{font-size:96px}.panel{padding:20px 14px}}\n"; document.head.appendChild(style);
document.getElementById("app").innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <div class=\"badge\">PROGRAMMER PLAYGROUND</div>\n    <h1>程序员解压馆</h1>\n    <div class=\"sub\">功德不够，木鱼来凑 · 压力太大，合成 1024</div>\n  </header>\n\n  <div class=\"tabs\">\n    <button class=\"tab on\" data-t=\"muyu\">🪵 电子木鱼</button>\n    <button class=\"tab\" data-t=\"g1024\">🎮 合成 1024</button>\n  </div>\n\n  <!-- 电子木鱼 -->\n  <section class=\"panel on\" id=\"p-muyu\">\n    <div class=\"merit-top\">\n      <div class=\"stat\"><b id=\"merit\">0</b><span>今日功德</span></div>\n      <div class=\"stat\"><b id=\"total\">0</b><span>累计功德</span></div>\n      <div class=\"stat\"><b id=\"level\">Lv.1 实习生</b><span>修为等级</span></div>\n    </div>\n    <div class=\"muyu-stage\" id=\"stage\">\n      <div class=\"muyu\" id=\"muyu\">🪵</div>\n      <div class=\"combo\" id=\"combo\"></div>\n    </div>\n    <div class=\"auto-row\">\n      <button class=\"btn primary\" id=\"knock\">敲一下（空格也行）</button>\n      <button class=\"btn\" id=\"auto\">🤖 自动积德：关</button>\n    </div>\n    <div class=\"quote\" id=\"quote\">「Bug 会有的，功德也会有的。」</div>\n  </section>\n\n  <!-- 合成1024 -->\n  <section class=\"panel\" id=\"p-g1024\">\n    <div class=\"g-head\">\n      <div class=\"stat\"><b id=\"score\">0</b><span>当前分数</span></div>\n      <div class=\"stat\"><b id=\"best\">0</b><span>最高分</span></div>\n      <button class=\"btn primary\" id=\"restart\">↻ 重新开局</button>\n    </div>\n    <div class=\"g-board\" id=\"board\"></div>\n    <div class=\"g-hint\">电脑用 <span class=\"kbd\">←↑↓→</span> 或 <span class=\"kbd\">WASD</span>，手机直接滑动 · 合成 <b style=\"color:var(--purple)\">1024</b> 即通关</div>\n    <div class=\"g-over\" id=\"gover\">\n      <b id=\"goverText\" style=\"font-size:18px\"></b>\n      <div style=\"margin-top:10px\"><button class=\"btn primary\" onclick=\"restartGame()\">再来一局</button></div>\n    </div>\n  </section>\n\n  <footer>\n    放松一下，继续前进<br>\n    代码写不完，功德先拉满 🙏\n  </footer>\n</div>\n\n";

/* ═══════ 页签 ═══════ */
document.querySelectorAll('.tab').forEach(function(t){
  t.onclick=function(){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('on')});
    document.querySelectorAll('.panel').forEach(function(x){x.classList.remove('on')});
    t.classList.add('on');
    document.getElementById('p-'+t.dataset.t).classList.add('on');
  };
});

/* ═══════ 电子木鱼 ═══════ */
var merit=0, total=0, dayStamp='', today=new Date().toDateString(), best=0;
var dbExecute, pending=Promise.resolve(), dbReady=false;
const status=document.createElement('div'); status.setAttribute('role','status'); status.style.cssText='text-align:center;color:#d29922;padding:8px'; status.textContent='正在读取记录…'; document.querySelector('.wrap').prepend(status);
async function initDatabase(){
  const auth=window.tiana?.auth;
  if(typeof auth?.getAccessToken!=='function'||typeof window.tiana?.connection!=='function') throw Error('数据库连接不可用');
  const conn=await window.tiana.connection();
  if(conn.sql_api!=='hrana-v3') throw Error('不支持的数据库协议');
  const sqlFetch=createTianaFetch({origin:conn.origin,auth,requestBodyMode:'buffered'});
  dbExecute=async function(sql,args=[]){
    const response=await sqlFetch(`${conn.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw Error('数据库请求结果未知');
    const body=await response.json(), statement=body.results?.[0];
    if(statement?.type!=='ok'||statement.response?.type!=='execute') throw Error('数据库操作失败');
    return statement.response.result;
  };
  const result=await dbExecute('SELECT merit_day, merit_total, day_stamp, best FROM progress WHERE id=1');
  const row=result.rows?.[0]; if(!row) throw Error('记录未初始化');
  merit=Number(row[0].value); total=Number(row[1].value); dayStamp=row[2].value; best=Number(row[3].value);
  if(dayStamp!==today) merit=0;
  renderMerit();renderBoard(); dbReady=true; status.textContent='';
}
function queueWrite(sql,args){
  pending=pending.then(()=>dbExecute(sql,args)).catch(()=>{dbReady=false;status.textContent='保存结果未知，请刷新后核对记录';});
}
initDatabase().catch(()=>{status.textContent='无法读取记录，请检查连接并刷新';});
var LEVELS=[[0,'Lv.1 实习生'],[100,'Lv.2 初级工程师'],[300,'Lv.3 中级工程师'],[666,'Lv.4 高级工程师'],
  [1024,'Lv.5 架构师'],[2048,'Lv.6 技术专家'],[5000,'Lv.7 CTO'],[10000,'Lv.8 功德圆满']];
var QUOTES=['「Bug 会有的，功德也会有的。」','「功德 +1，需求 -1。」','「手敲木鱼，心想 release。」',
  '「线上无事故，功德自然来。」','「删掉的不是代码，是业障。」','「merge 不冲突，功德加十分。」',
  '「周五不发版，功德翻一番。」','「文档写得好，功德少不了。」'];
var comboCount=0,comboTimer=null,autoOn=false,autoTimer=null;

function renderMerit(){
  document.getElementById('merit').textContent=merit;
  document.getElementById('total').textContent=total;
  var lv=LEVELS[0][1];
  for(var i=0;i<LEVELS.length;i++){if(total>=LEVELS[i][0])lv=LEVELS[i][1];}
  document.getElementById('level').textContent=lv;
}
function saveMerit(){
  queueWrite("UPDATE progress SET merit_day=CASE WHEN day_stamp=? THEN merit_day+1 ELSE 1 END, merit_total=merit_total+1, day_stamp=? WHERE id=1",[{type:'text',value:today},{type:'text',value:today}]);
}
function knock(){
  if(!dbReady)return;
  const currentDay=new Date().toDateString(); if(today!==currentDay){today=currentDay;merit=0;}
  merit++; total++;
  renderMerit(); saveMerit();
  var stage=document.getElementById('stage');
  var f=document.createElement('div');
  f.className='float'; f.textContent='功德 +1';
  f.style.left=(50+(Math.random()*30-15))+'%';
  f.style.top='30%';
  stage.appendChild(f);
  setTimeout(function(){f.remove()},1000);
  comboCount++;
  clearTimeout(comboTimer);
  comboTimer=setTimeout(function(){comboCount=0;document.getElementById('combo').textContent='';},1200);
  document.getElementById('combo').textContent=comboCount>=5?'🔥 连击 x'+comboCount+' 功德暴涨！':'';
  if(total%100===0){
    document.getElementById('quote').textContent=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  }
  try{
    var ac=knock.ac||(knock.ac=new (window.AudioContext||window.webkitAudioContext)());
    var o=ac.createOscillator(),g=ac.createGain();
    o.type='sine';o.frequency.value=880;
    g.gain.setValueAtTime(.15,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.15);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.16);
  }catch(e){}
}
document.getElementById('muyu').onclick=knock;
document.getElementById('knock').onclick=knock;
document.getElementById('auto').onclick=function(){
  autoOn=!autoOn;
  this.textContent='🤖 自动积德：'+(autoOn?'开':'关');
  if(autoOn){autoTimer=setInterval(knock,400);}else{clearInterval(autoTimer);}
};
document.addEventListener('keydown',function(e){
  if(e.code==='Space'&&document.getElementById('p-muyu').classList.contains('on')){e.preventDefault();knock();}
});
renderMerit();

/* ═══════ 合成 1024 ═══════ */
var SIZE=4,grid=[],score=0,won=false,dead=false;
var TILECOLOR={2:'#1c2330',4:'#22304a',8:'#1f4b38',16:'#2ea043',32:'#3fb950',64:'#d29922',
  128:'#bc4c3d',256:'#f85149',512:'#a371f7',1024:'linear-gradient(135deg,#a371f7,#58a6ff)',2048:'#58a6ff'};
function newGrid(){grid=[];for(var r=0;r<SIZE;r++){grid.push([0,0,0,0]);}}
function emptyCells(){var c=[];for(var r=0;r<SIZE;r++)for(var i=0;i<SIZE;i++)if(!grid[r][i])c.push([r,i]);return c;}
function spawn(){var c=emptyCells();if(!c.length)return;var p=c[Math.floor(Math.random()*c.length)];
  grid[p[0]][p[1]]=Math.random()<0.9?2:4;}
function renderBoard(popCells){
  var b=document.getElementById('board');b.innerHTML='';
  for(var r=0;r<SIZE;r++)for(var i=0;i<SIZE;i++){
    var v=grid[r][i],d=document.createElement('div');
    d.className='cell';
    if(v){
      d.textContent=v;
      var c=TILECOLOR[v]||'#58a6ff';
      if(c.indexOf('linear')===0){d.style.background=c;d.style.color='#fff';}
      else{d.style.background=c;d.style.color=v<=4?'#9da7b3':'#fff';}
      if(popCells&&popCells.some(function(p){return p[0]===r&&p[1]===i}))d.classList.add('pop');
    }
    b.appendChild(d);
  }
  document.getElementById('score').textContent=score;
  document.getElementById('best').textContent=best;
}
function slide(row){
  var arr=row.filter(function(v){return v;}),merged=[],gained=0;
  for(var i=0;i<arr.length-1;i++){
    if(arr[i]===arr[i+1]){arr[i]*=2;gained+=arr[i];merged.push(i);arr.splice(i+1,1);}
  }
  while(arr.length<SIZE)arr.push(0);
  return {row:arr,gained:gained,merged:merged};
}
function move(dir){
  if(dead||!dbReady)return;
  var old=JSON.stringify(grid),gained=0,pops=[];
  var get=function(r,c){return dir===0?grid[r][c]:dir===1?grid[r][SIZE-1-c]:dir===2?grid[c][r]:grid[SIZE-1-c][r];};
  var set=function(r,c,v){if(dir===0)grid[r][c]=v;else if(dir===1)grid[r][SIZE-1-c]=v;else if(dir===2)grid[c][r]=v;else grid[SIZE-1-c][r]=v;};
  for(var i=0;i<SIZE;i++){
    var line=[];for(var j=0;j<SIZE;j++)line.push(get(i,j));
    var res=slide(line);gained+=res.gained;
    for(var j=0;j<SIZE;j++){
      set(i,j,res.row[j]);
      if(res.merged.indexOf(j)>=0){
        if(dir===0)pops.push([i,j]);else if(dir===1)pops.push([i,SIZE-1-j]);
        else if(dir===2)pops.push([j,i]);else pops.push([SIZE-1-j,i]);
      }
    }
  }
  if(JSON.stringify(grid)===old)return;
  score+=gained;
  if(score>best){best=score;queueWrite('UPDATE progress SET best=MAX(best, ?) WHERE id=1',[{type:'integer',value:String(best)}]);}
  spawn();renderBoard(pops);
  if(!won&&grid.some(function(r){return r.indexOf(1024)>=0})){
    won=true;showOver('🎉 合成 1024！功德圆满！');
  }else if(!emptyCells().length&&!canMove()){
    dead=true;showOver('💀 棋盘满了，总分 '+score+'，功德下次再攒');
  }
}
function canMove(){
  for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++){
    if(r<SIZE-1&&grid[r][c]===grid[r+1][c])return true;
    if(c<SIZE-1&&grid[r][c]===grid[r][c+1])return true;
  }return false;
}
function showOver(t){var o=document.getElementById('gover');document.getElementById('goverText').textContent=t;o.classList.add('show');}
function restartGame(){newGrid();score=0;won=false;dead=false;
  document.getElementById('gover').classList.remove('show');
  spawn();spawn();renderBoard();}
document.getElementById('restart').onclick=restartGame;
window.restartGame=restartGame;
document.addEventListener('keydown',function(e){
  if(!document.getElementById('p-g1024').classList.contains('on'))return;
  var map={ArrowLeft:0,ArrowRight:1,ArrowUp:2,ArrowDown:3,a:0,d:1,w:2,s:3,A:0,D:1,W:2,S:3};
  if(map[e.key]!==undefined){e.preventDefault();move(map[e.key]);}
});
var tx=0,ty=0;
var boardEl=document.getElementById('board');
boardEl.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
boardEl.addEventListener('touchend',function(e){
  var dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:0);else move(dy>0?3:2);
},{passive:true});
restartGame();
