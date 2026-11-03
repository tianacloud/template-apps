/**
 * core/events.js —— 群聊模拟器 · 事件池（阶段 4—6）
 * 格式同 events.js
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.GcEvents2 = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const E = []

/* ==================== 阶段 4 · 那件事 ==================== */

E.push({
  id: 's4_repair', stage: 4, pin: true, time: '19:30',
  msgs: [
    { from: 'zhang', text: '【重要通知】8 号楼两部电梯使用年限已达 15 年，经检测需大修，预算 78 万元' },
    { from: 'zhang', text: '维修基金不足部分，按户分摊，每户 1200 元，本月 30 日前缴纳' },
    { from: 'zhang', text: '缴费方式：物业办公室现场或转账，备注房号' },
    { from: 'wang', text: '多少？1200？' },
    { from: 'wang', text: '维修基金呢？我们买房的时候都交过的' },
    { from: 'zhao', text: '维修基金账上还剩多少，能不能先公示' },
    { from: 'zhang', text: '这个需要向上级申请查询' },
    { from: 'wang', text: '又是向上级申请' }
  ],
  options: [
    {
      say: '1200 我可以交，但要求先公示维修基金余额和使用明细',
      fx: { face: 14, fame: 20, info: 12, group: 8}, flag: ['firm_but_fair'],
      replies: [
        { from: 'wang', text: '对！这才是讲道理的说法' },
        { from: 'zhao', text: '我同意，钱可以出，账要清' },
        { from: 'li', text: '新邻居这话在理，小张你记一下' },
        { from: 'zhang', text: '好的，我反馈' },
        { from: 'chen', text: '那我也交，但是要看账' },
        { from: 'zhou', text: '+1' }
      ],
      result: '那天晚上，群里第一次形成了共识。你成了那个说出口的人。'
    },
    {
      say: '凭什么让业主出？这是物业的责任',
      fx: { face: 2, fame: 16, weird: 8, group: -8}, flag: ['zhao_team'],
      replies: [
        { from: 'wang', text: '说得好' },
        { from: 'zhao', text: '也不能这么说，大修确实是业主共担' },
        { from: 'wang', text: '老赵你哪边的' },
        { from: 'li', text: '别吵了，先把事说清楚' },
        { from: 'zhang', text: '电梯属于共有部分，大修费用由业主共同承担，这是规定' }
      ],
      result: '你点燃了情绪，但没有推进事情。'
    },
    {
      say: '我交，什么时候都可以',
      fx: { face: 4, fame: -4, group: 3, cash: -1200}, flag: ['paid_early'],
      replies: [
        { from: 'li', text: '新邻居爽快' },
        { from: 'wang', text: '就是有你这样的人，物业才敢这么收' },
        { from: 'zhang', text: '感谢配合，已登记' },
        { from: 'zhao', text: '……' }
      ],
      result: '你第一个交了钱。电梯三个月后修好。'
    },
    {
      say: null,
      act: '你把通知看了三遍，退出了群聊界面。',
      fx: { fame: -6, group: -3, cash: 0 },
      replies: [
        { from: 'wang', text: '487 户，一户 1200，就是五十八万' },
        { from: 'zhao', text: '78 万的预算，58 万来自业主，剩下 20 万从哪出，通知里没写' },
        { from: 'li', text: '老赵你算得真快' },
        { from: 'zhang', text: '维修基金承担剩余部分' }
      ],
      result: '数字被人算清楚了。你没参与，但你记住了 58 万这个数。'
    }
  ]
})

E.push({
  id: 's4_water', stage: 4, time: '06:12', day: 2,
  msgs: [
    { from: 'zhang', text: '【停水通知】因主管道抢修，今日 8:00—20:00 全楼停水，请提前储水' },
    { from: 'zhang', text: '恢复供水后可能出现短时浑浊，请放水几分钟' },
    { from: 'wang', text: '昨天怎么不说' },
    { from: 'chen', text: '我家一滴水都没存' },
    { from: 'li', text: '大家互相帮衬一下，谁家有多余的水' }
  ],
  options: [
    {
      say: '我家存了两桶，16 楼谁需要可以来拿',
      fx: { face: 16, fame: 14, group: 6}, flag: ['water_helper'],
      replies: [
        { from: 'chen', text: '好孩子，我一会儿让孙子上去拿' },
        { from: 'li', text: '看看，这就是邻居' },
        { from: 'momo', text: '我也存了，有需要的说' },
        { from: 'wang', text: '我车库有一箱矿泉水，谁要下来拿' }
      ],
      result: '那天 16 楼来了四个人敲门。你认识了三家。'
    },
    {
      say: '通知太晚了，家里有婴儿的怎么办',
      fx: { face: 6, fame: 10, group: -2 },
      replies: [
        { from: 'zhang', text: '确实是突发情况，给您带来不便非常抱歉' },
        { from: 'wang', text: '道歉有用的话' },
        { from: 'li', text: '好了，先解决水的问题' }
      ],
      result: '物业第二天在群里发了一箱水，放在门卫。'
    },
    {
      say: null,
      act: '你打开水龙头，接满了浴缸。',
      fx: { info: 5, group: 0 },
      replies: [
        { from: 'chen', text: '谁能借我一点水，我给钱' },
        { from: 'sys', sys: true, text: '（没有人回）' },
        { from: 'li', text: '陈阿姨你上来我家拿' }
      ],
      result: '你有水。你没说话。'
    }
  ]
})

