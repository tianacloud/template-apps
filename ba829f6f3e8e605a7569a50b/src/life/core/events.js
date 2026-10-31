/**
 * core/events.js —— 人生模拟器 · 事件池
 *
 * 规则：
 *  - slot: 'xxx'    → 同 slot 的若干条是"轮换组"，每局只出其中 1 条（原 7 个必出节点已全部改为轮换组）
 *  - pinned: true   → 每局必出（无 slot 时才是无条件必出）
 *  - 其余事件按阶段随机抽取，每局组合不同
 *  - order 用于同年龄事件的先后（越小越靠前）
 *  - cond(s) 不满足则整条跳过
 *  - gender: 'm' / 'f' 可用于性别专属事件
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifeEvents = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

/* ============================================================
 *  共用：高考分数结算（放榜组所有变体共用同一套数值）
 * ============================================================ */

function rollScore(s, rng) {
  const raw = s.int * 0.5 + s.amb * 0.22 + s.luk * 0.12 + s.family * 0.06 + rng() * 22 - 11
  let band
  if (raw >= 83) {
    s.edu = 5
    s.amb += 6
    s.happy += 8
    s.flags.push('top_scorer')
    band = 5
  } else if (raw >= 66) {
    s.edu = 4
    s.happy += 4
    band = 4
  } else if (raw >= 50) {
    s.edu = 3
    s.happy -= 2
    band = 3
  } else if (raw >= 35) {
    s.edu = 2
    s.happy -= 8
    s.amb -= 4
    band = 2
  } else {
    s.edu = 1
    s.happy -= 14
    s.amb -= 6
    s.cha += 4
    band = 1
  }
  return { band, tone: raw >= 66 ? 'good' : raw >= 50 ? 'neutral' : 'bad' }
}

const SCORE_TEXT = {
  5: '比你估的最高分还高。你盯着那串数字，第一反应不是高兴，是不敢相信。后来你妈在客厅叫了一声，你才哭出来。你考得很好——好到那些熬过的夜突然都有了说法。',
  4: '比模拟考高了十几分，够上一所不错的一本。你松了口气，又有点空落落的：原来十二年，最后就落在这几个数字上。',
  3: '一个不好不坏的分数，够上二本。有人来问你考了多少，你说了一个数，对方说"挺好"。你知道那个"挺好"后面还有半句话没说。',
  2: '只够专科。你在原地坐了很久，直到天黑。后来你想通一件事：这张卷子只考了你会做的题，没考你是个什么人。',
  1: '差了本科线一截。你没哭，只是觉得周围的声音都变远了。人生第一次真正的分岔，原来长得这么不体面。'
}

/* 志愿组共用：复读一年 */
function repeatResolve(s, rng) {
  const up = s.amb * 0.4 + s.int * 0.3 + rng() * 50
  if (up > 70) {
    s.edu = Math.min(5, s.edu + 2)
    return {
      tone: 'good',
      effects: { happy: 14, amb: 6 },
      text: '那一年你把自己关成了一台机器。第二年分数涨了 90 分，你去了一个原本不敢想的学校。你从此相信：人是可以在一年里改变轨迹的，只要付得起。'
    }
  }
  return {
    tone: 'bad',
    effects: { happy: -10 },
    text: '第二年只涨了 20 分。你去了一个差不多的学校。那一年教会你的不是"努力会有回报"，而是"努力也可能只是让你知道自己的极限在哪"。'
  }
}

/* ============================================================
 *  身份判断：这局到底在走哪条路
 *  - gov      体制内（考公/事业编）
 *  - founder  创业/自己开公司
 *  - freelance 单干接活
 *  这三类不该再遇到"公司裁员、猎头、HR、团建"这类纯公司剧情
 * ============================================================ */

function isStaff(s) {
  return !s.flags.some(f => ['gov', 'founder', 'freelance'].includes(f))
}

/* ============================================================
 *  童年 · 6 — 12 岁
 * ============================================================ */

const CHILDHOOD = [
  {
    id: 'c_silence',
    stage: 2,
    age: 7,
    slot: 'open',
    pinned: true,
    title: '饭桌上的沉默',
    scene: '你七岁。最近家里的饭桌越来越安静。父母之间有一种说不清的低气压，你不太懂，但能感觉到。',
    options: [
      {
        text: '埋头吃饭，尽快回房间',
        effects: { happy: -6, int: 3 },
        result: '你学会了把注意力收进自己肚子里。这个本事后来让你在很多场合活得比同龄人舒服，也让你更晚学会怎么跟人说心里话。'
      },
      {
        text: '讲个学校里的笑话，把气氛撑起来',
        effects: { happy: 3, cha: 4, amb: 2 },
        result: '你讲了个并不好笑的段子。父亲笑了，母亲也笑了。你第一次发现，一个家的气氛是可以被人撑住的——这个发现让你从此很难安心地只做自己。'
      },
      {
        text: '问妈妈："你们是不是要离婚"',
        effects: { happy: -10, cha: 6, int: 2 },
        result: '母亲愣了一下，说"别瞎想"。但那天晚上她哭了。你从此养成一个习惯：有什么话都问出来。这让你显得不合时宜，也让你少了很多年的误会。'
      }
    ]
  },
  {
    id: 'c_perform',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '给叔叔们背首诗',
    scene: '你七岁。家里来了父亲的几个同事，酒过三巡，父亲招手叫你过去："来，给大家背首诗。"',
    options: [
      {
        text: '站到中间，背得很大声',
        effects: { happy: 2, cha: 6, amb: 2 },
        result: '你背了《春晓》，背完一桌人鼓掌。父亲笑得很开，那晚他多喝了两杯。你第一次知道，你能让他在别人面前有面子——这件事后来变成了你的习惯。'
      },
      {
        text: '躲到母亲身后',
        effects: { happy: -4, cha: -3, amb: -4, family: 2 },
        result: '父亲说"这孩子怕生"，替你打了圆场。你在厨房帮母亲端菜，听见客厅里他们在聊别的事。你松了一口气，也有点失落。'
      },
      {
        text: '说"我不想背"，站在那儿不动',
        effects: { cha: 5, amb: 6, happy: -2, family: -3 },
        result: '气氛僵了两秒，父亲脸色沉了一下，说"那就算了"。那晚没人再提这事。你很早就发现，拒绝是可以的，只是要付一点代价。'
      }
    ]
  },
  {
    id: 'c_knock',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '有人敲门',
    scene: '你七岁。晚上有人敲门，敲得很重。父亲去开门，在门口站了很久，说话的声音压得很低。母亲把你带进里屋，说"别看"。',
    options: [
      {
        text: '趴在门缝上听',
        effects: { int: 4, happy: -5 },
        result: '你听见"再宽限几天"。那些人走了以后，父亲在阳台上抽了半包烟。你第一次知道，大人也会怕。'
      },
      {
        text: '假装什么都没听见，回房间写作业',
        effects: { happy: -2, int: 2, amb: 4 },
        result: '你把那页字写得很整齐，一笔都没出格。你学会了一种本事：把处理不了的事，先放到一边。这本事后来救过你很多次，也让你错过了很多次。'
      },
      {
        text: '出去问父亲"我们家是不是没钱了"',
        effects: { cha: 5, happy: -6, family: 3 },
        result: '父亲愣了一下，蹲下来，说"有钱，你别管这个"。但你看见他的手在抖。你从那天起对钱有一种别人没有的敏感——这让你后来很少缺钱，也很少松弛。'
      }
    ]
  },
  {
    id: 'c_hospital',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '医院的味道',
    scene: '你七岁。母亲住院了，你被送到外婆家住一周。外婆家的枕头有樟脑丸的味道，你每天晚上都睡不着。',
    options: [
      {
        text: '每天打电话问妈妈什么时候回来',
        effects: { happy: 3, family: 5, cha: 2 },
        result: '你每天七点打一次，通话不超过两分钟。第七天她回来了，你抱着她不撒手，被大人笑"这么大了还黏人"。你没有解释。'
      },
      {
        text: '不打电话，怕听见她声音会哭',
        effects: { happy: -5, int: 3, amb: 3 },
        result: '你一次都没打。母亲后来说，她那几天一直在等电话。你听了很难受，但你也没解释为什么。有些沉默，是从很小的时候开始的。'
      },
      {
        text: '在外婆家把自己照顾得很好',
        effects: { con: 5, happy: -1, int: 2 },
        result: '你自己洗袜子，自己定闹钟起床。外婆到处夸你懂事。"懂事"这个词后来跟了你很多年，你有时候喜欢它，有时候恨它。'
      }
    ]
  },
  {
    id: 'c_report',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '家长会',
    scene: '你七岁。期中家长会，老师要念排名。你考了第十九名。父亲说他不去，母亲说她请假要扣钱。',
    options: [
      {
        text: '求母亲去，保证"我下次考好"',
        effects: { amb: 4, happy: -3, family: 3 },
        result: '她去了，回来没说什么，只把卷子上的错题讲了一遍。你那天晚上把错题抄了三遍。你后来一直用"下次"这两个字撑着，撑着撑着就长大了。'
      },
      {
        text: '说"那别去了"',
        effects: { happy: 2, amb: -3, cha: 2 },
        result: '家长会那天你的位置空着。老师说"没关系"。你坐在教室最后面，觉得空着也挺好，又觉得不太好。'
      },
      {
        text: '自己溜进教室，站在后门听',
        effects: { int: 5, happy: -4, amb: 5 },
        result: '你听见自己的名字，也听见"这孩子脑子不笨，就是不用心"。你在后门站了整场。那是你第一次偷听关于自己的评价，也是最诚实的一次。'
      }
    ]
  },
  {
    id: 'c_dog',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '那条狗',
    scene: '你七岁。家里的狗挣开绳子跑出去，三天没回来。父亲去村口问了两趟，说"这个季节，怕是让人套走了"。',
    options: [
      {
        text: '一个人沿着街找了三天',
        effects: { happy: -6, con: 4, cha: 3 },
        result: '你用作业本背面写寻狗启事，字歪歪扭扭。第四天有人在垃圾站看见它。你哭了一场，然后自己拿铁锹把它埋了。你七岁就学会了怎么处理一个真正的结束。'
      },
      {
        text: '相信它认得路，会自己回来',
        effects: { happy: -3, int: 2, cha: 2 },
        result: '你每天放学都在巷口站一会儿，听见爪子挠地的声音就回头。它没回来。你很久以后才明白，有些等待是没有尽头的，早一点承认反而好。'
      },
      {
        text: '第二天就想要一只新的',
        effects: { happy: 6, family: 2, amb: -2 },
        result: '父亲又抱回来一只，长得有点像。你很快就喜欢上它了。你后来发现自己是个恢复得很快的人——这既是天赋，也是某种不深情。'
      }
    ]
  },
  {
    id: 'c_blackout',
    stage: 2,
    age: 7,
    slot: 'open',
    title: '停电的晚上',
    scene: '你七岁。夏天，整片区停电。父亲翻出蜡烛，母亲切了西瓜。三个人坐在客厅地板上，谁也没玩手机——那时候还没有手机。',
    options: [
      {
        text: '缠着父亲讲他小时候的事',
        effects: { happy: 10, family: 6, cha: 3 },
        result: '他讲了很多：怎么在河里摸鱼，怎么被你爷爷打，怎么走了二十里路去看一场电影。你第一次觉得父亲是个具体的人，而不只是"爸爸"。这个晚上你记了一辈子。'
      },
      {
        text: '趴在凉席上早早睡了',
        effects: { happy: 2, health: 3 },
        result: '你睡着了，蜡烛还亮着。后来母亲说，那晚她和父亲聊到很晚，聊的是你——聊你以后该上哪个学校。'
      },
      {
        text: '害怕，一直抓着母亲的手',
        effects: { happy: 4, family: 4, amb: -3 },
        result: '你问"鬼会来吗"。母亲说不会。你抓着她的手睡着了。有些安全感你得到得太容易，长大后要找很久。'
      }
    ]
  },
  {
    id: 'c_class',
    stage: 2,
    age: 9,
    title: '周末去哪儿',
    scene: '母亲拿回三张传单：钢琴、奥数，和一个叫"少儿体适能"的东西。她说都行，你自己选。',
    options: [
      {
        text: '钢琴',
        effects: { money: -2, cha: 6, happy: -4 },
        result: '你学了三年，考到六级，之后再没碰过。但很多年后你在聚会上随手弹了一小段，有人看你的眼神变了。'
      },
      {
        text: '奥数',
        effects: { int: 8, happy: -6 },
        result: '你在奥数班待了两年。题目比学校难十倍，你在里面第一次尝到"想通一件事"的爽。那种爽后来变成了很难被满足的口味。'
      },
      {
        text: '体适能（其实就是跳绳）',
        effects: { con: 8, happy: 4, health: 4 },
        result: '你在那儿学会了跳绳、翻跟头，还有怎么被教练吼了也不哭。身体把这些记住了，记得比脑子牢。'
      },
      {
        text: '什么都不去，在家看电视',
        effects: { happy: 8, int: -2, health: -2 },
        result: '你度过了很多个无所事事又很舒服的周末。多年后你偶尔会想，如果当时学了点什么会怎样——然后你就不想了。'
      }
    ]
  },
  {
    id: 'c_cat',
    stage: 2,
    age: 6,
    title: '楼下的那只猫',
    scene: '一只瘦橘猫每天在你家单元门口等。你偷偷把早饭的鸡蛋分它一半。它吃的时候，尾巴会翘起来。',
    options: [
      {
        text: '求父母收养它',
        effects: { happy: 4, cha: 5, family: 2 },
        result: '父母说"养你都费劲"。你没能把它带回家，但你在楼道里给它铺了个纸箱，喂了两年。后来它胖了，见你会叫。'
      },
      {
        text: '每天喂，但不说',
        effects: { happy: 8, cha: 4 },
        result: '你瞒了家里三年。这件事谁也不知道，但它让你在很小的时候就明白了一件事：有些善意不需要被看见，它自己会发光。'
      },
      {
        text: '有一天它没来',
        effects: { happy: -8, cha: 5 },
        result: '你等了一个星期。后来听邻居说，它被车撞了。你哭了一场，然后第一次意识到，喜欢的东西是会消失的，而且没有预告。'
      }
    ]
  },
  {
    id: 'c_money',
    stage: 2,
    age: 8,
    title: '少了五十块',
    scene: '妈妈放在抽屉里的五十块钱不见了。她没有直接问你，但吃饭的时候一直看你。',
    options: [
      {
        text: '主动说"不是我"',
        effects: { happy: -4, cha: 2 },
        result: '你说得太急，反而像心虚。她"嗯"了一声，那个"嗯"在你心里转了很多年。你第一次知道，被怀疑是无法自证的。'
      },
      {
        text: '沉默，等她开口',
        effects: { happy: -6, int: 3 },
        result: '她最后没问。第二天她自己找到了，在另一条裤子的口袋里。她没道歉，你也没提。这件事就这么过去了——但你记住了"过去"和"解决"是两回事。'
      },
      {
        text: '把自己的压岁钱偷偷放回去',
        effects: { happy: -2, cha: 5, money: -1 },
        result: '她以为钱找到了，松了口气。你也松了口气。那天晚上你第一次尝到一种很奇怪的味道：明明做了好事，却觉得自己受了委屈。'
      }
    ]
  },
  {
    id: 'c_tv',
    stage: 2,
    age: 7,
    title: '电视里的洪水',
    scene: '新闻里在播南方的洪水。一整个村子被淹了，有人在屋顶上挥手。你妈换了台，说"看这个干嘛"。',
    options: [
      {
        text: '一直想着，晚上睡不着',
        effects: { happy: -5, cha: 5, int: 2 },
        result: '你躺了很久，想着那些挥手的人后来怎么样了。没有人告诉你答案。你从那时候起就知道，这个世界上有很多事，你只能看着。'
      },
      {
        text: '问了妈妈很多问题',
        effects: { int: 5, cha: 3, happy: -2 },
        result: '她答了几个就烦了，说"小孩子别管这些"。你不问了，但你记住了她回答不上来的样子。'
      },
      {
        text: '换台，去看动画片',
        effects: { happy: 4 },
        result: '动画片很好看。你笑了好几次。很多年后你才明白，能在七岁那年安心看动画片，本身就是一种运气。'
      }
    ]
  },
  {
    id: 'c_cheat',
    stage: 2,
    age: 10,
    title: '最后一道大题',
    scene: '期末考试，最后一道大题你完全不会。前面那个同学的卷子摊得很开，数字看得很清楚。',
    options: [
      {
        text: '抄了',
        effects: { happy: 2, int: -3, amb: -4 },
        result: '你抄了个满分，老师在班上表扬了你。你低头坐着，脸很烫。那种"不配"的感觉，比考砸难受得多。'
      },
      {
        text: '空着交卷',
        effects: { int: 2, happy: -5, amb: 5 },
        result: '你考了 82 分，回家被说了两句。但你把那道题抄在本子上，自己琢磨了一个暑假。后来你会做了，而且记得特别牢。'
      },
      {
        text: '用另一种方法硬算，算出个错的',
        effects: { int: 6, happy: -1 },
        result: '你算错了，一分没得。但老师在讲评时说"这个思路很特别"。你第一次知道，错的东西也可能是有价值的。'
      }
    ]
  },
  {
    id: 'c_grandma',
    stage: 2,
    age: 9,
    title: '外婆睡着了',
    scene: '那天早上家里很安静。你妈眼睛是肿的，她蹲下来跟你说："外婆睡着了，以后不会醒了。"',
    options: [
      {
        text: '哭着问为什么不叫醒她',
        effects: { happy: -10, cha: 4, family: 3 },
        result: '你妈抱着你哭了。那是你第一次看见她哭。你忽然明白，大人不是不会哭，是没人可以哭给他们看。'
      },
      {
        text: '什么都没说，去抱了抱妈妈',
        effects: { happy: -4, cha: 7, family: 8 },
        result: '她愣了一下，然后抱得更紧了。那一刻你没说话，但你做对了一件很多成年人一辈子都学不会的事。'
      },
      {
        text: '照常去上学，装作没事',
        effects: { happy: -8, int: 4 },
        result: '你在课堂上很安静，老师以为你病了。你用"正常"把自己包了起来。这个办法很好用，你后来用了很多年。'
      }
    ]
  },
  {
    id: 'c_move',
    stage: 2,
    age: 10,
    title: '搬家',
    scene: '父亲工作调动，全家要搬到另一个城市。你妈说"那边学校更好"，语气像是在说服自己。',
    options: [
      {
        text: '反抗，哭闹，说死也不去',
        effects: { happy: -6, family: -4, cha: 4, amb: 4 },
        result: '你闹了三天，最后还是去了。但你第一次发现，自己的意愿是可以被表达出来的——即使没有用。'
      },
      {
        text: '默默收拾东西',
        effects: { happy: -9, int: 4, con: 3 },
        result: '你把同学送的东西一件件装好，一件没丢。新学校的第一学期你几乎不说话。你学会了怎么在一个陌生的地方重新长出来。'
      },
      {
        text: '把它当成一次冒险',
        effects: { happy: 3, cha: 6, amb: 5 },
        result: '你在新学校第一个星期就交到了朋友。你发现"新来的"这个身份其实挺好用——没有人知道你的过去，你可以重新做一个人。'
      }
    ]
  },
  {
    id: 'c_relative',
    stage: 2,
    age: 8,
    title: '更喜欢谁',
    scene: '过年，一屋子亲戚。有人笑着问你："你更喜欢爸爸还是妈妈呀？"所有人都停下来看你。',
    options: [
      {
        text: '"都喜欢"',
        effects: { cha: 4 },
        result: '大家笑了，说这孩子会说话。你也笑了。你从八岁起就知道，有些问题不是要答案，是要一个让大家都能下台的回答。'
      },
      {
        text: '认真回答"妈妈"',
        effects: { happy: -3, cha: 2, family: -3 },
        result: '满屋子人笑成一团，你爸脸上的笑僵了一下。你当时不懂哪里错了。你只是说了实话。'
      },
      {
        text: '反问："你更喜欢你儿子还是女儿？"',
        effects: { cha: 7, amb: 6, family: -4 },
        result: '屋里安静了两秒，然后爆笑。那个亲戚脸红了一下，说"这孩子厉害"。你第一次尝到用一句话把场面翻过来的滋味。'
      }
    ]
  },
  {
    id: 'c_radio',
    stage: 2,
    age: 11,
    title: '广播站',
    scene: '学校广播站招人。老师说你的声音"挺有辨识度"，让你去试试。',
    options: [
      {
        text: '去了，而且很投入',
        effects: { cha: 9, happy: 7, amb: 4 },
        result: '你每周三中午念稿子。有一次你念错了一个字，全年级都笑。你脸红了一下午，但第二天还是去了。你从那时候开始不怕被听见。'
      },
      {
        text: '没去，怕念错丢人',
        effects: { happy: -3, amb: -4, int: 2 },
        result: '你后来在台下听别人念，心里想"我可能念得更好"。这个念头你压了很多年，它变成了一种习惯性的"算了"。'
      },
      {
        text: '去了，但站上台就发抖',
        effects: { cha: 5, happy: -4, con: 3 },
        result: '你念得磕磕巴巴，下来的时候手是凉的。但老师拍拍你说"第一次都这样"。这句话你记了很久——原来失败是可以被允许的。'
      }
    ]
  },
  {
    id: 'c_neighbor',
    stage: 2,
    age: 10,
    title: '隔壁的孩子',
    scene: '隔壁小明每次考试都比你高两分。你妈在饭桌上第七次说："你看看人家。"',
    options: [
      {
        text: '把他当成对手，暗暗较劲',
        effects: { amb: 9, happy: -5, int: 5 },
        result: '你开始五点起床背书。期末你超过了他两分。你妈很高兴，你却没什么感觉——你发现自己想要的不是分数，是"赢"这个动作本身。'
      },
      {
        text: '跟他成了朋友',
        effects: { cha: 7, happy: 7, int: 2 },
        result: '你们一起写作业、打游戏、交换漫画。后来他成了你少数几个还在联系的小学同学。你妈再提"你看看人家"的时候，你说"他人挺好的"。'
      },
      {
        text: '开始讨厌"比较"这件事',
        effects: { happy: -4, int: 4, cha: -2, amb: 3 },
        result: '你不再跟任何人比。这个决定让你轻松了很多，也让你在很长一段时间里，不知道自己到底想要什么。'
      }
    ]
  },
  {
    id: 'c_donate',
    stage: 2,
    age: 9,
    title: '红纸名单',
    scene: '学校为灾区捐款，教室后面贴了张红纸，谁捐得多，名字写得越大。',
    options: [
      {
        text: '把攒了半年的零花钱全捐了',
        effects: { money: -2, cha: 6, happy: 5 },
        result: '你的名字被写得很大。你有点得意，也有点心虚——因为你知道自己有一部分是为了那个"大"字。这个发现让你不好意思了很久。'
      },
      {
        text: '按平均数额捐',
        effects: { cha: 1, happy: 1 },
        result: '你的名字是正常大小。没人注意到你，你也不需要被注意。你后来一直是这种人：该做的做，不额外表演。'
      },
      {
        text: '说家里没钱，一分没捐',
        effects: { cha: -4, happy: -3, int: 3 },
        result: '名单上没有你的名字。有同学问了一句，你说"我家穷"。你说得很平静，但那天放学你走得特别快。'
      }
    ]
  },
  {
    id: 'c_wall',
    stage: 2,
    age: 12,
    title: '走廊上的画',
    scene: '美术老师把你的画贴在了走廊的展示墙上。画的是一个很奇怪的、没有脸的人。',
    options: [
      {
        text: '每天路过都去看一眼',
        effects: { happy: 9, cha: 5, amb: 3 },
        result: '你看了整整一个学期。有一次你听见两个高年级的学生在议论这幅画，你站在旁边，心跳得很快，但什么也没说。'
      },
      {
        text: '觉得很不好意思，希望没人知道是你画的',
        effects: { cha: 2, happy: 1, int: 2 },
        result: '你绕路走了两个星期。但你心里知道，你是高兴的。你只是还不习惯被看见。'
      },
      {
        text: '觉得那画其实很幼稚，自己撕了',
        effects: { amb: 5, happy: -5, int: 4 },
        result: '老师问是不是掉了，你说不知道。你对自己苛刻得很早。这份苛刻后来让你做得更好，也让你很少真正满意过。'
      }
    ]
  },
  {
    id: 'c_layoff',
    stage: 2,
    age: 11,
    title: '父亲回家早了',
    scene: '父亲今天六点就到家了，坐在沙发上没开灯。你妈在厨房里，切菜的声音比平时重。',
    options: [
      {
        text: '过去问"爸你怎么了"',
        effects: { family: 7, cha: 5, happy: -3 },
        result: '他说"没事，厂里放假"。你信了，也没再问。后来你才知道那是下岗。他没骗你，他只是不想让你跟着一起怕。'
      },
      {
        text: '装作没看见，回房间写作业',
        effects: { happy: -6, int: 4, amb: 3 },
        result: '你把门关上，听见客厅里很轻的说话声。你从那一天开始，学习变得特别用力。你不知道为什么，只知道必须。'
      },
      {
        text: '把自己的存钱罐抱出来给他',
        effects: { family: 12, happy: 3, money: -1, cha: 5 },
        result: '里面有一百二十三块。他接过去，手停在半空，然后说"爸不用"。但他没还给你。那天晚上他在阳台上站了很久。'
      }
    ]
  },
  {
    id: 'c_lying',
    stage: 2,
    age: 12,
    title: '碎掉的碗',
    scene: '你端碗的时候手滑了。碗碎在地上，声音很响。妈妈在客厅喊："怎么了？"',
    options: [
      {
        text: '立刻承认',
        effects: { cha: 5, family: 3, happy: 2 },
        result: '她骂了你两句，然后拿扫帚过来扫。你蹲下去一起捡，手指被划了一道。她抓起你的手看了看，骂声就停了。'
      },
      {
        text: '说是猫碰的',
        effects: { int: 2, happy: -4, cha: 3 },
        result: '她信了，还把猫骂了一顿。你在旁边看着，第一次体会到谎言的重量——它很轻，说出来毫不费力，但它会一直待在那儿。'
      },
      {
        text: '当时撒了谎，第二天自己说了实话',
        effects: { cha: 6, family: 5, happy: 2 },
        result: '她说"我知道"。你愣住了。她说"碗碎的声音和猫碰的不一样"。你第一次知道，大人有时候是在配合你演。'
      }
    ]
  },
  {
    id: 'c_summer',
    stage: 2,
    age: 7,
    title: '很长的暑假',
    scene: '暑假两个月，父母都要上班。你被安排了去处，但选项不太好。',
    options: [
      {
        text: '被送到外婆家',
        effects: { happy: 10, family: 5, con: 3 },
        result: '外婆家有个院子，有鸡，有一台只能收三个台的电视。你过了两个月的"野孩子"生活。那段日子后来成了你记忆里最亮的一块。'
      },
      {
        text: '一个人在家，看电视',
        effects: { happy: 6, int: -2, con: -4, health: -2 },
        result: '你从早看到晚，把遥控器按坏了。你学会了很多没用的知识，也学会了怎么一个人待着不难受。'
      },
      {
        text: '被塞进补习班',
        effects: { int: 7, happy: -7, amb: 3 },
        result: '你在补习班提前学完了下学期的课。开学后你轻松了半个学期，也用那半个学期学会了走神。'
      }
    ]
  },
  {
    id: 'c_teacher',
    stage: 2,
    age: 12,
    title: '聪明但不用心',
    scene: '家长会后，班主任跟你妈说："这孩子聪明是聪明，就是不用心。"回家的路上，你妈一直没说话。',
    options: [
      {
        text: '憋一口气，证明给他看',
        effects: { int: 6, happy: -5, amb: 8 },
        result: '期末你考进了前五。老师在讲台上念了你的名字。那是你第一次尝到"被人看见"的滋味——后来你为这个滋味付出了很多代价。'
      },
      {
        text: '就这样吧，反正也饿不死',
        effects: { happy: 5, int: -2, amb: -4 },
        result: '你妈唠叨了一路。你看着窗外的树发呆。你其实不是不想努力，是不知道努力给谁看。'
      },
      {
        text: '请求转去学美术',
        effects: { cha: 7, int: 2, happy: 4, money: -3 },
        result: '你妈犹豫了很久，还是同意了。你在画室里第一次坐得住四个小时。你发现自己不是不能专注，只是对课本专注不起来。'
      }
    ]
  },
  {
    id: 'c_bully',
    stage: 2,
    age: 11,
    title: '走廊尽头',
    scene: '班上有个比你高半头的男生，最近总在课间拿走你的东西。今天他又来了，站在你桌前，笑着伸手。',
    options: [
      {
        text: '打回去',
        effects: { con: -4, happy: -2, cha: 5, amb: 6 },
        result: '你打输了，鼻子流血。但第二天他绕着你走。你学会了一件不太体面但很实用的事：欺负人是要有成本的，你得让对方知道这一点。'
      },
      {
        text: '告诉老师',
        effects: { cha: -3, happy: 2 },
        result: '老师批评了他，他表面上道了歉。之后他在班群里说了些阴阳怪气的话。你第一次明白，"正确"和"有效"是两回事。'
      },
      {
        text: '忍着，等毕业',
        effects: { happy: -8, int: 3 },
        result: '你忍了两年。那两年你变得很安静，也很会观察人。有些人一辈子学不会看人，你从十一岁就开始练了。'
      },
      {
        text: '干脆跟他混到一起',
        effects: { cha: 8, amb: 3, happy: -3 },
        result: '你成了他身边的人。你不喜欢那样，但你更喜欢不被欺负的感觉。这是你第一次为了安全感，卖掉一点自己。'
      }
    ]
  }
]

/* ============================================================
 *  少年 · 13 — 18 岁
 * ============================================================ */

