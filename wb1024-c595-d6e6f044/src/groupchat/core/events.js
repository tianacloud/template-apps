/**
 * core/events.js —— 群聊模拟器 · 事件池（阶段 1—3）
 *
 * 一条事件 = 一段群消息流 + 玩家的几种回法。
 * 消息形态：
 *   { from, text }                 普通文本
 *   { from, type:'voice', sec, text } 语音（text 是转文字）
 *   { from, type:'img', text }     图片
 *   { from, type:'sticker' }       表情
 *   { from, type:'redpack', amt, note } 红包
 *   { from, type:'recalled' }      撤回
 *   { from:'sys', sys:true, text } 系统提示（居中）
 *
 * 选项：
 *   say    玩家发出的消息（null 表示不发）
 *   act    玩家动作旁白
 *   fx     数值变化 {face,fame,weird,cash,info,group}
 *   flag   打上的标记
 *   replies 后续 NPC 消息
 *   result 结算一句话（灰字）
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.GcEvents = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const E = []

/* ==================== 阶段 1 · 入群当天 ==================== */

E.push({
  id: 's1_intro', stage: 1, pin: true, time: '20:14',
  msgs: [
    { from: 'sys', sys: true, text: '「李桂芬」邀请你加入了群聊' },
    { from: 'sys', sys: true, text: '你已加入群聊，当前群成员 487 人' },
    { from: 'li', text: '欢迎新邻居！@1602 新邻居 是哪一户呀？' },
    { from: 'wang', text: '1602？那套不是老陈家的吗，卖了啊' },
    { from: 'li', text: '大炮，人家刚进群' },
    { from: 'momo', text: '欢迎欢迎🎉 新邻居有需要日用品可以找我，群里姐妹都有内部价' },
    { from: 'chen', text: '欢迎新邻居[玫瑰][玫瑰]' }
  ],
  options: [
    {
      say: '大家好，我是 1602 新搬来的，以后多关照',
      fx: { face: 8, fame: 12 },
      replies: [
        { from: 'li', text: '欢迎欢迎！有什么不懂的群里问，别客气' },
        { from: 'wang', text: '租的还是买的？' },
        { from: 'li', text: '大炮' },
        { from: 'wang', text: '我随口一问' }
      ],
      result: '你的第一条消息，被七个人看见了。'
    },
    {
      say: '嗯',
      fx: { face: -4, fame: 3, weird: 6 },
      replies: [
        { from: 'li', text: '……' },
        { from: 'wang', text: '哈哈这新邻居挺酷' },
        { from: 'zhou', text: '欢迎' }
      ],
      result: '一个字，让群里安静了四十秒。'
    },
    {
      say: null,
      act: '你把手机扣在桌上，想等他们说点别的。',
      fx: { face: -2, fame: -6, info: 8 },
      replies: [
        { from: 'li', text: '@1602 新邻居 在吗？' },
        { from: 'wang', text: '估计在搬东西' },
        { from: 'li', text: '那先欢迎着' }
      ],
      result: '你选了先看。群里没人催你，但你被记住了"没回话"。'
    }
  ]
})

E.push({
  id: 's1_redpack', stage: 1, pin: true, time: '20:41',
  msgs: [
    { from: 'li', text: '按照老规矩，新邻居进群，我发个红包热闹热闹' },
    { from: 'li', type: 'redpack', amt: 88, note: '欢迎新邻居' },
    { from: 'wang', text: '手慢了' },
    { from: 'momo', text: '谢谢李姐！[双手合十]' },
    { from: 'sys', sys: true, text: '红包 8 秒被领完' }
  ],
  options: [
    {
      say: '谢谢李姐，这怎么好意思',
      fx: { face: 6, cash: 3 },
      replies: [
        { from: 'li', text: '拿着，图个吉利' },
        { from: 'chen', text: '我们群里李姐最大方[强]' }
      ],
      result: '你抢到 3 块 2。'
    },
    {
      say: null,
      act: '你没抢。八秒之后红包没了，你看着"已领完"三个字。',
      fx: { face: 2, fame: -3 },
      replies: [
        { from: 'li', text: '新邻居没抢到吧？我再发一个' },
        { from: 'li', type: 'redpack', amt: 50, note: '补一个' },
        { from: 'wang', text: '李姐这待遇，我进群的时候可没有' }
      ],
      result: '第二个红包，你抢到了 11 块 6。'
    },
    {
      say: '刚进群就收红包不好，我发一个吧',
      fx: { face: 14, fame: 15, cash: -50}, flag: ['first_redbag'],
      replies: [
        { from: 'sys', sys: true, text: '你发了一个红包（50 元，20 个）' },
        { from: 'wang', text: '哟，新邻居会来事' },
        { from: 'sys', sys: true, text: '红包 3 秒被领完' },
        { from: 'momo', text: '谢谢老板[红包]' },
        { from: 'li', text: '这孩子实在' },
        { from: 'zhou', text: '谢谢' }
      ],
      result: '五十块钱，换了一整屏的"谢谢老板"。你觉得有点值。'
    }
  ]
})

