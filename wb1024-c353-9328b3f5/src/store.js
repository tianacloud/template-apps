/* 星星打卡 · 前端数据层
 * 所有读写都走 云端数据库：登录/注册用云 Auth，任务·打卡·积分·奖励·徽章用云数据库。
 * 数据按 owner_id（家长）隔离，行级安全由数据库 RLS 保证，前端从不发送 owner_id。
 */
(function (global) {
  'use strict';

  var L = global.KidsLogic;
  var CFG = global.CLOUD_CONFIG || {};

  var cloud = null;

  var state = null;      // 当前孩子的数据快照
  var me = null;         // 当前登录家长 {id, email, nickname, avatar, pinSet}
  var profile = null;    // profiles 表整行
  var children = [];
  var child = null;
  var stats = null;
  var badgeList = [];
  var events = { badges: [], goals: [] };
  var unlockedUntil = 0;
  var rememberEmail = '';
  var recovery = null;   // 忘记密码流程的临时状态

  var EMPTY = { tasks: [], goals: [], rewards: [], records: {}, pointsLog: [], badges: [], redeems: [] };

  /* ---------------- 基础 ---------------- */
  function lsGet(k) { try { return global.localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { global.localStorage.setItem(k, v); } catch (e) { } }
  function lsDel(k) { try { global.localStorage.removeItem(k); } catch (e) { } }

  function client() {
    if (cloud) return cloud;
    if (!global.AppDatabase) throw new Error('云服务 SDK 还没加载好，请刷新页面重试');
    cloud = global.AppDatabase.createAppDatabase({
      endpoint: CFG.endpoint,
      publishableKey: CFG.publishableKey
    });
    return cloud;
  }
  function db() { return client().database; }
  function auth() { return client().auth; }

  function ok(extra) {
    var o = {
      ok: true, user: me, children: children, child: child,
      state: state || EMPTY, stats: stats, badgeList: badgeList,
      unlocked: isUnlocked(), pinSet: !!(profile && profile.pin_hash), events: events
    };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  function fail(msg) { return Promise.resolve({ ok: false, msg: msg }); }

  /* 把 SDK 的 {data,error} 变成抛出错误，统一错误文案 */
  function unwrap(r) {
    if (!r) throw new Error('云服务没有返回结果');
    if (r.error) {
      var e = r.error, msg = e.message || '云服务请求失败';
      if (e.code === '42P01') msg = '数据表还没准备好，请稍后重试';
      if (e.code === '42501') msg = '没有权限操作这条数据';
      if (e.code === '23505') msg = '已经存在啦，换一个试试';
      var err = new Error(msg); err.code = e.code; throw err;
    }
    return r.data;
  }
  function guard(promise) {
    return Promise.resolve().then(function () { return promise; })
      .catch(function (e) { return { ok: false, msg: (e && e.message) || '云服务请求失败' }; });
  }

  function isUnlocked() { return Date.now() < unlockedUntil; }
  function touchUnlock() { unlockedUntil = Date.now() + 30 * 60 * 1000; }
  function dropUnlock() { unlockedUntil = 0; }

  function clearSession() {
    me = null; profile = null; state = null; children = []; child = null;
    stats = null; badgeList = []; events = { badges: [], goals: [] }; dropUnlock();
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()); }

  /* 登录用户对象：name 兼容昵称，未设置昵称时用邮箱前缀 */
  function mkUser(id, email) {
    return {
      id: id, email: email || '', nickname: '', avatar: '👩', pinSet: false,
      get name() { return this.nickname || (this.email ? String(this.email).split('@')[0] : '家长'); }
    };
  }

  /* ---------------- 访问锁：浏览器端 PBKDF2 加盐哈希 ---------------- */
  function toHex(buf) {
    var a = new Uint8Array(buf), s = '';
    for (var i = 0; i < a.length; i++) s += ('0' + a[i].toString(16)).slice(-2);
    return s;
  }
  function randSalt() {
    var a = new Uint8Array(16);
    global.crypto.getRandomValues(a);
    return toHex(a);
  }
  function pbkdf2(pin, salt) {
    var enc = new TextEncoder();
    return global.crypto.subtle.importKey('raw', enc.encode(String(pin)), 'PBKDF2', false, ['deriveBits'])
      .then(function (k) {
        return global.crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' }, k, 256);
      }).then(toHex);
  }

  /* ---------------- 数据装配 ---------------- */
  function mapTask(r) {
    var days = r.days;
    if (typeof days === 'string') { try { days = JSON.parse(days); } catch (e) { days = null; } }
    if (!Array.isArray(days) || !days.length) days = [0, 1, 2, 3, 4, 5, 6];
    return {
      id: String(r.id), title: r.title, emoji: r.emoji, points: r.points,
      slot: r.slot, days: days, active: r.active !== false
    };
  }
  function mapGoal(r) {
    return {
      id: String(r.id), title: r.title, emoji: r.emoji, type: r.goal_type || 'streak',
      target: r.target, reward: r.reward || ''
    };
  }
  function mapReward(r) {
    return { id: String(r.id), name: r.name, emoji: r.emoji, cost: r.cost, desc: r.memo || '' };
  }

  function computeDerived() {
    stats = L.computeStats(state);
    state.goals.forEach(function (g) { g.progress = L.goalProgress(state, g, stats); });
    badgeList = L.badgeList(state);
  }

  /* 新获得的徽章 / 达成的目标写回云数据库 */
  function settle() {
    return Promise.resolve().then(function () {
      var got = L.checkBadges(state);
      var done = L.checkGoals(state);
      if (!child) { events = { badges: got, goals: done }; return; }
      var have = {};
      (state.badges || []).forEach(function (b) { have[b.id] = 1; });
      var rows = [];
      got.forEach(function (b) {
        if (have[b.id]) return;
        rows.push({ child_id: Number(child.id), kind: 'badge', ref_id: b.id, got_at: Date.now() });
        state.badges.push({ id: b.id, gotAt: Date.now() });
      });
      done.forEach(function (g) {
        rows.push({ child_id: Number(child.id), kind: 'goal', ref_id: String(g.id), got_at: g.achievedAt || Date.now() });
      });
      events = { badges: got, goals: done };
      computeDerived();
      if (!rows.length) return;
      return db().from('child_events').insert(rows).then(function (r) {
        if (r.error) console.warn('[云] 写入成就失败', r.error.message);
      });
    });
  }

  function loadAll() {
    return Promise.all([
      db().from('profiles').select('*').maybeSingle(),
      db().from('children').select('*').order('sort_no', { ascending: true }).order('id', { ascending: true }),
      db().from('tasks').select('*').order('sort_no', { ascending: true }).order('id', { ascending: true }),
      db().from('rewards').select('*').order('sort_no', { ascending: true }).order('id', { ascending: true }),
      db().from('goals').select('*').order('sort_no', { ascending: true }).order('id', { ascending: true })
    ]).then(function (rs) {
      profile = unwrap(rs[0]);
      var kids = unwrap(rs[1]) || [];
      var tasks = (unwrap(rs[2]) || []).map(mapTask);
      var rewards = (unwrap(rs[3]) || []).map(mapReward);
      var goals = (unwrap(rs[4]) || []).map(mapGoal);
      if (!profile) {
        return db().from('profiles').insert({
          nickname: (me && me.email ? me.email.split('@')[0] : '家长'), avatar: '👩'
        }).select().then(function (r) {
          profile = (unwrap(r) || [])[0] || null;
          if (profile) return afterProfile(kids, tasks, rewards, goals);
          // 少数情况下 insert 未回传行，回查一次；仍查不到就给出明确错误
          return db().from('profiles').select('*').maybeSingle().then(function (r2) {
            profile = unwrap(r2) || null;
            if (!profile) throw new Error('家长档案初始化失败，请刷新重试');
            return afterProfile(kids, tasks, rewards, goals);
          });
        });
      }
      return afterProfile(kids, tasks, rewards, goals);
    });
  }

  function afterProfile(kids, tasks, rewards, goals) {
    children = kids.map(function (c) { return { id: String(c.id), name: c.name, avatar: c.avatar }; });
    me.nickname = profile.nickname || (me.email ? me.email.split('@')[0] : '家长');
    me.avatar = profile.avatar || '👩';
    me.pinSet = !!profile.pin_hash;
    var cur = null;
    if (profile.current_child_id) {
      cur = children.filter(function (c) { return c.id === String(profile.current_child_id); })[0] || null;
    }
    child = cur || children[0] || null;
    return loadChildData(child ? Number(child.id) : null).then(function (cs) {
      state = {
        tasks: tasks, goals: goals, rewards: rewards,
        records: cs.records, pointsLog: cs.pointsLog, badges: cs.badges, redeems: cs.redeems
      };
      (cs.goalDone || {}).forEach ? null : null;
      if (cs.goalDone) {
        state.goals.forEach(function (g) { g.achievedAt = cs.goalDone[g.id] || null; });
      }
      computeDerived();
      return settle();
    }).then(function () { return ok(); });
  }

  function loadChildData(cid) {
    var out = { records: {}, pointsLog: [], badges: [], redeems: [], goalDone: {} };
    if (!cid) return Promise.resolve(out);
    return Promise.all([
      db().from('records').select('date,task_id,created_at').eq('child_id', cid).limit(5000),
      db().from('points_log').select('id,date,delta,reason').eq('child_id', cid).order('id', { ascending: true }).limit(5000),
      db().from('child_events').select('kind,ref_id,got_at').eq('child_id', cid).limit(2000),
      db().from('redeems').select('*').eq('child_id', cid).order('id', { ascending: false }).limit(500)
    ]).then(function (rs) {
      (unwrap(rs[0]) || []).forEach(function (r) {
        if (!out.records[r.date]) out.records[r.date] = {};
        out.records[r.date][String(r.task_id)] = { t: Number(r.created_at) || Date.now() };
      });
      out.pointsLog = (unwrap(rs[1]) || []).map(function (r) {
        return { id: String(r.id), date: r.date, delta: r.delta, reason: r.reason || '' };
      });
      (unwrap(rs[2]) || []).forEach(function (e) {
        if (e.kind === 'badge') out.badges.push({ id: e.ref_id, gotAt: Number(e.got_at) || Date.now() });
        else if (e.kind === 'goal') out.goalDone[e.ref_id] = Number(e.got_at) || Date.now();
      });
      out.redeems = (unwrap(rs[3]) || []).map(function (r) {
        return {
          id: String(r.id), rewardId: r.reward_id ? String(r.reward_id) : null, name: r.name, emoji: r.emoji,
          cost: r.cost, date: r.date, status: r.status,
          createdAt: Number(r.created_at) || 0, settledAt: r.settled_at ? Number(r.settled_at) : null
        };
      });
      return out;
    });
  }

  /* ---------------- 对外 API ---------------- */
  var Store = {
    AVATARS: L.AVATARS, WEEK_CN: L.WEEK_CN, SLOTS: L.SLOTS, GOAL_TYPES: L.GOAL_TYPES,
    PWD_MIN: L.PWD_MIN,

    get state() { return state || EMPTY; },
    get events() { return events; },
    get children() { return children || []; },
    get child() { return child; },
    get pinSet() { return !!(profile && profile.pin_hash); },
    get unlocked() { return isUnlocked(); },
    set unlocked(v) { if (v) touchUnlock(); else dropUnlock(); },
    get rememberName() { return rememberEmail; },
    get rememberEmail() { return rememberEmail; },
    pwdStrength: function (p) { return L.pwdStrength(p); },
    pinValid: function (p) { return L.pinValid(p); },

    currentUser: function () { return me; },
    isParent: function () { return !!me; },
    remembered: function () { return rememberEmail ? { name: rememberEmail } : null; },

    /* ---- 会话 ---- */
    load: function () {
      return guard(Promise.resolve().then(function () {
        rememberEmail = lsGet('kk_email') || '';
        return auth().getSession().then(function (res) {
          if (res.error || !res.data) { clearSession(); return ok({ user: null }); }
          var u = res.data.user || {};
          me = mkUser(u.id, u.email);
          return loadAll();
        });
      }));
    },
    login: function (email, pwd, remember) {
      if (!isEmail(email)) return fail('请输入正确的邮箱');
      if (!pwd) return fail('请输入密码');
      return guard(auth().signInWithPassword({ email: String(email).trim(), password: pwd })
        .then(function (r) {
          var s = unwrap(r);
          if (!s) throw new Error('登录失败，请重试');
          me = mkUser(s.user.id, s.user.email || email);
          rememberEmail = remember ? (s.user.email || email) : '';
          if (remember) lsSet('kk_email', rememberEmail); else lsDel('kk_email');
          return loadAll();
        }));
    },
    /* 邮箱验证码：发送（注册与验证码登录共用） */
    sendOtp: function (email) {
      if (!isEmail(email)) return fail('请输入正确的邮箱');
      return guard(auth().sendOtp({ email: String(email).trim() }).then(function (r) {
        var d = unwrap(r);
        return { ok: true, email: String(email).trim(), verificationId: d.verificationId, isExistingUser: !!d.isExistingUser };
      }));
    },
    /* 验证码提交：老用户直接登录，新用户带密码完成注册 */
    verifyOtp: function (o) {
      if (!o || !o.email || !o.verificationId || !o.token) return fail('请先获取邮箱验证码');
      if (!o.isExistingUser && !o.password) return fail('新用户请设置登录密码');
      return guard(auth().verifyOtp({
        email: o.email, verificationId: o.verificationId, isExistingUser: !!o.isExistingUser,
        token: String(o.token), password: o.isExistingUser ? undefined : o.password
      }).then(function (r) {
        var s = unwrap(r);
        if (!s) throw new Error('验证码校验失败');
        me = mkUser(s.user.id, s.user.email || o.email);
        rememberEmail = s.user.email || o.email; lsSet('kk_email', rememberEmail);
        var self = this;
        return loadAll().then(function (j) {
          if (o.nickname || o.avatar) {
            return self.setProfile({ nickname: o.nickname || '', avatar: o.avatar || '👩' }).then(function () { return j; });
          }
          return j;
        });
      }.bind(this)));
    },
    register: function (o) {
      return this.verifyOtp({
        email: o.email, verificationId: o.verificationId, isExistingUser: false,
        token: o.code, password: o.password, nickname: o.nickname, avatar: o.avatar
      });
    },
    logout: function () {
      return guard(auth().signOut().then(function () {
        clearSession(); lsDel('kk_email');
        return { ok: true, user: null };
      }));
    },
    setProfile: function (o) {
      if (!me || !profile) return fail('还没有登录');
      var patch = {};
      if (o && o.nickname) patch.nickname = o.nickname;
      if (o && o.avatar) patch.avatar = o.avatar;
      if (!Object.keys(patch).length) return Promise.resolve(ok());
      return guard(Promise.resolve().then(function () {
        return db().from('profiles').update(patch).eq('id', profile.id).select().then(function (r) {
          var rows = unwrap(r) || [];
          if (rows[0]) profile = rows[0];
          me.nickname = profile.nickname || me.nickname;
          me.avatar = profile.avatar || me.avatar;
          return ok();
        });
      }));
    },
    /* 新账号铺一套默认任务/奖励/目标 */
    seedIfEmpty: function () {
      if (!me) return Promise.resolve({ ok: false, msg: '还没有登录' });
      if (state && state.tasks && state.tasks.length) return Promise.resolve(ok());
      return guard(seedDefaults().then(function () { return loadAll(); }));
    },
    /* 忘记密码：先发验证码，再用验证码设置新密码 */
    forgotStart: function (email) {
      if (!isEmail(email)) return fail('请输入正确的邮箱');
      return guard(auth().resetPasswordForEmail(String(email).trim()).then(function (r) {
        recovery = { email: String(email).trim(), started: unwrap(r) };
        return { ok: true };
      }));
    },
    forgotFinish: function (code, newPwd) {
      if (!recovery || !recovery.started) return fail('请先获取邮箱验证码');
      return guard(recovery.started.updateUser({ nonce: String(code), password: newPwd }).then(function (r) {
        unwrap(r);
        recovery = null;
        return { ok: true };
      }));
    },
    changePwd: function (o) {
      if (!o || !o.oldPassword || !o.newPassword) return fail('请把密码填完整');
      return guard(auth().resetPasswordForOld({ oldPassword: o.oldPassword, newPassword: o.newPassword })
        .then(function (r) { unwrap(r); return ok({ msg: '登录密码已修改' }); }));
    },

    /* ---- 访问锁 ---- */
    unlock: function (v) {
      return guard(Promise.resolve().then(function () {
        if (!me) return { ok: false, msg: '还没有登录' };
        if (profile && profile.pin_hash) {
          return pbkdf2(v, profile.pin_salt).then(function (h) {
            if (h !== profile.pin_hash) return { ok: false, msg: '访问锁不对哦' };
            touchUnlock();
            return ok({});
          });
        }
        return {ok:false,msg:'请先设置家长访问锁'};
      }));
    },
    lock: function () { dropUnlock(); return Promise.resolve(ok({})); },
    setPin: function (oldPin, pin, pin2) {
      if (!L.pinValid(pin)) return fail('访问锁要 4~6 位数字');
      if (pin !== pin2) return fail('两次输入的访问锁不一致');
      return guard(Promise.resolve().then(function () {
        return profile.pin_hash ? pbkdf2(oldPin, profile.pin_salt).then(function (h) { return h === profile.pin_hash; }) : Promise.resolve(true);
      }).then(function (valid) {
        if (!valid) return {ok:false,msg:'当前访问锁不对哦'};
        var salt = randSalt();
        return pbkdf2(pin, salt).then(function (hash) {
          return db().from('profiles').update({pin_hash:hash,pin_salt:salt}).eq('id',profile.id).select();
        }).then(function (r) {
          var rows=unwrap(r)||[]; if(!rows.length) return {ok:false,msg:'设置失败，请重试'};
          profile=rows[0]; dropUnlock(); return ok({msg:'访问锁已更新'});
        });
      }));
    },

    /* ---- 孩子档案 ---- */
    addChild: function (o) {
      var name = String((o && o.name) || '').trim();
      if (!name) return fail('给宝宝起个名字吧');
      var self = this;
      return guard(Promise.resolve().then(function () {
        return db().from('children').insert({ name: name, avatar: (o && o.avatar) || '🐻' }).select()
          .then(function (r) {
            var rows = unwrap(r) || [];
            if (!rows[0]) return { ok: false, msg: '添加失败，请重试' };
            var row = rows[0];
            // 先同步本地列表，再切换（否则 selectChild 在新 id 上找不到）
            var c = { id: String(row.id), name: row.name, avatar: row.avatar };
            if (!children.filter(function (x) { return x.id === c.id; })[0]) children.push(c);
            return self.selectChild(c.id);
          });
      }));
    },
    updateChild: function (o) {
      var name = String((o && o.name) || '').trim();
      if (!name) return fail('名字不能为空');
      return guard(Promise.resolve().then(function () {
        return db().from('children').update({ name: name, avatar: o.avatar }).eq('id', Number(o.id)).select()
          .then(function (r) {
            var rows = unwrap(r) || [];
            if (!rows.length) return { ok: false, msg: '宝宝档案不存在' };
            return loadAll();
          });
      }));
    },
    removeChild: function (id) {
      var cid = Number(id);
      return guard(Promise.resolve().then(function () {
        return Promise.all([
          db().from('records').delete().eq('child_id', cid),
          db().from('points_log').delete().eq('child_id', cid),
          db().from('child_events').delete().eq('child_id', cid),
          db().from('redeems').delete().eq('child_id', cid),
          db().from('children').delete().eq('id', cid).select()
        ]).then(function () { return loadAll(); });
      }));
    },
    selectChild: function (id) {
      return guard(Promise.resolve().then(function () {
        var c = children.filter(function (x) { return x.id === String(id); })[0];
        if (!c) return { ok: false, msg: '宝宝档案不存在' };
        return db().from('profiles').update({ current_child_id: Number(id) }).eq('id', profile.id).select()
          .then(function (r) {
            var rows = unwrap(r) || [];
            if (rows.length) profile = rows[0];
            child = c;
            return reloadChildData(Number(id)).then(function () { return ok({}); });
          });
      }));
    },

    /* ---- 日期与查询 ---- */
    todayKey: L.todayKey, shiftKey: L.shiftKey, prettyDate: L.prettyDate, keyOf: L.keyOf,
    activeTasks: function () { return L.activeTasks(this.state); },
    tasksOfDay: function (k) { return L.tasksOfDay(this.state, k); },
    dayRecords: function (k) { return L.dayRecords(this.state, k); },
    isDone: function (k, id) { return L.isDone(this.state, k, id); },
    stats: function () { return stats || L.computeStats(this.state); },
    points: function () { return stats ? stats.points : L.points(this.state); },
    badgeList: function () { return badgeList; },
    redeems: function () { return this.state.redeems || []; },

    /* ---- 打卡（只能家长确认） ---- */
    toggle: function (date, taskId) {
      var k = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : L.todayKey();
      if (k > L.todayKey()) return fail('还不能给未来的日子打卡哦');
      var t = this.state.tasks.filter(function (x) { return x.id === String(taskId); })[0];
      if (!t) return fail('任务不存在');
      if (!child) return fail('还没有添加宝宝档案');
      var cid = Number(child.id), tid = Number(taskId);
      var done = !!(this.state.records[k] && this.state.records[k][String(taskId)]);
      return guard(Promise.resolve().then(function () {
        if (done) {
          return db().from('records').delete().eq('child_id', cid).eq('date', k).eq('task_id', tid)
            .then(function (r) { unwrap(r); })
            .then(function () {
              return db().from('points_log').insert({
                child_id: cid, date: k, delta: -t.points, reason: '取消「' + t.title + '」', created_at: Date.now()
              });
            })
            .then(function (r) { unwrap(r); })
            .then(function () { return reloadChildData(cid); })
            .then(function () { return ok({ result: { done: false, delta: -t.points, task: t } }); });
        }
        return db().from('records').insert({ child_id: cid, date: k, task_id: tid, created_at: Date.now() })
          .then(function (r) { unwrap(r); })
          .then(function () {
            return db().from('points_log').insert({
              child_id: cid, date: k, delta: t.points, reason: '完成「' + t.title + '」', created_at: Date.now()
            });
          })
          .then(function (r) { unwrap(r); })
          .then(function () { return reloadChildData(cid); })
          .then(function () { return ok({ result: { done: true, delta: t.points, task: t } }); });
      }));
    },

    /* ---- 任务 / 奖励 / 目标 ---- */
    upsertTask: function (t) {
      var title = String((t && t.title) || '').trim();
      if (!title) return fail('给任务起个名字吧');
      if (!(t.days && t.days.length)) return fail('至少选择一个重复日');
      return guard(saveRow('tasks', t.id, {
        title: title, emoji: t.emoji || '📚',
        points: Math.max(1, Math.min(100, parseInt(t.points, 10) || 5)),
        slot: t.slot || 'morning', days: t.days.map(Number), active: t.active !== false
      }));
    },
    removeTask: function (id) {
      var tid = Number(id);
      return guard(Promise.resolve().then(function () {
        return db().from('records').delete().eq('task_id', tid)
          .then(function () { return db().from('tasks').delete().eq('id', tid).select(); })
          .then(function (r) {
            var rows = unwrap(r) || [];
            if (!rows.length) return { ok: false, msg: '任务不存在' };
            return loadAll();
          });
      }));
    },
    upsertReward: function (r) {
      var name = String((r && r.name) || '').trim();
      if (!name) return fail('给奖励起个名字吧');
      return guard(saveRow('rewards', r.id, {
        name: name, emoji: r.emoji || '🎁',
        cost: Math.max(1, parseInt(r.cost, 10) || 50), memo: String(r.desc || '')
      }));
    },
    removeReward: function (id) {
      return guard(Promise.resolve().then(function () {
        return db().from('rewards').delete().eq('id', Number(id)).select().then(function (r) {
          var rows = unwrap(r) || [];
          if (!rows.length) return { ok: false, msg: '奖励不存在' };
          return loadAll();
        });
      }));
    },
    upsertGoal: function (g) {
      var title = String((g && g.title) || '').trim();
      if (!title) return fail('给目标起个名字吧');
      return guard(saveRow('goals', g.id, {
        title: title, emoji: g.emoji || '🎯', goal_type: g.type || 'streak',
        target: Math.max(1, parseInt(g.target, 10) || 7), reward: String(g.reward || '')
      }));
    },
    removeGoal: function (id) {
      return guard(Promise.resolve().then(function () {
        return db().from('goals').delete().eq('id', Number(id)).select().then(function (r) {
          var rows = unwrap(r) || [];
          if (!rows.length) return { ok: false, msg: '目标不存在' };
          return loadAll();
        });
      }));
    },

    /* ---- 兑换 ---- */
    applyRedeem: function (rewardId) {
      var rw = this.state.rewards.filter(function (x) { return x.id === String(rewardId); })[0];
      if (!rw) return fail('奖励不存在');
      if (!child) return fail('还没有添加宝宝档案');
      if (this.stats().points < rw.cost) return fail('积分还不够哦');
      var cid = Number(child.id), now = Date.now();
      return guard(Promise.resolve().then(function () {
        return db().from('redeems').insert({
          child_id: cid, reward_id: Number(rw.id), name: rw.name, emoji: rw.emoji,
          cost: rw.cost, date: L.todayKey(), status: 'approved', created_at: now, settled_at: now
        }).then(function (r) {
          unwrap(r);
          return db().from('points_log').insert({
            child_id: cid, date: L.todayKey(), delta: -rw.cost, reason: '兑换「' + rw.name + '」', created_at: now
          });
        }).then(function (r) { unwrap(r); })
          .then(function () { return reloadChildData(cid); })
          .then(function () { return ok({ redeemed: { name: rw.name, cost: rw.cost } }); });
      }));
    },
    undoRedeem: function (id) {
      var it = this.state.redeems.filter(function (x) { return x.id === String(id); })[0];
      if (!it) return fail('兑换记录不存在');
      var cid = Number(child.id);
      return guard(Promise.resolve().then(function () {
        return db().from('redeems').delete().eq('id', Number(id)).select().then(function (r) {
          var rows = unwrap(r) || [];
          if (!rows.length) return { ok: false, msg: '兑换记录不存在' };
          return db().from('points_log').insert({
            child_id: cid, date: L.todayKey(), delta: it.cost, reason: '撤销兑换「' + it.name + '」', created_at: Date.now()
          });
        }).then(function (r) { unwrap(r); })
          .then(function () { return reloadChildData(cid); })
          .then(function () { return ok({ undone: { cost: it.cost } }); });
      }));
    },

    /* ---- 数据管理 ---- */
    reset: function () {
      return guard(Promise.resolve().then(function () {
        return Promise.all([
          db().from('records').delete().neq('id', 0),
          db().from('points_log').delete().neq('id', 0),
          db().from('child_events').delete().neq('id', 0),
          db().from('redeems').delete().neq('id', 0),
          db().from('tasks').delete().neq('id', 0),
          db().from('rewards').delete().neq('id', 0),
          db().from('goals').delete().neq('id', 0)
        ]).then(function () { return seedDefaults(); })
          .then(function () { return loadAll(); });
      }));
    },
    exportJSON: function () {
      return Promise.resolve(JSON.stringify({
        ok: true, exportedAt: Date.now(),
        parent: me, child: child, children: children, stats: stats, data: state
      }, null, 2));
    }
  };

  /* 新增 / 编辑一行，带 RLS 空结果检测 */
  function saveRow(table, id, row) {
    return Promise.resolve().then(function () {
      if (id) {
        return db().from(table).update(row).eq('id', Number(id)).select().then(function (r) {
          var rows = unwrap(r) || [];
          if (!rows.length) return { ok: false, msg: '这条数据不存在或不属于你' };
          return loadAll();
        });
      }
      return db().from(table).insert(row).select().then(function (r) {
        unwrap(r);
        return loadAll();
      });
    });
  }

  /* 重新拉取当前孩子的数据并重算徽章 / 目标 */
  function reloadChildData(cid) {
    if (!cid) return Promise.resolve();
    return loadChildData(cid).then(function (cs) {
      state = {
        tasks: state.tasks, goals: state.goals, rewards: state.rewards,
        records: cs.records, pointsLog: cs.pointsLog, badges: cs.badges, redeems: cs.redeems
      };
      state.goals.forEach(function (g) { g.achievedAt = cs.goalDone[g.id] || g.achievedAt || null; });
      computeDerived();
      return settle();
    });
  }

  /* 默认模板（新家长 / 重置后用） */
  var TPL = {
    tasks: [
      { title: '自己穿衣服', emoji: '👕', points: 5, slot: 'morning' },
      { title: '认真吃早餐', emoji: '🥛', points: 5, slot: 'morning' },
      { title: '读绘本 20 分钟', emoji: '📚', points: 10, slot: 'afternoon' },
      { title: '练琴 / 练字', emoji: '🎹', points: 10, slot: 'afternoon' },
      { title: '收拾玩具', emoji: '🧸', points: 8, slot: 'evening' },
      { title: '按时上床睡觉', emoji: '🌙', points: 10, slot: 'evening' }
    ],
    rewards: [
      { name: '看动画片 30 分钟', emoji: '📺', cost: 30, memo: '挑一部最喜欢的动画片' },
      { name: '周末去公园野餐', emoji: '🌳', cost: 80, memo: '带上小水壶和小零食' },
      { name: '一本新绘本', emoji: '📖', cost: 150, memo: '去书店自己挑一本' },
      { name: '游乐场玩半天', emoji: '🎡', cost: 300, memo: '周末狂欢大计划' }
    ],
    goals: [
      { title: '连续打卡一周', emoji: '🔥', goal_type: 'streak', target: 7, reward: '周末去公园野餐' },
      { title: '攒够 200 积分', emoji: '💰', goal_type: 'points', target: 200, reward: '一本新绘本' },
      { title: '本周完成率达到 80%', emoji: '🎯', goal_type: 'weekRate', target: 80, reward: '游乐场玩半天' }
    ]
  };
  function seedDefaults() {
    var all = [0, 1, 2, 3, 4, 5, 6];
    return Promise.all([
      db().from('tasks').insert(TPL.tasks.map(function (t, i) {
        return { title: t.title, emoji: t.emoji, points: t.points, slot: t.slot, days: all, active: true, sort_no: i };
      })),
      db().from('rewards').insert(TPL.rewards.map(function (r, i) {
        return { name: r.name, emoji: r.emoji, cost: r.cost, memo: r.memo, sort_no: i };
      })),
      db().from('goals').insert(TPL.goals.map(function (g, i) {
        return { title: g.title, emoji: g.emoji, goal_type: g.goal_type, target: g.target, reward: g.reward, sort_no: i };
      }))
    ]);
  }

  global.Store = Store;
})(window);
