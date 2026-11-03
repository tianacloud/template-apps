/**
 * core/dyn-data.js —— 王朝模拟器 · 内容层
 * 身世、天赋、阶段、庙号（走向）、身后（光景）、史评、朝政建议。
 * 引擎不认识"故事"，只认识数值与 flag。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./dyn-events'), require('./dyn-events-solo'))
  } else {
    root.DynData = factory(root.DynEvents, root.DynEventsSolo)
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (FAM, SOLO) {

  const EVENTS = [].concat(FAM || [], SOLO || [])

  /* ============================ 国号与年号 ============================ */

  const DYNASTY_NAMES = ['大靖', '大昭', '大衍', '大晟', '大乾', '大梁', '大燕', '大宁', '大肃', '大穆', '大炎', '大启']
  const SURNAMES = ['萧', '李', '赵', '元', '慕容', '宇文', '陈', '刘', '王', '谢', '裴', '崔', '杨', '高', '司马', '虞']
  const GIVEN_NAMES = ['承祐', '元朗', '景琰', '弘之', '昭', '昀', '祁', '澈', '珩', '瑞', '瑜', '珏', '谦', '稷', '询', '桓']
  const ERA_NAMES = ['承天', '永昌', '景和', '元贞', '昭武', '建元', '天启', '隆庆', '宣德', '靖平', '大业', '开皇', '咸宁', '泰和', '弘治', '正始']

  /* 庙号：按功业与国祚给。祖有功，宗有德。 */
  const TEMPLE_NAMES = {
    founder: ['太祖', '高祖', '世祖'],
    great: ['太宗', '世宗', '高宗'],
    good: ['仁宗', '宣宗', '孝宗', '章宗'],
    mid: ['中宗', '穆宗', '德宗', '顺宗'],
    weak: ['文宗', '敬宗', '哀宗', '思宗'],
    last: ['末帝', '废帝', '少帝']
  }

  /* 谥号：一字定评 */
  const POSTHUMOUS = [
    { id: 'wen', name: '文', cond: sc => sc.welfare >= 65 && sc.merit >= 55 },
    { id: 'wu', name: '武', cond: sc => sc.renown >= 70 && sc.merit >= 55 },
    { id: 'xuan', name: '宣', cond: sc => sc.merit >= 60 && sc.welfare >= 55 },
    { id: 'jing', name: '景', cond: sc => sc.welfare >= 60 && sc.order >= 55 },
    { id: 'ming', name: '明', cond: sc => sc.merit >= 55 && sc.order >= 50 },
    { id: 'jian', name: '简', cond: sc => sc.welfare >= 55 && sc.merit < 55 },
    { id: 'shang', name: '殇', cond: sc => sc.order < 35 },
    { id: 'yang', name: '炀', cond: (sc, s) => s.flags.includes('harsh_rule') || sc.welfare < 30 },
    { id: 'li', name: '厉', cond: sc => sc.welfare < 38 && sc.renown >= 50 },
    { id: 'ling', name: '灵', cond: sc => sc.merit < 40 && sc.welfare < 45 },
    { id: 'ai', name: '哀', cond: sc => sc.order < 45 },
    { id: 'dao', name: '悼', cond: sc => sc.order < 40 }
  ]

  /* ============================ 即位身世 ============================ */

  const ORIGINS = [
    {
      id: 'founder', tag: '开国之君', weight: 12, age: 34,
      stats: { treasury: 44, people: 42, army: 72, admin: 30, authority: 78, prestige: 70, scholar: 35, eunuch: 20, warlord: 62, clan: 30 },
      desc: '你打了十一年仗，从一县之地打到据有半壁。旧朝的皇帝在城破前自焚，玉玺被人从火里抢出来，缺了一个角。'
        + '今年你在旧都的太极殿即位，国号新定，年号新改。殿下的台阶上还有没洗净的血。',
      note: '你有一支能打仗的军队，和一个不会收税的朝廷。这两样迟早要换过来。',
      traitBias: ['iron', 'decisive', 'soldier']
    },
    {
      id: 'heir', tag: '守成之君', weight: 32, age: 22,
      stats: { treasury: 60, people: 60, army: 50, admin: 52, authority: 46, prestige: 54, scholar: 58, eunuch: 28, warlord: 34, clan: 40 },
      desc: '你在东宫长大，六岁启蒙，十岁出阁读书，十六岁开始替先帝批一些不紧要的折子。'
        + '先帝走得很突然，遗诏是在病榻上口述的，只有三位大臣听见。你即位那天，天很蓝。',
      note: '你接手的是一个还算完整的国家。所有的问题都还在，只是都还没有发作。',
      traitBias: ['clever', 'diligent', 'kind']
    },
    {
      id: 'child', tag: '冲龄践祚', weight: 16, age: 8,
      stats: { treasury: 54, people: 52, army: 44, admin: 40, authority: 24, prestige: 38, scholar: 50, eunuch: 34, warlord: 32, clan: 66 },
      desc: '你八岁。先帝崩时你还在背书，内侍来叫你，你以为是背错了要罚。'
        + '登基那日龙椅太高，脚下垫了一只木凳。太后垂帘，三位顾命大臣立在阶下，替你答了所有的"准"。',
      note: '你的年号会写进诏书，你的话要经过别人的嘴。先活到能自己说话的那一天。',
      traitBias: ['clever', 'patient', 'sickly']
    },
    {
      id: 'prince', tag: '藩王入继', weight: 16, age: 26,
      stats: { treasury: 48, people: 48, army: 52, admin: 42, authority: 38, prestige: 34, scholar: 40, eunuch: 24, warlord: 40, clan: 56 },
      desc: '先帝无嗣。宗正与群臣议了四十天，从二十七个藩王里挑了你。你从封地进京，走了十九天，'
        + '沿途州县接送的规格一天比一天高。进京那天落雨，礼部说"雨洗新君"，是好兆头。',
      note: '你不是在宫里长大的。宫里的人不认得你，你也不认得他们。这既是短处，也是机会。',
      traitBias: ['patient', 'suspicious', 'clever']
    },
    {
      id: 'late', tag: '末世之君', weight: 24, age: 24,
      stats: { treasury: 13, people: 30, army: 27, admin: 23, authority: 32, prestige: 24, scholar: 52, eunuch: 46, warlord: 44, clan: 58 },
      desc: '你是这个王朝的第七个皇帝。先帝留给你一个空国库、八个月欠饷的边军、和一份写着"无以为继"的账册。'
        + '即位大典办得很省，礼部说"国用不足，宜从简"。你在简朴的仪仗里走完了全程。',
      note: '这个国家还没有倒，但已经在往下沉。你要么把它托起来，要么和它一起沉下去。',
      traitBias: ['diligent', 'decisive', 'sickly']
    }
  ]

  /* ============================ 性格天赋 ============================ */

  const TRAITS = [
    { id: 'clever', name: '天资聪颖', desc: '奏折看一遍就能抓住要害。教过你的先生都说，可惜没赶上好时候。', effects: { admin: 7, prestige: 3 } },
    { id: 'memory', name: '过目不忘', desc: '三年前某州报过一场旱，你连数字都记得。臣下渐渐不敢在你面前含糊。', effects: { admin: 9, authority: 3 } },
    { id: 'iron', name: '体魄强健', desc: '能开两石弓，骑马一天不倦。这副身子是你最不费力的本钱。', effects: { health: 12, army: 3 } },
    { id: 'sickly', name: '多病之身', desc: '每逢换季必咳。太医开方子很谨慎，你也很谨慎地活着。', effects: { health: -10, admin: 4 } },
    { id: 'kind', name: '天性仁厚', desc: '见不得人受苦。这是美德，也是别人最容易利用你的地方。', effects: { people: 10, authority: -5, prestige: 3 } },
    { id: 'suspicious', name: '生性多疑', desc: '你不信任何人，包括那些真的忠于你的人。这让你活得久，也活得累。', effects: { authority: 8, people: -4, scholar: -5, health: -3 } },
    { id: 'decisive', name: '处事果决', desc: '该杀就杀，该放就放。你很少后悔，也很少回头。', effects: { authority: 7, admin: 3, people: -3 } },
    { id: 'hesitant', name: '优柔寡断', desc: '一件事要在心里过三遍。好处是很少做错，坏处是很少做成。', effects: { authority: -6, people: 2, health: -2 } },
    { id: 'diligent', name: '勤于政事', desc: '四更起，三更睡，折子不过夜。你把命填进了这个国家。', effects: { admin: 9, health: -7 } },
    { id: 'lavish', name: '生性奢靡', desc: '器物要最好的，宫室要最新的。你觉得自己配得上，天下也养得起。', effects: { treasury: -8, prestige: 5, people: -4 } },
    { id: 'lewd', name: '耽于内宠', desc: '后宫的灯火比前朝亮。子嗣不少，朝政不熟。', effects: { health: -7, clan: 5, admin: -4, heirs: 1 } },
    { id: 'soldier', name: '通晓兵法', desc: '你能看懂舆图上的每一处隘口。边将回话时不敢糊弄你。', effects: { army: 10, warlord: 5, admin: -2 } },
    { id: 'eloquent', name: '善言能辩', desc: '廷议时你一个人能说服一整殿的人。说服之后，他们未必服气。', effects: { prestige: 6, scholar: 4, people: 2 } },
    { id: 'patient', name: '隐忍不发', desc: '你能等。等到对方先动，等到事情自己露出破绽。', effects: { authority: 2, health: 2, admin: 2 } },
    { id: 'cold', name: '生性凉薄', desc: '你记得每个人的用处，不记得他们的名字。', effects: { authority: 6, people: -7, scholar: -3 } },
    { id: 'daoist', name: '好神仙术', desc: '你信长生。丹炉里的东西，比奏折更能让你安心。', effects: { health: -8, prestige: 4, treasury: -4 }, flag: 'daoist' },
    { id: 'buddhist', name: '笃信佛法', desc: '你在宫里设了佛堂，早课不辍。杀人的时候，你会先念一句佛。', effects: { people: 5, health: 3, treasury: -5, admin: -2 }, flag: 'buddhist' },
    { id: 'poet', name: '雅好词章', desc: '你的诗写得比诏书好。后世记住你，多半是因为那几首诗。', effects: { prestige: 7, scholar: 5, admin: -3 }, flag: 'culture' }
  ]

  /* ============================ 在位阶段 ============================ */

  const STAGES = {
    1: { name: '初政', range: '第 1 — 3 年', tip: '龙椅还没坐热。所有人都在看你会做什么，包括那些希望你什么都别做的人。' },
    2: { name: '亲政', range: '第 4 — 10 年', tip: '你开始真正碰到这个国家的骨头。它比看上去更硬，也更空。' },
    3: { name: '盛年', range: '第 11 — 20 年', tip: '你的话开始被当作祖制。这是最好的时候，也是最容易看错的时候。' },
    4: { name: '积弊', range: '第 21 — 32 年', tip: '当年定下的规矩开始反过来咬人。你修补的地方，比新建的多。' },
    5: { name: '暮年', range: '第 33 年以降', tip: '你成了这个王朝最老的人。太子在等，百官在等，只有你自己不想等。' }
  }

  /* ============================ 庙号 / 走向 ============================ */
  /*
   * 结局 = 庙号与评价（走向，66 种）× 身后光景（50 种）
   * match(s, sc) 判成立；pri 是稀有度，weightedPick 会按 pri^3 加权，
   * 所以常见结局不会被稀有结局抢走，冷门结局也不会永远出不来。
   */

  const ENDINGS = [
    /* ---------- 开国 ---------- */
    {
      id: 'founder_unify', pri: 10, title: '太祖 · 混一寰宇', family: 'founding', avoid: 'tomb',
      match: (s, sc) => s.origin.id === 'founder' && sc.merit >= 72 && sc.order >= 55 && s.heirs > 0,
      desc: '你从一县起兵，用了十一年打下这个天下，又用了二十年把它理顺。你定的制度用了三百年，'
        + '你定的年号被后来的十几个政权借去用。史官写你的本纪，写了整整八卷。'
    },
    {
      id: 'founder_hard', pri: 9, title: '高祖 · 百战开基', family: 'founding',
      match: (s, sc) => s.origin.id === 'founder' && sc.renown >= 55,
      desc: '你这辈子大部分时间在马背上。天下是你一刀一枪打下来的，治天下的事，你交给别人，也防着别人。'
        + '你死后，那些被你封出去的王，很快就打了起来。'
    },
    {
      id: 'founder_short', pri: 8, title: '世祖 · 功成而身殁', family: 'founding', avoid: 'kin',
      match: (s, sc) => s.origin.id === 'founder' && sc.order < 50,
      desc: '你打下了天下，没来得及坐稳。最后那两年你一直在咳嗽，奏折上的字越来越淡。'
        + '你的继承者太年轻，你的老兄弟太强壮，这两件事凑在一起，就是一场内战。'
    },

    /* ---------- 治世 ---------- */
    {
      id: 'golden_age', pri: 10, title: '太宗 · 海内殷富', family: 'prosperous',
      match: (s, sc) => sc.welfare >= 72 && sc.merit >= 62 && sc.order >= 55,
      desc: '你治下的那些年，米价一直很平，路上很少有流民。史书用了一个词叫"海内殷富"，'
        + '后来的皇帝都希望自己的本纪里能有这四个字。你做到了，代价是每天只睡三个时辰。'
    },
    {
      id: 'rest_people', pri: 9, title: '仁宗 · 与民休息', family: 'prosperous', avoid: 'folk',
      match: (s, sc) => sc.welfare >= 68 && sc.renown < 62,
      desc: '你不喜欢打仗，也不喜欢大工程。你在位的几十年里，朝廷没有做过什么惊天动地的事，'
        + '百姓的日子却一年比一年好过一点。这种功绩不上碑，只在人的嘴里。'
    },
    {
      id: 'thrifty', pri: 8, title: '孝宗 · 恭俭之主', family: 'prosperous',
      match: (s, sc) => sc.welfare >= 58 && s.treasury >= 62 && sc.renown < 58,
      desc: '你一辈子没修过新宫殿，龙袍洗过三次。国库里的银子堆到放不下，你却舍不得给自己换一张好床。'
        + '史官说你"恭俭"，也说你"近于吝"。这两种说法，你都听不到了。'
    },
    {
      id: 'long_peace', pri: 7, title: '章宗 · 久不用兵', family: 'prosperous',
      match: (s, sc) => s.years >= 16 && sc.order >= 66 && s.army < 50,
      desc: '你在位的那些年，边关没有大的战事。兵部的折子越来越像例行公文。'
        + '有人提醒你武备废弛，你说"朕以德服人"。这话在你活着的时候是对的。'
    },
    {
      id: 'prosperous_mid', pri: 7, title: '宣宗 · 守成令主', family: 'prosperous',
      match: (s, sc) => sc.welfare >= 52 && sc.merit >= 50 && sc.order >= 50,
      desc: '你没有开创什么，也没有败坏什么。你接手的时候国家是什么样，交出去的时候还是什么样，'
        + '只是旧了一些。在王朝的中段，能做到这一点已经不容易。'
    },
    {
      id: 'peaceful_rich', pri: 6, title: '顺宗 · 太平天子', family: 'prosperous',
      match: (s, sc) => s.treasury >= 66 && sc.welfare >= 55,
      desc: '你在位时国库充盈，四方无事。你最大的爱好是收集名画，内府藏了三千卷。'
        + '后来的人说起你，总要说一句"可惜生在治世"，好像太平也是一种过错。'
    },

    /* ---------- 武功 ---------- */
    {
      id: 'great_conquest', pri: 9, title: '世宗 · 拓地千里', family: 'military',
      match: (s, sc) => sc.renown >= 72 && s.army >= 60 && sc.merit >= 60,
      desc: '你三次亲征，把疆域往北推了四百里。献俘的仪式办了三次，最后一次你已经走不动了，是被人扶上城楼的。'
        + '你打下的那些地方，有的守住了，有的在你死后十年又丢了。'
    },
    {
      id: 'bloody_win', pri: 8, title: '武帝 · 虽远必诛', family: 'military', avoid: 'folk',
      match: (s, sc) => sc.renown >= 76 && sc.welfare < 52,
      desc: '你的时代，史书上全是战报。你打赢了几乎所有想打的仗，也把三代人攒下的家底打空了。'
        + '晚年你下了一道罪己诏，说自己"悔既往之失"。这道诏书是真的，可已经晚了十年。'
    },
    {
      id: 'border_lord', pri: 8, title: '武宗 · 功在社稷', family: 'military',
      match: (s, sc) => s.army >= 66 && sc.renown >= 58,
      desc: '你把边军从一个空架子练成了能打仗的兵。北边安静了二十年。'
        + '军中的老人到现在还提起你亲自校阅的那个雪天，说那天你站了四个时辰，没穿氅衣。'
    },
    {
      id: 'exhausted_war', pri: 7, title: '穆宗 · 兵连祸结', family: 'military', avoid: 'book',
      match: (s, sc) => sc.renown >= 62 && s.treasury < 34,
      desc: '仗打了很多年。胜败都有，可每一份捷报后面都跟着一份要钱的折子。'
        + '你到死都没有弄明白：为什么打赢了，国家反而更穷了。'
    },
    {
      id: 'lost_war', pri: 8, title: '思宗 · 丧师辱国', family: 'military',
      match: (s, sc) => s.flags.includes('border_defeat') && s.army < 45,
      desc: '那一仗你本可以不打的。败报送到时，你正在用膳，那顿饭从此没再端上来过。'
        + '你赔了款，割了地，也杀了一批人。史书上写"自是边事不可问矣"。'
    },

    /* ---------- 文治 ---------- */
    {
      id: 'civil_great', pri: 9, title: '文帝 · 文教大兴', family: 'civil',
      match: (s, sc) => s.admin >= 66 && sc.merit >= 58 && sc.welfare >= 52,
      desc: '你重开了太学，定了科举的程式，修了前朝的历史。你相信制度能救人，也相信读书能改变一个人。'
        + '你定的那些规矩，后来的人改了很多，但底子一直是你的。'
    },
    {
      id: 'exam_lord', pri: 8, title: '宪宗 · 天下英才入吾彀中', family: 'civil',
      match: (s, sc) => s.admin >= 58 && s.scholar >= 55 && sc.merit >= 50,
      desc: '你说过一句话："天下英雄，入吾彀中矣。"这句话被记进了史书，也被后来的读书人反复引用。'
        + '你确实把天下读书人收进了体制，代价是这个体制从此越来越难改。'
    },
    {
      id: 'history_lord', pri: 8, title: '文成帝 · 斯文在兹', family: 'civil',
      match: (s, sc) => s.flags.includes('library') || s.flags.includes('history') || s.flags.includes('culture'),
      desc: '你修的书、编的典、刻的经，比你的政令活得久。后来的读书人未必记得你做过什么，'
        + '但他们都读过你让人抄下来的那些字。'
    },
    {
      id: 'ritual_lord', pri: 6, title: '章帝 · 礼乐之主', family: 'civil',
      match: (s, sc) => s.scholar >= 62 && s.prestige >= 55 && sc.merit >= 45 && sc.merit < 62,
      desc: '你把礼制重新理了一遍，定了郊祀、宗庙、朝仪的程式。这些事看起来虚，却让这个王朝有了样子。'
        + '你死后，你的继承者照着你的仪注办了三十年的典礼。'
    },

    /* ---------- 变法 ---------- */
    {
      id: 'reform_win', pri: 9, title: '神宗 · 变法图强', family: 'reform',
      match: (s, sc) => (s.flags.includes('reform') || s.flags.includes('salt_reform')) && sc.merit >= 62 && s.people >= 42,
      desc: '你动了那些不该动的东西：税制、军制、宗室的禄米。反对的折子堆满了三间屋子。'
        + '你活着的时候他们没办法，你死了以后他们把你的人一个个赶走，可你的法子留了下来。'
    },
    {
      id: 'reform_fail', pri: 8, title: '熙宗 · 人亡政息', family: 'reform',
      match: (s, sc) => (s.flags.includes('reform') || s.flags.includes('salt_reform')) && s.people < 45,
      desc: '你的新法在你在位时推行得很急，得罪了太多人。你死之后不到三年，新法尽废，'
        + '主持变法的人被从坟里挖出来鞭尸。你的年号还在用，你的法子一个也没留下。'
    },
    {
      id: 'revival', pri: 10, title: '宣宗 · 中兴之主', family: 'reform',
      match: (s, sc) => s.origin.id === 'late' && s.people >= 55 && sc.merit >= 58,
      desc: '你接手的时候，这个王朝已经在下沉。你用二十几年把它托了起来：清丈了田亩，整了军，'
        + '把宗室的禄米减了一半。史书把这个时期叫做"中兴"，可只有你知道，中兴致只是把坠落推迟了两代人。'
    },
    {
      id: 'half_reform', pri: 7, title: '哲宗 · 改了一半', family: 'reform',
      match: (s, sc) => s.flags.includes('reform') && sc.merit >= 45 && sc.merit < 62,
      desc: '你改了一半，剩下的那一半太难，就搁下了。搁下的部分后来长成了更大的问题。'
        + '史官写你的时候用了"惜哉"两个字，这两个字通常意味着：本可以。'
    },

    /* ---------- 权谋 ---------- */
    {
      id: 'balance_master', pri: 8, title: '世宗 · 制衡天下', family: 'power',
      match: (s, sc) => s.authority >= 70 && s.admin >= 55 && s.people >= 45,
      desc: '你让宦官制外朝，让外朝制宗室，让宗室制边将，再让边将互相制。这套平衡术你玩了一辈子，'
        + '没有一方坐大，也没有一方真的服你。你死之后，这套平衡立刻就散了。'
    },
    {
      id: 'paranoid', pri: 8, title: '庄宗 · 群臣战栗', family: 'power', avoid: 'book',
      match: (s, sc) => s.authority >= 72 && s.people < 48,
      desc: '你在位时，朝会上没有人敢先开口。你杀过宰相，也杀过自己的叔父。'
        + '你确实把权力抓得很紧，紧到没有人愿意替你办事。晚年你发现，奏折越来越短，事情越来越慢。'
    },
    {
      id: 'eunuch_rule', pri: 8, title: '熹宗 · 天下事由内廷', family: 'power',
      match: (s, sc) => s.eunuch >= 62,
      desc: '你信任内侍胜过朝臣。他们替你批红、替你收税、替你看着那些不听话的官。'
        + '到你晚年，外朝的折子要经他们的手才递得进来。你死后，新君第一件事就是杀了他们中的三个。'
    },
    {
      id: 'puppet', pri: 8, title: '恭帝 · 垂拱而已', family: 'power',
      match: (s, sc) => s.authority < 32 && sc.order >= 38,
      desc: '你在位很多年，诏书上的字是你签的，话是别人说的。你学会了一件事：不问，就不会错。'
        + '你死后谥号里有一个"恭"字，意思是：很听话。'
    },
    {
      id: 'usurped', pri: 9, title: '少帝 · 被废', family: 'power',
      match: (s, sc) => s.collapse === 'authority',
      desc: '权臣带兵入宫的那天，你还在批折子。他没有杀你，只是把诏书放在你面前，让你自己写。'
        + '你写了。写完你被迁到别宫，活了十一年，其间没有出过那道门。'
    },
    {
      id: 'female_emperor', pri: 7, title: '则天皇后 · 日月当空', family: 'power',
      match: (s, sc) => s.female && sc.merit >= 58,
      desc: '你以女子之身临朝称制，改元、立庙、封禅，一样没少。反对的人很多，他们的下场写在史书的"酷吏传"里。'
        + '你给自己立了一块无字碑——功过留给后人说，这句话是你唯一一次示弱。'
    },
    {
      id: 'female_fall', pri: 7, title: '韦后 · 临朝而败', family: 'power',
      match: (s, sc) => s.female && sc.merit < 48,
      desc: '你临朝称制那些年，朝中始终有人不认。你用了很多手段，杀了很多人，最后还是败了。'
        + '史官写你的时候，没有用本纪，用的是"外戚传"。'
    },

    /* ---------- 暴政与昏君 ---------- */
    {
      id: 'tyrant', pri: 8, title: '炀帝 · 天下苦其役', family: 'tyranny', avoid: 'folk',
      match: (s, sc) => s.people < 32 && (s.flags.includes('harsh_rule') || s.flags.includes('harsh_labor')),
      desc: '你修了运河，建了东都，三征外邦。每一件事单拿出来都算功业，合在一起就要了一个王朝的命。'
        + '你死在巡幸的路上，死的时候身边只有几个内侍。'
    },
    {
      id: 'harsh_lord', pri: 8, title: '厉王 · 道路以目', family: 'tyranny',
      match: (s, sc) => s.people < 38 && s.authority >= 58,
      desc: '你禁止人议论朝政，违者弃市。街上的人见面只敢用眼睛说话。你以为天下太平了，'
        + '其实只是没有人再告诉你哪里不太平。'
    },
    {
      id: 'lazy_king', pri: 7, title: '灵帝 · 不视朝', family: 'tyranny',
      match: (s, sc) => s.admin < 32 && sc.merit < 45,
      desc: '你在位二十多年，亲自主持的朝会不到百次。奏折由内侍分拣，你只批"知道了"。'
        + '这个国家在你手里没有立刻垮，因为它太大了，垮得慢。'
    },
    {
      id: 'lavish_king', pri: 7, title: '昭帝 · 金玉满堂', family: 'tyranny',
      match: (s, sc) => s.treasury < 32 && s.prestige >= 58,
      desc: '你修了三座宫殿，收了两万件珍宝。外邦使臣来朝时，看见库房里的东西都愣住了。'
        + '你死后三年，叛军攻进京城，那些珍宝被装了三百车运走。'
    },
    {
      id: 'killer', pri: 7, title: '厉帝 · 朝堂为空', family: 'tyranny',
      match: (s, sc) => s.authority >= 65 && s.scholar < 34,
      desc: '你杀过的宰相有六个，尚书十一个。到最后，廷议时站在殿上的都是些不敢说话的人。'
        + '你想办的事，他们都说"遵旨"，然后什么也不做。'
    },

    /* ---------- 亡国 ---------- */
    {
      id: 'fall_people', pri: 10, title: '末帝 · 亡于民变', family: 'collapse', avoid: 'folk',
      match: (s, sc) => s.collapse === 'people',
      desc: '乱民从南边一路烧过来，官军望风而降。城破那日，你登上煤山，看见城里的火光比宫灯还多。'
        + '你在衣襟上写了一行字："朕非亡国之君，诸臣皆亡国之臣。"写完，你把它给了一个内侍。'
    },
    {
      id: 'fall_army', pri: 10, title: '末帝 · 亡于外寇', family: 'collapse', avoid: 'folk',
      match: (s, sc) => s.collapse === 'army',
      desc: '边军守不住，京城守不住，最后连宫门也守不住。你换上了平民的衣服，从侧门出去，'
        + '走了半里路，回头看了一眼。那道城墙你修了十年。'
    },
    {
      id: 'fall_authority', pri: 9, title: '末帝 · 亡于权臣', family: 'collapse', avoid: 'folk',
      match: (s, sc) => s.collapse === 'authority' && sc.order < 45,
      desc: '你没有死于刀兵，死于一道诏书。权臣让你禅位，你签了字，然后被迁到城外的旧邸。'
        + '新朝给了你一个"安乐公"的封号，你活到六十岁，再没有回过宫城。'
    },
    {
      id: 'no_heir', pri: 9, title: '殇帝 · 国绝', family: 'collapse', avoid: 'folk',
      match: (s, sc) => s.heirs === 0 && s.years >= 4,
      desc: '你死的时候没有儿子。宗室为了继承打了三年，最后是一个远房的侄子坐了龙椅。'
        + '你的牌位进了太庙，但配享的名单里没有几个人愿意署自己的名字。'
    },
    {
      id: 'child_fall', pri: 8, title: '幼帝 · 社稷倾覆', family: 'collapse', avoid: 'folk',
      match: (s, sc) => s.origin.id === 'child' && s.collapse,
      desc: '你还没有亲政，这个国家就已经没了。你被抱着出了宫门，怀里还揣着那只木凳上拆下来的小垫子。'
        + '后来的史书里，你的本纪只有四百字。'
    },
    {
      id: 'surrender', pri: 8, title: '降帝 · 舆榇出降', family: 'collapse', avoid: 'folk',
      match: (s, sc) => !!s.collapse && s.people < 20,
      desc: '你抬着棺材，反绑双手，从城门出去投降。对方的将领看了你一眼，说"不必如此"，然后让人把棺材抬走了。'
        + '你被封了一个侯，住在京城的一处宅子里，余生没有出过那条街。'
    },
    {
      id: 'south', pri: 7, title: '高宗 · 南渡偏安', family: 'collapse',
      match: (s, sc) => !!s.collapse && s.treasury > 34,
      desc: '北边丢了，你带着百官南渡。江上的船走了七天，到了南边，你重新立了宗庙。'
        + '此后的几十年，你一直在等一个北伐的机会。等到最后，你已经不想回去了。'
    },

    /* ---------- 短命与身体 ---------- */
    {
      id: 'short_reign', pri: 8, title: '少帝 · 在位日浅', family: 'short',
      match: (s, sc) => s.years <= 4,
      desc: '你在位的时间，还不够一个州县官做满一任。你的年号只用了四年，钱币铸得很少，'
        + '后世的钱谱上，你的那一枚被标为"稀见"。'
    },
    {
      id: 'elixir', pri: 8, title: '哀帝 · 药石之主', family: 'short',
      match: (s, sc) => s.health < 28 && s.flags.includes('daoist'),
      desc: '你服了很多年的丹。道士说那是"金丹"，太医说那是朱砂和铅。你信了前者。'
        + '最后那半年，你的牙齿掉了，脾气也坏了。你死的时候四十一岁。'
    },
    {
      id: 'work_death', pri: 7, title: '勤帝 · 积劳而崩', family: 'short',
      match: (s, sc) => s.admin >= 58 && s.health < 22 && s.years >= 12,
      desc: '你每天批一百二十份折子，年年如此。最后那天你批到一半，笔掉在折子上，晕开一片墨。'
        + '史官写"上崩于御案"，这五个字，是你一辈子的总结。'
    },
    {
      id: 'assassinated', pri: 8, title: '废帝 · 遇弑', family: 'short',
      match: (s, sc) => s.collapse === 'assassin',
      desc: '刀是从帘后进来的。你听见有人喊"护驾"，然后是自己的血滴在砖上的声音。'
        + '刺客是谁派来的，查了三个月，查出来的结果是"无所主名"。'
    },

    /* ---------- 太上皇 ---------- */
    {
      id: 'retire_garden', pri: 8, title: '太上皇 · 西内养花', family: 'retire',
      match: (s, sc) => s.flags.includes('abdicated'),
      desc: '你退位以后，在西内种了一园子的牡丹。新君每月初一、十五来请安，起初还谈几句朝政，后来只谈花。'
        + '你活到七十三岁，死的时候手里还握着一把花剪。'
    },
    {
      id: 'retire_control', pri: 7, title: '太上皇 · 仍预朝政', family: 'retire',
      match: (s, sc) => s.flags.includes('abdicated') && s.authority >= 52,
      desc: '你名义上退了，实际上没有。新君的诏书要送到西内过目，重要的人事要你先点头。'
        + '这种局面维持了九年，直到你死。新君在你的葬礼上哭得很伤心，第二天就换掉了六个大臣。'
    },
    {
      id: 'retire_regret', pri: 7, title: '太上皇 · 悔不当禅', family: 'retire',
      match: (s, sc) => s.flags.includes('abdicated') && s.people < 48,
      desc: '你退得太早，或者退得太晚——这两件事的分别，你到死也没有想明白。'
        + '新君把朝政弄得一团糟，你在西内看着，什么也做不了。你开始后悔那个下午签下的字。'
    },

    /* ---------- 守成与平庸 ---------- */
    {
      id: 'steady', pri: 8, title: '中宗 · 无大功亦无大过', family: 'ordinary',
      match: (s, sc) => Math.abs(sc.merit - 50) < 12 && Math.abs(sc.welfare - 50) < 14,
      desc: '你在位二十余年，没有开疆，也没有失地；没有大治，也没有大乱。'
        + '史官给你写本纪的时候，用了很多"如故"两个字。这两个字，其实很难做到。'
    },
    {
      id: 'status_quo', pri: 7, title: '敬宗 · 萧规曹随', family: 'ordinary',
      match: (s, sc) => s.admin >= 52 && sc.merit < 55 && sc.merit >= 42,
      desc: '你照着前朝的规矩办事，一样没改。你觉得祖宗的法子既然能行一百年，就还能再行一百年。'
        + '这个判断在你活着的时候是对的。'
    },
    {
      id: 'peace_ignorant', pri: 6, title: '德宗 · 不知兵', family: 'ordinary',
      match: (s, sc) => sc.order >= 62 && s.army < 42 && sc.welfare >= 52,
      desc: '你在位时天下太平，你也就没怎么管过兵事。军费年年被挪去修河、赈灾、办庆典。'
        + '你死后的第十七年，边关告急，兵部打开武库，发现弓弦都朽了。'
    },
    {
      id: 'wooden', pri: 7, title: '穆宗 · 在位三十年', family: 'ordinary',
      match: (s, sc) => s.years >= 22 && s.authority < 42,
      desc: '你在位很久，久到很多人以为你会一直在那里。可这三十年里，真正由你决定的事不多。'
        + '你的本纪写得很长，因为年号占了很多行。'
    },
    {
      id: 'mediocre', pri: 5, title: '顺帝 · 就这样过去了', family: 'ordinary',
      match: (s, sc) => sc.merit < 45 && sc.welfare < 48,
      desc: '你登基，改元，临朝，生病，然后死了。中间那些年，你做过一些决定，多数没有起作用。'
        + '这个王朝在你手里没有变好，也没有立刻变坏。'
    },

    /* ---------- 特殊癖好 ---------- */
    {
      id: 'poet_king', pri: 8, title: '后主 · 词章传世', family: 'odd',
      match: (s, sc) => s.flags.includes('culture') && sc.merit < 55,
      desc: '你的词写得极好，好到后来的选本里一定有你的名字。你的政事一塌糊涂，好到后来的史书里'
        + '一定要提一句"其亡也忽焉"。这两件事放在同一个人身上，后人议论了一千年。'
    },
    {
      id: 'daoist_king', pri: 7, title: '道君 · 好神仙', family: 'odd',
      match: (s, sc) => s.flags.includes('daoist') && s.health >= 28,
      desc: '你在宫里设了坛，自称"道君皇帝"。你给道士封了官，把佛寺改成了道观。'
        + '金兵南下的时候，你正在坛上作法。法没做成，你退位了。'
    },
    {
      id: 'buddha_king', pri: 6, title: '佛心天子', family: 'odd',
      match: (s, sc) => s.flags.includes('buddhist') && sc.welfare >= 48,
      desc: '你三次舍身入寺，每次都要大臣拿钱把你"赎"回来。这笔钱最后修了三座寺，养了两万僧。'
        + '你说这是功德。户部尚书说这是开支。你们说的其实不是一件事。'
    },
    {
      id: 'love_king', pri: 6, title: '情种 · 独宠一人', family: 'odd',
      match: (s, sc) => s.flags.includes('favor') || (s.flags.includes('empress_scholar') && s.admin < 42),
      desc: '你这一生只在意过一个人。她活着的时候，你想把天下最好的东西都给她；她死了以后，'
        + '你把她的画像挂在寝殿里，看了二十年。朝政在这二十年里，坏了不少。'
    },
    {
      id: 'mystery_tomb', pri: 6, title: '隐帝 · 葬处不明', family: 'odd',
      match: (s, sc) => s.years >= 8 && s.flags.includes('covered_famine'),
      desc: '关于你的葬处，有两种说法。一种说在城西的皇陵，一种说在北边的山里。'
        + '你的死因也有两种说法。你活着的时候善于把事压下去，死了以后，这些事自己浮了上来。'
    },

    /* ---------- 中段（填补高不成低不就的空档） ---------- */
    {
      id: 'iron_order', pri: 7, title: '肃宗 · 四境无事', family: 'ordinary',
      match: (s, sc) => sc.merit >= 55 && sc.order >= 60 && sc.welfare < 55,
      desc: '你在位那些年，边关没有大事，朝中也没有大案。你把力气都花在"不出事"上，'
        + '也确实没出事。百姓的日子过得去，只是过得紧。史书说你"能守成"，这个词一半是夸，一半是叹。'
    },
    {
      id: 'able_harsh', pri: 7, title: '显宗 · 能臣之主', family: 'ordinary', avoid: 'folk',
      match: (s, sc) => sc.merit >= 55 && sc.welfare < 50 && s.admin >= 45,
      desc: '你用人很准，办事很急，朝政在你手里转得比前几任都快。可你办的事，多半不是为了百姓。'
        + '你死之后，那些被你压着的人松了一口气，然后把你定的规矩一条条拆了。'
    },
    {
      id: 'long_mid', pri: 6, title: '长世 · 中人之资', family: 'ordinary',
      match: (s, sc) => s.years >= 20 && sc.total >= 42,
      desc: '你在位二十多年，不长不短。做过几件对的事，也做过几件错的事，都没有到改变国运的程度。'
        + '这个王朝在你手里老了一些，但还站得住。'
    },
    {
      id: 'army_strong', pri: 6, title: '武备之主 · 兵强民疲', family: 'military',
      match: (s, sc) => s.army >= 56 && sc.welfare < 52 && sc.merit >= 48,
      desc: '你把兵练得很齐，边将不敢糊弄你。军费是从百姓身上出的，你没觉得这有什么不对——'
        + '国要有兵，兵要吃饭。这笔账你算得清，只是没算过另一头。'
    },
    {
      id: 'unfinished', pri: 6, title: '志大 · 功半', family: 'ordinary',
      match: (s, sc) => sc.merit >= 52 && sc.welfare >= 45 && sc.welfare < 58,
      desc: '你想做的事很多。开了头，做到一半，就被别的事岔开了。你死的时候，案上还压着三份没批完的章程。'
        + '后来的继任者没有接着做，那三份章程在库里放了两百年。'
    },

    /* ---------- 兜底 ---------- */
    {
      id: 'fallback', pri: 3, title: '史失其名', family: 'ordinary',
      match: () => true,
      desc: '你当过皇帝，这一点是确定的。至于你做过什么，史书上只有寥寥几行，'
        + '其中一半还是关于祭祀和改元的。这不是你的错，也不是史官的错。'
    }
  ]

  /* ============================ 身后光景 ============================ */
  /*
   * 每 5 条一组：史书 / 陵墓 / 民间 / 继任 / 后世 / 子孙 / 遗物 / 争议 / 遗忘 / 传说
   * cond 只看局面与 flag，line 是"你死后，世界怎样记得你"
   */

  const hasHeir = s => s.heirs > 0

  const SCENES = [
    /* 一、史书 */
    { id: 'book_praise', name: '本纪写得体面', pri: 8, group: 'book', cond: (s, sc) => sc.merit >= 60,
      line: '史官写你的本纪，用了"恭俭爱人"四个字，又加了"有帝王之量"。你的缺点被写在最后一段，只有两句。' },
    { id: 'book_short', name: '本纪只有三页', pri: 8, group: 'book', cond: (s, sc) => sc.merit < 48,
      line: '你的本纪只有三页。第一页写即位，第二页写改元与灾异，第三页写崩。中间那些年，被一句"天下无事"带过去了。' },
    { id: 'book_argue', name: '史臣争论不休', pri: 7, group: 'book', cond: (s, sc) => sc.merit >= 55 && sc.welfare < 50,
      line: '后来的史官为你吵了两百年。一派说你功在社稷，一派说你耗尽了民力。两派引的是同一批材料。' },
    { id: 'book_erase', name: '本纪被人删过', pri: 7, group: 'book', cond: (s, sc) => s.authority >= 66 && s.people < 48,
      line: '你的本纪里有一段被墨涂掉了，涂得很仔细。后来的抄本都跟着涂。没有人知道那一段写的是什么。' },
    { id: 'book_private', name: '野史比正史厚', pri: 7, group: 'book', cond: (s, sc) => s.flags.includes('palace_coup') || s.flags.includes('will_change'),
      line: '正史里你只有寥寥数行，野史里你有一整本书。书里写你夜半杀过人，也写你救过一个宫女。两件事都没法证实。' },

    /* 二、陵墓 */
    { id: 'tomb_grand', name: '陵寝凿山而建', pri: 7, group: 'tomb', cond: (s, sc) => s.treasury >= 55,
      line: '你的陵凿山而建，修了十九年。石像生排了一里长。一千二百年后，它成了那个地方最有名的景点。' },
    { id: 'tomb_plain', name: '不起坟，不树碑', pri: 7, group: 'tomb', cond: (s, sc) => s.treasury < 40,
      line: '你的陵很简朴，封土只有两丈。你留了一道遗诏，说"毋藏金玉"。后来的盗墓者来过三次，都空手而归。' },
    { id: 'tomb_lost', name: '陵在何处，无人知', pri: 7, group: 'tomb', cond: (s, sc) => s.flags.includes('will_alone') || s.flags.includes('covered_famine'),
      line: '你的陵在何处，一直没有定论。县志里有一处记载，说"帝葬于山南"，可山南有三座土丘，没人分得清哪一座是。' },
    { id: 'tomb_robbed', name: '陵被掘过三次', pri: 7, group: 'tomb', cond: (s, sc) => s.collapse || s.people < 40,
      line: '你的陵被掘过三次。第一次是乱兵，第二次是饥民，第三次是官修的"清理"。最后一次，连棺椁都被抬走了。' },
    { id: 'tomb_pilgrim', name: '有人岁岁来祭', pri: 8, group: 'tomb', cond: (s, sc) => s.people >= 58,
      line: '你的陵前一直有人来。起初是官员，后来是百姓。直到今天，当地还有一个日子，人会带着酒和纸来，说是"看皇帝"。' },

    /* 三、民间 */
    { id: 'folk_song', name: '有一首歌唱你', pri: 8, group: 'folk', cond: (s, sc) => sc.welfare >= 60,
      line: '民间有一首歌，唱的是你年间的米价。词很粗，调子很简单，唱了两百年。会唱的人不知道你是谁，只知道"那年米便宜"。' },
    { id: 'folk_curse', name: '名字成了骂人的话', pri: 8, group: 'folk', cond: (s, sc) => s.people < 38,
      line: '你的名字成了骂人的话。小孩哭，大人说"再哭XX就来了"。这个用法流传了很久，久到没有人记得那个名字原本属于谁。' },
    { id: 'folk_story', name: '说书人编你的故事', pri: 7, group: 'folk', cond: (s, sc) => s.people >= 48,
      line: '茶馆里的说书人编了很多你的故事：你微服私访，你斩过贪官，你爱过一个民间女子。这些事你一件也没做过。' },
    { id: 'folk_avoid', name: '百姓不愿提起', pri: 7, group: 'folk', cond: (s, sc) => s.people < 45 && sc.welfare < 50,
      line: '你的年间，百姓不太愿意提起。老人说起那时候，只说"那年头"，然后就不说了。这两个字后面是什么，各家有各家的版本。' },
    { id: 'folk_play', name: '戏台上你是白脸', pri: 6, group: 'folk', cond: (s, sc) => s.authority >= 62 && s.people < 50,
      line: '戏台上你被画成白脸。剧本里的你杀忠臣、信小人、抢民女。写戏的人不在乎真假，看戏的人也不在乎。' },

    /* 四、继任 */
    { id: 'heir_good', name: '儿子守住了', pri: 8, group: 'heir', cond: (s, sc) => hasHeir(s) && sc.order >= 55,
      line: '你的儿子接了位，做得不算差。他照着你定的规矩办，只在两件事上改了你。改完之后，他到你灵前说了一遍。' },
    { id: 'heir_bad', name: '儿子把家败了', pri: 8, group: 'heir', cond: (s, sc) => hasHeir(s) && sc.order < 50,
      line: '你的儿子接了位，用了十一年把这个国家败光。他死的时候，史书上把他和你写在同一卷里，标题是"二帝本纪"。' },
    { id: 'heir_fight', name: '诸子争位', pri: 8, group: 'heir', cond: (s, sc) => s.heirs >= 2 && sc.order < 60,
      line: '你死后，你的几个儿子打了起来。打了四年，最小的那个赢了。他把两个哥哥的名字从玉牒上划掉了。' },
    { id: 'heir_none', name: '无人继位', pri: 8, group: 'heir', cond: (s, sc) => !hasHeir(s),
      line: '你没有儿子。宗室和朝臣议了半年，最后从远支里过继了一个。这个人跟你没有任何关系，却要叫你的牌位"皇考"。' },
    { id: 'heir_puppet', name: '继任者是个傀儡', pri: 7, group: 'heir', cond: (s, sc) => hasHeir(s) && s.authority < 40,
      line: '你的儿子接了位，可权力不在他手里。他做过的最大的决定，是把自己年号里的一个字改了。' },

    /* 五、后世 */
    { id: 'later_model', name: '后世以你为法', pri: 8, group: 'later', cond: (s, sc) => sc.merit >= 62,
      line: '后来的朝代修会典，把你的制度抄了大半。他们不一定知道那是你定的，只知道"旧例如此"。' },
    { id: 'later_warn', name: '后世以你为戒', pri: 8, group: 'later', cond: (s, sc) => sc.welfare < 42,
      line: '后来的皇帝被教导时，先生会说"毋效某某"。某某就是你。你的错误成了教材，这大概是另一种不朽。' },
    { id: 'later_forgot', name: '后世不记得你', pri: 7, group: 'later', cond: (s, sc) => sc.renown < 45,
      line: '两百年后，一个读书人翻到你的年号，想了很久，也没想起你在位时发生过什么。他翻过去了。' },
    { id: 'later_reform', name: '你的法子被人捡起来', pri: 7, group: 'later', cond: (s, sc) => s.flags.includes('reform') || s.flags.includes('salt_reform'),
      line: '你死后七十年，有人把你当年的奏疏翻出来，照着办了一遍。他成功了。史书上把这算作他的功劳。' },
    { id: 'later_name', name: '你的年号成了一个词', pri: 7, group: 'later', cond: (s, sc) => s.years >= 15 && sc.merit >= 50,
      line: '你的年号后来变成了一个词，用来形容一种瓷器、一种纸、一种做法。用这个词的人，大多不知道它是一个皇帝的年号。' },

    /* 六、子孙 */
    { id: 'kin_fade', name: '子孙散在民间', pri: 7, group: 'kin', cond: (s, sc) => hasHeir(s) && sc.order < 55,
      line: '你的子孙后来散在民间，改了姓。有一支在南方做了几百年郎中，家谱的第一页写着你的庙号，后面就不再提了。' },
    { id: 'kin_rich', name: '后代靠你的名字吃饭', pri: 6, group: 'kin', cond: (s, sc) => hasHeir(s) && s.treasury >= 50,
      line: '你的后代一直很富。他们靠的是你当年赐的那块地，和"某朝宗室"这四个字。改朝换代之后，这两个字还能换钱。' },
    { id: 'kin_purge', name: '宗室被清算', pri: 7, group: 'kin', cond: (s, sc) => s.collapse === 'authority' || s.collapse === 'people',
      line: '新朝建立后，你的宗室被清算了一遍。活下来的改了姓，有几家逃到了海上。他们的后人至今不说自己姓什么。' },
    { id: 'kin_daughter', name: '女儿的名字留在史里', pri: 6, group: 'kin', cond: (s, sc) => s.female,
      line: '你没有儿子，只有一个女儿。史书在写你的时候，顺带记了她一句："有母风。"这三个字，是她一生的全部记载。' },
    { id: 'kin_none', name: '一支断了', pri: 7, group: 'kin', cond: (s, sc) => !hasHeir(s),
      line: '你这一支到你就断了。太庙里的牌位后来被迁去了偏殿，再后来，连偏殿也拆了。' },

    /* 七、遗物 */
    { id: 'relic_edict', name: '一道诏书留了下来', pri: 8, group: 'relic', cond: () => true,
      line: '你的一道诏书留了下来，写在黄麻纸上。字不算好，但有力。博物馆把它放在第三展柜，标签上写着你的年号。' },
    { id: 'relic_sword', name: '那把刀还在', pri: 7, group: 'relic', cond: (s, sc) => s.origin.id === 'founder' || s.army >= 62,
      line: '你当年用过的那把刀还在，锈得很厉害。收藏它的人说这是"开国之物"，其实你只用它砍过一次人。' },
    { id: 'relic_robe', name: '一件洗过三次的龙袍', pri: 7, group: 'relic', cond: (s, sc) => s.treasury >= 55,
      line: '你的龙袍留下来一件，袖口磨破了，补过。看的人不太相信这是皇帝的衣裳，讲解员每次都要多解释一句。' },
    { id: 'relic_letter', name: '一封没寄出的信', pri: 7, group: 'relic', cond: (s, sc) => s.flags.includes('empress_scholar') || s.flags.includes('favor'),
      line: '你写过一封没有寄出的信，收信人的名字被涂掉了。信里说的是家常事。这封信被后人研究了两百年。' },
    { id: 'relic_coin', name: '你铸的钱还在流通', pri: 7, group: 'relic', cond: (s, sc) => s.years >= 12,
      line: '你年间铸的钱，后来还在流通。老百姓叫它"老钱"，比新钱值钱。有人把它串起来挂在门上，说是能镇邪。' },

    /* 八、争议 */
    { id: 'argue_legit', name: '得位正不正，还在吵', pri: 8, group: 'argue', cond: (s, sc) => s.origin.id === 'prince' || s.origin.id === 'child',
      line: '关于你得位正不正，学界还在吵。有人说遗诏是伪造的，有人说不是。你的骨头被挖出来验过，也没验出结论。' },
    { id: 'argue_death', name: '死因有三种说法', pri: 7, group: 'argue', cond: (s, sc) => s.health < 40 || s.collapse,
      line: '你的死因有三种说法：病死、被毒死、被勒死。三种说法都有材料支持。你活着的时候最讨厌别人猜你的心思，死了以后，所有人都在猜。' },
    { id: 'argue_tyrant', name: '是明君还是暴君', pri: 8, group: 'argue', cond: (s, sc) => sc.merit >= 52 && sc.welfare < 46,
      line: '有人说你是明君，有人说你是暴君。两边都能举出例子，而且都是真的。你这个人，经不起简单的好人坏人二分法。' },
    { id: 'argue_forge', name: '你的史料是假的', pri: 6, group: 'argue', cond: (s, sc) => s.authority >= 60,
      line: '有一种说法认为，关于你的最重要的那几份材料是后人伪造的。如果这个说法成立，你这个人就要重写。' },
    { id: 'argue_none', name: '没人有意见', pri: 6, group: 'argue', cond: (s, sc) => sc.merit < 52 && sc.welfare >= 48 && sc.renown < 55,
      line: '关于你，学术界基本没有争议。这不是因为你做得好，是因为关于你的材料太少，吵不起来。' },

    /* 九、遗忘 */
    { id: 'forget_name', name: '名字被念错', pri: 6, group: 'forget', cond: (s, sc) => sc.renown < 52,
      line: '你的名字在后来的书里被念错了，一错就是一千年。没有人去改，因为没有人确定哪个读音是对的。' },
    { id: 'forget_year', name: '年号记错了', pri: 6, group: 'forget', cond: (s, sc) => s.years < 10,
      line: '你的年号被记错了两年。这个错误出现在三种史书里，互相抄的。你实际在位的时间，比书上写的短。' },
    { id: 'forget_grave', name: '坟头成了菜地', pri: 6, group: 'forget', cond: (s, sc) => s.treasury < 45,
      line: '你的陵后来成了菜地。种菜的人不知道地下埋着谁，只觉得这块地肥。有一年他挖出一块碑，拿去垫了猪圈。' },
    { id: 'forget_line', name: '只剩一行字', pri: 7, group: 'forget', cond: (s, sc) => sc.renown < 45 && sc.merit < 50,
      line: '你在这个世界上留下的，只剩一行字：某年，某某即位，改元某某。连你的死都只占了半行。' },
    { id: 'forget_dust', name: '档案里全是灰', pri: 6, group: 'forget', cond: (s, sc) => s.admin < 35,
      line: '你年间的档案保存得很差。管库的人换了几任，丢了一批，霉了一批。后人研究你的时候，只能靠猜。' },

    /* 十、传说 */
    { id: 'legend_dragon', name: '传说你化龙而去', pri: 6, group: 'legend', cond: (s, sc) => s.flags.includes('daoist') || s.flags.includes('fengshan'),
      line: '有一种传说说你没有死，是乘龙升天了。这个传说在民间流传很广，还有一处"龙升之处"。那其实是个塌方的山坳。' },
    { id: 'legend_ghost', name: '宫里闹你的鬼', pri: 6, group: 'legend', cond: (s, sc) => s.authority >= 62 && s.people < 48,
      line: '宫里一直传说闹鬼。守夜的人说听见有人在殿里走动，走到龙椅前就停了。这个传说从你死后第三年开始，一直传到宫城被拆。' },
    { id: 'legend_treasure', name: '藏宝的传说', pri: 6, group: 'legend', cond: (s, sc) => s.treasury >= 60,
      line: '有一个关于你藏宝的传说。据说你把一批金银沉在了城外的湖里。三百年里，有人捞过七次，捞上来的只有石头。' },
    { id: 'legend_reborn', name: '说他还会回来', pri: 6, group: 'legend', cond: (s, sc) => s.people >= 55 && s.collapse,
      line: '你亡国之后，民间一直有个说法：你还会回来。这个说法传了几百年，每隔几十年就有人自称是你。他们都被杀了。' },
    { id: 'legend_bones', name: '骨头被供着', pri: 6, group: 'legend', cond: (s, sc) => s.flags.includes('buddhist'),
      line: '你火化后的骨殖被分成了七份，供在七座塔里。其中一座塔在战乱中被砸了，骨殖流落民间，据说能治病。' }
  ]

  /* ============================ 史臣曰 ============================ */

  const COMMENT_HEAD = [
    '史臣曰：',
    '论曰：',
    '赞曰：',
    '史臣某谨按：'
  ]

  const COMMENT_BODY = {
    high: [
      '在位若干年，海内称治。其始也勤，其终也怠，然功过相较，功多于过。',
      '承累世之敝，振而起之。其所设施，多为后世所遵。虽有可议，不掩其大。',
      '上承祖宗之业，下启数世之基。史称其"明于知人，善于任使"，非虚美也。',
      '其治也，百姓安之；其乱也，百姓亦安之。此非德厚，乃法立也。'
    ],
    mid: [
      '在位若干年，无大功，亦无大过。守成而已，然守成亦不易。',
      '其初锐意有为，中道而止。使假之年，所就未可量也。惜哉。',
      '承平之世，非有奇节。然能使天下不见兵革者数十年，亦可谓能矣。',
      '好名而寡实，多谋而少断。天下之坏，自其犹豫始。'
    ],
    low: [
      '在位若干年，政出多门，民不堪命。亡国之祸，非一日之积也。',
      '其初非无志也，为群小所蔽，终以不悟。悲夫。',
      '好察而不明，多疑而寡恩。左右畏之，莫敢言其失。',
      '以一人之私，易天下之公。及至事败，犹曰"非朕之过"。'
    ]
  }

  /* ============================ 朝政建议 ============================ */

  const ADVICE = {
    treasuryLow: {
      id: 'treasuryLow', title: '关于钱',
      cond: s => s.treasury < 38,
      text: '国库空了，不要第一反应就加赋。加赋是最快、也最贵的办法：它拿走的不只是今年的粮，还有明年种粮的人。先查三件事——漕运的损耗、军中的空额、宗室的禄米。这三处的水，比田赋深得多。'
    },
    peopleLow: {
      id: 'peopleLow', title: '关于民心',
      cond: s => s.people < 45,
      text: '民心不是靠诏书赢回来的。百姓判断一个皇帝，只看三件事：今年的粮价、来收税的人凶不凶、出了事有没有人管。这三件事都做到了，你不必下罪己诏；做不到，下十道也没用。'
    },
    armyLow: {
      id: 'armyLow', title: '关于兵',
      cond: s => s.army < 45,
      text: '兵不足的时候，最危险的不是外敌，是欠饷。欠饷的兵不会立刻反，他们会先抢百姓，然后才反。宁可裁掉三成兵额，也不要让留下的人拿不到粮。'
    },
    adminLow: {
      id: 'adminLow', title: '关于吏治',
      cond: s => s.admin < 45,
      text: '吏治坏了，不要指望杀几个人就能好。贪墨是制度的产物：一个县令的俸禄养不活一家人，他就必须贪。要么加俸，要么把他的手从钱粮上挪开。只杀人，不改制，三年之后还是这样。'
    },
    authorityLow: {
      id: 'authorityLow', title: '关于权',
      cond: s => s.authority < 45,
      text: '皇权弱的时候，不要同时得罪两方。你要挑一个暂时依靠，把另一方压下去，等站稳了再回头收拾。最忌讳的是两边都想压，结果两边都成了敌人。'
    },
    powerHigh: {
      id: 'powerHigh', title: '关于一家独大',
      cond: s => Math.max(s.scholar, s.eunuch, s.warlord, s.clan) > 62,
      text: '任何一方势力超过六成，都会开始想"为什么不能是我"。这不是忠诚问题，是结构问题。你要做的不是杀那个人，是把他的权力拆成三份，交给三个互相不服的人。'
    },
    noHeir: {
      id: 'noHeir', title: '关于国本',
      cond: s => s.heirs === 0 && s.year > 6,
      text: '国本不定，是王朝最贵的隐患。你没有儿子，百官就会开始押注；一押注，朝堂就会分成几派；一分派，你下的每一道诏书都会被解读成立场。过继也好，立幼也好，早定一日，少花十年。'
    },
    healthLow: {
      id: 'healthLow', title: '关于你自己',
      cond: s => s.health < 45,
      text: '你的身体是这个国家的一部分，而且是不可替换的那部分。少批一份折子，天不会塌；多熬一个通宵，可能就真的塌了。历史上死于勤政的皇帝，比死于荒淫的多。'
    },
    prestigeLow: {
      id: 'prestigeLow', title: '关于名声',
      cond: s => s.prestige < 40,
      text: '威望低的时候，不要靠大工程和大典礼来撑。那些东西只能让已经信你的人更信，让不信你的人更不信。威望是打出来的：打一场胜仗，办一件难案，或者在一个所有人都以为你会退的时候不退。'
    },
    general: {
      id: 'general', title: '关于这个位置',
      cond: () => true,
      text: '皇帝这份差事，最难的不是做决定，是在信息不全的时候做决定，并且承担后果。你会做错很多事。重要的不是不错，是错了之后还能改，改的时候还有人愿意替你去办。'
    }
  }

  return {
    EVENTS,
    ORIGINS,
    TRAITS,
    STAGES,
    ENDINGS,
    SCENES,
    ADVICE,
    COMMENT_HEAD,
    COMMENT_BODY,
    DYNASTY_NAMES,
    SURNAMES,
    GIVEN_NAMES,
    ERA_NAMES,
    TEMPLE_NAMES,
    POSTHUMOUS
  }
})