E.push({
  id: 's4_shower', stage: 4, time: '00:38', day: 2,
  msgs: [
    { from: 'wang', text: '谁家半夜洗澡啊？水声跟瀑布一样' },
    { from: 'wang', text: '已经第三个晚上了' },
    { from: 'wang', type: 'voice', sec: 18, text: '你们听听这个声音，这是人睡觉的时候该有的声音吗' },
    { from: 'li', text: '都这个点了，明天再说吧' },
    { from: 'wang', text: '我明天还要上班' }
  ],
  options: [
    {
      say: '是我。我上夜班，十二点半到家，洗完就睡。尽量小声了',
      fx: { face: 10, fame: 8, info: 8}, flag: ['night_shift'],
      replies: [
        { from: 'wang', text: '……' },
        { from: 'wang', text: '你早说啊' },
        { from: 'wang', text: '那你也没办法' },
        { from: 'li', text: '原来是这样，那大炮你也别气了' },
        { from: 'wang', text: '我不是气，我是睡不着' },
        { from: 'zhou', text: '我懂' }
      ],
      result: '王大炮第二天在群里发了个隔音垫的链接。'
    },
    {
      say: null,
      act: '不是你。你放下手机，等这场架吵完。',
      fx: { fame: -4, info: 6 },
      replies: [
        { from: 'wang', text: '没人认是吧' },
        { from: 'wang', text: '那我明天挨家挨户敲门' },
        { from: 'li', text: '大炮你别这样' },
        { from: 'zhao', text: '这楼的管道声音确实大，未必是谁在洗澡' }
      ],
      result: '第二天王大炮真的敲了六家门。没有一家承认。'
    },
    {
      say: '王哥，这楼的管道是铁管，水声会顺着墙传，不一定是正上方',
      fx: { face: 8, fame: 12, info: 10, group: 3, weird: 4 },
      replies: [
        { from: 'wang', text: '还有这说法？' },
        { from: 'zhou', text: '对，我家也听得到，但我楼上没人住' },
        { from: 'wang', text: '……那我骂了三天空气？' },
        { from: 'li', text: '哈哈哈哈' },
        { from: 'chen', text: '大炮你笑死我了' }
      ],
      result: '群里第一次因为王大炮笑成一片。他没生气。'
    }
  ]
})

E.push({
  id: 's4_fee', stage: 4, time: '10:00', day: 2,
  msgs: [
    { from: 'zhang', text: '【公示】自下月起，物业服务费由 2.3 元/㎡ 调整为 2.8 元/㎡' },
    { from: 'zhang', text: '调整依据：人工成本上涨，服务标准提升（详见附件）' },
    { from: 'zhang', type: 'img', text: '[图片]' },
    { from: 'wang', text: '又涨' },
    { from: 'zhao', text: '服务标准提升在哪？保安还是那两个人，保洁还是三天一次' },
    { from: 'li', text: '这个确实要说说' }
  ],
  options: [
    {
      say: '涨价可以，但得先说到做到。建议列个服务清单，季度考核',
      fx: { face: 14, fame: 18, info: 10, group: 8}, flag: ['service_list'],
      replies: [
        { from: 'zhao', text: '这个提议好，我可以起草' },
        { from: 'wang', text: '我同意，做不到就退钱' },
        { from: 'zhang', text: '我会把建议提交公司' },
        { from: 'li', text: '新邻居，你要不要进业委会' },
        { from: 'wang', text: '我附议' },
        { from: 'zhou', text: '附议' }
      ],
      result: '你第一次被提名进业委会。你没答应，也没拒绝。'
    },
    {
      say: '涨就涨吧，一个月也就多几十块',
      fx: { face: -8, fame: 6, group: -4 },
      replies: [
        { from: 'wang', text: '几十块？一年六百' },
        { from: 'wang', text: '你这态度就是物业敢涨的原因' },
        { from: 'li', text: '大炮说话别这么冲' },
        { from: 'zhao', text: '不过他说得有一点道理' }
      ],
      result: '你被当成了"不关心的人"。这个标签贴上就很难撕。'
    },
    {
      say: null,
      act: '你算了一下，一年多交 600。你决定先不交，看看别人。',
      fx: { info: 6, group: -2}, flag: ['wait_and_see'],
      replies: [
        { from: 'wang', text: '我提议，大家一起缓交' },
        { from: 'zhao', text: '缓交有风险，可能被起诉' },
        { from: 'li', text: '别冲动' },
        { from: 'zhang', text: '如对费用有异议，可通过书面形式提出' }
      ],
      result: '最后有 30 多户缓交。你不在名单里，但你也没交。'
    }
  ]
})

