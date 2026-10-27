/* 逛博馆 · APP 逻辑 V1.1 */
(function () {
"use strict";

const MUSEUMS = window.MUSEUMS || [];
const ARTIFACTS = window.ARTIFACTS || [];
const MANIFEST = window.IMAGE_MANIFEST || {};
const TOPICS = window.TOPICS || [];
const ERAS = window.ERAS || [];
const STAMP_NAMES = window.STAMP_NAMES || {};
const FIRST_LEVEL = window.FIRST_LEVEL || [];
const EXHIBITIONS = window.EXHIBITIONS || [];
const ART_DETAILS = window.ARTIFACT_DETAILS || {};
const JINJU = window.JINJU || [];
const BG_ARTS = window.BG_ARTS || [];
const isFirstLevel = id => FIRST_LEVEL.indexOf(id) >= 0;
const view = document.getElementById("view");
const topbar = document.getElementById("topbar");

/* ================= 小工具 ================= */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
const museumById = id => MUSEUMS.find(m => m.id === id);
const artifactById = id => ARTIFACTS.find(a => a.id === id);
const museumsArtifacts = mid => ARTIFACTS.filter(a => a.museumId === mid);
const GD = window.GD_MUSEUMS || [];   /* 全国定级馆（一级/二级/三级在册） */
const GD_RANK = window.GD_RANK || [];  /* 人气榜（2024年参观量） */
const CITY_EXTRA = window.CITY_EXTRA || [];   /* 城市补充表（2026-10-08）：无定级馆的地级行政区 + 港澳台，选城市/天气用 */
const gdByName = n => GD.find(x => x.name === n) || null;
function anyMuseum(id) {
  /* 42精选馆与定级馆的统一"取馆"：定级馆的在编编号 = "g:馆名" */
  if (id.indexOf("g:") === 0) {
    const g = gdByName(id.slice(2));
    return g ? {
      id: id, name: g.name, city: g.city, province: g.prov, tagline: "",
      coord: g.loc ? g.loc.split(",").map(Number) : null, gd: g,
    } : null;
  }
  return museumById(id) || null;
}
const STAMP_TOTAL = MUSEUMS.length + GD.filter(g => !g.mid).length;
const hotList = () => ARTIFACTS.filter(a => a.hot > 0).sort((x, y) => x.hot - y.hot);
const stampName = id => STAMP_NAMES[id] || "纪念章";
function amapUrl(m) {
  return "https://uri.amap.com/marker?position=" + m.coord[0] + "," + m.coord[1] +
    "&name=" + encodeURIComponent(m.name) + "&coordinate=gaode&callnative=1";
}
function todayStr() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}
function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:110px;left:50%;transform:translateX(-50%);" +
    "background:rgba(51,42,36,.92);color:#FFF9EE;padding:9px 20px;border-radius:999px;" +
    "font-size:13px;z-index:99;letter-spacing:1px;box-shadow:0 4px 14px rgba(0,0,0,.25)";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

/* ================= 图片（有真图用真图，没有就显示雅致占位） ================= */
function mediaHTML(id, name, extra) {
  const ch = esc((name || "藏").slice(0, 1));
  const img = MANIFEST[id]
    ? '<img src="' + esc(assetBase + 'images/' + MANIFEST[id]) + '" alt="' + esc(name) + '" loading="lazy" onerror="this.remove()">'
    : "";
  return '<div class="media">' + (extra || "") +
    '<div class="ph" data-ch="' + ch + '" data-label="' + esc(name) + '"></div>' + img + "</div>";
}
const BACK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>';
/* 我的页菜单图标（细线风，同一样本样式） */
const ICON = {
  seal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10z"/><circle cx="12" cy="11" r="2.3"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v3.5M16 3v3.5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M5 7h14M10 7V5h4v2M8 7l1 12.5h6L16 7"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.2M12 7.5v.2"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="3.1"/><path d="M12 2.9v2.8M12 18.3v2.8M2.9 12h2.8M18.3 12h2.8M5.6 5.6l2 2M16.4 16.4l2 2M18.4 5.6l-2 2M7.6 16.4l-2 2"/></svg>',
};
const EAR_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4.2" height="6" rx="1.6"/><rect x="16.8" y="13" width="4.2" height="6" rx="1.6"/></svg>';
const STOP_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2.5"/></svg>';

/* ================= 本地存储 ================= */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let favM = LS.get("gbg_fav_m", []);
let favA = LS.get("gbg_fav_a", []);
let visited = LS.get("gbg_visited", []);
let favG = LS.get("gbg_fav_g", []);   /* 收藏的定级馆（存馆名） */
function saveFavs() { LS.set("gbg_fav_m", favM); LS.set("gbg_fav_a", favA); }

/* ================= 打卡照片（浏览器本地相册 IndexedDB，每馆限一张） ================= */
const PhotoDB = {
  _db: null,
  open() {
    return new Promise(res => {
      if (PhotoDB._db) return res(PhotoDB._db);
      if (!window.indexedDB) return res(null);
      const rq = indexedDB.open("gbg_photos", 1);
      rq.onupgradeneeded = () => { rq.result.createObjectStore("photos"); };
      rq.onsuccess = () => { PhotoDB._db = rq.result; res(PhotoDB._db); };
      rq.onerror = () => res(null);
    });
  },
  async put(id, blob) {
    const db = await PhotoDB.open(); if (!db) return false;
    return new Promise(res => {
      const tx = db.transaction("photos", "readwrite");
      tx.objectStore("photos").put(blob, id);
      tx.oncomplete = () => res(true); tx.onerror = () => res(false);
    });
  },
  async del(id) {
    const db = await PhotoDB.open(); if (!db) return;
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(id);
  },
  async keys() {
    const db = await PhotoDB.open(); if (!db) return [];
    return new Promise(res => {
      const rq = db.transaction("photos").objectStore("photos").getAllKeys();
      rq.onsuccess = () => res(rq.result || []); rq.onerror = () => res([]);
    });
  },
  async get(id) {
    const db = await PhotoDB.open(); if (!db) return null;
    return new Promise(res => {
      const rq = db.transaction("photos").objectStore("photos").get(id);
      rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null);
    });
  }
};
const userPhotos = {};
async function loadUserPhotos() {
  const keys = await PhotoDB.keys();
  for (const k of keys) {
    if (userPhotos[k]) continue;
    const blob = await PhotoDB.get(k);
    if (blob) userPhotos[k] = URL.createObjectURL(blob);
  }
}
function downscaleImage(file, maxDim) {
  return new Promise(res => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight;
      const sc = Math.min(1, maxDim / Math.max(w, h));
      w = Math.round(w * sc); h = Math.round(h * sc);
      const cv = document.createElement("canvas");
      cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(img, 0, 0, w, h);
      cv.toBlob(b => res(b || file), "image/jpeg", 0.85);
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(file); };
    img.src = url;
  });
}
function pickPhoto(mid) {
  document.querySelectorAll("input[data-photo-input]").forEach(el => el.remove());
  const inp = document.createElement("input");
  inp.type = "file";
  inp.accept = "image/*";
  inp.dataset.photoInput = "";
  inp.style.display = "none";
  document.body.appendChild(inp);
  inp.onchange = async () => {
    const f = inp.files && inp.files[0];
    inp.remove();
    if (!f) return;
    toast("正在保存照片…");
    const blob = await downscaleImage(f, 1600);
    const ok = await PhotoDB.put(mid, blob);
    if (!ok) { toast("照片保存失败（浏览器不支持本地相册）"); return; }
    if (userPhotos[mid]) URL.revokeObjectURL(userPhotos[mid]);
    userPhotos[mid] = URL.createObjectURL(blob);
    toast("照片已保存 ✓");
    const r = parseHash();
    if (r.page === "m") { const m = museumById(r.id); if (m) renderMuseum(m); }
    else render();
  };
  inp.click();
}
async function removePhoto(mid) {
  await PhotoDB.del(mid);
  if (userPhotos[mid]) { URL.revokeObjectURL(userPhotos[mid]); delete userPhotos[mid]; }
  toast("照片已删除");
  render();
}

/* ================= 语音朗读 ================= */
const TTS = {
  voice: null,
  init() {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const vs = window.speechSynthesis.getVoices();
      const zh = vs.filter(v => /^zh/i.test(v.lang));
      TTS.voice = zh.find(v => /Xiaoxiao|晓晓|Yunxi|云希|Huihui|慧慧|Xiaoyi|晓伊|Yaoyao|瑶瑶/i.test(v.name)) || zh[0] || null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
  },
  stop() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
};
let ttsBtnEl = null;
function resetTts() {
  if (ttsBtnEl) {
    ttsBtnEl.classList.remove("speaking");
    ttsBtnEl.innerHTML = EAR_SVG + " " + (ttsBtnEl.dataset.label || "听讲解");
    ttsBtnEl = null;
  }
}
function speakText(btn, text) {
  if (!("speechSynthesis" in window)) { toast("这个浏览器不支持语音朗读，换 Edge 试试"); return; }
  if (ttsBtnEl === btn) { TTS.stop(); resetTts(); return; }
  TTS.stop();
  resetTts();
  ttsBtnEl = btn;
  btn.classList.add("speaking");
  btn.innerHTML = STOP_SVG + " 停止朗读";
  const chunks = (text.match(/[^。！？；]+[。！？；]?/g) || [text]).filter(s => s.trim());
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    u.lang = "zh-CN";
    if (TTS.voice) u.voice = TTS.voice;
    u.rate = 1;
    if (i === chunks.length - 1) u.onend = u.onerror = () => { if (ttsBtnEl === btn) resetTts(); };
    window.speechSynthesis.speak(u);
  });
}
function artifactSpeech(a) {
  const dt = ART_DETAILS[a.id] || {};
  return a.name + "。" + (a.alias ? "又名" + a.alias + "。" : "") + a.dynasty + "，" + a.category + "。" + a.intro +
    "再讲个冷知识：" + a.fact + (dt.value ? "　" + dt.value : "");
}
function museumSpeech(m) {
  return m.name + "。" + (m.tagline ? m.tagline + "。" : "") + m.intro;
}

