/**
 * core/dyn-events-solo.js —— 王朝模拟器 · 独立节点
 *
 * 这里放"一辈子只可能遇到一次"的事：登基、大婚、亲政、封禅、遗诏……
 * 以及国势触底时必然浮上来的危机（权臣逼宫、军队哗变、饥民叩阙）。
 * 后者一律用 pinned + cond，不让它们靠随机——随机池一大，关键节点就会绝迹。
 */

;(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else root.DynEventsSolo = factory()
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const E = []

  function O(text, effects, result, extra) {
    return Object.assign({ text: text, effects: effects, result: result }, extra || {})
  }

  function add(ev) { E.push(ev) }

  /* =====================================================================
   * 即位：五种开局，第一年必出
   * ===================================================================== */

  add({
    id: 'open_founder', stage: 1, pinned: true, cond: s => s.year === 1 && s.origin.id === 'founder',
    title: '开国第一朝',
    scene: '战打了十一年，去年冬天攻下最后一座坚城。旧朝的玉玺在你案上，缺了一个角。'
      + '今天是你称帝后第一次大朝，殿上站着的这些人，一半是跟你从死人堆里爬出来的兄弟，一半是昨天才递了降表的旧臣。'
      + '他们都在等你开口。',
    options: [
      O('大封功臣，裂土以酬', { army: 8, warlord: 12, treasury: -8, authority: -6, people: 3 },
        '你封了三个异姓王、十二个侯。酒喝到半夜，有人抱着你哭，说当年在雪地里分过一个饼。你拍着他的背，想起那个饼其实是你抢来的。'),
      O('收兵权，重文抑武', { authority: 10, warlord: -14, army: -4, scholar: 6, people: 2 },
        '你赐了他们宅第、田产、丹书铁券，唯独没有给兵。有一个老将当场把酒碗放下了，你没有看他。此后十年，他们都很富，也都很闲。'),
      O('定都、定律、定税，先立规矩', { admin: 10, treasury: 4, people: 5, prestige: 6, authority: 2 },
        '你用了半年定都、定律、定税。三条规矩写在宫门外的石上，谁都能看。立国之初的规矩，往往比后来一百年的诏书都管用。')
    ]
  })

  add({
    id: 'open_heir', stage: 1, pinned: true, cond: s => s.year === 1 && s.origin.id === 'heir',
    title: '大行皇帝宾天',
    scene: '先帝崩于昨夜子时。你跪在灵前，听见殿外的钟敲了二十七下。'
      + '顾命的三位大臣已经站在阶下，手里是先帝的遗诏。遗诏里说你"仁孝可托"，也说了一句话：'
      + '"军国重事，与三臣共议。"这句话，是他们三个人今天敢站在这里的凭据。',
    options: [
      O('遵遗诏，与三臣共议', { scholar: 8, authority: -8, admin: 4, people: 2, prestige: 2 },
        '你照遗诏办事，凡事都先问过三位老臣。朝局很稳，稳得像一潭水。你每天批的折子，都是他们看过的。'),
      O('尊其名，亲揽庶政', { authority: 8, scholar: -4, admin: 3, people: 3 },
        '你给三位老臣加了太师、太傅、太保的衔，然后把奏折的进呈路线改了一条——从他们门前，改到你的案头。'),
      O('先定内廷，再论外朝', { eunuch: 8, authority: 5, scholar: -8, clan: 2 },
        '你把内侍省的人换了一遍，换上了在东宫时就跟着你的人。外朝还没有反应过来，宫门已经在你手里了。')
    ]
  })

  add({
    id: 'open_child', stage: 1, pinned: true, cond: s => s.year === 1 && s.origin.id === 'child',
    title: '八岁登极',
    scene: '你八岁。龙椅太高，脚下垫了一只木凳，是内侍临时找来的。'
      + '太后坐在你右侧的帘后，顾命大臣站在阶下。朝贺的声音很大，你有点怕，手抓着扶手不敢动。'
      + '散朝后，帘后伸出一只手，替你理了理衣领。',
    options: [
      O('一切听太后与辅臣', { clan: 10, authority: -10, admin: 3, people: 2 },
        '此后七年，诏书上是你的年号，话是别人的话。你在经筵上很用功，先生夸你"天资聪颖"。你把这句话记了很久。'),
      O('读书、习射，不动声色', { admin: 4, health: 4, authority: 2, people: 1 },
        '你每天读四个时辰的书，午后习射。朝政的事你不问，问也没人真答。你在等一个不需要木凳的年纪。'),
      O('亲近内侍，另结耳目', { eunuch: 12, authority: 3, scholar: -6, clan: -4 },
        '你信任身边的内侍胜过朝臣。他们会把外面的消息悄悄告诉你，包括谁在背后说你"年幼可欺"。')
    ]
  })

  add({
    id: 'open_prince', stage: 1, pinned: true, cond: s => s.year === 1 && s.origin.id === 'prince',
    title: '自藩邸入继大统',
    scene: '先帝无嗣，宗正与群臣迎你入京。你从封地出发，走了十九天，进京那日下着小雨。'
      + '礼部安排你在先帝灵前即位，然后把你的生父称为"皇叔"。这件事写在仪注上，像一件早就定好的事。'
      + '可你记得生父临终前握着你的手说的话。',
    options: [
      O('遵礼部议，称生父为皇叔', { scholar: 8, authority: -4, admin: 3, prestige: 3 },
        '你签了字。生父的牌位没有进太庙，供在了城外的家庙里。每年清明你派人去，自己一次也没去过。'),
      O('追尊生父，虽千万人吾往矣', { authority: 6, scholar: -12, people: 4, clan: 4, prestige: -3 },
        '你追尊生父为帝，入太庙。二百余名官员跪在左顺门外哭谏，哭声传进宫里。你命令锦衣卫把为首的十八人下了诏狱。'),
      O('缓议，先安人心', { admin: 4, scholar: 3, authority: -2, people: 4 },
        '你把这件事压了下来，说"待山陵事毕再议"。一压就是三年。三年后，已经没有几个人还记得该议这件事了。')
    ]
  })

  add({
    id: 'open_late', stage: 1, pinned: true, cond: s => s.year === 1 && s.origin.id === 'late',
    title: '接手一个空壳',
    scene: '先帝留下的国库，清点之后只剩十一万两。北边欠饷八个月，南边河工停了两年，'
      + '户部尚书呈上的账册最后一页写着"无以为继"四个字，墨迹很淡，像是写的人也不愿意承认。'
      + '你是这个王朝的第七个皇帝，今年二十四岁。',
    options: [
      O('清查亏空，追赃补库', { treasury: 10, admin: 6, scholar: -8, clan: -4, people: -2 },
        '你命人查了三个月，追出赃银四十七万两。第一个被查的是先帝的宠臣，他在狱中咬出了十一个人。'),
      O('加赋应急，先渡眼前', { treasury: 12, people: -12, admin: -3, authority: 2 },
        '加赋的诏书下去了。国库缓过一口气，可这一年冬天，三个州报了"民逃"，逃的人把户口册上的名字划掉了。'),
      O('裁撤冗费，节用自强', { treasury: 6, admin: 5, people: 4, prestige: -2, clan: -6 },
        '你裁了宫中的用度、停了三处工程、减了宗室的禄米。宫里有人抱怨，你把抱怨的人调去看守库房。')
    ]
  })

  /* =====================================================================
   * 人生大事
   * ===================================================================== */

  add({
    id: 'wedding', stage: 0, pinned: true, cond: s => s.age >= 17 && !s.flags.includes('married'),
    title: '大婚',
    scene: '礼部呈上皇后人选三人：太傅之女、节度使之女、尚书之女。'
      + '画像画得都很端庄，看不出什么。你翻到最后一页，看见太傅之女的名字底下有一行小字："性沉静，好读书。"'
      + '这行字不是礼部写的。',
    options: [
      O('立太傅之女，结好士林', { scholar: 8, clan: 2, authority: -2, prestige: 3, treasury: -6 },
        '大婚办了七日，赦天下。皇后确实沉静，夜里会替你读奏折，读到不妥处会停一下。你后来养成习惯，看她停在哪里。',
        { flags: ['married', 'empress_scholar'] }),
      O('立节度使之女，以安边镇', { warlord: 8, army: 3, scholar: -4, treasury: -6, people: 2 },
        '大婚那日，边镇送来的贺礼装了三十车。皇后会骑马，性子爽利，宫里的人起初不习惯，后来都服她。',
        { flags: ['married', 'empress_warlord'] }),
      O('立尚书之女，取其家世平稳', { clan: 4, admin: 3, scholar: 2, treasury: -5, people: 2 },
        '大婚办得体面，没有哪一方特别得意。皇后很会管家，内廷的账目从此清楚了不少。',
        { flags: ['married', 'empress_stable'] }),
      O('不立后，先定边事', { authority: 3, scholar: -4, clan: -3, army: 2, people: -2 },
        '你把册立的折子压下，说"国事未定，何以为家"。这话传出去，得了个"勤政"的名声，也有人说你"薄情"。')
    ]
  })

  add({
    id: 'rule_in_person', stage: 2, pinned: true, cond: s => s.origin.id === 'child' && s.age >= 16,
    title: '亲政',
    scene: '你十六岁了。太后的帘子还挂在那里，顾命大臣的位子还空着一个。'
      + '今日朝会，你第一次没有等帘后的示意，自己开口问了一句河工的账。殿上安静了一瞬。'
      + '散朝后，太后派人来问："今日为何不先问过？"',
    options: [
      O('请太后撤帘，还政于朕', { authority: 12, clan: -12, scholar: -4, people: 4, prestige: 4 },
        '你亲自去慈宁宫，跪了半个时辰。太后最后说了一句"你长大了"，第二日撤了帘。你在帘子收起来的那天，才真正看见整座大殿。'),
      O('仍请太后预闻，渐收其权', { authority: 3, clan: 2, admin: 4, people: 1 },
        '你没有撤帘，只把几件要紧的事挪到自己手里。太后还坐在那里，可问的事越来越少了。'),
      O('先罢顾命大臣，以立威', { authority: 8, scholar: -10, admin: 2, people: -3, prestige: -2 },
        '你以"年老致仕"为名，罢了两位顾命。第三位是自己请辞的。朝堂上换了一批年轻的面孔，他们只认得你。')
    ]
  })

  add({
    id: 'fief_sacrifice', stage: 3, pinned: true, cond: s => s.prestige >= 62 && !s.flags.includes('fengshan'),
    title: '泰山封禅',
    scene: '礼部与太史令合奏：天下太平，五谷丰登，请上泰山封禅，以告成功于天。'
      + '封禅是千年一遇的典礼，也是千年一遇的花费。车队要走两个月，随行三千人，沿途修路、建行宫。'
      + '有老臣私下说："此非其时。"',
    options: [
      O('行封禅，彰一代之治', { treasury: -16, prestige: 14, people: -6, authority: 5, health: -4 },
        '你登上了泰山。山顶的风很大，仪仗的旗子吹得直响。你读完玉册，忽然觉得有点冷——那种"到此为止"的冷。回程走了一个月，沿途百姓跪在路边，你看见其中的一些人很瘦。',
        { flags: ['fengshan'] }),
      O('不许，以财用不足为辞', { admin: 4, people: 5, treasury: 4, prestige: -2 },
        '你说"朕有何德，敢告于天"。礼部再请，你仍不许。这件事被记进了史书，写法是"上谦让不受"。'),
      O('遣官代祭，减其仪', { treasury: -5, prestige: 5, people: 1, admin: 2 },
        '你派了太常卿代祭，仪仗减半。典礼办得不算隆重，也不算草率。泰山上的碑刻了你的年号，字很小。')
    ]
  })

  add({
    id: 'move_capital', stage: 3, weight: 0.5,
    title: '迁都之议',
    scene: '有大臣上言：旧都偏西，漕运艰难，宜迁都于天下之中。'
      + '这话不是第一次说。迁都动的是根本：宗庙、陵寝、百官、禁军，还有几十万户人家。'
      + '支持的人说这是"再造之机"，反对的人说这是"动摇国本"。两边说的都对。',
    options: [
      O('决意迁都，限期三年', { treasury: -20, people: -10, prestige: 8, authority: 6, admin: -3 },
        '迁都的诏书下了。三年里，官道上全是车马。新都的宫城建成那日，你站在城楼上，看见远处还是一片荒地。'),
      O('不迁，改修漕运', { treasury: -8, people: 3, admin: 5, prestige: 2 },
        '你决定不迁，把钱用在疏通运河上。粮船从此少走四百里。这个决定不如迁都气派，但每年省下的粮食养活了不少人。'),
      O('付廷议，不置可否', { admin: 2, authority: -3, people: 1, prestige: -1 },
        '廷议开了半年，没有结论。这件事最后不了了之，只在史馆留下了一叠厚厚的奏疏。')
    ]
  })

  add({
    id: 'abdicate', stage: 0, pinned: true, cond: s => s.age >= 56 && s.heirs > 0 && !s.flags.includes('abdicated'),
    title: '禅位之念',
    scene: '今年你五十六岁。批折子到三更，字会在眼前浮起来。太子已经三十岁，在朝中有了自己的人。'
      + '有一日他替你读折子，读到一半停下来，提了一个处置的法子——和你心里想的一样。'
      + '那天夜里你睡不着，想的是：如果再干十年，这天下会更好，还是只是更旧。',
    options: [
      O('禅位于太子，退居太上皇', { authority: -10, health: 8, people: 5, prestige: 4, clan: 2 },
        '禅位的典礼办得很体面。你搬去了西内，园子里有棵老槐树。太子每日来请安，起初是每日，后来是三日一次。你不再问朝政，只问今年的雨水。',
        { flags: ['abdicated'] }),
      O('不禅，再撑几年', { health: -6, authority: 4, clan: -4, people: -2 },
        '你把这件事压了下去，此后再没人提。太子仍旧每日来请安，只是话少了一些。你有时候会想，他是不是也在算日子。'),
      O('使太子监国，朕总其成', { admin: 5, people: 4, authority: -3, health: 3, clan: 3 },
        '太子监国，你退到幕后。头半年你还会改他的批红，后来改得少了。有一天你发现，自己已经一个月没看折子了。')
    ]
  })

  add({
    id: 'last_edict', stage: 0, pinned: true, cond: s => (s.health < 32 || (s.age >= 68 && s.health < 50)) && !s.flags.includes('will_written'),
    title: '遗诏',
    scene: '太医退出去以后，殿里只剩下烛火的声音。你让人把纸笔拿来，手有点抖，第一行写得歪。'
      + '遗诏要写三件事：传位与谁、辅政何人、还有一句给自己的评语。最后这一句，你改了三次。',
    options: [
      O('传位太子，托孤于老臣', { admin: 4, people: 4, prestige: 3, clan: 2 },
        '你写下太子的名字，又点了两位老臣辅政。最后一句你写的是："朕在位若干年，无大功，亦无大过。"写完之后，你觉得轻松了些。',
        { flags: ['will_clear'] }),
      O('传位太子，不设辅臣', { authority: 5, clan: -3, people: 2, admin: -2 },
        '你只写了传位，没有写辅政。你想让他自己走。笔搁下的时候，你想起自己当年接位时，阶下站着三个顾命大臣。',
        { flags: ['will_alone'] }),
      O('废长立幼，以保社稷', { clan: -8, people: -4, admin: -3, authority: 3, prestige: -3 },
        '你改了继承的人。这道诏书封在匣里，只有三个人知道。你死之后，它会掀起什么，你已经管不了了。',
        { flags: ['will_change'] })
    ]
  })

  /* =====================================================================
   * 危机：国势触底时必然浮上来
   * ===================================================================== */

  add({
    id: 'crisis_people', stage: 0, pinned: true, cond: s => s.people < 22 && !s.flags.includes('crisis_people_done'),
    title: '饥民叩阙',
    scene: '今晨宫门外聚了两千余人，多是妇孺。他们没有喊，也没有冲，只是跪着，手里举着空的碗。'
      + '京兆尹请示是否驱散。禁军在门内列了队，刀没有出鞘。'
      + '你在城楼上看了很久，风把他们的哭声吹得断断续续。',
    options: [
      O('开宫门，发内帑赈之', { treasury: -10, people: 14, prestige: 5, authority: -2 },
        '宫门开了。内帑的银子当场发下去，每人二两。有人磕头磕出了血。这件事传遍了天下，传到后来，变成了"天子散财"。',
        { flags: ['crisis_people_done', 'loved_by_people'] }),
      O('驱散，首恶下狱', { people: -8, authority: 6, prestige: -6, admin: -2 },
        '禁军出动了，没有杀人，但打伤了几十个。跪着的人散了，地上的碗还在。此后京城的街上，討饭的人少了很多——他们去了别处。',
        { flags: ['crisis_people_done', 'hated_by_people'] }),
      O('责有司赈济不力，罢其官', { people: 6, admin: 5, treasury: -4, authority: 2 },
        '你罢了京兆尹，命新任者三日内发粮。粮发下去了，人散了。可你心里清楚，粮仓里本来就不该是空的。',
        { flags: ['crisis_people_done'] })
    ]
  })

  add({
    id: 'crisis_treasury', stage: 0, pinned: true, cond: s => s.treasury < 12 && !s.flags.includes('crisis_treasury_done'),
    title: '国库告罄',
    scene: '户部尚书跪在殿中，把最后一本账举过头顶。账上写：现存银四万七千两，本月应支军饷三十万两。'
      + '他说完就伏在地上不起来。殿里没有人说话，能听见外面乌鸦叫。',
    options: [
      O('借于富商，许以盐引', { treasury: 12, clan: 5, people: -3, admin: -2 },
        '京中八家大商借了银子，换的是盐引和"义商"的匾。这块匾后来挂在每一家的门楣上，比官府的告示还显眼。',
        { flags: ['crisis_treasury_done', 'merchant_debt'] }),
      O('加征一年，事急从权', { treasury: 15, people: -12, admin: -3, authority: 3 },
        '加征的诏书连夜发往各州。军饷发下去了，兵没有哗变。这一年冬天，各州的"民逃"比往年多了三成。',
        { flags: ['crisis_treasury_done', 'tax_harsh'] }),
      O('裁军三万，节其饷', { treasury: 10, army: -10, people: 2, warlord: -4 },
        '裁军的令下了，三万兵回了乡。饷银省下来了。边将上了一道折子，只写了一句话："臣恐此后无以守边。"',
        { flags: ['crisis_treasury_done', 'army_cut'] })
    ]
  })

  add({
    id: 'crisis_army', stage: 0, pinned: true, cond: s => s.army < 22 && !s.flags.includes('crisis_army_done'),
    title: '兵变',
    scene: '北边来报：三镇兵变，杀主将，据城。起因是欠饷十四个月。'
      + '乱兵没有南下，他们在城里守着，派了人来京里说话——要钱，也要一个说法。'
      + '兵部说这是"叛"，必须剿；户部说库里没钱，剿不起。',
    options: [
      O('发帑补饷，赦其罪', { treasury: -12, army: 8, authority: -5, people: 3, warlord: 4 },
        '银子运到了城下。乱兵开了门，跪了一地。为首的被授了副将。此例一开，别镇的兵也开始"欠饷三月，聚众请饷"。',
        { flags: ['crisis_army_done'] }),
      O('调邻镇讨之，以儆效尤', { army: -6, treasury: -8, authority: 6, people: -5, warlord: 6 },
        '邻镇的兵进了城。杀了七百人，城里的血洗了三日。此后再没有兵变，也再没有兵愿意死战。',
        { flags: ['crisis_army_done', 'army_afraid'] }),
      O('斩主将，遣使抚谕', { army: 3, authority: 3, people: 1, warlord: -5, treasury: -5 },
        '你把责任推给了已死的主将，说"刻饷者已死，尔等无罪"。乱兵散了。这个说法不太经得起查，但没有人查。',
        { flags: ['crisis_army_done'] })
    ]
  })

  add({
    id: 'crisis_authority', stage: 0, pinned: true, cond: s => s.authority < 28 && s.scholar > 55 && !s.flags.includes('crisis_authority_done'),
    title: '权臣逼宫',
    scene: '今日朝会，你刚要开口，宰相先说了话。他说的是人事任命，念了十一个名字，念完问："陛下以为如何？"'
      + '殿上的人都在看你。你注意到，禁军的统领站在他那一侧。你数了数，殿上站着的，你认得的人不到一半。',
    options: [
      O('隐忍，待其隙', { authority: -4, health: -4, admin: 2, people: 1 },
        '你说"依卿所奏"。他谢恩，退下。那天夜里你在灯下写了很久，写完又烧了。你还年轻，还可以等。',
        { flags: ['crisis_authority_done', 'endured'] }),
      O('当廷驳之，收其权', { authority: 12, scholar: -12, health: -5, prestige: 3 },
        '你说"此事不必议"，然后把那十一个名字念了一遍，一个个驳回去。他站在那里，脸色变了几次。散朝后，你换了禁军的统领。',
        { flags: ['crisis_authority_done', 'purged_minister'] }),
      O('结内侍与宗室，以制外朝', { eunuch: 10, clan: 6, authority: 4, scholar: -8 },
        '你用了内侍去查他的门生，用了宗室去分他的权。半年后他自请致仕。你准了，赐了很多东西。',
        { flags: ['crisis_authority_done', 'eunuch_rise'] })
    ]
  })

  add({
    id: 'crisis_eunuch', stage: 0, pinned: true, cond: s => s.eunuch > 68 && !s.flags.includes('crisis_eunuch_done'),
    title: '内廷之权',
    scene: '今日你才发现，六部的折子有一半是先送到内侍省"分类"的。分过类的折子，要紧的会放在上面——'
      + '按谁的标准，没有人说得清。掌印太监跪着回话，态度恭敬，每一句都答得滴水不漏。'
      + '你忽然想起，上一个说"内臣不可干政"的御史，已经外放三年了。',
    options: [
      O('尽诛宦官，还政外朝', { eunuch: -30, scholar: 10, authority: 4, admin: 5, people: 3, health: -3 },
        '那一夜宫里杀了很多人。血腥味三天没散。外朝称颂"圣断"，可此后再没有人在你身边，把外面的事悄悄告诉你。',
        { flags: ['crisis_eunuch_done', 'eunuch_purged'] }),
      O('分其权，用外朝制之', { eunuch: -10, scholar: 5, admin: 4, authority: 2 },
        '你把内廷的权分给了三个人，又让外朝复核。他们互相牵制，你的案头从此多了一倍的折子。',
        { flags: ['crisis_eunuch_done'] }),
      O('倚之如故，以外朝为敌', { eunuch: 8, scholar: -10, authority: 4, people: -4, admin: -4 },
        '你让掌印太监兼了提督，从此他有兵。外朝再没有人敢递"裁抑内侍"的折子。你办事快了很多，也再听不到别的声音。',
        { flags: ['crisis_eunuch_done', 'eunuch_rule'] })
    ]
  })

  add({
    id: 'crisis_warlord', stage: 0, pinned: true, cond: s => s.warlord > 70 && !s.flags.includes('crisis_warlord_done'),
    title: '藩镇之患',
    scene: '三镇节度使联名上表，请"兼领盐铁、便宜行事"。表文写得恭顺，末尾盖了三方大印。'
      + '兵部的密报说，三镇的兵加起来有十七万，比京营多一倍。他们的粮，是他们自己收的。',
    options: [
      O('许之，暂安其心', { warlord: 8, authority: -8, treasury: -4, people: -2 },
        '你准了。三镇从此赋税不入，兵甲自备。他们每年进贡一次，贡物很丰厚。你收下的时候，觉得自己像个收租的。',
        { flags: ['crisis_warlord_done', 'warlord_autonomy'] }),
      O('削其权，召其入朝', { warlord: -12, authority: 8, army: 3, people: -4, prestige: 2 },
        '三镇中两镇奉诏，一镇举兵。举兵的那一镇打了半年，最后被另外两镇合击而灭。你坐收了两镇的忠心，也欠了他们一笔人情。',
        { flags: ['crisis_warlord_done'] }),
      O('以文臣代武将，逐步收权', { admin: 5, warlord: -8, army: -3, authority: 3 },
        '你派了文臣去做监军，又慢慢把节度使调回京里做官。这个过程用了六年，没有流血。代价是边军的战力一年不如一年。',
        { flags: ['crisis_warlord_done'] })
    ]
  })

  add({
    id: 'crisis_clan', stage: 0, pinned: true, cond: s => s.clan > 70 && !s.flags.includes('crisis_clan_done'),
    title: '宗室坐大',
    scene: '宗正寺呈上玉牒：在京宗室已逾三千人，岁支禄米一百二十万石，占天下漕粮的四成。'
      + '更要紧的是，几位亲王在朝中各有门生，廷议时一呼百应。'
      + '他们是你的血亲。可他们也是离龙椅最近的人。',
    options: [
      O('推恩分封，散其势力', { clan: -14, authority: 6, admin: 4, treasury: -4, people: 2 },
        '你把几个大宗分成了十余个小宗，各归封地，不得留京。禄米的总数少了，怨气散了，亲情也淡了。',
        { flags: ['crisis_clan_done'] }),
      O('削其禄米，裁其属官', { clan: -10, treasury: 8, admin: 3, people: -2, prestige: -2 },
        '禄米减了四成，宗室的属官裁了三分之二。有人在太庙前哭，说"太祖的子孙不该如此"。你没有去看。',
        { flags: ['crisis_clan_done'] }),
      O('厚其禄，收其心', { clan: 8, treasury: -8, people: -3, authority: 2 },
        '你加了禄米，赐了宅第。宗室们很感动，写了很长的谢表。你看着那些表，想起的是他们手里的人。',
        { flags: ['crisis_clan_done'] })
    ]
  })

  add({
    id: 'crisis_corrupt', stage: 0, pinned: true, cond: s => s.admin < 24 && !s.flags.includes('crisis_corrupt_done'),
    title: '政令不出宫门',
    scene: '你下了一道查贪的诏书，三个月后，各州回报"并无此事"。'
      + '你不信，派了身边的宦官去查，查回来的结果是"有，但都是小吏"。'
      + '又派了御史去查，御史在路上病故了。你终于明白：这张网，是从底下织上来的。',
    options: [
      O('遣亲信分赴诸道，绕开有司', { admin: 8, treasury: 5, people: 4, eunuch: 6, scholar: -5 },
        '你派了十二个亲信，每人带一道密旨。三个月后，革职的知县有一百四十人。地方上的规矩清了一阵，然后慢慢又长回来。',
        { flags: ['crisis_corrupt_done'] }),
      O('严刑峻法，杀一儆百', { admin: 6, people: 3, authority: 5, prestige: -3, scholar: -6 },
        '你杀了一个布政使，抄了三个知府的家。官场震动，办事效率反而高了两年。两年之后，新的规矩长了出来，比旧的更隐蔽。',
        { flags: ['crisis_corrupt_done', 'harsh_rule'] }),
      O('改法易制，使不能贪', { admin: 4, people: 2, treasury: 3, scholar: -3, authority: 1 },
        '你改了税制和考成法，把收税的路子截短了一截。贪墨没有绝，但难了很多。这件事见效慢，你没有看到全部的结果。',
        { flags: ['crisis_corrupt_done', 'reform'] })
    ]
  })

  /* =====================================================================
   * 朝堂插曲（条件触发，不必每局都出）
   * ===================================================================== */

  add({
    id: 'dream', stage: 0, weight: 0.4, cond: s => s.year > 6,
    title: '梦见先帝',
    scene: '你梦见先帝坐在御座上，背对着你。你想走过去，腿却迈不动。他没有回头，只说了一句：'
      + '"这天下，你守得怎么样？"你醒了，天还没亮，值夜的内侍在门外打盹。',
    options: [
      O('早起临朝，加意政事', { admin: 3, health: -2, authority: 2 },
        '那一天你比平时早了一个时辰。朝臣们到的时候，你已经坐在那里了。没有人知道为什么。'),
      O('召史官问前朝得失', { admin: 4, prestige: 2, scholar: 2, health: -1 },
        '你把前朝实录调来读了一个月。读到最后，你明白先帝那句话不是问句，是提醒。'),
      O('去太庙，独自站了半日', { people: 2, authority: 2, health: -1, prestige: 2 },
        '太庙里很静。你在先帝的牌位前站了很久，什么也没说。出来时，守庙的老吏说你的脸色好了一些。')
    ]
  })

  add({
    id: 'ballad', stage: 0, weight: 0.4, cond: s => s.year > 4,
    title: '民间童谣',
    scene: '京中孩子唱起一首新童谣，词是："今年麦，明年谷，天子脚下无米粥。"'
      + '教坊司把它采了上来，说"民间俚语，不足道"。可童谣这种东西，从来不会无缘无故地长出来。',
    options: [
      O('查其源，禁其唱', { authority: 3, people: -5, admin: -2, prestige: -3 },
        '顺天府抓了几个教唱的人，童谣却传得更远了。后来连宫里的孩子都会哼两句。'),
      O('不查，只令有司平粜', { people: 6, treasury: -5, admin: 2, prestige: 2 },
        '你没有追究唱歌的人，只让常平仓开粜。米价落了，童谣自己就没人唱了。'),
      O('命乐府采之，以观民风', { admin: 3, people: 3, prestige: 3, scholar: 2 },
        '你让人把童谣记下来，编进乐府。这个做法被后世称为"采风"。当时的人只觉得奇怪：天子怎么会关心小孩唱什么。')
    ]
  })

  add({
    id: 'remonstrance', stage: 0, weight: 0.5, cond: s => s.year > 5,
    title: '死谏',
    scene: '御史抬着棺材上了殿，跪在阶下，把奏疏举过头顶。疏里说你的某项政令"足以亡国"，'
      + '言辞极重，末尾写着"臣今以死谏，惟陛下察之"。殿上的人都屏住了呼吸。',
    options: [
      O('纳其言，罢前议', { admin: 5, people: 4, prestige: 4, authority: -4, scholar: 6 },
        '你走下台阶，把他扶起来，说"卿之言是"。这件事在士林中传了很久。后来递谏书的人多了，你的政令也慢了。'),
      O('斥其狂悖，下狱', { authority: 6, scholar: -8, people: -4, prestige: -3 },
        '他被下了狱。三个月后死在狱中。此后再没有人抬着棺材上殿，奏疏里的"亡国"两个字也绝迹了。'),
      O('留其疏，不加罪', { admin: 2, scholar: 3, authority: -1, prestige: 2 },
        '你没有准，也没有罚。那封疏留在了案头，你偶尔会翻一下。他还在做御史，只是不再上疏。')
    ]
  })

  add({
    id: 'plague_palace', stage: 0, weight: 0.3, cond: s => s.year > 8,
    title: '宫中时疫',
    scene: '宫里病了二十几个人，先是一个洒扫的小太监，后来是两个答应。太医院说是"时气"，'
      + '不敢说重话。皇后主张把病人挪出去，太后主张封宫。你站在两宫之间，闻见廊下熏着醋。',
    options: [
      O('移出宫外，隔离医治', { health: 4, people: 2, clan: -2, treasury: -3 },
        '病人挪到了城外的一处皇庄。疫情断了。有一个答应死在那里，葬得很简单。'),
      O('封宫，不许出入', { health: 6, authority: 3, people: -3, clan: 2 },
        '宫门封了二十天。疫情没传开，可宫里的人心散了一阵。解封那天，有个小太监在墙根下哭。'),
      O('亲往视疾，以安众心', { health: -4, prestige: 5, people: 4, clan: -2 },
        '你去看了病人。太医跪着拦，没有拦住。这一趟让宫里的人记了很久，也让你的身体差了很久。')
    ]
  })

  add({
    id: 'old_friend', stage: 0, weight: 0.4, cond: s => s.year > 10,
    title: '故人',
    scene: '一个当年在东宫陪你读书的人，如今在外地做小官。他托人递了一封信，没有求官，只说了几句家常，'
      + '末尾写："殿下若还记得后园的枣树。"信纸是粗的，字还是当年那个样子。',
    options: [
      O('召其入京，授一闲职', { scholar: 3, people: 2, clan: -1, treasury: -2 },
        '他来了。人胖了，话少了，见你时行了很重的礼。你们聊了半个时辰的旧事，然后他说"陛下万机"，起身告退。'),
      O('赐书慰之，不召', { admin: 2, prestige: 1, people: 1 },
        '你回了一封信，写了三页，说的都是当年的事。信送出去以后，你在后园站了一会儿。枣树还在。'),
      O('不答', { authority: 2, people: -1, health: -1 },
        '你把信收进匣子里，没有回。这样做是对的——天子不该有私交。可你那天晚饭吃得很少。')
    ]
  })

  add({
    id: 'crown_ceremony', stage: 0, weight: 0.4, cond: s => s.heirs > 0 && s.year > 12,
    title: '皇子冠礼',
    scene: '皇子今年二十岁，行冠礼。礼部拟了三套仪注，最隆重的那套要百官称贺、大赦天下。'
      + '他站在阶下，个子比你还高了。你忽然想起他小时候怕打雷，会钻进你怀里。',
    options: [
      O('大办，赦天下，以固国本', { prestige: 5, people: 3, treasury: -6, clan: 3, authority: 2 },
        '冠礼办得很隆重。百官称贺，天下大赦。他穿着冕服站在那里，很像一个皇帝了。你看着，心里说不清是欣慰还是别的。'),
      O('从简，唯亲族观礼', { treasury: 3, clan: -2, people: 1, admin: 2 },
        '冠礼办得简单，只有宗亲在场。他行完礼，你把自己的旧冠给了他。那顶冠有些旧了，他戴得很正。'),
      O('命其出阁读书，兼理部务', { admin: 5, people: 2, prestige: 2, clan: 2 },
        '冠礼之后，你让他去户部观政。他第一天上值就迟到了，被尚书参了一本。你把折子转给他看，没有多说什么。')
    ]
  })

  add({
    id: 'prince_death', stage: 0, weight: 0.25, cond: s => s.heirs > 0 && s.year > 8,
    title: '皇子夭折',
    scene: '小皇子病了三日，太医院用了所有的方子。第四日清晨，乳母抱着他出来，没有说话。'
      + '你伸手摸了摸他的脸，还是软的。皇后在旁边晕了过去。外面的天很好，有鸟在叫。',
    options: [
      O('辍朝七日，亲为治丧', { health: -4, people: 3, prestige: 2, admin: -2 },
        '你辍朝七日，亲自写了圹志。那七天里，朝政停着，天下并没有什么大事发生——这说明你其实没那么重要。'),
      O('三日而止，政事如常', { authority: 3, health: -3, people: -1, clan: -2 },
        '你只停了三天。第四日照常临朝，群臣不敢提这件事。那天你的声音很稳，散朝后在殿里坐了很久。'),
      O('召医官治罪', { health: -2, people: -2, authority: 2, scholar: -3, admin: -1 },
        '太医院的正副院使被下狱。查了两个月，查不出什么，最后以"用药失当"定了罪。此后再有小病，太医都开最稳的方子。')
    ]
  })

  add({
    id: 'inspect_tour', stage: 0, weight: 0.35, cond: s => s.year > 7,
    title: '微服出宫',
    scene: '你换了便服，只带了两个侍卫，从侧门出去。街上很热闹，卖胡饼的、算命的、耍猴的都有。'
      + '你听见有人在骂税重，骂得很具体，具体到你记得那道诏书的日期。你站在人群里，听了很久。',
    options: [
      O('记下所见，回宫整顿', { admin: 5, people: 3, health: -2, scholar: -2 },
        '你回宫后罢了两个官，免了一个州的加派。没有人知道你为什么忽然知道这些。'),
      O('买一个胡饼，继续走', { people: 2, health: 1, prestige: 1, admin: 1 },
        '胡饼很硬，你吃了一半。摊主多给了你一把芝麻。你回宫之后，把御膳房的菜单改了。'),
      O('怒，回宫后严查言者', { authority: 2, people: -5, admin: -2, prestige: -3 },
        '你查了三天，查到了几个说怪话的百姓。打了板子。此后再出宫，街上安静了很多。')
    ]
  })

  add({
    id: 'great_victory', stage: 0, weight: 0.35, cond: s => s.army > 55 && s.year > 6,
    title: '大捷',
    scene: '八百里加急：北线大捷，斩首两万，获马万匹，虏酋远遁。报捷的使者跪在丹墀下，声音都在抖。'
      + '按例，这该是告庙、献俘、大赦。你已经很久没有听到这样的消息了。',
    options: [
      O('告庙献俘，大赦天下', { prestige: 12, people: 6, army: 5, treasury: -6, authority: 4 },
        '献俘的仪式办了一整日。你站在午门上，看见俘虏跪了一片。人群中有人喊万岁，声音很齐。那一天确实值得记住。'),
      O('赏将士，不事铺张', { army: 8, prestige: 5, treasury: -4, people: 2, warlord: 3 },
        '你把赏银直接发到了军中，没有办献俘礼。将士们拿到银子的时候，比听到"万岁"更高兴。'),
      O('趁胜追击，务竟全功', { army: -6, treasury: -10, prestige: 8, people: -4, warlord: 6 },
        '大军继续北上，深入三百里。又打了两个月，粮尽而还。战果比上一次大，损失也比上一次大。')
    ]
  })

  add({
    id: 'great_defeat', stage: 0, weight: 0.3, cond: s => s.year > 6 && s.army < 45,
    title: '丧师',
    scene: '败报送到时，你正在看另一份折子。折子上写：全军覆没，主将战死，失地三百里。'
      + '送信的军校跪在殿外，甲上还有血。兵部尚书脱了冠，跪在阶下等罪。'
      + '你把手里的折子放下，发现自己一时想不出该说什么。',
    options: [
      O('下罪己诏，抚恤阵亡', { people: 5, prestige: -4, authority: 3, treasury: -6, army: 2 },
        '罪己诏写得很难看，因为你要写的是自己的错。阵亡的抚恤发了三倍，家书是地方官代写的。'),
      O('斩主将，以正军法', { authority: 5, army: -3, prestige: -2, people: -2, warlord: -4 },
        '主将已死，你斩了他的家属。军法正了，军心也寒了。此后边将出战，先想的是退路。'),
      O('隐其败，只报小挫', { prestige: -2, people: -4, admin: -3, authority: -2, army: 1 },
        '诏书里写的是"小挫"。可失地是真的，逃回来的兵也是真的。消息在边镇传得比在京里快。')
    ]
  })

  add({
    id: 'flood_palace', stage: 0, weight: 0.2, cond: s => s.year > 12,
    title: '宫城失火',
    scene: '三更时分，东宫偏殿起火。风大，火借着风势烧了两个时辰，烧毁殿宇十七间。'
      + '救火的人说，火起于帷帐，像是灯烛倒了。也有人说，看见有人在火起前从后墙翻出去。',
    options: [
      O('彻查纵火，穷治其党', { authority: 5, admin: -3, people: -3, clan: -5, treasury: -3 },
        '查了两个月，查出是一个失宠的嫔妃指使。她被赐死，牵连了三十余人。火究竟是怎么起的，始终没有一个让人信服的说法。'),
      O('只修宫殿，不问其余', { treasury: -8, people: 1, admin: 2, prestige: 2 },
        '宫殿修了半年，比原来还气派。这件事就这样过去了。可你此后夜里睡觉，总留一盏灯。'),
      O('减膳修省，以答天戒', { people: 4, prestige: 4, authority: 2, treasury: -2, health: -1 },
        '你减了膳，停了乐，在偏殿住了三个月。民间说天子畏天，朝臣说你仁厚。只有你自己知道，你是在想那把火。')
    ]
  })

  add({
    id: 'exam_scandal', stage: 0, weight: 0.3, cond: s => s.year > 9,
    title: '状元舞弊',
    scene: '新科状元被查出关节：他的卷子上有主考约定的暗记，一个不易察觉的墨点。'
      + '此事传开，落第的举子聚在贡院外，把榜文撕了。主考是三朝老臣，做过你的老师。',
    options: [
      O('废其榜，重考，主考下狱', { admin: 7, prestige: 6, scholar: -8, people: 5, treasury: -2 },
        '重考那日，贡院外挤满了人。新榜出来，状元是个农家子。主考死在狱中，你赐了棺。'),
      O('只废状元，主考罚俸', { admin: 2, scholar: 2, people: -3, prestige: -2 },
        '状元被废，主考罚俸一年。举子们不满意，可也闹不出更大的事。科场的规矩，从此多了一条"糊名"，执行得并不严。'),
      O('压下去，以全师道', { admin: -6, people: -6, scholar: -3, prestige: -5, authority: 2 },
        '榜没有动。闹事的举子被抓了十几个。此后的科场，暗记越来越精巧了。')
    ]
  })

  add({
    id: 'famine_refugee', stage: 0, weight: 0.3, cond: s => s.year > 5 && s.people < 45,
    title: '流民入京',
    scene: '城外聚集了流民万余人，搭了棚子，沿着官道一直排到十里外。'
      + '他们说家乡遭了灾，官府不开仓。京兆尹请示：是驱回原籍，还是就地赈济。'
      + '冬天要来了。',
    options: [
      O('就地设厂施粥，编入保甲', { treasury: -9, people: 8, admin: 3, prestige: 4 },
        '粥厂设了十七处。流民编入保甲，年轻的分了荒地。第二年春天，有一半人留了下来，成了京畿的农户。'),
      O('遣回原籍，令地方赈济', { treasury: -3, people: -6, admin: -2, authority: 2 },
        '流民被遣回原籍，路上死了不少。地方官接了人，转头又把它们放了出来。第二年冬天，他们又来了。'),
      O('闭城门，禁其入', { people: -8, authority: 4, prestige: -5, admin: -2 },
        '城门关了。城外的棚子越搭越多，后来有人开始砸门。你调了兵，事情没有闹大。')
    ]
  })

  add({
    id: 'mother_letter', stage: 0, weight: 0.3, cond: s => s.origin.id !== 'founder' && s.year > 5,
    title: '太后手书',
    scene: '太后遣人送来一封手书，说她的族人有一人犯了法，被下在狱中，请他"念在亲戚的份上"。'
      + '信末写："吾老矣，不愿见家中有人死于市。"字迹有些抖。这是她第一次为私事开口。',
    options: [
      O('赦其死，减等发落', { clan: 5, authority: -4, admin: -4, people: -3, prestige: -2 },
        '你改了他的死罪，发往边地。太后派人送了一匣子你小时候爱吃的点心。此后再没有为私事开过口。'),
      O('依法处决，另赐厚恤', { authority: 6, admin: 6, clan: -8, people: 4, prestige: 3 },
        '人还是杀了，你赐了三千两丧葬银，亲自去慈宁宫跪了一个时辰。太后没有见你。三个月后，她病了一场。'),
      O('留中不发，拖下去', { admin: -2, clan: 1, authority: -2, health: -2 },
        '你没有回信。案子在刑部压了两年，人最后病死在狱中。太后没有再提这件事，也很少再见你。')
    ]
  })

  add({
    id: 'new_army', stage: 0, weight: 0.3, cond: s => s.year > 10 && s.army < 55,
    title: '练新军',
    scene: '有边将上书，请练新军一支，用西法操练，器械另造。需银四十万两，三年成军。'
      + '兵部说这是"糜费"，边将说"旧军已不可用"。你见过旧军的操演，确实不好看。',
    options: [
      O('准，拨帑练新军', { treasury: -12, army: 12, warlord: 6, people: -2, admin: 2 },
        '新军练成了，阅兵那日队列极整齐。旧军的将领在旁边看着，脸色不太好看。这支兵后来成了你的底气。'),
      O('不许，整饬旧军', { army: 5, admin: 2, treasury: -3, warlord: -2 },
        '你把银子用在整饬旧军上。吃了空额的将领被抓了七个，兵额总算实了。战力提升得不多，但账清楚了。'),
      O('许其试练一营', { army: 4, treasury: -4, warlord: 2, admin: 2 },
        '先练一营，五百人。练成之后你去看了一次，确实不一样。可要扩到一万人，户部说"再议"。')
    ]
  })

  add({
    id: 'salt_reform', stage: 0, weight: 0.25, cond: s => s.year > 8 && s.treasury < 45,
    title: '盐法改制',
    scene: '有人献《盐法十策》，说可岁增国用百万。核心只有一条：把盐从"官收商销"改为"就场征税"。'
      + '这法子听着简单，动的是几十年盘根错节的引商。那些人背后，站着京里的一半堂官。',
    options: [
      O('试行于一地，观其效', { treasury: 8, admin: 4, scholar: -3, people: 3 },
        '在一个盐场试了两年，税收确实涨了。别处的人开始活动，想把这法子永远困在那一地。'),
      O('全面推行，不顾阻力', { treasury: 14, admin: 5, people: 4, scholar: -9, clan: -4 },
        '新法推行天下。三个月内，闹事的盐商有十七起。你压下去了。第二年盐税涨了四成，这是实打实的。'),
      O('不改，恐生大乱', { treasury: -3, scholar: 4, people: -2, admin: -3 },
        '你把策书留中。献书的人外放去了边州。盐法照旧，盐价照旧，国库也照旧。')
    ]
  })

  add({
    id: 'library', stage: 0, weight: 0.25, cond: s => s.year > 10,
    title: '求书天下',
    scene: '秘书监奏：内府藏书多散佚，请下诏求书于天下，抄录副本，藏于秘阁。'
      + '这件事花钱不多，却要花很多人的心血。也有人说，书收得越多，读书的人越多，读书的人越多，议论就越多。',
    options: [
      O('下诏求书，厚赏献者', { prestige: 6, scholar: 6, treasury: -5, admin: 2, people: 1 },
        '三年间收书四万余卷。秘阁重新编了目，你在序里写了一句"斯文在兹"。这四个字后来被刻在了阁门上。'),
      O('只抄不急，逐年为之', { prestige: 3, scholar: 3, treasury: -2, admin: 1 },
        '每年抄一批，抄了十几年。书慢慢齐了，做这件事的人也从青年变成了中年。'),
      O('不许，防其聚众议论', { authority: 3, scholar: -5, prestige: -3 },
        '求书的诏书没有下。此后民间献书的路也断了。有人说这是"防民之口"，你不这么认为。')
    ]
  })

  return E
})
