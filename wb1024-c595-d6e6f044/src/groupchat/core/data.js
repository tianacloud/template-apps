/**
 * core/data.js —— 群聊模拟器 · 内容层
 * 群成员、阶段、结局、建议。引擎不认识"故事"，只认识数值和 flag。
 * UMD：小程序走 module.exports，网页走 window.GcData
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./events'), require('./events2'), require('./events3'))
  else root.GcData = factory(root.GcEvents, root.GcEvents2, root.GcEvents3)
})(typeof globalThis !== 'undefined' ? globalThis : this, function (E1, E2, E3) {

const EVENTS = [].concat(E1 || [], E2 || [], E3 || [])

/* ============================ 群成员 ============================ */

const MEMBERS = [
  {
    id: 'li',
    name: '李桂芬（8号楼群主）',
    short: '李桂芬',
    tag: '群主',
    avatar: '桂',
    hue: 8,
    desc: '退休小学老师，建群的人。每天六点半发天气预报，谁不说话她记得清清楚楚。'
  },
  {
    id: 'wang',
    name: '王大炮',
    short: '王大炮',
    tag: '',
    avatar: '王',
    hue: 210,
    desc: '做建材生意，声大、话密、爱发六十秒语音。口头禅是"我说句公道话"。'
  },
  {
    id: 'momo',
    name: 'Momo✨全球购',
    short: 'Momo',
    tag: '',
    avatar: 'M',
    hue: 330,
    desc: '微商。头像一天换三次。群规第七条就是为她加的，她当没看见。'
  },
  {
    id: 'zhou',
    name: '小周',
    short: '小周',
    tag: '',
    avatar: '周',
    hue: 168,
    desc: '程序员，凌晨两点在线，白天不回。一开口就能把天聊死，但通常是精准的。'
  },
  {
    id: 'chen',
    name: '陈阿姨',
    short: '陈阿姨',
    tag: '',
    avatar: '陈',
    hue: 42,
    desc: '六十八岁，微信名后带一朵玫瑰。转发一切带"紧急""速看""删前速转"的东西。'
  },
  {
    id: 'zhao',
    name: '老赵（业委会筹备）',
    short: '老赵',
    tag: '筹备组',
    avatar: '赵',
    hue: 280,
    desc: '退休会计，随身带 U 盘。坚信物业账目有问题，并且总有一天能证明。'
  },
  {
    id: 'zhang',
    name: '物业-小张',
    short: '物业小张',
    tag: '物业',
    avatar: '张',
    hue: 195,
    desc: '客服。所有问题在他这里都会变成"已反馈给相关部门"。'
  }
]

const MEMBER_MAP = {}
MEMBERS.forEach(m => { MEMBER_MAP[m.id] = m })

/* ============================ 阶段 ============================ */

const STAGES = {
  1: {
    name: '入群当天',
    range: '第 1 天',
    tip: '487 个人，你一个都不认识。第一条消息已经打好了，删了三遍。',
    day: 1
  },
  2: {
    name: '头一个星期',
    range: '第 2—7 天',
    tip: '群里的规矩没人明说，但每条都有人执行。',
    day: 7
  },
  3: {
    name: '第一个月',
    range: '第 3—4 周',
    tip: '你开始分得清谁在说真话，谁只是在说话。',
    day: 30
  },
  4: {
    name: '那件事',
    range: '第 2 个月',
    tip: '电梯、钱、责任。这三样凑在一起，群就不再是群了。',
    day: 62
  },
  5: {
    name: '分群',
    range: '第 3—5 个月',
    tip: '一个群装不下所有人的立场，于是第二个群出现了。',
    day: 120
  },
  6: {
    name: '一年后',
    range: '第 12 个月',
    tip: '你翻到群设置，看见"我在本群的名字"。',
    day: 365
  }
}

/* ============================ 结局：身份 ============================ */

