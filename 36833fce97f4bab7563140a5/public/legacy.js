/* ================================================================
   家庭伴学台 · 云端版
   —— 五学段内容库与家庭共享
   ================================================================ */

/* ---------- 1. 本地存档 ---------- */
const KEY = "banxuetai-v2";

const SESSION_FLAG = "banxuetai-v2-mode"; // "cloud" | "local"

/* —— 学段槽位定义（v4 多家庭）：5 个年龄段各有一个独立工作台，每个槽位可绑定一个孩子 —— */
const KID_SLOTS = ["baby", "guoguo", "xiaoyu", "junior", "senior"];
const SLOT_META = {
  baby:   { stage: "婴幼儿", ages: "0—3 岁",  cls: "s1", view: "view-baby",   emoji: "🍼", deep: "tool" },
  guoguo: { stage: "学龄前", ages: "3—6 岁",  cls: "s2", view: "view-guoguo", emoji: "🌸", deep: true },
  xiaoyu: { stage: "小学",   ages: "6—12 岁", cls: "s3", view: "view-xiaoyu", emoji: "⚽", deep: true },
  junior: { stage: "初中",   ages: "12—15 岁", cls: "s4", view: "view-junior", emoji: "🧭", deep: false },
  senior: { stage: "高中",   ages: "15—18 岁", cls: "s5", view: "view-senior", emoji: "🔭", deep: false }
};
const KID_DEFAULT_NAME = { baby: "宝宝", guoguo: "果果", xiaoyu: "小宇", junior: "澄澄", senior: "彦彦" };
const KID_EMOJIS = ["🌸", "⚽", "🍼", "🦊", "🐰", "🐯", "🚀", "🎨", "🌟", "🐬", "🧸", "🍀"];

const DEFAULTS = {
  v: 5, seen: false, day: "",
  /* —— 家庭共享机制（v3）：心愿池 / 家庭挑战 / 陪伴记录 —— */
  wishes: [
    { id: "w1", emoji: "🏝️", title: "一起去海边", target: 300, saved: 86, by: "妈妈",
      note: "全家一起攒星星，暑假去看海", done: false, doneAt: "", contrib: { guoguo: 0, xiaoyu: 0 } },
    { id: "w2", emoji: "🧁", title: "一起做生日蛋糕", target: 120, saved: 0, by: "爸爸",
      note: "奶奶生日那天，我们自己做一个", done: false, doneAt: "", contrib: { guoguo: 0, xiaoyu: 0 } }
  ],
  challenges: [
    { id: "c1", emoji: "📖", title: "全家共读《夏洛的网》", desc: "每个成员读完一章就来打卡",
      by: "妈妈", due: "本周日", per: 3, bonus: 9, done: false, doneAt: "",
      members: [{ name: "妈妈", done: false }, { name: "爸爸", done: false }, { name: "奶奶", done: false }, { name: "小宇", done: false }] },
    { id: "c2", emoji: "🌳", title: "周末去公园找 5 种叶子", desc: "果果负责捡，小宇负责认，奶奶拍照",
      by: "奶奶", due: "本周六", per: 2, bonus: 6, done: false, doneAt: "",
      members: [{ name: "果果", done: false }, { name: "小宇", done: false }, { name: "奶奶", done: false }] }
  ],
  care: [
    { id: "k1", who: "奶奶", child: "guoguo", act: "共读绘本", detail: "《猜猜我有多爱你》", min: 15, day: "2026-10-12" },
    { id: "k2", who: "妈妈", child: "xiaoyu", act: "一起做手工", detail: "雨水循环模型", min: 40, day: "2026-10-11" },
    { id: "k3", who: "奶奶", child: "guoguo", act: "讲故事", detail: "", min: 10, day: "2026-10-10" }
  ],
  stars: { guoguo: 8, xiaoyu: 12 },
  earned: { guoguo: 0, xiaoyu: 0 },
  caps: { guoguo: 15, xiaoyu: 20 },
  done: { guoguo: {}, xiaoyu: {} },
  bonus: { guoguo: false, xiaoyu: false },
  streak: { guoguo: 3, xiaoyu: 5 },
  wrongBook: [],
  seenCards: { guoguo: [], xiaoyu: [] },
  answered: { guoguo: [], xiaoyu: [] },
  requests: [],
  guardian: { enabled: true, min: 20 },
  feed: [
    { icon: "👵", text: "奶奶陪果果读了《猜猜我有多爱你》，陪伴打卡 +1", time: "今天" },
    { icon: "✅", text: "妈妈确认了小宇的兑换申请：周末去公园", time: "昨天" },
    { icon: "🏝️", text: "全家心愿又近了一步：+9 ⭐", time: "昨天" }
  ],
  jstate: {}, sstep: 0, sDefense: false,
  archive: {
    guoguo: [
      { d: "10月12日", x: "背完了《咏鹅》，还读给奶奶听（文化品格力 · 沟通力）" },
      { d: "10月10日", x: "连对 5 道数感题，自己拍手笑了（思维力）" },
      { d: "10月8日", x: "第一次和妈妈共读《猜猜我有多爱你》（沟通力）" }
    ],
    xiaoyu: [
      { d: "10月13日", x: "「雨水去哪儿了」项目：画完了雨水旅行路线图（思维力）" },
      { d: "10月11日", x: "口算闯关 6 题全对（学习力）" },
      { d: "10月9日", x: "给奶奶讲了「糖去哪儿了」的小实验（沟通力）" }
    ]
  },
  history: {},          // { "YYYY-MM-DD": {guoguo: 星数, xiaoyu: 星数} }
  tally: { guoguo: { cards: 18, quiz: 12, poems: ["pm1", "pm3"], sci: 0, words: 0, proj: [], quizPerfect: 1, read: 0, starsTotal: 96, bonusCount: 0 },
           xiaoyu: { cards: 0, quiz: 22, poems: [], sci: 2, words: 12, proj: ["pj1"], quizPerfect: 2, read: 4, starsTotal: 148, bonusCount: 1 } },
  prefs: {
    guoguo: { cardPacks: ["gpk1", "gpk2"], quizPacks: ["gq1", "gq2"], dailyCards: 5, dailyGQuiz: 3 },
    xiaoyu: { wordPacks: ["wpk1", "wpk2"], quizPacks: ["xq1", "xq2"], dailyXQuiz: 6, dailyWords: 5 }
  },
  rot: { guoguoCards: 0, guoguoQuiz: 0, guoguoPoem: 0, xiaoyuWords: 0, xiaoyuQuiz: 0,
         xiaoyuSci: 0, xiaoyuProj: 0, babyCards: 0, babyTips: 0, juniorBoard: 0,
         juniorCards: 0, juniorTopic: 0, seniorTopic: 0, seniorRead: 0, seniorAI: 0 },
  /* —— 家庭配置（v4 多家庭）：家庭名 + 每个学段槽位的孩子（名字 / 头像 / 是否启用）—— */
  family: {
    name: "", onboarded: false, demo: false,
    kids: {
      baby:   { on: false, name: "", emoji: "🍼" },
      guoguo: { on: false, name: "", emoji: "🌸" },
      xiaoyu: { on: false, name: "", emoji: "⚽" },
      junior: { on: false, name: "", emoji: "🧭" },
      senior: { on: false, name: "", emoji: "🔭" }
    }
  },
  /* —— 知识库（v4）：内容包版本 —— */
  libSeen: "",
  /* —— 家长锦囊（v5）：每周一问的自留地，供家长记录，不进孩子的统计；获授权成员共享 —— */
  checkins: []
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function deepMerge(base, over) {
  const out = clone(base);
  if (!over || typeof over !== "object") return out;
  Object.keys(over).forEach(k => {
    const v = over[k];
    if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else if (v !== undefined) { out[k] = v; }
  });
  return out;
}
let DB = clone(DEFAULTS);
function loadLocal() {
  let raw = null;
  let d;
  try { d = deepMerge(DEFAULTS, raw || {}); } catch (e) { d = clone(DEFAULTS); }
  migrateDB(d, !!raw);
  return d;
}
/* v2 → v3：把旧的「单一心愿 / 单一挑战」折叠进新的家庭共享结构
   v3 → v4：建立家庭配置——老存档视为「已初始化的小禾家」；全新用户触发初始化向导 */
function migrateDB(d, hasSaved) {
  if (!d) return;
  if ((d.v || 0) < 3) {
    if (Array.isArray(d.wishes) && d.wishes[0]) {
      if (d.wish && typeof d.wish === "object") {
        if (typeof d.wish.target === "number" && d.wish.target > 0) d.wishes[0].target = d.wish.target;
        if (typeof d.wish.current === "number") d.wishes[0].saved = d.wish.current;
      }
      if (d.wishName) d.wishes[0].title = d.wishName;
    }
    d.v = 3;
    delete d.wish; delete d.wishName; delete d.challenge;
  }
  if ((d.v || 0) < 4) {
    const f = (d.family && typeof d.family === "object") ? d.family : (d.family = {});
    if (typeof f.onboarded !== "boolean") f.onboarded = !!hasSaved;
    if (typeof f.demo !== "boolean") f.demo = false;
    if (typeof f.name !== "string") f.name = "";
    if (!f.kids || typeof f.kids !== "object") f.kids = {};
    KID_SLOTS.forEach(s => {
      const k = f.kids[s];
      if (!k || typeof k !== "object") {
        f.kids[s] = { on: false, name: "", emoji: SLOT_META[s].emoji };
      } else {
        if (typeof k.on !== "boolean") k.on = !!k.name;
        if (typeof k.name !== "string") k.name = "";
        if (!k.emoji) k.emoji = SLOT_META[s].emoji;
      }
    });
    if (hasSaved) {
      /* 老存档 = 原来的演示家庭：把果果 / 小宇两个槽位接续上 */
      if (!f.name) f.name = "小禾家";
      [["guoguo", "果果"], ["xiaoyu", "小宇"]].forEach(p => {
        const k = f.kids[p[0]];
        if (!k.name) { k.on = true; k.name = p[1]; k.emoji = SLOT_META[p[0]].emoji; }
      });
    }
    d.v = 4;
  }
  if ((d.v || 0) < 5) {
    /* v4 → v5：家长锦囊「每周一问」——一周只留一条，覆盖不追加 */
    if (!Array.isArray(d.checkins)) d.checkins = [];
    d.v = 5;
  }
}
function saveLocal() {}
function $(id) { return document.getElementById(id); }

/* ---------- 1.5 家庭配置读取（v4 多家庭） ---------- */
function kidOf(slot) { return (DB.family && DB.family.kids && DB.family.kids[slot]) || null; }
function KN(slot) { const k = kidOf(slot); return (k && k.name) ? k.name : ""; }
function KNS(slot) { const k = kidOf(slot); return (k && k.name) ? k.name : (KID_DEFAULT_NAME[slot] || "宝贝"); }
function KE(slot) { const k = kidOf(slot); return (k && k.emoji) ? k.emoji : ((SLOT_META[slot] || {}).emoji || "⭐"); }
function kidsOn() { return KID_SLOTS.filter(s => { const k = kidOf(s); return !!(k && k.on); }); }
function famName() {
  if (DB.family && DB.family.name) return DB.family.name;
  try { if (mode === "cloud" && currentUser && currentUser.name) return currentUser.name + "家"; } catch (e) {}
  return "我们家";
}
/* 家庭内成员（家长 + 孩子），用于挑战打卡与陪伴记录 */
function familyMembers() { return ["妈妈", "爸爸", "奶奶"].concat(kidsOn().map(s => KNS(s))); }
/* 显示名 → 槽位（把「果果」这类名字映射回 guoguo / xiaoyu） */
function slotByName(nm) {
  const hit = kidsOn().find(s => KNS(s) === nm);
  if (hit) return hit;
  return nm === "果果" ? "guoguo" : nm === "小宇" ? "xiaoyu" : null;
}
/* 确保某个槽位的数据桶存在（新添加孩子 / 重新启用时调用） */
function ensureKidBucket(slot) {
  if (!DB.done[slot] || typeof DB.done[slot] !== "object") DB.done[slot] = {};
  if (!Array.isArray(DB.seenCards[slot])) DB.seenCards[slot] = [];
  if (!Array.isArray(DB.answered[slot])) DB.answered[slot] = [];
  if (!Array.isArray(DB.archive[slot])) DB.archive[slot] = [];
  ["stars", "earned", "streak"].forEach(k => {
    if (!DB[k] || typeof DB[k][slot] !== "number") { DB[k] = DB[k] || {}; DB[k][slot] = 0; }
  });
  if (!DB.caps || typeof DB.caps[slot] !== "number") {
    DB.caps = DB.caps || {}; DB.caps[slot] = (slot === "guoguo" || slot === "baby") ? 15 : 20;
  }
  if (!DB.bonus || typeof DB.bonus[slot] !== "boolean") { DB.bonus = DB.bonus || {}; DB.bonus[slot] = false; }
  if (!DB.tally[slot]) DB.tally[slot] = { cards: 0, quiz: 0, poems: [], sci: 0, words: 0, proj: [], quizPerfect: 0, read: 0, starsTotal: 0, bonusCount: 0 };
  if (!DB.prefs[slot] || typeof DB.prefs[slot] !== "object") {
    const tpl = (DEFAULTS.prefs && DEFAULTS.prefs[slot]) || (DEFAULTS.prefs && DEFAULTS.prefs.guoguo) || {};
    DB.prefs[slot] = JSON.parse(JSON.stringify(tpl));
  }
}
function ensureAllBuckets() { KID_SLOTS.forEach(ensureKidBucket); }

/* 家庭空间由平台授权，数据保存在绑定的数据库。 */
let currentUser = {name: "家人"}, mode = "cloud", syncState = "idle", syncTimer = null, lastSyncedAt = 0;
let revision = 0, saving = false, dirty = false, conflicted = false;
function hideAuth() { $("authScreen").style.display = "none"; $("appRoot").style.display = "block"; }
function paintSyncChip() { const txt = $("syncTxt"), icon = $("syncIcon"); if (!txt) return; txt.textContent = syncState === "saving" ? "同步中" : syncState === "error" ? "同步失败" : "已同步"; icon.textContent = syncState === "error" ? "⚠️" : "☁️"; }
function scheduleSync() { dirty = true; syncState = "saving"; paintSyncChip(); clearTimeout(syncTimer); syncTimer = setTimeout(cloudPush, 500); }
async function cloudPush() {
 if (saving || !dirty || conflicted) return false;
 saving = true; dirty = false; const payload = JSON.stringify(DB), expected = revision;
 try { const changed = await window.familyStore.write(payload, expected); if (!changed) { conflicted = true; syncState = "error"; toast("家人已更新数据，请先导出备份后刷新页面"); return false; } revision++; lastSyncedAt = Date.now(); syncState = "saved"; return true; }
 catch (e) { conflicted = true; syncState = "error"; console.error("同步结果未确认", e); toast("同步未确认，请先导出备份后刷新页面"); return false; }
 finally { saving = false; paintSyncChip(); if (dirty && !conflicted) scheduleSync(); }
}
function syncNow(manual) { if (conflicted) { toast("请先导出备份后刷新页面"); return; } scheduleSync(); if (manual) toast("正在同步"); }
function openAccount() { $("accountBody").innerHTML = '<p>家庭成员通过应用分享共同使用此空间。数据保存在云端。</p><button class="btn primary" data-click="syncNow(true)">🔄 立即同步</button> <button class="btn" data-click="exportData()">导出备份</button>'; openModal("modalAccount"); }
/* ================================================================
   初始化向导（v1.3）：打造你家的伴学台
   —— 命名家庭 · 添加孩子（名字 + 学段）· 或先看示例家庭
   ================================================================ */
let ob = { step: 0, name: "", kids: [] };
function maybeOnboard() { if (!DB.family || !DB.family.onboarded) showOnboard(); }
function showOnboard() {
  ob = { step: 0, name: DB.family.name || "", kids: [] };
  $("onboardScreen").style.display = "flex";
  document.body.style.overflow = "hidden";
  paintOnboard();
}
function hideOnboard() {
  $("onboardScreen").style.display = "none";
  document.body.style.overflow = "";
}
function obGo(s) { ob.step = s; paintOnboard(); }
function obPickStage(idx, slot) {
  if (!ob.kids[idx]) ob.kids[idx] = { slot: null, name: "", emoji: "" };
  ob.kids[idx].slot = slot;
  if (!ob.kids[idx].emoji) ob.kids[idx].emoji = SLOT_META[slot].emoji;
  paintOnboard();
}
function obNameNext() {
  const inp = $("obNameIn"); if (inp) ob.name = inp.value;
  obGo(2);
}
function obKidNext(idx) {
  const k = ob.kids[idx]; if (!k) return;
  const inp = $("obKidIn"); if (inp) k.name = inp.value;
  if (!(k.name || "").trim()) { toast("先给孩子起个名字吧 ✍️"); return; }
  if (!k.slot) { toast("给 TA 选一个适合的学段吧"); return; }
  if (idx === 0) obGo(3); else obGo(4);
}
function obSkipKid2() { ob.kids[1] = null; obGo(4); }
function paintOnboard() {
  const s = ob.step, el = $("obBody"); if (!el) return;
  $("obStep").textContent = (s >= 1 && s <= 3) ? ("第 " + s + " 步 / 共 3 步") : "";
  let h = "";
  if (s === 0) {
    h = '<div class="ob-h">打造你家的伴学台 🏡</div>' +
      '<p class="ob-sub">把应用分享给家人，大家共同使用同一个家庭空间——孩子的名字和学段，由你亲自来定。</p>' +
      '<div style="display:grid;gap:9px">' +
        '<div class="ob-opt" style="cursor:default"><span class="em2">👧</span><div><b>每个孩子一个专属工作台</b><span class="muted">按学段自动匹配学习内容，星星与成长档案各自独立</span></div></div>' +
        '<div class="ob-opt" style="cursor:default"><span class="em2">🏡</span><div><b>全家一起参与</b><span class="muted">心愿池 · 家庭挑战 · 陪伴记录，让努力被看见</span></div></div>' +
        '<div class="ob-opt" style="cursor:default"><span class="em2">☁️</span><div><b>登录后多设备同步</b><span class="muted">数据只属于你家，别的家庭看不见</span></div></div>' +
      '</div>' +
      '<div class="ob-foot"><button class="btn primary lg grow" data-click="obGo(1)">开始创建我家的伴学台</button></div>' +
      '<div class="ob-foot" style="margin-top:2px"><button class="btn lg grow" data-click="obDemo()">先看看示例家庭（小禾家）</button></div>';
  } else if (s === 1) {
    h = '<div class="ob-h">你家叫什么名字？</div>' +
      '<p class="ob-sub">会显示在首页、成长档案和导出的长图上。之后在家长中心随时可以改。</p>' +
      '<div class="fld2"><label for="obNameIn">家庭名</label><input id="obNameIn" maxlength="10" placeholder="例如：小禾家" value="' + esc(ob.name) + '" data-input="ob.name=this.value"></div>' +
      '<div class="ob-foot"><button class="btn" data-click="obGo(0)">← 上一步</button><button class="btn primary grow" data-click="obNameNext()">下一步</button></div>';
  } else if (s === 2 || s === 3) {
    const idx = s - 2;
    if (!ob.kids[idx]) ob.kids[idx] = { slot: null, name: "", emoji: "" };
    const kid = ob.kids[idx];
    const taken = ob.kids.filter((k, i) => k && i !== idx && k.slot).map(k => k.slot);
    h = '<div class="ob-h">' + (idx === 0 ? "第一个孩子 👧" : "还有第二个孩子吗？👦") + '</div>' +
      '<p class="ob-sub">' + (idx === 0
        ? "给 TA 起个名字（小名就好），再选一个学段——TA 会得到该学段专属的工作台。"
        : "没有就跳过；以后在「家长中心 → 家庭档案」里也能随时添加。") + '</p>' +
      '<div class="fld2"><label for="obKidIn">孩子的名字</label><input id="obKidIn" maxlength="8" placeholder="例如：果果" value="' + esc(kid.name) + '" data-input="if(ob.kids[' + idx + '])ob.kids[' + idx + '].name=this.value"></div>' +
      '<div style="margin-top:12px"><div class="muted" style="margin-bottom:6px">选择学段：</div>' +
      KID_SLOTS.map(s2 => {
        const m2 = SLOT_META[s2], isTaken = taken.indexOf(s2) >= 0, sel = kid.slot === s2;
        const note = m2.deep === false ? " · 体验版" : (m2.deep === "tool" ? " · 家长工具" : "");
        return '<div class="ob-opt' + (sel ? " sel" : "") + (isTaken ? " dis" : "") + '"' +
          (isTaken ? "" : ' data-click="obPickStage(' + idx + ',\'' + s2 + '\')"') + '>' +
          '<span class="em2">' + m2.emoji + '</span><div><b>' + m2.stage + '</b><span class="muted">' + m2.ages + note + (isTaken ? " · 已给另一个孩子" : "") + '</span></div></div>';
      }).join("") +
      '</div>' +
      '<div class="ob-foot">' +
        '<button class="btn" data-click="obGo(' + (s - 1) + ')">← 上一步</button>' +
        (idx === 1 ? '<button class="btn" data-click="obSkipKid2()">先跳过</button>' : "") +
        '<button class="btn primary grow" data-click="obKidNext(' + idx + ')">' + (idx === 0 ? "下一步" : "完成") + '</button>' +
      '</div>';
  } else if (s === 4) {
    const picked = (ob.kids || []).filter(k => k && k.slot);
    h = '<div class="ob-h">一切就绪 🎉</div>' +
      '<p class="ob-sub">「' + esc((ob.name || "").trim() || "我们家") + '」的伴学台建好啦：</p>' +
      (picked.length ? picked.map(k => {
        const m2 = SLOT_META[k.slot];
        return '<div class="ob-kid-preview"><span class="em2">' + (k.emoji || m2.emoji) + '</span><div><b>' + esc((k.name || "").trim()) + '</b>' +
          '<span class="muted" style="display:block;font-size:12.6px">' + m2.stage + ' · ' + m2.ages + ' 工作台</span></div></div>';
      }).join("") : '<div class="muted">还没有孩子——稍后可在「家长中心 → 家庭档案」里添加。</div>') +
      '<div class="muted" style="margin-top:8px;font-size:12.6px;line-height:1.85">小提示：星星只靠完成任务获得、每天有上限；兑换奖励需要家长确认——这是平台的铁律，也是它和「电子保姆」的区别。</div>' +
      '<div class="ob-foot"><button class="btn" data-click="obGo(3)">← 上一步</button><button class="btn primary grow" data-click="obFinish()">开始使用 🚀</button></div>';
  }
  el.innerHTML = h;
  if (s === 1) setTimeout(() => { try { $("obNameIn").focus(); } catch (e) {} }, 60);
  if (s === 2) setTimeout(() => { try { $("obKidIn").focus(); } catch (e) {} }, 60);
}
function obFinish() {
  const nm = (ob.name || "").trim() || "我们家";
  /* ① 写入家庭配置 */
  DB.family.name = nm;
  DB.family.onboarded = true;
  DB.family.demo = false;
  KID_SLOTS.forEach(s => { DB.family.kids[s] = { on: false, name: "", emoji: SLOT_META[s].emoji }; });
  (ob.kids || []).forEach(k => {
    if (k && k.slot) DB.family.kids[k.slot] = { on: true, name: (k.name || "").trim(), emoji: k.emoji || SLOT_META[k.slot].emoji };
  });
  /* ② 干净起步：清掉演示数据 */
  const zt = () => ({ cards: 0, quiz: 0, poems: [], sci: 0, words: 0, proj: [], quizPerfect: 0, read: 0, starsTotal: 0, bonusCount: 0 });
  DB.stars = { guoguo: 0, xiaoyu: 0 };
  DB.earned = { guoguo: 0, xiaoyu: 0 };
  DB.caps = { guoguo: 15, xiaoyu: 20 };
  DB.done = { guoguo: {}, xiaoyu: {}, baby: {} };
  DB.bonus = { guoguo: false, xiaoyu: false };
  DB.streak = { guoguo: 0, xiaoyu: 0 };
  DB.seenCards = { guoguo: [], xiaoyu: [] };
  DB.answered = { guoguo: [], xiaoyu: [] };
  DB.archive = { guoguo: [], xiaoyu: [] };
  DB.tally = { guoguo: zt(), xiaoyu: zt() };
  DB.perfect = { guoguo: true, xiaoyu: true };
  DB.wishes = [];
  DB.challenges = [];
  DB.care = [];
  DB.requests = [];
  DB.history = {};
  DB.feed = [{ icon: "🎉", text: "「" + nm + "」的伴学台创建好啦，欢迎！", time: "今天" }];
  DB.seen = true;
  ensureAllBuckets();
  saveAll();
  hideOnboard();
  renderAll(); updateRibbon(); paintSyncChip();
  const first = kidsOn()[0];
  toast(first ? ("欢迎「" + nm + "」！去 " + KNS(first) + " 的工作台看看吧 🎉") : ("欢迎「" + nm + "」！🎉"));
}
function obDemo() {
  const fem = clone(DEFAULTS.family);
  fem.name = "小禾家（示例）";
  fem.onboarded = true; fem.demo = true;
  ["guoguo", "xiaoyu"].forEach(s => { fem.kids[s] = { on: true, name: s === "guoguo" ? "果果" : "小宇", emoji: SLOT_META[s].emoji }; });
  DB.family = fem;
  DB.seen = true;
  saveAll();
  hideOnboard();
  renderAll(); updateRibbon(); paintSyncChip();
  toast("这是示例家庭「小禾家」——去「家长中心 → 家庭档案」可以改成你自己的家 💡");
}
function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return s + " 秒前";
  if (s < 3600) return Math.round(s / 60) + " 分钟前";
  return Math.round(s / 3600) + " 小时前";
}

