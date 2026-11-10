import './style.css';
import './load-style.js';
import { loadDictionary, planOf, isPlayable, splitChars, MODE_BADGE, MODE_LABEL, STRUCTURES, entryOf, idsLeaves, parseIds } from './hanzi.js';
import { currentIdentity, ensureTeacher, renameTeacher } from './identity.js';
import { esc, toast, openModal, pct, fmtMs, fmtTime, fmtAvg, statusLabel, downloadText } from './ui.js';
import badgeUrl from './brand-badge.svg';
import { leaderboardHtml, scoreRuleText } from './leaderboard.js';
import { renderPlay } from './play.js';
import { renderPractice } from './practice.js';
import * as store from './store.js';

const app = document.getElementById('app');
const session = { identity: null, teacher: null, overrides: new Map(), cleanup: null };
const overridesByOwner = new Map();

/* ---------------- 路由 ---------------- */

function parseRoute() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const parts = raw.split('/').filter(Boolean);
  if (!parts.length) return { view: 'home' };
  if (parts[0] === 'teacher') {
    if (!parts[1]) return { view: 'teacher' };
    if (parts[1] === 'create') return { view: 'create' };
    if (parts[1] === 'archive') return { view: 'archive' };
    if (parts[1] === 'library') return { view: 'library' };
    if (parts[1] === 'room') return { view: 'room', code: parts[2] || '', tab: parts[3] || 'settings' };
  }
  if (parts[0] === 'student') return { view: 'student' };
  if (parts[0] === 'play') return { view: 'play', code: parts[1] || '' };
  if (parts[0] === 'practice') return { view: 'practice', code: parts[1] || '' };
  return { view: 'home' };
}

export const go = (hash) => { location.hash = hash; };

// 原地刷新当前视图（标签不变时用，hash 不变不会触发 route）。
const rerender = () => route();

// 控台内的重渲染统一走路由：换标签改 hash，同标签直接刷新。
function refreshRoom(tab) {
  const current = parseRoute();
  const target = `#/teacher/room/${encodeURIComponent(current.code || '')}/${tab}`;
  if (location.hash === target) return route();
  location.hash = target;
  return undefined;
}

function mount(html) {
  session.cleanup?.destroy?.();
  session.cleanup = null;
  app.innerHTML = `<div class="app">${html}</div>`;
}

let lastKey = '';

async function route() {
  const current = parseRoute();
  // 换页回到顶部；仅切换控台标签时保留滚动位置。
  const key = `${current.view}|${current.code ?? ''}`;
  if (key !== lastKey) { lastKey = key; window.scrollTo(0, 0); }
  try {
    if (current.view === 'home') return renderHome();
    if (current.view === 'teacher') return renderTeacherHub();
    if (current.view === 'create') return renderCreate();
    if (current.view === 'archive') return renderArchive();
    if (current.view === 'library') return renderLibrary();
    if (current.view === 'room') return renderRoom(current.code, current.tab);
    if (current.view === 'student') return renderStudentEntry();
    if (current.view === 'play') {
      mount('<div class="page"><div id="view"></div></div>');
      session.cleanup = renderPlay(app.querySelector('#view'), { code: current.code, go });
      return undefined;
    }
    if (current.view === 'practice') {
      mount('<div class="page"><div id="view"></div></div>');
      session.cleanup = renderPractice(app.querySelector('#view'), { code: current.code, go });
      return undefined;
    }
    return renderHome();
  } catch (error) {
    mount(`<div class="page"><div class="card"><h2>出错了</h2><p class="muted">${esc(error.message || '请刷新重试')}</p>
      <button onclick="location.hash='#/'">回到首页</button></div></div>`);
    return undefined;
  }
}

/* ---------------- 首页 ---------------- */

async function renderHome() {
  mount(`<div class="page">
    <div class="home-hero">
      <div class="logo">🧩</div>
      <h1 class="game-title">汉字拼拼乐</h1>
      <div class="school-brand">
        <div class="brand-cn">中文课堂</div>
        <div class="brand-en">Chinese Classroom</div>
        <img class="brand-badge" src="${badgeUrl}" alt="" />
      </div>
    </div>
    <div class="site-stats" id="home-stats">
      <span>👩‍🏫 <b>—</b> 位注册老师</span><span class="site-stats-sep">·</span>
      <span>🎒 <b>—</b> 名同学参与过课堂</span><span class="site-stats-sep">·</span>
      <span>🧩 <b>—</b> 节课</span><span class="site-stats-sep">·</span>
      <span>🏠 <b>—</b> 次课后练习</span>
    </div>
    <div class="col">
      <div class="card home-card">
        <div class="home-card-title">🎒 我是学生</div>
        <p class="desc">老师会把「学生端」链接发给你，打开就能加入课堂。</p>
        <button id="go-student">打开学生端 →</button>
      </div>
      <div class="card home-card teacher">
        <div class="home-card-title">👩‍🏫 我是老师</div>
        <p class="desc">进入教师控台：创建课堂、管理字库、查看成绩报告。</p>
        <button id="go-teacher">打开教师端 →</button>
        <button class="ghost" id="go-library">📚 字库（导入按课次分类的字表）</button>
      </div>
      <div class="card home-card">
        <div class="home-card-title">🔑 已有游戏室号码</div>
        <label for="home-code">游戏室号码</label>
        <div class="row">
          <input id="home-code" placeholder="例如 HSK1L3" />
          <button id="go-room">进入控台</button>
        </div>
      </div>
    </div>
  </div>`);

  app.querySelector('#go-student').addEventListener('click', () => go('#/student'));
  app.querySelector('#go-teacher').addEventListener('click', () => go('#/teacher'));
  app.querySelector('#go-library').addEventListener('click', () => go('#/teacher/library'));
  const enter = () => {
    const code = app.querySelector('#home-code').value.trim().toUpperCase();
    if (!code) { toast('请输入游戏室号码'); return; }
    go(`#/teacher/room/${encodeURIComponent(code)}`);
  };
  app.querySelector('#go-room').addEventListener('click', enter);
  app.querySelector('#home-code').addEventListener('keydown', (event) => { if (event.key === 'Enter') enter(); });

  try {
    const stats = await store.siteStats();
    app.querySelector('#home-stats').innerHTML = `
      <span>👩‍🏫 <b>${stats.teachers}</b> 位注册老师</span><span class="site-stats-sep">·</span>
      <span>🎒 <b>${stats.students}</b> 名同学参与过课堂</span><span class="site-stats-sep">·</span>
      <span>🧩 <b>${stats.rooms}</b> 节课</span><span class="site-stats-sep">·</span>
      <span>🏠 <b>${stats.practice}</b> 次课后练习</span>`;
  } catch { /* 统计失败时保留占位 */ }
}

/* ---------------- 教师控台 ---------------- */

