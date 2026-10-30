/** ask.js — 智能问答：基于档案与品项库，不编造 */

import { customers, displayName, scope, storeName } from '../db.js';
import { esc, toast, empty, tag, navigate } from '../ui.js';
import { ask, SUGGESTIONS } from '../nlq.js';

const SS_KEY = 'mkt_chat';

function loadThread() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* 忽略损坏的会话 */ }
  return [];
}

function saveThread(thread) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(thread.slice(-24)));
  } catch { /* 存储满时静默跳过 */ }
}

/** 极简标记渲染：只处理 **加粗** 与换行，其余全部转义 —— 模型/规则输出不拼 HTML */
function mdLite(text) {
  const safe = esc(text);
  return safe
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>');
}

export default async function askView() {
  const me = scope().me;
  const thread = loadThread();

  const html = `
  <div class="grid split-side">
    <div class="card">
      <div class="card-head">
        <h3>问一句</h3>
        <span class="sub">只用客户档案、面诊记录、品项库回答；查不到就说查不到</span>
        <div class="right"><button class="btn sm ghost" id="btn-clear">清空对话</button></div>
      </div>
      <div class="card-body">
        <div class="chat-scroll" id="chat"></div>
        <div class="row" style="gap:8px;margin-top:14px;align-items:flex-end">
          <div class="field" style="flex:1">
            <textarea class="textarea" id="q" rows="2" style="min-height:52px"
              placeholder="例如：最近 30 天哪些客户屏障偏弱但还没做过修护项目"></textarea>
          </div>
          <button class="btn primary" id="send" style="height:38px">问</button>
        </div>
        <div class="chip-set" style="margin-top:10px" id="sugs">
          ${SUGGESTIONS.map((s) => `<button class="chip" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="stack">
      <div class="card">
        <div class="card-head"><h3>能回答什么</h3></div>
        <div class="card-body" style="font-size:12.5px;color:var(--ink-2);line-height:1.65;display:flex;flex-direction:column;gap:13px">
          <div><b style="display:block;margin-bottom:2px">按人筛</b><span style="color:var(--ink-3)">屏障偏弱但还没做修护的客户</span></div>
          <div><b style="display:block;margin-bottom:2px">按对比</b><span style="color:var(--ink-3)">张女士上次和这次的色斑变化</span></div>
          <div><b style="display:block;margin-bottom:2px">按品项</b><span style="color:var(--ink-3)">敏感肌加抗衰，院内怎么组合</span></div>
          <div><b style="display:block;margin-bottom:2px">按统计</b><span style="color:var(--ink-3)">最近 30 天出油偏多的有多少</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>回答边界</h3></div>
        <div class="card-body" style="font-size:12px;color:var(--ink-3);line-height:1.8;display:flex;flex-direction:column;gap:7px">
          <div>· 不编造检测数据、产品成分、成交记录</div>
          <div>· 每条结论标注来源记录的时间与类型</div>
          <div>· 「还没做过某项」按本系统的话术与待办记录判断，不代表真实消费</div>
          <div>· 问句超出范围会直说答不了，并给出可换的问法</div>
        </div>
      </div>
    </div>
  </div>`;

  function renderThread() {
    const box = document.getElementById('chat');
    if (!box) return;
    if (!thread.length) {
      box.innerHTML = `<div style="padding:20px 2px">
        <div style="font-family:var(--font-serif);font-size:15px;margin-bottom:8px">直接问，不用组织语言。</div>
        <div style="font-size:12.5px;color:var(--ink-3);line-height:1.9">
          我会先拆你这句话里的时间和问题维度，再到档案里查。查不到会说查不到。<br>
          下面几个是常用问法，点一下就发。
        </div>
      </div>`;
      return;
    }
    box.innerHTML = thread
      .map(
        (m) => `
      <div class="msg ${m.role}">
        <div class="m-avatar">${m.role === 'user' ? '我' : '客'}</div>
        <div class="m-body">
          <div class="m-role">${m.role === 'user' ? '你' : '客情助手'}</div>
          ${m.role === 'user' ? `<div class="m-text">${esc(m.text)}</div>` : `<div class="m-text">${mdLite(m.text)}</div>`}
          ${m.list?.length ? `<div class="row wrap" style="margin-top:9px;gap:6px">${m.list.slice(0, 6).map((id) => `<button class="btn sm" data-nav="/customers/${id}">看档案</button>`).join('')}</div>` : ''}
          ${m.sources?.length ? `<div class="m-src">来源：${m.sources.map((s) => esc(s)).join('<br>')}</div>` : ''}
        </div>
      </div>`,
      )
      .join('');
    box.scrollTop = box.scrollHeight;
  }

  function send(text) {
    const q = (text || '').trim();
    if (!q) return;
    thread.push({ role: 'user', text: q });
    saveThread(thread);
    renderThread();
    const ta = document.getElementById('q');
    if (ta) ta.value = '';

    // 同步计算很快，但给一个极短的延迟让「正在查」可见
    thread.push({ role: 'bot', text: '正在查档案…', pending: true });
    renderThread();
    setTimeout(() => {
      thread.pop();
      const res = ask(q);
      thread.push({ role: 'bot', text: res.text, sources: res.sources, list: res.list });
      saveThread(thread);
      renderThread();
    }, 120);
  }

  return {
    title: '智能问答',
    crumb: `${esc(me.role === 'hq' ? '全部门店' : storeName(me.storeId))} · 事实来源：客户档案与品项库`,
    actions: '<button class="btn" data-nav="/customers">客户档案</button>',
    html,
    mount(root) {
      renderThread();
      const ta = root.querySelector('#q');
      const btn = root.querySelector('#send');

      btn.addEventListener('click', () => send(ta.value));
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          send(ta.value);
        }
      });

      root.querySelectorAll('[data-sug]').forEach((b) => {
        b.addEventListener('click', () => send(b.dataset.sug));
      });

      root.querySelector('#btn-clear').addEventListener('click', () => {
        thread.length = 0;
        saveThread(thread);
        renderThread();
        toast('对话已清空');
      });
    },
  };
}
