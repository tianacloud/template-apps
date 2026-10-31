/**
 * core/data.js —— 宫斗模拟器 · 内容层
 * 出身、天赋、阶段、结局走向、终局光景、劝言。
 * 引擎不认识"宫斗"，只认识效果与标记。
 *
 * UMD：小程序走 module.exports，网页走 window.PalaceData
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./events'), require('./events-pool'), require('./events-new'))
  } else {
    root.PalaceData = factory(root.PalaceEvents, root.PalaceEventsPool, root.PalaceEventsNew)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (EVENTS, POOL, NEW) {

EVENTS = [].concat(EVENTS || [], POOL || [], NEW || [])

/* ============================ 位份 ============================ */

const RANKS = [
  '官女子', '答应', '常在', '贵人', '嫔', '妃', '贵妃', '皇贵妃', '皇后'
]

/* ============================ 天赋 ============================ */

const TALENTS = [
  {
    id: 'looks',
    name: '天姿国色',
    desc: '你走进一间屋子，屋里的人会先安静一下，再说话。这份安静，能保你三年，也能害你三年。',
    effects: { cha: 18, favor: 4 }
  },
  {
    id: 'memory',
    name: '过目成诵',
    desc: '看一遍就记住。宫里的人最怕你这一样——你说的话，他们都得想清楚再说。',
    effects: { int: 15, scheme: 4 }
  },
  {
    id: 'iron',
    name: '底子厚',
    desc: '跪两个时辰，别人站不起来，你只是腿麻。这宫里，熬得住本身就是一种本事。',
    effects: { con: 15, health: 8 }
  },
  {
    id: 'family',
    name: '门第清贵',
    desc: '你祖父的名字还挂在国史馆里。这块牌子不能当饭吃，但能挡不少事。',
    effects: { power: 12, fame: 6 },
    flag: 'good_lineage',
    avoid: ['salt', 'maid', 'sinner']
  },
  {
    id: 'subtle',
    name: '生来心细',
    desc: '谁多看了一眼、谁的袖口有药味，你都记得。这不是聪明，是活得小心。',
    effects: { scheme: 16 }
  },
  {
    id: 'calm',
    name: '沉得住气',
    desc: '天塌下来的头一刻，你不出声。宫里最多的死法，是话说得太快。',
    effects: { peace: 12, scheme: 4 },
    flag: 'grit'
  },
  {
    id: 'luck',
    name: '有福之人',
    desc: '你总在错的时候走对门。别人的运气要争，你的运气会自己来。',
    effects: { luk: 18 }
  },
  {
    id: 'voice',
    name: '一副好嗓子',
    desc: '你唱过的曲子，会被人记很多年。嗓子是恩宠的引子，也是非的引子。',
    effects: { cha: 10, favor: 6 }
  },
  {
    id: 'medicine',
    name: '通医理',
    desc: '你认得药，也认得药里不该有的那一味。这本事一直没让你吃亏。',
    effects: { int: 8, health: 6 },
    flag: 'knows_medicine'
  },
  {
    id: 'tongue',
    name: '嘴上不饶人',
    desc: '你从不吃亏，也从不肯把话咽下去。痛快是痛快，账都在后头。',
    effects: { cha: 6, scheme: 6, fame: -6 },
    flag: 'sharp_tongue'
  },
  {
    id: 'warm',
    name: '让人愿意靠近',
    desc: '宫女愿意替你说实话，太监愿意多走一趟。这宫里，愿意这两个字比银子贵。',
    effects: { fame: 10, peace: 8 },
    flag: 'warm'
  },
  {
    id: 'ordinary',
    name: '没什么特别的',
    desc: '你有的都是平常的东西：一张看得过去的脸，一个还行的脑子。剩下全靠自己。',
    effects: { peace: 4 }
  }
]

/* ============================ 出身 ============================ */

const ORIGINS = [
  {
    id: 'noble',
    tag: '贵女',
    weight: 14,
    rankStart: 2,
    money: [900, 1600],
    bias: { int: 4, scheme: 4, power: 8 },
    desc: '你是顾家的女儿，祖父配享太庙，父亲在礼部行走。选秀那日你站在第三排，掌事太监先看了你一眼。进宫对你不是出路，是另一条早就铺好的路——只是这条路要你自己走完。',
    note: '你起点比旁人高两阶。宫里的规矩是：站得高的，摔下来时看的人最多。'
  },
  {
    id: 'officer',
    tag: '清流之女',
    weight: 28,
    rankStart: 1,
    money: [260, 620],
    bias: { int: 6, fame: 6 },
    desc: '父亲是翰林院编修，七品，清贵而不显赫。你从小背诗、学字、学规矩，母亲说这些都是为你好。进宫那天父亲只送你一句话：「别出头。」',
    note: '不高不低，没人捧你，也没人盯着你。这种位置最适合看清局势。'
  },
  {
    id: 'salt',
    tag: '商贾之女',
    weight: 20,
    rankStart: 1,
    money: [3200, 6800],
    bias: { cha: 6, scheme: 4, fame: -8 },
    desc: '你家在扬州有六条盐船，账房比衙门还齐整。银子买得到进宫的名额，买不到别人眼里的体面。头一天就有人在你背后说：「商女。」',
    note: '你带着一箱银子进宫。银子能买通很多人，买不通看不起你的人。'
  },
  {
    id: 'general',
    tag: '将门之女',
    weight: 14,
    rankStart: 1,
    money: [500, 1100],
    bias: { con: 8, power: 10, int: -3 },
    desc: '父亲镇守北境十七年，家里说话都带刀气。你从小骑马，不会绣花。宫里的女人不骑马，可她们也怕骑马的人。',
    note: '你背后有兵，朝中没有朋友。太硬的东西，在宫里容易折。'
  },
  {
    id: 'sinner',
    tag: '罪臣之后',
    weight: 12,
    rankStart: 0,
    money: [60, 180],
    bias: { scheme: 10, peace: -8, fame: -14 },
    desc: '父亲下狱那年你十四岁，家产抄没，女眷没入掖庭。你在浣衣局洗了两年衣裳，手指泡得发白。这一次能进内廷，是因为有人需要一个「罪臣之女」站在明处。',
    note: '你从最低处开始。宫里没人替你说话，这既是坏事，也让你不必替谁背锅。'
  },
  {
    id: 'maid',
    tag: '包衣宫女',
    weight: 12,
    rankStart: 0,
    money: [30, 90],
    bias: { scheme: 8, health: 5, fame: -4 },
    desc: '你在宫里长大，八岁进来做粗使，十二岁调到茶房。你知道哪条夹道能避人，哪个太监收了谁的钱。别的秀女还在认路，你已经知道路通向谁。',
    note: '你起点最低，但最熟悉这里。规矩是活人定的，活人总有软处。'
  }
]

