export async function mount(root, { files } = {}) {
const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("./app.css", import.meta.url); document.head.appendChild(link);
root.innerHTML="\n<header>\n  <h1>🍳 离线家常菜单</h1>\n  <p>搜索菜名 / 食材 · 查看做法 · 一键随机抽菜决定吃什么 · 菜谱随应用安装</p>\n</header>\n<div class=\"wrap\">\n  <div class=\"toolbar\">\n    <div class=\"search\">\n      <input id=\"q\" type=\"text\" placeholder=\"搜索菜名或食材，如：番茄、鸡翅、排骨、清淡…\">\n      <button class=\"btn btn-primary\">🎲 不知道吃什么？抽一道</button>\n    </div>\n    <div class=\"chips\" id=\"chips\"></div>\n    <div class=\"count\" id=\"count\"></div>\n  </div>\n  <div class=\"grid\" id=\"grid\"></div>\n</div>\n<div class=\"overlay\" id=\"detail\">\n  <div class=\"sheet\">\n    <div class=\"sheet-head\"><h2 id=\"d-name\"></h2><button class=\"close\">×</button></div>\n    <div class=\"sheet-body\" id=\"d-body\"></div>\n  </div>\n</div>\n<div class=\"overlay\" id=\"lucky\">\n  <div class=\"sheet\" style=\"max-width:420px\">\n    <div class=\"sheet-body lucky-box\">\n      <div class=\"spin\" id=\"lucky-icon\">🍽️</div>\n      <div class=\"tag2\" id=\"lucky-tag\">命运正在搅拌锅中…</div>\n      <h2 id=\"lucky-name\">？？？</h2>\n      <div id=\"lucky-meta\" style=\"color:var(--muted);font-size:13px\"></div>\n      <div class=\"lucky-actions\">\n        <button class=\"btn btn-ghost\">🔁 换一道</button>\n        <button class=\"btn btn-primary\" id=\"lucky-view\" style=\"display:none\">查看做法</button>\n      </div>\n    </div>\n  </div>\n</div>\n<footer>共 <span id=\"total\"></span> 道家常菜 · 数据来源于公网家常菜谱，随应用安装。</footer>\n";


let DISHES;
try {
  if (!files) throw new Error('文件服务不可用');
  const response = await files.get('template-assets/recipes.json');
  if (!response.ok) throw new Error('菜谱读取失败');
  DISHES = await response.json();
  if (!Array.isArray(DISHES) || !DISHES.length) throw new Error('菜谱内容为空');
} catch (error) {
  root.innerHTML = '<div role="alert" style="padding:2rem">菜谱加载失败，请刷新页面重试。</div>';
  return;
}

const CATS = ["全部","荤菜","素菜","汤","主食"];
let curCat = "全部";
let lastLucky = null;

function render(){
  const q = document.getElementById('q').value.trim().toLowerCase();
  const grid = document.getElementById('grid');
  const list = DISHES.filter(d=>{
    if(curCat!=="全部" && d.cat!==curCat) return false;
    if(!q) return true;
    const hay = (d.name + " " + d.cat + " " + d.ing.join(" ")).toLowerCase();
    return hay.includes(q);
  });
  document.getElementById('count').textContent = `共找到 ${list.length} 道菜`;
  document.getElementById('total').textContent = DISHES.length;
  if(list.length===0){
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">没有匹配的菜，换个关键词试试～</div>`;
    return;
  }
  grid.innerHTML = list.map(d=>`
    <div class="dish">
      <span class="tag">${d.cat}</span>
      <span class="name">${d.name}</span>
      <span class="meta">⏱ ${d.time} · ${d.level}</span>
    </div>`).join("");
}
function buildChips(){
  document.getElementById('chips').innerHTML = CATS.map(c=>
    `<span class="chip ${c===curCat?'active':''}">${c}</span>`).join("");
}
function setCat(c){curCat=c;buildChips();render();}
function openDetail(name){
  const d = DISHES.find(x=>x.name===name);
  if(!d) return;
  document.getElementById('d-name').textContent = d.name;
  document.getElementById('d-body').innerHTML = `
    <span class="badge">${d.cat} · 耗时 ${d.time} · 难度 ${d.level}</span>
    <div class="sec-title">🧺 所需食材</div>
    <div class="ing">${d.ing.map(i=>`<span>${i}</span>`).join("")}</div>
    <div class="sec-title">👩‍🍳 做法步骤</div>
    <ol class="steps">${d.steps.map(s=>`<li>${s}</li>`).join("")}</ol>
    ${d.tips?`<div class="tips">💡 小贴士：${d.tips}</div>`:""}
  `;
  document.getElementById('detail').classList.add('show');
}
function closeDetail(){document.getElementById('detail').classList.remove('show');}
let spinTimer=null;
function luckyStart(){ luckyAgain(); document.getElementById('lucky').classList.add('show'); }
function luckyAgain(){
  const icon = document.getElementById('lucky-icon');
  const nameEl = document.getElementById('lucky-name');
  const tagEl = document.getElementById('lucky-tag');
  const metaEl = document.getElementById('lucky-meta');
  const viewBtn = document.getElementById('lucky-view');
  viewBtn.style.display='none';
  metaEl.textContent='';
  icon.classList.add('spin-go');
  tagEl.textContent='命运正在搅拌锅中…';
  nameEl.textContent='？？？';
  const pool = DISHES;
  let i=0;
  clearInterval(spinTimer);
  spinTimer = setInterval(()=>{
    const r = pool[Math.floor(Math.random()*pool.length)];
    nameEl.textContent = r.name;
    i++;
    if(i>16){
      clearInterval(spinTimer);
      icon.classList.remove('spin-go');
      const pick = pool[Math.floor(Math.random()*pool.length)];
      lastLucky = pick;
      nameEl.textContent = pick.name;
      tagEl.textContent = `抽中分类：${pick.cat}`;
      metaEl.textContent = `⏱ ${pick.time} · 难度 ${pick.level}`;
      viewBtn.style.display='inline-block';
    }
  },70);
}
function luckyView(){ closeLucky(); if(lastLucky) openDetail(lastLucky.name); }
function closeLucky(){document.getElementById('lucky').classList.remove('show');}
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){closeDetail();closeLucky();} });
buildChips();
render();

Object.assign(window,{render,setCat,openDetail,closeDetail,luckyStart,luckyAgain,luckyView,closeLucky});

document.getElementById('q').addEventListener('input',render);
document.getElementById('chips').addEventListener('click',e=>{const chip=e.target.closest('.chip');if(chip)setCat(chip.textContent)});
document.getElementById('grid').addEventListener('click',e=>{const dish=e.target.closest('.dish');if(dish)openDetail(dish.querySelector('.name').textContent)});
document.querySelector('.btn-primary').addEventListener('click',luckyStart);
document.querySelector('#detail .close').addEventListener('click',closeDetail);
document.getElementById('detail').addEventListener('click',e=>{if(e.target.id==='detail')closeDetail()});
document.getElementById('lucky').addEventListener('click',e=>{if(e.target.id==='lucky')closeLucky()});
document.querySelector('#lucky .btn-ghost').addEventListener('click',luckyAgain);
document.getElementById('lucky-view').addEventListener('click',luckyView);

return () => clearInterval(spinTimer);
}
