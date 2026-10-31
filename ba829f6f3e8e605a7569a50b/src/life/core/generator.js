/**
 * core/generator.js —— 人生模拟器 · 生成层
 *
 * "无数个事件 / 无数个结局 / 无数个评价"的实现方式：
 * 不是写无限多的文本，而是"骨架 × 参数池 × 你这局的状态"现场拼装。
 * 三块能力：
 *   composeEvent   —— 事件模板 + 人物池，每局现场拼出 2~3 个独属事件
 *   composeEnding  —— 结局标题/副题/正文按维度结构与真实情节拼装
 *   composeAdvice  —— 建议规则引擎，引用你真实做过的选择
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifeGen = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const pickOne = arr => arr[Math.floor(Math.random() * arr.length)]

/* 和 data.js 那套一致：结过婚不等于现在还有伴 */
const hasPartner = s => {
  const f = s.flags || []
  if (f.includes('remarried')) return true
  if (f.includes('divorced') || f.includes('widowed')) return false
  return f.includes('married_love') || f.includes('married_arranged') ||
    f.includes('cold_marriage') || f.includes('cohabit')
}
const hasKid = s => (s.flags || []).some(x =>
  x === 'has_child' || x === 'late_child' || x === 'adopted' ||
  x === 'single_parent' || x === 'two_kids')
const F = (s, f) => (s.flags || []).includes(f)

/* ============================================================
 *  一、参数池
 * ============================================================ */

const PEOPLE = {
  child: ['表哥', '同桌', '转学来的新同学', '隔壁班那个人', '楼下一块玩的小孩', '少年宫认识的朋友', '住外婆家时的伙伴', '班里最闹的那个'],
  youth: ['室友', '社团里认识的人', '实习带我的前辈', '大学里最要好的朋友', '聊了很久的网友', '健身房认识的姑娘', '培训班同桌', '老乡会的学姐'],
  adult: ['老同学', '关系最近的同事', '一位远房亲戚', '以前的领导', '小区里熟起来的邻居', '爱人的同事', '大学睡在下铺的人', '孩子同学的家长'],
  elder: ['老同事', '几十年的老邻居', '家里的小辈', '棋友', '老年大学认识的朋友', '老家还在走动的亲戚']
}

function personPool(age) {
  if (age < 18) return PEOPLE.child
  if (age < 30) return PEOPLE.youth
  if (age < 55) return PEOPLE.adult
  return PEOPLE.elder
}

const HOBBY_BY_AGE = {
  kid: ['画画', '折纸', '攒卡片', '吹口琴', '拼模型'],
  teen: ['画画', '写东西', '弹吉他', '打球', '剪视频'],
  young: ['拍照', '跑步', '做手冲', '打游戏', '写点东西'],
  mid: ['钓鱼', '木工', '养花', '跑步', '露营'],
  old: ['书法', '养花', '下棋', '侍弄一个小菜园', '听戏']
}

const STAGE_RANGE = { 2: [6, 12], 3: [13, 18], 4: [19, 29], 5: [30, 45], 6: [46, 64], 7: [65, 88] }

/* ============================================================
 *  二、事件骨架（每局现场实例化）
 * ============================================================ */

