/* ===== 宝贝升级乐园 · 内容数据 data.js =====
   ⚠️ 说明：本文件中的课文、单词、题目均为「示例内容」，由本应用自行编写，
   用于功能演示，参考人教版（六三制）1-6 年级的课标结构，但不是教材原文。
   正式学习请以学校发放的正版教材为准。家长可在「设置 → 内容管理」中扩充。
   —— 数据按模块 / 年级懒加载（首次访问时才构建并缓存）。
*/
window.DATA = (function () {
  'use strict';
  var cache = {};
  function memo(key, fn) { if (!(key in cache)) cache[key] = fn(); return cache[key]; }
  function clearCache() { cache = {}; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function custom(kind, grade) {
    try {
      var c = window.APP && APP.state && APP.state.custom ? APP.state.custom[kind] : null;
      var arr = c ? (c[String(grade)] || c[grade]) : null;
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  /* 生成选择题：correct 为正确答案，wrongs 为干扰项数组 */
  function mk(q, correct, wrongs, tip) {
    var set = [String(correct)];
    wrongs.forEach(function (w) { if (set.indexOf(String(w)) < 0) set.push(String(w)); });
    while (set.length < 4) { set.push(String(Number(correct) + set.length * 7 + 1)); }
    var opts = shuffle(set.slice(0, 4));
    return { q: q, opts: opts, ans: opts.indexOf(String(correct)), tip: tip || '' };
  }

  /* ========== 1. 字母乐园 ========== */
  var LETTER_WORDS = {
    A: ['Apple', '苹果', '🍎'], B: ['Bear', '小熊', '🐻'], C: ['Cat', '小猫', '🐱'], D: ['Dog', '小狗', '🐶'],
    E: ['Egg', '鸡蛋', '🥚'], F: ['Fish', '小鱼', '🐟'], G: ['Grape', '葡萄', '🍇'], H: ['Hat', '帽子', '🎩'],
    I: ['Ice', '冰', '🧊'], J: ['Juice', '果汁', '🧃'], K: ['Kite', '风筝', '🪁'], L: ['Lion', '狮子', '🦁'],
    M: ['Moon', '月亮', '🌙'], N: ['Nose', '鼻子', '👃'], O: ['Orange', '橙子', '🍊'], P: ['Panda', '熊猫', '🐼'],
    Q: ['Queen', '女王', '👑'], R: ['Rabbit', '兔子', '🐰'], S: ['Sun', '太阳', '☀️'], T: ['Tiger', '老虎', '🐯'],
    U: ['Umbrella', '雨伞', '☂️'], V: ['Van', '面包车', '🚐'], W: ['Water', '水', '💧'], X: ['Box', '盒子', '📦'],
    Y: ['Yellow', '黄色', '💛'], Z: ['Zebra', '斑马', '🦓']
  };
  function letters() {
    return memo('letters', function () {
      return Object.keys(LETTER_WORDS).map(function (u) {
        var w = LETTER_WORDS[u];
        return { u: u, l: u.toLowerCase(), word: w[0], zh: w[1], emoji: w[2] };
      });
    });
  }

  /* ========== 2. 大文豪（示例课文） ========== */
  var READING = {
    1: [
      {
        id: 'r1a', title: '春天来了', lines: [
          { t: '春天来了，小草绿了。', p: 'chūn tiān lái le xiǎo cǎo lǜ le' },
          { t: '花儿开了，小鸟叫了。', p: 'huā ér kāi le xiǎo niǎo jiào le' },
          { t: '我们一起去春游。', p: 'wǒ men yī qǐ qù chūn yóu' }
        ],
        chars: [{ c: '春', p: 'chūn', w: '春天' }, { c: '草', p: 'cǎo', w: '小草' }, { c: '花', p: 'huā', w: '花儿' }, { c: '鸟', p: 'niǎo', w: '小鸟' }],
        words: ['春天', '小草', '花儿', '春游'], pattern: '……来了，……了。',
        sentences: [['小鸟', '在', '树上', '唱歌'], ['春天', '的', '花儿', '真', '好看']]
      },
      {
        id: 'r1b', title: '我的一天', lines: [
          { t: '早上好，我背上小书包。', p: 'zǎo shàng hǎo wǒ bēi shàng xiǎo shū bāo' },
          { t: '上学去，见到老师问声好。', p: 'shàng xué qù jiàn dào lǎo shī wèn shēng hǎo' },
          { t: '放学了，回家和妈妈说说话。', p: 'fàng xué le huí jiā hé mā ma shuō shuo huà' }
        ],
        chars: [{ c: '早', p: 'zǎo', w: '早上' }, { c: '书', p: 'shū', w: '书包' }, { c: '师', p: 'shī', w: '老师' }, { c: '家', p: 'jiā', w: '回家' }],
        words: ['早上', '书包', '上学', '老师'], pattern: '先……，再……。',
        sentences: [['我', '每天', '早上', '去', '上学'], ['老师', '教', '我们', '读书']]
      }
    ],
    2: [
      {
        id: 'r2a', title: '秋天的果园', lines: [
          { t: '秋天到了，果园里真热闹。', p: 'qiū tiān dào le guǒ yuán lǐ zhēn rè nao' },
          { t: '苹果红红的，梨子黄黄的。', p: 'píng guǒ hóng hóng de lí zi huáng huáng de' },
          { t: '我和爷爷一起摘果子。', p: 'wǒ hé yé ye yī qǐ zhāi guǒ zi' }
        ],
        chars: [{ c: '秋', p: 'qiū', w: '秋天' }, { c: '果', p: 'guǒ', w: '果园' }, { c: '梨', p: 'lí', w: '梨子' }, { c: '摘', p: 'zhāi', w: '摘果子' }],
        words: ['秋天', '果园', '苹果', '热闹'], pattern: '……红红的，……黄黄的。',
        sentences: [['爷爷', '在', '果园', '里', '摘', '苹果'], ['秋天', '的', '果园', '真', '热闹']]
      },
      {
        id: 'r2b', title: '爱护小树', lines: [
          { t: '校园里有一棵小树。', p: 'xiào yuán lǐ yǒu yī kē xiǎo shù' },
          { t: '我给它浇水，它长得很快。', p: 'wǒ gěi tā jiāo shuǐ tā zhǎng de hěn kuài' },
          { t: '大家一起爱护它。', p: 'dà jiā yī qǐ ài hù tā' }
        ],
        chars: [{ c: '棵', p: 'kē', w: '一棵' }, { c: '浇', p: 'jiāo', w: '浇水' }, { c: '护', p: 'hù', w: '爱护' }, { c: '校', p: 'xiào', w: '校园' }],
        words: ['校园', '小树', '浇水', '爱护'], pattern: '我给它……，它……。',
        sentences: [['我们', '要', '爱护', '身边', '的', '小树'], ['我', '每天', '给', '小树', '浇水']]
      }
    ],
    3: [
      {
        id: 'r3a', title: '校园里的银杏树', lines: [
          { t: '教学楼前有两棵银杏树。', p: 'jiào xué lóu qián yǒu liǎng kē yín xìng shù' },
          { t: '秋天，叶子像一把把小扇子。', p: 'qiū tiān yè zi xiàng yī bǎ bǎ xiǎo shàn zi' },
          { t: '风一吹，金黄的叶子飘落下来。', p: 'fēng yī chuī jīn huáng de yè zi piāo luò xià lái' }
        ],
        chars: [{ c: '银', p: 'yín', w: '银杏' }, { c: '扇', p: 'shàn', w: '扇子' }, { c: '飘', p: 'piāo', w: '飘落' }, { c: '落', p: 'luò', w: '落下' }],
        words: ['教学楼', '银杏', '金黄', '飘落'], pattern: '……像……。（比喻句）',
        sentences: [['金黄', '的', '叶子', '像', '小', '扇子'], ['秋风', '把', '树叶', '轻轻', '吹落']]
      },
      {
        id: 'r3b', title: '一次难忘的运动会', lines: [
          { t: '操场上，运动会开始了。', p: 'cāo chǎng shàng yùn dòng huì kāi shǐ le' },
          { t: '我参加了六十米赛跑。', p: 'wǒ cān jiā le liù shí mǐ sài pǎo' },
          { t: '虽然没有拿到第一，但我很开心。', p: 'suī rán méi yǒu ná dào dì yī dàn wǒ hěn kāi xīn' }
        ],
        chars: [{ c: '操', p: 'cāo', w: '操场' }, { c: '赛', p: 'sài', w: '赛跑' }, { c: '参', p: 'cān', w: '参加' }, { c: '虽', p: 'suī', w: '虽然' }],
        words: ['操场', '运动会', '赛跑', '难忘'], pattern: '虽然……但是……。',
        sentences: [['虽然', '很', '累', '但是', '我', '很', '开心'], ['我', '参加', '了', '学校', '的', '运动会']]
      }
    ],
    4: [
      {
        id: 'r4a', title: '家乡的小河', lines: [
          { t: '我的家乡有一条清清的小河。', p: 'wǒ de jiā xiāng yǒu yī tiáo qīng qīng de xiǎo hé' },
          { t: '河水缓缓地流着，映出蓝天白云。', p: 'hé shuǐ huǎn huǎn de liú zhe yìng chū lán tiān bái yún' },
          { t: '夏天，我们常在河边捉小鱼。', p: 'xià tiān wǒ men cháng zài hé biān zhuō xiǎo yú' }
        ],
        chars: [{ c: '乡', p: 'xiāng', w: '家乡' }, { c: '缓', p: 'huǎn', w: '缓缓' }, { c: '映', p: 'yìng', w: '映出' }, { c: '捉', p: 'zhuō', w: '捉鱼' }],
        words: ['家乡', '小河', '蓝天白云', '河边'], pattern: '……地……着（状语）',
        sentences: [['河水', '缓缓', '地', '流', '向', '远方'], ['夏天', '我们', '常', '去', '河边', '玩']]
      },
      {
        id: 'r4b', title: '蚂蚁搬家', lines: [
          { t: '下雨前，一群蚂蚁忙着搬家。', p: 'xià yǔ qián yī qún mǎ yǐ máng zhe bān jiā' },
          { t: '它们排成长长的队伍，很有秩序。', p: 'tā men pái chéng cháng cháng de duì wǔ hěn yǒu zhì xù' },
          { t: '小小的蚂蚁也懂得团结。', p: 'xiǎo xiǎo de mǎ yǐ yě dǒng de tuán jié' }
        ],
        chars: [{ c: '蚁', p: 'yǐ', w: '蚂蚁' }, { c: '群', p: 'qún', w: '一群' }, { c: '搬', p: 'bān', w: '搬家' }, { c: '团', p: 'tuán', w: '团结' }],
        words: ['蚂蚁', '搬家', '队伍', '团结'], pattern: '连……也……。',
        sentences: [['一群', '蚂蚁', '正在', '忙着', '搬家'], ['小小的', '蚂蚁', '懂得', '团结', '合作']]
      }
    ],
    5: [
      {
        id: 'r5a', title: '图书馆的午后', lines: [
          { t: '午后的图书馆很安静。', p: 'wǔ hòu de tú shū guǎn hěn ān jìng' },
          { t: '阳光透过窗子，落在书页上。', p: 'yáng guāng tòu guò chuāng zi luò zài shū yè shàng' },
          { t: '翻开一本书，就像打开一扇门。', p: 'fān kāi yī běn shū jiù xiàng dǎ kāi yī shàn mén' }
        ],
        chars: [{ c: '静', p: 'jìng', w: '安静' }, { c: '透', p: 'tòu', w: '透过' }, { c: '页', p: 'yè', w: '书页' }, { c: '翻', p: 'fān', w: '翻开' }],
        words: ['图书馆', '安静', '阳光', '书页'], pattern: '……就像……。',
        sentences: [['阳光', '透过', '窗子', '落', '在', '书页', '上'], ['翻开', '一本', '好书', '就像', '打开', '一扇', '门']]
      },
      {
        id: 'r5b', title: '写给未来的信', lines: [
          { t: '我给十年后的自己写了一封信。', p: 'wǒ gěi shí nián hòu de zì jǐ xiě le yī fēng xìn' },
          { t: '信里写着我的梦想和现在的努力。', p: 'xìn lǐ xiě zhe wǒ de mèng xiǎng hé xiàn zài de nǔ lì' },
          { t: '希望那时的我，没有辜负今天。', p: 'xī wàng nà shí de wǒ méi yǒu gū fù jīn tiān' }
        ],
        chars: [{ c: '封', p: 'fēng', w: '一封信' }, { c: '梦', p: 'mèng', w: '梦想' }, { c: '努', p: 'nǔ', w: '努力' }, { c: '希', p: 'xī', w: '希望' }],
        words: ['未来', '梦想', '努力', '希望'], pattern: '希望……。（表达愿望）',
        sentences: [['我', '给', '未来', '的', '自己', '写', '了', '一封', '信'], ['希望', '今天', '的', '努力', '不会', '白费']]
      }
    ],
    6: [
      {
        id: 'r6a', title: '毕业前的教室', lines: [
          { t: '六月的教室，风扇轻轻转着。', p: 'liù yuè de jiào shì fēng shàn qīng qīng zhuàn zhe' },
          { t: '黑板上写着倒计时的数字。', p: 'hēi bǎn shàng xiě zhe dào jì shí de shù zì' },
          { t: '我们即将分别，却都在努力微笑。', p: 'wǒ men jí jiāng fēn bié què dōu zài nǔ lì wēi xiào' }
        ],
        chars: [{ c: '毕', p: 'bì', w: '毕业' }, { c: '扇', p: 'shàn', w: '风扇' }, { c: '即', p: 'jí', w: '即将' }, { c: '却', p: 'què', w: '却是' }],
        words: ['毕业', '教室', '倒计时', '分别'], pattern: '……却……。（转折）',
        sentences: [['黑板', '上', '写', '着', '倒计时', '的', '数字'], ['我们', '即将', '分别', '却', '都', '在', '微笑']]
      },
      {
        id: 'r6b', title: '科技馆奇遇', lines: [
          { t: '科技馆里，机器人向我招手。', p: 'kē jì guǎn lǐ jī qì rén xiàng wǒ zhāo shǒu' },
          { t: '我戴上眼镜，仿佛走进了星空。', p: 'wǒ dài shàng yǎn jìng fǎng fú zǒu jìn le xīng kōng' },
          { t: '科学的世界，真让人着迷。', p: 'kē xué de shì jiè zhēn ràng rén zháo mí' }
        ],
        chars: [{ c: '招', p: 'zhāo', w: '招手' }, { c: '戴', p: 'dài', w: '戴上' }, { c: '仿', p: 'fǎng', w: '仿佛' }, { c: '迷', p: 'mí', w: '着迷' }],
        words: ['科技馆', '机器人', '星空', '着迷'], pattern: '仿佛……。（想象）',
        sentences: [['机器人', '向', '我', '招', '了', '招手'], ['戴上', '眼镜', '仿佛', '走进', '了', '星空']]
      }
    ]
  };
  function readingGrade(g) {
    return memo('reading' + g, function () { return (READING[g] || []).concat(custom('reading', g)); });
  }

  /* ========== 3. 诗仙花园（古诗，公有领域） ========== */
  var POEMS = {
    1: [
      { id: 'p1a', title: '咏鹅', author: '骆宾王', lines: [{ t: '鹅，鹅，鹅，曲项向天歌。', p: 'é é é qū xiàng xiàng tiān gē' }, { t: '白毛浮绿水，红掌拨清波。', p: 'bái máo fú lǜ shuǐ hóng zhǎng bō qīng bō' }], note: '写小鹅在水上游玩的样子，颜色词特别多。' },
      { id: 'p1b', title: '静夜思', author: '李白', lines: [{ t: '床前明月光，疑是地上霜。', p: 'chuáng qián míng yuè guāng yí shì dì shàng shuāng' }, { t: '举头望明月，低头思故乡。', p: 'jǔ tóu wàng míng yuè dī tóu sī gù xiāng' }], note: '看见月亮想起家乡，写思念的名篇。' },
      { id: 'p1c', title: '春晓', author: '孟浩然', lines: [{ t: '春眠不觉晓，处处闻啼鸟。', p: 'chūn mián bù jué xiǎo chù chù wén tí niǎo' }, { t: '夜来风雨声，花落知多少。', p: 'yè lái fēng yǔ shēng huā luò zhī duō shǎo' }], note: '春天早晨睡得香，醒来听见鸟叫。' }
    ],
    2: [
      { id: 'p2a', title: '悯农（其二）', author: '李绅', lines: [{ t: '锄禾日当午，汗滴禾下土。', p: 'chú hé rì dāng wǔ hàn dī hé xià tǔ' }, { t: '谁知盘中餐，粒粒皆辛苦。', p: 'shéi zhī pán zhōng cān lì lì jiē xīn kǔ' }], note: '告诉我们要爱惜粮食。' },
      { id: 'p2b', title: '登鹳雀楼', author: '王之涣', lines: [{ t: '白日依山尽，黄河入海流。', p: 'bái rì yī shān jìn huáng hé rù hǎi liú' }, { t: '欲穷千里目，更上一层楼。', p: 'yù qióng qiān lǐ mù gèng shàng yī céng lóu' }], note: '想看得更远，就要站得更高。' },
      { id: 'p2c', title: '赠汪伦', author: '李白', lines: [{ t: '李白乘舟将欲行，忽闻岸上踏歌声。', p: 'lǐ bái chéng zhōu jiāng yù xíng hū wén àn shàng tà gē shēng' }, { t: '桃花潭水深千尺，不及汪伦送我情。', p: 'táo huā tán shuǐ shēn qiān chǐ bù jí wāng lún sòng wǒ qíng' }], note: '写朋友之间的深厚情谊。' }
    ],
    3: [
      { id: 'p3a', title: '望庐山瀑布', author: '李白', lines: [{ t: '日照香炉生紫烟，遥看瀑布挂前川。', p: 'rì zhào xiāng lú shēng zǐ yān yáo kàn pù bù guà qián chuān' }, { t: '飞流直下三千尺，疑是银河落九天。', p: 'fēi liú zhí xià sān qiān chǐ yí shì yín hé luò jiǔ tiān' }], note: '把瀑布想象成天上落下的银河。' },
      { id: 'p3b', title: '绝句', author: '杜甫', lines: [{ t: '两个黄鹂鸣翠柳，一行白鹭上青天。', p: 'liǎng gè huáng lí míng cuì liǔ yī háng bái lù shàng qīng tiān' }, { t: '窗含西岭千秋雪，门泊东吴万里船。', p: 'chuāng hán xī lǐng qiān qiū xuě mén bó dōng wú wàn lǐ chuán' }], note: '一句一景，像四张彩色的画。' },
      { id: 'p3c', title: '山行', author: '杜牧', lines: [{ t: '远上寒山石径斜，白云生处有人家。', p: 'yuǎn shàng hán shān shí jìng xié bái yún shēng chù yǒu rén jiā' }, { t: '停车坐爱枫林晚，霜叶红于二月花。', p: 'tíng chē zuò ài fēng lín wǎn shuāng yè hóng yú èr yuè huā' }], note: '秋天的枫叶比春花还红。' }
    ],
    4: [
      { id: 'p4a', title: '江雪', author: '柳宗元', lines: [{ t: '千山鸟飞绝，万径人踪灭。', p: 'qiān shān niǎo fēi jué wàn jìng rén zōng miè' }, { t: '孤舟蓑笠翁，独钓寒江雪。', p: 'gū zhōu suō lì wēng dú diào hán jiāng xuě' }], note: '四句开头连起来是「千万孤独」。' },
      { id: 'p4b', title: '望天门山', author: '李白', lines: [{ t: '天门中断楚江开，碧水东流至此回。', p: 'tiān mén zhōng duàn chǔ jiāng kāi bì shuǐ dōng liú zhì cǐ huí' }, { t: '两岸青山相对出，孤帆一片日边来。', p: 'liǎng àn qīng shān xiāng duì chū gū fān yī piàn rì biān lái' }], note: '写长江冲开天门山的气势。' },
      { id: 'p4c', title: '池上', author: '白居易', lines: [{ t: '小娃撑小艇，偷采白莲回。', p: 'xiǎo wá chēng xiǎo tǐng tōu cǎi bái lián huí' }, { t: '不解藏踪迹，浮萍一道开。', p: 'bù jiě cáng zōng jì fú píng yī dào kāi' }], note: '小朋友偷采莲蓬，被浮萍出卖啦。' }
    ],
    5: [
      { id: 'p5a', title: '泊船瓜洲', author: '王安石', lines: [{ t: '京口瓜洲一水间，钟山只隔数重山。', p: 'jīng kǒu guā zhōu yī shuǐ jiān zhōng shān zhǐ gé shù chóng shān' }, { t: '春风又绿江南岸，明月何时照我还。', p: 'chūn fēng yòu lǜ jiāng nán àn míng yuè hé shí zhào wǒ huán' }], note: '一个「绿」字，改了十几次才定下来。' },
      { id: 'p5b', title: '题西林壁', author: '苏轼', lines: [{ t: '横看成岭侧成峰，远近高低各不同。', p: 'héng kàn chéng lǐng cè chéng fēng yuǎn jìn gāo dī gè bù tóng' }, { t: '不识庐山真面目，只缘身在此山中。', p: 'bù shí lú shān zhēn miàn mù zhǐ yuán shēn zài cǐ shān zhōng' }], note: '换个角度看问题，才能看清全貌。' },
      { id: 'p5c', title: '独坐敬亭山', author: '李白', lines: [{ t: '众鸟高飞尽，孤云独去闲。', p: 'zhòng niǎo gāo fēi jìn gū yún dú qù xián' }, { t: '相看两不厌，只有敬亭山。', p: 'xiāng kàn liǎng bù yàn zhǐ yǒu jìng tíng shān' }], note: '把山当成能对望的好朋友。' }
    ],
    6: [
      { id: 'p6a', title: '竹石', author: '郑燮', lines: [{ t: '咬定青山不放松，立根原在破岩中。', p: 'yǎo dìng qīng shān bù fàng sōng lì gēn yuán zài pò yán zhōng' }, { t: '千磨万击还坚劲，任尔东西南北风。', p: 'qiān mó wàn jī hái jiān jìng rèn ěr dōng xī nán běi fēng' }], note: '借竹子写人的坚强。' },
      { id: 'p6b', title: '石灰吟', author: '于谦', lines: [{ t: '千锤万凿出深山，烈火焚烧若等闲。', p: 'qiān chuí wàn záo chū shēn shān liè huǒ fén shāo ruò děng xián' }, { t: '粉骨碎身浑不怕，要留清白在人间。', p: 'fěn gǔ suì shēn hún bù pà yào liú qīng bái zài rén jiān' }], note: '托物言志，写做人要清清白白。' },
      { id: 'p6c', title: '己亥杂诗', author: '龚自珍', lines: [{ t: '九州生气恃风雷，万马齐喑究可哀。', p: 'jiǔ zhōu shēng qì shì fēng léi wàn mǎ qí yīn jiū kě āi' }, { t: '我劝天公重抖擞，不拘一格降人才。', p: 'wǒ quàn tiān gōng chóng dǒu sǒu bù jū yī gé jiàng rén cái' }], note: '呼唤人才辈出的新气象。' }
    ]
  };
  function poemsGrade(g) {
    return memo('poems' + g, function () { return (POEMS[g] || []).concat(custom('poems', g)); });
  }
  function allPoems() {
    return memo('poemsAll', function () {
      var a = []; for (var g = 1; g <= 6; g++) { poemsGrade(g).forEach(function (p) { a.push(Object.assign({ grade: g }, p)); }); } return a;
    });
  }

  /* ========== 4. 数字小分队（知识点 + 出题生成器） ========== */
  var MATH = {
    1: [
      {
        id: 'm1a', name: '10 以内加减法', summary: '① 凑十法：看到 9 想到 1。② 加法交换位置得数不变。③ 减法就是「去掉一些」。',
        gen: function () {
          if (Math.random() < .5) { var a = rnd(1, 9), b = rnd(1, 10 - a); return mk(a + ' + ' + b + ' = ?', a + b, [a + b + 1, Math.max(0, a + b - 1), a + b + 2], '用手指数一数：' + a + ' 再加 ' + b + ' 个。'); }
          var x = rnd(2, 10), y = rnd(1, x); return mk(x + ' − ' + y + ' = ?', x - y, [x - y + 1, x - y + 2, Math.abs(x - y - 1) + 3], '从 ' + x + ' 里拿走 ' + y + ' 个。');
        }
      },
      {
        id: 'm1b', name: '20 以内进位加法', summary: '凑十法：9+5 = 9+1+4 = 14。先把小的数拆开，凑满 10。',
        gen: function () { var a = rnd(6, 9), b = rnd(11 - a, 9); return mk(a + ' + ' + b + ' = ?', a + b, [a + b - 1, a + b + 1, a + b - 2], a + ' 先凑到 10，还要借 ' + (10 - a) + '。'); }
      },
      {
        id: 'm1c', name: '认识图形', summary: '长方形 4 条边、对边一样长；正方形 4 条边一样长；三角形 3 条边；圆没有角。',
        bank: [
          mk('正方形有几条边？', 4, [3, 5, 6], '四四方方，四条边一样长。'),
          mk('三角形有几个角？', 3, [4, 2, 5], '三角形当然是 3 个角。'),
          mk('下面哪个图形没有角？🔺 🟥 🔵 🔷', '🔵', ['🔺', '🟥', '🔷'], '圆圆的没有角。'),
          mk('长方形有几个直角？', 4, [2, 3, 1], '四个角都是直角。')
        ]
      },
      {
        id: 'm1d', name: '数的顺序与比大小', summary: '数轴上右边的数更大；比大小先看位数，位数多的更大。',
        gen: function () { var a = rnd(1, 20), b = rnd(1, 20); while (b === a) b = rnd(1, 20); return mk(a + ' 和 ' + b + ' 哪个大？', Math.max(a, b), [Math.min(a, b), a + b, Math.abs(a - b)], '数越靠后越大。'); }
      }
    ],
    2: [
      { id: 'm2a', name: '表内乘法（九九表）', summary: '乘法就是相同加数的简便运算：3×4 = 3+3+3+3。背熟九九乘法表最省力。', gen: function () { var a = rnd(2, 9), b = rnd(2, 9); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + a, a * b - b, a * b + 1], a + ' 个 ' + b + ' 相加。'); } },
      { id: 'm2b', name: '100 以内加减法', summary: '列竖式：个位对个位，满十进一；不够减就向前一位借一当十。', gen: function () { if (Math.random() < .5) { var a = rnd(11, 60), b = rnd(11, 39); return mk(a + ' + ' + b + ' = ?', a + b, [a + b - 10, a + b + 10, a + b - 1], '先算整十，再算个位。'); } var x = rnd(40, 99), y = rnd(11, 39); return mk(x + ' − ' + y + ' = ?', x - y, [x - y + 10, x - y - 10, x - y + 1], '不够减就借位。'); } },
      { id: 'm2c', name: '认识时间', summary: '1 时 = 60 分；钟面上分针走 1 大格是 5 分钟。', bank: [mk('1 小时等于多少分钟？', 60, [30, 100, 24], '钟面转一圈是 60 分。'), mk('分针指向 6，是几分？', 30, [6, 12, 60], '每个大格 5 分钟，6 格 = 30 分。'), mk('一天有几小时？', 24, [12, 60, 30], '白天加黑夜共 24 小时。'), mk('9:00 过 15 分钟是几点？', '9:15', ['9:50', '10:15', '9:05'], '分针走 3 个大格。')] },
      { id: 'm2d', name: '长度单位', summary: '1 米 = 100 厘米。铅笔用「厘米」量，教室用「米」量。', bank: [mk('1 米 = 多少厘米？', 100, [10, 1000, 50], '米和厘米之间是 100 倍。'), mk('课桌高度大约是？', '70 厘米', ['70 米', '7 厘米', '7 米'], '比你的腰高一点点。'), mk('3 米 = 多少厘米？', 300, [30, 3000, 103], '3 × 100 = 300。'), mk('量一支铅笔用什么单位？', '厘米', ['米', '千米', '吨'], '短的东西用厘米。')] }
    ],
    3: [
      { id: 'm3a', name: '多位数乘一位数', summary: '从个位乘起，哪一位满几十就向前一位进几。', gen: function () { var a = rnd(12, 99), b = rnd(2, 9); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + b, a * b - a, a * b + 10], '先算 ' + Math.floor(a / 10) * 10 + '×' + b + '，再算 ' + (a % 10) + '×' + b + '。'); } },
      { id: 'm3b', name: '有余数的除法', summary: '余数一定要比除数小。被除数 = 商 × 除数 + 余数。', gen: function () { var d = rnd(3, 9), q = rnd(2, 9), r = rnd(1, d - 1); var n = d * q + r; return mk(n + ' ÷ ' + d + ' = ? （填商）', q, [q + 1, q - 1, q + 2], n + ' 里面有 ' + q + ' 个 ' + d + ' 还多 ' + r + '。'); } },
      { id: 'm3c', name: '分数的初步认识', summary: '把一个物体平均分成几份，其中的一份就是几分之一。', bank: [mk('把蛋糕平均分成 4 份，一份是几分之几？', '1/4', ['1/2', '4/1', '1/3'], '分成 4 份取 1 份。'), mk('1/2 和 1/3 哪个大？', '1/2', ['1/3', '一样大', '不能比'], '分的份数越少，每份越大。'), mk('3/5 里有几个 1/5 ？', 3, [5, 2, 8], '分子是几就有几个分数单位。'), mk('把一根绳子平均分成 8 段，每段是全长的？', '1/8', ['8', '1/4', '2/8'], '平均 8 份中的 1 份。')] },
      { id: 'm3d', name: '长方形和正方形的周长', summary: '长方形周长 =（长 + 宽）× 2；正方形周长 = 边长 × 4。', gen: function () { var a = rnd(3, 15), b = rnd(2, 12); return mk('长 ' + a + ' 厘米、宽 ' + b + ' 厘米的长方形，周长是多少厘米？', (a + b) * 2, [a * b, a + b, (a + b) * 2 + 2], '(' + a + '+' + b + ')×2'); } }
    ],
    4: [
      { id: 'm4a', name: '三位数乘两位数', summary: '先用两位数的个位去乘，再用十位去乘（末位对齐十位），最后相加。', gen: function () { var a = rnd(101, 320), b = rnd(11, 29); return mk(a + ' × ' + b + ' = ?', a * b, [a * b + a, a * b - b, a * b + 100], '拆成 ' + a + '×' + (b - b % 10) + ' + ' + a + '×' + (b % 10) + '。'); } },
      { id: 'm4b', name: '除数是两位数的除法', summary: '先看被除数前两位，不够就看前三位；试商可以「四舍五入」估一估。', gen: function () { var d = rnd(11, 25), q = rnd(3, 20); return mk((d * q) + ' ÷ ' + d + ' = ?', q, [q + 1, q - 1, q + 10], '想：' + d + ' 乘几等于 ' + d * q + '。'); } },
      { id: 'm4c', name: '运算定律', summary: '加法交换律 a+b=b+a；乘法分配律 (a+b)×c = a×c+b×c。用好定律算得又快又对。', bank: [mk('25 × 4 = ?', 100, [90, 104, 20], '凑整好朋友：25×4=100。'), mk('125 × 8 = ?', 1000, [900, 1250, 800], '另一对好朋友：125×8=1000。'), mk('(20+3) × 5 用分配律等于？', '20×5+3×5', ['20×5+3', '23+5', '20+3×5'], '括号里每个都要乘。'), mk('99 × 6 最简便的算法是？', '100×6−6', ['99+6', '90×6+9', '100×6+6'], '把 99 看成 100−1。')] },
      { id: 'm4d', name: '角的度量', summary: '直角 90°，平角 180°，周角 360°；小于 90° 是锐角，大于 90° 小于 180° 是钝角。', bank: [mk('直角是多少度？', '90°', ['180°', '60°', '360°'], '像书本的角。'), mk('平角是多少度？', '180°', ['90°', '270°', '360°'], '一条直线。'), mk('120° 的角是什么角？', '钝角', ['锐角', '直角', '平角'], '比 90° 大、比 180° 小。'), mk('周角是多少度？', '360°', ['180°', '90°', '720°'], '转一整圈。')] }
    ],
    5: [
      { id: 'm5a', name: '小数乘除法', summary: '小数乘法先按整数算，再数出因数中一共几位小数，就点几位。', gen: function () { var a = rnd(11, 99) / 10, b = rnd(2, 9); var r = Math.round(a * b * 10) / 10; return mk(a + ' × ' + b + ' = ?', r, [Math.round(r * 10 + 1) / 10, Math.round(r * 100) / 10, Math.round(r * 10 - 10) / 10], '先算 ' + (a * 10) + '×' + b + '，再点一位小数。'); } },
      { id: 'm5b', name: '简易方程', summary: '等式两边同时加减乘除同一个数，等式仍成立。解方程就是让 x 单独站在一边。', gen: function () { var a = rnd(2, 9), x = rnd(2, 12), b = rnd(1, 20); return mk(a + 'x + ' + b + ' = ' + (a * x + b) + '，x = ?', x, [x + 1, x - 1, x + a], '先两边减 ' + b + '，再除以 ' + a + '。'); } },
      { id: 'm5c', name: '多边形的面积', summary: '平行四边形 = 底×高；三角形 = 底×高÷2；梯形 =（上底+下底）×高÷2。', gen: function () { var b = rnd(4, 20), h = rnd(3, 14); if (Math.random() < .5) return mk('底 ' + b + '、高 ' + h + ' 的三角形面积是？', b * h / 2, [b * h, b * h / 2 + 2, b + h], '底×高÷2'); return mk('底 ' + b + '、高 ' + h + ' 的平行四边形面积是？', b * h, [b * h / 2, b + h, b * h + h], '底×高'); } },
      { id: 'm5d', name: '因数与倍数', summary: '个位是 0、2、4、6、8 的数是 2 的倍数；各位数字之和是 3 的倍数，这个数就是 3 的倍数。', bank: [mk('下面哪个数是 3 的倍数？', 27, [26, 28, 25], '2+7=9，是 3 的倍数。'), mk('12 的因数有几个？', 6, [4, 5, 12], '1、2、3、4、6、12。'), mk('最小的质数是？', 2, [1, 3, 0], '1 既不是质数也不是合数。'), mk('既是 2 的倍数又是 5 的倍数的数，个位是？', 0, [5, 2, 4], '同时满足要以 0 结尾。')] }
    ],
    6: [
      { id: 'm6a', name: '分数乘除法', summary: '分数乘分数：分子乘分子，分母乘分母。除以一个数等于乘它的倒数。', bank: [mk('1/2 × 2/3 = ?', '1/3', ['2/5', '3/4', '1/6'], '2/6 约分成 1/3。'), mk('3/4 ÷ 1/2 = ?', '3/2', ['3/8', '1/2', '2/3'], '除以 1/2 就是乘 2。'), mk('2/5 的倒数是？', '5/2', ['2/5', '5/5', '1/5'], '分子分母交换。'), mk('1/3 + 1/6 = ?', '1/2', ['2/9', '1/9', '2/3'], '通分成 2/6+1/6。')] },
      { id: 'm6b', name: '百分数', summary: '百分数表示一个数是另一个数的百分之几。0.25 = 25%；求百分率 = 部分 ÷ 总数 × 100%。', gen: function () { var t = rnd(2, 20) * 10, p = [10, 20, 25, 50][rnd(0, 3)]; return mk(t + ' 的 ' + p + '% 是多少？', t * p / 100, [t * p / 10, t * p / 1000, t * p / 100 + 5], '先把 ' + p + '% 写成 ' + (p / 100) + '。'); } },
      { id: 'm6c', name: '圆的周长与面积', summary: '周长 C = πd = 2πr；面积 S = πr²。π 取 3.14。', gen: function () { var r = rnd(1, 10); if (Math.random() < .5) return mk('半径 ' + r + ' 厘米的圆，周长是多少厘米？（π取3.14）', Math.round(2 * 3.14 * r * 100) / 100, [Math.round(3.14 * r * 100) / 100, Math.round(3.14 * r * r * 100) / 100, 2 * r], 'C = 2πr'); return mk('半径 ' + r + ' 厘米的圆，面积是多少平方厘米？（π取3.14）', Math.round(3.14 * r * r * 100) / 100, [Math.round(2 * 3.14 * r * 100) / 100, Math.round(3.14 * r * 100) / 100, r * r], 'S = πr²'); } },
      { id: 'm6d', name: '比和比例', summary: '比表示两个数相除的关系；比例是两个比相等的式子，内项积 = 外项积。', bank: [mk('12 : 18 化成最简整数比是？', '2:3', ['3:2', '6:9', '1:2'], '同时除以 6。'), mk('如果 2:3 = x:9，x = ?', 6, [4, 5, 12], '交叉相乘：3x=18。'), mk('把 30 按 2:3 分成两份，较大的一份是？', 18, [12, 15, 20], '共 5 份，每份 6。'), mk('一个比的前项是 8，比值是 2，后项是？', 4, [16, 6, 10], '前项 ÷ 后项 = 比值。')] }
    ]
  };
  function mathGrade(g) {
    return memo('math' + g, function () {
      var base = (MATH[g] || []).slice();
      custom('math', g).forEach(function (kp) { if (kp && kp.name) base.push(kp); });
      return base;
    });
  }
  function mathQuestion(kp) {
    if (kp.gen) return kp.gen();
    var b = kp.bank || [];
    if (!b.length) return mk('1 + 1 = ?', 2, [1, 3, 11], '');
    var q = b[rnd(0, b.length - 1)];
    var opts = shuffle(q.opts);
    return { q: q.q, opts: opts, ans: opts.indexOf(q.opts[q.ans]), tip: q.tip };
  }

  /* ========== 5. 小小外交官（英语单元） ========== */
  var ENGLISH = {
    1: [
      { id: 'e1a', name: 'Unit 1 Colours 颜色', words: [{ en: 'red', zh: '红色', e: '🔴' }, { en: 'blue', zh: '蓝色', e: '🔵' }, { en: 'yellow', zh: '黄色', e: '💛' }, { en: 'green', zh: '绿色', e: '💚' }, { en: 'black', zh: '黑色', e: '⚫' }, { en: 'white', zh: '白色', e: '⚪' }], sentences: [{ en: 'What colour is it?', zh: '它是什么颜色？' }, { en: 'It is red.', zh: '它是红色的。' }, { en: 'I like blue.', zh: '我喜欢蓝色。' }] },
      { id: 'e1b', name: 'Unit 2 Animals 动物', words: [{ en: 'cat', zh: '猫', e: '🐱' }, { en: 'dog', zh: '狗', e: '🐶' }, { en: 'duck', zh: '鸭子', e: '🦆' }, { en: 'panda', zh: '熊猫', e: '🐼' }, { en: 'bird', zh: '鸟', e: '🐦' }, { en: 'fish', zh: '鱼', e: '🐟' }], sentences: [{ en: 'What is this?', zh: '这是什么？' }, { en: 'It is a panda.', zh: '这是一只熊猫。' }, { en: 'I have a dog.', zh: '我有一只狗。' }] }
    ],
    2: [
      { id: 'e2a', name: 'Unit 1 Numbers 数字', words: [{ en: 'one', zh: '一', e: '1️⃣' }, { en: 'two', zh: '二', e: '2️⃣' }, { en: 'three', zh: '三', e: '3️⃣' }, { en: 'four', zh: '四', e: '4️⃣' }, { en: 'five', zh: '五', e: '5️⃣' }, { en: 'ten', zh: '十', e: '🔟' }], sentences: [{ en: 'How many books?', zh: '有多少本书？' }, { en: 'I have three pens.', zh: '我有三支笔。' }, { en: 'Let us count together.', zh: '我们一起数数吧。' }] },
      { id: 'e2b', name: 'Unit 2 Fruits 水果', words: [{ en: 'apple', zh: '苹果', e: '🍎' }, { en: 'banana', zh: '香蕉', e: '🍌' }, { en: 'pear', zh: '梨', e: '🍐' }, { en: 'grape', zh: '葡萄', e: '🍇' }, { en: 'peach', zh: '桃子', e: '🍑' }, { en: 'orange', zh: '橙子', e: '🍊' }], sentences: [{ en: 'Do you like apples?', zh: '你喜欢苹果吗？' }, { en: 'Yes, I do.', zh: '是的，我喜欢。' }, { en: 'Have some grapes.', zh: '吃点葡萄吧。' }] }
    ],
    3: [
      { id: 'e3a', name: 'Unit 1 School Things 学习用品', words: [{ en: 'pen', zh: '钢笔', e: '🖊️' }, { en: 'pencil', zh: '铅笔', e: '✏️' }, { en: 'book', zh: '书', e: '📕' }, { en: 'ruler', zh: '尺子', e: '📏' }, { en: 'bag', zh: '书包', e: '🎒' }, { en: 'eraser', zh: '橡皮', e: '🧽' }], sentences: [{ en: 'This is my pencil.', zh: '这是我的铅笔。' }, { en: 'Where is my bag?', zh: '我的书包在哪里？' }, { en: 'May I use your ruler?', zh: '我可以用你的尺子吗？' }] },
      { id: 'e3b', name: 'Unit 2 Family 家人', words: [{ en: 'father', zh: '爸爸', e: '👨' }, { en: 'mother', zh: '妈妈', e: '👩' }, { en: 'brother', zh: '哥哥/弟弟', e: '👦' }, { en: 'sister', zh: '姐姐/妹妹', e: '👧' }, { en: 'grandpa', zh: '爷爷', e: '👴' }, { en: 'grandma', zh: '奶奶', e: '👵' }], sentences: [{ en: 'This is my father.', zh: '这是我爸爸。' }, { en: 'How many people are in your family?', zh: '你家有几口人？' }, { en: 'I love my family.', zh: '我爱我的家人。' }] }
    ],
    4: [
      { id: 'e4a', name: 'Unit 1 Weather 天气', words: [{ en: 'sunny', zh: '晴朗的', e: '☀️' }, { en: 'rainy', zh: '下雨的', e: '🌧️' }, { en: 'windy', zh: '有风的', e: '🌬️' }, { en: 'snowy', zh: '下雪的', e: '❄️' }, { en: 'cloudy', zh: '多云的', e: '☁️' }, { en: 'hot', zh: '热的', e: '🔥' }], sentences: [{ en: 'How is the weather today?', zh: '今天天气怎么样？' }, { en: 'It is sunny and warm.', zh: '今天晴朗又温暖。' }, { en: 'Take an umbrella, please.', zh: '请带把伞。' }] },
      { id: 'e4b', name: 'Unit 2 Food 食物', words: [{ en: 'rice', zh: '米饭', e: '🍚' }, { en: 'noodles', zh: '面条', e: '🍜' }, { en: 'bread', zh: '面包', e: '🍞' }, { en: 'milk', zh: '牛奶', e: '🥛' }, { en: 'egg', zh: '鸡蛋', e: '🥚' }, { en: 'soup', zh: '汤', e: '🍲' }], sentences: [{ en: 'What would you like?', zh: '你想吃点什么？' }, { en: 'I would like some noodles.', zh: '我想要一些面条。' }, { en: 'It is delicious!', zh: '真好吃！' }] }
    ],
    5: [
      { id: 'e5a', name: 'Unit 1 Daily Routine 一天生活', words: [{ en: 'get up', zh: '起床', e: '⏰' }, { en: 'wash face', zh: '洗脸', e: '🧼' }, { en: 'go to school', zh: '去上学', e: '🏫' }, { en: 'do homework', zh: '写作业', e: '📝' }, { en: 'have dinner', zh: '吃晚饭', e: '🍽️' }, { en: 'go to bed', zh: '睡觉', e: '🛏️' }], sentences: [{ en: 'I get up at six thirty.', zh: '我六点半起床。' }, { en: 'When do you do homework?', zh: '你什么时候写作业？' }, { en: 'I go to bed at nine.', zh: '我九点睡觉。' }] },
      { id: 'e5b', name: 'Unit 2 Hobbies 兴趣爱好', words: [{ en: 'reading', zh: '阅读', e: '📖' }, { en: 'drawing', zh: '画画', e: '🎨' }, { en: 'swimming', zh: '游泳', e: '🏊' }, { en: 'singing', zh: '唱歌', e: '🎤' }, { en: 'running', zh: '跑步', e: '🏃' }, { en: 'chess', zh: '下棋', e: '♟️' }], sentences: [{ en: 'What is your hobby?', zh: '你的爱好是什么？' }, { en: 'I like drawing pictures.', zh: '我喜欢画画。' }, { en: 'He is good at swimming.', zh: '他擅长游泳。' }] }
    ],
    6: [
      { id: 'e6a', name: 'Unit 1 Travel 旅行', words: [{ en: 'plane', zh: '飞机', e: '✈️' }, { en: 'train', zh: '火车', e: '🚄' }, { en: 'ticket', zh: '车票', e: '🎫' }, { en: 'map', zh: '地图', e: '🗺️' }, { en: 'hotel', zh: '酒店', e: '🏨' }, { en: 'camera', zh: '照相机', e: '📷' }], sentences: [{ en: 'Where are you going?', zh: '你要去哪里？' }, { en: 'I am going to Beijing by train.', zh: '我要坐火车去北京。' }, { en: 'Have a nice trip!', zh: '旅途愉快！' }] },
      { id: 'e6b', name: 'Unit 2 Jobs 职业', words: [{ en: 'teacher', zh: '老师', e: '👩‍🏫' }, { en: 'doctor', zh: '医生', e: '👨‍⚕️' }, { en: 'police', zh: '警察', e: '👮' }, { en: 'engineer', zh: '工程师', e: '👷' }, { en: 'farmer', zh: '农民', e: '🧑‍🌾' }, { en: 'writer', zh: '作家', e: '🖋️' }], sentences: [{ en: 'What does your mother do?', zh: '你妈妈是做什么的？' }, { en: 'She is a doctor.', zh: '她是一名医生。' }, { en: 'I want to be an engineer.', zh: '我想成为工程师。' }] }
    ]
  };
  function englishGrade(g) {
    return memo('english' + g, function () { return (ENGLISH[g] || []).concat(custom('english', g)); });
  }

  /* ========== 6. 逻辑挑战 ========== */
  var LOGIC_STATIC = {
    1: [
      { q: '找规律：🍎 🍌 🍎 🍌 🍎 ?', opts: ['🍌', '🍎', '🍇', '🍐'], ans: 0, tip: '两个水果轮流出现。' },
      { q: '哪一个和其他不一样？', opts: ['🐶', '🐱', '🚗', '🐰'], ans: 2, tip: '其他三个都是小动物。' },
      { q: '找规律：🔺 🔺 🔵 🔺 🔺 ?', opts: ['🔵', '🔺', '🟥', '⭐'], ans: 0, tip: '每两个三角后面跟一个圆。' },
      { q: '从小到大排，谁排第一？', opts: ['🐘', '🐭', '🐕', '🐈'], ans: 1, tip: '老鼠最小。' }
    ],
    2: [
      { q: '找规律：🌕 🌗 🌑 🌗 🌕 ?', opts: ['🌗', '🌑', '🌕', '⭐'], ans: 0, tip: '像镜子一样来回变化。' },
      { q: '哪个不属于同一类？', opts: ['🍎 苹果', '🍌 香蕉', '🥕 胡萝卜', '🍇 葡萄'], ans: 2, tip: '胡萝卜是蔬菜。' },
      { q: '小明比小红高，小红比小刚高。谁最矮？', opts: ['小刚', '小红', '小明', '一样高'], ans: 0, tip: '排一排：小明 > 小红 > 小刚。' },
      { q: '一个正方形剪掉一个角，最多有几个角？', opts: ['5', '3', '4', '6'], ans: 0, tip: '斜着剪会多出角来。' }
    ],
    3: [
      { q: '3 个小朋友每人握手一次，一共握几次手？', opts: ['3', '6', '2', '9'], ans: 0, tip: 'A-B、A-C、B-C 共 3 次。' },
      { q: '爸爸今年 36 岁，儿子 6 岁。几年后爸爸年龄是儿子的 3 倍？', opts: ['9 年后', '6 年后', '12 年后', '3 年后'], ans: 0, tip: '年龄差 30 不变，3 倍时儿子 15 岁。' },
      { q: '一根绳子对折两次后剪一刀，变成几段？', opts: ['5', '4', '3', '6'], ans: 0, tip: '动手折一折数一数。' },
      { q: '钟表 3 点整，时针和分针夹角是多少度？', opts: ['90°', '60°', '30°', '120°'], ans: 0, tip: '每个大格 30°，相差 3 格。' }
    ]
  };
  function logicSet(level) {
    var arr = (LOGIC_STATIC[level] || LOGIC_STATIC[1]).slice();
    // 数列找规律（程序化生成，题目无限）
    var step = level * rnd(2, 3), start = rnd(1, 6) * level;
    var seq = [start, start + step, start + step * 2, start + step * 3];
    arr.push({ q: '找规律填数：' + seq.join('，') + '，?', opts: shuffle([String(start + step * 4), String(start + step * 5), String(start + step * 3), String(start + step * 4 + 1)]), ans: -1, correctText: String(start + step * 4), tip: '每次增加 ' + step + '。' });
    var a = rnd(2, 5 + level), r = rnd(2, 3);
    var seq2 = [a, a * r, a * r * r];
    arr.push({ q: '找规律填数：' + seq2.join('，') + '，?', opts: shuffle([String(a * r * r * r), String(a * r * r + r), String(a * r * r * r + 1), String(a + r * 3)]), ans: -1, correctText: String(a * r * r * r), tip: '每次乘以 ' + r + '。' });
    var n1 = rnd(3, 9 + level * 3), n2 = rnd(3, 9 + level * 3), n3 = rnd(3, 9 + level * 3);
    var mx = Math.max(n1, n2, n3);
    arr.push({ q: '排序题：' + n1 + '、' + n2 + '、' + n3 + ' 中最大的是？', opts: shuffle([String(mx), String(Math.min(n1, n2, n3)), String(n1 + n2), String(Math.abs(n1 - n2))]), ans: -1, correctText: String(mx), tip: '比一比十位再比个位。' });
    // 归一化：把 correctText 转成 ans 下标
    arr = arr.map(function (q) {
      if (q.ans >= 0) { var opts = shuffle(q.opts); return { q: q.q, opts: opts, ans: opts.indexOf(q.opts[q.ans]), tip: q.tip }; }
      return { q: q.q, opts: q.opts, ans: q.opts.indexOf(q.correctText), tip: q.tip };
    });
    return shuffle(arr);
  }

  /* ========== 8. 宠物养成：品种 & 商店 ========== */
  var BREEDS = [
    { id: 'poodle', name: '贵宾', trait: '聪明', desc: '一学就会，最爱做算术题', body: '#F3D9B1', ear: '#E2BC8A', curly: true, emoji: '🐩' },
    { id: 'corgi', name: '柯基', trait: '活泼', desc: '小短腿跑得飞快，屁股会扭', body: '#F0A85C', ear: '#DB8C3D', short: true, emoji: '🐕' },
    { id: 'shiba', name: '柴犬', trait: '傲娇', desc: '会微笑，但不轻易听你的', body: '#E9A54B', ear: '#CE8A2E', emoji: '🐕‍🦺' },
    { id: 'golden', name: '金毛', trait: '黏人', desc: '超级温柔，永远等你回家', body: '#F2C572', ear: '#DCA850', big: true, emoji: '🦮' },
    { id: 'bichon', name: '比熊', trait: '爱撒娇', desc: '白白胖胖，像一朵小云彩', body: '#FBFBF7', ear: '#EDE7DC', curly: true, emoji: '🐶' },
    { id: 'husky', name: '哈士奇', trait: '精力旺', desc: '二哈本哈，精力无限超可爱', body: '#E8EDF2', ear: '#C9D3DD', blue: true, emoji: '🐺' },
    { id: 'frenchie', name: '法斗', trait: '憨憨', desc: '小短鼻大头，坐着像块小面包', body: '#9AA7B0', ear: '#7E8A93', short: true, bat: true, emoji: '🐶' },
    { id: 'samoyed', name: '萨摩', trait: '微笑', desc: '雪白棉花糖，永远在笑', body: '#FBFBF8', ear: '#E6E6DD', emoji: '🐕' }
  ];
  var SHOP = [
    { id: 'food_normal', name: '普通狗粮', ico: '🥣', price: 5, cat: 'consume', desc: '饱食 +25', effect: { hunger: 25, exp: 3 } },
    { id: 'food_premium', name: '豪华狗粮', ico: '🍖', price: 12, cat: 'consume', desc: '饱食 +45，心情 +10', effect: { hunger: 45, mood: 10, exp: 8 } },
    { id: 'bath', name: '洗澡套餐', ico: '🛁', price: 8, cat: 'consume', desc: '清洁 +50，心情 +5', effect: { clean: 50, mood: 5, exp: 5 } },
    { id: 'bone', name: '大骨头', ico: '🦴', price: 10, cat: 'consume', desc: '心情 +20，经验 +10', effect: { mood: 20, exp: 10 } },
    { id: 'snack', name: '零食袋', ico: '🍬', price: 8, cat: 'consume', desc: '心情 +15', effect: { mood: 15 } },
    { id: 'cake', name: '生日蛋糕', ico: '🎂', price: 25, cat: 'consume', desc: '心情 +30，经验 +15', effect: { mood: 30, exp: 15 } },
    { id: 'medicine', name: '家庭药箱', ico: '💊', price: 18, cat: 'medicine', desc: '健康 +60，治病平替', effect: { health: 60, mood: 5 } },
    { id: 'ball', name: '玩具球', ico: '🎾', price: 15, cat: 'item', desc: '陪玩时心情加成更高', effect: {} },
    { id: 'frisbee', name: '飞盘', ico: '🥏', price: 18, cat: 'item', desc: '玩耍心情加成更高', effect: {} },
    { id: 'collar', name: '彩虹项圈', ico: '🎀', price: 20, cat: 'item', desc: '戴上更神气（外观）', effect: {} },
    { id: 'hat', name: '小帽子', ico: '🎩', price: 25, cat: 'item', desc: '出门必备的时髦装备（外观）', effect: {} },
    { id: 'house', name: '温暖小窝', ico: '🏠', price: 40, cat: 'item', desc: '睡得香，每天心情恢复更快', effect: {} },
    { id: 'comb', name: '小梳子', ico: '🪮', price: 8, cat: 'item', desc: '梳毛时更顺滑（外观）', effect: {} },
    { id: 'travel', name: '旅行包', ico: '🎒', price: 22, cat: 'item', desc: '解锁「海边」度假场景', effect: {}, travel: true },
    { id: 'bed', name: '小床装饰', ico: '🛏️', price: 30, cat: 'decor', scene: 'room', desc: '房间装饰（房间场景显示）', effect: {} },
    { id: 'plant', name: '绿植', ico: '🪴', price: 15, cat: 'decor', scene: 'living', desc: '客厅装饰（客厅场景显示）', effect: {} },
    { id: 'swing', name: '院子秋千', ico: '🎠', price: 35, cat: 'decor', scene: 'yard', desc: '院子装饰（院子场景显示）', effect: {} }
  ];
  var PET_ACTIONS = [
    { id: 'pet', name: '抚摸', ico: '🤲', cost: 0, desc: '免费！心情 +6', effect: { mood: 6, exp: 2 } },
    { id: 'feed', name: '喂食', ico: '🥣', cost: 5, desc: '饱食 +25', effect: { hunger: 25, exp: 4 } },
    { id: 'wash', name: '洗澡', ico: '🛁', cost: 8, desc: '清洁 +45', effect: { clean: 45, mood: 4, exp: 5 } },
    { id: 'play', name: '玩耍', ico: '🎾', cost: 6, desc: '心情 +18，饱食 −5', effect: { mood: 18, hunger: -5, exp: 8 } },
    { id: 'train', name: '训练', ico: '🏅', cost: 10, desc: '经验 +20，饱食 −8', effect: { exp: 20, hunger: -8, mood: -3 } },
    { id: 'groom', name: '梳毛', ico: '🪮', cost: 6, desc: '心情 +10，清洁 +8', effect: { mood: 10, clean: 8, exp: 3 } },
    { id: 'water', name: '喂水', ico: '💧', cost: 0, desc: '免费！解渴心情 +3', effect: { mood: 3 } },
    { id: 'walk', name: '遛弯', ico: '🌿', cost: 0, desc: '免费！心情 +8，经验 +2', effect: { mood: 8, exp: 2 } }
  ];
  var STAGES = [
    { min: 1, name: '幼崽', scale: .72, emoji: '🍼' },
    { min: 3, name: '幼年', scale: .85, emoji: '🐾' },
    { min: 6, name: '少年', scale: 1.0, emoji: '⭐' },
    { min: 9, name: '成年', scale: 1.14, emoji: '👑' }
  ];

  /* ========== 8.1 宠物场景 ========== */
  var PET_SCENES = [
    { id: 'home', name: '陪伴', ico: '🐾', kind: 'home' },
    { id: 'room', name: '房间', ico: '🛏️', kind: 'room' },
    { id: 'living', name: '客厅', ico: '🛋️', kind: 'living' },
    { id: 'yard', name: '小院子', ico: '🌿', kind: 'yard' },
    { id: 'park', name: '公园', ico: '🌳', kind: 'park' },
    { id: 'school', name: '宠物学校', ico: '🏫', kind: 'school' },
    { id: 'hospital', name: '宠物医院', ico: '🏥', kind: 'hospital' },
    { id: 'beach', name: '海边', ico: '🏖️', kind: 'beach' },
    { id: 'shop', name: '商店', ico: '🛒', kind: 'shop' }
  ];

  /* ========== 8.2 把戏（宠物学校产出） ========== */
  var PET_TRICKS = [
    { id: 'sit', name: '坐下', ico: '🪑' },
    { id: 'shake', name: '握手', ico: '🤝' },
    { id: 'roll', name: '打滚', ico: '🌀' },
    { id: 'spin', name: '转圈', ico: '💫' },
    { id: 'playdead', name: '装死', ico: '💤' },
    { id: 'bow', name: '鞠躬', ico: '🙇' }
  ];

  /* ========== 8.3 随机事件（30 种） ==========
     cat: sick 病 / hurt 伤 / need 需 / good 好 / choice 选
     cond: 触发场景（any 任意；yard/park/beach/school 限定）
     choices[].eff: { hunger,clean,mood,health,exp, cured, injury, sick, beach, trick, item, album }
       injury: 'leg'|'paw'|'head'|null  → 显示绷带
       sick: true/false                  → 病容覆盖层
       quiz: true                        → 选择后做 1 道迷你学习题，赢才生效 winEff
  */
  var PET_EVENTS = [
    // —— 病（8）——
    { id: 'e1', cat: 'sick', ico: '🤒', title: '感冒发烧', cond: 'any',
      text: '{n} 打喷嚏、流眼泪，小鼻子热乎乎的……好像感冒了！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 10, cured: 1 }, msg: '医生开了药，{n} 很快退烧啦～' },
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 60, sick: false, mood: 5 }, msg: '吃了药，{n} 好多了（还有点蔫）' }
      ] },
    { id: 'e2', cat: 'sick', ico: '🤢', title: '吃坏肚子', cond: 'any',
      text: '{n} 捂着肚子哼哼，刚才偷吃了不该吃的东西……',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '医生一治就好，{n} 不闹肚子了' },
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 60, sick: false, mood: 5 }, msg: '{n} 舒服一些了' }
      ] },
    { id: 'e3', cat: 'sick', ico: '🥶', title: '着凉打喷嚏', cond: 'any',
      text: '{n} 打了个大喷嚏，毛都抖起来了，估计是着凉了。',
      choices: [
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 55, sick: false, mood: 5 }, msg: '保暖吃药，{n} 不打喷嚏了' },
        { label: '多盖被子', ico: '🛏️', cost: 0, eff: { health: 35, sick: false, mood: 3 }, msg: '{n} 钻进被窝睡了一觉' }
      ] },
    { id: 'e4', cat: 'sick', ico: '🌡️', title: '皮肤过敏', cond: 'any',
      text: '{n} 一直挠身子，皮肤红红的，可能是过敏了。',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '抹了药膏，不痒啦' }
      ] },
    { id: 'e5', cat: 'sick', ico: '🦷', title: '牙齿疼', cond: 'any',
      text: '{n} 不想吃东西，碰到硬东西就躲，牙疼！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '看了牙医，{n} 又能啃骨头啦' }
      ] },
    { id: 'e6', cat: 'sick', ico: '👁️', title: '眼睛发炎', cond: 'any',
      text: '{n} 眼角湿湿的，总用爪子揉眼睛。',
      choices: [
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 55, sick: false, mood: 5 }, msg: '滴了眼药水，好多了' },
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '医生处理干净，眼睛亮晶晶' }
      ] },
    { id: 'e7', cat: 'sick', ico: '🔥', title: '中暑了', cond: 'beach',
      text: '海边太阳太毒，{n} 吐着舌头直喘气，中暑啦！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 6, cured: 1 }, msg: '挂了水，{n} 缓过来了' },
        { label: '回阴凉处', ico: '🏖️', cost: 0, eff: { health: 45, sick: false, mood: 5 }, msg: '到树荫下喝水，好些了' }
      ] },
    { id: 'e8', cat: 'sick', ico: '👂', title: '耳朵发炎', cond: 'any',
      text: '{n} 总甩头，耳朵里有点臭臭的。',
      choices: [
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 55, sick: false, mood: 5 }, msg: '滴了耳药，不甩头了' },
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '清理干净，耳朵清爽' }
      ] },
    // —— 伤（6）——
    { id: 'e9', cat: 'hurt', ico: '🦵', title: '摔伤腿', cond: 'yard',
      text: '院子里跑太快，{n} 摔了一跤，后腿瘸了一下！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '打了石膏，{n} 又能蹦跳啦' },
        { label: '回家养着', ico: '🛏️', cost: 0, eff: { injury: 'leg', health: 30 }, msg: '{n} 腿上贴了绷带，慢慢养' }
      ] },
    { id: 'e10', cat: 'hurt', ico: '🐝', title: '被蜜蜂蛰', cond: 'park',
      text: '公园草丛里，{n} 被蜜蜂蛰了一下，肿起小包！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '拔了刺涂药，消肿啦' },
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 60, sick: false, injury: null, mood: 5 }, msg: '冰敷涂药，不疼了' }
      ] },
    { id: 'e11', cat: 'hurt', ico: '🫠', title: '误食异物', cond: 'yard',
      text: '{n} 在院子里瞎啃，好像吞了不该吞的小东西！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '医生帮忙取出，虚惊一场' }
      ] },
    { id: 'e12', cat: 'hurt', ico: '🩹', title: '扭伤脚踝', cond: 'any',
      text: '{n} 跳台阶扭了一下脚，一瘸一拐的。',
      choices: [
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 55, sick: false, injury: 'leg', mood: 5 }, msg: '喷了药、包了脚，注意别跑' },
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '检查没大事，休息就好' }
      ] },
    { id: 'e13', cat: 'hurt', ico: '🦴', title: '轻微骨折', cond: 'any',
      text: '玩得太疯，{n} 突然疼得叫起来，可能骨折了！',
      choices: [
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '拍片固定，{n} 乖乖养伤' }
      ] },
    { id: 'e14', cat: 'hurt', ico: '🐾', title: '抓伤爪子', cond: 'any',
      text: '{n} 的爪子被树枝划了一道小口子。',
      choices: [
        { label: '用家庭药箱', ico: '💊', cost: 18, eff: { health: 55, sick: false, injury: 'paw', mood: 5 }, msg: '消毒包好，爪子贴了绷带' },
        { label: '去宠物医院', ico: '🏥', cost: 20, eff: { health: 100, sick: false, injury: null, mood: 8, cured: 1 }, msg: '处理干净，爪子恢复如初' }
      ] },
    // —— 需（8）——
    { id: 'e15', cat: 'need', ico: '🥣', title: '肚子饿', cond: 'any',
      text: '{n} 围着食盆转圈，小肚子咕咕叫。',
      choices: [
        { label: '喂点吃的', ico: '🥣', cost: 5, eff: { hunger: 30, exp: 3 }, msg: '{n} 吃得吧唧吧唧，满足啦' }
      ] },
    { id: 'e16', cat: 'need', ico: '🪣', title: '满身泥巴', cond: 'yard',
      text: '在院子里打滚，{n} 变成了一只小泥狗！',
      choices: [
        { label: '洗个澡', ico: '🛁', cost: 8, eff: { clean: 50, mood: 5, exp: 4 }, msg: '香喷喷的，{n} 干净啦' }
      ] },
    { id: 'e17', cat: 'need', ico: '🧸', title: '无聊拆家', cond: 'any',
      text: '{n} 把纸巾撕得满地都是，明显是太无聊啦。',
      choices: [
        { label: '陪它玩', ico: '🎾', cost: 6, eff: { mood: 20, exp: 8 }, msg: '玩累了，{n} 乖乖趴下' },
        { label: '收拾一下', ico: '🧹', cost: 0, eff: { mood: 8 }, msg: '你收拾，{n} 在旁边看着' }
      ] },
    { id: 'e18', cat: 'need', ico: '😴', title: '犯困了', cond: 'any',
      text: '{n} 打着哈欠，眼皮直打架。',
      choices: [
        { label: '回房间睡', ico: '🛏️', cost: 0, eff: { mood: 18, exp: 2 }, msg: '{n} 睡了个香喷喷的午觉' }
      ] },
    { id: 'e19', cat: 'need', ico: '🚽', title: '想上厕所', cond: 'any',
      text: '{n} 在门口转来转去，还哼哼唧唧。',
      choices: [
        { label: '去院子', ico: '🌿', cost: 0, eff: { mood: 10 }, msg: '解决完，{n} 轻松多了' }
      ] },
    { id: 'e20', cat: 'need', ico: '💧', title: '口渴', cond: 'any',
      text: '{n} 舔着嘴唇，明显是想喝水。',
      choices: [
        { label: '喂点水', ico: '💧', cost: 0, eff: { mood: 5 }, msg: '{n} 咕咚咕咚喝饱了' }
      ] },
    { id: 'e21', cat: 'need', ico: '🪮', title: '毛打结', cond: 'any',
      text: '{n} 的毛毛缠成一团，有点不舒服。',
      choices: [
        { label: '梳一梳', ico: '🪮', cost: 6, eff: { mood: 10, clean: 8, exp: 3 }, msg: '梳顺毛，{n} 蓬松又舒服' }
      ] },
    { id: 'e22', cat: 'need', ico: '☀️', title: '想晒太阳', cond: 'yard',
      text: '{n} 趴在门口，眼巴巴望着外面的阳光。',
      choices: [
        { label: '带去晒太阳', ico: '☀️', cost: 0, eff: { mood: 12 }, msg: '晒着太阳，{n} 眯起了眼' }
      ] },
    // —— 好（6）——
    { id: 'e23', cat: 'good', ico: '🎁', title: '捡到宝箱', cond: 'park',
      text: '草丛里有个小宝箱，{n} 用爪子扒拉出来了！', manual: true,
      choices: [
        { label: '打开看看', ico: '📦', cost: 0, eff: { treasure: true }, msg: '里面有几颗星星！' }
      ] },
    { id: 'e24', cat: 'good', ico: '🎂', title: '生日到啦', cond: 'any',
      text: '今天是 {n} 的领养纪念日，要庆祝一下！',
      choices: [
        { label: '收下礼物', ico: '🎁', cost: 0, eff: { mood: 20, exp: 10, gift: true, album: '生日快乐 🎂' }, msg: '收到一份小惊喜！' }
      ] },
    { id: 'e25', cat: 'good', ico: '🎈', title: '朋友来串门', cond: 'any',
      text: '邻居的狗狗来串门，还带了小礼物给 {n}！',
      choices: [
        { label: '收下礼物', ico: '🎀', cost: 0, eff: { mood: 12, exp: 5, gift: true }, msg: '{n} 交到新朋友啦' }
      ] },
    { id: 'e26', cat: 'good', ico: '🏫', title: '学校小测验', cond: 'school',
      text: '宠物学校今天有小测验，考考 {n} 也考考你！', manual: true,
      choices: [
        { label: '去上课', ico: '📚', cost: 12, quiz: true, winEff: { trick: true, exp: 15, mood: 8 }, loseEff: { mood: -3 }, msg: '答对啦，{n} 学会新把戏！' }
      ] },
    { id: 'e27', cat: 'good', ico: '📮', title: '海边明信片', cond: 'beach',
      text: '海风里飘来一张明信片，是 {n} 自己的旅行照！', manual: true,
      choices: [
        { label: '收进相册', ico: '🖼️', cost: 0, eff: { mood: 15, album: '海边旅行 🏖️' }, msg: '照片贴进相册啦' }
      ] },
    { id: 'e28', cat: 'good', ico: '👏', title: '邻居夸奖', cond: 'any',
      text: '邻居阿姨说："{n} 真乖真可爱！"',
      choices: [
        { label: '开心接受', ico: '😊', cost: 0, eff: { mood: 10, exp: 5 }, msg: '{n} 骄傲地仰起头' }
      ] },
    // —— 选（2）——
    { id: 'e29', cat: 'choice', ico: '🔍', title: '公园走丢', cond: 'park',
      text: '人多眼杂，一转眼 {n} 跑没影了！',
      choices: [
        { label: '去找它（做题）', ico: '🔍', cost: 0, quiz: true, winEff: { mood: 15, exp: 6, album: '公园冒险 🌳' }, loseEff: { mood: -5 }, msg: '凭线索找到了 {n}！' },
        { label: '在原地等', ico: '⏳', cost: 0, eff: { mood: -10 }, msg: '等了一会儿，{n} 自己溜回来了' }
      ] },
    { id: 'e30', cat: 'choice', ico: '⛏️', title: '院子挖宝', cond: 'yard',
      text: '{n} 在院子里刨坑，好像挖到了什么！',
      choices: [
        { label: '一起挖（做题）', ico: '⛏️', cost: 0, quiz: true, winEff: { item: 'bone', exp: 6, mood: 8, album: '挖到宝藏 🦴' }, loseEff: {}, msg: '挖出一根大骨头！' },
        { label: '埋回去', ico: '🪴', cost: 0, eff: { mood: 5 }, msg: '{n} 乖乖埋好啦' }
      ] }
  ];

  /* ========== 内容管理模板 ========== */
  function templateJSON() {
    return JSON.stringify({
      reading: {
        "1": [{
          id: "my_r1", title: "我自己加的课文",
          lines: [{ t: "这里是正文第一句。", p: "zhè lǐ shì zhèng wén dì yī jù" }],
          chars: [{ c: "正", p: "zhèng", w: "正文" }],
          words: ["正文"], pattern: "……是……。",
          sentences: [["这", "是", "一句", "话"]]
        }]
      },
      poems: { "2": [{ id: "my_p1", title: "诗名", author: "作者", lines: [{ t: "第一句诗。", p: "dì yī jù shī" }], note: "简介" }] },
      english: { "3": [{ id: "my_e1", name: "Unit X 主题", words: [{ en: "word", zh: "词义", e: "🐣" }], sentences: [{ en: "Hello.", zh: "你好。" }] }] },
      math: { "4": [{ id: "my_m1", name: "我的知识点", summary: "重点总结写这里。", bank: [{ q: "1+1=?", opts: ["2", "1", "3", "11"], ans: 0, tip: "提示语" }] }] }
    }, null, 2);
  }

  return {
    clearCache: clearCache,
    letters: letters,
    readingGrade: readingGrade,
    poemsGrade: poemsGrade, allPoems: allPoems,
    mathGrade: mathGrade, mathQuestion: mathQuestion,
    englishGrade: englishGrade,
    logicSet: logicSet,
    breeds: function () { return BREEDS; },
    shop: function () { return SHOP; },
    petActions: function () { return PET_ACTIONS; },
    stages: function () { return STAGES; },
    petScenes: function () { return PET_SCENES; },
    petTricks: function () { return PET_TRICKS; },
    petEvents: function () { return PET_EVENTS; },
    templateJSON: templateJSON,
    mk: mk, shuffle: shuffle, rnd: rnd
  };
})();
