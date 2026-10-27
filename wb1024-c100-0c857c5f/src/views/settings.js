/** settings.js — 身份、数据、引擎说明与风险提示 */

import { getState, scope, currentUser, storeName, resetAll, customers, activeItems, scopedTodos } from '../db.js';
import { tag, empty, esc, toast, confirmDialog, copyText } from '../ui.js';
import { BLOCK_RULES, ROLE_META, DIMENSIONS, SIGNALS } from '../taxonomy.js';

export default async function settingsView() {
  const s = getState();
  const { me } = scope();
  const counts = {
    customers: customers().length,
    assessments: s.assessments.length,
    scripts: s.scripts.length,
    todos: scopedTodos().length,
    follows: s.follows.length,
    items: activeItems().length,
  };

  const html = `
  <div class="stack">
    <div class="card">
      <div class="card-head"><h3>当前身份</h3><span class="sub">切换身份在左侧栏底部</span></div>
      <div class="card-body">
        <div class="row wrap" style="gap:14px">
          <div class="avatar" style="width:44px;height:44px;font-size:17px;border-radius:12px">${esc(me.name.slice(0, 1))}</div>
          <div style="flex:1;min-width:200px">
            <div style="font-family:var(--font-serif);font-size:18px;font-weight:600">${esc(me.name)}</div>
            <div style="font-size:12px;color:var(--ink-3);margin-top:2px">${esc(ROLE_META[me.role].label)} · ${esc(me.title || '')} · ${esc(me.storeId ? storeName(me.storeId) : '全部门店')}</div>
          </div>
          ${tag(ROLE_META[me.role].scope, 'accent')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>权限分级</h3><span class="sub">与将来接云端时的行级权限一致</span></div>
      <div style="overflow-x:auto">
        <table class="table">
          <thead><tr><th>角色</th><th>可见范围</th><th>可录入</th><th>可生成话术</th><th>客户姓名</th></tr></thead>
          <tbody>
            ${Object.entries(ROLE_META)
              .map(
                ([k, v]) => `<tr>
                  <td style="font-weight:600">${esc(v.label)}</td>
                  <td style="font-size:12px;color:var(--ink-3)">${esc(v.scope)}</td>
                  <td>${k === 'hq' ? '<span style="color:var(--ink-4)">否</span>' : '是'}</td>
                  <td>${k === 'hq' ? '<span style="color:var(--ink-4)">否</span>' : '是'}</td>
                  <td>${k === 'hq' ? '<span style="color:var(--red)">脱敏</span>' : '完整'}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid g2">
      <div class="card">
        <div class="card-head"><h3>数据概览</h3><span class="sub">当前浏览器</span></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:9px;font-size:12.5px">
          ${[
            ['客户档案', counts.customers, '位（当前身份可见）'],
            ['面诊记录', counts.assessments, '条（全部门店）'],
            ['话术记录', counts.scripts, '次生成'],
            ['待办', counts.todos, '条'],
            ['跟进记录', counts.follows, '条'],
            ['品项', counts.items, '项'],
          ]
            .map(
              ([k, v, u]) => `<div class="row between"><span style="color:var(--ink-3)">${k}</span><span><b style="font-family:var(--font-mono)">${v}</b> <span style="font-size:11px;color:var(--ink-4)">${u}</span></span></div>`,
            )
            .join('')}
          <div class="row" style="gap:8px;margin-top:8px;padding-top:12px;border-top:1px solid var(--line-2)">
            <button class="btn sm" id="btn-export">导出 JSON</button>
            <button class="btn sm danger" id="btn-reset">重置演示数据</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>存储与协作</h3></div>
        <div class="card-body" style="font-size:12.5px;line-height:1.85;color:var(--ink-2)">
          <div class="notice amber" style="margin-bottom:12px">
            <span class="n-mark">!</span>
            <div><b>当前是单机版本。</b>数据存在这台设备的浏览器里，换设备、清缓存都会丢，也不能多人同时用。</div>
          </div>
          适合：单店试用、把流程跑通、验证话术结构是否可用。<br><br>
          不适合：多门店实时期望、店长与顾问同时操作、总部汇总。<br><br>
          要支持这些，需要把档案表、面诊表、品项表迁到云端库，并加登录与行级权限。存储层已按这个结构设计（每张表都有门店与负责人字段），迁移时不用改业务逻辑。
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>判断引擎</h3><span class="sub">当前为确定性规则引擎</span></div>
      <div class="card-body" style="font-size:12.5px;line-height:1.9;color:var(--ink-2)">
        话术与方案由规则推导，不是大模型生成。这样做的原因：
        <div style="margin:9px 0 9px 0;color:var(--ink-3)">
          · 每句话都能回溯到具体记录，不会凭空出现「检测显示您严重缺水」这种编造；<br>
          · 禁用词是硬拦截，不依赖模型自控；<br>
          · 离线可用，不产生调用费用，也不会因为模型版本变化而让话术风格漂移。
        </div>
        代价是句式比大模型固定。如果之后接云端，建议保留规则引擎作为<b>校验层</b>：模型负责组织语言，规则负责拦截越界表述与追溯证据——两层都在，才既自然又不失控。
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2)">
          覆盖维度 ${DIMENSIONS.length} 个、沟通信号 ${SIGNALS.length} 类、场景 6 种、方案层级 4 层。
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>合规拦截规则</h3><span class="sub">生成后二次校验，命中即标记</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:11px">
        ${BLOCK_RULES.map(
          (r) => `
          <div>
            <div class="row" style="gap:7px;margin-bottom:4px">
              ${tag(r.label, r.level === 'block' ? 'red' : 'amber')}
              <span style="font-size:11px;color:var(--ink-4)">${r.level === 'block' ? '硬拦截' : '提示'}</span>
            </div>
            <div style="font-size:11.5px;color:var(--ink-3);line-height:1.8">${r.words.map((w) => `「${esc(w)}」`).join(' ')}</div>
          </div>`,
        ).join('')}
        <div style="font-size:11.5px;color:var(--ink-4);line-height:1.8;border-top:1px solid var(--line-2);padding-top:10px">
          除拦截外还有一层中性化改写：常见贬损说法会直接替换成事实描述（如「油得像油田」→「T 区出油明显，需要分区护理」），替换记录会显示在话术页面，让你知道系统改了什么。
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>设计约束</h3><span class="sub">写进系统行为，不是宣传语</span></div>
      <div class="card-body" style="font-size:12.5px;line-height:1.95;color:var(--ink-2)">
        <div style="margin-bottom:8px"><b>一 · 先判断，后话术。</b>没有面诊记录时，话术工作台直接拦住，不给生成按钮。</div>
        <div style="margin-bottom:8px"><b>二 · 不制造焦虑，不违规承诺。</b>所有建议基于观察与检测数据，不做医学诊断。</div>
        <div style="margin-bottom:8px"><b>三 · 方案与证据一一对应。</b>每个推荐项都能追到维度或客户自述，不允许「因为套餐里有所以推」。</div>
        <div style="margin-bottom:8px"><b>四 · 升单在效果被感知之后。</b>按当前状态只给两个最可能成立的节点，不在客户刚躺下时推卡。</div>
        <div><b>五 · 数据在权限内流转。</b>顾问只看自己名下，店长看全店，总部看汇总且姓名脱敏。</div>
      </div>
    </div>
  </div>`;

  return {
    title: '设置',
    crumb: '身份 · 数据 · 引擎 · 规则',
    actions: '',
    html,
    mount(root) {
      root.querySelector('#btn-export').addEventListener('click', async () => {
        const data = JSON.stringify(getState(), null, 2);
        const ok = await copyText(data);
        if (ok) {
          toast('完整数据已复制到剪贴板（JSON）');
        } else {
          const blob = new Blob([data], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `mkt-export-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
          toast('已下载 JSON 文件');
        }
      });

      root.querySelector('#btn-reset').addEventListener('click', async () => {
        const ok = await confirmDialog({
          title: '重置演示数据',
          body: `<b style="color:var(--red)">这会清空本机所有客户、面诊、话术与待办记录，不可撤销。</b><br><br>重置后回到初始的 12 位客户演示数据。如果已经录了真实客户，先导出 JSON 备份。`,
          confirmText: '确认重置',
          danger: true,
        });
        if (ok) resetAll();
      });
    },
  };
}
