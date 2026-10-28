/* ============================================================
 * 佩妮英语 · 中文速记 & 单词动画分镜
 *
 * 这里的 key 就是单词本身（小写），两个档位共用同一份速记库。
 * 找不到对应词条时，页面会自动用「拆解 + 联想句」兜底，不会报错。
 *
 * 字段说明：
 *   sound  谐音提示（中文谐音 + 一句怎么念），给中文母语孩子最快的记忆抓手
 *   parts  拆解（把单词拆成能看懂的块），写成「块 + 意思 / 块 + 意思」
 *   scene  一词一幕的动画分镜：佩妮围绕这个单词演一个小桥段
 *            bg    场景（garden/home/kitchen/pond/rain/snow/night/school/park/shop）
 *            cast  出场角色（penny/tommy/mummy/daddy/duck/cat/dog/rabbit/bird）
 *            prop  小道具 emoji
 *            line  佩妮说的一句英文（含该单词）
 *            lineCn 中文
 *            hook  这一句的「记忆钩子」，帮孩子把词和画面绑在一起
 * ============================================================ */

const MNEMONIC = {
  /* ---------------- 一年级上册 ---------------- */
  book: {
    sound: '布克 → 「布」+「克」，像把布包成书',
    parts: 'b + ook → b 像一本书立着，ook 读「乌克」',
    scene: { bg: 'home', cast: ['penny'], prop: '📖', line: 'This is my book.', lineCn: '这是我的书。', hook: '佩妮抱着书，书=book' }
  },
  ruler: {
    sound: '入勒 → 「入」+「勒」，尺子插进笔袋「入」',
    parts: 'rul(e) + er → 做 rule（规矩）的工具，量长短守规矩',
    scene: { bg: 'home', cast: ['penny'], prop: '📏', line: 'This is my ruler.', lineCn: '这是我的尺子。', hook: '尺子量桌子，长长的一条' }
  },
  pencil: {
    sound: '喷搜 → 「喷」+「搜」，笔尖「嗖」地写',
    parts: 'pen + cil → pen 是笔，后面小尾巴',
    scene: { bg: 'home', cast: ['penny'], prop: '✏️', line: 'I have a pencil.', lineCn: '我有一支铅笔。', hook: '佩妮用铅笔在本子上画画' }
  },
  eraser: {
    sound: '伊瑞色 → 「一擦色」，一擦颜色就没了',
    parts: 'e + rase（擦掉）+ r → 擦掉错字的工具',
    scene: { bg: 'home', cast: ['penny'], prop: '🧽', line: 'I have an eraser.', lineCn: '我有一块橡皮。', hook: '写错了？橡皮一擦就干净' }
  },
  schoolbag: {
    sound: '斯库包 → 里面有「书库」，装书的包',
    parts: 'school（学校）+ bag（包）→ 上学的包',
    scene: { bg: 'home', cast: ['penny'], prop: '🎒', line: 'This is my schoolbag.', lineCn: '这是我的书包。', hook: '佩妮背上书包准备出门' }
  },
  school: {
    sound: '斯库 → 「四库」，学校像四个大书库',
    parts: 's + chool → 听到 school 就想到上学',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🏫', line: 'Let us go to school.', lineCn: '我们去上学吧。', hook: '姐弟俩一起走去学校' }
  },
  face: {
    sound: '费斯 → 脸面，要「费」心保养',
    parts: 'f + ace → ace 是「王牌」，脸是最重要的一张牌',
    scene: { bg: 'home', cast: ['penny'], prop: '😊', line: 'This is my face.', lineCn: '这是我的脸。', hook: '佩妮笑给你看她的脸' }
  },
  eye: {
    sound: '爱 → 眼睛用来「爱」看世界',
    parts: 'e + ye → 只有三个字母，看东西就靠它',
    scene: { bg: 'home', cast: ['penny'], prop: '👁️', line: 'This is my eye.', lineCn: '这是我的眼睛。', hook: '佩妮眨眨眼睛' }
  },
  ear: {
    sound: '一耳 → 「一」只「耳」朵',
    parts: 'ear 里藏着 hear（听）的前三个字母',
    scene: { bg: 'home', cast: ['penny'], prop: '👂', line: 'This is my ear.', lineCn: '这是我的耳朵。', hook: '佩妮侧过身，指自己的耳朵' }
  },
  nose: {
    sound: '诺斯 → 「诺」，鼻子点头',
    parts: 'n + ose → 中间像鼻梁',
    scene: { bg: 'home', cast: ['penny'], prop: '👃', line: 'This is my nose.', lineCn: '这是我的鼻子。', hook: '闻到蛋糕香，鼻子一动' }
  },
  mouth: {
    sound: '冒斯 → 张嘴「冒」出话',
    parts: 'm + outh → 说 out 要靠嘴',
    scene: { bg: 'home', cast: ['penny'], prop: '👄', line: 'This is my mouth.', lineCn: '这是我的嘴巴。', hook: '佩妮张大嘴巴说话' }
  },
  hand: {
    sound: '汉的 → 「汉」子的手',
    parts: 'h + and → 用手 and（和）别人打招呼',
    scene: { bg: 'home', cast: ['penny'], prop: '✋', line: 'This is my hand.', lineCn: '这是我的手。', hook: '佩妮挥手打招呼' }
  },
  dog: {
    sound: '道格 → 「道」上跟着的狗',
    parts: 'd + og → d 像小狗坐着的背影',
    scene: { bg: 'garden', cast: ['penny', 'dog'], prop: '🐶', line: 'It is a dog.', lineCn: '它是一只小狗。', hook: '小狗跑过来摇尾巴' }
  },
  cat: {
    sound: '凯特 → 「凯」特猫',
    parts: 'c + at → 猫总 at（在）门口蹲着',
    scene: { bg: 'garden', cast: ['penny', 'cat'], prop: '🐱', line: 'It is a cat.', lineCn: '它是一只小猫。', hook: '小猫在墙头喵喵叫' }
  },
  duck: {
    sound: '达克 → 「嘎嘎」达克，鸭子叫',
    parts: 'd + uck → 鸭子扑通跳下水的 uck 声',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '🦆', line: 'It is a duck.', lineCn: '它是一只鸭子。', hook: '鸭子在池塘里游' }
  },
  bird: {
    sound: '伯德 → 「伯」德在天上飞',
    parts: 'b + ird → bird 里藏着 air（空中）的感觉',
    scene: { bg: 'garden', cast: ['penny', 'bird'], prop: '🐦', line: 'It is a bird.', lineCn: '它是一只小鸟。', hook: '小鸟落在树枝上唱歌' }
  },
  one: {
    sound: '万 → 「万」分之一，只有一',
    parts: 'o + ne → 一笔写出 1',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '1️⃣', line: 'I can see one duck.', lineCn: '我能看见一只鸭子。', hook: '池塘里只有一只鸭' }
  },
  two: {
    sound: '兔 → 两只兔子',
    parts: 'tw + o → t 像 2 的一半',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '2️⃣', line: 'I can see two ducks.', lineCn: '我能看见两只鸭子。', hook: '两只鸭子并排游' }
  },
  three: {
    sound: '思瑞 → 「三」个字母 th 开头',
    parts: 'th + ree → three 里有三个 e',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '3️⃣', line: 'I can see three ducks.', lineCn: '我能看见三只鸭子。', hook: '三只鸭子排成一队' }
  },
  four: {
    sound: '佛 → 「佛」有四个字：阿弥陀佛',
    parts: 'f + our → 比 our（我们的）多一个 f',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '4️⃣', line: 'I can see four ducks.', lineCn: '我能看见四只鸭子。', hook: '四只鸭子围一圈' }
  },
  five: {
    sound: '法爱夫 → 一只手「五」个手指',
    parts: 'f + ive → 拍手 five（五）下',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '5️⃣', line: 'I can see five ducks.', lineCn: '我能看见五只鸭子。', hook: '佩妮伸手比 5' }
  },
  six: {
    sound: '西克斯 → 「西」边六个人',
    parts: 's + ix → s 像数字 6 的弯',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '6️⃣', line: 'I can see six ducks.', lineCn: '我能看见六只鸭子。', hook: '六只鸭子，数都数不完' }
  },
  red: {
    sound: '瑞德 → 「瑞」雪是红的',
    parts: 'r + ed → 想到红包 red packet',
    scene: { bg: 'garden', cast: ['penny'], prop: '🔴', line: 'It is red.', lineCn: '它是红色的。', hook: '佩妮举着红苹果' }
  },
  blue: {
    sound: '布露 → 「布」是蓝的',
    parts: 'b + lue → glue（胶水）也是蓝蓝的',
    scene: { bg: 'garden', cast: ['penny'], prop: '🔵', line: 'It is blue.', lineCn: '它是蓝色的。', hook: '抬头看天，天是 blue' }
  },
  yellow: {
    sound: '耶楼 → 「耶」，太阳出来了',
    parts: 'yell（喊）+ ow → 见到黄色的太阳会「耶」',
    scene: { bg: 'garden', cast: ['penny'], prop: '🟡', line: 'It is yellow.', lineCn: '它是黄色的。', hook: '太阳和香蕉都是 yellow' }
  },
  green: {
    sound: '格林 → 「绿」林好汉',
    parts: 'gr + een → 草地 grass 的绿',
    scene: { bg: 'garden', cast: ['penny'], prop: '🟢', line: 'It is green.', lineCn: '它是绿色的。', hook: '脚下的草是 green' }
  },
  pink: {
    sound: '拼克 → 佩奇最爱的「粉」',
    parts: 'p + ink → 粉色墨水 ink',
    scene: { bg: 'garden', cast: ['penny'], prop: '🌸', line: 'It is pink.', lineCn: '它是粉色的。', hook: '佩妮自己是粉红猪' }
  },
  apple: {
    sound: '阿婆 → 阿婆给的红苹果',
    parts: 'a + pple → 两个 p 像两只手捧着',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍎', line: 'I like apples.', lineCn: '我喜欢苹果。', hook: '妈妈削好一盘苹果' }
  },
  banana: {
    sound: '巴拿拿 → 「拿」起香蕉',
    parts: 'ba + nana → nana 像奶奶，奶奶爱吃香蕉',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍌', line: 'I like bananas.', lineCn: '我喜欢香蕉。', hook: '佩妮剥开香蕉' }
  },
  orange: {
    sound: '奥润吉 → 「奥」妙橙色，润润的汁',
    parts: 'or + ange → 像 range（一排）橙子摆一排',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍊', line: 'I like oranges.', lineCn: '我喜欢橙子。', hook: '橙子和橙色是同一个词' }
  },
  pear: {
    sound: '佩尔 → 「佩」妮爱梨',
    parts: 'p + ear → 梨的形状像耳朵 ear',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍐', line: 'I like pears.', lineCn: '我喜欢梨。', hook: '一只胖胖的梨' }
  },
  peach: {
    sound: '皮奇 → 「皮」薄薄的桃子',
    parts: 'pea（豌豆）+ ch → 圆圆小小的桃子',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍑', line: 'I like peaches.', lineCn: '我喜欢桃子。', hook: '桃子一口咬下去甜甜的' }
  },
  grape: {
    sound: '格瑞普 → 「格瑞」一串葡萄',
    parts: 'gr + ape（猩猩）→ 猩猩也爱吃葡萄',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍇', line: 'I like grapes.', lineCn: '我喜欢葡萄。', hook: '一串紫葡萄' }
  },

  /* ---------------- 一年级下册 ---------------- */
  chair: {
    sound: '切尔 → 「切」一块木头做椅子',
    parts: 'ch + air → 椅子摆在 air（空处）',
    scene: { bg: 'home', cast: ['penny'], prop: '🪑', line: 'This is a chair.', lineCn: '这是一把椅子。', hook: '佩妮把小椅子搬过来' }
  },
  desk: {
    sound: '戴斯克 → 「戴」着书本的桌子',
    parts: 'd + esk → 桌上 d 是 drum（鼓）在响',
    scene: { bg: 'home', cast: ['penny'], prop: '🪑', line: 'This is a desk.', lineCn: '这是一张书桌。', hook: '书桌上有书和笔' }
  },
  window: {
    sound: '温兜 → 「温」暖的风从窗进来',
    parts: 'wind（风）+ ow → 风进来的地方',
    scene: { bg: 'home', cast: ['penny'], prop: '🪟', line: 'This is a window.', lineCn: '这是一扇窗户。', hook: '佩妮推开窗户看外面' }
  },
  door: {
    sound: '多儿 → 「多」个门儿',
    parts: 'd + oor → 两个 o 像两个门环',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '🚪', line: 'Open the door, please.', lineCn: '请开门。', hook: '妈妈在门外敲门' }
  },
  light: {
    sound: '赖特 → 「亮」起来了',
    parts: 'l + ight → night 去掉 n 就亮',
    scene: { bg: 'home', cast: ['penny'], prop: '💡', line: 'Turn on the light.', lineCn: '把灯打开。', hook: '一按开关灯就亮了' }
  },
  wall: {
    sound: '沃尔 → 「窝」里的墙',
    parts: 'w + all → 把 all（全部）围起来的墙',
    scene: { bg: 'home', cast: ['penny'], prop: '🧱', line: 'This is the wall.', lineCn: '这是墙。', hook: '墙上挂着全家福' }
  },
  bed: {
    sound: '贝德 → 「贝」壳一样软软的床',
    parts: 'b + ed → 躺下就 b 掉（倒）',
    scene: { bg: 'home', cast: ['penny'], prop: '🛏️', line: 'This is my bed.', lineCn: '这是我的床。', hook: '佩妮扑到床上跳两下' }
  },
  lamp: {
    sound: '兰普 → 「兰」花一样的小台灯',
    parts: 'l + amp → 一开灯就 lamp（亮）',
    scene: { bg: 'night', cast: ['penny', 'mummy'], prop: '🛋️', line: 'This is my lamp.', lineCn: '这是我的台灯。', hook: '睡前开着小台灯讲故事' }
  },
  box: {
    sound: '博克斯 → 「包」起来的盒子',
    parts: 'b + ox → ox 是牛，牛住大盒子',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '📦', line: 'This is a box.', lineCn: '这是一个盒子。', hook: '纸箱里装满了玩具' }
  },
  toy: {
    sound: '托伊 → 「拖」着玩的玩具',
    parts: 't + oy → joy（开心）去掉 j，玩具带来开心',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '🧸', line: 'This is my toy.', lineCn: '这是我的玩具。', hook: '汤米抱着玩具熊跑' }
  },
  ball: {
    sound: '波尔 → 球「啵」地弹起来',
    parts: 'b + all → 圆圆的像 all（全部）',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '⚽', line: 'I have a ball.', lineCn: '我有一个球。', hook: '球滚到泥坑边' }
  },
  doll: {
    sound: '多儿 → 「多」可爱的娃娃',
    parts: 'd + oll → 两个 l 像娃娃的两条腿',
    scene: { bg: 'home', cast: ['penny'], prop: '🪆', line: 'This is my doll.', lineCn: '这是我的娃娃。', hook: '佩妮给娃娃梳头发' }
  },
  kite: {
    sound: '凯特 → 风筝「凯」旋上天',
    parts: 'k + ite → 风一吹就飞',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '🪁', line: 'Let us fly a kite.', lineCn: '我们去放风筝吧。', hook: '爸爸牵着风筝线' }
  },
  car: {
    sound: '卡 → 小汽车「卡」卡开',
    parts: 'c + ar → c 像车轮',
    scene: { bg: 'garden', cast: ['tommy'], prop: '🚗', line: 'This is a car.', lineCn: '这是一辆小汽车。', hook: '汤米推着玩具车跑' }
  },
  rice: {
    sound: '赖斯 → 「米」饭来了',
    parts: 'r + ice → 像 ice（冰）一样一粒一粒白',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍚', line: 'I want rice.', lineCn: '我要米饭。', hook: '妈妈盛了一碗米饭' }
  },
  bread: {
    sound: '布莱德 → 「不」吃完不睡觉',
    parts: 'b + read → 边看书边吃面包',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🍞', line: 'I want some bread.', lineCn: '我要一些面包。', hook: '烤面包片跳起来' }
  },
  egg: {
    sound: 'エッグ（埃格）→ 「一格」一格蛋架',
    parts: 'e + gg → 两个 g 像两个蛋',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🥚', line: 'I want an egg, please.', lineCn: '请给我一个鸡蛋。', hook: '锅里煎着蛋' }
  },
  cake: {
    sound: '凯克 → 「凯」旋的蛋糕',
    parts: 'c + ake → 像 bake（烤）把 b 换成 c',
    scene: { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍰', line: 'I want a cake.', lineCn: '我要一块蛋糕。', hook: '生日蛋糕插着蜡烛' }
  },
  milk: {
    sound: '米厄克 → 「米」白色的奶',
    parts: 'm + ilk → 像 silk（丝）一样滑',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '🥛', line: 'I want some milk.', lineCn: '我要喝牛奶。', hook: '一杯热牛奶' }
  },
  water: {
    sound: '沃特 → 水「沃」沃地流',
    parts: 'wat + er → 做事（doer）离不开水',
    scene: { bg: 'kitchen', cast: ['penny'], prop: '💧', line: 'I want some water.', lineCn: '我要喝点水。', hook: '佩妮咕嘟咕嘟喝水' }
  },
  juice: {
    sound: '住斯 → 「住」在果汁里',
    parts: 'j + uice → 水果 ju（聚）在一起榨汁',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🧃', line: 'I want some juice.', lineCn: '我要喝果汁。', hook: '吸管插进橙汁' }
  },
  shirt: {
    sound: '设特 → 「设」计一件衬衫',
    parts: 'sh + irt → 把 dirt（脏）的 d 换成 sh',
    scene: { bg: 'home', cast: ['penny'], prop: '👕', line: 'This is my shirt.', lineCn: '这是我的衬衫。', hook: '佩妮把衬衫套上身' }
  },
  dress: {
    sound: '缀斯 → 裙子「缀」满小花',
    parts: 'dr + ess → dress 里有红裙子',
    scene: { bg: 'home', cast: ['penny'], prop: '👗', line: 'This is my dress.', lineCn: '这是我的连衣裙。', hook: '佩妮转圈，裙摆飞起来' }
  },
  hat: {
    sound: '哈特 → 「哈」哈哈戴上帽子',
    parts: 'h + at → 帽子戴在 head（头）at（上）',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '👒', line: 'This is my hat.', lineCn: '这是我的帽子。', hook: '风把帽子吹走了' }
  },
  socks: {
    sound: '索克 → 「缩」进袜子里',
    parts: 's + ock → 两只袜子成对',
    scene: { bg: 'home', cast: ['penny'], prop: '🧦', line: 'These are my socks.', lineCn: '这是我的袜子。', hook: '佩妮找不着一只袜子' }
  },
  shoes: {
    sound: '述斯 → 「穿」鞋出门',
    parts: 'sh + oes → 前面是 sh 音，鞋帮你 sh（走）',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '👟', line: 'These are my shoes.', lineCn: '这是我的鞋子。', hook: '下雨天换上雨靴' }
  },
  coat: {
    sound: '扣特 → 一「扣」上就暖',
    parts: 'c + oat → 像船（boat），披在身上',
    scene: { bg: 'snow', cast: ['penny'], prop: '🧥', line: 'This is my coat.', lineCn: '这是我的外套。', hook: '雪天穿上厚外套' }
  },

  /* ---------------- 二年级上册 ---------------- */
  father: {
    sound: '发德 → 「父」亲，father 里有 fa',
    parts: 'fa + ther → 和 mother 只差一个字母',
    scene: { bg: 'home', cast: ['penny', 'daddy'], prop: '👨', line: 'This is my father.', lineCn: '这是我的爸爸。', hook: '爸爸抱起佩妮' }
  },
  mother: {
    sound: '妈德 → 「妈」妈，m 开头',
    parts: 'mo + ther → m 像妈妈的两个肩膀',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '👩', line: 'This is my mother.', lineCn: '这是我的妈妈。', hook: '妈妈给佩妮梳头' }
  },
  brother: {
    sound: '布拉德 → 「兄弟」brother',
    parts: 'bro + ther → 和 mother 一个尾巴',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '👦', line: 'This is my brother.', lineCn: '这是我的弟弟。', hook: '汤米跟着姐姐跑' }
  },
  sister: {
    sound: '西斯特 → 「西」边姐妹',
    parts: 'si + ster → 和 brother 成一对',
    scene: { bg: 'home', cast: ['penny'], prop: '👧', line: 'I am a sister.', lineCn: '我是姐姐。', hook: '佩妮照顾弟弟' }
  },
  family: {
    sound: '法米粒 → 一家人「法」外亲密',
    parts: 'fam + ily → 像 family 的一家人',
    scene: { bg: 'home', cast: ['penny', 'tommy', 'mummy', 'daddy'], prop: '👨‍👩‍👧‍👦', line: 'This is my family.', lineCn: '这是我的家人。', hook: '全家一起拍合照' }
  },
  boy: {
    sound: '波伊 → 男「孩」boy',
    parts: 'b + oy → 和 toy 押韵，男孩爱玩具',
    scene: { bg: 'garden', cast: ['tommy'], prop: '👦', line: 'He is a boy.', lineCn: '他是个男孩。', hook: '汤米穿着蓝衣服' }
  },
  girl: {
    sound: '格尔 → 「girl」女孩',
    parts: 'g + irl → 和 bird 押韵，女孩像小鸟',
    scene: { bg: 'garden', cast: ['penny'], prop: '👧', line: 'She is a girl.', lineCn: '她是个女孩。', hook: '佩妮戴着蝴蝶结' }
  },
  he: {
    sound: '希 → 「他」轻轻吐气 he',
    parts: 'h + e → 只有两个字母，指男生',
    scene: { bg: 'garden', cast: ['tommy'], prop: '👦', line: 'He is my friend.', lineCn: '他是我的朋友。', hook: '指着男孩说 he' }
  },
  she: {
    sound: '希 → she 比 he 多一个 s，指女生',
    parts: 'sh + e → 加了 s 就是「她」',
    scene: { bg: 'garden', cast: ['penny'], prop: '👧', line: 'She is my friend.', lineCn: '她是我的朋友。', hook: '指着女孩说 she' }
  },
  friend: {
    sound: '弗兰德 → 「朋」友扶着走',
    parts: 'fri + end → 陪你走到 end（最后）的人',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🤝', line: 'You are my friend.', lineCn: '你是我的朋友。', hook: '两个孩子手拉手' }
  },
  tall: {
    sound: '托尔 → 「高」得像塔（tower）',
    parts: 't + all → 比 all 还高',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '📏', line: 'He is tall.', lineCn: '他很高。', hook: '爸爸比佩妮高好多' }
  },
  short: {
    sound: '硕特 → 「矮」短的',
    parts: 'sh + or t → 和 tall 是一对反义词',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '📏', line: 'He is short.', lineCn: '他个子矮。', hook: '汤米踮脚够不到' }
  },
  park: {
    sound: '帕克 → 「跑」去公园',
    parts: 'p + ark → ark 是方舟，公园里有大船',
    scene: { bg: 'park', cast: ['penny', 'tommy'], prop: '🌳', line: 'Let us go to the park.', lineCn: '我们去公园吧。', hook: '公园里有滑梯和秋千' }
  },
  tree: {
    sound: '特瑞 → 「树」tree，和 three 差一个 h',
    parts: 't + ree → 三个 e 像三片叶子',
    scene: { bg: 'park', cast: ['penny'], prop: '🌳', line: 'I can see a tree.', lineCn: '我能看见一棵树。', hook: '佩妮在树下乘凉' }
  },
  shop: {
    sound: '肖普 → 「小」店 shop',
    parts: 'sh + op → 进去 sh（嘘）一声',
    scene: { bg: 'shop', cast: ['penny', 'mummy'], prop: '🏪', line: 'Let us go to the shop.', lineCn: '我们去商店吧。', hook: '妈妈带佩妮买菜' }
  },
  gift: {
    sound: '吉夫特 → 「给」你一份礼物',
    parts: 'g + ift → 和 give（给）同源',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '🎁', line: 'This is a gift.', lineCn: '这是一份礼物。', hook: '拆开礼物盒' }
  },
  happy: {
    sound: '哈皮 → 开心得「哈」哈笑',
    parts: 'hap + py → 两个 p 像两个笑眼',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '😄', line: 'I am happy.', lineCn: '我很开心。', hook: '佩妮在泥坑里哈哈大笑' }
  },
  holiday: {
    sound: '哈里得 → 放假的「好」日子',
    parts: 'holy（神圣）+ day（日子）→ 好日子',
    scene: { bg: 'garden', cast: ['penny', 'tommy', 'mummy'], prop: '🎉', line: 'Happy holiday!', lineCn: '节日快乐！', hook: '一家人挂彩带庆祝' }
  },

  /* ---------------- 二年级下册 ---------------- */
  swim: {
    sound: '斯威姆 → 「水」里游',
    parts: 's + wim → 像 wave（波浪）在动',
    scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '🏊', line: 'I can swim.', lineCn: '我会游泳。', hook: '佩妮和鸭子在池塘游' }
  },
  jump: {
    sound: '江普 → 「跳」起来',
    parts: 'j + ump → 像弹簧 j（噌）地一下',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🦘', line: 'I can jump.', lineCn: '我会跳。', hook: '两人在泥坑里蹦跳' }
  },
  run: {
    sound: '软 → 「跑」得飞快',
    parts: 'r + un → 只有三个字母，跑起来',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🏃', line: 'I can run.', lineCn: '我会跑。', hook: '两人比赛跑步' }
  },
  sing: {
    sound: '辛 → 「唱」歌 sing',
    parts: 's + ing → 加 ing 就是正在唱',
    scene: { bg: 'garden', cast: ['penny', 'bird'], prop: '🎤', line: 'I can sing.', lineCn: '我会唱歌。', hook: '佩妮和小鸟一起唱' }
  },
  dance: {
    sound: '丹斯 → 「跳」舞 dance',
    parts: 'd + ance → 像在圈里（ance）转',
    scene: { bg: 'garden', cast: ['penny', 'mummy'], prop: '💃', line: 'I can dance.', lineCn: '我会跳舞。', hook: '母女俩一起转圈' }
  },
  draw: {
    sound: '卓 → 「画」画 draw',
    parts: 'dr + aw → 笔在纸上 dr（拖）',
    scene: { bg: 'home', cast: ['penny'], prop: '🖍️', line: 'I can draw.', lineCn: '我会画画。', hook: '佩妮画出泥坑和小猪' }
  },
  sunny: {
    sound: '撒尼 → 太阳「撒」满阳光',
    parts: 'sun（太阳）+ ny → 加 ny 变形容词',
    scene: { bg: 'garden', cast: ['penny', 'mummy'], prop: '☀️', line: 'It is sunny.', lineCn: '天气晴朗。', hook: '太阳晒得睁不开眼' }
  },
  rainy: {
    sound: '瑞尼 → 「雨」rainy',
    parts: 'rain（雨）+ y → 有雨的',
    scene: { bg: 'rain', cast: ['penny', 'tommy'], prop: '☔', line: 'It is rainy.', lineCn: '下雨了。', hook: '两人撑伞踩水' }
  },
  windy: {
    sound: '温迪 → 「风」windy',
    parts: 'wind（风）+ y → 有风的',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '💨', line: 'It is windy.', lineCn: '刮风了。', hook: '帽子被风吹跑' }
  },
  cloudy: {
    sound: '克劳迪 → 「云」cloudy',
    parts: 'cloud（云）+ y → 多云的',
    scene: { bg: 'garden', cast: ['penny'], prop: '☁️', line: 'It is cloudy.', lineCn: '多云。', hook: '云把太阳挡住了' }
  },
  snowy: {
    sound: '斯诺伊 → 「雪」snowy',
    parts: 'snow（雪）+ y → 下雪的',
    scene: { bg: 'snow', cast: ['penny', 'tommy'], prop: '❄️', line: 'It is snowy.', lineCn: '下雪了。', hook: '两人在雪地堆雪人' }
  },
  spring: {
    sound: '斯普林 → 「春」天 spring',
    parts: 'spr + ing → 弹簧 spring 也是它，万物弹起来',
    scene: { bg: 'garden', cast: ['penny', 'bird'], prop: '🌷', line: 'It is spring.', lineCn: '春天到了。', hook: '花开鸟叫的季节' }
  },
  summer: {
    sound: '萨默 → 「夏」天 summer',
    parts: 'sum + mer → 太阳 sum 最大',
    scene: { bg: 'garden', cast: ['penny'], prop: '🍦', line: 'It is summer.', lineCn: '夏天到了。', hook: '吃冰淇淋的夏天' }
  },
  autumn: {
    sound: '奥特姆 → 「秋」天 autumn',
    parts: 'aut + umn → 注意 n 不发音',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '🍂', line: 'It is autumn.', lineCn: '秋天到了。', hook: '落叶一片片飘下来' }
  },
  winter: {
    sound: '温特 → 「冬」天 winter',
    parts: 'win（赢）+ ter → 打赢寒冷',
    scene: { bg: 'snow', cast: ['penny'], prop: '⛄', line: 'It is winter.', lineCn: '冬天到了。', hook: '戴围巾堆雪人' }
  },
  clock: {
    sound: '克洛克 → 「钟」clock',
    parts: 'cl + ock → 像石头 clock（咔哒）声',
    scene: { bg: 'home', cast: ['penny'], prop: '🕐', line: 'This is a clock.', lineCn: '这是一个钟。', hook: '墙上的钟滴答响' }
  },
  Monday: {
    sound: '曼迪 → 「周一」Moon 月亮日',
    parts: 'Mon（月亮）+ day（日）→ 月亮日',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '📅', line: 'It is Monday.', lineCn: '今天是星期一。', hook: '周一背书包上学' }
  },
  wake: {
    sound: '威克 → 「醒」来 wake',
    parts: 'w + ake → 像 cake，醒来想吃蛋糕',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '⏰', line: 'I wake up at seven.', lineCn: '我七点起床。', hook: '闹钟响，佩妮醒来' }
  },
  breakfast: {
    sound: '布莱克福斯特 → 「早餐」break + fast',
    parts: 'break（打破）+ fast（禁食）→ 打破一夜不吃的状态',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍳', line: 'I have breakfast at seven.', lineCn: '我七点吃早饭。', hook: '桌上摆着牛奶和面包' }
  },
  lunch: {
    sound: '朗奇 → 「午」饭 lunch',
    parts: 'l + unch → 中午那一顿',
    scene: { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍱', line: 'I have lunch at twelve.', lineCn: '我十二点吃午饭。', hook: '饭盒里装着饭团' }
  },
  dinner: {
    sound: '迪纳 → 「晚」饭 dinner',
    parts: 'din + ner → 一家人的正餐',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy', 'daddy'], prop: '🍽️', line: 'We have dinner at six.', lineCn: '我们六点吃晚饭。', hook: '全家围坐吃饭' }
  },
  sleep: {
    sound: '斯利普 → 「睡」觉 sleep',
    parts: 's + leep → 像 sheep，数羊睡觉',
    scene: { bg: 'night', cast: ['penny', 'mummy'], prop: '😴', line: 'I sleep at nine.', lineCn: '我九点睡觉。', hook: '妈妈关灯，佩妮闭眼' }
  },
  Saturday: {
    sound: '萨特迪 → 「周六」Saturn 土星日',
    parts: 'Satur（土星）+ day（日）→ 土星日',
    scene: { bg: 'garden', cast: ['penny', 'tommy', 'daddy'], prop: '🎈', line: 'It is Saturday.', lineCn: '今天是星期六。', hook: '周末全家去公园' }
  }
};

