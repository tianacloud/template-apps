/**
 * taxonomy.js — 面部分析维度、话术词典与合规规则
 *
 * 设计原则：
 * 1. 每个维度取值都带「观察句 / 成因句 / 标签 / 需求域 / 严重度」，话术与方案都由它派生，
 *    避免同一条面诊数据在不同模块里被解释成两套结论。
 * 2. 观察句一律用客户听得懂的口语，不出现「屏障受损」「色素沉着」这类需要翻译的词。
 *    专业术语只存在于内部字段（tags / needs），不进入对外话术。
 * 3. 观察来源分三档：device 仪器 / eye 顾问目测 / self 客户自述。同一维度只允许一个来源，
 *    由录入时显式选择，避免把主观判断当成检测数据。
 */

export const SOURCE_META = {
  device: { label: '仪器数据', cls: 'device', short: '仪器' },
  eye: { label: '顾问目测', cls: 'eye', short: '目测' },
  self: { label: '客户自述', cls: 'self', short: '自述' },
};

/** 需求域：方案匹配的最小单位，品项库按这个字段挂接 */
export const NEED_META = {
  barrier: { label: '屏障修护', order: 1 },
  hydration: { label: '补水锁水', order: 2 },
  soothe: { label: '舒缓镇静', order: 3 },
  oil: { label: '分区控油', order: 4 },
  pore: { label: '毛孔纹理', order: 5 },
  clean: { label: '清洁管理', order: 6 },
  pigment: { label: '色素管理', order: 7 },
  acne: { label: '痘肌管理', order: 8 },
  wrinkle: { label: '紧致抗衰', order: 9 },
  eye: { label: '眼周护理', order: 10 },
};

/**
 * 面部分析九个维度。
 * v: 内部值；label: 录入界面选项；observe: 观察层句子；cause: 解释层句子；
 * tags: 写入画像的标签；needs: 需求域；sev: 0-3 严重度（0 表示正常）
 */
