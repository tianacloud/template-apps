/* ============================================================
 * 佩妮英语 · 内容数据
 * 教材对照：人教版（一年级起点·新起点）小学英语 一年级上册～二年级下册
 * 排序：按教材单元顺序，每个单元 = 1 天 = 6 个单词
 *   一年级上册  Unit 1-6  → Day 1-6
 *   一年级下册  Unit 1-6  → Day 7-12
 *   二年级上册  Unit 1-6  → Day 13-18
 *   二年级下册  Unit 1-6  → Day 19-24
 *
 * 【怎么改内容】
 * 1. 改单词：直接改 words 里的一行。每天几个单词由数组长度决定（加一行就多一个词）。
 * 2. 字段：w 单词 / ipa 音标 / cn 中文 / emoji 配图 / tip 例句（拼句子就用这句） / tipCn 例句中文
 * 3. 可选：sent 覆盖拼句子用的整句（不写就用 tip）
 * 4. 加一天：复制一个 { day: ..., ... } 整块，改 day 编号（要连着编号）即可，天数会自动出现在首页。
 * 5. 改动画：scenes 里每一幕是一屏，bg 可选 garden / home / kitchen / pond / rain / snow / night；
 *    cast 里可写 penny / tommy / mummy / daddy / duck / cat / dog / rabbit / bird；prop 是场景上的小道具 emoji。
 * 6. 修改内容后重新构建；已学进度按「第几天 + 第几个词」记录，
 *    如果只是换词、不改顺序，孩子已有的星星不会丢。
 * ============================================================ */

