
const DATA = {
 "points": [],
 "posts": [],
 "stats": {
  "cats": 12,
  "feedPoints": 5,
  "adoptions": 3,
  "activeUsers": 28
 },
 "knowledge": [
  {
   "id": 1,
   "cat": "feed",
   "catName": "喂食误区",
   "catEmoji": "🍚",
   "wrong": "把猫粮直接倒在地上喂",
   "why": "地面藏着细菌和寄生虫卵，还容易招来蚂蚁蟑螂；猫贴地吃饭时会紧张，多猫环境还容易互相传染口炎。",
   "right": "随身带几个一次性纸碗，喂完把空碗带走。猫吃得安心，环境干净，路人对投喂的观感也好。"
  },
  {
   "id": 2,
   "cat": "feed",
   "catName": "喂食误区",
   "catEmoji": "🍚",
   "wrong": "把人类的剩饭剩菜喂给流浪猫",
   "why": "剩饭高油高盐，猫的肾脏扛不住；洋葱、大蒜、巧克力、葡萄这些对猫是有毒的，可能造成溶血和肾衰竭。",
   "right": "备一小袋正规猫粮放在包里，成本不高、营养均衡，也别把\"我觉得好吃\"等同于\"猫能吃\"。"
  },
  {
   "id": 3,
   "cat": "feed",
   "catName": "喂食误区",
   "catEmoji": "🍚",
   "wrong": "好心给流浪猫喝牛奶",
   "why": "绝大多数猫乳糖不耐受，喝牛奶容易腹泻脱水，对小猫和体弱的猫尤其危险。",
   "right": "放一碗干净的清水就是最好的照顾。冬天记得用不锈钢或陶瓷碗，水结冰前换一次。"
  },
  {
   "id": 4,
   "cat": "health",
   "catName": "健康安全",
   "catEmoji": "💊",
   "wrong": "只投喂，不关注绝育",
   "why": "没有绝育的持续投喂会让猫群数量失控——抢地盘、争食物、疾病传播，猫的生活质量反而断崖式下降。",
   "right": "留意点位的 ✂️ 绝育标记，遇到未绝育的可以联系本地救助组织做 TNR。已绝育的猫，才是真正被守护的猫。"
  },
  {
   "id": 5,
   "cat": "health",
   "catName": "健康安全",
   "catEmoji": "💊",
   "wrong": "投喂完就走，剩粮撒一地",
   "why": "残粮变质招虫蚁，也最容易引发物业投诉——一旦被贴告示清场，最终受害的是这片区域的猫。",
   "right": "定时、定点、定量，喂完清理现场。和环境好好相处，猫才有长久的立足之地。"
  },
  {
   "id": 6,
   "cat": "health",
   "catName": "健康安全",
   "catEmoji": "💊",
   "wrong": "冬天早上直接发动汽车",
   "why": "流浪猫冬天会钻进引擎舱取暖，突然点火可能造成严重伤害，这是冬天流浪猫致残的高发原因。",
   "right": "开车前拍一拍引擎盖、按两声喇叭，给可能躲在里面的猫一个逃跑的机会。"
  },
  {
   "id": 7,
   "cat": "manner",
   "catName": "相处礼仪",
   "catEmoji": "🤝",
   "wrong": "拍照开闪光灯、大声呼叫吸引猫",
   "why": "强光和突然的声音会惊到猫，受惊逃窜时容易冲上马路发生意外。",
   "right": "蹲下来放低身体，轻声慢语等它主动靠近。抓拍它放松的样子，比摆拍好看一百倍。"
  },
  {
   "id": 8,
   "cat": "manner",
   "catName": "相处礼仪",
   "catEmoji": "🤝",
   "wrong": "一上来就伸手摸、追着撸",
   "why": "流浪猫的警惕是刻在基因里的自保，强行接触只会让它把\"人\"和\"恐惧\"画上等号，下次见了就跑。",
   "right": "先伸出手指背让它闻一闻，它主动蹭你才是真的愿意。摸完记得洗手，对彼此都好。"
  }
 ],
 "districts": [
  {
   "key": "all",
   "name": "全市",
   "short": "全市",
   "lat": 35.4156,
   "lng": 116.5871,
   "scale": 9
  },
  {
   "key": "rencheng",
   "name": "任城区",
   "short": "任城",
   "lat": 35.4156,
   "lng": 116.5871,
   "scale": 13
  },
  {
   "key": "yanzhou",
   "name": "兖州区",
   "short": "兖州",
   "lat": 35.5468,
   "lng": 116.7234,
   "scale": 12
  },
  {
   "key": "qufu",
   "name": "曲阜市",
   "short": "曲阜",
   "lat": 35.5967,
   "lng": 116.9909,
   "scale": 12
  },
  {
   "key": "zoucheng",
   "name": "邹城市",
   "short": "邹城",
   "lat": 35.3977,
   "lng": 117.0059,
   "scale": 12
  },
  {
   "key": "weishan",
   "name": "微山县",
   "short": "微山",
   "lat": 34.8027,
   "lng": 117.1322,
   "scale": 12
  },
  {
   "key": "yutai",
   "name": "鱼台县",
   "short": "鱼台",
   "lat": 35.0079,
   "lng": 116.6436,
   "scale": 12
  },
  {
   "key": "jinxiang",
   "name": "金乡县",
   "short": "金乡",
   "lat": 35.0647,
   "lng": 116.3103,
   "scale": 12
  },
  {
   "key": "jiaxiang",
   "name": "嘉祥县",
   "short": "嘉祥",
   "lat": 35.4306,
   "lng": 116.3406,
   "scale": 12
  },
  {
   "key": "wenshang",
   "name": "汶上县",
   "short": "汶上",
   "lat": 35.7348,
   "lng": 116.4992,
   "scale": 12
  },
  {
   "key": "sishui",
   "name": "泗水县",
   "short": "泗水",
   "lat": 35.6539,
   "lng": 117.2976,
   "scale": 12
  },
  {
   "key": "liangshan",
   "name": "梁山县",
   "short": "梁山",
   "lat": 35.7861,
   "lng": 116.0907,
   "scale": 12
  }
 ],
 "dailyMeta": {
  "title": "养猫日更",
  "subtitle": "从接猫第一天，陪你走满一个月",
  "startDate": "2026-10-06",
  "startLabel": "2026 年 10 月 6 日",
  "total": 30,
  "intro": "这 30 条按天排好，打开就是当天该做的事。不用一次看完，跟着走就行。",
  "stageNote": "五阶段递进：先适应 → 再混熟 → 再互动 → 再立规矩 → 再成为伙伴"
 },
 "dailyStages": [
  {
   "key": "day1",
   "name": "接猫日",
   "emoji": "🏠",
   "range": "D1",
   "desc": "出门 → 现场 → 到家"
  },
  {
   "key": "adapt",
   "name": "适应期",
   "emoji": "🌱",
   "range": "D2-4",
   "desc": "别打扰，让它自己出来"
  },
  {
   "key": "familiar",
   "name": "混熟期",
   "emoji": "🤝",
   "range": "D5-10",
   "desc": "喂食时靠近，建立信任"
  },
  {
   "key": "play",
   "name": "互动期",
   "emoji": "🎾",
   "range": "D11-16",
   "desc": "逗猫棒、摸头、上腿"
  },
  {
   "key": "rules",
   "name": "立规矩期",
   "emoji": "📏",
   "range": "D17-22",
   "desc": "不用手逗、作息、护食"
  },
  {
   "key": "grow",
   "name": "伙伴期 & 健康",
   "emoji": "🌟",
   "range": "D23-30",
   "desc": "疫苗、成长、入冬、复盘"
  }
 ],
 "catDaily": [
  {
   "day": 1,
   "date": "10-06",
   "stage": "day1",
   "stageName": "接猫日",
   "emoji": "🏠",
   "title": "今天，它到家了",
   "paras": [
    "出门前，把收纳箱底垫上一件你的旧 T 恤——既是防滑垫，也把「你的气味」先放进去，等于提前打了个招呼。",
    "接猫现场只需要问清三件事：疫苗记录拍照（最重要）、它现在吃什么粮、驱过虫没有。这三条决定你到家头一个月怎么安排。",
    "到家后：把箱子放进隔离房间、开门、然后你出去，门留一条缝。它大概率先躲床底半天——这是正常反应，不是不喜欢你。"
   ],
   "todo": [
    "出门前：收纳箱垫旧 T 恤，盖子盖上留缝或蒙纱网（别敞开）",
    "接猫现场：疫苗记录拍照 + 问清当前猫粮 + 问清驱虫情况",
    "到家：箱子放进隔离房间 → 开门 → 你离开，门留缝",
    "粮、水、砂盆提前摆好——摆好之后就不要再挪位置"
   ],
   "warn": [
    "不要追它、掏床底、招呼朋友来看",
    "今天绝不洗澡、不驱虫"
   ]
  },
  {
   "day": 2,
   "date": "10-07",
   "stage": "adapt",
   "stageName": "适应期",
   "emoji": "🌱",
   "title": "今天什么都不用做",
   "paras": [
    "头 24 小时不吃不喝不上厕所，都是正常应激——猫在陌生环境会先「冻结」自己。粮和水放着就行，别端着碗追着喂。",
    "它躲着的时候，你正常生活就好：走路、说话都照常，让它通过声音熟悉你。你越是蹑手蹑脚，反而越像「这里有危险」。"
   ],
   "todo": [
    "只在远处观察：有没有吃喝、有没有用砂盆",
    "水碗别放在洗衣机旁边（振动 + 噪音会让它不敢去）"
   ],
   "warn": [
    "不抱、不摸、不围观",
    "不因为「它不吃」就换粮、加罐头——先给足 24 小时"
   ]
  },
  {
   "day": 3,
   "date": "10-08",
   "stage": "adapt",
   "stageName": "适应期",
   "emoji": "🌱",
   "title": "48 小时红线",
   "paras": [
    "今天是关键分水岭：如果到今晚（到家满 48 小时）它仍然滴水未进，不要继续等，直接联系兽医。",
    "这条红线对幼猫比成猫严格得多——幼猫体储备少，低血糖来得比成猫快得多。成猫能扛三天，几个月大的小猫扛不住。"
   ],
   "todo": [
    "确认 48 小时内有没有进食、饮水、排便",
    "它开始在你面前吃东西 = 第一步成功"
   ],
   "warn": [
    "别用「饿了自然会吃」来赌——幼猫饿过头会低血糖",
    "不强行喂食、不灌水"
   ]
  },
  {
   "day": 4,
   "date": "10-09",
   "stage": "adapt",
   "stageName": "适应期",
   "emoji": "🌱",
   "title": "检查你的环境",
   "paras": [
    "它开始露头了。这时候把环境过一遍：砂盆是不是在安静、隐蔽的角落（别贴着洗衣机）？窝是不是避风、离地、有遮挡？",
    "幼猫最怕冷。十月夜里已经凉，窝里垫一件旧毛衣，比买什么猫窝都好使。"
   ],
   "todo": [
    "砂盆位置检查：安静、隐蔽、远离食盆",
    "保暖：旧毛衣 / 纸箱窝，放在避风角落",
    "纸箱撕净胶带，开口朝墙侧放（别开口朝上叠高）"
   ],
   "warn": [
    "砂盆别和食盆挨在一起（猫很介意）",
    "受潮发霉的纸箱坚决不用"
   ]
  },
  {
   "day": 5,
   "date": "10-10",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "明天你要出门了",
   "paras": [
    "第一个周末到了——它到家才 4 天，还在混熟期。这两天如果你要出门，它得独自在家 48 小时。",
    "方案很简单：多摆几碗粮、多放两三个水碗（分散在不同位置）。48 小时对猫来说不算长，重点是别让它断粮断水。",
    "如果能托邻居或朋友中途上门看一眼，比任何设备都稳。"
   ],
   "todo": [
    "摆 2-3 碗粮、3 个水碗（分散放，别放在洗衣机上）",
    "砂盆清干净——两天不铲它可能会憋着",
    "能托人就托人中途来看一眼"
   ],
   "warn": [
    "别指望它这时候能陪你玩——它还在适应，不是「不亲你」",
    "别把粮一次性堆成小山（受潮变质）"
   ]
  },
  {
   "day": 6,
   "date": "10-11",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "回来了，先别急着亲热",
   "paras": [
    "进门第一件事：看粮水消耗和砂盆。有消耗 = 它这两天过得还行；完全没动 = 需要留意。",
    "它可能会躲回床底——这是「安全感优先」，不是倒退。你照常洗漱、坐下，让它自己决定什么时候出来。"
   ],
   "todo": [
    "检查粮、水、砂盆三项消耗",
    "换水、铲砂、补粮，动作轻缓"
   ],
   "warn": [
    "不要一进门就抱它、找它、问「你怎么躲起来了」",
    "不要因为砂盆脏就责备——猫不会把「责备」和「砂脏」联系起来"
   ]
  },
  {
   "day": 7,
   "date": "10-12",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "让「人手」变成好事",
   "paras": [
    "从今天开始做一件事，一个动作同时练两样（撸猫 + 护食基础）：喂食时，把一只手放在碗边，什么都别做。",
    "它如果不躲、继续吃，这一步就过了。意义是——让猫把「人靠近食物」和「安全」绑在一起，将来你托人喂、送去寄养都省心。"
   ],
   "todo": [
    "喂食时手放碗边（不碰它、不拿碗）",
    "它吃饭时你保持静止，别说话"
   ],
   "warn": [
    "绝不在它吃饭时抢碗、摸它的头——这是制造护食最快的方式"
   ]
  },
  {
   "day": 8,
   "date": "10-13",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "该驱虫了（到家满一周）",
   "paras": [
    "到家 6-7 天、吃喝拉撒都正常了，这时候驱虫最合适——不要当天做，应激叠着药效容易拉稀。",
    "幼猫必须用幼猫剂量的体内外驱虫药，按体重给药。拿不准就去趟医院，顺便做一次粪检（查蛔虫、球虫）。",
    "如果原主人已经驱过，问清用的什么药、什么时候，别重复给药。"
   ],
   "todo": [
    "体内外驱虫（幼猫剂量，按体重）",
    "顺便做首次体检：粪检 + 猫瘟试纸 + 耳螨检查"
   ],
   "warn": [
    "别用成猫剂量的药（幼猫可能中毒）",
    "别在它应激、拉稀的时候驱虫"
   ]
  },
  {
   "day": 9,
   "date": "10-14",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "摸 3 秒，然后收手",
   "paras": [
    "它愿意在你面前吃饭了，可以开始摸。顺序很重要：从头顶、下巴、耳后开始——这三处是猫的「友好区」；肚子、尾巴、爪子是禁区。",
    "关键动作是「摸 3 秒就收手」。主动给它一点然后停，让它发现「原来是我要得不够」，它会主动来要求更多。",
    "最有效的时机：它刚睡醒、眯着眼、正在呼噜的时候。"
   ],
   "todo": [
    "它放松时，轻摸头顶 / 耳后 3 秒，然后收手",
    "摸完给一小粒零食，建立「被摸 = 好事」"
   ],
   "warn": [
    "它挣扎就立刻放手，绝不按住",
    "睡熟的猫别突然摸（那是本能反击，不是你惹它）"
   ]
  },
  {
   "day": 10,
   "date": "10-15",
   "stage": "familiar",
   "stageName": "混熟期",
   "emoji": "🤝",
   "title": "逗猫棒，现在拿出来了",
   "paras": [
    "它开始主动靠近你了，说明混熟期接近尾声。这时候拿出逗猫棒——幼猫唯一真正有效的玩具。",
    "小猫不会自己玩玩具，轨道球、自动转盘对它是「死的」，只有你手里的杆子能让猎物活起来。",
    "让羽毛在地上跑、躲到纸箱后面再窜出来，模拟猎物逃跑——这是它练捕猎的方式，也是它消耗精力的唯一出口。"
   ],
   "todo": [
    "今天玩一次，5 分钟就够，看它反应",
    "观察它是否开始追、扑、抓"
   ],
   "warn": [
    "逗猫棒不要带铃铛（铃铛脱落被吞很危险）",
    "从今天起，绝不用手逗它玩——这条规矩越早立越省事"
   ]
  },
  {
   "day": 11,
   "date": "10-16",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "每天两次，每次 10 分钟",
   "paras": [
    "把它定成固定流程：早上出门前一次、睡前一次，各 10 分钟。玩到它侧躺喘气，算达标。",
    "睡前那次最重要——它直接决定你今晚睡不睡得着。精力放空的猫，夜里就是睡觉。"
   ],
   "todo": [
    "早一次、睡前一次，各 10 分钟",
    "睡前那次玩到它侧躺喘气"
   ],
   "warn": [
    "别用手、脚逗它（会被当成玩具，将来咬人）",
    "激光笔别当主要玩具（抓不到会挫败，越玩越焦躁）"
   ]
  },
  {
   "day": 12,
   "date": "10-17",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "鱼缸是最好的解闷道具",
   "paras": [
    "鱼缸对猫是天然的「电视」，能盯着看半小时。这正好补上你不在家时的无聊时间。",
    "两个前提：一是它现在跳不上柜子，但 2-3 个月后一定能——到时缸要垫防滑、固定好，别被扑倒；二是缸口要有盖，猫会去喝缸里的水，喝了容易拉肚子。"
   ],
   "todo": [
    "确认鱼缸有盖（原配盖子虚掩即可）",
    "确认缸体稳固、垫了防滑"
   ],
   "warn": [
    "别指望鱼缸代替你陪它——它是解闷，不是陪伴",
    "别把它抱到缸边看（扑上去容易连缸带鱼一起倒）"
   ]
  },
  {
   "day": 13,
   "date": "10-18",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "学会抱它",
   "paras": [
    "抱猫的核心是「四脚有支撑」——一只手托住胸腹、让它后脚踩在你手上，另一只手护住后半身，绝不能悬空吊着。",
    "第一次只抱 5 秒，然后放下、给零食，慢慢延长。悬空感是猫最害怕的；脚能踩到东西，它就不挣扎。"
   ],
   "todo": [
    "抱 5 秒 → 放下 → 给零食",
    "每天 2-3 次，宁短勿长"
   ],
   "warn": [
    "别从背后突然抱、别拎后颈（会伤到肌肉）",
    "它挣扎就放下，不硬撑"
   ]
  },
  {
   "day": 14,
   "date": "10-19",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "呼噜和蹭腿，都是它的话",
   "paras": [
    "它开始蹭你的腿、用头顶你、在你身上踩奶——这些是「领地标记 + 认可你」，相当于在说「这个人和这块地是我的」。",
    "呼噜不全是高兴：紧张的时候也会呼噜（自我安抚）。要结合身体看——耳朵放松、眼睛半闭、身体柔软，才是真的舒服。"
   ],
   "todo": [
    "它主动来蹭的时候，停下手里的事摸两下（回应它 = 强化亲密）"
   ],
   "warn": [
    "别在它蹭你的时候突然把它抱起来（它要的是接触，不是被困住）"
   ]
  },
  {
   "day": 15,
   "date": "10-20",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "把「你的腿」变成它的窝",
   "paras": [
    "想「拿在手里玩」，正确路径不是你去抓它，是让它自己来。方法：坐着不动的时候，把零食放在自己腿上，等它自己跳上来吃。",
    "几次之后，「上你腿」= 好事，它会自己爬上来蹲着。这比「想抱就能抱」现实得多，也舒服得多。"
   ],
   "todo": [
    "坐着看手机时，把零食放腿上，等它自己来",
    "它上来了就别动、别抱，让它自己待着"
   ],
   "warn": [
    "它上来时别一把抱住（会毁掉这条路）",
    "它想下去就让它下去——要能自由上下"
   ]
  },
  {
   "day": 16,
   "date": "10-21",
   "stage": "play",
   "stageName": "互动期",
   "emoji": "🎾",
   "title": "一个月前它还在别人家",
   "paras": [
    "两周了。回头看看：它现在会跟着你走、会在你面前吃饭、会追逗猫棒——这就是「从适应到混熟到互动」。",
    "接下来进入立规矩阶段。规矩早立有效、晚立费劲，但有个前提：必须建立在它已经信任你的基础上——现在正是时候。"
   ],
   "todo": [
    "拍一张照片存档（成长时间线的起点素材）",
    "回顾：哪件事做对了？哪件事还能改？"
   ],
   "warn": [
    "别为「它还不够黏」焦虑——有的猫三周，有的要三个月"
   ]
  },
  {
   "day": 17,
   "date": "10-22",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "规矩第一条：手不是玩具",
   "paras": [
    "从今天起彻底执行：不用手、脚、衣服逗它玩。你用手逗一次，它就把「手」和「猎物」画上等号，几个月后就会变成咬着玩。",
    "它咬你手时的正确反应：立刻停手、转身走开、冷处理 10 秒。不是打、不是喊——冷处理是猫唯一听得懂的语言。"
   ],
   "todo": [
    "玩具只给逗猫棒、球",
    "被咬立刻停手走开"
   ],
   "warn": [
    "别用手拍它、别弹鼻子（会变成「用手打架」的游戏，越玩越凶）",
    "别在它咬人时大声尖叫（对猫来说是「互动」）"
   ]
  },
  {
   "day": 18,
   "date": "10-23",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "出门前 15 分钟，胜过一切",
   "paras": [
    "担心它独自在家叫、吵到邻居？底层逻辑是：猫叫 = 需求没被满足，不是你想安静它就安静。所以管理噪音 = 提前满足需求。",
    "出门前的黄金流程：先玩 15 分钟消耗精力 → 立刻喂一顿。猫的自然节律是「捕猎 → 进食 → 睡觉」，这套下来正好接上你的出门时间。"
   ],
   "todo": [
    "出门前：玩 15 分钟 → 喂一顿",
    "拉开窗帘、留个窗台，让它有事可看"
   ],
   "warn": [
    "别在它叫的时候赶回去、开门看（每一次回应都是奖励叫声）",
    "别关在完全黑暗的房间（无聊会加倍叫）"
   ]
  },
  {
   "day": 19,
   "date": "10-24",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "夜里叫，绝不回应",
   "paras": [
    "睡前固定三连：玩到喘（20 分钟）→ 喂最后一顿 → 关灯。猫吃完就困，这套能让它整夜睡。",
    "半夜它来叫你，绝对不回应：不开门、不喂、不看它。会有 3-5 天「叫得更凶」（这叫消退爆发），扛过去它就放弃了。"
   ],
   "todo": [
    "睡前：玩到喘 → 喂最后一顿 → 关灯",
    "白天多陪玩，别让它白天睡太多"
   ],
   "warn": [
    "半夜回应一次，等于把整套训练清零",
    "发情期的嚎叫训练无效，只能靠绝育（见第 28 天）"
   ]
  },
  {
   "day": 20,
   "date": "10-25",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "砂盆的三条铁律",
   "paras": [
    "砂盆是养猫满意度最高的投资。三条：①数量 n+1（一只猫两个盆）②每天铲、定期换砂 ③放在安静、隐蔽、远离食盆的位置。",
    "猫乱拉，九成不是报复，是砂盆问题：太小、太脏、位置差，或者没绝育。"
   ],
   "todo": [
    "确认两个盆都在用（有的猫只认一个）",
    "每天铲一次，砂厚保持 3-5cm"
   ],
   "warn": [
    "别用香味猫砂（猫鼻子敏感，反而拒用）",
    "别把砂盆和食盆放一起"
   ]
  },
  {
   "day": 21,
   "date": "10-26",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "给猫一个「合法的抓点」",
   "paras": [
    "猫抓沙发不是坏，是本能——磨爪 + 标记领地。解决方式不是禁止，是给它更好的选择。",
    "猫抓板放在它「醒来后常抓的地方」（沙发旁、窝边），比放在角落有效十倍。它抓对地方时立刻夸 + 给零食。"
   ],
   "todo": [
    "猫抓板放到它固定抓的位置旁边",
    "它抓对了就夸、给零食"
   ],
   "warn": [
    "别打它、别喷水（猫理解不了因果，只会怕你）",
    "别买太小的抓板（要能让它整个身体立起来抓）"
   ]
  },
  {
   "day": 22,
   "date": "10-27",
   "stage": "rules",
   "stageName": "立规矩期",
   "emoji": "📏",
   "title": "交换训练，彻底断掉护食",
   "paras": [
    "接着第 7 天的「手放碗边」升级一步：它吃饭时，往碗旁边扔一块更香的（冻干、猫条），让它学到「人靠近食物 = 加餐」。",
    "另一个必做：固定喂食点、固定时间、吃不完的收走。建立「食物由我提供」的稳定预期——稳定预期是护食的解药。"
   ],
   "todo": [
    "吃饭时往旁边扔更好的零食（交换训练）",
    "固定时间喂，20 分钟没吃完就收走"
   ],
   "warn": [
    "绝不在它吃饭时抢走碗（一次就能制造护食）",
    "不用惩罚——猫的食物焦虑只会越惩罚越重"
   ]
  },
  {
   "day": 23,
   "date": "10-28",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "该打首针了（满 8 周龄）",
   "paras": [
    "首针疫苗要满 8 周龄才能打。如果它到家时疫苗记录是空的，现在正好到了时间——今天联系医院预约。",
    "常规流程是猫三联（3 针，间隔 3-4 周）+ 3 月龄后狂犬 1 针。具体方案让兽医按它的实际情况定。"
   ],
   "todo": [
    "确认月龄是否满 8 周（翻原主人的疫苗记录照片）",
    "预约首针；到院问清打的是几联、下一针什么时候"
   ],
   "warn": [
    "打针当天不洗澡、不驱虫",
    "疫苗后 24-48 小时可能精神差、食欲低，属正常；但持续不吃、呕吐、脸肿要立刻回医院"
   ]
  },
  {
   "day": 24,
   "date": "10-29",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "把日子记下来",
   "paras": [
    "疫苗不是打一次就完，要按时间表走。建议直接把日期写进手机日历：首针 → +3 周第二针 → +3 周第三针 → 3 月龄后狂犬。",
    "同时记下「下次驱虫日」——体内每 3 个月一次，体外每月一次。"
   ],
   "todo": [
    "把接下来的疫苗 / 驱虫日期写进日历提醒",
    "疫苗记录本拍照存手机（后面绝育、寄养、出行都要用）"
   ],
   "warn": [
    "疫苗期间别带它出门、别接触其他猫",
    "疫苗和驱虫别安排在同一天"
   ]
  },
  {
   "day": 25,
   "date": "10-30",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "从今天开始记录成长",
   "paras": [
    "一个月前它只有手掌大，现在应该明显长了一圈。从今天起，每月固定日子拍一张「同角度、同背景」的照片。",
    "这是最动人的内容——一年后拼起来看，比任何文案都有力量。"
   ],
   "todo": [
    "今天拍第一张（固定背景、固定角度）",
    "每月同一天拍一张，存在同一个相册"
   ],
   "warn": [
    "别总在它睡觉时拍——拍它清醒、好奇的样子"
   ]
  },
  {
   "day": 26,
   "date": "10-31",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "想遛猫，从在家穿衣服开始",
   "paras": [
    "想带它出门，第一课不是下楼，是在家穿胸背带。每天 5 分钟 + 零食，穿完就脱，让它习惯身上有东西。",
    "装备只有一种选法：H 型胸背式。绝不用脖圈——猫的脖子能缩、气管脆弱，一挣就脱，或者勒伤。"
   ],
   "todo": [
    "每天在家穿胸背 5 分钟，配零食",
    "只买 H 型胸背式（不是脖圈、不是一次性绳套）"
   ],
   "warn": [
    "它抗拒就减到 1 分钟，慢慢来",
    "完全适应前不出门"
   ]
  },
  {
   "day": 27,
   "date": "11-01",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "家里再多一点「猫的视角」",
   "paras": [
    "猫需要垂直空间——高处让它有安全感。给它一条「可以走的路线」：纸箱 → 椅子 → 柜子 / 窗台，比买一个猫爬架更有用。",
    "再加一个「窗外电视」：拉开窗帘，让它有得看。有得看的猫，犯闲的几率小得多。"
   ],
   "todo": [
    "搭一条高低路线（书架 / 椅子 / 纸箱组合）",
    "每天留一段时间开着窗帘"
   ],
   "warn": [
    "高处要确保稳固（宁愿低，不要塌）",
    "窗台必须有纱窗 / 防护网"
   ]
  },
  {
   "day": 28,
   "date": "11-02",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "两个冬天的安排",
   "paras": [
    "济宁 11 月中后夜温会跌破 10°C，幼猫头一年最怕冷。阳台白天晒太阳可以，晚上建议挪进屋（次卧就很好）。",
    "绝育排在 6-8 月龄（大概明年 3-5 月）。公猫手术简单、恢复快，费用也低。发情期的乱尿、半夜嚎叫、想往外冲，绝育后基本消失——这是养猫性价比最高的一笔投入。"
   ],
   "todo": [
    "入冬前把夜间睡觉点挪进室内",
    "记下绝育窗口（6-8 月龄），提前一个月预约"
   ],
   "warn": [
    "别拖到成年才绝育（行为问题定型，术后改善有限）",
    "绝育前要打齐疫苗、术前禁食"
   ]
  },
  {
   "day": 29,
   "date": "11-03",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "真想遛猫，先看三条",
   "paras": [
    "疫苗打齐（大概到 12 月）+ 训练 2-4 周，最早明年 1-2 月才能出门；冬天冷，实际更可能要等开春。",
    "出门三铁律：①只穿 H 型胸背 ②绝不散放 ③别像狗那样遛一圈——猫是走走停停闻闻，正确预期是「陪它在草地上待 20 分钟」。"
   ],
   "todo": [
    "疫苗打齐前只做室内脱敏",
    "提前想好第一条路线（安静、没狗、有遮阴）"
   ],
   "warn": [
    "猫遇狗会挣逃——绳子别过长、避开遛狗时段",
    "第一次出门必须短且温和；被吓到就退回阳台看风景"
   ]
  },
  {
   "day": 30,
   "date": "11-04",
   "stage": "grow",
   "stageName": "伙伴期 & 健康",
   "emoji": "🌟",
   "title": "第 30 天：回到最初的那套逻辑",
   "paras": [
    "一个月前定下的路径是：从小养 → 问清原饲主 → 养不合适就转送。这一个月，你其实把每一步都验证了一遍。",
    "猫能不能养熟，由 2-9 周龄的社会化窗口定型——在窗口尾巴接它回家，是「养不熟」概率最低的那条路。真正把猫养出问题的，多半是成年接手、行为定型后的二次转手。",
    "所以：规矩要早立、精力要放空、绝育要按时。做到这三件，就不会走到「养大了受不了、又送不掉」那一步。"
   ],
   "todo": [
    "复盘这 30 天：哪一步走得顺，哪一步踩了坑",
    "把「不合就转送」的渠道再确认一遍（保持联系，不用刻意维护）"
   ],
   "warn": [
    "「放归自然」不是选项——家养猫没有捕猎能力，结果是饿死或车祸，还会亲手制造一只流浪猫",
    "转送要趁早，越拖越难"
   ]
  }
 ],
 "tipsMeta": {
  "title": "避坑干货库",
  "subtitle": "别人踩过的坑，你不必再踩一遍",
  "intro": "这些坑大多不值钱、也不难躲，但不知道的时候，代价往往是一条命或者一笔冤枉钱。按主题翻，随时来查。",
  "note": "内容随养猫经验持续增补 · 不替代兽医诊断，出问题先去医院"
 },
 "tipCats": [
  {
   "key": "all",
   "name": "全部",
   "emoji": "🛡️"
  },
  {
   "key": "feed",
   "name": "吃与喝",
   "emoji": "🍚"
  },
  {
   "key": "litter",
   "name": "猫砂与厕所",
   "emoji": "🧹"
  },
  {
   "key": "health",
   "name": "健康",
   "emoji": "🩺"
  },
  {
   "key": "behavior",
   "name": "行为",
   "emoji": "😼"
  },
  {
   "key": "home",
   "name": "居家安全",
   "emoji": "🏠"
  },
  {
   "key": "adopt",
   "name": "领养",
   "emoji": "🐾"
  },
  {
   "key": "neuter",
   "name": "绝育",
   "emoji": "✂️"
  },
  {
   "key": "mindset",
   "name": "养猫心态",
   "emoji": "💭"
  }
 ],
 "catTips": [
  {
   "id": 1,
   "cat": "feed",
   "emoji": "🥛",
   "level": "red",
   "title": "别给猫喝牛奶，这不是矫情",
   "why": "绝大多数猫成年后乳糖不耐，牛奶喝下去就是拉稀。幼猫拉稀脱水极快，几小时就能危及生命——这是新手最容易犯、代价最大的错。",
   "how": [
    "要补奶就用宠物羊奶粉，别用牛奶、更别用酸奶奶茶",
    "6 周龄以上能吃粮的猫，泡软粮 + 清水就够了",
    "人喝的奶茶、含糖饮料一律不给，糖 + 乳糖双杀"
   ]
  },
  {
   "id": 2,
   "cat": "feed",
   "emoji": "🍗",
   "level": "red",
   "title": "猫条是零食，当饭喂会出事",
   "why": "猫条营养不全面、诱食剂重。长期当主食，猫会越来越挑食，正餐不吃，营养跟不上，还养成\"非猫条不吃\"的坏毛病。",
   "how": [
    "猫条只用于破冰、剪指甲、进航空箱等\"奖励场景\"",
    "一天最多 1-2 根，别成习惯",
    "挑食了先停零食，饿一顿比哄十顿管用"
   ]
  },
  {
   "id": 3,
   "cat": "feed",
   "emoji": "🍚",
   "level": "yellow",
   "title": "幼猫干粮要先泡软",
   "why": "6 周龄左右的猫乳牙还没长齐，直接啃干粮费劲、吃不饱、还可能不消化。泡软是过渡期最省事的一步。",
   "how": [
    "温水（别用开水）泡 10-15 分钟到软",
    "泡软的粮 2 小时内吃完，剩的倒掉防变质",
    "随月龄增长逐步减少泡水时间，2 个多月后可过渡到全干粮"
   ]
  },
  {
   "id": 4,
   "cat": "feed",
   "emoji": "🥣",
   "level": "yellow",
   "title": "喂食宁少勿多，猫是饿不坏的",
   "why": "尤其没有过滤、流动水的简易环境，吃不完的粮泡在碗里会变质，坏水是幼猫拉稀的头号原因。饿一顿顶多叫两声，坏水可能要命。",
   "how": [
    "一天 3-4 顿、每顿 2-3 分钟能吃完的量",
    "吃不完的 20 分钟内收走",
    "固定喂食点和时间，让\"食物由我提供\"成为预期"
   ]
  },
  {
   "id": 5,
   "cat": "feed",
   "emoji": "🔄",
   "level": "yellow",
   "title": "换粮要过渡，别一次换掉",
   "why": "猫肠胃敏感，突然换粮容易软便、拉稀。7 天过渡法是通行的稳妥做法。",
   "how": [
    "第 1-2 天：新粮 1/4 + 旧粮 3/4",
    "第 3-5 天：对半；第 6-7 天：新粮 3/4",
    "过渡期出现软便就放缓节奏，加点益生菌"
   ]
  },
  {
   "id": 6,
   "cat": "litter",
   "emoji": "🚽",
   "level": "yellow",
   "title": "猫砂盆要「猫数 + 1」",
   "why": "一只猫至少两个砂盆。这不是浪费——猫对厕所很挑，一个太脏、位置太差，它就另找地方（通常是你的床或沙发）解决，乱拉的问题九成从这里来。",
   "how": [
    "1 猫 2 盆，分散放在两个不同位置",
    "盆别紧挨食盆水碗",
    "两个盆用同款砂，别让猫\"认错厕所\""
   ]
  },
  {
   "id": 7,
   "cat": "litter",
   "emoji": "📏",
   "level": "yellow",
   "title": "砂盆尺寸要够猫转身",
   "why": "盆太小，猫刨砂、转身都憋屈，会带砂出来甚至乱拉。幼猫盆 30cm 够用，但成年后就该换大盆——这是有\"保鲜期\"的装备。",
   "how": [
    "幼猫期：内径 30cm 左右即可（收纳筐改装也成）",
    "6 月龄后换标准大盆，内径 40-50cm",
    "开放式斜口盆对小猫最友好，进出不费劲"
   ]
  },
  {
   "id": 8,
   "cat": "litter",
   "emoji": "📍",
   "level": "yellow",
   "title": "砂盆别放在洗衣机旁",
   "why": "洗衣机启动的震动和噪音会让猫不敢上厕所，憋着或另找地方。位置选错，等于白买。",
   "how": [
    "选安静、通风、人走动少的角落",
    "别贴着食盆水碗（猫反感\"吃饭挨着厕所\"）",
    "放好后别频繁挪动，猫是靠位置记忆的"
   ]
  },
  {
   "id": 9,
   "cat": "litter",
   "emoji": "🧹",
   "level": "yellow",
   "title": "每天铲，是猫的\"底线要求\"",
   "why": "猫的爱干净超出你的想象。砂盆两三天不铲，它可能直接罢工。这不是猫作，是本能。",
   "how": [
    "每天至少铲 1-2 次，结团全清",
    "木薯砂遇水会软化粘底，清理周期别超 2 天",
    "每月整盆换砂 + 盆体清洗一次"
   ]
  },
  {
   "id": 10,
   "cat": "health",
   "emoji": "⏰",
   "level": "red",
   "title": "幼猫 48 小时不吃不喝，立刻送医",
   "why": "成猫能扛三天，幼猫扛不住——它储备少，低血糖来得又快又猛，等你觉得\"好像不太对\"，往往已经晚了。这是硬红线，不能等、不能观察。",
   "how": [
    "接回家头 24 小时不吃属正常应激，先静养",
    "超过 48 小时一点没进食，直接去医院",
    "伴随呕吐、瘫软、张嘴呼吸，别等 48 小时，马上走"
   ]
  },
  {
   "id": 11,
   "cat": "health",
   "emoji": "🧼",
   "level": "red",
   "title": "摸完流浪猫，必须洗手换衣再碰自家猫",
   "why": "猫瘟、跳蚤、耳螨、猫癣，都是这么被带回家的。你的善意可能成为自家猫的传染源——这条对做流浪猫救助的人来说尤其致命。",
   "how": [
    "摸完室外猫：洗手 + 换外套，再接触自家猫",
    "鞋底也是重灾区，进门换鞋、别让猫舔鞋",
    "新捡的猫先隔离 1-2 周，观察无异常再合笼"
   ]
  },
  {
   "id": 12,
   "cat": "health",
   "emoji": "🚪",
   "level": "yellow",
   "title": "新猫到家先隔离一周",
   "why": "一是防传染病（潜伏期看不出来），二是给猫一个\"安全屋\"过渡。直接全屋放养，猫会因空间太大而更恐惧。",
   "how": [
    "先关一个小房间（次卧最佳，安静无风）",
    "砂盆、水粮、窝都放里面，门留缝",
    "头 3 天别打扰，让它自己出来探索"
   ]
  },
  {
   "id": 13,
   "cat": "health",
   "emoji": "💉",
   "level": "yellow",
   "title": "疫苗首针要满 8 周龄",
   "why": "太小的猫打了没用（母源抗体干扰），还可能伤身。接猫时若对方说\"打过疫苗\"，一定要看记录本——口头说的不算，医院也只认记录。",
   "how": [
    "首针满 8 周龄后打，通常 2-3 针，间隔 3-4 周",
    "再加一针狂犬（3 月龄后）",
    "✅ 一定要索取疫苗记录本/照片，下针次和绝育时间全靠它"
   ]
  },
  {
   "id": 14,
   "cat": "health",
   "emoji": "🐛",
   "level": "yellow",
   "title": "驱虫别在到家当天做",
   "why": "换环境本身就让猫应激，再叠加驱虫药效，容易拉稀。等它吃喝拉撒都正常了再驱，是更稳的顺序。",
   "how": [
    "到家先适应 3-5 天，状态稳定再驱虫",
    "幼猫用幼猫剂量的体内外驱虫药",
    "刚做完疫苗的当天也不驱虫，错开几天"
   ]
  },
  {
   "id": 15,
   "cat": "health",
   "emoji": "🦷",
   "level": "yellow",
   "title": "口臭、流涎、吃东西怪动作 = 警惕口炎",
   "why": "猫口炎很常见、很折磨，早期信号就是口臭和进食异常。很多主人以为是\"挑食\"，拖到严重才发现。",
   "how": [
    "闻口气、看牙龈红不红，定期检查口腔",
    "吃东西偏头、掉粮、突然不吃硬的，都要留意",
    "疑似口炎早去医院，别自己喂药"
   ]
  },
  {
   "id": 16,
   "cat": "health",
   "emoji": "💊",
   "level": "green",
   "title": "备一个小药包，半夜不抓瞎",
   "why": "幼猫软便、小伤口是常事。手边有东西，能省掉很多次深夜奔波。",
   "how": [
    "益生菌（幼猫软便高发，最先用得上）",
    "伊丽莎白圈（上药、防舔伤口必备）",
    "碘伏、棉签、宠物专用洗耳液"
   ]
  },
  {
   "id": 17,
   "cat": "behavior",
   "emoji": "✋",
   "level": "red",
   "title": "永远别用手逗猫玩",
   "why": "手一旦被当玩具，猫长大后就会咬手、扑手、抓人——这不是\"性格坏\"，是你亲手教的。而且这个习惯极难纠正，是弃养的高频理由之一。",
   "how": [
    "玩 = 只用逗猫棒和玩具",
    "手只负责抚摸、喂食、安抚，角色不能混",
    "已经咬手的：立刻停止互动、发出轻\"嘶\"声，别打"
   ]
  },
  {
   "id": 18,
   "cat": "behavior",
   "emoji": "⏳",
   "level": "yellow",
   "title": "立规矩别太早，会毁掉信任",
   "why": "猫还在害怕的时候你凶它、拍它，它接收到的不是\"规矩\"，而是\"这个环境有威胁\"——前两周建立的信任直接打回原形。",
   "how": [
    "先混熟（愿意在你面前吃饭）再立规矩",
    "最佳窗口：混熟后 + 4 月龄前（社会化窗口关闭前）",
    "立规矩用\"引导\"不用\"惩罚\"，从不用手拍"
   ]
  },
  {
   "id": 19,
   "cat": "behavior",
   "emoji": "🔊",
   "level": "yellow",
   "title": "猫叫 = 需求没被满足，别想\"训练它闭嘴\"",
   "why": "猫叫基本就五件事：饿、渴、冷、怕、无聊（发情另说）。需求提前满足掉，它自然不叫。硬训只会让它更焦虑。",
   "how": [
    "出门前：玩累 + 喂饱 + 留窗景和纸箱",
    "夜里叫绝不回应（不开门、不喂、不看），扛过 3-5 天消退爆发",
    "发情嚎叫唯一解是绝育，训练无效"
   ]
  },
  {
   "id": 20,
   "cat": "behavior",
   "emoji": "🌙",
   "level": "yellow",
   "title": "半夜闹腾，是白天睡太多",
   "why": "猫是晨昏型动物，白天你不在它睡一整天，晚上精力爆棚。解法不是骂它，是把它的作息调过来。",
   "how": [
    "睡前\"玩到喘 → 喂最后一顿 → 关灯\"，三步连做",
    "白天给点娱乐（窗台看鸟、纸箱、抓板），减少白天睡",
    "坚持一两周就能倒过来，猫的作息可以训练"
   ]
  },
  {
   "id": 21,
   "cat": "behavior",
   "emoji": "💧",
   "level": "yellow",
   "title": "乱尿先查原因，别急着骂",
   "why": "猫乱尿极少是\"报复\"，九成有具体原因：砂盆太小/太脏/位置差、没绝育、或者泌尿系统有病。骂只会让情况更糟。",
   "how": [
    "先查砂盆三件事：大小、清洁、位置",
    "公猫未绝育的乱尿，绝育后基本消失",
    "伴随尿少、尿血、频繁蹲厕所，立刻送医（泌尿堵塞危及生命）"
   ]
  },
  {
   "id": 22,
   "cat": "behavior",
   "emoji": "🍽️",
   "level": "yellow",
   "title": "护食要\"做\"，但方式是正向绑定",
   "why": "猫有食物保护本能，比狗轻但不等于没有。将来托人喂、送寄养，不护食的猫好带太多。关键是让\"人靠近食物 = 好事\"。",
   "how": [
    "喂食时手放碗边（别拿走），同时扔一块更香的冻干",
    "\"交换训练\"：吃饭时往旁边扔零食，让它学会\"人靠近 = 加餐\"",
    "🔴 绝不在它吃饭时抢碗——这是最容易制造护食的动作"
   ]
  },
  {
   "id": 23,
   "cat": "behavior",
   "emoji": "🎣",
   "level": "green",
   "title": "逗猫棒每天 2 次，是所有行为问题的第一解药",
   "why": "幼猫不会自己玩玩具，只有\"会动的东西\"能激活它。玩够了的猫不拆家、不乱叫、不咬人——精力有出口，问题就没入口。",
   "how": [
    "每天早晚各一次，一次 10 分钟玩到它侧躺喘气",
    "玩完给一小口零食收尾，模拟\"捕猎→进食\"完整闭环",
    "⚠️ 别买带铃铛的（脱落误吞）、别买细绳（缠脖吞线）"
   ]
  },
  {
   "id": 24,
   "cat": "home",
   "emoji": "🪟",
   "level": "red",
   "title": "窗户阳台必须封，猫坠楼不是小概率",
   "why": "猫对窗外飞虫、鸟有本能扑抓欲，田园猫弹跳力更野。高楼坠猫在养猫圈是年年发生的真实悲剧，而且往往一次就没了。",
   "how": [
    "窗户装金刚网或纱窗网格，栏杆缝隙封住",
    "别以为\"我家猫胆小不会跳\"——受惊那一秒什么都可能",
    "阳台若敞开，务必确认全封闭再让猫独自待"
   ]
  },
  {
   "id": 25,
   "cat": "home",
   "emoji": "🌿",
   "level": "red",
   "title": "这些家养植物对猫有毒",
   "why": "猫啃植物是常态。有些常见绿植对猫是剧毒，轻则呕吐流涎，重则急性肾衰——百合对猫就是致命的。",
   "how": [
    "高危名单：百合、绿萝、杜鹃、水仙、夹竹桃、万年青",
    "安全替代：猫草、猫薄荷、吊兰、散尾葵",
    "不确定的植物先查清楚再摆，宁可搬走"
   ]
  },
  {
   "id": 26,
   "cat": "home",
   "emoji": "📦",
   "level": "red",
   "title": "纸箱能用，但这三种绝对别给",
   "why": "纸箱是猫的最爱，但来源不对就是隐患。猫会啃纸箱，吞下去的东西可能堵肠子。",
   "how": [
    "🔴 胶带、快递单胶、编织袋拉丝必须撕干净（啃食致肠梗阻）",
    "🔴 受潮发霉的箱、果蔬/海鲜/化工箱别用（残留/霉菌）",
    "🟡 家电箱里的泡沫珍珠棉比纸箱本身更危险，误吞是急诊"
   ]
  },
  {
   "id": 27,
   "cat": "home",
   "emoji": "🔌",
   "level": "yellow",
   "title": "电线要收，小物件要藏",
   "why": "幼猫什么都啃、什么都吞。电线、橡皮筋、针线、小珠子、铃铛——都是肠梗阻和触电的常见元凶。",
   "how": [
    "电线用理线管或收进槽里，别裸露在猫够得到的地方",
    "针线、橡皮筋、发圈全收进带盖盒子",
    "玩具尺寸必须大于猫的嘴（幼猫约 2cm），能整个塞进嘴的全撤"
   ]
  },
  {
   "id": 28,
   "cat": "home",
   "emoji": "❄️",
   "level": "yellow",
   "title": "入冬前，给幼猫挪进室内",
   "why": "4 月龄前的幼猫耐寒能力差。北方 11 月中后夜温跌破 10°C，阳台过夜对小猫是真实的低温风险。",
   "how": [
    "入冬前（11 月上旬）把猫的过夜区域挪进室内",
    "保暖窝 + 旧毛衣垫在避风角落",
    "白天可继续在阳台晒太阳，晚上回屋睡"
   ]
  },
  {
   "id": 29,
   "cat": "adopt",
   "emoji": "🐣",
   "level": "yellow",
   "title": "养猫要从小养，2-9 周龄是关键窗口",
   "why": "猫的性格和亲人性在 2-9 周龄基本定型。这个窗口里接触人的猫，长大后黏人、社交好；错过窗口的成年猫，再养也难改。这不是玄学，是行为学。",
   "how": [
    "优先领养 8 周-3 月龄的猫，可塑性最强",
    "窗口期内多抚摸、多见人、多接触不同声音",
    "成年猫不是不能养，但要接受\"性格已定型\""
   ]
  },
  {
   "id": 30,
   "cat": "adopt",
   "emoji": "🗣️",
   "level": "yellow",
   "title": "原饲主说\"它很乖\"，别全信",
   "why": "不是人家骗你，是几周大的猫根本没有稳定性格——说\"乖\"多半是\"胆小不敢动\"。看这几个信号更靠谱。",
   "how": [
    "看妈妈猫的性格（遗传 + 学习，参考价值最高）",
    "看同窝状态：一窝都活泼 = 胆大；一窝都缩 = 怕人",
    "现场上手抱一下，比问十句都准"
   ]
  },
  {
   "id": 31,
   "cat": "adopt",
   "emoji": "⏳",
   "level": "yellow",
   "title": "转送有\"保鲜期\"，越小越好转",
   "why": "小猫 2-4 月龄最好转（可爱、可塑、抢着要），过了 8 月龄难度陡增，成猫基本只能靠熟人。所以\"合不合\"的判断要趁早做。",
   "how": [
    "头 1-2 个月是判断期，别拖到半岁才决定",
    "真到不合，尽早启动转送，别硬扛到猫长大",
    "判断期只做两件事：固定喂食点 + 每天陪玩 15 分钟"
   ]
  },
  {
   "id": 32,
   "cat": "adopt",
   "emoji": "🔗",
   "level": "yellow",
   "title": "转送的顺序，别一上来就挂平台",
   "why": "透明、负责的转送链能把猫送到靠谱的人手里。公开平台遇到的是完全陌生的人，回访难、动机杂，兜底成本最高，所以要放最后。",
   "how": [
    "优先级：原渠道回流 → 熟人 → 同城领养群 → 公开平台",
    "转送时如实说明猫的性格和习惯，别美化",
    "公平台发布务必要求\"回访照片\"，留个底线"
   ]
  },
  {
   "id": 33,
   "cat": "adopt",
   "emoji": "🎁",
   "level": "green",
   "title": "流浪猫绝育有免费渠道（走 TNR）",
   "why": "小区点位上的流浪猫，不用自己掏钱绝育——公益组织有免费 TNR 指标。这对做喂猫/救助的人是实打实的省。",
   "how": [
    "瑞鹏公益基金会 × 新瑞鹏：「流浪动物免费 TNR 计划」",
    "微博发帖 #流浪动物免费TNR指标申请# @瑞鹏公益基金会，配 ≥6 张室外流浪照",
    "仅限\"正在室外流浪\"的猫，家养/已收养的不适用；术后需剪耳标 + 7 天内发反馈"
   ]
  },
  {
   "id": 34,
   "cat": "neuter",
   "emoji": "✂️",
   "level": "red",
   "title": "绝育是行为问题的\"总开关\"",
   "why": "发情期的乱尿、嚎叫、半夜想往外冲、暴躁咬人——绝育后基本消失。所谓\"逆子\"，一半是没绝育的公猫干的事。6-8 月龄是标准时间。",
   "how": [
    "6-8 月龄做（体重达标即可），公猫 ¥150-300 / 母猫 ¥300-600",
    "术前血常规必查，麻醉选呼吸麻醉 + 心电监护",
    "绝育后体重会升，记得控制食量防肥胖"
   ]
  },
  {
   "id": 35,
   "cat": "neuter",
   "emoji": "💸",
   "level": "yellow",
   "title": "警惕低价绝育团购套餐",
   "why": "媒体实测过：218 元套餐最后实收近千元，术中逐项加检查、加消炎针。低价是钩子，加项才是利润。",
   "how": [
    "术前要全项费用清单，问清\"报价含哪些、不含哪些\"",
    "低于 ¥400 的套餐重点警惕",
    "选连锁或口碑院，别只比价格"
   ]
  },
  {
   "id": 36,
   "cat": "neuter",
   "emoji": "🏷️",
   "level": "green",
   "title": "看耳标识猫：剪耳的流浪猫已绝育",
   "why": "TNR 的通行标记是耳尖剪掉一角（左耳或右耳）。看懂这个，你在街上就能判断一只猫是否已绝育——这也是\"绝育标记\"功能最硬的判断依据。",
   "how": [
    "耳尖平整缺一角 = 已绝育（TNR 标记）",
    "喂猫时可据此记录点位猫的绝育状态",
    "家养猫不做剪耳，别混淆"
   ]
  },
  {
   "id": 37,
   "cat": "mindset",
   "emoji": "🤝",
   "level": "yellow",
   "title": "猫是互惠的伴，不是要伺候的主子",
   "why": "把猫当主子伺候，投入失衡，先崩的是你自己。健康的关系是：你给它稳定的环境，它给你情绪价值——是互相的，不是单向的。",
   "how": [
    "拒绝\"猫奴\"式内耗，按需投入不按情绪投入",
    "猫需要的是规律和安全，不是无止境的讨好",
    "养得舒服、彼此可持续，才走得远"
   ]
  },
  {
   "id": 38,
   "cat": "mindset",
   "emoji": "😾",
   "level": "yellow",
   "title": "\"逆子\"多半不是性格坏",
   "why": "拆家、咬手、乱尿、半夜嚎——九成不是猫跟你对着干，是三件可修的事：精力没消耗、没绝育、或身体不适。",
   "how": [
    "先排查：逗猫棒玩够了吗？绝育了吗？砂盆舒服吗？",
    "身体问题优先（牙病、泌尿病、疼痛会让猫变\"凶\"）",
    "用\"立规则 + 放精力\"解决，不用打骂"
   ]
  },
  {
   "id": 39,
   "cat": "mindset",
   "emoji": "🐕",
   "level": "yellow",
   "title": "想遛猫？先做对这三件事",
   "why": "猫能遛，但比狗严格得多。用错装备或散放，轻则丢猫，重则车祸。而且疫苗没打完不能出门。",
   "how": [
    "🔴 必须 H 型胸背式，绝不用脖圈（猫脖子能缩、气管脆）",
    "🔴 绝不散放，牵引绳全程不撒手",
    "疫苗打完（约 3 月龄）+ 室内脱敏 2-4 周，再出门；别像遛狗\"遛一圈\"，是陪它待着"
   ]
  },
  {
   "id": 40,
   "cat": "mindset",
   "emoji": "📋",
   "level": "yellow",
   "title": "领养/买猫，先要疫苗记录",
   "why": "没有记录，医院不认，下针次、狂犬时间、绝育排期全都没法算。这是接猫当天最该做的\"一个动作\"。",
   "how": [
    "索取疫苗记录本，拍照存档",
    "问清：打的三联还是四联、几针、哪天",
    "顺带问驱虫做过没有、妈妈猫健康状况"
   ]
  },
  {
   "id": 41,
   "cat": "mindset",
   "emoji": "🐈",
   "level": "green",
   "title": "三花猫几乎都是母猫",
   "why": "三花的毛色由性染色体决定，公三花概率极低（约三千分之一）且多不育。想养公猫，基本就排除三花了。",
   "how": [
    "选公猫：别盯着三花，看橘、奶牛、狸花",
    "选母猫：三花、玳瑁常见",
    "花色不影响性格，别被玄学带跑，看现场互动最准"
   ]
  }
 ]
};

