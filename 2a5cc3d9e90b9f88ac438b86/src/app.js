export async function mount(root, { files }) {
let data;
try { const response = await files.get("template-assets/data.json"); if (!response.ok) throw new Error("数据读取失败"); data = await response.json(); } catch { root.textContent = "法典数据暂时无法加载，请刷新后重试。"; return; }
const { ARTICLES, QA, HOT } = data;
const css=document.createElement("link");css.rel="stylesheet";css.href=new URL("./app.css",import.meta.url);document.head.append(css);
root.innerHTML="\n\n<header>\n  <div class=\"wrap hd\">\n    <div class=\"seal\">民</div>\n    <div class=\"brand\">\n      <h1>中华人民共和国民法典 · 静态知识库</h1>\n      <p>全文 <b>1260</b> 条 · 问答卡 <b id=\"statQa\">36</b> 张 · 热点映射 <b id=\"statHot\">22</b> 组 ｜ 2021.1.1 施行</p>\n    </div>\n    <div class=\"hd-right\">\n      <div class=\"searchbox\">\n        <svg class=\"ico\" fill=\"none\" height=\"15\" stroke=\"#9fb6cd\" stroke-width=\"2.2\" viewBox=\"0 0 24 24\" width=\"15\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-4-4\"/></svg>\n        <input autocomplete=\"off\" id=\"q\" placeholder=\"搜问题、关键词或法条号…\">\n        <span class=\"kbd\">↵</span>\n      </div>\n    </div>\n  </div>\n  <nav class=\"tabs wrap\" id=\"tabs\">\n    <button class=\"on\" data-v=\"qa\">问答卡片<span class=\"count\" id=\"cQa\"></span></button>\n    <button data-v=\"hot\">热点映射<span class=\"count\" id=\"cHot\"></span></button>\n    <button data-v=\"code\">法典全文<span class=\"count\">1260</span></button>\n    <button data-v=\"tool\">辅助工具</button>\n  </nav>\n</header>\n\n<main class=\"wrap\">\n  <div class=\"hint\">\n    <div><b>数据说明</b>：本页面为纯静态知识库，全部法条文本来自《中华人民共和国民法典》原文（共 1260 条），\n    问答与热点卡片中的法条摘录均为程序化截取，未作改写。内容仅供参考，不构成法律意见；具体争议请结合案情咨询执业律师或拨打 12348 公共法律服务热线。</div>\n  </div>\n\n  <!-- 问答 -->\n  <section id=\"v-qa\">\n    <div class=\"chips\" id=\"chipsQa\"></div>\n    <div class=\"grid\" id=\"gridQa\"></div>\n  </section>\n\n  <!-- 热点 -->\n  <section id=\"v-hot\" style=\"display:none\">\n    <div class=\"sec-title\"><h2>社会热点纠纷 → 法条速查</h2><span>热度为近两年司法实践关注度分级，5 为最高</span></div>\n    <div class=\"grid\" id=\"gridHot\"></div>\n  </section>\n\n  <!-- 全文 -->\n  <section id=\"v-code\" style=\"display:none\">\n    <div class=\"code-layout\">\n      <aside class=\"side\" id=\"side\"></aside>\n      <div class=\"codepanel\">\n        <div class=\"code-bar\">\n          <input id=\"qc\" placeholder=\"在 1260 条全文中检索，如「居住权」「高空抛物」「1077」\">\n          <span class=\"stat\" id=\"statCode\"></span>\n        </div>\n        <div id=\"listCode\"></div>\n      </div>\n    </div>\n  </section>\n\n  <!-- 工具 -->\n  <section id=\"v-tool\" style=\"display:none\">\n    <div class=\"sec-title\"><h2>诉讼时效计算器</h2><span>依据民法典第188条、第201条、第202条</span></div>\n    <div class=\"tool\">\n      <h3>三年普通诉讼时效 / 二十年最长保护期</h3>\n      <p class=\"d\">输入「知道或者应当知道权利受到损害以及义务人」之日，计算时效届满日。</p>\n      <div class=\"field\">\n        <label>起算日（知悉之日）</label>\n        <input id=\"d0\" type=\"date\">\n      </div>\n      <button class=\"go\" id=\"calc\">计算</button>\n      <div class=\"out\" id=\"out\">\n        <div class=\"kv\"><span>三年时效届满日</span><b id=\"r3\">—</b></div>\n        <div class=\"kv\"><span>距届满日剩余</span><b id=\"rd\">—</b></div>\n        <div class=\"kv\"><span>二十年最长保护期至</span><b id=\"r20\">—</b></div>\n        <p class=\"tip\">\n          计算规则：期间自起算日的次日开始计算（第201条），到期月的对应日为期间最后一日，无对应日的以月末日为最后一日（第202条）。<br>\n          提示：向义务人提出履行请求、义务人同意履行、提起诉讼或申请仲裁均可导致时效中断并重新计算（第195条）；停止侵害、排除妨碍、消除危险及请求支付抚养费、赡养费等请求权不适用诉讼时效（第196条）。\n        </p>\n      </div>\n    </div>\n  </section>\n</main>\n\n<footer>\n  <div class=\"wrap\">\n    <b>中华人民共和国民法典</b>（2020年5月28日第十三届全国人民代表大会第三次会议通过，2021年1月1日起施行）<br>\n    静态知识库 · 法条文本以官方公布版本为准\n  </div>\n</footer>\n\n<div class=\"ov\" id=\"ov\">\n  <div class=\"ovbox\">\n    <div class=\"ovhead\"><span id=\"ovTitle\">检索结果</span><span>ESC 关闭</span></div>\n    <div id=\"ovBody\"></div>\n  </div>\n</div>\n\n";

const ART = {}; ARTICLES.forEach(a => ART[a.n] = a);

/* ---------------- 基础 ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CN = '零一二三四五六七八九';
function num2cn(n){
  if(n<10) return CN[n];
  const small=(x,lead)=>{ if(x<10) return CN[x]; const t=Math.floor(x/10),o=x%10;
    return (t===1&&!lead?'十':CN[t]+'十')+(o?CN[o]:''); };
  if(n<100) return small(n);
  if(n<1000){ const s=CN[Math.floor(n/100)]+'百',r=n%100; if(!r) return s; if(r<10) return s+'零'+CN[r]; return s+small(r,true); }
  const s=CN[Math.floor(n/1000)]+'千',r=n%1000; if(!r) return s;
  if(r<100) return s+'零'+(r<10?CN[r]:small(r,true));
  return s+num2cn(r);
}
const CNMAP={'零':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9};
function parseQueryNum(q){
  if(/^\d{1,4}$/.test(q)) { const n=+q; return ART[n]?n:null; }
  const m=q.replace(/[条\s]/g,'');
  if(/^第?[零一二三四五六七八九十百千]+$/.test(m)){ const a=ARTICLES.find(x=>x.c===m||x.c.replace('条','')===m); return a?a.n:null; }
  return null;
}
function artBtn(n){
  const a=ART[n]; if(!a) return '';
  return `<span class="no" data-art="${n}">${esc(a.c)}</span>`;
}
function hl(text,kw){
  if(!kw) return esc(text);
  const i=text.indexOf(kw); if(i<0) return esc(text);
  return esc(text.slice(0,i))+'<mark>'+esc(kw)+'</mark>'+esc(text.slice(i+kw.length));
}

/* ---------------- Tab ---------------- */
function show(v){
  ['qa','hot','code','tool'].forEach(k=>{ $('#v-'+k).style.display = k===v?'':'none'; });
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on', b.dataset.v===v));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>show(b.dataset.v));

/* ---------------- 问答 ---------------- */
let curCat='全部';
function renderChips(){
  const cats=['全部',...new Set(QA.map(q=>q.category))];
  $('#chipsQa').innerHTML=cats.map(c=>{
    const n=c==='全部'?QA.length:QA.filter(q=>q.category===c).length;
    return `<button class="chip${c===curCat?' on':''}" data-cat="${c}">${c} · ${n}</button>`;
  }).join('');
  $('#chipsQa').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{curCat=b.dataset.cat;renderChips();renderQA();});
}
function renderQA(){
  const list = curCat==='全部'?QA:QA.filter(q=>q.category===curCat);
  $('#gridQa').innerHTML = list.map((q,i)=>{
    const basis=q.legal_basis.map(b=>`<div class="item">${artBtn(+b.article)}<span class="txt">${esc(b.content)}</span></div>`).join('');
    return `<article class="card" id="qa-${q.id}">
      <div class="top"><span class="badge c-${q.category}">${q.category}</span>
        <span class="kw" style="margin:0">${q.keywords.slice(0,2).map(k=>`<em>${esc(k)}</em>`).join('')}</span></div>
      <h3>${esc(q.question)}</h3>
      <p class="sum">${esc(q.answer_summary)}</p>
      <div class="more">
        <button data-toggle="${q.id}">法律依据与实务建议 <span style="font-size:10px">▾</span></button>
        <div class="body">
          <div class="law"><div class="t">法条依据（原文摘录）</div>${basis}</div>
          <ul class="adv">${q.practical_advice.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>
          ${q.risk_warning?`<div class="warn">⚠ ${esc(q.risk_warning)}</div>`:''}
          ${q.related_tool?`<button class="toolbtn" data-tool="1">🔗 打开诉讼时效计算器</button>`:''}
        </div>
      </div>
    </article>`;
  }).join('');
  $('#gridQa').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{
    b.closest('.card').classList.toggle('open');
    b.querySelector('span').textContent = b.closest('.card').classList.contains('open')?'▴':'▾';
  });
  $('#gridQa').querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>show('tool'));
  bindArtBtns($('#gridQa'));
}
function bindArtBtns(root){
  root.querySelectorAll('[data-art]').forEach(el=>el.onclick=e=>{ e.stopPropagation(); openArticle(+el.dataset.art); });
}

