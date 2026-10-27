
/* ================= 数据层：全部内容依据人教版七年级上册 ================= */
var IMG = {
  hero: "__ASSET_BASE__qMW27B4qFcFnSWSL3EcGXt.jpg",
  e1: "__ASSET_BASE__xhM6ZtrZnyt7N8BETgA0cy.jpg",
  e2: "__ASSET_BASE__csHRvcKXZe5Oq4CmNWZqpA.jpg",
  e3: "__ASSET_BASE__C9BAC69yr16SX0HKoGm11R.jpg",
  e4: "__ASSET_BASE__sO0E37jjR24DHvtBdP7gzv.jpg"
};

var ARTIFACTS = [
  { id:"a1", era:1, icon:"i-tooth", name:"元谋人门齿化石",
    date:"距今约 170 万年",
    story:"两颗门齿，把中国境内的人类史推到 170 万年前。它们出土于云南元谋，同层还发现打制石器和炭屑。",
    point:"元谋人是我国境内目前已知最早的古人类之一。" },
  { id:"a2", era:1, icon:"i-skull", name:"北京人头盖骨",
    date:"距今约 70 万—20 万年",
    story:"北京人的头盖骨低平、眉骨粗壮。周口店遗址中厚达数米的灰烬层说明：他们不仅会用天然火，还能长时间保存火种。",
    point:"用火的意义——取暖、照明、烤熟食物、驱赶野兽，是人类进化的重要一步。" },
  { id:"a3", era:1, icon:"i-bowl", name:"河姆渡猪纹陶钵",
    date:"距今约 7000 年",
    story:"陶钵外壁刻着一头憨态可掬的猪。它说明长江下游的先民已经饲养家畜、吃上稳定的米饭，还住进了架空的干栏式房屋。",
    point:"河姆渡：长江流域、水稻、干栏式建筑、养猪。" },
  { id:"a4", era:1, icon:"i-basin", name:"半坡人面鱼纹彩陶盆",
    date:"距今约 6000 年",
    story:"盆内人面与鱼纹交织，常被用作儿童瓮棺的棺盖。黄河中游的半坡人种粟、住半地穴式圆形房屋、烧制彩陶。",
    point:"半坡：黄河流域、粟、彩陶、半地穴式房屋。" },
  { id:"a5", era:1, icon:"i-jade", name:"良渚玉琮",
    date:"距今约 5300—4300 年",
    story:"玉琮外方内圆，刻着神人兽面纹，只出现在高等级墓葬里。它与良渚古城、大型水利工程一起，证明长江下游已经出现早期国家。",
    point:"良渚古城遗址是中华文明五千多年的实证。" },

  { id:"a6", era:2, icon:"i-jue", name:"二里头乳钉纹铜爵",
    date:"约公元前 21—前 16 世纪",
    story:"中国最早的青铜礼器之一，出土于河南偃师二里头。器壁薄而均匀，说明当时已掌握复合范铸造技术。",
    point:"二里头遗址被普遍认为是夏朝后期的都城遗址。" },
  { id:"a7", era:2, icon:"i-ding", name:"后母戊鼎",
    date:"商朝",
    story:"重 832.84 千克，是目前世界上出土最重的青铜器。铸造它需要两三百名工匠同时协作，是商朝国力与工艺的顶峰。",
    point:"商朝青铜铸造业高度发达，礼器是等级与权力的象征。" },
  { id:"a8", era:2, icon:"i-oracle", name:"甲骨卜辞",
    date:"商朝",
    story:"商王用火灼烧龟甲，看裂纹判断吉凶，再把结果刻上去。这就是甲骨文——我国已发现的年代最早、体系较为完整的文字。",
    point:"甲骨文与今天的汉字一脉相承，我国有文字可考的历史从商朝开始。" },
  { id:"a9", era:2, icon:"i-sword", name:"越王勾践剑",
    date:"春秋",
    story:"出土时寒光四射，剑身刻着「越王鸠浅自作用剑」。它见证了春秋诸侯争霸，也展示了吴越地区精湛的青铜工艺。",
    point:"春秋争霸：齐桓公、晋文公、楚庄王等相继称霸。" },

  { id:"a10", era:3, icon:"i-warrior", name:"秦始皇陵兵马俑",
    date:"秦朝",
    story:"八千个陶俑，没有一张脸重复。他们是秦始皇陵的陪葬军队，也是秦朝军事力量与组织能力的缩影。",
    point:"秦的统一：公元前 221 年，中国历史上第一个统一多民族封建国家建立。" },
  { id:"a11", era:3, icon:"i-coin", name:"秦半两钱",
    date:"秦朝",
    story:"圆形方孔，重十二铢。秦统一后，全国只用这一种钱——货币统一了，商旅才能走遍天下。",
    point:"秦始皇统一文字（小篆）、货币、度量衡，还统一车轨、修驰道。" },
  { id:"a12", era:3, icon:"i-lamp", name:"长信宫灯",
    date:"西汉",
    story:"宫女跪坐执灯，烟顺着衣袖进入灯体，室内不呛人。两千年前的环保设计，灯体还可以拆卸清洗。",
    point:"汉代手工业与审美达到很高水平；文景之治后国力恢复。" },
  { id:"a13", era:3, icon:"i-paper", name:"蔡侯纸",
    date:"东汉 · 105 年",
    story:"蔡伦用树皮、麻头、破布、旧渔网造纸。原料便宜了，纸才取代竹简，知识也从官府走进民间。",
    point:"造纸术是中国对世界文明的重大贡献之一。" },

  { id:"a14", era:4, icon:"i-buddha", name:"云冈石窟大佛",
    date:"北朝",
    story:"北魏皇室在山西大同凿山为窟，大佛高 17 米。它融合印度、西域与中原的造型，是民族交融留在石头上的证据。",
    point:"北朝石窟艺术（云冈、龙门）与佛教的盛行。" },
  { id:"a15", era:4, icon:"i-scroll", name:"《兰亭集序》",
    date:"东晋",
    story:"永和九年，王羲之与友人在兰亭饮酒赋诗，写下「天下第一行书」。全文二十多个「之」字，个个不同。",
    point:"王羲之被后人称为「书圣」，东晋书法成就极高。" },
  { id:"a16", era:4, icon:"i-vase", name:"南朝青瓷莲花尊",
    date:"南朝",
    story:"莲花瓣一层层堆叠，釉色青中透绿。随着江南地区开发，南朝的青瓷走进了更多寻常人家。",
    point:"江南开发的原因：北方人口南迁，带来劳动力、先进工具与技术。" }
];

