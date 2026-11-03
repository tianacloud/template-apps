/**
 * core/events.js —— 末日模拟器 · 主线事件
 *
 * 阶段 2（第 1 个月） → 阶段 7（第四年）
 * 每个阶段有 5~8 个随机配额，靠 slot 轮换组保证「必出的节点每局都在、但说法不一样」。
 *
 * 写作口径：
 *   - 第二人称，短句，不抒情到底。末日里抒情要留白。
 *   - 死亡不写在选项里，只写在「可能」里。玩家要能感觉到代价，而不是被惩罚。
 *   - 每个选项都要有一个说不清的代价：拿了东西就欠了人，救了人就少了一份粮。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DoomEvents = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const F = (s, f) => (s.flags || []).indexOf(f) >= 0
const hasPartner = s => (s.flags || []).some(f =>
  f === 'partner' || f === 'partner_comrade' || f === 'partner_late')

function rnd(a, b) { return a + Math.random() * (b - a) }
function ri(a, b) { return Math.round(rnd(a, b)) }
function has(arr, x) { return arr.indexOf(x) >= 0 }

/* ============================================================
 *  阶段 2 · 第一个月
 * ============================================================ */

const S2 = [
  /* ---- 选择是否出门（必出） ---- */
  {
    id: 's2_first_run', stage: 2, day: 5, pinned: true, order: 1,
    title: '第一次出门',
    scene: '封城第九天，电网垮了。冰箱里的东西第四天就有了味道。你知道再不去找吃的，下周就没得吃。窗外，楼下有七八个人正围着一家便利店的门，砸了十几分钟还没砸开——每个人都用袖子捂着口鼻，没人敢靠得太近。',
    optPanels: [
      ['等他们散了再去', '现在就下楼，跟着人群冲', '绕远路，去更小的一家'],
      ['等一等，让别人先试', '下楼，趁乱进去拿', '从后巷绕到小店'],
      ['先不动，观察一下再说', '现在就去便利店', '去远一点的地方试试'],
    ],
    options: [
      {
        text: '等他们散了再去',
        effects: { supply: 4, morale: -4 },
        result: '你在楼上看了两个小时。人群散掉之后，货架其实还剩不少——但收银台后面有一个人躺着，额头烫得吓人，没人敢碰。你隔着几步确认他还有气，拿了东西就走，手一直抖。',
        flags: ['saw_dead']
      },
      {
        text: '现在就下楼，跟着人群冲',
        effects: { supply: 10, health: -5, morale: 3 },
        result: '你挤进去了，被挤得肋骨疼。半箱饼干、三瓶水、一卷胶带。有人在你身后喊「给我留点」，你没回头。这一天你学会了第一件事：在这种场合，回头就是输。',
        flags: ['crowd_first']
      },
      {
        text: '绕远路，去更小的一家',
        effects: { supply: 3, camp: 2, morale: 1 },
        resolve: (s, rng) => {
          if (rng() < 0.42) {
            return { text: '小店的门锁着，但卷帘窗有个缝。你钻进去，里面被翻过两轮了，只剩几包挂面和两瓶酱油。走的时候你在后间看见一只猫，它还活着，跟你对视了一眼。', tone: 'neutral' }
          }
          return { text: '小店已经空了。你沿着后巷走了半条街，捡到一个没开封的塑料桶，能装水。回家路上你想：以后每一次出门，都得算清楚值不值。', tone: 'bad' }
        }
      }
    ]
  },

  /* ---- 水（必出） ---- */
  {
    id: 's2_water', stage: 2, day: 9, pinned: true, order: 2,
    title: '水是从楼上下来的',
    scene: '水压在电网垮掉的第二天就没了——泵站没人上班，管里的水也放不出几滴。你存的水在厕所里排成一排，一共十一瓶，每瓶都用胶带写着封的日期。楼下的老大爷开始接空调外机的冷凝水，接了一脸盆，他孙女戴着口罩站在旁边看，没说话。',
    optPanels: [
      ['把水收起来，谁来都不给', '分给楼下的老人一点', '下楼找找有没有更大的容器'],
      ['藏好，装作自己也没有', '给楼下送三瓶', '去找桶，越多越好'],
      ['把自己那份降到最低', '分一点给楼下', '先解决装水的东西'],
    ],
    options: [
      {
        text: '把水收起来，谁来都不给',
        effects: { supply: 3, morale: -8, camp: -2 },
        result: '你把水瓶塞进衣柜最里面，用被子盖住。第二天老人上来敲过门，你屏着气没应。门敲了三下就停了，那个安静比骂你一句难受。',
        flags: ['closed_door']
      },
      {
        text: '分给楼下的老人一点',
        effects: { supply: -2, morale: 8, camp: 3 },
        result: '你下去送了四瓶，老人不要，说「你们年轻还长」。他孙女抢过去抱在怀里。你没说出「我们家也不多」这句话，回到家自己那一格也矮了。',
        flags: ['helped_neighbor']
      },
      {
        text: '下楼找找有没有更大的容器',
        effects: { supply: 6, camp: 3, health: -3 },
        result: '你在楼道的杂物间翻出两个二十升的油漆桶，洗干净能装水。爬楼的时候你想：以后水比米重要，得有个能接雨的东西。你在阳台上钉了一块塑料布。',
        flags: ['rain_catch']
      }
    ]
  },

  /* ---- 药店（slot: 药） ---- */
  {
    id: 's2_pharmacy_a', stage: 2, day: 14, slot: 'pharm', order: 3,
    title: '药店的卷帘门',
    scene: '药店被砸开了一半，卷帘门卡在腰的高度。里面有人。一个中年女人抱着一堆药蹲在角落，看见你，把手里的东西抱紧了。',
    options: [
      {
        text: '先问她需不需要帮忙',
        effects: { morale: 5, supply: 2 },
        resolve: (s, rng) => {
          if (rng() < 0.6) {
            return {
              text: '她说孩子发烧，找不到退烧药。你从货架最上层替她翻出两盒对乙酰氨基酚，她给你分了一盒，还告诉你这一带哪几家还有东西。你从此多知道了一条活路。',
              tone: 'good',
              effects: { morale: 6, supply: 4 },
              flags: ['knows_streets']
            }
          }
          return { text: '她说不用，眼神一直往你手上瞟。你们各自拿了一些东西，谁也没再看谁。走出门的时候你听见她在里面哭。', tone: 'neutral' }
        }
      },
      {
        text: '抓紧拿能用的，赶紧走',
        effects: { supply: 5, health: 3, morale: -4 },
        result: '你拿抗生素、碘伏、纱布、退烧药，塞满背包就走。女人没拦你。你在门口回头看了一眼——她还蹲在那儿，好像被搬空药架的声音吓住了。',
        flags: ['meds']
      },
      {
        text: '不进去了，等她走了再说',
        effects: { morale: -2 },
        resolve: (s, rng) => {
          if (rng() < 0.5) {
            return { text: '你在街角等。她走了之后你进去，货架基本空了，但你在地上捡到几盒掉出来的纱布和一瓶酒精。', tone: 'neutral', effects: { supply: 2 } }
          }
          return { text: '你在街角等了一会儿，来了一伙人，从卷帘门下面钻进去了。你转身走了。这一天你什么都没拿到。', tone: 'bad', effects: { morale: -4 } }
        }
      }
    ]
  },
  {
    id: 's2_pharmacy_b', stage: 2, day: 16, slot: 'pharm', order: 3,
    title: '社区诊所',
    scene: '社区诊所的门是开着的。里面很干净，干净得不对劲——所有的柜门都开着，抽屉全空，连一盒创可贴都没剩。地上有一大片喷雾消毒剂的痕迹，早就干了。墙上那幅「为人民服务」还挂着。',
    options: [
      {
        text: '翻一翻最深的那几个抽屉',
        effects: { health: 4, supply: 3, morale: -3 },
        result: '最里面那层抽屉卡住了，你用刀撬开，里面有一小盒注射器和两瓶生理盐水。地上有一块已经干了的暗色，形状像一个人躺过。你没有细看。',
        flags: ['meds']
      },
      {
        text: '看看有没有留下的病历本',
        effects: { morale: -2, camp: 2 },
        result: '你翻到一本病历，最后一页写着「10 月 21 日，患者高热，转入隔离区」。再往后就没有了。你不知道这个人后来怎么样了。你把本子放回原处，用袖子垫着碰了门把手才出去。'
      },
      {
        text: '马上离开，这儿不对劲',
        effects: { morale: -1, health: 2 },
        result: '你退出来的时候，听见里间有响动。你没进去看。走出半条街之后你才敢跑。有些地方，不去就是最好的选择。'
      }
    ]
  },
  {
    id: 's2_pharmacy_c', stage: 2, day: 15, slot: 'pharm', order: 3,
    title: '一个背着药箱的人',
    scene: '一个中年男人背着个旧药箱，正在挨家问要不要「换点东西」。他打开箱子给你看：有抗生素、有止疼片、有酒精，还有两支不知品牌的针剂。',
    options: [
      {
        text: '用东西换他的药',
        effects: { supply: -6, health: 6, morale: 2 },
        result: '你用六天的口粮换了一个疗程的抗生素和一小瓶酒精。他说这东西以后只会更贵。你知道他说的是真的，所以这笔你不觉得亏。',
        flags: ['meds', 'knows_trader']
      },
      {
        text: '问他从哪儿弄的',
        effects: { morale: -2, camp: 2 },
        resolve: (s, rng) => {
          if (rng() < 0.5) {
            return { text: '他说城南有个仓库，还有人在按老规矩看着。你记住了这个地方。他没再说别的，收了箱子走了。', tone: 'neutral', flags: ['knows_warehouse'] }
          }
          return { text: '他笑了一下，说「问这个干嘛」。然后他收了箱子走了。你在原地站了一会儿，意识到这种问题在这世道里已经算冒犯了。', tone: 'bad' }
        }
      },
      {
        text: '什么也不换，看着他走',
        effects: { morale: 1 },
        result: '你看他一家一家问过去，没人换。他背影像个很久没卖出去东西的小贩。你忽然想，他大概也只是想活下去，跟你一样。'
      }
    ]
  },

  /* ---- 邻居 ---- */
  {
    id: 's2_neighbor', stage: 2, day: 20, slot: 'neighbor', order: 4,
    title: '隔壁的敲门声',
    scene: '隔壁那家敲你的门，声音很轻，敲两下停一下。他家有个上小学的孩子。男主人站在门口，说得很慢：想问你家有没有多余的吃的，他可以帮忙干活。',
    options: [
      {
        text: '给他一些，不要他还',
        effects: { supply: -4, morale: 6, camp: 4 },
        result: '你装了一袋米和两包饼干给他。他捧着，说「我记得」。后来他替你在楼道里钉了一块挡风的板子，什么也没说。',
        flags: ['helped_neighbor', 'ally_neighbor']
      },
      {
        text: '让他帮着干活换',
        effects: { supply: -3, camp: 8, morale: 2 },
        result: '你让他帮你把门加固、把阳台封上。他干得很卖力，走的时候你把东西递给他，他愣了一下，说了声「够多了」。这是个能处的人。',
        flags: ['ally_neighbor']
      },
      {
        text: '说家里也没有了',
        effects: { morale: -6, camp: -2 },
        result: '你说「我们也不多了」。他点头，说了声「打扰了」，转身回自己家。关门前你听见那孩子问「爸爸，有吗」。你站在门后，很久没动。',
        flags: ['closed_door']
      }
    ]
  },
  {
    id: 's2_neighbor_b', stage: 2, day: 22, slot: 'neighbor', order: 4,
    title: '楼道里的会议',
    scene: '六户人在楼道里开会，用手机最后的一点电照着。议题是：谁家有发电机、值夜怎么排、垃圾往哪扔。有个壮汉一直没说话，靠在墙上看所有人。',
    options: [
      {
        text: '主动提出值夜',
        effects: { camp: 10, health: -4, morale: 4 },
        result: '你报了每周两个夜班。第一夜你冻得受不了，第三夜你看见了那只一直翻垃圾桶的流浪狗。你从此有了一个「有人一起守」的楼。',
        flags: ['guard', 'neighbors_org']
      },
      {
        text: '提议把存的东西集中起来',
        effects: { camp: 6, morale: -3, supply: -3 },
        resolve: (s, rng) => {
          if (rng() < 0.55) {
            return { text: '大家同意了，找了个带锁的储物间。你在本子上记下每一笔。三天后少了半袋米，没有人认，也没有人再提。', tone: 'neutral', flags: ['neighbors_org', 'shared_store'] }
          }
          return { text: '没人同意。壮汉先笑了一声，说「谁交谁傻」。会开完了，什么都没定下来。你意识到这栋楼还不算一个「我们」。', tone: 'bad', effects: { morale: -4 } }
        }
      },
      {
        text: '只听不说，早点回屋',
        effects: { morale: -2 },
        result: '你听完就走。楼道里后来吵起来了，为了谁家的狗叫。你关上门，觉得这种会开多少次都没用——直到真的出事那天。'
      }
    ]
  },

  /* ---- 疫情下的规矩 ---- */
  {
    id: 's2_looting', stage: 2, day: 26, slot: 'law', order: 5,
    title: '超市最后一天',
    scene: '全城最后一个还有货的大超市。门口已经没有维持秩序的人，也没有排队。进得去的人都在跑，每个人都用围巾或者口罩蒙着脸——分不清是防病毒还是防人认出来。有个收银员还坐在她的位置上，工牌挂着，看着这一切。',
    options: [
      {
        text: '尽量多拿，别管别人',
        effects: { supply: 16, health: -6, morale: -6 },
        result: '你装满了两个购物车，来来回回跑了三趟。第三趟的时候你在生鲜区滑了一下，地上是化掉的冻品和不知道什么液体。你到家把外衣脱在门口、洗手洗到发红才敢碰东西。清点下来，够吃一个多月。你没有高兴。',
        flags: ['stocked']
      },
      {
        text: '拿够两周就走',
        effects: { supply: 9, morale: 2 },
        result: '你只拿了两周的量，还帮那个收银员搬了一箱水。她说「你走吧，别在这儿待着了」。你在楼下看见有人为了半箱矿泉水打起来。',
        flags: ['restrained']
      },
      {
        text: '先看看有没有人需要帮忙',
        effects: { supply: 2, morale: 8, health: -4 },
        resolve: (s, rng) => {
          if (rng() < 0.5) {
            return {
              text: '你扶了一个被货架压住腿的老太太出来，她说什么也不要，只让你告诉她儿子她在这儿。你把她扶到路边，回来时货已经空了。你身上只有一包饼干。',
              tone: 'good',
              effects: { morale: 6 },
              flags: ['helped_everyone']
            }
          }
          return { text: '你帮了两个人，其中一个顺走了你放在一边的包。你追了两步就停了。这天你学到的东西比拿到的东西多。', tone: 'bad', effects: { supply: -2, morale: -4 } }
        }
      }
    ]
  },
  {
    id: 's2_law_b', stage: 2, day: 28, slot: 'law', order: 5,
    title: '还响着的广播车',
    scene: '一辆车在街上慢慢开，车顶的喇叭说要大家待在家里、物资会有统一调配、发热人员请前往城南体育馆隔离点。车上的两个人穿着防护服，面罩后面看不清表情。街上没人理，但也没人砸车。',
    options: [
      {
        text: '过去问情况',
        effects: { morale: 4, camp: 4 },
        result: '他告诉你：往南三十公里有个安置点，还在发水。但路已经堵了，他也没把握。他给你一张纸，上面是他手写的路线。你把纸折好放进内袋。',
        flags: ['knows_refuge', 'route']
      },
      {
        text: '回家，不听这些',
        effects: { morale: -2, camp: 2 },
        result: '你把窗帘拉上。喇叭声过去之后，整条街特别安静。你知道他说的话有一半是真的，另一半是让人别乱的。这世道，让人别乱本身也是好意。'
      },
      {
        text: '把自己知道的情况告诉他',
        effects: { morale: 5, camp: 3 },
        result: '你告诉他哪条街被封了、哪家药店还有人。他掏出本子记下来，说「谢谢，你是今天第一个跟我说话的人」。这句话让你心里有点堵。',
        flags: ['contacts_official']
      }
    ]
  },

  /* ---- 第一具尸体 ---- */
  {
    id: 's2_body', stage: 2, day: 33, slot: 'body', order: 6,
    title: '三楼的那位',
    scene: '三楼的老太太死在屋里，五天没人发现。是味道先出来的。没人敢开门——她走之前咳了半个月，谁也不确定她是怎么走的。物业早就没了，家属在外地。楼道里的人戴着口罩商量怎么办，商量了一下午。',
    options: [
      {
        text: '裹上床单，蒙着脸把她抬出去',
        effects: { health: -6, morale: 4, camp: 6 },
        result: '你和另外三个人用床单把她裹了三层，口鼻蒙着湿毛巾，抬到楼下的空地挖坑烧了、埋了。挖了两小时，土很硬。有人念了一句「走了就走了吧」。那天之后，楼里的人见面会点头了——也都知道了谁是可以一起抬人的人。',
        flags: ['buried_someone', 'neighbors_org']
      },
      {
        text: '关紧自己的门，用胶带封缝，别掺和',
        effects: { morale: -8, health: -2 },
        result: '你把门窗关死，用胶带封了门缝，又喷了半瓶酒精。味道持续了十一天。那十一天里你几乎没出门，也开始明白：这世道真正杀死人的不只是病毒，是没人再敢管这件事。'
      },
      {
        text: '等三天再进去，只拿不碰',
        effects: { supply: 5, morale: -10 },
        result: '你等了三天，蒙着脸进去的。屋里很暗，她躺在床边。你找到了两袋米、一箱牛奶、一盒没拆的降压药，全程用手肘开门，回去把衣服泡了。你拿走的时候绕过她。那一晚你没睡，第二天把那盒药扔了。',
        flags: ['looted_dead']
      }
    ]
  },

  /* ---- 抢水 ---- */
  {
    id: 's2_water_fight', stage: 2, day: 40, slot: 'conflict', order: 7,
    title: '取水点',
    scene: '小区里唯一能出水的消防栓前排了三十几个人。有人开始往前挤。一个抱着两个水桶的女人被挤倒了，水洒了一地。她跪在地上看着那摊水，没起来。',
    options: [
      {
        text: '把她扶起来，替她排队',
        effects: { morale: 7, health: -3, supply: 3 },
        result: '你把她扶到一边，替她排到了水。她说她家有三个孩子，丈夫没回来。你把自己那份分了一半给她。回去的路上你走得比较慢，但心里是稳的。',
        flags: ['helped_everyone', 'ally_neighbor']
      },
      {
        text: '趁乱抢到前面去',
        effects: { supply: 7, morale: -5, health: -3 },
        result: '你挤到前面去接满了两个桶。回来的时候路过她，她还坐在那儿。你没有看她。这桶水喝起来跟别的没什么两样，但你知道它是怎么来的。',
        flags: ['took_from_weak']
      },
      {
        text: '记住这里，改天半夜来',
        effects: { supply: 2, camp: 3, morale: 1 },
        result: '你转身走了。第二天凌晨三点你带着三个桶回来，一个人都没有。水慢慢流，你在黑暗里站了四十分钟。这种活法累，但干净。',
        flags: ['night_run']
      }
    ]
  },

  /* ---- 隔离的抉择（必出·病毒专属） ---- */
  {
    id: 's2_infected', stage: 2, day: 36, pinned: true, order: 7,
    title: '对面在发烧',
    scene: '对门一家三口已经两天没出门了。晚上你听见男的隔着门跟楼下喊：他媳妇烧到三十九度五，家里退烧药吃完了，水也快没了。楼下没人应。过了一会儿，楼上有人把自家的门链挂上了。你知道他喊的不是求救，是在报信——报他自己是疫区。',
    optPanels: [
      ['把药和水位在门口，敲三下就走', '装作没听见', '敲开门，看看能不能帮上什么'],
      ['消毒后把东西挂他门上', '隔着门聊几句再决定', '这病轮不到你逞英雄，锁门'],
      ['给他递东西，但全程不接触', '先保自己，天亮再说', '过去问问他缺什么'],
    ],
    options: [
      {
        text: '把药和水位在门口，敲三下就走',
        effects: { supply: -4, morale: 5, camp: 4 },
        resolve: (s, rng) => {
          if (rng() < 0.62) {
            return { text: '你把最后两板退烧药、四瓶水放在他家门口的垫子上，敲了三下门就退到楼梯口。门开了一条缝，是那个男人，戴着口罩朝你点了点头。一周后他媳妇烧退了。半个月后，你家的门口也出现过一袋别人放的白菜。这栋楼就是这样活下来的——一次一次，隔着门递东西。', tone: 'good', effects: { morale: 4, camp: 4 }, flags: ['helped_everyone', 'quarantine_allied'] }
          }
          return { text: '你放了药和水。十一天后，救护车——现在是辆三轮——把人拉走了，拉走了两口，回来了一口。男人后来在楼下碰到你，隔着十米朝你鞠了一躬。你摆摆手走了，那天的风很冷。', tone: 'neutral', effects: { morale: 2 }, flags: ['helped_everyone', 'saw_death'] }
        }
      },
      {
        text: '装作没听见，锁好门',
        effects: { morale: -8, camp: -2 },
        result: '你把门反锁，又把电视的声音调大了一点——电视其实早没信号了。喊声停了之后，整层楼安静得能听见自己咽口水。后来那家的门上被粉笔画了个叉。你没画，但你也没去擦。你一直记得那个叉是谁看见的。',
        flags: ['closed_door']
      },
      {
        text: '敲开门，问清楚情况再帮他跑一趟',
        effects: { health: -4, supply: -6, morale: 3 },
        resolve: (s, rng) => {
          const careful = F(s, 'medic') || F(s, 'cold_blood') || F(s, 'veteran')
          if (careful || rng() < 0.5) {
            return { text: '你隔着门链问清楚了症状和吃过什么，让他把体温计从门缝递出来，你隔着两米看刻度。你跑去两条街外的诊所废墟，翻出退烧药和一支体温计，消了毒挂在他门把上。他媳妇两周后退了烧。你干这些的时候没靠近过任何人——这件小事，让你确定自己在这种世道里知道怎么既做人又活命。', tone: 'good', effects: { morale: 6, camp: 5 }, flags: ['helped_neighbor', 'learned_med', 'quarantine_allied'] }
          }
          return { text: '你敲了门，隔着门聊了十分钟，替他跑了三家药店才凑齐药。回来那晚你把衣服脱在门口洗了，热水烫了三遍手。第五天，你开始咳嗽。万幸只是普通的着凉——但那一周你都在想：值不值。你想了四个月，答案一直在变。', tone: 'bad', effects: { health: -8, morale: -4 }, flags: ['helped_everyone'] }
        }
      }
    ]
  }
]