const CONTENT = [
  {
    day: 1,
    theme: 'Unit 1 School',
    themeCn: '一上 U1 学校',
    color: '#ff9ec4',
    pattern: { en: 'I have a ___.', cn: '我有……', demo: 'I have a book.' },
    words: [
      { w: 'book',      ipa: '/bʊk/',         cn: '书',   emoji: '📖', tip: 'I have a book.',       tipCn: '我有一本书。' },
      { w: 'ruler',     ipa: '/ˈruːlə(r)/',   cn: '尺子', emoji: '📏', tip: 'I have a ruler.',      tipCn: '我有一把尺子。' },
      { w: 'pencil',    ipa: '/ˈpensl/',      cn: '铅笔', emoji: '✏️', tip: 'I have a pencil.',     tipCn: '我有一支铅笔。' },
      { w: 'eraser',    ipa: '/ɪˈreɪzə(r)/',  cn: '橡皮', emoji: '🧽', tip: 'I have an eraser.',    tipCn: '我有一块橡皮。' },
      { w: 'schoolbag', ipa: '/ˈskuːlbæɡ/',   cn: '书包', emoji: '🎒', tip: 'I have a schoolbag.',  tipCn: '我有一个书包。' },
      { w: 'school',    ipa: '/skuːl/',       cn: '学校', emoji: '🏫', tip: 'This is my school.',   tipCn: '这是我的学校。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🎒', lines: [
        { who: 'Penny', en: 'Hello! Look at my schoolbag.', cn: '你好！看我的书包。' },
        { who: 'Penny', en: 'I have a book and a ruler.', cn: '我有一本书和一把尺子。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '✏️', lines: [
        { who: 'Tommy', en: 'I have a pencil.', cn: '我有一支铅笔。' },
        { who: 'Penny', en: 'I have an eraser, too.', cn: '我也有一块橡皮。' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🏫', lines: [
        { who: 'All', en: 'Let us go to school!', cn: '我们去上学吧！' },
        { who: 'Penny', en: 'Goodbye, Mummy!', cn: '再见，妈妈！' }
      ]}
    ]
  },
  {
    day: 2,
    theme: 'Unit 2 Face',
    themeCn: '一上 U2 我的脸',
    color: '#8ec8ff',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my face.' },
    words: [
      { w: 'face',  ipa: '/feɪs/',   cn: '脸',   emoji: '😊', tip: 'This is my face.',   tipCn: '这是我的脸。' },
      { w: 'eye',   ipa: '/aɪ/',     cn: '眼睛', emoji: '👁️', tip: 'This is my eye.',    tipCn: '这是我的眼睛。' },
      { w: 'ear',   ipa: '/ɪə(r)/',  cn: '耳朵', emoji: '👂', tip: 'This is my ear.',    tipCn: '这是我的耳朵。' },
      { w: 'nose',  ipa: '/nəʊz/',   cn: '鼻子', emoji: '👃', tip: 'This is my nose.',   tipCn: '这是我的鼻子。' },
      { w: 'mouth', ipa: '/maʊθ/',   cn: '嘴',   emoji: '👄', tip: 'This is my mouth.',  tipCn: '这是我的嘴巴。' },
      { w: 'hand',  ipa: '/hænd/',   cn: '手',   emoji: '✋', tip: 'This is my hand.',   tipCn: '这是我的手。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '😊', lines: [
        { who: 'Penny', en: 'Look at my face.', cn: '看我的脸。' },
        { who: 'Penny', en: 'This is my face.', cn: '这是我的脸。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '👂', lines: [
        { who: 'Tommy', en: 'Touch your ear.', cn: '摸摸你的耳朵。' },
        { who: 'Penny', en: 'This is my ear!', cn: '这是我的耳朵！' }
      ]},
      { bg: 'home', cast: ['mummy', 'penny'], prop: '👃', lines: [
        { who: 'Mummy', en: 'Where is your nose?', cn: '你的鼻子在哪里？' },
        { who: 'Penny', en: 'This is my nose, Mummy.', cn: '这是我的鼻子，妈妈。' }
      ]}
    ]
  },
  {
    day: 3,
    theme: 'Unit 3 Animals',
    themeCn: '一上 U3 小动物',
    color: '#ffd166',
    pattern: { en: 'It is a ___.', cn: '它是一只……', demo: 'It is a dog.' },
    words: [
      { w: 'dog',    ipa: '/dɒɡ/',      cn: '狗',   emoji: '🐶', tip: 'It is a dog.',    tipCn: '它是一只狗。' },
      { w: 'cat',    ipa: '/kæt/',      cn: '猫',   emoji: '🐱', tip: 'It is a cat.',    tipCn: '它是一只猫。' },
      { w: 'bird',   ipa: '/bɜːd/',     cn: '鸟',   emoji: '🐦', tip: 'It is a bird.',   tipCn: '它是一只鸟。' },
      { w: 'tiger',  ipa: '/ˈtaɪɡə(r)/',cn: '老虎', emoji: '🐯', tip: 'It is a tiger.',  tipCn: '它是一只老虎。' },
      { w: 'monkey', ipa: '/ˈmʌŋki/',   cn: '猴子', emoji: '🐵', tip: 'It is a monkey.', tipCn: '它是一只猴子。' },
      { w: 'panda',  ipa: '/ˈpændə/',   cn: '熊猫', emoji: '🐼', tip: 'It is a panda.',  tipCn: '它是一只熊猫。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny', 'duck'], prop: '🦆', lines: [
        { who: 'Penny', en: 'Look! A duck.', cn: '看！一只鸭子。' },
        { who: 'Penny', en: 'It is a duck.', cn: '它是一只鸭子。' }
      ]},
      { bg: 'garden', cast: ['tommy', 'cat'], prop: '🐱', lines: [
        { who: 'Tommy', en: 'I see a cat.', cn: '我看见一只猫。' },
        { who: 'Cat', en: 'Meow! Meow!', cn: '喵！喵！' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🐼', lines: [
        { who: 'Penny', en: 'Is it a panda?', cn: '它是熊猫吗？' },
        { who: 'Tommy', en: 'Yes! It is a panda.', cn: '对！它是一只熊猫。' }
      ]}
    ]
  },
  {
    day: 4,
    theme: 'Unit 4 Numbers',
    themeCn: '一上 U4 数字 1-6',
    color: '#9ae6b4',
    pattern: { en: 'I can see ___ ducks.', cn: '我能看见……只鸭子。', demo: 'I can see three ducks.' },
    words: [
      { w: 'one',   ipa: '/wʌn/',  cn: '一', emoji: '1️⃣', tip: 'I can see one duck.',   tipCn: '我能看见一只鸭子。' },
      { w: 'two',   ipa: '/tuː/',  cn: '二', emoji: '2️⃣', tip: 'I can see two ducks.',  tipCn: '我能看见两只鸭子。' },
      { w: 'three', ipa: '/θriː/', cn: '三', emoji: '3️⃣', tip: 'I can see three ducks.',tipCn: '我能看见三只鸭子。' },
      { w: 'four',  ipa: '/fɔː(r)/',cn: '四',emoji: '4️⃣', tip: 'I can see four ducks.', tipCn: '我能看见四只鸭子。' },
      { w: 'five',  ipa: '/faɪv/', cn: '五', emoji: '5️⃣', tip: 'I can see five ducks.', tipCn: '我能看见五只鸭子。' },
      { w: 'six',   ipa: '/sɪks/', cn: '六', emoji: '6️⃣', tip: 'I can see six ducks.',  tipCn: '我能看见六只鸭子。' }
    ],
    scenes: [
      { bg: 'pond', cast: ['penny'], prop: '🦆', lines: [
        { who: 'Penny', en: 'Let us count the ducks!', cn: '我们来数鸭子吧！' },
        { who: 'Penny', en: 'One, two, three.', cn: '一、二、三。' }
      ]},
      { bg: 'pond', cast: ['tommy'], prop: '🦆🦆', lines: [
        { who: 'Tommy', en: 'Four ducks.', cn: '四只鸭子。' },
        { who: 'Tommy', en: 'Five ducks!', cn: '五只鸭子！' }
      ]},
      { bg: 'pond', cast: ['penny', 'tommy'], prop: '🦆🦆🦆', lines: [
        { who: 'Penny', en: 'Six ducks!', cn: '六只鸭子！' },
        { who: 'All', en: 'Six little ducks!', cn: '六只小鸭子！' }
      ]}
    ]
  },
  {
    day: 5,
    theme: 'Unit 5 Colours',
    themeCn: '一上 U5 颜色',
    color: '#c3a6ff',
    pattern: { en: 'It is ___.', cn: '它是……色的', demo: 'It is red.' },
    words: [
      { w: 'black',  ipa: '/blæk/',  cn: '黑色', emoji: '⬛', tip: 'It is black.',  tipCn: '它是黑色的。' },
      { w: 'red',    ipa: '/red/',   cn: '红色', emoji: '🟥', tip: 'It is red.',    tipCn: '它是红色的。' },
      { w: 'yellow', ipa: '/ˈjeləʊ/',cn: '黄色', emoji: '🟨', tip: 'It is yellow.', tipCn: '它是黄色的。' },
      { w: 'blue',   ipa: '/bluː/',  cn: '蓝色', emoji: '🟦', tip: 'It is blue.',   tipCn: '它是蓝色的。' },
      { w: 'green',  ipa: '/ɡriːn/', cn: '绿色', emoji: '🟩', tip: 'It is green.',  tipCn: '它是绿色的。' },
      { w: 'white',  ipa: '/waɪt/',  cn: '白色', emoji: '⬜', tip: 'It is white.',  tipCn: '它是白色的。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny'], prop: '🌈', lines: [
        { who: 'Penny', en: 'Look at the rainbow!', cn: '看那道彩虹！' },
        { who: 'Penny', en: 'Red, yellow, blue.', cn: '红色、黄色、蓝色。' }
      ]},
      { bg: 'garden', cast: ['tommy'], prop: '🟩', lines: [
        { who: 'Tommy', en: 'I like green.', cn: '我喜欢绿色。' },
        { who: 'Tommy', en: 'The grass is green.', cn: '草地是绿色的。' }
      ]},
      { bg: 'garden', cast: ['mummy', 'penny'], prop: '⬜', lines: [
        { who: 'Mummy', en: 'What colour is it?', cn: '它是什么颜色的？' },
        { who: 'Penny', en: 'It is white!', cn: '它是白色的！' }
      ]}
    ]
  },
  {
    day: 6,
    theme: 'Unit 6 Fruit',
    themeCn: '一上 U6 水果',
    color: '#ffab76',
    pattern: { en: 'I like ___.', cn: '我喜欢……', demo: 'I like apples.' },
    words: [
      { w: 'apple',  ipa: '/ˈæpl/',     cn: '苹果', emoji: '🍎', tip: 'I like apples.',  tipCn: '我喜欢苹果。' },
      { w: 'banana', ipa: '/bəˈnɑːnə/', cn: '香蕉', emoji: '🍌', tip: 'I like bananas.', tipCn: '我喜欢香蕉。' },
      { w: 'orange', ipa: '/ˈɒrɪndʒ/',  cn: '橙子', emoji: '🍊', tip: 'I like oranges.', tipCn: '我喜欢橙子。' },
      { w: 'pear',   ipa: '/peə(r)/',   cn: '梨',   emoji: '🍐', tip: 'I like pears.',   tipCn: '我喜欢梨。' },
      { w: 'peach',  ipa: '/piːtʃ/',    cn: '桃',   emoji: '🍑', tip: 'I like peaches.', tipCn: '我喜欢桃子。' },
      { w: 'grape',  ipa: '/ɡreɪp/',    cn: '葡萄', emoji: '🍇', tip: 'I like grapes.',  tipCn: '我喜欢葡萄。' }
    ],
    scenes: [
      { bg: 'kitchen', cast: ['mummy', 'penny'], prop: '🍎', lines: [
        { who: 'Mummy', en: 'Do you like apples?', cn: '你喜欢苹果吗？' },
        { who: 'Penny', en: 'Yes, I do!', cn: '是的，我喜欢！' }
      ]},
      { bg: 'kitchen', cast: ['tommy'], prop: '🍌', lines: [
        { who: 'Tommy', en: 'I like bananas.', cn: '我喜欢香蕉。' },
        { who: 'Tommy', en: 'Yum, yum!', cn: '真好吃！' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍇', lines: [
        { who: 'Penny', en: 'I like grapes.', cn: '我喜欢葡萄。' },
        { who: 'Tommy', en: 'Me too!', cn: '我也是！' }
      ]}
    ]
  },
  {
    day: 7,
    theme: 'Unit 1 Classroom',
    themeCn: '一下 U1 教室',
    color: '#8ec8ff',
    pattern: { en: 'This is a ___.', cn: '这是一……', demo: 'This is a chair.' },
    words: [
      { w: 'chair',      ipa: '/tʃeə(r)/',      cn: '椅子', emoji: '🪑', tip: 'This is a chair.',      tipCn: '这是一把椅子。' },
      { w: 'desk',       ipa: '/desk/',         cn: '书桌', emoji: '🗄️', tip: 'This is my desk.',      tipCn: '这是我的书桌。' },
      { w: 'blackboard', ipa: '/ˈblækbɔːd/',    cn: '黑板', emoji: '🔲', tip: 'Look at the blackboard.',tipCn: '看黑板。' },
      { w: 'on',         ipa: '/ɒn/',           cn: '在……上面', emoji: '⬆️', tip: 'The book is on the desk.',   tipCn: '书在书桌上面。' },
      { w: 'under',      ipa: '/ˈʌndə(r)/',     cn: '在……下面', emoji: '⬇️', tip: 'The ball is under the chair.',tipCn: '球在椅子下面。' },
      { w: 'in',         ipa: '/ɪn/',           cn: '在……里面', emoji: '📥', tip: 'The ruler is in the box.',   tipCn: '尺子在盒子里面。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🪑', lines: [
        { who: 'Penny', en: 'This is my chair.', cn: '这是我的椅子。' },
        { who: 'Penny', en: 'This is my desk.', cn: '这是我的书桌。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '🔲', lines: [
        { who: 'Tommy', en: 'Look at the blackboard.', cn: '看黑板。' },
        { who: 'Tommy', en: 'I can see a book.', cn: '我能看见一本书。' }
      ]},
      { bg: 'home', cast: ['mummy', 'penny'], prop: '📦', lines: [
        { who: 'Mummy', en: 'Where is the ruler?', cn: '尺子在哪里？' },
        { who: 'Penny', en: 'It is in the box.', cn: '它在盒子里面。' }
      ]}
    ]
  },
  {
    day: 8,
    theme: 'Unit 2 Room',
    themeCn: '一下 U2 房间',
    color: '#ffd166',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my bed.' },
    words: [
      { w: 'light',  ipa: '/laɪt/',       cn: '灯',   emoji: '💡', tip: 'Turn on the light.',      tipCn: '把灯打开。' },
      { w: 'bed',    ipa: '/bed/',        cn: '床',   emoji: '🛏️', tip: 'This is my bed.',         tipCn: '这是我的床。' },
      { w: 'door',   ipa: '/dɔː(r)/',     cn: '门',   emoji: '🚪', tip: 'Open the door.',          tipCn: '把门打开。' },
      { w: 'box',    ipa: '/bɒks/',       cn: '盒子', emoji: '📦', tip: 'The toy is in the box.',  tipCn: '玩具在盒子里。' },
      { w: 'near',   ipa: '/nɪə(r)/',     cn: '在……附近', emoji: '🧲', tip: 'The cat is near the bed.', tipCn: '猫在床附近。' },
      { w: 'behind', ipa: '/bɪˈhaɪnd/',   cn: '在……后面', emoji: '🙈', tip: 'The dog is behind the door.', tipCn: '狗在门后面。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '💡', lines: [
        { who: 'Penny', en: 'Turn on the light.', cn: '把灯打开。' },
        { who: 'Penny', en: 'The room is bright.', cn: '房间亮起来了。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '🛏️', lines: [
        { who: 'Tommy', en: 'This is my bed.', cn: '这是我的床。' },
        { who: 'Tommy', en: 'I like my bed.', cn: '我喜欢我的床。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '🚪', lines: [
        { who: 'Penny', en: 'Where is the cat?', cn: '猫在哪里？' },
        { who: 'Tommy', en: 'It is behind the door.', cn: '它在门后面。' }
      ]}
    ]
  },
  {
    day: 9,
    theme: 'Unit 3 Toys',
    themeCn: '一下 U3 玩具',
    color: '#9ae6b4',
    pattern: { en: 'I have a ___.', cn: '我有一个……', demo: 'I have a ball.' },
    words: [
      { w: 'plane', ipa: '/pleɪn/', cn: '飞机', emoji: '✈️', tip: 'I have a plane.', tipCn: '我有一架飞机。' },
      { w: 'ball',  ipa: '/bɔːl/',  cn: '球',   emoji: '⚽', tip: 'I have a ball.',  tipCn: '我有一个球。' },
      { w: 'doll',  ipa: '/dɒl/',   cn: '玩偶', emoji: '🪆', tip: 'I have a doll.',  tipCn: '我有一个玩偶。' },
      { w: 'train', ipa: '/treɪn/', cn: '火车', emoji: '🚂', tip: 'I have a train.', tipCn: '我有一列火车。' },
      { w: 'car',   ipa: '/kɑː(r)/',cn: '小汽车', emoji: '🚗', tip: 'I have a car.',   tipCn: '我有一辆小汽车。' },
      { w: 'bear',  ipa: '/beə(r)/',cn: '玩具熊', emoji: '🧸', tip: 'I have a bear.',  tipCn: '我有一只玩具熊。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🧸', lines: [
        { who: 'Penny', en: 'I have a bear.', cn: '我有一只玩具熊。' },
        { who: 'Penny', en: 'I have a doll, too.', cn: '我还有一个玩偶。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '✈️', lines: [
        { who: 'Tommy', en: 'Can I have a plane?', cn: '我可以要一架飞机吗？' },
        { who: 'Penny', en: 'Sure! Here you are.', cn: '当然！给你。' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '🚂', lines: [
        { who: 'Penny', en: 'Look at my train!', cn: '看我的火车！' },
        { who: 'Tommy', en: 'I have a car and a ball.', cn: '我有一辆小汽车和一个球。' }
      ]}
    ]
  },
  {
    day: 10,
    theme: 'Unit 4 Food',
    themeCn: '一下 U4 食物',
    color: '#ffab76',
    pattern: { en: 'I want ___.', cn: '我想要……', demo: 'I want rice.' },
    words: [
      { w: 'rice',      ipa: '/raɪs/',          cn: '米饭', emoji: '🍚', tip: 'I want rice.',        tipCn: '我想要米饭。' },
      { w: 'noodles',   ipa: '/ˈnuːdlz/',       cn: '面条', emoji: '🍜', tip: 'I want noodles.',     tipCn: '我想要面条。' },
      { w: 'vegetable', ipa: '/ˈvedʒtəbl/',     cn: '蔬菜', emoji: '🥦', tip: 'I want vegetables.',  tipCn: '我想要蔬菜。' },
      { w: 'fish',      ipa: '/fɪʃ/',           cn: '鱼',   emoji: '🐟', tip: 'I want fish.',        tipCn: '我想要鱼。' },
      { w: 'chicken',   ipa: '/ˈtʃɪkɪn/',       cn: '鸡肉', emoji: '🍗', tip: 'I want chicken.',     tipCn: '我想要鸡肉。' },
      { w: 'egg',       ipa: '/eɡ/',            cn: '鸡蛋', emoji: '🥚', tip: 'I want an egg.',      tipCn: '我想要一个鸡蛋。' }
    ],
    scenes: [
      { bg: 'kitchen', cast: ['penny'], prop: '🍚', lines: [
        { who: 'Penny', en: 'I am hungry.', cn: '我饿了。' },
        { who: 'Penny', en: 'I want rice.', cn: '我想要米饭。' }
      ]},
      { bg: 'kitchen', cast: ['tommy'], prop: '🍜', lines: [
        { who: 'Tommy', en: 'I want noodles.', cn: '我想要面条。' },
        { who: 'Tommy', en: 'And an egg, please.', cn: '还要一个鸡蛋，谢谢。' }
      ]},
      { bg: 'kitchen', cast: ['mummy', 'penny'], prop: '🍗', lines: [
        { who: 'Mummy', en: 'Here is your chicken.', cn: '你的鸡肉来了。' },
        { who: 'Penny', en: 'Thank you, Mummy!', cn: '谢谢你，妈妈！' }
      ]}
    ]
  },
  {
    day: 11,
    theme: 'Unit 5 Drink',
    themeCn: '一下 U5 喝的',
    color: '#a5c8ff',
    pattern: { en: 'I want some ___.', cn: '我想要一些……', demo: 'I want some milk.' },
    words: [
      { w: 'juice',   ipa: '/dʒuːs/',     cn: '果汁', emoji: '🧃', tip: 'I want some juice.', tipCn: '我想要一些果汁。' },
      { w: 'tea',     ipa: '/tiː/',       cn: '茶',   emoji: '🍵', tip: 'I want some tea.',   tipCn: '我想要一些茶。' },
      { w: 'milk',    ipa: '/mɪlk/',      cn: '牛奶', emoji: '🥛', tip: 'I want some milk.',  tipCn: '我想要一些牛奶。' },
      { w: 'water',   ipa: '/ˈwɔːtə(r)/', cn: '水',   emoji: '💧', tip: 'I want some water.', tipCn: '我想要一些水。' },
      { w: 'thirsty', ipa: '/ˈθɜːsti/',   cn: '口渴的', emoji: '🥵', tip: 'I am thirsty.',    tipCn: '我口渴了。' },
      { w: 'thanks',  ipa: '/θæŋks/',     cn: '谢谢', emoji: '🙏', tip: 'Thanks, Mummy.',     tipCn: '谢谢妈妈。' }
    ],
    scenes: [
      { bg: 'kitchen', cast: ['tommy'], prop: '🥛', lines: [
        { who: 'Tommy', en: 'I am thirsty.', cn: '我口渴了。' },
        { who: 'Tommy', en: 'I want some milk.', cn: '我想要一些牛奶。' }
      ]},
      { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🧃', lines: [
        { who: 'Penny', en: 'Juice, please.', cn: '请给我果汁。' },
        { who: 'Tommy', en: 'Here you are.', cn: '给你。' }
      ]},
      { bg: 'kitchen', cast: ['mummy', 'tommy'], prop: '🍵', lines: [
        { who: 'Mummy', en: 'Some tea?', cn: '要茶吗？' },
        { who: 'Tommy', en: 'No, thanks. Water, please.', cn: '不用，谢谢。请给我水。' }
      ]}
    ]
  },
  {
    day: 12,
    theme: 'Unit 6 Clothes',
    themeCn: '一下 U6 衣服',
    color: '#c3a6ff',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my shirt.' },
    words: [
      { w: 'shirt',   ipa: '/ʃɜːt/',      cn: '衬衫',   emoji: '👔', tip: 'This is my shirt.',      tipCn: '这是我的衬衫。' },
      { w: 'T-shirt', ipa: '/ˈtiːʃɜːt/',  cn: 'T恤衫',  emoji: '👕', tip: 'I like my T-shirt.',     tipCn: '我喜欢我的T恤衫。' },
      { w: 'skirt',   ipa: '/skɜːt/',     cn: '短裙',   emoji: '👚', tip: 'This is my skirt.',      tipCn: '这是我的短裙。' },
      { w: 'dress',   ipa: '/dres/',      cn: '连衣裙', emoji: '👗', tip: 'I like your dress.',     tipCn: '我喜欢你的连衣裙。' },
      { w: 'socks',   ipa: '/sɒks/',      cn: '短袜',   emoji: '🧦', tip: 'These are my socks.',    tipCn: '这些是我的短袜。' },
      { w: 'shorts',  ipa: '/ʃɔːts/',     cn: '短裤',   emoji: '🩳', tip: 'These are my shorts.',   tipCn: '这些是我的短裤。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '👗', lines: [
        { who: 'Penny', en: 'This is my dress.', cn: '这是我的连衣裙。' },
        { who: 'Penny', en: 'I like it very much.', cn: '我很喜欢它。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '👕', lines: [
        { who: 'Tommy', en: 'This is my T-shirt.', cn: '这是我的T恤衫。' },
        { who: 'Tommy', en: 'It is new.', cn: '它是新的。' }
      ]},
      { bg: 'home', cast: ['mummy', 'penny'], prop: '🧦', lines: [
        { who: 'Mummy', en: 'These are your socks.', cn: '这些是你的短袜。' },
        { who: 'Penny', en: 'And these are my shorts.', cn: '这些是我的短裤。' }
      ]}
    ]
  },
  {
    day: 13,
    theme: 'Unit 1 My Family',
    themeCn: '二上 U1 我的家人',
    color: '#ff9ec4',
    pattern: { en: 'This is my ___.', cn: '这是我的……', demo: 'This is my father.' },
    words: [
      { w: 'father',      ipa: '/ˈfɑːðə(r)/', cn: '父亲', emoji: '👨', tip: 'This is my father.',      tipCn: '这是我的爸爸。' },
      { w: 'mother',      ipa: '/ˈmʌðə(r)/',  cn: '母亲', emoji: '👩', tip: 'This is my mother.',      tipCn: '这是我的妈妈。' },
      { w: 'brother',     ipa: '/ˈbrʌðə(r)/', cn: '兄弟', emoji: '👦', tip: 'This is my brother.',     tipCn: '这是我的兄弟。' },
      { w: 'sister',      ipa: '/ˈsɪstə(r)/', cn: '姐妹', emoji: '👧', tip: 'This is my sister.',      tipCn: '这是我的姐妹。' },
      { w: 'grandfather', ipa: '/ˈɡrænfɑːðə(r)/', cn: '爷爷；外公', emoji: '👴', tip: 'This is my grandfather.', tipCn: '这是我的爷爷。' },
      { w: 'grandmother', ipa: '/ˈɡrænmʌðə(r)/',  cn: '奶奶；外婆', emoji: '👵', tip: 'This is my grandmother.', tipCn: '这是我的奶奶。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny', 'daddy'], prop: '👨', lines: [
        { who: 'Penny', en: 'This is my father.', cn: '这是我的爸爸。' },
        { who: 'Daddy', en: 'Hello, Penny!', cn: '你好，佩妮！' }
      ]},
      { bg: 'home', cast: ['penny', 'tommy'], prop: '👦', lines: [
        { who: 'Tommy', en: 'This is my brother.', cn: '这是我的兄弟。' },
        { who: 'Penny', en: 'And this is my sister.', cn: '这是我的姐妹。' }
      ]},
      { bg: 'home', cast: ['penny', 'mummy'], prop: '👵', lines: [
        { who: 'Penny', en: 'My grandmother is here.', cn: '我的奶奶来了。' },
        { who: 'Mummy', en: 'She is very happy.', cn: '她很高兴。' }
      ]}
    ]
  },
  {
    day: 14,
    theme: 'Unit 2 Boys and Girls',
    themeCn: '二上 U2 男孩和女孩',
    color: '#8ec8ff',
    pattern: { en: 'He is a ___.', cn: '他是一个……', demo: 'He is a boy.' },
    words: [
      { w: 'boy',       ipa: '/bɔɪ/',            cn: '男孩', emoji: '👦', tip: 'He is a boy.',           tipCn: '他是一个男孩。' },
      { w: 'girl',      ipa: '/ɡɜːl/',           cn: '女孩', emoji: '👧', tip: 'She is a girl.',         tipCn: '她是一个女孩。' },
      { w: 'man',       ipa: '/mæn/',            cn: '男人', emoji: '👨', tip: 'He is a man.',           tipCn: '他是一个男人。' },
      { w: 'woman',     ipa: '/ˈwʊmən/',         cn: '女人', emoji: '👩', tip: 'She is a woman.',        tipCn: '她是一个女人。' },
      { w: 'friend',    ipa: '/frend/',          cn: '朋友', emoji: '🧑‍🤝‍🧑', tip: 'This is my friend.',     tipCn: '这是我的朋友。' },
      { w: 'classmate', ipa: '/ˈklɑːsmeɪt/',     cn: '同班同学', emoji: '👥', tip: 'This is my classmate.',  tipCn: '这是我的同班同学。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '👦', lines: [
        { who: 'Penny', en: 'He is a boy.', cn: '他是一个男孩。' },
        { who: 'Tommy', en: 'She is a girl.', cn: '她是一个女孩。' }
      ]},
      { bg: 'garden', cast: ['penny', 'mummy'], prop: '👩', lines: [
        { who: 'Penny', en: 'This is my friend.', cn: '这是我的朋友。' },
        { who: 'Mummy', en: 'She is a nice girl.', cn: '她是个好女孩。' }
      ]},
      { bg: 'garden', cast: ['tommy', 'daddy'], prop: '👨', lines: [
        { who: 'Tommy', en: 'That is a man.', cn: '那是一个男人。' },
        { who: 'Daddy', en: 'He is my friend, too.', cn: '他也是我的朋友。' }
      ]}
    ]
  },
  {
    day: 15,
    theme: 'Unit 3 My Friends',
    themeCn: '二上 U3 我的朋友',
    color: '#ffd166',
    pattern: { en: 'He is ___.', cn: '他很……', demo: 'He is tall.' },
    words: [
      { w: 'tall',   ipa: '/tɔːl/',    cn: '高的',   emoji: '⬆️', tip: 'He is tall.',      tipCn: '他很高。' },
      { w: 'short',  ipa: '/ʃɔːt/',    cn: '矮的',   emoji: '⬇️', tip: 'She is short.',    tipCn: '她很矮。' },
      { w: 'thin',   ipa: '/θɪn/',     cn: '瘦的',   emoji: '🥢', tip: 'He is thin.',      tipCn: '他很瘦。' },
      { w: 'big',    ipa: '/bɪɡ/',     cn: '大的',   emoji: '🐘', tip: 'It is big.',       tipCn: '它很大。' },
      { w: 'pretty', ipa: '/ˈprɪti/',  cn: '漂亮的', emoji: '🌸', tip: 'She is pretty.',   tipCn: '她很漂亮。' },
      { w: 'small',  ipa: '/smɔːl/',   cn: '小的',   emoji: '🐜', tip: 'It is small.',     tipCn: '它很小。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '⬆️', lines: [
        { who: 'Tommy', en: 'You are tall.', cn: '你很高。' },
        { who: 'Penny', en: 'You are short.', cn: '你很矮。' }
      ]},
      { bg: 'garden', cast: ['penny', 'mummy'], prop: '🌸', lines: [
        { who: 'Penny', en: 'My friend is pretty.', cn: '我的朋友很漂亮。' },
        { who: 'Mummy', en: 'And she is thin.', cn: '而且她很瘦。' }
      ]},
      { bg: 'garden', cast: ['tommy', 'penny'], prop: '🐘', lines: [
        { who: 'Tommy', en: 'Look! A big elephant.', cn: '看！一只大象。' },
        { who: 'Penny', en: 'The ant is small.', cn: '蚂蚁很小。' }
      ]}
    ]
  },
  {
    day: 16,
    theme: 'Unit 4 In the Community',
    themeCn: '二上 U4 社区里',
    color: '#9ae6b4',
    pattern: { en: 'Let us go to the ___.', cn: '我们去……吧。', demo: 'Let us go to the park.' },
    words: [
      { w: 'park',       ipa: '/pɑːk/',        cn: '公园', emoji: '🌳', tip: 'Let us go to the park.',        tipCn: '我们去公园吧。' },
      { w: 'hospital',   ipa: '/ˈhɒspɪtl/',    cn: '医院', emoji: '🏥', tip: 'Let us go to the hospital.',    tipCn: '我们去医院吧。' },
      { w: 'zoo',        ipa: '/zuː/',         cn: '动物园', emoji: '🦁', tip: 'Let us go to the zoo.',       tipCn: '我们去动物园吧。' },
      { w: 'supermarket',ipa: '/ˈsuːpəmɑːkɪt/',cn: '超市', emoji: '🛒', tip: 'Let us go to the supermarket.', tipCn: '我们去超市吧。' },
      { w: 'bookstore',  ipa: '/ˈbʊkstɔː(r)/', cn: '书店', emoji: '📚', tip: 'Let us go to the bookstore.',   tipCn: '我们去书店吧。' },
      { w: 'cinema',     ipa: '/ˈsɪnəmə/',     cn: '电影院', emoji: '🎬', tip: 'Let us go to the cinema.',    tipCn: '我们去电影院吧。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['mummy', 'penny'], prop: '🛒', lines: [
        { who: 'Mummy', en: 'Let us go to the supermarket.', cn: '我们去超市吧。' },
        { who: 'Penny', en: 'And then the park!', cn: '然后去公园！' }
      ]},
      { bg: 'garden', cast: ['tommy', 'daddy'], prop: '🏥', lines: [
        { who: 'Tommy', en: 'My father is a doctor.', cn: '我爸爸是医生。' },
        { who: 'Daddy', en: 'I work in the hospital.', cn: '我在医院工作。' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🦁', lines: [
        { who: 'Penny', en: 'Let us go to the zoo!', cn: '我们去动物园吧！' },
        { who: 'Tommy', en: 'And the bookstore!', cn: '还有书店！' }
      ]}
    ]
  },
  {
    day: 17,
    theme: 'Unit 5 In the Park',
    themeCn: '二上 U5 公园里',
    color: '#ffab76',
    pattern: { en: 'I can see a ___.', cn: '我能看见……', demo: 'I can see a tree.' },
    words: [
      { w: 'hill',   ipa: '/hɪl/',       cn: '小山', emoji: '⛰️', tip: 'I can see a hill.',   tipCn: '我能看见一座小山。' },
      { w: 'lake',   ipa: '/leɪk/',      cn: '湖',   emoji: '🏞️', tip: 'I can see a lake.',   tipCn: '我能看见一个湖。' },
      { w: 'tree',   ipa: '/triː/',      cn: '树',   emoji: '🌳', tip: 'I can see a tree.',   tipCn: '我能看见一棵树。' },
      { w: 'grass',  ipa: '/ɡrɑːs/',     cn: '草',   emoji: '🌱', tip: 'I can see the grass.',tipCn: '我能看见草地。' },
      { w: 'flower', ipa: '/ˈflaʊə(r)/', cn: '花',   emoji: '🌷', tip: 'I can see a flower.', tipCn: '我能看见一朵花。' },
      { w: 'bee',    ipa: '/biː/',       cn: '蜜蜂', emoji: '🐝', tip: 'I can see a bee.',    tipCn: '我能看见一只蜜蜂。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny'], prop: '🌳', lines: [
        { who: 'Penny', en: 'Look at the big tree.', cn: '看那棵大树。' },
        { who: 'Penny', en: 'I can see a hill.', cn: '我能看见一座小山。' }
      ]},
      { bg: 'garden', cast: ['tommy'], prop: '🌷', lines: [
        { who: 'Tommy', en: 'I see a flower.', cn: '我看见一朵花。' },
        { who: 'Tommy', en: 'A bee is on it.', cn: '一只蜜蜂在花上。' }
      ]},
      { bg: 'pond', cast: ['penny', 'tommy'], prop: '🏞️', lines: [
        { who: 'Penny', en: 'Look at the lake!', cn: '看那个湖！' },
        { who: 'Tommy', en: 'And the green grass!', cn: '还有绿绿的草地！' }
      ]}
    ]
  },
  {
    day: 18,
    theme: 'Unit 6 Happy Holidays',
    themeCn: '二上 U6 快乐节日',
    color: '#a5c8ff',
    pattern: { en: 'This is a ___.', cn: '这是一……', demo: 'This is a gift.' },
    words: [
      { w: 'Christmas', ipa: '/ˈkrɪsməs/', cn: '圣诞节', emoji: '🎄', tip: 'Merry Christmas!',      tipCn: '圣诞快乐！' },
      { w: 'gift',      ipa: '/ɡɪft/',     cn: '礼物',   emoji: '🎁', tip: 'This is a gift.',       tipCn: '这是一份礼物。' },
      { w: 'card',      ipa: '/kɑːd/',     cn: '卡片',   emoji: '💌', tip: 'This is a card.',       tipCn: '这是一张卡片。' },
      { w: 'bell',      ipa: '/bel/',      cn: '铃铛',   emoji: '🔔', tip: 'I can hear a bell.',    tipCn: '我能听见铃铛声。' },
      { w: 'star',      ipa: '/stɑː(r)/',  cn: '星星',   emoji: '⭐', tip: 'I can see a star.',     tipCn: '我能看见一颗星星。' },
      { w: 'party',     ipa: '/ˈpɑːti/',   cn: '聚会',   emoji: '🎉', tip: 'Let us have a party!',  tipCn: '我们来开个聚会吧！' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🎄', lines: [
        { who: 'Penny', en: 'Merry Christmas!', cn: '圣诞快乐！' },
        { who: 'Penny', en: 'Look at the tree.', cn: '看这棵树。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '🎁', lines: [
        { who: 'Tommy', en: 'This is a gift.', cn: '这是一份礼物。' },
        { who: 'Tommy', en: 'And this is a card.', cn: '这是一张卡片。' }
      ]},
      { bg: 'home', cast: ['mummy', 'penny'], prop: '🔔', lines: [
        { who: 'Mummy', en: 'I can hear a bell.', cn: '我能听见铃铛声。' },
        { who: 'Penny', en: 'Let us have a party!', cn: '我们来开个聚会吧！' }
      ]}
    ]
  },
  {
    day: 19,
    theme: 'Unit 1 Playtime',
    themeCn: '二下 U1 游戏时间',
    color: '#ff9ec4',
    pattern: { en: 'I can ___.', cn: '我会……', demo: 'I can swim.' },
    words: [
      { w: 'swim',  ipa: '/swɪm/',  cn: '游泳', emoji: '🏊', tip: 'I can swim.',  tipCn: '我会游泳。' },
      { w: 'run',   ipa: '/rʌn/',   cn: '跑',   emoji: '🏃', tip: 'I can run.',   tipCn: '我会跑。' },
      { w: 'jump',  ipa: '/dʒʌmp/', cn: '跳',   emoji: '🤸', tip: 'I can jump.',  tipCn: '我会跳。' },
      { w: 'dance', ipa: '/dɑːns/', cn: '跳舞', emoji: '💃', tip: 'I can dance.', tipCn: '我会跳舞。' },
      { w: 'sing',  ipa: '/sɪŋ/',   cn: '唱歌', emoji: '🎤', tip: 'I can sing.',  tipCn: '我会唱歌。' },
      { w: 'draw',  ipa: '/drɔː/',  cn: '画画', emoji: '🎨', tip: 'I can draw.',  tipCn: '我会画画。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🏃', lines: [
        { who: 'Penny', en: 'I can run.', cn: '我会跑。' },
        { who: 'Tommy', en: 'I can jump.', cn: '我会跳。' }
      ]},
      { bg: 'pond', cast: ['tommy'], prop: '🏊', lines: [
        { who: 'Tommy', en: 'I can swim.', cn: '我会游泳。' },
        { who: 'Tommy', en: 'Look at me!', cn: '看我！' }
      ]},
      { bg: 'home', cast: ['penny'], prop: '🎤', lines: [
        { who: 'Penny', en: 'Let us sing and dance!', cn: '我们又唱又跳吧！' },
        { who: 'Penny', en: 'I can draw, too.', cn: '我还会画画。' }
      ]}
    ]
  },
  {
    day: 20,
    theme: 'Unit 2 Weather',
    themeCn: '二下 U2 天气',
    color: '#8ec8ff',
    pattern: { en: 'It is ___.', cn: '天气是……', demo: 'It is sunny.' },
    words: [
      { w: 'sunny',    ipa: '/ˈsʌni/',    cn: '晴朗的', emoji: '☀️', tip: 'It is sunny.',          tipCn: '天气晴朗。' },
      { w: 'cloudy',   ipa: '/ˈklaʊdi/',  cn: '多云的', emoji: '☁️', tip: 'It is cloudy.',         tipCn: '天气多云。' },
      { w: 'rainy',    ipa: '/ˈreɪni/',   cn: '下雨的', emoji: '🌧️', tip: 'It is rainy.',          tipCn: '下雨了。' },
      { w: 'windy',    ipa: '/ˈwɪndi/',   cn: '有风的', emoji: '🌬️', tip: 'It is windy.',          tipCn: '刮风了。' },
      { w: 'snowy',    ipa: '/ˈsnəʊi/',   cn: '下雪的', emoji: '❄️', tip: 'It is snowy.',          tipCn: '下雪了。' },
      { w: 'umbrella', ipa: '/ʌmˈbrelə/', cn: '雨伞',   emoji: '☂️', tip: 'Take your umbrella.',   tipCn: '带上你的雨伞。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny'], prop: '☀️', lines: [
        { who: 'Penny', en: 'It is sunny today.', cn: '今天是晴天。' },
        { who: 'Penny', en: 'It is not cloudy.', cn: '天上没有云。' }
      ]},
      { bg: 'rain', cast: ['tommy', 'mummy'], prop: '🌧️', lines: [
        { who: 'Tommy', en: 'It is rainy now.', cn: '现在下雨了。' },
        { who: 'Mummy', en: 'Take your umbrella.', cn: '带上你的雨伞。' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🌬️', lines: [
        { who: 'Penny', en: 'It is windy.', cn: '刮风了。' },
        { who: 'Tommy', en: 'And it is snowy in winter.', cn: '冬天还会下雪。' }
      ]}
    ]
  },
  {
    day: 21,
    theme: 'Unit 3 Seasons',
    themeCn: '二下 U3 季节',
    color: '#ffd166',
    pattern: { en: 'It is ___.', cn: '是……季了', demo: 'It is spring.' },
    words: [
      { w: 'spring', ipa: '/sprɪŋ/', cn: '春天', emoji: '🌸', tip: 'It is spring.', tipCn: '春天到了。' },
      { w: 'summer', ipa: '/ˈsʌmə(r)/', cn: '夏天', emoji: '🌞', tip: 'It is summer.', tipCn: '夏天到了。' },
      { w: 'autumn', ipa: '/ˈɔːtəm/', cn: '秋天', emoji: '🍂', tip: 'It is autumn.', tipCn: '秋天到了。' },
      { w: 'winter', ipa: '/ˈwɪntə(r)/', cn: '冬天', emoji: '⛄', tip: 'It is winter.', tipCn: '冬天到了。' },
      { w: 'hot',    ipa: '/hɒt/', cn: '炎热的', emoji: '🥵', tip: 'It is hot.', tipCn: '天气很热。' },
      { w: 'cold',   ipa: '/kəʊld/', cn: '寒冷的', emoji: '🥶', tip: 'It is cold.', tipCn: '天气很冷。' }
    ],
    scenes: [
      { bg: 'garden', cast: ['penny'], prop: '🌸', lines: [
        { who: 'Penny', en: 'It is spring.', cn: '春天到了。' },
        { who: 'Penny', en: 'It is warm.', cn: '天气暖和。' }
      ]},
      { bg: 'garden', cast: ['tommy'], prop: '🍂', lines: [
        { who: 'Tommy', en: 'It is autumn.', cn: '秋天到了。' },
        { who: 'Tommy', en: 'The leaves are yellow.', cn: '叶子变黄了。' }
      ]},
      { bg: 'snow', cast: ['penny', 'tommy'], prop: '⛄', lines: [
        { who: 'Penny', en: 'It is winter. It is cold.', cn: '冬天到了，很冷。' },
        { who: 'Tommy', en: 'I like summer. It is hot.', cn: '我喜欢夏天，很热。' }
      ]}
    ]
  },
  {
    day: 22,
    theme: 'Unit 4 Time',
    themeCn: '二下 U4 时间',
    color: '#9ae6b4',
    pattern: { en: 'It is ___ o\'clock.', cn: '现在是……点。', demo: 'It is seven o\'clock.' },
    words: [
      { w: 'clock',   ipa: '/klɒk/',    cn: '钟',   emoji: '🕰️', tip: 'Look at the clock.',       tipCn: '看那个钟。' },
      { w: 'time',    ipa: '/taɪm/',    cn: '时间', emoji: '⏰', tip: 'It is time for school.',   tipCn: '到上学的时间了。' },
      { w: 'eleven',  ipa: '/ɪˈlevn/',  cn: '十一', emoji: '🕚', tip: 'It is eleven o\'clock.',   tipCn: '现在十一点。' },
      { w: 'twelve',  ipa: '/twelv/',   cn: '十二', emoji: '🕛', tip: 'It is twelve o\'clock.',   tipCn: '现在十二点。' },
      { w: 'fifteen', ipa: '/ˌfɪfˈtiːn/', cn: '十五', emoji: '🕒', tip: 'It is three fifteen.',    tipCn: '现在三点十五分。' },
      { w: 'twenty',  ipa: '/ˈtwenti/', cn: '二十', emoji: '🕗', tip: 'It is eight twenty.',      tipCn: '现在八点二十分。' }
    ],
    scenes: [
      { bg: 'home', cast: ['mummy', 'penny'], prop: '🕰️', lines: [
        { who: 'Mummy', en: 'Look at the clock.', cn: '看看钟。' },
        { who: 'Penny', en: 'It is seven o\'clock.', cn: '现在七点。' }
      ]},
      { bg: 'home', cast: ['penny'], prop: '⏰', lines: [
        { who: 'Penny', en: 'It is time for school.', cn: '到上学的时间了。' },
        { who: 'Penny', en: 'It is twelve o\'clock now.', cn: '现在十二点了。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '🕒', lines: [
        { who: 'Tommy', en: 'I go home at four fifteen.', cn: '我四点十五分回家。' },
        { who: 'Tommy', en: 'I go to bed at eight twenty.', cn: '我八点二十分睡觉。' }
      ]}
    ]
  },
  {
    day: 23,
    theme: 'Unit 5 My Day',
    themeCn: '二下 U5 我的一天',
    color: '#ffab76',
    pattern: { en: 'I ___ at seven.', cn: '我七点……', demo: 'I get up at seven.' },
    words: [
      { w: 'get up',       ipa: '/ɡet ʌp/',        cn: '起床',   emoji: '🌅', tip: 'I get up at seven.',        tipCn: '我七点起床。' },
      { w: 'eat breakfast',ipa: '/iːt ˈbrekfəst/', cn: '吃早饭', emoji: '🍳', tip: 'I eat breakfast at seven thirty.', tipCn: '我七点半吃早饭。' },
      { w: 'go to school', ipa: '/ɡəʊ tə skuːl/',  cn: '去上学', emoji: '🎒', tip: 'I go to school at eight.',  tipCn: '我八点去上学。' },
      { w: 'eat lunch',    ipa: '/iːt lʌntʃ/',     cn: '吃午饭', emoji: '🍱', tip: 'I eat lunch at twelve.',   tipCn: '我十二点吃午饭。' },
      { w: 'go home',      ipa: '/ɡəʊ həʊm/',      cn: '回家',   emoji: '🏠', tip: 'I go home at four.',       tipCn: '我四点回家。' },
      { w: 'go to bed',    ipa: '/ɡəʊ tə bed/',    cn: '上床睡觉', emoji: '🛏️', tip: 'I go to bed at nine.',    tipCn: '我九点睡觉。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '🌅', lines: [
        { who: 'Penny', en: 'I get up at seven.', cn: '我七点起床。' },
        { who: 'Penny', en: 'I eat breakfast at seven thirty.', cn: '我七点半吃早饭。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '🍱', lines: [
        { who: 'Tommy', en: 'I go to school at eight.', cn: '我八点去上学。' },
        { who: 'Tommy', en: 'I eat lunch at twelve.', cn: '我十二点吃午饭。' }
      ]},
      { bg: 'night', cast: ['penny', 'tommy'], prop: '🛏️', lines: [
        { who: 'Penny', en: 'I go home at four.', cn: '我四点回家。' },
        { who: 'Tommy', en: 'I go to bed at nine.', cn: '我九点睡觉。' }
      ]}
    ]
  },
  {
    day: 24,
    theme: 'Unit 6 My Week',
    themeCn: '二下 U6 我的一周',
    color: '#c3a6ff',
    pattern: { en: 'It is ___.', cn: '今天是……', demo: 'It is Monday.' },
    words: [
      { w: 'Monday',    ipa: '/ˈmʌndeɪ/',  cn: '星期一', emoji: '📅', tip: 'It is Monday.',    tipCn: '今天是星期一。' },
      { w: 'Tuesday',   ipa: '/ˈtjuːzdeɪ/',cn: '星期二', emoji: '📚', tip: 'It is Tuesday.',   tipCn: '今天是星期二。' },
      { w: 'Wednesday', ipa: '/ˈwenzdeɪ/', cn: '星期三', emoji: '✏️', tip: 'It is Wednesday.', tipCn: '今天是星期三。' },
      { w: 'Thursday',  ipa: '/ˈθɜːzdeɪ/', cn: '星期四', emoji: '🎨', tip: 'It is Thursday.',  tipCn: '今天是星期四。' },
      { w: 'Friday',    ipa: '/ˈfraɪdeɪ/', cn: '星期五', emoji: '⚽', tip: 'It is Friday.',    tipCn: '今天是星期五。' },
      { w: 'Saturday',  ipa: '/ˈsætədeɪ/', cn: '星期六', emoji: '🎠', tip: 'It is Saturday.',  tipCn: '今天是星期六。' }
    ],
    scenes: [
      { bg: 'home', cast: ['penny'], prop: '📅', lines: [
        { who: 'Penny', en: 'It is Monday.', cn: '今天是星期一。' },
        { who: 'Penny', en: 'I go to school.', cn: '我要去上学。' }
      ]},
      { bg: 'home', cast: ['tommy'], prop: '⚽', lines: [
        { who: 'Tommy', en: 'It is Friday.', cn: '今天是星期五。' },
        { who: 'Tommy', en: 'I like Friday!', cn: '我喜欢星期五！' }
      ]},
      { bg: 'garden', cast: ['penny', 'tommy'], prop: '🎠', lines: [
        { who: 'Penny', en: 'It is Saturday!', cn: '今天是星期六！' },
        { who: 'Tommy', en: 'Let us play!', cn: '我们去玩吧！' }
      ]}
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTENT: CONTENT };
}