export const DIMENSIONS = [
  {
    key: 'skinType',
    label: '肤质类型',
    values: [
      { v: 'dry', label: '干性', observe: '整体偏干，脸颊摸上去有点涩', cause: '皮肤自身的锁水能力偏弱，水分留不住', tags: ['干性肌'], needs: ['hydration', 'barrier'], sev: 1 },
      { v: 'oily', label: '油性', observe: '整体出油偏多，中午就开始泛光', cause: '皮脂腺比较活跃，出油量大', tags: ['油性肌'], needs: ['oil', 'clean'], sev: 1 },
      { v: 'mixed', label: '混合', observe: '两颊偏干，T 区出油比较明显', cause: '两颊和 T 区的皮脂分布不一样，一边缺水一边出油', tags: ['混合肌'], needs: ['hydration', 'oil'], sev: 1 },
      { v: 'mixed-dry', label: '混合偏干', observe: '两颊偏干，T 区有一点出油，上妆时鼻翼容易卡粉', cause: '两颊的锁水能力偏弱，T 区的皮脂腺又比别处活跃，同一张脸上其实是两种状态', tags: ['混合偏干'], needs: ['hydration', 'oil', 'barrier'], sev: 2 },
      { v: 'sensitive', label: '敏感', observe: '脸颊容易泛红，遇热或者换季时更明显', cause: '皮肤对外界刺激的反应比一般人敏感一些', tags: ['敏感肌'], needs: ['barrier', 'soothe'], sev: 2 },
      { v: 'neutral', label: '中性', observe: '整体状态比较均衡，没有明显偏干或偏油', cause: '水油比较平衡，维持现状就好', tags: ['中性肌'], needs: ['hydration'], sev: 0 },
    ],
  },
  {
    key: 'barrier',
    label: '屏障状态',
    values: [
      { v: 'normal', label: '稳定', observe: '没有明显泛红，日常护肤品用着也不刺痛', cause: '皮肤自身的防护是稳的', tags: [], needs: [], sev: 0 },
      { v: 'redness', label: '泛红', observe: '两颊有一片泛红，洗完脸之后更清楚', cause: '皮肤表面的防护变薄了，遇到水温变化就容易发红', tags: ['屏障偏弱'], needs: ['barrier'], sev: 2 },
      { v: 'sting', label: '刺痛', observe: '用护肤品的时候偶尔会有刺痛感', cause: '防护层有小的缺口，成分一进去就有感觉', tags: ['屏障敏感倾向'], needs: ['barrier'], sev: 3 },
      { v: 'thin', label: '偏薄', observe: '皮肤看起来偏薄，能看到一点红血丝', cause: '角质层比一般人薄，能挡的东西少一些', tags: ['角质偏薄'], needs: ['barrier'], sev: 2 },
      { v: 'thick', label: '偏厚粗糙', observe: '摸上去有点粗糙，护肤品不太吸收', cause: '老废角质堆得比较多，挡住了后续吸收', tags: ['角质偏厚'], needs: ['clean'], sev: 1 },
    ],
  },
  {
    key: 'hydration',
    label: '含水量',
    values: [
      { v: 'good', label: '正常', observe: '含水量在正常区间，摸着有弹性', cause: '水分保持得不错', tags: [], needs: [], sev: 0 },
      { v: 'slight-low', label: '略低', observe: '含水量比正常值低一点，下午会觉得紧', cause: '水分流失比补充快一些', tags: ['缺水'], needs: ['hydration'], sev: 1 },
      { v: 'low', label: '偏低', observe: '两颊含水量偏低，下午会觉得发紧、上妆卡粉', cause: '锁水能力下降了，水分留不住', tags: ['缺水偏干'], needs: ['hydration'], sev: 2 },
      { v: 'very-low', label: '明显偏低', observe: '含水量明显低于正常值，笑起来有细小的干纹', cause: '不只是缺水，留住水的能力也弱了', tags: ['重度缺水'], needs: ['hydration'], sev: 3 },
    ],
  },
  {
    key: 'oil',
    label: '油脂分泌',
    values: [
      { v: 'normal', label: '正常', observe: '出油量正常，没有明显泛光', cause: '皮脂分泌在平衡区间', tags: [], needs: [], sev: 0 },
      { v: 't-zone', label: 'T 区偏多', observe: 'T 区出油明显，鼻翼两侧到下午会亮', cause: 'T 区皮脂腺更活跃，出油集中在中间', tags: ['T 区出油'], needs: ['oil'], sev: 1 },
      { v: 'high', label: '整体偏多', observe: '整体出油偏多，妆面撑不到下午', cause: '皮脂分泌偏旺盛，油脂把妆带掉了', tags: ['油光明显'], needs: ['oil'], sev: 2 },
      { v: 'low', label: '偏少', observe: '出油很少，皮肤有点绷', cause: '油脂分泌不足，少了一层天然的滋润', tags: ['油脂不足'], needs: ['hydration'], sev: 1 },
    ],
  },
  {
    key: 'pores',
    label: '毛孔与纹理',
    values: [
      { v: 'fine', label: '细腻', observe: '毛孔比较细，纹理平整', cause: '角质代谢顺畅，毛孔没有被撑开', tags: [], needs: [], sev: 0 },
      { v: 'nose-pore', label: '鼻翼明显', observe: '鼻翼两侧毛孔比较明显，有一点黑头', cause: '油脂堆积在毛孔口，把它撑大了', tags: ['鼻翼毛孔'], needs: ['pore'], sev: 1 },
      { v: 'cheek-pore', label: '两颊松弛型', observe: '两颊的毛孔偏大，形状有点往下走', cause: '皮肤支撑力下降，毛孔失去了托举', tags: ['松弛型毛孔'], needs: ['pore'], sev: 2 },
      { v: 'rough', label: '粗糙', observe: '整体纹理偏粗糙，摸着不够滑', cause: '老废角质堆积，表面不平整', tags: ['纹理粗糙'], needs: ['pore'], sev: 1 },
    ],
  },
  {
    key: 'pigment',
    label: '色斑与色素',
    values: [
      { v: 'none', label: '无明显', observe: '肤色比较均匀，没有明显色斑', cause: '色素代谢状态正常', tags: [], needs: [], sev: 0 },
      { v: 'sun', label: '浅层晒斑', observe: '颧骨位置有浅层的晒斑，颜色不深但能看出来', cause: '紫外线累积留下的印记，位置比较浅', tags: ['浅层色素'], needs: ['pigment'], sev: 1 },
      { v: 'melasma', label: '黄褐斑倾向', observe: '两颊有成片的淡褐色，边界不太清楚', cause: '跟内分泌、日晒都有关，颜色容易反复', tags: ['黄褐斑倾向'], needs: ['pigment'], sev: 3, caution: '成片且边界模糊的色素不建议直接上高强度项目，先稳住屏障' },
      { v: 'acne-mark', label: '痘印', observe: '下巴和脸颊留了几个偏红的痘印', cause: '痘消退之后留下的颜色，会慢慢代谢', tags: ['痘印'], needs: ['pigment'], sev: 1 },
      { v: 'dull', label: '暗沉', observe: '整张脸偏暗，缺一点透亮感', cause: '角质堆积加上循环偏慢，光线反射不出来', tags: ['暗沉'], needs: ['pigment'], sev: 1 },
    ],
  },
  {
    key: 'acne',
    label: '痤疮与痘坑',
    values: [
      { v: 'none', label: '无', observe: '没有明显的痘和闭口', cause: '毛囊口通畅', tags: [], needs: [], sev: 0 },
      { v: 'closed', label: '闭口粉刺', observe: '下巴和额头有一些闭口，摸上去有颗粒感', cause: '油脂排不出去，堵在毛囊口', tags: ['闭口'], needs: ['acne'], sev: 1 },
      { v: 'active', label: '活动期痘痘', observe: '下巴有几颗正在发红的痘，按压会痛', cause: '毛囊里有炎症反应，正在活跃期', tags: ['活动期痘'], needs: ['acne'], sev: 3, caution: '活动期炎症区域不做强刺激项目，先消炎镇静' },
      { v: 'scar', label: '痘坑', observe: '两颊有几个凹陷的痘坑，光线下比较明显', cause: '之前的炎症伤到了真皮层，靠护肤很难填平', tags: ['痘坑'], needs: ['acne'], sev: 2 },
    ],
  },
  {
    key: 'wrinkle',
    label: '皱纹与紧致度',
    values: [
      { v: 'none', label: '紧致', observe: '轮廓比较紧，没有明显纹路', cause: '支撑结构还稳', tags: [], needs: [], sev: 0 },
      { v: 'dynamic', label: '动态纹', observe: '笑起来眼角和额头有明显纹路，不笑的时候看不出', cause: '主要是表情肌反复收缩留下的，现在还在早期', tags: ['动态纹'], needs: ['wrinkle'], sev: 1 },
      { v: 'static', label: '静态纹', observe: '不笑的时候法令纹也能看到一条浅沟', cause: '除了表情，皮肤自身的支撑也在变弱', tags: ['静态纹'], needs: ['wrinkle'], sev: 2 },
      { v: 'sagging', label: '松弛下垂', observe: '下颌线没有以前清楚，脸颊有点往下走', cause: '深层的支撑结构松了，轮廓托不住，脸型就往下走', tags: ['轮廓松弛'], needs: ['wrinkle'], sev: 3 },
    ],
  },
  {
    key: 'eye',
    label: '眼周状态',
    values: [
      { v: 'good', label: '良好', observe: '眼周没有明显问题', cause: '眼周循环和状态都正常', tags: [], needs: [], sev: 0 },
      { v: 'dark', label: '黑眼圈', observe: '眼下有一圈偏青的暗色', cause: '眼周循环偏慢，加上作息影响', tags: ['黑眼圈'], needs: ['eye'], sev: 1 },
      { v: 'puff', label: '浮肿', observe: '早上起来眼泡比较明显', cause: '眼周的水分代谢偏慢', tags: ['眼周浮肿'], needs: ['eye'], sev: 1 },
      { v: 'fine-line', label: '细纹', observe: '眼尾有细小的干纹，上妆后会卡', cause: '眼周皮肤薄，缺水时纹路就显出来', tags: ['眼周细纹'], needs: ['eye'], sev: 2 },
    ],
  },
];