const TEEN = [
  {
    id: 't_phone',
    stage: 3,
    age: 13,
    title: '第一台手机',
    scene: '你考进了年级前三十，父母答应给你买个手机。柜台前，父亲说："就这个吧，能打电话就行。"',
    options: [
      {
        text: '接受那个只能打电话的',
        effects: { happy: -4, family: 5, int: 2 },
        result: '你成了班上唯一一个还在用老人机的人。你被笑了两年。但你确实因此多读了很多书，也睡得更好。'
      },
      {
        text: '磨了很久，换了个能上网的',
        effects: { happy: 10, int: -3, health: -3 },
        result: '你拿到了那台手机。第一个星期你玩到凌晨两点。后来你学会了在被窝里把亮度调到最低——这个技能你用了很多年。'
      },
      {
        text: '说不要了，把钱省下来',
        effects: { amb: 6, happy: -5, family: 6 },
        result: '你爸愣了一下，说"这孩子懂事"。他没说出口的是，他那天其实挺高兴的。你把这句话记了很久，也背了很久。'
      }
    ]
  },
  {
    id: 't_injury',
    stage: 3,
    age: 13,
    title: '体育课',
    scene: '跳箱的时候你落地姿势不对，脚踝肿得像个馒头。老师说"男孩子/女孩子家家的，忍一下"。',
    options: [
      {
        text: '忍着上完剩下的课',
        effects: { con: -6, health: -6, happy: -2, amb: 4 },
        result: '你瘸了一个月。后来那只脚在变天的时候会隐隐作痛。你学会了"忍"这个字，也学会了身体是会记账的。'
      },
      {
        text: '坚持要去医院',
        effects: { money: -1, health: 4, cha: 3 },
        result: '拍片说是韧带拉伤，需要休养。班主任在班上说你"娇气"。你没反驳，但你知道自己是对的。'
      },
      {
        text: '偷偷哭了一场，然后自己冰敷',
        effects: { happy: -6, con: 3, int: 2 },
        result: '你谁也没告诉。晚上用毛巾包着冰块敷了很久。第二天照常去上学，一瘸一拐。你从那时候起就很少跟人说"我不舒服"。'
      }
    ]
  },
  {
    id: 't_fair',
    stage: 3,
    age: 14,
    title: '前排的位置',
    scene: '你成绩不错，但班主任把最好的位置给了班长——那是他亲戚家的孩子。你被调到了最后一排。',
    options: [
      {
        text: '找老师谈，说这不公平',
        effects: { cha: 5, amb: 7, happy: -4 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 45) {
            return { tone: 'good', effects: { int: 3 }, text: '你说了，说得很客气但很清楚。老师沉默了一下，说"我考虑考虑"。第二周你被调回了中间。你第一次知道，有些规则是可以被问的。' }
          }
          return { tone: 'bad', effects: { happy: -6 }, text: '老师笑着说"坐后面也能学好"。你被安排到了更后面。你明白了，不是所有不公都值得当面对抗——但你还是不后悔说了。' }
        }
      },
      {
        text: '什么也不说，在后面自学',
        effects: { int: 7, happy: -3, cha: -3 },
        result: '最后一排没人管你。你把课本从头到尾自己啃了一遍，还看了很多课外的书。你从那时候起就不太依赖老师了。'
      },
      {
        text: '把这件事记在心里，等以后',
        effects: { amb: 8, happy: -5, int: 2 },
        result: '你没说什么，但你在日记里写了整整两页。那本日记你现在还留着。有些愤怒不需要当场发作，它会慢慢变成别的东西。'
      }
    ]
  },
  {
    id: 't_witness',
    stage: 3,
    age: 15,
    title: '你看见了',
    scene: '放学后，你看见三个男生把一个人堵在厕所门口。那个人你认识，坐你斜后桌，很安静。',
    options: [
      {
        text: '冲上去拦住',
        effects: { con: -5, cha: 8, happy: 4, amb: 6 },
        resolve(s, rng) {
          if (s.con + s.cha * 0.6 + rng() * 40 > 62) {
            return { tone: 'good', effects: { happy: 6 }, text: '你挡在中间，说"有事说事"。三个人看了你几秒，走了。那个同学后来一直跟你一个食堂吃饭。你们没说过这件事，但你们都知道。' }
          }
          return { tone: 'bad', effects: { happy: -8 }, text: '你被推倒了。但那个同学跑了。第二天他给你带了一瓶可乐，什么也没说。你喝完了，觉得那瓶可乐比什么都重。' }
        }
      },
      {
        text: '跑去找老师',
        effects: { cha: 3, happy: 2, con: 2 },
        result: '老师赶过去的时候人已经散了。但那个同学知道是你叫的。他后来跟你说了一句"谢谢"，声音很小。'
      },
      {
        text: '装作没看见，快步走开',
        effects: { happy: -12, cha: -3, int: 2 },
        result: '你走得很快，心跳得厉害。这件事你记了很多年，比很多真正发生在你身上的事都清楚。你后来遇到类似场面，一次都没有再走开。'
      }
    ]
  },
  {
    id: 't_crush',
    stage: 3,
    age: 15,
    title: '第三排左边',
    scene: '你已经注意那个人一个学期了。也许是全班最好看的，也许只是某天在阳光下笑了一下。反正你上课总是走神。',
    options: [
      {
        text: '写一封信，塞进对方书桌',
        effects: { cha: 4, happy: 4, amb: 3 },
        resolve(s, rng) {
          const score = s.cha * 0.5 + s.luk * 0.25 + rng() * 40
          if (score > 58) {
            return {
              tone: 'good',
              effects: { happy: 8, cha: 4 },
              text: '三天后你收到一张纸条，上面只写了五个字："你字挺好看的。"你们没有在一起，但那半个月，你的整个世界都是亮的。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -8, cha: 2 },
            text: '信被交给了班主任。你在办公室站了两节课，走廊上的人都在看你。那份羞耻感慢慢变成了一种钝钝的硬，长在了你身上。'
          }
        }
      },
      {
        text: '什么也不说，放在心里',
        effects: { happy: -6, int: 3 },
        result: '你把这件事在心里放了三年。很多年后你在朋友圈看到对方的婚礼照片，想了三秒，划过去了。'
      },
      {
        text: '算了，现在不是想这个的时候',
        effects: { int: 6, happy: -3, amb: 4 },
        result: '你不是没感觉，是觉得现在不行。你把那股劲儿按了下去，按了很多年。它没有消失，只是换了个地方冒出来。'
      }
    ]
  },
  {
    id: 't_write',
    stage: 3,
    age: 15,
    title: '你写了一个故事',
    scene: '你在作文本背面写了一个很长的故事，关于一个能看见别人寿命的人。你写了三个星期，写了四十页。',
    options: [
      {
        text: '给最好的朋友看',
        effects: { cha: 6, happy: 9, amb: 4 },
        result: '他熬夜看完了，第二天红着眼睛跟你说"后面呢"。你第一次知道，你写的东西可以让另一个人睡不着。这种感觉你后来找了很久。'
      },
      {
        text: '投稿给杂志',
        effects: { amb: 7, happy: 3, money: 1 },
        resolve(s, rng) {
          if (rng() > 0.72) {
            return { tone: 'good', effects: { happy: 14, amb: 6 }, text: '三个月后你收到一封回信，说稿子会用。样刊寄到学校那天，你在门卫室拆开，手一直在抖。稿费是八十块，你一分没花。' }
          }
          return { tone: 'bad', effects: { happy: -8 }, text: '没有回音。你等了一个学期。后来你把稿子收进抽屉，再也没打开过。但那个能看见寿命的人，一直在你脑子里活着。' }
        }
      },
      {
        text: '写完就烧了',
        effects: { happy: -4, cha: 3, amb: 5 },
        result: '你看着纸烧完，觉得轻松。有些东西写出来是为了放下，不是为了给别人看。你后来一直保持着这个习惯。'
      }
    ]
  },
  {
    id: 't_caught',
    stage: 3,
    age: 16,
    title: '被发现了',
    scene: '你和那个人在操场角落牵手，被教导主任看见了。晚自习前，你被叫到办公室，对方家长也在。',
    options: [
      {
        text: '承认，并说"我们不影响学习"',
        effects: { cha: 7, amb: 6, happy: 2 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 52) {
            return { tone: 'good', effects: { happy: 6 }, text: '你说得很平静，还拿出了成绩单。主任愣了一下，最后只说"注意影响"。你第一次发现，成年人的规则有时候是可以被讲道理的。' }
          }
          return { tone: 'bad', effects: { happy: -8 }, text: '对方家长当场发火，说"是你带坏我家孩子"。你想解释，但没人听。你第一次知道，有些帽子扣下来是摘不掉的。' }
        }
      },
      {
        text: '把所有责任揽下来',
        effects: { cha: 5, happy: -10, family: -6 },
        result: '你说"是我的问题"。你被记了处分，对方没事。你们后来还是分开了。但那个处分单你留了很多年，不是因为后悔，是因为那是你第一次替别人扛事。'
      },
      {
        text: '当场就断了，说"本来也没什么"',
        effects: { happy: -12, int: 4, amb: 4 },
        result: '你说完那句话，对方看了你一眼。那个眼神你记了很久。你保护了自己，也付出了一点别的东西——具体是什么，你说不清。'
      }
    ]
  },
  {
    id: 't_smoke',
    stage: 3,
    age: 16,
    title: '天台上',
    scene: '晚自习后，几个同学在天台上。有人递给你一根烟，说"试试"。',
    options: [
      {
        text: '接过来，抽了',
        effects: { cha: 5, health: -6, happy: 3 },
        result: '你被呛得眼泪都出来了，他们笑了。但你还是抽完了。后来你又抽了很多根，直到很多年后才戒掉。你偶尔会想，如果那天没接呢。'
      },
      {
        text: '摆手，说"不了"',
        effects: { cha: -3, health: 4, amb: 5 },
        result: '有人说"装什么"。你没接话，站在旁边看他们抽。你从那时候起就不太怕不合群——这个能力很贵，你花了很久才买到。'
      },
      {
        text: '接过来，但没点，夹在手里',
        effects: { cha: 3, happy: 1, amb: 3 },
        result: '你夹着那根烟站了十分钟，最后偷偷扔了。你既没被排除在外，也没真的加入。这种"两边都不得罪"的本事，你用了一辈子。'
      }
    ]
  },
  {
    id: 't_divorce',
    stage: 3,
    age: 15,
    title: '他们决定了',
    scene: '父母坐在你面前，说有事要谈。你妈先开口："我们想分开。"你爸一直看着地板。',
    options: [
      {
        text: '说"我早就知道了"',
        effects: { happy: -8, int: 5, cha: 4 },
        result: '他们愣住了。你说完就回房间了，门关得很轻。那天晚上你一个人坐到天亮，没有哭。你只是觉得，原来有些事早就写在脸上。'
      },
      {
        text: '问"那我跟谁"',
        effects: { happy: -6, family: -4, amb: 5 },
        resolve(s, rng) {
          if (rng() > 0.5) {
            return { tone: 'neutral', text: '你说完，两个人都沉默了。最后你妈说"你想跟谁就跟谁"。你选了妈妈，因为你怕她一个人。你从十五岁开始，就成了她的伴。' }
          }
          return { tone: 'neutral', text: '他们吵了起来，为了你的抚养权。你坐在中间，第一次觉得自己像一个物件。后来你谁也没跟，住了校。' }
        }
      },
      {
        text: '说"你们再想想"',
        effects: { happy: -10, cha: 5, family: 4 },
        result: '他们想了半年，还是离了。这半年家里很安静，安静到你能听见钟表的声音。你后来特别怕那种安静。'
      }
    ]
  },
  {
    id: 't_online',
    stage: 3,
    age: 14,
    title: '屏幕那头的人',
    scene: '你在网上认识了一个人，聊了半年。对方说懂你，比班上任何人都懂。对方说要见面。',
    options: [
      {
        text: '去了，但叫上了朋友',
        effects: { cha: 6, int: 3, happy: 4 },
        result: '见了面，对方比你想象的普通很多。你们尴尬地吃了顿饭。回去后聊得越来越少。你第一次知道，"懂你"很多时候只是距离的功劳。'
      },
      {
        text: '一个人偷偷去了',
        effects: { happy: 5, cha: 4, con: -3 },
        resolve(s, rng) {
          if (rng() > 0.6) return { tone: 'good', text: '什么事都没发生。对方是个和你差不多大的学生，也有点紧张。你们聊了两个小时，然后各回各家。' }
          return { tone: 'bad', effects: { happy: -14 }, text: '事情不太对。你提前走了，一路跑回家，心跳到嗓子眼。你谁也没说。这件事你压了很多年，直到有一天你忽然想通了：那不是你的错。' }
        }
      },
      {
        text: '没去，把对方删了',
        effects: { happy: -5, int: 5, amb: 3 },
        result: '你把对话框删了，删了三次才删干净。你其实有点后悔。但你也知道，那时候的你，需要的是有人听你说话，而不是一个具体的人。'
      }
    ]
  },
  {
    id: 't_betray',
    stage: 3,
    age: 16,
    title: '他把你的事说出去了',
    scene: '你只告诉过一个人那件事。现在全班都知道了。那个人站在人群里，不敢看你。',
    options: [
      {
        text: '当场跟他翻脸',
        effects: { cha: 5, happy: -6, amb: 6 },
        result: '你在教室门口把他拦住，说了很难听的话。他一句没还。你们再也没说过话。很多年后你才知道，那天他是被逼问的。但那时候的你们，都不会解释。'
      },
      {
        text: '什么都不说，从此不再交心',
        effects: { happy: -10, cha: -4, int: 5 },
        result: '你把他从生活里剪掉了，剪得很干净。你也顺便把"跟人说心里话"这个习惯剪掉了。这个损失你很多年后才算明白。'
      },
      {
        text: '问他"为什么"',
        effects: { cha: 6, happy: -4, int: 4 },
        result: '他说"他们一直问"。你说"那你也不能说啊"。他哭了。你们最后没有绝交，但那件事像一根刺，一直在那儿，直到毕业。'
      }
    ]
  },
  {
    id: 't_art',
    stage: 3,
    age: 16,
    title: '画室的门',
    scene: '你想学美术，走艺考。你妈算了一笔账：集训费、画材、还有"万一考不上"。',
    options: [
      {
        text: '坚持学，自己打工凑钱',
        effects: { cha: 8, amb: 10, money: -3, health: -6 },
        resolve(s, rng) {
          if (s.cha + s.amb * 0.4 + rng() * 40 > 60) {
            s.edu = Math.max(s.edu, 4)
            return { tone: 'good', effects: { happy: 10, int: 3 }, text: '你考上了一所不错的艺术院校。画室里的那两年，是你人生里最穷也最像自己的两年。' }
          }
          return { tone: 'bad', effects: { happy: -10, money: -4 }, text: '专业课过了，文化课没过。你复读了一年，最后还是去了普通院校。但你的手没有停下来，这一点你自己知道。' }
        }
      },
      {
        text: '放弃，走"正常"的路',
        effects: { int: 6, happy: -8, amb: -4 },
        result: '你把画笔收进了柜子，柜子在阳台边上，冬天会潮。你没有再打开它。但每次路过文具店，你还是会看很久。'
      },
      {
        text: '折中：学设计，至少算个专业',
        effects: { int: 5, cha: 4, happy: 3, money: -2 },
        result: '你报了设计相关的方向。它既不像画画那么浪漫，也不像理科那么硬。你后来做了很多年这行，谈不上热爱，但你做得不错。'
      }
    ]
  },
  {
    id: 't_sports',
    stage: 3,
    age: 14,
    title: '运动会',
    scene: '班里缺一个人跑 1500 米。体育委员看着你："你行不行？"',
    options: [
      {
        text: '上，跑完就行',
        effects: { con: 7, cha: 6, happy: 5 },
        result: '你最后一个跑完，全班在终点鼓掌。你吐了一地，但那天下午你在楼道里走路的时候，腰是直的。'
      },
      {
        text: '不上，说脚疼',
        effects: { con: -2, happy: -1, cha: -3 },
        result: '你在看台上坐了一下午。没什么不好，只是后来每次有人说"你试试"的时候，你都会先想到那天的看台。'
      },
      {
        text: '去跑，但赛前偷偷练了两周',
        effects: { con: 9, amb: 7, happy: 4, health: -3 },
        result: '你跑了第七名，不算好。但你知道自己比两周前快了四十秒。你第一次体会到"准备"这件事的意义。'
      }
    ]
  },
  {
    id: 't_speech',
    stage: 3,
    age: 17,
    title: '演讲比赛',
    scene: '学校演讲比赛，主题是"我的理想"。老师推荐了你，你有点想拒绝。',
    options: [
      {
        text: '上台，讲自己真正想的',
        effects: { cha: 9, amb: 6, happy: 6 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 50) return { tone: 'good', effects: { happy: 8 }, text: '你讲了"我想做一个不用向任何人解释自己的人"。台下很安静，然后掌声比谁都长。你下台的时候腿是软的，但你笑得很真。' }
          return { tone: 'neutral', text: '你讲得有点乱，拿了三等奖。但你说出了那句真心话。后来很多年里，那句话一直在提醒你。' }
        }
      },
      {
        text: '上台，讲那篇准备好的标准稿',
        effects: { cha: 4, happy: 2, int: 2 },
        result: '你拿了二等奖。稿子是网上找的，改了三遍，很工整。评委说你"表达规范"。你说谢谢。你心里知道你没说一句自己的话。'
      },
      {
        text: '装病推掉',
        effects: { happy: -4, amb: -5, int: 3 },
        result: '另一个同学上了，讲得很好。你在台下鼓掌，心里有点空。你后来遇到过很多次这种时刻，每次都选择了退后一步。'
      }
    ]
  },
  {
    id: 't_relative',
    stage: 3,
    age: 17,
    title: '读书有什么用',
    scene: '一个远房表哥来家里，说他在南方做生意，一年挣二十万。他看着你："读那么多书干嘛，跟我干两年，比什么都强。"',
    options: [
      {
        text: '当场反驳，说他有今天也是靠运气',
        effects: { amb: 8, cha: 5, happy: -3, family: -5 },
        result: '气氛僵了。你妈在桌子底下踢你。你爸没说话，但晚上他给你端了碗汤。你后来才知道，他跟你妈说"孩子说得对"。'
      },
      {
        text: '笑着说"我再想想"',
        effects: { cha: 5, int: 3 },
        result: '你很得体地把话题岔开了。那天晚上你躺在床上想了很久——如果他说的是真的呢？第二天你还是去上学了。'
      },
      {
        text: '心里动摇，偷偷问他要了联系方式',
        effects: { amb: 6, happy: -5, int: -2 },
        result: '你留了他的电话，一直存在通讯录里，从来没打过。那个号码像个备用出口，让你在高三最难的时候，心里有一点点底。'
      }
    ]
  },
  {
    id: 't_game',
    stage: 3,
    age: 16,
    title: '凌晨三点的屏幕',
    scene: '新出的游戏，全班都在玩。你已经连续三天只睡五个小时了。今晚副本开荒，群里在等你。',
    options: [
      {
        text: '通宵打通关',
        effects: { happy: 10, health: -6, con: -3 },
        result: '你打通了。天亮时站在阳台上，觉得世界很空，又很值得。这种"值"后来再也没那么容易出现。'
      },
      {
        text: '定个点，到点就睡',
        effects: { health: 4, int: 2, happy: 2 },
        result: '你给自己定了一条规矩。它没让你变成更强的玩家，但让你后来在很多事上都没被吞掉。'
      },
      {
        text: '直接把游戏删了',
        effects: { amb: 6, happy: -7, int: 2 },
        result: '你删了游戏，账号也送人了。你对自己狠得有点早。这份狠帮你考上了一所还不错的学校，也让你一直不太会休息。'
      }
    ]
  },
  {
    id: 't_subject',
    stage: 3,
    age: 17,
    slot: 'stream',
    pinned: true,
    title: '选一边',
    scene: '文理分科表发下来了，周五前要交。你妈说"你自己定"，但她看你的眼神里有答案。',
    options: [
      {
        text: '理科——好就业',
        effects: { int: 5, amb: 3 },
        flags: ['science'],
        result: '你选了理科，理由是"好就业"。这个理由在当时看起来很成熟。你后来花了很久才搞明白，成熟和正确是两件事。'
      },
      {
        text: '文科——我喜欢',
        effects: { cha: 5, happy: 4, amb: 2 },
        flags: ['arts'],
        result: '家里人都说"以后不好找工作"。你说"我喜欢"。这三个字后来支撑了你很久，也让你吃了不少苦。'
      },
      {
        text: '哪科分高选哪科',
        effects: { int: 3, happy: 1 },
        result: '你没想那么多，选了能考更高分的那边。这是你人生里第一次用数据做决定——后来你越来越熟练，也越来越少问自己想要什么。'
      }
    ]
  },
  {
    id: 't_stream_boss',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '办公室里的那句话',
    scene: '班主任把你叫到办公室，桌上摊着你的成绩单。他说："你这个分数，学文科可惜了。"他教了二十三年书。',
    options: [
      {
        text: '听他的，选理科',
        effects: { int: 5, amb: 3 },
        flags: ['science'],
        result: '你听了。他确实比你懂规则。你后来考得不错，也花了整整四年才发现自己真正喜欢的是什么。'
      },
      {
        text: '坚持文科',
        effects: { cha: 5, happy: 4, amb: 2 },
        flags: ['arts'],
        result: '他说"你再想想"。你说"我想好了"。走出办公室时你手心全是汗——那是你第一次为一个没有把握的决定负责。'
      },
      {
        text: '反问他："那你觉得我想学什么"',
        effects: { int: 4, cha: 5, happy: 2, amb: 2 },
        flags: ['arts'],
        result: '他沉默了几秒，说："我不知道，这得你自己想。"你后来还是选了文科，但那句话比任何建议都有用。'
      }
    ]
  },
  {
    id: 't_stream_parents',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '已经签好的名',
    scene: '分科表发下来的时候，你发现家长签名那一栏已经签好了，勾的是理科。他们说"我们是为你好"。',
    options: [
      {
        text: '划掉重填，选文科',
        effects: { cha: 6, amb: 6, happy: 3, family: -6 },
        flags: ['arts'],
        result: '你把表改了，家长签名那一栏空着交上去。班主任打电话到家里，吵了一架。你第一次在家庭会议上拥有了一票，代价是那一票很贵。'
      },
      {
        text: '算了，就理科吧',
        effects: { int: 4, happy: -5, amb: -3, family: 3 },
        flags: ['science'],
        result: '你在理科班待了两年，成绩中上。你没有恨他们，只是从那以后，你填任何表都不太愿意让家里人看见。'
      },
      {
        text: '找他们谈一次，问为什么',
        effects: { cha: 5, int: 3, family: 4 },
        flags: ['science'],
        result: '他们说"理科出路宽"。你说"可是我不喜欢"。最后你还是选了理科，但这次是你自己点的头。同样一件事，自己点头和被人按着头，是两回事。'
      }
    ]
  },
  {
    id: 't_stream_friend',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '他改了',
    scene: '你和最好的朋友说好选同一边。交表前一天，他告诉你他改了，因为"我妈说那边升学率高"。',
    options: [
      {
        text: '跟着他改',
        effects: { happy: 3, cha: 4, amb: -4 },
        flags: ['science'],
        result: '你改了，理由是"朋友在那边"。你们后来同班两年，一起逃过课，一起被罚站。有些选择的理由不体面，但结果并不坏。'
      },
      {
        text: '按原计划，自己走',
        effects: { amb: 6, happy: -4, cha: 2 },
        flags: ['arts'],
        result: '你们分在不同楼层，慢慢就散了。多年后你在同学群里看见他结婚的照片，点了个赞。你想过如果当时跟过去会怎样——然后就不想了。'
      },
      {
        text: '谁也不跟，选自己分数最高的那科',
        effects: { int: 4, happy: -2, amb: 2 },
        flags: ['science'],
        result: '你把感情从这道题里剔除了。你后来在学习、工作、甚至谈恋爱时都能做到这一点。这让你效率很高，也让你偶尔觉得自己有点冷。'
      }
    ]
  },
  {
    id: 't_stream_art',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '画室',
    scene: '你偷偷去看了学校旁边的画室。老师说你有底子，但艺考要花钱，还要家里同意。你妈说过"搞艺术的人都过得不好"。',
    options: [
      {
        text: '跟家里坦白，争取一次',
        effects: { cha: 6, happy: 5, family: -8, amb: 6, money: -6 },
        flags: ['arts'],
        result: '你妈哭了，你爸没说话，最后他们说"你自己选，别怪我们"。你去了画室，每天画到手上全是炭粉。你不知道自己能不能成，但你终于在做一件自己选的事。'
      },
      {
        text: '放弃，把它当成爱好',
        effects: { happy: -6, int: 4, amb: -2 },
        result: '你把画具收进柜子，偶尔拿出来。很多年后你在孩子的画本上看见一只鸟，忽然坐了很久。'
      },
      {
        text: '先答应家里，自己偷偷去',
        effects: { int: 3, cha: 4, happy: 2, health: -4, money: -3 },
        flags: ['arts'],
        result: '你用一整个学期的午饭钱报了周末班。成绩下滑了一点，但你每天都很期待周六。你第一次知道，偷偷做的事会让人上瘾。'
      }
    ]
  },
  {
    id: 't_stream_numb',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '"随便"',
    scene: '表传到你手上，同桌问"你选哪个"。你说"随便"。笔尖在纸上停了很久。',
    options: [
      {
        text: '闭上眼睛随手勾一个',
        effects: { luk: 3, happy: -1, amb: -4 },
        result: '你勾了理科，因为它在上面。这个决定花了你半秒钟，影响了你十年。你后来常想，人生里到底有多少事是这么定下来的。'
      },
      {
        text: '去问了三个人，听他们的',
        effects: { cha: 4, int: 2, amb: -2 },
        flags: ['science'],
        result: '三个人给了三个答案。你最后选了说得最肯定的那个人的建议。你发现，人在没有主意的时候，会跟着声音最大的人走。'
      },
      {
        text: '回家认真想了三天',
        effects: { int: 5, amb: 5, happy: 2 },
        flags: ['arts'],
        result: '你列了两张纸，写"我擅长"和"我喜欢"。它们只重合了一行。你选了"喜欢"那一行——那时候你还不知道这有多贵。'
      }
    ]
  },
  {
    id: 't_stream_312',
    stage: 3,
    age: 17,
    slot: 'stream',
    title: '十二种组合',
    scene: '你们是第一届"3+1+2"。十二种组合，选科表像一张彩票。老师说选错了，很多专业就报不了。',
    options: [
      {
        text: '物化生，最稳的那条路',
        effects: { int: 6, amb: 3, happy: -4 },
        flags: ['science'],
        result: '你选了最不会出错的一组，也选了最累的两年。班里最聪明的几个人都在这组里，你既被推着走，也被压着走。'
      },
      {
        text: '物生地，躲开化学',
        effects: { int: 4, happy: 2, amb: 2 },
        flags: ['science'],
        result: '你算过赋分的账，躲开了最卷的一科。这个决定很聪明，聪明到你后来做很多事都先算一遍概率。'
      },
      {
        text: '史政地，全凭喜欢',
        effects: { cha: 5, happy: 6, amb: 3 },
        flags: ['arts'],
        result: '你选了纯文。班主任说"这条路窄"。你说"我走得动"。你后来确实走得动，只是比坐车的人慢。'
      }
    ]
  },
  {
    id: 't_night',
    stage: 3,
    age: 18,
    order: -1,
    title: '明天',
    scene: '房间里很安静。桌上是最后一本错题本，翻到第三遍。窗外有人在放烟花，也可能是谁家在吵架。',
    options: [
      {
        text: '再刷两套卷子',
        effects: { int: 3, health: -4, happy: -5, amb: 4 },
        result: '你刷到凌晨一点。第二天考场上有一道题你正好做过，也有两道题因为手抖算错了。这就是努力经常的样子：它有效，但不精确。'
      },
      {
        text: '十点睡觉',
        effects: { health: 5, happy: 3 },
        result: '你十点躺下，翻来覆去到十二点才睡着。但第二天你是清醒的。清醒，在那一天值很多分。'
      },
      {
        text: '出门走了很久',
        effects: { happy: 6, health: 2, int: -1 },
        result: '你在小区里绕了四圈。想到很多人，也想不清楚未来。回来的时候，心里反而静了。'
      }
    ]
  },
  {
    id: 't_score',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '放榜',
    scene: '查分的那天，家里的网很慢。刷新了七次。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '刷新第七次的时候，页面终于开了。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_score_class',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '教室里一起查分',
    scene: '学校让回教室查分。信号挤爆了，三十几个人围着一台电脑，有人在喊，有人在哭。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '你挤在最外圈，等前面的人散开，才把准考证号输进去。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_score_shop',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '老板的电脑',
    scene: '查分那天你在奶茶店上班。老板说用我这台电脑查吧，然后把位置让给你。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '你擦了手才敢碰键盘。老板站在旁边，一直没走。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_score_parents',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '母亲先看到了',
    scene: '你还在睡，被客厅的声音吵醒。门开着，母亲坐在沙发上，手里捏着手机，肩膀在动。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '你走过去，她把手机递给你，屏幕还亮着。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_score_teacher',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '班主任的电话',
    scene: '你根本没查。你在河边坐了一下午，手机调了静音。晚上七点，班主任的电话打进来。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '你接起来，听见他先叹了口气。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_score_cafe',
    stage: 3,
    age: 18,
    slot: 'score',
    title: '网吧包间',
    scene: '你揣着二十块钱去了网吧，开了个包间。门一关，外面的键盘声就远了。',
    auto: true,
    resolve(s, rng) {
      const r = rollScore(s, rng)
      return {
        tone: r.tone,
        text: '网址你输了三次才对。' + SCORE_TEXT[r.band]
      }
    }
  },
  {
    id: 't_choice',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    pinned: true,
    title: '填志愿',
    scene: '一张表，六个格子，决定你未来四年在哪个城市、遇见哪些人。',
    options: [
      {
        text: '冲名校，专业冷门也无所谓',
        effects: { int: 8, amb: 8, happy: -4, cha: 4 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你去了那所名字很响的学校，读了一个没人听说过的专业。四年里你最大的收获不是知识，是"原来可以这样活着"的见识。'
      },
      {
        text: '选个好就业的专业，学校差一点',
        effects: { int: 5, amb: 5, money: 1 },
        cond: s => s.edu >= 3,
        flags: ['practical_major'],
        result: '你选了一个"毕业就能找到工作"的专业。这个决定在当时被所有亲戚夸奖，在十年后被你自己重新审视。'
      },
      {
        text: '复读一年，再赌一次',
        effects: { health: -10, happy: -12, amb: 12, int: 8 },
        cond: s => s.edu <= 3,
        flags: ['repeat_year'],
        resolve(s, rng) {
          const up = s.amb * 0.4 + s.int * 0.3 + rng() * 50
          if (up > 70) {
            s.edu = Math.min(5, s.edu + 2)
            return {
              tone: 'good',
              effects: { happy: 14, amb: 6 },
              text: '那一年你把自己关成了一台机器。第二年分数涨了 90 分，你去了一个原本不敢想的学校。你从此相信一件事：人是可以在一年里改变轨迹的，只要付得起。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -10 },
            text: '第二年只涨了 20 分。你去了一个差不多的学校。那一年教会你的不是"努力会有回报"，而是"努力也可能只是让你知道自己的极限在哪"。'
          }
        }
      },
      {
        text: '不念了，出去打工',
        effects: { money: 3, con: 6, cha: 8, happy: -6, amb: -2 },
        flags: ['no_college'],
        result: '你南下进了厂，也送过外卖，在工地待过一个夏天。你比同龄人早三年知道钱是怎么来的。这个知识很贵，也很硬。'
      }
    ]
  },
  {
    id: 't_major_changed',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    title: '被改掉的那一格',
    scene: '提交截止后你才发现，第一志愿被改成了"临床医学（五年）"。改的人是你爸，他说"我问过很多人，这个最稳"。',
    options: [
      {
        text: '打十七个电话，改回来',
        effects: { cha: 6, amb: 6, happy: -4, family: -6 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你找到招生办，最后真改成了自己想读的。父亲半年没跟你好好说话。你在大学里过得很好，只是每次回家都有点别扭。'
      },
      {
        text: '就读了',
        effects: { int: 6, con: 5, happy: -6, family: 4 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_med'],
        result: '你去了医学院。解剖课上你吐了两次，后来成了班里手最稳的人。你偶尔会想另一个专业的人生，但白大褂穿上身的时候，那些想法就淡了。'
      },
      {
        text: '认了，进去再转专业',
        effects: { int: 5, amb: 6, happy: 2, health: -3 },
        cond: s => s.edu >= 4,
        flags: ['practical_major', 'changed_major'],
        result: '你读了一年，绩点刷到专业前 5%，转去了自己想读的。这条路没人告诉过你，是你自己在教务处网站上翻出来的。'
      },
      {
        text: '复读，明年自己填',
        effects: { health: -10, happy: -12, amb: 12, int: 8 },
        cond: s => s.edu <= 3,
        flags: ['repeat_year'],
        resolve(s, rng) {
          return repeatResolve(s, rng)
        }
      },
      {
        text: '这个专业我接受不了，不念了',
        effects: { happy: -5, amb: 5, con: 4, cha: 4 },
        flags: ['no_college'],
        result: '你跟家里摊了牌，然后去了一家汽修厂。你爸半年没跟你说话，你妈偷偷给你转钱。你手上很快有了茧，心里反而踏实。'
      }
    ]
  },
  {
    id: 't_major_adjust',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    title: '服从调剂',
    scene: '你在"是否服从专业调剂"那一栏打了勾。班主任说："打勾，不然容易退档。"你没想太多。',
    options: [
      {
        text: '被调剂到了图书馆学',
        effects: { int: 4, happy: -6, cha: 3 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_library'],
        result: '你查了半天才搞清这个专业是干什么的：编目、分类、文献检索。它不在任何热门榜单上，可每年考编的岗位表里，总有那么几个位置写着"图书馆学"。你当时只觉得丢人，后来才明白这张牌不响，但很硬。'
      },
      {
        text: '被调剂到了冷门工科',
        effects: { int: 6, happy: -4, con: 4 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_niche'],
        result: '你学的专业全国只招三十个人。你在里面待了四年，毕业时发现行业正在起飞。你什么都没做对，只是站在了风口下面。'
      },
      {
        text: '没服从，赌一把',
        effects: { amb: 7, happy: -3, cha: 4 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你只填了自己想去的学校和专业。结果出来那天你手在抖——你赌赢了。你从此对"稳妥"这两个字有点轻视，这个毛病后来让你摔过一次。'
      },
      {
        text: '复读一年，重新填',
        effects: { health: -10, happy: -12, amb: 12, int: 8 },
        cond: s => s.edu <= 3,
        flags: ['repeat_year'],
        resolve(s, rng) {
          return repeatResolve(s, rng)
        }
      },
      {
        text: '不去了，先挣钱',
        effects: { money: 3, con: 6, cha: 6, happy: -5 },
        flags: ['no_college'],
        result: '你把录取通知书压在抽屉底下，去了亲戚的店里。三年后你自己开了店。你没上过大学，但你比很多上过的人更会算账。'
      }
    ]
  },
  {
    id: 't_major_dream',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    title: '没人报的专业',
    scene: '你想填的那个专业，全班只有你一个人提到过。招生简章上写着"计划招生 8 人"。你妈问"这个毕业能干什么"。',
    options: [
      {
        text: '填了，管他呢',
        effects: { happy: 8, amb: 8, money: -3, cha: 4 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你成了那八个人之一。系里的老师比学生热情。你后来没挣到什么钱，但你四十岁时还能眼睛发亮地跟人讲你的专业。这件事本身就值钱。'
      },
      {
        text: '换了个"能糊口"的',
        effects: { money: 2, int: 4, happy: -6 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_acct'],
        result: '你选了会计。工作稳定，工资够用，你在三十三岁那年考下了注会。你把喜欢的那件事放在周末，一周两天，一年一百天，就这样过了很多年。'
      },
      {
        text: '折中：选一个相近但好就业的',
        effects: { int: 5, amb: 4, happy: 2 },
        cond: s => s.edu >= 3,
        flags: ['practical_major'],
        result: '你选了一个和它沾边的专业，算是半个妥协。这个折中很成功，成功到你后来遇到所有两难，都习惯找一个"都不算太亏"的答案。'
      },
      {
        text: '分数不够，复读一年再填它',
        effects: { health: -8, happy: -10, amb: 10, int: 6 },
        cond: s => s.edu <= 3,
        flags: ['repeat_year'],
        resolve(s, rng) {
          return repeatResolve(s, rng)
        }
      },
      {
        text: '算了，不念了',
        effects: { money: 4, con: 5, cha: 6, happy: -6 },
        flags: ['no_college'],
        result: '你把招生简章折好，夹在课本里，然后去了南方。第一年你在流水线上，第二年你在仓库，第三年你开始跑销售。你偶尔会想起那八个人，但不再羡慕。'
      }
    ]
  },
  {
    id: 't_major_love',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    title: '同一个城市',
    scene: '你想去的那所学校，和一个人想去的学校，在同一个城市。你们的分数，一个够，一个差一点。',
    options: [
      {
        text: '为了同城，降一档',
        effects: { happy: 8, cha: 5, int: -2, amb: -4 },
        cond: s => s.edu >= 3,
        flags: ['practical_major'],
        result: '你们在同一个城市待了三年，第四年分手了。你不后悔，但你偶尔会想，如果当时各走各的，会不会更好——这个假设永远没有答案。'
      },
      {
        text: '各去各的',
        effects: { amb: 7, happy: -5, int: 4 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你们开始异地。第一年每周都视频，第四年一年见两次。毕业那年平静地分开了。你去了更好的学校，也失去了一些东西——这两件事没有抵消关系，它们各自成立。'
      },
      {
        text: '谁也没为谁改，也没说破',
        effects: { happy: -4, amb: 4, int: 3 },
        cond: s => s.edu >= 3,
        flags: ['elite_school'],
        result: '你们谁都没说。多年后同学聚会，对方已经结婚了。你举杯说了句"恭喜"，说得很真诚。有些话当时不说，后来就真的不用说了。'
      },
      {
        text: '分数不够，就去那个城市打工',
        effects: { money: 2, cha: 6, con: 5, happy: 4, amb: -6 },
        flags: ['no_college'],
        result: '你在那个城市做了三年服务员，后来做了店长。你们最后没在一起，但你留下了。你说不清是为了谁。'
      },
      {
        text: '复读一年，考到一个城市去',
        effects: { health: -9, happy: -11, amb: 11, int: 7 },
        cond: s => s.edu <= 3,
        flags: ['repeat_year'],
        resolve(s, rng) {
          return repeatResolve(s, rng)
        }
      }
    ]
  },
  {
    id: 't_major_relative',
    stage: 3,
    age: 18,
    order: 1,
    slot: 'major',
    title: '学医吧',
    scene: '家族聚会上，一个当医生的表哥说："学医吧，越老越值钱。"一桌人都在点头。你手里捏着志愿表。',
    options: [
      {
        text: '听劝，学医',
        effects: { int: 6, con: 6, happy: -6, health: -4, family: 5 },
        cond: s => s.edu >= 4,
        flags: ['practical_major', 'major_med'],
        result: '五年本科，三年规培。你三十岁才开始挣钱，三十五岁才敢结婚。你救过很多人，也被病人家属指着鼻子骂过。你后悔过，但没后悔到要走。'
      },
      {
        text: '学计算机，那时候正热',
        effects: { money: 6, int: 5, happy: 2, health: -4 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_cs'],
        result: '你赶上了最后一波好时候。工资涨得比同龄人快，头发掉得也比同龄人快。三十三岁那年你被优化了，然后发现自己其实早就不喜欢写代码了。'
      },
      {
        text: '选了师范',
        effects: { happy: 6, cha: 5, amb: -2, family: 4 },
        cond: s => s.edu >= 3,
        flags: ['practical_major', 'major_teach'],
        result: '你成了老师。工资不高，假期很多。你带过七届学生，有几个到现在还每年给你发消息。这份工作最大的好处是，你能清楚地看见自己做过什么。'
      },
      {
        text: '谁的劝都不听，自己填',
        effects: { amb: 8, cha: 5, happy: 4, family: -4 },
        cond: s => s.edu >= 4,
        flags: ['elite_school'],
        result: '你当着全桌人的面说"我自己定"。气氛冷了几秒，然后有人打圆场。你后来过得不错，家里人再也没干涉过你的选择——他们知道说不动。'
      },
      {
        text: '分数不高，先读个专科',
        effects: { int: 4, con: 4, happy: -3 },
        cond: s => s.edu <= 3,
        flags: ['practical_major', 'major_nurse'],
        result: '你读了护理。三年后你进了市里的医院，比很多本科生早上班两年。你不觉得低人一等，你只是比他们早一点知道夜班有多长。'
      },
      {
        text: '不念了，跟着表哥学手艺',
        effects: { money: 3, con: 5, cha: 5, happy: -4 },
        flags: ['no_college'],
        result: '你跟着表哥学了三年装修。手上的活越来越细，回头客越来越多。你后来自己带了个小队，一年能挣二十几万。你妈再没在人前提过"大学"两个字。'
      }
    ]
  }
]

/* ============================================================
 *  青年 · 19 — 25 岁
 * ============================================================ */

const YOUTH = [
  {
    id: 'y_roommate',
    stage: 4,
    age: 19,
    title: '宿舍里的第四个人',
    scene: '你的室友每天晚上打游戏到两点，声音外放。你已经提过两次了，他每次都答应，然后照旧。',
    cond: s => s.edu >= 2 && !s.flags.includes('no_college'),
    options: [
      {
        text: '当面把话说到位，不留余地',
        effects: { cha: 6, amb: 5, happy: 2 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 48) return { tone: 'good', text: '你把时间、影响、你的底线都说了。他沉默了一会儿，买了耳机。你们后来处得还行——有些人只是需要被明确告知。' }
          return { tone: 'bad', effects: { happy: -5 }, text: '他觉得你小题大做，宿舍气氛僵了一个学期。你学会了一件事：不是所有冲突都能靠"好好说"解决。' }
        }
      },
      {
        text: '买副耳塞，自己扛',
        effects: { happy: -5, int: 4, con: 2 },
        result: '你戴了两年耳塞。睡眠质量一般，但你也没跟谁红过脸。你后来发现，你人生里很多问题都是这么解决的——不是解决，是绕过去。'
      },
      {
        text: '干脆加入他们',
        effects: { cha: 6, happy: 7, health: -5, int: -3 },
        result: '你成了宿舍里最会玩的那个。那两年你睡得很晚，笑得很响。毕业时你的绩点是 2.8，但你有三个能借钱的兄弟。'
      }
    ]
  },
  {
    id: 'y_college',
    stage: 4,
    age: 20,
    title: '四年怎么过',
    scene: '大学的第一个学期结束了。你发现没人管你，也没人关心你。这种自由有点吓人。',
    cond: s => s.edu >= 2 && !s.flags.includes('no_college'),
    options: [
      {
        text: '泡图书馆，绩点拉满',
        effects: { int: 10, happy: -6, amb: 5, health: -1 },
        result: '你成了那种"四年后保研"的人。你在图书馆待的时间比在宿舍长。你偶尔会羡慕楼下弹吉他的那帮人，但你从没下去过。'
      },
      {
        text: '混社团，认识很多人',
        effects: { cha: 10, happy: 8, int: -2, amb: 3 },
        result: '你当了部长，组织过晚会，认识了几百个点头之交。你学会了怎么在饭桌上让所有人舒服。这门手艺后来比你的专业课有用。'
      },
      {
        text: '折腾点小生意',
        effects: { amb: 8, money: 0, int: 3, happy: 3, health: -3 },
        resolve(s, rng) {
          if (rng() > 0.5) {
            return {
              tone: 'good',
              effects: { money: 2, amb: 4 },
              text: '你在宿舍楼下卖过耳机、代取过快递、做过家教中介。毕业时你手里有两万块和一个念头：给别人打工这事，我可能干不长。'
            }
          }
          return {
            tone: 'neutral',
            effects: { money: -1, happy: -4 },
            text: '你进了一批货，压了半年，最后半价清仓。亏了一万多。但你第一次完整地理解了"生意"这两个字有多不讲情面。'
          }
        }
      },
      {
        text: '打游戏，睡到中午',
        effects: { happy: 10, int: -4, con: -4, health: -4 },
        result: '你把四年过成了一场很长的假期。回想起来，那四年你不后悔，但你也不太好意思跟人提起。'
      }
    ]
  },
  {
    id: 'y_skill',
    stage: 4,
    age: 21,
    title: '一门手艺',
    scene: '你在网上看到一个课程，学一门能吃饭的手艺——剪辑、编程、设计，随便哪个。学费不便宜。',
    options: [
      {
        text: '报了，每天练两小时',
        effects: { int: 7, amb: 8, money: -3, happy: 3, health: -2 },
        resolve(s, rng) {
          if (s.int + s.amb * 0.5 + rng() * 30 > 55) {
            s.career += 1
            return { tone: 'good', effects: { money: 5, cha: 3 }, text: '半年后你能接活了。第一个月赚了八百，你请自己吃了顿好的。这门手艺后来在你最狼狈的时候，接住过你一次。' }
          }
          return { tone: 'neutral', text: '你学了个半吊子，能看懂但做不好。但它让你在后来跟专业人士沟通时，不至于被人糊弄。' }
        }
      },
      {
        text: '报了，三天热度',
        effects: { money: -3, happy: 2, int: 2 },
        result: '你看完了前三节课，后二十七节一直躺在收藏夹里。你后来买过很多这样的课。收藏夹是个很温柔的地方，它从不催你。'
      },
      {
        text: '不报，先把专业学好',
        effects: { int: 6, happy: -2, amb: 2 },
        result: '你把时间全给了本专业。你成了班上最扎实的那个。只是很多年后你发现，你学的东西有一半已经不用了。'
      }
    ]
  },
  {
    id: 'y_travel',
    stage: 4,
    age: 21,
    cond: s => !s.flags.includes('no_college') && s.edu >= 2,
    title: '说走就走',
    scene: '暑假，室友说要去西北，问你去不去。你算了一下钱，够，但接下来三个月会很紧。',
    options: [
      {
        text: '去，钱花了再挣',
        effects: { money: -5, happy: 14, cha: 6, con: 3 },
        result: '你们坐了三十个小时的硬座，在戈壁上看了日出。那张照片你用了很多年的头像。你后来去过更远的地方，但没有一次比那次亮。'
      },
      {
        text: '不去，攒钱',
        effects: { money: 4, happy: -4, amb: 3 },
        result: '你留下来做了两个月兼职。开学时你账户里有八千块。你看着室友晒的照片，心里说不上是什么滋味。'
      },
      {
        text: '去，但一路穷游，能省就省',
        effects: { money: -2, happy: 9, cha: 5, con: -2 },
        result: '你们睡过火车站，吃过三块钱的面。回来后你瘦了五斤，但你在路上认识了三个后来一直联系的人。'
      }
    ]
  },
  {
    id: 'y_love',
    stage: 4,
    age: 22,
    title: '要不要认真一次',
    scene: '有个人对你很好，好到你开始害怕。你以前从没认真过，因为认真就会有输的可能。',
    options: [
      {
        text: '认真谈一场',
        effects: { happy: 12, cha: 4, money: -2, health: 2 },
        flags: ['first_love'],
        result: '你们在一起了。你第一次为了另一个人调整自己的作息、口味和计划。这段关系后来没有走到最后，但它把你从一个只关心自己的人，变成了一个会心疼别人的人。'
      },
      {
        text: '保持距离，先顾自己',
        effects: { amb: 7, happy: -6, int: 3 },
        flags: ['cold_start'],
        result: '你说"我现在给不了什么"。对方点点头，后来就没再联系。很多年后你事业有成，某个深夜忽然想起来，那句"给不了"，其实是你不敢要。'
      },
      {
        text: '谈着，但一直不提未来',
        effects: { happy: 4, cha: 3, amb: 2 },
        result: '你们在一起两年。每次对方问"以后呢"，你就换个话题。最后是对方先说的分手，理由是"我看不到你想跟我过日子"。你没法反驳。'
      }
    ]
  },
  {
    id: 'y_intern',
    stage: 4,
    age: 21,
    cond: s => !s.flags.includes('no_college') && s.edu >= 3,
    title: '第一次被骂',
    scene: '实习第二周，你交的东西被打回来三次。带你的人当着整个组的面说："这个水平也敢拿出来？"',
    options: [
      {
        text: '当场道歉，回去改到最好',
        effects: { int: 6, amb: 7, happy: -8, health: -3 },
        result: '你改到凌晨两点，第四版通过了。他没夸你，只说"下次别这样"。三个月后他给你写了很好的推荐信。你后来才懂，他骂你的时候是在教你。'
      },
      {
        text: '忍着，心里记下这个人',
        effects: { happy: -10, amb: 5, cha: -3 },
        result: '你没说话，但你在心里给他记了一笔。实习结束后你删了他的联系方式。你没有变得更差，但也没有变得更好。'
      },
      {
        text: '当场问："具体哪里不行？"',
        effects: { cha: 7, int: 5, amb: 6, happy: -3 },
        result: '他愣了一下，然后一条一条说了二十分钟。你记了满满两页。那天之后，你成了组里进步最快的人。你学会了把羞辱翻译成信息。'
      }
    ]
  },
  {
    id: 'y_female_interview',
    stage: 4,
    age: 22,
    title: '有男朋友吗',
    scene: '面试很顺利，最后 HR 笑着问了一句："有男朋友吗？打算什么时候结婚要孩子？"',
    cond: s => s.gender === 'f',
    options: [
      {
        text: '如实说"有，但近几年不考虑"',
        effects: { happy: -6, cha: 3, int: 2 },
        resolve(s, rng) {
          if (rng() > 0.45) return { tone: 'neutral', text: '她笑着记了一笔，你拿到了 offer。入职后你才知道，那个岗位那年只招了你一个女生。你不知道这算不算幸运。' }
          return { tone: 'bad', effects: { happy: -8 }, text: '她说"我们这边节奏比较快"，然后就没有然后了。你走出写字楼，站在路边，忽然不知道该怪谁。' }
        }
      },
      {
        text: '反问："这个和岗位有关系吗？"',
        effects: { cha: 7, amb: 8, happy: 2 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 52) return { tone: 'good', effects: { happy: 6 }, text: '她愣了一下，说"只是了解一下"。你说"我理解，但我更想聊聊这个岗位的具体挑战"。你拿到了 offer，而且是从那一刻开始被尊重的。' }
          return { tone: 'bad', effects: { happy: -7 }, text: '气氛冷了下来。你没拿到这个 offer。你有点后悔，但更多是生气——气自己居然会后悔。' }
        }
      },
      {
        text: '说"没有，近几年也不打算"',
        effects: { happy: -4, money: 2, amb: 3 },
        result: '你拿到了 offer。后来你在这家公司待了四年，一直没有谈恋爱。你不知道是巧合，还是那句话变成了某种自我实现。'
      }
    ]
  },
  {
    id: 'y_male_burden',
    stage: 4,
    age: 24,
    title: '你是男人',
    scene: '家里出了点事，需要一笔钱。你妈在电话里说："你是男的，这个家以后要靠你。"你手里其实也没多少。',
    cond: s => s.gender === 'm',
    options: [
      {
        text: '把钱全打回去，自己啃馒头',
        effects: { money: -6, family: 10, happy: -6, health: -5 },
        result: '你连着吃了一个月的挂面。没人知道。你妈后来跟亲戚说"我儿子有担当"。你听着这句话，觉得又骄傲又累。'
      },
      {
        text: '说清楚自己的情况，能出多少出多少',
        effects: { family: 3, cha: 6, happy: 2, amb: 4 },
        result: '你说"我只能拿出这些，剩下的我们一起想办法"。你妈沉默了一会儿，说"也行"。你第一次发现，"顶不住"是可以被说出口的。'
      },
      {
        text: '去借了一圈，硬扛下来',
        effects: { money: -4, cha: 4, happy: -10, amb: 6 },
        result: '你凑齐了那笔钱，也欠下了三个人情。你在还钱的那两年里，学会了一件事：所谓担当，很多时候就是把别人的难处接到自己身上。'
      }
    ]
  },
  {
    id: 'y_grad',
    stage: 4,
    age: 23,
    slot: 'grad',
    pinned: true,
    cond: s => !s.flags.includes('no_college') && s.edu >= 2,
    title: '六月',
    scene: '毕业了。宿舍楼下堆满了纸箱和被丢下的东西。你手里有一份简历，和一种说不清的慌。',
    options: [
      {
        text: '考研，再读三年',
        effects: { int: 8, money: -4, happy: -5, amb: 4 },
        resolve(s, rng) {
          const p = s.int * 0.5 + s.amb * 0.3 + rng() * 40
          if (p > 60) {
            s.flags.push('postgrad')
            s.edu = Math.min(5, s.edu + 1)
            s.career += 1
            return {
              tone: 'good',
              effects: { happy: 8, int: 4 },
              text: '你考上了。三年后你带着一张更高的文凭出来，起薪比本科同学高一点，年龄比他们大三岁。这笔账到底划不划得来，你到现在也没算清。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -10, money: -2, amb: -3 },
            text: '你差了 12 分。二战还是找工作，你在出租屋里纠结了一个月。最后你去找了工作，但那个"如果当初"的念头，跟了你很多年。'
          }
        }
      },
      {
        text: '考公、进体制',
        effects: { happy: 5, amb: -4, money: 2, health: 4 },
        resolve(s, rng) {
          // 上岸才给 gov：没考上的那条路是"去了一家公司"，不能还算体制内
          if (s.int + rng() * 50 > 55) {
            s.flags.push('gov')
            return {
              tone: 'good',
              effects: { happy: 6, career: 1 },
              text: '你上岸了。父母在亲戚群里发了消息。工作不难，收入不高，但你第一次觉得日子是可以被安排的。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -8, money: -2 },
            text: '你考了两年，进了三次面，都没成。第三年你放弃了，去了一家公司。你后来偶尔会想，如果当年再考一次呢。'
          }
        }
      },
      {
        text: '去大城市，进大厂',
        effects: { money: 8, health: -6, happy: -3, amb: 8, cha: 4, career: 2 },
        flags: ['bigtech'],
        result: '你拖着两个箱子下了高铁。房租占了你工资的三分之一。加班到十一点的地铁上，你看着玻璃里自己的脸，觉得还挺像那么回事。'
      },
      {
        text: '回老家，找个安稳的活',
        effects: { happy: 8, family: 6, amb: -8, money: 1, health: 5, career: -1 },
        flags: ['hometown'],
        result: '你回去了。工资是大城市的一半，通勤是十分钟，父母每天都能见到你。同学聚会上有人说你"可惜了"，你笑了笑没接话。'
      },
      {
        text: '自己干',
        effects: { amb: 12, money: -5, happy: -4, health: -5 },
        resolve(s, rng) {
          const p = s.amb * 0.4 + s.cha * 0.25 + s.luk * 0.2 + rng() * 35
          if (p > 66) {
            s.flags.push('founder')
            s.career += 3
            return {
              tone: 'good',
              effects: { money: 10, amb: 8, happy: 6 },
              text: '你和两个朋友凑了十五万，做了一个很小的东西。第一年没赚钱，第二年有人开始付钱。你没成什么大人物，但你真的不用再向谁请假了。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -8, happy: -10, amb: -6, career: -1 },
            text: '做了两年，烧完了所有积蓄，团队散了。你欠了一点钱，也欠了几个人情。你学会的最重要一课是：热情不能当月供。'
          }
        }
      }
    ]
  },
  {
    id: 'y_grad_second',
    stage: 4,
    age: 23,
    slot: 'grad',
    title: '差 8 分',
    cond: s => !s.flags.includes('no_college') && s.edu >= 3 && s.int >= 46,
    scene: '毕业这年你顺手报了个名，考了一次研，差 8 分。同学都在往行李箱里塞东西，你坐在空宿舍里，等一个可能不会来的调剂通知。',
    options: [
      {
        text: '再来一年',
        effects: { int: 6, amb: 8, money: -5, happy: -8, health: -4 },
        flags: ['postgrad'],
        result: '第二年你考上了。通知书到的时候你在送外卖，站在电梯里看了很久。你比同届大两岁，也比你想象中更能扛。'
      },
      {
        text: '调剂去一个普通学校',
        effects: { int: 4, happy: 2, amb: 2 },
        flags: ['postgrad'],
        result: '你调剂到了一所双非。导师很实在，项目不少。你毕业时发现，学历的门槛确实低了半格，但你的能力没低。'
      },
      {
        text: '算了，开始找工作',
        effects: { money: 4, happy: -3, amb: -2, cha: 4, career: 1 },
        flags: ['bigtech'],
        result: '你去了招聘会，"应届生"这个身份还热着。你花了三个月找到一份工作，比读研的同学早三年开始挣钱。'
      },
      {
        text: '转去考公',
        effects: { happy: 4, amb: -3, money: 2, health: 3 },
        flags: ['gov'],
        result: '你转考公，第二年上岸。亲戚说你"终于稳定了"。你在办公室里想起考研的那年，觉得像上辈子的事。'
      }
    ]
  },
  {
    id: 'y_grad_arranged',
    stage: 4,
    age: 23,
    slot: 'grad',
    title: '安排好的工作',
    scene: '你爸打来电话，说他老同学的厂里缺个行政，"我跟人家应下了，你先去干着，别挑了"。他说这话时很自然，像已经替你做过决定了。',
    options: [
      {
        text: '去了',
        textAlt: ['去了', '点头，去上班', '没多想，就去了', '答应了，第二天报到'],
        effects: { happy: -4, family: 6, money: 3, amb: -8, health: 3, career: -1 },
        flags: ['hometown'],
        result: '你去了。办公室在三楼，窗外是货场。同事都很照顾你，因为你是"老张的儿子"。你干了六年，升了两级，也再没想过别的可能。'
      },
      {
        text: '拒绝，自己找',
        textAlt: ['拒绝，自己找', '不去，自己投简历', '谢过，另找', '把这条路推了'],
        effects: { amb: 8, cha: 5, happy: 2, family: -8, money: 1, career: 1 },
        flags: ['bigtech'],
        result: '你爸三个月没理你。你在一家小公司从助理做起，月薪四千五。第二年你跳了一次槽，第三年你比他老同学的厂里挣得多。'
      },
      {
        text: '去了，但一边干一边考',
        textAlt: ['去了，但一边干一边考', '先干着，同时备考', '进去混口饭，复习不落', '边上班边刷题'],
        effects: { int: 5, amb: 5, happy: -2, health: -3 },
        flags: ['gov'],
        result: '你在那个办公室里看了两年书。第三年你考上了另一个城市的岗位。你走的时候，你爸的老同学拍你肩膀说"这小子有主意"。'
      },
      {
        text: '说"我先试三个月"',
        textAlt: ['说"我先试三个月"', '谈了个三个月试用', '先试三个月再定', '跟他们要三个月'],
        effects: { cha: 4, happy: 3, amb: 2, money: 2 },
        flags: ['hometown'],
        result: '三个月后你留下了，但这次是你自己决定的。同样一份工作，被人安排和自己选的，做起来的心情完全不同。'
      }
    ]
  },
  {
    id: 'y_grad_startup',
    stage: 4,
    age: 23,
    slot: 'grad',
    cond: s => !s.flags.includes('no_college') && s.edu >= 3,
    title: '一起干',
    scene: '室友说他有个项目，缺一个技术合伙人。"工资先没有，股份给你 30%。"他眼睛很亮。',
    options: [
      {
        text: '干',
        effects: { amb: 12, money: -6, happy: 3, health: -6 },
        resolve(s, rng) {
          const p = s.cha + s.amb * 0.5 + s.int * 0.3 + rng() * 40
          if (p > 92) {
            s.flags.push('founder')
            s.career = Math.max(s.career, 3)
            return {
              tone: 'good',
              effects: { money: 8, amb: 6 },
              text: '你们在城中村租了个两居室，客厅当办公室。第一年做了三个产品，死了两个。第二年那个活了下来，你第一次收到属于自己公司的回款。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -6, happy: -8 },
            text: '做了十四个月，钱烧完了，三个人吃了一顿散伙饭。你学会的是：热情不能当月供。但你后来每次面试，都会讲这段经历。'
          }
        }
      },
      {
        text: '拒绝，去上班',
        effects: { money: 5, happy: -2, amb: -2, career: 1 },
        flags: ['bigtech'],
        result: '你说"我得先养活自己"。他找了三个人，最后做成了。三年后他融资的新闻你看了三遍，然后关掉，继续改你的需求文档。'
      },
      {
        text: '兼职参与',
        effects: { int: 4, money: 3, health: -4, happy: 2, amb: 4 },
        flags: ['bigtech'],
        result: '你白天上班，晚上写代码。项目没成，但你学到了一整套东西：怎么从零做一个东西，怎么跟人谈钱。这些在打工的地方学不到。'
      },
      {
        text: '劝他先去上班',
        effects: { cha: 5, happy: 2, amb: -2 },
        flags: ['bigtech'],
        result: '他听了你的，去了大厂。两年后他跟你说"还是想干"。你说"那你去"。他去了，这次你没跟。'
      }
    ]
  },
  {
    id: 'y_grad_offer',
    stage: 4,
    age: 23,
    slot: 'grad',
    cond: s => !s.flags.includes('no_college') && s.edu >= 3,
    title: '唯一的名额',
    scene: '你实习了一年，转正名额只有一个。另一个实习生是部门经理的侄子。HR 说"我们会综合评估"。',
    // 学图书馆学的遇不到"部门经理"：同一个名额之争，换个单位换套称谓
    sceneAlt: [s => {
      const f = s.flags
      const moved = f.includes('changed_major')
      if (!moved && f.includes('major_library')) return '你实习了一年，留馆的名额只有一个。另一个实习生是馆长的外甥。人事说"我们会综合评估"。'
      if (!moved && f.includes('major_teach')) return '你实习了一年，留校的名额只有一个。另一个实习老师是教务主任的亲戚。校长说"我们会综合评估"。'
      if (!moved && (f.includes('major_med') || f.includes('major_nurse'))) return '你实习了一年，留院的名额只有一个。另一个实习生是科室主任的侄女。人事科说"我们会综合评估"。'
      return '你实习了一年，转正名额只有一个。另一个实习生是部门经理的侄子。HR 说"我们会综合评估"。'
    }],
    options: [
      {
        text: '拼业绩，做到最好',
        effects: { int: 5, amb: 8, health: -5, happy: -3, career: 2 },
        flags: ['bigtech'],
        result: '你把三个项目都做到了超额。最后名额给了你。后来你才知道，负责人顶了很大压力。你从此相信：关系能决定很多事，但决定不了所有事。'
      },
      {
        text: '找负责人当面谈一次',
        effects: { cha: 7, amb: 5, happy: 1, career: 1 },
        result: '你说了你做过的所有事，也说"我知道另一个人的情况"。负责人沉默了很久，说"我记下了"。你最后没留下，但三个月后他把你推荐到了另一个单位。'
      },
      {
        text: '主动退出，另找',
        effects: { happy: 2, amb: 3, money: 1 },
        flags: ['hometown'],
        result: '你说"我不争了"，然后开始投简历。你走得干脆，走之前还跟所有人吃了顿饭。有人觉得你傻，你自己知道那不是傻，是不想把自己耗在这件事上。'
      },
      {
        text: '让家里托人打个招呼',
        effects: { cha: 4, family: -4, happy: -6, amb: -2, money: 2 },
        flags: ['bigtech'],
        result: '名额给了你。你留下了一年，然后辞职了——你受不了每次开会时别人看你的眼神。'
      }
    ]
  },
  {
    id: 'y_grad_lost',
    stage: 4,
    age: 23,
    slot: 'grad',
    cond: s => !s.flags.includes('no_college') && s.edu >= 2,
    title: '三个月',
    scene: '你毕业三个月了，还没找到工作。出租屋很小，窗帘一直拉着。投出去的简历大部分没有回音。',
    options: [
      {
        text: '降标准，先有份工作',
        effects: { money: 2, happy: -3, amb: -4, con: 4, career: -1 },
        flags: ['hometown'],
        result: '你接受了一份月薪五千的工作，专业不对口。上班第一天你在工位上坐了一整天，没人给你安排事。你后来在那家公司待了四年。'
      },
      {
        text: '死磕，只投想去的',
        effects: { amb: 8, happy: -8, money: -4, health: -3, career: 2 },
        flags: ['bigtech'],
        result: '第四个月，你拿到了一家你想去的公司的 offer。你在楼道里接的电话，挂了以后蹲下来哭了一会儿。你后来跟人说"坚持有用"，但你自己知道，也有一半是运气。'
      },
      {
        text: '回家待一段，缓缓',
        effects: { happy: 3, family: 5, amb: -6, health: 4 },
        flags: ['hometown'],
        result: '你回家了，睡了一个月好觉。母亲的饭让你胖了六斤。半年后你在老家找了份工作，工资不高，但你再没失眠过。'
      },
      {
        text: '自己接活，不上班',
        effects: { amb: 6, money: 1, cha: 4, health: -2 },
        flags: ['freelance'],
        result: '你开始接零散的活：写文案、剪视频、帮人做小程序。收入不稳定，但够活。你第一次意识到，"上班"只是一种活法，不是唯一的。'
      }
    ]
  },
  {
    id: 'y_grad_factory',
    stage: 4,
    age: 23,
    slot: 'grad',
    cond: s => s.flags.includes('no_college'),
    title: '第五年',
    scene: '你在这条线上干了五年。今年分来一个新人，二十二岁，本科刚毕业，工资比你高八百。线长让你带他。',
    options: [
      {
        text: '认真带，该教的都教',
        effects: { cha: 6, amb: 4, happy: -2, health: -2, career: 1 },
        result: '你把调机、看图纸、跟质检的事一样样教给他。他后来逢人就说"我师父"。你没多拿一分钱，但整条线开始有人喊你名字，而不是"那个谁"。'
      },
      {
        text: '只教流程，别的不管',
        effects: { happy: 2, cha: -3, amb: -1, health: 2 },
        result: '你只说了操作步骤，剩下让他自己摸。三个月后他出了个错，把一批料废了，责任算在他头上。你没说话，但你知道自己本可以早说一句。'
      },
      {
        text: '去问能不能考技术岗',
        effects: { int: 4, amb: 6, happy: 1, health: -2 },
        resolve(s, rng) {
          if (s.int + s.cha * 0.4 + rng() * 40 > 60) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 5, happy: 9, int: 4 },
              text: '车间主任让你先跟着设备科跑两个月。半年后你转了技术岗，工资涨了一截，也不用再站十二个小时。你第一次觉得，"没上大学"这件事，没有把你钉死在原地。'
            }
          }
          return {
            tone: 'neutral',
            effects: { happy: -4 },
            text: '主任说"技术岗要大专"，把话岔开了。你回去继续站线，手上的活没变，心里的东西变了一点。'
          }
        }
      },
      {
        text: '晚上去读个夜校',
        effects: { int: 7, money: -2, health: -4, happy: 3, amb: 6 },
        result: '你报了成人专科，每周三个晚上骑车去上课。班里都是和你一样的人，白天上班，晚上做题。两年半后你拿到证，把它夹在工牌后面。'
      }
    ]
  },
  {
    id: 'y_grad_shop',
    stage: 4,
    age: 23,
    slot: 'grad',
    cond: s => s.flags.includes('no_college'),
    title: '盘不盘店',
    scene: '你在店里干了五年，从洗菜到收银。老板娘说要回老家带孙子，问你要不要把这间店盘下来，连设备八万。',
    options: [
      {
        text: '借钱也要盘',
        effects: { money: -6, amb: 10, health: -4, happy: 2 },
        resolve(s, rng) {
          if (s.luk * 0.4 + s.cha * 0.4 + s.amb * 0.2 + rng() * 40 > 58) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 12, happy: 10 },
              text: '你借了六万，把店接了下来。第一年还清了债，第二年你雇了一个人。招牌没换，但附近的人开始叫它"你的店"。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -5, happy: -12, health: -4 },
            text: '客流没接住，房租又涨了。撑了十一个月，你把设备卖了还债。你在空店里坐了一个下午，然后去隔壁超市做了理货员。'
          }
        }
      },
      {
        text: '不盘，继续打工',
        effects: { happy: -3, amb: -6, money: 2, health: 3 },
        result: '你说"我没那个胆子"。老板娘盘给了别人，新老板留你继续干，工资加了两百。你后来每次路过那家店，都会下意识看一眼招牌。'
      },
      {
        text: '找人合伙，各出一半',
        effects: { money: -3, cha: 5, amb: 4, happy: 1 },
        result: '你拉了个一起干活的伙计，一人四万。两个人的好处是扛得住，坏处是每次进货都要商量。你们吵过三次，但店活下来了。'
      }
    ]
  },
  {
    id: 'y_longdist',
    stage: 4,
    age: 23,
    title: '两个城市',
    scene: '你们在不同的城市。一个月的车票钱占了你工资的五分之一。对方说："要不我过去？"',
    cond: s => s.flags.includes('first_love'),
    options: [
      {
        text: '让对方过来，你在这边站稳',
        effects: { happy: 6, money: -4, cha: 3 },
        result: '对方辞了工作过来，在你租的房子附近找了个一般的活。你们在一起了，但你们都知道，有一笔账记在了这段关系上。'
      },
      {
        text: '你过去',
        effects: { happy: 8, money: -8, amb: -5, cha: 5 },
        result: '你辞了工作，去了对方的城市。你在那儿从头开始，薪水降了三成。你在新公司第一次开会时，听不懂他们的方言。'
      },
      {
        text: '谁也不动，先这样',
        effects: { happy: -8, amb: 4, money: 2 },
        result: '你们又撑了一年，然后慢慢地不联系了。分手是在电话里说的，两个人都很平静。你挂掉电话，发现窗外下着雨。'
      }
    ]
  },
  {
    id: 'y_oppose',
    stage: 4,
    age: 24,
    title: '见家长',
    scene: '你带那个人回家吃饭。饭桌上你妈问了很多问题，问到对方家里情况时，气氛变了。',
    cond: s => s.flags.includes('first_love'),
    options: [
      {
        text: '当面维护对方',
        effects: { cha: 7, family: -8, happy: 4, amb: 6 },
        result: '你说"这些不重要"。你妈脸沉了下来，那顿饭吃得很僵。回程的路上，对方握着你的手，说"谢谢你"。你们后来还是分开了，但这句话你一直记得。'
      },
      {
        text: '打圆场，两边都不得罪',
        effects: { cha: 5, happy: -4, family: 2 },
        result: '你把话题岔开了，饭桌上勉强维持着体面。但你妈私下跟你说"我不同意"，对方也察觉到了什么。你成了夹在中间的那个人。'
      },
      {
        text: '事后劝对方"多担待"',
        effects: { happy: -8, cha: -3, family: 4 },
        result: '对方说"我可以担待，但你得站在我这边"。你说"我站了啊"。你们都知道这不是真的。半年后你们分开了，理由很含糊。'
      }
    ]
  },
  {
    id: 'y_partner',
    stage: 4,
    age: 24,
    title: '一起干吧',
    scene: '一个认识多年的朋友找你，说有个项目，缺一个合伙人。他要你出十万，占三成。',
    options: [
      {
        text: '投，一起干',
        effects: { money: -10, amb: 10, happy: 2, health: -5 },
        resolve(s, rng) {
          const p = s.amb * 0.35 + s.cha * 0.25 + s.luk * 0.25 + rng() * 40
          if (p > 62) {
            s.career += 2
            return { tone: 'good', effects: { money: 20, happy: 10 }, text: '第一年很难，第二年有了起色。第三年你们做到了三十人的规模。你后来常说，这辈子最对的一件事，是那天晚上点了头。' }
          }
          return { tone: 'bad', effects: { money: -6, happy: -12, amb: -5 }, text: '撑了十四个月，散了。钱没了，朋友也生分了。你后来算过，那十万块买到的唯一东西，是一个教训。' }
        }
      },
      {
        text: '不投，但帮他介绍资源',
        effects: { cha: 6, happy: 3, money: 1 },
        result: '你没投钱，但你把能介绍的都介绍了。项目后来没成，他也没怪你。你们的交情反而更实了——因为你没在他身上赌，也没占他便宜。'
      },
      {
        text: '不投，也不掺和',
        effects: { money: 2, happy: -2, cha: -3 },
        result: '你说"我不懂这个"。后来他做成了，你有点后悔。但你也知道，如果赔了，你连后悔的资格都没有。'
      }
    ]
  },
  {
    id: 'y_online2',
    stage: 4,
    age: 22,
    title: '你被挂到了网上',
    scene: '你在社交平台发的一条内容被人截图，配上断章取义的解读，转发了几千次。评论区在骂你。',
    options: [
      {
        text: '逐条回应，把原委说清楚',
        effects: { cha: 5, amb: 7, happy: -12, health: -4 },
        result: '你写了一篇很长的回应，有人说清楚了，有人继续骂。三天后热度过去了。你删了那条内容，也删了那个账号。'
      },
      {
        text: '全部删掉，消失一段时间',
        effects: { happy: -8, cha: -4, int: 4 },
        result: '你关了评论，卸载了软件。一个月后你重新下载，发现已经没人在意了。你第一次知道，互联网的记忆只有三天，但你的记忆不是。'
      },
      {
        text: '截图存证，找平台投诉',
        effects: { int: 5, amb: 6, happy: -5, cha: 3 },
        resolve(s, rng) {
          if (rng() > 0.55) return { tone: 'good', text: '平台处理了，几个大号删了帖。你没有得到道歉，但你的名字从搜索结果里消失了。你学会了一件很实用的事：愤怒要有出口。' }
          return { tone: 'neutral', text: '投诉没什么用。你最后自己把热度熬过去了。这件事让你对"平台"这两个字失去了最后一点信任。' }
        }
      }
    ]
  },
  {
    id: 'y_meeting',
    stage: 4,
    age: 24,
    title: '那个会议',
    scene: '会上你的方案被主管当众否了，他说"年轻人想法还是不成熟"。会后他拍拍你肩膀："别往心里去啊。"',
    cond: s => isStaff(s),
    options: [
      {
        text: '忍住，把活干漂亮',
        effects: { amb: 4, happy: -8, int: 3 },
        result: '你没说话，回去把方案重做了三版。三个月后项目成了，汇报的人是主管。你学会了职场最基础的一课：功劳和苦劳不是一回事。'
      },
      {
        text: '当场把逻辑讲回去',
        effects: { cha: 6, happy: 3, amb: 5 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 52) {
            return {
              tone: 'good',
              effects: { int: 3 },
              text: '你把数据一条条摆了出来。会议室安静了几秒，总监说"这个思路可以再聊聊"。主管脸色不太好看，但从那以后，他不再随便否你的东西。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -6, amb: -2 },
            text: '你话说得太急，逻辑没讲清，反而像在赌气。那之后半年，你的活都是最杂的。你明白了：有理和赢，中间隔着一整套手艺。'
          }
        }
      },
      {
        text: '不吵，开始投简历',
        effects: { amb: 7, money: -1, happy: 2, career: 1 },
        result: '你花了三个月的晚上改简历、面试。跳槽后工资涨了 40%。你第一次知道，原来自己的价格不是由一个人定的。'
      },
      {
        text: '把方案改到他挑不出毛病',
        effects: { int: 6, amb: 8, health: -6, happy: -3 },
        result: '你改到第七版。他找不到问题了，只好说"行，那就这样"。你没有赢他，但你赢了这个东西本身。这种赢法很慢，但很结实。'
      }
    ]
  },
  {
    id: 'y_blind',
    stage: 4,
    age: 25,
    title: '相亲',
    scene: '亲戚介绍了一个人，说"条件挺好的"。你们约在一家咖啡馆，见面第一句话是"你比照片上好看"。',
    options: [
      {
        text: '认真聊，看看能不能处',
        effects: { cha: 5, happy: 3, money: -1 },
        resolve(s, rng) {
          if (s.cha + s.luk * 0.4 + rng() * 40 > 58) {
            s.flags.push('dating')
            return { tone: 'good', effects: { happy: 8 }, text: '你们聊了三个小时，从工作聊到小时候住的地方。第二周又见了一次。你没想到相亲还能遇到这样的人——你一直以为这是最不浪漫的方式。' }
          }
          return { tone: 'neutral', text: '聊得还行，但没有第二次。回去后亲戚问怎么样，你说"挺好的，就是没什么感觉"。她说"感觉是可以培养的"。你没接话。' }
        }
      },
      {
        text: '礼貌应付，吃完就走',
        effects: { family: -4, happy: -2, amb: 3 },
        result: '你全程看了一次手机。对方也看了一次。四十分钟后你们很有默契地站起来结账，互相说了句"再联系"，都知道不会联系。'
      },
      {
        text: '直接说"我是被逼来的"',
        effects: { cha: 6, happy: 5, family: -8 },
        result: '对方愣了一下，然后笑了，说"我也是"。你们那顿饭吃得很轻松，聊了很多不相关的事。后来成了朋友，各自找了别人。'
      }
    ]
  },
  {
    id: 'y_rent',
    stage: 4,
    age: 25,
    title: '住哪儿',
    scene: '租约到期了。你算了算工资条，发现"住得好"和"存得下钱"只能选一个。',
    options: [
      {
        text: '住郊区，通勤两小时，房租便宜',
        effects: { money: 8, health: -5, happy: -5, con: -2 },
        result: '你每天在地铁上站一个小时四十分钟。你在那段通勤里听完了四十本书。你也不知道这算不算补偿。'
      },
      {
        text: '住公司附近，月月光',
        effects: { happy: 7, money: -6, cha: 4, health: 2 },
        result: '你走路上班只要十二分钟。你多出来的时间用来睡觉、做饭、见朋友。你的存款一直是零，但你的生活一直是你的。'
      },
      {
        text: '跟人合租老破小',
        effects: { money: 3, cha: 4, happy: 2, health: -2 },
        result: '三个陌生人，一个卫生间，一台总在半夜响的洗衣机。你在那儿认识了两个后来很重要的朋友。'
      }
    ]
  },
  {
    id: 'y_gym',
    stage: 4,
    age: 22,
    title: '镜子里',
    scene: '你在电梯的镜子里看见自己，忽然觉得有点陌生。你办了张健身卡。',
    options: [
      {
        text: '坚持了两年',
        effects: { con: 9, health: 12, happy: 8, money: -3 },
        result: '你从跑八百米就喘，到能跑完十公里。身体变好的那两年，你连带着把很多别的事也做成了。你后来常说，健身教会你的不是肌肉，是"持续"这两个字。'
      },
      {
        text: '去了三个月',
        effects: { con: 4, health: 5, happy: 3, money: -2 },
        result: '你去了三个月，瘦了八斤，然后卡就过期了。但那三个月的底子还在，你后来胖起来的时候，总想起那段日子。'
      },
      {
        text: '办了卡，一次没去',
        effects: { money: -2, happy: -2 },
        result: '卡在钱包里躺了一年。你每次看到它都有点愧疚。后来你把卡送人了，那个人真的去了。'
      }
    ]
  },
  {
    id: 'y_salary',
    stage: 4,
    age: 25,
    title: '涨薪之后',
    scene: '你涨薪了，涨幅不小。第一个月的工资到账时，你盯着那个数字看了很久。',
    options: [
      {
        text: '把多出来的全存起来',
        effects: { money: 12, happy: 2, amb: 4 },
        result: '你保持着原来的生活方式，多出来的钱一分没动。三年后那笔钱成了你换城市的底气。你后来很感谢那个没有升级消费的自己。'
      },
      {
        text: '升级一下生活',
        effects: { money: -2, happy: 10, cha: 6, health: 3 },
        result: '你换了房子，买了想买很久的东西，请朋友吃了顿饭。你第一次觉得"赚钱是有意义的"。这种感受很重要，它让你在最累的时候还能撑住。'
      },
      {
        text: '一半存，一半花',
        effects: { money: 5, happy: 6, cha: 3, health: 2 },
        result: '你把多出来的钱分成了两半。这个做法你保持了很多年。你后来发现，能长期坚持的理财方案，都是不极端的。'
      }
    ]
  },
  {
    id: 'y_lose',
    stage: 4,
    age: 24,
    title: '第一笔投资',
    scene: '同事说他买的基金涨了 40%，还说"现在不进就晚了"。你把攒下的钱转了进去。',
    options: [
      {
        text: '一直拿着',
        resolve(s, rng) {
          // 投进去的钱跟着你实际的存款走，文案里的数字才算数
          const amt = Math.max(1, Math.min(20, Math.round(s.money * 0.5)))
          if (rng() > 0.5) {
            const gain = Math.max(1, Math.round(amt * 0.4))
            return { tone: 'good', effects: { money: gain, happy: 6 }, text: `半年后你赚了 ${gain} 万。你卖了，请自己吃了顿好的。你后来再也没碰过这种东西，因为你知道那次是运气。` }
          }
          const loss = Math.max(1, Math.round(amt * 0.4))
          return { tone: 'bad', effects: { money: -loss, happy: -12, health: -2 }, text: `跌了四成，你没舍得割，最后割在了地板上。${amt} 万变成了 ${amt - loss} 万。你第一次知道，"亏钱"不是数字变少，是心里有个东西塌了。` }
        }
      },
      {
        text: '涨一点就卖',
        resolve(s, rng) {
          const amt = Math.max(1, Math.min(20, Math.round(s.money * 0.5)))
          if (rng() > 0.4) {
            const gain = Math.max(1, Math.round(amt * 0.15))
            return { tone: 'good', effects: { money: gain, happy: 5 }, text: `你赚了 ${gain} 万就跑了。后来它涨了很多，你有点后悔。但你也没亏。你后来一直用这个策略，赚得不多，睡得很好。` }
          }
          return { tone: 'bad', effects: { money: -1, happy: -3 }, text: '你卖在了最低点，亏了一点。你郁闷了一个星期。后来你算了一下，这点钱买了个教训，其实不贵。' }
        }
      },
      {
        text: '算了，取出来',
        effects: { money: 1, happy: 1, amb: -2 },
        result: '你三天后就把钱取出来了，因为睡不着。你后来再没投过。有人说你保守，你说"我只是知道自己几斤几两"。'
      }
    ]
  },
  {
    id: 'y_borrow',
    stage: 4,
    age: 23,
    title: '老家来的电话',
    scene: '一个平时不怎么联系的亲戚打来电话，说家里急用钱，问你借三万。',
    options: [
      {
        text: '借',
        effects: { money: -3, cha: 4, happy: 2 },
        resolve(s, rng) {
          if (rng() > 0.55) return { tone: 'good', effects: { money: 3, cha: 3 }, text: '半年后他还了，还多给了两百块。你说不用，他坚持。这笔钱后来变成了一种信任，你回家的时候，他在村口接你。' }
          return { tone: 'bad', effects: { happy: -8 }, text: '钱一直没还。逢年过节他躲着你。你没有催，但你在心里把他从"亲戚"那一栏移走了。' }
        }
      },
      {
        text: '说自己也紧，借一万',
        effects: { money: -1, cha: 2, happy: -2 },
        result: '他收了，说了很多谢谢。你后来听说他找了好几个人凑。你不知道自己算不算帮上了忙，但你没有让自己为难。'
      },
      {
        text: '拒绝',
        effects: { cha: -5, happy: -4, money: 1 },
        result: '你说"我最近也紧张"。他"哦"了一声，挂了。过年回家，他在饭桌上没跟你说话。你妈私下说你"不懂事"。'
      }
    ]
  },
  {
    id: 'y_teambuild',
    stage: 4,
    age: 24,
    title: '周末团建',
    scene: '公司组织周末去爬山，说"自愿参加"。但群里所有人都在报数。',
    cond: s => isStaff(s),
    options: [
      {
        text: '去，全程陪笑',
        effects: { cha: 6, happy: -6, health: -2 },
        result: '你爬了六个小时，听了一路领导的创业故事。晚上聚餐你敬了酒，说了很多场面话。回到家已经十一点，你躺在床上觉得比上班还累。'
      },
      {
        text: '不去，说家里有事',
        effects: { happy: 6, cha: -4, health: 3 },
        result: '你在家睡到中午，做了顿饭，看了部电影。周一上班时，你发现合影里没有你，群里有人说"某某没来啊"。你说"下次一定"。'
      },
      {
        text: '去，但中途找借口撤了',
        effects: { cha: 2, happy: 4, health: 1 },
        result: '你爬到一半说胃不舒服，打车走了。既不显得不合群，也没把自己耗干。你后来把这一招用在了很多场合。'
      }
    ]
  },
  {
    id: 'y_cry',
    stage: 4,
    age: 25,
    title: '地铁上',
    scene: '晚上十一点，你在地铁上。手机里是家里发来的消息，问你什么时候回去。你忽然就哭了。',
    options: [
      {
        text: '忍着，到站下车',
        effects: { happy: -8, con: 2, amb: 3 },
        result: '你把口罩往上拉了拉，一直低着头。到站后你走进便利店买了瓶水，照了照玻璃，看不出什么。第二天照常上班。'
      },
      {
        text: '不管了，哭完再说',
        effects: { happy: 3, health: 2, cha: 4 },
        result: '你哭了三站路。旁边有人递了张纸巾。你说了句谢谢，声音很哑。下车后你觉得轻了很多——原来在陌生人面前哭，比在熟人面前容易。'
      },
      {
        text: '给家里回电话',
        effects: { happy: 8, family: 6, money: -1 },
        result: '你打了四十分钟。你妈说了很多家里的事，你一句都没插上。挂掉电话你在站台上站了一会儿，然后买了张下个月回家的票。'
      }
    ]
  }
]

/* ============================================================
 *  成年 · 26 — 35 岁
 * ============================================================ */

const ADULT = [
  {
    id: 'a_marry',
    stage: 5,
    age: 28,
    slot: 'marry_pressure',
    title: '催婚',
    scene: '过年回家，饭桌上第七次被问到"有对象了吗"。你妈说："不是催你，是怕你以后一个人。"',
    options: [
      {
        text: '去相亲，找个"合适"的',
        textAlt: ['去相亲，找个"合适"的', '去见，合适就定', '听安排，见几个', '相亲吧，先看条件'],
        effects: { happy: -3, family: 8, money: -4, cha: 2 },
        flags: ['trying_match'],
        result: '你开始见人。第一个问你有没有房，第二个全程看手机，第三个聊得还行，回去之后没有下文。你妈每周问一次进展，你每次都说"在接触"。你不知道这件事要持续多久。'
      },
      {
        text: '坚持等喜欢的那个',
        textAlt: ['坚持等喜欢的那个', '不将就，继续等', '等一个真喜欢的', '宁可单着也不凑合'],
        effects: { happy: 6, family: -8, amb: 5, money: -2 },
        flags: ['waiting_love'],
        result: '你说"我不想将就"。你妈叹了口气，说"那你等吧"。你把这句话记了很多年。你确实在等——只是你不知道，等这件事本身，也会变成一种习惯。'
      },
      {
        text: '先不表态，让他们催去',
        textAlt: ['先不表态，让他们催去', '不接话，由他们说', '打太极，拖过去', '含糊着，先躲这一阵'],
        effects: { happy: -2, family: 2, amb: 2 },
        flags: ['marry_avoid'],
        result: '你既没答应去相亲，也没说等谁。这个态度让你妈很生气，也让你暂时安全。你发现"含糊"是一种很好用的挡箭牌——挡久了，连你自己都不知道想要什么。'
      }
    ]
  },
  {
    id: 'a_compare',
    stage: 5,
    age: 29,
    title: '朋友圈',
    scene: '你刷到同学发的照片：新房、车子、孩子的满月照。你放下手机，环顾了一下自己住的这间房。',
    options: [
      {
        text: '关掉朋友圈，专心过自己的',
        effects: { happy: 6, amb: 3, cha: -2 },
        result: '你关了半年。那半年你踏实了很多。你后来重新打开，发现自己已经不太在意了——不是想通了，是忙起来了。'
      },
      {
        text: '暗暗较劲，更拼命',
        effects: { amb: 9, happy: -8, health: -4, money: 4 },
        result: '你接了更多的活，年底拿了个不错的绩效。你在同学群里发了一句"恭喜"，然后继续加班。你不知道自己在跟谁较劲。'
      },
      {
        text: '约他出来吃饭，真心聊聊',
        effects: { cha: 7, happy: 5, money: -1 },
        result: '饭桌上他说了很多没发出来的事：房贷压力、婆媳矛盾、孩子的病。你听完之后，忽然觉得手机里那些照片变得很轻。'
      }
    ]
  },
  {
    id: 'a_wedding',
    stage: 5,
    age: 31,
    slot: 'wedding',
    title: '婚礼',
    scene: '日子定了。两边家里在讨论办多少桌、在哪儿办、彩礼多少。你和对方坐在中间，插不上话。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love', 'dating'].includes(f)),
    options: [
      {
        text: '按家里的意思，办得风光',
        effects: { money: -18, family: 12, happy: 2, cha: 5 },
        flags: ['married_love'],
        result: '三十桌，你敬酒敬到胃疼。照片很好看。三年后你翻相册，发现自己只记得那天很累。但两边的老人提起那场婚礼，眼睛都是亮的。'
      },
      {
        text: '办小一点，钱留着过日子',
        effects: { money: -2, family: -6, happy: 9, cha: 3 },
        flags: ['married_love'],
        result: '你们请了三十个人，在一个小院子里吃了顿饭。你妈有点不高兴，但你爸说"这样挺好"。那天的风很大，吹乱了你的头发。'
      },
      {
        text: '不办，直接领证旅行',
        effects: { money: -5, family: -10, happy: 12, cha: 4 },
        flags: ['married_love'],
        result: '你们领了证，去了趟海边。回来被两边老人念了半年。你说"日子是我们过的"。这句话你说得很轻，但你是认真的。'
      }
    ]
  },
  {
    id: 'a_wedding_registry',
    stage: 5,
    age: 32,
    slot: 'wedding',
    title: '领证那天',
    scene: '民政局八点半开门，你们七点五十到了，前面已经排了四对。有人举着相机，有人拎着早饭，只有你们俩什么都没准备。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love', 'dating'].includes(f)),
    options: [
      {
        text: '拍张照，发个朋友圈，就算办了',
        effects: { money: -2, happy: 9, cha: 3, family: -3 },
        flags: ['married_love'],
        result: '红底照片拍得很挤，你的头发还翘着。领完证你们在楼下吃了碗面，一共二十六块。五年后你翻出那张照片，发现那天你笑得比后来任何一天都自然。'
      },
      {
        text: '领完证，把两边父母叫来吃顿饭',
        effects: { money: -8, family: 11, happy: 5 },
        flags: ['married_love'],
        result: '你把两家叫到一家馆子，八个人，一桌菜。你爸和对方父亲碰了三次杯，说了三遍"以后就是一家人"。你听着有点想笑，也有点想哭。'
      },
      {
        text: '先不声张，等婚礼办完再说',
        effects: { money: 2, happy: 3, family: -5 },
        flags: ['married_love'],
        result: '证领了，谁也没告诉。接下来的三个月你照常上班，照常被问"什么时候结婚"。你说快了。那种只有自己知道的感觉，维持了不久就被琐事磨掉了。'
      }
    ]
  },
  {
    id: 'a_wedding_gift',
    stage: 5,
    age: 33,
    slot: 'wedding',
    title: '彩礼那笔账',
    scene: '两边家里为了彩礼谈了两轮。第二轮结束时，你母亲在厨房里洗碗洗了很久，水一直开着。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love', 'dating'].includes(f)),
    options: [
      {
        text: '按对方家的数给，自己补上差额',
        effects: { money: -16, family: 5, happy: -4, cha: 4 },
        flags: ['married_love'],
        result: '你把存款动了大半，没跟家里说具体数。婚后头两年你们过得紧，但两边老人见面都客气。你说这笔钱买的是往后几十年的清静，值不值，得看后来。'
      },
      {
        text: '自己出面谈，把话说清',
        effects: { money: -6, cha: 7, family: 2, happy: 3 },
        flags: ['married_love'],
        resolve(s, rng) {
          if (s.cha + s.int * 0.4 + rng() * 30 > 78) {
            return { tone: 'good', effects: { happy: 6 }, text: '你把两边的难处都摆出来，谈了一个下午，最后各让一步。散场时你母亲说"这孩子会办事"。你后来才知道，那顿饭她一直没敢多吃。' }
          }
          return { tone: 'neutral', effects: { happy: -5 }, text: '你说了半天，两边都不满意。最后是按对方的意思办的，你母亲一句话没说。婚礼上她笑得很好，你隔着人群看了她很久。' }
        }
      },
      {
        text: '不给。为这件事吵到要分手',
        effects: { happy: -12, amb: 6, cha: 3, family: -8 },
        flags: ['married_love'],
        result: '那次吵得很凶，说过不下去就散。最后是对方让了一步，你们还是结了。但这件事一直放在那儿，谁都不提，也谁都没忘。'
      }
    ]
  },
  {
    id: 'a_house',
    stage: 5,
    age: 30,
    slot: 'house',
    pinned: true,
    title: '上车',
    scene: '中介说这套房子再不定就没了。首付差三十万。你爸妈在电话那头说："我们这儿还能凑一点。"',
    options: [
      {
        text: '掏空六个钱包，上车',
        effects: { money: -55, family: -14, happy: 6, health: -4, amb: 4 },
        flags: ['mortgage'],
        resolve(s) {
          if (s.money + 55 < 30) {
            return {
              tone: 'bad',
              effects: { happy: -10, family: -6 },
              text: '你借遍了能借的人，还是差一截。最后买了个更远更小的。签合同那天你手在抖，不是因为激动，是因为月供是你工资的六成。'
            }
          }
          return {
            tone: 'good',
            text: '你签了。三十年的贷款，每个月十五号扣款。你从此有了一个属于自己的地址，也有了一根一直绷着的弦。'
          }
        }
      },
      {
        text: '不买，继续租，钱留着',
        effects: { money: 22, happy: -4, cha: 3, amb: 3 },
        flags: ['renter'],
        result: '你把钱放进了基金和存款。后来房价涨了，你算了一下，发现自己"亏"了不少。但你也因此换过三个城市，做过两份想做的事。这本账不能只用钱算。'
      },
      {
        text: '去小城市买一套',
        effects: { money: -25, happy: 8, amb: -10, health: 6, family: 6 },
        flags: ['small_city'],
        result: '你在一个三线城市买了套一百二十平的房子，全款。阳台朝南，能看到山。你把大城市的工牌收进了抽屉。'
      },
      {
        text: '再等等，先不折腾',
        effects: { money: 8, happy: 2 },
        result: '你决定再等两年。这个决定让你在后来的几年里既没有赚到，也没有亏掉。人生里很多选择其实是这样：它只是让时间过去了。'
      }
    ]
  },
  {
    id: 'a_house_parents',
    stage: 5,
    age: 30,
    slot: 'house',
    title: '父母的首付',
    scene: '你妈打电话来，说他们商量好了，把老家的房子抵押，给你凑首付。"你别管我们，我们住得惯。"',
    options: [
      {
        text: '接受',
        effects: { money: -12, family: 8, happy: 4, health: -3 },
        flags: ['mortgage'],
        result: '你上了车。首付里有他们半辈子的积蓄和一笔抵押贷款。你每个月还贷的时候会想起这件事，然后加一会儿班。'
      },
      {
        text: '拒绝，自己攒',
        effects: { amb: 6, money: 5, happy: -2, family: -3, health: -2 },
        flags: ['renter'],
        result: '你说"我自己来"。他们沉默了几秒，说"那也行"。你多租了五年房，房价涨了一轮，你最后买在了更远的地方。'
      },
      {
        text: '接受，但写一张借条',
        effects: { cha: 4, family: 4, money: -10, happy: 2 },
        flags: ['mortgage'],
        result: '你按银行利息写了一张借条。你妈说"一家人算什么利息"，但你还是写了。你用了六年还清，还清那天你请他们吃了顿饭。'
      }
    ]
  },
  {
    id: 'a_house_evicted',
    stage: 5,
    age: 30,
    slot: 'house',
    title: '房东要卖房',
    scene: '房东突然说要卖房，让你一个月内搬走。东西堆了一屋子，你才发现这几年攒了这么多。',
    options: [
      {
        text: '一怒之下买了房',
        effects: { money: -50, happy: 2, health: -5, amb: 5 },
        flags: ['mortgage'],
        result: '你在一个月内看完房、办完贷款、签完合同，仓促得连户型图都没细看。搬进去的第一个冬天，你发现主卧朝北。但你有房了。'
      },
      {
        text: '搬，继续租',
        effects: { money: 5, happy: -4, cha: 4 },
        flags: ['renter'],
        result: '你搬了，第三次搬家。书和杂物装了十二个箱子，扔掉的东西比带走的还多。你开始觉得，租来的房子再怎么收拾，也不完全算家。'
      },
      {
        text: '搬到更远的地方',
        effects: { money: 8, happy: -2, health: -3, family: -2 },
        flags: ['renter'],
        result: '你搬到了通勤一小时的郊区，房租便宜两千。每天六点半出门，晚上八点到家。你用一小时换两千块，换了五年。'
      },
      {
        text: '回老家买一套，先安个心',
        effects: { money: -22, happy: 6, amb: -8, family: 6 },
        flags: ['small_city'],
        result: '你在老家买了套三居，装修好了却一年住不了几天。但你每次回去推开门，都觉得那是你的地方。'
      }
    ]
  },
  {
    id: 'a_house_partner',
    stage: 5,
    age: 30,
    slot: 'house',
    title: '没房就不结',
    scene: '谈了三年，对方家里提了一个条件：要有房。你算了算，手里的钱刚好够一个远郊的首付。',
    options: [
      {
        text: '买',
        effects: { money: -48, happy: 5, health: -4, family: 4 },
        flags: ['mortgage'],
        result: '你买了，也结了。婚礼上你笑得很好。婚后第一年你们因为还贷吵过几次，但每次吵完，看看那个家，又觉得值。'
      },
      {
        text: '不买，去谈清楚',
        effects: { cha: 6, amb: 5, happy: -6, family: -2 },
        flags: ['renter'],
        result: '你去了，说"我可以再等两年"。对方家里不同意，你们分开了。你后来遇到过别人，也买过房。你偶尔会想，当时争的是房，还是别的什么。'
      },
      {
        text: '换个城市',
        effects: { money: -20, happy: 4, amb: -6, health: 3, family: 2 },
        flags: ['small_city'],
        result: '你们一起去了一个房价一半的城市。工作机会少一些，节奏慢一些。你们在那儿买了房，生了孩子。你偶尔会想大城市，想想就算了。'
      },
      {
        text: '分了',
        effects: { happy: -10, amb: 4, cha: 3 },
        flags: ['renter'],
        result: '你说"那就算了"。这句话说出口比想象中容易。你后来一个人住了很多年，房子是租的，日子是自己的。'
      }
    ]
  },
  {
    id: 'a_house_county',
    stage: 5,
    age: 30,
    slot: 'house',
    title: '县城的房',
    scene: '老家县城的房价两年涨了四成。亲戚打电话说"赶紧买一套，以后给孩子"。你在城里还租着房。',
    options: [
      {
        text: '买一套放着',
        effects: { money: -18, happy: 3, amb: -4, family: 4 },
        flags: ['small_city'],
        result: '你买了一套，空着。每年回去住几天，其余时候托亲戚照看。五年后你想卖，挂了半年没人问。'
      },
      {
        text: '不买，钱投自己',
        effects: { int: 5, amb: 6, money: 8, happy: 2 },
        result: '你把钱用去读了在职研究生，也换了两次工作。三十八岁那年你的收入翻了三倍。你后来在工作的城市买了房，比老家那套贵十倍。'
      },
      {
        text: '给父母换套带电梯的',
        effects: { money: -20, family: 10, happy: 8, health: 3 },
        flags: ['small_city'],
        result: '你在县城给父母买了一套带电梯的。你妈在阳台上种了菜，逢人就说"我儿子买的"。你自己还租着房，但你不太在意了。'
      }
    ]
  },
  {
    id: 'a_house_nobuy',
    stage: 5,
    age: 30,
    slot: 'house',
    title: '这本账',
    scene: '你拿 Excel 算了一整晚：租七十年，比买便宜。你把表格发给朋友，他回了三个字"你疯了"。',
    options: [
      {
        text: '坚持不买，钱去投资',
        effects: { money: 15, amb: 6, happy: -3, cha: 3 },
        flags: ['renter'],
        result: '你把首付投了指数基金，也留了一部分现金。十年后你的账户比同龄人的房子值钱，但你搬了六次家，孩子换过三所学校。'
      },
      {
        text: '算了，还是买',
        effects: { money: -45, happy: 4, health: -3, family: 2 },
        flags: ['mortgage'],
        result: '你买了。签合同的时候你想，那张 Excel 可能没错，但人不是靠算账活着的。'
      },
      {
        text: '不买，但把钱花在生活上',
        effects: { happy: 10, money: 2, health: 4, amb: -4 },
        flags: ['renter'],
        result: '你租房，但租得很好：离公司近，有大阳台。你每年出去两趟，学了潜水，买了很好的床垫。你没有资产，但你的日子过得很具体。'
      }
    ]
  },
  {
    id: 'a_pet',
    stage: 5,
    age: 29,
    title: '要不要养只猫',
    scene: '朋友家的猫生了，问你要不要。你一个人住，加班多，但你有点心动。',
    options: [
      {
        text: '养了',
        effects: { happy: 12, money: -3, health: 2, cha: 3 },
        resolve(s, rng) {
          if (rng() > 0.15) {
            return { tone: 'good', text: '它陪你过了十二年。你加班回家，它会在门口等。你后来才明白，那十二年里，是它在照顾你。' }
          }
          return { tone: 'bad', effects: { happy: -6 }, text: '养了三年，你换了城市，托付给了朋友。你后来每次看到橘猫都会停一下。有些责任你当时没准备好。' }
        }
      },
      {
        text: '不养，怕照顾不好',
        effects: { happy: -2, int: 2 },
        result: '你说"我连自己都照顾不好"。朋友笑了。你偶尔会羡慕那些有猫的人，但你也知道，你羡慕的是那种被需要的感觉。'
      },
      {
        text: '先帮朋友代养一周',
        effects: { happy: 6, cha: 2 },
        result: '一周后你把猫还回去了，但你家里留下了一个猫抓板。你没扔。它在墙角放了很多年。'
      }
    ]
  },
  {
    id: 'a_decorate',
    stage: 5,
    age: 31,
    title: '装修',
    scene: '房子拿到了，要装修。你和另一半在"开放式厨房"上吵了第三次。',
    cond: s => (s.flags.includes('mortgage') || s.flags.includes('small_city')) &&
      s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
    options: [
      {
        text: '听对方的',
        effects: { money: -8, happy: 4, cha: 5 },
        result: '你妥协了。开放式厨房油烟很大，你后来常常一边擦墙一边想，当初为什么要让。但你们的关系在那次妥协之后，稳了很多。'
      },
      {
        text: '坚持自己的方案',
        effects: { money: -8, happy: -3, amb: 5 },
        result: '你赢了。厨房很好看，朋友来都夸。只是有一年冬天，对方在客厅说了句"这个家好像是你一个人的"。你记了很久。'
      },
      {
        text: '各退一步，做个半开放',
        effects: { money: -10, happy: 7, cha: 4, int: 3 },
        result: '你们找了个设计师，做了个折中的方案。花了更多钱，但你们后来在那个厨房里做过很多顿饭。妥协有时候不是输，是加钱买了个都能住的地方。'
      }
    ]
  },
  {
    id: 'a_jump',
    stage: 5,
    age: 29,
    title: '一个电话',
    scene: '猎头打来电话，给了一个高 40% 的 offer。新公司你听说过，风评一般，但钱是真的多。',
    cond: s => isStaff(s),
    options: [
      {
        text: '跳',
        effects: { money: 12, amb: 7, happy: -3, health: -5, career: 1 },
        resolve(s, rng) {
          if (s.int + rng() * 40 > 55) return { tone: 'good', effects: { happy: 5 }, text: '新公司确实累，但你适应得快。两年后你成了那边的主力，收入翻了一倍。你回头看，觉得那次跳对了。' }
          return { tone: 'bad', effects: { happy: -10, career: -1 }, text: '去了半年就发现不对：老板换了两任，项目全砍。你成了那个"来了没多久就失业"的人。这段经历在简历上很难解释。' }
        }
      },
      {
        text: '拿 offer 去谈涨薪',
        effects: { money: 7, cha: 5, amb: 5, happy: 2 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 48) return { tone: 'good', text: '你原公司给你涨了 25%，还给了个新 title。你留了下来，带着一种"我被重视了"的踏实。' }
          return { tone: 'bad', effects: { happy: -6 }, text: '主管说"我们这儿有上限"。你留下了，但从那天起，你知道自己在这儿的天花板在哪。' }
        }
      },
      {
        text: '不去，现在挺好',
        effects: { happy: 4, amb: -4, health: 3 },
        result: '你回绝了。后来听说那个岗位三年换了四个人。你偶尔会想那 40% 的工资，但更多时候，你庆幸自己没去。'
      }
    ]
  },
  {
    id: 'a_baby',
    stage: 5,
    age: 32,
    pinned: true,
    title: '要不要孩子',
    scene: '你们讨论过很多次。这次对方说："我准备好了，你呢？"',
    sceneAlt: [
      '你妈把婴儿衣服洗好了，叠在柜子里，说"不催你们，就是先备着"。那个柜子你打开过两次，又关上。',
      '你们去医院做孕前检查，走廊里全是人。有个女人抱着孩子从你身边过，你侧身让了一下，让得有点久。',
      '朋友圈里同龄人开始发第二个孩子的照片。你点了个赞，然后把手机扣在桌上，扣了很久。',
      '伴侣说"再等等吧"，你说好。你们都松了一口气——也都听出了那口气里另外的东西。',
      '你算了一笔账：房贷、双方父母、一个孩子到十八岁。算完你把纸折起来，塞进抽屉最里面。'
    ],
    cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced') && !s.flags.includes('has_child') && !s.flags.includes('kid_pending'),
    options: [
      {
        text: '要',
        textAlt: ['要', '要一个', '那就生', '开始准备'],
        effects: { money: -12, happy: 8, health: -5, family: 10 },
        flags: ['has_child'],
        result: '孩子出生那天，你在产房外面站了很久。抱到手里的那一刻，你忽然理解了很多人说不清的那种东西。接下来的三年，你没睡过一个整觉。'
      },
      {
        text: '再等等，先过两年二人世界',
        textAlt: ['再等等，先过两年二人世界', '缓两年再说', '先过几年两个人的日子', '往后推一推'],
        effects: { happy: 6, money: 6, family: -4 },
        flags: ['kid_pending'],
        result: '你们说"再等两年"。两年过去了，谁都没提。第三年你妈问了一次，你说"在计划"。计划这两个字，被你们用来盖住了很多没想清楚的事。'
      },
      {
        text: '不要，我们商量好了',
        textAlt: ['不要，我们商量好了', '不要，两个人过', '想清楚了，不要', '决定不生'],
        effects: { happy: 7, money: 14, family: -12, cha: 3 },
        flags: ['dink'],
        result: '你们成了一对"丁克"。两边老人念了很多年，后来也不念了。你们把钱花在旅行和房子上，把时间花在彼此身上。你偶尔会想，老了会不会后悔。'
      }
    ]
  },
  {
    id: 'a_female_promo',
    stage: 5,
    age: 31,
    title: '那个位置',
    scene: '部门要提一个主管，你和另一个人都在名单上。领导私下说："你能力够了，但接下来几年你的重心……"他没说完。',
    cond: s => s.gender === 'f' && !s.flags.includes('has_child'),
    options: [
      {
        text: '明确说"我要这个位置"',
        effects: { amb: 9, cha: 7, happy: 2, health: -5 },
        resolve(s, rng) {
          if (s.cha + s.amb * 0.5 + rng() * 35 > 62) {
            s.career += 2
            return { tone: 'good', effects: { money: 10, happy: 10 }, text: '你说"我未来三年没有生育计划，即使有，也不影响我的工作"。这句话你说得很平静。你拿到了那个位置。后来你也确实做到了。' }
          }
          return { tone: 'bad', effects: { happy: -10, amb: -3 }, text: '领导说"再锻炼锻炼"。位置给了另一个人。你在洗手间待了十分钟。你不知道该怪谁——你只知道，有一堵墙是软的，你撞上去没有声音。' }
        }
      },
      {
        text: '先把孩子生了再说',
        effects: { happy: 4, family: 6, amb: -6, career: -1 },
        flags: ['has_child'],
        result: '你退出了竞争。两年后孩子上了幼儿园，你重新回到职场，发现那个位置已经有人了，而且做得不错。你从另一个方向重新开始。'
      },
      {
        text: '不争了，做好手头的事',
        effects: { happy: 5, amb: -5, health: 3 },
        result: '你没去争。有人说你"没有野心"。你没解释。你只是觉得，为这个位置付出的代价，你暂时不想付。'
      }
    ]
  },
  {
    id: 'a_male_child',
    stage: 5,
    age: 31,
    title: '什么时候要',
    scene: '饭桌上，你爸第三次问："你们到底什么打算？"你妈在旁边给你夹菜，眼睛也看着你。',
    cond: s => s.gender === 'm' && s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced') && !s.flags.includes('has_child'),
    options: [
      {
        text: '认真说"我们有我们的节奏"',
        effects: { family: -5, cha: 6, happy: 4, amb: 3 },
        result: '你说完，饭桌安静了。你爸放下筷子，说"我不管了"。那顿饭吃得很难受，但之后他们真的很少再提。你第一次觉得，边界是要自己划的。'
      },
      {
        text: '敷衍过去，"快了快了"',
        effects: { family: 3, happy: -4 },
        result: '你说了第三次"快了"。他们满意了。你回到房间，跟对方对视了一眼，两个人都笑了，笑得有点苦。'
      },
      {
        text: '顺着他们，提前要了',
        effects: { money: -10, happy: 4, family: 10, health: -4, amb: -3 },
        flags: ['has_child'],
        result: '孩子提前两年来了。你们手忙脚乱，经济也紧张。但你爸抱着孩子的时候，脸上的褶子都笑开了。你忽然觉得，这个决定不全是为他们做的。'
      }
    ]
  },
  {
    id: 'a_return',
    stage: 5,
    age: 32,
    title: '回来以后',
    scene: '产假结束，你回到公司。你原来的位置有人了，你被安排到一个"更合适"的岗位。',
    cond: s => s.gender === 'f' && s.flags.includes('has_child'),
    options: [
      {
        text: '接受，从头做起',
        effects: { happy: -8, amb: 5, career: -1, family: 5 },
        result: '你没说什么，把新岗位做了一年。一年后你发现，这个边缘部门反而让你有了更多自主权。你在那儿做出了一个后来很重要的东西。'
      },
      {
        text: '找领导谈，要一个明确的说法',
        effects: { cha: 6, amb: 8, happy: -3 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 55) return { tone: 'good', effects: { career: 1, happy: 6 }, text: '领导承认是"安排上的问题"，半年后把你调回了核心业务。这个结果不算完美，但它是你自己争来的。' }
          return { tone: 'bad', effects: { happy: -8 }, text: '领导说了很多漂亮话，什么也没变。你后来明白了：有些公司只会用嘴留人。' }
        }
      },
      {
        text: '辞职，换一家',
        effects: { career: 1, money: -5, happy: 4, amb: 6 },
        result: '你休整了两个月，然后去了另一家公司。新公司没人知道你生过孩子，你从第一天起就是个"正常员工"。这种匿名感，你意外地喜欢。'
      }
    ]
  },
  {
    id: 'a_insomnia',
    stage: 5,
    age: 32,
    title: '凌晨四点',
    scene: '你已经连续两周睡不着了。躺在床上，脑子里全是白天没做完的事。天快亮的时候才迷迷糊糊睡过去。',
    options: [
      {
        text: '去看医生',
        effects: { money: -2, health: 8, happy: 5 },
        result: '医生问了很多问题，最后说"焦虑状态"。你拿了药，也第一次认真跟人讲了你的压力。走出医院那天阳光很好，你在门口站了一会儿。'
      },
      {
        text: '开始跑步',
        effects: { con: 6, health: 9, happy: 6, money: -1 },
        result: '你每天下班跑五公里。跑到第三周，你发现自己能在十二点前睡着了。你没有解决那些问题，但你有了一副能扛住它们的身体。'
      },
      {
        text: '扛着，等这阵过去',
        effects: { health: -10, happy: -8, amb: 4 },
        result: '"这阵"过去了，下一阵来了。你后来习惯了三四个小时的睡眠，也习惯了白天那种飘着的感觉。你不知道这算不算正常。'
      }
    ]
  },
  {
    id: 'a_tempt',
    stage: 5,
    age: 33,
    title: '一个很懂你的人',
    scene: '公司来了个新人，跟你聊得来。你们加班到很晚，一起吃过三次饭。有些东西在往一个方向走。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
    options: [
      {
        text: '主动拉开距离',
        effects: { happy: -4, cha: 4, family: 8, amb: 3 },
        result: '你找了个理由，不再单独吃饭。对方很聪明，也懂了。你没跟任何人提过这件事。有些战争是在心里打完的，没有人给你发勋章。'
      },
      {
        text: '继续，反正也没做什么',
        effects: { happy: 6, family: -6, cha: 5 },
        resolve(s, rng) {
          if (rng() > 0.5) return { tone: 'neutral', text: '半年后对方调走了。什么都没发生，但你在那半年里，对家里冷淡了很多。这种消耗是看不见的。' }
          return { tone: 'bad', effects: { happy: -14, family: -14 }, text: '事情发生了。后来被发现了。家里闹了很久。你没有离婚，但那之后的每一年，都比前一年更安静。' }
        }
      },
      {
        text: '跟另一半坦白，说你有点动摇',
        effects: { cha: 7, family: 5, happy: -6, amb: 4 },
        result: '你说完，对方沉默了很久，然后说"谢谢你告诉我"。你们谈了一整夜。那之后你们的关系反而真实了很多——不是更好，是更真。'
      }
    ]
  },
  {
    id: 'a_checkup',
    stage: 5,
    age: 34,
    slot: 'health_alarm',
    title: '报告上有个箭头',
    scene: '体检报告出来，有一项后面标了个向上的箭头。医生说不严重，建议复查。你把单子折起来放进包里。',
    sceneAlt: [
      '单位组织体检，你本来想请假。抽血的时候护士拍了拍你的胳膊说"你这血管不好找，平时是不是熬夜"。你没答，看着血一点点注满管子。',
      '报告是电子版，凌晨一点弹出来的。你在床上点开，一项一项往下翻，翻到那个箭头的时候，手指停住了。',
      '医生看着屏幕说"这个指标，你这个年龄很常见"。他说"常见"的时候语气很轻松，你却在那两个字上停了三秒。',
      '同事在群里晒体检报告，配文"又老了一岁"。你笑着回了个表情，然后打开自己的那份，发现你比他多两个箭头。',
      '去年这一项就在边缘，医生说"注意一下，明年再看"。今年它越过了那条线。一年的时间，原来只够一件事悄悄发生。',
      '你把报告塞进包里，回家路上买了杯奶茶。喝到一半想起来报告上的箭头，把剩下的半杯扔了。走了两步，又觉得这动作挺可笑的。'
    ],
    options: [
      {
        text: '认真复查，开始调整作息',
        textAlt: ['认真复查，开始调整作息', '预约复查，把夜宵戒了', '去查清楚，顺便改改活法', '挂号，然后早睡'],
        effects: { money: -3, health: 12, happy: 3 },
        flags: ['health_wakeup'],
        result: '你戒了夜宵，每周跑三次。三个月后指标回去了。医生说"你运气好，发现得早"。你把那张单子贴在了冰箱上，贴了两年。'
      },
      {
        text: '先放着，忙完这阵再说',
        textAlt: ['先放着，忙完这阵再说', '收起来。等项目结束', '不查了，等有症状再说', '先不管它，往后推一推'],
        effects: { health: -12, happy: -2 },
        flags: ['health_ignore'],
        result: '这阵忙完了，又有下一阵。那张单子在包里放软了，字也磨掉了。身体不说话，它只是记账。'
      },
      {
        text: '不复查，但开始健身',
        textAlt: ['不复查，但开始健身', '懒得查，办张卡动起来', '先自己练，指标以后再说', '不听医生的，听教练的'],
        effects: { health: 7, money: -2, happy: 5, con: 5 },
        result: '你办了张年卡，去了三十次，然后就不去了。但那三十次不是白去的，你的身体记得被使用过的感觉。'
      }
    ]
  },
  {
    id: 'a_night_chest',
    stage: 5,
    age: 30,
    slot: 'health_alarm',
    title: '半夜疼醒',
    scene: '凌晨三点，胸口一阵闷疼把你弄醒了。你坐起来靠在床头，缓了十几分钟才敢重新躺下。第二天照常上班。',
    sceneAlt: [
      '你翻了个身，心脏忽然重重跳了两下，像有人在里面敲。你伸手摸脉搏，数到一百二，手是凉的。',
      '那阵疼不是尖锐的，是那种钝钝的压着，从胸口一直串到左肩。你在黑暗里坐着，脑子里过了很多事，天就亮了。',
      '你跟同事提了一句，他说"你这年纪不至于，肯定是累的"。你点头，可那句"不至于"你并不真的信。'
    ],
    options: [
      {
        text: '请假去查，别再赌',
        textAlt: ['请假去查，别再赌', '第二天就挂号', '做个心电图，求个安心', '不猜了，去医院'],
        effects: { money: -3, health: 12, happy: 3 },
        flags: ['health_wakeup'],
        result: '背了二十四小时的心电，查出来是一段早搏，不致命，但医生让你把夜里那两杯浓咖啡停了。你停了，也第一次认真记下自己每天睡几个小时。'
      },
      {
        text: '不查。这个年纪谁不疼一下',
        textAlt: ['不查。这个年纪谁不疼一下', '不去了，睡少点而已', '忍忍就过去了', '过几天就好了吧'],
        effects: { health: -13, happy: -2 },
        flags: ['health_ignore'],
        result: '后来它又疼过几次，一次比一次短。你学会了疼的时候不动、慢慢呼吸，等它过去。你把这件事排在"以后再说"那一栏，那一栏已经排了很长。'
      },
      {
        text: '先把烟和夜里的咖啡停了',
        textAlt: ['先把烟和夜里的咖啡停了', '不查，先把作息扳回来', '戒掉夜里的那两杯', '自己先改，一个月没好转再去'],
        effects: { health: 8, happy: 2, con: 4 },
        result: '头两周很难，你半夜醒来会摸手机。一个月后疼的次数少了，你就更不想去查了——有些好转，恰好是拖延最好的借口。'
      }
    ]
  },
  {
    id: 'a_dizzy',
    stage: 5,
    age: 33,
    slot: 'health_alarm',
    title: '眼前一黑',
    scene: '你蹲下去捡笔，站起来的时候眼前全黑，手扶住了桌子才没倒。对面同事问"你没事吧"，你说没事。',
    sceneAlt: [
      '地铁到站你起身，眼前忽然像有人拉了帘子，耳朵也嗡的一声。你抓着扶手站了两站，下来在站台坐了十分钟。',
      '早上洗脸，抬头看镜子，发现自己脸色是灰的。你凑近看了看，忽然想不起来上一次照镜子是什么时候。',
      '连着一个月，你每天下午三点开始发虚，手抖，非得吃点甜的才缓过来。你把这个规律告诉了同事，她说"我也是"。'
    ],
    options: [
      {
        text: '下午就去医院，抽了血',
        textAlt: ['下午就去医院，抽了血', '当天挂号，查个明白', '不猜了，去抽血', '请半天假，做个检查'],
        effects: { money: -2, health: 11, happy: 3 },
        flags: ['health_wakeup'],
        result: '查出来是贫血，还有点低血糖。医生问"你是不是经常不吃早饭"，你没说话。回去的路上你买了鸡蛋和牛奶，第二天真的吃了。'
      },
      {
        text: '包里放两颗糖，就当解决了',
        textAlt: ['包里放两颗糖，就当解决了', '随身带糖，别让自己倒', '吃点甜的就行', '兜里备着巧克力'],
        effects: { health: -10, happy: 1 },
        flags: ['health_ignore'],
        result: '糖很管用，一含就好。你后来包里常备，也习惯了每天下午那阵发虚。你把它当成了一种天气，来了就等它过去。'
      },
      {
        text: '开始按时吃饭，别的先不管',
        textAlt: ['开始按时吃饭，别的先不管', '先把三顿饭吃上', '不查，但从今天开始吃早饭', '调作息，先把饭吃规律'],
        effects: { health: 6, happy: 3, con: 3 },
        result: '你把早饭列进了日程表，跟开会一样。头一个月执行得不错，第二个月开始跳。但至少你现在知道，那阵黑不是凭空来的。'
      }
    ]
  },
  {
    id: 'a_teeth',
    stage: 5,
    age: 35,
    slot: 'health_alarm',
    title: '三颗牙',
    scene: '牙疼了半年，靠止痛药顶着。这次医生看完片子说，三颗保不住，还得种。',
    sceneAlt: [
      '你捂着半边脸坐在牙科的椅子上，医生说"你这拖了不止一年吧"。你想了想，第一次疼是在出差那趟。',
      '报价单打出来是五位数。你盯着那个数看了一会儿，忽然想到这半年花在止痛药上的钱也不少。',
      '医生说"先消炎，下周拔"。你问能不能晚点，他说可以，但"晚点只会更贵"。'
    ],
    options: [
      {
        text: '拔，该种就种',
        textAlt: ['拔，该种就种', '按医生说的全做', '一次弄干净', '花钱买回来'],
        effects: { money: -14, health: 10, happy: 4 },
        flags: ['health_wakeup'],
        result: '拔三颗，种两颗，前后跑了七趟。最后一天医生让你咬合试试，你咬了一下，忽然发现这半年你都在用另一边吃饭，差点忘了正常是什么感觉。'
      },
      {
        text: '先拔最疼的那颗，剩下的以后说',
        textAlt: ['先拔最疼的那颗，剩下的以后说', '只处理最急的', '先拔一颗，缓缓', '能拖就再拖一年'],
        effects: { money: -4, health: -6, happy: -2 },
        flags: ['health_ignore'],
        result: '拔完那颗，确实不疼了。剩下两颗在片子上还在那儿，像两笔没还的账。你每年都想起来一次，每次都往后推。'
      },
      {
        text: '换家便宜的，先止痛',
        textAlt: ['换家便宜的，先止痛', '先消炎，别花那个钱', '开点药，回头再说', '不做种植，能嚼就行'],
        effects: { money: -2, health: 2, happy: 1 },
        result: '消炎药吃了两周，疼是压住了，但那边再也咬不动硬东西。你后来习惯了用左边嚼，也习惯了点菜的时候避开需要啃的东西。'
      }
    ]
  },
  {
    id: 'a_parents_move',
    stage: 5,
    age: 34,
    title: '他们想搬过来',
    scene: '父母说想搬到你这边住，帮你带孩子，也方便看病。你家里只有两间房。',
    cond: s => s.flags.includes('has_child') || s.family > 55,
    options: [
      {
        text: '接过来一起住',
        effects: { family: 10, happy: -4, money: -6, health: 3 },
        result: '家里一下子挤了。你妈做饭很好吃，你爸每天早上六点起来买菜。但你们也为孩子的教育吵过很多次。你后来学会了在门口深呼吸三次再进门。'
      },
      {
        text: '在附近租一间',
        effects: { money: -12, family: 6, happy: 6 },
        result: '一碗汤的距离。他们随时能来，也随时能走。这个方案花了钱，但保住了所有人。你后来跟朋友说，这是你做过最值的一笔支出。'
      },
      {
        text: '婉拒，说现在不方便',
        effects: { family: -10, happy: -5, money: 2 },
        result: '你说"等孩子大一点"。他们在电话那头说"行，我们不添麻烦"。挂了电话你坐了很久。你知道他们在老家，两个人，一间空房子。'
      }
    ]
  },
  {
    id: 'a_car',
    stage: 5,
    age: 31,
    title: '买不买车',
    scene: '你算了算，买车加养车一年要三万。但不买的话，每次回家都要抢票。',
    options: [
      {
        text: '买',
        effects: { money: -12, happy: 6, cha: 4, health: -2 },
        result: '你提了辆十几万的车。第一次自己开回老家，你在高速上开了四个小时，放着歌。那四个小时你觉得很自由。后来堵在早晚高峰的时候，你就不这么想了。'
      },
      {
        text: '不买，打车更划算',
        effects: { money: 6, happy: -2, health: 2 },
        result: '你算过账，确实打车划算。你把这个结论讲给很多人听，他们都说"你不懂"。你后来越来越少回老家了。'
      },
      {
        text: '买个二手的过渡',
        effects: { money: -5, happy: 4, cha: 2 },
        result: '你买了辆八年的二手车。它有点毛病，空调不太凉，但你开着它跑了很多地方。有一年冬天它半路抛锚，你在路边等拖车，居然觉得挺有意思。'
      }
    ]
  },
  {
    id: 'a_therapy',
    stage: 5,
    age: 33,
    title: '第一次走进那间屋子',
    scene: '你在网上预约了心理咨询。坐在沙发上，对面的人问你："今天想聊点什么？"你张了张嘴，突然不知道该从哪说起。',
    options: [
      {
        text: '从头讲，讲了六次',
        effects: { money: -6, happy: 12, health: 5, cha: 4 },
        result: '你讲了六次，哭了两次。咨询师没给你答案，但她说了一句话你一直记得："你不是不够好，你只是太累了。"你后来还去了很多次。'
      },
      {
        text: '去了两次，觉得没用，停了',
        effects: { money: -2, happy: -2, int: 3 },
        result: '你觉得"就是聊天"。停了之后你还是那样，只是知道了有这么个地方。很多年后你又去了一次，那次才聊进去。'
      },
      {
        text: '临时改口，说"其实没什么事"',
        effects: { money: -1, happy: -6, cha: 3 },
        result: '你聊了五十分钟的工作。走出去的时候你觉得浪费了钱。但你回家路上忽然想哭，这才是你真正想聊的东西。'
      }
    ]
  },
  {
    id: 'a_side',
    stage: 5,
    age: 30,
    title: '副业',
    scene: '同事在做副业，一个月多挣五千。他说："你也会点东西，为什么不试试？"',
    options: [
      {
        text: '做，从接小单开始',
        effects: { money: 5, amb: 8, health: -6, happy: 3 },
        resolve(s, rng) {
          if (s.amb + s.int * 0.4 + rng() * 35 > 55) return { tone: 'good', effects: { money: 10, amb: 4 }, text: '一年后副业收入超过了主业的一半。你没有辞职，但你在公司说话的声音大了一点。你知道自己有退路了。' }
          return { tone: 'bad', effects: { happy: -6, money: -2 }, text: '做了半年，接了四个单，赚了两千，赔了时间。你后来不做了。但你知道了自己的时间在市场值多少钱，这个认知不亏。' }
        }
      },
      {
        text: '不做，把精力放在主业上',
        effects: { amb: 5, money: 4, health: 3, happy: 2 },
        result: '你专攻主业，年底升了一级。你看着同事熬夜做副业，觉得不划算。你们后来走了两条完全不同的路，都还行。'
      },
      {
        text: '先学着，不急着变现',
        effects: { int: 6, happy: 4, money: -2 },
        result: '你花了一年时间学，没赚一分钱。第二年你做出了一个东西，虽然没火，但你把它放在了简历里。它后来帮你拿到过一个 offer。'
      }
    ]
  },
  {
    id: 'a_oldfriend',
    stage: 5,
    age: 32,
    title: '老同学',
    scene: '一个多年没见的同学突然联系你，说他手上有个资源，想跟你合作。他开着不错的车，说话很有底气。',
    options: [
      {
        text: '信他，投钱进去',
        effects: { money: -15, amb: 8, happy: 3 },
        resolve(s, rng) {
          if (s.luk + rng() * 50 > 78) return { tone: 'good', effects: { money: 30, happy: 10 }, text: '这次是真的。两年后你分到了一笔不小的钱。你后来常说，人这一辈子总要有一次相信别人的时候。' }
          return { tone: 'bad', effects: { money: -10, happy: -16, cha: -5 }, text: '钱进去了，人就联系不上了。你报了警，警察说这类案子很多。你没告诉家里。那笔钱你用了五年才缓过来。' }
        }
      },
      {
        text: '先考察，见几次再说',
        effects: { int: 5, cha: 5, money: -1 },
        result: '你见了他三次，查了他说的公司。发现有些地方对不上。你没投，也没拆穿，只是慢慢淡了。半年后听说他找了别人，出了事。'
      },
      {
        text: '直接拒绝',
        effects: { money: 2, cha: -3, happy: -2 },
        result: '你说"我不懂这个，不碰"。他笑了笑说"你还是老样子"。你不知道这是夸还是贬。但你保住了钱。'
      }
    ]
  },
  {
    id: 'a_layoff',
    stage: 5,
    age: 35,
    title: '人事找你',
    scene: '下午三点，HR 发消息让你去一趟会议室。你走过去的时候，看见走廊里还有另外两个人。',
    cond: s => isStaff(s),
    options: [
      {
        text: '冷静谈赔偿，争取最多',
        effects: { money: 6, cha: 5, amb: 5, happy: -6 },
        resolve(s, rng) {
          if (s.cha + s.int * 0.3 + rng() * 35 > 55) return { tone: 'good', effects: { money: 8 }, text: '你算清楚了 N+1，还争取到了三个月的社保和一笔签字费。走出大楼的时候你有点恍惚，但你手里握着一份还不错的协议。' }
          return { tone: 'neutral', text: '你签了标准方案。没有多，也没有少。你在楼下坐了一个小时，然后给家里打电话说"今天早点回"。' }
        }
      },
      {
        text: '争，说这个决定不公平',
        effects: { happy: -10, amb: 6, cha: 2 },
        result: '你说了很久，HR 一直在重复"这是公司的决定"。你最后什么也没争到，还多耗了两个月。你后来明白，跟流程讲道理是没用的。'
      },
      {
        text: '签了，当天就走',
        effects: { money: 4, happy: -4, amb: 7, health: 3 },
        result: '你签完字，收了东西，没有告别。走出大楼的时候是下午四点，太阳很好。你站在路边，忽然有一种奇怪的轻松——你已经很久没有在白天见过太阳了。'
      }
    ]
  },
  {
    id: 'a_sick_parent',
    stage: 5,
    age: 35,
    title: '一个电话',
    scene: '凌晨两点，老家打来电话：父亲住院了，情况不太好。',
    options: [
      {
        text: '第二天一早就回去',
        effects: { money: -5, family: 10, happy: -6, health: -4, amb: -3 },
        result: '你请了假，坐了最早的一班高铁。到医院时他刚醒，看见你就说"你怎么回来了，不耽误工作吗"。你说"不耽误"。你在那儿待了十天。'
      },
      {
        text: '先打钱，等周末再回',
        effects: { money: -8, family: 2, happy: -12, amb: 3 },
        result: '你转了钱，打电话问了情况。周末回去的时候，他已经能下床了。他说"没事，你忙你的"。你在病房里坐了一下午，什么也没说。'
      },
      {
        text: '把工作交接了，回去待一个月',
        effects: { money: -10, family: 14, happy: 2, career: -1, health: -3 },
        result: '你请了一个月假。那一个月你每天去医院，学会了怎么给他翻身、怎么跟医生沟通。你回来的时候，公司已经把你的项目给了别人。但你不后悔。'
      }
    ]
  },
  {
    id: 'a_move_city',
    stage: 5,
    age: 34,
    title: '换个城市',
    scene: '有个机会在另一个城市，待遇差不多，但房价低一半。你在现在的城市待了十年。',
    options: [
      {
        text: '走，重新开始',
        effects: { money: 10, happy: 6, cha: -6, amb: 5, health: 5 },
        result: '你搬了。前半年很难，没有朋友，听不懂方言。但一年后你在新城市买了房，通勤二十分钟。你开始有时间做饭了。'
      },
      {
        text: '留下，这里有你的全部',
        effects: { happy: 3, money: -3, cha: 4, amb: -3 },
        result: '你没走。你的朋友、你的习惯、你熟悉的那家面馆都在这里。你后来想，人这一辈子能在一个地方待够久，也是一种本事。'
      },
      {
        text: '两地跑一年再决定',
        effects: { money: -4, health: -6, happy: -3, int: 3 },
        result: '你两边跑了一年，高铁票攒了一沓。最后你选择了留下。那一年的疲惫让你明白，你其实早就知道自己要什么，只是想再确认一次。'
      }
    ]
  },
  {
    id: 'a_lend',
    stage: 5,
    age: 33,
    title: '借钱',
    scene: '一个从高中就认识的朋友找你，说周转不开，借二十万，半年就还。他说话的时候一直在搓手。',
    options: [
      {
        text: '借',
        effects: { money: -20, cha: 6, happy: 4 },
        resolve(s, rng) {
          if (rng() > 0.45) {
            return {
              tone: 'good',
              effects: { money: 22, cha: 4 },
              text: '半年后他真的还了，还多给了利息。你没收利息，收了一顿饭。这顿饭之后，你们的关系从朋友变成了"能托付事的人"。'
            }
          }
          return {
            tone: 'bad',
            effects: { happy: -12, cha: -4 },
            text: '半年后他说再等等。一年后他换了手机号。你没有去起诉他，因为你算过，那点钱不够买断你们十几年的交情——但它确实买断了。'
          }
        }
      },
      {
        text: '不借，说自己也紧',
        effects: { cha: -5, happy: -4, money: 2 },
        result: '你说完那句话，电话那头安静了三秒。他说"没事没事"，然后你们就很少联系了。你有时候会想，那天如果借了呢。'
      },
      {
        text: '借一半，说清楚不用急着还',
        effects: { money: -10, cha: 3, happy: 2 },
        result: '你转了十万，说"先拿着"。他愣了一下，说谢谢。这笔钱后来没还，但你们的交情一直在。你把这个叫"花钱买了个心安"。'
      }
    ]
  },
  {
    id: 'a_project',
    stage: 5,
    age: 32,
    slot: 'work_bet',
    title: '一个没人想接的摊子',
    scene: '一个做了两年、换了三任负责人的项目，现在问你要不要接。做好了是翻身，做砸了是背锅。',
    sceneAlt: [
      '周会上领导把这个项目提了一下，说完环视一圈。没有人接话。你发现所有人都在低头看自己的本子，包括平时最爱揽事的那两个。',
      '邮件是抄送你的，正文只有一句"请相关同事评估"。附件两百多页，你翻到第四十页就明白了：这个项目不是难，是没人愿意签字。',
      '前任负责人的交接文档只有三页，最后一页写着"遗留问题另附"。没有另附。他现在在另一家公司，朋友圈刚发了新办公室的照片。',
      '你手上的活已经排到年底了。领导说"我知道你忙，但这个真的只能你上"。这句话你去年听过一次，那次你信了。',
      '电梯里领导"顺便"提了一句："那个项目你想不想试试？"电梯到楼层，门开了，他说"你考虑一下"，走了。你站在电梯里没动，门又关上了。',
      '这个项目在公司里有个外号，叫"那个坑"。你在茶水间听到两个同事聊它，看见你进来就停了。其中一个说"哎正好你来了"，另一个笑了。'
    ],
    options: [
      {
        text: '接',
        textAlt: ['接', '接下来，赌一把', '硬着头皮签', '行，我上'],
        effects: { amb: 10, health: -5, happy: -5 },
        flags: ['took_risk'],
        resolve(s, rng) {
          const p = s.int * 0.3 + s.amb * 0.3 + s.cha * 0.2 + s.luk * 0.2 + rng() * 30
          if (p > 66) {
            s.career += 3
            return {
              tone: 'good',
              effects: { money: 18, happy: 12, amb: 8 },
              text: '你花了七个月，把它从一堆烂账做成了公司当年的样板。年底晋升名单上有你的名字。那一刻你想的是：还好当时没怂。'
            }
          }
          s.career -= 1
          return {
            tone: 'bad',
            effects: { money: -4, happy: -12, amb: -5 },
            text: '项目还是黄了。你成了第四个负责人，也是被记住的那个。你在离职面谈里说"我尽力了"，对方点点头，说"我知道"。'
          }
        }
      },
      {
        text: '不接，守住现在的位置',
        textAlt: ['不接，守住现在的位置', '推掉。先守住手上这些', '摇头。眼下这点东西不能丢', '算了，别把现有的也搭进去'],
        effects: { happy: 3, amb: -5, money: 2 },
        result: '你说家里有事，推了。项目给了别人，半年后那个人升了。你看着他的工位，心里说不上是后悔还是庆幸。'
      },
      {
        text: '趁这个机会跳槽',
        textAlt: ['趁这个机会跳槽', '拿它当理由，换家公司', '不如自己走', '正好，简历更新一下'],
        effects: { money: 10, amb: 7, cha: 4, happy: 2, career: 1 },
        result: '你把这段经历包装成了"主导跨部门项目"。新公司给了你一个更好的 title。你发现，有时候离开本身就是一种晋升。'
      }
    ]
  },
  {
    id: 'a_rescue',
    stage: 5,
    age: 30,
    slot: 'work_bet',
    cond: s => isStaff(s),
    title: '组里只剩两个人',
    scene: '组里七个人走了五个，交付日期没变。领导说"你先顶一下，人我再想办法"，这句话他说了三个月。',
    sceneAlt: [
      '周会上又走了一个。散会时领导把你留下，说"现在能扛的只有你"。你没接话，因为上一次他说完这句，你的活多了一倍。',
      '招聘网站上你们组那个岗位还挂着，挂了半年，一个面试都没有。你看着它，明白"人我再想办法"是什么意思。',
      '你把三个人的交接文档整理成了一个文件夹，命名的时候想了半天，最后叫"临时"。这个"临时"已经临时了七个月。'
    ],
    options: [
      {
        text: '顶。连着三个月没在十二点前睡',
        textAlt: ['顶。连着三个月没在十二点前睡', '扛下来，就当练手', '先接下来，别让组散了', '撑着，我看能撑到什么时候'],
        effects: { amb: 9, health: -9, happy: -6 },
        flags: ['took_risk'],
        resolve(s, rng) {
          const p = s.amb * 0.35 + s.health * 0.25 + s.int * 0.2 + rng() * 32
          if (p > 64) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 9, happy: 7, cha: 4 },
              text: '东西按时交了，客户续了第二年。庆功宴上你没怎么说话，你在算自己还能这样撑几年。后来补了人，你成了这个组默认的负责人。'
            }
          }
          return {
            tone: 'bad',
            effects: { health: -5, happy: -10, amb: -4 },
            text: '交付拖了两个月，客户罚了款。复盘会上领导说"资源确实不够"，但他没说是谁让资源不够。你那天回去睡了十四个小时。'
          }
        }
      },
      {
        text: '摆条件：要人，要钱，白纸黑字',
        textAlt: ['摆条件：要人，要钱，白纸黑字', '谈条件，别空口夸我', '要人就接，不然按现有人手排', '先谈加薪，再谈顶班'],
        effects: { cha: 6, int: 4, happy: 2 },
        resolve(s, rng) {
          if (s.cha + s.career * 3 + rng() * 30 > 76) {
            s.career += 1
            return {
              tone: 'good',
              effects: { money: 7, amb: 5 },
              text: '你要了两个人、一次调薪、一份写清节点的排期。领导签了。你后来才明白，会开口的人不是更难缠，是更便宜——至少不用替你收拾烂摊子。'
            }
          }
          return {
            tone: 'neutral',
            effects: { happy: -5, amb: -3 },
            text: '领导说"我尽量"。两个月后你还是一个人干三个人的活，只是周报上多了一行"已反馈资源问题"。那行字谁都没再看。'
          }
        }
      },
      {
        text: '不顶。按两个人的速度做，做不完就报延期',
        textAlt: ['不顶。按两个人的速度做，做不完就报延期', '照实排期，延期就写延期', '只做做得了的部分', '不接，让排期自己说话'],
        effects: { amb: -5, happy: 3, career: -1 },
        result: '你把排期重排了一遍，发在群里，没人回。到期那天果然没交上，客户骂的是公司，不是你。你保住了身体，也被记了一笔"不够担当"。'
      }
    ]
  },
  {
    id: 'a_dual',
    stage: 5,
    age: 33,
    slot: 'work_bet',
    cond: s => isStaff(s),
    title: '一个人的两个人的活',
    scene: '隔壁组裁掉一个人，他的活分给了你。工资没变，title 没变，只有周报里的条目多了十一项。',
    sceneAlt: [
      '交接只有一个下午。他把二十几个文件丢给你，说"都在里面了，有问题问我"。一周后他的账号就登不上了。',
      '领导在群里说"这块以后由你兼着"，后面跟了一个握手的表情。群里十几个人，没有一个问工资怎么算。',
      '你算了一下，现在手上同时有四个活。上一次有四个活，是三年前，那时候你还有周末。'
    ],
    options: [
      {
        text: '先扛着，等年底一起算',
        textAlt: ['先扛着，等年底一起算', '干着，年底再提', '接下来，看他记不记这份情', '不吵，先做出结果'],
        effects: { amb: 6, health: -7, happy: -5 },
        flags: ['took_risk'],
        resolve(s, rng) {
          if (s.cha + s.career * 4 + rng() * 30 > 78) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 11, happy: 6 },
              text: '年底调薪，你的涨幅是全组最高的。领导说"今年辛苦你了"。你点头，心里知道这句话明年还会再说一次，只是不知道还配不配得上这个涨幅。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -2, health: -5, happy: -9 },
            text: '年底调薪名单里没有你。领导说"今年预算紧，明年一定"。你没吵，回去把简历改了一遍，改完也没投。'
          }
        }
      },
      {
        text: '把多出来的活列成一张表，找老板谈',
        textAlt: ['把多出来的活列成一张表，找老板谈', '列清单，一条条问他归谁', '算清工时，摊到桌上', '拿数据说话，不谈感受'],
        effects: { cha: 5, int: 5, happy: 3 },
        resolve(s, rng) {
          if (s.int + s.cha + rng() * 40 > 108) {
            s.career += 1
            return {
              tone: 'good',
              effects: { money: 6, happy: 5 },
              text: '你列了四十三项，标了每一项的工时。老板看了很久，说"我没想到这么多"。那周砍掉了十一项，剩下的给了加班费。'
            }
          }
          return { tone: 'neutral', effects: { happy: -4 }, text: '老板从头看到尾，说"这些不都是顺手的事吗"。你把表收起来，笑着说"是"。那天下班你在楼下站了一会儿。' }
        }
      },
      {
        text: '只做原来那份，多的一句不接',
        textAlt: ['只做原来那份，多的一句不接', '守住本职，多的不管', '不接。让他自己找人', '该我做的做完就下班'],
        effects: { amb: -7, happy: 4, career: -1 },
        result: '你把界线划得很清楚，多出来的活最后落到了一个刚来半年的新人头上。他做了三个月，辞职了。你在电梯里遇到他，他说"这地方不是人待的"，你说了句"保重"。'
      }
    ]
  },
  {
    id: 'a_relocate',
    stage: 5,
    age: 34,
    slot: 'work_bet',
    cond: s => isStaff(s),
    title: '半年的外地',
    scene: '公司要在西南开个点，让你过去驻半年。补贴一天一百二，家里这边你自己想办法。',
    sceneAlt: [
      '地图上那个城市你只转过一次机。领导说"去半年，回来这个点就归你管"，说的时候把笔在桌上敲了两下。',
      '通知是周五下午发的，周一报到。你回家说了这件事，饭桌上安静了很久，最后有人说"你自己定"。',
      '那边的办公室还是一片毛坯，照片里只有一张桌子和一把椅子。你放大看了看，椅子是坏的，一条腿垫着纸。'
    ],
    options: [
      {
        text: '去。半年换一个位置',
        textAlt: ['去。半年换一个位置', '去，赌这半年', '收拾东西，走', '去。别的地方没这个机会'],
        effects: { amb: 9, health: -6, family: -8 },
        flags: ['took_risk'],
        resolve(s, rng) {
          const p = s.amb * 0.3 + s.cha * 0.25 + s.int * 0.2 + rng() * 35
          if (p > 66) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 12, happy: 6 },
              text: '半年做下来，那个点活了。你回来的时候 title 上多了两个字，办公室也换到了靠窗那边。你后来才知道，那半年公司换了三拨人，只有你没走。'
            }
          }
          return {
            tone: 'bad',
            effects: { family: -6, happy: -8 },
            text: '半年到期，那个点没做起来，撤了。你回来时原来的位置已经有人坐了。你被安排到一个"暂时没有明确职责"的岗位上，坐了四个月。'
          }
        }
      },
      {
        text: '推掉。家里这半年离不开',
        textAlt: ['推掉。家里这半年离不开', '不去，孩子还小', '让别人去，我留下', '这次不走了'],
        effects: { family: 8, happy: 2, amb: -6, career: -1 },
        result: '你说家里走不开。领导说理解，把机会给了另一个还没结婚的同事。半年后那个人回来了，升了一级。你在他的升职邮件下面点了"恭喜"。'
      },
      {
        text: '去，但要求两个月回来一趟',
        textAlt: ['去，但要求两个月回来一趟', '去，机票得报', '可以走，先把来回的次数写进邮件', '去，条件是每月回一次'],
        effects: { money: -3, family: 4, amb: 4, health: -3 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 52) {
            return {
              tone: 'neutral',
              effects: { happy: 4 },
              text: '领导同意了，机票报销。半年里你飞了六趟，周五夜里到家，周日晚上走。孩子在门口接你的时候，有一瞬间像看客人。'
            }
          }
          return { tone: 'neutral', effects: { happy: -5, family: -4 }, text: '领导说"先按一个月一趟吧"，第二个月就变成了"这个月忙，你别回来了"。你没争，因为争也争不过排期。' }
        }
      }
    ]
  }
]

