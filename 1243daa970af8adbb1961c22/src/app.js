/* =========================================================================
 * 环评工程师考试学习小软件 - 交互逻辑
 * 功能：知识点学习 / 刷题测验 / 真题库 / 速查表 / 计算例题 / 标准限值
 * 进度保存在数据库
 * ========================================================================= */
(async function () {
  "use strict";
  const D = window.EIA_DATA;
  const LS = {
    ans: "eia_answered",   // {qIndex: chosenIndex}
    wrong: "eia_wrong",    // [qIndex,...]
    fav: "eia_fav",
  };
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- 刷题题库：合成题 + 真实真题（单选且有答案者） ---------- */
  const QUIZ = buildQuizPool();
  function buildQuizPool() {
    const pool = (D.quiz || []).map(q => Object.assign({}, q, { src: "模拟" }));
    const EXAM = window.EIA_EXAM || [];
    EXAM.forEach(p => {
      if (p.type !== "obj") return;
      (p.questions || []).forEach(q => {
        if (q.noAns) return;                       // 无答案空白卷题留在「真题库」自测
        if ((q.ans || []).length > 1) return;       // 多选留在「真题库」（支持多选提交）
        if (!q.opts || q.opts.length < 2) return;
        const letter = (q.ans && q.ans[0]) || "A";
        const aIdx = letter.charCodeAt(0) - 65;
        if (aIdx < 0 || aIdx >= q.opts.length) return;
        pool.push({
          sub: p.subject, q: q.stem, opts: q.opts, a: aIdx,
          exp: q.expl || "（真题，详见「真题库」解析）",
          src: "真题", year: p.year, srcName: p.subjectName,
        });
      });
    });
    return pool;
  }
  window.EIA_QUIZ = QUIZ; // 暴露调试句柄

  let execute, stored;
  try {
    const c = await window.tiana.connection();
    if (c.sql_api !== 'hrana-v3' || !window.tiana.auth?.getAccessToken) throw Error('数据库连接不可用');
    const fetchSQL = createTianaFetch({origin:c.origin, auth:window.tiana.auth, requestBodyMode:'buffered'});
    execute = async (sql,args=[]) => {
      const r = await fetchSQL(`${c.origin}/v3/pipeline`, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args,want_rows:true}},{type:'close'}]})});
      if (!r.ok) throw Error('数据库请求结果未知');
      const item=(await r.json()).results?.[0];
      if (item?.type !== 'ok' || item.response?.type !== 'execute') throw Error('数据库操作失败');
      return item.response.result;
    };
    stored=Object.fromEntries((await execute('SELECT key, value FROM study_progress')).rows.map(row=>[row[0].value,JSON.parse(row[1].value)]));
  } catch (error) { document.querySelector('#app').textContent='无法加载学习进度，请检查登录与网络后重新打开应用。'; return; }
  function load(key, def) { return stored[key] ?? def; }
  let writes=Promise.resolve(), failed=false;
  function save(key,val) {
    const value=JSON.stringify(val);
    writes=writes.then(async()=>{ if (failed) return false; try { await execute('INSERT INTO study_progress (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[{type:'text',value:key},{type:'text',value}]); return true; } catch { failed=true; alert('进度保存失败，结果可能未知，请重新打开应用核对。'); return false; } });
    return writes;
  }
  const state = {
    ans: load(LS.ans, {}),
    wrong: load(LS.wrong, []),
  };

  /* ---------- 顶栏信息 ---------- */
  $("#appTitle").textContent = D.meta.title;
  $("#appSub").textContent = D.meta.subtitle;
  $("#footMeta").textContent = `${D.meta.version} · 数据来源：${D.meta.source}`;
  function refreshProgressBadge() {
    const total = QUIZ.length;
    const done = Object.keys(state.ans).length;
    $("#progressBadge").textContent = `进度 ${done}/${total}`;
  }

  /* ============================ 视图切换 ============================ */
  function switchView(v) {
    $$(".tab").forEach(x => x.classList.toggle("active", x.dataset.view === v));
    $$(".view").forEach(x => x.classList.remove("active"));
    const el = $("#view-" + v);
    if (el) el.classList.add("active");
    if (v === "home") renderHome();
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  $$(".tab").forEach(t => t.addEventListener("click", () => switchView(t.dataset.view)));

  /* ============================ 学习视图 ============================ */
  let curSubj = D.subjects[0].id;
  function buildSubjectList() {
    const wrap = $("#subjectList");
    wrap.innerHTML = "";
    D.subjects.forEach(s => {
      const b = document.createElement("button");
      b.className = "subj-btn" + (s.id === curSubj ? " active" : "");
      b.innerHTML = `<span class="dot" style="background:${s.color}"></span>${s.name}`;
      b.onclick = () => { curSubj = s.id; buildSubjectList(); renderSubject(s.id); };
      wrap.appendChild(b);
      if (s.id === curSubj) {
        s.sections.forEach(sec => {
          const sb = document.createElement("button");
          sb.className = "sec-btn";
          sb.textContent = sec.title;
          sb.onclick = () => renderSection(s.id, sec.id);
          wrap.appendChild(sb);
        });
      }
    });
  }
  function renderSubject(id) {
    const s = D.subjects.find(x => x.id === id);
    renderSection(id, s.sections[0].id);
  }
  function blockToHTML(b) {
    if (b.t === "p") return `<p>${b.text}</p>`;
    if (b.t === "h") return `<h3>${b.text}</h3>`;
    if (b.t === "ul") return `<ul>${b.items.map(i => `<li>${i}</li>`).join("")}</ul>`;
    if (b.t === "ol") return `<ol>${b.items.map(i => `<li>${i}</li>`).join("")}</ol>`;
    if (b.t === "note") return `<div class="note">${b.text}</div>`;
    if (b.t === "table") {
      const head = `<tr>${b.head.map(h => `<th>${h}</th>`).join("")}</tr>`;
      const rows = b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
      return `<table class="kb">${head}${rows}</table>`;
    }
    return "";
  }
  function renderSection(subjId, secId) {
    const s = D.subjects.find(x => x.id === subjId);
    const sec = s.sections.find(x => x.id === secId);
    $$(".sec-btn").forEach(b => {
      // 高亮逻辑用文本匹配（简单可靠）
    });
    const html =
      `<h2>${sec.title}</h2>` +
      `<div class="sub-desc">${s.name} · ${s.desc}</div>` +
      sec.blocks.map(blockToHTML).join("");
    const c = $("#learnContent");
    c.innerHTML = html;
    c.scrollTop = 0;
    // 高亮当前章节按钮
    const secBtns = $$(".sec-btn");
    // 用标题文本匹配高亮
    secBtns.forEach(b => {
      b.classList.toggle("active", b.textContent === sec.title);
    });
  }

  /* ============================ 刷题视图 ============================ */
  let quizFilter = "all";   // all / 科目id
  let quizSrc = "all";      // all / 模拟 / 真题
  let quizOrder = [];       // 题目顺序（索引）
  let quizPos = 0;
  let quizLocked = false;

  function buildQuizBar() {
    const bar = $("#quizBar");
    const filters = [{ id: "all", name: "全部科目" }].concat(D.subjects.map(s => ({ id: s.id, name: s.name })));
    bar.innerHTML = "";
    filters.forEach(f => {
      const b = document.createElement("button");
      b.className = "filter" + (quizFilter === f.id ? " active" : "");
      b.textContent = f.name;
      b.onclick = () => { quizFilter = f.id; quizPos = 0; buildQuizBar(); startQuiz(); };
      bar.appendChild(b);
    });
    const sep = document.createElement("span");
    sep.className = "filter-sep";
    sep.textContent = "来源";
    bar.appendChild(sep);
    [{ id: "all", name: "全部" }, { id: "模拟", name: "模拟题" }, { id: "真题", name: "真题" }].forEach(f => {
      const b = document.createElement("button");
      b.className = "filter mini" + (quizSrc === f.id ? " active" : "");
      b.textContent = f.name;
      b.onclick = () => { quizSrc = f.id; quizPos = 0; buildQuizBar(); startQuiz(); };
      bar.appendChild(b);
    });
    const prog = document.createElement("span");
    prog.className = "q-progress";
    bar.appendChild(prog);
  }
  function startQuiz() {
    quizOrder = QUIZ.map((_, i) => i).filter(i =>
      (quizFilter === "all" || QUIZ[i].sub === quizFilter) &&
      (quizSrc === "all" || QUIZ[i].src === quizSrc)
    );
    if (quizOrder.length === 0) { $("#quizWrap").innerHTML = "<p>该筛选暂无题目。</p>"; return; }
    quizPos = 0;
    quizLocked = false;
    renderQuiz();
  }
  function renderQuiz() {
    const wrap = $("#quizWrap");
    const total = quizOrder.length;
    const progEl = $(".q-progress");
    if (progEl) progEl.textContent = `第 ${quizPos + 1} / ${total} 题`;
    if (quizPos >= total) { renderQuizEnd(); return; }

    const qi = quizOrder[quizPos];
    const item = QUIZ[qi];
    const subj = D.subjects.find(x => x.id === item.sub);
    const answered = state.ans.hasOwnProperty(qi);
    const chosen = state.ans[qi];
    const srcTag = item.src === "真题"
      ? `<span class="src-tag exam">真题${item.year ? "·" + item.year : ""}</span>`
      : `<span class="src-tag sim">模拟</span>`;

    let optsHTML = item.opts.map((o, i) => {
      let cls = "opt";
      let key = String.fromCharCode(65 + i);
      if (answered) {
        if (i === item.a) cls += " correct";
        else if (i === chosen) cls += " wrong";
        else cls += " dim";
      }
      return `<div class="${cls}" data-i="${i}"><span class="key">${key}</span><span>${o}</span></div>`;
    }).join("");

    wrap.innerHTML =
      `<div class="q-meta">科目：${subj.name} ${srcTag} · 状态：${answered ? (chosen === item.a ? "已答对" : "已答错") : "未作答"}</div>` +
      `<div class="q-text">${item.q}</div>` +
      `<div class="q-opts">${optsHTML}</div>` +
      `<div class="q-exp ${answered ? "show" : ""}" id="qExp"><b>解析：</b>${item.exp}</div>` +
      `<div class="quiz-actions" id="quizActions"></div>`;

    if (!answered) {
      $$(".opt", wrap).forEach(el => {
        el.onclick = () => chooseAnswer(qi, parseInt(el.dataset.i, 10));
      });
    }
    // 操作按钮
    const acts = $("#quizActions");
    if (!answered) {
      acts.innerHTML = `<span class="q-result" style="color:var(--ink-soft)">请选择答案</span>`;
    } else {
      const ok = chosen === item.a;
      acts.innerHTML =
        `<span class="q-result" style="color:${ok ? "var(--ok)" : "var(--warn)"}">${ok ? "✔ 回答正确" : "✘ 回答错误"}</span>` +
        `<button class="btn primary" id="nextBtn">${quizPos + 1 >= total ? "查看结果" : "下一题 →"}</button>`;
      $("#nextBtn").onclick = () => { quizPos++; quizLocked = false; renderQuiz(); };
    }
  }
  function chooseAnswer(qi, i) {
    if (state.ans.hasOwnProperty(qi)) return;
    state.ans[qi] = i;
    if (i !== QUIZ[qi].a) {
      if (!state.wrong.includes(qi)) state.wrong.push(qi);
    }
    save(LS.ans, state.ans);
    save(LS.wrong, state.wrong);
    refreshProgressBadge();
    renderQuiz();
  }
  function renderQuizEnd() {
    const total = quizOrder.length;
    const doneSet = quizOrder.filter(i => state.ans.hasOwnProperty(i));
    const right = doneSet.filter(i => state.ans[i] === QUIZ[i].a).length;
    const wrongCount = doneSet.length - right;
    $("#quizWrap").innerHTML =
      `<h2 style="margin-bottom:10px">本轮练习结果</h2>` +
      `<div class="q-result">已答 ${doneSet.length}/${total} 题 · 正确 ${right} · 错误 ${wrongCount}</div>` +
      `<p style="color:var(--ink-soft);font-size:13px;margin-top:8px">总进度（全部科目）：${Object.keys(state.ans).length}/${QUIZ.length} 题已作答，错题本 ${state.wrong.length} 题。</p>` +
      `<div class="quiz-actions"><button class="btn primary" id="againBtn">再来一轮</button>` +
      `<button class="btn" id="wrongBtn">只练错题（${state.wrong.length}）</button></div>`;
    $("#againBtn").onclick = () => { quizFilter = "all"; quizPos = 0; buildQuizBar(); startQuiz(); };
    $("#wrongBtn").onclick = () => {
      if (state.wrong.length === 0) { alert("暂无错题，棒！"); return; }
      quizOrder = state.wrong.slice(); quizPos = 0; quizLocked = false; renderQuiz();
    };
  }

  /* ============================ 首页仪表盘 ============================ */
  function ringSVG(pct, size, stroke, color, track) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct / 100)));
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
        transform="rotate(-90 ${size/2} ${size/2})"/>
    </svg>`;
  }
  function renderHome() {
    // 总体掌握度 = 已答对 / 已答
    const answered = Object.keys(state.ans);
    const correct = answered.filter(k => state.ans[k] === QUIZ[k].a).length;
    const mastery = answered.length ? Math.round(correct / answered.length * 100) : 0;
    const examCount = QUIZ.filter(q => q.src === "真题").length;

    // Hero 进度环
    $("#heroRing").innerHTML =
      ringSVG(mastery, 116, 12, "#ffffff", "rgba(255,255,255,.28)") +
      `<div class="ring-val"><b>${mastery}%</b><span>掌握度</span></div>`;
    $("#heroSub").innerHTML =
      `已融合 <b>${QUIZ.length}</b> 道题（真题 ${examCount} 道）· <b>${D.subjects.reduce((a,s)=>a+s.sections.length,0)}</b> 个知识点，点一下就开始，边做题边学，进度自动保存。`;

    // 统计卡
    const stats = [
      { ico: "📚", bg: "#e6f4f1", color: "#0f766e", num: QUIZ.length, lab: "题库总量（含真题）" },
      { ico: "✅", bg: "#ecfdf5", color: "#16a34a", num: answered.length, lab: "已练习题" },
      { ico: "🎯", bg: "#eff6ff", color: "#2563eb", num: correct, lab: "答对题数" },
      { ico: "📕", bg: "#fef2f2", color: "#dc2626", num: state.wrong.length, lab: "错题本" },
    ];
    $("#statRow").innerHTML = stats.map(s =>
      `<div class="stat-card">
         <div class="stat-ico" style="background:${s.bg};color:${s.color}">${s.ico}</div>
         <div><b>${s.num}</b><span>${s.lab}</span></div>
       </div>`
    ).join("");

    // 各科掌握度（按已答进度填充）
    $("#subjBars").innerHTML = D.subjects.map(s => {
      let idxTotal = 0, idxDone = 0, idxRight = 0;
      QUIZ.forEach((q, i) => {
        if (q.sub !== s.id) return;
        idxTotal++;
        if (state.ans.hasOwnProperty(i)) { idxDone++; if (state.ans[i] === q.a) idxRight++; }
      });
      const pct = idxTotal ? Math.round(idxDone / idxTotal * 100) : 0;
      const acc = idxDone ? Math.round(idxRight / idxDone * 100) : 0;
      return `<div class="subj-bar">
        <div class="lab"><span>${s.name}</span><span class="num">已练 ${idxDone}/${idxTotal} · 正确率 ${idxDone ? acc + "%" : "—"}</span></div>
        <div class="track"><div class="fill" style="width:${pct}%;background:${s.color}"></div></div>
      </div>`;
    }).join("");

    // 题库构成（按来源 + 按科目）
    const segColor = { law: "#2563eb", guide: "#0f766e", method: "#b45309", case: "#7c3aed" };
    $("#bankBreakdown").innerHTML =
      `<div class="bank-row"><span class="name">来源</span><div class="track">
         <div class="seg" style="width:${Math.round((QUIZ.length-examCount)/QUIZ.length*100)}%;background:#94a3b8"></div>
         <div class="seg" style="width:${Math.round(examCount/QUIZ.length*100)}%;background:#0f766e"></div>
       </div><span class="val">真题${examCount}</span></div>` +
      D.subjects.map(s => {
        const total = QUIZ.filter(q => q.sub === s.id).length;
        const pct = QUIZ.length ? Math.round(total / QUIZ.length * 100) : 0;
        return `<div class="bank-row"><span class="name">${s.name}</span><div class="track">
          <div class="seg" style="width:${pct}%;background:${segColor[s.id] || "#64748b"}"></div>
        </div><span class="val">${total}</span></div>`;
      }).join("");
  }

  /* ============================ 专注刷题（一键做题） ============================ */
  const focus = { list: [], pos: 0, ans: {}, title: "" }; // list: QUIZ 索引数组

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function buildSession(size, opts) {
    opts = opts || {};
    const allIdx = QUIZ.map((_, i) => i);
    if (opts.random) {
      // 每日一练：全随机
      return shuffle(allIdx).slice(0, size);
    }
    // 一键开始：优先「完整4选项」的真题，尽量覆盖各科，掺入错题
    const good = allIdx.filter(i => QUIZ[i].opts.length >= 4);
    const thin = allIdx.filter(i => QUIZ[i].opts.length < 4); // 个别PDF缺第4选项，兜底
    const wrong = state.wrong.filter(i => i < QUIZ.length);
    const preferGood = good.filter(i => QUIZ[i].src === "真题");
    const restGood = good.filter(i => QUIZ[i].src !== "真题");
    const preferThin = thin.filter(i => QUIZ[i].src === "真题");
    const ordered = [];
    const seen = new Set();
    const push = i => { if (!seen.has(i)) { seen.add(i); ordered.push(i); } };
    // 1) 每科先取 4 道完整真题，保证覆盖
    D.subjects.forEach(s => {
      shuffle(preferGood.filter(i => QUIZ[i].sub === s.id)).slice(0, 4).forEach(push);
    });
    // 2) 掺入错题（优先完整选项）
    shuffle(wrong.filter(i => good.includes(i))).slice(0, 5).forEach(push);
    // 3) 用剩余完整真题/模拟补齐
    shuffle(preferGood).forEach(push);
    shuffle(restGood).forEach(push);
    // 4) 仍不足再用选项不全者兜底
    shuffle(preferThin).forEach(push);
    shuffle(thin).forEach(push);
    return ordered.slice(0, size);
  }
  function startFocus(list, title) {
    focus.list = list.slice();
    focus.pos = 0;
    focus.ans = {};
    focus.title = title;
    switchView("focus");
    renderFocus();
  }
  function renderFocus() {
    const card = $("#focusCard");
    const total = focus.list.length;
    if (focus.pos >= total) { endFocus(); return; }
    const qi = focus.list[focus.pos];
    const q = QUIZ[qi];
    const subj = D.subjects.find(x => x.id === q.sub) || { name: q.sub };
    const answered = focus.ans.hasOwnProperty(qi);
    const chosen = focus.ans[qi];
    // 顶部进度
    $("#focusBar").style.width = (focus.pos / total * 100) + "%";
    $("#focusCount").textContent = `${focus.pos + 1} / ${total}`;

    const srcTag = q.src === "真题"
      ? `<span class="src-tag exam">真题${q.year ? "·" + q.year : ""}</span>`
      : `<span class="src-tag sim">模拟</span>`;
    const opts = q.opts.map((o, i) => {
      let cls = "f-opt";
      if (answered) {
        if (i === q.a) cls += " correct";
        else if (i === chosen) cls += " wrong";
        else cls += " dim";
      }
      return `<div class="${cls}" data-i="${i}"><span class="key">${String.fromCharCode(65 + i)}</span><span>${o}</span></div>`;
    }).join("");

    card.innerHTML =
      `<div class="f-meta">${focus.title} · 科目：<b>${subj.name}</b> ${srcTag}</div>` +
      `<div class="f-stem">${q.q}</div>` +
      `<div class="f-opts">${opts}</div>` +
      (answered
        ? `<div class="f-exp"><b>${chosen === q.a ? "✔ 回答正确" : "✘ 回答错误"} · 解析：</b>${q.exp || "（暂无解析）"}</div>` +
          `<div class="f-learn"><button class="btn small ghost" id="fLearnBtn">📖 学「${subj.name}」知识点</button></div>` +
          `<div class="f-actions"><button class="btn primary" id="fNextBtn">${focus.pos + 1 >= total ? "查看结果 →" : "下一题 →"}</button></div>`
        : `<div class="f-actions"><span class="q-result" style="color:var(--ink-soft)">选择一个答案（也可按键盘 1-4 / A-D）</span></div>`);

    if (answered) {
      $("#fNextBtn").onclick = () => { focus.pos++; renderFocus(); };
      const lb = $("#fLearnBtn");
      if (lb) lb.onclick = () => { curSubj = q.sub; buildSubjectList(); renderSubject(q.sub); switchView("learn"); };
    } else {
      $$(".f-opt", card).forEach(el => { el.onclick = () => focusAnswer(qi, parseInt(el.dataset.i, 10)); });
    }
  }
  function focusAnswer(qi, i) {
    if (focus.ans.hasOwnProperty(qi)) return;
    focus.ans[qi] = i;
    renderFocus();
  }
  function endFocus() {
    const total = focus.list.length;
    const answered = focus.list.filter(i => focus.ans.hasOwnProperty(i));
    const right = answered.filter(i => focus.ans[i] === QUIZ[i].a).length;
    const pct = answered.length ? Math.round(right / answered.length * 100) : 0;
    const wrongIdx = answered.filter(i => focus.ans[i] !== QUIZ[i].a);
    $("#focusBar").style.width = "100%";
    $("#focusCount").textContent = `${total} / ${total}`;
    $("#focusCard").innerHTML =
      `<div class="focus-end">
         <div class="f-result-ring">${ringSVG(pct, 120, 13, pct >= 80 ? "#16a34a" : pct >= 60 ? "#f59e0b" : "#dc2626", "#eef2f6")}
           <div class="rv"><b>${pct}%</b><span>本轮正确率</span></div>
         </div>
         <h2>${pct >= 80 ? "很棒！继续保持 🎉" : pct >= 60 ? "不错，再巩固一下 👍" : "加油，错题再练一轮 💪"}</h2>
         <div class="sum">本轮 ${total} 题 · 答对 ${right} · 答错 ${wrongIdx.length}</div>
         <div class="f-actions center">
           ${wrongIdx.length ? `<button class="btn" id="fSaveWrong">📕 保存 ${wrongIdx.length} 道错题</button>` : ""}
           <button class="btn" id="fAgainWrong">🔁 只练本轮错题</button>
           <button class="btn primary" id="fAgain">再来一轮</button>
           <button class="btn ghost" id="fHome">🏠 返回首页</button>
         </div>
       </div>`;
    const sw = $("#fSaveWrong");
    if (sw) sw.onclick = async () => {
      let added = 0;
      wrongIdx.forEach(i => { if (!state.wrong.includes(i)) { state.wrong.push(i); added++; } });
      const saved = await save(LS.wrong, state.wrong);
      refreshProgressBadge();
      if (!saved) return;
      sw.textContent = `已保存 ${added} 道错题 ✔`;
      sw.disabled = true;
    };
    const aw = $("#fAgainWrong");
    if (aw) aw.onclick = () => { if (wrongIdx.length) startFocus(wrongIdx, "本轮错题"); else alert("本轮无错题，棒！"); };
    $("#fAgain").onclick = () => startFocus(focus.list, focus.title);
    $("#fHome").onclick = () => { switchView("home"); renderHome(); };
  }

  /* ============================ 速查视图 ============================ */
  function buildRef() {
    const grid = $("#refGrid");
    grid.innerHTML = D.quickrefs.map(r =>
      `<div class="ref-card"><div class="label">${r.label}</div><div class="text">${r.text}</div></div>`
    ).join("");
  }

  /* ============================ 待办视图 ============================ */
  /* ============================ 计算例题视图 ============================ */
  function renderCalc() {
    const wrap = $("#calcWrap");
    $("#calcCount").textContent = D.calc.length;
    wrap.innerHTML = "";
    D.calc.forEach((c, idx) => {
      const card = document.createElement("div");
      card.className = "calc-card";
      const steps = c.steps.map(s => `<li>${s}</li>`).join("");
      card.innerHTML =
        `<div class="ctitle">${c.title}</div>` +
        `<div class="csubj">科目：${c.subj}</div>` +
        `<div class="cgiven"><b>已知：</b>${c.given}</div>` +
        `<div id="calcSteps${idx}" style="display:none"><ol>${steps}</ol>` +
        `<div class="cresult">答：${c.result}</div>` +
        `<div class="ctip">💡 ${c.tip}</div></div>` +
        `<button class="btn cbtn" data-i="${idx}">显示解答</button>`;
      const btn = $("button", card);
      btn.onclick = () => {
        const box = $(`#calcSteps${idx}`, card);
        const show = box.style.display === "none";
        box.style.display = show ? "block" : "none";
        btn.textContent = show ? "隐藏解答" : "显示解答";
      };
      wrap.appendChild(card);
    });
  }

  /* ============================ 标准限值视图 ============================ */
  function renderLimits() {
    const wrap = $("#limitsWrap");
    wrap.innerHTML = "";
    D.limits.forEach(l => {
      const rows = l.rows.map(r =>
        `<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td>${r[3] || ""}</td></tr>`
      ).join("");
      const card = document.createElement("div");
      card.className = "limits-card";
      card.innerHTML = `<div class="lstd">${l.std}</div><table class="kb"><tr><th>因子</th><th>单位</th><th>限值</th><th>说明</th></tr>${rows}</table>`;
      wrap.appendChild(card);
    });
  }

  /* ============================ 真题库视图 ============================ */
  const EXAM = window.EIA_EXAM || [];
  const examQ = [];
  const examC = [];
  EXAM.forEach(p => {
    if (p.type === "case") {
      (p.cases || []).forEach(c => examC.push({ year: p.year, subj: p.subjectName, no: c.no, title: c.title, text: c.text }));
    } else if (p.type === "obj") {
      (p.questions || []).forEach(q => {
        const ansIdx = (q.ans || []).map(L => L.charCodeAt(0) - 65); // 字母->索引
        examQ.push({
          ei: examQ.length, year: p.year, subj: p.subject, subjName: p.subjectName,
          stem: q.stem, opts: q.opts, ans: ansIdx, expl: q.expl || "",
          noAns: !!q.noAns, multi: ansIdx.length > 1,
        });
      });
    }
  });
  const LSexam = { ans: "eia_exam_ans", wrong: "eia_exam_wrong" };
  const examState = { ans: load(LSexam.ans, {}), wrong: load(LSexam.wrong, []) };
  let examFilter = { subj: "all", year: "all", type: "all" };
  let examOrder = [];
  let examPos = 0;
  let examTemp = [];

  function escapeHTML(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function examSubjects() {
    const set = {};
    examQ.forEach(q => { set[q.subj] = q.subjName; });
    return Object.keys(set).map(k => ({ id: k, name: set[k] }));
  }
  function examYears() {
    const set = {};
    examQ.forEach(q => { set[q.year] = 1; });
    return Object.keys(set).sort();
  }
  function buildExamBar() {
    const bar = $("#examBar");
    const subjs = [{ id: "all", name: "全部科目" }].concat(examSubjects()).concat([{ id: "case", name: "案例分析（阅读）" }]);
    const years = ["all"].concat(examYears());
    const subjOpts = subjs.map(s => `<option value="${s.id}" ${examFilter.subj === s.id ? "selected" : ""}>${s.name}</option>`).join("");
    const yearOpts = years.map(y => `<option value="${y}" ${examFilter.year === y ? "selected" : ""}>${y === "all" ? "全部年份" : y + "年"}</option>`).join("");
    bar.innerHTML =
      `<span>科目</span><select id="examSubj">${subjOpts}</select>` +
      `<span>年份</span><select id="examYear">${yearOpts}</select>` +
      `<span>题型</span>` +
      `<button class="filter" data-t="all">全部</button>` +
      `<button class="filter" data-t="single">单选</button>` +
      `<button class="filter" data-t="multi">多选</button>` +
      `<span class="q-progress" id="examProg"></span>`;
    $("#examSubj").onchange = e => { examFilter.subj = e.target.value; examApplyFilter(); };
    $("#examYear").onchange = e => { examFilter.year = e.target.value; examApplyFilter(); };
    $$(".filter", bar).forEach(b => {
      b.classList.toggle("active", examFilter.type === b.dataset.t);
      b.onclick = () => { examFilter.type = b.dataset.t; buildExamBar(); examApplyFilter(); };
    });
  }
  function examApplyFilter() {
    examTemp = [];
    if (examFilter.subj === "case") { showExamCases(); return; }
    $("#examCases").style.display = "none";
    $("#examWrap").style.display = "block";
    examOrder = examQ.map(q => q.ei).filter(ei => {
      const q = examQ[ei];
      if (examFilter.subj !== "all" && q.subj !== examFilter.subj) return false;
      if (examFilter.year !== "all" && String(q.year) !== String(examFilter.year)) return false;
      if (examFilter.type === "single" && q.multi) return false;
      if (examFilter.type === "multi" && !q.multi) return false;
      return true;
    });
    examPos = 0;
    if (examOrder.length === 0) { $("#examWrap").innerHTML = "<p>该筛选下暂无题目。</p>"; return; }
    renderExam();
  }
  function examIsCorrect(q, chosen) {
    if (q.noAns) return null;
    if (q.multi) {
      if (chosen.length !== q.ans.length) return false;
      return q.ans.every(a => chosen.includes(a));
    }
    return chosen.length === 1 && chosen[0] === q.ans[0];
  }
  function renderExam() {
    const wrap = $("#examWrap");
    const total = examOrder.length;
    const prog = $("#examProg");
    if (prog) prog.textContent = `第 ${examPos + 1} / ${total} 题`;
    if (examPos >= total) { renderExamEnd(); return; }
    const q = examQ[examOrder[examPos]];
    const ansKey = String(q.ei);
    const answered = examState.ans.hasOwnProperty(ansKey);
    const chosen = answered ? (examState.ans[ansKey] || []) : examTemp;
    const tag = q.noAns
      ? `<span class="q-tag na">无答案·自测</span>`
      : (q.multi ? `<span class="q-tag multi">多选</span>` : `<span class="q-tag single">单选</span>`);
    const optsHTML = q.opts.map((o, i) => {
      let cls = "opt" + (q.multi ? " multi" : "");
      const key = String.fromCharCode(65 + i);
      if (answered) {
        const isAns = q.ans.includes(i);
        const isChosen = chosen.includes(i);
        if (isAns) cls += " correct";
        else if (isChosen) cls += " wrong";
        else cls += " dim";
      } else if (chosen.includes(i)) {
        cls += " selected";
      }
      return `<div class="${cls}" data-i="${i}"><span class="key">${key}</span><span>${escapeHTML(o)}</span></div>`;
    }).join("");
    const expHTML = q.noAns
      ? `<div class="q-exp show" id="qExp"><b>说明：</b>本题来自空白卷（无标准答案），请对照教材/回忆版解析自行核对；如已作答，可点「下一题」继续。</div>`
      : `<div class="q-exp ${answered ? "show" : ""}" id="qExp"><b>解析：</b>${escapeHTML(q.expl) || "（回忆版未提供解析）"}</div>`;
    wrap.innerHTML =
      `<div class="q-paper">${q.year}年 · ${q.subjName} · 真题（回忆版）</div>` +
      `<div class="q-meta">${tag} ${answered ? (q.noAns ? "已自测" : (examIsCorrect(q, chosen) ? "已答对" : "已答错")) : "未作答"}</div>` +
      `<div class="q-text">${escapeHTML(q.stem)}</div>` +
      `<div class="q-opts">${optsHTML}</div>` +
      expHTML +
      `<div class="quiz-actions" id="examActions"></div>`;
    const acts = $("#examActions");
    if (!answered) {
      $$(".opt", wrap).forEach(el => { el.onclick = () => examPick(q, parseInt(el.dataset.i, 10)); });
      if (q.multi) {
        acts.innerHTML = `<button class="btn primary" id="examSubmit">提交答案</button>` +
          `<span class="q-result" style="color:var(--ink-soft)">多选：可勾选多项后提交</span>`;
        $("#examSubmit").onclick = () => {
          if (examTemp.length === 0) { alert("请先选择至少一个选项"); return; }
          examSubmit(q);
        };
      } else {
        acts.innerHTML = `<span class="q-result" style="color:var(--ink-soft)">点击选项作答</span>`;
      }
    } else {
      if (q.noAns) {
        acts.innerHTML = `<span class="q-result" style="color:var(--ink-soft)">已自测</span><button class="btn primary" id="examNext">${examPos + 1 >= total ? "查看结果" : "下一题 →"}</button>`;
      } else {
        const ok = examIsCorrect(q, chosen);
        const correctStr = q.ans.map(i => String.fromCharCode(65 + i)).join("、");
        acts.innerHTML = `<span class="q-result" style="color:${ok ? "var(--ok)" : "var(--warn)"}">${ok ? "✔ 回答正确" : "✘ 回答错误（正确答案：" + correctStr + "）"}</span>` +
          `<button class="btn primary" id="examNext">${examPos + 1 >= total ? "查看结果" : "下一题 →"}</button>`;
      }
      $("#examNext").onclick = () => { examTemp = []; examPos++; renderExam(); };
    }
  }
  function examPick(q, i) {
    const ansKey = String(q.ei);
    if (examState.ans.hasOwnProperty(ansKey)) return;
    if (q.multi) {
      if (examTemp.includes(i)) examTemp = examTemp.filter(x => x !== i);
      else examTemp.push(i);
      renderExam();
    } else {
      examTemp = [i];
      examSubmit(q);
    }
  }
  function examSubmit(q) {
    const ansKey = String(q.ei);
    examState.ans[ansKey] = examTemp.slice();
    if (!q.noAns && !examIsCorrect(q, examTemp)) {
      if (!examState.wrong.includes(q.ei)) examState.wrong.push(q.ei);
    }
    save(LSexam.ans, examState.ans);
    save(LSexam.wrong, examState.wrong);
    renderExam();
  }
  function renderExamEnd() {
    const total = examOrder.length;
    const doneSet = examOrder.filter(ei => examState.ans.hasOwnProperty(String(ei)));
    const known = doneSet.filter(ei => !examQ[ei].noAns);
    const right = known.filter(ei => examIsCorrect(examQ[ei], examState.ans[String(ei)])).length;
    const wrongCount = known.length - right;
    const naCount = doneSet.length - known.length;
    $("#examWrap").innerHTML =
      `<h2 style="margin-bottom:10px">本轮真题练习结果</h2>` +
      `<div class="q-result">已答 ${doneSet.length}/${total} 题 · 有答案题正确 ${right} · 错误 ${wrongCount}` + (naCount ? ` · 自测(无答案) ${naCount}` : "") + `</div>` +
      `<p style="color:var(--ink-soft);font-size:13px;margin-top:8px">真题总进度：${Object.keys(examState.ans).length}/${examQ.length} 题已作答，真题错题本 ${examState.wrong.length} 题。</p>` +
      `<div class="quiz-actions"><button class="btn primary" id="examAgain">再来一轮</button>` +
      `<button class="btn" id="examWrong">只练错题（${examState.wrong.length}）</button></div>`;
    $("#examAgain").onclick = () => { examFilter.type = "all"; buildExamBar(); examApplyFilter(); };
    $("#examWrong").onclick = () => {
      if (examState.wrong.length === 0) { alert("暂无真题错题，棒！"); return; }
      examOrder = examState.wrong.slice(); examPos = 0; examTemp = []; renderExam();
    };
  }
  function showExamCases() {
    $("#examWrap").style.display = "none";
    const wrap = $("#examCases");
    wrap.style.display = "grid";
    let list = examC.map((c, idx) => ({ ...c, idx }));
    if (examFilter.year !== "all") list = list.filter(c => String(c.year) === String(examFilter.year));
    const byYear = {};
    list.forEach(c => { (byYear[c.year] = byYear[c.year] || []).push(c); });
    const years = Object.keys(byYear).sort();
    let listHTML = years.length ? "" : `<p style="padding:10px;color:var(--ink-soft)">该筛选下暂无案例。</p>`;
    years.forEach(y => {
      listHTML += `<h4>${y}年（${byYear[y].length}）</h4>`;
      byYear[y].forEach(c => {
        listHTML += `<button class="case-item" data-idx="${c.idx}">第${c.no}题 ${c.title}</button>`;
      });
    });
    wrap.innerHTML = `<div class="case-list">${listHTML}</div><div class="case-reader" id="caseReader"><div class="case-sub">从左侧选择案例，查看题干与参考答案（回忆版）。共收录 ${examC.length} 道案例分析真题。</div></div>`;
    $$(".case-item", wrap).forEach(b => b.onclick = () => {
      $$(".case-item", wrap).forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const c = examC[+b.dataset.idx];
      $("#caseReader").innerHTML = `<h3>第${c.no}题 ${c.title}</h3><div class="case-sub">${c.year}年 · ${c.subj} · 真题（回忆版）</div><div class="case-body">${escapeHTML(c.text)}</div>`;
    });
  }

  /* ============================ 重置 ============================ */
  $("#resetBtn").onclick = async () => {
    if (confirm("确定清空答题进度？此操作不可恢复。")) {
      state.ans = {}; state.wrong = [];
      const first = await save(LS.ans, {}); const second = await save(LS.wrong, []);
      refreshProgressBadge();
      if (first && second) alert("已重置。");
    }
  };

  /* ============================ 首页 / 专注刷题 事件 ============================ */
  $("#btnOneClick").onclick = () => startFocus(buildSession(20), "综合练习");
  $("#btnDaily").onclick = () => startFocus(buildSession(10, { random: true }), "每日一练");
  $("#btnQuickLearn").onclick = () => switchView("learn");
  $("#focusExit").onclick = () => switchView("home");
  // 键盘支持：数字 1-6 / 字母 A-F 选择，Enter 下一题
  document.addEventListener("keydown", (e) => {
    if (!$("#view-focus").classList.contains("active")) return;
    const card = $("#focusCard");
    const opts = $$(".f-opt:not(.correct):not(.wrong):not(.dim)", card);
    if (opts.length) {
      let idx = -1;
      if (e.key >= "1" && e.key <= "6") idx = parseInt(e.key, 10) - 1;
      else if (/^[a-fA-F]$/.test(e.key)) idx = e.key.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < opts.length) { opts[idx].click(); return; }
    }
    if (e.key === "Enter") { const nb = $("#fNextBtn"); if (nb) nb.click(); }
  });

  /* ============================ 初始化 ============================ */
  refreshProgressBadge();
  buildSubjectList();
  renderSubject(curSubj);
  buildQuizBar();
  startQuiz();
  buildRef();
  renderCalc();
  renderLimits();
  renderHome();
  // 真题库
  $("#examIntro").innerHTML =
    `<b>真题库</b>：已导入 2018–2025 年回忆版真题，共 <b>${examQ.length}</b> 道客观题（单选/多选，含 2024、2025 多份真实卷及草原狼、佳成、HQ 解析）+ <b>${examC.length}</b> 道案例分析真题。` +
    `可按科目 / 年份 / 题型筛选练习；进度与错题保存在云端。少数图片型 PDF 无法抽取文本，请以原卷为准。`;
  buildExamBar();
  examApplyFilter();
})();
