
(function(){
  "use strict";

  /* 数据库 ID 以字面量内联，便于平台识别数据绑定关系 */
  var DB_KB = "v7azdIm5lGSHw6TQhzzRI0";
  var DB_REC = "8yjNmzEKwEZSHMw5fg7gvN";

  var ALL_KB = [];
  var ALL_REC = [];
  var MODULE_OPTS = [];
  var CAT_OPTS = [];
  var DIFF_OPTS = [];
  var QUIZ = null;
  var QIDX = 0;

  /* ── 本地缓存（组卷参数 + 作答草稿） ── */
  var CACHE_PREFIX = "gk_workbench_";
  function cacheSet(key, val){
    try { localStorage.setItem(CACHE_PREFIX + key, val); } catch(e){}
  }
  function cacheGet(key){
    try { return localStorage.getItem(CACHE_PREFIX + key) || ""; } catch(e){ return ""; }
  }
  function cacheDel(key){
    try { localStorage.removeItem(CACHE_PREFIX + key); } catch(e){}
  }
  var PARAM_KEYS = ["qModule", "qDiff", "qType", "qCount", "qFocus"];
  function saveParams(){
    for(var i = 0; i < PARAM_KEYS.length; i++){
      var el = $(PARAM_KEYS[i]);
      if(el) cacheSet("param_" + PARAM_KEYS[i], el.value);
    }
  }
  function restoreParams(){
    for(var i = 0; i < PARAM_KEYS.length; i++){
      var el = $(PARAM_KEYS[i]);
      if(!el) continue;
      var v = cacheGet("param_" + PARAM_KEYS[i]);
      if(v) el.value = v;
    }
  }
  function resetParams(){
    for(var i = 0; i < PARAM_KEYS.length; i++){
      cacheDel("param_" + PARAM_KEYS[i]);
      var el = $(PARAM_KEYS[i]);
      if(el && el.tagName === "SELECT") el.selectedIndex = 0;
    }
  }
  function draftKey(name){ return "draft_" + name; }

  /* ── 工具 ── */
  function $(id){ return document.getElementById(id); }
  function txt(v){ return v == null ? "" : String(v); }
  function num(v){ var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function shuffle(arr){
    var a = arr.slice(), i, j, t;
    for(i = a.length - 1; i > 0; i--){
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function el(tag, cls, content){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(content != null) e.textContent = content;
    return e;
  }
  function modTagClass(m){
    if(m.indexOf("必修1") === 0) return "m1";
    if(m.indexOf("必修2") === 0) return "m2";
    if(m.indexOf("选择性必修1") >= 0) return "m3";
    if(m.indexOf("选择性必修2") >= 0) return "m4";
    return "m5";
  }
  function diffTagClass(d){ return d === "基础" ? "d1" : (d === "进阶" ? "d2" : "d3"); }

  function splitDistractors(s){
    var out = [], str = txt(s);
    var re = /[①②③④⑤][^①②③④⑤]*/g, m;
    while((m = re.exec(str)) !== null){
      var piece = m[0].replace(/^[①②③④⑤]\s*/, "").trim();
      if(piece) out.push(piece);
    }
    if(!out.length){
      var alt = str.split(/[；;]/);
      for(var i = 0; i < alt.length; i++){
        var p = alt[i].trim();
        if(p) out.push(p);
      }
    }
    return out;
  }
  function makeFalseStatement(kb){
    var d = splitDistractors(kb["干扰项"]);
    if(d.length) return d[Math.floor(Math.random() * d.length)];
    return txt(kb["核心考点"]);
  }
  function makeTrueStatement(kb){
    var core = txt(kb["核心考点"]);
    return core ? core : txt(kb["知识点"]);
  }

  /* ── 拉取知识点库全量（分页拉全） ── */
  function loadKb(startCursor, acc, guard){
    acc = acc || [];
    guard = guard || 0;
    if(guard > 60) return Promise.resolve(acc);
    return window.__SMART_PAGE__.database.query({ databaseId: "v7azdIm5lGSHw6TQhzzRI0", pageSize: 200, startCursor: startCursor })
      .then(function(res){
      var rows = (res && res.results) || [];
      for(var i = 0; i < rows.length; i++) acc.push(rows[i]);
      var next = res && res.nextCursor;
      if(res && res.hasMore && next && next !== startCursor && rows.length){
        return loadKb(next, acc, guard + 1);
      }
      return acc;
    }).catch(function(err){
      showLoadError("知识点库加载失败");
      throw err;
    });  }

  /* ── 拉取练习记录全量（分页拉全） ── */
  function loadRec(startCursor, acc, guard){
    acc = acc || [];
    guard = guard || 0;
    if(guard > 60) return Promise.resolve(acc);
    return window.__SMART_PAGE__.database.query({ databaseId: "8yjNmzEKwEZSHMw5fg7gvN", pageSize: 200, startCursor: startCursor })
      .then(function(res){
      var rows = (res && res.results) || [];
      for(var i = 0; i < rows.length; i++) acc.push(rows[i]);
      var next = res && res.nextCursor;
      if(res && res.hasMore && next && next !== startCursor && rows.length){
        return loadRec(next, acc, guard + 1);
      }
      return acc;
    }).catch(function(err){
      showLoadError("练习记录加载失败");
      throw err;
    });
  }

  /* 加载失败时给用户可见提示 */
  function showLoadError(msg){
    var box = $("kbState");
    if(!box) return;
    box.className = "state err";
    box.style.display = "block";
    box.textContent = msg + "，请检查网络或稍后重试。";
  }

  /* ── 写入练习记录 ── */
  function saveRec(kb, right, myAnswer){
    return window.__SMART_PAGE__.database.addRecord({
      databaseId: "8yjNmzEKwEZSHMw5fg7gvN",
      properties: {
        "知识点": { text: txt(kb["知识点"]) },
        "教材模块": { select: txt(kb["教材模块"]) },
        "知识类别": { select: txt(kb["知识类别"]) },
        "难度": { select: txt(kb["难度"]) },
        "答题情况": { select: right ? "正确" : "错误" },
        "我的答案": { text: myAnswer || "" },
        "练习时间": { date: new Date().toISOString() }
      }
    }).catch(function(err){
      showSaveError();
      throw err;
    });
  }

  /* 记录写入失败提示 */
  function showSaveError(){
    var stage = $("qStage");
    if(!stage) return;
    var tip = el("div", "state err", "练习记录写入失败，本次成绩未能保存到数据表，请检查登录状态后重试。");
    tip.style.padding = "12px";
    tip.style.marginTop = "12px";
    stage.appendChild(tip);
  }

  function fillSelect(sel, opts, withAll){
    sel.innerHTML = "";
    if(withAll){ var all = el("option", null, "全部"); all.value = ""; sel.appendChild(all); }
    for(var i = 0; i < opts.length; i++){
      var o = el("option", null, opts[i].text);
      o.value = opts[i].text;
      sel.appendChild(o);
    }
  }

  function stateBox(msg, kind){
    var d = el("div", "state" + (kind ? " " + kind : ""), msg);
    return d;
  }

  function bootstrap(){
    var db = (window.__SMART_PAGE__) && window.__SMART_PAGE__.database;
    if(!db){
      $("kbState").className = "state err";
      $("kbState").textContent = "当前环境不支持数据读写，无法加载知识点库。请在资料库页面中打开本工作台。";
      return;
    }
    restoreParams();
    var loadRecTask = loadRec();
    loadKb().then(function(rows){
      ALL_KB = rows || [];
      $("kbState").style.display = "none";
      $("kbGrid").style.display = "grid";

      var mods = {}, cats = {}, diffs = {}, i;
      for(i = 0; i < ALL_KB.length; i++){
        var r = ALL_KB[i];
        mods[txt(r["教材模块"])] = 1;
        cats[txt(r["知识类别"])] = 1;
        diffs[txt(r["难度"])] = 1;
      }
      MODULE_OPTS = Object.keys(mods).map(function(t){ return { text: t }; });
      CAT_OPTS = Object.keys(cats).map(function(t){ return { text: t }; });
      DIFF_OPTS = Object.keys(diffs).map(function(t){ return { text: t }; });

      fillSelect($("kbModule"), MODULE_OPTS, true);
      fillSelect($("kbCat"), CAT_OPTS, true);
      fillSelect($("kbDiff"), DIFF_OPTS, true);
      fillSelect($("qModule"), MODULE_OPTS, true);
      fillSelect($("qDiff"), DIFF_OPTS, true);
      restoreParams();

      $("statTotal").textContent = ALL_KB.length;
      $("statModule").textContent = MODULE_OPTS.length;
      $("statCat").textContent = CAT_OPTS.length;

      renderChips();
      renderKb();
      renderDash();
      return loadRecTask;
    }).then(function(recs){
      ALL_REC = recs || [];
      $("statDone").textContent = ALL_REC.length;
      renderDash();
    }).catch(function(err){
      $("kbState").className = "state err";
      $("kbState").style.display = "block";
      $("kbState").textContent = "知识点库加载失败：" + (err && err.message ? err.message : "请稍后重试");
    });
  }

  /* ── 知识库筛选 ── */
  function filteredKb(){
    var mod = $("kbModule").value;
    var cat = $("kbCat").value;
    var dif = $("kbDiff").value;
    var kw = $("kbSearch").value.trim().toLowerCase();
    var out = [];
    for(var i = 0; i < ALL_KB.length; i++){
      var r = ALL_KB[i];
      if(mod && txt(r["教材模块"]) !== mod) continue;
      if(cat && txt(r["知识类别"]) !== cat) continue;
      if(dif && txt(r["难度"]) !== dif) continue;
      if(kw){
        var hay = (txt(r["知识点"]) + " " + txt(r["核心考点"]) + " " + txt(r["要点拆解"]) + " " +
                   txt(r["易错提醒"]) + " " + txt(r["典型题型"]) + " " + txt(r["例题解析"]) + " " +
                   txt(r["单元"])).toLowerCase();
        if(hay.indexOf(kw) < 0) continue;
      }
      out.push(r);
    }
    return out;
  }

  function renderChips(){
    var box = $("kbChips");
    box.innerHTML = "";
    for(var i = 0; i < MODULE_OPTS.length; i++){
      var t = MODULE_OPTS[i].text;
      var cnt = 0;
      for(var j = 0; j < ALL_KB.length; j++) if(txt(ALL_KB[j]["教材模块"]) === t) cnt++;
      var b = el("button", "chip" + ($("kbModule").value === t ? " on" : ""), t + " " + cnt);
      b.setAttribute("data-mod", t);
      b.onclick = function(){
        var v = this.getAttribute("data-mod");
        $("kbModule").value = ($("kbModule").value === v) ? "" : v;
        renderChips(); renderKb();
      };
      box.appendChild(b);
    }
  }

  function kbSection(title, body, kind){
    var s = el("div", "sec" + (kind ? " " + kind : ""));
    s.appendChild(el("h4", null, title));
    s.appendChild(el("p", null, body));
    return s;
  }

  function renderKb(){
    var list = filteredKb();
    $("kbCount").textContent = "共 " + list.length + " 条";
    var grid = $("kbGrid");
    grid.innerHTML = "";
    if(!list.length){
      grid.style.display = "block";
      grid.appendChild(el("div", "empty-note", "没有匹配的知识点，试试放宽筛选条件或更换关键词。"));
      return;
    }
    grid.style.display = "grid";
    for(var i = 0; i < list.length; i++){
      var r = list[i];
      var m = txt(r["教材模块"]), d = txt(r["难度"]), c = txt(r["知识类别"]);
      var art = el("article", "kb");
      var head = el("div", "kb-h");
      var t = el("div", "kb-t");
      t.appendChild(el("b", null, r["知识点"]));
      var meta = el("div", "kb-meta");
      meta.appendChild(el("span", "tag " + modTagClass(m), m));
      meta.appendChild(el("span", "tag " + diffTagClass(d), d));
      meta.appendChild(el("span", "tag", c));
      meta.appendChild(el("span", null, "★" + num(r["高频程度"])));
      meta.appendChild(el("span", null, "· " + txt(r["单元"])));
      t.appendChild(meta);
      head.appendChild(t);
      head.appendChild(el("span", "arrow", "▶"));
      var bodyBox = el("div", "kb-b");
      bodyBox.appendChild(kbSection("核心考点", r["核心考点"]));
      bodyBox.appendChild(kbSection("要点拆解", r["要点拆解"]));
      bodyBox.appendChild(kbSection("易错提醒", r["易错提醒"], "warn"));
      bodyBox.appendChild(kbSection("典型题型", r["典型题型"]));
      bodyBox.appendChild(kbSection("例题解析", r["例题解析"]));
      if(txt(r["记忆口诀"]) && txt(r["记忆口诀"]) !== "—"){
        bodyBox.appendChild(kbSection("记忆口诀", r["记忆口诀"], "ok"));
      }
      bodyBox.appendChild(kbSection("自测题", r["自测题"]));
      bodyBox.appendChild(kbSection("参考答案", r["自测答案"]));
      art.appendChild(head);
      art.appendChild(bodyBox);
      head.onclick = function(){ this.parentNode.classList.toggle("open"); };
      grid.appendChild(art);
    }
  }

  /* ── 动态组卷 ── */
  function weakScore(kb){
    var name = txt(kb["知识点"]);
    var wrong = 0, total = 0, i;
    for(i = 0; i < ALL_REC.length; i++){
      if(txt(ALL_REC[i]["知识点"]) === name){
        total++;
        if(txt(ALL_REC[i]["答题情况"]) === "错误") wrong++;
      }
    }
    if(!total) return 0;
    return (wrong / total) * 10 + wrong * 1.5;
  }

  function mkQuestion(kb, type){
    var q = { kb: kb, type: type, answered: false };
    if(type === "choice"){
      var correct = txt(kb["核心考点"]);
      var ds = shuffle(splitDistractors(kb["干扰项"]));
      var opts = [correct], i;
      for(i = 0; i < ds.length && opts.length < 4; i++){
        if(ds[i] && ds[i] !== correct) opts.push(ds[i]);
      }
      while(opts.length < 4) opts.push("以上表述均不正确");
      q.opts = shuffle(opts);
      q.answer = correct;
      q.stem = "关于「" + txt(kb["知识点"]) + "」，下列说法正确的是：";
    } else if(type === "judge"){
      var truth = Math.random() < 0.5;
      q.stem = "判断下列说法是否正确：「" + (truth ? makeTrueStatement(kb) : makeFalseStatement(kb)) + "」";
      q.truth = truth;
      q.answer = truth ? "正确" : "错误";
    } else {
      q.stem = txt(kb["自测题"]);
      q.ref = txt(kb["自测答案"]);
      q.answer = txt(kb["自测答案"]);
    }
    return q;
  }

  function buildQuiz(){
    var mod = $("qModule").value;
    var dif = $("qDiff").value;
    var type = $("qType").value;
    var want = parseInt($("qCount").value, 10) || 10;
    var focus = $("qFocus").value;

    var pool = [], i;
    for(i = 0; i < ALL_KB.length; i++){
      var r = ALL_KB[i];
      if(mod && txt(r["教材模块"]) !== mod) continue;
      if(dif && txt(r["难度"]) !== dif) continue;
      pool.push(r);
    }
    if(!pool.length) return null;

    var scored = [];
    for(i = 0; i < pool.length; i++){
      var s = 0;
      if(focus === "weak") s = weakScore(pool[i]) * 10;
      else if(focus === "freq") s = num(pool[i]["高频程度"]) * 10;
      else s = num(pool[i]["高频程度"]) * 3 + weakScore(pool[i]) * 2;
      s += Math.random() * 4;
      scored.push({ kb: pool[i], s: s });
    }
    scored.sort(function(a, b){ return b.s - a.s; });

    var picked = scored.slice(0, Math.min(want, scored.length));
    var questions = [], j;
    if(type === "mix"){
      for(j = 0; j < picked.length; j++){
        var k = j % 3;
        questions.push(mkQuestion(picked[j].kb, k === 0 ? "choice" : (k === 1 ? "judge" : "qa")));
      }
    } else {
      for(j = 0; j < picked.length; j++) questions.push(mkQuestion(picked[j].kb, type));
    }
    return { questions: questions, module: mod, type: type };
  }

  function startQuiz(){
    saveParams();
    var q = buildQuiz();
    $("quizCfg").style.display = "none";
    $("quizIdle").style.display = "none";
    $("quizBody").style.display = "block";
    if(!q){
      $("qTitle").textContent = "练习";
      $("qStage").innerHTML = "";
      $("qStage").appendChild(stateBox("当前筛选条件下没有可用知识点，请放宽教材模块或难度条件。", "err"));
      return;
    }
    QUIZ = q; QIDX = 0;
    $("qTitle").textContent = "练习 · " + (q.module || "全部模块") + " · 共 " + q.questions.length + " 题";
    renderQuestion();
  }

  function renderQuestion(){
    var stage = $("qStage");
    stage.innerHTML = "";
    if(!QUIZ || QIDX >= QUIZ.questions.length){ renderResult(); return; }
    var q = QUIZ.questions[QIDX];
    $("qPos").textContent = (QIDX + 1) + " / " + QUIZ.questions.length;
    $("qBar").style.width = Math.round((QIDX / QUIZ.questions.length) * 100) + "%";

    var typeLabel = q.type === "choice" ? "单项选择" : (q.type === "judge" ? "判断正误" : "简答自测");
    var typeColor = q.type === "choice" ? "#e8f0fe" : (q.type === "judge" ? "#fdf1e0" : "#e6f4f1");
    var typeInk = q.type === "choice" ? "#2a5cbb" : (q.type === "judge" ? "#9a5a08" : "#0f7b6c");

    var head = el("div", "quiz-head");
    var t = el("span", "q-type", typeLabel);
    t.style.background = typeColor; t.style.color = typeInk;
    head.appendChild(t);
    var kbname = el("span", null, txt(q.kb["教材模块"]) + " · " + txt(q.kb["知识点"]));
    kbname.style.cssText = "font-size:12.5px;color:var(--ink3);";
    head.appendChild(kbname);
    stage.appendChild(head);

    stage.appendChild(el("p", "q-stem", q.stem));

    var nextBtn = el("button", "btn", QIDX === QUIZ.questions.length - 1 ? "查看本次结果" : "下一题");
    nextBtn.disabled = true;

    if(q.type === "qa"){
      var ta = el("textarea", "qa");
      ta.placeholder = "写下你的答案，提交后可对照参考答案自查…";
      var restored = cacheGet(draftKey(txt(q.kb["知识点"])));
      if(restored) ta.value = restored;
      ta.oninput = function(){ cacheSet(draftKey(txt(q.kb["知识点"])), ta.value); };
      stage.appendChild(ta);
      var box = el("div");
      box.style.marginTop = "14px";
      var btn = el("button", "btn", "提交答案并查看解析");
      btn.onclick = function(){
        if(q.answered) return;
        q.answered = true;
        var my = ta.value.trim();
        ta.disabled = true; btn.disabled = true;
        cacheDel(draftKey(txt(q.kb["知识点"])));
        var ex = el("div", "explain");
        ex.appendChild(el("b", null, "参考答案"));
        ex.appendChild(el("div", "k", q.ref));
        var p2 = el("div", "k", "核心考点：" + txt(q.kb["核心考点"]));
        p2.style.marginTop = "8px";
        ex.appendChild(p2);
        stage.appendChild(ex);
        saveRec(q.kb, true, my).then(function(){
          ALL_REC.push({ "知识点": txt(q.kb["知识点"]), "教材模块": txt(q.kb["教材模块"]), "知识类别": txt(q.kb["知识类别"]), "难度": txt(q.kb["难度"]), "答题情况": "正确", "我的答案": my, "练习时间": new Date().toISOString() });
          renderDash();
        });
        nextBtn.disabled = false;
      };
      box.appendChild(btn);
      stage.appendChild(box);
    } else {
      var optsBox = el("div", "opts");
      var labels = ["A", "B", "C", "D", "E", "F"];
      var optList = q.type === "choice" ? q.opts : [true, false];
      for(var i = 0; i < optList.length; i++){
        (function(idx){
          var val = optList[idx];
          var b = el("button", "opt");
          b.type = "button";
          b.appendChild(el("span", "k", q.type === "choice" ? labels[idx] : (val ? "√" : "×")));
          b.appendChild(el("span", null, q.type === "choice" ? val : (val ? "说法正确，符合教材表述" : "说法错误，与教材表述不符")));
          b.onclick = function(){
            if(q.answered) return;
            q.answered = true;
            var isRight = (q.type === "choice") ? (val === q.answer) : (val === q.truth);
            var btns = optsBox.querySelectorAll(".opt");
            var z;
            for(z = 0; z < btns.length; z++){
              btns[z].classList.remove("picked");
              btns[z].disabled = true;
            }
            b.classList.add(isRight ? "right" : "wrong");
            if(!isRight && q.type === "choice"){
              for(z = 0; z < btns.length; z++){
                var spans = btns[z].querySelectorAll("span");
                if(spans.length > 1 && spans[1].textContent === q.answer) btns[z].classList.add("right");
              }
            }
            var ex = el("div", "explain");
            ex.appendChild(el("b", null, isRight ? "回答正确" : "回答错误"));
            ex.appendChild(el("div", "k", "核心考点：" + txt(q.kb["核心考点"])));
            var pe = el("div", "k", "易错提醒：" + txt(q.kb["易错提醒"]));
            pe.style.marginTop = "6px";
            ex.appendChild(pe);
            if(q.type === "choice"){
              var pa = el("div", "k", "正确答案：" + q.answer);
              pa.style.marginTop = "6px";
              ex.appendChild(pa);
            }
            stage.appendChild(ex);
            saveRec(q.kb, isRight, q.type === "choice" ? val : (val ? "正确" : "错误"))
              .then(function(){
                ALL_REC.push({ "知识点": txt(q.kb["知识点"]), "教材模块": txt(q.kb["教材模块"]), "知识类别": txt(q.kb["知识类别"]), "难度": txt(q.kb["难度"]), "答题情况": isRight ? "正确" : "错误", "我的答案": "", "练习时间": new Date().toISOString() });
                renderDash();
              });
            nextBtn.disabled = false;
          };
          optsBox.appendChild(b);
        })(i);
      }
      stage.appendChild(optsBox);
    }

    var nav = el("div");
    nav.style.cssText = "margin-top:18px;display:flex;gap:10px;justify-content:flex-end;";
    nextBtn.onclick = function(){ QIDX++; renderQuestion(); };
    nav.appendChild(nextBtn);
    stage.appendChild(nav);
  }

  function renderResult(){
    var stage = $("qStage");
    stage.innerHTML = "";
    $("qPos").textContent = "已完成";
    $("qBar").style.width = "100%";
    var total = QUIZ.questions.length;
    var right = 0, i, j;
    for(i = 0; i < total; i++){
      var nm = txt(QUIZ.questions[i].kb["知识点"]);
      for(j = 0; j < ALL_REC.length; j++){
        if(txt(ALL_REC[j]["知识点"]) === nm && txt(ALL_REC[j]["答题情况"]) === "正确"){ right++; break; }
      }
    }
    var box = el("div", "result");
    box.appendChild(el("div", "score", right + " / " + total));
    box.appendChild(el("p", null, "本次练习已完成，答题记录已写入资料库数据表，可到「掌握度看板」查看统计。"));
    var acts = el("div", "acts");
    var again = el("button", "btn", "再生成一份新试卷");
    again.onclick = function(){ startQuiz(); };
    var back = el("button", "btn ghost", "返回知识库");
    back.onclick = function(){ switchTab("p-kb"); };
    acts.appendChild(again); acts.appendChild(back);
    box.appendChild(acts);
    stage.appendChild(box);
  }

  /* ── 看板 ── */
  function barRow(label, pct){
    var row = el("div", "bar-row");
    row.appendChild(el("span", "lbl", label));
    var track = el("span", "track");
    var fill = el("span", "fill");
    fill.style.width = pct + "%";
    if(pct < 60) fill.style.background = "var(--err)";
    else if(pct < 85) fill.style.background = "var(--warn)";
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el("span", "num", pct + "%"));
    return row;
  }

  function renderDash(){
    var total = ALL_REC.length, right = 0, i;
    for(i = 0; i < total; i++) if(txt(ALL_REC[i]["答题情况"]) === "正确") right++;
    $("kAttempt").textContent = total;
    $("kAcc").textContent = total ? Math.round((right / total) * 100) + "%" : "—";
    $("statDone").textContent = total;

    var wrongMap = {}, wrongList = [];
    for(i = 0; i < total; i++){
      var r = ALL_REC[i];
      var nm = txt(r["知识点"]);
      if(txt(r["答题情况"]) !== "错误") continue;
      if(!wrongMap[nm]){ wrongMap[nm] = { name: nm, module: txt(r["教材模块"]), count: 0 }; wrongList.push(wrongMap[nm]); }
      wrongMap[nm].count++;
    }
    wrongList.sort(function(a, b){ return b.count - a.count; });
    $("kWrong").textContent = wrongList.length;

    var weakSet = {};
    for(i = 0; i < total; i++) if(txt(ALL_REC[i]["答题情况"]) === "错误") weakSet[txt(ALL_REC[i]["知识点"])] = 1;
    $("kWeak").textContent = Object.keys(weakSet).length;

    var mStat = {};
    for(i = 0; i < total; i++){
      var m = txt(ALL_REC[i]["教材模块"]);
      if(!mStat[m]) mStat[m] = { t: 0, r: 0 };
      mStat[m].t++;
      if(txt(ALL_REC[i]["答题情况"]) === "正确") mStat[m].r++;
    }
    var mBox = $("dashModule");
    mBox.innerHTML = "";
    var mKeys = Object.keys(mStat);
    if(!mKeys.length){
      mBox.appendChild(stateBox("暂无数据", ""));
    } else {
      for(i = 0; i < mKeys.length; i++){
        var st = mStat[mKeys[i]];
        mBox.appendChild(barRow(mKeys[i], st.t ? Math.round((st.r / st.t) * 100) : 0));
      }
    }

    var cStat = {};
    for(i = 0; i < total; i++){
      var c = txt(ALL_REC[i]["知识类别"]);
      if(!cStat[c]) cStat[c] = { t: 0, r: 0 };
      cStat[c].t++;
      if(txt(ALL_REC[i]["答题情况"]) === "正确") cStat[c].r++;
    }
    var cBox = $("dashCat");
    cBox.innerHTML = "";
    var cKeys = Object.keys(cStat);
    if(!cKeys.length){
      cBox.appendChild(stateBox("暂无数据", ""));
    } else {
      for(i = 0; i < cKeys.length; i++){
        var cs = cStat[cKeys[i]];
        cBox.appendChild(barRow(cKeys[i], cs.t ? Math.round((cs.r / cs.t) * 100) : 0));
      }
    }

    var wBox = $("dashWrong");
    wBox.innerHTML = "";
    if(!wrongList.length){
      wBox.appendChild(stateBox("暂无错题记录，先去做一组练习吧", ""));
    } else {
      var ul = el("ul", "wrong-list");
      for(i = 0; i < Math.min(wrongList.length, 12); i++){
        var li = el("li");
        li.appendChild(el("b", null, wrongList[i].name));
        li.appendChild(el("span", "why", "错 " + wrongList[i].count + " 次 · " + wrongList[i].module));
        ul.appendChild(li);
      }
      wBox.appendChild(ul);
    }
  }

  /* ── 标签切换 ── */
  function switchTab(pid){
    var tabs = document.querySelectorAll(".tab"), i;
    for(i = 0; i < tabs.length; i++){
      tabs[i].className = (tabs[i].getAttribute("data-panel") === pid) ? "tab on" : "tab";
    }
    var panels = document.querySelectorAll(".panel");
    for(i = 0; i < panels.length; i++){
      panels[i].className = (panels[i].id === pid) ? "panel on" : "panel";
    }
  }

  function bind(){
    var tabs = document.querySelectorAll(".tab"), i;
    for(i = 0; i < tabs.length; i++){
      tabs[i].onclick = function(){ switchTab(this.getAttribute("data-panel")); };
    }
    $("kbModule").onchange = function(){ renderChips(); renderKb(); };
    $("kbCat").onchange = renderKb;
    $("kbDiff").onchange = renderKb;
    $("kbSearch").oninput = renderKb;
    $("kbExpand").onclick = function(){
      var cards = $("kbGrid").querySelectorAll(".kb");
      var anyClosed = false;
      for(i = 0; i < cards.length; i++){ if(!cards[i].classList.contains("open")){ anyClosed = true; break; } }
      for(i = 0; i < cards.length; i++){
        if(anyClosed) cards[i].classList.add("open"); else cards[i].classList.remove("open");
      }
      this.textContent = anyClosed ? "全部收起" : "全部展开";
    };
    $("qStart").onclick = startQuiz;
    $("qReset").onclick = function(){ resetParams(); };
    for(i = 0; i < PARAM_KEYS.length; i++){
      var p = $(PARAM_KEYS[i]);
      if(p) p.onchange = saveParams;
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ bind(); bootstrap(); });
  } else { bind(); bootstrap(); }
})();
