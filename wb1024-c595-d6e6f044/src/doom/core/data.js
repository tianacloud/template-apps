/**
 * core/data.js —— 末日生存模拟器 · 内容层
 *
 * 世界观：「灰热症」——一种实验室泄漏的生化病毒——在四年前大爆发。
 * 高热七天，多数人挺不过去；城市先是封控，然后是秩序、电网、水网接连垮掉。
 * Day 0 指的是封城令失效的那一天。世界碎成无数个据点。
 * 你不是英雄，你只是想活过下一个冬天。
 *
 * 四个维度和人生模拟器同构，但语义换过了：
 *   health 体力   —— 病了、伤了、冻了，都从这里扣；到 0 就结束
 *   morale 心气   —— 撑下去的理由；到 0 会自己走出安全区
 *   supply 物资   —— 食物、燃料、药、子弹，统称「存货」（单位：天）
 *   camp   据点   —— 墙、水、电、人，你的根据地能扛住多少
 *
 * 游戏在「第 N 天」推进，一到冬天难度陡增（消耗加大、事件更狠）。
 *
 * UMD：node 走 module.exports，网页走 window.DoomData
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./events'), require('./events-solo'), require('./events-pool')
    )
  } else {
    root.DoomData = factory(root.DoomEvents, root.DoomEventsSolo, root.DoomEventsPool)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (EV, SOLO, POOL) {

EV = [].concat(EV || [], SOLO || [], POOL || [])

/* ============================ 天赋 ============================ */
/* effects 里的 supply / camp 是绝对量，其余是 0~100 的加减 */

const TALENTS = [
  {
    id: 'medic',
    name: '半个医生',
    desc: '你会缝合、会认药、知道发烧到什么程度该害怕。病毒扩散之后，这比文凭值钱——也危险得多，因为你摸过的每一口热锅都可能带毒。',
    effects: { health: 8 },
    flag: 'medic'
  },
  {
    id: 'mechanic',
    name: '会修东西',
    desc: '发电机、水泵、自行车、水泵的皮带。别人眼里的废铁，在你手里还能再转三年。',
    effects: { camp: 10 },
    flag: 'mechanic'
  },
  {
    id: 'hunter',
    name: '打猎的手',
    desc: '你爸带你下过套子，你后来嫌脏没再碰。手艺这东西，忘了也会自己回来。',
    effects: { supply: 10, health: 4 },
    flag: 'hunter'
  },
  {
    id: 'gardener',
    name: '种过地',
    desc: '你知道什么季节种什么，知道哪块土能出苗。别人抢罐头的时候，你在攒种子。',
    effects: { camp: 6, supply: 6 },
    flag: 'gardener'
  },
  {
    id: 'cold_blood',
    name: '下得去手',
    desc: '你不太会在关键时刻犹豫。这不是优点，但在这世道里，犹豫的人通常先死。',
    effects: { morale: 10, health: 2 },
    flag: 'cold_blood'
  },
  {
    id: 'silver_tongue',
    name: '嘴皮子利索',
    desc: '你能把没有说成有，把危险说成机会。交易、谈判、劝人，你总有话说。',
    effects: { morale: 6, camp: 4 },
    flag: 'silver_tongue'
  },
  {
    id: 'veteran',
    name: '当过兵',
    desc: '你受过训练，知道怎么站位、怎么省子弹、怎么在废墟里判断谁是威胁。',
    effects: { health: 10, morale: 6 },
    flag: 'veteran'
  },
  {
    id: 'prepper',
    name: '有点被害妄想',
    desc: '你早就囤了水、电池和一卷绷带。亲戚笑过你，现在你笑不出来，但你有水。',
    effects: { supply: 20 },
    flag: 'prepper'
  },
  {
    id: 'insomniac',
    name: '睡不着的夜',
    desc: '别人睡的时候你在巡墙。你说这是毛病，墙说这是运气。',
    effects: { health: -6, camp: 8, morale: 4 },
    flag: 'watcher'
  },
  {
    id: 'packrat',
    name: '什么都不肯扔',
    desc: '抽屉里三十年的螺丝、绳子、旧电池，全留着了。你说过总有一天用得上。',
    effects: { supply: 8, camp: 6 },
    flag: 'packrat'
  },
  {
    id: 'ordinary',
    name: '普通人',
    desc: '没什么特长。只有一双还能干活的手，和一颗不想死的心。',
    effects: {}
  }
]

/* ============================ 出身 ============================ */
/*
 * 出身决定起点：疫情失控之后你人在哪儿，身边有什么。
 * supply 与 camp 是绝对值区间，morale / health 是基准值。
 */

