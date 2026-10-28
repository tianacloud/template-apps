const STORAGE_KEY = "dmax-mokugyo-v6";
const STORAGE_BACKUP_KEY = "dmax-mokugyo-v6-backup";
const LEGACY_STORAGE_KEYS = ["dmax-mokugyo-v2"];
const STORAGE_SCHEMA_VERSION = 5;
const STATE_SAVE_DEBOUNCE_MS = 180;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

const getDefaultSoundEnabled = () => true;

const DEFAULT_STATE = {
  schemaVersion: STORAGE_SCHEMA_VERSION,
  updatedAt: "",
  totalCount: 0,
  todayCount: 0,
  lastVisitDate: "",
  dailyGoalDate: "",
  dailyGoalsClaimed: [],
  streak: 0,
  unlockedAppearances: ["classic"],
  currentAppearance: "classic",
  unlockedSoundStyles: ["classic"],
  currentSoundStyle: "classic",
  achievements: [],
  achievementDates: {},
  achievedMilestones: [],
  soundEnabled: getDefaultSoundEnabled(),
  firstVisitComplete: false,
  displayedZenQuotes: [],
  shareMode: "battle",
  revealedCollectionCards: [],
  unlockedCollectionCards: [],
  collectionUnlockedAt: {},
  latestCollectionCard: "",
  soundStyleUnlockedAt: {},
  latestUnlockedSoundStyle: "",
};

const MAX_PATH_COUNT = 100000;
const LEVEL_CAP = 108;
const LEVEL_CURVE = 2.2;
const DAILY_GOALS = [9, 27, 54, 108];
const DAILY_GOAL_SET = new Set(DAILY_GOALS);
const SHARE_CARD_MODES = {
  battle: { label: "战绩卡" },
  ritual: { label: "仪式卡" },
  relic: { label: "秘藏卡" },
  brand: { label: "品牌卡" },
  milestone: { label: "节点卡" },
};
const KNOWN_SHARE_MODES = new Set(Object.keys(SHARE_CARD_MODES).filter((key) => key !== "milestone"));
const APPEARANCE_STAGES = [
  { key: "seed", name: "初鸣", min: 0, next: 108 },
  { key: "warm", name: "温养", min: 108, next: 1000 },
  { key: "resonant", name: "共振", min: 1000, next: 10000 },
  { key: "radiant", name: "显相", min: 10000, next: 50000 },
  { key: "transcendent", name: "圆光", min: 50000, next: null },
];
const RHYTHM_REWARD_COOLDOWN_MS = 9000;
const RHYTHM_STATES = [
  {
    key: "resonant",
    label: "共振节奏",
    shortLabel: "共振",
    variant: "rare",
    minHits: 6,
    minAverage: 520,
    maxAverage: 920,
    maxDeviation: 72,
    note: "你的呼吸和敲击已经对上了。",
  },
  {
    key: "steady",
    label: "入流节奏",
    shortLabel: "入流",
    variant: "common",
    minHits: 5,
    minAverage: 360,
    maxAverage: 1150,
    maxDeviation: 140,
    note: "继续保持这个频率，反馈会越来越稳。",
  },
];
const RHYTHM_GUIDANCE_STATES = [
  {
    key: "rushed",
    label: "节奏太急",
    shortLabel: "太急",
    tone: "warning",
    minHits: 4,
    maxAverage: 280,
    note: "你敲得有些太快了，先把呼吸放慢半拍。",
  },
  {
    key: "scattered",
    label: "节奏散了",
    shortLabel: "收拍",
    tone: "warning",
    minHits: 5,
    minDeviation: 190,
    note: "间隔有些乱，先把每一下的距离敲稳。",
  },
  {
    key: "dragging",
    label: "节奏太缓",
    shortLabel: "连起来",
    tone: "caution",
    minHits: 4,
    minAverage: 1320,
    note: "再连贯一点，木鱼才会真正开始回应。",
  },
];

const getLevelThreshold = (level) => {
  if (level <= 1) {
    return 0;
  }
  if (level >= LEVEL_CAP) {
    return MAX_PATH_COUNT;
  }
  const progress = (level - 1) / (LEVEL_CAP - 1);
  return Math.round((progress ** LEVEL_CURVE) * MAX_PATH_COUNT);
};

const LEVELS = Array.from({ length: LEVEL_CAP }, (_, index) => {
  const level = index + 1;
  const min = getLevelThreshold(level);
  const nextMin = level < LEVEL_CAP ? getLevelThreshold(level + 1) : Number.POSITIVE_INFINITY;
  return {
    level,
    min,
    max: nextMin === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : nextMin - 1,
    nextThreshold: nextMin,
  };
});

const REALMS = [
  { key: "echo", name: "初响", chip: "第一境", minLevel: 1, maxLevel: 4, note: "从第一下开始，先把节奏敲稳。" },
  { key: "breath", name: "持息", chip: "第二境", minLevel: 5, maxLevel: 9, note: "呼吸和手感逐渐同步，木鱼开始回应。" },
  { key: "focus", name: "守一", chip: "第三境", minLevel: 10, maxLevel: 16, note: "杂念开始退场，注意力被收进中心。" },
  { key: "stillness", name: "入静", chip: "第四境", minLevel: 17, maxLevel: 24, note: "节奏趋稳，敲击从动作变成状态。" },
  { key: "insight", name: "观心", chip: "第五境", minLevel: 25, maxLevel: 36, note: "修行开始向内，画面和心绪逐步对齐。" },
  { key: "clarity", name: "明识", chip: "第六境", minLevel: 37, maxLevel: 48, note: "木鱼的回响更长，感知开始变得细密。" },
  { key: "glow", name: "凝光", chip: "第七境", minLevel: 49, maxLevel: 60, note: "场域聚光，整座数字道场开始成形。" },
  { key: "resonance", name: "共振", chip: "第八境", minLevel: 61, maxLevel: 72, note: "你和木鱼进入同一拍点，反馈变得连贯。" },
  { key: "transmission", name: "通感", chip: "第九境", minLevel: 73, maxLevel: 84, note: "修行开始外溢，敲击和氛围互相放大。" },
  { key: "inscape", name: "觉照", chip: "第十境", minLevel: 85, maxLevel: 94, note: "每一次落槌都更清楚，节奏感完全立住。" },
  { key: "boundless", name: "无碍", chip: "第十一境", minLevel: 95, maxLevel: 102, note: "动作、声音、光效都进入通透状态。" },
  { key: "ascension", name: "飞升", chip: "第十二境", minLevel: 103, maxLevel: 107, note: "已经走到长线修行深处，十万近在眼前。" },
  { key: "completion", name: "圆满", chip: "终境", minLevel: 108, maxLevel: 108, note: "十万圆满，这一轮修行抵达终点。" },
];

const MILESTONES = {
  10: {
    kicker: "修行开始",
    note: "累计 10 下，节奏已经开始稳定成形。",
  },
  30: {
    kicker: "节奏成形",
    note: "累计 30 下，敲击开始形成稳定的呼吸感。",
  },
  50: {
    kicker: "节奏稳定",
    note: "累计 50 下，木鱼反馈开始更明显地回应你。",
  },
  100: {
    kicker: "冥想入口",
    note: "累计 100 下，已经进入更稳定的入静区间。",
  },
  300: {
    kicker: "光域扩张",
    note: "累计 300 下，粒子与叠影开始形成更完整的场域。",
  },
  500: {
    kicker: "半千法门",
    note: "累计 500 下，舞台已进入稳定的高反馈区间。",
  },
  1000: {
    kicker: "千次叩",
    note: "累计 1000 下，修行开始进入真正的长线节奏。",
  },
  3000: {
    kicker: "道场回响",
    note: "累计 3000 下，长线修行开始显现规模感。",
  },
  5000: {
    kicker: "深域共振",
    note: "累计 5000 下，整座数字道场进入更深的共振节奏。",
  },
  10000: {
    kicker: "飞升前夜",
    note: "累计 10000 下，道场已进入高能稳态。",
  },
  20000: {
    kicker: "长河累积",
    note: "累计 20000 下，修行已经从体验变成日常结构。",
  },
  30000: {
    kicker: "长明光环",
    note: "累计 30000 下，数字道场进入深层高能状态。",
  },
  50000: {
    kicker: "半程圆光",
    note: "累计 50000 下，已经跨入最终长段位，光环进入满幅状态。",
  },
  80000: {
    kicker: "终章预热",
    note: "累计 80000 下，距离十万圆满只差最后一段长线修行。",
  },
  100000: {
    kicker: "十万圆满",
    note: "累计 100000 下，抵达本轮修行终点。",
  },
};

const MAJOR_MILESTONE_VALUES = [1000, 10000, 50000, 100000];
const MAJOR_MILESTONE_META = {
  1000: {
    shareTitle: "千次叩节点卡",
    toastTitle: "千次叩已点亮",
    note: "这一刻开始，修行从短反馈进入长线积累。",
    accentStart: "#f7cf70",
    accentEnd: "#00e5ff",
  },
  10000: {
    shareTitle: "万次叩节点卡",
    toastTitle: "万次叩已点亮",
    note: "整座数字道场已经进入高能稳态。",
    accentStart: "#00e5ff",
    accentEnd: "#b388ff",
  },
  50000: {
    shareTitle: "五万圆光节点卡",
    toastTitle: "五万圆光已点亮",
    note: "你已经越过半程，法器和场域都进入满幅发光状态。",
    accentStart: "#f7cf70",
    accentEnd: "#b388ff",
  },
  100000: {
    shareTitle: "十万圆满节点卡",
    toastTitle: "十万圆满",
    note: "这一轮修行抵达终点，这张卡就是整段旅程的封印。",
    accentStart: "#fff0bf",
    accentEnd: "#8fd7ff",
  },
};

const ZEN_QUOTES = [
  "敲的不是木鱼，是杂念",
  "数字道场也需要一口静气",
  "每一次敲击，都是一次对齐",
  "心定下来，画面才会发光",
  "禅意不在古意，而在节奏",
  "让作品先有气场，再有信息",
];

const BLESSING_TAGS = ["静", "定", "空", "明", "净", "观", "入定", "回响"];
const RANDOM_EVENTS = [
  {
    label: "灵光",
    chance: 0.008,
    burst: false,
    rarity: "common",
    note: "一瞬间的念头被点亮。",
    minTotal: 12,
  },
  {
    label: "共振",
    chance: 0.006,
    burst: false,
    rarity: "common",
    note: "木鱼和呼吸暂时对齐了。",
    minTotal: 36,
  },
  {
    label: "暴击",
    chance: 0.0038,
    burst: true,
    rarity: "rare",
    note: "这一击落得很准，反馈被放大。",
    minTotal: 72,
    minCombo: 4,
  },
  {
    label: "顿悟",
    chance: 0.0018,
    burst: true,
    rarity: "epic",
    note: "极短的一瞬，场域像被彻底点亮。",
    minTotal: 216,
    minCombo: 6,
  },
];
const EVENT_RARITY_META = {
  common: {
    title: "偶发感应",
    noticeVariant: "common",
    feedbackVariant: "common",
  },
  rare: {
    title: "稀有事件",
    noticeVariant: "rare",
    feedbackVariant: "rare",
  },
  epic: {
    title: "极稀有事件",
    noticeVariant: "epic",
    feedbackVariant: "epic",
  },
};
const RANDOM_EVENT_COOLDOWN_MS = 22000;
const MIN_HIT_SOUND_GAP_MS = 34;
const MIN_HAPTIC_GAP_MS = 40;

const ACHIEVEMENTS = [
  {
    key: "first_hit",
    name: "初学者",
    conditionLabel: "完成首次敲击",
    reward: "解锁统计与修行状态",
  },
  {
    key: "practitioner",
    name: "修行者",
    conditionLabel: "累计 10 下",
    reward: "解锁霓虹法器与寺钟木音",
  },
  {
    key: "discipline",
    name: "持戒者",
    conditionLabel: "单日 108 下",
    reward: "解锁玉髓法器与玉磬清响",
  },
  {
    key: "streak_7",
    name: "连续 7 天",
    conditionLabel: "连续登录 7 天",
    reward: "解锁玄木法器与玄寺低鸣",
  },
  {
    key: "streak_30",
    name: "连续 30 天",
    conditionLabel: "连续登录 30 天",
    reward: "解锁琉璃法器与琉璃空鸣",
  },
  {
    key: "thousand",
    name: "千次叩",
    conditionLabel: "累计 1000 下",
    reward: "解锁金曜法器与赛博脉冲",
  },
  {
    key: "ten_thousand",
    name: "万次叩",
    conditionLabel: "累计 10000 下",
    reward: "解锁像素法器与像素鼓点",
  },
  {
    key: "collector",
    name: "收藏家",
    conditionLabel: "解锁所有外观",
    reward: "解锁全息法器与全息回环",
  },
];

const APPEARANCES = [
  {
    key: "classic",
    name: "传统木鱼",
    kind: "木质鱼形",
    material: "温润木纹",
    signal: "稳敲入定",
    condition: "默认解锁",
    unlockAchievement: null,
  },
  {
    key: "cyber",
    name: "赛博莲华",
    kind: "机甲莲座",
    material: "青金光轨",
    signal: "脉冲共振",
    condition: "达成 修行者",
    unlockAchievement: "practitioner",
  },
  {
    key: "jade",
    name: "玉磬灵鱼",
    kind: "玉石磬体",
    material: "清玉透光",
    signal: "清音入耳",
    condition: "达成 持戒者",
    unlockAchievement: "discipline",
  },
  {
    key: "gold",
    name: "金刚铃",
    kind: "金铸铃体",
    material: "鎏金高光",
    signal: "金声落槌",
    condition: "达成 千次叩",
    unlockAchievement: "thousand",
  },
  {
    key: "dark",
    name: "玄铁木鱼",
    kind: "黑铁法器",
    material: "暗纹金属",
    signal: "低频回响",
    condition: "连续 7 天",
    unlockAchievement: "streak_7",
  },
  {
    key: "crystal",
    name: "琉璃法盏",
    kind: "晶体盏形",
    material: "冰蓝折光",
    signal: "轻响透亮",
    condition: "连续 30 天",
    unlockAchievement: "streak_30",
  },
  {
    key: "pixel",
    name: "像素鼓阵",
    kind: "方格鼓体",
    material: "复古电子",
    signal: "颗粒节拍",
    condition: "达成 万次叩",
    unlockAchievement: "ten_thousand",
  },
  {
    key: "hologram",
    name: "全息法轮",
    kind: "虹彩轮廓",
    material: "全息辉光",
    signal: "最终回环",
    condition: "达成 收藏家",
    unlockAchievement: "collector",
  },
  {
    key: "mantra",
    name: "梵焰秘器",
    kind: "火纹钵体",
    material: "梵焰铜光",
    signal: "秘传燃光",
    condition: "解锁 隐藏秘藏 A",
    unlockAchievement: null,
    unlockCollectionCard: "secret_echo",
    countsTowardCollector: false,
  },
  {
    key: "void",
    name: "空域玄器",
    kind: "深空器形",
    material: "紫曜暗光",
    signal: "终藏回天",
    condition: "解锁 隐藏秘藏 B",
    unlockAchievement: null,
    unlockCollectionCard: "secret_completion",
    countsTowardCollector: false,
  },
];

const SOUND_STYLES = [
  {
    key: "classic",
    name: "经典木音",
    shortName: "经典木音",
    tone: "清脆、空心、木质",
    condition: "默认解锁",
    unlockAchievement: null,
    hit: {
      masterPeak: 0.2,
      masterDuration: 0.34,
      layers: [
        { type: "triangle", start: 312, end: 226, peak: 0.48, attack: 0.006, duration: 0.2 },
        { type: "sine", start: 680, end: 320, peak: 0.18, attack: 0.004, duration: 0.12, delay: 0.004 },
        { type: "sine", start: 1380, end: 980, peak: 0.05, attack: 0.002, duration: 0.045 },
      ],
    },
    unlockChord: { frequencies: [440, 554, 659], duration: 0.9, peak: 0.2 },
    ritualChord: { frequencies: [392, 587], duration: 1.8, peak: 0.18 },
  },
  {
    key: "temple",
    name: "寺钟木音",
    shortName: "寺钟木音",
    tone: "清木、回荡、寺感",
    condition: "达成 修行者",
    unlockAchievement: "practitioner",
    hit: {
      masterPeak: 0.18,
      masterDuration: 0.54,
      layers: [
        { type: "sine", start: 286, end: 196, peak: 0.34, attack: 0.012, duration: 0.34 },
        { type: "triangle", start: 572, end: 392, peak: 0.14, attack: 0.012, duration: 0.36, delay: 0.008 },
        { type: "sine", start: 980, end: 620, peak: 0.06, attack: 0.004, duration: 0.11, delay: 0.012 },
      ],
    },
    unlockChord: { frequencies: [392, 523, 784], duration: 1, peak: 0.18 },
    ritualChord: { frequencies: [312, 468, 624], duration: 1.9, peak: 0.16 },
  },
  {
    key: "jade",
    name: "玉磬清响",
    shortName: "玉磬清响",
    tone: "清透、细亮、玉感",
    condition: "达成 持戒者",
    unlockAchievement: "discipline",
    hit: {
      masterPeak: 0.18,
      masterDuration: 0.48,
      layers: [
        { type: "sine", start: 520, end: 380, peak: 0.26, attack: 0.008, duration: 0.26 },
        { type: "triangle", start: 1040, end: 760, peak: 0.16, attack: 0.01, duration: 0.24, delay: 0.005 },
        { type: "sine", start: 1420, end: 960, peak: 0.08, attack: 0.006, duration: 0.18, delay: 0.012 },
      ],
    },
    unlockChord: { frequencies: [523, 659, 880], duration: 0.95, peak: 0.18 },
    ritualChord: { frequencies: [440, 659, 988], duration: 1.75, peak: 0.16 },
  },
  {
    key: "cyber",
    name: "赛博脉冲",
    shortName: "赛博脉冲",
    tone: "脉冲、电子、锋利",
    condition: "达成 千次叩",
    unlockAchievement: "thousand",
    hit: {
      masterPeak: 0.22,
      masterDuration: 0.32,
      layers: [
        { type: "square", start: 180, end: 136, peak: 0.2, attack: 0.008, duration: 0.18 },
        { type: "triangle", start: 760, end: 260, peak: 0.12, attack: 0.004, duration: 0.08 },
        { type: "sawtooth", start: 1260, end: 560, peak: 0.05, attack: 0.003, duration: 0.06, delay: 0.002 },
      ],
    },
    unlockChord: { frequencies: [330, 495, 742], duration: 0.84, peak: 0.17 },
    ritualChord: { frequencies: [262, 392, 784], duration: 1.5, peak: 0.15 },
  },
  {
    key: "dark",
    name: "玄寺低鸣",
    shortName: "玄寺低鸣",
    tone: "低沉、黯光、厚重",
    condition: "连续 7 天",
    unlockAchievement: "streak_7",
    hit: {
      masterPeak: 0.24,
      masterDuration: 0.5,
      layers: [
        { type: "triangle", start: 152, end: 118, peak: 0.74, attack: 0.012, duration: 0.34 },
        { type: "sine", start: 456, end: 220, peak: 0.12, attack: 0.018, duration: 0.28, delay: 0.015 },
      ],
    },
    unlockChord: { frequencies: [294, 392, 494], duration: 1.02, peak: 0.19 },
    ritualChord: { frequencies: [196, 294, 392], duration: 1.95, peak: 0.17 },
  },
  {
    key: "crystal",
    name: "琉璃空鸣",
    shortName: "琉璃空鸣",
    tone: "空灵、冰透、悬浮",
    condition: "连续 30 天",
    unlockAchievement: "streak_30",
    hit: {
      masterPeak: 0.17,
      masterDuration: 0.62,
      layers: [
        { type: "sine", start: 660, end: 480, peak: 0.18, attack: 0.006, duration: 0.24 },
        { type: "triangle", start: 1180, end: 820, peak: 0.14, attack: 0.008, duration: 0.3, delay: 0.005 },
        { type: "sine", start: 1680, end: 1240, peak: 0.08, attack: 0.01, duration: 0.36, delay: 0.016 },
      ],
    },
    unlockChord: { frequencies: [587, 740, 1175], duration: 1.08, peak: 0.18 },
    ritualChord: { frequencies: [494, 740, 988], duration: 2, peak: 0.16 },
  },
  {
    key: "pixel",
    name: "像素鼓点",
    shortName: "像素鼓点",
    tone: "颗粒、方波、节拍感",
    condition: "达成 万次叩",
    unlockAchievement: "ten_thousand",
    hit: {
      masterPeak: 0.2,
      masterDuration: 0.24,
      layers: [
        { type: "square", start: 240, end: 180, peak: 0.26, attack: 0.004, duration: 0.1 },
        { type: "square", start: 480, end: 280, peak: 0.12, attack: 0.002, duration: 0.06, delay: 0.008 },
        { type: "triangle", start: 920, end: 420, peak: 0.06, attack: 0.002, duration: 0.04, delay: 0.004 },
      ],
    },
    unlockChord: { frequencies: [330, 660, 990], duration: 0.72, peak: 0.15 },
    ritualChord: { frequencies: [294, 588, 882], duration: 1.26, peak: 0.14 },
  },
  {
    key: "hologram",
    name: "全息回环",
    shortName: "全息回环",
    tone: "虹彩、回环、最终态",
    condition: "达成 收藏家",
    unlockAchievement: "collector",
    hit: {
      masterPeak: 0.2,
      masterDuration: 0.74,
      layers: [
        { type: "triangle", start: 320, end: 240, peak: 0.28, attack: 0.008, duration: 0.24 },
        { type: "sine", start: 960, end: 660, peak: 0.14, attack: 0.008, duration: 0.34, delay: 0.004 },
        { type: "sawtooth", start: 1440, end: 880, peak: 0.06, attack: 0.01, duration: 0.26, delay: 0.018 },
        { type: "triangle", start: 1920, end: 1320, peak: 0.04, attack: 0.012, duration: 0.4, delay: 0.03 },
      ],
    },
    unlockChord: { frequencies: [392, 587, 784, 1175], duration: 1.18, peak: 0.18 },
    ritualChord: { frequencies: [330, 494, 740, 988], duration: 2.1, peak: 0.16 },
  },
  {
    key: "mantra",
    name: "梵焰秘传",
    shortName: "梵焰秘传",
    tone: "秘传、梵唱、燃光",
    condition: "解锁隐藏秘藏 A",
    unlockAchievement: null,
    unlockCollectionCard: "secret_echo",
    hit: {
      masterPeak: 0.22,
      masterDuration: 0.86,
      layers: [
        { type: "triangle", start: 286, end: 214, peak: 0.3, attack: 0.01, duration: 0.28 },
        { type: "sine", start: 572, end: 392, peak: 0.16, attack: 0.012, duration: 0.42, delay: 0.01 },
        { type: "triangle", start: 1144, end: 786, peak: 0.07, attack: 0.016, duration: 0.54, delay: 0.03 },
      ],
    },
    unlockChord: { frequencies: [349.2, 523.2, 698.4], duration: 1.3, peak: 0.2 },
    ritualChord: { frequencies: [261.6, 392, 523.2, 698.4], duration: 2.2, peak: 0.18 },
  },
  {
    key: "void",
    name: "终藏回天",
    shortName: "终藏回天",
    tone: "终藏、空域、回天",
    condition: "解锁隐藏秘藏 B",
    unlockAchievement: null,
    unlockCollectionCard: "secret_completion",
    hit: {
      masterPeak: 0.23,
      masterDuration: 1.02,
      layers: [
        { type: "sine", start: 240, end: 180, peak: 0.26, attack: 0.008, duration: 0.34 },
        { type: "triangle", start: 720, end: 480, peak: 0.16, attack: 0.012, duration: 0.52, delay: 0.014 },
        { type: "sawtooth", start: 1320, end: 880, peak: 0.05, attack: 0.014, duration: 0.58, delay: 0.04 },
        { type: "sine", start: 1760, end: 1240, peak: 0.04, attack: 0.018, duration: 0.74, delay: 0.08 },
      ],
    },
    unlockChord: { frequencies: [293.7, 440, 659.3, 987.8], duration: 1.6, peak: 0.2 },
    ritualChord: { frequencies: [220, 329.6, 493.9, 740], duration: 2.5, peak: 0.18 },
  },
];

