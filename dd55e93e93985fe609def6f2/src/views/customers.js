/** customers.js — 客户列表与档案详情 */

import {
  customers, scope, displayName, storeName, userById, daysSince, fmtDate,
  assessmentsOf, latestAssessment, todosOf, openTodos, followsOf, scriptsOf,
  addCustomer, addFollow, addTodo, toggleTodo, canEditCustomer, customerById,
  activeItems, getState,
} from '../db.js';
import {
  kpi, tag, bar, empty, esc, sourceBadge, openModal, toast, navigate, confirmDialog, money, ago, $,
} from '../ui.js';
import {
  buildProfile, matchPlan, compareRecords, trendOf, canGenerate,
} from '../engine.js';
import { DIM_MAP, findDimValue, NEED_META, SIGNAL_MAP, CUSTOMER_LEVELS, TODO_TYPES, SCENES } from '../taxonomy.js';
import { addDays } from '../util.js';

/* ================================================================ 列表 */

export default async function customersView() {
  const list = customers();
  const { me } = scope();

  const html = `
  <div class="stack">
    <div class="card">
      <div class="card-body tight">
        <div class="row wrap" style="gap:10px">
          <div class="field" style="flex:1;min-width:200px">
            <input class="input" id="q" placeholder="搜姓名、备注、来源…" autocomplete="off" />
          </div>
          <div class="field" style="width:150px">
            <select class="select" id="f-level">
              <option value="">全部分层</option>
              <option value="new">体验期</option>
              <option value="regular">稳定复购</option>
              <option value="vip">高客单</option>
              <option value="dormant">沉睡</option>
            </select>
          </div>
          <div class="field" style="width:160px">
            <select class="select" id="f-dim">
              <option value="">全部问题维度</option>
              ${Object.entries(DIM_MAP).map(([k, d]) => `<option value="${k}">${esc(d.label)}</option>`).join('')}
            </select>
          </div>
          <div class="field" style="width:150px">
            <select class="select" id="f-sort">
              <option value="recent">最近到店</option>
              <option value="gap">最久未到店</option>
              <option value="visits">到店次数</option>
              <option value="name">姓名</option>
            </select>
          </div>
          ${me.role !== 'hq' ? `<button class="btn primary" id="btn-new" style="margin-left:auto">新建客户</button>` : ''}
        </div>
      </div>
    </div>
    <div class="grid g4" id="stat-row"></div>
    <div class="card" id="list-card">
      <div class="card-head">
        <h3>客户档案</h3>
        <span class="sub" id="list-count"></span>
      </div>
      <div id="list-body"></div>
    </div>
  </div>`;

  function rows() {
    const q = ($('#q')?.value || '').trim().toLowerCase();
    const lv = $('#f-level')?.value || '';
    const dim = $('#f-dim')?.value || '';
    const sort = $('#f-sort')?.value || 'recent';

    let out = list.map((c) => {
      const recs = assessmentsOf(c.id);
      const last = recs[0] || null;
      const prof = buildProfile(c.id);
      return {
        c,
        recs,
        last,
        gap: last ? daysSince(last.at) : null,
        level: prof?.level || { key: 'new', label: '体验期' },
        topNeed: prof?.needsRanked?.[0] || null,
        tags: prof ? prof.buckets.problem.items.slice(0, 2).map((x) => x.text) : [],
      };
    });

    if (q) {
      out = out.filter(
        (r) =>
          r.c.name.toLowerCase().includes(q) ||
          (r.c.note || '').toLowerCase().includes(q) ||
          (r.c.source || '').toLowerCase().includes(q),
      );
    }
    if (lv) out = out.filter((r) => r.level.key === lv);
    if (dim) {
      out = out.filter((r) => {
        const rec = r.last;
        if (!rec) return false;
        const d = rec.dims?.[dim];
        const val = d ? findDimValue(dim, d.v) : null;
        return val && val.sev > 0;
      });
    }

    out.sort((a, b) => {
      if (sort === 'gap') return (b.gap ?? 9999) - (a.gap ?? 9999);
      if (sort === 'visits') return b.recs.length - a.recs.length;
      if (sort === 'name') return a.c.name.localeCompare(b.c.name, 'zh');
      return (a.gap ?? 9999) - (b.gap ?? 9999);
    });
    return out;
  }

  function renderList() {
    const data = rows();
    const lvCls = { vip: 'accent', regular: 'green', new: 'blue', dormant: 'red' };
    $('#list-count').textContent = `${data.length} 位`;
    $('#stat-row').innerHTML = [
      kpi('当前可见', String(list.length), '位'),
      kpi('有面诊记录', String(list.filter((c) => assessmentsOf(c.id).length).length), '位'),
      kpi('超过 45 天未到店', String(data.filter((r) => r.gap !== null && r.gap > 45).length), '位'),
      kpi('未完成待办涉及客户', String(new Set(list.filter((c) => openTodos(c.id).length).map((c) => c.id)).size), '位'),
    ].join('');

    if (!data.length) {
      $('#list-body').innerHTML = empty('·', '没有符合条件的客户。换个筛选条件，或者新建一位。');
      return;
    }

    $('#list-body').innerHTML = `<div class="list">
      ${data
        .map(
          (r) => `
        <div class="list-row clickable" data-nav="/customers/${r.c.id}">
          <div class="avatar" style="width:36px;height:36px;border-radius:10px;font-size:14px">${esc(r.c.name.slice(0, 1))}</div>
          <div class="lr-main">
            <div class="lr-title">
              ${esc(displayName(r.c))}
              <span style="font-weight:400;font-size:11.5px;color:var(--ink-4)">${r.c.age || '—'} 岁</span>
              ${tag(r.level.label, lvCls[r.level.key] || '')}
              ${r.topNeed ? tag(`主线 ${NEED_META[r.topNeed.need]?.label || ''}`, 'line') : ''}
            </div>
            <div class="lr-sub">
              ${r.last ? `最近 ${ago(r.last.at)} · ${r.recs.length} 次记录` : '还没有面诊记录'}
              ${r.tags.length ? ` · ${r.tags.join(' / ')}` : ''}
            </div>
          </div>
          <div class="lr-side">
            ${openTodos(r.c.id).length ? tag(`${openTodos(r.c.id).length} 条待办`, 'amber') : ''}
            <span style="font-size:11.5px;color:var(--ink-4)">${esc(storeName(r.c.storeId).replace('沈阳', ''))}</span>
          </div>
        </div>`,
        )
        .join('')}
    </div>`;
  }

  return {
    title: '客户档案',
    crumb: `${me.role === 'hq' ? '全部门店 · 姓名已脱敏' : storeName(me.storeId)} · ${list.length} 位可见客户`,
    actions: me.role !== 'hq' ? '<button class="btn primary" data-nav="/intake">录入面诊</button>' : '',
    html,
    mount(root) {
      renderList();
      ['#q', '#f-level', '#f-dim', '#f-sort'].forEach((sel) => {
        const el = root.querySelector(sel);
        if (el) el.addEventListener('input', renderList);
      });

      const btn = root.querySelector('#btn-new');
      if (btn) {
        btn.addEventListener('click', () => {
          openNewCustomer(() => {
            window.dispatchEvent(new Event('mkt:refresh'));
          });
        });
      }
    },
  };
}

