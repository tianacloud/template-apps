/**
 * core/data.js —— 办公室模拟器 · 内容层
 * 引擎不认识「职场」，只认识效果。所有文案、公司、结局都在这里。
 * UMD：小程序走 module.exports，网页走 window.OfficeData
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./events'), require('./events-extra'), require('./events-pool'))
  } else {
    root.OfficeData = factory(root.OfficeEvents, root.OfficeEventsExtra, root.OfficeEventsPool)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (EVENTS, EXTRA, POOL) {

EVENTS = [].concat(EVENTS || [], EXTRA || [], POOL || [])

/* ============================ 天赋 ============================ */

const TALENTS = [
  {
    id: 'ppt', pri: 6,
    name: 'PPT 圣手',
    desc: '同样一页纸，你排出来就是比别人的贵。领导说不出哪里好，但每次汇报都要你去。',
    effects: { rep: 10, skill: 6 },
    flag: 't_ppt'
  },
  {
    id: 'drink', pri: 5,
    name: '酒量好',
    desc: '别人喝到脸红，你还能替领导挡一杯。这本事没人写进岗位要求，但年年都用得上。',
    effects: { rep: 8, mind: -4 },
    flag: 't_drink'
  },
  {
    id: 'code', pri: 7,
    name: '代码洁癖',
    desc: '看到别人的烂代码，你手会痒。这让你在前三年非常值钱，也让你在第五年非常累。',
    effects: { skill: 12, mind: -3 },
    flag: 't_code'
  },
  {
    id: 'sweet', pri: 7,
    name: '嘴甜',
    desc: '你叫得出每个人的名字，记得住前台换了几任。这不是拍马屁，这是天赋。',
    effects: { rep: 14 },
    flag: 't_sweet'
  },
  {
    id: 'numb', pri: 6,
    name: '钝感力',
    desc: '被当众批评完，你还能去茶水间泡一杯茶。别人说你没心没肺，你说这样睡得着。',
    effects: { mind: 14 },
    flag: 't_numb'
  },
  {
    id: 'grind', pri: 6,
    name: '卷王体质',
    desc: '你不太需要下班。这不是热爱，是你一停下来就慌。',
    effects: { skill: 8, rep: 4, mind: -10 },
    flag: 't_grind'
  },
  {
    id: 'memory', pri: 5,
    name: '过目不忘',
    desc: '三个月前会上谁说过一句话，你记得原话。这让你在扯皮时非常好用，也让你记住太多不该记的。',
    effects: { skill: 9 },
    flag: 't_memory'
  },
  {
    id: 'face', pri: 6,
    name: '脸皮厚',
    desc: '被拒绝一次对你来说不算事。你能连着找同一个人五次，第五次他答应了。',
    effects: { rep: 6, mind: 8 },
    flag: 't_face'
  },
  {
    id: 'english', pri: 4,
    name: '英语好',
    desc: '你能在电话会上听懂对方那句玩笑，也能听出那不是玩笑。',
    effects: { skill: 7, rep: 4 },
    flag: 't_english'
  },
  {
    id: 'pretend', pri: 8,
    name: '会装忙',
    desc: '你打开三个表格、两个文档、一个监控面板，看起来比谁都忙。实际上你在等下班。',
    effects: { rep: 8, mind: 6 },
    flag: 't_pretend'
  },
  {
    id: 'luck', pri: 5,
    name: '贵人缘',
    desc: '总有人在关键时刻想起你。你也说不清为什么，可能是你每次都说「行，我试试」。',
    effects: { luk: 18 },
    flag: 't_luck'
  },
  {
    id: 'ordinary', pri: 3,
    name: '没什么特别的',
    desc: '能力一般，人缘一般，心态还行。公司里大部分人都是这样，包括你楼上的总监。',
    effects: { mind: 4 }
  }
]

/* ============================ 公司 ============================ */