function teacherHeader(sub) {
  return `<div class="hub-head"><div class="row"><h1 style="margin:0">教师控台</h1></div>
    ${sub ? `<div class="sub">${sub}</div>` : ''}</div>`;
}

function accountCard() {
  const name = session.teacher?.name || '中文老师';
  const source = session.identity?.source === 'tiana' ? 'Tiana 账号' : '本机身份';
  return `<div class="card account-card">
    <div class="account-avatar">👩‍🏫</div>
    <div class="account-info">
      <div class="account-name">${esc(name)}</div>
      <div class="muted">${esc(source)} · 课堂与字库只属于你</div>
    </div>
    <div class="spacer"></div>
    <button class="ghost small" id="rename-teacher">改称呼</button>
  </div>`;
}

async function renderTeacherHub() {
  mount(`<div class="page">
    ${teacherHeader()}
    <div class="col">
      ${accountCard()}
      <div class="card home-card">
        <div class="home-card-title">➕ 创建新课堂</div>
        <p class="desc">设定游戏室号码与字表。可从字库一键导入事先准备好的生字表。</p>
        <button id="hub-create">开始创建</button>
      </div>
      <div class="card home-card">
        <div class="home-card-title">🗄️ 档案馆</div>
        <p class="desc">全部历史课堂都在这里。游戏室号码即索引，必要时靠文件夹归类；上完课的记录也不会丢，随时回看。</p>
        <button id="hub-archive">打开档案馆 →</button>
      </div>
      <div class="card home-card">
        <div class="home-card-title">📚 字库</div>
        <p class="desc">导入并管理按课次或级别分类的字表，跨课堂复用。</p>
        <button id="hub-library">打开字库 →</button>
      </div>
      <div class="card home-card">
        <div class="home-card-title">🔑 进入已有课堂（输入游戏室号码）</div>
        <div class="row">
          <input id="hub-code" placeholder="例如 HSK1L3" />
          <button id="hub-enter">进入控台</button>
        </div>
        <p class="desc" style="margin:0">记不清码？用<a href="#/teacher/archive" style="color:var(--primary)">档案馆</a>按房间名找。</p>
      </div>
    </div>
  </div>`);

  app.querySelector('#hub-create').addEventListener('click', () => go('#/teacher/create'));
  app.querySelector('#hub-archive').addEventListener('click', () => go('#/teacher/archive'));
  app.querySelector('#hub-library').addEventListener('click', () => go('#/teacher/library'));
  const enter = () => {
    const code = app.querySelector('#hub-code').value.trim().toUpperCase();
    if (!code) { toast('请输入游戏室号码'); return; }
    go(`#/teacher/room/${encodeURIComponent(code)}`);
  };
  app.querySelector('#hub-enter').addEventListener('click', enter);
  app.querySelector('#hub-code').addEventListener('keydown', (event) => { if (event.key === 'Enter') enter(); });
  app.querySelector('#rename-teacher').addEventListener('click', () => {
    const overlay = openModal(`<div class="modal-head"><h3>改称呼</h3><button class="modal-close" data-close>✕</button></div>
      <div class="col">
        <div><label for="tname">你在课堂里显示的称呼</label>
        <input id="tname" maxlength="24" value="${esc(session.teacher?.name || '')}" /></div>
        <div class="row"><button id="save-name">保存</button></div>
      </div>`);
    overlay.querySelector('[data-close]').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#save-name').addEventListener('click', async () => {
      const value = overlay.querySelector('#tname').value.trim();
      if (!value) { toast('请输入称呼'); return; }
      await renameTeacher(session.teacher.id, value);
      session.teacher.name = value.slice(0, 24);
      overlay.remove();
      renderTeacherHub();
    });
  });
}

/* ---------------- 创建课堂 ---------------- */

async function renderCreate() {
  const sets = await store.listCharSets(session.teacher.id);
  mount(`<div class="page">
    <div class="home-hero" style="padding-bottom:8px"><div class="logo">👩‍🏫</div><h1>创建课堂</h1></div>
    <div class="card col">
      <div>
        <label for="new-code">游戏室号码（学生用它进入课堂）</label>
        <div class="row">
          <input id="new-code" placeholder="留空则自动生成" />
          <button class="ghost" id="new-random">随机</button>
        </div>
        <p class="muted" style="margin:6px 0 0">字母和数字都行，按教材和课号来取最好记 —— 例如 HSK1L3、本书第4课就写 B1L4。</p>
      </div>
      <div>
        <div class="home-card-title">📚 从字库导入（可多选，合并成一份字表）</div>
        <input id="set-search" placeholder="搜索字集名称 / 分类" />
        <div id="set-list" class="col" style="margin-top:8px"></div>
        <p class="muted" style="margin:8px 0 0">按分类折叠显示，勾选的字集会与下面手输的字合并；取消勾选即可撤回，不会互相覆盖。</p>
      </div>
      <div>
        <label for="new-chars">本轮字表（可直接输入或粘贴整份生字表）</label>
        <textarea id="new-chars" placeholder="例如：明 休 林 好"></textarea>
      </div>
      <label class="row" style="align-items:flex-start;gap:8px;color:var(--text)">
        <input type="checkbox" id="new-consent" style="width:auto;margin-top:3px" />
        <span style="font-size:.82rem;line-height:1.6">我确认本课堂<strong>只收集学生的昵称与答题记录</strong>，不采集 IP 地址、不采集设备指纹、不建立跨会话的个人档案。课堂数据可随时一键删除。</span>
      </label>
      <div class="row"><button id="new-submit">创建课堂</button><button class="ghost" id="new-back">返回</button></div>
    </div>
  </div>`);

  const grouped = new Map();
  for (const set of sets) {
    const key = set.category || '未分类';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(set);
  }
  const listNode = app.querySelector('#set-list');
  const paintSets = (keyword = '') => {
    const term = keyword.trim();
    listNode.innerHTML = [...grouped.entries()].map(([category, items]) => {
      const matched = items.filter((set) => !term || set.name.includes(term) || category.includes(term));
      if (!matched.length) return '';
      return `<div>
        <button class="ghost small" data-fold="${esc(category)}">▾ ${esc(category)}（${matched.length} 个字集）</button>
        <div class="col" data-folder="${esc(category)}" style="margin-top:6px">
          ${matched.map((set) => `<label class="set-row" style="align-items:center;color:var(--text)">
            <input type="checkbox" data-set="${esc(set.id)}" style="width:auto" />
            <span class="nm">${esc(set.name)}</span>
            <span class="meta">（${splitChars(set.chars).length} 字）</span>
          </label>`).join('')}
        </div>
      </div>`;
    }).join('') || '<p class="muted">没有匹配的字集。</p>';
    listNode.querySelectorAll('[data-fold]').forEach((button) => button.addEventListener('click', () => {
      const folder = listNode.querySelector(`[data-folder="${CSS.escape(button.dataset.fold)}"]`);
      if (folder) folder.hidden = !folder.hidden;
    }));
  };
  paintSets();
  app.querySelector('#set-search').addEventListener('input', (event) => paintSets(event.target.value));

  app.querySelector('#new-random').addEventListener('click', () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    app.querySelector('#new-code').value = code;
  });
  app.querySelector('#new-back').addEventListener('click', () => go('#/teacher'));
  app.querySelector('#new-submit').addEventListener('click', async () => {
    const codeInput = app.querySelector('#new-code').value.trim().toUpperCase();
    const code = codeInput || `R${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    if (!/^[A-Z0-9\u4e00-\u9fa5-]{2,16}$/.test(code)) { toast('游戏室号码只能用字母、数字或汉字（2-16 位）'); return; }
    if (!app.querySelector('#new-consent').checked) { toast('请先确认数据处理声明'); return; }
    const picked = [...app.querySelectorAll('[data-set]:checked')].map((node) => node.dataset.set);
    let chars = splitChars(app.querySelector('#new-chars').value);
    for (const id of picked) {
      const set = sets.find((item) => item.id === id);
      if (set) chars = [...new Set([...chars, ...splitChars(set.chars)])];
    }
    if (!chars.length) { toast('请至少输入或导入一个汉字'); return; }
    if (await store.roomExists(code)) { toast(`游戏室号码「${code}」已被占用，换一个`); return; }
    await store.createRoom({ code, ownerId: session.teacher.id, name: '', chars: chars.map((char) => ({ char, parts: planOf(char, {}).parts })) });
    toast(`课堂「${code}」已创建`);
    go(`#/teacher/room/${encodeURIComponent(code)}`);
  });
}