E.push({
  id: 's1_momo_dm', stage: 1, time: '21:26',
  msgs: [
    { from: 'momo', text: '@1602 新邻居 亲，看你头像挺有气质的，做护肤的吗' },
    { from: 'momo', text: '我这边有个体验装，免费送，就是想让邻居试试' },
    { from: 'wang', text: '来了来了' },
    { from: 'momo', text: '王哥你上次那套还没用完呢' },
    { from: 'wang', text: '我用完了，挺好用的' }
  ],
  options: [
    {
      say: '不用了谢谢，我皮肤敏感',
      fx: { face: 3, weird: 2 },
      replies: [
        { from: 'momo', text: '敏感肌更需要修复呀，我这款就是专门针对敏感的' },
        { from: 'momo', text: '不买也没关系，先加个微信' },
        { from: 'zhou', text: '她说"不买也没关系"的时候，就是要买了' }
      ],
      result: 'Momo 没再追问。但她记住了你。'
    },
    {
      say: '好啊，怎么拿',
      fx: { face: 2, cash: -168, info: 5}, flag: ['momo_hook'],
      replies: [
        { from: 'momo', text: '太好了！体验装是免费的，就是邮费 12' },
        { from: 'momo', text: '对了你皮肤什么类型？我给你配一套基础的，原价 399 群里 168' },
        { from: 'momo', text: '我私你哈[亲亲]' }
      ],
      result: '你花了 168。那套东西后来一直在卫生间台面上。'
    },
    {
      say: null,
      act: '你点开她的头像看了一眼朋友圈，退出来，没回。',
      fx: { info: 10, fame: -2 },
      replies: [
        { from: 'momo', text: '亲在吗' },
        { from: 'momo', text: '体验装还剩三份哦' },
        { from: 'wang', text: '别催了，人家刚搬来' }
      ],
      result: '你翻完了她三年的朋友圈。全是发货单。'
    }
  ]
})

E.push({
  id: 's1_rumor', stage: 1, time: '07:02', day: 2,
  msgs: [
    { from: 'chen', text: '【紧急扩散】转发：这三种菜千万不能一起吃！！！' },
    { from: 'chen', text: '尤其是菠菜和豆腐，吃了等于吃砒霜，已经有人住院了' },
    { from: 'chen', type: 'img', text: '[图片]' },
    { from: 'li', text: '陈阿姨早上好' },
    { from: 'wang', text: '又来了' }
  ],
  options: [
    {
      say: '阿姨，这个是谣言，菠菜豆腐一起吃没事的',
      fx: { face: 5, fame: 10, weird: 4, info: 4 },
      replies: [
        { from: 'chen', text: '你年轻不懂，我这是为群里人好' },
        { from: 'wang', text: '新邻居我劝你别管，我管过' },
        { from: 'zhou', text: '菠菜里的草酸和豆腐里的钙结合，影响吸收，不是砒霜。焯一下水就没事了' },
        { from: 'chen', text: '……' },
        { from: 'li', text: '小周说的这个我信' }
      ],
      result: '陈阿姨那天没再发第二条。第二天照旧。'
    },
    {
      say: '谢谢陈阿姨提醒！',
      fx: { face: 6, info: -2 },
      replies: [
        { from: 'chen', text: '[玫瑰][玫瑰]还是新邻居懂事' },
        { from: 'chen', text: '我再发一个，关于喝水的，也很重要' },
        { from: 'wang', text: '完了，起头了' }
      ],
      result: '陈阿姨接下来发了九条。'
    },
    {
      say: null,
      act: '你把群消息设成了免打扰。',
      fx: { info: 2, fame: -4}, flag: ['muted_group'],
      replies: [
        { from: 'sys', sys: true, text: '你已将群消息设为免打扰' }
      ],
      result: '通知关了以后，群里安静了很多。'
    }
  ]
})

E.push({
  id: 's1_night', stage: 1, time: '02:11', day: 2,
  msgs: [
    { from: 'zhou', text: '有人也睡不着吗' },
    { from: 'zhou', text: '不是有事，就是睡不着' },
    { from: 'sys', sys: true, text: '（群里没有别人回话）' }
  ],
  options: [
    {
      say: '我也没睡',
      fx: { face: 8, fame: 8, info: 6}, flag: ['zhou_friend'],
      replies: [
        { from: 'zhou', text: '哦，新邻居' },
        { from: 'zhou', text: '你别说话，我就随便说一句' },
        { from: 'zhou', text: '这楼隔音太差，楼上每天十二点半拖椅子' },
        { from: 'zhou', text: '我住 1502。就这个事，别在群里说' }
      ],
      result: '凌晨两点的群，比白天诚实。'
    },
    {
      say: null,
      act: '你看了两秒，锁屏。',
      fx: { fame: -2 },
      replies: [
        { from: 'sys', sys: true, text: '小周撤回了一条消息' }
      ],
      result: '第二天醒来，那条消息已经不见了。'
    },
    {
      say: '睡不着就早点睡',
      fx: { face: -3, weird: 5, fame: 4 },
      replies: [
        { from: 'zhou', text: '……' },
        { from: 'zhou', text: '有道理' },
        { from: 'zhou', text: '谢谢你，我这就去睡' }
      ],
      result: '你也不知道自己为什么这么回。'
    }
  ]
})