/* ============================================================
 *  中年 · 36 — 55 岁
 * ============================================================ */

const MIDDLE = [
  {
    id: 'm_gate',
    stage: 6,
    age: 37,
    slot: 'age_wall',
    title: '35 岁以下',
    scene: '你在招聘网站上看到一行字："年龄 35 岁以下"。你今年三十七。你关掉页面，看了一眼窗外。',
    sceneAlt: [
      '内部竞聘公告发出来了，最后一栏是"年龄 35 周岁以下"。你今年三十七。你把公告往下拉，又拉回来，确认自己没有看错。',
      '猎头打电话来，聊得挺好，最后说"客户那边希望年轻一点，你理解"。你说理解。挂了电话你坐了一会儿，没想明白自己该理解什么。',
      '新来的实习生管你叫"老师"。你应了一声，忽然想起自己刚入职的时候，也这么叫过一个人，那个人当时三十七。',
      '述职会上有人提"干部梯队年轻化"。你低头翻自己的材料，发现最近五年，能写上去的新东西不多。你在纸上画了个圈，又涂掉。',
      '你打开招聘网站，输入自己的岗位，看了二十条。十九条写着"35 岁以下"，剩下那条写着"年龄不限，薪资面议"。你点进去，面议的那栏是个区间，下限比你现在的工资低。',
      '部门调整，你的汇报线往上提了一级。新领导比你小两岁，见面第一句是"久仰"。你笑着说不敢当，心里在算自己还能往上走几年。'
    ],
    cond: s => isStaff(s),
    options: [
      {
        text: '往管理转，去带人',
        textAlt: ['往管理转，去带人', '转管理，带一个组', '去当主管，管人试试', '走管理线，往上挪一格'],
        effects: { amb: 8, cha: 6, health: -4, happy: -3 },
        resolve(s, rng) {
          if (s.cha + s.career * 3 + rng() * 30 > 74) {
            s.career += 1
            return {
              tone: 'good',
              effects: { money: 7, happy: 6 },
              text: '你带了一个八人的团队，学会了开会、拆目标、替下属扛事。你发现自己其实挺擅长这个。你也发现自己越来越像当年那个主管。'
            }
          }
          return {
            tone: 'neutral',
            effects: { happy: -6, amb: -4 },
            text: '你带了三个人，带了半年，被调回了专业岗。领导说你"技术可以，管人太软"。你没有争辩，因为你心里知道他说得对。'
          }
        }
      },
      {
        text: '深耕专业，做那个"离不开的人"',
        textAlt: ['深耕专业，做那个"离不开的人"', '不挪位置，把技术做深', '就守这一门手艺', '做到只有你能干'],
        effects: { int: 10, amb: 5, happy: 4, health: -3 },
        resolve(s, rng) {
          if (s.int + rng() * 30 > 68) {
            s.career += 1
            return {
              tone: 'good',
              effects: { money: 6, happy: 8, cha: 4 },
              text: '你把一件事做到了别人绕不过去的程度。公司里新人遇到这个问题，第一个想到的就是你。你没当上什么官，但你有了不必讨好的底气。'
            }
          }
          return { tone: 'neutral', text: '你在这个方向上待了下来，成了"资历老但不太显眼"的那种人。稳定，也没什么波澜。' }
        }
      },
      {
        text: '出来单干，接私活',
        textAlt: ['出来单干，接私活', '辞了出去接单', '自己干，不给人打工了', '把客户攥在自己手里'],
        effects: { money: 5, amb: 10, health: -6, happy: -2 },
        flags: ['freelance'],
        resolve(s, rng) {
          if (s.amb + s.cha * 0.4 + rng() * 35 > 80) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 9, happy: 8 },
              text: '你的第一个客户来自三年前的同事。第二年你有了稳定的三个客户，收入比以前高，头发比以前少。你终于不用再看谁的脸色——除了客户的。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -6, happy: -8, amb: -4 },
            text: '单子断断续续，收入是原来的六成。你开始理解为什么那么多人宁可被管着。自由是有标价的，而且不便宜。'
          }
        }
      },
      {
        text: '躺平，能苟就苟',
        textAlt: ['躺平，能苟就苟', '不争了，准点下班', '就这么混着', '低调待着，别冒头'],
        effects: { happy: 6, amb: -10, money: -2, health: 3 },
        result: '你不再争了。每天准点下班，周末不接电话。有人说你没野心，你点点头。你只是忽然不想再把命换成别的东西了。'
      }
    ]
  },
  {
    id: 'm_layoff_list',
    stage: 6,
    age: 36,
    slot: 'age_wall',
    title: '名单',
    scene: '优化名单传了三天，最后定了七个人，都是你认识的。会开完，没人看你，也没人说话。',
    sceneAlt: [
      '被叫去谈话的同事回来收东西，收得很快，一个纸箱都没装满。他路过你工位时说"我先走了"，你说"保持联系"。',
      'HR 把会议室订了一整天，一个接一个进去。你路过时看见玻璃墙里的百叶帘全拉上了。',
      '晚上部门群里少了几个人，没人提。第二天早会照常开，只是有人习惯性地想叫某个名字，叫了一半停住了。'
    ],
    cond: s => isStaff(s),
    options: [
      {
        text: '主动去接最难的活，让自己不好替代',
        textAlt: ['主动去接最难的活，让自己不好替代', '把没人会的部分抓在手里', '往核心靠，别在边上待着', '抢那个没人愿意接的模块'],
        effects: { amb: 9, health: -6, happy: -3 },
        flags: ['took_risk'],
        resolve(s, rng) {
          if (s.amb + s.int * 0.4 + s.career * 3 + rng() * 30 > 82) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 8, happy: 5 },
              text: '半年后新架构图上，你负责的那块被单独画了一个框。你成了"动不了的人"。这种感觉不体面，但很安全。'
            }
          }
          return {
            tone: 'bad',
            effects: { health: -5, happy: -8 },
            text: '最难的活你接了，做完了，第二年优化时你还是被列进了"可替代"。你才明白，难不难跟重不重要是两件事。'
          }
        }
      },
      {
        text: '留后手：更新简历，把钱挪一部分出来',
        textAlt: ['留后手：更新简历，把钱挪一部分出来', '先把简历弄好，钱存起来', '不赌，先给自己留条路', '准备着，别等通知'],
        effects: { int: 6, money: 4, happy: -4 },
        result: '你把简历更新了一遍，发现自己这五年能写的东西不多。你开始每个月存一笔，也每周留两个晚上学点新东西。这一年你没被裁，但也没那么怕了。'
      },
      {
        text: '趁这波出去单干',
        textAlt: ['趁这波出去单干', '不等名单，自己走', '拿着客户资源出去干', '这地方没意思了，自己来'],
        effects: { amb: 10, money: -6, health: -5, happy: 2 },
        flags: ['freelance'],
        resolve(s, rng) {
          const p = s.cha + s.amb * 0.5 + rng() * 35
          if (p > 105) {
            s.career += 2
            return {
              tone: 'good',
              effects: { money: 12, happy: 8 },
              text: '你带走的不只是经验，还有两个愿意跟你走的客户。第一年很紧，第二年你雇了一个人。你说，裁员名单救了你。'
            }
          }
          return {
            tone: 'bad',
            effects: { money: -10, happy: -8, amb: -4 },
            text: '出来才发现，客户认的是公司的牌子。半年后你接了个外包的活，价钱被压到原来的四成。你开始想，当初是不是该再等等。'
          }
        }
      },
      {
        text: '低调，别进下一批名单就行',
        textAlt: ['低调，别进下一批名单就行', '不冒头，混到风头过去', '少说话，准点走', '苟住，别被看见'],
        effects: { happy: 3, amb: -8, money: -2 },
        result: '你把自己缩得很小：不发言，不争先，不在群里抢话。三次优化你都活下来了，第四年你发现，自己已经很久没做过一件能拿出去说的事了。'
      }
    ]
  },
  {
    id: 'm_young_boss',
    stage: 6,
    age: 38,
    slot: 'age_wall',
    title: '比你小五岁',
    scene: '新领导比你小五岁。第一次开会他说"老同志经验多，多带带年轻人"，说的时候看了你一眼。',
    sceneAlt: [
      '他上任第一周就改了汇报格式，第二周改了周会时间。你都照做了，只是每次改完，心里会空一小块。',
      '他管你叫"老师"，叫得很客气。你知道这份客气里有一部分是真心，还有一部分是提醒。',
      '散会后他单独留下你，说"这个团队我最信你"，然后问了你三个只有你答得上的问题。你答完，他说"果然"，那两个字比夸奖更让你难受。'
    ],
    cond: s => isStaff(s),
    options: [
      {
        text: '顺着这话，把资源和人抓过来',
        textAlt: ['顺着这话，把资源和人抓过来', '借他的客气，把摊子攥住', '带人可以，资源得给我', '表面上配合，实际上掌实权'],
        effects: { cha: 8, amb: 7, happy: 4 },
        resolve(s, rng) {
          if (s.cha + s.int * 0.4 + rng() * 30 > 78) {
            s.career += 1
            return {
              tone: 'good',
              effects: { money: 7, happy: 6 },
              text: '你把人和流程都握在手里，他逐渐离不开你。两年后他升走，接他位置的是你。有人说是他提的，你笑笑没否认。'
            }
          }
          return { tone: 'neutral', effects: { happy: -4 }, text: '你想抓，没抓住。他把关键的事分给了两个新人，只把最琐碎的留给你。你成了团队里最忙、也最不重要的那个人。' }
        }
      },
      {
        text: '认真带，教出两个能顶事的人',
        textAlt: ['认真带，教出两个能顶事的人', '把会的东西全教出去', '带出人，比自己攥着强', '教，别怕被超过'],
        effects: { cha: 7, int: 4, happy: 7 },
        result: '你带出来的两个人，一个升了主管，一个去了更好的公司。他们都还记得你。你在这家公司没升上去，但你有了一群认你的人。'
      },
      {
        text: '不服。自己出去干',
        textAlt: ['不服。自己出去干', '没必要在这受气，走', '自己开个摊子', '出去，谁给谁打工还不一定'],
        effects: { amb: 10, money: -5, happy: 1, health: -4 },
        flags: ['freelance'],
        resolve(s, rng) {
          const p = s.amb + s.cha * 0.5 + s.int * 0.3 + rng() * 35
          if (p > 96) {
            s.career += 2
            return { tone: 'good', effects: { money: 10, happy: 8 }, text: '你带走了两个客户和一套方法。第三年你的收入是原来的两倍。前同事聚会时你去了，坐在主位，话不多。' }
          }
          return { tone: 'bad', effects: { money: -8, happy: -7, amb: -3 }, text: '你出来得急，第一个项目就砸了。半年后你接了个外包，甲方是你以前的部门。签合同那天他没提当年的事，你也没提。' }
        }
      },
      {
        text: '不争。按时上下班',
        textAlt: ['不争。按时上下班', '随他折腾，我准点走', '不较劲了，把家顾好', '退一步，图个清静'],
        effects: { happy: 6, amb: -9, health: 3 },
        result: '你不再管那些事了。开会时你说"听领导的"，散会你第一个走。你把精力挪回了家，孩子的家长会你从此没缺过。有得有失，你自己心里有账。'
      }
    ]
  },
  {
    id: 'm_headhunter',
    stage: 6,
    age: 40,
    slot: 'age_wall',
    title: '年轻一点',
    scene: '猎头聊了四十分钟，最后说"客户那边希望年轻一点，你理解"。你说理解，挂了电话坐了一会儿。',
    sceneAlt: [
      '对方加了你微信，发了三条职位信息，最后一条写着"这个岗位偏年轻化"。你回了个"好的"，把对话框关了。',
      '面试到了第三轮，对面坐着的人比你小七八岁。他问"你能接受汇报给比你年轻的人吗"，你说能，声音比自己预想的轻。',
      '你算了一下，四十岁，还能跳两次。二十岁的时候你以为这个数字会很远。'
    ],
    cond: s => isStaff(s),
    options: [
      {
        text: '降一点要求，先换个环境',
        textAlt: ['降一点要求，先换个环境', '钱少点也走', '换个地方，先把坑占上', '退一步，先动起来'],
        effects: { money: -5, happy: 3, amb: 3 },
        resolve(s, rng) {
          if (s.luk + s.cha * 0.4 + rng() * 40 > 88) {
            s.career += 1
            return { tone: 'good', effects: { money: 5, happy: 6 }, text: '新公司规模小一点，但你在那儿说话有人听。半年后你才明白，与其在大地方当第两百号人，不如在小地方当第十号。' }
          }
          return { tone: 'neutral', effects: { money: -6, happy: -5 }, text: '新东家画的饼没兑现，一年后你又开始看机会。这次你发现，简历上多了一段一年半的经历，比空着更麻烦。' }
        }
      },
      {
        text: '不挪了，把现在这块做深',
        textAlt: ['不挪了，把现在这块做深', '守着，做那个懂行的人', '不跳了，往深里挖', '待着，把业务吃透'],
        effects: { int: 9, amb: 2, happy: 4 },
        result: '你不再看招聘网站了。你把手上这块业务的所有细节摸了一遍，写成一份三十页的手册。两年后，公司里没人能绕过这份手册，也没人能绕过你。'
      },
      {
        text: '索性自己接单',
        textAlt: ['索性自己接单', '不找工作了，自己找客户', '干私活，看谁还嫌我老', '自己当老板'],
        effects: { amb: 8, money: -4, health: -4, happy: 3 },
        flags: ['freelance'],
        resolve(s, rng) {
          const p = s.int + s.cha * 0.4 + s.luk * 0.2 + rng() * 35
          if (p > 92) {
            s.career += 2
            return { tone: 'good', effects: { money: 9, happy: 7 }, text: '你的第一个客户来自十年前的同事。他说"这个活我只放心给你"。你后来算过，这一年挣的正好是以前那份工资，外加不用开的四十六次周会。' }
          }
          return { tone: 'bad', effects: { money: -7, happy: -6 }, text: '活是有的，钱不好收。有一笔尾款拖了十个月，你去要了三次。你开始怀念那种每个月固定一天到账的日子。' }
        }
      },
      {
        text: '不折腾了，把心思放回家里',
        textAlt: ['不折腾了，把心思放回家里', '不跳了，回家过日子', '机会让给别人吧', '就这样吧，家里更重要'],
        effects: { family: 9, happy: 7, amb: -7, money: -2 },
        result: '你把晚上和周末都还给了家。孩子那年的成绩进步了，家里也没人再问你"什么时候升"。你偶尔还会刷一眼招聘网站，然后关掉。'
      }
    ]
  },
  {
    id: 'm_young',
    stage: 6,
    age: 39,
    title: '老师',
    scene: '新来的实习生叫你"老师"。你愣了一下才反应过来是在叫你。',
    options: [
      {
        text: '认真带他',
        effects: { cha: 8, happy: 8, int: 4, health: -2 },
        result: '你带得很用心，把自己踩过的坑一个个讲给他。两年后他跳槽了，走之前请你吃了顿饭。他说"你是我遇到最好的带教"。你那天喝了点酒。'
      },
      {
        text: '有点不适，回家照了很久镜子',
        effects: { happy: -6, cha: 2, int: 2 },
        result: '你发现自己有白头发了。你买了一套护肤品，用了两次就忘了。你后来慢慢接受了这个称呼，但每次听到还是会有一瞬间的出神。'
      },
      {
        text: '告诉他"别叫老师，叫哥/姐"',
        effects: { cha: 5, happy: 3 },
        result: '他笑着说"好的哥"。你们后来处得像朋友。你在心里偷偷松了一口气——你还没准备好当那个"上了年纪的人"。'
      }
    ]
  },
  {
    id: 'm_parent_group',
    stage: 6,
    age: 40,
    always: true,
    title: '家长群',
    scene: '孩子考了班里第十七名。家长群里，前十名的家长在互相恭喜。晚上你坐在沙发上，忽然问自己：要不要给他报个班？',
    cond: s => s.flags.includes('has_child'),
    options: [
      {
        text: '鸡，往死里鸡',
        effects: { money: -18, happy: -6, amb: 5 },
        flags: ['tiger_parent'],
        result: '你报了三个班，孩子的成绩上去了，话变少了。有一天他在车里说："爸/妈，我是不是只有考好了你才高兴。"你没答上来。'
      },
      {
        text: '放养，让他自己长',
        effects: { happy: 8, money: 4, cha: 3 },
        flags: ['free_range'],
        result: '你没报班。孩子成绩中等，但很爱说话，会跟你聊他在想什么。你偶尔会焦虑，但每次看到他笑，就觉得这账还划得来。'
      },
      {
        text: '不逼成绩，但陪着他',
        effects: { happy: 10, money: -6, health: -2 },
        flags: ['present_parent'],
        result: '你每周抽两个晚上陪他写作业，不催，只坐着。他写得慢，但会问你问题。这两年你失去了晋升机会，但你和一个人建立了关系。'
      }
    ]
  },
  {
    id: 'm_run',
    stage: 6,
    age: 41,
    title: '第一个五公里',
    scene: '你体检完，医生说"该动动了"。你回家翻出一双旧球鞋。',
    options: [
      {
        text: '跑，从一公里开始',
        effects: { con: 8, health: 14, happy: 8, money: -2 },
        result: '第一个五公里你用了三十八分钟，走了一半。半年后你能跑十公里。你后来把跑步当成了唯一的独处时间。你说那是你一天里最清醒的四十分钟。'
      },
      {
        text: '办了卡，请了私教',
        effects: { con: 10, health: 12, money: -8, happy: 6 },
        result: '私教很严，每次都让你练到腿抖。三个月后你的体态变了很多，拍照时不用再收下巴了。这笔钱你觉得花得值。'
      },
      {
        text: '算了，改天吧',
        effects: { health: -8, happy: -3 },
        result: '"改天"一直没来。你的膝盖在四十岁那年第一次疼，在四十五岁那年变成了长期疼。'
      }
    ]
  },
  {
    id: 'm_promo_fail',
    stage: 6,
    age: 41,
    title: '没你的名字',
    scene: '晋升名单公布了，没有你。比你晚来三年的那个人上了。他请你喝酒，说"以后多关照"。',
    options: [
      {
        text: '去喝，把话说开',
        effects: { cha: 8, happy: 4, amb: 3 },
        result: '你去了，喝到半夜。他说他也不知道为什么是自己。你说"你干得不错"。这句话你说得有点勉强，但你说完就轻松了。'
      },
      {
        text: '不去，回家睡觉',
        effects: { happy: -8, amb: 5, health: 2 },
        result: '你说"改天"。你回家躺下，盯着天花板看了很久。第二天你照常上班，只是不再主动接那些"能露脸"的活了。'
      },
      {
        text: '去找领导要个说法',
        effects: { cha: 5, amb: 8, happy: -4 },
        resolve(s, rng) {
          if (s.cha + rng() * 40 > 52) return { tone: 'good', effects: { happy: 6, career: 1 }, text: '领导说了实话：你缺一块东西。他给了你一个具体的建议和时间表。你不服气，但你照做了。两年后你上去了。' }
          return { tone: 'bad', effects: { happy: -8 }, text: '领导说了很多"综合考虑"。你听懂了，就是没你的份。你从那以后开始更新简历。' }
        }
      }
    ]
  },
  {
    id: 'm_child_gaokao',
    stage: 6,
    age: 48,
    title: '他的高考',
    scene: '孩子要高考了。你比他紧张。你在他房门口走了三圈，最后还是敲了门。',
    cond: s => s.flags.includes('has_child'),
    options: [
      {
        text: '进去说"考不好也没关系"',
        effects: { happy: 10, cha: 6, family: 8 },
        result: '他抬头看了你一眼，说"知道了"，然后又低下头。你不知道他信没信。但他那天晚上睡着了，没有熬夜。'
      },
      {
        text: '进去叮嘱了半小时注意事项',
        effects: { happy: -4, family: 2, amb: 3 },
        result: '你说了很多，从答题卡到饮食。他一声不吭地听着。你关门的时候，听见他叹了口气。你站在门外，忽然想起自己十八岁那年的晚上。'
      },
      {
        text: '什么也没说，去厨房煮了碗面',
        effects: { happy: 8, family: 10 },
        result: '你把面放在他桌上，说了句"吃完早点睡"就出来了。他吃完了，碗洗得干干净净。很多年后他说，那天那碗面他记得。'
      }
    ]
  },
  {
    id: 'm_invest',
    stage: 6,
    age: 42,
    title: '一个"稳赚"的机会',
    scene: '表哥说有个项目，内部渠道，年化 30%，他很笃定。你手里正好有一笔钱，是这些年的全部积蓄。',
    options: [
      {
        text: '全仓押上',
        effects: { amb: 8, happy: 3 },
        resolve(s, rng) {
          const p = s.luk * 0.4 + s.int * 0.2 + rng() * 60
          if (p > 68) {
            return { tone: 'good', effects: { money: Math.round(s.money * 1.4), happy: 12 }, text: '半年后钱翻了一倍多。你请表哥吃了顿饭，然后把这笔钱转进了最保守的理财。你知道这种运气一辈子只来一次。' }
          }
          return { tone: 'bad', effects: { money: -Math.round(s.money * 0.85), happy: -20, health: -6 }, text: '三个月后项目停了。表哥自己也赔了。你去他家要过一次钱，看见他老婆在哭，就没再开口。你在那之后对"内部消息"这四个字有条件反射。' }
        }
      },
      {
        text: '拿一小部分试试',
        effects: { money: -6, happy: 1 },
        resolve(s, rng) {
          if (rng() > 0.5) return { tone: 'good', effects: { money: 10, happy: 4 }, text: '你投了六万，赚了四万。你把本金抽了出来，用赚的钱继续玩。这个习惯后来救了你很多次。' }
          return { tone: 'bad', effects: { happy: -4 }, text: '六万块没了。你心疼了一阵，但日子照过。你后来常跟人说：能承受的亏损，才是投资；不能承受的，是赌。' }
        }
      },
      {
        text: '不碰，钱放银行',
        effects: { money: 3, happy: 3, amb: -3 },
        result: '你没投。后来那个项目果然出了问题。你在饭桌上听别人讲起，心里没有任何得意，只有一种"我不适合那种游戏"的确认。'
      }
    ]
  },
  {
    id: 'm_affair',
    stage: 6,
    age: 43,
    title: '另一个人的消息',
    scene: '深夜，手机亮了一下。是一个不该联系的人发来的三个字："在干嘛。"',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
    options: [
      {
        text: '删掉，关机睡觉',
        effects: { happy: -3, family: 8, cha: 4 },
        result: '你删了，关机。第二天醒来发现枕头湿了一块。你没有告诉任何人。有些关口，是你一个人在深夜里守住的。'
      },
      {
        text: '回了一句"睡了"',
        effects: { happy: 2, family: -3, cha: 3 },
        result: '你回了两个字。对方没有再发。但你那一晚没睡好。后来你们偶尔会聊几句，都是无关紧要的话。有些东西一直没发生，也一直没结束。'
      },
      {
        text: '聊到天亮',
        effects: { happy: 6, family: -10, health: -4 },
        resolve(s, rng) {
          if (rng() > 0.6) return { tone: 'bad', effects: { happy: -16, family: -12 }, text: '你们见了面。事情被发现了。家里闹了半年，最后没有离，但你们之间多了一样东西——那种"我们都在忍"的默契。' }
          return { tone: 'neutral', text: '你们见了一次，什么也没做，只是坐在咖啡馆里聊了两个小时。分别的时候你们都知道，不会再有第二次。' }
        }
      }
    ]
  },
  {
    id: 'm_rebel',
    stage: 6,
    age: 44,
    title: '门关上了',
    scene: '孩子今年十四岁，回家就进房间，门反锁。你想跟他说话，他说"烦不烦"。',
    cond: s => s.flags.includes('has_child'),
    options: [
      {
        text: '硬碰硬，把规矩立起来',
        effects: { family: -8, happy: -8, amb: 5 },
        result: '你砸了他的门。他三天没跟你说话。后来他表面上听话了，但你们之间那扇门，再也没有真正打开过。'
      },
      {
        text: '退一步，写纸条塞进门缝',
        effects: { cha: 8, happy: 4, family: 6 },
        result: '你写了一句话："饭在锅里，凉了自己热。"第二天纸条不见了。一周后他在你桌上放了一颗糖。你们谁也没提这件事。'
      },
      {
        text: '不管了，各过各的',
        effects: { happy: -4, family: -6, health: 3 },
        result: '你不再管他。他成绩下滑，你也没说什么。三年后他考了个一般的学校。你送他去报到那天，他在车站抱了你一下。'
      }
    ]
  },
  {
    id: 'm_hospital',
    stage: 6,
    age: 45,
    title: '医院走廊',
    scene: '父亲住院了，需要人陪护。护工一天三百，你请假一天扣八百。你在走廊的长椅上坐了一夜。',
    options: [
      {
        text: '请长假，自己照顾',
        effects: { money: -12, amb: -8, happy: 6, health: -4 },
        flags: ['cared_parent'],
        result: '你陪了四十天。你给他擦身、喂饭、剪指甲。你们这辈子说的话，加起来没有这四十天多。他出院那天说："儿子/女儿，辛苦你了。"你转过身去。'
      },
      {
        text: '请护工，继续上班',
        effects: { money: -8, happy: -10, health: -2 },
        result: '你每天下班去医院坐一小时。他总说"你忙你的"。有一天护工跟你说，你不在的时候，他一直朝门口看。'
      },
      {
        text: '找亲戚搭把手，分摊一点',
        effects: { money: -5, happy: 2, family: -4 },
        flags: ['sibling_split'],
        resolve(s, rng) {
          if (rng() > 0.5) {
            return { tone: 'neutral', text: '几个亲戚排了班，虽然有人迟到有人抱怨，但总算轮得开。你在家族群里第一次感觉到，血缘这东西，吵归吵，还是能用的。' }
          }
          return { tone: 'bad', effects: { happy: -6 }, text: '为了谁多出钱、谁少陪夜，你们吵了三次。父亲在病床上听得见。出院后他把存折收得更紧了。' }
        }
      },
      {
        text: '把父母接到自己城市',
        effects: { money: -15, happy: 6, family: 10, cha: -3 },
        result: '你在小区里租了间一居室给两位老人。他们不习惯，但每天能见到你。你妈学会了用外卖软件，你爸在楼下认识了三个棋友。'
      }
    ]
  },
  {
    id: 'm_house_swap',
    stage: 6,
    age: 45,
    title: '换不换',
    scene: '孩子大了，现在这套房子有点挤。中介说可以置换，但要多背一百五十万贷款，你还有十五年退休。',
    cond: s => (s.flags.includes('mortgage') || s.flags.includes('small_city')) && s.flags.includes('has_child'),
    options: [
      {
        text: '换，贷款就贷款',
        effects: { money: -40, family: 8, happy: 5, health: -5, amb: 4 },
        result: '你换了。新房子有电梯，有阳光，孩子有了自己的房间。你每天上班想的第一件事是月供。但你回家的时候，会有一点点高兴。'
      },
      {
        text: '不换，把这套收拾好',
        effects: { money: -8, happy: 6, health: 2 },
        result: '你重新装修了。把阳台封起来做了个书桌。你在那儿看了很多书。你后来觉得，房子大小不是最重要的，重要的是有没有一个属于自己的角落。'
      },
      {
        text: '换个小城市的大房子，提前退休',
        effects: { money: 30, happy: 8, amb: -12, health: 8 },
        result: '你把大城市的房子卖了，去了一座小城。差价存进银行，你找了份轻松的活。你四十多岁就过上了别人六十岁的生活。有人说你"没追求"。'
      }
    ]
  },
  {
    id: 'm_marriage',
    stage: 6,
    age: 46,
    title: '同一个屋檐下',
    scene: '你们已经半年没有好好说过话了。不是吵架，是没什么可说的。对方刷手机，你也在刷手机。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
    options: [
      {
        text: '认真修复一次',
        effects: { happy: 8, money: -3, health: 3 },
        resolve(s, rng) {
          if (s.cha + s.happy * 0.3 + rng() * 40 > 55) {
            s.happy += 8
            return { tone: 'good', effects: { happy: 10 }, text: '你们去了一趟当年蜜月的地方。路上吵了一架，吵完了反而轻松了。回来后开始每周留一个晚上，不带孩子，不看手机，就坐着说话。' }
          }
          return { tone: 'neutral', effects: { happy: -3 }, text: '你努力了一个月，对方也配合了一个月，然后一切回到原样。不是不爱，是两个人都太累了，累到没有力气再去经营。' }
        }
      },
      {
        text: '离了吧',
        effects: { money: -30, happy: -8, health: -4, amb: 5 },
        flags: ['divorced'],
        result: '办完手续那天，你们在民政局门口站了一会儿，然后各走一边。你回到空了一半的房子，坐在沙发上，第一次觉得安静这么响。'
      },
      {
        text: '各过各的，维持表面',
        effects: { happy: -10, money: 4, cha: -3 },
        flags: ['cold_marriage'],
        result: '你们成了同一屋檐下的两个室友。家里的事两个人一起去办，回来各回各的房间。你把这种状态叫做"稳定"。'
      }
    ]
  },
  {
    id: 'm_industry',
    stage: 6,
    age: 48,
    title: '行业变了',
    scene: '公司开始大规模裁员，说是"业务调整"。你在这个行业干了二十年，忽然发现自己会的东西，外面不太需要了。',
    cond: s => isStaff(s),
    options: [
      {
        text: '花半年时间转型学新东西',
        effects: { int: 8, amb: 10, money: -6, happy: -4, health: -4 },
        resolve(s, rng) {
          if (s.int + s.amb * 0.5 + rng() * 35 > 60) {
            s.career += 2
            return { tone: 'good', effects: { money: 12, happy: 8 }, text: '你四十八岁重新当了一回学生。半年后你转到了一个新的方向，虽然起点低，但你留了下来。你后来跟人说，人生是可以重启的，只要你肯从头学。' }
          }
          return { tone: 'bad', effects: { happy: -10, money: -8 }, text: '你学得很吃力，最后还是没转成。你去了一个小公司做老本行，工资降了四成。你不甘心，但你需要这份收入。' }
        }
      },
      {
        text: '死守现在的岗位，能撑多久撑多久',
        effects: { happy: -6, money: 2, amb: -5 },
        result: '你没动。公司裁了两轮，你都在。第三轮没有你，因为你便宜。你后来一直做到退休，工资没有涨过。'
      },
      {
        text: '干脆自己开个小店',
        effects: { money: -20, amb: 10, happy: 4, health: -5 },
        resolve(s, rng) {
          if (s.cha + s.luk * 0.5 + rng() * 40 > 65) return { tone: 'good', effects: { money: 15, happy: 12 }, text: '你开了家小店，卖咖啡也卖书。头一年亏，第二年持平，第三年开始有回头客。你不算赚钱，但你每天早上开门的时候是高兴的。' }
          return { tone: 'bad', effects: { money: -10, happy: -8 }, text: '店开了两年，赔了三十万，关了。你站在空店里，把最后一盏灯关掉。你后来跟人说，那两年你学到了比前二十年更多的东西。' }
        }
      }
    ]
  },
  {
    id: 'm_diagnosis',
    stage: 6,
    age: 49,
    title: '需要家属陪同',
    scene: '医生看了你的报告，说："这个情况，最好叫家属一起来。"你的手在膝盖上握紧了。',
    options: [
      {
        text: '叫家人来，一起面对',
        effects: { happy: 6, family: 12, money: -12, health: -8 },
        result: '结果是良性，但需要手术。你在病房里住了十二天。那十二天你第一次什么事都不做，只是躺着。你后来常说，那是你四十岁以后睡得最好的十二天。'
      },
      {
        text: '说"我自己能决定"',
        effects: { cha: 6, amb: 6, health: -10, happy: -8 },
        result: '你一个人签了字，一个人住的院。术后那天晚上很疼，你按了三次铃。你没有告诉家里，直到出院。你后来觉得自己挺能扛的，也有点难过。'
      },
      {
        text: '先不做，回去查清楚再说',
        effects: { int: 4, health: -6, happy: -6, money: -3 },
        result: '你跑了三家医院，查了很多资料。最后确认没那么严重。你松了一口气，但也后怕——如果当时拖着，会怎么样。'
      }
    ]
  },
  {
    id: 'm_reunion',
    stage: 6,
    age: 50,
    title: '同学会',
    scene: '二十五年后的同学会。当年成绩不如你的人现在开着好车；当年最风光的那个，听说在跑网约车。',
    options: [
      {
        text: '心里不是滋味，回去更拼',
        effects: { amb: 8, happy: -8, health: -4 },
        result: '你回去加了两个月的班。你心里清楚这种比较没意义，但你就是过不去。这口气支撑了你很多年，也吃掉了很多年。'
      },
      {
        text: '真心替他们高兴',
        effects: { happy: 10, cha: 5, amb: -3 },
        result: '你一桌一桌地敬酒，听别人讲他们的日子。散场时你有点醉，走在路上忽然觉得，能看见这么多人活成了不同的样子，是件挺好的事。'
      },
      {
        text: '提前走，回家陪家人',
        cond: s => s.flags.some(f => ['married_arranged', 'married_love', 'has_child'].includes(f)) && !s.flags.includes('divorced'),
        effects: { happy: 6, family: 8, health: 2 },
        result: '你喝了半杯就走了。回到家，孩子在写作业，另一半在厨房。你换了鞋，进去帮忙洗菜。这一天就这么过去了，很普通。'
      }
    ]
  },
  {
    id: 'm_forgive',
    stage: 6,
    age: 50,
    title: '一封信',
    scene: '你收到一封信。写信的人你认识——很多年前你们为了同一个机会闹得很难看，后来就不来往了。他说这些年一直想跟你说声对不起。',
    options: [
      {
        text: '回信，说"都过去了"',
        effects: { happy: 12, cha: 6, health: 3 },
        result: '你写了三页，最后只寄出去一段话。写完那天你睡得很好。你后来才明白，原谅这件事，受益的是自己。'
      },
      {
        text: '不回，把信收起来',
        effects: { happy: 2, amb: 3 },
        result: '你把信放进了抽屉。你没有原谅，也没有再恨。它变成了一件旧事，偶尔想起来，不再疼。'
      },
      {
        text: '回信，把这些年的账算清楚',
        effects: { happy: -4, cha: 4, amb: 5 },
        result: '你写了五页，把每一件事都写清楚了。寄出去之后你没有等回信。你说完想说的话，就够了。'
      }
    ]
  },
  {
    id: 'm_book',
    stage: 6,
    age: 51,
    title: '你写了点东西',
    scene: '你把这些年的一些事写了下来，写了十几万字。朋友看了说："这个可以出书。"',
    options: [
      {
        text: '投出去试试',
        effects: { amb: 8, happy: 6, money: -2 },
        resolve(s, rng) {
          if (rng() > 0.82) return { tone: 'good', effects: { money: 6, happy: 14, cha: 6 }, text: '一家小出版社接了。首印三千册，卖了两年。你在豆瓣上看到有人写读后感，看了很多遍。' }
          return { tone: 'neutral', effects: { happy: 4 }, text: '被拒了七次。你把稿子打印出来，装订好，放在书架上。你后来偶尔翻一翻，觉得写得还行。' }
        }
      },
      {
        text: '自己印几本，送给朋友',
        effects: { money: -2, happy: 10, cha: 5 },
        result: '你印了二十本，送给了二十个人。有人认真看了，跟你聊了一晚上。你说，有人读就够了。'
      },
      {
        text: '写完就锁进抽屉',
        effects: { happy: 6, amb: 3 },
        result: '你没给任何人看。写作对你来说不是表达，是整理。你把那些事写完了，它们就不再压着你了。'
      }
    ]
  },
  {
    id: 'm_parent_death',
    stage: 6,
    age: 52,
    title: '那个电话',
    scene: '凌晨，电话响了。是老家的号码。你看了一眼时间，就知道是什么事。',
    options: [
      {
        text: '立刻回去，料理所有事',
        effects: { happy: -14, family: 10, health: -6, money: -8 },
        result: '你回去了七天。办丧事、接待亲戚、整理遗物。你一直没哭。最后一天你收拾他的衣柜，看见一件你小时候的毛衣，叠得整整齐齐。你蹲在地上哭了很久。'
      },
      {
        text: '回去，但什么都交给亲戚办',
        effects: { happy: -12, family: -4 },
        result: '你回去了，但很多事都是别人在张罗。你站在旁边，像个客人。你后来一直记得那种感觉——在自己的家里，成了客人。'
      },
      {
        text: '没能赶上最后一面',
        effects: { happy: -18, health: -5 },
        result: '你买了最早的航班，还是晚了两个小时。你在太平间门口站了很久。这件事你后来很少提，但它一直在。'
      }
    ]
  },
  {
    id: 'm_hometown',
    stage: 6,
    age: 53,
    title: '回一次老家',
    scene: '你很多年没回去了。这次是因为一个远房亲戚的事。车开到村口，你差点认不出来。',
    options: [
      {
        text: '到处走走，看看老地方',
        effects: { happy: 8, cha: 5, health: 2 },
        result: '小学还在，操场小了。你站在门口看了一会儿。有个老人认出你，叫了你的小名。你愣了一下，才想起来自己还有这么个名字。'
      },
      {
        text: '办完事就走',
        effects: { happy: -4, amb: 3 },
        result: '你待了三个小时。车开出村口的时候，你从后视镜里看了一眼。你知道这可能是最后一次。'
      },
      {
        text: '去父母坟前坐了一下午',
        effects: { happy: 6, family: 6, health: -2 },
        result: '你带了一瓶酒，坐在那儿说了很多话。说的都是这些年没处说的话。天黑了你才走，走的时候心里空了一块，也松了一块。'
      }
    ]
  },
  {
    id: 'm_friend_death',
    stage: 6,
    age: 54,
    title: '少了一个人',
    scene: '一个从年轻时就认识的朋友走了。不算突然，病了两年。你去参加了葬礼。',
    options: [
      {
        text: '在葬礼上说了几句',
        effects: { happy: 4, cha: 6, family: 3 },
        result: '你讲了你们年轻时的一件小事，台下有人笑了，也有人哭了。你讲完坐下，忽然觉得，人这一辈子能被人记住几件小事，就够了。'
      },
      {
        text: '一句话没说，站在最后面',
        effects: { happy: -10, health: -2 },
        result: '你站到最后，看着棺木抬出去。回去的路上你给他发了一条微信，明知道不会有人回。那条消息你一直没删。'
      },
      {
        text: '葬礼后去喝了一场酒',
        effects: { happy: 6, health: -4, cha: 4 },
        result: '你和几个老朋友喝到半夜，讲了很多他的事。你们笑着笑着就不说话了。那晚你回家很晚，但睡得很沉。'
      }
    ]
  },
  {
    id: 'm_hobby',
    stage: 6,
    age: 47,
    title: '旧吉他',
    scene: '你在储物间翻出一把旧吉他，弦都锈了。你二十岁的时候弹过。',
    options: [
      {
        text: '换弦，重新学',
        effects: { happy: 12, cha: 5, money: -1, int: 3 },
        result: '你手指按得生疼，但你会弹那首老歌了。后来你在家庭聚会上弹过一次，孩子拿手机拍了视频。你有点不好意思，但那天你很高兴。'
      },
      {
        text: '看了看，又放回去了',
        effects: { happy: -4, int: 2 },
        result: '你把琴擦干净，放回原处。你想"等有空再说"。它在那儿又躺了十年。'
      },
      {
        text: '送给了一个年轻人',
        effects: { cha: 6, happy: 6 },
        result: '你把它送给了一个刚毕业的同事。他后来真的学会了，还在朋友圈发过弹唱。你每次都点赞，什么也没说。'
      }
    ]
  },
  {
    id: 'm_career_end',
    stage: 6,
    age: 52,
    title: '最后一轮',
    scene: '公司第四轮裁员，名单上有你。这次没有什么可以争的，你五十二了。',
    cond: s => isStaff(s),
    options: [
      {
        text: '拿了赔偿，提前退下来',
        effects: { money: 8, happy: 4, health: 8, amb: -8 },
        flags: ['retired'],
        result: '你拿了 N+1，回家睡了三天。第四天你开始整理阳台，种了几盆花。你后来发现，不上班的日子，你并不空虚——你只是需要几个月适应。'
      },
      {
        text: '找下一份，还得干',
        effects: { money: -6, amb: 6, health: -8, happy: -8 },
        resolve(s, rng) {
          if (s.cha + s.career * 3 + rng() * 30 > 60) return { tone: 'good', effects: { money: 10, happy: 5 }, text: '你去了一个小公司做顾问，钱不多，但人家尊重你的经验。你干到六十岁，最后是被自己劝退的。' }
          return { tone: 'bad', effects: { money: -10, happy: -10 }, text: '你投了八十份简历，面试了六家，都被拒了。理由都很客气："您很优秀，但我们这个岗位……"你后来去开了网约车。' }
        }
      },
      {
        text: '去做点小生意',
        effects: { money: -10, amb: 8, happy: 6, health: -4 },
        result: '你在小区门口开了个便利店。每天早上六点开门，晚上十点关。赚得不多，但你认识了这个小区一半的人。'
      }
    ]
  }
]