/* pri 越大越稀有。judge 返回 0~1 的贴合度，引擎按 pri^3 × 吻合度加权抽。 */
const IDENTITIES = [
  {
    id: 'darling', pri: 6,
    name: '群里那个好人',
    desc: '没人说得清你做过什么，但谁提起你都说"那人不错"。你借过梯子、代收过快递、帮人看过一次猫。',
    judge: s => (s.face - 45) / 55 + (s.fame > 30 ? 0.1 : 0)
  },
  {
    id: 'enemy', pri: 5,
    name: '被挂过两次的人',
    desc: '你的名字在这个群里以截图的形式流传过。有人替你说话，但声音不大。',
    judge: s => (40 - s.face) / 40 + (s.fame > 55 ? 0.25 : 0)
  },
  {
    id: 'ghost', pri: 5,
    name: '姓什么都不知道的邻居',
    desc: '你在群里待了一年，说过的话不超过十句。电梯里遇见，谁也不认识谁。',
    judge: s => (30 - s.fame) / 30
  },
  {
    id: 'mediator', pri: 6,
    name: '民间调解员',
    desc: '两家为噪音吵到要报警，最后是你在中间说了四句话。群主后来有事都先问你。',
    judge: s => (s.face - 55) / 45 + (s.group - 50) / 100
  },
  {
    id: 'redbag', pri: 4,
    name: '红包侠',
    desc: '大家不记得你住几楼，但记得你手气最佳之后一定会再发一个。',
    judge: s => (s.flags.indexOf('redbag_king') >= 0 ? 0.9 : 0) + (s.cash < 800 ? 0.15 : 0)
  },
  {
    id: 'weirdo', pri: 5,
    name: '群里那个怪人',
    desc: '你的某几句话被截图流传过。没人说得清是哪几句，但一提起 1602，总会有人笑出声。',
    judge: s => s.weird / 100 + (s.fame > 40 ? 0.12 : 0)
  },
  {
    id: 'insider', pri: 5,
    name: '什么都知道的人',
    desc: '你不站队，你只是知道。谁家漏水、谁跟物业吵过、哪笔钱没公示——问你比问群主快。',
    judge: s => s.info / 100 + (s.fame > 35 ? 0.1 : 0)
  },
  {
    id: 'sidekick', pri: 5,
    name: '群主的自己人',
    desc: '李姐发通知，你是第一个回"收到"的。她后来把群转让给了你——不是信任，是没人接。',
    judge: s => (s.flags.indexOf('li_friend') >= 0 ? 0.75 : 0) + (s.face - 50) / 200
  },
  {
    id: 'sales', pri: 4,
    name: '带货二把手',
    desc: '你从"就看看"到"我给大家争取了个价"，用了不到三个月。你的头像也加了个✨。',
    judge: s => (s.flags.indexOf('momo_team') >= 0 ? 0.8 : 0) + (s.cash > 5000 ? 0.1 : 0)
  },
  {
    id: 'activist', pri: 5,
    name: '维权先锋',
    desc: '你手里有一个 12 页的 PDF，标题是《关于 8 号楼公共收益的十个疑问》。老赵把你当接班人。',
    judge: s => (s.flags.indexOf('zhao_team') >= 0 ? 0.8 : 0) + (s.group < 45 ? 0.15 : 0)
  },
  {
    id: 'kicked', pri: 4,
    name: '被移出过群聊的人',
    desc: '你后来是被李姐拉回来的。回来那天没人提这事，但"你被踢过"这件事，比你先到的。',
    judge: s => (s.flags.indexOf('kicked') >= 0 ? 0.95 : 0)
  },
  {
    id: 'owner', pri: 3,
    name: '第二任群主',
    desc: '群主转让那一刻，群里刷了三十个"恭喜"。你知道这不是升职，是接盘。',
    judge: s => (s.flags.indexOf('new_owner') >= 0 ? 1 : 0)
  },
  {
    id: 'left', pri: 4,
    name: '已经退群的人',
    desc: '你退群那天没人发现。三个月后有人在群里问"1602 是不是搬走了"，没有人回答。',
    judge: s => (s.flags.indexOf('quit_group') >= 0 ? 1 : 0)
  },
  {
    id: 'normal', pri: 7,
    name: '一个正常的邻居',
    desc: '这在这个群里，已经算是一种成就了。',
    judge: s => 0.4 - Math.abs(s.face - 55) / 300 - Math.abs(s.weird - 20) / 400
  }
]

/* ============================ 结局：群运 ============================ */

