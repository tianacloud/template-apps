/* ============================================================
   碎记分拣本 · UI 原型交互
   规则严格对齐 PRD v1.7：排序 / 日期注入 / 分类 / 拆分 / 时间轴
   ============================================================ */

/* ---------------- 工具 ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];

const NOW = new Date();              // 页面加载时刻，仅用于初始化展示
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const nowDate = () => new Date();    // 每条记录的真实创建时刻

function fmtMD(d) { return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fmtMDHM(d) { return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fmtDur(min) {
  if (min < 60) return min + 'm';
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h${m}m` : `${h}h`;
}
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
/** ISO 周起始（周一） */
function weekStart(d) { const x = new Date(d); const wd = (x.getDay() + 6) % 7; x.setDate(x.getDate() - wd); x.setHours(0, 0, 0, 0); return x; }
function weekKey(d) {
  const ws = weekStart(d);
  const jan1 = new Date(ws.getFullYear(), 0, 1);
  const week = Math.floor((ws - jan1) / 86400000 / 7) + 1;
  return `${ws.getFullYear()}-W${pad(week)}`;
}

/* ============================================================
   1. Mock 数据（按 PRD 规则组织）
   ============================================================ */
/* 数据来自云数据库（cloud.js → loadAll）：首屏为空，登录后填充 */
let todos = [];
let notes = [];
let ideas = [];
let logs = [];
let books = [];      // { id, name }
let cats = [];       // { id, name }
let messages = [];   // 原始消息（message 表）：{ id, content, type, channel, at }

/* ============================================================
   0. 运行诊断（真机排障：把每一步结果留在屏幕上）
   ============================================================ */
const DIAG_BUILD = 'build-20261028-1105';
const DIAG_LOG = [];
let diagOn = false;

function dbg(tag, detail) {
  try {
    let d = '';
    if (detail !== undefined && detail !== null) {
      d = typeof detail === 'string' ? detail : JSON.stringify(detail);
    }
    DIAG_LOG.push(`${new Date().toTimeString().slice(0, 8)} [${tag}] ${d}`);
    if (DIAG_LOG.length > 80) DIAG_LOG.shift();
    try { localStorage.setItem('kd_diag', DIAG_LOG.join('\n')); } catch (e) { /* 隐私模式忽略 */ }
    const box = document.getElementById('diagOut');
    if (box && diagOn) box.textContent = DIAG_LOG.join('\n');
  } catch (e) { /* 诊断本身绝不抛错 */ }
}

function errText(err) {
  if (!err) return '未知错误';
  if (typeof err === 'string') return err;
  const parts = [];
  if (err.message) parts.push(err.message);
  if (err.code) parts.push('code=' + err.code);
  if (err.status) parts.push('http=' + err.status);
  if (err.details) parts.push(String(err.details));
  if (err.hint) parts.push(String(err.hint));
  return parts.join(' | ') || JSON.stringify(err);
}

function showDiag(force) {
  const box = document.getElementById('diagOut');
  if (!box) return;
  diagOn = force === true ? true : !diagOn;
  box.hidden = !diagOn;
  box.textContent = diagOn ? DIAG_LOG.join('\n') : '';
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('error', e => {
    dbg('JS-ERROR', `${e.message || ''} @${String(e.filename || '').split('/').pop()}:${e.lineno || 0}`);
    if (diagOn) showDiag(true);
  });
  window.addEventListener('unhandledrejection', e => {
    const r = e.reason;
    dbg('JS-REJECT', errText(r));
    if (diagOn) showDiag(true);
  });
}

if (typeof document !== 'undefined' && document.getElementById) {
  const diagBtnEl = document.getElementById('diagBtn');
  if (diagBtnEl) {
    diagBtnEl.addEventListener('click', () => showDiag());
    diagBtnEl.style.display = 'flex';
  }
}

function mkLog(id, label, y, m, d, hh, mm, dur, cat, desc, cross) {
  return {
    id, label, cat, desc, crossDay: !!cross,
    start: new Date(y, m, d, hh, mm),
    end: new Date(new Date(y, m, d, hh, mm).getTime() + dur * 60000),
    dur,
  };
}

const CAT = {
  study: { name: '学习', c: 'var(--study)', bg: 'var(--study-bg)' },
  work: { name: '工作', c: 'var(--work)', bg: 'var(--work-bg)' },
  leisure: { name: '休闲', c: 'var(--leisure)', bg: 'var(--leisure-bg)' },
  life: { name: '生活', c: 'var(--life)', bg: 'var(--life-bg)' },
};

/* ============================================================
   2. 消息识别（简化版 PRD F1-3 判定顺序）
   ============================================================ */
const LONG_TEXT = 120; // PRD F1-3：长文本判定阈值（个人设置项，默认 120 字）
const TODO_WORDS = ['交', '买', '开会', '发', '写', '预约', '回复', '整理', '看完', '打电话', '准备', '提交', '确认', '订'];
const DATE_WORDS = /(今天|明天|后天|大后天|本周[一二三四五六日]|这周[一二三四五六日]|下周[一二三四五六日]|周[一二三四五六日]|星期[一二三四五六日])/;

/* 时间区间识别：一段话里可以有多段（PRD F5 时间消耗）
   支持「10-11 学习」「昨晚11-7 睡觉」「11:30-11:50 UI」「4-4：30 讨论」 */
const SEG_RE = /(?<![\d:：])(\d{1,2})(?:[:：](\d{2}))?\s*[-–—~～到至]\s*(\d{1,2})(?:[:：](\d{2}))?(?!\d)/g;
/* 统一分类声明：「这些都归类到学习中」「都算工作」「这些都是工作」 */
const TIME_CAT_RE = /(?:这些|以上|全部)?\s*(?:(?:都|全部|统一|均)?\s*(?:归类到|归类为|归到|归为|记为|记到|算作|算是|放到|算|记)|(?:都|全部|均|这些|以上|以上都)\s*是)\s*(学习|工作|休闲|生活)\s*(?:中|里|类)?/;
const CAT_BY_WORD = { 学习: 'study', 工作: 'work', 休闲: 'leisure', 生活: 'life' };
const PM_WORDS = /^(下午|午后|傍晚)/;
const NIGHT_WORDS = /^(晚上|夜里|夜间|傍晚后)/;

/* 快递取件码：形如「3-2-2804」「5-3-1234」——三段数字，末段 3 位以上。
   必须早于时间区间判断：否则会被当成 3 点到 2 点的跨天记录（算出 23 小时）。 */
const PICKUP_CODE = /(?<![0-9:：])\d{1,2}-\d{1,3}-\d{3,6}(?![0-9:：])/;
const PICKUP_WORDS = /取件码|取件号|快递|驿站|丰巢|菜鸟|快递柜|自提|取快递|拿快递/;

/* 正文里的日期词：一段话写了两天（「这周一…；这周二…」）时，逐段切换基准日 */
const ANCHOR_RE = /(大前天|前天|昨天|昨晚|今天|今早|今晚|明天|明早|明晚|(?:这|本|下)?(?:周|星期)[一二三四五六日])/g;
/* 段前紧邻的时段词：这一段按下午/晚上理解（「下午 2-4」= 14:00-16:00） */
const PM_BEFORE_RE = /(下午|傍晚|晚上|夜里|夜间)\s*[：:，,]?\s*$/;
/* 段前紧邻的「上午/凌晨」：明确是上午，1-6 点不能自己跳到下午 */
const AM_BEFORE_RE = /(上午|早上|早晨|清晨|凌晨|半夜)\s*[：:，,]?\s*$/;
/* 段前紧邻的「晚上/夜里」：这时的 1-6 点已经过了零点，是次日凌晨 */
const LATE_BEFORE_RE = /(晚上|夜里|夜间|深夜)\s*[：:，,]?\s*$/;

function anchorDateOf(word) {
  const b = new Date(TODAY);
  b.setHours(0, 0, 0, 0);
  if (word === '前天') return addDays(b, -2);
  if (word === '大前天') return addDays(b, -3);
  if (word === '昨天' || word === '昨晚') return addDays(b, -1);
  if (word === '今早' || word === '今晚') return b;
  if (word === '明早' || word === '明晚') return addDays(b, 1);
  return resolveDate(word);   // 今天 / 明天 / 后天 / 大后天 / 周一 / 下周三…
}

/* 描述清尾：下一段的日期词、时段词和分隔符不该粘在本段描述末尾
   （「工作；这周二」→「工作」，「工作， 下午」→「工作」） */
const DESC_TAIL_NOISE = /[\s，,、;；:：。]*(?:大前天|前天|昨天|昨晚|今天|今早|今晚|明天|明早|明晚|(?:这|本|下)?(?:周|星期)[一二三四五六日]|上午|下午|中午|晚上|早上|早晨|傍晚|凌晨|夜里|夜间)[\s，,、;；:：。]*$/;

function cleanDesc(s) {
  let d = String(s || '').replace(/^[\s，,、;；:：。]+/, '');
  let prev = null;
  while (d !== prev) { prev = d; d = d.replace(DESC_TAIL_NOISE, ''); }
  return d.replace(/[\s，,、;；:：。]+$/, '').trim();
}

