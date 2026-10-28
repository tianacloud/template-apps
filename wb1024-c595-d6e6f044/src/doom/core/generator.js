/**
 * core/generator.js —— 末日模拟器 · 生成层
 *
 * 三块能力（与人生模拟器同构）：
 *   composeEvent   —— 模板 × 参数 × 当前局面，现场拼出专属于这一局的事件
 *   composeEnding  —— 结局标题/副题/正文按「终局形态 × 处境」拼装
 *   composeAdvice  —— 建议规则引擎，引用了你真实做过的选择
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DoomGen = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const F = (s, f) => (s.flags || []).indexOf(f) >= 0

/* ============================================================
 *  一、事件模板
 * ============================================================ */

const PLACES = ['楼下的车库', '原来常去的那家面馆', '城西的加油站', '一个小区的门卫室', '河边那条路', '废弃的公交场站', '隔壁那栋还没塌的楼', '菜市场后面的巷子']
const GOODS = ['一小袋米', '两瓶水', '一盒退烧药', '半瓶酒精', '一件厚外套', '几根蜡烛', '一把还能用的螺丝刀', '一罐花生酱', '一块肥皂', '一卷电线']
const PERSONS = ['一个不爱说话的男人', '一个总在笑的年轻女人', '一个看起来比实际年龄老的中年人', '一个背着布包的老人', '一对结伴的兄弟', '一个拖着行李的姑娘', '一个自称以前开出租的男人', '一个总在咳嗽的中年女人']

