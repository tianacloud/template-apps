/**
 * core/data.js —— 人生模拟器 · 内容层
 * 所有文案与数值都在这里。引擎不认识"故事"，只认识效果。
 * UMD：小程序走 module.exports，网页走 window.LifeData
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./events'), require('./events-extra'), require('./events-pool'), require('./events-new'))
  } else {
    root.LifeData = factory(root.LifeEvents, root.LifeEventsExtra, root.LifeEventsPool, root.LifeEventsNew)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (EVENTS, EXTRA, POOL, NEW) {

// 手写节点（events.js）+ 骨架拆分（events-extra.js）+ 自由池（events-pool.js）+ 独立池（events-new.js）
EVENTS = [].concat(EVENTS || [], EXTRA || [], POOL || [], NEW || [])


/* ============================ 天赋 ============================ */

const TALENTS = [
  {
    id: 'looks',
    name: '天生好皮囊',
    desc: '走在路上会被多看两眼。世界对你，总是稍微温柔那么一点。',
    effects: { cha: 16 }
  },
  {
    id: 'memory',
    name: '过目不忘',
    desc: '考试前翻一遍书，就够了。这让你很早就学会了偷懒，也让你很晚才学会努力。',
    effects: { int: 15 }
  },
  {
    id: 'iron',
    name: '铁打的身子',
    desc: '别人感冒你没事，别人住院你感冒。你的身体不太会跟你闹脾气。',
    effects: { con: 16, health: 6 }
  },
  {
    id: 'rich',
    name: '含着金汤匙',
    desc: '你出生那天，家里刚换了辆好车。你后来才知道那不是所有人都有的事。',
    effects: { family: 22, money: 28 }
  },
  {
    id: 'grit', pri: 6,
    name: '抗压体质',
    desc: '天塌下来，你先睡一觉。醒来发现也没塌到哪去。',
    effects: {},
    flag: 'grit'
  },
  {
    id: 'luck',
    name: '贵人缘',
    desc: '总有人在关键时刻拉你一把。你也没求过，就是有人愿意。',
    effects: { luk: 18 }
  },
  {
    id: 'numb', pri: 7,
    name: '钝感力',
    desc: '难听的话你左耳进右耳出，所以伤不到你。代价是你也不太听得进好话。',
    effects: { happy: 12 },
    flag: 'numb'
  },
  {
    id: 'genius', pri: 8,
    name: '偏执的天才',
    desc: '你在某件事上有近乎病态的专注。代价是别的地方空了一大块。',
    effects: { int: 20, amb: 20, happy: -12 },
    flag: 'genius'
  },
  {
    id: 'warm', pri: 7,
    name: '让人放松的人',
    desc: '别人跟你待着不累。这是稀缺的天赋，只是工资条上看不出来。',
    effects: { cha: 10, happy: 8 },
    flag: 'warm'
  },
  {
    id: 'ordinary', pri: 3,
    name: '没什么特别的',
    desc: '普通的脑子，普通的长相，普通的身体。说真的，也挺好。',
    effects: { happy: 4 }
  }
]

/* ============================ 出身 ============================ */

const BIRTHS = [
  {
    id: 'poor',
    tag: '寒门',
    weight: 19,
    family: [8, 30],
    money: [0, 0],
    desc: '你出生在县城边上的一间平房。那天窗外下着雨，屋里的人在算这个月还差多少钱。没人说得清这算不算个好消息。',
    note: '你的起点比多数人低。这意味着每一步都更费力——也意味着，你走的每一步都算数。'
  },
  {
    id: 'town',
    tag: '小镇普通人家',
    weight: 31,
    family: [30, 50],
    money: [0, 2],
    desc: '你出生在一个普通得不能再普通的家庭。父母都有工作，都不算喜欢。你被抱回家那天，客厅里开着电视。',
    note: '不上不下。没有人替你铺路，也没有人拖你的后腿。'
  },
  {
    id: 'city',
    tag: '城市工薪',
    weight: 26,
    family: [45, 62],
    money: [1, 6],
    desc: '你出生在城市的一套两居室里。父母为了你，把书房改成了婴儿房，然后发现他们再也没有安静看书的地方了。',
    note: '你从小知道"体面"是什么样子，也知道维持它有多累。'
  },
  {
    id: 'mid',
    tag: '中产',
    weight: 17,
    family: [60, 78],
    money: [6, 20],
    desc: '你出生那天，父亲在走廊里打了三个电话，其中一个是在跟公司请假。母亲后来跟你说，她当时最担心的是病房太吵。',
    note: '你的父母相信教育、相信规划、相信一切都能安排好。你会用很多年去验证这句话。'
  },
  {
    id: 'rich',
    tag: '富足',
    weight: 7,
    family: [76, 93],
    money: [20, 60],
    desc: '你出生在市里最好的私立医院。满月酒摆了二十桌。你当时睡着了，不知道这些人和你日后的人生有什么关系。',
    note: '你一出生就站在别人的终点线上。至于是不是还得往前走，是另一回事。'
  }
]

/* ============================ 阶段 ============================ */

const STAGES = {
  1: { name: '出生', tip: '在你做出第一个选择之前，命运已经发过一次牌。' },
  2: { name: '童年', tip: '你开始记事。世界很大，但你的世界只有一个教室那么大。' },
  3: { name: '少年', tip: '你开始有了秘密，也开始知道有些事不能跟家里说。' },
  4: { name: '青年', tip: '你第一次发现，选择是有代价的——不选，也是一种选择。' },
  5: { name: '成年', tip: '所有该来的都来了：责任、账单、体检报告。' },
  6: { name: '中年', tip: '你成了别人的依靠。没人的时候，你也会想靠一靠谁。' },
  7: { name: '老年', tip: '时间开始变快。你开始整理一些东西。' },
  8: { name: '落幕', tip: '' }
}

/* ============================ 事件 ============================ */
/*
 * option:
 *   text      选项文字
 *   effects   立即生效的数值变化
 *   result    选择后的结果文案
 *   resolve   (s, rng) => { text, effects, tone }  条件结算，覆盖 result
 *   flags     打标记
 * event.auto = true 时无需选择，直接 resolve
 */

/* ============================ 结局 ============================ */
/*
 * match(s, sc) => bool
 * sc = { wealth, happy, health, achieve, total }
 * 按顺序匹配，第一条命中的生效
 */


/* ============================ 结局 ============================ */
/*
 * match(s, sc) => bool ；sc = { wealth, happy, health, achieve, total }
 * 按顺序匹配，第一条命中的生效。family 用于挑选最相关的那段真实选择，avoid 用于避开同主题的晚年光景
 */

/* 婚姻/伴侣：把「结过婚」和「现在还在一起」分开。
 * 离婚、丧偶之后 married_* 仍然留在 flags 里（那是经历），但 hasPartner 必须为假。
 * remarried 优先级最高：二婚之后又有人了。 */
const hasPartner = s => {
  const f = s.flags
  if (f.includes('remarried')) return true
  if (f.includes('divorced') || f.includes('widowed')) return false
  return f.includes('married_love') || f.includes('married_arranged') ||
    f.includes('cold_marriage') || f.includes('cohabit')
}
/* 孩子：亲生、晚育、领养、单亲、二胎都算 */
const hasKid = s => s.flags.some(x =>
  x === 'has_child' || x === 'late_child' || x === 'adopted' ||
  x === 'single_parent' || x === 'two_kids')
const isStaff = s => !s.flags.includes('gov') && !s.flags.includes('founder') && !s.flags.includes('freelance') && !s.flags.includes('free_range')