/** 解析出全部时间区间；无法判定为时间记录时返回 null */
function parseTimeRanges(text) {
  const t = String(text || '').trim();
  if (!t) return null;

  let work = t;
  let base = new Date(TODAY);
  let night = false;   // 夜间语境：小时 ≤12 要补 12，且可能是「上半夜→次日清晨」
  let lateCtx = false; // 真正过了晚上的语境（昨晚/今晚/晚上）：这时 1-6 点指次日凌晨
  let amCtx = false;   // 上午语境（今早/明早/早上…）：1-6 点就是凌晨，不能跳下午

  // 1) 句首日期基准 + 时段：「昨天下午：…」「昨晚…」「今早…」「今天上午…」
  const dm = work.match(/^\s*(前天|昨天|昨晚|今天|今早|今晨|今晚|明天|明早|明晚)\s*(上午|下午|中午|晚上|早上|早晨|傍晚|凌晨|夜里|夜间)?\s*[：:,，、]?\s*/);
  if (dm) {
    const w = dm[1];
    const part = dm[2] || '';
    if (w === '前天') base = addDays(TODAY, -2);
    if (w === '昨天' || w === '昨晚') base = addDays(TODAY, -1);
    if (w === '明天' || w === '明早' || w === '明晚') base = addDays(TODAY, 1);
    night = (w === '昨晚' || w === '今晚' || w === '明晚') || NIGHT_WORDS.test(part) || PM_WORDS.test(part);
    lateCtx = /^(昨晚|今晚|明晚)$/.test(w) || NIGHT_WORDS.test(part);
    amCtx = /^(今早|今晨|明早)$/.test(w) || /^(上午|早上|早晨|清晨|凌晨)/.test(part);
    work = work.slice(dm[0].length);
    // 「上午/早上」明确是上午语境，此时不补 12
    if (/^(上午|早上|早晨|凌晨)/.test(part)) { night = false; lateCtx = false; }
  }

  // 2) 统一分类：「这些都归类到学习中」→ 全部按学习记，并从描述里去掉这句
  let forcedCat = null;
  const cm = work.match(TIME_CAT_RE);
  if (cm) {
    forcedCat = CAT_BY_WORD[cm[1]];
    work = work.replace(cm[0], ' ');
  }

  // 3) 扫出所有区间
  const segs = [];
  SEG_RE.lastIndex = 0;
  let m;
  while ((m = SEG_RE.exec(work))) {
    const sh = +m[1], sm = m[2] ? +m[2] : 0;
    const eh = +m[3], em = m[4] ? +m[4] : 0;
    if (sh > 24 || eh > 24 || sm > 59 || em > 59) continue;
    segs.push({ i: m.index, j: SEG_RE.lastIndex, sh, sm, eh, em, hasColon: !!(m[2] || m[4]) });
  }
  if (!segs.length) return null;

  // 4) 防误判：只有一个「无冒号」区间时，要求是短句且不含数量词；
  //    长文本里全是裸数字对（「第2-4章」「5-6页」）时不当作时间流水
  if (segs.length === 1) {
    const s = segs[0];
    const looksTime = s.hasColon
      || (work.length <= 30 && !/[个元支张件块斤人次台只本袋瓶包箱]/.test(work));
    if (!looksTime) return null;
  }
  if (work.length >= LONG_TEXT && !segs.some(s => s.hasColon)) return null;

  /* 4.5) 正文里的日期锚点：「这周一 9-11 …；这周二 9-11 …」
     每出现一次日期词，后面各段就换到那一天。原来只认句首的「昨天/今天」，
     一段话跨两天时会全部算到今天。 */
  const anchors = [];
  ANCHOR_RE.lastIndex = 0;
  let am;
  while ((am = ANCHOR_RE.exec(work))) {
    const d = anchorDateOf(am[1]);
    if (d) anchors.push({ i: am.index, end: ANCHOR_RE.lastIndex, date: d, word: am[1] });
  }
  const anchorBefore = idx => {
    let hit = null;
    for (const a of anchors) { if (a.i < idx) hit = a; else break; }
    return hit;
  };

  // 5) 每段：描述 = 本区间结束 → 下一区间（或下一个日期词）之前的文字
  const rows = segs.map((s, k) => {
    const nextSeg = k + 1 < segs.length ? segs[k + 1] : null;
    // 日期词属于下一段，不能粘在本段描述尾巴上（「工作；这周二」→「工作」）
    const nextAnchor = anchors.find(a => a.i > s.j && (!nextSeg || a.i < nextSeg.i));
    const stopAt = Math.min(nextSeg ? nextSeg.i : work.length, nextAnchor ? nextAnchor.i : work.length);
    const desc = cleanDesc(work.slice(s.j, stopAt)) || '（未填写描述）';

    const anchor = anchorBefore(s.i);
    const rowBase = anchor ? anchor.date : base;

    /* 半天推断。中文口语里几乎不会说「凌晨 1-4」，说「1-4」就是下午一点到四点。
       判据只看紧邻这一段的几个字（±8 字窗口），避免被隔壁段落的时段词带跑：
         · 前面写了「下午/傍晚/晚上」→ 下午/晚上
         · 前面写了「上午/早上/凌晨」→ 就是上午，不补 12
         · 都没写，且起点落在 1~6 点 → 按下午算（1-4 = 13:00-16:00）
         · 都没写，起点是 12 点 → 中午（12-2 = 12:00-14:00）
         · 晚上语境里的 1-6 点 → 已经过零点，是次日凌晨（昨晚 1-4 = 次日 01:00-04:00） */
    const pre = work.slice(Math.max(0, s.i - 8), s.i);
    const amBefore = AM_BEFORE_RE.test(pre);
    const lateBefore = LATE_BEFORE_RE.test(pre);
    const evening = (night || PM_BEFORE_RE.test(pre)) && !amBefore;

    let sh = s.sh, eh = s.eh;
    let cross = false;
    let nextDay = false;

    if ((lateCtx || lateBefore) && !amBefore && !amCtx && sh >= 1 && sh <= 6 && (eh > sh || (eh === sh && s.em > s.sm))) {
      nextDay = true;              // 「昨晚 1-4」= 次日 01:00-04:00
    } else if (evening && sh < 12) {
      // 下午/晚上语境：「昨天下午 4-4:30」= 16:00→16:30；「昨晚11-7」= 23:00→次日07:00
      sh += 12;
      const startMin0 = sh * 60 + s.sm;
      const candEnd = (eh + 12) * 60 + s.em;   // 结束时刻按同半天理解
      if (candEnd > startMin0 && candEnd <= 1440) eh += 12;
      else if (eh * 60 + s.em <= startMin0) cross = true;
    } else if (sh === 12 && eh >= 1 && eh <= 6) {
      eh += 12;                    // 「12-2」= 12:00-14:00（不是次日凌晨两点）
    } else if (!amBefore && !amCtx && sh >= 1 && sh <= 6 && (eh > sh || (eh === sh && s.em > s.sm)) && eh <= 12) {
      sh += 12; eh += 12;          // 「1-4」= 13:00-16:00
    } else if (eh * 60 + s.em <= sh * 60 + s.sm) {
      cross = true; // 结束≤开始视为跨天（PRD F5-2）
    }

    // 分钟计时间轴：>1440 表示次日，便于做先后比较
    return {
      desc, sh, eh, sm: s.sm, em: s.em, cross, base: rowBase,
      st: sh * 60 + s.sm + (nextDay ? 1440 : 0),
      en: eh * 60 + s.em + (cross || nextDay ? 1440 : 0),
    };
  });

  // 6) 首段疑似笔误：「19-11:30」后面紧接「11:30-11:50」→ 起点其实是 9 点，多打了一个 1。
  //    判据很窄：跨天、超过 12 小时、且下一段起点正好等于它的终点。
  let note = '';
  if (rows.length > 1) {
    const a = rows[0], b = rows[1];
    if (a.cross && a.sh >= 13 && a.eh <= 12
        && (a.sh - 10) * 60 + a.sm <= a.eh * 60 + a.em
        && b.st === a.eh * 60 + a.em) {
      a.sh -= 10;
      a.st = a.sh * 60 + a.sm;
      a.en = a.eh * 60 + a.em;
      a.cross = false;
      note = `第 1 段按 ${a.sh}:${pad(a.sm)}-${a.eh}:${pad(a.em)} 记`;
    }
  }

  // 7) 时序校正：连续记录里后一段不会早于前一段结束，早于就按下午补 12 小时
  //    （「11:30-11:50，2-4，4-4:30」= 11:30 → 14:00 → 16:00）
  //    只对同一天内相邻的两段生效：跨日期词的两天之间不能这么推。
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i];
    if (cur.base.getTime() !== prev.base.getTime()) continue;
    if (cur.st < prev.en && cur.st + 720 >= prev.en && cur.en + 720 <= 1440) {
      cur.st += 720; cur.en += 720;
    }
  }

  const atOn = (b, min) => new Date(
    b.getFullYear(), b.getMonth(), b.getDate() + Math.floor(min / 1440),
    Math.floor(min / 60) % 24, min % 60
  );

  const items = rows.map(r => {
    const start = atOn(r.base, r.st);
    const end = atOn(r.base, r.en);
    return {
      start, end,
      dur: Math.round((end - start) / 60000),
      desc: r.desc,
      crossDay: r.cross,
      cat: forcedCat || guessCat(r.desc),
    };
  });

  return { items, base, forcedCat, note, raw: work.trim() };
}

/** 兼容旧接口：只取第一段 */
function parseTimeRange(text) {
  const r = parseTimeRanges(text);
  return r ? r.items[0] : null;
}

/* 吃饭、做饭、家务、睡觉、通勤这些每天都要做的事属于「生活」，不是「休闲」。
   休闲只留真正的消遣：游戏、电影、追剧、刷手机、散步运动。
   吃饭类放在最前面判定：哪怕写成「和客户吃饭」，吃饭依然是吃饭。 */
const LIFE_WORDS = /吃饭|用餐|午饭|午餐|晚饭|晚餐|早饭|早餐|夜宵|加餐|聚餐|请客|外卖|做饭|煮饭|买菜|洗碗|做菜|下厨|家务|收拾|打扫|洗衣|晾衣|睡觉|午睡|作息|通勤|洗澡|洗漱|理发|看病|挂号|买药|取药|带娃|遛狗|接送/;

function guessCat(text) {
  const t = String(text || '');
  if (LIFE_WORDS.test(t)) return 'life';
  if (/学习|看书|读书|复习|课程|背单词|听课|笔记|刷题/.test(t)) return 'study';
  if (/工作|开会|会议|方案|开发|联调|评审|写代码|回邮件|客户|需求|代码|文档|设计|测试|排查|交付|汇报|周报|UI|PRD/.test(t)) return 'work';
  if (/游戏|电影|追剧|玩|休息|刷|音乐|散步|运动/.test(t)) return 'leisure';
  return 'life';
}

/** 一段话里写了多本书 → 按书拆开。
 *  只有「行首的书名」才算一本新书：行内引用（如「7. 《小狗钱钱》里面说…」）不拆，
 *  否则会把书里提到的书名当成另一本。 */