/* ---------- 4. 基础工具 ---------- */
function toast(msg) {
  const t = $("toast"); if (!t) return;
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove("show"), 1800);
}
function speak(text, lang) {
  if (!("speechSynthesis" in window)) { toast("这台设备暂不支持朗读哦"); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = lang || "zh-CN"; u.rate = 0.88;
  window.speechSynthesis.speak(u);
}
function openModal(id) { $(id).classList.add("show"); }
function closeModal(id) { $(id).classList.remove("show"); }
function openBackup() { openModal("modalBackup"); }
function openJuniorSettings() { openModal("modalJunior"); }
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function pick(pool, n, key) {
  if (!pool || !pool.length) return [];
  const start = ((DB.rot[key] || 0) % pool.length + pool.length) % pool.length;
  const out = [];
  for (let i = 0; i < Math.min(n, pool.length); i++) out.push(pool[(start + i) % pool.length]);
  return out;
}
function nextBatch(key) {
  const sizes = { guoguoCards: DB.prefs.guoguo.dailyCards, guoguoQuiz: DB.prefs.guoguo.dailyGQuiz,
    xiaoyuWords: DB.prefs.xiaoyu.dailyWords, xiaoyuQuiz: DB.prefs.xiaoyu.dailyXQuiz };
  const step = sizes[key] || 1;
  DB.rot[key] = ((DB.rot[key] || 0) + step);
  saveAll(); renderAll(); toast("换好啦 ✨");
}
document.querySelectorAll(".modal").forEach(m => { m.addEventListener("click", e => { if (e.target === m) m.classList.remove("show"); }); });

/* ================================================================
   内容库 · 一（学龄前 3—6 岁 / 小学中 6—12 岁）
   ================================================================ */

/* ---------- 识字卡：6 个主题包 · 共 45 字 ---------- */
const CARD_PACKS = [
  { id: "gpk1", name: "天地自然", emoji: "🌤️", cards: [
    { g: "日", p: "rì",   m: "太阳。日出、生日。", t: "先人画一个圆圆的太阳，中间点一点——这就是「日」。" },
    { g: "月", p: "yuè",  m: "月亮。月牙、月光。", t: "弯弯的月牙，是夜里最亮的一盏灯。" },
    { g: "山", p: "shān", m: "高高的山。大山、山羊。", t: "三个尖尖并排站，像三座山峰。" },
    { g: "水", p: "shuǐ", m: "流动的水。喝水、河水。", t: "中间一道主流，两边是溅起的小水花。" },
    { g: "火", p: "huǒ",  m: "燃烧的火。火苗、灯火。", t: "一簇向上跳动的火苗。" },
    { g: "土", p: "tǔ",   m: "泥土。土地、土豆。", t: "地面上隆起的一个小土堆。" },
    { g: "石", p: "shí",  m: "石头。石头、石子。", t: "山崖下的一块大石头。" },
    { g: "田", p: "tián", m: "田地。田野、稻田。", t: "一块块方方的田，中间有小路分开。" }
  ]},
  { id: "gpk2", name: "我的身体", emoji: "🙋", cards: [
    { g: "人", p: "rén",  m: "人。大人、人们。", t: "一个侧着身子、正在走路的人。" },
    { g: "口", p: "kǒu",  m: "嘴巴。开口、人口。", t: "一张张开的嘴。" },
    { g: "耳", p: "ěr",   m: "耳朵。耳朵、木耳。", t: "耳朵的轮廓，像一片小叶子。" },
    { g: "目", p: "mù",   m: "眼睛。目光、题目。", t: "一只眼睛竖起来的样子。" },
    { g: "手", p: "shǒu", m: "手。小手、手心。", t: "五根手指张开的样子。" },
    { g: "足", p: "zú",   m: "脚。足球、手足。", t: "小腿和脚掌连在一起。" },
    { g: "心", p: "xīn",  m: "心。心里、开心。", t: "心脏的形状，跳一跳的。" },
    { g: "力", p: "lì",   m: "力气。力气、大力。", t: "一只手正拿着农具用力干活。" }
  ]},
  { id: "gpk3", name: "动物朋友", emoji: "🐾", cards: [
    { g: "牛", p: "niú",  m: "牛。小牛、牛奶。", t: "牛角向上弯的牛头。" },
    { g: "羊", p: "yáng", m: "羊。小羊、山羊。", t: "羊角向下弯的羊头。" },
    { g: "马", p: "mǎ",   m: "马。小马、马路。", t: "长长的马脸和飘起来的鬃毛。" },
    { g: "鸟", p: "niǎo", m: "鸟。小鸟、鸟窝。", t: "尖嘴、翅膀、爪子，一只完整的鸟。" },
    { g: "鱼", p: "yú",   m: "鱼。小鱼、金鱼。", t: "尖尖的头，摆动的尾巴。" },
    { g: "虫", p: "chóng",m: "虫子。小虫、昆虫。", t: "一条弓着身子往前爬的小虫。" },
    { g: "犬", p: "quǎn", m: "狗。警犬、犬吠。", t: "「犬」就是狗，古人这样写它。" },
    { g: "象", p: "xiàng",m: "大象。大象、象牙。", t: "长长的鼻子——一眼就认出是大象。" }
  ]},
  { id: "gpk4", name: "身边物件", emoji: "🧺", cards: [
    { g: "门", p: "mén",  m: "门。大门、门口。", t: "两扇可以推开的门。" },
    { g: "户", p: "hù",   m: "单扇的门；人家。门户、户口。", t: "一扇单开的门。" },
    { g: "刀", p: "dāo",  m: "刀。小刀、刀子。", t: "一把带手柄的刀。" },
    { g: "车", p: "chē",  m: "车。汽车、车子。", t: "两个轮子中间穿过一根车轴。" },
    { g: "舟", p: "zhōu", m: "船。小舟、木舟。", t: "一条小船，两头翘起来。" },
    { g: "衣", p: "yī",   m: "衣服。上衣、毛衣。", t: "一件有袖子的上衣。" },
    { g: "米", p: "mǐ",   m: "米。大米、米饭。", t: "米粒簌簌掉下来的样子。" },
    { g: "果", p: "guǒ",  m: "果子。水果、苹果。", t: "树上结的果子，里面有籽。" }
  ]},
  { id: "gpk5", name: "天气草木", emoji: "🌦️", cards: [
    { g: "木", p: "mù",   m: "树。木头、大树。", t: "一棵树：树干和伸出去、垂下来的枝条。" },
    { g: "竹", p: "zhú",  m: "竹子。竹子、竹林。", t: "两根竹竿，叶子垂下来。" },
    { g: "禾", p: "hé",   m: "庄稼。禾苗、禾田。", t: "一棵谷子低下头，穗子沉甸甸的。" },
    { g: "雨", p: "yǔ",   m: "雨。下雨、雨水。", t: "云下面一点一点落下的雨滴。" },
    { g: "云", p: "yún",  m: "云。白云、云朵。", t: "一团团卷起来的云。" },
    { g: "星", p: "xīng", m: "星星。星星、星空。", t: "天上亮晶晶的三颗小星。" },
    { g: "花", p: "huā",  m: "花。花朵、开花。", t: "开在枝头的花，花瓣一层层。" },
    { g: "草", p: "cǎo",  m: "草。小草、草地。", t: "两株刚冒出地面的小草。" }
  ]},
  { id: "gpk6", name: "数字与方位（指事字）", emoji: "🔢", cards: [
    { g: "一", p: "yī",   m: "一。一个、一起。", t: "一根平放的小棍子，就是「一」。" },
    { g: "二", p: "èr",   m: "二。两个、二月。", t: "两根小棍子并排。" },
    { g: "三", p: "sān",  m: "三。三个、三月。", t: "三根小棍子并排。" },
    { g: "上", p: "shàng",m: "上面。上学、上面。", t: "一条基准线，一点画在线的上方，就是「上」。" },
    { g: "下", p: "xià",  m: "下面。下雨、下面。", t: "一条基准线，一点画在线的下方，就是「下」。" }
  ]}
];
const ALL_CARDS = CARD_PACKS.reduce((a, p) => a.concat(p.cards.map(c => Object.assign({ pack: p.id, packName: p.name }, c))), []);
function guoguoCards() {
  const packs = DB.prefs.guoguo.cardPacks || [];
  const pool = ALL_CARDS.filter(c => packs.indexOf(c.pack) >= 0);
  return pick(pool.length ? pool : ALL_CARDS, DB.prefs.guoguo.dailyCards, "guoguoCards");
}
function packNames(ids, all) { return ids.map(i => (all.find(p => p.id === i) || {}).name).filter(Boolean).join(" · "); }

/* ---------- 数感小游戏：3 组 · 共 18 题 ---------- */
const QUIZ_PACKS_G = [
  { id: "gq1", name: "数一数 · 比多少", items: [
    { id: "gq1-1", q: "数一数：🍎🍎🍎🍎 一共有几个苹果？", o: ["3 个", "4 个", "5 个"], a: 1 },
    { id: "gq1-2", q: "比一比：🍇🍇🍇🍇🍇 和 🍓🍓🍓，哪个多？", o: ["葡萄多", "草莓多", "一样多"], a: 0 },
    { id: "gq1-3", q: "数一数：⭐⭐⭐⭐⭐⭐ 一共几颗星？", o: ["5 颗", "6 颗", "7 颗"], a: 1 },
    { id: "gq1-4", q: "数一数：🚗🚗🚗🚗🚗🚗🚗 一共几辆车？", o: ["6 辆", "7 辆", "8 辆"], a: 1 },
    { id: "gq1-5", q: "🔺🔺 和 ⬛⬛⬛ 一共有几个图形？", o: ["4 个", "5 个", "6 个"], a: 1 },
    { id: "gq1-6", q: "哪个多？🐘🐘 还是 🐜🐜🐜🐜？", o: ["大象多", "蚂蚁多", "一样多"], a: 1 }
  ]},
  { id: "gq2", name: "加一加 · 减一减", items: [
    { id: "gq2-1", q: "🐟🐟🐟 游走了 1 条小鱼，还剩几条？", o: ["2 条", "3 条", "4 条"], a: 0 },
    { id: "gq2-2", q: "先有 🍬🍬，又得到 🍬🍬🍬，一共几颗糖？", o: ["4 颗", "5 颗", "6 颗"], a: 1 },
    { id: "gq2-3", q: "5 只 🐤 又来了 2 只，一共几只？", o: ["6 只", "7 只", "8 只"], a: 1 },
    { id: "gq2-4", q: "7 个 🎈 飞走了 3 个，还剩几个？", o: ["3 个", "4 个", "5 个"], a: 1 },
    { id: "gq2-5", q: "3 个 🍊 加上 3 个 🍊，是几个？", o: ["5 个", "6 个", "7 个"], a: 1 },
    { id: "gq2-6", q: "10 减 4 等于几？", o: ["5", "6", "7"], a: 1 }
  ]},
  { id: "gq3", name: "找规律 · 分一分", items: [
    { id: "gq3-1", q: "找规律：🔴🔵🔴🔵🔴 后面该是什么？", o: ["🔴", "🔵", "🟡"], a: 1 },
    { id: "gq3-2", q: "一只手有 5 根手指，两只手一共有几根？", o: ["5 根", "10 根", "15 根"], a: 1 },
    { id: "gq3-3", q: "哪个数字比 6 大 1？", o: ["5", "7", "8"], a: 1 },
    { id: "gq3-4", q: "分一分：6 块 🍪 平均分给 2 个小朋友，每人几块？", o: ["2 块", "3 块", "4 块"], a: 1 },
    { id: "gq3-5", q: "排队：小明前面有 2 人，后面有 1 人，这一队一共几人？", o: ["3 人", "4 人", "5 人"], a: 1 },
    { id: "gq3-6", q: "🍰 平均切成 2 半，你吃了 1 半，还剩几半？", o: ["1 半", "2 半", "3 半"], a: 0 }
  ]}
];
const ALL_GQUIZ = QUIZ_PACKS_G.reduce((a, p) => a.concat(p.items.map(q => Object.assign({ pack: p.id, packName: p.name }, q))), []);
function guoguoQuiz() {
  const packs = DB.prefs.guoguo.quizPacks || [];
  const pool = ALL_GQUIZ.filter(q => packs.indexOf(q.pack) >= 0);
  return pick(pool.length ? pool : ALL_GQUIZ, DB.prefs.guoguo.dailyGQuiz, "guoguoQuiz");
}

/* ---------- 古诗跟读：14 首 ---------- */
const POEMS = [
  { id: "pm1",  t: "咏鹅",   a: "骆宾王", lines: ["鹅，鹅，鹅，", "曲项向天歌。", "白毛浮绿水，", "红掌拨清波。"], mean: "大白鹅弯着脖子对天唱歌，白色的羽毛浮在绿水上，红色的脚掌划着清清的水波。" },
  { id: "pm2",  t: "静夜思", a: "李白",   lines: ["床前明月光，", "疑是地上霜。", "举头望明月，", "低头思故乡。"], mean: "床前明亮的月光，好像地上铺了一层白霜；抬起头看看月亮，低下头就想起了家乡。" },
  { id: "pm3",  t: "春晓",   a: "孟浩然", lines: ["春眠不觉晓，", "处处闻啼鸟。", "夜来风雨声，", "花落知多少。"], mean: "春天睡得香，天亮了都不知道；醒来到处听见鸟叫。想起夜里的风雨声，不知落了多少花。" },
  { id: "pm4",  t: "悯农",   a: "李绅",   lines: ["锄禾日当午，", "汗滴禾下土。", "谁知盘中餐，", "粒粒皆辛苦。"], mean: "农民中午顶着太阳锄地，汗水一滴滴落进土里；谁知道碗里的饭，每一粒都来得这样辛苦。" },
  { id: "pm5",  t: "登鹳雀楼", a: "王之涣", lines: ["白日依山尽，", "黄河入海流。", "欲穷千里目，", "更上一层楼。"], mean: "太阳靠着山慢慢落下，黄河向大海奔流；想看到千里以外的风景，就要再登上一层楼。" },
  { id: "pm6",  t: "江雪",   a: "柳宗元", lines: ["千山鸟飞绝，", "万径人踪灭。", "孤舟蓑笠翁，", "独钓寒江雪。"], mean: "千座山上没有一只鸟，万条小路上没有人影；只有一叶小舟上披蓑戴笠的老翁，独自在寒江的雪中钓鱼。" },
  { id: "pm7",  t: "池上",   a: "白居易", lines: ["小娃撑小艇，", "偷采白莲回。", "不解藏踪迹，", "浮萍一道开。"], mean: "小娃娃撑着小船，悄悄采了白莲回来；他还不懂得藏起痕迹，水面的浮萍被划开一道印子。" },
  { id: "pm8",  t: "咏柳",   a: "贺知章", lines: ["碧玉妆成一树高，", "万条垂下绿丝绦。", "不知细叶谁裁出，", "二月春风似剪刀。"], mean: "高高的柳树像用碧玉打扮成的，垂下的枝条像绿色的丝带。不知道细叶是谁裁出来的——二月的春风就像一把剪刀。" },
  { id: "pm9",  t: "小池",   a: "杨万里", lines: ["泉眼无声惜细流，", "树阴照水爱晴柔。", "小荷才露尖尖角，", "早有蜻蜓立上头。"], mean: "泉眼悄悄地流，树影映在水面上；小荷叶刚刚露出尖尖的角，就已经有蜻蜓停在上面了。" },
  { id: "pm10", t: "赠汪伦", a: "李白",   lines: ["李白乘舟将欲行，", "忽闻岸上踏歌声。", "桃花潭水深千尺，", "不及汪伦送我情。"], mean: "李白坐船正要出发，忽然听见岸上有人踏着节拍唱歌来送他；桃花潭的水再深，也比不上汪伦送我的这份情谊。" },
  { id: "pm11", t: "村居",   a: "高鼎",   lines: ["草长莺飞二月天，", "拂堤杨柳醉春烟。", "儿童散学归来早，", "忙趁东风放纸鸢。"], mean: "二月里青草生长、黄莺飞舞，柳条拂着河堤像醉在春烟里；孩子们放学回来得早，忙着趁东风放风筝。" },
  { id: "pm12", t: "元日",   a: "王安石", lines: ["爆竹声中一岁除，", "春风送暖入屠苏。", "千门万户曈曈日，", "总把新桃换旧符。"], mean: "爆竹声里一年过去了，春风送来暖意；初升的太阳照着千家万户，大家都把旧的桃符换成新的。（这首诗写的是过年）" },
  { id: "pm13", t: "所见",   a: "袁枚",   lines: ["牧童骑黄牛，", "歌声振林樾。", "意欲捕鸣蝉，", "忽然闭口立。"], mean: "牧童骑着黄牛，歌声响遍树林；他想捉那只叫着的蝉，忽然闭上嘴一动不动地站住了。" },
  { id: "pm14", t: "风",     a: "李峤",   lines: ["解落三秋叶，", "能开二月花。", "过江千尺浪，", "入竹万竿斜。"], mean: "风能吹落秋天的树叶，也能吹开二月的花；吹过江面掀起千尺浪，吹进竹林让万根竹子倾斜。" }
];

/* ---------- 学龄前奖励小铺 ---------- */
const SHOP_G = [
  { id: "gr1", name: "睡前多聊 10 分钟悄悄话", cost: 8 },
  { id: "gr2", name: "多听一个睡前故事", cost: 10 },
  { id: "gr3", name: "去楼下玩 20 分钟滑梯", cost: 12 },
  { id: "gr4", name: "自己挑一集动画片", cost: 15 },
  { id: "gr5", name: "和爸爸搭一次大积木", cost: 18 },
  { id: "gr6", name: "周末公园野餐", cost: 30 },
  { id: "gr7", name: "和妈妈一起烤饼干", cost: 50 }
];
const GTASKS = [{ id: "g1", name: "识字卡", key: "dailyCards" },
                { id: "g2", name: "数感游戏", key: "dailyGQuiz" },
                { id: "g3", name: "古诗跟读", key: 1 }];

/* ================================================================
   小学中（6—12 岁）
   ================================================================ */

/* ---------- 英语词库：6 个主题包 · 共 30 词 ---------- */
const WORD_PACKS = [
  { id: "wpk1", name: "动物", emoji: "🐼", words: [
    { w: "cat",   m: "猫 🐱", s: "The cat is sleeping. 猫在睡觉。" },
    { w: "dog",   m: "狗 🐶", s: "My dog likes to run. 我的狗喜欢跑。" },
    { w: "bird",  m: "鸟 🐦", s: "A bird is singing. 一只鸟在唱歌。" },
    { w: "duck",  m: "鸭子 🦆", s: "The duck is in the water. 鸭子在水中。" },
    { w: "panda", m: "熊猫 🐼", s: "Pandas eat bamboo. 熊猫吃竹子。" }
  ]},
  { id: "wpk2", name: "食物", emoji: "🍎", words: [
    { w: "apple", m: "苹果 🍎", s: "I eat an apple every day. 我每天吃一个苹果。" },
    { w: "bread", m: "面包 🍞", s: "This bread is warm. 这个面包是热的。" },
    { w: "milk",  m: "牛奶 🥛", s: "Drink your milk. 把牛奶喝掉。" },
    { w: "egg",   m: "鸡蛋 🥚", s: "I have two eggs. 我有两个鸡蛋。" },
    { w: "cake",  m: "蛋糕 🍰", s: "We share the cake. 我们一起分蛋糕。" }
  ]},
  { id: "wpk3", name: "颜色", emoji: "🎨", words: [
    { w: "red",    m: "红色 🔴", s: "The apple is red. 苹果是红色的。" },
    { w: "blue",   m: "蓝色 🔵", s: "The sky is blue. 天空是蓝色的。" },
    { w: "green",  m: "绿色 🟢", s: "The leaves are green. 叶子是绿色的。" },
    { w: "yellow", m: "黄色 🟡", s: "I like the yellow one. 我喜欢黄色的那个。" },
    { w: "black",  m: "黑色 ⚫", s: "My cat is black. 我的猫是黑色的。" }
  ]},
  { id: "wpk4", name: "数字", emoji: "🔢", words: [
    { w: "one",   m: "一 1️⃣", s: "I have one pencil. 我有一支铅笔。" },
    { w: "two",   m: "二 2️⃣", s: "There are two birds. 有两只鸟。" },
    { w: "three", m: "三 3️⃣", s: "Three apples, please. 请给我三个苹果。" },
    { w: "five",  m: "五 5️⃣", s: "I am five years old. 我五岁了。" },
    { w: "ten",   m: "十 🔟", s: "Count to ten. 数到十。" }
  ]},
  { id: "wpk5", name: "家人与学校", emoji: "🏫", words: [
    { w: "mother",  m: "妈妈 👩", s: "My mother reads with me. 我妈妈陪我读书。" },
    { w: "father",  m: "爸爸 👨", s: "My father makes breakfast. 我爸爸做早饭。" },
    { w: "teacher", m: "老师 🧑‍🏫", s: "Our teacher is kind. 我们老师很亲切。" },
    { w: "book",    m: "书 📖", s: "This book is fun. 这本书很有趣。" },
    { w: "school",  m: "学校 🏫", s: "I walk to school. 我走路上学。" }
  ]},
  { id: "wpk6", name: "自然与天气", emoji: "🌤️", words: [
    { w: "sun",  m: "太阳 ☀️", s: "The sun is bright. 太阳很亮。" },
    { w: "moon", m: "月亮 🌙", s: "The moon is up. 月亮升起来了。" },
    { w: "rain", m: "雨 🌧️", s: "It will rain today. 今天会下雨。" },
    { w: "snow", m: "雪 ❄️", s: "Snow is falling. 雪在下。" },
    { w: "tree", m: "树 🌳", s: "The tree is tall. 这棵树很高。" }
  ]}
];
const ALL_WORDS = WORD_PACKS.reduce((a, p) => a.concat(p.words.map(w => Object.assign({ pack: p.id, packName: p.name }, w))), []);
function xiaoyuWords() {
  const packs = DB.prefs.xiaoyu.wordPacks || [];
  const pool = ALL_WORDS.filter(w => packs.indexOf(w.pack) >= 0);
  return pick(pool.length ? pool : ALL_WORDS, DB.prefs.xiaoyu.dailyWords, "xiaoyuWords");
}

/* ---------- 口算闯关：3 组 · 共 24 题 ---------- */
const QUIZ_PACKS_X = [
  { id: "xq1", name: "加减法", items: [
    { id: "xq1-1", q: "24 + 17 = ?", o: ["39", "41", "43", "31"], a: 1 },
    { id: "xq1-2", q: "63 − 28 = ?", o: ["35", "45", "31", "37"], a: 0 },
    { id: "xq1-3", q: "45 + 38 = ?", o: ["73", "83", "93", "81"], a: 1 },
    { id: "xq1-4", q: "72 − 46 = ?", o: ["24", "26", "34", "36"], a: 1 },
    { id: "xq1-5", q: "56 + 29 = ?", o: ["85", "75", "84", "95"], a: 0 },
    { id: "xq1-6", q: "90 − 37 = ?", o: ["53", "63", "57", "43"], a: 0 },
    { id: "xq1-7", q: "38 + 47 = ?", o: ["75", "85", "84", "95"], a: 1 },
    { id: "xq1-8", q: "81 − 59 = ?", o: ["22", "32", "28", "21"], a: 0 }
  ]},
  { id: "xq2", name: "乘除法", items: [
    { id: "xq2-1", q: "6 × 7 = ?", o: ["36", "42", "48", "40"], a: 1 },
    { id: "xq2-2", q: "8 × 9 = ?", o: ["64", "72", "81", "76"], a: 1 },
    { id: "xq2-3", q: "7 × 7 = ?", o: ["42", "49", "56", "47"], a: 1 },
    { id: "xq2-4", q: "63 ÷ 7 = ?", o: ["7", "8", "9", "6"], a: 2 },
    { id: "xq2-5", q: "45 ÷ 5 = ?", o: ["8", "9", "10", "7"], a: 1 },
    { id: "xq2-6", q: "9 × 6 = ?", o: ["54", "45", "56", "63"], a: 0 },
    { id: "xq2-7", q: "72 ÷ 8 = ?", o: ["8", "9", "7", "6"], a: 1 },
    { id: "xq2-8", q: "4 × 8 = ?", o: ["28", "32", "36", "24"], a: 1 }
  ]},
  { id: "xq3", name: "生活中的数学", items: [
    { id: "xq3-1", q: "一支笔 3 元，买 6 支一共多少钱？", o: ["15 元", "18 元", "21 元", "24 元"], a: 1 },
    { id: "xq3-2", q: "一盒 12 个鸡蛋，吃掉 5 个，还剩几个？", o: ["6 个", "7 个", "8 个", "17 个"], a: 1 },
    { id: "xq3-3", q: "每排站 8 人，5 排一共多少人？", o: ["35 人", "40 人", "45 人", "13 人"], a: 1 },
    { id: "xq3-4", q: "25 元去买 4 元一本的笔记本，最多能买几本？", o: ["5 本", "6 本", "7 本", "8 本"], a: 1 },
    { id: "xq3-5", q: "3 个小朋友平分 24 颗糖，每人几颗？", o: ["6 颗", "7 颗", "8 颗", "9 颗"], a: 2 },
    { id: "xq3-6", q: "9 点 15 分再过 45 分钟是几点？", o: ["9 点 60 分", "10 点", "10 点 15 分", "9 点 45 分"], a: 1 },
    { id: "xq3-7", q: "一本书 96 页，每天读 12 页，几天读完？", o: ["6 天", "7 天", "8 天", "9 天"], a: 2 },
    { id: "xq3-8", q: "小明 8 岁，妈妈比他大 27 岁，妈妈今年几岁？", o: ["33 岁", "34 岁", "35 岁", "19 岁"], a: 2 }
  ]}
];
const ALL_XQUIZ = QUIZ_PACKS_X.reduce((a, p) => a.concat(p.items.map(q => Object.assign({ pack: p.id, packName: p.name }, q))), []);
function xiaoyuQuiz() {
  const packs = DB.prefs.xiaoyu.quizPacks || [];
  const pool = ALL_XQUIZ.filter(q => packs.indexOf(q.pack) >= 0);
  return pick(pool.length ? pool : ALL_XQUIZ, DB.prefs.xiaoyu.dailyXQuiz, "xiaoyuQuiz");
}

/* ---------- 科学小探究：10 个（都是家里能做的） ---------- */
const SCI = [
  { id: "sc1",  q: "把一勺糖放进温水里搅一搅，糖去哪儿了？", how: "去厨房做做看：观察糖粒慢慢「消失」；尝一尝，水变甜了吗？", think: "想一想：糖还在吗？如果水蒸干了，会剩下什么？" },
  { id: "sc2",  q: "哪条毛巾吸水更快？", how: "找两条不同材质的布（毛巾、化纤布），各滴一滴水，看哪滴水散得更快。", think: "想一想：为什么不一样？生活中哪些地方要用吸水的材料？" },
  { id: "sc3",  q: "影子会动吗？", how: "上午、中午、傍晚，站在同一个位置，请家人帮你把影子描下来。", think: "想一想：影子为什么变了方向、变了长短？" },
  { id: "sc4",  q: "冰怎么化得更快？", how: "取两块一样大的冰，一块放太阳下，一块放阴凉处，看谁先化完。", think: "想一想：如果给其中一块裹上毛巾，会更快还是更慢？" },
  { id: "sc5",  q: "一枚硬币上能装几滴水？", how: "用滴管或筷子尖往硬币上滴水，一滴一滴数，看到第几滴才溢出来。", think: "想一想：水为什么能「鼓」起来一小包而不马上流走？" },
  { id: "sc6",  q: "叶子会「出汗」吗？", how: "把一片叶子套进透明塑料袋，扎住袋口，晒一会儿太阳，看看袋子里有没有小水珠。", think: "想一想：这些水是从哪里来的？" },
  { id: "sc7",  q: "盐和糖，哪个化得快？", how: "两杯一样热的温水，各放一勺盐、一勺糖，看看哪个先不见。再试试冷水。", think: "想一想：水的冷热对「化得快慢」有影响吗？" },
  { id: "sc8",  q: "一张纸做的桥能承多重？", how: "把一张纸折成瓦楞形当桥面，两端架在两摞书上，往上放硬币，数一数能放几枚。", think: "想一想：把纸折成别的形状，承重会变吗？" },
  { id: "sc9",  q: "哪杯水凉得慢？", how: "两杯一样热的水，一杯用毛巾裹住，一杯不裹，10 分钟后用手背或温度计比一比。", think: "想一想：冬天穿棉袄，和这个实验有相似的地方吗？" },
  { id: "sc10", q: "谁滚得快？", how: "让三个玩具小车（或三个相同的纸团）从同一块斜板同一高度滚下，用手机计时比一比。", think: "想一想：如果换个斜面高度，结果会变吗？" }
];

/* ---------- 项目工坊：6 个跨学科小项目 ---------- */
const PROJ = [
  { id: "pj1", name: "雨水去哪儿了？", days: 3, dims: "思维力 · 沟通力",
    steps: ["第 1 步 · 观察：下雨时，水从屋檐流到哪儿去了？", "第 2 步 · 画一画：画一张「雨水旅行」路线图", "第 3 步 · 讲给家人听：我的雨水故事"] },
  { id: "pj2", name: "我家的垃圾去哪儿了？", days: 4, dims: "思维力 · 文化品格力",
    steps: ["第 1 步 · 记录：一天的垃圾有哪些、各有多重", "第 2 步 · 查一查：它们被分到哪一类、最后去哪儿", "第 3 步 · 做一张垃圾分类海报", "第 4 步 · 把海报贴在垃圾桶旁边"] },
  { id: "pj3", name: "种一颗豆子", days: 7, dims: "学习力 · 文化品格力",
    steps: ["第 1 步 · 泡豆子，放在有光的地方", "第 2 步 · 每天量一量、画一画", "第 3 步 · 把记录装订成一本小书"] },
  { id: "pj4", name: "我家的用电小侦探", days: 3, dims: "数字力 · 思维力",
    steps: ["第 1 步 · 早晚各读一次电表，记下来", "第 2 步 · 找出家里最耗电的三样电器", "第 3 步 · 提出 3 条省电建议并执行一周"] },
  { id: "pj5", name: "给妹妹做一件玩具", days: 3, dims: "沟通力 · 思维力",
    steps: ["第 1 步 · 采访她想玩什么样的玩具", "第 2 步 · 用纸箱、瓶盖做出来", "第 3 步 · 请她试玩，听她说哪里要改"] },
  { id: "pj6", name: "我是小小气象员", days: 5, dims: "学习力 · 数字力",
    steps: ["第 1 步 · 每天记录天气和气温", "第 2 步 · 画一张一周天气日历", "第 3 步 · 找找规律：哪天最热？为什么？"] }
];

/* ---------- 小学奖励商城 ---------- */
const SHOP_X = [
  { id: "xr1", name: "选一次今晚的菜", cost: 12 },
  { id: "xr2", name: "游戏时间 15 分钟", cost: 15 },
  { id: "xr3", name: "晚睡 30 分钟（周末）", cost: 20 },
  { id: "xr4", name: "周末去公园", cost: 30 },
  { id: "xr5", name: "和朋友约一次户外活动", cost: 35 },
  { id: "xr6", name: "自己挑一本新书", cost: 40 },
  { id: "xr7", name: "一次家庭电影之夜", cost: 45 }
];
const XTASKS = [{ id: "x1", name: "口算闯关", key: "dailyXQuiz" },
                { id: "x2", name: "英语词卡", key: "dailyWords" },
                { id: "x3", name: "科学小探究", key: 1 },
                { id: "x4", name: "阅读打卡", key: 1 }];

/* ================================================================
   内容库 · 二（婴幼儿 0—3 岁 / 初中 12—15 岁 / 高中 15—18 岁 / 徽章）
   ================================================================ */

/* ---------- 婴幼儿亲子活动卡：5 类 · 共 12 张（给家长用，孩子不看屏幕） ---------- */
const BABY_CARDS = [
  { id: "bc1",  cat: "感官探索", icon: "🖐️", title: "感官袋探索 · 10 分钟",
    desc: "密封袋里放一点水和几颗彩色珠子，封好口，让宝宝隔着袋子拍一拍、捏一捏、看水珠滚动。家长全程陪同，注意袋子密封完好。" },
  { id: "bc2",  cat: "亲子共读", icon: "📖", title: "熊抱共读《好饿的毛毛虫》· 10 分钟",
    desc: "把宝宝抱在怀里读，指着图画说：「毛毛虫吃了苹果——啊呜！」宝宝咿呀时，回应他，再等一等他的下一声。" },
  { id: "bc3",  cat: "儿歌律动", icon: "🎵", title: "儿歌律动《小手拍拍》· 5 分钟",
    desc: "边唱边握住宝宝的小手做动作：「小手拍拍，小手拍拍，手指伸出来。」重复两三遍，宝宝会开始期待下一个动作。" },
  { id: "bc4",  cat: "语言对话", icon: "💬", title: "「轮到我啦」对话游戏 · 随时",
    desc: "宝宝发出声音时，你模仿他的声音回过去，然后停下来等——等他再来一轮。这种「一来一回」比单方面说话更促进语言发展。" },
  { id: "bc5",  cat: "生活自理", icon: "🥄", title: "自己拿勺子 · 吃饭时",
    desc: "给宝宝一把短柄勺，允许他吃得一团乱。洒出来不批评，只示范。自主进食的成就感，是自理的起点。" },
  { id: "bc6",  cat: "感官探索", icon: "🌿", title: "踩水花、摸小草 · 15 分钟",
    desc: "雨后带宝宝到楼下，光脚（或穿防滑袜）踩踩草地、摸摸树皮、听听鸟叫。真实世界的触感，是屏幕给不了的。" },
  { id: "bc7",  cat: "亲子共读", icon: "🔍", title: "翻翻书时间《Where's Spot?》· 10 分钟",
    desc: "选一本翻翻书，让宝宝自己动手翻。翻对了就欢呼，翻错了也没关系——手指的精细动作正在发育。" },
  { id: "bc8",  cat: "儿歌律动", icon: "💃", title: "抱着宝宝跳舞 · 5 分钟",
    desc: "放一段舒缓的音乐，把宝宝抱在怀里轻轻摇摆。节奏感和安全感，是在身体的移动里长出来的。" },
  { id: "bc9",  cat: "语言对话", icon: "🏷️", title: "给东西起名字 · 日常",
    desc: "指着宝宝正在看的东西说出名字：「这是杯子，杯子。」然后停两秒，看他有没有回应。命名是语言的第一步。" },
  { id: "bc10", cat: "生活自理", icon: "🧸", title: "收玩具的小游戏 · 5 分钟",
    desc: "把收玩具变成游戏：「小球回家啦！」你收一个，请他收一个。收完一起拍手庆祝。" },
  { id: "bc11", cat: "感官探索", icon: "🍋", title: "厨房里的嗅觉课 · 5 分钟",
    desc: "抱着宝宝闻一闻柠檬、橙子、面包的味道，并说出名字。嗅觉是最早成熟、也最容易被忽视的感官。" },
  { id: "bc12", cat: "亲子共读", icon: "🌙", title: "睡前故事三分钟 · 每天",
    desc: "不讲道理，只讲故事。固定的睡前故事，是宝宝一天里最确定的安全感来源。" }
];

/* ---------- 今日小贴士（每条均标注来源） ---------- */
const BABY_TIPS = [
  { id: "tp1", title: "回应性照护：宝宝对你「咿呀」时，认真地回应他",
    text: "研究发现，婴幼儿期「一来一回的对话轮次」，比单纯听到多少词更能预测日后的语言能力。宝宝发出声音时，看看他、回应他、然后停下来等他的下一轮——这就是最好的语言课。",
    src: "来源：Romeo et al., 2018, Psychological Science（MIT / 哈佛）" },
  { id: "tp2", title: "屏幕之外：2 岁前尽量不要让孩子独自看屏幕",
    text: "世界卫生组织不建议 1 岁儿童有久坐的屏幕时间；2 岁儿童久坐屏幕时间不应超过 1 小时，越少越好。如果要看，请家长陪着一起看、一起说。",
    src: "来源：世界卫生组织《5 岁以下儿童身体活动、久坐行为和睡眠指南》（2019）" },
  { id: "tp3", title: "大运动优先：运动是这个阶段最好的「早教」",
    text: "1—2 岁儿童每天应进行至少 180 分钟各种强度的身体活动，全天分布，越多越好；不要让孩子一次被限制在推车、餐椅里超过 1 小时。",
    src: "来源：世界卫生组织（2019）" },
  { id: "tp4", title: "睡眠：1—2 岁每天推荐 11—14 小时",
    text: "包括小睡在内，11—14 小时的高质量睡眠，并且尽量保持规律的入睡与起床时间。睡够了，白天的探索才有精神。",
    src: "来源：世界卫生组织（2019）" },
  { id: "tp5", title: "自由玩耍：宝宝发呆、摆弄积木，也是在「学习」",
    text: "不要急着填满他的每一分钟。高质量的非屏幕互动（阅读、讲故事、唱歌、拼图）对社交与认知发展很重要，但孩子自己主导的玩耍同样重要。",
    src: "来源：世界卫生组织（2019）；本平台立场：不做电子保姆" },
  { id: "tp6", title: "家长也需要休息：照顾者情绪稳定，是宝宝最好的环境",
    text: "累了就换手，这不是自私。一个身心俱疲的照护者，很难持续做到「回应性照护」。先照顾好自己，再照顾孩子。",
    src: "来源：本平台产品立场" }
];

/* ---------- 初中 · 自主计划板 ---------- */
const JUNIOR_BOARD = [
  { id: "j1", t: "背 10 个文言实词（「以」字卡）", tag: "语文" },
  { id: "j2", t: "数学错题复盘 1 组", tag: "数学" },
  { id: "j3", t: "英语听读 15 分钟", tag: "英语" },
  { id: "j4", t: "阅读《苏东坡传》一章", tag: "阅读" },
  { id: "j5", t: "用手机慢动作拍一次自由落体，估算重力加速度", tag: "物理" },
  { id: "j6", t: "查一查家乡的气候类型，说明理由", tag: "地理" },
  { id: "j7", t: "记录一周睡眠时长，画成折线图", tag: "生物" },
  { id: "j8", t: "在地图上标出一条丝绸之路的主要节点", tag: "历史" },
  { id: "j9", t: "给家人讲清一个「我以为我懂，其实没懂」的概念", tag: "费曼" },
  { id: "j10", t: "整理本周书桌与电子文件，删掉 3 个不再需要的东西", tag: "自理" }
];
const JSTATES = ["📋 计划中", "🚀 进行中", "✅ 已完成"];

/* ---------- 初中 · 记忆卡 ---------- */
const JUNIOR_CARDS = [
  { id: "jc1",  f: "以", h: "文言 · 虚词", b: "① 用、拿（以刀劈狼）② 因为（不以物喜）③ 以便、来（以昭陛下平明之理）④ 认为（我以日始出时去人近）" },
  { id: "jc2",  f: "(a+b)²", h: "数学 · 公式", b: "= a² + 2ab + b²。几何意义：边长为 (a+b) 的大正方形，被分成一块 a²、一块 b²、两块 ab。" },
  { id: "jc3",  f: "勾股定理", h: "数学 · 定理", b: "直角三角形中 a² + b² = c²（c 为斜边）。反过来也成立：三边满足此式即为直角三角形。" },
  { id: "jc4",  f: "光合作用", h: "生物 · 概念", b: "二氧化碳 + 水 —光能/叶绿体→ 有机物（贮存能量）+ 氧气。叶绿体是细胞里的「能量转换车间」。" },
  { id: "jc5",  f: "密度 ρ = m / V", h: "物理 · 公式", b: "水的密度约 1.0 g/cm³，常作参照。物体密度小于水就上浮，大于水就下沉。" },
  { id: "jc6",  f: "前 221 年", h: "历史 · 年代", b: "秦灭六国，秦始皇建立中国历史上第一个统一的多民族中央集权国家，统一文字、货币、度量衡。" },
  { id: "jc7",  f: "季风", h: "地理 · 概念", b: "因海陆热力性质差异，风向随季节显著改变。我国东部夏季吹东南风（暖湿多雨），冬季吹西北风（干冷少雨）。" },
  { id: "jc8",  f: "look forward to", h: "英语 · 搭配", b: "to 是介词，后面接名词或动词 -ing：I look forward to hearing from you.（不是 to hear）" },
  { id: "jc9",  f: "化学方程式配平", h: "化学 · 方法", b: "最小公倍数法：先配出现次数最少且原子数不相等的元素，取其原子个数的最小公倍数，反推系数，最后核对氢、氧。" },
  { id: "jc10", f: "主旨题怎么答", h: "语文 · 方法", b: "三步：① 找文中反复出现的词；② 找作者的评价句、抒情句；③ 用「通过……表达了／批判了／赞美了……」的句式概括，不要只复述情节。" }
];

/* ---------- 初中 · 研究性学习微课题 ---------- */
const JUNIOR_TOPICS = [
  { id: "jt1", t: "小区垃圾分类现状微调查", d: "观察本小区分类垃圾桶的使用情况，记录 20 分钟里有多少人正确投放；下周带 3 条改进建议来。", tip: "💡 技巧卡：「先观察，再提问」——好课题都从「咦，好像不太对」开始。" },
  { id: "jt2", t: "我家一周塑料使用量统计", d: "把一周里家里用掉的塑料袋、塑料瓶、包装盒分门别类称重或计数，找出最容易被替代的那一种。", tip: "💡 技巧卡：把「感觉很多」变成「具体多少」，说服力就完全不一样。" },
  { id: "jt3", t: "校园里最受欢迎的课间活动调查", d: "设计一个 3 题的问卷，问 30 位同学课间做什么；统计结果并画一张条形图。", tip: "💡 技巧卡：问题越短越容易得到真实答案；别问「你喜欢运动吗」这种谁都会答「喜欢」的问题。" },
  { id: "jt4", t: "家乡一条河的水质观察", d: "在不同天气前往同一河段，记录颜色、气味、透明度（用透明杯接水看能见度），并查一查这条河的历史。", tip: "💡 技巧卡：只描述你真正看到、闻到的，不写你没测过的数据。" },
  { id: "jt5", t: "短视频与睡眠：一份自我实验", d: "连续两周记录「睡前是否刷短视频」与「入睡时间」，对比两组的平均入睡时间。样本就是你自己。", tip: "💡 技巧卡：自我实验（N=1）也能得出有用的结论，只要你如实记录。" },
  { id: "jt6", t: "一栋楼的用电高峰在什么时候？", d: "记录自家电表在早、中、晚三个时段各一次读数，连续 5 天，找出用电高峰并推测原因。", tip: "💡 技巧卡：数据要「同一时间、同样方法」收集，否则没有可比性。" }
];

/* ================================================================
   高中（15—18 岁）
   ================================================================ */
const SENIOR_TOPICS = [
  { id: "st1", t: "社区垃圾分类的现状与改进", steps: [
    "选题：社区垃圾分类到底做得怎么样？我能不能提出一条可落地的改进建议？",
    "查资料：读 2 篇相关报道或研究，做笔记：别人已经发现了什么？",
    "实地调查：选 3 个投放点，各记录 20 分钟的实际投放情况",
    "成文：写一页调研小结（背景 / 方法 / 数据 / 结论 / 一点局限）",
    "家庭答辩：讲给家人听，收集 3 个提问并当场作答" ] },
  { id: "st2", t: "城市热岛：我家附近哪里最热？", steps: [
    "选题：同一天里，小区里不同地点的温度差多少？",
    "查资料：了解「城市热岛效应」的成因与常见测量方法",
    "实地测量：选 5 个点（树荫下、柏油路、水边、草地、楼间空地），同一时段各测 3 次",
    "成文：做一张温差对比图，并解释差异",
    "家庭答辩：请家人猜哪个点最热，再公布答案和原因" ] },
  { id: "st3", t: "「刷手机」与睡眠：一份自我实验", steps: [
    "选题：睡前刷手机，到底会不会推迟我的入睡？",
    "查资料：读 2 篇关于屏幕使用与睡眠的研究摘要",
    "实验设计：连续 14 天，交替执行「睡前 1 小时不碰手机」与「照常」，并记录入睡时间",
    "成文：算出两组平均入睡时间差，并诚实写出可能的干扰因素",
    "家庭答辩：向家人报告结果——包括和自己预期不一致的地方" ] },
  { id: "st4", t: "校园里的水：从直饮水到污水去向", steps: [
    "选题：学校里每天喝掉多少水？用过的水流去了哪里？",
    "查资料：了解本地污水处理的基本流程与排放标准",
    "实地调查：数一数楼层直饮水机数量，估算一天用水量；记录排水口位置",
    "成文：画一张「校园水循环图」，标注可改进的环节",
    "家庭答辩：向家人解释「为什么不能用喝的水浇花」这类常见问题" ] },
  { id: "st5", t: "我家阳台的光照一年变化", steps: [
    "选题：同一时刻，阳台光照的边界一直在移动吗？",
    "查资料：了解太阳高度角、赤纬随季节的变化规律",
    "长期观测：每月固定一天、固定时刻，给阳台地面光照边界拍一张照并做标记",
    "成文：把 6 张照片与日期并列，找出规律并解释",
    "家庭答辩：用自家的观测数据解释「为什么冬天太阳照进屋里更深」" ] },
  { id: "st6", t: "方言正在消失吗？——三代人的用词对比", steps: [
    "选题：同一个东西，爷爷、爸爸、我分别怎么说？",
    "查资料：了解语言濒危的常见判断指标与本地语言使用现状",
    "访谈收集：选 30 个日常生活词，分别问 3 位不同年龄段家人，记录用词",
    "成文：统计三代人用词的一致率，分析哪些类别变化最快",
    "家庭答辩：请爷爷验证你的结论，并补充你没想到的地方" ] }
];

const SENIOR_READ = [
  { id: "sr1", t: "「作者想说服我吗？他漏掉了什么？」",
    d: "阅读一篇非虚构长文后，写三句话：① 核心观点是什么；② 一个我信服的理由；③ 一个我存疑的地方。存疑往往比信服更珍贵。" },
  { id: "sr2", t: "「这个数从哪里来？」",
    d: "读任何一篇带数据的文章时，圈出 3 个数字，逐个追问：谁统计的？样本多大？和结论之间是「相关」还是「因果」？只描述相关却被说成因果的，是最常见的错误。" },
  { id: "sr3", t: "「换个人写，会怎么写？」",
    d: "同一件事，找两篇立场不同的报道对照读。列出它们各自强调了什么、省略了什么。能看见「叙述的选择」，才算真正读懂了。" },
  { id: "sr4", t: "「用一句话讲给奶奶听」",
    d: "把一篇学术性很强的文章，缩写成一句奶奶能听懂的话，再补一句「为什么这件事重要」。讲不明白，通常意味着还没读透。" },
  { id: "sr5", t: "「读完先写三行，再写三十行」",
    d: "合上文章，先只写三行：它讲了什么、我同意什么、我保留什么。写完再看原文订正。这个练习专治「读时都懂，读完就忘」。" }
];

const SENIOR_AI = [
  { id: "sa1", t: "用 AI 查资料后，记得标注：「哪些是 AI 帮的忙、哪些是我自己的判断」",
    d: "诚实使用 AI 是一种能力，也是未来选拔中最被看重的品质。本平台鼓励「AI 协作 + 诚实标注」，不鼓励把 AI 的答案当成自己的。" },
  { id: "sa2", t: "让 AI 先当「反方辩友」，再当「资料员」",
    d: "写完一个观点后，请 AI 站在对立面提出 3 条反驳；你逐条回应。这比直接问 AI「我写得对吗」有用得多——后者的答案通常只是恭维。" },
  { id: "sa3", t: "AI 给的每一个数字，都去原始来源核一遍",
    d: "大模型会「编」出看起来很像真的引用和数字，这是它最危险的失败方式。凡是数字、年份、人名、文献，一律回原始来源确认；核不到就删掉。" },
  { id: "sa4", t: "先自己写一稿，再用 AI 改——顺序不能反",
    d: "先让 AI 生成，你会失去「自己想清楚」的过程；先自己写、再请它挑毛病，你得到的才是提升。判断标准很简单：关掉 AI，你还讲得出来吗？" },
  { id: "sa5", t: "把 AI 当成「随时可问的实习生」，但签字的人是你",
    d: "它可以帮你列提纲、找线索、改病句；但结论的对错、数据的真假、观点的立场，最终由你负责。这一条，是数字素养，也是品格。" }
];

/* ================================================================
   徽章体系
   ================================================================ */
const BADGES = [
  { id: "b_first",  icon: "🌱", name: "第一次打卡", d: "完成第一件小事", chk: t => t.doneCount >= 1 },
  { id: "b_3d",     icon: "🔥", name: "连续 3 天", d: "连续 3 天有学习记录", chk: (t, s) => s >= 3 },
  { id: "b_7d",     icon: "💪", name: "连续 7 天", d: "连续 7 天有学习记录", chk: (t, s) => s >= 7 },
  { id: "b_cards20",icon: "🃏", name: "识字小达人", d: "累计翻开 20 张字卡", chk: t => t.cards >= 20 },
  { id: "b_words15",icon: "🔤", name: "词汇收集家", d: "累计翻开 15 张单词卡", chk: t => t.words >= 15 },
  { id: "b_calc",   icon: "⚡", name: "口算小能手", d: "一轮口算全部答对", chk: t => t.quizPerfect >= 1 },
  { id: "b_sci",    icon: "🔬", name: "小科学家", d: "完成 3 个科学小探究", chk: t => t.sci >= 3 },
  { id: "b_proj",   icon: "🛠️", name: "项目经理", d: "完整做完 1 个项目", chk: t => (t.proj || []).length >= 1 },
  { id: "b_read",   icon: "📚", name: "阅读之星", d: "累计完成 5 次阅读打卡", chk: t => t.read >= 5 },
  { id: "b_poem5",  icon: "📖", name: "古诗小诗人", d: "跟读 5 首古诗", chk: t => (t.poems || []).length >= 5 },
  { id: "b_100",    icon: "🌟", name: "星星收割机", d: "累计获得 100 颗星", chk: t => t.totalStars >= 100 },
  { id: "b_family", icon: "💛", name: "全家共读", d: "完成一次家庭挑战", chk: t => t.familyDone >= 1 },
  { id: "b_archive",icon: "🎨", name: "档案第一页", d: "成长档案里有 5 条记录", chk: t => t.archiveCount >= 5 },
  { id: "b_balance",icon: "⚖️", name: "五维均衡", d: "五个维度都有记录", chk: t => t.dimCount >= 5 },
  { id: "b_days5",  icon: "📅", name: "坚持五天", d: "累计有 5 天学习记录", chk: t => t.activeDays >= 5 },
  { id: "b_bonus",  icon: "🎉", name: "今日全清", d: "当天任务全部完成", chk: t => t.bonusCount >= 1 },
  { id: "b_care5",  icon: "🤝", name: "陪伴时光", d: "和家人完成 5 次陪伴记录", chk: t => t.careCount >= 5 },
  { id: "b_wish",   icon: "🎁", name: "心愿贡献者", d: "为家庭心愿投入 30 颗星", chk: t => t.wishContrib >= 30 },
  { id: "b_chg3",   icon: "🏡", name: "挑战达人", d: "完成 3 次家庭挑战", chk: t => t.familyDone >= 3 }
];

const DIMS = ["学习力", "思维力", "沟通力", "数字力", "文化品格力"];
const DIM_KEYWORDS = [
  { dim: 0, words: ["打卡", "完成", "读完", "闯关", "识字", "词卡", "阅读", "项目", "探究", "课题", "计划"] },
  { dim: 1, words: ["思维力", "项目", "探究", "实验", "调查", "规律", "为什么"] },
  { dim: 2, words: ["沟通力", "讲给", "分享", "答辩", "读给", "家庭", "合作"] },
  { dim: 3, words: ["数字力", "AI", "数据", "统计", "图表", "记录", "电子"] },
  { dim: 4, words: ["文化品格力", "古诗", "文言", "传统", "道德", "品格", "坚持", "陪伴"] }
];

/* ================================================================
   核心逻辑 · 星星经济 / 任务 / 每日重置
   ================================================================ */

function saveAll() { saveLocal(); if (typeof scheduleSync === "function") scheduleSync(); }

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function dateStr(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function md(d) { return (d.getMonth() + 1) + "月" + d.getDate() + "日"; }

/* 任务定义（随家长设置的数量变化） */
function tasksOf(child) {
  if (child === "guoguo") return [
    { id: "g1", name: "识字卡", need: Math.max(1, DB.prefs.guoguo.dailyCards) },
    { id: "g2", name: "数感游戏", need: Math.max(1, DB.prefs.guoguo.dailyGQuiz) },
    { id: "g3", name: "古诗跟读", need: 1 }
  ];
  return [
    { id: "x1", name: "口算闯关", need: Math.max(1, DB.prefs.xiaoyu.dailyXQuiz) },
    { id: "x2", name: "英语词卡", need: Math.max(1, DB.prefs.xiaoyu.dailyWords) },
    { id: "x3", name: "科学小探究", need: 1 },
    { id: "x4", name: "阅读打卡", need: 1 }
  ];
}
function taskStats(child) {
  const ts = tasksOf(child);
  const doneN = ts.filter(t => (DB.done[child][t.id] || 0) >= t.need).length;
  return { doneN, total: ts.length, tasks: ts };
}
function tallyOf(child) {
  if (!DB.tally[child]) DB.tally[child] = {};
  const t = DB.tally[child];
  ["cards", "quiz", "sci", "words", "quizPerfect", "read", "starsTotal", "bonusCount"].forEach(k => { if (typeof t[k] !== "number") t[k] = 0; });
  ["poems", "proj"].forEach(k => { if (!Array.isArray(t[k])) t[k] = []; });
  return t;
}

/* 星星经济：只靠完成任务获得 · 每日上限 · 达上限熔断 · 无购买入口 */
function earnStar(child, n) {
  const cap = DB.caps[child] || 15;
  if ((DB.earned[child] || 0) >= cap) { toast("今天的星星攒满啦，明天继续 ✨"); return 0; }
  const add = Math.min(n, cap - (DB.earned[child] || 0));
  DB.earned[child] = (DB.earned[child] || 0) + add;
  DB.stars[child] += add;
  tallyOf(child).starsTotal += add;
  const t = todayStr();
  if (!DB.history[t]) DB.history[t] = {};
  DB.history[t][child] = (DB.history[t][child] || 0) + add;
  saveAll();
  toast("+" + add + " ⭐");
  return add;
}
function checkAllDone(child) {
  const ts = tasksOf(child);
  const all = ts.every(t => (DB.done[child][t.id] || 0) >= t.need);
  if (all && !DB.bonus[child]) {
    DB.bonus[child] = true;
    DB.stars[child] += 5;
    const tt = tallyOf(child);
    tt.starsTotal += 5; tt.bonusCount += 1;
    const t = todayStr();
    if (!DB.history[t]) DB.history[t] = {};
    DB.history[t][child] = (DB.history[t][child] || 0) + 5;
    const nm = KNS(child);
    pushFeed("🎉", nm + "完成了今天的全部任务，额外 +5 ⭐");
    pushArchive(child, "完成了今天的全部任务（今日全清）");
    saveAll();
    toast("🎉 今天的任务全部完成！额外 +5 ⭐");
  }
}
function pushFeed(icon, text) {
  DB.feed.unshift({ icon, text, time: "今天" });
  if (DB.feed.length > 20) DB.feed.length = 20;
  saveAll();
}
function pushArchive(child, text) {
  DB.archive[child].unshift({ d: md(new Date()), x: text });
  if (DB.archive[child].length > 60) DB.archive[child].length = 60;
  saveAll();
}
function bump(child, taskId, n, unit) {
  DB.done[child][taskId] = (DB.done[child][taskId] || 0) + (n || 1);
  const t = tallyOf(child);
  if (unit && typeof t[unit] === "number") t[unit] += (n || 1);
  saveAll();
}

/* 每日重置：清空当天进度、推进连续天数、记录历史 */
(function dailyReset() {
  const t = todayStr();
  if (DB.day === t) return;
  const prev = DB.day;
  DB.day = t;
  ["guoguo", "xiaoyu"].forEach(c => {
    const had = prev && DB.history[prev] && DB.history[prev][c] > 0;
    if (had) DB.streak[c] = (DB.streak[c] || 0) + 1;
    else if (prev) DB.streak[c] = 0;   // 断签不惩罚、不清零记录，只把连续天数归零
  });
  DB.earned = { guoguo: 0, xiaoyu: 0 };
  DB.done = { guoguo: {}, xiaoyu: {} };
  DB.bonus = { guoguo: false, xiaoyu: false };
  DB.seenCards = { guoguo: [], xiaoyu: [] };
  DB.answered = { guoguo: [], xiaoyu: [] };
  DB.perfect = { guoguo: true, xiaoyu: true };
  DB.jstate = {};
  DB.sstep = 0; DB.sDefense = false;
  Object.keys(DB.rot).forEach(k => {
    if (k.indexOf("guoguo") === 0 || k.indexOf("xiaoyu") === 0) DB.rot[k] = (DB.rot[k] || 0);
  });
  saveLocal();
})();
if (!DB.perfect) DB.perfect = { guoguo: true, xiaoyu: true };
ensureAllBuckets();   // v4：保证所有槽位的数据桶结构完整（新家庭 / 新增孩子时安全）

/* ================================================================
   视图切换
   ================================================================ */
let currentView = "view-home", parentUnlocked = false, archiveChild = "guoguo", badgeChild = "guoguo";
function go(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const el = $(id); if (el) el.classList.add("active");
  currentView = id; window.scrollTo({ top: 0 });
  $("btnBack").classList.toggle("show", id !== "view-home");
  const ts = $("topStar");
  if (id === "view-guoguo" || id === "view-xiaoyu") {
    ts.classList.add("show"); $("topStarNum").textContent = DB.stars[id === "view-guoguo" ? "guoguo" : "xiaoyu"];
  } else ts.classList.remove("show");
  if (id === "view-parent") {
    if (parentUnlocked) { $("pinGate").style.display = "none"; $("parentBody").style.display = "block"; renderParent(); }
    else { $("pinGate").style.display = "block"; $("parentBody").style.display = "none"; renderPinGate(); }
  }
  renderAll();
}
function goHome() { go("view-home"); }
function updateRibbon() {
  const n = $("ribbonNote"); if (!n) return;
  n.textContent = (mode === "cloud" && currentUser)
    ? ("已登录：" + currentUser.name + " · 家庭数据已保存，获授权的家人可以共同使用")
    : "本地体验模式：数据只保存在这台设备上，点右上角可登录同步";
}

/* ================================================================
   渲染 · 家庭空间
   ================================================================ */
/* 家庭成员网格：按家庭配置动态生成（v4 多家庭） */
function MEMBERS() {
  return kidsOn().map(s => {
    const m = SLOT_META[s];
    return { id: s, name: KNS(s), emoji: KE(s), cls: m.cls, age: m.stage, view: m.view, deep: m.deep };
  });
}

/* 学段体验馆（动态 · v1.3） */
const GALLERY_CARDS = [
  { slot: "baby",   emoji: "🍼", tag: "家长引路", tryLabel: "去体验", lead: "宝宝不接触屏幕，平台为家长提供每日亲子活动卡：感官游戏、熊抱共读、儿歌律动——学习发生在真实世界里。" },
  { slot: "guoguo", emoji: "🌸", tag: "玩中启蒙", tryLabel: "进工作台", lead: "象形字卡片、数感游戏、古诗跟读——在游戏里种下兴趣的种子，把「每天学一点」变成家庭仪式。" },
  { slot: "xiaoyu", emoji: "⚽", tag: "走向自主", tryLabel: "进工作台", lead: "今日任务条、口算闯关、英语词卡、科学小探究、项目工坊——从被陪伴一步步走向能自主。" },
  { slot: "junior", emoji: "🧭", tag: "自己掌舵", tryLabel: "去体验", lead: "自主计划板、记忆卡自测、研究性学习入门——设置不再有家长密码锁，学习交还给孩子自己。" },
  { slot: "senior", emoji: "🔭", tag: "自我塑造", tryLabel: "去体验", lead: "研究小课题、学术阅读、家庭答辩、AI 协作创作——把碎片时间变成自我塑造的载体。" }
];
function renderGallery() {
  const el = $("galleryList"); if (!el) return;
  el.innerHTML = GALLERY_CARDS.map(c => {
    const m = SLOT_META[c.slot];
    const live = !!(kidOf(c.slot) && kidOf(c.slot).on);
    const descr = live ? (KE(c.slot) + " " + esc(KNS(c.slot)) + " · " + m.stage) : (KNS(c.slot) + "（样张）· " + m.stage);
    return '<div class="gcard" data-click="go(\'' + m.view + '\')">' +
      (live ? '<div class="live">' + esc(KNS(c.slot)) + '的工作台</div>' : "") +
      '<div class="top"><div class="em" style="background:var(--' + m.cls + '-soft)">' + c.emoji + '</div>' +
      '<div><h3>' + m.stage + ' · ' + m.ages + '</h3><div class="muted">' + descr + '</div></div></div>' +
      '<p>' + c.lead + '</p>' +
      '<div class="foot"><span class="chip ' + m.cls + '">' + c.tag + '</span><span>' +
      (live ? "进 " + esc(KNS(c.slot)) + " 的工作台 ›" : c.tryLabel + " ›") + '</span></div></div>';
  }).join("");
}
/* 全局动态姓名刷新（v1.3）：视图头部 / 页签 / 家长中心内容区 / 家庭名 */
function paintKidsUI() {
  const headMap = { "g-who": "guoguo", "x-who": "xiaoyu", "b-who": "baby", "j-who": "junior", "s-who": "senior" };
  Object.keys(headMap).forEach(id => { const el = $(id); if (el) el.textContent = KNS(headMap[id]); });
  [["tab-g", "guoguo"], ["tab-x", "xiaoyu"], ["tabb-g", "guoguo"], ["tabb-x", "xiaoyu"], ["tabr-g", "guoguo"], ["tabr-x", "xiaoyu"]].forEach(p => {
    const el = $(p[0]); if (!el) return;
    const k = kidOf(p[1]);
    el.style.display = (k && k.on) ? "" : "none";
    el.textContent = KE(p[1]) + " " + KNS(p[1]);
  });
  const tb = $("tab-both"); if (tb) tb.style.display = (kidsOn().length >= 2) ? "" : "none";
  document.querySelectorAll("[data-kid-slot]").forEach(el => {
    const k = kidOf(el.getAttribute("data-kid-slot"));
    el.style.display = (k && k.on) ? "" : "none";
  });
  const h4map = { "h-pk-g-cards": "guoguo", "h-pk-g-quiz": "guoguo", "h-pk-x-words": "xiaoyu", "h-pk-x-quiz": "xiaoyu" };
  Object.keys(h4map).forEach(id => { const el = $(id); if (el) el.textContent = KE(h4map[id]) + " " + KNS(h4map[id]); });
  if ($("homeTitle")) $("homeTitle").textContent = famName() + " · 家庭空间";
  if ($("parentWho")) $("parentWho").textContent = famName() + " · " + ((mode === "cloud" && currentUser) ? currentUser.name : "家长管理员");
  if ($("ribbonFam")) $("ribbonFam").textContent = famName();
  /* 默认选中校正：页签指向的孩子未被启用时，切换到第一个启用的孩子 */
  const on = kidsOn();
  if (on.length) {
    if (archiveChild !== "both" && on.indexOf(archiveChild) < 0) archiveChild = on[0];
    if (archiveChild === "both" && on.length < 2) archiveChild = on[0];
    if (on.indexOf(badgeChild) < 0) badgeChild = on[0];
    if (reportWho !== "family" && on.indexOf(reportWho) < 0) reportWho = on[0];
  }
}
function renderHome() {
  const d = new Date();
  const wd = "日一二三四五六"[d.getDay()];
  $("todayDate").textContent = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日 · 星期" + wd;
  const aw = activeWish();
  if (aw) {
    $("wishName").textContent = aw.emoji + " 家庭心愿：" + aw.title;
    $("wishTxt").textContent = aw.saved + " / " + aw.target + " ⭐";
    $("wishBar").style.width = wishPct(aw) + "%";
    const left = Math.max(0, aw.target - aw.saved);
    const more = DB.wishes.filter(w => !w.done && w.id !== aw.id).length;
    $("wishSub").textContent = left > 0
      ? ("还差 " + left + " ⭐ · 全家一起攒，每个人的努力都算数" + (more ? "（还排着 " + more + " 个心愿）" : ""))
      : "🎉 心愿达成！点开看看";
  } else {
    $("wishName").textContent = "⭐ 家庭心愿池";
    $("wishTxt").textContent = "还没有进行中的心愿";
    $("wishBar").style.width = "0%";
    $("wishSub").textContent = "点一下，给全家设一个一起攒的目标吧";
  }
  $("homeTitle").textContent = famName() + " · 家庭空间";

  $("adultsRow").innerHTML =
    '<span class="adult"><span class="a">👩</span>妈妈 · 家长管理员</span>' +
    '<span class="adult"><span class="a">👨</span>爸爸 · 家长管理员</span>' +
    '<span class="adult"><span class="a">👵</span>奶奶 · 陪伴者</span>';

  const ms = MEMBERS();
  $("memberGrid").innerHTML = ms.length ? ms.map(m => {
    let sub, stat;
    if (m.deep === "tool") {
      sub = "家长活动卡 · 今天陪" + esc(m.name) + "玩一会儿";
      stat = '<span class="muted">亲子活动 · 宝宝不碰屏幕</span>';
    } else if (m.deep === true) {
      const st = taskStats(m.id);
      const todayStar = (DB.history[todayStr()] && DB.history[todayStr()][m.id]) || 0;
      sub = "今天 " + st.doneN + " / " + st.total + " 项完成 · 连续打卡 " + (DB.streak[m.id] || 0) + " 天";
      stat = '<span>⭐ <b>' + DB.stars[m.id] + '</b> 颗星</span><span class="muted">今天 +' + todayStar + '</span>';
    } else {
      sub = "这个学段的工作台正在深化中 · 先睹为快";
      stat = '<span class="muted">体验版</span>';
    }
    return '<div class="member child ' + m.cls + '" data-click="go(\'' + m.view + '\')">' +
      '<div class="go">进入 ›</div>' +
      '<div class="avatar" style="background:var(--' + m.cls + '-soft)">' + m.emoji + '</div>' +
      '<h3>' + esc(m.name) + ' <span class="chip ' + m.cls + '">' + m.age + '</span></h3>' +
      '<div class="sub">' + sub + '</div>' +
      '<div class="stats">' + stat + '</div>' +
    '</div>';
  }).join("") : '<div class="muted" style="padding:14px 4px">还没有添加孩子。进入「家长中心 → 家庭档案」，把孩子添加进来——每个孩子都会有自己专属的工作台 🎈</div>';

  const cl = $("challengeList");
  const chs = DB.challenges.filter(c => !c.done);
  const chDoneN = DB.challenges.filter(c => c.done).length;
  $("chCount").textContent = chs.length
    ? ("进行中 " + chs.length + " 个")
    : (chDoneN ? ("已全部完成 " + chDoneN + " 个 🎉") : "还没有挑战");
  cl.innerHTML = chs.length
    ? chs.slice(0, 2).map(c => challengeCardHTML(c, true)).join("") +
      (chs.length > 2 ? '<div class="muted" style="font-size:12.8px">还有 ' + (chs.length - 2) + ' 个挑战，点右上角查看全部 ›</div>' : "")
    : '<div class="muted">还没有进行中的挑战——点右上角「全部挑战 / 发起」，全家一起做一件事吧。</div>';

  $("feedList").innerHTML = DB.feed.slice(0, 6).map(f =>
    '<li><span class="fx">' + f.icon + '</span><span>' + esc(f.text) + '</span><time>' + esc(f.time) + '</time></li>').join("");

  renderCalendar();
}
function challengeCheck(cid, name) {
  const c = DB.challenges.find(x => x.id === cid); if (!c || c.done) return;
  const m = c.members.find(x => x.name === name); if (!m || m.done) return;
  m.done = true;
  const before = DB.wishes.filter(x => x.done).length;
  const w = c.per > 0 ? addToWish(c.per) : null;
  pushFeed("🏡", name + "完成了家庭挑战「" + c.title + "」打卡" + (w && c.per > 0 ? "，心愿池 +" + c.per + " ⭐" : ""));
  const _s1 = slotByName(name);
  if (_s1) pushArchive(_s1, "完成了家庭挑战「" + c.title + "」（沟通力 · 文化品格力）");
  let finished = false;
  if (c.members.every(x => x.done)) {
    c.done = true; c.doneAt = todayStr(); finished = true;
    const w2 = c.bonus > 0 ? addToWish(c.bonus) : null;
    pushFeed("🎉", "家庭挑战「" + c.title + "」全员完成！" + (w2 && c.bonus > 0 ? "心愿池 +" + c.bonus + " ⭐" : ""));
    c.members.forEach(x => { const _sx = slotByName(x.name); if (_sx) pushArchive(_sx, "全家一起完成了挑战「" + c.title + "」（沟通力 · 文化品格力）"); });
    if (DB.wishes.filter(x => x.done).length === before) confetti();
  }
  saveAll(); renderAll();
  if (!finished) toast("打卡成功 ✅ " + name);
}

/* ================================================================
   渲染 · 果果（学龄前）
   ================================================================ */
let gPoemIdx = 0;
function poemsToday() { return pick(POEMS, 4, "guoguoPoem"); }
function renderGuoguo() {
  const st = taskStats("guoguo");
  $("g-todayDone").textContent = st.doneN;
  $("g-total").textContent = st.total;
  $("g-progress").style.width = (st.doneN / st.total * 100) + "%";
  $("g-earned").textContent = DB.earned.guoguo || 0;
  renderTaskRow("guoguo", st.tasks, "g-taskrow");
  updateOverdue("guoguo", st.tasks);

  const packs = CARD_PACKS.filter(p => (DB.prefs.guoguo.cardPacks || []).indexOf(p.id) >= 0);
  $("g-packName").textContent = "· " + (packs.length ? packs.map(p => p.emoji + p.name).join(" / ") : "全部主题") + " · 每天 " + DB.prefs.guoguo.dailyCards + " 张";
  const cards = guoguoCards();
  const seen = DB.seenCards.guoguo || [];
  $("g-cards").innerHTML = cards.map((c, i) =>
    '<div class="fc' + (seen.indexOf(c.pack + "-" + c.g) >= 0 ? " studied flipped" : "") + '" id="gc' + i + '" data-click="flipGCard(' + i + ')">' +
      '<div class="inner">' +
        '<div class="face front"><div class="glyph">' + c.g + '</div><div class="hint">点我，看我的秘密 ✨</div></div>' +
        '<div class="face back"><div class="py">' + c.g + '　' + c.p + '</div><div class="mean">' + esc(c.m) + '</div>' +
        '<div class="word">' + esc(c.t) + '</div><button data-click="event.stopPropagation();speak(\'' + c.g + '\')">🔊 听读音</button></div>' +
      '</div></div>').join("");

  const qlist = guoguoQuiz();
  const qpacks = QUIZ_PACKS_G.filter(p => (DB.prefs.guoguo.quizPacks || []).indexOf(p.id) >= 0);
  $("g-quizTag").textContent = "· " + (qpacks.length ? qpacks.map(p => p.name).join(" / ") : "全部题型");
  renderQuiz("guoguo", qlist, "g-quiz", "answerG", "guoguoQuiz");

  const pl = poemsToday();
  $("g-poemList").innerHTML = pl.map((p, i) =>
    '<button class="poem-pick' + (i === gPoemIdx ? " active" : "") + '" data-click="gPoemIdx=' + i + ';renderGuoguo()">' + p.t + ' · ' + p.a + '</button>').join("");
  const poem = pl[Math.min(gPoemIdx, pl.length - 1)] || pl[0];
  if (poem) {
    const done = (DB.done.guoguo.g3 || 0) >= 1;
    $("g-poemTag").textContent = "· 今天的 4 首里挑一首";
    $("g-poemCard").innerHTML =
      '<div style="font-size:19px;line-height:2;font-weight:700;text-align:center">' + poem.lines.join("<br>") + '</div>' +
      '<div class="muted" style="margin:10px 0;text-align:center">' + esc(poem.mean) + '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">' +
        '<button class="btn" data-click="speak(' + JSON.stringify(poem.lines.join("")).replace(/"/g, "&quot;") + ')">🔊 听一听</button>' +
        '<button class="btn primary"' + (done ? " disabled" : ' data-click="finishPoem(\'' + poem.id + '\')"') + '>' + (done ? "✓ 已跟读" : "我读好啦 +1 ⭐") + '</button>' +
      '</div>';
  }
  $("g-shop").innerHTML = renderShopHTML("guoguo", SHOP_G);
}
function renderTaskRow(child, tasks, rowId) {
  let row = $(rowId);
  if (!row) {
    const bar = $(child === "guoguo" ? "g-progress" : "x-progress").closest(".today-bar");
    row = document.createElement("div"); row.id = rowId;
    row.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:10px";
    bar.appendChild(row);
  }
  row.innerHTML = tasks.map(t => {
    const d = DB.done[child][t.id] || 0;
    const ok = d >= t.need;
    return '<span class="chip ' + (ok ? "s3" : "n") + '">' + (ok ? "✓ " : "") + t.name + ' ' + Math.min(d, t.need) + '/' + t.need + '</span>';
  }).join("");
}
function updateOverdue(child, tasks) {
  const divId = child === "guoguo" ? "g-overdue" : "x-overdue";
  let div = $(divId);
  const first = tasks.find(t => (DB.done[child][t.id] || 0) < t.need);
  const anyDone = tasks.some(t => (DB.done[child][t.id] || 0) > 0);
  if (anyDone && first) {
    div.innerHTML = "⏰ 「" + first.name + "」还没学完，今天接着完成就好，不着急 ⏳";
    div.classList.add("show");
  } else div.classList.remove("show");
}
function flipGCard(i) {
  const el = $("gc" + i); if (!el) return;
  const cards = guoguoCards();
  const c = cards[i]; if (!c) return;
  const key = c.pack + "-" + c.g;
  const wasFlipped = el.classList.contains("flipped");
  el.classList.add("flipped");
  if (wasFlipped) return;
  if (!DB.seenCards.guoguo) DB.seenCards.guoguo = [];
  if (DB.seenCards.guoguo.indexOf(key) >= 0) return;
  DB.seenCards.guoguo.push(key);
  bump("guoguo", "g1", 1, "cards");
  earnStar("guoguo", 1);
  checkAllDone("guoguo"); renderAll();
}
function finishPoem(pid) {
  if ((DB.done.guoguo.g3 || 0) >= 1) return;
  DB.done.guoguo.g3 = 1;
  const t = tallyOf("guoguo"); if (t.poems.indexOf(pid) < 0) t.poems.push(pid);
  saveAll();
  const p = POEMS.find(x => x.id === pid) || {};
  pushFeed("📖", KNS("guoguo") + "跟读了《" + (p.t || "古诗") + "》");
  pushArchive("guoguo", "跟读了《" + (p.t || "古诗") + "》（文化品格力 · 沟通力）");
  earnStar("guoguo", 1);
  checkAllDone("guoguo"); renderAll();
}

/* ================================================================
   通用答题组件
   ================================================================ */
function renderQuiz(child, list, boxId, fnName, rotKey) {
  const box = $(boxId); if (!box) return;
  const ans = DB.answered[child] || [];
  let idx = -1;
  for (let i = 0; i < list.length; i++) { if (ans.indexOf(list[i].id) < 0) { idx = i; break; } }
  if (idx === -1) {
    box.innerHTML = '<div class="q">🏅 这一轮全部答对，好厉害！点上面的「换一批」再来一组吧。</div>' +
      '<div class="quiz-foot"><span>本轮 ' + list.length + " / " + list.length + ' 题已完成</span><span>每天完成 ' + list.length + ' 题就达标啦</span></div>';
    return;
  }
  const q = list[idx];
  box.innerHTML = '<div class="q">' + esc(q.q) + '</div><div class="opts">' +
    q.o.map((o, j) => '<button class="opt" data-click="' + fnName + '(' + j + ',this)">' + esc(o) + '</button>').join("") + '</div>' +
    '<div class="quiz-foot"><span>第 ' + (idx + 1) + ' / ' + list.length + ' 题</span><span>答对 +1 ⭐ · 答错进错题本</span></div>';
  box.dataset.idx = String(idx);
}
function answerQ(child, taskId, list, j, btn, fnName) {
  const ans = DB.answered[child] || (DB.answered[child] = []);
  let idx = -1;
  for (let i = 0; i < list.length; i++) { if (ans.indexOf(list[i].id) < 0) { idx = i; break; } }
  if (idx === -1) return;
  const q = list[idx];
  if (j === q.a) {
    btn.classList.add("ok");
    if (ans.indexOf(q.id) < 0) {
      ans.push(q.id);
      bump(child, taskId, 1, "quiz");
      earnStar(child, 1);
    }
    const allDone = list.every(x => ans.indexOf(x.id) >= 0);
    if (allDone) {
      if (DB.perfect[child]) { tallyOf(child).quizPerfect += 1; }
      toast("本轮全部答完，收工！✨");
    }
    setTimeout(() => { checkAllDone(child); renderAll(); }, 450);
  } else {
    btn.classList.add("bad"); btn.disabled = true;
    DB.perfect[child] = false;
    if (DB.wrongBook.indexOf(q.q) < 0) { DB.wrongBook.push(q.q); if (DB.wrongBook.length > 30) DB.wrongBook.shift(); }
    saveAll();
    setTimeout(() => btn.classList.remove("bad"), 400);
    toast("收进错题本了，明天再来收服它 📕");
    setTimeout(renderAll, 420);
  }
}
function answerG(j, btn) { answerQ("guoguo", "g2", guoguoQuiz(), j, btn, "answerG"); }

/* ================================================================
   渲染 · 小宇（小学中）
   ================================================================ */
let xSciIdx = 0, xProjIdx = 0;
function sciToday() { return pick(SCI, 1, "xiaoyuSci")[0]; }
function projToday() { return pick(PROJ, 1, "xiaoyuProj")[0]; }
function renderXiaoyu() {
  const st = taskStats("xiaoyu");
  $("x-todayDone").textContent = st.doneN;
  $("x-total").textContent = st.total;
  $("x-progress").style.width = (st.doneN / st.total * 100) + "%";
  $("x-earned").textContent = DB.earned.xiaoyu || 0;
  $("x-streak").textContent = DB.streak.xiaoyu || 0;
  renderTaskRow("xiaoyu", st.tasks, "x-taskrow");
  updateOverdue("xiaoyu", st.tasks);

  const qlist = xiaoyuQuiz();
  const qpacks = QUIZ_PACKS_X.filter(p => (DB.prefs.xiaoyu.quizPacks || []).indexOf(p.id) >= 0);
  $("x-quizTag").textContent = "· " + (qpacks.length ? qpacks.map(p => p.name).join(" / ") : "全部题型") + " · 每天 " + DB.prefs.xiaoyu.dailyXQuiz + " 题";
  renderQuiz("xiaoyu", qlist, "x-quiz", "answerX", "xiaoyuQuiz");

  const wb = $("x-wrongbook");
  if (DB.wrongBook.length) {
    wb.classList.add("show");
    wb.textContent = "📕 错题本：共 " + DB.wrongBook.length + " 道待复习（" + DB.wrongBook.slice(-2).join("；") + "）";
  } else wb.classList.remove("show");

  const words = xiaoyuWords();
  const wpacks = WORD_PACKS.filter(p => (DB.prefs.xiaoyu.wordPacks || []).indexOf(p.id) >= 0);
  $("x-wordTag").textContent = "· " + (wpacks.length ? wpacks.map(p => p.emoji + p.name).join(" / ") : "全部词库") + " · 每天 " + DB.prefs.xiaoyu.dailyWords + " 张";
  const seen = DB.seenCards.xiaoyu || [];
  $("x-words").innerHTML = words.map((c, i) =>
    '<div class="fc' + (seen.indexOf(c.pack + "-" + c.w) >= 0 ? " studied flipped" : "") + '" id="xc' + i + '" data-click="flipXCard(' + i + ')">' +
      '<div class="inner">' +
        '<div class="face front"><div class="glyph" style="font-size:28px">' + c.w + '</div><div class="hint">' + c.packName + ' · 点我翻面 ✨</div></div>' +
        '<div class="face back"><div class="py">' + c.w + '</div><div class="mean">' + esc(c.m) + '</div>' +
        '<div class="word">' + esc(c.s) + '</div>' +
        '<button data-click="event.stopPropagation();speak(\'' + c.w + '\',\'en-US\')">🔊 听发音</button></div>' +
      '</div></div>').join("");

  const sci = sciToday();
  if (sci) {
    const done = (DB.done.xiaoyu.x3 || 0) >= 1;
    $("x-sciTag").textContent = "· 今天的第 1 个（共 " + SCI.length + " 个）";
    $("x-sciCard").innerHTML =
      '<div style="font-weight:700;font-size:16px">' + esc(sci.q) + '</div>' +
      '<div class="muted" style="margin:8px 0">' + esc(sci.how) + '</div>' +
      '<div class="muted" style="margin:0 0 10px">' + esc(sci.think) + '</div>' +
      '<button class="btn primary"' + (done ? " disabled" : ' data-click="finishSci(\'' + sci.id + '\')"') + '>' + (done ? "✓ 已完成" : "我做完啦 +2 ⭐") + '</button>';
  }

  const pj = projToday();
  if (pj) {
    $("x-projTag").textContent = "· " + pj.name + " · " + pj.days + " 天";
    $("x-project").innerHTML =
      '<div class="muted" style="margin:0 0 10px">跨学科小项目 · ' + pj.days + ' 天完成 · ' + esc(pj.dims) + ' · 完成后进入我的作品集</div>' +
      pj.steps.map((s, i) => {
        const id = pj.id + "-" + i;
        const done = DB.done.xiaoyu[id] || 0;
        return '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed #F0EBE2">' +
          '<span style="' + (done ? "text-decoration:line-through;color:#8F8B99" : "") + '">' + (done ? "✅ " : "○ ") + esc(s) + '</span>' +
          (done ? "" : '<button class="btn sm" data-click="projStep(\'' + pj.id + '\',' + i + ')">完成这一步</button>') +
        '</div>';
      }).join("") +
      (pj.steps.every((s, i) => DB.done.xiaoyu[pj.id + "-" + i]) ? '<div class="muted" style="margin-top:8px;color:#2F6B3D">🎉 项目完成！「' + esc(pj.name) + '」已进入' + KNS("xiaoyu") + '的作品集</div>' : "");
  }

  const readDone = (DB.done.xiaoyu.x4 || 0) >= 1;
  $("x-readBtn").disabled = readDone;
  $("x-readBtn").textContent = readDone ? "✓ 已打卡" : "读完打卡 +1 ⭐";
  $("x-shop").innerHTML = renderShopHTML("xiaoyu", SHOP_X);
}
function flipXCard(i) {
  const el = $("xc" + i); if (!el) return;
  const words = xiaoyuWords();
  const c = words[i]; if (!c) return;
  const key = c.pack + "-" + c.w;
  const wasFlipped = el.classList.contains("flipped");
  el.classList.add("flipped");
  if (wasFlipped) return;
  if (!DB.seenCards.xiaoyu) DB.seenCards.xiaoyu = [];
  if (DB.seenCards.xiaoyu.indexOf(key) >= 0) return;
  DB.seenCards.xiaoyu.push(key);
  bump("xiaoyu", "x2", 1, "words");
  earnStar("xiaoyu", 1);
  checkAllDone("xiaoyu"); renderAll();
}
function answerX(j, btn) { answerQ("xiaoyu", "x1", xiaoyuQuiz(), j, btn, "answerX"); }
function finishSci(sid) {
  if ((DB.done.xiaoyu.x3 || 0) >= 1) return;
  DB.done.xiaoyu.x3 = 1;
  tallyOf("xiaoyu").sci += 1;
  saveAll();
  const s = SCI.find(x => x.id === sid) || {};
  pushFeed("🔬", KNS("xiaoyu") + "完成了科学小探究：「" + (s.q || "") + "」");
  pushArchive("xiaoyu", "完成科学小探究：" + (s.q || "") + "（思维力）");
  earnStar("xiaoyu", 2);
  checkAllDone("xiaoyu"); renderAll();
}
function finishRead() {
  if ((DB.done.xiaoyu.x4 || 0) >= 1) return;
  DB.done.xiaoyu.x4 = 1;
  tallyOf("xiaoyu").read += 1;
  saveAll();
  pushFeed("📚", KNS("xiaoyu") + "完成 15 分钟阅读打卡");
  pushArchive("xiaoyu", "完成 15 分钟阅读打卡（沟通力）");
  earnStar("xiaoyu", 1);
  checkAllDone("xiaoyu"); renderAll();
}
function projStep(pid, i) {
  const id = pid + "-" + i;
  if (DB.done.xiaoyu[id]) return;
  DB.done.xiaoyu[id] = 1;
  const pj = PROJ.find(p => p.id === pid) || {};
  const last = (i === (pj.steps || []).length - 1);
  if (last) {
    const t = tallyOf("xiaoyu");
    if (t.proj.indexOf(pid) < 0) t.proj.push(pid);
    pushFeed("🛠️", KNS("xiaoyu") + "完成了项目「" + (pj.name || "") + "」，已进入作品集");
    pushArchive("xiaoyu", "完成项目「" + (pj.name || "") + "」（" + (pj.dims || "") + "）");
    toast("🎉 项目完成！已进入作品集");
  }
  saveAll();
  earnStar("xiaoyu", 1);
  renderAll();
}

/* ================================================================
   奖励商城
   ================================================================ */
function renderShopHTML(child, shop) {
  return shop.map(r => {
    const req = DB.requests.find(q => q.child === child && q.rewardId === r.id && q.status !== "rejected");
    let state = "", btnTxt = "申请兑换", disabled = false;
    if (req && req.status === "pending") { state = "pending"; btnTxt = "等待确认…"; disabled = true; }
    else if (req && req.status === "approved") { state = "approved"; btnTxt = "已兑换 ✔"; disabled = true; }
    const afford = DB.stars[child] >= r.cost;
    return '<div class="reward ' + state + '"><div><div class="rn">' + esc(r.name) + '</div>' +
      '<div class="rc">' + r.cost + ' ⭐</div>' +
      (req && req.status === "pending" ? '<div class="st">已申请，等爸爸妈妈确认</div>' :
        (afford ? "" : '<div class="st">还差 ' + (r.cost - DB.stars[child]) + ' ⭐</div>')) + '</div>' +
      '<button class="btn primary" ' + (disabled ? "disabled" : 'data-click="requestRedeem(\'' + child + '\',\'' + r.id + '\')"') + '>' + btnTxt + '</button></div>';
  }).join("");
}
function requestRedeem(child, rid) {
  const shop = child === "guoguo" ? SHOP_G : SHOP_X;
  const r = shop.find(x => x.id === rid); if (!r) return;
  if (DB.stars[child] < r.cost) { toast("星星还不够哦，先去完成任务吧 ⭐"); return; }
  if (DB.requests.some(q => q.child === child && q.rewardId === rid && q.status === "pending")) { toast("已经申请过啦，等爸爸妈妈确认～"); return; }
  DB.requests.unshift({ id: Date.now(), child, rewardId: rid, name: r.name, cost: r.cost, status: "pending" });
  saveAll();
  pushFeed("🎁", KNS(child) + "提交了兑换申请：「" + r.name + "」，等待家长确认");
  toast("已申请，等爸爸妈妈确认哦 ✨");
  renderAll();
}

/* ================================================================
   婴幼儿 / 初中 / 高中
   ================================================================ */
function renderBaby() {
  const list = pick(BABY_CARDS, 2, "babyCards");
  $("b-count").textContent = "· 每天 2 个（共 " + BABY_CARDS.length + " 张活动卡）";
  $("b-cards").innerHTML = list.map(c => {
    const done = DB.done.baby && DB.done.baby[c.id];
    return '<div class="task-card' + (done ? " done" : "") + '">' +
      '<div class="tt"><span class="tic" style="background:var(--s1-soft)">' + c.icon + '</span>' + esc(c.title) + '</div>' +
      '<div class="chip s1" style="align-self:flex-start">' + c.cat + '</div>' +
      '<div class="muted">' + esc(c.desc) + '</div>' +
      (done ? '<span class="tstate">✓ 已完成，家庭心愿 +3 ⭐</span>' : '<button class="btn primary" data-click="babyDone(\'' + c.id + '\')">完成打卡（家长）</button>') +
    '</div>';
  }).join("");
  const tip = pick(BABY_TIPS, 1, "babyTips")[0];
  if (tip) {
    $("b-tip").innerHTML = '<div style="font-weight:700">' + esc(tip.title) + '</div>' +
      '<div class="muted" style="margin-top:6px;line-height:1.85">' + esc(tip.text) + '</div>' +
      '<div class="muted" style="margin-top:9px;font-size:12.2px;color:#8A6A2E">📎 ' + esc(tip.src) + '</div>';
  }
}
function babyDone(id) {
  DB.done.baby = DB.done.baby || {};
  if (DB.done.baby[id]) return;
  DB.done.baby[id] = 1;
  addToWish(3);
  saveAll();
  pushFeed("🍼", "豆豆的家长完成了亲子活动打卡，心愿池 +3 ⭐");
  toast("打卡成功！给坚持陪伴的自己点个赞 ❤");
  renderAll();
}

function renderJunior() {
  const list = pick(JUNIOR_BOARD, 4, "juniorBoard");
  $("j-board").innerHTML = list.map(t => {
    const s = DB.jstate[t.id] || 0;
    const color = s === 2 ? "#E6F2E8" : (s === 1 ? "#E7F0F7" : "#F6F2EA");
    const txt = s === 2 ? "#2F6B3D" : (s === 1 ? "#2C5F82" : "#5B5765");
    return '<div class="task-card" style="cursor:pointer" data-click="cycleJ(\'' + t.id + '\')">' +
      '<div class="tt">' + esc(t.t) + '</div>' +
      '<div style="display:flex;gap:7px;align-items:center"><span class="chip n">' + esc(t.tag) + '</span>' +
      '<span class="chip" style="background:' + color + ';color:' + txt + '">' + JSTATES[s] + '</span></div>' +
      '<div class="muted" style="font-size:12px">点击卡片切换到下一状态</div></div>';
  }).join("");
  const cards = pick(JUNIOR_CARDS, 4, "juniorCards");
  $("j-cards").innerHTML = cards.map((c, i) =>
    '<div class="fc" id="jc' + i + '" data-click="this.classList.toggle(\'flipped\')">' +
      '<div class="inner">' +
        '<div class="face front"><div class="glyph" style="font-size:30px">' + esc(c.f) + '</div><div class="hint">' + esc(c.h) + '</div></div>' +
        '<div class="face back"><div class="mean" style="font-size:12.5px">' + esc(c.b) + '</div></div>' +
      '</div></div>').join("");
  const topic = pick(JUNIOR_TOPICS, 1, "juniorTopic")[0];
  if (topic) {
    $("j-topic").innerHTML = '<div style="font-weight:700">本月小课题：' + esc(topic.t) + '</div>' +
      '<div class="muted" style="margin-top:6px">' + esc(topic.d) + '</div>' +
      '<div class="muted" style="margin-top:6px">' + esc(topic.tip) + '</div>';
  }
}
function cycleJ(jid) {
  const cur = DB.jstate[jid] || 0; const next = (cur + 1) % 3;
  DB.jstate[jid] = next; saveAll();
  if (next === 2) { const t = JUNIOR_BOARD.find(x => x.id === jid); pushFeed("🧭", "澄澄完成了计划：「" + (t ? t.t : "") + "」"); toast("完成一项，节奏不错 🎯"); }
  renderAll();
}

function seniorTopic() { return pick(SENIOR_TOPICS, 1, "seniorTopic")[0]; }
function renderSenior() {
  const t = seniorTopic();
  if (t) {
    $("s-topicTag").textContent = "· 共 " + SENIOR_TOPICS.length + " 个课题可选";
    $("s-topicTitle").textContent = t.t;
    $("s-steps").innerHTML = t.steps.map((s, i) => {
      const done = i < DB.sstep; const now = i === DB.sstep;
      return '<div style="display:flex;gap:10px;align-items:center;padding:7px 0">' +
        '<span style="width:24px;text-align:center">' + (done ? "✅" : (now ? "🔵" : "⚪")) + '</span>' +
        '<span style="' + (done ? "color:#8F8B99;text-decoration:line-through" : "") + '">' + esc(s) + '</span>' +
        (now ? '<button class="btn sm" style="margin-left:auto" data-click="snext()">完成这步</button>' : '') +
      '</div>';
    }).join("");
  }
  const rd = pick(SENIOR_READ, 1, "seniorRead")[0];
  if (rd) $("s-readCard").innerHTML = '<div style="font-weight:700">' + esc(rd.t) + '</div><div class="muted" style="margin-top:6px">' + esc(rd.d) + '</div>';
  const ai = pick(SENIOR_AI, 1, "seniorAI")[0];
  if (ai) $("s-aiCard").innerHTML = '<div style="font-weight:700">' + esc(ai.t) + '</div><div class="muted" style="margin-top:6px">' + esc(ai.d) + '</div>';
  const b = $("s-defBtn");
  b.disabled = DB.sDefense;
  b.textContent = DB.sDefense ? "✓ 已完成一次家庭答辩" : "完成一次家庭答辩 +3 ⭐";
}
function snext() {
  const t = seniorTopic(); if (!t) return;
  if (DB.sstep >= t.steps.length) return;
  DB.sstep++; saveAll();
  if (DB.sstep === t.steps.length) { pushFeed("🔭", "彦彦完成了研究小课题「" + t.t + "」全流程，进入研究档案"); toast("🎉 课题完成！已进入研究档案"); }
  else toast("推进到下一步 →");
  renderAll();
}
function finishDefense() {
  if (DB.sDefense) return;
  DB.sDefense = true; saveAll();
  pushFeed("🎓", "彦彦完成了一次家庭答辩，收集到 3 个提问并作答");
  toast("很棒的答辩！已记入素养证据链 🎓");
  renderAll();
}

/* ================================================================
   可视化 · 打卡日历 / 周报柱图 / 五维雷达
   ================================================================ */
function renderCalendar() {
  const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
  $("calTitle").textContent = y + " 年 " + (m + 1) + " 月";
  $("calDows").innerHTML = ["日", "一", "二", "三", "四", "五", "六"].map(d => '<div class="cal-dow">' + d + '</div>').join("");
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  let cells = "", monthStars = 0, activeDays = 0;
  for (let i = 0; i < startDow; i++) cells += '<div class="cal-cell" style="background:transparent"></div>';
  for (let d = 1; d <= days; d++) {
    const ds = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
    const h = DB.history[ds] || {};
    const g = h.guoguo || 0, x = h.xiaoyu || 0, tot = g + x;
    if (tot > 0) { monthStars += tot; activeDays++; }
    const alpha = tot === 0 ? 0 : Math.min(0.92, 0.22 + tot / 22);
    const bg = tot === 0 ? "#F5F2EC" : "rgba(217,119,6," + alpha.toFixed(2) + ")";
    const isToday = ds === todayStr();
    cells += '<div class="cal-cell' + (tot > 0 ? " has" : "") + (isToday ? " today" : "") + '" style="background:' + bg + '" title="' + ds + ' 共 ' + tot + ' ⭐">' +
      '<span class="dnum">' + d + '</span>' +
      (tot > 0 ? '<span class="dmk">' + (g > 0 ? KE("guoguo") : "") + (x > 0 ? KE("xiaoyu") : "") + '</span>' : '') + '</div>';
  }
  $("calGrid").innerHTML = cells;
  $("calSub").textContent = "本月共 " + monthStars + " ⭐ · " + activeDays + " 天有学习记录";
  const lg = kidsOn().filter(s => SLOT_META[s].deep === true).map(s => KE(s) + " " + KNS(s)).join(" &nbsp; ");
  $("calLegend").innerHTML = '<span><i style="background:#F5F2EC"></i>没记录</span>' +
    '<span><i style="background:rgba(217,119,6,.35)"></i>星星少一点</span>' +
    '<span><i style="background:rgba(217,119,6,.8)"></i>星星多一点</span>' +
    (lg ? '<span>' + lg + '</span>' : '');
}

function last7() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = dateStr(d);
    const h = DB.history[ds] || {};
    out.push({ ds, label: (d.getMonth() + 1) + "/" + d.getDate(), guoguo: h.guoguo || 0, xiaoyu: h.xiaoyu || 0, today: i === 0 });
  }
  return out;
}
function drawWeekly() {
  const data = last7();
  const W = 680, H = 220, padL = 40, padR = 14, padT = 16, padB = 42;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxV = Math.max(8, ...data.map(d => Math.max(d.guoguo, d.xiaoyu)));
  const step = Math.ceil(maxV / 4 / 5) * 5 || 5;
  const top = Math.max(step * 4, maxV);
  const yOf = v => padT + plotH - (v / top) * plotH;
  const groupW = plotW / 7;
  const barW = Math.min(20, groupW / 3.2);
  let s = "";
  for (let g = 0; g <= 4; g++) {
    const v = top * (4 - g) / 4, yy = yOf(v);
    s += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '" stroke="#EFEAE1" stroke-width="1"/>';
    s += '<text x="' + (padL - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11" fill="#8F8B99">' + Math.round(v) + '</text>';
  }
  data.forEach((d, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const gx = cx - barW - 2, xx = cx + 2;
    const gh = Math.max(d.guoguo > 0 ? 3 : 0, (d.guoguo / top) * plotH);
    const xh = Math.max(d.xiaoyu > 0 ? 3 : 0, (d.xiaoyu / top) * plotH);
    s += '<rect x="' + gx + '" y="' + (padT + plotH - gh) + '" width="' + barW + '" height="' + gh + '" rx="5" fill="#E76F8C"/>';
    s += '<rect x="' + xx + '" y="' + (padT + plotH - xh) + '" width="' + barW + '" height="' + xh + '" rx="5" fill="#4E9A5F"/>';
    if (d.guoguo) s += '<text x="' + (gx + barW / 2) + '" y="' + (padT + plotH - gh - 4) + '" text-anchor="middle" font-size="10.5" fill="#B0536E" font-weight="700">' + d.guoguo + '</text>';
    if (d.xiaoyu) s += '<text x="' + (xx + barW / 2) + '" y="' + (padT + plotH - xh - 4) + '" text-anchor="middle" font-size="10.5" fill="#2F6B3D" font-weight="700">' + d.xiaoyu + '</text>';
    s += '<text x="' + cx + '" y="' + (H - 20) + '" text-anchor="middle" font-size="12" fill="' + (d.today ? "#B45309" : "#8F8B99") + '" font-weight="' + (d.today ? "800" : "400") + '">' + d.label + (d.today ? " 今天" : "") + '</text>';
  });
  s += '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="#DDD6C9" stroke-width="1.2"/>';
  $("wkSvg").innerHTML = s;
  const totG = data.reduce((a, d) => a + d.guoguo, 0), totX = data.reduce((a, d) => a + d.xiaoyu, 0);
  const wn = [];
  if (kidOf("guoguo") && kidOf("guoguo").on) wn.push('<span>' + KE("guoguo") + ' ' + KNS("guoguo") + ' 7 天共 ' + totG + ' ⭐</span>');
  if (kidOf("xiaoyu") && kidOf("xiaoyu").on) wn.push('<span>' + KE("xiaoyu") + ' ' + KNS("xiaoyu") + ' 7 天共 ' + totX + ' ⭐</span>');
  $("wkNote").innerHTML = wn.join("") +
    '<span>柱子从 0 起算 · 高度即当天实际获得的星星数</span>';
}

function dimCounts(child) {
  const arr = DB.archive[child] || [];
  const c = [0, 0, 0, 0, 0];
  arr.forEach(e => {
    const hits = [];
    DIM_KEYWORDS.forEach(dk => { if (dk.words.some(w => String(e.x).indexOf(w) >= 0)) hits.push(dk.dim); });
    if (hits.length) hits.forEach(di => { c[di] += 1; });
    else c[0] += 1;
  });
  return c;
}
const RADAR_COLOR = { guoguo: "#E76F8C", xiaoyu: "#4E9A5F" };
function drawRadar(child) {
  const cx = 260, cy = 187, R = 112;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5;
  const sets = [];
  if (child === "both") {
    sets.push({ color: RADAR_COLOR.guoguo, data: dimCounts("guoguo"), name: KNS("guoguo") });
    sets.push({ color: RADAR_COLOR.xiaoyu, data: dimCounts("xiaoyu"), name: KNS("xiaoyu") });
  } else {
    sets.push({ color: RADAR_COLOR[child], data: dimCounts(child), name: KNS(child) });
  }
  const maxV = Math.max(3, ...sets.reduce((a, s) => a.concat(s.data), []));
  let s = "";
  [0.33, 0.66, 1].forEach(k => {
    const pts = DIMS.map((_, i) => (cx + R * k * Math.cos(ang(i))) + "," + (cy + R * k * Math.sin(ang(i)))).join(" ");
    s += '<polygon points="' + pts + '" fill="none" stroke="#E8E2D6" stroke-width="1.2"/>';
  });
  DIMS.forEach((_, i) => {
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(ang(i))) + '" y2="' + (cy + R * Math.sin(ang(i))) + '" stroke="#E8E2D6" stroke-width="1.2"/>';
  });
  s += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="10.5" fill="#C6C1B7" font-weight="700">' + maxV + '</text>';
  sets.forEach(st => {
    const rad = v => (v <= 0 ? 0 : Math.max(0.05, Math.min(1, v / maxV))) * R;
    const pts = st.data.map((v, i) => {
      const r = rad(v);
      return (cx + r * Math.cos(ang(i))) + "," + (cy + r * Math.sin(ang(i)));
    }).join(" ");
    s += '<polygon points="' + pts + '" fill="' + st.color + '2E" stroke="' + st.color + '" stroke-width="2.2" stroke-linejoin="round"/>';
    st.data.forEach((v, i) => {
      const r = rad(v);
      s += '<circle cx="' + (cx + r * Math.cos(ang(i))) + '" cy="' + (cy + r * Math.sin(ang(i))) + '" r="' + (v <= 0 ? 2.6 : 4.2) + '" fill="' + st.color + '" stroke="#fff" stroke-width="1.6"/>';
    });
  });
  DIMS.forEach((lab, i) => {
    const lx = cx + (R + 30) * Math.cos(ang(i)), ly = cy + (R + 30) * Math.sin(ang(i));
    const anchor = Math.abs(Math.cos(ang(i))) < 0.25 ? "middle" : (Math.cos(ang(i)) > 0 ? "start" : "end");
    let vals = "";
    if (sets.length === 1) vals = '<tspan fill="' + sets[0].color + '" font-size="11.5"> ' + sets[0].data[i] + '</tspan>';
    else vals = '<tspan fill="' + sets[0].color + '" font-size="11.5"> ' + sets[0].data[i] + '</tspan><tspan fill="' + RADAR_COLOR.xiaoyu + '" font-size="11.5">/' + sets[1].data[i] + '</tspan>';
    s += '<text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="' + anchor + '" font-size="13" font-weight="700" fill="#5B5765" font-family="inherit">' + lab + vals + '</text>';
  });
  $("radarSvg").innerHTML = s;
  const total = sets.reduce((a, st) => a + st.data.reduce((x, y) => x + y, 0), 0);
  $("radarNote").textContent = (child === "both"
    ? KE("guoguo") + " " + KNS("guoguo") + " / " + KE("xiaoyu") + " " + KNS("xiaoyu") + " 两个数字依次为各自的证据记录条数"
    : "共 " + total + " 条成长记录") + "（雷达显示的是证据记录条数，不是评分）";
}

function switchArchive(child, el) {
  archiveChild = child;
  document.querySelectorAll("#view-archive .tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  else { const t = $(child === "both" ? "tab-both" : child === "guoguo" ? "tab-g" : "tab-x"); if (t) t.classList.add("active"); }
  drawRadar(child);
  const list = child === "both" ? (DB.archive.guoguo || []).concat(DB.archive.xiaoyu || []) : (DB.archive[child] || []);
  $("archiveTimeline").innerHTML = list.slice(0, 24).map(e =>
    '<li><div class="td">' + esc(e.d) + '</div><div class="tx">' + esc(e.x) + '</div></li>').join("") ||
    '<li class="muted">还没有记录，去完成一件小事吧。</li>';
}

/* ================================================================
   徽章墙
   ================================================================ */
function badgeStats(child) {
  const t = tallyOf(child);
  const arch = DB.archive[child] || [];
  const hist = DB.history || {};
  return {
    doneCount: arch.length,
    cards: t.cards, words: t.words, sci: t.sci, read: t.read,
    quizPerfect: t.quizPerfect,
    proj: t.proj, poems: t.poems,
    totalStars: t.starsTotal,
    familyDone: DB.challenges.filter(c => c.done).length,
    careCount: DB.care.filter(k => k.child === child).length,
    wishDone: DB.wishes.filter(w => w.done).length,
    wishContrib: DB.wishes.reduce((a, w) => a + ((w.contrib && w.contrib[child]) || 0), 0),
    archiveCount: arch.length,
    dimCount: dimCounts(child).filter(v => v > 0).length,
    activeDays: Object.keys(hist).filter(k => hist[k] && hist[k][child] > 0).length,
    bonusCount: t.bonusCount || 0
  };
}
function renderBadges() {
  const st = badgeStats(badgeChild);
  const on = BADGES.filter(b => { try { return b.chk(st, DB.streak[badgeChild] || 0); } catch (e) { return false; } });
  $("badgeHead").innerHTML = KE(badgeChild) + " " + esc(KNS(badgeChild)) + " 已点亮 <b style='color:#B45309'>" + on.length + "</b> / " + BADGES.length + " 枚徽章";
  $("badgeGrid").innerHTML = BADGES.map(b => {
    const got = on.indexOf(b) >= 0;
    return '<div class="badge' + (got ? " on" : "") + '"><div class="bi">' + b.icon + '</div>' +
      '<div class="bn">' + b.name + '</div><div class="bd">' + b.d + '</div></div>';
  }).join("");
}
function switchBadges(child, el) {
  badgeChild = child;
  document.querySelectorAll("#badgeTabs .tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  renderBadges();
}

/* ================================================================
   家长中心
   ================================================================ */
function getPin() { return DB.parentPin || ""; }
function setPin(v) { DB.parentPin = v; saveAll(); }
function renderPinGate() {
  const has = !!getPin();
  $("pinTitle").textContent = has ? "🔐 家长验证" : "🔐 设置家长密码";
  $("pinDesc").textContent = has ? "输入 4 位数字密码解锁家长身份（家庭成员共享）" : "首次进入，请设置 4 位数字密码（防的是孩子自己乱点）";
  $("pinInput").value = "";
}
function submitPin() {
  const v = $("pinInput").value.trim();
  if (!/^\d{4}$/.test(v)) { toast("请输入 4 位数字哦"); return; }
  if (!getPin()) { setPin(v); parentUnlocked = true; go("view-parent"); toast("密码已设置，家长中心已解锁 ✨"); return; }
  if (v === getPin()) { parentUnlocked = true; go("view-parent"); }
  else { toast("密码不对，再想想～"); $("pinInput").value = ""; }
}
function renderParent() {
  paintKidsUI();
  const on = kidsOn();
  $("p-kids").innerHTML = on.length ? on.map(s => {
    const m = SLOT_META[s];
    let tail;
    if (m.deep === true) {
      const ts = taskStats(s);
      tail = "完成 " + ts.doneN + "/" + ts.total + " 项 · ⭐ " + DB.stars[s] + " · 连续 " + (DB.streak[s] || 0) + " 天";
    } else if (m.deep === "tool") {
      tail = "家长活动卡 · 宝宝不碰屏幕";
    } else {
      tail = '<span class="muted">体验版工作台</span>';
    }
    return '<div class="kv"><span>' + KE(s) + ' ' + esc(KNS(s)) + '（' + m.stage + '）</span><span>' + tail + '</span></div>';
  }).join("") : '<div class="muted">还没有添加孩子——在下方「家庭档案」里添加吧。</div>';

  if ($("p-profile")) $("p-profile").innerHTML = renderFamilyProfileHTML();
  if ($("p-grandma")) {
    const wkG = careThisWeek();
    $("p-grandma").textContent = wkG.length ? ("本周陪伴记录 " + wkG.length + " 次 ❤") : "本周还没有陪伴记录";
  }

  const pending = DB.requests.filter(r => r.status === "pending");
  const history = DB.requests.filter(r => r.status !== "pending").slice(0, 3);
  let html = "";
  if (!pending.length && !history.length) html = '<div class="muted">暂时没有新的兑换申请～</div>';
  pending.forEach(r => {
    html += '<div class="req-row"><span>' + KE(r.child) + " " + esc(KNS(r.child)) + '申请：「' + esc(r.name) + '」<b style="color:#B45309">' + r.cost + ' ⭐</b></span>' +
      '<span style="display:flex;gap:8px"><button class="btn primary" data-click="confirmReq(' + r.id + ')">确认</button>' +
      '<button class="btn" data-click="rejectReq(' + r.id + ')">驳回</button></span></div>';
  });
  history.forEach(r => {
    html += '<div class="req-row" style="background:#FCFAF6;border-color:#EDE7DC"><span>' + KE(r.child) + " " + esc(KNS(r.child)) + '「' + esc(r.name) + '」</span>' +
      '<span class="muted">' + (r.status === "approved" ? "已确认 · 已扣 " + r.cost + " ⭐" : "已驳回") + '</span></div>';
  });
  $("p-requests").innerHTML = html;

  // 内容选择
  renderPackGrid("pk-guoguo-cards", CARD_PACKS, DB.prefs.guoguo.cardPacks, "guoguo", "cardPacks");
  renderPackGrid("pk-guoguo-quiz", QUIZ_PACKS_G, DB.prefs.guoguo.quizPacks, "guoguo", "quizPacks");
  renderPackGrid("pk-xiaoyu-words", WORD_PACKS, DB.prefs.xiaoyu.wordPacks, "xiaoyu", "wordPacks");
  renderPackGrid("pk-xiaoyu-quiz", QUIZ_PACKS_X, DB.prefs.xiaoyu.quizPacks, "xiaoyu", "quizPacks");
  $("st-dailyCards").textContent = DB.prefs.guoguo.dailyCards;
  $("st-dailyGQuiz").textContent = DB.prefs.guoguo.dailyGQuiz;
  $("st-dailyXQuiz").textContent = DB.prefs.xiaoyu.dailyXQuiz;
  $("st-dailyWords").textContent = DB.prefs.xiaoyu.dailyWords;

  $("guardianToggle").checked = DB.guardian.enabled;
  $("guardianMin").value = String(DB.guardian.min);

  $("p-account").textContent = (mode === "cloud" && currentUser)
    ? ("已登录 · " + currentUser.name + (syncState === "error" ? " · 上次同步失败" : " · 已同步"))
    : "本地体验模式（未登录）";
  $("p-dataNote").textContent = (mode === "cloud" && currentUser)
    ? "家庭数据和家长密码保存在云端，获授权的家人共同使用。"
    : "数据只保存在这台设备上，登录后可以同步到云端。";
  if ($("backupNote")) $("backupNote").textContent = (mode === "cloud" && currentUser)
    ? "家庭数据保存在云端；导出的备份文件可以随时恢复。"
    : "当前是本地体验模式，数据只在这台设备上；导出的备份文件可以随时恢复。";

  // 家庭心愿与挑战（家长视角）
  const pf = $("p-family");
  if (pf) {
    const act = DB.wishes.filter(w => !w.done);
    const ca = DB.challenges.filter(c => !c.done);
    pf.innerHTML =
      '<div class="kv"><span>进行中的心愿</span><span>' + (act.length ? act.length + " 个 · 当前：" + esc(act[0].emoji + act[0].title) + "（" + act[0].saved + "/" + act[0].target + " ⭐）" : "暂无") + '</span></div>' +
      '<div class="kv"><span>已达成的心愿</span><span>' + DB.wishes.filter(w => w.done).length + ' 个</span></div>' +
      '<div class="kv"><span>进行中的挑战</span><span>' + (ca.length ? ca.length + " 个 · 当前：" + esc(ca[0].emoji + ca[0].title) : "暂无") + '</span></div>' +
      '<div class="kv"><span>已完成的挑战</span><span>' + DB.challenges.filter(c => c.done).length + ' 个</span></div>' +
      '<div class="kv"><span>本周陪伴记录</span><span>' + careThisWeek().length + ' 次</span></div>';
  }
}

/* ---------- 家庭档案（v1.3）：家庭名 / 孩子编辑 / 添加孩子 ---------- */
function renderFamilyProfileHTML() {
  const f = DB.family || {};
  let h = '<div class="kv"><span>家庭名</span><span style="display:flex;gap:8px;align-items:center">' +
    '<input id="famNameIn" value="' + esc(f.name || "") + '" maxlength="10" placeholder="如：小禾家" style="padding:6px 10px;border:1.5px solid var(--line);border-radius:10px;font-size:14px;width:132px;background:#FCFAF6">' +
    '<button class="btn sm" data-click="saveFamName()">保存</button></span></div>';
  h += '<div style="margin-top:6px">';
  KID_SLOTS.forEach(s => {
    const k = kidOf(s), m = SLOT_META[s];
    if (k && k.on) {
      h += '<div class="kid-row"><span class="em3">' + KE(s) + '</span>' +
        '<span class="nm3">' + esc(KNS(s)) + '</span>' +
        '<span class="chip ' + m.cls + '">' + m.stage + ' · ' + m.ages + '</span>' +
        '<span class="sp3"><button class="btn sm" data-click="openKidEditor(\'' + s + '\')">编辑</button>' +
        '<button class="btn sm" data-click="toggleKid(\'' + s + '\', false)">停用</button></span></div>';
    }
  });
  const free = KID_SLOTS.filter(s => !(kidOf(s) && kidOf(s).on));
  if (free.length) {
    h += '<div style="margin-top:12px"><div class="muted" style="margin-bottom:6px">添加孩子（每个学段各有一个工作台）：</div><div class="slot-pick">';
    free.forEach(s => { const m = SLOT_META[s]; h += '<button data-click="openKidEditor(\'' + s + '\', true)">＋ ' + m.emoji + ' ' + m.stage + '（' + m.ages + '）</button>'; });
    h += '</div></div>';
  } else {
    h += '<div class="muted" style="margin-top:10px">五个学段的工作台都已有孩子 🎉</div>';
  }
  h += '<div class="muted" style="margin-top:12px;font-size:12.5px;line-height:1.8">' +
    '💡 ' + (f.demo
      ? '当前是<b>示例家庭</b>（小禾家的演示数据）。把家庭名和孩子改成你家的名字，这里就真正属于你们了；也可以点下方「重建家庭档案」从零开始。'
      : '孩子的小名、头像随时可以改——首页、徽章、成长档案和导出的长图都会同步更新。停用不会删除数据，随时可以重新启用。') +
    '</div>';
  h += '<div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:12px">' +
    '<button class="btn sm" data-click="reobReset()">🧹 重建家庭档案（清空数据 · 重新初始化）</button></div>';
  return h;
}
function saveFamName() {
  const v = (($("famNameIn") && $("famNameIn").value) || "").trim();
  if (v.length < 1) { toast("给家庭起个名字吧 ✍️"); return; }
  DB.family.name = v;
  DB.family.demo = false;
  saveAll(); renderAll();
  toast("家庭名已更新：" + v + " 🏠");
}
/* 编辑 / 添加孩子 */
let kidEd = null;
function openKidEditor(slot, isNew) {
  const anyFree = KID_SLOTS.filter(s => !(kidOf(s) && kidOf(s).on));
  if (isNew && !slot && !anyFree.length) { toast("五个学段的工作台都已经有孩子啦 🎉"); return; }
  const k = slot ? kidOf(slot) : null;
  kidEd = {
    slot: slot || null, isNew: !!isNew,
    emoji: (k && k.emoji) || (slot ? SLOT_META[slot].emoji : "🌸"),
    name: (!isNew && slot && k) ? (k.name || "") : ""
  };
  paintKidEditor();
  openModal("modalKid");
  setTimeout(() => { try { $("kidNameIn").focus(); } catch (e) {} }, 80);
}
function paintKidEditor() {
  const ed = kidEd; if (!ed) return;
  $("kidEdTitle").textContent = ed.isNew ? "🧒 添加孩子" : "✏️ 编辑孩子";
  $("kidEdSub").textContent = ed.isNew
    ? "给每个孩子一个专属工作台——名字和头像随时可以再改。"
    : "改个好听的小名，首页、徽章和成长档案都会跟着变。";
  $("kidNameIn").value = ed.name || "";
  $("kidEmojiRow").innerHTML = KID_EMOJIS.map(e2 =>
    '<span class="' + (e2 === ed.emoji ? "sel" : "") + '" data-click="kidEd.emoji=\'' + e2 + '\';paintKidEditor()">' + e2 + '</span>').join("");
  if (ed.isNew && !ed.slot) {
    $("kidStageRow").innerHTML = KID_SLOTS.map(s => {
      const mm = SLOT_META[s], taken = !!(kidOf(s) && kidOf(s).on);
      return '<div class="ob-opt' + (taken ? " dis" : "") + '"' +
        (taken ? "" : ' data-click="kidEd.slot=\'' + s + '\';kidEd.emoji=\'' + mm.emoji + '\';paintKidEditor()"') + '>' +
        '<span class="em2">' + mm.emoji + '</span><div><b>' + mm.stage + '</b><span class="muted">' + mm.ages + (taken ? " · 已有一个孩子" : "") + '</span></div></div>';
    }).join("");
  } else if (ed.slot) {
    const mm = SLOT_META[ed.slot];
    $("kidStageRow").innerHTML = '<div class="ob-opt sel" style="cursor:default">' +
      '<span class="em2">' + mm.emoji + '</span><div><b>' + mm.stage + ' · ' + mm.ages + '</b>' +
      '<span class="muted">' + (ed.isNew ? "添加后进入这个学段的工作台" : (mm.deep === true ? "数据与星星都在这个工作台里" : "体验版工作台")) + '</span></div></div>';
  }
}
function saveKidEditor() {
  const ed = kidEd; if (!ed) return;
  if (!ed.slot) { toast("先选一个学段吧"); return; }
  const nm = (($("kidNameIn") && $("kidNameIn").value) || ed.name || "").trim();
  if (!nm) { toast("给孩子起个名字吧 ✍️"); return; }
  const k = DB.family.kids[ed.slot];
  const wasOn = !!(k && k.on);
  DB.family.kids[ed.slot] = { on: true, name: nm, emoji: ed.emoji || SLOT_META[ed.slot].emoji };
  DB.family.demo = false;
  ensureKidBucket(ed.slot);
  saveAll(); closeModal("modalKid"); renderAll();
  toast(wasOn ? ("已更新：" + nm + " ✨") : (nm + " 的工作台准备好啦 🎉"));
}
function toggleKid(slot, on) {
  const k = kidOf(slot); if (!k) return;
  if (!on && !confirm("停用「" + KNS(slot) + "」的工作台吗？\n\n数据会保留，随时可以重新启用。")) return;
  k.on = !!on;
  if (on) ensureKidBucket(slot);
  saveAll(); renderAll();
  toast(on ? ("已重新启用 " + KNS(slot)) : ("已停用 " + KNS(slot) + "（数据已保留）"));
}
async function reobReset() {
  if (!confirm("重建家庭档案会清空全部数据（星星、记录、心愿、成长档案），并重新进入初始化向导。\n\n此操作不可恢复，建议先导出备份。确定继续吗？")) return;
  if (!confirm("再次确认：真的要清空并重新初始化吗？")) return;
  DB = clone(DEFAULTS);
  dirty = true;
  if (!await cloudPush()) return;
  parentUnlocked = false;
  location.reload();
}
function renderPackGrid(boxId, all, selected, child, field) {
  const box = $(boxId); if (!box) return;
  box.innerHTML = all.map(p => {
    const on = (selected || []).indexOf(p.id) >= 0;
    return '<span class="pack' + (on ? " on" : "") + '" data-click="togglePack(\'' + child + '\',\'' + field + '\',\'' + p.id + '\')">' +
      '<span class="bx">' + (on ? "✓" : "") + '</span>' + (p.emoji ? p.emoji + " " : "") + esc(p.name) + '</span>';
  }).join("") + '<span class="muted" style="align-self:center;margin-left:4px">不选任何一项 = 使用全部内容</span>';
}
function togglePack(child, field, id) {
  const arr = DB.prefs[child][field] || [];
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  DB.prefs[child][field] = arr;
  saveAll(); renderParent(); renderAll();
  toast(i >= 0 ? "已取消" : "已加入孩子的今日内容");
}
function stepNum(key, delta) {
  const bounds = { dailyCards: [3, 8, "guoguo", "dailyCards"], dailyGQuiz: [2, 6, "guoguo", "dailyGQuiz"],
                   dailyXQuiz: [3, 10, "xiaoyu", "dailyXQuiz"], dailyWords: [3, 10, "xiaoyu", "dailyWords"] };
  const b = bounds[key]; if (!b) return;
  const cur = DB.prefs[b[2]][b[3]];
  const next = Math.max(b[0], Math.min(b[1], cur + delta));
  if (next === cur) { toast("已经到" + (delta > 0 ? "上限" : "下限") + "啦"); return; }
  DB.prefs[b[2]][b[3]] = next;
  saveAll(); renderParent(); renderAll();
}
function confirmReq(id) {
  const r = DB.requests.find(q => q.id === id); if (!r || r.status !== "pending") return;
  if (DB.stars[r.child] < r.cost) { toast("孩子的星星不够了，先驳回吧～"); return; }
  DB.stars[r.child] -= r.cost; r.status = "approved";
  saveAll();
  pushFeed("✅", ((mode === "cloud" && currentUser) ? currentUser.name : "妈妈") + "确认了" + KNS(r.child) + "的兑换：「" + r.name + "」-" + r.cost + " ⭐");
  toast("已确认，扣 " + r.cost + " ⭐");
  renderAll();
}
function rejectReq(id) {
  const r = DB.requests.find(q => q.id === id); if (!r || r.status !== "pending") return;
  r.status = "rejected"; saveAll();
  toast("已驳回，记得告诉孩子原因哦");
  renderAll();
}
function toggleGuardian(el) { DB.guardian.enabled = el.checked; saveAll(); toast(el.checked ? "时长守护已开启 ⏰" : "时长守护已关闭"); }
function setGuardianMin(v) { DB.guardian.min = parseInt(v, 10); saveAll(); toast("提醒时长已设为 " + v + " 分钟"); }

/* ================================================================
   备份 / 恢复 / 重置 / 建议 / 周报
   ================================================================ */
function exportData() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "家庭伴学台_备份_" + todayStr() + ".json";
  a.click(); URL.revokeObjectURL(a.href);
  toast("备份文件已导出 ✅");
}
function importData() {
  const i = document.createElement("input"); i.type = "file"; i.accept = ".json";
  i.onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try { const nd = deepMerge(DEFAULTS, JSON.parse(rd.result)); migrateDB(nd, true); DB = nd; saveAll(); toast("备份已导入，正在同步"); renderAll(); }
      catch (x) { toast("文件读不了，请换一个备份文件试试"); }
    };
    rd.readAsText(f);
  };
  i.click();
}
function resetData() {
  if (confirm("确定要重置全部演示数据吗？此操作不可恢复（云端数据也会被覆盖）。")) {
    DB = clone(DEFAULTS); saveAll(); renderAll(); maybeOnboard();
  }
}
function previewReport() {
  const data = last7();
  const g = data.reduce((a, d) => a + d.guoguo, 0), x = data.reduce((a, d) => a + d.xiaoyu, 0);
  const dimsG = dimCounts("guoguo"), dimsX = dimCounts("xiaoyu");
  const topG = DIMS[dimsG.indexOf(Math.max.apply(null, dimsG))];
  const topX = DIMS[dimsX.indexOf(Math.max.apply(null, dimsX))];
  const st = badgeStats("guoguo").totalStars, sx = badgeStats("xiaoyu").totalStars;
  const aw = activeWish();
  const kidRows = [];
  if (kidOf("guoguo") && kidOf("guoguo").on) kidRows.push('<div class="kv"><span>' + KE("guoguo") + ' ' + esc(KNS("guoguo")) + '</span><span>获得 ' + g + ' ⭐ · 记录最多的是「' + topG + '」· 连续 ' + (DB.streak.guoguo || 0) + ' 天</span></div>');
  if (kidOf("xiaoyu") && kidOf("xiaoyu").on) kidRows.push('<div class="kv"><span>' + KE("xiaoyu") + ' ' + esc(KNS("xiaoyu")) + '</span><span>获得 ' + x + ' ⭐ · 记录最多的是「' + topX + '」· 连续 ' + (DB.streak.xiaoyu || 0) + ' 天</span></div>');
  const cumParts = [];
  if (kidOf("guoguo") && kidOf("guoguo").on) cumParts.push(esc(KNS("guoguo")) + ' ' + st + ' ⭐');
  if (kidOf("xiaoyu") && kidOf("xiaoyu").on) cumParts.push(esc(KNS("xiaoyu")) + ' ' + sx + ' ⭐');
  $("reportBody").innerHTML =
    '<div class="muted" style="margin-top:0">' + esc(famName()) + ' · 最近 7 天</div>' +
    kidRows.join("") +
    '<div class="kv"><span>家庭心愿</span><span>' + (aw ? esc(aw.emoji + aw.title) + ' · 已攒 ' + aw.saved + ' / ' + aw.target + ' ⭐' : "暂无进行中的心愿") + '</span></div>' +
    '<div class="kv"><span>家庭挑战</span><span>进行中 ' + DB.challenges.filter(c => !c.done).length + ' 个 · 已完成 ' + DB.challenges.filter(c => c.done).length + ' 个</span></div>' +
    '<div class="kv"><span>本周陪伴</span><span>' + careThisWeek().length + ' 次</span></div>' +
    '<div class="kv"><span>累计</span><span>' + (cumParts.join(" · ") || "暂无") + '（含已兑换）</span></div>' +
    '<div class="callout" style="background:#FFF7E6;color:#8A6A2E;border-left:4px solid #EACF9B;margin-top:12px">' +
      '📌 这份周报里没有分数，也没有排名。<br>我们只告诉你：孩子这一周做了什么、在哪个方向上投入最多。<br>' +
      '真正重要的那句评价，请留给孩子自己说。' +
    '</div>' +
    '<div style="margin-top:14px"><button class="btn primary" data-click="closeModal(\'modalReport\');go(\'view-report\')">📄 打开完整的成长档案摘要（可导出长图 / PDF）</button></div>';
  openModal("modalReport");
}