const COMPANIES = [
  {
    id: 'bigtech',
    tag: '大厂螺丝钉',
    weight: 20,
    salary: 13,
    cost: 6.5,
    skill: [40, 58],
    rep: [22, 40],
    mind: [48, 66],
    money: [0, 6],
    flags: ['bigtech', 'city_tier1'],
    desc: '入职那天，你在前台排了二十分钟队领工牌。HR 说这栋楼里有八千个人，你记不住任何一个的名字。你的工位在十七层靠窗，正对着一台饮水机。',
    note: '钱多，人多，位子少。你要在这里证明自己不是那八千分之一。'
  },
  {
    id: 'foreign',
    tag: '外企白领',
    weight: 14,
    salary: 10,
    cost: 6,
    skill: [38, 54],
    rep: [34, 50],
    mind: [58, 74],
    money: [1, 8],
    flags: ['foreign', 'city_tier1', 'work_life'],
    desc: '办公室在写字楼二十三层，地毯很厚，走路没有声音。你的英文名印在工位上，中文名只在合同里出现。第一天下午三点，全楼层的人一起去茶水间吃蛋糕。',
    note: '这里讲流程、讲边界、讲「下班后不打扰」。也讲总部一个邮件就能撤掉整个部门。'
  },
  {
    id: 'soe',
    tag: '国企合同工',
    weight: 17,
    salary: 6.5,
    cost: 4,
    skill: [30, 46],
    rep: [38, 56],
    mind: [56, 72],
    money: [1, 8],
    flags: ['soe', 'city_tier2'],
    desc: '你的工位在机关楼三层，桌上有一个搪瓷杯，是上一任留下来的。办公室四个人，平均年龄四十六。主任带你认了一圈门，最后说：小同志，先学会倒水。',
    note: '这里升得慢，但不太会掉下去。你要学会的不是业务，是谁在什么时候说什么话。'
  },
  {
    id: 'startup',
    tag: '创业公司十七号员工',
    weight: 16,
    salary: 9,
    cost: 5.5,
    skill: [42, 60],
    rep: [24, 42],
    mind: [46, 64],
    money: [0, 5],
    flags: ['startup', 'city_tier1', 'equity'],
    desc: '公司在产业园一栋旧楼的四层，会议室是用玻璃隔出来的。你入职那天只有十五个人，老板亲自给你装了电脑。他说：我们现在小，但明年这个时候，这层楼不够坐。',
    note: '你可能拿到期权，也可能拿到一张欠条。这里没有流程，所有事都是「你先顶一下」。'
  },
  {
    id: 'small',
    tag: '二十人的小公司',
    weight: 15,
    salary: 5.5,
    cost: 4,
    skill: [32, 50],
    rep: [28, 46],
    mind: [50, 68],
    money: [0, 4],
    flags: ['small', 'city_tier2'],
    desc: '公司在居民楼改的办公室里，厕所要跟隔壁公司共用。老板的办公桌就在你背后，他打电话你全听得见。第一天他给你一把钥匙，说以后你来得早就你开门。',
    note: '这里什么都干，什么都不精。好处是你很快会知道自己值多少钱。'
  },
  {
    id: 'gov',
    tag: '事业单位合同工',
    weight: 10,
    salary: 5,
    cost: 3.5,
    skill: [26, 42],
    rep: [40, 58],
    mind: [58, 76],
    money: [0, 5],
    flags: ['gov_contract', 'city_tier3', 'work_life'],
    desc: '你在一家事业单位做合同工，工位在二楼走廊尽头。编制内的人开会不叫你，但材料都是你写。第一天，隔壁大姐告诉你：咱们这儿，干得好不如坐得久。',
    note: '你不在编制里，但你在场。这种位置最磨人：看得见天花板，也看得见退休。'
  },
  {
    id: 'family',
    tag: '亲戚的公司',
    weight: 8,
    salary: 6,
    cost: 4,
    skill: [28, 44],
    rep: [42, 60],
    mind: [52, 70],
    money: [1, 6],
    flags: ['family_firm', 'city_tier2'],
    desc: '你舅舅把你安排进了他的公司，岗位叫「总经办助理」。同事对你客气得不正常，没人给你派活，也没人跟你说真话。第一天中午，你舅舅在饭桌上说：先从看着学。',
    note: '你有一个别人没有的起点，也有一笔别人不用还的账。'
  }
]

/* ============================ 阶段 ============================ */

const STAGES = {
  1: { name: '试用期', tip: '你还在证明自己配得上这张工牌。' },
  2: { name: '第一年', tip: '你学会了在群里回「收到」，也学会了什么时候不回。' },
  3: { name: '第三年', tip: '你开始分得清，哪些事是工作，哪些事只是有人想让你做。' },
  4: { name: '分水岭', tip: '同一个办公室的人，从这里开始走向不同的地方。' },
  5: { name: '中层', tip: '你有了自己的工位隔断，也有了自己要护着的人。' },
  6: { name: '四十岁', tip: '你开始算，还剩下多少年，还剩下多少可能。' },
  7: { name: '尾声', tip: '该交的东西，慢慢都要交了。' }
}

const RANKS = [
  '试用期', '专员', '高级专员', '主管', '经理',
  '高级经理', '总监', '副总裁', '合伙人'
]

/* ============================ 结局 ============================ */
/*
 * match(s, sc) => bool
 * sc = { wealth, rank, mind, skill, total }
 * pri 越高的越常见（加权挑选用 pri^3）
 * family 用来在结局里回扣一条相关选择，avoid 用来避开同主题的收尾画面
 */

