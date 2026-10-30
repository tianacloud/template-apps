export const heroes=[
  {
    "name": "诸葛亮",
    "traits": [
      "智慧",
      "坚韧",
      "持重"
    ]
  },
  {
    "name": "貂蝉",
    "traits": [
      "魅力",
      "机变",
      "平民"
    ]
  },
  {
    "name": "岳飞",
    "traits": [
      "武力",
      "忠诚",
      "天真"
    ]
  },
  {
    "name": "曹操",
    "traits": [
      "洞察",
      "机变",
      "多疑"
    ]
  },
  {
    "name": "韩信",
    "traits": [
      "兵略",
      "洞察",
      "天真"
    ]
  },
  {
    "name": "张良",
    "traits": [
      "智慧",
      "果断",
      "心软"
    ]
  },
  {
    "name": "武则天",
    "traits": [
      "魅力",
      "坚韧",
      "狠绝"
    ]
  },
  {
    "name": "荆轲",
    "traits": [
      "决绝",
      "忠诚",
      "平民"
    ]
  },
  {
    "name": "慈禧",
    "traits": [
      "权术",
      "树敌",
      "刚愎"
    ]
  },
  {
    "name": "张角",
    "traits": [
      "魅力",
      "感召",
      "兵略"
    ]
  },
  {
    "name": "崇祯",
    "traits": [
      "勤奋",
      "刚愎",
      "多疑"
    ]
  },
  {
    "name": "胤禛",
    "traits": [
      "执着",
      "勤奋",
      "多疑"
    ]
  },
  {
    "name": "玉林琇",
    "traits": [
      "禅心",
      "度化",
      "平民"
    ]
  },
  {
    "name": "周公",
    "traits": [
      "制礼",
      "圣人",
      "勤奋"
    ]
  },
  {
    "name": "王阳明",
    "traits": [
      "坚韧",
      "执着",
      "修道"
    ]
  },
  {
    "name": "赵匡胤",
    "traits": [
      "武力",
      "归心",
      "仁厚"
    ]
  },
  {
    "name": "王坚",
    "traits": [
      "防御",
      "地理",
      "天真"
    ]
  },
  {
    "name": "嘉靖",
    "traits": [
      "昏君",
      "权术",
      "狠绝"
    ]
  },
  {
    "name": "霍去病",
    "traits": [
      "骠骑",
      "果断",
      "孤注"
    ]
  },
  {
    "name": "司马懿",
    "traits": [
      "兵略",
      "韬晦",
      "智慧"
    ]
  },
  {
    "name": "宋神宗",
    "traits": [
      "勤奋",
      "急躁",
      "盲目"
    ]
  }
];
export const scenarios=[
  {
    "id": "tutorial",
    "name": "教学关·十面埋伏",
    "board": {
      "POWER_OWN": 5,
      "POWER_ENEMY": 8,
      "HUMAN_OWN": 1,
      "DELUSION_ENEMY": 1,
      "VOID": 1
    },
    "boardSize": 4,
    "victory": "十面埋伏",
    "setback": "损兵折将",
    "defeat": "楚王逃脱",
    "deck": "教学",
    "isTutorial": true
  },
  {
    "id": "northern_expedition",
    "name": "诸葛北伐",
    "board": {
      "POWER_ENEMY": 9,
      "POWER_OWN": 6,
      "TERRAIN_ENEMY": 2,
      "TIMING_NEUTRAL": 2,
      "HUMAN_OWN": 1,
      "POWER_NEUTRAL": 2,
      "DELUSION_OWN": 2,
      "DELUSION_ENEMY": 3,
      "HINDER_OWN": 3,
      "WEAKNESS_ENEMY": 3,
      "VOID": 3
    },
    "victory": "兴复汉室",
    "setback": "劳师无功",
    "defeat": "秋风五丈原",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "diaochan",
    "name": "貂蝉腾挪",
    "board": {
      "DELUSION_ENEMY": 6,
      "POWER_ENEMY": 11,
      "WEAKNESS_ENEMY": 3,
      "DELUSION_OWN": 2,
      "HINDER_OWN": 3,
      "POWER_OWN": 1,
      "TIMING_NEUTRAL": 2,
      "HUMAN_NEUTRAL": 2,
      "HUMAN_OWN": 2,
      "POWER_NEUTRAL": 2,
      "VOID": 2
    },
    "victory": "父子相残",
    "setback": "妾实无辜",
    "defeat": "计败身死",
    "deck": "挑拨+1",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "yuefei",
    "name": "岳飞蒙难",
    "board": {
      "POWER_ENEMY": 8,
      "POWER_OWN": 4,
      "DELUSION_ENEMY": 1,
      "DELUSION_OWN": 1,
      "HINDER_OWN": 1,
      "WEAKNESS_ENEMY": 3,
      "TIMING_NEUTRAL": 2,
      "TERRAIN_NEUTRAL": 2,
      "HUMAN_NEUTRAL": 2,
      "POWER_NEUTRAL": 11,
      "VOID": 1
    },
    "victory": "收复故土",
    "setback": "腹背受敌",
    "defeat": "风波亭！",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "eight_nations",
    "name": "八国联军",
    "board": {
      "POWER_ENEMY": 10,
      "DELUSION_ENEMY": 4,
      "POWER_OWN": 2,
      "DELUSION_OWN": 2,
      "HINDER_OWN": 4,
      "WEAKNESS_ENEMY": 3,
      "TIMING_NEUTRAL": 1,
      "TERRAIN_OWN": 1,
      "HUMAN_NEUTRAL": 1,
      "POWER_NEUTRAL": 8
    },
    "victory": "庚子挽澜",
    "setback": "两宫西狩",
    "defeat": "辛丑国耻",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "ming",
    "name": "明末崩塌",
    "board": {
      "POWER_ENEMY": 6,
      "POWER_OWN": 5,
      "HINDER_OWN": 7,
      "DELUSION_ENEMY": 3,
      "DELUSION_OWN": 3,
      "WEAKNESS_ENEMY": 2,
      "TIMING_NEUTRAL": 2,
      "TERRAIN_NEUTRAL": 2,
      "HUMAN_ENEMY": 2,
      "POWER_NEUTRAL": 3,
      "VOID": 1
    },
    "victory": "中兴大明",
    "setback": "偏安江南",
    "defeat": "煤山殉国",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "nine_dragons",
    "name": "九龙夺嫡",
    "board": {
      "POWER_ENEMY": 15,
      "POWER_OWN": 1,
      "DELUSION_OWN": 10,
      "HINDER_OWN": 1,
      "WEAKNESS_ENEMY": 1,
      "DELUSION_ENEMY": 1,
      "HUMAN_NEUTRAL": 5,
      "TERRAIN_ENEMY": 1,
      "HUMAN_ENEMY": 1
    },
    "victory": "继承大统",
    "setback": "严旨斥责",
    "defeat": "永远圈禁",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12,
    "deckEmptyRemoveEnemyPower": 35
  },
  {
    "id": "zhougong",
    "name": "制礼作乐",
    "board": {
      "HINDER_OWN": 15,
      "POWER_ENEMY": 10,
      "HUMAN_ENEMY": 1,
      "TIMING_NEUTRAL": 2,
      "POWER_NEUTRAL": 2,
      "DELUSION_ENEMY": 2,
      "WEAKNESS_ENEMY": 1,
      "DELUSION_OWN": 1,
      "POWER_OWN": 1,
      "VOID": 1
    },
    "victory": "制礼作乐",
    "setback": "桑林之舞",
    "defeat": "恐怖人祭",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "longchang",
    "name": "龙场悟道",
    "board": {
      "POWER_ENEMY": 6,
      "POWER_OWN": 5,
      "DELUSION_OWN": 15,
      "TIMING_NEUTRAL": 1,
      "HUMAN_NEUTRAL": 1,
      "HINDER_OWN": 1,
      "VOID": 7
    },
    "victory": "知行合一",
    "setback": "毫无所得",
    "defeat": "走火入魔",
    "deck": "标准30张",
    "righteousPowerOnly": true,
    "enemyShowdownFromTurn": 7,
    "enemyShowdownEvery": 4
  },
  {
    "id": "beijiu",
    "name": "杯酒释兵权",
    "board": {
      "POWER_ENEMY": 13,
      "POWER_OWN": 5,
      "DELUSION_OWN": 2,
      "TIMING_NEUTRAL": 1,
      "TERRAIN_NEUTRAL": 1,
      "HUMAN_OWN": 1,
      "HUMAN_NEUTRAL": 5,
      "HINDER_OWN": 1,
      "WEAKNESS_ENEMY": 2,
      "DELUSION_ENEMY": 2,
      "VOID": 3
    },
    "victory": "杯酒释兵权",
    "setback": "君臣离心",
    "defeat": "烽烟四起",
    "deck": "标准30张",
    "showdownLimit": 1
  },
  {
    "id": "diaoyu",
    "name": "钓鱼城坚守",
    "board": {
      "POWER_ENEMY": 15,
      "POWER_OWN": 5,
      "DELUSION_OWN": 1,
      "TIMING_NEUTRAL": 1,
      "TERRAIN_OWN": 5,
      "HUMAN_NEUTRAL": 2,
      "HINDER_OWN": 1,
      "WEAKNESS_ENEMY": 2,
      "DELUSION_ENEMY": 2,
      "VOID": 2
    },
    "victory": "岿然不动",
    "setback": "摇摇欲坠",
    "defeat": "城池陷落",
    "deck": "标准30张",
    "cannotShowdown": true,
    "enemyShowdownFromTurn": 10,
    "enemyShowdownEvery": 3,
    "deckEmptyWin": true
  },
  {
    "id": "daliyi",
    "name": "大礼议",
    "board": {
      "POWER_OWN": 9,
      "POWER_ENEMY": 6,
      "DELUSION_OWN": 1,
      "TIMING_NEUTRAL": 3,
      "HUMAN_NEUTRAL": 3,
      "HINDER_OWN": 1,
      "WEAKNESS_ENEMY": 2,
      "DELUSION_ENEMY": 1,
      "VOID": 4,
      "POWER_NEUTRAL": 6
    },
    "victory": "暗操独治",
    "setback": "左顺门",
    "defeat": "满朝皆敌",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  },
  {
    "id": "fenglang",
    "name": "封狼居胥",
    "board": {
      "POWER_OWN": 8,
      "POWER_ENEMY": 6,
      "TERRAIN_ENEMY": 3,
      "HUMAN_OWN": 1,
      "TIMING_NEUTRAL": 1,
      "WEAKNESS_ENEMY": 2,
      "DELUSION_ENEMY": 2,
      "HINDER_OWN": 1,
      "VOID": 12
    },
    "victory": "威震四夷",
    "setback": "劳师无功",
    "defeat": "失道当斩",
    "decisiveText": "封狼居胥",
    "decisiveMargin": 12,
    "deck": "标准30张",
    "showdownLimit": 1
  },
  {
    "id": "gaoping",
    "name": "高平陵之变",
    "board": {
      "POWER_OWN": 3,
      "POWER_ENEMY": 8,
      "TERRAIN_ENEMY": 1,
      "HUMAN_OWN": 1,
      "TIMING_NEUTRAL": 1,
      "TIMING_OWN": 1,
      "DELUSION_ENEMY": 2,
      "WEAKNESS_ENEMY": 2,
      "POWER_NEUTRAL": 17
    },
    "victory": "诛杀政敌",
    "setback": "无",
    "defeat": "家族覆灭",
    "deck": "标准30张",
    "showdownLimit": 1,
    "neutralPowerNoSide": true
  },
  {
    "id": "xining",
    "name": "熙宁变法",
    "board": {
      "HINDER_OWN": 6,
      "POWER_OWN": 4,
      "POWER_ENEMY": 7,
      "DELUSION_OWN": 3,
      "DELUSION_ENEMY": 1,
      "WEAKNESS_ENEMY": 1,
      "POWER_NEUTRAL": 8,
      "TIMING_ENEMY": 1,
      "HUMAN_OWN": 1,
      "VOID": 4
    },
    "victory": "富国强兵",
    "setback": "皆言不便",
    "defeat": "党争不休",
    "deck": "标准30张",
    "enemyShowdownAtTurn": 12
  }
];
export const traits={
  "智慧": "手牌上限+1",
  "魅力": "挑拨效果+1",
  "机变": "利用可当挑拨用",
  "忠诚": "开局删1张己方妄念",
  "武力": "开局获1档己方实力",
  "坚韧": "每次摊牌受挫（无论主动还是敌方摊牌）后增加1张己方实力",
  "洞察": "开局随机多揭示4格",
  "兵略": "连接加成+1",
  "果断": "天时永远闪耀",
  "仁爱": "开局得1张己方人和",
  "多疑": "开局多1张己方妄念",
  "刚愎": "手牌上限-1",
  "骄兵": "摊牌波动扩大至±40%",
  "树敌": "开局多1张敌方实力",
  "心软": "削弱无法消灭敌方实力（降至0档仍存活）",
  "持重": "初始牌库删除1张奇谋",
  "权术": "蓄力效果+1；每次蓄力则随机空位生成1张己方掣肘（无空位则不生成）",
  "感召": "摊牌时中立实力牌：75%归己方、25%归敌方（天时地利人和不受影响）",
  "决绝": "奇谋有90%概率删除任意档敌方实力",
  "天真": "摊牌时中立实力牌：75%归敌方、25%归己方（天时地利人和不受影响）",
  "勤奋": "每回合可以免费一次调研或销毁或者替换",
  "禅心": "敌方每有1张3级弱点，每回合50%概率敌方+中立各减1档实力，己方也减但不低于1档",
  "度化": "挑拨效果改为：可将敌方妄念转为弱点，或增加已有弱点",
  "不杀": "开局牌库删除所有「削弱」和「奇谋」牌",
  "制礼": "任何方式消除掣肘时，50%概率原地生成1档己方实力",
  "圣人": "50%概率每回合随机1张己方掣肘-1档，如果有制礼等影响清除掣肘的特性也触发",
  "平民": "蓄力和正道有50%概率失效，失效则删除此手牌",
  "执着": "蓄力卡牌效果变成+2，但同时诞生一个己方妄念。无空位不诞生",
  "修道": "修心不再减少己方妄念，反而揭示并增加妄念档数。如果本局获得5档己方妄念，则所有己方妄念变成同档己方天时",
  "地理": "地利效果翻倍",
  "防御": "地利现在像弱点一样削弱敌方的实力。摊牌或被摊牌受挫时，优先删除远离地利的实力牌",
  "归心": "如果人和比对方高5档和以上，则摊牌时在最终结果上获得一个30%的额外加成",
  "仁厚": "引导中立人和时直接额外升1档",
  "昏君": "如果己方实力大于3，除3张外，所有己方实力变成己方掣肘",
  "狠绝": "削弱可以当清理用。且任何掣肘被消灭时原地生成一个中立实力，同时增加敌方人和档数。满档则繁殖。如果没有敌方人和就在空位生成一个",
  "骠骑": "实力的链接加成改成负的。但每一张计算时额外+0.5",
  "孤注": "开始时销毁一半牌库，但增加5档己方天时。空位不够则删除中立天时露出空位",
  "韬晦": "如果只调研，则保持韬晦状态，直到第一次用牌时打破韬晦，此时获得韬晦回合数*0.7次单回合打牌次数",
  "急躁": "蓄力效果+1，但创造或增加一档敌方人和",
  "盲目": "开局时把中立实力全部变成掣肘"
};