E.push({
  id: 's1_rules', stage: 1, time: '21:58',
  msgs: [
    { from: 'li', text: '@所有人 群规再发一遍，新进群的邻居看一下' },
    { from: 'li', text: '一、不发广告　二、不吵架　三、有事说事，不@所有人（除了我）　四、晚上十一点后尽量安静' },
    { from: 'li', text: '收到的回个"收到"' },
    { from: 'wang', text: '收到' },
    { from: 'momo', text: '收到[爱心]' },
    { from: 'chen', text: '收到' },
    { from: 'sys', sys: true, text: '还有 41 人回复了"收到"' }
  ],
  options: [
    {
      say: '收到',
      fx: { face: 6, fame: 4 },
      replies: [
        { from: 'li', text: '好，新邻居也收到了' }
      ],
      result: '一个"收到"，成本最低的合群。'
    },
    {
      say: '收到。不过群规第三条和第五条@所有人有点矛盾哈',
      fx: { face: 2, fame: 14, weird: 8, info: 5}, flag: ['asked_rules'],
      replies: [
        { from: 'wang', text: '哈哈哈哈哈' },
        { from: 'wang', text: '新邻居是个讲究人' },
        { from: 'li', text: '我是群主，我发通知不算' },
        { from: 'li', text: '……不过你说得也有道理' },
        { from: 'zhou', text: '这条我记下了' }
      ],
      result: '你成了第一个在群里读群规的人。'
    },
    {
      say: null,
      act: '你没回。四十三个人回复了"收到"，你不在里面。',
      fx: { face: -5, fame: -4, info: 3 },
      replies: [
        { from: 'li', text: '@1602 新邻居 看到回一下哈' },
        { from: 'li', text: '新人要融入' }
      ],
      result: '李姐单独 @ 了你。这比在群里回一句更显眼。'
    }
  ]
})

/* ==================== 阶段 2 · 头一个星期 ==================== */

E.push({
  id: 's2_sorting', stage: 2, time: '08:15',
  msgs: [
    { from: 'zhang', text: '【通知】本周起垃圾分类调整为每天 7:00—9:00、18:00—20:00 两个时段投放' },
    { from: 'zhang', text: '非投放时段撤桶，请各位业主配合，谢谢' },
    { from: 'li', text: '大家注意时间，别乱扔了啊' },
    { from: 'wang', text: '这时段谁定的？上班的人怎么办' },
    { from: 'zhang', text: '您好，这是街道统一要求' }
  ],
  options: [
    {
      say: '上班族确实赶不上晚上八点前，能不能申请延时',
      fx: { face: 9, fame: 12, info: 5, group: -2 },
      replies: [
        { from: 'wang', text: '对！新邻居说到点子上了' },
        { from: 'wang', text: '我说句公道话，这事就是没考虑上班的' },
        { from: 'zhang', text: '您的建议我记录一下，反馈给相关部门' },
        { from: 'li', text: '小张，这个真得反映，我们楼里年轻人多' }
      ],
      result: '物业没改。但你在群里第一次被当成"能说话的人"。'
    },
    {
      say: '收到，谢谢提醒',
      fx: { face: 4 },
      replies: [
        { from: 'zhang', text: '感谢您的理解' },
        { from: 'wang', text: '就你懂事' }
      ],
      result: '你配合了。事情没变。'
    },
    {
      say: null,
      act: '你算了一下自己下班的时间，觉得反正也赶不上。',
      fx: { info: 3, fame: -3 },
      replies: [
        { from: 'wang', text: '没人说话就是默认了啊' },
        { from: 'li', text: '大家克服一下' }
      ],
      result: '那天晚上，你把垃圾放在楼道口。第二天被人拍了照发群里。'
    }
  ]
})

E.push({
  id: 's2_groupbuy', stage: 2, time: '10:33',
  msgs: [
    { from: 'li', text: '有要土鸡蛋的吗？我表妹农场直发，30 个 45，30 个起送' },
    { from: 'li', text: '接龙：' },
    { from: 'li', text: '1. 李桂芬 30' },
    { from: 'chen', text: '2. 陈秀兰 30' },
    { from: 'wang', text: '3. 王大炮 60' },
    { from: 'momo', text: '4. Momo 30[爱心]' }
  ],
  options: [
    {
      say: '5. 1602 30',
      fx: { face: 7, fame: 6}, flag: ['groupbuy_ok'],
      replies: [
        { from: 'li', text: '好，够了，明天到' },
        { from: 'li', text: '明天下午五点在 1 单元门口领，记得带袋子' },
        { from: 'wang', text: '新邻居第一次跟团啊，欢迎入坑' }
      ],
      result: '第二天你拿到三十个鸡蛋，破了两个。'
    },
    {
      say: '这个价格超市也能买到吧',
      fx: { face: -4, fame: 8, info: 4, weird: 5 },
      replies: [
        { from: 'li', text: '超市的是笼养的，我这是散养' },
        { from: 'wang', text: '新邻居，李姐的东西不会错' },
        { from: 'chen', text: '我买了三年了，好得很' },
        { from: 'li', text: '不买没关系，不用这么说' }
      ],
      result: '李姐的语气没变。但"不买没关系"这句，群里的人都听懂了。'
    },
    {
      say: null,
      act: '你往上翻了翻，看有多少人接龙。',
      fx: { info: 8, fame: -2 },
      replies: [
        { from: 'sys', sys: true, text: '接龙到 27 号。三十个人。' },
        { from: 'li', text: '还差三份，凑个整' }
      ],
      result: '三十分钟内，487 人的群有 30 个人买了鸡蛋。你记住了这个比例。'
    }
  ]
})

