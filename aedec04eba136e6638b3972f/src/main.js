import './style.css';
import { saveResult, listResults, getResult } from './store.js';
export async function mount(root, context) {
const css = document.createElement('link'); css.rel='stylesheet'; css.href=new URL('./math-test.css',import.meta.url).href; document.head.append(css);
const pages = {"home": "\n<div class=\"page-bg\" aria-hidden=\"true\">\n  <i class=\"p-blob pb1\"></i><i class=\"p-blob pb2\"></i><i class=\"p-blob pb3\"></i><i class=\"p-blob pb4\"></i>\n  <i class=\"p-star ps1\">✦</i><i class=\"p-star ps2\">★</i><i class=\"p-star ps3\">✦</i>\n</div>\n<header class=\"app-header\">\n  <h1><img class=\"h-logo\" src=\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZiMzVjIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmNmI2YiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9InVybCgjZykiLz4KICA8dGV4dCB4PSIzMiIgeT0iNDUiIGZvbnQtc2l6ZT0iMzYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiCiAgICAgICAgZm9udC1mYW1pbHk9IidQaW5nRmFuZyBTQycsJ01pY3Jvc29mdCBZYUhlaScsJ0hpcmFnaW5vIFNhbnMgR0InLHNhbnMtc2VyaWYiCiAgICAgICAgZm9udC13ZWlnaHQ9IjcwMCI+5pWwPC90ZXh0Pgo8L3N2Zz4K\" alt=\"\">数学测试</h1>\n  <p class=\"subtitle\">小学 · 初中 同步练习与测试</p>\n</header>\n<div class=\"auth-bar\"><div class=\"auth-area\" id=\"authArea\"></div></div>\n<main class=\"container\">\n  <section class=\"features\">\n    <div class=\"feature\"><div class=\"f-ico t-target\"><svg class=\"ico\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"4.5\"/><circle cx=\"12\" cy=\"12\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg></div><div class=\"f-text\"><b>按年级精准练</b><span>小学 1-6 / 初中 7-9，不串年级</span></div></div>\n    <div class=\"feature\"><div class=\"f-ico t-bolt\"><svg class=\"ico\" viewBox=\"0 0 24 24\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg></div><div class=\"f-text\"><b>即时解析</b><span>练习模式答完即看对错与讲解</span></div></div>\n    <div class=\"feature\"><div class=\"f-ico t-cloud\"><svg class=\"ico\" viewBox=\"0 0 24 24\"><polyline points=\"16 16 12 12 8 16\"/><line x1=\"12\" y1=\"12\" x2=\"12\" y2=\"21\"/><path d=\"M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3\"/></svg></div><div class=\"f-text\"><b>云端存档</b><span>登录后成绩自动保存可追溯</span></div></div>\n  </section>\n\n  <section class=\"grade-tabs\" id=\"gradeTabs\"></section>\n\n  <section class=\"level-section\" id=\"levelSection\" style=\"display:none\">\n    <h2 class=\"section-title\">选择年级</h2>\n    <div class=\"level-tabs\" id=\"levelTabs\"></div>\n  </section>\n\n  <section class=\"mode-section\">\n    <h2 class=\"section-title\">选择模式</h2>\n    <div class=\"mode-cards\" id=\"modeCards\">\n      <div class=\"mode-card\" data-mode=\"practice\">\n        <div class=\"mode-icon mi-practice\"><svg class=\"ico\" viewBox=\"0 0 24 24\"><path d=\"M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z\"/></svg></div>\n        <div class=\"mode-name\">练习模式</div>\n        <div class=\"mode-desc\">逐题作答，即时反馈对错与解析</div>\n      </div>\n      <div class=\"mode-card\" data-mode=\"test\">\n        <div class=\"mode-icon mi-test\"><svg class=\"ico\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"13\" r=\"8\"/><line x1=\"12\" y1=\"13\" x2=\"15\" y2=\"10\"/><line x1=\"10\" y1=\"2\" x2=\"14\" y2=\"2\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"5\"/></svg></div>\n        <div class=\"mode-name\">测试模式</div>\n        <div class=\"mode-desc\">限时答题，交卷后统一看成绩</div>\n      </div>\n    </div>\n  </section>\n\n  <section class=\"sel-summary\" id=\"selSummary\" style=\"display:none\"></section>\n\n  <section class=\"topic-section\">\n    <h2 class=\"section-title\">选择知识点</h2>\n    <div id=\"topicList\" class=\"topic-list\"><p class=\"hint\">请依次选择学段、年级与模式</p></div>\n  </section>\n\n  <section class=\"share-section\">\n    <div class=\"share-card\">\n      <div class=\"share-title\"><svg class=\"ico sh-ico\" viewBox=\"0 0 24 24\"><circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><line x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/><line x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/></svg>觉得好用？分享给同学 / 家长</div>\n      <div class=\"share-link\" id=\"shareLink\"></div>\n      <div class=\"share-btns\">\n        <button class=\"ghost-btn\" id=\"copyLinkBtn\" type=\"button\">复制链接</button>\n        <button class=\"primary-btn\" id=\"shareBtn\" type=\"button\">分享</button>\n      </div>\n      <div class=\"form-msg\" id=\"shareMsg\"></div>\n    </div>\n  </section>\n</main>\n\n\n\n\n\n\n", "quiz": "\n<header class=\"app-header sub\">\n  <button class=\"back-btn\" id=\"goHome\">‹ 首页</button>\n  <div class=\"quiz-title\" id=\"quizTitle\">答题</div>\n  <div class=\"timer\" id=\"timer\" style=\"display:none\"></div>\n</header>\n<main class=\"container\" id=\"quizContainer\">\n  <div id=\"loading\" class=\"hint\">准备题目中…</div>\n</main>\n\n<!-- 题目弹窗 -->\n<div class=\"modal-mask\" id=\"qMask\" style=\"display:none\">\n  <div class=\"modal-box q-modal\">\n    <div class=\"q-progress\"><span id=\"qProgress\">第 1 / 10 题</span><span id=\"qTag\" class=\"q-tag\"></span></div>\n    <div class=\"q-stem\" id=\"qStem\"></div>\n    <div class=\"q-shape\" id=\"qShape\" style=\"display:none\"></div>\n    <div class=\"q-body\" id=\"qBody\"></div>\n    <div class=\"q-feedback\" id=\"qFeedback\" style=\"display:none\"></div>\n    <div class=\"q-actions\">\n      <button class=\"primary-btn\" id=\"qActionBtn\" type=\"button\">确认答案</button>\n    </div>\n  </div>\n</div>\n\n<!-- 分数弹窗 -->\n<div class=\"modal-mask\" id=\"scoreMask\" style=\"display:none\">\n  <div class=\"modal-box score-modal\">\n    <div class=\"score-circle\" id=\"scoreCircle\">0%</div>\n    <div class=\"score-text\" id=\"scoreText\">答对 0 / 0 题</div>\n    <div class=\"score-note\" id=\"scoreNote\" style=\"display:none\"></div>\n    <div class=\"score-actions\">\n      <button class=\"primary-btn\" id=\"viewDetailBtn\" type=\"button\">查看解析</button>\n      <button class=\"ghost-btn\" id=\"retryBtn\" type=\"button\">再来一次</button>\n      <button class=\"ghost-btn\" id=\"homeBtn\" type=\"button\">返回首页</button>\n    </div>\n  </div>\n</div>\n\n\n\n\n\n\n", "result": "\n<header class=\"app-header sub\">\n  <button class=\"back-btn\" id=\"goHome\">‹ 首页</button>\n  <div class=\"quiz-title\">成绩报告</div>\n</header>\n<main class=\"container\" id=\"resultContainer\">\n  <div class=\"hint\">加载中…</div>\n</main>\n\n", "history": "\n<header class=\"app-header sub\">\n  <button class=\"back-btn\" id=\"goHome\">‹ 首页</button>\n  <div class=\"quiz-title\">我的成绩</div>\n</header>\n<div class=\"auth-bar\"><div class=\"auth-area\" id=\"authArea\"></div></div>\n<main class=\"container\" id=\"historyContainer\">\n  <div class=\"hint\">加载中…</div>\n</main>\n\n\n\n\n\n"};
function navigate(target) { location.hash = target; location.reload(); }
const route = (location.hash.slice(1).split('?')[0] || 'home');
root.innerHTML = pages[route] || pages.home;
document.getElementById('goHome')?.addEventListener('click',()=>navigate('home'));
const authArea=document.getElementById('authArea'); if(authArea) authArea.innerHTML='<span class="auth-user">已登录</span><a class="auth-link" href="#history">我的成绩</a>';
window.addEventListener('hashchange',()=>location.reload());

if (route === "home") {
// 通用工具：学段配置、参数解析、数据加载、答案判分
const GRADE_FILES = {
  xiaoxue: 'resource/data/xiaoxue.json',
  chuzhong: 'resource/data/chuzhong.json'
};

function getParam(name) {
  return new URLSearchParams(location.hash.split('?')[1] || '').get(name);
}

function normalizeAnswer(s) {
  if (s === null || s === undefined) return '';
  return String(s).trim().replace(/\s+/g, '').toLowerCase();
}

async function loadGradeData(grade) { if (!['xiaoxue','chuzhong'].includes(grade)) throw new Error('未知学段'); const response = await context.files.get(`template-assets/${grade}.json`); if (!response.ok) throw new Error('题库读取失败'); return response.json(); }

function findGrade(data, levelId) {
  return data.grades.find(g => g.id === levelId) || null;
}

// 按年级定位知识点：先找年级，再在该年级的章节里找 topic
function findTopic(data, levelId, topicId) {
  const grade = findGrade(data, levelId);
  if (!grade) return null;
  for (const ch of grade.chapters) {
    const t = ch.topics.find(t => t.id === topicId);
    if (t) return { ...t, chapterName: ch.name, gradeName: grade.name };
  }
  return null;
}

// 判分：choice 支持单选(answer=索引) 与多选(answer=索引数组)；fill 支持多个可接受答案
function isCorrect(q, userAns) {
  if (q.type === 'choice') {
    if (q.multiple) {
      if (!Array.isArray(userAns) || userAns.length !== q.answer.length) return false;
      const a = [...userAns].map(Number).sort();
      const b = [...q.answer].sort();
      return a.every((v, i) => v === b[i]);
    }
    return userAns !== null && userAns !== undefined && userAns !== '' && Number(userAns) === q.answer;
  } else {
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    const u = normalizeAnswer(userAns);
    return accepted.some(a => normalizeAnswer(a) === u);
  }
}

function formatUserAnswer(q, ua) {
  if (ua === null || ua === undefined || ua === '') return '（未作答）';
  if (q.type === 'choice') {
    if (q.multiple) return (ua || []).map(i => q.options[i]).join('、');
    return q.options[ua];
  }
  return ua;
}

function formatRight(q) {
  if (q.type === 'choice') {
    if (q.multiple) return q.answer.map(i => q.options[i]).join('、');
    return q.options[q.answer];
  }
  return Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer;
}

// 首页逻辑：学段 -> 年级 -> 模式 -> 知识点 四级选择
const state = { grade: null, level: null, mode: null, data: null };

const gradeTabs = document.getElementById('gradeTabs');
const levelSection = document.getElementById('levelSection');
const levelTabs = document.getElementById('levelTabs');
const modeCards = document.getElementById('modeCards');
const topicList = document.getElementById('topicList');

const ICON_PENCIL = '<svg class="ico" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
const ICON_ROCKET = '<svg class="ico" viewBox="0 0 24 24"><path d="M12 2.5C15 4.5 16.5 8 16.5 11.5L12 16 7.5 11.5C7.5 8 9 4.5 12 2.5Z"/><circle cx="12" cy="9" r="1.7"/><path d="M7.5 11 4 14.5l4 .8"/><path d="M16.5 11l3.5 3.5-4 .8"/><path d="M10.5 17 12 21.5 13.5 17"/></svg>';

function renderGradeTabs() {
  const grades = [
    { key: 'xiaoxue', name: '小学', icon: ICON_PENCIL, desc: '1-6 年级', cls: 'stage-primary' },
    { key: 'chuzhong', name: '初中', icon: ICON_ROCKET, desc: '7-9 年级', cls: 'stage-junior' }
  ];
  gradeTabs.innerHTML = grades.map(g =>
    `<button class="stage-tab ${g.cls} ${state.grade === g.key ? 'active' : ''}" data-grade="${g.key}">
      <span class="stage-emoji">${g.icon}</span>
      <span class="stage-name">${g.name}</span>
      <span class="stage-desc">${g.desc}</span>
    </button>`
  ).join('');
  gradeTabs.querySelectorAll('.stage-tab').forEach(b => {
    b.addEventListener('click', async () => {
      state.grade = b.dataset.grade;
      state.level = null;
      state.data = null;
      renderGradeTabs();
      updateSummary();
      await loadAndRenderLevels();
      renderTopics();
    });
  });
}

async function loadAndRenderLevels() {
  if (!state.grade) { levelSection.style.display = 'none'; return; }
  if (!state.data) {
    try {
      const selectedGrade = state.grade;
      const loaded = await loadGradeData(selectedGrade);
      if (state.grade !== selectedGrade) return;
      state.data = loaded;
    } catch (e) {
      levelSection.style.display = 'block';
      levelTabs.innerHTML = '<p class="hint">题库加载失败，请检查网络后重新选择学段。</p>';
      return;
    }
  }
  levelSection.style.display = 'block';
  updateSummary();
  levelTabs.innerHTML = state.data.grades.map(g =>
    `<button class="tab ${state.level === g.id ? 'active' : ''}" data-level="${g.id}">${g.name}</button>`
  ).join('');
  levelTabs.querySelectorAll('.tab').forEach(b => {
    b.addEventListener('click', () => {
      state.level = b.dataset.level;
      renderLevelsActive();
      updateSummary();
      renderTopics();
    });
  });
}

function renderLevelsActive() {
  levelTabs.querySelectorAll('.tab').forEach(b =>
    b.classList.toggle('active', b.dataset.level === state.level));
}

// 选择路径摘要条：小学 › 一年级 › 练习模式
function updateSummary() {
  const path = [];
  if (state.grade) path.push(state.grade === 'xiaoxue' ? '小学' : '初中');
  if (state.level && state.data) {
    const lv = findGrade(state.data, state.level);
    if (lv) path.push(lv.name);
  }
  if (state.mode) path.push(state.mode === 'practice' ? '练习模式' : '测试模式');
  const el = document.getElementById('selSummary');
  if (!path.length) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  el.innerHTML = '<div class="sel-path">' + path.map((p, i) =>
    `<span class="sel-item${i === path.length - 1 ? ' on' : ''}">${p}</span>` +
    (i < path.length - 1 ? '<span class="sel-sep">›</span>' : '')
  ).join('') + '</div>';
}

modeCards.querySelectorAll('.mode-card').forEach(c => {
  c.addEventListener('click', () => {
    if (!state.level) { alert('请先选择年级'); return; }
    state.mode = c.dataset.mode;
    modeCards.querySelectorAll('.mode-card').forEach(x =>
      x.classList.toggle('active', x.dataset.mode === state.mode));
    updateSummary();
    renderTopics();
  });
});

async function renderTopics() {
  if (!state.grade || !state.level || !state.mode) {
    topicList.innerHTML = '<p class="hint">请依次选择学段、年级与模式</p>';
    return;
  }
  if (!state.data) {
    try {
      const selectedGrade = state.grade;
      const loaded = await loadGradeData(selectedGrade);
      if (state.grade !== selectedGrade) return;
      state.data = loaded;
    } catch (e) {
      topicList.innerHTML = '<p class="hint">题库加载失败，请检查网络后重试。</p>';
      return;
    }
  }
  const grade = findGrade(state.data, state.level);
  let html = '';
  for (const ch of grade.chapters) {
    html += `<div class="chapter"><div class="chapter-name">${ch.name}</div><div class="topic-chips">`;
    for (const t of ch.topics) {
      html += `<button class="topic-chip" data-topic="${t.id}">${t.name}<span class="qcount">${t.questions.length}题</span></button>`;
    }
    html += `</div></div>`;
  }
  topicList.innerHTML = html;
  topicList.querySelectorAll('.topic-chip').forEach(b => {
    b.addEventListener('click', () => {
      navigate(`quiz?grade=${state.grade}&level=${state.level}&topic=${b.dataset.topic}&mode=${state.mode}`);
    });
  });
}

// 分享入口：复制链接 / 调起系统分享
(function initShare() {
  const shareUrl = location.href.split('#')[0];
  const linkEl = document.getElementById('shareLink');
  if (linkEl) linkEl.textContent = shareUrl;
  const msg = document.getElementById('shareMsg');
  const copyBtn = document.getElementById('copyLinkBtn');
  const shareBtn = document.getElementById('shareBtn');
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (msg) { msg.textContent = '链接已复制'; msg.className = 'form-msg ok'; }
    } catch (e) {
      if (msg) { msg.textContent = '复制失败，请手动复制'; msg.className = 'form-msg err'; }
    }
  });
  if (shareBtn) shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '数学测试', text: '按年级精准练的数学同步练习工具', url: shareUrl });
      } catch (e) { /* 用户取消 */ }
    } else if (copyBtn) {
      copyBtn.click();
    }
  });
})();

