/**
 * core/events-solo.js —— 末日模拟器 · 中后期主线
 *
 * 阶段 4（第二个春天） → 阶段 7（第四年 / 终局前）
 * 前半段活下来靠运气和存货，后半段靠「你成了什么样的人」。
 * 所以从阶段 5 开始，事件开始围绕「人、规矩、身份」展开。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DoomEventsSolo = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

const F = (s, f) => (s.flags || []).indexOf(f) >= 0
const hasPartner = s => (s.flags || []).some(f =>
  f === 'partner' || f === 'partner_comrade' || f === 'partner_late')
const hasKid = s => (s.flags || []).some(f => f === 'has_kid' || f === 'adopted_kid')

/* ============================================================
 *  阶段 4 · 第二个春天（第 150 - 330 天）
 * ============================================================ */

const S4 = [
  {
    id: 's4_seed', stage: 4, day: 175, pinned: true, order: 1,
    title: '土还认不认人',
    scene: '化冻之后，你在楼下那片原来种月季的花坛边上蹲了很久。土是黑的，踩上去有点软。你手里攥着一小袋去年从厨房里收的土豆——已经发芽了。',
    optPanels: [
      ['把土豆切块种下去', '先看看别人种不种', '去找有种子的人换'],
      ['下种，先试一小块', '观望一阵', '去换正经的种子'],
      ['把这块地翻出来', '先不动，怕被人惦记', '找种子，找得正经一点'],
    ],
    options: [
      {
        text: '把土豆切块种下去',
        effects: { camp: 6, supply: -2, morale: 6 },
        result: '你把土豆切成带芽的块，埋进挖松的土里，每天下楼看一次。第三周有绿芽出来的时候，你在那儿站了很久。旁边有人过来看，问「这能长出来吗」。你说能。',
        flags: ['farm', 'gardener']
      },
      {
        text: '先看看别人种不种',
        effects: { morale: -3, camp: 2 },
        resolve: (s, rng) => {
          if (rng() < 0.55) {
            return { text: '你在楼上看了两个礼拜，一号楼的老李在院子里翻地。你下楼搭了话，他给你一把葱籽，说「先种这个，好活」。你从此有了第一个「地里认识」的人。', tone: 'good', effects: { supply: 4, morale: 5 }, flags: ['farm', 'ally_farmer'] }
          }
          return { text: '没人种。大家都在等，等有人先种，等那个人先被抢。你在窗边看了几天，最后把发芽的土豆煮了吃了。味道发苦。', tone: 'bad', effects: { supply: 3 } }
        }
      },
      {
        text: '去找有种子的人换',
        effects: { supply: -6, camp: 4, morale: 2 },
        result: '你用六天口粮换了半包萝卜籽、一小把豆子，还有一句「春分前后下种，别太早」。你把这些记在一张纸上。这张纸后来一直夹在你的那本旧书里。',
        flags: ['farm', 'knows_farmer']
      }
    ]
  },
  {
    id: 's4_wanderer', stage: 4, day: 200, slot: 'stranger', order: 2,
    title: '门口坐着一个人',
    scene: '一个年轻人坐在你们楼道口，鞋底磨穿了，脚上包着布。他看见你，把双手举起来，说「我不是来抢东西的，我给干活」。他的嘴唇干得起皮。',
    options: [
      {
        text: '让他进来，先给水',
        effects: { supply: -5, people: 1, morale: 5, camp: 3 },
        resolve: (s, rng) => {
          if (rng() < 0.62) {
            return { text: '他叫小周，原来是修车的。进来之后先睡了十四小时，起来就把你院里那堆废铁整理成三堆。他没说过自己的事，你也没问。第三周他修好了水泵。', tone: 'good', effects: { camp: 8 }, flags: ['took_in', 'mechanic'] }
          }
          return { text: '他进来第二天就有点不对劲，一直问你「晚上谁值夜」。第四天早上，你的半袋米和一把折叠刀不见了。门是开着的。他在门口留了一张纸，上面写「对不起」。', tone: 'bad', effects: { supply: -10, morale: -8 }, flags: ['betrayed'] }
        }
      },
      {
        text: '给他点吃的，让他走',
        effects: { supply: -3, morale: 2 },
        result: '你给了他一包饼干和一瓶水。他连着说了三声谢谢，走的时候把饼干塞进外套内袋。你看着他一瘸一拐地走远。你告诉自己：不能心软，人数是最难算的一笔账。'
      },
      {
        text: '不开门，等他自己走',
        effects: { morale: -5 },
        result: '你在窗后看着他。他坐到天黑，然后靠在墙上睡了。第二天早上他不在了，地上留着一只包——他把自己的包留下了。你打开看，里面是一件干净的衣服和一张全家福。'
      }
    ]
  },
  {
    id: 's4_wanderer_b', stage: 4, day: 210, slot: 'stranger', order: 2,
    title: '两个女人和一个孩子',
    scene: '她们是三个人，母亲、女儿和一个大概四岁的男孩，沿着铁轨走过来的。她们不敲门，就站在院墙外面看着。母亲说了一句话：「给口水就行，我们马上走。」',
    options: [
      {
        text: '收下她们',
        effects: { supply: -10, people: 3, morale: 8, camp: 2 },
        result: '你把储藏间收拾出来给她们住。孩子第一次看见有屋顶的房子，站在门口不敢进。第二天早上你发现自己门口的鞋被摆得整整齐齐——那个母亲做的。',
        flags: ['took_in', 'women_joined', 'orphans']
      },
      {
        text: '给水，给一顿饭，送她们走',
        effects: { supply: -6, morale: 3 },
        result: '你煮了一锅稠的，看她们吃完。临走时男孩回头看了你一眼。你后来很多次想起这一眼，想起的时候正在做别的事。'
      },
      {
        text: '只给水，别的不能给',
        effects: { supply: -2, morale: -6 },
        result: '你从墙头递下两瓶水。母亲接了，说了声「谢谢大哥」。她们沿着铁轨继续走，孩子走了一段就要求抱。你一直看到她们变成三个小点。',
        flags: ['left_behind']
      }
    ]
  },
  {
    id: 's4_wanderer_c', stage: 4, day: 220, slot: 'stranger', order: 2,
    title: '一家五口',
    scene: '他们带着一辆手推车，车上是被子和锅。五个人，一看就是一家人——父母、两个半大孩子、一个老人。父亲开口就是一句：「我们不要吃的，只想在你们这儿住一晚，明天就走。」',
    options: [
      {
        text: '留他们住下，能留就留',
        effects: { supply: -12, people: 5, morale: 6, camp: 6 },
        result: '他们成了你们的人。父亲会砌墙，母亲会做酱，大儿子能扛，小女儿学东西快。老人第二天就病了，第三天走了。你们把他葬在院后那棵树下。',
        flags: ['took_in', 'family_joined', 'buried_someone']
      },
      {
        text: '只留一晚，天亮必须走',
        effects: { supply: -4, morale: 1, camp: 2 },
        result: '你给他们腾了半间屋子，第二天早上他们真的走了。走前那个父亲把院门口那段歪掉的矮墙替你扶正了。你说不用，他说「住一晚也得有个交代」。'
      },
      {
        text: '人太多，不能开这个头',
        effects: { morale: -8, camp: -2 },
        result: '你说这里住不下。他没有多求，推着车走了。你听见小女儿问「爸爸，他们为什么不要我们」，父亲说「不是不要，是住不下」。这两个说法你都听懂了。',
        flags: ['closed_door']
      }
    ]
  },
  {
    id: 's4_love', stage: 4, day: 240, slot: 'partner', order: 3,
    title: '两个人的夜班',
    scene: '值夜的时候只剩下你们两个人。她递给你半块饼，说「我刚发现的」。火堆很小。你们聊到封城那天各自在干什么，聊到中间都不说话了，但都没走。',
    options: [
      {
        text: '把这件事说开',
        effects: { morale: 12, camp: 4, flags: ['partner'] },
        result: '你说了一句很笨的话，她笑了一声，说「我知道」。就这样，没有任何仪式。第二天你们把被子搬到一起，谁都没提这件事的必要性——在这个世道，说出来反而像诅咒。',
        flags: ['partner', 'partner_comrade']
      },
      {
        text: '不说，保持现在这样',
        effects: { morale: 4, camp: 2 },
        result: '你们还是各睡各的屋子，但值夜班一直是你们两个。有些事不用说出来，也一样在发生。你后来想，这样也好——少一个牵挂，多一分能活下去的可能。'
      },
      {
        text: '刻意疏远，怕以后承受不住',
        effects: { morale: -6 },
        result: '你换了班次，把自己的屋子门插得比以前紧。她没问为什么。有一晚你在墙这边听见她在另一头收拾东西，声音很轻。你躺着，没动。',
        flags: ['kept_distance']
      }
    ]
  },
  {
    id: 's4_love_b', stage: 4, day: 245, slot: 'partner', order: 3,
    title: '有人愿意跟你搭伙',
    scene: '一个跟你一起干过几回活的人，在收工的时候说了句：「要不我们搭个伙吧，不是为了别的，就是两个人好过一点。」他说得很实在，一点不浪漫。',
    options: [
      {
        text: '答应，从今天起一起过',
        effects: { morale: 10, camp: 5, supply: 2, flags: ['partner'] },
        result: '你们把两个人的东西合到一处，算了一遍还能撑多久。算完之后他说：「也就两个人刚好。」这句话后来成了你们这四年里最常被重复的一句。',
        flags: ['partner', 'partner_comrade']
      },
      {
        text: '说要想想',
        effects: { morale: 1, camp: 1 },
        result: '他说「行，不急」。之后的两个月你们还一起干活，谁也没提这件事。直到有一天他救了你一次，你才开口说「那就搭吧」。这事就这么定了。',
        flags: ['partner']
      },
      {
        text: '拒绝，一个人更简单',
        effects: { morale: -4, camp: 2 },
        result: '你说「我一个人习惯了」。他点头，说「我懂」，之后再没提。你们还是照常合作，只是收工之后各走各的。你觉得轻松，也有一点空。'
      }
    ]
  },
  {
    id: 's4_first_death', stage: 4, day: 270, pinned: true, order: 4,
    title: '第一个自己走的人',
    scene: '你们当中有人自杀了。他留下了一张纸条，上面只写了三行：粮食我那份别浪费，不怪任何人，我只是撑不住了。你们在他屋里发现他把床铺收拾得很整齐。',
    options: [
      {
        text: '一起把他葬了，说几句话',
        effects: { morale: 4, camp: 4, health: -3 },
        result: '你们在院后挖了坑。有人念了一段不知道从哪本书里看来的话。散的时候谁都没有立刻走。那天晚上，你们第一次认真地讨论「如果哪天自己也撑不住了该怎么办」。',
        flags: ['buried_someone', 'talked_about_death']
      },
      {
        text: '把他那份东西立刻分了',
        effects: { supply: 6, morale: -12 },
        result: '你说「总不能浪费」，然后动手分了。没人反对，也没人说话。你分到一双还算好的鞋。那双鞋你穿了两年，每次穿都会想起他整齐的床铺。',
        flags: ['divided_dead']
      },
      {
        text: '一个人待了一整天',
        effects: { morale: -8 },
        result: '你锁上门，在屋里坐了一天。傍晚你出来，眼睛是肿的。没有人问你。从此你开始记日记——不是写给别人看的，是怕自己也有一天觉得自己没留下什么。'
      }
    ]
  },
  {
    id: 's4_spring_end', stage: 4, day: 320, pinned: true, order: 9,
    title: '第二个夏天',
    scene: '夏天来了。这一次你知道该怎么过：白天不开火，晚上通风，水从雨布上接，菜地里该浇水了。你做的每件事都是去年学到的。',
    auto: true,
    resolve: (s, rng) => {
      const yieldTxt = F(s, 'farm')
        ? (rng() < 0.6 ? '土豆收了小半筐，萝卜长得歪，但能吃。' : '菜地被一场暴雨冲了一半，剩下的勉强够补一段。')
        : '你没有种地。街上偶尔能换到一点菜，价格每隔十天涨一次。'
      return {
        text: `${yieldTxt}你已经不再问「什么时候能恢复」了。这个问题在冬天问过太多次，答案是没人知道。现在你想的是另一件事：怎么让下一个冬天比这个冬天好一点。`,
        tone: 'neutral',
        effects: F(s, 'farm') ? { supply: 14, morale: 6 } : { supply: -4, morale: 2 }
      }
    }
  }
]

