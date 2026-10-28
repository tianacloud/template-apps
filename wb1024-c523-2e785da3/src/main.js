import markup from './markup.js';
import css from './style.css?inline';
import { sql } from './db.js';
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
document.querySelector('#app').outerHTML = markup;
/* ═══════════════════════════════════════════════════════
   一念之间 · 内容层
   五关＝念学五段法（识念·理念·御念·融念·授念）
   提问全部白话，不出现术语；术语只写在「关于」里。
   ═══════════════════════════════════════════════════════ */

const GATES = [
  /* ── 一 · 识念：把模糊的难受，逼成一个具体的点 ── */
  {
    key: 'shi',
    idx: '第一关',
    name: '识念',
    q: '这件事里，你最在意的，是哪一点？',
    hint: '别急着说「我很难受」。难受底下，通常压着一个更具体的东西。',
    type: 'choice',
    multi: false,
    options: [
      '我被否定了——好像连带我这个人一起',
      '我白费了力气——那几天的时间回不来了',
      '别人会怎么看我——一想到这个就坐不住',
      '说不清，就是堵在那儿'
    ],
    custom: true,
    customHint: '也可以自己写一句'
  },

  /* ── 二 · 理念：事实与解释，切开 ── */
  {
    key: 'li',
    idx: '第二关',
    name: '理念',
    q: '把它拆成两半：哪些是发生的事，哪些是你加的解释？',
    hint: '「方案被否」是发生的事；「他否定我这个人」是你加的解释。这一刀切下去，很多人会先松一口气。',
    type: 'split'
  },

  /* ── 三 · 御念：划界，力气只花在能动的地方 ── */
  {
    key: 'yu',
    idx: '第三关',
    name: '御念',
    q: '这些里，哪些是你真能动的？',
    hint: '能动的研究它，动不了的先放下。放下不是认输，是把力气留给自己。',
    type: 'choice',
    multi: true,
    options: [
      '把被否的理由一条条问清楚',
      '改一版，下次再提',
      '找一个人把事情说开',
      '换个方式证明自己',
      '先什么都不做，睡一觉',
      '让他改变主意',
      '让别人别那么想我'
    ],
    custom: true,
    customHint: '还有别的能动的？'
  },

  /* ── 四 · 融念：拉长时间，看它还剩下什么 ── */
  {
    key: 'rong',
    idx: '第四关',
    name: '融念',
    q: '三年后回看这件事，会剩下什么？',
    hint: '现在它占满你整个世界。三年后的你，站在别的地方看它。',
    type: 'choice',
    multi: false,
    options: [
      '会剩下一个教训，具体是什么还说不上',
      '会剩下一点不甘，偶尔想起来还刺一下',
      '什么都不剩，连细节都记不清了',
      '会剩下一个转机——只是现在看不出来'
    ],
    custom: true,
    customHint: '或者，你想到别的'
  },

  /* ── 五 · 授念：落到明天的一个动作 ── */
  {
    key: 'shou',
    idx: '第五关',
    name: '授念',
    q: '明天你能做的一个动作，是什么？',
    hint: '要小到不可能失败：具体到几点、做什么、做多久，不超过十五分钟。',
    type: 'input',
    placeholder: '例：明早九点，找组长问一句「哪一条最需要改」，听他把话讲完再走。',
    minLen: 8
  }
];

/* ── 收束语：按第四关的选择分流 ── */
const CLOSINGS = {
  0: '看清一件事的代价，常常比这件事本身贵。',
  1: '不甘是还没熄的火。别急着扑灭它，也别让它烧着自己。',
  2: '会过去的。这句不是安慰，是事实。',
  3: '有些事当时是坎，回头看是门。',
  def: '记下了。明天做那一件事，就够了。'
};

/* ── 共鸣标签：第一关的四个选项，即是「同类」的划分 ──
   只上传「日期 + 标签索引 + 匿名指纹」，原话不出本机。            */
const TAGS = ['被否定', '白费了力气', '怕别人怎么看', '说不清地堵着'];

