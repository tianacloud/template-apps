/**
 * core/generator.js —— 办公室模拟器 · 生成层
 *
 * 1. composeEvent：开局按公司、岗位、领导，现场拼几条「只属于这一局」的事件
 * 2. composeEnding：把「走向」和「最后那一幕」缝成一篇能读的结局
 * 3. composeAdvice：按这一局最痛的地方给三条建议
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.OfficeGen = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const pick = a => a[Math.floor(Math.random() * a.length)]
  const F = (s, f) => s.flags.includes(f)

  /* 同一局里不重复用同一个模板 / 同一个人 */
  function pickFresh(arr, used) {
    const pool = arr.filter(x => !used.has(x))
    if (!pool.length) return null
    const v = pick(pool)
    used.add(v)
    return v
  }

  /* ============================================================
   *  一、生成式事件
   * ============================================================ */

  const COLLEAGUES = ['小陈', '小王', '老李', '小周', '阿May', '老赵', '小林', '大刘', '小唐', '老孙']
  const PROJECTS = ['年度方案', '客户系统', '新品上市', '数据迁移', '渠道复盘', '预算表', '供应商评估']
  const LEADS = ['你的组长', '部门经理', '新来的总监', '分管副总']

  const TEMPLATES = [
    /* 1. 临下班被加活 */
    {
      id: 'g_eod',
      make(v) {
        return {
          title: '下班前十分钟',
          scene: `五点五十，${v.lead}走过来，把一份${v.project}的材料放你桌上，说明天上午要用，「你辛苦一下」。他说话的时候已经转身走了。`,
          options: [
            {
              text: '接下来，做到能交',
              effects: { rep: 5, skill: 2, mind: -6 },
              result: `你做到十点。第二天他看了两页，说「可以」。你把文件发过去，发现他连附件都没打开。`
            },
            {
              text: '问他：哪些是必须的，能不能砍一半',
              effects: { skill: 4, rep: 2, mind: -2 },
              result: `他停下来想了一下，划掉了两页。你做到八点。你发现他不是不能商量，是从来没被问过。`
            },
            {
              text: '说今天有安排，明早七点前给',
              effects: { rep: 2, mind: 3 },
              result: `他皱了一下眉，说「行吧」。你按自己的节奏做完，第二天七点发过去。他没说什么。`
            }
          ]
        }
      }
    },
    /* 2. 跨部门扯皮 */
    {
      id: 'g_cross',
      make(v) {
        return {
          title: '这事不归我们',
          scene: `你和${v.who}在群里对了十几条消息。他说这块应该你们做，你说流程上写的是他们。最后他把三个月前的一份会议纪要截图发了出来。`,
          options: [
            {
              text: '拉个会，把边界定清楚',
              effects: { skill: 5, rep: 3, mind: -4 },
              result: `你拉了三方开会，在白板上画了一遍流程。会开了一个半小时，最后定下来的东西跟你最初说的一样。`
            },
            {
              text: '先做了，别耽误事',
              effects: { rep: 4, skill: 2, mind: -5 },
              result: `你做了。事情过去了，但下次同样的活还是找你。你发现自己用一次妥协，买了一个长期的义务。`
            },
            {
              text: '把问题升级给各自的领导',
              effects: { rep: -2, skill: 2, mind: 1 },
              result: `两个领导通了电话，五分钟定完。你省了力气，也被贴上了「搞不定事」的标签。`
            }
          ]
        }
      }
    },
    /* 3. 饭局 */
    {
      id: 'g_dinner',
      make(v) {
        return {
          title: '一顿饭',
          scene: `${v.lead}让你晚上一起陪${v.who}吃饭，说「就是随便聊聊」。到了才发现订的是包间，桌上已经摆好了酒。`,
          options: [
            {
              text: '全程配合，把场面撑住',
              effects: { rep: 6, mind: -6, money: 0.3 },
              result: `你敬了三轮，替领导挡了两杯。散场时对方拍着你的肩说「这小伙子不错」。领导在旁边笑。`
            },
            {
              text: '少喝，多听，多记',
              effects: { skill: 4, rep: 3, mind: -2 },
              result: `你记下了对方提到的两个痛点和一个时间点。第二天你把这两条整理给领导，他看完说「你挺细」。`
            },
            {
              text: '找理由早走',
              effects: { rep: -4, mind: 4 },
              result: `你说家里有事，八点半就走了。第二天领导没提这事，但下次陪客户的名单里没有你。`
            }
          ]
        }
      }
    },
    /* 4. 汇报前的意外 */
    {
      id: 'g_before_report',
      make(v) {
        return {
          title: '汇报前一小时',
          scene: `还有一小时汇报，${v.who}告诉你${v.project}的一个关键数字变了。PPT 上所有结论都要重算。`,
          options: [
            {
              text: '立刻重算，改完再上',
              effects: { skill: 5, rep: 3, mind: -5 },
              result: `你用了四十分钟重做了一遍。汇报时数字是对的，但有一页逻辑没接上，被问住了。`
            },
            {
              text: '先照原稿讲，会上说明口径',
              effects: { rep: 3, skill: 3, mind: -3 },
              result: `你在开场说「这个数据截至昨天，今天有更新，我补充一句」。领导点了下头。你把危机变成了一个显得严谨的动作。`
            },
            {
              text: '推迟汇报',
              effects: { rep: -4, mind: 2 },
              result: `你申请推迟到下午。领导同意了，但会上说了一句「准备要提前」。你记住了这句话。`
            }
          ]
        }
      }
    },
    /* 5. 前同事的消息 */
    {
      id: 'g_old_colleague',
      make(v) {
        return {
          title: '一条消息',
          scene: `${v.who}发来消息，说他们那边在招人，问你有没有兴趣。他补了一句：「不着急，你先看看。」`,
          options: [
            {
              text: '要 JD 看看，先了解行情',
              effects: { skill: 3, mind: 3 },
              result: `你看了 JD，发现有一半要求你没做过。你也发现自己的工资比市场价低了两成。`,
              flags: ['knows_market']
            },
            {
              text: '让他内推，认真面一次',
              effects: { skill: 4, mind: 4, rep: -1 },
              result: `你请了半天假去面试。不管成不成，你都需要知道自己在外面值多少钱。`,
              flags: ['has_referral']
            },
            {
              text: '谢谢，暂时不动',
              effects: { mind: 1, rep: 1 },
              result: `你回了「暂时不考虑」。关掉对话框，你继续改那份明天要交的表。`
            }
          ]
        }
      }
    },
    /* 6. 家里的冲突 */
    {
      id: 'g_family_conflict',
      make(v) {
        return {
          title: '同一天',
          scene: `同一天，公司要你出差，家里也有一件走不开的事。${v.who}在电话里说「你自己看着办」。`,
          options: [
            {
              text: '去出差，家里的事往后放',
              effects: { rep: 4, money: 0.5, mind: -8 },
              result: `你去了。回来之后家里的气氛冷了一个月。你在心里记着这件事，但也没别的办法。`,
              flags: ['family_neglect']
            },
            {
              text: '跟公司说家里有事，换人去',
              effects: { rep: -3, mind: 5 },
              result: `领导有点不高兴，但换人了。你处理完家里的事，回到公司发现那个项目已经不需要你了。`
            },
            {
              text: '两头跑，压缩时间',
              effects: { rep: 2, mind: -10, money: -0.5 },
              result: `你早上飞过去，晚上飞回来。两天睡了六个小时。事情都办了，但你在地铁上坐着坐着就睡着了。`
            }
          ]
        }
      }
    },
    /* 7. 匿名反馈 */
    {
      id: 'g_survey',
      make(v) {
        return {
          title: '匿名问卷',
          scene: `公司发了一份匿名问卷，问你对团队、对领导、对公司的看法。开头写着「结果只用于改进管理」。`,
          options: [
            {
              text: '认真填，把问题写清楚',
              effects: { skill: 2, rep: 1, mind: -3 },
              result: `你写了不少。一个月后公司发了一份总结，说「整体满意度良好」。你写的东西一条都没出现。`
            },
            {
              text: '全部选中间项',
              effects: { mind: 3, rep: 1 },
              result: `你用了三分钟填完。这份问卷后来被统计成一个漂亮的饼图，放在了年会的 PPT 上。`
            },
            {
              text: '不填',
              effects: { mind: 2, rep: -1 },
              result: `你关掉了页面。HR 在群里催了两次，你还是没填。`
            }
          ]
        }
      }
    },
    /* 8. 一次被看见的机会 */
    {
      id: 'g_spotlight',
      make(v) {
        return {
          title: '被看见',
          scene: `${v.lead}临时有事，让你替他参加一个会，会上要汇报你们组的${v.project}。你手上只有他昨晚发的一份草稿。`,
          options: [
            {
              text: '连夜补齐，讲成自己的',
              effects: { skill: 6, rep: 5, mind: -5 },
              result: `你补到凌晨两点。第二天讲得比预想的好，老板问了两个问题你都答上来了。散会后他问旁边的人：「这是谁？」`
            },
            {
              text: '照草稿讲，不冒险',
              effects: { rep: 2, skill: 1, mind: 1 },
              result: `你照着念完了。没人提问。你回到工位，觉得错过了一次什么，但说不清是什么。`
            },
            {
              text: '讲之前先说明这是替人来的',
              effects: { rep: 3, mind: 2 },
              result: `你开场就说「这个方案主要是 X 做的，我补充几点」。老板点了下头。你既没抢功，也没白来。`
            }
          ]
        }
      }
    }
  ]

  function composeEvent(s, ctx) {
    const usedTpls = ctx.usedTpls || new Set()
    const usedPersons = ctx.usedPersons || new Set()
    const tpl = pickFresh(TEMPLATES.map(t => t.id), usedTpls)
    if (!tpl) return null
    const t = TEMPLATES.find(x => x.id === tpl)
    if (!t) return null

    const who = pickFresh(COLLEAGUES, usedPersons) || '一个同事'
    const v = {
      who: who,
      lead: pick(LEADS),
      project: pick(PROJECTS)
    }
    const built = t.make(v)

    // 生成的事件不固定阶段：按当前局面挑一个还没走完的阶段
    const stages = [2, 3, 4, 5, 6]
    const stage = pick(stages)
    const span = { 2: [4, 12], 3: [13, 72], 4: [73, 132], 5: [133, 216], 6: [217, 288] }[stage]
    const month = span[0] + Math.floor(Math.random() * (span[1] - span[0] + 1))

    return {
      id: 'ged_' + tpl + '_' + Math.floor(Math.random() * 9999),
      stage: stage,
      month: month,
      title: built.title,
      scene: built.scene,
      options: built.options,
      generated: true
    }
  }

  /* ============================================================
   *  二、结局
   * ============================================================ */

  const CLOSING = {
    high: [
      '你走的时候，办公室的灯还亮着。这盏灯后来还会亮很多年，只是跟你没关系了。',
      '你把工牌放在桌上，没有回头。外面的天很好，你好久没在这个点看过天。',
      '后来有人问起你在这家公司做了什么，你想了想，说：做了一些事，也做了一些人让我做的事。',
      '你终于不用再解释自己为什么这么做。这个自由，你等了很久。',
      '最后一封邮件你写了两行，删了三次，最后只留下一句「谢谢，再见」。',
      '你在这栋楼里待了很多年。走的时候，保安还是那个保安，他问你明天还来吗。'
    ],
    mid: [
      '你偶尔会想起那些加班到很晚的晚上。那时候你觉得只要再撑一撑，就会不一样。',
      '你没有什么可后悔的，也没有什么可炫耀的。这两种感觉加在一起，就是大多数人的职场。',
      '你把那些年的周报、方案、会议纪要都删了。删完发现，真正留下来的东西不在电脑里。',
      '有人问你后不后悔。你说不知道，但如果重来一次，有些会你还是会去开，有些话你还是不会说。',
      '你走出写字楼，回头看了一眼那排亮着的窗户。每一扇后面都有一个人，正在做你做过的事。',
      '你在这家公司学会了很多，其中最重要的一条是：公司不会记得你，但你会记得自己。'
    ],
    low: [
      '你没有等到那个「明年就好了」。后来你才明白，那句话本来就不是给你准备的。',
      '你走的时候，桌上还剩半杯没喝完的水。保洁第二天早上把它倒掉了。',
      '你在这栋楼里耗了很多年，最后连一张像样的合影都没有。',
      '你后来很少提起这段经历。不是因为它不重要，是因为它太重要了，说出来会显得你在怪谁。',
      '你终于承认了一件事：有些地方，不是你不努力，是它根本不需要你努力。',
      '你最后看了一眼工位。那个位置第二天就有人坐下了，坐得比你还直。'
    ]
  }

  const RECALL_HEAD = [
    c => `${c.month} 个月的时候，你在「${c.title}」里选了「${c.choice}」。`,
    c => `你大概忘了「${c.title}」那一次。你选的是「${c.choice}」。`,
    c => `「${c.title}」——你给的那个答案是「${c.choice}」。`,
    c => `回头看，「${c.title}」是一次分岔。你走了「${c.choice}」那条。`,
    c => `那一天你在「${c.title}」前面停了一会儿，最后选了「${c.choice}」。`,
    c => `「${c.title}」这道题，你的答案是「${c.choice}」。`
  ]

  const RECALL_TAIL = {
    up: [
      '这个选择当时看不出什么，后来才知道它一直在替你加分。',
      '那一步不算大，但它把你送到了现在这里。',
      '你后来遇到的很多事，都要从这一句开始算。',
      '它没有立刻改变什么，只是把路悄悄挪了一个方向。'
    ],
    down: [
      '这个选择当时看着不痛，账是很多年后才寄到的。',
      '你后来有几次想起这一天，想把那个答案改掉。',
      '那一步不算错，只是从那天起，有些门慢慢关上了。',
      '它没有毁掉什么，只是让你多绕了几年。'
    ],
    flat: [
      '它没有对错，只是把你和另一些人分开了。',
      '这件事小到你当时不觉得是选择。它偏是。',
      '你说不清它是好是坏。它只是发生了，然后你就成了现在这个人。',
      '那天之后的日子看着和从前一样，其实不一样了。'
    ]
  }

  function recallOf(s) {
    const choices = (s.log || []).filter(l => l.kind === 'choice' && l.choice && l.title)
    if (!choices.length) return null
    const c = pick(choices)
    const shown = String(c.choice).replace(/[「」"]/g, '')
    const d = (c.dm || 0) + (c.dh || 0)
    const key = d > 4 ? 'up' : d < -4 ? 'down' : 'flat'
    return {
      text: pick(RECALL_HEAD)({ month: c.month || c.age || 0, title: c.title, choice: shown }) + pick(RECALL_TAIL[key]),
      title: c.title,
      choice: shown
    }
  }

  function composeEnding(s, sc, base, scene) {
    const level = sc.total >= 66 ? 'high' : sc.total >= 40 ? 'mid' : 'low'
    const recall = recallOf(s)
    return {
      title: base.title,
      tag: level === 'high' ? '这一局，你算是走出来了' : level === 'mid' ? '这一局，普普通通' : '这一局，不太体面',
      desc: base.desc,
      scene: scene.text,
      recall: recall,
      closing: pick(CLOSING[level]),
      _base: base.id,
      _scene: scene.id
    }
  }

  /* ============================================================
   *  三、建议
   * ============================================================ */

  const GENERIC = [
    {
      title: '关于离开',
      text: '离开一家公司的理由，最好是「我要去一个更好的地方」，而不是「我受不了这里」。前者会带你往前走，后者只会让你换个地方继续受不了。'
    },
    {
      title: '关于关系',
      text: '职场里能帮你的人，往往不是最亲近的，是记得你做过什么的人。每隔一段时间，让一个不在你团队里的人知道你在做什么。'
    },
    {
      title: '关于身体',
      text: '你现在熬的每一次夜，都会在十年后的体检报告上出现。这不是吓唬你，是账单。'
    }
  ]

  function composeAdvice(s, sc, bank) {
    const list = []
    Object.keys(bank || {}).forEach(k => {
      const a = bank[k]
      if (!a) return
      let ok = true
      try { ok = a.cond(s) } catch (e) { ok = false }
      if (!ok) return
      let score = 30
      if (k === 'moneyLow') score = 100 - sc.wealth
      else if (k === 'mindLow') score = 100 - sc.mind
      else if (k === 'skillLow') score = 100 - sc.skill
      else if (k === 'repLow') score = 100 - sc.rank
      else if (k === 'quit' || k === 'exit') score = 78
      else if (k === 'grind') score = 66
      else if (k === 'loyal') score = 60
      else if (k === 'family') score = 72
      list.push({ a, score })
    })
    list.sort((x, y) => y.score - x.score)
    const out = []
    for (const it of list) {
      if (out.length >= 3) break
      if (out.some(o => o.title === it.a.title)) continue
      out.push({ title: it.a.title, text: it.a.text })
    }
    let i = 0
    while (out.length < 3 && i < GENERIC.length) {
      if (!out.some(o => o.title === GENERIC[i].title)) out.push(GENERIC[i])
      i++
    }
    return out
  }

  return { composeEvent, composeEnding, composeAdvice }
})