function splitByBooks(text) {
  const re = /《([^》]{1,40})》/g;
  const marks = [];
  let m;
  while ((m = re.exec(text))) {
    const lineStart = text.lastIndexOf('\n', m.index) + 1;
    const before = text.slice(lineStart, m.index);
    // 书名前只允许出现空白 / 序号 / 标点，否则视为正文里的引用
    if (!/^[\s\d.、,，:：)）\-—·]*$/.test(before)) continue;
    const lineEnd = text.indexOf('\n', m.index);
    const rest = text.slice(m.index + m[0].length, lineEnd === -1 ? text.length : lineEnd).trim();
    // 只有「标题行」才算一本书：书名后面只剩作者名这类短尾巴。
    // 正文里顺手提到的书名（「7. 《小狗钱钱》里面说，…」）后面还跟着一整句，不拆。
    if (rest.length > 16 || /[，。；！？、,;!?]/.test(rest)) continue;
    marks.push({ i: m.index, book: m[1].trim() });
  }
  // 同一本书多次出现只保留第一处，避免拆成同一本的多个碎片
  const seen = new Set();
  const uniq = marks.filter(x => {
    const k = x.book.replace(/\s/g, '');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (uniq.length < 2) return null;
  return uniq.map((x, k) => ({
    book: x.book,
    content: text.slice(x.i, k + 1 < uniq.length ? uniq[k + 1].i : text.length).trim(),
  }));
}

function classify(text) {
  const t = text.trim();
  if (!t) return { type: 'empty' };
  // 0. 显式指令（完成/撤销）
  if (/^(已完成|完成)\s*第?\s*\d+\s*条?$/.test(t)) return { type: 'cmd_done', raw: t };
  // 1. 显式前缀
  if (/^(todo[:：]|#待办)/i.test(t)) return { type: 'todo', text: t.replace(/^(todo[:：]|#待办)/i, '').trim() };
  if (/^笔记[:：]/.test(t)) return { type: 'note', text: t.replace(/^笔记[:：]/, '').trim() };
  if (/^灵感[:：]/.test(t)) return { type: 'idea', text: t.replace(/^灵感[:：]/, '').trim() };
  // 1.5 带《书名》且不是随手一句话 → 读书笔记（要先于待办判断：
  //     书摘里常出现「今晚」「明天」「写下来」这类词，否则整段会被判成待办）
  if (/《[^》]{1,40}》/.test(t) && t.length >= 20) {
    const books = splitByBooks(t);
    if (books) return { type: 'note', text: t, multi: true, books };
    const bm = t.match(/《([^》]{1,40})》/);
    return { type: 'note', text: t, book: bm ? bm[1] : null };
  }
  // 1.6 快递取件码「3-2-2804」→ 待办。必须放在时间区间之前：
  //     否则会被当成「3 点到 2 点」的跨天记录，凭空算出 23 小时。
  if (PICKUP_CODE.test(t)) return { type: 'todo', text: t, pickup: true };
  // 2. 时间区间（可多段）：「10-11 学习」「昨天：19-11:30 文档，11:30-11:50 UI」
  const trs = parseTimeRanges(t);
  if (trs) {
    if (trs.items.length === 1) return { type: 'timelog', items: trs.items, note: trs.note, ...trs.items[0] };
    return { type: 'timelog', items: trs.items, note: trs.note };
  }
  // 3. 待办信号 + 日期词 / 多条拆分
  const parts = splitTodos(t);
  if (parts.length >= 2) return { type: 'todo', text: parts.join('，'), parts };
  if (DATE_WORDS.test(t) && TODO_WORDS.some(w => t.includes(w))) return { type: 'todo', text: t };
  // 3.5 短句带待办动作、但没有日期：也记为待办
  //     （否则「交房租」「买咖啡豆」这类最日常的输入会全掉进收件箱）
  if (t.length <= 30 && TODO_WORDS.some(w => t.includes(w))
      && !/我觉得|我认为|想到|意识到|感受|启发|本质|其实/.test(t)) {
    return { type: 'todo', text: t };
  }
  // 3.6 提到取件/快递的短句（「菜鸟驿站拿一下」「下班取快递」）也是待办。
  //     放在时间区间之后，这样「10-11 取快递」仍然记为时间消耗。
  if (t.length <= 40 && PICKUP_WORDS.test(t)) return { type: 'todo', text: t };
  // 4. 长文本 → 读书笔记（阈值对齐 PRD：classify_threshold 默认 120 字）
  if (t.length >= LONG_TEXT) {
    const bm = t.match(/《([^》]+)》/);
    return { type: 'note', text: t, book: bm ? bm[1] : null };
  }
  // 5. 思考信号
  if (/我觉得|我认为|想到|意识到|感受|启发|本质|其实/.test(t)) return { type: 'idea', text: t };
  // 6. 兜底：短文本一律记为待办
  //    理由：这个工具的第一用途就是随手记一件要做的事，短句里十有八九是待办。
  //    落进收件箱会让人「看不见自己记了什么」，比分类不准严重得多。
  if (t.length < LONG_TEXT) return { type: 'todo', text: t };
  return { type: 'inbox', text: t };
}

/* 带上「手动指定类型」的分类：自动判错时用户可以在输入框上直接改。
   手动指定只覆盖最终类型，仍然复用拆分 / 书名识别 / 时间区间解析，
   所以「周一交房租，周二开会」在手动选待办后依旧会拆成两条。 */
function classifyWith(text, force) {
  const t = String(text || '').trim();
  const auto = classify(t);
  if (!force) return auto;
  // 完成指令是操作而不是记录，任何手动类型都不该把它吃掉
  if (auto.type === 'cmd_done' || auto.type === 'empty') return auto;

  if (force === 'todo') {
    if (auto.type === 'todo' && !auto.forced) return { ...auto, forced: true };
    const parts = splitTodos(t);
    if (parts.length >= 2) return { type: 'todo', text: parts.join('，'), parts, forced: true };
    return { type: 'todo', text: t, forced: true };
  }
  if (force === 'note') {
    const books = splitByBooks(t);
    if (books) return { type: 'note', text: t, multi: true, books, forced: true };
    const bm = t.match(/《([^》]{1,40})》/);
    return { type: 'note', text: t, book: bm ? bm[1] : null, forced: true };
  }
  if (force === 'idea') return { type: 'idea', text: t, forced: true };
  if (force === 'timelog') {
    // 取件码不是时间：即使手动选了「时间消耗」也不能拿它当区间算
    if (PICKUP_CODE.test(t)) return { type: 'timelog', items: [], forced: true, error: 'norange' };
    const trs = parseTimeRanges(t);
    if (!trs || !trs.items.length) return { type: 'timelog', items: [], forced: true, error: 'norange' };
    if (trs.items.length === 1) return { type: 'timelog', items: trs.items, note: trs.note, forced: true, ...trs.items[0] };
    return { type: 'timelog', items: trs.items, note: trs.note, forced: true };
  }
  return auto;
}

/** 多待办拆分：以日期词为锚点 */
function splitTodos(text) {
  const re = /(大后天|后天|明天|今天|本周[一二三四五六日]|这周[一二三四五六日]|下周[一二三四五六日]|周[一二三四五六日]|星期[一二三四五六日])/g;
  const idx = [];
  let m;
  while ((m = re.exec(text))) idx.push({ i: m.index, w: m[0], len: m[0].length });
  if (idx.length < 2) return [];
  const out = [];
  idx.forEach((cur, k) => {
    const from = cur.i;
    const to = k + 1 < idx.length ? idx[k + 1].i : text.length;
    let seg = text.slice(from, to).replace(/[，,；;。\s]+$/, '').trim();
    if (seg.length >= 2) out.push(seg);
  });
  return out.length >= 2 ? out : [];
}

/** 日期词 → 具体日期（PRD F2-2 口径） */
function resolveDate(word) {
  const base = new Date(TODAY);
  base.setHours(0, 0, 0, 0);
  const wdOf = w => '日一二三四五六'.indexOf(w);
  if (word === '今天') return base;
  if (word === '明天') return addDays(base, 1);
  if (word === '后天') return addDays(base, 2);
  if (word === '大后天') return addDays(base, 3);

  // 注意：必须区分「下周一」与「周一」——前者前缀已吃掉"周"字，
  // 若写成 (本周|这周|下周)?(?:周|星期)(…) 会因回溯把"下周一"当"周一"处理
  let m = word.match(/(本周|这周|下周)([一二三四五六日])/);
  let prefix = m ? m[1] : null;
  let ch = m ? m[2] : null;
  if (!m) {
    m = word.match(/(?:周|星期)([一二三四五六日])/);
    if (!m) return null;
    ch = m[1];
  }
  const cur = (base.getDay() + 6) % 7; // 周一=0
  const tgt = (wdOf(ch) + 6) % 7;
  if (prefix === '本周' || prefix === '这周') return addDays(base, tgt - cur);
  if (prefix === '下周') return addDays(base, tgt - cur + 7);
  // 无修饰：向后取最近的一个该星期几（今天就是今天）
  return addDays(base, tgt >= cur ? tgt - cur : tgt - cur + 7);
}

function extractPlan(text) {
  const m = text.match(/(大后天|后天|明天|今天|本周[一二三四五六日]|这周[一二三四五六日]|下周[一二三四五六日]|周[一二三四五六日]|星期[一二三四五六日])/);
  if (!m) return null;
  return { word: m[1], date: resolveDate(m[1]) };
}

/* ============================================================
   3. 状态
   ============================================================ */
const state = {
  nav: 'todo',
  todoFilter: 'all',
  noteBook: null,     // 当前选中书名（电脑端）
  mNoteBook: null,    // 手机端书籍索引当前选中
  ideaCat: null,
  mIdeaCat: null,     // 手机端灵感分类当前选中
  timeTab: 'day',     // day | week | month（电脑端，默认日）
  mTimeTab: 'week',   // 手机端默认按周看，可切日/月
  timeOffset: 0,      // 日偏移
  weekOffset: 0,
  monthOffset: 0,
  timeSub: 'timeline', // timeline | list
  collapsedWeeks: {},
  /* 输入时手动指定的类型：{ desk: 'todo', m: null, quick: 'note' }
     只在「记录之前」生效，发出去就清空，避免下一次悄悄沿用错误的类型 */
  force: {},
  seq: 100,
};

/* 可手动指定的四类（收件箱不让人手选：它只是没判出来时的兜底） */
const FORCE_TYPES = [
  { k: 'todo', name: '待办事项', c: '#D97706' },
  { k: 'note', name: '读书笔记', c: '#4F46E5' },
  { k: 'idea', name: '灵感思考', c: '#7C3AED' },
  { k: 'timelog', name: '时间消耗', c: '#059669' },
];
const TYPE_LABEL = {
  todo: '待办事项', note: '读书笔记', idea: '灵感思考', timelog: '时间消耗',
  inbox: '待确认', cmd_done: '完成指令',
};
const TYPE_CLS = {
  todo: 't-todo', note: 't-note', idea: 't-idea', timelog: 't-timelog', cmd_done: 't-todo',
};

/* ============================================================
   4. 渲染 · 待办
   ============================================================ */
/* 未完成待办：最新记的排最前面（刚记下的事就该摆在眼前），电脑端与手机端共用 */
function pendingTodos() {
  return todos.filter(t => !t.done).sort((a, b) => b.createdAt - a.createdAt || b.id - a.id);
}

function renderTodo() {
  const pending = pendingTodos();
  const done = todos.filter(t => t.done);

  // 周分组
  const groups = {};
  done.forEach(t => {
    const k = weekKey(t.doneAt);
    (groups[k] = groups[k] || []).push(t);
  });
  const weekKeys = Object.keys(groups).sort().reverse();

  let html = '';

  if (state.todoFilter !== 'done') {
    html += `<div class="filter-row">
      <button class="chip ${state.todoFilter === 'all' ? 'on' : ''}" data-tf="all">全部</button>
      <button class="chip" data-tf="today">今天到期</button>
      <button class="chip" data-tf="overdue">已逾期</button>
      <div style="flex:1"></div>
      <span class="meta">未完成：最新记的在最前</span>
    </div>`;
    html += `<div class="section-title">未完成 <span class="cnt">${pending.length}</span><span class="line"></span></div>`;
    html += `<div class="todo-list">${pending.map(t => todoRow(t)).join('') || emptyBox('没有未完成的待办')}</div>`;
  }

  if (state.todoFilter !== 'pending') {
    html += `<div class="section-title" style="margin-top:26px">已完成 <span class="cnt">按周分组</span><span class="line"></span></div>`;
    weekKeys.forEach(k => {
      const list = groups[k].sort((a, b) => b.doneAt - a.doneAt);
      const ws = weekStart(list[0].doneAt);
      const we = addDays(ws, 6);
      const isThis = k === weekKey(TODAY);
      const col = state.collapsedWeeks[k];
      html += `<div class="week-group">
        <div class="week-head">
          <span class="wk">${isThis ? '本周' : k}</span>
          <span>${fmtMD(ws)} – ${fmtMD(we)}</span>
          <span class="line"></span>
          <span>${list.length} 项</span>
          <button class="toggle" data-wk="${k}">${col ? '展开' : '收起'}</button>
        </div>
        <div class="todo-list" ${col ? 'style="display:none"' : ''}>${list.map(t => todoRow(t)).join('')}</div>
      </div>`;
    });
  }

  $('#deskContent').innerHTML = html;
}

function todoRow(t) {
  const p = t.plan;
  let planCls = '', planTxt = '';
  if (p) {
    const isPast = p < TODAY && !t.done;
    const isToday = sameDay(p, TODAY);
    planCls = isPast ? 'past' : isToday ? 'today' : '';
    planTxt = `${fmtMD(p)} 周${WEEK_CN[p.getDay()]}`;
  }
  return `<div class="todo ${t.done ? 'done' : ''}" data-id="${t.id}">
    <div class="todo-box" data-act="toggle">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4"><path d="M20 6L9 17l-5-5"/></svg>
    </div>
    <div class="todo-body">
      <div class="todo-text">${esc(t.text)}</div>
      <div class="todo-meta">
        ${p ? `<span class="plan-date ${planCls}">${planTxt}</span>` : ''}
        <span class="todo-time">${fmtMDHM(t.createdAt)} 创建</span>
        ${t.done ? `<span class="done-time">· ${fmtMDHM(t.doneAt)} 完成</span>` : ''}
        ${t.splitSeq ? `<span class="split-tag">拆分 ${t.splitSeq}</span>` : ''}
      </div>
    </div>
    <div class="todo-ops">
      <button class="op-btn" data-act="edit" title="修改"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg></button>
      <button class="op-btn danger" data-act="del" title="删除"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
    </div>
  </div>`;
}

function emptyBox(txt) {
  return `<div style="padding:34px 0;text-align:center;color:var(--text-4);font-size:12.5px">${txt}</div>`;
}

/* 书名排序：中文按拼音、英文按字母，手机与电脑保持同一顺序 */
function bookSort(list) {
  const arr = [...list];
  try { return arr.sort((a, b) => String(a).localeCompare(String(b), 'zh-Hans-CN')); }
  catch (e) { return arr.sort(); }
}

/* ============================================================
   5. 渲染 · 读书笔记 / 灵感
   ============================================================ */
function renderNote() {
  const books = {};
  notes.forEach(n => { const k = n.book || '__unfiled'; (books[k] = books[k] || []).push(n); });
  const keys = bookSort(Object.keys(books).filter(k => k !== '__unfiled'));
  if (books.__unfiled) keys.push('__unfiled');

  const cur = state.noteBook;
  const list = cur ? notes.filter(n => (cur === '__unfiled' ? !n.book : n.book === cur)) : notes;
  const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);

  let stream = '';
  if (!cur) {
    // 全部：按书分组展示
    sorted.forEach(n => { stream += noteCard(n); });
  } else {
    stream = sorted.map(n => noteCard(n, true)).join('') || emptyBox('这本书还没有笔记');
  }

  $('#deskContent').innerHTML = `<div class="two-col">
    <div>
      <div class="filter-row">
        <button class="chip ${!cur ? 'on' : ''}" data-book="">全部笔记</button>
        <span class="meta" style="margin-left:auto">共 ${sorted.length} 条 · 点内容即可修改</span>
      </div>
      <div class="notes-stream" style="max-height:calc(100vh - 330px);overflow-y:auto;padding-right:4px">${stream}</div>
    </div>
    <aside class="note-index">
      <h4>书籍索引</h4>
      <button class="idx-item ${!cur ? 'on' : ''}" data-book="">全部 <span class="n">${notes.length}</span></button>
      ${keys.map(k => {
        const name = k === '__unfiled' ? '未整理' : k;
        const cl = k === '__unfiled' ? 'var(--text-4)' : 'var(--brand)';
        return `<button class="idx-item ${cur === k ? 'on' : ''}" data-book="${esc(k)}">
          <span class="idx-book" style="background:${cl}"></span>${esc(name)}<span class="n">${books[k].length}</span></button>`;
      }).join('')}
    </aside>
  </div>`;
}

function noteCard(n, showBook) {
  return `<div class="note-card" data-nid="${n.id}">
    <div class="note-head">
      ${n.book ? `<span class="book-name">《${esc(n.book)}》</span>` : `<span class="book-name unfiled">未整理</span>`}
      <span class="meta">${fmtMDHM(n.createdAt)}</span>
      <div style="flex:1"></div>
      <div class="todo-ops">
        <button class="op-btn" data-act="edit" title="修改" aria-label="修改"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg></button>
        <button class="op-btn danger" data-act="del" title="删除" aria-label="删除"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
      </div>
    </div>
    <div class="note-content" data-act="edit" title="点击修改">${esc(n.content)}</div>
    <div class="note-foot"><span class="src-chip">${n.book ? '已归档' : '待归档'}</span><button class="btn btn-ghost" data-act="file" style="height:24px;padding:0 8px;font-size:11.5px">${n.book ? '更改书籍' : '归入书籍'}</button></div>
  </div>`;
}

function ideaCard(n) {
  return `<div class="note-card" data-iid="${n.id}">
    <div class="note-head">
      <span class="cat-name">${esc(n.cat || '未分类')}</span>
      <span class="meta">${fmtMDHM(n.createdAt)}</span>
      <div style="flex:1"></div>
      <div class="todo-ops">
        <button class="op-btn" data-act="edit" title="修改" aria-label="修改"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg></button>
        <button class="op-btn danger" data-act="del" title="删除" aria-label="删除"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
      </div>
    </div>
    <div class="note-content" data-act="edit" title="点击修改">${esc(n.content)}</div>
  </div>`;
}

/* 灵感分类索引的取名规则：库里已有的分类（含还没放灵感的空分类）+ 灵感里出现的分类。
   只按灵感反推的话，新建完的空分类在页面上根本看不见，用户会以为「新建没反应」。 */
function ideaCatNames(list) {
  const names = new Set();
  (list || []).forEach(n => { if (n.cat) names.add(n.cat); });
  (typeof cats !== 'undefined' ? cats : []).forEach(c => { if (c && c.name) names.add(c.name); });
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

/* 编辑弹层里的分类下拉选项：全部已有分类 + 「新建分类」入口。
   必须包含还没放灵感的空分类，否则刚建好的分类在这里选不到。 */
function catOptionsHtml(cur) {
  const names = ideaCatNames(ideas);
  return `<option value="">（不分类）</option>`
    + names.map(k => `<option value="${esc(k)}" ${cur === k ? 'selected' : ''}>${esc(k)}</option>`).join('')
    + `<option value="__new__">＋ 新建分类…</option>`;
}

function renderIdea() {
  const byCat = {};
  ideas.forEach(n => { const k = n.cat || '待归类'; (byCat[k] = byCat[k] || []).push(n); });
  const keys = ideaCatNames(ideas);
  const cur = state.ideaCat;
  const list = cur ? ideas.filter(n => (n.cat || '待归类') === cur) : ideas;
  const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
  const empty = cur
    ? `这个分类还没有灵感<br><span class="empty-sub">在下面输入框记一条，会自动归到「${esc(cur)}」</span>`
    : '还没有灵感<br><span class="empty-sub">写点想法，会自动识别</span>';

  $('#deskContent').innerHTML = `<div class="two-col">
    <div>
      <div class="filter-row">
        <button class="chip ${!cur ? 'on' : ''}" data-cat="">全部灵感</button>
        <div style="flex:1"></div>
        <span class="meta">共 ${sorted.length} 条 · 按创建时间倒序</span>
      </div>
      <div class="notes-stream" style="max-height:calc(100vh - 330px);overflow-y:auto;padding-right:4px">
        ${sorted.map(n => ideaCard(n)).join('') || emptyBox(empty)}
      </div>
    </div>
    <aside class="note-index">
      <h4>分类索引</h4>
      <button class="idx-item ${!cur ? 'on' : ''}" data-cat="">全部 <span class="n">${ideas.length}</span></button>
      ${keys.map(k => `<button class="idx-item ${cur === k ? 'on' : ''}" data-cat="${esc(k)}">
        <span class="idx-book" style="background:#7C3AED"></span>${esc(k)}<span class="n">${(byCat[k] || []).length}</span></button>`).join('')}
      <button class="idx-item idx-new" data-newcat type="button">＋ 新建分类</button>
    </aside>
  </div>`;
}

/* ============================================================
   6. 渲染 · 时间消耗
   ============================================================ */
function logsOn(date) {
  return logs.filter(l => sameDay(l.start, date));
}

function statOf(list) {
  const s = { study: 0, work: 0, leisure: 0, life: 0 };
  list.forEach(l => { s[l.cat] += l.dur; });
  const total = Object.values(s).reduce((a, b) => a + b, 0);
  return { s, total };
}

/** 按维度算出：基准日、标签、范围内的记录、当前偏移（电脑端与手机端共用） */
function timeScope(tab) {
  const isDay = tab === 'day';
  const isWeek = tab === 'week';
  let refDate = new Date(TODAY), label = '', scope = [], offs = 0;

  if (isDay) {
    offs = state.timeOffset;
    refDate = addDays(TODAY, offs);
    label = `${refDate.getMonth() + 1}月${refDate.getDate()}日 周${WEEK_CN[refDate.getDay()]}`;
    scope = logsOn(refDate);
  } else if (isWeek) {
    offs = state.weekOffset;
    const ws = addDays(weekStart(TODAY), offs * 7);
    refDate = ws;
    const we = addDays(ws, 6);
    label = `${fmtMD(ws)} – ${fmtMD(we)}`;
    scope = logs.filter(l => l.start >= ws && l.start < addDays(ws, 7));
  } else {
    offs = state.monthOffset;
    const y = TODAY.getFullYear(), m = TODAY.getMonth() + offs;
    refDate = new Date(y, m, 1);
    label = `${refDate.getFullYear()}年${refDate.getMonth() + 1}月`;
    scope = logs.filter(l => l.start.getFullYear() === refDate.getFullYear() && l.start.getMonth() === refDate.getMonth());
  }
  return { isDay, isWeek, isMonth: !isDay && !isWeek, refDate, label, scope, offs, unit: isDay ? '今日' : isWeek ? '本周' : '本月' };
}

function renderTime() {
  const { isDay, isWeek, isMonth, refDate, label, scope, offs, unit } = timeScope(state.timeTab);

  const { s, total } = statOf(scope);
  const pct = k => total ? (s[k] / total * 100) : 0;

  const statHtml = `<div class="stat-card">
    <div class="stat-head">
      <span class="stat-total">${fmtDur(total)}<small>${unit}总计</small></span>
      <div style="flex:1"></div>
      <span class="meta">${scope.length} 条记录</span>
    </div>
    <div class="stat-grid">
      ${['study', 'work', 'leisure', 'life'].map(k => `<div class="stat-item">
        <span class="k"><span style="width:7px;height:7px;border-radius:2px;background:${CAT[k].c}"></span>${CAT[k].name}</span>
        <span class="v" style="color:${s[k] ? CAT[k].c : 'var(--text-4)'}">${fmtDur(s[k])}</span>
      </div>`).join('')}
    </div>
    <div class="stackbar">
      ${['study', 'work', 'leisure', 'life'].map(k => s[k] ? `<span style="width:${pct(k)}%;background:${CAT[k].c}"></span>` : '').join('')}
    </div>
  </div>`;

  let body = '';
  if (isDay) body = dayView(refDate);
  else if (isWeek) body = weekView(refDate);
  else body = monthView(refDate);

  $('#deskContent').innerHTML = `
    <div class="filter-row" style="margin-bottom:14px">
      <div class="tabs">
        <button data-tt="day" class="${isDay ? 'on' : ''}">日</button>
        <button data-tt="week" class="${isWeek ? 'on' : ''}">周</button>
        <button data-tt="month" class="${isMonth ? 'on' : ''}">月</button>
      </div>
      <div class="tl-nav" style="margin-bottom:0;margin-left:8px">
        <button class="btn btn-ghost btn-icon" data-off="-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <span class="tl-date">${label}</span>
        <button class="btn btn-ghost btn-icon" data-off="1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg></button>
        ${offs !== 0 ? `<button class="btn btn-outline" data-off="reset" style="height:26px;font-size:11.5px">回到今天</button>` : ''}
      </div>
      <div style="flex:1"></div>
      <div class="tabs">
        <button data-ts="timeline" class="${state.timeSub === 'timeline' ? 'on' : ''}">时间轴</button>
        <button data-ts="list" class="${state.timeSub === 'list' ? 'on' : ''}">流水</button>
      </div>
    </div>
    ${statHtml}
    ${state.timeSub === 'list' ? logList(scope) : body}
  `;
}

function dayView(date) {
  const H = 840; // 24h 高度（1h≈35px，短时段才有空间显示文字）
  const yOf = d => (d.getHours() + d.getMinutes() / 60) / 24 * H;
  const list = logsOn(date).slice().sort((a, b) => a.start - b.start);

  const blocks = list.map((l, i) => {
    const top = yOf(l.start);
    const bottom = l.crossDay ? H : yOf(l.end);
    const nextTop = i + 1 < list.length ? yOf(list[i + 1].start) : H;
    const gap = Math.max(nextTop - top, 6);

    let h = Math.max(bottom - top, 20);   // 至少留一行字的高度
    let narrow = false;
    if (h >= gap) {                        // 撑太高会压住下一条，按实际间隔收
      if (gap >= 18) h = gap - 1;
      else { narrow = true; h = Math.max(gap - 1, 12); }
    }
    const tight = narrow || (bottom - top) < 38;   // 短时段：时间与描述合成一行
    const range = `${pad(l.start.getHours())}:${pad(l.start.getMinutes())}–${l.crossDay ? '次日 ' : ''}${pad(l.end.getHours())}:${pad(l.end.getMinutes())}`;
    const body = tight
      ? `<div class="bt">${narrow ? '' : range + ' '}${esc(l.desc)}${l.crossDay ? ' <span style="font-size:9px">↷</span>' : ''}</div>`
      : `<div class="bt">${esc(l.desc)}${l.crossDay ? ' <span style="font-size:9px">↷跨天</span>' : ''}</div>
      <div class="bs">${range} · ${fmtDur(l.dur)}</div>`;

    const side = narrow ? (i % 2 ? 'left:52%;right:5px' : 'left:5px;right:49%') : '';
    return `<div class="tl-block ${tight ? 'tight' : ''} ${narrow ? 'narrow' : ''}" style="top:${top}px;height:${h}px;${side};background:${CAT[l.cat].bg};border-color:${CAT[l.cat].c};color:${CAT[l.cat].c}" title="${esc(l.desc)} ${range} · ${fmtDur(l.dur)}">${body}</div>`;
  }).join('');

  const hours = Array.from({ length: 25 }, (_, i) =>
    `<div class="hour-line ${i % 1 ? 'half' : ''}" style="top:${i / 24 * H}px"></div>`).join('');
  const hourLabels = Array.from({ length: 25 }, (_, i) =>
    i % 3 === 0 ? `<span style="top:${i / 24 * H}px">${pad(i)}:00</span>` : '').join('');

  const nowTop = sameDay(date, TODAY) ? (NOW.getHours() + NOW.getMinutes() / 60) / 24 * H : -10;

  return `<div class="day-wrap">
    <div class="hour-col" style="height:${H}px">${hourLabels}</div>
    <div class="day-track" style="height:${H}px">
      ${hours}
      ${nowTop > 0 ? `<div class="now-line" style="top:${nowTop}px"></div>` : ''}
      ${blocks || `<div style="position:absolute;inset:0;display:grid;place-items:center;color:var(--text-4);font-size:12.5px">这一天没有记录 —— 时间轴刻度不变</div>`}
    </div>
  </div>
  <div class="meta" style="margin-top:9px">刻度固定 0:00–24:00，没有记录的时段留白但不压缩（PRD F5-3 硬约束）</div>`;
}

/** 周视图。compact=true 为手机窄屏：列更窄、块内文字截断、点某天进当天 */
function weekView(ws, compact) {
  const H = compact ? 460 : 520;
  const yOf = d => (d.getHours() + d.getMinutes() / 60) / 24 * H;
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const gutW = compact ? 26 : 42;

  const head = (compact
    ? `<div class="wk-head-gut"></div>` + days.map((d, i) => {
      const t = statOf(logsOn(d)).total;
      return `<button class="wk-head wk-head-btn ${sameDay(d, TODAY) ? 'today' : ''}" type="button" data-mday="${i}">
        <div class="d">${WEEK_CN[d.getDay()]}</div>
        <div class="n">${d.getDate()}</div>
        <div class="wk-t" style="color:${t ? 'var(--text-2)' : 'var(--text-4)'}">${t ? fmtDur(t) : '—'}</div>
      </button>`;
    }).join('')
    : `<div style="border-bottom:1px solid var(--line)"></div>` + days.map(d =>
      `<div class="wk-head ${sameDay(d, TODAY) ? 'today' : ''}">
        <div class="d">周${WEEK_CN[d.getDay()]}</div><div class="n">${d.getDate()}</div>
      </div>`).join(''));

  // 手机窄屏只标 6/12/18 点：0 点与 24 点在边缘，标签会被裁掉一半
  const gutTicks = compact ? [6, 12, 18] : Array.from({ length: 9 }, (_, i) => i * 3);
  const hourGut = `<div style="position:relative;height:${H}px;border-right:1px solid var(--line)">${gutTicks.map(hh =>
    `<span style="position:absolute;right:${compact ? 3 : 6}px;top:${hh / 24 * H}px;transform:translateY(-50%);font-size:${compact ? 9 : 10}px;color:var(--text-4)" class="mono">${pad(hh)}</span>`).join('')}</div>`;

  // 每列：横线 + 色块
  const cols = days.map((d, i) => {
    const lines = Array.from({ length: 25 }, (_, k) =>
      `<div class="hour-line ${compact && k % 6 ? 'dim' : ''}" style="top:${k / 24 * H}px"></div>`).join('');
    const blocks = logsOn(d).map(l => {
      const top = yOf(l.start);
      const h = Math.max((l.crossDay ? H : yOf(l.end)) - top, 14);
      // 窄屏只放得下几个字，超出截断；完整内容在 title 里
      const txt = compact ? (h >= 13 ? esc(l.desc.slice(0, h >= 30 ? 6 : 3)) : '') : esc(l.desc);
      return `<div class="wk-block" style="top:${top}px;height:${h}px;background:${CAT[l.cat].bg};border-color:${CAT[l.cat].c};color:${CAT[l.cat].c}" title="${esc(l.desc)} ${pad(l.start.getHours())}:${pad(l.start.getMinutes())}–${pad(l.end.getHours())}:${pad(l.end.getMinutes())}">${txt}</div>`;
    }).join('');
    return `<div class="wk-lane ${sameDay(d, TODAY) ? 'today' : ''}" style="height:${H}px" ${compact ? `data-mday="${i}"` : ''}>${lines}${blocks}</div>`;
  }).join('');

  const nowTop = (NOW.getHours() + NOW.getMinutes() / 60) / 24 * H;
  const grid = `grid-template-columns:${gutW}px repeat(7,1fr)`;

  return `<div class="week-wrap ${compact ? 'compact' : ''}">
    <div class="week-grid" style="${grid}">${head}</div>
    <div class="week-grid" style="${grid};${compact ? '' : `max-height:${H}px;overflow-y:auto`}">
      ${hourGut}${cols}
    </div>
  </div>
  <div class="meta" style="margin-top:9px">${compact ? '点某一天看当天时间轴；纵向刻度固定，无记录不压缩' : '7×24 网格，每格代表 1 小时；纵向刻度固定，无记录不压缩'}</div>`;
}

function monthView(first) {
  const y = first.getFullYear(), m = first.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const start = addDays(new Date(y, m, 1), -firstDow);
  const cells = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));

  const maxMin = Math.max(...cells.map(d => statOf(logsOn(d)).total), 1);

  const dow = ['一', '二', '三', '四', '五', '六', '日'].map(d => `<div class="month-dow">${d}</div>`).join('');

  const body = cells.map(d => {
    const out = d.getMonth() !== m;
    const list = logsOn(d);
    const { s, total } = statOf(list);
    const bars = ['study', 'work', 'leisure', 'life']
      .filter(k => s[k])
      .map(k => `<span style="width:${Math.max(6, s[k] / maxMin * 100)}%;background:${CAT[k].c}"></span>`).join('');
    return `<div class="month-cell ${out ? 'out' : ''} ${sameDay(d, TODAY) ? 'today' : ''}" data-day="${d.toISOString()}">
      <div class="md">${d.getDate()}${total ? `<span class="sum">${fmtDur(total)}</span>` : ''}</div>
      <div class="mbar">${bars}</div>
    </div>`;
  }).join('');

  return `<div class="month-grid">${dow}${body}</div>
  <div class="meta" style="margin-top:9px">点击任意日期下钻到日视图；条形长度与该日总时长成正比</div>`;
}

function logList(scope) {
  if (!scope.length) return emptyBox('这一范围内没有时间记录');
  return [...scope].sort((a, b) => b.start - a.start).map(l => `<div class="log-row" data-lid="${l.id}">
    <span class="log-cat" style="background:${CAT[l.cat].c}"></span>
    <span class="log-time mono">${fmtMD(l.start)} ${pad(l.start.getHours())}:${pad(l.start.getMinutes())}${l.crossDay ? ' → 次日 ' + pad(l.end.getHours()) + ':00' : '–' + pad(l.end.getHours()) + ':' + pad(l.end.getMinutes())}</span>
    <span class="log-dur mono" style="color:${CAT[l.cat].c}">${fmtDur(l.dur)}</span>
    <span class="log-tag" style="background:${CAT[l.cat].bg};color:${CAT[l.cat].c}">${CAT[l.cat].name}</span>
    <span class="log-desc">${esc(l.desc)}${l.crossDay ? ' <span class="split-tag">跨天</span>' : ''}</span>
    <div class="todo-ops">
      <button class="op-btn" data-act="edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg></button>
      <button class="op-btn danger" data-act="del"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg></button>
    </div>
  </div>`).join('');
}

/* ============================================================
   7. 渲染 · 原始消息
   ============================================================ */
const TYPE_STYLE = {
  todo: ['待办', '#FEF3C7', '#92400E'],
  note: ['笔记', '#E0E7FF', '#3730A3'],
  idea: ['灵感', '#EDE9FE', '#5B21B6'],
  timelog: ['时间', '#D1FAE5', '#065F46'],
  inbox: ['未归类', '#FEE2E2', '#B91C1C'],
};

function renderAll() {
  const list = messages.length ? messages : [];
  const inboxN = list.filter(m => m.type === 'inbox').length;
  if (!list.length) {
    $('#deskContent').innerHTML = `<div class="empty-state">
      <div class="empty-title">还没有消息</div>
      <div class="empty-sub">在上面输入框记一条，原文会原封不动地留在这里</div>
    </div>`;
    return;
  }
  $('#deskContent').innerHTML = `<div class="filter-row">
      <span class="meta">原文零删改保留（PRD F1-2）· 共 ${list.length} 条${inboxN ? ` · <b style="color:#B91C1C">${inboxN} 条待归类</b>` : ''}</span>
    </div>
  ${list.map(m => {
    const [name, bg, fg] = TYPE_STYLE[m.type] || TYPE_STYLE.inbox;
    const needSort = m.type === 'inbox';
    return `<div class="note-card" style="padding:11px 14px" data-msg="${m.id}">
    <div class="note-head" style="margin-bottom:5px">
      <span class="src-chip" style="background:${bg};color:${fg}">${name}</span>
      <span class="meta">${fmtMDHM(m.at)}</span>
      ${needSort ? `<span class="meta" style="margin-left:auto;margin-right:6px">归到：</span>
        <button class="mini-btn" data-sort="${m.id}" data-as="todo">待办</button>
        <button class="mini-btn" data-sort="${m.id}" data-as="time">时间</button>
        <button class="mini-btn" data-sort="${m.id}" data-as="note">笔记</button>
        <button class="mini-btn" data-sort="${m.id}" data-as="idea">灵感</button>
        <button class="mini-btn" data-sort="${m.id}" data-as="del">删除</button>`
      : `<span class="src-chip" style="margin-left:auto">${m.channel}</span>`}
    </div>
    <div class="note-content" style="font-size:13px">${esc(m.content)}</div>
  </div>`;
  }).join('')}`;
}

/* ============================================================
   8. 主渲染调度
   ============================================================ */
const TITLES = {
  todo: ['待办事项', () => {
    const done = todos.filter(t => t.done).length;
    return `共 ${todos.length} 条 · 未完成 ${todos.length - done} · 已完成 ${done}`;
  }],
  note: ['读书笔记', () => `${Object.keys(notes.reduce((o, n) => (o[n.book || '_'] = 1, o), {})).length} 本书 · 共 ${notes.length} 条`],
  idea: ['灵感思考', () => `${new Set(ideas.map(i => i.cat)).size} 个分类 · 共 ${ideas.length} 条`],
  time: ['时间消耗', () => '日 / 周 / 月 · 时间轴与统计'],
  all: ['原始消息', () => '全部消息原文，只读'],
};

function renderDesk() {
  const [t, sub] = TITLES[state.nav] || TITLES.todo;
  $('#pageTitle').textContent = t;
  $('#pageSub').textContent = sub();

  $$('.nav-item').forEach(b => b.classList.toggle('on', b.dataset.nav === state.nav));

  if (state.nav === 'todo') renderTodo();
  else if (state.nav === 'note') renderNote();
  else if (state.nav === 'idea') renderIdea();
  else if (state.nav === 'time') renderTime();
  else renderAll();

  $('#cnt-todo').textContent = todos.filter(t => !t.done).length;
  $('#cnt-note').textContent = notes.length;
  $('#cnt-idea').textContent = ideas.length;
  $('#cnt-time').textContent = logs.length;
}

/* ============================================================
   9. 发送消息
   ============================================================ */
/* 写入前必须有登录态。
   事故复盘：手机端曾带着失效的登录态继续写入，云端把它按匿名(owner_id='anon')入库，
   而登录用户只能读 owner_id = 自己的行 —— 数据写成功了，但在界面上永久消失。
   所以宁可拦下来让用户重新登录，也不能产生看不见的数据。 */
async function ensureSignedIn() {
  try {
    const { session } = await getSession();
    if (session && session.user) {
      dbg('session-OK', String(session.user.id || ''));
      return true;
    }
  } catch (e) { dbg('session-check-FAIL', errText(e)); }
  // 掉线先抢救一次：用刷新令牌换新的访问令牌，成功就当没发生过
  if (await tryRestoreSession()) {
    dbg('session-RESTORED', '刷新令牌换回了新会话');
    return true;
  }
  dbg('session-MISSING', '将阻止本次写入');
  showLogin();
  setLoginError('登录状态已失效，请重新登录后再记录。你刚才输入的内容还在输入框里，登录后重新点发送即可。');
  showDiag(true);
  return false;
}

/* 提交一条消息：原文先落库（全链路只读）→ 再结构化入库 → 返回提示
   force：用户在输入框上手动指定的类型（null = 用自动识别结果） */
async function submit(raw, force) {
  const text = raw.trim();
  if (!text) return null;
  if (!(await ensureSignedIn())) throw new Error('登录状态已失效，请重新登录后再记录');
  const r = classifyWith(text, force);
  dbg('submit', `type=${r.type}${force ? '(手动)' : ''} len=${text.length} text=${text.slice(0, 40)}`);

  if (r.type === 'cmd_done' || r.type === 'empty') {
    return { kind: 'noop', msg: '这条指令需要在查看待办后使用', cls: 'warn' };
  }
  // 手动记成时间消耗，但这段里没有可解析的区间：不落库，提示怎么写
  if (r.error === 'norange') {
    throw new Error('没找到时间区间，写成「10-11 学习」或「昨天下午 2-4 写方案」这样就能记');
  }

  let msgId;
  try {
    msgId = await addMessage(text, r.type, { confidence: 0.9 });
    dbg('addMessage-OK', 'id=' + msgId);
  } catch (err) {
    dbg('addMessage-FAIL', errText(err));
    throw err;
  }
  messages.unshift({ id: msgId, content: text, type: r.type, channel: 'web', at: new Date() });

  if (r.type === 'todo') {
    const segs = r.parts || [r.text];
    let lastPlan = null;
    const added = [];
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const p = extractPlan(s);
      // 无日期词的分片继承上一个日期（保持"周一…，然后…"的语义）
      const plan = p ? p.date : (segs.length > 1 ? lastPlan : null);
      if (p) lastPlan = p.date;
      const txt = s.replace(/(大后天|后天|明天|今天|本周[一二三四五六日]|这周[一二三四五六日]|下周[一二三四五六日]|周[一二三四五六日]|星期[一二三四五六日])[，,：:\s]*/g, '').trim() || s;
      const item = await addTodo({ text: txt, plan, seq: segs.length > 1 ? i + 1 : 0, messageId: msgId });
      todos.push(item);
      added.push(item);
    }
    if (segs.length > 1) return { kind: 'todo-multi', items: added, msg: `已拆分为 ${added.length} 条待办` };
    const tail = added[0].plan ? '，计划 ' + fmtMD(added[0].plan) : (r.pickup ? ' · 取件码' : '');
    return { kind: 'todo', msg: `已记为待办${tail}` };
  }

  if (r.type === 'timelog') {
    const items = (r.items && r.items.length) ? r.items : [r];
    const added = [];
    for (const it of items) {
      const cat = it.cat || guessCat(it.desc);
      const row = await addTimeLog({
        desc: it.desc, start: it.start, end: it.end, dur: it.dur,
        cat, crossDay: it.crossDay, messageId: msgId,
      });
      logs.push(row);
      added.push(row);
    }
    const nameOf = x => (CAT[x.cat] ? CAT[x.cat].name : '');
    const extra = r.note ? ` · ${r.note}` : '';
    if (added.length === 1) {
      return { kind: 'timelog', msg: `已记 ${fmtDur(added[0].dur)} · ${nameOf(added[0])}${added[0].crossDay ? ' · 跨天' : ''}${extra}` };
    }
    const sum = added.reduce((a, b) => a + b.dur, 0);
    const cats = [...new Set(added.map(nameOf).filter(Boolean))];
    // 时长异常（>12h 且不像睡觉）：多半把 9 写成了 19 这类笔误，明确提示而不是悄悄算错
    const odd = added.find(x => x.dur > 720 && !/睡|休息|夜里|凌晨|通宵/.test(x.desc || ''));
    const tip = odd ? ` · 第 ${added.indexOf(odd) + 1} 段 ${fmtDur(odd.dur)} 偏长，可在时间页点开改` : '';
    return { kind: 'timelog-multi', items: added, msg: `已记 ${added.length} 条 · 共 ${fmtDur(sum)} · ${cats.join('/')}${extra}${tip}` };
  }

  if (r.type === 'note') {
    // 一段话写了多本书：每本单独一条，书摘才能按书索引
    if (r.multi && r.books && r.books.length > 1) {
      const added = [];
      for (const b of r.books) {
        added.push(await addNote({ content: b.content, bookName: b.book, messageId: msgId }));
      }
      notes.push(...added);
      return {
        kind: 'note',
        msg: `已拆成 ${added.length} 条笔记：${r.books.map(b => `《${b.book}》`).join('、')}`,
      };
    }
    const item = await addNote({ content: r.text, bookName: r.book || null, messageId: msgId });
    notes.push(item);
    return { kind: 'note', msg: r.book ? `已归入《${r.book}》` : '已记为读书笔记（未整理）' };
  }

  if (r.type === 'idea') {
    // 正停在某个分类下记的灵感，直接归到这个分类（省得记完再逐条改）
    const catName = state.ideaCat || state.mIdeaCat || '待归类';
    const item = await addIdea({ content: r.text, catName, messageId: msgId });
    ideas.push(item);
    return { kind: 'idea', msg: catName === '待归类' ? '已记为灵感 · 待归类' : `已记为灵感 · 归到「${catName}」` };
  }

  return { kind: 'inbox', msg: '已存入收件箱，待确认类型' };
}