var ERAS = [
  {
    id:1, unit:"第一单元", name:"史前时期", full:"史前时期：原始社会与中华文明的起源",
    period:"距今约 170 万年 — 约公元前 2070 年",
    img:IMG.e1, tint:"rgba(192,138,90,.16)",
    tags:["古人类","农业起源","良渚古城"],
    blurb:"没有文字，只有土层。这一站你要靠石器和灰烬判断：谁在什么时候学会了用火、种稻、造城——中华文明的第一块地基，就埋在这里。",
    keys:["北京人用火","河姆渡与半坡","良渚实证五千年"],
    cards:[
      { n:"课 1", t:"我们从哪里来", items:[
        "元谋人（约 170 万年）、蓝田人（约 160 万年）、郧县人（约 100 万年）是我国境内的代表古人类。",
        "<b>北京人</b>（约 70 万—20 万年）会打制石器、群体生活，<b>已经会使用天然火并保存火种</b>。",
        "山顶洞人（约 3 万年）会磨制骨针、缝制衣服，还会埋葬死者、佩戴装饰品。"
      ], point:"考点：北京人用火的意义；打制石器与磨制石器的区别。" },
      { n:"课 2", t:"一粒种子的革命", items:[
        "距今约 1 万年，长江、黄河流域的先民开始栽培<b>水稻、粟、黍</b>，并饲养家畜、磨制石器、烧制陶器。",
        "<b>河姆渡</b>（约 7000 年，长江下游）：水稻、干栏式建筑、养猪。",
        "<b>半坡</b>（约 6000 年，黄河中游）：粟、彩陶、半地穴式圆形房屋。"
      ], point:"考点：自然条件决定作物与房屋——南方潮湿架空，北方干燥穴居。" },
      { n:"课 3", t:"文明的门槛", items:[
        "<b>良渚古城</b>（约 5300—4300 年）：城墙、大型水利工程、玉琮玉钺，出现阶级分化，早期国家形成。",
        "<b>陶寺古城</b>（约 4300—4000 年）：观象台、大型墓葬，黄河中游的文明中心。",
        "传说中炎帝、黄帝被尊为中华民族的人文初祖；尧、舜、禹时期实行<b>禅让制</b>。"
      ], point:"考点：良渚遗址证明中华文明有五千多年历史；禅让制的含义。" }
    ],
    artifactIds:["a1","a2","a3","a4","a5"],
    game:{ type:"dig", title:"关卡一 · 考古探方", tip:"这是一片 20 格的探方。点击土层向下发掘：挖到国宝要回答一道鉴定题才能入袋，挖到陶片能得到线索。全部 5 件国宝出土即通关。" }
  },
  {
    id:2, unit:"第二单元", name:"夏商周时期", full:"夏商周时期：奴隶制王朝的更替和向封建社会的过渡",
    period:"约公元前 2070 年 — 公元前 221 年",
    img:IMG.e2, tint:"rgba(111,160,140,.16)",
    tags:["青铜器","甲骨文","百家争鸣"],
    blurb:"王朝一个接一个地换，青铜却越铸越大，字也第一次被刻进龟甲。到了春秋战国，铁犁翻开土地，思想家们在路上争吵——中国思想的黄金时代开始了。",
    keys:["分封制","商鞅变法","诸子百家"],
    cards:[
      { n:"课 4—5", t:"王朝的更替", items:[
        "约公元前 2070 年<b>禹建立夏朝</b>，启继位，<b>世袭制</b>取代禅让制；约公元前 1600 年汤灭夏建商，盘庚迁殷。",
        "公元前 1046 年<b>周武王灭商</b>，西周实行<b>分封制</b>与礼乐制；公元前 771 年西周灭亡，公元前 770 年平王东迁洛邑，春秋开始。",
        "春秋时期<b>铁制农具和牛耕</b>出现，诸侯争霸，齐桓公、晋文公、楚庄王等相继称霸。"
      ], point:"考点：分封制的目的（稳定周初政治形势、巩固疆土）与内容。" },
      { n:"课 6", t:"变法与战争", items:[
        "战国七雄：齐、楚、燕、韩、赵、魏、秦。战争规模更大，各国纷纷变法。",
        "公元前 356 年<b>商鞅在秦国变法</b>：确立县制、废除井田制、奖励耕织与军功、统一度量衡。",
        "公元前 256 年<b>李冰主持修建都江堰</b>，使成都平原成为「天府之国」。"
      ], point:"考点：商鞅变法使秦国富国强兵，为统一奠定基础。" },
      { n:"课 7—8", t:"百家争鸣", items:[
        "<b>老子</b>：顺应自然，无为而治；<b>孔子</b>：核心是「仁」，主张以德治国，创办私学、有教无类。",
        "<b>墨子</b>兼爱非攻；<b>孟子</b>主张仁政、民贵君轻；<b>荀子</b>主张礼治；<b>韩非</b>主张以法治国、建立中央集权。",
        "青铜器：<b>后母戊鼎</b>世界最重；<b>甲骨文</b>是我国已发现年代最早、体系较为完整的文字。"
      ], point:"考点：诸子百家与主张一一对应，选择题最爱在这里设陷阱。" }
    ],
    artifactIds:["a6","a7","a8","a9"],
    game:{ type:"match", title:"关卡二 · 百家争鸣茶话会", tip:"六位思想家坐在你对面，各说了一句话。先点左边的人物，再点右边的主张，配对成功即锁定。配错会抖一下，不扣分。" }
  },
  {
    id:3, unit:"第三单元", name:"秦汉时期", full:"秦汉时期：统一多民族封建国家的建立和巩固",
    period:"公元前 221 年 — 公元 220 年",
    img:IMG.e3, tint:"rgba(201,167,104,.16)",
    tags:["大一统","丝绸之路","造纸术"],
    blurb:"公元前 221 年，六国的城墙同时失效。文字、货币、车轮距被统一成一套标准，一个「大一统」的模板从此写进中国历史。再往西，驼队把丝绸运到了罗马。",
    keys:["中央集权","汉武帝巩固大一统","丝绸之路"],
    cards:[
      { n:"课 9—10", t:"秦的统一与崩塌", items:[
        "公元前 221 年<b>嬴政统一六国</b>，称「始皇帝」，建立中央集权制度：中央设三公，地方推行<b>郡县制</b>。",
        "统一<b>文字（小篆）、货币（半两钱）、度量衡</b>，统一车轨，修长城、开灵渠。",
        "秦的暴政（繁重徭役、赋税、严刑）激起反抗：公元前 209 年<b>陈胜、吴广起义</b>，公元前 207 年秦朝灭亡。"
      ], point:"考点：郡县制与分封制的区别；秦统一的意义与暴政。" },
      { n:"课 11—13", t:"汉的巩固", items:[
        "公元前 202 年<b>刘邦建立西汉</b>，休养生息；文帝、景帝时期出现<b>文景之治</b>。",
        "<b>汉武帝</b>：颁布推恩令削弱诸侯王，罢黜百家、尊崇儒术，盐铁官营，北击匈奴——大一统王朝得到巩固。",
        "东汉 25 年建立，光武中兴；后期外戚宦官交替专权，184 年<b>黄巾起义</b>爆发。"
      ], point:"考点：汉武帝巩固大一统的措施（政治、思想、经济、军事）。" },
      { n:"课 14—15", t:"丝路与纸张", items:[
        "公元前 138 年<b>张骞第一次出使西域</b>；公元前 60 年西汉设<b>西域都护府</b>，西域正式归属中央政权。",
        "丝绸之路：<b>长安 → 河西走廊 → 西域 → 中亚、西亚 → 大秦</b>；输出丝绸、漆器，输入良种马、香料、玻璃。",
        "105 年<b>蔡伦改进造纸术</b>；张仲景《伤寒杂病论》、华佗麻沸散、司马迁《史记》（纪传体通史）。"
      ], point:"考点：丝绸之路的路线与作用；西域都护府设立的意义。" }
    ],
    artifactIds:["a10","a11","a12","a13"],
    game:{ type:"silk", title:"关卡三 · 丝路商队", tip:"你带着一队骆驼从长安出发。按正确的顺序点亮沿途六个站点，每站都会告诉你一段丝路知识。点错会原地打转。" }
  },
  {
    id:4, unit:"第四单元", name:"三国两晋南北朝", full:"三国两晋南北朝时期：政权分立与民族交融",
    period:"公元 220 年 — 589 年",
    img:IMG.e4, tint:"rgba(207,82,55,.16)",
    tags:["三国鼎立","民族交融","江南开发"],
    blurb:"这是课本里政权更替最快的一段：三国、西晋、东晋、南朝、北朝轮番登场。但分裂的表层下，北方各族在通婚、改姓、说汉语，江南在开荒、烧瓷——融合与开发，才是这段历史真正的关键词。",
    keys:["赤壁之战","孝文帝改革","江南开发"],
    cards:[
      { n:"课 16", t:"三国鼎立", items:[
        "200 年<b>官渡之战</b>，曹操打败袁绍，统一北方；208 年<b>赤壁之战</b>，孙刘联军用火攻大败曹军。",
        "220 年曹丕建魏（洛阳）；221 年刘备建蜀汉（成都）；229 年孙权建吴（建业），<b>三国鼎立局面形成</b>。",
        "230 年孙权派<b>卫温率万人船队到达夷洲</b>（今台湾），这是大陆与台湾联系的最早记录之一。"
      ], point:"考点：赤壁之战的影响；三国建立的时间、人物与都城。" },
      { n:"课 17—19", t:"交融与开发", items:[
        "266 年西晋建立，280 年统一全国，316 年灭亡；北方各族大量内迁。",
        "383 年<b>淝水之战</b>，东晋以少胜多击败前秦；439 年<b>北魏统一北方</b>。",
        "<b>孝文帝改革</b>：494 年迁都洛阳，说汉语、穿汉服、改汉姓、与汉族通婚，促进民族交融。",
        "317 年东晋建立，420 年南朝开始；北方人口南迁带来劳动力与技术，<b>江南地区得到开发</b>。"
      ], point:"考点：孝文帝改革的内容与作用；江南开发的原因。" },
      { n:"课 20", t:"乱世里的科学艺术", items:[
        "<b>祖冲之</b>把圆周率精确到小数点后第七位（3.1415926—3.1415927），领先世界近千年。",
        "<b>贾思勰</b>《齐民要术》是我国现存最早的一部完整农书；<b>郦道元</b>《水经注》。",
        "<b>王羲之</b>《兰亭集序》被誉为「天下第一行书」；顾恺之擅画人物；云冈、龙门石窟开凿。"
      ], point:"考点：人物与成就对应；石窟艺术与佛教盛行、民族交融相关。" }
    ],
    artifactIds:["a14","a15","a16"],
    game:{ type:"chibi", title:"关卡四 · 赤壁之夜", tip:"三个决定，三次判断。选错会告诉你为什么不行，可以重选，直到走对为止。" }
  }
];