/* 文案分档：数字小的时候不装 */
function echoText(n, tag) {
  const t = TAGS[tag] || '这件事';
  if (n <= 0) return '今天你是第一个，把它写下来的人。';
  if (n === 1) return `今天还有 1 个人，也在为「${t}」难受。`;
  if (n === 2) return `今天还有 2 个人，也在为「${t}」难受。`;
  return `过去七天，有 ${n} 个人也在为「${t}」难受。`;
}

/* ── 众生相：一天一题，按日期轮换 ── */
const CROWD = [
  {
    q: '你最近一次内耗，其实是在争什么？',
    opts: ['争一个「被看见」', '争一个「我没错」', '争一个「别被落下」', '说不清，就是累']
  },
  {
    q: '你最近一次想发火，是因为什么？',
    opts: ['被当众否定', '说了没人听', '明明不是我的错', '累到没有余量了']
  },
  {
    q: '今天你最想躲开的，是什么？',
    opts: ['一个会', '一个人', '一件拖了很久的事', '一个必须做的决定']
  },
  {
    q: '你最近一次说「算了」，是在哪一步？',
    opts: ['还没开始就算了', '做了一半就停了', '快成了却撒手', '成了以后觉得没意思']
  },
  {
    q: '你最近一次睡不着，脑子里转的是什么？',
    opts: ['明天要做的事', '今天说错的一句话', '钱', '说不清的一团']
  },
  {
    q: '你最近一次羡慕别人，羡慕的是什么？',
    opts: ['他的位置', '他的从容', '他的选择权', '有人站在他那边']
  },
  {
    q: '你最近一次觉得「值了」，是因为什么？',
    opts: ['有人认真听我说完', '做完了一件小事', '帮到了一个人', '终于不用解释自己']
  }
];

/* ── 关于页文案（写在文末，给愿意深挖的人） ── */
const ABOUT = {
  title: '关于这五关',
  body: `五关不是我们发明的。
识念、理念、御念、融念、授念——这套说法叫「念学」，是一个人写给自己的思维方法，
以阳明心学为体，以矛盾论、实践论、达利欧的原则为印证。

我们只是把它翻译成了五个人话问题：
你真正在意什么 · 哪部分是事实 · 哪些你动得了 · 三年后还剩什么 · 明天做什么。

不需要懂念学，走完就是一次完整的练习。
也不需要相信什么，做完那一件小事，比相信什么都强。`
};