const ORIGINS = [
  {
    id: 'city_flat',
    tag: '城里十四楼',
    weight: 22,
    supply: [3, 7],
    camp: [8, 20],
    morale: 46,
    desc: '封城第九天电网垮了，那时你就在十四楼。电梯停在两层之间，楼道里的人戴着两层口罩喊了两小时。冰箱里的东西第三天就有了味道。',
    note: '高，但也干。水压早就没了，下楼一趟要算好带得动多少。'
  },
  {
    id: 'suburb',
    tag: '郊区的家',
    weight: 20,
    supply: [6, 12],
    camp: [14, 26],
    morale: 50,
    desc: '你家在城边，有个小院，种过葱和葡萄。封控那两个月你天天消毒门把手，放开之后你才发现，院墙挡得住走投无路的人，挡不住已经没什么可失去的人。',
    note: '有院墙、有水井的邻居、有能翻出来的工具。缺点是人来往杂，看得见你的东西的人也多。'
  },
  {
    id: 'rural',
    tag: '山里的村子',
    weight: 15,
    supply: [10, 18],
    camp: [10, 20],
    morale: 52,
    desc: '村子在山脚下，三十几户人。封路对你们来说只是电话不能打了，柴还有，地还在。病毒倒是没怎么进过山——进山的人先在山口就发起了烧。',
    note: '饿不死，但雨一大，山口的路就断了。外面的东西进不来，里面的人也出不去。'
  },
  {
    id: 'hospital',
    tag: '医院地下室',
    weight: 8,
    supply: [4, 10],
    camp: [8, 16],
    morale: 40,
    desc: '你是在隔离病房里醒来的，烧退了，同病房的没退。夜里护士举着手电查房，第二天早上医院就只剩一半的人——她们没能都挺过去。',
    note: '有药、有担架、有发电机。也有太多走不动的病人，和一屋子消毒水都盖不住的味道。'
  },
  {
    id: 'supermarket',
    tag: '超市仓库',
    weight: 7,
    supply: [22, 34],
    camp: [6, 14],
    morale: 44,
    desc: '你是最后一个从那个仓库出来的，怀里抱着两箱罐头。门是从里面锁的——你锁的。',
    note: '存货多到能吃一个季节。坏消息是，知道这儿有货的人，比罐头还多。'
  },
  {
    id: 'uniform',
    tag: '穿制服的',
    weight: 8,
    supply: [8, 14],
    camp: [16, 28],
    morale: 56,
    desc: '疫情最重的那几个月你在值勤，设卡、封路、送病人。之后电断了，对讲机再也没有响过。制服还在身上，规矩已经不在了。',
    note: '有车、有装备、有规矩。你做的事，别人还认不认，要看这世界还剩下多少规矩。'
  },
  {
    id: 'rich',
    tag: '有钱人',
    weight: 6,
    supply: [14, 22],
    camp: [20, 32],
    morale: 42,
    desc: '你有一个带地库的别墅，门是进口的。病毒爆发之后，你第一次发现钱能买到的东西，正一样一样地失效——包括当年花大价钱打的那些「疏通关系」的电话。',
    note: '墙高，门厚，存货足。代价是你一个人在里面，听得见外面所有声音。'
  },
  {
    id: 'alone',
    tag: '一无所有',
    weight: 14,
    supply: [0, 3],
    camp: [2, 8],
    morale: 34,
    desc: '封控时你已经在穷日子里熬了很久，一人吃饱全家不饿。这世界垮掉，对你的日常生活影响不大——病毒挑人不论贫富，但你本来也没什么可隔离的。',
    note: '你什么都没有，所以也没有可以失去的。这不是安慰，这是你唯一还在的东西。'
  }
]

/* ============================ 阶段 ============================ */
/* 时间轴：Day 0 → 第 1500 天（约四年多） */

const STAGES = {
  1: { name: '爆发', tip: '第一天，你只知道两件事：广播停了，街上在烧东西。' },
  2: { name: '第一个月', tip: '水停了，钱没用了，邻居开始互相打量。' },
  3: { name: '第一个冬天', tip: '第一个冬天会告诉你，谁准备好了，谁没有。' },
  4: { name: '第二个春天', tip: '草长出来了。有人开始种东西，就说明有人认为自己会活到明天。' },
  5: { name: '第二年冬天', tip: '你已经不惊讶了。你只是很累。' },
  6: { name: '第三年', tip: '活下来的人开始有新的事要烦：分东西、定规矩、谁是「我们」。' },
  7: { name: '第四年', tip: '外面来了一辆车。车轮上全是泥。没有人知道这是好处还是坏处。' },
  8: { name: '终局', tip: '' }
}

/* ============================ 事件 ============================ */
/*
 * 字段与人生模拟器一致：
 *   stage     属于哪个阶段
 *   day       发生在第几天
 *   pinned    每局必出
 *   slot      同 slot 一组轮换，每局出一
 *   enter     true = 进入这个节点的人（自带背景/资源），不是选项
 *   always    进时间线但不占配额，靠 cond 决定
 *   chance    0~1 概率（按开局属性稳定哈希）
 *   cond(s)   条件
 *   resolve(s) 无选项节点
 *   options[] { text, effects, result, resolve, flags, cond }
 *
 * effects 的键：health / morale / supply / camp / people（人数，绝对增减）
 */