var TIMELINE = [
  { y:"距今约 170 万年", t:"元谋人", d:"云南元谋，我国境内目前已知最早的古人类之一。", x:"同层出土打制石器和炭屑，说明他们已会制造工具、可能已会用火。", u:1 },
  { y:"距今约 70 万—20 万年", t:"北京人", d:"周口店，会使用天然火并长时间保存火种。", x:"遗址中的灰烬层最厚达 6 米，这是用火最直接的证据——火让人类告别了生食与黑暗。", u:1 },
  { y:"距今约 1 万年", t:"农业起源", d:"长江、黄河流域开始栽培水稻、粟、黍。", x:"农业让人类定居下来，聚落、陶器、家畜随之出现，这是文明的地基。", u:1 },
  { y:"距今约 7000 年", t:"河姆渡遗址", d:"长江下游，种水稻、住干栏式建筑。", x:"干栏式房屋架空防潮，适合南方湿热气候；河姆渡人还养猪、制陶。", u:1 },
  { y:"距今约 5300—4300 年", t:"良渚古城", d:"长江下游出现早期国家，中华文明五千多年的实证。", x:"古城有城墙、大型水利系统，随葬玉琮玉钺的差别说明社会已分阶层。", u:1 },
  { y:"约公元前 2070 年", t:"夏朝建立", d:"禹建立夏朝，启继位，世袭制代替禅让制。", x:"「公天下」变为「家天下」，中国进入王朝时代。", u:2 },
  { y:"约公元前 1600 年", t:"商朝建立", d:"汤灭夏，盘庚迁殷，甲骨文与青铜器高度发达。", x:"甲骨文是我国已发现的年代最早、体系较为完整的文字。", u:2 },
  { y:"公元前 1046 年", t:"西周建立", d:"武王伐纣，实行分封制与礼乐制。", x:"分封制把土地和人民分给宗亲功臣，以巩固疆土；但诸侯坐大后，周王室衰落。", u:2 },
  { y:"公元前 770 年", t:"春秋开始", d:"平王东迁洛邑，诸侯争霸，铁犁牛耕出现。", x:"齐桓公「尊王攘夷」首霸，晋文公、楚庄王相继争雄。", u:2 },
  { y:"公元前 356 年", t:"商鞅变法", d:"秦国确立县制、奖励耕战，迅速富强。", x:"变法为秦统一六国奠定了经济与军事基础。", u:2 },
  { y:"公元前 221 年", t:"秦统一六国", d:"中国历史上第一个统一多民族封建国家建立。", x:"皇帝制度、三公、郡县制，统一文字货币度量衡——大一统的模板由此确立。", u:3 },
  { y:"公元前 138 年", t:"张骞出使西域", d:"凿空之旅，丝绸之路由此开通。", x:"公元前 60 年西汉设西域都护府，西域正式归属中央政权。", u:3 },
  { y:"105 年", t:"蔡伦改进造纸术", d:"纸逐渐取代竹简，成为主要书写材料。", x:"造纸术经阿拉伯人传入欧洲，是中国对世界文明的重大贡献。", u:3 },
  { y:"208 年", t:"赤壁之战", d:"孙刘联军火攻破曹，为三国鼎立奠定基础。", x:"曹操败退北方，无力南下；刘备取荆州、益州，孙权稳固江东。", u:4 },
  { y:"229 年", t:"三国鼎立形成", d:"魏（220）、蜀汉（221）、吴（229）相继建立。", x:"魏都洛阳、蜀都成都、吴都建业，三分天下之势定型。", u:4 },
  { y:"439 年", t:"北魏统一北方", d:"北朝开始，孝文帝改革推动民族交融。", x:"494 年迁都洛阳，说汉语、穿汉服、改汉姓、通婚，北方民族大交融。", u:4 },
  { y:"589 年", t:"南北朝结束", d:"隋灭陈，统一全国，分裂近四百年后重归一统。", x:"这一时期江南得到开发、民族深度交融，为隋唐盛世准备了条件。", u:4 }
];

var MATCH_PAIRS = [
  { p:"老子", c:"顺应自然，无为而治", e:"道家创始人，主张“道法自然”，认为万物运行有其规律。" },
  { p:"孔子", c:"核心是“仁”，以德治国，有教无类", e:"儒家创始人，创办私学，主张“为政以德”，被尊为至圣先师。" },
  { p:"墨子", c:"兼爱、非攻，提倡节俭", e:"墨家创始人，反对不义战争，代表下层劳动者利益。" },
  { p:"孟子", c:"实行“仁政”，民贵君轻", e:"儒家代表，提出“民为贵，社稷次之，君为轻”。" },
  { p:"庄子", c:"治国要顺应自然和民心，追求精神自由", e:"道家代表，强调事物的相对性，想象奇崛。" },
  { p:"韩非", c:"以法治国，建立中央集权专制统治", e:"法家集大成者，其思想被秦始皇采纳。" }
];

var SILK_STOPS = [
  { x:700, y:318, name:"长安", sub:"起点", fact:"西汉都城，丝绸之路的起点。从这里出发，商队要穿过河西走廊。" },
  { x:566, y:258, name:"敦煌", sub:"河西走廊", fact:"河西走廊是中原通往西域的咽喉，敦煌后来成为佛教艺术宝库。" },
  { x:438, y:236, name:"西域", sub:"今新疆", fact:"公元前 60 年西汉设西域都护府，西域正式归属中央政权。" },
  { x:300, y:196, name:"中亚", sub:"大宛、安息", fact:"这里的良种马、苜蓿、葡萄传入中原，中原的丝绸与冶铁技术传向西方。" },
  { x:176, y:176, name:"西亚", sub:"安息", fact:"安息是丝路中转贸易的重要枢纽，中国的丝绸在这里被转卖到更远的西方。" },
  { x:62, y:118, name:"大秦", sub:"罗马", fact:"大秦即罗马帝国。丝绸在罗马贵如黄金，成为贵族身份的象征。" }
];

var CHIBI_ROUNDS = [
  { story:"建安十三年秋，曹操率二十余万大军南下，荆州不战而降。军帐里，周瑜把地图推到你面前：<b>“第一仗，怎么打？”</b>",
    q:"你的第一步是——",
    opts:[
      { t:"正面决战，以三万对二十万", ok:false, fb:"兵力相差悬殊，硬拼正中曹操下怀。曹操要的正是速战速决。" },
      { t:"联合刘备，共抗曹操", ok:true, fb:"孙刘联军约五万人，虽仍处劣势，但握有长江天险与熟悉水战的优势。" },
      { t:"开城投降，保存实力", ok:false, fb:"投降就没有后面的历史了。孙刘的选择是联合抗曹，这才有了赤壁之战。" }
    ] },
  { story:"曹军多为北方人，不习水战，晕船严重。曹操下令<b>把战船用铁索连在一起</b>，人马在船上如履平地。",
    q:"你看出这个机会了吗？",
    opts:[
      { t:"派陆军绕后偷袭", ok:false, fb:"曹军陆军强大，绕后反而危险。真正的破绽在江面上。" },
      { t:"用火攻——船连在一起，一烧就是一片", ok:true, fb:"连环船解决了晕船，却失去了机动。火攻，是唯一能以少胜多的打法。" },
      { t:"等曹军粮尽自行撤退", ok:false, fb:"曹军粮草充足，等下去只会让联军先撑不住。" }
    ] },
  { story:"万事俱备，只欠东风。隆冬的长江上刮的是西北风，火一点，烧的是自己的船。",
    q:"怎么把火送到曹营？",
    opts:[
      { t:"硬冲过去放火", ok:false, fb:"曹军箭雨之下，冲不到一半船就沉了。" },
      { t:"让黄盖诈降，用装满柴草的战船靠近曹营", ok:true, fb:"黄盖写信诈降，率十艘蒙冲斗舰装满干柴膏油，趁东南风起直驶曹营，火借风势，连环船瞬间成片燃烧。" },
      { t:"放弃火攻，改为长期对峙", ok:false, fb:"放弃火攻，联军将被耗死。历史选择了那把火。" }
    ] }
];

var CHIBI_END = "赤壁一战，曹军大败北撤，短期内无力南下；刘备趁机取得荆州、益州，孙权稳固江东。三分天下之势初成——220 年魏、221 年蜀汉、229 年吴相继建立，三国鼎立局面正式形成。";