/* ── 工具 ── */
const cloud = true;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dayNo = () => { const d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); };
const CN_DATE = d => `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;

function toast(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── 场景切换 ── */
function go(scene) {
  $$('.scene').forEach(s => s.classList.toggle('active', s.dataset.scene === scene));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (scene === 'crowd') initCrowd();
  if (scene === 'archive') renderArchive();
}

/* ── 状态 ── */
const S = { step: 0, seed: '', ans: {} };
const ARCH_KEY = 'yinian:archive';
const DRAFT_KEY = 'yinian:draft';
const UID_KEY = 'yinian:uid';

/* 匿名指纹：只用来防重复计数，不含任何身份信息 */
function getUid() {
  try {
    let v = localStorage.getItem(UID_KEY);
    if (!v) {
      v = (crypto.randomUUID ? crypto.randomUUID()
        : 'u' + Date.now() + Math.random().toString(36).slice(2));
      localStorage.setItem(UID_KEY, v);
    }
    return v;
  } catch (e) { return 'anon'; }
}

function dateMinus(days) {
  const d = new Date(); d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function saveDraft() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      step: S.step, seed: S.seed, ans: S.ans, t: Date.now()
    }));
  } catch (e) {}
}
function clearDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }

document.addEventListener('click', e => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) go(goBtn.dataset.go);
});

/* ═════════════ 入口 ═════════════ */
const seedEl = $('#seed'), startBtn = $('#startBtn');
seedEl.addEventListener('input', () => {
  startBtn.disabled = seedEl.value.trim().length < 4;
});
startBtn.addEventListener('click', () => {
  S.seed = seedEl.value.trim();
  S.step = 0; S.ans = {};
  renderGate();
  go('gate');
});
$('#againBtn')?.addEventListener('click', () => {
  seedEl.value = ''; startBtn.disabled = true;
  S.step = 0; S.ans = {};
  go('home');
});

/* ═════════════ 五关 ═════════════ */
const progressEl = $('#progress');
GATES.forEach(() => progressEl.appendChild(document.createElement('i')));

function renderGate() {
  const g = GATES[S.step];
  $$('#progress i').forEach((el, i) => {
    el.className = i < S.step ? 'done' : (i === S.step ? 'on' : '');
  });
  $('#gateIdx').textContent = g.idx;
  $('#gateName').textContent = g.name;
  $('#gateQ').textContent = g.q;
  $('#gateHint').textContent = g.hint || '';

  const body = $('#gateBody');
  body.innerHTML = '';
  $('#gateBack').style.visibility = S.step === 0 ? 'hidden' : 'visible';
  $('#gateNext').textContent = S.step === GATES.length - 1 ? '生成一念卡' : '下一关';

  if (g.type === 'choice') renderChoice(g, body);
  if (g.type === 'split') renderSplit(g, body);
  if (g.type === 'input') renderInput(g, body);

  checkGate();
}

function renderChoice(g, body) {
  const wrap = document.createElement('div');
  wrap.className = 'opts';
  const cur = S.ans[g.key];
  const curArr = Array.isArray(cur) ? cur : (cur ? [cur] : []);

  g.options.forEach((text, i) => {
    const b = document.createElement('button');
    b.className = 'opt' + (curArr.includes(text) ? ' sel' : '');
    b.innerHTML = `<span class="dot"></span><span>${text}</span>`;
    b.addEventListener('click', () => {
      if (g.multi) {
        const arr = Array.isArray(S.ans[g.key]) ? S.ans[g.key] : [];
        const at = arr.indexOf(text);
        at >= 0 ? arr.splice(at, 1) : arr.push(text);
        S.ans[g.key] = arr;
        b.classList.toggle('sel', arr.includes(text));
      } else {
        S.ans[g.key] = S.ans[g.key] === text ? undefined : text;
        $$('.opt', wrap).forEach(el => el.classList.remove('sel'));
        if (S.ans[g.key] === text) b.classList.add('sel');
      }
      checkGate();
    });
    wrap.appendChild(b);
  });
  body.appendChild(wrap);

  if (g.custom) {
    const box = document.createElement('div');
    box.style.marginTop = '18px';
    box.innerHTML = `<input class="inp" id="custom_${g.key}" placeholder="${g.customHint || '也可以自己写一句'}" />`;
    body.appendChild(box);
    const inp = box.querySelector('input');
    inp.value = S.ans[g.key + '_custom'] || '';
    inp.addEventListener('input', () => {
      S.ans[g.key + '_custom'] = inp.value.trim();
      checkGate();
    });
  }
}

function renderSplit(g, body) {
  const d = S.ans[g.key] || {};
  const wrap = document.createElement('div');
  wrap.className = 'split';
  wrap.innerHTML = `
    <div class="split-cell">
      <h4><b>发生的事</b>　不带评价，像摄像机拍到的</h4>
      <textarea id="sp_fact" rows="3" placeholder="例：会上我提的方案被否了，没让我说完。"></textarea>
    </div>
    <div class="split-cell">
      <h4><b>我加的解释</b>　我对这件事的说法</h4>
      <textarea id="sp_exp" rows="3" placeholder="例：他根本看不上我这个人。"></textarea>
    </div>`;
  body.appendChild(wrap);

  const f = $('#sp_fact'), e2 = $('#sp_exp');
  f.value = d.fact ?? S.seed;
  e2.value = d.exp ?? '';
  const sync = () => {
    S.ans[g.key] = { fact: f.value.trim(), exp: e2.value.trim() };
    checkGate();
  };
  f.addEventListener('input', sync);
  e2.addEventListener('input', sync);
  sync();
}

function renderInput(g, body) {
  const ta = document.createElement('textarea');
  ta.className = 'inp';
  ta.rows = 3;
  ta.placeholder = g.placeholder || '';
  ta.value = S.ans[g.key] || '';
  ta.addEventListener('input', () => { S.ans[g.key] = ta.value.trim(); checkGate(); });
  body.appendChild(ta);
}

function gateValid() {
  const g = GATES[S.step], a = S.ans[g.key];
  if (g.type === 'split') return a && a.fact && a.exp && a.fact.length > 1 && a.exp.length > 1;
  if (g.type === 'input') return a && a.length >= (g.minLen || 1);
  if (g.type === 'choice') {
    const has = Array.isArray(a) ? a.length > 0 : !!a;
    return has || (a && a.length > 0) || !!(S.ans[g.key + '_custom'] || '').length;
  }
  return true;
}
function checkGate() { $('#gateNext').disabled = !gateValid(); saveDraft(); }

$('#gateBack').addEventListener('click', () => {
  if (S.step > 0) { S.step--; renderGate(); }
});
$('#gateNext').addEventListener('click', () => {
  if (!gateValid()) return;
  if (S.step < GATES.length - 1) { S.step++; renderGate(); }
  else renderCard();
});

/* ═════════════ 一念卡 ═════════════ */
let LAST = null;

function collect() {
  const pick = k => {
    const v = S.ans[k], c = S.ans[k + '_custom'];
    if (Array.isArray(v)) return [...v, c].filter(Boolean).join('、');
    return [v, c].filter(Boolean).join('　');
  };
  return {
    date: todayKey(),
    fact: S.ans.li?.fact || '',
    exp: S.ans.li?.exp || '',
    care: pick('shi'),
    can: pick('yu'),
    after: pick('rong'),
    act: S.ans.shou || '',
    seed: S.seed
  };
}

function renderCard() {
  const r = collect();
  LAST = r;
  $('#cardDate').textContent = CN_DATE(new Date());
  const rows = [
    ['事实', r.fact],
    ['解释', r.exp],
    ['在意', r.care],
    ['能动的', r.can],
    ['三年后', r.after],
    ['明天', r.act, true]
  ].filter(x => x[1]);

  $('#cardRows').innerHTML = rows.map(([k, v, key]) =>
    `<div class="crow${key ? ' key' : ''}"><div class="k">${k}</div><div class="v">${esc(v)}</div></div>`
  ).join('');

  const idx = GATES[3].options.indexOf(r.after);
  $('#closingLine').textContent = CLOSINGS[idx] ?? CLOSINGS.def;

  saveArchive(r);
  clearDraft();
  go('card');
  reportEcho();
}

/* ═════════════ 共鸣计数 ═════════════
   只上报「日期 + 第一关标签 + 匿名指纹」，原话不出本机。 */
async function reportEcho() {
  const el = $('#echoLine');
  el.hidden = true; el.textContent = '';

  const tag = GATES[0].options.indexOf(S.ans.shi);
  if (tag < 0) return;                   // 用户自己写的，不归类、不上报

  const day = todayKey();
  const mark = `yinian:echo:${day}:${tag}`;
  const reported = !!localStorage.getItem(mark);

  if (!reported) {
    localStorage.setItem(mark, '1');
    if (cloud) {
      try {
        await sql('INSERT OR IGNORE INTO echoes (day, tag, anon) VALUES (?, ?, ?)', [day, String(tag), getUid()]);
      } catch (e) {
        localStorage.removeItem(mark);   // 没写进去就别占位，下次还能试
      }
    }
  }

  let n = 0;
  if (cloud) {
    try {
      const result = await sql('SELECT COUNT(*) AS count FROM echoes WHERE tag = ? AND day >= ?', [String(tag), dateMinus(6)]);
      n = Number(result.rows[0].count);
    } catch (e) { /* 网络不通就不显示，不打扰 */ }
  }
  if (!n && !cloud) return;
  el.textContent = echoText(n, tag);
  el.hidden = false;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function saveArchive(r) {
  try {
    const list = JSON.parse(localStorage.getItem(ARCH_KEY) || '[]');
    list.unshift(r);
    localStorage.setItem(ARCH_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {}
}

function renderArchive() {
  const box = $('#archList');
  let list = [];
  try { list = JSON.parse(localStorage.getItem(ARCH_KEY) || '[]'); } catch (e) {}
  if (!list.length) {
    box.innerHTML = `<div class="arch-empty">还没有记录。<br>过完五关，这里会留下你的心迹。</div>`;
    return;
  }
  box.innerHTML = list.slice(0, 7).map(r => `
    <div class="arch-item">
      <div class="d">${r.date}</div>
      <div class="t">${esc(r.exp || r.fact || '')}</div>
      <div class="a">${esc(r.act || '')}</div>
    </div>`).join('');
}

/* ═════════════ 壁纸 ═════════════ */
$('#saveImg').addEventListener('click', async () => {
  if (!LAST) return;
  try {
    const url = await makeWallpaper(LAST);
    $('#wpImg').src = url;
    $('#wpDownload').href = url;
    $('#wpSheet').hidden = false;
  } catch (e) { console.warn(e); toast('生成失败，换个浏览器试试'); }
});
$('#wpClose').addEventListener('click', () => { $('#wpSheet').hidden = true; });

function wrapCols(text, per) {
  const chars = [...text];
  const cols = [];
  for (let i = 0; i < chars.length; i += per) cols.push(chars.slice(i, i + per));
  return cols;
}

async function makeWallpaper(r) {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const SERIF = '"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';

  // 纸底
  x.fillStyle = '#FAF5EB'; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W * .2, H * .12, 0, W * .2, H * .12, H * .7);
  g.addColorStop(0, 'rgba(197,58,42,.05)'); g.addColorStop(1, 'rgba(197,58,42,0)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  // 双线边框
  x.strokeStyle = '#DCD1BB'; x.lineWidth = 2; x.strokeRect(52, 52, W - 104, H - 104);
  x.strokeStyle = 'rgba(220,209,187,.5)'; x.lineWidth = 1; x.strokeRect(64, 64, W - 128, H - 128);

  // 顶部题名
  x.fillStyle = '#C53A2A'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `400 30px ${SERIF}`;
  x.letterSpacing = '10px';
  x.fillText('一 念 之 间', W / 2, 152);
  x.letterSpacing = '0px';

  // 主体：竖排（第五关的动作，太长则退到解释）
  let body = r.act || r.exp || '';
  if ([...body].length > 42) body = [...body].slice(0, 42).join('') + '…';
  const per = [...body].length > 24 ? 14 : 11;
  const cols = wrapCols(body, per);
  const size = cols.length >= 3 ? 62 : (cols.length === 2 ? 82 : 96);
  const lineH = size * 1.36;
  x.font = `700 ${size}px ${SERIF}`;
  x.fillStyle = '#1A1A1A';
  x.textAlign = 'center';
  x.textBaseline = 'top';
  const colGap = size * 1.5;
  const startY = (H - Math.min(cols.length, 1) * 0 - (per * lineH)) / 2 + 40;
  const rightX = W / 2 + (cols.length - 1) * colGap / 2;
  cols.forEach((col, ci) => {
    const cx = rightX - ci * colGap;
    col.forEach((ch, ri) => x.fillText(ch, cx, startY + ri * lineH));
  });

  // 落款
  x.font = `400 26px ${SERIF}`;
  x.fillStyle = '#9C9384';
  x.fillText(`${new Date().getFullYear()}.${pad(new Date().getMonth() + 1)}.${pad(new Date().getDate())}`, W / 2, H - 230);

  // 朱印
  const sx = W / 2 - 34, sy = H - 186;
  x.fillStyle = '#C53A2A';
  roundRect(x, sx, sy, 68, 68, 4); x.fill();
  x.fillStyle = '#FAF5EB';
  x.font = `700 34px ${SERIF}`;
  x.textBaseline = 'middle';
  x.fillText('省', W / 2, sy + 36);

  return c.toDataURL('image/png');
}

function roundRect(x, l, t, w, h, r) {
  x.beginPath();
  x.moveTo(l + r, t);
  x.arcTo(l + w, t, l + w, t + h, r);
  x.arcTo(l + w, t + h, l, t + h, r);
  x.arcTo(l, t + h, l, t, r);
  x.arcTo(l, t, l + w, t, r);
  x.closePath();
}

/* ═════════════ 众生相 ═════════════ */
let crowdReady = false;

async function initCrowd() {
  const d = new Date();
  const qid = dayNo() % CROWD.length;
  const q = CROWD[qid];
  const day = todayKey();

  $('#crowdDate').textContent = `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
  $('#crowdQ').textContent = q.q;

  const box = $('#crowdOptions');
  box.innerHTML = '';
  const voted = localStorage.getItem(`yinian:vote:${day}:${qid}`);

  q.opts.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.innerHTML = `<span class="dot"></span><span>${t}</span>`;
    b.addEventListener('click', () => castVote(day, qid, i, t));
    box.appendChild(b);
  });

  await loadCrowd(day, qid, voted !== null ? Number(voted) : null);
  crowdReady = true;
}

