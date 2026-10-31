/**
 * core/events3.js —— 群聊模拟器 · 事件池（日常纹理，slot 轮换）
 * 同一 slot 的事件一局只出一条，保证"这种事"每局都有，但不是同一件。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.GcEvents3 = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const E = []

/* ==================== 日常 · 阶段 2—3 ==================== */

/* slot: parcel —— 快递 */
E.push({
  id: 'd_parcel_help', stage: 2, slot: 'parcel', time: '18:40',
  msgs: [
    { from: 'chen', text: '1602 的小同志在吗，你有快递放我门口了' },
    { from: 'chen', text: '我给你收着，下来拿' },
    { from: 'li', text: '陈阿姨人最好了，帮半层楼收快递' }
  ],
  options: [
    {
      say: '谢谢阿姨！我顺便给您带了一袋桃，楼下买的',
      fx: { face: 14, fame: 8, cash: -18}, flag: ['gift_giver'],
      replies: [
        { from: 'chen', text: '哎哟这怎么好意思[玫瑰]' },
        { from: 'li', text: '看看人家' },
        { from: 'wang', text: '我帮人收了三年快递没人送过桃' }
      ],
      result: '一袋桃 18 块。陈阿姨后来跟人说起你，都提这袋桃。'
    },
    {
      say: '好的谢谢，我十分钟后下来',
      fx: { face: 6, fame: 3 },
      replies: [
        { from: 'chen', text: '不急不急' }
      ],
      result: '你准时下来了。陈阿姨多看了你两眼，记住了这张脸。'
    },
    {
      say: null,
      act: '你回了个"好"，但加班到十点才下去拿。',
      fx: { face: -4, fame: -2 },
      replies: [
        { from: 'chen', text: '你下班真晚，注意身体' },
        { from: 'li', text: '年轻人都不容易' }
      ],
      result: '那天之后，陈阿姨开始留意你的作息。'
    }
  ]
})

E.push({
  id: 'd_parcel_lost', stage: 3, slot: 'parcel', time: '12:15',
  msgs: [
    { from: 'wang', text: '谁拿了我门口的快递？电动工具，很大一箱' },
    { from: 'wang', type: 'img', text: '[图片]' },
    { from: 'wang', text: '值八百多' },
    { from: 'momo', text: '王哥你放门口本来就不安全吧' },
    { from: 'wang', text: '放了两年都没事' }
  ],
  options: [
    {
      say: '我中午回来看到 15 楼门口有个大箱子，不知道是不是',
      fx: { face: 10, fame: 12, info: 8 },
      replies: [
        { from: 'wang', text: '我去看' },
        { from: 'sys', sys: true, text: '（十分钟后）' },
        { from: 'wang', text: '找到了！是装修的挪过去了' },
        { from: 'wang', text: '谢了兄弟' },
        { from: 'momo', text: '虚惊一场[捂脸]' }
      ],
      result: '你的一句"可能在那"，省了王大炮一场官司。他记住了。'
    },
    {
      say: '要不查查电梯监控',
      fx: { face: 6, fame: 8, info: 6 },
      replies: [
        { from: 'wang', text: '物业说电梯坏了半个月没修监控' },
        { from: 'zhao', text: '这笔维修费我记得，去年列过支出' },
        { from: 'wang', text: '你看，又绕回账上了' }
      ],
      result: '话题从快递漂到了账目。这在这个群很正常。'
    },
    {
      say: null,
      act: '你想起上周你也丢过一箱橘子，没人帮你。',
      fx: { weird: 4, info: 4 },
      replies: [
        { from: 'wang', text: '算了，自认倒霉' },
        { from: 'li', text: '大家以后贵重东西别放门口' }
      ],
      result: '你的一箱橘子，在这个群里没有被提起过。'
    }
  ]
})