const MILESTONE_VALUES = Object.keys(MILESTONES)
  .map(Number)
  .sort((a, b) => a - b);

const KNOWN_ACHIEVEMENT_KEYS = new Set(ACHIEVEMENTS.map((achievement) => achievement.key));
const KNOWN_APPEARANCE_KEYS = new Set(APPEARANCES.map((appearance) => appearance.key));
const KNOWN_SOUND_STYLE_KEYS = new Set(SOUND_STYLES.map((style) => style.key));
const SOUND_STYLE_MAP = new Map(SOUND_STYLES.map((style) => [style.key, style]));
const SOUND_STYLE_FEEDBACK = {
  classic: {
    comboLabel: "FLOW",
    burstLabel: "BURST",
    comboColor: "",
    burstColor: "#dac5ff",
    blessingTags: BLESSING_TAGS,
    signalTitle: "感应",
    signalNote: "木纹的回响开始和你的节奏对齐。",
    eventAliases: {
      灵光: "灵光",
      共振: "共振",
      暴击: "暴击",
      顿悟: "顿悟",
    },
  },
  temple: {
    comboLabel: "钟振",
    burstLabel: "钟鸣",
    comboColor: "#ffdba0",
    burstColor: "#ffe6ba",
    blessingTags: ["梵", "鸣", "回响", "定", "钟意"],
    signalTitle: "钟感",
    signalNote: "这一轮敲击像寺钟一样开始拉长回响。",
    eventAliases: {
      灵光: "梵光",
      共振: "钟振",
      暴击: "金鸣",
      顿悟: "钟悟",
    },
  },
  jade: {
    comboLabel: "玉响",
    burstLabel: "清越",
    comboColor: "#bdf4d8",
    burstColor: "#e0fff0",
    blessingTags: ["净", "澄", "明", "清响", "玉振"],
    signalTitle: "清感",
    signalNote: "玉磬的高频开始让整个场域更清透。",
    eventAliases: {
      灵光: "清光",
      共振: "玉振",
      暴击: "脆响",
      顿悟: "清悟",
    },
  },
  cyber: {
    comboLabel: "脉冲",
    burstLabel: "超频",
    comboColor: "#97efff",
    burstColor: "#b8f6ff",
    blessingTags: ["SYNC", "PULSE", "跃迁", "校准", "闪流"],
    signalTitle: "脉冲感应",
    signalNote: "赛博脉冲已经开始把敲击转成电子节拍。",
    eventAliases: {
      灵光: "闪流",
      共振: "同步",
      暴击: "超频",
      顿悟: "跃迁",
    },
  },
  dark: {
    comboLabel: "沉击",
    burstLabel: "重鸣",
    comboColor: "#cad2e8",
    burstColor: "#e4d9ff",
    blessingTags: ["玄", "寂", "潜", "低鸣", "深响"],
    signalTitle: "暗感",
    signalNote: "低频像在地面下走动，整个舞台都沉了下来。",
    eventAliases: {
      灵光: "潜光",
      共振: "深振",
      暴击: "重击",
      顿悟: "幽悟",
    },
  },
  crystal: {
    comboLabel: "空鸣",
    burstLabel: "透响",
    comboColor: "#d3f8ff",
    burstColor: "#f2fbff",
    blessingTags: ["澄", "晶", "空", "折光", "透响"],
    signalTitle: "晶感",
    signalNote: "琉璃空鸣让击中的边缘更亮、更通透。",
    eventAliases: {
      灵光: "晶光",
      共振: "折振",
      暴击: "透击",
      顿悟: "晶悟",
    },
  },
  pixel: {
    comboLabel: "连点",
    burstLabel: "像爆",
    comboColor: "#ffe499",
    burstColor: "#f1d5ff",
    blessingTags: ["PIX", "BYTE", "帧", "像素", "连线"],
    signalTitle: "像素感应",
    signalNote: "节拍开始像旧时代街机一样一格一格地点亮。",
    eventAliases: {
      灵光: "闪帧",
      共振: "连线",
      暴击: "像爆",
      顿悟: "满帧",
    },
  },
  hologram: {
    comboLabel: "回环",
    burstLabel: "全息",
    comboColor: "#d7d0ff",
    burstColor: "#f7e9ff",
    blessingTags: ["虹", "环", "映", "叠层", "辉面"],
    signalTitle: "全息感应",
    signalNote: "回环开始叠层，你像在同一击里听到了多个维度。",
    eventAliases: {
      灵光: "辉映",
      共振: "回环",
      暴击: "虹爆",
      顿悟: "全息",
    },
  },
  mantra: {
    comboLabel: "梵燃",
    burstLabel: "诵焰",
    comboColor: "#ffd3a2",
    burstColor: "#ffe7c7",
    blessingTags: ["梵", "焰", "诵", "回向", "燃光"],
    signalTitle: "梵感",
    signalNote: "隐藏秘藏点亮后，敲击里开始带上低声梵唱与火焰余响。",
    eventAliases: {
      灵光: "梵火",
      共振: "梵振",
      暴击: "焰鸣",
      顿悟: "回向",
    },
  },
  void: {
    comboLabel: "回天",
    burstLabel: "终藏",
    comboColor: "#d5d9ff",
    burstColor: "#f0e4ff",
    blessingTags: ["空", "回", "终", "寂", "天域"],
    signalTitle: "空域感应",
    signalNote: "终藏音色像把道场抽成了一层空域回响，整个舞台都变轻了。",
    eventAliases: {
      灵光: "回光",
      共振: "空振",
      暴击: "终鸣",
      顿悟: "回天",
    },
  },
};

const SOUND_STYLE_TUNING = {
  classic: {
    transient: { peak: 0.056, duration: 0.022, filterStart: 4600, filterEnd: 1900 },
    resonance: { frequency: 660, q: 5.6, mix: 0.34 },
    air: { frequency: 2600, mix: 0.045 },
    echo: { time: 0.05, feedback: 0.09, mix: 0.04, lowpass: 2100 },
    stereoWidth: 0.03,
    drift: 0.007,
  },
  temple: {
    transient: { peak: 0.044, duration: 0.026, filterStart: 4000, filterEnd: 1600 },
    resonance: { frequency: 520, q: 6.8, mix: 0.32 },
    air: { frequency: 2400, mix: 0.06 },
    echo: { time: 0.11, feedback: 0.16, mix: 0.08, lowpass: 2200 },
    stereoWidth: 0.05,
    drift: 0.008,
  },
  jade: {
    transient: { peak: 0.038, duration: 0.03, filterStart: 4600, filterEnd: 2200 },
    resonance: { frequency: 860, q: 7.8, mix: 0.22 },
    air: { frequency: 2600, mix: 0.14 },
    echo: { time: 0.11, feedback: 0.16, mix: 0.11, lowpass: 3200 },
    stereoWidth: 0.12,
    drift: 0.01,
  },
  cyber: {
    transient: { peak: 0.06, duration: 0.026, filterStart: 5400, filterEnd: 2400 },
    resonance: { frequency: 980, q: 9, mix: 0.2 },
    air: { frequency: 3400, mix: 0.12 },
    echo: { time: 0.09, feedback: 0.18, mix: 0.13, lowpass: 2900 },
    stereoWidth: 0.22,
    drift: 0.02,
  },
  dark: {
    transient: { peak: 0.03, duration: 0.04, filterStart: 1800, filterEnd: 720 },
    resonance: { frequency: 260, q: 4.4, mix: 0.34 },
    air: { frequency: 1400, mix: 0.04 },
    echo: { time: 0.17, feedback: 0.24, mix: 0.13, lowpass: 1800 },
    stereoWidth: 0.03,
    drift: 0.008,
  },
  crystal: {
    transient: { peak: 0.045, duration: 0.028, filterStart: 5200, filterEnd: 2600 },
    resonance: { frequency: 1180, q: 8.6, mix: 0.18 },
    air: { frequency: 3800, mix: 0.16 },
    echo: { time: 0.16, feedback: 0.18, mix: 0.14, lowpass: 3600 },
    stereoWidth: 0.16,
    drift: 0.014,
  },
  pixel: {
    transient: { peak: 0.055, duration: 0.02, filterStart: 2600, filterEnd: 1400 },
    resonance: { frequency: 760, q: 8, mix: 0.12 },
    air: { frequency: 2200, mix: 0.04 },
    echo: { time: 0.055, feedback: 0.08, mix: 0.05, lowpass: 2200 },
    stereoWidth: 0.1,
    drift: 0.018,
  },
  hologram: {
    transient: { peak: 0.045, duration: 0.03, filterStart: 4800, filterEnd: 2100 },
    resonance: { frequency: 1040, q: 7.4, mix: 0.24 },
    air: { frequency: 3000, mix: 0.14 },
    echo: { time: 0.13, feedback: 0.22, mix: 0.16, lowpass: 3400 },
    stereoWidth: 0.18,
    drift: 0.016,
  },
  mantra: {
    transient: { peak: 0.04, duration: 0.03, filterStart: 3600, filterEnd: 1600 },
    resonance: { frequency: 510, q: 5.8, mix: 0.32 },
    air: { frequency: 2400, mix: 0.08 },
    echo: { time: 0.18, feedback: 0.24, mix: 0.18, lowpass: 2400 },
    stereoWidth: 0.1,
    drift: 0.012,
  },
  void: {
    transient: { peak: 0.032, duration: 0.038, filterStart: 2400, filterEnd: 980 },
    resonance: { frequency: 340, q: 5.2, mix: 0.36 },
    air: { frequency: 1800, mix: 0.06 },
    echo: { time: 0.22, feedback: 0.28, mix: 0.18, lowpass: 2000 },
    stereoWidth: 0.08,
    drift: 0.01,
  },
};

const KNOWN_QUOTES = new Set(ZEN_QUOTES);
const COLLECTION_GROUPS = [
  { key: "public", kicker: "PUBLIC RELICS", title: "公开秘藏" },
  { key: "milestone", kicker: "MILESTONE COVERS", title: "节点封面" },
  { key: "hidden", kicker: "HIDDEN RELICS", title: "隐藏款" },
];
const COLLECTION_CARDS = [
  {
    key: "cyber_buddha",
    group: "public",
    index: "A-01",
    kicker: "PUBLIC RELIC",
    title: "赛博佛主",
    image: "./assets/works_v2/work1.jpg",
    caption: "以佛主轮廓、霓虹衣纹与金色光环构成赛博禅意主视觉。",
    medium: "佛主轮廓 / 金色光环 / 霓虹衣纹",
    tone: "庄严、发光、强识别",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("first_hit"),
    getProgress: () =>
      state.achievements.includes("first_hit") ? "首次敲击已点亮这张秘藏。" : "完成首次敲击即可点亮这张秘藏。",
  },
  {
    key: "cyber_orient",
    group: "public",
    index: "A-02",
    kicker: "PUBLIC RELIC",
    title: "赛博东方",
    image: "./assets/works_v2/work2.jpg",
    caption: "东方符号与未来感材质叠合，形成高辨识度的数字叙事风格。",
    medium: "东方符号 / 未来材质 / 数字叙事",
    tone: "冷感、锋利、未来东方",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("practitioner"),
    getProgress: () =>
      state.achievements.includes("practitioner")
        ? "累计 10 下已达成，这张秘藏已经归入藏阁。"
        : `累计 ${state.totalCount} / 10，下一个公开秘藏即将显影。`,
  },
  {
    key: "digital_relic",
    group: "public",
    index: "A-03",
    kicker: "PUBLIC RELIC",
    title: "数字禅珠",
    image: "./assets/works_v2/work3.jpg",
    caption: "借助珠串、发光符文与沉静背景，营造一种可被凝视的数字仪式感。",
    medium: "珠串 / 符文 / 沉静背景",
    tone: "凝视、低饱和、仪式感",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("discipline"),
    getProgress: () =>
      state.achievements.includes("discipline")
        ? "单日 108 下已圆满，这张秘藏已经完全显影。"
        : `今日 ${state.todayCount} / 108，下一个公开秘藏由今日修行点亮。`,
  },
  {
    key: "machine_divinity",
    group: "public",
    index: "A-04",
    kicker: "PUBLIC RELIC",
    title: "未来佛像",
    image: "./assets/works_v2/work4.jpg",
    caption: "将佛像面部、机械结构与符文光轨并置，强化赛博佛主主题。",
    medium: "佛像面部 / 机械结构 / 光轨",
    tone: "高压、机械、神性",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("thousand"),
    getProgress: () =>
      state.achievements.includes("thousand")
        ? "千次叩节点已越过，这张秘藏已经收录。"
        : `累计 ${state.totalCount.toLocaleString("zh-CN")} / 1,000，长线修行会点亮它。`,
  },
  {
    key: "material_ritual",
    group: "public",
    index: "A-05",
    kicker: "PUBLIC RELIC",
    title: "赛博禅木",
    image: "./assets/works_v2/work5.jpg",
    caption: "以木质、光纹与数字纹理混合，延展木鱼装置的材质想象。",
    medium: "木质肌理 / 光纹 / 数字纹理",
    tone: "温热、材质感、装置化",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("ten_thousand"),
    getProgress: () =>
      state.achievements.includes("ten_thousand")
        ? "万次叩已达成，这张秘藏归档完成。"
        : `累计 ${state.totalCount.toLocaleString("zh-CN")} / 10,000，深域秘藏仍在等待。`,
  },
  {
    key: "luminous_finale",
    group: "public",
    index: "A-06",
    kicker: "PUBLIC RELIC",
    title: "数字佛光",
    image: "./assets/works_v2/work6.jpg",
    caption: "通过金光扩散与冷色辉光的对撞，完成更完整的佛主视觉终场。",
    medium: "金光扩散 / 冷色辉光 / 终场构图",
    tone: "终章、扩散、满幅光感",
    isRevealed: () => true,
    isUnlocked: () => state.achievements.includes("collector"),
    getProgress: () => {
      const unlockedBase = APPEARANCES.filter((appearance) => appearance.key !== "hologram").filter((appearance) =>
        state.unlockedAppearances.includes(appearance.key),
      ).length;
      return state.achievements.includes("collector")
        ? "公开秘藏线已经圆满，终场光感秘藏已完全解锁。"
        : `法器收集 ${unlockedBase} / 7，继续点亮法器以唤出最终公开秘藏。`;
    },
  },
  {
    key: "node_thousand",
    group: "milestone",
    index: "N-01",
    kicker: "NODE COVER",
    title: "千次叩节点卡",
    image: "./assets/works_v2/node-thousand.jpg",
    caption: "记录第一次真正进入长线修行之后的节点封面。",
    medium: "节点卡 / 千次叩 / 长线起点",
    tone: "节点、封印、可分享",
    isRevealed: () => state.totalCount >= 300,
    isUnlocked: () => state.totalCount >= 1000,
    getProgress: () =>
      state.totalCount >= 1000
        ? "千次叩节点已越过，这张节点卡已经收录。"
        : state.totalCount >= 300
          ? `累计 ${state.totalCount.toLocaleString("zh-CN")} / 1,000，下一个节点封面正在显影。`
          : "累计达到 300 下后，这张节点卡会先显影。",
  },
  {
    key: "node_ten_thousand",
    group: "milestone",
    index: "N-02",
    kicker: "NODE COVER",
    title: "万次叩节点卡",
    image: "./assets/works_v2/node-ten-thousand.jpg",
    caption: "记录数字道场进入高能稳态后的节点封面。",
    medium: "节点卡 / 万次叩 / 高能稳态",
    tone: "庄严、稳态、截图时刻",
    isRevealed: () => state.totalCount >= 5000,
    isUnlocked: () => state.totalCount >= 10000,
    getProgress: () =>
      state.totalCount >= 10000
        ? "万次叩节点已越过，这张节点卡已经归入秘藏。"
        : state.totalCount >= 5000
          ? `累计 ${state.totalCount.toLocaleString("zh-CN")} / 10,000，深层节点封面已开始显影。`
          : "累计达到 5,000 下后，这张节点卡会先显影。",
  },
  {
    key: "secret_echo",
    group: "hidden",
    index: "S-01",
    kicker: "HIDDEN RELIC",
    title: "隐藏秘藏 A",
    hiddenTitle: "未显影秘藏",
    image: "./assets/works_v2/secret-echo.jpg",
    caption: "当持戒与长线节奏同时成立，这张隐藏秘藏才会露出完整轮廓。",
    medium: "隐藏款 / 双条件 / 中段显影",
    tone: "神秘、半显影、等待点亮",
    placeholder: "SIGNAL",
    isRevealed: () => state.totalCount >= 3000,
    isUnlocked: () => state.achievements.includes("discipline") && state.achievements.includes("thousand"),
    getProgress: () => {
      const conditionsMet = [state.achievements.includes("discipline"), state.achievements.includes("thousand")].filter(Boolean)
        .length;
      return state.totalCount >= 3000
        ? `隐藏条件已完成 ${conditionsMet} / 2，还需要同时满足“单日 108 下”和“千次叩”。`
        : "累计达到 3,000 下后，这张隐藏秘藏才会先显影。";
    },
  },
  {
    key: "secret_completion",
    group: "hidden",
    index: "S-02",
    kicker: "HIDDEN RELIC",
    title: "隐藏秘藏 B",
    hiddenTitle: "深层秘藏",
    image: "./assets/works_v2/secret-completion.jpg",
    caption: "只有在收集线接近圆满时，这张深层秘藏才会完整开启。",
    medium: "隐藏款 / 终段条件 / 深层奖励",
    tone: "终段、克制、最终封印",
    placeholder: "VEIL",
    isRevealed: () => state.totalCount >= 10000,
    isUnlocked: () => state.achievements.includes("collector") || state.totalCount >= 100000,
    getProgress: () => {
      if (state.achievements.includes("collector") || state.totalCount >= 100000) {
        return "终段条件已达成，这张深层隐藏秘藏已经开启。";
      }
      if (state.totalCount >= 10000) {
        return `继续朝收藏家或十万圆满推进，当前累计 ${state.totalCount.toLocaleString("zh-CN")} 下。`;
      }
      return "累计达到 10,000 下后，这张深层秘藏才会显影。";
    },
  },
];
const COLLECTION_CARD_MAP = new Map(COLLECTION_CARDS.map((card) => [card.key, card]));
const KNOWN_COLLECTION_KEYS = new Set(COLLECTION_CARDS.map((card) => card.key));

const STRIKE_TIERS = [
  {
    max: 9,
    particles: 8,
    ripple: "rgba(247, 207, 112, 0.42)",
    shadow: "rgba(247, 207, 112, 0.18)",
    particleGradient:
      "radial-gradient(circle, rgba(255,245,225,0.95), rgba(247,207,112,0.84))",
  },
  {
    max: 99,
    particles: 10,
    ripple: "rgba(0, 229, 255, 0.42)",
    shadow: "rgba(0, 229, 255, 0.18)",
    particleGradient:
      "radial-gradient(circle, rgba(243,250,255,0.95), rgba(0,229,255,0.84))",
  },
  {
    max: 999,
    particles: 12,
    ripple: "rgba(179, 136, 255, 0.42)",
    shadow: "rgba(179, 136, 255, 0.18)",
    particleGradient:
      "radial-gradient(circle, rgba(255,248,255,0.95), rgba(179,136,255,0.84))",
  },
  {
    max: 9999,
    particles: 14,
    ripple: "rgba(255, 199, 117, 0.48)",
    shadow: "rgba(0, 229, 255, 0.18)",
    particleGradient:
      "radial-gradient(circle, rgba(255,248,228,0.95), rgba(255,199,117,0.84))",
  },
  {
    max: Number.POSITIVE_INFINITY,
    particles: 18,
    ripple: "rgba(255, 199, 117, 0.56)",
    shadow: "rgba(179, 136, 255, 0.22)",
    particleGradient:
      "radial-gradient(circle, rgba(255,248,228,0.98), rgba(255,199,117,0.92), rgba(179,136,255,0.82))",
  },
];

const siteScroll = document.querySelector(".site-scroll");
const body = document.body;
const reveals = document.querySelectorAll(".reveal");
const yearNode = document.getElementById("year");
const vaultSectionsNode = document.getElementById("vault-sections");
const vaultCardTemplate = document.getElementById("vault-card-template");
const vaultSectionTemplate = document.getElementById("vault-section-template");
const vaultProgressNode = document.getElementById("vault-progress");
const vaultLatestNode = document.getElementById("vault-latest");
const vaultPublicCountNode = document.getElementById("vault-public-count");
const vaultNodeCountNode = document.getElementById("vault-node-count");
const vaultSecretCountNode = document.getElementById("vault-secret-count");
const vaultNextHintNode = document.getElementById("vault-next-hint");
const vaultFootnoteNode = document.getElementById("vault-footnote");
const vaultSpotlight = document.getElementById("vault-spotlight");
const vaultSpotlightKicker = document.getElementById("vault-spotlight-kicker");
const vaultSpotlightTitle = document.getElementById("vault-spotlight-title");
const vaultSpotlightNote = document.getElementById("vault-spotlight-note");
const vaultSpotlightMeta = document.getElementById("vault-spotlight-meta");
const vaultSpotlightProgress = document.getElementById("vault-spotlight-progress");
const vaultSpotlightRevealed = document.getElementById("vault-spotlight-revealed");
const vaultSpotlightRevealedFill = document.getElementById("vault-spotlight-revealed-fill");
const vaultSpotlightUnlocked = document.getElementById("vault-spotlight-unlocked");
const vaultSpotlightUnlockedFill = document.getElementById("vault-spotlight-unlocked-fill");
const vaultSpotlightAction = document.getElementById("vault-spotlight-action");
const vaultSpotlightState = document.getElementById("vault-spotlight-state");
const vaultSpotlightImage = document.getElementById("vault-spotlight-image");
const vaultSpotlightPlaceholder = document.getElementById("vault-spotlight-placeholder");
const vaultSpotlightCta = document.getElementById("vault-spotlight-cta");