/* ============================ 阶段 ============================ */

const STAGES = {
  1: { name: '入宫', tip: '宫门在你身后合上。从这一刻起，你的一举一动都有人记着。' },
  2: { name: '初入宫闱', tip: '你还在学规矩。真正的规矩是：谁都可以踩你一脚，只要你还没被人看见。' },
  3: { name: '风起', tip: '有人开始把你当回事了。这不是好事，也不是坏事——是有人开始算你了。' },
  4: { name: '暗流', tip: '明面上的话都不作数，真正的事在水底下走。' },
  5: { name: '争锋', tip: '到了这个位置，退一步不是海阔天空，是给别人腾地方。' },
  6: { name: '高处', tip: '你站在了能被所有人看见的地方。风也最大。' },
  7: { name: '夕照', tip: '宫里换了一批人。你成了那个"从前"的人。' },
  8: { name: '落幕', tip: '' }
}

/* ============================ 判断 ============================ */

const hasPrincess = s => s.flags.includes('has_princess')
const hasPrince = s => s.flags.includes('has_prince')
const hasChild = s => s.flags.some(f =>
  f === 'has_prince' || f === 'has_princess' || f === 'child_taken' || f === 'two_children')
const isCold = s => s.flags.includes('cold_palace')

/* ============================ 结局走向 ============================ */
/*
 * match(s, sc) => bool
 * sc = { rank, rankScore, favor, peace, health, total, year }
 * pri  = 稀有度 1-10，权重取 pri^3
 * family/avoid 用来避免与终局光景撞主题
 */