const TEMPLATES = [
  {
    id: 'lend',
    stages: [4, 5, 6],
    weight: 3,
    make(s, rng, p) {
      const amt = clamp(Math.round(3 + s.money * 0.12 + rng() * 6), 2, 25)
      return {
        title: '深夜的一条消息',
        scene: `${p}发来一条很长的消息，绕了三百个字，最后才落到正事上：想找你借 ${amt} 万周转，说年底就还。你盯着屏幕，想起上一次你们见面还是两年前。`,
        optPanels: [
          ['转过去，回一个“不急”', '说手头也紧，婉拒', '借一半，再帮他理理思路'],
          ['直接转，附一句“先用着”', '找个理由推掉', '给一半，再陪他算算账'],
          ['钱转过去，别的不用多说', '婉拒，说自己也紧', '少借点，帮他把窟窿捋一遍'],
        ],
        options: [
          {
            text: `转过去，回一个“不急”`,
            effects: { money: -amt, happy: 2, cha: 1 },
            result: `你转了 ${amt} 万，只回了一个“嗯，不急”。${p}发来一排感谢。这份交情到底值不值这个数，要等年底才知道——有时候答案是钱回来了，有时候答案是认清了一个人。`
          },
          {
            text: '说手头也紧，婉拒',
            effects: { happy: -3, amb: 1 },
            result: `你说手头也紧。对话框沉默了很久，最后是${p}回了个“理解，没事”。那顿原本约好的饭，后来谁也没再提。你没有做错什么，只是有些东西回不去了。`
          },
          {
            text: '借一半，再帮他理理思路',
            effects: { money: -Math.ceil(amt / 2), cha: 3, happy: 1 },
            result: `你转了一半，又陪他把剩下的窟窿怎么补捋了一遍。钱不算多，心意是全的。后来${p}逢人就说你靠谱——这句话，比钱值钱。`
          }
        ]
      }
    }
  },
  {
    id: 'gather',
    stages: [4, 5, 6],
    weight: 3,
    // 同学会上说话的人只能是同学：通用池里的"孩子同学的家长""小区邻居"坐不进这张桌子
    persons: ['老同学', '大学睡在下铺的人', '高中同桌', '一个宿舍住了四年的', '以前的班长', '一起逃过课的人'],
    make(s, rng, p, age) {
      let scene
      if (age < 26) {
        scene = `同学聚会，圆桌。聊的是考研、实习和谁先脱单。有人问你“以后打算干嘛”，你说“再看看”。这三个字说出口，你自己都觉得有点空。`
      } else if (s.money > 60) {
        scene = `同学聚会，圆桌。有人举着杯走过来说“现在就看你混得最好”，满桌都看你。你笑着说哪里哪里，心里闪过的却是这个月还没还完的账。`
      } else if (s.money < 15) {
        scene = `同学聚会，圆桌。聊的是学区房、职级和年假。有人随口问你“现在怎么样”，你说“还行”。这两个字你说得很稳，稳到自己都有点佩服。`
      } else {
        scene = `同学聚会，圆桌。大家都在变，又都装作没变。${p}凑过来说：“咱们那时候多好啊。”你说是啊。可是谁都知道，回不去了。`
      }
      return {
        title: '同学会的圆桌',
        scene,
        optPanels: [
          ['举杯，把场面撑住', '有人问就说实话', '中途离席，去走路'],
          ['端起杯子，笑到最后', '问到就说，不装了', '吃到一半就走'],
          ['把这一桌照顾好', '不吹也不藏，照实说', '提前退场，去外面走走'],
        ],
        options: [
          {
            text: '举杯，把场面撑住',
            effects: { cha: 2, happy: -2 },
            result: `你把那一桌人都照顾得很周到，散场时人人都说你混得好。回家的车上你有点累——不是身体的累，是"把自己演完"的那种累。`
          },
          {
            text: '有人问就说实话',
            effects: { happy: 3, cha: -1 },
            result: `你说“其实一般，也就是糊口”。桌上安静了两秒，然后${p}说：“就等你这句。”那天散场后，你们在路边多坐了半小时。真实有时候是一种社交风险，也是一种社交货币。`
          },
          {
            text: '中途离席，去走路',
            effects: { happy: 1, amb: -1 },
            result: `你提前走了，沿着河边走了一段。风很凉，你把那顿饭从脑子里一层层卸下来。有些热闹，参与一半就够了。`
          }
        ]
      }
    }
  },
  {
    id: 'offer',
    stages: [4, 5],
    weight: 2,
    // 体制内、创业、单干的人不会接到猎头电话（运行时按 flag 判，开局时还不知道）
    gate: s => !['gov', 'founder', 'freelance'].some(f => s.flags.includes(f)),
    make(s, rng, p, age) {
      // 涨薪要跟你此刻的身价匹配：刚工作两三年的人，跳一次涨两三万已经算不错；
      // 学历好、心气高、干到中年的人，才有资格谈十万级的包。
      // 注意：事件是开局时批量生成的，那时 career 还是 0，所以用学历/野心/年龄来估身价。
      const base = 1.5 + (s.edu || 1) * 0.8 + (s.amb || 50) * 0.035
      const ageF = age < 26 ? 0.62 : age < 31 ? 0.92 : age < 42 ? 1.25 : 1.4
      const raise = clamp(Math.round((base + rng() * 2.2) * ageF), 1, 16) // 年薪涨幅，万元
      // 一次跳槽真正落进账上的，是这笔涨幅里攒下来的那一部分，不是全额
      const gain = clamp(Math.round(raise * 0.45), 1, 7)
      return {
        title: '猎头的消息',
        scene: `猎头发来消息：一样的事，换个地方，年薪多 ${raise} 万。发完又补一句：“您考虑到几点都行，我明天等您。”你把手机扣在桌上，那晚睡得很浅。`,
        options: [
          {
            text: '去。钱是真的',
            effects: { money: gain, career: 1, health: -3, happy: -1 },
            result: `你去了。签字那天 HR 把数字念了一遍——年薪确实多了 ${raise} 万，分十二个月发。新的工位更靠里，新的活也更狠。前三个月你总在夜里想：这个决定到底是你做的，还是钱替你做的。`
          },
          {
            text: '留下。这边还没做完',
            effects: { health: 2, family: 2, amb: -2 },
            result: `你回了“谢谢，暂不考虑”。猎头说您是我见过最干脆的拒绝。你继续做手上那些没做完的事——有时候不动的理由，不是安于现状，是有件事非你不可。`
          },
          {
            text: '反手拿去谈一次',
            effects: { cha: 3, money: Math.max(1, Math.round(gain / 2)), amb: 2, happy: 1 },
            result: `你拿着这份 offer 和这边谈了一次，最后加了 ${Math.max(1, Math.round(raise / 3))} 万，涨薪幅度不如跳过去，但工位、工牌、同事都还是熟的。你第一次发现：选择本身就是筹码，用得好的人，不必真的离开。`
          }
        ]
      }
    }
  },
  {
    id: 'heat',
    stages: [3, 4],
    weight: 2,
    make(s, rng, p, age) {
      // 13-18 岁的人上不了热搜，但会被"截掉一半的截图"在班里传开。
      if (age <= 18) {
        return {
          title: '被截掉一半的话',
          scene: `班里群里传开了一张截图，是你私下说的一句话，被截掉了前半句。第二天进教室，几个人看你的眼神不太一样。`,
          options: [
            {
              text: '在群里把前后文补全',
              effects: { cha: 3, happy: -3 },
              result: `你把那段话的上下文发了出去，还加了一句"我不是那个意思"。有人回了个"哦"，有人没回。第三天就没人再提了。你第一次知道，解释其实是讲给自己听的。`
            },
            {
              text: '挨个去问是谁截的',
              effects: { cha: -2, happy: -4, amb: 2 },
              result: `你问到第三个人的时候，对方说"至于吗"。你就没再问下去。有些人你以为是朋友，只是还没到要站队的时候。`
            },
            {
              text: '不解释，该干嘛干嘛',
              effects: { happy: 2, int: 2 },
              result: `你什么也没说，照常上课、照常去打球。一个月后这件事没人记得了，只有你自己记得当时忍住了。`
            }
          ]
        }
      }
      return {
        title: '三天热搜',
        scene: `你随手发的一条内容被人断章取义挂了上去，评论区涌进来几千个人，替你安排了你没做过的事、没说过的话。第四天早上，你盯着那串红色的数字。`,
        options: [
          {
            text: '写一条认真的回应',
            effects: { cha: 2, happy: -4, amb: 1 },
            result: `你逐条澄清，措辞克制。有人信了，有人说洗地，更多人根本没读。风波第七天就散了，像没来过。但你学会了：互联网没有"解释"这个功能。`
          },
          {
            text: '卸载，一个字不回',
            effects: { happy: -1, health: 1 },
            result: `你卸了那两个软件，去楼下跑了五公里。回来时那点怒气变成了疲惫，疲惫又变成了困。你睡了这个月最好的一觉。有些仗，不打就是赢。`
          },
          {
            text: '发一条自嘲',
            effects: { happy: 2, cha: 1 },
            result: `你发了条自嘲，评论区风向居然松动了，有人开始帮你说话。你第一次见识到幽默的防御力——它不能解决问题，但能让你在问题里站得住。`
          }
        ]
      }
    }
  },
  {
    id: 'callhome',
    stages: [5, 6],
    weight: 3,
    make(s, rng, p) {
      return {
        title: '家里的电话',
        scene: `电话是晚上八点来的。那头声音很轻，说住院了，不严重，让你别跑。你捏着手机站在阳台上，楼下是万家灯火，你算了一遍这个月的日程，哪天都走不开。`,
        options: [
          {
            text: '连夜买票回去',
            effects: { family: 6, money: -5, health: -2, happy: 1 },
            result: `你请了假，连夜回去。病床边那个人嘴上嫌你折腾，眼里是亮的。你在医院走廊的长椅上睡了两晚，腰很酸，心里是定的。有些账不能算钱。`
          },
          {
            text: '打钱，安排好一切',
            effects: { money: -8, family: 1, amb: 1 },
            result: `你打了钱，请了护工，把主治医生的情况问了个遍。安排得很专业。挂电话前那头说“你都这么忙了”——你没听出那句话里的失落，很多年后才懂。`
          },
          {
            text: '“等忙完这阵就回”',
            effects: { amb: 2, family: -6, happy: -3 },
            result: `你说等忙完这阵。这阵是真的忙，也是真的过去了。后来你回去了，那次住院已经成了饭桌上的旧闻。你笑着说抱歉，那头说没事。有些"没事"，是替你把失望咽下去了。`
          }
        ]
      }
    }
  },
  {
    id: 'hobby',
    stages: [2, 3, 4, 5, 6, 7],
    weight: 2,
    make(s, rng, p, age) {
      // 注意：必须用事件本身的 age，不能用 s.age——模板是在开局批量生成的，
      // 那时 s.age 还是 0，按它取池会让所有人（含八十岁）都抽到儿童爱好。
      const band = age < 13 ? 'kid' : age < 19 ? 'teen' : age < 30 ? 'young' : age < 55 ? 'mid' : 'old'
      const hobby = pickOne(HOBBY_BY_AGE[band])

      // 小孩听到的是"能当饭吃吗"，少年听到的是"先顾学习"，
      // "都什么岁数了，弄这个"是大人（尤其上岁数的人）才会被说的一句话。
      if (band === 'kid') {
        return {
          title: '没用的爱好',
          scene: `不知道从哪天起，你迷上了${hobby}。放学回家书包一扔就想弄那个。你妈看了一眼说：“弄这个能当饭吃吗？作业写完了没。”`,
          optPanels: [
            ['写完作业就弄，一天不落', '家里不让，收进柜子', '把同学也拉进来'],
            ['作业先写完，剩下的时间都给它', '听话，收起来', '拉上几个同学一起弄'],
            ['每天留十分钟给它', '不弄了，先顾成绩', '带到班上去，跟人一起玩'],
          ],
          options: [
            {
              text: '写完作业就弄，一天不落',
              effects: { happy: 6, int: 3, health: -1 },
              result: `你把${hobby}放在每天最后一件事的位置。作业写得比从前快，就为了多弄那十分钟。很多年后你已经不弄了，可你记得那种"还有一件事等着我"的盼头。`
            },
            {
              text: '家里不让，收进柜子',
              effects: { amb: 2, happy: -4, family: 2 },
              result: `你把它收进柜子最上层，够不太到的地方。你听话了，成绩也确实没差。只是后来你再喜欢上什么，第一反应都变成了"这个有用吗"。`
            },
            {
              text: '把同学也拉进来',
              effects: { cha: 5, happy: 6 },
              result: `你带了三四个同学一起弄，下课围一圈。老师没收过两次，你们又偷偷弄起来。那是你第一次发现，喜欢的事有人一起做，会变得更喜欢。`
            }
          ]
        }
      }

      if (band === 'teen') {
        return {
          title: '没用的爱好',
          scene: `不知道从哪天起，你迷上了${hobby}。作业写到一半会走神，脑子里全是那个东西。家里说：“这个有什么用？先把成绩弄上去，以后有的是时间。”`,
          optPanels: [
            ['偷偷练，作业写完再弄', '先放下，等考完再说', '跟家里争一次，说这个对我重要'],
            ['藏起来练，不让他们看见', '搁着，考完再碰', '跟他们讲一次道理'],
            ['熄灯后自己弄一会儿', '收进柜子，先考试', '把话说清楚：这是我唯一喜欢的事'],
          ],
          options: [
            {
              text: '偷偷练，作业写完再弄',
              effects: { happy: 6, int: 2, health: -2 },
              result: `你把${hobby}藏在课本下面，等家里灯灭了才拿出来。那半年成绩没掉，也没人知道你每天少睡一小时。有些喜欢是要藏的，藏着才留得住。`
            },
            {
              text: '先放下，等考完再说',
              effects: { int: 3, amb: 3, happy: -4 },
              result: `你把它收到柜子最上面，说"等考完再说"。考完那天你也没去拿。它就在那儿放着，一直到你上大学那年搬家，才又看见。`
            },
            {
              text: '跟家里争一次，说这个对我重要',
              effects: { cha: 4, happy: 3, family: -4 },
              result: `你第一次跟家里顶了嘴，说"我就这一个喜欢的事"。你妈愣了半天，最后说"周末可以弄两个小时"。那两小时成了你一周里最亮的地方。`
            }
          ]
        }
      }

      // 二十几岁听到的多半是"这么大了还弄这个"，"都什么岁数了"是三十岁以后才会被说的
      const tease = age < 30 ? '这么大了还弄这个。' : '都什么岁数了，弄这个。'
      return {
        title: '没用的爱好',
        scene: `不知道从哪天起，你迷上了${hobby}。不为什么，就是做的时候时间过得不一样。有人知道了，笑你：“${tease}”`,
        optPanels: [
          ['认真练。没用的东西也要练', '算了，正事要紧', '想办法让它赚点钱'],
          ['每周留几个小时给它', '搁一搁，等有空再说', '试着靠它挣点钱'],
          ['不问有没有用，照样练', '先忙正事，以后再说', '把它变成一门副业'],
        ],
        options: [
          {
            text: '认真练。没用的东西也要练',
            effects: { happy: 5, money: -2, amb: -2 },
            result: `你每个星期都留几个小时给${hobby}。它在你的生活里毫无产出，却撑住了很多东西——那些不能跟任何人说的傍晚，都是它接住的。`
          },
          {
            text: '算了，正事要紧',
            effects: { amb: 3, happy: -3 },
            result: `你把${hobby}收了起来，跟很多别的东西放在一起。后来偶尔看见，手会痒一下。生活确实更重要——只是你后来再没找到过那样时间变慢的时刻。`
          },
          {
            text: '想办法让它赚点钱',
            effects: { money: 3, happy: -1, cha: 1 },
            result: `你开始接单、发帖、算成本。${hobby}变得有产出了，也变得像上班了。赚到的钱是真的，失去的那部分也是真的。`
          }
        ]
      }
    }
  },
  {
    id: 'checkup',
    stages: [5, 6, 7],
    weight: 3,
    make(s, rng, p) {
      const worried = s.health < 55
      return {
        title: '体检单上的箭头',
        scene: worried
          ? `体检报告出来，向上的箭头比往年多。医生圈了两项，说"要注意"，又说"也别太紧张"。这两句话你都没听进去，你在想下周的安排。`
          : `体检报告大体正常，就一项指标的箭头有点意思。医生说问题不大，一年后复查。你把单子折好放进包里，顺手拍了张照发给家里。`,
        optPanels: [
          ['当场预约复查', '调整作息，先观察', '折进包里，当没看见'],
          ['当天就把复查约了', '不复查，先把作息改了', '收起来，不看了'],
          ['马上挂号再查一遍', '自己调一调，看下次指标', '塞进抽屉，眼不见为净'],
        ],
        options: [
          {
            text: '当场预约复查',
            effects: { health: 5, money: -3, happy: -1 },
            result: `你约了复查，又按医嘱折腾了一圈。多花了几千块和好几个上午。指标回来那天你长出一口气——钱能买回来的安心，是最便宜的那种。`
          },
          {
            text: '调整作息，先观察',
            effects: { health: 3, amb: -2 },
            result: `你把熬夜砍了一半，酒也少喝了。下次复查，箭头收回去了大半。身体这台机器讲道理得很：你对它做的每一件事，它都记账，也都会还。`
          },
          {
            text: '折进包里，当没看见',
            effects: { health: -4, happy: 1 },
            result: `你把单子塞进抽屉最底层。不是不在乎，是不敢在乎。日子照旧，只是偶尔半夜会想起那个箭头。它没催你，它在等。`
          }
        ]
      }
    }
  },
  {
    id: 'oldstuff',
    stages: [6, 7],
    weight: 2,
    make(s, rng, p) {
      return {
        title: '抽屉最底下的东西',
        scene: `收拾柜子，翻出一个铁盒：几张泛黄的照片，一沓信，一枚不知道什么的票根。夕阳正好照在床沿上，你坐在地上，翻了很久。`,
        optPanels: [
          ['喊小辈来，讲给他们听', '原样收好，放回去', '挑一挑，扔掉大半'],
          ['叫孩子过来，一张张讲', '合上盖子，放回原处', '只留三样，其余处理掉'],
          ['拿给小辈看，说那时候的事', '不动，照原样收着', '清一清，扔掉大部分'],
        ],
        options: [
          {
            text: '喊小辈来，讲给他们听',
            effects: { family: 4, happy: 3 },
            result: `你把照片一张张讲过去。小辈听得很认真，还拿手机拍了几张。那些你以为早就没人记得的事，就这样又活了一次。故事讲出去，才算真的发生过。`
          },
          {
            text: '原样收好，放回去',
            effects: { happy: 2 },
            result: `你把铁盒合上，放回抽屉最底下。有些东西不需要观众，它们的存在本身就是一种陪伴。你知道它们在哪，这就够了。`
          },
          {
            text: '挑一挑，扔掉大半',
            effects: { happy: -3, amb: 2 },
            result: `你留下了三样，扔掉了一袋。扔的时候手很稳，扔完坐在原地有点空。人这一生攒的不是物件，是物件背后的那几个小时。你扔掉了几个小时。`
          }
        ]
      }
    }
  },
  {
    id: 'swallow',
    stages: [4, 5, 6],
    weight: 3,
    // 抢方案的是同一个会议室里的人，不能是邻居、亲戚、家长群的人
    persons: ['同组的老同事', '隔壁组的组长', '带你的前辈', '一个比你晚来两年的同事', '你的直属上级', '部门里那个总抢话的人'],
    gate: s => !s.flags.includes('retired') &&
      !['founder', 'freelance', 'free_range'].some(f => s.flags.includes(f)),
    make(s, rng, p) {
      return {
        title: '咽不下去的那口气',
        scene: `你熬了三个星期的方案，汇报那天，${p}把它讲成了自己的主意。会议室里没人看你。你捏着笔，手心全是汗。`,
        options: [
          {
            text: '忍了。来日方长',
            effects: { career: 2, happy: -4 },
            result: `你从头到尾没说话，散会后还补了两页材料。后来你的处境确实好了起来。但那天你在楼下站了很久——赢了局面，输了那一口，账很难算平。`
          },
          {
            text: '当场把话说清',
            effects: { cha: 3, career: -2, happy: 2 },
            result: `你等他讲完，平静地补了一句："这部分我展开说下。"然后你把三个星期的细节一条条摆出来。会议室很安静。你付出了点代价，但那天晚上你睡得很好。`
          },
          {
            text: '一个字不说，开始找工作',
            effects: { money: -6, happy: 3, amb: 5 },
            result: `你安静地把简历更新了，一个月后离开了那里。没有翻脸，没有告别演说。用脚投票是这个世界上最体面的愤怒，也是最有用的那种。`
          }
        ]
      }
    }
  },
  {
    id: 'letter',
    stages: [3, 4],
    weight: 2,
    make(s, rng, p, age) {
      // 这封信是"说出口"性质的，不能套通用人物池（会出现写给表哥、写给家里的小辈）
      const peer = age <= 18
        ? pickOne(['同桌', '隔壁班那个人', '一起坐公交回家的同学', '补课班坐在你旁边的人'])
        : pickOne(['大学里最要好的朋友', '社团里认识的人', '一个一直没说出口的人', '聊了很久的网友'])

      if (age <= 18) {
        return {
          title: '没发出去的话',
          scene: `你打了一段话，给${peer}。写了删，删了又写，最后那段停在输入框里。手机扣在枕头边上，你翻了个身。`,
          options: [
            {
              text: '按发送',
              effects: { cha: 3, happy: 4 },
              result: `你按了发送，然后马上把手机翻过去扣在桌上。等回复那二十分钟，你把这一年的事都想了一遍。后来说清楚了，你们的关系也变了，说不上好还是坏，但真实。`
            },
            {
              text: '一个字一个字删掉',
              effects: { happy: -3, amb: 1 },
              result: `你删到最后，光标还在闪。你把手机塞到枕头底下，觉得心里空了一块，又觉得轻松了一点。有些话删掉以后，你反而睡得更沉。`
            },
            {
              text: '留在草稿箱，不删也不发',
              effects: { amb: 2, happy: 1 },
              result: `那段话一直躺在草稿箱里，一直到毕业。换手机的时候你导了过去，说不清为什么没删。它成了一把尺子，量着那年的你和后来的你差了多少。`
            }
          ]
        }
      }

      return {
        title: '没寄出去的信',
        scene: `你写了一封信，写给${peer}。写了改，改了撕，最后留下来的这封，在抽屉里压了半个月。邮票都买好了。`,
        options: [
          {
            text: '寄出去',
            effects: { cha: 3, happy: 3, family: -1 },
            result: `你把信投进了邮筒，投完就后悔，后悔了三天。半个月后收到回信，只有一页，最后一行是："其实我也是。"后来你们的关系变了，变得说不上来好还是坏，但真实。`
          },
          {
            text: '烧掉',
            effects: { happy: -2, amb: 1 },
            result: `你在楼下的铁桶里把它烧了。火很小，很快就完。有些话这一生都不会被听到了。你以为烧掉是结束，其实它是封存——它的重量一分没少，只是换了个地方放。`
          },
          {
            text: '留着，不寄也不烧',
            effects: { amb: 3, happy: 1 },
            result: `那封信一直压在抽屉里。你搬过几次家，每次都带着。它成了一把尺子，量着那年的你和现在的你差了多远。说不清这算勇敢还是懦弱，但它诚实。`
          }
        ]
      }
    }
  }
]