const TEMPLATES = [
  /* ---- 1. 有人在你这儿落下东西 ---- */
  {
    id: 'g_lost',
    stages: [2, 3, 4, 5, 6, 7],
    build(s, ctx) {
      const place = pick(PLACES)
      const good = pick(GOODS)
      const who = pick(PERSONS)
      return {
        title: '落下的东西',
        scene: `${who}在你这儿待了半个下午。走的时候把${good}落下了，可能是忘了，也可能是留下的。你已经很久没见到有人这样。`,
        optPanels: [
          ['收起来，就当他忘了', '追出去还给他', '留着，等他回来找'],
          ['自己留下', '跑出去还给他', '先放着'],
          ['留下，反正他也用不上', '还回去', '放在门口显眼的地方'],
        ],
        options: [
          {
            text: '收起来，就当他忘了',
            effects: { supply: 4, morale: -3 },
            result: `你把${good}收进了柜子。之后你偶尔会想他是不是故意的。这个念头让你在很长一段时间里，对人多留了一点心。`
          },
          {
            text: '追出去还给他',
            effects: { morale: 8, camp: 2 },
            result: `你追了半条街。他愣了一下，接过去，说了句「你这人真行」。你们后来成了会互相敲门的那种关系——这世道里，这种关系比东西贵。`,
            flags: ['met_kind_stranger']
          },
          {
            text: '留着，等他回来找',
            effects: { morale: 2, camp: 2 },
            result: `你把${good}放在门边的架子上。他第三天真的回来了，看见东西还在，站在那儿笑了一下。你们没说几句话，但都记住了这件事。`
          }
        ]
      }
    }
  },

  /* ---- 2. 关于要不要开枪 ---- */
  {
    id: 'g_gun',
    stages: [4, 5, 6, 7],
    build(s, ctx) {
      const place = pick(PLACES)
      return {
        title: '要不要用',
        scene: `你在${place}发现了一个人正在翻你们家的外窗。他听见你的脚步，转过身来。他手里没有东西。你有。你有三秒钟决定这件事的性质。`,
        optPanels: [
          ['举着，让他滚', '放下枪，问他干什么', '先按住他再说'],
          ['用枪指着他', '放下来问话', '直接压住'],
          ['拿枪把人逼走', '收起来，先问', '先控制住'],
        ],
        options: [
          {
            text: '举着，让他滚',
            effects: { camp: 4, morale: -4 },
            resolve: (s, rng) => {
              if (rng() < 0.75) return { text: '他举着手一步步退走了，退到街角才转身跑。你放下枪，发现手心全是汗。这天你什么都没丢，但你开始明白手里这个东西的真正用途。', tone: 'neutral', flags: ['armed'] }
              return { text: '他没有退。他扑过来，你们在窗下扭成一团。枪响了，打在了墙上。邻居的灯亮了三家。最后他跑了，你坐在窗下喘了很久。', tone: 'bad', effects: { health: -8 }, flags: ['armed', 'gun_fired'] }
            }
          },
          {
            text: '放下枪，问他干什么',
            effects: { morale: 6, camp: 2 },
            resolve: (s, rng) => {
              if (rng() < 0.55) return { text: '他说他在找他女儿，说前面那栋楼里有个孩子一直在哭。你们一起过去看了，什么也没有。他蹲在地上，很久没起来。你给了他一瓶水。', tone: 'good', effects: { met_kind_stranger: true }, flags: ['met_kind_stranger'] }
              return { text: '你刚把枪放下，他就冲上来推了你一把，跑了。你追出去的时候他已经翻过了两道墙。你没损失什么，但你知道了：在这世道里，先放下枪是要付学费的。', tone: 'bad', effects: { morale: -4 } }
            }
          },
          {
            text: '先按住他再说',
            effects: { health: -4, morale: -2, camp: 5 },
            result: '你把他按在墙上，膝盖压着他的后背。他没有反抗，只是说「我错了，我错了」。你在他身上摸出一把折叠刀。你放他走了，留下刀。这把刀后来你一直带着。',
            flags: ['armed']
          }
        ]
      }
    }
  },

  /* ---- 3. 冬天的选择 ---- */
  {
    id: 'g_fuel',
    stages: [3, 5, 6],
    build(s, ctx) {
      const place = pick(PLACES)
      const days = 3 + Math.floor(Math.random() * 5)
      return {
        title: '柴不够了',
        scene: `柴还够 ${days} 天。气象要说的话你也听不出来，只知道外面越来越冷。${place}那边有一堆拆下来的木料，但要走四十分钟，来回一趟搬不了多少。`,
        optPanels: [
          ['一趟一趟地搬', '拆自己家的东西烧', '去跟人换'],
          ['多跑几趟', '先拆家具', '找人换'],
          ['去搬，能搬多少搬多少', '烧家具', '换点柴'],
        ],
        options: [
          {
            text: '一趟一趟地搬',
            effects: { health: -10, supply: 2, camp: 4 },
            resolve: (s, rng) => {
              if (rng() < 0.6) return { text: '你来回跑了五趟，最后一趟天已经黑了，你差点在雪里走岔路。柴堆起来的时候，你觉得这些木头比什么罐头都好看。', tone: 'good', effects: { camp: 6, morale: 4 } }
              return { text: '第三趟的时候你被人截了。他们没打你，只是把柴拿走了，还留下一句「谢了兄弟」。你空手走回来，路上什么都没想。', tone: 'bad', effects: { morale: -6 } }
            }
          },
          {
            text: '拆自己家的东西烧',
            effects: { supply: -2, camp: -8, health: 6, morale: -2 },
            result: '你把床板拆了一半，把书架劈了。屋子里的样子变了，你自己也不习惯。但那天晚上屋里有了热乎气，所有人都睡得比前几天沉。',
            flags: ['burned_furniture']
          },
          {
            text: '去跟人换',
            effects: { supply: -8, camp: 3, health: 3 },
            result: '你用八天的口粮换了两捆柴和一堆旧报纸。换的时候你算了半天，觉得不划算，但没有更好的办法。这个冬天你学到的最大一课是：冷是要花东西买的。'
          }
        ]
      }
    }
  },

  /* ---- 4. 一个人的踪迹 ---- */
  {
    id: 'g_tracks',
    stages: [3, 4, 5, 6, 7],
    build(s, ctx) {
      const place = pick(PLACES)
      return {
        title: '雪地里的脚印',
        scene: `${place}有一串新脚印，绕着你这一带走了半圈。不是朝你来的，也不是走远——像是在数什么。脚印到路口就断了。`,
        optPanels: [
          ['顺着脚印跟上去', '加强门，装作没看见', '先去通知其他几户'],
          ['跟上去看看', '加固门，等', '通知邻居'],
          ['追过去', '先把自己家门钉牢', '叫上人一起看看'],
        ],
        options: [
          {
            text: '顺着脚印跟上去',
            effects: { health: -6, morale: 2 },
            resolve: (s, rng) => {
              if (rng() < 0.5) return { text: '脚印通向一栋空楼的门洞，里面有人住过，已经走了。地上有半张地图，用铅笔画了三个圈，其中一个圈的位置就是你们这栋楼。你把地图带回来了。', tone: 'neutral', effects: { camp: 6 }, flags: ['knows_gangs'] }
              return { text: '你跟到了一个路口，忽然发现自己被两个人从两侧堵住了。他们问了你三个问题：几个人、有几杆枪、晚上谁看着。你说了一个谎。他们放你走了。', tone: 'bad', effects: { morale: -4 }, flags: ['knows_gangs'] }
            }
          },
          {
            text: '加强门，装作没看见',
            effects: { camp: 8, morale: -3, supply: -2 },
            result: '你把门又加了一层，用两根木头顶住。这几天你连白天都不怎么出门。第七天晚上，别的楼被清了。你听着声音很近，一直没有出去。',
            flags: ['closed_door']
          },
          {
            text: '先去通知其他几户',
            effects: { camp: 9, morale: 5 },
            result: '你挨家敲门，把脚印的事说了一遍。有人笑你多心。三天后他们不笑了——那一晚你们七户人家一起守着，什么也没发生。这世道有时候就是这样：它试过一次，发现不好下手，就去别处了。',
            flags: ['neighbors_org', 'watch_system']
          }
        ]
      }
    }
  },

  /* ---- 5. 关于干净 ---- */
  {
    id: 'g_clean',
    stages: [4, 5, 6, 7],
    build(s, ctx) {
      return {
        title: '还洗不洗澡',
        scene: '水越来越金贵。你已经四天没正经洗过脸，头发硬成一片。今天你忽然从一个旧箱子里翻出一块肥皂，还有半瓶洗发水。',
        optPanels: [
          ['洗澡，就今天', '省着水，不洗', '把水留给喝'],
          ['好好洗一次', '不洗了', '留着水'],
          ['今天就奢侈一回', '忍着', '水比干净重要'],
        ],
        options: [
          {
            text: '洗澡，就今天',
            effects: { supply: -3, morale: 12, health: 3 },
            result: '你烧了一盆水，从头到脚洗了一遍。洗完你坐在那盆脏水旁边，忽然有点想哭。不是因为难过，是因为你想起自己原来是个每天洗澡的人。',
            flags: ['kept_clean']
          },
          {
            text: '省着水，不洗',
            effects: { morale: -4, health: -2 },
            result: '你把肥皂放回箱子里，说以后再用。这个「以后」你想了一下，没想出是哪天。你身上的味道自己早就闻不出来了，别人闻得出来。'
          },
          {
            text: '把水留给喝',
            effects: { supply: 2, morale: 2 },
            result: '你把那块肥皂收好，把水存了起来。洗手的时候你只湿一下手指。活着这件事，有时候就是不断地把「想要」换成「需要」。'
          }
        ]
      }
    }
  },

  /* ---- 6. 有人死了，东西怎么办 ---- */
  {
    id: 'g_inherit',
    stages: [4, 5, 6, 7],
    build(s, ctx) {
      const who = pick(['隔壁那户的老人', '一起干过活的那个人', '楼下那个总咳嗽的女人', '一个你不熟的邻居'])
      return {
        title: '东西归谁',
        scene: `${who}死了。没有留下话。他的屋子里有一批东西：粮食、工具、两床被子。他有一个儿子在城外，谁也不知道还活着没有。`,
        optPanels: [
          ['先分了，活着的人要用', '留一半，等他儿子', '一起封起来，谁也别动'],
          ['分了', '留一半', '封起来'],
          ['拿去用', '留着等他家人', '大家商量'],
        ],
        options: [
          {
            text: '先分了，活着的人要用',
            effects: { supply: 8, morale: -5, camp: 3 },
            result: '你们把东西分了。分的时候没人说话，动作都很快，像怕被人看见。你分到两袋米和一床被子。那床被子你盖了三个冬天，每天晚上都会想起它原来是谁的。',
            flags: ['divided_dead']
          },
          {
            text: '留一半，等他儿子',
            effects: { supply: 4, morale: 6, camp: 2 },
            result: '你们分了一半，另一半原样封在他屋子里。半年后他儿子真的回来了，站在门口看了很久。你们把剩下的一半交给他，他跪下来哭。这一幕你后来跟很多人讲过。',
            flags: ['kept_faith']
          },
          {
            text: '一起封起来，谁也别动',
            effects: { morale: 4, supply: -2 },
            result: '你们用木板把门钉上了。这屋子后来一直没人动。冬天最难的时候有人提过一次，被人骂了。这地方从此多了一间空屋子，也多了点别的东西。'
          }
        ]
      }
    }
  },

  /* ---- 7. 音乐 ---- */
  {
    id: 'g_music',
    stages: [4, 5, 6, 7],
    build(s, ctx) {
      return {
        title: '还能响的东西',
        scene: '有人从烧过的房子里翻出一把吉他，弦断了两根。也有人找到了一个还能响的口琴。晚上大家围着火，谁都不好意思先动。',
        optPanels: [
          ['自己先来一段', '让别人弹', '把东西收起来'],
          ['弹一段', '推给别人', '收着吧'],
          ['我先来', '看看谁会', '留着以后'],
        ],
        options: [
          {
            text: '自己先来一段',
            effects: { morale: 12, camp: 3 },
            result: '你弹得很差，第二段就跑调了。但是有人跟着哼，有人笑。那天晚上你们说话的声音比平时大，睡得也比平时晚。第二天所有人干活都轻快了一点。',
            flags: ['music', 'laughed']
          },
          {
            text: '让别人弹',
            effects: { morale: 8, camp: 2 },
            result: '那个平时最不爱说话的年轻人接了过去，弹得居然很好。你们都听愣了。他说他学过六年。那天之后他在这个院子里的位置变了。',
            flags: ['music']
          },
          {
            text: '把东西收起来',
            effects: { morale: -2 },
            result: '你说「现在不是时候」。屋里安静下来。那把吉他后来被塞在了床底下，弦还是断的。有的时候你半夜会想起那个晚上，觉得当时应该说「来一段」。'
          }
        ]
      }
    }
  },

  /* ---- 8. 水 ---- */
  {
    id: 'g_water_src',
    stages: [3, 4, 5, 6, 7],
    build(s, ctx) {
      return {
        title: '发现一个水源',
        scene: '你在半公里外发现一个还在出水的消防栓，水是干净的。问题在于：这一带的人都会来这儿打水，来的人多了，就会有人想占住它。',
        optPanels: [
          ['自己去打，不说出去', '告诉所有人', '组织人守起来'],
          ['悄悄用', '告诉大家', '占住它'],
          ['自己打，不声张', '说出去，大家一起用', '带人守'],
        ],
        options: [
          {
            text: '自己去打，不说出去',
            effects: { supply: 8, morale: -2 },
            result: '你半夜去打水，来回三趟。水桶装满之后你走得很慢。这条路只有你知道——你希望它一直是只有你知道。',
            flags: ['secret_water']
          },
          {
            text: '告诉所有人',
            effects: { supply: 4, morale: 10, camp: 6, people: 2 },
            result: '你在楼道里喊了一声。那天下午来了二十几个人打水，排了队，没人抢。有人问这是谁发现的，别人指了指你。你在那天成了「那个找到水的人」。',
            flags: ['shared_water', 'reputation']
          },
          {
            text: '组织人守起来',
            effects: { supply: 10, camp: 8, morale: 4, health: -4 },
            result: '你带了四个人，用木板搭了个简易的围子，定了规矩：本楼的人随便打，外面的人拿东西换。这个规矩后来维持了两年，一直到水管彻底干了。',
            flags: ['controlled_water', 'set_rules']
          }
        ]
      }
    }
  },

  /* ---- 9. 旧照片 ---- */
  {
    id: 'g_photo',
    stages: [3, 4, 5, 6, 7],
    build(s, ctx) {
      return {
        title: '一张照片',
        scene: '你在一个抽屉里翻到一张全家福。照片上的人穿得整整齐齐，站在一棵树下笑着。你不认识他们，但你在那儿看了一会儿。',
        optPanels: [
          ['收进包里', '放回去', '带回去给人看'],
          ['带走', '放回去', '拿回去给大家看'],
          ['收着', '原样放回', '带回去'],
        ],
        options: [
          {
            text: '收进包里',
            effects: { morale: 6 },
            result: '你把照片放进了内袋，跟自己的证件放在一起。这两样东西都没什么用了，但你都不肯扔。有时候半夜你会拿出来看一眼——看别人的幸福，也看自己还记得「全家福」是什么。',
            flags: ['keeps_photo']
          },
          {
            text: '放回去',
            effects: { morale: 2 },
            result: '你把照片放回抽屉，还把抽屉推严了一点。你不是不想要，你是觉得有些东西被带走就没有了——别人家的事，还是留在别人家。'
          },
          {
            text: '带回去给人看',
            effects: { morale: 8, camp: 3 },
            result: '你把照片带回去，大家围着看，忽然开始聊各自的家人。有人讲了一个很长的故事，讲到最后哭了。那天晚上你们聊到很晚，说了很多封城之前的事。',
            flags: ['laughed']
          }
        ]
      }
    }
  }
]