/* ================= 顶栏：时间 + 农历 + 动态天气（wttr.in，免密钥带CORS） ================= */
function beaufort(kmph) {
  const b = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  for (let i = 0; i < b.length; i++) if (kmph < b[i]) return i;
  return 12;
}
const WIND_DIRS = { N: "北风", NNE: "东北风", NE: "东北风", ENE: "东北风", E: "东风", ESE: "东南风", SE: "东南风", SSE: "东南风", S: "南风", SSW: "西南风", SW: "西南风", WSW: "西南风", W: "西风", WNW: "西北风", NW: "西北风", NNW: "西北风" };
const ZODIAC = { 子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇", 午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪" };
let lunarCache = { key: "", txt: "" };
function computeLunar(d) {
  /* 2026-10-07 用户要求：不再显示"丙午马年"干支，改为公历日期打头 */
  const greg = (d.getMonth() + 1) + "月" + d.getDate() + "日";
  try {
    const s = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", { year: "numeric", month: "long", day: "numeric" }).format(d);
    const month = (s.match(/(闰?(?:十[一二]|[正一二三四五六七八九]|冬|腊)月)/) || [])[1] || "";
    const dayN = parseInt((s.match(/月(\d+)/) || [])[1], 10);
    if (!month || !dayN) return greg;                      /* 农历解析不出来就只显示公历日期 */
    const days = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
      "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
      "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
    return greg + " · " + month + days[dayN - 1];
  } catch (e) { return greg; }
}
function getLunarText(d) {
  const key = d.toDateString();
  if (lunarCache.key === key) return lunarCache.txt;
  const txt = computeLunar(d);
  lunarCache = { key: key, txt: txt };
  return txt;
}
let quoteOffset = 0;
function currentQuote() {
  if (!JINJU.length) return "";
  const days = Math.floor(Date.now() / 86400000);
  return JINJU[(days + quoteOffset) % JINJU.length];
}
function initBgArt() {
  const el = document.getElementById("bgArt");
  if (!el || !MUSEUMS.length) return;
  const days = Math.floor(Date.now() / 86400000);
  /* 每天一张真实的博物馆照片（建筑实拍）；没有建筑照的用代表文物兜底 */
  const m = MUSEUMS[days % MUSEUMS.length];
  let f = MANIFEST["bld-" + m.id];
  if (!f) {
    const a = repArtifactOf(m.id);
    if (a && MANIFEST[a.id]) f = MANIFEST[a.id];
  }
  if (f) el.style.backgroundImage = "url('" + assetBase + "images/" + f + "')";
}
const Weather = { data: null, loading: false };
function wwInfo(code) {
  const c = +code;
  if (c === 113) return { t: "sun", w: "晴" };
  if (c === 116) return { t: "partly", w: "多云" };
  if (c === 119 || c === 122) return { t: "cloud", w: "阴" };
  if (c === 143) return { t: "haze", w: "霾" };
  if (c === 248 || c === 260) return { t: "fog", w: "雾" };
  if ([176, 263, 266, 293, 296, 311, 314, 353].indexOf(c) >= 0) return { t: "rain-l", w: "小雨" };
  if (c === 299 || c === 302 || c === 356) return { t: "rain-m", w: "中雨" };
  if (c === 305 || c === 308) return { t: "rain-h", w: "大雨" };
  if (c === 359) return { t: "rain-s", w: "暴雨" };
  if ([179, 323, 326, 368, 371].indexOf(c) >= 0) return { t: "snow-l", w: "小雪" };
  if ([182, 185, 317, 320, 329, 332, 350, 362, 365].indexOf(c) >= 0) return { t: "snow-m", w: "中雪" };
  if ([227, 335, 374].indexOf(c) >= 0) return { t: "snow-h", w: "大雪" };
  if ([230, 338, 377].indexOf(c) >= 0) return { t: "snow-s", w: "暴雪" };
  if (c === 200) return { t: "thunder", w: "雷雨" };
  if ([386, 389, 392, 395].indexOf(c) >= 0) return { t: "thunder", w: "雷阵雨" };
  return { t: "cloud", w: "多云" };
}
function weatherIcon(t) {
  const S = '<svg viewBox="0 0 32 32" aria-hidden="true">';
  const sunG = '<g class="w-sunspin"><circle cx="16" cy="16" r="6" fill="#E8A93C"/><g stroke="#E8A93C" stroke-width="2.2" stroke-linecap="round"><path d="M16 3.2v3.4M16 25.4v3.4M3.2 16h3.4M25.4 16h3.4M7 7l2.4 2.4M22.6 22.6 25 25M25 7l-2.4 2.4M9.4 22.6 7 25"/></g></g>';
  const CLOUD_D_PATH = 'M10 24.6h12.6c2.8 0 4.9-2 4.9-4.6 0-2.4-1.9-4.4-4.4-4.6-.6-3.1-3.3-5.4-6.6-5.4-3 0-5.5 1.9-6.4 4.6-2.5.2-4.4 2.1-4.4 4.7 0 2.7 2 5.3 4.3 5.3z';
  const cloudW = '<path class="w-cloud" d="' + CLOUD_D_PATH + '" fill="#FDFEFF" stroke="#D8E2EA" stroke-width="1"/>';
  const cloudD = '<path class="w-cloud" d="' + CLOUD_D_PATH + '" fill="#5F6C7B"/>';
  const DROP_PATH = 'c-1 1.3-1.9 2.5-1.9 3.7a1.9 1.9 0 0 0 3.8 0c0-1.2-.9-2.4-1.9-3.7z';
  function rain(n, cls) {
    const xs = [10.5, 15.5, 20.5, 8.5, 17.5, 12.8];
    let s = "";
    for (let i = 0; i < n; i++) {
      s += '<path class="w-drop ' + cls + '" style="animation-delay:' + (i * 0.3).toFixed(2) + 's" d="M' + xs[i % xs.length] + ' 25.4' + DROP_PATH + '" fill="#4A88B5"/>';
    }
    return s;
  }
  function flakes(n, cls) {
    const xs = [10.5, 15.5, 20.5, 8.5, 17.5, 12.8];
    let s = "";
    for (let i = 0; i < n; i++) {
      s += '<g transform="translate(' + xs[i % xs.length] + ',28)"><g class="w-flake ' + cls + '" style="animation-delay:' + (i * 0.42).toFixed(2) + 's">' +
        '<path d="M0 -2.4V2.4M-2.1 -1.2 2.1 1.2M-2.1 1.2 2.1 -1.2" stroke="#8FB6D9" stroke-width="1" stroke-linecap="round"/></g></g>';
    }
    return s;
  }
  const hails = '<g><circle class="w-hail" cx="11" cy="28" r="2.1" fill="#CFE6F5" stroke="#8FB6D9" stroke-width=".8"/><circle class="w-hail d2" cx="16" cy="28.5" r="2.1" fill="#CFE6F5" stroke="#8FB6D9" stroke-width=".8"/><circle class="w-hail d3" cx="21" cy="28" r="2.1" fill="#CFE6F5" stroke="#8FB6D9" stroke-width=".8"/></g>';
  const boltLow = '<path class="w-bolt" d="M17.8 20.5 12.8 26.6h3l-2.1 5.9 6.2-7.3h-3l2.9-4.7z" fill="#E8A93C"/>';
  function foglines(color) {
    return '<g stroke="' + color + '" stroke-width="2" stroke-linecap="round"><path class="w-fogline" d="M8 27.2h16"/><path class="w-fogline" style="animation-delay:.6s" d="M11 30.2h10"/></g>';
  }
  if (t === "sun") return S + sunG + "</svg>";
  if (t === "partly") return S +
    '<g class="w-sunspin" style="transform-origin:11px 10.5px"><circle cx="11" cy="10.5" r="4.6" fill="#E8A93C"/><g stroke="#E8A93C" stroke-width="1.8" stroke-linecap="round"><path d="M11 1.8v2.6M11 16.6v2.6M2.3 10.5h2.6M17.1 10.5h2.6M4.9 4.4l1.8 1.8M15.3 14.8l1.8 1.8M17.1 4.4l-1.8 1.8M6.7 14.8l-1.8 1.8"/></g></g>' +
    cloudW + "</svg>";
  if (t === "cloud") return S + cloudD + "</svg>";
  if (t === "rain-l") return S + cloudW + rain(2, "") + "</svg>";
  if (t === "rain-m") return S + cloudW + rain(3, "") + "</svg>";
  if (t === "rain-h") return S + cloudW + rain(4, "fast") + "</svg>";
  if (t === "rain-s") return S + cloudW + rain(6, "torrent") + "</svg>";
  if (t === "thunder") return S + cloudD + boltLow + "</svg>";
  if (t === "snow-l") return S + cloudW + flakes(2, "") + "</svg>";
  if (t === "snow-m") return S + cloudW + flakes(3, "") + "</svg>";
  if (t === "snow-h") return S + cloudW + flakes(4, "fast") + "</svg>";
  if (t === "snow-s") return S + cloudW + flakes(6, "torrent") + "</svg>";
  if (t === "hail") return S + cloudW + hails + "</svg>";
  if (t === "haze") return S + cloudW + foglines("#B9A98A") + "</svg>";
  return S + cloudW + foglines("#A9BCCB") + "</svg>";
}
function paintTopMeta() {
  const el = document.getElementById("topMeta");
  if (!el) return;
  const d = new Date(), p = n => String(n).padStart(2, "0");
  const week = "日一二三四五六"[d.getDay()];
  const lunar = getLunarText(d);
  let w = "";
  if (Weather.data) {
    const inf = wwInfo(Weather.data.code);
    let wx = inf.w + " " + Weather.data.temp + "°";     /* 拿不到区间时退回当前温度 */
    if (Weather.data.lo != null && Weather.data.hi != null) wx = inf.w + " " + Weather.data.lo + "~" + Weather.data.hi + "°";   /* 有区间就只显示区间 */
    if (Weather.data.wind) {
      const lv = beaufort(Weather.data.wind);
      const dir = WIND_DIRS[Weather.data.dir] || "";
      wx += " " + (lv === 0 ? "微风" : (dir || "") + lv + "级");
    }
    /* 2026-10-08 用户要求：天气带城市名（跟随定位/所选城市），点它可直接切换城市 */
    const ci = userCityInfo();
    const cityTxt = ci ? (ci.city ? shortCity(ci.city) : ci.prov) : "";
    w = '<div class="tm-weather" data-act="pickcity" title="点这里切换城市／天气">' + weatherIcon(inf.t) +
      "<span>" + (cityTxt ? esc(cityTxt) + " · " : "") + wx + "</span></div>";
  }
  el.innerHTML = '<div class="tm-time">周' + week + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + "</div>" +
    (lunar ? '<div class="tm-lunar">' + lunar + "</div>" : "") + w;
}
/* WMO天气码→wttr码（open-meteo的码换回原有的，图标/天气词那套wwInfo不用动） */
function omCode(c) {
  c = +c;
  if (c === 0 || c === 1) return 113;
  if (c === 2) return 116;
  if (c === 3) return 119;
  if (c === 45 || c === 48) return 248;
  if ([51, 53, 55, 56, 57].indexOf(c) >= 0) return 263;
  if (c === 61) return 296;
  if (c === 63 || c === 66 || c === 67) return 302;
  if (c === 65) return 308;
  if (c === 71 || c === 77 || c === 85) return 326;
  if (c === 73 || c === 86) return 329;
  if (c === 75) return 335;
  if (c === 80) return 353;
  if (c === 81) return 356;
  if (c === 82) return 359;
  if (c === 95) return 200;
  if (c === 96 || c === 99) return 389;
  return 116;
}
const DIR16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
function degToDir(d) { d = +d; if (isNaN(d)) return ""; return DIR16[Math.round((((d % 360) + 360) % 360) / 22.5) % 16]; }
function numOrNull(v) { const n = Math.round(+v); return isNaN(n) ? null : n; }
let weatherPending = false;   /* 请求进行中来新需求（如 GPS 到手）→ 完成后再补一发，不被吞 */
function fetchWeather() {}

/* ================= 卡片组件 ================= */
function rankBadge(hot) {
  return '<span class="rank' + (hot <= 3 ? " top" : "") + '">' + hot + "</span>";
}
function museumCard(m) {
  const n = museumsArtifacts(m.id).length;
  return '<div class="mcard" data-go="m/' + esc(m.id) + '">' +
    mediaHTML(m.cover, m.name) +
    '<div class="info">' +
    "<h3>" + esc(m.name) + '<span class="city-tag">' + esc(m.city) + "</span>" +
    (isFirstLevel(m.id) ? '<span class="city-tag lv">一级</span>' : "") + "</h3>" +
    "<p>" + esc(m.tagline || m.intro) + "</p>" +
    '<div class="meta"><span class="dot">✦</span>' + esc(m.province) + " · " +
    ((m.ticket || "").indexOf("免费") >= 0 ? '<span class="tick free">免费</span>' : '<span class="tick paid">收费</span>') +
    " · 镇馆之宝 " + n + " 件</div>" +
    "</div></div>";
}
function acard(a, extra) {
  const m = museumById(a.museumId) || { name: "" };
  let badge = "";
  if (a.hot > 0) badge = rankBadge(a.hot);
  else if (favA.includes(a.id)) badge = '<span class="fav-badge">♥</span>';
  return '<div class="acard" data-go="a/' + esc(a.id) + '">' +
    mediaHTML(a.id, a.name, badge) +
    '<div class="info"><b>' + esc(a.name) + "</b><span>" + esc(a.dynasty) + " · " + esc(m.name) + "</span>" +
    (extra ? '<em class="tb-line">📖 ' + esc(extra) + "</em>" : "") + "</div></div>";
}
function hotCard(a) {
  const m = museumById(a.museumId) || { name: "" };
  /* 2026-10-08 修复：非热榜（hot=0）不显示角标，此前会显示"0"（每日五宝/朝代编年都会踩到） */
  return '<div class="hcard" data-go="a/' + esc(a.id) + '">' +
    mediaHTML(a.id, a.name, a.hot > 0 ? rankBadge(a.hot) : "") +
    '<div class="info"><b>' + esc(a.name) + "</b><span>" + esc(m.name) + "</span></div></div>";
}
function subHead(title, sub, fb) {
  return '<div class="sub-head"><button class="sub-back" data-act="back" data-fb="' + esc(fb || "home") + '">‹</button>' +
    "<h2>" + esc(title) + "</h2>" + (sub ? '<span class="sub">' + esc(sub) + "</span>" : "") + "</div>";
}