export const DIM_MAP = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d]));

export function findDimValue(dimKey, value) {
  const dim = DIM_MAP[dimKey];
  if (!dim) return null;
  return dim.values.find((x) => x.v === value) || null;
}

/** 沟通信号：顾问在对话里捕捉到的原话线索 */
export const SIGNALS = [
  { v: 'stay-up', label: '最近熬夜多', tags: ['熬夜型暗沉'], needs: ['pigment'], note: '把作息作为解释层的一部分，不指责客户' },
  { v: 'season', label: '换季不适', tags: ['换季敏感'], needs: ['soothe', 'barrier'], note: '换季是天然的解释理由，降低被推销感' },
  { v: 'makeup-cake', label: '上妆卡粉', tags: ['妆面不服帖'], needs: ['hydration'], note: '客户自己能感知，最容易共情的切入点' },
  { v: 'irritated', label: '之前用产品觉得刺激', tags: ['产品耐受差'], needs: ['barrier'], note: '说明客户有过负面体验，方案必须先降刺激' },
  { v: 'want-lift', label: '想改善法令纹', tags: ['抗衰诉求'], needs: ['wrinkle'], note: '明确诉求，可直接对应进阶层' },
  { v: 'want-whiten', label: '想提亮肤色', tags: ['提亮诉求'], needs: ['pigment'], note: '提亮必须排在屏障之后，否则容易反黑' },
  { v: 'fear-redness', label: '担心做完泛红', tags: ['效果顾虑'], needs: [], note: '这是顾虑不是诉求，先给可控性再谈项目' },
  { v: 'price-sensitive', label: '对价格比较敏感', tags: ['价格敏感'], needs: [], note: '价值拆解优先，禁止用降价开场' },
  { v: 'compare-clinic', label: '提到别家机构在对比', tags: ['对比中'], needs: [], note: '不贬低同行，只讲自己的判断依据' },
  { v: 'quick-result', label: '希望快点见效', tags: ['求快'], needs: [], note: '用皮肤代谢周期把预期拉回现实，不承诺速度' },
  { v: 'busy', label: '时间少、怕麻烦', tags: ['低执行意愿'], needs: [], note: '方案要给最短路径，居家步骤压到三步内' },
  { v: 'budget-cut', label: '说最近预算紧', tags: ['预算收紧'], needs: [], note: '改为降低单次门槛，而不是打折' },
];