E.push({
  id: 's2_elevator', stage: 2, time: '19:47',
  msgs: [
    { from: 'wang', type: 'voice', sec: 42, text: '又是二单元那部电梯！我跟物业说了八回了，今天我妈被困在里面二十分钟，按铃没人接，你们说这叫什么服务' },
    { from: 'wang', text: '我说句公道话，这钱我们一分没少交' },
    { from: 'zhang', text: '王先生您好，二单元电梯今天 19:20 已恢复运行，维保人员已到场处理' },
    { from: 'wang', text: '已恢复？我妈在里面按了二十分钟铃' },
    { from: 'zhao', text: '维保记录能公示吗？按规定每半个月一次' },
    { from: 'zhang', text: '相关资料会在公示栏张贴' }
  ],
  options: [
    {
      say: '我前天也遇到过，门关到一半卡住了',
      fx: { face: 10, fame: 10, info: 6, group: -3 },
      replies: [
        { from: 'wang', text: '你看！不是一回两回了' },
        { from: 'wang', text: '新邻居你也遇到过啊' },
        { from: 'zhao', text: '我记一下，这个要写进材料' },
        { from: 'zhang', text: '感谢反馈，我们会加强巡检' }
      ],
      result: '你的证词让这件事从"王大哥又在闹"变成了"确实有问题"。'
    },
    {
      say: '人没事就好，电梯这东西坏了也没办法',
      fx: { face: -2, group: 3, fame: 5 },
      replies: [
        { from: 'wang', text: '什么叫没办法？' },
        { from: 'wang', text: '新邻居你这话我不爱听' },
        { from: 'zhao', text: '小王，人家也是好意' },
        { from: 'li', text: '都少说两句' }
      ],
      result: '群里的火，从物业身上烧到了你身上，一会儿。'
    },
    {
      say: null,
      act: '你没说话。二单元的电梯你也没坐过几次。',
      fx: { fame: -3, group: -1 },
      replies: [
        { from: 'wang', text: '487 个人，没一个人说话' },
        { from: 'wang', text: '行，我记住了' },
        { from: 'zhou', text: '我在。但我在三单元' }
      ],
      result: '王大炮记住了 487 个人里的沉默。包括你。'
    }
  ]
})

E.push({
  id: 's2_noise', stage: 2, time: '23:12',
  msgs: [
    { from: 'li', text: '楼上的邻居，能不能小点声，孩子明天考试' },
    { from: 'li', text: '我说的是 1601' },
    { from: 'wang', text: '1601 那家天天半夜拖椅子' },
    { from: 'sys', sys: true, text: '（1601 没有回话）' }
  ],
  options: [
    {
      say: '我住 1602，不是我家，但我这边也听到拖动的声音，像是楼上 1702',
      fx: { face: 12, fame: 14, info: 8}, flag: ['neighbor_fair'],
      replies: [
        { from: 'li', text: '啊，那我搞错了' },
        { from: 'li', text: '1601 的邻居对不起啊' },
        { from: 'sys', sys: true, text: '1601 撤回了一条消息' },
        { from: 'wang', text: '新邻居耳朵挺灵' },
        { from: 'li', text: '1702 我明天上门说' }
      ],
      result: '你替一个没说话的人挡了一下。这件事只有 1601 知道。'
    },
    {
      say: '我家也很吵，可能是楼板的问题',
      fx: { face: 3, info: -4, weird: 4 },
      replies: [
        { from: 'wang', text: '这楼的楼板是薄，我拖个椅子都心虚' },
        { from: 'li', text: '那还是得注意' }
      ],
      result: '你把话题从"谁"引到了"什么"。有人松了口气。'
    },
    {
      say: null,
      act: '你把手机调暗，怕吵到人。',
      fx: { fame: -4, face: 2 },
      replies: [
        { from: 'li', text: '1601 的，看到回一下' },
        { from: 'wang', text: '装死' }
      ],
      result: '那天之后，1601 再没在群里说过话。'
    }
  ]
})