/* ================================================================ 新建客户 */

export function openNewCustomer(onDone) {
  const s = getState();
  const me = scope().me;
  const consultants = s.users.filter((u) => u.storeId === me.storeId && u.role !== 'hq');

  openModal({
    title: '新建客户',
    wide: false,
    body: `
      <div class="stack sm">
        <div class="grid g2">
          <div class="field"><label>姓名 <span class="req">*</span></label><input class="input" id="nc-name" placeholder="客户姓名" /></div>
          <div class="field"><label>年龄</label><input class="input" id="nc-age" type="number" min="16" max="90" placeholder="如 35" /></div>
        </div>
        <div class="grid g2">
          <div class="field"><label>手机号</label><input class="input" id="nc-phone" placeholder="可不填" /></div>
          <div class="field"><label>来源</label><input class="input" id="nc-source" placeholder="美团 / 转介绍 / 商场客流" value="到店" /></div>
        </div>
        ${me.role === 'manager' ? `<div class="field"><label>责任顾问</label>
          <select class="select" id="nc-owner">${consultants.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select>
        </div>` : ''}
        <div class="field"><label>备注</label><textarea class="textarea" id="nc-note" placeholder="沟通中了解到的背景，比如职业、作息、过往护理经历"></textarea></div>
        <div class="notice">新建客户后还需要录入一次面诊记录。没有面诊记录时，系统不会生成任何销售话术。</div>
      </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-ok>创建</button>`,
    onMount(mask, close) {
      mask.querySelector('[data-ok]').addEventListener('click', () => {
        const name = mask.querySelector('#nc-name').value.trim();
        if (!name) {
          toast('请填写客户姓名', 'warn');
          return;
        }
        const res = addCustomer({
          name,
          age: mask.querySelector('#nc-age').value,
          phone: mask.querySelector('#nc-phone').value,
          source: mask.querySelector('#nc-source').value,
          note: mask.querySelector('#nc-note').value,
          ownerId: mask.querySelector('#nc-owner')?.value,
          level: 'new',
        });
        if (!res.ok) {
          toast(res.message, 'warn');
          return;
        }
        close();
        toast('客户已创建，接着录入面诊记录');
        navigate(`/intake/${res.record.id}`);
        if (onDone) onDone();
      });
    },
  });
}

/* ================================================================ 详情 */

export async function customerDetail({ id }) {
  const c = customerById(id);
  if (!c) {
    return { title: '客户档案', html: empty('·', '找不到这位客户，或者当前身份没有查看权限。') };
  }
  const { me } = scope();
  const prof = buildProfile(c.id);
  const recs = prof.records;
  const latest = recs[0] || null;
  const prev = recs[1] || null;
  const plan = latest ? matchPlan(c.id, latest.id) : null;
  const todos = todosOf(c.id).sort((a, b) => (a.status === b.status ? new Date(a.dueAt) - new Date(b.dueAt) : a.status === 'open' ? -1 : 1));
  const follows = followsOf(c.id);
  const scripts = scriptsOf(c.id);
  const editable = canEditCustomer(c);
  const lvCls = { vip: 'accent', regular: 'green', new: 'blue', dormant: 'red' };

  /* ---------- 本次面诊维度 ---------- */
  const dimRows = latest
    ? Object.entries(latest.dims || {})
        .map(([k, d]) => {
          const val = findDimValue(k, d.v);
          if (!val) return '';
          const dv = latest.device?.[k];
          return `<div class="dim-row">
            <span class="d-label">${esc(DIM_MAP[k]?.label || k)}</span>
            <span class="d-val">${esc(val.label)} ${sourceBadge(d.source)}${typeof dv === 'number' ? `<span style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-3);margin-left:6px">${dv}</span>` : ''}</span>
          </div>`;
        })
        .join('')
    : '';

  /* ---------- 对比 ---------- */
  const changes = compareRecords(prev, latest);

  /* ---------- 标签 ---------- */
  const bucketOrder = ['skin', 'problem', 'need', 'spend', 'decision'];
  const tagCls = { skin: 'plain', problem: 'amber', need: 'blue', spend: 'accent', decision: 'green' };
  const tagHtml = bucketOrder
    .map((k) => {
      const b = prof.buckets[k];
      if (!b.items.length) return '';
      return `<div style="margin-bottom:11px">
        <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:5px">${b.label}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px">
          ${b.items.map((t) => `<span class="tag ${tagCls[k]}" title="${esc(t.note || '')}">${esc(t.text)}</span>`).join('')}
        </div>
      </div>`;
    })
    .join('');

  /* ---------- 方案四层 ---------- */
  const tierHtml = plan
    ? ['entry', 'course', 'home', 'long']
        .map((key, idx) => {
          const arr = plan.tiers[key];
          const names = { entry: '入门层', course: '进阶层', home: '居家层', long: '长期管理层' };
          const goals = {
            entry: '先让客户感受到变化',
            course: '按代谢周期排，避免单次无效',
            home: '效果的延续，不是柜台推销',
            long: '节奏与复测节点',
          };
          return `<div class="tier" style="margin-bottom:10px">
            <div class="tier-head">
              <span class="t-index">0${idx + 1}</span>
              <span class="t-name">${names[key]}</span>
              <span class="t-goal">${goals[key]}</span>
            </div>
            <div class="tier-body">
              ${
                arr.length
                  ? arr
                      .map(
                        (it) => `
                <div class="item-card">
                  <div class="ic-top">
                    <span class="ic-name">${esc(it.name)}</span>
                    <span class="ic-price">${money(it.price)}${it.sessions && it.sessions > 1 ? ` / ${it.sessions} 次` : ''}</span>
                  </div>
                  <div class="ic-meta">${esc(it.desc || '')}${it.cycleDays ? ` · 周期 ${it.cycleDays} 天` : ''}${it.duration ? ` · 单次 ${it.duration} 分钟` : ''}</div>
                  ${it.evidenceText ? `<div class="ic-evidence">依据：<b>${esc(it.evidenceText)}</b>${it.evidence?.quote ? `<br><span style="color:var(--ink-4)">「${esc(it.evidence.quote)}」</span>` : ''}</div>` : ''}
                </div>`,
                      )
                      .join('')
                  : `<div style="font-size:12px;color:var(--ink-4)">这一层本次没有匹配项${key === 'long' ? '，客户还没到长期管理阶段' : ''}。</div>`
              }
            </div>
          </div>`;
        })
        .join('')
    : '';

  const html = `
  <div class="stack">
    <div class="card card-pad">
      <div class="hero">
        <div class="h-avatar">${esc(c.name.slice(0, 1))}</div>
        <div class="h-main">
          <div class="h-name">
            ${esc(displayName(c))}
            <span class="h-sub">${c.age || '—'} 岁 · ${esc(c.gender || '女')} · ${esc(c.source || '到店')} · 建档 ${esc(c.joinedAt)}</span>
          </div>
          <div class="h-tags">
            ${tag(prof.level.label, lvCls[prof.level.key] || '')}
            ${prof.lastGap !== null ? tag(prof.lastGap === 0 ? '今天到店' : `${prof.lastGap} 天前到店`, prof.lastGap > 45 ? 'red' : 'plain') : tag('尚未面诊', 'plain')}
            ${tag(`责任顾问 ${esc(userById(c.ownerId)?.name || '—')}`, 'line')}
            ${tag(esc(storeName(c.storeId)), 'line')}
            ${prof.needsRanked.slice(0, 2).map((n) => tag(`主线 ${NEED_META[n.need]?.label || ''}`, 'accent')).join('')}
          </div>
          ${c.note ? `<div style="font-size:12px;color:var(--ink-3);margin-top:9px;line-height:1.7">${esc(c.note)}</div>` : ''}
        </div>
        <div class="row wrap" style="align-items:flex-start">
          ${editable ? `<button class="btn primary" data-nav="/intake/${c.id}">录入新面诊</button>` : ''}
          <button class="btn" data-nav="/script/${c.id}" ${recs.length ? '' : 'disabled title="需要先有面诊记录"'}>生成话术</button>
          <button class="btn" id="btn-follow" ${editable ? '' : 'disabled'}>加跟进</button>
        </div>
      </div>
    </div>

    ${recs.length === 0
      ? `<div class="card card-pad">${empty('·', `这位客户还没有面诊记录。<br>按规则，没有面诊记录不生成销售话术——先去录入第一份观察。`)}</div>`
      : `
    <div class="grid split">
      <div class="stack">
        <div class="card">
          <div class="card-head">
            <h3>本次面诊 · ${esc(fmtDate(latest.at, true))}</h3>
            <span class="sub">${Object.values(latest.dims || {}).length} 个维度有记录</span>
            <div class="right"><button class="btn sm" data-nav="/script/${c.id}">据此生成话术</button></div>
          </div>
          <div class="card-body">
            <div class="dim-grid">${dimRows}</div>
            ${latest.concern ? `<div class="notice accent" style="margin-top:14px"><span class="n-mark">原</span><div>客户原话：${esc(latest.concern)}</div></div>` : ''}
            ${latest.note ? `<div style="font-size:12.5px;color:var(--ink-2);line-height:1.85;margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2)">${esc(latest.note)}</div>` : ''}
            ${Object.values(latest.dims || {}).some((d) => d.source === 'self') ? `<div class="notice" style="margin-top:12px">标注「自述」的维度来自客户描述，不是检测结果，写进话术时要说明来源。</div>` : ''}
          </div>
        </div>

        ${changes.length
          ? `<div class="card">
              <div class="card-head">
                <h3>与上次对比</h3>
                <span class="sub">${esc(fmtDate(prev.at))} → ${esc(fmtDate(latest.at))} · 间隔 ${daysSince(prev.at) - daysSince(latest.at)} 天</span>
              </div>
              <div class="card-body" style="display:flex;flex-direction:column;gap:1px">
                ${changes
                  .map((ch) => {
                    const color = ch.dir === 'better' ? 'var(--green)' : ch.dir === 'worse' ? 'var(--red)' : 'var(--ink-4)';
                    const word = ch.dir === 'better' ? '改善' : ch.dir === 'worse' ? '退步' : '持平';
                    return `<div style="display:flex;gap:10px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--line-2);font-size:12.5px">
                      <span style="color:var(--ink-4);width:88px;flex:none;font-size:11.5px">${esc(ch.dimLabel)}</span>
                      <span style="flex:1;min-width:0">${esc(ch.prev?.label || '未记录')} → <b>${esc(ch.curr?.label || '未记录')}</b>
                        ${ch.devicePrev !== null && ch.deviceCurr !== null ? `<span style="font-family:var(--font-mono);font-size:11.5px;color:var(--ink-3)">（${ch.devicePrev}→${ch.deviceCurr}）</span>` : ''}
                      </span>
                      <span style="color:${color};font-size:11.5px;flex:none">${word}</span>
                    </div>`;
                  })
                  .join('')}
                <div style="font-size:11px;color:var(--ink-4);padding-top:9px;line-height:1.7">
                  对比只用于判断方向，不作为诊断依据。仪器读数受光线与测量位置影响，单次波动 2 个点以内不算变化。
                </div>
              </div>
            </div>`
          : ''}

        ${plan
          ? `<div class="card">
              <div class="card-head">
                <h3>方案建议</h3>
                <span class="sub">${esc(plan.sequence)}</span>
              </div>
              <div class="card-body">
                ${tierHtml}
                ${
                  plan.blocked.length
                    ? `<div class="notice red" style="margin-top:4px">
                        <span class="n-mark">!</span>
                        <div><b>本轮不推荐</b>
                          <ul>${plan.blocked.map((b) => `<li>${esc(b.item.name)} — ${esc(b.reason)}</li>`).join('')}</ul>
                          这些项目不是漏掉了，是当前状态下不该推。
                        </div>
                      </div>`
                    : ''
                }
                ${
                  plan.upsell.length
                    ? `<div style="margin-top:14px;padding-top:13px;border-top:1px solid var(--line-2)">
                        <div style="font-size:11px;color:var(--ink-4);letter-spacing:.06em;margin-bottom:8px">升单节点（按当前状态只给最可能成立的两个）</div>
                        ${plan.upsell
                          .map(
                            (u) => `
                          <div class="item-card">
                            <div class="ic-top">
                              <span class="ic-name" style="font-size:12.5px">${esc(u.node)}</span>
                              <span class="tag amber" style="margin-left:auto">${esc(u.priority)}</span>
                            </div>
                            <div class="ic-meta">时机：${esc(u.when)}</div>
                            <div class="ic-meta">信号：${esc(u.signal)}</div>
                            <div class="ic-evidence">切入话术：${esc(u.script)}</div>
                          </div>`,
                          )
                          .join('')}
                      </div>`
                    : ''
                }
                ${
                  plan.notes.length
                    ? `<div style="margin-top:12px;font-size:11.5px;color:var(--ink-3);line-height:1.85">
                        ${plan.notes.map((n) => `· ${esc(n)}`).join('<br>')}
                      </div>`
                    : ''
                }
              </div>
            </div>`
          : ''}

        <div class="card">
          <div class="card-head"><h3>面诊时间线</h3><span class="sub">全部 ${recs.length} 次记录</span></div>
          <div class="card-body">
            <div class="timeline">
              ${recs
                .map((r, i) => {
                  const rank = Object.entries(r.dims || {})
                    .map(([k, d]) => ({ k, v: findDimValue(k, d.v) }))
                    .filter((x) => x.v && x.v.sev > 0)
                    .sort((a, b) => b.v.sev - a.v.sev);
                  return `<div class="tl-item ${i === 0 ? 'hot' : ''}">
                    <div class="tl-head">
                      <span class="tl-date">${esc(fmtDate(r.at, true))}</span>
                      ${i === 0 ? tag('最近一次', 'accent') : ''}
                      <span style="font-size:11.5px;color:var(--ink-4)">${rank.length} 个维度有问题</span>
                    </div>
                    <div style="font-size:12.5px;color:var(--ink-2);line-height:1.75">
                      ${rank.slice(0, 3).map((x) => `${DIM_MAP[x.k]?.label} ${x.v.label}`).join(' · ') || '本次无明显问题'}
                    </div>
                    ${r.note ? `<div style="font-size:11.5px;color:var(--ink-4);margin-top:3px;line-height:1.7">${esc(r.note.slice(0, 90))}${r.note.length > 90 ? '…' : ''}</div>` : ''}
                  </div>`;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>客户画像</h3><span class="sub">${prof.tagCount} 个标签</span></div>
          <div class="card-body">
            ${tagHtml || `<div style="font-size:12px;color:var(--ink-4)">还没有足够的记录生成标签。</div>`}
            <div style="font-size:11px;color:var(--ink-4);line-height:1.7;border-top:1px solid var(--line-2);padding-top:10px">
              标签由面诊记录与沟通信号自动提取，鼠标悬停可看判定依据。「消费力」按到店次数推断，不是订单数据。
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <h3>待办</h3>
            <span class="sub">${todos.filter((t) => t.status === 'open').length} 条未完成</span>
            ${editable ? '<div class="right"><button class="btn sm" id="btn-todo">添加</button></div>' : ''}
          </div>
          ${
            todos.length
              ? `<div class="list">${todos
                  .map((t) => {
                    const overdue = t.status === 'open' && t.dueAt && new Date(t.dueAt) < new Date();
                    return `<div class="list-row">
                      <input type="checkbox" data-todo="${t.id}" ${t.status === 'done' ? 'checked' : ''} style="width:15px;height:15px;accent-color:var(--accent);flex:none" />
                      <div class="lr-main">
                        <div style="font-size:12.5px;${t.status === 'done' ? 'text-decoration:line-through;color:var(--ink-4)' : ''}">${esc(t.content)}</div>
                        <div class="lr-sub" style="white-space:normal">
                          ${tag(TODO_TYPES[t.type]?.label || '事项', TODO_TYPES[t.type]?.cls || '')}
                          <span style="margin-left:4px;${overdue ? 'color:var(--red)' : ''}">${t.dueAt}${overdue ? ' · 逾期' : ''}</span>
                          ${t.origin === 'auto' ? '<span style="margin-left:4px;color:var(--ink-4)">· 自动提取</span>' : ''}
                        </div>
                      </div>
                    </div>`;
                  })
                  .join('')}</div>`
              : `<div class="card-body" style="font-size:12px;color:var(--ink-4)">暂无待办。录入面诊后系统会自动从沟通记录里提取。</div>`
          }
        </div>

        <div class="card">
          <div class="card-head"><h3>跟进记录</h3><span class="sub">${follows.length} 条</span></div>
          ${
            follows.length
              ? `<div class="list">${follows
                  .map(
                    (f) => `<div class="list-row" style="align-items:flex-start">
                      <div class="lr-main">
                        <div class="lr-title" style="font-size:12px">
                          <span style="color:var(--ink-4);font-weight:400;font-family:var(--font-mono)">${esc(fmtDate(f.at))}</span>
                          ${tag(f.channel, 'plain')} ${tag(f.result, f.result === '正向' ? 'green' : f.result === '未响应' ? 'red' : 'amber')}
                        </div>
                        <div style="font-size:12.5px;line-height:1.7;margin-top:2px">${esc(f.content)}</div>
                      </div>
                    </div>`,
                  )
                  .join('')}</div>`
              : `<div class="card-body" style="font-size:12px;color:var(--ink-4)">还没有跟进记录。</div>`
          }
        </div>

        <div class="card">
          <div class="card-head"><h3>话术记录</h3><span class="sub">${scripts.length} 次生成</span></div>
          ${
            scripts.length
              ? `<div class="list">${scripts
                  .slice(0, 4)
                  .map(
                    (sc) => `<div class="list-row clickable" data-nav="/script/${c.id}">
                      <div class="lr-main">
                        <div class="lr-title" style="font-size:12px">${esc(SCENES[sc.scene]?.label || sc.scene)}</div>
                        <div class="lr-sub">${esc(fmtDate(sc.at, true))} · ${sc.issues?.length ? '有校验提示' : '通过校验'}</div>
                      </div>
                    </div>`,
                  )
                  .join('')}</div>`
              : `<div class="card-body" style="font-size:12px;color:var(--ink-4)">还没有生成过话术。</div>`
          }
        </div>
      </div>
    </div>`}
  </div>`;

  return {
    title: displayName(c),
    crumb: `客户档案 / ${esc(displayName(c))} · ${esc(storeName(c.storeId))}`,
    actions: `<button class="btn" data-nav="/customers">返回列表</button>
      ${editable ? `<button class="btn primary" data-nav="/intake/${c.id}">录入新面诊</button>` : ''}`,
    html,
    mount(root) {
      root.querySelectorAll('[data-todo]').forEach((cb) => {
        cb.addEventListener('change', (e) => {
          toggleTodo(e.target.dataset.todo);
          toast(e.target.checked ? '已标记完成' : '已重新打开');
          window.dispatchEvent(new Event('mkt:refresh'));
        });
      });

      const fb = root.querySelector('#btn-follow');
      if (fb) fb.addEventListener('click', () => openFollow(c.id));

      const tb = root.querySelector('#btn-todo');
      if (tb) tb.addEventListener('click', () => openTodo(c.id));
    },
  };
}

/* ---------------------------------------------------------------- 弹层 */

function openFollow(customerId) {
  openModal({
    title: '添加跟进记录',
    body: `
      <div class="stack sm">
        <div class="grid g2">
          <div class="field"><label>渠道</label>
            <select class="select" id="fl-ch"><option>企微</option><option>电话</option><option>到店</option><option>短信</option></select>
          </div>
          <div class="field"><label>客户反馈</label>
            <select class="select" id="fl-res"><option>待定</option><option>正向</option><option>未响应</option><option>拒绝</option></select>
          </div>
        </div>
        <div class="field"><label>内容 <span class="req">*</span></label>
          <textarea class="textarea" id="fl-c" placeholder="说了什么、客户怎么回应、下一步是什么"></textarea>
        </div>
      </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-ok>保存</button>`,
    onMount(mask, close) {
      mask.querySelector('[data-ok]').addEventListener('click', () => {
        const res = addFollow({
          customerId,
          channel: mask.querySelector('#fl-ch').value,
          result: mask.querySelector('#fl-res').value,
          content: mask.querySelector('#fl-c').value,
        });
        if (!res.ok) return toast(res.message, 'warn');
        close();
        toast('跟进已记录');
        window.dispatchEvent(new Event('mkt:refresh'));
      });
    },
  });
}

function openTodo(customerId) {
  openModal({
    title: '添加待办',
    body: `
      <div class="stack sm">
        <div class="grid g2">
          <div class="field"><label>类型</label>
            <select class="select" id="td-t"><option value="action">顾问动作</option><option value="need">客户诉求</option><option value="risk">风险信号</option></select>
          </div>
          <div class="field"><label>截止日期</label>
            <input class="input" type="date" id="td-d" value="${addDays(7)}" />
          </div>
        </div>
        <div class="field"><label>内容 <span class="req">*</span></label>
          <textarea class="textarea" id="td-c" placeholder="要做什么、什么时间做、做完的判定标准"></textarea>
        </div>
      </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-ok>保存</button>`,
    onMount(mask, close) {
      mask.querySelector('[data-ok]').addEventListener('click', () => {
        const res = addTodo({
          customerId,
          type: mask.querySelector('#td-t').value,
          dueAt: mask.querySelector('#td-d').value,
          content: mask.querySelector('#td-c').value,
        });
        if (!res.ok) return toast(res.message, 'warn');
        close();
        toast('待办已添加');
        window.dispatchEvent(new Event('mkt:refresh'));
      });
    },
  });
}