/* ================= 中国地图（省份足迹：可缩放 + 点亮省份装图） ================= */
function provRepArt(prov) {
  const ms = MUSEUMS.filter(m => m.province === prov);
  let best = null;
  ms.forEach(m => museumsArtifacts(m.id).forEach(a => {
    if (a.hot > 0 && (!best || a.hot < best.hot)) best = a;
  }));
  if (!best) { for (const m of ms) { const arr = museumsArtifacts(m.id); if (arr.length) { best = arr[0]; break; } } }
  return best;
}
function renderChinaMap(lit) {
  const cm = window.CHINA_MAP;
  if (!cm) return "";
  const pats = [];
  let labels = "", hits = "";
  const paths = cm.provinces.map((p, i) => {
    const on = !!lit[p.name];
    if (p.small && p.cp) hits += '<circle class="cnhit" cx="' + p.cp[0] + '" cy="' + p.cp[1] + '" r="11" data-provmap="' + esc(p.name) + '"></circle>';
    if (!on) return '<path d="' + p.d + '" class="cnp" data-provmap="' + esc(p.name) + '"></path>';
    if (p.cp) labels += '<text x="' + p.cp[0] + '" y="' + p.cp[1] + '" class="cnlabel">' + esc(p.name) + "</text>";
    /* 点亮省份的底图：该省任意博物馆的"我的照片" > 该省最热文物（定级馆照片同样优先） */
    let img = "";
    const ms = MUSEUMS.filter(m => m.province === p.name);
    const withPhoto = ms.find(m => userPhotos[m.id]);
    if (withPhoto) img = userPhotos[withPhoto.id];
    else {
      const gdP = GD.find(g => g.prov === p.name && userPhotos["g:" + g.name]);
      if (gdP) img = userPhotos["g:" + gdP.name];
      else {
        const rep = provRepArt(p.name);
        if (rep && MANIFEST[rep.id]) img = assetBase + "images/" + MANIFEST[rep.id];
      }
    }
    if (img) {
      const pid = "provpat" + i;
      pats.push('<pattern id="' + pid + '" patternUnits="objectBoundingBox" width="1" height="1">' +
        '<image href="' + esc(img) + '" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"/></pattern>');
      return '<path d="' + p.d + '" class="cnp onimg" fill="url(#' + pid + ')" data-provmap="' + esc(p.name) + '"></path>';
    }
    return '<path d="' + p.d + '" class="cnp on" data-provmap="' + esc(p.name) + '"></path>';
  }).join("");
  let inset = "";
  if (cm.inset) {
    inset = '<g transform="translate(' + cm.inset.tx + "," + cm.inset.ty + ')" pointer-events="none">' +
      '<rect class="cninset" x="0" y="0" width="' + cm.inset.w + '" height="' + cm.inset.h + '" rx="4"/>' +
      '<path d="' + cm.inset.d + '" class="cnp"></path></g>';
  }
  return '<div class="map-box"><div class="map-hint">双指缩放 · 拖动看全图</div>' +
    '<svg id="cnmap" viewBox="0 0 ' + cm.w + " " + cm.h + '">' +
    "<defs>" + pats.join("") + "</defs>" +
    '<g id="mapg">' + inset + paths + hits + labels + "</g></svg>" +
    '<div class="map-zoom">' +
    '<button class="mz" data-act="map-zoomin">＋</button>' +
    '<button class="mz" data-act="map-reset" style="font-size:13px">◎</button>' +
    '<button class="mz" data-act="map-zoomout">－</button></div>' +
    '<p class="map-tip">点亮省份装着你拍的照片 / 代表文物 · 点省份看当地博物馆</p></div>';
}
function bindMapGestures() {
  const svg = document.getElementById("cnmap");
  const g = document.getElementById("mapg");
  if (!svg || !g) return;
  const st = { s: 1, x: 0, y: 0 };
  const apply = () => {
    g.setAttribute("transform", "translate(" + st.x + "," + st.y + ") scale(" + st.s + ")");
  };
  const vb = () => svg.viewBox.baseVal;
  const clamp = () => {
    if (st.s <= 1) { st.s = 1; st.x = 0; st.y = 0; return; }
    const v = vb(), maxX = v.width * (st.s - 1), maxY = v.height * (st.s - 1);
    st.x = Math.min(0, Math.max(-maxX, st.x));
    st.y = Math.min(0, Math.max(-maxY, st.y));
  };
  const pts = new Map();
  let last = null, lastDist = 0, moved = false;
  const local = e => {
    const r = svg.getBoundingClientRect(), v = vb();
    return { x: (e.clientX - r.left) / r.width * v.width, y: (e.clientY - r.top) / r.height * v.height };
  };
  const zoomBy = (f, focus) => {
    const ns = Math.min(5, Math.max(1, st.s * f));
    const k = ns / st.s;
    st.x = focus.x - (focus.x - st.x) * k;
    st.y = focus.y - (focus.y - st.y) * k;
    st.s = ns;
    clamp(); apply();
  };
  svg.addEventListener("pointerdown", e => {
    if (e.target.closest && e.target.closest(".mz")) return;
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pts.size === 1) last = { x: e.clientX, y: e.clientY };
    if (pts.size === 2) { const a = [...pts.values()]; lastDist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
  });
  svg.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = svg.getBoundingClientRect(), v = vb();
    if (pts.size === 1 && last) {
      const dx = e.clientX - last.x, dy = e.clientY - last.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      st.x += dx / r.width * v.width;
      st.y += dy / r.height * v.height;
      last = { x: e.clientX, y: e.clientY };
      clamp(); apply();
    } else if (pts.size === 2) {
      moved = true;
      const a = [...pts.values()];
      const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (lastDist > 0 && d > 0) {
        const r2 = svg.getBoundingClientRect(), v2 = vb();
        const mid = {
          x: ((a[0].x + a[1].x) / 2 - r2.left) / r2.width * v2.width,
          y: ((a[0].y + a[1].y) / 2 - r2.top) / r2.height * v2.height
        };
        zoomBy(d / lastDist, mid);
      }
      lastDist = d;
    }
  });
  const up = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) lastDist = 0;
    if (pts.size === 1) { const a = [...pts.values()][0]; last = { x: a.x, y: a.y }; }
    if (pts.size === 0) last = null;
  };
  svg.addEventListener("pointerup", up);
  svg.addEventListener("pointercancel", up);
  svg.addEventListener("wheel", e => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.15 : 0.87, local(e)); }, { passive: false });
  /* 拖动过就不触发"点省份跳转" */
  svg.addEventListener("click", e => { if (moved) { e.stopPropagation(); moved = false; } }, true);
  svg._zoomBy = zoomBy;
  svg._reset = () => { st.s = 1; st.x = 0; st.y = 0; apply(); };
}
function miniMuseumCard(m) {
  return '<div class="hcard mini" data-go="m/' + esc(m.id) + '">' + mediaHTML(m.cover, m.name) +
    '<div class="info"><b>' + esc(m.name) + "</b><span>" + esc(m.city) + "</span></div></div>";
}
function miniArtifactCard(a) {
  return '<div class="hcard mini" data-go="a/' + esc(a.id) + '">' +
    mediaHTML(a.id, a.name, a.hot > 0 ? rankBadge(a.hot) : "") +
    '<div class="info"><b>' + esc(a.name) + "</b><span>" + esc(a.dynasty) + "</span></div></div>";
}

/* ================= 首页 ================= */
function dailyArtifact() {
  const days = Math.floor(Date.now() / 86400000);
  return ARTIFACTS[days % ARTIFACTS.length];
}
/* 每日五宝（2026-10-08 用户定）：每天从全库轮换 5 件（按本地日切批，一天内不变） */
function localDayIndex() {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
}
function dailyFive() {
  /* 2026-10-08 用户定：5 件不能出现重复博物馆 → 从游标处依次取，撞馆就跳过 */
  const n = ARTIFACTS.length;
  let cursor = (localDayIndex() * 5) % n;
  const out = [], used = new Set();
  let guard = 0;
  while (out.length < 5 && guard < n * 3) {
    const a = ARTIFACTS[cursor % n];
    cursor++; guard++;
    if (used.has(a.museumId)) continue;
    used.add(a.museumId);
    out.push(a);
  }
  return out;
}
/* 网红文物热榜·大卡轮播（2026-10-08 用户定 v2）：一张大卡里 5 件文物自动轮播，
   每 5 秒从右往左滑一件、无缝循环；手指可拖动、松手吸附后自动继续 */
let carTimer = null;
function stopCarousel() { if (carTimer) { clearInterval(carTimer); carTimer = null; } }
function bannerSlide(a) {
  const m = museumById(a.museumId) || { name: "" };
  const src = MANIFEST[a.id] ? assetBase + "images/" + MANIFEST[a.id] : "";
  return '<div class="banner-slide" data-go="a/' + esc(a.id) + '">' +
    '<div class="bgblur" style="background-image:url(\'' + src + '\')"></div>' +
    (src ? '<img class="art" src="' + src + '" alt="' + esc(a.name) + '" loading="lazy">' : "") +
    '<div class="veil"></div>' +
    '<div class="banner-text"><b>' + esc(a.name) + "</b><span>" + esc(a.dynasty) + " · " + esc(m.name) + "</span></div>" +
    "</div>";
}
function initCarousel() {
  stopCarousel();
  const box = document.getElementById("daily-carousel");
  if (!box) return;
  const track = box.querySelector(".banner-track");
  const dots = Array.prototype.slice.call(box.querySelectorAll(".banner-dot"));
  const real = +box.dataset.real || 1;
  let idx = 0, lock = false;
  const apply = animate => {
    track.style.transition = animate ? "transform .55s ease" : "none";
    track.style.transform = "translateX(" + (-idx * 100) + "%)";
    dots.forEach((d, i) => { d.className = "banner-dot" + (i === Math.min(idx, real - 1) ? " on" : ""); });
  };
  const wrapBack = () => {                      /* 滑进克隆件后瞬间跳回开头，视觉无缝 */
    lock = true;
    setTimeout(() => {
      lock = false;
      if (!document.body.contains(box)) return;
      track.style.transition = "none";
      idx = 0;
      track.style.transform = "translateX(0)";
      void track.offsetWidth;
    }, 620);
  };
  const restart = () => {
    stopCarousel();
    carTimer = setInterval(() => {
      if (document.hidden || lock) return;
      idx++;
      apply(true);
      if (idx >= real) wrapBack();
    }, 5000);
  };
  /* 手指拖动：跟手 + 松手吸附（右滑上一件、左滑下一件） */
  let sx = 0, dx = 0, dragging = false;
  track.addEventListener("touchstart", e => {
    dragging = true; sx = e.touches[0].clientX; dx = 0;
    stopCarousel(); track.style.transition = "none";
  }, { passive: true });
  track.addEventListener("touchmove", e => {
    if (!dragging) return;
    dx = e.touches[0].clientX - sx;
    track.style.transform = "translateX(calc(" + (-idx * 100) + "% + " + dx + "px))";
  }, { passive: true });
  track.addEventListener("touchend", () => {
    dragging = false;
    if (dx <= -40 && idx < real) { idx++; apply(true); if (idx >= real) wrapBack(); }
    else if (dx >= 40 && idx > 0) { idx--; apply(true); }
    else apply(true);
    restart();
  }, { passive: true });
  restart();
}
function featuredMuseums() {
  const day = todayStr().replace(/-/g, "");
  let st = LS.get("gbg_feat", { d: todayStr(), r: 0 });
  if (st.d !== todayStr()) st = { d: todayStr(), r: 0 };
  LS.set("gbg_feat", st);
  let seed = (parseInt(day + st.r, 10) % 2147483647) || 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const arr = MUSEUMS.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr.slice(0, 3);
}
/* ================= 定位：你在的城市 + 城市博物馆推荐 ================= */
function coordOf(x) {
  if (x.coord && x.coord.length === 2) return x.coord;              /* 42精选 [lng,lat] */
  if (x.loc) { const p = String(x.loc).split(","); if (p.length === 2) return [+p[0], +p[1]]; }
  return null;
}
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const h = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function cleanCity(s) { return (s || "").replace(/市$/, ""); }
function cleanProv(s) { return (s || "").replace(/[省市]$/, ""); }
let geoCache = null;        /* 网络定位经纬度（wttr.in 返回，城市级、中小城市常偏到省会） */
let gpsCache = LS.get("gbg_gps", null);        /* GPS 定位经纬度（2026-10-08 加：手机授权后精确到米级；自动定位优先用它） */
function autoPos() { return gpsCache || geoCache; }
/* 请求一次 GPS（1小时内不重复；被拒/超时静默保持网络定位，不打扰） */
function requestGps(force) {
  if (!navigator.geolocation || manualCity()) return;
  if (!force && gpsCache && gpsCache.t && Date.now() - gpsCache.t < 3600e3) return;
  navigator.geolocation.getCurrentPosition(function (p) {
    gpsCache = { lat: +p.coords.latitude.toFixed(4), lng: +p.coords.longitude.toFixed(4), t: Date.now() };
    LS.set("gbg_gps", gpsCache);
    fetchWeather(true);                        /* 拿到精确位置 → 天气和建议立刻按它重算 */
    paintCityZone();
  }, function () {
    paintCityZone();
  }, { timeout: 8000, maximumAge: 1800e3 });
}
function manualCity() { return LS.get("gbg_city", null); }
function userCityInfo() {
  const man = manualCity();
  if (man) return { city: man.city, prov: man.prov, manual: true };
  const pos = autoPos();
  if (!pos) return null;
  let best = null;
  const scan = (arr, cf, pf) => arr.forEach(x => {
    const c = coordOf(x); if (!c || isNaN(c[0]) || isNaN(c[1])) return;
    const d = distKm(pos.lat, pos.lng, c[1], c[0]);
    if (!best || d < best.d) best = { d: d, city: cleanCity(cf(x)), prov: cleanProv(pf(x)) };
  });
  scan(GD, g => g.city, g => g.prov);
  scan(MUSEUMS, m => m.city, m => m.province);
  scan(CITY_EXTRA, x => x.c, x => x.p);
  if (!best) return null;
  if (best.d > 60 || !best.city) return { city: "", prov: best.prov, manual: false, far: true };
  return { city: best.city, prov: best.prov, manual: false };
}
function coordsOfCity(city) {
  const hit = MUSEUMS.find(m => cleanCity(m.city) === city) || GD.find(g => cleanCity(g.city) === city) ||
    CITY_EXTRA.find(x => x.c === city);
  return hit ? coordOf(hit) : null;
}
function cityOptions() {
  const map = {};
  const add = (c, p, isM, aka, nAdd) => {          /* nAdd: 该条计入的馆数（补充城市记 0，只进列表不算馆） */
    const k = cleanCity(c); if (!k) return;
    if (!map[k]) map[k] = { c: k, prov: cleanProv(p), n: 0, m: 0, aka: "" };
    map[k].n += (nAdd == null ? 1 : nAdd); if (isM) map[k].m++;
    if (aka) map[k].aka = aka;
  };
  MUSEUMS.forEach(m => add(m.city, m.province, true));
  GD.forEach(g => add(g.city, g.prov, false));
  /* 2026-10-08 用户要求：补上无定级馆的地级市 + 港澳台，全国城市全可选（不再只取前60个） */
  CITY_EXTRA.forEach(x => add(x.c, x.p, false, x.aka, 0));
  return Object.keys(map).map(k => map[k]).sort((a, b) => b.m - a.m || b.n - a.n);
}
function cityGroups() {
  /* 按省份分组（组顺序 = 该省第一个城市在总排序里的位置，馆多的省自然靠前） */
  const groups = [], idx = {};
  cityOptions().forEach(o => {
    if (!idx[o.prov]) { idx[o.prov] = { prov: o.prov, list: [] }; groups.push(idx[o.prov]); }
    idx[o.prov].list.push(o);
  });
  return groups;
}
/* 顶栏等窄处用短名：延边朝鲜族自治州→延边、阿里地区→阿里、锡林郭勒盟→锡林郭勒 */
const MINZU = ["朝鲜族", "蒙古族", "藏族", "苗族", "彝族", "壮族", "布依族", "侗族", "瑶族", "白族", "土家族", "哈尼族",
  "哈萨克族", "傣族", "黎族", "傈僳族", "佤族", "畲族", "高山族", "拉祜族", "水族", "东乡族", "纳西族", "景颇族",
  "柯尔克孜族", "土族", "达斡尔族", "仫佬族", "羌族", "布朗族", "撒拉族", "毛南族", "仡佬族", "锡伯族", "阿昌族",
  "普米族", "塔吉克族", "怒族", "乌孜别克族", "俄罗斯族", "鄂温克族", "德昂族", "保安族", "裕固族", "京族",
  "塔塔尔族", "独龙族", "鄂伦春族", "赫哲族", "门巴族", "珞巴族", "基诺族", "回族"];