const totalCountNode = document.getElementById("total-count");
const todayCountNode = document.getElementById("today-count");
const streakCountNode = document.getElementById("streak-count");
const realmNameNode = document.getElementById("realm-name");
const realmProgressNode = document.getElementById("realm-progress");
const realmChipNode = document.getElementById("realm-chip");
const realmGuideToggle = document.getElementById("realm-guide-toggle");
const realmGuide = document.getElementById("realm-guide");
const realmGuideList = document.getElementById("realm-guide-list");
const realmCardNode = document.querySelector(".stat-card-realm");
const statsFootnoteNode = document.getElementById("stats-footnote");
const appearanceResonanceMetaNode = document.getElementById("appearance-resonance-meta");
const dailyGoalStatusNode = document.getElementById("daily-goal-status");
const dailyGoalFillNode = document.getElementById("daily-goal-fill");
const dailyGoalListNode = document.getElementById("daily-goal-list");
const nextMilestoneLabelNode = document.getElementById("next-milestone-label");
const nextMilestoneFillNode = document.getElementById("milestone-progress-fill");
const nextMilestoneNoteNode = document.getElementById("milestone-progress-note");
const majorMilestoneRail = document.getElementById("major-milestone-rail");
const ritualVaultKickerNode = document.getElementById("ritual-vault-kicker");
const ritualVaultTitleNode = document.getElementById("ritual-vault-title");
const ritualVaultNoteNode = document.getElementById("ritual-vault-note");
const ritualVaultStateNode = document.getElementById("ritual-vault-state");
const achievementUnlockedCountNode = document.getElementById("achievement-unlocked-count");
const appearanceCurrentNameNode = document.getElementById("appearance-current-name");
const soundStyleCurrentNameNode = document.getElementById("sound-style-current-name");
const soundStyleNextHintNode = document.getElementById("sound-style-next-hint");
const soundStyleSecretCountNode = document.getElementById("sound-style-secret-count");
const soundStyleSecretHintNode = document.getElementById("sound-style-secret-hint");
const statsPanel = document.querySelector(".stats-panel");
const statsPopoverZone = document.getElementById("stats-popover-zone");

const soundToggle = document.getElementById("sound-toggle");
const soundIcon = document.getElementById("sound-icon");
const soundLabel = document.getElementById("sound-label");

const hitButton = document.getElementById("mokugyo-hit");
const resetButton = document.getElementById("mokugyo-reset");
const instrumentButton = document.getElementById("mokugyo-instrument");
const particleLayer = document.getElementById("mokugyo-particles");
const ritualStage = document.getElementById("ritual-stage");
const comboBadge = document.getElementById("combo-badge");
const ritualFlowNode = document.getElementById("ritual-flow");

const achievementList = document.getElementById("achievement-list");
const appearanceList = document.getElementById("appearance-list");
const soundStyleList = document.getElementById("sound-style-list");
const noticeStack = document.getElementById("notice-stack");
const panelTabs = document.querySelectorAll("[data-panel-target]");
const drawerPanels = document.querySelectorAll(".drawer-panel");

const shareGenerateButton = document.getElementById("share-generate");
const shareDownloadButton = document.getElementById("share-download");
const shareCopyButton = document.getElementById("share-copy-link");
const shareNativeButton = document.getElementById("share-native");
const sharePreviewLink = document.getElementById("share-preview-link");
const shareCanvas = document.getElementById("share-canvas");
const shareModeButtons = document.querySelectorAll("[data-share-mode]");
const statsDrawerTitleNode = document.getElementById("stats-drawer-title");
const statsDrawerCloseButton = document.getElementById("stats-drawer-close");
const realmGuideCloseButton = document.getElementById("realm-guide-close");

const milestoneToast = document.getElementById("milestone-toast");
const milestoneKicker = document.getElementById("milestone-kicker");
const milestoneTitle = document.getElementById("milestone-title");
const milestoneNote = document.getElementById("milestone-note");
const milestoneFigures = document.getElementById("milestone-figures");
const milestoneMeta = document.getElementById("milestone-meta");
const collectionToast = document.getElementById("collection-toast");
const collectionToastKicker = document.getElementById("collection-toast-kicker");
const collectionToastTitle = document.getElementById("collection-toast-title");
const collectionToastNote = document.getElementById("collection-toast-note");
const collectionToastFigures = document.getElementById("collection-toast-figures");
const collectionToastMeta = document.getElementById("collection-toast-meta");
const soundStyleToast = document.getElementById("sound-style-toast");
const soundStyleToastKicker = document.getElementById("sound-style-toast-kicker");
const soundStyleToastTitle = document.getElementById("sound-style-toast-title");
const soundStyleToastNote = document.getElementById("sound-style-toast-note");
const soundStyleToastFigures = document.getElementById("sound-style-toast-figures");
const soundStyleToastMeta = document.getElementById("sound-style-toast-meta");

const lightbox = document.getElementById("lightbox");
const lightboxVisual = document.getElementById("lightbox-visual");
const lightboxGhost = document.getElementById("lightbox-ghost");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxKicker = document.getElementById("lightbox-kicker");
const lightboxMeta = document.getElementById("lightbox-meta");
const lightboxClose = document.getElementById("lightbox-close");

let audioContext;
let audioMasterInput;
let audioNoiseBuffer;
let strikeTimer;
let comboTimer;
let toastTimer;
let collectionToastTimer;
let soundStyleToastTimer;
let pulseTimer;
let comboBadgeTimer;
let majorMilestoneTimer;
let viewportSyncFrame = 0;
let lastRandomEventAt = 0;
let lastHitSoundAt = 0;
let lastHapticAt = 0;
let lastRhythmRewardAt = 0;
let lastRhythmHintAt = 0;
let lastRhythmFeedbackKey = "";
let ritualFlowHoldTimer = 0;
let recentHits = [];
let latestShareDataUrl = "";
let isHydrating = true;
let popoverPinned = false;
let persistTimer = null;
let restoredStateSource = "current";
let closeLightboxAction = () => {};
const PANEL_DRAWER_TITLES = {
  achievements: "成就",
  appearances: "法器",
  sounds: "音色",
  share: "分享",
};

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateTime = (dateValue) => {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  return `${localDateKey(date)} ${`${date.getHours()}`.padStart(2, "0")}:${`${date.getMinutes()}`.padStart(2, "0")}`;
};

const isYesterday = (dateString) => {
  if (!dateString) {
    return false;
  }
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  return localDateKey(date) === localDateKey(yesterday);
};

const getLevelInfo = (totalCount) => {
  const safeCount = Math.max(0, Math.min(totalCount, MAX_PATH_COUNT));
  const currentLevel =
    LEVELS.find((level) => safeCount >= level.min && safeCount <= level.max) || LEVELS[LEVELS.length - 1];
  const nextThreshold = currentLevel.level >= LEVEL_CAP ? null : currentLevel.nextThreshold;
  const progressBase = currentLevel.min;
  const progressRange = nextThreshold ? Math.max(1, nextThreshold - progressBase) : 1;
  const progressValue = nextThreshold ? safeCount - progressBase : progressRange;

  return {
    ...currentLevel,
    nextThreshold,
    remainingToNext: nextThreshold ? Math.max(0, nextThreshold - safeCount) : 0,
    progressPercent: nextThreshold ? Math.max(0, Math.min(100, (progressValue / progressRange) * 100)) : 100,
  };
};

const getRealm = (totalCount) => {
  const levelInfo = getLevelInfo(totalCount);
  return (
    REALMS.find((realm) => levelInfo.level >= realm.minLevel && levelInfo.level <= realm.maxLevel) || REALMS[0]
  );
};

const getAppearanceStage = (totalCount) => {
  const safeCount = Math.max(0, totalCount);
  const currentStage =
    APPEARANCE_STAGES.find((stage, index) => {
      const nextStage = APPEARANCE_STAGES[index + 1];
      return safeCount >= stage.min && (!nextStage || safeCount < nextStage.min);
    }) || APPEARANCE_STAGES[APPEARANCE_STAGES.length - 1];
  const nextThreshold = currentStage.next;
  const progressRange = nextThreshold ? Math.max(1, nextThreshold - currentStage.min) : 1;
  const progressValue = nextThreshold ? safeCount - currentStage.min : progressRange;

  return {
    ...currentStage,
    nextThreshold,
    remainingToNext: nextThreshold ? Math.max(0, nextThreshold - safeCount) : 0,
    progressPercent: nextThreshold ? Math.max(0, Math.min(100, (progressValue / progressRange) * 100)) : 100,
  };
};

const getNextMilestone = (totalCount) => {
  return MILESTONE_VALUES.find((value) => totalCount < value) || null;
};

const getHighestMajorMilestone = (totalCount) => {
  return [...MAJOR_MILESTONE_VALUES].reverse().find((value) => totalCount >= value) || null;
};

const formatCountLabel = (value) => {
  if (value >= 10000) {
    const wan = value / 10000;
    return Number.isInteger(wan) ? `${wan}万` : `${wan.toFixed(1)}万`;
  }
  return value.toLocaleString("zh-CN");
};

const getStrikeTier = (totalCount) =>
  STRIKE_TIERS.find((tier) => totalCount <= tier.max) || STRIKE_TIERS[STRIKE_TIERS.length - 1];

const clampNonNegativeInt = (value) => {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return 0;
  }
  return Math.max(0, Math.floor(normalized));
};

const isValidLocalDateKey = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizeState = (rawState = {}) => {
  const totalCount = clampNonNegativeInt(rawState.totalCount);
  const schemaVersion = Number.isInteger(rawState.schemaVersion)
    ? Math.max(1, rawState.schemaVersion)
    : STORAGE_SCHEMA_VERSION;
  const updatedAt =
    typeof rawState.updatedAt === "string" && !Number.isNaN(Date.parse(rawState.updatedAt)) ? rawState.updatedAt : "";
  const hasValidVisitDate = isValidLocalDateKey(rawState.lastVisitDate);
  const hasValidDailyGoalDate = isValidLocalDateKey(rawState.dailyGoalDate);
  const achievements = Array.from(
    new Set((Array.isArray(rawState.achievements) ? rawState.achievements : []).filter((key) => KNOWN_ACHIEVEMENT_KEYS.has(key))),
  );
  const revealedCollectionCards = Array.from(
    new Set(
      (Array.isArray(rawState.revealedCollectionCards) ? rawState.revealedCollectionCards : []).filter((key) =>
        KNOWN_COLLECTION_KEYS.has(key),
      ),
    ),
  );
  const unlockedCollectionCards = Array.from(
    new Set(
      (Array.isArray(rawState.unlockedCollectionCards) ? rawState.unlockedCollectionCards : []).filter((key) =>
        KNOWN_COLLECTION_KEYS.has(key),
      ),
    ),
  );
  const derivedAppearances = APPEARANCES.filter(
    (appearance) =>
      (appearance.unlockAchievement && achievements.includes(appearance.unlockAchievement)) ||
      (appearance.unlockCollectionCard && unlockedCollectionCards.includes(appearance.unlockCollectionCard)),
  ).map((appearance) => appearance.key);
  const derivedSoundStyles = SOUND_STYLES.filter(
    (style) =>
      (style.unlockAchievement && achievements.includes(style.unlockAchievement)) ||
      (style.unlockCollectionCard && unlockedCollectionCards.includes(style.unlockCollectionCard)),
  ).map((style) => style.key);
  const unlockedAppearances = Array.from(
    new Set([
      "classic",
      ...derivedAppearances,
      ...(Array.isArray(rawState.unlockedAppearances) ? rawState.unlockedAppearances : []).filter((key) =>
        KNOWN_APPEARANCE_KEYS.has(key),
      ),
    ]),
  );
  const unlockedSoundStyles = Array.from(
    new Set([
      "classic",
      ...derivedSoundStyles,
      ...(Array.isArray(rawState.unlockedSoundStyles) ? rawState.unlockedSoundStyles : []).filter((key) =>
        KNOWN_SOUND_STYLE_KEYS.has(key),
      ),
    ]),
  );
  const achievementDates = Object.fromEntries(
    Object.entries(rawState.achievementDates || {}).filter(
      ([key, value]) => KNOWN_ACHIEVEMENT_KEYS.has(key) && typeof value === "string" && !Number.isNaN(Date.parse(value)),
    ),
  );
  const achievedMilestones = Array.from(
    new Set(
      (Array.isArray(rawState.achievedMilestones) ? rawState.achievedMilestones : [])
        .map((value) => Number(value))
        .filter((value) => MILESTONE_VALUES.includes(value) && value <= totalCount),
    ),
  ).sort((a, b) => a - b);
  const displayedZenQuotes = Array.from(
    new Set((Array.isArray(rawState.displayedZenQuotes) ? rawState.displayedZenQuotes : []).filter((quote) => KNOWN_QUOTES.has(quote))),
  );
  const collectionUnlockedAt = Object.fromEntries(
    Object.entries(rawState.collectionUnlockedAt || {}).filter(
      ([key, value]) => KNOWN_COLLECTION_KEYS.has(key) && typeof value === "string" && !Number.isNaN(Date.parse(value)),
    ),
  );
  const latestCollectionCard =
    typeof rawState.latestCollectionCard === "string" && KNOWN_COLLECTION_KEYS.has(rawState.latestCollectionCard)
      ? rawState.latestCollectionCard
      : "";
  const soundStyleUnlockedAt = Object.fromEntries(
    Object.entries(rawState.soundStyleUnlockedAt || {}).filter(
      ([key, value]) => KNOWN_SOUND_STYLE_KEYS.has(key) && typeof value === "string" && !Number.isNaN(Date.parse(value)),
    ),
  );
  const latestUnlockedSoundStyle =
    typeof rawState.latestUnlockedSoundStyle === "string" && KNOWN_SOUND_STYLE_KEYS.has(rawState.latestUnlockedSoundStyle)
      ? rawState.latestUnlockedSoundStyle
      : "";
  const dailyGoalsClaimed = Array.from(
    new Set(
      (Array.isArray(rawState.dailyGoalsClaimed) ? rawState.dailyGoalsClaimed : [])
        .map((value) => Number(value))
        .filter((value) => DAILY_GOAL_SET.has(value)),
    ),
  ).sort((a, b) => a - b);
  const currentAppearance =
    typeof rawState.currentAppearance === "string" && unlockedAppearances.includes(rawState.currentAppearance)
      ? rawState.currentAppearance
      : "classic";
  const currentSoundStyle =
    typeof rawState.currentSoundStyle === "string" && unlockedSoundStyles.includes(rawState.currentSoundStyle)
      ? rawState.currentSoundStyle
      : "classic";

  return {
    ...DEFAULT_STATE,
    ...rawState,
    schemaVersion,
    updatedAt,
    totalCount,
    todayCount: hasValidVisitDate ? clampNonNegativeInt(rawState.todayCount) : 0,
    lastVisitDate: hasValidVisitDate ? rawState.lastVisitDate : "",
    dailyGoalDate: hasValidDailyGoalDate ? rawState.dailyGoalDate : "",
    dailyGoalsClaimed,
    streak: hasValidVisitDate ? clampNonNegativeInt(rawState.streak) : 0,
    achievements,
    achievementDates,
    achievedMilestones,
    unlockedAppearances,
    currentAppearance,
    unlockedSoundStyles,
    currentSoundStyle,
    soundEnabled:
      typeof rawState.soundEnabled === "boolean" ? rawState.soundEnabled : DEFAULT_STATE.soundEnabled,
    firstVisitComplete: Boolean(rawState.firstVisitComplete || totalCount > 0 || achievements.includes("first_hit")),
    displayedZenQuotes,
    revealedCollectionCards,
    unlockedCollectionCards,
    collectionUnlockedAt,
    latestCollectionCard,
    soundStyleUnlockedAt,
    latestUnlockedSoundStyle,
    shareMode:
      typeof rawState.shareMode === "string" && KNOWN_SHARE_MODES.has(rawState.shareMode)
        ? rawState.shareMode
        : DEFAULT_STATE.shareMode,
  };
};

const readStoredState = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const migrateLegacyState = () => {
  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = readStoredState(key);
    if (legacy) {
      restoredStateSource = "legacy";
      return normalizeState({
        ...DEFAULT_STATE,
        totalCount: legacy.totalCount || 0,
        todayCount: legacy.todayCount || 0,
        lastVisitDate: legacy.lastVisitDate || "",
        streak: legacy.streak || 0,
        soundEnabled:
          typeof legacy.soundEnabled === "boolean" ? legacy.soundEnabled : DEFAULT_STATE.soundEnabled,
        firstVisitComplete: Boolean(legacy.firstVisitComplete || legacy.totalCount),
      });
    }
  }
  restoredStateSource = "default";
  return normalizeState(DEFAULT_STATE);
};

const readState = () => {
  const current = readStoredState(STORAGE_KEY);
  if (current) {
    restoredStateSource = "current";
    return normalizeState(current);
  }
  const backup = readStoredState(STORAGE_BACKUP_KEY);
  if (backup) {
    restoredStateSource = "backup";
    return normalizeState(backup);
  }
  return migrateLegacyState();
};

let state = readState();

const writeStateSnapshot = (snapshot) => {
  const payload = JSON.stringify(snapshot);
  window.localStorage.setItem(STORAGE_KEY, payload);
  window.localStorage.setItem(STORAGE_BACKUP_KEY, payload);
};

const flushStateSave = () => {
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = null;
  }
  try {
    state = normalizeState(state);
    writeStateSnapshot(state);
  } catch {
    // Ignore storage errors.
  }
};

const saveState = ({ immediate = false } = {}) => {
  try {
    state = normalizeState({
      ...state,
      schemaVersion: STORAGE_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    });
    if (immediate) {
      flushStateSave();
      return;
    }
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }
    persistTimer = window.setTimeout(() => {
      persistTimer = null;
      flushStateSave();
    }, STATE_SAVE_DEBOUNCE_MS);
  } catch {
    // Ignore storage errors.
  }
};

const syncDailyCounters = () => {
  const today = localDateKey();
  if (state.lastVisitDate !== today) {
    state.todayCount = 0;
  }
  if (state.dailyGoalDate !== today) {
    state.dailyGoalDate = today;
    state.dailyGoalsClaimed = [];
  }
};

const animateNumber = (node, nextValue) => {
  if (!node) {
    return;
  }
  node.textContent = String(nextValue);
  node.dataset.value = String(nextValue);
};

const isCompactFeedbackLayout = () => window.innerWidth <= 767;

const getFeedbackBudget = () => ({
  notices: isCompactFeedbackLayout() ? 2 : 3,
  particles: isCompactFeedbackLayout() ? 28 : 48,
  ripples: isCompactFeedbackLayout() ? 2 : 4,
  tags: isCompactFeedbackLayout() ? 3 : 6,
  numbers: isCompactFeedbackLayout() ? 4 : 8,
  particleDensity: isCompactFeedbackLayout() ? 0.68 : 1,
  noticeDuration: isCompactFeedbackLayout() ? 2200 : 2600,
});

const pruneNodes = (root, selector, keep) => {
  if (!root) {
    return;
  }
  const nodes = root.querySelectorAll(selector);
  const overflow = nodes.length - keep;
  for (let index = 0; index < overflow; index += 1) {
    nodes[index].remove();
  }
};

const scheduleViewportSync = () => {
  if (viewportSyncFrame) {
    return;
  }
  viewportSyncFrame = window.requestAnimationFrame(() => {
    viewportSyncFrame = 0;
    mountRealmGuide();
    positionRealmGuide();
    syncMobileOverlayState();
  });
};

const closeSecondaryOverlays = () => {
  closeStatsPopover(true);
  if (realmGuide && !realmGuide.hidden && realmGuideToggle) {
    realmGuide.hidden = true;
    realmGuideToggle.setAttribute("aria-expanded", "false");
  }
  dismissCollectionToast();
  dismissSoundStyleToast();
  syncMobileOverlayState();
};

const resetTransientFeedback = () => {
  recentHits = [];
  updateRhythmUI(null);
  updateComboBadge(0);
  body.classList.remove("is-combo", "is-burst", "is-major-ritual");
  if (instrumentButton) {
    instrumentButton.classList.remove("is-striking");
  }
  if (ritualStage) {
    ritualStage.classList.remove("is-pulsing");
  }
};

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

const getAudioOutput = (context) => {
  if (audioMasterInput) {
    return audioMasterInput;
  }
  const input = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const limiter = context.createGain();
  input.gain.value = 1;
  compressor.threshold.value = -18;
  compressor.knee.value = 22;
  compressor.ratio.value = 3.2;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.22;
  limiter.gain.value = 0.92;
  input.connect(compressor);
  compressor.connect(limiter);
  limiter.connect(context.destination);
  audioMasterInput = input;
  return audioMasterInput;
};

const getNoiseBuffer = (context) => {
  if (audioNoiseBuffer && audioNoiseBuffer.sampleRate === context.sampleRate) {
    return audioNoiseBuffer;
  }
  const duration = 0.22;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / channel.length);
  }
  audioNoiseBuffer = buffer;
  return audioNoiseBuffer;
};

const connectWithPan = (context, source, destination, pan = 0) => {
  if (typeof context.createStereoPanner === "function") {
    const panner = context.createStereoPanner();
    panner.pan.value = pan;
    source.connect(panner);
    panner.connect(destination);
    return panner;
  }
  source.connect(destination);
  return source;
};

const createStyledAudioBus = (context, tuning, now, peak, duration) => {
  const output = getAudioOutput(context);
  const master = context.createGain();
  const toneBus = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(peak, now + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  toneBus.gain.value = 1;
  toneBus.connect(master);

  if (tuning?.resonance?.mix) {
    const filter = context.createBiquadFilter();
    const resonanceGain = context.createGain();
    filter.type = "bandpass";
    filter.frequency.value = tuning.resonance.frequency;
    filter.Q.value = tuning.resonance.q;
    resonanceGain.gain.value = tuning.resonance.mix;
    toneBus.connect(filter);
    filter.connect(resonanceGain);
    resonanceGain.connect(master);
  }

  if (tuning?.air?.mix) {
    const airFilter = context.createBiquadFilter();
    const airGain = context.createGain();
    airFilter.type = "highpass";
    airFilter.frequency.value = tuning.air.frequency;
    airGain.gain.value = tuning.air.mix;
    toneBus.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);
  }

  if (tuning?.echo?.mix) {
    const delay = context.createDelay(0.4);
    const feedback = context.createGain();
    const lowpass = context.createBiquadFilter();
    const echoGain = context.createGain();
    delay.delayTime.value = tuning.echo.time;
    feedback.gain.value = tuning.echo.feedback;
    lowpass.type = "lowpass";
    lowpass.frequency.value = tuning.echo.lowpass;
    echoGain.gain.value = tuning.echo.mix;
    toneBus.connect(delay);
    delay.connect(lowpass);
    lowpass.connect(feedback);
    feedback.connect(delay);
    lowpass.connect(echoGain);
    echoGain.connect(master);
  }

  master.connect(output);
  return toneBus;
};

const playTransientBurst = (context, tuning, now, destination) => {
  if (!tuning?.transient?.peak) {
    return;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = getNoiseBuffer(context);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(tuning.transient.filterStart, now);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(180, tuning.transient.filterEnd),
    now + tuning.transient.duration,
  );
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(tuning.transient.peak, now + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + tuning.transient.duration);
  source.connect(filter);
  connectWithPan(context, filter, gain, (Math.random() - 0.5) * (tuning.stereoWidth || 0.08));
  gain.connect(destination);
  source.start(now);
  source.stop(now + tuning.transient.duration + 0.02);
};

