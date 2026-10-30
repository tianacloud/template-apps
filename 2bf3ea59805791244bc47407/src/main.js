import css from './style.css?inline';
import layout from './layout.js';
import DATA from './entries.json';
import TIMELINE from './timeline.json';
import {preview,esc} from './ui.js';
const style=document.createElement('style');style.textContent=css;document.head.append(style);
document.title='大理论时代 · 网络文化观察档案';
let observer=null;
const pendingTimers=new Set();
function later(fn,ms){const id=setTimeout(()=>{pendingTimers.delete(id);fn()},ms);pendingTimers.add(id);return id}
function cleanup(){observer?.disconnect();for(const id of pendingTimers)clearTimeout(id);pendingTimers.clear()}
function referenceHTML(t){const links=(t.sources||[]).filter(x=>typeof x.url==='string'&&/^https:\/\//.test(x.url));return links.length?'<div class="card__sources">资料：'+links.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a>`).join(' · ')+'</div>':''}
function cardHTML(t){
  return `
  <article class="card s-${esc(t.school)}" data-school="${esc(t.school)}" id="${esc(t.id)}">
    <div class="card__top">
      <span class="card__id">${esc(t.id)}</span>
      <span class="card__school">${esc(t.schoolName)}</span>
    </div>
    <h3 class="card__name">${esc(t.name)}</h3>
    <div class="card__en">${esc(t.en)}</div>
    <p class="card__one">${esc(t.one)}</p>
    <dl class="card__meta">
      <div><dt>归属资料</dt><dd>${esc(t.founder)}<em>${esc(t.founderNote)}</em></dd></div>
      <div><dt>记录时间</dt><dd>${esc(t.date)}<em>资料场域 ${esc(t.origin)}</em></dd></div>
    </dl>
    <blockquote class="card__quote">${esc(t.quote)}</blockquote>
    <button class="card__toggle" aria-expanded="false">展开档案 <span>＋</span></button>
    <div class="card__body">
      <h4>阅读要点</h4>
      <ul>${t.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
      <h4>公开记录与资料状态</h4>
      <ol>${t.deeds.map(d=>`<li>${esc(d)}</li>`).join('')}</ol>
      <h4>阅读解读</h4>
      <p>${esc(t.twist)}</p>
      <h4>相关用语</h4>
      <div class="tags">${t.legacy.map(l=>`<span>${esc(l)}</span>`).join('')}</div>
      ${referenceHTML(t)}
      ${t.warn ? `<div class="warn"><b>提示</b>${esc(t.warn)}</div>` : ''}
    </div>
  </article>`;
}


function render(){
cleanup();
document.getElementById('app').innerHTML=(preview?'<div class="example-bar"><span>示例体验 · 固定档案内容</span><button id="reset-example" type="button">恢复示例</button></div>':'')+layout;
const tl=document.querySelector('#timeline .tl');
tl.innerHTML=TIMELINE.map(t=>`<div class="tl__item${t.highlight?' hl':''}"><div class="tl__date">${esc(t.date)}</div><div class="tl__t">${esc(t.title)}</div><div class="tl__d">${esc(t.description)}</div></div>`).join('');
const grid=document.getElementById('grid');
grid.innerHTML = DATA.map(cardHTML).join('');

function openCard(card){
  if(card.classList.contains('is-open')) return;
  card.classList.add('is-open');
  const btn = card.querySelector('.card__toggle');
  btn.setAttribute('aria-expanded','true');
  btn.innerHTML = '收起档案 <span>－</span>';
}
function closeCard(card){
  card.classList.remove('is-open');
  const btn = card.querySelector('.card__toggle');
  btn.setAttribute('aria-expanded','false');
  btn.innerHTML = '展开档案 <span>＋</span>';
}

grid.addEventListener('click', e=>{
  const btn = e.target.closest('.card__toggle');
  if(!btn) return;
  const card = btn.closest('.card');
  if(card.classList.contains('is-open')){
    closeCard(card);
  } else {
    openCard(card);
    later(()=>{
      const r = card.getBoundingClientRect();
      if(r.top < 70) card.scrollIntoView({block:'start', behavior:'smooth'});
    }, 120);
  }
});

const filters = document.getElementById('filters');
filters.addEventListener('click', e=>{
  const b = e.target.closest('button');
  if(!b) return;
  filters.querySelectorAll('button').forEach(x=>x.classList.remove('is-on'));
  b.classList.add('is-on');
  const f = b.dataset.f;
  document.querySelectorAll('.card').forEach(c=>{
    c.style.display = (f==='all' || c.dataset.school===f) ? '' : 'none';
  });
});

// 三幕里的 chips → 定位并展开对应卡片
document.querySelectorAll('.chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    const id = ch.dataset.id;
    filters.querySelectorAll('button').forEach(x=>x.classList.remove('is-on'));
    filters.querySelector('button[data-f="all"]').classList.add('is-on');
    document.querySelectorAll('.card').forEach(c=>c.style.display='');
    const card = document.getElementById(id);
    if(!card) return;
    card.classList.add('in');
    openCard(card);
    card.scrollIntoView({block:'start', behavior:'smooth'});
    card.style.transition='box-shadow .3s';
    card.style.boxShadow='0 0 0 3px rgba(176,58,32,.35), 9px 9px 0 var(--paper-2)';
    later(()=>{ card.style.boxShadow=''; }, 1600);
  });
});

observer = new IntersectionObserver(es=>{
  es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); observer.unobserve(en.target); } });
},{threshold:.1});

document.querySelectorAll('.act, .card, .tl__item, .shift__cell, .mech__cell').forEach((el,i)=>{
  el.classList.add('rv');
  el.style.transitionDelay = (i%6)*40 + 'ms';
  observer.observe(el);
});

if(preview)document.getElementById('reset-example').addEventListener('click',()=>{render();window.scrollTo({top:0,behavior:'instant'})});
}
render();
function restoreHash(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return;}if(!DATA.some(t=>t.id===id))return;const card=document.getElementById(id);const btn=card.querySelector('.card__toggle');card.classList.add('is-open','in');card.style.display='';btn.setAttribute('aria-expanded','true');btn.innerHTML='收起档案 <span>－</span>';document.querySelectorAll('#filters button').forEach(b=>b.classList.toggle('is-on',b.dataset.f==='all'));document.querySelectorAll('.card').forEach(c=>c.style.display='');card.scrollIntoView({block:'start'});}
restoreHash();window.addEventListener('hashchange',restoreHash);