E.push({
  id: 's4_pdf', stage: 4, time: '21:20',
  msgs: [
    { from: 'zhao', text: '各位，材料整理完了，12 页，我发群里' },
    { from: 'zhao', type: 'img', text: '[文件] 关于8号楼公共收益的十个疑问.pdf' },
    { from: 'zhao', text: '第一，电梯广告两年收入约 14 万，未公示；第二，快递柜场地费每年 6000' },
    { from: 'zhao', text: '第三，去年大修基金支出 32 万，无明细' },
    { from: 'wang', text: '老赵你是真干了' },
    { from: 'li', text: '老赵，这东西发群里合适吗' },
    { from: 'zhao', text: '有什么不合适' }
  ],
  options: [
    {
      say: '我看了，第五页那个数字和前面对不上，建议再核一遍',
      fx: { face: 10, fame: 16, info: 20, group: 4}, flag: ['zhao_team'],
      replies: [
        { from: 'zhao', text: '哪一页？' },
        { from: 'me', text: '第五页，年度支出合计比明细多了 2.3 万' },
        { from: 'zhao', text: '……我看看' },
        { from: 'zhao', text: '你说得对，是我加错了' },
        { from: 'zhao', text: '改完再发一版。谢谢' },
        { from: 'wang', text: '这俩人开始上班了' },
        { from: 'li', text: '……' }
      ],
      result: '你把一份会被攻击的材料，变成了不太容易被攻击的材料。'
    },
    {
      say: '老赵辛苦了，但这个发群里，物业会不会针对你',
      fx: { face: 12, fame: 12, info: 10}, flag: ['li_friend'],
      replies: [
        { from: 'zhao', text: '我一个退休的，怕什么' },
        { from: 'li', text: '新邻居这话说得对，老赵你注意点' },
        { from: 'zhao', text: '我注意什么，我又没做亏心事' },
        { from: 'li', text: '我是为你好' }
      ],
      result: '老赵没听。但李姐记住了你替她说了那句她不好意思说的话。'
    },
    {
      say: null,
      act: '你把 PDF 存到了手机里，没在群里说话。',
      fx: { info: 16, fame: -2 },
      replies: [
        { from: 'wang', text: '我转给我一个做律师的朋友看看' },
        { from: 'zhao', text: '别外传' },
        { from: 'wang', text: '晚了，已经转了' },
        { from: 'zhao', text: '……' }
      ],
      result: '三天后，这份 PDF 出现在了隔壁小区的群里。'
    }
  ]
})

E.push({
  id: 's4_momo_exposed', stage: 4, time: '15:45', day: 2,
  msgs: [
    { from: 'chen', text: 'Momo，我在你这买的面膜，用了脸过敏，去医院了' },
    { from: 'chen', type: 'img', text: '[图片]' },
    { from: 'chen', text: '医生说激素脸，要养半年' },
    { from: 'momo', text: '阿姨，这个跟个人肤质有关系，我卖了三年没人这样' },
    { from: 'wang', text: '我早说了' },
    { from: 'li', text: 'Momo，这事你得给个说法' }
  ],
  options: [
    {
      say: '先别吵。陈阿姨，把包装和批号拍一下，去查备案',
      fx: { face: 18, fame: 18, info: 14, group: 8}, flag: ['momo_exposed_help'],
      replies: [
        { from: 'chen', text: '我这就拍' },
        { from: 'chen', type: 'img', text: '[图片]' },
        { from: 'me', text: '这个批号在药监局网站查不到备案' },
        { from: 'wang', text: '那就是三无产品' },
        { from: 'momo', text: '我上家说有的……' },
        { from: 'li', text: 'Momo，你在群里卖东西，出了事你要负责' },
        { from: 'momo', text: '我退她钱' },
        { from: 'chen', text: '退了就完了？我这张脸' }
      ],
      result: 'Momo 退了钱，退了群三天。回来的时候头像换回了真人。'
    },
    {
      say: '陈阿姨，便宜面膜本来就有风险，你也别全怪人家',
      fx: { face: -14, fame: 14, weird: 10, group: -6 },
      replies: [
        { from: 'chen', text: '你这话什么意思' },
        { from: 'chen', text: '我六十八了，我图便宜我活该是吗' },
        { from: 'wang', text: '新邻居你这话真不行' },
        { from: 'li', text: '这话我不爱听' },
        { from: 'zhou', text: '……' }
      ],
      result: '你想讲道理，但对面是一个脸烂了的老人。'
    },
    {
      say: null,
      act: '你想起自己也买过她东西，但没拆封。',
      fx: { info: 8, weird: 4 },
      replies: [
        { from: 'momo', text: '我退，我全退' },
        { from: 'chen', text: '退钱就完了？' },
        { from: 'li', text: 'Momo，你以后不要在群里卖了，这是最后一次' },
        { from: 'momo', text: '知道了' },
        { from: 'sys', sys: true, text: 'Momo✨全球购 修改了群昵称' }
      ],
      result: '那天晚上，你把那盒没拆的东西扔了。'
    }
  ]
})

