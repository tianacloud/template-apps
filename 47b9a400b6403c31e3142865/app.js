/* ══════════════════════════════════════════════════════════════
   1024 · CODE COSMOS  —  app.js
   零外部依赖 · 原生 Canvas / DOM / Web API
   ══════════════════════════════════════════════════════════════ */
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* 确定性的伪随机（按昵称生成稳定星图/证书） */
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toast = (() => {
  const el = $('#toast'); let timer;
  return (msg) => {
    el.textContent = msg; el.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => el.classList.remove('show'), 2600);
  };
})();

/* ═══════════ 1. 启动加载屏 ═══════════ */
(function boot() {
  const bar = $('#bootBar'), pct = $('#bootPct'), msg = $('#bootMsg'), boot = $('#boot');
  const msgs = [
    '> initializing cosmos ...',
    '> linking 1024 particles ...',
    '> compiling dreams.ts ...',
    '> deploying to planet://earth ...',
    '> 0 error(s), 0 warning(s) ✔',
  ];
  let p = 0, mi = 0;
  document.body.classList.add('locked');
  const t = setInterval(() => {
    p += Math.random() * 13 + 4;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    pct.textContent = Math.floor(p);
    const idx = Math.min(msgs.length - 1, Math.floor(p / 100 * msgs.length));
    if (idx !== mi) { mi = idx; msg.textContent = msgs[idx]; }
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => {
        boot.classList.add('done');
        document.body.classList.remove('locked');
        startCosmos(); startRain(); startTyping();
      }, 360);
    }
  }, 130);
})();

/* ═══════════ 2. 二进制矩阵雨 ═══════════ */
function startRain() {
  const cv = $('#rain'); const ctx = cv.getContext('2d');
  const FONT = 14; let cols, drops, W, H;
  const GLYPHS = '01ｱｲｳｴｵｶｷｸ<>{}[]/\\=#+$*'.split('');

  function resize() {
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    cols = Math.floor(W / (FONT * DPR));
    drops = new Array(cols).fill(0).map(() => Math.random() * -H);
  }
  resize(); addEventListener('resize', resize);

  function frame() {
    ctx.fillStyle = 'rgba(5,7,13,0.10)';
    ctx.fillRect(0, 0, W, H);
    ctx.font = (FONT * DPR) + 'px monospace';
    for (let i = 0; i < cols; i++) {
      const x = i * FONT * DPR;
      const y = drops[i];
      const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      const head = (Math.random() > 0.975);
      ctx.fillStyle = head ? '#9ff7ff' : `rgba(${34 + Math.random() * 60 | 0},${211},${238},${0.55})`;
      ctx.fillText(ch, x, y);
      drops[i] += FONT * DPR * (0.7 + Math.random() * 0.6);
      if (drops[i] > H && Math.random() > 0.975) drops[i] = Math.random() * -200 * DPR;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ═══════════ 3. 3D 粒子星系（手写透视投影） ═══════════ */
let cosmosStarted = false;
function startCosmos() {
  if (cosmosStarted) return; cosmosStarted = true;
  const cv = $('#cosmos'); const ctx = cv.getContext('2d');
  let W, H, cx, cy, projR;
  const N = 1024;
  const pts = [];

  // 斐波那契球面分布 + 赤道光环
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push({
      x: Math.cos(th) * r + (Math.random() - .5) * .04,
      y: y + (Math.random() - .5) * .04,
      z: Math.sin(th) * r + (Math.random() - .5) * .04,
      ring: false,
    });
  }
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, rr = 1.28 + Math.random() * .12;
    pts.push({ x: Math.cos(a) * rr, y: (Math.random() - .5) * .22, z: Math.sin(a) * rr, ring: true });
  }

  function resize() {
    const rect = cv.getBoundingClientRect();
    W = cv.width = rect.width * DPR; H = cv.height = rect.height * DPR;
    cx = W / 2; cy = H / 2; projR = Math.min(W, H) * 0.36;
  }
  resize(); addEventListener('resize', resize);

  let rotY = 0, rotX = -0.25, tRotY = 0, tRotX = -0.25, auto = 0.0016;
  let dragging = false, lx = 0, ly = 0;

  addEventListener('mousemove', (e) => {
    const nx = (e.clientX / innerWidth - .5), ny = (e.clientY / innerHeight - .5);
    if (!dragging) { tRotY = nx * 0.6; tRotX = -0.25 + ny * 0.45; }
  });
  cv.addEventListener('pointerdown', (e) => { dragging = true; lx = e.clientX; ly = e.clientY; });
  addEventListener('pointerup', () => dragging = false);
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lx) * 0.005; rotX += (e.clientY - ly) * 0.005;
    tRotY = rotY; tRotX = rotX; lx = e.clientX; ly = e.clientY;
  });

  const FOV = 3.2;
  const palette = (f) => {
    if (f < 0.5) { const t = f / 0.5; return [lerp(167, 34, t) | 0, lerp(139, 211, t) | 0, lerp(250, 238, t) | 0]; }
    const t = (f - 0.5) / 0.5; return [lerp(34, 255, t) | 0, lerp(211, 255, t) | 0, lerp(238, 255, t) | 0];
  };

  function frame() {
    ctx.clearRect(0, 0, W, H);
    rotY += (tRotY - rotY) * 0.05 + auto;
    rotX += (tRotX - rotX) * 0.05;
    const cY = Math.cos(rotY), sY = Math.sin(rotY);
    const cX = Math.cos(rotX), sX = Math.sin(rotX);
    ctx.globalCompositeOperation = 'lighter';

    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      let x = p.x * cY + p.z * sY;
      let z = -p.x * sY + p.z * cY;
      let y = p.y * cX - z * sX;
      z = p.y * sX + z * cX;
      const scale = FOV / (FOV + z);
      const sx = cx + x * scale * projR;
      const sy = cy + y * scale * projR;
      const front = clamp((1.3 - z) / 2.6, 0, 1);
      const [r, g, b] = palette(front);
      const sz = (p.ring ? 1.6 : 1.1) + front * 2.4;
      ctx.globalAlpha = 0.22 + front * 0.78;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sz * DPR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ═══════════ 4. 导航 & 滚动揭示 ═══════════ */
(function nav() {
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 40), { passive: true });
})();