renderGradeTabs();

}
if (route === "quiz") {
// 通用工具：学段配置、参数解析、数据加载、答案判分
const GRADE_FILES = {
  xiaoxue: 'resource/data/xiaoxue.json',
  chuzhong: 'resource/data/chuzhong.json'
};

function getParam(name) {
  return new URLSearchParams(location.hash.split('?')[1] || '').get(name);
}

function normalizeAnswer(s) {
  if (s === null || s === undefined) return '';
  return String(s).trim().replace(/\s+/g, '').toLowerCase();
}

async function loadGradeData(grade) { if (!['xiaoxue','chuzhong'].includes(grade)) throw new Error('未知学段'); const response = await context.files.get(`template-assets/${grade}.json`); if (!response.ok) throw new Error('题库读取失败'); return response.json(); }

function findGrade(data, levelId) {
  return data.grades.find(g => g.id === levelId) || null;
}

// 按年级定位知识点：先找年级，再在该年级的章节里找 topic
function findTopic(data, levelId, topicId) {
  const grade = findGrade(data, levelId);
  if (!grade) return null;
  for (const ch of grade.chapters) {
    const t = ch.topics.find(t => t.id === topicId);
    if (t) return { ...t, chapterName: ch.name, gradeName: grade.name };
  }
  return null;
}

// 判分：choice 支持单选(answer=索引) 与多选(answer=索引数组)；fill 支持多个可接受答案
function isCorrect(q, userAns) {
  if (q.type === 'choice') {
    if (q.multiple) {
      if (!Array.isArray(userAns) || userAns.length !== q.answer.length) return false;
      const a = [...userAns].map(Number).sort();
      const b = [...q.answer].sort();
      return a.every((v, i) => v === b[i]);
    }
    return userAns !== null && userAns !== undefined && userAns !== '' && Number(userAns) === q.answer;
  } else {
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    const u = normalizeAnswer(userAns);
    return accepted.some(a => normalizeAnswer(a) === u);
  }
}

function formatUserAnswer(q, ua) {
  if (ua === null || ua === undefined || ua === '') return '（未作答）';
  if (q.type === 'choice') {
    if (q.multiple) return (ua || []).map(i => q.options[i]).join('、');
    return q.options[ua];
  }
  return ua;
}

function formatRight(q) {
  if (q.type === 'choice') {
    if (q.multiple) return q.answer.map(i => q.options[i]).join('、');
    return q.options[q.answer];
  }
  return Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer;
}

// 答题页逻辑（弹窗逐题作答，答完本知识点全部题目后弹分数）
// 支持练习(即时反馈) 与 测试(不即时反馈) 两种模式，题型含选择/填空
const grade = getParam('grade');
const level = getParam('level');
const topicId = getParam('topic');
const mode = getParam('mode') || 'practice';

let data = null, topic = null, pool = [], userAnswers = {};
let current = 0, answered = false, correctCount = 0;
let timerInterval = null;

const $ = id => document.getElementById(id);

async function init() {
  try {
    data = await loadGradeData(grade);
  } catch (e) {
    $('quizContainer').innerHTML = '<p class="hint">题库加载失败，请检查网络后重试。</p>';
    return;
  }
  topic = findTopic(data, level, topicId);
  if (!topic) { $('quizContainer').innerHTML = '<p class="hint">未找到该知识点</p>'; return; }

  $('quizTitle').textContent = `${data.grade} · ${topic.gradeName} · ${topic.name}`;
  pool = buildPool(data, level, topicId);
  if (pool.length === 0) { $('quizContainer').innerHTML = '<p class="hint">该知识点暂无题目</p>'; return; }

  $('loading').style.display = 'none';
  if (mode === 'test') startTimer(pool.length);
  showQuestion(0);
}

// 构建题目池：只出本知识点的题目，有几题答几题（与卡片标注的题数保持一致，不从他处补题）
function buildPool(data, level, topicId) {
  const base = findTopic(data, level, topicId);
  const pool = (base.questions || []).map(q => ({ ...q, srcChapter: base.chapterName, srcTopic: base.name }));
  return shuffle(pool);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showQuestion(i) {
  current = i; answered = false;
  const q = pool[i];
  $('qProgress').textContent = `第 ${i + 1} / ${pool.length} 题`;
  $('qTag').textContent = q.srcTopic ? `· ${q.srcTopic}` : '';
  $('qStem').textContent = q.stem;
  const sb = $('qShape');
  if (sb) {
    const svg = q.clock ? clockSVG(q.clock) : (q.shape ? shapeSVG(q.shape) : '');
    sb.innerHTML = svg;
    sb.style.display = svg ? 'flex' : 'none';
  }
  $('qBody').innerHTML = renderBody(q, i);
  const fb = $('qFeedback'); fb.style.display = 'none'; fb.innerHTML = ''; fb.className = 'q-feedback';
  bindBody(q, i);
  setActionBtn();
  $('qMask').style.display = 'flex';
}

function renderBody(q, i) {
  if (q.type === 'choice') {
    const it = q.multiple ? 'checkbox' : 'radio';
    return q.options.map((opt, oi) =>
      `<label class="opt ${q.multiple ? 'opt-multi' : ''}">
        <input type="${it}" name="qopt-${i}" value="${oi}" data-i="${i}">
        <span class="opt-text">${opt}</span>
      </label>`).join('');
  }
  return `<input type="text" class="fill-input" id="fill-${i}" placeholder="请输入答案">`;
}

function bindBody(q, i) {
  if (q.type !== 'choice') {
    const f = $('fill-' + i);
    if (f) f.addEventListener('keydown', e => { if (e.key === 'Enter') onAction(); });
  }
}

function collectAnswer(q, i) {
  if (q.type === 'choice') {
    if (q.multiple) return [...$('qBody').querySelectorAll('input:checked')].map(x => Number(x.value));
    const c = $('qBody').querySelector('input:checked');
    return c ? Number(c.value) : null;
  }
  const f = $('fill-' + i);
  return f ? f.value.trim() : '';
}

function onAction() {
  const q = pool[current];
  const ua = collectAnswer(q, current);
  if (mode === 'practice') {
    if (!answered) {
      userAnswers[current] = ua;
      showFeedback(q, ua, current);
      answered = true;
      setActionBtn();
    } else {
      nextOrFinish();
    }
  } else {
    userAnswers[current] = ua;
    nextOrFinish();
  }
}

function showFeedback(q, ua, i) {
  const c = isCorrect(q, ua);
  const fb = $('qFeedback'); fb.style.display = 'block';
  let html = c ? '<div class="fb-line ok">✅ 回答正确</div>' : '<div class="fb-line no">❌ 回答错误</div>';
  if (q.type === 'choice') {
    $('qBody').querySelectorAll('input').forEach(inp => {
      const vi = Number(inp.value), lbl = inp.closest('.opt');
      lbl.classList.remove('correct', 'wrong');
      if (q.multiple) { if (q.answer.includes(vi)) lbl.classList.add('correct'); else if (inp.checked) lbl.classList.add('wrong'); }
      else { if (vi === q.answer) lbl.classList.add('correct'); else if (inp.checked) lbl.classList.add('wrong'); }
      inp.disabled = true;
    });
  } else {
    const f = $('fill-' + i);
    if (f) { f.disabled = true; f.classList.add(c ? 'correct' : 'wrong'); }
  }
  html += `<div class="explain">${q.explain}</div>`;
  fb.innerHTML = html;
}

function setActionBtn() {
  const btn = $('qActionBtn');
  const last = current === pool.length - 1;
  if (mode === 'practice') {
    btn.textContent = answered ? (last ? '查看分数' : '下一题') : '确认答案';
  } else {
    btn.textContent = last ? '交卷' : '下一题';
  }
}

function nextOrFinish() {
  if (current < pool.length - 1) showQuestion(current + 1);
  else finish();
}

function startTimer(count) {
  const timerEl = $('timer');
  timerEl.style.display = 'block';
  const total = Math.min(count * 45, 600);
  let remain = total;
  timerEl.textContent = '⏱ ' + fmt(remain);
  timerInterval = setInterval(() => {
    remain--;
    timerEl.textContent = '⏱ ' + fmt(remain);
    if (remain <= 0) { clearInterval(timerInterval); finish(); }
  }, 1000);
}

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

let currentResultId = null;
async function finish() {
  clearInterval(timerInterval);
  let correct = 0;
  const details = pool.map((q, i) => {
    const ua = userAnswers[i] ?? null;
    const c = isCorrect(q, ua);
    if (c) correct++;
    return {
      stem: q.stem, type: q.type,
      your: formatUserAnswer(q, ua),
      right: formatRight(q),
      explain: q.explain, correct: c,
      srcTopic: q.srcTopic, srcChapter: q.srcChapter
    };
  });
  correctCount = correct;
  const result = {
    id: crypto.randomUUID(), grade: data.grade, gradeKey: grade, levelId: level, levelName: topic.gradeName, topicId: topicId,
    chapter: topic.chapterName, topic: topic.name, mode,
    total: pool.length, correct, details
  };
  currentResultId = null;
  if (await saveResultToCloud(result)) currentResultId = result.id;
  showScore(correct, pool.length);
}

function showScore(correct, total) {
  const pct = total ? Math.round(correct / total * 100) : 0;
  $('scoreCircle').textContent = pct + '%';
  $('scoreText').textContent = `答对 ${correct} / 共 ${total} 题`;
  const note = $('scoreNote');
  if (total < 10) {
    note.textContent = `该知识点共有 ${total} 题`;
    note.style.display = 'block';
  } else {
    note.style.display = 'none';
  }
  $('qMask').style.display = 'none';
  $('scoreMask').style.display = 'flex';
}

function restart() {
  userAnswers = {}; correctCount = 0; current = 0; answered = false;
  pool = buildPool(data, level, topicId);
  $('scoreMask').style.display = 'none';
  if (mode === 'test') startTimer(pool.length);
  showQuestion(0);
}

$('qActionBtn').addEventListener('click', onAction);
$('viewDetailBtn').addEventListener('click', () => { if (currentResultId) navigate('result?id=' + encodeURIComponent(currentResultId)); else alert('成绩尚未保存，请返回首页重试。'); });
$('retryBtn').addEventListener('click', restart);
$('homeBtn').addEventListener('click', () => { navigate('home'); });

// 保存成绩；结果未知时提示用户先核对历史记录
async function saveResultToCloud(result) { try { await saveResult(result); return true; } catch (e) { console.error(e); alert('成绩保存结果未知，请在成绩页面确认。'); return false; } }

// 钟表 SVG（按 "H:MM" 绘制时针/分针，离线可用）
function clockSVG(t) {
  const wrap = s => `<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  const [h, m] = t.split(':').map(Number);
  const cx = 100, cy = 90, r = 58;
  const rad = d => (d - 90) * Math.PI / 180;
  const pt = (ang, len) => [cx + len * Math.cos(rad(ang)), cy + len * Math.sin(rad(ang))];
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = i * 30;
    const [x1, y1] = pt(a, r - 7), [x2, y2] = pt(a, r - 2);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#5b6b73" stroke-width="2"/>`;
  }
  const [mx, my] = pt(m * 6, r * 0.72);
  const [hx, hy] = pt((h % 12) * 30 + m * 0.5, r * 0.46);
  return wrap(`
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fffdf3" stroke="#37474f" stroke-width="3"/>
    ${ticks}
    <line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#37474f" stroke-width="4" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#1f2d33" stroke-width="6" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="4" fill="#1f2d33"/>`);
}

// 立体图形 SVG（等距视角，卡通、清晰，离线可用）
function shapeSVG(type) {
  const wrap = s => `<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  if (type === 'cube') {
    return wrap(`
      <polygon points="100,20 162,55 100,90 38,55" fill="#7cb3ff"/>
      <polygon points="38,55 100,90 100,161 38,126" fill="#4f8ef7"/>
      <polygon points="162,55 100,90 100,161 162,126" fill="#2f6fd0"/>
      <g fill="none" stroke="#1f4f9e" stroke-width="2.5" stroke-linejoin="round">
        <polygon points="100,20 162,55 100,90 38,55"/>
        <path d="M38,55 V126 L100,161 V90 Z"/>
        <path d="M162,55 V126 L100,161"/>
      </g>`);
  }
  if (type === 'cuboid') {
    return wrap(`
      <polygon points="95,48 178,70 95,92 12,70" fill="#ffc163"/>
      <polygon points="12,70 95,92 95,132 12,110" fill="#ff9e3d"/>
      <polygon points="178,70 95,92 95,132 178,110" fill="#f57c00"/>
      <g fill="none" stroke="#c25e00" stroke-width="2.5" stroke-linejoin="round">
        <polygon points="95,48 178,70 95,92 12,70"/>
        <path d="M12,70 V110 L95,132 V92 Z"/>
        <path d="M178,70 V110 L95,132"/>
      </g>`);
  }
  if (type === 'sphere') {
    return wrap(`
      <circle cx="100" cy="95" r="58" fill="#ff7a85" stroke="#d32f2f" stroke-width="2.5"/>
      <ellipse cx="80" cy="72" rx="18" ry="11" fill="#ffffff" opacity="0.55"/>`);
  }
  if (type === 'cylinder') {
    return wrap(`
      <ellipse cx="100" cy="128" rx="52" ry="18" fill="#5cb85c"/>
      <path d="M48,60 L48,128 A52,18 0 0 0 152,128 L152,60 Z" fill="#7fce7f"/>
      <ellipse cx="100" cy="60" rx="52" ry="18" fill="#a8e6a8" stroke="#388e3c" stroke-width="2.5"/>
      <path d="M48,128 A52,18 0 0 0 152,128" fill="none" stroke="#388e3c" stroke-width="2.5"/>
      <line x1="48" y1="60" x2="48" y2="128" stroke="#388e3c" stroke-width="2.5"/>
      <line x1="152" y1="60" x2="152" y2="128" stroke="#388e3c" stroke-width="2.5"/>`);
  }
  return '';
}

init();

}
if (route === "result") {
// 成绩页从数据库读取本次答题记录
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function renderResult() {
let result;
try { result = await getResult(new URLSearchParams(location.hash.split('?')[1] || '').get('id') || ''); } catch (e) { document.getElementById('resultContainer').textContent = '成绩读取失败，请检查网络后重试。'; return; }
const container = document.getElementById('resultContainer');

if (!result) {
  container.innerHTML = '<p class="hint">没有找到测试结果，请返回首页重新答题。</p>';
} else {
  const pct = Math.round(result.correct / result.total * 100);
  let html = `<div class="score-card">
    <div class="score-circle ${pct >= 60 ? 'pass' : 'fail'}">
      <span class="score-num">${pct}%</span>
      <span class="score-sub">${result.correct}/${result.total}</span>
    </div>
    <div class="score-meta">${result.grade} · ${result.levelName} · ${result.chapter} · ${result.topic}<br>
    模式：${result.mode === 'practice' ? '练习' : '测试'}</div>
  </div>`;

  html += `<div class="result-actions">
    <button class="btn-primary" id="retry">再来一次</button></div>`;

  html += `<div class="review"><h2 class="section-title">答题回顾（${result.details.length} 题）</h2>`;
  result.details.forEach((d, i) => {
    html += `<div class="review-card ${d.correct ? 'rc-ok' : 'rc-no'}">
      <div class="rc-head"><span class="rc-num">第 ${i + 1} 题</span>
      <span>${d.correct ? '✅' : '❌'}</span></div>
      <div class="rc-stem">${d.stem}</div>
      <div class="rc-line">你的答案：<b class="${d.correct ? '' : 'bad'}">${escapeHtml(d.your)}</b></div>
      <div class="rc-line">正确答案：<b class="good">${d.right}</b></div>
      <div class="rc-explain">${d.explain}</div>
    </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;

  document.getElementById('retry').addEventListener('click', () => {
    navigate(`quiz?grade=${result.gradeKey}&level=${result.levelId}&topic=${result.topicId}&mode=${result.mode}`);
  });
}

}
renderResult();
}
if (route === "history") {
// 我的成绩：从本应用数据库读取历史答题记录
const historyContainer = document.getElementById('historyContainer');

const escapeHistory = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function boot() { await loadHistory(); }

async function loadHistory() {
  let data, error; try { data = await listResults(); } catch (e) { error = e; }

  if (error) {
    historyContainer.textContent = '读取失败，请检查网络后重试。';
    return;
  }
  if (!data || data.length === 0) {
    historyContainer.innerHTML = '<p class="hint">还没有保存的成绩，去做几道题吧！</p>';
    return;
  }

  let html = `<div class="section-title">共 ${data.length} 条记录</div>`;
  data.forEach(r => {
    const pct = Math.round(r.correct / r.total * 100);
    html += `<div class="review-card ${pct >= 60 ? 'rc-ok' : 'rc-no'}" data-result-id="${escapeHistory(r.id)}">
      <div class="rc-head"><span class="rc-num">${r.grade} · ${r.level || ''} · ${r.chapter} · ${r.topic}</span>
      <span>${pct}%</span></div>
      <div class="rc-line">模式：${r.mode === 'practice' ? '练习' : '测试'} ｜ 答对 ${r.correct}/${r.total}</div>
      <div class="rc-explain">${formatDate(r.created_at)}</div>
    </div>`;
  });
  historyContainer.innerHTML = html;
  historyContainer.querySelectorAll('[data-result-id]').forEach(card => card.addEventListener('click', () => navigate('result?id=' + encodeURIComponent(card.dataset.resultId))));
}

function formatDate(s) {
  const d = new Date(s);
  if (isNaN(d)) return s;
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

boot();

}

}