const playWoodenImpactLayer = (context, tuning, now, destination, options = {}) => {
  const impactGain = context.createGain();
  const knock = context.createOscillator();
  const body = context.createOscillator();
  const clickSource = context.createBufferSource();
  const clickFilter = context.createBiquadFilter();
  const clickGain = context.createGain();
  const previewScale = options.preview ? 0.58 : 1;
  const resonanceBase = tuning?.resonance?.frequency || 520;

  impactGain.gain.setValueAtTime(0.0001, now);
  impactGain.gain.exponentialRampToValueAtTime(0.16 * previewScale, now + 0.004);
  impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  impactGain.connect(destination);

  knock.type = "triangle";
  knock.frequency.setValueAtTime(Math.max(360, resonanceBase * 1.55), now);
  knock.frequency.exponentialRampToValueAtTime(Math.max(150, resonanceBase * 0.42), now + 0.12);
  knock.connect(impactGain);
  knock.start(now);
  knock.stop(now + 0.18);

  const bodyGain = context.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(Math.max(120, resonanceBase * 0.5), now + 0.004);
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.055 * previewScale, now + 0.014);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  body.connect(bodyGain);
  bodyGain.connect(destination);
  body.start(now + 0.004);
  body.stop(now + 0.28);

  clickSource.buffer = getNoiseBuffer(context);
  clickFilter.type = "bandpass";
  clickFilter.frequency.setValueAtTime(Math.max(900, tuning?.transient?.filterEnd || 1400), now);
  clickFilter.Q.value = 2.6;
  clickGain.gain.setValueAtTime(0.0001, now);
  clickGain.gain.exponentialRampToValueAtTime(0.09 * previewScale, now + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
  clickSource.connect(clickFilter);
  clickFilter.connect(clickGain);
  connectWithPan(context, clickGain, destination, (Math.random() - 0.5) * 0.08);
  clickSource.start(now);
  clickSource.stop(now + 0.08);
};

const playLayeredTone = (frequencies, duration, peak = 0.18, styleKey = state.currentSoundStyle) => {
  const context = getAudioContext();
  if (!context || !state.soundEnabled) {
    return;
  }
  const now = context.currentTime;
  const tuning = SOUND_STYLE_TUNING[styleKey] || SOUND_STYLE_TUNING.classic;
  const toneBus = createStyledAudioBus(context, tuning, now, peak, duration);

  frequencies.forEach((frequency, index) => {
    const osc = context.createOscillator();
    const oscGain = context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now + index * 0.02);
    oscGain.gain.setValueAtTime(0.0001, now + index * 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.02 + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(oscGain);
    connectWithPan(
      context,
      oscGain,
      toneBus,
      (index - (frequencies.length - 1) / 2) * (tuning.stereoWidth || 0.06),
    );
    osc.start(now + index * 0.02);
    osc.stop(now + duration + 0.04);
  });
};

const getSoundStyle = (styleKey = state.currentSoundStyle) => SOUND_STYLE_MAP.get(styleKey) || SOUND_STYLES[0];
const getSoundStyleFeedback = (styleKey = state.currentSoundStyle) =>
  SOUND_STYLE_FEEDBACK[styleKey] || SOUND_STYLE_FEEDBACK.classic;

const playHitSound = (styleKey = state.currentSoundStyle, options = {}) => {
  if (!state.soundEnabled) {
    return;
  }
  const nowStamp = performance.now();
  if (!options.preview && nowStamp - lastHitSoundAt < MIN_HIT_SOUND_GAP_MS) {
    return;
  }
  if (!options.preview) {
    lastHitSoundAt = nowStamp;
  }
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const soundStyle = getSoundStyle(styleKey);
  const profile = soundStyle.hit || SOUND_STYLES[0].hit;
  const tuning = SOUND_STYLE_TUNING[styleKey] || SOUND_STYLE_TUNING.classic;
  const now = context.currentTime;
  const toneBus = createStyledAudioBus(
    context,
    tuning,
    now,
    profile.masterPeak || 0.22,
    profile.masterDuration || 0.42,
  );
  playTransientBurst(context, tuning, now, toneBus);
  playWoodenImpactLayer(context, tuning, now, toneBus, options);

  (profile.layers || []).forEach((layer) => {
    const startAt = now + (layer.delay || 0);
    const osc = context.createOscillator();
    const oscGain = context.createGain();
    const drift = 1 + (Math.random() * 2 - 1) * (tuning.drift || 0.01);
    osc.type = layer.type || "sine";
    osc.frequency.setValueAtTime(layer.start * drift, startAt);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(1, (layer.end || layer.start) * drift),
      startAt + (layer.duration || 0.1),
    );
    oscGain.gain.setValueAtTime(0.0001, startAt);
    oscGain.gain.exponentialRampToValueAtTime(layer.peak || 0.12, startAt + (layer.attack || 0.01));
    oscGain.gain.exponentialRampToValueAtTime(0.0001, startAt + (layer.duration || 0.1));
    osc.connect(oscGain);
    connectWithPan(
      context,
      oscGain,
      toneBus,
      ((Math.random() * 2 - 1) * (tuning.stereoWidth || 0.08)) / (options.preview ? 2 : 1),
    );
    osc.start(startAt);
    osc.stop(startAt + (layer.duration || 0.1) + 0.04);
  });
};

const playUnlockSound = (styleKey = state.currentSoundStyle) => {
  const soundStyle = getSoundStyle(styleKey);
  const chord = soundStyle.unlockChord || SOUND_STYLES[0].unlockChord;
  playLayeredTone(chord.frequencies, chord.duration, chord.peak, styleKey);
};
const playChimeSound = (styleKey = state.currentSoundStyle) => {
  const soundStyle = getSoundStyle(styleKey);
  const chord = soundStyle.ritualChord || SOUND_STYLES[0].ritualChord;
  playLayeredTone(chord.frequencies, chord.duration, chord.peak, styleKey);
};

const getNextZenQuote = () => {
  const remaining = ZEN_QUOTES.filter((quote) => !state.displayedZenQuotes.includes(quote));
  const pool = remaining.length > 0 ? remaining : [...ZEN_QUOTES];
  const nextQuote = pool[Math.floor(Math.random() * pool.length)];
  if (!remaining.length) {
    state.displayedZenQuotes = [];
  }
  state.displayedZenQuotes.push(nextQuote);
  return nextQuote;
};

const showNotice = (title, text, variant = "default") => {
  if (!noticeStack) {
    return;
  }
  const budget = getFeedbackBudget();
  const notice = document.createElement("div");
  notice.className = `notice${variant !== "default" ? ` is-${variant}` : ""}`;
  notice.innerHTML = `<p class="notice-title">${title}</p><p class="notice-text">${text}</p>`;
  noticeStack.appendChild(notice);
  pruneNodes(noticeStack, ".notice", budget.notices);
  window.setTimeout(() => {
    notice.style.opacity = "0";
    notice.style.transform = "translateY(-10px)";
    window.setTimeout(() => notice.remove(), 220);
  }, budget.noticeDuration);
};

const dismissCollectionToast = () => {
  if (!collectionToast) {
    return;
  }
  window.clearTimeout(collectionToastTimer);
  collectionToast.classList.remove("is-visible", "is-hidden-card", "is-milestone-card", "is-unlocked-card");
  collectionToast.setAttribute("aria-hidden", "true");
};

const dismissSoundStyleToast = () => {
  if (!soundStyleToast) {
    return;
  }
  window.clearTimeout(soundStyleToastTimer);
  soundStyleToast.classList.remove("is-visible");
  soundStyleToast.setAttribute("aria-hidden", "true");
};

const dismissMilestoneToast = () => {
  if (!milestoneToast) {
    return;
  }
  window.clearTimeout(toastTimer);
  window.clearTimeout(majorMilestoneTimer);
  milestoneToast.classList.remove("is-visible");
  milestoneToast.classList.remove("is-major");
  delete milestoneToast.dataset.milestoneTier;
  milestoneToast.setAttribute("aria-hidden", "true");
  body.classList.remove("is-major-ritual");
};

const showSoundStyleToast = (soundStyle) => {
  if (
    !soundStyleToast ||
    !soundStyleToastKicker ||
    !soundStyleToastTitle ||
    !soundStyleToastNote ||
    !soundStyleToastFigures ||
    !soundStyleToastMeta
  ) {
    return;
  }

  const linkedCard = soundStyle.unlockCollectionCard ? COLLECTION_CARD_MAP.get(soundStyle.unlockCollectionCard) : null;
  soundStyleToastKicker.textContent = soundStyle.unlockCollectionCard ? "秘传音色掉落" : "音色解锁";
  soundStyleToastTitle.textContent = `《${soundStyle.name}》已入耳`;
  soundStyleToastNote.textContent = soundStyle.unlockCollectionCard
    ? "这组秘传音色已经脱离隐藏态，现在可以直接切换试听。"
    : "新的敲击音色已经收入法器面板。";

  soundStyleToastFigures.innerHTML = "";
  [soundStyle.shortName, linkedCard ? linkedCard.index : "SOUND", linkedCard ? linkedCard.title : soundStyle.tone]
    .filter(Boolean)
    .forEach((value) => {
      const chip = document.createElement("span");
      chip.className = "sound-style-toast-figure";
      chip.textContent = value;
      soundStyleToastFigures.appendChild(chip);
    });

  soundStyleToastMeta.textContent = linkedCard
    ? `来源：${linkedCard.title} 已显满。现在可以前往音色面板切换，并在第三屏查看这条秘传奖励线。`
    : soundStyle.condition;

  window.clearTimeout(soundStyleToastTimer);
  soundStyleToast.classList.add("is-visible");
  soundStyleToast.setAttribute("aria-hidden", "false");
  soundStyleToastTimer = window.setTimeout(() => dismissSoundStyleToast(), 3600);
};

const showCollectionToast = (card, status) => {
  if (
    !collectionToast ||
    !collectionToastKicker ||
    !collectionToastTitle ||
    !collectionToastNote ||
    !collectionToastFigures ||
    !collectionToastMeta
  ) {
    return;
  }

  const unlockedCount = state.unlockedCollectionCards.length;
  const isUnlock = status === "unlocked";
  const groupLabel = getCollectionGroupLabel(card.group);
  const title = isUnlock ? card.title : getCollectionDisplayTitle(card, "revealed");

  collectionToast.classList.toggle("is-hidden-card", card.group === "hidden");
  collectionToast.classList.toggle("is-milestone-card", card.group === "milestone");
  collectionToast.classList.toggle("is-unlocked-card", isUnlock);

  collectionToastKicker.textContent = isUnlock
    ? card.group === "hidden"
      ? "隐藏收藏入柜"
      : card.group === "milestone"
        ? "节点封面入柜"
        : "新收藏入柜"
    : card.group === "hidden"
      ? "隐藏收藏显影"
      : card.group === "milestone"
        ? "节点封面显影"
        : "新收藏显影";

  collectionToastTitle.textContent = isUnlock ? `《${title}》已点亮` : `《${title}》已出现轮廓`;
  collectionToastNote.textContent = isUnlock
    ? card.group === "hidden"
      ? "隐藏款已经完整显影，现在藏阁可以查看完整卡面与解锁时间。"
      : "藏阁已经可以查看完整卡面，这件收藏现在正式收入藏阁。"
    : "藏阁已经出现新的收藏线索，现在可以点击查看当前条件与推进进度。";

  collectionToastFigures.innerHTML = "";
  [
    card.index,
    groupLabel,
    isUnlock ? `已解锁 ${unlockedCount} / ${COLLECTION_CARDS.length}` : "已显影",
  ].forEach((value) => {
    const chip = document.createElement("span");
    chip.className = "collection-toast-figure";
    chip.textContent = value;
    collectionToastFigures.appendChild(chip);
  });

  const linkedSoundStyle = getLinkedSoundStyleForCard(card.key);
  collectionToastMeta.textContent = isUnlock
    ? linkedSoundStyle
      ? `已同步点亮秘传音色「${linkedSoundStyle.name}」，现在可到音色里切换试听。`
      : "可切换到分享 > 秘藏，直接生成当前收藏海报。"
    : linkedSoundStyle
      ? `这件收藏对应秘传音色「${linkedSoundStyle.name}」，继续推进会同步掉落。`
      : "继续推进条件，显影中的收藏会在达成时自动入柜。";

  window.clearTimeout(collectionToastTimer);
  collectionToast.classList.add("is-visible");
  collectionToast.setAttribute("aria-hidden", "false");
  collectionToastTimer = window.setTimeout(() => dismissCollectionToast(), isUnlock ? 3400 : 2600);
};

const showMilestone = (threshold) => {
  const config = MILESTONES[threshold];
  const majorMeta = MAJOR_MILESTONE_META[threshold];
  const isMajorMilestone = Boolean(majorMeta);
  const realm = getRealm(state.totalCount);
  const levelInfo = getLevelInfo(state.totalCount);
  const currentAppearance =
    APPEARANCES.find((appearance) => appearance.key === state.currentAppearance) || APPEARANCES[0];
  const currentSoundStyle = getSoundStyle();
  if (!config || !milestoneToast || !milestoneKicker || !milestoneTitle || !milestoneNote) {
    return;
  }
  milestoneToast.classList.toggle("is-major", isMajorMilestone);
  milestoneToast.dataset.milestoneTier = String(threshold);
  milestoneKicker.textContent = config.kicker;
  milestoneTitle.textContent = isMajorMilestone ? majorMeta.toastTitle : getNextZenQuote();
  milestoneNote.textContent = isMajorMilestone ? `${config.note} ${majorMeta.note}` : config.note;
  if (milestoneFigures) {
    milestoneFigures.innerHTML = "";
    [
      `${threshold.toLocaleString("zh-CN")} 下`,
      `${realm.name} / Lv.${levelInfo.level}`,
      currentAppearance.name,
      currentSoundStyle.shortName,
    ].forEach((value) => {
      const chip = document.createElement("span");
      chip.className = "milestone-figure";
      chip.textContent = value;
      milestoneFigures.appendChild(chip);
    });
  }
  if (milestoneMeta) {
    milestoneMeta.textContent = isMajorMilestone
      ? "节点海报已就绪 · 建议截图或直接预览分享"
      : "继续修行，节点海报会随关键时刻更新。";
  }
  milestoneToast.classList.add("is-visible");
  milestoneToast.setAttribute("aria-hidden", "false");
  if (isMajorMilestone) {
    playLayeredTone([261.6, 392, 523.2], 2.2, 0.24);
    buildShareCard("milestone", { milestone: threshold });
    showNotice("节点海报已更新", "你刚跨过一个关键节点，现在可以直接预览或下载。", "rare");
  } else if (threshold >= 50) {
    playChimeSound();
  } else {
    playUnlockSound();
  }
  window.clearTimeout(toastTimer);
  window.clearTimeout(majorMilestoneTimer);
  if (isMajorMilestone) {
    body.classList.add("is-major-ritual");
    majorMilestoneTimer = window.setTimeout(() => body.classList.remove("is-major-ritual"), 1800);
  }
  toastTimer = window.setTimeout(() => dismissMilestoneToast(), isMajorMilestone ? 3600 : 2800);
};

const renderMajorMilestones = () => {
  if (!majorMilestoneRail) {
    return;
  }
  const nextMajor = MAJOR_MILESTONE_VALUES.find((value) => state.totalCount < value) || null;
  majorMilestoneRail.innerHTML = "";

  MAJOR_MILESTONE_VALUES.forEach((threshold) => {
    const marker = document.createElement("div");
    const isReached = state.totalCount >= threshold;
    const isNext = nextMajor === threshold;
    marker.className = `major-milestone-marker${isReached ? " is-reached" : ""}${isNext ? " is-next" : ""}`;
    marker.innerHTML = `
      <span class="major-milestone-dot"></span>
      <span class="major-milestone-label">${formatCountLabel(threshold)}</span>
    `;
    majorMilestoneRail.appendChild(marker);
  });
};

const renderRitualVaultSignal = (summary = getVaultSummary()) => {
  if (!ritualVaultKickerNode || !ritualVaultTitleNode || !ritualVaultNoteNode || !ritualVaultStateNode) {
    return;
  }
  const latestDroppedCardKey = getLatestDroppedCollectionCardKey();
  if (latestDroppedCardKey) {
    const droppedItem = summary.cards.find(
      (item) => item.card.key === latestDroppedCardKey && item.view.status === "unlocked",
    );
    const droppedSoundStyle = SOUND_STYLE_MAP.get(state.latestUnlockedSoundStyle) || null;
    if (droppedItem && droppedSoundStyle) {
      ritualVaultKickerNode.textContent = "秘传掉落";
      ritualVaultTitleNode.textContent = `${droppedItem.card.index} · ${droppedItem.card.title}`;
      ritualVaultNoteNode.textContent = `已掉落「${droppedSoundStyle.name}」，第三屏与秘藏卡已同步切到这一张奖励卡。`;
      ritualVaultStateNode.textContent = "已入柜";
      return;
    }
  }

  if (summary.nextCard) {
    const { card, view } = summary.nextCard;
    ritualVaultKickerNode.textContent = card.group === "hidden" ? "隐藏秘藏线索" : "当前秘藏线索";
    ritualVaultTitleNode.textContent = `${card.index} · ${view.title}`;
    ritualVaultNoteNode.textContent = view.progressText;
    ritualVaultStateNode.textContent = view.status === "revealed" ? "显影中" : "下一张";
    return;
  }

  if (summary.latestUnlocked) {
    ritualVaultKickerNode.textContent = "最近点亮";
    ritualVaultTitleNode.textContent = `${summary.latestUnlocked.card.index} · ${summary.latestUnlocked.card.title}`;
    ritualVaultNoteNode.textContent = "我的藏阁已显满，继续修行可等待新的隐藏线扩展。";
    ritualVaultStateNode.textContent = "已收录";
    return;
  }

  ritualVaultKickerNode.textContent = "当前秘藏线索";
  ritualVaultTitleNode.textContent = "继续敲击以点亮下一张秘藏";
  ritualVaultNoteNode.textContent = "当前修行会同步推进第三屏的个人秘藏柜。";
  ritualVaultStateNode.textContent = "线索中";
};

const updateSoundUI = () => {
  if (!soundToggle || !soundIcon || !soundLabel) {
    return;
  }
  soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
  const soundDescription = state.soundEnabled ? "音效已开启，点击切换" : "音效已关闭，点击切换";
  soundToggle.setAttribute("aria-label", soundDescription);
  soundToggle.setAttribute("title", soundDescription);
  soundIcon.textContent = state.soundEnabled ? "🔊" : "🔇";
  soundLabel.textContent = state.soundEnabled ? "开" : "关";
};

const updateStatsUI = () => {
  syncDailyCounters();
  const levelInfo = getLevelInfo(state.totalCount);
  const realm = getRealm(state.totalCount);
  const appearanceStage = getAppearanceStage(state.totalCount);
  const nextMilestone = getNextMilestone(state.totalCount);
  const currentAppearance =
    APPEARANCES.find((appearance) => appearance.key === state.currentAppearance) || APPEARANCES[0];
  const currentSoundStyle = getSoundStyle();

  body.dataset.realm = realm.key;
  body.dataset.appearance = state.currentAppearance;
  body.dataset.appearanceStage = appearanceStage.key;
  body.dataset.soundStyle = currentSoundStyle.key;

  animateNumber(totalCountNode, state.totalCount);
  animateNumber(todayCountNode, state.todayCount);
  animateNumber(streakCountNode, state.streak);

  if (realmNameNode) {
    realmNameNode.textContent = realm.name;
  }
  if (realmProgressNode) {
    realmProgressNode.textContent =
      levelInfo.nextThreshold === null
        ? `Lv. ${levelInfo.level} · 已达最高等级`
        : `Lv. ${levelInfo.level} · 距离下一级 ${levelInfo.remainingToNext} 下`;
  }
  if (realmChipNode) {
    realmChipNode.textContent = "点击查看境界图";
  }
  if (statsFootnoteNode) {
    statsFootnoteNode.textContent = `${realm.note} ${levelInfo.nextThreshold === null ? "已抵达满级。" : `当前进度 ${Math.round(levelInfo.progressPercent)}%。`}`;
  }
  renderDailyGoals();
  renderRealmGuide();
  if (achievementUnlockedCountNode) {
    achievementUnlockedCountNode.textContent = `${state.achievements.length} / ${ACHIEVEMENTS.length}`;
  }
  if (appearanceCurrentNameNode) {
    appearanceCurrentNameNode.textContent = currentAppearance.name;
  }
  if (soundStyleCurrentNameNode) {
    soundStyleCurrentNameNode.textContent = currentSoundStyle.name;
  }
  if (appearanceResonanceMetaNode) {
    appearanceResonanceMetaNode.textContent = `${currentAppearance.signal || `共鸣${appearanceStage.name}`} · ${currentSoundStyle.shortName}`;
  }
  if (soundStyleNextHintNode) {
    const nextSoundStyle = getNextSoundStyleToUnlock();
    soundStyleNextHintNode.textContent = nextSoundStyle
      ? `下一音色：${nextSoundStyle.name} · ${getSoundUnlockProgressText(nextSoundStyle)}`
      : "全部音色已解锁，当前已经收齐整套敲击风格。";
  }
  if (soundStyleSecretCountNode) {
    const secretSummary = getSecretSoundSummary();
    soundStyleSecretCountNode.textContent = `${secretSummary.unlocked} / ${secretSummary.total}`;
  }
  if (soundStyleSecretHintNode) {
    const secretSummary = getSecretSoundSummary();
    soundStyleSecretHintNode.textContent = secretSummary.latest
      ? `最近掉落：${secretSummary.latest.name}${secretSummary.next ? ` · 下一秘传 ${secretSummary.next.name}` : ""}`
      : secretSummary.next
        ? `下一秘传：${secretSummary.next.name} · ${getSoundUnlockProgressText(secretSummary.next)}`
        : "两档秘传音色都已收入法器面板，当前秘传线已圆满。";
  }
  if (statsPanel) {
    statsPanel.classList.toggle("is-unlocked", state.firstVisitComplete);
  }

  if (nextMilestoneLabelNode && nextMilestoneFillNode && nextMilestoneNoteNode) {
    if (nextMilestone === null) {
      nextMilestoneLabelNode.textContent = "十万圆满";
      nextMilestoneFillNode.style.width = "100%";
      nextMilestoneNoteNode.textContent = "10 万已达成，继续敲击让道场持续发光";
    } else {
      const previousMilestone = Math.max(
        0,
        ...Object.keys(MILESTONES)
          .map(Number)
          .filter((value) => value < nextMilestone),
      );
      const range = nextMilestone - previousMilestone;
      const current = state.totalCount - previousMilestone;
      const percent = Math.max(0, Math.min(100, (current / range) * 100));
      const target = MILESTONES[nextMilestone];
      nextMilestoneLabelNode.textContent = `${nextMilestone} 下 / ${target.kicker}`;
      nextMilestoneFillNode.style.width = `${percent}%`;
      nextMilestoneNoteNode.textContent = `还差 ${nextMilestone - state.totalCount} 下`;
    }
  }
  renderMajorMilestones();
  const vaultSummary = getVaultSummary();
  renderRitualVaultSignal(vaultSummary);
  renderVault(vaultSummary);
  setupWorkLoading();
};