E.push({
  id: 's2_smallgroup', stage: 2, time: '22:40',
  msgs: [
    { from: 'sys', sys: true, text: '「小周」邀请你加入群聊「8号楼真实邻居（41）」' },
    { from: 'zhou', text: '拉你进个小的' },
    { from: 'zhou', text: '大群太吵了' },
  ],
  cond: s => s.fame > 12,
  options: [
    {
      say: '这个群是干嘛的',
      fx: { face: 4, fame: 3, info: 12 },
      replies: [
        { from: 'zhou', text: '没什么干嘛的，就是能说人话的地方' },
        { from: 'zhou', text: '大群里李姐在，很多话不好说' },
        { from: 'zhou', text: '你别在大群提这个群' }
      ],
      result: '你进了那个 41 人的群。它安静得不像话。'
    },
    {
      say: '不了，我在大群待着就行',
      fx: { face: 3, info: -6}, flag: ['refused_small'],
      replies: [
        { from: 'zhou', text: '行' },
        { from: 'zhou', text: '那当我没说' }
      ],
      result: '小周没再提。但他对你的态度，从那天起变得客气了。'
    },
    {
      say: null,
      act: '你把两条群都留着，谁也没告诉。',
      fx: { info: 14, weird: 3 },
      replies: [
        { from: 'sys', sys: true, text: '你加入了群聊「8号楼真实邻居（41）」' }
      ],
      result: '从这天起，你同时活在两个群里。'
    }
  ]
})

E.push({
  id: 's2_parcel', stage: 2, time: '18:20',
  msgs: [
    { from: 'chen', text: '谁拿错了我的快递？就在 1 号柜，一个大纸箱，里面是给孙子买的棉袄' },
    { from: 'chen', text: '我找了一下午了[流泪]' },
    { from: 'li', text: '大家看看自己有没有拿错' },
    { from: 'wang', text: '柜子那边没监控吗' },
    { from: 'zhang', text: '快递柜区域监控正在维修' }
  ],
  options: [
    {
      say: '我下午在柜子那看到一个纸箱放在地上，以为是空的',
      fx: { face: 10, fame: 12, info: 8 },
      replies: [
        { from: 'chen', text: '你看到拿去哪了吗' },
        { from: 'chen', text: '求求你了孩子' },
        { from: 'li', text: '新邻居你好好想想' },
        { from: 'wang', text: '别急，慢慢说' }
      ],
      result: '你说完，群里安静了很久。那天晚上纸箱没找到。'
    },
    {
      say: '陈阿姨，你问问 2 单元 302，他经常拿错',
      fx: { face: -6, fame: 8, info: 6, weird: 10 },
      replies: [
        { from: 'chen', text: '302？' },
        { from: 'li', text: '你怎么知道是 302' },
        { from: 'wang', text: '新邻居消息挺灵啊' },
        { from: 'sys', sys: true, text: '302 加入群聊' },
          ],
      result: '你提供了一个名字。之后两天，302 在群里被问了四次。'
    },
    {
      say: null,
      act: '你没说话。棉袄不是你的。',
      fx: { fame: -3, face: -2 },
      replies: [
        { from: 'chen', text: '算了，我再买一件吧' },
        { from: 'li', text: '陈阿姨别难过' },
        { from: 'wang', text: '这楼里什么人都有' }
      ],
      result: '陈阿姨自己又买了一件。她没再提这件事。'
    }
  ]
})

E.push({
  id: 's2_vacuum', stage: 2, time: '13:05',
  msgs: [
    { from: 'momo', text: '姐妹们！我拿到一批戴森平替，工厂尾单，399 一台，商场 2999' },
    { from: 'momo', type: 'img', text: '[图片]' },
    { from: 'momo', text: '就 6 台，先到先得，不议价' },
    { from: 'wang', text: '上次你说尾单的净水器，我用了仨月就坏了' },
    { from: 'momo', text: '王哥那是你不会用[捂脸]' }
  ],
  options: [
    {
      say: '399 的戴森平替，电机成本都不够吧',
      fx: { face: 5, fame: 14, weird: 6, info: 8}, flag: ['called_momo'],
      replies: [
        { from: 'momo', text: '亲你懂电机吗[微笑]' },
        { from: 'zhou', text: '他不一定懂，但他算得对' },
        { from: 'wang', text: '哈哈哈哈哈小周' },
        { from: 'momo', text: '你们不买可以，别影响别人买' },
        { from: 'li', text: '都别吵，群规第二条' }
      ],
      result: '那天 Momo 一台都没卖出去。她记住了你。'
    },
    {
      say: '有链接吗，我看看',
      fx: { cash: -399, info: 4}, flag: ['momo_hook'],
      replies: [
        { from: 'momo', text: '私你！[亲亲]' },
        { from: 'wang', text: '又一个' },
        { from: 'momo', text: '王哥你别说话，你都买了' }
      ],
      result: '三个月后它不转了。你没在群里说。'
    },
    {
      say: null,
      act: '你把群消息划过去了。',
      fx: { info: 2 },
      replies: [
        { from: 'momo', text: '还剩 2 台' },
        { from: 'momo', text: '真的假的，这价格还要犹豫' },
        { from: 'chen', text: '我要一台[玫瑰]' },
        { from: 'wang', text: '陈阿姨别买' }
      ],
      result: '陈阿姨买了。王大炮在群里劝了三次，没劝住。'
    }
  ]
})