/* ================================================================
   成长知识库（v1.3）：内容包
   —— 内容为经典或主流共识，均注明来源；新增一期只需在数组头部
      插入 { ver, date, theme, note, items:[...] }，页面自动切换
   ================================================================ */
const CONTENT_PACKS = [
  {
    ver: "2026-10", date: "2026-10-01", theme: "陪孩子「跳一跳，够得着」",
    note: "本期围绕「难度与动机」：怎么把任务调到刚刚好，怎么让动力从孩子心里长出来。",
    items: [
      { kind: "理念", icon: "🪜", t: "最近发展区：最好的难度，是「跳一跳够得着」",
        d: "孩子独立能做到的，和在大人帮一把时能做到的，中间那一段就是「最近发展区」——学习真正发生的地方。太简单会无聊，太难会挫败，刚刚好才会专注。",
        do: "观察孩子卡在哪一步，只帮那一步：给一个提示、一个例子、搭一次手，然后退后，让他自己完成。",
        src: "维果茨基（L. S. Vygotsky）1930 年代提出，发展心理学经典概念" },
      { kind: "理念", icon: "🌱", t: "自我决定论：孩子最需要的是「我自己想」",
        d: "人天生有三种心理需要：自主（我自己选）、胜任（我能行）、联结（有人在乎我）。满足它们，内在动力会自己长出来；全靠奖励和催促押着走，动力反而会缩水。",
        do: "把「快去读书」换成「现在读，还是吃完饭读？你来选」——给选择，而不是下命令。",
        src: "Deci & Ryan，1985 年提出「自我决定理论」，动机研究经典框架" },
      { kind: "科学", icon: "😴", t: "睡饱了，才记得住：睡眠与记忆巩固",
        d: "白天学的东西，会在睡眠中被大脑「重播」和整理——睡不够，记住的会打折扣，情绪也更容易失控。睡眠不是学习的对手，它是学习的一部分。",
        do: "参考睡眠时长：3—5 岁 10—13 小时；6—12 岁 9—12 小时；13—18 岁 8—10 小时。固定作息比「睡够总时长」更容易做到。",
        src: "美国睡眠医学会（AASM）2016 年儿童睡眠共识；睡眠与记忆巩固为神经科学主流共识" },
      { kind: "科学", icon: "📱", t: "屏幕时间：年龄越小，越要克制",
        d: "世界卫生组织的指南：1 岁及以下不建议屏前久坐；2 岁不超过 1 小时；3—4 岁不超过 1 小时，越少越好。对学步期孩子，最好的「屏幕」是人与人之间的互动。",
        do: "不用屏幕当「电子安抚奶嘴」；把省下来的时间换成共读、讲故事、地板游戏——这也正是本平台「婴幼儿段宝宝不碰屏幕」的由来。",
        src: "世界卫生组织（WHO）2019 年《5 岁以下儿童身体活动、久坐行为和睡眠指南》" },
      { kind: "实操", icon: "💬", t: "把「你真棒」换成「我看到了」",
        d: "「你真聪明」说得越多，孩子越容易回避难题——因为怕失去「聪明」的标签。具体描述过程：「你刚才试了三种办法」「你记得给奶奶留了门」——把注意力放在方法上，而不是天赋上。",
        do: "今天至少一次，忍住「真棒」，改说一句你亲眼看到的具体事实。",
        src: "Mueller & Dweck（1998）实验；后续元分析显示效应温和、因情境而异，但「描述性反馈」本身被广泛认可" },
      { kind: "实操", icon: "📖", t: "共读时，多问一句「你觉得呢？」",
        d: "「对话式阅读」：不只是大人念、孩子听，而是围绕图画提问、顺着孩子的话展开、再请他复述。研究显示，这对幼儿的语言发展有明显帮助。",
        do: "读前猜一猜：「封面里藏着什么？」读中问一问：「它为什么躲在树后面？」读后听一听：请孩子把故事讲给你听。",
        src: "Whitehurst 等（1988—1994）对话式阅读系列研究" }
    ]
  }
];
function libCardsHTML(pack) {
  const kindColor = { "理念": "#7C6BD8", "科学": "#2C7FB8", "实操": "#3D8B52" };
  return pack.items.map(it =>
    '<div class="lib-card">' +
    '<h4><span class="lib-tag" style="background:' + (kindColor[it.kind] || "#888") + '22;color:' + (kindColor[it.kind] || "#666") + '">' + esc(it.kind) + '</span>' + it.icon + ' ' + esc(it.t) + '</h4>' +
    '<p>' + esc(it.d) + '</p>' +
    (it.do ? '<div class="lib-do">🏡 在家怎么做：' + esc(it.do) + '</div>' : "") +
    '<div class="lib-src">来源：' + esc(it.src) + '</div>' +
    '</div>').join("");
}
function renderLibrary() {
  const now = $("libNow"); if (!now) return;
  const packs = CONTENT_PACKS.slice().sort((a, b) => String(b.ver).localeCompare(String(a.ver)));
  const cur = packs[0];
  if (!cur) { now.innerHTML = '<div class="muted">内容准备中，敬请期待 📚</div>'; $("libPast").innerHTML = ""; return; }
  const verTxt = String(cur.ver).replace(/^(\d{4})-(\d{2})$/, "$1 年 $2 月");
  now.innerHTML =
    '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">' +
      '<span class="lib-ver">📅 精选内容 · ' + verTxt + '</span>' +
      '<span class="muted">本期主题：' + esc(cur.theme) + '</span>' +
    '</div>' +
    (cur.note ? '<div class="muted" style="margin-bottom:12px;line-height:1.8">' + esc(cur.note) + '</div>' : "") +
    libCardsHTML(cur);
  const past = packs.slice(1);
  $("libPast").innerHTML = past.length
    ? '<h3 class="h-sec" style="margin-top:26px">📦 往期内容包</h3>' + past.map(p =>
        '<details class="lib-card" style="padding:0"><summary style="cursor:pointer;padding:14px 18px;font-weight:700;font-size:14.6px;list-style:none">' +
        '🗂️ ' + String(p.ver).replace(/^(\d{4})-(\d{2})$/, "$1 年 $2 月") + ' · ' + esc(p.theme) + '　<span class="muted" style="font-weight:400">点开回看 ›</span></summary>' +
        '<div style="padding:2px 18px 14px">' + libCardsHTML(p) + '</div></details>').join("")
    : '<div class="muted" style="margin-top:20px">这是目前提供的内容包（教育理念 + 科学知识 + 实操方法）。</div>';
}