/* slot: vote —— 投票 */
E.push({
  id: 'd_vote_gate', stage: 2, slot: 'vote', time: '15:20',
  msgs: [
    { from: 'zhang', text: '【投票】小区北门是否加装人脸识别门禁，费用从公共收益支出' },
    { from: 'zhang', text: '请点击小程序投票，三天后截止' },
    { from: 'wang', text: '又是小程序，就不能群里举个手吗' },
    { from: 'li', text: '大家记得投啊' }
  ],
  options: [
    {
      say: '人脸识别的信息存哪？泄露了谁负责？',
      fx: { face: 4, fame: 14, weird: 6, info: 10 },
      replies: [
        { from: 'wang', text: '……这还真是问题' },
        { from: 'zhou', text: '一般存服务商服务器，合同里写不清楚就麻烦' },
        { from: 'zhao', text: '我问了，合同里没写数据条款' },
        { from: 'li', text: '那这投票先缓缓？' },
        { from: 'zhang', text: '我们再核对一下合同' }
      ],
      result: '投票延期了。你说了一句大多数业主想不到的话。'
    },
    {
      say: '投了，赞成',
      fx: { face: 4, fame: 2 },
      replies: [
        { from: 'zhang', text: '感谢您的参与' }
      ],
      result: '三天后门禁装了。你也录了脸。'
    },
    {
      say: null,
      act: '你没投。三天后投票结束，参与 89 人。',
      fx: { info: 4, fame: -3 },
      replies: [
        { from: 'wang', text: '487 户只有 89 户投票，这也能算数？' },
        { from: 'zhang', text: '达到三分之二参与即有效……呃，未达到，本次投票延后' },
        { from: 'zhao', text: '记下了' }
      ],
      result: '你的不投票，客观上帮了反对的那一方。虽然你没什么立场。'
    }
  ]
})

/* slot: wifi —— 邻里小事 */
E.push({
  id: 'd_wifi', stage: 2, slot: 'small', time: '22:50',
  msgs: [
    { from: 'momo', text: '姐妹们，谁家WiFi叫"TP-LINK_5G_666"？我的连不上它了' },
    { from: 'wang', text: '你连人家WiFi干嘛' },
    { from: 'momo', text: '我家宽带还没装[可怜]' },
    { from: 'zhou', text: '密码一般是8个8' }
  ],
  options: [
    {
      say: '我帮你看看，我家路由器可以开个访客网络',
      fx: { face: 10, fame: 6, info: 2}, flag: ['wifi_sharing'],
      replies: [
        { from: 'momo', text: '真的吗！你是天使[爱心]' },
        { from: 'wang', text: '小心她蹭你三年' },
        { from: 'momo', text: '王哥！我第二天就装宽带的好吗' }
      ],
      result: '她第二天真装了宽带。但从此你在她的"靠谱名单"上。'
    },
    {
      say: '蹭网不太好哈',
      fx: { face: -4, fame: 6, weird: 6 },
      replies: [
        { from: 'momo', text: '……我就问问' },
        { from: 'wang', text: '新邻居挺正气' },
        { from: 'zhou', text: '她说说而已，你别上纲上线' }
      ],
      result: '一句话，Momo 对你客气了很多，是那种疏远的客气。'
    },
    {
      say: null,
      act: '你看着这条消息，想起你家WiFi密码也是8个8。',
      fx: { weird: 4, info: 2 },
      replies: [
        { from: 'momo', text: '算了，我明天去营业厅' },
        { from: 'momo', text: '还有，我试了8个8，真连上了，谁家这么随便[捂脸]' },
        { from: 'wang', text: '噗' }
      ],
      result: '你默默改掉了密码。'
    }
  ]
})

E.push({
  id: 'd_light', stage: 3, slot: 'small', time: '19:35',
  msgs: [
    { from: 'chen', text: '3 单元楼道的声控灯坏了三天了，黑黢黢的，老人上楼危险' },
    { from: 'chen', text: '反映了好几次没人来修[流泪]' },
    { from: 'zhang', text: '已登记，预计本周五前处理' },
    { from: 'chen', text: '上周五也是这么说的' }
  ],
  options: [
    {
      say: '陈阿姨，晚上我送您上楼吧，反正我也要遛弯',
      fx: { face: 18, fame: 12, group: 6}, flag: ['escort'],
      replies: [
        { from: 'chen', text: '哎哟，那多不好意思' },
        { from: 'li', text: '新邻居，你真是这楼的福气' },
        { from: 'wang', text: '我明天去买个充电灯装楼道，几块钱的事' },
        { from: 'zhao', text: '我来装，我有电钻' },
        { from: 'zhou', text: '……行吧，我也出一个灯' }
      ],
      result: '三天后，3 单元楼道挂上了两个充电感应灯。物业到周五才来。'
    },
    {
      say: '物业那个"已登记"就是已读不回的意思',
      fx: { face: 4, fame: 12, weird: 6, group: -2 },
      replies: [
        { from: 'zhang', text: '先生您这话我不太认同' },
        { from: 'wang', text: '认同不认同的，反正灯是没亮' },
        { from: 'li', text: '都少说一句' }
      ],
      result: '灯到下周五才亮。物业在群里发了三张维修照片。'
    },
    {
      say: null,
      act: '你家在 16 楼，声控灯跟你关系不大。',
      fx: { fame: -2, group: -1 },
      replies: [
        { from: 'chen', text: '算了，我让我孙子扶我' },
        { from: 'li', text: '陈阿姨你小心点' }
      ],
      result: '陈阿姨的孙子每天六点来扶她上楼，扶了一个星期。'
    }
  ]
})

