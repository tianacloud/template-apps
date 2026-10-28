/**
 * core/events-pool.js —— 末日模拟器 · 事件族
 *
 * 一个族 = 同一种困境的十几种写法。engine 会保证同族一局只出一条。
 * 每个族用 build(v) 把参数拼进文本，所以「抢东西的人」可以是三个人，也可以是两辆车。
 *
 * 族的构成方式与人生模拟器一致：
 *   variant   参数表（人物 / 地点 / 数量 / 时间）
 *   build(v)  返回一条完整事件（title / scene / options）
 *   optPanels 选项面板的多套说法（按开局哈希挑一套，语义不变）
 *
 * PER_FAMILY 控制每个族展开多少条。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DoomEventsPool = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const PER_FAMILY = 16
const F = (s, f) => (s.flags || []).indexOf(f) >= 0
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)]

/* ------------------------------------------------------------
 *  参数池
 * ---------------------------------------------------------- */

const WHO = [
  '一个瘦得脱相的男人', '两个年轻人', '一对夫妻', '一个抱着孩子的女人',
  '三个不说话的', '一个上了年纪的奶奶', '一群半大的孩子', '一个穿工装的中年人',
  '一个说自己当过医生的女人', '一个不肯说名字的男人', '四五个结伴的',
  '一个背着手风琴的老人', '一个拖着行李箱的学生', '一个提着鸟笼的老头',
  '两个背着枪的', '一个一瘸一拐的人'
]

const PLACE = [
  '楼下的车棚', '街角那个小卖部', '废弃的地铁站口', '城东的旧厂区',
  '河边的一排平房', '原来的小学操场', '一片烧过的居民楼', '高速路的收费站',
  '镇上的加油站', '一条结了冰的河', '地下车库的负二层', '一个还能出水的公共厕所',
  '菜市场的大棚', '旁边的废弃诊所', '一条没人的村道', '原来最热闹的那条商业街'
]

const THING = [
  '半箱罐头', '一桶柴油', '一袋米', '几盒抗生素', '一把还能用的铁锹',
  '一箱蜡烛', '两瓶医用酒精', '一只活着的鸡', '一大块塑料布', '半扇冻着的猪肉',
  '一台还能摇响的发电机', '一捆电线', '几件厚棉衣', '一桶食用油', '一箱方便面',
  '一套修车的工具'
]

const WHEN = ['凌晨三点', '天刚亮的时候', '傍晚', '半夜', '下雪的那天夜里', '正午', '下雨的下午']

/* ------------------------------------------------------------
 *  族：抢 / 被抢
 * ---------------------------------------------------------- */