/* ============================================================
 *  老年 · 56 — 80 岁
 * ============================================================ */

const ELDER = [
  {
    id: 'e_retire',
    stage: 7,
    age: 60,
    slot: 'exit_door',
    title: '最后一天',
    scene: '最后一天，你把手上那摊事交代完了，东西收进两个袋子。走出门口的时候，你回头看了一眼。',
    sceneAlt: [
      '最后一天，你比平时早到半小时。办公室还没人，你把抽屉一个个拉开，翻出十年前的工牌、两包受潮的茶叶、一张写着自己名字的旧座位表。',
      '交接会开了四十分钟，你准备了三个月的清单，讲到第十七条就没人问了。有人说"差不多了吧"，大家开始收电脑。',
      '系统账号是下午五点停的。你正想登进去看一眼，屏幕上跳出"账号已禁用"。你盯着那行字，忽然意识到以后连"看一眼"都需要申请。',
      '同事给你订了蛋糕，十几个人围过来拍照。有人说"以后常联系啊"，你笑着说好啊。你们都知道这句话的意思。',
      '走出大门的时候是下午四点，太阳还很高。你站在台阶上，发现这是三十年来第一次，整个下午都是你的，而你不知道该拿它做什么。',
      '你把两个袋子放进后备箱，坐进驾驶座，没有立刻发动。后视镜里那栋楼很安静，跟平时一样。你想了想，把座椅往后调了一点。'
    ],
    cond: s => !s.flags.includes('retired'),
    options: [
      {
        text: '带孙辈',
        textAlt: ['带孙辈', '帮孩子看孩子', '搬到孩子家去，接送小的', '一天到晚围着孙辈转'],
        cond: s => s.flags.includes('has_child'),
        effects: { happy: 8, health: -4, family: 10 },
        flags: ['grandparent', 'retired'],
        result: '你每天六点起床给孩子做早饭，接送、辅导、哄睡。你比上班还累，但那种累是不一样的，累完心里是满的。'
      },
      {
        text: '到处走走',
        textAlt: ['到处走走', '把没去过的地方补上', '买张票，先走出去再说', '一年出去两趟'],
        effects: { money: -18, happy: 14, health: 4, cha: 4 },
        flags: ['retired'],
        result: '你去了年轻时想去没去成的地方。在某个海边，你坐了一下午，什么都没想。你忽然明白，所谓自由，就是时间终于是自己的了。'
      },
      {
        text: '学个新东西',
        textAlt: ['学个新东西', '报个班，从头学一样', '去老年大学上课', '找件年轻时想学没学的事'],
        effects: { int: 6, happy: 10, money: -4, cha: 3 },
        flags: ['retired'],
        result: '你报了老年大学的摄影班。第一次交作业被老师夸了，你高兴了三天。你开始明白，人不管多大，都需要有人说一句"你做得好"。'
      },
      {
        text: '继续接活赚钱',
        textAlt: ['继续接活赚钱', '不退了，接着干', '有人找就接，钱照收', '换个轻松的活，继续挣'],
        effects: { money: 12, health: -8, happy: 2, amb: 4 },
        flags: ['still_working'],
        result: '你还是闲不下来。有人说你图什么，你说"图个有事干"。其实你怕的是，一旦停下来，就没人需要你了。'
      }
    ]
  },
  {
    id: 'e_early_out',
    stage: 7,
    age: 58,
    slot: 'exit_door',
    title: '七折',
    scene: '单位效益不好，给了一批内退名额：提前回家，工资打七折，一直到正式退休。名单上有你的名字，签字截止到月底。',
    sceneAlt: [
      '通知贴出来的时候，走廊里站了十几个人。有人当场就签了，说"反正也干不动了"；有人站着不动，算了很久也没算明白。',
      '人事把表格放在你桌上，说"想好了再签，签了就不能反悔"。表格很薄，一页，要签的地方有三处。',
      '你回家跟家里人商量。他们说"少三成，日子紧一点也能过"。你点头，心里想的却是：紧一点，是紧多少年。'
    ],
    cond: s => !s.flags.includes('retired'),
    options: [
      {
        text: '签。早点回家，少拿三成',
        textAlt: ['签。早点回家，少拿三成', '签了，剩下的日子自己安排', '认了这三成', '签，不熬了'],
        effects: { money: -14, happy: 6, health: 6 },
        flags: ['retired'],
        result: '签完那天下午你还在办公室坐了一会儿，因为不知道接下来该去哪儿。后来你给自己定了规矩：每天出门走一小时。那条路线你走了十年。'
      },
      {
        text: '签了，再找个零活补上那三成',
        textAlt: ['签了，再找个零活补上那三成', '签，然后去超市做半天', '回家，但活还得接着找', '签，钱少就再挣点'],
        effects: { money: 2, health: -5, happy: 2 },
        flags: ['retired', 'still_working'],
        result: '你在小区门口的超市理货，一周四天，一天八十。钱不多，但那三成补回来了。有老同事来买东西，你下意识想躲，后来就不躲了——都是过日子。'
      },
      {
        text: '不签。撑到正式退休那天',
        textAlt: ['不签。撑到正式退休那天', '不签，该拿的一分不能少', '熬这两年', '再干两年，凑够数'],
        effects: { money: 6, health: -7, happy: -4 },
        flags: ['still_working'],
        result: '留下来的日子不好过，活更多，脸色更多。你数着月数，一个月划一格。最后一天走出大门的时候，你没有一个袋子要收，因为东西早就一点一点搬回家了。'
      },
      {
        text: '在家带孙辈，钱少点就少点',
        textAlt: ['在家带孙辈，钱少点就少点', '签，回去带孩子', '不挣那三成了，看孩子去', '签完就去孩子家'],
        cond: s => s.flags.includes('has_child'),
        effects: { family: 10, happy: 8, health: -3 },
        flags: ['grandparent', 'retired'],
        result: '你每天六点半起，做早饭、送、接、哄睡。孩子说"爸/妈你比上班还累"，你说累是累，但这个是自己的。'
      }
    ]
  },
  {
    id: 'e_rehire',
    stage: 7,
    age: 61,
    slot: 'exit_door',
    title: '第三天',
    scene: '退休手续办完第三天，原单位打电话来，说有个项目没人接得住，想返聘你，一周去两天。',
    sceneAlt: [
      '电话是以前的下属打来的，语气很客气，说了三次"麻烦您"。你听出来他是真的没办法了。',
      '他们在会议室给你留了个位置，还是原来的工位，桌上摆着一个新杯子。你坐下的时候，发现自己居然还记得密码。',
      '人事说"劳务合同，一个月一签，钱不多"。你问"需要我做什么"，他说"就是他们搞不定的那些"。'
    ],
    cond: s => !s.flags.includes('retired'),
    options: [
      {
        text: '去，一周两天',
        textAlt: ['去，一周两天', '答应，闲着也是闲着', '回去看看，每周去两趟', '去，动动脑子'],
        effects: { money: 8, health: -3, happy: 6, amb: 4 },
        flags: ['still_working'],
        result: '一周两天，你成了那个"搞不定就找他"的人。年轻人喜欢你，因为你不抢功、也不考核他们。你第一次觉得，工作这件事，原来可以只是工作。'
      },
      {
        text: '不去。这次是真的放下',
        textAlt: ['不去。这次是真的放下', '推了。该结束了', '不回去了，往前看', '说不，这次不心软'],
        effects: { happy: 2, health: 6, money: -3 },
        flags: ['retired'],
        result: '你说不去了，对方愣了一下。挂了电话你在阳台站了很久。之后他们又找过你两次，第三次就没了。你偶尔还会想那个项目后来怎么样了。'
      },
      {
        text: '去，但只带人，不签字',
        textAlt: ['去，但只带人，不签字', '可以回去，责任别找我', '去教，不当负责人', '去，只出主意'],
        effects: { money: 5, cha: 5, happy: 7, health: -2 },
        flags: ['still_working'],
        result: '你带了三个人，一个季度后他们能自己顶了。你请他们吃了顿饭，说"以后别找我"。他们笑着说好，第二年真的没找。'
      },
      {
        text: '带孙辈。别的事都推了',
        textAlt: ['带孙辈。别的事都推了', '不去了，看孩子', '回家带孙子孙女', '只带孩子，不接活'],
        cond: s => s.flags.includes('has_child'),
        effects: { family: 10, happy: 9, health: -4 },
        flags: ['grandparent', 'retired'],
        result: '你把返聘的事说了，孩子说"你自己的身体要紧"。你就没去。后来每天下午四点半，你站在小学门口，那条街上有一半的人你都认识了。'
      }
    ]
  },
  {
    id: 'e_quit_early',
    stage: 7,
    age: 59,
    slot: 'exit_door',
    title: '不等那一天',
    scene: '离退休还有一年零四个月。你把辞呈交了，人事看了三遍，问"你确定？差一年多拿不少"。',
    sceneAlt: [
      '你在纸上算过：再熬十六个月，退休金一个月多几百。你算了三遍，然后还是把辞呈打印了出来。',
      '那天早上你又迟到了，站在打卡机前面，忽然觉得这二十八年在同一栋楼里上上下下，像一段可以剪掉的胶片。',
      '领导挽留了两次，第二次说"要不你休个长假再想想"。你谢谢他，说想过了。'
    ],
    cond: s => !s.flags.includes('retired'),
    options: [
      {
        text: '确定。这一年多我自己的',
        textAlt: ['确定。这一年多我自己的', '交了就交了', '不熬了，走', '签完字我就自由了'],
        effects: { money: -12, happy: 12, health: 5 },
        flags: ['retired'],
        result: '你比同龄人早离开一年零四个月。那段时间你早上还是六点醒，但醒了不用起。你后来发现，人真正需要的不是休息，是"今天由我决定"这件事。'
      },
      {
        text: '辞了，但接点私活',
        textAlt: ['辞了，但接点私活', '走，然后自己找活干', '不坐班了，接单', '辞，钱还得挣'],
        effects: { money: 3, health: -4, happy: 6, amb: 5 },
        flags: ['still_working'],
        result: '你接了两个老客户的活，一个月干十天，挣得比以前少，但不用开会。你把这种状态叫"半退休"，说给谁听谁都羡慕。'
      },
      {
        text: '先请长假，看看不上班是什么感觉',
        textAlt: ['先请长假，看看不上班是什么感觉', '不休辞，先停三个月', '请假试试，不行再回来', '缓一缓，先别把门关死'],
        effects: { money: -4, happy: 6, health: 3 },
        resolve(s, rng) {
          if (s.flags.includes('has_child') && rng() < 0.5) {
            return {
              tone: 'neutral',
              effects: { family: 6 },
              text: '三个月里你去了孩子家两趟，帮着接送。假期结束那天你回单位续了假，又续了一次，最后直接办了退休。你后来觉得，那三个月才是真正的过渡。'
            }
          }
          return {
            tone: 'neutral',
            effects: { happy: 2 },
            text: '第一个月很舒服，第二个月开始发慌，第三个月你发现自己每天在等一件不会来的事。假期结束你回去上班了，又干了十一个月。'
          }
        }
      },
      {
        text: '回家带孙辈，这一年多不挣了',
        textAlt: ['回家带孙辈，这一年多不挣了', '辞了，带孙子孙女去', '不熬了，看孩子', '把时间给孩子'],
        cond: s => s.flags.includes('has_child'),
        effects: { family: 11, happy: 9, money: -6 },
        flags: ['grandparent', 'retired'],
        result: '你每天接送、做饭、讲故事。孩子问你"你不上班了？"，你说"不上了，专门陪你"。他高兴了三天，第四天就开始嫌你管得多。'
      }
    ]
  },
  {
    id: 'e_phone',
    stage: 7,
    age: 62,
    title: '扫不出来',
    scene: '超市结账，前面的人都在扫码。你举着手机对了半天，收银员说"大爷/大妈，您点那个绿的"。',
    options: [
      {
        text: '回家让孩子教，学会了',
        cond: s => s.flags.includes('has_child'),
        effects: { int: 5, happy: 8, cha: 3 },
        result: '你学了三个晚上，记了满满一页笔记。后来你不但会扫码，还学会了发朋友圈、点外卖。你开始给孩子发早安图片，他们回你一个笑脸。'
      },
      {
        text: '改用现金，不学了',
        effects: { happy: -4, cha: -2, int: -3 },
        result: '你开始随身带零钱。有一次人家说"我们不收现金"，你站在那儿，觉得这个世界有点陌生。'
      },
      {
        text: '让孩子帮你弄好，自己只按一个键',
        cond: s => s.flags.includes('has_child'),
        effects: { happy: 3, family: 4, int: -1 },
        result: '他把付款码设成了快捷方式。你只要按一下就行。你说"这个好"。你不知道背后是什么原理，但你不想知道了。'
      },
      {
        text: '去社区的数字课堂，跟着学',
        effects: { int: 5, happy: 5, cha: 4 },
        result: '社区活动室每周二下午有一节课，教老年人用手机。你坐在第三排，笔记记得比谁都工整。学会那天你给自己买了杯奶茶，用手机点的。'
      }
    ]
  },
  {
    id: 'e_community',
    stage: 7,
    age: 63,
    title: '楼下那块空地',
    scene: '小区里有一块空地，一直荒着。有人在群里提议种点东西，问有没有人愿意一起。',
    options: [
      {
        text: '加入，成了主力',
        effects: { happy: 12, cha: 8, con: 5, health: 6 },
        result: '你们种了番茄、辣椒、还有几棵月季。第二年那块地成了小区最有名的地方。你每天早上第一件事就是去看一眼。'
      },
      {
        text: '不参加，但每天去看',
        effects: { happy: 5, con: 2 },
        result: '你不种，但你会去看。有一次一个老大爷塞给你两个番茄，说"尝尝"。你回家洗了，觉得比买的甜。'
      },
      {
        text: '觉得没意思',
        effects: { happy: -3, cha: -3 },
        result: '你觉得一群老人种菜很无聊。你继续每天在家看电视。有一天你从窗户看见那块地上全是人，笑得很响。你把窗帘拉上了。'
      }
    ]
  },
  {
    id: 'e_grandkid',
    stage: 7,
    age: 65,
    title: '暑假',
    scene: '孙子孙女放暑假，儿女问能不能放你这儿住一个月。',
    cond: s => s.flags.includes('has_child'),
    options: [
      {
        text: '接过来，天天带着玩',
        effects: { happy: 14, health: -6, family: 10, money: -4 },
        result: '你带他去了公园、动物园、还去了一次海边。你累得腰疼，但那个月你笑得比过去五年都多。他走的时候抱着你说"爷爷/奶奶我暑假还来"。'
      },
      {
        text: '接，但只管饭',
        effects: { happy: 6, family: 4, health: -2 },
        result: '你负责做饭，他自己玩手机。一个月里你们说过的话不多。他走后你收拾房间，发现他在纸上画了你。'
      },
      {
        text: '说自己身体不好，婉拒了',
        effects: { happy: -6, family: -6, health: 2 },
        result: '你说"我怕带不好"。儿女说"没事"。那个暑假你过得很清静，也很长。'
      }
    ]
  },
  {
    id: 'e_trip',
    stage: 7,
    age: 66,
    title: '那个地方',
    scene: '你年轻时一直想去一个地方，后来因为钱、因为孩子、因为工作，一直没去。现在你有时间了。',
    options: [
      {
        text: '一个人去',
        effects: { money: -8, happy: 16, cha: 5, health: 2 },
        result: '你在那儿待了五天。没有人认识你，你也不用向谁解释。你在一家小饭馆吃了一顿饭，老板问你从哪儿来，你说了一个很远的地名。'
      },
      {
        text: '跟老伴一起去',
        effects: { money: -12, happy: 14, family: 8, health: 2 },
        cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
        result: '你们拍了很多照片。有一张是你们坐在长椅上，都笑得很傻。那张照片后来放在了客厅最显眼的地方。'
      },
      {
        text: '算了，年纪大了折腾不动',
        effects: { happy: -8, health: 2 },
        result: '你没去。那个地方后来在电视上出现过一次，你看着屏幕，说"就是这儿"。然后你换了台。'
      }
    ]
  },
  {
    id: 'e_morning',
    stage: 7,
    age: 68,
    title: '那天早上',
    scene: '你早上起床时，眼前黑了一下，扶着墙站了很久才缓过来。',
    auto: true,
    resolve(s, rng) {
      const h = s.health + s.con * 0.3 + rng() * 12
      if (h > 78) return { tone: 'good', effects: { happy: 6 }, text: '你去医院查了，医生说只是起得太猛，血压有点低。他问你平时锻炼吗，你说每天走一万步。他笑了笑说："那你比我强。"' }
      if (h > 50) {
        s.health -= 8
        return { tone: 'neutral', effects: { health: -8, happy: -4 }, text: '查出来两个慢性病，都要长期吃药。医生把注意事项写在纸上，字很小。你把纸折好放进钱包，从此钱包里多了一样东西。' }
      }
      s.health -= 14
      return { tone: 'bad', effects: { health: -14, happy: -12, money: -12 }, text: '你住院了，住了十九天。出院时你走得很慢，走廊很长。你第一次算了一下，自己还有多少个"能自己走"的早晨。' }
    }
  },
  {
    id: 'e_fall',
    stage: 7,
    age: 71,
    title: '浴室里',
    scene: '你在浴室滑了一跤。躺在地上，你花了十分钟才爬起来，中间想过要不要喊人。',
    options: [
      {
        text: '告诉家人，装个扶手',
        effects: { money: -2, health: 4, family: 6, happy: 3 },
        result: '他们第二天就来了，装了扶手，还在浴室铺了防滑垫。你嘴上说"小题大做"，心里松了一口气。'
      },
      {
        text: '不说，怕他们担心',
        effects: { happy: -6, health: -6, con: -3 },
        result: '你谁也没说。之后你洗澡的时候会特别小心，也不敢锁门。这件事让你第一次清楚地感觉到：你老了。'
      },
      {
        text: '干脆搬去养老社区',
        effects: { money: -20, happy: 8, health: 8, family: -3 },
        result: '你去看了一家养老社区，环境不错，有医生有活动。你搬了过去。一开始不习惯，后来认识了几个牌友。你说"这里比家里热闹"。'
      }
    ]
  },
  {
    id: 'e_spouse',
    stage: 7,
    age: 72,
    title: '先走一步',
    scene: '老伴走了。走得很安静，睡着的。你早上叫她，她没应。',
    cond: s => s.flags.some(f => ['married_arranged', 'married_love'].includes(f)) && !s.flags.includes('divorced'),
    options: [
      {
        text: '守着这个家，一个人过',
        effects: { happy: -14, health: -8, family: 4 },
        result: '你没有搬走。她的牙刷还在杯子里，衣服还挂在柜子里。你每天早上还是会煮两个人的粥，然后自己吃两碗。'
      },
      {
        text: '搬去和儿女住',
        effects: { happy: -4, family: 8, health: 2, money: -2 },
        result: '你搬去了儿女家。他们对你好，但你总觉得是客人。你在阳台上放了一把椅子，那是你的角落。'
      },
      {
        text: '开始学着自己生活',
        effects: { happy: 2, health: 4, con: 4, int: 4 },
        result: '你学会了做饭、洗衣、缴水电费。这些事她做了一辈子。你第一次知道，那些看起来简单的事，有多琐碎。'
      }
    ]
  },
  {
    id: 'e_oldfriends',
    stage: 7,
    age: 70,
    title: '老地方',
    scene: '几个老朋友约在老地方吃饭。这些年，人一年比一年少。',
    options: [
      {
        text: '去，喝两杯',
        effects: { happy: 12, cha: 5, health: -3 },
        result: '你们聊了四个小时，聊的都是几十年前的事。散场时有人说"明年还来啊"。你们都知道，能来的会越来越少。'
      },
      {
        text: '去了，但没喝酒',
        effects: { happy: 8, cha: 4, health: 2 },
        result: '你以茶代酒。他们笑你"怕死"。你说"我还想多来几年"。这句话说完，桌上安静了一下。'
      },
      {
        text: '没去，身体不舒服',
        effects: { happy: -8, health: 2 },
        result: '你在家躺着，看群里的照片。照片上少了一个位置，是你的。你放大了看了很久。'
      }
    ]
  },
  {
    id: 'e_house_give',
    stage: 7,
    age: 74,
    title: '房子给谁',
    scene: '儿女提到房子的事，说"早点办了好，省得以后麻烦"。',
    cond: s => s.flags.includes('has_child'),
    options: [
      {
        text: '现在就过户',
        effects: { money: -6, family: 6, happy: 2 },
        result: '你办了过户，房本上换了名字。你把复印件收进抽屉，看着上面不是自己的名字，坐了一会儿。'
      },
      {
        text: '先立遗嘱，房子还住着',
        effects: { int: 4, family: -3, happy: 4 },
        result: '你找了律师，立了遗嘱。你说"我还在呢"。儿女没再提。你把这件事办得清清楚楚，心里反而踏实了。'
      },
      {
        text: '不办，等我走了再说',
        effects: { happy: -2, family: -6 },
        result: '你说"急什么"。他们没再说什么，但那之后来得很勤。你不知道该高兴还是该难过。'
      }
    ]
  },
  {
    id: 'e_things',
    stage: 7,
    age: 76,
    title: '整理东西',
    scene: '你在整理旧物。一沓信、几张照片、一个坏掉的手表、一张早已过期的火车票。',
    options: [
      {
        text: '把信一封封重读一遍',
        effects: { happy: 10, cha: 3 },
        result: '你读了很久。有些人还在，有些人已经不在了。你忽然发现，一个人一生的重量，大概就是这些纸片加起来的分量。'
      },
      {
        text: '全部扔掉，不留了',
        effects: { happy: 4, amb: 3 },
        result: '你把三大箱东西扔了，只留了一个盒子。你觉得轻松，也有一点点慌，像把一部分自己提前埋了。'
      },
      {
        text: '叫孩子过来，讲给他听',
        effects: { happy: 12, family: 8, cha: 4 },
        result: '你讲了一下午，他听得很认真，还问了很多你没想到的问题。你不知道他能记住多少，但那一刻你觉得，有些东西过去了。'
      }
    ]
  },
  {
    id: 'e_will',
    stage: 7,
    age: 77,
    title: '一张纸',
    scene: '你决定把身后事写清楚。写的时候，笔停了好几次。',
    options: [
      {
        text: '写得很细，连骨灰撒哪儿都写了',
        effects: { happy: 8, int: 4, family: 4 },
        result: '你写了三页。写完你把它锁进抽屉，跟存折放在一起。你觉得踏实——你把最后一件麻烦事也办妥了。'
      },
      {
        text: '只写了钱怎么分',
        effects: { happy: 2, family: -2 },
        result: '你写得很快，半小时就完了。写完之后你坐在那儿，觉得好像还应该写点别的，但不知道该写什么。'
      },
      {
        text: '写了一半，撕了',
        effects: { happy: -4, cha: 3 },
        result: '你写到一半，忽然不想写了。你把纸撕了，扔进垃圾桶。你想，到时候再说吧。'
      }
    ]
  },
  {
    id: 'e_firstlove',
    stage: 7,
    age: 78,
    title: '一条消息',
    scene: '手机响了一下。是一个很久以前的名字："听说你身体不太好，还好吗？"',
    options: [
      {
        text: '回了，聊了很久',
        effects: { happy: 12, cha: 5, health: 2 },
        result: '你们聊了两个小时，聊的都是家常。最后对方说"保重"。你说"你也是"。挂掉之后你坐了很久，想起十五岁那年的操场。'
      },
      {
        text: '看了很久，没回',
        effects: { happy: -4, cha: 3 },
        result: '你把手机放在桌上，看了很多次。最后你什么也没回。有些话隔了六十年，说出来反而轻了。'
      },
      {
        text: '回了句"还好，你也保重"',
        effects: { happy: 5, cha: 3 },
        result: '就这一句。对方回了个"嗯"。你把手机收起来，去阳台浇了花。外面的天很好。'
      }
    ]
  },
  {
    id: 'e_last',
    stage: 7,
    age: 79,
    slot: 'last',
    pinned: true,
    title: '如果重来一次',
    scene: '窗外的树又绿了。你坐在椅子上，忽然被问到一个问题——如果重来一次，你最想改的是哪一段？',
    sceneAlt: [
      '你最近老做梦，梦里都是年轻时候的地方：厂门口、学校后门、一间还没装修完的房子。醒来时天还没亮。',
      '医生跟家属说话的时候，你在看窗外。楼下有人推着一辆自行车，推得很慢，链条响了一路。',
      '你把手机里的照片翻了一遍，发现最近三年拍的，大多是饭桌和风景，几乎没有自己。',
      '有个很久没联系的人来看你。你们聊了两个小时，全是三十年前的事，谁也没提这些年。',
      '你让人把窗帘拉开一点。光进来，落在地板上，是一块很规整的长方形。你盯着它看了很久。'
    ],
    options: [
      {
        text: '那个没敢做的选择',
        effects: { happy: 2 },
        flags: ['regret_choice'],
        result: '你想起那个下午，如果当时点了头，或者当时说了那句话。你不知道会不会更好，你只是偶尔会想。'
      },
      {
        text: '那些没好好陪的人',
        effects: { happy: 2, family: 4 },
        flags: ['regret_people'],
        result: '你想起很多个"等我忙完"。你后来忙完了，但有些人没等。'
      },
      {
        text: '那些熬夜、生气、糟蹋的身体',
        effects: { happy: 2, health: 2 },
        flags: ['regret_health'],
        result: '你摸了摸自己的膝盖。它陪你走了这么远，你好像从来没好好谢过它。'
      },
      {
        text: '没什么想重来的',
        effects: { happy: 10, amb: 2 },
        flags: ['no_regret'],
        result: '你想了很久，摇了摇头。不是这一生没有遗憾，是你知道，改掉哪一段，你就不是你了。'
      }
    ]
  },
  {
    id: 'e_last_ward',
    stage: 7,
    age: 79,
    slot: 'last',
    title: '病房',
    scene: '病房里三张床，帘子拉着。护士来量血压，问你叫什么名字。窗外有阳光，但你不太想动。',
    options: [
      {
        text: '想那些没敢做的事',
        effects: { happy: 2, amb: 2 },
        flags: ['regret_choice'],
        result: '你想起二十二岁那个下午，你在报名表前站了很久，最后走了。你现在知道，那不是谨慎，是怕。你笑了一下，觉得也没什么。'
      },
      {
        text: '想那些人现在在哪里',
        effects: { happy: 3, family: 4 },
        flags: ['regret_people'],
        result: '你一个个想过去：母亲的手，爱人年轻时的样子，孩子第一次叫你。你想得很慢，像在数一串珠子。'
      },
      {
        text: '想如果能下床走走',
        effects: { happy: 2, health: 2 },
        flags: ['regret_health'],
        result: '你想起四十岁那年，医生让你戒烟，你说"再抽两年"。两年变成了二十年。你现在愿意用所有存款换一次能自己走到楼下的机会。'
      },
      {
        text: '什么也不想，看窗外',
        effects: { happy: 8, amb: 1 },
        flags: ['no_regret'],
        result: '你就那么看了一下午。天从白变黄，又变灰。你觉得这一生挺好，虽然没什么值得写下来的。'
      }
    ]
  },
  {
    id: 'e_last_oldhome',
    stage: 7,
    age: 79,
    slot: 'last',
    title: '老屋要拆了',
    scene: '老屋要拆了。你回来收拾最后一点东西。墙上有你小时候量身高的铅笔印，最高那道在你胸口。',
    options: [
      {
        text: '把铅笔印拍照带走',
        effects: { happy: 6, family: 5 },
        flags: ['regret_people'],
        result: '你蹲下来拍了很多张，从不同角度。拆迁队的人在门口等。你走的时候没回头，照片一直存在手机里，你偶尔会翻。'
      },
      {
        text: '在屋里坐一下午',
        effects: { happy: 5, health: -2 },
        flags: ['no_regret'],
        result: '你坐在门槛上，看院子里的光一点点移动。你想起很多事，但没有一件让你难受。你觉得人这一辈子能在一个地方住这么久，已经算运气。'
      },
      {
        text: '把能带的东西都带走',
        effects: { happy: 2, family: 3, con: 2 },
        flags: ['regret_choice'],
        result: '你装了六个纸箱：碗、相册、一把旧椅子。搬进新房子以后，那些东西一件也没用上，但你舍不得扔。'
      },
      {
        text: '什么也不带，锁门走了',
        effects: { happy: -3, amb: 3, cha: 3 },
        flags: ['regret_choice'],
        result: '你锁上门，把钥匙交给拆迁办。走了二百米，你回头看了一眼，然后继续走。有些东西留在原地，也算一种完整。'
      }
    ]
  },
  {
    id: 'e_last_kids',
    stage: 7,
    age: 79,
    slot: 'last',
    cond: s => s.flags.includes('has_child'),
    title: '他们回来了',
    scene: '儿孙都回来了，屋子里很挤。小孙子趴在你床边问："你年轻的时候是什么样的？"',
    options: [
      {
        text: '讲那些风光的事',
        effects: { happy: 9, cha: 4 },
        flags: ['no_regret'],
        result: '你讲了很久，讲得比事实好听一些。孩子们听得很认真。你想，人老了大概都会这样，把一生修剪成一个能讲的故事。'
      },
      {
        text: '讲那些后悔的事',
        effects: { happy: 4, family: 5, cha: 3 },
        flags: ['regret_people'],
        result: '你说"我年轻时太忙，没好好陪你奶奶"。屋子里安静了一下。小孙子没听懂，但他记住了你说话时的表情。'
      },
      {
        text: '说"没什么好讲的"',
        effects: { happy: -2, cha: -2, int: 2 },
        flags: ['regret_choice'],
        result: '你摆摆手，说"都是些平常事"。他们有点失望，很快聊起别的。你躺着听他们说话，觉得这样也挺好。'
      },
      {
        text: '只讲一件小事',
        effects: { happy: 7, family: 3 },
        flags: ['no_regret'],
        result: '你讲了七岁那年夏天停电，一家人点着蜡烛吃西瓜。讲完你说"就这些"。小孙子说"真好玩"。你笑了，觉得这一生被人这样听一遍，够了。'
      }
    ]
  },
  {
    id: 'e_last_sea',
    stage: 7,
    age: 79,
    slot: 'last',
    title: '海边',
    scene: '你一个人来了海边。风很大，你把外套领子立起来。你也不知道自己为什么想来这里。',
    options: [
      {
        text: '脱鞋走进水里',
        effects: { happy: 8, health: -3, con: 3 },
        flags: ['no_regret'],
        result: '水很凉，凉得你笑出声。你站了一会儿，慢慢走回来，坐在沙子上等鞋干。你想，这辈子能自己做主的事不多，这一件算一件。'
      },
      {
        text: '给一个人打电话',
        effects: { happy: 6, family: 6, cha: 3 },
        flags: ['regret_people'],
        result: '你翻了很久通讯录，最后拨给了妹妹。接通以后你们没说几句正经话。挂了电话，你觉得海没那么冷了。'
      },
      {
        text: '坐着看天黑',
        effects: { happy: 5, int: 3 },
        flags: ['no_regret'],
        result: '你看着太阳掉进海里，天一点点暗下来。你想起很多人，有的还在，有的不在了。你没有难过，只是觉得安静。'
      },
      {
        text: '早点回去，别着凉',
        effects: { health: 4, happy: 2, amb: -2 },
        flags: ['regret_health'],
        result: '你走了。回去的路上买了一碗热汤面。你忽然觉得，能照顾好自己也是一种本事，你学得有点晚。'
      }
    ]
  },
  {
    id: 'e_last_classroom',
    stage: 7,
    age: 79,
    slot: 'last',
    title: '那间教室',
    scene: '你梦见自己回到了十七岁的教室。黑板上写着倒计时，同桌在打瞌睡，窗外的树和那年一样。',
    options: [
      {
        text: '把那张卷子重新做一遍',
        effects: { happy: 5, int: 3 },
        flags: ['regret_choice'],
        result: '你在梦里做完了整张卷子，最后一道大题也做出来了。醒过来你愣了很久，然后笑了——你终于把那道题做出来了，隔了六十二年。'
      },
      {
        text: '去跟一个人说句话',
        effects: { happy: 7, cha: 4, family: 3 },
        flags: ['regret_people'],
        result: '你在梦里走到那个座位旁边，说"其实我一直挺喜欢你"。对方抬起头，笑了一下。醒来你眼睛是湿的，但心里很轻。'
      },
      {
        text: '就坐在那儿，什么都不做',
        effects: { happy: 9, health: 2 },
        flags: ['no_regret'],
        result: '你就坐着，听粉笔在黑板上响，听后排的人小声说话。你不想改变任何事，只想再坐一会儿。醒来的时候，天已经亮了。'
      },
      {
        text: '醒过来，起床吃药',
        effects: { health: 3, happy: 1, amb: 2 },
        flags: ['regret_health'],
        result: '你在闹钟响之前就醒了。你躺着看天花板，把梦里的事想了一遍，然后起来吃药、量血压。日子还要过，梦只能做到这儿。'
      }
    ]
  }
]