function shortCity(s) {
  s = String(s || "");
  let t = s;
  if (/自治州$/.test(t)) {
    t = t.slice(0, -3);                                   /* 先去掉"自治州"三字 */
    let changed = true;
    while (changed) {                                     /* 双民族名要反复去（海西蒙古族藏族→海西） */
      changed = false;
      for (const mz of MINZU.concat(["蒙古", "哈萨克", "柯尔克孜"])) {
        if (t.endsWith(mz)) { t = t.slice(0, -mz.length); changed = true; break; }
      }
    }
  }
  t = t.replace(/地区$/, "").replace(/盟$/, "").replace(/林区$/, "");
  return t || s;
}
const LV_TXT = ["", "一级", "二级", "三级"];
function cityStrip(info) {
  const list = [], midSeen = new Set(), gdSeen = new Set();
  let local = 0;                                        /* 本地（所选城市）直接收录的馆数，兜底全省的不算 */
  MUSEUMS.forEach(m => {
    if (info.city) { if (cleanCity(m.city) !== info.city) return; }
    else if (cleanProv(m.province) !== info.prov) return;
    midSeen.add(m.id);
    local++;
    list.push({ go: "m/" + m.id, name: m.name, tag: "精选 · " + cleanCity(m.city) });
  });
  const gdCity = [];
  GD.forEach(g => {
    const hit = info.city ? cleanCity(g.city) === info.city : cleanProv(g.prov) === info.prov;
    if (!hit) return;
    if (g.mid && midSeen.has(g.mid)) return;
    if (gdSeen.has(g.name)) return;
    gdSeen.add(g.name);
    local++;
    gdCity.push(g);
  });
  gdCity.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  gdCity.forEach(g => list.push({ go: "g/" + g.name, name: g.name, tag: cleanCity(g.city) + " · " + LV_TXT[g.lv] }));
  /* 市里的馆太少 → 用全省的补到 5 家 */
  if (info.city && list.length < 5) {
    GD.forEach(g => {
      if (cleanProv(g.prov) !== info.prov || gdSeen.has(g.name)) return;
      gdSeen.add(g.name);
      list.push({ go: "g/" + g.name, name: g.name, tag: cleanCity(g.city) + " · " + LV_TXT[g.lv] });
    });
  }
  return { total: list.length, shown: list.slice(0, 10), local: local };
}
function paintCityZone() {
  const info = userCityInfo();
  const lab = document.getElementById("cityLabel");
  if (lab) lab.textContent = info ? shortCity(info.city || info.prov) : "选城市";
  const el = document.getElementById("city-zone");
  if (!el) return;
  if (!info) { el.innerHTML = ""; return; }
  const st = cityStrip(info);
  const place = info.city || info.prov + "全省";
  el.innerHTML =
    /* 2026-10-08 用户要求：删掉横滑卡片条，只留「看全部N家」并紧挨标题右边 */
    '<div class="section-head" style="justify-content:flex-start;gap:12px"><h2>' + esc(shortCity(place)) + " · 博物馆</h2>" +
    (st.total
      ? '<button class="mini-btn" data-act="cityall" data-city="' + esc(st.local ? info.city : "") + '" data-prov="' + esc(info.prov) + '">' +
        "看全部 " + st.total + " 家 ›</button>"
      : '<span class="city-none">这座城市还没收录博物馆</span>') +
    "</div>";
}
function openCityModal() {
  const man = manualCity();
  const info = userCityInfo();
  const groups = cityGroups();
  const nowTxt = info ? (info.city ? shortCity(info.city) : info.prov) : "";
  showModalHTML("<h4>选择城市</h4>" +
    '<p class="city-note">不选 = 自动定位（按网络位置）· 选了就按所选城市推荐，天气也跟着换</p>' +
    '<input id="city-search" type="search" placeholder="搜城市名，如：三亚 / 香港 / 延吉" autocomplete="off">' +
    '<div class="city-wrap" id="city-wrap">' +
    '<div class="city-now"><button class="chip' + (man ? "" : " active") + '" data-act="setcity" data-city="">📍 自动定位' +
    (!man && nowTxt ? "（" + esc(nowTxt) + "）" : "") + "</button></div>" +
    groups.map(g =>
      '<div class="city-group">' +
      '<p class="city-gtitle">' + esc(g.prov) + "</p>" +
      '<div class="city-grid">' +
      g.list.map(o => '<button class="chip' + (man && man.city === o.c ? " active" : "") +
        '" data-act="setcity" data-city="' + esc(o.c) + '" data-prov="' + esc(o.prov) + '"' +
        ' data-search="' + esc(o.c + " " + (o.aka || "") + " " + o.prov) + '">' +
        esc(o.c) + (o.n ? " " + o.n : "") + "</button>").join("") +
      "</div></div>").join("") +
    '<p class="city-empty" id="city-empty" style="display:none">没有找到这座城市，换个名字试试</p>' +
    "</div>");
  const input = document.getElementById("city-search");
  const wrap = document.getElementById("city-wrap");
  const empty = document.getElementById("city-empty");
  if (input) input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    wrap.querySelectorAll(".city-group").forEach(g => {
      let gShow = 0;
      g.querySelectorAll(".chip").forEach(ch => {
        const hit = !q || (ch.dataset.search || "").toLowerCase().indexOf(q) >= 0;
        ch.style.display = hit ? "" : "none";
        if (hit) gShow++;
      });
      g.style.display = gShow ? "" : "none";
      shown += gShow;
    });
    empty.style.display = shown ? "none" : "";
  });
}
function nextBatch() {
  const st = LS.get("gbg_feat", { r: 0 });
  LS.set("gbg_feat", { d: todayStr(), r: (st.r || 0) + 1 });
  renderHome();
}
function renderHome() {
  const five = dailyFive();
  const feat = featuredMuseums();
  const d = dailyArtifact();
  const dm = museumById(d.museumId) || { name: "" };
  const ci0 = userCityInfo();
  const cityLabel = ci0 ? shortCity(ci0.city || ci0.prov) : "选城市";
  view.innerHTML =
    '<div class="stickywrap"><div class="searchbar">' +
    '<button class="city-btn" data-act="pickcity"><span class="pin">📍</span><span class="city-txt" id="cityLabel">' +
    esc(cityLabel) + '</span><span class="caret">▾</span></button>' +
    '<span class="sb-div"></span>' + SEARCH_SVG +
    '<input id="q-home" type="search" placeholder="搜索博物馆 / 文物 / 城市" autocomplete="off"></div></div>' +
    '<div id="search-out"></div>' +
    '<div id="home-main">' +
    '<div id="city-zone"></div>' +
    '<div class="daily" data-go="a/' + esc(d.id) + '">' + mediaHTML(d.id, d.name) +
    '<div style="flex:1;min-width:0"><span class="d-label">每日一宝 · 今天认识一件国宝</span>' +
    "<b>" + esc(d.name) + "</b><p>" + esc(d.tagline) + " · " + esc(dm.name) + "</p></div>" +
    '<span class="arrow">›</span></div>' +
    '<div class="section-head"><h2>网红文物热榜</h2>' +
    '<button class="mini-btn" data-act="hotall">全部热榜 ›</button></div>' +
    '<div class="banner-box" id="daily-carousel" data-real="' + five.length + '">' +
    '<div class="banner-track">' + five.map(bannerSlide).join("") + bannerSlide(five[0]) + "</div>" +
    '<div class="banner-dots">' + five.map((_, i) => '<span class="banner-dot' + (i === 0 ? " on" : "") + '"></span>').join("") + "</div>" +
    "</div>" +
    '<div class="section-head"><h2>精选博物馆</h2>' +
    '<div class="sec-quote" data-act="nextquote">❖ ' + esc(currentQuote()) + " ❖</div>" +
    '<button class="mini-btn" data-act="reshuffle">换一批 ⟳</button></div>' +
    '<div class="mlist">' + feat.map(museumCard).join("") + "</div>" +
    '<button class="all-btn" data-nav="explore">看全部 ' + (MUSEUMS.length + GD.length - GD.filter(g => g.mid).length) + ' 家博物馆 ›</button>' +
    '<p class="foot-note">资讯整理自公开资料 · 开放时间与票价以官方公布为准<br>逛博馆 · 把博物馆装进口袋</p>' +
    "</div>";

  const input = document.getElementById("q-home");
  const out = document.getElementById("search-out");
  const main = document.getElementById("home-main");
  paintCityZone();
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (!q) { out.innerHTML = ""; main.style.display = ""; return; }
    main.style.display = "none";
    out.innerHTML = searchResultsHTML(q);
  });
  initCarousel();
}
function searchResultsHTML(q) {
  const ql = q.toLowerCase();
  const ms = MUSEUMS.filter(m =>
    [m.name, m.city, m.province, m.tagline || "", m.intro].join(" ").toLowerCase().includes(ql));
  const as = ARTIFACTS.filter(a => {
    const m = museumById(a.museumId) || { name: "" };
    return [a.name, a.alias || "", a.dynasty, a.category, m.name].join(" ").toLowerCase().includes(ql);
  });
  const gsAll = GD.filter(g => [g.name, g.city, g.prov].join(" ").toLowerCase().includes(ql));
  const gs = gsAll.slice(0, 40);
  if (!ms.length && !as.length && !gsAll.length) {
    return '<div class="empty"><span class="big">无</span>没有找到“' + esc(q) +
      '”<br>换个关键词试试，比如“三星堆”“兵马俑”“水晶杯”</div>';
  }
  let h = "";
  if (ms.length) h += '<p class="search-result-title">精选博物馆 · ' + ms.length + " 家</p><div class=\"mlist\">" + ms.map(museumCard).join("") + "</div>";
  if (gsAll.length) h += '<p class="search-result-title">定级博物馆 · ' + gsAll.length + " 家" + (gsAll.length > 40 ? "（显示前40）" : "") + "</p>" + gs.map(gdCard).join("");
  if (as.length) h += '<p class="search-result-title">文物 · ' + as.length + " 件</p><div class=\"agrid\">" + as.map(acard).join("") + "</div>";
  return h;
}
/* 找馆页搜索：只搜博物馆（42精选+全国定级馆），不受当前等级/省份限制 */
function searchMuseumsHTML(q) {
  const ql = q.toLowerCase();
  const ms = MUSEUMS.filter(m =>
    [m.name, m.city, m.province, m.tagline || "", m.intro].join(" ").toLowerCase().includes(ql));
  const gsAll = GD.filter(g => [g.name, g.city, g.prov].join(" ").toLowerCase().includes(ql));
  if (!ms.length && !gsAll.length) {
    return '<div class="empty"><span class="big">无</span>没有找到“' + esc(q) +
      '”<br>换个关键词试试，比如“故宫”“陕西”“海洋”</div>';
  }
  let h = "";
  if (ms.length) h += '<p class="search-result-title">精选博物馆 · ' + ms.length + " 家</p><div class=\"mlist\">" + ms.map(museumCard).join("") + "</div>";
  if (gsAll.length) h += '<p class="search-result-title">定级博物馆 · ' + gsAll.length + " 家" +
    (gsAll.length > 40 ? "（显示前40）" : "") + "</p>" + gsAll.slice(0, 40).map(gdCard).join("");
  return h;
}