const FAM_RAID = {
  id: 'fam_raid',
  stages: [3, 4, 5, 6, 7],
  variants: WHO.flatMap((who, i) =>
    [0, 1, 2, 3].map(j => ({
      who,
      place: PLACE[(i * 3 + j) % PLACE.length],
      when: WHEN[(i + j) % WHEN.length],
      thing: THING[(i * 2 + j) % THING.length]
    }))
  ),
  build(v) {
    return {
      title: '守着东西的人',
      scene: `${v.when}，${v.who}站在${v.place}，脚边是${v.thing}。你没有打算抢他，但你手里有东西，他也看见了。你们隔着七八米，谁都没有动。`,
      optPanels: [
        ['先开口，问他是谁', '绕开，走过去', '举起来，让他走'],
        ['说话，先探探', '装作没看见', '亮出家伙'],
        ['隔着距离喊一句', '从另一边绕过去', '不走了，盯着他'],
      ],
      options: [
        {
          text: '先开口，问他是谁',
          effects: { morale: 3 },
          resolve: (s, rng) => {
            if (rng() < 0.6) {
              return { text: `他愣了一下，然后说他只是路过，家在${v.place}那边。你们聊了三句。他走的时候把${v.thing}往你这边推了一点，说「你拿一半吧，我一个人用不了」。你没有拿全。`, tone: 'good', effects: { supply: 4, morale: 5 }, flags: ['met_kind_stranger'] }
            }
            return { text: '他没有回答，转身就跑了，把他那东西留在了原地。你走过去看了看，是真的。你没追——追上去反而更像抢。', tone: 'neutral', effects: { supply: 5 } }
          }
        },
        {
          text: '绕开，走过去',
          effects: { morale: -2 },
          result: `你从他身边走过去。他一直没有转身，到你走远了才听见身后有动静。你不知道他后来怎么样。你只知道${v.thing}不是你的，你也不打算去拿。`
        },
        {
          text: '举起来，让他走',
          effects: { supply: 6, morale: -8, flags: ['took_from_weak'] },
          resolve: (s, rng) => {
            if (rng() < 0.75) {
              return { text: `他跑了。${v.thing}留在原地。你走过去拿起来的时候，发现上面还热着——他一直抱着它。你回家之后把东西放下，手心里全是汗。`, tone: 'bad' }
            }
            return { text: `他没有走，反而往前迈了一步。你才发现他背后还有两个人。你们打了一场，你只保住了一半，还挨了一棍。`, tone: 'bad', effects: { health: -10, supply: 2 } }
          }
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：受伤与病
 * ---------------------------------------------------------- */

const INJURY = [
  { what: '从梯子上摔下来', part: '腿', eff: { health: -10 } },
  { what: '被生锈的铁片划开小腿', part: '小腿', eff: { health: -8 }, flag: 'wounded' },
  { what: '搬东西时腰扭了', part: '腰', eff: { health: -6 }, flag: 'chronic_pain' },
  { what: '被倒塌的墙压住一条腿', part: '腿', eff: { health: -16 } },
  { what: '一锅开水浇在手上', part: '左手', eff: { health: -8 } },
  { what: '被玻璃划破手掌', part: '手掌', eff: { health: -6 } },
  { what: '从二楼跳下来落地不对', part: '脚踝', eff: { health: -12 } },
  { what: '被门夹断了两根手指', part: '手指', eff: { health: -10 } }
]

const FAM_INJURY = {
  id: 'fam_injury',
  stages: [2, 3, 4, 5, 6, 7],
  variants: INJURY.flatMap(a => PLACE.slice(0, 8).map(place => Object.assign({}, a, { place }))),
  build(v) {
    return {
      title: '这一下不轻',
      scene: `${v.what}。你在${v.place}躺了一会儿，试着动${v.part}，疼得眼前发白。天快黑了，你得决定怎么办。`,
      optPanels: [
        ['自己包扎，撑回去', '在原地等人帮忙', '趁还能走，先回家'],
        ['咬牙处理一下', '喊人', '慢慢挪回去'],
        ['硬扛，先忍住', '看看有没有人经过', '先止血，再想'],
      ],
      options: [
        {
          text: '自己包扎，撑回去',
          effects: Object.assign({ morale: -2 }, v.eff),
          resolve: (s, rng) => {
            const med = F(s, 'medic') || F(s, 'learned_med') || F(s, 'nurse_skill')
            const ok = rng() < (med ? 0.7 : 0.45) + (s.health > 60 ? 0.15 : 0)
            if (ok) return { text: `你用布条扎紧，走一段歇一段，花了两个小时回到屋里。伤处肿了三天，之后就慢慢好了。${v.part}从此留下一个印子。`, tone: 'neutral', effects: { health: 4 } }
            return { text: '你自己处理得不好。伤口发了炎，你烧了五天，靠着最后一点药和自己命硬扛过来。之后这块地方总是比别处怕冷。', tone: 'bad', effects: { health: -8 }, flags: ['wounded'] }
          }
        },
        {
          text: '在原地等人帮忙',
          effects: v.eff,
          resolve: (s, rng) => {
            if (rng() < 0.55) return { text: '过了四十分钟，有人经过了。他不认识你，但还是把你扶了回去，说了一路废话，你听着觉得踏实。你后来一直记得他穿的那件蓝色外套。', tone: 'good', effects: { health: 6, morale: 5 }, flags: ['helped_by_stranger'] }
            return { text: '没有人经过。天黑了，温度掉下来，你自己爬起来了。回到家后你想的不是疼，是「如果今天更冷一点，我就死在那儿了」。', tone: 'bad', effects: { health: -8, morale: -6 } }
          }
        },
        {
          text: '趁还能走，先回家',
          effects: Object.assign({ morale: 1 }, v.eff),
          result: `${v.part}后来肿得比原来粗了一圈。你用了三天才勉强能下楼。这三天你什么都没干，也没吃东西，只喝了水。`
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：换东西
 * ---------------------------------------------------------- */

const FAM_TRADE = {
  id: 'fam_trade',
  stages: [3, 4, 5, 6, 7],
  variants: THING.flatMap((thing, i) =>
    PLACE.slice(0, 8).map((place, j) => ({
      thing,
      place,
      other: THING[(i + 5 + j) % THING.length],
      who: WHO[(i + j * 3) % WHO.length]
    }))
  ),
  build(v) {
    return {
      title: '一笔换东西的买卖',
      scene: `${v.who}在${v.place}摆了个摊，地上铺着塑料布。他能给你${v.thing}，要你出${v.other}。他说得很直白：「这价钱明天就变了。」`,
      optPanels: [
        ['换，现在就需要这个', '不换，太亏', '讲价，能省一点是一点'],
        ['成交', '算了，不用', '磨一磨价'],
        ['换了，省得再跑一趟', '不换', '试着压一压'],
      ],
      options: [
        {
          text: '换，现在就需要这个',
          effects: { supply: -6, camp: 4, health: 3 },
          result: `你换了。他收东西的时候很快，像是怕你反悔。回家路上你算了算，觉得略微吃亏，但你确实需要${v.thing}。这世道里，「需要」比「划算」重要。`
        },
        {
          text: '不换，太亏',
          effects: { morale: 2 },
          result: '你摇摇头走了。他在身后喊了一句「明天更贵」，你没回头。第三天你回来的时候，那东西已经没了，价格牌也换了一张。你站在空地上，觉得这世道连后悔都很快。'
        },
        {
          text: '讲价，能省一点是一点',
          effects: { supply: -3, camp: 4, morale: -1 },
          resolve: (s, rng) => {
            if (F(s, 'silver_tongue') || rng() < 0.55) {
              return { text: `你讲了半天，最后省了两天的东西。他一边收一边说「你这人不好打交道」。你笑了：这大概是这几年听过最好的评价。`, tone: 'good', effects: { morale: 4 }, flags: ['knows_trader'] }
            }
            return { text: '他没让步，还说「你可以不换」。你最后还是换了，只是心里不太舒服。这种不舒服很熟悉——封城之前在公司谈合同也是这个感觉。', tone: 'neutral' }
          }
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：有人求你
 * ---------------------------------------------------------- */

const FAM_BEG = {
  id: 'fam_beg',
  stages: [3, 4, 5, 6, 7],
  variants: WHO.flatMap(who =>
    [
      { ask: '给孩子找一点吃的', tag: 'kid' },
      { ask: '借一点药', tag: 'med' },
      { ask: '求一个过夜的地方', tag: 'shelter' },
      { ask: '借一把工具，说三天还', tag: 'tool' }
    ].map(a => ({ who, ask: a.ask, tag: a.tag }))
  ),
  build(v) {
    return {
      title: '门口有人',
      scene: `${v.who}站在门口，说得很轻，一直没敢抬头：${v.ask}。你身后是自己也不多的存货，面前是一个活人。这个判断你做过很多次，每一次都比上一次难。`,
      optPanels: [
        ['给了，不要回报', '拒绝，把门关上', '给一点，让他拿活来换'],
        ['能帮就帮吧', '说没有', '让他干点活'],
        ['给，别问了', '关上门', '换点活干'],
      ],
      options: [
        {
          text: '给了，不要回报',
          effects: { supply: -5, morale: 8 },
          resolve: (s, rng) => {
            if (rng() < 0.4) {
              return { text: '他接了东西，说了声谢谢就走了。两天后你的门缝里塞进来一小包东西——是他能找到的最好的。你从此知道这一带还有一个这样的人。', tone: 'good', effects: { supply: 3, morale: 4 }, flags: ['helped_everyone', 'met_kind_stranger'] }
            }
            return { text: `你给了他。他走得很慢，走到路口回头看了一眼。你不知道自己做对了没有，只知道今晚会睡得着。`, tone: 'good', effects: { morale: 4 }, flags: ['helped_everyone'] }
          }
        },
        {
          text: '拒绝，把门关上',
          effects: { morale: -7 },
          resolve: (s, rng) => {
            if (rng() < 0.5) return { text: '你说了句「我们也没有」，把门关上。门关上之后你听见他在门口站了一会儿才走。你靠在门后面，觉得这堵门同时挡住了两个人。', tone: 'bad', effects: { camp: 2 } }
            return { text: '你拒绝了。第二天早上你听说他在隔壁楼被人打了，东西全抢走了。你没法把这两件事连起来，也没法不连起来。', tone: 'bad', effects: { morale: -4 } }
          }
        },
        {
          text: '给一点，让他拿活来换',
          effects: { supply: -3, camp: 6, morale: 3 },
          result: '你让他劈了一下午柴，然后给了他东西。他干得很认真，认真得有点过分。走的时候他说「你这个人还算讲道理」——这句话在这世道里，已经算很高的评价。',
          flags: ['set_rules']
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：孩子
 * ---------------------------------------------------------- */

const FAM_KID = {
  id: 'fam_kid',
  stages: [3, 4, 5, 6],
  variants: [
    { act: '蹲在你门口，不吃不说话', age: '六七岁' },
    { act: '跟着你走了两条街', age: '十岁左右' },
    { act: '在垃圾堆旁边翻东西', age: '八九岁' },
    { act: '站在你院墙外看你干活', age: '五六岁' },
    { act: '抱着一只猫坐在楼道里', age: '七八岁' },
    { act: '在你放东西的地方等了一整天', age: '十一二岁' },
    { act: '被大一点的孩子推倒，没有哭', age: '六岁' },
    { act: '一直问你「我妈妈什么时候回来」', age: '四五岁' }
  ].map(x => Object.assign(x, {
    place: pick(PLACE, Math.random)
  })),
  build(v) {
    return {
      title: '一个孩子',
      scene: `一个${v.age}的孩子${v.act}。你没看见大人。你在他旁边站了一会儿，他抬头看你，什么也没说。`,
      optPanels: [
        ['带走，管他一口饭', '给点吃的，走开', '先问清楚他家里人呢'],
        ['领回去', '给一包饼干', '问他怎么一个人'],
        ['带他回去', '放点吃的就走', '先弄清楚情况'],
      ],
      options: [
        {
          text: '带走，管他一口饭',
          effects: { supply: -8, people: 1, morale: 10 },
          result: `你把他带回去了。他很安静，第一晚睡在门口，第二天才敢往里挪。第三天他叫你，声音很小。你后来才知道那两个字是「叔叔」还是「爸爸」，他自己也说不清。`,
          flags: ['has_kid', 'took_in', 'orphans']
        },
        {
          text: '给点吃的，走开',
          effects: { supply: -3, morale: -2 },
          result: '你把身上的饼干给了他。他接过去，没吃，收进了口袋。你走开的时候他一直看着你。这个眼神你这一天做什么事都会想起来。'
        },
        {
          text: '先问清楚他家里人呢',
          effects: { morale: -4 },
          resolve: (s, rng) => {
            if (rng() < 0.5) {
              return { text: `他说不清，只会重复「爸爸去买东西了」。你陪他等了一个小时，没有人来。你最后把他带走了——不是做了什么决定，是没办法把他留在那儿。`, tone: 'good', effects: { people: 1, morale: 6 }, flags: ['has_kid', 'took_in', 'orphans'] }
            }
            return { text: '他说家里人都走了。他说这话的时候没有哭，也没有看你。你给他留了半包吃的，走了。你告诉自己：这地方养不了孩子。', tone: 'bad', effects: { supply: -2 } }
          }
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：天气
 * ---------------------------------------------------------- */

const FAM_WEATHER = {
  id: 'fam_weather',
  stages: [2, 3, 4, 5, 6, 7],
  variants: [
    { kind: '暴雨', detail: '雨下了两天两夜，地下车库灌了半米深的水' },
    { kind: '暴雪', detail: '雪把一楼的门埋了一半，楼道里没有暖气' },
    { kind: '大风', detail: '风把楼顶的铁皮掀了，砸在院子里，一路响到天亮' },
    { kind: '冰雹', detail: '冰雹有鸡蛋大，把菜地和窗户全砸了' },
    { kind: '高温', detail: '连续十天四十度，水放一天就坏，人也不敢动' },
    { kind: '大雾', detail: '雾浓得看不见三米外，什么声音都被吞掉了' },
    { kind: '寒潮', detail: '夜里零下二十几度，水管冻裂，屋里的水缸结了一层冰' },
    { kind: '沙尘', detail: '黄色的沙尘从西边过来，一天之内把天压成暗红色' }
  ].map(x => Object.assign(x, { place: pick(PLACE, Math.random) })),
  build(v) {
    return {
      title: v.kind,
      scene: `${v.detail}。你在${v.place}，能听见外面的声音一阵一阵。屋里的人都在看着你，等你说话。`,
      optPanels: [
        ['先把人聚到安全的地方', '先保住东西', '出去看看情况'],
        ['人先撤', '先抢东西', '出去探一探'],
        ['先管人', '先管存货', '自己去看看'],
      ],
      options: [
        {
          text: '先把人聚到安全的地方',
          effects: { health: 5, morale: 6, camp: 4, supply: -4 },
          result: '你把所有人集中到最结实的那间屋子，把门堵好，点了一堆小火。这一场过去了。东西湿了一些、坏了一些，但一个都没少。',
          flags: ['saved_people']
        },
        {
          text: '先保住东西',
          effects: { supply: 4, health: -8, morale: -4 },
          result: '你冲出去抢搬东西，来回三趟。东西保住了大半，你冻伤了两个手指头，指甲后来掉了一个。有人在屋里一直在喊你回来，你没回头。'
        },
        {
          text: '出去看看情况',
          effects: { health: -10, camp: 6, morale: 2 },
          resolve: (s, rng) => {
            if (rng() < 0.5) {
              return { text: `你出去走了半圈，发现东边那栋楼塌了一角，里面还住着人。你回来叫人一起去挖，挖出来两个人，救了一个。剩下那个你记住了一辈子。`, tone: 'neutral', effects: { people: 1, morale: 6 }, flags: ['rescued'] }
            }
            return { text: '你出去探了情况，回来时发现自家的东西被雨淋了一半。你没有生气，只是坐在地上，很慢很慢地把湿了的粮食摊开晾。', tone: 'bad' }
          }
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：选择放弃某个人
 * ---------------------------------------------------------- */

const FAM_LEAVE = {
  id: 'fam_leave',
  stages: [3, 4, 5, 6],
  variants: [
    { who: '一个发着高烧的人', why: '烧了五天不退，带着他走不掉' },
    { who: '一个走不动路的老人', why: '腿伤没好，每走一百米要歇一次' },
    { who: '一个腿被压伤的人', why: '骨头断了，接不上，也抬不动' },
    { who: '一个不肯走的人', why: '他说他哪儿都不去，就死在这儿' },
    { who: '一个刚生完孩子的女人', why: '她动不了，孩子还在哭' },
    { who: '一个伤了眼睛的人', why: '看不见路，得有人牵着' },
    { who: '一个总说胡话的人', why: '他不知道自己在说什么，也不知道自己在哪' },
    { who: '一个替你挡了一刀的人', why: '他流了很多血，你背不动他' }
  ].map(x => Object.assign(x, { place: pick(PLACE, Math.random) })),
  build(v) {
    return {
      title: '带不走的那个',
      scene: `你们必须在天亮前离开${v.place}。${v.who}——${v.why}。所有人都在等你决定，包括他自己。`,
      optPanels: [
        ['我背他走', '把他安置好，留东西，然后走', '留下来陪他'],
        ['背，慢也背', '给他留够东西再走', '不走，一起死'],
        ['抬也要抬走', '找个地方安顿他', '留下'],
      ],
      options: [
        {
          text: '我背他走',
          effects: { health: -18, morale: 12, camp: -4 },
          resolve: (s, rng) => {
            if (rng() < 0.55 + (s.health > 65 ? 0.15 : 0)) {
              return { text: '你背着他走了四公里，中间歇了十一次。到地方的时候你的肩膀出血了，但他在。他现在还活着，还跟你在一道门里。', tone: 'good', effects: { morale: 8 }, flags: ['saved_one', 'carried'] }
            }
            return { text: '你背了两公里，实在背不动了。他自己说「放下我吧」。你放下了，蹲在地上喘了很久。后来你们走了，他留在路边。你一直没敢回头。', tone: 'bad', effects: { morale: -14 }, flags: ['left_behind'] }
          }
        },
        {
          text: '把他安置好，留东西，然后走',
          effects: { supply: -8, morale: -10 },
          result: '你把他抬进一个还算结实的屋子里，留下了水、吃的和一把刀。他没有说谢谢，也没有骂你。你走的时候他已经在看天花板了。',
          flags: ['left_behind', 'left_someone_good']
        },
        {
          text: '留下来陪他',
          effects: { camp: -12, health: -6, morale: 10 },
          result: '你让其他人先走，自己留下了。你们在那个地方又待了六天，直到他能走路。代价是回去之后你们发现家被占了。但这件事后来成了你唯一能理直气壮讲出去的事。',
          flags: ['stayed_with_weak']
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：发现好东西
 * ---------------------------------------------------------- */

const FAM_FIND = {
  id: 'fam_find',
  stages: [2, 3, 4, 5, 6, 7],
  variants: [
    { what: '一整箱没拆封的罐头', where: '一栋空楼的厨房里', risk: '上面两层有人住过的痕迹' },
    { what: '一桶还能用的汽油', where: '一辆翻在沟里的车旁边', risk: '车里有个人，已经硬了' },
    { what: '一柜子的药', where: '原来的诊所里', risk: '门是从外面锁的' },
    { what: '几袋没受潮的米', where: '一个老仓库的夹层', risk: '进去要爬过一段塌了的结构' },
    { what: '一台还能转的发电机', where: '一家小厂的仓库', risk: '厂里有人，不知道几个' },
    { what: '两箱消毒酒精', where: '原来的医院旁边的杂物间', risk: '那一片最近有人抢过' },
    { what: '一整套修车工具', where: '路边的一个维修点', risk: '维修点的门是新锁的' },
    { what: '一柜子的厚衣服', where: '一家关门的服装店', risk: '玻璃门碎了一半，街上的人都能看见' }
  ].map(x => Object.assign(x, { place: pick(PLACE, Math.random) })),
  build(v) {
    return {
      title: '好东西',
      scene: `你在${v.where}发现了${v.what}。问题只有一个：${v.risk}。你在那儿站了一会儿，算这个风险值不值。`,
      optPanels: [
        ['进去，全拿走', '只拿一趟，快点走', '先看清楚再说'],
        ['冒这个险', '拿一趟就走', '先观察'],
        ['拼一把', '只拿够用的', '回去找人一起来'],
      ],
      options: [
        {
          text: '进去，全拿走',
          effects: { supply: 14, health: -8, morale: 2 },
          resolve: (s, rng) => {
            if (rng() < 0.6) return { text: `你来回搬了三趟，把${v.what}全弄了回来。最后一趟的时候你腿都在抖。这批东西让你整个冬天的账好算多了。`, tone: 'good', effects: { supply: 6, morale: 6 } }
            return { text: `第一趟很顺利。第二趟的时候你被人撞见了。你丢了一半东西才跑掉，手臂上挨了一下。${v.what}你只保住了一点点。`, tone: 'bad', effects: { supply: -4, health: -6 } }
          }
        },
        {
          text: '只拿一趟，快点走',
          effects: { supply: 8, morale: 2 },
          result: `你只拿了能一次背动的量，剩下的原样留着。走的时候你想，也许以后还能再来。这世道里，留一点没拿走的东西，等于给自己留了一个明天。`,
          flags: ['restrained']
        },
        {
          text: '先看清楚再说',
          effects: { health: 2, camp: 3 },
          resolve: (s, rng) => {
            if (rng() < 0.55) return { text: `你在外面观察了一个小时，发现那地方确实有人进出。你记下了规律：每天傍晚没人。第二天傍晚你去了，安安静静地搬完了${v.what}。`, tone: 'good', effects: { supply: 12, morale: 5 }, flags: ['knows_streets'] }
            return { text: '你观察了半天，什么也没看出来，最后决定不去。回去的路上你一直想那箱东西。这种「什么都没发生」的遗憾，后来发生过很多次。', tone: 'neutral' }
          }
        }
      ]
    }
  }
}

/* ------------------------------------------------------------
 *  族：心理与梦
 * ---------------------------------------------------------- */

const DREAMS = [
  { obj: '一碗热汤', feel: '你在梦里闻到了香菜的味道，醒来以后嘴里是干的' },
  { obj: '公司的工位', feel: '梦里的电脑还亮着，你在改一个明天要交的表' },
  { obj: '妈妈在叫你吃饭', feel: '你在梦里答应了，然后醒了' },
  { obj: '地铁里的人群', feel: '你梦见自己挤在中间，肩膀挨着陌生人，一点也不害怕' },
  { obj: '一条很亮的街', feel: '路边的店全开着，你在里面挑东西，挑得很慢' },
  { obj: '手机还在响', feel: '你梦见它在响，翻过来看，屏幕是黑的' },
  { obj: '自己的孩子长大了', feel: '梦里他已经比你还高，叫你名字' },
  { obj: '一场没有结束的雨', feel: '雨落在窗外的空调外机上，声音跟以前一模一样' }
]

const FAM_DREAM = {
  id: 'fam_dream',
  stages: [3, 4, 5, 6, 7],
  variants: DREAMS.flatMap(d => ['夜里', '凌晨', '天快亮的时候'].map(t => Object.assign({}, d, { time: t }))),
  build(v) {
    return {
      title: '一个梦',
      scene: `${v.time}你梦见${v.obj}。${v.feel}。你坐起来，屋里很静，能听见自己的心跳。`,
      optPanels: [
        ['躺回去，接着睡', '起来，找点事做', '到外面站一会儿'],
        ['再睡一会', '起床干活', '出门看看'],
        ['闭上眼', '起来', '出去透口气'],
      ],
      options: [
        {
          text: '躺回去，接着睡',
          effects: { health: 4, morale: -4 },
          result: '你躺回去，但睡不着。你躺着回忆那个梦，回忆到天亮。第二天你干什么都有点心不在焉，像被人抽走了一点什么。'
        },
        {
          text: '起来，找点事做',
          effects: { health: -3, morale: 6, camp: 2 },
          result: '你起来修了一个小时的门闩，虽然它没坏。手上的活让你踏实。天快亮的时候你在门口坐了一会儿，喝了一杯热水。这一天照常过了。'
        },
        {
          text: '到外面站一会儿',
          effects: { morale: 5, health: -2 },
          resolve: (s, rng) => {
            if (rng() < 0.3) return { text: '你出去的时候，发现另一个人也站在院子里。你们对看了一眼，都没说话。他递给你半支烟——你们把它点着了，一人一口抽完。', tone: 'good', effects: { morale: 6 }, flags: ['laughed'] }
            return { text: '天上很干净，星星多得不像真的。你站在那里想了很久，发现自己想不起来封城之前那盏街灯是什么样子了。你为这件事难过了一会儿，然后回屋了。', tone: 'neutral' }
          }
        }
      ]
    }
  }
}

const FAMILIES = [FAM_RAID, FAM_INJURY, FAM_TRADE, FAM_BEG, FAM_KID, FAM_WEATHER, FAM_LEAVE, FAM_FIND, FAM_DREAM]

/* ------------------------------------------------------------
 *  展开
 * ---------------------------------------------------------- */

const DAY_BY_STAGE = { 2: [10, 45], 3: [55, 150], 4: [155, 320], 5: [330, 510], 6: [530, 990], 7: [1010, 1450] }

function expand() {
  const out = []
  FAMILIES.forEach(fam => {
    const vars = fam.variants.slice(0, PER_FAMILY)
    vars.forEach((v, i) => {
      const made = fam.build(v)
      const stage = fam.stages[i % fam.stages.length]
      const range = DAY_BY_STAGE[stage] || [100, 200]
      out.push(Object.assign({}, made, {
        id: fam.id + '_' + i,
        stage,
        day: Math.round(range[0] + (range[1] - range[0]) * ((i * 0.618) % 1)),
        family: fam.id,
        order: 50 + (i % 5),
        _v: v
      }))
    })
  })
  return out
}

return expand()

})