const ENDINGS = [
  /* ---------- 往上走 ---------- */
  {
    id: 'listed', pri: 2, title: '敲钟那天', family: 'rank',
    match: (s, sc) => s.flags.includes('ipo') && sc.wealth >= 55,
    desc: '公司上市那天，你站在交易所二楼的角落里，穿着不合身的西装。大屏上的数字跳了一下，你算不清自己那份值多少。旁边有人在哭，你没哭，你只是想起很多年前老板说「明年这层楼不够坐」——他说对了一半。'
  },
  {
    id: 'partner', pri: 2, title: '合伙人', family: 'rank',
    match: (s, sc) => s.rank >= 8,
    desc: '你的名字被印在了公司介绍的第二页。新来的年轻人叫你「总」，你听着还是不太习惯。你签的字开始能决定别人这个月的绩效，你签字的手比以前快，也比以前冷。'
  },
  {
    id: 'vp', pri: 4, title: '副总裁', family: 'rank',
    match: (s, sc) => s.rank >= 7,
    desc: '你有了独立办公室，玻璃是磨砂的。你每天要开六个会，说很多正确的话。有一次你在电梯里听见两个年轻人议论「上面那些人」，你没回头，因为你已经不知道他们在说谁了。'
  },
  {
    id: 'director', pri: 6, title: '总监', family: 'rank',
    match: (s, sc) => s.rank === 6,
    desc: '你管着四十个人，直接向你汇报的有六个。你的工作是让别人把事做完，而不是自己做。你偶尔会怀念刚入职时那种「做完一件事」的踏实，但那种事已经轮不到你了。'
  },
  {
    id: 'manager', pri: 6, title: '卡在经理这一层', family: 'rank',
    match: (s, sc) => s.rank === 4 || s.rank === 5,
    desc: '你做了很多年经理，带过的人一茬一茬。有人升到你上面去了，有人出去创业了。你还在这个位子上，因为这里需要你，也因为上面没有位置。这不是失败，这是很多公司的真实结构。'
  },
  {
    id: 'specialist', pri: 5, title: '技术专家', family: 'skill',
    match: (s, sc) => s.skill >= 78 && s.rank <= 4,
    desc: '你没当上领导，但全公司遇到那个问题都得来找你。你的工位上贴着一张纸条：别问我进度，问就是快了。你靠一门手艺吃饭，吃了很多年，吃到别人绕不过你。'
  },
  {
    id: 'sales_king', pri: 5, title: '销冠', family: 'rank',
    match: (s, sc) => s.flags.includes('sales_king'),
    desc: '你连续三年是销冠，奖杯摆在家里柜子最上面。你不喜欢开会，不喜欢写周报，但你一拿起电话就像换了个人。公司离不开你，你也离不开那口气——一停下来，你就不知道自己是谁。'
  },
  {
    id: 'right_hand', pri: 6, title: '领导的人', family: 'rep',
    match: (s, sc) => s.flags.includes('loyal') && s.rank >= 3,
    desc: '你跟对了人，跟了很多年。他去哪儿都带着你，你替他挡过酒、背过小锅、写过检讨。他升了，你也升了。有人背后说你是「靠关系」，你听见了，没反驳——因为这句话里有一半是真的。'
  },

  /* ---------- 被留下 ---------- */
  {
    id: 'invisible', pri: 8, title: '透明人', family: 'rep',
    match: (s, sc) => s.rank <= 2 && sc.rank <= 42 && sc.mind >= 45,
    desc: '你在公司待了很多年，存在感低到年会抽奖都念错你的名字。你没有大错，也没有大功。裁员名单讨论到你这儿，领导想了两秒，说「他挺稳的，留着吧」。你就这样留了下来，一直留到最后。'
  },
  {
    id: 'old_hand', pri: 7, title: '老油条', family: 'rep',
    match: (s, sc) => s.flags.includes('coast') && sc.mind >= 50,
    desc: '你熟悉这里每一条捷径：哪个系统能绕过审批，哪份文件其实没人看，哪个会可以不去。新来的小孩觉得你混，只有你知道，你只是把力气留给了下班以后的生活。你没赢，但你也没垮。'
  },
  {
    id: 'coast', pri: 7, title: '躺平上岸', family: 'mind',
    match: (s, sc) => s.flags.includes('coast') && sc.mind >= 62,
    desc: '你不再争了。绩效拿 B 就行，升职让给别人，会议能推就推。你把省下来的时间用来接孩子、做饭、跑步。有人替你惋惜，说你再努力一点就上去了。你说：我知道，我就是不想了。'
  },
  {
    id: 'union', pri: 5, title: '行政岗养老', family: 'rank',
    match: (s, sc) => s.flags.includes('admin_track') && s.age >= 40,
    desc: '你从业务线调到了行政，管印章、管合同、管年会。事情杂，但不烧脑，也不太会出错。你在公司待得比很多领导都久，新人来都要先找你问流程。你没有权力，但你有钥匙。'
  },
  {
    id: 'rehire', pri: 4, title: '被返聘的人', family: 'rank',
    match: (s, sc) => s.flags.includes('rehired'),
    desc: '你退休了半年，又被叫回去做顾问。年轻人搞不定的老系统，只有你还记得怎么修。你每周去两天，工位在角落，没有工牌权限。你看着他们在群里讨论你听不懂的东西，忽然明白：你不是被需要，你是被方便。'
  },
  {
    id: 'retire', pri: 6, title: '正常退休', family: 'mind',
    match: (s, sc) => s.age >= 50 && sc.mind >= 44,
    desc: '你在这家公司干到退休，拿了一块纪念牌和一张体检卡。最后一天你把抽屉清空，发现里面有一支没水的笔、两包过期的速溶咖啡、一张很多年前的团建合影。你把照片留下，其余扔了。'
  },
  {
    id: 'last_one', pri: 3, title: '最后一个关灯的人', family: 'rank',
    match: (s, sc) => s.flags.includes('last_man') || (s.age >= 52 && s.rank >= 3),
    desc: '公司搬走那天，你留下来做交接。办公室的桌子都空了，只有你的工位还亮着灯。你把最后一箱资料封好，关灯，锁门。保安问你明天还来吗，你说来。其实你也不知道明天来干什么。'
  },

  /* ---------- 被切掉 ---------- */
  {
    id: 'layoff_35', pri: 9, title: '三十五岁', family: 'exit',
    match: (s, sc) => s.flags.includes('laid_off') && (s.laidOffAge || s.age) <= 40,
    desc: 'HR 约你到小会议室，桌上放着一份协议和一盒纸巾。她说这是公司结构调整，跟你个人没关系。你签完字，回工位收拾东西，发现自己攒了三年的加班调休，一天也没用过。'
  },
  {
    id: 'layoff_40', pri: 8, title: '四十岁那年被优化', family: 'exit',
    match: (s, sc) => s.flags.includes('laid_off') && (s.laidOffAge || s.age) > 40,
    desc: '你在这家公司待了十二年，工位换过四次，领导换过五个。裁员名单下来那天，你在上面看到了自己的名字，顺序排在第七。你第一反应不是愤怒，是算 N+1 能拿多少。'
  },
  {
    id: 'n_plus_one', pri: 7, title: 'N+1', family: 'money',
    match: (s, sc) => s.flags.includes('severance') && sc.wealth >= 40,
    desc: '赔偿金到账那天，你去银行打了一张流水，站在门口看了很久。这笔钱够你活两年，也够你想清楚一件事：你不想再回到那种地方了。你45了，但账上第一次有了选择的余地。'
  },
  {
    id: 'arbitration', pri: 5, title: '仲裁', family: 'exit',
    match: (s, sc) => s.flags.includes('arbitration'),
    desc: '你在劳动仲裁的走廊里坐了一上午，对面是公司请的律师。你带了一个文件袋，里面有考勤截图、加班记录、微信聊天。仲裁员问你想要什么，你说：我要他们承认那是我做的。'
  },
  {
    id: 'company_dead', pri: 6, title: '公司没了', family: 'exit',
    match: (s, sc) => s.flags.includes('company_dead'),
    desc: '公司最后一个月，工资发了，社保断了。老板在群里发了一段很长的话，最后一句是「江湖再见」。你退出群聊的时候，发现这个群有四百多人，你认识的不超过十个。'
  },
  {
    id: 'acquired', pri: 4, title: '被收购之后', family: 'exit',
    match: (s, sc) => s.flags.includes('acquired'),
    desc: '收购完成后，新公司派来一个三十岁的整合负责人，管你叫「老师」。他很有礼貌，也很清楚要做什么：把你们的人换掉一半，把系统并过去。你配合了八个月，最后自己提了离职。'
  },
  {
    id: 'ai_replaced', pri: 5, title: '被系统取代', family: 'skill',
    match: (s, sc) => s.flags.includes('automated'),
    desc: '你的工作被拆成了三个模块，两个交给了系统，一个交给了刚毕业的实习生。领导说这是「升级」，让你去做「更有价值的事」。你坐在工位上想了很久，想不出那是什么事。'
  },
  {
    id: 'burnout', pri: 6, title: '心态先垮的', family: 'mind',
    match: (s, sc) => sc.mind < 28,
    desc: '你开始失眠，早上起不来，坐到工位前手心出汗。医生给你开了一张假条，上面写着「建议休息两周」。你把假条拍了张照，没发出去。第三周你还是去上班了，因为你不知道不去会怎样。'
  },
  {
    id: 'hospital', pri: 4, title: '住院', family: 'body',
    match: (s, sc) => s.flags.includes('hospitalized'),
    desc: '你在会议室里站起来的时候眼前一黑。醒来是在医院，手背上插着针。同事发来消息问项目进度，你回「我尽快」。护士看见了，说：你现在最快的办法是睡觉。'
  },
  {
    id: 'dead', pri: 3, title: '没等到下班', family: 'body',
    match: (s, sc) => s.flags.includes('collapse'),
    desc: '你倒在工位和打印机之间，手里还攥着刚打出来的报销单。后来公司给你办了追悼会，来了很多人。你的工位在一周内被清空，电脑分给了新来的实习生。'
  },
  {
    id: 'lawsuit', pri: 4, title: '那份签字', family: 'exit',
    match: (s, sc) => s.flags.includes('signed_bad'),
    desc: '审计进场那天，你才知道那份合同意味着什么。领导说他不知情，经办人是你，签字也是你。你请了律师，律师看完材料说：从流程上，你确实该负责。你想说「是他们让我签的」，话到嘴边又咽了回去。'
  },
  {
    id: 'fake_resume', pri: 4, title: '背调没过', family: 'exit',
    match: (s, sc) => s.flags.includes('fake_resume'),
    desc: '新公司给了 offer，背调打到上一家。你多写的那段经历被查了出来，HR 打电话来的语气很客气，说「流程上有点问题」。你挂了电话，把那份改了七版的简历删了，又重新写了一份。'
  },

  /* ---------- 换地方 ---------- */
  {
    id: 'job_hop', pri: 6, title: '跳来跳去', family: 'money',
    match: (s, sc) => s.flags.includes('job_hopper') && sc.wealth >= 45,
    desc: '你换过七家公司，每次都涨薪，每次都觉得下一家会更好。四十岁以后，猎头的电话少了，你才发现自己简历上最长的任职时间是三年零两个月。你什么都会一点，什么都不算深。'
  },
  {
    id: 'return_home', pri: 7, title: '回老家', family: 'exit',
    match: (s, sc) => s.flags.includes('went_home'),
    desc: '你把出租屋退了，行李寄回老家，坐了六个小时高铁。父母在站台等你，接过箱子说「回来就好」。你在县城找了一份工资少一半的工作，每天骑车十分钟到单位。晚上很安静，安静得你有时会想起那栋写字楼。'
  },
  {
    id: 'family_biz', pri: 4, title: '接手家里的店', family: 'money',
    match: (s, sc) => s.flags.includes('family_business'),
    desc: '你爸的店开了二十三年。你回去那年，他把账本交给你，说「不难，就是熬人」。你这才知道，他每天五点起床，一年只休三天。你在写字楼里学的那些方法，在这里有一半用不上。'
  },
  {
    id: 'startup', pri: 5, title: '自己干', family: 'money',
    match: (s, sc) => s.flags.includes('founder') && sc.wealth >= 35 && !s.flags.includes('biz_failed'),
    desc: '你带着三个老同事出来，注册了第一家公司。第一年没有工资，第二年勉强打平，第三年你终于敢在名片上印「创始人」。你还是每天回消息到十二点，但那些消息是你自己的。'
  },
  {
    id: 'startup_fail', pri: 7, title: '干黄了', family: 'money',
    match: (s, sc) => s.flags.includes('founder') && s.flags.includes('biz_failed'),
    desc: '公司撑了两年零四个月。散伙饭上，四个人喝了三箱啤酒，谁也没提欠的钱。你把设备卖了，把办公室退了，把公章交回工商。回家路上你收到一条银行短信，余额比你创业前还少一位数。'
  },
  {
    id: 'side_hustle', pri: 6, title: '副业养着主业', family: 'money',
    match: (s, sc) => s.flags.includes('side_biz') && sc.wealth >= 30,
    desc: '你白天上班，晚上做自己的小生意。最开始是给朋友做图，后来接单接到要排队。你没辞职，因为社保和稳定太贵了。你的副业收入早就超过工资，但你一直没敢把这件事告诉领导。'
  },
  {
    id: 'gov', pri: 5, title: '上岸', family: 'rank',
    match: (s, sc) => s.flags.includes('civil_servant'),
    desc: '你考了三年，第四次上岸。政审那天你回原公司开证明，前同事在茶水间问你新单位怎么样，你说还行，稳定。他说真羡慕你。你想说其实工资少了三分之一，但没说。'
  },
  {
    id: 'freelance', pri: 5, title: '自由职业', family: 'mind',
    match: (s, sc) => s.flags.includes('freelance') && sc.mind >= 45,
    desc: '你不再有工位，也不再有周报。收入不稳定，但时间是你自己的。你学会了在别人上班的时候去公园，也学会了在别人睡觉的时候赶工。自由不是不累，是自己决定什么时候累。'
  },
  {
    id: 'consultant', pri: 4, title: '独立顾问', family: 'skill',
    match: (s, sc) => s.flags.includes('consultant'),
    desc: '你把二十年的经验写成了六个模块，按天收费。客户叫你老师，请你吃饭，听你讲「当年我们怎么做的」。你讲着讲着会突然心虚：那些办法，在今天的公司里还管用吗。'
  },
  {
    id: 'trainer', pri: 3, title: '讲师', family: 'skill',
    match: (s, sc) => s.flags.includes('trainer'),
    desc: '你站在台上给两百个人讲「高效沟通」，台下有人在回消息。你知道他们不是来学东西的，是来完成培训学时的。你还是认真地讲完了，因为你也是这么过来的。'
  },
  {
    id: 'media', pri: 4, title: '做内容', family: 'mind',
    match: (s, sc) => s.flags.includes('creator') && sc.wealth >= 25,
    desc: '你把办公室那些事写成了段子，火了。评论区说「太真实了」，只有你知道那些不是段子。你现在靠吐槽上班赚钱，但你还在上班，因为不上的话就没得写了。'
  },
  {
    id: 'delivery', pri: 6, title: '先跑着', family: 'money',
    match: (s, sc) => s.flags.includes('gig_work'),
    desc: '你注册了骑手，想着过渡三个月。第三个月结束的时候，你已经熟悉了这一片的每一条小路。收入不比办公室少，膝盖比以前疼。有人问你什么时候回去上班，你说等这阵子过去。'
  },
  {
    id: 'trade', pri: 6, title: '学了门手艺', family: 'skill',
    match: (s, sc) => s.flags.includes('craft'),
    desc: '你去学了咖啡、烘焙或者木工，学了一年，开了间小店。收入只有原来的一半，但你每天能看见自己做出来的东西。有老同事来店里，说你变了。你说：不是变了，是终于不用装了。'
  },
  {
    id: 'abroad', pri: 4, title: '出去了', family: 'exit',
    match: (s, sc) => s.flags.includes('abroad'),
    desc: '你办完签证，退了房，把不带走的东西送了人。落地那天是当地时间早上六点，你在机场坐了半小时，才敢相信这件事真的成了。新公司的工位很小，但窗户外面是你以前只在屏幕上见过的天。'
  },
  {
    id: 'remote', pri: 5, title: '远程办公', family: 'mind',
    match: (s, sc) => s.flags.includes('remote') && sc.mind >= 50,
    desc: '你在一个小城市租了带院子的房子，给一家大公司远程干活。同事只在视频会议里见过你的上半身。你省下了通勤和房租，也失去了那种「下班一起走」的关系。'
  },

  /* ---------- 生活这边 ---------- */
  {
    id: 'office_love', pri: 6, title: '在公司成了家', family: 'love',
    match: (s, sc) => s.flags.includes('office_married'),
    desc: '你们在同一层楼认识，在茶水间确定关系，在公司年会上被起哄。后来一个先离职，一个留下，这样就不用填那份「亲属回避」的表。你们的家里有一张合影，背景是公司的 logo 墙。'
  },
  {
    id: 'divorce_work', pri: 6, title: '工作把家过没了', family: 'love',
    match: (s, sc) => s.flags.includes('divorced') || s.flags.includes('marriage_crisis'),
    desc: '分开那天，对方说了一句你记了很久的话：你不是不爱这个家，你只是总在别处忙。你想反驳，但你想起孩子的家长会、父母的体检、家里坏了两年的灯——你确实都不在。'
  },
  {
    id: 'full_time_parent', pri: 4, title: '回家带孩子', family: 'love',
    match: (s, sc) => s.flags.includes('stay_home'),
    desc: '你辞了职，在家带孩子。最开始你觉得这是暂时的，后来孩子上了小学，你发现自己已经五年没有面试过。你在家长群里很活跃，在同学群里很安静。有人问你在做什么，你说「在家」。'
  },
  {
    id: 'single', pri: 4, title: '一个人', family: 'love',
    match: (s, sc) => !s.flags.includes('married') && !s.flags.includes('partner'),
    desc: '你没有结婚，也没有稳定的伴。不是没人，是每次都差一点。你把精力都给了工作，工作也没有多回报你。但你有一套自己的房子、一只猫、几个能半夜打电话的朋友。这也是一种完整。'
  },

  /* ---------- 别的出口 ---------- */
  {
    id: 'demoted', pri: 5, title: '被降了一级', family: 'rank',
    match: (s, sc) => s.flags.includes('demoted'),
    desc: '组织调整，你的title从「经理」变成了「高级专员」，汇报对象是以前的下属。他跟你谈话时比你更尴尬。你说没关系，心里想的是房贷还有十七年。'
  },
  {
    id: 'transfer', pri: 6, title: '被调去边缘部门', family: 'rank',
    match: (s, sc) => s.flags.includes('marginalized'),
    desc: '你被调去「创新业务部」，办公区在另一栋楼，团队三个人。所有人都知道这是什么意思：不裁你，但也不再用你。你在那里待了两年，做完了一个没人看的项目。'
  },
  {
    id: 'empty', pri: 7, title: '空转', family: 'mind',
    match: (s, sc) => sc.total < 40,
    desc: '你在一家公司待了很多年，职位没变，工资涨过三次，每次五百。你每天做差不多的事，开差不多的会，说差不多的话。你没做错什么，只是时间从你身上过去了，没带走什么，也没留下什么。'
  },
  {
    id: 'ordinary_retire', pri: 8, title: '一份工作干到老', family: 'mind',
    match: (s, sc) => sc.total >= 40 && sc.total < 56,
    desc: '你没有大起大落，也没有值得讲的故事。你换过两次工作，买了一套房，把孩子养大，把父母送走。退休那天你算了一下，这辈子一共上了二十八年班。这个数字听起来很长，过起来也就是每天早起。'
  }
]

