
(function(){
  var ALL = window.QUESTION_DATA;
  var CASES = window.CASE_DATA.cases;
  var CASE_TEMPLATE = window.CASE_DATA.template;
  var FORMULAS = window.CALC_DATA.formulas;
  var CALC_QUESTIONS = window.CALC_DATA.questions;
  var CALC_TIPS = window.CALC_DATA.tips;
  var HOU5 = window.MEM_DATA.hou5;
  var SUPPLEMENTS = window.MEM_DATA.supplements;
  var PROCESS_GROUPS = window.MEM_DATA.process_groups;
  var CASE_ANSWER_TEMPLATE = window.MEM_DATA.answer_template;
  var ITTO = window.ITTO_DATA;

  // 章节名映射
  var CH_JB = {1:'信息化发展',2:'信息技术发展',3:'信息技术服务',4:'信息系统架构',5:'软件工程',6:'数据工程',7:'软硬件系统集成',8:'信息安全工程',9:'项目管理概论',10:'启动过程组',11:'规划过程组',12:'执行过程组',13:'监控过程组',14:'收尾过程组',15:'组织保障',16:'监理基础知识',17:'法律法规和标准规范',18:'职业道德规范',19:'专业英语'};
  var CH_768 = {1:'项目管理概论',2:'项目整合管理',3:'项目范围管理',4:'项目进度管理',5:'项目成本管理',6:'项目质量管理',7:'项目资源管理',8:'项目沟通管理',9:'项目风险管理',10:'项目采购管理',11:'项目干系人管理',12:'项目合同管理',13:'项目文档管理与配置管理',14:'项目收尾管理',15:'监理基础知识',16:'法律法规和标准规范',17:'职业道德规范',18:'信息化发展',19:'信息技术发展',20:'信息技术服务',21:'信息系统架构',22:'软件工程',23:'数据工程',24:'软硬件系统集成',25:'信息安全工程'};

  var state = { pool: [], idx: 0, answered: {}, order: [], mode: 'normal' };
  var storageKey = 'rkzx_softkao_progress_v4';

  // ============ 云端同步（同步码，无需账号登录） ============
  var cloud = {database: window.quizDatabase};
  var syncCode = '';
  var syncTimer = null;
  var SYNC_KEY = 'rkzx_softkao_sync_code';
  function initCloud(){ return true; }

  // 更新同步条状态
  function setSyncStatus(text, dot){
    var t = document.getElementById('sync-text');
    var d = document.getElementById('sync-dot');
    var btn = document.getElementById('btn-login');
    var copyBtn = document.getElementById('btn-copy-code');
    if(t) t.textContent = text;
    if(d){ d.className = 'sync-dot' + (dot ? ' ' + dot : ''); }
    if(btn){
      if(syncCode){ btn.textContent = '同步设置'; }
      else { btn.textContent = '开启云同步'; }
    }
    if(copyBtn){
      if(syncCode){ copyBtn.classList.remove('hidden'); }
      else { copyBtn.classList.add('hidden'); }
    }
  }

  // 从云端读取进度（按同步码）
  async function loadCloudProgress(){
    if(!cloud || !syncCode) return null;
    try{
      var r = await cloud.database.from('sync_slots').select('progress').eq('code', syncCode).maybeSingle();
      if(r.error){ throw r.error; }
      return r.data ? r.data.progress : null;
    }catch(e){ console.error('loadCloudProgress', e); throw e; }
  }

  // 保存进度到云端（防抖，按同步码）
  function saveCloudProgress(){
    if(!cloud || !syncCode) return;
    if(syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(async function(){
      try{
        setSyncStatus('同步中…', 'saving');
        var payload = buildProgressData();
        var r = await cloud.database.from('sync_slots').upsert({
          code: syncCode,
          progress: payload
        }, { onConflict: 'code' });
        if(r.error){ console.error('saveCloudProgress', r.error); setSyncStatus('同步失败', ''); }
        else { setSyncStatus('已同步', 'on'); }
      }catch(e){ console.error('saveCloudProgress', e); setSyncStatus('同步失败', ''); }
    }, 800);
  }

  // 提取进度数据（供本地/云端复用）
  function buildProgressData(){
    return {
      answered: state.answered,
      mode: state.mode,
      order: state.order,
      idx: state.idx,
      src: document.getElementById('sel-src') ? document.getElementById('sel-src').value : 'all',
      ch: document.getElementById('sel-ch') ? document.getElementById('sel-ch').value : 'all'
    };
  }

  function loadProgress(){
    try{
      var s = localStorage.getItem(storageKey);
      if(s){
        var d = JSON.parse(s);
        if(d && typeof d === 'object' && !Array.isArray(d) && d.answered){
          applyProgressData(d);
        } else {
          state.answered = d || {};
        }
      }
    }catch(e){ state.answered = {}; }
  }

  function applyProgressData(d){
    state.answered = d.answered || {};
    state.mode = d.mode || 'normal';
    state.order = d.order || [];
    state.idx = typeof d.idx === 'number' ? d.idx : 0;
    state.savedSrc = d.src || 'all';
    state.savedCh = d.ch || 'all';
  }

  function saveProgress(){
    try{
      localStorage.setItem(storageKey, JSON.stringify(buildProgressData()));
    }catch(e){}
    // 登录态下同步到云端
    saveCloudProgress();
  }

  function resetProgress(){
    state.answered = {};
    state.mode = 'normal';
    state.order = [];
    state.idx = 0;
    saveProgress();
    refreshStats();
    render();
  }

  // ============ 同步码相关（无需账号登录） ============
  function loadSyncCode(){
    try{ syncCode = localStorage.getItem(SYNC_KEY) || ''; }catch(e){ syncCode = ''; }
  }

  function showLogin(){
    document.getElementById('login-mask').classList.remove('hidden');
    document.getElementById('login-err').textContent = '';
    var inp = document.getElementById('sync-code-input');
    if(inp) inp.value = syncCode;
    var off = document.getElementById('btn-sync-off');
    if(off) off.style.display = syncCode ? 'block' : 'none';
  }
  function hideLogin(){
    document.getElementById('login-mask').classList.add('hidden');
  }

  // 生成随机同步码：4组4位，去掉易混淆字符 0/O/1/I
  function genSyncCode(){
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var parts = [];
    for(var i=0;i<4;i++){
      var p='';
      for(var j=0;j<4;j++){ p += chars[Math.floor(Math.random()*chars.length)]; }
      parts.push(p);
    }
    return parts.join('-');
  }

  function normalizeCode(raw){
    return (raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  }
  function formatCode(code){
    var c = normalizeCode(code);
    if(c.length <= 4) return c;
    var parts = c.match(/.{1,4}/g);
    return parts.join('-');
  }

  function fillRandomCode(){
    var inp = document.getElementById('sync-code-input');
    inp.value = genSyncCode();
    document.getElementById('login-err').textContent = '已生成同步码，请先记下来，再点保存。';
  }

  // 立即保存一次（不防抖）
  async function saveCloudProgressNow(){
    if(!cloud || !syncCode) return;
    var payload = buildProgressData();
    var r = await cloud.database.from('sync_slots').upsert({ code: syncCode, progress: payload }, { onConflict: 'code' });
    if(r.error){ throw r.error; }
  }

  // 保存同步码并完成首次同步
  async function applySyncCode(){
    var err = document.getElementById('login-err');
    var raw = document.getElementById('sync-code-input').value;
    var code = formatCode(raw);
    if(code.length < 8){
      err.textContent = '同步码太短，请检查后重新输入（至少 8 位字母或数字）';
      return;
    }
    if(!cloud){ initCloud(); }
    if(!cloud || !cloud.database){
      err.textContent = '云服务未加载成功，请刷新页面后重试';
      return;
    }
    syncCode = code;
    try{ localStorage.setItem(SYNC_KEY, code); }catch(e){}
    var btn = document.getElementById('btn-sync-apply');
    btn.disabled = true; btn.textContent = '同步中…';
    try{
      var remote = await loadCloudProgress();
      if(remote && remote.answered && Object.keys(remote.answered).length > 0){
        // 云端有数据，拉取覆盖本地
        applyProgressData(remote);
        localStorage.setItem(storageKey, JSON.stringify(remote));
      } else if(Object.keys(state.answered).length > 0){
        // 云端无数据，上传本地
        await saveCloudProgressNow();
      }
      btn.disabled = false; btn.textContent = '保存并开启同步';
      setSyncStatus('已同步 · ' + formatCode(syncCode), 'on');
      hideLogin();
      refreshStats();
      render();
    }catch(e){
      console.error('applySyncCode', e);
      btn.disabled = false; btn.textContent = '保存并开启同步';
      err.textContent = '网络异常，同步失败，请稍后重试';
    }
  }

  function turnOffSync(){
    if(!confirm('关闭云同步后，将不再与云端同步进度（本地进度仍保留），确定吗？')) return;
    syncCode = '';
    try{ localStorage.removeItem(SYNC_KEY); }catch(e){}
    setSyncStatus('未开启云同步', '');
  }

  function copySyncCode(){
    var code = syncCode;
    if(!code) return;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(function(){
        setSyncStatus('已复制同步码：' + formatCode(code), 'on');
      }).catch(function(){ setSyncStatus('同步码：' + formatCode(code), 'on'); });
    } else {
      setSyncStatus('同步码：' + formatCode(code), 'on');
    }
  }

  // 启动时检查同步码并同步
  async function checkSyncOnStart(){
    loadSyncCode();
    if(!syncCode){ setSyncStatus('未开启云同步', ''); return; }
    if(!cloud){ initCloud(); }
    if(!cloud || !cloud.database){ setSyncStatus('未开启云同步', ''); return; }
    try{
      var remote = await loadCloudProgress();
      if(remote && remote.answered && Object.keys(remote.answered).length > 0){
        var localN = Object.keys(state.answered).length;
        var remoteN = Object.keys(remote.answered).length;
        if(remoteN >= localN){
          applyProgressData(remote);
          localStorage.setItem(storageKey, JSON.stringify(remote));
        } else {
          saveCloudProgress();
        }
      } else if(Object.keys(state.answered).length > 0){
        saveCloudProgress();
      }
      setSyncStatus('已同步 · ' + formatCode(syncCode), 'on');
      refreshStats();
      render();
    }catch(e){ setSyncStatus('同步失败', ''); }
  }

  function refreshStats(){
    var total = Object.keys(state.answered).length;
    var right = 0;
    for(var k in state.answered){ if(state.answered[k]==='right') right++; }
    var wrong = total - right;
    var rate = total ? Math.round(right/total*100) : 0;
    document.getElementById('st-total').textContent = total;
    document.getElementById('st-right').textContent = right;
    document.getElementById('st-rate').textContent = rate + '%';
    document.getElementById('st-wrong').textContent = wrong;
  }

  function chName(q){
    if(q.src === '768') return CH_768[q.ch] || ('第'+q.ch+'章');
    if(q.src === 'zt') return (q.exam || '历年真题');
    return CH_JB[q.ch] || ('第'+q.ch+'章');
  }
  function srcName(q){
    if(q.src === '768') return '768题库';
    if(q.src === 'zt') return '历年真题';
    return '精编题库';
  }

  function refreshChSelect(){
    var src = document.getElementById('sel-src').value;
    var sel = document.getElementById('sel-ch');
    var map = (src === '768') ? CH_768 : CH_JB;
    var html = '<option value="all">全部章节</option>';
    var chs = [];
    ALL.forEach(function(q){
      if(src === 'all' || q.src === src){
        var c = String(q.ch);
        if(chs.indexOf(c) < 0) chs.push(c);
      }
    });
    chs.sort(function(a,b){ return parseInt(a)-parseInt(b); });
    chs.forEach(function(c){
      if(src === 'all'){
        html += '<option value="' + c + '">第' + c + '章</option>';
      } else if(src === 'zt'){
        // 真题按场次分组，ch 为场次编号，用 exam 显示
        var examName = '';
        ALL.forEach(function(q){ if(q.src==='zt' && String(q.ch)===c){ examName = q.exam || examName; } });
        html += '<option value="' + c + '">' + (examName || ('场次'+c)) + '</option>';
      } else {
        var name = map[parseInt(c)] || ('第'+c+'章');
        html += '<option value="' + c + '">第' + c + '章 ' + name + '</option>';
      }
    });
    sel.innerHTML = html;
  }

  function buildPool(){
    var src = document.getElementById('sel-src').value;
    var ch = document.getElementById('sel-ch').value;
    var list = ALL.filter(function(q){
      var srcOk = (src === 'all') || (q.src === src);
      var chOk = (ch === 'all') || (String(q.ch) === ch);
      return srcOk && chOk;
    });
    state.pool = list;
    state.order = list.map(function(_,i){ return i; });
    state.idx = 0;
  }

  function shuffle(arr){
    for(var i=arr.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var t = arr[i]; arr[i]=arr[j]; arr[j]=t;
    }
    return arr;
  }

  function currentQ(){
    if(state.idx >= state.order.length) return null;
    return state.pool[state.order[state.idx]];
  }
  function qKey(q){
    return q.src + '-' + q.ch + '-' + q.tag + '-' + q.q.substring(0,20);
  }

  function render(){
    var area = document.getElementById('quiz-area');
    var empty = document.getElementById('empty-area');
    var prog = document.getElementById('progress');
    var q = currentQ();

    if(!q || state.pool.length===0){
      area.classList.add('hidden');
      empty.classList.remove('hidden');
      prog.querySelector('i').style.width = '0%';
      return;
    }
    empty.classList.add('hidden');
    area.classList.remove('hidden');

    var total = state.order.length;
    var cur = state.idx + 1;
    prog.querySelector('i').style.width = (cur/total*100) + '%';

    var key = qKey(q);
    var done = state.answered[key];

    var html = '';
    html += '<div class="card">';
    html += '<div class="q-head">';
    html += '<span class="q-num">' + cur + ' / ' + total + '</span>';
    html += '<span class="star">' + (q.star||'') + '</span>';
    html += '<span class="tag">' + q.tag + '</span>';
    html += '<span class="src-tag">' + srcName(q) + '</span>';
    html += '<span class="q-meta">第' + q.ch + '章 ' + chName(q) + '</span>';
    html += '</div>';
    html += '<div class="q-text">' + q.q + '</div>';

    q.opts.forEach(function(opt){
      var letter = opt.trim().charAt(0);
      var cls = 'opt';
      if(done){
        cls += ' disabled';
        if(letter === q.ans) cls += ' correct';
        else if(state.answered[key] === 'wrong' && letter === state.lastPick) cls += ' wrong';
      }
      html += '<button class="' + cls + '" data-letter="' + letter + '">' + opt + '</button>';
    });

    if(done){
      var isRight = state.answered[key] === 'right';
      html += '<div class="exp-box ' + (isRight?'':'wrong') + '">';
      html += '<div class="exp-title">' + (isRight?'回答正确':'回答错误') + ' · 正确答案：<span class="ans-label">' + q.ans + '</span></div>';
      html += '<div class="exp-text">' + q.exp + '</div>';
      html += '</div>';
    }

    html += '<div class="nav">';
    html += '<button id="btn-prev" ' + (state.idx===0?'disabled':'') + '>上一题</button>';
    if(done){ html += '<button id="btn-next">下一题</button>'; }
    html += '</div>';
    html += '</div>';

    area.innerHTML = html;

    if(!done){
      area.querySelectorAll('.opt').forEach(function(btn){
        btn.addEventListener('click', function(){
          answer(btn.getAttribute('data-letter'));
        });
      });
    }
    var prev = document.getElementById('btn-prev');
    if(prev) prev.addEventListener('click', function(){ state.idx--; saveProgress(); render(); });
    var next = document.getElementById('btn-next');
    if(next) next.addEventListener('click', function(){
      if(state.idx < state.order.length-1){ state.idx++; saveProgress(); render(); }
    });
  }

  function answer(letter){
    var q = currentQ();
    if(!q) return;
    var key = qKey(q);
    if(state.answered[key]) return;
    state.answered[key] = (letter === q.ans) ? 'right' : 'wrong';
    state.lastPick = letter;
    saveProgress();
    refreshStats();
    render();
  }

  function startOrder(){
    buildPool();
    state.idx = 0;
    state.mode = 'normal';
    saveProgress();
    render();
    refreshStats();
  }
  function startRandom(){
    buildPool();
    shuffle(state.order);
    state.idx = 0;
    state.mode = 'random';
    saveProgress();
    render();
    refreshStats();
  }
  function startWrongBook(){
    var list = ALL.filter(function(q){
      return state.answered[qKey(q)] === 'wrong';
    });
    state.pool = list;
    state.order = list.map(function(_,i){ return i; });
    state.idx = 0;
    state.mode = 'wrongbook';
    saveProgress();
    if(list.length === 0){
      document.getElementById('quiz-area').classList.add('hidden');
      var e = document.getElementById('empty-area');
      e.classList.remove('hidden');
      e.innerHTML = '<p>暂无错题，继续加油！</p>';
      document.getElementById('progress').querySelector('i').style.width = '0%';
    } else { render(); }
  }

  // ============ 案例分析 ============
  function refreshCaseSelect(){
    var sel = document.getElementById('sel-case');
    var html = '<option value="all">全部案例</option>';
    CASES.forEach(function(c, i){
      html += '<option value="' + i + '">' + c.title + '</option>';
    });
    sel.innerHTML = html;
  }
  function renderCases(){
    var sel = document.getElementById('sel-case');
    var v = sel.value;
    var list = (v === 'all') ? CASES : [CASES[parseInt(v)]];
    var area = document.getElementById('case-area');
    var html = '';
    list.forEach(function(c, cIdx){
      // cIdx 需要用全局索引，先找到真实索引
      var realIdx = CASES.indexOf(c);
      html += '<div class="card" data-case="' + realIdx + '">';
      html += '<div class="q-head"><span class="domain-tag">' + c.domain + '</span><span class="q-meta">' + c.title + '</span></div>';
      html += '<div class="case-scenario"><strong>【场景】</strong>' + c.scenario + '</div>';
      c.questions.forEach(function(qq, qi){
        html += '<div class="case-q">' + qq.q + '<span class="case-points">' + qq.points + '</span></div>';
        html += '<textarea class="answer-input" data-case="' + realIdx + '" data-q="' + qi + '" placeholder="在此输入你的答案要点……"></textarea>';
        html += '<div class="grade-box" data-grade="' + realIdx + '-' + qi + '"></div>';
        html += '<div class="ans-list case-ans hidden"><div class="ans-title">参考答案：</div><ul>';
        qq.answer.forEach(function(a){ html += '<li>' + a + '</li>'; });
        html += '</ul></div>';
      });
      html += '</div>';
    });
    area.innerHTML = html;
  }
  function showCaseAnswers(show){
    document.querySelectorAll('#case-area .case-ans').forEach(function(el){
      if(show) el.classList.remove('hidden'); else el.classList.add('hidden');
    });
  }
  function renderCaseTemplate(){
    var area = document.getElementById('case-area');
    var html = '<div class="card"><div class="q-head"><span class="domain-tag">答题模板</span><span class="q-meta">通用框架</span></div>';
    Object.keys(CASE_TEMPLATE).forEach(function(k){
      html += '<div class="case-q">' + k + '</div>';
      html += '<div class="ans-list"><ul>';
      CASE_TEMPLATE[k].forEach(function(it){ html += '<li>' + it + '</li>'; });
      html += '</ul></div>';
    });
    html += '</div>';
    area.innerHTML = html;
  }

  // 案例分析评分：按关键词命中率打分
  function gradeCases(){
    var inputs = document.querySelectorAll('#case-area .answer-input');
    if(inputs.length === 0){ alert('请先进入案例分析模式，在输入框中作答后再评分。'); return; }
    var scored = 0, answered = 0;
    inputs.forEach(function(ta){
      var cIdx = parseInt(ta.getAttribute('data-case'));
      var qi = parseInt(ta.getAttribute('data-q'));
      var q = CASES[cIdx].questions[qi];
      var text = ta.value.trim();
      var box = document.querySelector('[data-grade="' + cIdx + '-' + qi + '"]');
      if(!text){
        box.className = 'grade-box';
        return;
      }
      answered++;
      var keys = q.keys || [];
      var hit = 0, miss = [];
      keys.forEach(function(k){
        if(text.indexOf(k) >= 0){ hit++; }
        else { miss.push(k); }
      });
      var rate = keys.length ? hit / keys.length : 0;
      var fullScore = parseInt(q.points) || 10;
      var score = Math.round(fullScore * rate * 10) / 10;
      var cls = rate >= 0.7 ? 'good' : (rate >= 0.4 ? 'mid' : 'low');
      var label = rate >= 0.7 ? '较好' : (rate >= 0.4 ? '一般' : '偏弱');
      var html = '<div class="g-score">' + score + ' / ' + fullScore + ' 分（' + label + '）</div>';
      html += '<div class="g-detail">关键词命中 ' + hit + '/' + keys.length + ' 个。命中：</div><div>';
      keys.forEach(function(k){
        html += '<span class="g-key ' + (text.indexOf(k)>=0?'hit':'miss') + '">' + k + '</span>';
      });
      html += '</div>';
      html += '<div class="g-detail" style="margin-top:6px;color:var(--sub)">注：案例题为开放性主观题，评分仅供参考，请对照参考答案完善采分点。</div>';
      box.className = 'grade-box show ' + cls;
      box.innerHTML = html;
      scored++;
    });
    if(answered === 0){ alert('请先填写至少一题的答案。'); }
  }

  // ============ 计算题 ============
  function renderFormulas(){
    var area = document.getElementById('calc-area');
    var html = '<div class="card"><div class="q-head"><span class="domain-tag">公式速查</span><span class="q-meta">先背公式再做题</span></div>';
    FORMULAS.forEach(function(g){
      html += '<div class="formula-group"><div class="fg-title">' + g.name + '</div>';
      g.items.forEach(function(it){
        var isFormula = /[=→]/.test(it) && /[A-Z]/.test(it);
        html += '<div class="fg-item' + (isFormula?' formula':'') + '">' + it + '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    area.innerHTML = html;
  }
  function renderCalcQuestions(){
    var area = document.getElementById('calc-area');
    var html = '';
    CALC_QUESTIONS.forEach(function(c, i){
      html += '<div class="card" data-calc="' + i + '">';
      html += '<div class="q-head"><span class="q-num">' + (i+1) + '</span><span class="q-meta">' + c.title + '</span></div>';
      html += '<div class="q-text">' + c.question + '</div>';
      html += '<textarea class="answer-input" data-calc="' + i + '" placeholder="在此输入你的答案（结果或计算过程）……"></textarea>';
      html += '<div class="grade-box" data-grade="calc-' + i + '"></div>';
      html += '<div class="ans-list calc-ans hidden"><div class="ans-title">答案：</div><ul>';
      c.answer.forEach(function(a){ html += '<li>' + a + '</li>'; });
      html += '</ul></div>';
      html += '</div>';
    });
    area.innerHTML = html;
  }
  function showCalcAnswers(show){
    document.querySelectorAll('#calc-area .calc-ans').forEach(function(el){
      if(show) el.classList.remove('hidden'); else el.classList.add('hidden');
    });
  }
  function renderCalcTips(){
    var area = document.getElementById('calc-area');
    var html = '<div class="card"><div class="q-head"><span class="domain-tag">答题技巧</span></div><div class="ans-list"><ul>';
    CALC_TIPS.forEach(function(t){ html += '<li>' + t + '</li>'; });
    html += '</ul></div></div>';
    area.innerHTML = html;
  }

  // 计算题评分：按关键数值命中打分
  function gradeCalc(){
    var inputs = document.querySelectorAll('#calc-area .answer-input');
    if(inputs.length === 0){ alert('请先进入「例题练习」模式，在输入框中作答后再评分。'); return; }
    var answered = 0;
    inputs.forEach(function(ta){
      var i = parseInt(ta.getAttribute('data-calc'));
      var c = CALC_QUESTIONS[i];
      var text = ta.value.trim();
      var box = document.querySelector('[data-grade="calc-' + i + '"]');
      if(!text){ box.className = 'grade-box'; return; }
      answered++;
      var keys = c.keys || [];
      var hit = 0;
      keys.forEach(function(k){
        // 数值匹配：忽略空格，支持负号、小数点
        var pat = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if(new RegExp(pat).test(text)) hit++;
      });
      var rate = keys.length ? hit / keys.length : 0;
      var cls = rate >= 0.8 ? 'good' : (rate >= 0.4 ? 'mid' : 'low');
      var label = rate >= 0.8 ? '答对' : (rate >= 0.4 ? '部分答对' : '需订正');
      var html = '<div class="g-score">' + label + '（命中 ' + hit + '/' + keys.length + ' 个关键结果）</div>';
      html += '<div class="g-detail">关键结果：</div><div>';
      keys.forEach(function(k){
        var pat = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        html += '<span class="g-key ' + (new RegExp(pat).test(text)?'hit':'miss') + '">' + k + '</span>';
      });
      html += '</div>';
      html += '<div class="g-detail" style="margin-top:6px;color:var(--sub)">提示：点击「参考答案」查看完整解题步骤。</div>';
      box.className = 'grade-box show ' + cls;
      box.innerHTML = html;
    });
    if(answered === 0){ alert('请先填写至少一题的答案。'); }
  }

  // ============ 模拟考试 ============
  var examState = { active: false, questions: [], answers: {}, startTime: 0, timer: null, submitted: false };

  function startExam(){
    // 随机抽 75 题
    var pool = ALL.slice();
    shuffle(pool);
    examState.questions = pool.slice(0, 75);
    examState.answers = {};
    examState.submitted = false;
    examState.active = true;
    examState.startTime = Date.now();
    document.getElementById('btn-exam-start').classList.add('hidden');
    document.getElementById('btn-exam-submit').classList.remove('hidden');
    renderExam();
    startTimer();
  }

  function startTimer(){
    clearInterval(examState.timer);
    examState.timer = setInterval(function(){
      var el = document.getElementById('exam-timer');
      if(!el) return;
      var elapsed = Math.floor((Date.now() - examState.startTime) / 1000);
      var remain = 150*60 - elapsed;
      if(remain <= 0){ remain = 0; submitExam(); return; }
      var h = Math.floor(remain/3600), m = Math.floor((remain%3600)/60), s = remain%60;
      el.textContent = '剩余时间：' + (h>0?h+'时':'') + m + '分' + s + '秒';
      if(remain < 600) el.classList.add('warn'); else el.classList.remove('warn');
    }, 1000);
  }

  function renderExam(){
    var area = document.getElementById('exam-area');
    var html = '<div class="exam-timer" id="exam-timer">剩余时间：2时30分0秒</div>';
    // 答题卡
    html += '<div class="answer-sheet"><h3>答题卡（点击跳题）</h3><div class="exam-grid">';
    examState.questions.forEach(function(q, i){
      var cls = 'eg';
      if(examState.answers[i]) cls += ' done';
      html += '<div class="' + cls + '" data-i="' + i + '">' + (i+1) + '</div>';
    });
    html += '</div></div>';
    // 当前题
    html += '<div id="exam-q-area"></div>';
    area.innerHTML = html;
    area.querySelectorAll('.eg').forEach(function(el){
      el.addEventListener('click', function(){
        examState.cur = parseInt(el.getAttribute('data-i'));
        renderExamQuestion();
        updateExamGrid();
      });
    });
    examState.cur = 0;
    renderExamQuestion();
    updateExamGrid();
  }

  function renderExamQuestion(){
    var area = document.getElementById('exam-q-area');
    var i = examState.cur;
    var q = examState.questions[i];
    var picked = examState.answers[i];
    var html = '<div class="card">';
    html += '<div class="q-head"><span class="q-num">' + (i+1) + ' / 75</span>';
    html += '<span class="tag">' + q.tag + '</span><span class="src-tag">' + srcName(q) + '</span>';
    html += '<span class="q-meta">第' + q.ch + '章 ' + chName(q) + '</span></div>';
    html += '<div class="q-text">' + q.q + '</div>';
    q.opts.forEach(function(opt){
      var letter = opt.trim().charAt(0);
      var cls = 'opt' + (picked === letter ? ' selected' : '');
      html += '<button class="' + cls + '" data-letter="' + letter + '">' + opt + '</button>';
    });
    html += '<div class="nav">';
    html += '<button id="exam-prev" ' + (i===0?'disabled':'') + '>上一题</button>';
    html += '<button id="exam-next" ' + (i===74?'disabled':'') + '>下一题</button>';
    html += '</div></div>';
    area.innerHTML = html;

    area.querySelectorAll('.opt').forEach(function(btn){
      btn.addEventListener('click', function(){
        examState.answers[i] = btn.getAttribute('data-letter');
        renderExamQuestion();
        updateExamGrid();
      });
    });
    var prev = document.getElementById('exam-prev');
    if(prev) prev.addEventListener('click', function(){ if(examState.cur>0){ examState.cur--; renderExamQuestion(); updateExamGrid(); } });
    var next = document.getElementById('exam-next');
    if(next) next.addEventListener('click', function(){ if(examState.cur<74){ examState.cur++; renderExamQuestion(); updateExamGrid(); } });
  }

  function updateExamGrid(){
    document.querySelectorAll('#exam-area .eg').forEach(function(el){
      var i = parseInt(el.getAttribute('data-i'));
      el.classList.toggle('done', !!examState.answers[i]);
      el.classList.toggle('cur', i === examState.cur);
    });
  }

  function submitExam(){
    if(examState.submitted) return;
    clearInterval(examState.timer);
    examState.submitted = true;
    var right = 0;
    examState.questions.forEach(function(q, i){
      if(examState.answers[i] === q.ans) right++;
    });
    var total = examState.questions.length;
    var pass = right >= 45;
    document.getElementById('btn-exam-submit').classList.add('hidden');
    document.getElementById('btn-exam-start').classList.remove('hidden');

    var area = document.getElementById('exam-area');
    var html = '<div class="card score-box">';
    html += '<div class="big ' + (pass?'pass':'fail') + '">' + right + ' / ' + total + '</div>';
    html += '<p style="margin:10px 0;font-size:18px">得分 ' + right + ' 分（每题1分）</p>';
    html += '<p style="font-size:16px;font-weight:700;color:' + (pass?'var(--green)':'var(--red)') + '">' + (pass?'✅ 及格（≥45分）':'❌ 未及格（<45分）') + '</p>';
    html += '<p style="margin-top:10px;color:var(--sub)">答对 ' + right + ' 题，答错 ' + (total-right) + ' 题，正确率 ' + Math.round(right/total*100) + '%</p>';
    html += '</div>';
    // 错题回顾
    html += '<div class="card"><div class="q-head"><span class="domain-tag">错题回顾</span></div>';
    var hasWrong = false;
    examState.questions.forEach(function(q, i){
      if(examState.answers[i] !== q.ans){
        hasWrong = true;
        html += '<div class="review-item">';
        html += '<div class="ri-q">' + (i+1) + '. ' + q.q + '</div>';
        html += '<div>你的答案：' + (examState.answers[i]||'未作答') + '，正确答案：<span style="color:var(--green);font-weight:700">' + q.ans + '</span></div>';
        html += '<div style="font-size:13px;color:#374151;margin-top:4px">' + q.exp + '</div>';
        html += '</div>';
      }
    });
    if(!hasWrong) html += '<p style="color:var(--green)">全部答对，太棒了！</p>';
    html += '</div>';
    area.innerHTML = html;
    examState.active = false;
  }

  function exitExam(){
    clearInterval(examState.timer);
    examState.active = false;
    examState.submitted = false;
    document.getElementById('btn-exam-submit').classList.add('hidden');
    document.getElementById('btn-exam-start').classList.remove('hidden');
    var area = document.getElementById('exam-area');
    area.innerHTML = '<div class="card empty"><p>模拟考试说明：</p><p style="margin-top:8px">· 从全部题库随机抽取 75 题（含英文题）</p><p>· 限时 150 分钟，与真实考试一致</p><p>· 可自由跳题、随时交卷</p><p>· 交卷后统一判分，及格线 45 分（每题 1 分）</p></div>';
  }

  // ============ 知识背诵 ============
  function renderHou5(){
    var area = document.getElementById('mem-area');
    var html = '<div class="mem-card"><div class="mem-h1">后五大管理 · 案例分析背诵手册</div><div class="mem-freq">资源 · 沟通 · 风险 · 采购 · 干系人管理</div></div>';
    HOU5.forEach(function(ch){
      html += '<div class="mem-card">';
      html += '<div class="mem-h1">' + ch.ch + ' ' + ch.name + '</div>';
      html += '<div class="mem-freq">考频：' + ch.freq + '</div>';
      html += '<div class="mem-h2">高频找茬点</div>';
      ch.find_faults.forEach(function(f){ html += '<div class="mem-item">' + f + '</div>'; });
      html += '<div class="mem-h2">核心过程速记</div>';
      ch.processes.forEach(function(p){ html += '<div class="mem-item">' + p + '</div>'; });
      html += '<div class="mem-h2">必背内容</div>';
      ch.must_memorize.forEach(function(mm){
        html += '<div class="mem-h3">' + mm.title + '</div>';
        mm.items.forEach(function(it){ html += '<div class="mem-item">' + it + '</div>'; });
      });
      if(ch.tips.length){
        html += '<div class="mem-tip">';
        ch.tips.forEach(function(t){ html += '<div><b>口诀：</b>' + t + '</div>'; });
        html += '</div>';
      }
      html += '</div>';
    });
    area.innerHTML = html;
  }

  function renderSupplements(){
    var area = document.getElementById('mem-area');
    var html = '<div class="mem-card"><div class="mem-h1">考点补充笔记 · 9 处遗漏考点</div><div class="mem-freq">按考试出现概率 × 分值排序，直接背诵</div></div>';
    SUPPLEMENTS.forEach(function(s){
      html += '<div class="mem-card">';
      html += '<div class="mem-h1">' + s.title + '</div>';
      if(s.star) html += '<div class="mem-freq">' + s.star + '</div>';
      if(s.desc) html += '<div class="mem-item">' + s.desc + '</div>';
      s.items.forEach(function(it){ html += '<div class="mem-item">' + it + '</div>'; });
      if(s.tip) html += '<div class="mem-tip"><div><b>口诀：</b>' + s.tip + '</div></div>';
      html += '</div>';
    });
    // 49 过程映射
    html += '<div class="mem-card"><div class="mem-h1">49 过程组 ↔ 知识领域映射</div><div class="mem-freq">应对"规划阶段存在哪些问题"这类案例问法</div>';
    PROCESS_GROUPS.forEach(function(g){
      html += '<div class="mem-h3">' + g.group + '（' + g.count + ' 个过程）</div>';
      html += '<div class="mem-item">' + g.names + '</div>';
    });
    html += '</div>';
    area.innerHTML = html;
  }

  function renderItto(){
    var area = document.getElementById('mem-area');
    var html = '<div class="mem-card"><div class="mem-h1">49 个过程 ITTO 总表</div><div class="mem-freq">十大知识领域 · 输入/工具/输出全览，点击过程名展开</div>';
    html += '<input type="text" class="itto-search" id="itto-search" placeholder="🔍 搜索过程名（如：章程、WBS、风险）……">';
    html += '<div id="itto-list">';
    ITTO.domains.forEach(function(d){
      html += '<div class="itto-domain" data-domain="' + d.name + '">';
      html += '<div class="d-title">' + d.name + '</div>';
      d.processes.forEach(function(p){
        html += '<div class="itto-proc" data-name="' + p.name + '">';
        html += '<div class="p-head"><span class="p-name">' + p.name + '</span><span class="p-group">' + p.group + '</span></div>';
        html += '<div class="p-body">';
        html += '<div class="p-row"><b>定义：</b><span>' + p.def + '</span></div>';
        html += '<div class="p-row"><b>作用：</b><span>' + p.func + '</span></div>';
        html += '<div class="p-row"><b>输入：</b><span>' + p.input + '</span></div>';
        html += '<div class="p-row"><b>工具与技术：</b><span>' + p.tools + '</span></div>';
        html += '<div class="p-row"><b>输出：</b><span>' + p.output + '</span></div>';
        html += '</div></div>';
      });
      html += '</div>';
    });
    html += '</div></div>';
    area.innerHTML = html;
    // 展开/收起
    area.querySelectorAll('.p-head').forEach(function(h){
      h.addEventListener('click', function(){
        h.parentElement.classList.toggle('open');
      });
    });
    // 搜索
    var search = document.getElementById('itto-search');
    if(search){
      search.addEventListener('input', function(){
        var kw = search.value.trim();
        area.querySelectorAll('.itto-proc').forEach(function(proc){
          var name = proc.getAttribute('data-name');
          if(!kw || name.indexOf(kw) >= 0){ proc.style.display = ''; }
          else { proc.style.display = 'none'; }
        });
        area.querySelectorAll('.itto-domain').forEach(function(dm){
          var any = Array.prototype.some.call(dm.querySelectorAll('.itto-proc'), function(p){ return p.style.display !== 'none'; });
          dm.style.display = any ? '' : 'none';
        });
      });
    }
  }

  function renderKoujue(){
    var area = document.getElementById('mem-area');
    var html = '<div class="mem-card"><div class="mem-h1">背诵口诀总览</div><div class="mem-freq">选择题+案例题的速记利器</div>';
    ITTO.koujue.forEach(function(k){
      html += '<div class="mem-card" style="border-left:4px solid var(--green)">';
      html += '<div class="mem-h3">' + k.name + '</div>';
      if(k.jue) html += '<div class="mem-tip"><b>口诀：</b>' + k.jue + '</div>';
      if(k.detail) html += '<div class="mem-item">' + k.detail + '</div>';
      if(k.note) html += '<div class="mem-item" style="color:var(--sub)">' + k.note + '</div>';
      html += '</div>';
    });
    // 各章口诀（从 HOU5 汇总）
    html += '<div class="mem-card"><div class="mem-h1">后五大管理 · 章节口诀</div>';
    HOU5.forEach(function(ch){
      if(ch.tips.length){
        html += '<div class="mem-h3">' + ch.ch + ' ' + ch.name + '</div>';
        ch.tips.forEach(function(t){ html += '<div class="mem-tip"><b>口诀：</b>' + t + '</div>'; });
      }
    });
    html += '</div>';
    area.innerHTML = html;
  }

  function renderMemTemplate(){
    var area = document.getElementById('mem-area');
    var html = '<div class="mem-card"><div class="mem-h1">案例分析通用答题模板</div></div>';
    Object.keys(CASE_ANSWER_TEMPLATE).forEach(function(k){
      html += '<div class="mem-card">';
      html += '<div class="mem-h2" style="border:none;padding-left:0">' + k + '</div>';
      CASE_ANSWER_TEMPLATE[k].forEach(function(it){ html += '<div class="mem-item">' + it + '</div>'; });
      html += '</div>';
    });
    area.innerHTML = html;
  }

  // ============ 模式切换 ============
  function switchMode(mode){
    document.querySelectorAll('.mode-nav button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-mode') === mode);
    });
    document.getElementById('mode-quiz').classList.toggle('hidden', mode !== 'quiz');
    document.getElementById('mode-case').classList.toggle('hidden', mode !== 'case');
    document.getElementById('mode-calc').classList.toggle('hidden', mode !== 'calc');
    document.getElementById('mode-exam').classList.toggle('hidden', mode !== 'exam');
    document.getElementById('mode-mem').classList.toggle('hidden', mode !== 'mem');
    document.getElementById('quiz-stats').classList.toggle('hidden', mode !== 'quiz');
  }

  document.querySelectorAll('.mode-nav button').forEach(function(b){
    b.addEventListener('click', function(){ switchMode(b.getAttribute('data-mode')); });
  });

  // 刷题事件
  document.getElementById('sel-src').addEventListener('change', function(){
    refreshChSelect(); buildPool(); state.idx = 0; render();
  });
  document.getElementById('sel-ch').addEventListener('change', function(){
    buildPool(); state.idx = 0; render();
  });
  document.getElementById('btn-order').addEventListener('click', startOrder);
  document.getElementById('btn-random').addEventListener('click', startRandom);
  document.getElementById('btn-wrongbook').addEventListener('click', startWrongBook);
  document.getElementById('btn-reset').addEventListener('click', function(){
    if(confirm('确定要重置所有刷题进度吗？')) resetProgress();
  });

  // 案例分析事件
  document.getElementById('sel-case').addEventListener('change', renderCases);
  document.getElementById('btn-case-grade').addEventListener('click', gradeCases);
  document.getElementById('btn-case-show').addEventListener('click', function(){ showCaseAnswers(true); });
  document.getElementById('btn-case-hide').addEventListener('click', function(){ showCaseAnswers(false); });
  document.getElementById('btn-case-template').addEventListener('click', renderCaseTemplate);

  // 计算题事件
  document.getElementById('btn-calc-formula').addEventListener('click', renderFormulas);
  document.getElementById('btn-calc-practice').addEventListener('click', renderCalcQuestions);
  document.getElementById('btn-calc-grade').addEventListener('click', gradeCalc);
  document.getElementById('btn-calc-show').addEventListener('click', function(){ showCalcAnswers(true); });
  document.getElementById('btn-calc-hide').addEventListener('click', function(){ showCalcAnswers(false); });
  document.getElementById('btn-calc-tips').addEventListener('click', renderCalcTips);

  // 模拟考试事件
  document.getElementById('btn-exam-start').addEventListener('click', startExam);
  document.getElementById('btn-exam-submit').addEventListener('click', submitExam);
  document.getElementById('btn-exam-exit').addEventListener('click', exitExam);

  // 知识背诵事件
  document.getElementById('btn-mem-hou5').addEventListener('click', renderHou5);
  document.getElementById('btn-mem-supp').addEventListener('click', renderSupplements);
  document.getElementById('btn-mem-itto').addEventListener('click', renderItto);
  document.getElementById('btn-mem-koujue').addEventListener('click', renderKoujue);
  document.getElementById('btn-mem-tpl').addEventListener('click', renderMemTemplate);

  // 初始化
  initCloud();
  loadProgress();

  // 同步码相关事件
  var btnLogin = document.getElementById('btn-login');
  if(btnLogin) btnLogin.addEventListener('click', showLogin);
  var btnSyncGen = document.getElementById('btn-sync-gen');
  if(btnSyncGen) btnSyncGen.addEventListener('click', fillRandomCode);
  var btnSyncApply = document.getElementById('btn-sync-apply');
  if(btnSyncApply) btnSyncApply.addEventListener('click', applySyncCode);
  var btnCancel = document.getElementById('btn-login-cancel');
  if(btnCancel) btnCancel.addEventListener('click', hideLogin);
  var btnCopyCode = document.getElementById('btn-copy-code');
  if(btnCopyCode) btnCopyCode.addEventListener('click', copySyncCode);
  var btnSyncOff = document.getElementById('btn-sync-off');
  if(btnSyncOff) btnSyncOff.addEventListener('click', function(){ turnOffSync(); hideLogin(); });

  // 暂存恢复信息（buildPool 会覆盖 state.order/idx）
  var savedMode = state.mode;
  var savedOrder = state.order.slice();
  var savedIdx = state.idx;

  // 恢复上次的筛选条件
  if(state.savedSrc){
    var srcSel = document.getElementById('sel-src');
    srcSel.value = state.savedSrc;
  }
  refreshChSelect();
  if(state.savedCh){
    var chSel = document.getElementById('sel-ch');
    var chExists = Array.prototype.some.call(chSel.options, function(o){ return o.value === state.savedCh; });
    if(chExists) chSel.value = state.savedCh;
  }

  buildPool();

  // 恢复刷题位置
  var restored = false;
  if(savedMode === 'random' && savedOrder && savedOrder.length === state.pool.length){
    state.order = savedOrder.slice();
    state.mode = 'random';
    state.idx = Math.min(savedIdx, state.order.length - 1);
    restored = true;
  } else if(savedMode === 'wrongbook'){
    var wrongList = ALL.filter(function(q){ return state.answered[qKey(q)] === 'wrong'; });
    state.pool = wrongList;
    state.order = wrongList.map(function(_,i){ return i; });
    state.mode = 'wrongbook';
    if(wrongList.length > 0){
      state.idx = Math.min(savedIdx, state.order.length - 1);
      restored = true;
    } else {
      state.mode = 'normal';
    }
  } else {
    state.mode = 'normal';
    if(savedIdx > 0 && savedIdx < state.order.length){
      state.idx = savedIdx;
      restored = true;
    } else {
      state.idx = 0;
    }
  }

  if(state.pool.length > 0 && restored){
    render();
  } else if(state.pool.length > 0){
    state.idx = 0;
    render();
  }
  refreshStats();
  refreshCaseSelect();
  renderCases();
  renderFormulas();
  renderHou5();

  // 检查同步码并同步云端进度（异步，不阻塞本地渲染）
  checkSyncOnStart();
})();