/* ============ 状态 ============ */
const S = { page:'map', dist:'all', feedFilter:'all', knowTab:'class',
            tipCat:'all', tipLv:'all', pType:'feed', pSter:'unknown', openDay:-1, curPoint:-1 };

const TYPE = {
  feed:   {name:'喂食点', color:'#8FD9B6', emoji:'🍽️', badge:'b-feed'},
  adopt:  {name:'求领养', color:'#FF8A8A', emoji:'🐱',  badge:'b-adopt'},
  rescue: {name:'求助',   color:'#FFB347', emoji:'🆘',  badge:'b-rescue'},
  warning:{name:'提醒',   color:'#A99E9E', emoji:'⚠️',  badge:'b-warn'}
};
const STER = { done:'已绝育', no:'未绝育', group:'群体·部分绝育', unknown:'绝育情况未知' };
const LVN = { red:'高危', yellow:'注意', green:'常识' };

/* ============ 工具 ============ */
const $ = id => document.getElementById(id);
const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('on'), 1700);
}
/* 经纬度 → SVG 坐标（济宁范围线性投影） */
const LNG0=115.95, LNG1=117.45, LAT0=34.65, LAT1=35.95, VW=300, VH=340;
const px = lng => (lng-LNG0)/(LNG1-LNG0)*VW;
const py = lat => (LAT1-lat)/(LAT1-LAT0)*VH;