/* ============================================================
 *  路径专属：体制内 / 创业 / 自由职业
 *  公司线有裁员、猎头、晋升，这三条路也得有自己的关卡，
 *  否则玩家选了考公或创业，中年还在被 HR 叫去会议室。
 * ============================================================ */

const PATH_EVENTS = [
  {
    id: 'a_gov_review',
    always: true,
    stage: 5,
    age: 31,
    title: '一个名额',
    scene: '科室今年只有一个评优名额。领导话说得很客气："你还年轻，机会多。"桌对面的老周还有两年退休，他一句话没说。',
    cond: s => s.flags.includes('gov'),
    options: [
      {
        text: '争一次，把这一年的活摆出来',
        effects: { amb: 6, cha: 4, happy: -2, family: -2 },
        resolve(s, rng) {
          if (s.cha + s.amb * 0.4 + rng() * 40 > 60) {
            s.career += 1
            return { tone: 'good', effects: { happy: 8 }, text: '你把这一年的台账、材料、加班记录一项项列出来，领导听完沉默了一会儿，说"我再想想"。名额最后给了你。老周在走廊里跟你点了点头，什么也没说。' }
          }
          return { tone: 'bad', effects: { happy: -6 }, text: '领导说"年轻人要有格局"。名额给了老周。你在楼梯间站了一会儿，忽然明白了一件事：在这里，干活和得到是两件事。' }
        }
      },
      {
        text: '不争，让给老周',
        effects: { happy: 5, cha: 3, family: 2 },
        result: '你说"老周快退休了，给他吧"。老周退休那天，把一个记了二十年的人情本塞给你，说"哪个人办什么事，上面都写着"。这本东西后来比一个评优有用得多。'
      },
      {
        text: '名额不要，换点实在的',
        effects: { int: 4, cha: 5, happy: 2, career: 1 },
        result: '你跟领导说："荣誉我不要，能不能给我一个实习生和一笔培训经费。"领导答应了。半年后你手上多了一个能干的人，也多了一门新本事。'
      }
    ]
  },
  {
    id: 'a_biz_cash',
    always: true,
    stage: 5,
    age: 33,
    title: '发工资那天',
    scene: '月底要发工资，账上的钱只够发一半。两个客户的钱压在账期里，一个说"下周"，这句话他已经说了三次。',
    cond: s => s.flags.includes('founder'),
    options: [
      {
        text: '先发员工，把自己的钱垫进去',
        effects: { money: -8, happy: -3, family: -4, cha: 6 },
        result: '你垫了三个月。员工一个没走，有个小姑娘跟你说"老板，你要是撑不住跟我们说"。你差点没忍住。钱后来回来了，但那三个月你记住了什么叫"身后有人"。'
      },
      {
        text: '晚发十天，跟大家说清楚',
        effects: { money: -2, cha: 4, happy: -2 },
        result: '你把所有人叫到会议室，把账上的数字直接投在屏幕上。有人沉默，有人问"能撑多久"。十天之后钱到了，工资一分不少。你第一次发现，坦白比画饼更留人。'
      },
      {
        text: '裁掉两个人，先保现金流',
        effects: { money: 4, happy: -8, health: -4, amb: 3 },
        result: '你亲自跟那两个人谈的。一个哭了，一个说"我懂"。他们走的那天，你把办公室的门关了很久。生意活下来了，但你再也没在年会上说过"我们是一家人"。'
      },
      {
        text: '刷信用卡、借一笔，先扛过这个月',
        effects: { money: 5, happy: -2, health: -3 },
        flags: ['debt'],
        result: '你用个人名义借了二十万。利息不低，但你保住了这个月的工资和两个客户。后来每次手机弹出还款提醒，你都会想起那个下午。'
      }
    ]
  },
  {
    id: 'a_free_late',
    always: true,
    stage: 5,
    age: 34,
    title: '尾款',
    scene: '活干完三个月了，尾款还没到。对方微信一直在，就是不提钱。这三个月你靠信用卡过。',
    cond: s => s.flags.includes('freelance'),
    options: [
      {
        text: '天天催，把话说难听',
        effects: { money: 5, cha: -2, happy: -3 },
        result: '你连着打了十一天电话，钱要回来了，合作也断了。对方在圈子里说你"不好合作"。你算了一下：这笔钱八万，那个圈子一年能给你二十万。'
      },
      {
        text: '走流程，发律师函',
        effects: { money: 3, int: 4, happy: 2, health: -2 },
        result: '你花两千块找了律师，一封函过去，钱三天就到了。你从此在自己的合同里加了一条：逾期按日千分之五。这条字救了你好几次。'
      },
      {
        text: '认了，把这家的活往后排',
        effects: { money: -6, happy: 3, amb: 4 },
        result: '你没再追，也没再接他们的活。年底他们又来找你，报价涨了三成，你答应了。这一次预付款到账才开机。'
      }
    ]
  },
  {
    id: 'a_biz_partner',
    always: true,
    stage: 5,
    age: 39,
    title: '他要走',
    scene: '一起干了十几年的合伙人说他累了，想把股份卖掉，回老家开个小店。你算了一下，把他的股份买下来，账上就空了。',
    cond: s => s.flags.includes('founder'),
    options: [
      {
        text: '买下来，自己扛',
        effects: { money: -22, amb: 8, health: -6, happy: -2 },
        result: '你把股份全买了下来，公司从此只有一个老板。压力大了一倍，决策快了一倍。他走那天，你们在公司楼下喝了顿酒，谁都没提股份的事。'
      },
      {
        text: '让他卖给外面的人，你退一步',
        effects: { money: 10, happy: 4, amb: -6 },
        result: '股份卖给了新进来的投资人。你从"创始人"变成了"股东兼总经理"，很多事要开会决定。你多了一点钱，少了一点说一不二的痛快。'
      },
      {
        text: '两个人关起门来谈一次',
        effects: { cha: 6, happy: 5, int: 3 },
        resolve(s, rng) {
          if (s.cha + s.family * 0.2 + rng() * 40 > 58) {
            return { tone: 'good', effects: { money: -8 }, text: '你们谈到凌晨三点，把这十几年的委屈都说了。最后他留下，股份减了一半，人还在这儿。你后来跟人说：合伙这件事，靠的不是合同，是能不能把难听的话说完。' }
          }
          return { tone: 'neutral', effects: { happy: -6 }, text: '你们谈崩了。他说"你从来没把我当合伙人，只当我是干活的"。你想反驳，发现心里有点虚。他三个月后走了。' }
        }
      }
    ]
  },
  {
    id: 'm_free_insure',
    always: true,
    stage: 6,
    age: 44,
    title: '断缴',
    scene: '社保断了两年，你想补上，才发现要一次性交清，还要交滞纳金。窗口的人问你："你属于哪个单位？"你一时答不上来。',
    cond: s => s.flags.includes('freelance'),
    options: [
      {
        text: '一次补齐，该交的交',
        effects: { money: -12, happy: 4, health: 5, amb: 2 },
        result: '你交了近十万，把这两年补上。走出大厅，你第一次认真想"老了怎么办"这件事。自由是有价格的，你那天看到了发票。'
      },
      {
        text: '只交医保，养老以后再说',
        effects: { money: -4, health: 3, happy: -2 },
        result: '你只续了医保。养老那栏空着，你安慰自己"以后再说"。后来你每年都会想一次这件事，然后每年都把它往后放一年。'
      },
      {
        text: '找家公司挂靠',
        effects: { money: -6, int: 3, happy: 2 },
        result: '你找朋友的公司挂着，每个月交一笔服务费，名义上算个员工。你成了自己口中最不想成为的那种"挂靠的人"，但你有了五险一金。'
      }
    ]
  },
  {
    id: 'm_gov_ceiling',
    always: true,
    stage: 6,
    age: 46,
    title: '到顶了',
    scene: '同一批进来的三个人，两个提了副处。你的名字还在原来的位置上，前面排着两个比你年轻的。',
    cond: s => s.flags.includes('gov'),
    options: [
      {
        text: '认了，把日子过舒服',
        effects: { happy: 9, amb: -6, health: 4, family: 6 },
        result: '你不再抢活，按时下班，周末带孩子去钓鱼。有人说你"混"，你不辩。你知道自己换回来的是什么：晚上能睡着，家里人脸色好看。'
      },
      {
        text: '换个更忙的岗位，再搏一次',
        effects: { amb: 8, health: -6, happy: -4 },
        resolve(s, rng) {
          if (s.amb * 0.5 + s.cha * 0.4 + rng() * 40 > 62) {
            s.career += 2
            return { tone: 'good', effects: { money: 6, happy: 6 }, text: '你去了最忙的那个科室，两年做了三件别人不愿意碰的硬事。四十八岁那年，你的名字终于上了名单。你知道这不是补偿，这是你自己挣回来的。' }
          }
          return { tone: 'bad', effects: { happy: -8, health: -4 }, text: '你去了最忙的科室，白加黑干了三年。名单上还是没有你。四十九岁那年体检，报告上多了两个箭头。你把报告折起来放进抽屉。' }
        }
      },
      {
        text: '把重心挪到业务上，考个证',
        effects: { int: 7, amb: 3, money: 4, health: -2 },
        result: '你考了一个业内证书，开始接一些评审和讲课的活。工资没涨，但你有了另外一套本事和另外一拨人。你在这个单位里第一次觉得，自己不是只剩一条路。'
      }
    ]
  },
  {
    id: 'm_free_client',
    stage: 6,
    age: 41,
    always: true,
    title: '换了一家',
    scene: '合作了六年的客户说，他们换了一家，报价比你低三成。对方在电话里说"不是你的问题"，声音很客气。',
    cond: s => s.flags.includes('freelance'),
    options: [
      {
        text: '降价，先留住',
        effects: { money: -5, happy: -6, amb: -3 },
        result: '你报了个几乎不赚钱的价，客户留下了。接下来两年你一直在给这个价干活，每次改方案都要算成本。你保住了收入，也把自己钉在了这个价位上。'
      },
      {
        text: '不降，去做更贵的活',
        effects: { amb: 8, money: -6, health: -3, happy: 2 },
        resolve(s, rng) {
          if (s.cha + s.career * 2 + rng() * 35 > 62) {
            s.career += 1
            return { tone: 'good', effects: { money: 12 }, text: '你把精力全挪到了两个更挑人的客户身上，报价翻了一倍。半年后新客户介绍来了第三个。你后来跟人说：降价是唯一一条越走越窄的路。' }
          }
          return { tone: 'bad', effects: { happy: -8 }, text: '你硬撑着没降，接下来四个月一单没接。最后你还是接了那个价，只是中间空了四个月。有些骨气是很贵的，你那年知道了多少钱一斤。' }
        }
      },
      {
        text: '索性只留两个客户，把时间还给自己',
        effects: { happy: 8, money: -3, health: 5, amb: -4 },
        result: '你推掉了三分之二的活，收入少了一截，但你终于能在工作日的下午去接孩子、去游泳、去看一场电影。你第一次觉得，时间也是一种收入。'
      }
    ]
  },
  {
    id: 'm_biz_sell',
    always: true,
    stage: 6,
    age: 49,
    title: '有人想买',
    scene: '一家同行找上门，说想收了你这间公司，报价是去年利润的六倍。签了字，你就不用再每天早上六点醒。',
    cond: s => s.flags.includes('founder'),
    options: [
      {
        text: '卖。钱落袋为安',
        effects: { money: 52, happy: 6, health: 6, amb: -8 },
        flags: ['sold_company'],
        result: '签字那天你穿了件衬衫，笔有点抖。交接三个月，你把每一个客户都介绍给了新老板。最后一天你把工牌交出去，忽然发现自己不知道明天该几点起。'
      },
      {
        text: '不卖，再干十年',
        effects: { amb: 10, health: -6, happy: -2 },
        result: '你回了"再等等"。同行后来做大了，你的公司还是这么大。有人替你不值，你说"我这公司二十个人，二十个家庭，卖了他们去哪儿"。'
      },
      {
        text: '卖一半，人留下',
        effects: { money: 24, cha: 5, happy: 4, health: -2 },
        result: '你卖了四成股份，钱进了一部分，你还在管事。从此你多了一个要汇报的人，也多了一笔能兜底的现金。你第一次觉得"不全赢"也是一种赢法。'
      }
    ]
  }
]

/* ------- 汇总 ------- */

return [].concat(CHILDHOOD, TEEN, YOUTH, ADULT, MIDDLE, ELDER, PATH_EVENTS)

})
