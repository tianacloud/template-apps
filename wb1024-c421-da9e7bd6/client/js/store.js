/* 青禾记账 · 数据层
 * 完整移植自 Android 版 LedgerDb.java / LedgerLogic.java：
 * 金额一律以「分」为整数存取，账户 PBKDF2-HMAC-SHA256 派生密钥，
 * 数据只保存在本机浏览器（localStorage），不上传任何服务器。
 */
(function (global) {
  'use strict';
  var QH = (global.QH = global.QH || {});

  var EXPENSE = 0, INCOME = 1;
  QH.EXPENSE = EXPENSE;
  QH.INCOME = INCOME;
  var PALETTE = ['#EE9466', '#68B8B0', '#9F97D8', '#77A1C3', '#E3BA74'];
  QH.PALETTE = PALETTE;
  var CAT_COLORS = ['#EE9466', '#68B8B0', '#9F97D8', '#77A1C3', '#E3BA74', '#E28A9A', '#8EAAA1'];

  /* ---------------------------------------------------------------- money */

  function parseCents(input) {
    var s = String(input == null ? '' : input).replace(/[¥￥,，\s]/g, '');
    if (!s) throw new Error('请填写金额');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error('金额最多两位小数');
    var parts = s.split('.');
    var cents = parseInt(parts[0], 10) * 100 + parseInt(((parts[1] || '') + '00').slice(0, 2), 10);
    if (!isFinite(cents) || cents < 0) throw new Error('金额不正确');
    if (cents > 100000000000) throw new Error('单笔金额不能超过十亿元');
    return cents;
  }

  function money(cents) {
    var v = (Math.round(cents) / 100).toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return '¥' + v;
  }

  function inputAmount(cents) {
    if (cents % 100 === 0) return String(cents / 100);
    return (cents / 100).toFixed(2).replace(/0$/, '');
  }

  function crossedBudget(previous, current, limit) {
    return limit > 0 && previous <= limit && current > limit;
  }

  /* ---------------------------------------------------------------- dates */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dayStart(ts) {
    var d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function isoDate(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseISO(text) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(text || '').trim());
    if (!m) throw new Error('日期格式应为 YYYY-MM-DD');
    var y = +m[1], mo = +m[2], d = +m[3];
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
      throw new Error('日期不存在');
    }
    return dt.getTime();
  }

  function monthRange(offset) {
    var now = new Date();
    var first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    var next = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
    var lastDay = new Date(next.getTime() - 86400000);
    return {
      from: first.getTime(),
      until: next.getTime(),
      label: first.getFullYear() + '年' + (first.getMonth() + 1) + '月',
      month: first.getMonth(),
      year: first.getFullYear(),
      days: lastDay.getDate()
    };
  }

  function addMonths(ts, n) {
    var d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth() + n, d.getDate()).getTime();
  }

  function weekdayName(ts) {
    return '日一二三四五六'.charAt(new Date(ts).getDay());
  }

  /* -------------------------------------------------------------- storage */

  var ROOT_KEY = 'qinghe.v1';
  var THEME_KEY = 'qinghe.theme';
  var memory = {};
  var state = null;

  function readRaw(key) {
    try {
      if (global.localStorage) return global.localStorage.getItem(key);
    } catch (e) { /* 隐私模式降级为内存 */ }
    return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null;
  }

  function writeRaw(key, value) {
    try {
      if (global.localStorage) { global.localStorage.setItem(key, value); return; }
    } catch (e) { /* ignore */ }
    memory[key] = value;
  }

  function blank() { return { version: 1, users: [], session: null, data: {} }; }

  function load() {
    if (state) return state;
    var raw = readRaw(ROOT_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && parsed.data) state = parsed;
      } catch (e) { state = null; }
    }
    if (!state) state = blank();
    return state;
  }

  function persist() { writeRaw(ROOT_KEY, JSON.stringify(state)); }

  /* 无痕/严格模式下 localStorage 可能不可写，需要明确告知用户 */
  var storageOK = null;
  function canStore() {
    if (storageOK !== null) return storageOK;
    try {
      var probe = '__qinghe_probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      storageOK = true;
    } catch (e) {
      storageOK = false;
    }
    return storageOK;
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* --------------------------------------------------------------- crypto */

  var ITERATIONS = 120000;

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(bytes) {
    var len = bytes.length;
    var blocks = Math.ceil((len + 9) / 64);
    var buf = new Uint8Array(blocks * 64);
    buf.set(bytes);
    buf[len] = 0x80;
    var view = new DataView(buf.buffer);
    var bits = len * 8;
    view.setUint32(blocks * 64 - 8, Math.floor(bits / 4294967296));
    view.setUint32(blocks * 64 - 4, bits >>> 0);

    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var w = new Uint32Array(64);

    for (var b = 0; b < blocks; b++) {
      for (var i = 0; i < 16; i++) w[i] = view.getUint32(b * 64 + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      var a = h0, bb = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & bb) ^ (a & c) ^ (bb & c);
        var t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e;
        e = (d + t1) >>> 0;
        d = c; c = bb; bb = a;
        a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + bb) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    var out = new Uint8Array(32);
    var ov = new DataView(out.buffer);
    [h0, h1, h2, h3, h4, h5, h6, h7].forEach(function (v, idx) { ov.setUint32(idx * 4, v); });
    return out;
  }

  var encoder = (typeof TextEncoder !== 'undefined') ? new TextEncoder() : null;

  function utf8(str) {
    if (encoder) return encoder.encode(str);
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  function concat(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a); out.set(b, a.length);
    return out;
  }

  function toHex(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += ('0' + bytes[i].toString(16)).slice(-2);
    return s;
  }

  function fallbackDerive(passwordBytes, salt, rounds) {
    var block = sha256(concat(salt, passwordBytes));
    for (var i = 0; i < rounds; i++) block = sha256(concat(salt, block));
    return block;
  }

  function derive(password, salt) {
    if (global.crypto && global.crypto.subtle && global.crypto.subtle.importKey) {
      return global.crypto.subtle
        .importKey('raw', utf8(password), { name: 'PBKDF2' }, false, ['deriveBits'])
        .then(function (key) {
          return global.crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256);
        })
        .then(function (bits) { return new Uint8Array(bits); })
        .catch(function () { return fallbackDerive(utf8(password), salt, 60000); });
    }
    return Promise.resolve(fallbackDerive(utf8(password), salt, 60000));
  }

  /* ------------------------------------------------------------ accounts */

  function defaultCategories() {
    var expenses = ['餐饮', '交通', '购物', '居住', '娱乐', '医疗', '其他'];
    var incomes = ['工资', '奖金', '兼职', '理财', '其他'];
    var list = [];
    var i;
    for (i = 0; i < expenses.length; i++) {
      list.push({
        id: uid('c'), name: expenses[i], type: EXPENSE,
        color: CAT_COLORS[i % CAT_COLORS.length], budget: 0
      });
    }
    for (i = 0; i < incomes.length; i++) {
      list.push({
        id: uid('c'), name: incomes[i], type: INCOME,
        color: CAT_COLORS[i % CAT_COLORS.length], budget: 0
      });
    }
    return list;
  }

  function newBook() {
    return {
      categories: defaultCategories(),
      entries: [],
      budget: { monthly: 0, byCategory: {} },
      prefs: { tips: true },
      createdAt: Date.now()
    };
  }

  function register(name, email, password) {
    load();
    var mail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return Promise.reject(new Error('邮箱格式不正确'));
    if (String(password || '').length < 8) return Promise.reject(new Error('密码至少 8 位'));
    if (state.users.some(function (u) { return u.email === mail; })) {
      return Promise.reject(new Error('这个邮箱已注册，请直接登录'));
    }
    var salt = new Uint8Array(24);
    if (global.crypto && global.crypto.getRandomValues) global.crypto.getRandomValues(salt);
    else for (var i = 0; i < 24; i++) salt[i] = Math.floor(Math.random() * 256);

    return derive(password, salt).then(function (hash) {
      var id = uid('u');
      state.users.push({
        id: id,
        name: String(name || '').trim().slice(0, 24) || '青禾用户',
        email: mail,
        salt: toHex(salt),
        hash: toHex(hash),
        createdAt: Date.now()
      });
      state.data[id] = newBook();
      state.session = id;
      persist();
      return id;
    });
  }

  function login(email, password) {
    load();
    var mail = String(email || '').trim().toLowerCase();
    var user = null;
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].email === mail) { user = state.users[i]; break; }
    }
    if (!user) return Promise.reject(new Error('邮箱或密码不正确'));
    var salt = new Uint8Array(user.salt.match(/.{2}/g).map(function (h) { return parseInt(h, 16); }));
    return derive(password, salt).then(function (hash) {
      if (toHex(hash) !== user.hash) throw new Error('邮箱或密码不正确');
      state.session = user.id;
      if (!state.data[user.id]) state.data[user.id] = newBook();
      persist();
      return user.id;
    });
  }

  function logout() {
    load();
    state.session = null;
    persist();
  }

  function currentUser() {
    load();
    if (!state.session) return null;
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].id === state.session) return state.users[i];
    }
    return null;
  }

  function book() {
    var user = currentUser();
    if (!user) return null;
    if (!state.data[user.id]) state.data[user.id] = newBook();
    var b = state.data[user.id];
    if (!b.budget) b.budget = { monthly: 0, byCategory: {} };
    if (!b.budget.byCategory) b.budget.byCategory = {};
    if (!b.prefs) b.prefs = { tips: true };
    if (!Array.isArray(b.categories)) b.categories = defaultCategories();
    if (!Array.isArray(b.entries)) b.entries = [];
    return b;
  }

  /* ---------------------------------------------------------- categories */

  function kindOf(name, type) {
    var s = String(name || '');
    if (/[餐食饭]/.test(s)) return 'food';
    if (/[购衣物]/.test(s)) return 'shop';
    if (/[医药]/.test(s)) return 'medical';
    if (/[交车地铁]/.test(s)) return 'traffic';
    if (/[住房居]/.test(s)) return 'home';
    if (/[娱玩]/.test(s)) return 'fun';
    if (/工资|薪/.test(s)) return 'salary';
    if (/奖/.test(s)) return 'bonus';
    if (/兼职/.test(s)) return 'parttime';
    if (/理财|息/.test(s)) return 'invest';
    return type === INCOME ? 'salary' : 'shop';
  }

  var TONE = {
    food: '#EE9466', shop: '#9F97D8', medical: '#E28A9A', traffic: '#68B8B0',
    home: '#77A1C3', fun: '#E3BA74', salary: '#0C7063', bonus: '#C49345',
    parttime: '#77A1C3', invest: '#68B8B0'
  };

  function toneOf(name, type, fallback) {
    return TONE[kindOf(name, type)] || fallback || QH.PALETTE[0];
  }

  function categories(type) {
    var b = book();
    if (!b) return [];
    return b.categories.filter(function (c) { return type == null || c.type === type; });
  }

  function categoryById(id) {
    var b = book();
    if (!b) return null;
    for (var i = 0; i < b.categories.length; i++) if (b.categories[i].id === id) return b.categories[i];
    return null;
  }

  function categoryByName(name, type, color) {
    var b = book();
    var clean = String(name == null ? '' : name).trim().slice(0, 20);
    if (!clean) clean = type === EXPENSE ? '其他' : '其他收入';
    for (var i = 0; i < b.categories.length; i++) {
      var c = b.categories[i];
      if (c.type === type && c.name === clean) return c;
    }
    var made = {
      id: uid('c'), name: clean, type: type,
      color: color || PALETTE[b.categories.length % PALETTE.length], budget: 0
    };
    b.categories.push(made);
    persist();
    return made;
  }

  function addCategory(name, type, color) {
    var b = book();
    var clean = String(name || '').trim().slice(0, 20);
    if (!clean) throw new Error('分类名称不能为空');
    var exists = b.categories.some(function (c) { return c.type === type && c.name === clean; });
    if (exists) throw new Error('该分类已存在');
    b.categories.push({
      id: uid('c'), name: clean, type: type,
      color: color || PALETTE[b.categories.length % PALETTE.length], budget: 0
    });
    persist();
    return true;
  }

  function renameCategory(id, name) {
    var b = book();
    var clean = String(name || '').trim().slice(0, 20);
    if (!clean) throw new Error('分类名称不能为空');
    var target = categoryById(id);
    if (!target) throw new Error('分类不存在');
    var dup = b.categories.some(function (c) {
      return c.id !== id && c.type === target.type && c.name === clean;
    });
    if (dup) throw new Error('同类型下已有同名分类');
    target.name = clean;
    persist();
    return true;
  }

  function categoryUsage(id) {
    var b = book();
    return b.entries.filter(function (e) { return e.categoryId === id; }).length;
  }

  function deleteCategory(id) {
    var b = book();
    if (categoryUsage(id) > 0) return false;
    var before = b.categories.length;
    b.categories = b.categories.filter(function (c) { return c.id !== id; });
    delete b.budget.byCategory[id];
    persist();
    return b.categories.length < before;
  }

  /* ------------------------------------------------------------- entries */

  function entriesIn(from, until) {
    var b = book();
    if (!b) return [];
    return b.entries
      .filter(function (e) { return e.time >= from && e.time < until; })
      .sort(function (x, y) { return y.time - x.time || (y.seq || 0) - (x.seq || 0); });
  }

  function allEntries() {
    var b = book();
    if (!b) return [];
    return b.entries.slice().sort(function (x, y) { return y.time - x.time || (y.seq || 0) - (x.seq || 0); });
  }

  function recentEntries(limit) {
    return allEntries().slice(0, limit || 20);
  }

  function entryById(id) {
    var b = book();
    for (var i = 0; i < b.entries.length; i++) if (b.entries[i].id === id) return b.entries[i];
    return null;
  }

  function seq() {
    var b = book();
    var max = 0;
    for (var i = 0; i < b.entries.length; i++) max = Math.max(max, b.entries[i].seq || 0);
    return max + 1;
  }

  /* 返回 {entry, crossed, catCrossed} 便于界面提示预算被突破 */
  function saveEntry(payload) {
    var b = book();
    var type = payload.type === INCOME ? INCOME : EXPENSE;
    var cents = Math.round(payload.cents);
    if (!(cents > 0)) throw new Error('金额必须大于 0');
    var cat = categoryById(payload.categoryId);
    if (!cat || cat.type !== type) throw new Error('分类与收支类型不匹配');
    var time = dayStart(payload.time || Date.now());
    var note = String(payload.note || '').slice(0, 120);

    var month = monthRange(0);
    var before = sumOf(b.entries.filter(function (e) {
      return e.type === EXPENSE && e.time >= month.from && e.time < month.until;
    }));
    var catBefore = sumOf(b.entries.filter(function (e) {
      return e.type === EXPENSE && e.categoryId === cat.id && e.time >= month.from && e.time < month.until;
    }));

    var record = {
      id: payload.id || uid('e'),
      categoryId: cat.id,
      type: type,
      cents: cents,
      time: time,
      note: note,
      seq: 0
    };

    if (payload.id) {
      var idx = -1;
      for (var i = 0; i < b.entries.length; i++) if (b.entries[i].id === payload.id) idx = i;
      if (idx < 0) throw new Error('这笔记录已不存在');
      record.seq = b.entries[idx].seq || 0;
      b.entries[idx] = record;
    } else {
      record.seq = seq();
      b.entries.push(record);
    }
    persist();

    var inMonth = time >= month.from && time < month.until;
    var after = sumOf(b.entries.filter(function (e) {
      return e.type === EXPENSE && e.time >= month.from && e.time < month.until;
    }));
    var catAfter = sumOf(b.entries.filter(function (e) {
      return e.type === EXPENSE && e.categoryId === cat.id && e.time >= month.from && e.time < month.until;
    }));

    return {
      entry: record,
      crossed: inMonth && type === EXPENSE && crossedBudget(before, after, b.budget.monthly),
      catCrossed: inMonth && type === EXPENSE && cat.budget > 0 && crossedBudget(catBefore, catAfter, cat.budget)
    };
  }

  function deleteEntry(id) {
    var b = book();
    var before = b.entries.length;
    b.entries = b.entries.filter(function (e) { return e.id !== id; });
    persist();
    return b.entries.length < before;
  }

  /* --------------------------------------------------------------- budget */

  function monthlyBudget() { return book().budget.monthly || 0; }

  function setMonthlyBudget(cents) {
    book().budget.monthly = Math.max(0, Math.round(cents));
    persist();
  }

  function categoryBudget(id) {
    var c = categoryById(id);
    return c ? (c.budget || 0) : 0;
  }

  function setCategoryBudget(id, cents) {
    var c = categoryById(id);
    if (c && c.type === EXPENSE) {
      c.budget = Math.max(0, Math.round(cents));
      book().budget.byCategory[id] = c.budget;
      persist();
      return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ 汇总 */

  function sumOf(list) {
    var out = 0;
    for (var i = 0; i < list.length; i++) out += list[i].cents;
    return out;
  }

  function aggregate(list) {
    var income = 0, expense = 0, byCategory = {}, byDay = {};
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var cat = categoryById(e.categoryId);
      var name = cat ? cat.name : '未分类';
      if (e.type === INCOME) income += e.cents;
      else {
        expense += e.cents;
        byCategory[name] = (byCategory[name] || 0) + e.cents;
      }
      if (!byDay[e.time]) byDay[e.time] = { income: 0, expense: 0 };
      if (e.type === INCOME) byDay[e.time].income += e.cents;
      else byDay[e.time].expense += e.cents;
    }
    return { income: income, expense: expense, byCategory: byCategory, byDay: byDay, count: list.length };
  }

  /* ------------------------------------------------------------------ CSV */

  function parseCsvText(input) {
    var rows = [], row = [], cell = '';
    var quoted = false;
    var i = input.charCodeAt(0) === 0xFEFF ? 1 : 0;
    while (i < input.length) {
      var ch = input.charAt(i++);
      if (quoted) {
        if (ch === '"') {
          if (i < input.length && input.charAt(i) === '"') { cell += '"'; i++; }
          else quoted = false;
        } else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && i < input.length && input.charAt(i) === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (quoted) throw new Error('CSV 引号未闭合');
    if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
    return rows;
  }

  function csvCell(value) {
    var safe = value == null ? '' : String(value);
    var first = 0;
    while (first < safe.length && /\s/.test(safe.charAt(first))) first++;
    if (first < safe.length && '=+-@'.indexOf(safe.charAt(first)) >= 0) safe = "'" + safe;
    return '"' + safe.replace(/"/g, '""') + '"';
  }

  function colIndex(map, names) {
    for (var i = 0; i < names.length; i++) {
      if (map[names[i]] != null) return map[names[i]];
    }
    return -1;
  }

  /* 去重指纹：日期 + 金额 + 类型 + 分类名 + 备注。分类用名字而不是 id，
     这样 "导入时新建的分类" 和 "已存在的同名分类" 也能对上 */
  function fingerprint(time, cents, type, catName, note) {
    return [dayStart(time), cents, type, catName || '', note || ''].join('|');
  }

  function existingFingerprints() {
    var b = book();
    var set = {};
    if (!b) return set;
    var nameOf = {};
    b.categories.forEach(function (c) { nameOf[c.id] = c.name; });
    b.entries.forEach(function (e) {
      set[fingerprint(e.time, e.cents, e.type, nameOf[e.categoryId] || '', e.note)] = 1;
    });
    return set;
  }

  function parseType(text) {
    var s = String(text || '').trim();
    if (s === '支出' || /^expense$/i.test(s) || s === '-') return EXPENSE;
    if (s === '收入' || /^income$/i.test(s) || s === '+') return INCOME;
    throw new Error('类型只能填「支出」或「收入」');
  }

  /* 全量校验后再写入，任一错误整批拒绝（对应 Android 版事务语义） */
  function parseImport(text) {
    var rows = parseCsvText(text);
    if (rows.length < 2) throw new Error('文件里没有可导入的数据行');
    var head = rows[0];
    var map = {};
    for (var i = 0; i < head.length; i++) map[String(head[i]).trim()] = i;
    var iDate = colIndex(map, ['日期', 'date']);
    var iType = colIndex(map, ['类型', 'type']);
    var iCat = colIndex(map, ['分类', 'category']);
    var iAmount = colIndex(map, ['金额', '金额(元)', 'amount']);
    var iNote = colIndex(map, ['备注', 'note']);
    if (iDate < 0 || iType < 0 || iCat < 0 || iAmount < 0) {
      throw new Error('表头需要包含：日期,类型,分类,金额（备注可选）');
    }

    var items = [];
    var newCategories = [];
    var current = book();
    var existing = current ? current.categories : [];
    var seen = existingFingerprints();   /* 已存在的记录 + 本批次已出现的记录 */
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      var blank = row.every(function (c) { return !String(c).trim(); });
      if (blank) continue;
      var line = r + 1;
      try {
        var type = parseType(row[iType]);
        var name = String(iCat >= 0 && iCat < row.length ? row[iCat] : '').trim().slice(0, 20) || '其他';
        var cents = parseCents(row[iAmount]);
        var time = dayStart(parseISO(row[iDate]));
        var note = iNote >= 0 && iNote < row.length ? String(row[iNote]).slice(0, 120) : '';
        if (cents <= 0) throw new Error('金额必须大于 0');
        var fp = fingerprint(time, cents, type, name, note);
        var dup = !!seen[fp];
        seen[fp] = 1;
        items.push({
          type: type, category: name, cents: cents, time: time, note: note,
          color: PALETTE[items.length % PALETTE.length], dup: dup
        });
        var exists = false;
        for (var k = 0; k < existing.length; k++) {
          if (existing[k].type === type && existing[k].name === name) { exists = true; break; }
        }
        if (!exists && !newCategories.some(function (c) { return c.type === type && c.name === name; })) {
          newCategories.push({ type: type, name: name });
        }
      } catch (e) {
        throw new Error('第 ' + line + ' 行：' + e.message);
      }
    }
    if (!items.length) throw new Error('没有可导入的数据行');
    var duplicates = items.filter(function (i) { return i.dup; }).length;
    return { items: items, newCategories: newCategories, duplicates: duplicates };
  }

  function importRows(parsed) {
    var b = book();
    var created = 0;
    var skipped = 0;
    parsed.items.forEach(function (item) {
      if (item.dup) { skipped++; return; }
      var cat = null;
      for (var i = 0; i < b.categories.length; i++) {
        if (b.categories[i].type === item.type && b.categories[i].name === item.category) {
          cat = b.categories[i]; break;
        }
      }
      if (!cat) {
        cat = { id: uid('c'), name: item.category, type: item.type, color: item.color, budget: 0 };
        b.categories.push(cat);
        created++;
      }
      b.entries.push({
        id: uid('e'), categoryId: cat.id, type: item.type, cents: item.cents,
        time: item.time, note: item.note, seq: seq()
      });
    });
    persist();
    return { count: parsed.items.length - skipped, created: created, skipped: skipped };
  }

  function entriesToCsv(list) {
    var lines = ['日期,类型,分类,金额,备注'];
    list.forEach(function (e) {
      var cat = categoryById(e.categoryId);
      lines.push([
        csvCell(isoDate(e.time)),
        csvCell(e.type === EXPENSE ? '支出' : '收入'),
        csvCell(cat ? cat.name : '未分类'),
        csvCell(inputAmount(e.cents)),
        csvCell(e.note || '')
      ].join(','));
    });
    return lines.join('\r\n');
  }

  /* ------------------------------------------------------- 每月固定收支 */

  function recurring() {
    var b = book();
    if (!Array.isArray(b.recurring)) b.recurring = [];
    return b.recurring;
  }

  function monthKey(offset) {
    var m = monthRange(offset || 0);
    return m.year + '-' + (m.month + 1);
  }

  function addRecurring(rule) {
    var clean = {
      id: uid('r'),
      name: String(rule.name || '').trim().slice(0, 20) || '固定项',
      type: rule.type === INCOME ? INCOME : EXPENSE,
      cents: Math.max(1, Math.round(rule.cents)),
      day: Math.min(28, Math.max(1, Math.round(rule.day || 1))),
      categoryId: rule.categoryId,
      lastMonth: ''      /* 空表示当月还没自动记过 */
    };
    recurring().push(clean);
    persist();
    return clean;
  }

  function removeRecurring(id) {
    var b = book();
    var before = recurring().length;
    b.recurring = recurring().filter(function (r) { return r.id !== id; });
    persist();
    return b.recurring.length < before;
  }

  /* 本月已到日子、且还没记过的固定项 */
  function pendingRecurring() {
    var key = monthKey(0);
    var today = new Date().getDate();
    return recurring().filter(function (r) {
      return r.day <= today && r.lastMonth !== key;
    });
  }

  /* 一键把待记的固定项写进账本，返回写入笔数 */
  function applyRecurring() {
    var b = book();
    var m = monthRange(0);
    var key = monthKey(0);
    var list = pendingRecurring();
    var made = 0;
    list.forEach(function (r) {
      var cat = categoryById(r.categoryId);
      if (!cat || cat.type !== r.type) {
        cat = categoryByName(r.type === INCOME ? '其他收入' : '其他', r.type);
      }
      var day = Math.min(r.day, m.days);
      b.entries.push({
        id: uid('e'),
        categoryId: cat.id,
        type: r.type,
        cents: r.cents,
        time: new Date(m.year, m.month, day).getTime(),
        note: r.name,
        seq: seq()
      });
      r.lastMonth = key;
      made++;
    });
    if (made) persist();
    return made;
  }

  /* ---------------------------------------------------------- 备份 / 示例 */

  function exportBackup() {
    var b = book();
    var user = currentUser();
    return {
      app: 'qinghe-ledger',
      version: 1,
      exportedAt: new Date().toISOString(),
      owner: user ? user.name : '',
      book: {
        categories: b.categories, entries: b.entries, budget: b.budget,
        prefs: b.prefs, recurring: b.recurring || []
      }
    };
  }

  function restoreBackup(obj) {
    if (!obj || obj.app !== 'qinghe-ledger' || !obj.book) throw new Error('备份文件格式不正确');
    var incoming = obj.book;
    if (!Array.isArray(incoming.categories) || !Array.isArray(incoming.entries)) {
      throw new Error('备份缺少分类或记录');
    }
    var b = book();
    b.categories = incoming.categories.map(function (c) {
      return {
        id: c.id || uid('c'), name: String(c.name || '未命名').slice(0, 20),
        type: c.type === INCOME ? INCOME : EXPENSE,
        color: c.color || QH.PALETTE[0], budget: Math.max(0, c.budget || 0)
      };
    });
    var valid = {};
    b.categories.forEach(function (c) { valid[c.id] = c; });
    b.entries = incoming.entries
      .filter(function (e) { return valid[e.categoryId] && e.cents > 0; })
      .map(function (e, i) {
        return {
          id: e.id || uid('e'), categoryId: e.categoryId,
          type: e.type === INCOME ? INCOME : EXPENSE, cents: Math.round(e.cents),
          time: dayStart(e.time), note: String(e.note || '').slice(0, 120), seq: i + 1
        };
      });
    b.budget = {
      monthly: Math.max(0, (incoming.budget && incoming.budget.monthly) || 0),
      byCategory: (incoming.budget && incoming.budget.byCategory) || {}
    };
    b.prefs = Object.assign({ tips: true }, incoming.prefs || {});
    b.recurring = Array.isArray(incoming.recurring) ? incoming.recurring.map(function (r) {
      return {
        id: r.id || uid('r'),
        name: String(r.name || '固定项').slice(0, 20),
        type: r.type === INCOME ? INCOME : EXPENSE,
        cents: Math.max(1, Math.round(r.cents || 0)) || 1,
        day: Math.min(28, Math.max(1, Math.round(r.day || 1))),
        categoryId: r.categoryId,
        lastMonth: r.lastMonth || ''
      };
    }) : [];
    persist();
    return { categories: b.categories.length, entries: b.entries.length };
  }

  function seedDemo() {
    var b = book();
    var made = 0;
    var today = new Date();
    var plan = [
      [1, EXPENSE, '居住', 180000, '房租'],
      [2, EXPENSE, '餐饮', 3800, '早餐 + 午饭'],
      [3, INCOME, '工资', 800000, '月薪'],
      [4, EXPENSE, '交通', 600, '地铁'],
      [5, EXPENSE, '购物', 25900, '换季衣物'],
      [6, EXPENSE, '餐饮', 5200, '和室友吃火锅'],
      [8, EXPENSE, '娱乐', 4500, '电影票'],
      [9, EXPENSE, '餐饮', 2680, '食堂'],
      [11, INCOME, '兼职', 120000, '外包小项目'],
      [12, EXPENSE, '医疗', 8600, '感冒药'],
      [14, EXPENSE, '餐饮', 6400, '周末聚餐'],
      [15, EXPENSE, '交通', 3200, '打车去车站'],
      [17, EXPENSE, '购物', 12900, '耳机'],
      [18, EXPENSE, '餐饮', 3100, '外卖'],
      [20, INCOME, '理财', 15600, '基金收益'],
      [21, EXPENSE, '居住', 12000, '水电费'],
      [22, EXPENSE, '餐饮', 4580, '超市采购'],
      [25, EXPENSE, '娱乐', 6800, '周末看展']
    ];
    [-2, -1, 0].forEach(function (off, index) {
      var m = monthRange(off);
      var factor = [0.82, 0.93, 1][index];
      var maxDay = off === 0 ? today.getDate() : m.days;
      plan.forEach(function (p) {
        if (p[0] > maxDay) return;
        var cat = categoryByName(p[2], p[1]);
        b.entries.push({
          id: uid('e'), categoryId: cat.id, type: p[1],
          cents: Math.max(100, Math.round(p[3] * factor)),
          time: new Date(m.year, m.month, p[0]).getTime(),
          note: p[4], seq: seq()
        });
        made++;
      });
    });

    if (!b.budget.monthly) b.budget.monthly = 600000;
    var eat = categoryByName('餐饮', EXPENSE);
    if (!eat.budget) eat.budget = 150000;
    b.budget.byCategory[eat.id] = eat.budget;
    persist();
    return made;
  }

  function clearEntries() {
    book().entries = [];
    persist();
  }

  /* ---------------------------------------------------------------- theme */

  function theme() { return readRaw(THEME_KEY) || 'paper'; }
  function setTheme(name) { writeRaw(THEME_KEY, name); }

  /* --------------------------------------------------------------- exports */

  QH.store = {
    parseCents: parseCents,
    money: money,
    inputAmount: inputAmount,
    crossedBudget: crossedBudget,
    isoDate: isoDate,
    parseISO: parseISO,
    dayStart: dayStart,
    monthRange: monthRange,
    addMonths: addMonths,
    weekdayName: weekdayName,
    register: register,
    login: login,
    logout: logout,
    user: currentUser,
    book: book,
    categories: categories,
    categoryById: categoryById,
    categoryByName: categoryByName,
    addCategory: addCategory,
    renameCategory: renameCategory,
    deleteCategory: deleteCategory,
    categoryUsage: categoryUsage,
    entriesIn: entriesIn,
    allEntries: allEntries,
    recentEntries: recentEntries,
    entryById: entryById,
    saveEntry: saveEntry,
    deleteEntry: deleteEntry,
    recurring: recurring,
    addRecurring: addRecurring,
    removeRecurring: removeRecurring,
    pendingRecurring: pendingRecurring,
    applyRecurring: applyRecurring,
    monthKey: monthKey,
    monthlyBudget: monthlyBudget,
    setMonthlyBudget: setMonthlyBudget,
    categoryBudget: categoryBudget,
    setCategoryBudget: setCategoryBudget,
    sumOf: sumOf,
    aggregate: aggregate,
    parseCsvText: parseCsvText,
    parseImport: parseImport,
    importRows: importRows,
    entriesToCsv: entriesToCsv,
    exportBackup: exportBackup,
    restoreBackup: restoreBackup,
    seedDemo: seedDemo,
    clearEntries: clearEntries,
    theme: theme,
    setTheme: setTheme,
    kindOf: kindOf,
    toneOf: toneOf,
    hasUsers: function () { return load().users.length > 0; },
    canStore: canStore,
    touch: function () { persist(); },
    _sha256: sha256,
    _fallbackDerive: fallbackDerive,
    _reset: function () { state = blank(); persist(); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