/* ============================ 结局 ============================ */
/*
 * 结局 = 终局形态（35 种）× 你最后的处境（36 种）= 1260 种组合
 * match(s, sc)；sc = { survive, health, morale, supply, camp, total, days }
 * pri 越高越「稀有/越该被优先命中」
 */

const hasPartner = s => (s.flags || []).some(f =>
  f === 'partner' || f === 'partner_comrade' || f === 'partner_late')
const hasKid = s => (s.flags || []).some(f => f === 'has_kid' || f === 'adopted_kid')
const F = (s, f) => (s.flags || []).indexOf(f) >= 0

const ENDINGS = [
  /* ===== 一、没活下来（1-8）===== */
  { id: 'starve', pri: 10, title: '饿死的那个冬天', family: 'death',
    match: (s, sc) => sc.death === 'supply',
    desc: '最后那十天你什么都吃过了：皮带、树皮、煮过三遍的骨头。人不是一下饿死的，是一天比一天更懒得动，直到有一天不想再睁眼。你没有做错什么。你只是离所有能吃的太远。' },
  { id: 'froze', pri: 10, title: '冻在墙根底下', family: 'death',
    match: (s, sc) => !sc.survive && sc.death === 'health' && (s._coldDamage || 0) >= 8,
    desc: '那晚你烧掉了最后一本书。火灭了以后，你靠在墙上，觉得只要不动，就不冷。天亮了，来找你的人说，你身上落了一层霜。' },
  { id: 'sickness', pri: 9, title: '一场没熬过去的病', family: 'death',
    match: (s, sc) => sc.death === 'health' && (s._coldDamage || 0) < 8 &&
      !F(s, 'camp_sacked'),
    desc: '开始只是咳嗽。后来你咳得说不完整一句话，躺着也像在爬山。没有药，没有抗生素，没有一个能睡着的地方。你走的时候还不到三十九度——跟病毒带走大多数人的方式一样，安静，很快。' },
  { id: 'killed', pri: 9, title: '死在认识的人手上', family: 'death',
    match: (s, sc) => !sc.survive && sc.death === 'health' && F(s, 'camp_sacked') &&
      sc.days > 200,
    desc: '门是被熟人叫开的。他们知道你的作息、知道你把枪放在哪、知道你们只有两个人。倒下去的那几秒你想的不是恨，是「原来是他」。' },
  { id: 'gave_up', pri: 8, title: '自己走出来的', family: 'death',
    match: (s, sc) => sc.death === 'morale',
    desc: '没有人赶你走。是你自己把门从外面带上，往林子里走的。你把水和最后半块饼留在了桌上——你还记得怎么做一个人，这点体面比命重要。' },
  { id: 'road', pri: 7, title: '路边的无名者', family: 'death',
    match: (s, sc) => !sc.survive && sc.days < 400,
    desc: '你死在路上，可能是任何一个地方。有人路过，翻走了你的鞋，又替你盖了张塑料布。没人知道你叫什么。这世道，很多人死的时候什么都没留下。' },
  { id: 'small_death', pri: 6, title: '一个小伤口', family: 'death',
    match: (s, sc) => !sc.survive && F(s, 'wounded'),
    desc: '你划破手的时候还笑了一声，说没事。第七天手肿了，第十天你开始说胡话。这世界杀人的方式很朴素：让你身上破一个小口子，然后没有药。' },
  { id: 'died_late', pri: 8, title: '撑到最后的那个也没撑住', family: 'death',
    match: (s, sc) => !sc.survive && sc.days >= 900,
    desc: '你撑过了两个冬天，学会了种地，遇见过好人，也送走过他们。然后在一个听着很平常的早晨，你没能从被窝里坐起来。活下去这件事，做对了也未必有回报。' },

  /* ===== 二、活下来了，方式（9-16）===== */
  { id: 'alone_survivor', pri: 8, title: '活下来，一个人', family: 'lonely', avoid: 'crowd',
    match: (s, sc) => sc.survive && sc.people <= 1,
    desc: '第四年冬天你还有一间屋子、足够的柴、一缸腌菜。你开始跟自己说话，后来发现说得很顺。全部活下来的代价是，没有一个能听你说这话的人。' },
  { id: 'small_commune', pri: 8, title: '一个院子，几十口人', family: 'crowd', avoid: 'lonely',
    match: (s, sc) => sc.survive && sc.people >= 4 && sc.camp >= 50,
    desc: '你们把几家的墙打通，共用一口井、一个灶、一份名单。谁值夜、谁种地、谁带孩子，全写在门后的木板上。吵得最凶的那两个人，后来一起守了三回北墙。' },
  { id: 'farm', pri: 8, title: '种出粮食的人', family: 'settle',
    match: (s, sc) => sc.survive && (F(s, 'farm') || F(s, 'gardener')),
    desc: '第一年你种下的土豆全烂了，第二年收了一筐，第三年你们吃不完。你以为自己养成了一片地，其实是那片地把你留下了。' },
  { id: 'trader', pri: 7, title: '跑线的人', family: 'trade',
    match: (s, sc) => sc.survive && (F(s, 'trader') || F(s, 'route')),
    desc: '你熟悉这一带每一条不塌的路。你卖盐、卖药、卖消息，也卖过不该卖的东西一次，之后就不卖了。人们管你叫「那个跑线的」，没人问过你的名字。' },
  { id: 'doctor_end', pri: 8, title: '这地方唯一的医生', family: 'skill',
    match: (s, sc) => sc.survive && (F(s, 'medic') || F(s, 'clinic')),
    desc: '你的手艺是用一把缝衣针、半瓶酒精和一本旧书撑起来的。你没治好过多少人，但你让更多人死得不那么难看。这里的孩子见了你会喊「大夫」，其实你连执照都没有。' },
  { id: 'warlord', pri: 7, title: '从收容者变成的统治者', family: 'power',
    match: (s, sc) => sc.survive && F(s, 'armed') && F(s, 'ruled'),
    desc: '一开始你只是让墙里的人吃饱。后来你开始决定谁能进这道门。再后来，你没问过别人的意见。活下来的人说这世道需要你，说这话的时候，他们没看你的眼睛。' },
  { id: 'keeper', pri: 7, title: '守门人', family: 'duty',
    match: (s, sc) => sc.survive && F(s, 'guard') && !F(s, 'ruled'),
    desc: '你在门口站了四年。你放过人进来，也把人拦在外面，其中有一次拦的是个抱孩子的女人。这件事你后来每年冬天都会想一遍。你还活着，而且你还是你。' },
  { id: 'wild', pri: 7, title: '进了山就没回来', family: 'wild',
    match: (s, sc) => sc.survive && sc.people <= 1 && sc.camp < 34 && F(s, 'killed_first'),
    desc: '你在山里搭了个棚子，一共见过四个人，其中两个是要抢你的。你的手比四年前稳，话比四年前少。有人说这叫退化，你只是觉得这样挺好。' },

  /* ===== 三、活下来，也失去了（17-24）===== */
  { id: 'broke_apart', pri: 8, title: '我们没能一起活下来', family: 'loss',
    match: (s, sc) => sc.survive && sc.people <= 2 &&
      (F(s, 'left_behind') || F(s, 'lost_child') || F(s, 'buried_someone')),
    desc: '不是你一个人活下来的，是「只有你」活下来的。你保留了他的鞋、她的杯子、孩子的一个玩具车。这些东西在第四个冬天变得很重，你还是没扔。' },
  { id: 'betray', pri: 7, title: '被自己人卖了', family: 'loss',
    match: (s, sc) => sc.survive && F(s, 'betrayed'),
    desc: '他们把仓库的位置卖了，换了一张进别的营地的介绍信。你后来再没见过他们。你发现自己不恨，只是从此听人说话时，会先看他的手。' },
  { id: 'hands_dirty', pri: 7, title: '手上有点洗不掉的东西', family: 'moral',
    match: (s, sc) => sc.survive && (F(s, 'killed_first') || F(s, 'killed_man')) && sc.morale < 58,
    desc: '你告诉自己那是为了活下去。这话当时是真的。但夜里你还是会想起那个人倒下时看着你的眼神——他大概也跟自己说过一样的话。' },
  { id: 'no_words', pri: 7, title: '不记得自己叫过什么', family: 'moral',
    match: (s, sc) => sc.survive && sc.morale < 40,
    desc: '你没有变成野兽，只是慢慢不说话了。有一天别人问你叫什么，你愣了一下才想起来。名词都还在，形容词丢了。' },
  { id: 'orphans', pri: 7, title: '养了一群不是自己的孩子', family: 'crowd',
    match: (s, sc) => sc.survive && F(s, 'orphans'),
    desc: '他们最开始只是来要水。后来有个小的夜里做噩梦，你拍了拍他。现在有五个。你每天最大的压力是让他们别吵架，最大的成就也是。' },
  { id: 'lost_person', pri: 7, title: '那个人没等到', family: 'loss',
    match: (s, sc) => sc.survive && hasPartner(s) && sc.people <= 2 && sc.morale < 60,
    desc: '你答应过去找她。你找了。你在第 641 天到过那条街，那时候房子已经烧了，什么都不剩。你在那里坐了一下午，然后回来，继续找办法活。' },
  { id: 'sold_out', pri: 6, title: '把别人交出去换了自己', family: 'moral',
    match: (s, sc) => sc.survive && F(s, 'sold_out'),
    desc: '你只说了一个地址，就能带着东西安全地走。那天之后你确实活得更久，也睡得更少。这不是你变坏了，是你选了一种能忍的坏事。' },
  { id: 'quiet_guilt', pri: 6, title: '活下来了，但没救身边人', family: 'moral',
    match: (s, sc) => sc.survive && F(s, 'left_behind'),
    desc: '你听见了敲门声，你把灯关了。你自己也说不清那天是谁在外面。有些决定一辈子只要做一次，就能定义你后来所有的夜晚。' },

  /* ===== 四、活下来，身份与手艺（25-30）===== */
  { id: 'smith', pri: 6, title: '会用废铁造东西的人', family: 'skill',
    match: (s, sc) => sc.survive && (F(s, 'mechanic') || F(s, 'smith')),
    desc: '你用报废汽车的电瓶攒出过一个能给电台供电的东西。有人拿半扇猪肉换你修一台水泵。你觉得这四年比之前二十年在公司里干的任何一件事都实在。' },
  { id: 'teacher_end', pri: 6, title: '教小孩认字的人', family: 'skill',
    match: (s, sc) => sc.survive && F(s, 'has_kid') && sc.morale >= 55 && sc.camp >= 40,
    desc: '你在一块水泥墙上用炭写字，来听课的最多时有十一个。他们最先学会的是自己的名字，然后是「水」「药」「危险」。你说过一句话：字是文明留下的最后一根绳子。' },
  { id: 'radio', pri: 6, title: '电台里那个声音', family: 'signal',
    match: (s, sc) => sc.survive && F(s, 'radio'),
    desc: '每晚八点你开十分钟，念天气、念路况、念谁在找谁。你不知道有多少人在听。第四年春天，有个北边的营地回话了。你握着话筒，半天没说出第一个字。' },
  { id: 'bunker_keeper', pri: 6, title: '地堡的看门人', family: 'settle',
    match: (s, sc) => sc.survive && F(s, 'bunker'),
    desc: '你守着一个人防工程，门厚三十公分。里面够住四十个人，你收了十七个。你定下的第一条规矩是：任何人不得从里面把门反锁。' },
  { id: 'nurse', pri: 6, title: '学会了打针的人', family: 'skill',
    match: (s, sc) => sc.survive && F(s, 'nurse_skill'),
    desc: '你不是医生，但你会在没有电的情况下给伤口清创、会把一支药分成三份用、会判断哪个人已经不用救了。这几件事都不是学的，是没办法了。' },
  { id: 'ferry', pri: 5, title: '渡口的那个人', family: 'duty',
    match: (s, sc) => sc.survive &&
      (F(s, 'helped_neighbor') || F(s, 'saved_one') || F(s, 'stayed_with_weak')) &&
      sc.camp >= 45,
    desc: '你在河边守一条船，帮人过河，收一点东西，从不多收。有人问你为什么不去更安全的地方，你说总得有人在河这边等着。' },

  /* ===== 五、道路尽头的可能性（31-36）===== */
  { id: 'grid_back', pri: 5, title: '灯亮了', family: 'hope',
    match: (s, sc) => sc.survive && F(s, 'grid'),
    desc: '第 1 402 天晚上，屋里的灯泡亮了两秒，又灭了。你们一百多号人站在院子里，谁都没说话。后来那一带每天能亮四小时。人类要回来了，慢得非常不像话，但它确实在回来。' },
  { id: 'caravan', pri: 5, title: '跟着车队走了', family: 'hope',
    match: (s, sc) => sc.survive && (F(s, 'caravan') || F(s, 'joined_caravan')),
    desc: '车队的领队说，他们在找地方重建。你把自己的名字写在他们的本子上，签的时候手有点抖——已经四年没写过这个名字了。' },
  { id: 'home', pri: 6, title: '把家重新点亮了一次', family: 'hope',
    match: (s, sc) => sc.survive && F(s, 'home_light'),
    desc: '你用一块太阳能板、两个旧电瓶和一串灯，在病毒爆发四周年的那天把家点亮了一晚上。那晚邻居们都出来了。有人哭了，然后自己也说不清为什么哭。' },
  { id: 'ordinary_good', pri: 7, title: '没有故事的人活下来了', family: 'plain',
    match: (s, sc) => sc.survive && !F(s, 'ruled') && !F(s, 'betrayed') && sc.morale >= 55,
    desc: '你没当过头，没杀过人，没救过谁，也没害过谁。你只是每天起来，修一点东西，存一点东西，对人客气一点。四年后你还站着。这世道里，「普通地活下来」已经是一项成就。' },
  { id: 'last_one', pri: 6, title: '最后一个记得的人', family: 'plain',
    match: (s, sc) => sc.survive && sc.days >= 1400 && sc.people <= 3,
    desc: '你记得封城那天城里有哪些店，记得哪个路口有一棵银杏，记得原来的人怎么过节。这些事现在只有你记得了。你把它们写在一个本子上，怕自己也会忘。' },
  { id: 'still_here', pri: 4, title: '还在这里', family: 'plain',
    match: (s, sc) => sc.survive,
    desc: '第四年秋天，你坐在门口削一根木头。太阳很好，腌菜在缸里，柴堆到屋檐。世界没有变好，你也说不上赢了。只是今天还活着，明天再想明天的事。' }
]

