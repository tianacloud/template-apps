// @ts-check
// 小屿的规则便条。

export const MOOD_WORDS = /** @type {Record<number, string>} */ ({ 1: '很糟', 2: '低落', 3: '平稳', 4: '不错', 5: '很棒' });

/** 危机提示：固定文案，不经过模型。 */
export const CARE_TEXT =
  '听起来你现在很不好受。你不是一个人：可以找一个信任的人说说，也可以拨打全国统一心理援助热线 12356。如果有立刻的危险，请拨打 110 或 120。';

const CRISIS = /自杀|轻生|不想活|活不下去|想死(?!你)|结束(自己的)?生命|伤害自己|自残|割腕|跳楼|撑不下去了/;
/** 文本里是否流露出伤害自己的念头（只用来展示固定的求助信息）。 */
export const needsCare = (text) => CRISIS.test(String(text ?? ''));


const WEEK = '日一二三四五六';

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const utc = (date) => {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
/** from 到 to 相隔几天（YYYY-MM-DD）。 */
export const dayDiff = (from, to) => Math.round((utc(to) - utc(from)) / 86400000);
const chars = (s) => [...String(s ?? '')];
const clip = (s, n) => chars(s).slice(0, n).join('');

/** 超长时尽量在句号处截断。 */
function clipSentence(s, n) {
  const list = chars(s);
  if (list.length <= n) return list.join('');
  const head = list.slice(0, n).join('');
  const cut = Math.max(...['。', '！', '？', '!', '?', '…'].map((c) => head.lastIndexOf(c)));
  return cut >= n * 0.5 ? head.slice(0, cut + 1) : `${head}…`;
}

// ---------- 离线便条（不调用模型） ----------
const MOOD_ECHO = {
  1: ['那一天一定很难熬，谢谢你还愿意告诉我。', '抱一下。难熬的日子，也会一点点过去的。'],
  2: ['有点低落也没关系，我陪你慢慢缓过来。', '低落的时候，就在岛上多歇一会儿吧。'],
  3: ['平平稳稳的一天，也是很好的一天。', '平稳，是一种不太被注意到的厉害。'],
  4: ['听起来还不错，我也跟着开心了一下。', '不错的日子，值得被好好记住。'],
  5: ['看到「很棒」两个字，我在岛上转了三圈。', '真好呀，希望这份好心情多留几天。'],
};
const NO_MOOD_OPENERS = [
  '这几天没见到你的心情贴纸，不过没关系，小岛一直在这里。',
  '好久不见啦，岛上的风一直在等你回来。',
  '你不在的时候，我把小岛打扫得干干净净。',
];
const STORY_LINES = [
  '今天一早，一只海鸥在灯塔顶上借宿，走的时候还留下了一根羽毛。',
  '风车今天转出了一段像口哨的调子，我跟着哼了一上午。',
  '岛霸横横又在偷偷藏贝壳了，我假装没看见。',
  '昨晚小确幸罐子自己亮了一下，大概是哪颗星星做了个好梦。',
  '一阵风把树叶吹成了心形，我想第一个拿给你看。',
  '我练习倒立，结果把自己翻成了一团雾，缓了好久才变回来。',
  '小屋的窗台上冒出了一朵小蘑菇，我给它起名叫「小圆」。',
  '岛边漂来一个空玻璃瓶，我在里面放了一句「今天也要好好的」，又把它送回了海里。',
];
const INVITES = [
  '今天如果遇到一件让你嘴角上扬的小事，记得放进罐子里。',
  '今天记得多喝几杯水，眼睛也要歇一歇。',
  '找个空档出门走五分钟吧，回来告诉我外面的天气。',
  '今天睡前，对自己说一句“辛苦啦”。',
  '今天试着把一件小事做完，就一件就好。',
  '今天抬头看看天，云说不定也在看你。',
  '今天吃饭的时候，认真尝一尝第一口。',
  '今天给一个好久没联系的人发句问候吧。',
];
/** 与「关于你」里 stress、recharge 两题的选项一一对应。 */
const STRESS_LINES = /** @type {Record<number, string>} */ ({
  2: '你说最近压力不少，今天能不能留十分钟，什么都不做？',
  3: '你说最近压力快满了。先别急着往里装新东西，给自己留一点空白。',
});
const RECHARGE_DO = ['好好睡一觉', '去吃点好吃的', '出门走走', '找人聊聊', '一个人安静待一会儿'];

/**
 * 根据心屿里的记录写一张便条。同一天、同样的数据得到同样的结果。
 * @param {any} d domain.companionData() 的返回值
 */
export function templateLetter(d) {
  const rand = mulberry32(fnv1a(`note|${d.today}|${d.letterCount}`));
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const paras = [];
  if (d.untilBirthday === 0) paras.push('生日快乐！今天整座小岛都是你的，想做什么就做什么。');
  const recent = d.moods.find((m) => m.date < d.today && dayDiff(m.date, d.today) <= 3);
  const care = d.moods.some((m) => dayDiff(m.date, d.today) <= 3 && needsCare(m.note));
  if (recent) {
    const when = ['', '昨天', '前天', '大前天'][dayDiff(recent.date, d.today)];
    const said = recent.note && !needsCare(recent.note) ? `，还写了一句「${recent.note}」` : '';
    paras.push(`${when}你贴的是「${MOOD_WORDS[recent.mood]}」${said}。${pick(MOOD_ECHO[recent.mood])}`);
  } else if (!d.letterCount) {
    paras.push('这是我写给你的第一张便条。以后每天，邮筒里都会有一张新的。');
  } else {
    paras.push(pick(NO_MOOD_OPENERS));
  }
  const extras = [];
  const joy = d.joys.find((j) => dayDiff(j.date, d.today) <= 3);
  if (joy) extras.push(`罐子里最新的一颗星星是「${joy.text}」，我把它擦得亮亮的。`);
  if (d.userNotes.length) extras.push(`你让我记住的「${pick(d.userNotes)}」，我一直记着呢。`);
  if (d.streak >= 2) extras.push(`我们已经连着见了 ${d.streak} 天，小火苗越烧越旺。`);
  const stress = d.aboutIdx.stress;
  if (stress >= 2) extras.push(STRESS_LINES[stress]);
  else if (d.aboutIdx.recharge != null && RECHARGE_DO[d.aboutIdx.recharge]) {
    extras.push(`累了的话，就${RECHARGE_DO[d.aboutIdx.recharge]}吧，这是你告诉我的回血方式。`);
  }
  extras.push(pick(STORY_LINES));
  for (let i = extras.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [extras[i], extras[j]] = [extras[j], extras[i]];
  }
  const mid = extras.slice(0, 2);
  if (d.untilBirthday != null && d.untilBirthday > 0 && d.untilBirthday <= 7) {
    mid.unshift(`再过 ${d.untilBirthday} 天就是你的生日啦，我已经在偷偷准备了。`);
  }
  paras.push(mid.join(''));
  if (care) paras.push('如果最近真的很难熬，记得你不是一个人：可以找信任的人说说，也可以拨打全国统一心理援助热线 12356。');
  paras.push(pick(INVITES));
  return paras.join('\n\n');
}

