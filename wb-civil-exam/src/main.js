import {preview,clone,uid} from './ui.js';
import {layout} from './layout.js';
import {documentStore} from './platform.js';
import bank from './questions.json';
import material from './materials.json';
import {initialState,record,validateImport,streak} from './model.js';
const QUESTION_BANK=bank,MODULE_ORDER=Object.keys(bank),MODULE_COUNTS=Object.fromEntries(MODULE_ORDER.map(m=>[m,bank[m].questions.length])),TOTAL_QUESTIONS=Object.values(MODULE_COUNTS).reduce((a,b)=>a+b,0);
const QUESTION_INDEX=Object.fromEntries(MODULE_ORDER.flatMap(moduleId=>bank[moduleId].questions.map(q=>[q.id,{q,moduleId}])));
const {SHENLUN_TOPICS,SHENLUN_QUOTES,SHENLUN_EXPRESSIONS,SHENLUN_FRAMES}=material;
const canonicalInitial=initialState();canonicalInitial.settings.autoNext=true;const store=documentStore(canonicalInitial);let canonical=clone(canonicalInitial),ready=false,busy=false,loading=true,autoTimer;
const todayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const daysBetween=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000);
function projection(value){
 const stats={totalAnswered:value.attempts.length,totalCorrect:value.attempts.filter(x=>x.correct).length,streakDays:streak(value),moduleStats:Object.fromEntries(MODULE_ORDER.map(m=>[m,{answered:0,correct:0}])),dailyLog:{}};const answeredLog={};
 for(const e of value.attempts){const m=stats.moduleStats[e.module];if(m){m.answered++;if(e.correct)m.correct++}const d=stats.dailyLog[e.date]??={answered:0,correct:0};d.answered++;if(e.correct)d.correct++;answeredLog[e.qid]={correct:e.correct,lastAt:e.at}}
 return {settings:{...clone(value.settings),nickName:value.settings.nickname},stats,answeredLog,mistakes:clone(value.mistakes),bookmarks:clone(value.bookmarks)};
}
let state=projection(canonical);
const blocked=()=>!ready||busy||loading;
function syncLock(){for(const e of document.querySelectorAll('.nav,.view'))e.inert=blocked();const app=document.querySelector('.app');if(app)app.setAttribute('aria-busy',String(busy||loading));const status=document.querySelector('#cloud-status');if(status)status.textContent=loading?(preview?'正在读取本页示例…':'正在读取云端学习记录…'):busy?'正在保存…':ready?'学习记录已读取':'学习数据尚未连接';for(const id of ['reload-data','reset-example']){const e=document.getElementById(id);if(e)e.disabled=busy||loading}}
async function persistCanonical(next){if(blocked())return false;busy=true;syncLock();try{validateImport(next,new Set(Object.keys(QUESTION_INDEX)));await store.save(next);canonical=clone(next);state=projection(canonical);document.querySelector('#countdownVal').textContent=getDaysToExam();document.querySelector('#countdownDate').textContent=state.settings.examDate;const e=document.querySelector('#cloud-error');if(e)e.textContent='';return true}catch(error){const e=document.querySelector('#cloud-error');if(e)e.textContent=error.message;toast(error.message);return false}finally{busy=false;syncLock()}}
async function saveState(){const next=clone(canonical);next.settings={...next.settings,examDate:state.settings.examDate,dailyGoal:state.settings.dailyGoal,autoNext:state.settings.autoNext};next.mistakes=clone(state.mistakes);next.bookmarks=clone(state.bookmarks);return persistCanonical(next)}
async function recordAnswer(qid,module,correct){return persistCanonical(record(canonical,{id:uid(),qid,module,correct,at:Date.now(),date:todayKey()}))}
async function removeMistake(id){const next=clone(canonical);delete next.mistakes[id];return persistCanonical(next)}
async function resetAll(){return persistCanonical(clone(canonicalInitial))}
async function loadCanonical(){if(busy||loading&&ready)return;clearTimeout(autoTimer);loading=true;syncLock();try{const next=await store.load();validateImport(next,new Set(Object.keys(QUESTION_INDEX)));canonical=clone(next);state=projection(canonical);ready=true;session=null;stopTimer();refreshBadges();const cd=document.querySelector('#countdownVal');if(cd)cd.textContent=getDaysToExam();const date=document.querySelector('#countdownDate');if(date)date.textContent=state.settings.examDate;renderView(currentView);document.querySelector('#cloud-error').textContent=''}catch(error){document.querySelector('#cloud-error').textContent=error.message}finally{loading=false;syncLock()}}
function mountShell(){document.title='考公备考助手 · 行测刷题 · 申论素材 · 错题本';document.querySelector('#app').innerHTML=layout;if(preview)document.querySelector('.main').insertAdjacentHTML('afterbegin','<div class="example-notice">示例体验 · 数据仅保留在本页<button class="btn btn--ghost btn--sm" id="reset-example">恢复示例</button></div>');document.querySelector('.topbar').insertAdjacentHTML('beforeend','<div class="cloud-sync"><span id="cloud-status" role="status" aria-live="polite"></span><span id="cloud-error" role="alert"></span><button class="btn btn--ghost btn--sm" id="reload-data">重新读取</button></div>');document.querySelector('#reload-data').onclick=()=>{if(!busy&&!loading)showConfirm('重新读取学习记录',preview?'读取本页最近保存的示例记录，当前练习会话将结束。':'读取本应用最近保存的云端数据，当前练习会话将结束。',loadCanonical)};document.querySelector('#reset-example')?.addEventListener('click',()=>{if(blocked())return;clearTimeout(autoTimer);canonical=store.reset();state=projection(canonical);session=null;pickModule=null;mistakeFilter='all';shenlunTab='quotes';shenlunKeyword='';shenlunTopic='all';stopTimer();document.querySelector('#cloud-error').textContent='';document.querySelector('#countdownVal').textContent=getDaysToExam();document.querySelector('#countdownDate').textContent=state.settings.examDate;refreshBadges();navTo('dashboard')});syncLock()}
function getMistakeCount(onlyUnmastered) {
  return Object.keys(state.mistakes).filter(id => {
    if (!state.mistakes[id]) return false;
    return onlyUnmastered ? !state.mistakes[id].mastered : true;
  }).length;
}


function getAccuracy() {
  const t = state.stats.totalAnswered;
  return t === 0 ? 0 : Math.round((state.stats.totalCorrect / t) * 100);
}

function getModuleAccuracy(mid) {
  const m = state.stats.moduleStats[mid];
  if (!m || m.answered === 0) return null;
  return Math.round((m.correct / m.answered) * 100);
}

function getTodayStats() {
  const t = todayKey();
  return state.stats.dailyLog[t] || { answered: 0, correct: 0 };
}


function getRecentDays(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    const log = state.stats.dailyLog[key] || { answered: 0, correct: 0 };
    out.push({
      key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: ['日','一','二','三','四','五','六'][d.getDay()],
      isToday: i === 0,
      answered: log.answered,
      correct: log.correct
    });
  }
  return out;
}


function getWeakModules() {
  return MODULE_ORDER
    .map(mid => ({
      mid,
      name: QUESTION_BANK[mid].name,
      acc: getModuleAccuracy(mid),
      answered: state.stats.moduleStats[mid] ? state.stats.moduleStats[mid].answered : 0
    }))
    .filter(x => x.answered > 0)
    .sort((a, b) => a.acc - b.acc);
}


function getMistakeByModule() {
  const dist = {};
  MODULE_ORDER.forEach(mid => { dist[mid] = 0; });
  Object.keys(state.mistakes).forEach(qid => {
    const item = QUESTION_INDEX[qid];
    if (item && dist[item.moduleId] !== undefined) dist[item.moduleId] += 1;
  });
  return dist;
}


function getDaysToExam() {
  const today = todayKey();
  const exam = state.settings.examDate;
  const diff = daysBetween(today, exam);
  return diff >= 0 ? diff : 0;
}





const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


