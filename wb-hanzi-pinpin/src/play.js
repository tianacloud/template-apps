import { createBoard, judgePlacement, orderOf } from './board.js';
import { planOf, isPlayable, idsLeaves } from './hanzi.js';
import { esc, fmtMs, pct, toast } from './ui.js';
import { leaderboardHtml, scoreRuleText } from './leaderboard.js';
import * as store from './store.js';

const HINT_TEXT = {
  lr: '这是一个左右结构的字，两边各有一部分。提示：两部分的宽度不一定一样多。',
  tb: '这是一个上下结构的字，上下各有一部分，大小不一定相同。',
  other: '这个字由几部分拼起来，看看它们分别像什么。',
};

function hintFor(plan) {
  const structure = plan.structure || '';
  const base = /左右/.test(structure) ? HINT_TEXT.lr : /上下/.test(structure) ? HINT_TEXT.tb : HINT_TEXT.other;
  const locked = plan.lockParts?.length ? ' 其中有一块是「整块」的，不能再拆开。' : '';
  return `${base}${locked}（这是其中一种拆法）`;
}

export function renderPlay(root, { code, go }) {
  const sessionKey = `hanzi-pinpin:student:${code}`;
  let student = JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  let overrides = {};
  let room = null;
  let chars = [];
  let state = null;
  let ahead = 0;
  let attempts = 0;
  let hintShown = false;
  let helped = false;
  let questionStart = Date.now();
  let board = null;
  let locked = false;
  let timer = null;
  let pollTimer = null;
  let heartbeatTimer = null;
  let feedbackTimer = null;
  let giveUpTimer = null;
  let lbScope = 'all';
  let lbPeriod = 'all';

  root.innerHTML = `
    <div class="page">
      <div class="student-bar">
        <strong id="stu-name">同学</strong>
        <span class="preview-pill" id="stu-preview" hidden>预览</span>
        <span class="progress-pill" id="stu-progress">加载中</span>
        <span class="spacer"></span>
        <span class="timer-pill" id="stu-timer">⏱ 0:00</span>
      </div>
      <div id="stu-body"></div>
    </div>`;

  const body = root.querySelector('#stu-body');
  const nameNode = root.querySelector('#stu-name');
  const progressNode = root.querySelector('#stu-progress');
  const timerNode = root.querySelector('#stu-timer');
  const previewNode = root.querySelector('#stu-preview');

  function teardown() {
    board?.destroy();
    board = null;
    clearInterval(timer);
    clearInterval(pollTimer);
    clearInterval(heartbeatTimer);
    clearTimeout(feedbackTimer);
    clearTimeout(giveUpTimer);
  }

  function currentIndex() {
    const teacherIndex = state?.currentIndex ?? 0;
    const total = chars.length;
    return Math.max(0, Math.min(teacherIndex + ahead, Math.max(0, total - 1)));
  }

  function planFor(char) {
    return planOf(char, overrides[char]);
  }

  async function join(nickname) {
    const created = await store.joinRoom(code, nickname);
    student = created;
    sessionStorage.setItem(sessionKey, JSON.stringify(created));
    await load();
  }

  function joinView() {
    body.innerHTML = `
      <div class="home-hero">
        <div class="logo">🧩</div>
        <h1>汉字拼拼乐</h1>
        <div class="school-brand">
          <div class="brand-cn">中文课堂</div>
          <div class="brand-en">Chinese Classroom</div>
        </div>
        <p class="muted" style="margin-top:10px">输入昵称即可加入，无需密码</p>
      </div>
      <div class="card col">
        <div>
          <label for="join-nick">你的昵称</label>
          <input id="join-nick" maxlength="20" placeholder="例如：小明" />
        </div>
        <button id="join-go">加入课堂</button>
        <div class="muted">游戏室 <b>${esc(code)}</b></div>
      </div>`;
    const input = body.querySelector('#join-nick');
    input.focus();
    const submit = async () => {
      const value = input.value.trim();
      if (!value) { toast('请输入昵称'); return; }
      try { await join(value); } catch (error) { toast(error.message || '加入失败'); }
    };
    body.querySelector('#join-go').addEventListener('click', submit);
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') submit(); });
  }

  async function load() {
    room = await store.getRoom(code);
    if (!room) {
      body.innerHTML = `<div class="card"><h2>找不到游戏室「${esc(code)}」</h2><p class="muted">请确认链接或房间号是否正确。</p></div>`;
      return;
    }
    const list = await store.listOverrides(room.ownerId);
    overrides = Object.fromEntries(list.map((item) => [item.char, item]));
    chars = await store.roomChars(code);
    if (!student) { joinView(); return; }
    nameNode.textContent = student.nickname;
    await refreshState();
    startTimers();
    paint();
  }

  async function refreshState() {
    state = {
      status: room.status,
      currentIndex: room.currentIndex,
      roundNo: room.roundNo,
    };
    if (room.status === 'playing' || room.status === 'lobby') {
      try {
        const fresh = await store.getRoom(code);
        if (fresh) {
          const changed = fresh.currentIndex !== state.currentIndex;
          room = fresh;
          state = { status: room.status, currentIndex: room.currentIndex, roundNo: room.roundNo };
          if (changed) {
            ahead = 0;
            resetQuestion();
            paint();
          } else if (state.status !== 'playing') {
            paint();
          }
        }
      } catch { /* 轮询失败时保持当前题目 */ }
    }
  }

  function startTimers() {
    clearInterval(timer);
    clearInterval(pollTimer);
    clearInterval(heartbeatTimer);
    timer = setInterval(() => {
      if (!locked) timerNode.textContent = `⏱ ${fmtMs(Date.now() - questionStart)}`;
    }, 500);
    pollTimer = setInterval(() => { refreshState().catch(() => {}); }, 4000);
    heartbeatTimer = setInterval(() => { store.touchStudent(code, student.id).catch(() => {}); }, 8000);
    store.touchStudent(code, student.id).catch(() => {});
  }

  function resetQuestion() {
    attempts = 0;
    hintShown = false;
    helped = false;
    locked = false;
    questionStart = Date.now();
  }

  function paint() {
    if (!student) return;
    if (room.status === 'lobby') {
      body.innerHTML = `<div class="card center"><h2>课堂还没开始</h2><p class="muted">老师开始上课后，这里会自动出现第一道题。</p></div>`;
      progressNode.textContent = `共 ${chars.length} 个字`;
      return;
    }
    if (room.status === 'ended') {
      body.innerHTML = `<div class="card center"><h2>本局已结束</h2><p class="muted">谢谢参与！老师已经拿到成绩报告。</p>
        <button id="ended-home">回到首页</button></div>`;
      body.querySelector('#ended-home').addEventListener('click', () => go('#/'));
      return;
    }
    const index = currentIndex();
    const item = chars[index];
    if (!item) {
      body.innerHTML = `<div class="card center"><h2>这一课还没有生字</h2><p class="muted">请联系老师补充字表。</p></div>`;
      return;
    }
    const plan = planFor(item.char);
    previewNode.hidden = ahead <= 0;
    progressNode.textContent = `第 ${index + 1} 个字 · 共 ${chars.length} 个字`;
    timerNode.textContent = `⏱ ${fmtMs(Date.now() - questionStart)}`;

    if (!isPlayable(plan)) {
      body.innerHTML = `<div class="card"><h2>「${esc(item.char)}」是独体字</h2>
        <p class="muted">这个字不拆分，可以直接跳过，看下一个字。</p></div>`;
      return;
    }

    body.innerHTML = `
      <div class="q-nav">
        <button class="ghost" id="nav-prev"${ahead <= 0 ? ' disabled' : ''}>← 上一题</button>
        <button class="ghost${ahead > 0 ? ' primary' : ''}" id="nav-here">回到当前</button>
        <button class="ghost" id="nav-next"${index >= chars.length - 1 ? ' disabled' : ''}>下一题 →</button>
      </div>
      <div class="q-head"><div class="q-char-hint"><span class="muted">· 老师指定了拆法</span></div></div>
      <div id="stu-hint"></div>
      ${ahead > 0 ? '<div class="info-box">你已经做到这一题了 —— 做完了就继续往下做，不用等老师。老师会跟上来的。</div>' : ''}
      <div class="assembly-area" id="stu-area"></div>
      <div class="parts-tray" id="stu-tray"></div>
      <div class="submit-row">
        <button id="stu-submit" disabled>还差 ${plan.parts.length} 块</button>
        <button class="ghost" id="stu-clear">清空重来</button>
      </div>
      <button class="help-btn" id="stu-help" aria-label="求助">✋</button>
      <section class="lb-section">
        <h2 class="lb-section-title">🏆 排行榜</h2>
        <div id="stu-lb"></div>
      </section>`;

    const area = body.querySelector('#stu-area');
    const tray = body.querySelector('#stu-tray');
    const submit = body.querySelector('#stu-submit');
    const hintNode = body.querySelector('#stu-hint');

    board?.destroy();
    board = createBoard({
      area, tray, plan,
      onChange(placed) {
        const missing = plan.parts.length - placed.length;
        submit.disabled = missing !== 0 || locked;
        submit.textContent = missing > 0 ? `还差 ${missing} 块` : attempts > 0 ? '重新提交' : '提交答案';
      },
    });

    body.querySelector('#stu-clear').addEventListener('click', () => {
      if (locked) return;
      board.reset();
      submit.disabled = true;
      submit.textContent = `还差 ${plan.parts.length} 块`;
    });
    submit.addEventListener('click', () => submitAnswer(item, plan, hintNode, submit));
    body.querySelector('#nav-prev').addEventListener('click', () => { if (ahead > 0) { ahead -= 1; resetQuestion(); paint(); } });
    body.querySelector('#nav-next').addEventListener('click', () => { if (index < chars.length - 1) { ahead += 1; resetQuestion(); paint(); } });
    body.querySelector('#nav-here').addEventListener('click', () => { ahead = 0; resetQuestion(); paint(); });
    body.querySelector('#stu-help').addEventListener('click', async () => {
      helped = true;
      await store.askHelp(code, student.id).catch(() => {});
      toast('已告诉老师你需要帮助');
    });

    paintLeaderboard();
    if (hintShown) renderHint(hintNode, plan);
  }

  function renderHint(node, plan) {
    node.innerHTML = `<div class="hint-box"><strong>💡 提示（不会直接告诉你答案）</strong><br>${esc(hintFor(plan))}</div>`;
  }

  async function submitAnswer(item, plan, hintNode, submit) {
    if (locked) return;
    const placed = board.getPlaced();
    if (placed.length !== plan.parts.length) return;
    attempts += 1;
    const { formation } = orderOf(placed);
    const parts = placed.map((part) => part.char);
    const correct = judgePlacement(placed, plan);
    const elapsedMs = Date.now() - questionStart;

    try {
      await store.saveAnswer({
        code, studentId: student.id, charIndex: currentIndex(), char: item.char,
        parts, formation, attempts, elapsedMs, correct, helped,
      });
    } catch (error) {
      toast(error.message || '提交失败，请重试');
      return;
    }

    if (correct) {
      locked = true;
      submit.disabled = true;
      showCorrect(item, plan, placed);
      feedbackTimer = setTimeout(() => {
        if (currentIndex() >= chars.length - 1) {
          locked = false;
          paint();
          return;
        }
        ahead += 1;
        resetQuestion();
        paint();
      }, 2600);
      return;
    }

    if (attempts >= 3) {
      hintShown = true;
      renderHint(hintNode, plan);
      const warn = document.createElement('div');
      warn.className = 'warn-box';
      warn.innerHTML = `<div class="title">这道题先放下吧 —— 已经试了 ${attempts} 次。</div>
        <div class="muted">4 秒后自动进入下一题</div>
        <button class="ghost small" id="keep-trying" style="margin-top:8px">我还能再试试，留在本题</button>
        <div class="muted" style="margin-top:6px">去看看别的题也行（上面有「上一题 / 下一题」）。</div>`;
      hintNode.append(warn);
      warn.querySelector('#keep-trying').addEventListener('click', () => {
        clearTimeout(giveUpTimer);
        warn.remove();
      });
      giveUpTimer = setTimeout(() => {
        if (currentIndex() < chars.length - 1) { ahead += 1; resetQuestion(); paint(); }
      }, 4000);
      return;
    }

    const left = 3 - attempts;
    hintNode.innerHTML = `<div class="warn-box">
      <div>还不对 —— 可以拖动部件换位置，或点一下部件把它取下</div>
      <div class="muted" style="margin-top:4px">（第 ${attempts} 次，第 3 次会给出结构提示）</div></div>`;
    submit.textContent = '重新提交';
    toast(`已尝试 ${attempts} 次 · 再错 ${left} 次会给结构提示`);
  }

  function showCorrect(item, plan, placed) {
    const area = body.querySelector('#stu-area');
    if (!area) return;
    const seq = idsLeaves(plan.ids);
    const parts = seq && seq.length === plan.parts.length ? seq : plan.parts;
    const card = document.createElement('div');
    card.className = 'feedback-correct';
    card.innerHTML = `
      <div class="ok-line">✓ 答对了！</div>
      <div class="progress">第 ${currentIndex() + 1} 个字 · 共 ${chars.length} 个字</div>
      <div class="big-char">${esc(item.char)}</div>
      ${plan.py ? `<div class="pinyin">${esc(plan.py)}</div>` : ''}
      ${plan.en ? `<div class="gloss">${esc(plan.en)}</div>` : ''}
      <div class="reveal-parts">${parts.map((part) => `<span class="reveal-part">${esc(part)}</span>`).join('<span>+</span>')}
        <span>=</span><span class="reveal-part">${esc(item.char)}</span></div>
      <div class="countdown">2 秒后看下一题</div>
      <div class="bar"><span></span></div>`;
    area.append(card);
    timerNode.textContent = `⏱ ${fmtMs(Date.now() - questionStart)}`;
  }

  async function paintLeaderboard() {
    const node = body.querySelector('#stu-lb');
    if (!node) return;
    try {
      const entries = await store.leaderboard({ code, scope: lbScope, period: lbPeriod });
      node.innerHTML = leaderboardHtml(entries, { scope: lbScope, period: lbPeriod, roomCode: code });
      node.querySelectorAll('[data-lb-scope]').forEach((button) => button.addEventListener('click', () => {
        lbScope = button.dataset.lbScope; paintLeaderboard();
      }));
      node.querySelectorAll('[data-lb-period]').forEach((button) => button.addEventListener('click', () => {
        lbPeriod = button.dataset.lbPeriod; paintLeaderboard();
      }));
    } catch {
      node.innerHTML = '<p class="muted">排行榜暂时不可用</p>';
    }
  }

  load().catch((error) => {
    body.innerHTML = `<div class="card"><h2>加载失败</h2><p class="muted">${esc(error.message || '请刷新重试')}</p></div>`;
  });

  return { destroy: teardown };
}
