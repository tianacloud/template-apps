/* =========================================================
 * 过去多久 · 事项计时器
 * 纯前端实现：localStorage 持久化 + setInterval 逐秒刷新
 * 零依赖，浏览器直接打开 index.html 即可运行
 * ========================================================= */
(() => {
  'use strict';

  /* ---------- 常量 ---------- */
  const STORAGE_KEY = 'elapsed-tracker:v1';
  const MAX_NAME_LEN = 50;
  let toastTimer = null;

  /* ---------- DOM 引用 ---------- */
  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('empty');
  const statsEl = document.getElementById('stats');
  const nameInput = document.getElementById('name-input');
  const addForm = document.getElementById('add-form');
  const customToggle = document.getElementById('custom-time-toggle');
  const customTime = document.getElementById('custom-time');
  const toastEl = document.getElementById('toast');

  /* ---------- 通用工具 ---------- */
  const pad2 = (n) => String(n).padStart(2, '0');
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* =========================================================
   * 数据层
   * ========================================================= */

  /** 从 localStorage 读取并清洗数据（损坏数据按空列表启动） */
  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data
        .filter((e) => e && typeof e.name === 'string' && Number.isFinite(Number(e.lastDoneAt)))
        .map((e) => ({
          id: typeof e.id === 'string' && e.id ? e.id : uid(),
          name: e.name.trim().slice(0, MAX_NAME_LEN),
          lastDoneAt: Number(e.lastDoneAt),
          createdAt: Number.isFinite(Number(e.createdAt)) ? Number(e.createdAt) : Number(e.lastDoneAt),
        }));
    } catch (err) {
      console.warn('读取本地数据失败，已按空列表启动：', err);
      return [];
    }
  }

  function saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      toast('保存失败：本地存储不可用或已满');
    }
  }

  let events = loadEvents();

  const findByName = (name) => events.find((e) => e.name === name);

  /**
   * 新增事项 / 记录一次完成
   * 规则：相同名称视为同一项 —— 已存在则仅把 lastDoneAt 重置为本次完成时刻，
   * 不重复创建；不存在则新建（创建时刻即首次完成时刻）。
   * 返回 { event, existed }，existed 表示是否重置了已有事项。
   */
  function addOrRecord(rawName, doneAt) {
    const name = (rawName || '').trim();
    if (!name) return null;
    const ts = Number.isFinite(doneAt) ? Math.min(doneAt, Date.now()) : Date.now();
    const exist = findByName(name);
    if (exist) {
      exist.lastDoneAt = ts;
      saveEvents();
      render();
      return { event: exist, existed: true };
    }
    const ev = { id: uid(), name, lastDoneAt: ts, createdAt: ts };
    events.push(ev);
    saveEvents();
    render();
    return { event: ev, existed: false };
  }

  /**
   * 重命名：新名称与已有事项冲突时自动合并
   * （保留两者中较近的一次完成时间，删除被改名的那一项）。
   */
  function renameEvent(id, rawNewName) {
    const newName = (rawNewName || '').trim();
    if (!newName) return { ok: false };
    const target = events.find((e) => e.id === id);
    if (!target) return { ok: false };
    if (target.name === newName) { render(); return { ok: true }; }
    const conflict = findByName(newName);
    if (conflict) {
      conflict.lastDoneAt = Math.max(conflict.lastDoneAt, target.lastDoneAt);
      events = events.filter((e) => e.id !== id);
      saveEvents();
      render();
      return { ok: true, mergedInto: conflict.name };
    }
    target.name = newName;
    saveEvents();
    render();
    return { ok: true };
  }

  function removeEvent(id) {
    const removed = events.find((e) => e.id === id);
    events = events.filter((e) => e.id !== id);
    saveEvents();
    render();
    return removed;
  }

  /* =========================================================
   * 时间计算与格式化
   * ========================================================= */

  function elapsedParts(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  }

  /** 形如「3 天 05 小时 12 分 30 秒」 */
  function formatElapsed(ms) {
    const p = elapsedParts(ms);
    return `${p.days} 天 ${pad2(p.hours)} 小时 ${pad2(p.minutes)} 分 ${pad2(p.seconds)} 秒`;
  }

  function formatDateTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  function toLocalInputValue(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  /** 新鲜度分档（仅用于卡片状态点配色） */
  function freshness(ms) {
    const h = ms / 3600000;
    if (h < 1) return 'fresh';
    if (h < 24) return 'recent';
    if (h < 24 * 7) return 'aging';
    return 'stale';
  }

  /* =========================================================
   * 渲染层
   * ========================================================= */

  const tickRefs = new Map(); // id -> { elapsed, dot }，供逐秒刷新使用

  /** 排序：按最近记录时间（lastDoneAt）从近到远 */
  const sortedEvents = () => [...events].sort((a, b) => b.lastDoneAt - a.lastDoneAt);

  function render() {
    tickRefs.clear();
    listEl.textContent = '';
    const sorted = sortedEvents();
    statsEl.textContent = `共 ${events.length} 项`;
    emptyEl.classList.toggle('hidden', sorted.length > 0);
    for (const ev of sorted) listEl.appendChild(renderCard(ev));
    tick();
  }

  function renderCard(ev) {
    const card = el('article', 'card');
    card.dataset.id = ev.id;

    /* 头部：状态点 + 名称（可原地编辑） + 操作按钮 */
    const head = el('div', 'card-head');
    const dot = el('span', 'dot');
    const name = el('h2', 'card-name', ev.name);
    const actions = el('div', 'card-actions');
    const recordBtn = el('button', 'btn btn-record', '记录完成');
    const editBtn = el('button', 'btn btn-ghost', '编辑');
    const delBtn = el('button', 'btn btn-ghost', '删除');
    actions.append(recordBtn, editBtn, delBtn);
    head.append(dot, name, actions);

    /* 中部：实时计时文案 */
    const body = el('div', 'card-body');
    const label = el('span', 'elapsed-label', '距离上次完成已过去');
    const elapsed = el('span', 'elapsed');
    body.append(label, elapsed);

    /* 底部：时间元信息 */
    const meta = el('div', 'card-meta');
    meta.append(
      el('div', null, `上次完成：${formatDateTime(ev.lastDoneAt)}`),
      el('div', null, `首次记录：${formatDateTime(ev.createdAt)}`)
    );

    /* 交互：记录完成（重置计时） */
    recordBtn.addEventListener('click', () => {
      const res = addOrRecord(ev.name, Date.now());
      if (res) toast(`「${ev.name}」计时已重置，从此刻重新计算`);
    });

    /* 交互：原地编辑（Enter 保存 / Esc 取消 / 失焦保存） */
    editBtn.addEventListener('click', () => {
      const input = el('input', 'card-name-input');
      input.type = 'text';
      input.value = ev.name;
      input.maxLength = MAX_NAME_LEN;
      head.replaceChild(input, name);
      input.focus();
      input.select();
      let finished = false;
      const finish = (commit) => {
        if (finished) return;
        finished = true;
        if (commit) {
          if (!input.value.trim()) toast('名称不能为空');
          const res = renameEvent(ev.id, input.value);
          if (res.ok && res.mergedInto) toast(`已合并进「${res.mergedInto}」`);
          if (res.ok) return; // 成功时 renameEvent 内部已完成重渲染
        }
        render(); // 取消 / 空名称：恢复原状
      };
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); finish(true); }
        else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
      });
      input.addEventListener('blur', () => finish(true));
    });

    /* 交互：删除（两步确认，防止误删） */
    let armed = false;
    let armTimer = null;
    const disarm = () => {
      armed = false;
      delBtn.textContent = '删除';
      delBtn.classList.remove('armed');
    };
    delBtn.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        delBtn.textContent = '确认删除';
        delBtn.classList.add('armed');
        clearTimeout(armTimer);
        armTimer = setTimeout(disarm, 2500);
      } else {
        clearTimeout(armTimer);
        const removed = removeEvent(ev.id);
        if (removed) toast(`已删除「${removed.name}」`);
      }
    });

    card.append(head, body, meta);
    tickRefs.set(ev.id, { elapsed, dot });
    return card;
  }

  /**
   * 逐秒刷新：每次用 Date.now() - lastDoneAt 重新计算文本，
   * 不做递减累加，因此不存在计时漂移；只更新文本节点，不重建 DOM，
   * 编辑中的输入框不会被打断。
   */
  function tick() {
    const now = Date.now();
    for (const ev of events) {
      const refs = tickRefs.get(ev.id);
      if (!refs) continue;
      const ms = now - ev.lastDoneAt;
      refs.elapsed.textContent = formatElapsed(ms);
      refs.dot.dataset.freshness = freshness(ms);
    }
  }
  setInterval(tick, 1000);

  /* =========================================================
   * 顶部表单：新增 / 记录完成
   * ========================================================= */

  /** 本次完成时刻：默认「现在」；勾选自定义后取所选时间（不允许超过当前） */
  function currentDoneAt() {
    if (customToggle.checked && customTime.value) {
      const t = new Date(customTime.value).getTime();
      if (Number.isFinite(t)) return Math.min(t, Date.now());
    }
    return Date.now();
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    const res = addOrRecord(name, currentDoneAt());
    if (res) {
      toast(res.existed ? `「${name}」已存在，计时已重置` : `已添加「${name}」，开始计时`);
      nameInput.value = '';
      nameInput.focus();
    }
  });

  customToggle.addEventListener('change', () => {
    customTime.classList.toggle('hidden', !customToggle.checked);
    if (customToggle.checked) {
      const now = new Date();
      customTime.max = toLocalInputValue(now);
      const d = new Date(now);
      d.setSeconds(0, 0);
      customTime.value = toLocalInputValue(d);
    }
  });

  /* ---------- 多标签页同步 ---------- */
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      events = loadEvents();
      render();
    }
  });

  /* ---------- Toast ---------- */
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- 启动 ---------- */
  render();
})();