const spawnParticles = (count, tier) => {
  if (!particleLayer || prefersReducedMotion) {
    return;
  }
  const budget = getFeedbackBudget();
  const effectiveCount = Math.max(4, Math.round(count * budget.particleDensity));
  for (let index = 0; index < effectiveCount; index += 1) {
    const particle = document.createElement("span");
    particle.className = "mokugyo-particle";
    const angle = (Math.PI * 2 * index) / effectiveCount;
    const distance = 30 + Math.random() * 48;
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance - 20}px`);
    particle.style.background = tier.particleGradient;
    particle.style.boxShadow = `0 0 12px ${tier.shadow}`;
    particleLayer.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
  pruneNodes(particleLayer, ".mokugyo-particle", budget.particles);
};

const spawnRipple = (tier, burst = false) => {
  if (!particleLayer || prefersReducedMotion) {
    return;
  }
  const budget = getFeedbackBudget();
  const ripple = document.createElement("span");
  ripple.className = `mokugyo-ripple${burst ? " is-burst" : ""}`;
  ripple.style.borderColor = tier.ripple;
  ripple.style.boxShadow = `0 0 0 1px ${tier.shadow}, 0 0 24px ${tier.shadow}`;
  particleLayer.appendChild(ripple);
  pruneNodes(particleLayer, ".mokugyo-ripple", budget.ripples);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
};

const spawnFloatTag = (text, options = {}) => {
  if (!particleLayer || prefersReducedMotion) {
    return;
  }
  const { burst = false, variant = "default" } = options;
  const useStageFeedback = isCompactFeedbackLayout() && ritualStage;
  const feedbackParent = useStageFeedback ? ritualStage : particleLayer;
  const budget = getFeedbackBudget();
  const horizontalBase = useStageFeedback ? 0 : isCompactFeedbackLayout() ? 12 : 22;
  const horizontalSpread = useStageFeedback ? 0 : isCompactFeedbackLayout() ? 22 : 34;
  const verticalBase = useStageFeedback ? 0 : isCompactFeedbackLayout() ? -26 : -34;
  const verticalSpread = useStageFeedback ? 0 : isCompactFeedbackLayout() ? 10 : 14;
  const tag = document.createElement("span");
  tag.className = `mokugyo-tag${useStageFeedback ? " is-stage-feedback" : ""}${burst ? " is-burst" : ""}${variant !== "default" ? ` is-${variant}` : ""}`;
  tag.textContent = text;
  tag.style.marginLeft = `${horizontalBase + Math.random() * horizontalSpread}px`;
  tag.style.marginTop = `${verticalBase - Math.random() * verticalSpread}px`;
  feedbackParent.appendChild(tag);
  pruneNodes(feedbackParent, ".mokugyo-tag", budget.tags);
  tag.addEventListener("animationend", () => tag.remove(), { once: true });
};

const spawnHitNumber = (value = 1, label = "", options = {}) => {
  if (!particleLayer || prefersReducedMotion) {
    return;
  }
  const { burst = false, variant = "default" } = options;
  const budget = getFeedbackBudget();
  const horizontalBase = isCompactFeedbackLayout() ? -42 : -58;
  const horizontalSpread = isCompactFeedbackLayout() ? 18 : 24;
  const verticalBase = isCompactFeedbackLayout() ? -2 : -8;
  const verticalSpread = isCompactFeedbackLayout() ? 12 : 18;
  const tag = document.createElement("span");
  tag.className = `mokugyo-number${burst ? " is-burst" : ""}${variant !== "default" ? ` is-${variant}` : ""}`;
  tag.textContent = label ? `+${value} ${label}` : `+${value}`;
  tag.style.marginLeft = `${horizontalBase + Math.random() * horizontalSpread}px`;
  tag.style.marginTop = `${verticalBase + Math.random() * verticalSpread}px`;
  particleLayer.appendChild(tag);
  pruneNodes(particleLayer, ".mokugyo-number", budget.numbers);
  tag.addEventListener("animationend", () => tag.remove(), { once: true });
};

const pickRandomEvent = ({ comboCount, totalCount }) => {
  const now = Date.now();
  if (now - lastRandomEventAt < RANDOM_EVENT_COOLDOWN_MS) {
    return null;
  }
  const rarityOrder = { epic: 3, rare: 2, common: 1 };
  const eligibleEvents = RANDOM_EVENTS
    .filter((event) => totalCount >= (event.minTotal || 0) && comboCount >= (event.minCombo || 0))
    .sort((left, right) => (rarityOrder[right.rarity] || 0) - (rarityOrder[left.rarity] || 0));
  const randomEvent = eligibleEvents.find((event) => Math.random() < event.chance) || null;
  if (randomEvent) {
    lastRandomEventAt = now;
  }
  return randomEvent;
};

const getDailyGoalProgress = (todayCount) => {
  const completedGoals = DAILY_GOALS.filter((goal) => todayCount >= goal);
  const nextGoal = DAILY_GOALS.find((goal) => todayCount < goal) || null;
  const previousGoal = Math.max(0, ...DAILY_GOALS.filter((goal) => goal < (nextGoal || Number.POSITIVE_INFINITY)));
  const targetGoal = nextGoal || DAILY_GOALS[DAILY_GOALS.length - 1];
  const range = Math.max(1, targetGoal - previousGoal);
  const current = nextGoal ? todayCount - previousGoal : range;
  return {
    completedGoals,
    nextGoal,
    previousGoal,
    targetGoal,
    percent: nextGoal ? Math.max(0, Math.min(100, (current / range) * 100)) : 100,
  };
};

const getRhythmState = (timestamps) => {
  if (!Array.isArray(timestamps) || timestamps.length < 4) {
    return null;
  }

  const windowHits = timestamps.slice(-6);
  const intervals = [];
  for (let index = 1; index < windowHits.length; index += 1) {
    intervals.push(windowHits[index] - windowHits[index - 1]);
  }

  if (intervals.length < 3) {
    return null;
  }

  const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const deviation = Math.max(...intervals.map((interval) => Math.abs(interval - average)));

  return (
    RHYTHM_STATES.find(
      (rhythmState) =>
        windowHits.length >= rhythmState.minHits &&
        average >= rhythmState.minAverage &&
        average <= rhythmState.maxAverage &&
        deviation <= rhythmState.maxDeviation,
    ) || null
  );
};

const getRhythmFeedback = (timestamps) => {
  if (!Array.isArray(timestamps) || timestamps.length < 4) {
    return null;
  }

  const windowHits = timestamps.slice(-6);
  const intervals = [];
  for (let index = 1; index < windowHits.length; index += 1) {
    intervals.push(windowHits[index] - windowHits[index - 1]);
  }

  if (intervals.length < 3) {
    return null;
  }

  const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const deviation = Math.max(...intervals.map((interval) => Math.abs(interval - average)));
  const positiveState = getRhythmState(windowHits);

  if (positiveState) {
    return {
      ...positiveState,
      kind: "positive",
      emphasis: positiveState.variant === "rare" ? "strong" : "soft",
      badgeText: positiveState.shortLabel,
    };
  }

  const guidanceState =
    RHYTHM_GUIDANCE_STATES.find((rule) => {
      if (windowHits.length < rule.minHits) {
        return false;
      }
      if (typeof rule.maxAverage === "number" && average > rule.maxAverage) {
        return false;
      }
      if (typeof rule.minAverage === "number" && average < rule.minAverage) {
        return false;
      }
      if (typeof rule.minDeviation === "number" && deviation < rule.minDeviation) {
        return false;
      }
      return true;
    }) || null;

  if (!guidanceState) {
    return null;
  }

  return {
    ...guidanceState,
    kind: "guidance",
    variant: guidanceState.tone === "warning" ? "rare" : "common",
    emphasis: guidanceState.tone === "warning" ? "strong" : "soft",
    badgeText: guidanceState.shortLabel,
  };
};

const updateRhythmUI = (rhythmFeedback = null) => {
  if (!ritualFlowNode) {
    return;
  }
  if (ritualFlowHoldTimer) {
    window.clearTimeout(ritualFlowHoldTimer);
    ritualFlowHoldTimer = 0;
  }

  ritualFlowNode.classList.remove("is-common", "is-rare", "is-warning", "is-caution", "is-active");
  if (!rhythmFeedback) {
    ritualFlowNode.textContent = "稳敲进入节奏";
    return;
  }

  ritualFlowNode.textContent = `${rhythmFeedback.label} · ${rhythmFeedback.note}`;
  ritualFlowNode.classList.add("is-active");
  if (rhythmFeedback.kind === "guidance") {
    ritualFlowNode.classList.add(rhythmFeedback.tone === "warning" ? "is-warning" : "is-caution");
    return;
  }
  ritualFlowNode.classList.add(rhythmFeedback.variant === "rare" ? "is-rare" : "is-common");
};

const showRitualFlowPulse = (label, note = "", variant = "common", duration = 1600) => {
  if (!ritualFlowNode) {
    return;
  }
  if (ritualFlowHoldTimer) {
    window.clearTimeout(ritualFlowHoldTimer);
  }
  ritualFlowNode.classList.remove("is-common", "is-rare", "is-warning", "is-caution", "is-active");
  ritualFlowNode.classList.add("is-active", variant === "rare" || variant === "epic" ? "is-rare" : "is-common");
  ritualFlowNode.textContent = note ? `${label} · ${note}` : label;
  ritualFlowHoldTimer = window.setTimeout(() => {
    ritualFlowHoldTimer = 0;
    updateRhythmUI(getRhythmFeedback(recentHits));
  }, duration);
};

const maybeRewardRhythm = (rhythmFeedback) => {
  if (!rhythmFeedback) {
    return;
  }
  const nowStamp = performance.now();
  if (rhythmFeedback.kind === "guidance") {
    if (rhythmFeedback.key === lastRhythmFeedbackKey && nowStamp - lastRhythmHintAt < 2200) {
      return;
    }
    lastRhythmFeedbackKey = rhythmFeedback.key;
    lastRhythmHintAt = nowStamp;
    spawnFloatTag(rhythmFeedback.badgeText || rhythmFeedback.shortLabel || rhythmFeedback.label, {
      variant: rhythmFeedback.variant,
      burst: rhythmFeedback.emphasis === "strong",
    });
    return;
  }

  if (nowStamp - lastRhythmRewardAt < RHYTHM_REWARD_COOLDOWN_MS) {
    return;
  }
  lastRhythmFeedbackKey = rhythmFeedback.key;
  lastRhythmRewardAt = nowStamp;
  const soundFeedback = getSoundStyleFeedback();
  if (rhythmFeedback.variant === "rare") {
    showNotice(`${soundFeedback.comboLabel} · ${rhythmFeedback.label}`, rhythmFeedback.note, rhythmFeedback.variant);
  }
  spawnFloatTag(soundFeedback.comboLabel === "FLOW" ? rhythmFeedback.shortLabel : `${soundFeedback.comboLabel}`, {
    variant: rhythmFeedback.variant,
    burst: rhythmFeedback.variant === "rare",
  });
};

const renderDailyGoals = () => {
  if (!dailyGoalStatusNode || !dailyGoalFillNode || !dailyGoalListNode) {
    return;
  }

  const dailyProgress = getDailyGoalProgress(state.todayCount);
  const completedCount = dailyProgress.completedGoals.length;
  dailyGoalStatusNode.textContent =
    dailyProgress.nextGoal === null
      ? "四段圆满 / 108 下"
      : `第 ${completedCount + 1} 段 / ${dailyProgress.nextGoal} 下`;
  dailyGoalFillNode.style.width = `${dailyProgress.percent}%`;
  dailyGoalListNode.innerHTML = "";

  DAILY_GOALS.forEach((goal) => {
    const item = document.createElement("div");
    const isDone = state.todayCount >= goal;
    const isCurrent = !isDone && dailyProgress.nextGoal === goal;
    item.className = `daily-goal-chip${isDone ? " is-done" : ""}${isCurrent ? " is-current" : ""}`;
    item.innerHTML = `<span>${goal}</span><strong>${isDone ? "已达成" : isCurrent ? "进行中" : "未开始"}</strong>`;
    dailyGoalListNode.appendChild(item);
  });
};

const pulseRitualStage = () => {
  if (!ritualStage || prefersReducedMotion) {
    return;
  }
  ritualStage.classList.remove("is-pulsing");
  window.clearTimeout(pulseTimer);
  void ritualStage.offsetWidth;
  ritualStage.classList.add("is-pulsing");
  pulseTimer = window.setTimeout(() => ritualStage.classList.remove("is-pulsing"), 220);
};

const updateComboBadge = (count, burst = false, rhythmFeedback = null) => {
  if (!comboBadge) {
    return;
  }
  if (rhythmFeedback?.kind === "guidance") {
    comboBadge.textContent = rhythmFeedback.badgeText || rhythmFeedback.shortLabel || rhythmFeedback.label;
    comboBadge.style.color = rhythmFeedback.tone === "warning" ? "#ffd0b4" : "#dff4ff";
    comboBadge.classList.add("is-visible");
    window.clearTimeout(comboBadgeTimer);
    comboBadgeTimer = window.setTimeout(() => {
      comboBadge.classList.remove("is-visible");
    }, rhythmFeedback.emphasis === "strong" ? 980 : 760);
    return;
  }
  if (count < 5) {
    comboBadge.classList.remove("is-visible");
    comboBadge.textContent = "";
    return;
  }
  const soundFeedback = getSoundStyleFeedback();
  comboBadge.textContent = burst ? `${soundFeedback.burstLabel} x${count}` : `${soundFeedback.comboLabel} x${count}`;
  comboBadge.style.color = burst ? soundFeedback.burstColor || "#dac5ff" : soundFeedback.comboColor || "";
  comboBadge.classList.add("is-visible");
  window.clearTimeout(comboBadgeTimer);
  comboBadgeTimer = window.setTimeout(() => {
    comboBadge.classList.remove("is-visible");
  }, burst ? 880 : 600);
};

const triggerComboFeedback = (isCombo = false, isBurst = false) => {
  if (!isCombo) {
    return;
  }
  body.classList.add("is-combo");
  if (isBurst) {
    body.classList.add("is-burst");
  }
  window.clearTimeout(comboTimer);
  comboTimer = window.setTimeout(() => {
    body.classList.remove("is-combo", "is-burst");
  }, isBurst ? 240 : 180);
};

const triggerUnlockFlash = () => {
  body.classList.add("is-unlocking");
  window.setTimeout(() => body.classList.remove("is-unlocking"), 240);
};

const switchDrawerPanel = (panelKey) => {
  panelTabs.forEach((tab) => {
    const active = tab.dataset.panelTarget === panelKey;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  drawerPanels.forEach((panel) => {
    const active = panel.dataset.panel === panelKey;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
  if (statsDrawerTitleNode) {
    statsDrawerTitleNode.textContent = PANEL_DRAWER_TITLES[panelKey] || "功能";
  }
};

const openStatsPopover = (panelKey, pinned = false) => {
  if (panelKey) {
    switchDrawerPanel(panelKey);
  }
  if (statsPopoverZone) {
    statsPopoverZone.classList.add("is-open");
  }
  if (realmGuide && !realmGuide.hidden) {
    realmGuide.hidden = true;
    if (realmGuideToggle) {
      realmGuideToggle.setAttribute("aria-expanded", "false");
    }
  }
  syncMobileOverlayState();
  popoverPinned = pinned;
};

const closeStatsPopover = (force = false) => {
  if (!statsPopoverZone) {
    return;
  }
  if (!force && (popoverPinned || statsPopoverZone.matches(":focus-within"))) {
    return;
  }
  statsPopoverZone.classList.remove("is-open");
  syncMobileOverlayState();
  popoverPinned = false;
};

const isMobileLayout = () => window.innerWidth <= 767;

const syncMobileOverlayState = () => {
  body.classList.toggle(
    "is-sheet-open",
    isMobileLayout() &&
      (Boolean(statsPopoverZone?.classList.contains("is-open")) || Boolean(realmGuide && !realmGuide.hidden)),
  );
};

const mountRealmGuide = () => {
  if (!realmGuide) {
    return;
  }

  if (isMobileLayout()) {
    if (realmCardNode && realmGuide.parentElement !== realmCardNode) {
      realmCardNode.appendChild(realmGuide);
    }
    realmGuide.classList.add("is-inline");
    realmGuide.style.removeProperty("left");
    realmGuide.style.removeProperty("top");
    return;
  }

  if (realmGuide.parentElement !== document.body) {
    document.body.appendChild(realmGuide);
  }
  realmGuide.classList.remove("is-inline");
};

const positionRealmGuide = () => {
  if (!realmGuide || !realmGuideToggle || realmGuide.hidden) {
    return;
  }
  if (isMobileLayout()) {
    realmGuide.style.removeProperty("left");
    realmGuide.style.removeProperty("top");
    return;
  }
  const buttonRect = realmGuideToggle.getBoundingClientRect();
  const guideRect = realmGuide.getBoundingClientRect();
  const gap = 14;
  const viewportPadding = 20;

  let left = buttonRect.right + gap;
  let top = buttonRect.top - 8;

  if (left + guideRect.width > window.innerWidth - viewportPadding) {
    left = buttonRect.left - guideRect.width - gap;
  }

  if (left < viewportPadding) {
    left = viewportPadding;
  }

  if (top + guideRect.height > window.innerHeight - viewportPadding) {
    top = window.innerHeight - guideRect.height - viewportPadding;
  }

  if (top < viewportPadding) {
    top = viewportPadding;
  }

  realmGuide.style.left = `${left}px`;
  realmGuide.style.top = `${top}px`;
};

const renderRealmGuide = () => {
  if (!realmGuideList) {
    return;
  }
  const currentLevel = getLevelInfo(state.totalCount).level;
  realmGuideList.innerHTML = "";
  REALMS.forEach((realm) => {
    const item = document.createElement("div");
    item.className = `realm-guide-item${currentLevel >= realm.minLevel && currentLevel <= realm.maxLevel ? " is-current" : ""}`;
    const minCount = LEVELS[realm.minLevel - 1]?.min ?? 0;
    const maxCount =
      realm.maxLevel >= LEVEL_CAP
        ? "10 万+"
        : `${(LEVELS[realm.maxLevel]?.min - 1).toLocaleString("zh-CN")} 下`;
    const countLabel =
      realm.maxLevel >= LEVEL_CAP
        ? `${minCount.toLocaleString("zh-CN")} 下起`
        : `${minCount.toLocaleString("zh-CN")} - ${maxCount}`;
    item.innerHTML = `
      <span class="realm-guide-chip">${realm.chip}</span>
      <p class="realm-guide-name">${realm.name}</p>
      <span class="realm-guide-range">Lv.${realm.minLevel} - Lv.${realm.maxLevel} · ${countLabel}</span>
    `;
    realmGuideList.appendChild(item);
  });
};

const maybeUnlockCollector = (options = {}) => {
  const unlockedBaseAppearances = APPEARANCES.filter(
    (appearance) => appearance.key !== "hologram" && appearance.countsTowardCollector !== false,
  )
    .map((appearance) => appearance.key)
    .every((key) => state.unlockedAppearances.includes(key));
  if (unlockedBaseAppearances) {
    unlockAchievement("collector", options);
  }
};

const unlockAppearance = (appearanceKey, options = {}) => {
  const appearance = APPEARANCES.find((item) => item.key === appearanceKey);
  if (!appearance || state.unlockedAppearances.includes(appearanceKey)) {
    return;
  }
  state.unlockedAppearances.push(appearanceKey);
  if (!options.silent) {
    showNotice(`外观解锁：${appearance.name}`, appearance.condition);
    playUnlockSound();
    triggerUnlockFlash();
  }
  renderAppearances();
  maybeUnlockCollector({ silent: options.silent });
};

const unlockSoundStyle = (soundStyleKey, options = {}) => {
  const soundStyle = SOUND_STYLES.find((item) => item.key === soundStyleKey);
  if (!soundStyle || state.unlockedSoundStyles.includes(soundStyleKey)) {
    return;
  }
  state.unlockedSoundStyles.push(soundStyleKey);
  state.soundStyleUnlockedAt[soundStyleKey] = new Date().toISOString();
  state.latestUnlockedSoundStyle = soundStyleKey;
  if (!options.silent) {
    const isSecretLine = Boolean(soundStyle.unlockCollectionCard);
    showNotice(
      `${isSecretLine ? "秘传音色解锁" : "音色解锁"}：${soundStyle.name}`,
      isSecretLine ? "这组秘传音色已经并入法器面板，现在可以直接切换试听。" : soundStyle.condition,
      isSecretLine ? "epic" : "common",
    );
    playUnlockSound(soundStyle.key);
    if (isSecretLine) {
      triggerUnlockFlash();
      spawnFloatTag("秘传音色", { variant: "epic", burst: true });
      showSoundStyleToast(soundStyle);
    }
  }
  renderSoundStyles();
};

const unlockAchievement = (achievementKey, options = {}) => {
  if (state.achievements.includes(achievementKey)) {
    return;
  }
  const achievement = ACHIEVEMENTS.find((item) => item.key === achievementKey);
  if (!achievement) {
    return;
  }
  state.achievements.push(achievementKey);
  state.achievementDates[achievementKey] = new Date().toISOString();
  if (achievementKey === "first_hit") {
    state.firstVisitComplete = true;
  }
  if (!options.silent) {
    showNotice(`成就解锁：${achievement.name}`, achievement.reward);
    playUnlockSound();
    triggerUnlockFlash();
  }
  APPEARANCES.filter((item) => item.unlockAchievement === achievementKey).forEach((item) => unlockAppearance(item.key, options));
  SOUND_STYLES.filter((item) => item.unlockAchievement === achievementKey).forEach((item) =>
    unlockSoundStyle(item.key, { ...options, silent: true }),
  );
  renderAchievements();
};

const renderAchievements = () => {
  if (!achievementList) {
    return;
  }
  achievementList.innerHTML = "";
  ACHIEVEMENTS.forEach((achievement) => {
    const unlocked = state.achievements.includes(achievement.key);
    const item = document.createElement("div");
    item.className = `achievement-item ${unlocked ? "is-done" : "is-pending"}`;
    const badge = unlocked ? "已达成" : "未达成";
    const dateText = unlocked
      ? `<span class="achievement-date">达成时间：${formatDateTime(state.achievementDates[achievement.key])}</span>`
      : "";
    item.innerHTML = `
      <div class="achievement-head">
        <p class="achievement-name">${achievement.name}</p>
        <span class="achievement-badge">${badge}</span>
      </div>
      <p class="achievement-meta">${unlocked ? achievement.reward : achievement.conditionLabel}</p>
      ${dateText}
    `;
    achievementList.appendChild(item);
  });
};

const renderAppearances = () => {
  if (!appearanceList) {
    return;
  }
  appearanceList.innerHTML = "";
  APPEARANCES.forEach((appearance) => {
    const unlocked = state.unlockedAppearances.includes(appearance.key);
    const active = state.currentAppearance === appearance.key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `appearance-item${unlocked ? "" : " is-locked"}${active ? " is-active" : ""}`;
    button.disabled = !unlocked;
    button.title = unlocked ? `切换到 ${appearance.name}` : appearance.condition;
    const statusLabel = unlocked ? (active ? "当前使用" : "可切换") : "未解锁";
    const conditionLabel = unlocked ? (active ? `${appearance.signal} · ${appearance.material}` : `${appearance.material} · 点击切换`) : appearance.condition;
    button.innerHTML = `
      <span class="appearance-swatch appearance-swatch-${appearance.key}" aria-hidden="true"></span>
      <span class="appearance-copy">
        <span class="appearance-kicker">${appearance.kind || "仪式法器"}</span>
        <p class="appearance-name">${appearance.name}</p>
        <p class="appearance-condition">${conditionLabel}</p>
      </span>
      <span class="appearance-lock">${statusLabel}</span>
    `;
    if (unlocked) {
      button.addEventListener("click", () => {
        state.currentAppearance = appearance.key;
        saveState();
        updateStatsUI();
        renderAppearances();
      });
    }
    appearanceList.appendChild(button);
  });
};

const renderSoundStyles = () => {
  if (!soundStyleList) {
    return;
  }
  soundStyleList.innerHTML = "";
  SOUND_STYLES.forEach((soundStyle) => {
    const unlocked = state.unlockedSoundStyles.includes(soundStyle.key);
    const active = state.currentSoundStyle === soundStyle.key;
    const progress = getSoundUnlockProgress(soundStyle);
    const linkedCard = soundStyle.unlockCollectionCard ? COLLECTION_CARD_MAP.get(soundStyle.unlockCollectionCard) : null;
    const isSecretLine = Boolean(linkedCard);
    const isRecentDrop = unlocked && state.latestUnlockedSoundStyle === soundStyle.key;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sound-style-item${unlocked ? "" : " is-locked"}${active ? " is-active" : ""}${isSecretLine ? " is-secret-line" : ""}${isRecentDrop ? " is-recent-drop" : ""}`;
    button.disabled = !unlocked;
    button.title = unlocked ? `切换到 ${soundStyle.name}` : soundStyle.condition;
    button.innerHTML = `
      <span class="sound-style-preview sound-style-preview-${soundStyle.key}"></span>
      <span>
        <span class="sound-style-tags">
          ${isSecretLine ? '<span class="sound-style-tag is-secret">秘传</span>' : ""}
          ${isRecentDrop ? '<span class="sound-style-tag is-recent">最近掉落</span>' : ""}
          ${linkedCard ? `<span class="sound-style-tag">${linkedCard.index}</span>` : ""}
        </span>
        <p class="sound-style-name">${soundStyle.name}</p>
        <p class="sound-style-condition">${unlocked ? (active ? `当前音色 · ${soundStyle.tone}` : `已解锁，可切换并试音 · ${soundStyle.tone}`) : `${soundStyle.condition} · ${progress.text}`}${linkedCard ? ` · 来源 ${linkedCard.title}` : ""}</p>
        <span class="sound-style-progress" aria-hidden="true">
          <span class="sound-style-progress-fill" style="width:${unlocked ? 100 : progress.ratio}%"></span>
        </span>
      </span>
      <span class="sound-style-lock">${unlocked ? (active ? "使用中" : "试听") : progress.ratio >= 100 ? "可解锁" : "推进中"}</span>
    `;
    if (unlocked) {
      button.addEventListener("click", () => {
        const changed = state.currentSoundStyle !== soundStyle.key;
        state.currentSoundStyle = soundStyle.key;
        updateStatsUI();
        renderSoundStyles();
        saveState();
        playHitSound(soundStyle.key, { preview: true });
        if (changed) {
          showNotice("音色已切换", `${soundStyle.name}已经生效，接下来的敲击会用这组音色。`, "common");
        }
      });
    }
    soundStyleList.appendChild(button);
  });
};