Object.assign(MNEMONIC, {
  /* ---------------- 补充：动物 / 颜色 ---------------- */
  tiger: {
    sound: '泰格 → 「泰」山里的老虎',
    parts: 'tig + er → 和 trigger 开头一样，凶猛',
    scene: { bg: 'zoo', cast: ['penny', 'tommy'], prop: '🐯', line: 'It is a tiger.', lineCn: '它是一只老虎。', hook: '老虎在笼子里踱步' }
  },
  monkey: {
    sound: '芒奇 → 「忙」着爬树的猴子',
    parts: 'mon + key（钥匙）→ 猴子拿着钥匙',
    scene: { bg: 'zoo', cast: ['penny', 'monkey'], prop: '🐵', line: 'It is a monkey.', lineCn: '它是一只猴子。', hook: '猴子倒挂着荡来荡去' }
  },
  panda: {
    sound: '潘达 → 「胖」胖的熊猫',
    parts: 'pan + da → pan 是平底锅，熊猫圆圆的',
    scene: { bg: 'zoo', cast: ['penny', 'panda'], prop: '🐼', line: 'It is a panda.', lineCn: '它是一只熊猫。', hook: '熊猫抱着竹子啃' }
  },
  bear: {
    sound: '贝尔 → 「背」着走的大熊',
    parts: 'b + ear → 有一对大耳朵 ear 的动物',
    scene: { bg: 'zoo', cast: ['penny', 'bear'], prop: '🐻', line: 'It is a bear.', lineCn: '它是一只熊。', hook: '熊慢慢走过来' }
  },
  black: {
    sound: '布莱克 → 「不」亮，黑漆漆',
    parts: 'b + lack → 缺（lack）了光就是黑',
    scene: { bg: 'night', cast: ['penny'], prop: '⚫', line: 'It is black.', lineCn: '它是黑色的。', hook: '关了灯，屋子黑黑的' }
  },
  white: {
    sound: '外特 → 「白」得像雪',
    parts: 'wh + ite → 白白的纸',
    scene: { bg: 'snow', cast: ['penny'], prop: '⚪', line: 'It is white.', lineCn: '它是白色的。', hook: '雪人白白胖胖' }
  },

  /* ---------------- 补充：教室 / 方位 ---------------- */
  blackboard: {
    sound: '布莱克波德 → 黑色的板',
    parts: 'black（黑）+ board（板）→ 黑板',
    scene: { bg: 'school', cast: ['penny'], prop: '🧑‍🏫', line: 'This is a blackboard.', lineCn: '这是一块黑板。', hook: '老师在黑板上写字' }
  },
  on: {
    sound: '昂 → 东西「昂」在上面',
    parts: '两个字母，像东西搁在桌面 on 上面',
    scene: { bg: 'home', cast: ['penny', 'cat'], prop: '⬆️', line: 'The cat is on the desk.', lineCn: '猫在桌子上。', hook: '猫坐在桌面上 on' }
  },
  under: {
    sound: '安德 → 「安」在下面藏着',
    parts: 'un + der → un 是否定，看不见的地方',
    scene: { bg: 'home', cast: ['penny', 'cat'], prop: '⬇️', line: 'The cat is under the desk.', lineCn: '猫在桌子下。', hook: '猫钻到桌底 under' }
  },
  in: {
    sound: '印 → 「进」去，在里面',
    parts: '两个字母，像东西装进盒子',
    scene: { bg: 'home', cast: ['penny', 'duck'], prop: '📥', line: 'The duck is in the box.', lineCn: '鸭子在盒子里。', hook: '鸭子装进箱子里 in' }
  },
  near: {
    sound: '尼尔 → 「挨」着，很近',
    parts: 'n + ear → 在耳朵 ear 旁边',
    scene: { bg: 'garden', cast: ['penny', 'dog'], prop: '➡️', line: 'The dog is near the tree.', lineCn: '狗在树旁边。', hook: '小狗紧挨着树 near' }
  },
  behind: {
    sound: '必汉德 → 「背」后在后面',
    parts: 'be + hind → hind 是后面',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🙈', line: 'Tommy is behind the tree.', lineCn: '汤米在树后面。', hook: '汤米躲在树后躲猫猫' }
  },

  /* ---------------- 补充：交通 ---------------- */
  plane: {
    sound: '普雷恩 → 飞机「破」风飞行',
    parts: 'pl + ane → 平平的 wing',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '✈️', line: 'Let us go by plane.', lineCn: '我们坐飞机去吧。', hook: '飞机从头顶飞过' }
  },
  train: {
    sound: '吹恩 → 火车「出」发',
    parts: 'tr + ain → 一长串车厢',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🚂', line: 'Let us go by train.', lineCn: '我们坐火车去吧。', hook: '小火车呜呜开过来' }
  },

  /* ---------------- 补充：食物 / 饮料 ---------------- */
  noodles: {
    sound: '努豆斯 → 「扭」来扭去的面条',
    parts: 'noodle（面条）+ s → 一根根长长的',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍜', line: 'I want noodles.', lineCn: '我要面条。', hook: '热气腾腾的一碗面' }
  },
  vegetable: {
    sound: '维吉特波 → 「维」生的蔬菜',
    parts: 'veg（植物）+ table（桌）→ 桌上那盘菜',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🥦', line: 'I want vegetables.', lineCn: '我要蔬菜。', hook: '妈妈端上一盘西兰花' }
  },
  fish: {
    sound: '菲什 → 「肥」鱼在水里',
    parts: 'f + ish → 和 dish（一盘菜）押韵',
    scene: { bg: 'pond', cast: ['penny', 'mummy'], prop: '🐟', line: 'I want fish.', lineCn: '我要吃鱼。', hook: '盘子里一条鱼' }
  },
  chicken: {
    sound: '奇肯 → 「吃」鸡肉',
    parts: 'chick（小鸡）+ en → 小鸡的肉',
    scene: { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍗', line: 'I want chicken.', lineCn: '我要吃鸡肉。', hook: '一盘香喷喷的鸡腿' }
  },
  tea: {
    sound: '替 → 「茶」替水',
    parts: 't + ea → 两个字母，一小杯',
    scene: { bg: 'kitchen', cast: ['penny', 'daddy'], prop: '🍵', line: 'I want tea, please.', lineCn: '请给我一杯茶。', hook: '爸爸端着热茶杯' }
  },
  thirsty: {
    sound: '瑟斯提 → 「渴」得嗓子涩',
    parts: 'thirst（渴）+ y → 想喝水的',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🥵', line: 'I am thirsty.', lineCn: '我渴了。', hook: '玩累了，佩妮想喝水' }
  },
  thanks: {
    sound: '散克斯 → 「谢」谢',
    parts: 'thank（感谢）+ s',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '🙏', line: 'Thanks, Mummy!', lineCn: '谢谢妈妈！', hook: '妈妈递苹果，佩妮道谢' }
  },

  /* ---------------- 补充：衣服 ---------------- */
  'T-shirt': {
    sound: '替-设特 → T 恤，形状像字母 T',
    parts: 'T + shirt（衬衫）→ T 形的衬衫',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '👕', line: 'This is my T-shirt.', lineCn: '这是我的T恤。', hook: '汤米穿着一件T恤' }
  },
  skirt: {
    sound: '斯克特 → 「裙」子轻飘飘',
    parts: 'sk + irt → 和 shirt 只差一个字母',
    scene: { bg: 'home', cast: ['penny'], prop: '👗', line: 'This is my skirt.', lineCn: '这是我的短裙。', hook: '佩妮穿上短裙转圈' }
  },
  shorts: {
    sound: '肖茨 → 「短」裤 short + s',
    parts: 'short（短）+ s → 短的裤子',
    scene: { bg: 'garden', cast: ['tommy'], prop: '🩳', line: 'These are my shorts.', lineCn: '这是我的短裤。', hook: '夏天穿短裤出去玩' }
  },

  /* ---------------- 补充：家人 ---------------- */
  grandfather: {
    sound: '格兰德发德 → 「大」的爸爸，爷爷',
    parts: 'grand（大）+ father（爸爸）→ 爸爸的爸爸',
    scene: { bg: 'home', cast: ['penny', 'daddy'], prop: '👴', line: 'This is my grandfather.', lineCn: '这是我的爷爷。', hook: '爷爷摸摸佩妮的头' }
  },
  grandmother: {
    sound: '格兰德妈德 → 「大」的妈妈，奶奶',
    parts: 'grand（大）+ mother（妈妈）→ 妈妈的妈妈',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '👵', line: 'This is my grandmother.', lineCn: '这是我的奶奶。', hook: '奶奶织毛线，佩妮靠着' }
  },
  man: {
    sound: '曼 → 「男」人大个子',
    parts: '三个字母，和 woman 一起记',
    scene: { bg: 'park', cast: ['daddy'], prop: '👨', line: 'He is a man.', lineCn: '他是一个男人。', hook: '爸爸在公园里' }
  },
  woman: {
    sound: '乌曼 → 「女」人',
    parts: 'wo + man → 比 man 多两个字母',
    scene: { bg: 'park', cast: ['mummy'], prop: '👩', line: 'She is a woman.', lineCn: '她是一个女人。', hook: '妈妈在长椅上' }
  },
  classmate: {
    sound: '克拉斯梅特 → 同班的「伙伴」',
    parts: 'class（班级）+ mate（伙伴）→ 同班伙伴',
    scene: { bg: 'school', cast: ['penny', 'tommy'], prop: '🧑‍🤝‍🧑', line: 'She is my classmate.', lineCn: '她是我的同学。', hook: '两个同学一起走' }
  },
  thin: {
    sound: '辛 → 「细」细的 thin',
    parts: 'th + in → 里面（in）薄薄的',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🎋', line: 'He is thin.', lineCn: '他很瘦。', hook: '竹竿一样瘦瘦的' }
  },
  big: {
    sound: '比格 → 「大」得 big',
    parts: 'b + ig → 和 pig 差一个字母，大猪',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '🐘', line: 'It is big.', lineCn: '它很大。', hook: '爸爸张开手臂好大' }
  },
  small: {
    sound: '斯莫 → 「小」小的',
    parts: 'sm + all → 比 all 小',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🐜', line: 'It is small.', lineCn: '它很小。', hook: '一只小蚂蚁爬过' }
  },
  pretty: {
    sound: '普瑞提 → 「漂亮」pretty',
    parts: 'prett + y → 和 beauty 一样美',
    scene: { bg: 'garden', cast: ['penny', 'mummy'], prop: '🌺', line: 'She is pretty.', lineCn: '她很漂亮。', hook: '妈妈戴上花，佩妮夸她' }
  },

  /* ---------------- 补充：社区 / 公园 ---------------- */
  hospital: {
    sound: '豪斯比托 → 「好」的地方，医院',
    parts: 'hospit + al → 和 hotel（旅馆）开头像',
    scene: { bg: 'shop', cast: ['penny', 'mummy'], prop: '🏥', line: 'This is a hospital.', lineCn: '这是一家医院。', hook: '门口有红十字' }
  },
  zoo: {
    sound: '祖 → 「动」物园 zoo',
    parts: '两个 o 像两只瞪大的眼睛',
    scene: { bg: 'zoo', cast: ['penny', 'tommy'], prop: '🦓', line: 'Let us go to the zoo.', lineCn: '我们去动物园吧。', hook: '斑马和长颈鹿在门口' }
  },
  supermarket: {
    sound: '苏珀马ket → 「超级」大市场',
    parts: 'super（超级）+ market（市场）',
    scene: { bg: 'shop', cast: ['penny', 'mummy'], prop: '🛒', line: 'Let us go to the supermarket.', lineCn: '我们去超市吧。', hook: '推着购物车逛超市' }
  },
  bookstore: {
    sound: '布克斯托 → 卖书的店',
    parts: 'book（书）+ store（店）',
    scene: { bg: 'shop', cast: ['penny', 'daddy'], prop: '📚', line: 'This is a bookstore.', lineCn: '这是一家书店。', hook: '书架上摆满了书' }
  },
  cinema: {
    sound: '西尼玛 → 「电」影院看电影',
    parts: 'cine + ma → 和 camera 押韵',
    scene: { bg: 'shop', cast: ['penny', 'tommy'], prop: '🎬', line: 'Let us go to the cinema.', lineCn: '我们去看电影吧。', hook: '手捧爆米花进场' }
  },
  hill: {
    sound: '希尔 → 「山坡」hill',
    parts: 'h + ill → 和 ill（病）同形，爬坡会累病',
    scene: { bg: 'park', cast: ['penny', 'tommy'], prop: '⛰️', line: 'I can see a hill.', lineCn: '我能看见一座小山。', hook: '两人爬上小山坡' }
  },
  lake: {
    sound: '雷克 → 「湖」lake',
    parts: 'l + ake → 和 cake 押韵',
    scene: { bg: 'pond', cast: ['penny', 'daddy'], prop: '🦢', line: 'This is a lake.', lineCn: '这是一个湖。', hook: '白天鹅在湖面游' }
  },
  grass: {
    sound: '格拉斯 → 「草」地 grass',
    parts: 'gr + ass → 一片绿绿的地',
    scene: { bg: 'park', cast: ['penny', 'tommy'], prop: '🌱', line: 'The grass is green.', lineCn: '草是绿色的。', hook: '光脚踩在草地上' }
  },
  flower: {
    sound: '弗劳尔 → 「花」flower',
    parts: 'flow（流动）+ er → 花蜜在流',
    scene: { bg: 'park', cast: ['penny', 'mummy'], prop: '🌻', line: 'I can see a flower.', lineCn: '我能看见一朵花。', hook: '佩妮弯下腰闻花香' }
  },
  bee: {
    sound: '比 → 「蜜」蜂 bee',
    parts: 'b + ee → 两个 e 像两只翅膀',
    scene: { bg: 'park', cast: ['penny', 'tommy'], prop: '🐝', line: 'I can see a bee.', lineCn: '我能看见一只蜜蜂。', hook: '蜜蜂嗡嗡绕着花飞' }
  },

  /* ---------------- 补充：节日 ---------------- */
  Christmas: {
    sound: '克里斯马斯 → 「圣诞」节',
    parts: 'Christ（基督）+ mas（弥撒）',
    scene: { bg: 'home', cast: ['penny', 'tommy', 'mummy'], prop: '🎄', line: 'Happy Christmas!', lineCn: '圣诞快乐！', hook: '圣诞树上挂满灯' }
  },
  card: {
    sound: '卡德 → 「卡」片',
    parts: 'c + ard → 一张硬硬的纸',
    scene: { bg: 'home', cast: ['penny'], prop: '💌', line: 'This is a card.', lineCn: '这是一张贺卡。', hook: '佩妮在贺卡上画画' }
  },
  bell: {
    sound: '贝尔 → 「铃」铛',
    parts: 'b + ell → 和 well 押韵，铃声响 well',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '🔔', line: 'This is a bell.', lineCn: '这是一个铃铛。', hook: '摇一摇铃铛叮当响' }
  },
  star: {
    sound: '斯塔 → 「星」星',
    parts: 'st + ar → 五个角一闪闪',
    scene: { bg: 'night', cast: ['penny'], prop: '⭐', line: 'I can see a star.', lineCn: '我能看见一颗星星。', hook: '夜空里一颗亮亮的星' }
  },
  party: {
    sound: '帕提 → 「派对」party',
    parts: 'part（部分）+ y → 大家一起的部分',
    scene: { bg: 'home', cast: ['penny', 'tommy', 'mummy', 'daddy'], prop: '🎈', line: 'Let us have a party.', lineCn: '我们来开派对吧。', hook: '吹气球挂彩带' }
  },
  umbrella: {
    sound: '安布雷拉 → 「伞」撑起来',
    parts: 'umbr + ella → 像蘑菇的形状',
    scene: { bg: 'rain', cast: ['penny', 'daddy'], prop: '☂️', line: 'I have an umbrella.', lineCn: '我有一把伞。', hook: '雨里撑起大伞' }
  },

  /* ---------------- 补充：天气 / 时间 ---------------- */
  hot: {
    sound: '哈特 → 「热」得哈气',
    parts: '三个字母，和 hat 只差一个',
    scene: { bg: 'garden', cast: ['penny'], prop: '🥵', line: 'It is hot.', lineCn: '很热。', hook: '太阳底下佩妮出汗' }
  },
  cold: {
    sound: '扣德 → 「冷」得发抖',
    parts: 'c + old → 老人（old）怕冷',
    scene: { bg: 'snow', cast: ['penny', 'tommy'], prop: '🥶', line: 'It is cold.', lineCn: '很冷。', hook: '雪天冻得缩起来' }
  },
  time: {
    sound: '泰姆 → 「时」间',
    parts: 't + ime → 和 dime（硬币）押韵',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '⏰', line: 'It is time to sleep.', lineCn: '该睡觉了。', hook: '妈妈指着钟说 time' }
  },
  eleven: {
    sound: '伊莱文 → 「十一」',
    parts: 'e + leven → 一十加一',
    scene: { bg: 'home', cast: ['penny'], prop: '1️⃣1️⃣', line: 'It is eleven o\'clock.', lineCn: '十一点了。', hook: '时钟指到 11' }
  },
  twelve: {
    sound: '推尔夫 → 「十二」',
    parts: 'tw + elve → 两个五加二',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '1️⃣2️⃣', line: 'It is twelve o\'clock.', lineCn: '十二点了。', hook: '时钟指到 12，该吃午饭' }
  },
  fifteen: {
    sound: '费夫提恩 → 「十五」',
    parts: 'five + teen → 五是 five',
    scene: { bg: 'home', cast: ['penny'], prop: '1️⃣5️⃣', line: 'It is fifteen.', lineCn: '十五了。', hook: '时钟走到 3' }
  },
  twenty: {
    sound: '推恩提 → 「二十」',
    parts: 'two + ty → 两个十',
    scene: { bg: 'home', cast: ['penny'], prop: '2️⃣0️⃣', line: 'It is twenty.', lineCn: '二十了。', hook: '数到二十' }
  },

  /* ---------------- 补充：我的一天 / 一周 ---------------- */
  'get up': {
    sound: '盖特 阿普 → 「起」床',
    parts: 'get（得到）+ up（向上）→ 从床上起来',
    scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '⏰', line: 'I get up at seven.', lineCn: '我七点起床。', hook: '闹钟响，佩妮爬起来' }
  },
  'eat breakfast': {
    sound: '伊特 布莱克福斯特 → 吃早饭',
    parts: 'eat（吃）+ breakfast（早饭）',
    scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '🍳', line: 'I eat breakfast at seven.', lineCn: '我七点吃早饭。', hook: '桌上牛奶和面包' }
  },
  'go to school': {
    sound: '够 图 斯库 → 去上学',
    parts: 'go（去）+ to + school（学校）',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🎒', line: 'I go to school at eight.', lineCn: '我八点去上学。', hook: '背着书包挥手再见' }
  },
  'eat lunch': {
    sound: '伊特 朗奇 → 吃午饭',
    parts: 'eat（吃）+ lunch（午饭）',
    scene: { bg: 'kitchen', cast: ['penny', 'tommy'], prop: '🍱', line: 'I eat lunch at twelve.', lineCn: '我十二点吃午饭。', hook: '打开饭盒吃饭' }
  },
  'go home': {
    sound: '够 厚姆 → 回家',
    parts: 'go（去）+ home（家）',
    scene: { bg: 'garden', cast: ['penny', 'daddy'], prop: '🏠', line: 'I go home at four.', lineCn: '我四点回家。', hook: '爸爸来接，一起走回家' }
  },
  'go to bed': {
    sound: '够 图 贝德 → 去睡觉',
    parts: 'go（去）+ to + bed（床）',
    scene: { bg: 'night', cast: ['penny', 'mummy'], prop: '🛏️', line: 'I go to bed at nine.', lineCn: '我九点睡觉。', hook: '妈妈关灯盖被子' }
  },
  Tuesday: {
    sound: '推兹迪 → 「周二」',
    parts: 'Tues（战神）+ day（日）→ 战神日',
    scene: { bg: 'home', cast: ['penny'], prop: '📅', line: 'It is Tuesday.', lineCn: '今天是星期二。', hook: '日历翻到周二' }
  },
  Wednesday: {
    sound: '温兹迪 → 「周三」',
    parts: 'Wednes + day → 注意 d 不发音',
    scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '📅', line: 'It is Wednesday.', lineCn: '今天是星期三。', hook: '星期三上课中' }
  },
  Thursday: {
    sound: '瑟兹迪 → 「周四」',
    parts: 'Thurs（雷神）+ day（日）→ 雷神日',
    scene: { bg: 'home', cast: ['penny'], prop: '📅', line: 'It is Thursday.', lineCn: '今天是星期四。', hook: '日历翻到周四' }
  },
  Friday: {
    sound: '弗莱迪 → 「周五」',
    parts: 'Fri + day → 快放假了',
    scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '📅', line: 'It is Friday.', lineCn: '今天是星期五。', hook: '放学欢呼，明天周末' }
  }
});