const ENDINGS = [
  /* ========== 一、终点与身体（1-6）========== */
  {
    id: 'short_young', pri: 10, title: '提前交卷', family: 'body',
    match: (s, sc) => sc.health < 22,
    desc: '三月的体检报告你折起来塞进抽屉。第二年春天，抽屉里的东西被人整理过一遍。你这辈子赶过很多次工，只有这一次来不及。'
  },
  {
    id: 'short_ill', pri: 10, title: '没等到退休', family: 'body',
    match: (s, sc) => sc.health < 32 && sc.total < 52,
    desc: '你还没到退休的年纪，身体先办了退。医院窗外那棵树你看了三个春天，今年没等到它开花。'
  },
  {
    id: 'body_crash', pri: 8, title: '赢了，代价是身体', family: 'body', avoid: 'working',
    match: (s, sc) => sc.wealth >= 62 && sc.health < 38,
    desc: '四十岁以后你成了医院的熟客，护士能叫出你的名字。你买得起最好的药，买不起"没得过这个病"。'
  },
  {
    id: 'body_debt', pri: 7, title: '钱挣到了，身体透支了', family: 'body', avoid: 'working',
    match: (s, sc) => sc.health < 48 && sc.wealth >= 54,
    desc: '你把身体当本金，一笔一笔往外支。账面上你确实赢了，身体那边一直记着，最后一起来结。'
  },
  {
    id: 'health_turn', pri: 9, title: '从医院回来之后', family: 'body',
    match: (s, sc) => s.flags.includes('health_wakeup') && sc.health >= 50,
    desc: '那张单子你本来想当没看见。后来你还是去了医院，被医生说了几句不好听的话。你戒了酒，开始走路，把报告贴在冰箱上。'
  },
  {
    id: 'hardy', pri: 7, title: '一副好身板', family: 'body',
    match: (s, sc) => sc.health >= 84 && sc.total >= 58,
    desc: '你八十岁还能自己拎着米上楼，医生说你像六十。你没练过什么，就是一辈子没怎么糟蹋自己。'
  },

  /* ========== 二、出身（7-14）========== */
  {
    id: 'silver_spoon', pri: 8, title: '起点在别人的终点', family: 'origin',
    match: (s, sc) => s.family >= 82 && sc.achieve >= 56,
    desc: '别人二十岁才第一次坐飞机，你十岁就坐腻了。你的路有人提前扫过，你也确实没辜负这条好路。'
  },
  {
    id: 'cold_start_win', pri: 9, title: '从最差那一档起步', family: 'origin',
    match: (s, sc) => s.flags.includes('cold_start') && sc.wealth >= 56,
    desc: '你起步的时候，家里连一张安静写字的桌子都没有。后来你有了自己的书房，书柜是满的，很多本没拆封。'
  },
  {
    id: 'climber', pri: 7, title: '逆流而上的人', family: 'origin',
    match: (s, sc) => s.family < 40 && sc.achieve >= 56 && sc.wealth >= 48,
    desc: '别人在学钢琴的年纪，你在学着怎么不让家里为难。为了站到后来那个位置，你少睡的那些觉、少说的那些软话，只有你自己记得。'
  },
  {
    id: 'self_made', pri: 7, title: '自己把自己捞出来', family: 'origin',
    match: (s, sc) => s.family < 45 && sc.wealth >= 62 && sc.achieve >= 52,
    desc: '没人给你递梯子，你自己找了块石头。等你站上去，才发现那些有梯子的人早就到了——不过你也到了。'
  },
  {
    id: 'family_hole', pri: 8, title: '家里一直是个窟窿', family: 'origin',
    match: (s, sc) => s.family < 38 && sc.wealth < 46 && sc.happy < 60,
    desc: '你挣的钱有一部分不是给自己的。先是父亲的债，后来是弟弟的房，再后来是母亲的病。你从没算过总共给了多少，算了会心疼。'
  },
  {
    id: 'sibling_split', pri: 9, title: '跟亲人走散了', family: 'origin',
    match: (s, sc) => s.flags.includes('sibling_split') && sc.happy < 56,
    desc: '为了那套老房子，你和亲兄弟十年没说话。母亲走的那天你们在走廊上碰见，点了点头。后来谁也没再提。'
  },
  {
    id: 'small_town_win', pri: 7, title: '小地方出来的', family: 'origin',
    match: (s, sc) => s.flags.includes('small_city') && sc.wealth >= 58 && sc.achieve >= 52,
    desc: '你从县城出来，第一次坐地铁坐反了方向。二十年后你在这座城市有了地址、车位，和一个不叫"宿舍"的家。'
  },
  {
    id: 'root_stay', pri: 7, title: '没走成，留在原地', family: 'origin',
    match: (s, sc) => s.flags.includes('hometown') && sc.wealth < 38 && sc.happy >= 46,
    desc: '你年轻时想走，一直没走成。后来同学会只有你还在本地，谁家有事都找你打听。你成了这个地方的一部分。'
  },

  /* ========== 三、学业（15-22）========== */
  {
    id: 'top_scorer', pri: 10, title: '一直考第一', family: 'edu',
    match: (s, sc) => s.flags.includes('top_scorer') && sc.achieve >= 56,
    desc: '从小学到高中，你的名字一直在红榜最上面。后来你才发现，会考试只是所有本事里最容易被替代的那一种。'
  },
  {
    id: 'elite_track', pri: 8, title: '被安排好的优秀', family: 'edu',
    match: (s, sc) => s.flags.includes('elite_school') && s.family >= 55 && sc.achieve >= 55,
    desc: '好小学、好中学、好大学、好工作，一步没走错。你确实优秀，优秀得很标准。只有某些夜里你会想：如果当初没人替你做决定，你会成为谁。'
  },
  {
    id: 'postgrad_life', pri: 8, title: '书读到了顶', family: 'edu',
    match: (s, sc) => s.flags.includes('postgrad') && sc.achieve >= 56 && sc.wealth >= 50,
    desc: '你把书读到了尽头，博士论文写了四年。你的名字出现在几篇没人读完的论文上，你自己也很少回头翻。'
  },
  {
    id: 'science_life', pri: 8, title: '一辈子只做一件事', family: 'edu',
    match: (s, sc) => s.flags.includes('science') && sc.achieve >= 58 && s.edu >= 5,
    desc: '你这一辈子只做了一件很小的事，小到没法跟人解释。行里有人引用你的数据，那就是你留下的东西。'
  },
  {
    id: 'arts_life', pri: 7, title: '靠喜欢的事吃饭', family: 'edu',
    match: (s, sc) => s.flags.includes('arts') && sc.achieve >= 54 && sc.wealth >= 42,
    desc: '你靠写字、画画或者唱歌养活了自己，虽然一直不宽裕。有人喜欢你的东西，你每天醒来是愿意的，这就够了。'
  },
  {
    id: 'no_college_win', pri: 8, title: '没上大学，也站住了', family: 'edu',
    match: (s, sc) => s.flags.includes('no_college') && sc.achieve >= 52 && sc.wealth >= 46,
    desc: '十八岁那年你没考上，也没复读。你去学了门手艺，或者去跑了业务。后来你带的团队里有硕士，他们叫你哥，不知道你连本科都没读。'
  },
  {
    id: 'repeat_year', pri: 9, title: '复读那年', family: 'edu',
    match: (s, sc) => s.flags.includes('repeat_year') && sc.achieve >= 48 && sc.happy >= 50,
    desc: '复读那年你坐在最后一排，风扇一直响。第二年你考上了，分数只多了三十分，那三十分改了你后面三十年。'
  },
  {
    id: 'school_early', pri: 8, title: '十六岁就出门了', family: 'edu',
    match: (s, sc) => s.flags.includes('no_college') && sc.wealth < 46 && sc.achieve < 50,
    desc: '十六岁你就出门了，第一份工在流水线上。同龄人在教室里，你在算这个月能往家寄多少。'
  },

  /* ========== 四、职业路径（23-38）========== */
  {
    id: 'gov_top', pri: 9, title: '在体制里做到了', family: 'work',
    match: (s, sc) => s.flags.includes('gov') && s.career >= 8 && sc.achieve >= 56,
    desc: '你从科员做到能签字的位置，用了二十年。会上你说话不快，但说完就定了。'
  },
  {
    id: 'gov_lifer', pri: 8, title: '铁饭碗里的三十年', family: 'work', avoid: ['working', 'moved'],
    match: (s, sc) => s.flags.includes('gov') && s.career >= 5,
    desc: '同一栋楼，同一张桌子，走廊上同一个脚步声。工位换过两次，都在同一层。别人下海、跳槽、折腾，你一直在。'
  },
  {
    id: 'gov_flat', pri: 7, title: '一张桌子坐到退休', family: 'work', avoid: 'moved',
    match: (s, sc) => s.flags.includes('gov') && s.career < 5,
    desc: '你的职级二十年没动过。文件照发，会照开，你把手上的事办得没出过错，也没人记得是谁办的。'
  },
  {
    id: 'founder_exit', pri: 10, title: '把公司卖了', family: 'work',
    match: (s, sc) => s.flags.includes('sold_company'),
    desc: '公司卖出去那天你签了三十几页文件，手一直很稳。钱到账以后你在楼下抽了根烟，忽然不知道明天几点起。'
  },
  {
    id: 'founder_made', pri: 8, title: '自己扛出来的', family: 'work',
    match: (s, sc) => s.flags.includes('founder') && sc.wealth >= 52 && sc.achieve >= 52,
    desc: '有几年没人给你发工资，你学会了自己给自己发。签第一份合同时你手抖，后来签多了就不抖了。'
  },
  {
    id: 'founder_fail', pri: 9, title: '试过一次', family: 'work',
    match: (s, sc) => (s.flags.includes('founder') || s.flags.includes('took_risk')) && sc.wealth < 48,
    desc: '你辞职那年所有人都劝你再想想。你听了，还是辞了。两年后回去上班，职级比走的时候低一级。'
  },
  {
    id: 'bigtech_rich', pri: 8, title: '赶上了那波', family: 'work',
    match: (s, sc) => s.flags.includes('bigtech') && sc.wealth >= 66 && sc.achieve >= 54,
    desc: '你进那家公司的时候它还没上市。后来你手里那点期权翻了很多倍，你第一次知道钱可以这么来。'
  },
  {
    id: 'bigtech_cog', pri: 7, title: '高薪的齿轮', family: 'work',
    match: (s, sc) => s.flags.includes('bigtech') && sc.wealth >= 58 && sc.achieve < 54,
    desc: '你的工资单比你父母一辈子见过的都长。你做过的东西几亿人在用，没人知道那是你做的。三十几岁你就开始担心被优化。'
  },
  {
    id: 'bigtech_cut', pri: 8, title: '被优化过', family: 'work',
    match: (s, sc) => s.flags.includes('bigtech') && sc.wealth < 52 && s.career <= 5,
    desc: '三十五岁那年你被约谈，会议室里坐着 HR 和一个你不认识的人。赔偿方案很公道，你签字的时候手没抖。'
  },
  {
    id: 'freelance_pro', pri: 7, title: '靠手艺吃饭', family: 'work',
    match: (s, sc) => (s.flags.includes('freelance') || s.flags.includes('free_range')) && s.career >= 5 && sc.achieve >= 52,
    desc: '客户排队找你，你的报价一年涨一次。你没上过班，也没有同事，好坏都得自己扛。'
  },
  {
    id: 'freelance_poor', pri: 7, title: '自由是有价格的', family: 'work',
    match: (s, sc) => (s.flags.includes('freelance') || s.flags.includes('free_range')) && sc.wealth < 44,
    desc: '你的收入像心电图，好的月份像过年，差的月份要动存款。你没饿着，也没攒下什么。'
  },
  {
    id: 'keeper', pri: 7, title: '传下去的人', family: 'work',
    match: (s, sc) => sc.achieve >= 58 && sc.wealth < 56 && sc.happy >= 48,
    desc: '你会的那些东西，起初只是为了吃饭。后来你带过几个人，教他们怎么开始、怎么收尾、哪里最容易错。你的手法在你不在的地方还在用。'
  },
  {
    id: 'ladder', pri: 6, title: '一级一级爬上去', family: 'work', avoid: 'working',
    match: (s, sc) => isStaff(s) && s.career >= 7 && sc.achieve >= 54,
    desc: '你从最下面一级开始爬，每两年动一次。四十岁那年你有了独立办公室，门牌上你的名字是印的，不是贴的。'
  },
  {
    id: 'office_flat', pri: 6, title: '格子间的一生', family: 'work',
    match: (s, sc) => isStaff(s) && s.career >= 4 && sc.achieve < 48,
    desc: '你在一家公司待了十几年，位置一直没变。你熟悉所有流程，也熟悉所有不能说的话。'
  },
  {
    id: 'job_hop', pri: 5, title: '换过很多份工作', family: 'work',
    match: (s, sc) => isStaff(s) && s.career < 4 && sc.wealth >= 44,
    desc: '你换过七八份工作，最短的一次只干了两个月。简历上不好看，但你见过的世面比同龄人多。'
  },
  {
    id: 'laidoff_again', pri: 7, title: '四十几岁被优化过', family: 'work',
    match: (s, sc) => isStaff(s) && s.career >= 6 && sc.wealth < 44,
    desc: '你被优化过两次。第一次你慌，第二次你算了算赔偿金，先去玩了半个月。'
  },

  /* ========== 五、钱与体面（39-48）========== */
  {
    id: 'rich_both', pri: 6, title: '钱和日子都拿到了', family: 'money',
    match: (s, sc) => sc.wealth >= 72 && sc.happy >= 60,
    desc: '你既挣到了钱，也没有把日子过成苦役。这两件事同时做到的人不多，你算一个。'
  },
  {
    id: 'hollow', pri: 6, title: '体面的空壳', family: 'money',
    match: (s, sc) => sc.wealth >= 62 && sc.happy < 52,
    desc: '你的名片印着不错的头衔，房子朝南，车是新的。上一次笑出声是什么时候，你想不起来。'
  },
  {
    id: 'rich_alone', pri: 6, title: '富有的孤岛', family: 'money', avoid: 'idle',
    match: (s, sc) => sc.wealth >= 64 && (s.flags.includes('divorced') || s.flags.includes('single_by_choice')) && sc.happy < 64,
    desc: '你的通讯录按字母排得很整齐，深夜能打的只有一个。你不是没人要，是没留出位置。'
  },
  {
    id: 'property', pri: 5, title: '最大的那笔是房子', family: 'money',
    match: (s, sc) => sc.wealth >= 56 && s.flags.includes('mortgage') && sc.happy >= 50,
    desc: '你最大的那笔钱压在一套房子上。涨的时候你没卖，跌的时候你也没卖，它现在只是你住的地方。'
  },
  {
    id: 'frugal', pri: 5, title: '会算账的人', family: 'money',
    match: (s, sc) => sc.wealth >= 44 && sc.wealth < 58 && sc.happy >= 56,
    desc: '你记账记了几十年，每一笔都清楚。别人笑你抠，你只是不喜欢不知道钱去哪儿了。'
  },
  {
    id: 'broke', pri: 9, title: '到老还是紧', family: 'money',
    match: (s, sc) => sc.wealth < 30 && sc.happy < 56,
    desc: '到老你的存折还是很薄。你不太敢生病，也不太敢答应别人请客。'
  },
  {
    id: 'debt_end', pri: 6, title: '账还到最后', family: 'money', avoid: 'debt',
    match: (s, sc) => (s.flags.includes('debt') || s.flags.includes('mortgage')) && sc.wealth < 45,
    desc: '那笔账你还了很多年。最后一期划走那天你在银行坐了一会儿，没有什么感觉。'
  },
  {
    id: 'poor_happy', pri: 6, title: '清贫但快活', family: 'money',
    match: (s, sc) => sc.wealth < 38 && sc.happy >= 62,
    desc: '你没攒下什么钱，也没有拿得出手的头衔。很多个下午是在晒太阳、闲聊、做一件没用的事里过去的。'
  },
  {
    id: 'modest', pri: 4, title: '不高不低', family: 'money',
    match: (s, sc) => sc.wealth >= 46 && sc.wealth < 60,
    desc: '你的日子不好不坏：工资够花，房贷还完，孩子普通，身体有点小毛病。'
  },
  {
    id: 'spent_all', pri: 5, title: '钱花在自己身上', family: 'money',
    match: (s, sc) => sc.wealth >= 56 && sc.happy >= 62 && !s.flags.includes('mortgage'),
    desc: '你挣的钱大部分花在了自己身上：旅行、吃饭、学没用的东西。有人替你算过，说你要是攒着早就发了。你问攒着给谁。'
  },

  /* ========== 六、身边有谁（49-64）========== */
  {
    id: 'alone_rich', pri: 6, title: '一个人也走得很远', family: 'relation',
    match: (s, sc) => s.flags.includes('divorced') && sc.wealth >= 50,
    desc: '婚姻在中途散了，你没有再组一个家。力气全放到了别处，也确实做出了东西。夜里偶尔会空，白天你是完整的。'
  },
  {
    id: 'divorced_mid', pri: 7, title: '散过一次', family: 'relation',
    match: (s, sc) => s.flags.includes('divorced') && sc.wealth < 50,
    desc: '离婚那年你三十几岁，孩子跟了对方。你每个月按时打钱，逢年过节接过来住几天。后来孩子长大了，跟你也亲。'
  },
  {
    id: 'cold_home', pri: 7, title: '一个屋檐下的两个人', family: 'relation', avoid: 'idle',
    match: (s, sc) => s.flags.includes('cold_marriage') && sc.happy < 56,
    desc: '你们没离婚，也不吵架。谁交水电费、谁开家长会，都写在日历上。晚上在同一个客厅，各看一个手机。'
  },
  {
    id: 'single_whole', pri: 6, title: '一个人，也是完整的', family: 'relation',
    match: (s, sc) => s.flags.includes('single_by_choice') && sc.happy >= 58 && !hasKid(s),
    desc: '"什么时候"这个问题，你被问到没人再问。你自己做饭、自己旅行、自己在手术同意书上签字。'
  },
  {
    id: 'single_lonely', pri: 7, title: '一直一个人', family: 'relation',
    match: (s, sc) => !hasPartner(s) && !hasKid(s) && sc.happy < 52,
    desc: '你没结过婚，也没遇上能一起过日子的人。房子是你自己买的，钥匙只有一把。'
  },
  {
    id: 'dink_free', pri: 6, title: '两个人的自由', family: 'relation',
    match: (s, sc) => s.flags.includes('dink') && sc.happy >= 55 && !hasKid(s),
    desc: '你们很早就说好不要孩子。钱花在自己身上，假期说走就走。四十岁后你们讨论过"老了怎么办"，没结论。'
  },
  {
    id: 'late_child', pri: 8, title: '很晚才有个孩子', family: 'relation',
    match: (s, sc) => s.flags.includes('late_child'),
    desc: '你要孩子要得晚，四十岁才第一次抱。开家长会时你比别人大一轮，被叫过一次"爷爷/奶奶"。'
  },
  {
    id: 'grandparent', pri: 8, title: '带孙辈的人', family: 'relation',
    match: (s, sc) => s.flags.includes('grandparent'),
    desc: '你的手机相册里全是孙辈。你会为他们学会用新的软件，也会在他们走了以后把房间收拾得很干净。'
  },
  {
    id: 'tiger_parent', pri: 8, title: '管得严的父母', family: 'relation',
    match: (s, sc) => s.flags.includes('tiger_parent') && sc.happy >= 48,
    desc: '你管孩子管得严，作业、琴、成绩，一样不落。孩子后来考得不错，也跟你不太亲。'
  },
  {
    id: 'present_parent', pri: 8, title: '一直都在的父母', family: 'relation',
    match: (s, sc) => s.flags.includes('present_parent') && sc.happy >= 52,
    desc: '你几乎没缺席过孩子的任何一场比赛。你的事业因此慢了几年，你不觉得亏。'
  },
  {
    id: 'caretaker', pri: 7, title: '一直在照顾人', family: 'care', avoid: 'caring',
    match: (s, sc) => (s.flags.includes('tiger_parent') || s.flags.includes('present_parent') || s.flags.includes('cared_parent')) && sc.happy >= 44,
    desc: '你做的事都不写在简历上：半夜送人去医院，替人垫钱，替人瞒一件事。你错过的一些机会，后来落到了别人手里。'
  },
  {
    id: 'first_love', pri: 8, title: '跟初恋过了一辈子', family: 'relation',
    match: (s, sc) => s.flags.includes('first_love') && sc.happy >= 58,
    desc: '你娶的、嫁的是十七岁就认识的那个人。中间分过一次，后来又在一起了。'
  },
  {
    id: 'arranged', pri: 6, title: '相亲结的婚', family: 'relation',
    match: (s, sc) => s.flags.includes('married_arranged') && sc.happy >= 55,
    desc: '你们是相亲认识的，见过三次就定了。感情是后来慢慢有的，现在也算习惯了对方。'
  },
  {
    id: 'no_marry', pri: 5, title: '没结婚，也不缺什么', family: 'relation',
    match: (s, sc) => !hasPartner(s) && sc.happy >= 50 && sc.wealth >= 48,
    desc: '你没结婚，但不缺什么：有房，有朋友，有一份做到退休的工作。亲戚催过几年，后来不催了。'
  },
  {
    id: 'big_family', pri: 6, title: '家里人多', family: 'relation',
    match: (s, sc) => hasKid(s) && sc.happy >= 62 && sc.wealth >= 48,
    desc: '过年你家要摆两桌。孩子、配偶、孙辈，名字你有时会叫串，但一个都不会漏。'
  },
  {
    id: 'quiet_couple', pri: 5, title: '两个人安静过了几十年', family: 'relation',
    match: (s, sc) => s.flags.includes('married_love') && sc.happy >= 50 && sc.happy < 64,
    desc: '你们不怎么说话，也不吵架。几十年下来，对方的脚步声你一听就知道。'
  },

  /* ========== 七、心气（65-74）========== */
  {
    id: 'bitter', pri: 5, title: '一直不服气', family: 'mind',
    match: (s, sc) => s.amb >= 62 && sc.happy < 48,
    desc: '你一直在跟什么东西较劲：出身、同龄人、那个说你不行的人。你确实走得很远，但很少停下来。'
  },
  {
    id: 'grind', pri: 5, title: '一直在跑，一直没到', family: 'mind', avoid: 'working',
    match: (s, sc) => s.amb >= 55 && sc.achieve < 50 && sc.wealth < 45,
    desc: '你比大多数人能吃苦，也比大多数人不甘心。换过几个方向，每次都在快成的时候遇上别的事。'
  },
  {
    id: 'regret_life', pri: 6, title: '心里那几件没放下', family: 'mind',
    match: (s, sc) => (s.flags.includes('regret_choice') || s.flags.includes('regret_people')) && sc.happy < 52,
    desc: '有两三个决定，你到现在还会在夜里重放。你知道重来一次可能还是那样选，但你放不下。'
  },
  {
    id: 'regret_health', pri: 7, title: '后悔没早管身体', family: 'mind',
    match: (s, sc) => s.flags.includes('regret_health') && sc.health < 60,
    desc: '你把身体透支得太早。后来你愿意花钱，愿意听话，愿意每天走路，但那几年补不回来。'
  },
  {
    id: 'no_regret', pri: 5, title: '没什么后悔的', family: 'mind',
    match: (s, sc) => s.flags.includes('no_regret') && sc.happy >= 56,
    desc: '你做过几个后来看起来很傻的决定，但你说不后悔。重来一次，你还会那么选。'
  },
  {
    id: 'numb', pri: 7, title: '后来就不太有感觉了', family: 'mind',
    match: (s, sc) => s.flags.includes('numb'),
    desc: '你后来不太有感觉了。高兴不起来，也难过得有限。日子照过，只是像隔着一层东西。'
  },
  {
    id: 'warm', pri: 7, title: '一个温和的人', family: 'mind',
    match: (s, sc) => s.flags.includes('warm') && sc.happy >= 56,
    desc: '你这个人不厉害，但认识你的人都说你好相处。你走的时候，来了很多人。'
  },
  {
    id: 'grit', pri: 6, title: '硬扛下来的人', family: 'mind',
    match: (s, sc) => s.flags.includes('grit') && sc.achieve >= 55,
    desc: '你没什么天赋，就是能熬。别人放弃的地方你多待了两年，那两年后来成了你的分水岭。'
  },
  {
    id: 'genius', pri: 8, title: '脑子确实好使', family: 'mind',
    match: (s, sc) => s.flags.includes('genius') && sc.achieve >= 58,
    desc: '你脑子确实好使，很多事别人讲三遍你一遍就懂。你也因此有点不耐烦，错过了一些本来能帮你的人。'
  },
  {
    id: 'stubborn', pri: 5, title: '不信邪', family: 'mind',
    match: (s, sc) => s.amb >= 70 && sc.achieve >= 54,
    desc: '别人说不行，你偏要试。你撞过几次南墙，也撞开过一两扇门。'
  },

  /* ========== 八、做成了什么（75-84）========== */
  {
    id: 'legend', pri: 7, title: '被命运偏爱的人', family: 'strive',
    match: (s, sc) => sc.total >= 74 && sc.wealth >= 64 && sc.health >= 62,
    desc: '你赶上的每个节点，都刚好有人愿意帮你一把。你也确实接得住——换个人，扶也扶不起来。'
  },
  {
    id: 'achiever', pri: 7, title: '做出了名堂', family: 'strive',
    match: (s, sc) => sc.achieve >= 68,
    desc: '你做成了几件事，其中一件到现在还有人提起。你不太提，因为你知道那里面有多少运气。'
  },
  {
    id: 'late', pri: 7, title: '大器晚成', family: 'strive',
    match: (s, sc) => sc.achieve >= 56 && s.career >= 7 && sc.wealth >= 56,
    desc: '你前半生平平，甚至有点落后。四十岁之后某样东西忽然对上了——坑都踩过，关键那步就没踩错。'
  },
  {
    id: 'quiet_hero', pri: 7, title: '做事不为钱', family: 'strive',
    match: (s, sc) => sc.achieve >= 58 && sc.wealth < 50,
    desc: '你做的事不太挣钱，但确实有用。有人因为你少走了弯路，他们不一定记得你的名字。'
  },
  {
    id: 'no_mark', pri: 5, title: '什么都没留下', family: 'strive',
    match: (s, sc) => sc.achieve < 42 && sc.wealth < 48,
    desc: '你没做出什么作品，也没留下什么名字。你的痕迹在别人的记忆里，而那些人也一个个走了。'
  },
  {
    id: 'mid_achieve', pri: 4, title: '算是有个交代', family: 'strive',
    match: (s, sc) => sc.achieve >= 52 && sc.achieve < 62,
    desc: '你做成了一些事，也没做成一些事。到这个年纪，你大概能分清哪些是自己的问题。'
  },
  {
    id: 'low_achieve', pri: 4, title: '钱有了，事没做成', family: 'strive',
    match: (s, sc) => sc.achieve < 48 && sc.wealth >= 48,
    desc: '你钱是有了，但想做的事一直没做成。你偶尔会想，如果当年选了另一条路会怎样。'
  },
  {
    id: 'coped', pri: 3, title: '该扛的都扛住了', family: 'strive',
    match: (s, sc) => sc.achieve >= 44 && sc.happy >= 50,
    desc: '你没什么了不起的成就，但每一件该你扛的事你都扛住了。这不容易。'
  },
  {
    id: 'survivor', pri: 4, title: '熬过来了', family: 'strive',
    match: (s, sc) => sc.total >= 52 && sc.health < 56,
    desc: '你身上有几处旧伤，体检报告上有几个箭头。你还活着，还在自己走路、自己吃饭。'
  },
  {
    id: 'steady', pri: 4, title: '稳稳当当', family: 'calm',
    match: (s, sc) => sc.total >= 60 && sc.health >= 52 && sc.happy >= 50 && sc.happy < 70,
    desc: '没有大起大落。工作换过两次，家搬过几回，父母送走了，身边留下几个一直没断的人。'
  },

  /* ========== 九、落脚（85-92）========== */
  {
    id: 'homecoming', pri: 6, title: '回到出发的地方', family: 'calm', avoid: 'moved',
    match: (s, sc) => s.flags.includes('hometown') && sc.wealth < 50 && sc.happy >= 50,
    desc: '年轻时你最想做的事是离开，后来也确实离开了。中年之后，你在某个普通的下午回来了。'
  },
  {
    id: 'city_moves', pri: 6, title: '一直在换地方', family: 'calm', avoid: 'moved',
    match: (s, sc) => s.flags.includes('renter') && (s.flags.includes('hometown') || s.flags.includes('small_city')) && sc.happy >= 46,
    desc: '你算过，这些年搬了七次家。朋友散在好几个城市，很难凑齐。你不太有"老家"，只有"现在住的地方"。'
  },
  {
    id: 'renter_old', pri: 4, title: '一辈子租房', family: 'calm', avoid: 'moved',
    match: (s, sc) => s.flags.includes('renter') && sc.wealth < 45,
    desc: '你一辈子租房，房东换过五六个。你不敢买太大的家具，因为不知道下次搬到哪儿。'
  },
  {
    id: 'settle_down', pri: 5, title: '有了自己的房子', family: 'calm',
    match: (s, sc) => s.flags.includes('mortgage') && sc.happy >= 54 && sc.wealth >= 52,
    desc: '你终于有了自己的房子，钥匙拿到手那天你在空房间里站了很久。'
  },
  {
    id: 'small_flat', pri: 5, title: '房贷还了三十年', family: 'calm', avoid: 'debt',
    match: (s, sc) => s.flags.includes('mortgage') && sc.wealth < 46,
    desc: '你的房贷还了三十年。最后一期还完，你在阳台上坐了一下午，什么也没干。'
  },
  {
    id: 'quiet_town', pri: 5, title: '小城里的一辈子', family: 'calm',
    match: (s, sc) => s.flags.includes('small_city') && sc.happy >= 56 && sc.wealth < 52,
    desc: '你在一座小城过完了一辈子。街上的店换了几轮，老板大多认识你。'
  },
  {
    id: 'big_city_life', pri: 4, title: '大城市的三十年', family: 'calm',
    match: (s, sc) => !s.flags.includes('small_city') && !s.flags.includes('hometown') && sc.wealth >= 50,
    desc: '你在一座很大的城市待了三十年。你熟悉它的地铁线路，却不太认识邻居。'
  },
  {
    id: 'stay_put', pri: 4, title: '哪儿也没去', family: 'calm',
    match: (s, sc) => !s.flags.includes('renter') && !s.flags.includes('mortgage') && sc.wealth < 46,
    desc: '你一辈子没离开过这座城，连住的地方都换得很少。别人走南闯北，你哪儿也不想去。'
  },

  /* ========== 十、中间与兜底（93-100）========== */
  {
    id: 'happy_life', pri: 4, title: '会过日子的人', family: 'calm',
    match: (s, sc) => sc.happy >= 74 && sc.health >= 62,
    desc: '你睡得着，吃得香，笑得出来。会为一顿好饭高兴半天，天气好就出门走走。这种本事看起来不起眼，很多人一辈子没学会。'
  },
  {
    id: 'quiet', pri: 3, title: '安静地过完了', family: 'calm',
    match: (s, sc) => sc.achieve < 50 && sc.wealth < 46 && sc.happy >= 42 && sc.total < 50,
    desc: '没做过大事，也没给谁添过麻烦。上班、做饭、看电视、睡觉，一年又一年。'
  },
  {
    id: 'ailing', pri: 4, title: '带着毛病活着', family: 'calm',
    match: (s, sc) => sc.total >= 44 && sc.total < 56 && sc.health < 54,
    desc: '你的身体从四十岁起就没好过，毛病一个接一个。你还是照常上班、照常吃饭，把药盒摆得整整齐齐。'
  },
  {
    id: 'plain', pri: 3, title: '平平常常', family: 'calm',
    match: (s, sc) => sc.total >= 44 && sc.total < 52 && sc.achieve < 50 && sc.happy >= 44,
    desc: '你没什么特别的地方，也没什么大毛病。日子一天一天过，回头看看，也说不清哪一年最要紧。'
  },
  {
    id: 'ordinary', pri: 3, title: '一个普通人的一生', family: 'calm',
    match: (s, sc) => sc.total >= 44 && sc.total < 58 && sc.happy >= 42 && sc.happy < 62,
    desc: '抓住过两次机会，错过三次。送走了父母，照顾过一些人，也被一些人照顾。'
  },
  {
    id: 'mid_life', pri: 3, title: '中上的一辈子', family: 'calm',
    match: (s, sc) => sc.total >= 58 && sc.total < 70,
    desc: '你比多数人过得好一些，也比少数人差一些。你自己觉得还行，这就够了。'
  },
  {
    id: 'low_total', pri: 3, title: '没走好，也没走歪', family: 'calm',
    match: (s, sc) => sc.total < 44,
    desc: '你的日子一直不太顺：钱紧，身体一般，高兴的时候不多。你还是过完了。'
  },
  {
    id: 'fallback', pri: 3, title: '就这样过完了', family: 'calm',
    match: () => true,
    desc: '你出生，长大，工作，变老。中间有过高兴的日子，也有过很难熬的夜晚。'
  }
]