const getCollectionStatusLabel = (status) => {
  if (status === "unlocked") {
    return "已解锁";
  }
  if (status === "revealed") {
    return "待解锁";
  }
  return "隐藏中";
};

const getCollectionGroupLabel = (groupKey) => {
  if (groupKey === "milestone") {
    return "节点卡";
  }
  if (groupKey === "hidden") {
    return "隐藏款";
  }
  return "公开秘藏";
};

const getLinkedSoundStyleForCard = (cardKey) => SOUND_STYLES.find((soundStyle) => soundStyle.unlockCollectionCard === cardKey) || null;

const getSecretSoundSummary = () => {
  const secretStyles = SOUND_STYLES.filter((soundStyle) => soundStyle.unlockCollectionCard);
  const unlockedSecretStyles = secretStyles.filter((soundStyle) => state.unlockedSoundStyles.includes(soundStyle.key));
  const nextSecretStyle = secretStyles.find((soundStyle) => !state.unlockedSoundStyles.includes(soundStyle.key)) || null;
  const latestSecretStyle =
    typeof state.latestUnlockedSoundStyle === "string"
      ? secretStyles.find((soundStyle) => soundStyle.key === state.latestUnlockedSoundStyle) || null
      : null;

  return {
    total: secretStyles.length,
    unlocked: unlockedSecretStyles.length,
    next: nextSecretStyle,
    latest: latestSecretStyle,
  };
};

const getLatestDroppedCollectionCardKey = () => {
  if (typeof state.latestUnlockedSoundStyle !== "string" || !state.latestUnlockedSoundStyle) {
    return "";
  }
  return SOUND_STYLE_MAP.get(state.latestUnlockedSoundStyle)?.unlockCollectionCard || "";
};

const getCollectionDisplayTitle = (card, status) => {
  return status === "hidden" ? card.hiddenTitle || "未显影秘藏" : card.title;
};

const getSoundUnlockProgress = (soundStyle) => {
  if (soundStyle?.unlockCollectionCard) {
    const card = COLLECTION_CARD_MAP.get(soundStyle.unlockCollectionCard);
    if (!card) {
      return { ratio: 0, text: soundStyle.condition };
    }
    const cardState = getCollectionCardState(card);

    if (cardState.status === "unlocked") {
      return { ratio: 100, text: "隐藏秘藏已完成" };
    }

    if (card.key === "secret_echo") {
      if (cardState.status === "revealed") {
        const conditionsMet = [state.achievements.includes("discipline"), state.achievements.includes("thousand")].filter(Boolean)
          .length;
        return {
          ratio: 68 + conditionsMet * 16,
          text: `秘藏条件 ${conditionsMet} / 2`,
        };
      }
      return {
        ratio: Math.max(0, Math.min(60, (state.totalCount / 3000) * 60)),
        text: `显影 ${Math.min(state.totalCount, 3000).toLocaleString("zh-CN")} / 3,000`,
      };
    }

    if (card.key === "secret_completion") {
      if (cardState.status === "revealed") {
        const countRatio = Math.max(0, Math.min(1, (state.totalCount - 10000) / 90000));
        return {
          ratio: 72 + countRatio * 26,
          text: state.achievements.includes("collector")
            ? "收藏家已达成"
            : `十万圆满 ${Math.min(state.totalCount, 100000).toLocaleString("zh-CN")} / 100,000`,
        };
      }
      return {
        ratio: Math.max(0, Math.min(64, (state.totalCount / 10000) * 64)),
        text: `显影 ${Math.min(state.totalCount, 10000).toLocaleString("zh-CN")} / 10,000`,
      };
    }

    return {
      ratio: cardState.status === "revealed" ? 72 : 0,
      text: cardState.progressText,
    };
  }

  if (!soundStyle?.unlockAchievement) {
    return { ratio: 100, text: "默认可用" };
  }
  switch (soundStyle.unlockAchievement) {
    case "practitioner":
      return {
        ratio: Math.max(0, Math.min(100, (state.totalCount / 10) * 100)),
        text: `累计 ${Math.min(state.totalCount, 10)} / 10`,
      };
    case "discipline":
      return {
        ratio: Math.max(0, Math.min(100, (state.todayCount / 108) * 100)),
        text: `今日 ${Math.min(state.todayCount, 108)} / 108`,
      };
    case "streak_7":
      return {
        ratio: Math.max(0, Math.min(100, (state.streak / 7) * 100)),
        text: `连续 ${Math.min(state.streak, 7)} / 7 天`,
      };
    case "streak_30":
      return {
        ratio: Math.max(0, Math.min(100, (state.streak / 30) * 100)),
        text: `连续 ${Math.min(state.streak, 30)} / 30 天`,
      };
    case "thousand":
      return {
        ratio: Math.max(0, Math.min(100, (state.totalCount / 1000) * 100)),
        text: `累计 ${Math.min(state.totalCount, 1000).toLocaleString("zh-CN")} / 1,000`,
      };
    case "ten_thousand":
      return {
        ratio: Math.max(0, Math.min(100, (state.totalCount / 10000) * 100)),
        text: `累计 ${Math.min(state.totalCount, 10000).toLocaleString("zh-CN")} / 10,000`,
      };
    case "collector": {
      const unlockedBaseAppearances = APPEARANCES.filter((appearance) => appearance.key !== "hologram").filter((appearance) =>
        state.unlockedAppearances.includes(appearance.key),
      ).length;
      return {
        ratio: Math.max(0, Math.min(100, (unlockedBaseAppearances / 7) * 100)),
        text: `法器 ${unlockedBaseAppearances} / 7`,
      };
    }
    default:
      return { ratio: 0, text: soundStyle.condition };
  }
};

const getSoundUnlockProgressText = (soundStyle) => {
  return getSoundUnlockProgress(soundStyle).text;
};

const getNextSoundStyleToUnlock = () =>
  SOUND_STYLES.find((soundStyle) => !state.unlockedSoundStyles.includes(soundStyle.key)) || null;

const getCollectionNoticeVariant = (card, status) => {
  if (card.group === "hidden" && status === "unlocked") {
    return "epic";
  }
  if (card.group === "hidden" || card.group === "milestone" || status === "unlocked") {
    return "rare";
  }
  return "common";
};

const syncCollectionProgress = ({ silent = false } = {}) => {
  let didChange = false;

  COLLECTION_CARDS.forEach((card) => {
    const shouldReveal = card.isRevealed();
    const shouldUnlock = card.isUnlocked();
    const wasRevealed = state.revealedCollectionCards.includes(card.key);
    const wasUnlocked = state.unlockedCollectionCards.includes(card.key);

    if (shouldReveal && !wasRevealed) {
      state.revealedCollectionCards.push(card.key);
      didChange = true;
      if (!silent) {
        if (card.group !== "public") {
          showCollectionToast(card, "revealed");
        }
        const title = card.group === "hidden" ? "隐藏秘藏显影" : "新秘藏显影";
        const text =
          card.group === "hidden"
            ? "第三屏出现了一张新的模糊轮廓，现在可以点击查看条件。"
            : `${card.title} 已出现轮廓，现在可以前往第三屏查看条件。`;
        const variant = getCollectionNoticeVariant(card, "revealed");
        showNotice(title, text, variant);
        spawnFloatTag(card.group === "hidden" ? "显影" : "新秘藏", {
          variant,
          burst: card.group !== "public",
        });
      }
    }

    if (shouldUnlock && !wasUnlocked) {
      if (!state.revealedCollectionCards.includes(card.key)) {
        state.revealedCollectionCards.push(card.key);
      }
      state.unlockedCollectionCards.push(card.key);
      state.collectionUnlockedAt[card.key] = new Date().toISOString();
      state.latestCollectionCard = card.key;
      didChange = true;
      if (!silent) {
        showCollectionToast(card, "unlocked");
        const variant = getCollectionNoticeVariant(card, "unlocked");
        const title = card.group === "hidden" ? "隐藏秘藏解锁" : card.group === "milestone" ? "节点卡解锁" : "秘藏解锁";
        const text =
          card.group === "hidden"
            ? `${card.title} 已完整显影，现已收入秘藏。`
            : `${card.title} 已收入秘藏，第三屏现可查看完整卡面。`;
        showNotice(title, text, variant);
        spawnFloatTag(card.group === "hidden" ? "极秘" : card.group === "milestone" ? "节点卡" : "新秘藏", {
          variant,
          burst: variant !== "common",
        });
        triggerUnlockFlash();
        if (card.group === "hidden") {
          playLayeredTone([329.6, 523.2, 783.9], 1.6, 0.22);
        } else {
          playUnlockSound();
        }
      }

      SOUND_STYLES.filter((item) => item.unlockCollectionCard === card.key).forEach((item) =>
        unlockSoundStyle(item.key, { silent }),
      );
      APPEARANCES.filter((item) => item.unlockCollectionCard === card.key).forEach((item) =>
        unlockAppearance(item.key, { silent }),
      );
    }
  });

  if (didChange) {
    state.revealedCollectionCards = Array.from(new Set(state.revealedCollectionCards));
    state.unlockedCollectionCards = Array.from(new Set(state.unlockedCollectionCards));
  }

  return didChange;
};

const getCollectionCardState = (card) => {
  const unlocked = state.unlockedCollectionCards.includes(card.key);
  const revealed = unlocked || state.revealedCollectionCards.includes(card.key);
  const status = unlocked ? "unlocked" : revealed ? "revealed" : "hidden";
  const title = getCollectionDisplayTitle(card, status);
  const statusLabel = getCollectionStatusLabel(status);
  const progressText = card.getProgress();
  const unlockedAt = state.collectionUnlockedAt[card.key] || "";

  return {
    status,
    title,
    statusLabel,
    progressText,
    unlockedAt,
    image: revealed && card.image ? card.image : "",
    placeholder:
      status === "hidden"
        ? card.placeholder || "???"
        : card.group === "milestone"
          ? "NODE"
          : card.placeholder || "RELIC",
  };
};

const getCollectionVaultMeta = (card, view) => {
  if (view.status === "unlocked") {
    const linkedSoundStyle = getLinkedSoundStyleForCard(card.key);
    if (card.group === "hidden" && linkedSoundStyle) {
      return `已入柜 · ${linkedSoundStyle.shortName}`;
    }
    return card.group === "milestone" ? "节点已入柜" : "已入柜";
  }

  return view.status === "revealed" ? "显影中 · 查看条件" : "隐藏中 · 查看线索";
};

const getVaultSummary = () => {
  const cards = COLLECTION_CARDS.map((card) => ({ card, view: getCollectionCardState(card) }));
  const unlockedCards = cards.filter((item) => item.view.status === "unlocked");
  const hiddenCards = cards.filter((item) => item.view.status === "hidden");
  const publicUnlocked = unlockedCards.filter((item) => item.card.group === "public").length;
  const nodeUnlocked = unlockedCards.filter((item) => item.card.group === "milestone").length;
  const secretUnlocked = unlockedCards.filter((item) => item.card.group === "hidden").length;
  const nextCard = cards.find((item) => item.view.status !== "unlocked") || null;
  const latestUnlocked =
    (state.latestCollectionCard && cards.find((item) => item.card.key === state.latestCollectionCard)) ||
    unlockedCards[unlockedCards.length - 1] ||
    null;

  return {
    cards,
    unlockedCount: unlockedCards.length,
    hiddenCount: hiddenCards.length,
    publicUnlocked,
    nodeUnlocked,
    secretUnlocked,
    nextCard,
    latestUnlocked,
  };
};

const getFeaturedCollection = (summary = getVaultSummary()) => {
  return summary.latestUnlocked || summary.nextCard || summary.cards[0] || null;
};

const getRelicShareTarget = (summary = getVaultSummary()) => {
  const latestDroppedCardKey = getLatestDroppedCollectionCardKey();
  if (latestDroppedCardKey) {
    const droppedCard = summary.cards.find(
      (item) => item.card.key === latestDroppedCardKey && item.view.status === "unlocked",
    );
    if (droppedCard) {
      return droppedCard;
    }
  }
  return getFeaturedCollection(summary);
};

const openCollectionDetail = (cardKey) => {
  if (
    !(lightbox instanceof HTMLDialogElement) ||
    !lightboxImage ||
    !lightboxTitle ||
    !lightboxCaption ||
    !lightboxClose
  ) {
    return;
  }

  const card = COLLECTION_CARD_MAP.get(cardKey);
  if (!card) {
    return;
  }

  closeSecondaryOverlays();
  const view = getCollectionCardState(card);
  const title = view.status === "hidden" ? card.hiddenTitle || "未显影秘藏" : card.title;
  const kicker =
    view.status === "unlocked"
      ? `${card.kicker} / ${card.index}`
      : view.status === "revealed"
        ? `REVEALED / ${card.index}`
        : `HIDDEN / ${card.index}`;
  const caption = card.caption;
  const metaEntries = [
    card.group === "public" ? "公开秘藏" : card.group === "milestone" ? "节点封面" : "隐藏款",
    view.status === "unlocked" ? "已解锁" : view.status === "revealed" ? "待解锁" : "隐藏中",
    view.status !== "unlocked" ? view.progressText : "",
    view.unlockedAt ? `解锁于 ${formatDateTime(view.unlockedAt)}` : "",
    getLinkedSoundStyleForCard(card.key) ? `秘传音色：${getLinkedSoundStyleForCard(card.key).name}` : "",
    card.medium,
    card.tone,
  ].filter(Boolean);

  lightbox.classList.toggle("is-obscured", view.status !== "unlocked");
  lightbox.classList.toggle("is-secret", view.status === "hidden");
  lightboxTitle.textContent = title;
  lightboxCaption.textContent = caption;
  if (lightboxKicker) {
    lightboxKicker.textContent = kicker;
  }
  if (lightboxMeta) {
    lightboxMeta.innerHTML = "";
    metaEntries.forEach((entry) => {
      const chip = document.createElement("span");
      chip.className = "lightbox-meta-chip";
      chip.textContent = entry;
      lightboxMeta.appendChild(chip);
    });
  }

  if (view.image) {
    lightboxImage.onerror = () => {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
      lightboxImage.hidden = true;
      if (lightboxGhost) {
        lightboxGhost.hidden = false;
        const ghostText = lightboxGhost.querySelector(".lightbox-ghost-text");
        if (ghostText) {
          ghostText.textContent = view.status === "hidden" ? "HIDDEN RELIC" : "IMAGE SIGNAL";
        }
      }
    };
    lightboxImage.src = view.image;
    lightboxImage.alt = title;
    lightboxImage.hidden = false;
    if (lightboxGhost) {
      lightboxGhost.hidden = true;
    }
  } else {
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxImage.hidden = true;
    if (lightboxGhost) {
      lightboxGhost.hidden = false;
      const ghostText = lightboxGhost.querySelector(".lightbox-ghost-text");
      if (ghostText) {
        ghostText.textContent = view.status === "hidden" ? "HIDDEN RELIC" : "REVEALED SIGNAL";
      }
    }
  }

  lightbox.showModal();
};