E.push({
  id: 's4_media', stage: 4, time: '17:08', day: 2,
  msgs: [
    { from: 'zhao', text: '有个记者联系我，想做一期关于物业公共收益的节目' },
    { from: 'zhao', text: '他们想采访几位业主，愿意出镜的报名' },
    { from: 'wang', text: '我上' },
    { from: 'li', text: '老赵，这事闹到电视台，以后还怎么处' },
    { from: 'zhao', text: '李姐，账目公示了我就撤' },
    { from: 'zhang', text: '各位业主，物业方面愿意坐下来沟通，不必通过媒体' }
  ],
  options: [
    {
      say: '我愿意出镜，但只讲事实，不喊口号',
      fx: { face: 8, fame: 24, info: 12, group: -4}, flag: ['on_tv'],
      replies: [
        { from: 'zhao', text: '好！就需要你这样的' },
        { from: 'wang', text: '我也去，我讲我妈被困电梯那段' },
        { from: 'li', text: '……你们去吧' },
        { from: 'zhang', text: '媒体采访可能影响问题解决进度' },
        { from: 'zhou', text: '这句话本身就很说明问题' }
      ],
      result: '节目播了四分钟。你的那句"钱可以出，账要清"被剪进了片头。'
    },
    {
      say: '别上电视了，还是内部解决吧',
      fx: { face: 8, fame: 4, group: 6}, flag: ['li_friend'],
      replies: [
        { from: 'li', text: '新邻居说得对' },
        { from: 'zhao', text: '内部解决？我内部了两年' },
        { from: 'wang', text: '和稀泥' },
        { from: 'li', text: '大炮，人家是为整栋楼好' }
      ],
      result: '物业第二天就派人来谈了。老赵说这是你的功劳，你不确定。'
    },
    {
      say: null,
      act: '你不想上电视。你把群消息转给了朋友，配了句"我们楼疯了"。',
      fx: { fame: -4, weird: 6, info: 6 },
      replies: [
        { from: 'zhao', text: '没人愿意就算了' },
        { from: 'wang', text: '我一个人去' },
        { from: 'chen', text: '大炮你说话别太冲，上电视呢' }
      ],
      result: '王大炮一个人上了电视，讲了七分钟。他成了名人。'
    }
  ]
})

/* ==================== 阶段 5 · 分群 ==================== */

E.push({
  id: 's5_split', stage: 5, pin: true, time: '22:15',
  msgs: [
    { from: 'zhao', text: '我建了个群，专门跟进公共收益这事，要跟的进来' },
    { from: 'zhao', text: '这个群只谈这一件事，不谈别的，不发广告' },
    { from: 'wang', text: '拉我' },
    { from: 'li', text: '老赵，你在大群里说这个，是要分家吗' },
    { from: 'zhao', text: '李姐，我不是那个意思' },
    { from: 'li', text: '那是什么意思' },
    { from: 'sys', sys: true, text: '（群里安静了六分钟）' }
  ],
  options: [
    {
      say: '两边都在，不冲突。大群过日子，小群办事',
      fx: { face: 16, fame: 18, info: 10, group: 10}, flag: ['bridge'],
      replies: [
        { from: 'zhao', text: '这话说得对' },
        { from: 'li', text: '……行吧，我不拦着' },
        { from: 'wang', text: '新邻居这张嘴，真该进业委会' },
        { from: 'zhou', text: '他说的就是这个意思，你们俩都别多想' },
        { from: 'li', text: '我没多想' },
        { from: 'zhao', text: '我也没' }
      ],
      result: '两个群都留了下来。你在两边都被当成"自己人"。'
    },
    {
      say: '我进维权群',
      fx: { face: 2, fame: 14, group: -10}, flag: ['zhao_team', 'split'],
      replies: [
        { from: 'zhao', text: '欢迎' },
        { from: 'li', text: '……' },
        { from: 'li', text: '行，你们都去吧' },
        { from: 'wang', text: '李姐你别这样' },
        { from: 'li', text: '我怎么样了我' }
      ],
      result: '那天晚上，大群里少了 60 个人。'
    },
    {
      say: '我不进，我就在大群待着',
      fx: { face: 4, fame: -4, group: 6}, flag: ['li_friend'],
      replies: [
        { from: 'li', text: '还是有人明白事理的' },
        { from: 'zhao', text: '理解' },
        { from: 'wang', text: '行吧' },
        { from: 'zhou', text: '（他私聊你：你其实两边都能进）' }
      ],
      result: '你留在了大群。李姐开始有事找你商量。'
    }
  ]
})

E.push({
  id: 's5_trade', stage: 5, time: '12:40',
  msgs: [
    { from: 'chen', text: '家里老人走了，留下一台轮椅，九成新，谁要？' },
    { from: 'chen', type: 'img', text: '[图片]' },
    { from: 'wang', text: '陈阿姨节哀' },
    { from: 'li', text: '节哀' },
    { from: 'momo', text: '阿姨这个可以挂闲鱼，能卖三百' },
    { from: 'chen', text: '不想卖，谁需要就拿去' }
  ],
  options: [
    {
      say: '我帮您问问 12 楼，他家老爷子刚做完手术',
      fx: { face: 16, fame: 14, group: 8, info: 10}, flag: ['trade_ok'],
      replies: [
        { from: 'chen', text: '好，谢谢你' },
        { from: 'sys', sys: true, text: '（半小时后）' },
        { from: 'me', text: '12 楼说要，一会儿下来拿' },
        { from: 'chen', text: '太好了，总算没白放着' },
        { from: 'li', text: '这才是群该有的样子' },
        { from: 'wang', text: '比闲鱼强' }
      ],
      result: '一台轮椅，从 16 楼到了 12 楼。群里安静了一会儿，那种舒服的安静。'
    },
    {
      say: '阿姨，我帮您挂闲鱼吧，卖了的钱您留着',
      fx: { face: 6, fame: 8, cash: 0}, flag: ['trade_ok'],
      replies: [
        { from: 'chen', text: '不用，我不缺这点钱' },
        { from: 'chen', text: '我就是不想扔' },
        { from: 'momo', text: '阿姨我懂你' },
        { from: 'li', text: '……' }
      ],
      result: '轮椅最后放在了她家储藏室。'
    },
    {
      say: '有需要的人自然会问，发群里挺打扰的',
      fx: { face: -12, fame: 8, weird: 10, group: -5 },
      replies: [
        { from: 'chen', text: '打扰你了，对不起' },
        { from: 'li', text: '新邻居，这话太过分了' },
        { from: 'wang', text: '人家刚没了老人' },
        { from: 'zhou', text: '……' }
      ],
      result: '陈阿姨退群了两天。回来之后，她再没在群里说过家里的事。'
    }
  ]
})