/* ============================================================
 *  二、composeEvent
 * ============================================================ */

function composeEvent(s, ctx) {
  const pool = TEMPLATES.filter(t => t.stages.indexOf(s.stage) >= 0 && !ctx.usedTpls.has(t.id))
  if (!pool.length) return null
  const tpl = pick(pool)
  ctx.usedTpls.add(tpl.id)
  const built = tpl.build(s, ctx)
  if (!built) return null
  return Object.assign({}, built, {
    id: 'gen_' + tpl.id + '_' + Math.floor(Math.random() * 9999),
    stage: s.stage,
    day: Math.max(1, s.day + 3 + Math.floor(Math.random() * 20)),
    order: 90,
    gen: true
  })
}

/* ============================================================
 *  三、composeEnding
 * ============================================================ */

function composeEnding(s, sc, base, plight) {
  const title = base.title
  const subtitle = `活到第 ${sc.days} 天`

  let desc = base.desc + ' ' + plight.line

  // 回扣真实选择：一局只回扣一次，按 base.id 哈希稳定
  let h = 0
  const key = base.id + '|' + plight.id
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0x7fffffff
  const turns = (s.log || []).filter(l => l.kind === 'choice' && l.text && l.text.length > 36)
  if (turns.length >= 3) {
    const l = turns[h % turns.length]
    const tails = [
      `你还记得第 ${l.day} 天那件事——「${l.title}」。那时候你以为那只是一个平常的决定。`,
      `第 ${l.day} 天，「${l.title}」这一题你选了「${l.choice}」。现在你已经知道这一笔在整本账里有多重。`,
      `如果要从这四年里挑一个转折点，大概是第 ${l.day} 天那次「${l.title}」。`,
      `第 ${l.day} 天之后，很多事情就不一样了。那天的事叫「${l.title}」。`
    ]
    desc += ' ' + tails[h % tails.length]
  }

  return { title, subtitle, desc, base: base.id }
}