/* ==================== 阶段 3 · 第一个月 ==================== */

E.push({
  id: 's3_bikes', stage: 3, time: '16:30',
  msgs: [
    { from: 'zhang', text: '【通知】消防检查，请各位清理楼道内堆放的杂物，尤其是电动车、纸箱、鞋柜' },
    { from: 'zhang', text: '本周五前清理完毕，逾期将统一清理' },
    { from: 'wang', text: '楼道那个大柜子是谁家的？占了一半路' },
    { from: 'zhao', text: '9 楼那个，放了两年了' },
    { from: 'li', text: '9 楼的邻居出来说一下吧' },
    { from: 'sys', sys: true, text: '（9 楼没有回话）' }
  ],
  options: [
    {
      say: '我门口也放了个鞋架，今晚就收',
      fx: { face: 9, fame: 8, group: 4}, flag: ['clean_first'],
      replies: [
        { from: 'li', text: '新邻居这个态度好，大家学学' },
        { from: 'wang', text: '我那两箱瓷砖明天拉走' },
        { from: 'chen', text: '我门口的菜坛子也收' },
        { from: 'zhao', text: '都动起来就好办了' }
      ],
      result: '一晚上，楼道里少了七样东西。'
    },
    {
      say: '鞋架不放门口放哪？家里就那么点地方',
      fx: { face: -7, fame: 10, weird: 8, group: -2 },
      replies: [
        { from: 'wang', text: '这话说得' },
        { from: 'li', text: '消防通道是保命的，不是讲道理的' },
        { from: 'zhao', text: '新邻居，这条我支持群主' },
        { from: 'wang', text: '我也支持' }
      ],
      result: '你在群里第一次被三个人同时反驳。'
    },
    {
      say: null,
      act: '你看了看自己门口的鞋架，决定等周五再说。',
      fx: { fame: -4, group: -2 },
      replies: [
        { from: 'zhang', text: '周五上午开始统一清理，请知悉' },
        { from: 'wang', text: '到时候别怪人家扔你东西' }
      ],
      result: '周五你的鞋架被搬到了楼梯拐角。你找了半小时。'
    }
  ]
})

E.push({
  id: 's3_parking', stage: 3, time: '21:05',
  msgs: [
    { from: 'wang', text: '谁的车停我车位了？白色 SUV，尾号 7' },
    { from: 'wang', type: 'img', text: '[图片]' },
    { from: 'wang', text: '我按了十分钟喇叭了' },
    { from: 'li', text: '尾号 7……好像是 15 楼新来的' },
    { from: 'wang', text: '新来的也不能乱停啊' }
  ],
  options: [
    {
      say: '是我，不好意思，我马上下来挪',
      fx: { face: 12, fame: 8, info: 2 },
      replies: [
        { from: 'wang', text: '哦，是你啊' },
        { from: 'wang', text: '下次注意啊，我这车位一年两千四' },
        { from: 'li', text: '新邻居态度好，大炮你也别上火' },
        { from: 'wang', text: '我没上火，我就是急' }
      ],
      result: '你下去挪车，王大炮在楼下等你，递了根烟。'
    },
    {
      say: null,
      act: '你看到了，但没回。你想等他走了再下去。',
      fx: { face: -14, fame: 6, weird: 6}, flag: ['parking_incident'],
      replies: [
        { from: 'wang', text: '没人认？' },
        { from: 'wang', text: '那我叫拖车了啊' },
        { from: 'li', text: '先别，等等' },
        { from: 'wang', text: '我等了二十分钟了' },
        { from: 'sys', sys: true, text: '（你把车挪走了，没人看见）' }
      ],
      result: '车挪了，但"1602 停别人车位还不吭声"这句话，在群里留了三天。'
    },
    {
      say: '王哥，那个车位好像是公共的，我看物业画线画到那边了',
      fx: { face: -3, fame: 12, weird: 6, info: 8}, flag: ['parking_incident'],
      replies: [
        { from: 'wang', text: '公共的？我交了两千四' },
        { from: 'wang', text: '你要是有意见，咱们去物业对账' },
        { from: 'zhao', text: '这个我 interest，车位划线确实有争议' },
        { from: 'li', text: '好了好了，先把车挪了再说' }
      ],
      result: '一件挪车的小事，被你聊成了产权问题。'
    }
  ]
})