function renderStem(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

const KEY_LABELS = ['A', 'B', 'C', 'D'];


function toast(msg, type) {
  let wrap = $('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 300);
  }, 2000);
}


const ICONS = {
  dashboard: '<path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>',
  practice:  '<path d="M4 3h12l4 4v14H4V3zm11 1.5V8h3.5L15 4.5zM7 12h10v1.6H7V12zm0 3.4h7V17H7v-1.6z"/>',
  mistakes:  '<path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-7h-2v5h2V9z"/>',
  shenlun:   '<path d="M5 3h11l4 4v14H5V3zm10 1.6V8h3.4L15 4.6zM8 11h8v1.6H8V11zm0 3.3h8v1.6H8v-1.6zm0-6.6h4v1.6H8V7.7z"/>',
  stats:     '<path d="M5 20h3V10H5v10zm5.5 0h3V4h-3v16zM16 20h3v-7h-3v7z"/>',
  settings:  '<path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L15 3.4h-4l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.3 2.6h4l.3-2.6c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>'
};

function icon(name, size) {
  const s = size || 18;
  return `<svg class="nav__ico" width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

function svgIn(inner, size) {
  const s = size || 16;
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

const ICO_CHECK  = svgIn('<path d="M20 6 9 17l-5-5"/>', 17);
const ICO_CROSS  = svgIn('<path d="M18 6 6 18M6 6l12 12"/>', 17);
const ICO_DOWN   = svgIn('<path d="m6 9 6 6 6-6"/>', 17);
const ICO_SEARCH = svgIn('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 16);
const ICO_COPY   = svgIn('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 14);
const ICO_BOOK   = svgIn('<path d="M6 4h12v16l-6-4-6 4V4z"/>', 14);
const ICO_STAR   = svgIn('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>', 16);


const VIEWS = {
  dashboard: { title: '备考总览', desc: '今日进度 · 模块概览 · 薄弱诊断' },
  practice:  { title: '专项练习', desc: '按模块刷题 · 即时解析' },
  mistakes:  { title: '错题本', desc: '自动收录 · 集中攻克' },
  shenlun:   { title: '申论素材', desc: '金句 · 规范表达 · 作文框架' },
  stats:     { title: '数据分析', desc: '正确率 · 薄弱模块 · 练习趋势' },
  settings:  { title: '设置', desc: '考试日期 · 每日目标 · 数据管理' }
};

let currentView = 'dashboard';

function navTo(view) {
  if (blocked() && ready) return;
  clearTimeout(autoTimer);
  currentView = view;
  $$('.nav__item').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.view === view);
  });
  $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });

  const meta = VIEWS[view];
  const th = $('.topbar__h'), td = $('.topbar__d');
  if (th) th.textContent = meta.title;
  if (td) td.textContent = meta.desc;

  const target = $(`.view[data-view="${view}"]`);
  if (target) {
    
    target.classList.remove('is-in');
    void target.offsetWidth;
    target.classList.add('is-in');
    clearTimeout(target._animTimer);
    target._animTimer = setTimeout(() => target.classList.remove('is-in'), 760);
  }

  renderView(view);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  location.hash = view;
}

function renderView(view) {
  switch (view) {
    case 'dashboard': renderDashboard(); break;
    case 'practice':  renderPractice();  break;
    case 'mistakes':  renderMistakes();  break;
    case 'shenlun':   renderShenlun();   break;
    case 'stats':     renderStats();     break;
    case 'settings':  renderSettings();  break;
  }
}

function refreshBadges() {
  const n = getMistakeCount(true);
  const badge = $('#mistakeBadge');
  if (badge) {
    badge.textContent = n;
    badge.classList.toggle('is-zero', n === 0);
  }
  const streak = $('#streakVal');
  if (streak) streak.textContent = state.stats.streakDays;
}


function renderDashboard() {
  const el = $('.view[data-view="dashboard"]');
  const today = getTodayStats();
  const goal = state.settings.dailyGoal || 20;
  const pct = Math.min(100, Math.round((today.answered / goal) * 100));
  const days = getDaysToExam();
  const acc = getAccuracy();
  const mistakeN = getMistakeCount(true);
  const recent = getRecentDays(7);
  const weak = getWeakModules();

  const hour = new Date().getHours();
  const greet = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  const goalDone = today.answered >= goal;

  el.innerHTML = `
    <div class="hero">
      <div class="hero__in">
        <div class="hero__left">
          <div class="hero__eyebrow">备考总览</div>
          <div class="hero__greet">${greet}，今天也要稳扎稳打</div>
          <div class="hero__quote">
            ${days > 0
              ? `距离目标考试还有 <strong>${days}</strong> 天。坚持每天进步一点，把不确定的知识点一个个变成确定的分数。`
              : '目标日期已到，记得在设置里更新考试日期，继续下一阶段的准备。'}
          </div>
        </div>
        <div class="hero__right">
          <div class="ring">
            ${ringSvg(pct)}
            <div class="ring__val">${pct}<small>%</small></div>
            <div class="ring__label">今日目标</div>
          </div>
        </div>
      </div>
    </div>

    <div class="sec-title"><h3>今日概况</h3><span>${goalDone ? '今日目标已完成，继续保持' : `还差 ${Math.max(0, goal - today.answered)} 题完成今日目标`}</span></div>

    <div class="stat-grid">
      <div class="stat">
        <div class="stat__label">今日已练</div>
        <div class="stat__val" style="font-size:24px">${today.answered}</div>
      </div>
      <div class="stat stat--jade">
        <div class="stat__label">今日正确率</div>
        <div class="stat__val" style="font-size:24px">${today.answered ? Math.round(today.correct / today.answered * 100) : 0}<small>%</small></div>
      </div>
      <div class="stat">
        <div class="stat__label">累计答题</div>
        <div class="stat__val" style="font-size:24px">${state.stats.totalAnswered}</div>
      </div>
      <div class="stat stat--accent">
        <div class="stat__label">错题待攻克</div>
        <div class="stat__val" style="font-size:24px">${mistakeN}</div>
      </div>
    </div>

    <div class="two-col" style="margin-top:22px">
      <div>
        <div class="sec-title"><h3>专项练习</h3><span>共 ${TOTAL_QUESTIONS} 道题</span></div>
        <div class="mod-list">
          ${MODULE_ORDER.map(mid => {
            const m = QUESTION_BANK[mid];
            const ms = state.stats.moduleStats[mid] || { answered: 0, correct: 0 };
            const a = ms.answered ? Math.round(ms.correct / ms.answered * 100) : null;
            const cnt = MODULE_COUNTS[mid];
            return `
              <button class="mod-card" data-goto-module="${mid}">
                <span class="mod-card__bar" style="background:${m.accent}"></span>
                <span class="mod-card__body">
                  <span class="mod-card__name">${m.name}</span>
                  <span class="mod-card__desc">${m.desc}</span>
                </span>
                <span class="mod-card__meta">
                  ${a === null
                    ? `<b>${cnt}</b>题待练`
                    : `<b>${a}%</b>已练 ${ms.answered} 题`}
                </span>
              </button>`;
          }).join('')}
        </div>
      </div>

      <div>
        <div class="sec-title"><h3>近 7 日练习</h3><span>柱高表示题量</span></div>
        <div class="card card--pad">
          <div class="spark">
            ${recent.map(d => {
              const max = Math.max(10, ...recent.map(x => x.answered));
              const h = d.answered === 0 ? 0 : Math.max(8, Math.round(d.answered / max * 100));
              const cls = d.answered === 0 ? 'is-none' : 'spark__fill';
              return `
                <div class="spark__col">
                  <div class="spark__track">
                    <div class="${cls}" style="height:${h}%"></div>
                  </div>
                  <div class="spark__x ${d.isToday ? 'is-today' : ''}">${d.label}</div>
                </div>`;
            }).join('')}
          </div>
        </div>

        ${weak.length ? `
          <div class="sec-title"><h3>薄弱提示</h3><span>按正确率排序</span></div>
          <div class="card card--pad">
            ${weak.slice(0, 3).map(w => `
              <div class="bar-row">
                <div class="bar-row__top">
                  <span class="bar-row__name">${w.name}</span>
                  <span class="bar-row__val"><b>${w.acc}%</b></span>
                </div>
                <div class="bar ${w.acc < 60 ? 'bar--cinnabar' : 'bar--jade'}">
                  <div class="bar__fill" style="width:${w.acc}%"></div>
                </div>
              </div>`).join('')}
          </div>` : `
          <div class="sec-title"><h3>薄弱提示</h3><span>需要先练几题</span></div>
          <div class="card card--pad">
            <div class="empty" style="padding:26px 10px">
              <div class="empty__d">完成一些练习后，这里会显示你最需要加强的模块。</div>
            </div>
          </div>`}
      </div>
    </div>
  `;

  el.querySelectorAll('[data-goto-module]').forEach(btn => {
    btn.addEventListener('click', () => {
      pickModule = btn.dataset.gotoModule;
      navTo('practice');
    });
  });
}

function ringSvg(pct) {
  const R = 46, C = 2 * Math.PI * R;
  const off = C * (1 - Math.min(100, pct) / 100);
  return `
    <svg class="ring__svg" width="116" height="116" viewBox="0 0 116 116">
      <circle cx="58" cy="58" r="${R}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="9"/>
      <circle cx="58" cy="58" r="${R}" fill="none" stroke="#BE3A34" stroke-width="9"
              stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}"
              transform="rotate(-90 58 58)"/>
    </svg>`;
}


let pickModule = null;      // 已选模块
let session = null;         // 当前答题会话
let timerId = null;

function renderPractice() {
  const el = $('.view[data-view="practice"]');
  if (!session) {
    el.innerHTML = renderPickerView();
    el.querySelectorAll('[data-start]').forEach(btn => {
      btn.addEventListener('click', () => startSession(btn.dataset.start));
    });
    const startAll = el.querySelector('#startMixed');
    if (startAll) startAll.addEventListener('click', () => startSession('mixed'));
    return;
  }
  el.innerHTML = renderQuizView();
  bindQuiz();
}


function renderPickerView() {
  return `
    <div class="practice-bar">
      <div>
        <div style="font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:.03em">选择练习范围</div>
        <div style="font-size:13px;color:var(--text-mute);margin-top:3px">每个模块含 20 道题，答完即时看解析，错题自动进入错题本</div>
      </div>
      <div class="practice-bar__meta">
        <button class="btn btn--primary" id="startMixed">综合练习（全模块随机 20 题）</button>
      </div>
    </div>

    <div class="picker">
      ${MODULE_ORDER.map(mid => {
        const m = QUESTION_BANK[mid];
        const ms = state.stats.moduleStats[mid] || { answered: 0, correct: 0 };
        const a = ms.answered ? Math.round(ms.correct / ms.answered * 100) : null;
        return `
          <button class="pick" data-start="${mid}" style="--accent:${m.accent}">
            <div class="pick__ico">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">${ICONS.practice}</svg>
            </div>
            <div class="pick__name">${m.name}</div>
            <div class="pick__desc">${m.desc}</div>
            <div class="pick__foot">
              <span>${MODULE_COUNTS[mid]} 道题</span>
              <span>${a === null ? '<b>—</b>' : `<b>${a}%</b>`}</span>
            </div>
          </button>`;
      }).join('')}
      <div class="pick-spacer">
        按模块逐个过一遍，<br>错题会自动收进错题本
      </div>
    </div>
  `;
}


function startSession(mode, questionIds) {
  if (blocked()) return; clearTimeout(autoTimer);
  let list, title;
  if (questionIds && questionIds.length) {
    list = questionIds.map(id => QUESTION_INDEX[id]).filter(Boolean).map(x => x.q);
    title = '错题重做';
  } else if (mode === 'mixed') {
    const all = Object.keys(QUESTION_INDEX).map(k => QUESTION_INDEX[k].q);
    list = shuffle(all).slice(0, 20);
    title = '综合练习';
  } else {
    list = QUESTION_BANK[mode].questions.slice();
    title = QUESTION_BANK[mode].name;
    pickModule = mode;
  }

  session = {
    id: uid(),
    mode: mode || (questionIds ? 'redo' : 'mixed'),
    title,
    list,
    idx: 0,
    picked: null,
    submitted: false,
    results: new Array(list.length).fill(null),
    picks: new Array(list.length).fill(null),  // true/false/null
    startedAt: Date.now(),
    elapsed: 0
  };

  startTimer();
  renderPractice();
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    if (!session) return;
    session.elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const t = $('#quizTimer');
    if (t) t.textContent = fmtTime(session.elapsed);
  }, 1000);
}
function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
}
function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}


function renderQuizView() {
  const q = session.list[session.idx];
  const total = session.list.length;
  const done = session.results.filter(r => r !== null).length;

  
  if (session.idx >= total) return renderSessionResult();

  const picked = session.picked;
  const submitted = session.submitted;

  return `
    <div class="practice-bar">
      <button class="btn btn--ghost btn--sm" id="exitQuiz">← 返回选择</button>
      <span class="tag tag--ink">${esc(session.title)}</span>
      <span class="tag">${done} / ${total} 已作答</span>
      <div class="practice-bar__meta">
        <span class="tag">${q.type}</span>
        <span class="tag">${'★'.repeat(q.difficulty)}${'☆'.repeat(3 - q.difficulty)}</span>
      </div>
    </div>

    <div class="quiz-wrap">
      <div class="card quiz">
        <div class="quiz__hd">
          <span class="quiz__idx">第 ${session.idx + 1} / ${total} 题</span>
          <span class="quiz__timer">${svgIn('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 14)} <span id="quizTimer">${fmtTime(session.elapsed)}</span></span>
        </div>

        ${q.material ? `<div class="material"><div class="material__t">材料</div>${renderStem(q.material)}</div>` : ''}

        <div class="quiz__stem">${renderStem(q.stem)}</div>

        <div class="opts" id="optWrap">
          ${q.options.map((opt, i) => {
            let cls = 'opt';
            if (submitted) {
              if (i === q.answer) cls += ' is-right';
              else if (i === picked) cls += ' is-wrong';
              else cls += ' is-dim';
            } else if (i === picked) {
              cls += ' is-picked';
            }
            return `
              <button class="${cls}" data-opt="${i}" ${submitted ? 'disabled' : ''}>
                <span class="opt__key">${KEY_LABELS[i]}</span>
                <span class="opt__txt">${esc(opt)}</span>
                <span class="opt__mark">${i === q.answer ? ICO_CHECK : ICO_CROSS}</span>
              </button>`;
          }).join('')}
        </div>

        ${submitted ? renderExplain(q, picked) : ''}

        <div class="quiz__foot">
          ${!submitted
            ? `<span style="font-size:12.5px;color:var(--text-mute)">选择答案后点击「确认作答」，或按 <span class="kbd">A</span> <span class="kbd">B</span> <span class="kbd">C</span> <span class="kbd">D</span> 直接作答</span>
               <button class="btn btn--accent" id="submitBtn" ${picked === null ? 'disabled' : ''}>确认作答</button>`
            : `${session.idx > 0 ? '<button class="btn btn--ghost btn--sm" id="prevBtn">上一题</button>' : ''}
               <span style="font-size:12.5px;color:var(--text-mute)">按 <span class="kbd">Enter</span> 继续</span>
               <button class="btn btn--primary" id="nextBtn">${session.idx === total - 1 ? '查看本轮成绩' : '下一题'}</button>`}
        </div>
      </div>

      <aside class="sheet card card--pad">
        <div class="card__head" style="margin-bottom:12px">
          <div class="card__title" style="font-size:14.5px">答题卡</div>
          <div class="card__note">${done}/${total}</div>
        </div>
        <div class="sheet__grid">
          ${session.list.map((_, i) => {
            const r = session.results[i];
            let cls = 'sheet__cell';
            if (r === true) cls += ' is-right';
            else if (r === false) cls += ' is-wrong';
            if (i === session.idx) cls += ' is-cur';
            return `<button class="${cls}" data-jump="${i}">${i + 1}</button>`;
          }).join('')}
        </div>
        <div class="legend">
          <span><i style="background:var(--jade)"></i>答对</span>
          <span><i style="background:var(--cinnabar)"></i>答错</span>
        </div>
        <div class="bar-row" style="margin-top:16px">
          <div class="bar-row__top">
            <span class="bar-row__name">进度</span>
            <span class="bar-row__val"><b>${Math.round(done / total * 100)}%</b></span>
          </div>
          <div class="bar"><div class="bar__fill" style="width:${done / total * 100}%"></div></div>
        </div>
      </aside>
    </div>
  `;
}

function renderExplain(q, picked) {
  const ok = picked === q.answer;
  return `
    <div class="explain">
      <div class="explain__hd ${ok ? 'is-right' : 'is-wrong'}">
        ${ok ? ICO_CHECK : ICO_CROSS}
        <span>${ok ? '作答正确' : '作答错误'}</span>
        <span class="explain__result">正确答案：${KEY_LABELS[q.answer]}</span>
      </div>
      <div class="explain__bd">
        <div class="explain__sec">
          <div class="explain__label">解析</div>
          <div class="explain__text">${renderStem(q.explain)}</div>
        </div>
        <div class="explain__sec">
          <div class="explain__label">涉及考点</div>
          <div class="explain__tags">
            ${q.points.map(p => `<span class="tag tag--ink">${esc(p)}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function bindQuiz() {
  const el = $('.view[data-view="practice"]');

  const exit = $('#exitQuiz', el);
  if (exit) exit.addEventListener('click', () => {
    session = null; stopTimer(); renderPractice(); refreshBadges();
  });

  $$('[data-opt]', el).forEach(btn => {
    btn.addEventListener('click', () => selectOption(Number(btn.dataset.opt)));
  });

  const submit = $('#submitBtn', el);
  if (submit) submit.addEventListener('click', doSubmit);

  const next = $('#nextBtn', el);
  if (next) next.addEventListener('click', () => {
    session.idx += 1;
    session.picked = null;
    session.submitted = false;
    if (session.idx >= session.list.length) stopTimer();
    renderPractice();
  });

  const prev = $('#prevBtn', el);
  if (prev) prev.addEventListener('click', () => {
    if (session.idx > 0) {
      session.idx -= 1;
      session.picked = null;
      session.submitted = false;
      renderPractice();
    }
  });

  $$('[data-jump]', el).forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.jump);
      
      if (i <= session.idx || session.results[i] !== null) {
        session.idx = i;
        session.picked = session.picks[i] ?? null;
        session.submitted = session.results[i] !== null;
        renderPractice();
      } else {
        toast('请按顺序作答');
      }
    });
  });
}


function applySubmittedState() {
  const el = $('.view[data-view="practice"]');
  if (!el || !session) return;
  const q = session.list[session.idx];
  const picked = session.picked;
  const total = session.list.length;

  
  $$('[data-opt]', el).forEach(btn => {
    const i = Number(btn.dataset.opt);
    btn.disabled = true;
    btn.classList.remove('is-picked', 'is-dim');
    if (i === q.answer) {
      btn.classList.add('is-right');
      const mk = btn.querySelector('.opt__mark');
      if (mk) mk.innerHTML = ICO_CHECK;
      if (mk) mk.style.opacity = '1';
      if (mk) mk.style.color = 'var(--jade)';
    } else if (i === picked) {
      btn.classList.add('is-wrong');
      const mk = btn.querySelector('.opt__mark');
      if (mk) mk.innerHTML = ICO_CROSS;
      if (mk) mk.style.opacity = '1';
      if (mk) mk.style.color = 'var(--cinnabar)';
    } else {
      btn.classList.add('is-dim');
      const mk = btn.querySelector('.opt__mark');
      if (mk) mk.style.opacity = '';
      if (mk) mk.style.color = '';
      if (mk) mk.innerHTML = '';
    }
  });

  
  if (!$('.explain', el)) {
    const opts = $('#optWrap', el);
    if (opts) opts.insertAdjacentHTML('afterend', renderExplain(q, picked));
  }

  
  const cell = el.querySelector(`[data-jump="${session.idx}"]`);
  if (cell) {
    cell.classList.remove('is-right', 'is-wrong');
    cell.classList.add(picked === q.answer ? 'is-right' : 'is-wrong');
  }

  
  const done = session.results.filter(r => r !== null).length;
  const tagDone = el.querySelector('.practice-bar .tag:nth-of-type(2)');
  if (tagDone) tagDone.textContent = `${done} / ${total} 已作答`;
  const noteDone = el.querySelector('.sheet .card__note');
  if (noteDone) noteDone.textContent = `${done}/${total}`;
  const barFill = el.querySelector('.sheet .bar__fill');
  if (barFill) barFill.style.width = `${done / total * 100}%`;
  const barVal = el.querySelector('.sheet .bar-row__val b');
  if (barVal) barVal.textContent = `${Math.round(done / total * 100)}%`;

  
  const foot = $('.quiz__foot', el);
  if (foot) {
    foot.innerHTML = `
      ${session.idx > 0 ? '<button class="btn btn--ghost btn--sm" id="prevBtn">上一题</button>' : ''}
      <span style="font-size:12.5px;color:var(--text-mute)">按 <span class="kbd">Enter</span> 继续</span>
      <button class="btn btn--primary" id="nextBtn">${session.idx === total - 1 ? '查看本轮成绩' : '下一题'}</button>`;
    const nb = $('#nextBtn', foot);
    if (nb) nb.addEventListener('click', () => {
      session.idx += 1;
      session.picked = null;
      session.submitted = false;
      if (session.idx >= session.list.length) stopTimer();
      renderPractice();
    });
    const pb = $('#prevBtn', foot);
    if (pb) pb.addEventListener('click', () => {
      if (session.idx > 0) {
        session.idx -= 1; session.picked = null; session.submitted = false;
        renderPractice();
      }
    });
  }
}

async function doSubmit() {
  if (blocked() || !session || session.submitted || session.picked === null) return;
  const submittedSession=session,submittedIdx=session.idx,q=session.list[submittedIdx],picked=session.picked,ok=picked===q.answer;
  const item=QUESTION_INDEX[q.id];
  if(!await recordAnswer(q.id,item.moduleId,ok))return;
  if(session!==submittedSession||session.idx!==submittedIdx||session.list[submittedIdx].id!==q.id)return;
  session.submitted=true;session.results[submittedIdx]=ok;session.picks[submittedIdx]=picked;
  applySubmittedState();refreshBadges();
  if(ok&&state.settings.autoNext)autoTimer=setTimeout(()=>{if(!blocked()&&currentView==='practice'&&session===submittedSession&&session.idx===submittedIdx&&session.submitted)document.querySelector('#nextBtn')?.click()},1400);
}


function selectOption(i) {
  if (blocked()) return;
  if (!session || session.submitted) return;
  session.picked = i;
  const el = $('.view[data-view="practice"]');
  if (!el) return;
  $$('[data-opt]', el).forEach(b => {
    b.classList.toggle('is-picked', Number(b.dataset.opt) === i);
  });
  const sb = $('#submitBtn', el);
  if (sb) sb.disabled = false;
}


function renderSessionResult() {
  const total = session.list.length;
  const right = session.results.filter(r => r === true).length;
  const wrong = session.results.filter(r => r === false).length;
  const acc = Math.round(right / total * 100);
  const used = session.elapsed;

  let comment;
  if (acc >= 90) comment = '状态很好，这个模块的把握已经比较稳了。';
  else if (acc >= 75) comment = '整体不错，错的几道题正是要重点回看的。';
  else if (acc >= 60) comment = '基础还在，建议把错题的解析逐句读一遍再重做。';
  else comment = '这个模块暂时偏弱，建议先看解析理解考点，稍后再重做一轮。';

  return `
    <div class="practice-bar">
      <button class="btn btn--ghost btn--sm" id="exitQuiz">← 返回选择</button>
    </div>
    <div class="card result">
      <div class="result__score">${acc}<small>%</small></div>
      <div class="result__t">${esc(session.title)} · 本轮完成</div>
      <div class="result__d">${comment}</div>
      <div class="result__grid">
        <div class="result__cell">
          <div class="result__num">${total}</div>
          <div class="result__lb">总题数</div>
        </div>
        <div class="result__cell">
          <div class="result__num" style="color:var(--jade)">${right}</div>
          <div class="result__lb">答对</div>
        </div>
        <div class="result__cell">
          <div class="result__num" style="color:var(--cinnabar)">${wrong}</div>
          <div class="result__lb">答错</div>
        </div>
        <div class="result__cell">
          <div class="result__num">${fmtTime(used)}</div>
          <div class="result__lb">用时</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:24px;flex-wrap:wrap">
        ${wrong > 0 ? `<button class="btn btn--accent" id="redoWrong">重做本轮错题（${wrong} 题）</button>` : ''}
        <button class="btn btn--primary" id="anotherRound">再练一轮</button>
        <button class="btn btn--ghost" id="goMistakes">去错题本</button>
      </div>
    </div>
  `;
}

function bindResult() {
  
}


let mistakeFilter = 'all';

function renderMistakes() {
  const el = $('.view[data-view="mistakes"]');

  const ids = Object.keys(state.mistakes);
  const openIds = ids.filter(id => !state.mistakes[id].mastered);

  if (ids.length === 0) {
    el.innerHTML = `
      <div class="card">
        <div class="empty">
          <div class="empty__ico">${svgIn('<path d="M20 6 9 17l-5-5"/>', 40)}</div>
          <div class="empty__t">错题本还是空的</div>
          <div class="empty__d">去「专项练习」做几道题，答错的会自动收录到这里。</div>
          <div style="margin-top:18px"><button class="btn btn--primary" id="goPractice">开始练习</button></div>
        </div>
      </div>`;
    const b = $('#goPractice', el);
    if (b) b.addEventListener('click', () => navTo('practice'));
    return;
  }

  let list = ids;
  if (mistakeFilter === 'open') list = ids.filter(id => !state.mistakes[id].mastered);
  else if (mistakeFilter !== 'all') list = ids.filter(id => QUESTION_INDEX[id] && QUESTION_INDEX[id].moduleId === mistakeFilter);

  
  list.sort((a, b) => {
    const ma = state.mistakes[a], mb = state.mistakes[b];
    if (ma.mastered !== mb.mastered) return ma.mastered ? 1 : -1;
    return mb.wrongCount - ma.wrongCount;
  });

  el.innerHTML = `
    <div class="practice-bar">
      <div>
        <div style="font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:.03em">错题回顾</div>
        <div style="font-size:13px;color:var(--text-mute);margin-top:3px">共收录 ${ids.length} 题，其中 ${openIds.length} 题尚未攻克</div>
      </div>
      <div class="practice-bar__meta">
        <button class="btn btn--accent" id="redoAll" ${list.length === 0 ? 'disabled' : ''}>重做本页错题</button>
      </div>
    </div>

    <div class="filter-bar">
      <button class="chip ${mistakeFilter === 'all' ? 'is-on' : ''}" data-filter="all">全部<b>${ids.length}</b></button>
      <button class="chip ${mistakeFilter === 'open' ? 'is-on' : ''}" data-filter="open">待攻克<b>${openIds.length}</b></button>
      ${MODULE_ORDER.map(mid => {
        const n = ids.filter(id => QUESTION_INDEX[id] && QUESTION_INDEX[id].moduleId === mid).length;
        if (n === 0) return '';
        return `<button class="chip ${mistakeFilter === mid ? 'is-on' : ''}" data-filter="${mid}">${QUESTION_BANK[mid].short}<b>${n}</b></button>`;
      }).join('')}
    </div>

    ${list.length === 0
      ? `<div class="card"><div class="empty"><div class="empty__t">该分类下没有错题</div></div></div>`
      : `<div class="mis-list">${list.map(id => renderMistakeCard(id)).join('')}</div>`}
  `;

  $$('[data-filter]', el).forEach(btn => {
    btn.addEventListener('click', () => {
      mistakeFilter = btn.dataset.filter;
      renderMistakes();
    });
  });

  el.querySelectorAll('[data-toggle-mis]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.mis');
      card.classList.toggle('is-open');
    });
  });

  el.querySelectorAll('[data-del-mis]').forEach(btn => {
    btn.addEventListener('click', async ev => {
      ev.stopPropagation();
      const id = btn.dataset.delMis;
      if(!await removeMistake(id))return;
      toast('已从错题本移除');
      renderMistakes();
      refreshBadges();
    });
  });

  const redoAll = $('#redoAll', el);
  if (redoAll) redoAll.addEventListener('click', () => {
    const idsToDo = list.slice();
    if (idsToDo.length === 0) return;
    navTo('practice');
    startSession('redo', idsToDo.slice(0, 20));
  });
}

function renderMistakeCard(id) {
  const item = QUESTION_INDEX[id];
  if (!item) return '';
  const q = item.q;
  const m = state.mistakes[id];
  const modName = QUESTION_BANK[item.moduleId].short;

  return `
    <article class="mis" data-mis="${id}">
      <button class="mis__hd" data-toggle-mis>
        <span class="mis__cnt">错<span>${m.wrongCount}</span></span>
        <span class="mis__body">
          <span class="mis__stem">${renderStem(q.material ? q.material + '　' + q.stem : q.stem)}</span>
          <span class="mis__meta">
            <span class="tag">${modName}</span>
            <span class="tag">${q.type}</span>
            ${m.mastered ? '<span class="tag tag--jade">已攻克</span>' : '<span class="tag tag--cinnabar">待攻克</span>'}
          </span>
        </span>
        <span class="mis__arrow">${ICO_DOWN}</span>
      </button>
      <div class="mis__bd" hidden>
        <div class="mis__opts">
          ${q.options.map((opt, i) => {
            let cls = 'mis__opt';
            if (i === q.answer) cls += ' is-right';
            return `<div class="${cls}"><b>${KEY_LABELS[i]}</b><span>${esc(opt)}</span></div>`;
          }).join('')}
        </div>
        <div class="explain__sec">
          <div class="explain__label">解析</div>
          <div class="explain__text">${renderStem(q.explain)}</div>
        </div>
        <div class="explain__sec">
          <div class="explain__label">涉及考点</div>
          <div class="explain__tags">${q.points.map(p => `<span class="tag tag--ink">${esc(p)}</span>`).join('')}</div>
        </div>
        <div style="display:flex;gap:9px;margin-top:16px">
          <button class="btn btn--ghost btn--sm" data-del-mis="${id}">移出错题本</button>
        </div>
      </div>
    </article>`;
}


let shenlunTab = 'quotes';
let shenlunKeyword = '';
let shenlunTopic = 'all';

function renderShenlun() {
  const el = $('.view[data-view="shenlun"]');

  el.innerHTML = `
    <div class="practice-bar">
      <div>
        <div style="font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:.03em">申论素材库</div>
        <div style="font-size:13px;color:var(--text-mute);margin-top:3px">考场上能直接调用的句子、表达与结构</div>
      </div>
      <div class="practice-bar__meta">
        <div class="search">
          ${ICO_SEARCH}
          <input id="slSearch" type="search" placeholder="搜索关键词，如 基层 / 创新 / 民生" value="${esc(shenlunKeyword)}">
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <button class="chip ${shenlunTab === 'quotes' ? 'is-on' : ''}" data-tab="quotes">金句素材<b>${SHENLUN_QUOTES.length}</b></button>
      <button class="chip ${shenlunTab === 'expr' ? 'is-on' : ''}" data-tab="expr">规范表达<b>${SHENLUN_EXPRESSIONS.length}</b></button>
      <button class="chip ${shenlunTab === 'frame' ? 'is-on' : ''}" data-tab="frame">作文框架<b>${SHENLUN_FRAMES.length}</b></button>
    </div>

    ${shenlunTab === 'quotes' ? `
      <div class="filter-bar" style="margin-top:-8px">
        <button class="chip ${shenlunTopic === 'all' ? 'is-on' : ''}" data-topic="all">全部主题</button>
        ${Object.keys(SHENLUN_TOPICS).map(k => `
          <button class="chip ${shenlunTopic === k ? 'is-on' : ''}" data-topic="${k}">${SHENLUN_TOPICS[k].name}</button>
        `).join('')}
      </div>` : ''}

    <div id="slBody"></div>
  `;

  $$('[data-tab]', el).forEach(btn => {
    btn.addEventListener('click', () => { shenlunTab = btn.dataset.tab; renderShenlun(); });
  });
  $$('[data-topic]', el).forEach(btn => {
    btn.addEventListener('click', () => { shenlunTopic = btn.dataset.topic; renderShenlun(); });
  });

  const input = $('#slSearch', el);
  if (input) {
    input.addEventListener('input', () => {
      shenlunKeyword = input.value.trim();
      renderShenlunBody();
    });
  }

  renderShenlunBody();
}

function renderShenlunBody() {
  const body = $('#slBody');
  if (!body) return;
  const kw = shenlunKeyword.toLowerCase();

  if (shenlunTab === 'quotes') {
    let list = SHENLUN_QUOTES.slice();
    if (shenlunTopic !== 'all') list = list.filter(x => x.topic === shenlunTopic);
    if (kw) list = list.filter(x =>
      x.quote.toLowerCase().includes(kw) ||
      x.use.toLowerCase().includes(kw) ||
      (SHENLUN_TOPICS[x.topic] && SHENLUN_TOPICS[x.topic].name.includes(kw))
    );

    if (list.length === 0) {
      body.innerHTML = `<div class="card"><div class="empty"><div class="empty__t">没有匹配的素材</div><div class="empty__d">换个关键词试试，或点「全部主题」</div></div></div>`;
      return;
    }

    body.innerHTML = `<div class="sl-grid">${list.map(q => `
      <div class="sl">
        <div class="sl__hd">
          <span class="sl__cat" style="background:${(SHENLUN_TOPICS[q.topic] || {}).color || '#1B3350'}">${(SHENLUN_TOPICS[q.topic] || {}).name || '素材'}</span>
        </div>
        <div class="sl__quote">${esc(q.quote)}</div>
        <div class="sl__use"><b>用法：</b>${esc(q.use)}</div>
        <div class="sl__foot">
          <button class="sl__copy" data-copy="${esc(q.quote)}">${ICO_COPY} 复制</button>
          <button class="sl__copy" data-bm="${q.id}">${ICO_BOOK} ${state.bookmarks.includes(q.id) ? '已收藏' : '收藏'}</button>
        </div>
      </div>`).join('')}</div>`;

    bindCopyAndBookmark(body);
    return;
  }

  if (shenlunTab === 'expr') {
    let list = SHENLUN_EXPRESSIONS.slice();
    if (kw) list = list.filter(x => x.rough.includes(kw) || x.formal.includes(kw));

    if (list.length === 0) {
      body.innerHTML = `<div class="card"><div class="empty"><div class="empty__t">没有匹配的表达</div></div></div>`;
      return;
    }

    body.innerHTML = `
      <div class="card card--pad">
        <div class="card__head">
          <div class="card__title">口语表达 → 规范表达对照</div>
          <div class="card__note">申论作答中把大白话转成规范表述</div>
        </div>
        ${list.map(x => `
          <div class="mis__opt" style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;margin-bottom:9px;padding:12px 15px">
            <span style="color:var(--text-mute)">${esc(x.rough)}</span>
            <span style="color:var(--ink-300)">→</span>
            <span style="font-weight:600;color:var(--ink-700);display:flex;align-items:center;gap:8px">
              ${esc(x.formal)}
              <button class="sl__copy" data-copy="${esc(x.formal)}" style="padding:2px 6px">${ICO_COPY}</button>
            </span>
          </div>`).join('')}
      </div>`;

    bindCopyAndBookmark(body);
    return;
  }

  
  let frames = SHENLUN_FRAMES.slice();
  if (kw) frames = frames.filter(x => x.title.includes(kw) || x.desc.includes(kw));

  body.innerHTML = `
    <div class="sl-grid" style="grid-template-columns:repeat(auto-fill,minmax(400px,1fr))">
      ${frames.map(f => `
        <div class="frame">
          <div class="frame__t">${esc(f.title)}</div>
          <div class="frame__d">${esc(f.desc)}</div>
          ${f.steps.map((s, i) => `
            <div class="frame__step">
              <div class="frame__no">${i + 1}</div>
              <div class="frame__txt"><b>${esc(s.t)}</b><br>${esc(s.d)}</div>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
}

function bindCopyAndBookmark(root) {
  root.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        toast('已复制到剪贴板');
      } catch (e) {
        
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast('已复制到剪贴板'); }
        catch (e2) { toast('复制失败，请手动选择文本'); }
        ta.remove();
      }
    });
  });

  root.querySelectorAll('[data-bm]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.bm;
      const i = state.bookmarks.indexOf(id);
      if (i >= 0) state.bookmarks.splice(i, 1); else state.bookmarks.push(id);
      if(!await saveState())return;toast(i>=0?'已取消收藏':'已收藏');
      renderShenlunBody();
    });
  });
}