function pointsOf(key){
  if(key==='all') return DATA.points;
  return DATA.points.filter(p=>p.district===key);
}
function districtKey(lat,lng){
  let best='', bd=Infinity;
  DATA.districts.forEach(d=>{
    if(d.key==='all') return;
    const r=Math.PI/180;
    const x=(lng-d.lng)*Math.cos((lat+d.lat)/2*r)*111, y=(lat-d.lat)*111;
    const k=Math.sqrt(x*x+y*y);
    if(k<bd){bd=k;best=d.key;}
  });
  return best;
}
/* 给点位补上 district 字段 */
DATA.points=[]; DATA.posts=[];

let activity={checks:[],favorites:[],cats:[]};
let draft={name:"",desc:"",spot:"",district:"rencheng",photo:"",file:null,uploadState:"",lat:null,lng:null};
async function reloadPoints(){
  const rows=await window.loadPoints();
  activity=await window.loadActivity();
  DATA.points=rows.map(r=>({id:Number(r.id),type:TYPE[r.type]?r.type:'feed',name:r.name,district:r.district,spot:r.spot,lat:Number(r.lat),lng:Number(r.lng),desc:r.description,sterilized:r.sterilized,cats:Number(r.cats),time:r.created_at.slice(0,10),photo:r.photo||''}));
  DATA.posts=DATA.points.map(p=>({type:p.type,author:'猫友',time:p.time,location:p.spot,content:p.desc,sterilized:p.sterilized,cats:p.cats}));
}
/* ============ 地图页 ============ */
function viewMap(){
  const list = pointsOf(S.dist);
  const d = DATA.districts.find(x=>x.key===S.dist) || DATA.districts[0];

  /* 统计 */
  const cats = list.reduce((n,p)=>n+(p.cats||0),0);
  const feeds = list.filter(p=>p.type==='feed').length;
  const adopts = list.filter(p=>p.type==='adopt').length;

  /* 区圆 */
  let circles = '';
  DATA.districts.forEach(z=>{
    if(z.key==='all') return;
    const x=px(z.lng), y=py(z.lat);
    const sel = (S.dist===z.key);
    circles += `<circle class="dz${sel?' sel':''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="19"
      data-d="${z.key}"><title>${esc(z.name)}</title></circle>`;
    circles += `<text class="dzt${sel?' sel':''}" x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}">${esc(z.short)}</text>`;
  });
  /* 点位 */
  let marks='';
  list.forEach(p=>{
    const t=TYPE[p.type], x=px(p.lng), y=py(p.lat);
    marks += `<circle class="mk" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"
      fill="${t.color}" data-p="${p.id}"><title>${esc(p.name)}</title></circle>`;
    marks += `<text class="mkl" x="${x.toFixed(1)}" y="${(y-11).toFixed(1)}">${t.emoji}</text>`;
  });

  let chips = DATA.districts.map(z=>
    `<div class="chip${S.dist===z.key?' on':''}" data-d="${z.key}">${esc(z.name)}</div>`).join('');

  return `
  <div class="statrow">
    <div class="stat"><b>${list.length}</b><span>点位</span></div>
    <div class="stat"><b>${cats}</b><span>在册猫</span></div>
    <div class="stat"><b>${feeds}</b><span>喂食点</span></div>
    <div class="stat"><b>${adopts}</b><span>待领养</span></div>
  </div>
  <div class="card" style="padding:8px 10px 6px">
    <div class="mapwrap">
      <svg id="mapSvg" viewBox="0 0 ${VW} ${VH}">
        <rect x="0" y="0" width="${VW}" height="${VH}" fill="none"/>
        ${circles}
        ${marks}
      </svg>
      <div class="legend">
        <span><i style="background:#8FD9B6"></i>🍽️ 喂食点</span>
        <span><i style="background:#FF8A8A"></i>🐱 求领养</span>
        <span><i style="background:#FFB347"></i>🆘 求助</span>
        <span><i style="background:#A99E9E"></i>⚠️ 提醒</span>
      </div>
    </div>
  </div>
  <div class="chips">${chips}</div>
  <div class="sec-t"><span class="dot"></span>${esc(d.name)}的点位 · ${list.length} 个</div>
  ${ list.length ? list.map(p=>{
      const t=TYPE[p.type];
      return `<div class="post" data-p="${p.id}" style="cursor:pointer">
        <div class="ph">
          <div class="avatar" style="background:${t.color}33">${t.emoji}</div>
          <div style="flex:1;min-width:0">
            <div class="pn">${esc(p.name)}</div>
            <div class="pm">📍${esc(p.spot||'')} · ${esc(p.time||'')}</div>
          </div>
          ${p.sterilized?`<span class="badge ${p.sterilized==='done'?'b-done':'b-warn'}">${p.sterilized==='done'?'✂️ 已绝育':(p.sterilized==='group'?`✂️ ${p.sterDone||0}/${p.cats||0}`:(p.sterilized==='no'?'✂️ 未绝育':'✂️ 情况未知'))}</span>`:''}
        </div>
        <div class="pc">${esc(p.desc||'')}</div>
      </div>`;
    }).join('') : `<div class="empty"><span class="ee">🐾</span>这个区还没有人标记点位<br>遇到猫咪时点「发布」加一个吧</div>` }
  <div class="hint">点地图上的圆点或下方卡片，查看点位详情</div>`;
}