const ENDINGS = [
  /* ========== 一、凤位（1-9）========== */
  {
    id: 'empress_alone', pri: 10, title: '凤印在手', family: 'throne',
    match: (s, sc) => sc.rank >= 8 && sc.peace < 52,
    desc: '册封那日你从东阶上去，走了三十六级。底下跪着的人里，有一半曾经在你茶里下过东西。你坐下了，没有回头看。凤印压在案上，沉得像一块石头——它不暖手，但能压住很多东西。'
  },
  {
    id: 'empress_whole', pri: 9, title: '中宫，也是一个人', family: 'throne',
    match: (s, sc) => sc.rank >= 8 && !hasChild(s),
    desc: '你是皇后，六宫之主，天下女子的表率。夜里坤宁宫只点两盏灯，你一个人吃完晚膳，一个人抄完经。皇帝待你极敬重，敬重到像待一块牌位。你把「皇后」这两个字做得很好，好到没有人想起你叫什么。'
  },
  {
    id: 'empress_son', pri: 9, title: '皇后，与她的儿子', family: 'throne',
    match: (s, sc) => sc.rank >= 8 && hasPrince(s),
    desc: '你抱着儿子坐上中宫的位子。他三岁封了太子，你替他挡了十几年明枪暗箭。后来他长得比你高了，你还是习惯把他往身后拉——你这才发现，自己已经拉了半辈子。'
  },
  {
    id: 'empress_short', pri: 9, title: '只做了三年皇后', family: 'throne',
    match: (s, sc) => sc.rank >= 8 && sc.health < 42,
    desc: '你终于等到那顶凤冠，戴上才发现它比想象中重。三年里你病了两场，第二场没起来。太医说是积劳，你自己知道，是这十几年把身体当柴烧，烧到了底。'
  },
  {
    id: 'empress_regent', pri: 8, title: '摄六宫事', family: 'throne',
    match: (s, sc) => sc.rank >= 7 && sc.rank < 8 && s.flags.includes('steward'),
    desc: '你没有皇后的名分，却拿着皇后的对牌。六宫的账、人、赏罚都从你手里过。有人背后叫你「副后」，你听见了也不恼——名分是给活人看的，实权才是给活人用的。'
  },
  {
    id: 'dowager', pri: 10, title: '寿康宫的太后', family: 'throne',
    match: (s, sc) => s.flags.includes('son_emperor'),
    desc: '你的儿子登基那年，你从西六宫搬到寿康宫。宫墙还是那道墙，只是现在所有人都要绕着你走。你终于不用再看任何人的脸色——可你已经看了三十年，改不过来了。见了谁都先在心里算一遍。'
  },
  {
    id: 'dowager_puppet', pri: 9, title: '太后，但说了不算', family: 'throne',
    match: (s, sc) => s.flags.includes('son_emperor') && sc.rankScore < 62,
    desc: '你是皇帝的生母，天下最尊贵的寡妇。可前朝有辅臣，后宫有皇后，你的话出不了寿康宫的门。你儿子来请安时很恭敬，恭敬得像在见一个远房长辈。'
  },
  {
    id: 'posthumous_empress', pri: 9, title: '死后追封', family: 'throne',
    match: (s, sc) => s.flags.includes('emperor_regret') && sc.health < 30,
    desc: '你走的那年，皇帝在你宫里坐了一夜。第二年春天，他下旨追封你为皇后。旨意念给牌位听，所有人都跪着，只有你已经不用跪了。这道恩典来得太迟，迟得像一句迟到的道歉。'
  },
  {
    id: 'deposed', pri: 10, title: '废后', family: 'throne',
    match: (s, sc) => s.flags.includes('deposed'),
    desc: '旨意很短：皇后失德，收册宝，退居别宫。你摘凤冠的时候手很稳，稳得连自己都意外。搬去的那间屋子朝北，冬天有风。你在那里活了很久，久到宫里换了两个皇帝，还有人记得曾经有过一位皇后。'
  },

  /* ========== 二、妃位（10-17）========== */
  {
    id: 'fei_steady', pri: 9, title: '一宫之主，安稳到老', family: 'rank',
    match: (s, sc) => sc.rank >= 5 && sc.rank < 8 && sc.peace >= 55,
    desc: '你有一宫的人，一宫的账，一宫的花木。皇帝来不来，你都按时熄灯。宫里的人说你是有福气的，你想了想，好像是的——你争过，但没把自己争没了。这在宫里，算是极大的福气。'
  },
  {
    id: 'fei_lonely', pri: 9, title: '宠妃的黄昏', family: 'rank',
    match: (s, sc) => sc.rank >= 5 && sc.favor < 38,
    desc: '你曾经一夜间得了三抬赏赐，如今一盏茶放到凉也没人来收。位份还在，旨意不来了。你学会了在窗边坐一整个下午，听外面新来的小主笑。那笑声你认得，你也有过。'
  },
  {
    id: 'fei_nochild', pri: 8, title: '有宠，无子', family: 'child',
    match: (s, sc) => sc.rank >= 5 && !hasChild(s),
    desc: '你得过最好的宠爱，唯独没有孩子。宫里人说这是命，太医说这是身子。你到后来也不太想了，只是每逢年节，看见别的妃嫔手里牵着人，你会不自觉地把手拢进袖子里。'
  },
  {
    id: 'fei_mother', pri: 9, title: '母凭子贵', family: 'child',
    match: (s, sc) => hasPrince(s) && sc.rank >= 4 && sc.rank < 8,
    desc: '你这一生最要紧的事，是在某个冬天生下了他。此后所有的算计都有了一个正当理由：为了孩子。你不见得喜欢这个理由，但它让你在这个宫里站得住，站得直。'
  },
  {
    id: 'fei_sharp', pri: 8, title: '锋芒', family: 'rank',
    match: (s, sc) => sc.rank >= 5 && sc.favor >= 48 && sc.peace < 45,
    desc: '你从来没学过藏。喜欢就笑，不喜欢就冷着脸。皇帝说你真，别人说你狂。真和狂在宫里是同一种东西，区别只在于你还能站多久。你站到了妃位，也站到了所有人的对面。'
  },
  {
    id: 'guifei_fall', pri: 10, title: '贵妃位上的最后一年', family: 'rank',
    match: (s, sc) => s.flags.includes('fallen_from_high') && sc.rank >= 4,
    desc: '从贵妃到贵人，只隔一道旨意。搬宫那天下着小雨，你的东西装了四车，走的时候没人送。你在新住处打开第一只箱子，里面是当年册封时的礼服，还压着香。'
  },
  {
    id: 'three_fei', pri: 7, title: '三妃之一', family: 'rank',
    match: (s, sc) => sc.rank === 5 && sc.favor < 44 && sc.rankScore < 70,
    desc: '你是三妃之一，排在末位。宫宴上你的位置不远不近，正好能看清所有人的脸，也不至于被人看清。你在这个位置上坐了很多年，没出过事，也没留下什么。'
  },
  {
    id: 'imperial_concubine', pri: 8, title: '皇贵妃', family: 'rank',
    match: (s, sc) => sc.rank === 7 && !s.flags.includes('steward'),
    desc: '皇贵妃，位同副后。你比皇后低半阶，比所有人高一头。这半阶你走了二十年，走到后来自己也说不清，究竟是想上去，还是只是不甘心停在这里。'
  },

  /* ========== 三、中位（18-24）========== */
  {
    id: 'pin_quiet', pri: 9, title: '嫔位，不响', family: 'rank',
    match: (s, sc) => sc.rank === 4,
    desc: '嫔，一宫之主，却不掌事。你的日子过得很轻：早上请安，午后抄经，晚上等一盏不一定来的灯。宫里争得最凶的那些年，你在自己的院子里种了一架葡萄。后来葡萄结果了，没人来摘。'
  },
  {
    id: 'guiren_life', pri: 9, title: '贵人的一生', family: 'rank',
    match: (s, sc) => sc.rank === 3,
    desc: '贵人，不高不低。你被人叫了很多年「小主」，叫到最后自己都应得不那么顺口了。你没做过什么大恶，也没积下什么大德。宫里像你这样的人最多，多到史书上连一页都占不到。'
  },
  {
    id: 'pin_child', pri: 9, title: '有个孩子，够了', family: 'child',
    match: (s, sc) => hasChild(s) && sc.rank >= 3 && sc.rank <= 4 && sc.peace >= 50,
    desc: '你没坐上高位，可你有个孩子。他会在你抄经的时候趴在桌边问字，会在你咳嗽时端一杯温水来。你把这一生所有的算计都用在了他身上，也用完了所有的温柔。'
  },
  {
    id: 'stuck', pri: 8, title: '卡在贵人', family: 'rank',
    match: (s, sc) => sc.rank === 3 && sc.favor < 32,
    desc: '贵人的位子你坐了十一年。每年大封六宫，名单上都没有你。你从等旨意，到不等，到听见旨意也懒得抬眼。宫里管这叫「熬」，熬到最后连自己都忘了在熬什么。'
  },
  {
    id: 'promote_late', pri: 8, title: '二十年才等到的嫔位', family: 'rank',
    match: (s, sc) => sc.rank === 4 && sc.year >= 20,
    desc: '晋嫔的旨意下来时你正在缝一件旧衣。来传旨的小太监念完，你愣了很久才想起来谢恩。这个位份你等了二十年，等到它的分量已经不如当年想象的重，可你还是把它端端正正地接了。'
  },
  {
    id: 'pin_no_favor', pri: 7, title: '有位置，没恩宠', family: 'rank',
    match: (s, sc) => sc.rank >= 4 && sc.rank <= 5 && sc.favor < 30,
    desc: '你的牌子早就撤了，位份却还在。逢年过节你照样穿戴整齐去请安，站在该站的位置上。没人赶你走，也没人记得你还在。你对这种处境已经没有怨气了——怨气也需要力气。'
  },
  {
    id: 'late_favor', pri: 7, title: '晚年又被想起', family: 'emperor',
    match: (s, sc) => s.flags.includes('emperor_returned') && sc.rank >= 4,
    desc: '他六十岁那年忽然常来你这里，不做什么，只是坐着说些旧事。他说这些年累了，说宫里的人越来越不会说话。你听着，偶尔应一声。你早就不等了，可他来了，你还是把茶换成了他从前爱喝的那种。'
  },

  /* ========== 四、低位（25-32）========== */
  {
    id: 'changzai', pri: 9, title: '宫墙里的一粒灰', family: 'low',
    match: (s, sc) => sc.rank === 2,
    desc: '常在。你在宫里住了半辈子，认识的人不多，走过的路就那么几条。你也有过一个晚上，被灯笼照到门前——那盏灯后来再也没有停过。你把这当成了一生的高点，也就不算太苦。'
  },
  {
    id: 'never_called', pri: 10, title: '一辈子没被翻过牌', family: 'low',
    match: (s, sc) => sc.rank <= 1 && sc.favor < 18,
    desc: '你的绿头牌挂在敬事房的架子上，挂了三十年，落了灰也没人取。你从十几岁等到三十几岁，后来就不等了。你学会了给自己找事做：养花、抄经、给家里写信，写完烧掉。'
  },
  {
    id: 'guannvzi', pri: 10, title: '官女子', family: 'low',
    match: (s, sc) => sc.rank === 0,
    desc: '官女子，连「小主」都算不上。你住在最偏的那排屋子，冬天炭不够，夏天潮气重。宫里的人从你门前过，很少往里看。你活下来了，这件事本身，在那样的地方已经不容易。'
  },
  {
    id: 'maid_sweep', pri: 9, title: '洒扫十年', family: 'low',
    match: (s, sc) => s.flags.includes('maid_start') && sc.rank <= 2,
    desc: '你从茶房出来，进了内廷，最后又回到最边上的院子。十年里你扫过的地，能绕着宫墙走三圈。你认得每一块砖的裂口，却认不全宫里主子的脸。'
  },
  {
    id: 'low_but_free', pri: 9, title: '活着出了宫门', family: 'leave',
    match: (s, sc) => s.flags.includes('left_palace') && sc.peace >= 50,
    desc: '你走的那天是个晴天。宫门开了一条缝，你侧身出去，回头看了一眼那道红墙——它比记忆里矮。外面有驴车、有卖炊饼的、有小孩在跑。你站在街上，忽然不知道该往哪儿走，然后就笑了。'
  },
  {
    id: 'forgotten', pri: 8, title: '名字被人忘了', family: 'low',
    match: (s, sc) => sc.rank <= 2 && sc.fame < 26,
    desc: '你死后，内务府的册子上写着「某氏，某年入宫，某年病故」。没有封号，没有谥号，没有子嗣。每年清明有人统一烧纸，纸钱上不写名字。'
  },
  {
    id: 'served_long', pri: 7, title: '熬成了老人', family: 'low',
    match: (s, sc) => sc.year >= 24 && sc.rank <= 3,
    desc: '你在宫里活成了「老人」。新来的宫女叫你姑姑，小主们请安时也会对你点一下头。你没有位份，可是你知道的事比谁都多。这宫里有时候，知道比拥有更管用。'
  },

  /* ========== 五、覆灭（33-44）========== */
  {
    id: 'cold_palace', pri: 10, title: '冷宫', family: 'ruin',
    match: (s, sc) => s.flags.includes('cold_palace') && sc.health >= 30,
    desc: '冷宫不是一间屋子，是一整个院子。墙很高，门从外面锁。你刚进去那几个月还数日子，后来不数了。有人每天送饭，饭是温的——这大概是宫里对你最后的体面。'
  },
  {
    id: 'cold_death', pri: 10, title: '冷宫的第七年', family: 'ruin',
    match: (s, sc) => s.flags.includes('cold_palace') && sc.health < 30,
    desc: '第七年冬天特别冷。你咳了半个月，没人请太医。最后那晚你把母亲留的镯子摘下来，放在枕边，想着也许有人会替你还给她。第二天送饭的人推门，站了一会儿，又退出去禀报。'
  },
  {
    id: 'white_silk', pri: 10, title: '一丈白绫', family: 'ruin',
    match: (s, sc) => s.flags.includes('condemned'),
    desc: '旨意里写「赐自尽」。来的人把白绫放在桌上，退到门外等。你摸了摸那匹料子，是很细的绢。你想起入宫第一年，也是这样的绢，你用它缝过一只香囊。'
  },
  {
    id: 'poison_cup', pri: 10, title: '鸩酒', family: 'ruin',
    match: (s, sc) => s.flags.includes('poisoned_by_emperor'),
    desc: '酒是温的，杯子是鎏金的。送酒的人不敢看你。你端起来闻了闻，有一点杏仁味。你想说点什么，最后只是笑了笑，一口喝尽——这宫里连死，都要体面。'
  },
  {
    id: 'beaten', pri: 10, title: '杖毙', family: 'ruin',
    match: (s, sc) => s.flags.includes('beaten') && sc.health < 34,
    desc: '板子落在身上的时候，你听见有人在数。数到二十三你就听不清了。你最后看见的是院子里的槐树，和一角很蓝的天。你想起自己进宫那天，也是这样的天。'
  },
  {
    id: 'xinzheku', pri: 10, title: '辛者库', family: 'ruin',
    match: (s, sc) => s.flags.includes('sent_to_xinzheku'),
    desc: '辛者库在宫城最北边，做的是最脏的活。你从主子的位置掉到这里，只用了一天。头一个月你洗不干净手上的味，后来就闻不出来了。偶尔有从前认识的人路过，你们都不看对方。'
  },
  {
    id: 'family_purge', pri: 9, title: '满门', family: 'ruin',
    match: (s, sc) => s.flags.includes('family_purge'),
    desc: '父亲问斩那日，你在宫里跪着求见，跪到腿没了知觉，也没见到人。后来的消息是别人告诉你的：抄家、流放、男丁一个没留。你在这宫里活着，可你的来处，已经被抹掉了。'
  },
  {
    id: 'framed_death', pri: 9, title: '死于一场构陷', family: 'ruin',
    match: (s, sc) => s.flags.includes('framed') && sc.health < 45,
    desc: '那盒麝香不是你的。你说了一百遍，没人信。审你的人是皇后身边的人，问话只有三句，来回问。你后来明白了：他们要的不是真相，是一个能写进旨意的说法。'
  },
  {
    id: 'madness', pri: 9, title: '疯了', family: 'ruin',
    match: (s, sc) => sc.peace < 16,
    desc: '到了后来，你分不清哪些事是真的发生过。你会在半夜叫一个人的名字，会把宫女认成从前的姐姐。太医说是心疾。宫里人不太提你，只说西边那间屋子不太平。'
  },
  {
    id: 'suicide', pri: 9, title: '自己了断', family: 'ruin',
    match: (s, sc) => s.flags.includes('suicide'),
    desc: '你选了一个没人当值的午后，把门从里面闩上。桌上留了一封信，写了三行就写不下去。你想说的其实只有一句：这一回，是我自己定的。'
  },
  {
    id: 'childbirth_death', pri: 9, title: '难产', family: 'ruin',
    match: (s, sc) => s.flags.includes('died_in_childbirth'),
    desc: '稳婆的手一直在抖，血一盆一盆地端出去。你听见有人在门外念经，也听见婴儿哭了一声。你想抬手，抬不起来。最后你想着：好歹，他活着。'
  },
  {
    id: 'slow_poison', pri: 8, title: '慢药', family: 'ruin',
    match: (s, sc) => s.flags.includes('poisoned_once') && sc.health < 34,
    desc: '你早就觉得不对：茶的味道、指甲的颜色、夜里出的汗。你换过茶具，换过宫女，最后连厨房都换了。可那味东西还是每天进你的身子，一天一点。你死的时候很瘦，瘦得像另一个人。'
  },
  {
    id: 'fade_away', pri: 8, title: '无声无息地没了', family: 'ruin',
    match: (s, sc) => sc.health < 26,
    desc: '没有旨意，没有审问，也没有人下毒。你只是病了很久，久到所有人都习惯了你的病。某个清晨宫女来添炭，发现你已经凉了。内务府记了一笔，当天下午就有人来收屋子。'
  },

  /* ========== 六、出宫与别处（45-52）========== */
  {
    id: 'leave_palace', pri: 10, title: '出宫', family: 'leave',
    match: (s, sc) => s.flags.includes('left_palace') && sc.peace >= 58,
    desc: '你用了很多年，才换来一道「准其出宫」的恩旨。走出神武门的时候，你身上只有一只包袱。街上的人走得很快，说话很大声，没人给你让路——你忽然觉得，这样真好。'
  },
  {
    id: 'married_out', pri: 9, title: '嫁给了江南的商人', family: 'leave',
    match: (s, sc) => s.flags.includes('married_out'),
    desc: '他比你大十岁，丧过妻，做丝绸生意。成亲那晚他问你宫里的事，你说都忘了。他也不再问。后来你们有了两个孩子，你在院子里种了石榴，再没做过关于红墙的梦。'
  },
  {
    id: 'escaped', pri: 8, title: '翻过那道墙', family: 'leave',
    match: (s, sc) => s.flags.includes('escaped'),
    desc: '你从一个废弃的角门出去，走的是运炭的路。有人在宫外接应你，马车走了三天三夜。此后你换了名字，在一个没有人认识你的县城住下。你活到了很老，从没跟任何人说起过自己从前是谁。'
  },
  {
    id: 'nun', pri: 9, title: '庵堂二十年', family: 'leave',
    match: (s, sc) => s.flags.includes('nun'),
    desc: '你先帝的妃嫔，无子，按例可以出宫修行。庵里的日子很清：早课、种菜、抄经。你抄了二十年，抄到手腕有了旧伤。有一年春天山花开得很好，你站在院子里，忽然想起了宫里那株海棠。'
  },
  {
    id: 'sent_home', pri: 9, title: '被送回娘家', family: 'leave',
    match: (s, sc) => s.flags.includes('sent_home'),
    desc: '「遣还本家」四个字，比任何刑罚都难听。你回了家，家里给你收拾出一间屋子，嫂子的脸色一年比一年淡。你不再是宫里的人，也不再是家里的人。你在两个地方中间，活完了后半生。'
  },
  {
    id: 'went_with_son', pri: 9, title: '随子就藩', family: 'child',
    match: (s, sc) => s.flags.includes('went_with_son'),
    desc: '儿子封了王，封地在南边。你跟着他离开京城，马车出城门时，你掀帘看了一眼宫城的方向。藩地的王府不大，但你终于可以自己决定晚饭吃什么。这件事，你等了半辈子。'
  },
  {
    id: 'exile', pri: 9, title: '流放三千里', family: 'leave',
    match: (s, sc) => s.flags.includes('exiled'),
    desc: '你没有死，比死更难。一路往北，越走越冷，脚上的镣铐磨破了皮。到了地方，你才知道什么叫荒。你在那里活了下来，靠的是宫里学的那套本事：看人、忍、等。'
  },

  /* ========== 七、权谋（53-60）========== */
  {
    id: 'steward', pri: 8, title: '掌宫务二十年', family: 'power',
    match: (s, sc) => s.flags.includes('steward') && sc.rank >= 4,
    desc: '六宫的账本在你手里放了二十年。谁家的月例、哪宫的炭火、哪位小主多要了两匹缎子，都从你笔下过。你不一定最有宠，但所有人都要先来问你一句。这种权力不出声，可它比宠爱长久。'
  },
  {
    id: 'behind', pri: 9, title: '幕后的人', family: 'power',
    match: (s, sc) => sc.scheme >= 78 && sc.rank <= 5,
    desc: '位份不高，可很多事是你定的。谁该在什么时候病、哪句话该传到谁耳朵里、哪位小主该被抬起来，都是你在灯下算出来的。你没有站到台前，也就不必承担台前的风。'
  },
  {
    id: 'blood_hands', pri: 9, title: '手上的人命', family: 'power',
    match: (s, sc) => s.flags.includes('blood_on_hands') && sc.peace < 55,
    desc: '你数过：三个。第一个是失手，第二个是不得不，第三个你已经不记得理由了。你后来常常梦见她们，梦里她们都不说话，只是站着看你。你请了和尚做法事，做完还是梦。'
  },
  {
    id: 'mutual_ruin', pri: 9, title: '两败俱伤', family: 'power',
    match: (s, sc) => s.flags.includes('mutual_destruction') && sc.rank < 5,
    desc: '你和她斗了十几年，最后一起被端上了御案。她降为庶人，你迁去别宫。这场仗没有赢家，只有两个女人和一座空了的宫殿。你在别宫听见她被送走的消息，竟然没有觉得痛快。'
  },
  {
    id: 'win_empty', pri: 9, title: '赢是赢了', family: 'power',
    match: (s, sc) => sc.rank >= 6 && sc.peace < 38,
    desc: '你扳倒了所有人，坐到了想要的位置。册封那晚，你一个人在殿里坐到天亮。你想起十几岁进宫时想的是「活下去」，不知道什么时候变成了「赢」。这两件事原来不是一回事。'
  },
  {
    id: 'info_net', pri: 8, title: '一张网', family: 'power',
    match: (s, sc) => s.flags.includes('power_net') && sc.power >= 60,
    desc: '御膳房、敬事房、内务府、还有几个不起眼的小太监——这张网你织了十几年。它不抓人，只传话。可宫里最贵的东西就是话：谁在什么时候说了什么，值一条命。'
  },
  {
    id: 'cleared', pri: 8, title: '洗清了', family: 'power',
    match: (s, sc) => s.flags.includes('cleared_name') && sc.fame >= 58,
    desc: '那桩旧案翻过来的时候，你已经不年轻了。新帝下旨为你正名，还了你父亲的清白。旨意念完，你跪下谢恩，跪下去那一下，眼泪掉在青砖上。这么多年，你等的其实不是恩典，是一句「不是你」。'
  },
  {
    id: 'queen_maker', pri: 8, title: '扶人上位', family: 'power',
    match: (s, sc) => s.flags.includes('made_queen'),
    desc: '皇后是你扶上去的。她当年只是一个不得宠的嫔，你替她算了三步棋，她走了三步。如今她坐在中宫，待你很客气。你知道她在防你，你也知道这防得对——你们彼此都清楚，这位置是怎么来的。'
  },

  /* ========== 八、心与身（61-68）========== */
  {
    id: 'numb', pri: 9, title: '学会了不痛', family: 'mind',
    match: (s, sc) => sc.peace < 32 && sc.rank >= 3,
    desc: '不知道从哪一年起，你听见坏消息不再心跳了。有人死了，你只问一句「怎么回的话」。这不是冷血，是这宫里活下来的人都会长的一层壳。只是到后来，连好事也敲不进去了。'
  },
  {
    id: 'still_self', pri: 10, title: '还认得出自己', family: 'mind',
    match: (s, sc) => sc.peace >= 68 && sc.rank <= 5,
    desc: '你在宫里待了半辈子，还是会在下雨的时候想起家里的院子，还是会为一只死掉的猫难过。这宫里磨掉了很多人的样子，没磨掉你的。你没赢，可你走的时候，还是当年那个进宫的人。'
  },
  {
    id: 'buddhist', pri: 9, title: '念了二十年佛', family: 'mind',
    match: (s, sc) => s.flags.includes('buddhist'),
    desc: '你在佛前跪了二十年。起初是求，求宠、求子、求平安；后来不求了，只是跪着。香灰积了厚厚一层，你拿它来算日子。有一年你忽然明白，你拜的其实不是佛，是那个还没进宫的自己。'
  },
  {
    id: 'sickbed', pri: 9, title: '病榻上的后半生', family: 'body',
    match: (s, sc) => sc.health < 34 && sc.rank >= 3,
    desc: '你从三十岁起就常年在榻上。太医换过五个，药方换过十几张。宫里的人渐渐不来了，只有贴身宫女每天替你开窗。你听了十几年的风声，听得出哪一天要下雨。'
  },
  {
    id: 'emperor_first', pri: 9, title: '帝王先走了', family: 'emperor',
    match: (s, sc) => s.flags.includes('emperor_dead') && sc.peace >= 45,
    desc: '他走的那天，宫里所有的钟都响了。你跪在人群里，忽然想起他第一次叫你名字的样子。这个人给了你一切，也拿走了一切。你恨过他，也等过他。如今他躺在那里，你才发现自己不知道该怎么称呼他。'
  },
  {
    id: 'emperor_forgot', pri: 9, title: '他后来忘了你', family: 'emperor',
    match: (s, sc) => sc.favor < 22 && sc.rank >= 3,
    desc: '他有三年没来过。你在宫宴上远远看见他，他正侧头听新封的贵人说话，笑得很轻。你端着杯子，忽然想不起来他上一次这样对你笑是哪一年。'
  },
  {
    id: 'emperor_love', pri: 9, title: '他一直待你不同', family: 'emperor',
    match: (s, sc) => sc.favor >= 56 && sc.rank >= 4 && sc.rank < 8,
    desc: '宫里人都知道，皇帝待你不同。不是最盛的那种宠，是很多年都没有断过的那种。他会在批折子累了的时候来你这里坐坐，什么也不说，喝完茶就走。你从不问为什么，因为你也说不清自己图什么。'
  },
  {
    id: 'last_words', pri: 10, title: '一句话没说完', family: 'body',
    match: (s, sc) => sc.health < 18,
    desc: '你想说一句什么，喉咙里只有气声。宫女凑近了听，没听清，还是点头说「奴婢记住了」。你看着她点头，就闭上了眼。这句话到底是什么，从此没有人知道了。'
  },

  /* ========== 九、兜底（69-72）========== */
  {
    id: 'lucky_all', pri: 6, title: '什么都赶上了', family: 'misc',
    match: (s, sc) => sc.total >= 74,
    desc: '你入宫那年正赶上大选，晋位那年正赶上大封，连生病都赶在太医最有空的时候。别人说你命好，你也承认。宫里活得好的人，运气和手腕各占一半，你两样都不缺。'
  },
  {
    id: 'ordinary_end', pri: 5, title: '就这样过完了', family: 'misc',
    match: () => true,
    desc: '没有大起，也没有大落。你在宫里过完了这一生：请安、过节、生病、好了、又病。你死后葬在妃园寝，位置不远不近。碑上刻着你的封号和姓氏，风一吹，字会慢慢平掉。'
  }
]