function renderStats() {
  const el = $('.view[data-view="stats"]');
  const total = state.stats.totalAnswered;
  const right = state.stats.totalCorrect;
  const acc = getAccuracy();
  const recent = getRecentDays(14);
  const modRows = MODULE_ORDER.map(mid => ({
    mid,
    name: QUESTION_BANK[mid].name,
    short: QUESTION_BANK[mid].short,
    accent: QUESTION_BANK[mid].accent,
    acc: getModuleAccuracy(mid),
    answered: (state.stats.moduleStats[mid] || {}).answered
  }));
  const misDist = getMistakeByModule();
  const misTotal = Object.values(misDist).reduce((a, b) => a + b, 0);

  
  const touched = Object.keys(state.answeredLog).length;
  const coverage = Math.round(touched / TOTAL_QUESTIONS * 100);

  el.innerHTML = `
    <div class="stat-grid">
      <div class="stat">
        <div class="stat__label">累计答题</div>
        <div class="stat__val">${total}</div>
        <div class="stat__foot">共 ${TOTAL_QUESTIONS} 题，已接触 ${touched} 题</div>
      </div>
      <div class="stat stat--jade">
        <div class="stat__label">总体正确率</div>
        <div class="stat__val">${acc}<small>%</small></div>
        <div class="stat__foot">答对 ${right} 题</div>
      </div>
      <div class="stat">
        <div class="stat__label">刷题覆盖率</div>
        <div class="stat__val">${coverage}<small>%</small></div>
        <div class="stat__foot">题库完成度</div>
      </div>
      <div class="stat stat--accent">
        <div class="stat__label">连续打卡</div>
        <div class="stat__val">${state.stats.streakDays}<small>天</small></div>
        <div class="stat__foot">保持节奏最重要</div>
      </div>
    </div>

    <div class="two-col" style="margin-top:22px">
      <div class="card card--pad">
        <div class="card__head">
          <div class="card__title">各模块正确率</div>
          <div class="card__note">低于 60% 标红</div>
        </div>
        ${total === 0
          ? `<div class="empty" style="padding:30px 10px"><div class="empty__d">还没有练习数据</div></div>`
          : modRows.map(r => `
            <div class="bar-row">
              <div class="bar-row__top">
                <span class="bar-row__name">${r.name}</span>
                <span class="bar-row__val">
                  ${r.acc === null ? '未练习' : `<b>${r.acc}%</b> · ${r.answered} 题`}
                </span>
              </div>
              <div class="bar ${r.acc !== null && r.acc < 60 ? 'bar--cinnabar' : 'bar--jade'}">
                <div class="bar__fill" style="width:${r.acc === null ? 0 : r.acc}%;background:${r.acc === null ? 'var(--line)' : ''}"></div>
              </div>
            </div>`).join('')}
      </div>

      <div>
        <div class="card card--pad">
          <div class="card__head">
            <div class="card__title">错题模块分布</div>
            <div class="card__note">共 ${misTotal} 题</div>
          </div>
          ${misTotal === 0
            ? `<div class="empty" style="padding:30px 10px"><div class="empty__d">错题本为空</div></div>`
            : `<div class="donut-wrap">
                ${donutSvg(modRows.map(r => ({ name: r.short, value: misDist[r.mid] || 0, color: r.accent })))}
                <div class="dl-list">
                  ${modRows.filter(r => (misDist[r.mid] || 0) > 0).map(r => `
                    <div class="dl-row">
                      <i style="background:${r.accent}"></i>
                      <span>${r.name}</span>
                      <b>${misDist[r.mid]} 题</b>
                    </div>`).join('')}
                </div>
              </div>`}
        </div>

        <div class="sec-title"><h3>学习诊断</h3></div>
        <div>${renderDiagnosis(modRows, misDist, acc, total)}</div>
      </div>
    </div>

    <div class="sec-title"><h3>近 14 日练习趋势</h3><span>柱高表示题量，红色表示当日正确率低于 60%</span></div>
    <div class="card card--pad">
      <div class="spark" style="height:140px">
        ${recent.map(d => {
          const max = Math.max(10, ...recent.map(x => x.answered));
          const h = d.answered === 0 ? 0 : Math.max(7, Math.round(d.answered / max * 100));
          const dAcc = d.answered ? d.correct / d.answered * 100 : 100;
          let cls = 'spark__fill';
          if (d.answered === 0) cls = 'is-none';
          else if (dAcc < 60) cls = 'spark__fill is-miss';
          return `
            <div class="spark__col">
              <div class="spark__track">
                <div class="${cls}" style="height:${h}%"></div>
              </div>
              <div class="spark__x ${d.isToday ? 'is-today' : ''}">${d.label}</div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDiagnosis(modRows, misDist, acc, total) {
  const out = [];
  const practiced = modRows.filter(r => r.answered > 0);

  if (total === 0) {
    return `<div class="diag diag--tip">
      <div class="diag__ico">${svgIn('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>', 16)}</div>
      <div>
        <div class="diag__t">先积累一些数据</div>
        <div class="diag__d">完成 20 题以上，这里会根据你的正确率、题型分布给出针对性的复习建议。</div>
      </div>
    </div>`;
  }

  
  const weakest = practiced.slice().sort((a, b) => a.acc - b.acc)[0];
  if (weakest && weakest.acc < 70) {
    out.push(`
      <div class="diag diag--warn">
        <div class="diag__ico">${svgIn('<path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-7h-2v5h2V9z"/>', 16)}</div>
        <div>
          <div class="diag__t">优先补强：${weakest.name}</div>
          <div class="diag__d">该模块正确率 ${weakest.acc}%（${weakest.answered} 题），是全科最低。建议把该模块错题的解析逐句读完，隔天再做一遍同类题。</div>
        </div>
      </div>`);
  }

  
  const strongest = practiced.slice().sort((a, b) => b.acc - a.acc)[0];
  if (strongest && strongest.acc >= 80 && practiced.length >= 2) {
    out.push(`
      <div class="diag diag--ok">
        <div class="diag__ico">${ICO_CHECK}</div>
        <div>
          <div class="diag__t">稳定项：${strongest.name}</div>
          <div class="diag__d">正确率 ${strongest.acc}%，掌握情况较好。可适当减少该模块的练习时间，把精力放到薄弱项上。</div>
        </div>
      </div>`);
  }

  
  const maxMis = Math.max(...Object.values(misDist));
  if (maxMis >= 3) {
    const topMid = Object.keys(misDist).find(k => misDist[k] === maxMis);
    out.push(`
      <div class="diag diag--tip">
        <div class="diag__ico">${svgIn('<path d="M6 4h12v16l-6-4-6 4V4z"/>', 16)}</div>
        <div>
          <div class="diag__t">错题集中在 ${QUESTION_BANK[topMid].name}</div>
          <div class="diag__d">该模块错题 ${maxMis} 题。集中重做比泛做新题更有效，可在错题本按模块筛选后一次性重做。</div>
        </div>
      </div>`);
  }

  
  const touched = Object.keys(state.answeredLog).length;
  if (touched < TOTAL_QUESTIONS * 0.5) {
    out.push(`
      <div class="diag diag--tip">
        <div class="diag__ico">${svgIcoInfo()}</div>
        <div>
          <div class="diag__t">题库覆盖面还不够</div>
          <div class="diag__d">目前只接触了 ${touched} / ${TOTAL_QUESTIONS} 题。建议先把五个模块各过一遍，再针对薄弱项深入。</div>
        </div>
      </div>`);
  }

  return out.join('') || `<div class="diag diag--ok">
    <div class="diag__ico">${ICO_CHECK}</div>
    <div>
      <div class="diag__t">整体状态良好</div>
      <div class="diag__d">各模块正确率均在可接受区间，保持当前节奏，注意定期回顾错题即可。</div>
    </div>
  </div>`;
}

function svgIcoInfo() {
  return svgIn('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>', 16);
}

function donutSvg(items) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const R = 52, SW = 16, C = 2 * Math.PI * R;
  let offset = 0;
  const segs = items.filter(i => i.value > 0).map(it => {
    const frac = it.value / total;
    const dash = C * frac;
    const seg = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${it.color}" stroke-width="${SW}"
      stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset}"
      transform="rotate(-90 60 60)"/>`;
    offset += dash;
    return seg;
  }).join('');

  return `
    <div class="donut">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--paper-deep)" stroke-width="${SW}"/>
        ${segs}
      </svg>
      <div class="donut__c">
        <div class="donut__v">${total}</div>
        <div class="donut__l">错题</div>
      </div>
    </div>`;
}


function renderSettings() {
  const el = $('.view[data-view="settings"]');

  el.innerHTML = `
    <div class="two-col">
      <div class="card card--pad">
        <div class="card__head"><div class="card__title">备考偏好</div></div>

        <div class="field">
          <div class="field__label">目标考试日期</div>
          <input type="date" id="setExamDate" value="${esc(state.settings.examDate)}">
          <div class="field__hint">用于首页倒计时。默认按 2027 年 7 月设置，请按你的实际报考时间调整。</div>
        </div>

        <div class="field">
          <div class="field__label">每日刷题目标（题）</div>
          <input type="number" id="setDailyGoal" min="5" max="200" step="5" value="${state.settings.dailyGoal}" style="width:120px">
          <div class="field__hint">完成目标后首页进度环会填满，建议设在 20—50 题之间，可持续比冲量更重要。</div>
        </div>

        <div class="switch-row">
          <div class="switch-row__body">
            <div class="switch-row__t">答对后自动进入下一题</div>
            <div class="switch-row__d">答错时不自动跳转，方便你当场看解析</div>
          </div>
          <button class="switch ${state.settings.autoNext ? 'is-on' : ''}" id="setAutoNext" aria-label="切换自动下一题"></button>
        </div>
      </div>

      <div>
        <div class="card card--pad">
          <div class="card__head"><div class="card__title">数据管理</div></div>
          <div style="font-size:13.5px;color:var(--text-sub);line-height:1.85;margin-bottom:16px">
            ${preview?'当前示例数据仅保留本页；安装后，练习记录、错题与收藏保存在本应用的云端数据库。':'练习记录、错题与收藏保存在本应用的云端数据库，保存成功后刷新或重新打开可继续学习。未确认保存的修改请先保留备份。'}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center;margin-bottom:18px">
            <div class="result__cell">
              <div class="result__num">${state.stats.totalAnswered}</div>
              <div class="result__lb">累计答题</div>
            </div>
            <div class="result__cell">
              <div class="result__num">${Object.keys(state.mistakes).length}</div>
              <div class="result__lb">错题收录</div>
            </div>
            <div class="result__cell">
              <div class="result__num">${state.bookmarks.length}</div>
              <div class="result__lb">收藏素材</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn--ghost btn--sm" id="exportData">导出记录</button>
            <button class="btn btn--ghost btn--sm" id="resetData" style="color:var(--cinnabar);border-color:#F0D2CF">清空所有数据</button>
          </div>
        </div>

        <div class="card card--pad" style="margin-top:16px">
          <div class="card__head"><div class="card__title">关于本工具</div></div>
          <div style="font-size:13.5px;color:var(--text-sub);line-height:1.9">
            题库共 ${TOTAL_QUESTIONS} 题，覆盖行测五大模块，每题配详细解析与考点标注；申论部分收录 ${SHENLUN_QUOTES.length} 条金句、${SHENLUN_EXPRESSIONS.length} 组规范表达与 ${SHENLUN_FRAMES.length} 套作文框架。
            <br><br>
            题目与解析为学习练习用途整理，不构成押题；实战请以官方考试大纲和真题为准。
          </div>
        </div>
      </div>
    </div>
  `;

  const dEl = $('#setExamDate', el);
  if (dEl) dEl.addEventListener('change', async () => {
    state.settings.examDate = dEl.value;
    if(!await saveState())return;
    refreshBadges();
    const cd=document.querySelector('#countdownVal');if(cd)cd.textContent=getDaysToExam();
    const date=document.querySelector('#countdownDate');if(date)date.textContent=state.settings.examDate;
    toast('考试日期已更新');
  });

  const gEl = $('#setDailyGoal', el);
  if (gEl) gEl.addEventListener('change', async () => {
    let v = parseInt(gEl.value, 10);
    if (isNaN(v) || v < 5) v = 5;
    if (v > 200) v = 200;
    gEl.value = v;
    state.settings.dailyGoal = v;
    if(!await saveState())return;
    refreshBadges();
    const cd=document.querySelector('#countdownVal');if(cd)cd.textContent=getDaysToExam();
    const date=document.querySelector('#countdownDate');if(date)date.textContent=state.settings.examDate;
    toast('每日目标已更新');
  });

  const aEl = $('#setAutoNext', el);
  if (aEl) aEl.addEventListener('click', async () => {
    state.settings.autoNext = !state.settings.autoNext;
    aEl.classList.toggle('is-on', state.settings.autoNext);
    if(!await saveState())return;
    refreshBadges();
    const cd=document.querySelector('#countdownVal');if(cd)cd.textContent=getDaysToExam();
    const date=document.querySelector('#countdownDate');if(date)date.textContent=state.settings.examDate;
    toast(state.settings.autoNext ? '已开启自动下一题' : '已关闭自动下一题');
  });

  installDataControls(el);
  const ex = $('#exportData', el);
  if (ex) ex.addEventListener('click', () => {
    if(preview)return;
    const blob = new Blob([JSON.stringify(canonical, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kaogong-records-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('记录已导出');
  });

  const rs = $('#resetData', el);
  if (rs) rs.addEventListener('click', () => showConfirm(
    '清空所有数据',
    '练习记录、错题本、收藏素材都会被删除，且无法恢复。确定继续吗？',
    async () => {
      if(!await resetAll())return;
      session = null;
      stopTimer();
      toast('已清空全部数据');
      refreshBadges();
      renderSettings();
    }
  ));
}


function showConfirm(title, desc, onOk) {
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `
    <div class="modal__box">
      <div class="modal__t">${esc(title)}</div>
      <div class="modal__d">${esc(desc)}</div>
      <div class="modal__foot">
        <button class="btn btn--ghost btn--sm" data-cancel>取消</button>
        <button class="btn btn--accent btn--sm" data-ok>确定</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);

  const close = () => wrap.remove();
  wrap.querySelector('[data-cancel]').addEventListener('click', close);
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  wrap.querySelector('[data-ok]').addEventListener('click', () => { close(); onOk(); });
}