const io = new IntersectionObserver((es) => {
  es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.16 });
$$('.reveal').forEach((el) => io.observe(el));

/* ═══════════ 5. 数字圣殿计数 ═══════════ */
(function counters() {
  const sec = $('#sanctum');
  let done = false;
  const o = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting || done) return; done = true;
      $$('.num-value', sec).forEach((el) => {
        const cnt = el.dataset.count;
        if (cnt) {
          const target = +cnt, t0 = performance.now(), dur = 1400;
          const step = (t) => {
            const k = clamp((t - t0) / dur, 0, 1);
            const e2 = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * e2).toLocaleString();
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        } else {
          const txt = el.dataset.static; let i = 0;
          const tick = () => { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(tick, 45); };
          tick();
        }
      });
    });
  }, { threshold: 0.4 });
  o.observe(sec);
})();

/* ═══════════ 6. Hero 打字机 ═══════════ */
function startTyping() {
  const el = $('#typed');
  const text = '致敬每一位用代码改变世界的造物者 —— Hello, World!';
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, 55 + Math.random() * 60);
  };
  setTimeout(tick, 500);
}

/* ═══════════ 7. 物种鉴定 ═══════════ */
(function quiz() {
  const Q = [
    {
      q: '凌晨两点，生产环境告警。你的第一反应是？',
      dim: 'DEBUG 人格',
      opts: [
        ['打开日志，一行行翻', { backend: 2, ops: 1 }],
        ['先看监控面板曲线', { fullstack: 2, backend: 1 }],
        ['在群里发句"我看看"然后重启大法', { ops: 3 }],
        ['把报错丢给 AI 让它分析', { ai: 3 }],
      ],
    },
    {
      q: '最让你头皮发麻的代码是？',
      dim: '审美洁癖',
      opts: [
        ['没有注释的祖传面条代码', { backend: 2, fullstack: 1 }],
        ['!important 满天飞的 CSS', { frontend: 3 }],
        ['O(n³) 的三层嵌套循环', { algo: 3 }],
        ['变量名叫 a / b / tmp2', { fullstack: 2, ai: 1 }],
      ],
    },
    {
      q: '你的 IDE 主题永远选？',
      dim: '氛围流派',
      opts: [
        ['纯黑 · 越暗越爽', { backend: 2, algo: 1 }],
        ['半透明毛玻璃质感', { frontend: 3 }],
        ['官方默认 · 懒得改', { fullstack: 2, ops: 1 }],
        ['跟着 AI 推荐的来', { ai: 3 }],
      ],
    },
    {
      q: '新需求来了，你先做哪一步？',
      dim: '开工姿势',
      opts: [
        ['画原型 / 定交互', { frontend: 3 }],
        ['设计数据库表结构', { backend: 3 }],
        ['推演最优算法', { algo: 3 }],
        ['让 AI 写一版我再改', { ai: 3 }],
      ],
    },
    {
      q: '你 debug 的终极武器是？',
      dim: '排错哲学',
      opts: [
        ['console.log 大法好', { frontend: 2, fullstack: 1 }],
        ['断点单步 + 调用栈', { backend: 2, algo: 1 }],
        ['二分注释法，精准定位', { algo: 3 }],
        ['删了重写，一了百了', { ops: 2, ai: 1 }],
      ],
    },
  ];

  const SPECIES = {
    frontend: { emoji: '🪄', title: '前端炼金术士', slogan: '把像素与动效炼成魔法，浏览器在你手里听话。',
      skills: [['像素对齐', 92], ['动效魔法', 88], ['浏览器兼容', 71]],
      code: 'render(dream).then(shine);  // 你让界面会呼吸' },
    backend: { emoji: '🛡️', title: '后端守夜人', slogan: '你在深夜守住每一根连接，世界才得以连续运转。',
      skills: [['并发抗压', 95], ['SQL 调优', 90], ['日志考古', 86]],
      code: 'while (req) serve().await;  // 灯一直亮着' },
    algo: { emoji: '🧘', title: '算法苦行僧', slogan: '在复杂度里修行，O(1) 是你的禅。',
      skills: [['复杂度直觉', 97], ['位运算', 91], ['手搓红黑树', 80]],
      code: 'if (O(n) > love) optimize();  // 没有退而求其次' },
    ops: { emoji: '🐟', title: '运维摸鱼侠', slogan: '重启治百病，甩锅有艺术，脚本帮你偷偷划水。',
      skills: [['重启大法', 99], ['甩锅防御', 85], ['自动化脚本', 78]],
      code: 'cron.fish() || reboot();  // 系统稳，人轻松' },
    ai: { emoji: '🤖', title: 'AI 驯兽师', slogan: '你写提示词，AI 写代码，幻觉你一眼识破。',
      skills: [['提示词工程', 96], ['幻觉识别', 89], ['算力调度', 83]],
      code: 'model.prompt(you).verify();  // 不迷信，只驾驭' },
    fullstack: { emoji: '🦄', title: '全栈独角兽', slogan: '前后通吃，需求翻译，熬夜续航样样全能。',
      skills: [['前后通吃', 93], ['需求翻译', 87], ['熬夜续航', 82]],
      code: 'build().then(deploy).then(changeWorld);' },
  };

  const stage = $('#quizStage'), result = $('#quizResult');
  const qEl = $('#quizQ'), optEl = $('#quizOptions'), barEl = $('#quizBar');
  const stepEl = $('#quizStep'), dimEl = $('#quizDim');
  let i = 0; const score = {};

  function render() {
    const item = Q[i];
    stepEl.textContent = `Q${i + 1} / ${Q.length}`;
    dimEl.textContent = item.dim;
    barEl.style.width = ((i) / Q.length * 100 + 20) + '%';
    qEl.textContent = item.q;
    optEl.innerHTML = '';
    item.opts.forEach(([label, w], idx) => {
      const b = document.createElement('button');
      b.className = 'opt fade-swap';
      b.innerHTML = `<b>${String.fromCharCode(65 + idx)}</b>${label}`;
      b.onclick = () => {
        Object.entries(w).forEach(([k, v]) => score[k] = (score[k] || 0) + v);
        i++;
        if (i < Q.length) render(); else finish();
      };
      optEl.appendChild(b);
    });
  }

  function finish() {
    barEl.style.width = '100%';
    let best = 'fullstack', max = -1;
    Object.entries(score).forEach(([k, v]) => { if (v > max) { max = v; best = k; } });
    const sp = SPECIES[best];
    $('#resEmoji').textContent = sp.emoji;
    $('#resTitle').textContent = sp.title;
    $('#resSlogan').textContent = sp.slogan;
    $('#resCode').textContent = sp.code;
    const sk = $('#resSkills'); sk.innerHTML = '';
    sp.skills.forEach(([name, val]) => {
      const d = document.createElement('div'); d.className = 'skill';
      d.innerHTML = `<div class="skill-top"><span>${name}</span><b>${val}</b></div><div class="skill-bar"><i></i></div>`;
      sk.appendChild(d);
      requestAnimationFrame(() => setTimeout(() => d.querySelector('i').style.width = val + '%', 80));
    });
    stage.hidden = true; result.hidden = false;
    window.__species = sp.title;
  }

  function reset() {
    i = 0; for (const k in score) delete score[k];
    result.hidden = true; stage.hidden = false; render();
  }
  $('#quizRetry').onclick = reset;
  $('#quizToForge').onclick = () => {
    $('#forgeName').focus();
    const chip = $$('.chip').find((c) => c.dataset.sp === (window.__species || '全栈独角兽'));
    if (chip) chip.click();
    $('#forge').scrollIntoView({ behavior: 'smooth' });
  };
  render();
})();