/* ============================ 终局光景 ============================ */
/*
 * 每 10 条一组：居所 / 身边人 / 手中物 / 心境 / 身后
 * 取 cond 成立里按 pri 加权的一条，同一局稳定
 */

const SCENES = [
  /* ---- 一、居所（1-10）---- */
  { id: 'at_kunning', name: '坤宁宫', pri: 8, cond: (s, sc) => sc.rank >= 8,
    line: '坤宁宫很大，大到说话有回声。你让人把东暖阁的窗都打开，风穿过去，吹动一片帘子。' },
  { id: 'at_side_hall', name: '承乾宫偏殿', pri: 8, cond: (s, sc) => sc.rank >= 4 && sc.rank < 8,
    line: '偏殿三间，一明两暗。你的妆台摆在窗下，铜镜有一道旧痕，照人时会把人分成两半。' },
  { id: 'at_small_yard', name: '西六宫的小院', pri: 8, cond: (s, sc) => sc.rank <= 3 && sc.rank >= 1,
    line: '院子只有一株石榴，年年开花，不结果。你搬了把椅子坐在树下，一坐就是一下午。' },
  { id: 'at_cold_palace', name: '冷宫', pri: 9, cond: s => s.flags.includes('cold_palace'),
    line: '院墙上有前人刻的字，被雨水泡得看不清。你用指甲在旁边添了一笔，算作自己来过。' },
  { id: 'at_shoukang', name: '寿康宫', pri: 9, cond: s => s.flags.includes('son_emperor'),
    line: '寿康宫的地龙烧得很足。你嫌热，让人撤了一半炭，管事太监跪着劝，你摆摆手说不用劝。' },
  { id: 'at_xinzheku', name: '辛者库的院子', pri: 9, cond: s => s.flags.includes('sent_to_xinzheku'),
    line: '院子里晾着一排洗好的布，风一吹全都鼓起来。你的手在冬天裂开，涂了猪油也不管用。' },
  { id: 'at_temple', name: '城外庵堂', pri: 8, cond: s => s.flags.includes('nun'),
    line: '庵后有块菜地，你种的青菜长得比谁都好。师父说你心静，你没说话。' },
  { id: 'at_outside_house', name: '宫外的宅子', pri: 9, cond: s => s.flags.includes('left_palace') || s.flags.includes('escaped') || s.flags.includes('married_out'),
    line: '宅子不大，进门是一口井。你在井边洗菜，邻居隔着墙喊你，你应了一声。' },
  { id: 'at_prince_house', name: '藩地王府', pri: 9, cond: s => s.flags.includes('went_with_son'),
    line: '王府后院有一片空地，你种了宫里带出来的花籽，活了两种，死了一半。' },
  { id: 'at_prison', name: '慎刑司的屋子', pri: 9, cond: s => s.flags.includes('condemned') || s.flags.includes('beaten'),
    line: '屋子没有窗，只有门缝里的一线光。你数着那线光挪动的速度，算一天过去了多少。' },

  /* ---- 二、身边人（11-20）---- */
  { id: 'with_old_maid', name: '跟了三十年的宫女', pri: 8, cond: (s, sc) => s.flags.includes('maid_loyal'),
    line: '锦儿跟了你三十年，如今也老了，梳头的手会抖。你说不用梳了，她还是每天梳。' },
  { id: 'with_new_maid', name: '新来的宫女', pri: 7, cond: (s, sc) => !s.flags.includes('maid_loyal'),
    line: '新来的宫女叫不出你从前的事，做事很小心。你看着她，想起自己刚进宫的样子。' },
  { id: 'with_son', name: '儿子', pri: 9, cond: s => hasPrince(s),
    line: '儿子来请安，进门先看你的脸色。他已经比你高了，说话还是先掂量。' },
  { id: 'with_daughter', name: '女儿', pri: 8, cond: s => hasPrincess(s),
    line: '女儿出嫁后来看过你一次。她穿着诰命服，坐得很端正，走的时候在门口回头叫了一声娘。' },
  { id: 'with_old_rival', name: '当年的对手', pri: 8, cond: (s, sc) => s.flags.includes('mutual_destruction') || s.flags.includes('enemy_old'),
    line: '你们在宫道上遇见，都停了停。她老了很多。你们互相行了个礼，谁也没提从前。' },
  { id: 'with_eunuch', name: '老内侍', pri: 8, cond: s => s.flags.includes('has_eunuch'),
    line: '李德全如今走路要拄杖，还每天来问一句安。他知道你所有的事，包括那些不该知道的。' },
  { id: 'alone', name: '屋里只有你', pri: 8, cond: (s, sc) => !s.flags.includes('maid_loyal') && !hasChild(s),
    line: '屋里只有你。铜壶的水开了又凉，你没有起身去倒。' },
  { id: 'with_children_crowd', name: '一屋子孩子', pri: 8, cond: s => s.flags.includes('two_children'),
    line: '过年时孩子们都来了，屋里挤得转不开身。你嫌吵，他们走了又觉得空。' },
  { id: 'with_cat', name: '一只猫', pri: 6, cond: (s, sc) => sc.peace >= 45,
    line: '不知从哪跑来一只狸花猫，赖在你院里不走。你给它起了个名字，叫「小主」。' },
  { id: 'with_nobody', name: '没人来', pri: 7, cond: (s, sc) => sc.favor < 25,
    line: '从早上等到傍晚，没有人来。你把点心自己吃了，觉得有点甜。' },

  /* ---- 三、手中物（21-30）---- */
  { id: 'hand_seal', name: '凤印', pri: 9, cond: (s, sc) => sc.rank >= 8,
    line: '凤印放在紫檀匣里，你偶尔拿出来看看，不常用。它比想象中凉。' },
  { id: 'hand_ledger', name: '六宫的账册', pri: 8, cond: (s, sc) => s.flags.includes('steward'),
    line: '账册摊在案上，你一行一行看过去。哪个宫的炭多了两筐，你一眼就知道是谁伸手。' },
  { id: 'hand_medicine', name: '药碗', pri: 8, cond: (s, sc) => sc.health < 45,
    line: '药很苦，你一口喝完，把碗倒扣在托盘上。这是你多年不变的习惯，怕人再添一次。' },
  { id: 'hand_silk', name: '一丈白绫', pri: 9, cond: s => s.flags.includes('condemned'),
    line: '白绫放在桌上，你没有立刻动它。你先坐下，喝完了那杯冷茶。' },
  { id: 'hand_letter', name: '一封家书', pri: 8, cond: (s, sc) => s.flags.includes('letter_home'),
    line: '信是半年前的了，你反复看到纸都软了。信里说家里都好，让你不必挂念。' },
  { id: 'hand_beads', name: '一串佛珠', pri: 8, cond: (s, sc) => s.flags.includes('buddhist'),
    line: '佛珠被手磨得发亮。你数到第一百零八颗，正好是一圈，然后重新开始。' },
  { id: 'hand_hairpin', name: '一支旧簪', pri: 8, cond: (s, sc) => sc.rank <= 4,
    line: '簪子是进宫时母亲给的，银的，不值钱。你戴了半辈子，比任何赏赐都久。' },
  { id: 'hand_tablet', name: '一块牌位', pri: 9, cond: s => s.flags.includes('child_dead') || s.flags.includes('emperor_dead'),
    line: '牌位上的字是你亲手写的。你每天擦一遍，擦得比自己的妆台还干净。' },
  { id: 'hand_scissors', name: '一把剪子', pri: 8, cond: (s, sc) => s.flags.includes('blood_on_hands'),
    line: '剪子放在针线篮里，很多年没用过。可你每次找东西，都会先摸到它。' },
  { id: 'hand_nothing', name: '空空的手', pri: 7, cond: (s, sc) => sc.rank <= 2 && sc.favor < 30,
    line: '你摊开手看了看，什么也没有。掌心的纹路很乱，算命的说这样的人一生奔波。' },

  /* ---- 四、心境（31-40）---- */
  { id: 'mind_no_regret', name: '不后悔', pri: 9, cond: (s, sc) => s.flags.includes('no_regret'),
    line: '有人问你这辈子后悔吗。你想了很久，说：不后悔，只是有点累。' },
  { id: 'mind_unwilling', name: '还是不甘', pri: 8, cond: (s, sc) => sc.peace < 40 && sc.rank >= 4,
    line: '你到老都不甘心。不是不甘心输，是不甘心这一生只做了这一件事。' },
  { id: 'mind_accepted', name: '认了', pri: 8, cond: (s, sc) => sc.peace >= 50 && sc.peace < 65,
    line: '你早就认了。认了之后，日子反而好过起来，像一块石头终于落了地。' },
  { id: 'mind_empty', name: '空的', pri: 8, cond: (s, sc) => sc.peace < 35 && !hasChild(s),
    line: '你坐在窗前，脑子里什么也没有。不是难过，是空。空得能听见自己的呼吸。' },
  { id: 'mind_hate', name: '还恨着', pri: 8, cond: (s, sc) => s.flags.includes('framed') || s.flags.includes('family_purge'),
    line: '你恨的那个人已经死了。可你发现自己还是在恨——恨一个死人，原来是这么安静的一件事。' },
  { id: 'mind_forgot', name: '忘了', pri: 7, cond: (s, sc) => sc.peace >= 60,
    line: '很多事你已经记不清了：哪一年晋的位、谁先动的手、那道旨意上写了什么。忘了也好。' },
  { id: 'mind_first_day', name: '想起入宫那天', pri: 9, cond: (s, sc) => sc.year >= 18,
    line: '你忽然想起入宫那天，宫门在身后合上的声音。那时候你以为，最难的是一辈子出不去。' },
  { id: 'mind_counting_tiles', name: '数砖', pri: 8, cond: s => s.flags.includes('cold_palace') || s.flags.includes('sent_to_xinzheku'),
    line: '你数过院子里有多少块砖：二百一十六。数到后来不用数了，闭着眼也知道哪块是缺角的。' },
  { id: 'mind_rain', name: '听雨', pri: 7, cond: (s, sc) => sc.health < 50,
    line: '下雨了。你让人把窗留一条缝，就为了听那个声音。听着听着就睡着了。' },
  { id: 'mind_no_dream', name: '不再做梦', pri: 8, cond: (s, sc) => sc.peace < 45,
    line: '你已经很久不做梦了。年轻时一夜能梦见很多事，如今闭上眼就是黑，睁开眼就是亮。' },

  /* ---- 五、身后（41-50）---- */
  { id: 'after_no_name', name: '没有名字', pri: 8, cond: (s, sc) => sc.rank <= 1,
    line: '你的名字只出现在内务府的册子上，墨迹淡得像没写过。' },
  { id: 'after_posthumous', name: '一个谥号', pri: 8, cond: (s, sc) => sc.rank >= 4,
    line: '礼部拟了两个字做你的谥号，两个字都很体面，也都很陌生。' },
  { id: 'after_history', name: '史书上的一笔', pri: 9, cond: (s, sc) => sc.rank >= 6,
    line: '史书上关于你只有一句：「某氏，某年入宫，某年薨。」写史的人不知道你做过什么。' },
  { id: 'after_legend', name: '民间传说', pri: 8, cond: (s, sc) => sc.fame >= 65,
    line: '宫外渐渐有了关于你的说法，越传越离谱。你听人转述过一回，笑了半天。' },
  { id: 'after_no_grave', name: '无人祭扫', pri: 8, cond: (s, sc) => sc.rank <= 2 && s.flags.includes('cold_palace'),
    line: '你的坟在妃园寝最边上，草长得比别处高。没有人来拔。' },
  { id: 'after_tomb', name: '合葬', pri: 8, cond: (s, sc) => sc.rank >= 5,
    line: '你最终葬进了皇陵，和他隔着一道墙。这道墙，比生前那道矮一些。' },
  { id: 'after_promoted', name: '死后追封', pri: 9, cond: s => s.flags.includes('emperor_regret'),
    line: '追封的旨意送到时，你已经听不见了。宫里人说这是哀荣，哀在前，荣在后。' },
  { id: 'after_novel', name: '话本里的你', pri: 8, cond: (s, sc) => sc.rank >= 3 && sc.fame >= 55,
    line: '多年后宫外有说书人讲你的故事，讲得一半真一半假。假的那些，比你真做过的事精彩。' },
  { id: 'after_forgotten', name: '被忘了', pri: 7, cond: (s, sc) => sc.fame < 40,
    line: '你走后第三年，宫里就很少有人提起你了。这很正常，宫里最不缺的就是新人。' },
  { id: 'after_whisper', name: '宫人的私语', pri: 8, cond: (s, sc) => s.flags.includes('blood_on_hands') || s.flags.includes('mutual_destruction'),
    line: '夜里当值的宫人偶尔会说起你，说西边那间屋子晚上有声音。说完就都不说话了。' }
]