/* ============================================================
 *  阶段 5 · 第二年冬天（第 330 - 520 天）
 * ============================================================ */

const S5 = [
  {
    id: 's5_second_winter', stage: 5, day: 350, pinned: true, order: 1,
    title: '第二个冬天来了',
    scene: '这次你提前两个月就开始准备：柴、腌菜、把窗户缝用旧衣服塞死。可这一次冷得更早、更狠。十一月底，外面已经零下十几度。',
    options: [
      {
        text: '把所有人集中到一间屋子',
        effects: { camp: 6, morale: 4, supply: -4, health: 4 },
        result: '你们把三间屋子的人都挤到最南边的一间，用塑料布吊了顶，炉子昼夜不熄。有人在里面咳嗽，有人打呼噜，有孩子哭。但没有人冻死。',
        flags: ['shared_winter']
      },
      {
        text: '各守各屋，靠柴火硬扛',
        effects: { supply: -12, health: -8, morale: -4 },
        result: '你烧得太狠了，柴在二月中就见底。最后半个月你白天裹着被子坐着，晚上才舍得点火。那半个月你不愿意回想。',
        flags: ['ran_out_fuel']
      },
      {
        text: '去找别的地方过冬',
        effects: { camp: -8, health: -6, morale: -2 },
        result: '你听说过一个地下商场里住着两百多人，有发电机。你走了两天到那儿，人家只让住了一个月。开春你就被请出来了，但那个月救了你。',
        flags: ['moved', 'saw_big_camp']
      }
    ]
  },
  {
    id: 's5_hunger', stage: 5, day: 380, pinned: true, order: 2,
    title: '粮食见底的那些天',
    scene: '你已经开始吃平时不会吃的东西了：米袋里最后那一层、几块过期的饼干、一小把面条煮成糊。你知道还有三周才开春。',
    optPanels: [
      ['杀一只小的', '去外面找', '开口向人借'],
      ['把存着的最后一点分着吃了', '出城找吃的', '跟人开口'],
      ['吃一顿算一顿', '去远处的村子碰碰运气', '借，欠着也借'],
    ],
    options: [
      {
        text: '把最后一点分着吃了，先扛过去',
        effects: { supply: -3, health: -8, morale: 2 },
        result: '你把这些东西分成三份，每天吃一份，然后靠喝热水和睡觉撑过去。最后那几天你站起来会眼前发黑，手抖得端不住碗。你瘦得脱了相，但你活到了化冻。',
        flags: ['starved_through']
      },
      {
        text: '出门去找',
        effects: { health: -10, supply: 8 },
        resolve: (s, rng) => {
          if (rng() < 0.5) {
            return { text: '你在城郊找到一个没人住的院子，地窖里有一筐发了芽的土豆和一袋玉米面。你来回搬了三趟，腿一直在抖。这些够撑到开春了。', tone: 'good', effects: { supply: 10, morale: 6 } }
          }
          return { text: '你在雪里走了两天，什么都没找到。回来的路上你崴了脚，靠一根木棍走回家。进门先喝了一碗热水，然后坐下来，很久没动。', tone: 'bad', effects: { supply: -2, health: -8 } }
        }
      },
      {
        text: '找认识的人开口借',
        effects: { supply: 6, morale: -4 },
        resolve: (s, rng) => {
          if (F(s, 'ally_neighbor') || F(s, 'ally_farmer') || F(s, 'knows_trader')) {
            return { text: '你开口了，对方没说什么，装了一袋过来，还塞了两块腊肉。你说「我一定还」，他说「不用，明年你还得在这儿」。这句话让你在回来的路上哭了。', tone: 'good', effects: { morale: 8 }, flags: ['owes_favor'] }
          }
          return { text: '你敲了四家的门。两家说没有，一家给了半袋面，一家关门之前说「下不为例」。你把面抱回去，觉得这个冬天的冷是从里面来的。', tone: 'neutral', effects: { morale: -2 } }
        }
      }
    ]
  },
  {
    id: 's5_sick_group', stage: 5, day: 410, slot: 's5sick', order: 3,
    title: '一个接一个倒下了',
    scene: '先是孩子，然后是老人，现在是中间那个最壮的。发烧、咳嗽、起不来。你知道这不是伤风——这几个月没人吃好过。',
    options: [
      {
        text: '把人隔离，自己照顾',
        effects: { health: -12, morale: 4, camp: 2 },
        resolve: (s, rng) => {
          const med = F(s, 'medic')
          const ok = rng() < (med ? 0.7 : 0.45) + (s.health > 55 ? 0.15 : 0)
          if (ok) return { text: '你把人分开，一天做五顿饭，用手背试体温。两周之后，倒下的人一个接一个坐起来了。你自己也病了一场，但没到起不来。', tone: 'good', effects: { morale: 8, health: 4 }, flags: ['nurse_skill'] }
          return { text: '你尽力了。两个人没救回来，是他们当中最弱的两个。你把他们埋在冻土里，挖了半天才挖开。剩下的人活了，你的手抖了很久。', tone: 'bad', effects: { morale: -6, people: -2 }, flags: ['nurse_skill', 'buried_someone'] }
        }
      },
      {
        text: '先保住自己，别被拖垮',
        effects: { health: 2, morale: -10, people: -1 },
        result: '你把自己的门关好，饭照做，但不进那间屋子。月底，那个最壮的人没能撑过去。你后来一直记得他最后两天没力气喊人的样子。',
        flags: ['left_behind']
      },
      {
        text: '集中用药，能用的都用上',
        effects: { supply: -12, health: 6, morale: 5 },
        result: '你把所有的药都翻出来，抗生素按人分配，用完了就用草药顶。这些药本来够用三年，现在三周就没了。但这三周里没有人死。你觉得这笔账划算。',
        flags: ['used_meds']
      }
    ]
  },
  {
    id: 's5_theft', stage: 5, day: 440, slot: 's5betray', order: 4,
    title: '少了一袋米',
    scene: '你的储物间少了一袋米和两瓶药。门锁没坏。这意味着是自己人拿的——你们一共就这几个人。',
    options: [
      {
        text: '当面摊开问，不撕破脸',
        effects: { morale: -6, camp: 6 },
        resolve: (s, rng) => {
          if (rng() < 0.6) {
            return { text: '那个最年轻的人站出来了，说他妹妹在外面，快不行了。你把剩下的东西分了一份给他，说「下次直接说」。他哭了。这件事之后，你们这伙人反而更紧了。', tone: 'good', effects: { morale: 8, supply: -4 }, flags: ['forgave_thief'] }
          }
          return { text: '没人承认。之后你们开始把东西上锁，钥匙只有你自己有。这个动作让屋子里的气氛变了，所有人都知道了：现在开始有「我的」和「你们的」了。', tone: 'neutral', effects: { camp: 4 } }
        }
      },
      {
        text: '私下查，查出来自己处理',
        effects: { morale: -8, camp: 2 },
        result: '你花了三天查出来是谁。你什么也没说，第二天让他走了。他走的时候你没看他。屋里从此少一个人，也少一份口粮。你觉得自己做对了，但连着几夜睡不好。',
        flags: ['exiled_someone']
      },
      {
        text: '不查了，就当损失',
        effects: { morale: -3, supply: -2, camp: -3 },
        result: '你没有查。从那之后东西一直在少，一次一点。你知道有这么一个人在，也装作不知道。这间屋子里从此有一件大家都心知肚明、谁也不提的事。',
        flags: ['silent_theft']
      }
    ]
  },
  {
    id: 's5_theft_b', stage: 5, day: 450, slot: 's5betray', order: 4,
    title: '他们要把门打开',
    scene: '外面有人在敲门，声音很急。屋里的人吵起来了：一半人说不能开，一半人说外面可能有孩子。你站在门口，手放在门闩上。',
    options: [
      {
        text: '开门，先看是谁',
        effects: { morale: 4, camp: -4 },
        resolve: (s, rng) => {
          if (rng() < 0.55) {
            return { text: '门外是一家三口，冻得说不出话。你们让他们进来了。第二天早上，你们的柴少了一小半，而那家人不见了。没有人再提「开不开门」这件事。', tone: 'neutral', effects: { supply: -6, morale: -6 }, flags: ['burned_by_kindness'] }
          }
          return { text: '门外是隔壁楼的两个女人，说她们那边被人清了。你们合了伙。她们的存货比你们还多，从那天起冬天好过了一些。', tone: 'good', effects: { people: 2, supply: 6 }, flags: ['took_in'] }
        }
      },
      {
        text: '不开，让他们自己解决',
        effects: { morale: -8, camp: 3 },
        result: '敲门声持续了一个小时，然后是骂，然后是安静。第二天早上门口没有人，只有一块被踹掉的漆。你们谁都没有提这件事，那天的早饭吃得很慢。',
        flags: ['closed_door']
      },
      {
        text: '隔着门谈条件',
        effects: { morale: 2, camp: 4, supply: 2 },
        resolve: (s, rng) => {
          if (F(s, 'silver_tongue') || rng() < 0.55) {
            return { text: '你隔着门问清楚了人数和来意，最后谈定：进来两个，交出一半的东西，服从值夜。这个规矩后来一直用着，一直没出过事。', tone: 'good', effects: { camp: 6 }, flags: ['set_rules'] }
          }
          return { text: '你说了一半，外面的人不耐烦了，开始撞门。你们在门口顶住，门最后裂了一条缝。他们走了，你们那晚没睡。', tone: 'bad', effects: { health: -6 } }
        }
      }
    ]
  },
  {
    id: 's5_theft_c', stage: 5, day: 460, slot: 's5betray', order: 4,
    title: '他们要分东西',
    scene: '一屋子人坐下来。有人提了一句：「东西都是大家挣的，凭什么你说怎么分就怎么分。」这句话说完，屋里很安静。所有人都看着你。',
    options: [
      {
        text: '按劳分，定个规矩',
        effects: { camp: 8, morale: 2 },
        result: '你们用一块木板写了规矩：谁干活多谁多分，老人孩子保底。这块木板挂在门后，一直挂到第四年。有人不服，但服的人更多。',
        flags: ['set_rules', 'ruled']
      },
      {
        text: '平分，一个人一份',
        effects: { morale: 6, camp: -4 },
        result: '你说平分。最卖力那几个人脸上不太好看，但没人说话。一个月后，夜里巡墙的人变少了，有人说「反正都一样分」。',
        flags: ['equal_share']
      },
      {
        text: '让他们自己决定',
        effects: { morale: -4, camp: 2 },
        result: '你说「你们定」。他们吵了一晚上，最后定出来的方案比你想的还严。你发现他们其实一直有想法，只是以前没机会说。这让你有点不安。',
        flags: ['delegated']
      }
    ]
  },
  {
    id: 's5_chronic', stage: 5, day: 480, slot: 's5health', order: 5,
    title: '腰不行了',
    scene: '你搬柴的时候把腰闪了。起初以为两天就好，结果一周都没好。你现在弯腰要分三步，站起来要先扶墙。',
    options: [
      {
        text: '少干重活，让别人接手',
        effects: { health: 6, camp: -4, morale: 2 },
        result: '你把重活交了出去。交接的时候你发现，别人干得比你差一点，但也不算差。这是你四年来第一次意识到：这里没有你，也能转。这个发现让你既轻松又慌。',
        flags: ['delegated_work']
      },
      {
        text: '忍着，照旧干',
        effects: { health: -10, camp: 3, morale: 3 },
        result: '你贴了两块膏药，继续搬。冬天结束的时候你的腰彻底留下了毛病——现在一累就疼，弯腰拿东西得慢慢来。你不后悔，但你知道这是永久性的。',
        flags: ['chronic_pain']
      },
      {
        text: '找一个懂推拿的人治',
        effects: { supply: -6, health: 8 },
        resolve: (s, rng) => {
          if (rng() < 0.6) return { text: '城南有个老头，原来是中医。他用手法给你掰了两回，又教了你三个动作。腰好了八成。你给他留了一袋米，他收下来说「下次别搬那么多」。', tone: 'good', effects: { morale: 4 }, flags: ['knows_healer'] }
          return { text: '你找到一个自称会治的人，按了三次，一点用没有，还被要走了不少东西。你后来自己躺着养了两个月才好。', tone: 'bad' }
        }
      }
    ]
  },
  {
    id: 's5_chronic_b', stage: 5, day: 490, slot: 's5health', order: 5,
    title: '牙疼',
    scene: '一颗牙疼了十天。你只能用另一边嚼东西，晚上疼得睡不着，脑袋像被人从里面捅。这世道里没有牙医。',
    options: [
      {
        text: '自己想办法弄掉它',
        effects: { health: -10, morale: 4 },
        resolve: (s, rng) => {
          if (rng() < 0.5) return { text: '你喝了半瓶烈酒，用钳子把它拔了下来。血止住之后你坐在地上笑了很久——疼，但那种疼是有尽头的。', tone: 'good', effects: { health: 4 } }
          return { text: '你弄了三次都没成功，最后是靠着消炎药和忍，一直忍到那颗牙自己松了。那一整个冬天你都没吃好过一顿饭。', tone: 'bad', effects: { health: -6 } }
        }
      },
      {
        text: '拿东西换药，先消炎',
        effects: { supply: -6, health: 5 },
        result: '你用六天的口粮换了一板消炎药和一瓶漱口水。吃了三天就不疼了，但牙还在，你知道它迟早还得疼一次。'
      },
      {
        text: '忍着，不花这个代价',
        effects: { health: -8, morale: -5 },
        result: '你忍了三个星期。它最后不疼了，那颗牙变成了一个黑洞。你从此只用一边嚼东西，而这世道没有人替你补牙。',
        flags: ['bad_teeth']
      }
    ]
  },
  {
    id: 's5_winter_end_2', stage: 5, day: 520, pinned: true, order: 9,
    title: '第二个冬天结束',
    scene: '这一次你没数还剩多少，因为你早就学会了每天算。开春那天地上的雪化得很快，露出下面的垃圾和去年的东西。',
    auto: true,
    resolve: (s, rng) => {
      const death = rng() < 0.3
      return {
        text: (death
          ? '你们少了一个人。走的是最沉默那个，谁都没有预料到。你们把他葬在院后，跟他并排的是去年那个人。'
          : '一个人都没少。这件事在第三个年头里已经算运气。') +
          '你站在化开的泥地里，忽然发现自己不太记得封城之前的日子是什么样的了——记得细节，记不住感觉。',
        tone: 'neutral',
        effects: death ? { people: -1, morale: -4 } : { morale: 6, camp: 2 }
      }
    }
  }
]