/* 把一条未归类消息归到指定类型：原文不动，只补建结构化记录 */
async function reclassify(msgId, as) {
  const m = messages.find(x => x.id === msgId);
  if (!m) throw new Error('这条消息已不存在');

  if (as === 'del') {
    await softDelete('message', msgId);
    messages = messages.filter(x => x.id !== msgId);
    return '已删除';
  }

  const text = m.content;
  if (as === 'todo') {
    const p = extractPlan(text);
    const txt = p
      ? text.replace(/(大后天|后天|明天|今天|本周[一二三四五六日]|这周[一二三四五六日]|下周[一二三四五六日]|周[一二三四五六日]|星期[一二三四五六日])[，,：:\s]*/g, '').trim() || text
      : text;
    todos.push(await addTodo({ text: txt, plan: p ? p.date : null, messageId: msgId }));
  } else if (as === 'note') {
    const books = splitByBooks(text);
    if (books) {
      for (const b of books) notes.push(await addNote({ content: b.content, bookName: b.book, messageId: msgId }));
    } else {
      const bm = text.match(/《([^》]{1,40})》/);
      notes.push(await addNote({ content: text, bookName: bm ? bm[1] : null, messageId: msgId }));
    }
  } else if (as === 'idea') {
    ideas.push(await addIdea({ content: text, catName: '待归类', messageId: msgId }));
  } else if (as === 'time') {
    const trs = parseTimeRanges(text);
    if (!trs || !trs.items.length) throw new Error('这段里没找到时间区间，写成「9-11 写文档」这样就行');
    for (const it of trs.items) {
      logs.push(await addTimeLog({
        desc: it.desc, start: it.start, end: it.end, dur: it.dur,
        cat: it.cat, crossDay: it.crossDay, messageId: msgId,
      }));
    }
  }

  await setMessageType(msgId, as === 'time' ? 'timelog' : as);
  m.type = as === 'time' ? 'timelog' : as;
  return '已归类';
}