/* ---------------- 课堂控台 ---------------- */

const TABS = [
  ['settings', '📝 课堂设置'],
  ['wall', '🟢 状态墙'],
  ['report', '📊 成绩报告'],
  ['board', '🏆 排行榜'],
  ['practice', '🏠 自主练习'],
  ['config', '⚙️ 全局配置'],
];

async function roomOverrides(ownerId) {
  if (!overridesByOwner.has(ownerId)) {
    const list = await store.listOverrides(ownerId);
    overridesByOwner.set(ownerId, Object.fromEntries(list.map((item) => [item.char, item])));
  }
  return overridesByOwner.get(ownerId);
}

async function renderRoom(code, tab) {
  const room = await store.getRoom(code);
  if (!room) {
    mount(`<div class="page"><div class="card"><h2>找不到游戏室「${esc(code)}」</h2>
      <p class="muted">请确认号码，或回到档案馆查看自己的课堂。</p>
      <button onclick="location.hash='#/teacher/archive'">打开档案馆</button></div></div>`);
    return;
  }
  const mine = room.ownerId === session.teacher.id;
  const chars = await store.roomChars(code);
  const overrides = await roomOverrides(room.ownerId);
  const link = `${location.origin}${location.pathname}#/practice/${encodeURIComponent(code)}`;

  mount(`<div class="page">
    ${teacherHeader(`游戏室号码 <b>${esc(code)}</b> · 唯一 ID，不可改 · 第 ${room.roundNo} 轮 · ${statusLabel(room.status)}`)}
    <div class="col">
      <div class="card col" style="gap:10px">
        <div class="row">
          <input id="room-name" placeholder="课堂名称（学生端显示这个）" value="${esc(room.name)}" />
          <button class="ghost" id="save-room-name">保存名称</button>
        </div>
        <div>
          <div class="home-card-title" style="font-size:.95rem">🔗 本课课后练习链接</div>
          <p class="muted" style="margin:0 0 8px">把这条链接放到学校网站或班级群，学生自己就能练这一课的生字（无需你在场）。</p>
          <div class="row">
            <div class="link-box" style="flex:1">${esc(link)}</div>
            <button class="ghost" id="copy-link">复制</button>
            <button class="ghost" id="open-link">试一下</button>
          </div>
        </div>
      </div>
      <div class="row"><button class="ghost" id="back-hub">← 返回控台</button></div>
      <div class="teacher-tabs">
        ${TABS.map(([key, label]) => `<button data-tab="${key}" class="${key === tab ? 'active' : ''}">${label}</button>`).join('')}
      </div>
      <div id="tab-body"></div>
    </div>
  </div>`);

  app.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    go(`#/teacher/room/${encodeURIComponent(code)}/${button.dataset.tab}`);
  }));
  app.querySelector('#back-hub').addEventListener('click', () => go('#/teacher'));
  app.querySelector('#save-room-name').addEventListener('click', async () => {
    const name = app.querySelector('#room-name').value.trim();
    await store.updateRoom(code, { name });
    toast('课堂名称已保存');
  });
  app.querySelector('#copy-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(link); toast('链接已复制'); } catch { toast('复制失败，请手动选中链接'); }
  });
  app.querySelector('#open-link').addEventListener('click', () => {
    window.open(`#/practice/${encodeURIComponent(code)}`, '_blank');
  });

  const body = app.querySelector('#tab-body');
  const ctx = { room, chars, overrides, code, mine, body };
  if (tab === 'settings') await settingsTab(ctx);
  else if (tab === 'wall') await wallTab(ctx);
  else if (tab === 'report') await reportTab(ctx);
  else if (tab === 'board') await boardTab(ctx);
  else if (tab === 'practice') await practiceTab(ctx);
  else await configTab(ctx);
}

/* ---------- 课堂设置 ---------- */

