import { createBoard, judgePlacement, orderOf } from './board.js';
import { planOf, isPlayable, idsLeaves, splitChars, MODE_BADGE, MODE_LABEL } from './hanzi.js';
import { esc, fmtMs, toast } from './ui.js';
import * as store from './store.js';
import { currentIdentity } from './identity.js';

function hintFor(plan) {
  const structure = plan.structure || '';
  const base = /左右/.test(structure) ? '这是一个左右结构的字，两边各有一部分，宽度不一定一样多。'
    : /上下/.test(structure) ? '这是一个上下结构的字，上下各有一部分，大小不一定相同。'
      : '这个字由几部分拼起来，看看它们分别像什么。';
  return `${base}（这是其中一种拆法）`;
}

export function renderPractice(root, { code, go }) {
  let records = [];
  let queue = [];
  let index = 0;
  let attempts = 0;
  let questionStart = 0;
  let board = null;
  let overrides = {};
  let room = null;
  let nickname = '';
  let timer = null;

  root.innerHTML = '<div class="page"><div id="pr-body"></div></div>';
  const body = root.querySelector('#pr-body');

  function cleanup() {
    board?.destroy();
    board = null;
    clearInterval(timer);
  }

  async function load() {
    if (code) {
      room = await store.getRoom(code);
      if (!room) {
        body.innerHTML = `<div class="card"><h2>找不到游戏室「${esc(code)}」</h2><p class="muted">请确认链接是否正确。</p></div>`;
        return;
      }
      const list = await store.listOverrides(room.ownerId);
      overrides = Object.fromEntries(list.map((item) => [item.char, item]));
      const chars = await store.roomChars(code);
      if (!chars.length) {
        body.innerHTML = '<div class="card"><h2>这一课还没有生字</h2><p class="muted">请联系老师。</p></div>';
        return;
      }
      startView(chars.map((item) => item.char), room.name || code);
      return;
    }
    const identity = await currentIdentity();
    const sets = await store.listCharSets(identity.id);
    body.innerHTML = `
      <div class="home-hero">
        <div class="logo">🏠</div>
        <h1>课后自主练习</h1>
        <p class="muted">自己选字练，练完可以上传记录（不记录你是谁）</p>
      </div>
      <div class="card col">
        <div class="info-box">我们<strong>不会记录你的身份</strong>：不存姓名、不存年龄、不存 IP、不做个人档案。上传的只有「哪个字、对不对、用了几次」，用来让老师知道该讲哪些字。</div>
        <div>
          <label for="pr-nick">你的昵称（只用于本次问候，不上传）</label>
          <input id="pr-nick" maxlength="20" placeholder="例如：小明" />
        </div>
        <div>
          <label for="pr-set">从字库选一组（老师事先准备的生字表）</label>
          <select id="pr-set">
            <option value="">— 选择一个字库 —</option>
            ${sets.map((set) => `<option value="${esc(set.id)}">[${esc(set.category || '未分类')}] ${esc(set.name)}（${splitChars(set.chars).length} 字）</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="pr-custom">或者自己输入要练的字</label>
          <textarea id="pr-custom" placeholder="例如：明 休 林 好"></textarea>
        </div>
        <button id="pr-start">开始练习</button>
      </div>`;
    body.querySelector('#pr-nick').addEventListener('input', (event) => { nickname = event.target.value; });
    body.querySelector('#pr-set').addEventListener('change', (event) => {
      const set = sets.find((item) => item.id === event.target.value);
      if (set) body.querySelector('#pr-custom').value = set.chars;
    });
    body.querySelector('#pr-start').addEventListener('click', () => {
      const chars = splitChars(body.querySelector('#pr-custom').value);
      if (!chars.length) { toast('请先选一组字库或输入汉字'); return; }
      startView(chars, '自主练习');
    });
  }

  function startView(chars, title) {
    const playable = chars.filter((char) => isPlayable(planOf(char, overrides[char])));
    body.innerHTML = `
      <div class="home-hero">
        <div class="logo">📘</div>
        <h1>课后练习</h1>
        <p class="muted">本课生字 · ${esc(title)}</p>
      </div>
      <div class="card col">
        <div class="info-box">我们<strong>不会记录你的身份</strong>：不存姓名、不存年龄、不存 IP、不做个人档案。 上传的只有「哪个字、对不对、用了几次」，用来让老师知道该讲哪些字。</div>
        <div class="row"><strong>${esc(title)}</strong></div>
        <div class="muted">本课生字 ${chars.length} 个</div>
        <div class="chip-row">
          ${chars.map((char) => {
    const plan = planOf(char, overrides[char]);
    return `<span class="char-chip"><span class="mode-badge mode-${plan.mode}">${MODE_BADGE[plan.mode] || '?'}</span><span class="big">${esc(char)}</span></span>`;
  }).join('')}
        </div>
        <button id="pr-begin"${playable.length ? '' : ' disabled'}>开始练习本课生字</button>
        <p class="muted" style="margin:0;font-size:.8rem">想练别的字？<a href="#/practice" style="color:var(--primary)">去课后自主练习 →</a></p>
      </div>`;
    body.querySelector('#pr-begin').addEventListener('click', () => {
      queue = playable;
      index = 0;
      records = [];
      nextQuestion();
    });
  }

  function nextQuestion() {
    cleanup();
    if (index >= queue.length) { finish(); return; }
    const char = queue[index];
    const plan = planOf(char, overrides[char]);
    attempts = 0;
    questionStart = Date.now();
    body.innerHTML = `
      <div class="student-bar">
        <strong>${esc(nickname || '练习')}</strong>
        <span class="progress-pill">第 ${index + 1} 个字 · 共 ${queue.length} 个字</span>
        <span class="spacer"></span>
        <span class="timer-pill" id="pr-timer">⏱ 0:00</span>
      </div>
      <div class="q-head"><div class="q-char-hint"><span class="muted">· 把部件摆成这个字的样子</span></div></div>
      <div id="pr-hint"></div>
      <div class="assembly-area" id="pr-area"></div>
      <div class="parts-tray" id="pr-tray"></div>
      <div class="submit-row">
        <button id="pr-submit" disabled>还差 ${plan.parts.length} 块</button>
        <button class="ghost" id="pr-clear">清空重来</button>
      </div>`;
    const area = body.querySelector('#pr-area');
    const tray = body.querySelector('#pr-tray');
    const submit = body.querySelector('#pr-submit');
    const hintNode = body.querySelector('#pr-hint');
    board = createBoard({
      area, tray, plan,
      onChange(placed) {
        const missing = plan.parts.length - placed.length;
        submit.disabled = missing !== 0;
        submit.textContent = missing > 0 ? `还差 ${missing} 块` : attempts > 0 ? '重新提交' : '提交答案';
      },
    });
    body.querySelector('#pr-clear').addEventListener('click', () => {
      board.reset();
      submit.disabled = true;
      submit.textContent = `还差 ${plan.parts.length} 块`;
    });
    timer = setInterval(() => {
      const node = body.querySelector('#pr-timer');
      if (node) node.textContent = `⏱ ${fmtMs(Date.now() - questionStart)}`;
    }, 500);
    submit.addEventListener('click', () => {
      const placed = board.getPlaced();
      if (placed.length !== plan.parts.length) return;
      attempts += 1;
      const correct = judgePlacement(placed, plan);
      const elapsedMs = Date.now() - questionStart;
      records.push({ char, attempts, correct, elapsedMs });
      if (correct) {
        showCorrect(char, plan);
        setTimeout(() => { index += 1; nextQuestion(); }, 2000);
        return;
      }
      if (attempts >= 3) {
        hintNode.innerHTML = `<div class="hint-box"><strong>💡 提示（不会直接告诉你答案）</strong><br>${esc(hintFor(plan))}</div>`;
        toast('已给出结构提示，可以继续尝试');
        return;
      }
      hintNode.innerHTML = `<div class="warn-box"><div>还不对 —— 可以拖动部件换位置，或点一下部件把它取下</div>
        <div class="muted" style="margin-top:4px">（第 ${attempts} 次，第 3 次会给出结构提示）</div></div>`;
      submit.textContent = '重新提交';
    });
  }

  function showCorrect(char, plan) {
    const area = body.querySelector('#pr-area');
    if (!area) return;
    const seq = idsLeaves(plan.ids);
    const parts = seq && seq.length === plan.parts.length ? seq : plan.parts;
    const card = document.createElement('div');
    card.className = 'feedback-correct';
    card.innerHTML = `
      <div class="ok-line">✓ 答对了！</div>
      <div class="progress">第 ${index + 1} 个字 · 共 ${queue.length} 个字</div>
      <div class="big-char">${esc(char)}</div>
      ${plan.py ? `<div class="pinyin">${esc(plan.py)}</div>` : ''}
      ${plan.en ? `<div class="gloss">${esc(plan.en)}</div>` : ''}
      <div class="reveal-parts">${parts.map((part) => `<span class="reveal-part">${esc(part)}</span>`).join('<span>+</span>')}
        <span>=</span><span class="reveal-part">${esc(char)}</span></div>`;
    area.append(card);
  }

  async function finish() {
    cleanup();
    const correct = records.filter((record) => record.correct).length;
    body.innerHTML = `
      <div class="home-hero"><div class="logo">🎉</div><h1>练习完成</h1>
        <p class="muted">${esc(nickname ? `${nickname}，` : '')}本组 ${records.length} 个字，答对 ${correct} 个</p></div>
      <div class="card col">
        <div class="muted">正在上传练习记录（不含身份信息）…</div>
        <div class="row"><button id="pr-again">再练一遍</button><button class="ghost" id="pr-home">回到首页</button></div>
      </div>`;
    try {
      await store.addPractice(records);
      const node = body.querySelector('.card .muted');
      if (node) node.textContent = `已上传 ${records.length} 条练习记录（不含身份信息）`;
    } catch {
      const node = body.querySelector('.card .muted');
      if (node) node.textContent = '记录上传失败（不影响本次练习）';
    }
    body.querySelector('#pr-again').addEventListener('click', () => {
      index = 0; records = []; nextQuestion();
    });
    body.querySelector('#pr-home').addEventListener('click', () => go('#/'));
  }

  load().catch((error) => {
    body.innerHTML = `<div class="card"><h2>加载失败</h2><p class="muted">${esc(error.message || '请刷新重试')}</p></div>`;
  });

  return { destroy: cleanup };
}