/* ================= 找馆 ================= */
function gdCard(g) {
  const cls = g.lv === 1 ? "l1" : g.lv === 2 ? "l2" : "l3";
  const lvTxt = ["", "一级", "二级", "三级"][g.lv] || "";
  return '<div class="gcard" data-go="g/' + esc(g.name) + '">' +
    '<span class="lvt ' + cls + '">' + lvTxt + "</span>" +
    '<div class="ginfo"><b>' + esc(g.name) + '</b><p>' + esc(g.prov) +
    (g.city && g.city !== g.prov && g.city !== g.prov + "市" ? " · " + esc(g.city) : "") + "</p></div>" +
    '<span class="arrow">›</span></div>';
}
function gdAmapUrl(g) {
  return "https://uri.amap.com/marker?position=" + g.loc + "&name=" + encodeURIComponent(g.name) +
    "&coordinate=gaode&callnative=1";
}
function gdStampShort(g) {
  return g.name.replace(/博物馆|博物院|纪念馆|陈列馆|科技馆|美术馆|展览馆|艺术馆|陈列室/g, "").slice(0, 6) || g.name.slice(0, 4);
}
function miniGdCard(g) {
  const lvTxt = ["", "国家一级", "国家二级", "国家三级"][g.lv] || "";
  return '<div class="hcard mini" data-go="g/' + esc(g.name) + '" style="padding:10px 10px 8px">' +
    '<b style="font-family:var(--serif);font-size:13px;line-height:1.35;display:block">' + esc(g.name) + "</b>" +
    '<span style="font-size:10.5px;color:var(--ink2);display:block;margin-top:6px">' + esc(g.prov) + " · " + lvTxt + "</span></div>";
}
function nameKey(s) {
  return (s || "").replace(/[（(].*?[）)]/g, "").replace(/[·\s・]/g, "").replace(/[省市区县]/g, "");
}
function rankLink(n) {
  const k = nameKey(n);
  const hit = (arr, keyFn) => arr.find(x => {
    const a = keyFn(x);
    return a === k || (k.length >= 4 && a.length >= 4 && (a.indexOf(k) >= 0 || k.indexOf(a) >= 0));
  });
  const g = hit(GD, x => nameKey(x.name));
  if (g) return "g/" + esc(g.name);
  const m = hit(MUSEUMS, x => nameKey(x.name));
  return m ? "m/" + esc(m.id) : "";
}
function rankRow(item) {
  const link = rankLink(item.n);
  const rk = item.r <= 3 ? " r" + item.r : "";
  return '<div class="gcard"' + (link ? ' data-go="' + link + '"' : "") + '>' +
    '<span class="rk' + rk + '">' + item.r + "</span>" +
    '<div class="ginfo"><b>' + esc(item.n) + "</b><p>2024年接待 " + item.v + " 万人次</p></div>" +
    (link ? '<span class="arrow">›</span>' : "") + "</div>";
}
let exploreProv = "全部";
let exploreLv = "精选";
let exploreExpand = false;            /* 每档默认只露5家；点"展开全部"看全量 */
let explorePreQ = "";                 /* 跳转过来时预填的搜索词（如"南昌"） */
const FOLD_N = 5;
function foldHTML(arr, fn) {
  if (arr.length <= FOLD_N) return arr.map(fn).join("");
  return (exploreExpand ? arr : arr.slice(0, FOLD_N)).map(fn).join("") +
    '<button class="all-btn" data-act="expand">' +
    (exploreExpand ? "收起 ▲" : "展开全部 " + arr.length + " 家 ›") + "</button>";
}
function renderExplore() {
  const isGd = exploreLv !== "精选";
  const counts = {};
  (isGd ? GD : MUSEUMS).forEach(x => {
    const p = isGd ? x.prov : x.province;
    counts[p] = (counts[p] || 0) + 1;
  });
  const provs = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const prov = provs.indexOf(exploreProv) >= 0 ? exploreProv : "全部";
  const chipLv = (val, label) => '<button class="chip' + (exploreLv === val ? " active" : "") +
    '" data-lv="' + val + '">' + label + "</button>";
  const chipsLv = '<div class="chips">' +                 /* 2026-10-07 按用户要求去掉数字，只留名字 */
    chipLv("精选", "✦ 精选") +
    chipLv("定级", "定级馆") +
    chipLv(1, "一级") +
    chipLv(2, "二级") +
    chipLv(3, "三级") +
    chipLv("人气", "🔥 人气榜") +
    "</div>";
  let body;
  if (exploreLv === "人气") {
    body = '<div class="section-head"><h2>人气榜 · 2024年参观量</h2><span class="sub">' + GD_RANK.length + " 家</span></div>" +
      foldHTML(GD_RANK, rankRow) +
      '<p class="foot-note">2024年全年接待人次排名（国家文物局年报统计口径）<br>完整TOP100公开渠道未全放出，先收录前41名+2个散点 · 以官方为准</p>';
  } else {
    let head, list, foot;
    if (!isGd) {
      const l = prov === "全部" ? MUSEUMS : MUSEUMS.filter(m => m.province === prov);
      head = '<div class="section-head"><h2>精选博物馆</h2><span class="sub">' + l.length + " 家</span></div>";
      list = '<div class="mlist">' + foldHTML(l, museumCard) + "</div>";
      foot = '<p class="foot-note">42家精修馆 · 有参观攻略和打卡照<br>想看全国的就点上面「定级馆」</p>';
    } else {
      let l = exploreLv === "定级" ? GD.slice() : GD.filter(g => g.lv === exploreLv);
      if (prov !== "全部") l = l.filter(g => g.prov === prov);
      l.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
      const lvName = ["", "一", "二", "三"][exploreLv];
      head = '<div class="section-head"><h2>' +
        (exploreLv === "定级" ? "全国定级博物馆" : "国家" + lvName + "级博物馆") +
        '</h2><span class="sub">' + l.length + " 家</span></div>";
      list = foldHTML(l, gdCard) || '<div class="empty"><span class="big">无</span>这个省份还没有收录</div>';
      foot = '<p class="foot-note">一级/二级/三级 = 国家定级（在册）博物馆<br>资料整理自公开数据，出行以官方为准</p>';
    }
    body = '<div class="chips">' +
      '<button class="chip' + (prov === "全部" ? " active" : "") + '" data-prov="全部">全部</button>' +
      provs.map(p => '<button class="chip' + (prov === p ? " active" : "") +      /* 2026-10-07 省份行也去掉数字（用户要求） */
        '" data-prov="' + esc(p) + '">' + esc(p) + "</button>").join("") +
      "</div>" + head + list + foot;
  }
  view.innerHTML =
    '<div class="stickywrap"><div class="searchbar">' + SEARCH_SVG +
    '<input id="q-explore" type="search" placeholder="搜博物馆 / 城市 / 省份，如“陕西”" autocomplete="off"></div></div>' +
    '<div id="ex-search-out"></div>' +
    '<div id="ex-main">' + chipsLv + body + "</div>";

  const inp = document.getElementById("q-explore");
  const out = document.getElementById("ex-search-out");
  const main = document.getElementById("ex-main");
  inp.addEventListener("input", () => {
    const q = inp.value.trim();
    if (!q) { out.innerHTML = ""; main.style.display = ""; return; }
    main.style.display = "none";
    out.innerHTML = searchMuseumsHTML(q);
  });
  if (explorePreQ) {                       /* 从首页"看全部"跳来：预填搜索 */
    const q0 = explorePreQ; explorePreQ = "";
    inp.value = q0;
    inp.dispatchEvent(new Event("input"));
  }
}
/* 开放时间：啰嗦的（两三行那种）精简成"每周X闭馆"；一行字的短文本不动；认不出就保留原文（宁缺毋错） */
function shortHours(h) {
  if (!h) return h;
  const t = String(h).replace(/\s+/g, " ").trim();
  if (t.length <= 24) return h;
  /* 多日写法：周一、周二闭馆 / 周一,周日 全天关闭 */
  const multi = t.match(/周([一二三四五六日天])[、和及，,]\s*周([一二三四五六日天])\s*(闭馆|全天关闭|不开放|全天不开放)/);
  if (multi) return "每周" + multi[1] + "、" + multi[2] + "闭馆";
  const days = [];
  const re = /周([一二三四五六日天])[^周；;，,。]{0,14}?(闭馆|关闭|不开放|不营业|休馆)/g;
  let m;
  while ((m = re.exec(t))) {
    const before = t.slice(Math.max(0, m.index - 1), m.index);
    const pre20 = t.slice(Math.max(0, m.index - 20), m.index);
    if (before === "至" || before === "-" || before === "～" || before === "~") continue;  /* "周一至周日 全天关闭"类：日期范围，不是每周规律 */
    /* "10/08 周四 不开放""5月7日 周四 不开放"类：一次性日期（但"1/1-12/31 周二"这种全年范围不算） */
    if (/(\d{1,2}月\d{1,2}日|\d{1,2}[\/]\d{1,2})\s*$/.test(pre20) &&
        !/\d{1,2}\s*[\/\-–~～至]\s*\d{1,2}/.test(pre20)) continue;
    if (new RegExp("周" + m[1] + "[，,；;]?(不闭馆|照常|正常开放|不休息)").test(t)) continue; /* "周一不闭馆"类：否定 */
    days.push(m[1] === "天" ? "日" : m[1]);
  }
  const uniq = [...new Set(days)].sort((a, b) => "一二三四五六日".indexOf(a) - "一二三四五六日".indexOf(b));
  if (!uniq.length) return h;
  return "每周" + uniq.join("、") + "闭馆";
}
function renderGD(g) {
  const lvTxt = ["", "国家一级博物馆", "国家二级博物馆", "国家三级博物馆"][g.lv] || "";
  const gid = g.mid ? g.mid : "g:" + g.name;           /* 与42精选共用打卡/收藏时用同一个编号 */
  const isVis = visited.some(v => v.id === gid);
  const isFav = g.mid ? favM.includes(g.mid) : favG.includes(g.name);
  const row = (k, v) => v ? '<div class="irow"><span class="lab">' + k + '</span><span class="val">' + esc(v) + "</span></div>" : "";
  view.innerHTML = subHead(g.name, lvTxt, "explore") +
    '<div class="panel" style="margin:0 16px"><div class="info-rows">' +
    row("城市", (g.prov || "") + (g.city && g.city !== g.prov && g.city !== g.prov + "市" ? " · " + g.city : "")) +
    row("地址", g.ad) +
    row("电话", g.tel) +
    row("开放时间", shortHours(g.hours)) +
    row("门票", "免费开放为主 · 少数遗址古建类收费，以官方为准") +
    row("预约方式", "多数需在博物馆官方公众号提前预约 · 部分可直接进馆") +
    row("建议时长", "2 小时左右（大型馆建议留半天）") +
    "</div></div>" +
    '<div class="action-row" style="padding:16px 16px 0">' +
    '<button class="btn ' + (isVis ? "btn-red on" : "btn-red") + '" data-act="visit" data-id="' + esc(gid) + '">' +
    (isVis ? "✓ 已打卡" : "到馆打卡") + "</button>" +
    '<a class="btn btn-gold" href="' + gdAmapUrl(g) + '" target="_blank" rel="noopener">导航过去</a>' +
    "</div>" +
    '<div class="action-row" style="padding:10px 16px 0">' +
    '<button class="btn btn-line" data-act="' + (g.mid ? "favM" : "favG") + '" data-id="' + esc(g.mid || g.name) + '">' +
    (isFav ? "♥ 已收藏" : "♡ 收藏") + "</button>" +
    (g.mid ? '<button class="btn btn-line" data-go="m/' + esc(g.mid) + '">看精选攻略</button>' : "") +
    "</div>" +
    (isVis ? '<div class="action-row" style="padding:10px 16px 0">' +
      '<button class="btn btn-line" data-act="photo-upload" data-id="' + esc(gid) + '">' +
      (userPhotos[gid] ? "📷 换一张打卡照片" : "📷 上传打卡照片") + "</button>" +
      (userPhotos[gid] ? '<button class="btn btn-line" data-act="photo-del" data-id="' + esc(gid) + '">删除照片</button>' : "") +
      "</div>" : "") +
    '<p class="foot-note">' + lvTxt + "（国家定级在册）<br>门票/预约/时长为通用提示，出行前请以博物馆官方为准</p>";
}