/* ============ 圈子页 ============ */
function viewFeed(){
  const list = S.feedFilter==='all' ? DATA.posts : DATA.posts.filter(p=>p.type===S.feedFilter);
  const chips = [['all','全部','']].concat(Object.keys(TYPE).map(k=>[k,TYPE[k].name,TYPE[k].emoji]))
    .map(([k,n,e])=>`<div class="chip${S.feedFilter===k?' on m':''}" data-f="${k}">${e?e+' ':''}${n}</div>`).join('');
  return `
  <div class="chips">${chips}</div>
  ${ list.length ? list.map(p=>{
      const t=TYPE[p.type]||TYPE.feed;
      return `<div class="post">
        <div class="ph">
          <div class="avatar" style="background:${esc(p.avatarBg||'#FFD3D3')}">${esc((p.author||'A').slice(0,1))}</div>
          <div style="flex:1;min-width:0">
            <div class="pn">${esc(p.author)}</div>
            <div class="pm">${esc(p.time)} · ${esc(p.distance||'')} · ${esc(p.location||'')}</div>
          </div>
          <span class="badge ${t.badge}">${t.emoji}${t.name}</span>
        </div>
        <div class="pc">${esc(p.content)}</div>
        ${p.sterilized?`<div style="margin-top:7px"><span class="badge ${p.sterilized==='done'?'b-done':'b-warn'}">✂️ ${STER[p.sterilized]}${p.sterilized==='group'?`（${p.sterDone||0}/${p.cats||0}）`:''}</span></div>`:''}
        <div class="pf"><span>❤️ ${p.likes||0}</span><span>💬 ${p.comments||0}</span></div>
      </div>`;
    }).join('') : `<div class="empty"><span class="ee">👥</span>这个类型还没有动态</div>` }
  <div class="hint">共 ${DATA.posts.length} 条邻里动态</div>`;
}