async function settingsTab({ room, chars, overrides, code, body }) {
  const plans = chars.map((item) => planOf(item.char, overrides[item.char]));
  const parts = [...new Set(plans.flatMap((plan) => plan.parts))];
  const stories = room.stories || {};
  const radicalNames = room.radicalNames || {};

  body.innerHTML = `
    <div class="col">
      <div class="card col">
        <div>
          <label for="bulk-chars">生字表（临时指定几个字，或粘贴整份生字表）</label>
          <textarea id="bulk-chars" placeholder="直接输入汉字，或粘贴生字表（支持空格/逗号/换行分隔）"></textarea>
        </div>
        <div class="muted">已识别 <b id="bulk-count">0</b> 个字</div>
        <button id="bulk-use" disabled>使用这 0 个字</button>
      </div>
      <div class="card col">
        <div class="row"><div class="home-card-title" style="margin:0">本轮字表（${chars.length} 字）</div>
          <div class="spacer"></div><span class="muted">数组顺序 = 教学顺序</span></div>
        <div class="row"><input id="add-char" placeholder="输入或粘贴要加的生字，如：明 休 林（可一次多个）" /><button id="add-go">＋ 添加</button></div>
        <div class="chip-row" id="char-chips">
          ${chars.map((item, index) => {
    const plan = plans[index];
    return `<div class="char-chip-wrap">
              <button class="char-chip" data-chip="${index}" title="点击查看/修改拆解">
                <span class="mode-badge mode-${plan.mode}">${MODE_BADGE[plan.mode] || '?'}</span>
                <span class="big">${esc(item.char)}</span>
                <span class="tiny">${esc(plan.structure || '')}</span>
              </button>
              <button class="chip-del" data-del="${index}" aria-label="移除">✕</button>
            </div>`;
  }).join('')}
        </div>
        <p class="muted" style="margin:0">改完记得点下面的「保存设置」；点「保存并开始上课」会自动保存。</p>
      </div>
      <div class="card col">
        <div class="home-card-title" style="margin:0">教学顺序与课次（可选）</div>
        <p class="muted" style="margin:0">数组顺序即教学顺序；可给每字标注「第几课」以便报告对照教材。</p>
        <div class="col" id="lesson-rows">
          ${chars.map((item, index) => `<div class="row"><span class="muted" style="width:24px">${index + 1}.</span>
            <span style="font-size:1.2rem">${esc(item.char)}</span>
            <input data-lesson="${index}" placeholder="第几课（如：第3课）" value="${esc(item.lesson || '')}" /></div>`).join('')}
        </div>
      </div>
      <div class="card col">
        <div class="home-card-title" style="margin:0">部件课堂名（N2）</div>
        <p class="muted" style="margin:0">学生在游戏里看到的是课堂名，不是冷的本字。未设置的部件自动回退显示本字。</p>
        ${parts.length ? `<div class="col">${parts.map((part) => `<div class="row"><span style="font-size:1.3rem;width:32px">${esc(part)}</span>
          <input data-part="${esc(part)}" placeholder="显示名（留空显示本字）" value="${esc(radicalNames[part] || '')}" /></div>`).join('')}</div>`
    : '<p class="muted">（字表为空，先输入汉字）</p>'}
      </div>
      <div class="card col">
        <div class="home-card-title" style="margin:0">组字故事（N3）· 只为高频字和难字写</div>
        <p class="muted" style="margin:0">难字的故事最有教学价值 —— 不必每批都写。留空则游戏里不显示（不占位）。</p>
        <div class="chip-row" id="story-chars">
          ${chars.map((item) => `<button class="char-chip${stories[item.char] ? ' has-story' : ''}" data-story="${esc(item.char)}"><span class="big">${esc(item.char)}</span></button>`).join('')}
        </div>
        <textarea id="story-text" placeholder="例如：明 = A + B → 「一句构字理据」"></textarea>
      </div>
      <div class="row">
        <button id="save-settings">保存设置</button>
        <button id="start-class">▶️ 保存并开始上课</button>
      </div>
      ${room.status === 'playing' ? `<div class="row">
        <button class="ghost" id="prev-q">← 上一题</button>
        <button class="ghost" id="next-q">下一题 →</button>
        <button class="danger" id="end-round">结束本局</button>
      </div>` : ''}
    </div>`;

  const bulk = body.querySelector('#bulk-chars');
  const bulkCount = body.querySelector('#bulk-count');
  const bulkUse = body.querySelector('#bulk-use');
  bulk.addEventListener('input', () => {
    const count = splitChars(bulk.value).length;
    bulkCount.textContent = String(count);
    bulkUse.textContent = `使用这 ${count} 个字`;
    bulkUse.disabled = count === 0;
  });
  bulkUse.addEventListener('click', async () => {
    const list = splitChars(bulk.value).map((char) => ({ char }));
    await store.replaceChars(code, list);
    toast('字表已替换');
    refreshRoom('settings');
  });

  body.querySelector('#add-go').addEventListener('click', async () => {
    const input = body.querySelector('#add-char');
    const add = splitChars(input.value).filter((char) => !chars.some((item) => item.char === char));
    if (!add.length) { toast('没有可添加的新字'); return; }
    await store.replaceChars(code, [...chars.map((item) => ({ char: item.char, lesson: item.lesson })), ...add.map((char) => ({ char }))]);
    refreshRoom('settings');
  });

  body.querySelectorAll('[data-del]').forEach((button) => button.addEventListener('click', async () => {
    const index = Number(button.dataset.del);
    const next = chars.filter((_, position) => position !== index);
    await store.replaceChars(code, next.map((item) => ({ char: item.char, lesson: item.lesson })));
    refreshRoom('settings');
  }));

  body.querySelectorAll('[data-chip]').forEach((button) => button.addEventListener('click', () => {
    openDecomposeDialog(chars[Number(button.dataset.chip)].char, room, overrides);
  }));

  let storyChar = chars[0]?.char || '';
  const storyText = body.querySelector('#story-text');
  storyText.value = stories[storyChar] || '';
  body.querySelectorAll('[data-story]').forEach((button) => button.addEventListener('click', () => {
    storyChar = button.dataset.story;
    storyText.value = stories[storyChar] || '';
  }));

  const collect = () => {
    const lessons = [...body.querySelectorAll('[data-lesson]')].map((input) => input.value.trim());
    const names = {};
    body.querySelectorAll('[data-part]').forEach((input) => {
      const value = input.value.trim();
      if (value) names[input.dataset.part] = value;
    });
    const nextStories = { ...stories };
    if (storyChar) {
      const value = storyText.value.trim();
      if (value) nextStories[storyChar] = value;
      else delete nextStories[storyChar];
    }
    return { lessons, names, stories: nextStories };
  };

  const persist = async () => {
    const { lessons, names, stories: nextStories } = collect();
    await store.replaceChars(code, chars.map((item, index) => ({ char: item.char, lesson: lessons[index] || '' })));
    await store.updateRoom(code, { radicalNames: names, stories: nextStories });
  };

  body.querySelector('#save-settings').addEventListener('click', async () => {
    await persist();
    toast('设置已保存');
  });

  body.querySelector('#start-class')?.addEventListener('click', async () => {
    await persist();
    await store.updateRoom(code, { status: 'playing', currentIndex: 0, endedAt: null });
    toast('已开始上课');
    refreshRoom('wall');
  });

  body.querySelector('#prev-q')?.addEventListener('click', async () => {
    await store.updateRoom(code, { currentIndex: Math.max(0, room.currentIndex - 1) });
    refreshRoom('settings');
  });
  body.querySelector('#next-q')?.addEventListener('click', async () => {
    await store.updateRoom(code, { currentIndex: Math.min(chars.length - 1, room.currentIndex + 1) });
    refreshRoom('settings');
  });
  body.querySelector('#end-round')?.addEventListener('click', async () => {
    await store.updateRoom(code, { status: 'ended', endedAt: new Date().toISOString() });
    toast('本局已结束，报告已生成');
    refreshRoom('report');
  });
}