/* slot: redbag —— 红包日常 */
E.push({
  id: 'd_redbag_fight', stage: 3, slot: 'redbag', time: '12:02',
  msgs: [
    { from: 'wang', text: '中午闲着，发一个，手气最佳的明天请喝奶茶' },
    { from: 'wang', type: 'redpack', amt: 66, note: '午间福利' },
    { from: 'sys', sys: true, text: '红包 5 秒被领完' },
    { from: 'momo', text: '手气最佳：1602 新邻居 12.88' },
    { from: 'momo', text: '新邻居，明天奶茶安排上[偷笑]' },
    { from: 'wang', text: '规矩就是规矩' }
  ],
  options: [
    {
      say: '不明天了，现在就发，都别跟我客气',
      fx: { face: 14, fame: 16, cash: -60}, flag: ['redbag_king'],
      replies: [
        { from: 'sys', sys: true, text: '你发了一个红包（60 元，15 个）' },
        { from: 'wang', text: '够意思！' },
        { from: 'li', text: '这孩子大方' },
        { from: 'zhou', text: '谢谢' },
        { from: 'chen', text: '谢谢老板[玫瑰]' }
      ],
      result: '六十块买了个"大方"的名声。你觉得这买卖不亏。'
    },
    {
      say: '好，明天我发',
      fx: { face: 4, fame: 8 },
      replies: [
        { from: 'wang', text: '群里作证啊' },
        { from: 'momo', text: '记下了，跑不掉[调皮]' }
      ],
      result: '第二天中午你发了个 30 的。没人计较多少。'
    },
    {
      say: null,
      act: '你盯着 12.88 的数字，沉默了。',
      fx: { face: -6, fame: 4, weird: 4}, flag: ['miser'],
      replies: [
        { from: 'wang', text: '人呢' },
        { from: 'momo', text: '可能忙吧' },
        { from: 'wang', text: '抢红包的时候可不忙' },
        { from: 'zhou', text: '抢红包手速和发红包意愿是两个指标' }
      ],
      result: '那一整天，"手气最佳"三个字在群里被提了四次。'
    }
  ]
})

/* slot: kick —— 一次冲动的高潮（阶段 5） */
E.push({
  id: 'd_kicked', stage: 5, slot: 'side', time: '21:12', day: 2,
  msgs: [
    { from: 'li', text: '@所有人 再说一遍，别在群里发外部链接' },
    { from: 'li', text: '昨天那个砍价链接，发了三次了' },
    { from: 'wang', text: '就是，谁都别@我' }
  ],
  options: [
    {
      say: '李姐，规矩是你定的，那你自己上次发的拼多多链接算什么？',
      fx: { face: -18, fame: 20, weird: 12, group: -6 },
      replies: [
        { from: 'sys', sys: true, text: '（群里安静了三分钟）' },
        { from: 'li', text: '我发的是团购，不是链接' },
        { from: 'me', text: '都是要人点进去的' },
        { from: 'wang', text: '……新邻居你冷静点' },
        { from: 'sys', sys: true, text: '「1602 新邻居」已被移出群聊' }
      ],
      result: '你说了一句实话，代价是群聊界面变成了"你已被移出群聊"。三天后李姐把你拉了回来，谁也没提这事。',
      flag: ['kicked']
    },
    {
      say: null,
      act: '你想起了自己发过的那个链接，把手缩了回去。',
      fx: { info: 8, weird: 2 },
      replies: [
        { from: 'sys', sys: true, text: '（没有人说话）' },
        { from: 'li', text: '都看到回一下' },
        { from: 'momo', text: '收到' }
      ],
      result: '你躲过了一次。规矩这种东西，第一次执行时最吓人。'
    },
    {
      say: '收到，以后注意',
      fx: { face: 6, fame: 2 },
      replies: [
        { from: 'li', text: '好' },
        { from: 'wang', text: '新邻居懂事' }
      ],
      result: '规矩又立住了一次。你在"懂事"名单上又前进了一位。'
    }
  ]
})