var QUIZ = [
  { u:1, q:"我国境内目前已知最早的古人类之一，距今约 170 万年的是", o:["元谋人","北京人","山顶洞人","半坡人"], a:0, e:"元谋人距今约 170 万年，出土于云南元谋；蓝田人约 160 万年、郧县人约 100 万年。" },
  { u:1, q:"北京人遗址中最能说明他们已经会用火的是", o:["大量打制石器","厚达数米的灰烬层","成堆的稻谷","彩陶残片"], a:1, e:"灰烬层说明北京人不仅使用天然火，还能长时间保存火种。" },
  { u:1, q:"河姆渡遗址居民主要种植的农作物是", o:["粟","水稻","小麦","玉米"], a:1, e:"河姆渡位于长江下游，种水稻；黄河流域的半坡人种粟。" },
  { u:1, q:"半坡居民建造半地穴式圆形房屋，主要是因为", o:["气候湿热多雨","黄土高原干燥寒冷，利于保暖","便于捕捞鱼虾","为了防御洪水"], a:1, e:"房屋形制由自然条件决定：南方湿热架空防潮，北方干燥寒冷半地穴保暖。" },
  { u:1, q:"良渚古城遗址的发掘最重要的历史意义是", o:["证明商朝已存在","证明中华文明有五千多年历史","证明铁器已普遍使用","证明甲骨文已成熟"], a:1, e:"良渚古城有城墙、水利工程和阶级分化，是中华文明五千多年的实证。" },
  { u:2, q:"西周实行分封制的主要目的是", o:["发展农业生产","稳定周初政治形势、巩固疆土","加强思想控制","促进商业交换"], a:1, e:"周王把土地和人民分给宗亲、功臣，让他们镇守疆土、拱卫王室。" },
  { u:2, q:"我国已发现的年代最早、体系较为完整的文字是", o:["金文","小篆","甲骨文","隶书"], a:2, e:"甲骨文是商朝刻在龟甲和兽骨上的文字，与今天的汉字一脉相承。" },
  { u:2, q:"春秋时期第一个称霸中原的诸侯是", o:["晋文公","齐桓公","楚庄王","秦穆公"], a:1, e:"齐桓公任用管仲改革，打出“尊王攘夷”旗号，成为春秋首霸。" },
  { u:2, q:"商鞅变法中，最能体现加强中央集权的措施是", o:["奖励耕织","确立县制，由国君直接派官吏治理","统一度量衡","奖励军功"], a:1, e:"确立县制使国君直接控制地方，是中央集权的重要一步。" },
  { u:2, q:"战国时期主持修建都江堰的是", o:["李冰","商鞅","管仲","郑国"], a:0, e:"公元前 256 年，秦国蜀郡太守李冰主持修建都江堰，使成都平原成为“天府之国”。" },
  { u:2, q:"主张“兼爱”“非攻”，反对不义战争的思想家是", o:["孟子","庄子","墨子","荀子"], a:2, e:"墨子主张兼爱、非攻、尚贤、节俭，代表下层劳动者的利益。" },
  { u:2, q:"目前世界上出土最重的青铜器是", o:["四羊方尊","后母戊鼎","三星堆青铜面具","毛公鼎"], a:1, e:"后母戊鼎重 832.84 千克，是商朝青铜铸造水平的代表。" },
  { u:3, q:"秦朝在地方推行的行政制度是", o:["分封制","郡县制","行省制","禅让制"], a:1, e:"秦朝废分封、行郡县，郡县长官由朝廷直接任免，加强中央集权。" },
  { u:3, q:"秦统一后作为标准文字在全国推行的是", o:["甲骨文","金文","小篆","楷书"], a:2, e:"秦始皇统一文字，以小篆作为标准文字，有利于文化交流与国家统一。" },
  { u:3, q:"中国历史上第一次大规模农民起义是", o:["黄巾起义","陈胜、吴广起义","绿林起义","赤壁之战"], a:1, e:"公元前 209 年，陈胜、吴广在大泽乡起义，喊出“王侯将相宁有种乎”。" },
  { u:3, q:"汉武帝为削弱诸侯王势力采取的措施是", o:["颁布推恩令","实行分封制","推行郡县制","设立西域都护"], a:0, e:"推恩令让诸侯王的封地分给子弟，越分越小，中央集权得到加强。" },
  { u:3, q:"西汉设置西域都护府的时间是", o:["公元前 138 年","公元前 119 年","公元前 60 年","公元 73 年"], a:2, e:"公元前 60 年，西汉设西域都护府，标志着西域正式归属中央政权。" },
  { u:3, q:"丝绸之路的起点是", o:["洛阳","长安","敦煌","成都"], a:1, e:"丝绸之路从长安出发，经河西走廊、西域，通往中亚、西亚，直到大秦。" },
  { u:3, q:"改进造纸术，用树皮、麻头等原料造纸的是", o:["蔡伦","张衡","华佗","司马迁"], a:0, e:"105 年，东汉蔡伦改进造纸术，纸的成本降低，逐渐成为主要书写材料。" },
  { u:4, q:"赤壁之战中，孙刘联军取胜的关键战术是", o:["火攻","围城","水淹","断粮"], a:0, e:"黄盖诈降、火船突袭，火借风势烧毁曹军连环船，联军以少胜多。" },
  { u:4, q:"三国鼎立局面正式形成的标志是", o:["赤壁之战","曹丕称帝建魏","229 年孙权称帝建吴","官渡之战"], a:2, e:"220 年魏、221 年蜀汉、229 年吴相继建立，三国鼎立局面形成。" },
  { u:4, q:"淝水之战的交战双方是", o:["前秦与东晋","曹操与袁绍","北魏与南朝","西晋与吴国"], a:0, e:"383 年，东晋以少胜多击败前秦，前秦统治瓦解，北方再度分裂。" },
  { u:4, q:"北魏孝文帝改革的重要措施是", o:["迁都洛阳、推行汉化","实行分封制","创立科举制","废除郡县制"], a:0, e:"494 年迁都洛阳，推行说汉语、穿汉服、改汉姓、通婚等措施，促进民族交融。" },
  { u:4, q:"把圆周率精确到小数点后第七位的数学家是", o:["祖冲之","贾思勰","郦道元","王羲之"], a:0, e:"祖冲之算出圆周率在 3.1415926 与 3.1415927 之间，领先世界近千年。" },
  { u:4, q:"被誉为“天下第一行书”的《兰亭集序》作者是", o:["顾恺之","王羲之","曹操","陶渊明"], a:1, e:"东晋王羲之被称为“书圣”，《兰亭集序》是其代表作。" },
  { u:4, q:"江南地区在魏晋南北朝时期得到开发的最主要原因是", o:["南方自然条件优越","北方人口大量南迁，带来劳动力和先进技术","南方政权重视商业","海外贸易发达"], a:1, e:"北方战乱，人口南迁带来劳动力、工具与技术，加上南方自然条件优越，江南得到开发。" }
];

var RANKS = [
  { min:18, name:"文明守护者", note:"你不仅记住了知识点，还读懂了它们之间的联系。可以去给同学讲课了。" },
  { min:14, name:"优秀考古队员", note:"主干知识已经扎实，把错题的解析再看一遍，就接近满分了。" },
  { min:10, name:"见习发掘员", note:"方向对了。建议回到时间轴，把四个单元的先后顺序再捋一遍。" },
  { min:0,  name:"刚入队的新手", note:"别急，先玩一遍四个关卡，再回来答题，你会发现题目变简单了。" }
];