const renderVault = (summary = getVaultSummary()) => {
  if (!vaultSectionsNode || !(vaultCardTemplate instanceof HTMLTemplateElement) || !(vaultSectionTemplate instanceof HTMLTemplateElement)) {
    return;
  }
  vaultSectionsNode.innerHTML = "";
  const latestDroppedCardKey = getLatestDroppedCollectionCardKey();

  COLLECTION_GROUPS.forEach((group) => {
    const groupCards = summary.cards.filter((item) => item.card.group === group.key);
    const sectionFragment = vaultSectionTemplate.content.cloneNode(true);
    const section = sectionFragment.querySelector(".vault-block");
    const kicker = sectionFragment.querySelector(".vault-block-kicker");
    const title = sectionFragment.querySelector(".vault-block-title");
    const count = sectionFragment.querySelector(".vault-block-count");
    const note = sectionFragment.querySelector(".vault-block-note");
    const progress = sectionFragment.querySelector(".vault-block-progress-fill");
    const grid = sectionFragment.querySelector(".vault-grid");

    if (!section || !grid || !kicker || !title || !count || !note || !progress) {
      return;
    }

    section.dataset.group = group.key;
    kicker.textContent = group.kicker;
    title.textContent = group.title;
    const unlockedCount = groupCards.filter((item) => item.view.status === "unlocked").length;
    const revealedCount = groupCards.filter((item) => item.view.status !== "hidden").length;
    const hiddenCount = groupCards.length - revealedCount;
    count.textContent = `${unlockedCount} / ${groupCards.length}`;
    note.textContent =
      hiddenCount === 0
        ? `已显满 · 入柜 ${unlockedCount} 张`
        : `显影 ${revealedCount} / ${groupCards.length} · 待显影 ${hiddenCount}`;
    const unlockPercent = groupCards.length ? (unlockedCount / groupCards.length) * 100 : 0;
    progress.style.width = `${unlockPercent}%`;
    progress.style.opacity = unlockPercent > 0 ? "1" : "0";

    groupCards.forEach(({ card, view }) => {
      const cardFragment = vaultCardTemplate.content.cloneNode(true);
      const article = cardFragment.querySelector(".collection-card");
      const button = cardFragment.querySelector(".collection-media");
      const index = cardFragment.querySelector(".collection-index");
      const stateNode = cardFragment.querySelector(".collection-state");
      const recentNode = cardFragment.querySelector(".collection-recent");
      const image = cardFragment.querySelector(".collection-image");
      const placeholder = cardFragment.querySelector(".collection-placeholder");
      const kickerNode = cardFragment.querySelector(".collection-kicker");
      const titleNode = cardFragment.querySelector(".collection-title");
      const metaNode = cardFragment.querySelector(".collection-meta");

      if (
        !article ||
        !button ||
        !index ||
        !stateNode ||
        !recentNode ||
        !image ||
        !placeholder ||
        !kickerNode ||
        !titleNode ||
        !metaNode
      ) {
        return;
      }

      const isRecent = view.status === "unlocked" && state.latestCollectionCard === card.key;
      const isSoundDrop = view.status === "unlocked" && latestDroppedCardKey === card.key;
      article.classList.add(`is-${view.status}`, `is-${card.group}`);
      article.classList.toggle("is-recent", isRecent);
      article.classList.toggle("is-sound-drop", isSoundDrop);
      if (view.status !== "unlocked") {
        article.classList.add("is-locked");
      }
      button.dataset.collectionKey = card.key;
      button.setAttribute("aria-label", `${view.status === "unlocked" ? "查看秘藏" : "查看解锁条件"}：${view.title}`);
      index.textContent = card.index;
      stateNode.textContent = view.statusLabel;
      const shouldShowRecent = view.status === "unlocked" && (isRecent || isSoundDrop);
      recentNode.hidden = !shouldShowRecent;
      recentNode.classList.toggle("is-sound-drop", shouldShowRecent && isSoundDrop);
      recentNode.textContent = shouldShowRecent
        ? isSoundDrop
          ? "秘传掉落"
          : card.group === "hidden"
            ? "隐藏点亮"
            : card.group === "milestone"
              ? "节点点亮"
              : "最近点亮"
        : "";
      kickerNode.textContent = card.kicker;
      titleNode.textContent = view.title;
      metaNode.textContent = getCollectionVaultMeta(card, view);
      placeholder.textContent = view.placeholder;

      if (view.image) {
        article.classList.remove("is-image-fallback");
        image.onerror = () => {
          article.classList.add("is-image-fallback");
          image.hidden = true;
          image.removeAttribute("src");
        };
        image.src = view.image;
        image.alt = `${titleNode.textContent} 卡面`;
        image.hidden = false;
      } else {
        image.removeAttribute("src");
        image.alt = "";
        image.hidden = true;
      }

      button.addEventListener("click", () => openCollectionDetail(card.key));
      grid.appendChild(cardFragment);
    });

    vaultSectionsNode.appendChild(sectionFragment);
  });

  if (vaultProgressNode) {
    vaultProgressNode.textContent = `已解锁 ${summary.unlockedCount} / ${COLLECTION_CARDS.length}`;
  }
  if (vaultLatestNode) {
    vaultLatestNode.textContent = summary.latestUnlocked
      ? `我的最近点亮：${summary.latestUnlocked.card.index} · ${summary.latestUnlocked.card.title}`
      : "继续修行以显影我的下一件收藏";
  }
  if (vaultPublicCountNode) {
    vaultPublicCountNode.textContent = `公开秘藏 ${summary.publicUnlocked} / ${COLLECTION_CARDS.filter((card) => card.group === "public").length}`;
  }
  if (vaultNodeCountNode) {
    vaultNodeCountNode.textContent = `节点卡 ${summary.nodeUnlocked} / ${COLLECTION_CARDS.filter((card) => card.group === "milestone").length}`;
  }
  if (vaultSecretCountNode) {
    vaultSecretCountNode.textContent = `隐藏款 ${summary.secretUnlocked} / ${COLLECTION_CARDS.filter((card) => card.group === "hidden").length}`;
  }
  if (vaultNextHintNode) {
    vaultNextHintNode.textContent = summary.nextCard
      ? `下一张：${summary.nextCard.card.index} · ${summary.nextCard.view.status === "revealed" ? "显影中" : "待显影"}`
      : "我的藏阁已全部显满";
  }
  if (vaultFootnoteNode) {
    vaultFootnoteNode.textContent =
      summary.hiddenCount > 0
        ? `我的藏阁里仍有 ${summary.hiddenCount} 张待显影，均可点击查看线索。`
        : "我的藏阁已经全部进入可见状态。";
  }
  if (
    vaultSpotlightProgress &&
    vaultSpotlightRevealed &&
    vaultSpotlightRevealedFill &&
    vaultSpotlightUnlocked &&
    vaultSpotlightUnlockedFill
  ) {
    const revealedCount = summary.cards.filter((item) => item.view.status !== "hidden").length;
    const totalCards = COLLECTION_CARDS.length;
    const revealedPercent = totalCards ? (revealedCount / totalCards) * 100 : 0;
    const unlockedPercent = totalCards ? (summary.unlockedCount / totalCards) * 100 : 0;

    vaultSpotlightProgress.hidden = totalCards === 0;
    vaultSpotlightRevealed.textContent = `${revealedCount} / ${totalCards}`;
    vaultSpotlightUnlocked.textContent = `${summary.unlockedCount} / ${totalCards}`;
    vaultSpotlightRevealedFill.style.width = `${revealedPercent}%`;
    vaultSpotlightUnlockedFill.style.width = `${unlockedPercent}%`;
    vaultSpotlightRevealedFill.style.opacity = revealedPercent > 0 ? "1" : "0";
    vaultSpotlightUnlockedFill.style.opacity = unlockedPercent > 0 ? "1" : "0";
  }
  if (
    vaultSpotlight &&
    vaultSpotlightKicker &&
    vaultSpotlightTitle &&
    vaultSpotlightNote &&
    vaultSpotlightMeta &&
    vaultSpotlightAction &&
    vaultSpotlightState &&
    vaultSpotlightImage &&
    vaultSpotlightPlaceholder &&
    vaultSpotlightCta
  ) {
      const featured = getRelicShareTarget(summary);
      if (!featured) {
        vaultSpotlight.hidden = true;
      } else {
        const { card, view } = featured;
        const spotlightStatusLabel =
          view.status === "revealed" ? "显影中" : view.statusLabel;
        const isSpotlightSoundDrop = latestDroppedCardKey === card.key && view.status === "unlocked";
        const spotlightTitle =
          view.status === "unlocked" ? card.title : view.title;
        const spotlightKicker =
        isSpotlightSoundDrop
          ? "秘传掉落"
          : view.status === "unlocked"
          ? "最近点亮"
          : view.status === "revealed"
            ? "显影中"
            : "下一张秘藏";
      const spotlightNote =
        isSpotlightSoundDrop
          ? `《${card.title}》刚入柜，并掉落了「${getLinkedSoundStyleForCard(card.key)?.name || "秘传音色"}」。`
          : view.status === "unlocked"
            ? `《${card.title}》已入柜，点击查看大图与展签。`
            : view.status === "revealed"
              ? `《${card.title}》已显影，点击查看当前条件。`
              : `这张秘藏仍在暗处，点击查看当前线索。`;
      const spotlightCta =
        view.status === "unlocked" ? "查看秘藏" : "查看条件";

      vaultSpotlight.hidden = false;
      vaultSpotlight.classList.remove(
        "is-unlocked-state",
        "is-revealed-state",
        "is-hidden-state",
      );
      vaultSpotlight.classList.add(
        view.status === "unlocked"
          ? "is-unlocked-state"
          : view.status === "revealed"
            ? "is-revealed-state"
            : "is-hidden-state",
      );
      vaultSpotlightKicker.textContent = spotlightKicker;
      vaultSpotlightTitle.textContent = spotlightTitle;
      vaultSpotlightNote.textContent = spotlightNote;
      vaultSpotlightState.textContent = spotlightStatusLabel;
      vaultSpotlightCta.textContent = spotlightCta;
      vaultSpotlightAction.setAttribute(
        "aria-label",
        `${view.status === "unlocked" ? "查看秘藏" : "查看解锁条件"}：${spotlightTitle}`,
      );
      vaultSpotlightAction.onclick = () => openCollectionDetail(card.key);
      vaultSpotlightAction.classList.remove(
        "is-unlocked-card",
        "is-revealed-card",
        "is-hidden-card",
        "is-public-card",
        "is-milestone-card",
        "is-secret-card",
        "is-sound-drop-card",
      );
      vaultSpotlightAction.classList.add(
        view.status === "unlocked"
          ? "is-unlocked-card"
          : view.status === "revealed"
            ? "is-revealed-card"
            : "is-hidden-card",
      );
      vaultSpotlightAction.classList.add(
        card.group === "hidden"
          ? "is-secret-card"
          : card.group === "milestone"
            ? "is-milestone-card"
            : "is-public-card",
      );
      vaultSpotlightAction.classList.toggle("is-sound-drop-card", isSpotlightSoundDrop);

      vaultSpotlightMeta.innerHTML = "";
      [
        card.index,
        getCollectionGroupLabel(card.group),
        spotlightStatusLabel,
        getLinkedSoundStyleForCard(card.key) ? `${isSpotlightSoundDrop ? "已掉落" : "掉落"} ${getLinkedSoundStyleForCard(card.key).shortName}` : "",
      ]
        .filter(Boolean)
        .forEach((entry) => {
          const chip = document.createElement("span");
          chip.className = "vault-spotlight-chip";
          chip.textContent = entry;
          vaultSpotlightMeta.appendChild(chip);
        });

      if (view.image) {
        vaultSpotlightAction.classList.remove("is-image-fallback-card");
        vaultSpotlightImage.onerror = () => {
          vaultSpotlightAction.classList.add("is-image-fallback-card");
          vaultSpotlightImage.hidden = true;
          vaultSpotlightImage.removeAttribute("src");
          vaultSpotlightPlaceholder.hidden = false;
        };
        vaultSpotlightImage.src = view.image;
        vaultSpotlightImage.alt = `${spotlightTitle} 卡面`;
        vaultSpotlightImage.hidden = false;
        vaultSpotlightPlaceholder.hidden = true;
      } else {
        vaultSpotlightAction.classList.add("is-image-fallback-card");
        vaultSpotlightImage.removeAttribute("src");
        vaultSpotlightImage.alt = "";
        vaultSpotlightImage.hidden = true;
        vaultSpotlightPlaceholder.hidden = false;
        vaultSpotlightPlaceholder.textContent =
          view.status === "hidden" ? "HIDDEN" : view.status === "revealed" ? "SIGNAL" : "VAULT";
      }
    }
  }
};

const ensureMilestonesConsistency = () => {
  MILESTONE_VALUES.forEach((threshold) => {
    if (state.totalCount >= threshold && !state.achievedMilestones.includes(threshold)) {
      state.achievedMilestones.push(threshold);
    }
  });
  state.achievedMilestones = state.achievedMilestones
    .filter((threshold) => MILESTONE_VALUES.includes(threshold) && threshold <= state.totalCount)
    .sort((a, b) => a - b);
};

const evaluateAchievements = (options = {}) => {
  if (state.totalCount >= 1) {
    unlockAchievement("first_hit", options);
  }
  if (state.totalCount >= 10) {
    unlockAchievement("practitioner", options);
  }
  if (state.todayCount >= 108) {
    unlockAchievement("discipline", options);
  }
  if (state.streak >= 7) {
    unlockAchievement("streak_7", options);
  }
  if (state.streak >= 30) {
    unlockAchievement("streak_30", options);
  }
  if (state.totalCount >= 1000) {
    unlockAchievement("thousand", options);
  }
  if (state.totalCount >= 10000) {
    unlockAchievement("ten_thousand", options);
  }
  maybeUnlockCollector(options);
};

const unlockDailyGoals = (previousTodayCount, currentTodayCount) => {
  const reachedGoals = DAILY_GOALS.filter(
    (goal) =>
      previousTodayCount < goal &&
      currentTodayCount >= goal &&
      !state.dailyGoalsClaimed.includes(goal),
  );

  reachedGoals.forEach((goal) => {
    state.dailyGoalsClaimed.push(goal);
    const isFinalGoal = goal === DAILY_GOALS[DAILY_GOALS.length - 1];
    showNotice(
      isFinalGoal ? "今日修行圆满" : "今日修行达成",
      isFinalGoal ? "108 下已完成，今天这一轮已经收住了。" : `已跨过 ${goal} 下，继续保持当前节奏。`,
      isFinalGoal ? "rare" : "common",
    );
    spawnFloatTag(isFinalGoal ? "108 圆满" : `${goal} 达成`, {
      burst: goal >= 54,
      variant: isFinalGoal ? "rare" : "common",
    });
    if (isFinalGoal) {
      playChimeSound();
    }
  });
};

const applyDailyProgressOnHit = () => {
  const today = localDateKey();
  if (state.lastVisitDate === today) {
    return;
  }
  if (!state.lastVisitDate) {
    state.streak = 1;
  } else if (isYesterday(state.lastVisitDate)) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.todayCount = 0;
  state.lastVisitDate = today;
};

const vibrate = () => {
  if (isCoarsePointer && navigator.vibrate) {
    const nowStamp = performance.now();
    if (nowStamp - lastHapticAt < MIN_HAPTIC_GAP_MS) {
      return;
    }
    lastHapticAt = nowStamp;
    navigator.vibrate(12);
  }
};

const strike = () => {
  applyDailyProgressOnHit();

  const previousTodayCount = state.todayCount;
  state.totalCount += 1;
  state.todayCount += 1;
  state.firstVisitComplete = true;

  recentHits.push(Date.now());
  recentHits = recentHits.filter((timestamp) => Date.now() - timestamp <= 4200);

  if (instrumentButton) {
    instrumentButton.classList.remove("is-striking");
    window.clearTimeout(strikeTimer);
    void instrumentButton.offsetWidth;
    instrumentButton.classList.add("is-striking");
    strikeTimer = window.setTimeout(() => instrumentButton.classList.remove("is-striking"), 240);
  }

  const comboCount = recentHits.length;
  const isCombo = comboCount >= 3;
  const isBurst = comboCount >= 8;
  const rhythmFeedback = getRhythmFeedback(recentHits);
  const tier = getStrikeTier(state.totalCount);
  const soundFeedback = getSoundStyleFeedback();
  const particleCount = Math.min(18, tier.particles + (isCombo ? 2 : 0) + (isBurst ? 2 : 0));
  const randomEvent = pickRandomEvent({ comboCount, totalCount: state.totalCount });

  pulseRitualStage();
  spawnParticles(particleCount, tier);
  spawnRipple(tier, isBurst);
  spawnHitNumber(1);
  if (comboCount >= 5) {
    spawnFloatTag(isBurst ? `${soundFeedback.burstLabel} x${comboCount}` : `${soundFeedback.comboLabel} x${comboCount}`, {
      burst: isBurst,
      variant: isBurst ? "rare" : "common",
    });
  }
  if (state.totalCount % 24 === 0) {
    const blessingPool = soundFeedback.blessingTags?.length ? soundFeedback.blessingTags : BLESSING_TAGS;
    spawnFloatTag(blessingPool[Math.floor(Math.random() * blessingPool.length)]);
  }
  if (state.totalCount % 72 === 0) {
    showRitualFlowPulse(soundFeedback.signalTitle || "感应", soundFeedback.signalNote || getNextZenQuote(), "common", 1800);
  }
  updateRhythmUI(rhythmFeedback);
  maybeRewardRhythm(rhythmFeedback);
  unlockDailyGoals(previousTodayCount, state.todayCount);
  if (randomEvent) {
    const rarityMeta = EVENT_RARITY_META[randomEvent.rarity] || EVENT_RARITY_META.common;
    const eventLabel = soundFeedback.eventAliases?.[randomEvent.label] || randomEvent.label;
    spawnHitNumber(1, eventLabel, {
      burst: randomEvent.burst,
      variant: rarityMeta.feedbackVariant,
    });
    spawnFloatTag(eventLabel, {
      burst: randomEvent.burst,
      variant: rarityMeta.feedbackVariant,
    });
    showRitualFlowPulse(eventLabel, randomEvent.note, rarityMeta.feedbackVariant, randomEvent.burst ? 2200 : 1700);
    if (randomEvent.rarity !== "common") {
      showNotice(`${rarityMeta.title} · ${eventLabel}`, randomEvent.note, rarityMeta.noticeVariant);
    }
  }
  updateComboBadge(comboCount, isBurst, rhythmFeedback);
  triggerComboFeedback(isCombo || Boolean(randomEvent), isBurst || Boolean(randomEvent?.burst));

  if (state.totalCount >= 1000) {
    body.classList.add("is-burst");
    window.setTimeout(() => body.classList.remove("is-burst"), 220);
  }

  playHitSound();
  vibrate();

  MILESTONE_VALUES.forEach((threshold) => {
    if (state.totalCount >= threshold && !state.achievedMilestones.includes(threshold)) {
      state.achievedMilestones.push(threshold);
      showMilestone(threshold);
    }
  });

  evaluateAchievements({ silent: false });
  const collectionChanged = syncCollectionProgress({ silent: false });
  updateStatsUI();
  renderAchievements();
  renderAppearances();
  renderSoundStyles();
  if (collectionChanged && latestShareDataUrl) {
    buildShareCard(state.shareMode);
  }
  saveState({ immediate: true });
};

const resetState = () => {
  const confirmed = window.confirm("这会清空当前浏览器里的累计次数、今日次数、连续天数、成就、法器外观、音色和秘藏解锁记录。确定继续吗？");
  if (!confirmed) {
    return;
  }
  state = {
    ...DEFAULT_STATE,
    soundEnabled: state.soundEnabled,
    shareMode: state.shareMode,
  };
  recentHits = [];
  lastRhythmFeedbackKey = "";
  lastRhythmHintAt = 0;
  updateRhythmUI(null);
  latestShareDataUrl = "";
  if (comboBadge) {
    comboBadge.classList.remove("is-visible");
    comboBadge.textContent = "";
  }
  if (sharePreviewLink) {
    sharePreviewLink.href = "#";
    sharePreviewLink.textContent = "预览卡片";
  }
  updateStatsUI();
  updateSoundUI();
  updateShareModeUI();
  renderAchievements();
  renderAppearances();
  renderSoundStyles();
  saveState({ immediate: true });
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
  ctx.closePath();
};

const drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) => {
  const chars = Array.from(text);
  const lines = [];
  let current = "";

  chars.forEach((char) => {
    const next = `${current}${char}`;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  const visibleLines = lines.slice(0, maxLines);
  visibleLines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
  return y + (visibleLines.length - 1) * lineHeight;
};

const updateShareModeUI = () => {
  shareModeButtons.forEach((button) => {
    const isActive = button.dataset.shareMode === state.shareMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

const getShareProfile = (mode = state.shareMode, options = {}) => {
  const realm = getRealm(state.totalCount);
  const levelInfo = getLevelInfo(state.totalCount);
  const dailyProgress = getDailyGoalProgress(state.todayCount);
  const highestMajorMilestone = options.milestone || getHighestMajorMilestone(state.totalCount);
  const currentAppearance =
    APPEARANCES.find((appearance) => appearance.key === state.currentAppearance) || APPEARANCES[0];
  const vaultSummary = getVaultSummary();
  const featuredCollection = getFeaturedCollection(vaultSummary);

  if (mode === "brand") {
    return {
      type: "brand",
      kicker: "BRAND POSTER",
      title: "DDMAX",
      subtitle: "CYBER ZEN RITUAL ARCHIVE",
      note: "赛博禅境与数字修行，汇成一个可步入的品牌入口。",
      badge: `${currentAppearance.name} · ${getSoundStyle().shortName}`,
      accentStart: "#f7cf70",
      accentEnd: "#8fd7ff",
      realm,
      levelInfo,
      dailyProgress,
      currentAppearance,
    };
  }

  if (mode === "relic") {
    const relicTarget = getRelicShareTarget(vaultSummary);
    const featuredCard = relicTarget?.card || null;
    const featuredView = relicTarget?.view || null;
    const linkedSoundStyle = featuredCard ? getLinkedSoundStyleForCard(featuredCard.key) : null;
    const isSecretDropFocus = Boolean(featuredCard && linkedSoundStyle && state.latestUnlockedSoundStyle === linkedSoundStyle.key);
    const accentMap = {
      public: { accentStart: "#f7cf70", accentEnd: "#00e5ff" },
      milestone: { accentStart: "#70d2ff", accentEnd: "#00e5ff" },
      hidden: { accentStart: "#b388ff", accentEnd: "#f7cf70" },
    };
    const accent = accentMap[featuredCard?.group || "public"] || accentMap.public;
    const nextCard = vaultSummary.nextCard;
    const vaultHeadline = featuredView
      ? isSecretDropFocus
        ? `秘传掉落：${featuredView.title}`
        : featuredView.status === "unlocked"
        ? `我的最近点亮：${featuredView.title}`
        : `正在推进：${featuredView.title}`
      : "个人秘藏系统已开启";
    const vaultNote = featuredCard
      ? isSecretDropFocus
        ? `《${featuredCard.title}》刚显满，并掉落秘传音色「${linkedSoundStyle?.name || "秘传音色"}」。这张卡现在适合作为本轮收藏海报。`
        : featuredView?.status === "unlocked"
        ? `《${featuredCard.title}》已入柜，我的藏阁已解锁 ${vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张。`
        : featuredView?.status === "revealed"
          ? `《${featuredView.title}》已显影，继续推进当前条件即可把它完整收入秘藏。`
          : "下一张深层秘藏仍在隐藏中，继续修行会让它开始显影。"
      : "第三屏的个人秘藏会随着修行、节点和成就逐步开启。";

    return {
      type: "relic",
      kicker: "RELIC POSTER",
      title: featuredView?.title || "我的秘藏柜",
      subtitle: featuredCard
        ? `${featuredCard.index} · ${getCollectionGroupLabel(featuredCard.group)} · ${isSecretDropFocus ? `秘传 ${linkedSoundStyle?.shortName || ""}` : `已解锁 ${vaultSummary.unlockedCount}/${COLLECTION_CARDS.length}`}`
        : `已解锁 ${vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张秘藏`,
      note: vaultNote,
      badge: featuredView
        ? `${getCollectionGroupLabel(featuredCard.group)} · ${isSecretDropFocus ? "秘传掉落" : featuredView.statusLabel}`
        : "秘藏进行中",
      accentStart: accent.accentStart,
      accentEnd: accent.accentEnd,
      realm,
      levelInfo,
      dailyProgress,
      currentAppearance,
      vaultSummary,
      featuredCollection: relicTarget,
      vaultHeadline,
      nextCard,
      linkedSoundStyle,
      isSecretDropFocus,
    };
  }

  if (mode === "milestone" && highestMajorMilestone !== null) {
    const milestoneMeta = MAJOR_MILESTONE_META[highestMajorMilestone];
    const milestoneConfig = MILESTONES[highestMajorMilestone];
    return {
      type: "milestone",
      kicker: "MILESTONE POSTER",
      title: milestoneMeta.shareTitle,
      subtitle: `${milestoneConfig.kicker} · 累计 ${state.totalCount.toLocaleString("zh-CN")} 下`,
      note: milestoneMeta.note,
      badge: `已抵达 ${formatCountLabel(highestMajorMilestone)}`,
      accentStart: milestoneMeta.accentStart,
      accentEnd: milestoneMeta.accentEnd,
      realm,
      levelInfo,
      dailyProgress,
      currentAppearance,
      majorMilestone: highestMajorMilestone,
    };
  }

  if (mode === "ritual") {
    return {
      type: "ritual",
      kicker: "RITUAL POSTER",
      title: state.todayCount >= DAILY_GOALS[DAILY_GOALS.length - 1] ? "今日圆满卡" : "今日仪式卡",
      subtitle:
        state.todayCount >= DAILY_GOALS[DAILY_GOALS.length - 1]
          ? `108 下已圆满 · ${realm.name} / Lv.${levelInfo.level}`
          : `${realm.name} / Lv.${levelInfo.level} · 今日 ${state.todayCount} 下`,
      note:
        state.todayCount >= DAILY_GOALS[DAILY_GOALS.length - 1]
          ? "今天这一轮已经收住，可以把这一口静气留成一张卡。"
          : "今天的修行还在继续，这张卡记录的是此刻的场域和节奏。",
      badge:
        state.todayCount >= DAILY_GOALS[DAILY_GOALS.length - 1]
          ? `108 已完成 · ${getSoundStyle().shortName}`
          : `${currentAppearance.name} · ${getSoundStyle().shortName}`,
      accentStart: "#fff0bf",
      accentEnd: "#70d2ff",
      realm,
      levelInfo,
      dailyProgress,
      currentAppearance,
    };
  }

  return {
    type: "battle",
    kicker: "BATTLE POSTER",
    title: "今日战绩卡",
    subtitle: `今日已敲 ${state.todayCount} 下 · ${realm.name} / Lv.${levelInfo.level}`,
    note:
      dailyProgress.nextGoal === null
        ? "今日 108 下已经完成。"
        : `距离下一段 ${dailyProgress.nextGoal} 下，还差 ${dailyProgress.nextGoal - state.todayCount} 下。`,
    badge: `Lv.${levelInfo.level} · ${getSoundStyle().shortName}`,
    accentStart: "#f7cf70",
    accentEnd: "#00e5ff",
    realm,
    levelInfo,
    dailyProgress,
    currentAppearance,
  };
};

const buildShareCard = (mode = state.shareMode, options = {}) => {
  if (!(shareCanvas instanceof HTMLCanvasElement)) {
    return "";
  }
  const ctx = shareCanvas.getContext("2d");
  if (!ctx) {
    return "";
  }

  const profile = getShareProfile(mode, options);
  const width = shareCanvas.width;
  const height = shareCanvas.height;
  const accentGradient = ctx.createLinearGradient(0, 0, width, height);
  const baseBackground = ctx.createLinearGradient(0, 0, width, height);

  baseBackground.addColorStop(0, "#04050a");
  baseBackground.addColorStop(
    0.42,
    profile.type === "milestone"
      ? "#0d1327"
      : profile.type === "brand"
        ? "#0f101a"
        : profile.type === "relic"
          ? "#120d1a"
          : "#0a101d",
  );
  baseBackground.addColorStop(
    1,
    profile.type === "ritual"
      ? "#20140d"
      : profile.type === "brand"
        ? "#11131c"
        : profile.type === "relic"
          ? "#171022"
          : "#171019",
  );

  accentGradient.addColorStop(0, profile.accentStart);
  accentGradient.addColorStop(1, profile.accentEnd);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = baseBackground;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.028)";
  for (let index = 0; index < 18; index += 1) {
    const y = 84 + index * 76;
    ctx.fillRect(64, y, width - 128, 1);
  }

  const glow = ctx.createRadialGradient(920, 260, 20, 920, 260, 260);
  glow.addColorStop(0, `${profile.accentStart}44`);
  glow.addColorStop(0.45, `${profile.accentEnd}22`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(920, 260, 280, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, width - 68, height - 68);

  drawRoundedRect(ctx, 72, 82, 236, 50, 25);
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  ctx.fillStyle = "#f7cf70";
  ctx.font = "700 26px Avenir Next, PingFang SC, sans-serif";
  ctx.fillText(`DDMAX / ${profile.kicker}`, 94, 115);

  drawRoundedRect(ctx, 876, 88, 250, 52, 26);
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();
  ctx.fillStyle = "#e8eaf6";
  ctx.font = profile.type === "relic" ? "700 19px Avenir Next, PingFang SC, sans-serif" : "700 22px Avenir Next, PingFang SC, sans-serif";
  ctx.fillText(profile.badge, 904, 121);

  const titleFontSize = profile.title.length >= 7 ? 82 : 96;
  ctx.fillStyle = "#f4f1ea";
  ctx.font = `700 ${titleFontSize}px Georgia, serif`;
  const titleBottom = drawWrappedText(ctx, profile.title, 82, 246, 560, titleFontSize * 0.94, 2);

  ctx.fillStyle = "rgba(232, 234, 246, 0.9)";
  ctx.font = "600 30px Avenir Next, PingFang SC, sans-serif";
  drawWrappedText(ctx, profile.subtitle, 82, titleBottom + 70, 560, 36, 2);

  ctx.fillStyle = "rgba(232, 234, 246, 0.68)";
  ctx.font = "500 27px Avenir Next, PingFang SC, sans-serif";
  drawWrappedText(ctx, profile.note, 82, titleBottom + 142, 520, 38, 3);

  const metricsStartY = Math.max(548, titleBottom + 302);
  const metricCards =
    profile.type === "brand"
      ? [
          { label: "定位", value: "赛博禅意" },
          { label: "结构", value: "修行 / 秘藏 / 品牌" },
          { label: "境界", value: `${profile.realm.name} / Lv.${profile.levelInfo.level}` },
          { label: "法器", value: profile.currentAppearance.name },
        ]
      : profile.type === "relic"
        ? [
            {
              label: "秘藏",
              value: profile.featuredCollection?.card
                ? `${profile.featuredCollection.card.index} ${profile.featuredCollection.view.title}`
                : "等待点亮",
            },
            { label: "状态", value: profile.featuredCollection?.view?.statusLabel || "隐藏中" },
            { label: "藏阁", value: `${profile.vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length}` },
            {
              label: "分类",
              value: profile.featuredCollection?.card
                ? getCollectionGroupLabel(profile.featuredCollection.card.group)
                : "秘藏",
            },
          ]
      : [
          { label: "今日", value: `${state.todayCount} 下` },
          { label: "累计", value: `${state.totalCount.toLocaleString("zh-CN")} 下` },
          { label: "境界", value: `${profile.realm.name} / Lv.${profile.levelInfo.level}` },
          { label: "法器", value: profile.currentAppearance.name },
        ];

  metricCards.forEach((card, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 82 + column * 272;
    const y = metricsStartY + row * 148;

    drawRoundedRect(ctx, x, y, 240, 116, 24);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    ctx.fillStyle = "rgba(232, 234, 246, 0.52)";
    ctx.font = "700 18px Avenir Next, PingFang SC, sans-serif";
    ctx.fillText(card.label, x + 20, y + 36);

    ctx.fillStyle = "#f4f1ea";
    ctx.font = "700 30px Avenir Next, PingFang SC, sans-serif";
    drawWrappedText(ctx, card.value, x + 20, y + 78, 188, 34, 2);
  });

  const summaryStartY = metricsStartY + 322;
  drawRoundedRect(ctx, 82, summaryStartY, 514, 178, 28);
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  const summaryHeading =
    profile.type === "brand" ? "品牌语气" : profile.type === "relic" ? "当前收藏进度" : "当前修行进度";
  const summaryHeadline =
    profile.type === "brand"
      ? "先进入数字道场，再记住 DDMAX"
      : profile.type === "relic"
        ? profile.vaultSummary.nextCard
          ? `${profile.vaultHeadline} · 下一张 ${profile.vaultSummary.nextCard.view.title}`
          : `${profile.vaultHeadline} · 全部秘藏已显影`
        : profile.dailyProgress.nextGoal === null
          ? "今日 108 下已圆满"
          : `距离下一段 ${profile.dailyProgress.nextGoal} 下，还差 ${profile.dailyProgress.nextGoal - state.todayCount} 下`;
  const summaryBody =
    profile.type === "brand"
      ? "这是一张品牌入口卡，用来快速介绍 DDMAX 的视觉气质和互动结构。"
      : profile.type === "relic"
        ? profile.featuredCollection?.view?.status === "unlocked"
          ? "这是一张秘藏卡，用来展示你最近点亮的收藏成果，也能作为第三屏当前进度的分享入口。"
          : "这是一张秘藏进度卡，用来展示下一张秘藏的显影状态、当前条件和藏阁推进情况。"
        : profile.type === "ritual"
          ? "这是一张仪式卡，用来留住此刻的修行状态和场域氛围。"
          : profile.type === "milestone"
            ? "这是一张节点卡，用来记录值得分享的关键里程碑时刻。"
            : "这是一张战绩卡，用来记录今天的敲击数据和升级进度。";

  ctx.fillStyle = "rgba(232, 234, 246, 0.56)";
  ctx.font = "700 20px Avenir Next, PingFang SC, sans-serif";
  ctx.fillText(summaryHeading, 108, summaryStartY + 46);
  ctx.fillStyle = "#f4f1ea";
  ctx.font = "600 28px Avenir Next, PingFang SC, sans-serif";
  drawWrappedText(ctx, summaryHeadline, 108, summaryStartY + 92, 448, 34, 2);
  ctx.fillStyle = "rgba(232, 234, 246, 0.62)";
  ctx.font = "500 24px Avenir Next, PingFang SC, sans-serif";
  drawWrappedText(ctx, summaryBody, 108, summaryStartY + 146, 448, 34, 2);

  ctx.save();
  ctx.translate(886, 840);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  if (profile.type === "relic") {
    [244, 188].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    const relicHalo = ctx.createRadialGradient(0, -30, 10, 0, 0, 240);
    relicHalo.addColorStop(0, `${profile.accentStart}40`);
    relicHalo.addColorStop(0.52, `${profile.accentEnd}18`);
    relicHalo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = relicHalo;
    ctx.beginPath();
    ctx.arc(0, 0, 244, 0, Math.PI * 2);
    ctx.fill();

    drawRoundedRect(ctx, -156, -228, 312, 428, 38);
    ctx.fillStyle = "rgba(7, 10, 16, 0.82)";
    ctx.fill();
    const relicStroke = ctx.createLinearGradient(-156, -228, 156, 200);
    relicStroke.addColorStop(0, profile.accentStart);
    relicStroke.addColorStop(1, profile.accentEnd);
    ctx.strokeStyle = relicStroke;
    ctx.stroke();

    drawRoundedRect(ctx, -132, -198, 264, 320, 28);
    ctx.fillStyle =
      profile.featuredCollection?.view?.status === "unlocked"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.02)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.stroke();

    ctx.fillStyle = "rgba(232, 234, 246, 0.54)";
    ctx.font = "700 18px Avenir Next, PingFang SC, sans-serif";
    ctx.fillText(profile.featuredCollection?.card?.index || "VAULT", -106, -156);

    drawRoundedRect(ctx, -132, 140, 264, 44, 22);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "700 20px Avenir Next, PingFang SC, sans-serif";
    ctx.fillText(profile.featuredCollection?.view?.statusLabel || "隐藏中", -104, 168);

    if (profile.featuredCollection?.view?.status === "unlocked") {
      const plate = ctx.createLinearGradient(-94, -144, 94, 82);
      plate.addColorStop(0, `${profile.accentStart}28`);
      plate.addColorStop(1, `${profile.accentEnd}18`);
      ctx.fillStyle = plate;
      drawRoundedRect(ctx, -94, -132, 188, 188, 34);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      [0, 1, 2].forEach((index) => {
        ctx.fillRect(-92, -92 + index * 42, 184, 1);
      });
    }

    ctx.fillStyle = "rgba(255, 244, 222, 0.94)";
    ctx.font = "700 38px Georgia, serif";
    drawWrappedText(ctx, profile.featuredCollection?.view?.title || "秘藏柜", -108, 96, 220, 36, 3);
  } else {
    [220, 164, 112].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    const halo = ctx.createRadialGradient(0, 0, 16, 0, 0, 210);
    halo.addColorStop(0, `${profile.accentStart}38`);
    halo.addColorStop(0.45, `${profile.accentEnd}16`);
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 220, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8d4c1f";
    ctx.beginPath();
    ctx.arc(0, 10, 158, 0, Math.PI * 2);
    ctx.fill();

    const bodyOrb = ctx.createRadialGradient(-34, -42, 10, 0, 0, 156);
    bodyOrb.addColorStop(0, "#ffe0b7");
    bodyOrb.addColorStop(0.22, "#b66a30");
    bodyOrb.addColorStop(0.64, "#6c3717");
    bodyOrb.addColorStop(1, "#180c08");
    ctx.fillStyle = bodyOrb;
    ctx.beginPath();
    ctx.arc(0, 10, 130, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#180b07";
    ctx.beginPath();
    ctx.moveTo(-12, -88);
    ctx.lineTo(12, -88);
    ctx.lineTo(28, 96);
    ctx.lineTo(-28, 96);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 245, 225, 0.74)";
    ctx.beginPath();
    ctx.arc(0, 10, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.rotate(-0.78);
    drawRoundedRect(ctx, 94, -196, 182, 28, 14);
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();
    const strikerGradient = ctx.createLinearGradient(96, -192, 270, -168);
    strikerGradient.addColorStop(0, profile.accentStart);
    strikerGradient.addColorStop(1, profile.accentEnd);
    ctx.fillStyle = strikerGradient;
    drawRoundedRect(ctx, 216, -214, 72, 64, 28);
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(232, 234, 246, 0.5)";
  ctx.font = "700 18px Avenir Next, PingFang SC, sans-serif";
  ctx.fillText("CYBER ZEN / VISUAL ARCHIVE / RITUAL INTERFACE", 82, 1338);

  ctx.fillStyle = "rgba(232, 234, 246, 0.64)";
  ctx.font = "500 22px Avenir Next, PingFang SC, sans-serif";
  ctx.fillText(window.location.href, 82, 1412);

  latestShareDataUrl = shareCanvas.toDataURL("image/png");
  if (sharePreviewLink) {
    sharePreviewLink.href = latestShareDataUrl;
    sharePreviewLink.textContent = `预览${SHARE_CARD_MODES[mode]?.label || "卡片"}`;
  }
  return latestShareDataUrl;
};

const downloadShareCard = () => {
  const dataUrl = latestShareDataUrl || buildShareCard();
  if (!dataUrl) {
    return;
  }
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `dmax-mokugyo-${localDateKey()}.png`;
  link.click();
};

const shareText = (mode = state.shareMode, options = {}) => {
  const profile = getShareProfile(mode, options);
  const dailyText =
    profile.dailyProgress.nextGoal === null
      ? "今日 108 下已圆满"
      : `距离下一段还差 ${profile.dailyProgress.nextGoal - state.todayCount} 下`;

  if (profile.type === "brand") {
    return "DDMAX 在赛博禅境之中，开启一场数字修行。";
  }

  if (profile.type === "relic") {
    if (profile.isSecretDropFocus && profile.featuredCollection?.card) {
      return `我在 DDMAX 刚点亮《${profile.featuredCollection.card.title}》，并掉落了秘传音色「${profile.linkedSoundStyle?.name || "秘传音色"}」。当前已解锁 ${profile.vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张秘藏。`;
    }
    if (profile.featuredCollection?.card && profile.featuredCollection?.view?.status === "unlocked") {
      return `我在 DDMAX 的个人秘藏里点亮了《${profile.featuredCollection.card.title}》，当前已解锁 ${profile.vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张秘藏。`;
    }
    if (profile.vaultSummary.nextCard) {
      return `我正在 DDMAX 推进秘藏收集，下一张是《${profile.vaultSummary.nextCard.view.title}》，当前已解锁 ${profile.vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张。`;
    }
    return `我正在 DDMAX 的个人秘藏里继续修行，当前已解锁 ${profile.vaultSummary.unlockedCount} / ${COLLECTION_CARDS.length} 张秘藏。`;
  }

  if (profile.type === "ritual") {
    return state.todayCount >= DAILY_GOALS[DAILY_GOALS.length - 1]
      ? `我在 DDMAX 完成了今天的 108 下修行，当前 ${profile.realm.name} · Lv.${profile.levelInfo.level}，使用 ${getSoundStyle().name}。这轮已经收住，留下一张今日圆满卡。`
      : `我在 DDMAX 记录了今天的修行时刻，当前 ${profile.realm.name} · Lv.${profile.levelInfo.level}，今日已敲 ${state.todayCount} 下，使用 ${getSoundStyle().name}。`;
  }

  if (profile.type === "milestone" && profile.majorMilestone) {
    return `我在 DDMAX 抵达了 ${formatCountLabel(profile.majorMilestone)} 节点，累计 ${state.totalCount.toLocaleString("zh-CN")} 下，当前 ${profile.realm.name} · Lv.${profile.levelInfo.level}。`;
  }

  return `我今天在 DDMAX 敲了 ${state.todayCount} 下木鱼，累计 ${state.totalCount.toLocaleString("zh-CN")} 下，当前 ${profile.realm.name} · Lv.${profile.levelInfo.level}，使用 ${getSoundStyle().name}，${dailyText}。`;
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showNotice("链接已复制", "现在可以去微信、社媒或聊天窗口粘贴分享。");
  } catch {
    showNotice("复制失败", "当前环境不支持自动复制，请手动复制地址栏链接。");
  }
};

const nativeShare = async () => {
  const text = shareText(state.shareMode);
  if (navigator.share) {
    try {
      await navigator.share({
        title: "DDMAX AI Visual Studio",
        text,
        url: window.location.href,
      });
      showNotice("已调用系统分享", "如果目标应用支持，你现在可以继续发送。");
      return;
    } catch {
      // Continue to fallback.
    }
  }
  buildShareCard(state.shareMode);
  await copyLink();
  showNotice("当前环境不支持系统分享", "已为你准备卡片和链接，可继续手动分享。");
};

const bindAnchorScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }
      const target = document.querySelector(href);
      if (!target) {
        return;
      }
      event.preventDefault();
      closeSecondaryOverlays();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  });
};

const setupRevealObserver = () => {
  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    reveals.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
      root: siteScroll instanceof HTMLElement ? siteScroll : null,
    },
  );

  reveals.forEach((item) => revealObserver.observe(item));
};

const setupWorkLoading = () => {
  document.querySelectorAll(".collection-card").forEach((card) => {
    const image = card.querySelector(".collection-image");
    if (!image) {
      return;
    }
    const finishLoading = () => card.classList.remove("is-loading");
    const placeholder = card.querySelector(".collection-placeholder");
    if (image.hidden || image.complete) {
      finishLoading();
    } else {
      image.addEventListener("load", finishLoading, { once: true });
      image.addEventListener("error", finishLoading, { once: true });
    }
    image.addEventListener(
      "error",
      () => {
        card.classList.add("is-image-fallback");
        image.hidden = true;
        image.removeAttribute("src");
        if (placeholder instanceof HTMLElement && !placeholder.textContent.trim()) {
          placeholder.textContent = "RELIC";
        }
      },
      { once: true },
    );
  });
};

const setupLightbox = () => {
  if (
    !(lightbox instanceof HTMLDialogElement) ||
    !lightboxImage ||
    !lightboxTitle ||
    !lightboxCaption ||
    !lightboxClose
  ) {
    return;
  }

  const cleanupLightbox = () => {
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("alt");
    lightboxImage.onerror = null;
    lightbox.classList.remove("is-obscured", "is-secret");
    lightboxImage.hidden = false;
    lightboxTitle.textContent = "作品标题";
    lightboxCaption.textContent = "作品描述";
    if (lightboxKicker) {
      lightboxKicker.textContent = "藏阁详情";
    }
    if (lightboxGhost) {
      lightboxGhost.hidden = true;
    }
    if (lightboxMeta) {
      lightboxMeta.innerHTML = "";
    }
  };

  const closeLightbox = () => {
    if (lightbox.open) {
      lightbox.close();
      return;
    }
    cleanupLightbox();
  };

  closeLightboxAction = closeLightbox;

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("close", cleanupLightbox);
  lightbox.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeLightbox();
  });
  lightbox.addEventListener("click", (event) => {
    const rect = lightbox.getBoundingClientRect();
    const isInside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInside) {
      closeLightbox();
    }
  });
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

bindAnchorScroll();
setupRevealObserver();
setupWorkLoading();
setupLightbox();

if (milestoneToast) {
  milestoneToast.addEventListener("click", dismissMilestoneToast);
  milestoneToast.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismissMilestoneToast();
    }
  });
}

if (collectionToast) {
  collectionToast.addEventListener("click", dismissCollectionToast);
  collectionToast.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismissCollectionToast();
    }
  });
}

if (soundStyleToast) {
  soundStyleToast.addEventListener("click", dismissSoundStyleToast);
  soundStyleToast.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismissSoundStyleToast();
    }
  });
}

ensureMilestonesConsistency();
syncDailyCounters();
evaluateAchievements({ silent: true });
syncCollectionProgress({ silent: true });
if (!APPEARANCES.some((appearance) => appearance.key === state.currentAppearance)) {
  state.currentAppearance = "classic";
}
if (!state.unlockedAppearances.includes(state.currentAppearance)) {
  state.currentAppearance = "classic";
}
if (!SOUND_STYLES.some((soundStyle) => soundStyle.key === state.currentSoundStyle)) {
  state.currentSoundStyle = "classic";
}
if (!state.unlockedSoundStyles.includes(state.currentSoundStyle)) {
  state.currentSoundStyle = "classic";
}
updateStatsUI();
updateSoundUI();
updateShareModeUI();
renderAchievements();
renderAppearances();
renderSoundStyles();
renderRealmGuide();
switchDrawerPanel("achievements");
saveState({ immediate: true });
isHydrating = false;

if (restoredStateSource === "backup") {
  showNotice("记录已恢复", "检测到主存档异常，已从本地备份恢复当前浏览器的修行记录。", "rare");
} else if (restoredStateSource === "legacy") {
  showNotice("记录已迁移", "已把旧版本修行记录升级到当前结构。", "common");
}

if (hitButton) {
  hitButton.addEventListener("click", strike);
}

if (instrumentButton) {
  instrumentButton.addEventListener("click", strike);
}

if (resetButton) {
  resetButton.addEventListener("click", resetState);
}

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundUI();
    saveState();
  });
}

if (shareGenerateButton) {
  shareGenerateButton.addEventListener("click", () => {
    const profile = getShareProfile(state.shareMode);
    buildShareCard(state.shareMode);
    const shareMessage =
      profile.type === "relic" && profile.isSecretDropFocus
        ? `当前已切到《${profile.title}》的秘传掉落海报，可继续预览、下载或系统分享。`
        : `当前已切到${profile.title}，可以继续预览、下载或系统分享。`;
    showNotice(`${SHARE_CARD_MODES[state.shareMode].label}已生成`, shareMessage);
  });
}

if (shareDownloadButton) {
  shareDownloadButton.addEventListener("click", downloadShareCard);
}

if (shareCopyButton) {
  shareCopyButton.addEventListener("click", copyLink);
}

if (shareNativeButton) {
  shareNativeButton.addEventListener("click", nativeShare);
}

shareModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextMode = button.dataset.shareMode;
    if (!nextMode || !KNOWN_SHARE_MODES.has(nextMode)) {
      return;
    }
    state.shareMode = nextMode;
    updateShareModeUI();
    buildShareCard(state.shareMode);
    saveState();
  });
});

if (realmGuideToggle && realmGuide) {
  mountRealmGuide();

  const toggleRealmGuide = () => {
    mountRealmGuide();
    const willOpen = realmGuide.hidden;
    if (willOpen) {
      closeStatsPopover(true);
    }
    realmGuide.hidden = !willOpen;
    realmGuideToggle.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      requestAnimationFrame(positionRealmGuide);
    }
    syncMobileOverlayState();
  };

  realmGuideToggle.addEventListener("click", toggleRealmGuide);
}

if (realmGuideCloseButton && realmGuide && realmGuideToggle) {
  realmGuideCloseButton.addEventListener("click", () => {
    realmGuide.hidden = true;
    realmGuideToggle.setAttribute("aria-expanded", "false");
    syncMobileOverlayState();
  });
}

if (statsDrawerCloseButton) {
  statsDrawerCloseButton.addEventListener("click", () => {
    closeStatsPopover(true);
  });
}

window.addEventListener("resize", () => {
  scheduleViewportSync();
});

if (siteScroll instanceof HTMLElement) {
  siteScroll.addEventListener("scroll", positionRealmGuide, { passive: true });
}

panelTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const panelKey = tab.dataset.panelTarget || "achievements";
    const isSamePanel = tab.classList.contains("is-active");
    const isOpen = statsPopoverZone?.classList.contains("is-open");

    if (isOpen && isSamePanel) {
      closeStatsPopover(true);
      return;
    }

    openStatsPopover(panelKey, true);
    if (isMobileLayout() && statsDrawer instanceof HTMLElement) {
      statsDrawer.scrollTop = 0;
    }
  });
});

document.addEventListener("click", (event) => {
  if (
    statsPopoverZone &&
    event.target instanceof Node &&
    !statsPopoverZone.contains(event.target)
  ) {
    closeStatsPopover(true);
  }
  if (
    realmGuide &&
    realmGuideToggle &&
    event.target instanceof Node &&
    !realmGuide.contains(event.target) &&
    !realmGuideToggle.contains(event.target)
  ) {
    realmGuide.hidden = true;
    realmGuideToggle.setAttribute("aria-expanded", "false");
    syncMobileOverlayState();
  }
});

document.addEventListener("keydown", (event) => {
  const isTyping =
    event.target instanceof HTMLElement &&
    (event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA" ||
      event.target.isContentEditable);

  if (isTyping) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    strike();
  }

  if (event.key === "Escape" && lightbox instanceof HTMLDialogElement && lightbox.open) {
    closeLightboxAction();
    return;
  }

  if (event.key === "Escape") {
    closeSecondaryOverlays();
  }
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    return;
  }
  resetTransientFeedback();
  dismissMilestoneToast();
  dismissCollectionToast();
  closeSecondaryOverlays();
  if (audioContext && audioContext.state === "running") {
    audioContext.suspend().catch(() => {});
  }
  flushStateSave();
});

window.addEventListener("pagehide", () => {
  flushStateSave();
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY && event.key !== STORAGE_BACKUP_KEY) {
    return;
  }
  const nextRaw = readStoredState(STORAGE_KEY) || readStoredState(STORAGE_BACKUP_KEY);
  if (!nextRaw) {
    return;
  }
  const nextState = normalizeState(nextRaw);
  const currentSnapshot = JSON.stringify(normalizeState(state));
  const nextSnapshot = JSON.stringify(nextState);
  if (currentSnapshot === nextSnapshot) {
    return;
  }
  state = nextState;
  ensureMilestonesConsistency();
  syncDailyCounters();
  evaluateAchievements({ silent: true });
  syncCollectionProgress({ silent: true });
  updateStatsUI();
  updateSoundUI();
  updateShareModeUI();
  renderAchievements();
  renderAppearances();
  renderSoundStyles();
  renderRealmGuide();
  if (latestShareDataUrl) {
    buildShareCard(state.shareMode);
  }
  showNotice("状态已同步", "你在另一窗口更新的修行记录已同步到当前页面。", "common");
});
