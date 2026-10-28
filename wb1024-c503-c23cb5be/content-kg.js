/* ============================================================
 * 佩妮英语 · 大班档（幼儿园大班 / 英语起步）
 *
 * 设计原则：
 *   1. 每天 5 个词，全部是「看得见、摸得着」的动作和东西，不教抽象词
 *   2. 句子 3～5 个词，主谓宾极简，孩子跟读一遍就能说
 *   3. 每幕围绕当天一个词演一个小桥段（佩妮跳泥坑、下雨、看医生……）
 *   4. 场景越热闹越好：泥坑、下雨、小狗、蛋糕、生日会
 *
 * 结构和小程序版 content.js 完全一致，页面代码无需区分档位。
 * ============================================================ */

const CONTENT_KG = [
  {
    day: 1,
    theme: 'Muddy Puddle',
    themeCn: '泥坑',
    color: '#ff9ec4',
    pattern: { en: 'I like ___.', cn: '我喜欢……', demo: 'I like mud.' },
    words: [
      { w: 'mud',  ipa: '/mʌd/',   cn: '泥巴', emoji: '🟤', tip: 'I like mud.',    tipCn: '我喜欢泥巴。' },
      { w: 'jump', ipa: '/dʒʌmp/', cn: '跳',   emoji: '🦘', tip: 'I can jump.',    tipCn: '我会跳。' },
      { w: 'boots', ipa: '/buːts/', cn: '雨靴', emoji: '👢', tip: 'My boots are gold.', tipCn: '我的雨靴是金色的。' },
      { w: 'wet',  ipa: '/wet/',   cn: '湿的', emoji: '💦', tip: 'I am wet.',     tipCn: '我湿了。' },
      { w: 'happy', ipa: '/ˈhæpi/', cn: '开心', emoji: '😄', tip: 'I am happy.',   tipCn: '我很开心。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny'], prop: '🟤', lines: [
        { who: 'Penny', en: 'Look! A muddy puddle.', cn: '看！一个泥坑。' },
        { who: 'Penny', en: 'I like mud!', cn: '我喜欢泥巴！' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '👢', lines: [
        { who: 'Penny', en: 'Boots on!', cn: '穿上雨靴！' },
        { who: 'Penny', en: 'Jump, jump, jump!', cn: '跳，跳，跳！' }
      ]},
      { bg: 'garden', cast: ['penny', 'mummy'], prop: '💦', lines: [
        { who: 'Mummy', en: 'You are wet!', cn: '你湿啦！' },
        { who: 'Penny', en: 'I am happy!', cn: '我很开心！' }
      ]}
    ]
  },
  {
    day: 2,
    theme: 'Rainy Day',
    themeCn: '下雨天',
    color: '#8ec8ff',
    pattern: { en: 'It is ___.', cn: '天气……', demo: 'It is rainy.' },
    words: [
      { w: 'rain',     ipa: '/reɪn/',      cn: '雨',   emoji: '🌧️', tip: 'It is rainy.',      tipCn: '下雨了。' },
      { w: 'umbrella', ipa: '/ʌmˈbrelə/',  cn: '雨伞', emoji: '☂️', tip: 'I have an umbrella.', tipCn: '我有一把伞。' },
      { w: 'splash',   ipa: '/splæʃ/',     cn: '溅水', emoji: '💧', tip: 'Splash, splash!',   tipCn: '哗啦哗啦！' },
      { w: 'coat',     ipa: '/kəʊt/',      cn: '外套', emoji: '🧥', tip: 'I have a coat.',    tipCn: '我有一件外套。' },
      { w: 'home',     ipa: '/həʊm/',      cn: '家',   emoji: '🏠', tip: 'Let us go home.',   tipCn: '我们回家吧。' }
    ],
    scenes: [
      { bg: 'rain', cast: ['penny'], prop: '🌧️', lines: [
        { who: 'Penny', en: 'It is rainy.', cn: '下雨了。' },
        { who: 'Penny', en: 'I have an umbrella.', cn: '我有一把伞。' }
      ]},
      { bg: 'rain', cast: ['penny', 'tommy'], prop: '💧', lines: [
        { who: 'Tommy', en: 'Splash, splash!', cn: '哗啦，哗啦！' },
        { who: 'Penny', en: 'I like the rain.', cn: '我喜欢下雨。' }
      ]},
      { bg: 'rain', cast: ['penny', 'mummy'], prop: '🧥', lines: [
        { who: 'Mummy', en: 'Put on your coat.', cn: '穿上外套。' },
        { who: 'Penny', en: 'Let us go home.', cn: '我们回家吧。' }
      ]}
    ]
  },
  {
    day: 3,
    theme: 'My Dog',
    themeCn: '我的小狗',
    color: '#ffd166',
    pattern: { en: 'I ___.', cn: '我……', demo: 'I run.' },
    words: [
      { w: 'dog',  ipa: '/dɒɡ/',   cn: '小狗', emoji: '🐶', tip: 'It is a dog.',  tipCn: '它是一只小狗。' },
      { w: 'run',  ipa: '/rʌn/',   cn: '跑',   emoji: '🏃', tip: 'I run.',        tipCn: '我跑。' },
      { w: 'ball', ipa: '/bɔːl/',  cn: '球',   emoji: '⚽', tip: 'I have a ball.', tipCn: '我有一个球。' },
      { w: 'tail', ipa: '/teɪl/',  cn: '尾巴', emoji: '🐕', tip: 'Look at the tail.', tipCn: '看这条尾巴。' },
      { w: 'bye',  ipa: '/baɪ/',   cn: '再见', emoji: '👋', tip: 'Bye-bye, dog!', tipCn: '再见，小狗！' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny', 'dog'], prop: '🐶', lines: [
        { who: 'Penny', en: 'It is a dog.', cn: '它是一只小狗。' },
        { who: 'Penny', en: 'Look at the tail!', cn: '看这条尾巴！' }
      ]},
      { bg: 'garden', cast: ['penny', 'dog'], prop: '⚽', lines: [
        { who: 'Penny', en: 'I have a ball.', cn: '我有一个球。' },
        { who: 'Penny', en: 'Run, run, run!', cn: '跑，跑，跑！' }
      ]},
      { bg: 'garden', cast: ['penny', 'dog', 'tommy'], prop: '👋', lines: [
        { who: 'Tommy', en: 'I can run, too.', cn: '我也会跑。' },
        { who: 'Penny', en: 'Bye-bye, dog!', cn: '再见，小狗！' }
      ]}
    ]
  },
  {
    day: 4,
    theme: 'Ducks',
    themeCn: '小鸭子',
    color: '#7fdca6',
    pattern: { en: 'I can see ___.', cn: '我能看见……', demo: 'I can see ducks.' },
    words: [
      { w: 'duck',   ipa: '/dʌk/',   cn: '鸭子', emoji: '🦆', tip: 'It is a duck.',      tipCn: '它是一只鸭子。' },
      { w: 'pond',   ipa: '/pɒnd/',  cn: '池塘', emoji: '💧', tip: 'This is a pond.',    tipCn: '这是一个池塘。' },
      { w: 'swim',   ipa: '/swɪm/',  cn: '游泳', emoji: '🏊', tip: 'I can swim.',        tipCn: '我会游泳。' },
      { w: 'quack',  ipa: '/kwæk/',  cn: '嘎嘎叫', emoji: '📣', tip: 'Quack, quack!',    tipCn: '嘎嘎，嘎嘎！' },
      { w: 'little', ipa: '/ˈlɪtl/', cn: '小小的', emoji: '🤏', tip: 'A little duck.',   tipCn: '一只小鸭子。' }
    ],
    scenes: [
      { bg: 'pond', cast: ['penny', 'duck'], prop: '🦆', lines: [
        { who: 'Penny', en: 'This is a pond.', cn: '这是一个池塘。' },
        { who: 'Penny', en: 'I can see a little duck.', cn: '我能看见一只小鸭子。' }
      ]},
      { bg: 'pond', cast: ['penny', 'duck'], prop: '📣', lines: [
        { who: 'Penny', en: 'Quack, quack!', cn: '嘎嘎，嘎嘎！' },
        { who: 'Penny', en: 'I can swim, too!', cn: '我也会游泳！' }
      ]},
      { bg: 'pond', cast: ['penny', 'duck', 'mummy'], prop: '💧', lines: [
        { who: 'Mummy', en: 'Splash, splash!', cn: '哗啦，哗啦！' },
        { who: 'Penny', en: 'The duck is happy.', cn: '鸭子很开心。' }
      ]}
    ]
  },
  {
    day: 5,
    theme: 'Yummy Food',
    themeCn: '好吃的东西',
    color: '#ffb3d1',
    pattern: { en: 'I like ___.', cn: '我喜欢……', demo: 'I like cake.' },
    words: [
      { w: 'cake',   ipa: '/keɪk/',  cn: '蛋糕', emoji: '🍰', tip: 'I like cake.',     tipCn: '我喜欢蛋糕。' },
      { w: 'apple',  ipa: '/ˈæpl/',  cn: '苹果', emoji: '🍎', tip: 'I like apples.',   tipCn: '我喜欢苹果。' },
      { w: 'milk',   ipa: '/mɪlk/',  cn: '牛奶', emoji: '🥛', tip: 'I like milk.',     tipCn: '我喜欢牛奶。' },
      { w: 'yummy',  ipa: '/ˈjʌmi/', cn: '好吃', emoji: '😋', tip: 'Yummy, yummy!',    tipCn: '好吃，好吃！' },
      { w: 'more',   ipa: '/mɔː/',   cn: '更多', emoji: '➕', tip: 'More, please!',    tipCn: '请再来一点！' }
    ],
    scenes: [
      { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍰', lines: [
        { who: 'Penny', en: 'I like cake.', cn: '我喜欢蛋糕。' },
        { who: 'Penny', en: 'Yummy, yummy!', cn: '好吃，好吃！' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍎', lines: [
        { who: 'Tommy', en: 'I like apples.', cn: '我喜欢苹果。' },
        { who: 'Penny', en: 'I like milk, too.', cn: '我也喜欢牛奶。' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '➕', lines: [
        { who: 'Penny', en: 'More, please!', cn: '请再来一点！' },
        { who: 'Mummy', en: 'Here you are.', cn: '给你。' }
      ]}
    ]
  },
  {
    day: 6,
    theme: 'My Body',
    themeCn: '我的身体',
    color: '#c3a6ff',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my nose.' },
    words: [
      { w: 'nose',  ipa: '/nəʊz/',   cn: '鼻子', emoji: '👃', tip: 'This is my nose.',  tipCn: '这是我的鼻子。' },
      { w: 'eyes',  ipa: '/aɪz/',    cn: '眼睛', emoji: '👀', tip: 'These are my eyes.', tipCn: '这是我的眼睛。' },
      { w: 'mouth', ipa: '/maʊθ/',   cn: '嘴巴', emoji: '👄', tip: 'This is my mouth.', tipCn: '这是我的嘴巴。' },
      { w: 'hands', ipa: '/hændz/',  cn: '双手', emoji: '👐', tip: 'Clap your hands.',  tipCn: '拍拍手。' },
      { w: 'feet',  ipa: '/fiːt/',   cn: '双脚', emoji: '🦶', tip: 'Stamp your feet.',  tipCn: '跺跺脚。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '👃', lines: [
        { who: 'Penny', en: 'This is my nose.', cn: '这是我的鼻子。' },
        { who: 'Penny', en: 'These are my eyes.', cn: '这是我的眼睛。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '👐', lines: [
        { who: 'Tommy', en: 'Clap your hands!', cn: '拍拍手！' },
        { who: 'Penny', en: 'Stamp your feet!', cn: '跺跺脚！' }
      ]},
      { bg: 'home', cast: ['penny', 'mummy'], prop: '👄', lines: [
        { who: 'Mummy', en: 'Open your mouth.', cn: '张开嘴。' },
        { who: 'Penny', en: 'Ahhh!', cn: '啊——！' }
      ]}
    ]
  },
  {
    day: 7,
    theme: 'Getting Dressed',
    themeCn: '穿衣服',
    color: '#8ec8ff',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my hat.' },
    words: [
      { w: 'hat',    ipa: '/hæt/',    cn: '帽子', emoji: '🧢', tip: 'This is my hat.',    tipCn: '这是我的帽子。' },
      { w: 'shoes',  ipa: '/ʃuːz/',   cn: '鞋子', emoji: '👟', tip: 'These are my shoes.', tipCn: '这是我的鞋子。' },
      { w: 'socks',  ipa: '/sɒks/',   cn: '袜子', emoji: '🧦', tip: 'I have red socks.',  tipCn: '我有红袜子。' },
      { w: 'dress',  ipa: '/dres/',   cn: '连衣裙', emoji: '👗', tip: 'I like my dress.',  tipCn: '我喜欢我的裙子。' },
      { w: 'pretty', ipa: '/ˈprɪti/', cn: '漂亮', emoji: '🌸', tip: 'I am pretty.',       tipCn: '我很漂亮。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🧢', lines: [
        { who: 'Penny', en: 'This is my hat.', cn: '这是我的帽子。' },
        { who: 'Penny', en: 'These are my shoes.', cn: '这是我的鞋子。' }
      ]},
      { bg: 'home', cast: ['penny', 'mummy'], prop: '🧦', lines: [
        { who: 'Mummy', en: 'Where are your socks?', cn: '你的袜子在哪里？' },
        { who: 'Penny', en: 'Look! Red socks.', cn: '看！红袜子。' }
      ]},
      { bg: 'home', cast: ['penny', 'daddy'], prop: '👗', lines: [
        { who: 'Daddy', en: 'You look pretty!', cn: '你看起来真漂亮！' },
        { who: 'Penny', en: 'I like my dress.', cn: '我喜欢我的裙子。' }
      ]}
    ]
  },
  {
    day: 8,
    theme: 'Bedtime',
    themeCn: '睡觉时间',
    color: '#6b5590',
    pattern: { en: 'I have ___.', cn: '我有……', demo: 'I have a bed.' },
    words: [
      { w: 'bed',   ipa: '/bed/',   cn: '床',   emoji: '🛏️', tip: 'I have a bed.',   tipCn: '我有一张床。' },
      { w: 'sleep', ipa: '/sliːp/', cn: '睡觉', emoji: '😴', tip: 'I sleep now.',    tipCn: '我现在睡觉。' },
      { w: 'teddy', ipa: '/ˈtedi/', cn: '小熊', emoji: '🧸', tip: 'I have a teddy.', tipCn: '我有一只小熊。' },
      { w: 'moon',  ipa: '/muːn/',  cn: '月亮', emoji: '🌙', tip: 'The moon is up.', tipCn: '月亮升起来了。' },
      { w: 'goodnight', ipa: '/ˌɡʊdˈnaɪt/', cn: '晚安', emoji: '🌜', tip: 'Goodnight, Mummy.', tipCn: '晚安，妈妈。' }
    ],
    scenes: [
      { bg: 'night', cast: ['penny'], prop: '🌙', lines: [
        { who: 'Penny', en: 'The moon is up.', cn: '月亮升起来了。' },
        { who: 'Penny', en: 'I have a teddy.', cn: '我有一只小熊。' }
      ]},
      { bg: 'night', cast: ['penny', 'mummy'], prop: '🛏️', lines: [
        { who: 'Mummy', en: 'Time for bed.', cn: '该睡觉了。' },
        { who: 'Penny', en: 'I sleep now.', cn: '我现在睡觉。' }
      ]},
      { bg: 'night', cast: ['penny', 'mummy'], prop: '🌜', lines: [
        { who: 'Penny', en: 'Goodnight, Mummy.', cn: '晚安，妈妈。' },
        { who: 'Mummy', en: 'Goodnight, Penny.', cn: '晚安，佩妮。' }
      ]}
    ]
  },
  {
    day: 9,
    theme: 'I Am Hungry',
    themeCn: '我饿了',
    color: '#ffb3d1',
    pattern: { en: 'I want ___.', cn: '我要……', demo: 'I want water.' },
    words: [
      { w: 'water', ipa: '/ˈwɔːtə/', cn: '水', emoji: '💧', tip: 'I want water.', tipCn: '我要水。' },
      { w: 'bread', ipa: '/bred/',   cn: '面包', emoji: '🍞', tip: 'I want bread.', tipCn: '我要面包。' },
      { w: 'banana', ipa: '/bəˈnɑːnə/', cn: '香蕉', emoji: '🍌', tip: 'I want a banana.', tipCn: '我要一根香蕉。' },
      { w: 'hungry', ipa: '/ˈhʌŋɡri/', cn: '饿', emoji: '🍽️', tip: 'I am hungry.', tipCn: '我饿了。' },
      { w: 'thanks', ipa: '/θæŋks/', cn: '谢谢', emoji: '🙏', tip: 'Thanks, Mummy!', tipCn: '谢谢妈妈！' }
    ],
    scenes: [
      { bg: 'kitchen', cast: ['penny'], prop: '🍽️', lines: [
        { who: 'Penny', en: 'I am hungry.', cn: '我饿了。' },
        { who: 'Penny', en: 'I want bread.', cn: '我要面包。' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍌', lines: [
        { who: 'Mummy', en: 'A banana?', cn: '要香蕉吗？' },
        { who: 'Penny', en: 'Yes! I want a banana.', cn: '要！我要一根香蕉。' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '💧', lines: [
        { who: 'Tommy', en: 'Water, please.', cn: '请给我水。' },
        { who: 'Penny', en: 'Thanks, Mummy!', cn: '谢谢妈妈！' }
      ]}
    ]
  },
  {
    day: 10,
    theme: 'Birthday Party',
    themeCn: '生日派对',
    color: '#ff9ec4',
    pattern: { en: 'I have ___.', cn: '我有……', demo: 'I have a cake.' },
    words: [
      { w: 'birthday', ipa: '/ˈbɜːθdeɪ/', cn: '生日', emoji: '🎂', tip: 'It is my birthday.', tipCn: '这是我的生日。' },
      { w: 'party',    ipa: '/ˈpɑːti/',   cn: '派对', emoji: '🎉', tip: 'We have a party.', tipCn: '我们开派对。' },
      { w: 'balloon',  ipa: '/bəˈluːn/',  cn: '气球', emoji: '🎈', tip: 'I have a balloon.', tipCn: '我有一个气球。' },
      { w: 'candle',   ipa: '/ˈkændl/',   cn: '蜡烛', emoji: '🕯️', tip: 'Blow the candle.', tipCn: '吹蜡烛。' },
      { w: 'sing',     ipa: '/sɪŋ/',      cn: '唱歌', emoji: '🎤', tip: 'Let us sing!', tipCn: '我们来唱歌！' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny', 'tommy'], prop: '🎂', lines: [
        { who: 'Penny', en: 'It is my birthday.', cn: '这是我的生日。' },
        { who: 'Tommy', en: 'We have a party!', cn: '我们开派对！' }
      ]},
      { bg: 'home', cast: ['penny', 'mummy', 'daddy'], prop: '🎈', lines: [
        { who: 'Mummy', en: 'A balloon for you.', cn: '给你一个气球。' },
        { who: 'Penny', en: 'I have a balloon!', cn: '我有一个气球！' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy', 'mummy'], prop: '🕯️', lines: [
        { who: 'All', en: 'Let us sing!', cn: '我们来唱歌！' },
        { who: 'Penny', en: 'Blow the candle!', cn: '吹蜡烛！' }
      ]}
    ]
  },
  {
    day: 11,
    theme: 'In the Snow',
    themeCn: '下雪啦',
    color: '#dbe9f6',
    pattern: { en: 'It is ___.', cn: '天气……', demo: 'It is cold.' },
    words: [
      { w: 'snow',   ipa: '/snəʊ/',   cn: '雪',   emoji: '❄️', tip: 'I like snow.',     tipCn: '我喜欢雪。' },
      { w: 'cold',   ipa: '/kəʊld/',  cn: '冷',   emoji: '🥶', tip: 'It is cold.',      tipCn: '很冷。' },
      { w: 'warm',   ipa: '/wɔːm/',   cn: '暖',   emoji: '🧣', tip: 'My hat is warm.', tipCn: '我的帽子很暖。' },
      { w: 'throw',  ipa: '/θrəʊ/',   cn: '扔',   emoji: '⚪', tip: 'Throw the snow!', tipCn: '扔雪球！' },
      { w: 'laugh',  ipa: '/lɑːf/',   cn: '笑',   emoji: '😆', tip: 'We laugh.',       tipCn: '我们笑。' }
    ],
    scenes: [
      { bg: 'snow', cast: ['penny'], prop: '❄️', lines: [
        { who: 'Penny', en: 'I like snow!', cn: '我喜欢雪！' },
        { who: 'Penny', en: 'It is cold.', cn: '很冷。' }
      ]},
      { bg: 'snow', cast: ['penny', 'tommy'], prop: '⚪', lines: [
        { who: 'Tommy', en: 'Throw the snow!', cn: '扔雪球！' },
        { who: 'Penny', en: 'My hat is warm.', cn: '我的帽子很暖。' }
      ]},
      { bg: 'snow', cast: ['penny', 'tommy', 'mummy'], prop: '😆', lines: [
        { who: 'All', en: 'Ha ha ha!', cn: '哈哈哈！' },
        { who: 'Penny', en: 'We laugh and laugh.', cn: '我们笑个不停。' }
      ]}
    ]
  },
  {
    day: 12,
    theme: 'At the Park',
    themeCn: '去公园',
    color: '#7fdca6',
    pattern: { en: 'I can ___.', cn: '我会……', demo: 'I can slide.' },
    words: [
      { w: 'park',  ipa: '/pɑːk/',   cn: '公园', emoji: '🌳', tip: 'Let us go to the park.', tipCn: '我们去公园吧。' },
      { w: 'slide', ipa: '/slaɪd/',  cn: '滑梯', emoji: '🛝', tip: 'I can slide.',   tipCn: '我会滑滑梯。' },
      { w: 'swing', ipa: '/swɪŋ/',   cn: '秋千', emoji: '🎠', tip: 'I can swing.',   tipCn: '我会荡秋千。' },
      { w: 'high',  ipa: '/haɪ/',    cn: '高',   emoji: '⬆️', tip: 'Swing up high.', tipCn: '荡得高高的。' },
      { w: 'tired', ipa: '/ˈtaɪəd/', cn: '累了', emoji: '😪', tip: 'I am tired.',    tipCn: '我累了。' }
    ],
    scenes: [
      { bg: 'park', cast: ['penny', 'daddy'], prop: '🌳', lines: [
        { who: 'Penny', en: 'Let us go to the park.', cn: '我们去公园吧。' },
        { who: 'Penny', en: 'I can slide!', cn: '我会滑滑梯！' }
      ]},
      { bg: 'park', cast: ['penny', 'tommy'], prop: '🎠', lines: [
        { who: 'Tommy', en: 'I can swing.', cn: '我会荡秋千。' },
        { who: 'Penny', en: 'Swing up high!', cn: '荡得高高的！' }
      ]},
      { bg: 'park', cast: ['penny', 'mummy'], prop: '😪', lines: [
        { who: 'Penny', en: 'I am tired.', cn: '我累了。' },
        { who: 'Mummy', en: 'Let us sit down.', cn: '我们坐下吧。' }
      ]}
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTENT_KG: CONTENT_KG };
}