/* 统一的失败提示：区分未登录 / 网络 / 越权 */
function failMsg(err, action = '操作') {
  const m = String(err && err.message || err);
  if (/没有改动|可能已被删除|删除失败/.test(m)) return m;
  if (/JWT|token|session|unauthenticated|not signed/i.test(m)) return '登录状态已过期，请重新登录';
  if (/network|fetch|Failed/i.test(m)) return `网络不可用，${action}没有保存，请检查网络后重试`;
  return `${action}失败：${m}`;
}

/* toast */
function toast(html, cls = '') {
  const layer = $('#toastLayer');
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.innerHTML = html;
  layer.appendChild(el);
  setTimeout(() => { el.style.transition = '.25s'; el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; }, 2400);
  setTimeout(() => el.remove(), 2700);
}
function toastIn(id, html, cls = '') {
  const layer = $(id);
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.innerHTML = html;
  layer.appendChild(el);
  setTimeout(() => { el.style.transition = '.25s'; el.style.opacity = '0'; }, 2000);
  setTimeout(() => el.remove(), 2300);
}

/* 用户正在拖选文字（多半是想复制），此时不弹编辑器 */
function selectedText() {
  try {
    const sel = window.getSelection ? window.getSelection() : null;
    return !!(sel && String(sel).trim().length);
  } catch (e) { return false; }
}