/* ═══════════ 8. 代码诗生成器 ═══════════ */
(function poem() {
  const NAME_POOL = ['star', 'you', 'dev', 'world', 'hero', 'dream', 'code', 'light'];
  const ACTIONS = ['compile();', 'deploy();', 'refactor();', 'commit();', 'push();', 'debug();', 'dream();', 'shine();', 'build();', 'ship();'];
  const COMMENTS = [
    '// 你是运行在世界上的最优解',
    '// 所有的 bug 都会绕开你',
    '// 你的代码，是这个时代的情书',
    '// 编译通过的不只是代码，还有理想',
    '// 愿你写的每一行，都被世界温柔执行',
    '// 你的 commit，是这个星球的节拍',
    '// 0 error(s), 0 warning(s), 1 个不灭的梦',
    '// 如果世界是开源的，你一定是核心贡献者',
    '// 你调试的从来不是程序，是生活',
    '// 1024 个 bit，装得下一整个宇宙',
  ];

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function highlight(src) {
    let s = escapeHtml(src);
    s = s.replace(/\b(const|let|var|function|return|while|if|else|for|new|true|false|null|of|in)\b/g, '<span class="k">$1</span>');
    s = s.replace(/\b([a-zA-Z_$][\w$]*)(?=\s*\()/g, '<span class="f">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="n">$1</span>');
    s = s.replace(/(&quot;[^&]*?&quot;)/g, '<span class="s">$1</span>');
    s = s.replace(/(\/\/[^\n]*)/g, '<span class="c">$1</span>');
    return s;
  }

  function build(name, wish) {
    const rnd = mulberry32(hashStr(name + wish + Date.now()));
    const pick = (a) => a[(rnd() * a.length) | 0];
    const obj = pick(NAME_POOL);
    const w = wish.trim() || '愿世界少一点 bug，多一点光';
    const a1 = pick(ACTIONS), a2 = pick(ACTIONS);
    const c1 = pick(COMMENTS), c2 = pick(COMMENTS);
    return [
      `// 致 ${name} —— 一首能编译通过的情诗`,
      `const ${obj} = {`,
      `  name: "${name}",`,
      `  wish: "${w}",`,
      `  level: 1024,`,
      `  bugs: 0,`,
      `};`,
      ``,
      `while (world.needs(${obj})) {`,
      `  ${a1}`,
      `  ${a2}        ${c1}`,
      `}`,
      ``,
      `${c2}`,
      `console.log("你好，" + ${obj}.name + " · 愿你 ∞ 无 bug");`,
    ].join('\n');
  }

  const out = $('#poemCode'), copyBtn = $('#poemCopy');
  let full = '', ti = 0, timer = null;

  function typeOut() {
    clearInterval(timer); ti = 0;
    timer = setInterval(() => {
      out.innerHTML = highlight(full.slice(0, ++ti));
      if (ti >= full.length) clearInterval(timer);
    }, 14);
  }

  $('#poemBtn').onclick = () => {
    const name = ($('#poemName').value.trim() || 'anonymous');
    const wish = $('#poemWish').value;
    full = build(name, wish);
    typeOut();
    toast('已生成专属代码诗 ✦ 致敬 ' + name);
  };

  copyBtn.onclick = () => {
    if (!full) { toast('先生成一首代码诗吧'); return; }
    copyBtn.classList.add('ok'); copyBtn.textContent = '已复制';
    const done = () => setTimeout(() => { copyBtn.classList.remove('ok'); copyBtn.textContent = '复制'; }, 1500);
    if (navigator.clipboard) navigator.clipboard.writeText(full).then(done, done);
    else done();
  };

  // 预填示例
  $('#poemName').value = 'Ada';
})();

/* ═══════════ 9. 造物铸造厂：热力图 + 证书 ═══════════ */
(function forge() {
  const COLS = 53, ROWS = 7;
  let species = '全栈独角兽';
  $$('.chip').forEach((c) => c.onclick = () => { $$('.chip').forEach((x) => x.classList.remove('active')); c.classList.add('active'); species = c.dataset.sp; });

  // —— 热力星图 ——
  const hc = $('#heatmap'), hx = hc.getContext('2d');
  const HW = hc.width, HH = hc.height;
  const lvlColors = ['#111823', '#0e4a5c', '#12798a', '#22d3ee', '#7ff0ff'];

  function drawHeat(name) {
    const rnd = mulberry32(hashStr('heat-' + name));
    const cell = 15, gap = 3, padX = (HW - (COLS * cell + (COLS - 1) * gap)) / 2;
    const padY = (HH - (ROWS * cell + (ROWS - 1) * gap)) / 2;
    hx.clearRect(0, 0, HW, HH);
    let total = 0, streak = 0, best = 0, cur = 0;
    const grid = [];
    for (let c = 0; c < COLS; c++) {
      const col = [];
      for (let r = 0; r < ROWS; r++) {
        const base = rnd();
        let lv = base < 0.46 ? 0 : base < 0.66 ? 1 : base < 0.82 ? 2 : base < 0.93 ? 3 : 4;
        // 制造一条"连击"轨迹
        col.push(lv);
        total += lv * (1 + (rnd() * 3 | 0));
      }
      grid.push(col);
    }
    // 计算最长连击（按列序逐格）
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      if (grid[c][r] > 0) { cur++; if (cur > streak) streak = cur; } else cur = 0;
      if (grid[c][r] > best) best = grid[c][r];
    }
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
      const x = padX + c * (cell + gap), y = padY + r * (cell + gap);
      hx.fillStyle = lvlColors[grid[c][r]];
      roundRect(hx, x, y, cell, cell, 3); hx.fill();
    }
    return { total, streak, best: best * 4 + (best ? 3 : 0) };
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // —— 证书 ——
  const cc = $('#cert'), cx2 = cc.getContext('2d');
  const CW = cc.width, CH = cc.height;

  function drawCert(name, stats) {
    const rnd = mulberry32(hashStr('cert-' + name));
    // 背景
    const bg = cx2.createLinearGradient(0, 0, CW, CH);
    bg.addColorStop(0, '#070b15'); bg.addColorStop(0.5, '#0a1120'); bg.addColorStop(1, '#0b0f1c');
    cx2.fillStyle = bg; cx2.fillRect(0, 0, CW, CH);
    // 星点
    for (let i = 0; i < 140; i++) {
      const x = rnd() * CW, y = rnd() * CH, a = rnd() * 0.5 + 0.05, s = rnd() * 1.6 + 0.3;
      cx2.fillStyle = `rgba(${180 + rnd() * 60 | 0},${220},${255},${a})`;
      cx2.beginPath(); cx2.arc(x, y, s, 0, 7); cx2.fill();
    }
    // 巨型 1024 水印
    cx2.save();
    cx2.font = '900 360px "JetBrains Mono",monospace';
    cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
    const grd = cx2.createLinearGradient(0, CH / 2 - 180, 0, CH / 2 + 180);
    grd.addColorStop(0, 'rgba(34,211,238,0.10)'); grd.addColorStop(1, 'rgba(167,139,250,0.10)');
    cx2.fillStyle = grd; cx2.fillText('1024', CW / 2, CH / 2 + 10);
    cx2.restore();
    // 边框
    cx2.strokeStyle = 'rgba(34,211,238,0.55)'; cx2.lineWidth = 2;
    roundRect(cx2, 26, 26, CW - 52, CH - 52, 22); cx2.stroke();
    cx2.strokeStyle = 'rgba(167,139,250,0.30)'; cx2.lineWidth = 1;
    roundRect(cx2, 36, 36, CW - 72, CH - 72, 18); cx2.stroke();

    // 头部
    cx2.textAlign = 'left'; cx2.textBaseline = 'alphabetic';
    cx2.fillStyle = '#22d3ee'; cx2.font = '600 22px "JetBrains Mono",monospace';
    cx2.fillText('1024 · CODE COSMOS', 70, 90);
    cx2.fillStyle = '#8b98ab'; cx2.font = '14px "JetBrains Mono",monospace';
    cx2.fillText('CERTIFICATE OF CODE · 造物者证书', 70, 116);

    // 副标题
    cx2.fillStyle = '#8b98ab'; cx2.font = '16px sans-serif';
    cx2.fillText('兹证明以下造物者，在过去一年里持续向世界提交美好：', 70, 200);

    // 名字
    cx2.fillStyle = '#ffffff';
    cx2.font = '800 64px sans-serif';
    cx2.fillText(name, 70, 280);
    // 称号胶囊
    cx2.fillStyle = 'rgba(34,211,238,0.12)';
    roundRect(cx2, 70, 305, cx2.measureText(species).width + 60, 44, 22); cx2.fill();
    cx2.strokeStyle = 'rgba(34,211,238,0.6)'; cx2.lineWidth = 1; cx2.stroke();
    cx2.fillStyle = '#22d3ee'; cx2.font = '600 22px sans-serif';
    cx2.fillText('称号 · ' + species, 92, 335);

    // 统计
    const sArr = [['全年提交', stats.total], ['最长连击', stats.streak], ['单日峰值', stats.best]];
    sArr.forEach((s, i) => {
      const x = 70 + i * 330;
      cx2.fillStyle = '#22d3ee'; cx2.font = '800 46px "JetBrains Mono",monospace';
      cx2.fillText(String(s[1]), x, 430);
      cx2.fillStyle = '#8b98ab'; cx2.font = '14px sans-serif';
      cx2.fillText(s[0], x, 458);
    });

    // 签名代码
    cx2.fillStyle = '#a3e635'; cx2.font = '20px "JetBrains Mono",monospace';
    cx2.fillText('> while (alive) { build(); deploy(); }', 70, 520);

    // 底部
    const date = new Date().toISOString().slice(0, 10);
    cx2.fillStyle = '#8b98ab'; cx2.font = '14px "JetBrains Mono",monospace';
    cx2.fillText('ISSUED ' + date + ' · CODE COSMOS', 70, CH - 56);
    // 印章
    cx2.save();
    cx2.translate(CW - 130, CH - 120);
    cx2.strokeStyle = 'rgba(244,114,182,0.8)'; cx2.lineWidth = 3;
    cx2.beginPath(); cx2.arc(0, 0, 56, 0, 7); cx2.stroke();
    cx2.fillStyle = '#f472b6'; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
    cx2.font = '800 30px "JetBrains Mono",monospace'; cx2.fillText('1024', 0, -6);
    cx2.font = '11px "JetBrains Mono",monospace'; cx2.fillText('VERIFIED', 0, 20);
    cx2.restore();

    $('#certCard').hidden = false;
  }

  function go() {
    const name = ($('#forgeName').value.trim() || 'anonymous');
    const stats = drawHeat(name);
    $('#stTotal').textContent = stats.total.toLocaleString();
    $('#stStreak').textContent = stats.streak;
    $('#stBest').textContent = stats.best;
    $('#forgeStats').hidden = false;
    drawCert(name, stats);
    toast('🎖 证书已铸造 · 致敬 ' + name);
  }
  $('#forgeBtn').onclick = go;

  $('#certDownload').onclick = () => {
    const a = document.createElement('a');
    a.download = '1024-cert-' + ($('#forgeName').value.trim() || 'cosmos') + '.png';
    a.href = cc.toDataURL('image/png');
    a.click();
    toast('证书已下载到本地 ✦');
  };
})();