/* ============================ 晚年光景 ============================ */
/*
 * 结局 = 人生走向（ENDINGS，100 种）× 晚年光景（SCENES，100 种）= 10000 种
 * 每 10 条一组：照顾人 / 还没停 / 还账 / 搬来搬去 / 带孙辈 / 身体 / 钱紧 / 钱宽 / 闲下来 / 身边有谁
 * cond 只看 flag 与数值；pickScene 取 pri 最高的一组，同组内按局面稳定散开
 */

const SCENES = [
  /* ========== 一、照顾人的那些年（1-10）========== */
  { id: 'care_partner', name: '照顾老伴，刚开头', pri: 8, cond: s => s.flags.includes('cared_parent') && hasPartner(s),
    line: '他开始记不住事，你把药分在小盒子里，早中晚各一格。出门前你要检查三遍煤气。' },
  { id: 'care_partner_long', name: '照顾老伴，第五年', pri: 8, cond: s => s.flags.includes('cared_parent') && hasPartner(s) && s.age > 66,
    line: '第五年你已经熟练了：翻身、擦身、喂饭，一套做完四十分钟。护工说你不像第一次照顾人。' },
  { id: 'care_parent_kid', name: '照顾老人，孩子换班', pri: 8, cond: s => s.flags.includes('cared_parent') && hasKid(s),
    line: '你们排了班，谁值夜谁做饭。孩子接下半夜，你回家睡四个小时，早上再过去。' },
  { id: 'care_parent_alone', name: '照顾老人，一个人跑', pri: 8, cond: s => s.flags.includes('cared_parent') && !hasPartner(s) && !hasKid(s),
    line: '挂号、缴费、拿药，流程你熟得不用问人。跑完你坐在走廊上吃了个包子，凉了。' },
  { id: 'care_both', name: '两头都要顾', pri: 8, cond: s => s.flags.includes('cared_parent') && hasPartner(s) && hasKid(s),
    line: '上面一个老人，下面一个孙辈。你在两头跑，中间那顿饭常常在公交车上吃。' },
  { id: 'care_hospital', name: '医院走廊的常客', pri: 8, cond: s => s.flags.includes('cared_parent'),
    line: '护士都认识你，见你来了会点点头。你有一个熟悉的座位，在靠窗第三排。' },
  { id: 'care_home', name: '把老人接回家里', pri: 8, cond: s => s.flags.includes('cared_parent'),
    line: '你把客厅的沙发换成了一张护理床。家里从此有一股药味，你后来闻不出来了。' },
  { id: 'care_far', name: '远程照顾，电话不断', pri: 8, cond: s => s.flags.includes('cared_parent') && !hasPartner(s),
    line: '你每天打两个电话，问吃了没、药吃了没。有一次没人接，你请了假坐高铁回去。' },
  { id: 'care_end', name: '送走最后一个老人', pri: 8, cond: s => s.flags.includes('cared_parent') && s.age > 64,
    line: '最后那几年你送走了两个人。办完事回家，你坐在沙发上，忽然不知道自己该干什么。' },
  { id: 'care_self', name: '照顾人的也病了', pri: 8, cond: s => s.flags.includes('cared_parent') && s.health < 52,
    line: '你把自己也照顾进了医院。躺在病床上你还在想着家里那顿药谁给喂。' },

  /* ========== 二、还没停下来（11-20）========== */
  { id: 'work_kid_stop', name: '还在干，孩子劝歇', pri: 7, cond: s => s.flags.includes('still_working') && hasKid(s),
    line: '孩子说了几次"别干了"，你答应着，第二天照旧出门。不是缺钱，是不习惯整天没事。' },
  { id: 'work_partner', name: '两个人都没停', pri: 7, cond: s => s.flags.includes('still_working') && hasPartner(s),
    line: '你们都还没完全闲下来。晚饭常常凑不齐，但谁也不觉得这算什么大事。' },
  { id: 'work_alone', name: '一个人忙到很晚', pri: 7, cond: s => s.flags.includes('still_working') && !hasPartner(s),
    line: '你把日程排得挺满，其实那些事不做也行。忙是最好用的借口，能挡掉"你一个人不闷吗"。' },
  { id: 'work_shop', name: '守着自己的小店', pri: 7, cond: s => s.flags.includes('still_working'),
    line: '卷帘门早上七点拉开，晚上九点放下。街坊说这条街上就你家店开得最久。' },
  { id: 'work_skill', name: '还在接老客户的活', pri: 7, cond: s => s.flags.includes('still_working'),
    line: '老客户认你这个人，不看名片。你一周接两单，够花，也不至于手生。' },
  { id: 'work_teach', name: '还在带徒弟', pri: 7, cond: s => s.flags.includes('still_working') && s.career >= 5,
    line: '你带的最后一个徒弟已经能独立接活了。他还是隔一阵来问你两句话，你说完他就走。' },
  { id: 'work_land', name: '还在侍弄那块地', pri: 7, cond: s => s.flags.includes('still_working'),
    line: '天不亮你就下地，中午回来睡一觉，下午再去。收成好坏你不太在意，主要是闲不住。' },
  { id: 'work_half', name: '半退，接点零活', pri: 7, cond: s => s.flags.includes('still_working'),
    line: '你把大半的活推了，只留两三个熟客。剩下时间你反而不知道该怎么安排。' },
  { id: 'work_habit', name: '不是缺钱，是习惯', pri: 7, cond: s => s.flags.includes('still_working') && s.money > 60,
    line: '你的账户不缺钱，但你照样六点起。有一天下雨没出门，你在屋里转了一上午。' },
  { id: 'work_last', name: '干到干不动那天', pri: 7, cond: s => s.flags.includes('still_working'),
    line: '你没想过"退休"这个词。活一直有，你就一直干，直到有一天手抬不起来了。' },

  /* ========== 三、账还没还完（21-30）========== */
  { id: 'debt_kid_hide', name: '还账，瞒着孩子', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')) && s.money < 45 && hasKid(s),
    line: '那笔钱你算了又算，能自己还就不张口。孩子问起，你总说"够了够了"。' },
  { id: 'debt_couple', name: '还账，两个人算', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')) && s.money < 45 && hasPartner(s),
    line: '每个月那几天你们会对着账本说几句话。说完就过去了，第二天照常过日子。' },
  { id: 'debt_alone', name: '还账，一个人扛', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')) && s.money < 45 && !hasPartner(s),
    line: '每个月那几天你格外沉默。不是还不上，是没人可以说一声"这月又过去了"。' },
  { id: 'debt_last_year', name: '还剩最后一年', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')),
    line: '银行发来的短信你留着，一条没删。照这个速度，明年这个时候就清了。' },
  { id: 'debt_house', name: '房贷压着，不敢歇', pri: 6, cond: s => s.flags.includes('mortgage') && s.money < 50,
    line: '你算过，还要还十四年。这十四年里你不敢辞职，也不敢生病。' },
  { id: 'debt_guarantee', name: '替人担保，背上了', pri: 7, cond: s => s.flags.includes('debt'),
    line: '当初你只是签了个字。后来那个人联系不上了，银行的电话打到了你这里。' },
  { id: 'debt_medical', name: '看病的钱还没还完', pri: 7, cond: s => s.flags.includes('debt'),
    line: '那场病治好了，账单留下了。你身体恢复了，账还在按月上扣。' },
  { id: 'debt_old', name: '到老还在还', pri: 7, cond: s => s.flags.includes('debt') && s.age > 64,
    line: '退休金到账那天，先划走一笔。剩下的你算得很细，细到每一块都有去处。' },
  { id: 'debt_clear', name: '刚还清，手上还是空的', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')),
    line: '最后一笔还完你请自己吃了顿饭，点了两个菜。回家路上你才想起来，账户里没剩多少。' },
  { id: 'debt_again', name: '还完又借了一笔', pri: 7, cond: s => (s.flags.includes('debt') || s.flags.includes('mortgage')) && hasKid(s),
    line: '前一笔刚清，孩子买房差个首付。你又去银行签了一次字，这次是十年。' },

  /* ========== 四、搬来搬去（31-40）========== */
  { id: 'move_kid', name: '搬家，孩子记得门牌', pri: 6, cond: s => s.flags.includes('renter') && hasKid(s),
    line: '房子换过几处，孩子一直记得门牌。你搬一次，他们跟着改一次地址。' },
  { id: 'move_couple', name: '搬家，两个人搬惯了', pri: 6, cond: s => s.flags.includes('renter') && hasPartner(s),
    line: '东西不多，收拾起来半天就够。你们说这次是最后一次，说了三次。' },
  { id: 'move_alone', name: '搬家，一个人一个箱子', pri: 6, cond: s => s.flags.includes('renter') && !hasPartner(s),
    line: '你把要紧的东西装在一个箱子里，随时能走。这个习惯你改不掉了。' },
  { id: 'move_job', name: '跟着工作搬', pri: 6, cond: s => s.flags.includes('renter'),
    line: '哪里的活多就往哪里去。你的行李一直保持两个箱子的量，装得下就走。' },
  { id: 'move_rent_up', name: '房租涨了，又搬一次', pri: 6, cond: s => s.flags.includes('renter') && s.money < 55,
    line: '房东说要涨八百。你算了一晚上，第二天开始看房，一个月后搬到了更远的地方。' },
  { id: 'move_back', name: '搬回老地方', pri: 6, cond: s => s.flags.includes('renter'),
    line: '绕了一圈你又搬回了刚工作那片。菜市场的老板还认得你，问你这些年去哪儿了。' },
  { id: 'move_temp', name: '一直住在临时的地方', pri: 6, cond: s => s.flags.includes('renter'),
    line: '你住过隔断、住过合租、住过朋友家的沙发。你的地址换得比手机号还勤。' },
  { id: 'move_dorm', name: '住过宿舍、隔断、合租', pri: 6, cond: s => s.flags.includes('renter'),
    line: '最早是八个人的宿舍，后来是四个人，再后来一个人。房子越住越小，也越住越安静。' },
  { id: 'move_new_city', name: '刚到一个新城市', pri: 6, cond: s => s.flags.includes('renter'),
    line: '你搬来才半年，还不太认路。手机里的地图记录了你走过的一百多条街。' },
  { id: 'move_settle', name: '终于不想再搬了', pri: 6, cond: s => s.flags.includes('renter') && s.age > 64,
    line: '你把墙上的钉子都留着，说下次用得上。后来你发现，自己已经很多年没搬了。' },

  /* ========== 五、带孙辈（41-50）========== */
  { id: 'grand_full', name: '全天带孙', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '孩子把小孩送来，你比上班时还忙。晚上他们来接人，你站在门口看车走远。' },
  { id: 'grand_weekend', name: '周末接孙辈', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '小孩周末来，周日晚走。门关上以后，桌上还留着半盒没吃完的饼干。' },
  { id: 'grand_two', name: '两个孙辈，轮着带', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '一个刚会走，一个刚上小学。你在两个房间之间来回，晚上倒头就睡。' },
  { id: 'grand_far', name: '孙辈在外地，视频里见', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '你学会了用手机视频，学会的第一句话是"能看见吗"。他们在那头喊你，你应得很响。' },
  { id: 'grand_school', name: '接送上下学', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '你每天四点半站在校门口，站在同一棵树下。小孩跑出来，书包往你手里一塞。' },
  { id: 'grand_summer', name: '暑假最忙', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '一放暑假你就成了全职。你带他们去公园、去菜场、去你想去的地方，一天走一万多步。' },
  { id: 'grand_tired', name: '带得动，就是累', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '你能抱得动，但腰会疼两天。你说不累，转过身扶着桌角站了一会儿。' },
  { id: 'grand_alone', name: '一个人带孙', pri: 8, cond: s => s.flags.includes('grandparent') && (!hasPartner(s) || s.age > 66),
    line: '家里就你和小孩。你做饭的时候把他放在厨房门口，一边炒菜一边说话。' },
  { id: 'grand_grown', name: '孙辈大了，不用带了', pri: 8, cond: s => s.flags.includes('grandparent') && s.age > 68,
    line: '他们上了中学，不再需要人接。你忽然多出一大块时间，坐在沙发上不知道干什么。' },
  { id: 'grand_photo', name: '相册里全是孙辈', pri: 8, cond: s => s.flags.includes('grandparent'),
    line: '你的手机里有一千多张照片，九百张是他们。你自己的照片，最近一张是五年前的。' },

  /* ========== 六、身体要照看（51-60）========== */
  { id: 'body_meds', name: '每天一把药', pri: 7, cond: s => s.health < 56,
    line: '早上三种，晚上两种，其中一种饭前吃。你的药盒分七格，周日晚上填满。' },
  { id: 'body_check', name: '三个月复查一次', pri: 7, cond: s => s.health < 56,
    line: '日历上每三个月有一个红圈。你熟门熟路地挂号、抽血、等结果，下午四点出报告。' },
  { id: 'body_walk', name: '每天走一万步', pri: 7, cond: s => s.health < 60,
    line: '你给自己定了任务，走够一万步才回家。下雨就在地下车库绕圈，保安都认识你。' },
  { id: 'body_slow', name: '走路慢了，但还自己走', pri: 7, cond: s => s.health < 56,
    line: '别人走十分钟的路你要走二十分钟。你不让人扶，说扶了就再也自己走不了了。' },
  { id: 'body_surgery', name: '做过一次大手术', pri: 7, cond: s => s.health < 50,
    line: '手术那天你在门口把眼镜交给家人。醒来第一件事是问几点了，第二件是问结果。' },
  { id: 'body_pain', name: '阴天骨头疼', pri: 7, cond: s => s.health < 56,
    line: '你比天气预报准。早上起来膝盖发沉，你就知道下午要下雨。' },
  { id: 'body_quit', name: '戒了烟酒，改吃清淡', pri: 7, cond: s => s.flags.includes('health_wakeup'),
    line: '你把家里的酒都送了人，烟灰缸扔了。吃饭开始过水，咸一点你都能尝出来。' },
  { id: 'body_hospital', name: '住院成了常事', pri: 7, cond: s => s.health < 46,
    line: '你在同一家医院住过四次，护士换了两批。床头柜里常备一双拖鞋和一把牙刷。' },
  { id: 'body_care', name: '请了护工', pri: 7, cond: s => s.health < 50 && s.money >= 50,
    line: '护工每天来四个小时，做饭、擦身、陪你说话。她走了以后屋里会安静得有点响。' },
  { id: 'body_ok', name: '身体还行，就是不如从前', pri: 7, cond: s => s.health < 62,
    line: '你还能自己买菜、自己爬楼，只是要歇一歇。你说这叫没病，医生说这叫退化。' },

  /* ========== 七、钱不宽裕（61-70）========== */
  { id: 'tight_market', name: '菜市场收摊前去', pri: 5, cond: s => s.money < 44,
    line: '你掐着收摊的点去，那时候菜便宜。摊主认识你，会多抓一把葱。' },
  { id: 'tight_bus', name: '公交卡算好次数', pri: 5, cond: s => s.money < 44,
    line: '你算过一个月要坐几次车，充的时候只充那么多。走路能到的，你就走。' },
  { id: 'tight_no_travel', name: '没出去旅游过', pri: 5, cond: s => s.money < 44,
    line: '你这辈子没坐过飞机。别人发旅游的照片，你点个赞，说以后有机会。' },
  { id: 'tight_kid_help', name: '孩子补贴一点', pri: 5, cond: s => s.money < 44 && hasKid(s),
    line: '孩子每个月转一点钱过来，你推过两次，后来不推了。你把每一笔都记在本子上。' },
  { id: 'tight_pension', name: '靠退休金过', pri: 5, cond: s => s.money < 48,
    line: '每月十五号到账，你先把固定的几笔划出去，剩下的才敢花。' },
  { id: 'tight_work', name: '七十岁还在打零工', pri: 5, cond: s => s.money < 40,
    line: '你在小区看门、在超市理货、帮人看孩子。都是零活，一天几十块。' },
  { id: 'tight_rent', name: '房租是最大一笔', pri: 5, cond: s => s.money < 44 && s.flags.includes('renter'),
    line: '每个月工资或退休金到手，先交房租。剩下的才是生活费，你算得很快。' },
  { id: 'tight_save', name: '一块钱掰两半', pri: 5, cond: s => s.money < 38,
    line: '你不打车，不点外卖，不用新的东西。省钱这件事你做得比谁都熟练。' },
  { id: 'tight_no_doctor', name: '小病自己扛', pri: 5, cond: s => s.money < 44,
    line: '不舒服你先忍着，忍不过去才去药店买点药。医院要挂号，挂号要钱。' },
  { id: 'tight_ok', name: '钱紧，但没欠人', pri: 5, cond: s => s.money < 46,
    line: '你手头不宽裕，但从不欠账。别人借钱给你，你睡不着觉。' },

  /* ========== 八、钱还宽裕（71-80）========== */
  { id: 'easy_travel', name: '退休后走了几个地方', pri: 5, cond: s => s.money >= 60,
    line: '你把年轻时想去的地方列了个单子，退休后一个一个划掉。走得慢，但都去了。' },
  { id: 'easy_kid_down', name: '给孩子付了首付', pri: 5, cond: s => s.money >= 60 && hasKid(s),
    line: '你把自己攒的大半拿出来，给孩子付了首付。签完字你说不用还，孩子没接话。' },
  { id: 'easy_house', name: '换了个大点的房子', pri: 5, cond: s => s.money >= 62,
    line: '你换了个带阳台的房子，阳台上摆了两把椅子。你常常只坐一把。' },
  { id: 'easy_hobby', name: '学了个没用的爱好', pri: 5, cond: s => s.money >= 58,
    line: '你学了摄影、书法、或者做木工。做出来的东西堆在柜子里，你也不送人。' },
  { id: 'easy_gift', name: '给孙辈买东西不看价', pri: 5, cond: s => s.money >= 60 && hasKid(s),
    line: '你带孙辈去商场，他们要什么就买什么。女儿说你惯，你说就惯这一次。' },
  { id: 'easy_health', name: '体检做最全的那档', pri: 5, cond: s => s.money >= 58,
    line: '你每年的体检都选最贵的那套，项目多到要做两天。查出来的都是小问题，你说值。' },
  { id: 'easy_hire', name: '请人打扫，不再自己干', pri: 5, cond: s => s.money >= 60,
    line: '你请了钟点工，一周来两次。第一次她擦完厨房，你站在门口看了半天。' },
  { id: 'easy_invest', name: '还在看盘', pri: 5, cond: s => s.money >= 62,
    line: '你每天九点半坐在电脑前，看那些红绿数字。赚的不多，主要是有点事做。' },
  { id: 'easy_quiet', name: '钱够，也不太花', pri: 5, cond: s => s.money >= 58,
    line: '你的钱够用，但你花得很少。衣柜里的衣服还是十年前的款，你说穿着舒服。' },
  { id: 'easy_share', name: '聚会总是你买单', pri: 5, cond: s => s.money >= 62,
    line: '老同学聚会你总是先把单买了。有人要还你，你摆手说下次。下次还是你买。' },

  /* ========== 九、闲下来了（81-90）========== */
  { id: 'idle_kid_visit', name: '孩子每周来一次', pri: 5, cond: s => hasKid(s),
    line: '你的时间多得用不完。孩子每周来一次，你从周三就开始想做什么菜。' },
  { id: 'idle_couple', name: '两个人对着坐', pri: 5, cond: s => hasPartner(s),
    line: '你们一天说不了几句话，但知道对方在。天气好的时候一起下楼走两圈。' },
  { id: 'idle_alone', name: '一个人坐着，电视开着', pri: 5, cond: s => !hasPartner(s) && !hasKid(s),
    line: '你有大把的时间，也有大把的安静。电视常常开着，你不一定在看。' },
  { id: 'idle_walk', name: '每天下楼走两圈', pri: 5, cond: () => true,
    line: '你每天下午下楼走两圈，路线固定：出门左转，绕到小花园，再回来。' },
  { id: 'idle_tv', name: '看电视剧看到睡着', pri: 5, cond: () => true,
    line: '你追一部很长的剧，看到一半就睡着。醒来电视还在放，你倒回去重看。' },
  { id: 'idle_garden', name: '阳台上种了几盆花', pri: 5, cond: () => true,
    line: '你养了几盆好活的植物，浇水的量拿捏得很准。有一盆养了十几年，比孩子在家待得久。' },
  { id: 'idle_chess', name: '楼下下棋，输了就回家', pri: 5, cond: () => true,
    line: '你每天下午在楼下下棋，输了就说今天风大。第二天照旧去，照旧坐那个位置。' },
  { id: 'idle_nap', name: '午觉越睡越长', pri: 5, cond: () => true,
    line: '你的午觉从半小时变成两小时。醒来天快黑了，你有一瞬间不知道是早上还是晚上。' },
  { id: 'idle_call', name: '等孩子打电话', pri: 5, cond: s => hasKid(s),
    line: '你把手机音量开到最大，放在手边。有时候响的是推销，你也接起来说两句。' },
  { id: 'idle_none', name: '一天没人说话', pri: 5, cond: s => !hasPartner(s),
    line: '有一天你回想，发现自己从早到晚没跟人说过一句话。你在心里跟自己说了几句。' },

  /* ========== 十、身边有谁（91-100）========== */
  { id: 'rel_new_partner', name: '晚年有个伴', pri: 5, cond: s => hasPartner(s) && s.happy >= 56,
    line: '你们是后来才在一起的，各有各的孩子。相处得客气，也相处得踏实。' },
  { id: 'rel_old_friend', name: '还有几个老朋友', pri: 5, cond: s => s.flags.includes('warm'),
    line: '你还有三四个能随时打电话的朋友。你们一个月见一次，在一家开了很多年的小馆子。' },
  { id: 'rel_kid_near', name: '孩子住得不远', pri: 5, cond: s => hasKid(s),
    line: '孩子住在同城，开车四十分钟。你不太去打扰，他们隔一周来一趟。' },
  { id: 'rel_kid_far', name: '孩子在外地', pri: 5, cond: s => hasKid(s),
    line: '孩子在另一个城市，一年回来两次。你学会了寄东西，腊肉、干货、自己做的酱。' },
  { id: 'rel_alone_holiday', name: '过节一个人', pri: 5, cond: s => !hasPartner(s) && !hasKid(s),
    line: '过年你煮一锅饺子，吃三天。楼下的鞭炮响完，你早早就睡了。' },
  { id: 'rel_sibling', name: '跟兄弟姐妹常来往', pri: 5, cond: s => !hasKid(s),
    line: '你和兄弟姐妹住得不远，隔三差五串门。谁家做了好吃的，会端一碗过来。' },
  { id: 'rel_neighbor', name: '跟邻居处得像亲戚', pri: 5, cond: () => true,
    line: '对门那家跟你处了二十年。你家钥匙放她那儿一把，她家快递也常寄到你这儿。' },
  { id: 'rel_pet', name: '养了只猫', pri: 5, cond: s => !hasPartner(s),
    line: '你养了一只猫，它比你先醒。你给它添食的时候，它蹭你的手，蹭完就走。' },
  { id: 'rel_care_home', name: '住进了养老院', pri: 6, cond: s => s.age > 68 && s.money >= 48,
    line: '你住进了养老院，房间朝南，有护工。同屋的老太太耳朵背，你们说话都靠喊。' },
  { id: 'rel_many', name: '家里人多，吵吵闹闹', pri: 5, cond: s => hasKid(s) && hasPartner(s),
    line: '你家总是很吵：电视声、孩子声、厨房的抽油烟机。你嫌吵，一个人住的时候又嫌静。' }
]