/* 一处改动后，桌面与手机两侧一起刷新，避免"改了却看不到" */
function refreshViews() {
  const m = $('#mContent');
  const mt = m ? m.scrollTop : 0;
  const dc = $('#deskContent');
  const stream = dc ? dc.querySelector('.notes-stream') : null;
  const st = stream ? stream.scrollTop : 0;

  try { renderDesk(); } catch (e) { /* 未登录时忽略 */ }
  try { renderMobile(); } catch (e) { /* 同上 */ }
  try { renderDeskCounters(); } catch (e) { /* 同上 */ }

  // 保持滚动位置：改完还在原地，不会跳回顶部
  if (m) m.scrollTop = mt;
  const dc2 = $('#deskContent');
  const s2 = dc2 ? dc2.querySelector('.notes-stream') : null;
  if (s2) s2.scrollTop = st;
}

/* 类型提示（输入时实时预测 + 点一下就能改）
   每个输入框对应一个 key（desk / m / quick），手动指定的类型存在 state.force[key]，
   发一条后立刻清空，下一次回到自动识别。 */
/* 输入框随内容撑高：必须先把 height 归零再读 scrollHeight，
   否则 iOS Safari 会一直返回上次的高度，框永远长不大，文字被裁。 */
function autogrow(el, max) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight || 0, max) + 'px';
}

const HINT_FOR = { desk: '#deskInput', m: '#mInput', quick: '#quickInput' };

/* 换 hint 的类型类名时保留布局类（如移动端的 m-hint），否则移动端样式会丢 */
function setHintClass(hintEl, extra) {
  const keep = Array.from(hintEl.classList || [])
    .filter(c => c !== 'type-hint' && !/^t-/.test(c) && c !== 'idle' && c !== 'manual');
  hintEl.className = ['type-hint', ...keep, ...String(extra || '').split(' ').filter(Boolean)].join(' ');
}

function updateHint(input, hintEl) {
  if (!hintEl) return 'empty';
  const key = hintEl.dataset.force || '';
  const forced = key ? (state.force[key] || null) : null;
  const v = input.value.trim();

  if (!v) {
    setHintClass(hintEl, 'idle' + (forced ? ' manual' : ''));
    hintEl.innerHTML = `<span class="dot"></span> 等待输入<span class="tp-caret">▾</span>`;
    hintEl.title = '点这里可以先选好类型';
    return 'empty';
  }
  const type = forced || classifyWith(v, null).type;
  setHintClass(hintEl, (TYPE_CLS[type] || '') + (forced ? ' manual' : ''));
  hintEl.innerHTML = `<span class="dot"></span> ${TYPE_LABEL[type] || '待确认'}`
    + (forced ? '<span class="tp-flag">手动</span>' : '')
    + '<span class="tp-caret">▾</span>';
  hintEl.title = forced ? '已手动指定 · 点这里恢复自动识别' : '点这里可以改类型';
  return type;
}

/* ---------- 类型选择浮层 ---------- */
let typePop = null, typePopAnchor = null;
function closeTypePicker() {
  if (typePop) { typePop.remove(); typePop = null; }
  if (typePopAnchor) {
    document.removeEventListener('pointerdown', onTypePopOutside, true);
    typePopAnchor = null;
  }
}
function onTypePopOutside(e) {
  if (!typePop) return;
  if (typePop.contains(e.target)) return;
  if (typePopAnchor && typePopAnchor.contains(e.target)) return;
  closeTypePicker();
}

function openTypePicker(anchor, cur, onPick) {
  closeTypePicker();
  const pop = document.createElement('div');
  pop.className = 'type-pop';
  pop.innerHTML = `<div class="tp-title">记成什么？<small>点一下就改</small></div>`
    + FORCE_TYPES.map(t => `<button type="button" class="tp-item ${cur === t.k ? 'on' : ''}" data-t="${t.k}">
        <span class="tp-dot" style="background:${t.c}"></span><span class="tp-name">${t.name}</span><span class="tp-check">✓</span>
      </button>`).join('')
    + `<button type="button" class="tp-item tp-auto ${!cur ? 'on' : ''}" data-t="">
        <span class="tp-dot auto"></span><span class="tp-name">自动识别</span><span class="tp-check">✓</span>
      </button>`;
  document.body.appendChild(pop);

  // 贴着触发按钮弹出；下方放不下就翻到上方
  const r = anchor.getBoundingClientRect();
  const pw = pop.offsetWidth || 190, ph = pop.offsetHeight || 240;
  const left = Math.max(8, Math.min(r.left, (window.innerWidth || 360) - pw - 8));
  let top = r.top - ph - 8;
  if (top < 8) top = Math.min(r.bottom + 8, Math.max(8, (window.innerHeight || 640) - ph - 8));
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';

  typePop = pop;
  typePopAnchor = anchor;
  pop.addEventListener('click', e => {
    const b = e.target.closest('[data-t]');
    if (!b) return;
    e.stopPropagation();
    const pick = b.dataset.t || null;
    closeTypePicker();
    onPick(pick);
  });
  setTimeout(() => { if (typePop === pop) document.addEventListener('pointerdown', onTypePopOutside, true); }, 0);
}

/* 把某个输入框的类型提示接上浮层 */
function bindTypePicker(hintEl) {
  if (!hintEl) return;
  const key = hintEl.dataset.force;
  const sel = HINT_FOR[key];
  const input = sel ? $(sel) : null;
  hintEl.addEventListener('click', () => {
    openTypePicker(hintEl, state.force[key] || null, pick => {
      state.force[key] = pick;
      if (input) {
        updateHint(input, hintEl);
        input.focus();
      }
    });
  });
}

/* ============================================================
   10. 事件绑定
   ============================================================ */
// 桌面导航
$$('.nav-item').forEach(b => b.addEventListener('click', () => {
  state.nav = b.dataset.nav;
  if (state.nav === 'note') state.noteBook = null;
  if (state.nav === 'idea') state.ideaCat = null;
  renderDesk();
}));

// 桌面输入
const deskInput = $('#deskInput');
deskInput.addEventListener('input', () => {
  deskInput.style.height = 'auto';
  deskInput.style.height = Math.min(deskInput.scrollHeight, 132) + 'px';
  const t = updateHint(deskInput, $('#deskHint'));
  $('#deskSend').classList.toggle('btn-primary', !!deskInput.value.trim());
});
deskInput.addEventListener('focus', () => $('#deskComposer').classList.add('focus'));
deskInput.addEventListener('blur', () => $('#deskComposer').classList.remove('focus'));
deskInput.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doDeskSend(); }
});
$('#deskSend').addEventListener('click', doDeskSend);
bindTypePicker($('#deskHint'));

async function doDeskSend() {
  const v = deskInput.value;
  if (!v.trim()) return;
  const btn = $('#deskSend');
  btn.disabled = true;
  let res = null;
  try {
    res = await submit(v, state.force.desk || null);
  } catch (err) {
    btn.disabled = false;
    toast(failMsg(err, '这条记录'), 'warn');
    return; // 失败时保留输入内容，绝不静默丢失
  }
  btn.disabled = false;
  deskInput.value = '';
  deskInput.style.height = 'auto';
  state.force.desk = null;   // 发完回到自动识别
  updateHint(deskInput, $('#deskHint'));
  if (!res) return;

  // 智能跳转到对应列表
  if (res.kind.startsWith('todo')) state.nav = 'todo';
  else if (res.kind === 'note') { state.nav = 'note'; state.noteBook = null; }
  else if (res.kind === 'idea') { state.nav = 'idea'; }   // 保留当前分类：新灵感就记在这个分类下
  else if (res.kind.startsWith('timelog')) { state.nav = 'time'; state.timeTab = 'day'; state.mTimeTab = 'day'; state.timeOffset = 0; state.timeSub = 'timeline'; }
  renderDesk();

  // 跳转后高亮新条目
  const flash = () => {
    const el = $('#deskContent').querySelector('.todo:not(.done), .note-card');
    if (el) { el.style.transition = '.3s'; el.style.boxShadow = '0 0 0 3px rgba(79,70,229,.22)'; setTimeout(() => { el.style.boxShadow = ''; }, 1100); }
  };
  if (res.kind === 'todo-multi') {
    toast(`已拆分为 <b>${res.items.length}</b> 条待办：` + res.items.map((it, i) =>
      `#${i + 1} ${esc(it.text)}${it.plan ? `（${fmtMD(it.plan)} 周${WEEK_CN[it.plan.getDay()]}）` : ''}`).join(' · '), 'ok');
  } else {
    toast(res.msg, res.cls || 'ok');
  }
  flash();
}

