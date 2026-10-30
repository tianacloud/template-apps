    /* ============================================================
       0) 工具函数
       ============================================================ */
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
    }
    function parseList(str) {
      if (!str) return [];
      return str.split(/[,，、\n]/).map(s => s.trim()).filter(Boolean).slice(0, 8);
    }
    function genId(seed) {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
      return String(h % 1000000).padStart(6, '0');
    }
    function today() { return new Date().toISOString().split('T')[0]; }
    function uid() { return Date.now() + '_' + Math.random().toString(36).slice(2, 6); }

    /* ============================================================
       1) 等级系统 (LV.1 ~ LV.30)
       ============================================================ */
    const LEVEL_TABLE = (function() {
      const table = [0];
      let total = 0;
      for (let lv = 1; lv <= 30; lv++) {
        table[lv] = total;
        const base = Math.round(80 + lv * 20 * Math.pow(1.12, lv));
        total += base;
      }
      table[31] = total;
      return table;
    })();

    function getLevel(exp) {
      for (let lv = 30; lv >= 1; lv--) {
        if (exp >= LEVEL_TABLE[lv]) return lv;
      }
      return 1;
    }

    function getExpProgress(exp) {
      const lv = getLevel(exp);
      if (lv >= 30) return { lv, current: exp - LEVEL_TABLE[30], need: 0, pct: 100 };
      const curBase = LEVEL_TABLE[lv];
      const nextBase = LEVEL_TABLE[lv + 1];
      const current = exp - curBase;
      const need = nextBase - curBase;
      const pct = need > 0 ? Math.min(100, Math.round(current / need * 100)) : 100;
      return { lv, current, need, pct };
    }

    function addExp(amount, label) {
      const data = getPlayerData();
      const oldLv = getLevel(data.exp);
      data.exp += amount;
      const newLv = getLevel(data.exp);
      savePlayerData(data);
      renderExpBar(data.exp);
      showExpToast(amount, label || '');
      if (newLv > oldLv) {
        setTimeout(() => showLevelUp(newLv), 800);
      }
      // 宠物联动：现实里完成一件事，有几率掉落食材/道具（宠物自身产生的经验不再触发）
      try {
        if (typeof window.petDrop === 'function' && String(label || '').indexOf('🐾') !== 0) {
          window.petDrop(label || '完成一件事');
        }
      } catch (e) { }
    }

    function showExpToast(amount, label) {
      const toast = document.getElementById('expToast');
      const text = document.getElementById('expToastText');
      if (!toast || !text) return;
      text.textContent = amount ? ('+' + amount + ' EXP' + (label ? ' (' + label + ')' : '')) : (label || '');
      toast.style.display = 'flex';
      toast.style.animation = 'none';
      void toast.offsetHeight; // reflow
      toast.style.animation = 'expToastIn 0.3s ease, expToastOut 0.3s ease 1.5s forwards';
      setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }

    function showLevelUp(lv) {
      const toast = document.getElementById('levelUpToast');
      document.getElementById('levelUpLvl').textContent = 'Lv.' + lv;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }

    /* ============================================================
       1.6) 自绘弹窗系统（xAlert / xConfirm / xPrompt）
       沙箱 iframe（未允许 allow-modals）会静默拦截原生
       alert/confirm/prompt，导致 reset/删除/领养等流程失效，
       因此全部改用 DOM 弹窗。全部返回 Promise。
       ============================================================ */
    function _xmodalMount(msg, opts) {
      return new Promise(resolve => {
        const ov = document.createElement('div');
        ov.className = 'xmodal-overlay';
        const inputHtml = opts.input
          ? '<input class="xmodal-input" id="xmodalInput" type="text" value="' + String(opts.input).replace(/"/g, '&quot;') + '" maxlength="24">'
          : '';
        ov.innerHTML =
          '<div class="xmodal-box">' +
            '<div class="xmodal-msg"></div>' +
            inputHtml +
            '<div class="xmodal-btns">' +
              (opts.confirm ? '<button type="button" class="btn-pixel secondary" id="xmodalNo">取消</button>' : '') +
              '<button type="button" class="btn-pixel primary" id="xmodalYes">' + (opts.yesText || '确定') + '</button>' +
            '</div>' +
          '</div>';
        ov.querySelector('.xmodal-msg').textContent = msg;
        document.body.appendChild(ov);
        const done = (val) => { try { ov.remove(); } catch(e) {} resolve(val); };
        ov.querySelector('#xmodalYes').onclick = () => {
          if (opts.input) {
            const v = (document.getElementById('xmodalInput').value || '').trim();
            done(v === '' ? null : v);
          } else {
            done(true);
          }
        };
        const noBtn = ov.querySelector('#xmodalNo');
        if (noBtn) noBtn.onclick = () => done(opts.input ? null : false);
        ov.addEventListener('click', (e) => { if (e.target === ov && opts.confirm) done(opts.input ? null : false); });
        const inp = ov.querySelector('#xmodalInput');
        if (inp) { setTimeout(() => inp.focus(), 50); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ov.querySelector('#xmodalYes').click(); }); }
      });
    }
    function xAlert(msg) { return _xmodalMount(msg, {}); }
    function xConfirm(msg) { return _xmodalMount(msg, { confirm: true }); }
    function xPrompt(msg, def) { return _xmodalMount(msg, { confirm: true, input: def || '' }); }
    window.xAlert = xAlert; window.xConfirm = xConfirm; window.xPrompt = xPrompt;

    /* ----- 漫画风：战斗力 / 段位 / 连击 ----- */
    const RANK_TABLE = [
      [1, '见习勇者'], [3, '青铜战士'], [5, '白银战士'], [8, '黄金战士'],
      [12, '圣斗士'], [16, '神斗士'], [20, '传说战士'], [25, '界王'], [30, '超级老李']
    ];
    function rankForLevel(lv) {
      let name = RANK_TABLE[0][1];
      for (const [min, n] of RANK_TABLE) { if (lv >= min) name = n; }
      return name;
    }
    function calcStreak() {
      // 连续有经历记录的天数（今天没记则允许从昨天起算）
      try {
        const set = {};
        getExperiences().forEach(e => { if (e && e.date) set[String(e.date).slice(0, 10)] = 1; });
        let streak = 0;
        const d = new Date();
        const key = () => d.toISOString().split('T')[0];
        if (!set[key()]) d.setDate(d.getDate() - 1); // 今天还没记录，从昨天看
        while (set[key()]) { streak++; d.setDate(d.getDate() - 1); }
        return streak;
      } catch (e) { return 0; }
    }
    function renderPowerRow(exp, lv) {
      const powerEl = document.getElementById('powerNum');
      if (!powerEl) return;
      const power = 5 + exp * 3 + lv * 100;
      powerEl.textContent = power.toLocaleString();
      const rankEl = document.getElementById('rankName');
      if (rankEl) {
        const r = rankForLevel(lv);
        rankEl.textContent = r;
        rankEl.className = 'rank-badge' + (lv >= 12 ? ' gold' : (lv >= 5 ? ' silver' : ''));
      }
      const streakEl = document.getElementById('streakNum');
      if (streakEl) streakEl.textContent = calcStreak() + ' 天';
    }

    function renderExpBar(exp) {
      const p = getExpProgress(exp);
      document.getElementById('lvlDisplay').textContent = 'Lv.' + p.lv;
      document.getElementById('expNum').textContent = p.lv >= 30 ? 'MAX' : (p.current + ' / ' + p.need);
      document.getElementById('expBarFill').style.width = p.pct + '%';
      renderPowerRow(exp, p.lv);
    }

    /* ============================================================
       2) 数据层 (localStorage)
       ============================================================ */
    const LS_PROFILE = 'earth_online_profile';
    const LS_EXPERIENCES = 'earth_online_experiences';
    const LS_SKILLS = 'earth_online_skills';
    const LS_PLAYER = 'earth_online_player';
    const LS_TREES = 'earth_online_trees';
    const LS_CHAR_IMAGE = 'earth_online_char_image';
    const LS_CHAR_PROMPT = 'earth_online_char_pending_prompt';
    const LS_CHAR_SKIPPED = 'earth_online_char_skipped';
    const LS_TODOS = 'earth_online_today_todos';

    /* ============================================================
       2.5) 资料库数据表双向同步（DBSync）
       ============================================================ */
    const DB_IDS = {
      profile: 'profile',
      experiences: 'experiences',
      skills: 'skills',
      tasks: 'tasks'
    };
    const dbSdk = () => {
      try { if (window.__DBQ && window.__DBQ.sdk) return window.__DBQ.sdk(); } catch(e) {}
      return (window.__SMART_PAGE__ && window.__SMART_PAGE__.database) || null;
    };
    // 所有云端调用必须串行（并发会被平台拒绝）
    function sdkRun(fn, tries) {
      try { if (window.__DBQ && window.__DBQ.run) return window.__DBQ.run(fn, tries); } catch(e) {}
      return Promise.resolve().then(fn);
    }
    const dbOnline = () => !!dbSdk() && DB_IDS.profile.indexOf('__') !== 0;
    /* 云端运行时诊断：出错时能把原因展示给用户 */
    const _dbg = { sdk: false, ls: 'unknown', lastError: '', tables: {}, pulledAt: '' };
    try { window.__DBG = _dbg; } catch(e) {}
    const _dbCache = { profile: null, experiences: [], skills: [], tasks: [] };
    const STATUS_ZH = { 'lit': '已点亮', 'learning': '进行中', 'want': '想参与' };
    const STATUS_EN = { '已点亮': 'lit', '进行中': 'learning', '想参与': 'want' };

    const DB_SELECT_KEYS = ['状态', '类型'];
    const DB_DATE_KEYS = ['日期', '确认日期'];
    const DB_BOOL_KEYS = ['是否完成'];
    const DB_NUM_KEYS = ['总经验'];

    function dbDate(v) {
      if (!v) return null;
      const s = String(v);
      return s.length >= 10 ? s.slice(0, 10) : null;
    }
    function dbVal(rec, name) {
      const v = rec ? rec[name] : undefined;
      return v === undefined ? null : v;
    }
    function dbText(rec, name) {
      const v = dbVal(rec, name);
      return v === null ? '' : String(v);
    }
    // 自然键取值：日期截到天，布尔转标记
    function dbKeyVal(v) {
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return v ? '1' : '0';
      return dbDate(v) || String(v);
    }
    // 平铺 raw 值 -> SDK PropertyValue map（空值跳过，checkbox 始终写）
    function dbProps(raw) {
      const props = {};
      Object.keys(raw || {}).forEach(k => {
        const v = raw[k];
        if (v === null || v === undefined) return;
        if (DB_BOOL_KEYS.indexOf(k) >= 0) { props[k] = { checkbox: !!v }; return; }
        if (DB_NUM_KEYS.indexOf(k) >= 0) { props[k] = { number: Number(v) || 0 }; return; }
        const s = String(v == null ? '' : v);
        if (DB_SELECT_KEYS.indexOf(k) >= 0) { if (s) props[k] = { select: s }; return; }
        if (DB_DATE_KEYS.indexOf(k) >= 0) { const d = dbDate(v); if (d) props[k] = { date: d }; return; }
        if (s) props[k] = { text: s };
      });
      return props;
    }
    // 分页拉全量（query 返回 { results, nextCursor, hasMore }，调用全部串行）
    async function dbQueryAll(dbId) {
      const sdk = dbSdk();
      if (!sdk) throw new Error('SDK_NOT_READY');
      let out = [], cursor = null, guard = 0;
      do {
        const params = { databaseId: dbId, pageSize: 200 };
        if (cursor) params.startCursor = cursor;
        const r = await sdkRun(() => sdk.query(params));
        const page = (r && r.results) || [];
        out = out.concat(page);
        guard++;
        const next = r && r.nextCursor;
        cursor = (r && r.hasMore && next && next !== cursor && page.length && guard < 100) ? next : null;
      } while (cursor);
      return out;
    }

    /* ---------- 拉取：云端 -> localStorage ----------
       逐张表独立拉取（串行），单表失败不影响其它表；返回 { ok, okCount, err }
       并把数据同时缓存到 _lastPull，便于不依赖 localStorage 直接使用 */
    let _lastPull = { profile: null, experiences: null, skills: null, tasks: null };
    async function dbPullAll() {
      const sdk = dbSdk();
      _dbg.sdk = !!sdk;
      try { _dbg.ls = (window.__DBQ && window.__DBQ.ls) || 'unknown'; } catch(e) {}
      if (!sdk || !dbOnline()) {
        _dbg.lastError = sdk ? 'TABLE_NOT_BOUND' : 'SDK_NOT_READY';
        updateCloudBadge();
        return false;
      }
      const plan = [
        ['profile', DB_IDS.profile],
        ['experiences', DB_IDS.experiences],
        ['skills', DB_IDS.skills],
        ['tasks', DB_IDS.tasks]
      ];
      let okCount = 0, err = '';
      const got = {};
      for (const [kind, dbId] of plan) {
        try {
          got[kind] = await dbQueryAll(dbId);
          _dbg.tables[kind] = (got[kind] || []).length;
          okCount++;
        } catch (e) {
          got[kind] = kind === 'profile' ? [] : (got[kind] || []);
          _dbg.tables[kind] = -1;
          err = String((e && (e.message || e.code || e.msg)) || e || 'unknown');
        }
      }
      const rows = (v) => Array.isArray(v) ? v : [];
      _lastPull = {
        profile: rows(got.profile), experiences: rows(got.experiences),
        skills: rows(got.skills), tasks: rows(got.tasks)
      };
      _dbg.lastError = err;
      _dbg.pulledAt = new Date().toISOString();

      try {
        // --- 玩家档案（单行） ---
        const profRows = rows(got.profile);
        _dbCache.profile = profRows[0] || null;
        if (profRows[0]) {
          const r = profRows[0];
          const p = getProfile();
          p.nickname = dbText(r, '昵称') || p.nickname;
          p.personality = dbText(r, '性格') || p.personality;
          p.likes = dbText(r, '喜好') || p.likes;
          p.food = dbText(r, '喜欢的食物') || p.food;
          p.oneLineDesc = dbText(r, '一句话描述') || p.oneLineDesc;
          p.interests = dbText(r, '兴趣关键词') || p.interests;
          p.futureJobs = dbText(r, '职业关键词') || p.futureJobs;
          try { localStorage.setItem(LS_PROFILE, JSON.stringify(p)); } catch(e) {}
          // 经验值：取 max（本地刚获得的成长不能被云端旧值回滚）
          const expNum = Number(dbVal(r, '总经验'));
          if (!isNaN(expNum) && expNum > 0) {
            const localExp = Number(getPlayerData().exp) || 0;
            if (expNum > localExp) {
              try { localStorage.setItem(LS_PLAYER, JSON.stringify({ exp: expNum })); } catch(e) {}
            }
          }
        }

        // --- 经历库（合并：本地为准，云端只补新增，防止启动竞态回滚） ---
        const expRows = rows(got.experiences);
        _dbCache.experiences = expRows;
        if (expRows.length) {
          const byTitle = Object.create(null);
          getExperiences().forEach(e => { if (e.title) byTitle[e.title] = e; });
          expRows.forEach((r, i) => {
            const title = dbText(r, '标题');
            const rawDesc = dbText(r, '描述');
            if (!title || byTitle[title]) return;
            byTitle[title] = {
              id: Date.now() + i,
              date: dbDate(dbVal(r, '日期')) || today(),
              title: title,
              rawDesc: rawDesc,
              structured: {
                title: title,
                happened: dbText(r, '结果') || rawDesc,
                whatIDid: rawDesc,
                result: dbText(r, '结果') || '完成了',
                feeling: dbText(r, '感受') || '很有成就感'
              },
              suggestedSkills: [],
              confirmedSkills: dbText(r, '确认技能') ? dbText(r, '确认技能').split(/[,，、]/).filter(Boolean) : [],
              skillConfirmed: true
            };
          });
          const merged = Object.keys(byTitle).map(k => byTitle[k]);
          try { localStorage.setItem(LS_EXPERIENCES, JSON.stringify(merged)); } catch(e) {}
        }

        // --- 技能 + 任务（技能合并：本地为准，云端只补新增） ---
        const skillRows = rows(got.skills);
        const taskRows = rows(got.tasks);
        _dbCache.skills = skillRows;
        _dbCache.tasks = taskRows;
        if (skillRows.length) {
          const learnTasks = taskRows.filter(r => dbText(r, '类型') === '经验任务');
          const localSkills = getSkills();
          const byName = Object.create(null);
          localSkills.forEach(s => { if (s.name) byName[s.name] = s; });
          skillRows.forEach((r, i) => {
            const name = dbText(r, '技能名');
            if (!name || byName[name]) return;
            const status = STATUS_EN[dbText(r, '状态')] || 'lit';
            const myTasks = learnTasks.filter(t => dbText(t, '所属技能') === name);
            const s = {
              id: Date.now() + 100 + i,
              name: name,
              status: status,
              sourceExpIds: [],
              confirmedAt: dbDate(dbVal(r, '确认日期')) || null,
              goalText: dbText(r, '目标') || undefined,
              goalDuration: undefined,
              treeIds: []
            };
            if (status === 'learning' && myTasks.length) {
              s.plan = myTasks.map((t, j) => ({
                unitId: 'u' + j,
                day: j + 1,
                title: dbText(t, '标题'),
                do: dbText(t, '内容'),
                time: dbText(t, '时长'),
                standard: dbText(t, '达标标准'),
                done: !!dbVal(t, '是否完成')
              }));
              s.breakdown = [];
              s.verifyTask = '';
            }
            byName[name] = s;
          });
          const merged = Object.keys(byName).map(k => byName[k]);
          try { localStorage.setItem(LS_SKILLS, JSON.stringify(merged)); } catch(e) {}
        }

        // --- 今日待办（合并：本地为准，云端只补新增；按 标题|日期 去重） ---
        const todoRows = taskRows.filter(r => dbText(r, '类型') === '今日待办');
        if (todoRows.length) {
          const byKey = Object.create(null);
          getTodayTodos().forEach(t => { byKey[(t.title || '') + '|' + (t.date || '')] = t; });
          todoRows.forEach(r => {
            const title = dbText(r, '标题');
            const date = dbDate(dbVal(r, '日期')) || today();
            const k = title + '|' + date;
            if (!k || byKey[k]) return;
            byKey[k] = {
              id: title + '_' + date,
              title: title,
              date: date,
              done: !!dbVal(r, '是否完成'),
              doneAt: null,
              createdAt: new Date().toISOString()
            };
          });
          const merged = Object.keys(byKey).map(k => byKey[k]);
          try { localStorage.setItem(LS_TODOS, JSON.stringify(merged)); } catch(e) {}
        }
        if (profRows.length > 1) {
          // 云端出现多行档案（重复写入导致）时，只保留第一行，删除多余行
          for (let i = 1; i < profRows.length; i++) {
            try { await sdkRun(() => sdk.deleteRecord({ databaseId: DB_IDS.profile, recordId: profRows[i]._id })); } catch(e) {}
          }
          try { _dbCache.profile = profRows[0] || null; } catch(e) {}
        }
      } catch (e) {
        _dbg.lastError = 'APPLY:' + String((e && e.message) || e);
      }
      updateCloudBadge();
      return okCount > 0;
    }

    /* ---------- 写入：localStorage -> 云端（异步 upsert） ---------- */
    function dbUpsert(dbId, raw) {
      const sdk = dbSdk();
      if (!sdk || !dbOnline()) return Promise.resolve(null);
      return sdkRun(() => sdk.addRecord({ databaseId: dbId, properties: dbProps(raw) })).then(r => r || true).catch(() => null);
    }
    function dbUpdate(dbId, recordId, raw) {
      const sdk = dbSdk();
      if (!sdk || !dbOnline()) return Promise.resolve(null);
      return sdkRun(() => sdk.updateRecord({ databaseId: dbId, recordId: recordId, properties: dbProps(raw) })).then(r => (r && r.id) || true).catch(() => null);
    }
    // 单行表 upsert：先查云端有没有行，有则更新，避免重复插入多行
    async function dbUpsertSingle(dbId, payload, cacheSlot) {
      const sdk = dbSdk();
      if (!sdk) return;
      let rid = cacheSlot && cacheSlot.value && cacheSlot.value._id;
      if (!rid) {
        try {
          const rows = await dbQueryAll(dbId);
          if (rows && rows[0]) rid = rows[0]._id;
          if (cacheSlot) cacheSlot.value = rows && rows[0] ? rows[0] : null;
        } catch (e) { }
      }
      if (rid) {
        const done = await dbUpdate(dbId, rid, payload);
        if (done) return;
      }
      await dbUpsert(dbId, payload);
      try {
        const rows = await dbQueryAll(dbId);
        if (cacheSlot) cacheSlot.value = rows && rows[0] ? rows[0] : null;
      } catch (e) { }
    }

    // 按自然键 diff 同步集合表
    async function dbSyncCollection(dbId, zhKeys, localList, mapFn, cacheArr) {
      const sdk = dbSdk();
      if (!sdk || !dbOnline()) return;
      const safeCache = cacheArr || [];
      try {
        // 缓存为空时先拉一次云端，避免重复插入已存在的行
        if (!safeCache.length) {
          try {
            const fresh = await dbQueryAll(dbId);
            safeCache.length = 0;
            (fresh || []).forEach(x => safeCache.push(x));
          } catch(e) {}
        }
        const cloudKeys = new Map();
        safeCache.forEach(r => {
          const k = zhKeys.map(zh => dbKeyVal(dbVal(r, zh))).join('|');
          if (!cloudKeys.has(k)) cloudKeys.set(k, r._id);
        });
        for (const item of localList) {
          const payload = mapFn(item);
          const k = zhKeys.map(zh => dbKeyVal(payload[zh])).join('|');
          const rid = cloudKeys.get(k);
          if (rid) {
            await dbUpdate(dbId, rid, payload);
          } else {
            const added = await dbUpsert(dbId, payload);
            // 更新缓存
            if (added) {
              try {
                const fresh = await dbQueryAll(dbId);
                safeCache.length = 0;
                (fresh || []).forEach(x => safeCache.push(x));
              } catch(e) {}
            }
          }
        }
      } catch(e) {}
    }

    function dbQueueSync(kind) {
      const sdk = dbSdk();
      if (!sdk || !dbOnline()) return;
      // 串行化：避免并发写乱序
      _dbSyncChain = _dbSyncChain.then(() => _doSync(kind)).catch(() => {});
    }
    let _profileSlot = null;
    let _dbSyncChain = Promise.resolve();
    async function _doSync(kind) {
      if (kind === 'profile') {
        const p = getProfile();
        const payload = {
          '昵称': p.nickname || '', '性格': p.personality || '', '喜好': p.likes || '',
          '喜欢的食物': p.food || '', '一句话描述': p.oneLineDesc || '',
          '兴趣关键词': p.interests || '', '职业关键词': p.futureJobs || '',
          '总经验': getPlayerData().exp || 0
        };
        if (!_profileSlot) _profileSlot = { value: _dbCache.profile };
        await dbUpsertSingle(DB_IDS.profile, payload, _profileSlot);
        try { _dbCache.profile = _profileSlot.value; } catch(e) {}
      } else if (kind === 'experiences') {
        await dbSyncCollection(
          DB_IDS.experiences, ['标题'],
          getExperiences(),
          (e) => ({
            '日期': e.date || '', '标题': e.title || '', '描述': e.rawDesc || '',
            '结果': (e.structured && e.structured.result) || '',
            '感受': (e.structured && e.structured.feeling) || '',
            '确认技能': (e.confirmedSkills || []).join(',')
          }),
          _dbCache.experiences
        );
      } else if (kind === 'skills') {
        // 技能表
        await dbSyncCollection(
          DB_IDS.skills, ['技能名'],
          getSkills(),
          (s) => ({
            '技能名': s.name || '',
            '状态': STATUS_ZH[s.status] || '已点亮',
            '目标': s.goalText || '',
            '进度说明': Array.isArray(s.plan)
              ? (s.plan.filter(p => p.done).length + '/' + s.plan.length + ' 已完成')
              : '',
            '确认日期': s.confirmedAt || null
          }),
          _dbCache.skills
        );
        // 学习任务表（技能 plan 展开）
        const taskPayloads = [];
        getSkills().forEach(s => {
          if (s.status !== 'learning' || !Array.isArray(s.plan)) return;
          s.plan.forEach(p => {
            taskPayloads.push({
              skill: s.name, payload: {
                '类型': '经验任务', '所属技能': s.name,
                '标题': p.title || ('Day ' + p.day),
                '内容': p.do || '', '时长': p.time || '',
                '达标标准': p.standard || '', '是否完成': !!p.done
              }
            });
          });
        });
        await dbSyncCollection(
          DB_IDS.tasks, ['所属技能', '标题'],
          taskPayloads.map(t => ({ key: t.skill + '|' + t.payload['标题'], payload: t.payload })),
          (t) => t.payload,
          _dbCache.tasks
        );
      } else if (kind === 'todos') {
        await dbSyncCollection(
          DB_IDS.tasks, ['标题', '日期'],
          getTodayTodos().map(t => ({ fake: t, payload: {
            '类型': '今日待办', '所属技能': '',
            '日期': t.date || '', '标题': t.title || '',
            '内容': '', '时长': '', '达标标准': '',
            '是否完成': !!t.done
          }})),
          (t) => t.payload,
          _dbCache.tasks
        );
      }
    }

    function getProfile() {
      try { return JSON.parse(localStorage.getItem(LS_PROFILE)) || {}; } catch(e) { return {}; }
    }
    function saveProfile(p) {
      try { localStorage.setItem(LS_PROFILE, JSON.stringify(p)); } catch(e) {}
      dbQueueSync('profile');
    }
    function getExperiences() {
      try { return JSON.parse(localStorage.getItem(LS_EXPERIENCES)) || []; } catch(e) { return []; }
    }
    function saveExperiences(list) {
      try { localStorage.setItem(LS_EXPERIENCES, JSON.stringify(list)); } catch(e) {}
      dbQueueSync('experiences');
    }
    function getSkills() {
      try { return JSON.parse(localStorage.getItem(LS_SKILLS)) || []; } catch(e) { return []; }
    }
    function saveSkills(list) {
      try { localStorage.setItem(LS_SKILLS, JSON.stringify(list)); } catch(e) {}
      dbQueueSync('skills');
    }
    function getPlayerData() {
      try { return JSON.parse(localStorage.getItem(LS_PLAYER)) || { exp: 0 }; } catch(e) { return { exp: 0 }; }
    }
    function savePlayerData(d) {
      try { localStorage.setItem(LS_PLAYER, JSON.stringify(d)); } catch(e) {}
      dbQueueSync('profile');
    }
    function getTrees() {
      try { return JSON.parse(localStorage.getItem(LS_TREES)) || []; } catch(e) { return []; }
    }
    function saveTrees(list) {
      try { localStorage.setItem(LS_TREES, JSON.stringify(list)); } catch(e) {}
    }

    /* 今日自建 todo：[{ id, title, date: 'YYYY-MM-DD', done, doneAt, createdAt }] */
    function getTodayTodos() {
      try { return JSON.parse(localStorage.getItem(LS_TODOS)) || []; } catch(e) { return []; }
    }
    function saveTodayTodos(list) {
      try { localStorage.setItem(LS_TODOS, JSON.stringify(list)); } catch(e) {}
      dbQueueSync('todos');
    }

    /* ============================================================
       3) 角色图（优先使用已选预设）
       ============================================================ */
    function getCharImage() {
      // 优先使用已选的角色图片
      try {
        const b64 = localStorage.getItem(LS_CHAR_IMAGE);
        if (b64) return b64.startsWith('./assets/assets/img/') ? imageUrl(b64.slice('./assets/assets/img/'.length)) : b64;
      } catch(e) {}
      // 兜底：旧版固定PNG
      const profile = getProfile();
      let gender = profile.gender || '';
      if (!gender || gender === 'other') {
        const text = ((profile.interests || '') + ' ' + (profile.futureJobs || '')).toLowerCase();
        gender = /(编程|开发|工程|建筑|算法)/.test(text) ? 'male' : 'female';
      }
      return gender === 'male'
        ? imageUrl('char-male-porcelain-blue.png')
        : imageUrl('char-female-porcelain-lavender.png');
    }

    function pickCharImage(profile) {
      return getCharImage();
    }

    function saveCharImage(b64) {
      try { localStorage.setItem(LS_CHAR_IMAGE, b64); } catch(e) {}
    }

    function hasCharImage() {
      try { return !!localStorage.getItem(LS_CHAR_IMAGE); } catch(e) { return false; }
    }

    /* 组合形象（背景+角色分层存储）：
       沙箱 iframe 是不透明源（Origin: null），CDN 不回 ACAO 头，
       canvas 合成会因画布污染而失败。此时改存 {bg, char} 组合，
       展示端用两层 <img> 叠加渲染，完全绕开 canvas。 */
    const LS_CHAR_COMBO = 'earth_online_char_combo';
    function getCharCombo() {
      try {
        const c = JSON.parse(localStorage.getItem(LS_CHAR_COMBO));
        if (c && c.bg && c.char) return c;
      } catch(e) {}
      return null;
    }
    function saveCharCombo(c) {
      try { localStorage.setItem(LS_CHAR_COMBO, JSON.stringify(c)); } catch(e) {}
    }
    function clearCharCombo() {
      try { localStorage.removeItem(LS_CHAR_COMBO); } catch(e) {}
    }
    /* 肖像渲染：有组合时返回分层 HTML，否则返回单图 <img> */
    function charPortraitHtml(cls, alt) {
      const combo = getCharCombo();
      if (combo) {
        return '<div class="' + (cls || '') + ' char-combo">' +
          '<img class="combo-bg" src="' + imageUrl('preset/bg/' + combo.bg + '.png') + '" alt="">' +
          '<img class="combo-char" src="' + imageUrl('preset/char/' + combo.char + '.png') + '" alt="' + (alt || '我的角色') + '">' +
          '</div>';
      }
      return '<img class="' + (cls || '') + '" src="' + escapeHtml(getCharImage()) + '" alt="' + (alt || '我的角色') + '">';
    }

    /* ============================================================
       3.5) 首页渲染：人物卡 / 日历 / 今日 / 最近 / 学习 / 答案之书
       ============================================================ */

    // 根据经历标题自动匹配统一风格小图标
    const EXP_ICON_RULES = [
      [/旅行|旅游|出行|徒步|city\s*walk|citywalk|户外/, '✈️'],
      [/实习|工作|求职|面试|简历|公司/, '💼'],
      [/演讲|present|分享|上台|汇报|路演|ppt|答辩/, '🎤'],
      [/音乐节|演唱会|演出|音乐会|看展|展览|艺术/, '🎵'],
      [/球|跑|运动|健身|瑜伽|跳|舞|滑雪|游泳|骑行/, '⚽'],
      [/摄影|拍照|拍片|相机/, '📷'],
      [/比赛|竞赛|编程|算法|黑客松|hackathon|解题|数学/, '🏆'],
      [/志愿|公益|志愿|服务|支教/, '🤝'],
      [/社团|学生会|组织|活动|晚会|迎新/, '🎉'],
      [/课|课程|讲座|网课|mooc|培训|学习/, '📚'],
      [/读书|阅读|看书|读完|书评/, '📖'],
      [/写|文章|投稿|稿|博客|日记/, '✍️'],
      [/视频|剪辑|vlog|短片|拍片|导演/, '🎬'],
      [/画|插画|素描|手绘|板绘|设计|海报/, '🎨'],
      [/代码|编程|开发|网站|app|上线|部署|debug/, '💻'],
      [/做饭|烹饪|菜谱|蛋糕|烘焙|煮/, '🍳'],
      [/游戏|通关|上分|steam|联机|电竞/, '🎮'],
      [/追星|演唱会|见面|签售|饭圈/, '⭐'],
      [/猫|狗|宠物|仓鼠|兔子/, '🐾'],
      [/搬家|宿舍|入住|整理/, '📦'],
      [/生日|节日|春节|圣诞|新年/, '🎂'],
      [/emo|心情|情绪|焦虑|难过|开心/, '💭'],
      [/考试|四六|四六级|考研|雅思|托福|期末|中考|高考|分数|模考/, '📝'],
    ];
    function pickExpIcon(title) {
      const t = (title || '').toLowerCase();
      for (const [re, ico] of EXP_ICON_RULES) {
        if (re.test(t)) return ico;
      }
      return '⭐';
    }
    function formatShortDate(d) {
      if (!d) return '';
      const parts = String(d).split('-');
      if (parts.length === 3) return parts[1] + '.' + parts[2];
      return d;
    }

    // 填充人物卡 + 全部首页模块
    function fillHome(profile) {
      const p = profile || {};
      // 头像（组合模式：背景铺底 + 角色上层叠加）
      const _combo = getCharCombo();
      const _imgEl = document.getElementById('charImg');
      if (_imgEl) {
        if (_combo) {
          _imgEl.src = imageUrl('preset/bg/' + _combo.bg + '.png');
          _imgEl.classList.add('combo-bg-img');
          let layer = document.getElementById('charImgLayer');
          if (!layer) {
            layer = document.createElement('img');
            layer.id = 'charImgLayer';
            layer.className = 'char-portrait-layer';
            layer.alt = '我的角色';
            _imgEl.parentNode.appendChild(layer);
          }
          layer.src = imageUrl('preset/char/' + _combo.char + '.png');
        } else {
          _imgEl.classList.remove('combo-bg-img');
          const layer = document.getElementById('charImgLayer');
          if (layer) layer.remove();
          _imgEl.src = pickCharImage(p);
        }
      }
      document.getElementById('charNick').textContent = p.nickname || '匿名冒险者';
      document.getElementById('charPersonality').textContent = p.personality || '—';
      document.getElementById('charLikes').textContent = p.likes || '—';
      document.getElementById('charFood').textContent = p.food || '—';

      // 一句话描述
      const bubble = p.oneLineDesc
        ? '"' + escapeHtml(p.oneLineDesc) + '"'
        : '"正在长成自己的样子。"';
      document.getElementById('charBubble').textContent = bubble;

      // 关键词（最多 6 个）
      const interests = parseList(p.interests);
      const tags = interests.slice(0, 6);
      const tagHtml = tags.length
        ? tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')
        : `<span class="tag-chip muted">+ 添加喜好关键词</span>`;
      document.getElementById('charTags').innerHTML = tagHtml;

      // 等级 + 经验条
      renderExpBar(getPlayerData().exp);

      // 渲染各模块
      renderCalendar();
      renderTodayTasks();
      renderRecentExp();
      renderActiveLearning();
      renderSkillLevels();
      drawAnswer(); // 每次进入页面抽一句（基于日期，今天稳定）
      // 宠物小院入口（pets.js 提供，降级忽略）
      try { if (typeof renderPetEntry === 'function') renderPetEntry(); } catch (e) { }
    }

    /* ----- 日历 ----- */
    let _calCursor = null; // {year, month: 0-11}
    function renderCalendar() {
      const now = _calCursor || new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      _calCursor = new Date(year, month, 1);

      const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一','十二月'];
      document.getElementById('calMonthLabel').textContent = monthNames[month] + ' ' + year;

      const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
      // 把周日(0)放到末尾，让周一开头
      const offset = (firstWeekday + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // 收集本月标记
      const exps = getExperiences();
      const skills = getSkills();
      const eventMap = {}; // dateStr -> { exp: count, task: count }
      exps.forEach(e => {
        if (!e.date) return;
        const d = String(e.date).slice(0, 10);
        if (!eventMap[d]) eventMap[d] = { exp: 0, task: 0 };
        eventMap[d].exp += 1;
      });
      skills.forEach(s => {
        if (s.status !== 'learning' || !Array.isArray(s.plan)) return;
        s.plan.forEach(p => {
          if (!p.done) return;
          // 没记录具体完成日期的，用计划开始日近似
          const d = (p.completedAt || s.createdAt || '').slice(0, 10);
          if (!d) return;
          if (!eventMap[d]) eventMap[d] = { exp: 0, task: 0 };
          eventMap[d].task += 1;
        });
      });
      // 今日清单（自建待办 + 快捷任务）已完成的也打点
      getTodayTodos().forEach(t => {
        if (!t.done || !t.date) return;
        const d = String(t.date).slice(0, 10);
        if (!eventMap[d]) eventMap[d] = { exp: 0, task: 0 };
        eventMap[d].task += 1;
      });

      const todayStr = today();
      const grid = document.getElementById('calGrid');
      let html = '';
      for (let i = 0; i < offset; i++) {
        html += `<div class="cal-day placeholder"></div>`;
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = year + '-' + String(month + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        const wd = new Date(year, month, d).getDay();
        const isWeekend = (wd === 0 || wd === 6);
        const isToday = (dateStr === todayStr);
        const ev = eventMap[dateStr];
        let cls = 'cal-day';
        if (isWeekend) cls += ' weekend';
        if (isToday) cls += ' today';
        if (ev && (ev.exp || ev.task)) {
          cls += ' has-event';
          if (ev.task && !ev.exp) cls += ' has-task';
          else if (ev.exp && !ev.task) cls += ' has-exp';
        }
        html += `<div class="${cls}" data-date="${dateStr}">${d}</div>`;
      }
      grid.innerHTML = html;
    }
    function goToToday() {
      _calCursor = null;
      renderCalendar();
    }

    /* ----- 今日任务列表 ----- */
    function renderTodayTasks() {
      // 顶部日期
      const t = new Date();
      const month = t.getMonth() + 1;
      const day = t.getDate();
      const weekdayNames = ['周日','周一','周二','周三','周四','周五','周六'];
      document.getElementById('todayDate').textContent = month + '月' + day + '日 ' + weekdayNames[t.getDay()];

      const todayStr = today();
      const list = document.getElementById('todayList');
      let html = '';

      // 1) 用户自建 todo（今日且未完成排前，已完成排后）
      const custom = getTodayTodos().filter(x => x.date === todayStr);
      const customOpen = custom.filter(x => !x.done);
      const customDone = custom.filter(x => x.done);
      customOpen.forEach(it => {
        html += `<li class="custom" data-cid="${escapeHtml(it.id)}">
          <input type="checkbox" onclick="toggleCustomTask(this, '${escapeHtml(it.id)}')" />
          <span class="tl-title">${escapeHtml(it.title)}</span>
          <span class="tl-skill">自建</span>
        </li>`;
      });

      // 2) 学习计划里的"今日第一个未完成"（每个 learning 技能一条）
      const skills = getSkills().filter(s => s.status === 'learning' && Array.isArray(s.plan));
      skills.forEach(s => {
        const todo = s.plan.find(p => !p.done);
        if (todo) {
          html += `<li class="plan" data-skill="${escapeHtml(s.name)}">
            <input type="checkbox" onclick="toggleTodayTask(this)" />
            <span class="tl-title">${escapeHtml(todo.do || todo.title)}</span>
            <span class="tl-skill">${escapeHtml(s.name)}</span>
          </li>`;
        }
      });

      // 3) 今日已完成的自建 todo
      customDone.forEach(it => {
        html += `<li class="custom done" data-cid="${escapeHtml(it.id)}">
          <input type="checkbox" checked onclick="toggleCustomTask(this, '${escapeHtml(it.id)}')" />
          <span class="tl-title">${escapeHtml(it.title)}</span>
          <span class="tl-skill">自建</span>
        </li>`;
      });

      // 4) 今天记录过的经历
      const todayExps = getExperiences().filter(e => (e.date || '').slice(0,10) === todayStr);
      todayExps.slice(0, 2).forEach(e => {
        html += `<li class="done">
          <span style="font-size:12px;">✓</span>
          <span class="tl-title">${pickExpIcon(e.title)} ${escapeHtml(e.title)}</span>
          <span class="tl-skill">经历</span>
        </li>`;
      });

      if (!html) {
        list.innerHTML = `<li class="today-empty">今天还没有任务和记录 ✨</li>`;
      } else {
        list.innerHTML = html;
      }
      document.getElementById('todayFooter').textContent = '每一个普通的日子，都是老李的世界Online的主线任务！';
    }

    function addTodayTask(ev) {
      ev.preventDefault();
      const inp = document.getElementById('todayAddInput');
      const v = (inp.value || '').trim();
      if (!v) return false;
      const list = getTodayTodos();
      list.push({ id: uid(), title: v, date: today(), done: false, createdAt: new Date().toISOString() });
      saveTodayTodos(list);
      inp.value = '';
      renderTodayTasks();
      return false;
    }

    function toggleCustomTask(cb, id) {
      const list = getTodayTodos();
      const item = list.find(x => x.id === id);
      if (!item) return;
      // 防误操作：取消勾选不扣经验
      const wasDone = item.done;
      item.done = cb.checked;
      item.doneAt = cb.checked ? new Date().toISOString() : null;
      saveTodayTodos(list);
      const li = cb.closest('li');
      if (cb.checked) {
        li.classList.add('done');
        if (!wasDone) addExp(8, '完成一件自建任务');
        renderExpBar(getPlayerData().exp);
      } else {
        li.classList.remove('done');
      }
    }

    function toggleTodayTask(cb) {
      const li = cb.closest('li');
      const skillName = li.getAttribute('data-skill');
      const skills = getSkills();
      const skill = skills.find(s => s.name === skillName);
      if (!skill || !Array.isArray(skill.plan)) return;
      const todo = skill.plan.find(p => !p.done);
      if (!todo) return;
      todo.done = cb.checked;
      todo.completedAt = today();
      saveSkills(skills);
      if (cb.checked) {
        li.classList.add('done');
        addExp(5, '完成一项经验任务');
        renderExpBar(getPlayerData().exp);
        renderActiveLearning();
        renderTodayTasks(); // 刷新，把刚完成的任务挪走
      }
    }

    /* ----- 最近经历 ----- */
    function renderRecentExp() {
      const exps = getExperiences()
        .filter(e => e.date)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, 5);
      const list = document.getElementById('recentExpList');
      if (!exps.length) {
        list.innerHTML = `<li class="duo-empty">还没有记录，点上面按钮开始吧</li>`;
        return;
      }
      list.innerHTML = exps.map(e => `
        <li>
          <span class="duo-ico">${pickExpIcon(e.title)}</span>
          <div class="duo-body">
            <div class="duo-title">${escapeHtml(e.title)}</div>
          </div>
          <span class="duo-date">${formatShortDate(e.date)}</span>
        </li>`).join('');
    }

    /* ----- 正在学习 ----- */
    function renderActiveLearning() {
      const skills = getSkills().filter(s => s.status === 'learning' && Array.isArray(s.plan));
      const list = document.getElementById('activeLearningList');
      if (!skills.length) {
        list.innerHTML = `<li class="duo-empty">还没有学习目标</li>`;
        return;
      }
      const top = skills.slice(0, 3);
      list.innerHTML = top.map(s => {
        const total = s.plan.length;
        const done = s.plan.filter(p => p.done).length;
        const pct = total ? Math.round(done / total * 100) : 0;
        const next = s.plan.find(p => !p.done);
        const nextText = next ? (next.do || next.title || '—').slice(0, 18) : '已完成全部任务';
        return `<li>
            <span class="duo-ico">📈</span>
            <div class="duo-body">
              <div class="duo-title">${escapeHtml(s.name)}</div>
              <div class="duo-sub">下一步：${escapeHtml(nextText)}</div>
              <div class="mini-progress" style="margin-top:2px;">
                <div class="mini-bar"><div class="mini-bar-fill" style="width:${pct}%;"></div></div>
                <span class="mini-pct">${done}/${total}</span>
              </div>
            </div>
          </li>`;
      }).join('');
    }

    /* ----- 我的技能等级（自动分类） ----- */
    function renderSkillLevels() {
      const list = document.getElementById('skillLevelsList');
      const cats = computeCategoryLevels();
      if (!cats.length) {
        list.innerHTML = `<li class="sl-empty">还没有数据 — 多记几段经历就能看到你的技能等级啦 ✨</li>`;
        return;
      }
      const maxLv = cats[0].level;
      list.innerHTML = cats.slice(0, 6).map(c => {
        const pct = Math.min(100, Math.round(c.level / Math.max(maxLv, 1) * 100));
        return `<li>
            <img class="sl-ico" src="${imageUrl('decor/skill/icons/' + c.icon + '.png')}" alt="" />
            <span class="sl-name">${escapeHtml(c.name)}</span>
            <div class="sl-bar"><div class="sl-bar-fill" style="width:${pct}%;"></div></div>
            <span class="sl-lv">Lv.${c.level}</span>
          </li>`;
      }).join('');
    }

    /* ----- 每日答案之书 ----- */
    const ANSWER_BOOK = [
      '慢慢来，比较比较快。',
      '不是所有的路都要立刻看见结果。',
      '今天的一小步，也是真实的一步。',
      '记录比完美更重要。',
      '你比自己以为的更有趣。',
      '把今天当作主线任务，不必急。',
      '值得做的事，值得慢慢做。',
      '先完成，再完美。',
      '想做的事情，不需要所有人都懂。',
      '下一次再说 ≠ 下一次会做。',
      '经验从来不会说谎。',
      '允许自己还没想清楚。',
      '想不清楚的时候，就去试试。',
      '成长不是一条直线。',
      '先把日子过起来。',
      '你不是没有进步，只是在爬坡。',
      '每天记一句，也是积累。',
      '普通人也有路。',
      '重要的不是开始得多漂亮，是没停下来。',
      '把"想做的事"记下来，它就更容易发生。',
      '今天认真吃饭、睡觉，也是主线任务。',
      '别拿别人的进度表，给自己的生活评分。',
      '走慢一点没关系，重点是还在走。',
      '心情不好也值得被记录。',
      '你不需要很"厉害"才能开始。',
      '想学什么就写下来，写下来就开始了。',
      '未来不靠空想，靠真实过过的每一天。',
      '失败了的事也值得记。',
      '你比想象中更了解自己。',
      '慢慢攒，时间看得见。',
      '生活的彩蛋，常藏在没做完的事里。',
      '今天不必赢，今天只要在。',
      '犹豫的时候，选那个让你眼睛发亮的。',
      '热爱不分年纪，好奇不算幼稚。',
      '把大目标切成小块，就没那么吓人了。',
      '别人的速度是别人的，你有你的时区。',
      '认真生活的人，运气不会太差。',
      '难过的时候先吃饭，睡一觉再说。',
      '小事做到位，本身就是天赋。',
      '与其羡慕，不如记账式地攒本事。',
      '每一次"算了"，都让下次更难开始。',
      '每一次"试试"，都让下次更容易。',
      '你存下的每一段经历，都是以后的底气。',
      '不用向任何人证明你在认真生活。',
      '累了就休息，休息不是放弃。',
      '喜欢的东西别舍不得用，日子是用来过的。',
      '今天的风很好，值得出门走一圈。',
      '好的状态不是天天满血，是跌倒了还想再来。',
      '把烦恼写下来，它就小了一半。',
      '答案不在原地，在路上。',
      '种一棵树最好的时间是十年前，其次是现在。',
      '留一点时间给无用但快乐的事。',
      '坚持的意义，在放弃的那一刻才看得见。',
      '别把日子过成待办清单，留点空给意外。',
      '真正的稳定，是持续成长的能力。',
      '今天觉得难的事，明年看都不算事。',
      '先照顾好自己，再照顾世界。',
      '有趣的灵魂，都是自己陪自己养出来的。',
      '少比较，多体验。',
      '生活的答案，往往在行动后面等着你。'
    ];
    function pickAnswerForToday() {
      // 用日期做种子，每天稳定一句（作为当天的「今日主打」）
        const d = today();
        let h = 0;
        for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
        return ANSWER_BOOK[h % ANSWER_BOOK.length];
    }
    let _answerShown = '';
    function drawAnswer() {
      let text;
      if (!_answerShown) {
        // 当天第一次翻开：给「今日主打」
        text = pickAnswerForToday();
      } else {
        // 再点「换一句」：随机抽，且不与当前重复
        let guard = 0;
        do {
          text = ANSWER_BOOK[Math.floor(Math.random() * ANSWER_BOOK.length)];
          guard++;
        } while (text === _answerShown && guard < 12);
      }
      _answerShown = text;
      const el = document.getElementById('answerText');
      if (!el) return;
      // 简单切换动画
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = '「' + text + '」';
        el.style.opacity = '1';
      }, 120);
    }

    /* ============================================================
       4) 首页渲染 (新版: 见上方 3.5 节)
       ============================================================ */
    // fillHome / renderCalendar / renderTodayTasks / renderRecentExp /
    // renderActiveLearning / drawAnswer 已在 3.5 节定义。

    function renderSkillGrid() {
      const skills = getSkills().filter(s => s.status === 'lit');
      const grid = document.getElementById('skillGrid');
      if (!skills.length) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; font-size:12px; color:var(--c-text-soft); padding:10px;">记录经历并确认技能后，这里会逐渐长出来 ✨</div>`;
        return;
      }
      grid.innerHTML = skills.map(s => `
        <div class="skill-item confirmed" onclick="showSkillDetail('${escapeHtml(s.name)}')" style="cursor:pointer;" title="点击查看来源经历">
          <span class="dot"></span>
          <span class="name">${escapeHtml(s.name)}</span>
          <span class="tag">已确认</span>
        </div>`).join('');
    }

    /* ============================================================
       5) 技能详情弹窗（溯源）
       ============================================================ */
    function showSkillDetail(skillName) {
      const skill = getSkills().find(s => s.name === skillName);
      if (!skill) return;
      const exps = getExperiences();

      document.getElementById('skillDetailTitle').textContent = '🌳 ' + skillName;
      let html = '';

      if (skill.status === 'lit') {
        html += `<div style="font-size:12px; color:var(--c-text-soft); margin-bottom:12px;">✅ 这个技能已经通过真实经历确认</div>`;
        if (skill.sourceExpIds && skill.sourceExpIds.length) {
          skill.sourceExpIds.forEach(eid => {
            const exp = exps.find(e => e.id === eid);
            if (exp) {
              html += `
              <div class="skill-source-entry">
                <div class="skill-source-date">${escapeHtml(exp.date)}</div>
                <div class="skill-source-title">${escapeHtml(exp.title)}</div>
                <div class="skill-source-desc">${escapeHtml(exp.rawDesc)}</div>
              </div>`;
            }
          });
        } else {
          html += `<div style="font-size:12px; color:var(--c-text-soft);">（初始自带）</div>`;
        }
      } else {
        // 学习中的技能
        html += `<div style="font-size:12px; color:var(--c-warm-deep); margin-bottom:8px; font-weight:700;">状态：${statusLabel(skill.status)}</div>`;
        if (skill.goalText) {
          html += `<div class="skill-source-entry"><div class="skill-source-title">🎯 目标</div><div class="skill-source-desc">${escapeHtml(skill.goalText)}</div></div>`;
        }
        if (skill.breakdown && skill.breakdown.length) {
          html += `<div style="font-size:12px; font-weight:700; margin:10px 0 6px;">🧩 能力单元</div>`;
          skill.breakdown.forEach((unit, i) => {
            const unitStatus = unit.status || 'want';
            html += `<div class="skill-unit-item ${unitStatus}">
              <span class="skill-unit-status-dot ${unitStatus}"></span>
              <span class="skill-unit-name">${escapeHtml(unit.name)}</span>
              <span class="skill-unit-status-text">${statusLabel(unitStatus)}</span>
              ${unitStatus === 'verified' && unit.sourceExpId ? '<span class="skill-unit-badge">✓ 已验证</span>' : ''}
            </div>`;
          });
        }
        // 学习计划
        if (skill.plan && skill.plan.length) {
          html += `<div class="learn-plan-summary">`;
          html += renderPlanBlock(skill, skillName);
          html += `</div>`;
        }
        // 验证任务
        if (skill.verifyTask) {
          const verified = skill.status === 'verified' || skill.status === 'lit';
          html += `<div style="font-size:12px; font-weight:700; margin:12px 0 6px;">🏆 验证任务</div>`;
          html += `<div class="skill-source-entry" style="border-color:var(--c-warm-deep);">
            <div class="skill-source-desc">${escapeHtml(skill.verifyTask)}</div>
            ${verified ? '<div style="font-size:11px; color:var(--c-green-deep); margin-top:6px; font-weight:700;">✅ 已通过验证</div>' : '<div style="font-size:11px; color:var(--c-text-soft); margin-top:6px;">完成并记录真实经历后，技能将被正式点亮</div>'}
          </div>`;
        }
      }

      document.getElementById('skillDetailBody').innerHTML = html;
      document.getElementById('skillDetailModal').style.display = 'flex';
    }

    function closeSkillDetail() {
      document.getElementById('skillDetailModal').style.display = 'none';
    }
    document.getElementById('skillDetailModal').addEventListener('click', function(e) {
      if (e.target === this) closeSkillDetail();
    });

    function statusLabel(status) {
      const map = {
        'want': '想参与',
        'learning': '进行中',
        'practiced': '完成练习',
        'verified': '真实使用过',
        'lit': '正式点亮',
        'done': '已完成',
        'doing': '进行中'
      };
      return map[status] || status;
    }

    /* ============================================================
       6) 经历记录弹窗
       ============================================================ */
    let pendingExpId = null;

    function openExpModal() {
      document.getElementById('expModal').style.display = 'flex';
      document.getElementById('expDate').value = today();
      document.getElementById('expForm').querySelector('input[name=expTitle]').focus();
    }

    function closeExpModal() {
      document.getElementById('expModal').style.display = 'none';
      document.getElementById('expForm').reset();
    }

    document.getElementById('expModal').addEventListener('click', function(e) {
      if (e.target === this) closeExpModal();
    });

    /* ============================================================
       7) 经历保存 + AI 整理 + 技能提取
       ============================================================ */
    function analyzeExperience(rawTitle, rawDesc) {
      const text = (rawTitle + '。' + rawDesc).toLowerCase();
      const structured = {
        title: rawTitle,
        happened: '未记录',
        whatIDid: '未记录',
        result: '未记录',
        feeling: '未记录'
      };
      const sentences = rawDesc.split(/[。！？；\n]/).filter(s => s.trim());

      if (sentences.length >= 1) {
        structured.happened = sentences.slice(0, 2).join('。');
      }
      const iDid = sentences.filter(s => /我[做负责整理准备写完成参加找想尝试用看学]/.test(s));
      if (iDid.length) {
        structured.whatIDid = iDid.join('。');
      } else if (sentences.length > 2) {
        structured.whatIDid = sentences.slice(1, 3).join('。');
      }
      const resultSent = sentences.filter(s => /[结果最后最终终于拿到获得成功通过完成]/.test(s));
      if (resultSent.length) {
        structured.result = resultSent.join('。');
      }
      const feelingSent = sentences.filter(s => /[觉得感觉紧张害怕开心兴奋自豪焦虑轻松但虽然其实]/.test(s));
      if (feelingSent.length) {
        structured.feeling = feelingSent.join('。');
      }
      if (structured.happened === '未记录' && rawDesc) {
        structured.happened = rawDesc;
      }

      const suggestedSkills = [];
      const skillPatterns = [
        { pattern: /英文|english|全英/, skill: '英文表达' },
        { pattern: /presentation|汇报|演讲|发言|宣讲/, skill: '公开表达' },
        { pattern: /整理资料|收集|调研|文献|查阅/, skill: '信息整理' },
        { pattern: /写|撰写|写作|论文|报告|文章/, skill: '写作' },
        { pattern: /编程|代码|开发|python|java|程序/, skill: '编程' },
        { pattern: /设计|建模|画图|cad|ps|figma/, skill: '设计' },
        { pattern: /视频|剪辑|拍摄|摄影|pr|剪映/, skill: '视频制作' },
        { pattern: /团队|合作|协作|分工|小组/, skill: '团队协作' },
        { pattern: /领导|负责|组织|协调|管理/, skill: '项目推进' },
        { pattern: /翻译|口译|笔译/, skill: '翻译' },
        { pattern: /数据|统计|分析|excel|spss/, skill: '数据分析' },
        { pattern: /教|辅导|培训|讲解/, skill: '教学' },
        { pattern: /策划|规划|方案|活动/, skill: '策划' },
        { pattern: /沟通|交流|谈判|协商/, skill: '沟通表达' },
        { pattern: /独立|一个人|自己/, skill: '独立解决问题' },
        { pattern: /适应|融入|新环境|搬/, skill: '适应能力' },
        { pattern: /压力|焦虑|紧张|克服|坚持/, skill: '抗压能力' },
        { pattern: /面试|申请|投递/, skill: '求职面试' },
        { pattern: /实习|工作|兼职/, skill: '职业实践' },
        { pattern: /实验|操作|测量|实验/, skill: '实验操作' },
        { pattern: /阅读|读书|文献/, skill: '深度阅读' },
      ];

      skillPatterns.forEach(sp => {
        if (sp.pattern.test(text)) {
          if (!suggestedSkills.includes(sp.skill)) {
            suggestedSkills.push(sp.skill);
          }
        }
      });

      return {
        structured,
        suggestedSkills: suggestedSkills.slice(0, 5)
      };
    }

    /* ----- 技能分类（30个，自动识别 + 等级累计） ----- */
    const SKILL_CATS = [
      { id: 'photography', name: '摄影',     icon: 'camera',       kws: ['摄影','拍照','拍片','相机','photo','camera','shoot','vlog','视频','录像','拍'] },
      { id: 'writing',    name: '写作',     icon: 'notebook',     kws: ['写','文章','投稿','稿','博客','日记','公众号','文案','创作'] },
      { id: 'reading',    name: '阅读',     icon: 'book',         kws: ['阅读','读书','看书','书评','读完','读完一本'] },
      { id: 'design',     name: '设计',     icon: 'palette',      kws: ['设计','海报','排版','UI','插画','ps','ai','figma','sketch','构图'] },
      { id: 'coding',     name: '编程',     icon: 'code',         kws: ['代码','编程','开发','debug','程序','算法','leetcode','python','java','js','vue','sql'] },
      { id: 'speaking',   name: '演讲',     icon: 'mic',          kws: ['演讲','present','分享','上台','汇报','答辩','路演','ppt','宣讲'] },
      { id: 'art',        name: '绘画',     icon: 'paintbrush',   kws: ['画','插画','油画','水彩','素描','手绘','板绘'] },
      { id: 'data',       name: '数据分析', icon: 'pie-chart',     kws: ['分析','数据','pandas','统计','excel','表格','spss'] },
      { id: 'study',      name: '学业',     icon: 'diploma',      kws: ['课程','上课','毕业','绩点','gpa','考试','模考','期末'] },
      { id: 'language',   name: '语言',     icon: 'globe',        kws: ['雅思','托福','口语','背单词','英语','法语','日语','韩语','单词'] },
      { id: 'travel',     name: '旅行',     icon: 'plane',        kws: ['旅行','出行','旅游','city walk','citywalk','独自旅行','去看看'] },
      { id: 'sport',      name: '运动',     icon: 'fire',         kws: ['运动','跑步','羽毛球','篮球','足球','瑜伽','健身房','锻炼','打球'] },
      { id: 'work',       name: '实习工作', icon: 'briefcase',    kws: ['实习','工作','求职','面试','简历','公司','入职'] },
      { id: 'project',    name: '项目比赛', icon: 'star',         kws: ['项目','比赛','竞赛','参赛','作品集','黑客松','hackathon'] },
      { id: 'build',      name: '建筑建造', icon: 'school',       kws: ['建筑','建造','模型','立面','剖面','sketchup','rhino','cad','评图'] },
      { id: 'media',      name: '视频制作', icon: 'laptop',       kws: ['视频','剪辑','短片','剪映','pr','导演','vlog'] },
      { id: 'idea',       name: '灵感想法', icon: 'lightbulb',    kws: ['灵感','想法','创意','突然想到'] },
      { id: 'plan',       name: '策划组织', icon: 'ruler',        kws: ['策划','组织','安排','协调','管理','统筹'] },
      { id: 'doc',        name: '文档材料', icon: 'file',         kws: ['文档','材料','报告','纪要','汇总'] },
      { id: 'survey',     name: '探索发现', icon: 'map',          kws: ['探索','发现','调研','考察','田野'] },
      { id: 'mount',      name: '户外登山', icon: 'mountain',     kws: ['登山','徒步','露营','爬山','户外'] },
      { id: 'find',       name: '方向定位', icon: 'compass',     kws: ['方向','定位','目标','定位','人生方向'] },
    ];
    const SKILL_CAT_BY_ID = Object.fromEntries(SKILL_CATS.map(c => [c.id, c]));

    function autoClassify(text) {
      const t = (text || '').toLowerCase();
      const hits = [];
      SKILL_CATS.forEach(c => {
        for (const k of c.kws) {
          if (t.includes(k.toLowerCase())) {
            hits.push(c.id);
            break;
          }
        }
      });
      return hits;
    }

    // 计算每个分类的等级
    function computeCategoryLevels() {
      const map = {}; // catId -> { count, linked }
      const bump = (id) => { map[id] = (map[id] || 0) + 1; };
      // 1. 经历自动分类
      getExperiences().forEach(e => {
        const txt = (e.title || '') + ' ' + (e.rawDesc || '');
        autoClassify(txt).forEach(bump);
      });
      // 2. 学习计划任务自动分类（完成的）
      getSkills().forEach(s => {
        if (!Array.isArray(s.plan)) return;
        s.plan.forEach(p => {
          if (!p.done) return;
          autoClassify((p.do || '') + ' ' + (p.title || '')).forEach(bump);
        });
      });
      // 转成 [{id, name, icon, level, count}]
      return SKILL_CATS
        .map(c => ({ ...c, count: map[c.id] || 0, level: (map[c.id] || 0) + 1 }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count);
    }

    function calcExpForExp(exp) {
      let base = 30;
      if (exp.rawDesc && exp.rawDesc.length > 50) base += 10;
      if (exp.rawDesc && exp.rawDesc.length > 150) base += 10;
      if (exp.suggestedSkills && exp.suggestedSkills.length >= 3) base += 15;
      return base;
    }

    function calcExpForSkill() {
      return 20;
    }

    document.getElementById('expForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const fd = new FormData(this);
      const rawDate = (fd.get('expDate') || '').trim();
      const rawTitle = (fd.get('expTitle') || '').trim();
      const rawDesc = (fd.get('expDesc') || '').trim();

      if (!rawDate || !rawTitle) { xAlert('日期和标题不能为空哦～'); return; }

      const analysis = analyzeExperience(rawTitle, rawDesc);

      const exp = {
        id: Date.now(),
        date: rawDate,
        title: rawTitle,
        rawDesc: rawDesc,
        structured: analysis.structured,
        suggestedSkills: analysis.suggestedSkills,
        confirmedSkills: [],
        skillConfirmed: false
      };

      const list = getExperiences();
      list.unshift(exp);
      saveExperiences(list);

      closeExpModal();

      const expGain = calcExpForExp(exp);
      addExp(expGain, '记录经历');

      if (analysis.suggestedSkills.length > 0) {
        pendingExpId = exp.id;
        showSkillConfirmModal(analysis.suggestedSkills);
      } else {
        goPage('page-explog');
      }
    });

    /* ============================================================
       8) 技能确认弹窗
       ============================================================ */
    function showSkillConfirmModal(suggestedSkills) {
      const list = document.getElementById('skillConfirmList');
      const existingSkills = getSkills().map(s => s.name);

      list.innerHTML = suggestedSkills.map(sk => {
        const already = existingSkills.includes(sk);
        return `
          <label class="skill-confirm-item ${already ? 'already' : ''}">
            <input type="checkbox" value="${escapeHtml(sk)}" ${already ? 'disabled checked' : ''} />
            <span class="skill-confirm-name">${escapeHtml(sk)}</span>
            ${already ? '<span class="skill-confirm-badge">已有</span>' : ''}
          </label>`;
      }).join('');

      document.getElementById('skillCustomInput').value = '';
      document.getElementById('skillConfirmModal').style.display = 'flex';
    }

    function closeSkillConfirm() {
      document.getElementById('skillConfirmModal').style.display = 'none';
      pendingExpId = null;
      goPage('page-explog');
    }

    function confirmSkills() {
      if (!pendingExpId) { closeSkillConfirm(); return; }

      const checkboxes = document.querySelectorAll('#skillConfirmList input[type=checkbox]:checked:not(:disabled)');
      const customInput = document.getElementById('skillCustomInput').value.trim();
      const selected = [];
      checkboxes.forEach(cb => selected.push(cb.value));
      if (customInput) selected.push(customInput);

      const exps = getExperiences();
      const exp = exps.find(e => e.id === pendingExpId);
      if (exp) {
        exp.confirmedSkills = selected;
        exp.skillConfirmed = true;
        saveExperiences(exps);
      }

      const skills = getSkills();
      let newCount = 0;
      selected.forEach(sk => {
        const existing = skills.find(s => s.name === sk);
        if (existing) {
          if (!existing.sourceExpIds.includes(pendingExpId)) {
            existing.sourceExpIds.push(pendingExpId);
          }
          // 如果这个技能原本是学习中的，现在通过真实经历验证了
          if (existing.status && existing.status !== 'lit') {
            existing.status = 'lit';
            existing.verifiedAt = today();
          }
        } else {
          skills.push({
            name: sk,
            sourceExpIds: [pendingExpId],
            confirmedAt: today(),
            status: 'lit',
            treeIds: []
          });
          newCount++;
        }
      });
      saveSkills(skills);

      if (selected.length > 0) {
        addExp(calcExpForSkill() * selected.length, '确认技能');
      }

      closeSkillConfirm();
    }

    document.getElementById('skillConfirmModal').addEventListener('click', function(e) {
      if (e.target === this) closeSkillConfirm();
    });

    /* ============================================================
       9) 经历库渲染
       ============================================================ */
    function renderExpLog() {
      const list = getExperiences();
      const container = document.getElementById('explogList');
      const empty = document.getElementById('explogEmpty');

      if (!list.length) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
      }

      empty.style.display = 'none';

      list.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.id - a.id;
      });

      container.innerHTML = list.map(exp => {
        const s = exp.structured || {};
        const needsConfirm = exp.suggestedSkills && exp.suggestedSkills.length > 0 && !exp.skillConfirmed;

        return `
          <div class="exp-entry pixel-card">
            <div class="exp-entry-header">
              <span class="exp-date">${escapeHtml(exp.date)}</span>
              <span class="exp-title">${escapeHtml(exp.title)}</span>
              <button class="exp-del" onclick="deleteExp(${exp.id})" title="删除">✕</button>
            </div>

            <div class="exp-structured">
              <div class="exp-field"><span class="exp-field-label">发生了什么</span><span class="exp-field-val">${escapeHtml(s.happened || '未记录')}</span></div>
              <div class="exp-field"><span class="exp-field-label">我做了什么</span><span class="exp-field-val">${escapeHtml(s.whatIDid || '未记录')}</span></div>
              <div class="exp-field"><span class="exp-field-label">结果</span><span class="exp-field-val">${escapeHtml(s.result || '未记录')}</span></div>
              <div class="exp-field"><span class="exp-field-label">我的感受</span><span class="exp-field-val">${escapeHtml(s.feeling || '未记录')}</span></div>
            </div>

            <div class="exp-raw-toggle" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'; this.textContent=this.nextElementSibling.style.display==='none'?'▶ 查看原始输入':'▼ 收起原始输入'">
              ▶ 查看原始输入
            </div>
            <div class="exp-raw-text" style="display:none;">${escapeHtml(exp.rawDesc)}</div>

            ${exp.suggestedSkills && exp.suggestedSkills.length ? `
              <div class="exp-skills-section">
                <div class="exp-skills-label">🧐 可能涉及的技能：</div>
                <div class="exp-skills-tags">
                  ${exp.suggestedSkills.map(sk => {
                    const confirmed = exp.confirmedSkills && exp.confirmedSkills.includes(sk);
                    return `<span class="exp-skill-tag ${confirmed ? 'confirmed' : 'suggested'}">${escapeHtml(sk)}${confirmed ? ' ✓' : ''}</span>`;
                  }).join('')}
                </div>
                ${needsConfirm ? `<button class="btn-pixel primary" style="margin-top:8px; font-size:12px; padding:6px 12px;" onclick="reopenSkillConfirm(${exp.id})">确认我的技能</button>` : ''}
              </div>
            ` : ''}
          </div>`;
      }).join('');
    }

    function reopenSkillConfirm(expId) {
      const exp = getExperiences().find(e => e.id === expId);
      if (!exp || !exp.suggestedSkills) return;
      pendingExpId = expId;
      showSkillConfirmModal(exp.suggestedSkills);
    }

    async function deleteExp(id) {
      if (!(await xConfirm('确定要删除这段经历吗？'))) return;
      const exp0 = getExperiences().find(e => e.id === id);
      let list = getExperiences().filter(e => e.id !== id);
      saveExperiences(list);
      // 同步删除云端记录（否则下次拉取会复活）
      if (exp0) dbDeleteWhere(DB_IDS.experiences, r => dbText(r, '标题') === exp0.title, _dbCache.experiences);

      const skills = getSkills();
      skills.forEach(s => {
        if (s.sourceExpIds) s.sourceExpIds = s.sourceExpIds.filter(eid => eid !== id);
      });
      const remaining = skills.filter(s => s.sourceExpIds.length > 0 || s.status !== 'lit');
      saveSkills(remaining);

      renderExpLog();
      renderSkillGrid();
    }

    /* ============================================================
       10) 技能树页面
       ============================================================ */
    let currentTreeFilter = 'all';

    function switchTreeTab(treeId) {
      currentTreeFilter = treeId;
      document.querySelectorAll('.tree-tab').forEach(t => t.classList.remove('active'));
      document.querySelector(`.tree-tab[data-tree="${treeId}"]`).classList.add('active');
      renderSkillTree();
    }

    function renderTreeTabs() {
      const trees = getTrees();
      const tabsEl = document.getElementById('treeTabs');
      let html = `<div class="tree-tab ${currentTreeFilter === 'all' ? 'active' : ''}" data-tree="all" onclick="switchTreeTab('all')">全部</div>`;
      trees.forEach(tree => {
        html += `<div class="tree-tab ${currentTreeFilter === tree.id ? 'active' : ''}" data-tree="${escapeHtml(tree.id)}" onclick="switchTreeTab('${escapeHtml(tree.id)}')">${escapeHtml(tree.name)}</div>`;
      });
      tabsEl.innerHTML = html;
    }

    function renderSkillTree() {
      const skills = getSkills();
      const exps = getExperiences();
      const trees = getTrees();

      // 根据当前筛选条件过滤技能
      let filteredSkills = skills;
      if (currentTreeFilter !== 'all') {
        filteredSkills = skills.filter(s => {
          if (s.treeIds && s.treeIds.includes(currentTreeFilter)) return true;
          if (s.goalTreeId === currentTreeFilter) return true;
          return false;
        });
      }

      // 分类
      const owned = filteredSkills.filter(s => s.status === 'lit');
      const learning = filteredSkills.filter(s => s.status && s.status !== 'lit');

      // 渲染左边：已拥有
      const ownedEl = document.getElementById('ownedSkillList');
      if (!owned.length) {
        ownedEl.innerHTML = `<div class="st-empty">记录真实经历并确认技能后，这里会逐渐长出来 ✨</div>`;
      } else {
        ownedEl.innerHTML = owned.map(s => {
          const sourceCount = (s.sourceExpIds || []).length;
          const treeNames = (s.treeIds || []).map(tid => trees.find(t => t.id === tid)).filter(Boolean).map(t => t.name);
          return `<div class="st-skill-node lit" onclick="showSkillDetail('${escapeHtml(s.name)}')">
            <span class="st-node-dot lit"></span>
            <span class="st-node-name">${escapeHtml(s.name)}</span>
            ${sourceCount ? `<span class="st-node-meta">${sourceCount}段经历</span>` : ''}
            ${treeNames.length ? `<span class="st-node-tree">${treeNames.map(n => escapeHtml(n)).join(' · ')}</span>` : ''}
          </div>`;
        }).join('');
      }

      // 渲染右边：学习中
      const learnEl = document.getElementById('learningSkillList');
      if (!learning.length) {
        learnEl.innerHTML = `<div class="st-empty">点击下方按钮，告诉AI你想学什么 🌱</div>`;
      } else {
        learnEl.innerHTML = learning.map(s => {
          const statusClass = s.status || 'want';
          const treeName = s.goalTreeId ? (trees.find(t => t.id === s.goalTreeId) || {}).name : '';
          // 计算学习进度
          let progress = '';
          if (s.plan && s.plan.length) {
            const done = s.plan.filter(t => t.done).length;
            progress = `${done}/${s.plan.length}`;
          }
          return `<div class="st-skill-node ${statusClass}" onclick="showSkillDetail('${escapeHtml(s.name)}')">
            <span class="st-node-dot ${statusClass}"></span>
            <span class="st-node-name">${escapeHtml(s.name)}</span>
            <span class="st-node-status">${statusLabel(s.status)}</span>
            ${progress ? `<span class="st-node-meta">${progress}</span>` : ''}
            ${treeName ? `<span class="st-node-tree">${escapeHtml(treeName)}</span>` : ''}
          </div>`;
        }).join('');
      }
    }

    /* ============================================================
       11) 新建成长方向
       ============================================================ */
    function openNewTreeModal() {
      document.getElementById('newTreeName').value = '';
      document.getElementById('newTreeDesc').value = '';
      // 显示已有技能供勾选
      const skills = getSkills().filter(s => s.status === 'lit');
      const listEl = document.getElementById('newTreeSkillList');
      if (!skills.length) {
        listEl.innerHTML = `<div style="font-size:11px; color:var(--c-text-soft);">还没有已确认的技能</div>`;
      } else {
        listEl.innerHTML = skills.map(s => `
          <label class="skill-confirm-item" style="margin-bottom:4px;">
            <input type="checkbox" value="${escapeHtml(s.name)}" />
            <span class="skill-confirm-name">${escapeHtml(s.name)}</span>
          </label>`).join('');
      }
      document.getElementById('newTreeModal').style.display = 'flex';
    }

    function closeNewTreeModal() {
      document.getElementById('newTreeModal').style.display = 'none';
    }

    document.getElementById('newTreeModal').addEventListener('click', function(e) {
      if (e.target === this) closeNewTreeModal();
    });

    function saveNewTree() {
      const name = document.getElementById('newTreeName').value.trim();
      if (!name) { xAlert('给方向起个名字吧～'); return; }
      const desc = document.getElementById('newTreeDesc').value.trim();

      // 获取勾选的技能
      const checked = document.querySelectorAll('#newTreeSkillList input[type=checkbox]:checked');
      const skillNames = [];
      checked.forEach(cb => skillNames.push(cb.value));

      const tree = {
        id: uid(),
        name: name,
        desc: desc,
        createdAt: today()
      };

      const trees = getTrees();
      trees.push(tree);
      saveTrees(trees);

      // 把技能关联到这个方向
      if (skillNames.length) {
        const skills = getSkills();
        skillNames.forEach(sn => {
          const s = skills.find(sk => sk.name === sn);
          if (s) {
            if (!s.treeIds) s.treeIds = [];
            if (!s.treeIds.includes(tree.id)) s.treeIds.push(tree.id);
          }
        });
        saveSkills(skills);
      }

      closeNewTreeModal();
      renderTreeTabs();
      renderSkillTree();
    }

    /* ============================================================
       12) 我想学新技能
       ============================================================ */
    function openLearnGoalModal() {
      document.getElementById('learnWhat').value = '';
      document.getElementById('learnDuration').value = '';
      document.getElementById('learnTimePerDay').value = '';

      // 填充成长方向下拉
      const trees = getTrees();
      const sel = document.getElementById('learnTreeId');
      sel.innerHTML = `<option value="">不放入任何方向</option>`;
      trees.forEach(t => {
        sel.innerHTML += `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`;
      });

      document.getElementById('learnGoalModal').style.display = 'flex';
    }

    function closeLearnGoalModal() {
      document.getElementById('learnGoalModal').style.display = 'none';
    }

    document.getElementById('learnGoalModal').addEventListener('click', function(e) {
      if (e.target === this) closeLearnGoalModal();
    });

    function submitLearnGoal() {
      const what = document.getElementById('learnWhat').value.trim();
      if (!what) { xAlert('说说你想学什么吧～'); return; }

      const duration = document.getElementById('learnDuration').value.trim();
      const timePerDay = document.getElementById('learnTimePerDay').value.trim();
      const treeId = document.getElementById('learnTreeId').value;

      const fullText = what + ' ' + duration + ' ' + timePerDay;
      const assumptions = [];

      // ---- 提取时长（缺省做保守假设并标注） ----
      let days = 0;
      const dayMatch = fullText.match(/(\d+)\s*[天日]/);
      const monthMatch = fullText.match(/(\d+)\s*个?月/);
      const weekMatch = fullText.match(/(\d+)\s*个?星期|(\d+)\s*周/);
      if (dayMatch) days = parseInt(dayMatch[1]);
      else if (monthMatch) days = parseInt(monthMatch[1]) * 30;
      else if (weekMatch) days = parseInt(weekMatch[1] || weekMatch[2]) * 7;
      if (!days && duration) {
        const numMatch = duration.match(/(\d+)/);
        if (numMatch) days = parseInt(numMatch[1]);
      }
      if (!days) {
        days = 30;
        assumptions.push('时长没写，先按 30 天排——想改的话，在目标里写上"3个月 / 两周"重新生成就好');
      }

      // ---- 提取每天时间 ----
      let minutesPerDay = 0;
      const hourMatch = fullText.match(/(\d+(?:\.\d+)?)\s*个?小时/);
      const minMatch = fullText.match(/(\d+)\s*分钟/);
      if (hourMatch) minutesPerDay = Math.round(parseFloat(hourMatch[1]) * 60);
      else if (minMatch) minutesPerDay = parseInt(minMatch[1]);
      if (!minutesPerDay) {
        minutesPerDay = 60;
        assumptions.push('每天投入时间先按 1 小时排');
      }

      // ---- 提取基础 ----
      let isZero = /零基础|完全不会|没接触过|没用过|小白|从零/.test(fullText);
      const hasExperience = !isZero && /有一点|有一些|用过|学过一点|会一点|有点基础|学过/.test(fullText);
      const wantsAdvanced = /精通|专业级|高级|深入|系统/.test(fullText);
      if (!isZero && !hasExperience) {
        // 与"保守假设"标注保持一致：默认按零基础起步
        isZero = true;
        assumptions.push('基础先按零基础起步排（有基础的话进度会更快）');
      }

      // ---- 匹配领域，直接生成 ----
      const domain = matchDomain(fullText);
      const skillName = domain ? domain.name : extractSkillName(what);
      const unitDefs = buildUnitDefs(domain, { isZero, hasExperience, wantsAdvanced, what });
      const verifyTask = domain ? domain.verifyTask : genericVerifyTask(what);
      const plan = aiGeneratePlan(unitDefs, days, minutesPerDay, verifyTask);

      // ---- 保存技能 ----
      const skills = getSkills();
      let finalName = skillName;
      if (skills.find(s => s.name === finalName)) finalName = skillName + '（' + today() + '）';

      skills.push({
        name: finalName,
        status: 'learning',
        sourceExpIds: [],
        confirmedAt: null,
        goalText: what,
        goalDuration: duration || (days + '天'),
        goalTreeId: treeId || null,
        assumptions: assumptions,
        breakdown: unitDefs.map((u, i) => ({
          id: 'u' + i,
          name: u.name,
          phase: u.phase,
          status: 'want',
          sourceExpId: null
        })),
        plan: plan,
        verifyTask: verifyTask,
        treeIds: treeId ? [treeId] : []
      });
      saveSkills(skills);

      closeLearnGoalModal();
      renderTreeTabs();
      renderSkillTree();
      showLearnPlanModal(finalName);
      addExp(15, '设定学习目标');
    }

    /* ============================================================
       13) 领域知识库 + 技能拆解
       质量底线：每个任务必须"具体、能做、有结果"——
       用户看完就知道今天做什么、做到什么程度算完成。
       ============================================================ */
    const PHASE_NAMES = {
      1: '🌱 第一阶段 · 打基础',
      2: '🎯 第二阶段 · 核心练习',
      3: '🚀 第三阶段 · 整合实战'
    };

    const DOMAIN_LIB = [
      /* ---------- 雅思 ---------- */
      {
        key: 'ielts', name: '雅思',
        patterns: [/雅思|ielts/],
        verifyTask: '完整模拟一次雅思考试：听力+阅读+写作+口语同一天完成（口语录音、写作手写），按官方标准给自己估一个总分，并把这次经历记录下来。',
        units: [
          { name: '听力 · 精听与定位', tasks: [
            { do: '做一篇剑桥雅思听力 Section 1：第一遍正常做题；第二遍逐句暂停，把没听出来的词全部写下来，按"不认识 / 认识但没反应过来 / 连读吞音"分类', time: '40分钟', standard: '一页分类清单，至少 10 个词' },
            { do: '练定位法：读题时先圈出关键词（数字/专有名词/转折词），听的时候只盯关键词前后，不追求听懂每个词', time: '30分钟', standard: '能说出每道题自己是靠哪个词定位到的' },
            { do: '精听一段 Section 3 学术对话：逐句听写，一句最多重播 3 遍，然后对照原文用红笔标出听错的地方', time: '40分钟', standard: '听写准确率 70% 以上' },
            { do: '限时完成一个完整 Section 并对答案，把错题原因分成"走神 / 词汇不认识 / 连读没听出 / 语速跟不上"四类，找出今天最主要的一种', time: '35分钟', standard: '失分主因明确，写在笔记里', repeat: true },
          ]},
          { name: '阅读 · 定位与同义替换', tasks: [
            { do: '限时 20 分钟完成一篇雅思阅读真题，做完把错题分成"没定位到 / 没认出同义替换 / 句子没读懂 / 时间不够"，找出今天最主要的失分原因', time: '40分钟', standard: '错题全部归因，主因明确', repeat: true },
            { do: '把今天做过的阅读里"题目↔原文"的同义替换抄成词对卡片（例如 rely on → depend on）', time: '25分钟', standard: '至少 8 组替换词对' },
            { do: '挑一篇剑桥阅读，把其中的长难句逐句翻译成中文写下来，再对照官方译文检查偏差', time: '40分钟', standard: '独立翻出 10 个长难句' },
            { do: '专攻一种你最错的题型（判断题/段落匹配/填空），连做 4 组同题型，总结出自己的三步解题流程', time: '45分钟', standard: '写出自己的解题步骤（3 步以上）' },
          ]},
          { name: '写作 · 大小作文', tasks: [
            { do: '搭 Task 1 框架：开头一句改写题目 + 两个主体段（各写一个最明显的趋势或对比）+ 结尾一句总括；用一套剑桥真题的数据亲手写一遍', time: '30分钟', standard: '能不看范例默写框架' },
            { do: '限时 25 分钟写一篇 Task 1，写完找一篇 7 分范文逐句对照，圈出范文有而你没有的数据表达', time: '50分钟', standard: '一篇完整小作文 + 一张差距清单' },
            { do: '给 5 个 Task 2 高频话题（教育/科技/环境/工作/社会）各列一份提纲：观点 + 2 个支持理由 + 1 个反例，不写全文', time: '35分钟', standard: '5 份提纲，每份 3 分钟内能口头展开' },
            { do: '限时 40 分钟写一篇 Task 2 大作文，写完用三问自查：观点有没有回应题目？每段有没有例子？连接词是不是只会用 however？', time: '50分钟', standard: '一篇完整大作文 + 自查结果', repeat: true },
          ]},
          { name: '口语 · Part 1/2/3', tasks: [
            { do: '把当季口语题库 Part 1 的 20 个话题各回答一遍并录音，回听标出所有卡壳超过 3 秒的地方', time: '40分钟', standard: '20 段录音 + 卡壳清单' },
            { do: '做 Part 2 素材卡：准备 5 张"人物 / 地点 / 经历 / 物品 / 想法"素材卡，尝试用同一张卡覆盖 2 个不同话题', time: '40分钟', standard: '5 张素材卡，每张能讲满 2 分钟' },
            { do: '随机抽一个 Part 2 话题，限时 1 分钟准备，录音说满 2 分钟；回听数一下"emm / 就是说"出现的次数并记下来', time: '20分钟', standard: '一段 2 分钟录音 + 口头禅统计', repeat: true },
            { do: '练 Part 3 思路：抽 5 道抽象题，用"直接回答 → 两个角度 → 举一个例子"的结构口头回答并录音', time: '30分钟', standard: '5 段结构完整的录音' },
          ]},
          { name: '整套真题实战', tasks: [
            { do: '按考试时间完整做一套剑桥真题：听力 40 分钟 + 阅读 60 分钟连做、中间不休息；对答案算分，写三行复盘——哪里掉分最多 / 为什么 / 明天补哪块', time: '约 3 小时（可拆两个半天）', standard: '一套完整成绩 + 三行复盘', repeat: true },
          ]},
        ]
      },
      /* ---------- 托福 / 四六级 / 考研英语 ---------- */
      {
        key: 'eng-exam', name: '英语考试',
        patterns: [/托福|toefl|四六级|四级|六级|cet|考研英语|专四|专八/],
        verifyTask: '按考试时间完整做一套真题并算分，写三行复盘：哪里掉分最多、为什么、接下来补哪块，并记录为一段真实经历。',
        units: [
          { name: '听力 · 精听', tasks: [
            { do: '精听一篇真题听力：第一遍做题，第二遍逐句暂停跟读，把没听出来的词按"不认识 / 没反应过来 / 连读吞音"分类记录', time: '40分钟', standard: '一页分类清单，至少 10 个词' },
            { do: '限时做一套听力真题，对答案后把错题原因分成"走神 / 词汇 / 语速 / 题没读完"四类，找出主要失分原因', time: '35分钟', standard: '失分主因明确', repeat: true },
          ]},
          { name: '阅读 · 定位与替换', tasks: [
            { do: '限时做一篇阅读真题，把错题分成"没定位到 / 没认出同义替换 / 句子没读懂 / 时间不够"，找出今天最主要的失分原因', time: '35分钟', standard: '错题全部归因', repeat: true },
            { do: '把这篇阅读里题目和原文的同义替换抄成词对卡片', time: '25分钟', standard: '至少 8 组替换词对' },
          ]},
          { name: '写作与词汇', tasks: [
            { do: '限时写一篇考试作文，写完对照一篇高分范文逐句圈出差距（哪里没例子 / 哪里连接生硬 / 哪个表达中式）', time: '50分钟', standard: '一篇作文 + 一张差距清单' },
            { do: '背一篇高分范文后合上默写，对照原文标出漏掉的连接词和好表达，抄进自己的本子', time: '30分钟', standard: '默写还原 80% 以上' },
            { do: '记一组真题高频词（50 个）：先全部过一遍，只挑出"完全不认识"的重点背，背完让同学抽 20 个', time: '40分钟', standard: '抽查 20 个对 18 个' },
          ]},
          { name: '整套真题实战', tasks: [
            { do: '按考试时间完整做一套真题（含作文），对答案算分，写三行复盘：哪里掉分最多 / 为什么 / 明天补哪块', time: '约 2.5 小时（可拆两个半天）', standard: '一套完整成绩 + 三行复盘', repeat: true },
          ]},
        ]
      },
      /* ---------- 英语口语（非考试） ---------- */
      {
        key: 'eng-speaking', name: '英语口语',
        patterns: [/英语口语|口语|spoken|英音|美音|英文对话|和外国人/],
        verifyTask: '和真人进行一次 15 分钟以上的全英文对话（语伴/外教/同学均可），结束后写下 3 句当时想说但没说出来的话。',
        units: [
          { name: '发音与语调', tasks: [
            { do: '选一段 1 分钟的英文视频做 shadowing：听一句跟一句，模仿到语调几乎一样，录下来和原音对比', time: '30分钟', standard: '录音和原音听不出明显语调差异' },
          ]},
          { name: '日常表达', tasks: [
            { do: '用英语自言自语描述今天做了什么并录音 3 分钟；回听记下 3 处卡壳，查好说法后再录一遍', time: '20分钟', standard: '两版录音，第二版卡壳明显减少' },
            { do: '随机抽一个话题，用"观点 + 两个理由 + 一个例子"的结构口头说满 2 分钟并录音', time: '20分钟', standard: '一段结构完整的 2 分钟录音', repeat: true },
          ]},
          { name: '真实对话', tasks: [
            { do: '和真人用英语对话 15 分钟（语伴/外教/同学），结束后写下 3 句当时没说出来的句子', time: '15分钟', standard: '对话真的发生了 + 3 句补充', repeat: true },
          ]},
        ]
      },
      /* ---------- 摄影 ---------- */
      {
        key: 'photography', name: '摄影',
        patterns: [/摄影|相机|拍人像|手动模式|单反|微单|拍照/],
        verifyTask: '使用手动模式（M档），独立完成一组 8 张以上的人像作品并做基础后期，发给被拍的人确认满意。',
        units: [
          { name: '曝光三要素', tasks: [
            { do: '用同一个场景拍 9 张照片：3 张只改光圈、3 张只改快门、3 张只改 ISO，每组记下参数；最后不看教程，自己说出三个参数分别控制什么、互相怎么影响', time: '45分钟', standard: '9 张照片 + 能独立讲清三要素' },
            { do: '用 M 档在室内拍一张曝光正常的照片，只允许看直方图判断曝光，不许靠屏幕效果猜', time: '20分钟', standard: '直方图不贴左右两侧', repeat: true },
          ]},
          { name: '对焦与景深', tasks: [
            { do: '拍一组对比照片：同一朵花用最近对焦距离和最远对焦距离各拍一张，再用最大光圈和最小光圈各拍一张，观察背景虚化的变化', time: '30分钟', standard: '4 张对比照，能说清光圈和对焦距离分别怎么影响虚化' },
            { do: '练手动选对焦点：给会动的对象（人/宠物）拍 10 张，要求每张眼睛都清晰', time: '30分钟', standard: '10 张里至少 8 张眼睛清晰', repeat: true },
          ]},
          { name: '构图', tasks: [
            { do: '带着"三分法、对称、引导线、框架"四种构图出门拍一小时，每种至少拍 3 张，回家各标出最好的一张', time: '60分钟', standard: '12 张照片 + 4 张精选' },
            { do: '选一张你最喜欢的照片，分析它的构图、光线和拍摄时机，写 100 字', time: '20分钟', standard: '一段 100 字的照片分析' },
          ]},
          { name: '光线', tasks: [
            { do: '同一个人分别在大中午直射光下、树荫下、傍晚黄金时刻各拍一张半身像，对比皮肤质感和阴影差别', time: '40分钟', standard: '3 张对比照 + 能说出哪种光最适合人像' },
          ]},
          { name: '人像实战', tasks: [
            { do: '给一位朋友拍一组 10 张的人像：拍之前先聊 5 分钟让对方放松，想好 3 个姿势和 2 个机位；拍完挑 3 张做基础后期发给对方', time: '90分钟', standard: '交付一组人像作品', repeat: true },
          ]},
        ]
      },
      /* ---------- 视频剪辑 ---------- */
      {
        key: 'video', name: '视频剪辑',
        patterns: [/premiere|剪映|剪辑|剪视频|final cut|达芬奇|vlog|视频制作/],
        verifyTask: '使用至少 10 段原始素材，独立剪出一条 60 秒以上、带字幕和配乐的完整视频，发布出去或交付给需要的人。',
        units: [
          { name: '素材管理与粗剪', tasks: [
            { do: '新建项目导入 10 段素材，按"废镜头 / 可用 / 精选"分三堆，把精选素材在时间线上粗排一遍，剪出一条 60 秒的无声粗剪', time: '60分钟', standard: '一条 60 秒粗剪时间线' },
            { do: '只用快捷键（剪切 C / 选择 V）完成一条 30 秒视频的全部剪切，全程不碰鼠标', time: '40分钟', standard: '全程快捷键完成' },
          ]},
          { name: '节奏', tasks: [
            { do: '把同一段素材剪两版：一版平均每 3 秒一个镜头、一版平均每 6 秒一个镜头，配同一首音乐播放对比，写下哪版更合适以及为什么', time: '50分钟', standard: '两版对比 + 一段判断理由' },
          ]},
          { name: '音频与字幕', tasks: [
            { do: '给一条视频做声音处理：BGM 音量压到人声以下、人声降噪、在转场处加一个音效；导出后戴耳机检查人声和音乐不打架', time: '40分钟', standard: '戴耳机听，人声清晰、音乐不抢' },
            { do: '给一条 2 分钟的视频上完所有字幕：统一字体字号、在安全区内、每句不超过 15 字，看完只需要改 3 处以内', time: '50分钟', standard: '一条完整字幕视频' },
          ]},
          { name: '调色与导出', tasks: [
            { do: '用调色工具给同一条视频调三种风格（明亮日系 / 电影感冷暖对比 / 黑金），导出三个版本对比', time: '50分钟', standard: '3 个导出版本' },
            { do: '按平台正确规格导出一条 1080p 视频（H.264、码率合理），检查清晰度和文件大小', time: '25分钟', standard: '导出文件规格正确、清晰度无损' },
          ]},
          { name: '完整作品', tasks: [
            { do: '从拍/找素材到剪完发布，独立完成一条 60 秒以上、有明确主题的完整视频（含字幕和配乐）', time: '约 3 小时（可分几天）', standard: '一条发布出去的成片', repeat: true },
          ]},
        ]
      },
      /* ---------- 做饭 ---------- */
      {
        key: 'cooking', name: '做饭',
        patterns: [/做饭|烹饪|烧菜|炒菜|厨艺|家常菜|下厨/],
        verifyTask: '连续 3 天独立完成一荤一素一汤的晚餐，其中至少 2 道菜是第一次做的，家人或室友吃完给出评价。',
        units: [
          { name: '刀工与备菜', tasks: [
            { do: '练切一盘土豆丝：先切片再切丝，切完把第一根和最后一根摆在一起拍照对比', time: '40分钟', standard: '最后 5 根明显比前 5 根均匀' },
            { do: '给一顿两人餐做完整备菜：3 个菜的全部食材洗切配好、调料按菜分小碗装好，然后才开火', time: '40分钟', standard: '开火前所有食材就位' },
          ]},
          { name: '火候与基础炒', tasks: [
            { do: '独立完成一道西红柿炒蛋，重点练习判断下锅顺序和火候；做完记录一次"哪里没做好、下次准备改什么"', time: '30分钟', standard: '一道菜 + 一条复盘', repeat: true },
            { do: '做一道青椒肉丝，练习"热锅凉油"防粘和肉丝滑炒，目标是肉丝不粘锅底、不发柴', time: '40分钟', standard: '锅底干净、肉丝嫩' },
          ]},
          { name: '调味', tasks: [
            { do: '煮三碗同样的清汤面，分别只放盐、盐+糖、盐+糖+一点酱油，尝出层次差别并写下感受', time: '30分钟', standard: '能说出糖和酱油分别起什么作用' },
            { do: '做一次蛋炒饭，盐分三次放（炒蛋前 / 中途 / 出锅前），体会分次调味和均匀咸味', time: '30分钟', standard: '蛋炒饭咸味均匀' },
          ]},
          { name: '家常菜单', tasks: [
            { do: '独立完成一荤一素一汤的三菜晚餐（如可乐鸡翅 + 清炒时蔬 + 紫菜蛋花汤），全程不看视频，卡住了只看文字菜谱', time: '90分钟', standard: '三菜同时上桌、温度都在', repeat: true },
            { do: '自选一道从没做过的家常菜独立完成，餐后写两行复盘：火候或调味哪里翻车了、下次改什么', time: '60分钟', standard: '一道新菜 + 两行复盘', repeat: true },
          ]},
        ]
      },
      /* ---------- Presentation / 演讲 ---------- */
      {
        key: 'presentation', name: 'Presentation',
        patterns: [/presentation|汇报|演讲|脱稿|上台|发言|\bpre\b/],
        verifyTask: '独立准备并脱稿完成一次 5 分钟以上的完整 pre，全程不念稿，并留有录音。',
        units: [
          { name: '内容结构', tasks: [
            { do: '把你想讲的主题用"结论先行"写成一页纸：一句话核心观点 + 3 个支撑理由 + 每个理由 1 个例子', time: '30分钟', standard: '一页纸讲稿骨架' },
            { do: '给你的 pre 写开头 30 秒的逐字稿并计时读 5 遍，删到 30 秒以内', time: '25分钟', standard: '开头能在 30 秒内讲完' },
          ]},
          { name: '幻灯片', tasks: [
            { do: '把一页字最多的旧 PPT 改成"一页一个观点 + 一张图 + 不超过 20 字"，改完给同学看，10 秒内能说出这页讲什么', time: '40分钟', standard: '通过 10 秒测试' },
          ]},
          { name: '表达与脱稿', tasks: [
            { do: '对着手机录一遍 3 分钟的 pre，回看并统计三个数据："嗯啊"次数、眼神离开镜头次数、每分钟语速', time: '25分钟', standard: '三个数据都记下来' },
            { do: '用关键词卡片法脱稿讲同一内容：每张卡片只写 3 个词，讲 3 遍，最后一遍录音', time: '30分钟', standard: '能不念稿讲满 3 分钟' },
          ]},
          { name: '实战与问答', tasks: [
            { do: '找一位朋友当面讲一遍，请对方随时在你逻辑跳跃的地方喊停，记下所有被喊停的点', time: '30分钟', standard: '一张"逻辑断点"清单' },
            { do: '请朋友针对你的 pre 提 3 个刁钻问题，练习"停顿 1 秒 → 复述问题 → 分点回答"的应答结构', time: '25分钟', standard: '3 个问题都能结构化回答' },
          ]},
        ]
      },
      /* ---------- 编程 ---------- */
      {
        key: 'programming', name: '编程',
        patterns: [/python|编程|代码|写程序|爬虫|学开发|java|前端/],
        verifyTask: '独立编写一个能实际运行、解决你自己真实问题的小工具（脚本/网页均可），并连续使用一周。',
        units: [
          { name: '环境与第一个程序', tasks: [
            { do: '装好 Python 和编辑器，写第一个程序：让用户输入生日，输出"你活了多少天"', time: '40分钟', standard: '程序跑通、结果正确', beginnerOnly: true },
            { do: '写一个猜数字游戏（1-100，提示大了/小了），写完自己玩一遍验证逻辑', time: '40分钟', standard: '游戏能正常玩' },
          ]},
          { name: '语法与逻辑', tasks: [
            { do: '用循环+条件分别打印：九九乘法表、菱形星号图案、FizzBuzz', time: '50分钟', standard: '三个输出都正确' },
            { do: '写一个脚本读取一个 txt 文件，统计每个词出现的次数，输出前 10 名', time: '60分钟', standard: '前 10 名输出正确' },
          ]},
          { name: '数据与文件', tasks: [
            { do: '用列表+字典做一个你的书单/影单管理器：能添加、删除、按评分排序，数据存成 JSON 文件', time: '90分钟', standard: '重启程序后数据还在' },
          ]},
          { name: '小项目实战', tasks: [
            { do: '写一个爬虫抓取一个公开网页的标题列表，存成 CSV', time: '90分钟', standard: 'CSV 里至少 20 行数据' },
            { do: '做一个你自己真的会用到的小工具（自动整理下载文件夹 / 周报模板生成器 / 生日提醒都行），写到能用为止', time: '2 小时（可分几天）', standard: '真的在用它', repeat: true },
          ]},
        ]
      },
      /* ---------- 设计 ---------- */
      {
        key: 'design', name: '设计',
        patterns: [/photoshop|figma|海报|平面|学设计|做设计|\bps\b|\bui\b/],
        verifyTask: '为一件真实的事（社团招新 / 活动宣传 / 自己的生日会）设计一张完整海报并交付使用。',
        units: [
          { name: '工具基础', tasks: [
            { do: '做一个"公众号封面"尺寸的练习：新建画布、置入图片、打标题、导出，全流程走一遍', time: '40分钟', standard: '导出一张封面图', beginnerOnly: true },
            { do: '临摹一张你觉得好的海报：同样的版式自己重新做一遍（字体和图片可以不同）', time: '90分钟', standard: '两张对比图放一起看' },
          ]},
          { name: '排版', tasks: [
            { do: '做 4 个版本的同一张文字海报：分别只改对齐方式 / 字号对比 / 留白 / 信息层级，感受哪个最清楚', time: '60分钟', standard: '4 个版本 + 能说出最好的那个为什么好' },
          ]},
          { name: '配色', tasks: [
            { do: '从 3 张优秀作品里吸色，各做一套 5 色配色板（主色/辅色/强调色/深/浅），马上用到自己的海报里', time: '40分钟', standard: '3 套配色板 + 一张用上的海报' },
          ]},
          { name: '完整产出', tasks: [
            { do: '为一件真实的事设计一张海报并交付，收集使用者的一条反馈', time: '2 小时（可分几天）', standard: '有人真的用了你的海报', repeat: true },
          ]},
        ]
      },
      /* ---------- 画画 ---------- */
      {
        key: 'drawing', name: '画画',
        patterns: [/画画|素描|插画|手绘|板绘|学画/],
        verifyTask: '完成一张不少于 1 小时的完整作品（临摹或原创均可），和第一天的练习页放在一起对比。',
        units: [
          { name: '线条', tasks: [
            { do: '画满一页：直线、曲线、圆各 20 个，要求手不抖、线条收得住；隔天再来一页，两页放一起对比', time: '30分钟', standard: '第二页明显更稳', repeat: true },
          ]},
          { name: '比例', tasks: [
            { do: '用铅笔测量法临摹 3 张照片：先定大比例，再抠细节；画完和原图叠在一起找比例错的地方', time: '60分钟', standard: '3 张临摹 + 错位标注' },
          ]},
          { name: '明暗', tasks: [
            { do: '画一个球体的明暗：高光、亮面、明暗交界线、反光、投影五个调子都画出来，只用一支铅笔', time: '40分钟', standard: '五个调子都能分辨出来' },
          ]},
          { name: '完整作品', tasks: [
            { do: '完成一张完整的临摹或写生作品（不少于 1 小时），中途不看手机', time: '60分钟以上', standard: '一张成品', repeat: true },
          ]},
        ]
      },
      /* ---------- 写作 ---------- */
      {
        key: 'writing', name: '写作',
        patterns: [/写作|写文章|写公众号|文案|写小说|写故事/],
        verifyTask: '独立写一篇结构完整的文章（800 字以上）并公开发布（公众号/知乎/小红书均可）。',
        units: [
          { name: '素材库', tasks: [
            { do: '建一个素材库（备忘录/笔记本都行），本周每天收集 3 条好素材（金句/故事/数据），周末分类整理', time: '每天 10 分钟', standard: '21 条素材，至少分 3 类' },
          ]},
          { name: '结构', tasks: [
            { do: '拆解 2 篇你喜欢的文章：给每一段标注功能（观点/例子/过渡/金句），然后套这个结构写一篇 500 字短文', time: '90分钟', standard: '一篇有结构的短文' },
          ]},
          { name: '开头与修改', tasks: [
            { do: '给同一个主题写 5 个不同的开头（提问 / 场景 / 金句 / 数据 / 直接冲突），发给朋友选最想读下去的一个', time: '40分钟', standard: '5 个开头 + 一个投票结果' },
            { do: '把一篇旧文章删掉 30% 的字数且不损失信息，再朗读一遍改掉所有拗口的句子', time: '40分钟', standard: '更短的版本读起来更顺' },
          ]},
          { name: '完整产出', tasks: [
            { do: '写一篇完整的短文并公开发布，24 小时后回来看数据和评论', time: '2 小时（可分几天）', standard: '公开发布一篇', repeat: true },
          ]},
        ]
      },
      /* ---------- 吉他 / 乐器 ---------- */
      {
        key: 'guitar', name: '吉他弹唱',
        patterns: [/吉他|尤克里里|ukulele|弹唱/],
        verifyTask: '不看谱边弹边唱完成一首完整的歌，录下来发给朋友听。',
        units: [
          { name: '基础和弦', tasks: [
            { do: '学会 C、G、Am、Em 四个和弦：每个按住后从上到下逐根弦弹，保证每根弦都发声清晰', time: '40分钟', standard: '四个和弦都清晰发声' },
          ]},
          { name: '和弦转换', tasks: [
            { do: '练转换：C→G→Am→Em 循环，开节拍器 60bpm，每小节换一次，连续 3 分钟不断', time: '30分钟', standard: '3 分钟不断', repeat: true },
          ]},
          { name: '节奏与弹唱', tasks: [
            { do: '练 4 种扫弦节奏型，跟着一首慢歌从头扫到尾', time: '40分钟', standard: '完整扫完一首歌' },
            { do: '选一首只用这 4 个和弦的歌：先只唱不弹 → 再只弹不唱 → 最后合起来，录一遍', time: '60分钟', standard: '能边弹边唱完整首' },
          ]},
        ]
      },
      /* ---------- 健身 / 跑步 ---------- */
      {
        key: 'fitness', name: '健身',
        patterns: [/健身|跑步|减脂|增肌|锻炼|运动|引体|马甲线/],
        verifyTask: '按自己定的每周训练表连续执行 2 周，并记录每次的训练内容和一个能对比的数值（配速/个数/重量）。',
        units: [
          { name: '基础动作模式', tasks: [
            { do: '学三个基础动作（深蹲 / 俯卧撑 / 平板支撑），每个 3 组；用手机侧面录像，对照标准动作找出自己的 2 个问题', time: '40分钟', standard: '3 段录像 + 问题清单' },
            { do: '隔天重复：深蹲 3×12、俯卧撑 3×8（跪姿也行）、平板支撑 3×30 秒，和上次的录像对比', time: '30分钟', standard: '动作比上次标准', repeat: true },
          ]},
          { name: '有氧耐力', tasks: [
            { do: '慢跑或快走 30 分钟，记下配速和结束时的心率；每周 2-3 次，目标是比第一次更轻松', time: '30分钟', standard: '配速/心率有记录', repeat: true },
          ]},
          { name: '计划与记录', tasks: [
            { do: '定一张每周训练表（每周几天、每次练什么），贴在显眼的地方，本周按表完成并打勾', time: '20分钟', standard: '一张表 + 本周打卡' },
            { do: '记录三天全部饮食，估算热量，找出最大的一个问题（奶茶/夜宵/不吃早餐），只改这一项', time: '20分钟', standard: '三天记录 + 一个改进' },
          ]},
        ]
      },
    ];

    // 匹配领域
    function matchDomain(text) {
      const t = text.toLowerCase();
      for (const d of DOMAIN_LIB) {
        if (d.patterns.some(p => p.test(t))) return d;
      }
      return null;
    }

    // 根据领域 + 用户情况生成能力单元定义（含任务池）
    function buildUnitDefs(domain, opts) {
      let defs;
      if (domain) {
        defs = domain.units.filter(u =>
          (!u.adv || opts.wantsAdvanced) &&
          (!u.beginnerOnly || opts.isZero)
        ).map(u => ({ name: u.name, tasks: u.tasks }));
      } else {
        defs = genericUnits(opts.what);
      }
      // 分阶段：前 40% 打基础，中间核心练习，最后整合实战
      const n = defs.length;
      defs.forEach((u, i) => {
        u.phase = i < n * 0.4 ? 1 : (i < n * 0.85 ? 2 : 3);
      });
      return defs;
    }

    // 未匹配领域时的通用拆解（仍然要求具体、能做、有结果）
    function genericUnits(what) {
      const name = extractSkillName(what);
      return [
        { name: name + ' · 入门准备', tasks: [
          { do: '找出学「' + name + '」最常用的 3 个工具 / APP / 资源，各花 15 分钟试用，选一个当主力，写一句"为什么选它"', time: '45分钟', standard: '定了主力工具 + 一句理由' },
          { do: '读 2 篇"如何入门' + name + '"的高赞经验帖，各读完后用自己的话写出 3 条共同建议', time: '40分钟', standard: '6 条建议，合并重复后至少 3 条' },
        ]},
        { name: name + ' · 基础操作', tasks: [
          { do: '跟一个入门教程完整做一遍（边看边做、不跳步骤），做的过程记下卡壳的 3 个地方', time: '60分钟', standard: '做出教程的成品 + 卡壳清单' },
          { do: '隔天不看教程，把昨天的成品独立重做一遍，卡住才允许回看', time: '60分钟', standard: '能独立重做 80%' },
        ]},
        { name: name + ' · 核心练习', tasks: [
          { do: '找一件你生活里真实需要用「' + name + '」解决的小事，直接用它解决一次', time: '45分钟', standard: '事情真的被解决了', repeat: true },
          { do: '给「' + name + '」定一个 30 分钟内能做完的小练习，做完立刻检验产出', time: '30分钟', standard: '有一个看得见的产出', repeat: true },
        ]},
        { name: name + ' · 实战产出', tasks: [
          { do: '独立完成一个属于你自己的「' + name + '」小作品，做完拿给一个朋友看，请对方说一句最直观的感受', time: '90分钟', standard: '一个作品 + 一条他人反馈' },
        ]},
      ];
    }

    function genericVerifyTask(what) {
      const name = extractSkillName(what);
      return '独立完成一个「' + name + '」的完整成品（不看教程、不找人代做），并把它记录为一段真实经历。';
    }

    /* ============================================================
       15) 技能名称提取
       ============================================================ */
    function extractSkillName(what) {
      // 从自然语言中提取技能名称（仅用于未匹配到领域库时）
      const text = what.toLowerCase();

      if (/雅思|ielts/.test(text)) return '雅思';
      if (/托福|toefl|四六级|四级|六级|考研英语/.test(text)) return '英语考试';
      if (/premiere|剪映|剪辑|剪视频/.test(text)) return '视频剪辑';
      if (/摄影|相机/.test(text)) return '摄影';
      if (/做饭|烹饪|炒菜|家常菜/.test(text)) return '做饭';
      if (/presentation|汇报|演讲/.test(text)) return 'Presentation';
      if (/python/.test(text)) return 'Python编程';
      if (/编程|代码|开发/.test(text)) return '编程';
      if (/英语口语|口语/.test(text)) return '英语口语';
      if (/英语|英文/.test(text)) return '英语';
      if (/健身|跑步|减脂|增肌/.test(text)) return '健身';
      if (/吉他|尤克里里/.test(text)) return '吉他弹唱';
      if (/画画|素描|手绘|板绘/.test(text)) return '画画';
      if (/写作|写文章|文案/.test(text)) return '写作';
      if (/设计|figma|ui/.test(text)) return '设计';
      if (/数据分析/.test(text)) return '数据分析';

      // 冒号后面往往就是技能名："……：手冲咖啡"
      const colonMatch = what.match(/[：:]([^，。,!?！？\s]{1,12})/);
      if (colonMatch) return colonMatch[1].trim();

      // 尝试提取"学会XX / 学个XX / 学一下XX"中的XX
      const match = what.match(/学[会习]?(?:个|一下)?([^，。,!?！？\s]{1,12}?)(?:，|。|,|。|\s|$)/);
      if (match && match[1].trim()) return match[1].trim();

      // 去掉"我想/我想用30天"之类的前缀后截取
      const stripped = what.replace(/^我[想要]+/, '').replace(/用?\d+\s*[天日周月]*/, '').replace(/^[里内的]+/, '');
      return (stripped || what).slice(0, 12).replace(/[，。！？,.!?：:]/, '').trim();
    }

    /* ============================================================
       16) 学习计划生成：先分阶段，再排天/周任务
       ≤45 天 → 按天（Day N）；>45 天 → 按周（Week N，每周 5 个任务）
       任务全部来自领域知识库，保证"具体、能做、有结果"
       ============================================================ */
    function aiGeneratePlan(unitDefs, totalDays, minutesPerDay, verifyTask) {
      const plan = [];
      const defTime = minutesPerDay + '分钟';
      const dailyMode = totalDays <= 45;
      const totalWeight = unitDefs.reduce((s, u) => s + u.tasks.length, 0) || 1;
      const verifyTime = Math.max(minutesPerDay * 2, 120) + '分钟';

      if (dailyMode) {
        const learningDays = Math.max(unitDefs.length, totalDays - 1);
        // 按任务量分配天数，但每个单元最多"独立任务数 + 2"天，
        // 避免同一个练习机械重复太多次；多出/不足的部分按比例再平衡
        const alloc = [];
        let allocated = 0;
        unitDefs.forEach((u, idx) => {
          const unique = u.tasks.filter(t => !t.repeat).length || u.tasks.length;
          const raw = Math.max(1, Math.round(learningDays * u.tasks.length / totalWeight));
          alloc[idx] = Math.min(raw, unique + 2);
          allocated += alloc[idx];
        });
        if (allocated !== learningDays) {
          if (allocated > learningDays) {
            // 超了：按比例缩
            const scale = learningDays / allocated;
            let sum = 0;
            unitDefs.forEach((u, idx) => { alloc[idx] = Math.max(1, Math.round(alloc[idx] * scale)); sum += alloc[idx]; });
            allocated = sum;
          }
          // 补齐或继续削减
          let rest = learningDays - allocated, i = 0, guard = 0;
          while (rest !== 0 && guard < 2000) {
            const k = i % unitDefs.length;
            if (rest > 0) { alloc[k]++; rest--; }
            else if (alloc[k] > 1) { alloc[k]--; rest++; }
            i++; guard++;
          }
        }
        let day = 1;
        unitDefs.forEach((u, idx) => {
          const unitId = 'u' + idx;
          const counts = {};
          expandTasks(u.tasks, alloc[idx], defTime, 0, counts).forEach(t => {
            plan.push({ unitId, day, title: 'Day ' + day + '｜' + u.name, do: t.do, time: t.time, standard: t.standard, done: false });
            day++;
          });
        });
        plan.push({
          unitId: 'verify', day: day, title: 'Day ' + day + '｜🏆 验证任务',
          do: verifyTask, time: verifyTime,
          standard: '完成并记录为一段真实经历（记录后技能正式点亮）', done: false
        });
      } else {
        // 周模式：先分阶段，每周 5 个任务
        const weeks = Math.max(unitDefs.length + 1, Math.round(totalDays / 7));
        let week = 1;
        unitDefs.forEach((u, idx) => {
          const unitId = 'u' + idx;
          let unitWeeks = Math.max(1, Math.round((weeks - 1) * u.tasks.length / totalWeight));
          if (idx === unitDefs.length - 1) unitWeeks = Math.max(1, (weeks - 1) - (week - 1));
          let offset = 0;
          const counts = {}; // 跨周累计使用次数
          for (let w = 0; w < unitWeeks; w++) {
            expandTasks(u.tasks, 5, defTime, offset, counts).forEach(t => {
              plan.push({ unitId, day: week, title: 'Week ' + week + '｜' + u.name, do: t.do, time: t.time, standard: t.standard, done: false });
            });
            offset += 5;
            week++;
          }
        });
        plan.push({
          unitId: 'verify', day: week, title: 'Week ' + week + '｜🏆 验证任务',
          do: verifyTask, time: verifyTime,
          standard: '完成并记录为一段真实经历（记录后技能正式点亮）', done: false
        });
      }

      return plan;
    }

    // 从任务池展开 N 个任务：先消耗一遍全部任务，
    // 耗尽后循环整个池子（可重复练习的任务权重 ×2），并标注"第N次"
    function expandTasks(pool, count, defTime, offset, counts) {
      const out = [];
      if (!pool.length) return out;
      const firstLen = pool.length;
      const cyc = [];
      pool.forEach((t, i) => { cyc.push(i); if (t.repeat) cyc.push(i); });
      const c = counts || {};
      for (let j = 0; j < count; j++) {
        const slot = (offset || 0) + j;
        const idx = slot < firstLen ? slot : cyc[(slot - firstLen) % cyc.length];
        c[idx] = (c[idx] || 0) + 1;
        const t = pool[idx];
        const suffix = c[idx] > 1 ? '（第' + c[idx] + '次）' : '';
        out.push({ do: t.do + suffix, time: t.time || defTime, standard: t.standard });
      }
      return out;
    }

    /* ============================================================
       17) 学习计划弹窗：第一部分技能树 + 第二部分学习计划
       ============================================================ */
    function showLearnPlanModal(skillName) {
      const skill = getSkills().find(s => s.name === skillName);
      if (!skill || !skill.plan) return;

      document.getElementById('learnPlanTitle').textContent = '🪄 ' + skillName + ' · 技能树 & 学习计划';
      let html = '';

      if (skill.goalText) {
        html += `<div class="plan-goal">🎯 ${escapeHtml(skill.goalText)}</div>`;
      }

      // 保守假设标注
      if (skill.assumptions && skill.assumptions.length) {
        html += `<div class="plan-assumptions">
          <div class="pa-title">🧐 我先做了这些假设（都可以推翻）</div>
          ${skill.assumptions.map(a => `<div class="pa-item">· ${escapeHtml(a)}</div>`).join('')}
        </div>`;
      }

      // 第一部分：技能树
      const units = skill.breakdown || [];
      if (units.length) {
        html += `<div class="plan-section-title">🌱 第一部分 · 技能树</div>`;
        html += `<div class="plan-section-desc">我把这个目标拆成了这些核心能力——掌握它们就够了，不多学。完成经验任务后，对应能力会亮起来。</div>`;
        let curPhase = 0;
        units.forEach(u => {
          if (u.phase !== curPhase) {
            curPhase = u.phase;
            html += `<div class="plan-phase-header">${PHASE_NAMES[u.phase] || ''}</div>`;
          }
          html += `<div class="plan-tree-chip"><span class="ptc-dot ${u.status || 'want'}"></span>${escapeHtml(u.name)}</div>`;
        });
      }

      // 第二部分：学习计划
      html += `<div class="plan-section-title">📋 第二部分 · 学习计划</div>`;
      html += renderPlanBlock(skill, skillName);

      document.getElementById('learnPlanBody').innerHTML = html;
      document.getElementById('learnPlanModal').style.display = 'flex';
    }

    // 计划渲染（弹窗和技能详情共用）：阶段头 → 单元头 → 任务
    function renderPlanBlock(skill, skillName) {
      const units = skill.breakdown || [];
      const done = skill.plan.filter(t => t.done).length;
      let html = `<div class="plan-progress">进度：${done} / ${skill.plan.length}　做完一个勾一个</div>`;

      let curPhase = 0, curUnit = null;
      skill.plan.forEach((task, i) => {
        if (task.unitId === 'verify') {
          if (curUnit !== 'verify') {
            curUnit = 'verify';
            html += `<div class="plan-unit-header verify">🏆 验证任务（做完并记录经历，技能正式点亮）</div>`;
          }
        } else {
          const u = units.find(x => x.id === task.unitId);
          if (u && u.phase !== curPhase) {
            curPhase = u.phase;
            html += `<div class="plan-phase-header">${PHASE_NAMES[u.phase] || ''}</div>`;
          }
          if (task.unitId !== curUnit) {
            curUnit = task.unitId;
            html += `<div class="plan-unit-header">${u ? escapeHtml(u.name) : ''}</div>`;
          }
        }
        html += `<div class="plan-task-item ${task.done ? 'done' : ''}">
          <label class="plan-task-check">
            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="togglePlanTask('${escapeHtml(skillName)}',${i},this.checked)" />
            <span class="plan-task-title">${escapeHtml(task.title)}</span>
          </label>
          <div class="plan-task-detail">
            <div class="plan-task-do">${escapeHtml(task.do)}</div>
            <div class="plan-task-meta">⏱ ${escapeHtml(task.time)} · ✅ 完成：${escapeHtml(task.standard)}</div>
          </div>
        </div>`;
      });
      return html;
    }

    function closeLearnPlanModal() {
      document.getElementById('learnPlanModal').style.display = 'none';
    }

    document.getElementById('learnPlanModal').addEventListener('click', function(e) {
      if (e.target === this) closeLearnPlanModal();
    });

    /* ============================================================
       18) 学习计划勾选 + 技能状态联动
       ============================================================ */
    function togglePlanTask(skillName, taskIdx, checked) {
      const skills = getSkills();
      const skill = skills.find(s => s.name === skillName);
      if (!skill || !skill.plan) return;

      skill.plan[taskIdx].done = checked;

      // 计算每个单元的完成情况
      if (skill.breakdown) {
        skill.breakdown.forEach(unit => {
          const unitTasks = skill.plan.filter(t => t.unitId === unit.id);
          const unitDone = unitTasks.filter(t => t.done).length;
          if (unitTasks.length > 0 && unitDone === unitTasks.length) {
            unit.status = 'practiced';
          } else if (unitDone > 0) {
            unit.status = 'learning';
          } else {
            unit.status = 'want';
          }
        });
      }

      // 整体技能状态
      const allDone = skill.plan.filter(t => t.unitId !== 'verify').every(t => t.done);
      const verifyDone = skill.plan.some(t => t.unitId === 'verify' && t.done);

      if (allDone && verifyDone) {
        skill.status = 'verified';
      } else if (allDone) {
        skill.status = 'practiced';
      } else {
        const anyDone = skill.plan.some(t => t.done);
        skill.status = anyDone ? 'learning' : 'learning';
      }

      saveSkills(skills);
      renderSkillTree();

      // 如果验证任务完成，提示用户记录经历
      if (checked && skill.plan[taskIdx].unitId === 'verify') {
        setTimeout(async () => {
          if (await xConfirm('🎉 验证任务完成！要记录这段真实经历吗？\n\n记录后技能将被正式点亮。')) {
            // 自动打开经历记录弹窗
            openExpModal();
            document.getElementById('expForm').querySelector('input[name=expTitle]').value = '完成「' + skillName + '」验证任务';
            document.getElementById('expForm').querySelector('textarea[name=expDesc]').value = skill.verifyTask || '完成了' + skillName + '的学习验证。';
          }
        }, 300);
      }

      // 加经验
      if (checked) {
        addExp(5, '完成经验任务');
      }
    }

    /* ============================================================
       19) 页面流转
       ============================================================ */
    const ALL_PAGES = ['page-splash','page-onboard','page-chargen','page-home','page-pets','page-explog','page-skilltree'];

    function goPage(id) {
      ALL_PAGES.forEach(p => { document.getElementById(p).style.display = 'none'; });
      document.getElementById(id).style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // 离开 chargen 时停止轮询
      if (id !== 'page-chargen' && _chargenPoller) {
        clearInterval(_chargenPoller);
        _chargenPoller = null;
      }
      // 底部导航激活态
      document.querySelectorAll('.bn-tab').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-page') === id);
      });
      if (id === 'page-home') {
        fillHome(getProfile());
        document.getElementById('resetBtn').style.display = 'inline-flex';
      } else {
        document.getElementById('resetBtn').style.display = 'none';
      }
      if (id === 'page-explog') renderExpLog();
      if (id === 'page-pets') { try { renderPets(); } catch (e) { console.log(e); } }
      if (id === 'page-skilltree') {
        renderTreeTabs();
        renderSkillTree();
      }
    }

    // 删除云端满足条件的记录（同步缓存，防止下次拉取复活）
    async function dbDeleteWhere(dbId, pred, cacheArr) {
      const sdk = dbSdk();
      if (!sdk || !dbOnline()) return;
      try {
        const rows = await dbQueryAll(dbId);
        for (const r of rows) {
          if (pred(r)) {
            try { await sdkRun(() => sdk.deleteRecord({ databaseId: dbId, recordId: r._id })); } catch(e) {}
          }
        }
        if (cacheArr) {
          try {
            const fresh = await dbQueryAll(dbId);
            cacheArr.length = 0;
            cacheArr.push.apply(cacheArr, fresh);
          } catch(e) {}
        }
      } catch(e) {}
    }

    async function resetProfile() {
      if (!(await xConfirm('确定要重新开始吗？\n\n将清空本地与云端的所有数据（档案 / 经历 / 技能 / 任务 / 宠物），此操作不可恢复。'))) return;
      // 1) 清云端（先清，避免清完本地后云端数据复活）
      try { if (window.petClearCloud) await window.petClearCloud(); } catch(e) {}
      await dbDeleteWhere(DB_IDS.profile, () => true, null);
      await dbDeleteWhere(DB_IDS.experiences, () => true, _dbCache.experiences);
      await dbDeleteWhere(DB_IDS.skills, () => true, _dbCache.skills);
      await dbDeleteWhere(DB_IDS.tasks, () => true, _dbCache.tasks);
      _dbCache.profile = null;
      // 2) 清本地
      localStorage.removeItem(LS_PROFILE);
      localStorage.removeItem(LS_EXPERIENCES);
      localStorage.removeItem(LS_SKILLS);
      localStorage.removeItem(LS_PLAYER);
      localStorage.removeItem(LS_TREES);
      localStorage.removeItem(LS_CHAR_IMAGE);
      localStorage.removeItem(LS_CHAR_PROMPT);
      localStorage.removeItem(LS_CHAR_SKIPPED);
      localStorage.removeItem(LS_TODOS);
      try { localStorage.removeItem(LS_ARCHIVES); } catch(e) {}
      // 宠物模块数据
      ['earth_online_pets', 'earth_online_pet_trips', 'earth_online_pet_bag',
       'earth_online_pet_yard', 'earth_online_pet_game', 'earth_online_pet_adopt_pool',
       'earth_online_pet_demo1'].forEach(k => { try { localStorage.removeItem(k); } catch (e) { } });
      // 重置是用户主动清空：标记示例已看过，避免下次打开又自动播种示例宠物
      try { localStorage.setItem('earth_online_pet_demo1', '1'); } catch (e) { }
      goPage('page-onboard');
    }

    /* ============================================================
       19.5) 老李的世界Online 存档：读取全部真实数据 → 人物存档页
       数据关系：基本信息 + 经历库 + 已确认技能 + 进行中目标 → 存档
       所有内容来自真实数据，缺的显示"还没有"，绝不虚构
       ============================================================ */
    const LS_ARCHIVES = 'earth_online_archives';

    function getArchives() {
      try { return JSON.parse(localStorage.getItem(LS_ARCHIVES)) || []; } catch(e) { return []; }
    }
    function saveArchives(list) {
      try { localStorage.setItem(LS_ARCHIVES, JSON.stringify(list)); } catch(e) {}
    }

    function showArchive() {
      document.getElementById('archiveBody').innerHTML = archiveHtml();
      document.getElementById('archiveBody').scrollTop = 0;
      document.getElementById('archiveName').value = suggestArchiveName();
      const btn = document.getElementById('archiveSaveBtn');
      btn.textContent = '💾 保存这版存档';
      btn.onclick = function() { saveArchive(); };
      renderArchiveList();
      const modal = document.getElementById('archiveModal');
      modal.style.display = 'flex';
      // 让 hint 在滚动后自动隐藏
      const body = document.getElementById('archiveBody');
      body.onscroll = function() {
        const hint = document.getElementById('arcxScrollHint');
        if (hint) hint.style.display = body.scrollTop > 20 ? 'none' : 'block';
      };
    }

    function closeArchive() {
      document.getElementById('archiveModal').style.display = 'none';
    }

    /* ----- 快捷经验任务（听歌/喝酒/打怪/运动） ----- */
    const QUICK_ACTIONS = {
      song:  { title: '听一首歌',   exp: 5,  ico: '🎵' },
      drink: { title: '喝一场酒',   exp: 8,  ico: '🍺' },
      boss:  { title: '打怪',       exp: 10, ico: '⚔️' },
      sport: { title: '完成一次运动', exp: 10, ico: '🏃' }
    };
    function quickAction(kind) {
      const act = QUICK_ACTIONS[kind];
      if (!act) return;
      const todayStr = today();
      const todos = getTodayTodos();
      // 去重兼容两种标题形态（带/不带 emoji 前缀）
      const exists = todos.some(t =>
        t.date === todayStr && (t.title === act.title || t.title === act.ico + ' ' + act.title));
      if (exists) {
        // 今天已完成过：看板保持单条，但仍然加经验（一天可以听好几首歌/喝好几场酒）
        addExp(act.exp, act.title + ' · 再来一次');
        return;
      }
      todos.push({
        id: 'qa_' + kind + '_' + Date.now(),
        title: act.ico + ' ' + act.title,
        date: todayStr,
        done: true,
        doneAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      saveTodayTodos(todos); // 同步 eo_任务（类型=今日待办，已完成）
      addExp(act.exp, act.title);
      renderCalendar();
      renderTodayTasks();
    }

    // 生成存档长图 → 存到相册（Web Share API），不支持时下载 PNG
    async function saveArchiveToAlbum() {
      const btn = document.getElementById('saveToAlbumBtn');
      const src = document.getElementById('archiveBody');
      if (!src.innerHTML.trim()) { xAlert('还没有存档内容～'); return; }

      btn.disabled = true;
      btn.textContent = '⏳ 正在生成存档图…';

      // 离屏容器：固定 750px 宽度，渲染更稳定
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:750px;background:#f0f6fb;z-index:-1;';
      wrap.innerHTML = src.innerHTML;
      // 弹窗滚动区里可能带内联 overflow/height 限制，克隆后放开
      wrap.querySelectorAll('[style]').forEach(el => {
        el.style.maxHeight = '';
        el.style.overflow = 'visible';
      });
      document.body.appendChild(wrap);

      const temporaryUrls = [];
      try {
        // html2canvas cannot send the file cookie on its own cross-origin image
        // requests. Read authenticated bytes first and render same-origin blobs.
        await Promise.all(Array.from(wrap.querySelectorAll('img[src]')).map(async image => {
          if (!image.src.startsWith('https:')) return;
          const response = await fetch(image.src, { credentials: 'include' });
          if (!response.ok) throw new Error('无法读取存档图片');
          const url = URL.createObjectURL(await response.blob());
          temporaryUrls.push(url);
          image.src = url;
          await image.decode();
        }));
        const canvas = await html2canvas(wrap, {
          scale: 2,
          backgroundColor: '#f0f6fb',
          useCORS: true,
          logging: false
        });
        wrap.remove();

        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const fname = '老李的世界Online存档_' + today() + '.png';
        const file = new File([blob], fname, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          // 手机：唤起系统分享面板，可选「存入照片/保存图片」
          try {
            await navigator.share({ files: [file], title: '老李的世界Online 人物存档' });
          } catch(e) { /* 用户取消 */ }
        } else {
          // 桌面/不支持分享文件：直接下载 PNG
          const a = document.createElement('a');
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = fname;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 3000);
        }
      } catch(e) {
        wrap.remove();
        xAlert('生成存档图失败：' + (e.message || e));
      } finally {
        temporaryUrls.forEach(url => URL.revokeObjectURL(url));
        btn.disabled = false;
        btn.textContent = '📷 保存到相册（生成存档图）';
      }
    }
    document.getElementById('archiveModal').addEventListener('click', function(e) {
      if (e.target === this) closeArchive();
    });

    function suggestArchiveName() {
      const p = getProfile();
      return p.food ? '美食存档' : '';
    }

    // ---- 存档主体：横向三栏人物资料卡（参考游戏存档卡） ----
    function archiveHtml() {
      const profile = getProfile();
      const skills = getSkills();
      const exps = getExperiences();
      const trees = getTrees();
      const sortedExps = [...exps].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      const confirmed = skills.filter(s => s.status === 'lit');
      const learning = skills.filter(s => s.status !== 'lit' && s.plan && s.plan.length);
      const exploring = skills.filter(s => s.status === 'want' || (!s.plan && s.status !== 'lit'));

      const nick = profile.nickname || '匿名冒险者';
      const date = today();
      const uid = genId(nick + (profile.personality || ''));

      const profileKw = [
        ...parseList(profile.interests).slice(0, 3),
        ...parseList(profile.skills).slice(0, 2),
      ];
      const skillKw = confirmed.map(s => s.name).slice(0, 2);
      const allKw = [...new Set([...profileKw, ...skillKw])].slice(0, 6);

      const descKw = parseList(profile.interests)[0]
        || confirmed[0]?.name
        || parseList(profile.futureJobs)[0]
        || '';
      const desc = descKw
        ? '正在长成一个会「' + descKw + '」的人。'
        : '正在写下自己的人物档案。';

      const playerData = getPlayerData();
      const totalExp = playerData.exp || 0;
      const curLv = getLevel(totalExp);
      const nextLvExp = LEVEL_TABLE[curLv + 1] || LEVEL_TABLE[LEVEL_TABLE.length - 1];
      const lvBaseExp = LEVEL_TABLE[curLv] || 0;
      const lvProgress = nextLvExp > lvBaseExp ? Math.min(100, Math.round((totalExp - lvBaseExp) / (nextLvExp - lvBaseExp) * 100)) : 0;
      const expToNext = Math.max(0, nextLvExp - totalExp);
      const stageTitle = ['新手冒险者', '冒险学徒', '经验冒险者', '资深冒险者', '传奇冒险者'][Math.min(4, Math.floor(curLv / 6))] || '传奇冒险者';

      function skillLevel(s) {
        if (s.status === 'lit') {
          const expN = (s.sourceExpIds || []).length;
          return expN + 1;
        }
        if (Array.isArray(s.plan)) {
          const done = s.plan.filter(p => p.done).length;
          return Math.floor(done / 2) + 1;
        }
        return 1;
      }

      const skillByTree = [];
      const usedIds = new Set();
      trees.forEach(t => {
        const grp = confirmed.filter(s => (s.treeIds || []).includes(t.id));
        if (grp.length) {
          grp.forEach(s => usedIds.add(s.id));
          skillByTree.push({ name: t.name, icon: t.icon || '🌳', skills: grp });
        }
      });
      const orphan = confirmed.filter(s => !usedIds.has(s.id));
      if (orphan.length) {
        skillByTree.push({ name: '已点亮', icon: '✨', skills: orphan });
      }

      const catLevels = computeCategoryLevels().slice(0, 8);
      const timelineNodes = pickTimelineNodes([...sortedExps].reverse(), 6);

      const newSkills = confirmed
        .filter(s => s.confirmedAt)
        .sort((a, b) => (b.confirmedAt || '').localeCompare(a.confirmedAt || ''))
        .slice(0, 4);
      const newExps = sortedExps.slice(0, 4);
      const newGoals = learning.slice(0, 3);

      const futureKws = parseList(profile.futureJobs).slice(0, 4);
      const futureItems = [
        ...futureKws.slice(0, 3).map(t => ({ icon: '🎯', text: '更好地完成 ' + t + ' 方向' })),
        ...exploring.slice(0, 2).map(s => ({ icon: '🌱', text: '探索 ' + s.name })),
      ];

      let html = '';
      const skillIcons = 'decor/skill/icons/';
      const charImg = pickCharImage(profile);

      // 1. Hero（纯 CSS）
      html += '<div class="arcx-v3-hero">';
      html += '  <div class="arcx-hero-logo">';
      html += '    <span class="arcx-logo-text">老李的世界<span class="arcx-logo-accent">Online</span></span>';
      html += '    <span class="arcx-logo-tag">我的生活人物存档</span>';
      html += '  </div>';
      html += '  <div class="arcx-hero-tags"><span>真实经历</span><span>·</span><span>自己确认</span><span>·</span><span>长成你自己</span></div>';
      html += '  <div class="arcx-hero-actions">';
      html += '    <span class="arcx-hero-btn">🪐 进入世界</span>';
      html += '    <span class="arcx-hero-btn">🧭 探索世界</span>';
      html += '    <span class="arcx-hero-btn">⚔️ 升级自己</span>';
      html += '  </div>';
      html += '  <div class="arcx-hero-save"><div class="arcx-save-ver">v1.0</div><div class="arcx-save-date">SAVE ' + escapeHtml(date) + '</div></div>';
      html += '</div>';

      // 2. PLAYER（保留 card-bg 美术）
      html += '<div class="arcx-player">';
      html += '  <img class="arcx-player-bg" src="' + imageUrl('decor/arch/card-bg.png') + '" alt="" />';
      html += '  <div class="arcx-player-tag">PLAYER · 当前存档</div>';
      html += '  <div class="arcx-player-portrait">' + charPortraitHtml('', '角色') + '</div>';
      html += '  <div class="arcx-player-info">';
      html += '    <div class="apinfo-row"><span class="apinfo-k">玩家名称</span><span class="apinfo-v">' + escapeHtml(nick) + '</span></div>';
      html += '    <div class="apinfo-row"><span class="apinfo-k">性 格</span><span class="apinfo-v">' + escapeHtml(profile.personality || '—') + '</span></div>';
      html += '    <div class="apinfo-row"><span class="apinfo-k">喜 好</span><span class="apinfo-v">' + escapeHtml(profile.likes || '—') + '</span></div>';
      html += '    <div class="apinfo-row"><span class="apinfo-k">喜欢的食物</span><span class="apinfo-v">' + escapeHtml(profile.food || '—') + '</span></div>';
      html += '    <div class="apinfo-row"><span class="apinfo-k">存档日</span><span class="apinfo-v">' + escapeHtml(date) + '</span></div>';
      html += '    <div class="apinfo-row"><span class="apinfo-k">UID</span><span class="apinfo-v">' + escapeHtml(uid) + '</span></div>';
      html += '  </div>';
      html += '</div>';

      // 3. 我的关卡（纯 CSS）
      html += '<div class="arcx-stage-card">';
      html += '  <div class="arcx-stage-card-title">⭐ 我的关卡</div>';
      html += '  <div class="arcx-stage-card-body">';
      html += '    <div class="arcx-stage-lv-box">';
      html += '      <div class="arcx-stage-lv-num">' + curLv + '</div>';
      html += '      <div class="arcx-stage-lv-tag">Lv</div>';
      html += '    </div>';
      html += '    <div class="arcx-stage-info">';
      html += '      <div class="arcx-stage-title">' + escapeHtml(stageTitle) + '</div>';
      html += '      <div class="arcx-stage-bar"><div class="arcx-stage-fill" style="width:' + lvProgress + '%;"></div></div>';
      html += '      <div class="arcx-stage-stats">';
      html += '        <span>EXP ' + totalExp + '</span>';
      html += '        <span>距离 Lv.' + (curLv + 1) + ' 还差 ' + expToNext + '</span>';
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';
      html += '</div>';

      // 4. 关键词 + 一句话（纯 CSS）
      html += '<div class="arcx-tags-block">';
      html += '  <div class="arcx-card-title-row">🏷️ 人物关键词</div>';
      html += '  <div class="arcx-tag-chips">';
      if (allKw.length) {
        allKw.forEach(k => { html += '<span class="arcx-chip">' + escapeHtml(k) + '</span>'; });
      } else {
        html += '<span class="arcx-empty">— 还没有关键词 —</span>';
      }
      html += '  </div>';
      html += '</div>';
      html += '<div class="arcx-quote-block">';
      html += '  <div class="arcx-quote-text">「' + escapeHtml(desc) + '」</div>';
      html += '</div>';

      // 5. 当前能力（简洁卡片 + 技能图标 + Lv + 进度条）
      html += '<div class="arcx-sec arcx-sec-abilities">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">⚔️</span><span>当前能力 · 每个技能的等级</span><span class="arcx-tit-count">' + confirmed.length + '</span></div>';
      html += '  <div class="arcx-sec-body">';
      if (skillByTree.length) {
        skillByTree.forEach(grp => {
          html += '<div class="arcx-branch">';
          html += '  <div class="arcx-branch-head">';
          html += '    <span class="arcx-branch-ico">' + escapeHtml(grp.icon || '🌳') + '</span>';
          html += '    <span class="arcx-branch-name">' + escapeHtml(grp.name) + '</span>';
          html += '    <span class="arcx-branch-count">' + grp.skills.length + '</span>';
          html += '  </div>';
          html += '  <div class="arcx-branch-skills">';
          grp.skills.forEach(s => {
            const lv = skillLevel(s);
            const lvColor = lv >= 5 ? '#ff7a45' : lv >= 3 ? '#5fb4f2' : '#7cd992';
            const iconKey = (s.name || '').indexOf('摄影') >= 0 ? 'camera'
                          : (s.name || '').indexOf('模型') >= 0 || (s.name || '').indexOf('SketchUp') >= 0 || (s.name || '').indexOf('SU') >= 0 ? 'ruler'
                          : (s.name || '').indexOf('手绘') >= 0 ? 'paintbrush'
                          : (s.name || '').indexOf('原型') >= 0 || (s.name || '').indexOf('设计') >= 0 ? 'palette'
                          : (s.name || '').indexOf('代码') >= 0 || (s.name || '').indexOf('编程') >= 0 ? 'code'
                          : 'achievement-star';
            html += '<div class="arcx-ab-row">';
            html += '  <img class="arcx-ab-ico" src="' + imageUrl(skillIcons + iconKey + '.png') + '" alt="" />';
            html += '  <span class="arcx-ab-name">' + escapeHtml(s.name) + '</span>';
            html += '  <span class="arcx-ab-bar"><span class="arcx-ab-fill" style="width:' + Math.min(100, lv * 25) + '%; background:' + lvColor + ';"></span></span>';
            html += '  <span class="arcx-ab-lv" style="border-color:' + lvColor + '; color:' + lvColor + ';">Lv.' + lv + '</span>';
            html += '</div>';
          });
          html += '  </div>';
          html += '</div>';
        });
      } else {
        html += '<div class="arcx-empty">⌛ 还没有确认的技能 — 记一段经历 → 提炼技能 → 自己确认后亮起</div>';
      }
      html += '  </div>';
      html += '</div>';

      // 6. 学习进度（简洁卡片 + 进度条）
      html += '<div class="arcx-sec arcx-sec-learning">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🔍</span><span>学习技能进度</span><span class="arcx-tit-sub">' + learning.length + ' 项进行中</span></div>';
      html += '  <div class="arcx-sec-body">';
      if (learning.length) {
        learning.slice(0, 3).forEach((s, idx) => {
          const done = s.plan.filter(p => p.done).length;
          const total = s.plan.length;
          const pct = total ? Math.round(done / total * 100) : 0;
          const iconKey = (s.name || '').indexOf('摄影') >= 0 ? 'camera'
                         : (s.name || '').indexOf('SU') >= 0 || (s.name || '').indexOf('模型') >= 0 ? 'ruler'
                         : 'book';
          html += '<div class="arcx-stage-row">';
          html += '  <span class="arcx-stage-tag">STAGE ' + (idx + 1) + '</span>';
          html += '  <img class="arcx-stage-ico" src="' + imageUrl(skillIcons + iconKey + '.png') + '" alt="" />';
          html += '  <span class="arcx-stage-name">' + escapeHtml(s.name) + '</span>';
          html += '  <span class="arcx-stage-bar"><span class="arcx-stage-fill" style="width:' + pct + '%;"></span></span>';
          html += '  <span class="arcx-stage-pct">' + done + '/' + total + '</span>';
          html += '</div>';
        });
      } else {
        html += '<div class="arcx-empty">🪄 还没有学习目标 — 在技能树里开一条「想学」就有了</div>';
      }
      html += '  </div>';
      html += '</div>';

      // 7. 分类技能等级榜（简洁网格）
      if (catLevels.length) {
        html += '<div class="arcx-sec arcx-sec-cat">';
        html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🎯</span><span>分类技能等级 · 自动识别</span><span class="arcx-tit-sub">从所有经历和任务累积</span></div>';
        html += '  <div class="arcx-sec-body">';
        html += '    <div class="arcx-cat-grid">';
        catLevels.forEach(c => {
          html += '<div class="arcx-cat-cell">';
          html += '  <img class="arcx-cat-ico" src="' + imageUrl(skillIcons + c.icon + '.png') + '" alt="" />';
          html += '  <span class="arcx-cat-name">' + escapeHtml(c.name) + '</span>';
          html += '  <span class="arcx-cat-lv">Lv.' + c.level + '</span>';
          html += '</div>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
      }

      // 8. 重要经历时间线（纯 CSS：圆点 + 连接线）
      html += '<div class="arcx-sec arcx-sec-timeline">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🎓</span><span>重要经历时间线</span><span class="arcx-tit-sub">真实记录 · 关键时刻</span></div>';
      html += '  <div class="arcx-sec-body">';
      if (timelineNodes.length) {
        html += '<div class="arcx-tl-list">';
        timelineNodes.forEach((n, i) => {
          html += '<div class="arcx-tl-item' + (i === timelineNodes.length - 1 ? ' latest' : '') + '">';
          html += '  <div class="arcx-tl-rail"><span class="arcx-tl-dot"></span></div>';
          html += '  <div class="arcx-tl-content">';
          html += '    <div class="arcx-tl-date">' + escapeHtml(formatDateShort(n.date)) + '</div>';
          html += '    <div class="arcx-tl-title">' + escapeHtml(n.title) + '</div>';
          html += '  </div>';
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += '<div class="arcx-empty">还没有记录过经历 — 你做的第一件事会出现在这里</div>';
      }
      html += '  </div>';
      html += '</div>';

      // 9. 本版本新增（三栏简洁卡）
      html += '<div class="arcx-sec arcx-sec-whatsnew">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🆕</span><span>本版本新增</span><span class="arcx-tit-sub">这一版和上一版相比</span></div>';
      html += '  <div class="arcx-sec-body">';
      html += '  <div class="arcx-wn-grid">';
      // 新增技能
      html += '<div class="arcx-wn-col">';
      html += '  <div class="arcx-wn-col-title">⭐ 新增技能</div>';
      html += '  <div class="arcx-wn-items">';
      if (newSkills.length) {
        newSkills.forEach(s => { html += '<div class="arcx-wn-item skill">⭐ ' + escapeHtml(s.name) + '</div>'; });
      } else {
        html += '<div class="arcx-wn-empty">— 暂无 —</div>';
      }
      html += '  </div>';
      html += '</div>';
      // 新增经历
      html += '<div class="arcx-wn-col">';
      html += '  <div class="arcx-wn-col-title">📖 新增经历</div>';
      html += '  <div class="arcx-wn-items">';
      if (newExps.length) {
        newExps.forEach(e => { html += '<div class="arcx-wn-item exp">📖 ' + escapeHtml(e.title) + '</div>'; });
      } else {
        html += '<div class="arcx-wn-empty">— 暂无 —</div>';
      }
      html += '  </div>';
      html += '</div>';
      // 新方向
      html += '<div class="arcx-wn-col">';
      html += '  <div class="arcx-wn-col-title">🧭 新方向</div>';
      html += '  <div class="arcx-wn-items">';
      if (newGoals.length) {
        newGoals.forEach(s => { html += '<div class="arcx-wn-item goal">🧭 ' + escapeHtml(s.name) + '</div>'; });
      } else {
        html += '<div class="arcx-wn-empty">— 暂无 —</div>';
      }
      html += '  </div>';
      html += '</div>';
      html += '  </div>';
      html += '  </div>';
      html += '</div>';

      // 10. 未来方向
      html += '<div class="arcx-sec arcx-sec-future">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🌱</span><span>未来方向 · 我想做什么</span></div>';
      html += '  <div class="arcx-sec-body">';
      if (futureItems.length) {
        futureItems.forEach(f => {
          html += '<div class="arcx-future-item"><span class="arcx-future-ico">' + f.icon + '</span><span>' + escapeHtml(f.text) + '</span></div>';
        });
      } else {
        html += '<div class="arcx-empty">填一下「想做的方向」就会出现在这里</div>';
      }
      html += '  </div>';
      html += '</div>';

      // 11. NEXT LEVEL（简洁）
      html += '<div class="arcx-sec arcx-sec-nextlevel">';
      html += '  <div class="arcx-sec-title"><span class="arcx-tit-icon">🏔️</span><span>NEXT LEVEL</span></div>';
      html += '  <div class="arcx-sec-body arcx-nl-body">';
      html += '    <div class="arcx-nl-line">「仍在探索中… 但我相信, 一切都会有意思」</div>';
      html += '    <div class="arcx-nl-sub">' + (learning.length ? '下一次升级：' + escapeHtml(learning[0].name) : '解锁更多技能之后，开启下一段旅程') + '</div>';
      html += '  </div>';
      html += '</div>';

      // 12. Footer（纯 CSS）
      html += '<div class="arcx-footer">';
      html += '  <div class="arcx-footer-brand">🌍 老李的世界Online · 生活版</div>';
      html += '  <div class="arcx-footer-tagline">探索世界, 也探索自己</div>';
      html += '  <div class="arcx-footer-meta">存档号 ' + escapeHtml(uid) + ' · ' + escapeHtml(date) + '</div>';
      html += '</div>';

      return html;
    }

    // ---- 时间线挑选：均匀分布到 N 个节点 ----
    function pickTimelineNodes(sortedExps, maxN) {
      if (!sortedExps.length) return [];
      if (sortedExps.length <= maxN) return sortedExps;
      const step = (sortedExps.length - 1) / (maxN - 1);
      const picked = [];
      for (let i = 0; i < maxN; i++) {
        const idx = Math.round(i * step);
        if (!picked.includes(sortedExps[idx])) picked.push(sortedExps[idx]);
      }
      return picked;
    }

    function formatDateShort(d) {
      if (!d) return '—';
      // 把 2024-11-20 变成 2024.11
      const parts = d.split('-');
      if (parts.length >= 2) return parts[0] + '.' + parts[1];
      return d;
    }

    // ---- 保存 / 查看 / 删除存档 ----
    async function saveArchive() {
      const name = document.getElementById('archiveName').value.trim() || (today() + ' 存档');

      // 存档保留当前页面结构与预设图片引用。
      const html = assetReferences(archiveHtml());

      const list = getArchives();
      list.unshift({
        id: Date.now(),
        name: name,
        createdAt: today(),
        html: html
      });
      saveArchives(list);
      renderArchiveList();
      document.getElementById('archiveName').value = '';
      addExp(20, '保存了一版存档');
    }

    function viewArchive(id) {
      const a = getArchives().find(x => x.id === id);
      if (!a) return;
      document.getElementById('archiveBody').innerHTML =
        `<div class="arc-history-banner">📦 ${escapeHtml(a.name)} · 保存于 ${a.createdAt} —— 这是你当时的样子</div>` + resolveReferences(a.html);
      const btn = document.getElementById('archiveSaveBtn');
      btn.textContent = '↩ 回到当前存档';
      btn.onclick = function() { showArchive(); };
      document.getElementById('archiveModal').style.display = 'flex';
    }

    async function deleteArchive(id) {
      if (!(await xConfirm('确定删除这版存档吗？删除后无法恢复。'))) return;
      saveArchives(getArchives().filter(a => a.id !== id));
      renderArchiveList();
    }

    function renderArchiveList() {
      const list = getArchives();
      const el = document.getElementById('archiveList');
      if (!list.length) {
        el.innerHTML = `<div style="font-size:11px; color:var(--c-text-soft);">还没有保存过存档。学期结束时存一版，以后回看会很有意思。</div>`;
        return;
      }
      el.innerHTML = list.map(a => `
        <div class="arc-list-item">
          <span class="arc-list-name">📦 ${escapeHtml(a.name)}</span>
          <span class="arc-list-date">${escapeHtml(a.createdAt)}</span>
          <button type="button" class="arc-list-btn" onclick="viewArchive(${a.id})">查看</button>
          <button type="button" class="arc-list-btn del" onclick="deleteArchive(${a.id})">删除</button>
        </div>`).join('');
    }

    /* ============================================================
       20) AI角色图片生成：提示词构建 + 生成流程
       ============================================================ */

    // 构建 AI 图片提示词：只把适合视觉表达的内容转成人物元素
    function buildCharPrompt(profile) {
      const baseStyle = 'Q-version chibi pixel art full-body game character, modern college student casual fashion, cute proportions not overly childish, front-facing or slight side pose, clean image, light Japanese RPG character sprite aesthetic, simple clean background, clear character outline suitable for small avatar display, 1:1 square composition';

      const parts = [baseStyle];

      // 1) 一句话描述自己 → 直接作为角色个性描述（最强差异化因子）
      if (profile.oneLineDesc) {
        // 将中文描述简要翻译为英文视觉描述
        const desc = profile.oneLineDesc;
        parts.push('character personality: ' + desc);
      }

      // 2) 兴趣关键词 → 精确匹配已知道具 + 未匹配的直接传递
      const interests = parseList(profile.interests);
      const interestProps = [
        [/摄影|相机|拍照|拍人像/, 'holding a camera'],
        [/音乐|听歌/, 'wearing headphones around neck'],
        [/吉他|尤克里里/, 'holding a guitar'],
        [/画画|素描|插画|手绘|板绘|绘画/, 'holding a sketchbook and pencil'],
        [/编程|代码|开发/, 'holding a laptop'],
        [/读书|阅读|看书/, 'holding a book'],
        [/做饭|烹饪|烧菜|下厨/, 'holding a cooking spatula'],
        [/健身|运动|锻炼/, 'wearing sportswear with a towel around neck'],
        [/跑步|慢跑/, 'wearing running shoes and sportswear'],
        [/设计|ps|figma/, 'holding a drawing tablet'],
        [/写作|写文章|写故事|文案/, 'holding a pen and notebook'],
        [/视频|剪辑|剪映|vlog/, 'holding a video camera'],
        [/旅行|旅游|city\s*walk/, 'wearing a small backpack'],
        [/打球|篮球/, 'holding a basketball'],
        [/羽毛球/, 'holding a badminton racket'],
        [/游泳/, 'with swim goggles on head'],
        [/滑板/, 'standing on a skateboard'],
        [/唱歌|歌唱/, 'holding a microphone'],
        [/跳舞|舞蹈/, 'in a dynamic dance pose'],
        [/电影|看电影/, 'holding a popcorn bucket'],
        [/游戏|打游戏|电竞/, 'holding a game controller'],
        [/咖啡|手冲/, 'holding a coffee cup'],
        [/骑行|骑车/, 'wearing a bicycle helmet'],
      ];

      const visualProps = [];
      const unmatchedInterests = [];
      interests.forEach(interest => {
        const lower = interest.toLowerCase();
        let matched = false;
        for (const [pattern, prop] of interestProps) {
          if (pattern.test(lower)) {
            if (!visualProps.includes(prop)) visualProps.push(prop);
            matched = true;
            break;
          }
        }
        if (!matched) unmatchedInterests.push(interest);
      });

      // 最多2个视觉道具，保持画面干净
      if (visualProps.length > 0) {
        parts.push(visualProps.slice(0, 2).join(', '));
      }
      // 未匹配的兴趣也传给模型，让它自行解读
      if (unmatchedInterests.length > 0) {
        parts.push('likes ' + unmatchedInterests.join(', '));
      }

      // 3) 职业关键词 → 同理
      const careers = parseList(profile.futureJobs);
      const careerProps = [
        [/产品经理|产品/, 'holding a tablet with UI mockup'],
        [/设计师/, 'holding a stylus'],
        [/老师|教师|教育/, 'holding a book and pointer'],
        [/医生|护士/, 'wearing a stethoscope'],
        [/工程师|程序员|开发/, 'holding a laptop'],
        [/律师|法务/, 'holding a briefcase'],
        [/记者|编辑/, 'holding a microphone and notepad'],
        [/摄影师/, 'holding a professional camera'],
        [/创作者|博主|自媒体/, 'holding a phone for vlogging'],
      ];

      const unmatchedCareers = [];
      careers.forEach(career => {
        const lower = career.toLowerCase();
        let matched = false;
        for (const [pattern, prop] of careerProps) {
          if (pattern.test(lower)) {
            if (!visualProps.includes(prop) && visualProps.length < 2) {
              visualProps.push(prop);
              parts.push(prop);
            }
            matched = true;
            break;
          }
        }
        if (!matched) unmatchedCareers.push(career);
      });
      if (unmatchedCareers.length > 0) {
        parts.push('aspiring ' + unmatchedCareers.join(', '));
      }

      return parts.join(', ');
    }

    // 当前等待生成的提示词
    let _pendingCharPrompt = '';
    // 角色图片轮询检测定时器
    let _chargenPoller = null;

    // 预设形象列表（运行时通过 XHR 探测，更稳；失败时回落到硬编码清单）
    const PRESET_BGS   = ['background_01','background_02','background_03','background_04','background_05','background_06','background_07','background_08','background_09','background_10'];
    const PRESET_CHARS = ['character_01','character_02','character_03','character_04','character_05','character_08','character_09','character_10','character_12','character_14','character_15','character_16','character_17','character_18','character_19','character_22'];

    let _pickBg = null;   // 'background_03'
    let _pickChar = null; // 'character_08'

    // 显示角色选择页（预设背景 + 预设角色）
    function showCharGenPage() {
      _pickBg = null;
      _pickChar = null;
      renderBgGrid();
      renderCharGrid();
      updatePreview();
      goPage('page-chargen');
    }

    function renderBgGrid() {
      const grid = document.getElementById('bgGrid');
      grid.innerHTML = PRESET_BGS.map(name => `
        <button type="button" class="pick-tile ${_pickBg === name ? 'selected' : ''}" data-name="${name}" onclick="selectBg('${name}')">
          <img src="${imageUrl('preset/bg/' + name + '.png')}" alt="${name}" loading="lazy" />
        </button>`).join('');
    }
    function renderCharGrid() {
      const grid = document.getElementById('charGrid');
      grid.innerHTML = PRESET_CHARS.map(name => `
        <button type="button" class="pick-tile ${_pickChar === name ? 'selected' : ''}" data-name="${name}" onclick="selectChar('${name}')">
          <img src="${imageUrl('preset/char/' + name + '.png')}" alt="${name}" loading="lazy" />
        </button>`).join('');
    }
    function selectBg(name) {
      _pickBg = name;
      renderBgGrid();
      updatePreview();
    }
    function selectChar(name) {
      _pickChar = name;
      renderCharGrid();
      updatePreview();
    }
    function updatePreview() {
      const bg = document.getElementById('bgPreview');
      const ch = document.getElementById('charPreview');
      const empty = document.getElementById('previewEmpty');
      if (_pickBg) { bg.src = imageUrl('preset/bg/' + _pickBg + '.png'); bg.style.display = 'block'; }
      else { bg.removeAttribute('src'); bg.style.display = 'none'; }
      if (_pickChar) { ch.src = imageUrl('preset/char/' + _pickChar + '.png'); ch.style.display = 'block'; }
      else { ch.removeAttribute('src'); ch.style.display = 'none'; }
      empty.style.display = (_pickBg && _pickChar) ? 'none' : 'flex';
    }

    // 确认：优先 canvas 合成背景+角色 → base64；沙箱画布污染时降级为组合存储（分层渲染）
    function confirmPresetChar() {
      if (!_pickBg || !_pickChar) {
        xAlert('请先选一个背景和一个角色～');
        return;
      }
      // 保存预设的名称，展示时以两层图片还原，不将合成位图写入存档。
      saveCharCombo({ bg: _pickBg, char: _pickChar });
      saveCharImage('./assets/assets/img/preset/char/' + _pickChar + '.png');
      try { localStorage.setItem(LS_CHAR_SKIPPED, '0'); } catch(e) {}
      fillHome(getProfile());
      goPage('page-home');
      addExp(30, '创建角色');
    }

    // 修改描述 → 回到表单，预填数据
    function modifyCharDesc() {
      const profile = getProfile();
      const form = document.getElementById('onboardForm');
      form.querySelector('input[name=nickname]').value = profile.nickname || '';
      form.querySelector('input[name=personality]').value = profile.personality || '';
      form.querySelector('input[name=likes]').value = profile.likes || '';
      form.querySelector('input[name=food]').value = profile.food || '';
      form.querySelector('input[name=oneLineDesc]').value = profile.oneLineDesc || '';
      form.querySelector('textarea[name=interestsKw]').value = profile.interests || '';
      form.querySelector('textarea[name=careerKw]').value = profile.futureJobs || '';
      goPage('page-onboard');
    }

    /* ============================================================
       20.5) 演示数据（跳过路径）
       ============================================================ */
    function loadDemoData() {
      // 清空旧数据
      [LS_PROFILE, LS_EXPERIENCES, LS_SKILLS, LS_PLAYER, LS_TREES, LS_CHAR_IMAGE, LS_CHAR_PROMPT, LS_CHAR_SKIPPED, LS_TODOS].forEach(k => {
        try { localStorage.removeItem(k); } catch(e) {}
      });

      const t = new Date();
      const d = (offsetDays) => {
        const dd = new Date(t);
        dd.setDate(dd.getDate() - offsetDays);
        return dd.toISOString().split('T')[0];
      };
      const todayStr = d(0);

      // ---- 资料 ----
      const profile = {
        nickname: '小李',
        personality: '慢热但靠谱',
        likes: '看电影,打网球,折腾咖啡',
        food: '火锅',
        oneLineDesc: '一个想把日子过成游戏、认真攒经验的生活玩家',
        interests: '电影,网球,做饭,健身,city walk',
        futureJobs: '自由职业者',
        gender: '', skills: '', experiences: '', futureSkills: ''
      };
      saveProfile(profile);

      // ---- 经历（含今天，让日历/今日有展示）----
      const exps = [
        { date: todayStr, title: '第一次做出不塌陷的戚风蛋糕', rawDesc: '失败三次之后终于成功，蛋白打发到硬性发泡是关键，全家当下午茶吃光了。' },
        { date: d(2),  title: '看了《肖申克的救赎》重映', rawDesc: '大银幕重看经典，自由的主题依然震撼，散场后在影院门口坐了很久。' },
        { date: d(5),  title: '网球课第一次能连续对拉10拍', rawDesc: '教练夸正手动作定型了，虽然跑位还很烂，但已经能打出像样的回合。' },
        { date: d(11), title: '完成了一次10公里夜跑', rawDesc: '沿着江边跑完10公里，配速6分半，跑完喝了冰美式，感觉能打通任督二脉。' },
        { date: d(18), title: '给朋友做了一整桌火锅接风', rawDesc: '自己炒的锅底，备了三天，朋友说比外面的香，成就感爆棚。' },
        { date: d(26), title: '开始学视频剪辑', rawDesc: '想把自己拍的生活素材剪成vlog，先学了剪辑软件的时间线和转场。' },
        { date: d(40), title: '周末骑行去了邻市古镇', rawDesc: '单程60公里，骑了4个小时，在古镇吃了一碗牛肉面，值了。' },
        { date: d(60), title: '加入了社区羽毛球局', rawDesc: '每周三晚上固定打两小时，认识了几个同样爱运动的邻居。' },
      ].map((e, i) => ({
        id: 900000 + i,
        date: e.date,
        title: e.title,
        rawDesc: e.rawDesc,
        structured: { title: e.title, happened: e.date, whatIDid: e.rawDesc, result: '完成了', feeling: '很有成就感' },
        suggestedSkills: [],
        confirmedSkills: [],
        skillConfirmed: true
      }));
      saveExperiences(exps);

      // ---- 技能：2个已确认 + 3个进行中 ----
      const skills = [
        { name: '做饭', sourceExpIds: [900002], confirmedAt: d(11), status: 'lit', treeIds: [] },
        { name: '跑步', sourceExpIds: [900003], confirmedAt: d(11), status: 'lit', treeIds: [] },
      ];

      // 进行中 1：视频剪辑
      const sketchupPlan = [
        { unitId: 'u0', day: 1, title: 'Day 1｜认识时间线', do: '熟悉剪辑软件界面 / 素材导入 / 时间线剪切', time: '60分钟', standard: '能剪出一段10秒的素材拼接', done: true },
        { unitId: 'u0', day: 2, title: 'Day 2｜转场与节奏', do: '学常用转场和卡点剪辑，剪一段旅行素材', time: '60分钟', standard: '一段30秒卡点视频', done: true },
        { unitId: 'u0', day: 3, title: 'Day 3｜字幕与调色', do: '加字幕、做基础调色', time: '90分钟', standard: '成片有字幕且色调统一', done: true },
        { unitId: 'u1', day: 4, title: 'Day 4｜音频处理', do: '学配乐音量包络和音效点缀', time: '60分钟', standard: '成片声音层次分明', done: false },
        { unitId: 'u1', day: 5, title: 'Day 5｜完整vlog', do: '把自己一周的素材剪成一支完整vlog', time: '120分钟', standard: '3分钟以上的完整成片', done: false },
        { unitId: 'u2', day: 6, title: 'Day 6｜包装与封面', do: '做片头片尾和封面图', time: '90分钟', standard: '成片有完整包装', done: false },
        { unitId: 'verify', day: 7, title: 'Day 7｜🏆 验证任务', do: '发布一支完整vlog并收集朋友反馈', time: '120分钟', standard: '发布并记录为一段真实经历', done: false }
      ];
      skills.push({
        name: '视频剪辑', status: 'learning', sourceExpIds: [], confirmedAt: null,
        goalText: '一个月内能独立剪出一支完整的生活vlog', goalDuration: '1个月', goalTreeId: null,
        assumptions: [], breakdown: [
          { id: 'u0', name: '基础操作', phase: 1, status: 'done', sourceExpId: null },
          { id: 'u1', name: '成片能力', phase: 2, status: 'doing', sourceExpId: null },
          { id: 'u2', name: '完整作品', phase: 3, status: 'want', sourceExpId: null }
        ],
        plan: sketchupPlan,
        verifyTask: '发布一支完整vlog并收集朋友反馈', treeIds: []
      });

      // 进行中 2：网球
      const archPhotoPlan = [
        { unitId: 'u0', day: 1, title: 'Day 1｜正手定型', do: '教练带练正手挥拍与步伐', time: '90分钟', standard: '正手连续对拉10拍', done: true },
        { unitId: 'u0', day: 2, title: 'Day 2｜反手入门', do: '学双手反手基本动作', time: '90分钟', standard: '反手能稳定回球5拍', done: true },
        { unitId: 'u0', day: 3, title: 'Day 3｜发球基础', do: '学上手发球的抛球与击球点', time: '90分钟', standard: '10个发球进5个', done: true },
        { unitId: 'u1', day: 4, title: 'Day 4｜网前截击', do: '学网前截击与放小球', time: '90分钟', standard: '截击成功率过半', done: false },
        { unitId: 'u1', day: 5, title: 'Day 5｜实战对局', do: '和球友打一局6分制练习赛', time: '120分钟', standard: '完成一整局', done: false },
        { unitId: 'u2', day: 6, title: 'Day 6｜战术意识', do: '学底线相持与变线战术', time: '90分钟', standard: '能说出3种战术并应用', done: false },
        { unitId: 'verify', day: 7, title: 'Day 7｜🏆 验证任务', do: '参加一场完整的练习赛并复盘', time: '120分钟', standard: '完成比赛并记录为一段真实经历', done: false }
      ];
      skills.push({
        name: '网球', status: 'learning', sourceExpIds: [], confirmedAt: null,
        goalText: '两个月内能和球友完整对局不虚', goalDuration: '2个月', goalTreeId: null,
        assumptions: [], breakdown: [
          { id: 'u0', name: '基础动作', phase: 1, status: 'done', sourceExpId: null },
          { id: 'u1', name: '实战练习', phase: 2, status: 'doing', sourceExpId: null },
          { id: 'u2', name: '战术成型', phase: 3, status: 'want', sourceExpId: null }
        ],
        plan: archPhotoPlan,
        verifyTask: '参加一场完整的练习赛并复盘', treeIds: []
      });

      // 进行中 3：电影鉴赏
      const theoryPlan = [
        { unitId: 'u0', day: 1, title: 'Week 1｜看懂镜头语言', do: '学景别/运镜/轴线，看《公民凯恩》并做拉片笔记', time: '4小时', standard: '能说出10个镜头的作用', done: true },
        { unitId: 'u0', day: 2, title: 'Week 2｜叙事结构', do: '学三幕结构，看《拯救大猫》级别的经典剧本分析', time: '4小时', standard: '能拆解一部片的幕结构', done: true },
        { unitId: 'u1', day: 3, title: 'Week 3｜作者电影', do: '看韦斯·安德森与小津安二郎各一部，对比风格', time: '5小时', standard: '写出两位导演的风格关键词', done: true },
        { unitId: 'u1', day: 4, title: 'Week 4｜类型片入门', do: '看一部黑色电影+一部新好莱坞，理解类型演变', time: '5小时', standard: '整理类型片时间线', done: false },
        { unitId: 'u2', day: 5, title: 'Week 5｜影评写作', do: '为最近看的电影写一篇500字短评', time: '3小时', standard: '完成一篇有观点的短评', done: false },
        { unitId: 'verify', day: 6, title: 'Week 6｜🏆 验证任务', do: '做一份片单+每部一句话推荐语，分享给朋友', time: '5小时', standard: '完成并记录为一段真实经历', done: false }
      ];
      skills.push({
        name: '电影鉴赏', status: 'learning', sourceExpIds: [], confirmedAt: null,
        goalText: '六周内建立自己的电影审美，能写出有观点的影评', goalDuration: '6周', goalTreeId: null,
        assumptions: [], breakdown: [
          { id: 'u0', name: '镜头与叙事', phase: 1, status: 'done', sourceExpId: null },
          { id: 'u1', name: '导演与类型', phase: 2, status: 'doing', sourceExpId: null },
          { id: 'u2', name: '表达观点', phase: 3, status: 'want', sourceExpId: null }
        ],
        plan: theoryPlan,
        verifyTask: '做一份片单并分享给朋友', treeIds: []
      });
      saveSkills(skills);

      // ---- 等级：Lv.12 ----
      const exp = LEVEL_TABLE[12] + 80;
      savePlayerData({ exp: exp });

      // ---- 今日自建 todo ----
      saveTodayTodos([
        { id: 'demo1', title: '整理视频剪辑的快捷键清单', date: todayStr, done: false, createdAt: new Date().toISOString() },
        { id: 'demo2', title: '给昨天拍的江边夜跑照片调色', date: todayStr, done: true, doneAt: new Date().toISOString(), createdAt: new Date().toISOString() },
        { id: 'demo3', title: '看《电影史》第3章', date: todayStr, done: false, createdAt: new Date().toISOString() }
      ]);

      // 兜底：即使图片合成失败，刷新后也直接进首页（走预设PNG兜底）
      try { localStorage.setItem(LS_CHAR_SKIPPED, '1'); } catch(e) {}

      // 示例使用预设图片路径，不把位图编码进浏览器存储。
      saveCharImage('./assets/assets/img/ui/demo-char.png');
      clearCharCombo();
      fillHome(getProfile());
      goPage('page-home');
    }

    /* ============================================================
       21) 启动表单
       ============================================================ */
    document.getElementById('onboardForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const fd = new FormData(this);
      const profile = {
        nickname:   (fd.get('nickname')   || '').trim(),
        personality:(fd.get('personality')|| '').trim(),
        likes:      (fd.get('likes')      || '').trim(),
        food:       (fd.get('food')       || '').trim(),
        oneLineDesc:(fd.get('oneLineDesc')|| '').trim(),
        interests:  (fd.get('interestsKw')|| '').trim(),
        futureJobs: (fd.get('careerKw')   || '').trim(),
        // 保留旧字段兼容（不再从表单填充）
        gender: '', skills: '', experiences: '', futureSkills: ''
      };
      if (!profile.nickname) { xAlert('给自己起个昵称再开始吧～'); return; }
      saveProfile(profile);

      // 清除旧的角色图片和提示词，确保重新生成
      try {
        localStorage.removeItem(LS_CHAR_IMAGE);
        localStorage.removeItem(LS_CHAR_PROMPT);
        localStorage.removeItem(LS_CHAR_SKIPPED);
      } catch(e) {}

      // 进入角色生成页
      showCharGenPage();
    });

    document.getElementById('resetBtn').onclick = resetProfile;

    /* ============================================================
       21) 初始化
       ============================================================ */
    (async function init() {
      // 1) 先本地渲染：有本地档案立刻进首页（不白屏等待云端）
      const saved = getProfile();
      if (saved.nickname) {
        enterHome(saved);
      } else {
        goPage('page-splash');
      }
      updateCloudBadge();

      // 2) 后台拉云端：拉到后以云端为准刷新页面（双向同步）
      (async function pullInBg() {
        await waitSdk();
        const ok = await dbPullAll();
        // 兼容旧数据：给旧技能添加 status 和 treeIds
        const skills = getSkills();
        let updated = false;
        skills.forEach(s => {
          if (!s.status) { s.status = 'lit'; updated = true; }
          if (!s.treeIds) { s.treeIds = []; updated = true; }
        });
        if (updated) saveSkills(skills);

        const cloudProf = getProfile();
        // 云端有档案而本地没有 → 直接恢复进入首页
        if (!saved.nickname && cloudProf.nickname) {
          enterHome(cloudProf);
          showExpToast(0, '已从云端恢复：' + cloudProf.nickname);
        } else if (saved.nickname) {
          // 拉取完成后统一刷新首页（看板/日历/经验条，合并结果立即可见）
          try { fillHome(cloudProf); } catch(e) {}
        }
        updateCloudBadge();
        try { if (typeof window.petInit === 'function') window.petInit(); } catch(e) {}
      })();
    })();

    function enterApp() {
      // 从启动页进入：到建立档案页
      goPage('page-onboard');
    }

    // 等 SDK 就绪（等真实实现注入；平台注入一般在 1 秒内，超时按未连接处理）
    function waitSdk() {
      if (window.__DBQ && window.__DBQ.ready) return window.__DBQ.ready(6000);
      return Promise.resolve(!!dbSdk());
    }

    /* 进入首页的统一入口：
       老账号不再被「没有形象图」卡住——没有形象就自动给一个默认形象，之后可随时更换 */
    function enterHome(profile) {
      const p = profile || getProfile();
      if (!hasCharImage()) {
        try { localStorage.setItem(LS_CHAR_IMAGE, DEFAULT_CHAR_IMG); } catch(e) {}
      }
      try { localStorage.setItem(LS_CHAR_SKIPPED, '1'); } catch(e) {}
      fillHome(p);
      goPage('page-home');
    }
    const DEFAULT_CHAR_IMG = './assets/assets/img/preset/char/character_01.png';

    // 顶部状态：显示云端连接情况，点击可看详情（排障用）
    function updateCloudBadge() {
      const el = document.getElementById('cloudBadge');
      if (!el) return;
      const online = !!dbSdk();
      const counts = _dbg.tables || {};
      const totalFail = Object.keys(counts).some(k => counts[k] === -1);
      let state = online ? (totalFail ? 'sync-partial' : 'sync') : 'offline';
      el.className = 'cloud-badge ' + state;
      el.textContent = online
        ? (totalFail ? '☁️ 部分同步' : '☁️ 已同步')
        : '✈️ 本机模式';
      el.title = online
        ? '数据已连接云端数据表，会自动双向同步'
        : '当前未连接云端，数据只保存在本机浏览器';
    }
    function showCloudDiag() {
      const t = _dbg.tables || {};
      const rows = Object.keys(t).map(k => k + ': ' + (t[k] === -1 ? '拉取失败' : t[k] + ' 行')).join('\n');
      let spState = '未知';
      try {
        const sp = window.__SMART_PAGE__;
        if (!sp) spState = '无（不在资料库沙箱内）';
        else if (sp.__realImpls__ && sp.__realImpls__.database) spState = '已注入（正常）';
        else if (sp.database && sp.database.__pending__) spState = '仅代理壳（平台尚未注入真实实现）';
      } catch (e) { spState = '检测失败'; }
      xAlert(
        '云端连接：' + (dbSdk() ? '已连接' : '未连接') +
        '\nSDK组件：' + spState +
        '\n本地存储：' + (_dbg.ls === 'memory' ? '临时（浏览器不可用，关闭即丢）' : '正常持久化') +
        '\n最近拉取：' + (_dbg.pulledAt || '尚未成功') +
        '\n数据表行数：\n' + (rows || '—') +
        '\n错误信息：' + (_dbg.lastError || '无')
      );
    }

    // 启动页 / 顶部：从云端恢复已有账号
    async function recoverFromCloud() {
      const btn = document.querySelector('.splash-recover');
      if (btn) { btn.disabled = true; btn.textContent = '☁️ 正在连接云端…'; }
      await waitSdk();
      const ok = await dbPullAll();

      // 拉取结果优先从内存快照读取，避免依赖 localStorage 往返
      let nick = (getProfile() || {}).nickname;
      let pulledProf = null;
      if (!nick && _lastPull.profile && _lastPull.profile.length) {
        const r = _lastPull.profile[0];
        pulledProf = {
          nickname: dbText(r, '昵称'), personality: dbText(r, '性格'), likes: dbText(r, '喜好'),
          food: dbText(r, '喜欢的食物'), oneLineDesc: dbText(r, '一句话描述'),
          interests: dbText(r, '兴趣关键词'), futureJobs: dbText(r, '职业关键词'),
          gender: '', skills: '', experiences: '', futureSkills: ''
        };
        nick = pulledProf.nickname;
        try { localStorage.setItem(LS_PROFILE, JSON.stringify(pulledProf)); } catch(e) {}
        const expNum = Number(dbVal(r, '总经验'));
        if (!isNaN(expNum) && expNum > 0) { try { localStorage.setItem(LS_PLAYER, JSON.stringify({ exp: expNum })); } catch(e) {} }
      }

      try { if (typeof window.petInit === 'function') window.petInit(); } catch(e) {}

      if (btn) { btn.disabled = false; btn.textContent = '☁️ 之前玩过？点这里从云端恢复我的存档'; }

      if (!nick) {
        if (ok) {
          xAlert('云端还没有找到存档。\n\n如果你之前是在本机玩的，点下面的按钮重新创建一次就好，之后会自动同步到云端。');
        } else {
          xAlert(
            '暂时没有连上云端。\n\n' +
            '原因：' + (_dbg.lastError === 'SDK_NOT_READY' ? '云端读写组件没有就绪（可能刚打开还没加载完，或平台组件注入较慢）\n建议：等几秒后重试，或关闭本页重新打开' : (_dbg.lastError || '未知')) + '\n' +
            '本地存储：' + (_dbg.ls === 'memory' ? '暂不可用（可能处于隐私模式/沙箱环境）' : '正常') + '\n\n' +
            '你仍然可以直接创建新角色正常使用，数据会存在本机，待云端可用后自动同步。'
          );
        }
        goPage('page-onboard');
        return;
      }
      enterHome(pulledProf || getProfile());
      showExpToast(0, '☁️ 欢迎回来，' + nick);
    }

    // 角色页：返回修改档案（保留已填内容）
    function backToOnboard() {
      const p = getProfile();
      const form = document.getElementById('onboardForm');
      if (form) {
        const set = (n, v) => { const el = form.querySelector('[name=' + n + ']'); if (el) el.value = v || ''; };
        set('nickname', p.nickname); set('personality', p.personality); set('likes', p.likes);
        set('food', p.food); set('oneLineDesc', p.oneLineDesc);
        set('interestsKw', p.interests); set('careerKw', p.futureJobs);
      }
      goPage('page-onboard');
    }

    // 首页：随时重新挑选形象
    function reenterCharGen() {
      showCharGenPage();
    }

    // 角色页：跳过选角直接进首页
    function skipCharGen() {
      enterHome(getProfile());
    }