const OUTCOMES = [
  {
    id: 'dead', pri: 5,
    name: '群凉了',
    desc: '最后一条消息是三个月前的一条拼多多砍一刀，没人点。487 个人，一个都没退。',
    judge: s => (35 - s.group) / 35
  },
  {
    id: 'groupbuy', pri: 5,
    name: '群变成了团购群',
    desc: '现在置顶的是本周鸡蛋价。没人再提物业费，也没人再吵。某种意义上，这是最好的结局。',
    judge: s => (s.flags.indexOf('groupbuy_ok') >= 0 ? 0.7 : 0) + (s.group - 50) / 160
  },
  {
    id: 'split', pri: 5,
    name: '分裂成三个群',
    desc: '一个维权群，一个拼单群，一个真正的邻居群——最后那个只有 41 个人，最安静。',
    judge: s => (s.flags.indexOf('split') >= 0 ? 0.85 : 0) + (45 - s.group) / 120
  },
  {
    id: 'same', pri: 8,
    name: '照旧吵，照旧过',
    desc: '一年了，群还在吵同一件事。你也还在，早上照样有人发天气预报。',
    judge: s => 0.55 - Math.abs(s.group - 50) / 160
  },
  {
    id: 'win', pri: 4,
    name: '物业服软了',
    desc: '公示栏贴出了盖红章的表。老赵拍了照发群里，那天群里第一次没有人抬杠。',
    judge: s => (s.group - 60) / 40 + (s.flags.indexOf('zhao_team') >= 0 ? 0.2 : 0)
  },
  {
    id: 'owner', pri: 3,
    name: '你成了群主',
    desc: '群公告第一行现在是你的名字。你把它改成了"有事说事，别发广告"。',
    judge: s => (s.flags.indexOf('new_owner') >= 0 ? 1 : 0)
  },
  {
    id: 'rights', pri: 4,
    name: '群改名成了维权群',
    desc: '群名后面加了个感叹号。头像换成了红底白字。李姐不再发天气预报。',
    judge: s => (s.flags.indexOf('zhao_team') >= 0 ? 0.5 : 0) + (38 - s.group) / 60
  },
  {
    id: 'market', pri: 4,
    name: '二手市场',
    desc: '现在群里最活跃的是"9 成新婴儿床自提"。你也在上面卖过一个电饭锅。',
    judge: s => (s.flags.indexOf('trade_ok') >= 0 ? 0.6 : 0) + (s.cash < 3000 ? 0.15 : 0)
  },
  {
    id: 'silent', pri: 5,
    name: '安静得像没人住',
    desc: '偶尔有人发一个"？"，隔两天才有人回"我也想问"。',
    judge: s => (28 - s.group) / 28
  },
  {
    id: 'warm', pri: 4,
    name: '变成了熟人楼',
    desc: '有人在群里借葱，三分钟就有人敲门。你搬走那天，群里发了你一张合影。',
    judge: s => (s.face - 50) / 50 + (s.group - 55) / 80
  }
]

/* ============================ 建议（结局后） ============================ */

const ADVICE = {
  high: [
    '你在这个群里学会的事，比在这栋楼里住的时间更值钱。',
    '会说话不是本事。知道什么时候不说话，才是。',
    '你把 487 个人的群，处成了三十人的楼。这是很难的事。',
    '有人记得你帮过他一次。这就够了，别指望更多。'
  ],
  mid: [
    '你没赢，也没输。大部分人在群里都是这样过完一年的。',
    '群是个很公平的地方：你付出多少存在感，就换回多少存在感。',
    '有些话你当时没说，后来也没机会说了。这很正常。',
    '你既没被记住，也没被讨厌。在这种群里，这是种本事。'
  ],
  low: [
    '你不是不适合这个群。你只是没想清楚自己要在这里当什么人。',
    '在群里，沉默是一种表态，只是没人会问你表了什么态。',
    '你走的时候，群里的消息还在刷。世界不会为你停三秒。',
    '下次进一个新群，先看清楚谁最像群主，再决定说什么。'
  ]
}

/* ============================ 常用语料 ============================ */

const NICK_POOL = [
  '1602 新邻居', '1602', '刚搬来的', '8号楼1602', '楼下那位'
]

const SYSTEM_WELCOME = [
  '「李桂芬」邀请你加入了群聊',
  '你已加入群聊，当前群成员 487 人'
]

/* 数值说明，UI 用 */
const METRICS = [
  { key: 'face', label: '人缘', hint: '群里有多少人愿意帮你说话' },
  { key: 'fame', label: '存在感', hint: '有多少人知道 1602 住着谁' },
  { key: 'weird', label: '奇葩度', hint: '你在这个群里的传说程度' }
]

return {
  EVENTS,
  MEMBERS,
  MEMBER_MAP,
  STAGES,
  IDENTITIES,
  OUTCOMES,
  ADVICE,
  NICK_POOL,
  SYSTEM_WELCOME,
  METRICS,
  GROUP_NAME: '梧桐里 8 号楼业主群',
  GROUP_COUNT: 487
}
})