/* ============================ 最后那一幕 ============================ */
/*
 * 结局 = 走向 × 光景，配对后优先不重复
 * cond 只判局面，pri 决定常见程度
 */

const SCENES = [
  {
    id: 'last_badge', pri: 7,
    cond: (s, sc) => s.flags.includes('left_job') || s.age >= 55,
    text: '最后一次刷卡，闸机响了一声，跟过去几千次一模一样。你在门口站了两秒，才想起来不用再等电梯了。'
  },
  {
    id: 'empty_desk', pri: 7,
    cond: (s, sc) => s.flags.includes('left_job') || s.flags.includes('laid_off'),
    text: '工位清空之后，桌上还剩一圈杯底的水印。保洁阿姨过来擦了两下，那圈印子就没了。'
  },
  {
    id: 'annual_party', pri: 6,
    cond: (s, sc) => sc.rank >= 45,
    text: '年会那天你被请上台，灯光打过来，下面的人在鼓掌。你握着话筒，忽然想不起准备好的那三句话。'
  },
  {
    id: 'three_am', pri: 6,
    cond: (s, sc) => s.flags.includes('grind') || sc.mind < 45,
    text: '凌晨三点，办公室只剩你这一排灯。空调还在响，你盯着屏幕上的光标，忘了自己要打什么字。'
  },
  {
    id: 'resignation', pri: 5,
    cond: (s, sc) => s.flags.includes('quit_self'),
    text: '辞职信只有四行，你改了六遍。最后删掉了所有解释，只留下「因个人原因，申请离职」。'
  },
  {
    id: 'report', pri: 5,
    cond: (s, sc) => sc.mind < 55 || s.flags.includes('hospitalized'),
    text: '体检报告上有一行字被标了红。医生说了很多，你只记住一句：这个年纪，不能再这么熬了。'
  },
  {
    id: 'stock', pri: 4,
    cond: (s, sc) => s.flags.includes('ipo') || s.flags.includes('equity_cash'),
    text: '股票解禁那天，手机弹出一条到账短信。你数了三遍零，然后把手机放下，去厨房给自己倒了杯水。'
  },
  {
    id: 'group_chat', pri: 6,
    cond: (s, sc) => s.flags.includes('left_job'),
    text: '前同事的群里又有人发红包。你点开，抢到八毛。你想说点什么，打了几个字，又删了。'
  },
  {
    id: 'intern', pri: 5,
    cond: (s, sc) => s.age >= 36 && sc.rank >= 30,
    text: '新来的实习生叫你老师，问你一个你十年前就会的问题。你讲了半天，发现自己在讲当年没人教你的事。'
  },
  {
    id: 'elevator', pri: 5,
    cond: (s, sc) => s.flags.includes('left_job'),
    text: '电梯里遇到前领导，他先认出你，叫了你的名字。你们聊了三层楼，谁也没提当年那件事。'
  },
  {
    id: 'severance', pri: 4,
    cond: (s, sc) => s.flags.includes('severance'),
    text: 'N+1 到账那天，你在银行门口站了一会儿。天很好，不是发工资的日子，也不是任何人的生日。'
  },
  {
    id: 'boss_door', pri: 4,
    cond: (s, sc) => sc.rank >= 25,
    text: '老板办公室的门关着，磨砂玻璃后面有人影。你在门口等了十分钟，最后把材料放在他秘书桌上。'
  },
  {
    id: 'last_toast', pri: 4,
    cond: (s, sc) => s.flags.includes('sales') || s.flags.includes('drink_habit'),
    text: '客户饭局的最后一杯，你端起来又放下。对方说你不给面子，你笑着说今天开车。其实你没开车。'
  },
  {
    id: 'last_train', pri: 6,
    cond: (s, sc) => s.flags.includes('city_tier1'),
    text: '末班地铁上全是加班的人，没人说话，每个人都在看手机。你靠在门边，看见窗玻璃上自己的脸。'
  },
  {
    id: 'rented_light', pri: 6,
    cond: (s, sc) => !s.flags.includes('bought_house'),
    text: '出租屋的灯坏了一个月，你一直没换。反正回来也只是睡觉，亮不亮没那么要紧。'
  },
  {
    id: 'hometown_yard', pri: 4,
    cond: (s, sc) => s.flags.includes('went_home'),
    text: '老家的院子里晒着被子，母亲在厨房喊你吃饭。你坐在小板凳上，忽然觉得那些年像别人的事。'
  },
  {
    id: 'mother_call', pri: 5,
    cond: (s, sc) => true,
    text: '母亲打电话来，问你最近忙不忙。你说还行。她沉默了一下，说那就好，别太累。挂了电话你才发现自己忘了问她身体。'
  },
  {
    id: 'recycle_bin', pri: 5,
    cond: (s, sc) => s.flags.includes('left_job'),
    text: '电脑交回 IT 之前，你把回收站清空了。三年的文档、表格、会议纪要，一共用了四秒钟。'
  },
  {
    id: 'cert', pri: 4,
    cond: (s, sc) => s.flags.includes('left_job'),
    text: '离职证明是一张 A4 纸，上面写着你在这家公司待了多少年、做过什么岗位。就这两行。'
  },
  {
    id: 'convenience', pri: 5,
    cond: (s, sc) => true,
    text: '楼下便利店的店员认识你，知道你要关东煮不要萝卜。那天你买了两瓶啤酒，他说：今天不加班？'
  },
  {
    id: 'dingtalk', pri: 5,
    cond: (s, sc) => sc.mind < 50,
    text: '晚上十一点，工作群又跳出一条消息。你看了一眼，把手机翻过去，屏幕朝下。'
  },
  {
    id: 'moments', pri: 3,
    cond: (s, sc) => s.flags.includes('creator') || s.flags.includes('left_job'),
    text: '你发了一条朋友圈，九张图，配文「新的开始」。发完你盯着那个小红点，等了一晚上。'
  },
  {
    id: 'farewell', pri: 3,
    cond: (s, sc) => s.age >= 50 && sc.mind >= 45,
    text: '欢送会上，同事送了你一个蛋糕和一个保温杯。你说谢谢，然后发现自己在公司待了这么久，最舍不得的是楼下那棵树。'
  },
  {
    id: 'empty_meeting', pri: 4,
    cond: (s, sc) => sc.rank >= 35,
    text: '空会议室里，投影仪还亮着，桌上散着几张没写名字的纸。你把它们收起来，发现是上一场会的座位表。'
  }
]