function openDecomposeDialog(char, room, overrides) {
  const base = entryOf(char);
  const current = planOf(char, overrides[char]);
  let parts = [...current.parts];
  let lockedParts = [...(current.lockParts || [])];
  let structure = current.structure || base?.st || '左右结构';

  const overlay = openModal(`
    <div class="modal-head"><h3>修改「${esc(char)}」的拆解</h3><button class="modal-close" data-close>✕</button></div>
    <p class="muted" style="margin:0 0 10px">系统拆法仅是一份建议 —— 您的直觉优先。修改后对该老师的班级永久生效。</p>
    <div class="card" style="padding:12px;background:var(--bg-soft)">
      <div class="muted">系统判定：${esc(base?.m || 'F')} 模式 · ${esc(base?.st || '未知结构')}</div>
      <div class="muted">数据源拆解：${esc(base?.s || '—')}</div>
      <div class="muted">部件数：${base?.n ?? '—'}</div>
      <div class="muted">理由：${esc(base?.r || '—')}</div>
    </div>
    <div style="margin-top:12px">
      <label>部件（点击可切换锁定 🔒）</label>
      <div class="chip-row" id="dc-parts"></div>
      <div class="row" style="margin-top:8px">
        <input id="dc-new" maxlength="1" placeholder="加一个部件" style="max-width:140px" />
        <button class="ghost small" id="dc-add">＋ 添加</button>
      </div>
    </div>
    <div style="margin-top:12px">
      <label for="dc-structure">结构类型</label>
      <select id="dc-structure">${STRUCTURES.map((item) => `<option value="${item}"${item === structure ? ' selected' : ''}>${item}</option>`).join('')}</select>
    </div>
    <div class="row" style="margin-top:16px">
      <button class="ghost" id="dc-reset">恢复系统拆法</button>
      <div class="spacer"></div>
      <button class="ghost" data-close>取消</button>
      <button id="dc-save">保存覆盖</button>
    </div>`);

  const paintParts = () => {
    overlay.querySelector('#dc-parts').innerHTML = parts.map((part, index) => `
      <span class="char-chip" style="min-width:48px;${lockedParts.includes(part) ? 'border:1px solid var(--locked);color:var(--locked)' : ''}">
        <span class="big">${esc(part)}</span>
        <span class="tiny">${lockedParts.includes(part) ? '🔒 整砖' : '点击锁定'}</span>
        <button class="chip-del" data-drop="${index}" style="top:-6px;right:-6px">✕</button>
      </span>`).join('');
    overlay.querySelectorAll('#dc-parts .char-chip').forEach((chip, index) => {
      chip.addEventListener('click', (event) => {
        if (event.target.dataset.drop !== undefined) return;
        const part = parts[index];
        lockedParts = lockedParts.includes(part) ? lockedParts.filter((item) => item !== part) : [...lockedParts, part];
        paintParts();
      });
    });
    overlay.querySelectorAll('[data-drop]').forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      const index = Number(button.dataset.drop);
      if (parts.length <= 2) { toast('至少保留两个部件'); return; }
      const [removed] = parts.splice(index, 1);
      lockedParts = lockedParts.filter((item) => item !== removed);
      paintParts();
    }));
  };
  paintParts();

  overlay.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => overlay.remove()));
  overlay.querySelector('#dc-add').addEventListener('click', () => {
    const input = overlay.querySelector('#dc-new');
    const value = input.value.trim();
    if (!value) return;
    parts.push(value);
    input.value = '';
    paintParts();
  });
  overlay.querySelector('#dc-structure').addEventListener('change', (event) => { structure = event.target.value; });
  overlay.querySelector('#dc-reset').addEventListener('click', async () => {
    await store.deleteOverride(room.ownerId, char);
    overridesByOwner.delete(room.ownerId);
    overlay.remove();
    toast('已恢复系统拆法');
    refreshRoom('settings');
  });
  overlay.querySelector('#dc-save').addEventListener('click', async () => {
    if (parts.length < 2) { toast('至少需要两个部件'); return; }
    await store.saveOverride(room.ownerId, { char, mode: parts.every((part) => entryOf(part)) ? 'A' : 'B', parts, lockParts: lockedParts, structure });
    overridesByOwner.delete(room.ownerId);
    overlay.remove();
    toast('拆解已覆盖');
    refreshRoom('settings');
  });
}

/* ---------- 状态墙 ---------- */

async function wallTab({ room, chars, code, body }) {
  const [students, answers] = await Promise.all([store.roomStudents(code), store.roomAnswers(code)]);
  const now = Date.now();
  const char = chars[room.currentIndex];
  const rows = students.map((student) => {
    const mine = answers.filter((row) => row.student_id === student.id);
    const current = mine.find((row) => Number(row.char_index) === room.currentIndex);
    const correctCount = mine.filter((row) => Number(row.correct) === 1).length;
    const online = now - new Date(student.lastSeenAt).getTime() < 20000;
    let state = 'idle';
    if (current) state = Number(current.correct) === 1 ? 'done' : Number(current.attempts) >= 3 ? 'stuck' : 'trying';
    if (student.helpChar === room.currentIndex && state !== 'done') state = 'help';
    return { ...student, correctCount, online, state };
  });
  const count = (state) => rows.filter((row) => row.state === state).length;

  body.innerHTML = `
    <div class="col">
      <div class="card col">
        <div class="row">
          <div>
            <div class="muted">当前题目</div>
            <div style="font-size:2.2rem;line-height:1.1">${esc(char?.char || '—')}<span class="muted" style="font-size:.85rem;margin-left:8px">第 ${room.currentIndex + 1} / ${chars.length} 题</span></div>
          </div>
          <div class="spacer"></div>
          <button class="ghost" id="wall-prev">←</button>
          <button class="ghost" id="wall-next">下一题 →</button>
        </div>
        <div class="wall-summary">${rows.filter((row) => row.online).length} 人在线 ·
          <span>🟢 ${count('done')} 已对</span>·<span>🟡 ${count('stuck')} 卡住</span>·<span>🔴 ${count('help')} 求助</span>·<span>⚪ ${count('idle') + count('trying')} 进行中</span>
        </div>
      </div>
      <div class="card col">
        <div class="wall-grid">
          ${rows.length ? rows.map((row) => `<div class="wall-cell wall-${row.state} ${row.online ? 'online' : 'offline'}">
            <span class="nm">${esc(row.nickname)}</span>${row.correctCount} 对</div>`).join('')
    : '<p class="muted">还没有学生加入。把游戏室号码告诉他们即可。</p>'}
        </div>
      </div>
      <button class="danger" id="wall-end">结束本局并生成报告</button>
    </div>`;

  body.querySelector('#wall-prev').addEventListener('click', async () => {
    await store.updateRoom(code, { currentIndex: Math.max(0, room.currentIndex - 1) });
    refreshRoom('wall');
  });
  body.querySelector('#wall-next').addEventListener('click', async () => {
    await store.updateRoom(code, { currentIndex: Math.min(chars.length - 1, room.currentIndex + 1) });
    refreshRoom('wall');
  });
  body.querySelector('#wall-end').addEventListener('click', async () => {
    await store.updateRoom(code, { status: 'ended', endedAt: new Date().toISOString() });
    toast('本局已结束，报告已生成');
    refreshRoom('report');
  });
}

