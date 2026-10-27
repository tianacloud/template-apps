/**
 * db.js — 本地数据层
 *
 * 当前为单机版本：全部数据持久化在浏览器 localStorage（key: mkt_v1）。
 * 权限模型按门店 + 角色在读取时过滤，与将来接云端时的 RLS 语义保持一致：
 *   consultant → 仅本人名下客户
 *   manager    → 本门店全部客户
 *   hq         → 全部门店，客户姓名脱敏
 *
 * 说明：本地存储不是安全边界，只用于单机演示与试用；多门店实时协作需要接云端库。
 */

import { DIMENSIONS, SIGNAL_MAP, CUSTOMER_LEVELS } from './taxonomy.js';

const KEY = 'mkt_v1';
const SCHEMA_VERSION = 4;

/* ------------------------------------------------------------------ 基础 */

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.schemaVersion !== SCHEMA_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

export function persist(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[db] 写入失败', e);
    return false;
  }
}

export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ------------------------------------------------------------------ 种子 */

function seed() {
  const stores = [
    { id: 'st_sy', name: '沈阳万象城店', city: '沈阳', code: 'SY-01' },
    { id: 'st_zh', name: '沈阳中街店', city: '沈阳', code: 'SY-02' },
  ];

  const users = [
    { id: 'u_lin', name: '林悦', role: 'consultant', storeId: 'st_sy', title: '高级美容顾问' },
    { id: 'u_zhao', name: '赵婧', role: 'consultant', storeId: 'st_sy', title: '美容顾问' },
    { id: 'u_wang', name: '王琳', role: 'manager', storeId: 'st_sy', title: '店长' },
    { id: 'u_qian', name: '钱伟', role: 'consultant', storeId: 'st_zh', title: '美容顾问' },
    { id: 'u_shen', name: '沈明', role: 'hq', storeId: null, title: '区域运营' },
  ];

  const customers = [
    { id: 'c_li', storeId: 'st_sy', ownerId: 'u_lin', name: '李静', gender: '女', age: 35, phone: '138****6721', source: '小红书到店', level: 'new', joinedAt: '2026-09-12', note: '对成分比较关注，会自己查资料' },
    { id: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', name: '张敏', gender: '女', age: 41, phone: '139****3345', source: '老客转介绍', level: 'regular', joinedAt: '2026-01-18', note: '节奏很稳，按时到店，在意数据变化' },
    { id: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', name: '陈曦', gender: '女', age: 28, phone: '137****8890', source: '美团到店', level: 'regular', joinedAt: '2026-06-05', note: '工作压力大，下巴反复长痘' },
    { id: 'c_liu', storeId: 'st_sy', ownerId: 'u_zhao', name: '刘佳', gender: '女', age: 33, phone: '135****2213', source: '朋友介绍', level: 'regular', joinedAt: '2026-04-11', note: '生完孩子后两颊出现成片色斑' },
    { id: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', name: '孙媛', gender: '女', age: 46, phone: '136****7788', source: '会所导流', level: 'vip', joinedAt: '2025-11-02', note: '企业主，时间紧，接受年卡节奏' },
    { id: 'c_zhou', storeId: 'st_sy', ownerId: 'u_zhao', name: '周琳', gender: '女', age: 29, phone: '133****4456', source: '抖音到店', level: 'new', joinedAt: '2026-10-20', note: '第一次做皮肤管理，比较谨慎' },
    { id: 'c_wu', storeId: 'st_sy', ownerId: 'u_lin', name: '吴倩', gender: '女', age: 38, phone: '138****9902', source: '商场客流', level: 'dormant', joinedAt: '2025-09-20', note: '上次说工作调动，之后就没再来' },
    { id: 'c_xu', storeId: 'st_sy', ownerId: 'u_zhao', name: '徐婷', gender: '女', age: 31, phone: '150****1123', source: '大众点评', level: 'regular', joinedAt: '2026-03-14', note: '长期加班，眼周问题明显' },
    { id: 'c_he', storeId: 'st_sy', ownerId: 'u_zhao', name: '何珊', gender: '女', age: 26, phone: '151****6688', source: '同事推荐', level: 'new', joinedAt: '2026-10-12', note: '预算有限，对价格很敏感' },
    { id: 'c_ma', storeId: 'st_sy', ownerId: 'u_lin', name: '马晓', gender: '女', age: 52, phone: '139****0077', source: '老客转介绍', level: 'vip', joinedAt: '2025-06-08', note: '关注轮廓和色斑，愿意按年规划' },
    { id: 'c_tan', storeId: 'st_zh', ownerId: 'u_qian', name: '谭雪', gender: '女', age: 30, phone: '186****3311', source: '美团到店', level: 'new', joinedAt: '2026-09-30', note: '中街店，通勤族' },
    { id: 'c_guo', storeId: 'st_zh', ownerId: 'u_qian', name: '郭敏', gender: '女', age: 44, phone: '187****5522', source: '商场客流', level: 'regular', joinedAt: '2026-02-20', note: '中街店，偏爱舒缓类项目' },
  ];

  /** 面诊记录：dims 只写有值的维度，source 逐项标注 */
  const assessments = [
    // ---- 李静：两次，本次为示例场景 ----
    {
      id: 'a_li_1', customerId: 'c_li', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-12T15:20:00',
      dims: {
        skinType: { v: 'mixed-dry', source: 'eye' },
        hydration: { v: 'low', source: 'device' },
        pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'sun', source: 'device' },
        barrier: { v: 'normal', source: 'eye' },
        oil: { v: 't-zone', source: 'eye' },
      },
      signals: ['stay-up', 'makeup-cake', 'irritated'],
      note: '自述最近熬夜多，上妆卡粉。之前用过某品牌美白精华觉得刺激，已经停了。3 个月前在别处做过一次基础补水，没办卡。',
      concern: '想先把卡粉解决掉，不太敢用美白的东西',
      device: { hydration: 41, oil: 62, pigment: 38 },
    },
    {
      id: 'a_li_2', customerId: 'c_li', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-10-18T14:05:00',
      dims: {
        skinType: { v: 'mixed-dry', source: 'eye' },
        hydration: { v: 'low', source: 'device' },
        oil: { v: 't-zone', source: 'eye' },
        pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'sun', source: 'device' },
        barrier: { v: 'redness', source: 'eye' },
        eye: { v: 'fine-line', source: 'eye' },
      },
      signals: ['stay-up', 'makeup-cake', 'irritated', 'want-whiten', 'price-sensitive'],
      note: '这两周加班到十二点，卡粉更明显了。问能不能做提亮，说上次那个美白精华用完脸有点烫。提到价格时停顿了一下，说先看看效果。',
      concern: '想提亮，但怕又刺激',
      device: { hydration: 39, oil: 60, pigment: 41 },
    },

    // ---- 张敏：三次，含水量明显改善，用于趋势 ----
    {
      id: 'a_zhang_1', customerId: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-07-20T10:30:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'very-low', source: 'device' },
        barrier: { v: 'thin', source: 'eye' }, wrinkle: { v: 'static', source: 'eye' },
        eye: { v: 'fine-line', source: 'eye' }, pores: { v: 'fine', source: 'eye' },
      },
      signals: ['season', 'makeup-cake'],
      note: '换季后两颊起皮，法令纹比去年明显。之前只做基础补水，没有系统疗程。',
      concern: '想让脸不要那么干，也别显老',
      device: { hydration: 36, oil: 41, pigment: 22 },
    },
    {
      id: 'a_zhang_2', customerId: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-08-24T10:15:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'low', source: 'device' },
        barrier: { v: 'thin', source: 'eye' }, wrinkle: { v: 'static', source: 'eye' },
        eye: { v: 'fine-line', source: 'eye' }, pores: { v: 'fine', source: 'eye' },
      },
      signals: ['season'],
      note: '第二次修护后，起皮没有了，上妆服帖很多。自己说脸颊没那么绷。',
      concern: '想继续把干纹压下去',
      device: { hydration: 45, oil: 44, pigment: 23 },
    },
    {
      id: 'a_zhang_3', customerId: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-28T10:40:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        barrier: { v: 'normal', source: 'eye' }, wrinkle: { v: 'dynamic', source: 'eye' },
        eye: { v: 'good', source: 'eye' }, pores: { v: 'fine', source: 'eye' },
      },
      signals: ['want-lift'],
      note: '屏障稳住了，含水量连续两次上升。主动问能不能开始做紧致。',
      concern: '想开始处理法令纹',
      device: { hydration: 52, oil: 43, pigment: 21 },
    },

    // ---- 陈曦：三次，痘肌 ----
    {
      id: 'a_chen_1', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-08-30T18:10:00',
      dims: {
        skinType: { v: 'oily', source: 'eye' }, oil: { v: 'high', source: 'eye' },
        acne: { v: 'active', source: 'eye' }, pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'acne-mark', source: 'eye' }, barrier: { v: 'redness', source: 'eye' },
      },
      signals: ['quick-result', 'price-sensitive'],
      note: '下巴反复长痘两个月，之前自己刷酸，越刷越红。希望一周就能好。',
      concern: '想赶紧把痘压下去',
      device: { hydration: 48, oil: 78, pigment: 44 },
    },
    {
      id: 'a_chen_2', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-20T18:30:00',
      dims: {
        skinType: { v: 'oily', source: 'eye' }, oil: { v: 'high', source: 'eye' },
        acne: { v: 'closed', source: 'eye' }, pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'acne-mark', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['quick-result'],
      note: '红肿消了，剩下闭口和痘印。停了刷酸之后泛红退了。',
      concern: '痘印什么时候能淡',
      device: { hydration: 51, oil: 71, pigment: 42 },
    },
    {
      id: 'a_chen_3', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-10-15T18:00:00',
      dims: {
        skinType: { v: 'oily', source: 'eye' }, oil: { v: 't-zone', source: 'eye' },
        acne: { v: 'closed', source: 'eye' }, pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'acne-mark', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['compare-clinic'],
      note: '同事推荐了另一家做刷酸，她在纠结。痘印比上次淡了一点。',
      concern: '在对比别家的刷酸套餐',
      device: { hydration: 53, oil: 66, pigment: 38 },
    },

    // ---- 刘佳：黄褐斑倾向，需要谨慎 ----
    {
      id: 'a_liu_1', customerId: 'c_liu', storeId: 'st_sy', ownerId: 'u_zhao', at: '2026-09-05T11:00:00',
      dims: {
        skinType: { v: 'mixed', source: 'eye' }, pigment: { v: 'melasma', source: 'device' },
        barrier: { v: 'thin', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        eye: { v: 'dark', source: 'eye' },
      },
      signals: ['want-whiten', 'fear-redness', 'quick-result'],
      note: '生完孩子后两颊出现成片色斑，做过一次光子，反黑了。现在很怕刺激。',
      concern: '想把斑去掉，但不敢再试',
      device: { hydration: 46, oil: 55, pigment: 71 },
    },
    {
      id: 'a_liu_2', customerId: 'c_liu', storeId: 'st_sy', ownerId: 'u_zhao', at: '2026-10-08T11:10:00',
      dims: {
        skinType: { v: 'mixed', source: 'eye' }, pigment: { v: 'melasma', source: 'device' },
        barrier: { v: 'normal', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        eye: { v: 'dark', source: 'eye' },
      },
      signals: ['want-whiten', 'fear-redness'],
      note: '屏障比上次稳，泛红少了。色斑没明显变化，但她说没那么急躁了。',
      concern: '问能不能开始做提亮',
      device: { hydration: 48, oil: 54, pigment: 69 },
    },

    // ---- 孙媛：高客单，多次 ----
    {
      id: 'a_sun_1', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-06-15T14:00:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'low', source: 'device' },
        wrinkle: { v: 'sagging', source: 'eye' }, pigment: { v: 'dull', source: 'eye' },
        eye: { v: 'puff', source: 'eye' }, barrier: { v: 'thin', source: 'eye' },
      },
      signals: ['busy', 'want-lift'],
      note: '时间很少，一次最多两小时。希望一年内轮廓有明显变化。',
      concern: '下颌线越来越不清晰',
      device: { hydration: 42, oil: 38, pigment: 30 },
    },
    {
      id: 'a_sun_2', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-07-20T14:20:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        wrinkle: { v: 'sagging', source: 'eye' }, pigment: { v: 'dull', source: 'eye' },
        eye: { v: 'puff', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['busy'],
      note: '第一轮射频后自己感觉脸更紧了，拍照对比有感觉。',
      concern: '想知道还要做几次',
      device: { hydration: 47, oil: 39, pigment: 29 },
    },
    {
      id: 'a_sun_3', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-08-25T14:00:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        wrinkle: { v: 'static', source: 'eye' }, pigment: { v: 'dull', source: 'eye' },
        eye: { v: 'puff', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['busy'],
      note: '轮廓有改善，静态纹还在。她说朋友问她是不是瘦了。',
      concern: '继续按节奏走',
      device: { hydration: 49, oil: 37, pigment: 27 },
    },
    {
      id: 'a_sun_4', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-10-02T14:10:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'good', source: 'device' },
        wrinkle: { v: 'dynamic', source: 'eye' }, pigment: { v: 'dull', source: 'eye' },
        eye: { v: 'good', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['busy', 'want-whiten'],
      note: '整体状态在最好的一次。问能不能顺带处理一下肤色不均。',
      concern: '想处理肤色不均',
      device: { hydration: 54, oil: 36, pigment: 26 },
    },

    // ---- 周琳：新客敏感 ----
    {
      id: 'a_zhou_1', customerId: 'c_zhou', storeId: 'st_sy', ownerId: 'u_zhao', at: '2026-10-20T16:30:00',
      dims: {
        skinType: { v: 'sensitive', source: 'eye' }, barrier: { v: 'sting', source: 'self' },
        hydration: { v: 'slight-low', source: 'device' }, pigment: { v: 'dull', source: 'eye' },
        pores: { v: 'fine', source: 'eye' },
      },
      signals: ['season', 'fear-redness', 'irritated', 'compare-clinic'],
      note: '第一次做皮肤管理，网上查了很多资料。说换季脸会烫，用新东西先小面积试。',
      concern: '怕做完脸红，想先了解清楚',
      device: { hydration: 47, oil: 45, pigment: 33 },
    },

    // ---- 吴倩：沉睡 55 天 ----
    {
      id: 'a_wu_1', customerId: 'c_wu', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-08-28T19:00:00',
      dims: {
        skinType: { v: 'mixed', source: 'eye' }, pores: { v: 'nose-pore', source: 'eye' },
        acne: { v: 'closed', source: 'eye' }, oil: { v: 't-zone', source: 'eye' },
        hydration: { v: 'slight-low', source: 'device' },
      },
      signals: ['busy', 'budget-cut'],
      note: '做完清洁说最近工作调动，可能要搬到浑南，之后不太方便过来。',
      concern: '担心距离太远',
      device: { hydration: 46, oil: 61, pigment: 28 },
    },

    // ---- 徐婷：眼周 ----
    {
      id: 'a_xu_1', customerId: 'c_xu', storeId: 'st_sy', ownerId: 'u_zhao', at: '2026-09-18T20:00:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, hydration: { v: 'low', source: 'device' },
        eye: { v: 'dark', source: 'eye' }, wrinkle: { v: 'dynamic', source: 'eye' },
        barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['stay-up', 'busy'],
      note: '长期加班到凌晨，眼下有青黑，眼尾干纹上妆会卡。',
      concern: '想改善黑眼圈，别显得那么累',
      device: { hydration: 43, oil: 40, pigment: 32 },
    },

    // ---- 何珊：预算敏感新客 ----
    {
      id: 'a_he_1', customerId: 'c_he', storeId: 'st_sy', ownerId: 'u_zhao', at: '2026-10-12T15:00:00',
      dims: {
        skinType: { v: 'oily', source: 'eye' }, oil: { v: 'high', source: 'eye' },
        acne: { v: 'closed', source: 'eye' }, pores: { v: 'nose-pore', source: 'eye' },
        pigment: { v: 'acne-mark', source: 'eye' },
      },
      signals: ['price-sensitive', 'budget-cut', 'quick-result'],
      note: '刚工作，预算 300 以内。希望闭口快点消，痘印淡一点。',
      concern: '预算有限，想知道便宜的做法',
      device: { hydration: 50, oil: 74, pigment: 40 },
    },

    // ---- 马晓：高客单，色斑+轮廓 ----
    {
      id: 'a_ma_1', customerId: 'c_ma', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-07-10T10:00:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, pigment: { v: 'sun', source: 'device' },
        wrinkle: { v: 'sagging', source: 'eye' }, hydration: { v: 'low', source: 'device' },
        eye: { v: 'fine-line', source: 'eye' }, barrier: { v: 'thin', source: 'eye' },
      },
      signals: ['want-whiten', 'want-lift'],
      note: '两边脸颊有十几年累积的晒斑，轮廓也在往下走。愿意按年做规划。',
      concern: '想整体看起来精神一些',
      device: { hydration: 44, oil: 35, pigment: 63 },
    },
    {
      id: 'a_ma_2', customerId: 'c_ma', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-15T10:20:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, pigment: { v: 'sun', source: 'device' },
        wrinkle: { v: 'static', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        eye: { v: 'fine-line', source: 'eye' }, barrier: { v: 'normal', source: 'eye' },
      },
      signals: ['want-lift'],
      note: '屏障稳了，色斑边界变淡。轮廓比三个月前好一点。',
      concern: '想继续做紧致',
      device: { hydration: 48, oil: 34, pigment: 59 },
    },

    // ---- 中街店 ----
    {
      id: 'a_tan_1', customerId: 'c_tan', storeId: 'st_zh', ownerId: 'u_qian', at: '2026-09-30T13:00:00',
      dims: {
        skinType: { v: 'mixed', source: 'eye' }, hydration: { v: 'slight-low', source: 'device' },
        pores: { v: 'nose-pore', source: 'eye' }, pigment: { v: 'dull', source: 'eye' },
      },
      signals: ['busy', 'makeup-cake'],
      note: '通勤族，中午补妆会斑驳。想找省时间的做法。',
      concern: '想上妆服帖一点',
      device: { hydration: 45, oil: 58, pigment: 30 },
    },
    {
      id: 'a_guo_1', customerId: 'c_guo', storeId: 'st_zh', ownerId: 'u_qian', at: '2026-10-06T11:00:00',
      dims: {
        skinType: { v: 'dry', source: 'eye' }, barrier: { v: 'redness', source: 'eye' },
        hydration: { v: 'low', source: 'device' }, eye: { v: 'puff', source: 'eye' },
      },
      signals: ['season', 'fear-redness'],
      note: '换季脸红，喜欢舒缓类项目，不喜欢太强的刺激。',
      concern: '想让脸别总红',
      device: { hydration: 42, oil: 37, pigment: 25 },
    },
  ];

  /** 品项库：kind service 院内 / home 居家；tier entry 入门 / course 进阶 / long 长期 */
  const items = [
    // 入门层
    { id: 'it_s1', kind: 'service', name: '舒缓修护单次', category: 'soothe', needs: ['barrier', 'soothe'], tier: 'entry', price: 298, sessions: 1, duration: 60, desc: '温和清洁 + 舒缓导入 + 屏障膜，全程不刷酸不磨砂', caution: '活动期炎症区域避开' },
    { id: 'it_s2', kind: 'service', name: '分层补水导入', category: 'hydration', needs: ['hydration'], tier: 'entry', price: 398, sessions: 1, duration: 60, desc: '负压导入小分子保湿剂，做完即可上妆', caution: '角质偏薄者降低负压强度' },
    { id: 'it_s3', kind: 'service', name: '深层清洁与黑头管理', category: 'clean', needs: ['clean', 'pore', 'oil'], tier: 'entry', price: 268, sessions: 1, duration: 50, desc: '软化角质 + 局部清理 + 收敛，重点在 T 区', caution: '两颊偏干区不做清理' },
    { id: 'it_s4', kind: 'service', name: '眼周舒缓护理', category: 'eye', needs: ['eye'], tier: 'entry', price: 198, sessions: 1, duration: 35, desc: '眼周点按 + 冷敷，改善浮肿与疲劳感', caution: '眼部有炎症时暂缓' },
    { id: 'it_s5', kind: 'service', name: '痘肌净化单次', category: 'acne', needs: ['acne', 'soothe'], tier: 'entry', price: 328, sessions: 1, duration: 55, desc: '消炎镇静 + 局部处理，不做大面积挤压', caution: '活动期痘痘只做镇静，不挤压' },
    { id: 'it_s6', kind: 'service', name: '温和提亮单次', category: 'pigment', needs: ['pigment'], tier: 'entry', price: 368, sessions: 1, duration: 60, desc: '低浓度传明酸导入，重点在颧骨与肤色不均区域', caution: '黄褐斑倾向不做，屏障未稳不做' },

    // 进阶层
    { id: 'it_c1', kind: 'service', name: '屏障修护疗程', category: 'barrier', needs: ['barrier', 'soothe'], tier: 'course', price: 2680, sessions: 6, cycleDays: 28, duration: 60, desc: '6 次一疗程，前 3 次密集修护，后 3 次隔周维持', caution: '期间暂停一切高浓度活性成分' },
    { id: 'it_c2', kind: 'service', name: '分层补水疗程', category: 'hydration', needs: ['hydration'], tier: 'course', price: 2280, sessions: 6, cycleDays: 28, duration: 60, desc: '按 28 天代谢周期排布，逐次加深导入层次', caution: '' },
    { id: 'it_c3', kind: 'service', name: '温和提亮疗程', category: 'pigment', needs: ['pigment'], tier: 'course', price: 3480, sessions: 6, cycleDays: 42, duration: 70, desc: '低浓度传明酸 + 烟酰胺复配，配合防晒管理', caution: '必须先完成屏障修护，屏障未稳不做' },
    { id: 'it_c4', kind: 'service', name: '痘肌净化疗程', category: 'acne', needs: ['acne', 'soothe', 'oil'], tier: 'course', price: 3980, sessions: 8, cycleDays: 42, duration: 55, desc: '消炎期 → 疏通期 → 稳定期三段式，含居家指导', caution: '不替代皮肤科治疗，中重度痤疮建议就医' },
    { id: 'it_c5', kind: 'service', name: '射频紧致疗程', category: 'lift', needs: ['wrinkle', 'pore'], tier: 'course', price: 6800, sessions: 5, cycleDays: 35, duration: 80, desc: '单极射频，重点在下颌线与法令纹区域', caution: '体内有金属植入物、孕期不做' },
    { id: 'it_c6', kind: 'service', name: '眼周焕活疗程', category: 'eye', needs: ['eye'], tier: 'course', price: 2980, sessions: 6, cycleDays: 28, duration: 40, desc: '射频微电流 + 眼周点按，针对浮肿与细纹', caution: '眼周有伤口时暂缓' },
    { id: 'it_c7', kind: 'service', name: '分区控油管理', category: 'clean', needs: ['oil', 'pore', 'clean'], tier: 'course', price: 2480, sessions: 6, cycleDays: 28, duration: 55, desc: 'T 区控油、两颊补水，分区操作', caution: '不要全脸统一控油' },
    { id: 'it_c8', kind: 'service', name: '痘坑纹理改善疗程', category: 'acne', needs: ['acne', 'wrinkle'], tier: 'course', price: 5600, sessions: 4, cycleDays: 45, duration: 70, desc: '微针 + 修复，针对凹陷型痘坑', caution: '需先控制住活动期炎症' },

    // 长期管理（节奏型，不按次售卖）
    { id: 'it_l1', kind: 'service', name: '年度养护计划（基础档）', category: 'barrier', needs: ['barrier', 'hydration', 'eye'], tier: 'long', price: 12800, sessions: 12, cycleDays: 365, duration: 60, desc: '每季度一次复测 + 项目轮换，含居家产品年度配给', caution: '按季度复盘调整，不做固定打包' },
    { id: 'it_l2', kind: 'service', name: '年度养护计划（进阶档）', category: 'lift', needs: ['wrinkle', 'pigment', 'eye'], tier: 'long', price: 26800, sessions: 18, cycleDays: 365, duration: 80, desc: '紧致与色素交替推进，含季度复测与优先排期', caution: '需要客户能配合到店频次' },

    // 居家层
    { id: 'it_h1', kind: 'home', name: '神经酰胺修护精华', category: 'barrier', needs: ['barrier'], tier: 'home', price: 480, desc: '神经酰胺 + 胆固醇 + 脂肪酸 3:1:1 配比，修护期早晚各一次', caution: '' },
    { id: 'it_h2', kind: 'home', name: '舒缓修护面霜', category: 'barrier', needs: ['barrier', 'soothe'], tier: 'home', price: 520, desc: '含积雪草与泛醇，泛红期替代其他面霜单独使用', caution: '' },
    { id: 'it_h3', kind: 'home', name: '氨基酸温和洁面', category: 'clean', needs: ['clean'], tier: 'home', price: 180, desc: '弱酸性表活，屏障不稳定期间早晚各一次即可', caution: '不要配合洁面仪' },
    { id: 'it_h4', kind: 'home', name: '低浓度传明酸精华', category: 'pigment', needs: ['pigment'], tier: 'home', price: 680, desc: '3% 传明酸，局部点涂色斑区域，建立耐受后每晚使用', caution: '屏障未稳时不用，需配合防晒' },
    { id: 'it_h5', kind: 'home', name: '物理防晒乳 SPF50', category: 'pigment', needs: ['pigment'], tier: 'home', price: 268, desc: '纯物理防晒，色素管理期间的必需项，室内靠窗也要涂', caution: '' },
    { id: 'it_h6', kind: 'home', name: '眼周修护精华', category: 'eye', needs: ['eye'], tier: 'home', price: 398, desc: '咖啡因 + 肽类，晨间按压眼周，配合冷敷效果更好', caution: '' },
    { id: 'it_h7', kind: 'home', name: '水杨酸局部精华', category: 'acne', needs: ['acne', 'pore'], tier: 'home', price: 220, desc: '1% 水杨酸，仅点涂闭口与鼻翼，不做全脸', caution: '泛红期停用' },
    { id: 'it_h8', kind: 'home', name: '控油平衡乳', category: 'clean', needs: ['oil'], tier: 'home', price: 320, desc: '清爽型保湿，T 区薄涂，替代厚重面霜', caution: '' },
    { id: 'it_h9', kind: 'home', name: '小分子保湿水', category: 'hydration', needs: ['hydration'], tier: 'home', price: 260, desc: '洁面后第一步，湿敷 3 分钟提升即时含水量', caution: '' },
  ];

  const todos = [
    { id: 't_1', customerId: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', type: 'action', content: '复测含水量，若继续上升则引入紧致疗程', dueAt: '2026-10-26', status: 'open', createdAt: '2026-09-28T11:00:00' },
    { id: 't_2', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', type: 'risk', content: '客户在对比别家刷酸套餐，下次沟通需讲清过度刷酸对屏障的影响', dueAt: '2026-10-24', status: 'open', createdAt: '2026-10-15T18:40:00' },
    { id: 't_3', customerId: 'c_li', storeId: 'st_sy', ownerId: 'u_lin', type: 'action', content: '7 天后企微跟进屏障感受，14 天复测含水量', dueAt: '2026-10-25', status: 'open', createdAt: '2026-10-18T15:00:00' },
    { id: 't_4', customerId: 'c_wu', storeId: 'st_sy', ownerId: 'u_lin', type: 'action', content: '以复测为由唤醒，距上次到店已 55 天', dueAt: '2026-10-23', status: 'open', createdAt: '2026-10-20T09:30:00' },
    { id: 't_5', customerId: 'c_liu', storeId: 'st_sy', ownerId: 'u_zhao', type: 'need', content: '客户希望开始提亮，需先确认屏障是否连续稳定', dueAt: '2026-10-30', status: 'open', createdAt: '2026-10-08T12:00:00' },
    { id: 't_6', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', type: 'need', content: '询问肤色不均处理方案，可在下次复测时给出提亮与紧致的排布顺序', dueAt: '2026-11-02', status: 'open', createdAt: '2026-10-02T15:00:00' },
    { id: 't_7', customerId: 'c_zhou', storeId: 'st_sy', ownerId: 'u_zhao', type: 'risk', content: '新客谨慎型，首次不做强刺激项目，先给单次舒缓体验', dueAt: '2026-10-28', status: 'open', createdAt: '2026-10-20T17:10:00' },
    { id: 't_8', customerId: 'c_he', storeId: 'st_sy', ownerId: 'u_zhao', type: 'risk', content: '预算 300 以内，避免推进阶疗程，先做单次清洁', dueAt: '2026-10-26', status: 'open', createdAt: '2026-10-12T15:40:00' },
    { id: 't_9', customerId: 'c_guo', storeId: 'st_zh', ownerId: 'u_qian', type: 'action', content: '换季结束后复测泛红面积', dueAt: '2026-11-05', status: 'open', createdAt: '2026-10-06T11:40:00' },
    { id: 't_10', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', type: 'action', content: '发送居家清单：水杨酸仅点涂，泛红期停用', dueAt: '2026-10-20', status: 'done', createdAt: '2026-10-15T18:45:00' },
  ];

  const follows = [
    { id: 'f_0', customerId: 'c_li', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-15T20:10:00', channel: '企微', content: '初诊后发了居家清单（温和洁面 + 修护精华 + 防晒），客户回复说先照着用两周，美白精华已经停了。', result: '正向' },
    { id: 'f_1', customerId: 'c_zhang', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-30T10:00:00', channel: '企微', content: '复测后跟进，客户反馈脸颊不再起皮，已按建议换成修护面霜。', result: '正向' },
    { id: 'f_2', customerId: 'c_chen', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-10-16T20:00:00', channel: '企微', content: '发了刷酸风险说明和居家清单，客户回复说再看看。', result: '待定' },
    { id: 'f_3', customerId: 'c_sun', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-10-08T09:30:00', channel: '电话', content: '确认下季度排期，客户希望安排在周三下午。', result: '正向' },
    { id: 'f_4', customerId: 'c_wu', storeId: 'st_sy', ownerId: 'u_lin', at: '2026-09-05T16:00:00', channel: '企微', content: '问候搬迁情况，客户说还在适应新通勤，暂未约时间。', result: '未响应' },
  ];

  const scripts = [
    {
      id: 'sc_1', customerId: 'c_zhang', assessmentId: 'a_zhang_3', scene: 'report-read', level: 'regular', at: '2026-09-28T11:20:00',
      layers: {
        observe: '这次含水量是 52，比七月的 36 高了不少；两颊摸上去不起了，法令纹现在只有笑的时候明显。',
        explain: '前两次修护把留水的能力补回来了，皮肤不再一直往外漏水，所以同样的护肤品现在能留住。',
        advise: '接下来可以开始处理纹路，但不用一次上很重的项目：先做两次射频看反应，同时把修护继续隔周维持着。',
      },
      issues: [],
    },
  ];

  return {
    schemaVersion: SCHEMA_VERSION,
    seededAt: new Date().toISOString(),
    currentUserId: 'u_lin',
    stores, users, customers, assessments, items, todos, follows, scripts,
    settings: { engine: 'rule', showSources: true },
  };
}

/* ------------------------------------------------------------------ 状态 */

let state = null;

export function initState() {
  const loaded = load();
  if (loaded) {
    state = loaded;
  } else {
    state = seed();
    persist(state);
  }
  return state;
}

export function getState() {
  if (!state) initState();
  return state;
}

export function save() {
  persist(getState());
}

/* ------------------------------------------------------------------ 当前身份 */

export function currentUser() {
  const s = getState();
  return s.users.find((u) => u.id === s.currentUserId) || s.users[0];
}

export function setCurrentUser(id) {
  const s = getState();
  if (s.users.some((u) => u.id === id)) {
    s.currentUserId = id;
    save();
    return true;
  }
  return false;
}

/** 数据可见范围：所有读取都经过这里，UI 层不再各自判断角色 */
export function scope() {
  const s = getState();
  const me = currentUser();
  if (me.role === 'hq') {
    return { me, stores: s.stores, storeIds: s.stores.map((x) => x.id), allStores: true, maskNames: true };
  }
  if (me.role === 'manager') {
    return { me, stores: s.stores.filter((x) => x.id === me.storeId), storeIds: [me.storeId], allStores: false, maskNames: false };
  }
  return { me, stores: s.stores.filter((x) => x.id === me.storeId), storeIds: [me.storeId], allStores: false, maskNames: false };
}

export function canSeeCustomer(c) {
  const { me } = scope();
  if (me.role === 'hq') return true;
  if (me.role === 'manager') return c.storeId === me.storeId;
  return c.storeId === me.storeId && c.ownerId === me.id;
}

export function canEditCustomer(c) {
  const { me } = scope();
  if (me.role === 'hq') return false;
  if (me.role === 'manager') return c.storeId === me.storeId;
  return c.storeId === me.storeId && c.ownerId === me.id;
}

export function customers() {
  return getState().customers.filter(canSeeCustomer);
}

export function customerById(id) {
  const c = getState().customers.find((x) => x.id === id);
  return c && canSeeCustomer(c) ? c : null;
}

export function displayName(c) {
  const { maskNames } = scope();
  if (!c) return '客户';
  if (!maskNames) return c.name;
  // 总部视角脱敏：保留姓氏
  return `${c.name.slice(0, 1)}**`;
}

export function assessmentsOf(customerId) {
  return getState()
    .assessments.filter((a) => a.customerId === customerId)
    .sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function latestAssessment(customerId) {
  return assessmentsOf(customerId)[0] || null;
}

export function todosOf(customerId) {
  return getState().todos.filter((t) => t.customerId === customerId);
}

export function openTodos(customerId) {
  return todosOf(customerId).filter((t) => t.status === 'open');
}

export function followsOf(customerId) {
  return getState().follows.filter((f) => f.customerId === customerId).sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function scriptsOf(customerId) {
  return getState().scripts.filter((s) => s.customerId === customerId).sort((a, b) => new Date(b.at) - new Date(a.at));
}

export function scopedTodos() {
  const s = getState();
  const { me } = scope();
  const visible = new Set(customers().map((c) => c.id));
  return s.todos
    .filter((t) => visible.has(t.customerId))
    .filter((t) => (me.role === 'consultant' ? t.ownerId === me.id : true));
}

export function storeName(id) {
  const s = getState();
  const st = s.stores.find((x) => x.id === id);
  return st ? st.name : '—';
}

export function userById(id) {
  return getState().users.find((u) => u.id === id) || null;
}

/* ------------------------------------------------------------------ 写入 */

export function addAssessment(input) {
  const s = getState();
  const me = currentUser();
  const c = customerById(input.customerId);
  if (!c) return { ok: false, message: '客户不存在或无权限' };

  const rec = {
    id: uid('a'),
    customerId: input.customerId,
    storeId: c.storeId,
    ownerId: c.ownerId,
    at: input.at || new Date().toISOString(),
    dims: input.dims || {},
    signals: input.signals || [],
    note: (input.note || '').trim(),
    concern: (input.concern || '').trim(),
    device: input.device || null,
    createdBy: me.id,
  };
  s.assessments.push(rec);
  save();
  return { ok: true, record: rec };
}

export function addCustomer(input) {
  const s = getState();
  const me = currentUser();
  if (me.role === 'hq') return { ok: false, message: '总部账号无客户录入权限' };
  const storeId = me.role === 'manager' ? me.storeId : me.storeId;
  const c = {
    id: uid('c'),
    storeId,
    ownerId: me.role === 'manager' ? input.ownerId || me.id : me.id,
    name: (input.name || '').trim(),
    gender: input.gender || '女',
    age: Number(input.age) || null,
    phone: (input.phone || '').trim(),
    source: (input.source || '到店').trim(),
    level: input.level || 'new',
    joinedAt: input.joinedAt || new Date().toISOString().slice(0, 10),
    note: (input.note || '').trim(),
  };
  if (!c.name) return { ok: false, message: '请填写客户姓名' };
  s.customers.push(c);
  save();
  return { ok: true, record: c };
}

export function updateCustomer(id, patch) {
  const s = getState();
  const c = s.customers.find((x) => x.id === id);
  if (!c || !canEditCustomer(c)) return { ok: false, message: '无权限修改该客户' };
  Object.assign(c, patch);
  save();
  return { ok: true, record: c };
}

export function addTodo(input) {
  const s = getState();
  const c = customerById(input.customerId);
  if (!c) return { ok: false, message: '客户不存在或无权限' };
  const t = {
    id: uid('t'),
    customerId: input.customerId,
    storeId: c.storeId,
    ownerId: c.ownerId,
    type: input.type || 'action',
    content: (input.content || '').trim(),
    dueAt: input.dueAt || new Date().toISOString().slice(0, 10),
    status: 'open',
    createdAt: new Date().toISOString(),
    origin: input.origin || 'manual',
  };
  if (!t.content) return { ok: false, message: '待办内容不能为空' };
  s.todos.push(t);
  save();
  return { ok: true, record: t };
}

export function toggleTodo(id) {
  const s = getState();
  const t = s.todos.find((x) => x.id === id);
  if (!t) return { ok: false };
  t.status = t.status === 'open' ? 'done' : 'open';
  if (t.status === 'done') t.doneAt = new Date().toISOString();
  save();
  return { ok: true, record: t };
}

export function addFollow(input) {
  const s = getState();
  const c = customerById(input.customerId);
  if (!c) return { ok: false, message: '客户不存在或无权限' };
  const f = {
    id: uid('f'),
    customerId: input.customerId,
    storeId: c.storeId,
    ownerId: c.ownerId,
    at: new Date().toISOString(),
    channel: input.channel || '企微',
    content: (input.content || '').trim(),
    result: input.result || '待定',
  };
  if (!f.content) return { ok: false, message: '请填写跟进内容' };
  s.follows.push(f);
  save();
  return { ok: true, record: f };
}

export function addScript(input) {
  const s = getState();
  const rec = {
    id: uid('sc'),
    customerId: input.customerId,
    assessmentId: input.assessmentId || null,
    scene: input.scene,
    level: input.level,
    at: new Date().toISOString(),
    layers: input.layers,
    issues: input.issues || [],
    engine: input.engine || 'rule',
  };
  s.scripts.push(rec);
  save();
  return { ok: true, record: rec };
}

export function addItem(input) {
  const s = getState();
  const it = { id: uid('it'), kind: input.kind || 'service', ...input };
  if (!it.name) return { ok: false, message: '请填写名称' };
  s.items.push(it);
  save();
  return { ok: true, record: it };
}

export function activeItems() {
  return getState().items;
}

/* ------------------------------------------------------------------ 辅助 */

export function daysSince(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export function fmtDate(iso, withTime = false) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n) => String(n).padStart(2, '0');
  const base = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return withTime ? `${base} ${p(d.getHours())}:${p(d.getMinutes())}` : base;
}

/** 客户分层：由到店频次与消费推断，不手填 */
export function inferLevel(c) {
  const list = assessmentsOf(c.id);
  const last = list[0];
  const gap = last ? daysSince(last.at) : null;
  if (c.level === 'vip') return { key: 'vip', ...CUSTOMER_LEVELS.vip };
  if (gap !== null && gap > 45 && list.length > 0) return { key: 'dormant', ...CUSTOMER_LEVELS.dormant };
  if (list.length >= 2) return { key: 'regular', ...CUSTOMER_LEVELS.regular };
  return { key: 'new', ...CUSTOMER_LEVELS.new };
}

/** 首次录入前的空档案检测：没有面诊记录就不许生成话术 */
export function hasAssessment(customerId) {
  return assessmentsOf(customerId).length > 0;
}

export { DIMENSIONS, SIGNAL_MAP };
