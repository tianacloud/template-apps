/* =========================================================================
 * 应用层：视图渲染 / 路由 / 三图对照 / 仿真托管 / 练习测验
 * ========================================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const SIM_HOST = { current: null };

/* ------------------------------ 总览示意图 ------------------------------ */
function overviewSvg() {
  const sys = ['桁架结构系统', '主驱动系统', '梯路系统', '梯级系统', '扶手带系统', '张紧与转向系统', '电气控制系统', '安全保护系统'];
  const A = [
    { n: '①', t: '上部机房（驱动站）', c: '#2563eb', x: 340, y: 196 },
    { n: '②', t: '桁架中段（倾斜梯路段）', c: '#0891b2', x: 248, y: 222 },
    { n: '③', t: '下部张紧段（张紧站）', c: '#7c3aed', x: 68, y: 292 },
    { n: '④', t: '梯级循环区', c: '#d97706', x: 156, y: 292 }
  ];
  /* 30° 倾角踏面线：下部水平段 → 倾斜段 → 上部水平段 */
  const T = x => x <= 134 ? 272 : (x >= 304 ? 174 : 272 - (x - 134) * 0.57647);
  const web = Array.from({ length: 10 }, (_, i) => {
    const x = 60 + i * 35;
    return `<line x1="${x}" y1="${T(x).toFixed(1)}" x2="${x}" y2="${(T(x) + 42).toFixed(1)}" stroke="#cbd5e1" stroke-width="1.6"/>`;
  }).join('');
  const steps = [];
  for (let x = 62; x <= 126; x += 32) steps.push([x, T(x), 26, 12]);
  for (let i = 0; i < 6; i++) { const x = 150 + i * 26; steps.push([x, T(x), 22, 12]); }
  steps.push([310, T(310), 26, 12], [340, T(340), 26, 12]);
  const badge = a => `<circle cx="${a.x}" cy="${a.y}" r="11" fill="#fff" stroke="${a.c}" stroke-width="2.2"/>
    <text x="${a.x}" y="${a.y + 4.5}" text-anchor="middle" font-size="12" font-weight="800" fill="${a.c}" font-family="inherit">${a.n}</text>`;
  return `<svg viewBox="0 0 640 430" xmlns="http://www.w3.org/2000/svg">
    <!-- 地坪 -->
    <line x1="20" y1="352" x2="372" y2="352" stroke="#a8a29e" stroke-width="2"/>
    <line x1="20" y1="360" x2="372" y2="360" stroke="#d6d3d1" stroke-width="6" stroke-dasharray="10 6"/>
    <text x="196" y="346" text-anchor="middle" font-size="11" fill="#78716c" font-family="inherit">地坪 / 楼板</text>

    <!-- 桁架主体（上部水平段 → 30° 倾斜段 → 下部水平段） -->
    <polygon points="56,272 134,272 304,174 372,174 372,216 304,216 134,314 56,314" fill="#f1f5f9" stroke="#64748b" stroke-width="2.2" stroke-linejoin="round"/>
    ${web}
    <!-- 梯级循环回路（主轮工作导轨 + 辅轮返回导轨） -->
    <path d="M56,266 L134,266 L304,168 L372,168 L372,206 L304,206 L134,308 L56,308 Z" fill="none" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="6 4"/>
    <!-- 梯级（沿踏面线排布） -->
    ${steps.map(s => `<rect x="${s[0]}" y="${(s[1] - s[3]).toFixed(1)}" width="${s[2]}" height="${s[3]}" fill="#fcd34d" stroke="#b45309" stroke-width="1.2"/>`).join('')}
    <!-- 护壁板 + 扶手带 -->
    <polygon points="56,228 134,228 304,130 372,130 372,174 304,174 134,272 56,272" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="1.4" opacity="0.75"/>
    <path d="M56,228 L134,228 L304,130 L372,130" fill="none" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
    <!-- 主驱动链轮 / 下部张紧链轮 -->
    <circle cx="300" cy="196" r="13" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
    <circle cx="300" cy="196" r="4" fill="#1d4ed8"/>
    <circle cx="100" cy="288" r="11" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
    <circle cx="100" cy="288" r="3.6" fill="#7c3aed"/>
    ${A.map(badge).join('')}

    <!-- 四大区域图例 -->
    <rect x="20" y="372" width="352" height="44" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="32" y="390" font-size="11" font-weight="700" fill="#334155" font-family="inherit">① 上部机房（驱动站）</text>
    <text x="200" y="390" font-size="11" font-weight="700" fill="#334155" font-family="inherit">② 桁架中段（倾斜梯路段）</text>
    <text x="32" y="408" font-size="11" font-weight="700" fill="#334155" font-family="inherit">③ 下部张紧段（张紧站）</text>
    <text x="200" y="408" font-size="11" font-weight="700" fill="#334155" font-family="inherit">④ 梯级循环区（梯级链回路）</text>

    <!-- 八大系统 -->
    <rect x="386" y="16" width="234" height="400" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <text x="503" y="42" text-anchor="middle" font-size="14" font-weight="800" fill="#0f172a" font-family="inherit">八大系统</text>
    ${sys.map((s, i) => `<rect x="400" y="${56 + i * 44}" width="206" height="36" rx="7" fill="#fff" stroke="#e2e8f0"/>
      <text x="414" y="${79 + i * 44}" font-size="11.5" font-weight="700" fill="#334155" font-family="inherit">${i + 1}. ${s}</text>`).join('')}
  </svg>`;
}