E.push({
  id: 's3_station', stage: 3, time: '09:40',
  msgs: [
    { from: 'chen', text: '【速看】小区东边要建垃圾中转站！已经开始动工了！' },
    { from: 'chen', type: 'img', text: '[图片]' },
    { from: 'chen', text: '以后我们天天闻臭味，房子也要跌价' },
    { from: 'wang', text: '真的假的？' },
    { from: 'momo', text: '房价跌了我这房子怎么办[流泪]' },
    { from: 'zhao', text: '消息来源是哪？规划公示在哪看到的' },
    { from: 'chen', text: '我姐妹发的，她住在隔壁小区' }
  ],
  options: [
    {
      say: '我去查一下规划公示，五分钟',
      fx: { face: 12, fame: 16, info: 18, group: 5}, flag: ['fact_check'],
      replies: [
        { from: 'sys', sys: true, text: '（五分钟后）' },
        { from: 'me', text: '查到了。东边那块地规划是"环卫设施用地"，但不是中转站，是垃圾收集点，服务半径 500 米' },
        { from: 'zhao', text: '收集点，不是中转站。这两回事' },
        { from: 'wang', text: '那就是没事？' },
        { from: 'chen', text: '那也不好啊，收集点也臭' },
        { from: 'li', text: '新邻居办事靠谱，比转发强' }
      ],
      result: '你花五分钟，拆了一条传了两天的谣言。'
    },
    {
      say: '先别慌，等官方通知吧',
      fx: { face: 3, group: 2 },
      replies: [
        { from: 'chen', text: '等通知就晚了！' },
        { from: 'wang', text: '陈阿姨说得对，这种事不能等' },
        { from: 'zhao', text: '但也别瞎传。我先去问问' }
      ],
      result: '群里恐慌了两个小时。最后发现是隔壁小区的收集点。'
    },
    {
      say: '垃圾站建哪都比建我家门口强',
      fx: { face: -5, fame: 12, weird: 14, info: -3, group: -4 },
      replies: [
        { from: 'wang', text: '……' },
        { from: 'momo', text: '你这话什么意思' },
        { from: 'li', text: '新邻居开玩笑呢吧' },
        { from: 'chen', text: '年轻人说话要注意' }
      ],
      result: '这句话后来被截图了。你自己也觉得不该说。'
    }
  ]
})

E.push({
  id: 's3_sign', stage: 3, time: '20:55',
  msgs: [
    { from: 'zhao', text: '各位邻居，我整理了一份材料，关于这两年公共收益的去向' },
    { from: 'zhao', text: '电梯广告、快递柜、场地租金，加起来不是小数，但账目一直没公示' },
    { from: 'zhao', text: '我准备提交业委会筹备申请，需要 20 户签名。愿意的接龙' },
    { from: 'zhao', text: '1. 赵建国 1601' },
    { from: 'li', text: '老赵，这事你跟物业沟通过吗' },
    { from: 'zhao', text: '沟通过六次' }
  ],
  options: [
    {
      say: '2. 1602',
      fx: { face: 4, fame: 14, info: 12, group: -6}, flag: ['zhao_team'],
      replies: [
        { from: 'zhao', text: '谢谢！我把材料发你一份' },
        { from: 'zhao', text: '这个你留着，别外传' },
        { from: 'wang', text: '3. 王大炮。我不是针对谁，我就是想知道钱去哪了' },
        { from: 'li', text: '……你们搞吧，我不参与' }
      ],
      result: '签名到第 9 个就停了。老赵说没关系，他不急。'
    },
    {
      say: '签名之前，能不能先看看材料',
      fx: { face: 8, fame: 10, info: 10}, flag: ['careful'],
      replies: [
        { from: 'zhao', text: '应该的。我发群里' },
        { from: 'zhao', type: 'img', text: '[文件] 公共收益疑问十条.pdf' },
        { from: 'wang', text: '十二页？' },
        { from: 'zhou', text: '我看了，第二页那个数对不上' },
        { from: 'zhao', text: '小周你帮我看看' }
      ],
      result: '你没签名，但你让这件事变得可信了一点。'
    },
    {
      say: null,
      act: '你没接龙。你才住一个月。',
      fx: { fame: -2, group: 2 },
      replies: [
        { from: 'zhao', text: '还差十一户' },
        { from: 'zhao', text: '不急，慢慢来' },
        { from: 'li', text: '老赵，别搞得太僵' }
      ],
      result: '签名接龙在第九个停住了。你后来有点后悔。'
    }
  ]
})