export const SIGNAL_MAP = Object.fromEntries(SIGNALS.map((s) => [s.v, s]));

/** 客户分层 */
export const CUSTOMER_LEVELS = {
  new: { label: '新客', desc: '首次到店或仅体验过单次项目', strategy: '降低决策压力，先让客户感受到变化，不推进阶' },
  regular: { label: '老客', desc: '有过 2 次以上到店，已有固定项目', strategy: '围绕效果延续与节奏管理，切入点放在复测与维护' },
  dormant: { label: '沉睡唤醒', desc: '超过 45 天未到店', strategy: '以复测和数据变化为由触达，不直接推新项目' },
  vip: { label: '高客单', desc: '年消费进入门店前 20%', strategy: '给长期管理节奏与优先权益，不堆项目数量' },
};

/** 话术场景 */
export const SCENES = {
  'first-visit': {
    label: '首次面诊',
    goal: '建立专业信任，拿到完整信息',
    opening: '先别急着定项目，我想先把您现在的状态看清楚，再给建议。',
    closure: '今天先不着急定，您回去感受两天，我们下次复测再看变化。',
    taboo: '不要在首次见面就报价卡项',
  },
  'report-read': {
    label: '检测后解读',
    goal: '把仪器数值翻译成客户能感知的事',
    opening: '我把仪器上的数字，换成您平时能感觉到的说法。',
    closure: '这几个数值不用都记住，记住一件事就够了：现在最该先解决哪一个。',
    taboo: '不要逐个念数值，客户记不住也不会因此更信任',
  },
  'in-service': {
    label: '护理中',
    goal: '同步手法感受，为下一次做铺垫',
    opening: '现在这个力度可以吗？有刺痛您随时说。',
    closure: '今天做完先别急着照镜子，明早起来再看，变化会更清楚。',
    taboo: '客户躺着的时候不提价格、不推卡',
  },
  'follow-up': {
    label: '护理后跟进',
    goal: '确认反应，把效果固定成记忆',
    opening: '昨天做完到今天，脸上有没有哪里不舒服？',
    closure: '这次的反应在正常范围内，说明方向是对的，我们按这个节奏走。',
    taboo: '不要用「效果好吧」这类逼客户认同的问法',
  },
  'price-objection': {
    label: '客户嫌贵',
    goal: '把价格拆成周期与步骤，不做降价',
    opening: '您觉得贵是正常的，我先把这个钱花在哪说清楚，您再判断值不值。',
    closure: '如果现在预算不方便，我们可以把节奏拉开，但步骤不能省。',
    taboo: '禁止直接给折扣、赠品、限时逼单',
  },
  refusal: {
    label: '客户拒绝',
    goal: '保住关系，留下次入口',
    opening: '没关系，这个决定本来也不该今天做。',
    closure: '那我们先按您能接受的来，其他的等您想清楚了再说。',
    taboo: '不要追问原因、不要反复劝说',
  },
};