/* ============================================================
 *  四、composeAdvice
 * ============================================================ */

function composeAdvice(s, sc, ADVICE) {
  const picked = []
  const score = a => {
    if (a === ADVICE.supplyLow) return 100 - sc.supply + 20
    if (a === ADVICE.moraleLow) return 100 - sc.morale + 18
    if (a === ADVICE.campLow) return 100 - sc.camp + 16
    if (a === ADVICE.alone) return sc.people <= 1 ? 90 : 0
    if (a === ADVICE.tooKind) return 70
    if (a === ADVICE.tooHard) return 65
    if (a === ADVICE.partner) return 40
    return 30
  }

  const keys = ['supplyLow', 'moraleLow', 'campLow', 'alone', 'tooKind', 'tooHard', 'partner']
  const list = keys
    .map(k => ADVICE[k])
    .filter(a => { try { return !!a.cond(s) } catch (e) { return false } })
    .map(a => ({ a, w: score(a) }))
    .sort((x, y) => y.w - x.w)

  list.forEach(({ a }) => {
    if (picked.length >= 3) return
    if (picked.some(p => p.title === a.title)) return
    picked.push({ title: a.title, text: a.text })
  })

  const fb = ADVICE.fallback || []
  let i = 0
  while (picked.length < 3 && i < fb.length) {
    if (!picked.some(p => p.title === fb[i].title)) picked.push(fb[i])
    i++
  }
  return picked
}

return { composeEvent, composeEnding, composeAdvice }

})