/* ============================================================
 *  阶段 3 · 第一个冬天
 * ============================================================ */

const S3 = [
  {
    id: 's3_cold', stage: 3, day: 70, pinned: true, order: 1,
    title: '第一次降温',
    scene: '夜里降到零下六度。你盖了两床被子，还是冷。窗外有人在小声哭，不知道是哪个单元的。取暖的东西只有别人家扔的一张旧电热毯，没电。',
    optPanels: [
      ['烧家具取暖，先活下去', '找别的燃料', '去和邻居凑一个屋'],
      ['拆东西烧', '想办法找煤或柴', '去跟人挤一个屋'],
      ['先把冷扛过去', '出去找能烧的', '问邻居能不能合屋'],
    ],
    options: [
      {
        text: '烧家具取暖，先活下去',
        effects: { supply: -4, health: 6, camp: -6, morale: 2 },
        result: '你把书柜劈了。火在铁盆里烧了两个小时，屋子里第一次有了热乎气。你坐在火边想，这个柜子是六年前买的。然后你把这个念头也扔进火里了。',
        flags: ['burned_furniture']
      },
      {
        text: '找别的燃料',
        effects: { health: -6, supply: -1, camp: 3 },
        resolve: (s, rng) => {
          if (F(s, 'mechanic') || F(s, 'packrat')) {
            return { text: '你把阳台上那堆旧木板和一辆废自行车拆了，又找到一个能用的铁桶。火升起来的时候你觉得这些「破烂」从来没这么值钱过。', tone: 'good', effects: { camp: 4, health: 3 } }
          }
          if (rng() < 0.5) {
            return { text: '你在小区里转了一夜，从一个正在装修的房子里拆了半扇木门。扛回来肩膀都麻了，但烧了三个晚上。', tone: 'neutral', effects: { supply: 2 } }
          }
          return { text: '你什么都没找到。天亮的时候手指头已经没有知觉了，回屋泡了半小时凉水才缓过来。', tone: 'bad', effects: { health: -6 } }
        }
      },
      {
        text: '去和邻居凑一个屋',
        effects: { camp: 6, morale: 4, health: 3 },
        result: '四户人挤在一间朝南的屋子里，把炉子放中间烧，轮流添柴。进屋前大家约好：谁咳嗽谁睡门口，餐具分开。有人打呼，有人说梦话。你听着这些声音睡着了——这是爆发以来你睡得最踏实的一夜。',
        flags: ['neighbors_org', 'shared_winter']
      }
    ]
  },
  {
    id: 's3_fire', stage: 3, day: 85, pinned: true, order: 2,
    title: '对面楼着了',
    scene: '半夜，对面楼三层起火。烧起来的是蜡烛——有人半夜起来找东西，蜡烛倒了。火从三楼的窗户出来，往上爬。没有消防车，也没有人去救。',
    options: [
      {
        text: '冲过去救人',
        effects: { health: -14, morale: 10, camp: 6 },
        resolve: (s, rng) => {
          if (rng() < 0.55) {
            return {
              text: '你救出两个人，一个老头和一个十岁左右的女孩。你的眉毛被烤卷了，手臂上留了一长条疤。老头一直跟你道谢，女孩一句话都不说。三天后她成了你屋里的人。',
              tone: 'good',
              effects: { people: 2, morale: 6 },
              flags: ['rescued', 'buried_someone']
            }
          }
          return { text: '你冲上去了，只救出一个人，还有一个没找到。你在楼道里被烟呛得趴下，是别人把你拖出来的。躺在地上的时候，你听见楼塌了一半的声音。', tone: 'bad', effects: { morale: -6 }, flags: ['rescued', 'lost_child'] }
        }
      },
      {
        text: '把自家的东西搬到空地，守着',
        effects: { supply: -3, camp: 2, morale: -4 },
        result: '你抱着最重要的东西跑下楼，站在空地上看了两个小时的火。风往南吹，你的楼没事。你回头看的时候，那栋楼还站着，只是三楼以上全黑了。'
      },
      {
        text: '关窗，装作没看见',
        effects: { morale: -10, health: -3 },
        result: '你把窗户关紧，把湿毛巾塞住门缝。烟味还是进来了。第二天早上你下楼，看见烧黑的窗框上挂着一条晾了一半的被子。你已经很久没见过晾衣服了。',
        flags: ['closed_door']
      }
    ]
  },
  {
    id: 's3_illness', stage: 3, day: 100, slot: 'sick', order: 3,
    title: '咳嗽',
    scene: '先是喉咙痒，然后整夜咳，咳到肋骨疼。第三天开始低烧。在这个世道，「发烧」这两个字比「没吃的」还重——隔壁昨天听说你咳嗽，当晚就把公共楼道那侧的窗子关死了。可你还得起来看炉子。',
    options: [
      {
        text: '把自己关起来，硬抗，不见任何人',
        effects: { health: -8, supply: -3, morale: -4 },
        resolve: (s, rng) => {
          const ok = rng() < 0.55 + (s.health > 60 ? 0.2 : 0) + (F(s, 'medic') ? 0.15 : 0)
          if (ok) return { text: '第七天烧退了。你瘦了一圈，抬头看镜子的时候愣了一下。你活下来了，没用一片药，靠的是喝水、睡觉、把餐具开水烫过一遍——和一锅姜汤，姜是隔壁挂在门把手上的，人没露面。你没怪他。这已经是他最大的勇气了。', tone: 'good', effects: { morale: 6, health: 3 } }
          return { text: '烧了十二天。中间有一晚你说胡话，醒来的时候发现自己在门口，不知道为什么站在那儿。你后来一直有点咳，好像有东西没清干净。邻居们又肯跟你说话，是四个月之后的事。', tone: 'bad', effects: { health: -12 }, flags: ['chronic_cough'] }
        }
      },
      {
        text: '吃存着的药',
        effects: { health: 8, supply: -2 },
        resolve: (s, rng) => {
          if (F(s, 'meds')) {
            return { text: '你翻出那几板抗生素，按三天吃完。第五天就不咳了。这一刻你才明白，药箱里那点东西比金子值钱——这个世道带走人的，多数是先被一场小病拖垮的。以后不能随便动。', tone: 'good', effects: { morale: 4 } }
          }
          return { text: '你翻遍了家里，只找到几片感冒药和半板止疼片。吃了作用不大，但至少夜里能睡几个小时。', tone: 'neutral', effects: { health: -3, morale: -2 } }
        }
      },
      {
        text: '找人换药',
        effects: { supply: -8, health: 6, morale: 2 },
        resolve: (s, rng) => {
          if (F(s, 'knows_trader') || F(s, 'knows_streets')) {
            return { text: '你找到了那个背药箱的人，用八天的口粮换了两盒药和一支针。他看了看你的喉咙，说「再晚两天就难办了」。你回去路上一直在算，这个价他赚了多少。', tone: 'good' }
          }
          return { text: '你敲了三家门，两家没开，一家给了你一包板蓝根，说什么也不肯要你的东西。你把它煮了，喝了三碗。第二天感觉好了一点，也可能是心理作用。', tone: 'neutral', effects: { supply: 5, morale: 3 } }
        }
      }
    ]
  },
  {
    id: 's3_illness_b', stage: 3, day: 105, slot: 'sick', order: 3,
    title: '手上的口子',
    scene: '你收拾碎玻璃的时候划了手，不深，但没处理好。第四天，伤口周围开始红胀、发烫，跳着疼。你知道这意味着什么。',
    options: [
      {
        text: '用酒冲开，把脓挤出来',
        effects: { health: -10, morale: -2 },
        resolve: (s, rng) => {
          if (rng() < 0.45) {
            return { text: '你用半瓶廉价白酒冲了伤口，疼得蹲在地上。第二天红肿退了，一周后结痂。你从此在包里永远放一卷纱布和一瓶酒精。', tone: 'good', effects: { health: 6, morale: 4 }, flags: ['learned_med'] }
          }
          return { text: '冲了，但没管用。两天后你发起了高烧。你找了一家人帮忙，用一个下午把伤口切开来——没有任何麻醉。你咬着一条皮带，那是你这辈子最长的几分钟。', tone: 'bad', effects: { health: -14 }, flags: ['wounded'] }
        }
      },
      {
        text: '什么也不做，等它自己好',
        effects: { health: -8, morale: -4 },
        resolve: (s, rng) => {
          if (rng() < 0.35) return { text: '两周之后它自己结了痂，留下一道发白的疤。你运气好。你知道自己只是运气好。', tone: 'neutral' }
          return { text: '伤口一路烂下去，你开始发烧，说胡话。有人给你找了一支过期的抗生素。你活下来了，但那只手后来一直不太灵活。', tone: 'bad', effects: { health: -12 }, flags: ['wounded', 'hurt_hand'] }
        }
      },
      {
        text: '去求那个背药箱的人',
        effects: { supply: -10, health: 8 },
        result: '他给你清洗、打了一支针，还留了两天药。走的时候他说了句实话：「以后别再空手来找我。」你点头。这世界正在变成什么都得付钱的样子，只是钱换了东西。',
        flags: ['owes_trader']
      }
    ]
  },
  {
    id: 's3_raiders', stage: 3, day: 120, slot: 'raid', order: 4,
    title: '半夜的砸门声',
    scene: '凌晨两点，楼下传来砸门的声音，一下比一下重。有人在喊：「我们知道里面有东西！」你摸黑坐起来，手里握着一把菜刀，听见自己的心跳。',
    options: [
      {
        text: '不出声，等他们走',
        effects: { morale: -6, health: -3 },
        resolve: (s, rng) => {
          if (rng() < 0.6) return { text: '他们砸了四十分钟，砸不开，骂了几句走了。天亮之后你去楼下看，门上有个凹陷。你钉了三层木板上去，手一直在抖。', tone: 'neutral', effects: { camp: 4 }, flags: ['raided_once'] }
          return { text: '他们居然撬开了。你躲在衣柜里听着脚步声在客厅里走。他们拿走了粮食和一台收音机，没有找到你。等他们走了，你在衣柜里坐到天亮。', tone: 'bad', effects: { supply: -12, morale: -10 } }
        }
      },
      {
        text: '站到门口，让他们看见你有家伙',
        effects: { health: -6, morale: 6 },
        resolve: (s, rng) => {
          const strong = s.people >= 3 || F(s, 'veteran') || F(s, 'cold_blood') || F(s, 'armed')
          if (strong && rng() < 0.75) {
            return { text: '你把灯点着，站到门口，让玻璃后面的他们看见你手里拿着什么。三个人对看了几秒，走了。你站在那里，一直到听不见脚步才靠着门坐下来。', tone: 'good', effects: { camp: 6 }, flags: ['stood_ground'] }
          }
          return { text: '他们开始撞门。你们在门口顶了十几分钟，最后是靠一把钉子在对方手上划了个口子才把人逼退。你受了伤，但东西保住了大半。', tone: 'bad', effects: { health: -10, supply: -4 }, flags: ['stood_ground', 'wounded'] }
        }
      },
      {
        text: '从后窗下去，把东西留下',
        effects: { supply: -14, morale: -8, health: -4 },
        result: '你从三楼的排水管爬下来，摔了一下，脚踝肿了。你在对面楼的天台上看着自己家的灯被点亮。他们搬了四个来回。你记住了一个人的走路姿势。',
        flags: ['lost_home', 'grudge']
      }
    ]
  },
  {
    id: 's3_raid_b', stage: 3, day: 130, slot: 'raid', order: 4,
    title: '车灯',
    scene: '晚上九点，一辆皮卡车开过街口，车顶绑着东西，车厢里站着两个人，手里有长家伙。车没停，但从街上慢慢过了一遍。你知道他们是在看。',
    options: [
      {
        text: '把灯全灭掉，装成空的',
        effects: { morale: -3, camp: 2 },
        result: '你把所有窗口堵上，一家人蹲在离窗户最远的那堵墙边，一直到车声走远。你后来才知道，那天他们带走了两家人。'
      },
      {
        text: '主动出去跟他们谈',
        effects: { morale: 4, supply: -6 },
        resolve: (s, rng) => {
          if (F(s, 'silver_tongue') || rng() < 0.55) {
            return { text: '你带着一小袋东西走上去。车上的头儿听你说完，点了点头，说「这条街我们不管，只要你们别招惹我们」。你把这句话记住了。', tone: 'good', effects: { camp: 5 }, flags: ['deal_with_raiders', 'knows_gangs'] }
          }
          return { text: '你还没走到，一个人就用枪托把你推倒了。他们带走了你身上所有东西，还进你屋里看了一圈。走的时候有个人留下了一句话：「下次记得准备点见面礼。」', tone: 'bad', effects: { supply: -8, morale: -6 }, flags: ['knows_gangs'] }
        }
      },
      {
        text: '去跟邻居们商量联防',
        effects: { camp: 9, morale: 5, supply: -2 },
        result: '你把几户人叫到一起，说清楚一件事：落单的都被带走了，剩下的必须一起。你们定了信号——铁盆敲三下。当晚就有人来试，敲了三下之后，街上一半的窗户亮了灯。那次没人敢进来。',
        flags: ['neighbors_org', 'watch_system']
      }
    ]
  },
  {
    id: 's3_raid_c', stage: 3, day: 125, slot: 'raid', order: 4,
    title: '门被踹开过',
    scene: '你出来三天，回来的时候门是开着的。锁被撬了，屋里被翻过。东西不见了一半，墙上被写了两个字。你站在门口，觉得腿有点软。',
    options: [
      {
        text: '先清点，再想以后怎么办',
        effects: { supply: -10, morale: -4, camp: 4 },
        result: '你坐在地上一样一样数。米少了三袋，药全没了，被子被拿走一床。你算完之后反倒平静了：至少知道还剩什么。当天你就把门换成了从里面横插一根钢管的做法。',
        flags: ['raided_once']
      },
      {
        text: '马上去追',
        effects: { health: -8, morale: 6 },
        resolve: (s, rng) => {
          if (rng() < 0.4) return { text: '你在两个街口外追上了其中一个人，是个十七八岁的瘦子，背着你的一袋米。他跑不动了，坐在地上说「我只是想吃口饭」。你站了一会儿，把米拿回来，又给了他两包饼干。', tone: 'good', flags: ['killed_first'] }
          return { text: '你没有找到人。回来的路上你在一条巷子里看见了自己的锅，被人扔在那儿。你把它抱回去，用脚把门顶了一夜。', tone: 'bad' }
        }
      },
      {
        text: '搬走，这里不能再住',
        effects: { camp: -12, supply: -2, morale: -2, health: -4 },
        result: '你用一晚上把剩下的东西装进两个包，天亮之前离开了那间屋子。你在城东找到了一个半地下的储藏间，门很厚，没有窗。你在这里住了下来，也从此不再回头。',
        flags: ['moved', 'bunker']
      }
    ]
  },
  {
    id: 's3_winter_end', stage: 3, day: 150, pinned: true, order: 8,
    title: '过了这个冬天',
    scene: '最冷的那段过去了。河面上的冰开始变薄，白天能听见融水的声音。你数了数自己的存货，少了一大半。你瘦了十几斤，手上有永远好不了的裂口。',
    auto: true,
    resolve: (s, rng) => {
      const alive = s.people
      const line = hasPartner(s)
        ? (rng() < 0.5
          ? '你和身边的人都没有说「熬过来了」这四个字。你们只是把炉子熄了，把被子拿出去晒。'
          : '有人在院子里烧了一锅热水。你们一人一杯，什么也不加，喝得很慢。')
        : '你一个人把被子拿出去晒，拍被子的时候扬起的灰在光里飘着。'
      return {
        text: `${line}这个冬天带走了很多人——具体多少你算不清，只知道这栋楼原本住了四十几户。你还没死。这就是这个冬天的全部结论。`,
        tone: 'neutral',
        effects: { morale: 8, supply: -6 }
      }
    }
  }
]

return [].concat(S2, S3)

})