/* ================= 文物库 ================= */
let relicQ = "", relicCat = "全部";
function relicFiltered() {
  let list = ARTIFACTS.slice();
  if (relicCat === "网红榜") list = hotList();
  else if (relicCat !== "全部") list = list.filter(a => a.category === relicCat);
  const q = relicQ.trim().toLowerCase();
  if (q) {
    list = list.filter(a => {
      const m = museumById(a.museumId) || { name: "", city: "" };
      return [a.name, a.alias || "", a.dynasty, a.category, m.name, m.city].join(" ").toLowerCase().includes(q);
    });
  }
  return list;
}
function renderRelics() {
  const cats = ["全部", "网红榜", "青铜器", "陶瓷", "书画", "玉器", "金银器", "织绣", "陶塑", "石刻", "玻璃器", "其他"]
    .filter(c => c === "全部" || c === "网红榜" || ARTIFACTS.some(a => a.category === c));
  ARTIFACTS.forEach(a => { if (cats.indexOf(a.category) < 0) cats.push(a.category); });
  const list = relicFiltered();
  view.innerHTML =
    '<div class="searchbar">' + SEARCH_SVG +
    '<input id="q-relics" type="search" placeholder="直接搜文物，如“司母戊鼎”" value="' + esc(relicQ) + '" autocomplete="off"></div>' +
    '<div class="entries">' +
    '<div class="entry red" data-nav="topics"><b>📚 专题合集</b><p>趣味榜单，越逛越上头</p></div>' +
    '<div class="entry gold" data-nav="timeline"><b>🕰 朝代编年</b><p>从新石器一路逛到清代</p></div>' +
    '<div class="entry jade" data-nav="textbook"><b>🎒 课本同款</b><p>史书之中昔时曾见此物</p></div>' +
    "</div>" +
    '<div class="chips">' + cats.map(c => '<button class="chip' + (relicCat === c ? " active" : "") +
      '" data-cat="' + esc(c) + '">' + esc(c) + "</button>").join("") + "</div>" +
    '<div class="section-head"><h2>' + (relicCat === "全部" ? "全部文物" : esc(relicCat)) +
    '</h2><span class="sub">' + list.length + " 件</span></div>" +
    '<div class="agrid" id="agrid">' + (list.map(acard).join("") ||
      '<div class="empty" style="grid-column:1/-1"><span class="big">无</span>没有找到相关文物</div>') + "</div>" +
    '<p class="foot-note">记不住全名也没关系，“司母戊鼎”“马踏飞燕”这类别名也能搜到</p>';

  const inp = document.getElementById("q-relics");
  inp.addEventListener("input", () => {
    relicQ = inp.value;
    const l = relicFiltered();
    document.getElementById("agrid").innerHTML = l.map(acard).join("") ||
      '<div class="empty" style="grid-column:1/-1"><span class="big">无</span>没有找到相关文物</div>';
    const sub = view.querySelector(".section-head .sub");
    if (sub) sub.textContent = l.length + " 件";
  });
}

/* ================= 专题合集 ================= */
function renderTopics() {
  view.innerHTML = subHead("专题合集", TOPICS.length + " 个榜单", "relics") +
    TOPICS.map(t => {
      const arts = t.ids.map(artifactById).filter(Boolean);
      return '<div class="topic-card" data-go="t/' + esc(t.id) + '">' +
        '<div class="strip">' + arts.slice(0, 4).map(a => mediaHTML(a.id, a.name)).join("") + "</div>" +
        '<div class="tinfo"><div><b>' + esc(t.emoji + " " + t.name) + "</b><p>" + esc(t.desc) + "</p></div>" +
        '<span class="cnt">' + arts.length + " 件 ›</span></div></div>";
    }).join("") +
    '<p class="foot-note">榜单都是手工挑的 · 没看够就去文物库继续挖宝</p>';
}
function renderTopic(t) {
  const arts = t.ids.map(artifactById).filter(Boolean);
  view.innerHTML = subHead(t.emoji + " " + t.name, arts.length + " 件", "relics") +
    '<p style="padding:0 18px 10px;font-size:13px;color:var(--ink2)">' + esc(t.desc) + "</p>" +
    '<div class="agrid">' + arts.map(acard).join("") + "</div>" +
    '<p class="foot-note">看到喜欢的点右上角 ♡ 收藏它</p>';
}

/* ================= 朝代编年 ================= */
function renderTimeline() {
  const groups = [];
  ERAS.forEach(e => {
    const arts = ARTIFACTS.filter(a => e.dyn.indexOf(a.dynasty) >= 0);
    if (arts.length) groups.push({ e: e, arts: arts });
  });
  const total = groups.reduce((n, g) => n + g.arts.length, 0);
  view.innerHTML = subHead("朝代编年", "共 " + total + " 件", "relics") +
    '<div class="tl">' + groups.map(g =>
      '<div class="tl-era"><span class="dot"></span>' +
      '<div class="tl-head"><b>' + esc(g.e.name) + "</b><span>" + esc(g.e.period) + "</span><em>" + g.arts.length + " 件</em></div>" +
      '<div class="hscroll" style="padding:2px 0 8px 0">' + g.arts.map(hotCard).join("") + "</div>" +
      "</div>").join("") + "</div>" +
    '<p class="foot-note">顺着时间线，从一万年前一路逛到清朝</p>';
}

/* ================= 课本同款 ================= */
function renderTextbook() {
  const arts = ARTIFACTS.filter(a => (ART_DETAILS[a.id] || {}).textbook);
  view.innerHTML = subHead("🎒 课本同款", arts.length + " 件", "relics") +
    '<p style="padding:0 18px 10px;font-size:13px;color:var(--ink2)">史书之中昔时曾见此物——课本上的老面孔，都在这了。</p>' +
    '<div class="agrid">' + arts.map(a => acard(a, (ART_DETAILS[a.id] || {}).tbpage)).join("") + "</div>" +
    '<p class="foot-note">📖 页码 = 该课起始页（以人教社统编版常见印次为准，不同印次可能差1-2页）<br>看到喜欢的点右上角 ♡ 收藏它</p>';
}

/* ================= 展讯 ================= */
function renderShows() {
  const list = EXHIBITIONS.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
  view.innerHTML = '<div class="section-head"><h2>近期展讯</h2><span class="sub">更新于 ' +
    esc(window.EXHIBITIONS_UPDATED || "") + "</span></div>" +
    '<p style="padding:0 18px 10px;font-size:12.5px;color:var(--ink2);line-height:1.7">展览信息整理自公开报道，可能临时调整；' +
    "出发前请以各馆官方为准。 ⏳“至”日期越近的排越前。</p>" +
    list.map(ex => {
      const m = museumById(ex.museumId) || { name: "未知博物馆", id: "" };
      const ta = ex.artId ? artifactById(ex.artId) : null;
      const thumb = ta
        ? '<div class="show-thumb" data-go="a/' + esc(ta.id) + '">' + mediaHTML(ta.id, ta.name) +
          '<span class="thumb-name">' + esc(ta.name) + "</span></div>"
        : "";
      return '<div class="show-card">' + thumb +
        '<div class="sh-top"><span class="sh-type' + (ex.type === "特展" ? " red" : "") + '">' + esc(ex.type) + "</span>" +
        "<b>" + esc(m.name) + '</b><span class="sh-time">' + esc(ex.time) + "</span></div>" +
        "<h4>" + esc(ex.title) + "</h4><p>" + esc(ex.desc) + "</p>" +
        '<div class="sh-foot"><a href="' + esc(ex.link) + '" target="_blank" rel="noopener">官方展讯 ›</a>' +
        '<span data-go="m/' + esc(m.id) + '">去这家博物馆逛逛 ›</span></div></div>';
    }).join("") +
    '<p class="foot-note">展讯资料定期整理，出发前请以各馆官方为准</p>';
}

/* ================= 我的 ================= */
/* 该馆最热文物（无建筑照/无照片时的兜底背景） */
function repArtifactOf(mid) {
  const arts = museumsArtifacts(mid);
  let best = null;
  arts.forEach(a => { if (a.hot > 0 && (!best || a.hot < best.hot)) best = a; });
  return best || arts[0] || null;
}
/* 印章背景：我的照片 > 建筑照 > 最热文物图 */
function stampBgURL(m) {
  if (userPhotos[m.id]) return userPhotos[m.id];
  const bld = MANIFEST["bld-" + m.id];
  if (bld) return assetBase + "images/" + bld;
  const rep = repArtifactOf(m.id);
  return rep && MANIFEST[rep.id] ? assetBase + "images/" + MANIFEST[rep.id] : "";
}
let stampsExpanded = false;
function stampCellHTML(m, v) {
  /* m = 42馆或定级馆的统一对象（定级馆带 .gd）；v = 打卡记录（null=未盖） */
  const isGd = !!m.gd;
  const goTarget = isGd ? "g/" + esc(m.name) : "m/" + esc(m.id);
  const short = isGd ? gdStampShort(m.gd) : (STAMP_NAMES[m.id] || m.name.slice(0, 3));
  if (v) {
    if (isGd) {
      const bg = userPhotos[m.id];
      if (bg) {
        return '<div class="stamp-cell on" data-go="' + goTarget + '">' +
          '<div class="stamp-photo"><img src="' + esc(bg) + '" alt="">' +
          '<span class="st-seal">' + esc(short) + '</span><span class="st-mine">我的照片</span></div>' +
          '<div class="st-name">' + esc(v.date) + (v.manual ? " · 补卡" : "") + "</div></div>";
      }
      return '<div class="stamp-cell on" data-go="' + goTarget + '">' +
        '<div class="stamp-seal">' + esc(short) + "</div>" +
        '<div class="st-name">' + esc(v.date) + (v.manual ? " · 补卡" : "") + "</div></div>";
    }
    const bg = stampBgURL(m);
    const mark = userPhotos[m.id] ? '<span class="st-mine">我的照片</span>' : "";
    return '<div class="stamp-cell on" data-go="' + goTarget + '">' +
      '<div class="stamp-photo">' +
      (bg ? '<img src="' + esc(bg) + '" alt="" loading="lazy" onerror="this.remove()">' : "") +
      '<span class="st-seal">' + esc(short) + "</span>" + mark + "</div>" +
      '<div class="st-name">' + esc(v.date) + (v.manual ? " · 补卡" : "") + "</div></div>";
  }
  return '<div class="stamp-cell" data-go="' + goTarget + '">' +
    '<div class="stamp-seal">' + esc(short) + "</div>" +
    '<div class="st-name">' + esc(m.city || "") + "</div></div>";
}
function renderStamps() {
  const visMap = {};
  visited.forEach(v => { visMap[v.id] = v; });
  /* 已盖的排最前（按打卡先后），然后是42精选空位，最后是全国定级馆空位 */
  const stamped = visited.map(v => ({ v: v, m: anyMuseum(v.id) })).filter(x => x.m);
  const rest42 = MUSEUMS.filter(m => !visMap[m.id]).map(m => stampCellHTML(m, null));
  const restGd = GD.filter(g => !g.mid && !visMap["g:" + g.name]).map(g =>
    stampCellHTML({ id: "g:" + g.name, name: g.name, city: g.city, province: g.prov, gd: g }, null));
  const allCells = stamped.map(x => stampCellHTML(x.m, x.v)).concat(rest42, restGd);
  const shown = stampsExpanded ? allCells : allCells.slice(0, 6);
  const toggle = allCells.length > 6
    ? '<button class="mini-btn" data-act="stampexpand" style="display:flex;margin:10px auto 2px">' +
      (stampsExpanded ? "收起 ▴" : "展开全部 " + allCells.length + " 枚 ▾") + "</button>"
    : "";
  return '<div class="stamp-progress">到馆打卡得印章（可手动补卡）· 已盖的排在前面<br>42家精选馆 + 全国定级馆都能盖章 · 精选馆可以传自己拍的照片当印章背景</div>' +
    '<div class="stamp-grid">' + shown.join("") + "</div>" + toggle;
}
/* ===== 我的（菜单式：大头像 + 分组入口，各入口一个子页） ===== */
function mineCounts() {
  const visitedProvs = {};
  visited.forEach(v => { const m = anyMuseum(v.id); if (m) visitedProvs[m.province] = 1; });
  return {
    provs: visitedProvs,
    nProv: Object.keys(visitedProvs).length,
    favMs: favM.map(museumById).filter(Boolean),
    favGs: favG.map(gdByName).filter(Boolean),
    favAs: favA.map(artifactById).filter(Boolean),
  };
}
function mrow(icon, label, sub, nav) {
  return '<div class="mrow" data-nav="' + nav + '"><span class="mi">' + icon + "</span><b>" + label +
    '</b><span class="msub">' + sub + '</span><span class="arrow">›</span></div>';
}
function renderMine() {
  const c = mineCounts();
  view.innerHTML =
    '<div class="mine-top"><h2>我的</h2><button class="gear" data-act="settings">' + ICON.gear + "</button></div>" +
    '<div class="mine-hero">' +
    '<div class="mine-avatar">博</div>' +
    "<b>逛博馆 · 把博物馆装进口袋</b>" +
    "<p>打卡 " + visited.length + " 馆 · 收藏文物 " + c.favAs.length + " 件 · 点亮 " + c.nProv + " 省</p>" +
    "</div>" +
    '<div class="mgrid">' +
    mrow(ICON.seal, "我的印章册", "已盖 " + visited.length + " / " + STAMP_TOTAL + " 枚", "mystamp") +
    mrow(ICON.pin, "省份足迹", "点亮 " + c.nProv + " 省", "myprov") +
    mrow(ICON.cal, "打卡记录", visited.length + " 次", "myvisit") +
    "</div>" +
    '<div class="mgrid">' +
    mrow(ICON.star, "我收藏的博物馆", (c.favMs.length + c.favGs.length) + " 家", "myfavm") +
    mrow(ICON.heart, "我收藏的文物", c.favAs.length + " 件", "myfava") +
    "</div>" +
    '<p class="foot-note">收藏与打卡只保存在这台设备的浏览器里<br>右上角的小齿轮里可以换城市、清空数据</p>';
}
function renderMyStamps() {
  view.innerHTML = subHead("我的印章册", "已盖 " + visited.length + " / " + STAMP_TOTAL + " 枚", "mine") + renderStamps();
}
function renderMyProv() {
  const c = mineCounts();
  view.innerHTML = subHead("省份足迹", "点亮 " + c.nProv + " 省", "mine") +
    '<div class="section-head"><h2>中国地图</h2><span class="sub">去过会点亮 · 点省份找馆</span></div>' +
    renderChinaMap(c.provs) +
    '<p class="foot-note">点亮省份里装着你拍的照片 / 代表文物<br>双指缩放、拖动地图 · 点亮省份点一下看当地博物馆</p>';
  if (document.getElementById("cnmap")) bindMapGestures();
}
function renderMyVisits() {
  const visits = visited.slice().reverse();
  view.innerHTML = subHead("打卡记录", visits.length ? visits.length + " 次" : "", "mine") +
    (visits.length
      ? '<div style="padding:2px 16px 0">' + visits.map(v => {
          const m = anyMuseum(v.id) || { name: "未知博物馆" };
          const isG = v.id.indexOf("g:") === 0;
          return '<div class="visit-row"><div class="stamp">已打卡</div>' +
            '<div><b data-go="' + (isG ? "g/" + esc(v.id.slice(2)) : "m/" + esc(v.id)) + '">' + esc(m.name) + "</b>" +
            "<p>" + esc(v.date) + (v.manual ? " · 补卡" : "") + "</p></div>" +
            '<button class="del" data-act="unvisit" data-id="' + esc(v.id) + '">取消打卡</button></div>';
        }).join("") + "</div>"
      : '<div class="empty"><span class="big">无</span>还没打过卡<br>打开任意博物馆页面，点「到馆打卡」<br>（打不上可以手动补卡）</div>' +
        '<button class="all-btn" data-nav="explore">去找馆 ›</button>') +
    '<p class="foot-note">到馆打卡得印章（2公里内才能盖）<br>点记录里的馆名可以进博物馆页面</p>';
}
function renderMyFavM() {
  const c = mineCounts();
  view.innerHTML = subHead("我收藏的博物馆", (c.favMs.length + c.favGs.length) + " 家", "mine") +
    ((c.favMs.length || c.favGs.length)
      ? '<div class="favgrid">' + c.favMs.map(miniMuseumCard).join("") + c.favGs.map(miniGdCard).join("") + "</div>"
      : '<div class="slim-empty" data-nav="explore"><span>还没收藏博物馆 · 点进页面点 ♡ 就能收藏</span><span class="go">去找馆 ›</span></div>');
}
function renderMyFavA() {
  const c = mineCounts();
  view.innerHTML = subHead("我收藏的文物", c.favAs.length + " 件", "mine") +
    (c.favAs.length
      ? '<div class="favgrid">' + c.favAs.map(miniArtifactCard).join("") + "</div>"
      : '<div class="slim-empty" data-nav="relics"><span>还没收藏文物 · 看到喜欢的点 ♡</span><span class="go">去文物库 ›</span></div>');
}
function openSettings() {
  const man = manualCity();
  showModalHTML("<h4>设置</h4>" +
    '<div class="setlist">' +
    '<button class="setrow" data-act="pickcity"><span class="mi">' + ICON.pin + "</span><b>定位城市</b>" +
    '<span class="msub">' + (man ? esc(man.city) : "自动定位") + '</span><span class="arrow">›</span></button>' +
    '<button class="setrow" data-act="about"><span class="mi">' + ICON.info + '</span><b>关于逛博馆</b><span class="arrow">›</span></button>' +
    '<button class="setrow danger" data-act="clear"><span class="mi">' + ICON.trash + '</span><b>清空我的数据</b><span class="arrow">›</span></button>' +
    "</div>");
}
function openAbout() {
  showModalHTML("<h4>关于逛博馆</h4>" +
    '<p class="city-note">把博物馆装进口袋 · 纯本地保存的网页App<br><br>' +
    "42家精选馆（人工整理）＋ 全国国家定级博物馆（名录整理自公开资料）<br><br>" +
    "收藏、打卡、照片只存在这台设备里，不上传<br><br>" +
    "资料整理自公开数据，出行与票价以博物馆官方为准</p>" +
    '<div class="modal-btns"><button class="btn btn-red" data-act="modal-close">知道了</button></div>');
}