/* ============================================================
 *  阶段 6 · 第三年（第 520 - 1000 天）
 * ============================================================ */

const S6 = [
  {
    id: 's6_organize', stage: 6, day: 560, pinned: true, order: 1,
    title: '得有个规矩了',
    scene: '人多了，事就多了：谁家的孩子动了谁家的菜、值夜的人睡着了、有人把公用的工具拿去换了东西。你们需要一套规矩，而这次定规矩的人是你。',
    optPanels: [
      ['我来定，我说了算', '一起商量，投票', '不定规矩，靠自觉'],
      ['把规矩写下来，我来管', '大家一起议', '还是老办法，讲情面'],
      ['定死规矩，违规就赶人', '投票决定', '先缓一缓'],
    ],
    options: [
      {
        text: '我来定，我说了算',
        effects: { camp: 10, morale: -4 },
        result: '你写了七条，刻在门后的木板上。第一条是「偷东西的人赶出去」。有人问「谁说了算」，你说「我说了算」。从那天起，你的话在这道墙里就是规矩。',
        flags: ['ruled', 'set_rules']
      },
      {
        text: '一起商量，投票',
        effects: { camp: 6, morale: 8 },
        resolve: (s, rng) => {
          if (s.people >= 6) {
            return { text: '你们花了两晚吵架，最后定了十一条。第十一条是「规矩可以改，改的时候得有一半人同意」。这条最麻烦，也最救你们——第三年冬天你们差点因为一条规矩散伙。', tone: 'good', effects: { camp: 4 }, flags: ['democratic', 'set_rules'] }
          }
          return { text: '人太少，投票没意义。最后是你说、大家点头。你还是那个说了算的人，只是名义上不叫这个名字。', tone: 'neutral', flags: ['ruled', 'set_rules'] }
        }
      },
      {
        text: '不定规矩，靠自觉',
        effects: { camp: -6, morale: 3 },
        result: '你说「大家都是人，讲个情面」。第三个月，有人把公用的发电机卖了，说那是他先看见的。你们吵了一架，最后没有结论。这地方从此少了一样东西，也少了一点信。',
        flags: ['no_rules']
      }
    ]
  },
  {
    id: 's6_power', stage: 6, day: 600, slot: 's6lead', order: 2,
    title: '有人不服你',
    scene: '一个跟你一样活到现在的人，当众说了句：「凭什么都是你安排。」他不是要打你，他是要一个说法。旁边的人都停下手里的活，看你怎么说。',
    options: [
      {
        text: '把位置让出来，让他试试',
        effects: { camp: -4, morale: 6 },
        resolve: (s, rng) => {
          if (rng() < 0.55) {
            return { text: '他接手了一个月。第一周还顺，第二周吵起来了，第三周他自己来找你，说「还是你来」。你没有趁机说什么。从那以后，没有人再问「凭什么」。', tone: 'good', effects: { camp: 6 }, flags: ['proved_self'] }
          }
          return { text: '他接手之后干得不错，比你想的还稳。你把位置让了，也松了一口气。只是有些决定他不再跟你商量，你开始觉得自己在这里像个老人。', tone: 'neutral', effects: { morale: 4 } }
        }
      },
      {
        text: '说清楚你的道理',
        effects: { camp: 6, morale: 2 },
        resolve: (s, rng) => {
          if (F(s, 'silver_tongue') || rng() < 0.6) {
            return { text: '你把这些年做过的每一次决定摊开来讲，包括那些你判断错的。讲到一半他就坐下了。你说完最后一句：「下次你觉得不对，当场提，不要等散会。」', tone: 'good', effects: { camp: 4, morale: 4 } }
          }
          return { text: '你讲了，但讲得不好。他不服，也不吵了，只是从此干活变得很敷衍。你知道这个人从今天起不会再为你卖力了。', tone: 'bad', effects: { camp: -4 } }
        }
      },
      {
        text: '把他赶出去',
        effects: { camp: 3, morale: -10, people: -1 },
        result: '你说这里只能有一个说法，不愿意的可以走。他当晚收拾东西走了，带走了两个人。你后来听说他去了南边，办得还不错。你没说什么，只是记住了那个数字：走了三个。',
        flags: ['exiled_someone', 'ruled']
      }
    ]
  },
  {
    id: 's6_power_b', stage: 6, day: 620, slot: 's6lead', order: 2,
    title: '有人来投',
    scene: '外面来了十几个人，带头的说他那儿被冲了，听说你们这儿有墙有规矩，问能不能进来。他们有武器，也有妇孺。你们的人都在等你说一句话。',
    options: [
      {
        text: '收，人多了墙才守得住',
        effects: { people: 12, supply: -14, camp: 10, morale: 5 },
        resolve: (s, rng) => {
          if (rng() < 0.6) {
            return { text: '他们进来之后，你们的活儿一下轻了，也一下重了——人多了要分，要管，要吵。但北墙从此再也没有被人爬上过。', tone: 'good', effects: { camp: 6 }, flags: ['big_camp', 'armed'] }
          }
          return { text: '他们进来之后，事情变复杂了：他们的人只服他们的头儿。半年后你们实际上分成了两拨，共用一道墙。你开始想，当初到底该不该开这个门。', tone: 'neutral', effects: { morale: -4 } }
        }
      },
      {
        text: '只收不带枪的',
        effects: { people: 5, supply: -6, camp: 4 },
        result: '你说带枪的不能进，剩下五个愿意留下的把枪交在了门口。他们的头儿站在门外看了很久，最后转身走了。这五个后来成了最靠得住的人——因为他们知道门是怎么开的。',
        flags: ['took_in', 'strict_gate']
      },
      {
        text: '不收，让他们去别处',
        effects: { morale: -6 },
        resolve: (s, rng) => {
          if (rng() < 0.4) {
            return { text: '他们走了，半年后又路过一次。这次人是原来的一半。他们没停，你也没出去。那天你在墙头上站了很久。', tone: 'bad', effects: { morale: -4 } }
          }
          return { text: '他们走了。后来你听说他们抢了一个比你小的地方，死了七个人。你没法说这跟你有关，也没法说自己没关系。', tone: 'bad' }
        }
      }
    ]
  },
  {
    id: 's6_power_c', stage: 6, day: 640, slot: 's6lead', order: 2,
    title: '第一次审判',
    scene: '一个人被抓住了。他在夜里爬墙进来偷东西，被值夜的按在地上。他跪在雪地里，说家里有孩子。墙里的人都出来了，等着你说话。',
    options: [
      {
        text: '打一顿，放走',
        effects: { morale: -2, camp: 3 },
        result: '你让人打了他十下，然后把他从门口推出去。他爬着走了。这件事后来传开了，说你们这儿「抓到了会打人」，那一带的小偷开始绕着走。',
        flags: ['punished', 'judged']
      },
      {
        text: '问清楚，给他一个机会',
        effects: { morale: 8, people: 1, supply: -4 },
        result: '你问了他家在哪，让人跟去看。确实有个病着的女儿。你留下了他，让他值夜抵账。他值夜值了两年，没有一夜睡过。',
        flags: ['mercy', 'judged', 'took_in']
      },
      {
        text: '按规矩办，赶出去，东西截下',
        effects: { supply: 4, morale: -6, camp: 5 },
        result: '你按你们自己定的规矩办：东西留下，人赶走，通知附近两个据点。他被架着出去的时候一直在骂。你没有还嘴——这比还嘴更难受。',
        flags: ['strict_rules', 'judged']
      }
    ]
  },
  {
    id: 's6_kill', stage: 6, day: 700, slot: 's6moral', order: 3,
    title: '手上要沾东西了',
    scene: '你和一个人在楼道里狭路相逢，他手里有把砍刀，明显不是来聊天的。你们隔着三步。他的手在抖。你听见自己呼吸的声音。',
    options: [
      {
        text: '先下手',
        effects: { health: -6, morale: -12, flags: ['killed_first'] },
        resolve: (s, rng) => {
          const ok = rng() < 0.8 + (F(s, 'veteran') || F(s, 'cold_blood') ? 0.15 : 0)
          if (ok) {
            return {
              text: `你先动了。他倒下去的时候还睁着眼，看着天花板。你在他身上摸出半块饼和一把钥匙。你在楼道里站了很久，然后拖着腿走上楼。那晚你没睡。`,
              tone: 'bad',
              effects: { supply: 3, morale: -6 },
              flags: ['killed_man']
            }
          }
          return { text: '你动慢了。刀在你小臂上划开了一道很长的口子。你不知道自己怎么最后把他推下楼梯的，只记得他摔下去的声音。你的手臂后来缝了十一针，没有麻药。', tone: 'bad', effects: { health: -14 }, flags: ['killed_man', 'wounded'] }
        }
      },
      {
        text: '后退，把东西给他',
        effects: { supply: -10, morale: -6 },
        result: '你把背包扔给他，退到墙边。他拿了，跑了两步，回头看你还站在那儿。他没再动你。你回家之后坐在门口，觉得自己刚才做了一个很聪明的、也很难受的决定。'
      },
      {
        text: '喊人',
        effects: { health: -8, morale: 2, camp: 4 },
        resolve: (s, rng) => {
          if (s.people >= 3 || F(s, 'neighbors_org') || F(s, 'watch_system')) {
            return { text: '你喊了一声，楼道里的灯全亮了——这是你们约定的信号，敲三下，或者喊一嗓子。他跑了。后来你们又抓到过他一次，这次是五个人围住的。', tone: 'good', effects: { supply: 4 }, flags: ['watch_system', 'judged'] }
          }
          return { text: '你喊了，没有人来。他上来抢，你们在楼道里滚成一团。你被踩了两脚，肋骨裂了一根，但他最后跑了。你躺在地上咳，咳出来的痰里有血。', tone: 'bad', effects: { health: -10 } }
        }
      }
    ]
  },
  {
    id: 's6_kill_b', stage: 6, day: 720, slot: 's6moral', order: 3,
    title: '一个孩子',
    scene: '你在别人家的屋子里搜东西，翻到后间时看见一个孩子缩在角落，大概七八岁，手里攥着一把剪刀。他一直在发抖，眼睛盯着你。',
    options: [
      {
        text: '把剪刀拿走，留点吃的',
        effects: { supply: -3, people: 1, morale: 8 },
        result: '你把剪刀轻轻拿下来，从包里掏出一包饼干放在他面前，然后走了。走到门口你回头，他还坐在那儿，饼干没动。两个月后他在你们门口出现，一直没走。',
        flags: ['took_in', 'adopted_kid', 'has_kid']
      },
      {
        text: '什么都不动，直接走',
        effects: { morale: -2 },
        result: '你把东西收好就走。身后一点声音都没有。你走到楼下才听见楼上有很轻的、压着的哭声。这个声音你后来记了很久。'
      },
      {
        text: '把他赶出去，这屋子你要用',
        effects: { camp: 6, morale: -12 },
        result: '你说「出去」。他拿着剪刀站起来，一步一步退到门口，然后跑了。这间屋子后来成了你们的仓库。你每次进去都觉得角落里有东西，其实什么都没有。',
        flags: ['left_behind']
      }
    ]
  },
  {
    id: 's6_kill_c', stage: 6, day: 730, slot: 's6moral', order: 3,
    title: '他们让你们交一个人',
    scene: '一伙人堵在门口，说你们这里藏了他们要找的人——是你们当中的一个。他们给了半小时，说交人就走，不交就动手。',
    options: [
      {
        text: '不交，一起扛',
        effects: { health: -14, morale: 10, camp: 4 },
        resolve: (s, rng) => {
          if (rng() < 0.55 + (F(s, 'armed') ? 0.15 : 0)) {
            return { text: '你们没有开门，也没有交人。他们撞了两次门，被你们从墙头浇下去一锅开水，退走了。那天晚上没有人睡，但也没有人走。这地方从此算真的立起来了。', tone: 'good', effects: { camp: 8 }, flags: ['stood_together'] }
          }
          return { text: '门被撞开了。你们打了一场，很难看。他们没有找到那个人，走的时候带走了你们一半的存货。你们有三个人受了伤，其中一个后来没完全好。', tone: 'bad', effects: { supply: -16, health: -8 }, flags: ['stood_together'] }
        }
      },
      {
        text: '把人交出去',
        effects: { morale: -16, people: -1, camp: 2 },
        result: '你们把人带出来的时候，他没有看你们任何人。他被带走之后，院子里剩下的人没有说一句话。那天晚上有人开始收拾东西。半个月里走了两个。',
        flags: ['sold_out', 'sold_out_friend']
      },
      {
        text: '谈条件，用东西换',
        effects: { supply: -20, morale: -2 },
        result: '你把一半的存货推出去，说「人不能给，东西你们拿走」。对方看了一眼那些东西，说了句「识趣」，走了。你们那个人一直在屋里没出来。第二天他给你打了三个月的柴。',
        flags: ['paid_off', 'stood_together']
      }
    ]
  },
  {
    id: 's6_camp_attack', stage: 6, day: 800, pinned: true, order: 4,
    title: '他们打过来了',
    scene: '这次不是敲门，是撞墙。有三辆车，人至少十几个，从两个方向过来。你们这边能动手的人不超过六个。有人开始哭，有人已经开始搬东西。',
    optPanels: [
      ['守，把人都叫起来', '从后面撤，留得青山在', '分两路，先挡住再谈'],
      ['死守正门，把火点起来', '撤，带上能带走的', '一边守一边找机会谈'],
      ['拼了，这一仗躲不掉', '跑，人比东西重要', '把女人孩子先送走'],
    ],
    options: [
      {
        text: '守，把人都叫起来',
        effects: { health: -16, morale: 8, camp: -8 },
        resolve: (s, rng) => {
          const power = (s.people || 1) * 0.7 + s.camp * 0.5 + s.health * 0.3 + (F(s, 'armed') ? 25 : 0) + (F(s, 'veteran') ? 18 : 0) + (F(s, 'watch_system') ? 10 : 0)
          if (power > 90 && rng() < 0.75) {
            return { text: '你们守住了。北墙被撞出一个洞，你们在洞里堵了三个人。天快亮的时候他们走了。天亮之后你们清点：两个重伤，一个没救回来。墙上的洞补了六天。从此这一带没人再来试过。', tone: 'good', effects: { camp: 10, people: -1, morale: 6 }, flags: ['defended_camp', 'armed'] }
          }
          return { text: '墙破了。你们退到后院，又退到地下室。最后他们走了，因为天亮了。你们清点的时候发现少了一半人，其中有两个是自己趁乱走的。你在废墟里坐到中午。', tone: 'bad', effects: { people: -3, supply: -20, camp: -16, morale: -6 }, flags: ['camp_sacked'] }
        }
      },
      {
        text: '从后面撤，留得青山在',
        effects: { supply: -18, camp: -14, morale: -6, health: -6 },
        result: '你们从后墙翻出去，只带了能背的。走了半里地你回头，看见自己家的窗户被点亮了。你在那个冬天走了很多路，最后在一个水库旁边的泵房里住下来。这个地方比原来小，但没有人知道。',
        flags: ['moved', 'lost_home', 'bunker']
      },
      {
        text: '分两路，先挡住再谈',
        effects: { health: -8, camp: -4, supply: -10, morale: 2 },
        resolve: (s, rng) => {
          if (F(s, 'silver_tongue') || rng() < 0.5) {
            return { text: '你在墙头喊了话，说愿意谈。对方停了手。最后的结果是你们交出一半存货，他们不进这道门。有人觉得亏，但你们的人都还在。', tone: 'neutral', effects: { camp: 4, morale: 4 }, flags: ['did_deal'] }
          }
          return { text: '你喊话的时候他们打得更凶了。最后是墙塌了一角，你们退了进去。他们抢了半个仓库就走了。你们活下来的人站在院子里，看了很久那堵墙。', tone: 'bad', effects: { supply: -20, camp: -8 } }
        }
      }
    ]
  },
  {
    id: 's6_year3_end', stage: 6, day: 1000, pinned: true, order: 10,
    title: '三年',
    scene: '第 1000 天。你没做任何标记，只是早上起来的时候忽然想起来：已经三年了。窗外有人在劈柴，声音一下一下。',
    auto: true,
    resolve: (s, rng) => {
      return {
        text: '你坐在门槛上算了一笔账：原来这个世界的人，现在活着的不到十分之一。你认识的人里，死了一半。你现在会做的事，三年前一件都不会。你没有变得更强，只是变得更适合这里。这两个说法在别人眼里可能一样，你自己知道不一样。',
        tone: 'neutral',
        effects: { morale: 4 }
      }
    }
  }
]

