import markup from './markup.html?raw';
import './style.css';
import './load-style.js';
import { sql } from './db.js';
import { newId } from './id.js';
import weeklyPlans from './week-plans.json';

document.getElementById('app').innerHTML = markup;

const stageNames = { prepare: '备孕准备', early: '孕早期', middle: '孕中期', late: '孕晚期' };
const weekRanges = { prepare: [1, 12], early: [1, 12], middle: [13, 27], late: [28, 40] };
let status = 'prepare'; // 'prepare' 备孕中 | 'pregnant' 已确认怀孕
let lmp = null; // 末次月经第一天 'YYYY-MM-DD'
let prepareDays = 1; // 进入应用以来的天数，用于推进备孕周
let viewPhase = 'prepare'; // 正在浏览的阶段
let viewWeek = 1; // 正在浏览的周
let role = 'all';
let names = { mom: '妈妈', dad: '爸爸' };
let completed = new Set();
let comments = [];
let activeTask = null;

function toast(message) {
  const element = document.getElementById('reward');
  element.textContent = message;
  element.classList.remove('hidden');
  clearTimeout(window.rewardTimer);
  window.rewardTimer = setTimeout(() => element.classList.add('hidden'), 3300);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
function parseDate(text) {
  const [y, m, d] = text.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtDate(date) {
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

// 依据末次月经自动计算当前孕周、阶段与预产期
function computePregnancy() {
  if (status !== 'pregnant' || !lmp) return null;
  const lmpDate = parseDate(lmp);
  const days = Math.floor((startOfToday() - lmpDate) / 86400000);
  const week = clamp(Math.floor(days / 7) + 1, 1, 40);
  const phase = week <= 12 ? 'early' : week <= 27 ? 'middle' : 'late';
  const due = new Date(lmpDate.getTime() + 280 * 86400000);
  const daysToDue = 280 - days;
  const progress = clamp(Math.round((days / 280) * 100), 2, 100);
  return { week, phase, due, daysToDue, progress };
}

// 系统认定的「当前所在」位置
function currentPoint() {
  if (status === 'pregnant') {
    const p = computePregnancy();
    return { phase: p.phase, week: p.week };
  }
  return { phase: 'prepare', week: clamp(Math.floor(prepareDays / 7) + 1, 1, 12) };
}
function isViewingCurrent() {
  const cur = currentPoint();
  return viewPhase === cur.phase && viewWeek === cur.week;
}

function renderComments() {
  document.getElementById('moments-count').textContent = `${comments.length} 条留言`;
  ['comments', 'moments-comments'].forEach((id) => {
    const list = document.getElementById(id);
    list.replaceChildren();
    if (!comments.length) {
      const empty = document.createElement('div');
      empty.className = 'comments-empty';
      empty.innerHTML = '<span>♡</span><strong>第一句话，等你们写下</strong><p>记录今天的小期待，留给以后的你们看。</p>';
      list.append(empty);
    }
    comments.slice(0, id === 'comments' ? 3 : 20).forEach((comment) => {
      const item = document.createElement('div');
      item.className = 'comment';
      item.innerHTML = '<span class="avatar"></span><div><b></b><time></time><p></p></div>';
      item.querySelector('.avatar').textContent = comment.author[0];
      item.querySelector('b').textContent = comment.author;
      item.querySelector('time').textContent = new Date(comment.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      item.querySelector('p').textContent = comment.body;
      list.append(item);
    });
  });
}

function renderTaskList(list) {
  const tasks = weeklyPlans[viewPhase][viewWeek].tasks;
  list.replaceChildren();
  tasks.forEach(([who, title, detail], index) => {
    if (role !== 'all' && role !== who) return;
    const taskId = `${viewPhase}-${viewWeek}-${index}`;
    const isDone = completed.has(taskId);
    const item = document.createElement('article');
    item.className = `task${isDone ? ' done' : ''}`;
    item.innerHTML = `<button class="check" aria-label="完成任务">${isDone ? '✓' : ''}</button><div class="task-copy"><div class="task-top"><h3></h3><span class="badge ${who === 'dad' ? 'dad' : ''}">${who === 'dad' ? '爸爸' : '妈妈'}</span></div><p></p></div><button class="comment-btn">写评论 ↗</button>`;
    item.querySelector('h3').textContent = title;
    item.querySelector('p').textContent = detail;
    item.querySelector('.check').onclick = async () => {
      try {
        if (isDone) {
          await sql('DELETE FROM journey_progress WHERE journey_id = ? AND task_id = ?', ['main', taskId]);
          completed.delete(taskId);
        } else {
          await sql('INSERT INTO journey_progress (journey_id, task_id, completed_at) VALUES (?, ?, ?)', ['main', taskId, new Date().toISOString()]);
          completed.add(taskId);
          toast('✦ 又完成了一件事，你们真的很棒！');
        }
        render();
      } catch (error) { toast(error.message); }
    };
    item.querySelector('.comment-btn').onclick = () => openModal(taskId, title);
    list.append(item);
  });
}

// Hero 右侧的状态卡：备孕中 / 孕周 + 预产期
function renderStatus() {
  const bar = document.getElementById('due-bar');
  const fill = document.getElementById('due-bar-fill');
  const cta = document.getElementById('pregnancy-cta');
  const edit = document.getElementById('lmp-edit');
  if (status === 'pregnant') {
    const p = computePregnancy();
    document.getElementById('status-big').textContent = `孕 ${p.week} 周`;
    document.getElementById('status-sub').textContent = p.daysToDue >= 0
      ? `预产期 ${fmtDate(p.due)} · 还有 ${p.daysToDue} 天`
      : `预产期 ${fmtDate(p.due)} · 已过 ${-p.daysToDue} 天`;
    document.getElementById('status-foot').textContent = `末次月经 ${lmp} · 具体孕周以产检医生核算为准`;
    bar.classList.remove('hidden');
    fill.style.width = `${p.progress}%`;
    cta.classList.add('hidden');
    edit.classList.remove('hidden');
  } else {
    document.getElementById('status-big').textContent = '备孕中';
    document.getElementById('status-sub').textContent = '照顾好周期和心情，好消息会来的。';
    document.getElementById('status-foot').textContent = `备孕第 ${currentPoint().week} 周 · 一步一步，稳稳地来`;
    bar.classList.add('hidden');
    cta.classList.remove('hidden');
    edit.classList.add('hidden');
  }
}

function render() {
  const plan = weeklyPlans[viewPhase][viewWeek];
  const tasks = plan.tasks;
  const cur = currentPoint();
  renderTaskList(document.getElementById('task-list'));
  renderTaskList(document.getElementById('tasks-view-list'));
  const count = tasks.filter((_, index) => completed.has(`${viewPhase}-${viewWeek}-${index}`)).length;
  document.getElementById('metric-count').textContent = count;
  document.getElementById('hero-count').textContent = count;
  document.getElementById('tasks-view-count').textContent = count;
  document.getElementById('week-theme').textContent = plan.theme;
  document.getElementById('week-note').textContent = plan.note;
  document.getElementById('tasks-week-theme').textContent = plan.theme;
  document.getElementById('tasks-week-note').textContent = plan.note;
  document.querySelectorAll('.task-total').forEach((element) => { element.textContent = tasks.length; });
  document.getElementById('tasks-stage-label').textContent = stageNames[viewPhase];
  document.getElementById('tasks-week-label').textContent = `${viewPhase === 'prepare' ? '备孕' : '怀孕'}第 ${viewWeek} 周`;
  document.getElementById('tasks-previous-week').disabled = viewWeek <= weekRanges[viewPhase][0];
  document.getElementById('tasks-next-week').disabled = viewWeek >= weekRanges[viewPhase][1];
  document.getElementById('stage-name').textContent = stageNames[cur.phase];
  document.getElementById('week-label').textContent = `${viewPhase === 'prepare' ? '备孕' : '怀孕'}第 ${viewWeek} 周`;
  document.querySelector('#journey-view .week-bar div span').textContent = isViewingCurrent() ? '本周计划' : '正在回看';
  document.getElementById('previous-week').disabled = viewWeek <= weekRanges[viewPhase][0];
  document.getElementById('next-week').disabled = viewWeek >= weekRanges[viewPhase][1];
  document.getElementById('back-to-current').classList.toggle('hidden', isViewingCurrent());
  document.getElementById('tasks-back-to-current').classList.toggle('hidden', isViewingCurrent());
  document.querySelector('.hero .overline').textContent = `OUR LITTLE JOURNEY · WEEK ${viewWeek}`;
  // 旅程时间轴：由状态与孕周推导
  const nowIndex = status === 'pregnant' ? (cur.phase === 'late' ? 3 : 2) : 1;
  document.querySelector('.timeline').style.setProperty('--journey-progress', `${nowIndex * 33}%`);
  document.querySelectorAll('.timeline .step').forEach((step, index) => {
    step.classList.toggle('past', index < nowIndex);
    step.classList.toggle('now', index === nowIndex);
    step.querySelector('span').textContent = index < nowIndex ? '已走过' : index === nowIndex ? '现在' : '接下来';
  });
  document.querySelectorAll('[data-phase]').forEach((button) => button.classList.toggle('active', button.dataset.phase === viewPhase));
  document.querySelectorAll('[data-role]').forEach((button) => button.classList.toggle('active', button.dataset.role === role));
  document.querySelectorAll('[data-task-phase]').forEach((button) => button.classList.toggle('active', button.dataset.taskPhase === viewPhase));
  document.querySelectorAll('[data-task-role]').forEach((button) => button.classList.toggle('active', button.dataset.taskRole === role));
  document.getElementById('mom-avatar').textContent = names.mom[0];
  document.getElementById('dad-avatar').textContent = names.dad[0];
  document.querySelector('[data-role="mom"]').textContent = `给${names.mom}`;
  document.querySelector('[data-role="dad"]').textContent = `给${names.dad}`;
  document.querySelector('[data-task-role="mom"]').textContent = `给${names.mom}`;
  document.querySelector('[data-task-role="dad"]').textContent = `给${names.dad}`;
  document.querySelector('#comment-author [value="mom"]').textContent = names.mom;
  document.querySelector('#comment-author [value="dad"]').textContent = names.dad;
  renderStatus();
  renderComments();
  renderRewards();
}

function renderRewards() {
  const total = completed.size;
  document.getElementById('rewards-total').textContent = total;
  const milestones = [1, 3, 6, 12];
  document.getElementById('rewards-next').textContent = total >= 12 ? '这一程的每一步，都值得被记住。' : `再完成 ${milestones.find((value) => value > total) - total} 件事，点亮下一枚纪念。`;
  const list = document.getElementById('reward-grid');
  list.replaceChildren();
  milestones.forEach((target, index) => {
    const item = document.createElement('div');
    item.className = `reward-card${total >= target ? ' earned' : ''}`;
    item.innerHTML = '<span class="reward-icon"></span><small></small><strong></strong><p></p>';
    item.querySelector('.reward-icon').textContent = ['✦', '♡', '❋', '✿'][index];
    item.querySelector('small').textContent = `${target} 件小事`;
    item.querySelector('strong').textContent = ['第一步', '并肩向前', '一周的温柔', '一路相伴'][index];
    item.querySelector('p').textContent = total >= target ? '已经点亮，记得夸夸彼此。' : '等待你们一起点亮。';
    list.append(item);
  });
}

function openModal(taskId = null, title = '') {
  activeTask = taskId;
  document.getElementById('modal-title').textContent = title ? `给「${title}」留句话` : '写下一句话';
  document.getElementById('modal-subtitle').textContent = title ? '分享你的想法，给彼此一点支持。' : '小小的分享，会让共同的旅程更有温度。';
  document.getElementById('comment-text').value = '';
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('comment-text').focus();
}

function openPregnancyModal() {
  const pregnant = status === 'pregnant';
  document.getElementById('pregnancy-title').textContent = pregnant ? '修改末次月经' : '报喜：确认怀孕了';
  document.getElementById('pregnancy-sub').textContent = pregnant
    ? '调整末次月经后，孕周、预产期和每周清单都会自动更新。'
    : '填写末次月经的第一天，我们会帮你算好孕周和预产期，每周清单也会自动跟上。';
  document.getElementById('lmp-input').value = lmp || '';
  document.getElementById('pregnancy-back').classList.toggle('hidden', !pregnant);
  document.getElementById('pregnancy-save').textContent = pregnant ? '保存' : '保存，进入孕周模式';
  document.getElementById('pregnancy-modal').classList.remove('hidden');
  document.getElementById('lmp-input').focus();
}

async function start() {
  try {
    await sql('CREATE TABLE IF NOT EXISTS journey_pregnancy (id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT \'prepare\', lmp_date TEXT, updated_at TEXT)');
    const settings = (await sql('SELECT phase, week_number, started_at, mom_name, dad_name FROM journey_settings WHERE id = ?', ['main'])).rows[0];
    names = { mom: settings?.mom_name || '妈妈', dad: settings?.dad_name || '爸爸' };
    prepareDays = settings ? Math.max(1, Math.floor((Date.now() - new Date(settings.started_at).getTime()) / 86400000)) : 1;
    const state = (await sql('SELECT status, lmp_date FROM journey_pregnancy WHERE id = ?', ['main'])).rows[0];
    status = state?.status === 'pregnant' && state.lmp_date ? 'pregnant' : 'prepare';
    lmp = status === 'pregnant' ? state.lmp_date : null;
    const cur = currentPoint();
    viewPhase = cur.phase;
    viewWeek = cur.week;
    completed = new Set((await sql('SELECT task_id FROM journey_progress WHERE journey_id = ?', ['main'])).rows.map((row) => row.task_id));
    comments = (await sql('SELECT author, body, created_at FROM journey_comments WHERE journey_id = ? ORDER BY created_at DESC LIMIT 20', ['main'])).rows;
    document.getElementById('streak-count').textContent = prepareDays;
    document.getElementById('streak-side').textContent = `一起走过的第 ${prepareDays} 天`;
    document.querySelector('.date').textContent = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
    render();
  } catch (error) { toast(`数据加载失败：${error.message}`); }
}

// 阶段标签只用于浏览，不再改写状态
function browsePhase(nextPhase) {
  const cur = currentPoint();
  viewPhase = nextPhase;
  viewWeek = nextPhase === cur.phase ? cur.week : weekRanges[nextPhase][0];
  render();
}
document.querySelectorAll('[data-phase]').forEach((button) => button.onclick = () => browsePhase(button.dataset.phase));
document.querySelectorAll('[data-task-phase]').forEach((button) => button.onclick = () => browsePhase(button.dataset.taskPhase));

function moveWeek(delta) {
  const next = viewWeek + delta;
  if (next < weekRanges[viewPhase][0] || next > weekRanges[viewPhase][1]) return;
  viewWeek = next;
  render();
}
document.getElementById('previous-week').onclick = () => moveWeek(-1);
document.getElementById('next-week').onclick = () => moveWeek(1);
document.getElementById('tasks-previous-week').onclick = () => moveWeek(-1);
document.getElementById('tasks-next-week').onclick = () => moveWeek(1);
function backToCurrent() {
  const cur = currentPoint();
  viewPhase = cur.phase;
  viewWeek = cur.week;
  render();
}
document.getElementById('back-to-current').onclick = backToCurrent;
document.getElementById('tasks-back-to-current').onclick = backToCurrent;

document.querySelectorAll('[data-role]').forEach((button) => button.onclick = () => { role = button.dataset.role; render(); });
document.querySelectorAll('[data-task-role]').forEach((button) => button.onclick = () => { role = button.dataset.taskRole; render(); });
function showView(name) {
  document.querySelectorAll('[data-nav]').forEach((button) => {
    const active = button.dataset.nav === name;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
    if (active) document.getElementById('crumb').textContent = button.querySelector('span:last-child').textContent.trim();
  });
  document.querySelectorAll('.journey-view').forEach((view) => view.classList.toggle('hidden', view.id !== `${name}-view`));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
document.querySelectorAll('[data-nav]').forEach((button) => button.onclick = () => showView(button.dataset.nav));
document.getElementById('add-note').onclick = () => openModal();
document.getElementById('moments-add-note').onclick = () => openModal();
document.getElementById('cancel').onclick = () => document.getElementById('modal').classList.add('hidden');
document.getElementById('modal').onclick = (event) => { if (event.target.id === 'modal') event.currentTarget.classList.add('hidden'); };
document.getElementById('save-comment').onclick = async () => {
  const body = document.getElementById('comment-text').value.trim();
  if (!body) return;
  try {
    const comment = { id: newId(), author: names[document.getElementById('comment-author').value], body, created_at: new Date().toISOString() };
    await sql('INSERT INTO journey_comments (id, journey_id, task_id, author, body, created_at) VALUES (?, ?, ?, ?, ?, ?)', [comment.id, 'main', activeTask, comment.author, comment.body, comment.created_at]);
    comments.unshift(comment);
    renderComments();
    document.getElementById('modal').classList.add('hidden');
    toast('♡ 这句话已留在你们的旅程里');
  } catch (error) { toast(error.message); }
};

// 报喜 / 修改末次月经
document.getElementById('pregnancy-cta').onclick = openPregnancyModal;
document.getElementById('lmp-edit').onclick = openPregnancyModal;
document.getElementById('pregnancy-cancel').onclick = () => document.getElementById('pregnancy-modal').classList.add('hidden');
document.getElementById('pregnancy-modal').onclick = (event) => { if (event.target.id === 'pregnancy-modal') event.currentTarget.classList.add('hidden'); };
document.getElementById('pregnancy-save').onclick = async () => {
  const value = document.getElementById('lmp-input').value;
  if (!value) { toast('先选一个日期吧'); return; }
  const days = Math.floor((startOfToday() - parseDate(value)) / 86400000);
  if (days < 0) { toast('末次月经不能是未来哦，再检查一下日期'); return; }
  try {
    await sql('INSERT OR REPLACE INTO journey_pregnancy (id, status, lmp_date, updated_at) VALUES (?, ?, ?, ?)', ['main', 'pregnant', value, new Date().toISOString()]);
    const wasPregnant = status === 'pregnant';
    status = 'pregnant';
    lmp = value;
    const cur = currentPoint();
    viewPhase = cur.phase;
    viewWeek = cur.week;
    document.getElementById('pregnancy-modal').classList.add('hidden');
    render();
    if (!wasPregnant) toast('♡ 记下啦！每周清单会自动跟着孕周走');
    else toast('已更新，孕周和预产期重新算好了');
  } catch (error) { toast(error.message); }
};
document.getElementById('pregnancy-back').onclick = async () => {
  try {
    await sql('INSERT OR REPLACE INTO journey_pregnancy (id, status, lmp_date, updated_at) VALUES (?, ?, ?, ?)', ['main', 'prepare', null, new Date().toISOString()]);
    status = 'prepare';
    lmp = null;
    const cur = currentPoint();
    viewPhase = cur.phase;
    viewWeek = cur.week;
    document.getElementById('pregnancy-modal').classList.add('hidden');
    render();
    toast('已回到备孕清单，继续稳稳地来');
  } catch (error) { toast(error.message); }
};

document.getElementById('profile-trigger').onclick = () => {
  document.getElementById('mom-name').value = names.mom;
  document.getElementById('dad-name').value = names.dad;
  document.getElementById('profile-modal').classList.remove('hidden');
  document.getElementById('mom-name').focus();
};
document.getElementById('profile-cancel').onclick = () => document.getElementById('profile-modal').classList.add('hidden');
document.getElementById('profile-modal').onclick = (event) => { if (event.target.id === 'profile-modal') event.currentTarget.classList.add('hidden'); };
document.getElementById('profile-save').onclick = async () => {
  const mom = document.getElementById('mom-name').value.trim() || '妈妈';
  const dad = document.getElementById('dad-name').value.trim() || '爸爸';
  try {
    await sql('UPDATE journey_settings SET mom_name = ?, dad_name = ? WHERE id = ?', [mom, dad, 'main']);
    names = { mom, dad };
    document.getElementById('profile-modal').classList.add('hidden');
    render();
    toast('称呼已保存');
  } catch (error) { toast(error.message); }
};

showView('journey');
start();
