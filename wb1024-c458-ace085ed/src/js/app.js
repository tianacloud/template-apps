/* =========================================================
 * PyAcademy 应用逻辑：路由 / 渲染 / 进度
 * ========================================================= */
(function () {
  const COURSES = window.COURSES, CHEATS = window.CHEATS,
        RES = window.RES, LABS = window.LABS, ROADMAP = window.ROADMAP;

  const KEY = 'py-academy-v1';
  let DB = { done: {}, ex: {}, open: {} };
  try { const s = localStorage.getItem(KEY); if (s) DB = Object.assign(DB, JSON.parse(s)); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} };

  const view = document.getElementById('view');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* 代码块注册表：避免把长代码塞进 HTML 属性 */
  const CODES = [];
  function regCode(code) { CODES.push(code); return CODES.length - 1; }

  function codeBlock(code, opts) {
    opts = opts || {};
    const ci = regCode(code);
    const runnable = opts.run === undefined ? true : opts.run;
    return '<div class="codeblk" data-ci="' + ci + '">' +
      '<div class="cb-hd"><span class="cb-title">' + esc(opts.title || 'Python') + '</span>' +
      '<span class="cb-acts">' +
      (runnable ? '<button class="cb-btn" data-act="run">▶ 运行</button>' : '') +
      '<button class="cb-btn" data-act="copy">复制</button>' +
      '<button class="cb-btn" data-act="tolab">送去练习场</button>' +
      '</span></div>' +
      '<pre>' + esc(code) + '</pre>' +
      (opts.out ? '<div class="out-line">' + esc(opts.out) + '</div>' : '') +
      '</div>';
  }

  /* ---------------- 侧栏 ---------------- */
  function renderMenu() {
    const base = COURSES.filter(c => !c.stage.startsWith('选修'));
    const elect = COURSES.filter(c => c.stage.startsWith('选修'));
    const item = c => '<a href="#/course/' + c.id + '" data-cid="' + c.id + '">' +
      '<span class="no" style="font-family:var(--mono);font-size:11px;color:var(--brand)">' + c.no + '</span> ' +
      esc(c.title.length > 13 ? c.title.slice(0, 13) + '…' : c.title) +
      (DB.done[c.id] ? ' <span class="badge-done">完成</span>' : '') + '</a>';
    document.getElementById('menuCourses1').innerHTML = base.map(item).join('');
    document.getElementById('menuCourses2').innerHTML = elect.map(item).join('');
    updateSideProgress();
  }

  function progressStats() {
    let exTotal = 0, exDone = 0, cDone = 0;
    COURSES.forEach(c => {
      if (DB.done[c.id]) cDone++;
      c.exercises.forEach((_, i) => {
        exTotal++;
        if (DB.ex[c.id + '-' + i]) exDone++;
      });
    });
    const pct = exTotal ? Math.round(exDone / exTotal * 100) : 0;
    return { cDone, cTotal: COURSES.length, exDone, exTotal, pct };
  }

  function updateSideProgress() {
    const s = progressStats();
    document.getElementById('sidePct').textContent = s.pct + '%';
    document.getElementById('sideBar').style.width = s.pct + '%';
  }

  /* ---------------- 页面：首页 ---------------- */
  function renderHome() {
    const s = progressStats();
    const codeCount = COURSES.reduce((n, c) => n + c.sections.filter(x => x.code).length, 0);
    view.innerHTML =
      '<div class="hero">' +
        '<h1>Python 交互式学习手册</h1>' +
        '<p>' + COURSES.length + ' 节成体系的课程 · ' + codeCount + ' 个可运行示例 · ' + s.exTotal + ' 道配套练习。每个代码块都能在浏览器里直接运行（无需安装任何东西），学练一体，从零基础到能独立做项目。</p>' +
        '<div class="h-btns"><button class="h-btn" onclick="location.hash=\'#/course/c1\'">从第 1 课开始</button>' +
        '<button class="h-btn ghost" onclick="location.hash=\'#/lab\'">先去练习场试试</button></div>' +
      '</div>' +
      '<div class="stat-strip">' +
        '<div class="stat-box"><b>' + s.cDone + '/' + s.cTotal + '</b><span>已完成课程</span></div>' +
        '<div class="stat-box"><b>' + s.exDone + '/' + s.exTotal + '</b><span>已通关练习</span></div>' +
        '<div class="stat-box"><b>' + s.pct + '%</b><span>总进度</span></div>' +
        '<div class="stat-box"><b>' + codeCount + '</b><span>可运行示例</span></div>' +
      '</div>' +
      '<h2 class="sec">课程目录</h2>' +
      '<div class="grid g2">' +
      COURSES.map(c =>
        '<a class="card" href="#/course/' + c.id + '"><h4><span class="no">' + c.no + '</span>' + esc(c.title) +
        (DB.done[c.id] ? '<span class="badge-done">完成</span>' : '') + '</h4>' +
        '<p>' + esc(c.stage) + ' · 约 ' + c.minutes + ' 分钟 · ' + c.sections.length + ' 个小节 · ' + c.exercises.length + ' 道练习</p></a>'
      ).join('') +
      '</div>' +
      '<h2 class="sec">你将掌握</h2>' +
      '<div class="kp-cloud">' +
        ['变量与类型', '切片与字符串', '列表字典', '循环与条件', '函数四形态', '类与继承', '魔法方法', '文件与JSON', '异常处理', '模块与标准库', '推导式', '生成器', '装饰器', '类型注解', 'FastAPI 入门', 'pandas 核心操作', '爬虫三件套', '定时任务']
        .map(k => '<span class="kp-pill">' + k + '</span>').join('') +
      '</div>' +
      '<div class="callout co-info" style="margin-top:20px"><b>怎么用这个站？</b>' +
      '按顺序读课程 → 每个示例点「运行」亲手跑一遍、故意改坏一次 → 做每课的练习并勾选 → 卡住先看提示再看答案 → 全部学完去「路线与方法」页规划后续方向。</div>';
  }

  /* ---------------- 页面：课程 ---------------- */
  function renderCourse(cid) {
    const idx = COURSES.findIndex(c => c.id === cid);
    if (idx < 0) { location.hash = '#/'; return; }
    const c = COURSES[idx];
    const prev = COURSES[idx - 1], next = COURSES[idx + 1];
    const isDone = !!DB.done[c.id];

    const secHtml = c.sections.map((s, si) => {
      let h = '<h3 class="sub">' + esc(s.h) + '</h3>';
      if (s.p) h += '<p style="color:#2a323d;margin:8px 0">' + s.p + '</p>';
      if (s.code) h += codeBlock(s.code, { title: '示例 ' + c.no + '.' + (si + 1), out: s.out });
      if (s.warn) h += '<div class="callout co-warn"><b>⚠ 注意</b>' + esc(s.warn) + '</div>';
      if (s.tip) h += '<div class="callout co-tip"><b>💡 提示</b>' + esc(s.tip) + '</div>';
      return h;
    }).join('');

    const pitHtml = c.pitfalls ? '<h2 class="sec">易错点与坑</h2><div class="grid g2">' +
      c.pitfalls.map(p =>
        '<div class="card" style="border-color:#f2c7c3;background:#fffafa"><h4 style="color:#b03a34">✗ ' + esc(p.t) + '</h4><p>' + esc(p.d) + '</p></div>'
      ).join('') + '</div>' : '';

    const exHtml = '<h2 class="sec">动手练习（' + c.exercises.length + ' 题）</h2><p class="page-sub">先自己写，卡住 20 分钟再看提示；看完答案务必关掉自己重写一遍。</p>' +
      c.exercises.map((e, i) => {
        const id = c.id + '-' + i;
        const on = !!DB.ex[id];
        return '<details class="ex' + (on ? ' done-ex' : '') + '" data-ex="' + id + '">' +
          '<summary><span class="ttl">' + esc(e.q) + '</span><span class="chip' +
          (e.lv === '基础' ? ' green' : e.lv === '进阶' ? ' blue' : ' purple') + '" style="margin-left:auto">' + e.lv + '</span></summary>' +
          '<div class="ex-body">' +
          (e.hint ? '<details class="ex-ans"><summary>看提示</summary><div class="callout co-info" style="margin-top:8px">' + esc(e.hint) + '</div></details>' : '') +
          (e.sol ? '<details class="ex-ans"><summary>看参考答案（先自己写！）</summary>' + codeBlock(e.sol, { title: '参考答案', run: true }) + '</details>' : '') +
          '<label class="ex-check"><input type="checkbox" data-exid="' + id + '"' + (on ? ' checked' : '') + '> 我已独立完成这道题</label>' +
          '</div></details>';
      }).join('');

    view.innerHTML =
      '<div class="crumb"><a href="#/">总览</a> / ' + esc(c.stage) + '</div>' +
      '<h1 class="page">第 ' + c.no + ' 课 · ' + esc(c.title) + '</h1>' +
      '<div class="meta-row"><span class="chip blue">' + esc(c.stage) + '</span>' +
      '<span class="chip">⏱ 约 ' + c.minutes + ' 分钟</span>' +
      '<span class="chip">💬 ' + c.sections.length + ' 小节</span>' +
      '<span class="chip">✏️ ' + c.exercises.length + ' 练习</span></div>' +
      '<p style="font-size:15px;color:#2a323d;border-left:3px solid var(--brand);padding-left:14px">' + esc(c.intro) + '</p>' +
      '<div class="prose">' + secHtml + '</div>' +
      pitHtml + exHtml +
      '<div class="finish-row">' +
        '<button class="btn btn-p' + (isDone ? ' unset' : '') + '" id="btnDone">' + (isDone ? '✓ 已标记完成（点击取消）' : '标记本课已学完') + '</button>' +
        '<span style="color:var(--text-3);font-size:13px">学完标准：所有示例都运行过、练习独立完成。</span>' +
      '</div>' +
      '<div class="pager">' +
        (prev ? '<a href="#/course/' + prev.id + '"><small>上一课</small>' + esc(prev.title) + '</a>' : '<a href="#/"><small>返回</small>课程总览</a>') +
        (next ? '<a class="next" href="#/course/' + next.id + '"><small>下一课</small>' + esc(next.title) + '</a>'
              : '<a class="next" href="#/plan"><small>继续</small>路线与方法 →</a>') +
      '</div>';

    document.getElementById('btnDone').onclick = () => {
      DB.done[c.id] = !DB.done[c.id];
      save(); renderMenu(); renderCourse(cid); window.scrollTo(0, 0);
    };
  }

  /* ---------------- 页面：速查表 ---------------- */
  function renderCheatsheet() {
    view.innerHTML =
      '<h1 class="page">Python 速查表</h1>' +
      '<p class="page-sub">高频语法与方法的一页纸索引。用过的才算记住——别背，写代码时来查。</p>' +
      CHEATS.map(g =>
        '<h2 class="sec">' + esc(g.cat) + '</h2>' +
        '<table class="sheet"><tr><th style="width:42%">写法</th><th>说明</th></tr>' +
        g.rows.map(r => '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>').join('') +
        '</table>').join('');
  }

  /* ---------------- 页面：练习场 ---------------- */
  let labCur = 0;
  function renderLab(labIdx) {
    labCur = labIdx || 0;
    const l = LABS[labCur];
    view.innerHTML =
      '<h1 class="page">练习场</h1>' +
      '<p class="page-sub">由 Pyodide 提供真实的 Python 3 环境，首次运行需联网加载约 10MB。课程里的每个示例也能「就地运行」或「送去练习场」。</p>' +
      '<div class="lab-wrap">' +
        '<div class="lab-side"><div class="ls-t">练习题</div>' +
          LABS.map((x, i) => '<div data-lab="' + i + '"' + (i === labCur ? ' class="on"' : '') + '>' + (i + 1) + '. ' + esc(x.title) + '</div>').join('') +
        '</div>' +
        '<div class="lab-main">' +
          '<h3 class="sub">' + esc(l.title) + '</h3>' +
          '<p style="color:var(--text-2);margin:6px 0 12px">' + esc(l.q) + '</p>' +
          '<textarea class="code" id="labCode" spellcheck="false"></textarea>' +
          '<div style="margin:12px 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center">' +
            '<button class="btn btn-p" id="btnLabRun">▶ 运行</button>' +
            '<button class="btn btn-s" id="btnLabTest">运行自检</button>' +
            '<button class="btn btn-s" id="btnLabHint">看提示</button>' +
            '<button class="btn btn-s" id="btnLabReset">重置代码</button>' +
            '<span id="labState" style="color:var(--text-3);font-size:12.5px"></span>' +
          '</div>' +
          '<div class="lab-out hidden" id="labOut"><span class="grey">输出区域</span></div>' +
          '<div class="callout co-info hidden" id="labHint"></div>' +
        '</div>' +
      '</div>';

    const ta = document.getElementById('labCode'), out = document.getElementById('labOut'),
          hint = document.getElementById('labHint'), state = document.getElementById('labState');
    ta.value = l.code;
    out.classList.add('hidden');

    document.querySelectorAll('[data-lab]').forEach(d => d.onclick = () => renderLab(+d.dataset.lab));
    document.getElementById('btnLabRun').onclick = () => PyLab.runInline(ta.value, out, state);
    document.getElementById('btnLabTest').onclick = () => PyLab.runInline(ta.value + '\n' + l.test, out, state);
    document.getElementById('btnLabReset').onclick = () => { ta.value = l.code; out.classList.add('hidden'); };
    document.getElementById('btnLabHint').onclick = () => {
      hint.textContent = '提示：' + l.hint;
      hint.classList.toggle('hidden');
    };
  }

  /* ---------------- 页面：资源 ---------------- */
  function renderResources() {
    view.innerHTML =
      '<h1 class="page">资源库</h1>' +
      '<p class="page-sub">长期维护、可免费使用的公开资源。原则是「一主一辅一练」：一套主线教程 + 一个视频补充 + 一个练习平台每天动手。</p>' +
      RES.map(g =>
        '<h2 class="sec">' + esc(g.cat) + '</h2><div class="grid g3">' +
        g.items.map(i =>
          '<a class="card" href="' + esc(i.u) + '" target="_blank" rel="noopener">' +
          '<h4>' + esc(i.n) + '<span class="chip purple" style="margin-left:auto">' + esc(i.t) + '</span></h4>' +
          '<p>' + esc(i.d) + '</p></a>').join('') +
        '</div>').join('') +
      '<p class="foot">链接收集于 2026 年 9 月，如失效请告诉我更新。</p>';
  }

  /* ---------------- 页面：路线与方法 ---------------- */
  function renderPlan() {
    view.innerHTML =
      '<h1 class="page">学习路线与方法</h1>' +
      '<p class="page-sub">课程解决「学什么」，这一页解决「怎么学、按什么节奏学」。</p>' +
      '<h2 class="sec">26 周路线图</h2>' +
      '<div class="tl">' + ROADMAP.map(r =>
        '<div class="tl-item"><h4>' + r.no + ' · ' + esc(r.t) + '</h4>' +
        '<div class="tl-meta">' + esc(r.meta) + '</div><p>' + esc(r.d) + '</p></div>').join('') +
      '</div>' +
      '<h2 class="sec">每周节奏（以每天 1.5 小时计）</h2>' +
      '<table class="sheet"><tr><th>时间</th><th>做什么</th></tr>' +
      '<tr><td>周一 / 三 / 五</td><td>新知识输入：30 分钟读课程 + 60 分钟把每个示例亲手跑一遍并改坏一次</td></tr>' +
      '<tr><td>周二 / 四</td><td>做本课练习，卡住不超过 20 分钟，看提示后关掉自己重写</td></tr>' +
      '<tr><td>周六</td><td>小综合：把本周知识组合起来解决一个自己生活里的小问题</td></tr>' +
      '<tr><td>周日</td><td>复盘：写 5 条本周笔记，代码提交 GitHub</td></tr></table>' +
      '<h2 class="sec">6 条硬规则</h2>' +
      '<div class="grid g2">' +
      [['必须手敲', '复制粘贴的代码不属于你。每个示例自己敲一遍并故意改坏一次。'],
       ['20 分钟法则', '卡住 20 分钟就去搜报错 / 看提示，不要死磕到怀疑人生。'],
       ['先跑通再优雅', '第一版能跑就行，第二版再重构，不要边写边追求完美。'],
       ['学以致用', '每学完一课，找一个自己生活里的场景用上（记账、改名、抓数据）。'],
       ['读懂报错', '从最后一行往上读，复制报错信息搜索——这是最高频的核心技能。'],
       ['公开记录', '把代码传 GitHub，哪怕很烂。连续提交的记录本身就是简历。']]
      .map(p => '<div class="card"><h4>' + p[0] + '</h4><p>' + p[1] + '</p></div>').join('') +
      '</div>' +
      '<h2 class="sec">新手最常踩的 8 个坑</h2>' +
      '<table class="sheet"><tr><th>坑</th><th>解法</th></tr>' +
      [['装环境折腾一整天', '先用本站练习场跑起来，环境以后用 uv 五分钟搞定'],
       ['教程换了一个又一个', '选定一套主线（本站课程 + 一本书）啃完 S3 再说'],
       ['只看不写', '看 1 小时代码不如写 20 分钟'],
       ['过早刷算法题', 'S2 学完再碰 LeetCode，否则只剩挫败感'],
       ['追求最新框架', '概念是通用的，用稳定版'],
       ['不写注释和 README', '三天后自己也看不懂'],
       ['害怕英文资料', '官方文档有中文版，先中文后英文，逐步过渡'],
       ['想同时学三个方向', 'Web / 数据 / 自动化先选一条走深']].map(r =>
        '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') +
      '</table>' +
      '<h2 class="sec">工具链</h2>' +
      '<table class="sheet"><tr><th>用途</th><th>推荐</th><th>说明</th></tr>' +
      [['Python 版本', '3.12 / 3.13 稳定版', 'python.org 下载；Windows 勾选 Add to PATH'],
       ['环境管理', 'uv（首选）', 'uv venv + uv pip install，或 uv init 项目化'],
       ['编辑器', 'VS Code', 'Python + Pylance + Code Runner 插件'],
       ['交互环境', 'Jupyter / Colab', '数据分析、试代码片段'],
       ['版本管理', 'Git + GitHub', '从 S3 起每天 commit'],
       ['查资料', '官方文档 + Stack Overflow', '报错整段复制去搜']]
      .map(r => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('') +
      '</table>';
  }

  /* ---------------- 路由 ---------------- */
  function route() {
    const h = location.hash || '#/';
    const parts = h.slice(2).split('/');
    document.querySelectorAll('nav#menu a').forEach(a => a.classList.remove('on'));
    const page = parts[0] || 'home';

    if (page === '' || page === 'home') { renderHome(); mark('home'); }
    else if (page === 'course' && parts[1]) {
      renderCourse(parts[1]);
      document.querySelectorAll('nav#menu a[data-cid]').forEach(a =>
        a.classList.toggle('on', a.dataset.cid === parts[1]));
    }
    else if (page === 'cheatsheet') { renderCheatsheet(); mark('cheatsheet'); }
    else if (page === 'lab') { renderLab(); mark('lab'); }
    else if (page === 'resources') { renderResources(); mark('resources'); }
    else if (page === 'plan') { renderPlan(); mark('plan'); }
    else renderHome();
    window.scrollTo(0, 0);
  }
  function mark(r) {
    const el = document.querySelector('nav#menu a[data-r="' + r + '"]') ||
               document.querySelector('nav#menu a[href="#/' + r + '"]');
    if (el) el.classList.add('on');
  }
  window.addEventListener('hashchange', route);

  /* ---------------- 全局事件委托：代码块按钮 ---------------- */
  view.addEventListener('click', function (e) {
    const btn = e.target.closest('.cb-btn');
    if (!btn) return;
    const blk = btn.closest('.codeblk');
    const code = CODES[+blk.dataset.ci];
    const act = btn.dataset.act;

    if (act === 'copy') {
      copyText(code).then(ok => {
        btn.textContent = ok ? '已复制' : '复制失败';
        setTimeout(() => btn.textContent = '复制', 1400);
      });
    } else if (act === 'run') {
      let out = blk.parentElement.querySelector('.run-output-of-' + blk.dataset.ci);
      if (!out) {
        out = document.createElement('div');
        out.className = 'out-line run-output-of-' + blk.dataset.ci;
        blk.after(out);
      } else out.style.display = 'block';
      btn.textContent = '…运行中';
      PyLab.runInline(code, out).finally(() => btn.textContent = '▶ 运行');
    } else if (act === 'tolab') {
      sessionStorage.setItem('labCode', code);
      location.hash = '#/lab';
    }
  });

  /* 练习勾选 */
  view.addEventListener('change', function (e) {
    if (e.target.matches('input[data-exid]')) {
      DB.ex[e.target.dataset.exid] = e.target.checked;
      save(); updateSideProgress();
      const det = e.target.closest('details.ex');
      if (det) det.classList.toggle('done-ex', e.target.checked);
    }
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => fallback());
    }
    return Promise.resolve(fallback());
    function fallback() {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand('copy');
        ta.remove(); return ok;
      } catch (e) { return false; }
    }
  }

  /* 送去练习场：进入 lab 页后填入代码 */
  const _origRenderLab = renderLab;
  renderLab = function (idx) {
    _origRenderLab(idx);
    const pending = sessionStorage.getItem('labCode');
    if (pending !== null) {
      sessionStorage.removeItem('labCode');
      const ta = document.getElementById('labCode');
      if (ta) ta.value = pending;
    }
  };

  /* ---------------- 导入导出 ---------------- */
  document.getElementById('btnExport').onclick = () => {
    const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pyacademy-progress.json';
    a.click();
  };
  document.getElementById('btnImport').onclick = () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json';
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          DB = Object.assign({ done: {}, ex: {}, open: {} }, JSON.parse(r.result));
          save(); renderMenu(); route(); alert('导入成功');
        } catch (e) { alert('文件格式不对'); }
      };
      r.readAsText(f);
    };
    inp.click();
  };

  /* ---------------- 移动端菜单 ---------------- */
  const sidebar = document.getElementById('sidebar'), mask = document.getElementById('mask');
  document.getElementById('fabMenu').onclick = () => {
    sidebar.classList.toggle('open'); mask.classList.toggle('show');
  };
  mask.onclick = () => { sidebar.classList.remove('open'); mask.classList.remove('show'); };
  document.getElementById('menu').addEventListener('click', e => {
    if (e.target.closest('a')) { sidebar.classList.remove('open'); mask.classList.remove('show'); }
  });

  /* 启动 */
  renderMenu();
  route();
})();