/* ============================ 处境 ============================ */
/*
 * 结局的第二半：你活到什么状态/死在哪一步。
 * 每 6 条一组：墙 / 人 / 粮 / 心 / 死地 / 光
 */

const PLIGHTS = [
  /* 一、墙（1-6）*/
  { id: 'p_wall', name: '墙还在，人也还在', pri: 6,
    cond: (s, sc) => sc.survive && sc.camp >= 55,
    line: '你修了三年的墙还立着，裂缝用水泥和碎砖填过，丑，但结实。门是新的，是你自己钉的。' },
  { id: 'p_wall_fall', name: '墙塌过两次', pri: 6,
    cond: (s, sc) => sc.survive && sc.camp >= 35 && sc.camp < 55,
    line: '那堵墙塌过两次，一次是被推的，一次是被炸的。第二次之后你把它修得矮了点——太高的墙，守不过来。' },
  { id: 'p_no_wall', name: '没有墙，只有习惯', pri: 6,
    cond: (s, sc) => sc.survive && sc.camp < 35,
    line: '你没有墙。你有的是一个大家默认的规矩：天黑不走这条街，有事敲三下门。规矩比墙薄，但它撑了四年。' },
  { id: 'p_gate', name: '门口那块木板', pri: 6,
    cond: (s, sc) => sc.survive && F(s, 'guard'),
    line: '门口挂着一块木板，上面用刀刻了四条规矩。第一条是：带枪的人不得入内。第五条是三年后加上去的：不管谁家的孩子，先给水。' },
  { id: 'p_bunker_plight', name: '地下三十阶', pri: 5,
    cond: (s, sc) => sc.survive && F(s, 'bunker'),
    line: '你住在人防工程里，下三十阶台阶，开两道门。里面恒温，听得见自己的呼吸。你上地面的时候会先在门口站一会儿，等眼睛适应。' },
  { id: 'p_warehouse', name: '仓库改的家', pri: 5,
    cond: (s, sc) => sc.survive && (F(s, 'warehouse') || F(s, 'supermarket')),
    line: '你住在原来的仓库里，货架改成了隔断，叉车电瓶接了三盏灯。地方太大，冬天烧不暖，你们就用塑料布吊了个小顶棚。' },

  /* 二、人（7-12）*/
  { id: 'p_many', name: '一屋子人', pri: 6,
    cond: (s, sc) => sc.survive && sc.people >= 8,
    line: '屋里总有声音：有人咳嗽、有人磨刀、有孩子在学走路。你已经很久没有一个人待过一整天了。' },
  { id: 'p_few', name: '四五个人', pri: 6,
    cond: (s, sc) => sc.survive && sc.people >= 3 && sc.people < 8,
    line: '你们一共四五个人，分工早就默契了。谁起得早谁烧水，谁手稳谁切东西。说话不用说完，剩下半句对方接得上。' },
  { id: 'p_two', name: '两个人', pri: 6,
    cond: (s, sc) => sc.survive && sc.people === 2,
    line: '你和另一个人。两个人守一栋房子是够的，就是吵架了也没地方躲。后来你们学会了一件事：吵完总要有人先烧水。' },
  { id: 'p_one', name: '一个人', pri: 7,
    cond: (s, sc) => sc.survive && sc.people <= 1,
    line: '你一个人住，一个人吃饭，一个人值夜。你开始在干活的时候跟自己说话，说得还很连贯。' },
  { id: 'p_kid_plight', name: '屋里有个小的', pri: 6,
    cond: (s, sc) => sc.survive && hasKid(s),
    line: '孩子不知道这个世界以前有电。你给他描述过路灯、电梯、超市，他听着像童话，问了一句「那为什么不回去住」。' },
  { id: 'p_love', name: '有个人一起活', pri: 6,
    cond: (s, sc) => sc.survive && hasPartner(s),
    line: '你们没有办过任何仪式。有一天你病了，她守了你两夜，你就知道这事定下来了。' },

  /* 三、粮（13-18）*/
  { id: 'p_full', name: '缸满柴足', pri: 5,
    cond: (s, sc) => sc.survive && sc.supply >= 55,
    line: '柴堆到了屋檐，腌菜有二十几缸，粮放在防潮的铁桶里。你不爱说话了，但你会数东西，一天数一遍才安心。' },
  { id: 'p_enough', name: '够吃到开春', pri: 6,
    cond: (s, sc) => sc.survive && sc.supply >= 30 && sc.supply < 55,
    line: '粮食刚好够吃到明年三月。你把这个数字刻在灶边的墙上，每吃一顿就刮掉一道。' },
  { id: 'p_thin', name: '一天一顿', pri: 6,
    cond: (s, sc) => sc.survive && sc.supply < 30,
    line: '一天一顿，晚上那顿是稀的。你已经瘦到能数清自己的肋骨，走路会慢半拍，但你没倒下。' },
  { id: 'p_grow', name: '地里还有东西', pri: 5,
    cond: (s, sc) => sc.survive && (F(s, 'farm') || F(s, 'gardener')),
    line: '你就是靠那块地活的。土豆、萝卜、南瓜，种子是从三个不同的地方省下来的。谁动你的地，你会真的动手。' },
  { id: 'p_trade_plight', name: '靠换东西活着', pri: 5,
    cond: (s, sc) => sc.survive && F(s, 'trader'),
    line: '家里存货不多，但你认识的人多。一句话、半包盐、一条没被封的路，都能换东西。这买卖比种地省力，也比种地危险。' },
  { id: 'p_hungry_edge', name: '饿到看见幻觉', pri: 7,
    cond: (s, sc) => !sc.survive && sc.death === 'supply',
    line: '最后那几天你看见过不该看见的东西：厨房里有人的影子，一碗热汤，你妈在叫你吃饭。' },

  /* 四、心（19-24）*/
  { id: 'p_calm', name: '心里还安静', pri: 6,
    cond: (s, sc) => sc.survive && sc.morale >= 60,
    line: '你还能坐下来听风。这在第四年是很少见的事。多数人坐不住，一坐下就想起来自己失去了什么。' },
  { id: 'p_numb', name: '已经麻了', pri: 6,
    cond: (s, sc) => sc.survive && sc.morale >= 40 && sc.morale < 60,
    line: '你不再为听到的坏消息心跳加快了。这不是坚强，是身体替你关掉了一部分。' },
  { id: 'p_hollow', name: '心里空了一块', pri: 6,
    cond: (s, sc) => sc.survive && sc.morale < 40,
    line: '你干活、吃饭、睡觉，都做得很正常。只是没有任何一件事会让你觉得「明天值得」。' },
  { id: 'p_guilt_plight', name: '有些事不敢想', pri: 7,
    cond: (s, sc) => sc.survive && (F(s, 'killed_first') || F(s, 'left_behind') || F(s, 'sold_out')),
    line: '你有一件从来不讲的事。白天它不出来，晚上它就在枕头边上等你。' },
  { id: 'p_together', name: '有人一起笑过', pri: 6,
    cond: (s, sc) => sc.survive && F(s, 'laughed'),
    line: '有一个晚上，爆发以来第一次，你们笑到停不下来。起因是有人把一只马桶当椅子坐了。那天之后你才确定，自己还活着，不只是在喘气。' },
  { id: 'p_morale_zero', name: '最后一夜是自己走出去的', pri: 7,
    cond: (s, sc) => !sc.survive && sc.death === 'morale',
    line: '你在桌上留了水和饼，把门带上。雪把脚印盖掉了，谁也不知道你往哪个方向走的。' },

  /* 五、死地（25-30）*/
  { id: 'p_corner', name: '一个角落', pri: 6,
    cond: (s, sc) => !sc.survive && sc.death === 'health',
    line: '你最后的几天是在一间屋子的角落里过的。有人给你盖了毯子，你说了声谢谢，声音很小。' },
  { id: 'p_wall_death', name: '墙下面', pri: 6,
    cond: (s, sc) => !sc.survive && sc.death === 'raid',
    line: '你倒在门口，手还搭在门闩上。事后有人来收东西，说你大概是没来得及把门插上。' },
  { id: 'p_cold_death', name: '冷的那个位置', pri: 6,
    cond: (s, sc) => !sc.survive && sc.death === 'cold',
    line: '你靠在灶边，火是灭的。你的手一直伸向灶口，那个动作没能完成。' },
  { id: 'p_road_death', name: '在路上', pri: 6,
    cond: (s, sc) => !sc.survive && sc.days < 400,
    line: '你倒在一条空路上，身边是一个只装了半瓶水的包。天上有很多星星，你在城里从来没见过这么多。' },
  { id: 'p_season_death', name: '第四个冬天', pri: 6,
    cond: (s, sc) => !sc.survive && sc.days >= 900,
    line: '你已经熬过三个冬天，你知道怎么熬。只是这一次，身体没有同意。' },
  { id: 'p_kid_death', name: '没能护住的那个', pri: 8,
    cond: (s, sc) => !sc.survive && F(s, 'lost_child'),
    line: '最后你想起来的是那个孩子。你没有护住。你后来活了很久，但这件事一直没过去。' },

  /* 六、光（31-36）*/
  { id: 'p_dawn', name: '早上的光', pri: 5,
    cond: (s, sc) => sc.survive && sc.morale >= 55,
    line: '早上的光从窗子照进来，落在墙上的斧子和一本翻烂的旧小说上。这两个东西放在一起，很像你这四年的全部。' },
  { id: 'p_litan', name: '夜里那盏灯', pri: 5,
    cond: (s, sc) => sc.survive && F(s, 'home_light'),
    line: '你装了灯。每天晚上六点开，十点关，只为了让人远远看见这里有电。有人摸黑走了十几公里过来，就为了看一眼灯泡。' },
  { id: 'p_radio_plight', name: '那十分钟', pri: 5,
    cond: (s, sc) => sc.survive && F(s, 'radio'),
    line: '晚上八点，你打开电台。那段话说得不好听，但你每天都说完。说完了以后，屋子会安静得有点可怕。' },
  { id: 'p_music', name: '一把还能响的吉他', pri: 5,
    cond: (s, sc) => sc.survive && F(s, 'music'),
    line: '有人从一栋烧过的房子里翻出一把吉他。弦少了两根，你弹会了三首。每次弹都不在调上，每次弹都有人围过来。' },
  { id: 'p_star', name: '抬头有星', pri: 5,
    cond: (s, sc) => sc.survive,
    line: '没有光污染的夜空好看得像假的。你每晚出门看一会儿，这是你唯一还保留着的、属于疫情之前那个自己的习惯。' },
  { id: 'p_last_word', name: '最后一句写在墙上', pri: 5,
    cond: (s, sc) => !sc.survive,
    line: '你在墙上留过一行字，是用炭写的：这里住过人。' }
]