/* ============================ 建议 ============================ */

const ADVICE = {
  moneyLow: {
    title: '先把钱的事弄明白',
    cond: s => s.money < 20,
    text: '你这一局的钱一直很紧。别急着怪工资低，先做一件具体的事：把这个月的支出记下来，分成「必须」和「其实可以不」。你会发现有一笔钱每个月都在走，而你根本想不起它买了什么。'
  },
  skillLow: {
    title: '一门手艺',
    cond: s => s.skill < 55,
    text: '你在公司待了很多年，但说不清自己会什么。这不是你的错，是大部分岗位就是这样被设计出来的。挑一件能带走的本事，练到别人绕不过你——不是为公司，是为了你下一次谈条件的时候有东西可谈。'
  },
  repLow: {
    title: '关系不是讨好',
    cond: s => s.rep < 45,
    text: '你可能觉得办公室里那些人不值得交往。但关系不等于讨好：记住别人的名字、在他忙的时候帮一次、在会议上替说过的话作证。这些小事不花钱，却决定了关键时刻有没有人替你说话。'
  },
  mindLow: {
    title: '身体和情绪都会记账',
    cond: s => s.mind < 46,
    text: '你这一局靠硬撑过了很多关。硬撑不是问题，问题是撑完不休息。这周做一件很小的、跟工作无关的事：走一段路、做一顿饭、跟一个不聊工作的人吃个饭。它不能解决问题，但能让你多撑一阵。'
  },
  quit: {
    title: '辞职之前先算三笔账',
    cond: s => s.flags.includes('quit_self') || s.flags.includes('laid_off'),
    text: '第一笔是现金：你能撑几个月。第二笔是身份：没有工牌之后，你怎么介绍自己。第三笔是时间：你打算用多久找到下一件事。三笔都算清楚，再决定是休息，还是马上开始。'
  },
  loyal: {
    title: '别把命交给一个人',
    cond: s => s.flags.includes('loyal'),
    text: '你跟对了人，这很幸运。但任何一个人都可能调走、失势、离职。你替他做的事，要有一半能写进自己的履历——不然他走了，你只剩下「忠诚」这两个字，而这两个字在市场上不值钱。'
  },
  grind: {
    title: '加班不会自动变成资本',
    cond: s => s.flags.includes('grind'),
    text: '你加了很多班，但大部分加班只是把白天没做完的事挪到晚上。真正值钱的是那些「做完之后你会了」的事。下次加班前问一句：这件事做完，我是更值钱了，还是只是更累了。'
  },
  founder: {
    title: '创业不是逃离',
    cond: s => s.flags.includes('founder'),
    text: '如果你是因为受不了上班才去创业，那么创业会把你受不了的东西放大十倍：没有下班、没有人替你兜底、每个决定都得自己担。先问自己：你是想做一件事，还是想不做现在这件事。'
  },
  coast: {
    title: '躺平也需要本事',
    cond: s => s.flags.includes('coast'),
    text: '你能躺下来，说明你至少有一份能托住你的工作。但躺平不是什么都不做，是把力气从「往上爬」换成「守住底线」。别让手艺荒掉，也别让关系断掉——这两样是你躺得安稳的原因。'
  },
  family: {
    title: '工作是手段',
    cond: s => s.flags.includes('marriage_crisis') || s.flags.includes('divorced'),
    text: '你这一局在工作上花的时间，比在家里多得多。工作是换取生活的手段，不是生活本身。如果一份工作让你没有生活，它换来的东西你也没时间用。'
  },
  exit: {
    title: '离开也是一种能力',
    cond: s => s.flags.includes('left_job') || s.flags.includes('laid_off'),
    text: '你离开过，这比一直待着更需要勇气。走的时候把该拿的拿到、该说的说清、该留的联系方式留下。这个行业很小，你今天的前同事，明天可能是你的客户或者面试官。'
  },
  never: {
    title: '你一直没走',
    cond: s => !s.flags.includes('left_job'),
    text: '你在一家公司待了很久。稳定不是错，但要小心一件事：你的能力是不是只在「这家公司」里有效。每隔两年去面一次试，不是为了跳，是为了知道自己值多少钱。'
  }
}

/* ============================ 小工具 ============================ */

const has = (s, f) => s.flags.includes(f)

return {
  TALENTS,
  COMPANIES,
  STAGES,
  RANKS,
  EVENTS,
  ENDINGS,
  SCENES,
  ADVICE,
  has
}

})