E.push({
  id: 's5_kickmomo', stage: 5, time: '20:30',
  msgs: [
    { from: 'wang', text: '我提议把 Momo 踢了，她在群里卖假货，还拉人头' },
    { from: 'wang', text: '同意踢的打个 1' },
    { from: 'zhao', text: '1' },
    { from: 'chen', text: '1' },
    { from: 'li', text: '等等，先听我说两句' },
    { from: 'momo', text: '我知道我错了，我以后不发广告了' },
    { from: 'momo', text: '我在这个群四年了' }
  ],
  options: [
    {
      say: '她卖的东西出过事，但踢人不解决问题。让她公开道歉、退全款、以后不发广告',
      fx: { face: 12, fame: 16, group: 10, info: 8}, flag: ['momo_mercy'],
      replies: [
        { from: 'chen', text: '……行，我接受' },
        { from: 'momo', text: '我退，我全退，我道歉' },
        { from: 'momo', text: '对不起陈阿姨，对不起大家' },
        { from: 'wang', text: '那要是再发呢' },
        { from: 'li', text: '再发我踢，我亲自踢' },
        { from: 'zhao', text: '这个处理可以' }
      ],
      result: 'Momo 留下来了。她后来真的没再发过广告——只在朋友圈发。'
    },
    {
      say: '1',
      fx: { face: -6, fame: 10, group: -6}, flag: ['voted_kick'],
      replies: [
        { from: 'sys', sys: true, text: '「Momo✨全球购」已被移出群聊' },
        { from: 'li', text: '……你们' },
        { from: 'wang', text: '早该这样' },
        { from: 'zhou', text: '她被踢了，广告也没了，挺好的' },
        { from: 'chen', text: '我是不是太过分了' }
      ],
      result: 'Momo 被踢了。三天后，李姐又把她拉了回来。'
    },
    {
      say: null,
      act: '你没打 1。你想起自己还买过她的东西。',
      fx: { info: 6, fame: -2, group: 2 },
      replies: [
        { from: 'wang', text: '不说话的算弃权' },
        { from: 'li', text: '那就再给她一次机会' },
        { from: 'momo', text: '谢谢李姐，谢谢大家' },
        { from: 'wang', text: '……' }
      ],
      result: '你弃权了。这个决定没人知道，除了你自己。'
    }
  ]
})

E.push({
  id: 's5_private', stage: 5, time: '23:50',
  msgs: [
    { from: 'li', text: '（私聊）小同志，睡了吗' },
    { from: 'li', text: '（私聊）有件事想问问你，你别往外说' },
    { from: 'li', text: '（私聊）老赵那个群，你是不是也在里面' },
    { from: 'li', text: '（私聊）我不是要干什么，我就是想知道，他们是不是在说我' }
  ],
  options: [
    {
      say: '在。但没人说您坏话，他们只是在算账',
      fx: { face: 10, fame: 6, info: 8}, flag: ['li_friend', 'honest_to_li'],
      replies: [
        { from: 'li', text: '哦' },
        { from: 'li', text: '算账是应该的' },
        { from: 'li', text: '我当群主八年了，说实话我也想知道那些钱去哪了' },
        { from: 'li', text: '但我不想这个群散' },
        { from: 'li', text: '你懂我的意思吗' }
      ],
      result: '那天晚上，李姐跟你说了很多。你第一次觉得她不是"群主"，是个七十岁的老太太。'
    },
    {
      say: '我不在，我没进那个群',
      fx: { face: -8, info: -10, group: -2}, flag: ['lied_to_li'],
      replies: [
        { from: 'li', text: '那就好' },
        { from: 'li', text: '我就是怕他们闹得太难看' },
        { from: 'li', text: '你早点睡' }
      ],
      result: '你撒了个谎。三天后，李姐在小群里看到了你的名字。'
    },
    {
      say: '李姐，这事我不方便说',
      fx: { face: 2, info: 4}, flag: ['neutral_edge'],
      replies: [
        { from: 'li', text: '行，我懂了' },
        { from: 'li', text: '不为难你' },
        { from: 'li', text: '你是个稳当人' }
      ],
      result: '李姐没再问。但她从此对你客气了，客气得像对外人。'
    }
  ]
})