/* ═══════════ 10. 彩蛋：键盘敲出 1024 ═══════════ */
(function egg() {
  const seq = ['1', '0', '2', '4']; let buf = [];
  addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    buf.push(e.key); if (buf.length > 4) buf.shift();
    if (buf.join('') === seq.join('')) {
      buf = [];
      $('#heroTitle').classList.add('glitch');
      setTimeout(() => $('#heroTitle').classList.remove('glitch'), 1000);
      for (let i = 0; i < 28; i++) spawnSpark();
      toast('✦ 1024 模式已激活 · 你发现了隐藏星门');
    }
  });
  $('#heroTitle').addEventListener('click', () => {
    const t = $('#heroTitle'); t.classList.add('glitch'); setTimeout(() => t.classList.remove('glitch'), 1000);
    for (let i = 0; i < 16; i++) spawnSpark();
  });
  function spawnSpark() {
    const s = document.createElement('div'); s.className = 'spark';
    s.textContent = ['0', '1', '✦', '1024', '</>'][(Math.random() * 5) | 0];
    s.style.left = (innerWidth / 2 + (Math.random() - .5) * 280) + 'px';
    s.style.top = (innerHeight * 0.42 + (Math.random() - .5) * 180) + 'px';
    s.style.setProperty('--dx', ((Math.random() - .5) * 240) + 'px');
    s.style.setProperty('--dy', (-120 - Math.random() * 160) + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
})();