/* ---------------- 热点 ---------------- */
function renderHot(){
  const sorted=[...HOT].sort((a,b)=>b.heat_level-a.heat_level);
  $('#gridHot').innerHTML=sorted.map(h=>`
    <article class="card hot-card">
      <h3>${esc(h.hotspot_keyword)}
        <span class="heat">${[1,2,3,4,5].map(i=>`<i class="${i<=h.heat_level?'f':''}"></i>`).join('')}</span></h3>
      <p class="ex">${esc(h.brief_explanation)}</p>
      <p class="sc">${esc(h.typical_scenario)}</p>
      <div class="arts">${h.primary_articles.map((n,i)=>`<span class="art-tag" data-art="${n}">${i===0?'★ ':''}${esc(ART[n]?ART[n].c:'第'+num2cn(+n)+'条')}</span>`).join('')}</div>
      ${h.update_note?`<div class="note">📌 ${esc(h.update_note)}</div>`:''}
    </article>`).join('');
  bindArtBtns($('#gridHot'));
}

/* ---------------- 全文 ---------------- */
let curBian='', curZhang='', curKw='';
function renderSide(){
  const bians=[...new Set(ARTICLES.map(a=>a.b))];
  let h=`<div class="b${curBian===''?' on':''}" data-b="">全部条文<span class="n">1260</span></div>`;
  bians.forEach(b=>{
    const items=ARTICLES.filter(a=>a.b===b);
    const zhang=[...new Set(items.map(a=>a.z))];
    h+=`<div class="b${curBian===b?' on':''}" data-b="${esc(b)}">${esc(b)}<span class="n">${items.length}</span></div>`;
    if(curBian===b){
      const fens=[...new Set(items.map(a=>a.f).filter(Boolean))];
      if(fens.length){
        fens.forEach(f=>{
          h+=`<div class="f">${esc(f)}</div>`;
          [...new Set(items.filter(a=>a.f===f).map(a=>a.z))].forEach(z=>{
            h+=`<div class="z${curZhang===z?' on':''}" data-z="${esc(z)}">${esc(z)}</div>`;
          });
        });
      } else {
        zhang.forEach(z=>{ h+=`<div class="z${curZhang===z?' on':''}" data-z="${esc(z)}">${esc(z)}</div>`; });
      }
    }
  });
  $('#side').innerHTML=h;
  $('#side').querySelectorAll('.b').forEach(el=>el.onclick=()=>{curBian=el.dataset.b;curZhang='';renderSide();renderCode();});
  $('#side').querySelectorAll('.z').forEach(el=>el.onclick=()=>{curZhang=el.dataset.z;renderSide();renderCode();});
}
function renderCode(){
  let list=ARTICLES;
  if(curBian) list=list.filter(a=>a.b===curBian);
  if(curZhang) list=list.filter(a=>a.z===curZhang);
  if(curKw){
    const kw=curKw.trim(), n=parseQueryNum(kw);
    list = n ? list.filter(a=>a.n===n) : list.filter(a=>a.t.includes(kw)||a.c.includes(kw));
  }
  $('#statCode').textContent=`${list.length} 条`;
  $('#listCode').innerHTML = list.length? list.map(a=>`
    <div class="art" id="art-${a.n}">
      <div class="h"><span class="c">${esc(a.c)}</span>
        <span class="crumb">${esc(a.b)}${a.z?' · '+esc(a.z):''}${a.j?' · '+esc(a.j):''}</span>
        <button class="cp" data-cp="${a.n}">复制</button></div>
      <p>${curKw?hl(a.t,parseQueryNum(curKw)?'':curKw):esc(a.t)}</p>
    </div>`).join('') : `<div class="empty">没有匹配的条文，试试其他关键词。</div>`;
  $('#listCode').querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{
    const a=ART[+b.dataset.cp];
    navigator.clipboard.writeText(a.c+'\n'+a.t).then(()=>{b.textContent='已复制';setTimeout(()=>b.textContent='复制',1200);});
  });
}
function openArticle(n){
  if(!ART[n]) return;
  closeOv();
  curBian='';curZhang='';curKw='';$('#qc').value='';
  renderSide();renderCode();
  show('code');
  setTimeout(()=>{
    const el=document.getElementById('art-'+n);
    if(el){ el.scrollIntoView({block:'center',behavior:'smooth'}); el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),2200); }
  },80);
}