E.push({
  id: 's5_war', stage: 5, time: '19:00',
  msgs: [
    { from: 'wang', text: '有人在隔壁那个群里骂李姐，说她跟物业一伙的' },
    { from: 'wang', text: '我不说是谁' },
    { from: 'li', text: '谁说的，让他出来说' },
    { from: 'zhao', text: '我群里没有骂人的人。我去查' },
    { from: 'chen', text: '这楼怎么变成这样了' },
    { from: 'sys', sys: true, text: '（两个群的截图开始在各个小群里流传）' }
  ],
  options: [
    {
      say: '截图我看了，是拼接的。原话是"李姐也不容易"，被截掉了一半',
      fx: { face: 20, fame: 22, info: 20, group: 14}, flag: ['peacemaker'],
      replies: [
        { from: 'wang', text: '……' },
        { from: 'wang', text: '谁这么缺德' },
        { from: 'li', text: '小同志，谢谢你' },
        { from: 'zhao', text: '我也去查原图' },
        { from: 'zhao', text: '确实被截了' },
        { from: 'chen', text: '吓死我了，我还以为真吵起来了' },
        { from: 'zhou', text: '以后截图先看头像时间' }
      ],
      result: '一场架，被一张原图拦住了。群里那天晚上聊到十二点，全是道歉。'
    },
    {
      say: '别在群里吵了，越吵越乱',
      fx: { face: 6, group: 2 },
      replies: [
        { from: 'wang', text: '那就在群里说清楚' },
        { from: 'li', text: '我不需要谁替我说话' },
        { from: 'zhao', text: '都冷静一下' }
      ],
      result: '没人再吵。但那口气一直没散。'
    },
    {
      say: null,
      act: '你把两个群都设成了免打扰。',
      fx: { fame: -8, info: 4, group: -4}, flag: ['checked_out'],
      replies: [
        { from: 'sys', sys: true, text: '（那天晚上群里有 214 条消息）' },
        { from: 'li', text: '我把群公告改了：禁止截图外传' }
      ],
      result: '你错过了群史上最热闹的一晚。第二天翻记录，翻了二十分钟。'
    }
  ]
})

E.push({
  id: 's5_owner_offer', stage: 5, time: '21:00',
  msgs: [
    { from: 'li', text: '（私聊）小同志，我想把群主转给你' },
    { from: 'li', text: '（私聊）我年纪大了，管不动了，天天有人骂我' },
    { from: 'li', text: '（私聊）你说话公道，两边都服你' },
    { from: 'li', text: '（私聊）你考虑一下，不着急' }
  ],
  cond: s => s.face > 62 && s.fame > 45,
  options: [
    {
      say: '李姐，我接。但我有个条件：群规我改，广告一律踢',
      fx: { face: 8, fame: 20, group: 6}, flag: ['new_owner'],
      replies: [
        { from: 'li', text: '好' },
        { from: 'li', text: '我早就想踢了，抹不开面' },
        { from: 'sys', sys: true, text: '「李桂芬」将群主转让给你' },
        { from: 'sys', sys: true, text: '你现在是本群群主' },
        { from: 'wang', text: '恭喜新群主' },
        { from: 'momo', text: '恭喜[玫瑰]' },
        { from: 'chen', text: '恭喜恭喜' }
      ],
      result: '三十七个人发了"恭喜"。你知道这不是升职，是接盘。'
    },
    {
      say: '李姐，我不接。这个群只有您能管',
      fx: { face: 14, fame: 6, group: 6}, flag: ['li_friend'],
      replies: [
        { from: 'li', text: '你这孩子' },
        { from: 'li', text: '那我就再管两年' },
        { from: 'li', text: '谢谢你啊' }
      ],
      result: '李姐又管了两年。群公告最后一条是她加的："群主永不转让"。'
    },
    {
      say: null,
      act: '你看着那条消息，不知道怎么回。第二天才回了个"我考虑考虑"。',
      fx: { face: -4, fame: 2}, flag: ['hesitated'],
      replies: [
        { from: 'li', text: '好，你慢慢想' },
        { from: 'li', text: '（三天后）小同志，想好了吗' },
        { from: 'li', text: '（三天后）算了，不为难你了' }
      ],
      result: '那句"考虑考虑"，你考虑了三个月。'
    }
  ]
})

/* ==================== 阶段 6 · 一年后 ==================== */

E.push({
  id: 's6_newbie', stage: 6, pin: true, time: '20:05',
  msgs: [
    { from: 'sys', sys: true, text: '「李桂芬」邀请「1701 新邻居」加入了群聊' },
    { from: 'li', text: '欢迎新邻居！@1701 新邻居 是哪一户呀' },
    { from: 'wang', text: '1701？那套不是一直空着吗' },
    { from: 'li', text: '大炮' },
    { from: 'chen', text: '欢迎新邻居[玫瑰]' },
    { from: 'momo', text: '欢迎欢迎🎉 有需要日用品找我' }
  ],
  options: [
    {
      say: '欢迎。群里规矩不多，第一别发广告，第二晚上十一点后小声点',
      fx: { face: 18, fame: 20, group: 8}, flag: ['elder'],
      replies: [
        { from: 'li', text: '对，就是这个' },
        { from: 'li', text: '新邻居你听 1602 的，他在这住一年了' },
        { from: 'wang', text: '一年就这么懂事了' },
        { from: 'chen', text: '1602 是好孩子' }
      ],
      result: '你成了那个"在这住了一年的人"。这句话从别人嘴里说出来，有点奇怪。'
    },
    {
      say: '欢迎，有事可以在群里问',
      fx: { face: 10, fame: 8 },
      replies: [
        { from: 'li', text: '对，大家都很热心' },
        { from: 'wang', text: '有事问我，我什么都知道' },
        { from: 'zhou', text: '别问他' }
      ],
      result: '一句普通的欢迎。一年前也有人对你说过类似的话。'
    },
    {
      say: null,
      act: '你看着这条消息，想起自己进群那天。',
      fx: { info: 10, fame: -2, weird: 4 },
      replies: [
        { from: 'sys', sys: true, text: '（你没有说话）' },
        { from: 'li', text: '新邻居别怕，群里人都不错' },
        { from: 'wang', text: '除了我' }
      ],
      result: '一年前的你和现在的你，在同一个位置，看着同一句话。'
    }
  ]
})

