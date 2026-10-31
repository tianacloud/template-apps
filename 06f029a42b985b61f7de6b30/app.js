import { createTianaFetch } from '@tianacloud/serverless';
const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./app.css',import.meta.url);document.head.appendChild(link);
document.body.innerHTML = "\n<div class=\"wrap\">\n  <header>\n    <div class=\"title\">\n      <h1>1024 <b>合成</b></h1>\n      <p>数字合成益智游戏<br>滑动合并，挑战合成 1024</p>\n    </div>\n    <div class=\"scores\">\n      <div class=\"score-box\"><div class=\"label\">得分</div><div class=\"val\" id=\"score\">0</div></div>\n      <div class=\"score-box\"><div class=\"label\">最佳</div><div class=\"val\" id=\"best\">0</div></div>\n    </div>\n  </header>\n\n  <div class=\"bar\">\n    <div class=\"hint\">用 <b>方向键 / WASD</b> 或 <b>手指滑动</b> 移动方块。<br>相同数字相撞合并，目标是 <b>1024</b>！</div>\n    <button class=\"btn\" id=\"newGame\">新游戏</button>\n  </div>\n\n  <div class=\"board\" id=\"board\">\n    <div class=\"grid-bg\" id=\"gridBg\"></div>\n    <div class=\"tiles\" id=\"tiles\"></div>\n    <div class=\"overlay\" id=\"overlay\">\n      <div class=\"big\" id=\"ovTitle\">🎉 合成 1024！</div>\n      <div class=\"sub\" id=\"ovSub\">你完成了这次挑战。</div>\n      <div class=\"row\">\n        <button class=\"btn\" id=\"ovPrimary\">再来一局</button>\n        <button class=\"btn ghost\" id=\"ovSecondary\">继续挑战</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"tag\">\n    合并数字，挑战更高分<br>\n    #1024 合成\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>\n\n";