/* ============ 大班档（英语起步）专用词汇：图大字少，联想优先 ============ */
Object.assign(MNEMONIC, {
  mud:        { sound: '马德 → 「马」踩进泥里', parts: 'm + ud → 三个字母，想到脚下软软的', scene: { bg: 'garden', cast: ['penny'], prop: '🟤', line: 'I like mud!', lineCn: '我喜欢泥巴！', hook: '佩妮一脚踩进泥坑' } },
  boots:      { sound: '布茨 → 「布」+「靴」', parts: 'boot + s → 一双', scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '👢', line: 'My boots are gold.', lineCn: '我的雨靴是金色的。', hook: '两人穿金雨靴跳泥坑' } },
  wet:        { sound: '威特 → 「湿」了不舒服', parts: '三个字母，和 water 开头都是 w', scene: { bg: 'garden', cast: ['penny', 'mummy'], prop: '💦', line: 'I am wet.', lineCn: '我湿了。', hook: '泥点溅了一身' } },
  rain:       { sound: '瑞恩 → 「雨」rain', parts: 'r + ain → 和 rain 的雨字一样', scene: { bg: 'rain', cast: ['penny'], prop: '🌧️', line: 'It is rainy.', lineCn: '下雨了。', hook: '雨滴打在窗上' } },
  splash:     { sound: '斯普拉什 → 「哗啦」溅水声', parts: 's + plash → 水花 plash 一声', scene: { bg: 'rain', cast: ['penny', 'tommy'], prop: '💧', line: 'Splash, splash!', lineCn: '哗啦，哗啦！', hook: '踩水，水花四溅' } },
  home:       { sound: '厚姆 → 「回」家', parts: 'h + ome → 和 welcome 一样给人一种暖', scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '🏠', line: 'Let us go home.', lineCn: '我们回家吧。', hook: '推开门，家里暖暖的' } },
  tail:       { sound: '推尔 → 「尾」巴摇摇', parts: 't + ail → 和 nail 押韵', scene: { bg: 'garden', cast: ['penny', 'dog'], prop: '🐕', line: 'Look at the tail!', lineCn: '看这条尾巴！', hook: '小狗摇尾巴' } },
  bye:        { sound: '拜 → 「拜」拜', parts: '三个字母，挥手时说', scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '👋', line: 'Bye-bye!', lineCn: '再见！', hook: '两人挥手告别' } },
  pond:       { sound: '庞德 → 「池」塘', parts: 'p + ond → 和 pond 里 p 像鸭子头', scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '💧', line: 'This is a pond.', lineCn: '这是一个池塘。', hook: '一池绿水，鸭子在里面' } },
  quack:      { sound: '夸克 → 鸭子「嘎」', parts: 'qu + ack → 学鸭子叫就是它', scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '📣', line: 'Quack, quack!', lineCn: '嘎嘎，嘎嘎！', hook: '佩妮学鸭子叫，鸭子回应' } },
  little:     { sound: '里头 → 「小」小的一点点', parts: 'litt + le → 两个 t 像两条小腿', scene: { bg: 'pond', cast: ['penny', 'duck'], prop: '🤏', line: 'A little duck.', lineCn: '一只小鸭子。', hook: '一只很小的鸭子在游' } },
  yummy:      { sound: '亚米 → 「好」吃！', parts: 'yum（好吃声）+ my', scene: { bg: 'kitchen', cast: ['penny'], prop: '😋', line: 'Yummy, yummy!', lineCn: '好吃，好吃！', hook: '吃完舔舔嘴巴' } },
  more:       { sound: '莫 → 「多」一点', parts: '四个字母，和 monster 开头同源', scene: { bg: 'kitchen', cast: ['penny', 'mummy'], prop: '➕', line: 'More, please!', lineCn: '请再来一点！', hook: '伸出空盘子要更多' } },
  eyes:       { sound: '爱兹 → 「爱」看东西的眼睛', parts: 'eye + s → 两只眼睛', scene: { bg: 'home', cast: ['penny'], prop: '👀', line: 'These are my eyes.', lineCn: '这是我的眼睛。', hook: '佩妮睁大眼睛看你' } },
  hands:      { sound: '汉兹 → 「手」', parts: 'hand + s → 两只手', scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '👐', line: 'Clap your hands.', lineCn: '拍拍手。', hook: '两人拍手打节奏' } },
  feet:       { sound: '费特 → 「脚」', parts: '和 foot 是一家的复数', scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '🦶', line: 'Stamp your feet.', lineCn: '跺跺脚。', hook: '一起跺脚咚咚响' } },
  teddy:      { sound: '泰迪 → 「泰迪」熊', parts: 'Ted（人名）+ dy → 小熊的名字', scene: { bg: 'night', cast: ['penny'], prop: '🧸', line: 'I have a teddy.', lineCn: '我有一只小熊。', hook: '抱着小熊睡觉' } },
  moon:       { sound: '姆恩 → 「月」亮', parts: 'm + oon → 两个 o 像月亮的圆', scene: { bg: 'night', cast: ['penny'], prop: '🌙', line: 'The moon is up.', lineCn: '月亮升起来了。', hook: '窗外的月亮又圆又亮' } },
  goodnight:  { sound: '古德奈特 → 「晚安」', parts: 'good（好）+ night（夜）', scene: { bg: 'night', cast: ['penny', 'mummy'], prop: '🌜', line: 'Goodnight, Mummy.', lineCn: '晚安，妈妈。', hook: '妈妈关灯说晚安' } },
  hungry:     { sound: '杭格瑞 → 「饿」得慌', parts: 'hunger（饿）+ y', scene: { bg: 'kitchen', cast: ['penny'], prop: '🍽️', line: 'I am hungry.', lineCn: '我饿了。', hook: '肚子咕咕叫，摸肚子' } },
  birthday:   { sound: '波斯得 → 「出生」的那天', parts: 'birth（出生）+ day（日）', scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '🎂', line: 'It is my birthday.', lineCn: '这是我的生日。', hook: '蛋糕上插着蜡烛' } },
  balloon:    { sound: '巴伦 → 「气」球', parts: 'ball（球）+ oon → 大大的球', scene: { bg: 'home', cast: ['penny', 'mummy'], prop: '🎈', line: 'I have a balloon.', lineCn: '我有一个气球。', hook: '气球飘到天花板' } },
  candle:     { sound: '坎豆 → 「蜡」烛', parts: 'cand + le → 和 candy（糖）开头像', scene: { bg: 'home', cast: ['penny', 'tommy'], prop: '🕯️', line: 'Blow the candle.', lineCn: '吹蜡烛。', hook: '蜡烛的火苗晃一下灭了' } },
  snow:       { sound: '斯诺 → 「雪」', parts: 's + now → 现在 now 下雪了', scene: { bg: 'snow', cast: ['penny'], prop: '❄️', line: 'I like snow.', lineCn: '我喜欢雪。', hook: '雪落在佩妮的鼻尖' } },
  warm:       { sound: '沃姆 → 「暖」和', parts: 'w + arm → 手臂 arm 被包住就是暖', scene: { bg: 'snow', cast: ['penny', 'mummy'], prop: '🧣', line: 'My hat is warm.', lineCn: '我的帽子很暖。', hook: '围上围巾，脸都红了' } },
  throw:      { sound: '斯娄 → 「扔」出去', parts: 'th + row → 一行 row 排开扔', scene: { bg: 'snow', cast: ['penny', 'tommy'], prop: '⚪', line: 'Throw the snow!', lineCn: '扔雪球！', hook: '雪球飞出去' } },
  laugh:      { sound: '拉夫 → 「笑」', parts: 'l + augh → 和 laugh 中的 h 不发音', scene: { bg: 'snow', cast: ['penny', 'tommy', 'mummy'], prop: '😆', line: 'We laugh and laugh.', lineCn: '我们笑个不停。', hook: '大家笑得直不起腰' } },
  slide:      { sound: '斯莱德 → 「滑」滑梯', parts: 's + lide → 和 slide 里的 slid（滑）', scene: { bg: 'park', cast: ['penny'], prop: '🛝', line: 'I can slide.', lineCn: '我会滑滑梯。', hook: '从滑梯嗖地滑下来' } },
  swing:      { sound: '斯温 → 「荡」秋千', parts: 's + wing → 像翅膀一样荡', scene: { bg: 'park', cast: ['penny', 'tommy'], prop: '🎠', line: 'I can swing.', lineCn: '我会荡秋千。', hook: '秋千越荡越高' } },
  high:       { sound: '海 → 「高」', parts: 'h + igh → 和 night 押韵', scene: { bg: 'park', cast: ['penny', 'daddy'], prop: '⬆️', line: 'Swing up high!', lineCn: '荡得高高的！', hook: '爸爸推秋千，荡得老高' } },
  tired:      { sound: '泰尔德 → 「累」了', parts: 'tire（累）+ d → 玩到没力气', scene: { bg: 'park', cast: ['penny', 'mummy'], prop: '😪', line: 'I am tired.', lineCn: '我累了。', hook: '佩妮坐在长椅上打哈欠' } },
  jump:       { sound: '江普 → 「跳」jump', parts: 'j + ump → 和 bump（撞）押韵，跳起来会 bump', scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '🦘', line: 'I can jump.', lineCn: '我会跳。', hook: '两人在泥坑里蹦' } },
  boots:      { sound: '布茨 → 「靴」子', parts: 'boot + s → 一双雨靴', scene: { bg: 'garden', cast: ['penny', 'tommy'], prop: '👢', line: 'My boots are gold.', lineCn: '我的雨靴是金色的。', hook: '两人穿金雨靴跳泥坑' } }
});

/* 档位说明：
 *   g2 = 二年级（补一年级漏洞 + 二年级新词）
 *   kg = 大班（英语起步，词少、句子短、动画更热闹）
 */
const LEVELS = {
  g2: { key: 'g2', name: '二年级', sub: '补一年级 · 学二年级', emoji: '👦', color: '#8ec8ff' },
  kg: { key: 'kg', name: '大班', sub: '英语起步 · 看图听音', emoji: '🧒', color: '#ffd166' }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MNEMONIC: MNEMONIC, LEVELS: LEVELS };
}