/* ============================ 建议库 ============================ */

const ADVICE = {
  happyLow: {
    cond: s => s.happy < 45,
    title: '关于"你想要的"',
    text: '你这一生大部分时间在完成别人给的任务——父母的、公司的、社会的。不是说你错了，只是很少有一个选择是你真的想。下次做决定前，先问自己一句：如果没人知道，我还选这个吗。'
  },
  happyMid: {
    cond: s => s.happy >= 45 && s.happy < 62,
    title: '关于那点空',
    text: '你过得还行，但总有点什么东西没落到实处。这种空不是病，是提醒——它在告诉你，有些事你一直想去做，但一直在等一个"合适的时候"。合适的时候不会自己来。'
  },
  healthLow: {
    cond: s => s.health < 45,
    title: '关于身体',
    text: '你的身体替你支付了所有你没时间处理的账。建议不是"多喝热水"，是这周去做一次体检，把那个你一直不敢看的指标看了；然后把睡觉当成一件正经事，它比大多数努力都重要。'
  },
  moneyLow: {
    cond: s => s.money < 25,
    title: '关于钱',
    text: '你不太会跟钱打交道。这不是道德问题，是技能问题。具体一点：先攒下三个月的生活费，再做任何"可能赚更多"的决定；把收入的 10% 自动化存起来，不要靠意志力。'
  },
  moneyHigh: {
    cond: s => s.money > 120,
    title: '关于接下来',
    text: '你已经证明了自己能挣钱。接下来的问题不是"怎么更多"，是"除了钱，还有什么让你愿意早起"。这个问题听起来虚，但它是很多人在四十五岁那年突然垮掉的原因。'
  },
  ambLow: {
    cond: s => s.amb < 42,
    title: '关于争取',
    text: '你不是没能力，是很少为自己开口。你这辈子听过太多"算了"，其中一半是你自己说的。下次有机会的时候，试着说一句"我想试试"——哪怕声音有点抖。'
  },
  chaLow: {
    cond: s => s.cha < 45,
    title: '关于人',
    text: '你不太擅长让人记住你。这不是性格缺陷，但确实会让你多走一些路。一个具体的做法：每个月主动约一个人吃饭，不谈工作，只聊他最近在烦什么。关系是攒出来的，不是等出来的。'
  },
  familyLow: {
    cond: s => s.family < 35 && s.money > 40,
    title: '关于来处',
    text: '你和家里的关系一直有点紧。你后来走得远，某种程度上是为了离那些东西远一点。你已经做到了。如果还有机会，打个电话吧，不用说什么大道理，问问他们今天吃了什么就行。'
  },
  single: {
    cond: s => s.flags.includes('single_long') || s.flags.includes('single_by_choice'),
    title: '关于一个人',
    text: '你选择了不将就，这需要勇气，也确实会带来一些孤独的夜晚。建议你主动建三个可以打电话的人——不是恋人，是那种半夜出事能来的人。一个人过得好，靠的不是硬撑，是网。'
  },
  divorced: {
    cond: s => s.flags.includes('divorced'),
    title: '关于那段关系',
    text: '那段婚姻的结束，不代表你在这件事上失败了。它只说明你们两个人不合适，而你们都有勇气承认。别把它写进对自己的评价里，那只是一个章节。'
  },
  noRegret: {
    cond: s => s.flags.includes('no_regret'),
    title: '关于不后悔',
    text: '你说没什么想重来的。这是很少见的答案，说明你真的接受了自己。把这份接受延续下去——对还在的人好一点，对自己松一点，剩下的时间不用再证明什么。'
  },
  riskTaker: {
    cond: s => s.flags.includes('took_risk') || s.flags.includes('founder'),
    title: '关于冒险',
    text: '你愿意下注，这让你的人生密度比多数人高。但请记住一件事：能承受的亏损叫投资，不能承受的叫赌。下一次下注前，先算好"输光了还能不能过日子"，那个数就是你的上限。'
  },
  steady: {
    cond: s => !s.flags.includes('took_risk') && !s.flags.includes('founder') && s.amb < 55,
    title: '关于稳妥',
    text: '你选了安稳，这不是错。只是要留意一件事：安稳最大的风险，是它会让你在四十岁那年发现，自己已经很久没有为一件事紧张过了。找一件小事，让自己重新有点心跳。'
  }
}

/* ============================ 稀有事件彩蛋 ============================ */

const EASTER_EGGS = []

return {
  TALENTS,
  BIRTHS,
  STAGES,
  EVENTS,
  ENDINGS,
  SCENES,
  ADVICE
}

})