/* ================================================================
   家长锦囊（v1.5）：把读过的书，变成今天能用的一句话
   —— 31 条锦囊 × 7 分类 + 5 个专题包 + 8 条每周一问
   —— 版权原则：不摘录原文，用自己的话重写做法，只标「书名 + 作者」作理念出处
   ================================================================ */
const TIPS_CATS = [
  { k: "feel", name: "接住情绪", icon: "💛" },
  { k: "talk", name: "让孩子合作", icon: "💬" },
  { k: "disc", name: "代替惩罚", icon: "🧭" },
  { k: "praise", name: "怎么夸", icon: "🌟" },
  { k: "auto", name: "自主与内驱力", icon: "🌱" },
  { k: "baby", name: "0—3 岁照护", icon: "🍼" },
  { k: "self", name: "家长修己", icon: "🪞" }
];

const PARENT_TIPS = [
  /* —— 接住情绪 —— */
  { id:"f1", cat:"feel", icon:"💛", t:"孩子哭的时候，先别急着说「别哭了」",
    bad:"「这有什么好哭的」「男子汉不许哭」「再哭妈妈走了」",
    good:"先说出他的感受：「你特别想要那个玩具，没得到，很难过对不对？」把情绪说出来，再抱抱他。",
    why:"感受被否定，孩子反而要花力气证明「我就是难过」，往往哭得更久；感受被说中，情绪才有出口。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
  { id:"f2", cat:"feel", icon:"💛", t:"孩子说「我恨你」的时候",
    bad:"「你怎么能这么说！」「白养你了」",
    good:"接住这句话背后的情绪：「你现在气坏了，气得不想理我。」等他缓过来，再谈事情本身。",
    why:"孩子说狠话时，是在表达「我太生气了」，不是真的恨你。被反击只会让情绪升级。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
  { id:"f3", cat:"feel", icon:"💛", t:"孩子说「我做不到」「我不行」",
    bad:"「这很简单啊」「你怎么这么笨」",
    good:"先承认难度：「这道题是挺难的。」再指出已经做到的部分：「前三步你都做对了。」",
    why:"「做不到」常常是对失败的预期。先卸掉压力，再找一个他能做成的小台阶。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"f4", cat:"feel", icon:"💛", t:"两个孩子抢东西，一个哭一个告状",
    bad:"当法官：「你是哥哥，要让着弟弟。」",
    good:"先分别听，不评判谁对：「你先说，发生了什么。」然后问：「你们觉得怎么办才公平？」",
    why:"家长一当法官，孩子就学会用告状争取支持；让孩子自己提出方案，才学得会解决冲突。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },

  /* —— 让孩子合作 —— */
  { id:"t1", cat:"talk", icon:"💬", t:"越催越慢：把「快点」换成一个词",
    bad:"「快点！要迟到了！你怎么这么磨蹭！」",
    good:"描述你看到的，再给一个词提醒：「书包还在沙发上。出门，两分钟。」",
    why:"唠叨和指责引来的是对抗或装聋；陈述事实不含指责，孩子才动得起来。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
  { id:"t2", cat:"talk", icon:"💬", t:"请孩子帮忙，比命令管用",
    bad:"「把玩具收了！」「说了多少遍了！」",
    good:"「我需要有人帮我把积木装进箱子，谁来？」",
    why:"命令触发抵抗，邀请触发贡献感。孩子都愿意做「被需要的人」。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
  { id:"t3", cat:"talk", icon:"💬", t:"提醒不用唠叨的方式",
    bad:"反复提醒十遍，最后忍不住发火",
    good:"写下来的约定贴在他看得见的地方；或者只提示一个字：「作业？」",
    why:"唠叨是把责任扛在自己肩上；简短提醒，才把责任还给孩子。",
    src:"《正面管教》简·尼尔森" },
  { id:"t4", cat:"talk", icon:"💬", t:"说「我」的感受，不说「你」的毛病",
    bad:"「你怎么总是这么邋遢！」",
    good:"「看到满地的衣服，我很烦躁，我想有个能走动的地板。」",
    why:"「你」是审判，「我」是表达。表达感受而非攻击人格，才留得住合作的可能。",
    src:"《正面管教》简·尼尔森" },
  { id:"t5", cat:"talk", icon:"💬", t:"跟男孩说话，规则要具体，还要做给他看",
    bad:"「你要乖一点」「懂事点行不行」",
    good:"换成看得见的动作：「手要轻轻摸」「在垫子上跳」，然后自己做一遍给他看。",
    why:"抽象的道理男孩往往听不明白，清楚、具体、能照做的指令，加上一个可以模仿的榜样，才真的进得去。",
    src:"《养育男孩》史蒂夫·比达尔夫" },

  /* —— 代替惩罚 —— */
  { id:"d1", cat:"disc", icon:"🧭", t:"惩罚短期有用，长期有代价",
    bad:"「再这样就没收你手机一个月！」",
    good:"动手前先问四个问题：① 和善与坚定并行了吗？② 让他感到被爱和被需要了吗？③ 长期有效吗？④ 教给了他什么能力？",
    why:"惩罚通常能立刻止住行为，但孩子学到的是「下次别被发现」，或者「我是个坏孩子」。",
    src:"《正面管教》简·尼尔森" },
  { id:"d2", cat:"disc", icon:"🧭", t:"让孩子承担自然后果，别替他兜底",
    bad:"书包忘带了，家长请假跑去学校送",
    good:"事先说好让他自己承担一次忘带的结果；事后不嘲讽，只问：「下次怎么才记得住？」",
    why:"自然后果本身就是老师，家长的一句嘲讽会毁掉这一课。",
    src:"《正面管教》简·尼尔森" },
  { id:"d3", cat:"disc", icon:"🧭", t:"把问题摆到桌面上，一起想办法",
    bad:"单方面宣布规则，孩子阳奉阴违",
    good:"「每天晚上的屏幕时间总在吵。我们坐下来，每个人都说说想法，一起定个办法。」",
    why:"孩子更愿意遵守自己参与制订的规则。",
    src:"《正面管教》简·尼尔森" },
  { id:"d4", cat:"disc", icon:"🧭", t:"有限选择：给两个你都能接受的选项",
    bad:"「你到底穿不穿？！」",
    good:"「你想先穿袜子，还是先穿裤子？」",
    why:"选择权给了孩子控制感，两个选项又都在你能接受的范围内，争执自然就消解了。",
    src:"《正面管教》简·尼尔森" },
  { id:"d5", cat:"disc", icon:"🧭", t:"不在人前教子",
    bad:"当着同学、亲戚的面数落孩子",
    good:"把他拉到一边，小声说；真要谈，回家坐下来再谈。",
    why:"当众被批评，孩子记住的是「丢脸」，不是「我错在哪」。给他留面子，他才听得进道理。",
    src:"《好妈妈胜过好老师》尹建莉" },

  /* —— 怎么夸 —— */
  { id:"p1", cat:"praise", icon:"🌟", t:"别只说「你真棒」",
    bad:"「真棒！」「真聪明！」—— 说多了就没有分量了",
    good:"描述你看到的：「你把积木一块块摆得很稳，倒了又重搭了三次。」",
    why:"评价式的夸奖让孩子依赖外部评价；描述式的肯定，让孩子看得见自己做了什么。",
    src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
  { id:"p2", cat:"praise", icon:"🌟", t:"夸努力和方法，不夸天赋",
    bad:"「你真聪明」「你天生就擅长这个」",
    good:"「你换了个方法，就把这道题解出来了。」",
    why:"总被夸聪明的孩子会回避可能失败的挑战；被看见努力的孩子，更愿意去啃难题。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"p3", cat:"praise", icon:"🌟", t:"把「做不到」换成「还没做到」",
    bad:"「你就是数学不行。」—— 这句话是给孩子贴标签",
    good:"「这个知识点你还没掌握，我们找找卡在哪一步。」",
    why:"「还没」两个字，把能力从固定的变成能生长的。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },

  /* —— 自主与内驱力 —— */
  { id:"a1", cat:"auto", icon:"🌱", t:"从「管控型」父母到「顾问型」父母",
    bad:"盯着每一道题，替孩子安排每一小时",
    good:"把决定权逐步交回去：你负责提供信息和支持，他负责做决定、也承担结果。",
    why:"控制感是动机的地基。被安排长大的孩子，一离开安排就动不起来。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"a2", cat:"auto", icon:"🌱", t:"家庭作业是孩子的事",
    bad:"每天陪写、催写、改到全对",
    good:"固定时间和地点，你只在他求助时出现。提醒一句，然后退出去。",
    why:"你越用力，作业就越变成「你和他的战争」，而不是「他的事」。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"a3", cat:"auto", icon:"🌱", t:"动机靠三样东西：自主、胜任、归属",
    bad:"靠奖励和惩罚驱动",
    good:"让他自己选做什么；给他够得着的难度；让他感到被这个家需要和接纳。",
    why:"自我决定论指出：外部奖惩会削弱内在动机，而这三样需求被满足时，动机才会自己长出来。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"a4", cat:"auto", icon:"🌱", t:"留白和睡眠，比多学一小时重要",
    bad:"把日程排满，周末也塞满补习",
    good:"每天留一段没有安排的时间；小学生保证 9—11 小时睡眠。",
    why:"大脑在「停机」时才整理和巩固白天学的东西。睡眠不足的孩子，学得越多忘得越快。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
  { id:"a5", cat:"auto", icon:"🌱", t:"「这事听你的」",
    bad:"什么都要管，什么都要问一遍",
    good:"在他能力范围内的事上明确表态：「这件事你来定，需要我的时候说一声。」",
    why:"被信任的孩子才长得出判断力；事事被干预的孩子，只会等指令。",
    src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },

  /* —— 0—3 岁照护 —— */
  { id:"b1", cat:"baby", icon:"🍼", t:"「可怕的两岁」不是叛逆，是换季",
    bad:"把两岁的坚持当成挑战权威，用更强硬的方式压下去",
    good:"能给的自主尽量给（穿哪件、先做哪样），原则问题温柔而坚定；不打不骂，但也不因为哭闹让步。",
    why:"这个阶段孩子的任务，是从「妈妈的延伸」长成「独立的我」，对抗本身就是成长。",
    src:"《可怕的两岁》约翰·罗斯蒙德" },
  { id:"b2", cat:"baby", icon:"🍼", t:"宝宝哭个不停，先按顺序排查",
    bad:"一哭就慌；或者由他哭，说是「练肺」",
    good:"依次查：饿了 / 困了 / 尿布 / 太热太冷 / 环境太吵太亮 / 想要抱抱。都满足后还哭，抱着他安静地待一会儿。",
    why:"一岁前的哭是唯一的表达方式。及时回应不会惯坏孩子，反而建立起他一生的安全感。",
    src:"《美国儿科学会育儿百科（第七版）》美国儿科学会" },
  { id:"b3", cat:"baby", icon:"🍼", t:"两岁前不看屏幕，不只是为了保护眼睛",
    bad:"用手机里的视频哄住哭闹的孩子",
    good:"用真实的互动替代：抱着看窗外、玩水、翻布书、听他咿呀、跟他说你正在做什么。",
    why:"这个阶段大脑需要真实的双向互动来搭建语言和依恋；屏幕是单向的、被动的输入。",
    src:"《美国儿科学会育儿百科（第七版）》美国儿科学会" },
  { id:"b4", cat:"baby", icon:"🍼", t:"规律的节奏，比「灵活一点」更让宝宝安心",
    bad:"每天作息都不一样：困了就睡、饿了就吃",
    good:"建立「吃—玩—睡」的固定循环，让宝宝知道接下来会发生什么。",
    why:"可预期的节奏带来安全感；混乱的作息让宝宝更难入睡、更容易烦躁。",
    src:"《实用程序育儿法》特蕾西·霍格" },

  /* —— 家长修己 —— */
  { id:"s1", cat:"self", icon:"🪞", t:"你吼叫时，孩子的身体在「备战」",
    bad:"「我吼你是为了你好」",
    good:"先离开现场 30 秒，深呼吸，等自己平静下来再开口。",
    why:"孩子听到吼叫时会进入应激状态——这时候他学不到任何道理，只记住了恐惧。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳" },
  { id:"s2", cat:"self", icon:"🪞", t:"找到藏在愤怒下面的感受",
    bad:"把火全撒在孩子身上",
    good:"先问自己：我是生气，还是累了、委屈了、焦虑了？这把火，真的是孩子点起来的吗？",
    why:"愤怒常常是第二情绪，底下压着的是疲惫和无力。看清它，才不会迁怒。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳" },
  { id:"s3", cat:"self", icon:"🪞", t:"做「足够好」的父母，不做完美父母",
    bad:"每次吼完就陷进深深的自责",
    good:"修复比完美重要。平静下来后跟孩子说：「刚才我太急了，对不起。我爱你。」",
    why:"孩子需要的不是从不犯错的父母，而是会修复关系的父母——修复本身就在教他怎么修复。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳" },
  { id:"s4", cat:"self", icon:"🪞", t:"孩子不是你人生的续集",
    bad:"「我这辈子没做到的事，你要替我做到」",
    good:"分清哪些是他的成长、哪些是你的期待。把期待说出来，把选择权还给他。",
    why:"把孩子当成自己的延伸，爱就会变成压力。孩子需要成为他自己。",
    src:"《家庭的觉醒》沙法丽·萨巴瑞" },
  { id:"s5", cat:"self", icon:"🪞", t:"给孩子的自由，要有边界",
    bad:"要么全放开，要么全管住",
    good:"规则少而清晰，界限之内给足自由：「这三条不能碰，其余你自己定。」",
    why:"自由不是想做什么就做什么，而是「在安全范围内自己决定」。有边界的自由才叫自由，没边界的叫放任。",
    src:"《爱和自由》孙瑞雪" }
];

/* 专题包：按阶段 3 组 + 按处境 2 组 */
const THEMES = [
  { id:"kg", icon:"🎒", t:"刚上幼儿园", ages:"3—4 岁",
    lead:"头一个月最难的，往往不是他离不开你，是你们都要重新熟悉一套节奏。",
    items: [
      { t:"开学前，先带他去玩几次",
        do:"挑人少的时段，带他到幼儿园门口和院子里玩滑梯，让他先熟悉这个地方。可以跟他说「过几天你会来这里玩」。",
        why:"陌生是最让人害怕的那部分。先让环境和人变熟，分离的那一刻就不是从零开始。",
        src:"《美国儿科学会育儿百科（第七版）》美国儿科学会" },
      { t:"让他带一件「家里的东西」",
        do:"允许他带安抚巾、小玩偶或一件你的旧衣服去幼儿园。不用偷偷塞，光明正大地给他。",
        why:"这类「过渡性客体」能让孩子在分离时感到安心，帮他完成从一个环境到另一个环境的过渡——带着它的孩子，和父母分别时通常更容易。",
        src:"《可怕的两岁》约翰·罗斯蒙德" },
      { t:"告别要短，也要确定",
        do:"固定一个告别仪式（比如拥抱三下、亲一下手心），说完就走。不要因为他哭就一次次回头，也不要趁他不注意偷偷溜走。",
        why:"拖长的告别会把焦虑一并拉长；偷偷走掉则会让他今后更不敢让你离开视线。可预期的告别，才是安全感的来源。",
        src:"《美国儿科学会育儿百科（第七版）》美国儿科学会" },
      { t:"接他的时候，第一句别问「哭了吗」",
        do:"先抱他，再问「今天玩了什么好玩的」。如果他说想妈妈，就接住这句：「嗯，想妈妈了。」不急着讲道理。",
        why:"问「哭了吗」等于在提醒他今天是难过的；先接住情绪，他才敢把真实的感受讲给你听。",
        src:"《如何说孩子才会听 怎么听孩子才肯说》法伯 / 玛兹丽施" },
      { t:"给他时间，别拿他跟别人比",
        do:"适应期有的孩子三天，有的要一个月。不在老师面前说「他就是胆小」，也不拿他和已经适应的孩子比。",
        why:"适应的快慢由孩子的天生气质决定，不是态度问题。被催促、被贴标签，只会让他更退回去。",
        src:"《爱和自由》孙瑞雪" }
    ] },
  { id:"primary", icon:"✏️", t:"幼小衔接 · 刚上小学", ages:"6—7 岁",
    lead:"从「陪着他做」到「让他自己做」，交接得越早，后面越省力。",
    items: [
      { t:"头一两周陪着熟悉，然后逐步退出",
        do:"开学头一两周帮他弄清写作业的规则和流程；之后就退到一边——不陪写、不全程检查，最多提醒一句「该写作业了」。",
        why:"一开始的陪伴是为了让他学会怎么做，而不是替他做。越早把责任交回去，越不容易演变成长期的拉锯。",
        src:"《好妈妈胜过好老师》尹建莉" },
      { t:"让他当「小老师」，讲给你听",
        do:"他学了拼音、生字，回家请他教你：「妈妈小时候没学好拼音，你教我一下。」你当学生，认真提问。",
        why:"讲一遍比听三遍记得牢；当老师还给了他掌控感和成就感——这两样正是学习动机的来源。",
        src:"《好妈妈胜过好老师》尹建莉" },
      { t:"想让他读什么，就「诱惑」他",
        do:"别下命令。你自己先读得入迷，或者读给他听，讲到最精彩的地方停下来，说「我先去洗碗」。",
        why:"想让孩子接受什么，就去诱惑他；想让他排斥什么，就去强迫他。方法用反了，事与愿违。",
        src:"《好妈妈胜过好老师》尹建莉" },
      { t:"别用分数开头",
        do:"接他放学，第一句问「今天有什么有意思的事」，而不是「考了多少分」。分数可以等他主动说。",
        why:"你每天先问什么，他就知道你在乎什么。只盯着分数，他会慢慢用分数来定义自己。",
        src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
      { t:"给他一个「自己说了算」的地盘",
        do:"书桌怎么摆、先写哪一科、用什么笔袋——这些让他自己定。你只管时间和地点。",
        why:"控制感是动机的地基。连书桌都做不了主的孩子，很难对学习产生「这是我自己的事」的感觉。",
        src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" }
    ] },
  { id:"teen", icon:"🚪", t:"跟十几岁的孩子说话", ages:"12—18 岁",
    lead:"你在他的生活里，要从「管理者」变成「顾问」。这一步不好走，但必须走。",
    items: [
      { t:"他问，你才答",
        do:"把「你应该……」换成「你打算怎么办」。他问你意见时再给建议；不问的时候，忍住。",
        why:"顾问只在他需要时出力，管理者却时时在场。青春期要练的是他自己的判断力——你的意见来得太及时，他就没机会练。",
        src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
      { t:"把「我规定」换成「我商量」",
        do:"关于手机、成绩、出门时间，先说一句「有件事我想跟你商量」。讲出你的顾虑，也听他为什么在意。",
        why:"孩子更愿意遵守自己参与制订的规则。单方面宣布的规矩，只会被阳奉阴违。",
        src:"《正面管教》简·尼尔森" },
      { t:"留一点「不说话的相处」",
        do:"一起做饭、修车、散步、看球，不必非要聊天。坐在旁边，也是相处。",
        why:"青春期很多话，是在没有眼神交流的时候才说出口的。你追着问，他就关门；你只是待着，他反而会开口。",
        src:"《家庭的觉醒》沙法丽·萨巴瑞" },
      { t:"他关上门，不等于拒绝你",
        do:"需要空间是正常的发育需要，不是「不亲了」。门关着时，在门外留一句「我在楼下，需要就来」。",
        why:"把「关门」当成拒绝，下一步就是推门进去、争吵、关系更远。留一个随时可用的入口就够了。",
        src:"《自驱型成长》斯蒂克斯鲁德 / 约翰逊" },
      { t:"你现在攒下的愤怒，会在他的青春期还债",
        do:"如果从小学阶段就有吼叫的习惯，现在开始改，来得及。先记录，再改变。",
        why:"研究显示，家庭中累积的愤怒对孩子青春期的几乎每个重要阶段都有影响——它会投下长长的阴影，而且会损伤亲子关系。",
        src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳" }
    ] },
  { id:"boy", icon:"👦", t:"养育男孩：三个转折点", ages:"0—18 岁 · 男孩",
    lead:"男孩的成长不是一路平顺地长高，中间有几个明显的转弯。知道弯在哪，你就不会在转弯处慌了手脚——反倒能提前站好位。",
    items: [
      { t:"0—6 岁：先把他抱够",
        do:"这几年别急着讲道理、立规矩，先把关系铺厚。多抱、多跟他说话、多回应他。这件事得刻意做，因为我们对男孩的拥抱和交谈，平均而言明显少于女孩。",
        why:"这个阶段的男孩最需要的，是和至少一位主要看护人形成亲密关系。他在爱里感到安全，大脑才发育得充分，日后也更愿意与人合作。",
        src:"《养育男孩》史蒂夫·比达尔夫" },
      { t:"要分开时，把「谁几点来接他」说具体",
        do:"不得不分开的时候（上班、送托、出差），告别要说细节：「妈妈下午五点来接你，王老师陪你搭积木。」并且说到做到；回来先抱一会儿，再问今天怎么样。",
        why:"和女孩相比，分离更容易让男孩焦虑，他有时会把它理解成「我被丢下了」，然后干脆把感情收起来。可预期的分开加上说到做到的重逢，才是他学会「关系不会断」的方式。",
        src:"《养育男孩》史蒂夫·比达尔夫" },
      { t:"6 岁那年他会突然要爸爸——这时爸爸的时间得顶上",
        do:"六岁前后，他会突然更想跟爸爸或其他男性待在一起、模仿他们。哪怕每天只有半小时，也要是「只属于我们俩」的那种，不是各看各的屏幕。",
        why:"这个阶段的男孩正在学「怎样做一个男人」。如果爸爸总是缺席，他不会安静地等——他会用生病、闹事、惹麻烦的方式，把爸爸叫回来。",
        src:"《养育男孩》史蒂夫·比达尔夫" },
      { t:"妈妈别急着退场",
        do:"不要因为他「长大了、要像男子汉」就减少拥抱。十五岁也可以抱。他想跟爸爸亲近，不等于要把妈妈推远——这两件事可以同时成立。",
        why:"不少家庭会在这个阶段有意跟儿子保持距离，好让他「坚强」。但男孩恰恰需要知道，他可以依靠母亲，不必藏起自己柔软的部分。过早失去这层关系，他长大后也常常难以向伴侣和孩子表达温情。",
        src:"《养育男孩》史蒂夫·比达尔夫" },
      { t:"14 岁以后：帮他找一位「引导者」",
        do:"在父母之外，帮他找到一位他信服的成年人——教练、老师、舅舅、朋友家的长辈都行，关键是人靠得住、愿意长期花时间。父母负责挑人，不负责代替。",
        why:"这个年纪的父母不再是他生活的主导。如果没有值得追随的成年人，他就会去同龄人里找——而同伴群体往往同样是迷路的人。有研究显示，家人之外只要有一位成年朋友，就足以明显降低孩子走偏的概率。",
        src:"《养育男孩》史蒂夫·比达尔夫" }
    ] },
  { id:"repair", icon:"🤝", t:"吵完之后：把冲突变成关系的一部分", ages:"不限年龄",
    lead:"没有哪个家庭不吵架。区别只在吵完之后——是各自回房关上门，还是能坐下来把话说完。冲突本身不是问题，它甚至是关系还在生长的证据。",
    items: [
      { t:"先分清：你要的是「赢」，还是「他还是我孩子」",
        do:"吵到一半时问自己一句：我现在是想赢，还是想解决问题？想赢的时候，把「你怎么这么不懂事」换成「我现在很生气，我们各自待一会儿再谈」。",
        why:"只要关注的是如何去赢，最后输掉的一定是关系。孩子顶撞你时看着像攻击，其实常常是防卫——他在保护自己。",
        src:"《家庭的觉醒》沙法丽·萨巴瑞" },
      { t:"他要的往往不是那个东西，是「我的声音也算数」",
        do:"先说出他的愿望，别急着评价：「你真的很想再玩十分钟。」肯定愿望之后，再谈能不能实现、怎么实现。",
        why:"孩子要的常常不是特权，而是被当作独立的人对待。我们否定了他的主权，才制造出大部分亲子战争。",
        src:"《家庭的觉醒》沙法丽·萨巴瑞" },
      { t:"别急着满足，也别急着否决：把愿望放一放",
        do:"他提要求时，可以不马上答应也不马上拒绝：「这个我们记下来。过两周你如果还想要，我们就一起想办法。」",
        why:"急着满足最大的代价，是剥夺了他把愿望放在心里、慢慢掂量的过程。学会等一等，他才分得清「一时想要」和「真的想」。",
        src:"《家庭的觉醒》沙法丽·萨巴瑞" },
      { t:"A 计划 / B 计划 / C 计划：双赢不是各让一步",
        do:"「你想要 A，我想要 B，那我们想一个让两个人都开心的 C。」比如再看十分钟，或者看完这一集但今晚不再开电视。一起说，最好写下来一起挑。",
        why:"妥协是各自丢掉一部分，合作是找到两个人都能接受的方案。前者让人觉得被削，后者让人觉得被听见——孩子从中学会的是谈判，而不是屈服。",
        src:"《家庭的觉醒》沙法丽·萨巴瑞" },
      { t:"吵完要修：说一句「刚才那一下，是我不对」",
        do:"都冷静下来后，回去把话说完：刚才我为什么那么急、哪一句说得过分、下次我希望怎样。不用长篇大论，两三句就够。",
        why:"修复不是软弱的标志。它教给孩子的是——关系可以出问题，也可以被修好。这比「我们家从来不吵架」有用得多。",
        src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳 /《家庭的觉醒》沙法丽·萨巴瑞" }
    ] }
];

const SELF_CHECKS = [
  { id:"q1", icon:"🔥",
    t:"这周有没有一次，你还没弄清楚发生了什么，就先发火了？",
    hint:"回想那一次：当时你在忙什么？是孩子先惹你，还是别的事先让你烦了？",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（追踪表 · 触发事件）" },
  { id:"q2", icon:"⏰",
    t:"你家的「魔鬼时间」是几点？",
    hint:"早上出门前？晚饭前后？睡前？找出那个每天都在吵的时段，比找孩子的错更有用。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（追踪表 · 时间）" },
  { id:"q3", icon:"🪫",
    t:"这周有没有哪个时刻，其实是你累了，而不是孩子的错？",
    hint:"愤怒常常是第二情绪。底下压着的，可能是疲惫、委屈，或者「我已经尽力了却还是做不好」的挫败。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（藏在愤怒之下的感受）" },
  { id:"q4", icon:"💛",
    t:"如果重来一次，你希望当时的自己怎么做？",
    hint:"不用自责，只是想一想。下一次碰上同样的事，你手里就多了一个选项。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（记录你的评估）" },
  { id:"q5", icon:"🌿",
    t:"这周有哪一件事，你做得比自己以为的好？",
    hint:"育儿不易，先看见自己做到的部分。你怎么对自己，孩子也在学。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（自我同情）" },
  { id:"q6", icon:"😊",
    t:"你上一次和孩子一起笑，是什么时候？",
    hint:"如果想了很久想不起来，这周安排一件吧——不需要理由的那种。",
    src:"《家庭的觉醒》沙法丽·萨巴瑞" },
  { id:"q7", icon:"🧘",
    t:"这周有没有一次，你把自己的需要也放进了日程里？",
    hint:"睡够、吃好、留一小段属于自己的时间——这不是自私，这是让吼叫变少的必要条件。",
    src:"《不吼不叫：如何平静地让孩子与父母合作》罗娜·雷纳（照顾好自己）" },
  { id:"q8", icon:"🔍",
    t:"这周孩子的哪个行为，其实在发展规律上是正常的？",
    hint:"两岁的坚持、七岁的磨蹭、十四岁的关门——先分清「正常发育」和「需要纠正」，能省下大量冲突。",
    src:"《可怕的两岁》约翰·罗斯蒙德 /《自驱型成长》斯蒂克斯鲁德" }
];

/* ---------- 每周一问：源自《不吼不叫》的「吼叫追踪表」五步 ---------- */
let tipCat = "", themeOpen = "", tipCkOpen = false, ckDraft = null;
function weekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return d.getFullYear() + "-W" + String(wk).padStart(2, "0");
}
function checkinQuestion() { return SELF_CHECKS[Math.floor(Date.now() / 604800000) % SELF_CHECKS.length]; }
function checkinOf() {
  const wk = weekKey();
  return (DB.checkins || []).find(c => c.wk === wk) || null;
}
function checkinSave(text) {
  const wk = weekKey(), q = checkinQuestion();
  const s = String(text || "").trim().slice(0, 120);
  if (!s) return { ok: false };
  if (!Array.isArray(DB.checkins)) DB.checkins = [];
  const cur = DB.checkins.find(c => c.wk === wk);
  if (cur) { cur.a = s; cur.day = todayStr(); }
  else DB.checkins.push({ wk: wk, qid: q.id, q: q.t, a: s, day: todayStr() });
  if (DB.checkins.length > 60) DB.checkins.splice(0, DB.checkins.length - 60);
  saveAll();
  return { ok: true };
}
/* 按自家孩子当前学段推荐一组专题：青春期优先，其次学龄前 / 小学 */
function themeSuggest() {
  const on = kidsOn();
  if (on.indexOf("junior") >= 0 || on.indexOf("senior") >= 0) return "teen";
  if (on.indexOf("guoguo") >= 0) return "kg";
  if (on.indexOf("xiaoyu") >= 0) return "primary";
  if (on.indexOf("baby") >= 0) return "kg";
  return "kg";
}
function tipCatSet(k) { tipCat = k || ""; renderTips(); }
function themePickSet(id) {
  themeOpen = (themeOpen === id) ? "" : id;
  renderTips();
}
function ckToggle() { tipCkOpen = !tipCkOpen; renderTips(); }
function ckEdit() {
  const rec = checkinOf();
  ckDraft = rec ? rec.a : "";
  tipCkOpen = true;
  renderTips();
}
function ckSave() {
  const ta = $("ckTa"); if (!ta) return;
  if (!checkinSave(ta.value).ok) { toast("写一句也好 📝"); return; }
  ckDraft = null; tipCkOpen = false; renderTips();
  toast("记下了 🌱 这一条只有你能看到");
}
function checkinHistoryHTML() {
  const hist = (DB.checkins || []).slice().reverse().filter(c => c.wk !== weekKey());
  if (!hist.length) return "";
  return '<details style="margin-top:13px"><summary style="cursor:pointer;font-size:13.2px;' +
    'color:#7C6BC4;font-weight:700;list-style:none">🗂️ 往期记录（' + hist.length +
    ' 条）　点开看看自己的规律 ›</summary><div style="margin-top:10px;display:grid;gap:8px">' +
    hist.slice(0, 12).map(c =>
      '<div style="background:#fff;border:1px solid #EDE7F8;border-radius:12px;padding:9px 13px">' +
        '<div class="muted" style="font-size:11.6px;line-height:1.6">' + esc(c.wk) + ' · ' + esc(c.q || "") + '</div>' +
        '<div style="font-size:13.4px;line-height:1.78;color:#4A4270;margin-top:3px">' + esc(c.a) + '</div>' +
      '</div>').join("") + '</div></details>';
}
function renderTips() {
  if (!$("themePicker")) return;
  const sug = themeSuggest();
  if (!themeOpen) themeOpen = sug;

  /* —— 专题包 —— */
  $("themePicker").innerHTML = THEMES.map(t =>
    '<button class="theme-pick' + (t.id === themeOpen ? " on" : "") + '" data-click="themePickSet(\'' + t.id + '\')">' +
      (t.id === sug ? '<span class="tp-tag">先看这组</span>' : "") +
      '<div class="tp-ic">' + t.icon + '</div>' +
      '<div class="tp-t">' + esc(t.t) + '</div>' +
      '<div class="tp-a">' + esc(t.ages) + '</div>' +
    '</button>').join("");
  const th = THEMES.find(t => t.id === themeOpen) || THEMES[0];
  $("themeBody").innerHTML =
    '<div class="theme-lead">' + esc(th.lead) + '</div>' +
    th.items.map((it, i) =>
      '<div class="step">' +
        '<div class="step-n">' + (i + 1) + '</div>' +
        '<div style="flex:1">' +
          '<div class="step-t">' + esc(it.t) + '</div>' +
          '<div class="step-do"><b>怎么做</b>　' + esc(it.do) + '</div>' +
          '<div class="step-why"><b>为什么</b>　' + esc(it.why) + '</div>' +
          '<div class="step-src">出处：' + esc(it.src) + '</div>' +
        '</div>' +
      '</div>').join("");

  /* —— 每周一问 —— */
  const q = checkinQuestion(), rec = checkinOf();
  let body;
  if (!rec) {
    body = '<div class="ck-hint">' + esc(q.hint) + '</div>' +
      '<textarea class="ck-ta" id="ckTa" maxlength="120" placeholder="写给自己的，不用写得好…" ' +
      'data-input="ckDraft=this.value">' + esc(ckDraft == null ? "" : ckDraft) + '</textarea>' +
      '<div class="ck-foot"><button class="btn primary sm" data-click="ckSave()">记下来</button>' +
      '<span class="muted">一周一条 · 不给孩子看 · 也不计星星</span></div>';
  } else if (tipCkOpen) {
    body = '<div class="ck-hint">' + esc(q.hint) + '</div>' +
      '<textarea class="ck-ta" id="ckTa" maxlength="120" data-input="ckDraft=this.value">' +
      esc(ckDraft == null ? rec.a : ckDraft) + '</textarea>' +
      '<div class="ck-foot"><button class="btn primary sm" data-click="ckSave()">保存</button>' +
      '<button class="btn sm ghost" data-click="ckToggle()">取消</button></div>';
  } else {
    body = '<div class="ck-done">' + esc(rec.a) + '</div>' +
      '<div class="ck-foot"><span class="muted">' + esc(rec.day) + ' 记的 · 每周换一个新问题</span>' +
      '<button class="btn sm" data-click="ckEdit()">改一改</button></div>';
  }
  $("checkCard").innerHTML =
    '<div class="ck-head" data-click="ckToggle()">' +
      '<span class="ck-ic">' + q.icon + '</span>' +
      '<span style="flex:1"><span class="ck-label">每周一问 · 只写给自己的</span>' +
      '<div class="ck-t">' + esc(q.t) + '</div></span>' +
      '<span class="ck-arrow">' + (rec && !tipCkOpen ? "展开 ˅" : "收起 ˄") + '</span>' +
    '</div>' + body +
    '<div class="ck-src">出处：' + esc(q.src) + '</div>' +
    checkinHistoryHTML();

  /* —— 全部锦囊 —— */
  const tabs = [{ k: "", name: "全部", icon: "🗂️" }].concat(TIPS_CATS);
  $("tipCats").innerHTML = tabs.map(c =>
    '<button class="' + (tipCat === c.k ? "on" : "") + '" data-click="tipCatSet(\'' + c.k + '\')">' +
      c.icon + ' ' + esc(c.name) + '（' + PARENT_TIPS.filter(t => !c.k || t.cat === c.k).length + '）</button>').join("");
  const list = tipCat ? PARENT_TIPS.filter(t => t.cat === tipCat) : PARENT_TIPS;
  $("tipCount").textContent = tipCat
    ? "共 " + list.length + " 条"
    : "共 " + PARENT_TIPS.length + " 条 · 来自 11 本书";
  $("tipList").innerHTML = list.map(t =>
    '<div class="tip-card">' +
      '<div class="tip-top"><span class="tip-ic">' + t.icon + '</span>' +
      '<span class="tip-t">' + esc(t.t) + '</span></div>' +
      '<div class="tip-bad">❌ 这样说不灵　' + esc(t.bad) + '</div>' +
      '<div class="tip-good">✅ 换成这样　' + esc(t.good) + '</div>' +
      '<div class="tip-why">💡 为什么　' + esc(t.why) + '</div>' +
      '<div class="tip-src">出处：' + esc(t.src) + '</div>' +
    '</div>').join("");
}

/* ================================================================
   家庭共享机制 · 心愿池 / 家庭挑战 / 陪伴记录（对应设计方案 3.2）
   ================================================================ */
/* v4：成员 / 孩子名 / 头像全部由家庭配置动态生成——见 KNS / KE / slotByName / familyMembers / avatarOf */
const CARE_ACTS = ["共读绘本", "讲故事", "一起做手工", "户外活动", "一起做饭", "下棋对弈", "听音乐", "一起运动", "逛博物馆", "聊天散步"];
const CARE_MINS = [10, 15, 20, 30, 40, 60];
const WISH_EMOJI = ["🏝️", "🧁", "🎡", "📚", "🚲", "🐼", "⛺", "🎬", "🍜", "🎠", "🎁", "🌈"];
const CHG_EMOJI = ["📖", "🌳", "🎬", "🍲", "🧹", "🎨", "🚴", "🌙", "🎵", "🧩"];
function avatarOf(name) {
  const fixed = { "妈妈": "👩", "爸爸": "👨", "奶奶": "👵", "爷爷": "👴" };
  if (fixed[name]) return fixed[name];
  const s = slotByName(name); if (s) return KE(s);
  return "👪";
}

function newId(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fillSel(id, arr, cur) {
  const el = $(id); if (!el) return;
  el.innerHTML = arr.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join("");
  if (cur != null && arr.indexOf(cur) >= 0) el.value = cur;
}
function confetti() {
  const box = document.createElement("div");
  box.className = "confetti";
  for (let i = 0; i < 26; i++) {
    const s = document.createElement("i");
    s.textContent = ["⭐", "🎉", "🌟", "💛", "✨"][i % 5];
    s.style.left = (6 + Math.random() * 88) + "%";
    s.style.animationDelay = (Math.random() * 0.5) + "s";
    s.style.fontSize = (14 + Math.random() * 14) + "px";
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}

/* ---------- 家长确认（共享 PIN 仅用于防误触） ---------- */
let pinAskCb = null;
function askParent(why, cb) {
  if (parentUnlocked) { cb(); return; }
  pinAskCb = cb;
  $("pinAskWhy").textContent = why || "这一步会影响全家的设置，请家长确认。";
  $("pinAskInput").value = "";
  openModal("modalPinAsk");
  setTimeout(() => { try { $("pinAskInput").focus(); } catch (e) {} }, 80);
}
function submitPinAsk() {
  const v = ($("pinAskInput").value || "").trim();
  if (!/^\d{4}$/.test(v)) { toast("请输入 4 位数字哦"); return; }
  if (!getPin()) { setPin(v); parentUnlocked = true; }
  else if (v !== getPin()) { toast("密码不对，再想想～"); $("pinAskInput").value = ""; return; }
  else parentUnlocked = true;
  closeModal("modalPinAsk");
  const cb = pinAskCb; pinAskCb = null;
  if (cb) { toast("家长已确认 ✅"); cb(); }
}

/* ---------- 家庭心愿池 ---------- */
function activeWish() { return (DB.wishes || []).find(w => !w.done) || null; }
function wishPct(w) { return w.target > 0 ? Math.max(0, Math.min(100, w.saved / w.target * 100)) : 0; }
/* 挑战 / 陪伴产生的奖励进入「当前进行中的心愿」 */
function addToWish(n) {
  const w = activeWish();
  if (!w || !(n > 0)) return null;
  w.saved = Math.min(w.target, w.saved + n);
  if (w.saved >= w.target) {
    w.done = true; w.doneAt = todayStr();
    pushFeed("🎉", "家庭心愿达成：「" + w.title + "」——全家的努力有了结果");
    confetti();
  }
  return w;
}
/* 孩子把自己的星星投入心愿池（自愿 · 投入后孩子账户相应减少） */
function contributeWish(wid, child, n) {
  const w = (DB.wishes || []).find(x => x.id === wid);
  if (!w || w.done) return;
  const have = DB.stars[child] || 0;
  const real = Math.min(n, have);
  if (real <= 0) { toast(KNS(child) + "的星星还不够，先去完成任务吧 ✨"); return; }
  DB.stars[child] -= real;
  w.saved = Math.min(w.target, w.saved + real);
  if (!w.contrib) w.contrib = {};
  w.contrib[child] = (w.contrib[child] || 0) + real;
  pushFeed("⭐", KNS(child) + "把 " + real + " 颗星投进了「" + w.title + "」，心愿 +" + real + " ⭐");
  pushArchive(child, "把 " + real + " 颗星投进了家庭心愿「" + w.title + "」（家庭贡献 · 文化品格力）");
  if (w.saved >= w.target) {
    w.done = true; w.doneAt = todayStr();
    pushFeed("🎉", "家庭心愿达成：「" + w.title + "」——全家的努力有了结果");
    confetti();
    saveAll(); renderAll(); return;
  }
  saveAll(); renderAll();
  toast(KNS(child) + "投入 " + real + " ⭐ ❤");
}
function openWishForm() {
  askParent("家庭心愿由家长设定，确认后就可以填了。", () => {
    fillSel("wishEmojiIn", WISH_EMOJI, WISH_EMOJI[DB.wishes.length % WISH_EMOJI.length]);
    fillSel("wishByIn", ["妈妈", "爸爸", "奶奶"], "妈妈");
    $("wishTitleIn").value = "";
    $("wishTargetIn").value = "150";
    $("wishNoteIn").value = "";
    openModal("modalWish");
    setTimeout(() => { try { $("wishTitleIn").focus(); } catch (e) {} }, 80);
  });
}
function saveWish() {
  const title = ($("wishTitleIn").value || "").trim();
  const target = parseInt($("wishTargetIn").value, 10);
  if (title.length < 2) { toast("先写一句心愿内容吧 ✍️"); return; }
  if (!(target >= 20 && target <= 2000)) { toast("目标星星数建议在 20—2000 之间"); return; }
  const by = $("wishByIn").value;
  DB.wishes.push({ id: newId("w"), emoji: $("wishEmojiIn").value, title, target, saved: 0, by,
    note: ($("wishNoteIn").value || "").trim(), done: false, doneAt: "", contrib: {} });
  saveAll(); closeModal("modalWish");
  pushFeed("⭐", by + "设了一个新心愿：「" + title + "」，目标 " + target + " ⭐");
  toast("新心愿设好啦 ✨"); renderAll();
}
function deleteWish(id) {
  const w = (DB.wishes || []).find(x => x.id === id); if (!w) return;
  askParent("删除心愿会影响全家，请家长确认。已投入的星星会退回给每个孩子。", () => {
    if (!confirm("确定删掉心愿「" + w.title + "」吗？已投入的星星会按贡献退回。")) return;
    Object.keys(w.contrib || {}).forEach(c => { DB.stars[c] = (DB.stars[c] || 0) + w.contrib[c]; });
    DB.wishes = DB.wishes.filter(x => x.id !== id);
    saveAll(); renderAll(); toast("心愿已删除，星星已退回");
  });
}
function wishCardHTML(w, canContribute) {
  const pct = wishPct(w), left = Math.max(0, w.target - w.saved);
  const contrib = w.contrib || {};
  const parts = Object.keys(contrib).filter(k => contrib[k] > 0).map(k =>
    '<span class="cperson">' + KE(k) + " " + KNS(k) + ' 投入 <b>' + contrib[k] + '</b> ⭐</span>');
  let btns = "";
  if (canContribute && !w.done) {
    btns = kidsOn().map(c => {
      const have = DB.stars[c] || 0;
      const mk = (label, n, ok) => '<button class="btn sm"' + (ok
        ? ' data-click="contributeWish(\'' + w.id + '\',\'' + c + '\',' + n + ')"'
        : ' disabled style="opacity:.45"') + '>' + label + '</button>';
      return '<span class="cperson">' + KE(c) + " " + KNS(c) + ' 有 <b>' + have + '</b> ⭐' +
        mk("投 5 ⭐", 5, have >= 5) + mk("全投", 999999, have >= 1) + '</span>';
    }).join("");
  }
  return '<div class="wcard' + (w.done ? " done" : "") + '">' +
    '<div class="wt"><span class="we">' + w.emoji + '</span>' + esc(w.title) +
      (w.done ? '<span class="chip c3">✓ 已达成</span>' : '<span class="chip cn">目标 ' + w.target + ' ⭐</span>') +
      '<span class="tools"><button class="btn sm" style="color:#A03A33" data-click="deleteWish(\'' + w.id + '\')">删除</button></span>' +
    '</div>' +
    (w.note ? '<div class="muted" style="font-size:13px">「' + esc(w.note) + '」——' + esc(w.by) + '</div>'
            : '<div class="muted" style="font-size:13px">' + esc(w.by) + ' 设</div>') +
    '<div class="wbar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="wmeta"><span><b style="color:#B45309">' + w.saved + ' / ' + w.target + '</b> ⭐' +
      (w.done ? '　已达成 · ' + esc(w.doneAt || "") : '　还差 ' + left + ' ⭐') + '</span>' +
      '<span>' + (parts.length ? "已有 " + parts.length + " 位家人投入" : "还没有人投入") + '</span></div>' +
    (parts.length ? '<div class="contrib">' + parts.join("") + '</div>' : "") +
    (btns ? '<div class="contrib">' + btns + '</div>' +
      '<div class="muted" style="font-size:12.3px">投入会把孩子的星星放进心愿池（孩子的星星相应减少）——由孩子自己决定，投多少都算数。</div>' : "") +
  '</div>';
}

/* ---------- 家庭挑战 ---------- */
function challengeCardHTML(c, compact) {
  const total = c.members.length, dn = c.members.filter(m => m.done).length;
  const pct = total ? Math.round(dn / total * 100) : 0;
  return '<div class="chg' + (c.done ? " done" : "") + (compact ? " compact" : "") + '">' +
    '<div class="ct"><span>' + c.emoji + '</span>' + esc(c.title) +
      '<span class="chip cn">' + esc(c.by) + ' 发起</span>' +
      (c.due ? '<span class="chip cn">截止 ' + esc(c.due) + '</span>' : "") +
      (c.done ? '<span class="chip c3">✓ 已完成</span>' : "") +
      '<span class="tools"><span class="muted" style="font-size:12.5px">' + dn + " / " + total + ' 人完成</span>' +
        '<button class="btn sm" style="color:#A03A33" data-click="deleteChallenge(\'' + c.id + '\')">删除</button></span>' +
    '</div>' +
    (c.desc ? '<div class="cd">' + esc(c.desc) + '</div>' : "") +
    '<div class="cprog"><i style="width:' + pct + '%"></i></div>' +
    '<div class="clist">' + c.members.map(m =>
      '<button class="cbtn' + (m.done ? " done" : "") + '"' +
      (m.done || c.done ? "" : ' data-click="challengeCheck(\'' + c.id + '\',\'' + esc(m.name) + '\')"') + '>' +
      (m.done ? "✓ " : "") + esc(m.name) + (m.done ? " 已打卡" : " 打卡") + '</button>').join("") + '</div>' +
    '<div class="muted" style="margin-top:11px;font-size:12.8px">' +
      (c.done ? "🎉 全员完成" + (c.doneAt ? "（" + esc(c.doneAt) + "）" : "") + "，心愿池已入账"
              : "每人打卡：家庭心愿 +" + c.per + " ⭐　全员完成：再 +" + c.bonus + " ⭐") +
    '</div>' +
  '</div>';
}
let chMembersPick = [];
function paintChMembers() {
  const box = $("chMembersIn"); if (!box) return;
  box.innerHTML = familyMembers().map(n => {
    const on = chMembersPick.indexOf(n) >= 0;
    return '<span class="pick' + (on ? " on" : "") + '" data-click="toggleChMember(\'' + esc(n) + '\')">' +
      (on ? "✓ " : "") + avatarOf(n) + " " + esc(n) + '</span>';
  }).join("");
}
function toggleChMember(n) {
  const i = chMembersPick.indexOf(n);
  if (i >= 0) chMembersPick.splice(i, 1); else chMembersPick.push(n);
  paintChMembers();
}
function openChallengeForm() {
  fillSel("chEmojiIn", CHG_EMOJI, CHG_EMOJI[DB.challenges.length % CHG_EMOJI.length]);
  fillSel("chByIn", familyMembers(), "妈妈");
  $("chTitleIn").value = "";
  $("chDescIn").value = "";
  $("chDueIn").value = "本周日";
  $("chPerIn").value = "3";
  $("chBonusIn").value = "9";
  chMembersPick = familyMembers().slice();
  paintChMembers();
  openModal("modalChallenge");
  setTimeout(() => { try { $("chTitleIn").focus(); } catch (e) {} }, 80);
}
function saveChallenge() {
  const title = ($("chTitleIn").value || "").trim();
  const desc = ($("chDescIn").value || "").trim();
  if (title.length < 2) { toast("先写一句挑战内容吧 ✍️"); return; }
  if (chMembersPick.length < 2) { toast("家庭挑战至少要两个人参加"); return; }
  const by = $("chByIn").value;
  const per = Math.max(0, Math.min(20, parseInt($("chPerIn").value, 10) || 0));
  const bonus = Math.max(0, Math.min(50, parseInt($("chBonusIn").value, 10) || 0));
  DB.challenges.unshift({ id: newId("c"), emoji: $("chEmojiIn").value, title, desc, by,
    due: ($("chDueIn").value || "").trim(), per, bonus, done: false, doneAt: "",
    members: chMembersPick.map(n => ({ name: n, done: false })) });
  saveAll(); closeModal("modalChallenge");
  pushFeed("🏡", by + "发起了家庭挑战：「" + title + "」");
  toast("挑战已发起，全家一起加油 🏡"); renderAll();
}
function deleteChallenge(cid) {
  const c = (DB.challenges || []).find(x => x.id === cid); if (!c) return;
  const goOn = () => { if (!confirm("确定删掉挑战「" + c.title + "」吗？")) return;
    DB.challenges = DB.challenges.filter(x => x.id !== cid); saveAll(); renderAll(); toast("挑战已删除"); };
  if (slotByName(c.by)) goOn();
  else askParent("删除家庭挑战会影响全家，请家长确认。", goOn);
}

/* ---------- 陪伴记录 ---------- */
function careThisWeek() {
  const out = [], now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const ds = dateStr(d);
    DB.care.forEach(k => { if (k.day === ds) out.push(k); });
  }
  return out;
}
function openCareForm() {
  fillSel("careWhoIn", ["妈妈", "爸爸", "奶奶"], "奶奶");
  const on = kidsOn();
  fillSel("careChildIn", on.map(s => KNS(s)), on.length ? KNS(on[0]) : "");
  fillSel("careActIn", CARE_ACTS, CARE_ACTS[0]);
  fillSel("careMinIn", CARE_MINS.map(m => m + " 分钟"), "15 分钟");
  $("careDetailIn").value = "";
  openModal("modalCare");
}
function saveCare() {
  const who = $("careWhoIn").value, cname = $("careChildIn").value;
  const act = $("careActIn").value;
  const min = parseInt($("careMinIn").value, 10) || 15;
  const detail = ($("careDetailIn").value || "").trim();
  const child = slotByName(cname);
  if (!child) { toast("还没有添加孩子，先去「家庭档案」添加吧"); return; }
  DB.care.unshift({ id: newId("k"), who, child, act, detail, min, day: todayStr() });
  if (DB.care.length > 120) DB.care.length = 120;
  pushArchive(child, who + "陪" + cname + act + (detail ? "「" + detail + "」" : "") + "（陪伴 · 沟通力）");
  pushFeed("👵", who + "陪" + cname + act + (detail ? "「" + detail + "」" : "") + " " + min + " 分钟，记录下来啦");
  const before = DB.wishes.filter(x => x.done).length;
  addToWish(1);
  saveAll(); closeModal("modalCare");
  if (DB.wishes.filter(x => x.done).length === before) toast("陪伴记录好啦 ❤ 心愿池 +1 ⭐");
  renderAll();
}
function deleteCare(id) {
  if (!confirm("删掉这条陪伴记录吗？")) return;
  DB.care = DB.care.filter(k => k.id !== id); saveAll(); renderAll(); toast("已删除");
}
function renderCare() {
  const rk = $("careRank"); if (!rk) return;
  const wk = careThisWeek();
  const byWho = {};
  wk.forEach(k => { byWho[k.who] = (byWho[k.who] || 0) + 1; });
  const mins = wk.reduce((a, k) => a + (k.min || 0), 0);
  rk.innerHTML = '<span class="rk">本周陪伴 <b>' + wk.length + '</b> 次 · 共 <b>' + mins + '</b> 分钟</span>' +
    Object.keys(byWho).sort((a, b) => byWho[b] - byWho[a]).map(w =>
      '<span class="rk">' + avatarOf(w) + " " + esc(w) + ' 陪了 <b>' + byWho[w] + '</b> 次</span>').join("") +
    (wk.length ? "" : '<span class="rk">这周还没有陪伴记录</span>');
  const list = DB.care.slice(0, 12);
  $("careList").innerHTML = list.length ? list.map(k =>
    '<div class="care-item"><div class="ci">' + avatarOf(k.who) + '</div>' +
      '<div><div><b>' + esc(k.who) + '</b> 陪 ' + KE(k.child) + " " + KNS(k.child) + " " + esc(k.act) +
        (k.detail ? "「" + esc(k.detail) + "」" : "") + '</div>' +
        '<div class="muted" style="font-size:12.3px">' + esc(k.day) + ' · 约 ' + k.min + ' 分钟</div></div>' +
      '<span class="cm"><button class="btn sm" data-click="deleteCare(\'' + k.id + '\')">删除</button></span></div>').join("")
    : '<div class="muted">还没有陪伴记录。记一次，它就会进孩子的成长时间轴。</div>';
}

function renderFamily() {
  const wl = $("wishList"); if (!wl) return;
  const act = DB.wishes.filter(w => !w.done), fin = DB.wishes.filter(w => w.done);
  wl.innerHTML = (act.length || fin.length)
    ? act.map(w => wishCardHTML(w, true)).join("") + fin.slice(0, 3).map(w => wishCardHTML(w, false)).join("")
    : '<div class="muted">还没有心愿。点右上角「设一个新心愿」，给全家一个一起攒的目标吧。</div>';

  const cf = $("challengeFull");
  const ca = DB.challenges.filter(c => !c.done), cfin = DB.challenges.filter(c => c.done);
  cf.innerHTML = (ca.length || cfin.length)
    ? ca.map(c => challengeCardHTML(c, false)).join("") + cfin.slice(0, 3).map(c => challengeCardHTML(c, false)).join("")
    : '<div class="muted">还没有挑战。点右上角「发起挑战」，全家一起做一件事吧。</div>';

  renderCare();
}

/* ================================================================
   成长档案摘要 · 长图 / PDF（对应设计方案 8.3）
   ================================================================ */
let reportWho = "guoguo";
function dsItem(n, l) { return '<div class="dsi"><div class="dsn">' + n + '</div><div class="dsl">' + l + '</div></div>'; }
function buildRadarInner(mode, cx, cy, R) {
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5;
  const sets = [];
  if (mode === "both") {
    sets.push({ color: RADAR_COLOR.guoguo, data: dimCounts("guoguo") });
    sets.push({ color: RADAR_COLOR.xiaoyu, data: dimCounts("xiaoyu") });
  } else sets.push({ color: RADAR_COLOR[mode] || "#E8871E", data: dimCounts(mode) });
  const maxV = Math.max(3, ...sets.reduce((a, s) => a.concat(s.data), []));
  let s = "";
  [0.33, 0.66, 1].forEach(k => {
    const pts = DIMS.map((_, i) => (cx + R * k * Math.cos(ang(i))) + "," + (cy + R * k * Math.sin(ang(i)))).join(" ");
    s += '<polygon points="' + pts + '" fill="none" stroke="#E8E2D6" stroke-width="1.2"/>';
  });
  DIMS.forEach((_, i) => {
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + R * Math.cos(ang(i))) + '" y2="' + (cy + R * Math.sin(ang(i))) + '" stroke="#E8E2D6" stroke-width="1.2"/>';
  });
  s += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="10.5" fill="#C6C1B7" font-weight="700">' + maxV + '</text>';
  sets.forEach(st => {
    const rad = v => (v <= 0 ? 0 : Math.max(0.05, Math.min(1, v / maxV))) * R;
    const pts = st.data.map((v, i) => {
      const r = rad(v);
      return (cx + r * Math.cos(ang(i))) + "," + (cy + r * Math.sin(ang(i)));
    }).join(" ");
    s += '<polygon points="' + pts + '" fill="' + st.color + '2E" stroke="' + st.color + '" stroke-width="2.2" stroke-linejoin="round"/>';
    st.data.forEach((v, i) => {
      const r = rad(v);
      s += '<circle cx="' + (cx + r * Math.cos(ang(i))) + '" cy="' + (cy + r * Math.sin(ang(i))) + '" r="' + (v <= 0 ? 2.6 : 4.2) + '" fill="' + st.color + '" stroke="#fff" stroke-width="1.6"/>';
    });
  });
  DIMS.forEach((lab, i) => {
    const lx = cx + (R + 30) * Math.cos(ang(i)), ly = cy + (R + 30) * Math.sin(ang(i));
    const anchor = Math.abs(Math.cos(ang(i))) < 0.25 ? "middle" : (Math.cos(ang(i)) > 0 ? "start" : "end");
    const vals = sets.length === 1
      ? '<tspan fill="' + sets[0].color + '" font-size="11.5"> ' + sets[0].data[i] + '</tspan>'
      : '<tspan fill="' + sets[0].color + '" font-size="11.5"> ' + sets[0].data[i] + '</tspan><tspan fill="' + RADAR_COLOR.xiaoyu + '" font-size="11.5">/' + sets[1].data[i] + '</tspan>';
    s += '<text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="' + anchor + '" font-size="13" font-weight="700" fill="#5B5765">' + lab + vals + '</text>';
  });
  return { svg: s, sets, maxV };
}
function radarSVGStr(mode) {
  const r = buildRadarInner(mode, 260, 187, 112);
  return '<svg viewBox="0 0 520 374" style="width:100%;max-width:520px;height:auto" xmlns="http://www.w3.org/2000/svg">' + r.svg + '</svg>';
}
function recentDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = dateStr(d), h = DB.history[ds] || {};
    out.push({ ds, label: (d.getMonth() + 1) + "/" + d.getDate(), g: h.guoguo || 0, x: h.xiaoyu || 0 });
  }
  return out;
}
function barsSVGStr() {
  const W = 680, H = 200, padL = 38, padR = 14, padT = 14, padB = 36;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const data = recentDays(14);
  const maxV = Math.max(8, ...data.map(d => Math.max(d.g, d.x)));
  const step = Math.ceil(maxV / 4 / 5) * 5 || 5;
  const top = Math.max(step * 4, maxV);
  const yOf = v => padT + plotH - (v / top) * plotH;
  const groupW = plotW / data.length, barW = Math.min(13, groupW / 3);
  let s = "";
  for (let k = 0; k <= 4; k++) {
    const v = top * (4 - k) / 4, yy = yOf(v);
    s += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - padR) + '" y2="' + yy + '" stroke="#EFEAE1" stroke-width="1"/>';
    s += '<text x="' + (padL - 7) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="10.5" fill="#8F8B99">' + Math.round(v) + '</text>';
  }
  data.forEach((d, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const gh = d.g > 0 ? Math.max(3, d.g / top * plotH) : 0;
    const xh = d.x > 0 ? Math.max(3, d.x / top * plotH) : 0;
    if (gh) s += '<rect x="' + (cx - barW - 1.5) + '" y="' + (padT + plotH - gh) + '" width="' + barW + '" height="' + gh + '" rx="4" fill="#E76F8C"/>';
    if (xh) s += '<rect x="' + (cx + 1.5) + '" y="' + (padT + plotH - xh) + '" width="' + barW + '" height="' + xh + '" rx="4" fill="#4E9A5F"/>';
    s += '<text x="' + cx + '" y="' + (H - 16) + '" text-anchor="middle" font-size="10.5" fill="#8F8B99">' + d.label + '</text>';
  });
  s += '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) + '" y2="' + (padT + plotH) + '" stroke="#DDD6C9" stroke-width="1.2"/>';
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:' + W + 'px;height:auto" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
}
function reportHTML() {
  const who = reportWho, isFam = who === "family";
  const d = new Date();
  const dateTxt = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  const brand = famName();
  let head = "", body = "";

  if (!isFam) {
    const st = badgeStats(who);
    const on = BADGES.filter(b => { try { return b.chk(st, DB.streak[who] || 0); } catch (e) { return false; } });
    const dims = dimCounts(who), arch = DB.archive[who] || [];
    const careN = DB.care.filter(k => k.child === who).length;
    const w = activeWish();
    head = '<h3>' + KE(who) + ' ' + esc(KNS(who)) + ' 的成长档案</h3>' +
      '<div class="ds">' + SLOT_META[who].stage + ' · ' + SLOT_META[who].ages + ' · 生成于 ' + dateTxt + '</div>';
    body += '<div class="dstat">' + dsItem(st.totalStars, "累计获得的星星") +
        dsItem((DB.streak[who] || 0) + " 天", "当前连续打卡") +
        dsItem(arch.length, "成长记录条数") +
        dsItem(on.length + " / " + BADGES.length, "点亮的徽章") + '</div>' +
      '<h4>🕸️ 五维证据分布</h4>' +
      '<div style="display:flex;justify-content:center">' + radarSVGStr(who) + '</div>' +
      '<div style="font-size:12.4px;color:#8A8794;text-align:center;margin-top:6px">' +
        DIMS.map((n, i) => n + " " + dims[i]).join("　·　") + '　（数字为成长记录条数，不是评分）</div>' +
      '<h4>📊 最近 14 天获得的星星</h4>' + barsSVGStr() +
      '<div style="font-size:12.4px;color:#8A8794;margin-top:4px">' + kidsOn().filter(s => SLOT_META[s].deep === true).map(s => KE(s) + " " + esc(KNS(s))).join("　") + '　柱子从 0 起算，高度即当天实际获得的星星数。</div>' +
      '<h4>🏅 徽章（已点亮 ' + on.length + ' / ' + BADGES.length + '）</h4>' +
      '<div>' + BADGES.map(b => '<span class="bchip ' + (on.indexOf(b) >= 0 ? "on" : "off") + '">' +
        '<span class="bi2">' + b.icon + '</span>' + b.name + '</span>').join("") + '</div>' +
      '<h4>🕰️ 成长时间轴</h4>' +
      (arch.length ? '<ul class="tl">' + arch.slice(0, 14).map(e =>
        '<li><div class="td">' + esc(e.d) + '</div><div class="tx">' + esc(e.x) + '</div></li>').join("") + '</ul>'
        : '<div class="muted">还没有记录，去完成一件小事吧。</div>') +
      (w ? '<h4>⭐ 家庭心愿</h4><div style="font-size:13.5px;color:#55525E">' + w.emoji + " " + esc(w.title) +
        '：<b style="color:#B45309">' + w.saved + ' / ' + w.target + '</b> ⭐（还差 ' + Math.max(0, w.target - w.saved) + ' ⭐）</div>' : "") +
      (careN ? '<div style="font-size:13px;color:#8A8794;margin-top:10px">家人陪伴记录：' + careN + ' 次。</div>' : "");
  } else {
    const deepKids = kidsOn().filter(s => SLOT_META[s].deep === true);
    const totalStars = deepKids.reduce((a, c) => a + (badgeStats(c).totalStars || 0), 0);
    const w = activeWish();
    const chDone = DB.challenges.filter(c => c.done).length;
    const wk = careThisWeek(), byWho = {};
    wk.forEach(k => { byWho[k.who] = (byWho[k.who] || 0) + 1; });
    head = '<h3>🏡 ' + brand + ' 的家庭成长摘要</h3><div class="ds">生成于 ' + dateTxt + ' · 全家一起走过的日子</div>';
    body += '<div class="dstat">' + dsItem(w ? Math.round(wishPct(w)) + "%" : "—", "家庭心愿进度") +
        dsItem(chDone + " 个", "完成的家庭挑战") +
        dsItem(wk.length + " 次", "本周陪伴记录") +
        dsItem(totalStars, "全家累计星星") + '</div>' +
      '<h4>🕸️ ' + (deepKids.length >= 2 ? "两个孩子 · 五维对比" : "五维证据分布") + '</h4>' +
      '<div style="display:flex;justify-content:center">' + radarSVGStr(deepKids.length >= 2 ? "both" : (deepKids[0] || "guoguo")) + '</div>' +
      '<div style="font-size:12.4px;color:#8A8794;text-align:center;margin-top:6px">' + (deepKids.length >= 2
        ? "两个数字依次为 " + deepKids.map(s => KE(s) + " " + esc(KNS(s))).join(" / ") + " 的证据记录条数"
        : "数字为成长记录条数，不是评分") + '</div>' +
      '<h4>📊 最近 14 天获得的星星</h4>' + barsSVGStr() +
      (w ? '<h4>⭐ 家庭心愿</h4><div style="font-size:13.5px;color:#55525E">' + w.emoji + " " + esc(w.title) +
        '：<b style="color:#B45309">' + w.saved + ' / ' + w.target + '</b> ⭐' + (w.note ? '　「' + esc(w.note) + '」' : '') + '</div>' : "") +
      '<h4>🏡 家庭挑战</h4>' +
      (DB.challenges.length ? DB.challenges.slice(0, 6).map(c =>
        '<div style="font-size:13.4px;color:#55525E;margin:5px 0">' + c.emoji + " " + esc(c.title) +
        '　<span style="color:#8A8794">' + c.members.filter(m => m.done).length + " / " + c.members.length + " 人完成" +
        (c.done ? " · 已完成" : "") + '</span></div>').join("")
        : '<div class="muted">还没有挑战。</div>') +
      '<h4>👵 本周陪伴</h4>' +
      (wk.length ? '<div style="font-size:13.4px;color:#55525E">共 ' + wk.length + ' 次 · ' +
        wk.reduce((a, k) => a + (k.min || 0), 0) + ' 分钟　' +
        Object.keys(byWho).map(k => k + " " + byWho[k] + " 次").join("　·　") + '</div>' +
        '<ul class="tl" style="margin-top:10px">' + wk.slice(0, 10).map(k =>
          '<li><div class="td">' + esc(k.day) + '</div><div class="tx">' + esc(k.who) + " 陪 " +
          KNS(k.child) + " " + esc(k.act) + (k.detail ? "「" + esc(k.detail) + "」" : "") + "（约 " + k.min + " 分钟）</div></li>").join("") + '</ul>'
        : '<div class="muted">这周还没有陪伴记录。</div>');
  }

  return '<div class="doc"><div class="dh">' + head + '</div>' + body +
    '<div class="quote">这份摘要里没有分数，也没有排名。<br>' +
    '我们只记录真实发生的事：孩子做了什么、说了什么、和谁一起。<br>' +
    '真正重要的那句评价，请留给孩子自己说。</div>' +
    '<div style="text-align:center;color:#8A8794;font-size:12px;margin-top:20px">' + brand +
    ' · 家庭伴学台 · ' + dateTxt + '</div></div>';
}
function renderReport() {
  const box = $("reportDoc"); if (!box) return;
  box.innerHTML = reportHTML();
}
function switchReport(who, el) {
  reportWho = who;
  const tabs = document.querySelectorAll("#reportTabs .tab");
  tabs.forEach(t => t.classList.remove("active"));
  const idx = who === "guoguo" ? 0 : who === "xiaoyu" ? 1 : 2;
  if (el) el.classList.add("active"); else if (tabs[idx]) tabs[idx].classList.add("active");
  renderReport();
}
function printArchive() {
  $("printSheet").innerHTML = reportHTML();
  toast("已打开打印面板，选择「另存为 PDF」即可保存");
  setTimeout(() => { try { window.print(); } catch (e) { toast("这个浏览器暂时不支持打印，试试「下载长图」"); } }, 120);
}

/* ---------- 长图（Canvas 手绘 · 零依赖） ---------- */
function exportLongImage() {
  toast("正在生成长图…");
  setTimeout(() => { try { drawLongImage(); } catch (e) { toast("生成失败，可以改用「打印 / 存为 PDF」"); } }, 80);
}
function drawLongImage() {
  const who = reportWho, isFam = who === "family";
  const W = 920, PAD = 54, CW = W - PAD * 2;
  const cvs = document.createElement("canvas");
  cvs.width = W; cvs.height = 4200;
  const ctx = cvs.getContext("2d");
  const FONT = '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif';
  const setF = (w, s, c) => { ctx.font = w + " " + s + "px " + FONT; ctx.fillStyle = c; };
  const txt = (s, x, y, w, size, color, align) => {
    setF(w, size, color); ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  };
  const rr = (x, y, w, h, r, fill, stroke) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  };
  const ellip = (s, maxW) => {
    s = String(s == null ? "" : s);
    if (ctx.measureText(s).width <= maxW) return s;
    let t = s;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
    return t + "…";
  };
  const wrap = (s, maxW, maxLines) => {
    const out = [];
    let line = "";
    for (const ch of String(s == null ? "" : s)) {
      if (ctx.measureText(line + ch).width > maxW) {
        out.push(line); line = ch;
        if (out.length >= maxLines) { line = ""; break; }
      } else line += ch;
    }
    if (line && out.length < maxLines) out.push(line);
    if (out.length === maxLines) {
      let last = out[maxLines - 1];
      while (last.length > 1 && ctx.measureText(last + "…").width > maxW) last = last.slice(0, -1);
      out[maxLines - 1] = last + (ctx.measureText(out[maxLines - 1]).width > maxW ? "…" : "");
    }
    return out;
  };

  const d = new Date();
  const dateTxt = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  const brand = famName();

  ctx.fillStyle = "#FAF8F5"; ctx.fillRect(0, 0, W, cvs.height);
  ctx.fillStyle = "#FFF4E0"; ctx.fillRect(0, 0, W, 104);
  txt("🌱 家庭伴学台", PAD, 52, "700", 27, "#B45309", "left");
  txt("家庭成长档案 · 生成于 " + dateTxt, W - PAD, 53, "400", 15, "#8A6A2E", "right");
  let y = 104 + 56;

  txt(isFam ? (brand + " 的家庭成长摘要") : (KNS(who) + " 的成长档案"), W / 2, y, "800", 34, "#2B2A33", "center");
  y += 42;
  txt(isFam ? "全家一起走过的日子 · 无分数 · 无排名" : (who === "guoguo" ? "5 岁 · 学龄前" : "9 岁 · 小学中") + " · 无分数 · 无排名",
    W / 2, y, "400", 16, "#8A8794", "center");
  y += 30;
  ctx.strokeStyle = "#EDE9E2"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
  y += 34;

  const secTitle = (t) => { txt(t, PAD, y, "800", 21, "#2B2A33", "left"); y += 34; };

  /* —— 统计卡 —— */
  const stats = [];
  if (!isFam) {
    const st = badgeStats(who);
    const onN = BADGES.filter(b => { try { return b.chk(st, DB.streak[who] || 0); } catch (e) { return false; } }).length;
    stats.push([st.totalStars, "累计获得的星星"], [(DB.streak[who] || 0) + " 天", "当前连续打卡"],
      [(DB.archive[who] || []).length, "成长记录条数"], [onN + " / " + BADGES.length, "点亮的徽章"]);
  } else {
    const w0 = activeWish();
    const tot = ["guoguo", "xiaoyu"].reduce((a, c) => a + (badgeStats(c).totalStars || 0), 0);
    stats.push([w0 ? Math.round(wishPct(w0)) + "%" : "—", "家庭心愿进度"],
      [DB.challenges.filter(c => c.done).length + " 个", "完成的家庭挑战"],
      [careThisWeek().length + " 次", "本周陪伴记录"], [tot, "全家累计星星"]);
  }
  const gap = 16, cw = (CW - gap * 3) / 4;
  stats.forEach((s, i) => {
    const x = PAD + (cw + gap) * i;
    rr(x, y, cw, 108, 18, "#FCFAF6", "#EDE9E2");
    txt(String(s[0]), x + cw / 2, y + 44, "800", 30, "#B45309", "center");
    txt(s[1], x + cw / 2, y + 78, "400", 14, "#8A8794", "center");
  });
  y += 108 + 36;

  /* —— 雷达 —— */
  secTitle("🕸️ " + (isFam ? "两个孩子 · 五维证据对比" : "五维证据分布"));
  const RCX = W / 2, RCY = y + 186, RRAD = 128;
  const ang = i => -Math.PI / 2 + i * 2 * Math.PI / 5;
  const rSets = [];
  if (isFam) {
    rSets.push({ color: "#E76F8C", data: dimCounts("guoguo"), nm: KNS("guoguo") });
    rSets.push({ color: "#4E9A5F", data: dimCounts("xiaoyu"), nm: KNS("xiaoyu") });
  } else rSets.push({ color: RADAR_COLOR[who] || "#E8871E", data: dimCounts(who) });
  const rMax = Math.max(3, ...rSets.reduce((a, s) => a.concat(s.data), []));
  ctx.strokeStyle = "#E8E2D6"; ctx.lineWidth = 1.4;
  [0.33, 0.66, 1].forEach(k => {
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const a = ang(i % 5);
      const x = RCX + RRAD * k * Math.cos(a), yy = RCY + RRAD * k * Math.sin(a);
      i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
    }
    ctx.closePath(); ctx.stroke();
  });
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(RCX, RCY);
    ctx.lineTo(RCX + RRAD * Math.cos(ang(i)), RCY + RRAD * Math.sin(ang(i))); ctx.stroke();
  }
  rSets.forEach(st => {
    const rad = v => (v <= 0 ? 0 : Math.max(0.05, Math.min(1, v / rMax))) * RRAD;
    ctx.beginPath();
    st.data.forEach((v, i) => {
      const r = rad(v), x = RCX + r * Math.cos(ang(i)), yy = RCY + r * Math.sin(ang(i));
      i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
    });
    ctx.closePath();
    ctx.fillStyle = st.color + "33"; ctx.fill();
    ctx.strokeStyle = st.color; ctx.lineWidth = 2.8; ctx.lineJoin = "round"; ctx.stroke();
    st.data.forEach((v, i) => {
      const r = rad(v);
      ctx.beginPath(); ctx.arc(RCX + r * Math.cos(ang(i)), RCY + r * Math.sin(ang(i)), v <= 0 ? 3.2 : 5, 0, 7);
      ctx.fillStyle = st.color; ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    });
  });
  for (let i = 0; i < 5; i++) {
    const a = ang(i);
    const lx = RCX + (RRAD + 48) * Math.cos(a), ly = RCY + (RRAD + 48) * Math.sin(a);
    const al = Math.abs(Math.cos(a)) < 0.25 ? "center" : (Math.cos(a) > 0 ? "left" : "right");
    txt(DIMS[i], lx, ly - 11, "700", 16, "#5B5765", al);
    txt(rSets.map(s => s.data[i]).join(" / "), lx, ly + 12, "400", 14, rSets[0].color, al);
  }
  if (isFam) {
    txt(kidsOn().filter(s => SLOT_META[s].deep === true).map(s => KE(s) + " " + KNS(s)).join("　　"), W / 2, RCY + RRAD + 74, "400", 14, "#8A8794", "center");
  }
  y = RCY + RRAD + 104;

  /* —— 柱状图 —— */
  secTitle("📊 最近 14 天获得的星星");
  (function () {
    const padL = PAD + 42, padR = W - PAD - 10, padT = y + 10, plotH = 190;
    const plotW = padR - padL;
    const data = recentDays(14);
    const maxV = Math.max(8, ...data.map(x => Math.max(x.g, x.x)));
    const step = Math.ceil(maxV / 4 / 5) * 5 || 5;
    const top = Math.max(step * 4, maxV);
    ctx.strokeStyle = "#EFEAE1"; ctx.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const v = top * (4 - k) / 4, yy = padT + plotH - (v / top) * plotH;
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padR, yy); ctx.stroke();
      txt(String(Math.round(v)), padL - 12, yy, "400", 13, "#8F8B99", "right");
    }
    const groupW = plotW / data.length, barW = Math.min(15, groupW / 3);
    data.forEach((dd, i) => {
      const cx = padL + groupW * i + groupW / 2;
      const gh = dd.g > 0 ? Math.max(4, dd.g / top * plotH) : 0;
      const xh = dd.x > 0 ? Math.max(4, dd.x / top * plotH) : 0;
      if (gh) rr(cx - barW - 2, padT + plotH - gh, barW, gh, 4, "#E76F8C");
      if (xh) rr(cx + 2, padT + plotH - xh, barW, xh, 4, "#4E9A5F");
      txt(dd.label, cx, padT + plotH + 20, "400", 12.5, "#8F8B99", "center");
    });
    ctx.strokeStyle = "#DDD6C9"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(padL, padT + plotH); ctx.lineTo(padR, padT + plotH); ctx.stroke();
    y = padT + plotH + 52;
  })();
  txt(kidsOn().filter(s => SLOT_META[s].deep === true).map(s => KE(s) + " " + KNS(s)).join("　　") + "　　柱子从 0 起算，高度即当天实际获得的星星数", PAD, y - 14, "400", 13.5, "#8A8794", "left");
  y += 12;

  if (!isFam) {
    /* —— 徽章 —— */
    const st = badgeStats(who);
    const on = BADGES.filter(b => { try { return b.chk(st, DB.streak[who] || 0); } catch (e) { return false; } });
    secTitle("🏅 徽章（已点亮 " + on.length + " / " + BADGES.length + "）");
    const bw = 100, bh = 84, bg = 10, perRow = Math.floor((CW + bg) / (bw + bg));
    BADGES.forEach((b, i) => {
      const r = Math.floor(i / perRow), c = i % perRow;
      const x = PAD + c * (bw + bg), yy = y + r * (bh + bg);
      const got = on.indexOf(b) >= 0;
      rr(x, yy, bw, bh, 16, got ? "#FFF7E6" : "#F6F3ED", null);
      ctx.globalAlpha = got ? 1 : 0.42;
      txt(b.icon, x + bw / 2, yy + 30, "400", 26, "#2B2A33", "center");
      txt(b.name, x + bw / 2, yy + 61, "700", 13, "#55525E", "center");
      ctx.globalAlpha = 1;
    });
    y += Math.ceil(BADGES.length / perRow) * (bh + bg) + 30;

    /* —— 时间轴 —— */
    const arch = DB.archive[who] || [];
    secTitle("🕰️ 成长时间轴");
    if (!arch.length) { txt("还没有记录，去完成一件小事吧。", PAD, y + 10, "400", 15, "#8A8794", "left"); y += 46; }
    arch.slice(0, 14).forEach(e => {
      ctx.strokeStyle = "#EDE7DC"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(PAD + 6, y); ctx.lineTo(PAD + 6, y + 62); ctx.stroke();
      ctx.beginPath(); ctx.arc(PAD + 6, y + 9, 6.5, 0, 7);
      ctx.fillStyle = "#E0A93F"; ctx.fill();
      ctx.strokeStyle = "#EADFC7"; ctx.lineWidth = 2; ctx.stroke();
      setF("400", 13.5, "#8A8794");
      txt(e.d, PAD + 26, y + 9, "400", 13.5, "#8A8794", "left");
      const lines = wrap(e.x, CW - 40, 2);
      lines.forEach((ln, li) => txt(ln, PAD + 26, y + 36 + li * 23, "400", 15, "#55525E", "left"));
      y += 62;
    });
    y += 6;
  } else {
    /* —— 挑战 / 陪伴（家庭版） —— */
    secTitle("🏡 家庭挑战");
    if (!DB.challenges.length) { txt("还没有挑战。", PAD, y + 10, "400", 15, "#8A8794", "left"); y += 46; }
    DB.challenges.slice(0, 6).forEach(c => {
      txt(c.emoji + " " + ellip(c.title, CW - 220), PAD, y + 12, "700", 16, "#2B2A33", "left");
      txt(c.members.filter(m => m.done).length + " / " + c.members.length + " 人完成" + (c.done ? " · 已完成" : ""),
        W - PAD, y + 12, "400", 14, "#8A8794", "right");
      y += 38;
    });
    y += 12;
    secTitle("👵 本周陪伴");
    const wk = careThisWeek();
    if (!wk.length) { txt("这周还没有陪伴记录。", PAD, y + 10, "400", 15, "#8A8794", "left"); y += 46; }
    wk.slice(0, 10).forEach(k => {
      txt(k.who + " 陪 " + KNS(k.child) + " " + k.act + (k.detail ? "「" + k.detail + "」" : ""),
        PAD + 20, y + 10, "400", 15, "#55525E", "left");
      txt(k.day + " · " + k.min + " 分钟", W - PAD, y + 10, "400", 13, "#8A8794", "right");
      y += 34;
    });
    y += 10;
  }

  /* —— 家庭心愿 —— */
  const aw = activeWish();
  if (aw) {
    secTitle("⭐ 家庭心愿：" + aw.emoji + " " + aw.title);
    const bw2 = CW, bh2 = 22;
    rr(PAD, y, bw2, bh2, 11, "#F6E8CC", null);
    rr(PAD, y, Math.max(6, bw2 * wishPct(aw) / 100), bh2, 11, "#D97706", null);
    txt(aw.saved + " / " + aw.target + " ⭐", PAD + 14, y + bh2 + 22, "700", 15, "#B45309", "left");
    txt("还差 " + Math.max(0, aw.target - aw.saved) + " ⭐", W - PAD, y + bh2 + 22, "400", 14, "#8A8794", "right");
    y += bh2 + 56;
  }

  /* —— 结语 —— */
  const qh = 132;
  rr(PAD, y, CW, qh, 18, "#FFF7E6", null);
  ctx.fillStyle = "#EACF9B"; ctx.fillRect(PAD, y, 6, qh);
  txt("这份摘要里没有分数，也没有排名。", PAD + 28, y + 38, "700", 16, "#8A6A2E", "left");
  txt("我们只记录真实发生的事：孩子做了什么、说了什么、和谁一起。", PAD + 28, y + 72, "400", 15, "#8A6A2E", "left");
  txt("真正重要的那句评价，请留给孩子自己说。", PAD + 28, y + 104, "400", 15, "#8A6A2E", "left");
  y += qh + 34;

  txt(brand + " · 家庭伴学台 · " + dateTxt + " · 本图由平台自动生成，仅如实呈现", W / 2, y, "400", 13, "#8A8794", "center");
  y += 44;

  const outH = Math.min(cvs.height, Math.ceil(y));
  const fin = document.createElement("canvas");
  fin.width = W; fin.height = outH;
  fin.getContext("2d").drawImage(cvs, 0, 0);
  const fname = (isFam ? brand + "_家庭成长摘要_" : KNS(who) + "的成长档案_") + todayStr() + ".png";
  try {
    fin.toBlob(b => {
      if (!b) { toast("长图生成失败，试试「打印 / 存为 PDF」"); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast("长图已保存 🖼️ 去下载目录看看");
    }, "image/png");
  } catch (e) {
    const a = document.createElement("a");
    a.href = fin.toDataURL("image/png"); a.download = fname;
    document.body.appendChild(a); a.click(); a.remove();
    toast("长图已保存 🖼️");
  }
}

/* ================================================================
   总渲染
   ================================================================ */
function renderAll() {
  paintKidsUI(); renderGallery();
  renderHome(); renderGuoguo(); renderXiaoyu(); renderBaby(); renderJunior(); renderSenior();
  if (currentView === "view-guoguo") $("topStarNum").textContent = DB.stars.guoguo;
  if (currentView === "view-xiaoyu") $("topStarNum").textContent = DB.stars.xiaoyu;
  if ($("view-archive").classList.contains("active")) { switchArchive(archiveChild); drawWeekly(); }
  if ($("view-badges").classList.contains("active")) renderBadges();
  if ($("view-family").classList.contains("active")) renderFamily();
  if ($("view-library").classList.contains("active")) renderLibrary();
  if ($("view-tips").classList.contains("active")) renderTips();
  if ($("view-report").classList.contains("active")) renderReport();
  if ($("view-parent").classList.contains("active") && parentUnlocked) renderParent();
  paintSyncChip();
}

/* ================================================================
   启动
   ================================================================ */
// Delegated handlers keep dynamically rendered controls compatible with hosted CSP.
const actionNames = new Set(["KE", "KN", "KNS", "MEMBERS", "activeWish", "addToWish", "answerG", "answerQ", "answerX", "askParent", "avatarOf", "babyDone", "badgeStats", "barsSVGStr", "buildRadarInner", "bump", "careThisWeek", "challengeCardHTML", "challengeCheck", "checkAllDone", "checkinHistoryHTML", "checkinOf", "checkinQuestion", "checkinSave", "ckEdit", "ckSave", "ckToggle", "clone", "closeModal", "cloudPush", "confetti", "confirmReq", "contributeWish", "cycleJ", "dateStr", "deepMerge", "deleteCare", "deleteChallenge", "deleteWish", "dimCounts", "drawLongImage", "drawRadar", "drawWeekly", "dsItem", "earnStar", "ensureAllBuckets", "ensureKidBucket", "esc", "exportData", "exportLongImage", "famName", "familyMembers", "fillSel", "finishDefense", "finishPoem", "finishRead", "finishSci", "flipGCard", "flipXCard", "getPin", "go", "goHome", "guoguoCards", "guoguoQuiz", "hideAuth", "hideOnboard", "importData", "kidOf", "kidsOn", "last7", "libCardsHTML", "loadLocal", "maybeOnboard", "md", "migrateDB", "newId", "nextBatch", "obDemo", "obFinish", "obGo", "obKidNext", "obNameNext", "obPickStage", "obSkipKid2", "openAccount", "openBackup", "openCareForm", "openChallengeForm", "openJuniorSettings", "openKidEditor", "openModal", "openWishForm", "packNames", "paintChMembers", "paintKidEditor", "paintKidsUI", "paintOnboard", "paintSyncChip", "pick", "poemsToday", "previewReport", "printArchive", "projStep", "projToday", "pushArchive", "pushFeed", "radarSVGStr", "recentDays", "rejectReq", "renderAll", "renderBaby", "renderBadges", "renderCalendar", "renderCare", "renderFamily", "renderFamilyProfileHTML", "renderGallery", "renderGuoguo", "renderHome", "renderJunior", "renderLibrary", "renderPackGrid", "renderParent", "renderPinGate", "renderQuiz", "renderReport", "renderSenior", "renderShopHTML", "renderTaskRow", "renderTips", "renderXiaoyu", "reobReset", "reportHTML", "requestRedeem", "resetData", "saveAll", "saveCare", "saveChallenge", "saveFamName", "saveKidEditor", "saveLocal", "saveWish", "scheduleSync", "sciToday", "seniorTopic", "setGuardianMin", "setPin", "showOnboard", "slotByName", "snext", "speak", "stepNum", "submitPin", "submitPinAsk", "switchArchive", "switchBadges", "switchReport", "syncNow", "tallyOf", "taskStats", "tasksOf", "themePickSet", "themeSuggest", "timeAgo", "tipCatSet", "toast", "todayStr", "toggleChMember", "toggleGuardian", "toggleKid", "togglePack", "updateOverdue", "updateRibbon", "weekKey", "wishCardHTML", "wishPct", "xiaoyuQuiz", "xiaoyuWords"]);
function dispatchAction(event, kind) {
 const target = event.target.closest('[data-' + kind + ']'); if (!target) return;
 const text = target.getAttribute('data-' + kind);
 if (kind === 'input') {
  if (text === 'ob.name=this.value') ob.name = target.value;
  else if (text === 'ckDraft=this.value') ckDraft = target.value;
  else { const m = text.match(/^if\(ob\.kids\[(\d+)\]\)ob\.kids\[\1\]\.name=this\.value$/); if (m && ob.kids[+m[1]]) ob.kids[+m[1]].name=target.value; }
  return;
 }
 if (text === "this.classList.toggle('flipped')") { target.classList.toggle('flipped'); return; }
 if (/^gPoemIdx=\d+;renderGuoguo\(\)$/.test(text)) { gPoemIdx=Number(text.match(/\d+/)[0]); renderGuoguo(); return; }
 const ed = text.match(/^kidEd\.(emoji|slot)='([^']*)';(?:kidEd\.emoji='([^']*)';)?paintKidEditor\(\)$/);
 if (ed) { kidEd[ed[1]]=ed[2]; if (ed[3]) kidEd.emoji=ed[3]; paintKidEditor(); return; }
 let source=text; if (source.startsWith('event.stopPropagation();')) { event.stopPropagation(); source=source.slice(24); }
 const calls=source.match(/(?:[^;'\"]|'[^']*'|"[^"]*")+/g) || [];
 for (const call of calls) {
  const m=call.trim().match(/^([A-Za-z_$][\w$]*)\((.*)\)$/s); if (!m || !actionNames.has(m[1]) || typeof window[m[1]] !== 'function') continue;
  const raw=m[2].trim(); const parts=raw ? raw.match(/(?:'[^']*'|"(?:\\.|[^"])*"|[^,])+/g) : [];
  const args=(parts || []).map(v=>{v=v.trim(); if(v==='this')return target; if(v==='this.value')return target.value; if(v==='true')return true; if(v==='false')return false; if(/^[-+]?\d+(?:\.\d+)?$/.test(v))return Number(v); if(v[0]==="'" && v.at(-1)==="'")return v.slice(1,-1); if(v[0]==='"') { try {return JSON.parse(v)} catch {return v.slice(1,-1)} } return undefined;});
  window[m[1]](...args);
 }
}
for (const kind of ['click','input','change']) document.addEventListener(kind, e => dispatchAction(e,kind));
(async function boot() {
 try { const row = await window.familyStore.read(); revision = row.revision; DB = deepMerge(DEFAULTS, row.state || {}); migrateDB(DB, !!row.state); hideAuth(); paintSyncChip(); updateRibbon(); renderAll(); maybeOnboard(); }
 catch (e) { console.error(e); document.body.innerHTML = '<div style="padding:3rem;font-family:sans-serif">家庭数据暂时无法读取，请检查网络后刷新页面。</div>'; }
})();