// 内容区委托
$('#deskContent').addEventListener('click', async e => {
  // 未归类消息 → 一键归位
  const sortBtn = e.target.closest('[data-sort]');
  if (sortBtn) {
    sortBtn.disabled = true;
    try {
      const tip = await reclassify(+sortBtn.dataset.sort, sortBtn.dataset.as);
      toast(tip);
      renderDesk();
    } catch (err) {
      toast(failMsg(err, '归类'), 'warn');
      sortBtn.disabled = false;
    }
    return;
  }

  const tf = e.target.closest('[data-tf]');
  if (tf) { state.todoFilter = tf.dataset.tf; renderTodo(); return; }

  const off = e.target.closest('[data-off]');
  if (off) {
    const v = off.dataset.off;
    const key = state.timeTab === 'day' ? 'timeOffset' : state.timeTab === 'week' ? 'weekOffset' : 'monthOffset';
    state[key] = v === 'reset' ? 0 : state[key] + Number(v);
    renderDesk();
    return;
  }

  const tt = e.target.closest('[data-tt]');
  if (tt) { state.timeTab = tt.dataset.tt; renderDesk(); return; }

  const ts = e.target.closest('[data-ts]');
  if (ts) { state.timeSub = ts.dataset.ts; renderDesk(); return; }

  const wk = e.target.closest('[data-wk]');
  if (wk) { const k = wk.dataset.wk; state.collapsedWeeks[k] = !state.collapsedWeeks[k]; renderTodo(); return; }

  const bk = e.target.closest('[data-book]');
  if (bk) { state.noteBook = bk.dataset.book || null; renderNote(); return; }

  // 新建灵感分类（必须在 data-cat 之前判断：那个按钮不带 data-cat）
  if (e.target.closest('[data-newcat]')) {
    openNewCategory(name => { state.ideaCat = name; });
    return;
  }

  const ct = e.target.closest('[data-cat]');
  if (ct) { state.ideaCat = ct.dataset.cat || null; renderIdea(); return; }

  const dayCell = e.target.closest('[data-day]');
  if (dayCell) {
    const d = new Date(dayCell.dataset.day);
    state.timeTab = 'day';
    state.timeOffset = Math.round((d - TODAY) / 86400000);
    renderDesk();
    return;
  }

  const act = e.target.closest('[data-act]');
  const actName = act ? act.dataset.act : null;

  // 待办
  const todoEl = e.target.closest('.todo');
  if (todoEl) {
    const id = +todoEl.dataset.id;
    const t = todos.find(x => x.id === id);
    if (!actName || !t) return;
    if (actName === 'toggle') {
      try {
        await setTodoDone(id, !t.done);
        t.done = !t.done;
        t.doneAt = t.done ? nowDate() : null;
        renderTodo();
        toast(t.done ? `✓ 已完成：${esc(t.text)}` : `已撤销完成：${esc(t.text)}`);
      } catch (err) { toast(failMsg(err, '更新待办'), 'warn'); }
    } else if (actName === 'del') {
      if (!confirm(`删除待办「${t.text}」？`)) return;
      try {
        await softDelete('todo', id);
        todos = todos.filter(x => x.id !== id);
        renderTodo();
        toast('已删除');
      } catch (err) { toast(failMsg(err, '删除待办'), 'warn'); }
    } else if (actName === 'edit') {
      openEditTodo(t);
    }
    return;
  }

  // 读书笔记
  const noteEl = e.target.closest('[data-nid]');
  if (noteEl) {
    const id = +noteEl.dataset.nid;
    const n = notes.find(x => x.id === id);
    if (!n) return;
    if (actName === 'edit') {
      if (act.classList.contains('note-content') && selectedText()) return;
      openEditNote(n);
    }
    else if (actName === 'file') openFileNote(n);
    else if (actName === 'del') {
      if (!confirm('删除这条笔记？')) return;
      try {
        await softDelete('reading_note', id);
        notes = notes.filter(x => x.id !== id);
        renderNote();
        toast('已删除');
      } catch (err) { toast(failMsg(err, '删除笔记'), 'warn'); }
    }
    return;
  }

  // 灵感
  const ideaEl = e.target.closest('[data-iid]');
  if (ideaEl) {
    const id = +ideaEl.dataset.iid;
    const n = ideas.find(x => x.id === id);
    if (!n) return;
    if (actName === 'edit') openEditIdea(n);
    else if (actName === 'del') {
      if (!confirm('删除这条灵感？')) return;
      try {
        await softDelete('idea', id);
        ideas = ideas.filter(x => x.id !== id);
        renderIdea();
        toast('已删除');
      } catch (err) { toast(failMsg(err, '删除灵感'), 'warn'); }
    }
    return;
  }

  // 时间记录
  const logEl = e.target.closest('[data-lid]');
  if (logEl) {
    const id = +logEl.dataset.lid;
    const l = logs.find(x => x.id === id);
    if (!l) return;
    if (actName === 'edit') openEditLog(l);
    else if (actName === 'del') {
      if (!confirm('删除这条时间记录？')) return;
      try {
        await softDelete('time_log', id);
        logs = logs.filter(x => x.id !== id);
        renderDesk();
        toast('已删除');
      } catch (err) { toast(failMsg(err, '删除时间记录'), 'warn'); }
    }
    return;
  }
});

/* ---- 移动端 ---- */
$$('[data-nav]').forEach(b => {
  if (b.closest('.m-tabbar') || b.closest('.m-tabs')) return;
});

$$('.m-tabs button, .m-tab').forEach(b => b.addEventListener('click', () => {
  state.nav = b.dataset.nav;
  renderMobile();
}));

$$('[data-goto]').forEach(b => b.addEventListener('click', () => {
  state.nav = b.dataset.goto;
  renderMobile();
}));

function renderMobile() {
  $$('.m-tabs button').forEach(b => b.classList.toggle('on', b.dataset.nav === state.nav));
  $$('.m-tab').forEach(b => b.classList.toggle('on', b.dataset.nav === state.nav));
  const names = { todo: '待办', note: '笔记', idea: '灵感', time: '时间', all: '全部消息' };
  $('#mTitle').textContent = names[state.nav] || '待办';

  const c = $('#mContent');
  if (state.nav === 'all') {
    const inboxN = messages.filter(m => m.type === 'inbox').length;
    c.innerHTML = (inboxN ? `<div class="m-inbox-tip">有 ${inboxN} 条消息待归类</div>` : '')
      + (messages.length ? messages.map(m => {
        const [name, bg, fg] = TYPE_STYLE[m.type] || TYPE_STYLE.inbox;
        const needSort = m.type === 'inbox';
        return `<div class="note-card" style="padding:11px 13px" data-msg="${m.id}">
          <div class="note-head" style="margin-bottom:5px">
            <span class="src-chip" style="background:${bg};color:${fg}">${name}</span>
            <span class="meta">${fmtMDHM(m.at)}</span>
            ${needSort ? `<span class="meta" style="margin-left:auto">待归类</span>` : ''}
          </div>
          <div class="note-content" style="font-size:13px">${esc(m.content)}</div>
          ${needSort ? `<div style="margin-top:8px;display:flex;gap:6px">
            <button class="mini-btn" data-msort="${m.id}" data-as="todo">待办</button>
            <button class="mini-btn" data-msort="${m.id}" data-as="time">时间</button>
            <button class="mini-btn" data-msort="${m.id}" data-as="note">笔记</button>
            <button class="mini-btn" data-msort="${m.id}" data-as="idea">灵感</button>
            <button class="mini-btn" data-msort="${m.id}" data-as="del">删除</button>
          </div>` : ''}
        </div>`;
      }).join('') : `<div class="empty-state"><div class="empty-title">还没有消息</div><div class="empty-sub">在下面输入框记一条</div></div>`);
    return;
  }
  if (state.nav === 'todo') {
    const pending = pendingTodos();
    const done = todos.filter(t => t.done).sort((a, b) => b.doneAt - a.doneAt);
    c.innerHTML = `<div class="todo-list">${pending.map(t => todoRow(t)).join('')}</div>
      <div class="section-title">已完成 <span class="cnt">${done.length}</span><span class="line"></span></div>
      <div class="todo-list">${done.map(t => todoRow(t)).join('')}</div>`;
  } else if (state.nav === 'note') {
    c.innerHTML = mobileNoteHtml();
  } else if (state.nav === 'idea') {
    c.innerHTML = mobileIdeaHtml();
  } else {
    c.innerHTML = mobileTimeHtml();
  }
}

/* 手机端灵感页：顶部分类索引（横向滑）+ 新建分类 + 该分类的灵感 */
function mobileIdeaHtml() {
  const byCat = {};
  ideas.forEach(n => { const k = n.cat || '待归类'; (byCat[k] = byCat[k] || []).push(n); });
  const names = ideaCatNames(ideas);
  const cur = state.mIdeaCat && names.indexOf(state.mIdeaCat) >= 0 ? state.mIdeaCat : null;
  const sorted = [...(cur ? (byCat[cur] || []) : ideas)].sort((a, b) => b.createdAt - a.createdAt);

  const chip = (k, label, cnt, active) =>
    `<button class="chip ${active ? 'on' : ''}" data-mcat="${esc(k)}" type="button">${label}<span class="n">${cnt}</span></button>`;

  const idx = `<div class="m-idx">
    ${chip('', '全部', ideas.length, !cur)}
    ${names.map(k => chip(k, esc(k), (byCat[k] || []).length, cur === k)).join('')}
    <button class="chip chip-new" data-newcat type="button">＋ 新建</button>
  </div>`;

  const meta = `<div class="m-list-meta">${cur ? esc(cur) + ' · ' : ''}共 ${sorted.length} 条 · 点内容可改</div>`;
  const body = sorted.length
    ? sorted.map(n => ideaCard(n)).join('')
    : `<div class="empty-state"><div class="empty-title">${cur ? '这个分类还没有灵感' : '还没有灵感'}</div>
        <div class="empty-sub">${cur ? `在下面输入框记一条，会自动归到「${esc(cur)}」` : '点一下内容就能修改'}</div></div>`;

  return idx + meta + body;
}

/* 手机端笔记页：顶部书籍索引（横向滑）+ 该书的笔记 */
function mobileNoteHtml() {
  if (!notes.length) {
    return `<div class="empty-state"><div class="empty-title">还没有读书笔记</div><div class="empty-sub">在下面输入框记一条，带《书名》会自动归档</div></div>`;
  }

  const byBook = {};
  notes.forEach(n => { const k = n.book || '__unfiled'; (byBook[k] = byBook[k] || []).push(n); });
  const keys = bookSort(Object.keys(byBook).filter(k => k !== '__unfiled'));
  if (byBook.__unfiled) keys.push('__unfiled');

  // 选中的书被删/改名后自动退回「全部」，不留空白页
  const cur = state.mNoteBook && byBook[state.mNoteBook] ? state.mNoteBook : null;
  const sorted = [...(cur ? byBook[cur] : notes)].sort((a, b) => b.createdAt - a.createdAt);

  const chip = (k, label, cnt, active) =>
    `<button class="chip ${active ? 'on' : ''}" data-mbook="${esc(k)}" type="button">${label}<span class="n">${cnt}</span></button>`;

  const idx = `<div class="m-idx">
    ${chip('', '全部', notes.length, !cur)}
    ${keys.map(k => chip(k, k === '__unfiled' ? '未整理' : `《${esc(k)}》`, byBook[k].length, cur === k)).join('')}
  </div>`;

  const title = cur ? (cur === '__unfiled' ? '未整理' : `《${esc(cur)}》`) : '';
  const meta = `<div class="m-list-meta">${title ? title + ' · ' : ''}共 ${sorted.length} 条 · 点内容可改</div>`;

  return idx + meta + sorted.map(n => noteCard(n)).join('');
}

/* 手机端时间页：默认按周看，可切日/周/月并前后翻页 */
const ICON_L = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg>';
const ICON_R = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 18l6-6-6-6"/></svg>';

function mobileTimeHtml() {
  const { isDay, isWeek, isMonth, refDate, label, scope, offs, unit } = timeScope(state.mTimeTab);
  const { s, total } = statOf(scope);
  const pct = k => total ? (s[k] / total * 100) : 0;

  const bar = `<div class="m-tl-bar">
    <div class="tabs">
      <button data-mtt="day" class="${isDay ? 'on' : ''}">日</button>
      <button data-mtt="week" class="${isWeek ? 'on' : ''}">周</button>
      <button data-mtt="month" class="${isMonth ? 'on' : ''}">月</button>
    </div>
    <div class="m-tl-nav">
      <button class="m-arrow" data-moff="-1" type="button">${ICON_L}</button>
      <span class="tl-date">${label}</span>
      <button class="m-arrow" data-moff="1" type="button">${ICON_R}</button>
      ${offs !== 0 ? `<button class="m-back" data-moff="reset" type="button">回到${isDay ? '今天' : isWeek ? '本周' : '本月'}</button>` : ''}
    </div>
  </div>`;

  const stat = `<div class="stat-card" style="padding:12px">
    <div class="stat-head" style="margin-bottom:8px">
      <span class="stat-total" style="font-size:17px">${fmtDur(total)}<small>${unit}总计</small></span>
      <div style="flex:1"></div>
      <span class="meta" style="font-size:11px">${scope.length} 条</span>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:9px">
      ${['study', 'work', 'leisure', 'life'].map(k => `<div class="stat-item"><span class="k"><span style="width:6px;height:6px;border-radius:2px;background:${CAT[k].c}"></span>${CAT[k].name}</span><span class="v" style="font-size:13.5px;color:${s[k] ? CAT[k].c : 'var(--text-4)'}">${fmtDur(s[k])}</span></div>`).join('')}
    </div>
    <div class="stackbar">${['study', 'work', 'leisure', 'life'].map(k => s[k] ? `<span style="width:${pct(k)}%;background:${CAT[k].c}"></span>` : '').join('')}</div>
  </div>`;

  let body = '';
  if (isDay) body = dayView(refDate);
  else if (isWeek) body = weekView(refDate, true);
  else body = monthView(refDate);

  return bar + stat + body + mobileLogGroups(scope, unit);
}

/** 手机端流水：按天分组，天数多时分组标题带当日时长 */
function mobileLogGroups(scope, unit) {
  if (!scope.length) {
    return `<div class="section-title">${unit}流水<span class="line"></span></div>
      <div class="empty-state" style="padding:26px 0"><div class="empty-title">这一范围还没有记录</div><div class="empty-sub">在上方输入框记一条，例如「昨天下午 2-4 写方案」</div></div>`;
  }
  const byDay = {};
  scope.forEach(l => {
    const k = `${l.start.getFullYear()}-${pad(l.start.getMonth() + 1)}-${pad(l.start.getDate())}`;
    (byDay[k] = byDay[k] || []).push(l);
  });
  const keys = Object.keys(byDay).sort().reverse();

  return keys.map(k => {
    const list = byDay[k].sort((a, b) => a.start - b.start);
    const d = list[0].start;
    const dayTotal = statOf(list).total;
    const isToday = sameDay(d, TODAY);
    return `<div class="section-title">${fmtMD(d)} 周${WEEK_CN[d.getDay()]}${isToday ? ' · 今天' : ''}<span class="cnt" style="margin-left:6px">${fmtDur(dayTotal)}</span><span class="line"></span></div>
      ${list.map(l => `<div class="log-row" style="padding:8px 10px" data-lid="${l.id}">
        <span class="log-cat" style="background:${CAT[l.cat].c}"></span>
        <span class="log-time mono">${pad(l.start.getHours())}:${pad(l.start.getMinutes())}–${l.crossDay ? '次日' : ''}${pad(l.end.getHours())}:${pad(l.end.getMinutes())}</span>
        <span class="log-dur mono" style="color:${CAT[l.cat].c}">${fmtDur(l.dur)}</span>
        <span class="log-tag" style="background:${CAT[l.cat].bg};color:${CAT[l.cat].c}">${CAT[l.cat].name}</span>
        <span class="log-desc">${esc(l.desc)}</span>
      </div>`).join('')}`;
  }).join('');
}