/* ============ 发布页 ============ */
function viewPublish(){
  const tgrid = Object.keys(TYPE).map(k=>{
    const t=TYPE[k];
    return `<div class="topt${S.pType===k?' on':''}" data-t="${k}">
      <span class="te">${t.emoji}</span><span class="tn">${t.name}</span></div>`;
  }).join('');
  const sterOpt = [['done','已绝育'],['no','未绝育'],['unknown','不清楚']]
    .map(([k,n])=>`<div class="topt${S.pSter===k?' on':''}" data-s="${k}" style="padding:8px 2px">
      <span class="te" style="font-size:14px">${k==='done'?'✂️':(k==='no'?'✖️':'❔')}</span>
      <span class="tn">${n}</span></div>`).join('');
  return `
  <div class="pfield">
    <div class="fl">① 这是哪种点位 <span class="rq">必选</span></div>
    <div class="tgrid">${tgrid}</div>
  </div>
  <div class="pfield">
    <div class="fl">② 拍张照片 <span class="pa" style="font-weight:400;color:var(--text-l);font-size:11px">选填</span></div>
    <label class="photo"><span class="pe">📷</span>点击拍照 / 从相册选<input id="photo" type="file" accept="image/*" style="display:none"></label>${draft.photo?`<img src="${draft.photo}" style="max-width:100%;max-height:120px" alt="所选照片">`:""}
  </div>
  <div class="pfield">
    <div class="fl">③ 位置与描述</div>
    <input class="pinput" id="pName" value="${esc(draft.name)}" placeholder="给它起个名字，如：小狸花 · 求领养">
    <select class="pinput" id="pDist">${DATA.districts.filter(d=>d.key!=='all').map(d=>`<option value="${d.key}" ${draft.district===d.key?'selected':''}>${esc(d.name)}</option>`).join('')}</select>
    <input class="pinput" id="pSpot" value="${esc(draft.spot)}" placeholder="位置描述，如街道或附近地标"><div class="hint">点击示意地图选位置</div><svg id="pickMap" viewBox="0 0 300 340" style="width:100%;height:190px;background:#f5faf3;border-radius:12px">${DATA.districts.filter(d=>d.key!=='all').map(d=>`<circle cx="${px(d.lng)}" cy="${py(d.lat)}" r="16" fill="#b5e1cd"/><text x="${px(d.lng)}" y="${py(d.lat)}" text-anchor="middle" font-size="9">${esc(d.short)}</text>`).join('')}${draft.lat!==null?`<circle cx="${px(draft.lng)}" cy="${py(draft.lat)}" r="5" fill="#fa8178"/>`:""}</svg>
    <textarea class="pinput" id="pDesc" placeholder="说点什么，比如：固定喂食 3 只，亲人可摸">${esc(draft.desc)}</textarea>
  </div>
  ${S.pType==='adopt'||S.pType==='rescue'?`
  <div class="pfield">
    <div class="fl">④ 绝育情况 <span class="pa" style="font-weight:400;color:var(--text-l);font-size:11px">帮助判断是否要联系 TNR</span></div>
    <div class="tgrid" style="grid-template-columns:repeat(3,1fr)">${sterOpt}</div>
  </div>`:''}
  <button class="btn full" id="pubBtn">发布到喵邻圈</button>
  <div class="hint">发布后会立刻出现在地图上，附近的猫友就能看到</div>`;
}