/* ============================ 劝言 ============================ */
/*
 * 结局页最后那三句。不是攻略，是这局走完之后能说的话。
 */

const ADVICE = {
  hide: {
    cond: s => s.flags.includes('sharp_tongue') || s.rank <= 2,
    title: '关于锋芒',
    text: '你不是不会藏，是不愿意。这不丢人 — 但在一个所有人都靠"被看见"活着的地方，藏拙是唯一能自己决定的护身。下一次想开口之前，先问一句：这句话说出去，谁会记得？'
  },
  fight: {
    cond: s => s.scheme >= 65 && s.rank >= 5,
    title: '关于争',
    text: '你争得对，也争得好。只是要给自己留一件与输赢无关的事 — 一盆花、一本书、一门手艺。宫里活得久的，不是最能争的，是争完了还有地方去的。'
  },
  people: {
    cond: s => s.flags.includes('maid_loyal') || s.flags.includes('has_eunuch'),
    title: '关于身边人',
    text: '你身边有肯替你说实话的人，这是宫里最贵的东西。护住他们，比护住位份更值得。位份是别人给的，人是自己攒的。'
  },
  alone: {
    cond: s => !s.flags.includes('maid_loyal') && !s.flags.includes('has_eunuch'),
    title: '关于一个人',
    text: '你谁也没信过。在这地方这不算错，可人不能只靠墙活着。找一个人 — 哪怕只说三分话 — 让她知道你怕什么。有人知道你的软处，你才不至于在夜里自己把自己压垮。'
  },
  child: {
    cond: s => s.flags.includes('has_prince') || s.flags.includes('has_princess') || s.flags.includes('child_taken'),
    title: '关于孩子',
    text: '你为他算了很多年。记着留一点不算计的时间给他 — 不是教他争，是让他知道，在这座宫里，有一个人对他的好是不要回报的。这一点，会在他日后做选择时拉他一把。'
  },
  emperor: {
    cond: s => s.favor >= 60,
    title: '关于他',
    text: '他的宠爱是真的，只是它有自己的季节。别把全部的自己押在一个人的心情上 — 哪怕这个人待你极好。你留一分在别处，将来那分能接住你。'
  },
  heart: {
    cond: s => s.peace < 40,
    title: '关于你自己',
    text: '你把自己用得太平了。位份、孩子、家族、仇人，样样都要你，样样都在前头。你现在还能想起一件纯粹因为喜欢而做的事吗？想不起来不要紧，从明天开始找。'
  },
  leave: {
    cond: s => s.flags.includes('left_palace') || s.flags.includes('escaped') || s.flags.includes('married_out'),
    title: '关于走出去',
    text: '你出来了。往后最难的不是谋生，是不再回头看。那道墙会在很多个夜里出现在梦里 — 允许它出现，但醒来以后，继续过眼前的日子。自由不是一次的决定，是每天重新选的。'
  },
  end: {
    cond: s => s.health < 40,
    title: '关于身体',
    text: '这宫里最不值的，是拿身体换一时的位置。你现在开始歇一歇，很多账还能少记几笔。太医的话要听，药要按时吃 — 这不是示弱，这是把自己当人看。'
  },
  own: {
    cond: () => true,
    title: '关于你自己',
    text: '这一局你做了很多选择，有些是被逼的，有些是算计的，也有几个是真的你。把那几个记下来 — 它们比位份更能说明你是谁。下一局，试着多留几个。'
  }
}

/* ============================ 导出 ============================ */

return {
  RANKS,
  TALENTS,
  ORIGINS,
  STAGES,
  EVENTS,
  ENDINGS,
  SCENES,
  ADVICE
}

})