/* ================= 交互层 ================= */
(function () {
  "use strict";

  var KEY = "gswbj_v1";
  var state = { found: [], done: {}, best: 0, sound: true };

  /* ---------- storage ---------- */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === "object") {
        if (Array.isArray(o.found)) state.found = o.found.filter(function (x) { return typeof x === "string"; });
        if (o.done && typeof o.done === "object") state.done = o.done;
        if (typeof o.best === "number") state.best = o.best;
        if (typeof o.sound === "boolean") state.sound = o.sound;
      }
    } catch (e) { /* 首次访问或隐私模式，忽略 */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 忽略存储失败 */ }
  }

  /* ---------- dom helpers ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function svgIcon(id, cls) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (cls) svg.setAttribute("class", cls);
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function $(id) { return document.getElementById(id); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  /* 只识别 <b> 标记，其余全部按纯文本处理，避免注入 */
  function richText(str) {
    var frag = document.createDocumentFragment();
    var re = /<b>([\s\S]*?)<\/b>/g, last = 0, m;
    while ((m = re.exec(str))) {
      if (m.index > last) frag.appendChild(document.createTextNode(str.slice(last, m.index)));
      var b = document.createElement("b");
      b.textContent = m[1];
      frag.appendChild(b);
      last = re.lastIndex;
    }
    if (last < str.length) frag.appendChild(document.createTextNode(str.slice(last)));
    return frag;
  }

  /* ---------- sound ---------- */
  var ac = null;
  function tone(freq, dur, type, gain) {
    if (!state.sound) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(gain || 0.06, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* 音频不可用时静默 */ }
  }
  function sfx(kind) {
    if (!state.sound) return;
    if (kind === "click") tone(520, 0.07, "sine", 0.035);
    else if (kind === "ok") { tone(660, 0.12, "sine", 0.05); setTimeout(function () { tone(880, 0.16, "sine", 0.045); }, 90); }
    else if (kind === "bad") tone(180, 0.18, "triangle", 0.04);
    else if (kind === "win") { tone(523, 0.14, "sine", 0.05); setTimeout(function () { tone(659, 0.14, "sine", 0.05); }, 120); setTimeout(function () { tone(784, 0.24, "sine", 0.05); }, 250); }
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2400);
  }

  /* ---------- modal ---------- */
  var modal = $("modal"), modalCard = $("modalCard");
  function openModal(node) {
    clear(modalCard);
    var close = el("button", "modal-close", "×");
    close.setAttribute("aria-label", "关闭");
    close.addEventListener("click", closeModal);
    modalCard.appendChild(close);
    modalCard.appendChild(node);
    modal.classList.add("on");
  }
  function closeModal() { modal.classList.remove("on"); }
  modal.addEventListener("click", function (e) {
    if (e.target && e.target.hasAttribute && e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  /* ---------- progress ---------- */
  function has(id) { return state.found.indexOf(id) > -1; }
  function eraArts(era) {
    var out = [];
    ARTIFACTS.forEach(function (a) { if (a.era === era) out.push(a); });
    return out;
  }
  function addArtifact(id) {
    if (has(id)) return false;
    state.found.push(id);
    save();
    refreshProgress();
    return true;
  }
  function refreshProgress() {
    var n = state.found.length;
    var bc = $("bagCount");
    if (bc) bc.textContent = String(n);
    var cn = $("collNum");
    if (cn) cn.textContent = String(n);
    var cb = $("collBar");
    if (cb) cb.style.width = (n / 16 * 100) + "%";
    var cp = $("collPct");
    if (cp) cp.textContent = Math.round(n / 16 * 100) + "%";
    document.querySelectorAll("[data-era-prog]").forEach(function (bar) {
      var era = Number(bar.getAttribute("data-era-prog"));
      var list = eraArts(era), got = 0;
      list.forEach(function (a) { if (has(a.id)) got++; });
      bar.style.width = (list.length ? got / list.length * 100 : 0) + "%";
      var lab = document.querySelector('[data-era-lab="' + era + '"]');
      if (lab) lab.textContent = got + "/" + list.length;
    });
  }

  /* ---------- map ---------- */
  function renderMap() {
    var grid = $("mapGrid");
    clear(grid);
    ERAS.forEach(function (era) {
      var card = el("a", "map-card reveal");
      card.href = "#era-" + era.id;
      var thumb = el("div", "thumb");
      var img = el("img");
      img.src = era.img;
      img.alt = era.full;
      img.loading = "lazy";
      img.width = 132; img.height = 196;
      thumb.appendChild(img);
      var body = el("div", "map-body");
      body.appendChild(el("div", "map-no", era.unit));
      body.appendChild(el("h3", "", era.name));
      body.appendChild(el("div", "map-period", era.period));
      var tags = el("div", "map-tags");
      era.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      body.appendChild(tags);
      var foot = el("div", "map-foot");
      var prog = el("div", "prog");
      var bar = el("div", "bar");
      var fill = el("i");
      fill.setAttribute("data-era-prog", String(era.id));
      bar.appendChild(fill);
      var lab = el("span", "", "0/" + era.artifactIds.length);
      lab.setAttribute("data-era-lab", String(era.id));
      prog.appendChild(bar); prog.appendChild(lab);
      var go = el("span", "go", "进入第 " + era.id + " 站 →");
      foot.appendChild(prog); foot.appendChild(go);
      body.appendChild(foot);
      card.appendChild(thumb); card.appendChild(body);
      grid.appendChild(card);
    });
    refreshProgress();
  }

  /* ---------- timeline ---------- */
  var tlFilterDefs = [{ k: 0, n: "全部" }, { k: 1, n: "史前" }, { k: 2, n: "夏商周" }, { k: 3, n: "秦汉" }, { k: 4, n: "三国两晋南北朝" }];
  function renderTimeline() {
    var box = $("tl");
    clear(box);
    box.appendChild(el("div", "tl-rail"));
    var lastUnit = 0;
    TIMELINE.forEach(function (item, i) {
      if (item.u !== lastUnit) {
        lastUnit = item.u;
        var band = el("div", "tl-band");
        band.appendChild(el("span", "", ERAS[item.u - 1].unit + " · " + ERAS[item.u - 1].name));
        var em = el("em", "", ERAS[item.u - 1].period);
        band.appendChild(em);
        box.appendChild(band);
      }
      var node = el("div", "tl-node" + (i % 2 ? " rev" : ""));
      node.setAttribute("data-unit", String(item.u));
      var dot = el("div", "tl-dot");
      var card = el("div", "tl-card");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.appendChild(el("div", "tl-year", item.y));
      card.appendChild(el("div", "tl-name", item.t));
      card.appendChild(el("div", "tl-desc", item.d));
      var detail = el("div", "tl-detail");
      detail.appendChild(el("b", "", "展开看看："));
      detail.appendChild(document.createTextNode(" " + item.x));
      card.appendChild(detail);
      card.appendChild(el("div", "tl-tip", "点击展开"));
      function toggle() {
        node.classList.toggle("open");
        sfx("click");
        card.querySelector(".tl-tip").textContent = node.classList.contains("open") ? "点击收起" : "点击展开";
      }
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      node.appendChild(card);
      node.appendChild(dot);
      box.appendChild(node);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    box.querySelectorAll(".tl-node").forEach(function (n) { io.observe(n); });
    renderTlFilter();
  }
  var tlUnit = 0;
  function renderTlFilter() {
    var f = $("tlFilter");
    clear(f);
    tlFilterDefs.forEach(function (d) {
      var b = el("button", "chip" + (tlUnit === d.k ? " on" : ""), d.n);
      b.type = "button";
      b.addEventListener("click", function () {
        tlUnit = d.k;
        sfx("click");
        renderTlFilter();
        document.querySelectorAll(".tl-node").forEach(function (n) {
          n.style.display = (tlUnit === 0 || Number(n.getAttribute("data-unit")) === tlUnit) ? "" : "none";
        });
      });
      f.appendChild(b);
    });
  }

  /* ---------- artifact modal ---------- */
  function openArtifact(a) {
    var box = el("div");
    box.appendChild(el("div", "m-era", "第 " + a.era + " 站 · " + ERAS[a.era - 1].name));
    box.appendChild(el("h3", "", a.name));
    box.appendChild(el("div", "m-date", a.date));
    var ic = el("div", "m-icon");
    ic.appendChild(svgIcon(a.icon));
    box.appendChild(ic);
    box.appendChild(el("p", "", a.story));
    var p = el("div", "m-point");
    p.appendChild(el("b", "", "记住这一条： "));
    p.appendChild(document.createTextNode(a.point));
    box.appendChild(p);
    openModal(box);
    sfx("click");
  }

  /* ---------- eras ---------- */
  function renderEras() {
    var wrap = $("eraWrap");
    clear(wrap);
    ERAS.forEach(function (era) {
      var sec = el("section", "era");
      sec.id = "era-" + era.id;
      sec.style.setProperty("--tint", era.tint);
      var glow = el("div", "era-glow");
      sec.appendChild(glow);
      var w = el("div", "wrap");

      var head = el("div", "era-head" + (era.id % 2 === 0 ? " rev" : ""));
      var copy = el("div", "era-copy reveal");
      copy.appendChild(el("div", "era-no", era.unit + " / 第 " + era.id + " 站"));
      copy.appendChild(el("h2", "", era.full));
      copy.appendChild(el("div", "era-period", era.period));
      copy.appendChild(el("p", "era-blurb", era.blurb));
      var keys = el("div", "era-keys");
      era.keys.forEach(function (k) { keys.appendChild(el("span", "key", k)); });
      copy.appendChild(keys);

      var fig = el("figure", "era-figure reveal");
      var im = el("img");
      im.src = era.img; im.alt = era.full; im.loading = "lazy";
      im.width = 700; im.height = 438;
      fig.appendChild(im);
      fig.appendChild(el("figcaption", "", "时代氛围示意 · AI 绘制，非文物复原图"));

      head.appendChild(copy); head.appendChild(fig);
      w.appendChild(head);

      var cards = el("div", "cards3");
      era.cards.forEach(function (c, ci) {
        var kc = el("article", "kcard reveal");
        kc.appendChild(el("div", "kn", c.n));
        kc.appendChild(el("h4", "", c.t));
        var ul = el("ul");
        c.items.forEach(function (t) {
          var li = el("li");
          li.appendChild(richText(t));
          ul.appendChild(li);
        });
        kc.appendChild(ul);
        kc.appendChild(el("div", "kpoint", c.point));
        cards.appendChild(kc);
        kc.style.transitionDelay = (ci * 60) + "ms";
      });
      w.appendChild(cards);

      var game = el("div", "game");
      var gh = el("div", "game-head");
      var gl = el("div", "game-label", "互动关卡");
      var h3 = el("h3", "", era.game.title);
      var gs = el("div", "game-status");
      gs.setAttribute("data-game-status", String(era.id));
      gs.textContent = "未通关";
      gh.appendChild(gl); gh.appendChild(h3); gh.appendChild(gs);
      var gb = el("div", "game-body");
      gb.setAttribute("data-game-body", String(era.id));
      game.appendChild(gh); game.appendChild(gb);
      w.appendChild(game);

      sec.appendChild(w);
      wrap.appendChild(sec);

      if (state.done["e" + era.id]) {
        renderGameDone(era, gb);
      } else if (era.game.type === "dig") initDig(era, gb);
      else if (era.game.type === "match") initMatch(era, gb);
      else if (era.game.type === "silk") initSilk(era, gb);
      else if (era.game.type === "chibi") initChibi(era, gb);
      updateGameStatus(era.id);
    });
  }

  function updateGameStatus(id) {
    var s = document.querySelector('[data-game-status="' + id + '"]');
    if (s) s.textContent = state.done["e" + id] ? "已通关 ✓" : "未通关";
  }
  function setStatus(id, txt) {
    var s = document.querySelector('[data-game-status="' + id + '"]');
    if (s) s.textContent = txt;
  }

  function finishGame(era, msg, note) {
    state.done["e" + era.id] = true;
    era.artifactIds.forEach(function (id) { addArtifact(id); });
    save();
    var body = document.querySelector('[data-game-body="' + era.id + '"]');
    if (body) renderGameDone(era, body, msg, note);
    updateGameStatus(era.id);
    refreshProgress();
    renderCollection();
    renderAward();
    sfx("win");
    toast("通关！" + era.artifactIds.length + " 件国宝已入袋");
  }

  function renderGameDone(era, body, msg, note) {
    clear(body);
    var d = el("div", "game-done");
    d.appendChild(el("div", "seal", "通"));
    d.appendChild(el("h4", "", msg || "这一站，通关了"));
    d.appendChild(el("p", "", note || "你已收集齐本站 " + era.artifactIds.length + " 件国宝，继续往下一个时代走。"));
    var loot = el("div", "done-loot");
    era.artifactIds.forEach(function (id) {
      var a = ARTIFACTS.filter(function (x) { return x.id === id; })[0];
      if (!a) return;
      var chip = el("span");
      chip.appendChild(svgIcon(a.icon));
      chip.appendChild(document.createTextNode(a.name));
      loot.appendChild(chip);
    });
    d.appendChild(loot);
    var row = el("div", "btn-row");
    row.style.justifyContent = "center";
    var b = el("a", "btn btn-ghost btn-sm", "去图鉴看看");
    b.href = "#collection";
    row.appendChild(b);
    d.appendChild(row);
    body.appendChild(d);
  }

  /* ---------- game 1: dig ---------- */
  var DIG_Q = {
    a1: { q: "鉴定题：元谋人距今约多少年？", o: ["170 万年", "70 万年", "3 万年"], a: 0, e: "元谋人距今约 170 万年，是我国境内目前已知最早的古人类之一。" },
    a2: { q: "鉴定题：北京人遗址中的灰烬层说明什么？", o: ["会人工取火，但不会保存", "会使用天然火并长时间保存火种", "已经会用煤炭取暖"], a: 1, e: "厚达数米的灰烬层，说明北京人不仅用火，还能让火长时间不灭。" },
    a3: { q: "鉴定题：河姆渡人居住的房屋是？", o: ["半地穴式圆形房屋", "干栏式建筑", "窑洞"], a: 1, e: "长江下游潮湿多雨，干栏式建筑架空防潮，下层还可养牲畜。" },
    a4: { q: "鉴定题：半坡人主要种植的作物是？", o: ["水稻", "粟", "玉米"], a: 1, e: "半坡位于黄河流域，主要种粟；水稻是长江流域河姆渡人的作物。" },
    a5: { q: "鉴定题：良渚古城遗址说明什么？", o: ["长江下游已出现早期国家", "商朝已经建立", "铁器已经普及"], a: 0, e: "城墙、水利工程与随葬品的等级差别，说明当时已出现阶级与早期国家。" }
  };
  var DIG_LAYOUT = [
    { k: "a", i: 0 }, { k: "e" }, { k: "e" }, { k: "a", i: 1 },
    { k: "s" }, { k: "e" }, { k: "a", i: 2 }, { k: "e" },
    { k: "e" }, { k: "e" }, { k: "e" }, { k: "a", i: 3 },
    { k: "e" }, { k: "s" }, { k: "e" }, { k: "e" },
    { k: "a", i: 4 }, { k: "e" }, { k: "e" }, { k: "e" }
  ];
  function initDig(era, body) {
    clear(body);
    body.appendChild(el("p", "game-tip", era.game.tip));
    var arts = era.artifactIds.map(function (id) {
      return ARTIFACTS.filter(function (a) { return a.id === id; })[0];
    });
    var layout = el("div", "dig-layout");
    var grid = el("div", "dig-grid");
    var side = el("div", "dig-side");
    side.appendChild(el("h5", "", "出土清单"));
    side.appendChild(el("div", "sd", "5 件国宝 · 鉴定通过才入袋"));
    var list = el("ul", "dig-list");
    var rows = {};
    arts.forEach(function (a, i) {
      var li = el("li");
      li.setAttribute("data-art", a.id);
      list.appendChild(li);
      rows[a.id] = li;
    });
    side.appendChild(list);
    var counter = el("div", "sd");
    counter.style.marginTop = "12px";
    counter.style.color = "var(--gold)";
    side.appendChild(counter);
    var note = el("div", "dig-note");
    note.appendChild(el("b", "", "考古笔记"));
    note.appendChild(document.createTextNode("陶片密集的土层，附近常有国宝。挖到空坑也别急，考古本来就是九分空、一分宝。"));
    side.appendChild(note);

    function paintList() {
      var got = 0;
      arts.forEach(function (a, i) {
        var li = rows[a.id];
        if (!li) return;
        var ok = has(a.id);
        if (ok) got++;
        li.classList.toggle("got", ok);
        clear(li);
        var sn = el("span", "sn");
        if (ok) sn.appendChild(svgIcon(a.icon));
        else sn.textContent = String(i + 1).padStart(2, "0");
        li.appendChild(sn);
        var d = el("div");
        d.appendChild(el("b", "", ok ? a.name : "待鉴定"));
        d.appendChild(el("em", "", ok ? a.date : "尚未出土"));
        li.appendChild(d);
      });
      counter.textContent = "已出土 " + got + " / " + arts.length;
    }
    paintList();

    DIG_LAYOUT.forEach(function (cell, idx) {
      var c = el("button", "cell");
      c.type = "button";
      c.appendChild(el("span", "cn", String(idx + 1).padStart(2, "0")));
      var art = cell.k === "a" ? arts[cell.i] : null;
      var states = { dug: false };
      c.addEventListener("click", function () {
        if (states.dug) {
          if (art) openDigQ(art, c);
          return;
        }
        if (cell.k === "a" && art) {
          states.dug = true;
          c.classList.add("dug", "pop");
          var ic = svgIcon(art.icon);
          c.appendChild(ic);
          sfx("click");
          setTimeout(function () { openDigQ(art, c); }, 180);
        } else if (cell.k === "s") {
          states.dug = true;
          c.classList.add("empty");
          c.appendChild(el("span", "mark", "陶片"));
          sfx("bad");
          toast("一片绳纹陶片：这里有人长期生活过，继续挖！");
        } else {
          states.dug = true;
          c.classList.add("empty");
          c.appendChild(el("span", "mark", "空"));
          sfx("click");
        }
      });
      if (has(art ? art.id : "")) {
        states.dug = true;
        c.classList.add("dug");
        if (art) c.appendChild(svgIcon(art.icon));
      }
      grid.appendChild(c);
    });
    layout.appendChild(grid);
    layout.appendChild(side);
    body.appendChild(layout);

    function openDigQ(art, cellNode) {
      if (has(art.id)) { openArtifact(art); return; }
      var q = DIG_Q[art.id];
      var box = el("div");
      box.appendChild(el("div", "m-era", "国宝鉴定"));
      box.appendChild(el("h3", "", art.name));
      box.appendChild(el("div", "m-date", art.date));
      var ic = el("div", "m-icon");
      ic.appendChild(svgIcon(art.icon));
      box.appendChild(ic);
      var qp = el("p", "", q.q);
      qp.style.color = "var(--paper)";
      box.appendChild(qp);
      var opts = el("div", "opts");
      var feedback = el("div", "feedback");
      feedback.style.display = "none";
      var solved = false;
      q.o.forEach(function (text, i) {
        var b = el("button", "opt");
        b.type = "button";
        b.appendChild(el("span", "k", "ABCD".charAt(i)));
        b.appendChild(el("span", "", text));
        b.addEventListener("click", function () {
          if (solved) return;
          if (i === q.a) {
            solved = true;
            b.classList.add("right");
            Array.prototype.forEach.call(opts.children, function (n) { n.disabled = true; });
            feedback.style.display = "block";
            clear(feedback);
            var b1 = el("b", "", "鉴定通过。 ");
            feedback.appendChild(b1);
            feedback.appendChild(document.createTextNode(q.e));
            sfx("ok");
            addArtifact(art.id);
            paintList();
            renderCollection();
            renderAward();
            var gotAll = era.artifactIds.every(function (id) { return has(id); });
            var go = el("button", "btn btn-primary btn-sm", gotAll ? "全部出土 · 收工" : "收入图鉴");
            go.type = "button";
            go.style.marginTop = "14px";
            go.addEventListener("click", function () {
              closeModal();
              if (gotAll) {
                finishGame(era, "五件国宝，全部出土", "从 170 万年前的门齿，到五千年前的玉琮——这一站你用土层读完了没有文字的历史。下一站，青铜与甲骨在等你。");
              } else {
                openArtifact(art);
              }
            });
            box.appendChild(go);
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            sfx("bad");
            feedback.style.display = "block";
            clear(feedback);
            feedback.appendChild(el("b", "", "再想想。 "));
            feedback.appendChild(document.createTextNode("提示：" + q.e.split("；")[0] + "。"));
          }
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      box.appendChild(feedback);
      openModal(box);
    }
  }

  /* ---------- game 2: match ---------- */
  function initMatch(era, body) {
    clear(body);
    body.appendChild(el("p", "game-tip", era.game.tip));
    var wrap = el("div", "match");
    var left = el("div", "match-col");
    var right = el("div", "match-col right");
    var sel = null, matched = 0;
    var shuffled = MATCH_PAIRS.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    MATCH_PAIRS.forEach(function (p) {
      var b = el("button", "mitem");
      b.type = "button";
      b.appendChild(el("span", "k", p.p));
      b.addEventListener("click", function () {
        if (b.classList.contains("done")) return;
        Array.prototype.forEach.call(left.children, function (n) { n.classList.remove("sel"); });
        b.classList.add("sel");
        sel = p;
        sfx("click");
      });
      left.appendChild(b);
    });
    shuffled.forEach(function (p) {
      var b = el("button", "mitem");
      b.type = "button";
      b.textContent = p.c;
      b.addEventListener("click", function () {
        if (b.classList.contains("done")) return;
        if (!sel) { toast("先点左边的人物，再点他的主张"); return; }
        if (sel === p) {
          b.classList.add("done");
          var lb = Array.prototype.filter.call(left.children, function (n) { return n.textContent === sel.p; })[0];
          if (lb) { lb.classList.add("done"); lb.classList.remove("sel"); }
          matched++;
          sel = null;
          sfx("ok");
          toast("配对成功：" + p.p + " —— " + p.c);
          if (matched === MATCH_PAIRS.length) {
            setTimeout(function () {
              finishGame(era, "六位思想家，全部对上了", "百家争鸣不是六个人在吵架，而是六种关于“怎么治国、怎么做人”的答案。考试常考人物与主张的一一对应。");
            }, 520);
          }
        } else {
          b.classList.add("shake");
          if (sel) {
            var wrongLeft = Array.prototype.filter.call(left.children, function (n) { return n.textContent === sel.p; })[0];
            if (wrongLeft) {
              wrongLeft.classList.add("shake");
              setTimeout(function () { wrongLeft.classList.remove("shake"); }, 420);
            }
          }
          setTimeout(function () { b.classList.remove("shake"); }, 420);
          sfx("bad");
          toast("不是这位说的。想一想他的关键词：" + sel.e);
        }
      });
      right.appendChild(b);
    });
    wrap.appendChild(left); wrap.appendChild(right);
    var note = el("div", "match-note", "左：人物 / 右：主张　·　先左后右，配对即锁定");
    wrap.appendChild(note);
    body.appendChild(wrap);
  }

  /* ---------- game 3: silk ---------- */
  function initSilk(era, body) {
    clear(body);
    body.appendChild(el("p", "game-tip", era.game.tip));
    var wrap = el("div", "silk-wrap");
    var svg = svgEl("svg", { viewBox: "0 0 780 400", class: "silk-svg", role: "img", "aria-label": "丝绸之路路线图" });
    var bg = svgEl("rect", { x: "0", y: "0", width: "780", height: "400", fill: "none" });
    svg.appendChild(bg);
    var gridG = svgEl("g", { stroke: "rgba(243,234,217,.05)", "stroke-width": "1" });
    for (var gx = 60; gx < 780; gx += 60) gridG.appendChild(svgEl("line", { x1: gx, y1: 0, x2: gx, y2: 400 }));
    for (var gy = 40; gy < 400; gy += 40) gridG.appendChild(svgEl("line", { x1: 0, y1: gy, x2: 780, y2: gy }));
    svg.appendChild(gridG);

    var ridge = svgEl("g", {});
    ridge.appendChild(svgEl("path", { d: "M0,104 L64,62 L118,90 L178,48 L238,92 L300,64 L362,96 L424,54 L486,94 L548,66 L610,98 L672,60 L734,92 L780,68 L780,0 L0,0 Z", fill: "rgba(201,167,104,.042)" }));
    svg.appendChild(ridge);
    var dunes = svgEl("g", {});
    dunes.appendChild(svgEl("path", { d: "M0,336 C140,300 230,352 360,326 C500,298 600,348 780,306 L780,400 L0,400 Z", fill: "rgba(201,167,104,.055)" }));
    dunes.appendChild(svgEl("path", { d: "M0,368 C150,338 260,388 420,358 C570,330 670,376 780,352 L780,400 L0,400 Z", fill: "rgba(201,167,104,.045)" }));
    svg.appendChild(dunes);

    var mark = svgEl("text", { x: "30", y: "46", fill: "rgba(243,234,217,.34)", "font-size": "13", "letter-spacing": "3" });
    mark.textContent = "← 西";
    svg.appendChild(mark);
    var mark2 = svgEl("text", { x: "750", y: "392", fill: "rgba(243,234,217,.28)", "font-size": "12", "letter-spacing": "3", "text-anchor": "end" });
    mark2.textContent = "东 →";
    svg.appendChild(mark2);
    var routeLabel = svgEl("text", { x: "390", y: "320", fill: "rgba(201,167,104,.46)", "font-size": "15", "letter-spacing": "8", "text-anchor": "middle", "font-family": "Songti SC, STSong, serif" });
    routeLabel.textContent = "丝绸之路";
    svg.appendChild(routeLabel);

    var segs = [];
    for (var i = 0; i < SILK_STOPS.length - 1; i++) {
      var a = SILK_STOPS[i], b = SILK_STOPS[i + 1];
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
      var p = svgEl("path", { d: "M" + a.x + "," + a.y + " Q" + mx + "," + my + " " + b.x + "," + b.y, class: "silk-seg" });
      segs.push(p);
      svg.appendChild(p);
    }
    var next = 0;
    var factBox = el("div", "silk-fact", "商队已在长安集结。点击「长安」，出发。");
    var nodes = [];
    SILK_STOPS.forEach(function (s, idx) {
      var g = svgEl("g", { class: "silk-node", "data-idx": String(idx) });
      g.appendChild(svgEl("circle", { cx: s.x, cy: s.y, r: idx === 0 ? 11 : 9 }));
      var t = svgEl("text", { x: s.x, y: s.y - 18, "text-anchor": "middle" });
      t.textContent = s.name;
      var sub = svgEl("text", { x: s.x, y: s.y + 26, "text-anchor": "middle", class: "sub" });
      sub.textContent = s.sub;
      g.appendChild(t); g.appendChild(sub);
      g.addEventListener("click", function () {
        if (idx === next) {
          g.classList.add("on");
          if (idx > 0) segs[idx - 1].classList.add("on");
          factBox.textContent = s.name + "：" + s.fact;
          next++;
          sfx("ok");
          if (next === SILK_STOPS.length) {
            setTimeout(function () {
              finishGame(era, "驼队抵达大秦", "长安 → 河西走廊 → 西域 → 中亚 → 西亚 → 大秦。这条路运走丝绸、漆器，运回良种马、香料与玻璃，也把佛教与艺术带进了中国。");
            }, 620);
          }
        } else {
          g.classList.add("shake");
          setTimeout(function () { g.classList.remove("shake"); }, 420);
          sfx("bad");
          toast(next === 0 ? "商队还没出发——先点起点长安。" : "方向不对。下一站应该接着上一个站点往西走。");
        }
      });
      nodes.push(g);
      svg.appendChild(g);
    });
    wrap.appendChild(svg);
    body.appendChild(wrap);
    body.appendChild(factBox);
    var legend = el("div", "match-note", "提示：按商队真实行进方向，从东往西依次点亮。");
    body.appendChild(legend);
  }

  /* ---------- game 4: chibi ---------- */
  function initChibi(era, body) {
    clear(body);
    body.appendChild(el("p", "game-tip", era.game.tip));
    var box = el("div");
    body.appendChild(box);
    var round = 0, wrongCount = 0;

    function draw() {
      clear(box);
      if (round >= CHIBI_ROUNDS.length) {
        var end = el("div", "game-done");
        end.appendChild(el("div", "seal", "胜"));
        end.appendChild(el("h4", "", "东南风起，火烧连营"));
        end.appendChild(el("p", "", CHIBI_END));
        var row = el("div", "btn-row");
        row.style.justifyContent = "center";
        var b = el("button", "btn btn-primary btn-sm", "收下这一站的国宝");
        b.type = "button";
        b.addEventListener("click", function () {
          finishGame(era, "赤壁之战，你赢了", "但历史没有停在赤壁：220 年魏、221 年蜀汉、229 年吴相继建立，三国鼎立局面正式形成。");
        });
        row.appendChild(b);
        end.appendChild(row);
        box.appendChild(end);
        sfx("win");
        return;
      }
      var r = CHIBI_ROUNDS[round];
      var meta = el("div", "qmeta");
      meta.appendChild(el("span", "", "第 " + (round + 1) + " / " + CHIBI_ROUNDS.length + " 幕"));
      meta.appendChild(el("span", "", wrongCount === 0 ? "判断全对" : "重选 " + wrongCount + " 次"));
      box.appendChild(meta);
      var story = el("p", "story");
      story.appendChild(richText(r.story));
      box.appendChild(story);
      var q = el("p", "qtext", r.q);
      q.style.fontSize = "16px";
      box.appendChild(q);
      var opts = el("div", "opts");
      var fb = el("div", "feedback");
      fb.style.display = "none";
      var picked = false;
      r.opts.forEach(function (o, i) {
        var b = el("button", "opt");
        b.type = "button";
        b.appendChild(el("span", "k", "ABCD".charAt(i)));
        b.appendChild(el("span", "", o.t));
        b.addEventListener("click", function () {
          if (picked) return;
          if (o.ok) {
            picked = true;
            b.classList.add("right");
            Array.prototype.forEach.call(opts.children, function (n) { n.disabled = true; });
            fb.style.display = "block";
            clear(fb);
            fb.appendChild(el("b", "", "正是如此。 "));
            fb.appendChild(document.createTextNode(o.fb));
            sfx("ok");
            var nextBtn = el("button", "btn btn-primary btn-sm", round === CHIBI_ROUNDS.length - 1 ? "看结局" : "继续");
            nextBtn.type = "button";
            nextBtn.style.marginTop = "14px";
            nextBtn.addEventListener("click", function () { round++; draw(); });
            box.appendChild(nextBtn);
          } else {
            wrongCount++;
            b.classList.add("wrong");
            b.disabled = true;
            sfx("bad");
            fb.style.display = "block";
            clear(fb);
            fb.appendChild(el("b", "", "这样不行。 "));
            fb.appendChild(document.createTextNode(o.fb + " 再选一次。"));
          }
        });
        opts.appendChild(b);
      });
      box.appendChild(opts);
      box.appendChild(fb);
    }
    draw();
  }

  /* ---------- collection ---------- */
  function renderCollection() {
    var grid = $("collGrid");
    if (!grid) return;
    clear(grid);
    ARTIFACTS.forEach(function (a, ai) {
      var unlocked = has(a.id);
      var card = el("button", "acard" + (unlocked ? "" : " locked"));
      card.type = "button";
      card.appendChild(svgIcon(a.icon));
      card.appendChild(el("div", "an", unlocked ? a.name : "未出土"));
      card.appendChild(el("div", "ad", unlocked ? a.date : "第 " + a.era + " 站 · 待发掘"));
      card.appendChild(el("span", "no", "NO." + String(ai + 1).padStart(2, "0")));
      if (!unlocked) card.appendChild(el("span", "lockq", "?"));
      card.addEventListener("click", function () {
        if (unlocked) openArtifact(a);
        else { toast("这件还埋在土里：去第 " + a.era + " 站通关，就能把它挖出来。"); sfx("bad"); }
      });
      grid.appendChild(card);
    });
    refreshProgress();
  }

  /* ---------- quiz ---------- */
  var quizState = { phase: "start", list: [], idx: 0, score: 0, wrong: [], locked: false };
  function pickQuiz() {
    var pool = QUIZ.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, 20);
  }
  function renderQuiz() {
    var box = $("quizBox");
    clear(box);
    var shell = el("div", "quiz-shell");
    if (quizState.phase === "start") {
      var s = el("div", "quiz-start");
      s.appendChild(el("h3", "", "准备好了吗？"));
      s.appendChild(el("p", "", "从 26 道题里随机抽 20 道，覆盖四个单元。答完立刻看到解析，答错不扣分。"));
      var cover = el("div", "qcover");
      [1, 2, 3, 4].forEach(function (u) {
        var n = QUIZ.filter(function (q) { return q.u === u; }).length;
        var c = el("span", "qcov");
        c.appendChild(el("b", "", ERAS[u - 1].name));
        c.appendChild(el("i", "", n + " 题"));
        cover.appendChild(c);
      });
      s.appendChild(cover);
      var best = el("p", "", "你的最好成绩：" + state.best + " / 20");
      best.style.color = "var(--gold)";
      s.appendChild(best);
      var b = el("button", "btn btn-primary", "开始答题");
      b.type = "button";
      b.addEventListener("click", function () {
        quizState = { phase: "run", list: pickQuiz(), idx: 0, score: 0, wrong: [], locked: false };
        sfx("click");
        renderQuiz();
      });
      s.appendChild(b);
      shell.appendChild(s);
    } else if (quizState.phase === "run") {
      var item = quizState.list[quizState.idx];
      var meta = el("div", "qmeta");
      meta.appendChild(el("span", "", "第 " + (quizState.idx + 1) + " / 20 题"));
      meta.appendChild(el("b", "", "答对 " + quizState.score));
      shell.appendChild(meta);
      var bar = el("div", "qbar");
      var bi = el("i");
      bi.style.width = (quizState.idx / 20 * 100) + "%";
      bar.appendChild(bi);
      shell.appendChild(bar);
      shell.appendChild(el("p", "qtext", item.q));
      var opts = el("div", "qopts");
      var exp = el("div", "qexplain");
      item.o.forEach(function (text, i) {
        var b = el("button", "qopt");
        b.type = "button";
        b.appendChild(el("span", "k", "ABCD".charAt(i)));
        b.appendChild(el("span", "", text));
        b.addEventListener("click", function () {
          if (quizState.locked) return;
          quizState.locked = true;
          Array.prototype.forEach.call(opts.children, function (n) { n.disabled = true; });
          var right = i === item.a;
          if (right) {
            b.classList.add("right");
            quizState.score++;
            sfx("ok");
          } else {
            b.classList.add("wrong");
            opts.children[item.a].classList.add("right");
            quizState.wrong.push(item);
            sfx("bad");
          }
          exp.classList.add("on");
          exp.appendChild(el("b", "", right ? "答对了。" : "正确答案：" + "ABCD".charAt(item.a) + "。"));
          var ep = el("p", "", item.e);
          ep.style.margin = "6px 0 0";
          exp.appendChild(ep);
          var next = el("button", "btn btn-primary btn-sm", quizState.idx === 19 ? "看结果" : "下一题");
          next.type = "button";
          next.style.marginTop = "16px";
          next.addEventListener("click", function () {
            quizState.idx++;
            quizState.locked = false;
            if (quizState.idx >= 20) {
              quizState.phase = "end";
              if (quizState.score > state.best) { state.best = quizState.score; save(); }
              renderAward();
            }
            renderQuiz();
          });
          exp.appendChild(next);
        });
        opts.appendChild(b);
      });
      shell.appendChild(opts);
      shell.appendChild(exp);
    } else {
      var end = el("div", "quiz-start");
      end.appendChild(el("div", "score-big", quizState.score + " / 20"));
      var rank = RANKS.filter(function (r) { return quizState.score >= r.min; })[0] || RANKS[RANKS.length - 1];
      end.appendChild(el("div", "rank", rank.name));
      end.appendChild(el("div", "rank-note", rank.note));
      if (quizState.wrong.length) {
        var back = el("div", "qexplain on");
        back.style.marginTop = "24px";
        back.style.textAlign = "left";
        back.appendChild(el("b", "", "错题回顾（" + quizState.wrong.length + " 题）："));
        var ul = el("div");
        ul.style.marginTop = "10px";
        quizState.wrong.forEach(function (w) {
          var p = el("p", "", "· " + w.q + "　→ " + w.o[w.a]);
          p.style.margin = "6px 0";
          p.style.fontSize = "12.5px";
          ul.appendChild(p);
        });
        back.appendChild(ul);
        end.appendChild(back);
      }
      var row = el("div", "btn-row");
      row.style.justifyContent = "center";
      var again = el("button", "btn btn-primary btn-sm", "再来一次");
      again.type = "button";
      again.addEventListener("click", function () {
        quizState = { phase: "run", list: pickQuiz(), idx: 0, score: 0, wrong: [], locked: false };
        renderQuiz();
      });
      row.appendChild(again);
      end.appendChild(row);
      shell.appendChild(end);
    }
    box.appendChild(shell);
  }

  /* ---------- award ---------- */
  function renderAward() {
    var box = $("awardBox");
    if (!box) return;
    clear(box);
    var doneCount = 0;
    ERAS.forEach(function (e) { if (state.done["e" + e.id]) doneCount++; });
    var ledger = el("div", "ledger");
    var stats = [
      { n: state.found.length + " / 16", t: "国宝入袋", d: "每件文物都对应一个考点" },
      { n: doneCount + " / 4", t: "关卡通关", d: "四关全通，时间线就完整了" },
      { n: state.best + " / 20", t: "最好成绩", d: "答满 18 题，拿到「文明守护者」" }
    ];
    stats.forEach(function (s) {
      var c = el("div", "led");
      c.appendChild(el("b", "", s.t));
      c.appendChild(el("span", "", s.n));
      c.appendChild(el("em", "", s.d));
      ledger.appendChild(c);
    });
    box.appendChild(ledger);

    if (state.found.length === 16) {
      var cert = el("div", "cert");
      cert.appendChild(el("div", "c-sub", "EXCAVATION CERTIFICATE"));
      cert.appendChild(el("h3", "", "小小考古学家 · 结业证明"));
      var body = el("p", "c-body");
      body.textContent = "兹证明：持证人已完成「五千年寻宝记」全部四座探方，收集国宝 16 件，理清自元谋人至南北朝共 170 万年的文明脉络，并能说明重大事件之间的因果。特此授予「小小考古学家」称号。";
      cert.appendChild(body);
      var seal = el("div", "c-seal");
      seal.appendChild(el("b", "", "考古"));
      seal.appendChild(el("span", "", "结业"));
      cert.appendChild(seal);
      box.appendChild(cert);
    } else {
      var hint = el("div", "feedback");
      hint.style.marginTop = "24px";
      hint.appendChild(el("b", "", "还差 " + (16 - state.found.length) + " 件国宝。"));
      hint.appendChild(document.createTextNode(" 回到四大关卡，把没通关的那一站打完；也可以点图鉴里灰掉的卡片，看看它埋在哪一站。"));
      box.appendChild(hint);
    }
  }

  /* ---------- reveal + nav ---------- */
  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }
  function initScroll() {
    var bar = $("topbar");
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a, .mnav a"));
    var secs = [];
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute("href"));
      if (s && secs.indexOf(s) === -1) secs.push(s);
    });
    function onScroll() {
      if (window.scrollY > 24) bar.classList.add("solid"); else bar.classList.remove("solid");
      var pos = window.scrollY + window.innerHeight * 0.32;
      var current = null;
      secs.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
      links.forEach(function (a) {
        var on = current && a.getAttribute("href") === "#" + current.id;
        a.classList.toggle("on", !!on);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- sound toggle ---------- */
  function initSound() {
    var b = $("soundBtn");
    function paint() { b.classList.toggle("off", !state.sound); b.textContent = state.sound ? "♪" : "×"; }
    paint();
    b.addEventListener("click", function () {
      state.sound = !state.sound;
      save(); paint();
      if (state.sound) sfx("ok");
      toast(state.sound ? "音效已开启" : "音效已关闭");
    });
  }

  /* ---------- boot ---------- */
  load();
  renderMap();
  renderTimeline();
  renderEras();
  renderCollection();
  renderQuiz();
  renderAward();
  initReveal();
  initScroll();
  initSound();

  var hintBtn = $("collHint");
  if (hintBtn) {
    hintBtn.addEventListener("click", function () {
      var missing = ARTIFACTS.filter(function (a) { return !has(a.id); });
      if (!missing.length) { toast("16 件全部入袋，去领结业印吧"); return; }
      var byEra = {};
      missing.forEach(function (a) { byEra[a.era] = (byEra[a.era] || 0) + 1; });
      var parts = [];
      Object.keys(byEra).sort().forEach(function (k) { parts.push("第 " + k + " 站 " + byEra[k] + " 件"); });
      toast("还差 " + missing.length + " 件：" + parts.join("，"));
    });
  }
})();