/* slot: gossip —— 八卦 */
E.push({
  id: 'd_gossip', stage: 3, slot: 'gossip', time: '23:05',
  msgs: [
    { from: 'momo', text: '你们听说没，12 楼那两家好像因为装修吵起来了' },
    { from: 'momo', text: '1204 说 1203 电钻早上七点就用' },
    { from: 'wang', text: '我怎么没在群里看见' },
    { from: 'momo', text: '人家在楼道里吵的，我亲耳听到' },
    { from: 'li', text: '这种事别在群里说，让人家自己解决' },
    { from: 'momo', text: '好吧好吧' }
  ],
  options: [
    {
      say: '我住 1602，昨晚确实听到楼下有动静，但不清楚是哪两家',
      fx: { face: 6, fame: 8, info: 6, weird: 2 },
      replies: [
        { from: 'momo', text: '看吧！真有动静' },
        { from: 'li', text: '好了好了，别传了' },
        { from: 'wang', text: '新邻居你可别跟着添油' }
      ],
      result: '你的半句话被当成了证词。其实你只听到了一点风声。'
    },
    {
      say: '这事别传了，传到当事人家嘴里就变味了',
      fx: { face: 10, fame: 10, group: 5, info: 4 },
      replies: [
        { from: 'momo', text: '知道啦知道啦' },
        { from: 'li', text: '新邻居这话在理' },
        { from: 'momo', text: '（她默默撤回了两条消息）' },
        { from: 'sys', sys: true, text: 'Momo 撤回了一条消息' }
      ],
      result: '八卦被掐灭在萌芽里。李姐记住了你每次都站在她这边——一次是因为你自己也烦八卦。'
    },
    {
      say: '后来呢？谁赢了？',
      fx: { face: -2, fame: 8, weird: 12}, flag: ['gossip_lover'],
      replies: [
        { from: 'momo', text: '我就说有人爱听！' },
        { from: 'momo', text: '1203 说他装修交了钱就正常施工，1204 说要找物业' },
        { from: 'li', text: '……' },
        { from: 'wang', text: '新邻居你这八卦劲儿跟 Momo 有一拼' }
      ],
      result: '你成了"爱听八卦的 1602"。这个标签很难洗掉。'
    }
  ]
})

/* ==================== 日常 · 阶段 4—5 ==================== */

E.push({
  id: 'd_groupbuy_fail', stage: 4, slot: 'gb', time: '11:10',
  msgs: [
    { from: 'li', text: '上礼拜团的车厘子，有人跟我说收到了一半是烂的' },
    { from: 'li', text: '我表妹说运输问题，补发要等一周' },
    { from: 'wang', text: '李姐，这都第四回了' },
    { from: 'wang', text: '土鸡蛋缩水、大米受潮、 Now 车厘子烂一半' },
    { from: 'momo', text: '我的芒果也是，收的时候都瘪了' },
    { from: 'li', text: '……' }
  ],
  options: [
    {
      say: '李姐，建个退货接龙吧，我帮你统计，统一找她退',
      fx: { face: 12, fame: 14, info: 8, group: 6}, flag: ['groupbuy_ok'],
      replies: [
        { from: 'li', text: '……好，麻烦你了' },
        { from: 'sys', sys: true, text: '（一小时后）' },
        { from: 'me', text: '统计好了：23 户，共 1479 元。我整理成表格发您' },
        { from: 'wang', text: '这就专业了' },
        { from: 'li', text: '一个星期后钱都退回来了' },
        { from: 'li', text: '谢谢大家没骂我' }
      ],
      result: '一场团购信任危机，被一张表格接住了。'
    },
    {
      say: '便宜没好货，以后别团了',
      fx: { face: -8, fame: 8, weird: 6, group: -4 },
      replies: [
        { from: 'li', text: '……我知道了' },
        { from: 'wang', text: '话说得难听，理不糙' },
        { from: 'chen', text: '可是便宜是真的便宜啊' },
        { from: 'momo', text: '烂了就是烂了，跟便宜没关系' }
      ],
      result: '李姐两周没再发团购。群里少了点什么。'
    },
    {
      say: null,
      act: '你没团过她的东西，这事跟你没关系。',
      fx: { fame: -2 },
      replies: [
        { from: 'li', text: '这期先停了，我核对一下供货' },
        { from: 'chen', text: '李姐别灰心' }
      ],
      result: '你没有立场，所以你没有说话。'
    }
  ]
})