/* ------------------------------ 导航渲染 ------------------------------ */
function renderOverview() {
  const v = $('#view-overview');
  v.innerHTML = `
    <div class="hero">
      <div>
        <h2>自动扶梯结构与原理 · 仿真教学小程序</h2>
        <p>按 <b>四大区域</b> 与 <b>八大系统</b> 双维度组织知识体系，配合 <b>原理图 · 实物图 · 仿真图</b> 三图对照，
        每个系统均提供实时运行的 <b>工作原理仿真</b>，可用于课堂讲解与学生自主练习。</p>
        <div class="hero-stats">
          <div class="stat"><b>4</b><span>大区域</span></div>
          <div class="stat"><b>8</b><span>大系统</span></div>
          <div class="stat"><b>8</b><span>仿真模块</span></div>
          <div class="stat"><b>${EXAM.length}+</b><span>练习题</span></div>
        </div>
        <div class="pill-row">
          <span class="pill">🔗 梯级链传动驱动</span>
          <span class="pill">✋ 扶手带同步（超前 0~+2%）</span>
          <span class="pill">📐 倾角 30° · 梯级间距 400 mm</span>
          <span class="pill warn">🛡️ 安全回路串联保护</span>
        </div>
      </div>
      <div class="hero-figure">${overviewSvg()}</div>
    </div>

    <div class="section-title"><span class="bar"></span><h2>系统 × 区域 关联矩阵</h2></div>
    <table class="matrix">
      <thead><tr><th>系统 \\ 区域</th>${MATRIX.cols.map(c => `<th class="c">${c.name}</th>`).join('')}</tr></thead>
      <tbody>${MATRIX.rows.map(r => `<tr><td><b>${r.name}</b></td>${r.cells.map(c => `<td class="c">${c ? '<span class="yes">●</span>' : '<span class="no">○</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <p style="color:var(--c-muted);font-size:.9rem;margin-top:10px">说明：● 表示该系统的主要设备或作用范围覆盖该区域。可据此理解“区域是安装位置，系统是功能划分”。</p>

    <div class="section-title"><span class="bar"></span><h2>八大系统一览</h2></div>
    <div class="grid g4" id="ov-systems"></div>

    <div class="section-title"><span class="bar"></span><h2>建议学习路径</h2></div>
    <div class="grid g4">
      <div class="card"><h4>① 认识区域</h4><p style="font-size:.93rem">先建立“上部机房—桁架中段—下部张紧段—梯级循环区”的区域概念，知道各区域装什么。</p></div>
      <div class="card"><h4>② 拆解系统</h4><p style="font-size:.93rem">按八大系统逐项学习部件组成与结构特点，配合三图对照。</p></div>
      <div class="card"><h4>③ 仿真验证</h4><p style="font-size:.93rem">在仿真模块中改变参数，观察运行结果，验证原理公式。</p></div>
      <div class="card"><h4>④ 练习检测</h4><p style="font-size:.93rem">完成系统专项练习与综合测验，检验掌握程度。</p></div>
    </div>
  `;
  $('#ov-systems').innerHTML = SYSTEMS.map(sysCard).join('');
  bindSystemCards($('#ov-systems'));
}

function sysCard(s) {
  const spaceNames = s.spaces.map(id => SPACES.find(x => x.id === id).name).join(' · ');
  return `<div class="card hoverable sys-card" data-sys="${s.id}">
    <div class="no" style="background:${s.color}">${s.no}</div>
    <div class="sys-head">
      <span class="sys-icon">${s.icon}</span>
      <div><div class="sys-name">${s.name}</div><div class="sys-en">${s.en}</div></div>
    </div>
    <p class="sys-summary">${s.summary}</p>
    <div class="sys-foot"><span>${s.components.length} 类部件</span><span>${spaceNames}</span></div>
  </div>`;
}

function bindSystemCards(root) {
  $$('.sys-card', root).forEach(el => el.addEventListener('click', () => openSystem(el.dataset.sys)));
}

/* ------------------------------ 四大区域 ------------------------------ */
function renderSpaces() {
  const v = $('#view-spaces');
  v.innerHTML = `
    <div class="section-title"><span class="bar"></span><h2>自动扶梯的四大区域</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">自动扶梯设备按安装位置划分为四大区域。点击卡片查看该区域的设备构成、职责与安全要求（含示意图与实景图对照）。</p>
    <div class="grid g4">${SPACES.map(s => `
      <div class="card hoverable space-card" data-space="${s.id}">
        <div class="accent-line" style="background:${s.color}"></div>
        <div class="sc-head">
          <div class="sc-icon" style="background:${s.color}1a">${s.icon}</div>
          <div><div class="sys-name">${s.name}</div><div class="sys-en">${s.en}</div></div>
        </div>
        <div class="sc-pos">📍 ${s.pos}</div>
        <p class="sc-summary" style="margin-top:8px">${s.summary}</p>
        <div class="sys-foot" style="margin-top:12px"><span>${s.devices.length} 项设备</span><span>点击查看 →</span></div>
      </div>`).join('')}
    </div>`;
  $$('.space-card', v).forEach(el => el.addEventListener('click', () => openSpace(el.dataset.space)));
}

/* ------------------------------ 八大系统 ------------------------------ */
function renderSystems() {
  const v = $('#view-systems');
  v.innerHTML = `
    <div class="section-title"><span class="bar"></span><h2>自动扶梯的八大系统</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">按功能划分的八大系统。点击卡片查看：三图对照（原理图 / 实物图 / 仿真图）、部件组成、结构分析与工作原理仿真。</p>
    <div class="grid g4">${SYSTEMS.map(sysCard).join('')}</div>`;
  bindSystemCards(v);
}

/* ------------------------------ 仿真运行 ------------------------------ */
function renderSims() {
  const v = $('#view-sims');
  v.innerHTML = `
    <div class="section-title"><span class="bar"></span><h2>工作原理仿真运行</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">选择系统后，可在左侧调节参数、下达指令，右侧实时观察结构运动与数据变化。</p>
    <div class="pill-row" style="margin-bottom:18px">
      ${SYSTEMS.map(s => `<button class="tab-sim" data-sim="${s.sim}" data-active="false"
        style="appearance:none;border:1px solid #bfdbfe;background:#fff;color:#1d4ed8;font-family:inherit;font-size:.95rem;font-weight:700;padding:9px 16px;border-radius:999px;cursor:pointer">
        ${s.icon} ${s.name}</button>`).join('')}
    </div>
    <div class="present-panel" id="sim-present" hidden></div>
    <div class="sim-layout">
      <div>
        <div class="ctrl" id="sim-ctrl"></div>
      </div>
      <div>
        <div class="sim-stage" id="sim-stage"></div>
        <div class="log" id="sim-log"></div>
      </div>
    </div>
    <div class="panel" id="sim-notes" style="margin-top:20px"></div>
  `;
  $$('.tab-sim', v).forEach(b => b.addEventListener('click', () => {
    openSim(b.dataset.sim);
    $$('.tab-sim', v).forEach(x => {
      const on = x.dataset.sim === b.dataset.sim;
      x.style.background = on ? '#1d4ed8' : '#fff';
      x.style.color = on ? '#fff' : '#1d4ed8';
    });
  }));
  $$('.tab-sim', v)[0].click();
}

/* 销毁当前仿真并冲刷学习档案时长（C-04） */
function destroySim() {
  if (SIM_HOST.current && SIM_HOST.current.destroy) SIM_HOST.current.destroy();
  SIM_HOST.current = null;
  presentExit();
  if (typeof Profile !== 'undefined') Profile.recordSimVisit(null);
}

/* ------------------------------ 讲解模式 · 分步演示（C-03 框架） ------------------------------ */
/* 步骤数据模型：SIMS[x].steps = [{ t, d, hl:['.sel'], do:(api)=>{} }]，api = { set, act, log } */
const PRESENTER = { def: null, ctx: null, impl: null, step: -1, timer: null };

function presentAvailable() {
  return !!PRESENTER.def && Array.isArray(PRESENTER.def.steps) && PRESENTER.def.steps.length > 0;
}

function presentOpen(def, ctx, impl) {
  PRESENTER.def = def; PRESENTER.ctx = ctx; PRESENTER.impl = impl; PRESENTER.step = -1;
  const panel = $('#sim-present');
  if (!panel) return;
  if (!document.body.classList.contains('present-mode') || !def.steps || !def.steps.length) {
    panel.hidden = true; panel.innerHTML = '';
    return;
  }
  panel.hidden = false;
  panel.innerHTML = `
    <div class="pp-head">
      <span class="pp-step" id="pp-step">步骤 0/0</span>
      <b class="pp-title" id="pp-title"></b>
    </div>
    <p class="pp-desc" id="pp-desc"></p>
    <div class="pp-btns">
      <button class="btn ghost" id="pp-prev">◀ 上一步</button>
      <button class="btn" id="pp-next">下一步 ▶</button>
      <button class="btn ok" id="pp-auto">▶ 自动播放</button>
      <button class="btn dang" id="pp-exit">■ 退出分步</button>
    </div>`;
  $('#pp-prev').addEventListener('click', () => presentGo(PRESENTER.step - 1));
  $('#pp-next').addEventListener('click', () => presentGo(PRESENTER.step + 1));
  $('#pp-auto').addEventListener('click', presentAuto);
  $('#pp-exit').addEventListener('click', presentExit);
  presentGo(0);
}

function presentGo(n) {
  if (!presentAvailable()) return;
  const steps = PRESENTER.def.steps;
  if (n >= steps.length) { presentAutoStop(); return; }   // 播完自动停
  PRESENTER.step = Math.max(0, n);
  const st = steps[PRESENTER.step];
  // 高亮：清除旧高亮 → 应用新选择器
  $$('.hl', PRESENTER.ctx.stage).forEach(el => el.classList.remove('hl'));
  (st.hl || []).forEach(sel => {
    const el = PRESENTER.ctx.stage.querySelector(sel);
    if (el) el.classList.add('hl');
  });
  $('#pp-step').textContent = `步骤 ${PRESENTER.step + 1}/${steps.length}`;
  $('#pp-title').textContent = st.t || '';
  $('#pp-desc').textContent = st.d || '';
  // 执行步骤动作
  if (typeof st.do === 'function') {
    const impl = PRESENTER.impl;
    st.do({
      set: (k, v) => { if (impl && impl.onchange) impl.onchange(k, v); },
      act: (k) => { if (impl && impl.onaction) impl.onaction(k); },
      log: (m) => { if (PRESENTER.ctx.logLine) PRESENTER.ctx.logLine(m); }
    });
  }
}

function presentAuto() {
  const btn = $('#pp-auto');
  if (PRESENTER.timer) { presentAutoStop(); return; }
  if (PRESENTER.step >= PRESENTER.def.steps.length - 1) presentGo(0);
  PRESENTER.timer = setInterval(() => {
    if (PRESENTER.step >= PRESENTER.def.steps.length - 1) { presentAutoStop(); return; }
    presentGo(PRESENTER.step + 1);
  }, 3500);
  if (btn) btn.textContent = '⏸ 暂停播放';
}

function presentAutoStop() {
  if (PRESENTER.timer) { clearInterval(PRESENTER.timer); PRESENTER.timer = null; }
  const btn = $('#pp-auto');
  if (btn) btn.textContent = '▶ 自动播放';
}

/* 退出分步演示（保留讲解模式大字界面） */
function presentExit() {
  presentAutoStop();
  if (PRESENTER.ctx) $$('.hl', PRESENTER.ctx.stage).forEach(el => el.classList.remove('hl'));
  const panel = $('#sim-present');
  if (panel) { panel.hidden = true; panel.innerHTML = ''; }
}

/* 退出讲解模式时同步收起分层面板 */
function presentModeOff() {
  presentExit();
}

function openSim(id) {
  destroySim();
  const def = SIMS[id];
  if (!def) return;
  const stage = $('#sim-stage'), ctrl = $('#sim-ctrl'), logEl = $('#sim-log');
  ctrl.innerHTML = `<h4>${def.title}</h4><p style="font-size:.9rem;color:var(--c-muted);margin:0 0 6px">${def.desc}</p>`;
  logEl.innerHTML = '';
  const readout = document.createElement('div');
  readout.style.cssText = 'margin-top:16px;padding-top:10px;border-top:2px solid #eef2f7';

  const els = {};
  let impl = null;
  const ctx = {
    state: {},
    els,
    stage,
    readout(rows) {
      readout.innerHTML = rows.map(r => `<div class="readout"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
    },
    logLine(m) {
      const d = document.createElement('div');
      const t = new Date();
      d.textContent = `[${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}] ${m}`;
      logEl.prepend(d);
      while (logEl.childNodes.length > 40) logEl.removeChild(logEl.lastChild);
    }
  };
  buildControls(ctrl, def.controls, (k, val) => {
    if (impl && impl.onchange) { impl.onchange(k, val); if (typeof Profile !== 'undefined') Profile.recordSimAction(id); }
  }, (k, btn) => {
    if (impl && impl.onaction) { impl.onaction(k, btn); if (typeof Profile !== 'undefined') Profile.recordSimAction(id); }
  }, els);
  ctrl.appendChild(readout);
  impl = def.mount(ctx);
  SIM_HOST.current = impl;
  if (typeof Profile !== 'undefined') Profile.recordSimVisit(id);
  presentOpen(def, ctx, impl);
  const strip = (def.photos && def.photos.length)
    ? `<div class="photo-strip"><div class="ps-title">实物图参考（教材实拍）</div><div class="ps-row">` +
      def.photos.map(p => `<figure class="photo-item"><img src="${photoUrl(p.f)}" alt="${p.cap}" loading="lazy" onerror="this.parentNode.style.display='none'"><figcaption>${p.cap}</figcaption></figure>`).join('') +
      `</div></div>` : '';
  $('#sim-notes').innerHTML = strip + `<h3><span class="dot"></span>教学要点</h3>
    <ul class="bullets">${def.notes.map(n => `<li>${n}</li>`).join('')}</ul>
    <div class="pill-row"><span class="pill grey">提示：拖动滑块或点击按钮后，右侧仿真会立即响应</span></div>`;
}

/* ------------------------------ 练习测验 ------------------------------ */
function renderQuiz() {
  const v = $('#view-quiz');
  v.innerHTML = `
    <div class="section-title"><span class="bar"></span><h2>综合练习与测验</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">共 ${EXAM.length} 题，点击选项即时判分并显示解析。各系统的专项练习可在「八大系统 → 系统详情」中查看。</p>
    ${EXAM.map((q, i) => quizCard(q, i, 'exam')).join('')}
    <div class="score-bar">
      <div><div class="big" id="score-big">0 / ${EXAM.length}</div><div class="lbl" id="score-lbl">正确率 0%</div></div>
      <div style="margin-left:auto;display:flex;gap:10px">
        <button class="btn ghost" id="quiz-reset">重新作答</button>
        <button class="btn" id="quiz-all">显示全部答案</button>
      </div>
    </div>
  `;
  bindQuiz(v, 'score-big', 'score-lbl', EXAM.length);
  $('#quiz-reset').addEventListener('click', () => renderQuiz());
  $('#quiz-all').addEventListener('click', () => {
    $$('.quiz-card', v).forEach(c => showAnswer(c));
    $$('.btn-confirm', v).forEach(b => b.style.display = 'none');
    $('#score-lbl').textContent = '已显示全部答案，可点击「重新作答」重来';
  });
}

function quizCard(q, i, scope) {
  const opts = Array.isArray(q.a) ? q.o.map((o, j) => ({ o, j })).map(x => `
    <div class="opt" data-j="${x.j}"><span class="k">${'ABCD'[x.j]}</span><span>${x.o}</span></div>`).join('')
    : q.o.map((o, j) => `<div class="opt" data-j="${j}"><span class="k">${'ABCD'[j]}</span><span>${o}</span></div>`).join('');
  return `<div class="quiz-card" data-q="${i}" data-scope="${scope}" data-answered="0">
    <div class="qno">第 ${i + 1} 题${q.multi ? '（多选）' : ''}</div>
    <div class="qtext">${q.q}</div>
    ${opts}
    ${q.multi ? '<button class="btn btn-confirm" style="margin-top:4px">确认作答</button>' : ''}
    <div class="explain">✅ 正确答案：<b>${Array.isArray(q.a) ? q.a.map(k => 'ABCD'[k]).join('、') : 'ABCD'[q.a]}</b>　${q.e}</div>
  </div>`;
}

function bindQuiz(root, bigId, lblId, total) {
  $$('.quiz-card', root).forEach(card => {
    const idx = +card.dataset.q;
    const q = EXAM[idx];
    const sel = [];
    $$('.opt', card).forEach(opt => opt.addEventListener('click', () => {
      if (card.dataset.answered === '1') return;
      const j = +opt.dataset.j;
      if (q.multi) {
        if (sel.includes(j)) { sel.splice(sel.indexOf(j), 1); opt.classList.remove('sel'); }
        else { sel.push(j); opt.classList.add('sel'); }
      } else {
        sel.length = 0; sel.push(j);
        $$('.opt', card).forEach(o => o.classList.remove('sel'));
        opt.classList.add('sel');
        showAnswer(card);
      }
      if (bigId) updateScore(root, bigId, lblId, total);
    }));
    const cf = $('.btn-confirm', card);
    if (cf) cf.addEventListener('click', () => {
      if (card.dataset.answered === '1') return;
      if (!sel.length) return;
      showAnswer(card);
      if (cf) cf.style.display = 'none';
      if (bigId) updateScore(root, bigId, lblId, total);
    });
  });
}

function showAnswer(card) {
  const idx = +card.dataset.q;
  const q = EXAM[idx];
  const sel = $$('.opt', card).filter(o => o.classList.contains('sel')).map(o => +o.dataset.j);
  const correct = Array.isArray(q.a) ? q.a : [q.a];
  const ok = sel.length === correct.length && sel.every(s => correct.includes(s));
  $$('.opt', card).forEach(o => {
    const j = +o.dataset.j;
    o.classList.remove('sel');
    if (correct.includes(j)) o.classList.add('right');
    else if (sel.includes(j)) o.classList.add('wrong');
  });
  card.dataset.answered = '1';
  card.dataset.ok = ok ? '1' : '0';
  $('.explain', card).classList.add('show');
  if (typeof Profile !== 'undefined') Profile.recordQuiz(card.dataset.scope, idx, ok);
}

function updateScore(root, bigId, lblId, total) {
  const cards = $$('.quiz-card', root);
  const done = cards.filter(c => c.dataset.answered === '1');
  const right = done.filter(c => c.dataset.ok === '1').length;
  const big = $('#' + bigId), lbl = $('#' + lblId);
  if (!big) return;
  big.textContent = `${right} / ${total}`;
  const rate = done.length ? Math.round(right / done.length * 100) : 0;
  lbl.textContent = `已答 ${done.length} 题 · 正确率 ${rate}%`;
}

/* ------------------------------ 系统详情（弹层） ------------------------------ */
function openModal(html) {
  const mask = $('#modal-mask');
  $('#modal').innerHTML = html;
  mask.classList.add('show');
  mask.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));
  document.body.style.overflow = 'hidden';
  return $('#modal');
}
function closeModal() {
  destroySim();
  $('#modal-mask').classList.remove('show');
  $('#modal').innerHTML = '';
  document.body.style.overflow = '';
}

function openSpace(id) {
  const s = SPACES.find(x => x.id === id);
  if (!s) return;
  const m = openModal(`
    <div class="modal-head">
      <div class="sc-icon" style="background:${s.color}1a;width:52px;height:52px;border-radius:13px;display:grid;place-items:center;font-size:26px">${s.icon}</div>
      <div><h2>${s.name}</h2><div class="sys-en">${s.en}</div></div>
      <button class="close" data-close-modal>✕</button>
    </div>
    <div class="tags">
      <span class="pill">📍 ${s.pos}</span>
    </div>
    <div class="panel"><h3><span class="dot"></span>区域概述</h3><p>${s.summary}</p></div>

    <div class="compare two">
      <div class="figure"><div class="fig-label">① 原理示意图<span class="tag" style="background:#eff6ff;color:#1d4ed8">矢量绘制</span></div>
        <div class="fig-body"><div class="svg-host">${schematicSvg(s.schematic)}</div></div>
        <div class="fig-cap">${s.name}设备布置与相互关系</div></div>
      <div class="figure"><div class="fig-label">② 实物照片<span class="tag" style="background:#fff7ed;color:#c2410c">教材实拍</span></div>
        <div class="fig-body"><img src="${s.photo}" alt="${s.name}实景" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="fig-cap">${s.photoCap || '现场安装实景参考（用于对照辨识真实设备）'}</div></div>
    </div>
    ${s.photoRef ? `
    <div class="compare two" style="margin-top:14px">
      <div class="figure"><div class="fig-label">③ 仿真参考图<span class="tag" style="background:#f5f3ff;color:#6d28d9">教学截图</span></div>
        <div class="fig-body"><img src="${s.photoRef}" alt="${s.name}仿真参考" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="fig-cap">${s.photoRefCap || '仿真软件参考图（部件结构示意）'}</div></div>
    </div>` : ''}

    <div class="grid g2" style="margin-top:20px">
      <div class="panel" style="margin:0"><h3><span class="dot"></span>主要设备</h3>
        <ul class="bullets">${s.devices.map(d => `<li>${d}</li>`).join('')}</ul></div>
      <div class="panel" style="margin:0"><h3><span class="dot"></span>区域职责</h3>
        <ul class="bullets">${s.duties.map(d => `<li>${d}</li>`).join('')}</ul></div>
    </div>
    <div class="panel" style="margin-top:20px"><h3><span class="dot" style="background:#dc2626"></span>安全要求与规范要点</h3>
      <ul class="bullets">${s.safety.map(d => `<li>${d}</li>`).join('')}</ul></div>
  `);
  m.classList.add('show');
}

function openSystem(id, fromQuiz) {
  const s = SYSTEMS.find(x => x.id === id);
  if (!s) return;
  const def = SIMS[s.sim];
  const spacePills = s.spaces.map(sid => { const sp = SPACES.find(x => x.id === sid); return `<span class="pill" style="background:${sp.color}14;color:${sp.color};border-color:${sp.color}33">${sp.icon} ${sp.name}</span>`; }).join('');
  const m = openModal(`
    <div class="modal-head">
      <div class="sc-icon" style="background:${s.color}1a;width:52px;height:52px;border-radius:13px;display:grid;place-items:center;font-size:28px">${s.icon}</div>
      <div><h2>${s.no} · ${s.name}</h2><div class="sys-en">${s.en}</div></div>
      <button class="close" id="m-close">✕</button>
    </div>
    <div class="tags">${spacePills}<span class="pill grey">所属区域</span></div>
    <div class="panel"><h3><span class="dot" style="background:${s.color}"></span>系统概述</h3><p>${s.summary}</p></div>

    <div class="section-title" style="margin-top:6px"><span class="bar" style="background:${s.color}"></span><h2 style="font-size:1.3rem">四图对照：原理图 · 实物图 · 仿真参考 · 仿真图</h2></div>
    <div class="compare">
      <div class="figure"><div class="fig-label">① 原理图<span class="tag" style="background:#eff6ff;color:#1d4ed8">矢量绘制</span></div>
        <div class="fig-body"><div class="svg-host">${schematicSvg(s.id)}</div></div>
        <div class="fig-cap">工作原理与受力关系示意</div></div>
      <div class="figure"><div class="fig-label">② 实物图<span class="tag" style="background:#fff7ed;color:#c2410c">教材实拍</span></div>
        <div class="fig-body"><img src="${s.photo}" alt="${s.name}实物" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="fig-cap">${s.photoCap || '真实部件外观与安装形态'}</div></div>
      <div class="figure"><div class="fig-label">③ 仿真参考图<span class="tag" style="background:#f5f3ff;color:#6d28d9">教学截图</span></div>
        <div class="fig-body"><img src="${s.photoRef || s.photo}" alt="${s.name}仿真参考" loading="lazy" onerror="this.style.display='none'"></div>
        <div class="fig-cap">${s.photoRefCap || '仿真软件参考图（部件结构示意）'}</div></div>
      <div class="figure"><div class="fig-label">④ 仿真图<span class="tag" style="background:#ecfdf5;color:#047857">动态运行</span></div>
        <div class="fig-body"><div class="svg-host" id="modal-sim" style="padding:2px"></div></div>
        <div class="fig-cap">实时运行动画，可到「仿真运行」页调节参数</div></div>
    </div>

    <div class="panel" style="margin-top:20px"><h3><span class="dot" style="background:${s.color}"></span>部件组成（${s.components.length} 类）</h3>
      <div class="cmp-list">${s.components.map((c, i) => `
        <div class="cmp-item">
          <div class="idx">${i + 1}</div>
          <div><div class="n">${c.n}</div><div class="d">${c.d}</div></div>
        </div>`).join('')}</div>
    </div>

    <div class="panel"><h3><span class="dot" style="background:${s.color}"></span>结构分析</h3>
      <ul class="bullets">${s.structure.map(x => `<li>${x}</li>`).join('')}</ul></div>

    <div class="panel"><h3><span class="dot" style="background:#0891b2"></span>工作原理</h3>
      <p>${s.principle}</p>
      ${s.formula ? `<div class="formula">${s.formula}</div>` : ''}
      ${def ? `<div style="margin-top:14px"><div class="pill-row">${def.notes.map(n => `<span class="pill grey">${n}</span>`).join('')}</div></div>` : ''}
      <div class="btn-row"><button class="btn" id="m-gosim">▶ 打开完整仿真（可调参数）</button></div>
    </div>

    <div class="panel"><h3><span class="dot" style="background:#4f46e5"></span>系统专项练习</h3>
      ${s.quiz.map((q, i) => quizCard(q, i, s.id)).join('')}
    </div>
  `);
  m.classList.add('show');
  $('#m-close').addEventListener('click', closeModal);

  // 仿真图：在第三栏挂载实时仿真（无读数区）
  const host = $('#modal-sim');
  if (def && host) {
    const ctx = {
      state: {}, els: {}, stage: host,
      readout() { }, logLine() { }
    };
    SIM_HOST.current = def.mount(ctx);
    if (typeof Profile !== 'undefined') Profile.recordSimVisit(s.sim);
  }
  // 专项练习判分
  $$('.quiz-card', m).forEach(card => {
    const i = +card.dataset.q;
    const q = s.quiz[i];
    const sel = [];
    $$('.opt', card).forEach(opt => opt.addEventListener('click', () => {
      if (card.dataset.answered === '1') return;
      const j = +opt.dataset.j;
      sel.length = 0; sel.push(j);
      $$('.opt', card).forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
      // 复用通用判分
      const correct = Array.isArray(q.a) ? q.a : [q.a];
      const ok = correct.includes(j);
      $$('.opt', card).forEach(o => { const jj = +o.dataset.j; o.classList.remove('sel'); if (correct.includes(jj)) o.classList.add('right'); else if (jj === j) o.classList.add('wrong'); });
      card.dataset.answered = '1';
      $('.explain', card).classList.add('show');
      if (typeof Profile !== 'undefined') Profile.recordQuiz(s.id, i, ok);
    }));
  });
  $('#m-gosim').addEventListener('click', () => {
    closeModal();
    switchView('sims');
    $$('.tab-sim').forEach(x => { if (x.dataset.sim === s.sim) x.click(); });
  });
}

/* ------------------------------ 结构图库（F-07） ------------------------------ */
const GALLERY_GROUPS = ['整体与分解', '动力传动', '梯路与梯级', '扶手带', '安全与张紧'];

function renderGallery() {
  const v = $('#view-gallery');
  const renderGroup = (arr, groups, kind) => groups.map(g => {
    const items = arr.filter(x => x.group === g);
    if (!items.length) return '';
    return `
      <div class="section-title"><span class="bar"></span><h2>${g}</h2></div>
      <div class="gallery-grid">
        ${items.map(x => `
          <div class="gal-item" data-file="${x.file}" data-kind="${kind}">
            <div class="gal-img"><img src="${photoUrl(x.file)}" alt="${x.title}" loading="lazy"></div>
            <div class="gal-body"><div class="gal-title">${x.title}</div><div class="gal-cap">${x.cap}</div></div>
          </div>`).join('')}
      </div>`;
  }).join('');
  const mainGroups = renderGroup(GALLERY, GALLERY_GROUPS, 'main');
  const realGroups = renderGroup(REAL_GALLERY, REAL_GALLERY_GROUPS, 'real');
  v.innerHTML = `
    <div class="section-title"><span class="bar"></span><h2>实物图库（教材实拍）</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">共 ${REAL_GALLERY.length} 张部件实物照片，来自课程教学资源实拍，用于真实部件辨识与课堂对照。点击可放大。</p>
    ${realGroups}
    <div class="section-title" style="margin-top:28px"><span class="bar"></span><h2>结构图库（教学示意）</h2></div>
    <p style="color:var(--c-muted);margin-top:-6px">共 ${GALLERY.length} 张教学结构图（含仿真软件参考截图），按主题分组。点击任意图片可放大查看。</p>
    ${mainGroups}
  `;
  $$('.gal-item', v).forEach(el => el.addEventListener('click', () => openGalleryImg(el.dataset.file, el.dataset.kind)));
}

const REAL_GALLERY_GROUPS = ['整机与桁架', '驱动与传动', '梯级与导轨', '扶手带与安全', '电气与控制'];

function openGalleryImg(file, kind) {
  const lib = kind === 'real' ? REAL_GALLERY : GALLERY;
  const x = lib.find(g => g.file === file) || GALLERY.find(g => g.file === file) || REAL_GALLERY.find(g => g.file === file);
  if (!x) return;
  const m = openModal(`
    <div class="modal-head">
      <div><h2>${x.title}</h2><div class="sys-en">${x.group}${kind === 'real' ? ' · 教材实拍' : ''}</div></div>
      <button class="close" id="g-close">✕</button>
    </div>
    <div class="tags"><span class="pill grey">${x.cap}</span></div>
    <div class="gallery-large"><img src="${photoUrl(file)}" alt="${x.title}"></div>
  `);
  m.classList.add('show');
  $('#g-close').addEventListener('click', closeModal);
}

/* ------------------------------ 路由 ------------------------------ */
function switchView(name) {
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + name));
  if (name !== 'sims') destroySim();
  if (name === 'sims') { const first = $('.tab-sim'); if (first) first.click(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------ 关于页（02 文档 2.4） ------------------------------ */
function openAbout() {
  const p = (typeof Profile !== 'undefined') ? Profile.get() : null;
  const ver = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : 'v1.0.0';
  const build = (typeof APP_BUILD !== 'undefined') ? APP_BUILD : '—';
  const m = openModal(`
    <div class="modal-head">
      <div class="sc-icon" style="background:#1e3a8a1a;width:52px;height:52px;border-radius:13px;display:grid;place-items:center;font-size:26px">🛝</div>
      <div><h2>关于本应用</h2><div class="sys-en">About · ${ver}（${build}）</div></div>
      <button class="close" id="a-close">✕</button>
    </div>
    <div class="tags">
      <span class="pill">适用课程：自动扶梯结构与原理（高职 · 电梯工程技术专业）</span>
      <span class="pill grey">版本 ${ver} · 构建 ${build}</span>
    </div>
    <div class="panel"><h3><span class="dot"></span>内容依据声明</h3>
      <p>内容依据通用自动扶梯结构与原理教学体系整理；涉及具体工程设计、安装、维修、检验要求时，请以<b>现行有效</b>的国家标准与安全技术规范为准。</p></div>
    <div class="panel"><h3><span class="dot" style="background:#dc2626"></span>免责声明</h3>
      <p>示意图与仿真参数均为<b>教学示意值</b>，不作为设计、安装、维修、检验依据；内容不指向任何真实设备品牌。涉及安全装置（制动器、各保护开关等）的内容仅作原理教学，实操须持证并按规范执行。</p></div>
    <div class="panel"><h3>学习档案与教学素材</h3><p>学习档案保存在应用数据库，图片从应用文件存储读取。图库保留素材来源及必要署名。</p></div>
    <div class="panel"><h3><span class="dot" style="background:#0891b2"></span>更新日志</h3>
      <ul class="bullets">
        <li><b>v1.2.8（2026-10-20）</b>：重做上下水平段几何 —— 倾斜段 500→420 px、主驱动链轮中心 700→820（提升高度 210 px ≈ 1.5 m），上下水平段「可见放平段」实测 146 / 152.3 px（≥2 级梯级间距），上端站不再缺少放平梯级；四件截面按新切点重排（下端 楼层板 12~82 → 前沿板 82~100 → 梳齿板 100~124；上端 梳齿板 786~810 → 前沿板 810~828 → 楼层板 828~896）；自检断言改为同时判定上下两段，并覆盖 27.3 / 30 / 35° 三种倾角。</li>
        <li><b>v1.2.7（2026-10-20）</b>：检修控制改「公共 + 方向」模式（转换开关 + 公共自锁 + 上行/下行按住点动，检修速度 0.30 m/s）；梯级结构按实物重做配色（铝本色踢板 / 新增铝合金弧形侧板架 / 主轮金属轮毂轴承 / 辅轮黑色带毂 / 黄色塑料梯级链）；出入口补齐「楼层板 → 前沿板 → 梳齿板 → 梯级踏面」四件截面与啮合表达；上下水平段加长至各 ≥2 级完全放平；新增弯弧段卸载导轨与主/辅轮斜上斜下标注。</li>
        <li><b>v1.0.0（2026-10-17）</b>：16 项缺陷修复；学习档案数据模块；讲解模式分步演示框架。</li>
      </ul></div>
    <div class="panel"><h3><span class="dot" style="background:#d97706"></span>反馈渠道</h3>
      <p>使用问题与内容建议请联系课程组任课教师，汇总后统一修订。</p></div>
    ${p ? `<div class="panel"><h3><span class="dot" style="background:#64748b"></span>学习档案状态</h3>
      <p style="font-size:.92rem;color:var(--c-muted)">可在「练习测验」页查看成绩统计。</p></div>` : ''}
  `);
  m.classList.add('show');
  $('#a-close').addEventListener('click', closeModal);
}

/* ------------------------------ 启动 ------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  // 恢复讲解模式偏好（C-04 settings）
  if (typeof Profile !== 'undefined' && Profile.get().settings && Profile.get().settings.present) {
    document.body.classList.add('present-mode');
    $('#present-toggle').textContent = '🧑‍🏫 退出讲解模式';
  }
  renderOverview();
  renderSpaces();
  renderSystems();
  renderSims();
  renderQuiz();
  renderGallery();
  $$('.tab').forEach(t => t.addEventListener('click', () => switchView(t.dataset.view)));
  $('#present-toggle').addEventListener('click', e => {
    const on = document.body.classList.toggle('present-mode');
    e.target.textContent = on ? '🧑‍🏫 退出讲解模式' : '🧑‍🏫 讲解模式';
    if (typeof Profile !== 'undefined') {
      const p = Profile.get(); p.settings.present = on; Profile.save(p);
    }
    if (on && $('.view.active') && $('.view.active').id === 'view-sims') {
      const first = $('.tab-sim'); if (first) first.click();   // 重开当前仿真以挂载分步面板
    } else { presentModeOff(); }
  });
  $('#about-btn').addEventListener('click', openAbout);
  $('#modal-mask').addEventListener('click', e => { if (e.target.id === 'modal-mask') closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (presentAvailable() && !$('#sim-present').hidden) { presentExit(); return; }
      closeModal();
    }
    if (!$('#sim-present') || $('#sim-present').hidden) return;
    if (e.key === 'ArrowLeft') { presentAutoStop(); presentGo(PRESENTER.step - 1); }
    if (e.key === 'ArrowRight') { presentAutoStop(); presentGo(PRESENTER.step + 1); }
  });
  const verEl = $('#app-ver');
  if (verEl && typeof APP_VERSION !== 'undefined') verEl.textContent = APP_VERSION + ' · ' + APP_BUILD;
  switchView('overview');
});