async function castVote(day, qid, idx, label) {
  if (localStorage.getItem(`yinian:vote:${day}:${qid}`) !== null) {
    toast('今天已经答过了'); return;
  }
  localStorage.setItem(`yinian:vote:${day}:${qid}`, String(idx));
  if (!cloud) { toast('网络未就绪，先记在本地了'); renderLocal(day, qid, idx); return; }
  try {
    await sql('INSERT INTO votes (id, day, qid, choice) VALUES (?, ?, ?, ?)', [crypto.randomUUID(), day, String(qid), String(idx)]);
    await loadCrowd(day, qid, idx);
  } catch (e) {
    console.warn(e);
    toast('答案先记在你这儿了');
    renderLocal(day, qid, idx);
  }
}

function renderLocal(day, qid, mine) {
  $('#crowdResult').hidden = false;
  $('#crowdTotal').innerHTML = `今天这里还连不上，<b>你是第 1 个</b>`;
  const q = CROWD[qid];
  $('#crowdBars').innerHTML = q.opts.map((t, i) => `
    <div class="bar-row${i === mine ? ' mine' : ''}">
      <div class="bar-label"><span>${t}</span><span class="pct">${i === mine ? '你选的' : ''}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${i === mine ? 100 : 0}%"></div></div>
    </div>`).join('');
}