E.push({
  id: 'd_loan', stage: 4, slot: 'dm', time: '22:20',
  msgs: [
    { from: 'wang', text: '（私聊）兄弟，在吗' },
    { from: 'wang', text: '（私聊）不瞒你说，我资金周转不开，周转三天，借一万，利息按银行算' },
    { from: 'wang', text: '（私聊）群里就你跟我聊得来' }
  ],
  options: [
    {
      say: '王哥，一万我拿不出来，500 以内可以，不用利息，也不着急还',
      fx: { face: 10, cash: -500, info: 10}, flag: ['lent_money'],
      replies: [
        { from: 'wang', text: '500也行！' },
        { from: 'wang', text: '兄弟你放心，三天' },
        { from: 'wang', text: '（他第 11 天还了钱，附赠一条 30 秒的语音道歉）' }
      ],
      result: '500 块，买断了"王大炮欠钱"的可能性。你觉得值。'
    },
    {
      say: '王哥，我不借钱给任何人，包括亲戚。你别多想',
      fx: { face: 2, info: 8}, flag: ['no_loan'],
      replies: [
        { from: 'wang', text: '理解理解' },
        { from: 'wang', text: '是我冒昧了' },
        { from: 'wang', text: '（从此他在群里对你格外客气，客气得像防着什么）' }
      ],
      result: '你划了一条线。他尊重这条线，但记住了线是冷的。'
    },
    {
      say: null,
      act: '你看了消息没回。第二天他也没再提。',
      fx: { face: -4, info: 6, weird: 4 },
      replies: [
        { from: 'sys', sys: true, text: '（他后来在群里跟 Momo 借了）' },
        { from: 'sys', sys: true, text: '（Momo 也没借）' },
        { from: 'wang', text: '这年头借钱比挣钱难' }
      ],
      result: '你装没看见。他也没戳破。从此你们之间有一层看不见的东西。'
    }
  ]
})

E.push({
  id: 'd_wechat_move', stage: 5, slot: 'side', time: '20:40', day: 2,
  msgs: [
    { from: 'zhou', text: '小群有人问你什么时候进来' },
    { from: 'zhou', text: '老赵说你在电视上那段讲得好，想拉你搞业委会' },
    { from: 'zhou', text: '我说你再考虑考虑' }
  ],
  cond: s => s.fame > 40,
  options: [
    {
      say: '业委会这事，让老赵先干着，我可以帮忙整理材料',
      fx: { face: 8, fame: 10, info: 10, group: 4}, flag: ['support_no_join'],
      replies: [
        { from: 'zhou', text: '他懂了，他说这叫"不当头目当军师"' },
        { from: 'zhou', text: '他要请你吃饭' },
      ],
      result: '你成了那个"幕后的人"。老赵的材料后来都有你的笔迹。'
    },
    {
      say: '行，我进业委会',
      fx: { face: 6, fame: 22, info: 12, group: -4}, flag: ['committee'],
      replies: [
        { from: 'zhou', text: '哦' },
        { from: 'zhou', text: '那你以后消息会很多，我先说' },
        { from: 'zhou', text: '业委会群比这个群吵十倍' }
      ],
      result: '你进了业委会。你的名字出现在了公示栏上。'
    },
    {
      say: '都别拉我，我就想安静住个房',
      fx: { face: 2, fame: -8, info: 2}, flag: ['refused_all'],
      replies: [
        { from: 'zhou', text: '行' },
        { from: 'zhou', text: '那以后有事我还在群里@你' },
        { from: 'zhou', text: '毕竟你说话还是有点用的' }
      ],
      result: '你拒绝了所有头衔。神奇的是，两边反而都把你当自己人。'
    }
  ]
})