(function(){
  const SIZE=4, GAP=12;
  const board=document.getElementById('board');
  const gridBg=document.getElementById('gridBg');
  const tilesLayer=document.getElementById('tiles');
  const scoreEl=document.getElementById('score');
  const bestEl=document.getElementById('best');
  const overlay=document.getElementById('overlay');
  const ovTitle=document.getElementById('ovTitle');
  const ovSub=document.getElementById('ovSub');
  const ovPrimary=document.getElementById('ovPrimary');
  const ovSecondary=document.getElementById('ovSecondary');
  const toast=document.getElementById('toast');

  const COLORS={
    1:{bg:'#2d333b',fg:'#c9d1d9'},2:{bg:'#373e47',fg:'#c9d1d9'},
    3:{bg:'#9e6a03',fg:'#fff'},4:{bg:'#bb8009',fg:'#fff'},
    5:{bg:'#db6d28',fg:'#fff'},6:{bg:'#f0883e',fg:'#fff'},
    7:{bg:'#3fb950',fg:'#08230f'},8:{bg:'#56d364',fg:'#08230f'},
    9:{bg:'#2ea043',fg:'#fff'},10:{bg:'#39d353',fg:'#06210f'},
    11:{bg:'#58a6ff',fg:'#06243f'},12:{bg:'#bc8cff',fg:'#1c0c33'}
  };

  let grid, tiles, score, won, over, keepPlaying, idCounter, best;

  // build static background cells
  for(let i=0;i<SIZE*SIZE;i++){
    const c=document.createElement('div'); c.className='grid-cell'; gridBg.appendChild(c);
  }

  best=0;
  let dbPromise;
  async function execute(sql,args=[]){
    if(!dbPromise) dbPromise=(async()=>{const c=await window.tiana.connection(); if(c.sql_api!=='hrana-v3'||typeof window.tiana.auth?.getAccessToken!=='function') throw Error('数据库连接不可用'); return {c,fetch:createTianaFetch({origin:c.origin,auth:window.tiana.auth,requestBodyMode:'buffered'})};})();
    const {c,fetch}=await dbPromise;
    const response=await fetch(`${c.origin}/v3/pipeline`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
    if(!response.ok) throw Error('数据库请求失败');
    const item=(await response.json()).results?.[0]; if(item?.type!=='ok'||item.response?.type!=='execute') throw Error('数据库操作失败'); return item.response.result;
  }
  async function loadBest(){const result=await execute('SELECT score FROM game_best WHERE id=1'); best=Math.max(best,Number(result.rows?.[0]?.[0]?.value||0)); bestEl.textContent=best;}
  loadBest().catch(()=>showToast('最佳分数读取失败，请刷新重试'));

  function cellSize(){ return (tilesLayer.clientWidth - GAP*(SIZE-1))/SIZE; }

  function emptyGrid(){ return Array.from({length:SIZE},()=>Array(SIZE).fill(null)); }

  function showToast(msg){
    toast.textContent=msg; toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t=setTimeout(()=>toast.classList.remove('show'),1400);
  }

  function styleTile(t){
    const e=Math.log2(t.value);
    const col=COLORS[e]||COLORS[12];
    t.inner.style.background=col.bg;
    t.inner.style.color=col.fg;
    const size=cellSize();
    t.el.style.width=size+'px';
    t.el.style.height=size+'px';
    t.el.style.transform='translate('+(t.x*(size+GAP))+'px,'+(t.y*(size+GAP))+'px)';
    const fs=size*(t.value>=1000?0.32:t.value>=100?0.4:t.value>=10?0.46:0.52);
    t.inner.style.fontSize=fs+'px';
  }

  function createEl(t){
    const el=document.createElement('div'); el.className='tile';
    const inner=document.createElement('div'); inner.className='inner';
    inner.textContent=t.value;
    el.appendChild(inner);
    t.el=el; t.inner=inner;
    tilesLayer.appendChild(el);
    styleTile(t);
    requestAnimationFrame(()=>{ el.classList.add('pop'); });
    el.addEventListener('animationend',()=>el.classList.remove('pop','merged'));
  }

  function removeTile(t){
    if(t.el&&t.el.parentNode) t.el.parentNode.removeChild(t.el);
    tiles=tiles.filter(x=>x!==t);
  }

  function addRandomTile(){
    const empties=[];
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++) if(!grid[r][c]) empties.push({r,c});
    if(!empties.length) return;
    const {r,c}=empties[Math.floor(Math.random()*empties.length)];
    const value=Math.random()<0.9?2:4;
    const t={id:++idCounter,value,x:c,y:r,merged:false,isNew:true};
    grid[r][c]=t; tiles.push(t); createEl(t);
  }

  function updateScores(){
    scoreEl.textContent=score;
    if(score>best){ best=score; bestEl.textContent=best; execute('INSERT INTO game_best(id,score) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET score=MAX(score,excluded.score)',[{type:'integer',value:String(best)}]).catch(()=>showToast('最佳分数保存结果未知，请刷新核对'));  }
  }

  const vectors={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
  function within(p){ return p.x>=0&&p.x<SIZE&&p.y>=0&&p.y<SIZE; }
  function buildTraversals(v){
    const t={x:[0,1,2,3],y:[0,1,2,3]};
    if(v.x===1) t.x.reverse();
    if(v.y===1) t.y.reverse();
    return t;
  }
  function findFarthest(cell,v){
    let prev, cur={x:cell.x,y:cell.y};
    do{ prev=cur; cur={x:prev.x+v.x,y:prev.y+v.y}; }
    while(within(cur)&&!grid[cur.y][cur.x]);
    return {farthest:prev, next:within(cur)?cur:null};
  }

  function move(dir){
    if(over) return;
    if(won&&!keepPlaying) return;
    const v=vectors[dir];
    const trav=buildTraversals(v);
    let moved=false;
    tiles.forEach(t=>{ t.merged=false; });

    trav.y.forEach(y=>{
      trav.x.forEach(x=>{
        const tile=grid[y][x];
        if(!tile) return;
        const {farthest,next}=findFarthest({x,y},v);
        if(next && grid[next.y][next.x] && grid[next.y][next.x].value===tile.value && !grid[next.y][next.x].merged){
          const other=grid[next.y][next.x];
          const newVal=tile.value*2;
          grid[y][x]=null;
          tile.x=next.x; tile.y=next.y;
          other.value=newVal; other.merged=true;
          other.inner.textContent=newVal;
          other.el.classList.add('merged');
          tile.inner.textContent='';
          styleTile(tile);
          setTimeout(()=>removeTile(tile),130);
          score+=newVal;
          if(newVal===1024 && !won){ won=true; }
          moved=true;
        } else if(farthest.x!==x || farthest.y!==y){
          grid[y][x]=null;
          tile.x=farthest.x; tile.y=farthest.y;
          grid[farthest.y][farthest.x]=tile;
          styleTile(tile);
          moved=true;
        }
      });
    });

    if(moved){
      addRandomTile();
      updateScores();
      if(won && !keepPlaying){ showOverlay('win'); }
      else if(!movesAvailable()){ over=true; showOverlay('over'); }
    }
  }

  function movesAvailable(){
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      if(!grid[r][c]) return true;
      const v=grid[r][c].value;
      if(c+1<SIZE && grid[r][c+1] && grid[r][c+1].value===v) return true;
      if(r+1<SIZE && grid[r+1][c] && grid[r+1][c].value===v) return true;
    }
    return false;
  }

  function showOverlay(type){
    if(type==='win'){
      ovTitle.textContent='🎉 合成 1024！';
      ovSub.textContent='目标达成！可以继续挑战更大的数字，或开新局。';
      ovPrimary.textContent='再来一局'; ovSecondary.style.display=''; ovSecondary.textContent='继续挑战';
    } else {
      ovTitle.textContent='游戏结束';
      ovSub.textContent='没有可移动的方块了。最终得分 '+score+'。';
      ovPrimary.textContent='再来一局'; ovSecondary.style.display='none';
    }
    overlay.classList.add('show');
  }
  function hideOverlay(){ overlay.classList.remove('show'); }

  function newGame(){
    tilesLayer.innerHTML='';
    grid=emptyGrid(); tiles=[]; score=0; won=false; over=false; keepPlaying=false; idCounter=0;
    hideOverlay(); updateScores();
    addRandomTile(); addRandomTile();
    showToast('新游戏开始');
  }

  // input
  const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
    w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
  window.addEventListener('keydown',e=>{
    const dir=keyMap[e.key];
    if(dir){ e.preventDefault(); move(dir); }
  });

  let tStart=null;
  board.addEventListener('touchstart',e=>{ const t=e.touches[0]; tStart={x:t.clientX,y:t.clientY}; },{passive:true});
  board.addEventListener('touchend',e=>{
    if(!tStart) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-tStart.x, dy=t.clientY-tStart.y;
    const ax=Math.abs(dx), ay=Math.abs(dy);
    if(Math.max(ax,ay)<24){ tStart=null; return; }
    if(ax>ay) move(dx>0?'right':'left');
    else move(dy>0?'down':'up');
    tStart=null;
  },{passive:true});

  document.getElementById('newGame').addEventListener('click',newGame);
  ovPrimary.addEventListener('click',()=>{ hideOverlay(); newGame(); });
  ovSecondary.addEventListener('click',()=>{ keepPlaying=true; hideOverlay(); showToast('继续挑战，冲 2048！'); });

  window.addEventListener('resize',()=>{ tiles.forEach(styleTile); });

  newGame();
})();