/* ============================================================
 *  三、事件实例化
 * ============================================================ */

/* ------------------------------------------------------------------
 * 场景变体：同一个骨架，换成不同的人、不同的时机、不同的一句话
 * 只换 scene（玩家第一眼看到的那段），选项和数值保持骨架的设计
 * ------------------------------------------------------------------ */

const CALLHOME_SCENES = [
  p => `电话是晚上八点来的。${p}说住院了，不严重，让你别跑。你捏着手机站在阳台上，楼下是万家灯火，你算了一遍这个月的日程，哪天都走不开。`,
  p => `白天开会时手机震了三次，都是${p}。你出去回过去，是邻居接的，说人在急诊，"没大事，你别慌"。你在楼道里站了一会儿才想起来要问是哪家医院。`,
  p => `凌晨两点，${p}打来，说摔了一跤，现在在医院拍片子。声音很稳，稳得不像刚摔过。你坐起来，摸黑找衣服，手一直在抖。`,
  p => `${p}在电话里说"我想去你那儿看个病，顺便看看你"。你说好啊。挂了电话你才反应过来，ta 说的是"看病"，不是"看你"。`,
  p => `一条六十秒的语音，前五十秒在说天气和菜价，最后十秒说"我这边没事，你别惦记"。你听了三遍，第三遍才听出那十秒里的东西。`,
  p => `视频接通了，${p}把镜头对着墙，说"信号不好"。你听见背景里有推车的声音，还有人在喊床号。你没有拆穿，只是把声音调大了一点。`,
  p => `你妈打来，先问你吃饭没有，又问冷不冷，第三句才说"你爸这两天不太舒服"。你问多久了，她说"也没多久"。你知道"也没多久"通常是很久。`,
  p => `你爸第一次主动给你打电话。他说了两句就卡住了，然后把手机递给你妈，说"你跟他说"。你妈接过来说"没事，就是想问问你什么时候回来"。`,
  p => `家族群里发了张检查单的照片，没有人配文字。你放大了看，看不懂，但看见了几个向上的箭头。你在群里问了一句，过了半小时才有人回"你爸的，没事"。`,
  p => `电话里能听见仪器的声音，规律的、很轻的滴。${p}说"我在医院陪个朋友"。你没有问是哪个朋友，因为你知道 ta 没有会住院的朋友。`,
  p => `${p}的病房号发到了你手机上，后面跟了一句"不用来"。你把那条消息看了很久，然后打开了买票的软件。`,
  p => `你打回去，没人接。打了三次，第三次是被按掉的。半小时后${p}回过来，说"刚才在做检查，手机不能带进去"。你嗯了一声，没说自己这半小时在干什么。`,
  p => `${p}说"医生说要做个手术"，停了一下，又说"小手术"。你问多大，ta 说"就是个小手术"。你听见 ta 在电话那头清了清嗓子。`,
  p => `半夜${p}发来一句"睡了吗"。你第二天早上才看到。回过去的时候，ta 说"没事，就是想跟你说说话，现在没事了"。你把手机放下，坐了很久。`,
  p => `你妈在电话里说"家里都好"，然后一样一样报：菜价、天气、邻居家的孩子。你听着，忽然发现她漏掉了一个人——她没提你爸。`
]

const CHECKUP_SCENES_BAD = [
  p => `体检报告出来，向上的箭头比往年多。医生圈了两项，说"要注意"，又说"也别太紧张"。这两句话你都没听进去，你在想下周的安排。`,
  p => `有一项指标超了三倍。医生把报告转过来，用笔尖点了点，说"这个要尽快查"。你问多快，他说"这周"。`,
  p => `医生看报告看了很久，没说话。你坐在对面，听见走廊里有人在笑。然后他抬起头，说"再做个检查吧，别自己吓自己"。`,
  p => `报告最后一行写着"建议进一步就诊"。你回家查了一晚上，查到凌晨三点。你发现自己已经能看懂那些名词了，这不是好事。`,
  p => `血压、血脂、血糖，三项都标了红。医生说"你这个年纪，该管管了"。你笑了笑，心里算的是这个月开始要戒什么。`,
  p => `${p}陪你去的。医生说话的时候一直看着你，没看报告。你知道那种眼神的意思：有话不方便当着家属说。`,
  p => `报告里有一项你根本不认识的名词。你问医生，他解释了一遍，你只听懂了"良性""恶性"两个词之间的那个停顿。`,
  p => `你今年四十三，报告上写着"建议每年复查"。你把这句话读了两遍，忽然意识到：从今年起，你的身体开始需要"复查"这个词了。`
]

const CHECKUP_SCENES_OK = [
  p => `体检报告大体正常，就一项指标的箭头有点意思。医生说问题不大，一年后复查。你把单子折好放进包里，顺手拍了张照发给家里。`,
  p => `医生说"你比去年好"。你愣了一下，问哪项好了。他翻了翻，说"都好一点"。你走出诊室的时候，脚步比进来时轻。`,
  p => `全部正常。护士说"你这报告很干净"。你反而有点不习惯——过去几年总有那么一两个箭头，今年一个都没有。`,
  p => `只有尿酸高。医生说"少吃点海鲜，少喝点酒"。你说好。走出医院你在想，这两样恰好是你这些年仅剩的乐趣。`,
  p => `报告很好，但医生问你"最近睡得怎么样"。你说还行。他说"还行是多长时间"。你算了算，说"四五个小时吧"。他抬起头看了你一眼。`,
  p => `一切正常。你把单子折好，走到医院门口的台阶上坐了一会儿。太阳很好，有个老头在旁边喂鸽子。你忽然觉得，正常这两个字，是最贵的一种结果。`,
  p => `${p}打电话问结果，你说没事。ta 说"那就好"，然后又说"你也别老熬夜"。你说知道了。这句话你说了二十年，一次也没做到。`,
  p => `报告上写着"未见明显异常"。你看着这六个字，想起去年那张单子上有三个箭头。这一年你只是少喝了点酒、多走了点路，身体就还了你这么多。`
]

const OLDSTUFF_SCENES = [
  p => `收拾柜子，翻出一个铁盒：几张泛黄的照片，一沓信，一枚不知道什么的票根。夕阳正好照在床沿上，你坐在地上，翻了很久。`,
  p => `一件旧外套，你摸到口袋里有一张纸条，是很多年前写的购物清单。最后一行是"给他买个生日礼物"，你记不起有没有买。`,
  p => `一沓汇款单，收款人是你妈。最早的一张是二十年前，金额八百。你一张张看下去，看见自己这些年是怎么一点点变多的，也看见她是怎么一点点变老的。`,
  p => `一张老照片，背面写着日期和一个名字。日期你记得，名字你想不起来了。你把照片举到灯下看了很久，还是没有想起来。`,
  p => `一块坏了的表，停在四点二十。你不知道它是哪天停的，也不知道为什么一直没扔。你把它贴在耳边，听了一会儿，什么也没有。`,
  p => `孩子的第一双鞋，只有你半个手掌大。你捏在手里，忽然想起他穿着这双鞋在客厅里跑的样子。那间客厅现在已经不是你的了。`,
  p => `一叠病历，从薄到厚。你翻到最早的那张，上面的字迹还很潦草。你发现原来那些你以为早就忘了的日子，都被人一笔一笔记着。`,
  p => `一本没用完的笔记本，前面写了十几页计划，后面全是空白。最后一页写着一句话，是某个深夜写的："明年一定要……"后面没有了。`,
  p => `一张车票，去一个你已经想不起为什么要去的地方。日期是二十几年前的某一天，票价三十七块。你捏着它，像捏着一个陌生人的证物。`,
  p => `一个存折，余额三十二块。你翻了翻明细，最后一笔是十几年前取的。你没有销户，把它放回了原处。`,
  p => `一封信，写好了，没有寄。你读到第三行就停下了——那个称呼，现在已经没有人这么叫你了。`,
  p => `一张合影，七八个人，你只认得出三个。你把照片翻过来，背面什么也没写。你忽然有点怕：再过十年，你还能认出几个。`,
  p => `一串钥匙，五把，你不知道开哪扇门。房子换过三次，办公室换过四次。你把它们一把一把试过，没有一把还能用。`,
  p => `${p}留下的一个塑料袋，里面装着一小撮头发，用红绳系着。你不知道这是什么时候的，也不知道该不该扔。`,
  p => `手机里有一段没发出去的语音，三十七秒。你点开听了一半就关了——那是你自己的声音，在跟一个已经不在了的人说话。`
]

const HEAT_SCENES_TEEN = [
  p => `班里群里传开了一张截图，是你私下说的一句话，被截掉了前半句。第二天进教室，几个人看你的眼神不太一样。`,
  p => `你和${p}的聊天记录被人截图发到了群里。你翻了很久才找到那句"有问题"的话，前后文都在，只是没人看。`,
  p => `有人把你的一张照片做成了表情包，在年级群里传。你自己也收到了，配文是"哈哈"。你没有回。`,
  p => `你的日记被同宿舍的人翻出来念了几段。你站在门口听完了，然后走进去，屋里一下子安静了。`,
  p => `一段录音在班里传，是你跟${p}说的话。你听着那个声音，觉得不太像自己——原来你在背后说话的时候，是这个语气。`,
  p => `你在班群里说错了一句话，被人截图发到了别的班。第二天有人来问你"那话是你说的吗"，你说"哪句"。`,
  p => `贴吧里有个匿名帖，说的是你，没有点名，但所有人都知道是谁。你看了三遍，最难受的不是内容，是下面有人点赞。`,
  p => `你的成绩被贴在教室后面的墙上，从高到低。你站在那儿找自己的名字，找了很久，越找越往下。`
]

const HEAT_SCENES_ADULT = [
  p => `你随手发的一条内容被人断章取义挂了上去，评论区涌进来几千个人，替你安排了你没做过的事、没说过的话。第四天早上，你盯着那串红色的数字。`,
  p => `一段十几秒的短视频被剪过，剪掉了你的解释，只留下最像"那种人"的十秒。播放量在涨，你的手在抖。`,
  p => `工作群里的聊天记录外流了。有人把你的半句话单独拎出来，配了一张图。你不记得自己说过那句话，但截图上有你的头像。`,
  p => `你的名字出现在一篇爆料里，排在第三个。你根本不认识前两个。同事把链接发给你，问"这是你吗"。`,
  p => `评论区三千多条。你从第一条读到第一百条就不读了，因为后面的都差不多。你发现人多了以后，骂人的话会自己长成一个模子。`,
  p => `有人扒出了你十年前的微博，把每一条都截了图。那时候你二十三岁，说话很冲。你现在看那些话，也觉得那时候的自己挺讨厌。`,
  p => `公司让你"先别回应"。你坐在工位上，看着话题从同城榜爬到总榜。同事经过你的时候，脚步都轻了一点。`,
  p => `${p}发消息问"你还好吗"。你说没事。ta 说"这种事过两天就没了"。你说嗯。但你知道，有些东西在网上留下来，就再也删不干净了。`
]

