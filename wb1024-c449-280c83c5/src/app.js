/* ============================================================
 * 宝贝课程表 · 应用逻辑
 * 纯前端 · 无需构建 · 数据存于云数据库（本地 localStorage 作为离线缓存）
 * ============================================================ */
(function () {
  "use strict";

  var C = window.CURRICULUM;
  var DAYS = C.days;

  /* ============ 常量 ============ */

  var K_DATA = "kid-schedule:data:v1";
  var K_PROG = "kid-schedule:progress:v1";
  var K_SET = "kid-schedule:settings:v1";
  var K_WX = "kid-schedule:weather:v1";
  var K_SYNC = "kid-schedule:sync:v1";

  var DEFAULT_FAMILY = "baby-home";

  var CAT_COLOR = { study: "#f59e0b", sport: "#0ea5e9", art: "#ec4899", life: "#10b981", commute: "#64748b", play: "#8b5cf6" };
  var CAT_NAME = { study: "学习", sport: "运动", art: "艺术", life: "生活", commute: "出行", play: "玩乐" };

  var ICON_CAT = {};
  (function () {
    var map = {
      study: "📖 ✏️ 📝 🔤 🔠 🧠 🔢 🧩 🧮 🎯 🗣️ 🌍 🔬 🖍️ 📚 🏫",
      sport: "🏊 🏸 🤸 ⚽ 🏀 🚴 🛼 🏃 🧘 ⛹️ 🎽 🥇 🤾 🏓",
      art: "🎨 💃 🎵 🎹 🎭 🎤 🖌️ ✂️ 🎪 🩰 🎼",
      life: "🌞 🌙 😴 🍳 🍚 🍎 🥛 ☕ 🛁 🚿 🪥 🧴 👕 🎒 ⏰ 🛏️",
      commute: "🚗 🚌 🚲 🛴 🚶 🚕 🚇 🧳 🚦",
      play: "🎈 🧸 🎮 🐾 🌳 🎁 🎠 🎡 🪁 🎲 🪀 🍭 🐣 🦄"
    };
    Object.keys(map).forEach(function (k) {
      map[k].split(" ").forEach(function (e) { if (e) ICON_CAT[e] = k; });
    });
  })();

  var BADGES = [
    { icon: "🌟", name: "启明星", need: 5 },
    { icon: "🎖️", name: "坚持星", need: 15 },
    { icon: "🏅", name: "小达人", need: 30 },
    { icon: "🏆", name: "小冠军", need: 60 },
    { icon: "👑", name: "闪闪发光", need: 100 }
  ];

  var MOODS = [
    { e: "😄", t: "超开心" },
    { e: "🙂", t: "还不错" },
    { e: "😐", t: "一般般" },
    { e: "😢", t: "有点难过" }
  ];

  var WMO = {
    0: ["☀️", "晴"], 1: ["🌤️", "晴间多云"], 2: ["⛅", "多云"], 3: ["☁️", "阴"],
    45: ["🌫️", "有雾"], 48: ["🌫️", "雾凇"],
    51: ["🌦️", "小毛毛雨"], 53: ["🌦️", "毛毛雨"], 55: ["🌧️", "密集毛毛雨"],
    56: ["🌧️", "冻毛毛雨"], 57: ["🌧️", "冻毛毛雨"],
    61: ["🌧️", "小雨"], 63: ["🌧️", "中雨"], 65: ["🌧️", "大雨"],
    66: ["🌧️", "冻雨"], 67: ["🌧️", "强冻雨"],
    71: ["🌨️", "小雪"], 73: ["🌨️", "中雪"], 75: ["❄️", "大雪"], 77: ["🌨️", "雪粒"],
    80: ["🌦️", "阵雨"], 81: ["🌧️", "强阵雨"], 82: ["⛈️", "暴雨"],
    85: ["🌨️", "阵雪"], 86: ["❄️", "强阵雪"],
    95: ["⛈️", "雷阵雨"], 96: ["⛈️", "雷暴冰雹"], 99: ["⛈️", "强雷暴"]
  };

  /* ============ 工具函数 ============ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function toMin(t) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(t || "").trim());
    return m ? (+m[1]) * 60 + (+m[2]) : 0;
  }
  function minToStr(m) { m = Math.max(0, Math.round(m)); return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function dateKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function weekdayIndex(d) { return (d.getDay() + 6) % 7; } // 周一 = 0
  function durText(mins) {
    mins = Math.round(mins);
    if (mins < 60) return mins + " 分钟";
    var h = Math.floor(mins / 60), m = mins % 60;
    return m ? h + " 小时 " + m + " 分" : h + " 小时";
  }

  function classify(icon, text) {
    if (ICON_CAT[icon]) return ICON_CAT[icon];
    var t = String(text || "");
    if (/游泳|羽毛球|跳绳|运动|打球|跑步|体适能|球/.test(t)) return "sport";
    if (/画|跳舞|舞蹈|音乐|钢琴|艺术|手工|涂鸦/.test(t)) return "art";
    if (/识字|思维|英语|写字|阅读|学习|训练|上课|拼音|数学|绘本/.test(t)) return "study";
    if (/通勤|返程|出发|路上|接送|准备/.test(t)) return "commute";
    if (/自由|玩|休息|休整|懒觉|玩耍|游戏/.test(t)) return "play";
    return "life";
  }

  function toast(msg, type) {
    var wrap = $("#toastWrap");
    var el = document.createElement("div");
    el.className = "toast" + (type ? " " + type : "");
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s, transform .3s";
      el.style.opacity = "0";
      el.style.transform = "translateY(-10px)";
      setTimeout(function () { el.remove(); }, 320);
    }, 1900);
  }

  /* ============ 状态 ============ */

  var state = {
    data: null,
    settings: { name: C.meta.name, city: C.meta.city, theme: "light", idle: 0, showSec: true, familyCode: DEFAULT_FAMILY, autoSync: true },
    progress: { checks: {}, notes: [], milestones: {}, mood: {} },
    view: "week",
    selDay: weekdayIndex(new Date()),
    weather: null,
    editMode: false,
    isPhone: false,
    installEvt: null,
    timer: { running: false, sec: 0, handle: null }
  };

  var PHONE_MQ = "(max-width: 767px)";
  function isPhoneNow() {
    try { return window.matchMedia(PHONE_MQ).matches; } catch (e) { return window.innerWidth <= 767; }
  }

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function saveData() { try { localStorage.setItem(K_DATA, JSON.stringify(state.data)); } catch (e) {} cloudSchedule(); }
  function saveProg() { try { localStorage.setItem(K_PROG, JSON.stringify(state.progress)); } catch (e) {} cloudSchedule(); }
  function saveSet() { try { localStorage.setItem(K_SET, JSON.stringify(state.settings)); } catch (e) {} cloudSchedule(); }

  /* ============ 云数据库同步 ============
   * 存储策略：本地 localStorage 立即写入（离线可用）→ 合并 900ms 后推送到云数据库。
   * 传输方式：原生 XMLHttpRequest 直连云端 REST，【不使用任何 SDK】。
   *   原因：iOS 12 / 老 Safari 缺少 TextEncoder、Headers、crypto.subtle、?. 等新能力，
   *        官方 SDK 即使做过语法降级，仍会在运行时报错导致云同步完全失效。
   *   接口：GET  /schedules?family_code=eq.<码>&select=...        读取
   *        PATCH /schedules?family_code=eq.<码>  (Prefer: representation)  更新，返回 [] 表示无此记录
   *        POST  /schedules                                       插入；返回 409 再回退到 PATCH
   *        鉴权：请求头 x-wb-webapp-access-key
   */
  var booted = false;
  var applyingSnap = false; // 应用云端快照期间，避免"拉下来的数据又被当成改动传回去"
  var cloud = {
    ready: false, code: DEFAULT_FAMILY, status: "off",
    timer: null, lastAt: 0, err: "", dirty: false, http: 0, mode: "rest", remoteAt: 0
  };

  var CLOUD_TIMEOUT = 15000;

  function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  /** 把云端返回体整理成人类可读的错误信息 */
  function cloudMsg(status, raw) {
    var m = raw ? String(raw) : "";
    try {
      var j = JSON.parse(m);
      if (j && j.message) m = String(j.message);
      else if (j && j.msg) m = String(j.msg);
      else if (j && j.hint) m = String(j.hint);
    } catch (e) {}
    m = m.replace(/\s+/g, " ").slice(0, 120);
    if (status) return "HTTP " + status + (m ? " · " + m : "");
    return m || "网络不通";
  }

  function rest(method, path, bodyObj, cb) {
    var promise;
    if (method === "GET") promise = window.scheduleSQL("SELECT payload, updated_at FROM schedules WHERE family_code = ?", [cloud.code]).then(function(r) { return r.rows.map(function(x) { return {payload: JSON.parse(x.payload), updated_at:x.updated_at}; }); });
    else if (method === "PATCH") promise = window.scheduleSQL("UPDATE schedules SET payload = ?, updated_at = ? WHERE family_code = ?", [JSON.stringify(bodyObj.payload), bodyObj.updated_at, cloud.code]).then(function(r) { return r.affectedRows ? [{family_code:cloud.code}] : []; });
    else promise = window.scheduleSQL("INSERT INTO schedules (family_code,payload,updated_at) VALUES (?,?,?)", [bodyObj.family_code,JSON.stringify(bodyObj.payload),bodyObj.updated_at]).then(function(){return [{family_code:cloud.code}];});
    promise.then(function(rows){ cb(200, rows, ""); }).catch(function(e){cb(0,null,String(e.message));});
  }

  function cloudFamilyPath() {
    return "/schedules?family_code=eq." + encodeURIComponent(cloud.code);
  }

  function cloudInit(cb) {
    cloud.code = (state.settings && state.settings.familyCode) || DEFAULT_FAMILY;
    cloud.lastAt = loadJSON(K_SYNC, 0); // 刷新后仍能显示上次同步时间
    cloud.ready = !!window.scheduleSQL;
    if (cloud.ready) {
      cloud.status = "idle";
      cloud.err = "";
      if (cloud.dirty) { cloud.dirty = false; cloudPush(true); }
    } else {
      cloud.status = "nosdk";
      cloud.err = "当前浏览器不支持网络组件（数据仍在本地保存）";
    }
    if (cb) cb();
    if (state.view === "settings") render();
  }

  function cloudSnap() {
    return { v: 1, at: Date.now(), data: state.data, progress: state.progress, settings: state.settings };
  }

  function cloudStatusText() {
    var t = {
      off: "未连接", loading: "正在加载云端组件…", nosdk: "云端不可用（已用本地保存）",
      idle: "待同步", syncing: "同步中…",
      ok: "已保存到云端", empty: "云端暂无数据", err: "同步失败（已存本地）"
    };
    var s = t[cloud.status] || cloud.status;
    if (cloud.status === "ok" && cloud.lastAt) {
      var d = new Date(cloud.lastAt);
      s += " · " + pad(d.getHours()) + ":" + pad(d.getMinutes());
    }
    if (cloud.status === "err" && cloud.err) s += "：" + cloud.err.slice(0, 40);
    return s;
  }

  /** 把同步时间戳显示成「今天 09:30 / 昨天 21:05 / 10-18 14:22」 */
  function syncTimeText(ts) {
    var d = new Date(ts), now = new Date();
    var hm = pad(d.getHours()) + ":" + pad(d.getMinutes());
    function sameDay(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
    if (sameDay(d, now)) return "今天 " + hm;
    var y = new Date(now.getTime() - 86400000);
    if (sameDay(d, y)) return "昨天 " + hm;
    return (d.getMonth() + 1) + "月" + d.getDate() + "日 " + hm;
  }

  /** 是否开启自动同步（默认开启，设置页可关） */
  function cloudAuto() {
    return !state.settings || state.settings.autoSync !== false;
  }

  /** 弹窗是否打开（编辑/新增/确认框） */
  function modalOpen() {
    var m = $("#modalMask");
    return !!(m && !m.hidden);
  }

  /** 安全重绘：用户正在输入或弹窗打开时不要整体重绘，否则会把输入内容冲掉 */
  function renderSafe() {
    if (modalOpen()) { refreshCloudStatus(); return; }
    var a = document.activeElement;
    var typing = a && (a.tagName === "INPUT" || a.tagName === "SELECT" || a.tagName === "TEXTAREA");
    if (typing) { refreshCloudStatus(); return; }
    render();
  }

  /** 只刷新设置页的云同步状态文字（不重建整个页面） */
  function refreshCloudStatus() {
    var el = $("#cloudStatus");
    if (el) el.textContent = cloudStatusText();
  }

  /** 任何本地改动都会走这里：合并 900ms 后自动上传 */
  function cloudSchedule() {
    if (!booted || applyingSnap) return;
    if (!cloudAuto()) return;
    if (!cloud.ready) cloudInit(); // 组件不可用时先尝试恢复
    if (cloud.timer) clearTimeout(cloud.timer);
    cloud.timer = setTimeout(function () { cloudPush(false); }, 900);
  }

  function cloudPush(manual, cb) {
    if (cloud.timer) { clearTimeout(cloud.timer); cloud.timer = null; }
    if (!cloud.ready) cloudInit();
    if (!cloud.ready) {
      cloud.dirty = true;
      if (manual) toast("云端不可用：" + (cloud.err || "请检查网络"), "warn");
      if (cb) cb(false);
      return;
    }
    cloud.status = "syncing";
    cloud.err = "";
    if (manual) toast("正在上传到云端…");
    if (manual && state.view === "settings") render();
    var iso = new Date().toISOString();
    // 先尝试更新已有记录（带上 representation，好判断到底有没有命中行）
    rest("PATCH", cloudFamilyPath() + "&select=family_code", { payload: cloudSnap(), updated_at: iso }, function (st, rows, raw) {
      if (st >= 200 && st < 300) {
        if (!rows) { cloudPushOK(manual, cb); return; } // 服务端未回表示：视为更新已生效
        if (rows.length) { cloudPushOK(manual, cb); return; }
        // 云端还没有这个家庭码的记录 → 插入一条
        var row = { family_code: cloud.code, payload: cloudSnap(), updated_at: iso };
        rest("POST", "/schedules?select=family_code", row, function (st2, rows2, raw2) {
          if (st2 >= 200 && st2 < 300) { cloudPushOK(manual, cb); return; }
          if (st2 === 409) {
            // 被别的设备抢先插入了，改为更新再试一次
            rest("PATCH", cloudFamilyPath() + "&select=family_code", { payload: cloudSnap(), updated_at: new Date().toISOString() }, function (st3, rows3, raw3) {
              if (st3 >= 200 && st3 < 300) cloudPushOK(manual, cb); else cloudPushFail(st3, raw3, manual, cb);
            }, "return=representation");
            return;
          }
          cloudPushFail(st2, raw2, manual, cb);
        });
        return;
      }
      cloudPushFail(st, raw, manual, cb);
    }, "return=representation");
  }

  function cloudPushOK(manual, cb) {
    cloud.status = "ok"; cloud.lastAt = Date.now(); cloud.err = "";
    cloud.dirty = false;
    cloud.remoteAt = cloud.lastAt;
    saveJSON(K_SYNC, cloud.lastAt);
    if (manual) toast("已保存到云端 ✅ 家庭码：" + cloud.code);
    if (state.view === "settings") renderSafe();
    if (cb) cb(true);
  }

  function cloudPushFail(st, raw, manual, cb) {
    cloud.status = "err"; cloud.err = cloudMsg(st, raw);
    cloud.dirty = false; // 结果未知时不重放
    if (manual) toast("云端保存失败：" + cloud.err + "（已存本地）", "warn");
    if (state.view === "settings") renderSafe();
    if (cb) cb(false);
  }

  function cloudPull(silent, cb) {
    if (!cloud.ready) cloudInit();
    if (!cloud.ready) {
      cloud.dirty = true;
      if (!silent) toast("云端不可用：" + (cloud.err || "请检查网络"), "warn");
      if (cb) cb(false);
      return;
    }
    cloud.status = "syncing";
    cloud.err = "";
    if (state.view === "settings") renderSafe();
    rest("GET", cloudFamilyPath() + "&select=payload,updated_at", null, function (st, rows, raw) {
      if (!(st >= 200 && st < 300)) {
        cloud.status = "err"; cloud.err = cloudMsg(st, raw);
        if (!silent) toast("云端读取失败：" + cloud.err, "warn");
        if (state.view === "settings") renderSafe();
        if (cb) cb(false);
        return;
      }
      var row = rows && rows.length ? rows[0] : null;
      if (!row || !row.payload) {
        cloud.status = "empty"; cloud.remoteAt = 0;
        if (!silent) toast("云端还没有「" + cloud.code + "」的数据，点「上传到云端」先存一份", "warn");
        if (state.view === "settings") renderSafe();
        if (cb) cb(false);
        return;
      }
      var rp = row.payload;
      var remoteAt = rp && rp.at ? rp.at : 0;
      cloud.remoteAt = remoteAt;
      var localAt = loadJSON(K_SYNC, 0);
      if (remoteAt > localAt + 1500) {
        if (modalOpen()) {
          // 用户正在编辑，先别覆盖（否则会把正在填的表单冲掉），5 秒后再试
          cloud.status = "idle";
          setTimeout(function () { cloudAutoTick(); }, 5000);
          if (cb) cb(true);
          return;
        }
        applyingSnap = true;
        applySnap(rp);
        saveData(); saveProg(); saveSet(); saveJSON(K_SYNC, remoteAt);
        applyingSnap = false;
        cloud.lastAt = remoteAt;
        render();
        if (!silent) toast("已从云端恢复最新数据 ✅");
      } else if (!silent) {
        toast("本机已是最新（云端与本机一致）");
      }
      cloud.status = "ok"; cloud.err = "";
      if (state.view === "settings") renderSafe();
      if (cb) cb(true);
    });
  }

  /* ============ 自动同步编排 ============
   * 打开/刷新页面：先拉云端，再判断本机是否更新 → 双向对齐
   * 断网恢复 / 回到前台 / 每 2 分钟：补传失败过的改动，并静默拉一次
   */
  function cloudBootSync() {
    cloudInit();
    if (!cloud.ready) return;
    if (cloud.dirty) {
      // 上次没传成功的改动优先上传，免得被云端旧数据覆盖
      cloudPush(false, function () { cloudPull(true, cloudAfterPull); });
      return;
    }
    cloudPull(true, cloudAfterPull);
  }

  function cloudAfterPull() {
    var localAt = loadJSON(K_SYNC, 0);
    var remoteAt = cloud.remoteAt || 0;
    if (localAt > remoteAt + 1500) cloudPush(false);        // 本机更新 → 自动上传
    else if (cloud.status === "empty") cloudPush(false);    // 云端还没有 → 补一份上去
  }

  function cloudAutoTick() {
    if (!booted || !cloud.ready || !cloudAuto()) return;
    if (applyingSnap) return;
    if (cloud.dirty) { cloudPush(false); return; }          // 之前失败的改动补传
    cloudPull(true, cloudAfterPull);                        // 静默拉一次，顺便判断要不要上传
  }

  /** 连通性自检：快速探一下云端，把 HTTP 状态码和耗时直接显示出来 */
  function cloudDiag() {
    if (!cloud.ready) cloudInit();
    if (!cloud.ready) { toast("云端不可用：" + (cloud.err || "请检查网络"), "warn"); return; }
    var t0 = new Date().getTime();
    cloud.status = "syncing"; cloud.err = "";
    if (state.view === "settings") render();
    rest("GET", "/schedules?select=family_code&limit=1", null, function (st, rows, raw) {
      var ms = new Date().getTime() - t0;
      if (st >= 200 && st < 300) {
        cloud.status = "ok"; cloud.err = "";
        toast("云端连通 ✅ HTTP " + st + " · " + ms + "ms", "ok");
      } else {
        cloud.status = "err"; cloud.err = cloudMsg(st, raw);
        toast("云端不通：" + cloud.err, "warn");
      }
      if (state.view === "settings") render();
    });
  }

  /** 用云端快照覆盖本地状态（做基本校验，避免脏数据把页面搞崩） */
  function applySnap(p) {
    if (!p) return;
    if (p.data && p.data.slots && p.data.slots.length) {
      p.data.days = p.data.days || DAYS;
      p.data.slots.forEach(function (s) { if (!s.tasks) s.tasks = {}; });
      state.data = p.data;
    }
    if (p.progress) {
      state.progress = Object.assign(state.progress, p.progress);
      state.progress.checks = state.progress.checks || {};
      state.progress.notes = state.progress.notes || [];
      state.progress.milestones = state.progress.milestones || {};
      state.progress.mood = state.progress.mood || {};
    }
    if (p.settings) {
      state.settings = Object.assign(state.settings, p.settings);
      document.documentElement.setAttribute("data-theme", state.settings.theme || "light");
      $("#brandName").textContent = state.settings.name;
    }
  }

  function initState() {
    var d = loadJSON(K_DATA, null);
    if (!d || !d.slots || !d.slots.length) d = clone({ meta: C.meta, days: C.days, slots: C.slots });
    // 兼容旧版本数据
    d.days = d.days || DAYS;
    d.slots.forEach(function (s) { if (!s.tasks) s.tasks = {}; });
    state.data = d;

    var s = loadJSON(K_SET, null);
    if (s) state.settings = Object.assign(state.settings, s);
    if (state.data.meta && state.data.meta.name) state.settings.name = state.settings.name || state.data.meta.name;

    var p = loadJSON(K_PROG, null);
    if (p) state.progress = Object.assign(state.progress, p);
    state.progress.checks = state.progress.checks || {};
    state.progress.notes = state.progress.notes || [];
    state.progress.milestones = state.progress.milestones || {};
    state.progress.mood = state.progress.mood || {};

    state.weather = loadJSON(K_WX, null);
    document.documentElement.setAttribute("data-theme", state.settings.theme || "light");
  }

  /* ============ 日程推算 ============ */

  function buildDayEvents(dayIndex) {
    var day = DAYS[dayIndex];
    var out = [];
    state.data.slots.forEach(function (slot, si) {
      var raw = (slot.tasks && slot.tasks[day]) || [];
      if (!raw.length) return;
      var slotStart = toMin(slot.start) || toMin(slot.time);
      var slotEnd = toMin(slot.end) || (slotStart + 30);

      var items = raw.map(function (t, ti) {
        var s = null, e = null, exp = false;
        var m = /^\s*(\d{1,2}:\d{2})\s*[-—~至]\s*(\d{1,2}:\d{2})\s*$/.exec(t.time || "");
        if (m) { s = toMin(m[1]); e = toMin(m[2]); exp = true; }
        return {
          slotIndex: si, taskIndex: ti, icon: t.icon || "⭐", text: t.text || "未命名",
          category: t.category || classify(t.icon, t.text),
          start: s, end: e, explicit: exp
        };
      });

      var ex = items.filter(function (x) { return x.explicit; }).sort(function (a, b) { return a.start - b.start; });
      var non = items.filter(function (x) { return !x.explicit; });
      var gaps = [], cursor = slotStart;
      ex.forEach(function (x) {
        if (x.start > cursor) gaps.push({ s: cursor, e: x.start });
        cursor = Math.max(cursor, x.end);
      });
      if (slotEnd > cursor) gaps.push({ s: cursor, e: slotEnd });

      if (!gaps.length) {
        if (non.length === 1) { non[0].start = slotStart; non[0].end = slotEnd; }
        else if (non.length > 1) {
          var span = (slotEnd - slotStart) / non.length;
          non.forEach(function (x, i) { x.start = slotStart + i * span; x.end = slotStart + (i + 1) * span; });
        }
      } else {
        non.forEach(function (x, i) { var g = gaps[Math.min(i, gaps.length - 1)]; x.start = g.s; x.end = g.e; });
      }
      out = out.concat(items);
    });
    return out.sort(function (a, b) { return a.start - b.start; });
  }

  function nowInfo(dayIndex, nowMin) {
    var evs = buildDayEvents(dayIndex);
    var covering = evs.filter(function (e) { return nowMin >= e.start && nowMin < e.end; });
    var current = null;
    if (covering.length) {
      covering.sort(function (a, b) {
        if (a.explicit !== b.explicit) return a.explicit ? -1 : 1;
        return b.start - a.start;
      });
      current = covering[0];
    }
    var next = evs.filter(function (e) { return e.start > nowMin; })[0] || null;
    var nextDay = null;
    if (!next) {
      var nd = (dayIndex + 1) % 7;
      var nev = buildDayEvents(nd);
      if (nev.length) { next = nev[0]; nextDay = nd; }
    }
    return { events: evs, current: current, next: next, nextDayIndex: nextDay };
  }

  function taskKey(ev) { return ev.slotIndex + "-" + ev.taskIndex; }
  function isChecked(dateStr, ev) {
    var day = state.progress.checks[dateStr];
    return !!(day && day[taskKey(ev)]);
  }
  function toggleCheck(dateStr, ev) {
    var day = state.progress.checks[dateStr] || (state.progress.checks[dateStr] = {});
    var k = taskKey(ev);
    if (day[k]) delete day[k]; else day[k] = 1;
    saveProg();
    return !!day[k];
  }
  function totalStars() {
    var n = 0;
    Object.keys(state.progress.checks).forEach(function (d) {
      n += Object.keys(state.progress.checks[d]).length;
    });
    return n;
  }
  function dayDoneCount(dateStr) {
    var d = state.progress.checks[dateStr];
    return d ? Object.keys(d).length : 0;
  }
  function streak() {
    var n = 0, d = new Date();
    for (var i = 0; i < 400; i++) {
      var k = dateKey(d);
      if (dayDoneCount(k) >= 6) { n++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  }

  /* ============ 天气 ============ */

  function weatherView() {
    var w = state.weather;
    if (!w || !w.code && w.code !== 0) return { emoji: "⛅", temp: "--", desc: "点击设置城市", city: state.settings.city };
    var m = WMO[w.code] || ["⛅", "多云"];
    return { emoji: m[0], desc: m[1], temp: w.temp + "°", city: w.city, min: w.min, max: w.max };
  }

  function loadWeather() { renderWeatherChips(); }

  function renderWeatherChips() {
    var v = weatherView();
    var chip = $("#weatherChip");
    if (chip) {
      chip.querySelector(".wc-emoji").textContent = v.emoji;
      chip.querySelector(".wc-text b").textContent = v.temp;
      chip.querySelector(".wc-text i").textContent = v.city + " · " + v.desc;
    }
    var sw = $("#saverWeather");
    if (sw) {
      sw.querySelector(".sw-emoji").textContent = v.emoji;
      sw.querySelector(".sw-temp").textContent = v.temp;
      sw.querySelector(".sw-desc").textContent = v.city + " " + v.desc + (v.max != null ? " " + v.min + "~" + v.max + "°" : "");
    }
  }

  /* ============ 通用渲染 ============ */

  function render() {
    state.isPhone = isPhoneNow();
    $("#brandName").textContent = state.settings.name;
    $$("[data-view]").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === state.view);
    });
    var root = $("#viewRoot");
    if (state.view === "week") root.innerHTML = state.isPhone ? viewWeekMobile() : viewWeek();
    else if (state.view === "day") root.innerHTML = viewDay();
    else if (state.view === "growth") root.innerHTML = viewGrowth();
    else if (state.view === "fun") root.innerHTML = viewFun();
    else root.innerHTML = viewSettings();
    if (state.view === "fun") setTimeout(setupMemoryGame, 20);
  }

  /** 切换到某一天的日视图，并滚动到当前项目 */
  function goDay(idx) {
    state.view = "day";
    state.selDay = idx;
    render();
    setTimeout(autoScrollNow, 80);
  }

  /* ---------- 周视图 ---------- */

  function viewWeek() {
    var today = weekdayIndex(new Date());
    var now = new Date();
    var ni = nowInfo(today, now.getHours() * 60 + now.getMinutes());
    var nowSlot = ni.current ? ni.current.slotIndex : -1;

    var html = '<div class="view-head">'
      + '<div><h1>📅 一周课程表</h1><div class="sub">点击右上角「编辑课程表」可以修改内容与图标 · 彩色边框代表课程类型</div></div>'
      + '<div class="spacer"></div>'
      + '<button class="btn-ghost" id="editToggle">' + (state.editMode ? "✅ 完成编辑" : "✏️ 编辑课程表") + '</button>'
      + '</div>';

    html += '<div class="week-wrap' + (state.editMode ? " editing" : "") + '"><div class="week-grid">';

    // 表头
    html += '<div class="wg-head wg-corner">时间</div>';
    DAYS.forEach(function (d, i) {
      html += '<div class="wg-head' + (i === today ? " is-today" : "") + '">' + d
        + '<small>' + (i === today ? "今天" : (i >= 5 ? "周末" : "上课日")) + '</small></div>';
    });

    // 行
    state.data.slots.forEach(function (slot, si) {
      html += '<div class="wg-time" data-slot="' + si + '" title="' + (state.editMode ? "点击修改时间段" : "") + '">'
        + esc(slot.time || (slot.start + "-" + slot.end))
        + (state.editMode ? '<span class="edit-hint">点击修改</span>' : '')
        + '</div>';
      DAYS.forEach(function (day, di) {
        var tasks = (slot.tasks && slot.tasks[day]) || [];
        var cls = "wg-cell";
        if (di === today) cls += " is-today";
        if (di === today && si === nowSlot) cls += " is-now";
        html += '<div class="' + cls + '" data-slot="' + si + '" data-day="' + esc(day) + '">';
        if (!tasks.length) {
          html += state.editMode ? '<div class="wg-add">+ 添加项目</div>' : '';
        } else {
          tasks.forEach(function (t, ti) {
            var cat = t.category || classify(t.icon, t.text);
            html += '<div class="task-chip cat-' + cat + '" style="--cat:' + CAT_COLOR[cat] + '" data-slot="' + si + '" data-day="' + esc(day) + '" data-task="' + ti + '">'
              + '<span class="tc-icon">' + esc(t.icon) + '</span>'
              + '<span class="tc-body"><span class="tc-title">' + esc(t.text) + '</span>'
              + (t.time ? '<span class="tc-time">' + esc(t.time) + '</span>' : '')
              + '</span></div>';
          });
        }
        html += '</div>';
      });
    });
    html += '</div></div>';

    // 图例
    html += '<div class="legend">' + Object.keys(CAT_NAME).map(function (k) {
      return '<span><i style="background:' + CAT_COLOR[k] + '"></i>' + CAT_NAME[k] + '</span>';
    }).join("") + '<span>⏱️ 当前时间：' + minToStr(now.getHours() * 60 + now.getMinutes()) + '</span></div>';

    return html;
  }

  /* ---------- 手机版周视图：每日卡片概览 ---------- */

  function viewWeekMobile() {
    var today = weekdayIndex(new Date());
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var ni = nowInfo(today, nowMin);
    var nowKey = ni.current ? ni.current.slotIndex + "-" + ni.current.taskIndex : "";

    var html = '<div class="view-head">'
      + '<div><h1>📅 一周课程表</h1><div class="sub">点任意一天查看完整日程</div></div>'
      + '<div class="spacer"></div>'
      + '<button class="btn-ghost" id="editFromWeek">✏️ 编辑</button>'
      + '</div><div class="m-week">';

    DAYS.forEach(function (day, di) {
      var evs = buildDayEvents(di);
      var d = new Date();
      d.setDate(d.getDate() + (di - today));
      var hi = evs.filter(function (e) { return e.category !== "life" && e.category !== "play"; });
      var rows = hi.length ? hi : evs.slice(0, 3);
      var rest = evs.length - rows.length;

      html += '<section class="m-day' + (di === today ? " is-today" : "") + '" data-day-idx="' + di + '">'
        + '<div class="m-day-head"><b>' + day + '</b><span class="m-date">'
        + (d.getMonth() + 1) + "/" + d.getDate() + '</span>'
        + (di === today ? '<span class="m-today-tag">今天</span>' : '')
        + '<span class="m-count">' + evs.length + ' 项</span></div>';

      if (!evs.length) {
        html += '<div class="m-empty">这一天还没有安排</div>';
      } else {
        html += '<div class="m-rows">';
        rows.forEach(function (e) {
          var isNow = di === today && (e.slotIndex + "-" + e.taskIndex) === nowKey;
          html += '<div class="m-row' + (isNow ? " is-now" : "") + '" style="--cat:' + CAT_COLOR[e.category] + '">'
            + '<span class="m-time">' + minToStr(e.start) + '</span>'
            + '<span class="m-ico">' + esc(e.icon) + '</span>'
            + '<span class="m-txt">' + esc(e.text) + '</span></div>';
        });
        html += '</div><div class="m-more">'
          + (rest > 0 ? '另有 ' + rest + ' 项日常作息' : '共 ' + evs.length + ' 项安排')
          + '<span class="m-go">查看完整日程 ›</span></div>';
      }
      html += '</section>';
    });

    return html + '</div>';
  }

  /* ---------- 日视图 ---------- */

  function viewDay() {
    var today = weekdayIndex(new Date());
    var di = state.selDay;
    var day = DAYS[di];
    var d = new Date();
    if (di !== today) {
      var diff = di - today;
      d = new Date(); d.setDate(d.getDate() + diff);
    }
    var dk = dateKey(d);
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var evs = buildDayEvents(di);
    var shownMin = di === today ? nowMin : -1;
    var ni = nowInfo(di, shownMin);

    var doneN = 0;
    evs.forEach(function (e) { if (isChecked(dk, e)) doneN++; });
    var pct = evs.length ? Math.round(doneN / evs.length * 100) : 0;

    var html = '<div class="view-head">'
      + '<div><h1>🕐 ' + day + '日程</h1><div class="sub">' + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · 共 " + evs.length + " 个项目 · 点击右侧圆圈可打卡收集 ⭐</div></div>"
      + '<div class="spacer"></div>'
      + '<button class="btn-ghost" id="editToggle">' + (state.editMode ? "✅ 完成编辑" : "✏️ 编辑课程表") + '</button>'
      + '</div>';

    // 日期选择
    html += '<div class="day-pills">';
    DAYS.forEach(function (nm, i) {
      var dd = new Date(); dd.setDate(dd.getDate() + (i - today));
      html += '<button class="day-pill' + (i === di ? " active" : "") + '" data-day-idx="' + i + '">'
        + '<b>' + nm + '</b><i>' + (dd.getMonth() + 1) + "/" + dd.getDate() + '</i>'
        + (i === today ? '<span class="dot"></span>' : '') + '</button>';
    });
    html += '</div>';

    html += '<div class="day-layout">';

    // 时间轴
    html += '<div class="timeline' + (state.editMode ? " editing" : "") + '">';
    if (state.editMode) html += '<div class="edit-tip">✏️ 编辑中：点下方任意一张卡片可修改内容与图标</div>';
    if (!evs.length) html += '<div class="note-empty">这一天还没有安排，点下方按钮添加吧～</div>';
    evs.forEach(function (e) {
      var checked = isChecked(dk, e);
      var cls = "tl-card";
      if (di === today && ni.current && ni.current.slotIndex === e.slotIndex && ni.current.taskIndex === e.taskIndex) cls += " is-now";
      else if (di === today && e.end <= nowMin) cls += " is-past";
      var cat = e.category;
      html += '<div class="tl-item">'
        + '<div class="tl-time">' + minToStr(e.start) + '<small>' + minToStr(e.end) + '</small></div>'
        + '<div class="tl-time-wrap"><div class="tl-line"><span class="tl-dot" style="background:' + CAT_COLOR[cat] + '"></span></div></div>'
        + '<div class="' + cls + '" style="--cat:' + CAT_COLOR[cat] + '" data-slot="' + e.slotIndex + '" data-task="' + e.taskIndex + '">';
      if (di === today && cls.indexOf("is-now") > -1) html += '<span class="now-badge">进行中</span>';
      html += '<div class="tlc-icon">' + esc(e.icon) + '</div>'
        + '<div class="tlc-body"><div class="tlc-title">' + esc(e.text) + '</div>'
        + '<div class="tlc-time">' + minToStr(e.start) + " - " + minToStr(e.end) + " · " + durText(e.end - e.start) + '</div>';
      if (di === today && cls.indexOf("is-now") > -1) {
        var p = Math.min(100, Math.max(0, (nowMin - e.start) / (e.end - e.start) * 100));
        html += '<div class="now-progress"><i style="width:' + p.toFixed(0) + '%"></i></div>'
          + '<div class="tlc-count">还剩 ' + Math.max(0, Math.round(e.end - nowMin)) + ' 分钟';
        if (ni.next) html += ' · 下一项 ' + esc(ni.next.text) + ' ' + minToStr(ni.next.start);
        html += '</div>';
      }
      html += '</div>'
        + '<button class="check-btn' + (checked ? " checked" : "") + '" data-check="1" data-slot="' + e.slotIndex + '" data-task="' + e.taskIndex + '">' + (checked ? "✓" : "") + '</button>'
        + '</div></div>';
    });
    if (state.editMode) html += '<button class="tl-add" id="tlAdd">＋ 在「' + day + '」添加项目</button>';
    html += '</div>';

    // 侧栏
    html += '<aside>';
    html += '<div class="side-card"><h3>🏁 今日完成度</h3>'
      + '<div class="progress-bar"><i style="width:' + pct + '%"></i></div>'
      + '<div class="progress-text"><span>已完成 ' + doneN + " / " + evs.length + ' 项</span><span>' + pct + '%</span></div>'
      + '<div class="star-row"><span class="num">' + totalStars() + '</span><span>⭐ 累计星星</span></div>'
      + '<div class="badges">' + BADGES.map(function (b) {
        var on = totalStars() >= b.need;
        return '<span class="badge' + (on ? "" : " off") + '">' + b.icon + " " + b.name + '</span>';
      }).join("") + '</div></div>';

    html += '<div class="side-card"><h3>😊 今天的心情</h3><div class="mood-row">'
      + MOODS.map(function (m) {
        var on = state.progress.mood[dk] === m.e;
        return '<button class="mood-btn' + (on ? " active" : "") + '" data-mood="' + m.e + '">' + m.e + '<small>' + m.t + '</small></button>';
      }).join("") + '</div></div>';

    html += '<div class="side-card"><h3>⏱️ 阅读计时器</h3>'
      + '<div class="timer-face"><div class="t-num" id="timerNum">' + fmtTimer(state.timer.sec) + '</div>'
      + '<div class="t-label">每天 20 分钟，读完记得打卡 📖</div></div>'
      + '<div class="timer-actions"><button class="btn-primary btn-sm" id="timerStart">' + (state.timer.running ? "⏸ 暂停" : "▶️ 开始") + '</button>'
      + '<button class="btn-ghost btn-sm" id="timerReset">↺ 归零</button></div></div>';

    html += '<div class="side-card"><h3>🔥 连续打卡</h3><div class="mini-grid">'
      + '<div class="mini"><b>' + streak() + '</b><small>连续天数</small></div>'
      + '<div class="mini"><b>' + (state.progress.notes.length) + '</b><small>成长记录</small></div>'
      + '</div></div>';

    html += '</aside></div>';
    return html;
  }

  function fmtTimer(sec) {
    return pad(Math.floor(sec / 60)) + ":" + pad(sec % 60);
  }
  function autoScrollNow() {
    var el = $(".tl-card.is-now");
    if (el && el.scrollIntoView) { try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {} }
  }

  /* ---------- 成长页 ---------- */

  function viewGrowth() {
    var html = '<div class="view-head"><div><h1>🌱 成长跟踪</h1>'
      + '<div class="sub">' + state.settings.name + ' · 5 岁阶段 · 勾选已达成的小目标，随时查看进步</div></div></div>';

    html += '<div class="grid-2">';

    C.milestones.forEach(function (g) {
      var doneN = 0;
      g.items.forEach(function (_, i) { if ((state.progress.milestones[g.key] || {})[i]) doneN++; });
      html += '<div class="card"><h3>' + g.icon + " " + esc(g.title)
        + '<span class="spacer" style="flex:1"></span><span style="font-size:12.5px;color:var(--muted)">' + doneN + "/" + g.items.length + '</span></h3>'
        + '<div class="card-sub">点击条目即为达成，会自动记录日期</div><ul class="ms-list">';
      g.items.forEach(function (it, i) {
        var rec = (state.progress.milestones[g.key] || {})[i];
        html += '<li class="ms-item' + (rec ? " on" : "") + '" data-ms="' + g.key + '" data-mi="' + i + '">'
          + '<span class="ms-box">' + (rec ? "✓" : "") + '</span>'
          + '<span class="ms-text">' + esc(it) + (rec ? '<span class="ms-date">' + esc(rec) + '</span>' : '') + '</span></li>';
      });
      html += '</ul></div>';
    });
    html += '</div>';

    html += '<div class="card" style="margin-top:16px"><h3>📚 5-6 岁阶段学习计划建议</h3>'
      + '<div class="card-sub">按“幼小衔接”节奏，重在习惯与兴趣，不追求超前</div>'
      + '<div class="grid-2">' + C.plans.map(function (p) {
        return '<div class="plan-card" style="--cat:' + (CAT_COLOR[p.color] || CAT_COLOR.play) + '">'
          + '<h4>' + p.icon + " " + esc(p.title) + '</h4>'
          + '<div class="freq">建议频率：' + esc(p.freq) + '</div>'
          + '<ul>' + p.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul></div>';
      }).join("") + '</div></div>';

    html += '<div class="card" style="margin-top:16px"><h3>📝 观察记录</h3>'
      + '<div class="card-sub">记下她今天的小进步、有趣的话、需要关注的地方</div>'
      + '<textarea class="note-area" id="noteInput" placeholder="例如：今天自己系好了鞋带，特别开心；跳绳能连续跳 5 个了……"></textarea>'
      + '<div class="modal-actions"><button class="btn-primary" id="noteAdd">保存记录</button></div>'
      + '<div style="margin-top:14px">';
    if (!state.progress.notes.length) html += '<div class="note-empty">还没有记录，写下第一条吧 ✍️</div>';
    else html += state.progress.notes.slice().reverse().slice(0, 30).map(function (n, idx) {
      var realIdx = state.progress.notes.length - 1 - idx;
      return '<div class="note-item"><div class="n-date">' + esc(n.date) + ' <button class="btn-ghost btn-sm btn-danger" data-note-del="' + realIdx + '" style="float:right;padding:2px 8px">删除</button></div>'
        + '<div class="n-text">' + esc(n.text) + '</div></div>';
    }).join("");
    html += '</div></div>';
    return html;
  }

  /* ---------- 玩法页 ---------- */

  function viewFun() {
    var stars = totalStars();
    var html = '<div class="fun-hero"><h2>嗨，' + esc(state.settings.name) + '！一起来玩吧 🎉</h2>'
      + '<p>完成日程打卡就能收集星星，星星越多，解锁的勋章越多哦～</p>'
      + '<div class="flowers">🦄</div></div>';

    html += '<div class="grid-2">';

    // 口算小闯关
    html += '<div class="card game-card"><h3>🧮 口算小闯关</h3>'
      + '<div class="card-sub">一次 10 题，答对就有星星，慢慢算不用急～</div>'
      + '<div id="mathStage">' + mathStageHTML() + '</div></div>';

    // 认字找图
    html += '<div class="card game-card"><h3>📚 认字找图</h3>'
      + '<div class="card-sub">幼小衔接常见词：生活自理、上学准备、认字、数学、安全……</div>'
      + '<div id="wordStage">' + wordStageHTML() + '</div></div>';

    // 故事接龙
    html += '<div class="card game-card"><h3>🎲 故事接龙</h3>'
      + '<div class="card-sub">抽三张卡，编一个小故事讲给爸爸妈妈听</div>'
      + '<div id="storyStage">' + storyStageHTML() + '</div></div>';

    // 呼吸放松
    html += '<div class="card"><h3>🫧 深呼吸放松</h3>'
      + '<div class="card-sub">跟着圆圈一起吸气、呼气，睡前做 4 次，心情会变好</div>'
      + '<div class="breathe-stage"><div class="breathe-circle" id="breatheCircle">准备好了吗？<br>点下面开始</div></div>'
      + '<div class="timer-actions"><button class="btn-primary" id="breatheBtn">开始深呼吸</button></div></div>';

    // 记忆翻牌
    html += '<div class="card"><h3>🧠 记忆翻翻乐</h3>'
      + '<div class="card-sub">翻开两张一样的卡片就能配对成功～</div>'
      + '<div id="memoryBoard" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:0 auto"></div>'
      + '<div class="timer-actions"><span style="font-size:12.5px;color:var(--muted)" id="memStat">步数 0 · 配对 0/6</span>'
      + '<button class="btn-ghost btn-sm" id="memReset">重来一局</button></div></div>';

    // 奖励墙
    html += '<div class="card"><h3>🏆 我的奖励墙</h3>'
      + '<div class="card-sub">当前共有 <b style="color:var(--c-study)">' + stars + '</b> 颗星星</div>'
      + '<div class="reward-grid">' + BADGES.map(function (b) {
        var on = stars >= b.need;
        return '<div class="reward' + (on ? " on" : " locked") + '"><div class="r-icon">' + b.icon + '</div>'
          + '<div class="r-name">' + b.name + '</div><div class="r-need">' + (on ? "已解锁" : "还需 " + (b.need - stars) + " ⭐") + '</div></div>';
      }).join("") + '</div></div>';

    // 鼓励语
    html += '<div class="card"><h3>💌 给宝贝的话</h3>'
      + '<div class="card-sub">点一下换一句～</div>'
      + '<div style="text-align:center;padding:22px 10px;font-size:19px;font-weight:700;line-height:1.6" id="quoteBox">' + esc(C.quotes[0]) + '</div>'
      + '<div class="timer-actions"><button class="btn-primary" id="quoteBtn">换一句</button></div></div>';

    html += '</div>';
    return html;
  }

  /* ---------- 设置页 ---------- */

  function viewSettings() {
    var html = '<div class="view-head"><div><h1>⚙️ 设置</h1><div class="sub">课程表、打卡与设置会自动保存到云数据库，同一家庭码的设备共享</div></div></div>';
    html += '<div class="grid-2">';

    html += '<div class="card"><h3>👧 基本信息</h3>'
      + '<div class="form-row"><label>宝贝昵称</label><input class="input" id="setName" value="' + esc(state.settings.name) + '"></div>'
      + '<div class="form-row"><label>所在城市</label><input class="input" id="setCity" value="' + esc(state.settings.city) + '">'
      + '<span class="hint">保留城市设置；实时天气暂不可用</span></div>'
      + '<div class="form-row"><label>主题</label><select class="input" id="setTheme">'
      + '<option value="light"' + (state.settings.theme === "light" ? " selected" : "") + '>浅色 · 明亮</option>'
      + '<option value="dark"' + (state.settings.theme === "dark" ? " selected" : "") + '>深色 · 护眼</option></select></div>'
      + '<div class="form-row"><label>自动进入屏保</label><select class="input" id="setIdle">'
      + [0, 1, 3, 5, 10].map(function (m) {
        return '<option value="' + m + '"' + (state.settings.idle === m ? " selected" : "") + '>' + (m === 0 ? "关闭" : m + " 分钟无操作") + '</option>';
      }).join("") + '</select></div>'
      + '<div class="form-row"><label>家庭码</label><input class="input" id="setFamily" value="' + esc(state.settings.familyCode || DEFAULT_FAMILY) + '">'
      + '<span class="hint">同一家庭码的设备共用一份课程表；iPad / 手机 / 电脑填同一个码即可自动同步</span></div>'
      + '<div class="modal-actions"><button class="btn-primary" id="setSave">保存设置</button></div></div>';

    html += '<div class="card"><h3>☁️ 云同步（多设备共享）</h3>'
      + '<div class="card-sub">状态：<b id="cloudStatus">' + esc(cloudStatusText()) + '</b>'
      + (cloud.err ? '<br><span style="color:var(--muted)">原因：' + esc(cloud.err) + '</span>' : '')
      + '<br><span style="color:var(--muted)">家庭码：<b>' + esc(cloud.code) + '</b>'
      + ' · 传输：' + (cloud.mode === "rest" ? "Tiana 数据库" : "未知")
      + (cloud.http ? ' · 最近返回 HTTP ' + cloud.http : '') + '</span>'
      + '<br><span style="color:var(--muted)">自动同步：<b>' + (cloudAuto() ? "已开启" : "已关闭") + '</b>'
      + (cloud.lastAt ? ' · 最近同步：' + esc(syncTimeText(cloud.lastAt)) : ' · 尚未同步过') + '</span></div>'
      + '<div class="form-row"><label>自动同步</label><select class="input" id="setAutoSync">'
      + '<option value="1"' + (cloudAuto() ? " selected" : "") + '>开启（推荐）</option>'
      + '<option value="0"' + (!cloudAuto() ? " selected" : "") + '>关闭（只在手动点击时同步）</option></select>'
      + '<span class="hint">开启后：改课程表 / 打卡 / 保存设置会自动上传；打开或刷新页面、回到前台、网络恢复时会自动拉取云端最新数据</span></div>'
      + '<div class="modal-actions" style="margin-top:10px">'
      + '<button class="btn-primary btn-sm" id="cloudUp">⬆️ 立即上传到云端</button>'
      + '<button class="btn-ghost btn-sm" id="cloudDown">⬇️ 从云端恢复</button>'
      + '<button class="btn-ghost btn-sm" id="cloudDiag">🔍 检测云端连通性</button></div>'
      + '<ul style="font-size:13px;line-height:1.9;padding-left:18px;color:var(--text);margin-top:10px">'
      + '<li>课程表、打卡星星、设置都会<b>自动保存到云数据库</b>，换设备 / 清缓存都不会丢</li>'
      + '<li>打开或刷新页面会自动拉取云端数据；哪台设备最新就用哪台的</li>'
      + '<li>写入结果未确认时请检查云端记录后再操作</li>'
      + '</ul></div>';

    html += '<div class="card"><h3>💾 课程表数据</h3>'
      + '<div class="card-sub">当前共 ' + state.data.slots.length + ' 个时间段</div>'
      + '<div class="form-row"><label>导出备份</label><button class="btn-ghost" id="exportBtn">⬇️ 导出 JSON</button>'
      + '<span class="hint">保存到本地，可分享给其他设备</span></div>'
      + '<div class="form-row"><label>导入数据</label><button class="btn-ghost" id="importBtn">⬆️ 选择文件导入</button>'
      + '<input type="file" id="importFile" accept=".json,application/json" hidden></div>'
      + '<div class="form-row"><label>恢复默认</label><button class="btn-ghost btn-danger" id="resetData">♻️ 恢复初始课程表</button></div>'
      + '<div class="form-row"><label>清空进度</label><button class="btn-ghost btn-danger" id="resetProg">🧹 清空打卡与记录</button></div>'
      + '</div>';

    html += '<div class="card"><h3>📲 装到手机 / 平板上</h3>'
      + '<div class="card-sub">可在浏览器中全屏显示，使用时需要网络连接</div>'
      + (state.installEvt ? '<div class="form-row"><label>一键安装</label><button class="btn-primary btn-sm" id="installBtn">📲 安装应用</button></div>' : '')
      + '<div class="form-row"><label>全屏显示</label><button class="btn-ghost btn-sm" data-fs>⛶ 进入全屏</button><span class="hint">隐藏浏览器地址栏</span></div>'
      + '<ul style="font-size:13px;line-height:1.9;padding-left:18px;color:var(--text);margin-top:8px">'
      + '<li><b>iPhone / iPad</b>：用 Safari 打开 → 分享 → 添加到主屏幕</li>'
      + '<li><b>安卓手机 / 平板</b>：用 Chrome 打开 → 右上角菜单 → 安装应用</li>'
      + '</ul></div>';

    html += '<div class="card"><h3>ℹ️ 使用小贴士</h3><ul style="font-size:13.5px;line-height:1.9;padding-left:18px;color:var(--text)">'
      + '<li>手机上是「每日卡片」浏览，点任意一天进入完整日程；在日视图里左右滑动可以切换星期</li>'
      + '<li>屏保模式：点右上角「🖥️ 屏保」，显示时钟、当前与下一个项目；点任意处或按 Esc 退出</li>'
      + '<li>修改课程表：点「✏️ 编辑」，再点任意卡片/格子即可改内容、图标、颜色与所属时间段</li>'
      + '<li>打卡收集星星：在日视图点右侧圆圈，累计星星可解锁玩法页的勋章</li>'
      + '<li>口算小闯关：玩法页里选难度（10 以内加法 / 减法 / 20 以内混合），一次 10 题；电脑上可直接按 1~4 选答案，最好成绩会记录</li>'
      + '<li>建议把本页在平板或电视上全屏打开，当作家庭作息屏使用</li>'
      + '</ul></div>';

    html += '</div>';
    return html;
  }

  /* ============ 编辑相关 ============ */

  var editCtx = { slot: 0, day: DAYS[0], task: -1, icon: "⭐", iconTab: 0, category: "play" };

  function openModal(html) {
    $("#modal").innerHTML = '<div class="modal-handle"></div>' + html;
    $("#modalMask").hidden = false;
  }
  function closeModal() { $("#modalMask").hidden = true; }

  function openTaskEditor(slotIndex, day, taskIndex) {
    var slot = state.data.slots[slotIndex];
    var tasks = (slot.tasks[day] = slot.tasks[day] || []);
    var t = taskIndex >= 0 && tasks[taskIndex] ? tasks[taskIndex] : { icon: "⭐", text: "", time: "" };
    editCtx = {
      slot: slotIndex, day: day, task: taskIndex,
      icon: t.icon || "⭐", iconTab: editCtx.iconTab,
      category: t.category || classify(t.icon, t.text)
    };
    var html = '<h2>' + (taskIndex >= 0 ? "编辑项目" : "添加项目") + '</h2>'
      + '<div class="modal-sub">' + esc(day) + " · " + esc(slot.time || (slot.start + "-" + slot.end)) + '</div>'
      + '<div class="modal-field"><label>所属时间段</label>'
      + '<select class="input" id="edSlot" style="width:100%">'
      + state.data.slots.map(function (s, i) {
        return '<option value="' + i + '"' + (i === slotIndex ? " selected" : "") + '>'
          + esc(s.time || (s.start + "-" + s.end)) + '</option>';
      }).join("") + '</select></div>'
      + '<div class="modal-field"><label>项目名称</label>'
      + '<input class="input" id="edText" placeholder="例如：游泳课" value="' + esc(t.text || "") + '" style="width:100%"></div>'
      + '<div class="modal-field"><label>具体时间（可选）</label>'
      + '<input class="input" id="edTime" placeholder="例如：07:10-07:30，留空则用整段时间" value="' + esc(t.time || "") + '" style="width:100%"></div>'
      + '<div class="modal-field"><label>课程类型（决定颜色）</label><div class="cat-grid" id="catGrid">'
      + Object.keys(CAT_NAME).map(function (k) {
        return '<button class="cat-cell' + (editCtx.category === k ? " active" : "") + '" data-cat="' + k + '"><i style="background:' + CAT_COLOR[k] + '"></i>' + CAT_NAME[k] + '</button>';
      }).join("") + '</div></div>'
      + '<div class="modal-field"><label>选择图标</label><div class="icon-tabs" id="iconTabs">'
      + C.icons.map(function (g, i) {
        return '<button class="icon-tab' + (i === editCtx.iconTab ? " active" : "") + '" data-itab="' + i + '">' + esc(g.name) + '</button>';
      }).join("") + '</div><div class="icon-grid" id="iconGrid"></div></div>'
      + '<div class="modal-actions">'
      + (taskIndex >= 0 ? '<button class="btn-ghost btn-danger" id="edDel">🗑 删除此项</button>' : '')
      + '<span class="spacer"></span>'
      + '<button class="btn-ghost" id="edCancel">取消</button>'
      + '<button class="btn-primary" id="edSave">保存</button></div>';
    openModal(html);
    renderIconGrid();
    $("#edText").focus();
  }

  function renderIconGrid() {
    var g = C.icons[editCtx.iconTab];
    $("#iconGrid").innerHTML = g.list.map(function (e) {
      return '<button class="icon-cell' + (e === editCtx.icon ? " active" : "") + '" data-icon="' + e + '">' + e + '</button>';
    }).join("");
  }

  function openSlotEditor(slotIndex) {
    var slot = state.data.slots[slotIndex];
    editCtx.slot = slotIndex;
    var html = '<h2>修改时间段</h2><div class="modal-sub">修改后，未单独设定时间的项目会自动跟随</div>'
      + '<div class="modal-field"><label>开始时间</label><input class="input" id="slStart" value="' + esc(slot.start) + '" placeholder="06:50" style="width:100%"></div>'
      + '<div class="modal-field"><label>结束时间</label><input class="input" id="slEnd" value="' + esc(slot.end) + '" placeholder="07:30" style="width:100%"></div>'
      + '<div class="modal-actions"><span class="spacer"></span>'
      + '<button class="btn-ghost" id="slCancel">取消</button>'
      + '<button class="btn-primary" id="slSave">保存</button></div>';
    openModal(html);
  }

  /* ============ 屏保 ============ */

  var saverTimer = null, quoteTimer = null, idleTimer = null, quoteIdx = 0;

  /** 探测刘海/状态栏安全区（兼容 iOS 12 的 constant() 与新版的 env()） */
  function safeInset(side) {
    try {
      var d = document.createElement("div");
      d.style.position = "absolute";
      d.style.visibility = "hidden";
      d.style.height = "0";
      var prop = "padding-" + side;
      var v, declared = "";
      // 先尝试新版 env()，再回退旧版 constant()
      var list = [
        ["constant(safe-area-inset-" + side + ")", "env(safe-area-inset-" + side + ")"],
        ["calc(constant(safe-area-inset-" + side + ") + 0px)", "calc(env(safe-area-inset-" + side + ") + 0px)"]
      ];
      for (var i = 0; i < list.length; i++) {
        d.style.setProperty(prop, list[i][0]);
        d.style.setProperty(prop, list[i][1]);
        declared = d.style.getPropertyValue(prop);
        if (declared && declared.indexOf("constant") < 0 && declared.indexOf("env") < 0) break;
        if (declared.indexOf("env(") >= 0) break;
      }
      if (!document.body) return 0;
      document.body.appendChild(d);
      var cs = window.getComputedStyle ? window.getComputedStyle(d) : null;
      v = cs ? parseFloat(cs.getPropertyValue(prop)) : 0;
      document.body.removeChild(d);
      return isNaN(v) ? 0 : Math.max(0, v);
    } catch (e) { return 0; }
  }

  /** 强制铺满全屏：不依赖 CSS 的 inset / dvh / vh 等新特性，老设备（iOS 12）同样生效 */
  function forceSaverLayout() {
    var el = $("#saver");
    if (!el) return;
    var w = window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || 1024;
    var h = window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || 768;
    var narrow = Math.min(w, h) <= 767; // 手机视口
    var padX = (w < 520 ? 20 : 40);
    var padBase = (h < 620 ? 14 : 30);
    // 安全区：避免 iPhone 状态栏/灵动岛压住左上角日期，避免底部小黑条压住鼓励语
    var sTop = safeInset("top"), sBottom = safeInset("bottom"), sLeft = safeInset("left"), sRight = safeInset("right");
    var padTop = padBase + (sTop || 0);
    var padBtm = padBase + (sBottom || 0);
    try {
      el.removeAttribute("hidden");
      el.style.display = "flex";
      el.style.position = "fixed";
      el.style.top = "0px";
      el.style.left = "0px";
      el.style.right = "auto";
      el.style.bottom = "auto";
      el.style.width = w + "px";
      el.style.height = h + "px";
      el.style.minHeight = h + "px";
      el.style.zIndex = "9999";
      el.style.margin = "0";
      el.style.padding = padTop + "px " + (padX + (sRight || 0)) + "px " + padBtm + "px " + (padX + (sLeft || 0)) + "px";
      el.style.visibility = "visible";
      el.style.opacity = "1";
      el.style.overflow = "hidden";
      el.style.flexDirection = "column";
      el.style.boxSizing = "border-box";
      el.style.color = "#eaf0ff";
      el.style.backgroundColor = "#0a0f1f";
      el.style.backgroundImage = "radial-gradient(1200px 700px at 20% 10%, #1e2a5a, #0a0f1f 65%)";
      el.style.webkitTransform = "none";
      el.style.transform = "none";
    } catch (e) {}
    // 退出提示按钮：手机端（窄屏）直接隐藏，避免压住左上角日期/天气
    var ex = $("#saverExit");
    if (ex) {
      try {
        if (narrow) { ex.style.display = "none"; ex.style.visibility = "hidden"; }
        else {
          ex.style.display = "block";
          ex.style.visibility = "visible";
          ex.style.position = "absolute";
          ex.style.top = "auto";
          ex.style.left = "auto";
          ex.style.right = "20px";
          ex.style.bottom = (14 + (sBottom || 0)) + "px";
        }
      } catch (e2) {}
    }
  }

  /** 自愈：万一布局仍没铺满（被父级容器/层叠上下文影响），挪到 body 末尾再强制一次 */
  function saverSelfHeal() {
    var el = $("#saver");
    if (!el || el.hidden) return;
    var w = window.innerWidth || 1024, h = window.innerHeight || 768;
    var rect = el.getBoundingClientRect();
    if (rect.width < w * 0.7 || rect.height < h * 0.7) {
      try {
        if (el.parentNode !== document.body) document.body.appendChild(el);
        forceSaverLayout();
      } catch (e) {}
    }
  }

  function enterSaver() {
    var el = $("#saver");
    if (!el) return;
    try {
      el.hidden = false;
      forceSaverLayout();
      // 移到 body 末尾，避开祖先元素的层叠/裁剪影响
      if (el.parentNode !== document.body) document.body.appendChild(el);
      try { document.body.style.overflow = "hidden"; } catch (e) {}
    } catch (e) {
      toast("屏保打开失败：" + String((e && e.message) || e), "warn");
    }
    buildSky();
    tickSaver();
    clearInterval(saverTimer);
    saverTimer = setInterval(tickSaver, 1000);
    clearInterval(quoteTimer);
    quoteTimer = setInterval(function () {
      quoteIdx = (quoteIdx + 1) % C.quotes.length;
      var tip = $("#saverTip");
      tip.style.opacity = "0";
      setTimeout(function () { tip.textContent = C.quotes[quoteIdx]; tip.style.opacity = "1"; }, 400);
    }, 8000);
    $("#saverTip").textContent = C.quotes[quoteIdx];
    renderWeatherChips();
    // 布局自愈（部分老设备首帧样式未生效）
    setTimeout(saverSelfHeal, 60);
    setTimeout(saverSelfHeal, 400);
  }
  function exitSaver() {
    var el = $("#saver");
    if (el) { el.hidden = true; el.style.display = "none"; }
    try { document.body.style.overflow = ""; } catch (e) {}
    clearInterval(saverTimer); saverTimer = null;
    clearInterval(quoteTimer); quoteTimer = null;
    if (state.view === "week" || state.view === "day") render();
  }
  function buildSky() {
    var sky = $("#saverSky");
    if (sky.childElementCount) return;
    var pool = ["⭐", "✨", "🌙", "☁️", "🪐", "🌟", "🐣", "🎈", "⚽", "🎨", "📖", "🧸"];
    var html = "";
    for (var i = 0; i < 22; i++) {
      var s = (18 + Math.random() * 40).toFixed(0);
      html += '<span style="left:' + (Math.random() * 98).toFixed(1) + "%;bottom:-12vh;font-size:" + s + "px;animation-duration:"
        + (18 + Math.random() * 26).toFixed(0) + "s;animation-delay:-" + (Math.random() * 30).toFixed(0) + 's">'
        + pool[Math.floor(Math.random() * pool.length)] + '</span>';
    }
    sky.innerHTML = html;
  }

  function tickSaver() {
    var now = new Date();
    var hh = pad(now.getHours()), mm = pad(now.getMinutes()), ss = pad(now.getSeconds());
    var ct = $("#saverClock"); if (ct) ct.textContent = hh + ":" + mm;
    var cs = $("#saverSec"); if (cs) cs.textContent = state.settings.showSec ? ss : "";
    var wd = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][now.getDay()];
    var sd = $("#saverWeekday"); if (sd) sd.textContent = wd;
    var st = $("#saverDate");
    if (st) st.textContent = now.getFullYear() + " 年 " + (now.getMonth() + 1) + " 月 " + now.getDate() + " 日";

    var di = weekdayIndex(now);
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var ni = nowInfo(di, nowMin);

    // 当前
    if (ni.current) {
      var e = ni.current;
      $("#nowIcon").textContent = e.icon;
      $("#nowTitle").textContent = e.text;
      $("#nowRange").textContent = DAYS[di] + " " + minToStr(e.start) + " - " + minToStr(e.end) + " · " + durText(e.end - e.start);
      var p = Math.min(1, Math.max(0, (nowMin - e.start) / (e.end - e.start)));
      var C1 = 2 * Math.PI * 52;
      var fg = $("#ringFg");
      if (fg) { fg.style.strokeDasharray = C1; fg.style.strokeDashoffset = C1 * (1 - p); }
      $("#nowCountdown").textContent = "已进行 " + Math.round(p * 100) + "% · 还剩 " + Math.max(0, Math.round(e.end - nowMin)) + " 分钟";
    } else {
      $("#nowIcon").textContent = "🎈";
      $("#nowTitle").textContent = "自由时光";
      $("#nowRange").textContent = "现在没有固定安排，尽情玩耍吧";
      var fg2 = $("#ringFg"); if (fg2) fg2.style.strokeDashoffset = 2 * Math.PI * 52;
      $("#nowCountdown").textContent = "";
    }

    // 下一个
    if (ni.next) {
      var n = ni.next, isTmr = ni.nextDayIndex != null;
      $("#nextIcon").textContent = n.icon;
      $("#nextTitle").textContent = n.text;
      $("#nextRange").textContent = (isTmr ? "明天 · " : "") + minToStr(n.start) + " - " + minToStr(n.end) + " · " + durText(n.end - n.start);
      var wait = isTmr ? (24 * 60 - nowMin + n.start) : (n.start - nowMin);
      $("#nextCountdown").textContent = "还有 " + (wait >= 60 ? Math.floor(wait / 60) + " 小时 " + (wait % 60) + " 分" : Math.max(0, Math.round(wait)) + " 分钟") + " 开始";
    } else {
      $("#nextIcon").textContent = "😴";
      $("#nextTitle").textContent = "今天结束啦";
      $("#nextRange").textContent = "早点休息，明天见";
      $("#nextCountdown").textContent = "";
    }

    $("#saverStars").textContent = "⭐ " + totalStars();
  }

  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    var m = +state.settings.idle || 0;
    if (m > 0 && $("#saver").hidden) {
      idleTimer = setTimeout(function () { if ($("#saver").hidden) enterSaver(); }, m * 60 * 1000);
    }
  }

  /* ============ 记忆翻牌小游戏 ============ */

  var mem = { open: [], matched: 0, moves: 0, lock: false, board: [] };

  function setupMemoryGame() {
    var board = $("#memoryBoard");
    if (!board) return;
    var pool = ["🐣", "🦄", "🎈", "🍭", "🌈", "🐬"];
    var cards = pool.concat(pool).map(function (e) { return { e: e, open: false, done: false }; });
    for (var i = cards.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = cards[i]; cards[i] = cards[j]; cards[j] = t; }
    mem = { open: [], matched: 0, moves: 0, lock: false, board: cards };
    renderMemory();
  }
  function renderMemory() {
    var board = $("#memoryBoard");
    if (!board) return;
    board.innerHTML = mem.board.map(function (c, i) {
      var face = c.open || c.done ? c.e : "❓";
      return '<button class="icon-cell' + (c.done ? " active" : "") + '" data-mem="' + i + '" style="font-size:24px;aspect-ratio:1;background:var(--panel-2)">' + face + '</button>';
    }).join("");
    var st = $("#memStat");
    if (st) st.textContent = "步数 " + mem.moves + " · 配对 " + mem.matched + "/6";
  }
  function flipMem(i) {
    if (mem.lock) return;
    var c = mem.board[i];
    if (!c || c.open || c.done) return;
    c.open = true;
    mem.open.push(i);
    if (mem.open.length === 2) {
      mem.moves++;
      var a = mem.board[mem.open[0]], b = mem.board[mem.open[1]];
      if (a.e === b.e) {
        a.done = b.done = true; mem.matched++; mem.open = [];
        renderMemory();
        if (mem.matched === 6) toast("全部配对成功，太棒啦！🎉");
        return;
      }
      mem.lock = true;
      renderMemory();
      setTimeout(function () {
        a.open = b.open = false; mem.open = []; mem.lock = false; renderMemory();
      }, 700);
      return;
    }
    renderMemory();
  }

  /* ============ 口算小闯关 ============ */

  var MATH_TOTAL = 10;
  var mathG = { level: 1, idx: 0, correct: 0, wrong: 0, streak: 0, q: null, lock: false, done: false, fb: null };

  function mathBest() {
    var m = state.progress.math;
    return (m && m.best) || 0;
  }
  function mathRand(n) { return Math.floor(Math.random() * n); }

  /** 按难度出题：1=10以内加法 2=10以内减法 3=20以内加减混合 */
  function mathMakeQ(level) {
    var a, b, ans, op, ceil;
    if (level === 2) {
      ceil = 10;
      a = 2 + mathRand(ceil - 1);          // 2..10
      b = 1 + mathRand(a - 1);             // 1..a-1
      ans = a - b; op = "-";
    } else if (level === 3) {
      ceil = 20;
      if (mathRand(2)) {
        ans = 5 + mathRand(16);            // 5..20
        a = 1 + mathRand(ans - 1);
        b = ans - a; op = "+";
      } else {
        a = 6 + mathRand(15);              // 6..20
        b = 1 + mathRand(a - 1);
        ans = a - b; op = "-";
      }
    } else {
      ceil = 10;
      ans = 3 + mathRand(8);               // 3..10（避免 1+1 过简）
      a = 1 + mathRand(ans - 1);
      b = ans - a; op = "+";
    }
    // 4 个选项：正确答案 + 3 个接近的干扰项
    var opts = [ans], guard = 0, d, i, j, tmp;
    while (opts.length < 4 && guard++ < 120) {
      d = ans + (mathRand(2) ? 1 : -1) * (1 + mathRand(3));
      if (d < 0 || d > ceil + 2 || opts.indexOf(d) >= 0) continue;
      opts.push(d);
    }
    while (opts.length < 4) {
      d = mathRand(ceil + 1);
      if (opts.indexOf(d) < 0) opts.push(d);
    }
    for (i = opts.length - 1; i > 0; i--) { j = mathRand(i + 1); tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp; }
    return { a: a, b: b, op: op, ans: ans, opts: opts, ceil: ceil };
  }

  /** 圆点图示：帮 5 岁孩子把"数"看见（20 以内题不显示，避免太密） */
  function mathDotsHTML(q) {
    if (q.ceil > 10) return "";
    function dots(n, off) {
      var r = "", k;
      for (k = 0; k < n; k++) r += '<i class="' + (off ? "off" : "") + '"></i>';
      return r;
    }
    var inner = q.op === "+"
      ? dots(q.a) + '<b>+</b>' + dots(q.b)
      : dots(q.a - q.b) + dots(q.b, true) + '<span class="dot-op">拿走 ' + q.b + ' 个</span>';
    return '<div class="math-dots">' + inner + '</div>';
  }

  function mathStageHTML() {
    if (!mathG.q) mathG.q = mathMakeQ(mathG.level);
    var html = '<div class="math-levels">'
      + [[1, "10以内加法"], [2, "10以内减法"], [3, "20以内加减"]].map(function (x) {
        return '<button type="button" data-mathlv="' + x[0] + '"'
          + (mathG.level === x[0] ? ' class="active"' : "") + '>' + x[1] + '</button>';
      }).join("") + '</div>';

    if (mathG.done) {
      var face = mathG.correct >= 9 ? "🏆" : mathG.correct >= 7 ? "🎉" : "🌈";
      var say = mathG.correct >= 9 ? "⭐⭐⭐ 太厉害了！"
        : mathG.correct >= 7 ? "⭐⭐ 很棒哦！"
        : mathG.correct >= 5 ? "⭐ 有进步！" : "💪 再来一次会更好";
      return html + '<div class="math-result"><div class="res-emoji">' + face + '</div>'
        + '<div class="res-score">答对 ' + mathG.correct + " / " + MATH_TOTAL + '</div>'
        + '<div class="res-sub">' + say + '</div>'
        + '<div class="res-sub">最好成绩 ' + mathBest() + " / " + MATH_TOTAL + '</div>'
        + '<div class="timer-actions"><button type="button" class="btn-primary btn-sm" id="mathRestart">再来一局</button></div></div>';
    }

    var q = mathG.q, fb = mathG.fb;
    html += '<div class="math-top"><span>第 <b>' + (mathG.idx + 1) + '</b> / ' + MATH_TOTAL + ' 题</span>'
      + '<span>答对 <b>' + mathG.correct + '</b>' + (mathG.streak >= 2 ? ' · 连对 ' + mathG.streak : '') + '</span></div>'
      + '<div class="math-bar"><i style="width:' + Math.round(mathG.idx / MATH_TOTAL * 100) + '%"></i></div>'
      + '<div class="math-q">' + q.a + " " + (q.op === "+" ? "+" : "−") + " " + q.b + " = ?</div>"
      + mathDotsHTML(q)
      + '<div class="math-opts">' + q.opts.map(function (n) {
        var cls = "";
        if (fb) { if (n === q.ans) cls = "ok"; else if (n === fb.pick) cls = "bad"; }
        return '<button type="button" data-mathopt="' + n + '"' + (cls ? ' class="' + cls + '"' : "") + '>' + n + '</button>';
      }).join("") + '</div>'
      + '<div class="math-fb">' + (fb
        ? (fb.ok
          ? '<span class="ok">答对啦！' + (mathG.streak >= 3 ? "连对 " + mathG.streak + " 题，好厉害 ✨" : "真棒 👍") + '</span>'
          : '<span class="bad">差一点点，答案是 ' + q.ans + ' 哦</span>')
        : "") + '</div>';
    return html;
  }

  function mathRender() {
    var box = $("#mathStage");
    if (box) box.innerHTML = mathStageHTML();
  }

  function mathStart(level) {
    if (level) mathG.level = level;
    mathG.idx = 0; mathG.correct = 0; mathG.wrong = 0; mathG.streak = 0;
    mathG.lock = false; mathG.done = false; mathG.fb = null;
    mathG.q = mathMakeQ(mathG.level);
    mathRender();
  }

  function mathAnswer(n) {
    if (mathG.lock || mathG.done || !mathG.q) return;
    var q = mathG.q, ok = n === q.ans;
    mathG.lock = true;
    if (ok) { mathG.correct++; mathG.streak++; } else { mathG.wrong++; mathG.streak = 0; }
    mathG.fb = { ok: ok, pick: n };
    mathRender();
    setTimeout(function () {
      if (mathG.done) return;             // 期间用户切走了 / 重开了一局
      mathG.fb = null;
      if (mathG.idx >= MATH_TOTAL - 1) { mathFinish(); return; }
      mathG.idx++;
      mathG.q = mathMakeQ(mathG.level);
      mathG.lock = false;
      mathRender();
    }, ok ? 620 : 1200);
  }

  function mathFinish() {
    mathG.done = true; mathG.lock = false; mathG.fb = null;
    var p = state.progress;
    var m = p.math || { best: 0, plays: 0 };
    m.plays = (m.plays || 0) + 1;
    if (mathG.correct > (m.best || 0)) m.best = mathG.correct;
    m.last = dateKey(new Date());
    p.math = m;
    saveProg();
    mathRender();
    toast(mathG.correct >= 8
      ? "口算闯关完成！答对 " + mathG.correct + " 题，太棒了 🎉"
      : "做完啦，答对 " + mathG.correct + " 题，继续加油 💪");
  }

  /* ============ 认字找图 ============ */

  var WORD_TOTAL = 10;
  var wordG = { mode: 1, group: "", idx: 0, correct: 0, lock: false, done: false, q: null, fb: null };

  function wordAll() { return window.WORD_BANK || []; }

  /** 已认过的词数（答对过的不同词） */
  function wordKnown() {
    var s = (state.progress.words && state.progress.words.seen) || {};
    return Object.keys(s).length;
  }

  function wordPool() {
    var all = wordAll();
    if (!wordG.group) return all;
    var list = all.filter(function (x) { return x.g === wordG.group; });
    return list.length >= 4 ? list : all;
  }

  /** 出一题：正确答案 + 3 个同组干扰项 */
  function wordPickQ() {
    var pool = wordPool();
    var ans = pool[Math.floor(Math.random() * pool.length)];
    var opts = [ans], guard = 0;
    while (opts.length < 4 && guard++ < 300) {
      var c = pool[Math.floor(Math.random() * pool.length)];
      var dup = false;
      for (var i = 0; i < opts.length; i++) if (opts[i].w === c.w) dup = true;
      if (!dup) opts.push(c);
    }
    for (var j = opts.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1)), t = opts[j];
      opts[j] = opts[k]; opts[k] = t;
    }
    return { ans: ans, opts: opts };
  }

  function wordStageHTML() {
    if (!wordG.q) wordG.q = wordPickQ();
    var groups = (window.WORD_GROUPS || []);
    var html = '<div class="word-chips">'
      + '<button type="button" data-wordmode="1"' + (wordG.mode === 1 ? ' class="active"' : "") + '>看词选图</button>'
      + '<button type="button" data-wordmode="2"' + (wordG.mode === 2 ? ' class="active"' : "") + '>看图选词</button>'
      + '</div>'
      + '<div class="word-chips word-groups">'
      + '<button type="button" data-wordgroup=""' + (!wordG.group ? ' class="active"' : "") + '>全部</button>'
      + groups.map(function (g) {
        return '<button type="button" data-wordgroup="' + g.k + '"' + (wordG.group === g.k ? ' class="active"' : "") + '>' + g.n + '</button>';
      }).join("")
      + '</div>';

    if (wordG.done) {
      var face = wordG.correct >= 9 ? "🏅" : wordG.correct >= 7 ? "🎉" : "🌱";
      var say = wordG.correct >= 9 ? "⭐⭐⭐ 全都认识！"
        : wordG.correct >= 7 ? "⭐⭐ 认得很棒！"
        : wordG.correct >= 5 ? "⭐ 有进步！" : "🌱 慢慢来，多看几遍就记住啦";
      return html + '<div class="math-result"><div class="res-emoji">' + face + '</div>'
        + '<div class="res-score">答对 ' + wordG.correct + " / " + WORD_TOTAL + '</div>'
        + '<div class="res-sub">' + say + '</div>'
        + '<div class="res-sub">已认过 ' + wordKnown() + ' 个词 · 最好成绩 ' + wordBest() + " / " + WORD_TOTAL + '</div>'
        + '<div class="timer-actions"><button type="button" class="btn-primary btn-sm" id="wordRestart">再来一局</button></div></div>';
    }

    var q = wordG.q, fb = wordG.fb, ans = q.ans;
    html += '<div class="math-top"><span>第 <b>' + (wordG.idx + 1) + '</b> / ' + WORD_TOTAL + ' 题</span>'
      + '<span>答对 <b>' + wordG.correct + '</b> · 认过 ' + wordKnown() + ' 个</span></div>'
      + '<div class="math-bar"><i style="width:' + Math.round(wordG.idx / WORD_TOTAL * 100) + '%"></i></div>';

    if (wordG.mode === 1) {
      html += '<div class="word-ask"><div class="word-word">' + esc(ans.w) + '</div>'
        + '<div class="word-pinyin">' + esc(ans.p) + '</div></div>'
        + '<div class="word-opts emoji">' + q.opts.map(function (o, i) {
          var cls = "";
          if (fb) { if (o.w === ans.w) cls = "ok"; else if (i === fb.pick) cls = "bad"; }
          return '<button type="button" data-wordopt="' + i + '"' + (cls ? ' class="' + cls + '"' : "") + '>'
            + '<span class="wo-e">' + o.e + '</span></button>';
        }).join("") + '</div>';
    } else {
      html += '<div class="word-ask"><div class="word-emoji">' + ans.e + '</div>'
        + '<div class="word-pinyin">' + esc(ans.p) + '</div></div>'
        + '<div class="word-opts text">' + q.opts.map(function (o, i) {
          var cls = "";
          if (fb) { if (o.w === ans.w) cls = "ok"; else if (i === fb.pick) cls = "bad"; }
          return '<button type="button" data-wordopt="' + i + '"' + (cls ? ' class="' + cls + '"' : "") + '>'
            + '<span class="wo-w">' + esc(o.w) + '</span></button>';
        }).join("") + '</div>';
    }

    html += '<div class="math-fb">' + (fb
      ? (fb.ok
        ? '<span class="ok">对啦！' + esc(ans.w) + "（" + esc(ans.p) + "）</span>"
        : '<span class="bad">再看看，' + esc(ans.e) + " 是「" + esc(ans.w) + "」" + (wordG.mode === 2 ? "（" + esc(ans.p) + "）" : "") + '</span>')
      : "") + '</div>';
    return html;
  }

  function wordBest() {
    var w = state.progress.words;
    return (w && w.best) || 0;
  }

  function wordRender() {
    var box = $("#wordStage");
    if (box) box.innerHTML = wordStageHTML();
  }

  function wordStart() {
    wordG.idx = 0; wordG.correct = 0; wordG.lock = false; wordG.done = false;
    wordG.fb = null; wordG.q = wordPickQ();
    wordRender();
  }

  function wordSetMode(m) {
    if (wordG.mode === m) return;
    wordG.mode = m;
    wordStart();
  }

  function wordSetGroup(g) {
    wordG.group = g || "";
    wordStart();
  }

  function wordAnswer(i) {
    if (wordG.lock || wordG.done || !wordG.q) return;
    var q = wordG.q, picked = q.opts[i];
    if (!picked) return;
    var ok = picked.w === q.ans.w;
    wordG.lock = true;
    wordG.fb = { ok: ok, pick: i };
    if (ok) {
      wordG.correct++;
      // 记录"认过的词"
      var p = state.progress;
      var w = p.words || { best: 0, plays: 0, seen: {} };
      w.seen = w.seen || {};
      w.seen[q.ans.w] = (w.seen[q.ans.w] || 0) + 1;
      p.words = w;
      saveProg();
    }
    wordRender();
    setTimeout(function () {
      if (wordG.done) return;
      wordG.fb = null;
      if (wordG.idx >= WORD_TOTAL - 1) { wordFinish(); return; }
      wordG.idx++;
      wordG.q = wordPickQ();
      wordG.lock = false;
      wordRender();
    }, ok ? 680 : 1500);
  }

  function wordFinish() {
    wordG.done = true; wordG.lock = false; wordG.fb = null;
    var p = state.progress;
    var w = p.words || { best: 0, plays: 0, seen: {} };
    w.plays = (w.plays || 0) + 1;
    if (wordG.correct > (w.best || 0)) w.best = wordG.correct;
    w.last = dateKey(new Date());
    p.words = w;
    saveProg();
    wordRender();
    toast(wordG.correct >= 8
      ? "认字闯关完成！答对 " + wordG.correct + " 题 🎉"
      : "做完啦，答对 " + wordG.correct + " 题，再认一遍就记住啦 💪");
  }

  /* ============ 故事接龙 ============ */

  var storyS = { role: null, place: null, thing: null, opener: "", told: 0 };

  function storyPick(list, except) {
    var pool = (list || []).filter(function (x) { return !except || x.t !== except.t; });
    if (!pool.length) pool = list;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function storyDraw() {
    var b = window.STORY_BANK || { roles: [], places: [], things: [], openers: [] };
    storyS.role = storyPick(b.roles, storyS.role);
    storyS.place = storyPick(b.places, storyS.place);
    storyS.thing = storyPick(b.things, storyS.thing);
    storyS.opener = b.openers[Math.floor(Math.random() * b.openers.length)] || "从前有一个……";
    var st = $("#storyStage");
    if (st) st.innerHTML = storyStageHTML();
  }

  function storyCount() {
    return (state.progress.story && state.progress.story.count) || 0;
  }

  function storyStageHTML() {
    var b = window.STORY_BANK || { roles: [], places: [], things: [], openers: [] };
    if (!storyS.role) {
      storyS.role = storyPick(b.roles);
      storyS.place = storyPick(b.places);
      storyS.thing = storyPick(b.things);
      storyS.opener = b.openers[Math.floor(Math.random() * b.openers.length)] || "从前有一个……";
    }
    var cards = [
      { lab: "谁", o: storyS.role },
      { lab: "在哪里", o: storyS.place },
      { lab: "遇到了什么", o: storyS.thing }
    ];
    return '<div class="story-cards">' + cards.map(function (c) {
      return '<div class="story-card"><div class="sc-lab">' + c.lab + '</div>'
        + '<div class="sc-e">' + c.o.e + '</div>'
        + '<div class="sc-t">' + esc(c.o.t) + '</div></div>';
    }).join("") + '</div>'
      + '<div class="story-open">开头试试：<b>' + esc(storyS.opener) + '</b></div>'
      + '<ul class="story-hints">'
      + '<li>她叫什么名字呀？</li>'
      + '<li>她要去做什么呢？</li>'
      + '<li>后来怎么样了？</li>'
      + '</ul>'
      + '<div class="timer-actions">'
      + '<button type="button" class="btn-ghost btn-sm" id="storyDraw">🎲 换一组</button>'
      + '<button type="button" class="btn-primary btn-sm" id="storyDone">讲完啦 +1 ⭐</button>'
      + '</div>'
      + '<div class="story-count">已经讲了 <b>' + storyCount() + '</b> 个故事' + (storyCount() >= 10 ? " · 故事小达人 🏅" : "") + '</div>';
  }

  function storyDone() {
    var p = state.progress;
    var s = p.story || { count: 0 };
    s.count = (s.count || 0) + 1;
    s.last = dateKey(new Date());
    p.story = s;
    saveProg();
    storyS.told++;
    storyDraw();
    toast("讲得真好！第 " + s.count + " 个故事收好啦 ⭐");
  }

  /* ============ 呼吸放松 ============ */

  var breathe = { on: false, step: 0, timer: null };
  function toggleBreathe() {
    var circle = $("#breatheCircle");
    if (!circle) return;
    if (breathe.on) {
      breathe.on = false; clearInterval(breathe.timer); breathe.timer = null;
      circle.classList.remove("in");
      circle.innerHTML = "准备好了吗？<br>点下面开始";
      $("#breatheBtn").textContent = "开始深呼吸";
      return;
    }
    breathe.on = true; breathe.step = 0;
    $("#breatheBtn").textContent = "结束练习";
    var seq = [["吸气…… 慢慢来", "in"], ["屏住一下", "in"], ["呼气…… 放松", ""], ["再来一次", ""]];
    function step() {
      if (!breathe.on) return;
      var s = seq[breathe.step % seq.length];
      circle.innerHTML = s[0];
      circle.classList.toggle("in", s[1] === "in");
      breathe.step++;
    }
    step();
    breathe.timer = setInterval(step, 4000);
  }

  /* ============ 事件绑定 ============ */

  function bindGlobal() {
    document.addEventListener("click", function (e) {
      var t = e.target;

      // tab 切换
      var tab = t.closest("[data-view]");
      if (tab) {
        if (tab.dataset.view === "day") goDay(weekdayIndex(new Date()));
        else { state.view = tab.dataset.view; render(); }
        if (state.isPhone) { try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {} }
        return;
      }

      // 手机版周视图：点某天进日视图
      var mday = t.closest(".m-day");
      if (mday) { goDay(+mday.dataset.dayIdx); return; }
      if (t.closest("#editFromWeek")) {
        state.editMode = true;
        goDay(weekdayIndex(new Date()));
        toast("编辑模式已开启，点日程卡片即可修改");
        return;
      }

      // 编辑模式切换
      if (t.closest("#editToggle")) {
        state.editMode = !state.editMode;
        render();
        toast(state.editMode ? "编辑模式已开启，点击任意格子即可修改" : "已退出编辑模式");
        return;
      }

      // 主题
      if (t.closest("#themeBtn")) {
        state.settings.theme = state.settings.theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", state.settings.theme);
        syncThemeColor(); saveSet(); return;
      }

      // 屏保
      if (t.closest("#screensaverBtn")) { enterSaver(); resetIdle(); return; }

      // 全屏
      if (t.closest("[data-fs]")) { toggleFullscreen(); return; }

      // 安装到桌面
      if (t.closest("#installBtn")) {
        var ev = state.installEvt;
        if (ev && ev.prompt) { try { ev.prompt(); } catch (e) {} state.installEvt = null; }
        else toast("请用浏览器菜单里的「添加到主屏幕」", "warn");
        return;
      }

      // 天气 -> 设置城市
      if (t.closest("#weatherChip")) { state.view = "settings"; render(); setTimeout(function () { var i = $("#setCity"); if (i) i.focus(); }, 60); return; }

      // 日期选择
      var pill = t.closest(".day-pill");
      if (pill) {
        goDay(+pill.dataset.dayIdx);
        return;
      }

      // 打卡
      var ck = t.closest(".check-btn");
      if (ck) {
        e.stopPropagation();
        var slotIndex = +ck.dataset.slot, taskIndex = +ck.dataset.task;
        var di = state.selDay, day = DAYS[di];
        var d = new Date(); d.setDate(d.getDate() + (di - weekdayIndex(new Date())));
        var dk = dateKey(d);
        var ev = buildDayEvents(di).filter(function (x) { return x.slotIndex === slotIndex && x.taskIndex === taskIndex; })[0];
        if (ev) {
          var on = toggleCheck(dk, ev);
          toast(on ? "+1 ⭐ 完成：" + ev.text : "已取消打卡");
          render();
        }
        return;
      }

      // 周视图格子
      var cell = t.closest(".wg-cell");
      var chip = t.closest(".task-chip");
      var timeCell = t.closest(".wg-time");
      if (state.editMode) {
        if (timeCell) { openSlotEditor(+timeCell.dataset.slot); return; }
        if (chip) { openTaskEditor(+chip.dataset.slot, chip.dataset.day, +chip.dataset.task); return; }
        if (cell) { openTaskEditor(+cell.dataset.slot, cell.dataset.day, -1); return; }
      } else if (chip) {
        // 非编辑模式：跳到当天日视图
        goDay(DAYS.indexOf(chip.dataset.day));
        return;
      }

      // 日视图：编辑模式点卡片改内容 / 添加项目
      var tlCard = t.closest(".tl-card");
      if (t.closest("#tlAdd")) {
        openTaskEditor(0, DAYS[state.selDay], -1);
        return;
      }
      if (tlCard && state.editMode) {
        openTaskEditor(+tlCard.dataset.slot, DAYS[state.selDay], +tlCard.dataset.task);
        return;
      }

      // 日视图卡片（非编辑模式点击 -> 打卡）
      if (tlCard && !t.closest(".check-btn")) {
        var si = +tlCard.dataset.slot, ti = +tlCard.dataset.task;
        var d2 = new Date(); d2.setDate(d2.getDate() + (state.selDay - weekdayIndex(new Date())));
        var dk2 = dateKey(d2);
        var ev2 = buildDayEvents(state.selDay).filter(function (x) { return x.slotIndex === si && x.taskIndex === ti; })[0];
        if (ev2) { var on2 = toggleCheck(dk2, ev2); toast(on2 ? "+1 ⭐ 完成：" + ev2.text : "已取消打卡"); render(); }
        return;
      }

      // 成长页里程碑
      var ms = t.closest(".ms-item");
      if (ms) {
        var key = ms.dataset.ms, mi = +ms.dataset.mi;
        var box = state.progress.milestones[key] = state.progress.milestones[key] || {};
        if (box[mi]) delete box[mi]; else box[mi] = dateKey(new Date());
        saveProg(); render(); return;
      }

      // 心情
      var mood = t.closest(".mood-btn");
      if (mood) {
        var d3 = new Date(); d3.setDate(d3.getDate() + (state.selDay - weekdayIndex(new Date())));
        var dk3 = dateKey(d3);
        state.progress.mood[dk3] = state.progress.mood[dk3] === mood.dataset.mood ? "" : mood.dataset.mood;
        saveProg(); render(); return;
      }

      // 计时器
      if (t.closest("#timerStart")) { toggleTimer(); return; }
      if (t.closest("#timerReset")) { stopTimer(); state.timer.sec = 0; render(); return; }

      // 成长记录
      if (t.closest("#noteAdd")) {
        var ta = $("#noteInput");
        var v = ta ? ta.value.trim() : "";
        if (!v) { toast("先写点什么吧～", "warn"); return; }
        state.progress.notes.push({ date: dateKey(new Date()) + " " + pad(new Date().getHours()) + ":" + pad(new Date().getMinutes()), text: v });
        saveProg(); toast("已保存成长记录 ✍️"); render(); return;
      }
      var nd = t.closest("[data-note-del]");
      if (nd) {
        state.progress.notes.splice(+nd.dataset.noteDel, 1);
        saveProg(); toast("已删除"); render(); return;
      }

      // 玩法页
      var mlv = t.closest("[data-mathlv]");
      if (mlv) { mathStart(+mlv.dataset.mathlv); return; }
      if (t.closest("#mathRestart")) { mathStart(); toast("新的一局，加油！"); return; }
      var mop = t.closest("[data-mathopt]");
      if (mop) { mathAnswer(+mop.dataset.mathopt); return; }
      var wm = t.closest("[data-wordmode]");
      if (wm) { wordSetMode(+wm.dataset.wordmode); return; }
      var wgr = t.closest("[data-wordgroup]");
      if (wgr) { wordSetGroup(wgr.dataset.wordgroup); return; }
      var wop = t.closest("[data-wordopt]");
      if (wop) { wordAnswer(+wop.dataset.wordopt); return; }
      if (t.closest("#wordRestart")) { wordStart(); toast("新的一局，加油！"); return; }
      if (t.closest("#storyDraw")) { storyDraw(); return; }
      if (t.closest("#storyDone")) { storyDone(); return; }
      if (t.closest("#breatheBtn")) { toggleBreathe(); return; }
      if (t.closest("#memReset")) { setupMemoryGame(); toast("新的一局开始啦！"); return; }
      var mc = t.closest("[data-mem]");
      if (mc) { flipMem(+mc.dataset.mem); return; }
      if (t.closest("#quoteBtn")) {
        quoteIdx = (quoteIdx + 1) % C.quotes.length;
        var qb = $("#quoteBox"); if (qb) qb.textContent = C.quotes[quoteIdx]; return;
      }

      // 设置页
      if (t.closest("#cloudUp")) { cloudPush(true); return; }
      if (t.closest("#cloudDown")) { cloudPull(false); return; }
      if (t.closest("#cloudDiag")) { cloudDiag(); return; }

      if (t.closest("#setSave")) {
        var nm = $("#setName").value.trim() || "小宝贝";
        var ct = $("#setCity").value.trim() || "北京";
        var th = $("#setTheme").value;
        var idle = +$("#setIdle").value;
        var fc = ($("#setFamily") && $("#setFamily").value.trim()) || DEFAULT_FAMILY;
        var cityChanged = ct !== state.settings.city;
        var codeChanged = fc !== state.settings.familyCode;
        var autoEl = $("#setAutoSync");
        var autoSync = autoEl ? autoEl.value !== "0" : true;
        state.settings.name = nm; state.settings.city = ct; state.settings.theme = th; state.settings.idle = idle;
        state.settings.familyCode = fc; state.settings.autoSync = autoSync;
        if (codeChanged) { cloud.code = fc; cloud.lastAt = 0; saveJSON(K_SYNC, 0); }
        state.data.meta = state.data.meta || {};
        state.data.meta.name = nm;
        saveSet(); saveData();
        document.documentElement.setAttribute("data-theme", th);
        if (cityChanged) { try { localStorage.removeItem(K_WX); } catch (e) {} loadWeather(true); }
        $("#brandName").textContent = nm;
        toast("设置已保存 ✅"); render(); resetIdle();
        if (codeChanged) cloudPull(true, cloudAfterPull);      // 换了家庭码：立刻对齐新码的数据
        else if (autoSync) cloudAutoTick();                    // 刚开启自动同步：补一次
        return;
      }
      if (t.closest("#exportBtn")) { exportData(); return; }
      if (t.closest("#importBtn")) { $("#importFile").click(); return; }
      if (t.closest("#resetData")) {
        if (confirm("确定恢复初始课程表吗？当前的编辑内容会被覆盖（打卡与记录不受影响）")) {
          state.data = { meta: { name: state.settings.name }, days: DAYS.slice(), slots: clone(C.slots) };
          saveData(); toast("已恢复初始课程表"); render();
        }
        return;
      }
      if (t.closest("#resetProg")) {
        if (confirm("确定清空所有打卡、星星、成长记录与里程碑吗？此操作不可撤销")) {
          state.progress = { checks: {}, notes: [], milestones: {}, mood: {} };
          saveProg(); toast("进度已清空"); render();
        }
        return;
      }

      // 屏保退出
      if (t.closest("#saver")) { exitSaver(); return; }

      // 弹层
      closeModalIfMask(t);

      // 弹层内交互
      if (t.closest("#edCancel") || t.closest("#slCancel")) { closeModal(); return; }
      var itab = t.closest("[data-itab]");
      if (itab) {
        editCtx.iconTab = +itab.dataset.itab;
        $$("#iconTabs .icon-tab").forEach(function (b) { b.classList.toggle("active", +b.dataset.itab === editCtx.iconTab); });
        renderIconGrid(); return;
      }
      var ic = t.closest("[data-icon]");
      if (ic) {
        editCtx.icon = ic.dataset.icon;
        $$("#iconGrid .icon-cell").forEach(function (b) { b.classList.toggle("active", b.dataset.icon === editCtx.icon); });
        return;
      }
      var cc = t.closest("[data-cat]");
      if (cc) {
        editCtx.category = cc.dataset.cat;
        $$("#catGrid .cat-cell").forEach(function (b) { b.classList.toggle("active", b.dataset.cat === editCtx.category); });
        return;
      }
      if (t.closest("#edDel")) {
        var slot = state.data.slots[editCtx.slot];
        slot.tasks[editCtx.day].splice(editCtx.task, 1);
        saveData(); closeModal(); toast("已删除项目"); render(); return;
      }
      if (t.closest("#edSave")) {
        var text = $("#edText").value.trim();
        if (!text) { toast("请填写项目名称", "warn"); return; }
        var time = $("#edTime").value.trim();
        if (time && !/^\d{1,2}:\d{2}\s*[-—~至]\s*\d{1,2}:\d{2}$/.test(time)) {
          toast("时间格式应为 07:10-07:30", "warn"); return;
        }
        var slotIdx = +$("#edSlot").value;
        var oldSlot = state.data.slots[editCtx.slot];
        var newSlot = state.data.slots[slotIdx] || oldSlot;
        var rec = { icon: editCtx.icon, text: text, time: time, category: editCtx.category };
        if (editCtx.task >= 0 && slotIdx === editCtx.slot) {
          oldSlot.tasks[editCtx.day][editCtx.task] = rec;
        } else {
          if (editCtx.task >= 0) oldSlot.tasks[editCtx.day].splice(editCtx.task, 1);
          newSlot.tasks[editCtx.day] = newSlot.tasks[editCtx.day] || [];
          newSlot.tasks[editCtx.day].push(rec);
        }
        saveData(); closeModal(); toast("已保存 ✅"); render(); return;
      }
      if (t.closest("#slSave")) {
        var st = $("#slStart").value.trim(), en = $("#slEnd").value.trim();
        if (!/^\d{1,2}:\d{2}$/.test(st) || !/^\d{1,2}:\d{2}$/.test(en)) { toast("时间格式应为 06:50 / 07:30", "warn"); return; }
        var sl = state.data.slots[editCtx.slot];
        sl.start = st; sl.end = en; sl.time = st + "-" + en;
        saveData(); closeModal(); toast("时间段已更新"); render(); return;
      }
    });

    // 导入文件
    document.addEventListener("change", function (e) {
      if (e.target && e.target.id === "importFile") {
        var f = e.target.files[0];
        if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          try {
            var obj = JSON.parse(fr.result);
            if (!obj.slots) throw new Error("格式不正确");
            state.data = obj;
            state.data.days = state.data.days || DAYS;
            state.data.slots.forEach(function (s) { if (!s.tasks) s.tasks = {}; });
            saveData(); toast("导入成功 ✅"); render();
          } catch (err) { toast("导入失败：文件格式不正确", "warn"); }
        };
        fr.readAsText(f);
        e.target.value = "";
      }
    });

    // 键盘
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (!$("#modalMask").hidden) { closeModal(); return; }
        if (!$("#saver").hidden) { exitSaver(); return; }
      }
      // 玩法页：按 1~4 直接选口算答案
      if (state.view === "fun" && /^[1-4]$/.test(e.key) && !mathG.done) {
        var mb = $$("#mathStage [data-mathopt]");
        if (mb.length === 4) mathAnswer(+mb[+e.key - 1].dataset.mathopt);
      }
    });

    // 空闲进入屏保
    ["mousemove", "keydown", "click", "touchstart"].forEach(function (ev) {
      document.addEventListener(ev, resetIdle, { passive: true });
    });

    window.addEventListener("resize", function () { if (!$("#saver").hidden) { /* 屏保自适应由 CSS 完成 */ } });
  }

  function closeModalIfMask(t) {
    if (t.id === "modalMask") closeModal();
  }

  function toggleTimer() {
    if (state.timer.running) { stopTimer(); }
    else {
      state.timer.running = true;
      state.timer.handle = setInterval(function () {
        state.timer.sec++;
        var n = $("#timerNum");
        if (n) n.textContent = fmtTimer(state.timer.sec);
      }, 1000);
      var b = $("#timerStart"); if (b) b.textContent = "⏸ 暂停";
      toast("阅读计时开始，加油 📖");
    }
    render();
  }
  function stopTimer() {
    state.timer.running = false;
    if (state.timer.handle) clearInterval(state.timer.handle);
    state.timer.handle = null;
  }

  function exportData() {
    var payload = { __app: "kid-schedule", exportedAt: new Date().toISOString(), data: state.data, settings: { name: state.settings.name, city: state.settings.city } };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "课程表备份-" + dateKey(new Date()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    toast("已导出备份文件 ⬇️");
  }

  /* ============ 移动端增强 ============ */

  function syncThemeColor() {
    var m = document.getElementById("themeColorMeta");
    if (m) m.setAttribute("content", state.settings.theme === "dark" ? "#0e1322" : "#f4f7ff");
  }

  function toggleFullscreen() {
    var el = document.documentElement;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (!isFs) {
        var req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) { var p = req.call(el); if (p && p.catch) p.catch(function () {}); }
        else toast("当前浏览器不支持全屏", "warn");
      } else {
        var ex = document.exitFullscreen || document.webkitExitFullscreen;
        if (ex) ex.call(document);
      }
    } catch (e) {}
  }

  var swipe = { x: 0, y: 0, t: 0 };

  /** 日视图左右滑动切换星期 */
  function bindTouch() {
    document.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      swipe.x = e.touches[0].clientX;
      swipe.y = e.touches[0].clientY;
      swipe.t = Date.now();
    }, { passive: true });

    document.addEventListener("touchend", function (e) {
      if (state.view !== "day") return;
      if (!$("#saver").hidden || !$("#modalMask").hidden) return;
      var t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      if (Date.now() - swipe.t > 700) return;
      var dx = t.clientX - swipe.x, dy = t.clientY - swipe.y;
      if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      var next = state.selDay + (dx < 0 ? 1 : -1);
      if (next < 0 || next > 6) return;
      goDay(next);
    }, { passive: true });
  }

  /** 手机/平板横竖屏切换时重排 */
  function bindBreakpoints() {
    var lastW = window.innerWidth;
    var onChange = function () {
      var np = isPhoneNow();
      var wChanged = Math.abs(window.innerWidth - lastW) > 40;
      lastW = window.innerWidth;
      if (np !== state.isPhone) { state.isPhone = np; render(); }
      else if (wChanged) render();
      // 屏保打开时随屏幕旋转/尺寸变化重新铺满
      var sv = $("#saver");
      if (sv && !sv.hidden) forceSaverLayout();
    };
    var mq = null;
    try { mq = window.matchMedia(PHONE_MQ); } catch (e) {}
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
    window.addEventListener("orientationchange", function () { setTimeout(onChange, 260); });
    var timer = null;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(onChange, 200);
    });
  }

  function bindInstall() {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      state.installEvt = e;
      if (state.view === "settings") render();
    });
    window.addEventListener("appinstalled", function () {
      state.installEvt = null;
      toast("已安装到桌面 🎉");
    });
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return; // file:// 下无法注册
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }

  /* ============ 启动 ============ */

  function boot() {
    initState();
    state.isPhone = isPhoneNow();
    bindGlobal();
    bindTouch();
    bindBreakpoints();
    bindInstall();

    syncThemeColor();

    // 深链：?view=week|day|growth|fun|settings|saver
    try {
      var v = new URLSearchParams(window.location.search).get("view");
      if (v && ["week", "day", "growth", "fun", "settings"].indexOf(v) >= 0) state.view = v;
    } catch (e) {}

    render();
    renderWeatherChips();
    // 天气服务不可用时保留本地显示。
    resetIdle();
    booted = true;

    // 云数据库：打开/刷新页面时自动拉取；若本机更新则自动上传（双向对齐）
    cloudBootSync();

    // 自动同步的三重兜底：网络恢复、回到前台、每 2 分钟轮询
    setInterval(function () { cloudAutoTick(); }, 120000);
    try { window.addEventListener("online", function () { cloudAutoTick(); }); } catch (e) {}
    try {
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) cloudAutoTick();
      });
    } catch (e2) {}

    try {
      if (new URLSearchParams(window.location.search).get("view") === "saver") enterSaver();
    } catch (e) {}

    // 每分钟刷新一次状态（不打断正在编辑的表单）
    setInterval(function () {
      if (state.view === "week" || state.view === "day") {
        if (!$("#modalMask").hidden) return;
        render();
      }
    }, 60000);

    // 供导入时兼容
    window.__kidSchedule = { state: state, render: render, cloud: cloud, cloudPush: cloudPush, cloudPull: cloudPull };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