/* ============================================================
 *  阶段 7 · 第四年（第 1000 - 1500 天）
 * ============================================================ */

const S7 = [
  {
    id: 's7_caravan', stage: 7, day: 1100, pinned: true, order: 1,
    title: '路上来的车队',
    scene: '三辆改装过的卡车停在镇口，车上有机枪架。带头的女人四十来岁，穿一件洗得发白的工装，说他们在找愿意加入的人——他们有个地方，有电，有学校，有医生。',
    optPanels: [
      ['跟他们走', '留在这里', '先派两个人去看看'],
      ['上车，去看看', '这里是我的地方，不走', '让人先去'],
      ['谈条件，谈得好就走', '不走了', '探探底再说'],
    ],
    options: [
      {
        text: '跟他们走',
        effects: { morale: 6, supply: -8, camp: 4 },
        resolve: (s, rng) => {
          if (rng() < 0.62) {
            return { text: '你在一个旧厂区里见到了电灯、自来水、一块真正的黑板。那里有一千多个人。你被分到了一间有窗的房子，窗外是一排刚种下的树。你那天晚上睡不着——不是因为害怕，是因为太安静了，没有风从破洞里灌进来。', tone: 'good', effects: { morale: 10, camp: 10 }, flags: ['joined_caravan', 'caravan', 'grid'] }
          }
          return { text: '走到一半你发现他们的规矩比你想的严：要登记、要交东西、要接受分配。你在第三天的早上带着自己的包下了车。你沿着来时的路走回去，走了四天。回到家，你摸着自己那道门，觉得踏实。', tone: 'neutral', effects: { health: -6, morale: -2 }, flags: ['saw_caravan'] }
        }
      },
      {
        text: '留在这里',
        effects: { morale: 4, camp: 4 },
        result: '你说不去了。她点点头，没有劝，留下两包种子和一句话：「明年这时候我们还会路过。」车开走之后，你站在镇口，发现自己在数他们的车。三辆。你记住了这三个数字。',
        flags: ['stayed_home', 'saw_caravan']
      },
      {
        text: '先派两个人去看看',
        effects: { supply: -4, morale: 2, people: -2 },
        resolve: (s, rng) => {
          if (rng() < 0.5) {
            return { text: '半个月后他们回来了，还带回来两个人。他们说那儿是真的，但规矩多，进去要交一部分东西。你们商量了一晚上，决定再等等——这个「再等等」后来等了很久。', tone: 'neutral', effects: { people: 2 }, flags: ['saw_caravan', 'knows_caravan'] }
          }
          return { text: '他们没有回来。你等了一个月，两个月。你不知道他们是留下了，还是死在了路上。这两个可能你都试过接受，接受不了的是第三种：他们不想回来了。', tone: 'bad', effects: { morale: -8 }, flags: ['saw_caravan'] }
        }
      }
    ]
  },
  {
    id: 's7_grid', stage: 7, day: 1200, slot: 's7hope', order: 2,
    title: '有电了',
    scene: '南边的营地修好了一座小水电站。消息是靠口耳传过来的：他们拉了线，晚上那一带有灯。有人说这是要恢复了，有人说只是那一小片地方。',
    options: [
      {
        text: '去想办法接电',
        effects: { camp: 12, supply: -10, morale: 10 },
        result: '你花了一个月，用一辆报废卡车的电瓶和几块太阳能板，给自己这一片接上了三盏灯。灯亮那天晚上，半个街的人都出来了，有人抬头看了很久，像在看星星——其实是灯泡。',
        flags: ['home_light', 'grid']
      },
      {
        text: '不去，电会招来人',
        effects: { camp: 4, morale: -3 },
        result: '你没有去接。你见过有灯的地方招来什么：先是人，然后是抢。你把窗户继续堵着。这个决定不算错，只是每次夜里看见远处那一片亮，你都会在窗边站一会儿。',
        flags: ['stayed_dark']
      },
      {
        text: '往南搬，靠近有电的地方',
        effects: { camp: -6, supply: -8, morale: 8, health: -4 },
        result: '你带着人和东西搬了六十公里，在有电的地方边上落了脚。新地方小，墙要重新修，水要重新找。但你晚上能看见灯，听见发电机的响声。那声音跟以前城市里的噪音一点都不像。',
        flags: ['moved', 'grid']
      }
    ]
  },
  {
    id: 's7_grid_b', stage: 7, day: 1250, slot: 's7hope', order: 2,
    title: '电台里的声音',
    scene: '你在一个废弃的岗亭里发现了一台还能用的电台和一块电瓶。调到某个频率时，里面有人说话——是在念名单。念的是还活着的据点，一个一个念，念完重复一遍。',
    options: [
      {
        text: '回话，报上自己的位置',
        effects: { morale: 12, camp: 6 },
        result: '你按下话键，说了三遍自己的位置。对面沉默了几秒，然后说「记下了，欢迎」。当晚你睡不着，一直在想那个声音是男的还是女的。第二天你开始每天八点守在电台边。',
        flags: ['radio', 'contacts_official']
      },
      {
        text: '只听不说',
        effects: { morale: 6, camp: 2 },
        result: '你每天晚上听十分钟。你听见了很多地名，有些是你去过的。你始终没有按下那个话键——说话就意味着暴露，暴露就意味着有人会来。你把这个习惯保持了两年。',
        flags: ['radio']
      },
      {
        text: '把这台机器拆了，拿走能用的',
        effects: { supply: 6, camp: 4, morale: -4 },
        result: '你把电瓶和电线拆下来搬回去，可以用来点灯。那台电台被你留在了岗亭里，还在响。你走的时候听见它在念第三个名单。'
      }
    ]
  },
  {
    id: 's7_grid_c', stage: 7, day: 1300, slot: 's7hope', order: 2,
    title: '一颗种子',
    scene: '一个跑线的人带来了一小包种子，说是从南边的农业站弄出来的，改良过的，耐旱、产量高。他要价很高，而且要的是你最好的东西。',
    options: [
      {
        text: '换，这是以后',
        effects: { supply: -14, camp: 6, morale: 8 },
        result: '你把压箱底的东西都拿出来了。他走的时候说：「你这个人有点疯。」你把种子分成三份：一份现在种，一份留着，一份给了隔壁。第二年秋天，你收的东西够吃到第三年春天。',
        flags: ['farm', 'seeds_saved']
      },
      {
        text: '不换，现在活下来更重要',
        effects: { supply: 2, morale: -4 },
        result: '你说现在不是想以后的时候。他耸了耸肩，走了。第二年你看见别人家地里长得比你好，才知道那包种子是真的。这个认知来得有点晚。',
        flags: ['short_sighted']
      },
      {
        text: '跟他谈，用消息换一部分',
        effects: { supply: -6, camp: 4, morale: 5 },
        resolve: (s, rng) => {
          if (F(s, 'knows_streets') || F(s, 'route') || F(s, 'trader') || rng() < 0.5) {
            return { text: '你把这一带哪条路能走、哪家还有货、哪个据点好说话，全告诉了他。他给了你一半的种子，还说以后有货先来找你。这买卖你觉得值。', tone: 'good', effects: { camp: 4 }, flags: ['farm', 'seeds_saved', 'knows_trader'] }
          }
          return { text: '你想讲价，但他不吃这一套，最后你只换到了一小把。那一把种下去出了六成苗。也算有了。', tone: 'neutral', effects: { camp: 2 }, flags: ['farm'] }
        }
      }
    ]
  },
  {
    id: 's7_final_choice', stage: 7, day: 1400, pinned: true, order: 3,
    title: '你打算怎么办',
    scene: '第四个秋天的傍晚，你坐在门口。院子里有人在修水管，有孩子在追一只鸡，有人在腌菜。所有声音都很普通。你忽然意识到：不管世界恢不恢复，你的日子大概就是这样了。',
    optPanels: [
      ['守住这里，就这样过下去', '把这里做成一个真正的据点', '收拾东西，去更大的地方'],
      ['看着院子，什么也不做', '立个规矩，让它长久', '往远处看看'],
      ['先过完这个冬天再说', '把这儿建成能留给别人的地方', '走，去看剩下的世界'],
    ],
    options: [
      {
        text: '守住这里，就这样过下去',
        effects: { morale: 8, camp: 6 },
        result: '你没有别的野心，只想让这个院子再撑十年。你开始教年轻的人怎么腌菜、怎么看天气、怎么在冬天里省柴。这些事说出来一点都不壮烈，但它们是文明真正的样子。',
        flags: ['settled', 'stayed_home']
      },
      {
        text: '把这里做成一个真正的据点',
        effects: { camp: 14, morale: 6, supply: -10 },
        result: '你把这一带的人都召集起来，画了一张图：墙要怎么接、水从哪里来、谁家管哪一段。这不是你一个人的院子了。有人当场就叫你「头儿」，你没纠正，也没答应。',
        flags: ['ruled', 'big_camp', 'settled']
      },
      {
        text: '收拾东西，去更大的地方',
        effects: { camp: -10, supply: -10, morale: 4 },
        result: '你把能带的装了两包，把带不走的留给邻居。走的那天早上有点雾，你回头看了一眼自己的门。你没关，因为里面还有人住。你想，走这一趟，至少知道这世界现在什么样了。',
        flags: ['left_home', 'route']
      }
    ]
  },
  {
    id: 's7_last_winter', stage: 7, day: 1450, pinned: true, order: 4,
    title: '第五个冬天',
    scene: '这一次你什么都不慌了。柴备了，菜腌了，药分好了，谁值夜写在了木板上。你甚至给最冷的那个月准备了备用计划。外面很冷，屋里有一盏你自己做的灯。',
    auto: true,
    resolve: (s, rng) => {
      const ok = s.supply >= 15 && s.camp >= 25
      return {
        text: (ok
          ? '这个冬天过得比你想象的平静。有几个晚上你在灯下翻那本旧书，翻到某一页时想起来封城之前自己也读过这一段。当时没觉得有什么，现在觉得每一句都对。'
          : '这个冬天很难。你有两次觉得自己要撑不住了，都被身边的人拉回来了。有一天晚上你在门口坐着，忽然很清楚地感觉到：无论结果是什么，你已经把能做的都做了。'),
        tone: ok ? 'good' : 'neutral',
        effects: ok ? { morale: 8, health: 2 } : { health: -6, morale: -2 }
      }
    }
  }
]

return [].concat(S4, S5, S6, S7)

})