export const SCENE_KEYS = Object.keys(SCENES);

/**
 * 禁用语与改写词表。
 * block: 命中即判定违规，需重新生成或人工改写
 * soften: 常见贬损/夸张表达 → 中性表达的直接替换
 */
export const BLOCK_RULES = [
  { id: 'fear', label: '恐吓表述', level: 'block', words: ['毁了', '烂脸', '不可逆', '再不治', '会越来越糟', '老化加速', '救不回来', '没救了', '恶化'] },
  { id: 'promise', label: '绝对化承诺', level: 'block', words: ['保证', '一定能', '永久', '根治', '彻底解决', '一次见效', '立竿见影', '包好', '百分百', '100%'] },
  { id: 'medical', label: '医学诊断', level: 'block', words: ['确诊', '你这是病', '皮肤病', '需要吃药', '药物治疗', '炎症期必须用药'] },
  { id: 'rival', label: '贬低同行', level: 'block', words: ['别家都不行', '那些机构', '不正规的地方', '便宜的都没用', '外面做的都是坑'] },
  { id: 'pressure', label: '逼单施压', level: 'warn', words: ['今天最后一天', '名额只剩', '过时不候', '不办就涨价', '马上要涨'] },
];

/** 直接替换：从左列说法换成右列说法，替换后不触发违规 */
export const SOFTEN_MAP = [
  { from: /皮肤很差|皮肤不好|肤质差/g, to: '现在偏干' },
  { from: /油得像油田|大油田|油得不行/g, to: 'T 区出油明显，需要分区护理' },
  { from: /老化得很厉害|老得很快/g, to: '紧致度比之前下降了一些' },
  { from: /斑很严重|一脸斑/g, to: '颧骨位置有一些浅层色素' },
  { from: /皱纹很深/g, to: '法令纹比去年清楚了一点' },
  { from: /毛孔粗大得吓人|毛孔能插针/g, to: '鼻翼两侧毛孔比较明显' },
  { from: /必须马上做/g, to: '建议这一个月内安排上' },
  { from: /不做会更糟/g, to: '拖下去改善的周期会拉长' },
];

/** 违规词扫描：返回命中项，供二次校验层使用 */
export function scanText(text) {
  const hits = [];
  for (const rule of BLOCK_RULES) {
    for (const w of rule.words) {
      if (text.includes(w)) hits.push({ ruleId: rule.id, label: rule.label, level: rule.level, word: w });
    }
  }
  return hits;
}

/** 中性化改写：先把高危说法换掉，再交给扫描 */
export function softenText(text) {
  let out = text;
  for (const r of SOFTEN_MAP) out = out.replace(r.from, r.to);
  return out;
}

/** 品项分类 */
export const ITEM_CATEGORIES = {
  barrier: '屏障修护',
  hydration: '补水锁水',
  soothe: '舒缓镇静',
  clean: '清洁管理',
  pigment: '色素管理',
  acne: '痘肌管理',
  lift: '紧致抗衰',
  eye: '眼周护理',
  experience: '体验引流',
};

/** 待办类型 */
export const TODO_TYPES = {
  need: { label: '客户诉求', cls: 'blue' },
  action: { label: '顾问动作', cls: 'accent' },
  risk: { label: '风险信号', cls: 'red' },
};

export const ROLE_META = {
  consultant: { label: '美容顾问', scope: '仅本人在该门店的客户' },
  manager: { label: '店长', scope: '本门店全部客户与经营数据' },
  hq: { label: '总部', scope: '跨门店汇总，客户明细脱敏' },
};