/* ============================ 建议 ============================ */
const ADVICE = {
  supplyLow: {
    title: '关于囤东西',
    cond: s => s.supply < 20,
    text: '你的问题不是运气，是余量。任何物资按「能撑三十天」来备，而不是「够这个星期」。真正拖垮人的往往不是大灾难，是第三周才发现家里没有盐。'
  },
  moraleLow: {
    title: '关于撑下去',
    cond: s => s.morale < 40,
    text: '心气垮掉比饿死更快。给自己定一件每天必须做完的小事——扫地、修一个东西、给一个人留句话。人不是靠希望活着的，是靠「今天还有事要做」。'
  },
  campLow: {
    title: '关于墙和门',
    cond: s => s.camp < 30,
    text: '门是第一道命。把门加固到能顶住三个人的重量，比多三箱罐头有用。所有的强盗都没耐心——推不开就会走。'
  },
  alone: {
    title: '关于一个人',
    cond: s => s.people <= 1,
    text: '一个人能撑过第一个夏天，撑不过第二个冬天：不是因为打不过，是因为病了没人替你守夜。找一个可以信任的人，代价大，但没有替代方案。'
  },
  tooKind: {
    title: '关于好心',
    cond: s => s.flags.includes('helped_everyone'),
    text: '你救过很多人，这很好，也确实让你付出了代价。下次记住：帮人要留够自己的那一份。救别人的前提是你还活着。'
  },
  tooHard: {
    title: '关于底线',
    cond: s => s.flags.includes('killed_man'),
    text: '你动过手，这是这世道的常态，别假装没有。但也别让这件事成为你的全部。找一个夜里能睡着的理由，比找一支枪重要。'
  },
  partner: {
    title: '关于身边的人',
    cond: s => !hasPartner(s) && s.people >= 2,
    text: '你在最难的时候一个人扛下来了。可以试试把一部分事交给别人——不是软弱，是让这个据点在你生病的时候还能转。'
  },
  fallback: [
    {
      title: '关于储备',
      text: '水按每人每天三升算，永远备够两周。乱起来之后最先崩的从来不是粮食，是水——城市里的水是靠泵打上楼的，电一停、管一锈，水就断了。也别忘了消毒：这个世道，一碗脏水杀的人和病毒一样多。'
    },
    {
      title: '关于人',
      text: '一个人守不住任何东西。至少要有一个能替你在凌晨三点站着的人，这个人不需要很强，只需要在。'
    },
    {
      title: '关于日子',
      text: '活下来不难，难的是活得还像个人。给你自己留一件「没用的事」：一本书、一把吉他、一块糖。那是你不出门的原因。'
    }
  ]
}

return {
  TALENTS,
  ORIGINS,
  STAGES,
  EVENTS: EV,
  ENDINGS,
  PLIGHTS,
  ADVICE,
  hasPartner,
  hasKid
}

})
