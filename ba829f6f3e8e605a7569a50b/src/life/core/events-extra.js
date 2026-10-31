/**
 * core/events-extra.js —— 人生模拟器 · 骨架拆分 + 扩充事件池
 *
 * 这里放两类东西：
 *   SKELETON —— 把原来"每局必出"的婚姻/生育节点拆成真实的多条路径：
 *               不婚、晚婚、闪婚、同居、离婚、丧偶、二婚、丁克、不孕、领养、单亲、二胎
 *   POOL     —— 自由池事件（按阶段分组，见文件后半）
 *
 * 只有 SKELETON 是手写节点；POOL 由 FAMILIES 按"情境 × 变体"展开，规模见文件末尾。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.LifeEventsExtra = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const F = (s, f) => s.flags.includes(f)

  /* 和 data.js 里那套判断保持一致 */
  const hasPartner = s => {
    const f = s.flags
    if (f.includes('remarried')) return true
    if (f.includes('divorced') || f.includes('widowed')) return false
    return f.includes('married_love') || f.includes('married_arranged') ||
      f.includes('cold_marriage') || f.includes('cohabit')
  }
  const hasKid = s => s.flags.some(x =>
    x === 'has_child' || x === 'late_child' || x === 'adopted' ||
    x === 'single_parent' || x === 'two_kids')
  const everMarried = s => s.flags.some(x =>
    x === 'married_love' || x === 'married_arranged' || x === 'cold_marriage' || x === 'remarried')

  /* ============================================================
   *  一、婚姻：从"催婚"这一条，拆成六种真实走法
   * ============================================================ */

  const MARRIAGE = [
    {
      // 催婚不止一种：单位、朋友、深夜的自己
      id: 'x_marry_work',
      stage: 5,
      age: 28,
      slot: 'marry_pressure',
      title: '单位的表格',
      scene: '填职工信息表，"婚姻状况"那一栏你停了一下。旁边的同事探头看了一眼，说"你还单着啊"，然后整个办公室都笑了一下。',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '笑着糊过去，回头去相亲',
          textAlt: ['笑着糊过去，回头去相亲', '打个哈哈，周末去见一个', '含糊过去，私下开始找', '笑一笑，回头真去看了两个'],
          effects: { happy: -2, family: 6, cha: 2 },
          flags: ['trying_match'],
          result: '你笑着说"快了快了"。后来真的让家里安排了两次。你发现相亲这件事，最难的不是见人，是承认自己在做这件事。'
        },
        {
          text: '认真说：我不着急',
          textAlt: ['认真说：我不着急', '实话实说，我不急', '跟对方讲清楚：这事我不赶', '把笔放下，说我不着急'],
          effects: { happy: 4, cha: -1, amb: 3 },
          flags: ['waiting_love'],
          result: '你说"我不着急"。办公室安静了一秒，然后有人打圆场。你低头继续填表。你确实不着急，只是每次说这句话，都要重新确认一遍。'
        },
        {
          text: '不接话，把表填完',
          textAlt: ['不接话，把表填完', '不解释，低头写完', '没答，继续填下一栏', '装作没听见，填完就走'],
          effects: { happy: -3, amb: 2 },
          flags: ['marry_avoid'],
          result: '你没接话。表格填完，你把纸递回去。有些问题不回答，也是一种回答——只是别人未必听得懂。'
        }
      ]
    },
    {
      id: 'x_marry_friend',
      stage: 5,
      age: 29,
      slot: 'marry_pressure',
      title: '别人的婚礼',
      scene: '大学最好的朋友结婚，你当伴郎/伴娘。敬酒到第三桌，有人问"下一个是不是你"。全场都在笑，你也笑。',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '笑着说"借你吉言"，心里认真想了一下',
          textAlt: ['笑着说"借你吉言"，心里认真想了一下', '笑着应付，回去却想了很久', '道过谢，把这句话记住了', '嘴上带过，心里过了一遍'],
          effects: { happy: 2, family: 4, amb: 3 },
          flags: ['trying_match'],
          result: '回程的高铁上你一直在想这件事。你列了一下自己认识的人，发现没有一个可以走到那一步。这个发现比"被催"更让人清醒。'
        },
        {
          text: '看着新人，觉得这样也挺好',
          textAlt: ['看着新人，觉得这样也挺好', '看了一会儿，觉得挺好', '鼓了掌，也真心高兴', '看着他们，没觉得缺什么'],
          effects: { happy: 5, family: -4 },
          flags: ['waiting_love'],
          result: '你看着他们在台上哭，忽然觉得这件事很好，但不是必须发生在自己身上。你为他们高兴，也为自己松了一口气。'
        },
        {
          text: '散场后一个人走了很久',
          textAlt: ['散场后一个人走了很久', '散场后没坐车，走了两站', '一个人走回家', '散场后绕着街走了一圈'],
          effects: { happy: -4, cha: 2, amb: 2 },
          flags: ['marry_avoid'],
          result: '你没跟大部队去唱歌，一个人沿着马路走了两公里。夜里风很凉。你不是难过，只是那种"所有人都上了车，只有你还在站台"的感觉，很少这么清楚。'
        }
      ]
    },
    {
      id: 'x_marry_reunion',
      stage: 5,
      age: 30,
      slot: 'marry_pressure',
      title: '同学聚会',
      scene: '十年同学聚会，一张圆桌坐满了人。有人带孩子来，有人带了另一半。吃到一半，班长挨个问"你呢"，问到你的时候，全桌都安静了一下。',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '说"还没遇到合适的"，回家就下了相亲软件',
          effects: { amb: 4, happy: -2, cha: 3 },
          flags: ['trying_match'],
          result: '软件上聊了七个，见了两个，都没下文。你把这件事当成了一个项目在推进，每周固定花两个晚上。三个月后你删掉了软件，但那时你已经知道自己努力过了。'
        },
        {
          text: '笑着说"我一个人挺好的"',
          effects: { happy: 6, cha: 3, family: -5 },
          flags: ['waiting_love'],
          result: '你说完，有人接了一句"那是还没到年纪"。你没辩。回去的路上你想：一个人好不好，其实自己最清楚，不需要在饭桌上被认可。'
        },
        {
          text: '找借口提前走了',
          effects: { happy: -5, cha: -2, amb: 2 },
          flags: ['marry_avoid'],
          result: '你说家里有事，把单买了就走了。走出饭店，街上很亮，你站了一会儿才发现自己没地方想去。'
        }
      ]
    },
    {
      id: 'x_marry_rent',
      stage: 5,
      age: 32,
      slot: 'marry_pressure',
      title: '两居室一个人住',
      scene: '房东带人来看隔壁，进门第一句是"你一个人住这么大？"你说嗯。他又问"家里人不来住？"',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '说"父母偶尔来"，把话岔开',
          effects: { happy: -2, cha: 2 },
          flags: ['marry_avoid'],
          result: '你说完就回屋了。关上门听见他们在外面说话，声音很小。你忽然意识到，你已经很熟练地替自己解释了，熟练到不用想。'
        },
        {
          text: '开玩笑说"给未来的留的"',
          effects: { happy: 4, cha: 4, amb: 3 },
          flags: ['waiting_love'],
          result: '对方笑了，说"那得抓紧"。你也笑。晚上你坐在空着的那个房间里，忽然想，这间屋子确实一直是空的，连箱子都没放过。'
        },
        {
          text: '认真想了一晚上，第二天开始认真找',
          effects: { amb: 6, happy: 1, cha: 2 },
          flags: ['trying_match'],
          result: '你把这件事写进了日程，像健身一样打卡。见了六个人，有两个聊得来。你后来跟朋友说：原来找对象这事，认真起来是有用的，只是不那么浪漫。'
        }
      ]
    },
    {
      id: 'x_marry_self',
      stage: 5,
      age: 30,
      slot: 'marry_pressure',
      title: '凌晨两点',
      scene: '你睡不着，翻到一个很多年没联系的同学，孩子已经上小学了。你退出来，又点进去，又退出来。手机的光照在天花板上。',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '第二天就开始认真找',
          textAlt: ['第二天就开始认真找', '第二天就去见人', '认真张罗起来', '开始主动认识人'],
          effects: { amb: 5, happy: -2, cha: 2 },
          flags: ['looking'],
          result: '你开始认真对待这件事：让朋友介绍，去参加活动，把软件重新下回来。你不再等"感觉"，你想先见到人。'
        },
        {
          text: '关掉手机，告诉自己别被比较绑住',
          textAlt: ['关掉手机，告诉自己别被比较绑住', '把手机扣过来，先睡', '不看了，各有各的时区', '关屏，第二天照常上班'],
          effects: { happy: 6, amb: 3 },
          flags: ['single_ok'],
          result: '你把手机放到客厅，回床上躺着。你告诉自己：别人的人生进度不是你的考卷。这句话你信了一半，另一半要慢慢来。'
        },
        {
          text: '给一个很久没联系的人发消息',
          textAlt: ['给一个很久没联系的人发消息', '翻出那个熟悉的头像', '给 ta 发了句"最近好吗"', '点开对话框，写了又删'],
          effects: { cha: 3, happy: 1 },
          flags: ['looking'],
          result: '你发了一句"好久不见"。对方第二天回了个表情。你们聊了几句，就没了。但你发现自己还敢开口，这件事本身就让你好受了一些。'
        }
      ]
    },
    {
      // 相亲的结局：不是"相亲了就结婚"，中间隔着一整年
      id: 'x_match_result',
      stage: 5,
      age: 30,
      order: -5,
      always: true,
      title: '第十一个',
      scene: '这一年你见了十个人。有的一坐下就问收入，有的全程在讲前任，有的挺正常，只是你没什么感觉。第十一个说："我觉得你挺好的，要不要试试？"',
      sceneAlt: [
        '相到第六个。这次对方条件很好，聊得也不错，临走时他说"我回去想想"。你听懂了这句话的意思，也笑了一下。',
        '介绍人问你"怎么样"，你说"还行"。她说"还行就是行"，第二天就安排了双方父母见面。你想拦，没拦住。',
        '你们见了三次，第四次对方带了父母来。你忽然意识到这不是谈恋爱，这是谈判，而你是唯一没带筹码的那一方。',
        '你妈把你的照片要走了，说要给人家看看。你问哪张，她说"那张穿红衣服的"。那张是五年前拍的。',
        '这次见面约在茶楼。对方全程在算两个人的收入、房贷、老人，算得很清楚。你听着，觉得像在开一个关于自己的会。'
      ],
      cond: s => F(s, 'trying_match') && !hasPartner(s) && !hasKid(s),
      options: [
        {
          text: '试试。合适比喜欢重要',
          effects: { happy: 2, family: 10, money: -6 },
          resolve(s, rng) {
            if (s.cha * 0.3 + s.family * 0.3 + rng() * 40 > 30) {
              s.flags.push('married_arranged')
              return {
                tone: 'neutral',
                effects: { happy: 5 },
                text: '你们处了半年，双方家里都满意，就把事定了。ta 不讨厌，你也不讨厌 ta。婚后你们像两个配合默契的同事，把日子过得井井有条。你偶尔会想"心动是什么感觉"，想完就睡了。'
              }
            }
            s.flags.push('single_long')
            return {
              tone: 'bad',
              effects: { happy: -8 },
              text: '处了三个月，你发现自己一直在演。你提了分开，对方说"我就知道"。介绍人来问原因，你说"没感觉"。她说"感觉能当饭吃吗"。你没回答。'
            }
          }
        },
        {
          text: '再挑挑，不着急',
          effects: { amb: 4, happy: -2, family: -4 },
          flags: ['picky'],
          resolve(s, rng) {
            if (rng() > 0.42) {
              s.flags.push('married_arranged', 'late_marry')
              return {
                tone: 'neutral',
                effects: { happy: 6, family: 6 },
                text: '又挑了两年，你三十三岁那年结的婚。对方条件比前面几个都好，也更能聊。你后来想，如果早两年遇到，可能反而看不上——人是会变的，包括眼光。'
              }
            }
            s.flags.push('single_long')
            return {
              tone: 'neutral',
              effects: { happy: -3 },
              text: '你一直挑到三十五岁。介绍的人越来越少，条件也越来越不对。你不再生气，只是每年过年那顿饭，你吃得越来越快。'
            }
          }
        },
        {
          text: '算了，先躲开这件事',
          effects: { happy: 3, family: -6, amb: 3 },
          flags: ['marry_avoid'],
          result: '你跟你妈说"这事以后再说"。她哭了，你没松口，也没把话说死。你发现三十岁以后，最难的不是结婚，是承认自己到底想不想要。'
        }
      ]
    },
    {
      // 等爱的结局：等到了，或者等成了习惯
      id: 'x_love_result',
      stage: 5,
      age: 30,
      order: -5,
      always: true,
      title: '那个人出现了吗',
      scene: '你二十九岁那年遇到一个人。说不上多好，但你在 ta 面前不用演。你不确定这是不是"喜欢"，你只知道，下班的时候你会想给 ta 发消息。',
      cond: s => F(s, 'waiting_love') && !hasPartner(s) && !hasKid(s),
      options: [
        {
          text: '主动一次，把话说清楚',
          textAlt: ['主动一次，把话说清楚', '这次自己先开口', '把话讲明白', '不等了，自己说'],
          effects: { cha: 5, happy: 3 },
          resolve(s, rng) {
            if (s.cha * 0.45 + s.luk * 0.35 + rng() * 35 > 42) {
              s.flags.push('dating', 'married_love')
              return {
                tone: 'good',
                effects: { happy: 13, health: 3 },
                text: '你先开的口。ta 愣了一下，说"我以为你不喜欢我"。你们在一起了。后来你常想，如果那天你没说，会不会就这么错过了——很多人一辈子，就差那一句。'
              }
            }
            return {
              tone: 'bad',
              effects: { happy: -9 },
              text: 'ta 说"你很好，但我现在不想谈"。你笑着说没事。半年后 ta 有了别人。你把这件事消化了很久，最后得出的结论是：不是我不够好，是时间不对。这个结论让你好受了一点。'
            }
          }
        },
        {
          text: '再等等，看 ta 会不会先开口',
          textAlt: ['再等等，看 ta 会不会先开口', '等 ta 主动', '不动，看对方反应', '拖着，谁先说谁输'],
          effects: { happy: -3, amb: -2 },
          resolve(s, rng) {
            if (rng() > 0.5) {
              s.flags.push('dating', 'married_love')
              return {
                tone: 'good',
                effects: { happy: 10 },
                text: 'ta 先开口的。在一个很普通的晚上，ta 说"我们这样算什么呢"。你笑了，说"算在一起吧"。你们都比想象中胆小，也都比想象中幸运。'
              }
            }
            s.flags.push('single_long')
            return {
              tone: 'neutral',
              effects: { happy: -6 },
              text: '你们一直是朋友。后来 ta 结婚了，请了你。你在婚礼上举杯，说了句"祝你幸福"，说完发现自己是真心的。回去的路上你走得很慢。'
            }
          }
        },
        {
          text: '不试了。一个人也没什么不好',
          textAlt: ['不试了。一个人也没什么不好', '算了，还是一个人', '到此为止', '不往前走了'],
          effects: { happy: 4, amb: 3, family: -6 },
          flags: ['marry_avoid'],
          result: '你没有再往前走。三十岁那年你把生活重排了一遍：工作、健身、两只猫、每年一次长途旅行。你妈后来跟亲戚说"我女儿过得挺好"，语气里有一点点认命，也有一点点骄傲。'
        }
      ]
    },
    {
      // 含糊了三年的人，总要有个交代
      id: 'x_marry_avoid',
      stage: 5,
      age: 31,
      always: true,
      title: '含糊了三年',
      scene: '你妈不再催了，改成每次打电话都叹气。你发现自己三十六岁还单着，却想不起是哪一天变成这样的。',
      cond: s => F(s, 'marry_avoid') && !hasPartner(s),
      options: [
        {
          text: '开始认真找，这次是给自己找',
          textAlt: ['开始认真找，这次是给自己找', '不再拖了，认真找', '这一次为自己找', '主动起来'],
          effects: { amb: 4, happy: 2, family: 4 },
          flags: ['looking'],
          resolve(s, rng) {
            if (s.cha * 0.35 + s.luk * 0.3 + rng() * 40 > 40) {
              s.flags.push('married_love', 'late_marry')
              return {
                tone: 'good',
                effects: { happy: 10, family: 6 },
                text: '你三十二岁结的婚。对方不是最理想的那种，但你们能一起把一件无聊的事聊得有意思。你在婚礼上说"我耽误了几年"，ta 说"没关系，我等你来了"。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -4 },
              text: '你试了一年，见了七八个人，没有成的。你后来说"可能我就是不适合结婚"。这句话第一次说的时候有点涩，说多了就顺了。'
            }
          }
        },
        {
          text: '接受自己就是不想结',
          textAlt: ['接受自己就是不想结', '认了，我就是不结', '承认这件事，别再演', '跟家里说清楚'],
          effects: { happy: 7, amb: 3, family: -8 },
          flags: ['single_by_choice'],
          result: '你终于跟自己承认：不是找不到，是不想找。这个承认让你轻松了很多。你妈后来也不叹气了，只是偶尔会说"你以后怎么办"。你说"到时候再说"。'
        },
        {
          text: '让家里安排，成不成看命',
          textAlt: ['让家里安排，成不成看命', '交给家里张罗', '听他们的，见谁算谁', '随他们安排'],
          effects: { family: 6, happy: -4 },
          resolve(s, rng) {
            if (rng() > 0.4) {
              s.flags.push('married_arranged')
              return {
                tone: 'neutral',
                effects: { happy: 4, family: 10 },
                text: '家里安排了一个，条件都合适。你们见了三次就把事定了。婚后你发现，合适这件事其实很扛用——不吵、不闹、不期待，也就不会失望。'
              }
            }
            s.flags.push('single_long')
            return {
              tone: 'bad',
              effects: { happy: -8, family: -4 },
              text: '见了五六个，都没成。你妈这次真的不催了。你反而有点慌——原来被人催，也是一种"还有人管你"的证明。'
            }
          }
        }
      ]
    },
    {
      // 生孩子的时间窗口：三十二岁没结婚的人，三十七岁还得再问一次
      id: 'x_baby_late',
      stage: 6,
      age: 37,
      always: true,
      title: '还要不要',
      scene: '你们结婚晚。医生说"女方这个年龄，属于高龄了"。你算了一下：孩子上大学的时候，你已经快六十。',
      cond: s => hasPartner(s) && !hasKid(s) && !F(s, 'dink') && !F(s, 'kid_pending'),
      options: [
        {
          text: '要。晚有晚的养法',
          effects: { money: -14, health: -8, happy: 8, family: 10 },
          flags: ['has_child', 'late_child'],
          result: '孩子出生那天你已经三十八。你抱着他在走廊走，护士说"爸爸小心"。你听见"爸爸"两个字愣了一下——这个称呼你等了很久，久到自己都不太敢信。'
        },
        {
          text: '不要了。这个年纪，风险太大',
          effects: { happy: 4, money: 12, family: -10 },
          flags: ['dink'],
          result: '你们决定不要。两边老人很失望，你妈说"再想想"，你说"想过了"。后来你们养了条狗。每年过年，亲戚不再问孩子，改问狗。你觉得这样也挺好。'
        },
        {
          text: '试试，有了就要',
          effects: { happy: 2, health: -4 },
          resolve(s, rng) {
            if (s.con > 55 && rng() > 0.45) {
              s.flags.push('has_child', 'late_child', 'high_risk_birth')
              return {
                tone: 'good',
                effects: { happy: 10, money: -18, health: -6 },
                text: '怀上了。整个孕期你都在查资料，把每一种风险都看了一遍。孩子生下来很健康，你在产房外面坐了很久，才想起要给家里打电话。'
              }
            }
            s.flags.push('dink')
            return {
              tone: 'neutral',
              effects: { happy: -3 },
              text: '试了一年，没怀上。医生说"顺其自然吧"。你们没有再去医院。有一天你忽然发现，家里安静得很好，你们也过得很好。'
            }
          }
        }
      ]
    },
    {
      // 30 岁还一个人：不是所有人都在这条路上卡住，但卡住的人各有各的卡法
      id: 'x_single_30',
      stage: 5,
      age: 30,
      always: true,
      title: '三十岁的蛋糕',
      scene: '你给自己买了个四寸的蛋糕，插了一根蜡烛。点着之后你才想起来，忘了买打火机——是用灶台点的。屋里很安静，冰箱在响。',
      sceneAlt: [
        '你妈打电话来，说"今天三十了吧"，然后停了三秒，问"吃长寿面没有"。你说吃了。其实你正在加班，桌上是一盒凉了的炒饭。',
        '朋友约你吃饭，来了一桌人，都是成双的。他们聊孩子上学、学区、谁家老人住院，你插不上话，就一直给火锅加菜。',
        '体检表上那个"30"你看了两遍。医生例行问"有生育计划吗"，你说"暂时没有"。这个"暂时"，你已经说了五年。',
        '生日那天你请了半天假，一个人去看了场电影。散场时天还亮着，你站在商场门口，忽然不知道该往哪走。',
        '你把租的房子重新收拾了一遍，扔掉两个箱子，又买了盆绿植。做完这些你坐在沙发上想：这算不算在过日子。'
      ],
      cond: s => !hasPartner(s) && !s.flags.includes('dating') && !s.flags.includes('single_by_choice'),
      options: [
        {
          text: '把一个人的日子过好',
          textAlt: ['把一个人的日子过好', '一个人也好好过', '先把日子过顺', '不为这件事着急'],
          effects: { happy: 7, health: 3, money: 3, amb: 2 },
          flags: ['single_ok'],
          result: '你开始认真做饭，周末去爬山，把阳台收拾出来种了葱。你发现一个人过得好，是需要练的——练了两年，你练成了。'
        },
        {
          text: '打开软件，认真找',
          textAlt: ['打开软件，认真找', '下载软件，开始见人', '认真去相亲', '主动一点，多去见几个'],
          effects: { amb: 4, happy: -2, cha: 2 },
          flags: ['looking'],
          result: '你下了三个软件，写了很长的自我介绍，删掉又重写。见了九个人，有六个聊不到第二顿。你没觉得丢人，只是有点累。'
        },
        {
          text: '给家里打个电话',
          textAlt: ['给家里打个电话', '给爸妈打个电话', '拨回去，听我妈说两句', '打回家，说点别的'],
          effects: { family: 8, happy: -3 },
          result: '你妈接的，先问你吃饭没有，然后才问"有没有情况"。你说没有。她停了两秒，说"没事，慢慢来"——那两秒比后面那句话重。'
        }
      ]
    },
    {
      // 晚婚：三十三岁遇到的人，和二十五岁遇到的不一样
      id: 'x_love_late',
      stage: 5,
      age: 33,
      always: true,
      title: '同学介绍的人',
      scene: '同学说"我认识一个，人挺好的，就是话少"。见面那天对方确实话少，直到你说起一本旧书，他眼睛亮了一下，说"你也看过这本"。',
      sceneAlt: [
        '介绍人说"这个条件不错，就是离过一次婚"。你说没关系。见面那天对方带着孩子来的，那孩子一直盯着你看，看了整顿饭。',
        '你在婚恋网站上填资料，填到"期望对方"那一栏，停了很久，最后只写了三个字：聊得来。',
        '你们在同一栋楼上班，认识了六年。有一天电梯坏了，你们一起爬了十八层，那是你们说话最多的一次。',
        '同学聚会上有人问"你还没结啊"。你说"快了"。说完自己愣了一下——你不知道这个"快了"是从哪儿来的。',
        '你去参加一个朋友孩子的满月酒。席间有人给你介绍对象，你笑着加了微信，回去后一直没点开那个头像。'
      ],
      cond: s => !hasPartner(s) && !hasKid(s) && !s.flags.includes('single_by_choice'),
      options: [
        {
          text: '再见一次',
          textAlt: ['再见一次', '约第二次', '再见一面看看', '再处一处'],
          effects: { happy: 6, cha: 2 },
          resolve(s, rng) {
            if (s.cha * 0.4 + s.luk * 0.4 + rng() * 30 > 45) {
              s.flags.push('married_love', 'late_marry')
              return {
                tone: 'good',
                effects: { happy: 12, family: 6 },
                text: '你们谈了八个月，领了证。婚礼办得很小，只请了两桌。你在敬酒的时候想：原来晚一点遇到，也不是坏事——你终于知道自己要什么了。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: 1 },
              text: '第二次见面聊得还行，第三次就没话了。你们礼貌地不再联系。介绍人来问，你说"挺好的，就是不太合适"。这句话你说过很多次，越说越熟练。'
            }
          }
        },
        {
          text: '把话说明白：我是奔着结婚来的',
          textAlt: ['把话说明白：我是奔着结婚来的', '摊开说：我要的是结婚', '直接问 ta 想不想定下来', '把目的摆到桌上'],
          effects: { cha: -3, happy: 2, amb: 3 },
          resolve(s, rng) {
            if (rng() > 0.45) {
              s.flags.push('married_arranged', 'late_marry')
              return {
                tone: 'good',
                effects: { happy: 7, family: 8 },
                text: '对方愣了一下，然后说"我也是"。你们像谈项目一样把条件摆开：房子、父母、要不要孩子。谈完发现都能对上。半年后你们结婚了。'
              }
            }
            return {
              tone: 'bad',
              effects: { happy: -6 },
              text: '对方说"太快了"。你们又见了两次，然后没了。你后来想，也许不是快，是他还没想清楚——而你已经没时间陪人想了。'
            }
          }
        },
        {
          text: '算了，一个人也挺好',
          textAlt: ['算了，一个人也挺好', '不折腾了，这样也行', '到此为止，我一个人也过得下去', '谢过介绍人，不再见'],
          effects: { happy: 3, amb: 2, family: -5 },
          flags: ['single_by_choice'],
          result: '你没有再联系。三十五岁那年你把房子重新装了一遍，全按自己的喜好。你妈来看了一次，走的时候说"你这日子，比我想的好"。'
        }
      ]
    },
    {
      // 闪婚：认识三个月就领证，赌的是判断力
      id: 'x_flash_marry',
      stage: 5,
      age: 29,
      always: true,
      title: '三个月',
      scene: '认识第八十九天，对方说"要不我们把证领了"。你说好。你妈在电话里问"你了解他吗"，你说"了解得差不多了"。',
      cond: s => !hasPartner(s) && (s.flags.includes('dating') || s.flags.includes('looking')),
      options: [
        {
          text: '领。感觉对了就行',
          effects: { happy: 8, money: -8, family: 4 },
          resolve(s, rng) {
            if (s.cha * 0.3 + s.luk * 0.7 + rng() * 30 > 62) {
              s.flags.push('married_love', 'flash_marry')
              return {
                tone: 'good',
                effects: { happy: 8 },
                text: '婚后第一年你们吵得很凶，第二年慢慢磨出了规矩：谁生气谁先出门走一圈。第五年你发现，你们已经能不说话也不尴尬了。'
              }
            }
            s.flags.push('married_love', 'flash_marry', 'cold_marriage_fast')
            return {
              tone: 'bad',
              effects: { happy: -10, money: -6 },
              text: '第三个月你就发现有些东西不对，但证已经领了。你们客客气气地过，像合租的两个人。你偶尔想，当初那三个月的"对"，到底是什么在起作用。'
            }
          }
        },
        {
          text: '再等等，至少处满一年',
          effects: { happy: 3, amb: 3, cha: -2 },
          resolve(s, rng) {
            if (rng() > 0.5) {
              s.flags.push('married_love')
              return {
                tone: 'good',
                effects: { happy: 9 },
                text: '一年后你们领了证。这一年里你们见过彼此最难过的样子——加班到凌晨、生病、和家里吵架。看完这些还想结，你才敢结。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -4 },
              text: '处到第八个月，你们慢慢凉了。分手那天很平静。你有点庆幸，也有点失落——原来"再等等"有时候是救你，有时候是拖你。'
            }
          }
        }
      ]
    },
    {
      // 双方家里不同意
      id: 'x_marry_oppose',
      stage: 5,
      age: 28,
      always: true,
      title: '两边都不同意',
      scene: '你妈说"她家那个条件，你以后要吃苦"，对方的爸爸说"你们家连套房都没有"。你们坐在公园长椅上，谁都没说话。',
      cond: s => F(s, 'dating') && !hasPartner(s),
      options: [
        {
          text: '坚持。日子是我们过',
          effects: { family: -14, happy: 10, money: -6, amb: 5 },
          flags: ['married_love', 'family_opposed'],
          result: '你们自己凑了首付，婚礼只请了朋友。头三年过得很紧，过年两边都不太想回。第五年你妈来住了半个月，走的时候说"他对你还行"。就这一句，你等了五年。'
        },
        {
          text: '听家里的，分了',
          effects: { family: 10, happy: -12, amb: -4 },
          result: '你分了。后来你按家里的意思结了婚，条件都对得上。有几次你在超市看到类似的身影，会愣一下，然后推着车继续走。'
        },
        {
          text: '拖着，谁也不得罪',
          effects: { happy: -6, amb: -2, family: -3 },
          resolve(s, rng) {
            if (rng() > 0.5) {
              s.flags.push('married_love')
              return {
                tone: 'neutral',
                effects: { happy: 4, family: 2 },
                text: '拖了两年，两边都累了，也就默认了。你们结了婚，婚礼上两边老人笑着敬酒，像什么都没发生过。你知道不是没有发生过，只是大家决定不提。'
              }
            }
            return {
              tone: 'bad',
              effects: { happy: -8 },
              text: '拖到第三年，对方先撑不住了。她说"我不想再等你家里点头"。你没能留住。有些事拖着不是解决，是把决定权交给时间——而时间不站在你这边。'
            }
          }
        }
      ]
    },
    {
      // 同居不领证
      id: 'x_cohabit',
      stage: 5,
      age: 31,
      always: true,
      title: '住在了一起，没领证',
      scene: '你们住在一起两年，水电费谁交都记不清了。亲戚问"什么时候办"，你说"不急"。其实你们谁都没提过这件事。',
      cond: s => F(s, 'dating') && !hasPartner(s),
      options: [
        {
          text: '提一次，把话摊开',
          effects: { cha: 4, happy: 3 },
          resolve(s, rng) {
            if (rng() > 0.4) {
              s.flags.push('cohabit')
              return {
                tone: 'neutral',
                effects: { happy: 6, money: 2 },
                text: '谈完你们决定就这样：不领证，但把钱、把照顾、把以后都说清楚。你妈知道后气了很久，后来也就算了。你说"我们不是不认真，是不需要那张纸来证明"。'
              }
            }
            s.flags.push('cohabit')
            return {
              tone: 'bad',
              effects: { happy: -8 },
              text: '对方说"我以为我们不需要谈这个"。那一晚你们第一次发现，两个人对同一段关系的理解可以差这么远。你们还住在一起，但有些东西变了。'
            }
          }
        },
        {
          text: '去把证领了',
          effects: { happy: 8, family: 6, money: -4 },
          flags: ['married_love'],
          result: '你们挑了个工作日，排了四十分钟队。拍照的时候摄影师说"靠近一点"，你们都笑了。证拿到手，你发现日子并没有什么变化——但心里那点悬着的东西，落地了。'
        },
        {
          text: '先这样，挺好',
          effects: { happy: 2, amb: -1 },
          flags: ['cohabit'],
          result: '你们继续这样过着。省事，也自由。只是每次填表，"婚姻状况"那一栏你都要停一下。'
        }
      ]
    },
    {
      // 离婚：不是一件事，是一个过程
      id: 'x_divorce',
      stage: 6,
      age: 38,
      always: true,
      title: '三个月没说话',
      scene: '你们已经三个月没有正经说过话。家务各做各的，孩子的事用微信沟通。那天对方说"我们谈谈"，你心里其实已经知道了。',
      cond: s => hasPartner(s) && !F(s, 'divorced'),
      options: [
        {
          text: '离。别耗了',
          effects: { money: -22, happy: -8, health: -4, amb: 4 },
          flags: ['divorced'],
          result: '办手续那天很快，四十分钟。出来的时候太阳很好，你们各自打了一辆车。你在车上忽然想哭，不是因为舍不得，是因为那十年就这么被两个章盖完了。'
        },
        {
          text: '为了孩子，凑合过',
          effects: { happy: -12, health: -3, family: 4 },
          flags: ['cold_marriage'],
          result: '你们没离。家里的气氛像一间常年不开窗的屋子。孩子后来在作文里写"我爸爸妈妈从来不吵架"——老师夸他家庭和睦，你看着那行字，坐了很久。'
        },
        {
          text: '一起去做咨询，试半年',
          effects: { money: -5, happy: 2, cha: 3 },
          resolve(s, rng) {
            if (s.cha * 0.4 + rng() * 50 > 48) {
              return {
                tone: 'good',
                effects: { happy: 10, family: 3 },
                text: '咨询做了十一次。有一次咨询师让你们各自说"我需要什么"，你们都说不出。回来后你们试着说，说着说着就哭了。半年后你们没离，日子也没变好多少，但能说话了。'
              }
            }
            s.flags.push('divorced')
            return {
              tone: 'bad',
              effects: { happy: -6, money: -18 },
              text: '咨询做到第五次，对方说"我来只是为了确认一下"。你们还是离了。但这次离得比一开始体面：财产分得清楚，孩子的事写进了协议。有些结束，是可以不撕破脸的。'
            }
          }
        }
      ]
    },
    {
      // 二婚
      id: 'x_second_marry',
      stage: 6,
      age: 46,
      always: true,
      title: '再结一次',
      scene: '有人给你介绍。见面那天对方也离过婚，聊起孩子的时候都很小心。你犹豫的不是这个人，是"再结一次"这件事本身。',
      cond: s => (F(s, 'divorced') || F(s, 'widowed')) && !hasPartner(s),
      options: [
        {
          text: '结。人对了就行',
          effects: { happy: 10, money: -6, family: 2 },
          flags: ['remarried'],
          result: '第二次婚礼你只请了至亲。你在敬酒时说了句"这次我知道该怎么过了"，桌上有几个人笑了，有几个人没笑。你都看见了。'
        },
        {
          text: '在一起，但不领证',
          effects: { happy: 7, money: 4, family: -4 },
          flags: ['cohabit'],
          result: '你们各住各家，周末在一起。生病了互相照应，钱各管各的，孩子的事互不插手。有人说这不叫过日子，你说"我这个年纪，最怕的就是再算一次账"。'
        },
        {
          text: '不找了，一个人清静',
          effects: { happy: 4, health: 2, family: -3 },
          flags: ['single_after_loss'],
          result: '你把家里的旧东西清了一遍，扔掉了很多。清完那天你坐在空出来的地方喝茶，觉得屋子大了，也静了。'
        }
      ]
    },
    {
      // 丧偶：中年最重的一件事，放在轮换组里，不是每局都有
      id: 'x_widow',
      stage: 6,
      age: 52,
      slot: 'mid_loss',
      chance: 0.35,
      title: '医院走廊',
      scene: '医生出来的时候摘了口罩，你就知道结果了。后面的事你记得很碎：签字、打电话、有人扶你坐下。',
      cond: s => hasPartner(s),
      options: [
        {
          text: '把日子按原来的样子过下去',
          effects: { happy: -14, health: -6, family: 4 },
          flags: ['widowed'],
          result: '你还是每天六点起，还是买两个人的菜，只是吃一半。邻居劝你搬去和孩子住，你说不用。你不是走不出来，你只是不想让那个位置空得太快。'
        },
        {
          text: '搬去和孩子住',
          effects: { happy: -6, health: 4, family: 8, money: -4 },
          flags: ['widowed', 'moved_to_kid'],
          result: '你搬过去了，把老房子租了出去。孙辈很吵，你睡不好，但屋里有人声。有天晚上你听见孩子夫妻俩在厨房小声说话，忽然觉得自己像个客人。'
        },
        {
          text: '出去走一年',
          effects: { money: -12, happy: 2, health: -2, amb: -4 },
          flags: ['widowed', 'traveled_alone'],
          result: '你把该办的事办完，买了张长途车票。走了七个省，拍了很多照片，一张都没发。一年后你回来，邻居说你黑瘦了，也精神了。'
        }
      ]
    }
  ]

  /* ============================================================
   *  二、生育：要 / 不要 / 要不上 / 再要一个 / 一个人带
   * ============================================================ */

  const FERTILITY = [
    {
      id: 'x_kid_try',
      stage: 5,
      age: 34,
      always: true,
      title: '三年过去了',
      scene: '"再等两年"说到第三年，你们终于坐下来认真谈。检查做了一圈，医生说"你们这个年龄，自然怀上的概率不算高"。诊室外面坐着一排人，都低着头看手机。',
      cond: s => hasPartner(s) && !hasKid(s) && !F(s, 'dink') && F(s, 'kid_pending'),
      options: [
        {
          text: '做试管，一次一次试',
          effects: { money: -25, health: -8, happy: -4 },
          resolve(s, rng) {
            if (s.con * 0.3 + s.luk * 0.3 + rng() * 45 > 52) {
              s.flags.push('has_child', 'ivf_child')
              return {
                tone: 'good',
                effects: { happy: 14, family: 8 },
                text: '第三次成功了。取卵、移植、卧床、验血，每一步你都记得。孩子出生那天你哭得比谁都厉害——不是因为高兴，是因为那两年太长了。'
              }
            }
            s.flags.push('dink', 'ivf_failed')
            return {
              tone: 'bad',
              effects: { happy: -14, money: -10 },
              text: '第四次失败后，你们不做了。不是因为钱，是因为你发现自己开始害怕去医院的那条路。你们决定停在这里。这个决定没有人恭喜，但你们都知道它有多难。'
            }
          }
        },
        {
          text: '考虑领养',
          effects: { money: -8, happy: 4, family: 4 },
          resolve(s, rng) {
            if (rng() > 0.35) {
              s.flags.push('adopted')
              return {
                tone: 'good',
                effects: { happy: 12, family: 6 },
                text: '手续办了一年多。孩子来的时候四岁，很瘦，不怎么说话。半年后有一天他忽然叫了你一声，你在厨房站着没动，怕一转身他就改口。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -4 },
              text: '条件不符合，或者你们在中途退了。那叠材料现在还放在柜子最上层，你没扔，也没再看。'
            }
          }
        },
        {
          text: '接受没有孩子这件事',
          effects: { happy: 3, money: 10, family: -8 },
          flags: ['dink'],
          result: '你们把这件事谈开了，谈了好几次。最后一次是在海边，说完两个人都松了口气。往后每年过年，亲戚问"怎么还不要"，你们就说"不打算要了"。说第三年的时候，已经不用互相看一眼了。'
        }
      ]
    },
    {
      id: 'x_kid_second',
      stage: 5,
      age: 34,
      always: true,
      title: '再要一个吧',
      scene: '老人说"一个孩子太孤单，将来连个商量的人都没有"。你算了算房贷、老人的身体、还有自己三十四岁的体力。',
      cond: s => hasKid(s) && !F(s, 'two_kids'),
      options: [
        {
          text: '要。趁还能带得动',
          effects: { money: -18, health: -8, happy: 4, family: 8 },
          flags: ['two_kids'],
          result: '老二出生那年你三十七。夜里喂奶的时候你抱着孩子在客厅走，走到第三圈忽然想起老大也是这么大。你有点想哭，但不敢出声，怕吵醒屋里的人。'
        },
        {
          text: '不要。一个就够了',
          effects: { happy: 6, money: 12, family: -6 },
          flags: ['one_child'],
          result: '你们决定不要。老人念了两年，后来也不念了。老大上小学那年，你在家长会上看到别人家两个孩子打闹，心里动了一下，很快又平了。'
        },
        {
          text: '看身体，能要就要',
          effects: { happy: 2, health: -3 },
          resolve(s, rng) {
            if (s.con > 58 && rng() > 0.4) {
              s.flags.push('two_kids')
              return {
                tone: 'good',
                effects: { happy: 6, money: -14 },
                text: '第二年怀上了。你比第一胎小心得多，也比第一胎累得多。孩子生下来很健康，你抱着他坐在床边，觉得运气这个东西，有时候真的会用完，有时候还没用完。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -3 },
              text: '试了一年没怀上，医生说年龄到了。你们没有再折腾。有些事不是努力就能成，这个道理你三十岁就懂了，只是没想到会用在生孩子上。'
            }
          }
        }
      ]
    },
    {
      id: 'x_single_parent',
      stage: 6,
      age: 40,
      always: true,
      title: '孩子问的那句话',
      scene: '孩子七岁，问你："爸爸为什么不回家？"你手里的碗停在水里。你想了很多次这个时刻该怎么答，真到了的时候，脑子是空的。',
      cond: s => F(s, 'divorced') && hasKid(s),
      options: [
        {
          text: '如实说，但不让他恨',
          effects: { happy: 2, cha: 4, family: 2 },
          flags: ['single_parent'],
          result: '你说"我们两个没办法一起生活了，但他还是你爸爸"。孩子没吭声，回房间了。半年后他忽然说"妈，你不用觉得对不起我"。你转过身去擦了下手。'
        },
        {
          text: '说"他出差了"，先糊过去',
          effects: { happy: -6, family: -3 },
          flags: ['single_parent'],
          result: '这句话你说了三年。孩子后来自己知道了，是同学说的。他没有问你，只是有段时间不太爱说话。你后来想，孩子比你以为的能扛，只是不该让他一个人扛。'
        },
        {
          text: '为了孩子，去谈复婚',
          effects: { family: 6, happy: -8, money: -4 },
          resolve(s, rng) {
            if (rng() > 0.6) {
              s.flags = s.flags.filter(x => x !== 'divorced')
              s.flags.push('remarried', 'reconciled')
              return {
                tone: 'neutral',
                effects: { happy: 2 },
                text: '你们复婚了。理由很实际：孩子、房贷、两边老人。日子比离婚前平静，也比离婚前客气。你不知道这算不算好，但你不再半夜一个人坐在客厅了。'
              }
            }
            return {
              tone: 'bad',
              effects: { happy: -10 },
              text: '对方已经有了别人。你在电话里说"我就是问问孩子的接送"，说完自己都觉得假。放下电话你在楼道站了很久，直到有邻居上来，你才假装在找钥匙。'
            }
          }
        }
      ]
    },
    {
      id: 'x_dink_40',
      stage: 6,
      age: 44,
      always: true,
      title: '家长会的时间',
      scene: '同事都在请假开家长会。你在订下个月的机票。有人问"你们真不打算要啊"，你说"不打算"。这句话你说了十二年，今年说的时候，心里第一次有点晃。',
      cond: s => F(s, 'dink') && !hasKid(s),
      options: [
        {
          text: '确认一次：这就是我要的',
          effects: { happy: 8, amb: 3, money: 4 },
          result: '你把机票改成了两个人一起走。回来之后你写了一段话存在手机里，只给自己看："我不是不想要，我是更想要现在这样。"这句话你没给任何人看，但它管用。'
        },
        {
          text: '去查一下，还来不来得及',
          effects: { money: -3, happy: -4, health: -2 },
          resolve(s, rng) {
            if (rng() > 0.6) {
              s.flags.push('late_child')
              return {
                tone: 'good',
                effects: { happy: 8, health: -8, money: -12 },
                text: '医生说还有机会，但风险不低。你们试了。四十六岁那年孩子出生，你在产房外面坐着，手一直在抖。你妈从老家赶来，抱着孩子说"没想到我还能抱上"。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -2 },
              text: '医生说机会很小。你们商量了一个星期，决定不试了。那天晚上你们出去吃了顿好的，像给一个没出生的可能，办了个小小的告别。'
            }
          }
        },
        {
          text: '把精力给别人的孩子',
          effects: { happy: 6, cha: 6, family: 2 },
          flags: ['mentor_kid'],
          result: '你开始资助一个山区的学生，后来又带了个实习生。有人问你图什么，你说"不图"。但你确实在他们身上，看到了一些自己没能给出去的东西。'
        }
      ]
    }
  ]

  /* ============================================================
   *  三、单身到中年：不是"还没结"，是"就是这样了"
   * ============================================================ */

  const SINGLE_LIFE = [
    {
      id: 'x_single_50',
      stage: 6,
      age: 50,
      always: true,
      chance: 0.55,
      title: '紧急联系人',
      scene: '你做了个小手术，术前要填"紧急联系人"。你在那一栏停了很久，最后填了你姐。护士说"关系写一下"，你写"姐"。',
      cond: s => !hasPartner(s) && !hasKid(s),
      options: [
        {
          text: '把该安排的都安排清楚',
          textAlt: ['把该安排的都安排清楚', '先把该办的手续办了', '写清遗嘱，托付好人', '把后事一件件安排妥'],
          effects: { happy: 4, amb: 3, money: -4 },
          flags: ['planned_ahead'],
          result: '你立了遗嘱，买了保险，把银行卡密码写在一张纸上交给姐。做完这些你反而轻松了。你说"我不是怕死，我是怕麻烦别人"。'
        },
        {
          text: '开始认真找个人',
          textAlt: ['开始认真找个人', '还是找个人吧', '不再拖了，开始见人', '把这件事提上日程'],
          effects: { happy: 2, cha: 4, amb: 2 },
          resolve(s, rng) {
            if (s.cha * 0.4 + s.luk * 0.3 + rng() * 40 > 55) {
              s.flags.push('cohabit', 'late_partner')
              return {
                tone: 'good',
                effects: { happy: 9 },
                text: '你遇到了一个也一个人过了很多年的人。你们不住一起，但每天打电话。有一次你住院，是他签的字。护士问"什么关系"，他说"家属"。你没纠正。'
              }
            }
            return {
              tone: 'neutral',
              effects: { happy: -3 },
              text: '见了几个，都不太对。你后来不找了。你说"这个年纪，改不动了，也不想让人改"。这话听着像认命，其实是清醒。'
            }
          }
        },
        {
          text: '就这样，挺好',
          textAlt: ['就这样，挺好', '不改了，这样就够了', '一个人走到这儿也行', '认了，这样也不坏'],
          effects: { happy: 5, health: 2 },
          result: '你出院那天自己打车回家，路上买了个西瓜。一个人吃完半个，剩下的放冰箱。你把电视开着，声音调小，觉得屋里有点人气。'
        }
      ]
    },
    {
      id: 'x_single_newyear',
      stage: 5,
      age: 35,
      title: '第七次被问',
      scene: '过年，饭桌上第七次被问到"还没找啊"。你笑着说不急。你妈在旁边给你夹了一筷子菜，没说话。',
      cond: s => !hasPartner(s),
      options: [
        {
          text: '笑着应付过去',
          effects: { happy: -4, family: 3 },
          result: '你笑着说了三遍"在看了"。回城的车上你把车窗开了一条缝，风灌进来，你觉得终于能喘气了。'
        },
        {
          text: '认真说一次：我不打算结婚',
          effects: { family: -10, happy: 6, amb: 4 },
          flags: ['single_by_choice'],
          result: '桌上安静了很久。你二姨说"以后老了怎么办"，你说"我想过了"。那顿饭吃得很闷，但从第二年起，没人再问了。有些话说一次，能省十年的解释。'
        },
        {
          text: '提前走，说单位有事',
          effects: { family: -4, happy: 2 },
          result: '你初三就走了。你妈送到楼下，塞了一袋子吃的，说"别老一个人待着"。你答应了。上了车你才发现，那袋子里有你小时候爱吃的糖。'
        }
      ]
    }
  ]

  /* ============================================================
   *  四、婚礼：不是"办不办"，是"谁出钱、办给谁看"
   * ============================================================ */

  const WEDDING = [
    {
      id: 'x_wedding_two_places',
      stage: 5,
      age: 31,
      slot: 'wedding',
      title: '两地各办一场',
      scene: '你家在北方，她家在南方。两边老人都说"亲戚过不来"。算下来，办两场比办一场多花八万，但两边都能"有面子"。',
      cond: s => hasPartner(s) || F(s, 'dating'),
      options: [
        {
          text: '办两场，钱再想办法',
          effects: { money: -16, family: 12, happy: -2, health: -4 },
          flags: ['wedding_two'],
          result: '你在两个月里当了两次新郎。第二场结束那天你在酒店床上躺了很久，说"再也不办了"。但两边老人逢人就放婚礼视频，你也就没再说什么。'
        },
        {
          text: '只办一场，把两边老人接过来',
          effects: { money: -8, family: 4, happy: 4 },
          result: '你把四位老人接到同一个城市，订了一个能坐四十人的厅。你爸和她爸第一次见面，喝多了，抱在一起说"以后就是一家人了"。这八万花得比两场值。'
        },
        {
          text: '一场都不办，钱留着',
          effects: { money: 2, family: -10, happy: 8 },
          result: '你们把钱留着付了首付。两边老人有半年不太高兴，后来看到房子，也就接受了。你说"婚礼是给别人看的，房子是自己住的"。'
        }
      ]
    },
    {
      id: 'x_wedding_debt',
      stage: 5,
      age: 30,
      slot: 'wedding',
      title: '彩礼',
      scene: '对方家里开口要二十八万八。你爸妈把存折拿出来，说"还能凑二十万，剩下的借"。你看着那个数，忽然不知道该说什么。',
      cond: s => hasPartner(s) || F(s, 'dating'),
      options: [
        {
          text: '借也要给，先把婚结了',
          effects: { money: -28, family: -10, happy: 4, health: -3 },
          flags: ['wedding_debt', 'married_love'],
          result: '婚结了，账也背上了。你们婚后头三年一直在还钱。有一次为了省两百块，你们走了四站路。她后来跟你说"那几年，我没觉得苦"——你听完更难受了。'
        },
        {
          text: '谈。谈不拢就算了',
          effects: { cha: 5, happy: -4, family: 4 },
          resolve(s, rng) {
            if (rng() > 0.45) {
              s.flags.push('married_love')
              return {
                tone: 'good',
                effects: { happy: 8, money: -8 },
                text: '你和对方一起去做家里的工作。最后定在八万，两家各退一步。她妈说"不是要钱，是要个态度"。你想，态度这东西，非得用钱量吗。但你没说出口。'
              }
            }
            return {
              tone: 'bad',
              effects: { happy: -12 },
              text: '谈崩了。她家里说"这点诚意都没有"。你们又撑了半年，最后散了。多年后你听说她嫁了个条件更好的，你居然松了口气。'
            }
          }
        },
        {
          text: '不结了。这事一开始就不对',
          effects: { happy: -6, amb: 4, money: 2 },
          flags: ['called_off'],
          result: '你在订婚宴前一天退了。两家都炸了，你一个人去外地待了半个月。回来之后你换了工作。有人说你冲动，你没解释——你只是不想让一笔钱，成为往后几十年每次吵架的开头。'
        }
      ]
    }
  ]

  /* ============================================================
   *  五、中年轮换组：每局遇到一次"失去"，六种之一
   *     不是每个人都丧偶，但中年总有一件事会来敲门
   * ============================================================ */

  const MID_LOSS = [
    {
      id: 'x_parent_ill',
      stage: 6,
      age: 47,
      slot: 'mid_loss',
      title: '两个人同时病倒',
      scene: '你妈住院的第三天，你爸在家摔了一跤。你在两个病房之间跑，手机里有十七个未接来电，全是单位打来的。',
      sceneAlt: [
        '你爸的检查报告出来那天，你妈说"我最近也不太舒服"。你说"等这阵子过去我带你去"。这阵子过去，用了两年。',
        '医院的陪护床上，你睡了第十一个晚上。你已经能凭脚步声分辨是哪个护士值班，也能听出哪种脚步是往你这边来的。',
        '你请了长假。领导说"家里的事要紧"，语气很客气。你听懂了这份客气——这个假请完，位置大概就不是你的了。',
        '你妈出院那天，你爸又住进去了。你在两个病房之间搬东西，像搬一个永远搬不完的家。',
        '护工换了三个，第一个嫌累，第二个手脚不干净，第三个还行，但你妈不喜欢她。你夹在中间，谁都不能得罪。'
      ],
      cond: s => true,
      options: [
        {
          text: '请长假，自己扛',
          textAlt: ['请长假，自己扛', '请假，自己守夜', '把年假全用了', '白天黑夜都自己上'],
          effects: { money: -10, health: -10, happy: -6, family: 12, career: -2 },
          flags: ['cared_parent'],
          result: '你请了三个月假。白天在医院，晚上在客厅的沙发上睡。你妈出院那天拉着你的手说"苦了你了"，你说"不苦"。转身去倒水的时候，你在厨房站了很久。'
        },
        {
          text: '请护工，钱能解决的就用钱',
          textAlt: ['请护工，钱能解决的就用钱', '花钱请人，自己下班去', '找护工，自己盯白天', '钱能办的都花钱办'],
          effects: { money: -18, happy: -2, family: 4, health: 2 },
          flags: ['cared_parent'],
          result: '你请了两个护工，一个白天一个晚上。你每天下班去坐一小时。你妈说"你不用天天来"，但你去了她还是高兴。你后来想，钱买不到陪伴，但能买到让你还能陪一会儿的余地。'
        },
        {
          text: '和兄弟姐妹排班',
          textAlt: ['和兄弟姐妹排班', '跟哥姐轮着来', '一家人排个表', '把照顾的事分一分'],
          effects: { family: -6, happy: 2, health: -2 },
          flags: ['cared_parent', 'sibling_split'],
          result: '你们排了个表，一人一周。排到第三轮，你姐说"我实在请不出假了"。表就散了。后来谁离得近谁去，谁心里有气谁不说。父母老了以后，兄弟姐妹之间最容易伤人的，就是这本算不清的账。'
        }
      ]
    },
    {
      id: 'x_health_scare',
      stage: 6,
      age: 45,
      slot: 'mid_loss',
      title: '报告上有个箭头',
      scene: '体检报告出来，有一项标了红。医生说"先别紧张，做个进一步检查"。你在走廊里坐着，忽然想起上个月一直没当回事的那个疼。',
      cond: s => true,
      options: [
        {
          text: '立刻查清楚，该治就治',
          textAlt: ['立刻查清楚，该治就治', '当天就挂号', '不拖，查到底', '马上住院查一轮'],
          effects: { money: -8, health: 8, happy: -4 },
          resolve(s, rng) {
            if (rng() > 0.35) {
              return {
                tone: 'neutral',
                effects: { happy: 6, health: 4 },
                text: '进一步检查是良性的。你从医院出来，站在太阳底下抽了根烟——你戒烟三年了。抽完你把它掐了，回家把体检报告贴在冰箱上。'
              }
            }
            s.flags.push('chronic')
            return {
              tone: 'bad',
              effects: { health: -12, money: -14, happy: -8 },
              text: '确诊了，需要长期吃药。你第一反应不是怕，是算钱。第二反应是想孩子还在上学。你回家跟谁都没说，第二天照常上班，只是从此包里多了个药盒。'
            }
          }
        },
        {
          text: '先放放，过半年再说',
          textAlt: ['先放放，过半年再说', '先压着，等忙完', '放抽屉里，先不管', '半年后复查，现在先这样'],
          effects: { happy: -6, health: -6 },
          resolve(s, rng) {
            if (rng() > 0.5) {
              return {
                tone: 'neutral',
                effects: { health: 2 },
                text: '半年后复查，指标自己回去了。医生说"注意休息"。你松了口气，也后怕了一下。你把那份报告收进了抽屉，没扔。'
              }
            }
            s.flags.push('chronic')
            return {
              tone: 'bad',
              effects: { health: -18, money: -20, happy: -10 },
              text: '半年后已经晚了。你在病床上想了很多，最常想起来的是那天下午——你明明可以多花两个小时，把事弄清楚。'
            }
          }
        },
        {
          text: '不查了，先把想做的事做了',
          textAlt: ['不查了，先把想做的事做了', '不治了，把想做的做完', '把清单拿出来，一件件去办', '剩下的时间自己安排'],
          effects: { money: -6, happy: 8, health: -4 },
          flags: ['live_now'],
          result: '你请了年假，带家人出去玩了一趟，把一直想学的东西报了班。半年后你还是去查了，结果不好不坏。但你说，"那半年我活得像个人"。'
        }
      ]
    },
    {
      id: 'x_child_rebel',
      stage: 6,
      age: 44,
      slot: 'mid_loss',
      title: '房门关上了',
      scene: '孩子把房门关上了，一天没出来。你在门外站了一会儿，听见里面有音乐声。你想敲门，手抬起来又放下。',
      cond: s => hasKid(s),
      options: [
        {
          text: '硬来。这个家我说了算',
          effects: { happy: -8, family: -10, cha: -4 },
          result: '你踹开了门，摔了他的手机。那之后他不再关房门了，也不再跟你说话。三年后他去了外地，一年回来一次。你有时候想，那天要是不踹那扇门，会不会不一样。'
        },
        {
          text: '敲门，说"我进来坐会儿"',
          effects: { cha: 6, happy: 3, family: 6 },
          result: '你进去坐在床边，什么也没问。坐了十分钟，他忽然说"学校有人针对我"。你没有给建议，只是听着。那晚之后，他有时候会主动跟你说两句。'
        },
        {
          text: '先不管，等他自己出来',
          effects: { happy: -2, family: -2 },
          result: '你等了三天。第四天他自己出来了，像什么都没发生。你想说点什么，最后只说"饭在锅里"。有些事就这么过去了，你不知道是好还是不好。'
        }
      ]
    },
    {
      id: 'x_sibling_debt',
      stage: 6,
      age: 48,
      slot: 'mid_loss',
      title: '你哥的事',
      scene: '你哥欠了钱，找上门来。他说"就这一次"，你嫂子在旁边哭。你想起小时候他把唯一的鸡蛋让给你。',
      cond: s => true,
      options: [
        {
          text: '帮。他是我哥',
          effects: { money: -16, family: 6, happy: -4 },
          resolve(s, rng) {
            if (rng() > 0.5) {
              return {
                tone: 'neutral',
                effects: { family: 4 },
                text: '钱给了，他后来慢慢还上了。还钱的时候他多给了两千，说"利息"。你没要。你们的关系没有变好，也没有变坏，只是从此多了一层"我帮你过一次"的东西。'
              }
            }
            return {
              tone: 'bad',
              effects: { family: -12, happy: -8 },
              text: '第二次他又来了。你这次没给。他在客厅坐了很久，走的时候说"你就当没我这个哥"。门关上之后，你妈打电话来骂你。你听着，没辩解。'
            }
          }
        },
        {
          text: '不帮。这是他的事',
          effects: { family: -10, happy: -6, money: 4 },
          result: '你说"我没有这个能力"。他走了，年也没回来过。你妈为这个事跟你生了两年的气。你不后悔，但每年过年桌上那个空位，你都看得见。'
        },
        {
          text: '不直接给钱，帮他把事理清楚',
          effects: { money: -4, cha: 6, family: 4, happy: 2 },
          result: '你陪他去见了债主，把利息算明白，谈了个分期。钱你只出了一小部分。他后来跟人说"我弟比我明白"。你听见了，觉得这比借钱值。'
        }
      ]
    },
    {
      id: 'x_quiet_year',
      stage: 6,
      age: 46,
      slot: 'mid_loss',
      title: '这一年没什么事',
      scene: '体检正常，父母还能自己做饭，孩子成绩中等，工作没什么变化。你躺在床上想，是不是该担心点什么。',
      cond: s => true,
      options: [
        {
          text: '就好好过这一年',
          effects: { happy: 8, health: 3 },
          result: '你把这一年过得很慢。周末去公园，晚上早点睡，学会了一道菜。年底回顾的时候你发现，什么都没发生的一年，居然是最舒服的一年。'
        },
        {
          text: '趁没事，把该准备的准备了',
          effects: { money: 6, amb: 3, happy: 2 },
          flags: ['planned_ahead'],
          result: '你把保险配齐了，把父母的病历整理成一份文档，把自己的存款和密码写下来放进抽屉。做完这些你心里踏实了很多。中年人的安全感，一半是钱，一半是"万一有事我知道怎么办"。'
        },
        {
          text: '总觉得不对劲，开始折腾',
          effects: { amb: 8, happy: -2, money: -4 },
          result: '你报了个班，换了个方向，折腾了半年。没折腾出什么名堂，但你不再觉得日子是在往下滑了。'
        }
      ]
    }
  ]

  /* ============================================================
   *  汇总
   * ============================================================ */

  const ALL = [].concat(MARRIAGE, FERTILITY, SINGLE_LIFE, WEDDING, MID_LOSS)

  /* 概率：不是每个人都会遇到，但遇到的人躲不开。
   * 数字是"摊到所有人头上"的比例，所以离婚设得比现实低——
   * 游戏里还有一半人根本没走到结婚那一步。 */
  const CHANCE = {
    x_single_30: 0.7,
    x_marry_avoid: 0.65,
    x_love_late: 0.75,
    x_flash_marry: 0.5,
    x_marry_oppose: 0.45,
    x_cohabit: 0.5,
    x_divorce: 0.2,
    x_second_marry: 0.5,
    x_kid_try: 0.18,
    x_kid_second: 0.42,
    x_single_parent: 0.85,
    x_dink_40: 0.6,
    x_single_newyear: 0.4
  }
  ALL.forEach(e => { if (CHANCE[e.id]) e.chance = CHANCE[e.id] })

  return ALL

})