/* ---------------- 全局检索 ---------------- */
function search(kw){
  kw=kw.trim();
  if(!kw) return;
  const n=parseQueryNum(kw);
  const qa=QA.filter(q=>q.question.includes(kw)||q.answer_summary.includes(kw)||q.keywords.some(k=>k.includes(kw))||q.legal_basis.some(b=>b.article===kw));
  const hot=HOT.filter(h=>h.hotspot_keyword.includes(kw)||h.brief_explanation.includes(kw)||h.typical_scenario.includes(kw));
  const arts=n?[ART[n]]:ARTICLES.filter(a=>a.t.includes(kw)).slice(0,8);
  let h='';
  if(qa.length){
    h+=`<div class="grp"><div class="gt">问答卡片 · ${qa.length}</div>`;
    h+=qa.slice(0,6).map(q=>`<div class="ri" data-go="qa:${q.id}"><span class="tag">${q.category}</span><div><div>${hl(q.question,kw)}</div><div class="s">${esc(q.answer_summary)}</div></div></div>`).join('');
    h+='</div>';
  }
  if(hot.length){
    h+=`<div class="grp"><div class="gt">热点映射 · ${hot.length}</div>`;
    h+=hot.slice(0,6).map(x=>`<div class="ri" data-go="hot"><span class="tag">热度${x.heat_level}</span><div><div>${hl(x.hotspot_keyword,kw)}</div><div class="s">${esc(x.brief_explanation)}</div></div></div>`).join('');
    h+='</div>';
  }
  if(arts.length){
    h+=`<div class="grp"><div class="gt">法典条文 · ${n?1:arts.length}</div>`;
    h+=arts.map(a=>`<div class="ri" data-go="art:${a.n}"><span class="tag">${esc(a.c)}</span><div><div class="s" style="color:#1c2f45">${hl(a.t.slice(0,86),kw)}${a.t.length>86?'…':''}</div></div></div>`).join('');
    h+='</div>';
  }
  if(!h) h=`<div class="empty" style="border:0">未找到「${esc(kw)}」相关内容。试试「彩礼」「居住权」「1077」。</div>`;
  $('#ovTitle').textContent=`检索「${kw}」`;
  $('#ovBody').innerHTML=h;
  $('#ovBody').querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{
    const v=el.dataset.go;
    if(v.startsWith('art:')) openArticle(+v.split(':')[1]);
    else if(v.startsWith('qa:')){ closeOv(); show('qa'); curCat='全部'; renderChips(); renderQA();
      setTimeout(()=>{ const c=document.getElementById('qa-'+v.split(':')[1]); if(c){c.classList.add('open');c.scrollIntoView({block:'center',behavior:'smooth'});} },60); }
    else { closeOv(); show('hot'); }
  });
  $('#ov').classList.add('on');
}
function closeOv(){ $('#ov').classList.remove('on'); }
let tmr;
$('#q').addEventListener('input',e=>{
  clearTimeout(tmr); const v=e.target.value;
  if(!v.trim()){ closeOv(); return; }
  tmr=setTimeout(()=>search(v),260);
});
$('#q').addEventListener('keydown',e=>{
  if(e.key==='Enter'){ e.preventDefault(); search(e.target.value); }
  if(e.key==='Escape') closeOv();
});
$('#ov').addEventListener('click',e=>{ if(e.target.id==='ov') closeOv(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeOv(); });
$('#qc').addEventListener('input',e=>{ curKw=e.target.value; renderCode(); });

/* ---------------- 时效计算器 ---------------- */
const pad=x=>String(x).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}年${pad(d.getMonth()+1)}月${pad(d.getDate())}日`;
$('#calc').onclick=()=>{
  const v=$('#d0').value;
  if(!v){ alert('请先选择起算日'); return; }
  const [y,m,d]=v.split('-').map(Number);
  const base=new Date(y,m-1,d);
  const anniversary = years => new Date(y+years,m-1,Math.min(d,new Date(y+years,m,0).getDate()));
  const end3=anniversary(3);
  const end20=anniversary(20);
  const today=new Date(); today.setHours(0,0,0,0);
  const days=Math.round((end3-today)/86400000);
  $('#r3').textContent=fmt(end3);
  const rd=$('#rd');
  if(days<0){ rd.textContent=`已逾期 ${-days} 天`; rd.className='hot'; }
  else { rd.textContent=`${days} 天`; rd.className=''; }
  $('#r20').textContent=fmt(end20);
  $('#out').classList.add('on');
};
const td=new Date();
$('#d0').value=`${td.getFullYear()}-${pad(td.getMonth()+1)}-${pad(td.getDate())}`;

/* ---------------- init ---------------- */
$('#statQa').textContent=QA.length; $('#statHot').textContent=HOT.length;
$('#cQa').textContent=QA.length; $('#cHot').textContent=HOT.length;
renderChips(); renderQA(); renderHot(); renderSide(); renderCode();

}