document.addEventListener('click', e => {
  const redo = e.target.closest && e.target.closest('#redoWrong');
  if (redo) {
    const wrongIds = session.list
      .filter((_, i) => session.results[i] === false)
      .map(q => q.id);
    if (wrongIds.length) {
      startSession('redo', wrongIds);
    }
    return;
  }

  const another = e.target.closest && e.target.closest('#anotherRound');
  if (another) {
    const mode = session.mode === 'redo' ? 'mixed' : session.mode;
    startSession(mode);
    return;
  }

  const gm = e.target.closest && e.target.closest('#goMistakes');
  if (gm) { stopTimer(); session = null; navTo('mistakes'); return; }

  const ex = e.target.closest && e.target.closest('#exitQuiz');
  if (ex) { stopTimer(); session = null; renderPractice(); refreshBadges(); }
});


document.addEventListener('click', e => {
  const hd = e.target.closest && e.target.closest('[data-toggle-mis]');
  if (hd) {
    const card = hd.closest('.mis');
    const bd = card && card.querySelector('.mis__bd');
    if (bd) {
      
      requestAnimationFrame(() => { bd.hidden = !card.classList.contains('is-open'); });
    }
  }
});


document.addEventListener('keydown', e => {
  if (currentView !== 'practice' || !session) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;

  const key = e.key.toUpperCase();
  if (!session.submitted) {
    const i = KEY_LABELS.indexOf(key);
    if (i >= 0) {
      selectOption(i);
    } else if (e.key === 'Enter' && session.picked !== null) {
      doSubmit();
    }
  } else {
    if (e.key === 'Enter') {
      const btn = $('#nextBtn') || $('#exitQuiz');
      if (btn) btn.click();
    } else if (e.key === 'ArrowLeft') {
      const p = $('#prevBtn');
      if (p) p.click();
    }
  }
});