/* 环境细节：接在场景前面，给同一件事换一个时刻、一种天气、一副身体状态。
 * 都是中性的，不会和下面的场景打架。 */
const DETAILS = [
  '那天有点闷，云压得很低。',
  '你最近总在凌晨四点醒。',
  '那阵子你天天在同一家早餐店解决早饭，老板已经认得你。',
  '你手机里存着一条没发出去的消息。',
  '那阵子你瘦了六斤，自己没察觉。',
  '小区门口的梧桐开始掉叶子。',
  '你已经连续三周没休过一个完整的周末。',
  '冰箱里有半盒放坏了的草莓。',
  '窗外的空调外机一直在滴水。',
  '你妈上周寄来一箱东西，还没拆。',
  '那天你穿了件很久没穿的衬衫。',
  '地铁上你站了四十分钟，居然没觉得累。',
  '你最近开始留意天气预报。',
  '桌上的水杯里泡着第三遍的茶叶。',
  '那几天你总想起一个很久没联系的人。',
  '你手机屏幕碎了一角，一直没修。',
  '楼下有人在装修，电钻声响了一整天。',
  '你把闹钟往前调了十分钟，然后每天多睡二十分钟。',
  '年底了，日历翻到最后一页。',
  '你刚从一个不太想去的饭局回来。',
  '那天风很大，你把外套领子立起来。',
  '你发现自己的白头发又多了几根。',
  '手机推送了一条你根本不关心的新闻。',
  '你开始习惯把手机调成静音。',
  '那段时间你说话很少，一天不超过二十句。',
  '你忽然发现自己已经很久没有大笑过。',
  '窗台上有只麻雀，站了很久才飞走。',
  '你算了一下，这个月已经过去三分之二。'
]

/* 模板 id -> 场景池。函数是为了按年龄/状态分组（学生和成年人的"被挂"不是一回事） */
const SCENE_VARIANTS = {
  callhome: () => CALLHOME_SCENES,
  checkup: s => (s.health < 55 ? CHECKUP_SCENES_BAD : CHECKUP_SCENES_OK),
  oldstuff: () => OLDSTUFF_SCENES,
  heat: (s, age) => (age <= 18 ? HEAT_SCENES_TEEN : HEAT_SCENES_ADULT)
}

function weightedTemplate(stage) {
  const pool = TEMPLATES.filter(t => t.stages.includes(stage))
  if (!pool.length) return null
  const total = pool.reduce((sum, t) => sum + t.weight, 0)
  let r = Math.random() * total
  for (const t of pool) {
    r -= t.weight
    if (r <= 0) return t
  }
  return pool[0]
}

function composeEvent(s, ctx) {
  // 随机挑一个本阶段适用的骨架，同一局不重复用同一个骨架
  let stage = null
  for (let i = 0; i < 8; i++) {
    stage = 2 + Math.floor(Math.random() * 6)
    if (!ctx.usedStages[stage]) break
  }
  if (stage == null) return null

  for (let attempt = 0; attempt < 6; attempt++) {
    const tpl = weightedTemplate(stage)
    if (!tpl || ctx.usedTpls.has(tpl.id)) continue
    ctx.usedTpls.add(tpl.id)
    ctx.usedStages[stage] = (ctx.usedStages[stage] || 0) + 1

    const [lo, hi] = STAGE_RANGE[stage]
    let age = lo + Math.floor(Math.random() * (hi - lo + 1))
    // 避开必出节点的固定年龄，减少"同一天两件事"的错乱感
    if ([7, 17, 18, 23, 30, 79].includes(age)) age += 1

    // 骨架可以指定自己的人物池（同学会只能有同学，会议室里只能有同事）
    const personSrc = tpl.persons || personPool(age)
    const pool = personSrc.filter(x => !ctx.usedPersons.has(x))
    const person = pool.length ? pickOne(pool) : pickOne(personSrc)
    ctx.usedPersons.add(person)

    const ev = tpl.make(s, Math.random, person, age)
    /* 骨架可以自带几套"选项说法"：同一件事、同样的三个动作，换一种嘴上的话。
     * 爱好、体检、同学会这些骨架出现率在 20%~60%，选项永远一模一样的话，
     * 玩到第三局就能把三个按钮背下来。语义与顺序不变，只换文字。 */
    if (ev && ev.optPanels && ev.optPanels.length) {
      const panel = ev.optPanels[Math.floor(Math.random() * ev.optPanels.length)]
      if (panel) {
        ev.options = (ev.options || []).map((o, i) =>
          (o && panel[i]) ? Object.assign({}, o, { text: panel[i] }) : o)
      }
    }
    // 换场景：同一骨架，不同的人、不同的时机
    const varFn = SCENE_VARIANTS[tpl.id]
    if (varFn) {
      const pool = varFn(s, age)
      if (pool && pool.length) {
        const f = pickOne(pool)
        const text = typeof f === 'function' ? f(person, s, age) : f
        if (text) ev.scene = text
      }
    }
    // 一半的场合，给这件事加一个时刻、一种天气、一副身体状态
    if (ev.scene && Math.random() < 0.5) {
      ev.scene = pickOne(DETAILS) + ev.scene
    }
    ev.id = 'gen_' + tpl.id
    ev.stage = stage
    ev.age = age
    ev.generated = true
    // 留个痕：这条场景里那个人是谁，供文案一致性检查用
    ev.person = person
    if (tpl.gate) ev.cond = tpl.gate
    return ev
  }
  return null
}

/* ============================================================
 *  四、结局拼装
 * ============================================================ */

const DIM_PHRASE = {
  wealth: {
    strong: ['钱这一项没让你操过心', '账面一直是你的底气', '你没为钱低过头'],
    weak: ['钱一直是个问题', '账面上始终紧', '你不太敢算总账']
  },
  happy: {
    strong: ['你活得挺高兴', '你有过很多真的开心的日子', '你把日子过出了滋味'],
    weak: ['心里一直有点空', '高兴的时候不多', '你很少真的松快过']
  },
  health: {
    strong: ['身子骨一直硬朗', '身体没怎么拖累你', '你到老还能自己走动'],
    weak: ['身体一直在还账', '这副身子骨替你付了代价', '医院成了你常去的地方']
  },
  achieve: {
    strong: ['想做的事做成了几件', '你确实做成了点什么', '你对自己有交代'],
    weak: ['想做的事一直没做成', '那点心气没落到实处', '你离想成为的人还差一截']
  }
}

const SUBTITLE_MID = [
  '不上不下，也不容易',
  '没什么大故事，也没有塌方',
  '平平的那一档，但每一格都是真的',
  '账面普通，来路不普通'
]