E.push({
  id: 's6_recap', stage: 6, time: '09:00', day: 2,
  msgs: [
    { from: 'li', text: '@所有人 群建立八年了，今天整整八年' },
    { from: 'li', text: '我发个红包，谢谢大家这些年的包容' },
    { from: 'li', type: 'redpack', amt: 200, note: '八年了' },
    { from: 'wang', text: '李姐破费了' },
    { from: 'chen', text: '谢谢李姐[玫瑰][玫瑰][玫瑰]' },
    { from: 'zhao', text: '李姐辛苦了' },
    { from: 'momo', text: '谢谢李姐' },
    { from: 'zhou', text: '八年了啊' }
  ],
  options: [
    {
      say: '谢谢李姐。虽然我只来了一年，但这个群确实像个群',
      fx: { face: 14, fame: 12, group: 6 },
      replies: [
        { from: 'li', text: '你这话我爱听' },
        { from: 'wang', text: '像个群，说得对' },
        { from: 'zhao', text: '虽然吵了一年' },
        { from: 'chen', text: '吵归吵，还是邻居' },
        { from: 'zhou', text: '明年还吵吗' },
        { from: 'wang', text: '吵' }
      ],
      result: '群里刷了一屏"吵"。这是这个群最像家的一次。'
    },
    {
      say: '谢谢李姐红包',
      fx: { face: 6, cash: 8, fame: 2 },
      replies: [
        { from: 'li', text: '抢了多少' },
        { from: 'wang', text: '我抢了 0.86' },
        { from: 'chen', text: '我 12 块[偷笑]' }
      ],
      result: '那天群里聊了两百多条，全是抢了多少钱。'
    },
    {
      say: null,
      act: '你抢了红包，没说话。',
      fx: { cash: 6, fame: -3 },
      replies: [
        { from: 'sys', sys: true, text: '（红包 40 秒被领完）' },
        { from: 'li', text: '都抢得挺快，就是不说话' }
      ],
      result: '李姐那句话，像是说给很多人听的。'
    }
  ]
})

E.push({
  id: 's6_leave', stage: 6, time: '11:30', day: 2,
  msgs: [
    { from: 'li', text: '1602，房东说你要搬走了？' },
    { from: 'li', text: '我昨天在楼下看见搬家公司' },
    { from: 'wang', text: '搬走？' },
    { from: 'chen', text: '才住一年啊' },
    { from: 'zhou', text: '……' }
  ],
  options: [
    {
      say: '房租涨了，我换了个远一点的',
      fx: { face: 10, fame: 12, group: 4 },
      replies: [
        { from: 'li', text: '涨多少' },
        { from: 'me', text: '从 3800 涨到 4600' },
        { from: 'wang', text: '这房东真敢涨' },
        { from: 'li', text: '……' },
        { from: 'chen', text: '以后没人帮我拿快递了' },
        { from: 'zhou', text: '走之前说一声，我请你吃饭' }
      ],
      result: '你搬走那天，只有小周下来帮你搬了两个箱子。'
    },
    {
      say: '还没定，可能续租',
      fx: { face: 6, fame: 4}, flag: ['stayed'],
      replies: [
        { from: 'li', text: '那就好' },
        { from: 'li', text: '你要真搬了，群里少个说话的人' },
        { from: 'wang', text: '我说话不算人吗' },
        { from: 'li', text: '你话太多' }
      ],
      result: '你续租了。第二年房租又涨了三百。'
    },
    {
      say: null,
      act: '你退出了群聊，没打招呼。',
      fx: { face: -10, fame: -10}, flag: ['quit_group'],
      replies: [
        { from: 'sys', sys: true, text: '你已退出群聊' },
        { from: 'li', text: '1602 退群了？' },
        { from: 'wang', text: '可能不想说吧' },
        { from: 'chen', text: '唉' }
      ],
      result: '487 个人的群，退出没有提示音。'
    }
  ]
})