/* ================= 博物馆详情 ================= */
function renderMuseum(m) {
  const arts = museumsArtifacts(m.id);
  const isFav = favM.includes(m.id);
  const isVis = visited.some(v => v.id === m.id);
  view.innerHTML =
    '<div class="hero hero-cover">' + mediaHTML(m.cover, m.name) +
    '<div class="veil"></div>' +
    '<button class="float-btn back" data-act="back">' + BACK_SVG + "</button>" +
    '<button class="float-btn fav' + (isFav ? " on" : "") + '" data-act="favM" data-id="' + esc(m.id) + '">' +
    (isFav ? "♥" : "♡") + "</button>" +
    '<div class="h-title"><h2>' + esc(m.name) + "</h2><p>" + esc(m.city) + " · " + esc(m.tagline || "") + "</p></div>" +
    "</div>" +
    '<div class="dbody">' +
    '<div class="panel"><span class="lead-tag">博物馆简介</span><p class="lead">' + esc(m.intro) + "</p>" +
    '<div class="chipline">' +
    (isFirstLevel(m.id) ? '<span class="pill level">国家一级博物馆</span>' : "") +
    '<span class="pill">' + esc(m.province) + "</span>" +
    "<span class=\"pill\">镇馆之宝 " + arts.length + " 件</span>" +
    (isVis ? '<span class="pill red">✓ 已打卡</span>' : "") + "</div>" +
    '<button class="tts-btn" data-act="tts" data-kind="m" data-id="' + esc(m.id) + '" data-label="听简介">' +
    EAR_SVG + " 听简介</button></div>" +
    (userPhotos[m.id] ?
      '<div class="panel"><span class="lead-tag">我的打卡照片</span>' +
      '<img src="' + userPhotos[m.id] + '" alt="打卡照片" style="width:100%;border-radius:12px;display:block;margin-top:8px">' +
      "</div>" : "") +
    '<div class="panel"><span class="lead-tag">参观攻略</span><div class="info-rows">' +
    '<div class="irow"><span class="lab">开放时间</span><span class="val">' + esc(m.hours) + "</span></div>" +
    '<div class="irow"><span class="lab">门票</span><span class="val">' + esc(m.ticket) + "</span></div>" +
    '<div class="irow"><span class="lab">预约方式</span><span class="val">' + esc(m.booking) + "</span></div>" +
    '<div class="irow"><span class="lab">建议时长</span><span class="val">' + esc(m.duration) + "</span></div>" +
    '<div class="irow"><span class="lab">怎么去</span><span class="val">' + esc(m.transport) + "</span></div>" +
    "</div>" +
    '<div class="action-row">' +
    '<button class="btn ' + (isVis ? "btn-red on" : "btn-red") + '" data-act="visit" data-id="' + esc(m.id) + '">' +
    (isVis ? "✓ 已打卡" : "到馆打卡") + "</button>" +
    '<a class="btn btn-gold" href="' + amapUrl(m) + '" target="_blank" rel="noopener">导航过去</a>' +
    "</div>" +
    (isVis ? '<div class="action-row" style="margin-top:10px">' +
      '<button class="btn btn-line" data-act="photo-upload" data-id="' + esc(m.id) + '">' +
      (userPhotos[m.id] ? "📷 换一张打卡照片" : "📷 上传打卡照片") + "</button>" +
      (userPhotos[m.id] ? '<button class="btn btn-line" data-act="photo-del" data-id="' + esc(m.id) + '">删除照片</button>' : "") +
      "</div>" : "") +
    "</div>" +
    '<div class="section-head"><h2>镇馆之宝</h2><span class="sub">' + arts.length + " 件</span></div>" +
    '<div class="hscroll">' + arts.map(hotCard).join("") + "</div>" +
    '<p class="foot-note">开放时间与票价可能调整，出发前请以官方公告为准</p>' +
    "</div>";
}

/* ================= 文物详情 ================= */
function renderArtifact(a) {
  const m = museumById(a.museumId) || { name: "未知博物馆", city: "" };
  const dt = ART_DETAILS[a.id] || {};
  const isFav = favA.includes(a.id);
  const num = "GBG-" + String(ARTIFACTS.indexOf(a) + 1).padStart(3, "0");
  const drow = (lab, val) => val
    ? '<div class="irow"><span class="lab">' + lab + '</span><span class="val">' + esc(val) + "</span></div>" : "";
  view.innerHTML =
    '<div class="hero">' + mediaHTML(a.id, a.name) +
    '<div class="veil"></div>' +
    '<button class="float-btn back" data-act="back">' + BACK_SVG + "</button>" +
    '<button class="float-btn fav' + (isFav ? " on" : "") + '" data-act="favA" data-id="' + esc(a.id) + '">' +
    (isFav ? "♥" : "♡") + "</button>" +
    '<div class="h-title"><h2>' + esc(a.name) + "</h2><p>" + esc(a.dynasty) + " · " + esc(a.category) + "</p></div>" +
    "</div>" +
    '<div class="dbody">' +
    '<div class="panel">' +
    (a.hot > 0 ? '<span class="lead-tag">网红热榜 No.' + a.hot + "</span>" : "") +
    '<div class="chipline" style="margin-top:' + (a.hot > 0 ? "4px" : "0") + '">' +
    '<span class="pill">' + esc(a.dynasty) + "</span>" +
    '<span class="pill">' + esc(a.category) + "</span>" +
    (a.alias ? '<span class="pill">也叫：' + esc(a.alias) + "</span>" : "") +
    (dt.textbook ? '<span class="pill book">📖 历史课本常客</span>' : "") +
    "</div>" +
    '<p class="lead" style="margin-top:12px">' + esc(a.intro) + "</p>" +
    '<button class="tts-btn" data-act="tts" data-kind="a" data-id="' + esc(a.id) + '" data-label="听讲解">' +
    EAR_SVG + " 听讲解</button></div>" +
    '<div class="panel"><span class="lead-tag">文物档案</span><div class="info-rows">' +
    drow("年代", dt.era) + drow("材质", dt.material) + drow("尺寸重量", dt.size) +
    drow("出土·征集", dt.origin) + drow("用途", dt.usage) + drow("所属人群", dt.owner) +
    drow("档案号", num + "（逛博馆自编号）") +
    (dt.tbpage ? drow("课本位置", dt.tbpage) : "") +
    "</div></div>" +
    '<div class="fact-card"><h4>◆ 冷知识</h4><p>' + esc(a.fact) + "</p></div>" +
    (dt.marks ? '<div class="panel"><span class="lead-tag">纹饰与文字</span><p class="lead" style="margin-top:8px">' + esc(dt.marks) + "</p></div>" : "") +
    ((dt.background || dt.value) ?
      '<div class="panel"><span class="lead-tag">时代背景 · 历史价值</span>' +
      (dt.background ? '<p class="lead" style="margin-top:8px">' + esc(dt.background) + "</p>" : "") +
      (dt.value ? '<p class="lead" style="margin-top:10px">' + esc(dt.value) + "</p>" : "") +
      "</div>" : "") +
    '<div class="section-head"><h2>它在哪儿</h2></div>' +
    '<div class="panel"><div class="mini-museum" data-go="m/' + esc(m.id) + '">' +
    mediaHTML(m.cover, m.name) +
    "<div><b>" + esc(m.name) + "</b><p>" + esc(m.city) + " · 点我看参观攻略</p></div>" +
    '<span class="arrow">›</span></div>' +
    (m.coord ? '<div class="action-row" style="margin-top:12px">' +
      '<a class="btn btn-gold" href="' + amapUrl(m) + '" target="_blank" rel="noopener">导航去这家博物馆</a></div>' : "") +
    "</div>" +
    '<p class="foot-note">同一家博物馆的宝贝还有不少，点上面的卡片去逛逛</p>' +
    "</div>";
}