async function loadCrowd(day, qid, mine) {
  const q = CROWD[qid];
  let rows = [];
  if (cloud) {
    try {
      rows = (await sql('SELECT choice FROM votes WHERE day = ? AND qid = ? LIMIT 2000', [day, String(qid)])).rows;
    } catch (e) { console.warn(e); }
  }
  const counts = q.opts.map(() => 0);
  rows.forEach(r => { if (counts[r.choice] !== undefined) counts[r.choice]++; });
  const total = counts.reduce((a, b) => a + b, 0);

  $('#crowdResult').hidden = false;
  $('#crowdTotal').innerHTML = total
    ? `今天有 <b>${total}</b> 个人答了这道题`
    : `今天还没有人答。你可以是第一个。`;

  $('#crowdBars').innerHTML = q.opts.map((t, i) => {
    const pct = total ? Math.round(counts[i] / total * 100) : 0;
    return `<div class="bar-row${mine === i ? ' mine' : ''}">
      <div class="bar-label"><span>${t}</span><span class="pct">${total ? pct + '%' : '—'}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');

  if (mine !== null && mine !== undefined) {
    $$('#crowdOptions .opt').forEach((el, i) => el.classList.toggle('sel', i === mine));
  }
}

/* 首屏日期 */
$('#cardDate').textContent = CN_DATE(new Date());

/* ═════════════ 关于 ═════════════ */
$('#aboutBtn')?.addEventListener('click', () => {
  $('#aboutTitle').textContent = ABOUT.title;
  $('#aboutBody').innerHTML = ABOUT.body.split('\n\n')
    .map(p => `<p>${esc(p)}</p>`).join('');
  $('#aboutSheet').hidden = false;
});
$('#aboutClose')?.addEventListener('click', () => { $('#aboutSheet').hidden = true; });

/* 点击遮罩关闭 */
$$('.sheet').forEach(sh => {
  sh.addEventListener('click', e => { if (e.target === sh) sh.hidden = true; });
});

/* ═════════════ 中断续跑 ═════════════
   走一半退出（手机上极常见），回来能接着走。草稿三天内有效。 */
(function resumeDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (!d || !d.seed) return;
    if (Date.now() - d.t > 3 * 864e5) { clearDraft(); return; }
    const nav = $('.scene[data-scene="home"] .foot-nav');
    if (!nav) return;
    const b = document.createElement('button');
    b.className = 'link';
    b.style.color = 'var(--red)';
    b.textContent = '接着上次没过完的继续 →';
    b.addEventListener('click', () => {
      S.seed = d.seed;
      S.step = Math.min(d.step || 0, GATES.length - 1);
      S.ans = d.ans || {};
      renderGate();
      go('gate');
    });
    nav.prepend(b);
  } catch (e) {}
})();