/* 选项本身可能带引号（「说"那别去了"」），外面再套一层就成了两个引号并列 */
function qChoice(t) {
  const s = String(t || '')
  return /["“”「」]/.test(s) ? `「${s}」` : `"${s}"`
}

/* 结局正文里回扣的那个选择。原来只有 4 种，一个结局固定用其中一句，
 * 分母只有 4，读十几个结局就会撞。扩到 14 种，并按"离结局还剩多少年"分三档：
 * 刚发生的事用"后来"，隔了几十年的事用"到现在"。 */
const BACKFILL_PATTERNS = [
  l => `${l.age} 岁那次「${l.title}」，你选了${qChoice(l.choice)}。现在回头看，那不只是个选择——那就是你。`,
  l => `如果 ${l.age} 岁在「${l.title}」里你选了另一边，这个故事就要重写。可你没有，于是你成了你。`,
  l => `「${l.title}」那件事，${l.age} 岁的你以为翻篇了。它没有，它一直在，一直算数。`,
  l => `你大概还记得 ${l.age} 岁「${l.title}」那天的犹豫。那几秒钟，比之后很多年都诚实。`,
  l => `${l.age} 岁，「${l.title}」。你选了${qChoice(l.choice)}，然后把这件事忘了很多年。`,
  l => `把一辈子往回倒，最先浮上来的不是哪次成功，是 ${l.age} 岁「${l.title}」那天你做的决定。`,
  l => `「${l.title}」这道题，${l.age} 岁的你没有绕开。绕开的人后来也没轻松多少。`,
  l => `你后来的人生里，有一样东西是 ${l.age} 岁那天定下的：${qChoice(l.choice)}。`,
  l => `不是所有人都记得自己在 ${l.age} 岁时做过什么决定。你记得，因为它改了后面所有的事。`,
  l => `${l.age} 岁那道「${l.title}」，你选了${qChoice(l.choice)}。那时你以为还有无数次机会重来。`,
  l => `有人一辈子都在回避 ${l.age} 岁遇到的这种题。你没有回避，你选了${qChoice(l.choice)}。`,
  l => `「${l.title}」之后再没人问过你同样的问题。${l.age} 岁那次的答案，是唯一的答案。`,
  l => `如果只看结果，${l.age} 岁那次「${l.title}」像是件小事。可它是分水岭，只是水还没分出来。`,
  l => `你在 ${l.age} 岁说出${qChoice(l.choice)}的时候，不知道自己签的是一份长期合约。`
]

/* ---- 收束句 ----
 * 原来是 6 条固定句子，其中 3 条吃掉了 81% 的局，读十次有八次一样。
 * 现在拆成"本局的一个具体事实" + "一句抽象的收束"，两者相乘。
 * 事实按条件筛，所以每局开头那句都不一样；收束只讲道理，不碰事实。 */

const CLOSER_FACTS = [
  s => s.money >= 500 ? `账上留着 ${s.money} 万。这个数字，你小时候在课本上没见过。` : null,
  s => s.money >= 120 && s.money < 500 ? `${s.money} 万。够体面，也还没到"随便花"的地步。` : null,
  s => s.money >= 30 && s.money < 120 ? `账上 ${s.money} 万，一套房，一份养老金——标准的、不出错的配置。` : null,
  s => s.money > 0 && s.money < 30 ? `到最后账上剩 ${s.money} 万。不多，但也没欠谁的。` : null,
  s => s.money <= 0 ? '到最后，账上没剩下什么，还欠着一点。' : null,

  s => s.finalAge >= 88 ? `活到 ${s.finalAge} 岁。同龄人里，你算站到最后的几个。` : null,
  s => s.finalAge <= 66 ? `${s.finalAge} 岁。比谁都以为的要早。` : null,
  s => s.finalAge > 66 && s.finalAge <= 74 ? `${s.finalAge} 岁走的。这一局不算长。` : null,
  s => s.finalAge > 74 && s.finalAge < 88 ? `${s.finalAge} 岁，一个既不意外也不值得庆幸的数字。` : null,

  s => hasPartner(s) && hasKid(s) ? '有人在旁边，有人在外地，过节会回来。' : null,
  s => hasPartner(s) && !hasKid(s) ? '两个人过到最后，谁也没提当年那个"再等等"。' : null,
  s => !hasPartner(s) && hasKid(s) ? '孩子长大了，有自己的事；你这边，习惯了安静。' : null,
  s => !hasPartner(s) && !hasKid(s) ? '一个人，一直是一个人。这个"一直"，比任何决定都重。' : null,

  s => F(s, 'gov') ? '一份稳定的工作做到头，中间没红过脸，也没冒过尖。' : null,
  s => F(s, 'founder') ? '自己给自己发了半辈子工资，最后也没搞清算是赚了还是赔了。' : null,
  s => F(s, 'freelance') || F(s, 'free_range') ? '从来没在一个地方待太久，也没让谁替你安排过明天。' : null,
  s => s.career >= 8 ? '名片换过几版，头衔一次比一次长，能说上话的人一次比一次少。' : null,
  s => s.career <= 2 ? '一辈子没管过人，也没被谁特别记得。活干完了，人散了。' : null,

  s => (s.edu || 0) >= 5 ? '书念得比周围人都多，后来发现这只是一张入场券，不是答案。' : null,
  s => (s.edu || 0) <= 2 ? '书没念几年，早早就上手干活。你懂得的东西，大多是别人教的，或者自己撞出来的。' : null
]

const CLOSER_VERDICTS = [
  '这一生没有什么惊天动地，但每一天都是你自己过出来的。',
  '往下翻是你自己的事——这本账还没写完的部分，在你要去的地方。',
  '有些部分你觉得写得不像你，那是正常的——人对自己的一生，向来是旁观者清。',
  '没有句号。只有到这儿为止。',
  '你不需要谁来给这一生打分，包括这个页面。',
  '遗憾是标配，不是故障。区别只在于，你是背着它走，还是把它放在路边。',
  '所有的"如果当时"都不会有答案。这不是残忍，这是公平。',
  '你把很多事做得还行，把少数几件事做得很好。后一种别人不知道，你自己知道。',
  '你现在还能想起的人，多半也想得起你。这就够了。',
  '有些账不必算清。算清了也不会更舒服。',
  '你不是你做过的事的总和，你是你还没放下的事的总和。',
  '讲得不算精彩，但没有一句是编的。',
  '如果重来一次，你大概还是会在同样的几个地方犹豫。这不叫没长进，这叫是你。',
  '活成现在这样，有运气，也有你自己。这两样别互相抢功。',
  '你留下的东西不多，但有几样，别人拿不走。',
  '日子是一天一天过的，不是一年一年过的。这一点，你到最后才真正懂。'
]

/* 人情味更重的三种局面，单独写，不参与组合 */
const CLOSER_SPECIAL = {
  richSick: [
    s => `账面 ${s.money} 万，体检报告却一直没敢细看。这两样摆在一起，你比谁都清楚哪一样更贵。`,
    s => `你这辈子最舍得花钱的地方是医院。${s.money} 万里有相当一部分，是买"再多几年"。`,
    s => `钱解决了你大部分问题，除了那个最根本的。${s.finalAge} 岁这年，你终于承认它解决不了。`,
    s => '你什么都有了，就是没有一副能享受这一切的身体。这个玩笑，开得有点大。',
    s => '别人羡慕你的账面。你羡慕楼下那个每天能自己走两圈的老头。',
    s => `医生说"注意休息"说了二十年，你说了二十年"等这阵子忙完"。${s.finalAge} 岁这年，这阵子终于忙完了。`,
    s => '你算得清每一笔投资回报，唯独没算过身体的折旧率。',
    s => '钱在账上，药在床头柜里，两样东西离得不远，也不近。'
  ],
  poorHappy: [
    s => `钱不多，${s.money > 0 ? `账上就 ${s.money} 万，` : ''}但热乎气是足的。这两种富有长得不一样，别搞混了。`,
    s => '你没攒下什么，但你有过很多"今天真不错"的日子。这两样，很难同时要。',
    s => '别人问你这辈子值不值，你想了想，说"挺好"。这不是场面话。',
    s => '你这一生没赢过什么，也没输掉自己。',
    s => '家里一直不宽裕，但饭桌上一直有话说。这一点，很多人花很多钱也买不到。',
    s => '你没能给孩子留下什么，除了一个"回家吃饭"的习惯。',
    s => '钱紧的日子教会你一件事：高兴不贵，只是需要人陪。',
    s => `到最后也没富裕过。可你记得的那些好日子，全都不花钱。`
  ],
  gloomy: [
    s => `读到这里你可能有点闷。${s.finalAge} 年里，你笑出来的次数其实比你以为的多——只是统计表不记这个。`,
    s => '你不是没过好，你是很少允许自己觉得"过得好"。这两件事差得很远。',
    s => '这一生你一直在等一个"可以松口气"的时刻。它没来。但你也撑到了这里。',
    s => '高兴这件事，你一直觉得要"配得上"才行。其实它不挑人。',
    s => '你把很多力气花在让自己别出错上，于是没剩下力气去高兴。',
    s => '有些年你过得很钝，不是不痛，是顾不上痛。',
    s => '你不太会说自己想要什么。这个习惯，跟了你一辈子。',
    s => '到最后你也说不清，是不甘心多一点，还是累多一点。'
  ]
}

function buildCloser(s, sc, base) {
  if (base.family === 'body' || base.family === 'money') {
    const facts = CLOSER_FACTS.map(f => { try { return f(s) } catch (e) { return null } }).filter(Boolean)
    const fact = facts.length ? facts[Math.floor(Math.random() * facts.length)] : ''
    const verdict = CLOSER_VERDICTS[Math.floor(Math.random() * CLOSER_VERDICTS.length)]
    return `${fact}${verdict}`
  }
  if (sc.wealth > 66 && sc.health < 45) {
    const a = CLOSER_SPECIAL.richSick
    return a[Math.floor(Math.random() * a.length)](s)
  }
  if (sc.wealth < 34 && sc.happy >= 60) {
    const a = CLOSER_SPECIAL.poorHappy
    return a[Math.floor(Math.random() * a.length)](s)
  }
  if (sc.happy < 45) {
    const a = CLOSER_SPECIAL.gloomy
    return a[Math.floor(Math.random() * a.length)](s)
  }
  const facts = CLOSER_FACTS.map(f => { try { return f(s) } catch (e) { return null } }).filter(Boolean)
  const fact = facts.length ? facts[Math.floor(Math.random() * facts.length)] : `${s.finalAge} 岁。`
  const verdict = CLOSER_VERDICTS[Math.floor(Math.random() * CLOSER_VERDICTS.length)]
  return `${fact}${verdict}`
}

function dimKeyOf(score) {
  if (score >= 62) return 'strong'
  if (score < 45) return 'weak'
  return 'mid'
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100003
  return h
}

/* 副题不能和正文第一段撞话，否则读起来像同一句说了两遍 */
function shareLongPhrase(short, text) {
  const n = short.length
  for (let len = Math.min(8, n); len >= 6; len--) {
    for (let i = 0; i + len <= n; i++) {
      if (text.includes(short.slice(i, i + len))) return true
    }
  }
  return false
}

function buildSubtitle(sc) {
  const dims = [['wealth', sc.wealth], ['happy', sc.happy], ['health', sc.health], ['achieve', sc.achieve]]
  const states = dims.map(([k, v]) => ({ k, st: dimKeyOf(v) }))
  const strongs = states.filter(x => x.st === 'strong')
  const weaks = states.filter(x => x.st === 'weak')
  if (strongs.length && weaks.length) {
    const a = pickOne(DIM_PHRASE[pickOne(strongs).k].strong)
    const b = pickOne(DIM_PHRASE[pickOne(weaks).k].weak)
    return `${a}，但${b}`
  }
  if (strongs.length) return pickOne(DIM_PHRASE[pickOne(strongs).k].strong)
  if (weaks.length) return pickOne(DIM_PHRASE[pickOne(weaks).k].weak)
  return pickOne(SUBTITLE_MID)
}

/* 从真实选择里挑一件最贴这个走向主题的：身体看健康代价，钱与事业看钱，其余看心境 */
function pickMoment(s, base) {
  const mem = (s.mem || []).filter(m => m.age >= 15 && m.age <= 55 && m.title && m.choice && m.choice.length >= 2)
  if (!mem.length) return null
  const key = base.family === 'body' ? 'dhl'
    : (base.family === 'work' || base.family === 'money') ? 'dm'
      : 'dh'
  let best = null
  let bestV = -1
  mem.forEach(m => {
    const v = Math.abs(m[key] || 0) + (m.age >= 20 ? 1 : 0)
    if (v > bestV) { bestV = v; best = m }
  })
  if (!best || bestV < 3) return mem[Math.floor(mem.length / 2)]
  return best
}

function composeEnding(s, sc, base, scene) {
  /* ---- 光景：由引擎选（100 走向 × 100 光景 = 10000 种），这里只负责拼接 ---- */
  const scn = scene || { id: 'x', name: '', line: '' }
  const fix = t => genderFix(t, s.gender === 'f')

  /* ---- 标题：人生走向 · 晚年光景，确定性唯一 ---- */
  const title = scn.name ? `${base.title} · ${scn.name}` : base.title

  /* ---- 副题：最强维度 × 最弱维度，避开与正文撞句 ---- */
  let subtitle = buildSubtitle(sc)
  for (let i = 0; i < 6 && shareLongPhrase(subtitle, base.desc); i++) subtitle = buildSubtitle(sc)

  /* ---- 正文：走向底色 / 晚年光景 / 一件真实的选择 / 收束 ---- */
  const parts = [base.desc, scn.line]

  const moment = pickMoment(s, base)
  if (moment) {
    const tpl = BACKFILL_PATTERNS[hashStr(base.id + '_' + scn.id) % BACKFILL_PATTERNS.length]
    parts.push(tpl(moment))
  }

  /* 收束句：本局的具体事实 + 一句抽象的收束，两者相乘 */
  parts.push(buildCloser(s, sc, base))

  return {
    id: scn.id === 'x' ? base.id : `${base.id}_${scn.id}`,
    base: base.id,
    scene: scn.id,
    archetype: base.title,
    title,
    subtitle,
    desc: fix(parts.filter(Boolean).join('\n\n'))
  }
}

/* 结局文本（走向底色写死在 data.js）按玩家性别落定占位符，如"爷爷/奶奶"。
 * 与 engine.resolveGender 同一套对表（UMD 不能互相引用，此处独立一份，改对表要两处同步）。 */
const GF_PAIRS = [
  ['男孩子', '女孩子'], ['爸爸', '妈妈'], ['儿子', '女儿'], ['爷爷', '奶奶'],
  ['外公', '外婆'], ['姥爷', '姥姥'], ['伴郎', '伴娘'], ['大爷', '大妈'],
  ['哥哥', '姐姐'], ['先生', '女士'], ['老公', '老婆'], ['孙子', '孙女'],
  ['爸', '妈'], ['哥', '姐']
]
function genderFix(text, isF) {
  if (!text || typeof text !== 'string' || text.indexOf('/') < 0) return text
  let out = text
  for (let i = 0; i < GF_PAIRS.length; i++) {
    const p = GF_PAIRS[i]
    out = out.split(p[0] + '/' + p[1]).join(isF ? p[1] : p[0])
  }
  return out.split('他/她').join('ta')
}

function sample(arr, n) {
  const copy = arr.slice()
  const out = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

/* ============================================================
 *  五、建议规则引擎
 * ============================================================ */

/* 每条规则：bucket 用于去重，cond 判定是否入围，variants 里随机挑一条。
 * 文本会引用 ctx —— ctx 是你这局真实发生过的关键时刻。 */

function buildCtx(s) {
  const mem = s.mem || []
  const byKey = key => {
    let worst = null
    mem.forEach(m => {
      if (m[key] < 0 && (!worst || m[key] < worst[key])) worst = m
    })
    return worst
  }
  let bestHappy = null
  mem.forEach(m => {
    if (m.dh > 0 && (!bestHappy || m.dh > bestHappy.dh)) bestHappy = m
  })
  return {
    worstHealth: byKey('dhl'),
    worstHappy: byKey('dh'),
    worstMoney: byKey('dm'),
    bestHappy,
    picks: sample(mem.filter(m => Math.abs(m.dh) >= 4 || Math.abs(m.dhl) >= 4 || Math.abs(m.dm) >= 8), 3)
  }
}

const ADVICE_RULES = [
  {
    bucket: 'body',
    cond: (s, sc) => sc.health < 45,
    score: (s, sc) => 100 - sc.health + 10,
    variants: [
      c => ({
        title: '关于身体',
        text: c.worstHealth
          ? `${c.worstHealth.age} 岁那次「${c.worstHealth.title}」，你选了硬扛。身体当时没说什么，后来一直记着。从这周开始，把它当个需要维系的合伙人——体检约上，觉睡够，这三件事比任何补品都值钱。`
          : '你的身体在给你递条子，不是最后通牒，但也不是可以再拖的信号。这周做两件事：约一次体检，连续三天十二点前睡。就当是替下一个十年的自己存钱。'
      }),
      c => ({
        title: '利息在涨',
        text: `健康是唯一一项欠了会自动加息的债。${c.worstHealth ? `${c.worstHealth.age} 岁那回你已经在还利息了，` : ''}现在开始还本金：每周三次快走三十分钟，三个月后你来谢我。唯一的前提是——真的去做。`
      }),
      c => ({
        title: '先修屋顶',
        text: '下雨天修屋顶，永远来不及。别研究养生偏方，就三件事：睡够、走够、按时体检。把这三件当成不可取消的会议写进日程。你的余生要用这副身体过，它是唯一的。'
      })
    ]
  },
  {
    bucket: 'mind',
    cond: (s, sc) => sc.happy < 48,
    score: (s, sc) => 100 - sc.happy + 10,
    variants: [
      c => ({
        title: '把高兴当正事',
        text: c.bestHappy
          ? `${c.bestHappy.age} 岁那次「${c.bestHappy.title}」之后，你高兴过一阵——说明你知道什么能让自己亮起来。问题从来不是不会，是总觉得它"不配占用时间"。从今天起，把它排进日程，跟开会一个待遇。`
          : '你这一生把太多时间给了"应该"，太少给了"想要"。回想一下：上一次纯粹因为开心而做的事是什么时候？这件事值得每周做一次，这不是放纵，是维护。'
      }),
      c => ({
        title: '账上该给自己记一笔',
        text: '你这一局所有的账都在替别人和将来记：房子、家人、前途。给自己也开一个户头——每周半天，只做没有产出的事。散步、发呆、跟人闲聊都算。这不是浪费，这是把时间还给自己。'
      }),
      c => ({
        title: '不是矫情',
        text: '心境低不是想不开，是电量低。别用"坚持一下"糊弄它。两件小事先做起来：每天出门晒十分钟太阳；找一个能说真话的人，把这阵子的实话讲一遍。能说真话的人不用多，一个就够本。'
      })
    ]
  },
  {
    bucket: 'mind',
    cond: (s, sc) => sc.wealth >= 58 && sc.happy < 55,
    score: () => 72,
    variants: [
      () => ({
        title: '富余的那部分',
        text: '你的账户有富余，但你的生活没有。钱能买来更好的选项，买不来"想要"这个动作——后者要练习。试着花一笔完全"不合理"的钱：不为保值、不为面子，只为高兴。看看你还会不会。'
      }),
      () => ({
        title: '赢惯了的人',
        text: '你一直在解决 bigger 的问题，很久没有做 smaller 但让自己高兴的事了。列三件你十年前喜欢、现在觉得"幼稚"的事，挑一件这个月做一次。幼稚是能力，别丢。'
      })
    ]
  },
  {
    bucket: 'money',
    cond: (s, sc) => sc.wealth < 40 && s.amb >= 55,
    score: (s, sc) => 100 - sc.wealth + 6,
    variants: [
      c => ({
        title: '不甘心要落地',
        text: c.worstMoney
          ? `你一直不甘心，这股劲没错，错的是它一直没有落到一件具体的事上。${c.worstMoney.age} 岁那次花出去的钱，买的是教训——教训已经付过费了，别让内容白买。未来一年，选一件最小的能变现的事，做完它。`
          : '你的不甘心是真的，你的方法一直没跟上也是真的。别再横着使劲了：选一件最小的、三个月内能见到钱的事，从头到尾做完一次。完成一件小事，比计划十件大事值钱。'
      }),
      () => ({
        title: '别跟收入较劲',
        text: '钱这件事，开源永远排在节流前面，但节流是今天就能做的。把每月固定支出砍掉一项最不心疼的，砍下来的部分设成自动转存——你不擅长忍，那就让机制替你忍。'
      })
    ]
  },
  {
    bucket: 'money',
    cond: s => s.flags.includes('mortgage'),
    score: () => 55,
    variants: [
      () => ({
        title: '那套房子',
        text: '房贷是你这辈子签过的最长的合同，也是最难中途反悔的。两件事：留出一笔"失业也能撑六个月"的钱，这是你所有的底气；除此之外，别为它牺牲健康和关系——房子是用来住的，不是用来押上一切的。'
      }),
      () => ({
        title: '月供之外的自由',
        text: '有房贷的人生像绑着沙袋跑步，跑得动，但别再往上加沙子了。这些年别加杠杆，别碰看不懂的东西。你最大的资产不是那套房，是"现金流没断"这个事实。守住它。'
      })
    ]
  },
  {
    bucket: 'growth',
    cond: s => s.flags.includes('bigtech'),
    score: () => 52,
    variants: [
      () => ({
        title: '那盏总亮着的灯',
        text: '高强度是能攒利息的，攒在你的颈椎、眼睛和情绪里。趁现在把三件事定成铁律：周末半天彻底离线、每天一个不加班的晚上、每年一次完整休假。你的职业寿命取决于恢复速度，不取决于冲刺速度。'
      }),
      () => ({
        title: '简历之外',
        text: '平台的光环很亮，但贴身的东西才带得走：你的判断、你的人和你的身体。每年问自己一次"如果明天离开，我剩下什么"。答案越厚，你越自由——真正的安全感是随时可以走，而不是必须走。'
      })
    ]
  },
  {
    bucket: 'relation',
    cond: s => s.flags.includes('divorced') || s.family < 42,
    score: (s, sc) => 60 + (42 - s.family),
    variants: [
      () => ({
        title: '关系要见面',
        text: '关系不是靠回忆维持的，是靠见面。能说真话的人一只手数得过来就够了，如果现在数不出三个，从这周开始约人吃饭。别等"有空"——"有空"是个不会自己到来的东西。'
      }),
      () => ({
        title: '把话说完',
        text: '你这一生有几段关系是断在"没说完"上的。挑一段还算不上死灰的，把当年没说完的话说一遍——不为复合，为完整。说出来的那一刻，你就自由了。'
      })
    ]
  },
  {
    bucket: 'mind',
    cond: (s, sc) => sc.happy >= 48 && sc.happy < 62,
    score: () => 45,
    variants: [
      () => ({
        title: '给高兴加密度',
        text: '你的日子不坏，只是高兴的密度偏低。提高密度不用大动作：每周一次跟让你舒服的人吃饭，每周一次做那件"没有用"的事。高兴是攒出来的，一次一小笔。'
      }),
      () => ({
        title: '守住这个水位',
        text: '你的心境在及格线以上，但离"从容"还有一段。警惕两样东西：连续的熬夜，和"等忙完再说"。水位往下掉的时候是没有声音的，掉完你才发现。'
      })
    ]
  },
  {
    bucket: 'body',
    cond: (s, sc) => sc.health >= 60,
    score: () => 40,
    variants: [
      () => ({
        title: '这是你的本钱',
        text: '你这副身体争气，这一局它替你扛了很多。别把它的好当成理所当然：把现在还做得动的运动定为习惯，而不是等它抗议了才开始。好身体的意义不是活得久，是活得能自理。'
      })
    ]
  },
  {
    bucket: 'wealth_low',
    cond: (s, sc) => sc.wealth < 52,
    score: () => 62,
    variants: [
      () => ({
        title: '钱少的时候，先保住三样',
        text: '钱紧的时候最容易乱：乱借钱、乱投资、乱答应人。先保住三样——一个能随时拿出的应急钱、一份还能涨的技能、几个真能开口的朋友。这三样在，穷是暂时的；这三样没了，穷会变成一种状态。'
      }),
      () => ({
        title: '别用未来的钱补现在的洞',
        text: '你这一局好几次是靠借和拖过去的。借和拖都不是错，错的是把它们当成办法。真正的办法只有两个：把支出砍到收入以下，或者把收入抬到支出以上。听起来像废话，但能做到的人不多。'
      }),
      () => ({
        title: '穷不可怕，怕的是习惯',
        text: '长期缺钱会改变一个人的判断方式：只看眼前、不敢试、怕失去。你身上已经有这个苗头了。对抗它的方法很土：每月存一笔小到不会心疼的钱，让自己重新拥有"可以不动用"的东西。'
      })
    ]
  },
  {
    bucket: 'wealth_high',
    cond: (s, sc) => sc.wealth >= 48,
    score: () => 55,
    variants: [
      () => ({
        title: '钱到一定程度，考验的是别的',
        text: '到这个数，钱本身已经不是问题了，问题变成：你有没有能一起吃饭的人、有没有还想做的事、有没有能睡得着的夜。这三样缺一样，钱就只是个数字。'
      }),
      () => ({
        title: '把一部分钱换成时间',
        text: '你这一局赚得不少，但花在自己身上的时间不多。钱可以买时间——请人做那些不必你做的事，把省下来的两小时用来发呆、陪人、或者什么都不干。这是最划算的一笔兑换。'
      }),
      () => ({
        title: '别让孩子只学会花钱',
        text: '你给了他们不少。但一个人真正需要从父母这儿拿到的，不是钱，是"怎么面对没钱的时候"。找个机会，让他们自己挣一次、亏一次、被人拒绝一次。'
      })
    ]
  },
  {
    bucket: 'health_bad',
    cond: (s, sc) => sc.health < 52,
    score: () => 70,
    variants: [
      () => ({
        title: '身体已经在替你付账',
        text: '你这一局拿身体换了不少东西——时间、钱、别人的认可。它现在开始收账了。从今天起，把"休息"当成一件必须完成的事写进日程，而不是等有空。它不会有空。'
      }),
      () => ({
        title: '先做一件最小的事',
        text: '别一上来就办健身卡。先做一件小到不可能失败的事：每天走十五分钟，或者十一点半关灯。坚持一个月，你会拿回一点对身体的控制感——这个感觉比任何指标都重要。'
      }),
      () => ({
        title: '去查一次，别猜',
        text: '你心里大概有个数，只是一直没去。猜是最耗人的：它让你既不敢面对，也不能放下。查清楚了，最坏也不过是知道该怎么做。'
      })
    ]
  },
  {
    bucket: 'health_ok',
    cond: (s, sc) => sc.health >= 48,
    score: () => 42,
    variants: [
      () => ({
        title: '这是你最大的运气',
        text: '你这一局身体很好，好到你可能没意识到这是运气。把它当本钱用，别当背景用：该睡就睡，该动就动。人到中年以后，身体好的人和身体不好的人，过的是两种人生。'
      }),
      () => ({
        title: '别把好身体用来硬扛',
        text: '身体好的人最容易犯的错，是觉得自己还能再撑一撑。撑得住是本事，知道什么时候不该撑，是智慧。'
      })
    ]
  },
  {
    bucket: 'alone',
    cond: (s, sc) => !hasPartner(s) && sc.happy < 55,
    score: () => 58,
    variants: [
      () => ({
        title: '一个人，也要有人',
        text: '一个人过不是问题，一个人扛才是。给自己建三个联系人：一个能借钱的、一个能半夜打电话的、一个能一起吃饭的。这三个人不用多，但要有，而且要现在就维护。'
      }),
      () => ({
        title: '孤独和独处是两件事',
        text: '独处是你选的，孤独是你没得选。分辨它们很简单：独处之后你是充电的，孤独之后你是空的。如果是后者，别硬撑，去找人——哪怕只是去楼下坐着。'
      }),
      () => ({
        title: '把家收拾成有人气的样子',
        text: '一个人住久了，家里会越来越像旅馆。换一盏暖一点的灯，买两个杯子，做一次两个人的饭（剩下的第二天吃）。这些都是小事，但它们在提醒你：你还在过日子，不是在等日子过去。'
      })
    ]
  },
  {
    bucket: 'divorced',
    cond: s => s.flags.includes('divorced') || s.flags.includes('widowed'),
    score: () => 60,
    variants: [
      () => ({
        title: '别急着证明自己过得好',
        text: '分开之后，很多人会用力过猛：忙着变好、忙着让别人看见。其实没必要。允许自己有一段时间过得不好，这不是失败，是恢复。伤口需要的是时间，不是表演。'
      }),
      () => ({
        title: '把该说的说完',
        text: '你心里可能还有一些话没说完。找一次机会说完——不是为了复合，是为了不再在半夜想起。说不出口就写下来，写完可以烧掉。'
      }),
      () => ({
        title: '孩子不是你的同盟',
        text: '如果你们有孩子，别让 ta 站队，也别让 ta 替你传话。孩子需要的不是知道谁对谁错，是知道"这两个人都还爱我"。这件事比你的委屈重要。'
      })
    ]
  },
  {
    bucket: 'parent_care',
    cond: s => s.flags.includes('cared_parent'),
    score: () => 57,
    variants: [
      () => ({
        title: '照顾人的人也需要被照顾',
        text: '你这一局把很多力气花在了别人身上。注意一个信号：如果你开始对 ta 不耐烦，那不是你不孝，是你耗空了。找个人替你半天，这不是偷懒，是续航。'
      }),
      () => ({
        title: '把"以后"提前说清楚',
        text: '趁还清醒，把该问的问完：他们想怎么治病、想在哪里走、存折和密码在哪、有没有没说完的话。这些话很难开口，但现在不说，以后就只能在猜里做决定。'
      })
    ]
  },
  {
    bucket: 'no_kid',
    cond: (s, sc) => !hasKid(s),
    score: () => 50,
    variants: [
      () => ({
        title: '把"以后谁管我"换成具体的事',
        text: '没有孩子的人，晚年最怕的不是没人管，是没人知道。做三件具体的事：一份写清楚的医疗意愿、一个能签字的紧急联系人、一笔专门留着请人的钱。做完这三件，你会发现心里踏实很多。'
      }),
      () => ({
        title: '把关系往外扩一圈',
        text: '血缘不是唯一的依靠。侄甥、老友、邻居、一起玩的伙伴——这些关系需要提前十年养。别等到需要了才去联系，那时候大家都老了。'
      })
    ]
  },
  {
    bucket: 'career_flat',
    cond: (s, sc) => s.career < 7,
    score: () => 45,
    variants: [
      () => ({
        title: '没升上去，不等于没做成',
        text: '你这一局职位不高，但你把很多具体的事做成了。职场只记得头衔，日子记得别的：你带过的人、你救过的项目、你没坑过的人。后面这些，才是别人提起你时会说的。'
      }),
      () => ({
        title: '把经验变成可传的东西',
        text: '你手里有一些别人没有的东西：怎么避坑、怎么跟某种人打交道、怎么在烂摊子里保住底线。写下来，或者带一个人。传出去的东西才活得比你久。'
      })
    ]
  },
  {
    bucket: 'mortgage',
    cond: s => s.flags.includes('mortgage'),
    score: () => 48,
    variants: [
      () => ({
        title: '房子是你的，日子也是你的',
        text: '你为这个房子付出了很多：首付、月供、不敢辞职的那些年。它给了你一个地址，也拿走了你的一部分自由。想清楚一件事：它是用来住的，不是用来证明的。'
      }),
      () => ({
        title: '别让月供决定你所有选择',
        text: '有了房贷之后，人会不自觉地变保守：不敢换工作、不敢休息、不敢说不。保守本身没错，但要留一个口子——一笔能动用的钱，或者一个能商量的人。'
      })
    ]
  },
  {
    bucket: 'no_house',
    cond: s => !s.flags.includes('mortgage') && s.finalAge >= 55,
    score: () => 44,
    variants: [
      () => ({
        title: '没买房，也是一种选择',
        text: '你这一局没把一生押在一套房上。这意味着你有过更多的机动：换城市、换行业、在别人不敢动的时候动。代价是晚年要面对租金和不确定。把这两件事都想清楚，就不算亏。'
      }),
      () => ({
        title: '把"住"这件事安排好',
        text: '没有自己的房子，晚年最要紧的是"住得稳"。提前想好三种情况：还能自理时住哪、半自理时住哪、不能自理时住哪。想清楚这三件事，比有一套房子更让人安心。'
      })
    ]
  },
  {
    bucket: 'founder',
    cond: s => s.flags.includes('founder'),
    score: () => 54,
    variants: [
      () => ({
        title: '你赌过一次',
        text: '创业这件事，赢了叫有魄力，输了叫不懂事。但真正的收获不在结果里，在你知道了自己能扛多大的事、能欠多少人的钱还睡得着。这个认知，打工一辈子也拿不到。'
      }),
      () => ({
        title: '别把公司当成自己',
        text: '你这一局把很多身份绑在了公司上。趁早分开：公司是公司，你是你。分开之后，你才可能在公司之外，还有一个能站住的地方。'
      })
    ]
  },
  {
    bucket: 'gov',
    cond: s => s.flags.includes('gov'),
    score: () => 50,
    variants: [
      () => ({
        title: '稳定是有价格的',
        text: '你这一局选了稳定。稳定的价格是：你会看到一些不如你的人走得更快，也会有一些时刻觉得自己在空转。想清楚你当初换的是什么——是安全感，还是别人的眼光。'
      }),
      () => ({
        title: '在体制里，也要有一件自己的事',
        text: '铁饭碗能保住生活，保不住意义。找一件跟职级无关的事做：写东西、带人、钻研一门手艺。这件小事会让你在退休那天，不至于突然空掉。'
      })
    ]
  },
  {
    bucket: 'freelance',
    cond: s => s.flags.includes('freelance') || s.flags.includes('free_range'),
    score: () => 50,
    variants: [
      () => ({
        title: '自由是靠自律换的',
        text: '你不用打卡，代价是没人替你安排时间。给自己定三条硬规矩：固定的起床时间、固定的运动、固定的休息日。这三条守住，自由才是自由，不然只是失控。'
      }),
      () => ({
        title: '把客户当客户，别当朋友',
        text: '单干的人最容易吃的亏，是把交情和生意混在一起。合同、报价、付款节点，该清楚就清楚。这不是不近人情，这是让关系能长久。'
      })
    ]
  },
  {
    bucket: 'job_hop',
    cond: s => s.career >= 3 && s.career <= 6 && s.finalAge >= 50,
    score: () => 40,
    variants: [
      () => ({
        title: '换过很多地方，也是一种积累',
        text: '你这一局换过不少工作。别人可能觉得你"不稳定"，但你知道每一处都学到了什么。把那些东西整理成一套自己的方法，它比任何一份履历都值钱。'
      }),
      () => ({
        title: '找个能待久的地方',
        text: '四十岁以后，频繁换地方的成本会变高。不必强迫自己忠诚，但可以找一件愿意做十年的事——哪怕换公司，也做同一件事。深度是需要时间堆的。'
      })
    ]
  },
  {
    bucket: 'low_edu',
    cond: (s, sc) => s.edu <= 2,
    score: () => 46,
    variants: [
      () => ({
        title: '学历只挡了开头那几年',
        text: '你这一局起点不高，但它挡的主要是前几年。往后靠的是：能不能把一件事做透、能不能让人放心、能不能在没人教的时候自己学。这三样，跟学历没关系。'
      }),
      () => ({
        title: '别用学历解释一切',
        text: '有时候你会把不顺归到"我学历不行"。这个解释省事，但它会让你停止找真正的原因。下次想问"是不是因为我学历低"的时候，先问一句"是不是我方法不对"。'
      })
    ]
  },
  {
    bucket: 'high_edu',
    cond: (s, sc) => s.edu >= 4,
    score: () => 43,
    variants: [
      () => ({
        title: '别让"应该"绑住你',
        text: '你读过不少书，也因此更容易被"应该过成什么样"绑住。好学历是选择权，不是任务书。你可以用它去过一种别人不理解的生活，这不叫浪费。'
      }),
      () => ({
        title: '把知识变成判断',
        text: '知道很多不等于判断得准。判断来自：做过、错过、复盘过。别停在"我知道"，去找一件能让你犯错的小事做。'
      })
    ]
  },
  {
    bucket: 'early_loss',
    cond: (s, sc) => s.finalAge < 68,
    score: () => 66,
    variants: [
      () => ({
        title: '短也是一种活法',
        text: '你这一局走得早。回头看，你把时间花在了你在乎的事上——也许不够久，但不算白过。如果还能重来一次，值得改的可能不是"活得更久"，是"更早开始做那件一直想做的事"。'
      }),
      () => ({
        title: '身体是最前面那个 1',
        text: '你这一局把太多东西排在了身体前面。这不是道德问题，是算术问题：身体没了，后面所有的零都没有意义。'
      })
    ]
  },
  {
    bucket: 'long_life',
    cond: (s, sc) => s.finalAge >= 85,
    score: () => 47,
    variants: [
      () => ({
        title: '活得久，要学会告别',
        text: '你活得比很多人都久。这意味着你会送走很多人：朋友、同辈、甚至晚辈。悲伤会变成一种日常。允许自己难过，也允许自己继续高兴——这两件事不矛盾。'
      }),
      () => ({
        title: '给自己留一件每天要做的事',
        text: '长寿的秘诀里，有一半是"还有事等着我"。哪怕只是浇花、喂猫、等一个电话。这件事不用有意义，它只需要每天发生。'
      })
    ]
  },
  {
    bucket: 'still_working',
    cond: s => s.flags.includes('still_working'),
    score: () => 45,
    variants: [
      () => ({
        title: '还在干，是好事也是提醒',
        text: '你这一局到老还在做事。这说明你还有用、还有人要，也说明你可能没给自己留过"什么都不做"的时间。试着空出一天，什么都不安排，看看自己受不受得了。'
      }),
      () => ({
        title: '慢下来不等于没用',
        text: '很多人怕停下来，是怕一停下来就发现自己不重要了。这个发现早晚会来。早点来，你还有时间重新定义自己。'
      })
    ]
  },
  {
    bucket: 'regret_free',
    cond: (s, sc) => sc.happy >= 72,
    score: () => 44,
    variants: [
      () => ({
        title: '你这一局活得挺顺',
        text: '顺的时候最容易做的一件事，是把顺当成理所当然。留一个习惯：每年写一次"这一年我靠了什么"。写下来你会看到，里面有运气、有别人、也有你自己。'
      }),
      () => ({
        title: '把好的东西分出去一点',
        text: '你过得不错。分出去一点——时间、经验、钱，都行。不是为了积德，是因为一个人过得好的时候，最容易忘记别人过得不好；而忘记这件事，会让人慢慢变得不好相处。'
      })
    ]
  },
  {
    bucket: 'health_chronic',
    cond: s => s.flags.includes('chronic'),
    score: () => 58,
    variants: [
      () => ({
        title: '带病生活是一门手艺',
        text: '慢性病不是"治好"或"治不好"的问题，是"怎么一起过"的问题。把吃药、复查、忌口变成像刷牙一样的日常，它就不会一直占据你的注意力。'
      }),
      () => ({
        title: '别把自己当病人',
        text: '你有病，但你不是病人。该做的事照做，该玩的照玩，只是节奏慢一点。人一旦把自己完全当成病人，病就会真的接管生活。'
      })
    ]
  },
  {
    bucket: 'two_kids',
    cond: s => s.flags.includes('two_kids'),
    score: () => 42,
    variants: [
      () => ({
        title: '别让孩子替你分对错',
        text: '两个孩子之间，最伤人的不是偏心，是"你是哥哥/姐姐，你要让着"。让是情分，不是义务。公平不是每次都一样多，是每个孩子都觉得"我妈看见我了"。'
      })
    ]
  },
  {
    bucket: 'single_parent',
    cond: s => s.flags.includes('single_parent'),
    score: () => 56,
    variants: [
      () => ({
        title: '一个人带，也要留一个人给自己',
        text: '你这一局把孩子放在最前面，这没有错。但孩子需要一个"还活着的"大人，不是一个"只剩付出"的大人。每周留半天给自己，这不是自私，是让孩子看见一个人该怎么活。'
      }),
      () => ({
        title: '别替他恨另一个人',
        text: '孩子有权利自己去看、自己去判断。你把你的委屈讲给他听，他就得替你背一半。等他长大了，他会自己明白——但那个明白，得是他自己的。'
      })
    ]
  },
  {
    bucket: 'enough',
    cond: () => true,
    score: (s, sc) => 34 + (sc.wealth > 55 ? 6 : 0),
    variants: [
      () => ({
        title: '关于"够"',
        text: '人这一生最难的不是挣到多少，是知道多少算够。够不是躺平，是给自己划一条线：过了这条线，多出来的部分应该换成别的东西——时间、健康、想做的事。'
      }),
      () => ({
        title: '把"更多"换成"更好"',
        text: '你这一局一直在往前走。往前走没错，但偶尔要停一下问：我现在追的这个东西，是我想要的，还是别人都在要的。'
      })
    ]
  },
  {
    bucket: 'compare',
    cond: () => true,
    score: () => 33,
    variants: [
      () => ({
        title: '比较是偷走快乐的贼',
        text: '你这一局大概有过不少次"我是不是落后了"的念头。比较本身没错，错的是拿自己的里子去比别人面子。真要比，就跟三年前的自己比。'
      }),
      () => ({
        title: '同学会之后的那三天',
        text: '每次见完老同学，人都会有几天不太舒服。这不是你虚荣，是人之常情。给自己定个规矩：见完人可以感慨，但不许因此做重大决定。'
      })
    ]
  },
  {
    bucket: 'refuse',
    cond: () => true,
    score: () => 41,
    variants: [
      () => ({
        title: '学会说不，是成年人的必修课',
        text: '你这一局答应了不少不该答应的事。拒绝不用理由充分，一句"我这次帮不上"就够了。真正的关系经得起拒绝，经不起的，本来也不该留。'
      }),
      () => ({
        title: '先答应自己，再答应别人',
        text: '下次有人开口，先说"我看一下时间"。这五个字能给你留出判断的余地。很多人不是不会拒绝，是来不及想就答应了。'
      })
    ]
  },
  {
    bucket: 'apology',
    cond: () => true,
    score: () => 37,
    variants: [
      () => ({
        title: '道歉要具体',
        text: '"对不起"三个字很轻。真正有用的道歉是：我做错了什么、我给你带来了什么、我打算怎么补。说不出这三样，道歉只是想让对方别再生气。'
      }),
      () => ({
        title: '有些话，晚了也要说',
        text: '你心里可能有一句欠了很久的话。说出来不一定能修复什么，但不说，它会一直在那儿。'
      })
    ]
  },
  {
    bucket: 'money_relation',
    cond: () => true,
    score: () => 39,
    variants: [
      () => ({
        title: '钱和关系，别搅在一起',
        text: '借出去的钱，最好当成送。做不到这一点，就别借。同理，别人帮你的忙，要按"人情"还，不要按"市价"还——这两笔账的算法不一样。'
      }),
      () => ({
        title: '把账算清楚，关系才长久',
        text: '跟熟人合作，最伤感情的不是算得清，是算不清。一开始把分成、责任、退出方式写下来，后面反而能好好做朋友。'
      })
    ]
  },
  {
    bucket: 'parent_talk',
    cond: (s, sc) => s.finalAge >= 45,
    score: () => 43,
    variants: [
      () => ({
        title: '他们的唠叨是倒计时',
        text: '父母重复说同一件事，不是记性差，是他们只会用这一种方式表达在乎。你这一局听了不少。以后不耐烦的时候，想想这句话。'
      }),
      () => ({
        title: '问一次他们年轻时的事',
        text: '你可能从来没问过：他们二十几岁时想做什么、最后为什么没做。问一次，你会重新认识这两个人——也会更明白自己身上那些东西是从哪来的。'
      })
    ]
  },
  {
    bucket: 'kid_score',
    cond: (s, sc) => hasKid(s),
    score: () => 40,
    variants: [
      () => ({
        title: '成绩是孩子的事',
        text: '你可以帮 ta 找方法、找资源、找信心，但不能替 ta 着急。你越急，ta 越觉得这件事是为了你。'
      }),
      () => ({
        title: '别只在他考好的时候夸他',
        text: '孩子会记住你在什么时候看他。如果只有成绩单能让你眼睛亮起来，他就会用一辈子去追那张纸。'
      })
    ]
  },
  {
    bucket: 'friends',
    cond: () => true,
    score: () => 32,
    variants: [
      () => ({
        title: '朋友是养出来的',
        text: '你这一局认识了不少人，真正留下的没几个。这不是你的问题，是所有人的问题。朋友靠的是"反复见面"，不是"常联系"。'
      }),
      () => ({
        title: '主动约一次',
        text: '给一个你想见但很久没见的人发条消息，直接说时间地点。别问"有空吗"——这个问题太难回答了。'
      })
    ]
  },
  {
    bucket: 'sleep',
    cond: () => true,
    score: () => 38,
    variants: [
      () => ({
        title: '睡眠是底层设施',
        text: '你这一局熬夜不少。睡眠不好的人，情绪、判断、耐心都会跟着坏。先把睡觉这一件事修好，很多问题会自己小一圈。'
      }),
      () => ({
        title: '把手机放远一点',
        text: '不用戒手机，只要让它不在床头。这一个动作，比任何助眠方法都管用。'
      })
    ]
  },
  {
    bucket: 'later',
    cond: () => true,
    score: () => 36,
    variants: [
      () => ({
        title: '"以后"是个危险的词',
        text: '你说过很多次"等以后"。以后会有以后的事，它不会自己空出来。想做的那件事，现在就给它一个具体的日期。'
      }),
      () => ({
        title: '把想做的事拆小',
        text: '大事容易拖，小事容易做。把"学一门语言"拆成"每天背五个词"，把"多陪家人"拆成"每周日晚上吃饭"。'
      })
    ]
  },
  {
    bucket: 'face',
    cond: () => true,
    score: () => 31,
    variants: [
      () => ({
        title: '面子是最贵的一件消耗品',
        text: '你这一局为面子付过一些钱、一些时间、一些不该喝的酒。真正在乎你的人，不会因为你没面子就少看你一眼。'
      }),
      () => ({
        title: '允许自己过得普通',
        text: '不是每个人都要活成故事。普通不是失败，是大多数人真实的答案。'
      })
    ]
  },
  {
    bucket: 'regret',
    cond: (s, sc) => sc.happy < 68,
    score: () => 64,
    variants: [
      () => ({
        title: '后悔是有用的',
        text: '后悔不是让你反复难受，是提醒你：有些东西你在乎。把后悔翻译成一个具体的动作——打一个电话、改一个习惯、补一句道歉。'
      }),
      () => ({
        title: '别用"如果当初"惩罚自己',
        text: '你做的每个选择，在当时的信息和状态下，都是合理的。用现在的眼光去审判过去的自己，不公平。'
      })
    ]
  },
  {
    bucket: 'move',
    cond: () => true,
    score: () => 29,
    variants: [
      () => ({
        title: '换地方解决不了所有问题',
        text: '换城市能换掉通勤、天气、熟人，换不掉自己。如果每次都想"换个环境就好了"，先问问：这次要换的到底是环境，还是什么。'
      }),
      () => ({
        title: '留一个能回去的地方',
        text: '不管走多远，留一个能回去的地方——老家的房间、一个朋友的家、一份随时能做的活。有这个，你走得才踏实。'
      })
    ]
  },
  {
    bucket: 'work_meaning',
    cond: () => true,
    score: () => 35,
    variants: [
      () => ({
        title: '工作是手段，不是全部',
        text: '你这一局在工作上花了很多时间。工作是换取生活的手段，不是生活本身。如果一份工作让你没有生活，那它换来的东西，你也没时间用。'
      }),
      () => ({
        title: '找一件"做完会高兴"的事',
        text: '很多工作做完只是"完成了"。找一件做完会让你有点高兴的事，哪怕不挣钱。人需要这种正反馈。'
      })
    ]
  },
  {
    bucket: 'body_signal',
    cond: () => true,
    score: () => 42,
    variants: [
      () => ({
        title: '身体比你诚实',
        text: '你这一局有些时候是靠硬撑过去的。身体不会说谎：睡不着、没胃口、莫名其妙地烦躁，都是在提醒你。别等到它喊出来才听。'
      }),
      () => ({
        title: '疼痛是信号，不是敌人',
        text: '很多人对身体的态度是"忍一忍就过去了"。忍是对的，但要知道自己在忍什么。'
      })
    ]
  },
  {
    bucket: 'lonely',
    cond: (s, sc) => sc.happy < 55 || !hasPartner(s),
    score: () => 52,
    variants: [
      () => ({
        title: '孤独要说出来',
        text: '孤独最麻烦的地方是它让人不想说话。越孤独越不联系，越不联系越孤独。打破这个循环只需要一个动作：主动发一条消息。'
      }),
      () => ({
        title: '找一个"固定见面"的人',
        text: '不用很多。一个每周见一次的人，就能把孤独挡在门外一大半。'
      })
    ]
  },
  {
    bucket: 'forgive',
    cond: () => true,
    score: () => 30,
    variants: [
      () => ({
        title: '原谅不是放过别人',
        text: '原谅是把自己从这件事里放出来。你可以不原谅，也可以不联系，但别让那个人一直住在你脑子里。'
      }),
      () => ({
        title: '先原谅自己',
        text: '你对别人可能挺宽容，对自己很苛刻。那些"我当时怎么那么傻"的事，换个人做，你大概会说"谁都会这样"。'
      })
    ]
  },
  {
    bucket: 'truth',
    cond: () => true,
    score: () => 28,
    variants: [
      () => ({
        title: '真话要挑时候说',
        text: '真话不全说，假话全不说。这不是圆滑，是分寸。同样一句话，饭桌上说和私下说是两件事。'
      }),
      () => ({
        title: '找一个能说真话的人',
        text: '如果一个人都没有，那才是真正的危险。'
      })
    ]
  },
  {
    bucket: 'curious',
    cond: () => true,
    score: () => 27,
    variants: [
      () => ({
        title: '学点没用的东西',
        text: '你这一局学的都是"有用"的。学一样没用的——一门乐器、一种植物、一段历史。它不会帮你升职，但会让你在某个下午觉得活着挺有意思。'
      }),
      () => ({
        title: '保持提问的习惯',
        text: '人变老的标志不是皱纹，是不再问"为什么"。'
      })
    ]
  },
  {
    bucket: 'farewell',
    cond: (s, sc) => s.finalAge >= 60,
    score: () => 49,
    variants: [
      () => ({
        title: '告别要练习',
        text: '年纪越大，告别越多：朋友、同事、亲人、身体的一部分能力。允许自己难过，但别停在难过里。告别之后还有日子要过。'
      }),
      () => ({
        title: '把想说的话早点说',
        text: '你这一局可能有一些话没来得及说。对还在的人，别等了。'
      })
    ]
  },
  {
    bucket: 'growth',
    cond: () => true,
    score: () => 30,
    variants: [
      () => ({
        title: '关于时间',
        text: '你这一生做了很多"应该做"的事。剩下的日子里，每周留半天做一件完全没有产出的事。这不是浪费，这是把时间还给自己。'
      }),
      () => ({
        title: '关于学习',
        text: '好奇心是最不容易老的器官，也是最容易被搁置的。挑一个跟工作无关、你一直想弄明白的东西，每周花两小时。不为有用，为的是八十岁的时候你还有想弄明白的事。'
      }),
      () => ({
        title: '关于记录',
        text: '这一生里你有很多瞬间以为自己会永远记得，后来都忘了。从现在开始，每月写三行字：这个月最重要的一件事、一个人、一个念头。将来某一天，这三行字会比照片贵。'
      })
    ]
  }
]

function composeAdvice(s, sc, adviceBank) {
  const ctx = buildCtx(s)
  const picked = []
  const bucketCount = {}

  const list = ADVICE_RULES.filter(r => {
    try { return r.cond(s, sc) } catch (e) { return false }
  }).sort((a, b) => b.score(s, sc) - a.score(s, sc))

  /* 按 score 加权随机抽，而不是"排序取前三"。
   * 排序取前三会让同一局面永远得到同一组建议；加权随机保留了"更贴切的那条更容易出"，
   * 同时让组合散得开——这是建议能有一万种的前提。 */
  const pool = list.slice()
  while (picked.length < 3 && pool.length) {
    let total = 0
    const ws = pool.map(r => {
      const w = Math.max(1, r.score(s, sc)) / 10
      total += w
      return w
    })
    let r = Math.random() * total
    let idx = 0
    for (; idx < pool.length; idx++) {
      r -= ws[idx]
      if (r <= 0) break
    }
    const rule = pool.splice(Math.min(idx, pool.length - 1), 1)[0]
    if (!rule) break
    // 同一主题最多出一条，避免三条建议都在讲"身体"
    if (bucketCount[rule.bucket]) continue
    const v = pickOne(rule.variants)(ctx)
    if (!v) continue
    if (picked.some(p => p.title === v.title)) continue
    picked.push(v)
    bucketCount[rule.bucket] = 1
  }

  // 保底：不足三条时用旧建议库和通用建议补
  const bankPool = adviceBank
    ? Object.keys(adviceBank).map(k => adviceBank[k]).filter(a => a && a.title && a.text)
    : []
  while (picked.length < 3) {
    const a = bankPool.length ? bankPool[Math.floor(Math.random() * bankPool.length)] : null
    if (a && !picked.some(p => p.title === a.title)) {
      picked.push({ title: a.title, text: a.text })
    } else {
      break
    }
  }

  const generic = [
    { title: '关于时间', text: '每周留半天，做一件完全没有产出的事——散步、发呆、跟人闲聊。这不是浪费，这是把时间还给自己。' },
    { title: '关于关系', text: '能说真话的人，一只手数得过来就够了。数不出三个，就从这周开始主动约人吃饭。关系靠见面，不靠回忆。' },
    { title: '关于身体', text: '每周三次、每次三十分钟的快走，比任何保健品都实在。它唯一的难点是：需要你真的去做。' }
  ]
  let gi = 0
  while (picked.length < 3 && gi < generic.length) {
    if (!picked.some(p => p.title === generic[gi].title)) picked.push(generic[gi])
    gi++
  }

  return picked
}

/* ============================================================ */

return {
  composeEvent,
  composeEnding,
  composeAdvice,
  genderFix
}

})