E.push({
  id: 's6_rename', stage: 6, time: '14:20', day: 2,
  msgs: [
    { from: 'wang', text: '我提议把群名改了，"梧桐里 8 号楼业主群"太严肃了' },
    { from: 'wang', text: '改成"梧桐里 8 号楼一家亲"怎么样' },
    { from: 'chen', text: '好[强]' },
    { from: 'zhou', text: '不好' },
    { from: 'wang', text: '小周你能不能别这样' },
    { from: 'zhang', text: '群名修改需要群主操作' }
  ],
  options: [
    {
      say: '"一家亲"三年后一定会变成维权群。还是叫业主群，实在',
      fx: { face: 12, fame: 16, weird: 4, group: 6}, flag: ['kept_name'],
      replies: [
        { from: 'zhou', text: '同意' },
        { from: 'wang', text: '……你这话说得' },
        { from: 'wang', text: '但好像也没错' },
        { from: 'zhao', text: '我支持保留原名' },
        { from: 'li', text: '那就还叫业主群' },
        { from: 'chen', text: '一家亲也不好听' }
      ],
      result: '群名没改。三年后你路过那个群，它还在叫"业主群"。'
    },
    {
      say: '改成"一家亲"挺好的，热闹',
      fx: { face: 4, fame: 6, group: 2 },
      replies: [
        { from: 'li', text: '那就改吧' },
        { from: 'sys', sys: true, text: '群名已修改为「梧桐里 8 号楼一家亲」' },
        { from: 'zhou', text: '……' }
      ],
      result: '群名改了。第二天有人在群里卖洗衣机。'
    },
    {
      say: null,
      act: '你觉得改不改都行。',
      fx: { fame: -3 },
      replies: [
        { from: 'li', text: '那就投票吧' },
        { from: 'sys', sys: true, text: '（参与投票 31 人，赞成 18 票）' },
        { from: 'wang', text: '改了改了' }
      ],
      result: '群名改成了"一家亲"。三十一个人参与了一个487人的群的决定。'
    }
  ]
})

E.push({
  id: 's6_lastcall', stage: 6, time: '23:40', day: 3,
  msgs: [
    { from: 'li', text: '@所有人 最后说一件事' },
    { from: 'li', text: '我年纪大了，这个群以后可能管不动了' },
    { from: 'li', text: '不管以后谁当群主，记住一件事：这栋楼里住的是人，不是房号' },
    { from: 'li', text: '有事说话，别憋着' },
    { from: 'wang', text: '李姐你说这个干什么' },
    { from: 'chen', text: '李姐保重身体[玫瑰]' },
    { from: 'zhou', text: '李姐' },
    { from: 'zhao', text: '李姐，账目的事，我不提了' },
    { from: 'li', text: '该提还得提' }
  ],
  options: [
    {
      say: '李姐，有事您说话。我在。',
      fx: { face: 18, fame: 10, group: 10}, flag: ['stayed_loyal'],
      replies: [
        { from: 'li', text: '哎' },
        { from: 'li', text: '好孩子' },
        { from: 'sys', sys: true, text: '（李桂芬撤回了一条消息）' },
        { from: 'wang', text: '……' },
        { from: 'chen', text: '……' }
      ],
      result: '李姐撤回的那条消息，只有你看见了："我怕我走了没人管这个群"。'
    },
    {
      say: null,
      act: '你打了一行字，删了。又打一行，又删了。',
      fx: { face: 2, info: 8, weird: 4 },
      replies: [
        { from: 'li', text: '都早点睡吧' },
        { from: 'sys', sys: true, text: '（群里安静下来）' }
      ],
      result: '有些话，你确实没说出来。'
    },
    {
      say: '那我接。李姐您放心。',
      fx: { face: 12, fame: 20, group: 8}, flag: ['new_owner'],
      replies: [
        { from: 'li', text: '好' },
        { from: 'li', text: '我明天就转' },
        { from: 'wang', text: '真接啊' },
        { from: 'zhou', text: '他接了我就留着' },
        { from: 'chen', text: '那我不退群了' },
        { from: 'zhao', text: '我也不退' }
      ],
      result: '第二天早上九点，群主转让完成。群公告第一行换成了你的名字。'
    }
  ]
})

E.push({
  id: 's6_final_scene', stage: 6, time: '07:12', day: 4,
  msgs: [
    { from: 'li', text: '今日天气：晴，12—21℃，东南风 2 级' },
    { from: 'li', text: '早晚凉，出门加件外套' },
    { from: 'chen', text: '谢谢李姐[玫瑰]' },
    { from: 'wang', text: '收到' },
    { from: 'momo', text: '早安[太阳]' },
    { from: 'sys', sys: true, text: '（群里陆续跳出几个"早"）' }
  ],
  options: [
    {
      say: '早',
      fx: { face: 6, fame: 4, group: 3 },
      replies: [
        { from: 'li', text: '早' },
        { from: 'chen', text: '早啊孩子' }
      ],
      result: '一个字。一年前你也打过类似的一个字。'
    },
    {
      say: '李姐，天气这个，您发了八年了吧',
      fx: { face: 14, fame: 12, info: 6, group: 5}, flag: ['noticed_li'],
      replies: [
        { from: 'li', text: '八年零三个月' },
        { from: 'li', text: '下雨天也没断过' },
        { from: 'wang', text: '……' },
        { from: 'chen', text: '李姐真是' },
        { from: 'zhou', text: '八年零三个月' }
      ],
      result: '那天没有人说话。李姐又发了一条："今天可能下雨，记得带伞。"'
    },
    {
      say: null,
      act: '你关了群消息，去赶地铁。',
      fx: { fame: -4, group: -1 },
      replies: [
        { from: 'sys', sys: true, text: '（这一天，群里有 62 条消息）' }
      ],
      result: '你在群里待了一年。这一年，你说了大概三百句话。'
    }
  ]
})

return E
})