E.push({
  id: 's3_cat', stage: 3, time: '07:50',
  msgs: [
    { from: 'chen', text: '谁家的橘猫丢了？在 3 单元车棚里躲着，不吃东西' },
    { from: 'chen', type: 'img', text: '[图片]' },
    { from: 'li', text: '哎呀怪可怜的' },
    { from: 'momo', text: '是不是 12 楼那家的？她家养了三只' },
    { from: 'wang', text: '12 楼那家上个月搬走了' }
  ],
  options: [
    {
      say: '我先去看看，我家有猫粮',
      fx: { face: 16, fame: 16, info: 5}, flag: ['cat_hero'],
      replies: [
        { from: 'chen', text: '好孩子[玫瑰]' },
        { from: 'sys', sys: true, text: '（二十分钟后）' },
        { from: 'me', type: 'img', text: '[图片]' },
        { from: 'me', text: '抓到了，很瘦，身上没伤。先放我家一晚' },
        { from: 'li', text: '新邻居真是好人' },
        { from: 'wang', text: '我家有猫砂，一会儿给你送过去' },
        { from: 'momo', text: '我转发一下朋友圈' }
      ],
      result: '那天群里第一次没有人吵架。'
    },
    {
      say: '别喂，喂了它就赖着不走了',
      fx: { face: -8, fame: 8, weird: 8, group: -3 },
      replies: [
        { from: 'chen', text: '……' },
        { from: 'li', text: '是条命啊' },
        { from: 'wang', text: '新邻居你这话说的' },
        { from: 'chen', text: '我去喂' }
      ],
      result: '陈阿姨自己去喂了。猫留了下来，现在住在车棚。'
    },
    {
      say: null,
      act: '你想起自己对猫毛过敏。',
      fx: { fame: -3, info: 3 },
      replies: [
        { from: 'chen', text: '那我先带回家了' },
        { from: 'li', text: '陈阿姨心善' },
        { from: 'wang', text: '她家已经四只了' }
      ],
      result: '猫被陈阿姨带回了家。她家现在有五只。'
    }
  ]
})

E.push({
  id: 's3_job', stage: 3, time: '14:22',
  msgs: [
    { from: 'momo', text: '群里有没有想搞副业的姐妹' },
    { from: 'momo', text: '我这边团队在扩，不用囤货，发发朋友圈就行' },
    { from: 'momo', text: '上个月我们组一个小姑娘赚了 8000 多' },
    { from: 'momo', type: 'img', text: '[图片]' },
    { from: 'wang', text: '8000？' },
    { from: 'momo', text: '王哥你要不要也来[偷笑]' }
  ],
  options: [
    {
      say: '是拉人头还是卖货？',
      fx: { face: 6, fame: 14, weird: 6, info: 10}, flag: ['called_momo'],
      replies: [
        { from: 'momo', text: '都不是，是分享经济[微笑]' },
        { from: 'zhou', text: '那就是拉人头' },
        { from: 'wang', text: '哈哈哈哈' },
        { from: 'momo', text: '小周你别乱说' },
        { from: 'li', text: 'Momo，群规第一条' }
      ],
      result: '那句话之后，Momo 在群里安静了半个月。'
    },
    {
      say: '有兴趣，具体怎么做',
      fx: { cash: -600, info: 6}, flag: ['momo_team'],
      replies: [
        { from: 'momo', text: '先拿个 600 的启动包，后面就是发圈、加人' },
        { from: 'momo', text: '我带你，一个月回本' },
        { from: 'zhou', text: '600 买个教训，不算贵' },
        { from: 'momo', text: '小周！' }
      ],
      result: '你进了她的群。群里 200 个人，有 180 个在卖同一批货。'
    },
    {
      say: null,
      act: '你看了看自己银行卡余额，退出了聊天。',
      fx: { cash: 0, info: 2 },
      replies: [
        { from: 'momo', text: '没人吗' },
        { from: 'momo', text: '机会不等人哦' }
      ],
      result: '没人回。这条消息在群里挂了四个小时。'
    }
  ]
})

E.push({
  id: 's3_wrongperson', stage: 3, time: '11:18',
  msgs: [
    { from: 'wang', text: '@1602 你之前是不是在 5 号楼住过' },
    { from: 'wang', text: '有个叫张伟的，欠我三千块材料钱，也住 1602' },
    { from: 'wang', text: '我这不是说你啊，我就是问问' },
    { from: 'li', text: '大炮' },
    { from: 'wang', text: '我真就是问问' }
  ],
  options: [
    {
      say: '不是我。我上个月才搬来，之前那户我不认识',
      fx: { face: 8, fame: 6, info: 5 },
      replies: [
        { from: 'wang', text: '哦哦，那不好意思' },
        { from: 'wang', text: '主要这名字太常见了' },
        { from: 'chen', text: '大炮你说话注意点' },
        { from: 'li', text: '人家新邻居脾气好' }
      ],
      result: '误会解开了。但群里有人开始叫你"1602"。'
    },
    {
      say: '他欠你钱你去找他，别在群里 @ 我',
      fx: { face: 2, fame: 16, weird: 8}, flag: ['hard_edge'],
      replies: [
        { from: 'wang', text: '我不是那个意思' },
        { from: 'wang', text: '你这人怎么这样' },
        { from: 'zhao', text: '小王确实不该在群里这么问' },
        { from: 'li', text: '都少一句' }
      ],
      result: '你赢了道理。群里安静了十分钟。'
    },
    {
      say: null,
      act: '你盯着那三条 @，没回。',
      fx: { face: -10, fame: -4, weird: 6}, flag: ['wrong_person'],
      replies: [
        { from: 'wang', text: '不回就是默认了啊' },
        { from: 'li', text: '大炮！' },
        { from: 'wang', text: '开玩笑的' },
        { from: 'zhou', text: '不好笑' }
      ],
      result: '"1602 欠钱"这句话，在群里活了整整一周。'
    }
  ]
})

return E
})