/* ================= 收藏 / 打卡 ================= */
function toggleFavM(id) {
  favM = favM.includes(id) ? favM.filter(x => x !== id) : favM.concat(id);
  saveFavs();
  const on = favM.includes(id);
  document.querySelectorAll('.float-btn.fav[data-act="favM"]').forEach(b => {
    b.classList.toggle("on", on); b.textContent = on ? "♥" : "♡";
  });
  document.querySelectorAll('button[data-act="favM"]').forEach(b => { b.textContent = on ? "♥ 已收藏" : "♡ 收藏"; });
  toast(on ? "已收藏 ♥" : "已取消收藏");
}
function toggleFavG(name) {
  favG = favG.includes(name) ? favG.filter(x => x !== name) : favG.concat(name);
  LS.set("gbg_fav_g", favG);
  const on = favG.includes(name);
  document.querySelectorAll('button[data-act="favG"]').forEach(b => { b.textContent = on ? "♥ 已收藏" : "♡ 收藏"; });
  toast(on ? "已收藏 ♥" : "已取消收藏");
}
function toggleFavA(id) {
  favA = favA.includes(id) ? favA.filter(x => x !== id) : favA.concat(id);
  saveFavs();
  const on = favA.includes(id);
  document.querySelectorAll('.float-btn.fav[data-act="favA"]').forEach(b => {
    b.classList.toggle("on", on); b.textContent = on ? "♥" : "♡";
  });
  toast(on ? "已收藏 ♥" : "已取消收藏");
}
function showModalHTML(inner) {
  closeModal();
  const el = document.createElement("div");
  el.className = "modal-mask";
  el.id = "gbgModal";
  el.innerHTML = '<div class="modal-card">' + inner + "</div>";
  el.addEventListener("click", ev => { if (ev.target === el) closeModal(); });
  document.body.appendChild(el);
}
function closeModal() {
  const el = document.getElementById("gbgModal");
  if (el) el.remove();
}
function showVisitModal(m, msg, canManual) {
  showModalHTML("<h4>" + esc(m.name) + "</h4><p>" + esc(msg) + "</p>" +
    '<div class="modal-btns">' +
    (canManual ? '<button class="btn btn-line" data-act="visit-manual" data-id="' + esc(m.id) + '">手动补卡</button>' : "") +
    '<button class="btn btn-red" data-act="modal-close">' + (canManual ? "下次再来" : "知道了") + "</button></div>");
}
function modalCancelVisit(m) {
  showModalHTML("<h4>" + esc(m.name) + "</h4><p>要取消在这里的打卡吗？</p>" +
    '<div class="modal-btns">' +
    '<button class="btn btn-line" data-act="visit-undo" data-id="' + esc(m.id) + '">取消打卡</button>' +
    '<button class="btn btn-red" data-act="modal-close">保留</button></div>');
}
function doVisitCheck(m, opts) {
  if (visited.some(v => v.id === m.id)) return;
  const gps = !!(opts && opts.gps);
  visited.push({ id: m.id, date: todayStr(), gps: gps, manual: !gps });
  LS.set("gbg_visited", visited);
  const btn = view.querySelector('.btn[data-act="visit"]');
  if (btn) { btn.classList.add("on"); btn.innerHTML = "✓ 已打卡"; }
  const label = m.gd ? gdStampShort(m.gd) : stampName(m.id);
  toast("打卡成功 ✓ 获得印章「" + label + "」");
  render();   /* 刷新页面：让"上传打卡照片"等打卡后才出现的按钮即时现身 */
}
function distanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000, toR = x => x * Math.PI / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}
function fmtDist(d) { return d < 1000 ? Math.round(d) + "米" : (d / 1000).toFixed(1) + "公里"; }
function tryVisitGPS(m) {
  if (!navigator.geolocation) { showVisitModal(m, "这个浏览器不支持定位，可以手动补卡。", true); return; }
  if (!window.isSecureContext) {
    showVisitModal(m, "当前不是 https 环境，定位用不了（发布上线后就能自动定位打卡）。", true);
    return;
  }
  toast("正在定位…");
  navigator.geolocation.getCurrentPosition(
    pos => {
      const dist = distanceM(pos.coords.latitude, pos.coords.longitude, m.coord[1], m.coord[0]);
      if (dist <= 2000) {
        doVisitCheck(m, { gps: true });
        toast("打卡成功 ✓ 离馆门约 " + fmtDist(dist));
      } else {
        showVisitModal(m, "你离「" + m.name + "」还有约 " + fmtDist(dist) + "，到了博物馆附近再打卡哦～", true);
      }
    },
    err => {
      const why = err.code === 1 ? "定位权限被拒绝了" : err.code === 3 ? "定位超时了" : "定位失败了";
      showVisitModal(m, why + "，可以手动补卡。", true);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

/* ================= 路由 ================= */
let lastTab = "home";
function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const seg = h.split("/");
  return { page: seg[0] || "home", id: seg[1] ? decodeURIComponent(seg[1]) : "" };
}
function go(page, id) {
  const target = "#/" + page + (id ? "/" + encodeURIComponent(id) : "");
  if (location.hash === target) render();
  else location.hash = target;
}
function render() {
  TTS.stop(); resetTts();
  stopCarousel();                     /* 2026-10-08 离开页面即停掉每日五宝轮播 */
  const r = parseHash();
  const isDetail = r.page === "m" || r.page === "a";
  document.body.classList.toggle("detail", isDetail);
  const tabOfPage = { home: "home", explore: "explore", relics: "relics", shows: "shows", mine: "mine", topics: "relics", t: "relics", timeline: "relics", textbook: "relics", g: "explore", mystamp: "mine", myprov: "mine", myvisit: "mine", myfavm: "mine", myfava: "mine" };
  if (tabOfPage[r.page]) lastTab = tabOfPage[r.page];
  const active = isDetail ? lastTab : tabOfPage[r.page] || lastTab;
  document.querySelectorAll("#tabbar a").forEach(t =>
    t.classList.toggle("active", t.dataset.nav === active));
  window.scrollTo(0, 0);
  if (r.page === "home") renderHome();
  else if (r.page === "explore") renderExplore();
  else if (r.page === "relics") renderRelics();
  else if (r.page === "mine") renderMine();
  else if (r.page === "mystamp") renderMyStamps();
  else if (r.page === "myprov") renderMyProv();
  else if (r.page === "myvisit") renderMyVisits();
  else if (r.page === "myfavm") renderMyFavM();
  else if (r.page === "myfava") renderMyFavA();
  else if (r.page === "topics") renderTopics();
  else if (r.page === "timeline") renderTimeline();
  else if (r.page === "textbook") renderTextbook();
  else if (r.page === "g") { const g = GD.find(x => x.name === r.id); g ? renderGD(g) : go("explore"); }
  else if (r.page === "shows") renderShows();
  else if (r.page === "t") { const t = TOPICS.find(x => x.id === r.id); t ? renderTopic(t) : go("relics"); }
  else if (r.page === "m") { const m = museumById(r.id); m ? renderMuseum(m) : go("home"); }
  else if (r.page === "a") { const a = artifactById(r.id); a ? renderArtifact(a) : go("home"); }
  else go("home");
}
window.addEventListener("hashchange", render);

/* ================= 全局事件 ================= */
document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]");
  if (nav) { go(nav.dataset.nav); return; }
  const goEl = e.target.closest("[data-go]");
  if (goEl) { const s = goEl.dataset.go.split("/"); go(s[0], s[1]); return; }
  const pm = e.target.closest("[data-provmap]");
  if (pm) {
    const prov = pm.dataset.provmap;
    if (GD.some(g => g.prov === prov)) { exploreProv = prov; exploreLv = "定级"; exploreExpand = false; go("explore"); }
    else if (MUSEUMS.some(m => m.province === prov)) { exploreProv = prov; exploreLv = "精选"; exploreExpand = false; go("explore"); }
    else toast("暂未收录「" + prov + "」的博物馆，后续慢慢补");
    return;
  }
  const act = e.target.closest("[data-act]");
  if (act) {
    const id = act.dataset.id;
    const kind = act.dataset.act;
    if (kind === "back") {
      if (history.length > 1) history.back();
      else go(act.dataset.fb || "home");
    }
    else if (kind === "favM") toggleFavM(id);
    else if (kind === "favA") toggleFavA(id);
    else if (kind === "favG") toggleFavG(id);
    else if (kind === "visit") {
      const mm = anyMuseum(id);
      if (!mm) return;
      if (visited.some(v => v.id === id)) modalCancelVisit(mm);
      else tryVisitGPS(mm);
    }
    else if (kind === "visit-manual") {
      const mm = anyMuseum(id);
      if (mm) { doVisitCheck(mm, { manual: true }); closeModal(); }
    }
    else if (kind === "visit-undo") {
      visited = visited.filter(v => v.id !== id);
      LS.set("gbg_visited", visited);
      closeModal();
      render();
    }
    else if (kind === "modal-close") closeModal();
    else if (kind === "photo-upload") pickPhoto(id);
    else if (kind === "photo-del") {
      if (confirm("删除这张打卡照片吗？（印章背景会恢复默认）")) removePhoto(id);
    }
    else if (kind === "map-zoomin" || kind === "map-zoomout" || kind === "map-reset") {
      const svg = document.getElementById("cnmap");
      if (svg && svg._zoomBy) {
        const vb = svg.viewBox.baseVal;
        if (kind === "map-reset") svg._reset();
        else svg._zoomBy(kind === "map-zoomin" ? 1.35 : 0.74, { x: vb.width / 2, y: vb.height / 2 });
      }
    }
    else if (kind === "tts") {
      const item = act.dataset.kind === "a" ? artifactById(id) : museumById(id);
      if (item) speakText(act, act.dataset.kind === "a" ? artifactSpeech(item) : museumSpeech(item));
    }
    else if (kind === "reshuffle") nextBatch();
    else if (kind === "expand") { exploreExpand = !exploreExpand; renderExplore(); }
    else if (kind === "pickcity") openCityModal();
    else if (kind === "setcity") {
      const c = act.dataset.city || "";
      LS.set("gbg_city", c ? { city: c, prov: act.dataset.prov || "" } : null);
      closeModal();
      if (!c) requestGps(true);                            /* 切回自动定位 → 立刻用 GPS 定一次（比网络定位准） */
      fetchWeather(true);                                  /* 天气跟着换城市 */
      paintCityZone();
    }
    else if (kind === "cityall") {
      const c = act.dataset.city || "";
      if (c) { explorePreQ = c; }                           /* 有城市 → 找馆页直接搜这个城市 */
      else { exploreProv = act.dataset.prov || "全部"; exploreLv = "定级"; exploreExpand = false; }
      go("explore");
    }
    else if (kind === "stampexpand") { stampsExpanded = !stampsExpanded; render(); }
    else if (kind === "settings") openSettings();
    else if (kind === "about") openAbout();
    else if (kind === "nextquote") {
      quoteOffset++;
      const q = view.querySelector("[data-act='nextquote']");
      if (q) q.textContent = "❖ " + currentQuote() + " ❖";
    }
    else if (kind === "hotall") { relicCat = "网红榜"; relicQ = ""; go("relics"); }
    else if (kind === "unvisit") {
      visited = visited.filter(v => v.id !== id);
      LS.set("gbg_visited", visited); render();
    } else if (kind === "clear") {
      if (confirm("确定清空收藏和打卡记录吗？清空后无法恢复。")) {
        favM = []; favA = []; favG = []; visited = []; saveFavs(); LS.set("gbg_fav_g", favG);
        LS.set("gbg_visited", visited); closeModal(); render();
        toast("已清空");
      }
    }
    return;
  }
  const prov = e.target.closest("[data-prov]");
  if (prov) { exploreProv = prov.dataset.prov; exploreExpand = false; renderExplore(); return; }
  const lv = e.target.closest("[data-lv]");
  if (lv) { const v = lv.dataset.lv; exploreLv = isNaN(+v) ? v : +v; exploreExpand = false; renderExplore(); return; }
  const cat = e.target.closest("[data-cat]");
  if (cat) { relicCat = cat.dataset.cat; renderRelics(); return; }
});
window.addEventListener("scroll", () => {
  topbar.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* ================= 启动 ================= */
(function init() {
  if (!MUSEUMS.length || !ARTIFACTS.length) {
    document.body.classList.remove("detail");
    view.innerHTML = '<div class="empty" style="padding-top:90px">' +
      '<span class="big">!</span>数据文件没有加载成功<br><br>' +
      "请确认「逛博馆」是<b>整个文件夹</b>一起打开的<br>" +
      "（不要只把 逛博馆.html 拖出来单独打开）</div>";
    return;
  }
  TTS.init();
  paintTopMeta();
  requestGps();                 /* 2026-10-08：优先 GPS（网络定位中小城市会偏到省会，如新余→南昌）；GPS 回来会自动重取天气 */
  if (autoPos()) fetchWeather();
  else setTimeout(function () {          /* 完全无定位：GPS 8秒没回来（如权限弹窗挂着）→ 网络定位兜底 */
    if (!Weather.data && !autoPos()) fetchWeather(true);
  }, 8500);
  setInterval(paintTopMeta, 20000);
  setInterval(function () { fetchWeather(); }, 30 * 60 * 1000);
  /* 切回页面/窗口时主动刷新：后台标签页的定时器会被浏览器冻结，不刷新的话天气会一直是切走前那会儿的 */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { requestGps(); fetchWeather(); paintTopMeta(); }
  });
  window.addEventListener("focus", function () { fetchWeather(); });
  if (!location.hash) location.hash = "#/home";
  render();
  loadUserPhotos().then(() => {
    const r = parseHash();
    if (["mine", "mystamp", "m", "g"].includes(r.page)) render();
  });
})();

})();