// 移动端委托
$('#mContent').addEventListener('click', async e => {
  // 未归类消息 → 一键归位
  const mSort = e.target.closest('[data-msort]');
  if (mSort) {
    mSort.disabled = true;
    try {
      const tip = await reclassify(+mSort.dataset.msort, mSort.dataset.as);
      toastIn('#mToast', tip, 'ok');
      renderMobile();
    } catch (err) {
      toastIn('#mToast', failMsg(err, '归类'), 'warn');
      mSort.disabled = false;
    }
    return;
  }

  const mtt = e.target.closest('[data-mtt]');
  if (mtt) { state.mTimeTab = mtt.dataset.mtt; renderMobile(); return; }

  const moff = e.target.closest('[data-moff]');
  if (moff) {
    const v = moff.dataset.moff;
    const key = state.mTimeTab === 'day' ? 'timeOffset' : state.mTimeTab === 'week' ? 'weekOffset' : 'monthOffset';
    state[key] = v === 'reset' ? 0 : state[key] + (+v);
    renderMobile();
    return;
  }

  const mday = e.target.closest('[data-mday]');
  if (mday) {
    const d = addDays(addDays(weekStart(TODAY), state.weekOffset * 7), +mday.dataset.mday);
    state.mTimeTab = 'day';
    state.timeOffset = Math.round((d - TODAY) / 86400000);
    renderMobile();
    return;
  }

  // 手机端书籍索引
  const mBook = e.target.closest('[data-mbook]');
  if (mBook) { state.mNoteBook = mBook.dataset.mbook || null; renderMobile(); return; }

  // 手机端灵感分类索引 + 新建分类
  if (e.target.closest('[data-newcat]')) {
    openNewCategory(name => { state.mIdeaCat = name; });
    return;
  }
  const mCat = e.target.closest('[data-mcat]');
  if (mCat) { state.mIdeaCat = mCat.dataset.mcat || null; renderMobile(); return; }

  // 读书笔记 / 灵感：点内容或铅笔都能改（手机上没有 hover，按钮常显）
  const mNote = e.target.closest('[data-nid]');
  if (mNote) {
    const n = notes.find(x => x.id === +mNote.dataset.nid);
    if (!n) return;
    const a = e.target.closest('[data-act]');
    const an = a ? a.dataset.act : null;
    if (an === 'del') {
      if (!confirm('删除这条笔记？')) return;
      try {
        await softDelete('reading_note', n.id);
        notes = notes.filter(x => x.id !== n.id);
        refreshViews();
        toastIn('#mToast', '已删除', 'ok');
      } catch (err) { toastIn('#mToast', failMsg(err, '删除笔记'), 'warn'); }
      return;
    }
    if (an === 'file') { openFileNote(n); return; }
    if (selectedText()) return;   // 正在选文字复制，不打断
    openEditNote(n);
    return;
  }

  const mIdea = e.target.closest('[data-iid]');
  if (mIdea) {
    const n = ideas.find(x => x.id === +mIdea.dataset.iid);
    if (!n) return;
    const a = e.target.closest('[data-act]');
    const an = a ? a.dataset.act : null;
    if (an === 'del') {
      if (!confirm('删除这条灵感？')) return;
      try {
        await softDelete('idea', n.id);
        ideas = ideas.filter(x => x.id !== n.id);
        refreshViews();
        toastIn('#mToast', '已删除', 'ok');
      } catch (err) { toastIn('#mToast', failMsg(err, '删除灵感'), 'warn'); }
      return;
    }
    if (selectedText()) return;
    openEditIdea(n);
    return;
  }

  const el = e.target.closest('.todo');
  if (!el) return;
  const t = todos.find(x => x.id === +el.dataset.id);
  const act = e.target.closest('[data-act]');
  if (!act || !t) return;
  const name = act.dataset.act;

  if (name === 'toggle') {
    try {
      await setTodoDone(t.id, !t.done);
      t.done = !t.done;
      t.doneAt = t.done ? nowDate() : null;
      renderMobile();
      renderDeskCounters();
      toastIn('#mToast', t.done ? `✓ 已完成：${esc(t.text)}` : '已撤销完成', 'ok');
    } catch (err) { toastIn('#mToast', failMsg(err, '更新待办'), 'warn'); }
  } else if (name === 'del') {
    if (!confirm(`删除待办「${t.text}」？`)) return;
    try {
      await softDelete('todo', t.id);
      todos = todos.filter(x => x.id !== t.id);
      renderMobile();
      renderDeskCounters();
      toastIn('#mToast', '已删除', 'ok');
    } catch (err) { toastIn('#mToast', failMsg(err, '删除待办'), 'warn'); }
  } else if (name === 'edit') {
    openEditTodo(t);
  }
});
function renderDeskCounters() { $('#cnt-todo').textContent = todos.filter(t => !t.done).length; }

// 移动端速记
const quickInput = $('#quickInput');
quickInput.addEventListener('input', () => {
  autogrow(quickInput, 220);
  updateHint(quickInput, $('#quickHint'));
  $('#quickSend').classList.toggle('off', !quickInput.value.trim());
});
quickInput.addEventListener('focus', () => setTimeout(() => autogrow(quickInput, 220), 120));
$('#quickSend').addEventListener('click', doQuickSend);
bindTypePicker($('#quickHint'));

async function doQuickSend() {
  const v = quickInput.value;
  dbg('click-quickSend', `len=${v.trim().length}`);
  if (!v.trim()) return;
  let res = null;
  try {
    res = await submit(v, state.force.quick || null);
  } catch (err) {
    dbg('quickSend-FAIL', errText(err));
    toastIn('#quickToast', failMsg(err, '这条记录'), 'warn');
    showDiag(true);
    return; // 保留输入，不清空
  }
  quickInput.value = '';
  autogrow(quickInput, 220);
  state.force.quick = null;
  updateHint(quickInput, $('#quickHint'));
  $('#quickSend').classList.add('off');
  quickInput.focus(); // 发完保持聚焦，可连记多条
  if (res && res.kind === 'todo-multi') {
    toastIn('#quickToast', `已拆为 ${res.items.length} 条待办`, 'ok');
  } else if (res) {
    toastIn('#quickToast', res.msg, res.cls || 'ok');
  }
  if (res && res.kind === 'note') state.mNoteBook = null;  // 新笔记可能不在当前筛的书里
  renderDesk();
  renderMobile();
}

$$('.qt-item').forEach(b => b.addEventListener('click', () => {
  quickInput.value = b.dataset.fill;
  quickInput.dispatchEvent(new Event('input'));
  quickInput.focus();
}));

// 移动端列表页输入
const mInput = $('#mInput');
mInput.addEventListener('input', () => {
  autogrow(mInput, 148);
  $('#mSend').classList.toggle('off', !mInput.value.trim());
  updateHint(mInput, $('#mHint'));
});
// iOS 键盘弹出/横竖屏切换后可用高度会变，重新量一次
mInput.addEventListener('focus', () => setTimeout(() => autogrow(mInput, 148), 120));
bindTypePicker($('#mHint'));
$('#mSend').addEventListener('click', async () => {
  const v = mInput.value;
  dbg('click-mSend', `len=${v.trim().length}`);
  if (!v.trim()) return;
  let res = null;
  try {
    res = await submit(v, state.force.m || null);
  } catch (err) {
    dbg('mSend-FAIL', errText(err));
    toastIn('#mToast', failMsg(err, '这条记录'), 'warn');
    showDiag(true);
    return; // 保留输入，不清空
  }
  mInput.value = '';
  state.force.m = null;
  $('#mSend').classList.add('off');
  updateHint(mInput, $('#mHint'));
  toastIn('#mToast', res.kind === 'todo-multi' ? `已拆为 ${res.items.length} 条待办` : res.msg, res.cls || 'ok');
  if (res.kind === 'note') state.mNoteBook = null;
  renderDesk();
  renderMobile();
});

/* ---- 设备切换 ---- */
$('#btnDesktop').addEventListener('click', () => {
  $('#btnDesktop').classList.add('on'); $('#btnMobile').classList.remove('on');
  $('#desktopView').classList.remove('hidden'); $('#mobileView').classList.add('hidden');
  renderDesk();
});
$('#btnMobile').addEventListener('click', () => {
  $('#btnMobile').classList.add('on'); $('#btnDesktop').classList.remove('on');
  $('#mobileView').classList.remove('hidden'); $('#desktopView').classList.add('hidden');
  renderMobile();
  setTimeout(() => quickInput.focus(), 120);
});

/* ============================================================
   10.5 真机模式：手机 / 窄屏访问时全屏呈现（去掉演示外壳与手机模型）
   ============================================================ */
const IS_MOBILE_UA = /iPhone|iPad|iPod|Android|HarmonyOS|Mobile/i.test(navigator.userAgent);

function isRealMobile() {
  return IS_MOBILE_UA || window.matchMedia('(max-width: 820px)').matches;
}

/* 在速记页 / 列表页之间切换（仅真机模式生效） */
function gotoPage(page) {
  const q = document.querySelector('.phone-col[data-page="quick"]');
  const l = document.querySelector('.phone-col[data-page="list"]');
  if (!q || !l) return;
  const showQuick = page === 'quick';
  q.hidden = !showQuick;
  l.hidden = showQuick;
  document.body.dataset.mview = showQuick ? 'quick' : 'list';
  if (showQuick) {
    renderMobile();
    setTimeout(() => { const el = $('#quickInput'); if (el) el.focus(); }, 120);
  } else {
    renderMobile();
  }
}

function setupRealMobile() {
  if (!isRealMobile()) return false;
  document.body.classList.add('real-mobile');
  $$('[data-goto-page]').forEach(b => {
    b.addEventListener('click', () => gotoPage(b.dataset.gotoPage));
  });
  // 「进入分拣本」在真机下应切到列表页
  $$('[data-goto]').forEach(b => {
    b.addEventListener('click', () => gotoPage('list'));
  });
  // 浏览器前进/后退无关，首次进入按 URL 参数决定落地页
  gotoPage(new URLSearchParams(location.search).get('view') === 'quick' ? 'quick' : 'list');
  return true;
}

/* ============================================================
   11. 启动：认证 → 加载数据 → 渲染
   ============================================================ */
function showLogin() {
  $('#appShell').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
}
function showApp() {
  $('#loginView').classList.add('hidden');
  $('#appShell').classList.remove('hidden');
}
function setLoginError(msg) {
  const el = $('#loginErr');
  el.textContent = msg || '';
  el.classList.toggle('on', !!msg);
}

async function enterApp(session) {
  try {
    await ensureProfile(session.user);
    const data = await loadAll();
    todos = data.todos;
    notes = data.notes;
    ideas = data.ideas;
    logs = data.logs;
    books = data.books.map(b => ({ id: b.id, name: b.name }));
    cats = data.cats.map(c => ({ id: c.id, name: c.name }));
    try { messages = await loadMessages(); } catch (e) { messages = []; dbg('loadMessages-FAIL', errText(e)); }
    dbg('data-loaded', `todo=${todos.length} note=${notes.length} idea=${ideas.length} log=${logs.length} msg=${messages.length}`);

    showApp();
    const who = session.user?.name || session.user?.phone || session.user?.email || '我';
    const av = $('#userAvatar'), nm = $('#userName');
    if (av) av.textContent = String(who).slice(0, 1).toUpperCase();
    if (nm) nm.textContent = String(who).length > 14 ? String(who).slice(0, 12) + '…' : who;

    renderDesk();
    renderMobile();
    updateHint(deskInput, $('#deskHint'));

    // 从主屏幕图标 / 快捷方式直达速记页：?view=quick 进来直接落到输入框
    if (new URLSearchParams(location.search).get('view') === 'quick') {
      if (document.body.classList.contains('real-mobile')) {
        gotoPage('quick');                       // 手机：全屏速记页
      } else {
        const el = $('#deskInput');              // 电脑：光标直接落在顶部输入框
        if (el) setTimeout(() => el.focus(), 120);
      }
    }
  } catch (err) {
    dbg('enterApp-FAIL', errText(err));
    showLogin();
    setLoginError(failMsg(err, '加载你的数据'));
    showDiag(true);
  }
}

$('#btnImport').addEventListener('click', () => openBatchImport());

async function boot() {
  setupRealMobile();
  try { await initCloud(); await enterApp({user:{name:'我'}}); }
  catch(err) { showLogin(); setLoginError(failMsg(err, '连接数据库')); }
}
boot();