/* ---------- 成绩报告 ---------- */

async function reportTab({ room, chars, code, body }) {
  const data = await store.report(code);
  let mode = 'char';

  const render = () => {
    body.innerHTML = `
      <div class="col">
        <div class="card col">
          <div class="home-card-title" style="margin:0">全班共同指标</div>
          <div class="metric-grid">
            <div class="metric"><div class="k">参与人数</div><div class="v">${data.metrics.participants}</div></div>
            <div class="metric"><div class="k">平均正确率</div><div class="v">${pct(data.metrics.avgAccuracy)}</div></div>
            <div class="metric"><div class="k">攻下字数</div><div class="v">${data.metrics.charsMastered}/${data.metrics.charsTotal}</div></div>
            <div class="metric"><div class="k">求助次数</div><div class="v">${data.metrics.helpTotal}</div></div>
          </div>
        </div>
        <div class="card col">
          <div class="home-card-title" style="margin:0">个人榜</div>
          <p class="muted" style="margin:0">按答对数 → 平均尝试次数 → 平均用时 排序（速度权重极低）。</p>
          <table class="report-table">
            <thead><tr><th>名次</th><th>昵称</th><th class="num">答对</th><th class="num">正确率</th><th class="num">平均尝试</th><th class="num">求助</th></tr></thead>
            <tbody>
              ${data.students.length ? data.students.map((student, index) => `<tr>
                <td>${index + 1}</td><td>${esc(student.nickname)}</td>
                <td class="num">${student.summary.correct}/${student.summary.answered}</td>
                <td class="num">${student.summary.answered ? pct(student.summary.accuracy) : '—'}</td>
                <td class="num">${fmtAvg(student.summary.avgAttempts)}</td>
                <td class="num">${student.helpCount}</td></tr>`).join('')
    : '<tr><td colspan="6" class="muted">还没有学生作答。</td></tr>'}
            </tbody>
          </table>
        </div>
        <div class="card col">
          <div class="row">
            <div class="home-card-title" style="margin:0">${mode === 'char' ? '按字查（哪个字全班最卡）' : '按人查'}</div>
            <div class="spacer"></div>
            <button class="ghost small" data-mode="char">按字查</button>
            <button class="ghost small" data-mode="person">按人查</button>
            <button class="ghost small" id="report-refresh">刷新</button>
            <button class="ghost small" id="report-csv">⬇️ 导出 CSV</button>
          </div>
          ${mode === 'char' ? `<table class="report-table">
            <thead><tr><th>字</th><th>课次</th><th class="num">正确率</th><th class="num">卡住</th><th class="num">求助</th><th class="num">第3次才对</th><th class="num">提示后仍错</th></tr></thead>
            <tbody>${data.byChar.map((item) => `<tr>
              <td style="font-size:1.1rem">${esc(item.char)}</td>
              <td>${esc(item.lesson || '—')}</td>
              <td class="num">${item.accuracy === null ? '—' : pct(item.accuracy)}</td>
              <td class="num">${item.stuck}</td>
              <td class="num">${item.helped}</td>
              <td class="num">${item.solvedOnThirdTry}</td>
              <td class="num">${item.failedAfterHint}</td></tr>`).join('')}</tbody>
          </table>
          <p class="muted" style="margin:0">「第3次才对」是教学信号（不是失败）—— 说明提示起了作用。「提示后仍错」偏高说明该字的提示不够，可能需要老师现场介入。</p>`
    : `<table class="report-table">
            <thead><tr><th>昵称</th><th>字</th><th class="num">尝试</th><th class="num">用时</th><th>结果</th></tr></thead>
            <tbody>${data.students.flatMap((student) => (student.records.length ? student.records.map((record) => `<tr>
              <td>${esc(student.nickname)}</td><td style="font-size:1.05rem">${esc(record.char)}</td>
              <td class="num">${record.attempts}</td><td class="num">${fmtMs(record.elapsedMs)}</td>
              <td>${record.correct ? '对' : '未对'}</td></tr>`) : [`<tr><td>${esc(student.nickname)}</td><td colspan="4" class="muted">还没有作答</td></tr>`])).join('')
    || '<tr><td colspan="5" class="muted">还没有记录。</td></tr>'}</tbody>
          </table>`}
        </div>
      </div>`;

    body.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => {
      mode = button.dataset.mode; render();
    }));
    body.querySelector('#report-refresh').addEventListener('click', () => refreshRoom('report'));
    body.querySelector('#report-csv').addEventListener('click', () => {
      const head = '昵称,字,尝试次数,用时(秒),是否正确,是否求助\n';
      const lines = data.students.flatMap((student) => student.records.map((record) => [
        student.nickname, record.char, record.attempts, Math.round(record.elapsedMs / 1000),
        record.correct ? '对' : '未对', record.helped ? '是' : '否',
      ].join(',')));
      downloadText(`${code}-report.csv`, head + lines.join('\n'));
    });
  };
  render();
}

/* ---------- 排行榜 ---------- */

async function boardTab({ code, body }) {
  let scope = 'all';
  let period = 'all';
  const paint = async () => {
    const entries = await store.leaderboard({ code, scope, period });
    body.innerHTML = `<div class="card col">
      <div class="home-card-title" style="margin:0">🏆 积分排行榜</div>
      <p class="muted" style="margin:0">${esc(scoreRuleText())}</p>
      <div id="board-lb">${leaderboardHtml(entries, { scope, period, roomCode: code })}</div>
    </div>`;
    body.querySelectorAll('[data-lb-scope]').forEach((button) => button.addEventListener('click', () => {
      scope = button.dataset.lbScope; paint();
    }));
    body.querySelectorAll('[data-lb-period]').forEach((button) => button.addEventListener('click', () => {
      period = button.dataset.lbPeriod; paint();
    }));
  };
  await paint();
}

/* ---------- 自主练习统计 ---------- */