function init() {
  
  $$('.nav__item').forEach(btn => {
    btn.addEventListener('click', () => {
      if (session && btn.dataset.view !== 'practice') {
        
        stopTimer();
      }
      navTo(btn.dataset.view);
    });
  });

  
  const cd = $('#countdownVal');
  if (cd) cd.textContent = getDaysToExam();
  const cdDate = $('#countdownDate');
  if (cdDate) cdDate.textContent = state.settings.examDate;

  refreshBadges();

  
  const hash = (location.hash || '').replace('#', '');
  const startView = VIEWS[hash] ? hash : 'dashboard';
  navTo(startView);
}

mountShell();init();loadCanonical();

function installDataControls(el){
 const ex=document.querySelector('#exportData');if(preview&&ex){ex.disabled=true;ex.title='安装后可下载记录'}
 const row=ex?.parentElement;if(!row)return;
 row.insertAdjacentHTML('beforeend','<button class="btn btn--ghost btn--sm" id="toggleImport">导入记录</button>');row.insertAdjacentHTML('afterend','<div class="import-box" id="importBox" hidden><label for="importJson">粘贴已导出的学习数据JSON</label><textarea id="importJson"></textarea><button class="btn btn--accent btn--sm" id="confirmImport">校验并导入</button></div>');
 document.querySelector('#toggleImport').onclick=()=>document.querySelector('#importBox').hidden=!document.querySelector('#importBox').hidden;
 document.querySelector('#confirmImport').onclick=()=>{try{const next=validateImport(JSON.parse(document.querySelector('#importJson').value),new Set(Object.keys(QUESTION_INDEX)));showConfirm('导入学习记录','这会替换当前记录，建议先导出备份。',async()=>{if(await persistCanonical(next)){session=null;stopTimer();refreshBadges();renderSettings();toast('记录已导入')}})}catch(error){toast(error.message)}};
}
document.addEventListener('click',e=>{if(blocked()&&!e.target.closest('#reload-data')){e.preventDefault();e.stopImmediatePropagation()}},true);
document.addEventListener('keydown',e=>{if(blocked()){e.preventDefault();e.stopImmediatePropagation()}},true);
window.addEventListener('hashchange',()=>{const view=location.hash.slice(1);if(blocked()){history.replaceState(null,'','#'+currentView);return}if(VIEWS[view]&&view!==currentView)navTo(view)});