/* ==================== 日常 · 阶段 6 ==================== */

E.push({
  id: 'd_old_story', stage: 6, slot: 'old', time: '16:10', day: 2,
  msgs: [
    { from: 'wang', text: '今天路过物业，想起去年电梯那事' },
    { from: 'wang', text: '现在修好了，谁还记得当时要交 1200' },
    { from: 'zhao', text: '账目后来还是公示了，去年 12 月' },
    { from: 'wang', text: '对，闹了一年的事，公示那天群里就七个人说话' },
    { from: 'chen', text: '都过去了[玫瑰]' },
    { from: 'zhou', text: '常规操作' }
  ],
  options: [
    {
      say: '我记得。当时第一个签名是我',
      fx: { face: 8, fame: 12, info: 6, group: 6 },
      replies: [
        { from: 'zhao', text: '对，第二行就是你' },
        { from: 'zhao', text: '那份名单我还留着' },
        { from: 'wang', text: '说实话，那年多亏你们几个' },
        { from: 'li', text: '都过去了，都好好的' }
      ],
      result: '那些吵过的架，最后都变成了"你还记得吗"。'
    },
    {
      say: '1200 我到现在还觉得贵',
      fx: { face: -2, fame: 6, weird: 4 },
      replies: [
        { from: 'wang', text: '哈哈哈哈你这个人' },
        { from: 'wang', text: '贵是真贵，修也是真修了' }
      ],
      result: '有些账，群里永远算不清。这也是群的常态。'
    },
    {
      say: null,
      act: '你翻了一下聊天记录，找到了那条 78 万预算的通知。',
      fx: { info: 8, weird: 6 },
      replies: [
        { from: 'sys', sys: true, text: '（你往上翻了 4000 多条消息）' },
        { from: 'zhou', text: '翻什么呢，一年前的消息' }
      ],
      result: '4000 条消息里，藏着这一年所有的吵架、红包和天气。'
    }
  ]
})

E.push({
  id: 'd_junior', stage: 6, slot: 'junior', time: '21:30', day: 2,
  msgs: [
    { from: 'sys', sys: true, text: '「1102 小吴」邀请「0802 新邻居」加入了群聊' },
    { from: '0802', text: '大家好，刚搬来，请多关照' },
    { from: 'wang', text: '欢迎欢迎' },
    { from: 'li', text: '新邻居有什么不懂的群里问' },
    { from: 'momo', text: '有需要日用品找我呀🎉' }
  ],
  options: [
    {
      say: '欢迎！我去年也刚来，有需要随时说',
      fx: { face: 14, fame: 8, group: 8}, flag: ['became_li'],
      replies: [
        { from: '0802', text: '谢谢！' },
        { from: 'li', text: '看看，这就传下去了' },
        { from: 'wang', text: '一茬接一茬' }
      ],
      result: '你对新人说的第一句话，和李姐当年对你说的几乎一样。'
    },
    {
      say: null,
      act: '你想起自己第一次说话时有多小心，决定让人家自己来。',
      fx: { info: 6, weird: 4 },
      replies: [
        { from: 'wang', text: '新邻居挺腼腆' },
        { from: 'chen', text: '慢慢就熟了' }
      ],
      result: '0802 在群里安安静静潜水了三个月。你有点后悔。'
    },
    {
      say: '先说好，别信 Momo 的"内部价"',
      fx: { face: -4, fame: 14, weird: 10, group: -2 },
      replies: [
        { from: 'momo', text: '？' },
        { from: 'momo', text: '我改过了好吧，我现在只卖正品' },
        { from: 'wang', text: '哈哈哈哈哈当年那个面膜的事是吧' },
        { from: 'li', text: '都过去了' }
      ],
      result: '0802 在群里说了第一句"谢谢"。不是对你说的。'
    }
  ]
})

return E
})