async function practiceTab({ body }) {
  let days = 30;
  const paint = async () => {
    const stats = await store.practiceStats(days);
    body.innerHTML = `<div class="col">
      <div class="card col">
        <p class="muted" style="margin:0">隐私边界：课后自主练习的记录不关联任何可识别身份 —— 昵称在接收时立即丢弃，不存 IP、不存设备指纹、无跨会话个人档案。以下仅为「字维度」与「总量」聚合。</p>
        <div class="row">
          <div class="home-card-title" style="margin:0">课后自主练习</div>
          <div class="spacer"></div>
          ${[7, 30, 90].map((value) => `<button class="lb-chip${days === value ? ' on' : ''}" data-days="${value}">近 ${value} 天</button>`).join('')}
          <button class="ghost small" id="pr-refresh">刷新</button>
        </div>
        <div class="metric-grid">
          <div class="metric"><div class="k">练习会话数</div><div class="v">${stats.sessions}</div></div>
          <div class="metric"><div class="k">答题总数</div><div class="v">${stats.records}</div></div>
          <div class="metric"><div class="k">涉及字数</div><div class="v">${stats.chars}</div></div>
          <div class="metric"><div class="k">总正确率</div><div class="v">${pct(stats.accuracy)}</div></div>
        </div>
        <div class="muted">近 ${days} 天共 ${stats.records} 条记录</div>
      </div>
      <div class="card col">
        <div class="home-card-title" style="margin:0">课后最难练的字</div>
        <p class="muted" style="margin:0">至少被练 2 次且正确率低的字 —— 这些可能需要课堂上重点讲。</p>
        <table class="report-table">
          <thead><tr><th>字</th><th class="num">练习次数</th><th class="num">正确率</th><th class="num">平均尝试</th></tr></thead>
          <tbody>${stats.hardest.length ? stats.hardest.map((item) => `<tr>
            <td style="font-size:1.1rem">${esc(item.char)}</td>
            <td class="num">${item.times}</td>
            <td class="num">${pct(item.accuracy)}</td>
            <td class="num">${fmtAvg(item.avgAttempts)}</td></tr>`).join('')
    : '<tr><td colspan="4" class="muted">还没有课后练习记录。</td></tr>'}</tbody>
        </table>
      </div>
      <div class="card col">
        <div class="home-card-title" style="margin:0">数据留存</div>
        <p class="muted" style="margin:0">存储限制原则：自主练习记录建议按学期清理。</p>
        <button class="ghost" id="pr-purge">清理 30 天前的记录</button>
      </div>
    </div>`;
    body.querySelectorAll('[data-days]').forEach((button) => button.addEventListener('click', () => {
      days = Number(button.dataset.days); paint();
    }));
    body.querySelector('#pr-refresh').addEventListener('click', () => paint());
    body.querySelector('#pr-purge').addEventListener('click', async () => {
      await store.purgePractice(30);
      toast('已清理 30 天前的记录');
      paint();
    });
  };
  await paint();
}

/* ---------- 全局配置 ---------- */

async function configTab({ room, body }) {
  const [stories, overrides] = await Promise.all([
    store.listStories(room.ownerId), store.listOverrides(room.ownerId),
  ]);
  body.innerHTML = `<div class="col">
    <div class="card col">
      <p class="muted" style="margin:0">这里的配置跨班级永久生效 —— 改过的字在这位老师的任何课堂里都生效。</p>
      <div class="row"><div class="home-card-title" style="margin:0">已保存的组字故事（N3）</div>
        <div class="spacer"></div><button class="ghost small" id="cfg-refresh">刷新</button></div>
      ${stories.length ? `<table class="report-table"><thead><tr><th>字</th><th>故事</th></tr></thead><tbody>
        ${stories.map((item) => `<tr><td style="font-size:1.1rem">${esc(item.char)}</td><td>${esc(item.story)}</td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">还没有组字故事。在「课堂设置 → 组字故事」里为高频字和难字写。</p>'}
    </div>
    <div class="card col">
      <div class="home-card-title" style="margin:0">已覆盖的拆解</div>
      ${overrides.length ? `<div class="chip-row">${overrides.map((item) => `<span class="char-chip"><span class="big">${esc(item.char)}</span><span class="tiny">已覆盖</span></span>`).join('')}</div>`
    : '<p class="muted">还没有覆盖。点课堂设置里的字块可以修改拆法。</p>'}
    </div>
  </div>`;
  body.querySelector('#cfg-refresh').addEventListener('click', () => refreshRoom('config'));
}

/* ---------------- 档案馆 ---------------- */

async function renderArchive() {
  const rooms = await store.listRooms(session.teacher.id);
  const folders = new Map();
  for (const room of rooms) {
    const key = room.folder || '未归类';
    if (!folders.has(key)) folders.set(key, []);
    folders.get(key).push(room);
  }
  mount(`<div class="page">
    <div class="home-hero" style="padding-bottom:8px"><div class="logo">🗄️</div><h1>档案馆</h1>
      <p class="muted">自己的课堂都在这里</p></div>
    <div class="row" style="margin-bottom:12px"><button class="ghost" id="ar-back">← 返回控台</button>
      <div class="spacer"></div><button class="ghost" id="ar-refresh">刷新</button></div>
    <div class="card col">
      <div class="group-head"><strong>📁 我的课堂</strong><span class="count">${rooms.length}</span></div>
      ${rooms.length ? [...folders.entries()].map(([folder, items]) => `
        <div class="folder-head">📂 ${esc(folder)} · ${items.length} 个课堂</div>
        <div class="col">
          ${items.map((room) => `<div class="room-row">
            <div>
              <div class="code">${esc(room.code)}</div>
              <div class="meta">${esc(room.name || '（未命名）')}</div>
              <div class="meta">${fmtTime(room.createdAt)} · ${room.charCount} 字 · ${statusLabel(room.status)}</div>
            </div>
            <div class="actions">
              <button class="ghost small" data-open="${esc(room.code)}">打开控台</button>
              <button class="ghost small" data-csv="${esc(room.code)}">⬇</button>
            </div>
          </div>`).join('')}
        </div>`).join('') : '<p class="muted">还没有课堂。回到控台点「开始创建」。</p>'}
    </div>
  </div>`);

  app.querySelector('#ar-back').addEventListener('click', () => go('#/teacher'));
  app.querySelector('#ar-refresh').addEventListener('click', () => renderArchive());
  app.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
    go(`#/teacher/room/${encodeURIComponent(button.dataset.open)}`);
  }));
  app.querySelectorAll('[data-csv]').forEach((button) => button.addEventListener('click', async () => {
    const data = await store.report(button.dataset.csv);
    const head = '昵称,字,尝试次数,用时(秒),是否正确\n';
    const lines = data.students.flatMap((student) => student.records.map((record) => [
      student.nickname, record.char, record.attempts, Math.round(record.elapsedMs / 1000), record.correct ? '对' : '未对',
    ].join(',')));
    downloadText(`${button.dataset.csv}-report.csv`, head + lines.join('\n'));
  }));
}

/* ---------------- 字库 ---------------- */

let activeSetId = null;