/* ============ 知识页 ============ */
function viewKnow(){
  const tabs = [['class','爱猫小课堂'],['tips','避坑干货'],['daily','30 天日更']]
    .map(([k,n])=>`<div class="st${S.knowTab===k?' on':''}" data-k="${k}">${n}</div>`).join('');

  if(S.knowTab==='class'){
    return `<div class="subtab">${tabs}</div>
    ${DATA.knowledge.map(k=>`
      <div class="kitem">
        <div class="kw"><em>❌</em><span>${esc(k.wrong)}</span></div>
        <div class="kr"><span>为什么</span>${esc(k.why)}</div>
        <div class="kr ok"><span>怎么做</span>${esc(k.right)}</div>
      </div>`).join('')}
    <div class="hint">共 ${DATA.knowledge.length} 条 · 主要讲给在户外喂猫的人</div>`;
  }

  if(S.knowTab==='tips'){
    let list = DATA.catTips;
    if(S.tipCat!=='all') list = list.filter(t=>t.cat===S.tipCat);
    if(S.tipLv!=='all')  list = list.filter(t=>t.level===S.tipLv);
    const cc = [['all','全部','🛡️']].concat(DATA.tipCats.filter(c=>c.key!=='all').map(c=>[c.key,c.name,c.emoji]))
      .map(([k,n,e])=>`<div class="chip${S.tipCat===k?' on m':''}" data-c="${k}">${e}${n}</div>`).join('');
    const lc = [['all','全部'],['red','🔴 高危'],['yellow','🟡 注意'],['green','🟢 常识']]
      .map(([k,n])=>`<div class="chip${S.tipLv===k?' on o':''}" data-l="${k}">${n}</div>`).join('');
    return `<div class="subtab">${tabs}</div>
    <div class="chips">${cc}</div>
    <div class="chips" style="margin-top:-4px">${lc}</div>
    ${ list.length ? list.map(t=>`
      <div class="tip ${t.level}">
        <div class="tt"><span>${t.emoji}</span><span>${esc(t.title)}</span>
          <span class="lv ${t.level}">${LVN[t.level]}</span></div>
        <div class="tw">${esc(t.why)}</div>
        <div class="th">${(t.how||[]).map(h=>`<li>${esc(h)}</li>`).join('')}</div>
      </div>`).join('') : `<div class="empty"><span class="ee">🔍</span>这个筛选下暂无内容</div>` }
    <div class="hint">共 ${list.length} / ${DATA.catTips.length} 条干货</div>`;
  }

  /* 日更 */
  const stages = DATA.dailyStages;
  return `<div class="subtab">${tabs}</div>
  <div class="card" style="background:linear-gradient(135deg,#FFF2F0,#FFF8F2)">
    <div class="sec-t" style="margin:0 0 5px"><span class="dot"></span>${esc(DATA.dailyMeta.title||'30 天养猫日更')}</div>
    <div style="font-size:11.5px;color:var(--text-l);line-height:1.7">${esc(DATA.dailyMeta.desc||'')}</div>
  </div>
  ${stages.map(st=>{
    const items = DATA.catDaily.filter(x=>x.stage===st.key);
    if(!items.length) return '';
    return `<div class="stage">
      <div class="sh_"><span class="se">${st.emoji}</span><span class="sn">${esc(st.name)}</span>
        <span class="sr">${esc(st.range)}</span></div>
      ${items.map(x=>{
        const open = S.openDay===x.day;
        return `<div class="day${open?' open':''}" data-day="${x.day}">
          <div class="dn">${x.day}</div>
          <div class="dc">
            <div class="dt">${x.emoji} ${esc(x.title)}</div>
            <div class="dd">${esc(x.date||'')} · 点开看当天该做什么</div>
            <div class="dp">${(x.paras||[]).map(p=>esc(p)).join('<br><br>')}</div>
            ${(x.todo&&x.todo.length)?`<div class="todo"><b>✅ 今天的动作</b>${x.todo.map(t=>'· '+esc(t)).join('<br>')}</div>`:''}
            ${(x.warn&&x.warn.length)?`<div class="warn"><b>🚫 今天别做</b>${x.warn.map(t=>'· '+esc(t)).join('<br>')}</div>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }).join('')}
  <div class="hint">共 ${DATA.catDaily.length} 天 · 点任意一天展开</div>`;
}

/* ============ 我的页 ============ */
function viewMe(){
 const now=new Date(), year=now.getFullYear(), month=now.getMonth();
 const prefix=`${year}-${String(month+1).padStart(2,'0')}`;
 const days=new Date(year,month+1,0).getDate();
 const done=new Set(activity.checks.filter(c=>c.created_at.startsWith(prefix)).map(c=>Number(c.created_at.slice(8,10))));
 return `<div class="mehead"><div class="ma">🐱</div><div><div class="mn">猫友</div><div class="ms">济宁 · 猫咪地图</div></div></div>
 <div class="statrow"><div class="stat"><b>${DATA.points.length}</b><span>点位</span></div><div class="stat"><b>${activity.cats.length}</b><span>猫档案</span></div><div class="stat"><b>${activity.favorites.length}</b><span>收藏</span></div><div class="stat"><b>${activity.checks.length}</b><span>打卡</span></div></div>
 <div class="cal"><div class="sec-t"><span class="dot"></span>${year} 年 ${month+1} 月打卡足迹</div><div class="calgrid">${Array.from({length:days},(_,i)=>`<div class="cd ${done.has(i+1)?'done':''}">${i+1}</div>`).join('')}</div></div>
 <div class="sec-t"><span class="dot"></span>我的收藏</div>${activity.favorites.map(f=>DATA.points.find(p=>String(p.id)===f.point_id)).filter(Boolean).map(p=>`<div class="post" data-p="${p.id}">${esc(p.name)} · ${esc(p.spot)}</div>`).join('') || '<div class="hint">暂无收藏</div>'}
 <div class="sec-t"><span class="dot"></span>猫档案</div>${activity.cats.map(c=>`<div class="card"><b>${esc(c.name)}</b><div>${esc(c.description)}</div></div>`).join('') || '<div class="hint">暂无猫档案</div>'}
 <input class="pinput" id="catName" placeholder="猫咪名字"><textarea class="pinput" id="catDesc" placeholder="猫咪描述"></textarea><button class="btn full" id="catSave">添加猫档案</button>`;
}

/* ============ 点位抽屉 ============ */
function openPoint(id){
  const p = DATA.points.find(x=>x.id===id);
  if(!p) return;
  S.curPoint = id;
  const t = TYPE[p.type];
  const d = DATA.districts.find(x=>x.key===p.district);
  const sterTxt = p.sterilized
    ? (p.sterilized==='done' ? '✂️ 已绝育'
      : (p.sterilized==='group' ? `✂️ 群体 ${p.sterDone||0}/${p.cats||0} 已绝育` : (p.sterilized==='no'?'✖️ 未绝育':'❔ 情况未知')))
    : '';
  $('sheet').innerHTML = `
    <div class="bar"></div>
    <div class="x" id="sheetX">✕</div>
    <h3>${t.emoji} ${esc(p.name)}</h3>
    <div class="sub">${esc(p.spot||'')} · ${esc((d&&d.name)||'')} · ${esc(p.time||'')}</div>
    <div class="kv"><span class="k">类型</span><span class="v"><span class="badge ${t.badge}">${t.name}</span></span></div>
    ${p.cats?`<div class="kv"><span class="k">猫咪</span><span class="v">${p.cats} 只${p.fedToday?` · 今天已被喂 ${p.fedToday} 次`:''}</span></div>`:''}
    ${sterTxt?`<div class="kv"><span class="k">绝育</span><span class="v">${sterTxt}</span></div>`:''}
    ${p.desc?`<div class="kv"><span class="k">说明</span><span class="v">${esc(p.desc)}</span></div>`:''}
    ${p.photo && /^photos\/[a-z0-9-]+\.(png|jpg|webp)$/.test(p.photo)?`<img id="pointPhoto" alt="点位照片" style="max-width:100%;max-height:180px">`:''}
    ${p.type==='warning'?'':`<div class="acts">
      <button class="btn m" id="chkBtn">✅ 我喂过了</button>
      <button class="btn gh" id="favBtn">⭐ 收藏</button>
    </div>`}
    ${p.type==='warning'?`<div class="acts"><button class="btn gh" id="favBtn">⭐ 收藏</button></div>`:''}
  `;
  $('sheet').classList.add('up');
  const image=$('pointPhoto'); if(image) window.bindPointPhoto(image,p.photo).catch(()=>{image.alt='照片加载失败';});
  $('sheetX').onclick = closeSheet;
  const cb = $('chkBtn'); if(cb) cb.onclick = ()=>{ cb.disabled=true; window.recordCheck(p.id,p.cats||0).then(async()=>{await reloadPoints();closeSheet();toast('打卡成功');}).catch(()=>{toast('保存未确认，请刷新查看');}); };
  const fb = $('favBtn'); if(fb) fb.onclick = ()=>{fb.disabled=true;window.recordFavorite(p.id).then(async()=>{await reloadPoints();closeSheet();toast('已收藏');}).catch(()=>{toast('保存未确认，请刷新查看');});};
}
function closeSheet(){ $('sheet').classList.remove('up'); document.querySelector('.screen').scrollTop=0; S.curPoint=-1; }

/* ============ 渲染调度 ============ */
const NAV = {
  map:['🐱 喵邻圈','济宁 · 猫咪地图'],
  feed:['👥 邻里圈子','附近猫友的动态'],
  publish:['➕ 发布点位','让附近的猫友看见'],
  know:['📚 养猫知识','误区 · 干货 · 30 天日更'],
  me:['🙋 我的','打卡 · 收藏 · 猫档案']
};
function render(){
  const v = {map:viewMap, feed:viewFeed, publish:viewPublish, know:viewKnow, me:viewMe}[S.page];
  $('body').innerHTML = v();
  $('body').scrollTop = 0;
  const n = NAV[S.page];
  $('navT').textContent = n[0]; $('navS').textContent = n[1];
  const d = DATA.districts.find(x=>x.key===S.dist);
  $('navB').textContent = S.page==='map' ? ('🗺️ '+(d?d.name:'全市')) : '🐾 喵邻圈';
  document.querySelectorAll('.tb').forEach(e=>e.classList.toggle('on', e.dataset.p===S.page));
  bind();
}

/* ============ 事件委托 ============ */
function captureDraft(){if($('pName')){draft.name=$('pName').value;draft.desc=$('pDesc').value;draft.spot=$('pSpot').value;draft.district=$('pDist').value;}}
function bind(){
  $('body').onchange=function(e){if(e.target.id==='photo'){const file=e.target.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>200000){toast('请选择 200KB 以内的 PNG、JPEG 或 WebP');return;}captureDraft();if(draft.photo.startsWith('blob:')) URL.revokeObjectURL(draft.photo);draft.file=file;draft.photoPath='';draft.uploadState='';draft.photo=URL.createObjectURL(file);render();}};
  $('body').onclick = function(e){
    const chip = e.target.closest('.chip[data-d]');
    if(chip){ S.dist = chip.dataset.d; render(); return; }
    const dz = e.target.closest('.dz');
    if(dz){ S.dist = dz.dataset.d; render(); return; }
    const mk = e.target.closest('.mk');
    if(mk){ openPoint(+mk.dataset.p); return; }
    const fc = e.target.closest('.chip[data-f]');
    if(fc){ S.feedFilter = fc.dataset.f; render(); return; }
    const kk = e.target.closest('.st[data-k]');
    if(kk){ S.knowTab = kk.dataset.k; render(); return; }
    const cc = e.target.closest('.chip[data-c]');
    if(cc){ S.tipCat = cc.dataset.c; render(); return; }
    const ll = e.target.closest('.chip[data-l]');
    if(ll){ S.tipLv = ll.dataset.l; render(); return; }
    const pt = e.target.closest('.post[data-p]');
    if(pt){ openPoint(+pt.dataset.p); return; }
    const op = e.target.closest('.topt[data-t]');
    if(op){captureDraft(); S.pType = op.dataset.t; render(); return; }
    const os = e.target.closest('.topt[data-s]');
    if(os){captureDraft(); S.pSter = os.dataset.s; render(); return; }
    const day = e.target.closest('.day');
    if(day){ const n=+day.dataset.day; S.openDay = (S.openDay===n?-1:n); render();
      if(S.openDay>0){ const el=document.querySelector('.day.open'); if(el) setTimeout(()=>el.scrollIntoView({block:'center',behavior:'smooth'}),50); }
      return; }
    const map=e.target.closest('#pickMap'); if(map){captureDraft();const rect=map.getBoundingClientRect();const ratio=Math.min(rect.width/300,rect.height/340);const x=(e.clientX-rect.left-(rect.width-300*ratio)/2)/ratio, y=(e.clientY-rect.top-(rect.height-340*ratio)/2)/ratio;draft.lng=LNG0+Math.max(0,Math.min(300,x))/300*(LNG1-LNG0);draft.lat=LAT1-Math.max(0,Math.min(340,y))/340*(LAT1-LAT0);draft.district=districtKey(draft.lat,draft.lng);render();return;}
    
    const pb = e.target.closest('#pubBtn');
    if(pb){
      const name=$('pName').value.trim(), desc=$('pDesc').value.trim(), spot=$('pSpot').value.trim(), district=$('pDist').value;
      if(!name || !spot){toast('请填写名称和位置');return;}
      const d=DATA.districts.find(x=>x.key===district); const id=Date.now()*1000+Math.floor(Math.random()*1000);
      pb.disabled=true;
      (async()=>{
        if(draft.saveUnknown) throw Error('保存结果未确认，请刷新查看数据');
        if(draft.uploadState==='unknown') throw Error('照片上传结果未确认，请重新打开后检查');
        if(draft.file && !draft.photoPath){
          const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[draft.file.type];
          draft.photoPath=`photos/${crypto.randomUUID()}.${ext}`; draft.uploadState='unknown';
          await window.uploadPointPhoto(draft.photoPath,draft.file); draft.uploadState='uploaded';
        }
        draft.saveUnknown=true;
        await savePoint({id,type:S.pType,name,district,spot,lat:draft.lat??d.lat,lng:draft.lng??d.lng,desc,sterilized:S.pSter,cats:0,photo:draft.photoPath||'',time:'刚刚'});
        await reloadPoints(); if(draft.photo.startsWith('blob:')) URL.revokeObjectURL(draft.photo);
        draft={name:'',desc:'',spot:'',district:'rencheng',photo:'',file:null,uploadState:'',lat:null,lng:null}; S.page='map'; render(); toast('发布成功');
      })().catch(e=>{pb.disabled=false;toast(e.message==='照片上传结果未确认，请重新打开后检查'?e.message:'保存结果未确认，请刷新查看数据');});
      return;
    }
    const catSave=e.target.closest('#catSave');
    if(catSave){const name=$('catName').value.trim(), desc=$('catDesc').value.trim(); if(!name){toast('请填写猫咪名字');return;} catSave.disabled=true; window.recordCat(name,desc).then(async()=>{await reloadPoints();render();toast('已保存');}).catch(()=>{toast('保存未确认，请刷新查看');});return;}
    const mr = e.target.closest('.mrow[data-m]');
    if(mr){
      const k = mr.dataset.m;
      const msg = {fav:'我的收藏：3 个点位、1 条动态',
        profile:'猫档案 · 张小狸<br>狸花猫 · 母 · 约 3 个月',
        guide:'领养须知：先看健康、再谈条件<br>不熟的猫别硬抱',
        privacy:'请按实际使用情况保护个人信息'}[k];
      toast(msg||''); return;
    }
  };
  const tb = $('tabbar');
  tb.onclick = function(e){
    const t = e.target.closest('.tb'); if(!t) return;
    S.page = t.dataset.p; closeSheet(); render();
  };
}

const NAV_KEYS = {map:1,feed:1,publish:1,know:1,me:1};
/* 首屏：支持 ?p=feed&d=rencheng 直达页签/分区 */
(function(){
  try{
    const q = new URLSearchParams(location.search);
    const p = q.get('p');
    if(p && NAV_KEYS[p]) S.page = p;
    const d = q.get('d');
    if(d && DATA.districts.some(x=>x.key===d)) S.dist = d;
  }catch(e){}
})();
reloadPoints().then(render).catch(()=>{render();toast('数据库连接失败，请刷新重试');});
