/** review.js — 复盘：客户维度看趋势，门店维度看卡点 */

import {
  customers, displayName, scope, storeName, daysSince, customerById, fmtDate, getState,
} from '../db.js';
import { tag, empty, esc, kpi, bar, toast, navigate } from '../ui.js';
import { customerReview, storeReview, trendOf } from '../engine.js';
import { DIM_MAP, NEED_META } from '../taxonomy.js';

export default async function reviewView() {
  const me = scope().me;
  const list = customers();
  let tab = 'store';
  let picked = list[0]?.id || null;

  const html = `
  <div class="stack">
    <div class="seg" id="tabs">
      <button data-tab="store" class="on">门店维度</button>
      <button data-tab="customer">客户维度</button>
    </div>
    <div id="panel"></div>
  </div>`;

  /* ---------------- 门店 ---------------- */

  function renderStore() {
    const r = storeReview(me.role === 'consultant' ? null : scope().storeIds);
    const s = getState();
    const totalCustomers = r.customerCount || 1;
    const funnelRows = [
      { key: 'trial', label: '体验期（1 次）', n: r.funnel.trial, cls: 'blue' },
      { key: 'course', label: '疗程中（2–3 次）', n: r.funnel.course, cls: 'accent' },
      { key: 'repeat', label: '复购（4 次以上）', n: r.funnel.repeat, cls: 'green' },
    ];

    return `
    <div class="stack">
      <div class="grid g4">
        ${kpi('可见客户', String(r.customerCount), '位', me.role === 'consultant' ? '按你名下统计' : '本门店')}
        ${kpi('进入疗程/复购', `${r.funnelRates.trialToCourse}`, '%', `${r.funnel.course + r.funnel.repeat} / ${r.customerCount} 位`)}
        ${kpi('跟进执行率', r.execRate === null ? '—' : String(r.execRate), r.execRate === null ? '' : '%', `${r.todoDone}/${r.todoTotal} 条完成`, r.execRate !== null && r.execRate < 60 ? 'down' : '')}
        ${kpi('沉睡客户', String(r.silentRisk.length), '位', r.silentRisk.length ? '超过 45 天未到店' : '暂无', r.silentRisk.length ? 'down' : '')}
      </div>

      <div class="grid split-even">
        <div class="card">
          <div class="card-head">
            <h3>体验 → 疗程 → 复购</h3>
            <span class="sub">按到店次数估算</span>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:15px">
            ${funnelRows
              .map(
                (f) => `
              <div>
                <div class="row between" style="margin-bottom:5px">
                  <span style="font-size:12.5px">${f.label}</span>
                  <span style="font-size:12px;color:var(--ink-3);font-family:var(--font-mono)">${f.n} 位 · ${Math.round((f.n / totalCustomers) * 100)}%</span>
                </div>
                ${bar((f.n / totalCustomers) * 100, f.cls === 'green' ? 'green' : f.cls === 'blue' ? '' : '')}
              </div>`,
              )
              .join('')}
            <div style="font-size:11px;color:var(--ink-4);line-height:1.75;border-top:1px solid var(--line-2);padding-top:10px">
              ${esc(r.caveat)}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head"><h3>客户异议分布</h3><span class="sub">近两轮记录里的沟通信号</span></div>
          <div class="card-body">
            ${
              r.objections.length
                ? r.objections
                    .map(
                      (o) => `
                <div style="margin-bottom:11px">
                  <div class="row between" style="margin-bottom:4px">
                    <span style="font-size:12.5px">${esc(o.label)}</span>
                    <span style="font-size:11.5px;color:var(--ink-3);font-family:var(--font-mono)">${o.count} 人</span>
                  </div>
                  ${bar(o.ratio)}
                </div>`,
                    )
                    .join('')
                : '<div style="font-size:12px;color:var(--ink-4)">还没有足够的沟通信号。录入面诊时勾选「沟通信号」就会有数据。</div>'
            }
            <div style="font-size:11px;color:var(--ink-4);line-height:1.75;margin-top:8px;border-top:1px solid var(--line-2);padding-top:10px">
              占比 = 出现该信号的客户数 / 可见客户数。同一位客户多次提及只算一次。
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>可以落地的动作</h3><span class="sub">不是看板，是这周要改的事</span></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:0">
          ${r.actions
            .map(
              (a) => `
            <div style="display:flex;gap:11px;padding:11px 0;border-bottom:1px solid var(--line-2);align-items:flex-start">
              ${tag(a.priority, a.priority === '高' ? 'red' : a.priority === '中' ? 'amber' : 'plain')}
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600">${esc(a.title)}</div>
                <div style="font-size:12px;color:var(--ink-3);line-height:1.75;margin-top:3px">${esc(a.detail)}</div>
              </div>
            </div>`,
            )
            .join('')}
          <div style="font-size:11px;color:var(--ink-4);line-height:1.75;padding-top:11px">
            口径说明：动作清单里的数字来自本系统的面诊记录与待办，不是订单流水。判断卡点时优先看「过期的待办」和「超过 45 天没来的客户」，这两项不需要订单数据也成立。
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- 客户 ---------------- */

  function renderCustomer() {
    if (!picked) {
      return `<div class="card card-pad">${empty('·', '还没有可见客户。')}</div>`;
    }
    const r = customerReview(picked);
    if (!r) return `<div class="card card-pad">${empty('·', '读取失败。')}</div>`;
    const c = customerById(picked);
    const prof = r.profile;

    return `
    <div class="stack">
      <div class="card">
        <div class="card-body tight">
          <div class="row wrap">
            <div class="field" style="width:220px">
              <label>选择客户</label>
              <select class="select" id="pick-cust">
                ${list.map((x) => `<option value="${x.id}" ${x.id === picked ? 'selected' : ''}>${esc(displayName(x))} · ${x.age || '—'} 岁</option>`).join('')}
              </select>
            </div>
            <div style="padding-top:18px">${tag(prof.level.label, 'accent')} <span style="font-size:12px;color:var(--ink-3);margin-left:6px">${esc(prof.level.strategy)}</span></div>
            <div style="margin-left:auto;padding-top:14px"><button class="btn sm" data-nav="/customers/${picked}">打开档案</button></div>
          </div>
        </div>
      </div>

      <div class="grid g4">
        ${kpi('到店次数', String(r.visits), '次', r.visits ? `最近 ${prof.lastGap} 天前` : '尚未面诊')}
        ${kpi('平均到店间隔', r.avgGap === null ? '—' : String(r.avgGap), r.avgGap === null ? '' : '天', r.avgGap && r.avgGap > 45 ? '间隔偏长' : '节奏正常', r.avgGap && r.avgGap > 45 ? 'down' : '')}
        ${kpi('跟进执行率', r.execRate === null ? '—' : String(r.execRate), r.execRate === null ? '' : '%', r.execRate === null ? '暂无待办' : `${r.todoDone}/${r.todoTotal} 条`, r.execRate !== null && r.execRate < 60 ? 'down' : '')}
        ${kpi('风险项', String(r.risks.length), '条', r.risks.length ? '见下方清单' : '暂无', r.risks.length ? 'down' : '')}
      </div>

      <div class="grid split-even">
        <div class="card">
          <div class="card-head"><h3>状态变化</h3><span class="sub">最近两次记录逐维度对比</span></div>
          <div class="card-body">
            ${
              r.changes.length
                ? r.changes
                    .map((ch) => {
                      const color = ch.dir === 'better' ? 'var(--green)' : ch.dir === 'worse' ? 'var(--red)' : 'var(--ink-4)';
                      const word = ch.dir === 'better' ? '改善' : ch.dir === 'worse' ? '退步' : '持平';
                      return `<div style="display:flex;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--line-2);font-size:12.5px">
                        <span style="color:var(--ink-4);width:92px;flex:none;font-size:11.5px">${esc(ch.dimLabel)}</span>
                        <span style="flex:1">${esc(ch.prev?.label || '未记录')} → <b>${esc(ch.curr?.label || '未记录')}</b></span>
                        <span style="color:${color};font-size:11.5px">${word}</span>
                      </div>`;
                    })
                    .join('')
                : `<div style="font-size:12px;color:var(--ink-4)">只有 ${r.visits} 次记录，还不能形成对比。再录一次就能看趋势。</div>`
            }
          </div>
        </div>

        <div class="stack">
          <div class="card">
            <div class="card-head"><h3>风险清单</h3></div>
            <div class="card-body" style="font-size:12.5px;line-height:1.9">
              ${r.risks.length ? r.risks.map((x) => `<div style="color:var(--red);margin-bottom:4px">· ${esc(x)}</div>`).join('') : '<div style="color:var(--green)">暂时没有风险信号。</div>'}
            </div>
          </div>
          <div class="card">
            <div class="card-head"><h3>下一步触达</h3></div>
            <div class="card-body" style="font-size:12.5px;line-height:1.9">
              ${
                r.touch
                  ? `<div style="color:var(--ink-4);font-size:11px;letter-spacing:.05em;margin-bottom:5px">理由</div>
                     <div style="margin-bottom:9px">${esc(r.touch.reason)}</div>
                     <div style="color:var(--ink-4);font-size:11px;letter-spacing:.05em;margin-bottom:5px">动作</div>
                     <div style="margin-bottom:9px">${esc(r.touch.action)}</div>
                     <div style="color:var(--ink-4);font-size:11px;letter-spacing:.05em;margin-bottom:5px">开口话术</div>
                     <div style="background:var(--surface-2);border:1px solid var(--line-2);border-radius:9px;padding:10px 12px;line-height:1.85">${esc(r.touch.script)}</div>`
                  : '<div style="color:var(--ink-4)">当前没有需要主动触达的理由。别为了触达而触达。</div>'
              }
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function paint(panel) {
    panel.innerHTML = tab === 'store' ? renderStore() : renderCustomer();
    if (tab === 'customer') {
      const sel = panel.querySelector('#pick-cust');
      if (sel) {
        sel.addEventListener('change', (e) => {
          picked = e.target.value;
          paint(panel);
        });
      }
    }
  }

  return {
    title: '复盘',
    crumb: `${esc(me.role === 'hq' ? '全部门店' : storeName(me.storeId))} · 周/月/季度复盘`,
    actions: '<button class="btn" onclick="window.print()">打印/存 PDF</button>',
    html,
    mount(root) {
      const panel = root.querySelector('#panel');
      paint(panel);
      root.querySelectorAll('[data-tab]').forEach((b) => {
        b.addEventListener('click', () => {
          tab = b.dataset.tab;
          root.querySelectorAll('[data-tab]').forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
          paint(panel);
        });
      });
    },
  };
}