async function renderLibrary() {
  const sets = await store.listCharSets(session.teacher.id);
  if (!activeSetId || !sets.some((set) => set.id === activeSetId)) activeSetId = sets[0]?.id || null;
  const mine = sets.filter((set) => set.mine);
  const shared = sets.filter((set) => !set.mine);
  const grouped = (list) => {
    const map = new Map();
    for (const set of list) {
      const key = set.category || '未分类';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(set);
    }
    return map;
  };
  const active = sets.find((set) => set.id === activeSetId) || null;

  mount(`<div class="page">
    <div class="home-hero" style="padding-bottom:8px"><div class="logo">📚</div><h1>字库</h1>
      <p class="muted">按课次或级别管理字表，跨课堂复用</p></div>
    <div class="row" style="margin-bottom:12px">
      <div class="muted">字集列表（${sets.length}）</div><div class="spacer"></div>
      <button id="lib-new">➕ 导入新字集</button>
      <button class="ghost" id="lib-back">← 返回控台</button>
    </div>
    <div class="col">
      ${mine.length ? `<div class="card col"><div class="group-head"><strong>📁 我的字集</strong><span class="count">${mine.length}</span></div>
        ${[...grouped(mine).entries()].map(([category, items]) => `<div class="folder-head">📂 ${esc(category)}（${items.length} 个字集）</div>
          <div class="col">${items.map((set) => setRow(set)).join('')}</div>`).join('')}
      </div>` : ''}
      ${shared.length ? `<div class="card col"><div class="group-head"><strong>🌐 共享字集</strong><span class="count">${shared.length}</span></div>
        ${[...grouped(shared).entries()].map(([category, items]) => `<div class="folder-head">📂 ${esc(category)}（${items.length} 个字集）</div>
          <div class="col">${items.map((set) => setRow(set)).join('')}</div>`).join('')}
      </div>` : ''}
      ${active ? `<div class="card col"><div class="row"><div class="home-card-title" style="margin:0">${esc(active.name)}</div>
        <span class="muted">[${esc(active.category || '未分类')}]</span><div class="spacer"></div>
        ${active.mine ? `<button class="ghost small" data-share="${esc(active.id)}">${active.shared ? '取消共享' : '共享'}</button>` : ''}
        ${active.mine ? `<button class="ghost small" data-del-set="${esc(active.id)}">删除</button>` : ''}
      </div>
      <div class="chip-row">${splitChars(active.chars).map((char) => {
    const plan = planOf(char, {});
    return `<span class="char-chip"><span class="mode-badge mode-${plan.mode}">${MODE_BADGE[plan.mode] || '?'}</span><span class="big">${esc(char)}</span></span>`;
  }).join('')}</div></div>` : ''}
    </div>
  </div>`);

  app.querySelector('#lib-back').addEventListener('click', () => go('#/teacher'));
  app.querySelector('#lib-new').addEventListener('click', () => {
    const overlay = openModal(`<div class="modal-head"><h3>导入新字集</h3><button class="modal-close" data-close>✕</button></div>
      <div class="col">
        <div><label for="set-name">字集名称</label><input id="set-name" placeholder="例如：ZW2L3 开心的一天" /></div>
        <div><label for="set-cat">分类（课次或级别）</label><input id="set-cat" placeholder="例如：ZW2" /></div>
        <div><label for="set-chars">字表</label><textarea id="set-chars" placeholder="直接粘贴整份生字表，空格/逗号/换行分隔"></textarea></div>
        <label class="row" style="color:var(--text)"><input type="checkbox" id="set-shared" style="width:auto" /> 共享给其他老师</label>
        <div class="row"><button id="set-save">保存</button></div>
      </div>`);
    overlay.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => overlay.remove()));
    overlay.querySelector('#set-save').addEventListener('click', async () => {
      const name = overlay.querySelector('#set-name').value.trim();
      const chars = splitChars(overlay.querySelector('#set-chars').value);
      if (!name) { toast('请填写字集名称'); return; }
      if (!chars.length) { toast('请粘贴至少一个汉字'); return; }
      await store.createCharSet({
        ownerId: session.teacher.id, name,
        category: overlay.querySelector('#set-cat').value.trim(),
        chars: chars.join(''), shared: overlay.querySelector('#set-shared').checked,
      });
      overlay.remove();
      toast('字集已保存');
      renderLibrary();
    });
  });
  app.querySelectorAll('[data-share]').forEach((button) => button.addEventListener('click', async () => {
    const set = sets.find((item) => item.id === button.dataset.share);
    await store.updateCharSet(set.id, { shared: !set.shared });
    renderLibrary();
  }));
  app.querySelectorAll('[data-del-set]').forEach((button) => button.addEventListener('click', async () => {
    await store.deleteCharSet(button.dataset.delSet);
    activeSetId = null;
    toast('字集已删除');
    renderLibrary();
  }));
  app.querySelectorAll('[data-use]').forEach((button) => button.addEventListener('click', () => {
    activeSetId = button.dataset.use;
    renderLibrary();
  }));

  function setRow(set) {
    return `<div class="set-row">
      <span class="nm">${esc(set.name)}</span>
      <span class="meta">（${splitChars(set.chars).length}）</span>
      <div class="spacer"></div>
      ${set.shared ? '<span class="tiny">🌐 共享</span>' : ''}
      <button class="ghost small" data-use="${esc(set.id)}">查看</button>
    </div>`;
  }
}

/* ---------------- 学生端入口 ---------------- */

async function renderStudentEntry() {
  mount(`<div class="page">
    <div class="home-hero">
      <div class="logo">🎒</div>
      <h1 class="game-title">汉字拼拼乐</h1>
      <div class="school-brand">
        <div class="brand-cn">中文课堂</div>
        <div class="brand-en">Chinese Classroom</div>
        <img class="brand-badge" src="${badgeUrl}" alt="" />
      </div>
    </div>
    <div class="col">
      <div class="card home-card">
        <div class="home-card-title">🏫 加入课堂</div>
        <p class="desc">向老师索取游戏室号码</p>
        <div class="row">
          <input id="stu-code" placeholder="例如 HSK1L3" />
          <button id="stu-join">进入课堂</button>
        </div>
      </div>
      <div class="card home-card">
        <div class="home-card-title">🏠 课后自主练习</div>
        <p class="desc">老师不在也可以练。记录会上传，但<strong>不会记录你是谁</strong>。</p>
        <button id="stu-practice">开始练习</button>
      </div>
    </div>
  </div>`);
  const join = () => {
    const code = app.querySelector('#stu-code').value.trim().toUpperCase();
    if (!code) { toast('请输入游戏室号码'); return; }
    go(`#/play/${encodeURIComponent(code)}`);
  };
  app.querySelector('#stu-join').addEventListener('click', join);
  app.querySelector('#stu-code').addEventListener('keydown', (event) => { if (event.key === 'Enter') join(); });
  app.querySelector('#stu-practice').addEventListener('click', () => go('#/practice'));
}

/* ---------------- 启动 ---------------- */

async function boot() {
  app.innerHTML = '<div class="page"><p class="muted">加载中…</p></div>';
  try {
    await loadDictionary();
  } catch {
    app.innerHTML = '<div class="page"><div class="card"><h2>汉字词典加载失败</h2><p class="muted">请刷新页面重试。</p></div></div>';
    return;
  }
  session.identity = await currentIdentity();
  session.teacher = await ensureTeacher(session.identity);
  window.addEventListener('hashchange', route);
  await route();
}

boot();
