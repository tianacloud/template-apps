/* 速配一餐 · 数据层
 * 1) INGREDIENTS  食材表（emoji 作占位插画，后续可整批替换成手绘图）
 * 2) PANTRY       常备调料分组
 * 3) RECIPES      家常菜菜谱库
 */

const CATS = [
  { id: 'veg', name: '蔬菜', hint: '冰箱里最容易剩的就是它们' },
  { id: 'meat', name: '肉蛋水产', hint: '有一样就够撑起一顿饭' },
  { id: 'fungus', name: '菌菇干货', hint: '泡一泡就能下锅' },
  { id: 'staple', name: '主食豆制品', hint: '填饱肚子的底盘' }
];

const INGREDIENTS = [
  // ── 蔬菜 ──
  { id: 'potato',      name: '土豆',   emoji: '🥔', cat: 'veg' },
  { id: 'tomato',      name: '番茄',   emoji: '🍅', cat: 'veg' },
  { id: 'cherrytomato',name: '圣女果', emoji: '🍅', cat: 'veg' },
  { id: 'greenpepper', name: '青椒',   emoji: '🌶️', cat: 'veg' },
  { id: 'hotpepper',   name: '尖椒',   emoji: '🌶️', cat: 'veg' },
  { id: 'bellpepper',  name: '彩椒',   emoji: '🌶️', cat: 'veg' },
  { id: 'onion',       name: '洋葱',   emoji: '🧅', cat: 'veg' },
  { id: 'carrot',      name: '胡萝卜', emoji: '🥕', cat: 'veg' },
  { id: 'radish',      name: '白萝卜', emoji: '🥬', cat: 'veg' },
  { id: 'greenradish', name: '青萝卜', emoji: '🥬', cat: 'veg' },
  { id: 'cabbage',     name: '白菜',   emoji: '🥬', cat: 'veg' },
  { id: 'redcabbage',  name: '紫甘蓝', emoji: '🥬', cat: 'veg' },
  { id: 'bokchoy',     name: '小青菜', emoji: '🥬', cat: 'veg' },
  { id: 'caixin',      name: '菜心',   emoji: '🥬', cat: 'veg' },
  { id: 'caitai',      name: '菜薹',   emoji: '🌿', cat: 'veg' },
  { id: 'spinach',     name: '菠菜',   emoji: '🌿', cat: 'veg' },
  { id: 'babycabbage', name: '娃娃菜', emoji: '🥬', cat: 'veg' },
  { id: 'lettuce',     name: '生菜',   emoji: '🥬', cat: 'veg' },
  { id: 'youmaicai',   name: '油麦菜', emoji: '🥬', cat: 'veg' },
  { id: 'tonghao',     name: '茼蒿',   emoji: '🌿', cat: 'veg' },
  { id: 'waterspinach',name: '空心菜', emoji: '🌿', cat: 'veg' },
  { id: 'amaranth',    name: '苋菜',   emoji: '🌿', cat: 'veg' },
  { id: 'malabar',     name: '木耳菜', emoji: '🌿', cat: 'veg' },
  { id: 'sweetpotatoleaf',name:'红薯叶',emoji:'🌿', cat: 'veg' },
  { id: 'gailan',      name: '芥蓝',   emoji: '🥦', cat: 'veg' },
  { id: 'mustardgreen',name: '芥菜',   emoji: '🥬', cat: 'veg' },
  { id: 'snowcabbage', name: '雪里蕻', emoji: '🥬', cat: 'veg' },
  { id: 'watercress',  name: '西洋菜', emoji: '🌿', cat: 'veg' },
  { id: 'chrysanthemum',name:'苦菊',   emoji: '🌿', cat: 'veg' },
  { id: 'shepherdspurse',name:'荠菜',  emoji: '🌿', cat: 'veg' },
  { id: 'fennel',      name: '茴香',   emoji: '🌿', cat: 'veg' },
  { id: 'toona',       name: '香椿',   emoji: '🌿', cat: 'veg' },
  { id: 'cilantro',    name: '香菜',   emoji: '🌿', cat: 'veg' },
  { id: 'perilla',     name: '紫苏',   emoji: '🌿', cat: 'veg' },
  { id: 'mint',        name: '薄荷',   emoji: '🌿', cat: 'veg' },
  { id: 'beansprout',  name: '豆芽',   emoji: '🌱', cat: 'veg' },
  { id: 'soybeansprout',name:'黄豆芽', emoji: '🌱', cat: 'veg' },
  { id: 'peashoot',    name: '豌豆苗', emoji: '🌱', cat: 'veg' },
  { id: 'cucumber',    name: '黄瓜',   emoji: '🥒', cat: 'veg' },
  { id: 'eggplant',    name: '茄子',   emoji: '🍆', cat: 'veg' },
  { id: 'broccoli',    name: '西兰花', emoji: '🥦', cat: 'veg' },
  { id: 'cauliflower', name: '花菜',   emoji: '🥦', cat: 'veg' },
  { id: 'zucchini',    name: '西葫芦', emoji: '🥒', cat: 'veg' },
  { id: 'luffa',       name: '丝瓜',   emoji: '🥒', cat: 'veg' },
  { id: 'bittergourd', name: '苦瓜',   emoji: '🥒', cat: 'veg' },
  { id: 'chayote',     name: '佛手瓜', emoji: '🥒', cat: 'veg' },
  { id: 'wintermelon', name: '冬瓜',   emoji: '🍈', cat: 'veg' },
  { id: 'pumpkin',     name: '南瓜',   emoji: '🎃', cat: 'veg' },
  { id: 'corn',        name: '玉米',   emoji: '🌽', cat: 'veg' },
  { id: 'babyscorn',   name: '玉米笋', emoji: '🌽', cat: 'veg' },
  { id: 'celery',      name: '芹菜',   emoji: '🌿', cat: 'veg' },
  { id: 'chive',       name: '韭菜',   emoji: '🌿', cat: 'veg' },
  { id: 'yellowchive', name: '韭黄',   emoji: '🌿', cat: 'veg' },
  { id: 'garlicsprout',name: '蒜苔',   emoji: '🌿', cat: 'veg' },
  { id: 'garlicshoot', name: '蒜苗',   emoji: '🌿', cat: 'veg' },
  { id: 'leek',        name: '大葱',   emoji: '🌱', cat: 'veg' },
  { id: 'lotus',       name: '莲藕',   emoji: '🍥', cat: 'veg' },
  { id: 'yam',         name: '山药',   emoji: '🍠', cat: 'veg' },
  { id: 'taro',        name: '芋头',   emoji: '🍠', cat: 'veg' },
  { id: 'sweetpotato', name: '红薯',   emoji: '🍠', cat: 'veg' },
  { id: 'purplesweetpotato',name:'紫薯',emoji:'🍠', cat: 'veg' },
  { id: 'waterchestnut',name:'马蹄',   emoji: '🥔', cat: 'veg' },
  { id: 'watercaltrop',name: '菱角',   emoji: '🌰', cat: 'veg' },
  { id: 'celtuce',     name: '莴笋',   emoji: '🥬', cat: 'veg' },
  { id: 'bambooshoot', name: '竹笋',   emoji: '🎍', cat: 'veg' },
  { id: 'waterbamboo', name: '茭白',   emoji: '🌾', cat: 'veg' },
  { id: 'asparagus',   name: '芦笋',   emoji: '🌿', cat: 'veg' },
  { id: 'okra',        name: '秋葵',   emoji: '🌿', cat: 'veg' },
  { id: 'snowpea',     name: '荷兰豆', emoji: '🍃', cat: 'veg' },
  { id: 'peas',        name: '豌豆',   emoji: '🍃', cat: 'veg' },
  { id: 'greenbean',   name: '豆角',   emoji: '🌿', cat: 'veg' },
  { id: 'cowpea',      name: '豇豆',   emoji: '🌿', cat: 'veg' },
  { id: 'flatbean',    name: '扁豆',   emoji: '🌿', cat: 'veg' },
  { id: 'edamame',     name: '毛豆',   emoji: '🍃', cat: 'veg' },
  { id: 'broadbean',   name: '蚕豆',   emoji: '🍃', cat: 'veg' },
  { id: 'pickled',     name: '酸菜',   emoji: '🥬', cat: 'veg' },
  { id: 'kimchi',      name: '辣白菜', emoji: '🥬', cat: 'veg' },
  { id: 'zhacai',      name: '榨菜',   emoji: '🥬', cat: 'veg' },
  { id: 'lemon',       name: '柠檬',   emoji: '🍋', cat: 'veg' },
  { id: 'apple',       name: '苹果',   emoji: '🍎', cat: 'veg' },
  { id: 'pear',        name: '梨',     emoji: '🍐', cat: 'veg' },

  // ── 肉蛋水产 ──
  { id: 'egg',         name: '鸡蛋',   emoji: '🥚', cat: 'meat' },
  { id: 'quaillegg',   name: '鹌鹑蛋', emoji: '🥚', cat: 'meat' },
  { id: 'saltedegg',   name: '咸鸭蛋', emoji: '🥚', cat: 'meat' },
  { id: 'centuryegg',  name: '皮蛋',   emoji: '🥚', cat: 'meat' },
  { id: 'porkbelly',   name: '五花肉', emoji: '🥓', cat: 'meat' },
  { id: 'porkloin',    name: '猪里脊', emoji: '🥩', cat: 'meat' },
  { id: 'mincedpork',  name: '猪肉末', emoji: '🍖', cat: 'meat' },
  { id: 'ribs',        name: '排骨',   emoji: '🍖', cat: 'meat' },
  { id: 'trotters',    name: '猪蹄',   emoji: '🍖', cat: 'meat' },
  { id: 'liver',       name: '猪肝',   emoji: '🍖', cat: 'meat' },
  { id: 'porktripe',   name: '猪肚',   emoji: '🍖', cat: 'meat' },
  { id: 'porkblood',   name: '猪血',   emoji: '🍖', cat: 'meat' },
  { id: 'curedmeat',   name: '腊肉',   emoji: '🥓', cat: 'meat' },
  { id: 'beef',        name: '牛肉',   emoji: '🥩', cat: 'meat' },
  { id: 'beefbrisket', name: '牛腩',   emoji: '🥩', cat: 'meat' },
  { id: 'beefroll',    name: '肥牛卷', emoji: '🥩', cat: 'meat' },
  { id: 'steak',       name: '牛排',   emoji: '🥩', cat: 'meat' },
  { id: 'lamb',        name: '羊肉',   emoji: '🍖', cat: 'meat' },
  { id: 'chickenleg',  name: '鸡腿',   emoji: '🍗', cat: 'meat' },
  { id: 'chickenbreast',name:'鸡胸肉', emoji: '🍗', cat: 'meat' },
  { id: 'chickenwing', name: '鸡翅',   emoji: '🍗', cat: 'meat' },
  { id: 'chickenfeet', name: '鸡爪',   emoji: '🍗', cat: 'meat' },
  { id: 'wholechicken',name: '整鸡',   emoji: '🍗', cat: 'meat' },
  { id: 'gizzard',     name: '鸡胗',   emoji: '🍗', cat: 'meat' },
  { id: 'duck',        name: '鸭腿',   emoji: '🍗', cat: 'meat' },
  { id: 'duckblood',   name: '鸭血',   emoji: '🍖', cat: 'meat' },
  { id: 'shrimp',      name: '虾',     emoji: '🦐', cat: 'meat' },
  { id: 'shrimppaste', name: '虾滑',   emoji: '🦐', cat: 'meat' },
  { id: 'fish',        name: '鲈鱼',   emoji: '🐟', cat: 'meat' },
  { id: 'grasscarp',   name: '草鱼',   emoji: '🐟', cat: 'meat' },
  { id: 'cruciancarp', name: '鲫鱼',   emoji: '🐟', cat: 'meat' },
  { id: 'hairtail',    name: '带鱼',   emoji: '🐟', cat: 'meat' },
  { id: 'yellowcroaker',name:'黄花鱼', emoji: '🐟', cat: 'meat' },
  { id: 'salmon',      name: '三文鱼', emoji: '🐟', cat: 'meat' },
  { id: 'basa',        name: '龙利鱼', emoji: '🐟', cat: 'meat' },
  { id: 'cod',         name: '鳕鱼',   emoji: '🐟', cat: 'meat' },
  { id: 'squid',       name: '鱿鱼',   emoji: '🦑', cat: 'meat' },
  { id: 'clam',        name: '花蛤',   emoji: '🐚', cat: 'meat' },
  { id: 'scallop',     name: '扇贝',   emoji: '🐚', cat: 'meat' },
  { id: 'oysterraw',   name: '生蚝',   emoji: '🐚', cat: 'meat' },
  { id: 'razorclam',   name: '蛏子',   emoji: '🐚', cat: 'meat' },
  { id: 'crab',        name: '螃蟹',   emoji: '🦀', cat: 'meat' },
  { id: 'crayfish',    name: '小龙虾', emoji: '🦞', cat: 'meat' },
  { id: 'seacucumber', name: '海参',   emoji: '🥢', cat: 'meat' },
  { id: 'bacon',       name: '培根',   emoji: '🥓', cat: 'meat' },
  { id: 'sausage',     name: '火腿肠', emoji: '🌭', cat: 'meat' },
  { id: 'chinesesausage',name:'腊肠',  emoji: '🌭', cat: 'meat' },
  { id: 'luncheonmeat',name: '午餐肉', emoji: '🥫', cat: 'meat' },
  { id: 'ham',         name: '火腿',   emoji: '🍖', cat: 'meat' },
  { id: 'fishball',    name: '鱼丸',   emoji: '⚪', cat: 'meat' },
  { id: 'meatball',    name: '肉丸',   emoji: '⚪', cat: 'meat' },

  // ── 菌菇干货 ──
  { id: 'shiitake',    name: '香菇',   emoji: '🍄', cat: 'fungus' },
  { id: 'enoki',       name: '金针菇', emoji: '🍄', cat: 'fungus' },
  { id: 'mushroom',    name: '平菇',   emoji: '🍄', cat: 'fungus' },
  { id: 'kingoyster',  name: '杏鲍菇', emoji: '🍄', cat: 'fungus' },
  { id: 'shimeji',     name: '白玉菇', emoji: '🍄', cat: 'fungus' },
  { id: 'buttonmushroom',name:'口蘑',  emoji: '🍄', cat: 'fungus' },
  { id: 'teatree',     name: '茶树菇', emoji: '🍄', cat: 'fungus' },
  { id: 'strawmushroom',name:'草菇',   emoji: '🍄', cat: 'fungus' },
  { id: 'lionmane',    name: '猴头菇', emoji: '🍄', cat: 'fungus' },
  { id: 'morel',       name: '羊肚菌', emoji: '🍄', cat: 'fungus' },
  { id: 'crabmushroom',name: '蟹味菇', emoji: '🍄', cat: 'fungus' },
  { id: 'bamboofungus',name: '竹荪',   emoji: '🥢', cat: 'fungus' },
  { id: 'fungus',      name: '木耳',   emoji: '🍄', cat: 'fungus' },
  { id: 'tremella',    name: '银耳',   emoji: '🍄', cat: 'fungus' },
  { id: 'kelp',        name: '海带',   emoji: '🍥', cat: 'fungus' },
  { id: 'wakame',      name: '裙带菜', emoji: '🍥', cat: 'fungus' },
  { id: 'seaweed',     name: '紫菜',   emoji: '🍥', cat: 'fungus' },
  { id: 'driedshrimp', name: '虾皮',   emoji: '🦐', cat: 'fungus' },
  { id: 'driedscallop',name: '干贝',   emoji: '🐚', cat: 'fungus' },
  { id: 'peanut',      name: '花生米', emoji: '🥜', cat: 'fungus' },
  { id: 'walnut',      name: '核桃',   emoji: '🌰', cat: 'fungus' },
  { id: 'chestnut',    name: '板栗',   emoji: '🌰', cat: 'fungus' },
  { id: 'jujube',      name: '红枣',   emoji: '🌰', cat: 'fungus' },
  { id: 'goji',        name: '枸杞',   emoji: '🌰', cat: 'fungus' },
  { id: 'lotusseed',   name: '莲子',   emoji: '🌰', cat: 'fungus' },
  { id: 'lilybulb',    name: '百合',   emoji: '🌰', cat: 'fungus' },
  { id: 'daylily',     name: '黄花菜', emoji: '🌾', cat: 'fungus' },
  { id: 'soybean',     name: '黄豆',   emoji: '🌰', cat: 'fungus' },
  { id: 'mungbean',    name: '绿豆',   emoji: '🌰', cat: 'fungus' },
  { id: 'redbean',     name: '红豆',   emoji: '🌰', cat: 'fungus' },
  { id: 'jobstears',   name: '薏米',   emoji: '🌾', cat: 'fungus' },
  { id: 'oats',        name: '燕麦',   emoji: '🌾', cat: 'fungus' },

  // ── 主食豆制品 ──
  { id: 'rice',        name: '米饭',   emoji: '🍚', cat: 'staple' },
  { id: 'glutinousrice',name:'糯米',   emoji: '🍚', cat: 'staple' },
  { id: 'blackrice',   name: '黑米',   emoji: '🍚', cat: 'staple' },
  { id: 'millet',      name: '小米',   emoji: '🌾', cat: 'staple' },
  { id: 'noodle',      name: '面条',   emoji: '🍜', cat: 'staple' },
  { id: 'udon',        name: '乌冬面', emoji: '🍜', cat: 'staple' },
  { id: 'sobanoodle',  name: '荞麦面', emoji: '🍜', cat: 'staple' },
  { id: 'pasta',       name: '意面',   emoji: '🍝', cat: 'staple' },
  { id: 'ricevermicelli',name:'米线',  emoji: '🍜', cat: 'staple' },
  { id: 'riceflakenoodle',name:'河粉', emoji: '🍜', cat: 'staple' },
  { id: 'instantnoodle',name:'方便面', emoji: '🍜', cat: 'staple' },
  { id: 'bun',         name: '馒头',   emoji: '🍞', cat: 'staple' },
  { id: 'bread',       name: '吐司',   emoji: '🍞', cat: 'staple' },
  { id: 'youtiao',     name: '油条',   emoji: '🥖', cat: 'staple' },
  { id: 'dumplingwrapper',name:'饺子皮',emoji:'🥟', cat: 'staple' },
  { id: 'wontonwrapper',name:'馄饨皮', emoji: '🥟', cat: 'staple' },
  { id: 'springrollwrapper',name:'春卷皮',emoji:'🌯', cat: 'staple' },
  { id: 'ricecake',    name: '年糕',   emoji: '🍡', cat: 'staple' },
  { id: 'vermicelli',  name: '粉丝',   emoji: '🍜', cat: 'staple' },
  { id: 'flour',       name: '面粉',   emoji: '🌾', cat: 'staple' },
  { id: 'cornmeal',    name: '玉米面', emoji: '🌽', cat: 'staple' },
  { id: 'frozenpancake',name:'手抓饼', emoji: '🥞', cat: 'staple' },
  { id: 'gluten',      name: '面筋',   emoji: '🥢', cat: 'staple' },
  { id: 'tofu',        name: '嫩豆腐', emoji: '🍮', cat: 'staple' },
  { id: 'firmtofu',    name: '老豆腐', emoji: '🧈', cat: 'staple' },
  { id: 'driedtofu',   name: '豆干',   emoji: '🧈', cat: 'staple' },
  { id: 'tofuskin',    name: '豆腐皮', emoji: '🥢', cat: 'staple' },
  { id: 'friedtofu',   name: '油豆腐', emoji: '🧈', cat: 'staple' },
  { id: 'fuzhu',       name: '腐竹',   emoji: '🥢', cat: 'staple' },
  { id: 'konjac',      name: '魔芋',   emoji: '🍥', cat: 'staple' },
  { id: 'eggtofu',     name: '日本豆腐', emoji: '🍮', cat: 'staple' },
  { id: 'breadcrumb',  name: '面包糠', emoji: '🍞', cat: 'staple' },
  { id: 'milk',        name: '牛奶',   emoji: '🥛', cat: 'staple' }
];

/* 调料分三层：
 * base    —— 默认调料，永远算「有」
 * pantry  —— 大多数厨房也常备，默认勾上、可以取消
 * more    —— 需要特意买的，默认没有
 */
const PANTRY = [
  {
    group: 'base',
    label: '默认常备',
    note: '这几样默认你有，不用勾',
    items: [
      { id: 'lightsoy', name: '生抽', emoji: '🍯' },
      { id: 'darksoy',  name: '老抽', emoji: '🍯' },
      { id: 'salt',     name: '盐',   emoji: '🧂' },
      { id: 'sugar',    name: '糖',   emoji: '🍬' },
      { id: 'vinegar',  name: '醋',   emoji: '🍯' },
      { id: 'oil',      name: '食用油', emoji: '🍯' }
    ]
  },
  {
    group: 'pantry',
    label: '一般也有',
    note: '没有就取消勾选，菜谱会帮你避开',
    defaultOn: true,
    items: [
      { id: 'scallion', name: '小葱', emoji: '🌱' },
      { id: 'garlic',   name: '大蒜', emoji: '🧄' },
      { id: 'ginger',   name: '生姜', emoji: '🫚' },
      { id: 'wine',     name: '料酒', emoji: '🍶' },
      { id: 'starch',   name: '淀粉', emoji: '🥄' },
      { id: 'oyster',   name: '蚝油', emoji: '🍯' }
    ]
  },
  {
    group: 'more',
    label: '偶尔才有',
    note: '有就勾上，能做更多花样',
    items: [
      { id: 'douban',     name: '豆瓣酱',   emoji: '🍯' },
      { id: 'sichuan',    name: '花椒',     emoji: '🌰' },
      { id: 'driedchili', name: '干辣椒',   emoji: '🌶️' },
      { id: 'pepper',     name: '白胡椒粉', emoji: '🧂' },
      { id: 'sesamoil',   name: '芝麻油',   emoji: '🍯' },
      { id: 'ketchup',    name: '番茄酱',   emoji: '🍅' },
      { id: 'curry',      name: '咖喱块',   emoji: '🍛' },
      { id: 'cheese',     name: '芝士片',   emoji: '🧀' },
      { id: 'cola',       name: '可乐',     emoji: '🥤' },
      { id: 'douchi',     name: '豆豉',     emoji: '🍯' },
      { id: 'blackpepper',name: '黑胡椒',   emoji: '🧂' },
      { id: 'cumin',      name: '孜然',     emoji: '🌰' },
      { id: 'sweetbeanpaste',name:'甜面酱', emoji: '🍯' },
      { id: 'soybeanpaste',name:'黄豆酱',   emoji: '🍯' },
      { id: 'laoganma',   name: '老干妈',   emoji: '🌶️' },
      { id: 'fivespice',  name: '五香粉',   emoji: '🧂' },
      { id: 'thirteen',   name: '十三香',   emoji: '🧂' },
      { id: 'chilioil',   name: '辣椒油',   emoji: '🌶️' },
      { id: 'tahini',     name: '芝麻酱',   emoji: '🥣' },
      { id: 'fermentedtofu',name:'腐乳',    emoji: '🍯' },
      { id: 'beer',       name: '啤酒',     emoji: '🍺' },
      { id: 'honey',      name: '蜂蜜',     emoji: '🍯' },
      { id: 'chiligarlic',name: '蒜蓉辣酱', emoji: '🌶️' },
      { id: 'pickledchili',name:'泡椒',     emoji: '🌶️' },
      { id: 'sesame',     name: '白芝麻',   emoji: '🌰' },
      { id: 'mayo',       name: '沙拉酱',   emoji: '🥣' },
      { id: 'charsiu',    name: '叉烧酱',   emoji: '🍯' },
      { id: 'koreanchili',name: '韩式辣酱', emoji: '🌶️' },
      { id: 'staranise',  name: '八角',     emoji: '🌰' },
      { id: 'cinnamon',   name: '桂皮',     emoji: '🪵' },
      { id: 'bayleaf',    name: '香叶',     emoji: '🍃' },
      { id: 'rocksugar',  name: '冰糖',     emoji: '🍬' },
      { id: 'brownsugar', name: '红糖',     emoji: '🍬' },
      { id: 'mirin',      name: '味醂',     emoji: '🍶' },
      { id: 'fishsauce',  name: '鱼露',     emoji: '🍯' },
      { id: 'steamedsoy', name: '蒸鱼豉油', emoji: '🍯' },
      { id: 'whitevinegar',name:'白醋',     emoji: '🍯' },
      { id: 'chilipowder',name: '辣椒面',   emoji: '🌶️' },
      { id: 'sichuanoil', name: '花椒油',   emoji: '🌰' },
      { id: 'mustard',    name: '芥末',     emoji: '🌱' },
      { id: 'shacha',     name: '沙茶酱',   emoji: '🍯' },
      { id: 'zhuhou',     name: '柱侯酱',   emoji: '🍯' },
      { id: 'hoisin',     name: '海鲜酱',   emoji: '🍯' },
      { id: 'peanutbutter',name:'花生酱',   emoji: '🥜' },
      { id: 'msg',        name: '味精',     emoji: '🧂' },
      { id: 'bouillon',   name: '鸡精',     emoji: '🧂' },
      { id: 'sprite',     name: '雪碧',     emoji: '🥤' },
      { id: 'baijiu',     name: '白酒',     emoji: '🍶' },
      { id: 'fermentedrice',name:'醪糟',    emoji: '🍚' },
      { id: 'yeast',      name: '酵母',     emoji: '🥄' },
      { id: 'bakingpowder',name:'泡打粉',   emoji: '🥄' },
      { id: 'bakingsoda', name: '小苏打',   emoji: '🥄' },
      { id: 'choppedchili',name:'剁椒',     emoji: '🌶️' },
      { id: 'peppersalt', name: '椒盐',     emoji: '🧂' }
    ]
  }
];

/* 菜谱库
 * need  —— 必需食材（id）
 * extra —— 除默认调料外，这道菜还需要的调料（id）
 * time  —— 大约几分钟
 * level —— 1 新手 / 2 一般 / 3 要看着点火
 */
const RECIPES = [
  {
    id: 'tomato-egg', name: '番茄炒蛋', emoji: '🍅',
    need: ['tomato', 'egg'], extra: ['scallion'], time: 10, level: 1,
    steps: [
      '番茄切块，鸡蛋打散加一小撮盐。',
      '热锅多放点油，倒蛋液，边缘凝固就划散盛出，别炒老。',
      '锅里补少许油，下番茄中火炒到出汁变软，加半勺糖、少许盐。',
      '倒回鸡蛋翻两下，撒葱花出锅。'
    ],
    tip: '番茄先用刀划十字烫一下去皮，汤汁会更浓，拌饭特别香。'
  },
  {
    id: 'tomato-egg-soup', name: '番茄蛋花汤', emoji: '🍲',
    need: ['tomato', 'egg'], extra: ['scallion', 'starch'], time: 12, level: 1,
    steps: [
      '番茄切小块，锅里少油炒软，加两碗水烧开。',
      '加盐调味，淋一点水淀粉让汤微微稠。',
      '关小火，蛋液沿筷子细细淋成蛋花，静等三秒再轻推。',
      '滴几滴香油、撒葱花即可。'
    ],
    tip: '蛋液一定要小火淋，火大了蛋花就成蛋块了。'
  },
  {
    id: 'potato-shred', name: '醋溜土豆丝', emoji: '🥔',
    need: ['potato'], extra: ['garlic', 'driedchili'], time: 15, level: 1,
    steps: [
      '土豆切细丝，泡凉水里抓洗两遍去掉淀粉，捞出沥干。',
      '热锅冷油下蒜末、干辣椒炒香。',
      '倒入土豆丝大火快炒一分半，沿锅边淋一勺醋。',
      '加盐、少许糖，再翻几下就出锅，保持脆感。'
    ],
    tip: '洗完一定要沥干，带水下锅会变成"煮土豆丝"，炒不脆。'
  },
  {
    id: 'cabbage-vinegar', name: '醋溜白菜', emoji: '🥬',
    need: ['cabbage'], extra: ['garlic', 'driedchili'], time: 12, level: 1,
    steps: [
      '白菜帮斜刀片薄，菜叶手撕成块，分开放。',
      '热油爆香蒜片和干辣椒，先下菜帮炒一分钟。',
      '再下菜叶，大火翻炒至微软。',
      '加生抽、醋、盐、一点糖，翻匀出锅。'
    ],
    tip: '菜帮和菜叶分开下锅，这样熟得一致，不会叶子烂了帮子还硬。'
  },
  {
    id: 'garlic-broccoli', name: '蒜蓉西兰花', emoji: '🥦',
    need: ['broccoli'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '西兰花掰小朵，盐水泡五分钟，冲净。',
      '水开加几滴油和一点盐，焯四十秒捞出过凉。',
      '热油下蒜末小火炒香，别炒焦。',
      '倒入西兰花大火翻匀，加盐和少许生抽即可。'
    ],
    tip: '焯水时加油和盐，颜色会保持翠绿，看着就有食欲。'
  },
  {
    id: 'oyster-lettuce', name: '蚝油生菜', emoji: '🥬',
    need: ['lettuce'], extra: ['oyster', 'garlic'], time: 8, level: 1,
    steps: [
      '生菜一片片洗净沥干，蒜切末。',
      '水烧开，生菜下锅烫十秒立刻捞出摆盘。',
      '小碗调蚝油一勺、生抽半勺、少许糖和两勺水。',
      '热油炒香蒜末，倒入料汁烧开，浇在生菜上。'
    ],
    tip: '生菜烫十秒就够，久了会出水塌掉，整盘变汤。'
  },
  {
    id: 'smashed-cucumber', name: '拍黄瓜', emoji: '🥒',
    need: ['cucumber'], extra: ['garlic', 'sesamoil'], time: 5, level: 1,
    steps: [
      '黄瓜用刀面拍裂，再切成小段，这样更容易入味。',
      '撒半勺盐抓匀，静置五分钟倒掉渗出的水。',
      '加蒜末、生抽、醋、糖、香油拌匀。',
      '喜欢辣可以加一勺辣椒油，拌好冰一会儿更爽。'
    ],
    tip: '先盐杀水再调味，是拍黄瓜不出水、味道不淡的关键。'
  },
  {
    id: 'cucumber-egg', name: '黄瓜炒蛋', emoji: '🥒',
    need: ['cucumber', 'egg'], extra: ['scallion'], time: 10, level: 1,
    steps: [
      '黄瓜斜切薄片，鸡蛋打散。',
      '热油炒蛋，凝固就盛出。',
      '锅里补油，下黄瓜片大火炒一分钟。',
      '倒回鸡蛋，加盐翻匀出锅。'
    ],
    tip: '黄瓜别炒久，断生就好，脆脆的才清口。'
  },
  {
    id: 'disanxian', name: '地三鲜', emoji: '🍆',
    need: ['potato', 'eggplant', 'greenpepper'], extra: ['garlic', 'starch'], time: 22, level: 2,
    steps: [
      '土豆、茄子切滚刀块，青椒切块；茄子撒点盐抓一下挤掉水。',
      '土豆先下油锅炸到金黄捞出，再炸茄子至软，最后青椒过一下油。',
      '留底油爆香蒜末，倒回三样，淋生抽、少许老抽和糖。',
      '淋一点水淀粉收汁，翻匀出锅。'
    ],
    tip: '不想费油就改空气炸锅或平底锅少油煎，味道差不太多，热量低很多。'
  },
  {
    id: 'yuxiang-eggplant', name: '鱼香茄子', emoji: '🍆',
    need: ['eggplant', 'mincedpork'], extra: ['douban', 'garlic', 'ginger', 'starch'], time: 22, level: 2,
    steps: [
      '茄子切条，撒盐静置十分钟挤水。',
      '碗里调汁：生抽一勺、醋一勺、糖一勺、水淀粉少许。',
      '热油炒散肉末，加豆瓣酱、蒜末、姜末炒出红油。',
      '下茄子翻炒，倒料汁，中火收浓即可。'
    ],
    tip: '鱼香味的公式是"糖醋各一勺、生抽一勺"，记住比例就不会翻车。'
  },
  {
    id: 'braised-eggplant', name: '红烧茄子', emoji: '🍆',
    need: ['eggplant'], extra: ['garlic', 'starch'], time: 18, level: 2,
    steps: [
      '茄子切条，撒盐十分钟后挤干水分，拌一点淀粉抓匀。',
      '平底锅少油，把茄子煎到表面微焦软身，盛出。',
      '爆香蒜末，加生抽、老抽、糖和半碗水烧开。',
      '倒回茄子小火焖三分钟，收汁出锅。'
    ],
    tip: '茄子先拌淀粉再煎，能少吸一半的油。'
  },
  {
    id: 'onion-egg', name: '洋葱炒蛋', emoji: '🧅',
    need: ['onion', 'egg'], extra: [], time: 10, level: 1,
    steps: [
      '洋葱切丝，鸡蛋打散加少许盐。',
      '热油炒蛋，盛出备用。',
      '下洋葱中火炒到边缘透明、略甜。',
      '倒回鸡蛋，加生抽少许翻匀。'
    ],
    tip: '洋葱炒到微微焦边最香，别急着翻，让它贴锅一会儿。'
  },
  {
    id: 'onion-pork', name: '洋葱炒肉片', emoji: '🧅',
    need: ['onion', 'porkloin'], extra: ['wine', 'starch'], time: 15, level: 2,
    steps: [
      '里脊切薄片，加料酒、生抽、淀粉抓匀腌十分钟。',
      '热油把肉片滑散至变色，盛出。',
      '下洋葱丝炒软，加少许盐。',
      '倒回肉片，淋一勺生抽大火翻匀。'
    ],
    tip: '肉片腌的时候加淀粉，炒出来会嫩很多，这是便宜又有效的一步。'
  },
  {
    id: 'potato-beef', name: '土豆炖牛肉', emoji: '🥔',
    need: ['potato', 'beef'], extra: ['ginger', 'wine'], time: 70, level: 2,
    steps: [
      '牛肉切块冷水下锅，加料酒和姜片焯水，撇净浮沫后冲洗。',
      '锅里少油炒香姜片，下牛肉翻炒，加生抽、老抽上色。',
      '倒热水没过牛肉，大火烧开转小火炖四十分钟。',
      '加土豆块再炖二十分钟，加盐收汁。'
    ],
    tip: '一定要加热水，冷水会让肉瞬间收缩变柴。炖的时间才是软烂的关键。'
  },
  {
    id: 'curry-chicken', name: '咖喱土豆鸡', emoji: '🍛',
    need: ['potato', 'chickenleg', 'carrot'], extra: ['curry'], time: 30, level: 1,
    steps: [
      '鸡腿去骨切块，土豆胡萝卜切滚刀块。',
      '锅里少油把鸡肉煎到表面变色。',
      '下土豆胡萝卜翻炒，倒水没过食材，煮十五分钟。',
      '关火放咖喱块搅化，再开小火煮三分钟变稠。'
    ],
    tip: '咖喱块一定要关火后再放，边煮边放容易结块糊底。'
  },
  {
    id: 'mushroom-chicken', name: '香菇滑鸡', emoji: '🍄',
    need: ['shiitake', 'chickenleg'], extra: ['ginger', 'oyster', 'starch'], time: 25, level: 2,
    steps: [
      '鸡腿肉切块，加生抽、蚝油、淀粉、姜丝抓匀腌十五分钟。',
      '香菇切片铺在盘底，鸡肉铺在上面。',
      '水开后上锅大火蒸十五分钟。',
      '出锅撒葱花，淋一勺热油更香。'
    ],
    tip: '全程不用炒，一个蒸锅就够，最适合懒得洗锅的中午。'
  },
  {
    id: 'cola-wings', name: '可乐鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['cola', 'ginger', 'wine'], time: 25, level: 1,
    steps: [
      '鸡翅两面划两刀，冷水下锅加料酒焯一下捞出擦干。',
      '平底锅少油，鸡翅两面煎到金黄。',
      '加姜片、生抽、少许老抽，倒入可乐没过一半。',
      '中火煮十分钟，开大火收到汤汁挂勺。'
    ],
    tip: '可乐本身很甜，不用再加糖，收汁时要盯着，很容易糊。'
  },
  {
    id: 'xiaochao-pork', name: '青椒小炒肉', emoji: '🌶️',
    need: ['porkbelly', 'greenpepper'], extra: ['douban', 'garlic'], time: 15, level: 2,
    steps: [
      '五花肉切薄片，青椒手撕成块。',
      '锅里不放油，先下青椒干煸到起虎皮，盛出。',
      '下五花肉煸出油，肉片卷边时加蒜片和豆瓣酱炒香。',
      '倒回青椒，加生抽少许，大火翻匀。'
    ],
    tip: '青椒先干煸是湘菜馆子的做法，煸过的青椒香得多，也不会有生味。'
  },
  {
    id: 'twicecooked-pork', name: '回锅肉', emoji: '🥓',
    need: ['porkbelly', 'cabbage'], extra: ['douban', 'ginger', 'garlic'], time: 25, level: 3,
    steps: [
      '五花肉整块冷水下锅，加姜片料酒煮十五分钟，捞出放凉切薄片。',
      '白菜切块，锅里不放油干煸到微软盛出。',
      '下肉片小火煸到出油、边缘微卷。',
      '加豆瓣酱炒出红油，倒回白菜，加生抽和少许糖翻匀。'
    ],
    tip: '肉要煮到筷子能插透再切，切太薄容易碎，太厚又不入味。'
  },
  {
    id: 'braised-pork', name: '红烧肉', emoji: '🥓',
    need: ['porkbelly'], extra: ['ginger', 'wine'], time: 60, level: 3,
    steps: [
      '五花肉切麻将块，冷水下锅焯水，捞出洗净擦干。',
      '锅里少油，下肉块煸到四面微黄出油。',
      '加姜片、料酒、生抽、老抽、糖，倒热水没过肉。',
      '小火炖四十五分钟，最后大火收汁到发亮。'
    ],
    tip: '糖可以多放一点，红烧肉的甜味是灵魂；收汁时不停翻动，让每块都裹上汁。'
  },
  {
    id: 'garlicsprout-pork', name: '蒜苔炒肉', emoji: '🌿',
    need: ['garlicsprout', 'porkloin'], extra: ['garlic', 'wine'], time: 15, level: 1,
    steps: [
      '蒜苔掐去老根切段，里脊切丝用生抽料酒抓匀。',
      '热油滑炒肉丝至变色，盛出。',
      '下蒜苔大火炒两分钟，加少许盐和一勺水焖半分钟。',
      '倒回肉丝，加生抽翻匀出锅。'
    ],
    tip: '蒜苔加一勺水焖一下，比干炒更容易熟透又不发黄。'
  },
  {
    id: 'celery-pork', name: '芹菜炒肉', emoji: '🌿',
    need: ['celery', 'porkloin'], extra: ['garlic', 'wine'], time: 15, level: 1,
    steps: [
      '芹菜撕去老筋斜切段，肉切丝腌十分钟。',
      '水开把芹菜焯二十秒捞出，颜色更绿也更脆。',
      '热油炒肉丝至变色，下蒜末炒香。',
      '倒芹菜大火翻炒，加盐和生抽出锅。'
    ],
    tip: '芹菜的老筋从一头撕下来，口感差得非常多，别省这一步。'
  },
  {
    id: 'fungus-pork', name: '木耳炒肉', emoji: '🍄',
    need: ['fungus', 'porkloin'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '木耳提前泡发，撕小朵，焯水一分钟捞出。',
      '肉切片腌制十分钟，热油滑散盛出。',
      '爆香蒜末，下木耳翻炒。',
      '倒回肉片，加蚝油和生抽翻匀。'
    ],
    tip: '木耳一定要焯水，既去土味也更安全，别直接下锅炒。'
  },
  {
    id: 'muji', name: '木须肉', emoji: '🥚',
    need: ['egg', 'fungus', 'cucumber', 'porkloin'], extra: ['scallion'], time: 20, level: 2,
    steps: [
      '肉切片腌好，木耳泡发焯水，黄瓜切片，鸡蛋炒散盛出。',
      '热油下肉片滑散至变色。',
      '下木耳和黄瓜大火翻炒一分钟。',
      '倒回鸡蛋，加生抽、盐，撒葱花翻匀。'
    ],
    tip: '这道菜是"冰箱清仓神器"，四样东西各自处理再合炒，就不会炒成一锅糊。'
  },
  {
    id: 'tomato-beef', name: '番茄牛腩', emoji: '🍅',
    need: ['tomato', 'beef'], extra: ['ginger', 'wine'], time: 90, level: 2,
    steps: [
      '牛腩切块冷水焯水，撇沫后冲洗干净。',
      '番茄两个切块，热油炒到出沙出汁。',
      '下牛腩翻炒，加姜片、料酒、生抽，倒热水没过。',
      '小火炖一小时，最后加盐，再放一个番茄块煮五分钟。'
    ],
    tip: '番茄分两次放：先放的煮化成汤底，后放的保留果肉，汤浓又有口感。'
  },
  {
    id: 'chive-egg', name: '韭菜炒蛋', emoji: '🌿',
    need: ['chive', 'egg'], extra: [], time: 10, level: 1,
    steps: [
      '韭菜洗净沥干切段，鸡蛋打散。',
      '热油炒蛋至半凝固，盛出。',
      '锅补油，下韭菜大火快炒三十秒。',
      '倒回鸡蛋，加盐翻匀立刻出锅。'
    ],
    tip: '韭菜遇热就出水，全程大火、三十秒内解决，才不会炒成汤。'
  },
  {
    id: 'shrimp-egg', name: '虾仁滑蛋', emoji: '🦐',
    need: ['shrimp', 'egg'], extra: ['starch', 'wine'], time: 12, level: 2,
    steps: [
      '虾仁去虾线，加料酒、少许盐和淀粉抓匀。',
      '蛋液打散，加两勺水淀粉搅匀，蛋会更嫩。',
      '热锅温油滑炒虾仁至变色，倒入蛋液。',
      '小火用铲子从边缘往中间推，半凝固就关火。'
    ],
    tip: '关火后再利用余温把蛋焖熟，这就是茶餐厅滑蛋的诀窍。'
  },
  {
    id: 'boiled-shrimp', name: '白灼虾', emoji: '🦐',
    need: ['shrimp'], extra: ['ginger', 'scallion'], time: 10, level: 1,
    steps: [
      '水里放姜片和葱段烧开。',
      '虾下锅，煮到变红卷曲立刻捞出，大约一分半。',
      '小碟放生抽、少许醋和姜末做蘸料。',
      '捞出过一下凉水，肉质更弹。'
    ],
    tip: '虾一红就捞，多煮三十秒就老了，这道菜成败只在时间上。'
  },
  {
    id: 'garlic-vermicelli-shrimp', name: '蒜蓉粉丝虾', emoji: '🦐',
    need: ['shrimp', 'vermicelli'], extra: ['garlic', 'oyster'], time: 20, level: 2,
    steps: [
      '粉丝温水泡软铺在盘底。',
      '虾开背去虾线，摆在粉丝上。',
      '蒜末用热油激香，加蚝油、生抽拌成蒜蓉酱，铺在虾上。',
      '水开上锅蒸八分钟，出锅撒葱花。'
    ],
    tip: '蒜末一半用油炸香、一半生的拌进去，蒜味层次会厚很多。'
  },
  {
    id: 'steamed-fish', name: '清蒸鲈鱼', emoji: '🐟',
    need: ['fish'], extra: ['ginger', 'scallion', 'wine'], time: 20, level: 2,
    steps: [
      '鱼洗净擦干，两面划刀，抹少许盐和料酒，肚里塞姜葱。',
      '盘底垫两根筷子把鱼架空，水开上锅大火蒸八分钟。',
      '倒掉盘里的腥水，铺上新的葱丝姜丝。',
      '淋两勺生抽，浇一勺烧到冒烟的热油。'
    ],
    tip: '蒸出来的水一定要倒掉，那是腥味的来源，这步偷懒整条鱼就废了。'
  },
  {
    id: 'wintermelon-mince', name: '冬瓜肉末', emoji: '🍈',
    need: ['wintermelon', 'mincedpork'], extra: ['garlic', 'starch'], time: 20, level: 1,
    steps: [
      '冬瓜去皮切薄片，肉末备好。',
      '热油炒散肉末，加蒜末和生抽炒香。',
      '下冬瓜片翻炒，加半碗水，盖盖焖八分钟。',
      '加盐，淋水淀粉收汁，撒葱花。'
    ],
    tip: '冬瓜会自己出水，水别加多，不然就是一锅汤。'
  },
  {
    id: 'pumpkin-egg', name: '南瓜蒸蛋', emoji: '🎃',
    need: ['pumpkin', 'egg'], extra: [], time: 20, level: 1,
    steps: [
      '南瓜去皮切小块，铺在碗底。',
      '鸡蛋打散，加一点盐和 1.5 倍的温水搅匀，过筛。',
      '蛋液倒入碗中，盖一层保鲜膜或盘子。',
      '水开上锅中小火蒸十二分钟。'
    ],
    tip: '蛋液过筛加温水，蒸出来会像布丁一样滑，没有蜂窝。'
  },
  {
    id: 'corn-ribs-soup', name: '玉米排骨汤', emoji: '🌽',
    need: ['corn', 'ribs', 'carrot'], extra: ['ginger', 'wine'], time: 60, level: 1,
    steps: [
      '排骨冷水下锅焯水，撇净浮沫捞出冲洗。',
      '排骨加姜片和足量水，大火烧开转小火炖三十分钟。',
      '加玉米段和胡萝卜块，再炖二十分钟。',
      '出锅前五分钟加盐，别提前加。'
    ],
    tip: '盐一定最后放，早放肉会变紧，汤也不容易炖出味。'
  },
  {
    id: 'cold-fungus', name: '凉拌木耳', emoji: '🍄',
    need: ['fungus'], extra: ['garlic', 'sesamoil', 'driedchili'], time: 12, level: 1,
    steps: [
      '木耳泡发洗净，撕小朵。',
      '水开焯两分钟，捞出过凉水沥干。',
      '加蒜末、生抽、醋、糖、香油。',
      '干辣椒用热油泼香倒进去，拌匀。'
    ],
    tip: '焯完过凉水，木耳才会脆，温着拌会软塌塌的。'
  },
  {
    id: 'spinach-vermicelli', name: '菠菜炒粉丝', emoji: '🌿',
    need: ['spinach', 'vermicelli'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '粉丝温水泡软剪短，菠菜焯水十秒挤干切段。',
      '热油爆香蒜末。',
      '下粉丝翻炒，加生抽和两勺水，让粉丝吸味。',
      '倒菠菜翻匀，加盐出锅。'
    ],
    tip: '菠菜先焯水去草酸，口感不涩，也不会和豆腐类互相影响。'
  },
  {
    id: 'mapo-tofu', name: '麻婆豆腐', emoji: '🌶️',
    need: ['tofu', 'mincedpork'], extra: ['douban', 'sichuan', 'garlic', 'starch'], time: 20, level: 2,
    steps: [
      '嫩豆腐切块，放淡盐水里浸五分钟，不易碎。',
      '热油炒散肉末，加豆瓣酱、蒜末、花椒炒出红油。',
      '加一碗水烧开，轻轻推入豆腐，小火煮五分钟。',
      '分两次淋水淀粉勾芡，出锅撒葱花和花椒粉。'
    ],
    tip: '勾芡分两次，第一次让味道挂上，第二次让汤汁包住豆腐，这是"亮汁"的关键。'
  },
  {
    id: 'home-tofu', name: '家常豆腐', emoji: '🧈',
    need: ['firmtofu', 'greenpepper'], extra: ['garlic', 'oyster'], time: 20, level: 2,
    steps: [
      '老豆腐切厚片，用厨房纸吸干水。',
      '平底锅少油，两面煎到金黄，盛出。',
      '爆香蒜末，下青椒块炒半分钟。',
      '倒回豆腐，加蚝油、生抽和少许水，焖两分钟收汁。'
    ],
    tip: '豆腐一定要吸干水再煎，不然会溅油，也煎不出脆壳。'
  },
  {
    id: 'cabbage-tofu', name: '白菜炖豆腐', emoji: '🥬',
    need: ['cabbage', 'firmtofu', 'vermicelli'], extra: ['scallion'], time: 25, level: 1,
    steps: [
      '白菜切块，豆腐切块，粉丝泡软。',
      '热油炒白菜帮两分钟，加生抽炒匀。',
      '加两碗水烧开，放豆腐和粉丝。',
      '小火炖十分钟，加盐，撒葱花。'
    ],
    tip: '冬天最舒服的一锅，汤汁泡饭能吃两碗，成本还不到五块。'
  },
  {
    id: 'fried-tofu', name: '香煎豆腐', emoji: '🧈',
    need: ['firmtofu'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '老豆腐切两厘米厚片，吸干表面水分。',
      '平底锅放油，中小火煎到一面金黄再翻。',
      '两面都脆了，淋一勺生抽和小半碗水。',
      '收到汁快干，撒葱花出锅。'
    ],
    tip: '别急着翻面，等它自己能从锅底滑动再翻，就不会破皮。'
  },
  {
    id: 'century-tofu', name: '皮蛋豆腐', emoji: '🥚',
    need: ['tofu', 'centuryegg'], extra: ['sesamoil', 'scallion'], time: 5, level: 1,
    steps: [
      '嫩豆腐倒扣在盘里，切块。',
      '皮蛋剥壳切小块，铺在豆腐上。',
      '淋生抽、几滴香油和一点醋。',
      '撒葱花即可，冰镇十分钟更好吃。'
    ],
    tip: '五分钟能上桌的救命菜，热得不想开火的时候就靠它。'
  },
  {
    id: 'celery-tofu', name: '芹菜炒豆干', emoji: '🌿',
    need: ['driedtofu', 'celery'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '豆干切条，芹菜切段焯水二十秒。',
      '热油下豆干条，煎到边缘微黄。',
      '加蒜末炒香，倒芹菜大火翻炒。',
      '加生抽、少许盐，翻匀出锅。'
    ],
    tip: '豆干先煎一下会更香更有嚼头，直接炒会发软。'
  },
  {
    id: 'fuzhu-pork', name: '腐竹烧肉', emoji: '🥢',
    need: ['fuzhu', 'porkbelly'], extra: ['garlic', 'oyster'], time: 40, level: 2,
    steps: [
      '腐竹提前用温水泡软，切段。',
      '五花肉切片，小火煸出油至微黄。',
      '加蒜末、生抽、老抽炒上色，倒热水烧开。',
      '下腐竹小火焖二十分钟，加蚝油收汁。'
    ],
    tip: '腐竹要用温水泡，热水会外面烂了里面还硬。'
  },
  {
    id: 'egg-fried-rice', name: '蛋炒饭', emoji: '🍚',
    need: ['rice', 'egg'], extra: ['scallion'], time: 10, level: 1,
    steps: [
      '隔夜饭打散，鸡蛋打散加少许盐。',
      '热锅多油，倒蛋液，还没完全凝固就倒米饭。',
      '大火快速翻炒，把蛋和饭炒散，米粒跳起来最好。',
      '加盐、生抽少许，撒葱花出锅。'
    ],
    tip: '用隔夜冷饭、蛋液半熟就下饭，这两点决定炒饭是"粒粒分明"还是"一坨"。'
  },
  {
    id: 'yangzhou-rice', name: '扬州炒饭', emoji: '🍚',
    need: ['rice', 'egg', 'peas', 'carrot', 'sausage'], extra: ['scallion'], time: 15, level: 2,
    steps: [
      '胡萝卜和火腿肠切小丁，豌豆焯熟。',
      '热油炒蛋炒散，盛出。',
      '下胡萝卜丁和火腿丁炒香，倒米饭炒散。',
      '加豌豆和鸡蛋，加盐翻匀，撒葱花。'
    ],
    tip: '配料都切得跟米粒差不多大，一口下去才均匀，这是好看的关键。'
  },
  {
    id: 'tomato-noodle', name: '番茄鸡蛋面', emoji: '🍜',
    need: ['noodle', 'tomato', 'egg'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '番茄切块，热油炒到出汁，加一勺生抽。',
      '加两碗水烧开，下面条。',
      '面快熟时淋蛋液成蛋花，加盐。',
      '盛出撒葱花，滴几滴香油。'
    ],
    tip: '一个人的午饭之王：十五分钟、一个锅、成本三块，还热乎。'
  },
  {
    id: 'scallion-oil-noodle', name: '葱油拌面', emoji: '🍜',
    need: ['noodle'], extra: ['scallion'], time: 12, level: 1,
    steps: [
      '小葱切长段，冷油下锅小火慢炸到焦黄捞出。',
      '葱油里加生抽两勺、老抽半勺、糖半勺，小火煮开。',
      '面煮熟捞出沥干。',
      '淋两大勺葱油汁拌匀，铺上炸葱。'
    ],
    tip: '葱要冷油下锅小火炸，大火一进去就黑，会发苦。'
  },
  {
    id: 'plain-noodle', name: '阳春面', emoji: '🍜',
    need: ['noodle'], extra: ['scallion'], time: 8, level: 1,
    steps: [
      '碗里放生抽一勺、少许盐、一点香油和葱花。',
      '冲入一勺煮面水化开调料。',
      '面煮熟捞入碗中，加汤至八分满。',
      '喜欢的话加一勺猪油，味道立刻不一样。'
    ],
    tip: '调料先用热汤冲开再放面，这样汤有味、面不糊。'
  },
  {
    id: 'fried-egg-noodle', name: '煎蛋汤面', emoji: '🍜',
    need: ['noodle', 'egg'], extra: ['scallion'], time: 10, level: 1,
    steps: [
      '平底锅煎一个荷包蛋，边缘焦脆最好。',
      '同锅加两碗水烧开，下生抽和盐。',
      '下面条煮到软。',
      '盛碗，摆上煎蛋撒葱花。'
    ],
    tip: '煎蛋剩下的油别洗，直接加水煮面，汤会带一点焦香。'
  },
  {
    id: 'fried-instant', name: '炒方便面', emoji: '🍜',
    need: ['instantnoodle', 'egg', 'cabbage'], extra: [], time: 10, level: 1,
    steps: [
      '面饼用热水泡到八分软，捞出沥干。',
      '热油炒散鸡蛋，下白菜丝炒软。',
      '倒面，加半包调料和生抽，大火翻炒。',
      '炒到面条微微焦边最香。'
    ],
    tip: '面别泡太软，还要炒；调料包放半包就够，全放会咸。'
  },
  {
    id: 'fried-ricecake', name: '炒年糕', emoji: '🍡',
    need: ['ricecake', 'cabbage', 'sausage'], extra: ['oyster'], time: 15, level: 2,
    steps: [
      '年糕片用温水泡软分开。',
      '热油炒香火腿肠片，下白菜炒软。',
      '倒年糕，加生抽、蚝油和小半碗水。',
      '翻炒到汤汁变稠、年糕软糯即可。'
    ],
    tip: '年糕容易粘锅，水要分两次加，一边炒一边补。'
  },
  {
    id: 'bun-sandwich', name: '馒头三明治', emoji: '🍞',
    need: ['bun', 'egg', 'lettuce'], extra: ['cheese'], time: 10, level: 1,
    steps: [
      '馒头横切开，别切断。',
      '煎一个蛋，顺便把馒头切面煎到微黄。',
      '夹入煎蛋、生菜，喜欢就加一片芝士。',
      '抹点番茄酱或沙拉酱，压一下就能吃。'
    ],
    tip: '馒头煎一下再夹，比冷着夹好吃太多，还不会掉渣。'
  },
  {
    id: 'egg-toast', name: '煎蛋吐司', emoji: '🍞',
    need: ['bread', 'egg'], extra: ['cheese'], time: 8, level: 1,
    steps: [
      '吐司放进平底锅，小火烘到两面微脆。',
      '同锅煎一个蛋，撒点盐。',
      '吐司上放芝士片和煎蛋，盖上另一片。',
      '趁热切开，芝士会拉丝。'
    ],
    tip: '吐司先干烘一下，吸油少、也不容易软塌。'
  },
  {
    id: 'chive-dumpling', name: '韭菜猪肉饺子', emoji: '🥟',
    need: ['dumplingwrapper', 'chive', 'mincedpork'], extra: ['ginger', 'sesamoil'], time: 45, level: 2,
    steps: [
      '肉末加姜末、生抽、盐、一点水，顺一个方向搅上劲。',
      '韭菜切碎，先拌一勺香油裹住，再和肉馅混合。',
      '包好饺子，边缘捏紧。',
      '水开下锅，三次点凉水，饺子浮起鼓胀即熟。'
    ],
    tip: '韭菜先拌油再拌肉，能锁住水分不出汤，包的时候不会破。'
  },
  {
    id: 'cabbage-dumpling', name: '白菜猪肉饺子', emoji: '🥟',
    need: ['dumplingwrapper', 'cabbage', 'mincedpork'], extra: ['ginger', 'sesamoil'], time: 45, level: 2,
    steps: [
      '白菜剁碎，加盐腌十分钟，用手挤干水分。',
      '肉末加姜末、生抽、盐搅上劲。',
      '混合白菜，淋香油拌匀。',
      '包好下锅煮，浮起后再煮两分钟。'
    ],
    tip: '一次多包些放冷冻，工作日中午煮十个就是一顿，比外卖快。'
  },
  {
    id: 'tomato-dough-drop', name: '番茄疙瘩汤', emoji: '🍅',
    need: ['flour', 'tomato', 'egg'], extra: ['scallion'], time: 18, level: 2,
    steps: [
      '面粉放碗里，一边滴水一边用筷子搅成小疙瘩。',
      '番茄炒出汁，加两碗水烧开。',
      '把疙瘩抖散下锅，边下边搅防粘。',
      '煮三分钟，淋蛋液，加盐和葱花。'
    ],
    tip: '水要一滴一滴加，搅出来的疙瘩才小；一次倒多了就成面团了。'
  },
  {
    id: 'potato-pancake', name: '土豆丝饼', emoji: '🥔',
    need: ['potato', 'flour'], extra: ['scallion'], time: 18, level: 1,
    steps: [
      '土豆擦丝，不用洗，保留淀粉。',
      '加两勺面粉、盐、葱花拌匀，能抱团就行。',
      '平底锅放油，摊成小饼压薄。',
      '中小火两面煎到金黄酥脆。'
    ],
    tip: '土豆丝千万别泡水，淀粉洗掉了就粘不起来，煎不成饼。'
  },
  {
    id: 'zucchini-egg', name: '西葫芦炒蛋', emoji: '🥒',
    need: ['zucchini', 'egg'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '西葫芦切半月片，鸡蛋打散。',
      '热油炒蛋盛出，锅留底油炒香蒜末。',
      '下西葫芦大火炒两分钟至微软。',
      '倒回鸡蛋，加盐翻匀出锅。'
    ],
    tip: '西葫芦出水多，炒完别久放，出锅就吃最清爽。'
  },
  {
    id: 'braised-wintermelon', name: '红烧冬瓜', emoji: '🍈',
    need: ['wintermelon'], extra: ['scallion', 'oyster'], time: 18, level: 1,
    steps: [
      '冬瓜去皮切厚片，表面划几刀方便入味。',
      '平底锅少油，两面煎到微黄。',
      '加生抽、老抽、蚝油和小半碗水。',
      '小火焖八分钟，收汁撒葱花。'
    ],
    tip: '冬瓜煎过再烧，会带一点肉香，吃起来不像"水煮瓜"。'
  },
  {
    id: 'snowpea-garlic', name: '清炒荷兰豆', emoji: '🍃',
    need: ['snowpea'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '荷兰豆撕去两侧的筋，洗净。',
      '水开焯三十秒捞出。',
      '热油爆香蒜片。',
      '下荷兰豆大火快炒，加盐出锅。'
    ],
    tip: '两边的筋一定要撕，不然嚼不动；焯过再炒更翠绿。'
  },
  {
    id: 'bacon-onion', name: '培根炒洋葱', emoji: '🥓',
    need: ['bacon', 'onion'], extra: [], time: 10, level: 1,
    steps: [
      '培根切段，洋葱切丝。',
      '锅里不放油，先煎培根出油。',
      '下洋葱丝炒到透明微甜。',
      '加少许黑胡椒或生抽，翻匀出锅。'
    ],
    tip: '培根自带油和咸味，基本不用另外放油和盐。'
  },
  {
    id: 'sausage-egg', name: '火腿肠炒蛋', emoji: '🌭',
    need: ['sausage', 'egg'], extra: ['scallion'], time: 8, level: 1,
    steps: [
      '火腿肠切斜片，鸡蛋打散。',
      '热油炒蛋盛出。',
      '下火腿片煎到边缘微焦。',
      '倒回鸡蛋，加葱花翻匀。'
    ],
    tip: '火腿先煎一下会香很多，五分钟能搞定的加班午饭。'
  },
  {
    id: 'yam-fungus', name: '山药炒木耳', emoji: '🍠',
    need: ['yam', 'fungus'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '山药去皮切薄片，泡在醋水里防氧化。',
      '木耳泡发焯水一分钟。',
      '热油爆香蒜末，下山药片炒两分钟。',
      '下木耳，加盐和蚝油翻匀。'
    ],
    tip: '削山药戴手套，黏液沾手上会很痒；切好泡醋水不会发黑。'
  },
  {
    id: 'lotus-salad', name: '凉拌藕片', emoji: '🍥',
    need: ['lotus'], extra: ['garlic', 'sesamoil', 'driedchili'], time: 15, level: 1,
    steps: [
      '藕去皮切薄片，泡水冲掉淀粉。',
      '水开焯两分钟，捞出过凉水。',
      '加蒜末、生抽、醋、糖、香油。',
      '干辣椒用热油泼香，拌匀冰镇。'
    ],
    tip: '想要脆的选七孔藕，焯完立刻过凉水，口感会"咔嚓"响。'
  },
  {
    id: 'tomato-potato-soup', name: '番茄土豆汤', emoji: '🍅',
    need: ['tomato', 'potato'], extra: ['scallion'], time: 20, level: 1,
    steps: [
      '番茄切块，土豆切小滚刀块。',
      '热油炒番茄到出沙，加一勺生抽。',
      '下土豆翻炒，加两碗水烧开。',
      '小火煮十分钟到土豆软，加盐撒葱花。'
    ],
    tip: '土豆切小一点，煮到边缘化开，汤会自然变浓，不用勾芡。'
  },
  {
    id: 'bittergourd-egg', name: '苦瓜炒蛋', emoji: '🥒',
    need: ['bittergourd', 'egg'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '苦瓜对半切开去瓤，切薄片，撒盐抓五分钟冲净。',
      '水开焯三十秒捞出，能去大半苦味。',
      '热油炒蛋盛出，下蒜末和苦瓜翻炒。',
      '倒回鸡蛋，加盐翻匀。'
    ],
    tip: '盐抓 + 焯水两步做完，苦味会温和很多，夏天吃很清爽。'
  },
  {
    id: 'luffa-egg', name: '丝瓜炒蛋', emoji: '🥒',
    need: ['luffa', 'egg'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '丝瓜去皮切滚刀块，鸡蛋打散。',
      '热油炒蛋至半熟盛出。',
      '下蒜末和丝瓜，中火炒到丝瓜变软出水。',
      '倒回鸡蛋，加盐轻推几下出锅。'
    ],
    tip: '丝瓜会出清甜的汤汁，拌饭特别香，别收太干。'
  },
  {
    id: 'enoki-beef', name: '金针菇肥牛卷', emoji: '🍄',
    need: ['enoki', 'beef'], extra: ['garlic', 'oyster'], time: 20, level: 2,
    steps: [
      '金针菇去根撕开，用牛肉片卷起来，接口朝下。',
      '平底锅少油，接口朝下先煎定型。',
      '翻面煎至变色，加蒜末。',
      '淋生抽、蚝油和一点水，收汁即可。'
    ],
    tip: '肥牛片薄不用久煎，卷紧一点下锅才不会散。'
  },
  {
    id: 'mushroom-pork', name: '平菇炒肉', emoji: '🍄',
    need: ['mushroom', 'porkloin'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '平菇撕条，焯水一分钟挤干水分。',
      '肉片腌制十分钟，热油滑散盛出。',
      '爆香蒜末，下平菇炒到微干。',
      '倒回肉片，加蚝油和生抽翻匀。'
    ],
    tip: '平菇一定要挤干水，不然炒出来是"平菇汤"。'
  },
  {
    id: 'shiitake-bokchoy', name: '香菇青菜', emoji: '🍄',
    need: ['shiitake', 'bokchoy'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '香菇切片，青菜洗净对半切。',
      '水开焯青菜二十秒捞出摆盘。',
      '热油炒香蒜末，下香菇炒软。',
      '加蚝油、生抽和少许水烧开，浇在青菜上。'
    ],
    tip: '青菜和香菇分开处理，青菜才翠绿不变色。'
  },
  {
    id: 'tofu-shrimp-soup', name: '豆腐虾仁汤', emoji: '🍲',
    need: ['tofu', 'shrimp'], extra: ['ginger', 'scallion'], time: 18, level: 1,
    steps: [
      '豆腐切小块，虾去虾线。',
      '姜丝爆香，加两碗水烧开。',
      '下豆腐小火煮五分钟，再下虾煮到变红。',
      '加盐、白胡椒粉，撒葱花。'
    ],
    tip: '低油低盐的一碗，胃不舒服或者想清淡一天的时候最合适。'
  },
  {
    id: 'braised-chicken-potato', name: '土豆烧鸡块', emoji: '🍗',
    need: ['potato', 'chickenleg'], extra: ['ginger', 'oyster', 'wine'], time: 35, level: 2,
    steps: [
      '鸡腿剁块焯水，土豆切滚刀块。',
      '热油炒香姜片，下鸡块炒到表面微黄。',
      '加料酒、生抽、老抽，倒热水没过，炖十五分钟。',
      '下土豆再炖十五分钟，加盐收汁。'
    ],
    tip: '土豆晚放，早放会炖成泥，汤就浑了。'
  },
  {
    id: 'carrot-egg', name: '胡萝卜炒蛋', emoji: '🥕',
    need: ['carrot', 'egg'], extra: ['scallion'], time: 12, level: 1,
    steps: [
      '胡萝卜擦丝或切细丝，鸡蛋打散。',
      '热油炒蛋盛出。',
      '锅里补油，下胡萝卜丝中火炒三分钟至软。',
      '倒回鸡蛋，加盐和葱花翻匀。'
    ],
    tip: '胡萝卜里的胡萝卜素是脂溶的，用油炒过才好吸收，别水煮。'
  },
  {
    id: 'garlic-babycabbage', name: '蒜蓉娃娃菜', emoji: '🥬',
    need: ['babycabbage'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '娃娃菜竖着切成四条，洗净沥干。',
      '热油下大量蒜末，小火炒到微微发黄。',
      '加生抽、蚝油和小半碗水烧开。',
      '下娃娃菜，盖盖焖五分钟至软，收汁装盘。'
    ],
    tip: '娃娃菜比大白菜嫩，焖五分钟就够，久了会散架。'
  },
  {
    id: 'babycabbage-vermicelli', name: '娃娃菜蒸粉丝', emoji: '🥬',
    need: ['babycabbage', 'vermicelli'], extra: ['garlic', 'oyster'], time: 20, level: 1,
    steps: [
      '粉丝泡软铺在盘底，娃娃菜切条摆在上面。',
      '蒜末用热油激香，加蚝油、生抽拌成酱。',
      '酱铺在娃娃菜上，水开上锅蒸十分钟。',
      '出锅撒葱花，把盘里的汤汁淋回去。'
    ],
    tip: '蒸出来的汤汁是精华，别倒掉，拌粉丝特别鲜。'
  },
  {
    id: 'sprout-vinegar', name: '醋溜豆芽', emoji: '🌱',
    need: ['beansprout'], extra: ['garlic', 'driedchili'], time: 10, level: 1,
    steps: [
      '豆芽洗净掐去根须，沥干水。',
      '热锅热油，下蒜末和干辣椒爆香。',
      '倒豆芽大火快炒一分钟。',
      '沿锅边淋一勺醋，加盐和少许糖，翻两下出锅。'
    ],
    tip: '豆芽一定要大火快炒、全程不超过两分钟，才会脆生生不出水。'
  },
  {
    id: 'cauliflower-pork', name: '花菜炒肉', emoji: '🥦',
    need: ['cauliflower', 'porkbelly'], extra: ['garlic', 'wine'], time: 20, level: 2,
    steps: [
      '花菜掰小朵，盐水泡十分钟，焯水一分钟。',
      '五花肉切片，锅里不放油小火煸出油。',
      '加蒜片炒香，淋料酒和生抽。',
      '倒花菜大火翻炒两分钟，加盐出锅。'
    ],
    tip: '花菜焯过再炒容易熟透；不焯的话要多炒一会儿，加一勺水焖。'
  },
  {
    id: 'radish-pork', name: '白萝卜炒肉丝', emoji: '🥬',
    need: ['radish', 'porkloin'], extra: ['garlic', 'wine'], time: 18, level: 1,
    steps: [
      '白萝卜切细丝，撒少许盐抓五分钟挤掉水。',
      '肉丝腌十分钟，热油滑散盛出。',
      '爆香蒜末，下萝卜丝炒三分钟至半透明。',
      '倒回肉丝，加生抽翻匀，撒葱花。'
    ],
    tip: '萝卜先杀水再炒，不会出半锅汤，甜味也更集中。'
  },
  {
    id: 'radish-ribs-soup', name: '萝卜排骨汤', emoji: '🍖',
    need: ['radish', 'ribs'], extra: ['ginger', 'wine'], time: 70, level: 1,
    steps: [
      '排骨冷水下锅焯水，撇净浮沫捞出。',
      '加姜片和足量水，大火烧开转小火炖四十分钟。',
      '白萝卜切滚刀块下锅，再炖二十分钟。',
      '加盐和白胡椒粉，撒葱花。'
    ],
    tip: '萝卜别太早放，炖久了会化；关火前二十分钟下刚好。'
  },
  {
    id: 'steamed-egg', name: '蒸水蛋', emoji: '🥚',
    need: ['egg'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '两个鸡蛋打散，加一小撮盐。',
      '倒入 1.5 倍的温水搅匀，用筛子滤一遍。',
      '盖上盘子或保鲜膜，水开上锅中火蒸十分钟。',
      '出锅淋一勺生抽、几滴香油，撒葱花。'
    ],
    tip: '水和蛋的比例 1.5:1、一定要温水、一定要过筛，这三点做到就跟布丁一样。'
  },
  {
    id: 'pepper-chicken', name: '青椒鸡丁', emoji: '🍗',
    need: ['chickenbreast', 'greenpepper'], extra: ['garlic', 'oyster', 'starch'], time: 18, level: 2,
    steps: [
      '鸡胸肉切丁，加生抽、淀粉抓匀腌十分钟。',
      '青椒切丁，蒜切末。',
      '热油下鸡丁滑炒至变白，盛出。',
      '下蒜末和青椒炒香，倒回鸡丁，加蚝油翻匀。'
    ],
    tip: '鸡胸肉容易柴，腌的时候加淀粉、炒到刚变白就起锅，嫩得多。'
  },
  {
    id: 'cold-chicken', name: '凉拌鸡丝', emoji: '🍗',
    need: ['chickenbreast', 'cucumber'], extra: ['garlic', 'sesamoil', 'driedchili'], time: 20, level: 1,
    steps: [
      '鸡胸肉冷水下锅，加姜片煮十二分钟，捞出放凉。',
      '黄瓜切丝铺在盘底，鸡肉顺纹理撕成丝。',
      '蒜末、生抽、醋、糖、香油调成料汁。',
      '淋在鸡丝上，喜欢辣就泼一勺辣椒油。'
    ],
    tip: '鸡肉煮好别马上撕，放凉或过冰水再撕才不散，口感也更弹。'
  },

  /* ── 补充菜谱（第二轮扩充） ── */
  {
    id: 'greenbean-pork', name: '豆角炒肉丝', emoji: '🌿',
    need: ['greenbean', 'porkloin'], extra: ['garlic', 'starch'], time: 15, level: 1,
    steps: [
      '豆角掐头去尾掰成段，里脊切丝，加生抽和淀粉抓匀。',
      '热油下肉丝滑散至变白，盛出。',
      '底油下蒜末，倒入豆角中火煸到表皮起皱，约四分钟。',
      '倒回肉丝，加盐、生抽翻匀，沿锅边淋一点水焖半分钟。'
    ],
    tip: '豆角要煸到皮起皱、颜色变深才算熟，半生的豆角吃了会闹肚子。'
  },
  {
    id: 'dryfried-greenbean', name: '干煸豆角', emoji: '🌶️',
    need: ['greenbean'], extra: ['garlic', 'driedchili', 'sichuan', 'douban'], time: 18, level: 2,
    steps: [
      '豆角掰段洗净，一定要晾干水分。',
      '油稍多，中小火慢煸到豆角起皱发蔫，捞出沥油。',
      '锅里留底油，下花椒、干辣椒、蒜末和一勺豆瓣炒出红油。',
      '倒回豆角，加盐和一点糖，大火翻匀出锅。'
    ],
    tip: '豆角带水下锅既炸油又煸不出虎皮，晾干这步别省。'
  },
  {
    id: 'potato-ribs', name: '土豆炖排骨', emoji: '🍖',
    need: ['potato', 'ribs'], extra: ['ginger', 'wine'], time: 50, level: 2,
    steps: [
      '排骨冷水下锅，加姜片和料酒焯水，撇净浮沫捞出冲净。',
      '锅里少油，下姜片和排骨煎到边缘微黄，淋一勺料酒。',
      '加生抽、老抽上色，倒热水没过排骨，小火炖二十五分钟。',
      '土豆切滚刀块下锅，再炖十五分钟，加盐收汁。'
    ],
    tip: '炖排骨一定加热水，冷水一激肉会紧，怎么炖都不烂。'
  },
  {
    id: 'sweet-sour-ribs', name: '糖醋排骨', emoji: '🍖',
    need: ['ribs'], extra: ['wine', 'sesamoil'], time: 45, level: 2,
    steps: [
      '排骨焯水洗净沥干。',
      '一勺料酒、两勺生抽、三勺糖、四勺醋先调成料汁备用。',
      '少油下排骨煎至两面金黄，倒入料汁和半碗热水。',
      '小火焖二十五分钟，大火收成亮汁，淋几滴香油。'
    ],
    tip: '糖醋比例按 1 酒 2 抽 3 糖 4 醋记，第一次做也不会失手。'
  },
  {
    id: 'garlic-steam-ribs', name: '蒜香蒸排骨', emoji: '🍖',
    need: ['ribs'], extra: ['garlic', 'douchi', 'starch'], time: 35, level: 1,
    steps: [
      '排骨斩小块，冷水泡十分钟去血水，沥干。',
      '蒜末、豆豉碎、生抽、蚝油、糖、淀粉抓匀，腌二十分钟。',
      '平铺在盘里，水开后大火蒸二十分钟。',
      '出锅撒葱花，盘底的汁拌饭极好。'
    ],
    tip: '腌的时候加一勺淀粉，蒸出来的排骨才滑嫩不柴。'
  },
  {
    id: 'pepper-pork-shred', name: '青椒肉丝', emoji: '🌶️',
    need: ['greenpepper', 'porkloin'], extra: ['garlic', 'starch'], time: 12, level: 1,
    steps: [
      '里脊顺纹切细丝，加生抽、淀粉、一点油抓匀。',
      '青椒去籽切丝，蒜切片。',
      '热锅温油下肉丝快速滑散，变白立刻盛出。',
      '下蒜片、青椒丝大火炒半分钟，倒回肉丝加盐翻匀。'
    ],
    tip: '肉丝腌的时候加点油封住水分，下锅不粘也不老。'
  },
  {
    id: 'yuxiang-pork', name: '鱼香肉丝', emoji: '🥕',
    need: ['porkloin', 'fungus', 'carrot'], extra: ['douban', 'garlic'], time: 20, level: 2,
    steps: [
      '木耳提前泡发切丝，胡萝卜切丝，里脊切丝上浆。',
      '生抽、醋、糖、淀粉、两勺水调成鱼香汁。',
      '热油滑散肉丝盛出，底油下豆瓣、蒜末炒出红油。',
      '下木耳胡萝卜炒软，倒回肉丝，淋鱼香汁翻匀收稠。'
    ],
    tip: '鱼香味的魂是糖醋比例，汁先调好再下锅，手忙脚乱也不会咸。'
  },
  {
    id: 'kungpao-chicken', name: '宫保鸡丁', emoji: '🥜',
    need: ['chickenbreast', 'peanut'], extra: ['driedchili', 'sichuan', 'douban'], time: 20, level: 2,
    steps: [
      '鸡胸切丁，加生抽、淀粉腌十分钟；花生米小火炸香晾凉。',
      '生抽、醋、糖、淀粉调成碗汁。',
      '热油下鸡丁炒散至变白，推到一边，下花椒、干辣椒、豆瓣炒香。',
      '倒碗汁大火翻匀，关火后撒花生米。'
    ],
    tip: '花生米最后放，早了就软了，脆的才叫宫保。'
  },
  {
    id: 'huangmen-chicken', name: '黄焖鸡', emoji: '🍗',
    need: ['chickenleg', 'shiitake', 'greenpepper'], extra: ['ginger', 'wine', 'oyster'], time: 35, level: 2,
    steps: [
      '鸡腿剁块，冷水下锅焯去血沫。',
      '少油下姜片、鸡块煎到微黄，淋料酒。',
      '加生抽、老抽、蚝油，倒热水没过，放香菇小火焖二十分钟。',
      '下青椒块再焖三分钟，大火收汁。'
    ],
    tip: '汤汁别收太干，留小半碗浇在米饭上才是黄焖鸡的精髓。'
  },
  {
    id: 'ants-tree', name: '蚂蚁上树', emoji: '🍜',
    need: ['vermicelli', 'mincedpork'], extra: ['douban', 'garlic', 'scallion'], time: 20, level: 1,
    steps: [
      '粉丝温水泡软，剪两刀；肉末备好。',
      '热油下肉末炒散出油，加蒜末和一勺豆瓣炒香。',
      '加半碗水、生抽烧开，下粉丝。',
      '中火翻拌到汤汁被吸干，撒葱花。'
    ],
    tip: '水别放多，粉丝吸汤很快，泡到刚好裹住就停。'
  },
  {
    id: 'mince-eggplant', name: '肉末茄子', emoji: '🍆',
    need: ['eggplant', 'mincedpork'], extra: ['garlic', 'douban'], time: 18, level: 1,
    steps: [
      '茄子切条，撒点盐抓匀静置十分钟，挤掉水分。',
      '热油下茄子煎到软塌微黄，盛出。',
      '底油炒散肉末，加蒜末、豆瓣炒香。',
      '倒回茄子，加生抽、少许糖，翻匀焖两分钟。'
    ],
    tip: '茄子先用盐杀水，能少吃一半油，也不容易糊锅。'
  },
  {
    id: 'cabbage-pork-vermicelli', name: '白菜猪肉炖粉条', emoji: '🥬',
    need: ['cabbage', 'porkbelly', 'vermicelli'], extra: ['ginger', 'wine'], time: 40, level: 1,
    steps: [
      '五花肉切厚片，粉丝温水泡软。',
      '锅里不放油，先煸五花肉到出油微卷，下姜片、料酒。',
      '加生抽、老抽，倒热水，放白菜帮炖十分钟。',
      '下白菜叶和粉丝，再炖八分钟，加盐调味。'
    ],
    tip: '五花肉先干煸出油，整锅菜香一半来自这步。'
  },
  {
    id: 'sweet-sour-loin', name: '糖醋里脊', emoji: '🥩',
    need: ['porkloin'], extra: ['starch', 'ketchup'], time: 25, level: 2,
    steps: [
      '里脊切条，加盐、料酒腌十分钟，裹一层厚厚的淀粉糊。',
      '油温六成热下锅炸到定型捞出，升高油温复炸到金黄。',
      '锅里放番茄酱、糖、醋、两勺水熬到起泡。',
      '倒入里脊快速翻匀，让每条都裹上酱汁。'
    ],
    tip: '复炸十秒是脆的关键，一次炸透的话放两分钟就软了。'
  },
  {
    id: 'mince-steamed-egg', name: '肉末蒸蛋', emoji: '🥚',
    need: ['mincedpork', 'egg'], extra: ['scallion'], time: 20, level: 1,
    steps: [
      '鸡蛋打散，加一点五倍温水搅匀，过筛去泡沫。',
      '碗上盖盘子，水开后中小火蒸十分钟。',
      '热油炒散肉末，加生抽、少许水煮成浇头。',
      '浇在蒸蛋上，撒葱花。'
    ],
    tip: '蛋液过筛、盖盖子、中小火，三点做到就是镜面蒸蛋。'
  },
  {
    id: 'bacon-potato', name: '培根土豆片', emoji: '🥓',
    need: ['bacon', 'potato'], extra: ['garlic', 'driedchili'], time: 15, level: 1,
    steps: [
      '土豆切薄片，水里冲一下沥干；培根切段。',
      '锅里不放油，先煸培根出油。',
      '下蒜末、干辣椒炒香，倒入土豆片中火煎炒五分钟。',
      '加盐和黑胡椒，土豆边缘焦黄即可。'
    ],
    tip: '培根本身够咸，盐最后尝了再放。'
  },
  {
    id: 'bacon-enoki', name: '培根金针菇卷', emoji: '🥓',
    need: ['bacon', 'enoki'], extra: ['oyster'], time: 20, level: 1,
    steps: [
      '金针菇切去根部撕散，培根对半切开。',
      '取一撮金针菇用培根卷起，接口朝下用牙签固定。',
      '平底锅小火煎，接口先贴锅，煎到两面焦香。',
      '淋一点蚝油和生抽，翻匀即可。'
    ],
    tip: '一定要小火，培根焦了金针菇还没熟就不好吃了。'
  },
  {
    id: 'blackpepper-beef', name: '黑椒牛柳', emoji: '🥩',
    need: ['beef', 'onion'], extra: ['blackpepper', 'starch'], time: 20, level: 2,
    steps: [
      '牛肉逆纹切条，加生抽、淀粉、一点水抓匀腌十分钟。',
      '洋葱切粗丝。',
      '大火热油下牛柳快速滑炒到变色立刻盛出。',
      '下洋葱炒软，倒回牛柳，撒大量黑胡椒和盐，翻两下出锅。'
    ],
    tip: '牛肉逆着纹理切，咬起来才不塞牙。'
  },
  {
    id: 'boiled-beef', name: '水煮牛肉', emoji: '🌶️',
    need: ['beef', 'beansprout'], extra: ['douban', 'driedchili', 'sichuan', 'garlic'], time: 30, level: 3,
    steps: [
      '牛肉逆纹切薄片，加生抽、淀粉、蛋清抓匀。',
      '豆芽焯水铺在碗底。',
      '锅里炒香豆瓣、蒜末，加水烧开，牛肉片一片片下锅，变白就捞进碗里。',
      '汤汁浇上，撒蒜末、干辣椒、花椒，泼一勺滚油。'
    ],
    tip: '牛肉下锅别搅，定型了再推，不然会散成肉末汤。'
  },
  {
    id: 'cumin-beef', name: '孜然牛肉', emoji: '🥩',
    need: ['beef', 'onion'], extra: ['cumin', 'driedchili'], time: 18, level: 1,
    steps: [
      '牛肉切片，加生抽、淀粉腌十分钟。',
      '洋葱切丝。',
      '大火热油下牛肉快炒至变色，盛出。',
      '下洋葱、干辣椒炒香，倒回牛肉，撒一大把孜然和盐翻匀。'
    ],
    tip: '孜然最后撒，早放会炒糊发苦。'
  },
  {
    id: 'tomato-shrimp', name: '番茄虾仁', emoji: '🍤',
    need: ['shrimp', 'tomato'], extra: ['garlic', 'starch'], time: 15, level: 1,
    steps: [
      '虾去壳去虾线，加盐、淀粉抓匀；番茄切块。',
      '热油下虾仁炒到变红卷起，盛出。',
      '底油下蒜末、番茄炒出汁，加半勺糖和盐。',
      '倒回虾仁翻匀，汤汁略收即可。'
    ],
    tip: '虾仁只要一变红就起锅，多炒半分钟就硬了。'
  },
  {
    id: 'shrimp-fried-rice', name: '虾仁蛋炒饭', emoji: '🍚',
    need: ['rice', 'shrimp', 'egg'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '隔夜饭打散，虾仁用盐和料酒抓一下。',
      '热油炒散鸡蛋盛出，再下虾仁炒到变红。',
      '下米饭大火翻炒到粒粒分开。',
      '倒回鸡蛋，加盐、葱花，翻匀出锅。'
    ],
    tip: '饭要用冷的隔夜饭，新煮的饭水分太多，炒不散。'
  },
  {
    id: 'fried-clam', name: '爆炒花蛤', emoji: '🐚',
    need: ['clam'], extra: ['garlic', 'douban', 'wine', 'driedchili'], time: 15, level: 2,
    steps: [
      '花蛤放盐水里吐沙一小时，搓洗干净。',
      '热油下蒜末、干辣椒、一勺豆瓣炒香。',
      '倒入花蛤大火翻炒，淋料酒，加盖焖两分钟。',
      '壳全开口后加生抽翻匀，撒葱花出锅。'
    ],
    tip: '壳没开口的就挑出来扔掉，那是死的。'
  },
  {
    id: 'squid-chive', name: '韭菜炒鱿鱼', emoji: '🦑',
    need: ['squid', 'chive'], extra: ['garlic', 'wine'], time: 15, level: 1,
    steps: [
      '鱿鱼切圈或花刀，水开下锅烫十秒立刻捞出。',
      '韭菜切段，蒜切末。',
      '热油爆香蒜末，下鱿鱼大火快炒，淋料酒。',
      '下韭菜炒三十秒，加盐出锅。'
    ],
    tip: '鱿鱼先焯再炒，全程不超过一分钟，久了像嚼橡皮。'
  },
  {
    id: 'seaweed-egg-soup', name: '紫菜蛋花汤', emoji: '🍲',
    need: ['seaweed', 'egg'], extra: ['scallion', 'sesamoil'], time: 8, level: 1,
    steps: [
      '紫菜撕小块放碗里，鸡蛋打散。',
      '锅里两碗水烧开，加盐调味。',
      '关小火，蛋液细细淋成蛋花。',
      '连汤冲进紫菜碗里，滴香油撒葱花。'
    ],
    tip: '紫菜不用煮，热汤一冲就开，煮久了发黏。'
  },
  {
    id: 'scallion-tofu', name: '小葱拌豆腐', emoji: '🧈',
    need: ['tofu'], extra: ['scallion', 'sesamoil'], time: 5, level: 1,
    steps: [
      '嫩豆腐整块放盘里，用刀划成小块。',
      '撒一小撮盐，静置五分钟倒掉渗出的水。',
      '铺上大量葱花。',
      '淋生抽和香油，吃前拌开。'
    ],
    tip: '豆腐先撒盐出水，拌完才不会一盘子汤。'
  },
  {
    id: 'tofu-egg', name: '豆腐抱蛋', emoji: '🍳',
    need: ['tofu', 'egg'], extra: ['scallion', 'oyster'], time: 12, level: 1,
    steps: [
      '嫩豆腐切厚片，鸡蛋打散。',
      '平底锅少油，豆腐两面各煎一分钟。',
      '倒入蛋液，小火盖盖焖三分钟到凝固。',
      '淋蚝油和生抽调成的汁，撒葱花。'
    ],
    tip: '全程小火，蛋才会嫩；火大了底部焦、上面还是生的。'
  },
  {
    id: 'tomato-tofu-soup', name: '番茄豆腐汤', emoji: '🍲',
    need: ['tomato', 'tofu'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '番茄切块，豆腐切小方块。',
      '少油炒番茄到出汁，加两碗水烧开。',
      '下豆腐小火煮五分钟。',
      '加盐、少许白胡椒，撒葱花。'
    ],
    tip: '豆腐下锅后别大火滚，容易碎成渣。'
  },
  {
    id: 'fuzhu-cucumber', name: '腐竹拌黄瓜', emoji: '🥒',
    need: ['fuzhu', 'cucumber'], extra: ['garlic', 'sesamoil', 'driedchili'], time: 20, level: 1,
    steps: [
      '腐竹提前用温水泡软，泡到中间没有硬芯。',
      '腐竹切段，水开焯一分钟，捞出过凉。',
      '黄瓜拍碎切段，蒜切末。',
      '加生抽、醋、糖、香油、蒜末拌匀，静置十分钟更入味。'
    ],
    tip: '腐竹别用开水泡，外面烂了里面还是硬的。'
  },
  {
    id: 'hand-cabbage', name: '手撕包菜', emoji: '🥬',
    need: ['cabbage'], extra: ['garlic', 'driedchili'], time: 10, level: 1,
    steps: [
      '包菜手撕成大片，洗净甩干水。',
      '锅烧到冒烟，放油，下蒜片和干辣椒。',
      '倒包菜大火爆炒一分钟。',
      '加生抽、醋、盐，翻两下立刻出锅。'
    ],
    tip: '手撕比刀切更入味，锅一定要够热，才有锅气。'
  },
  {
    id: 'steamed-eggplant', name: '蒜蓉蒸茄子', emoji: '🍆',
    need: ['eggplant'], extra: ['garlic', 'scallion'], time: 20, level: 1,
    steps: [
      '茄子切长条摆盘，水开蒸十二分钟。',
      '蒜末一半用油炒香，和另一半生蒜末混在一起。',
      '加生抽、蚝油、糖调成蒜蓉汁。',
      '浇在茄子上，再蒸两分钟，撒葱花。'
    ],
    tip: '生蒜提香、熟蒜去辣，两半混着用味道最有层次。'
  },
  {
    id: 'asparagus-garlic', name: '清炒芦笋', emoji: '🌿',
    need: ['asparagus'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '芦笋切掉老根，削掉下半段硬皮，斜切段。',
      '水开加盐焯三十秒，捞出过凉。',
      '热油下蒜末炒香。',
      '倒芦笋大火快炒，加盐出锅。'
    ],
    tip: '老根用手掰，自然断的地方就是能吃的分界。'
  },
  {
    id: 'asparagus-shrimp', name: '芦笋炒虾仁', emoji: '🌿',
    need: ['asparagus', 'shrimp'], extra: ['garlic', 'starch'], time: 15, level: 1,
    steps: [
      '虾仁加盐、淀粉抓匀；芦笋斜切段焯水三十秒。',
      '热油下虾仁炒到变红，盛出。',
      '底油下蒜末，倒芦笋翻炒。',
      '倒回虾仁，加盐和一点蚝油，翻匀出锅。'
    ],
    tip: '两样都是快熟的东西，锅要热、手要快。'
  },
  {
    id: 'okra-garlic', name: '蒜蓉秋葵', emoji: '🌿',
    need: ['okra'], extra: ['garlic', 'sesamoil'], time: 10, level: 1,
    steps: [
      '秋葵搓洗干净，整根下开水焯两分钟。',
      '捞出过凉，切去蒂部，摆盘。',
      '蒜末加生抽、香油、一点糖调汁。',
      '浇在秋葵上即可。'
    ],
    tip: '秋葵整根焯水，切了再焯黏液全跑汤里了。'
  },
  {
    id: 'lotus-ribs-soup', name: '莲藕排骨汤', emoji: '🍲',
    need: ['lotus', 'ribs'], extra: ['ginger', 'wine'], time: 60, level: 1,
    steps: [
      '排骨焯水冲净，莲藕去皮切滚刀块。',
      '排骨、姜片、料酒一起放锅里，加足冷水。',
      '大火烧开转小火炖四十分钟。',
      '下莲藕再炖二十分钟，出锅前加盐。'
    ],
    tip: '盐一定最后放，早放肉会柴，汤也不清甜。'
  },
  {
    id: 'yam-ribs-soup', name: '山药排骨汤', emoji: '🍲',
    need: ['yam', 'ribs'], extra: ['ginger'], time: 50, level: 1,
    steps: [
      '排骨焯水，山药去皮切段（戴手套削，不然会痒）。',
      '排骨加姜片和足量水，小火炖三十五分钟。',
      '下山药再炖十二分钟。',
      '加盐和白胡椒即可。'
    ],
    tip: '山药久煮会化，最后十几分钟放刚好粉糯不散。'
  },
  {
    id: 'garlic-bokchoy', name: '清炒小青菜', emoji: '🥬',
    need: ['bokchoy'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '青菜一片片洗净，沥干水。',
      '热锅热油下蒜末炒香。',
      '倒青菜大火快炒，菜叶一塌就加盐。',
      '翻匀立刻出锅，别久炒。'
    ],
    tip: '青菜出水快，全程一两分钟，久炒就发黄发苦。'
  },
  {
    id: 'chive-sprout', name: '韭菜炒豆芽', emoji: '🌱',
    need: ['chive', 'beansprout'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '豆芽洗净，韭菜切段，蒜切末。',
      '热油下蒜末，倒豆芽大火炒一分钟。',
      '下韭菜段快炒三十秒。',
      '加盐和一点醋，翻匀出锅。'
    ],
    tip: '豆芽掐掉根须口感更好，懒得掐也没关系。'
  },
  {
    id: 'pancake-egg', name: '手抓饼加蛋', emoji: '🥞',
    need: ['frozenpancake', 'egg'], extra: ['scallion'], time: 8, level: 1,
    steps: [
      '冷锅放饼，不用放油，小火烙到饼身鼓起。',
      '翻面后打个鸡蛋在饼上，撒葱花，把蛋抹开。',
      '再翻面煎到蛋凝固。',
      '卷起来切开，可以夹生菜或火腿。'
    ],
    tip: '手抓饼本身有油，锅干着烙才酥，加油反而软。'
  },
  {
    id: 'pancake-bacon', name: '手抓饼卷培根', emoji: '🥞',
    need: ['frozenpancake', 'bacon', 'lettuce'], extra: [], time: 10, level: 1,
    steps: [
      '培根先小火煎到微焦，盛出。',
      '饼下锅两面烙酥。',
      '铺生菜、培根，挤点番茄酱。',
      '卷起对折，趁热吃。'
    ],
    tip: '生菜一定要擦干，带水会把酥皮泡软。'
  },
  {
    id: 'omurice', name: '蛋包饭', emoji: '🍳',
    need: ['rice', 'egg'], extra: ['ketchup', 'scallion'], time: 20, level: 2,
    steps: [
      '隔夜饭加番茄酱炒匀成番茄炒饭，盛出堆成椭圆。',
      '两个鸡蛋加一点盐打散。',
      '小火热锅，倒蛋液摊成蛋皮，表面还湿时就关火。',
      '把蛋皮盖在饭上，淋番茄酱即可。'
    ],
    tip: '蛋皮不用翻面，表面半熟时盖上去，靠余温焖熟最嫩。'
  },
  {
    id: 'chicken-cold-noodle', name: '鸡丝凉面', emoji: '🍜',
    need: ['noodle', 'chickenbreast', 'cucumber'], extra: ['garlic', 'sesamoil'], time: 25, level: 1,
    steps: [
      '鸡胸肉冷水下锅，加姜片煮十二分钟，放凉撕成丝。',
      '面条煮熟后过凉水，沥干拌一点油防粘。',
      '黄瓜切丝，蒜末加生抽、醋、糖、香油调成料汁。',
      '面、鸡丝、黄瓜装碗，淋汁拌匀。'
    ],
    tip: '面过完凉水一定要沥干，不然料汁会被稀释。'
  },
  {
    id: 'sour-noodle', name: '酸汤面', emoji: '🍜',
    need: ['noodle'], extra: ['garlic', 'scallion', 'driedchili', 'sesamoil'], time: 12, level: 1,
    steps: [
      '碗里放蒜末、葱花、干辣椒段，泼一勺滚油。',
      '加生抽、醋、一点糖和盐，冲入半碗开水。',
      '面条另锅煮熟，捞进汤里。',
      '喜欢的话卧一个荷包蛋。'
    ],
    tip: '醋分两次放：泼油时放一半，出锅前再补一半，酸香更足。'
  },
  {
    id: 'beef-rice', name: '洋葱牛肉盖饭', emoji: '🍚',
    need: ['rice', 'beef', 'onion'], extra: ['blackpepper', 'starch'], time: 20, level: 1,
    steps: [
      '牛肉切薄片，加生抽、淀粉腌十分钟；洋葱切丝。',
      '锅里少油炒洋葱到半透明。',
      '加生抽、糖、半碗水烧开，把牛肉铺上去。',
      '中小火煮两分钟，撒黑胡椒，连汁浇在米饭上。'
    ],
    tip: '牛肉铺上去就别翻，定住了再动，嫩得多。'
  },
  {
    id: 'tomato-chicken-rice', name: '番茄鸡腿饭', emoji: '🍚',
    need: ['rice', 'chickenleg', 'tomato'], extra: ['garlic'], time: 35, level: 1,
    steps: [
      '鸡腿去骨切块，加生抽、料酒腌十分钟。',
      '热油下蒜末、鸡腿煎到表面金黄。',
      '下番茄块炒出汁，加半碗水小火焖十分钟。',
      '加盐收汁，连汁浇在米饭上。'
    ],
    tip: '番茄多放一个，汤汁才够拌一整碗饭。'
  },
  {
    id: 'wintermelon-shrimp-soup', name: '冬瓜虾仁汤', emoji: '🍲',
    need: ['wintermelon', 'shrimp'], extra: ['ginger', 'scallion'], time: 20, level: 1,
    steps: [
      '冬瓜去皮切薄片，虾去壳去虾线。',
      '少油下姜丝，倒冬瓜炒一分钟。',
      '加两碗水烧开，煮到冬瓜透明。',
      '下虾仁煮一分钟，加盐撒葱花。'
    ],
    tip: '冬瓜切薄一点，五分钟就透明，汤也更清。'
  },
  {
    id: 'corn-pancake', name: '玉米烙', emoji: '🌽',
    need: ['corn', 'flour'], extra: ['starch'], time: 20, level: 2,
    steps: [
      '玉米粒焯熟沥干，趁热拌淀粉和面粉，让每粒都裹上粉。',
      '平底锅多放油烧热，倒出大半留底油。',
      '把玉米粒铺平压紧，小火煎定型。',
      '沿锅边倒回热油，炸到酥脆，捞出撒糖。'
    ],
    tip: '玉米粒一定要沥干，带水裹不上粉，一煎就散。'
  },
  {
    id: 'pickled-pork-noodle', name: '酸菜肉丝面', emoji: '🍜',
    need: ['pickled', 'noodle', 'porkloin'], extra: ['garlic', 'driedchili'], time: 20, level: 1,
    steps: [
      '酸菜洗净挤干切碎，里脊切丝。',
      '热油炒散肉丝，下蒜末、干辣椒、酸菜炒出酸香。',
      '加两碗水烧开，煮三分钟成汤。',
      '面条另锅煮熟捞入碗中，浇汤。'
    ],
    tip: '酸菜先干锅炒一分钟去水汽，酸味更干净。'
  },
  {
    id: 'pickled-fish', name: '酸菜鱼', emoji: '🐟',
    need: ['pickled', 'fish'], extra: ['garlic', 'driedchili', 'sichuan', 'wine'], time: 35, level: 3,
    steps: [
      '鱼去骨片成薄片，加盐、料酒、淀粉抓匀腌十分钟，鱼骨另放。',
      '热油下酸菜、蒜末炒香，加开水烧滚。',
      '先下鱼骨煮五分钟，再逐片下鱼片，变白就关火。',
      '盛出后撒蒜末、干辣椒、花椒，泼滚油。'
    ],
    tip: '鱼片一定要最后下、最先进嘴，汤滚着放一会儿就老了。'
  },
  {
    id: 'cabbage-ricecake', name: '白菜炒年糕', emoji: '🍡',
    need: ['ricecake', 'cabbage'], extra: ['oyster'], time: 15, level: 1,
    steps: [
      '年糕片温水泡五分钟分开，白菜切丝。',
      '热油下白菜炒软。',
      '下年糕，加生抽、蚝油和半碗水。',
      '中小火翻炒到汤汁浓稠裹住年糕。'
    ],
    tip: '年糕容易粘锅，水别收太干，勤翻两下。'
  },
  {
    id: 'garlicsprout-tofu', name: '蒜薹炒豆干', emoji: '🌿',
    need: ['garlicsprout', 'driedtofu'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '蒜薹掐掉老根切段，豆干切条。',
      '水开下蒜薹焯三十秒，捞出。',
      '热油下蒜末、豆干煎到边缘微黄。',
      '倒蒜薹，加生抽、盐，大火翻匀。'
    ],
    tip: '蒜薹先焯一下，炒的时候才不会外焦里生。'
  },
  {
    id: 'lotus-pork', name: '藕片炒肉丝', emoji: '🍥',
    need: ['lotus', 'porkloin'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '莲藕去皮切薄片，泡水防氧化；里脊切丝上浆。',
      '热油滑散肉丝，盛出。',
      '底油下蒜末，倒藕片大火炒两分钟。',
      '倒回肉丝，加生抽、盐和一点醋，翻匀出锅。'
    ],
    tip: '藕片泡水时滴几滴醋，炒出来更白更脆。'
  },

  /* ── 第三轮扩充：社媒热门家常菜 (256 道) ── */
  {
    id: 'b1-ganbian-porkbelly', name: '干煸五花肉', emoji: '🥓',
    need: ['porkbelly'], extra: ['driedchili', 'garlic', 'sichuan'], time: 25, level: 2,
    steps: [
      '五花肉切0.3厘米薄片，冷锅下锅中火煸3分钟，逼出油脂至边缘微卷。',
      '把多余的油倒出，留底油下蒜末、干辣椒段和花椒，小火炒出香味。',
      '转大火倒回肉片，加1勺生抽、半勺糖翻炒1分钟让酱色裹匀。',
      '撒少许盐，沿锅边淋几滴醋提香，翻两下出锅。'
    ],
    tip: '五花肉冷冻20分钟再切，片薄且均匀，煸得更透。'
  },
  {
    id: 'b1-porkbelly-cabbage', name: '五花肉炒包菜', emoji: '🍃',
    need: ['porkbelly', 'cabbage'], extra: ['garlic', 'driedchili'], time: 20, level: 1,
    steps: [
      '五花肉切薄片，包菜手撕成大片，洗净后彻底沥干水。',
      '热锅放少许油，中火下五花肉煸2分钟至出油、边缘微黄。',
      '下蒜末和干辣椒段炒香，转大火倒入包菜快速翻炒。',
      '炒2分钟至包菜边缘变透明，加1勺生抽和盐炒匀出锅。'
    ],
    tip: '包菜手撕不刀切，断面粗糙更挂汁，也不易出水。'
  },
  {
    id: 'b1-porkbelly-potato', name: '五花肉烧土豆', emoji: '🥔',
    need: ['porkbelly', 'potato'], extra: ['ginger', 'wine'], time: 45, level: 2,
    steps: [
      '五花肉切2厘米见方的块，冷水下锅加料酒焯3分钟捞出冲净。',
      '锅内少油放1勺糖，小火炒到枣红色，下肉块翻炒上色。',
      '加姜片、2勺生抽、半勺老抽，倒热水没过肉，小火炖20分钟。',
      '下土豆滚刀块续炖15分钟，土豆软糯后大火收汁。'
    ],
    tip: '炒糖色一到枣红立刻下肉，颜色发黑就带苦味了。'
  },
  {
    id: 'b1-porkbelly-teatree', name: '五花肉炒茶树菇', emoji: '🍄',
    need: ['porkbelly', 'teatree'], extra: ['garlic', 'oyster'], time: 25, level: 2,
    steps: [
      '干茶树菇用温水泡20分钟，剪掉老根，反复冲洗干净。',
      '五花肉切薄片，热锅不放油直接下锅，中火煸至微焦出油。',
      '下蒜片炒香，倒入茶树菇转大火翻炒2分钟。',
      '加1勺蚝油、1勺生抽和少许糖，炒到汤汁收干。'
    ],
    tip: '泡茶树菇的水沉淀后取上层，当高汤用更鲜。'
  },
  {
    id: 'b1-porkbelly-kingoyster', name: '五花肉炒杏鲍菇', emoji: '🍄',
    need: ['porkbelly', 'kingoyster'], extra: ['garlic', 'oyster'], time: 25, level: 1,
    steps: [
      '杏鲍菇切0.5厘米厚片，五花肉切薄片。',
      '干锅下五花肉，中火煸至出油、边缘金黄。',
      '下蒜末炒香，倒杏鲍菇铺平煎2分钟再翻面。',
      '加1勺蚝油和半勺生抽，大火翻炒到汤汁收干。'
    ],
    tip: '杏鲍菇先煎后炒，出水少，口感更像鲍鱼。'
  },
  {
    id: 'b1-jingjiang-porkloin', name: '京酱肉丝', emoji: '🥢',
    need: ['porkloin'], extra: ['sweetbeanpaste', 'scallion', 'starch'], time: 20, level: 2,
    steps: [
      '里脊切细丝，加1勺淀粉、1勺料酒和少许盐抓匀腌10分钟。',
      '甜面酱2勺加1勺糖、2勺清水调开备用。',
      '热锅凉油下肉丝，中火滑散至变白盛出。',
      '锅留底油倒酱汁小火炒到冒大泡，回锅肉丝翻匀，撒葱丝。'
    ],
    tip: '甜面酱必须小火炒到冒泡，酱香才出得来。'
  },
  {
    id: 'b1-blackpepper-porkchop', name: '黑椒猪排', emoji: '🥩',
    need: ['porkloin'], extra: ['blackpepper', 'starch'], time: 20, level: 1,
    steps: [
      '里脊横切1.5厘米厚片，用刀背拍松，加盐和黑胡椒腌10分钟。',
      '两面薄薄拍一层淀粉，抖掉多余的粉。',
      '平底锅中火放油，下猪排煎3分钟，翻面再煎2分钟。',
      '出锅静置2分钟再切条，撒一层黑胡椒。'
    ],
    tip: '拍松再腌，猪排煎完不缩，口感更嫩。'
  },
  {
    id: 'b1-shuizhu-pork', name: '水煮肉片', emoji: '🌶️',
    need: ['porkloin', 'beansprout'], extra: ['douban', 'driedchili', 'sichuan'], time: 30, level: 3,
    steps: [
      '里脊逆纹切薄片，加淀粉、料酒和盐抓匀腌10分钟。',
      '豆芽焯水1分钟，捞出铺在深碗底部。',
      '锅下豆瓣酱2勺、干辣椒和花椒，小火炒出红油后加水烧开。',
      '下肉片拨散，煮1分钟变白即连汤倒入碗中。',
      '表面撒蒜末和干辣椒，淋一勺烧到冒烟的热油。'
    ],
    tip: '肉片逆纹切、只煮1分钟，久煮就柴。'
  },
  {
    id: 'b1-asparagus-porkloin', name: '芦笋炒里脊', emoji: '🌱',
    need: ['porkloin', 'asparagus'], extra: ['garlic', 'starch'], time: 15, level: 1,
    steps: [
      '芦笋削去根部老皮，斜切段，焯水30秒后过凉。',
      '里脊切片，加淀粉和料酒抓匀腌5分钟。',
      '热锅多放一点油，大火滑炒肉片至变白盛出。',
      '下蒜末炒香，倒芦笋和肉片，加盐大火炒1分钟。'
    ],
    tip: '芦笋先焯水锁色，回锅只要30秒就脆。'
  },
  {
    id: 'b1-celtuce-porkloin', name: '里脊炒莴笋', emoji: '🥗',
    need: ['porkloin', 'celtuce'], extra: ['garlic', 'starch'], time: 15, level: 1,
    steps: [
      '莴笋去皮切薄片，里脊切片加淀粉、料酒腌10分钟。',
      '热锅凉油下肉片，中火滑散至变色盛出。',
      '锅留底油下蒜片，倒莴笋片大火炒1分钟。',
      '倒回肉片，加盐和少许生抽炒匀，30秒后出锅。'
    ],
    tip: '莴笋切好撒少许盐腌2分钟，炒出来更脆。'
  },
  {
    id: 'b1-minced-peas', name: '肉末炒豌豆', emoji: '🌱',
    need: ['mincedpork', 'peas'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '豌豆焯水2分钟捞出沥干，水中放一点盐保色。',
      '热锅下油，中火把肉末炒散至发白出油。',
      '下蒜末炒香，倒豌豆转大火翻炒1分钟。',
      '加盐和半勺糖调味，大火炒匀让糖化开，出锅装盘。'
    ],
    tip: '豌豆焯水时加一点盐，颜色更绿更亮。'
  },
  {
    id: 'b1-minced-edamame', name: '肉末炒毛豆', emoji: '🍃',
    need: ['mincedpork', 'edamame'], extra: ['garlic'], time: 18, level: 1,
    steps: [
      '毛豆剥好洗净，焯水3分钟彻底断生去豆腥。',
      '热锅少油下肉末，中火炒散炒出香味。',
      '加蒜末、1勺生抽炒匀，倒毛豆大火翻炒2分钟。',
      '加盐调味，炒到锅底没有汤汁即可。'
    ],
    tip: '毛豆一定煮透，半生的豆子有豆腥还伤胃。'
  },
  {
    id: 'b1-pearl-meatball', name: '珍珠丸子', emoji: '🍡',
    need: ['mincedpork', 'glutinousrice'], extra: ['ginger', 'starch'], time: 35, level: 1,
    steps: [
      '糯米提前用清水泡2小时，沥干后摊在盘子里。',
      '肉末加姜末、生抽、盐和淀粉，顺一个方向搅到上劲。',
      '取一勺肉馅搓成乒乓球大的丸子，滚一圈糯米。',
      '水开后上锅，大火蒸20分钟至米粒透亮。'
    ],
    tip: '肉末始终顺一个方向搅，丸子才抱团不散。'
  },
  {
    id: 'b1-minced-corn', name: '肉末炒玉米', emoji: '🌽',
    need: ['mincedpork', 'corn'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '玉米粒焯水1分钟捞出沥干，鲜玉米剥粒更甜。',
      '热锅下油，中火把肉末炒散至微微焦香。',
      '下蒜末炒香，倒玉米粒大火翻炒2分钟。',
      '加盐和少许糖，撒葱花炒匀出锅。'
    ],
    tip: '用甜玉米粒，颗颗分明不出水，孩子也爱吃。'
  },
  {
    id: 'b1-minced-tofuskin', name: '肉末炒豆皮', emoji: '🍥',
    need: ['mincedpork', 'tofuskin'], extra: ['garlic', 'scallion'], time: 20, level: 1,
    steps: [
      '豆皮切条，用温水泡软后挤干水分。',
      '热锅下油炒散肉末，加蒜末和1勺生抽炒香。',
      '倒豆皮大火翻炒2分钟，加小半碗水焖1分钟。',
      '加盐调味，大火收干汤汁，撒葱花翻匀出锅。'
    ],
    tip: '豆皮泡软后挤干水再炒，不易碎也更入味。'
  },
  {
    id: 'b1-chizhi-ribs', name: '豉汁蒸排骨', emoji: '🍖',
    need: ['ribs'], extra: ['douchi', 'garlic', 'starch'], time: 40, level: 1,
    steps: [
      '排骨剁小块，冷水泡20分钟去血水，冲净沥干。',
      '加1勺豆豉、蒜末、生抽、淀粉和少许糖抓匀，腌15分钟。',
      '平铺在浅盘里，尽量不叠厚，让蒸汽均匀透进去。',
      '水开后大火蒸15分钟，出锅撒葱花淋一勺热油。'
    ],
    tip: '排骨泡水去血水比焯水更嫩，蒸前一定沥干。'
  },
  {
    id: 'b1-pepper-salt-ribs', name: '椒盐排骨', emoji: '🍖',
    need: ['ribs'], extra: ['sichuan', 'pepper', 'starch'], time: 40, level: 2,
    steps: [
      '排骨剁段，加料酒、盐和姜片腌20分钟。',
      '沥干水分，均匀裹一层薄淀粉，抖掉多余的粉。',
      '油温六成热下锅，中火炸5分钟捞出。',
      '升高油温复炸1分钟至金黄，撒椒盐和花椒粉拌匀。'
    ],
    tip: '复炸一次是外壳酥脆的关键，这一步别省。'
  },
  {
    id: 'b1-ribs-rice', name: '排骨焖饭', emoji: '🍚',
    need: ['ribs', 'rice'], extra: ['ginger', 'oyster'], time: 50, level: 1,
    steps: [
      '排骨焯水去血沫，热锅少油煎到两面微黄。',
      '加姜片、2勺生抽和1勺蚝油翻炒上色。',
      '大米洗净放进电饭锅，水比平时少一成，铺上排骨。',
      '按煮饭键，跳闸后焖10分钟再拌匀。'
    ],
    tip: '水比平时少一成，排骨出的汤刚好被米吸收。'
  },
  {
    id: 'b1-curry-ribs', name: '咖喱排骨', emoji: '🍛',
    need: ['ribs', 'potato'], extra: ['curry'], time: 50, level: 1,
    steps: [
      '排骨冷水下锅焯3分钟洗净，土豆去皮切滚刀块。',
      '热锅下油炒香姜片，倒排骨煎至表面微黄。',
      '加开水没过排骨，小火炖20分钟。',
      '下土豆再炖10分钟，放咖喱块搅化后小火煮5分钟至浓稠。'
    ],
    tip: '咖喱块最后放并转小火，不然容易糊底。'
  },
  {
    id: 'b1-peanut-trotters', name: '花生焖猪蹄', emoji: '🥜',
    need: ['trotters', 'peanut'], extra: ['ginger', 'wine'], time: 80, level: 2,
    steps: [
      '猪蹄剁块，冷水下锅加料酒焯5分钟，冲净浮沫。',
      '热锅少油炒化冰糖，下猪蹄翻炒上色。',
      '加姜片、2勺生抽、半勺老抽，倒热水没过，小火炖40分钟。',
      '下泡好的花生再炖20分钟，最后大火收汁。'
    ],
    tip: '花生提前泡2小时，才能和猪蹄同时软烂。'
  },
  {
    id: 'b1-beer-trotters', name: '啤酒猪蹄', emoji: '🍺',
    need: ['trotters'], extra: ['beer', 'ginger'], time: 80, level: 2,
    steps: [
      '猪蹄剁块冷水下锅，加料酒焯5分钟，洗净沥干。',
      '锅中少油下冰糖炒化，倒猪蹄翻炒到表面均匀上色。',
      '加姜片、2勺生抽，倒一罐啤酒没过猪蹄。',
      '小火炖60分钟，开盖大火收汁至汤汁黏亮。'
    ],
    tip: '用啤酒代水，麦香解腻，肉质也更酥。'
  },
  {
    id: 'b1-spicy-trotters', name: '香辣猪蹄', emoji: '🌶️',
    need: ['trotters'], extra: ['douban', 'driedchili', 'sichuan'], time: 70, level: 3,
    steps: [
      '猪蹄焯水后加姜片、料酒，高压锅上汽压15分钟。',
      '热锅下油，小火炒豆瓣酱、干辣椒和花椒出红油。',
      '倒猪蹄转大火翻炒2分钟，让每块都裹上料。',
      '加半碗水焖5分钟，收汁后撒葱花。'
    ],
    tip: '高压锅先压软再炒，省时且更入味。'
  },
  {
    id: 'b1-radish-trotters-soup', name: '白萝卜猪蹄汤', emoji: '🍲',
    need: ['trotters', 'radish'], extra: ['ginger', 'wine'], time: 90, level: 1,
    steps: [
      '猪蹄冷水下锅焯5分钟，撇净浮沫捞出冲洗。',
      '砂锅放猪蹄、姜片和足量热水，大火烧开转小火炖50分钟。',
      '白萝卜切滚刀块下锅，再炖25分钟至透明。',
      '加盐和白胡椒粉调味，撒一把葱花，趁热喝。'
    ],
    tip: '中途只加热水，冷水会让猪蹄收紧变硬。'
  },
  {
    id: 'b1-onion-liver', name: '洋葱炒猪肝', emoji: '🥘',
    need: ['liver', 'onion'], extra: ['ginger', 'wine', 'starch'], time: 15, level: 2,
    steps: [
      '猪肝切薄片，清水抓洗3遍至水清，沥干。',
      '加料酒、姜末和淀粉抓匀腌10分钟。',
      '热锅多油，大火下猪肝滑炒20秒变色立即盛出。',
      '下洋葱丝炒软，倒回猪肝，加生抽和盐炒匀。'
    ],
    tip: '猪肝切薄、泡到水清，是去腥的根本。'
  },
  {
    id: 'b1-chive-liver', name: '韭菜炒猪肝', emoji: '🌿',
    need: ['liver', 'chive'], extra: ['ginger', 'wine'], time: 15, level: 2,
    steps: [
      '猪肝切片泡水10分钟去血水，捞出彻底沥干。',
      '加料酒、少许盐和姜末抓匀，腌10分钟去腥。',
      '热锅热油，大火炒猪肝30秒至变色盛出。',
      '下韭菜段炒10秒，倒回猪肝加盐快速炒匀。'
    ],
    tip: '韭菜最后下、只炒10秒，久炒出水发黄。'
  },
  {
    id: 'b1-spinach-liver-soup', name: '菠菜猪肝汤', emoji: '🥗',
    need: ['liver', 'spinach'], extra: ['ginger', 'wine'], time: 15, level: 2,
    steps: [
      '猪肝切薄片，泡水10分钟后加料酒和少许淀粉抓匀。',
      '菠菜洗净，焯水10秒捞出过凉。',
      '锅中烧水下姜丝，水开后下猪肝片煮1分钟。',
      '放菠菜煮30秒，加盐和白胡椒粉调味。'
    ],
    tip: '猪肝一变色就关火，余温会继续把它焖熟。'
  },
  {
    id: 'b1-sauce-liver', name: '酱爆猪肝', emoji: '🥣',
    need: ['liver', 'greenpepper'], extra: ['sweetbeanpaste', 'wine', 'starch'], time: 20, level: 3,
    steps: [
      '猪肝切片泡洗去血水，加料酒和淀粉抓匀。',
      '青椒切块，甜面酱1勺加半勺糖和2勺水调开。',
      '大火热油滑炒猪肝20秒，变色即盛出。',
      '下青椒炒半分钟，倒酱汁炒到浓稠，回锅猪肝翻匀。'
    ],
    tip: '酱汁炒到起大泡再回锅，才裹得住猪肝。'
  },
  {
    id: 'b1-sausage-friedrice', name: '腊肠炒饭', emoji: '🍚',
    need: ['chinesesausage', 'rice', 'egg'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '腊肠切小丁，鸡蛋打散，米饭用隔夜的打松。',
      '热锅下油，倒入蛋液炒散成大块盛出备用。',
      '下腊肠丁小火煸1分钟出油，倒米饭转大火炒散。',
      '加鸡蛋、1勺生抽和葱花，翻炒均匀出锅。'
    ],
    tip: '米饭用隔夜的，粒粒分明不粘锅。'
  },
  {
    id: 'b1-sausage-snowpea', name: '腊肠炒荷兰豆', emoji: '🌱',
    need: ['chinesesausage', 'snowpea'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '荷兰豆撕去两侧老筋，焯水30秒后过凉。',
      '腊肠斜切薄片，厚度约2毫米，容易出油。',
      '热锅少油下腊肠，小火煸1分钟至透明出油。',
      '下蒜末和荷兰豆，大火翻炒1分钟，加盐出锅。'
    ],
    tip: '荷兰豆焯水后过凉，脆感才保得住。'
  },
  {
    id: 'b1-sausage-garlicshoot', name: '腊肠炒蒜苗', emoji: '🌿',
    need: ['chinesesausage', 'garlicshoot'], extra: [], time: 15, level: 1,
    steps: [
      '腊肠斜切片，蒜苗切段，梗和叶分开放。',
      '干锅下腊肠，小火煸1分钟逼出油。',
      '先下蒜苗梗，大火炒30秒至断生。',
      '再下蒜苗叶，加少许生抽炒匀立刻出锅。'
    ],
    tip: '蒜苗叶最后放，保持翠绿不发黄。'
  },
  {
    id: 'b1-luncheon-friedegg', name: '午餐肉煎蛋', emoji: '🍳',
    need: ['luncheonmeat', 'egg'], extra: [], time: 10, level: 1,
    steps: [
      '午餐肉切1厘米厚片，两片就够一人份。',
      '平底锅少油，中火把午餐肉两面各煎1分钟至微焦。',
      '推到锅边，打入鸡蛋，小火煎2分钟。',
      '撒少许盐和黑胡椒，配饭或吐司都行。'
    ],
    tip: '午餐肉本身有咸味，盐只撒在蛋上就够。'
  },
  {
    id: 'b1-luncheon-greenpepper', name: '午餐肉炒青椒', emoji: '🌶️',
    need: ['luncheonmeat', 'greenpepper'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '午餐肉切条，青椒去籽切滚刀块。',
      '热锅少油，中火煎午餐肉1分钟至边缘焦黄。',
      '下蒜片炒香，倒青椒大火翻炒1分钟。',
      '加少许生抽和盐，大火炒匀立刻出锅。'
    ],
    tip: '午餐肉先煎出油，炒青椒时不用再加油。'
  },
  {
    id: 'b1-luncheon-noodle', name: '午餐肉泡面', emoji: '🍜',
    need: ['luncheonmeat', 'instantnoodle'], extra: [], time: 10, level: 1,
    steps: [
      '午餐肉切厚片，平底锅煎至两面微黄盛出。',
      '锅中烧500毫升水，下面饼煮2分钟。',
      '放调料包和午餐肉，再煮1分钟。',
      '关火盛出，汤汁别倒，泡着吃更入味。'
    ],
    tip: '面饼煮到七分熟就关火，泡着会继续变软。'
  },
  {
    id: 'b1-luncheon-beansprout', name: '午餐肉炒豆芽', emoji: '🌱',
    need: ['luncheonmeat', 'beansprout'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '豆芽洗净沥干水，午餐肉切1厘米宽条。',
      '热锅少油，中火煎午餐肉1分钟至微焦。',
      '下蒜末炒香，倒豆芽转大火翻炒1分钟。',
      '加盐和几滴醋，炒匀立刻出锅，保持脆感。'
    ],
    tip: '豆芽全程大火快炒1分钟，久了就塌软出水。'
  },
  {
    id: 'b1-ham-wintermelon-soup', name: '火腿冬瓜汤', emoji: '🍲',
    need: ['ham', 'wintermelon'], extra: ['ginger'], time: 25, level: 1,
    steps: [
      '冬瓜去皮去瓤切薄片，火腿切细丝备用。',
      '锅下少许油，炒香姜丝和火腿丝30秒。',
      '加500毫升开水，下冬瓜煮8分钟至透明。',
      '加盐和白胡椒粉，撒葱花出锅，汤色清亮。'
    ],
    tip: '火腿本身咸，盐一定要最后尝过再放。'
  },
  {
    id: 'b1-ham-babycabbage', name: '火腿蒸娃娃菜', emoji: '🍃',
    need: ['ham', 'babycabbage'], extra: ['garlic'], time: 25, level: 1,
    steps: [
      '娃娃菜竖切四瓣，菜帮朝外铺在盘中。',
      '火腿切细丝撒在菜上，再放一层蒜末。',
      '淋1勺生抽和少许食用油，让菜叶都沾到。',
      '水开后大火蒸10分钟，出锅把盘底汤汁拌匀。'
    ],
    tip: '娃娃菜竖切不易散，蒸出的汤别倒，最鲜。'
  },
  {
    id: 'b1-ham-zucchini', name: '火腿炒西葫芦', emoji: '🥒',
    need: ['ham', 'zucchini'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '西葫芦切半月片，火腿切筷子粗的条。',
      '热锅少油，中火炒火腿30秒出香味。',
      '下蒜末和西葫芦，转大火翻炒2分钟。',
      '加盐调味，西葫芦断生即可出锅。'
    ],
    tip: '西葫芦别炒太久，断生就出锅才脆不出水。'
  },
  {
    id: 'b1-sausage-noodle', name: '火腿肠炒面', emoji: '🍜',
    need: ['sausage', 'noodle'], extra: ['scallion', 'oyster'], time: 20, level: 1,
    steps: [
      '火腿肠斜切片，面条煮到八分熟，过凉水沥干。',
      '热锅下油，中火煎火腿肠1分钟至微焦。',
      '下葱花炒香，倒面条转大火翻炒1分钟。',
      '加1勺生抽、半勺蚝油，快速炒匀出锅。'
    ],
    tip: '面条过凉水后拌几滴油，炒时根根不粘。'
  },
  {
    id: 'b1-sausage-potato', name: '火腿肠炒土豆片', emoji: '🥔',
    need: ['sausage', 'potato'], extra: ['garlic'], time: 20, level: 1,
    steps: [
      '土豆切薄片，清水冲去表面淀粉后沥干。',
      '热锅多放油，中火煎土豆片2分钟至边缘透明。',
      '下火腿肠片和蒜末，翻炒1分钟。',
      '加1勺生抽和盐，转大火炒匀，收干汤汁出锅。'
    ],
    tip: '土豆片冲掉淀粉再煎，脆而不糊锅。'
  },
  {
    id: 'b1-sausage-cucumber', name: '火腿肠炒黄瓜', emoji: '🥒',
    need: ['sausage', 'cucumber'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '黄瓜切菱形片，火腿肠斜切成薄片。',
      '热锅少油，中火炒火腿肠1分钟。',
      '下蒜末和黄瓜片，转大火翻炒1分钟。',
      '加盐调味，大火炒匀立即出锅，别久炒。'
    ],
    tip: '黄瓜最后下、只炒1分钟，久了出水变软。'
  },
  {
    id: 'b2-pepper-beef', name: '青椒炒牛肉丝', emoji: '🥩',
    need: ['beef', 'greenpepper'], extra: ['garlic', 'starch', 'oyster'], time: 15, level: 1,
    steps: [
      '牛肉逆着纹路切细丝，加生抽、淀粉和一勺清水抓匀，腌十分钟。',
      '青椒去籽切丝，大蒜切片，铁锅烧到微微冒烟再倒油。',
      '大火下牛肉丝摊开不动，变色立刻盛出，全程不超过一分钟。',
      '余油爆香蒜片和青椒丝，倒回牛肉，淋一勺蚝油翻匀出锅。'
    ],
    tip: '牛肉逆纹切、热锅快炒，超过两分钟就发柴。'
  },
  {
    id: 'b2-radish-beef-stew', name: '白萝卜炖牛肉', emoji: '🍲',
    need: ['beef', 'radish'], extra: ['ginger', 'wine', 'fivespice'], time: 70, level: 2,
    steps: [
      '牛肉切麻将块，冷水下锅加料酒焯三分钟，撇净浮沫捞出洗净。',
      '热油下姜片和牛肉，中火煸到边缘微焦，淋生抽老抽上色。',
      '倒没过肉的热水，撒五香粉，小火盖盖炖四十分钟。',
      '下白萝卜滚刀块再炖二十分钟，加盐后开大火收浓汤汁。'
    ],
    tip: '萝卜后放才不烂，水要一次加够，中途别兑冷水。'
  },
  {
    id: 'b2-broccoli-beef', name: '西兰花炒牛肉', emoji: '🥦',
    need: ['beef', 'broccoli'], extra: ['garlic', 'oyster', 'starch'], time: 18, level: 1,
    steps: [
      '牛肉切薄片，用生抽、淀粉和一点油抓匀，腌十分钟。',
      '西兰花掰小朵，沸水里加盐焯一分钟，捞出过凉水沥干。',
      '热锅冷油滑散牛肉片，七成熟就盛出。',
      '蒜片爆香，下西兰花和牛肉，淋蚝油大火翻十秒关火。'
    ],
    tip: '西兰花焯水时滴几滴油，颜色更绿，也不容易炒烂。'
  },
  {
    id: 'b2-cilantro-beef', name: '香菜牛肉', emoji: '🌿',
    need: ['beef', 'cilantro'], extra: ['garlic', 'driedchili', 'sesamoil'], time: 15, level: 2,
    steps: [
      '牛肉切薄片，加生抽、淀粉和一勺油抓匀，腌十分钟。',
      '香菜切长段，蒜切末，干辣椒剪成小段备用。',
      '大火热油，下牛肉片快速划散，变色立刻盛出。',
      '底油爆香蒜末辣椒，回牛肉，撒香菜段翻两下关火，淋芝麻油。'
    ],
    tip: '香菜最后放，只翻两下，余温就够它出香。'
  },
  {
    id: 'b2-kingoyster-beef', name: '杏鲍菇炒牛肉', emoji: '🍄',
    need: ['beef', 'kingoyster'], extra: ['garlic', 'oyster', 'blackpepper'], time: 20, level: 1,
    steps: [
      '杏鲍菇切厚片再撕成粗条，牛肉切薄片用生抽和淀粉腌上。',
      '不加油先干煸杏鲍菇，煸到出水收干、边缘焦黄盛出。',
      '补一勺油大火炒牛肉，变色后下蒜末和杏鲍菇。',
      '加蚝油和黑胡椒翻匀，汤汁收干就出锅。'
    ],
    tip: '杏鲍菇先干煸逼出水，口感才像肉不像海绵。'
  },
  {
    id: 'b2-curry-beef', name: '咖喱牛肉', emoji: '🍛',
    need: ['beef', 'potato', 'carrot'], extra: ['curry', 'ginger', 'wine'], time: 50, level: 1,
    steps: [
      '牛肉切块冷水焯水冲净，土豆胡萝卜切滚刀块。',
      '少油炒香姜片，下牛肉块翻炒，沿锅边烹入料酒。',
      '加热水没过牛肉两指，小火炖二十五分钟。',
      '下土豆胡萝卜再炖十五分钟，关火放咖喱块搅化，小火煮稠。'
    ],
    tip: '咖喱块一定关火后放，边搅边化，不然容易糊底。'
  },
  {
    id: 'b2-beef-vermicelli-soup', name: '牛肉粉丝汤', emoji: '🍜',
    need: ['beef', 'vermicelli', 'bokchoy'], extra: ['ginger', 'scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '牛肉切薄片用生抽和淀粉抓匀，粉丝温水泡软。',
      '锅中水烧开，下姜丝和牛肉片，撇掉表面浮沫。',
      '放粉丝煮两分钟，再下小青菜烫三十秒。',
      '加盐和白胡椒调味，撒葱花，滴几滴芝麻油。'
    ],
    tip: '牛肉片下锅先别搅，等定型再推散，汤才清亮。'
  },
  {
    id: 'b2-beef-egg', name: '滑蛋牛肉', emoji: '🍳',
    need: ['beef', 'egg'], extra: ['starch', 'scallion', 'sesamoil'], time: 15, level: 2,
    steps: [
      '牛肉切薄片，加生抽、淀粉和一勺水抓匀，腌十分钟。',
      '三个鸡蛋打散，加少许盐和两勺清水搅匀。',
      '油热下牛肉炒到八成熟盛出，直接倒进蛋液里拌匀。',
      '锅转中小火倒回蛋液，用铲子从边缘往中间推，半凝固就关火。'
    ],
    tip: '蛋液里加水、全程小火，蛋才嫩得像豆花。'
  },
  {
    id: 'b2-pickledchili-beef', name: '泡椒牛肉丝', emoji: '🌶️',
    need: ['beef', 'celery'], extra: ['pickledchili', 'garlic', 'wine'], time: 18, level: 2,
    steps: [
      '牛肉逆纹切丝，加生抽、淀粉和料酒抓匀，腌十分钟。',
      '芹菜撕去老筋切段，泡椒切圈，大蒜切末。',
      '大火热油滑散牛肉丝，变色马上盛出。',
      '底油炒香泡椒蒜末，下芹菜炒断生，倒回牛肉翻匀即可。'
    ],
    tip: '泡椒本身够咸，起锅前尝一口再决定加不加盐。'
  },
  {
    id: 'b2-sour-beefroll', name: '酸汤肥牛', emoji: '🥘',
    need: ['beefroll', 'enoki', 'pickled'], extra: ['pickledchili', 'garlic', 'ginger'], time: 25, level: 2,
    steps: [
      '酸菜切碎挤干水，金针菇去根撕散，肥牛卷提前回软。',
      '少油炒香姜蒜和泡椒，下酸菜中火炒两分钟出酸香。',
      '加两碗水煮开，下金针菇煮三分钟，捞出垫在碗底。',
      '汤再滚起来下肥牛卷，烫到刚变色就连汤倒进碗里。'
    ],
    tip: '肥牛一下锅就别久煮，卷边变色立刻关火。'
  },
  {
    id: 'b2-onion-beefroll', name: '洋葱肥牛', emoji: '🍖',
    need: ['beefroll', 'onion'], extra: ['garlic', 'oyster', 'sesame'], time: 12, level: 1,
    steps: [
      '洋葱切粗丝，肥牛卷拆散，大蒜切片。',
      '热锅少油，中火把洋葱炒到边缘透明发软。',
      '转大火下蒜片和肥牛，快速翻散至变色。',
      '淋生抽、蚝油和半勺糖，翻匀撒白芝麻出锅。'
    ],
    tip: '洋葱炒软才甜，肥牛最后下，全程别超过三分钟。'
  },
  {
    id: 'b2-tomato-beefroll-soup', name: '番茄肥牛汤', emoji: '🍅',
    need: ['beefroll', 'tomato', 'enoki'], extra: ['garlic', 'ketchup', 'scallion'], time: 20, level: 1,
    steps: [
      '番茄顶部划十字，开水烫三十秒后去皮切小块。',
      '少油下蒜末和番茄块，边炒边压出汁，加一勺番茄酱炒匀。',
      '倒两碗热水煮开，下金针菇煮两分钟。',
      '下肥牛卷烫到变色，加盐调味，撒葱花关火。'
    ],
    tip: '番茄要炒到出沙，汤才红亮浓稠，别只煮不炒。'
  },
  {
    id: 'b2-cabbage-beefroll', name: '白菜肥牛卷', emoji: '🥟',
    need: ['beefroll', 'cabbage'], extra: ['garlic', 'oyster', 'starch'], time: 20, level: 2,
    steps: [
      '白菜取整片叶子焯水十秒变软，捞出过凉沥干。',
      '肥牛卷切成两段，用白菜叶卷紧，收口朝下码盘。',
      '蒜末、生抽、蚝油加两勺水调成料汁，均匀淋上去。',
      '水开后上锅蒸八分钟，倒出盘中汤汁勾薄芡浇回。'
    ],
    tip: '白菜焯软才好卷，蒸出来的汤别倒，勾芡最鲜。'
  },
  {
    id: 'b2-beefroll-noodle', name: '肥牛炒面', emoji: '🍜',
    need: ['beefroll', 'noodle', 'onion'], extra: ['oyster', 'scallion'], time: 18, level: 2,
    steps: [
      '面条煮到八分熟捞出，拌一点油抖散防粘。',
      '洋葱切丝，锅中少油中火炒洋葱到发软。',
      '下肥牛卷炒散变色，加生抽、老抽和蚝油炒匀。',
      '倒入面条，大火不停翻炒一分钟，撒葱花出锅。'
    ],
    tip: '面煮八分熟就捞，留两分在锅里炒，才不坨不烂。'
  },
  {
    id: 'b2-cold-beefroll', name: '凉拌肥牛', emoji: '🥒',
    need: ['beefroll', 'cucumber'], extra: ['tahini', 'garlic', 'chilioil'], time: 15, level: 1,
    steps: [
      '水开后下肥牛卷，烫到刚变色立刻捞出沥干晾凉。',
      '黄瓜拍裂切段摆盘，大蒜拍碎压成细末。',
      '芝麻酱用温水一点点澥开，加生抽、醋和半勺糖调匀。',
      '肥牛和黄瓜装盘，淋酱汁、蒜末和辣椒油，拌匀上桌。'
    ],
    tip: '芝麻酱要一点点加水澥，一次倒多了会结块。'
  },
  {
    id: 'b2-beefroll-tofu-pot', name: '肥牛豆腐煲', emoji: '🍲',
    need: ['beefroll', 'tofu'], extra: ['douban', 'garlic', 'scallion'], time: 22, level: 2,
    steps: [
      '嫩豆腐横切厚片，肥牛卷拆散备用。',
      '砂锅少油小火炒香蒜末和豆瓣酱，炒出红油。',
      '加一碗热水煮开，轻轻推入豆腐，小火煮五分钟。',
      '铺上肥牛卷烫熟，加盐调味，撒葱花连锅上桌。'
    ],
    tip: '豆腐下锅后用推的不要翻，才不会碎成渣。'
  },
  {
    id: 'b2-scallion-lamb', name: '葱爆羊肉', emoji: '🍖',
    need: ['lamb', 'onion'], extra: ['scallion', 'sesamoil'], time: 15, level: 2,
    steps: [
      '羊肉切薄片，加生抽、料酒和一点淀粉抓匀腌十分钟。',
      '洋葱切丝，小葱切段，葱白葱绿分开放。',
      '锅烧到冒烟倒油，下羊肉大火滑散，变色先盛出。',
      '爆香葱白和洋葱，回羊肉，沿锅边淋半勺醋，撒葱绿翻匀。'
    ],
    tip: '全程最大火，出锅前沿锅边淋醋，去膻又提香。'
  },
  {
    id: 'b2-radish-lamb-soup', name: '白萝卜羊肉汤', emoji: '🍲',
    need: ['lamb', 'radish'], extra: ['ginger', 'scallion', 'pepper'], time: 70, level: 1,
    steps: [
      '羊肉切块冷水下锅焯水，撇净浮沫后捞出冲洗。',
      '砂锅放羊肉和姜片，倒足量热水，大火烧开转小火炖四十分钟。',
      '白萝卜切滚刀块下锅，再炖二十分钟至透明。',
      '加盐和白胡椒调味，撒葱花上桌。'
    ],
    tip: '姜片要给足、萝卜后放，汤才清甜不膻。'
  },
  {
    id: 'b2-braised-lamb', name: '红焖羊肉', emoji: '🥘',
    need: ['lamb', 'carrot'], extra: ['douban', 'ginger', 'fivespice'], time: 65, level: 2,
    steps: [
      '羊肉切块冷水焯水，捞出沥干水分。',
      '少油下姜片和羊肉煸炒到表面微焦，加豆瓣酱小火炒出红油。',
      '淋生抽老抽，加热水没过羊肉，撒五香粉，小火焖四十分钟。',
      '下胡萝卜块再焖十五分钟，开大火收浓汤汁。'
    ],
    tip: '羊肉先煸干水汽再焖，膻味会小很多。'
  },
  {
    id: 'b2-lamb-vermicelli', name: '羊肉炖粉条', emoji: '🍜',
    need: ['lamb', 'vermicelli', 'cabbage'], extra: ['ginger', 'wine'], time: 55, level: 1,
    steps: [
      '羊肉切片，粉条温水泡到能弯，白菜切大块。',
      '少油炒香姜片，下羊肉煸到变色，烹入料酒。',
      '加生抽老抽和两大碗水，小火炖三十分钟。',
      '下粉条和白菜，煮到粉条透明、汤汁变浓就关火。'
    ],
    tip: '粉条别泡太久，靠炖的时候吸汤才入味不烂。'
  },
  {
    id: 'b2-lamb-rice-pot', name: '羊肉焖饭', emoji: '🍚',
    need: ['lamb', 'onion', 'rice'], extra: ['cumin', 'ginger'], time: 45, level: 2,
    steps: [
      '羊肉切小块，洋葱切丝，大米淘洗后泡十分钟沥干。',
      '少油下姜片和羊肉炒到变色，加洋葱丝炒软，撒孜然和盐。',
      '倒入大米翻炒一分钟，加水比米面高半指。',
      '盖盖小火焖二十五分钟，关火再焖十分钟，开盖拌匀。'
    ],
    tip: '水比平时煮饭少一点，米粒才粒粒分明不粘。'
  },
  {
    id: 'b2-yam-lamb-soup', name: '山药羊肉汤', emoji: '🍲',
    need: ['lamb', 'yam'], extra: ['ginger', 'wine', 'scallion'], time: 60, level: 1,
    steps: [
      '羊肉切块冷水下锅，加料酒焯五分钟，捞出冲净浮沫。',
      '砂锅放羊肉和姜片，加足量热水，小火炖三十五分钟。',
      '山药去皮切段下锅，再炖十五分钟至粉糯。',
      '加盐和白胡椒调味，撒葱花即可。'
    ],
    tip: '山药最后放，煮太久会散，汤容易变糊。'
  },
  {
    id: 'b2-spicy-lamb', name: '香辣羊肉', emoji: '🌶️',
    need: ['lamb', 'garlicshoot'], extra: ['douban', 'driedchili', 'garlic'], time: 18, level: 2,
    steps: [
      '羊肉切细丝，加生抽、料酒和淀粉抓匀，腌十分钟。',
      '蒜苗斜切段，干辣椒剪段，大蒜切片。',
      '大火热油滑散羊肉丝，变色即盛出。',
      '底油小火炒豆瓣酱和干辣椒出红油，下蒜苗炒断生，回羊肉翻匀。'
    ],
    tip: '豆瓣酱必须小火炒，火一大立刻发苦。'
  },
  {
    id: 'b2-beer-duck', name: '啤酒鸭', emoji: '🍺',
    need: ['duck'], extra: ['beer', 'ginger', 'driedchili'], time: 55, level: 2,
    steps: [
      '鸭腿剁块，冷水下锅焯水三分钟，撇沫后捞出沥干。',
      '少油下姜片和鸭块，中火煸到鸭皮出油、表面金黄。',
      '加干辣椒、生抽老抽炒上色，倒入一整罐啤酒没过鸭块。',
      '小火焖二十五分钟，开大火收汁到油亮。'
    ],
    tip: '鸭块一定要煸出油，啤酒才压得住腥味。'
  },
  {
    id: 'b2-pickled-duck-soup', name: '酸菜老鸭汤', emoji: '🦆',
    need: ['duck', 'pickled'], extra: ['ginger', 'pepper', 'wine'], time: 80, level: 1,
    steps: [
      '鸭腿剁块冷水下锅，加料酒焯五分钟，冲净浮沫。',
      '酸菜切段挤干水，锅中少油炒香姜片和酸菜。',
      '一起转入砂锅，加热水没过食材，大火烧开转小火炖一小时。',
      '加白胡椒和少许盐，撒葱花出锅。'
    ],
    tip: '酸菜先炒过再炖，酸香才浓，汤也不发涩。'
  },
  {
    id: 'b2-ginger-duck', name: '姜爆鸭', emoji: '🦆',
    need: ['duck', 'greenpepper'], extra: ['ginger', 'douban', 'wine'], time: 35, level: 2,
    steps: [
      '鸭腿剁成小块冷水焯水沥干，姜切厚片。',
      '少油下姜片煸到卷边发黄，倒入鸭块中火煸炒五分钟。',
      '加豆瓣酱炒出红油，淋料酒和生抽翻匀。',
      '加小半碗水焖十五分钟，下青椒块大火收汁。'
    ],
    tip: '姜要煸到边缘焦黄，姜味才进得去、辣味出得来。'
  },
  {
    id: 'b2-pan-seared-duck', name: '黑椒煎鸭腿', emoji: '🍗',
    need: ['duck'], extra: ['blackpepper', 'garlic', 'honey'], time: 30, level: 3,
    steps: [
      '鸭腿在皮面划几刀，抹盐和黑胡椒腌十五分钟。',
      '冷锅皮朝下放入鸭腿，中小火慢煎十分钟逼出鸭油。',
      '翻面再煎五分钟，把锅里多余的油倒掉。',
      '加蒜末、生抽和一勺蜂蜜，翻面裹匀酱汁出锅。'
    ],
    tip: '冷锅下、皮朝下小火煎，鸭皮才脆而不焦。'
  },
  {
    id: 'b2-douchi-duck', name: '豆豉蒸鸭腿', emoji: '🦆',
    need: ['duck'], extra: ['douchi', 'ginger', 'scallion'], time: 40, level: 2,
    steps: [
      '鸭腿剁块焯水沥干，加生抽、料酒和淀粉抓匀。',
      '豆豉剁碎，姜切末，一起拌进鸭块腌十分钟。',
      '鸭块平铺在盘中别堆高，水开后大火蒸二十五分钟。',
      '出锅撒葱花，浇一勺烧热的油激香。'
    ],
    tip: '鸭块铺平别叠太高，受热均匀才不会夹生。'
  },
  {
    id: 'b2-shiitake-duck', name: '香菇焖鸭', emoji: '🍄',
    need: ['duck', 'shiitake'], extra: ['ginger', 'oyster'], time: 45, level: 2,
    steps: [
      '鸭腿剁块焯水，干香菇温水泡发，泡菇水滤净留用。',
      '少油煸香姜片和鸭块，炒到鸭皮微黄出油。',
      '加生抽老抽和泡菇水，下香菇，小火焖二十五分钟。',
      '加蚝油翻匀，开大火收汁到浓稠挂勺。'
    ],
    tip: '泡香菇的水别倒，滤一下当高汤，鲜味翻倍。'
  },
  {
    id: 'b2-braised-chickenfeet', name: '卤鸡爪', emoji: '🐔',
    need: ['chickenfeet'], extra: ['thirteen', 'ginger'], time: 50, level: 1,
    steps: [
      '鸡爪剪掉指甲，冷水下锅焯三分钟，冲洗干净。',
      '锅里放姜片、生抽、老抽、糖和十三香，加两碗水烧开。',
      '下鸡爪再次烧开，转小火卤三十分钟。',
      '关火后在卤汁里再泡二十分钟，捞出浇两勺汁。'
    ],
    tip: '卤好别急着捞，泡在汤里才入味，皮也不破。'
  },
  {
    id: 'b2-pickled-chickenfeet', name: '泡椒凤爪', emoji: '🌶️',
    need: ['chickenfeet'], extra: ['pickledchili', 'sichuan', 'garlic'], time: 40, level: 2,
    steps: [
      '鸡爪剪指甲对半剁开，冷水下锅加姜片煮十分钟。',
      '捞出后用流动冷水冲到完全凉透，表皮收紧。',
      '泡椒连汁倒入盆中，加凉白开、盐、糖和花椒搅匀。',
      '放入鸡爪和蒜片，冷藏四小时以上再吃。'
    ],
    tip: '煮好一定要冲凉水，皮才脆爽不黏。'
  },
  {
    id: 'b2-tiger-chickenfeet', name: '虎皮凤爪', emoji: '🍗',
    need: ['chickenfeet'], extra: ['honey', 'thirteen', 'garlic'], time: 70, level: 3,
    steps: [
      '鸡爪剪指甲，彻底擦干，薄薄刷一层蜂蜜水。',
      '油温六成热下鸡爪，立刻盖锅盖，炸到表皮起泡发黄捞出。',
      '马上投进冰水里泡二十分钟，泡出虎皮皱褶。',
      '加生抽、老抽、十三香和蒜末，小火焖二十五分钟收汁。'
    ],
    tip: '炸鸡爪会爆油，擦干水再下锅，全程盖着盖子。'
  },
  {
    id: 'b2-spicy-chickenfeet', name: '香辣鸡爪', emoji: '🌶️',
    need: ['chickenfeet'], extra: ['douban', 'driedchili', 'garlic'], time: 35, level: 2,
    steps: [
      '鸡爪剪指甲对半剁开，冷水下锅加姜片煮八分钟捞出。',
      '少油小火炒豆瓣酱和干辣椒段，炒出红油。',
      '下鸡爪翻炒上色，加生抽和一碗热水。',
      '小火焖十五分钟，开大火收汁，撒蒜末翻匀。'
    ],
    tip: '先煮后焖，鸡爪才软糯又不至于烂脱骨。'
  },
  {
    id: 'b2-peanut-chickenfeet-soup', name: '花生鸡爪汤', emoji: '🥜',
    need: ['chickenfeet', 'peanut'], extra: ['ginger', 'scallion'], time: 75, level: 1,
    steps: [
      '花生米温水泡一小时，鸡爪剪指甲后焯水洗净。',
      '砂锅放鸡爪、花生和姜片，加足量水大火烧开。',
      '转小火炖一小时，炖到汤色发白、花生软糯。',
      '加盐调味，撒一把葱花，趁热喝最香。'
    ],
    tip: '水一次加够，中途加水汤就不白了。'
  },
  {
    id: 'b2-ricecake-chickenfeet', name: '年糕焖鸡爪', emoji: '🍢',
    need: ['chickenfeet', 'ricecake'], extra: ['chiligarlic', 'garlic', 'scallion'], time: 40, level: 2,
    steps: [
      '鸡爪剪指甲对半剁开，冷水下锅焯五分钟捞出。',
      '年糕片温水泡软，一片片分开防粘。',
      '少油炒香蒜末和蒜蓉辣酱，下鸡爪翻炒上色。',
      '加热水没过鸡爪，小火焖十五分钟，下年糕再煮五分钟收汁。'
    ],
    tip: '年糕最后放，煮久了会化在汤里找不着。'
  },
  {
    id: 'b3-ziran-jitui', name: '孜然鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['cumin', 'garlic', 'wine'], time: 25, level: 1,
    steps: [
      '鸡腿去骨切小块，加料酒、生抽和盐抓匀，腌十分钟。',
      '平底锅放少许油，鸡皮朝下中火煎五分钟逼出油，翻面再煎三分钟。',
      '撒蒜末和孜然粒炒出香味，转大火收干汤汁。',
      '出锅前再补一撮孜然粉，颠匀装盘。'
    ],
    tip: '鸡皮朝下先煎，不用多放油，自身出油才够香。'
  },
  {
    id: 'b3-mizhi-jitui', name: '蜜汁烤鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['honey', 'garlic', 'wine'], time: 35, level: 1,
    steps: [
      '鸡腿两面各划两刀，加料酒、生抽、蒜末抓匀，腌二十分钟。',
      '烤箱二百度预热，鸡腿放烤架上烤十五分钟。',
      '蜂蜜加一勺生抽调开，取出刷一层，回炉再烤五分钟。',
      '翻面补刷蜜汁烤三分钟，表面焦亮就出炉。'
    ],
    tip: '蜂蜜最后五分钟才刷，刷早了容易烤黑发苦。'
  },
  {
    id: 'b3-heijiao-jitui', name: '黑椒鸡腿扒', emoji: '🍗',
    need: ['chickenleg', 'onion'], extra: ['blackpepper', 'garlic', 'oyster'], time: 20, level: 1,
    steps: [
      '鸡腿去骨摊平，用刀背拍松，两面抹盐和黑胡椒腌十分钟。',
      '平底锅烧热放少许油，鸡皮朝下中火煎五分钟至金黄。',
      '翻面煎三分钟，下蒜末和洋葱丝炒软。',
      '淋一勺蚝油加小半碗水，大火收汁，出锅再撒黑胡椒。'
    ],
    tip: '去骨后拍松再煎，受热均匀也不会卷边。'
  },
  {
    id: 'b3-wuxiang-lujitui', name: '五香卤鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['fivespice', 'ginger', 'wine'], time: 45, level: 1,
    steps: [
      '鸡腿冷水下锅，加料酒和姜片煮开，撇净浮沫捞出冲一下。',
      '锅中放生抽、老抽、糖、五香粉和姜片，加水没过鸡腿。',
      '大火烧开转小火卤二十五分钟，关火再泡十分钟。',
      '捞出稍凉后斩块摆盘，浇上两勺滚热的卤汁。'
    ],
    tip: '关火后浸泡比久煮更入味，肉也不容易发柴。'
  },
  {
    id: 'b3-pijiu-jitui', name: '啤酒焖鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['beer', 'ginger', 'oyster'], time: 40, level: 2,
    steps: [
      '鸡腿剁块，冷水下锅焯去血水，捞出沥干。',
      '热锅少油，下姜片和鸡块中火煸到表面微黄。',
      '倒入一整罐啤酒，加生抽、老抽和蚝油，大火烧开。',
      '转小火焖二十分钟，开盖大火收汁到浓稠挂勺。'
    ],
    tip: '全程用啤酒代替水，去腥又带麦香，别再添水。'
  },
  {
    id: 'b3-sanbei-ji', name: '三杯鸡', emoji: '🍗',
    need: ['chickenleg'], extra: ['sesamoil', 'wine', 'ginger'], time: 30, level: 2,
    steps: [
      '鸡腿剁小块洗净沥干，姜切厚片，蒜剥成整瓣。',
      '厚底锅倒半碗芝麻油，小火把姜片煸到边缘卷起。',
      '下鸡块转中火煎到变色，加蒜瓣、料酒、生抽和糖。',
      '加盖小火焖十五分钟，开盖收汁到油亮。'
    ],
    tip: '一滴水都不加，靠料酒和鸡肉自身水分焖熟。'
  },
  {
    id: 'b3-suanxiang-jixiong', name: '蒜香煎鸡胸', emoji: '🍳',
    need: ['chickenbreast'], extra: ['garlic', 'blackpepper', 'starch'], time: 15, level: 1,
    steps: [
      '鸡胸横片成两片，刀背拍松，抹盐和黑胡椒腌五分钟。',
      '两面薄薄拍一层淀粉，锁住肉里的水分。',
      '平底锅中火放油，下鸡胸每面煎三分钟。',
      '最后把蒜末放锅边煎香，连油一起淋在鸡胸上。'
    ],
    tip: '拍层薄淀粉再煎，外焦里嫩，切开还带汁。'
  },
  {
    id: 'b3-xilanhua-jixiong', name: '西兰花炒鸡胸肉', emoji: '🥦',
    need: ['chickenbreast', 'broccoli'], extra: ['garlic', 'oyster', 'starch'], time: 20, level: 1,
    steps: [
      '鸡胸切片，加盐、淀粉和一点清水抓匀腌十分钟。',
      '西兰花掰小朵，沸水加盐焯一分钟，捞出过凉沥干。',
      '热锅凉油下鸡片滑散，变白立刻盛出。',
      '底油炒香蒜末，下西兰花和鸡片，加蚝油翻匀。'
    ],
    tip: '西兰花先焯再炒，颜色翠绿还不出水。'
  },
  {
    id: 'b3-yumi-jiding', name: '玉米鸡丁', emoji: '🌽',
    need: ['chickenbreast', 'corn', 'carrot'], extra: ['garlic', 'starch'], time: 20, level: 1,
    steps: [
      '鸡胸切小丁，加盐和淀粉抓匀；玉米粒、胡萝卜丁备好。',
      '热锅放油，下鸡丁中火滑炒到变白，盛出。',
      '底油炒香蒜末，下胡萝卜丁炒两分钟，再加玉米粒。',
      '倒回鸡丁，加盐和少许生抽大火翻炒均匀。'
    ],
    tip: '用现成玉米粒最省事，冷冻的要先沥干水。'
  },
  {
    id: 'b3-xianggu-jibing', name: '香菇鸡肉饼', emoji: '🍄',
    need: ['chickenbreast', 'shiitake'], extra: ['starch', 'oyster', 'ginger'], time: 25, level: 2,
    steps: [
      '鸡胸剁成泥，香菇切细丁，加姜末、盐和淀粉搅上劲。',
      '手上抹点水，把肉馅拍成厚薄一致的小圆饼。',
      '平底锅少油小火，两面各煎四分钟至金黄。',
      '淋一勺蚝油加两勺水调的汁，收干出锅。'
    ],
    tip: '肉馅顺一个方向搅到发黏，煎的时候才不散。'
  },
  {
    id: 'b3-haoyou-jixiongpian', name: '蚝油鸡胸片', emoji: '🍳',
    need: ['chickenbreast'], extra: ['oyster', 'garlic', 'starch'], time: 15, level: 1,
    steps: [
      '鸡胸逆纹切薄片，加盐、淀粉和一勺清水抓匀。',
      '锅烧热多放些油，下鸡片快速划散，变白马上盛出。',
      '底油炒香蒜末，加蚝油、生抽和两勺水烧开。',
      '倒回鸡片翻匀，勾薄芡即可出锅。'
    ],
    tip: '逆纹切、大火快炒，鸡胸才不会塞牙。'
  },
  {
    id: 'b3-hongshao-jichi', name: '红烧鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['ginger', 'wine'], time: 35, level: 1,
    steps: [
      '鸡翅两面各划两刀，冷水下锅加料酒焯两分钟捞出。',
      '锅里少油，下姜片和鸡翅中火煎到两面金黄。',
      '加生抽、老抽、糖和热水没过鸡翅，大火烧开。',
      '转小火焖二十分钟，开盖大火收汁到挂勺。'
    ],
    tip: '中途一定加热水，添冷水鸡皮会紧缩发硬。'
  },
  {
    id: 'b3-suanxiang-jichi', name: '蒜香烤鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['garlic', 'honey', 'oyster'], time: 30, level: 1,
    steps: [
      '鸡翅划刀，加蒜末、生抽、蚝油和一点糖抓匀腌二十分钟。',
      '烤盘垫纸，鸡翅摊开摆好，二百度烤十五分钟。',
      '蜂蜜加半勺生抽调开，取出鸡翅刷匀。',
      '回炉再烤八分钟，表面起泡上色即可。'
    ],
    tip: '腌够二十分钟才入味，进烤箱前把蒜末刮掉。'
  },
  {
    id: 'b3-jiaoyan-jichi', name: '椒盐鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['sichuan', 'pepper', 'starch'], time: 25, level: 2,
    steps: [
      '鸡翅划刀，加盐、料酒和姜片腌十五分钟，擦干表面。',
      '两面拍薄淀粉，静置两分钟等表面回潮。',
      '六成热油下锅，中小火炸六分钟至金黄捞出。',
      '锅留底油炒香花椒粒，倒回鸡翅撒椒盐翻匀。'
    ],
    tip: '拍完淀粉等回潮再炸，皮才酥不脱浆。'
  },
  {
    id: 'b3-furu-jichi', name: '腐乳鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['fermentedtofu', 'garlic'], time: 30, level: 2,
    steps: [
      '鸡翅划刀焯水擦干；两块腐乳加一勺腐乳汁压成糊。',
      '锅里少油，下蒜末和鸡翅煎至微黄。',
      '倒入腐乳糊、半勺生抽和热水，没过一半鸡翅。',
      '小火焖十五分钟，大火收汁到浓稠裹匀。'
    ],
    tip: '腐乳本身很咸，生抽半勺就够，别放盐。'
  },
  {
    id: 'b3-xianggu-jichi', name: '香菇焖鸡翅', emoji: '🍄',
    need: ['chickenwing', 'shiitake'], extra: ['ginger', 'oyster'], time: 30, level: 1,
    steps: [
      '干香菇泡软切块，泡菇水留着；鸡翅划刀焯水。',
      '锅中少油把鸡翅煎到两面黄，下姜片炒香。',
      '加香菇、生抽、蚝油和泡菇水，小火焖十八分钟。',
      '大火收汁到浓稠挂勺，撒葱花出锅。'
    ],
    tip: '泡香菇的水别倒，是这道菜鲜味的来源。'
  },
  {
    id: 'b3-xiangchun-chaodan', name: '香椿炒鸡蛋', emoji: '🥚',
    need: ['egg', 'toona'], extra: [], time: 10, level: 1,
    steps: [
      '香椿洗净，沸水焯三十秒变绿立刻捞出过凉，挤干切碎。',
      '三个鸡蛋加盐打散，倒入香椿碎拌匀。',
      '热锅多放油，油面微微冒烟后倒入蛋液。',
      '等边缘凝固再翻动，炒成大块全熟即可。'
    ],
    tip: '香椿必须焯水去亚硝酸盐，不能直接下锅。'
  },
  {
    id: 'b3-muer-chaodan', name: '木耳炒鸡蛋', emoji: '🍳',
    need: ['egg', 'fungus'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '木耳提前泡发撕小朵，沸水焯一分钟捞出沥干。',
      '三个鸡蛋加少许盐打散，热锅热油炒成块盛出。',
      '底油下木耳中火翻炒两分钟，加生抽和盐。',
      '倒回炒好的鸡蛋块，撒葱花大火翻匀出锅。'
    ],
    tip: '木耳泡好后焯一下，炒时不会爆锅溅油。'
  },
  {
    id: 'b3-suanmiao-chaodan', name: '蒜苗炒鸡蛋', emoji: '🍳',
    need: ['egg', 'garlicshoot'], extra: [], time: 10, level: 1,
    steps: [
      '蒜苗斜切段，蒜白和蒜叶分开装。',
      '三个鸡蛋加盐打散，热油下锅炒成嫩块盛出。',
      '底油先下蒜白炒香，再下蒜叶大火炒三十秒。',
      '倒回鸡蛋，加少许生抽翻匀即可。'
    ],
    tip: '蒜白先炒、蒜叶后放，口感不会一起软塌。'
  },
  {
    id: 'b3-hualie-zhengdan', name: '花蛤蒸蛋', emoji: '🥚',
    need: ['egg', 'clam'], extra: ['scallion'], time: 20, level: 1,
    steps: [
      '花蛤放盐水里吐净沙，沸水煮到开口立刻捞出。',
      '两个鸡蛋打散，加少许盐和一点五倍温水搅匀。',
      '蛋液过筛倒入碗中，撇净浮沫，摆上花蛤。',
      '盖保鲜膜扎几个孔，水开后中小火蒸十分钟，淋生抽撒葱花。'
    ],
    tip: '温水加过筛，蛋面才平整没有蜂窝。'
  },
  {
    id: 'b3-hupi-jidan', name: '虎皮鸡蛋', emoji: '🥚',
    need: ['egg'], extra: ['ginger', 'oyster'], time: 30, level: 2,
    steps: [
      '鸡蛋冷水下锅煮八分钟，过凉剥壳，用厨房纸擦干。',
      '锅中多放油，中小火把鸡蛋滚着煎到表皮起皱发黄。',
      '加生抽、老抽、蚝油、糖和热水，放姜片烧开。',
      '小火焖十分钟，大火收汁让蛋裹上酱色。'
    ],
    tip: '剥壳后一定擦干，带水下锅会炸得满灶是油。'
  },
  {
    id: 'b3-tangxin-ludan', name: '溏心卤蛋', emoji: '🥚',
    need: ['egg'], extra: ['fivespice', 'scallion', 'ginger'], time: 25, level: 1,
    steps: [
      '水烧开后轻轻放入鸡蛋，中火煮六分半，捞出立刻泡冰水。',
      '另起锅放生抽、老抽、糖、五香粉、葱段和姜片，加水煮开晾凉。',
      '鸡蛋剥壳放进卤汁，冷藏浸泡四小时以上。',
      '吃时切开，蛋黄微微流动就算成功。'
    ],
    tip: '六分半是溏心的关键，捞出必须马上冰水定形。'
  },
  {
    id: 'b3-suanla-tang', name: '酸辣汤', emoji: '🍲',
    need: ['egg', 'tofu', 'fungus'], extra: ['pepper', 'starch'], time: 20, level: 2,
    steps: [
      '木耳和豆腐切细丝，锅中加水烧开，下木耳煮三分钟。',
      '加生抽和盐调味，下豆腐丝再煮两分钟。',
      '淀粉加水调匀，边倒边搅，勾成薄芡。',
      '蛋液成细线淋入，静置五秒再推散，关火加醋和白胡椒。'
    ],
    tip: '醋一定最后放，早放酸味会被煮跑。'
  },
  {
    id: 'b3-hebaodan-luobotang', name: '荷包蛋萝卜汤', emoji: '🍳',
    need: ['egg', 'radish'], extra: ['scallion', 'ginger'], time: 20, level: 1,
    steps: [
      '白萝卜去皮切细丝，姜切丝备用。',
      '锅中放油，两个鸡蛋分别煎成两面金黄的荷包蛋。',
      '直接冲入开水，大火滚五分钟到汤色发白。',
      '下萝卜丝煮八分钟至透明，加盐和白胡椒，撒葱花。'
    ],
    tip: '煎蛋后冲开水大火滚，汤才奶白。'
  },
  {
    id: 'b3-danhua-yumigeng', name: '蛋花玉米羹', emoji: '🌽',
    need: ['egg', 'corn'], extra: ['starch'], time: 15, level: 1,
    steps: [
      '玉米粒加两碗水用料理机打成浆，倒进锅里。',
      '中火煮开，边煮边搅防止糊底，煮五分钟。',
      '淀粉加水调匀勾薄芡，汤略稠就好。',
      '蛋液细线淋入，静置几秒轻推成蛋花，加糖调味。'
    ],
    tip: '玉米浆容易糊底，全程中小火不停搅拌。'
  },
  {
    id: 'b3-conghua-jidanbing', name: '葱花鸡蛋饼', emoji: '🥞',
    need: ['egg', 'flour'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '面粉一百克加两个鸡蛋和两百毫升水，搅成无颗粒稀面糊。',
      '加盐和一把葱花拌匀，静置五分钟让面糊松弛。',
      '平底锅刷薄油小火，倒一勺面糊转锅摊圆。',
      '表面凝固后翻面，再烙一分钟至两面微黄。'
    ],
    tip: '面糊调得稀一点，摊薄了才软不硬。'
  },
  {
    id: 'b3-bocai-jidanbing', name: '菠菜鸡蛋饼', emoji: '🥞',
    need: ['egg', 'spinach', 'flour'], extra: [], time: 20, level: 1,
    steps: [
      '菠菜沸水焯三十秒，捞出挤干水分切碎。',
      '面粉加鸡蛋、水和盐搅成稀糊，拌入菠菜碎。',
      '平底锅小火刷油，倒入面糊摊成圆饼。',
      '底面凝固后翻面，两面煎黄切块装盘。'
    ],
    tip: '菠菜先焯去草酸，饼不涩还更绿。'
  },
  {
    id: 'b3-jidan-chaohefen', name: '鸡蛋炒河粉', emoji: '🍜',
    need: ['egg', 'riceflakenoodle', 'beansprout'], extra: ['scallion', 'garlic'], time: 15, level: 2,
    steps: [
      '河粉提前用手轻轻抖散，豆芽洗净沥干水。',
      '热锅多放油，鸡蛋打散下锅炒成块盛出。',
      '底油爆香蒜末，下豆芽大火炒半分钟。',
      '下河粉快速翻炒，加生抽和盐，倒回鸡蛋撒葱花。'
    ],
    tip: '河粉下锅前抖散，用筷子翻动不易断。'
  },
  {
    id: 'b3-qiezhi-anshun', name: '茄汁鹌鹑蛋', emoji: '🥚',
    need: ['quaillegg'], extra: ['ketchup', 'starch', 'sesame'], time: 20, level: 1,
    steps: [
      '鹌鹑蛋冷水下锅煮四分钟，过凉剥壳擦干。',
      '薄薄滚一层淀粉，五成油温炸到表面起皱捞出。',
      '锅留底油，倒番茄酱、糖和两勺水小火炒匀。',
      '倒入鹌鹑蛋翻匀裹汁，撒白芝麻出锅。'
    ],
    tip: '滚层淀粉再炸，外皮起皱才挂得住汁。'
  },
  {
    id: 'b3-lu-anshun', name: '香卤鹌鹑蛋', emoji: '🥚',
    need: ['quaillegg'], extra: ['fivespice', 'ginger'], time: 30, level: 1,
    steps: [
      '鹌鹑蛋冷水下锅煮四分钟，过凉后用勺背轻敲出裂纹。',
      '锅中放生抽、老抽、糖、五香粉、姜片和两碗水烧开。',
      '放入鹌鹑蛋，小火卤十五分钟至表皮上色。',
      '关火再泡半小时以上，颜色更深也更入味。'
    ],
    tip: '煮好敲裂壳再卤，味道才进得去。'
  },
  {
    id: 'b3-anshun-zhengroubing', name: '鹌鹑蛋蒸肉饼', emoji: '🥚',
    need: ['quaillegg', 'mincedpork'], extra: ['starch', 'ginger', 'oyster'], time: 30, level: 2,
    steps: [
      '肉末加姜末、盐、淀粉、蚝油和两勺水，顺一个方向搅上劲。',
      '肉馅铺进盘子压平，用勺背按出几个小窝。',
      '每个窝里打一个鹌鹑蛋，水开后中火蒸十五分钟。',
      '出锅淋一勺生抽提味，再撒上葱花。'
    ],
    tip: '肉馅打水搅上劲，蒸出来才嫩不柴。'
  },
  {
    id: 'b3-anshun-dongguatang', name: '冬瓜鹌鹑蛋汤', emoji: '🍲',
    need: ['quaillegg', 'wintermelon'], extra: ['ginger', 'scallion'], time: 25, level: 1,
    steps: [
      '鹌鹑蛋煮熟剥壳，冬瓜去皮切厚片。',
      '锅中少油下姜丝炒香，加冬瓜片翻炒一分钟。',
      '倒入热水没过冬瓜，大火烧开转中火煮十分钟。',
      '下鹌鹑蛋再煮三分钟，加盐调味撒葱花。'
    ],
    tip: '冬瓜先炒再煮，汤更甜，块也不容易烂。'
  },
  {
    id: 'b3-xianyadan-nangua', name: '咸蛋黄焗南瓜', emoji: '🎃',
    need: ['saltedegg', 'pumpkin'], extra: ['starch'], time: 20, level: 2,
    steps: [
      '南瓜去皮切条，撒薄盐腌五分钟，倒掉渗出的水。',
      '南瓜条拍一层淀粉，六成油温炸三分钟至外壳微硬。',
      '咸蛋黄蒸熟压成泥，锅留底油小火炒到起泡。',
      '倒入南瓜条快速翻匀，让蛋黄沙裹满即可。'
    ],
    tip: '蛋黄要小火炒到起泡才起沙，火大就发苦。'
  },
  {
    id: 'b3-xianyadan-doufu', name: '咸蛋黄烧豆腐', emoji: '🥚',
    need: ['saltedegg', 'tofu'], extra: ['scallion', 'starch'], time: 20, level: 2,
    steps: [
      '嫩豆腐切块，放淡盐水里泡五分钟去豆腥。',
      '咸蛋黄蒸熟压碎，锅中少油小火炒到起沙起泡。',
      '加半碗水烧开，轻轻推入豆腐块煮三分钟。',
      '淋淀粉水勾一层薄芡，撒葱花出锅。'
    ],
    tip: '豆腐用盐水泡过不易碎，推锅别用铲子翻。'
  },
  {
    id: 'b3-jinsha-yumili', name: '金沙玉米粒', emoji: '🌽',
    need: ['saltedegg', 'corn'], extra: ['starch'], time: 15, level: 2,
    steps: [
      '玉米粒沥干水分，薄薄拍一层淀粉抖散。',
      '六成油温下锅炸一分钟至外壳微脆，捞出控油。',
      '咸蛋黄蒸熟压碎，锅留底油小火炒到起泡起沙。',
      '倒入玉米粒快速翻匀，加一小撮盐即可。'
    ],
    tip: '玉米一定沥干再拍粉，带水下锅会溅油。'
  },
  {
    id: 'b3-xianyadan-jichi', name: '咸蛋黄焗鸡翅', emoji: '🍗',
    need: ['chickenwing', 'saltedegg'], extra: ['starch', 'wine'], time: 30, level: 2,
    steps: [
      '鸡翅划刀，加料酒、盐和姜片腌十五分钟，擦干表面。',
      '拍薄淀粉，中火煎八分钟至两面金黄熟透，盛出。',
      '咸蛋黄蒸熟压碎，锅中少油小火炒到起泡。',
      '倒回鸡翅翻匀，让蛋黄沙裹满表面即可。'
    ],
    tip: '鸡翅先煎熟再裹蛋黄，蛋黄才不会炒焦发黑。'
  },
  {
    id: 'b3-pidan-shourouzhou', name: '皮蛋瘦肉粥', emoji: '🍚',
    need: ['centuryegg', 'rice', 'mincedpork'], extra: ['ginger', 'scallion'], time: 45, level: 1,
    steps: [
      '大米淘净，加一勺油和少许盐拌匀腌十分钟。',
      '肉末加盐和淀粉抓匀，皮蛋切小块。',
      '锅中水烧开下米，大火煮开转小火熬三十分钟至米粒开花。',
      '下肉末和皮蛋煮五分钟，加姜丝和盐，撒葱花。'
    ],
    tip: '米先用油盐腌过，煮出的粥更绵滑。'
  },
  {
    id: 'b3-shaojiao-pidan', name: '烧椒皮蛋', emoji: '🌶',
    need: ['centuryegg', 'greenpepper'], extra: ['garlic', 'sesamoil'], time: 10, level: 1,
    steps: [
      '青椒放干锅里中火烙到表皮起黑斑，取出晾凉撕条。',
      '皮蛋剥壳切瓣，和青椒一起摆盘。',
      '蒜末加生抽、香醋、芝麻油和一点糖调成汁。',
      '把料汁浇在青椒皮蛋上，拌开就吃。'
    ],
    tip: '青椒干锅烙出虎皮才够香，全程不放油。'
  },
  {
    id: 'b3-pidan-xiancaitang', name: '皮蛋苋菜汤', emoji: '🍲',
    need: ['centuryegg', 'amaranth'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '苋菜洗净掐成段，皮蛋切小块，蒜拍扁。',
      '锅中少油下蒜瓣，中火煎到表面微黄。',
      '加两碗热水烧开，下皮蛋煮两分钟。',
      '放入苋菜烫一分钟至变软，加盐调味即可。'
    ],
    tip: '蒜瓣先煎香再添水煮，汤味立刻立体。'
  },
  {
    id: 'b3-shangtang-wawacai', name: '上汤娃娃菜', emoji: '🍲',
    need: ['babycabbage', 'centuryegg', 'saltedegg'], extra: ['garlic'], time: 20, level: 1,
    steps: [
      '娃娃菜竖切成四瓣，皮蛋和咸蛋各切小丁。',
      '锅中少油下蒜末炒香，加两碗热水烧开。',
      '放入皮蛋丁和咸蛋丁，中火煮三分钟出味。',
      '下娃娃菜煮五分钟至软，加盐调味连汤装盘。'
    ],
    tip: '两种蛋一起熬汤底，鲜味比高汤还足。'
  },
  {
    id: 'b4-braised-shrimp', name: '油焖大虾', emoji: '🦐',
    need: ['shrimp'], extra: ['wine', 'ginger', 'scallion'], time: 15, level: 2,
    steps: [
      '虾剪掉长须，从背部划开挑出虾线，用料酒和姜片抓匀腌五分钟。',
      '锅烧热放两勺油，虾平铺下锅，中火两面煎至壳红出油。',
      '下姜丝葱段炒香，加一勺料酒、两勺生抽和半勺糖翻匀。',
      '倒小半碗热水，盖盖小火焖三分钟，开盖大火收汁裹匀。'
    ],
    tip: '虾先煎出红油再焖，味更浓，汁别收太干。'
  },
  {
    id: 'b4-salt-pepper-shrimp', name: '椒盐虾', emoji: '🦐',
    need: ['shrimp'], extra: ['starch', 'sichuan', 'garlic'], time: 20, level: 2,
    steps: [
      '虾去虾线剪掉长须，用厨房纸吸干水，撒少许盐腌五分钟。',
      '虾身薄薄裹一层淀粉，轻轻抖掉多余的粉。',
      '油烧到六成热，虾下锅中火炸两分钟至金黄捞出。',
      '锅留底油小火炒香蒜末和花椒碎，倒回虾翻匀撒椒盐。'
    ],
    tip: '虾必须吸干水再裹粉，炸时不溅油壳才脆。'
  },
  {
    id: 'b4-shrimp-corn', name: '虾仁炒玉米', emoji: '🌽',
    need: ['shrimp', 'corn'], extra: ['starch', 'scallion'], time: 15, level: 1,
    steps: [
      '虾去壳去虾线，用少许盐和淀粉抓匀腌五分钟。',
      '玉米粒下沸水焯一分钟，捞出沥干水分。',
      '热锅冷油下虾仁，中火滑炒到变色盛出。',
      '下玉米粒炒香，倒回虾仁，加盐和葱花翻匀出锅。'
    ],
    tip: '虾仁先滑熟盛出，最后回锅才不会老。'
  },
  {
    id: 'b4-shrimp-peas', name: '虾仁炒豌豆', emoji: '🦐',
    need: ['shrimp', 'peas'], extra: ['starch', 'wine'], time: 15, level: 1,
    steps: [
      '虾仁去虾线，加盐、料酒和淀粉抓匀腌十分钟。',
      '豌豆入沸水加少许盐煮三分钟，捞出过凉水。',
      '热锅下油，虾仁中火滑至变色盛出。',
      '下豌豆翻炒，加盐和少许糖，倒回虾仁炒匀。'
    ],
    tip: '豌豆先焯熟再炒，颜色绿、口感不发硬。'
  },
  {
    id: 'b4-shrimp-noodle', name: '虾仁炒面', emoji: '🍜',
    need: ['shrimp', 'noodle', 'bokchoy'], extra: ['scallion', 'oyster'], time: 20, level: 2,
    steps: [
      '面条煮到八分熟捞出过凉水，拌少许油防粘。',
      '虾仁去虾线，用盐和料酒腌五分钟；小青菜洗净切段。',
      '热油下虾仁炒到变色，加小青菜炒软。',
      '倒面条，加一勺生抽、半勺蚝油，大火快速翻匀。'
    ],
    tip: '面煮八分熟就捞，留点硬芯炒完才不坨。'
  },
  {
    id: 'b4-fried-hairtail', name: '干炸带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['starch', 'wine', 'ginger'], time: 25, level: 2,
    steps: [
      '带鱼剪段去内脏，刮净腹内黑膜，用料酒姜片和盐腌十五分钟。',
      '取出擦干水，两面薄薄拍一层淀粉。',
      '油烧至六成热，带鱼下锅中火炸三分钟定型捞出。',
      '油温升高，复炸一分钟至外壳金黄酥脆。'
    ],
    tip: '腹内黑膜一定刮净，腥味主要来源，复炸才脆。'
  },
  {
    id: 'b4-braised-hairtail', name: '红烧带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['wine', 'ginger', 'garlic'], time: 25, level: 2,
    steps: [
      '带鱼切段去黑膜，用料酒和盐腌十分钟后擦干。',
      '薄拍淀粉，下六成热油锅煎至两面金黄盛出。',
      '锅留油爆香姜蒜，加生抽、老抽、糖和一碗热水烧开。',
      '放回带鱼小火炖八分钟，大火收汁撒葱花。'
    ],
    tip: '煎定型再翻面，带鱼肉嫩容易散，收汁别太干。'
  },
  {
    id: 'b4-sweet-sour-hairtail', name: '糖醋带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['starch', 'wine', 'sesame'], time: 25, level: 2,
    steps: [
      '带鱼段去黑膜，用料酒和盐腌十分钟，擦干拍淀粉。',
      '中火煎至两面金黄定型，捞出控干油。',
      '锅洗净，放两勺糖、两勺醋、一勺生抽和半碗水煮开。',
      '倒带鱼小火煨五分钟，淋水淀粉收浓，撒白芝麻。'
    ],
    tip: '糖醋汁先调好再下鱼，免得手忙脚乱把鱼翻碎。'
  },
  {
    id: 'b4-steamed-hairtail', name: '清蒸带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['wine', 'ginger', 'scallion'], time: 20, level: 1,
    steps: [
      '带鱼切段刮净黑膜，用料酒和盐抹匀腌十分钟。',
      '盘底垫姜片葱段，鱼段摆上，表面再放几片姜。',
      '水开后上锅，大火蒸八分钟，关火焖两分钟。',
      '倒掉盘中汤水，淋生抽，浇一勺热油激香葱花。'
    ],
    tip: '蒸出的汤水腥，一定倒掉再淋豉油。'
  },
  {
    id: 'b4-braised-seabass', name: '红烧鲈鱼', emoji: '🐠',
    need: ['fish'], extra: ['wine', 'ginger', 'garlic'], time: 25, level: 2,
    steps: [
      '鲈鱼处理干净，两面各划两刀，用料酒和盐抹匀腌十分钟。',
      '擦干水，热锅热油下鱼，中火煎至两面定型金黄。',
      '下姜蒜爆香，加生抽、老抽、糖和热水到鱼身一半。',
      '小火炖十分钟，中途舀汁浇身，最后大火收浓。'
    ],
    tip: '锅烧到冒烟再下油，鱼皮才不粘。'
  },
  {
    id: 'b4-pan-fried-seabass', name: '香煎鲈鱼', emoji: '🐠',
    need: ['fish'], extra: ['starch', 'wine', 'blackpepper'], time: 20, level: 2,
    steps: [
      '鲈鱼取肉切厚片，用盐、料酒和黑胡椒腌十分钟。',
      '鱼片擦干，两面拍薄薄一层淀粉。',
      '平底锅放油，中火下鱼片煎三分钟至底面金黄。',
      '翻面再煎两分钟，出锅前补撒黑胡椒。'
    ],
    tip: '鱼片切得厚薄一致，两面受热才均匀。'
  },
  {
    id: 'b4-seabass-tofu-soup', name: '鲈鱼豆腐汤', emoji: '🍲',
    need: ['fish', 'tofu'], extra: ['ginger', 'scallion', 'wine'], time: 30, level: 1,
    steps: [
      '鲈鱼切块，用料酒和姜片腌十分钟；嫩豆腐切块。',
      '锅中放油，鱼块中火煎至两面微黄。',
      '冲入滚烫开水，大火煮五分钟至汤色变白。',
      '下豆腐转中火煮八分钟，加盐撒葱花。'
    ],
    tip: '加开水并保持大火煮，汤才奶白不腥。'
  },
  {
    id: 'b4-pan-seared-salmon', name: '香煎三文鱼', emoji: '🍣',
    need: ['salmon'], extra: ['blackpepper', 'wine'], time: 15, level: 1,
    steps: [
      '三文鱼用厨房纸吸干水，两面抹盐和黑胡椒腌十分钟。',
      '平底锅烧热放少许油，鱼皮朝下中火煎三分钟。',
      '翻面再煎两分钟，侧面各煎三十秒。',
      '出锅静置两分钟再切，肉质更紧实。'
    ],
    tip: '下锅前鱼身必须擦干，才能煎出脆皮。'
  },
  {
    id: 'b4-teriyaki-salmon', name: '照烧三文鱼', emoji: '🍣',
    need: ['salmon'], extra: ['honey', 'wine', 'sesame'], time: 20, level: 2,
    steps: [
      '三文鱼切块吸干水，两面撒少许盐。',
      '碗里放两勺生抽、一勺蜂蜜和一勺料酒调成照烧汁。',
      '平底锅中火煎鱼块，每面两分钟至微焦。',
      '倒入照烧汁，小火煮到浓稠裹住鱼块，撒白芝麻。'
    ],
    tip: '蜂蜜容易焦，酱汁最后下、全程小火收。'
  },
  {
    id: 'b4-salmon-fried-rice', name: '三文鱼炒饭', emoji: '🍚',
    need: ['salmon', 'rice', 'egg'], extra: ['scallion', 'blackpepper'], time: 20, level: 2,
    steps: [
      '三文鱼切小丁，用盐和黑胡椒腌五分钟；冷饭提前打散。',
      '热锅下油，鱼丁中火煎到表面变色盛出。',
      '鸡蛋炒成块，下米饭大火炒到粒粒分开。',
      '倒回三文鱼，加盐和葱花翻匀出锅。'
    ],
    tip: '用隔夜冷饭，炒出来才粒粒分明不粘锅。'
  },
  {
    id: 'b4-salmon-pasta', name: '三文鱼意面', emoji: '🍝',
    need: ['salmon', 'pasta'], extra: ['garlic', 'blackpepper', 'cheese'], time: 25, level: 2,
    steps: [
      '意面下沸水加盐煮八分钟，捞出并留半碗面汤。',
      '三文鱼切块，用盐和黑胡椒腌五分钟。',
      '锅中放油，蒜末小火炒香，下鱼块煎到变色。',
      '倒意面和两勺面汤，加盐黑胡椒翻匀，盖芝士片焖化。'
    ],
    tip: '留两勺面汤拌面，酱汁挂得住不发干。'
  },
  {
    id: 'b4-pan-fried-basa', name: '香煎龙利鱼', emoji: '🐟',
    need: ['basa'], extra: ['starch', 'blackpepper', 'wine'], time: 15, level: 1,
    steps: [
      '龙利鱼柳解冻后吸干水，切大块，用盐和料酒腌十分钟。',
      '两面薄薄拍一层淀粉，轻轻抖掉多余的粉。',
      '平底锅中火放油，鱼块下锅煎三分钟。',
      '翻面再煎两分钟，撒黑胡椒出锅。'
    ],
    tip: '龙利鱼水分多，吸干再拍粉才煎得金黄。'
  },
  {
    id: 'b4-tomato-basa', name: '番茄龙利鱼', emoji: '🍅',
    need: ['basa', 'tomato'], extra: ['garlic', 'starch', 'ketchup'], time: 25, level: 1,
    steps: [
      '龙利鱼切块，用盐、料酒和淀粉抓匀腌十分钟。',
      '番茄划十字烫去皮切小块，蒜切末。',
      '热油炒番茄到出汁软烂，加一勺番茄酱和半碗水煮开。',
      '下鱼块小火煮五分钟，加盐收汁。'
    ],
    tip: '番茄要炒到化成泥再下鱼，汤汁才浓稠挂勺。'
  },
  {
    id: 'b4-spicy-basa', name: '香辣龙利鱼', emoji: '🌶️',
    need: ['basa'], extra: ['douban', 'garlic', 'driedchili'], time: 25, level: 2,
    steps: [
      '龙利鱼切厚片，加盐、料酒和淀粉抓匀腌十分钟。',
      '锅中放油，小火炒香豆瓣酱、蒜末和干辣椒段。',
      '加两碗水烧开，转小火下鱼片煮三分钟。',
      '加少许糖调味，连汤一起倒入碗中。'
    ],
    tip: '鱼片下锅后别搅动，用勺背轻推才不会碎。'
  },
  {
    id: 'b4-garlic-basa', name: '蒜蓉龙利鱼', emoji: '🐟',
    need: ['basa'], extra: ['garlic', 'oyster', 'scallion'], time: 20, level: 1,
    steps: [
      '龙利鱼柳吸干水切厚片，用盐和料酒腌十分钟。',
      '盘底铺一层蒜末，摆上鱼片，表面再盖一层蒜末。',
      '水开后上锅，全程大火蒸八分钟。',
      '倒掉盘中汤水，淋一勺蚝油，撒葱花浇热油。'
    ],
    tip: '蒜末一半垫底一半盖面，上下都进味。'
  },
  {
    id: 'b4-cumin-squid', name: '孜然鱿鱼', emoji: '🦑',
    need: ['squid'], extra: ['cumin', 'driedchili', 'garlic'], time: 20, level: 2,
    steps: [
      '鱿鱼去内脏和软骨，撕掉表面紫膜，切圈用料酒腌十分钟。',
      '水开下鱿鱼焯二十秒，立刻捞出沥干。',
      '热油爆香蒜末和干辣椒，下鱿鱼大火快炒一分钟。',
      '撒孜然、盐和少许辣椒面翻匀出锅。'
    ],
    tip: '焯水别超过三十秒，久煮会硬得像橡皮。'
  },
  {
    id: 'b4-sauce-squid', name: '酱爆鱿鱼', emoji: '🦑',
    need: ['squid', 'greenpepper'], extra: ['sweetbeanpaste', 'garlic', 'ginger'], time: 20, level: 2,
    steps: [
      '鱿鱼处理干净，切花刀再切块，用料酒腌十分钟。',
      '水开焯十五秒捞出，青椒切块备用。',
      '热油爆香姜蒜，下一勺甜面酱小火炒出香味。',
      '倒鱿鱼和青椒大火翻炒一分钟，加少许糖提味。'
    ],
    tip: '甜面酱要小火炒香再下料，否则有生酱味。'
  },
  {
    id: 'b4-onion-squid', name: '洋葱炒鱿鱼', emoji: '🦑',
    need: ['squid', 'onion'], extra: ['wine', 'ginger', 'oyster'], time: 20, level: 1,
    steps: [
      '鱿鱼去膜切条，用料酒和姜片腌十分钟，再焯水二十秒。',
      '洋葱切粗丝，锅中放油中火炒到边缘透明。',
      '下鱿鱼大火翻炒，加一勺蚝油和少许生抽。',
      '快速翻匀，鱿鱼一卷起立刻出锅装盘。'
    ],
    tip: '洋葱先炒软再下鱿鱼，两者熟度才一致。'
  },
  {
    id: 'b4-fried-squid-rings', name: '炸鱿鱼圈', emoji: '🦑',
    need: ['squid'], extra: ['starch', 'pepper', 'wine'], time: 25, level: 3,
    steps: [
      '鱿鱼筒切一厘米宽的圈，用盐、料酒和白胡椒腌十分钟。',
      '鱿鱼圈先裹淀粉，圈内壁也要抹到。',
      '油烧到六成热，下圈中火炸两分钟至微黄捞出。',
      '升高油温复炸三十秒，配椒盐上桌。'
    ],
    tip: '圈内壁也要裹粉，否则下锅会缩成一团。'
  },
  {
    id: 'b4-clam-tofu-soup', name: '花蛤豆腐汤', emoji: '🍲',
    need: ['clam', 'tofu'], extra: ['ginger', 'scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '花蛤盐水吐沙一小时，冲洗干净；豆腐切小块。',
      '锅中少油爆香姜丝，加两碗水烧开。',
      '下豆腐中火煮五分钟，再放花蛤煮到开口。',
      '加盐和少许白胡椒，撒葱花后立刻关火。'
    ],
    tip: '花蛤开口就关火，多煮肉会缩、汤会腥。'
  },
  {
    id: 'b4-clam-vermicelli-pot', name: '花蛤粉丝煲', emoji: '🍲',
    need: ['clam', 'vermicelli'], extra: ['garlic', 'oyster', 'scallion'], time: 25, level: 2,
    steps: [
      '花蛤吐沙洗净，粉丝温水泡软后剪短。',
      '砂锅放油，铺一层蒜末小火炒香。',
      '铺粉丝，摆花蛤，淋两勺生抽、一勺蚝油和半碗水。',
      '盖盖中火焖六分钟到花蛤开口，撒葱花。'
    ],
    tip: '花蛤平铺别叠压，受热才均匀开口。'
  },
  {
    id: 'b4-beer-clam', name: '啤酒花蛤', emoji: '🍺',
    need: ['clam'], extra: ['beer', 'garlic', 'driedchili'], time: 20, level: 2,
    steps: [
      '花蛤盐水吐沙一小时，反复搓洗外壳。',
      '热锅放油，小火爆香蒜末和干辣椒段。',
      '倒花蛤大火翻炒，淋半罐啤酒，盖盖焖三分钟。',
      '开盖大火收到汤汁略干，加盐翻匀。'
    ],
    tip: '啤酒去腥比料酒彻底，别用黑啤会发苦。'
  },
  {
    id: 'b4-garlic-scallop', name: '蒜蓉蒸扇贝', emoji: '🐚',
    need: ['scallop', 'vermicelli'], extra: ['garlic', 'oyster', 'scallion'], time: 20, level: 1,
    steps: [
      '扇贝刷净外壳，取出贝肉去掉黑色内脏，贝壳留用。',
      '粉丝温水泡软，卷成小团铺在壳上，再放回贝肉。',
      '一半蒜末用油小火炸香，和生蒜末、蚝油拌匀铺上。',
      '水开上锅大火蒸六分钟，撒葱花浇热油。'
    ],
    tip: '半炸半生的蒜蓉才够香，全炸会发苦。'
  },
  {
    id: 'b4-pan-seared-scallop', name: '香煎扇贝', emoji: '🐚',
    need: ['scallop'], extra: ['blackpepper', 'garlic'], time: 15, level: 2,
    steps: [
      '扇贝肉去内脏洗净，用厨房纸彻底吸干水。',
      '两面撒盐和黑胡椒，静置五分钟。',
      '平底锅烧热放油，中火下扇贝煎两分钟不要动。',
      '翻面再煎一分半，边缘焦黄即可出锅。'
    ],
    tip: '扇贝含水多必须吸干，下锅后别急着翻。'
  },
  {
    id: 'b4-scallop-broccoli', name: '扇贝炒西兰花', emoji: '🥦',
    need: ['scallop', 'broccoli'], extra: ['garlic', 'oyster', 'starch'], time: 20, level: 1,
    steps: [
      '西兰花掰小朵，沸水加盐焯一分钟捞出过凉。',
      '扇贝肉洗净，用盐和淀粉抓匀腌五分钟。',
      '热油下蒜末炒香，扇贝中火煎到两面变白。',
      '倒西兰花，加蚝油和少许盐大火翻匀。'
    ],
    tip: '西兰花焯完过凉水，颜色才翠绿。'
  },
  {
    id: 'b4-scallop-wintermelon-soup', name: '扇贝冬瓜汤', emoji: '🍲',
    need: ['scallop', 'wintermelon'], extra: ['ginger', 'scallion'], time: 25, level: 1,
    steps: [
      '冬瓜去皮切薄片，扇贝肉洗净去掉内脏。',
      '锅中少油爆香姜丝，下冬瓜片翻炒一分钟。',
      '加两碗热水，中火煮八分钟到冬瓜透明。',
      '下扇贝煮两分钟，加盐调味后撒葱花。'
    ],
    tip: '扇贝最后下，煮久了肉会缩成一小团。'
  },
  {
    id: 'b4-steamed-crab', name: '清蒸螃蟹', emoji: '🦀',
    need: ['crab'], extra: ['ginger', 'scallion', 'wine'], time: 20, level: 1,
    steps: [
      '螃蟹用刷子刷净蟹壳和腿缝，绑绳不用解开。',
      '盘底垫姜片葱段，蟹肚朝上摆好淋一勺料酒。',
      '水开后放上蒸屉，全程大火蒸十二分钟。',
      '姜末加两勺醋调成蘸碟，趁热蘸着吃。'
    ],
    tip: '蟹肚朝上蒸黄不会流，一定水开后再上锅。'
  },
  {
    id: 'b4-ginger-scallion-crab', name: '姜葱炒蟹', emoji: '🦀',
    need: ['crab'], extra: ['ginger', 'scallion', 'wine'], time: 25, level: 3,
    steps: [
      '螃蟹刷净，去腮去胃斩块，切口处拍一层淀粉。',
      '油烧热，蟹块切口朝下中火煎到定型。',
      '下大量姜片和葱白爆香，沿锅边淋料酒翻炒。',
      '加小半碗水盖盖焖五分钟，放葱绿大火收汁。'
    ],
    tip: '切口拍粉能锁住蟹汁，炒时不散不老。'
  },
  {
    id: 'b4-crab-tofu-pot', name: '螃蟹豆腐煲', emoji: '🍲',
    need: ['crab', 'firmtofu'], extra: ['ginger', 'scallion', 'wine'], time: 35, level: 2,
    steps: [
      '螃蟹刷净斩块，切口拍薄淀粉；老豆腐切厚片。',
      '锅中放油，豆腐片两面煎黄后盛出。',
      '下姜片和蟹块煎到变红，淋料酒，加两碗热水烧开。',
      '放回豆腐，小火炖十五分钟，加盐撒葱花。'
    ],
    tip: '豆腐先煎定型，炖时不易碎还更吸汤。'
  },
  {
    id: 'b5-cherrytomato-salad', name: '油醋圣女果沙拉', emoji: '🥗',
    need: ['cherrytomato', 'lettuce'], extra: ['honey', 'blackpepper'], time: 8, level: 1,
    steps: [
      '圣女果洗净对半切开，生菜用手撕成小片，凉水泡5分钟后彻底沥干。',
      '小碗里放一勺蜂蜜、两勺醋、少许盐和黑胡椒，搅到蜂蜜化开。',
      '圣女果和生菜放进大碗，淋上调好的汁，轻轻翻拌均匀即可。'
    ],
    tip: '生菜沥干水再拌，汁才挂得住，拌好马上吃。'
  },
  {
    id: 'b5-bellpepper-kingoyster', name: '彩椒炒杏鲍菇', emoji: '🌶️',
    need: ['bellpepper', 'kingoyster'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '杏鲍菇切厚片再改刀成粗条，彩椒去籽切条，蒜切片备用。',
      '锅烧热放两勺油，下杏鲍菇中火煎到出水变软、边缘微黄。',
      '加蒜片炒香，倒入彩椒大火翻炒1分钟，保持脆感。',
      '加一勺蚝油和少许盐，翻匀后出锅。'
    ],
    tip: '杏鲍菇先煎出水分，比直接炒更香更有嚼头。'
  },
  {
    id: 'b5-bellpepper-egg-pancake', name: '彩椒鸡蛋饼', emoji: '🍳',
    need: ['bellpepper', 'egg', 'flour'], extra: [], time: 15, level: 1,
    steps: [
      '彩椒去籽切细丁；两个鸡蛋打散，加50克面粉和80毫升清水搅成稀糊。',
      '面糊里放彩椒丁和少许盐，搅匀后静置5分钟。',
      '平底锅刷薄油，小火倒入一勺面糊，转锅摊成圆饼。',
      '底面定型后翻面，两面微黄即可出锅切块。'
    ],
    tip: '面糊调到能流动的酸奶状，摊出来才薄而不断。'
  },
  {
    id: 'b5-cold-redcabbage', name: '凉拌紫甘蓝', emoji: '🥗',
    need: ['redcabbage'], extra: ['garlic', 'sesamoil'], time: 10, level: 1,
    steps: [
      '紫甘蓝切细丝，放盆里加一勺盐抓匀，腌10分钟杀出水分。',
      '用手挤干水分，加蒜末、两勺醋、半勺糖和少许盐。',
      '淋一勺芝麻油拌匀，静置5分钟入味后装盘。'
    ],
    tip: '加盐腌过再挤水，紫甘蓝才脆不水塌。'
  },
  {
    id: 'b5-snowpea-yam', name: '荷兰豆炒山药', emoji: '🥢',
    need: ['snowpea', 'yam'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '山药去皮切薄片，泡在清水里防氧化；荷兰豆撕去两侧老筋。',
      '水开下荷兰豆和山药片焯1分钟，捞出过凉水沥干。',
      '热锅放油爆香蒜片，倒入两样食材大火翻炒1分钟。',
      '加盐和少许糖调味，翻匀即可出锅。'
    ],
    tip: '山药切片后泡水，焯水时滴几滴油颜色更亮。'
  },
  {
    id: 'b5-blanched-caixin', name: '白灼菜心', emoji: '🥗',
    need: ['caixin'], extra: ['oyster', 'garlic'], time: 8, level: 1,
    steps: [
      '菜心掐去老根洗净沥干，大蒜剁成末。',
      '水烧开加一勺盐和几滴油，菜心下锅烫40秒，变翠绿就捞出摆盘。',
      '锅里留两勺水，加一勺蚝油和少许糖煮开，浇在菜心上。',
      '蒜末撒在表面，烧一勺热油泼上去激出香味。'
    ],
    tip: '水里加油和盐，烫出的菜心才翠绿不发黄。'
  },
  {
    id: 'b5-garlic-youmaicai', name: '蒜蓉油麦菜', emoji: '🥗',
    need: ['youmaicai'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '油麦菜洗净切长段，菜梗和叶子分开放，蒜切末。',
      '大火把锅烧热，放两勺油，下一半蒜末炒出香味。',
      '先下菜梗炒20秒，再放叶子，全程大火快炒。',
      '加盐和剩下的蒜末，翻两下立刻出锅。'
    ],
    tip: '全程大火不超过1分钟，蒜分两次放才香不糊。'
  },
  {
    id: 'b5-cold-enoki', name: '凉拌金针菇', emoji: '🍄',
    need: ['enoki'], extra: ['garlic', 'chilioil'], time: 12, level: 1,
    steps: [
      '金针菇切去老根，撕成小把，用清水冲洗干净。',
      '水开下锅焯2分钟，捞出立刻过凉水，攥干水分。',
      '加蒜末、两勺醋、一勺辣椒油和少许盐、糖。',
      '拌匀后冷藏10分钟，撒上葱花更爽口。'
    ],
    tip: '焯后一定要攥干水，不然拌出来一盘汤。'
  },
  {
    id: 'b5-stirfry-tonghao', name: '清炒茼蒿', emoji: '🥗',
    need: ['tonghao'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '茼蒿摘去老梗，洗净后切成两段，蒜切片。',
      '锅烧到微微冒烟，放两勺油，下蒜片爆香。',
      '倒入茼蒿大火快炒30秒，叶子刚塌就加盐。',
      '加盐和剩余蒜末翻匀，立即关火出锅，别久炒。'
    ],
    tip: '茼蒿易出水，锅要够热、动作要快。'
  },
  {
    id: 'b5-tonghao-driedtofu', name: '茼蒿拌豆干', emoji: '🥗',
    need: ['tonghao', 'driedtofu'], extra: ['sesamoil', 'garlic'], time: 12, level: 1,
    steps: [
      '豆干切细条，水开焯1分钟去豆腥，捞出沥干。',
      '茼蒿下同一锅水烫20秒，捞出过凉水，挤干切段。',
      '两样放碗里，加蒜末、少许盐和半勺糖。',
      '淋一勺芝麻油拌匀，静置3分钟入味。'
    ],
    tip: '豆干先焯水，口感更软也更容易入味。'
  },
  {
    id: 'b5-fermentedfu-waterspinach', name: '腐乳空心菜', emoji: '🥗',
    need: ['waterspinach'], extra: ['fermentedtofu', 'garlic'], time: 10, level: 1,
    steps: [
      '空心菜掐成段，梗和叶分开；两块腐乳加一勺腐乳汁压成泥。',
      '热锅放两勺油，下蒜末和腐乳泥小火炒香。',
      '先下菜梗大火炒30秒，再放叶子炒到塌软。',
      '尝一下咸淡再决定加不加盐，翻匀立即出锅。'
    ],
    tip: '腐乳本身很咸，尝过再决定加不加盐。'
  },
  {
    id: 'b5-garlic-amaranth', name: '蒜蓉苋菜', emoji: '🥗',
    need: ['amaranth'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '苋菜摘去老梗，洗净沥干，蒜拍碎切末。',
      '大火热锅放两勺油，下一半蒜末炒香。',
      '倒入苋菜快速翻炒，叶子出水变软约1分钟。',
      '加盐和剩下的蒜末，翻匀马上出锅。'
    ],
    tip: '苋菜很吃油，油稍多些炒出来才不涩。'
  },
  {
    id: 'b5-garlic-gailan', name: '蒜蓉炒芥蓝', emoji: '🥦',
    need: ['gailan'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '芥蓝削去根部老皮，斜切成段，粗梗处划十字刀。',
      '水开加少许盐和油，芥蓝焯1分钟捞出沥干。',
      '热锅放油，下一半蒜末炒香，倒入芥蓝大火翻炒。',
      '加盐、少许糖和剩下的蒜末，炒匀出锅。'
    ],
    tip: '粗梗划刀再焯水，熟得均匀还不苦。'
  },
  {
    id: 'b5-gailan-sausage', name: '芥蓝炒腊肠', emoji: '🥦',
    need: ['gailan', 'chinesesausage'], extra: ['wine', 'garlic'], time: 12, level: 1,
    steps: [
      '腊肠斜切薄片，芥蓝去皮切斜段，蒜切片。',
      '锅里不放油，小火把腊肠煎出油、边缘卷起，盛出备用。',
      '用腊肠油爆香蒜片，下芥蓝大火炒1分钟。',
      '倒回腊肠，淋半勺料酒，加少许糖炒匀出锅。'
    ],
    tip: '腊肠先煎出油，整道菜不用另外多放油。'
  },
  {
    id: 'b5-toona-egg', name: '香椿炒蛋', emoji: '🍳',
    need: ['toona', 'egg'], extra: [], time: 8, level: 1,
    steps: [
      '香椿洗净，水开焯30秒到变绿，捞出过凉水挤干切碎。',
      '三个鸡蛋打散，加香椿碎和少许盐搅匀。',
      '热锅多放点油，倒入蛋液，等边缘凝固再翻炒。',
      '炒到蛋块刚熟、还带点嫩就关火。'
    ],
    tip: '香椿必须焯水去亚硝酸盐，焯完颜色更绿。'
  },
  {
    id: 'b5-toona-tofu', name: '香椿拌豆腐', emoji: '🥗',
    need: ['toona', 'tofu'], extra: ['sesamoil'], time: 10, level: 1,
    steps: [
      '嫩豆腐切小方块，放淡盐水里泡5分钟去豆腥。',
      '香椿焯水30秒，过凉后挤干，切成细末。',
      '豆腐沥干装盘，铺上香椿末，撒少许盐。',
      '淋一勺芝麻油，吃前用筷子从下往上轻轻拌匀。'
    ],
    tip: '豆腐用淡盐水泡过不易碎，还更紧实。'
  },
  {
    id: 'b5-cilantro-peanut', name: '香菜拌花生', emoji: '🥜',
    need: ['cilantro', 'peanut'], extra: ['sesamoil', 'chilioil'], time: 12, level: 1,
    steps: [
      '花生米冷油下锅，小火炸到噼啪声变密，捞出晾凉。',
      '香菜洗净沥干，切成3厘米长的段。',
      '花生和香菜放碗里，加少许盐、半勺糖、一勺醋。',
      '淋一勺芝麻油和一勺辣椒油，拌匀后静置5分钟。'
    ],
    tip: '花生冷油下锅慢炸，凉透了才酥脆。'
  },
  {
    id: 'b5-cabbage-mushroom-soup', name: '白菜平菇汤', emoji: '🍲',
    need: ['cabbage', 'mushroom'], extra: ['ginger', 'scallion'], time: 15, level: 1,
    steps: [
      '白菜洗净切片，平菇撕成条，姜切丝。',
      '锅里放少许油，下姜丝和平菇中火炒到出水变软。',
      '加两碗开水煮开，放白菜煮5分钟至软。',
      '加盐和白胡椒调味，撒葱花出锅。'
    ],
    tip: '平菇先炒出水分再加水，汤更鲜不寡淡。'
  },
  {
    id: 'b5-stirfry-peashoot', name: '清炒豌豆苗', emoji: '🥗',
    need: ['peashoot'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '豌豆苗掐去老根，用清水冲洗两遍，沥干水分。',
      '大火热锅放两勺油，下蒜末炒出香味。',
      '倒入豌豆苗，大火快速翻炒40秒。',
      '加少许盐翻匀，立刻出锅装盘，别在锅里久留。'
    ],
    tip: '豌豆苗极嫩，炒久了会塌，盐最后放。'
  },
  {
    id: 'b5-stirfry-chayote', name: '清炒佛手瓜', emoji: '🥒',
    need: ['chayote'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '佛手瓜削皮去核，切成薄片；蒜切片。',
      '热锅放两勺油，下蒜片小火炒到微微发黄出香。',
      '倒入佛手瓜片，中大火翻炒2分钟至半透明。',
      '加盐和少许糖调味，大火炒匀后出锅装盘。'
    ],
    tip: '佛手瓜切薄一点更易熟，口感清甜脆嫩。'
  },
  {
    id: 'b5-garlicsprout-egg', name: '蒜苔炒鸡蛋', emoji: '🍳',
    need: ['garlicsprout', 'egg'], extra: [], time: 12, level: 1,
    steps: [
      '蒜苔掐去老梗，切成3厘米段；两个鸡蛋打散加少许盐。',
      '热锅多放点油，倒入蛋液炒成嫩块，盛出备用。',
      '锅里留油，下蒜苔中火炒2分钟至断生。',
      '倒回鸡蛋，加少许盐和生抽，翻匀出锅。'
    ],
    tip: '蒜苔炒到表皮起皱才断生，别太早放蛋。'
  },
  {
    id: 'b5-yellowchive-egg', name: '韭黄炒蛋', emoji: '🍳',
    need: ['yellowchive', 'egg'], extra: [], time: 8, level: 1,
    steps: [
      '韭黄洗净沥干，切成4厘米段；鸡蛋打散加少许盐。',
      '热锅放油，倒入蛋液炒成大块，盛出。',
      '锅里补少许油，下韭黄大火炒20秒。',
      '倒回鸡蛋，加盐翻匀，立刻出锅。'
    ],
    tip: '韭黄遇热就软，全程不超过1分钟。'
  },
  {
    id: 'b5-garlicshoot-tofu', name: '蒜苗烧豆腐', emoji: '🍲',
    need: ['garlicshoot', 'firmtofu'], extra: ['oyster', 'garlic'], time: 15, level: 2,
    steps: [
      '老豆腐切厚片，蒜苗斜切段，蒜苗白和叶分开放。',
      '平底锅放油，中火把豆腐两面煎到金黄，盛出。',
      '锅里下蒜末和蒜苗白炒香，加一勺蚝油和半碗水煮开。',
      '放回豆腐小火焖3分钟，下蒜苗叶，收汁出锅。'
    ],
    tip: '豆腐煎定型再烧，翻动时才不容易碎。'
  },
  {
    id: 'b5-taro-pancake', name: '香煎芋头饼', emoji: '🍠',
    need: ['taro', 'flour'], extra: ['scallion'], time: 25, level: 2,
    steps: [
      '芋头去皮切块，上锅蒸15分钟，趁热压成泥。',
      '加50克面粉、少许盐和葱花，揉成不粘手的面团。',
      '分成小份，压成约1厘米厚的饼。',
      '平底锅刷油，小火两面各煎3分钟至金黄。'
    ],
    tip: '芋泥要趁热和面，凉了发硬不好成型。'
  },
  {
    id: 'b5-cheese-sweetpotato', name: '芝士焗红薯', emoji: '🍠',
    need: ['sweetpotato'], extra: ['cheese'], time: 30, level: 1,
    steps: [
      '红薯洗净对半切开，切面朝下放进盘里。',
      '上锅大火蒸20分钟，筷子能轻松扎透即可。',
      '取出稍放凉，用勺子把薯肉挖松，再铺回皮里。',
      '表面盖一片芝士，放烤箱200度烤8分钟至融化。'
    ],
    tip: '没有烤箱可用空气炸锅180度烤6分钟。'
  },
  {
    id: 'b5-waterchestnut-meatpie', name: '马蹄蒸肉饼', emoji: '🍲',
    need: ['waterchestnut', 'mincedpork'], extra: ['starch', 'oyster'], time: 25, level: 2,
    steps: [
      '马蹄去皮切细丁，猪肉末加一勺淀粉、一勺蚝油和少许盐。',
      '顺着一个方向搅到肉馅起胶，再拌入马蹄丁。',
      '肉馅平铺在盘里，压成约1厘米厚的饼。',
      '水开上锅大火蒸12分钟，出锅撒葱花。'
    ],
    tip: '肉馅搅上劲再铺盘，蒸出来才嫩不散。'
  },
  {
    id: 'b5-cold-celtuce', name: '凉拌莴笋丝', emoji: '🥗',
    need: ['celtuce'], extra: ['garlic', 'sesamoil'], time: 10, level: 1,
    steps: [
      '莴笋去皮切细丝，放冰水里泡10分钟更脆。',
      '捞出沥干，加一勺盐抓匀腌5分钟，挤掉水分。',
      '加蒜末、少许糖、一勺醋和半勺盐拌匀。',
      '淋一勺芝麻油，撒上白芝麻，装盘即可上桌。'
    ],
    tip: '莴笋丝泡冰水，脆度能翻一倍。'
  },
  {
    id: 'b5-braised-bambooshoot', name: '油焖笋', emoji: '🎍',
    need: ['bambooshoot'], extra: ['sesamoil'], time: 20, level: 2,
    steps: [
      '竹笋去壳切滚刀块，水开加少许盐煮5分钟去涩，捞出。',
      '锅里放三勺油，下笋块中火煎到边缘微黄。',
      '加两勺生抽、半勺老抽、一勺糖，倒半碗水。',
      '盖盖小火焖8分钟，开盖大火收汁，淋芝麻油。'
    ],
    tip: '笋先煮5分钟去草酸，不涩口也不麻嘴。'
  },
  {
    id: 'b5-pickled-bambooshoot', name: '酸菜笋丝', emoji: '🍲',
    need: ['bambooshoot', 'pickled'], extra: ['driedchili'], time: 15, level: 1,
    steps: [
      '竹笋切细丝，水开焯3分钟去涩；酸菜挤干切碎。',
      '锅里放油，下干辣椒和酸菜小火炒出酸香。',
      '倒入笋丝转大火翻炒2分钟，让酸香裹匀。',
      '加少许糖和半碗水，焖3分钟收干汤汁。'
    ],
    tip: '酸菜本身咸，先尝再放盐，加糖能提鲜。'
  },
  {
    id: 'b5-waterbamboo-edamame', name: '茭白炒毛豆', emoji: '🥗',
    need: ['waterbamboo', 'edamame'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '茭白剥壳切丁，毛豆仁洗净，蒜切末。',
      '毛豆仁下开水焯3分钟，捞出沥干。',
      '热锅放油爆香蒜末，下茭白丁炒2分钟至变软。',
      '倒入毛豆，加盐和少许糖炒匀出锅。'
    ],
    tip: '毛豆先焯水，炒的时候更容易熟透入味。'
  },
  {
    id: 'b5-salted-edamame', name: '盐水毛豆', emoji: '🥗',
    need: ['edamame'], extra: ['sichuan', 'driedchili'], time: 15, level: 1,
    steps: [
      '毛豆洗净，用剪刀剪去豆荚两头，方便入味。',
      '锅里加水，放花椒、干辣椒和两勺盐煮开。',
      '下毛豆中火煮8分钟，关火后再泡20分钟。',
      '捞出沥干水分，冷藏半小时后再吃风味更好。'
    ],
    tip: '剪掉豆荚两头，盐水才进得去。'
  },
  {
    id: 'b5-scallion-broadbean', name: '葱油蚕豆', emoji: '🥗',
    need: ['broadbean'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '蚕豆剥去外壳，再剥掉内层薄皮，只取豆瓣。',
      '小葱切段，冷油下锅小火炸到微焦，捞出葱段留油。',
      '下蚕豆中火翻炒2分钟，加小半碗水焖3分钟。',
      '加盐和少许糖调味，大火收干汤汁后出锅。'
    ],
    tip: '剥掉内层薄皮，蚕豆才软糯不柴。'
  },
  {
    id: 'b5-handtorn-kingoyster', name: '手撕杏鲍菇', emoji: '🍄',
    need: ['kingoyster'], extra: ['cumin', 'chilioil', 'garlic'], time: 15, level: 1,
    steps: [
      '杏鲍菇用手撕成粗条，断面粗糙比刀切更易挂汁。',
      '平底锅不放油，中火干煸5分钟至出水收缩。',
      '加两勺油、蒜末和半勺孜然粉炒香。',
      '加盐和一勺辣椒油，大火翻匀后出锅装盘。'
    ],
    tip: '手撕的断面吸味，比切片香得多。'
  },
  {
    id: 'b5-shimeji-asparagus', name: '白玉菇炒芦笋', emoji: '🥗',
    need: ['shimeji', 'asparagus'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '芦笋削去根部老皮，切斜段；白玉菇切去根部撕散。',
      '水开下芦笋焯1分钟，捞出过凉水沥干。',
      '热锅放油爆香蒜末，下白玉菇炒到出水变软。',
      '倒入芦笋，加一勺蚝油和少许盐，炒匀出锅。'
    ],
    tip: '芦笋根部老皮一定要削，口感嫩很多。'
  },
  {
    id: 'b5-buttonmushroom-broccoli', name: '口蘑炒西兰花', emoji: '🥦',
    need: ['buttonmushroom', 'broccoli'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '西兰花切小朵，用淡盐水泡10分钟洗净；口蘑切片。',
      '水开加盐和几滴油，西兰花焯1分钟捞出。',
      '热锅放油爆香蒜末，下口蘑中火煎到两面微黄。',
      '倒入西兰花，加一勺蚝油和少许盐炒匀。'
    ],
    tip: '西兰花用盐水泡，缝隙里的脏东西才出得来。'
  },
  {
    id: 'b5-drypot-teatree', name: '干锅茶树菇', emoji: '🌶️',
    need: ['teatree', 'porkbelly'], extra: ['driedchili', 'douban', 'garlic'], time: 20, level: 2,
    steps: [
      '干茶树菇用温水泡30分钟，剪去老根后挤干水分。',
      '五花肉切薄片，锅里不放油，小火煸到出油微卷。',
      '下蒜片、干辣椒和半勺豆瓣酱炒出红油。',
      '倒入茶树菇大火翻炒3分钟，加少许糖和生抽炒匀。'
    ],
    tip: '茶树菇要泡透再挤干，带水炒不香。'
  },
  {
    id: 'b5-tremella-cucumber', name: '银耳拌黄瓜', emoji: '🥗',
    need: ['tremella', 'cucumber'], extra: ['garlic', 'sesamoil'], time: 15, level: 1,
    steps: [
      '银耳提前用冷水泡1小时，剪去黄色硬蒂，撕成小朵。',
      '水开下银耳焯2分钟，捞出过凉水沥干。',
      '黄瓜拍裂切段，加少许盐腌5分钟后倒掉水。',
      '两样加蒜末、醋、盐和芝麻油拌匀。'
    ],
    tip: '银耳用冷水泡发才脆，热水泡会烂。'
  },
  {
    id: 'b5-wintermelon-kelp-soup', name: '冬瓜海带汤', emoji: '🍲',
    need: ['wintermelon', 'kelp'], extra: ['ginger'], time: 25, level: 1,
    steps: [
      '海带结提前泡2小时，中途换两次水去咸味。',
      '冬瓜去皮去瓤切厚片，姜切成细丝备用。',
      '锅里放少许油，下姜片和海带翻炒1分钟。',
      '加三碗水煮开，放冬瓜转中小火煮15分钟，加盐调味。'
    ],
    tip: '海带多换几次水，汤才不会又咸又腥。'
  },
  {
    id: 'b5-tiger-greenpepper', name: '虎皮青椒', emoji: '🌶️',
    need: ['greenpepper'], extra: ['garlic'], time: 12, level: 2,
    steps: [
      '青椒去蒂去籽，用手掌压扁，这样更容易贴锅。',
      '平底锅不放油，中火把青椒两面煎出虎皮斑。',
      '沿锅边加两勺油，下蒜末小火炒出香味。',
      '淋两勺生抽、半勺醋和少许糖，翻匀收汁。'
    ],
    tip: '青椒先干煸出虎皮，再放油才够香。'
  },
  {
    id: 'b5-drypot-cauliflower', name: '干锅花菜', emoji: '🥦',
    need: ['cauliflower', 'porkbelly'], extra: ['driedchili', 'douban', 'garlic'], time: 20, level: 2,
    steps: [
      '花菜掰小朵，淡盐水泡10分钟，水开焯1分钟捞出沥干。',
      '五花肉切薄片，冷锅小火煸到出油微卷。',
      '下蒜片、干辣椒和半勺豆瓣酱炒出红油。',
      '倒入花菜大火翻炒3分钟，加少许生抽炒匀。'
    ],
    tip: '花菜焯后一定沥干，带水下锅炒不香。'
  },
  {
    id: 'b5-saltpepper-potato', name: '椒盐小土豆', emoji: '🥔',
    need: ['potato'], extra: ['cumin', 'sichuan'], time: 25, level: 2,
    steps: [
      '小土豆洗净，带皮上锅蒸15分钟至能扎透。',
      '取出稍放凉，用手掌把每个土豆轻轻压扁。',
      '平底锅放油，中火把土豆两面煎到金黄起壳。',
      '撒盐、孜然粉和花椒粉，翻匀出锅。'
    ],
    tip: '蒸熟压扁再煎，外皮酥里面糯。'
  },
  {
    id: 'b5-corn-carrot-peas', name: '玉米胡萝卜炒豌豆', emoji: '🌽',
    need: ['corn', 'carrot', 'peas'], extra: ['scallion'], time: 12, level: 1,
    steps: [
      '玉米粒、豌豆仁洗净，胡萝卜切成小丁。',
      '水开把三样一起焯2分钟，捞出沥干。',
      '热锅放油，倒入食材大火翻炒2分钟。',
      '加盐和少许糖调味，撒葱花出锅。'
    ],
    tip: '三样先焯水再炒，熟度一致颜色也亮。'
  },
  {
    id: 'b5-onion-soup', name: '洋葱浓汤', emoji: '🍲',
    need: ['onion'], extra: ['blackpepper', 'cheese'], time: 25, level: 2,
    steps: [
      '洋葱切细丝，锅里放两勺油，小火慢炒15分钟至焦糖色。',
      '中途勤翻动避免糊底，颜色越深汤越甜。',
      '加两碗热水煮开，转小火再煮5分钟。',
      '加盐和黑胡椒调味，盛碗后盖一片芝士。'
    ],
    tip: '洋葱要小火炒够时间，甜味全靠这一步。'
  },
  {
    id: 'b5-radish-pancake', name: '萝卜丝煎饼', emoji: '🥞',
    need: ['radish', 'flour'], extra: ['scallion', 'pepper'], time: 20, level: 2,
    steps: [
      '白萝卜擦成细丝，加一勺盐腌10分钟，挤干水分。',
      '加100克面粉和约80毫升清水，搅成能挂勺的稠糊。',
      '拌入葱花、少许白胡椒和盐，搅到没有干粉。',
      '平底锅刷油，舀一勺摊平，小火两面各煎3分钟。'
    ],
    tip: '萝卜丝一定挤干水，饼才成型不散。'
  },
  {
    id: 'b5-tahini-spinach', name: '麻酱菠菜', emoji: '🥗',
    need: ['spinach'], extra: ['tahini', 'garlic'], time: 10, level: 1,
    steps: [
      '菠菜洗净，水开下锅烫30秒，捞出过凉水挤干切段。',
      '两勺芝麻酱分次加温水澥开，调到能流动的状态。',
      '加蒜末、少许盐和一勺醋，搅到酱汁顺滑。',
      '把麻酱汁淋在菠菜上，吃前用筷子拌匀。'
    ],
    tip: '麻酱要一点点加水澥，一次加多会结块。'
  },
  {
    id: 'b5-tomato-zucchini', name: '番茄炒西葫芦', emoji: '🍅',
    need: ['tomato', 'zucchini'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '番茄顶部划十字，开水烫1分钟去皮切块。',
      '西葫芦对半切开，切厚片；蒜切片。',
      '热锅放油爆香蒜片，下番茄中火炒出汁。',
      '倒入西葫芦炒2分钟，加盐和少许糖，收汁出锅。'
    ],
    tip: '番茄去皮再炒更容易出沙，汤汁更浓。'
  },
  {
    id: 'b5-douchi-bittergourd', name: '豆豉炒苦瓜', emoji: '🥒',
    need: ['bittergourd'], extra: ['douchi', 'garlic'], time: 12, level: 1,
    steps: [
      '苦瓜对半切开，用勺子刮净白瓤，切薄片。',
      '加一勺盐抓匀腌10分钟，冲洗后挤干，苦味大减。',
      '热锅放油，下蒜末和一勺豆豉炒香。',
      '倒入苦瓜大火炒2分钟，加少许糖炒匀。'
    ],
    tip: '白瓤刮得越干净，苦味越轻。'
  },
  {
    id: 'b5-pumpkin-millet', name: '南瓜小米粥', emoji: '🎃',
    need: ['pumpkin', 'millet'], extra: [], time: 30, level: 1,
    steps: [
      '小米淘洗两遍，用清水泡10分钟。',
      '南瓜去皮去瓤，切成2厘米见方的小块。',
      '锅里加六碗水烧开，下小米和南瓜，转小火煮20分钟。',
      '中途搅两次防粘底，煮到南瓜化开、粥变稠。'
    ],
    tip: '小米开水下锅不易糊底，煮出来更黏。'
  },
  {
    id: 'b5-luffa-clam-soup', name: '丝瓜蛤蜊汤', emoji: '🍲',
    need: ['luffa', 'clam'], extra: ['ginger', 'scallion'], time: 20, level: 1,
    steps: [
      '花蛤放盐水里养2小时吐沙，搓洗干净。',
      '丝瓜去皮切滚刀块，姜切成细丝。',
      '锅里放少许油，下姜丝和丝瓜炒1分钟。',
      '加两碗水煮开，下花蛤煮到开口，加盐撒葱花。'
    ],
    tip: '花蛤开口就关火，煮久了肉会老。'
  },
  {
    id: 'b5-celery-fuzhu', name: '芹菜炒腐竹', emoji: '🥗',
    need: ['celery', 'fuzhu'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '腐竹提前用温水泡2小时至完全变软，切成段。',
      '芹菜去筋切段，水开焯30秒捞出沥干。',
      '热锅放油爆香蒜末，下腐竹翻炒1分钟。',
      '倒入芹菜，加一勺蚝油和少许盐，炒匀出锅。'
    ],
    tip: '腐竹用温水泡，冷水泡不透、热水会泡烂。'
  },
  {
    id: 'b5-chive-pocket', name: '韭菜盒子', emoji: '🥟',
    need: ['chive', 'egg', 'flour'], extra: ['sesamoil'], time: 30, level: 2,
    steps: [
      '面粉加温水揉成软面团，盖布醒20分钟。',
      '鸡蛋炒成碎末晾凉，韭菜切碎后先拌芝麻油锁水。',
      '加炒好的鸡蛋碎和盐，顺一个方向拌匀成馅。',
      '面团分小份擀皮，包馅后压紧边，平底锅小火两面煎黄。'
    ],
    tip: '韭菜先拌油再放盐，馅才不会出水。'
  },
  {
    id: 'b5-fried-lotus-box', name: '炸藕盒', emoji: '🥟',
    need: ['lotus', 'mincedpork'], extra: ['starch', 'scallion'], time: 30, level: 3,
    steps: [
      '莲藕去皮切夹刀片，第一刀不切断、第二刀切断。',
      '肉末加葱花、盐、生抽和少许淀粉，搅到上劲。',
      '把肉馅夹进两片藕之间，轻轻压平。',
      '面粉加水加少许淀粉调成稠糊，藕盒裹匀。',
      '油温六成热下锅，中火炸4分钟至金黄捞出。'
    ],
    tip: '面糊要稠到能挂住，太稀容易脱糊。'
  },
  {
    id: 'b5-greenbean-noodle', name: '豆角焖面', emoji: '🍜',
    need: ['greenbean', 'noodle'], extra: ['garlic'], time: 25, level: 3,
    steps: [
      '豆角去筋掰成段，洗净沥干；蒜切末。',
      '锅里放油，下豆角中火煸到表皮起皱。',
      '加生抽、老抽和两碗水煮开，把面条铺在豆角上。',
      '盖盖小火焖8分钟，开盖拌匀，撒蒜末。'
    ],
    tip: '面条铺在豆角上别贴锅底，汤刚好没过豆角。'
  },
  {
    id: 'b5-shiitake-stuffed', name: '香菇酿肉', emoji: '🍄',
    need: ['shiitake', 'mincedpork'], extra: ['starch', 'oyster'], time: 25, level: 2,
    steps: [
      '香菇去蒂洗净，香菇蒂切碎；肉末加蒂碎、盐和淀粉搅匀。',
      '香菇伞面朝下，把肉馅填进凹陷处抹平。',
      '摆盘后水开上锅，大火蒸12分钟。',
      '蒸出的汤汁加半勺蚝油勾薄芡，淋回香菇上。'
    ],
    tip: '香菇挑大小均匀的，肉馅才填得稳不塌。'
  },
  {
    id: 'b6-glutinous-shaomai', name: '糯米烧卖', emoji: '🥟',
    need: ['glutinousrice', 'dumplingwrapper', 'mincedpork'], extra: ['scallion', 'oyster'], time: 40, level: 2,
    steps: [
      '糯米150克提前泡2小时，铺在蒸屉上大火蒸20分钟至米粒透明',
      '肉末100克下锅中火炒散，加生抽、蚝油和葱花炒香后与温热的糯米拌匀',
      '饺子皮用擀面杖把边缘擀薄一圈，包入馅料，虎口收拢捏出花边',
      '水开后上锅大火蒸8分钟，皮透亮、馅冒油即可关火'
    ],
    tip: '饺子皮边缘蘸点水再捏，蒸时才不会裂口。'
  },
  {
    id: 'b6-glutinous-tofu-pocket', name: '糯米酿油豆腐', emoji: '🥘',
    need: ['glutinousrice', 'friedtofu', 'mincedpork'], extra: ['scallion', 'oyster'], time: 45, level: 2,
    steps: [
      '糯米100克泡2小时，上锅蒸熟后晾到温热，拌入生抽和少许糖',
      '肉末80克下锅炒散炒香，和糯米、葱花一起拌匀成馅',
      '油豆腐8个剪开一侧，把内里掏松，塞入糯米馅到八分满',
      '摆盘上锅，水开后中火蒸15分钟，让汤汁渗进米里',
      '另起锅用生抽、蚝油和水淀粉勾薄芡，淋在油豆腐上'
    ],
    tip: '馅只塞八分满，糯米吸水膨胀才不撑破油豆腐。'
  },
  {
    id: 'b6-friedtofu-vermicelli-soup', name: '油豆腐粉丝汤', emoji: '🍲',
    need: ['friedtofu', 'vermicelli', 'bokchoy'], extra: ['scallion', 'sesamoil'], time: 20, level: 1,
    steps: [
      '粉丝一把用温水泡5分钟至软，油豆腐6个对角切开，小青菜洗净',
      '锅中少油爆香葱花，加两碗水烧开，下油豆腐煮5分钟',
      '放粉丝和小青菜再煮2分钟，加盐和生抽调味',
      '出锅前淋几滴芝麻油，连汤盛碗趁热喝'
    ],
    tip: '油豆腐先煮能出油香，汤头才不寡淡。'
  },
  {
    id: 'b6-fuzhu-vermicelli-pot', name: '腐竹粉丝煲', emoji: '🍲',
    need: ['fuzhu', 'vermicelli', 'enoki'], extra: ['garlic', 'oyster'], time: 25, level: 1,
    steps: [
      '腐竹3根用冷水泡1小时至中心无硬芯，斜刀切成段',
      '粉丝泡软，金针菇切去根部撕成小把',
      '砂锅下油爆香蒜末，加一碗半水、生抽和蚝油烧开',
      '先放腐竹中火煮5分钟，再下粉丝和金针菇煮3分钟',
      '汤汁略收浓时撒一把葱花，连砂锅一起端上桌'
    ],
    tip: '腐竹必须冷水泡，热水泡外面烂了里面还硬。'
  },
  {
    id: 'b6-tofu-vermicelli-pot', name: '豆腐粉丝煲', emoji: '🍲',
    need: ['tofu', 'vermicelli', 'babycabbage'], extra: ['garlic', 'douban'], time: 25, level: 2,
    steps: [
      '嫩豆腐切2厘米厚片，粉丝温水泡软，娃娃菜切段铺在砂锅底',
      '平底锅少油，豆腐两面各煎1分钟定型，铺到娃娃菜上',
      '蒜末和豆瓣酱小火炒出红油，加两碗水烧开倒进砂锅',
      '中火煮8分钟至汤色发白，放粉丝再煮2分钟，加盐调味'
    ],
    tip: '豆腐先煎再炖不容易碎，也更能吸汤汁。'
  },
  {
    id: 'b6-army-stew', name: '部队锅', emoji: '🍲',
    need: ['instantnoodle', 'ricecake', 'tofu'], extra: ['cheese', 'douban'], time: 25, level: 1,
    steps: [
      '平底锅加两碗水，放一勺豆瓣酱和生抽，煮成红汤',
      '下年糕片和嫩豆腐块，中火煮5分钟至年糕变软',
      '铺上方便面饼，加盖煮3分钟，让面条吸饱汤汁',
      '关火盖一片芝士，焖1分钟至融化，撒葱花上桌'
    ],
    tip: '面条最后放，煮久了会糊，汤就不清爽。'
  },
  {
    id: 'b6-instant-noodle-pancake', name: '泡面煎饼', emoji: '🥞',
    need: ['instantnoodle', 'flour', 'egg'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '面饼捏成小块，用开水泡2分钟捞出，尽量沥干水分',
      '加2个鸡蛋、3勺面粉、葱花和少许盐，拌成能挂住的稠糊',
      '平底锅刷薄油，倒入面糊摊成1厘米厚的圆饼',
      '小火煎3分钟定型后翻面，再煎2分钟至两面金黄'
    ],
    tip: '面一定沥干，水多了摊不成饼只会散。'
  },
  {
    id: 'b6-driedtofu-fried-rice-noodle', name: '豆干炒河粉', emoji: '🍜',
    need: ['riceflakenoodle', 'driedtofu', 'beansprout'], extra: ['garlic', 'oyster'], time: 15, level: 2,
    steps: [
      '河粉300克用手轻轻抖散，豆干3块切薄片，豆芽洗净沥干',
      '热锅多放油，豆干片煎到边缘微焦，盛出备用',
      '蒜末爆香，下河粉大火快炒，沿锅边淋生抽和老抽上色',
      '倒回豆干和豆芽，翻炒1分钟，加盐出锅'
    ],
    tip: '河粉下锅别急着翻，先煎30秒才不粘不碎。'
  },
  {
    id: 'b6-tofu-pocket-rice-noodle-soup', name: '油豆腐肉末米线', emoji: '🍜',
    need: ['ricevermicelli', 'friedtofu', 'mincedpork'], extra: ['garlic', 'douban'], time: 25, level: 1,
    steps: [
      '米线用温水泡20分钟至能弯折，油豆腐6个对半切开',
      '锅中少油把肉末炒散，加蒜末和豆瓣酱炒出红油',
      '加两碗水烧开，下油豆腐中火煮5分钟吸味',
      '放米线煮3分钟，加盐和生抽调味，连汤盛碗撒葱花'
    ],
    tip: '米线泡软就够，久煮会断成一截截。'
  },
  {
    id: 'b6-tofu-veggie-balls', name: '豆腐素丸子', emoji: '🥘',
    need: ['firmtofu', 'flour', 'carrot'], extra: ['scallion', 'fivespice'], time: 30, level: 2,
    steps: [
      '老豆腐一块用纱布包住压10分钟，挤干水分后捏碎',
      '胡萝卜半根擦丝切末，加葱花、五香粉和盐与豆腐拌匀',
      '分次加3勺面粉，搅到能团成球且不粘手',
      '油温六成热下丸子，中小火炸4分钟至金黄浮起'
    ],
    tip: '豆腐水挤得越干，丸子越紧实不散。'
  },
  {
    id: 'b6-millet-rice-pumpkin-porridge', name: '二米南瓜粥', emoji: '🥣',
    need: ['millet', 'rice', 'pumpkin'], extra: [], time: 45, level: 1,
    steps: [
      '小米和大米各半碗，淘洗两遍后加清水泡20分钟',
      '南瓜200克去皮切小块，和米一起下锅，水加到锅的七分满',
      '大火烧开转小火，盖子留条缝煮30分钟，中途搅两次防糊',
      '南瓜煮化、粥面浮起米油即可关火，喜甜可加糖'
    ],
    tip: '大米先泡再煮，粥才绵稠不分层。'
  },
  {
    id: 'b6-tomato-tofu-rice', name: '番茄豆腐烩饭', emoji: '🍛',
    need: ['rice', 'tofu', 'tomato'], extra: ['scallion', 'ketchup'], time: 20, level: 1,
    steps: [
      '番茄两个切小块，嫩豆腐切小方丁，米饭提前焖好',
      '锅中少油下番茄，中火炒到出汁，加一勺番茄酱炒匀',
      '加半碗水烧开，下豆腐丁煮3分钟，加盐和少许糖',
      '倒入米饭拌散，小火焖2分钟收汁，撒葱花出锅'
    ],
    tip: '番茄要炒到软烂出沙，汤汁才够浓。'
  },
  {
    id: 'b6-fuzhu-tofu-pot', name: '腐竹豆腐煲', emoji: '🍲',
    need: ['fuzhu', 'firmtofu', 'mushroom'], extra: ['garlic', 'oyster'], time: 30, level: 2,
    steps: [
      '腐竹3根冷水泡软切段，老豆腐切厚片，平菇撕成小朵',
      '平底锅少油，豆腐煎至两面金黄后盛出',
      '砂锅爆香蒜末，下平菇炒软，加生抽、蚝油和一碗水烧开',
      '放腐竹中火煮8分钟，再下豆腐煮5分钟，收汁撒葱花'
    ],
    tip: '腐竹和豆腐分两次下，口感才有层次。'
  },
  {
    id: 'b6-driedtofu-pork-chow-mein', name: '豆干肉丝炒面', emoji: '🍜',
    need: ['driedtofu', 'noodle', 'porkloin'], extra: ['garlic', 'oyster'], time: 20, level: 2,
    steps: [
      '面条煮到八分熟，捞出过凉水，拌几滴油防粘',
      '豆干3块切丝，里脊100克切丝用生抽和淀粉抓匀腌5分钟',
      '热锅滑油，肉丝炒散后盛出，再下豆干丝小火煎香',
      '加蒜末和面条大火翻炒，淋生抽蚝油，倒回肉丝炒匀'
    ],
    tip: '面条煮八分就捞，回锅炒时才不烂。'
  },
  {
    id: 'b6-shiitake-chicken-claypot-rice', name: '香菇鸡腿焖饭', emoji: '🍚',
    need: ['rice', 'chickenleg', 'shiitake'], extra: ['ginger', 'oyster'], time: 40, level: 1,
    steps: [
      '大米两杯淘净，香菇4朵泡发切丁，泡菇水留着别倒',
      '鸡腿一只去骨切块，用生抽、蚝油和姜丝腌10分钟',
      '锅中少油炒香鸡块和香菇，倒入大米翻炒1分钟',
      '全部移入电饭锅，加泡菇水和清水到正常水位，按煮饭键'
    ],
    tip: '用泡香菇的水代替清水，饭香会浓一倍。'
  },
  {
    id: 'b6-braised-pork-rice', name: '台式卤肉饭', emoji: '🍚',
    need: ['rice', 'porkbelly', 'egg'], extra: ['fivespice', 'garlic'], time: 60, level: 2,
    steps: [
      '五花肉400克切小丁，冷水下锅焯2分钟捞出沥干',
      '锅中不放油，下肉丁小火煸5分钟出油，加蒜末和五香粉炒香',
      '加生抽、老抽、料酒和热水没过肉，放两个剥壳鸡蛋',
      '小火卤40分钟至汤汁浓稠，连汁浇在热米饭上'
    ],
    tip: '肉丁切小一点，卤出来才油亮入味。'
  },
  {
    id: 'b6-millet-yam-porridge', name: '小米山药粥', emoji: '🥣',
    need: ['millet', 'yam'], extra: [], time: 40, level: 1,
    steps: [
      '小米半碗淘洗两遍，山药去皮切滚刀块泡在清水里防黑',
      '锅中水烧开再下小米，大火煮5分钟后转小火',
      '加山药块继续煮20分钟，其间搅动两三次防糊底',
      '米粒开花、粥变稠即可关火，喜甜可加几颗冰糖'
    ],
    tip: '小米要水开下锅，粥才香而不涩。'
  },
  {
    id: 'b6-millet-steamed-ribs', name: '小米蒸排骨', emoji: '🍖',
    need: ['millet', 'ribs'], extra: ['douban', 'ginger'], time: 60, level: 2,
    steps: [
      '小米半碗洗净，用清水泡1小时至手指能捏碎',
      '排骨500克斩小块，加豆瓣酱、姜末、生抽和料酒腌20分钟',
      '沥干的小米拌进排骨，让每块都均匀裹上米粒',
      '平铺在深盘中，水开后大火蒸40分钟至排骨软烂'
    ],
    tip: '小米泡透才蒸得糯，泡不透会夹生。'
  },
  {
    id: 'b6-braised-beef-noodle', name: '红烧牛肉面', emoji: '🍜',
    need: ['noodle', 'beef', 'bokchoy'], extra: ['douban', 'ginger'], time: 60, level: 2,
    steps: [
      '牛腩500克切块冷水下锅焯水，冲净表面的浮沫',
      '锅中炒香豆瓣酱和姜片，下牛肉翻炒，加生抽老抽上色',
      '加热水没过牛肉，小火炖40分钟至筷子能插透',
      '另锅煮面和青菜，捞入碗中，浇上牛肉和原汤'
    ],
    tip: '炖牛肉一定加热水，冷水会让肉发柴。'
  },
  {
    id: 'b6-tomato-meat-sauce-pasta', name: '番茄肉酱意面', emoji: '🍝',
    need: ['pasta', 'mincedpork', 'tomato'], extra: ['garlic', 'cheese'], time: 30, level: 1,
    steps: [
      '意面下沸水，加一勺盐煮8分钟，捞出并留半碗面汤',
      '锅中少油炒香蒜末，下肉末200克炒到变色出油',
      '加番茄丁炒出汁，倒入面汤小火熬5分钟至浓稠',
      '放入意面翻拌1分钟，加盐和黑胡椒，盛盘撒芝士'
    ],
    tip: '留一勺煮面水，酱汁才挂得住面条。'
  },
  {
    id: 'b6-garlic-shrimp-pasta', name: '蒜香虾仁意面', emoji: '🍝',
    need: ['pasta', 'shrimp'], extra: ['garlic', 'driedchili'], time: 20, level: 1,
    steps: [
      '意面下盐水煮8分钟至有嚼劲，捞出保留一小碗面汤',
      '虾仁10只去虾线，用盐和料酒抓匀腌5分钟',
      '冷锅倒多一点油，下蒜片和干辣椒段小火煸到蒜片微黄',
      '下虾仁炒至变色，倒意面和两勺面汤，大火翻拌收汁'
    ],
    tip: '蒜片一定要小火煸，焦了整锅都会发苦。'
  },
  {
    id: 'b6-ham-mushroom-pasta', name: '火腿蘑菇意面', emoji: '🍝',
    need: ['pasta', 'ham', 'mushroom'], extra: ['cheese', 'blackpepper'], time: 25, level: 1,
    steps: [
      '意面下盐水煮8分钟，捞出沥干备用',
      '口蘑6个切片，火腿100克切成小条',
      '平底锅少油，下火腿和口蘑中火煎到出香出水',
      '加半碗面汤和两片芝士，小火搅到融化后倒意面拌匀'
    ],
    tip: '口蘑煎到出水上色，鲜味才出得来。'
  },
  {
    id: 'b6-hot-sour-rice-noodle', name: '酸辣米线', emoji: '🍜',
    need: ['ricevermicelli', 'beansprout', 'mincedpork'], extra: ['pickledchili', 'chilioil', 'garlic'], time: 20, level: 1,
    steps: [
      '米线用温水泡20分钟至软，豆芽焯水10秒捞出',
      '锅中少油炒香蒜末和泡椒碎，下肉末炒散，加两碗水烧开',
      '加生抽、醋和少许糖调味，下米线煮3分钟',
      '连汤倒入碗中，放豆芽，淋辣椒油撒葱花'
    ],
    tip: '醋分两次放，出锅前补一勺酸味更冲。'
  },
  {
    id: 'b6-chicken-mushroom-rice-noodle-soup', name: '香菇鸡汤米线', emoji: '🍜',
    need: ['ricevermicelli', 'shiitake', 'chickenleg'], extra: ['ginger'], time: 40, level: 1,
    steps: [
      '鸡腿两只剁块焯水，香菇6朵泡发，泡菇水留用',
      '锅中放鸡块、香菇和姜片，加泡菇水和清水烧开',
      '转小火炖25分钟，撇去表面浮油，加盐调味',
      '米线另锅煮3分钟捞入碗中，浇上鸡汤和香菇'
    ],
    tip: '泡菇水沉淀后取上层，汤会鲜得多。'
  },
  {
    id: 'b6-beef-chow-fun', name: '干炒牛河', emoji: '🍜',
    need: ['riceflakenoodle', 'beef', 'beansprout'], extra: ['scallion', 'oyster'], time: 20, level: 3,
    steps: [
      '牛肉150克逆纹切薄片，用生抽、淀粉和少许油腌10分钟',
      '锅烧到冒烟再下油，滑炒牛肉至变色立刻盛出',
      '补油下河粉，用铲子推散别翻搅，让底面煎出焦边',
      '加豆芽、葱段和牛肉，淋生抽蚝油，大火颠匀10秒出锅'
    ],
    tip: '热锅冷油、少翻动，是河粉不碎的关键。'
  },
  {
    id: 'b6-shrimp-rice-noodle-soup', name: '鲜虾汤河粉', emoji: '🍜',
    need: ['riceflakenoodle', 'shrimp', 'bokchoy'], extra: ['ginger', 'sesamoil'], time: 20, level: 1,
    steps: [
      '虾8只去壳挑虾线，河粉切宽条，小青菜洗净',
      '锅中少油煎香姜片，下虾头虾壳压炒出红油',
      '加两碗水煮5分钟，捞出虾壳，下河粉和青菜',
      '放虾仁煮1分钟至变红，加盐和白胡椒，淋芝麻油'
    ],
    tip: '虾头别扔，煸出红油汤才够鲜。'
  },
  {
    id: 'b6-chili-oil-instant-noodle', name: '老干妈拌泡面', emoji: '🍜',
    need: ['instantnoodle', 'egg'], extra: ['laoganma', 'scallion', 'sesamoil'], time: 10, level: 1,
    steps: [
      '面饼下沸水煮3分钟，捞出沥干，别煮到发软',
      '另起平底锅，放少许油煎一个溏心蛋备用',
      '面中加一勺老干妈、半勺生抽和几滴芝麻油拌匀',
      '装碗后放上煎蛋，撒一把葱花就可以开吃'
    ],
    tip: '面煮好过一下凉水，拌起来更弹。'
  },
  {
    id: 'b6-egg-fried-bun-slices', name: '蛋煎馒头片', emoji: '🍞',
    need: ['bun', 'egg'], extra: ['sesame'], time: 10, level: 1,
    steps: [
      '馒头切成1.5厘米厚片，两个鸡蛋加少许盐打散',
      '馒头片两面快速蘸一层蛋液，别泡太久会散',
      '平底锅刷油，中小火煎2分钟至底面金黄',
      '翻面再煎1分半至两面金黄，撒白芝麻出锅'
    ],
    tip: '用隔夜馒头，煎出来才外脆内松。'
  },
  {
    id: 'b6-cumin-fried-bun-cubes', name: '孜然炒馒头丁', emoji: '🍞',
    need: ['bun', 'egg', 'greenpepper'], extra: ['cumin', 'scallion'], time: 15, level: 1,
    steps: [
      '馒头切1厘米小丁，鸡蛋打散后把馒头丁拌匀裹一层',
      '青椒半个切小丁，锅中多放点油烧到五成热',
      '下馒头丁中火煎到四面金黄，盛出控油',
      '锅留底油炒青椒，倒回馒头丁，撒孜然和盐翻匀'
    ],
    tip: '裹蛋液再煎，馒头丁不吸油也不掉渣。'
  },
  {
    id: 'b6-bun-mini-pizza', name: '馒头小披萨', emoji: '🍕',
    need: ['bun', 'sausage'], extra: ['cheese', 'ketchup'], time: 15, level: 1,
    steps: [
      '馒头横切成1厘米厚的圆片，火腿肠一根切薄片',
      '馒头片抹一层番茄酱，铺上火腿肠片',
      '盖一片芝士，放入烤箱200度烤8分钟',
      '芝士融化微焦即可取出，撒黑胡椒趁热吃'
    ],
    tip: '没有烤箱就用平底锅盖盖小火焖5分钟。'
  },
  {
    id: 'b6-toast-pizza', name: '吐司披萨', emoji: '🍕',
    need: ['bread', 'corn', 'bacon'], extra: ['cheese', 'ketchup'], time: 15, level: 1,
    steps: [
      '吐司两片抹薄薄一层番茄酱，边缘留一点空',
      '铺上玉米粒和培根碎，再盖满一层芝士碎',
      '烤箱190度烤8分钟，芝士化开、边缘微焦即可',
      '出炉撒一点黑胡椒，对角切成三角形趁热吃'
    ],
    tip: '芝士铺到边缘，烤完才有拉丝效果。'
  },
  {
    id: 'b6-french-toast', name: '法式吐司', emoji: '🍞',
    need: ['bread', 'egg'], extra: ['honey'], time: 15, level: 1,
    steps: [
      '鸡蛋两个加两勺糖和一小撮盐，打散成蛋液',
      '吐司切厚片，两面蘸满蛋液，静置1分钟吸透',
      '平底锅放少许油，小火煎2分钟至金黄再翻面',
      '两面都上色后出锅，淋上蜂蜜趁热吃'
    ],
    tip: '用厚吐司、小火慢煎，中心才不会湿。'
  },
  {
    id: 'b6-ham-cheese-sandwich', name: '火腿芝士三明治', emoji: '🍞',
    need: ['bread', 'ham'], extra: ['cheese', 'blackpepper'], time: 10, level: 1,
    steps: [
      '吐司两片，一片铺火腿片，另一片放芝士片',
      '平底锅不放油，小火把两片各烘1分钟至微脆',
      '合起来压紧，用锅铲轻压再煎30秒让芝士粘合',
      '对角切成两个三角形，撒黑胡椒装盘'
    ],
    tip: '火腿先煎一下，香味比直接夹强得多。'
  },
  {
    id: 'b6-zucchini-egg-steamed-dumpling', name: '西葫芦鸡蛋蒸饺', emoji: '🥟',
    need: ['dumplingwrapper', 'zucchini', 'egg'], extra: ['sesamoil'], time: 40, level: 2,
    steps: [
      '西葫芦一根擦丝，加一勺盐腌10分钟，用手挤干水分',
      '鸡蛋3个炒成碎粒晾凉，与西葫芦、芝麻油拌成馅',
      '饺子皮包入馅料，边缘蘸水捏紧成月牙形',
      '蒸屉刷油摆入饺子，水开后大火蒸8分钟'
    ],
    tip: '西葫芦水一定挤干，否则馅会出汤破皮。'
  },
  {
    id: 'b6-corn-pork-potsticker', name: '玉米猪肉锅贴', emoji: '🥟',
    need: ['dumplingwrapper', 'corn', 'mincedpork'], extra: ['ginger', 'scallion'], time: 35, level: 2,
    steps: [
      '肉末200克加姜末、生抽和盐，顺一个方向搅到上劲',
      '拌入玉米粒和葱花，冷藏10分钟更好包',
      '饺子皮放馅，只捏中间，两头留口成锅贴',
      '平底锅刷油摆入，倒面粉水到三分之一高，盖盖中火煎8分钟'
    ],
    tip: '一勺面粉兑半碗水，底壳才薄脆不软。'
  },
  {
    id: 'b6-pork-wonton-soup', name: '鲜肉小馄饨', emoji: '🥟',
    need: ['wontonwrapper', 'mincedpork'], extra: ['scallion', 'ginger', 'sesamoil'], time: 25, level: 2,
    steps: [
      '肉末150克加姜末、盐、生抽和两勺水，搅到发黏',
      '馄饨皮放一小团馅，对折后把两角捏在一起',
      '水开下馄饨，用勺背轻推防粘，浮起后再煮1分钟',
      '碗中放生抽、芝麻油和葱花，冲入煮馄饨的热汤'
    ],
    tip: '馅只放黄豆大一团，皮薄馅小才是小馄饨。'
  },
  {
    id: 'b6-chili-oil-wonton', name: '红油抄手', emoji: '🥟',
    need: ['wontonwrapper', 'mincedpork'], extra: ['chilioil', 'garlic', 'sesamoil'], time: 25, level: 2,
    steps: [
      '肉末150克加姜末、盐、生抽和一勺淀粉搅匀',
      '馄饨皮包成抄手，边角蘸水捏紧防煮散',
      '碗中放蒜末、辣椒油、生抽、醋和芝麻油调成红油汁',
      '水开煮抄手3分钟，捞出沥干拌入红油汁'
    ],
    tip: '红油汁里加半勺煮馄饨的汤，味道更融合。'
  },
  {
    id: 'b6-crispy-fried-wonton', name: '脆皮炸馄饨', emoji: '🥟',
    need: ['wontonwrapper', 'mincedpork'], extra: ['scallion', 'blackpepper'], time: 25, level: 2,
    steps: [
      '肉末120克加盐、生抽、黑胡椒和葱花拌成馅',
      '馄饨皮包馅后对折，边缘用叉子压出花纹',
      '油温五成热下锅，中小火炸3分钟至金黄浮起',
      '捞出放在厨房纸上沥油，配番茄酱蘸食'
    ],
    tip: '叉子压边能封住馅，炸时不会开口溅油。'
  },
  {
    id: 'b6-ribs-rice-cake', name: '排骨烧年糕', emoji: '🍖',
    need: ['ricecake', 'ribs'], extra: ['ginger', 'fivespice'], time: 50, level: 2,
    steps: [
      '排骨500克冷水下锅焯水，年糕切条泡在清水里防干',
      '锅中放油和两勺糖，小火炒到糖色发红，下排骨裹匀',
      '加姜片、生抽、老抽和热水没过排骨，小火炖25分钟',
      '下年糕再煮8分钟，汤汁收浓裹住年糕即可'
    ],
    tip: '年糕最后放，煮久了会化成糊。'
  },
  {
    id: 'b6-candied-rice-cake', name: '糖煎年糕', emoji: '🍡',
    need: ['ricecake'], extra: ['sesame', 'honey'], time: 15, level: 1,
    steps: [
      '年糕切半厘米薄片，用清水泡5分钟捞出沥干',
      '平底锅少油，小火把年糕两面各煎1分钟至微鼓',
      '加两勺糖和小半碗水，晃动锅让糖汁裹匀',
      '汤汁收亮时撒白芝麻，淋一点蜂蜜出锅'
    ],
    tip: '年糕先泡水再煎，外脆里软不粘牙。'
  },
  {
    id: 'b6-pancake-potato-wrap', name: '手抓饼卷土豆丝', emoji: '🌯',
    need: ['frozenpancake', 'potato', 'egg'], extra: ['scallion', 'chilioil'], time: 20, level: 1,
    steps: [
      '土豆一个切细丝，泡水冲掉表面淀粉后沥干',
      '热锅下油炒土豆丝，加醋和盐大火炒2分钟保持脆',
      '手抓饼不放油下平底锅，小火两面各煎2分钟至起层',
      '饼上摊一个煎蛋，铺土豆丝卷起，对半切开'
    ],
    tip: '土豆丝冲两遍水，炒出来才爽脆不粘。'
  },
  {
    id: 'b6-pancake-cheese-wrap', name: '手抓饼芝士卷', emoji: '🌯',
    need: ['frozenpancake', 'ham'], extra: ['cheese', 'ketchup'], time: 15, level: 1,
    steps: [
      '手抓饼从冷冻取出回温2分钟，火腿一根切条',
      '平底锅小火煎饼1分钟，翻面后铺上火腿条',
      '盖一片芝士，加盖焖1分钟至芝士融化',
      '用铲子把饼卷起，表面刷番茄酱，切段趁热吃'
    ],
    tip: '饼别煎太久，微软时才好卷不裂。'
  },
  {
    id: 'b6-pancake-mini-pizza', name: '手抓饼小披萨', emoji: '🍕',
    need: ['frozenpancake', 'corn'], extra: ['cheese', 'ketchup', 'blackpepper'], time: 20, level: 1,
    steps: [
      '手抓饼不用解冻，直接放入平底锅小火烙2分钟',
      '翻面后抹一层番茄酱，均匀撒上玉米粒',
      '盖满芝士碎，加盖用最小火焖4分钟',
      '芝士化开、饼底酥脆时出锅，切块撒黑胡椒'
    ],
    tip: '全程最小火，饼底才不会焦而芝士没化。'
  },
  {
    id: 'b6-hakka-stuffed-tofu', name: '客家酿豆腐', emoji: '🥘',
    need: ['firmtofu', 'mincedpork'], extra: ['scallion', 'oyster'], time: 35, level: 2,
    steps: [
      '老豆腐切5厘米见方的块，用小勺在中间挖出浅坑',
      '肉末150克加葱花、生抽和淀粉搅上劲，酿进豆腐坑里',
      '平底锅少油，肉面朝下煎2分钟定型，再翻面煎黄',
      '加生抽、蚝油和半碗水，小火焖8分钟收汁'
    ],
    tip: '挖坑别挖穿，煎的时候馅才不会掉。'
  },
  {
    id: 'b6-chive-dried-tofu', name: '韭菜炒豆干', emoji: '🥘',
    need: ['driedtofu', 'chive'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '豆干4块切细条，韭菜一小把切段，蒜切片',
      '热锅少油，下豆干条中火煸2分钟至边缘微焦',
      '加蒜片炒香，沿锅边淋一点生抽翻匀',
      '下韭菜大火炒30秒，加盐立刻出锅'
    ],
    tip: '韭菜最后下、炒半分钟就够，久了发黄出水。'
  },
  {
    id: 'b6-pork-tofu-skin-roll', name: '肉末豆腐皮卷', emoji: '🌯',
    need: ['tofuskin', 'mincedpork', 'carrot'], extra: ['oyster', 'starch'], time: 30, level: 2,
    steps: [
      '肉末150克加胡萝卜碎、生抽、蚝油和淀粉拌匀',
      '豆腐皮温水泡软，剪成15厘米见方，铺薄薄一层肉馅',
      '卷紧后收口朝下摆盘，水开上锅蒸12分钟',
      '蒸出的汤汁倒回锅中勾薄芡，淋在豆腐皮卷上'
    ],
    tip: '肉馅铺薄一点，卷起来才紧实不散。'
  },
  {
    id: 'b6-cold-tofu-skin', name: '凉拌豆腐皮', emoji: '🥗',
    need: ['tofuskin', 'cucumber', 'cilantro'], extra: ['garlic', 'chilioil', 'sesamoil'], time: 15, level: 1,
    steps: [
      '豆腐皮用温水泡10分钟至软，捞出切成细丝',
      '豆腐皮下沸水焯1分钟去豆腥，捞出过凉水沥干',
      '黄瓜半根切丝，香菜切段，大蒜切末',
      '蒜末、生抽、醋、辣椒油和芝麻油调汁，全部拌匀腌5分钟'
    ],
    tip: '焯完过凉水，豆腐皮才筋道不粘连。'
  },
  {
    id: 'b6-tofu-skin-bokchoy', name: '豆腐皮炒小青菜', emoji: '🥘',
    need: ['tofuskin', 'bokchoy'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '豆腐皮泡软切宽条，小青菜洗净对半切开',
      '锅中水烧开，豆腐皮焯30秒去豆腥，捞出沥干',
      '热锅下油爆香蒜末，先下青菜梗大火炒1分钟',
      '加豆腐皮和菜叶炒1分钟，加盐出锅'
    ],
    tip: '梗和叶分开下锅，熟度才一致。'
  },
  {
    id: 'b6-fuzhu-braised-chicken', name: '腐竹焖鸡', emoji: '🍗',
    need: ['fuzhu', 'chickenleg'], extra: ['ginger', 'oyster'], time: 45, level: 2,
    steps: [
      '腐竹3根掰段，用冷水泡1小时至中心无硬芯',
      '鸡腿两只剁块焯水，锅中少油炒香姜片',
      '下鸡块煎至微黄，加生抽、蚝油和热水没过，小火焖15分钟',
      '下腐竹再焖10分钟，汤汁收浓即可'
    ],
    tip: '腐竹后放，焖太久会烂成渣。'
  },
  {
    id: 'b6-konjac-braised-duck', name: '魔芋烧鸭', emoji: '🍗',
    need: ['konjac', 'duck'], extra: ['douban', 'ginger'], time: 60, level: 3,
    steps: [
      '魔芋切块，下沸水焯2分钟去涩味，捞出沥干',
      '鸭腿两只剁块冷水下锅焯水，撇净浮沫',
      '锅中炒香姜片和豆瓣酱，下鸭块煸出油，加料酒和生抽',
      '加热水没过鸭肉，小火炖25分钟，下魔芋再烧15分钟收汁'
    ],
    tip: '魔芋先焯水，涩味去了才吸得住汤汁。'
  },
  {
    id: 'b6-cold-konjac-shreds', name: '凉拌魔芋丝', emoji: '🥗',
    need: ['konjac', 'cucumber', 'carrot'], extra: ['garlic', 'chilioil'], time: 15, level: 1,
    steps: [
      '魔芋丝一盒下沸水焯2分钟，捞出过凉水沥干',
      '黄瓜半根、胡萝卜半根切细丝，加盐腌5分钟挤干',
      '蒜末、生抽、醋和辣椒油调成料汁',
      '全部拌匀后冷藏10分钟，吃起来更爽口'
    ],
    tip: '魔芋丝焯水后一定要沥干，拌了才不澥。'
  },
  {
    id: 'b6-konjac-pork-stirfry', name: '魔芋炒肉丝', emoji: '🥘',
    need: ['konjac', 'porkloin', 'greenpepper'], extra: ['garlic', 'oyster'], time: 20, level: 1,
    steps: [
      '魔芋切条焯水2分钟，里脊100克切丝用生抽淀粉腌5分钟',
      '热锅滑油，下肉丝炒散至变色后盛出',
      '锅留底油炒香蒜末和青椒丝，下魔芋翻炒2分钟',
      '倒回肉丝，加蚝油和盐，大火翻炒30秒即可'
    ],
    tip: '魔芋本身没味，靠蚝油和肉汁提鲜。'
  },
  {
    id: 'b6-shiitake-glutinous-chicken', name: '香菇糯米鸡', emoji: '🍗',
    need: ['glutinousrice', 'chickenleg', 'shiitake'], extra: ['oyster', 'scallion', 'ginger'], time: 60, level: 2,
    steps: [
      '糯米200克泡2小时，上锅蒸20分钟至半熟',
      '鸡腿一只切块，用生抽、蚝油和姜末腌15分钟',
      '香菇4朵泡发切丁，与鸡肉、糯米拌匀，加老抽上色',
      '装碗压平，水开后中火蒸30分钟，倒扣撒葱花'
    ],
    tip: '糯米只蒸半熟，第二次蒸才会吸足鸡汁。'
  }
,

  /* ── 第四轮扩充：社媒（下厨房）热门榜菜式 58 道 ── */
  {
    id: 'b7-gyudon', name: '日式肥牛饭', emoji: '🍚',
    need: ['beefroll', 'onion', 'egg'], extra: ['wine', 'honey'], time: 20, level: 1,
    steps: [
      '洋葱半个切细丝，冷水下锅煮3分钟到半透明，甜味才出得来。',
      '加生抽2勺、料酒1勺、蜂蜜半勺和清水100毫升，小火煮开。',
      '肥牛卷抖散下锅，一变色马上转小火，煮久了发柴。',
      '蛋液打散绕圈淋在表面，加盖焖40秒，半凝固就关火。',
      '连汁浇在热米饭上，汁要略咸一点，拌开才够味。'
    ],
    tip: '肥牛最后下，蛋液焖40秒就关火，嫩得刚好。',
    src: '下厨房'
  },
  {
    id: 'b7-japanese-curry-chicken', name: '日式咖喱鸡肉饭', emoji: '🍛',
    need: ['chickenleg', 'potato', 'onion', 'milk'], extra: ['curry'], time: 40, level: 1,
    steps: [
      '鸡腿去骨切块，用料酒和少许盐抓匀腌10分钟去腥。',
      '土豆、洋葱切滚刀块，热锅少油先炒洋葱到出甜香。',
      '下鸡块煎到表面变白，再放土豆翻炒，加水没过食材。',
      '小火煮15分钟到土豆能被筷子穿透，关火再放咖喱块化开。',
      '重新开小火，倒50毫升牛奶搅匀煮3分钟，别煮沸。'
    ],
    tip: '咖喱块一定关火后放，牛奶最后加才不糊底。',
    src: '下厨房'
  },
  {
    id: 'b7-minced-pork-egg-tofu', name: '肉末日本豆腐', emoji: '🍲',
    need: ['eggtofu', 'mincedpork'], extra: ['starch', 'oyster'], time: 20, level: 1,
    steps: [
      '日本豆腐连袋从中间切开，挤出后切成2厘米厚片。',
      '两面拍薄薄一层淀粉，热油中火煎到金黄定型再翻面。',
      '肉末用料酒抓散，另起锅炒到出油、微微焦香。',
      '加生抽1勺、蚝油1勺和半碗水，放入豆腐小火煨3分钟。',
      '淋水淀粉勾薄芡，边晃锅边收汁，别用铲子翻以免碎。'
    ],
    tip: '豆腐先拍淀粉再煎，外皮不散也不粘锅。',
    src: '下厨房'
  },
  {
    id: 'b7-tomato-sauce-egg-tofu', name: '茄汁日本豆腐', emoji: '🍅',
    need: ['eggtofu'], extra: ['ketchup', 'starch'], time: 20, level: 1,
    steps: [
      '日本豆腐切段，裹一层干淀粉，静置2分钟让粉返潮。',
      '中火煎至两面结壳金黄盛出，锅里留一点底油。',
      '番茄酱3勺加糖1勺、白醋半勺、清水4勺调成茄汁。',
      '倒入茄汁小火熬到起泡变稠，再放回豆腐轻推裹匀。',
      '收汁到能挂住豆腐就出锅，撒上葱花。'
    ],
    tip: '茄汁先熬稠再下豆腐，才不会又稀又死酸。',
    src: '下厨房'
  },
  {
    id: 'b7-japanese-roast-pumpkin', name: '日式烤南瓜', emoji: '🎃',
    need: ['pumpkin'], extra: ['cumin', 'blackpepper'], time: 30, level: 1,
    steps: [
      '南瓜带皮切1厘米厚片，去籽，用厨房纸吸干表面水。',
      '刷一层薄油，撒盐、孜然和黑胡椒，抓匀腌10分钟。',
      '平铺在烤盘上，200度烤15分钟，中途翻面一次。',
      '边缘微焦、筷子能轻松插入即可，出炉再补少许黑胡椒。'
    ],
    tip: '南瓜擦干再烤，表面干爽才会焦香不软塌。',
    src: '下厨房'
  },
  {
    id: 'b7-teriyaki-chicken', name: '照烧鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['oyster', 'honey', 'wine'], time: 25, level: 1,
    steps: [
      '鸡腿去骨，用叉子在皮面扎些小孔，撒少许盐腌10分钟。',
      '皮朝下冷锅下，中小火煎8分钟逼出鸡油，皮脆又不粘。',
      '翻面再煎3分钟，把多余的油倒掉，只留薄薄一层。',
      '照烧汁按生抽2勺、料酒1勺、蜂蜜1勺、蚝油半勺、水3勺调匀倒入。',
      '小火煮到汁冒大泡、能挂勺，反复把汁淋在鸡皮上再收干。'
    ],
    tip: '生抽、料酒、蜂蜜按2:1:1，收汁到挂勺才亮。',
    src: '下厨房'
  },
  {
    id: 'b7-japanese-minced-chicken-rice', name: '日式碎鸡饭', emoji: '🍚',
    need: ['chickenleg', 'egg', 'zhacai'], extra: ['oyster'], time: 20, level: 1,
    steps: [
      '鸡腿去骨切小丁，用料酒和少许盐抓匀，静置10分钟。',
      '榨菜切碎，清水泡5分钟去咸，挤干水分备用。',
      '热锅下鸡丁炒散至变白，加榨菜碎一起炒出香味。',
      '加生抽1勺、蚝油半勺、糖半勺和少量水，炒到汁收干。',
      '盖在热米饭上，中间放一颗温泉蛋，吃前戳破拌匀。'
    ],
    tip: '榨菜先泡水去咸，鸡肉炒到汁干才够香。',
    src: '下厨房'
  },
  {
    id: 'b7-japanese-potato-salad', name: '日式土豆泥沙拉', emoji: '🥗',
    need: ['potato', 'cucumber', 'egg'], extra: ['mayo', 'blackpepper'], time: 25, level: 1,
    steps: [
      '土豆去皮切块，冷水下锅煮15分钟，筷子能轻松插入。',
      '趁热压成泥，加少许盐和黑胡椒，温热时拌更顺滑。',
      '黄瓜切薄片撒盐腌5分钟，挤干水，免得沙拉出水。',
      '鸡蛋煮9分钟，蛋白切碎、蛋黄压碎，和黄瓜一起拌入。',
      '土豆泥放凉到不烫手再加沙拉酱3勺，才不会油水分离。'
    ],
    tip: '土豆泥放凉再加沙拉酱，黄瓜先杀水才不稀。',
    src: '下厨房'
  },
  {
    id: 'b7-soft-boiled-egg', name: '日式溏心蛋', emoji: '🥚',
    need: ['egg'], extra: ['honey'], time: 20, level: 2,
    steps: [
      '鸡蛋从冰箱取出回温10分钟，用针在钝端扎一个小孔。',
      '水烧到大滚，加1勺盐，用勺把蛋轻轻放入防裂。',
      '中火煮6分30秒，全程不盖盖，计时一到立刻捞出。',
      '马上放冰水浸5分钟，边浸边剥，蛋壳一推就掉。',
      '生抽2勺、蜂蜜1勺、水4勺调汁浸泡6小时，颜色才透亮。'
    ],
    tip: '水滚后煮6分30秒、立刻冰镇，蛋黄刚好流心。',
    src: '下厨房'
  },
  {
    id: 'b7-oden', name: '关东煮', emoji: '🍢',
    need: ['radish', 'shiitake', 'kelp'], extra: ['oyster'], time: 40, level: 1,
    steps: [
      '海带用冷水泡2小时，连泡的水一起小火煮15分钟做汤底。',
      '白萝卜切3厘米厚圆片，削去棱角，煮时不易烂。',
      '萝卜冷水下锅焯10分钟去涩，捞出放进海带汤里。',
      '加生抽2勺、蚝油1勺、糖半勺，小火炖20分钟。',
      '香菇去蒂划十字，最后10分钟放入，吸饱汤再关火泡着。'
    ],
    tip: '萝卜先焯水去涩，汤底用泡海带的水才鲜。',
    src: '下厨房'
  },
  {
    id: 'b7-tonkatsu', name: '日式炸猪排', emoji: '🍖',
    need: ['porkloin', 'breadcrumb', 'egg'], extra: ['blackpepper', 'starch'], time: 30, level: 2,
    steps: [
      '猪里脊横切1.5厘米厚，用刀背轻拍松，筋膜划几刀防卷。',
      '两面撒盐和黑胡椒，静置10分钟，再用厨房纸吸干水。',
      '依次沾淀粉、蛋液、面包糠，面包糠要压实不掉渣。',
      '油温170度下锅炸3分钟，翻面再炸2分钟至金黄。',
      '捞出立着沥油2分钟，静置后再切条，肉汁不流失。'
    ],
    tip: '拍松断筋、170度下锅，静置两分钟再切才多汁。',
    src: '下厨房'
  },
  {
    id: 'b7-yakitori', name: '烧鸟串', emoji: '🍡',
    need: ['chickenleg', 'garlicshoot'], extra: ['honey', 'oyster', 'wine'], time: 30, level: 2,
    steps: [
      '鸡腿去骨切3厘米块，皮留着，用料酒和盐腌15分钟。',
      '蒜苗切段，和鸡块交替穿签，一块肉一段，别挤太紧。',
      '生抽1勺、蚝油1勺、蜂蜜1勺、料酒1勺小火熬到略稠。',
      '烤箱200度先烤8分钟，翻面刷酱，再烤5分钟。',
      '出炉再刷一层酱，撒黑胡椒，趁热吃皮才脆。'
    ],
    tip: '酱汁熬稠再刷、分两次刷，皮才焦香不糊。',
    src: '下厨房'
  },
  {
    id: 'b7-braised-egg-tofu', name: '红烧日本豆腐', emoji: '🥘',
    need: ['eggtofu'], extra: ['oyster', 'starch'], time: 20, level: 2,
    steps: [
      '日本豆腐切段，裹干淀粉，中火煎到六面金黄盛出。',
      '锅留底油爆香蒜末，加蚝油1勺、生抽1勺炒出酱香。',
      '倒入半碗热水，加糖少许，放回豆腐小火煨4分钟。',
      '水淀粉勾芡，边晃锅边收汁，让酱汁裹住每块豆腐。',
      '撒葱花出锅，全程别用铲子翻，晃锅最稳。'
    ],
    tip: '裹淀粉煎定型、勾芡晃锅，豆腐才完整入味。',
    src: '下厨房'
  },
  {
    id: 'b7-korean-bibimbap', name: '韩式拌饭', emoji: '🍚',
    need: ['rice', 'spinach', 'carrot', 'egg'], extra: ['koreanchili', 'sesame'], time: 20, level: 1,
    steps: [
      '米饭提前煮好，盛碗后保持温热，拌的时候才好裹酱。',
      '菠菜焯水30秒，过冷水挤干，加盐和芝麻油拌匀。',
      '胡萝卜切细丝，少油快炒1分钟，撒一点盐出锅。',
      '煎一个单面蛋，蛋黄保持流动；辣酱2勺加1勺水调稀。',
      '菜码摆在饭上放蛋，加辣酱和芝麻，吃前从底往上拌。'
    ],
    tip: '辣酱加少许水调稀才好拌开，蛋黄要流心。',
    src: '下厨房'
  },
  {
    id: 'b7-pork-belly-kimchi', name: '五花肉炒辣白菜', emoji: '🥓',
    need: ['porkbelly', 'kimchi'], extra: ['koreanchili'], time: 20, level: 1,
    steps: [
      '五花肉切3毫米薄片，辣白菜切段，泡菜汁留着别倒。',
      '冷锅下五花肉，中小火煸5分钟到出油、边缘卷起。',
      '倒掉多余油，下辣白菜翻炒2分钟，炒出酸香。',
      '加辣酱1勺、糖半勺和泡菜汁2勺，翻炒到汁收。',
      '出锅前撒葱花，糖能压酸提鲜，全程别加水。'
    ],
    tip: '五花肉先煸出油，加泡菜汁和半勺糖，酸辣才对。',
    src: '下厨房'
  },
  {
    id: 'b7-korean-tofu-soup', name: '韩式嫩豆腐汤', emoji: '🍲',
    need: ['tofu', 'enoki', 'mincedpork', 'egg'], extra: ['koreanchili'], time: 25, level: 1,
    steps: [
      '嫩豆腐切大块，用淡盐水泡5分钟，煮时不易碎。',
      '锅中少油炒香肉末，加辣酱1勺和辣椒粉炒出红油。',
      '倒入400毫升水或高汤煮开，放金针菇煮2分钟。',
      '轻轻推入豆腐，小火煮3分钟，只晃锅不翻动。',
      '打入一个鸡蛋，盖盖焖1分钟，撒葱花关火。'
    ],
    tip: '豆腐用盐水泡再下锅，晃锅代替翻动不易碎。',
    src: '下厨房'
  },
  {
    id: 'b7-kimchi-beef', name: '泡菜炒肥牛', emoji: '🌶',
    need: ['kimchi', 'beefroll'], extra: ['koreanchili'], time: 15, level: 1,
    steps: [
      '肥牛卷室温回温5分钟，抖散，别整坨下锅。',
      '热锅少油，下辣白菜炒1分钟，逼出酸香味。',
      '加辣酱1勺和泡菜汁2勺，炒匀成红色底味。',
      '下肥牛大火快炒40秒，刚变色就关火，余温会焖熟。',
      '撒芝麻和葱花出锅，久炒肥牛会发老。'
    ],
    tip: '肥牛最后大火40秒，变色即关火才嫩。',
    src: '下厨房'
  },
  {
    id: 'b7-spicy-beef-soup', name: '辣牛肉汤', emoji: '🍲',
    need: ['beef', 'onion', 'beansprout'], extra: ['koreanchili', 'sesame'], time: 60, level: 2,
    steps: [
      '牛肉切薄片，冷水泡20分钟去血水，捞出挤干。',
      '牛肉加辣酱1勺、蒜末和芝麻油抓匀，腌15分钟。',
      '锅中少油炒牛肉到变色，加豆芽和洋葱丝炒软。',
      '倒600毫升热水，大火煮开转小火炖30分钟。',
      '加盐调味，撒芝麻和葱花，汤要滚烫上桌。'
    ],
    tip: '牛肉先泡血水再腌，小火炖30分钟汤才清甜。',
    src: '下厨房'
  },
  {
    id: 'b7-korean-seaweed-soup', name: '韩国海带汤', emoji: '🥣',
    need: ['kelp', 'mincedpork'], extra: ['garlic', 'sesame'], time: 25, level: 1,
    steps: [
      '干海带用冷水泡10分钟，泡开就捞，泡久会发黏。',
      '海带剪成5厘米段挤干水，肉末用料酒抓散。',
      '锅中放芝麻油，炒肉末到变色，再下海带炒3分钟。',
      '炒到海带发亮加600毫升水，大火煮开转小火20分钟。',
      '加蒜末、生抽半勺和盐，再煮2分钟关火。'
    ],
    tip: '海带用芝麻油先炒再煮，汤才浓白不腥。',
    src: '下厨房'
  },
  {
    id: 'b7-kimchi-pancake', name: '韩式泡菜饼', emoji: '🥞',
    need: ['flour', 'kimchi', 'onion', 'chive'], extra: [], time: 20, level: 2,
    steps: [
      '辣白菜切碎留2勺汁，洋葱切细丝，韭菜切段。',
      '面粉100克加120毫升水和泡菜汁，搅到无颗粒能挂勺。',
      '拌入泡菜、洋葱和韭菜，面糊别太稠，摊开才薄脆。',
      '平底锅多放油，中小火摊成薄饼，煎4分钟定型再翻面。',
      '另一面煎3分钟到焦脆，出锅切块，蘸醋辣酱吃。'
    ],
    tip: '面糊稀一点、锅里的油多一点，饼边才够脆。',
    src: '下厨房'
  },
  {
    id: 'b7-korean-fried-chicken', name: '韩式炸鸡', emoji: '🍗',
    need: ['chickenwing', 'milk'], extra: ['koreanchili', 'ketchup', 'honey'], time: 40, level: 3,
    steps: [
      '鸡翅用牙签扎孔，泡进牛奶里20分钟，肉更嫩不腥。',
      '捞出擦干，加盐、黑胡椒和料酒腌10分钟。',
      '裹一层干淀粉，静置5分钟返潮，炸时不易脱皮。',
      '160度油温炸6分钟捞出，升温到180度复炸1分钟。',
      '辣酱2勺、番茄酱1勺、蜂蜜1勺小火煮稠，倒入鸡翅裹匀。'
    ],
    tip: '牛奶泡20分钟、两次油炸，皮才脆得久。',
    src: '下厨房'
  },
  {
    id: 'b7-korean-potato-rib-soup', name: '韩式土豆排骨汤', emoji: '🍲',
    need: ['ribs', 'potato', 'kimchi'], extra: ['koreanchili'], time: 70, level: 2,
    steps: [
      '排骨冷水下锅，加料酒煮开撇净浮沫，捞出用温水冲。',
      '土豆切大块泡水，辣白菜切段，留2勺泡菜汁。',
      '排骨加辣酱1勺、姜片和1500毫升水，煮开转小火40分钟。',
      '放土豆和辣白菜，再炖20分钟到土豆边角发糊。',
      '加泡菜汁和盐调味，撒葱花，这汤泡饭最好吃。'
    ],
    tip: '排骨冷水焯净浮沫，土豆后放才不煮化。',
    src: '下厨房'
  },
  {
    id: 'b7-kimchi-tofu-soup', name: '辣白菜豆腐汤', emoji: '🍲',
    need: ['kimchi', 'tofu', 'porkbelly'], extra: ['koreanchili'], time: 25, level: 1,
    steps: [
      '五花肉切薄片，冷锅小火煸3分钟逼出油。',
      '下辣白菜炒2分钟，加辣酱1勺炒出红油。',
      '倒500毫升水煮开，小火煮8分钟让酸味融进汤里。',
      '嫩豆腐切块下锅，小火煮3分钟，别大力搅动。',
      '尝咸淡补盐，撒葱花，汤要滚着上桌。'
    ],
    tip: '五花肉煸出油再炒泡菜，汤才香不寡淡。',
    src: '下厨房'
  },
  {
    id: 'b7-tomato-cheese-baked-rice', name: '番茄芝士焗饭', emoji: '🧀',
    need: ['rice', 'tomato', 'luncheonmeat'], extra: ['cheese', 'ketchup'], time: 30, level: 1,
    steps: [
      '番茄去皮切丁，午餐肉切小粒，米饭用隔夜的更松散。',
      '热锅下午餐肉煎香，加番茄丁炒到出沙、变糊。',
      '加番茄酱2勺、糖半勺和少许盐，倒米饭炒匀。',
      '装进烤碗压平，铺满芝士片，边缘留一点不铺。',
      '200度烤12分钟到芝士起泡上色，出炉撒黑胡椒。'
    ],
    tip: '番茄炒出沙再下饭，芝士烤到起泡才拉丝。',
    src: '下厨房'
  },
  {
    id: 'b7-cream-mushroom-soup', name: '奶油蘑菇汤', emoji: '🍄',
    need: ['buttonmushroom', 'milk', 'bacon'], extra: ['blackpepper', 'starch'], time: 25, level: 2,
    steps: [
      '口蘑切片，培根切小片，牛奶200毫升备好。',
      '锅中不放油先煎培根到出油微焦，盛出留油。',
      '下口蘑中火炒5分钟，炒到出水再收干，香味才浓。',
      '撒淀粉1勺炒匀，倒牛奶小火边煮边搅，避免结块。',
      '煮到略稠加盐和黑胡椒，撒培根，别大滚以免起皮。'
    ],
    tip: '蘑菇炒到出水再收干，汤才浓香不寡水。',
    src: '下厨房'
  },
  {
    id: 'b7-tomato-soup', name: '番茄浓汤', emoji: '🍅',
    need: ['tomato', 'onion'], extra: ['ketchup', 'blackpepper'], time: 30, level: 1,
    steps: [
      '番茄顶部划十字，开水烫30秒去皮，切小块。',
      '洋葱切丝，少油小火炒8分钟到变软发甜。',
      '下番茄块中火炒10分钟，炒到完全出沙、没有整块。',
      '加番茄酱1勺、糖半勺和300毫升水，小火煮10分钟。',
      '用勺背压碎，加盐和黑胡椒，想细腻可再打一遍。'
    ],
    tip: '洋葱炒足8分钟出甜味，番茄炒出沙汤才浓。',
    src: '下厨房'
  },
  {
    id: 'b7-seared-scallop', name: '柠檬香煎扇贝', emoji: '🐚',
    need: ['scallop', 'lemon'], extra: ['blackpepper', 'starch'], time: 15, level: 2,
    steps: [
      '扇贝肉解冻后挤干水，撕掉侧边硬筋，口感才嫩。',
      '两面撒盐和黑胡椒，薄薄拍一层淀粉锁住汁水。',
      '锅烧到微微冒烟再放油，扇贝下锅后2分钟别动它。',
      '底部焦黄后翻面，再煎1分钟，中间半透明就关火。',
      '挤上柠檬汁，静置1分钟再吃，汁水更稳。'
    ],
    tip: '锅要够热、下锅别翻动，两面各一分半最嫩。',
    src: '下厨房'
  },
  {
    id: 'b7-seared-basa', name: '柠檬香煎龙利鱼', emoji: '🐟',
    need: ['basa', 'lemon'], extra: ['blackpepper', 'starch'], time: 20, level: 2,
    steps: [
      '龙利鱼解冻后彻底擦干，切大块，太薄容易煎老。',
      '撒盐、黑胡椒，挤半个柠檬汁腌10分钟去腥。',
      '两面拍薄淀粉，抖掉多余的粉，煎时才不糊。',
      '中火下锅煎3分钟，边缘变白再翻面，煎2分钟。',
      '出锅再挤柠檬汁、撒黑胡椒，趁热吃最嫩。'
    ],
    tip: '鱼身擦干再拍粉，中火煎，翻面只翻一次。',
    src: '下厨房'
  },
  {
    id: 'b7-roast-beef-veg', name: '烤时蔬牛肉粒', emoji: '🥦',
    need: ['beef', 'broccoli', 'cherrytomato'], extra: ['blackpepper', 'cumin'], time: 30, level: 2,
    steps: [
      '牛肉切2厘米方块，加盐、黑胡椒、孜然和油腌20分钟。',
      '西兰花掰小朵焯水30秒，圣女果对半切，都擦干水。',
      '烤盘铺纸，蔬菜拌少许油和盐，牛肉铺开不要重叠。',
      '220度先烤牛肉8分钟，再放蔬菜同烤10分钟。',
      '出炉静置3分钟再吃，肉汁不会流失。'
    ],
    tip: '牛肉大火快烤、出炉静置，才不会又干又柴。',
    src: '下厨房'
  },
  {
    id: 'b7-cheese-baked-pasta', name: '芝士焗意面', emoji: '🍝',
    need: ['pasta', 'bacon', 'milk'], extra: ['blackpepper', 'cheese'], time: 30, level: 2,
    steps: [
      '意面煮到比包装时间少1分钟，留半碗煮面水。',
      '培根切条煎出油，倒牛奶150毫升小火加热。',
      '加芝士片2片搅到化开，用煮面水调成能挂面的稠度。',
      '倒入意面拌匀加黑胡椒，装烤碗再铺一层芝士。',
      '200度烤10分钟到表面金黄起泡。'
    ],
    tip: '煮面水调酱最挂面，芝士烤到起泡才香。',
    src: '下厨房'
  },
  {
    id: 'b8-roumo-tofu', name: '肉末豆腐', emoji: '🍮',
    need: ['tofu', 'mincedpork'], extra: ['douban', 'scallion'], time: 20, level: 1,
    steps: [
      '嫩豆腐切2厘米方块，冷水加半勺盐浸5分钟，捞出沥干，去豆腥且不易碎。',
      '热锅放两勺油，下150克肉末中火煸3分钟，炒到发白吐油、颗粒分明。',
      '加一勺豆瓣酱、葱白末，小火炒出红油，倒半碗热水烧开，轻轻推入豆腐。',
      '转中小火烧5分钟，淋水淀粉勾薄芡，晃锅让汤汁裹住豆腐，撒葱花出锅。'
    ],
    tip: '豆瓣酱要小火炒香，豆腐下锅后别用铲子翻，晃锅更完整。',
    src: '下厨房'
  },
  {
    id: 'b8-sweet-sour-fried-egg', name: '糖醋荷包蛋', emoji: '🍳',
    need: ['egg'], extra: ['ketchup'], time: 15, level: 1,
    steps: [
      '碗里放3勺番茄酱、2勺糖、2勺醋、1勺生抽、半碗水，加半勺淀粉搅匀。',
      '平底锅多放油，鸡蛋逐个磕入，中火煎到边缘焦黄起泡，盛出备用。',
      '锅留底油，倒入调好的糖醋汁，小火熬到冒大泡、勺子挂得住。',
      '放回荷包蛋，翻面让两面裹汁，收到汤汁浓稠，撒葱花出锅。'
    ],
    tip: '糖醋汁熬到起大泡再下蛋，才挂得住不流汤。',
    src: '下厨房'
  },
  {
    id: 'b8-sweet-sour-eggplant', name: '糖醋茄子', emoji: '🍆',
    need: ['eggplant'], extra: ['ketchup', 'starch'], time: 25, level: 2,
    steps: [
      '长茄子两根切滚刀块，撒少许盐抓匀腌10分钟，用手挤干水分。',
      '茄块拍一层干淀粉，六成热油下锅中火炸3分钟至金黄，捞出控油。',
      '碗中放3勺番茄酱、2勺糖、1勺醋、1勺生抽、半碗水调匀。',
      '锅留少许油，倒汁小火熬稠起泡，下茄块快速翻匀裹汁即可。'
    ],
    tip: '茄子先腌出水再拍粉，炸完不吸油，外壳更脆。',
    src: '下厨房'
  },
  {
    id: 'b8-radish-egg-soup', name: '白萝卜丝煎蛋汤', emoji: '🥚',
    need: ['radish', 'egg'], extra: ['scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '白萝卜半根去皮切细丝，鸡蛋3个加少许盐打散。',
      '锅烧热放2勺油，倒蛋液摊成厚蛋饼，两面煎到金黄焦香，铲成大块。',
      '直接冲入1升开水，大火滚5分钟，汤色变奶白。',
      '下萝卜丝再煮6分钟至软透，加盐和白胡椒粉调味，撒葱花。'
    ],
    tip: '一定冲开水并大火滚，汤才白，冷水下锅会腥。',
    src: '下厨房'
  },
  {
    id: 'b8-leijiao-pidan', name: '擂椒皮蛋', emoji: '🌶',
    need: ['greenpepper', 'centuryegg'], extra: ['garlic', 'chilioil'], time: 15, level: 1,
    steps: [
      '青椒4个擦干水分，直接放干锅中火烙，边烙边压，烙到起焦斑变软。',
      '烙好的青椒撕去焦皮，加2个皮蛋，用擀面杖捣成粗泥。',
      '加蒜末2瓣、2勺辣椒油、1勺生抽、少许盐和醋拌匀。',
      '装盘静置5分钟入味，配热米饭吃最香。'
    ],
    tip: '青椒干锅烙到起虎皮才香，捣粗一点留口感。',
    src: '下厨房'
  },
  {
    id: 'b8-salt-scallion-porkloin', name: '盐葱猪里脊', emoji: '🥩',
    need: ['porkloin'], extra: ['sesame', 'starch', 'scallion'], time: 20, level: 2,
    steps: [
      '里脊300克切3毫米厚片，加半勺盐、1勺淀粉、1勺水抓黏，腌10分钟。',
      '小葱一把切碎，加半勺盐、1勺白芝麻，淋两勺热油激香成葱盐。',
      '平底锅烧热抹薄油，肉片摊平中火煎2分钟，翻面再煎1分钟至微焦。',
      '盛出铺上葱盐，静置1分钟让余温把葱香逼出来。'
    ],
    tip: '肉片别叠着煎，摊平才有焦边；葱盐最后铺，不回锅。',
    src: '下厨房'
  },
  {
    id: 'b8-chickenwing-shrimp-pot', name: '鸡翅虾煲', emoji: '🍲',
    need: ['chickenwing', 'shrimp', 'potato'], extra: ['soybeanpaste', 'oyster'], time: 35, level: 2,
    steps: [
      '鸡翅8个两面划刀焯水，虾10只开背去虾线，土豆1个切厚片。',
      '锅放油，鸡翅中火煎到两面金黄出油，下姜蒜、1勺黄豆酱炒香。',
      '加土豆片、1勺蚝油、1勺生抽，倒热水没过，盖盖小火焖12分钟。',
      '放虾再焖3分钟，开大火收汁到浓稠挂勺，撒葱段。'
    ],
    tip: '虾最后放，久煮发柴；收汁要晃锅防土豆粘底。',
    src: '下厨房'
  },
  {
    id: 'b8-ricecooker-soy-chicken', name: '电饭煲豉油鸡', emoji: '🍗',
    need: ['chickenleg'], extra: ['ginger', 'oyster', 'scallion'], time: 50, level: 1,
    steps: [
      '鸡腿4个用牙签扎孔，加2勺生抽、1勺老抽、1勺蚝油、1勺糖抹匀腌20分钟。',
      '电饭煲底铺葱段和姜片，放鸡腿，倒入腌料再加半碗水。',
      '按煮饭键，跳闸后翻面再按一次，前后约30分钟。',
      '取出稍凉剁块，淋上煲里的豉油汁。'
    ],
    tip: '锅底铺葱姜防粘，按两次煮饭键肉才脱骨入味。',
    src: '下厨房'
  },
  {
    id: 'b8-mushroom-stuffed-shrimp', name: '口蘑酿虾滑', emoji: '🍄',
    need: ['buttonmushroom', 'shrimppaste'], extra: ['oyster', 'starch'], time: 25, level: 1,
    steps: [
      '口蘑12个去蒂洗净，蒂切碎拌进150克虾滑，加少许盐、半勺淀粉搅上劲。',
      '蘑菇伞面朝下摆盘，内侧拍薄淀粉，把虾滑挤成小团填满。',
      '水开上锅，中火蒸8分钟，取出倒掉盘中蒸出的水。',
      '锅中放1勺蚝油、2勺水、少许淀粉煮稠，淋在蘑菇上，撒葱花。'
    ],
    tip: '蘑菇内侧拍淀粉，虾滑才不脱落，蒸8分钟足够。',
    src: '下厨房'
  },
  {
    id: 'b8-honey-charsiu', name: '蜜汁叉烧肉', emoji: '🍖',
    need: ['porkbelly'], extra: ['charsiu', 'honey', 'sesame'], time: 90, level: 2,
    steps: [
      '五花肉500克切3厘米宽长条，用叉子在表面扎些小孔。',
      '加3勺叉烧酱、1勺生抽、1勺蜂蜜、1勺料酒抓匀，冷藏腌一夜。',
      '烤箱200度预热，肉条放烤架上烤20分钟，取出翻面刷腌料。',
      '再烤15分钟，刷一层蜂蜜转220度烤5分钟上色，出炉撒芝麻。'
    ],
    tip: '腌够一夜才进味，最后高温刷蜜才有亮壳。',
    src: '下厨房'
  },
  {
    id: 'b8-cold-onion-salad', name: '凉拌洋葱丝', emoji: '🧅',
    need: ['onion', 'cilantro'], extra: ['sesame', 'chilioil'], time: 15, level: 1,
    steps: [
      '洋葱半个切细丝，放冰水里泡10分钟，捞出沥干，去辛辣更脆。',
      '香菜一小把切段，和洋葱丝、1勺白芝麻一起放盆中。',
      '碗中放2勺辣椒油、1勺生抽、1勺醋、半勺糖、少许盐搅匀。',
      '把料汁浇在洋葱上拌匀，静置5分钟入味即可。'
    ],
    tip: '洋葱冰水泡过不呛口，拌好放5分钟更入味。',
    src: '下厨房'
  },
  {
    id: 'b8-roumo-potato', name: '肉末土豆', emoji: '🥔',
    need: ['potato', 'mincedpork'], extra: ['douban', 'garlic'], time: 25, level: 1,
    steps: [
      '土豆2个切小丁，清水冲去表面淀粉后沥干；肉末150克备好。',
      '锅放3勺油，土豆丁中火煎5分钟至边缘金黄，盛出。',
      '底油下肉末煸到吐油发干，加蒜末、1勺豆瓣酱小火炒出红油。',
      '倒回土豆，加半碗水、1勺生抽，中火烧5分钟收汁，撒葱花。'
    ],
    tip: '土豆先煎定型再烧，不糊不碎，汤汁拌饭最香。',
    src: '下厨房'
  },
  {
    id: 'b8-farmer-bowl', name: '农家一碗香', emoji: '🥘',
    need: ['porkbelly', 'egg', 'greenpepper'], extra: ['douchi', 'douban'], time: 20, level: 2,
    steps: [
      '五花肉150克切薄片，青椒3个切圈，鸡蛋2个煎成荷包蛋再切块。',
      '干锅下五花肉，中小火煸4分钟至边缘卷起吐油，多余油舀出。',
      '下豆豉1勺、豆瓣酱半勺炒香，倒青椒大火炒1分钟。',
      '放回肉片和蛋块，加半勺生抽，大火翻匀炒30秒出锅。'
    ],
    tip: '五花肉煸到卷边吐油才香，舀出的油可炒青菜。',
    src: '下厨房'
  },
  {
    id: 'b8-chickenfeet-pot', name: '鸡爪煲', emoji: '🍗',
    need: ['chickenfeet', 'potato', 'onion'], extra: ['douban', 'soybeanpaste'], time: 55, level: 2,
    steps: [
      '鸡爪500克剪去指甲，冷水下锅加料酒焯3分钟，捞出冲净。',
      '土豆1个切块，洋葱半个切丝；锅放油炒香洋葱和姜蒜。',
      '加1勺豆瓣酱、1勺黄豆酱炒出红油，下鸡爪翻匀，倒热水没过。',
      '小火炖30分钟，放土豆再炖10分钟，开大火收汁至浓稠。'
    ],
    tip: '鸡爪先焯去腥，炖足30分钟才软糯挂汁。',
    src: '下厨房'
  },
  {
    id: 'b8-scallion-pork-chop', name: '葱烧大排', emoji: '🍖',
    need: ['porkloin'], extra: ['oyster', 'starch', 'scallion'], time: 30, level: 2,
    steps: [
      '大排2块用刀背拍松，边缘筋膜切几刀，加料酒、少许盐腌10分钟。',
      '两面拍薄淀粉，锅中多放油，中火煎2分钟至两面金黄盛出。',
      '锅留油下大量葱段，小火煎到葱软出香，加1勺生抽、1勺蚝油、半碗水。',
      '放回大排，小火焖8分钟，中途翻面，最后收汁至浓亮。'
    ],
    tip: '大排拍松断筋才不卷边，葱要多、煎软才甜。',
    src: '下厨房'
  },
  {
    id: 'b8-roumo-greenbean', name: '肉末豆角', emoji: '🥘',
    need: ['greenbean', 'mincedpork'], extra: ['driedchili', 'garlic'], time: 25, level: 2,
    steps: [
      '豆角300克掐头去尾切小段，洗净后彻底沥干水。',
      '锅放4勺油，豆角中火煸6分钟至表皮起皱发软，盛出。',
      '底油下肉末150克煸到吐油，加蒜末、2个干辣椒段炒香。',
      '倒回豆角，加1勺生抽、半勺盐，大火炒2分钟入味。'
    ],
    tip: '豆角一定煸到起皱再回锅，水汽重了不香。',
    src: '下厨房'
  },
  {
    id: 'b8-jiangxi-beef-brisket', name: '江西辣牛腩', emoji: '🍲',
    need: ['beef'], extra: ['driedchili', 'beer', 'fivespice'], time: 120, level: 3,
    steps: [
      '牛腩600克切块，冷水下锅加料酒焯5分钟，撇净浮沫捞出冲洗。',
      '锅放油，下姜片、一把干辣椒、1个八角小火炒香，倒牛腩煸炒3分钟。',
      '加1勺老抽、1勺生抽、半勺五香粉翻匀，倒一罐啤酒和热水没过。',
      '小火炖90分钟至筷子能插入，开大火收汁到浓稠油亮。'
    ],
    tip: '啤酒代水去腥增香，收汁收到挂勺才够味。',
    src: '下厨房'
  },
  {
    id: 'b8-squid-garlicsprout', name: '鱿鱼炒蒜薹', emoji: '🦑',
    need: ['squid', 'garlicsprout'], extra: ['cumin', 'chilioil'], time: 20, level: 2,
    steps: [
      '鱿鱼300克切圈或打花刀，水开加料酒焯15秒立刻捞出。',
      '蒜薹300克切段，锅放油大火炒1分钟至表皮起皱，盛出。',
      '底油下姜蒜、半勺孜然粒炒香，倒鱿鱼大火爆炒30秒。',
      '放回蒜薹，加1勺生抽、半勺辣椒油、少许盐，翻匀出锅。'
    ],
    tip: '鱿鱼焯15秒就够，久炒变橡皮；全程大火快炒。',
    src: '下厨房'
  },
  {
    id: 'b8-cabbage-vermicelli', name: '包菜粉丝', emoji: '🍃',
    need: ['cabbage', 'vermicelli', 'egg'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '粉丝一把温水泡软剪短，包菜半个手撕成片洗净沥干。',
      '鸡蛋2个炒散盛出；锅放3勺油，下蒜末炒香。',
      '倒包菜大火炒2分钟至边缘变软透明，加1勺生抽、半勺盐。',
      '下粉丝和蛋块，用筷子抖散翻匀，炒1分钟收干汤汁。'
    ],
    tip: '包菜手撕不切，大火快炒才脆甜不出水。',
    src: '下厨房'
  },
  {
    id: 'b8-shrimppaste-steamed-egg', name: '虾滑蒸蛋', emoji: '🥚',
    need: ['egg', 'shrimppaste'], extra: ['scallion', 'sesamoil'], time: 25, level: 2,
    steps: [
      '鸡蛋3个打散，加1.5倍温水约300毫升和少许盐搅匀，滤去浮沫。',
      '蛋液倒入碗中，盖保鲜膜扎几个孔，水开转中小火蒸8分钟。',
      '虾滑150克挤成小丸子，轻轻放在半凝固的蛋面上，再蒸5分钟。',
      '出锅淋1勺生抽、半勺芝麻油，撒葱花。'
    ],
    tip: '蛋液过筛加温水、中小火蒸，表面才像镜面。',
    src: '下厨房'
  },
  {
    id: 'b8-secret-mixed-salad', name: '秘制大拌菜', emoji: '🥗',
    need: ['cucumber', 'tofuskin', 'vermicelli', 'peanut'], extra: ['sesame'], time: 15, level: 1,
    steps: [
      '黄瓜1根拍裂切段，豆腐皮1张切丝焯水30秒，粉丝一把泡软。',
      '三样放盆中，加香菜段和一小把炸花生米。',
      '碗中放2勺生抽、2勺醋、1勺糖、半勺盐、1勺芝麻、1勺芝麻油调匀。',
      '料汁倒入盆中抓拌均匀，静置5分钟入味。'
    ],
    tip: '豆腐皮焯水去豆腥，拌好放5分钟更进味。',
    src: '下厨房'
  },
  {
    id: 'b8-candied-sweetpotato', name: '拔丝地瓜', emoji: '🍠',
    need: ['sweetpotato'], extra: ['sesame'], time: 25, level: 3,
    steps: [
      '红薯2个去皮切滚刀块，清水冲一遍，用厨房纸擦干表面。',
      '油温五成热下红薯，中火炸5分钟至外皮微硬金黄，捞出控油。',
      '锅留少许油，下80克白糖小火不停搅，熬到糖化起小泡、颜色微黄。',
      '立刻倒红薯快速翻匀裹糖，撒芝麻，装进抹过油的盘子。'
    ],
    tip: '糖熬到浅黄起小泡就下料，熬过头会发苦。',
    src: '下厨房'
  },
  {
    id: 'b8-pan-fried-shrimp', name: '香煎大虾', emoji: '🦐',
    need: ['shrimp', 'lemon'], extra: ['blackpepper'], time: 15, level: 1,
    steps: [
      '大虾8只剪须开背去虾线，用厨房纸吸干，加半勺盐、少许黑胡椒腌5分钟。',
      '平底锅烧热放2勺油，虾平铺下锅中火煎1分半钟。',
      '翻面再煎1分钟至虾身卷曲变红，挤入半个柠檬的汁。',
      '出锅再撒少许黑胡椒，配柠檬片装盘。'
    ],
    tip: '虾一定擦干再下锅，锅够热才不粘不腥。',
    src: '下厨房'
  },
  {
    id: 'b8-tomato-beef-soup', name: '番茄牛肉汤', emoji: '🍅',
    need: ['beef', 'tomato'], extra: ['ginger', 'starch'], time: 25, level: 2,
    steps: [
      '牛肉300克切薄片，加1勺淀粉、1勺生抽、少许水抓匀腌10分钟。',
      '番茄3个划十字烫去皮切块，锅放油下姜片和番茄，中火炒5分钟出沙。',
      '倒1升热水大火煮5分钟成浓汤，加1勺盐调味。',
      '转小火，肉片一片片下锅，煮1分钟变色立即关火。'
    ],
    tip: '番茄炒出沙汤才浓；牛肉最后下，久煮发老。',
    src: '下厨房'
  },
  {
    id: 'b8-tomato-tofu', name: '番茄炒豆腐', emoji: '🍅',
    need: ['tofu', 'tomato'], extra: ['scallion', 'oyster'], time: 20, level: 1,
    steps: [
      '嫩豆腐一块切2厘米块，放淡盐水泡5分钟；番茄2个切块。',
      '锅放油下番茄，中火炒5分钟并压出汁水，加半勺糖提鲜。',
      '下豆腐轻轻推匀，加半碗水、1勺蚝油、半勺盐，中小火烧4分钟。',
      '淋少许水淀粉勾芡，撒葱花出锅。'
    ],
    tip: '番茄炒到出沙再放豆腐，汤汁才裹得住。',
    src: '下厨房'
  },
  {
    id: 'b8-fuzhu-pork-slices', name: '腐竹炒肉片', emoji: '🍜',
    need: ['fuzhu', 'porkloin', 'greenpepper', 'garlicshoot'], extra: ['garlic'], time: 30, level: 1,
    steps: [
      '腐竹3根冷水泡2小时至软透，切段；里脊150克切片，加淀粉、生抽抓匀。',
      '青椒2个切块，蒜苗2根切段，蒜切片备用。',
      '锅放油，肉片中火滑炒1分钟变色即盛出。',
      '底油下蒜片、青椒炒1分钟，倒腐竹加1勺生抽、半碗水焖2分钟，回肉片和蒜苗炒匀。'
    ],
    tip: '腐竹用冷水泡才不烂，焖2分钟才吸足味。',
    src: '下厨房'
  },
  {
    id: 'b8-dry-fried-kingoyster', name: '干煸杏鲍菇', emoji: '🍄',
    need: ['kingoyster'], extra: ['cumin', 'driedchili'], time: 20, level: 2,
    steps: [
      '杏鲍菇3根顺纹撕成粗条，撒少许盐抓匀静置5分钟，挤干水分。',
      '锅放3勺油，菇条中火煸6分钟，煸到体积缩半、边缘金黄。',
      '加蒜末、干辣椒段、半勺孜然粒，小火炒出香味。',
      '加半勺生抽、少许盐，大火翻匀炒30秒出锅。'
    ],
    tip: '菇条先挤水再煸，煸到干香才有吃肉的口感。',
    src: '下厨房'
  },
  {
    id: 'b8-garlic-chickenwing', name: '蒜香鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['garlic', 'honey'], time: 30, level: 2,
    steps: [
      '鸡翅8个两面划刀，加1勺蒜末、1勺生抽、半勺盐、1勺料酒腌20分钟。',
      '平底锅放少油，鸡翅皮朝下小火煎6分钟，逼出鸡油至金黄。',
      '翻面再煎4分钟，倒出多余油，加1勺蜂蜜和半碗水。',
      '中小火焖3分钟收汁，撒大量蒜末和葱花翻匀。'
    ],
    tip: '皮朝下小火慢煎出油，最后加蜂蜜收汁才亮。',
    src: '下厨房'
  },
  {
    id: 'b8-chao-hecai', name: '炒合菜', emoji: '🥬',
    need: ['beansprout', 'chive', 'vermicelli', 'egg'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '粉丝温水泡软剪两段，鸡蛋两个打散摊成蛋皮后切丝。',
      '豆芽掐去根须洗净，韭菜切段，蒜切末。',
      '热油下蒜末，倒豆芽大火炒一分钟断生。',
      '下粉丝、蛋皮丝，加生抽和蚝油翻匀，最后放韭菜炒三十秒。'
    ],
    tip: '韭菜最后下、三十秒就行，早放会出水发黄。',
    src: '下厨房'
  },
  {
    id: 'b8-henan-huncai', name: '河南大烩菜', emoji: '🍲',
    need: ['porkbelly', 'vermicelli', 'cabbage', 'fungus'], extra: ['ginger', 'thirteen'], time: 40, level: 1,
    steps: [
      '五花肉切片，粉条泡软，木耳泡发，白菜帮叶分开切块。',
      '锅里少油煸五花肉到出油微卷，下姜片和十三香炒香。',
      '加白菜帮翻炒，倒生抽老抽和热水，小火炖十五分钟。',
      '下粉条、木耳和白菜叶，再炖十分钟，加盐收汁。'
    ],
    tip: '一碗烩菜的香来自先煸肉，油出来了汤才厚。',
    src: '下厨房'
  }
,

  /* ── 第五轮扩充：全品类补齐 399 道 ── */
  {
    id: 'b9-pepper-tripe-chicken', name: '胡椒猪肚鸡', emoji: '🍲',
    need: ['porktripe', 'chickenleg'], extra: ['pepper', 'ginger', 'wine'], time: 60, level: 2,
    steps: [
      '猪肚用盐和淀粉反复搓洗三遍，冲净后冷水下锅，加料酒焯五分钟捞出切条。',
      '鸡腿剁成小块，冷水下锅焯去血水，捞出用温水冲净浮沫。',
      '砂锅放猪肚条、鸡块和姜片，加足量开水没过食材两指，大火烧开转小火炖四十分钟。',
      '出锅前十分钟撒入白胡椒碎，加盐调味后再煮五分钟关火。'
    ],
    tip: '白胡椒最后放，久煮会失香，汤色也更清亮。'
  },
  {
    id: 'b9-cold-tripe', name: '凉拌猪肚丝', emoji: '🥗',
    need: ['porktripe', 'cilantro'], extra: ['garlic', 'chilioil', 'sesame'], time: 40, level: 2,
    steps: [
      '猪肚用盐加淀粉搓洗干净，冷水下锅放姜片料酒，煮三十分钟至筷子能穿透。',
      '捞出过一遍冰水，放凉后切成细丝，香菜切段，大蒜切末备用。',
      '碗中放蒜末、辣椒油两勺、白芝麻一勺，加生抽两勺、醋一勺、少许糖和盐调匀。',
      '肚丝和香菜倒入料汁中抓拌均匀，静置五分钟让其入味后装盘。'
    ],
    tip: '煮好的猪肚立刻过冰水，口感更弹脆不软塌。'
  },
  {
    id: 'b9-stirfry-tripe', name: '爆炒猪肚', emoji: '🌶️',
    need: ['porktripe', 'greenpepper'], extra: ['garlic', 'ginger', 'wine'], time: 25, level: 3,
    steps: [
      '猪肚洗净冷水下锅，加姜片和料酒煮二十五分钟，捞出斜切薄片。',
      '青椒去籽切斜片，大蒜和生姜各切薄片备用。',
      '锅烧到微微冒烟再倒油，下姜蒜爆香，倒入肚片大火快炒一分钟。',
      '沿锅边淋一勺料酒，加生抽一勺、少许盐，下青椒大火炒四十秒出锅。'
    ],
    tip: '全程大火，猪肚下锅别超过两分钟，久炒会发硬。'
  },
  {
    id: 'b9-braised-tripe', name: '卤猪肚', emoji: '🍖',
    need: ['porktripe'], extra: ['staranise', 'bayleaf', 'wine'], time: 80, level: 1,
    steps: [
      '猪肚用盐和淀粉搓洗三遍，冷水下锅焯五分钟，捞出用温水冲净内外。',
      '锅中加水没过猪肚，放八角两颗、香叶两片、姜片和葱段。',
      '加生抽半碗、老抽两勺、冰糖一小把和料酒两勺，大火烧开转小火。',
      '放入猪肚卤六十分钟，关火后连汤泡半小时，捞出切条淋卤汁。'
    ],
    tip: '关火别急着捞，泡在卤汁里越久越入味。'
  },
  {
    id: 'b9-blood-tofu-soup', name: '猪血豆腐汤', emoji: '🥣',
    need: ['porkblood', 'tofu'], extra: ['scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '猪血和嫩豆腐分别切成两厘米见方的块，猪血用清水泡五分钟。',
      '锅中水烧开，下猪血焯一分钟去腥，捞出沥干水分。',
      '另起锅加清水和姜丝烧开，下猪血和豆腐，小火煮八分钟。',
      '加盐和白胡椒粉调味，撒葱花，淋几滴香油即可出锅。'
    ],
    tip: '猪血先焯水，汤才不腥不浑，颜色也清爽。'
  },
  {
    id: 'b9-chive-blood', name: '韭菜炒猪血', emoji: '🥬',
    need: ['porkblood', 'chive'], extra: ['garlic', 'driedchili'], time: 15, level: 2,
    steps: [
      '猪血切成半厘米厚的片，韭菜切四厘米长段，蒜切片、干辣椒剪段。',
      '水开后下猪血焯一分钟，捞出沥干，避免下锅碎散。',
      '热锅倒油，爆香蒜片和干辣椒，倒入猪血轻轻推炒一分钟。',
      '加生抽一勺和少许盐，下韭菜大火翻炒三十秒立刻出锅。'
    ],
    tip: '韭菜最后下，翻两下就起锅，久了出水发黄。'
  },
  {
    id: 'b9-spicy-blood', name: '麻辣猪血', emoji: '🌶️',
    need: ['porkblood', 'beansprout'], extra: ['douban', 'driedchili', 'sichuan'], time: 25, level: 2,
    steps: [
      '猪血切块后焯水一分钟；豆芽洗净焯熟，捞出铺在大碗底部。',
      '锅中放两勺油，小火炒香豆瓣酱一勺、花椒十余粒和干辣椒段。',
      '加两碗水烧开，下猪血小火煮六分钟，加盐和生抽调味。',
      '连汤倒入豆芽碗中，表面撒蒜末和辣椒面，浇一勺烧热的油。'
    ],
    tip: '豆瓣酱必须小火炒出红油，火大容易发苦。'
  },
  {
    id: 'b9-cured-bamboo', name: '腊肉炒竹笋', emoji: '🥓',
    need: ['curedmeat', 'bambooshoot'], extra: ['garlic', 'driedchili'], time: 20, level: 2,
    steps: [
      '腊肉冷水下锅煮十分钟，捞出切薄片；竹笋切片后焯水三分钟去涩。',
      '锅中不放油，下腊肉片小火慢煸，煸出油脂至边缘微卷。',
      '加蒜片和干辣椒段炒香，倒入笋片大火翻炒两分钟。',
      '加少许生抽和糖调味，翻匀后即可出锅装盘。'
    ],
    tip: '腊肉先煮再炒，咸味减半，口感也不发柴。'
  },
  {
    id: 'b9-cured-taro', name: '腊肉蒸芋头', emoji: '🍠',
    need: ['curedmeat', 'taro'], extra: ['ginger', 'scallion'], time: 35, level: 1,
    steps: [
      '腊肉煮十分钟后切薄片，芋头去皮切成半厘米厚的片。',
      '芋头片平铺在盘底，撒一点点盐，再把腊肉片交错码在上面。',
      '放上姜丝，水开后上锅，中火蒸二十分钟至芋头软糯。',
      '出锅撒葱花，淋一勺烧热的油激出香味即可。'
    ],
    tip: '芋头切厚一点，蒸久了才不容易碎成泥。'
  },
  {
    id: 'b9-cured-rice', name: '腊肉豌豆焖饭', emoji: '🍚',
    need: ['curedmeat', 'rice', 'peas'], extra: ['scallion'], time: 40, level: 1,
    steps: [
      '大米淘洗后浸泡十五分钟；腊肉切小丁，豌豆洗净沥干。',
      '锅中少油下腊肉丁煸出油，倒入豌豆翻炒一分钟盛出。',
      '米和炒好的料一起放进电饭煲，水量比平时煮饭略少一些。',
      '按煮饭键，跳闸后再焖十分钟，开盖拌匀撒上葱花。'
    ],
    tip: '腊肉本身够咸，饭里不用再加盐。'
  },
  {
    id: 'b9-cured-cauliflower', name: '腊肉炒花菜', emoji: '🥦',
    need: ['curedmeat', 'cauliflower'], extra: ['garlic', 'driedchili'], time: 20, level: 2,
    steps: [
      '花菜掰成小朵，用淡盐水泡十分钟，再下开水焯一分钟捞出。',
      '腊肉煮十分钟后切片，锅中不放油，小火煸出油脂。',
      '下蒜片和干辣椒炒香，倒入花菜大火翻炒两分钟。',
      '加一勺生抽和少许糖提味，炒匀后出锅。'
    ],
    tip: '花菜焯水别超过一分钟，保持脆口不软烂。'
  },
  {
    id: 'b9-meatball-melon', name: '冬瓜肉丸汤', emoji: '🍲',
    need: ['meatball', 'wintermelon'], extra: ['ginger', 'pepper'], time: 25, level: 1,
    steps: [
      '冬瓜去皮去瓤切薄片，生姜切细丝备用。',
      '锅中加清水和姜丝烧开，下肉丸中小火煮五分钟。',
      '放入冬瓜片继续煮八分钟，煮到冬瓜变透明。',
      '加盐和白胡椒粉调味，撒葱花，淋几滴香油。'
    ],
    tip: '肉丸浮起后再放冬瓜，汤才清甜不浑浊。'
  },
  {
    id: 'b9-braised-meatball', name: '红烧肉丸', emoji: '🍖',
    need: ['meatball'], extra: ['ginger', 'starch', 'wine'], time: 30, level: 2,
    steps: [
      '肉丸表面薄薄拍一层淀粉，锅中放油中火煎至表面金黄。',
      '下姜片炒香，沿锅边烹入一勺料酒。',
      '加生抽两勺、老抽半勺、糖一小勺和半碗水，烧开后转小火。',
      '盖盖焖十分钟，开盖转大火收汁至浓稠裹住肉丸。'
    ],
    tip: '肉丸先煎定型，烧的时候才不容易散开。'
  },
  {
    id: 'b9-cabbage-meatball', name: '白菜肉丸煲', emoji: '🍲',
    need: ['meatball', 'cabbage', 'vermicelli'], extra: ['ginger'], time: 30, level: 1,
    steps: [
      '粉丝用温水泡软，白菜切成大片，菜帮和菜叶分开放。',
      '砂锅少油下姜片，先放菜帮炒软，加两碗水烧开。',
      '下肉丸煮八分钟，再放菜叶和粉丝继续煮五分钟。',
      '加盐和少许白胡椒粉调味，连锅上桌即可。'
    ],
    tip: '菜帮先炒过再煮，汤更甜，不会寡淡。'
  },
  {
    id: 'b9-curry-meatball', name: '咖喱肉丸', emoji: '🍛',
    need: ['meatball', 'potato', 'onion'], extra: ['curry'], time: 30, level: 1,
    steps: [
      '土豆去皮切滚刀块，洋葱切成粗丝备用。',
      '锅中放油炒洋葱至透明，下土豆块翻炒两分钟。',
      '加水没过食材烧开，放入肉丸小火煮十二分钟。',
      '关小火放入咖喱块搅化，再煮三分钟至汤汁浓稠。'
    ],
    tip: '咖喱块要关火后放，边搅边化，免得糊锅。'
  },
  {
    id: 'b9-soybean-trotter', name: '黄豆焖猪蹄', emoji: '🍖',
    need: ['trotters', 'soybean'], extra: ['staranise', 'ginger'], time: 90, level: 2,
    steps: [
      '黄豆提前泡四小时；猪蹄剁块冷水下锅焯水，撇沫后捞出冲净。',
      '锅中少油下冰糖炒出糖色，倒入猪蹄翻炒至均匀上色。',
      '加姜片、八角、生抽三勺、老抽一勺和料酒两勺，倒热水没过。',
      '放入泡好的黄豆，大火烧开转小火焖七十分钟，最后收汁。'
    ],
    tip: '全程加热水，冷水会让猪蹄紧缩，久炖也不烂。'
  },
  {
    id: 'b9-braised-trotter', name: '卤猪蹄', emoji: '🍖',
    need: ['trotters'], extra: ['staranise', 'cinnamon', 'bayleaf'], time: 90, level: 1,
    steps: [
      '猪蹄剁成小块，冷水下锅加料酒焯五分钟，捞出冲净浮沫。',
      '锅中加足量水，放八角、桂皮、香叶、姜片和葱段。',
      '加生抽半碗、老抽三勺、冰糖一把，烧开后放入猪蹄。',
      '转小火卤七十分钟，关火再浸泡一小时，捞出淋汁。'
    ],
    tip: '卤好泡一夜更佳，皮更糯，颜色也更深。'
  },
  {
    id: 'b9-tofu-trotter', name: '腐乳猪蹄', emoji: '🍖',
    need: ['trotters'], extra: ['fermentedtofu', 'ginger', 'wine'], time: 80, level: 2,
    steps: [
      '猪蹄剁块冷水下锅焯水，捞出沥干；腐乳三块加两勺腐乳汁压成泥。',
      '锅中少油下姜片，倒入猪蹄翻炒至表面微微发黄。',
      '加腐乳泥、料酒、生抽一勺和冰糖，倒热水没过猪蹄。',
      '小火焖六十分钟，转大火收汁至色泽红亮即可。'
    ],
    tip: '腐乳本身很咸，盐基本不用再放，先尝后调。'
  },
  {
    id: 'b9-tomato-liver-soup', name: '番茄猪肝汤', emoji: '🍅',
    need: ['liver', 'tomato'], extra: ['ginger', 'starch'], time: 20, level: 1,
    steps: [
      '猪肝切薄片，清水泡十分钟去血水，捞出加淀粉抓匀。',
      '番茄切块，锅中少油下番茄炒出红汁，加姜丝和两碗水烧开。',
      '转小火，把猪肝片一片片抖散下锅，煮两分钟。',
      '加盐调味，撒上葱花，关火出锅即可。'
    ],
    tip: '猪肝一变灰白就关火，多煮一分钟就发硬。'
  },
  {
    id: 'b9-pepper-liver', name: '青椒炒猪肝', emoji: '🌶️',
    need: ['liver', 'greenpepper'], extra: ['garlic', 'wine', 'starch'], time: 20, level: 2,
    steps: [
      '猪肝切薄片，泡去血水后加料酒、淀粉抓匀腌十分钟。',
      '青椒去籽切块，大蒜切片；锅烧热，比平时多放些油。',
      '大火下猪肝快速滑炒至变色，立刻盛出控油。',
      '余油炒青椒半分钟，回锅猪肝，加生抽和盐翻炒均匀。'
    ],
    tip: '猪肝分两次下锅，第一次只炒到七成熟。'
  },
  {
    id: 'b9-braised-liver', name: '卤猪肝', emoji: '🥩',
    need: ['liver'], extra: ['staranise', 'ginger', 'wine'], time: 40, level: 1,
    steps: [
      '猪肝整块泡水半小时，中途换两次水，泡到颜色变浅。',
      '锅中加水，放八角、姜片、葱段、生抽三勺和料酒烧开。',
      '放入猪肝小火煮十五分钟，关火原汤焖二十分钟。',
      '捞出放凉后切薄片，淋少许卤汁和香油。'
    ],
    tip: '筷子扎最厚处不出血水就是熟了，别煮过头。'
  },
  {
    id: 'b9-sausage-claypot', name: '腊肠煲仔饭', emoji: '🍚',
    need: ['chinesesausage', 'rice', 'bokchoy'], extra: ['scallion'], time: 45, level: 2,
    steps: [
      '大米泡二十分钟，腊肠斜切薄片，小青菜焯水备用。',
      '砂锅内壁刷一层油，米加水（比平时略少）大火烧开。',
      '水收干、表面出现小孔时铺上腊肠片，转小火焖十二分钟。',
      '沿锅边淋一圈油再焖三分钟出锅巴，摆青菜淋生抽撒葱花。'
    ],
    tip: '最后沿边淋油是出锅巴的关键，中途别开盖。'
  },
  {
    id: 'b9-sausage-egg', name: '腊肠蒸蛋', emoji: '🥚',
    need: ['chinesesausage', 'egg'], extra: ['scallion', 'sesamoil'], time: 20, level: 1,
    steps: [
      '腊肠斜切薄片；三个鸡蛋打散，加一小撮盐搅匀。',
      '蛋液里加一点五倍温水拌匀，过筛滤掉表面泡沫。',
      '倒入浅碗，盖一个盘子，上汽后中小火蒸八分钟。',
      '开盖摆上腊肠片再蒸三分钟，出锅淋香油撒葱花。'
    ],
    tip: '水用四十度左右的温水，蒸出来最滑嫩无蜂窝。'
  },
  {
    id: 'b9-sausage-cabbage', name: '腊肠炒包菜', emoji: '🥬',
    need: ['chinesesausage', 'cabbage'], extra: ['garlic', 'driedchili'], time: 15, level: 1,
    steps: [
      '包菜用手撕成大片，洗净后彻底沥干；腊肠斜切片。',
      '锅中少油下腊肠，小火煸出油脂后先盛出一半。',
      '下蒜片和干辣椒炒香，倒入包菜大火翻炒两分钟。',
      '加生抽一勺和少许盐，回锅腊肠炒匀出锅。'
    ],
    tip: '包菜一定沥干水，带水下锅只会出汤不脆。'
  },
  {
    id: 'b9-lunch-rice', name: '午餐肉炒饭', emoji: '🍚',
    need: ['luncheonmeat', 'rice', 'egg'], extra: ['scallion'], time: 20, level: 1,
    steps: [
      '午餐肉切小丁，鸡蛋打散，米饭用隔夜的最好。',
      '锅中少油，下午餐肉丁煎至边缘微焦后盛出。',
      '倒入蛋液炒散，下米饭中火压散，炒到粒粒分明。',
      '加回午餐肉，放生抽一勺和少许盐，撒葱花炒匀。'
    ],
    tip: '米饭提前用手抓散，炒出来才不会结块。'
  },
  {
    id: 'b9-lunch-ball', name: '午餐肉饭团', emoji: '🍙',
    need: ['luncheonmeat', 'rice', 'seaweed'], extra: ['sesame'], time: 20, level: 1,
    steps: [
      '米饭趁温热加少许盐和白芝麻，拌匀放至不烫手。',
      '午餐肉切一厘米厚片，平底锅不放油两面各煎一分钟。',
      '手上沾凉水，取米饭压平，放上午餐肉片捏成椭圆。',
      '外面裹一条紫菜，收口朝下放稳即可。'
    ],
    tip: '手沾凉水再捏，米饭不粘手，形状也更好看。'
  },
  {
    id: 'b9-lunch-cabbage', name: '午餐肉炖白菜', emoji: '🍲',
    need: ['luncheonmeat', 'cabbage', 'vermicelli'], extra: ['ginger'], time: 25, level: 1,
    steps: [
      '粉丝温水泡软，白菜切段，午餐肉切半厘米厚片。',
      '锅中少油把午餐肉两面煎香，推到锅边。',
      '下姜丝和白菜炒软，加两碗水烧开。',
      '放粉丝煮五分钟，加盐和白胡椒粉调味即可。'
    ],
    tip: '午餐肉先煎过，炖的时候不易散，汤也更香。'
  },
  {
    id: 'b9-ham-friedrice', name: '火腿蛋炒饭', emoji: '🍳',
    need: ['ham', 'egg', 'rice'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '火腿切小丁，鸡蛋打散，小葱切成葱花。',
      '热锅倒油，蛋液下锅炒成小块后盛出。',
      '下火腿丁炒出香味，倒入米饭中火炒散。',
      '加回鸡蛋，放盐和少许生抽，撒葱花炒匀出锅。'
    ],
    tip: '米饭用隔夜的，炒前先抓散，成品才松散。'
  },
  {
    id: 'b9-ham-potato-soup', name: '火腿土豆浓汤', emoji: '🥣',
    need: ['ham', 'potato', 'milk'], extra: ['blackpepper'], time: 30, level: 2,
    steps: [
      '土豆去皮切小块，火腿切成一厘米见方的小丁。',
      '锅中少油炒香火腿丁，下土豆块翻炒一分钟。',
      '加水刚没过土豆，小火煮十五分钟至能用勺子压碎。',
      '用勺背把土豆压成粗泥，倒牛奶煮三分钟，加盐和黑胡椒。'
    ],
    tip: '土豆压碎就好，别打成泥，带颗粒更有口感。'
  },
  {
    id: 'b9-ham-peas', name: '火腿炒豌豆', emoji: '🫛',
    need: ['ham', 'peas'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '火腿切小丁，豌豆洗净，大蒜切末。',
      '水开后下豌豆焯两分钟，捞出过一遍凉水。',
      '锅中少放油，小火炒香蒜末和火腿丁。',
      '倒入豌豆大火翻炒一分钟，加少许盐和糖调味。'
    ],
    tip: '豌豆先焯水，炒时才不会外软内生。'
  },
  {
    id: 'b9-sausage-corn', name: '火腿肠炒玉米', emoji: '🌽',
    need: ['sausage', 'corn'], extra: ['scallion'], time: 15, level: 1,
    steps: [
      '玉米粒剥好，火腿肠切小丁，小葱切末。',
      '水开后下玉米粒焯两分钟，捞出沥干。',
      '锅中少油，下火腿肠丁煎至表面微焦。',
      '倒入玉米粒大火炒一分钟，加盐和葱花炒匀。'
    ],
    tip: '火腿肠先煎一下会更香，口感也更弹。'
  },
  {
    id: 'b9-sausage-omelette', name: '火腿肠烘蛋', emoji: '🍳',
    need: ['sausage', 'egg'], extra: ['scallion', 'blackpepper'], time: 20, level: 1,
    steps: [
      '火腿肠切薄片，四个鸡蛋加盐和黑胡椒打匀。',
      '平底锅刷油，火腿肠片铺满锅底，小火煎香。',
      '倒入蛋液，转最小火盖上盖子烘六分钟。',
      '表面凝固后撒葱花，滑到盘中切块即可。'
    ],
    tip: '全程小火，火大底面糊了中间还没熟。'
  },
  {
    id: 'b9-sausage-onion', name: '火腿肠炒洋葱', emoji: '🧅',
    need: ['sausage', 'onion'], extra: ['blackpepper'], time: 15, level: 1,
    steps: [
      '洋葱切成粗丝，火腿肠斜切成薄片备用。',
      '锅中少油，下火腿肠片煎到边缘微微起泡。',
      '倒入洋葱丝大火翻炒两分钟至微微透明。',
      '加少许盐和黑胡椒，翻匀即可出锅。'
    ],
    tip: '洋葱炒到半透明就好，久了发甜发软。'
  },
  {
    id: 'b9-taro-pork', name: '芋头扣肉', emoji: '🍖',
    need: ['porkbelly', 'taro'], extra: ['fermentedtofu', 'staranise'], time: 90, level: 2,
    steps: [
      '五花肉整块冷水下锅，加姜片料酒煮二十分钟，捞出趁热抹一层老抽。',
      '锅中少油，肉皮朝下煎至起泡，取出泡冷水后切厚片。',
      '芋头去皮切同样厚片，两片肉夹一片芋头，皮朝下码入碗中。',
      '腐乳压泥加生抽、糖和半碗水调汁淋上，放八角蒸七十分钟。'
    ],
    tip: '肉皮煎完再泡冷水，蒸出来才起虎皮皱纹。'
  },
  {
    id: 'b9-salt-fried-pork', name: '盐煎肉', emoji: '🥩',
    need: ['porkbelly', 'garlicshoot'], extra: ['douban', 'douchi'], time: 20, level: 2,
    steps: [
      '五花肉切薄片，蒜苗斜切段，蒜白和蒜叶分开放。',
      '锅中少油，下肉片中火煸炒至出油、边缘微卷。',
      '加豆瓣酱半勺、豆豉十余粒，小火炒出红油。',
      '下蒜白炒香，再放蒜叶，加少许生抽炒匀出锅。'
    ],
    tip: '肉片要煸到边缘发干才香，别急着下调料。'
  },
  {
    id: 'b9-garlic-pork', name: '蒜泥白肉', emoji: '🥒',
    need: ['porkbelly', 'cucumber'], extra: ['garlic', 'chilioil', 'sesame'], time: 40, level: 2,
    steps: [
      '五花肉整块冷水下锅，加姜片和料酒，小火煮二十五分钟。',
      '关火后在原汤里泡十分钟，捞出放凉，切成薄片。',
      '黄瓜切薄片垫盘底；蒜捣成泥，加辣椒油、生抽、糖和香油调成汁。',
      '肉片码在黄瓜上，浇上蒜泥汁，最后撒白芝麻。'
    ],
    tip: '肉煮好泡在原汤里，切的时候不易散不干柴。'
  },
  {
    id: 'b9-dongpo-pork', name: '东坡肉', emoji: '🍖',
    need: ['porkbelly'], extra: ['rocksugar', 'wine', 'staranise'], time: 90, level: 2,
    steps: [
      '五花肉切五厘米见方的大块，冷水下锅焯水后冲净。',
      '砂锅底铺葱段姜片，肉皮朝下码好，加冰糖、生抽、老抽和料酒。',
      '倒开水到肉的三分之二高，放八角，烧开后小火焖六十分钟。',
      '翻面皮朝上再焖二十分钟，取出装碗淋汁，蒸十分钟。'
    ],
    tip: '水别没过肉面，靠蒸汽焖才酥而不散不烂。'
  },
  {
    id: 'b9-pork-kelp', name: '五花肉炖海带', emoji: '🍲',
    need: ['porkbelly', 'kelp'], extra: ['ginger', 'staranise'], time: 60, level: 1,
    steps: [
      '海带提前泡发洗净，切成菱形片；五花肉切三厘米块。',
      '肉块冷水下锅焯水，撇净浮沫后捞出。',
      '锅中少油炒糖色，下肉块翻匀，加姜片、八角、生抽和料酒。',
      '加热水没过，炖三十分钟后放海带，再炖二十分钟收汁。'
    ],
    tip: '海带后放，炖太久会烂成糊，失了口感。'
  },
  {
    id: 'b9-pork-driedtofu', name: '五花肉炒香干', emoji: '🍖',
    need: ['porkbelly', 'driedtofu'], extra: ['garlic', 'driedchili'], time: 20, level: 1,
    steps: [
      '五花肉切薄片，香干切条，蒜切片、干辣椒剪段。',
      '锅中少油下肉片，中小火煸出油脂至微微焦边。',
      '加蒜片和干辣椒炒香，倒入香干翻炒两分钟。',
      '加生抽一勺、少许盐和糖，翻匀出锅。'
    ],
    tip: '香干先用热水烫一分钟，去豆腥也更软。'
  },
  {
    id: 'b9-crispy-loin', name: '软炸里脊', emoji: '🥩',
    need: ['porkloin', 'egg'], extra: ['pepper', 'starch'], time: 25, level: 2,
    steps: [
      '里脊切手指粗的条，加盐、白胡椒和料酒腌十五分钟。',
      '一个鸡蛋加淀粉和少许面粉，调成能挂住筷子的糊。',
      '油烧到六成热，肉条裹糊逐根下锅，炸到浅黄色捞出。',
      '油温升高复炸三十秒至金黄，捞出沥油装盘。'
    ],
    tip: '复炸一次才够酥，出锅别盖盖子，会回软。'
  },
  {
    id: 'b9-sauteed-pork', name: '熘肉段', emoji: '🥩',
    need: ['porkloin', 'greenpepper'], extra: ['starch', 'garlic'], time: 30, level: 3,
    steps: [
      '里脊切滚刀块，加盐和料酒腌十分钟，裹上厚淀粉糊。',
      '油六成热下肉段炸至定型捞出，升温后复炸至金黄。',
      '锅留底油炒香蒜末，下青椒块翻炒半分钟。',
      '倒入生抽、醋、糖加水淀粉调的汁烧开，下肉段翻匀。'
    ],
    tip: '碗汁提前调好，下锅后十秒内翻匀就出锅。'
  },
  {
    id: 'b9-sweet-sour-pork', name: '咕咾肉', emoji: '🍍',
    need: ['porkloin', 'bellpepper'], extra: ['ketchup', 'starch'], time: 30, level: 2,
    steps: [
      '里脊切两厘米块，加盐和料酒腌十分钟，裹一层干淀粉。',
      '油六成热下肉块炸至金黄捞出；彩椒切块备用。',
      '锅留底油，下番茄酱三勺、糖两勺、醋一勺和半碗水烧开。',
      '倒入彩椒和肉块，大火翻匀至汤汁收浓裹住肉块。'
    ],
    tip: '番茄酱先炒一下去生味，颜色更红亮好看。'
  },
  {
    id: 'b9-bokchoy-meatball', name: '小白菜汆丸子', emoji: '🥬',
    need: ['mincedpork', 'bokchoy', 'egg'], extra: ['ginger', 'starch'], time: 25, level: 2,
    steps: [
      '肉末加姜末、盐、淀粉和一个蛋清，顺一个方向搅打上劲。',
      '小白菜洗净切段；锅中水烧到微开、只冒小泡。',
      '用虎口挤出丸子，勺子舀入锅中，中小火汆三分钟。',
      '丸子全部浮起后放小白菜煮两分钟，加盐和香油。'
    ],
    tip: '水别大滚，保持微沸，丸子下锅才不会散。'
  },
  {
    id: 'b9-mince-waterbamboo', name: '肉末炒茭白', emoji: '🥢',
    need: ['mincedpork', 'waterbamboo'], extra: ['garlic', 'oyster'], time: 20, level: 1,
    steps: [
      '茭白剥去老皮切细丝，肉末加少许生抽抓匀。',
      '锅中少油下肉末炒散，炒到变色后盛出。',
      '余油炒香蒜末，倒入茭白丝大火翻炒两分钟。',
      '回锅肉末，加蚝油一勺和少许盐，翻匀出锅。'
    ],
    tip: '茭白切丝后要马上炒，放久了会发黑。'
  },
  {
    id: 'b9-mince-zucchini', name: '肉末炒西葫芦', emoji: '🥒',
    need: ['mincedpork', 'zucchini'], extra: ['garlic'], time: 15, level: 1,
    steps: [
      '西葫芦切半圆薄片，肉末加生抽抓匀备用。',
      '锅烧热少油，下肉末炒散，加蒜末炒香。',
      '倒入西葫芦大火翻炒两分钟，至边缘变透明。',
      '加盐和少许生抽调味，炒匀即可出锅。'
    ],
    tip: '西葫芦爱出水，全程大火快炒才脆爽。'
  },
  {
    id: 'b9-braised-ribs', name: '红烧排骨', emoji: '🍖',
    need: ['ribs'], extra: ['ginger', 'staranise', 'wine'], time: 45, level: 1,
    steps: [
      '排骨冷水下锅，加姜片和料酒焯水，撇沫后捞出冲净。',
      '锅中少油下冰糖炒出枣红色，倒入排骨翻炒上色。',
      '加姜片、八角、生抽两勺、老抽半勺，倒热水没过排骨。',
      '大火烧开转小火焖三十分钟，开盖转大火收汁。'
    ],
    tip: '糖色冒小泡就立刻下排骨，晚一秒就发苦。'
  },
  {
    id: 'b9-melon-rib-soup', name: '冬瓜排骨汤', emoji: '🍲',
    need: ['ribs', 'wintermelon'], extra: ['ginger'], time: 60, level: 1,
    steps: [
      '排骨冷水下锅焯水，撇净浮沫后捞出用温水冲净。',
      '砂锅放排骨和姜片，加足量开水，烧开后小火炖四十分钟。',
      '冬瓜去皮去瓤切厚片，放入汤中再煮十五分钟。',
      '加盐调味，撒上葱花，关火盛出即可。'
    ],
    tip: '冬瓜后放，煮太久会化在汤里，只剩清汤。'
  },
  {
    id: 'b9-honey-ribs', name: '蜜汁烤排骨', emoji: '🍖',
    need: ['ribs'], extra: ['honey', 'charsiu', 'garlic'], time: 50, level: 2,
    steps: [
      '排骨切长段，用叉烧酱两勺、蜂蜜一勺、蒜末和生抽腌两小时。',
      '烤箱预热二百度，排骨放在烤网上，下层垫锡纸接油。',
      '烤二十分钟后翻面，刷一层腌料，再烤十五分钟。',
      '最后刷蜂蜜水，转上火烤五分钟至表面焦亮。'
    ],
    tip: '腌一夜更入味，进烤箱前先回温十分钟。'
  },
  {
    id: 'b9-bitter-rib-soup', name: '苦瓜排骨汤', emoji: '🍲',
    need: ['ribs', 'bittergourd'], extra: ['ginger'], time: 60, level: 1,
    steps: [
      '排骨冷水下锅焯水去沫；苦瓜去瓤切厚块，用盐抓匀再冲净。',
      '砂锅放排骨和姜片，加足量开水，烧开后小火炖四十分钟。',
      '放入苦瓜块，继续炖十五分钟至苦瓜变软。',
      '加盐调味即可，汤色清亮不需其他调料。'
    ],
    tip: '苦瓜用盐抓过再煮，苦味能减轻一半。'
  },
  {
    id: 'b9-pumpkin-ribs', name: '南瓜蒸排骨', emoji: '🎃',
    need: ['ribs', 'pumpkin'], extra: ['douchi', 'garlic', 'starch'], time: 40, level: 1,
    steps: [
      '排骨剁成小段，泡水十分钟去血水后彻底沥干。',
      '加豆豉、蒜末、生抽、淀粉和一勺油抓匀，腌二十分钟。',
      '南瓜去皮切厚片铺在盘底，排骨平铺在南瓜上面。',
      '水开后上锅，中火蒸二十五分钟，出锅撒葱花。'
    ],
    tip: '加一勺淀粉抓匀锁水，蒸出来排骨才嫩滑。'
  },
  {
    id: 'b10-001', name: '清炖牛腩汤', emoji: '🍲',
    need: ['beefbrisket', 'radish'], extra: ['ginger', 'wine'], time: 90, level: 2,
    steps: [
      '牛腩切三厘米块，冷水下锅加两片姜和一勺料酒，煮开撇净浮沫后捞出冲净。',
      '牛腩放入砂锅，加足量热水没过三指，放姜片，大火烧开转小火炖六十分钟。',
      '白萝卜去皮切滚刀块，下锅再炖二十五分钟至萝卜透明。',
      '起锅前加盐调味，撒葱花，汤色清亮不浑。'
    ],
    tip: '全程续热水，加冷水会让牛腩发柴。'
  },
  {
    id: 'b10-002', name: '柱侯牛腩煲', emoji: '🍲',
    need: ['beefbrisket'], extra: ['zhuhou', 'ginger', 'staranise'], time: 100, level: 2,
    steps: [
      '牛腩切块冷水焯透，捞出用温水洗净血沫，沥干备用。',
      '热锅下油爆香姜片和八角，加两勺柱侯酱小火炒出红油。',
      '倒入牛腩翻炒上色，淋一勺料酒，加热水没过食材，大火烧开。',
      '转小火加盖焖九十分钟，最后开大火收汁至浓稠挂勺。'
    ],
    tip: '柱侯酱偏咸，收汁前再尝味补盐。'
  },
  {
    id: 'b10-003', name: '咖喱牛腩', emoji: '🍛',
    need: ['beefbrisket', 'potato', 'carrot', 'onion'], extra: ['curry'], time: 80, level: 2,
    steps: [
      '牛腩切块焯水洗净，土豆胡萝卜去皮切滚刀块备用。',
      '锅中少油炒香洋葱丝，下牛腩块翻炒至表面微焦。',
      '加水没过牛腩，小火炖五十分钟，再放土豆胡萝卜煮十五分钟。',
      '关小火放入咖喱块搅化，边搅边煮五分钟至汤汁浓稠。'
    ],
    tip: '咖喱块最后放，久煮容易糊底。'
  },
  {
    id: 'b10-004', name: '香辣牛腩', emoji: '🌶',
    need: ['beefbrisket'], extra: ['douban', 'driedchili', 'sichuan'], time: 90, level: 2,
    steps: [
      '牛腩切块冷水焯水，撇净血沫后用温水冲洗干净。',
      '热油下豆瓣酱、干辣椒段和花椒，小火炒香出红油。',
      '倒入牛腩翻炒上色，加开水没过，小火焖八十分钟至软烂。',
      '开大火收汁，撒蒜末和葱花翻匀即可。'
    ],
    tip: '炒酱一定用小火，火大就发苦。'
  },
  {
    id: 'b10-005', name: '牛腩焖腐竹', emoji: '🍲',
    need: ['beefbrisket', 'fuzhu'], extra: ['ginger', 'oyster'], time: 90, level: 2,
    steps: [
      '腐竹提前用温水泡软，剪成五厘米段，沥干水分。',
      '牛腩切块焯水后，与姜片一起下锅炒至表面收紧。',
      '加生抽、蚝油和热水，小火焖七十分钟。',
      '放入腐竹再焖十分钟，大火收汁至浓稠。'
    ],
    tip: '腐竹后放，久焖会散成渣。'
  },
  {
    id: 'b10-006', name: '香煎牛排', emoji: '🥩',
    need: ['steak'], extra: ['blackpepper', 'garlic'], time: 15, level: 1,
    steps: [
      '牛排提前半小时室温回温，用厨房纸吸干两面水分。',
      '两面抹盐和现磨黑胡椒，轻压入味，别用刀背拍打。',
      '平底锅烧到微微冒烟，下一勺油，牛排下锅每面煎九十秒。',
      '关火放蒜瓣，倾斜锅淋油十秒，取出静置三分钟再切。'
    ],
    tip: '锅一定要够热，才能煎出焦壳锁住肉汁。'
  },
  {
    id: 'b10-007', name: '蒜香牛排', emoji: '🥩',
    need: ['steak'], extra: ['garlic', 'blackpepper'], time: 20, level: 1,
    steps: [
      '牛排解冻后用盐和黑胡椒腌十分钟，蒜切厚片备用。',
      '热锅下油，放蒜片煎至金黄后夹出，留油在锅里。',
      '牛排下锅，大火每面煎一分钟，边缘立起煎出油脂。',
      '回锅蒜片，淋一勺生抽快速翻匀，出锅静置两分钟。'
    ],
    tip: '蒜片先煎香再夹出，避免后面烧焦发苦。'
  },
  {
    id: 'b10-008', name: '洋葱煎牛排', emoji: '🥩',
    need: ['steak', 'onion'], extra: ['blackpepper', 'wine'], time: 20, level: 1,
    steps: [
      '牛排吸干水分，撒盐和黑胡椒，静置十分钟。',
      '洋葱切粗丝，热锅少油炒到微透明，盛出铺盘底。',
      '锅中补一勺油烧热，牛排下锅每面煎一分钟至焦褐。',
      '淋一勺料酒晃锅，牛排切条铺在洋葱上，浇锅里的汁。'
    ],
    tip: '洋葱炒到边缘微焦最甜，别炒成软泥。'
  },
  {
    id: 'b10-009', name: '牛排盖饭', emoji: '🍚',
    need: ['steak', 'rice'], extra: ['blackpepper', 'oyster', 'scallion'], time: 25, level: 1,
    steps: [
      '米饭提前煮好，盛入碗中压实，表面略压出凹坑。',
      '牛排两面撒盐和黑胡椒，热锅每面煎一分钟，取出切片。',
      '锅内留油，加一勺蚝油和小半碗水煮开，调成酱汁。',
      '牛排片铺在饭上，浇酱汁，撒葱花和白芝麻。'
    ],
    tip: '牛排煎好静置三分钟再切，肉汁不流失。'
  },
  {
    id: 'b10-010', name: '牛排沙拉', emoji: '🥗',
    need: ['steak', 'lettuce', 'cherrytomato'], extra: ['blackpepper'], time: 20, level: 1,
    steps: [
      '牛排撒盐和黑胡椒腌十分钟，热锅每面煎一分半钟。',
      '生菜撕小片泡冰水十分钟捞出沥干，圣女果对半切开。',
      '牛排静置三分钟后逆纹切一厘米厚片。',
      '生菜、圣女果和牛排装盘，淋一勺油和半勺醋，撒黑胡椒拌匀。'
    ],
    tip: '生菜泡冰水更脆，一定要沥干再拌。'
  },
  {
    id: 'b10-011', name: '清炖鸡汤', emoji: '🍲',
    need: ['wholechicken', 'jujube', 'goji'], extra: ['ginger'], time: 100, level: 2,
    steps: [
      '整鸡洗净，去掉鸡屁股和腔内油脂，冷水下锅焯水两分钟。',
      '捞出冲净放入砂锅，加姜片和足量清水，大火烧开。',
      '撇去浮沫转最小火，盖盖炖七十分钟，汤面保持微沸。',
      '放红枣和枸杞再炖十分钟，出锅前加盐调味。'
    ],
    tip: '炖鸡汤别中途加水，一次加足才鲜。'
  },
  {
    id: 'b10-012', name: '盐焗鸡', emoji: '🍗',
    need: ['wholechicken'], extra: ['peppersalt', 'ginger', 'scallion'], time: 60, level: 2,
    steps: [
      '整鸡洗净擦干，里外抹一层椒盐和盐，腌三十分钟。',
      '鸡腹塞入姜片和葱段，用油纸包紧，外层再裹一层锡纸。',
      '电饭锅内胆铺姜片，放鸡，按下煮饭键焗四十分钟。',
      '跳闸后焖十分钟取出，拆纸撕块，淋锅内鸡油。'
    ],
    tip: '鸡要擦干再腌，皮才紧实有嚼劲。'
  },
  {
    id: 'b10-013', name: '白切鸡', emoji: '🐔',
    need: ['wholechicken'], extra: ['ginger', 'scallion', 'sesamoil'], time: 45, level: 2,
    steps: [
      '整鸡洗净，锅中水加姜片葱段烧至将沸未沸。',
      '提着鸡脖三提三放，让腔内热水循环，再整只浸入。',
      '保持水面微微冒泡，浸煮二十五分钟，关火焖十分钟。',
      '捞出立刻放冰水中浸五分钟，斩块配姜葱油。'
    ],
    tip: '水不能大滚，一滚皮就破，肉也发柴。'
  },
  {
    id: 'b10-014', name: '香菇炖鸡', emoji: '🍲',
    need: ['wholechicken', 'shiitake'], extra: ['ginger', 'wine', 'oyster'], time: 70, level: 2,
    steps: [
      '干香菇温水泡发三十分钟，泡菇水沉淀后留上层。',
      '整鸡斩块冷水焯水，捞出冲净血沫沥干。',
      '热锅下油炒香姜片，倒鸡块煸至微黄，淋一勺料酒。',
      '加香菇和泡菇水，小火炖四十分钟，加蚝油收汁。'
    ],
    tip: '泡香菇的水是鲜味来源，别倒掉。'
  },
  {
    id: 'b10-015', name: '五香烤鸡', emoji: '🍗',
    need: ['wholechicken'], extra: ['fivespice', 'honey', 'garlic'], time: 90, level: 2,
    steps: [
      '整鸡洗净擦干，用盐、五香粉和蒜末里外抹匀，腌两小时。',
      '烤箱预热两百度，鸡放烤架，下层垫盘接油。',
      '烤三十分钟后取出，刷一层蜂蜜水，再烤十五分钟上色。',
      '出炉静置十分钟再斩，肉汁更稳。'
    ],
    tip: '翅尖和腿根包锡纸，免得先烤焦。'
  },
  {
    id: 'b10-016', name: '爆炒鸡胗', emoji: '🔥',
    need: ['gizzard', 'greenpepper'], extra: ['garlic', 'ginger', 'wine'], time: 15, level: 2,
    steps: [
      '鸡胗撕去表面筋膜，切十字花刀再切块，用料酒抓洗。',
      '水开下鸡胗汆十五秒立刻捞出，过凉水保持脆嫩。',
      '大火热油爆香蒜片姜丝，下鸡胗快速翻炒三十秒。',
      '加青椒块和生抽，大火炒一分钟出锅。'
    ],
    tip: '全程大火快炒，超过两分钟就嚼不动。'
  },
  {
    id: 'b10-017', name: '卤鸡胗', emoji: '🍖',
    need: ['gizzard'], extra: ['staranise', 'cinnamon', 'bayleaf'], time: 60, level: 2,
    steps: [
      '鸡胗撕净筋膜，用盐和面粉反复搓洗去腥，冲净。',
      '冷水下锅焯两分钟，捞出冲净浮沫。',
      '锅中加水和生抽老抽，放八角桂皮香叶和冰糖煮开。',
      '下鸡胗小火卤四十分钟，关火浸泡两小时更入味。'
    ],
    tip: '卤好别急着捞，泡在卤汁里才够味。'
  },
  {
    id: 'b10-018', name: '泡椒鸡胗', emoji: '🌶',
    need: ['gizzard'], extra: ['pickledchili', 'garlic', 'wine'], time: 15, level: 2,
    steps: [
      '鸡胗切薄片，加料酒和少许淀粉抓匀腌十分钟。',
      '泡椒切段，蒜切片，热油下锅小火炒出酸香。',
      '转大火下鸡胗，快速翻炒至变色卷曲。',
      '加生抽和少许糖提味，炒匀立刻出锅。'
    ],
    tip: '泡椒本身有咸味，生抽少放。'
  },
  {
    id: 'b10-019', name: '孜然鸡胗', emoji: '🔥',
    need: ['gizzard'], extra: ['cumin', 'chilipowder', 'sesame'], time: 15, level: 2,
    steps: [
      '鸡胗切厚片，用料酒、盐和少许淀粉抓匀腌十分钟。',
      '锅烧热不放油，下孜然粒小火焙香后盛出。',
      '热油大火下鸡胗，摊开煎二十秒再翻炒至微焦。',
      '撒孜然、辣椒面和芝麻，翻匀出锅。'
    ],
    tip: '孜然最后撒，早放会失香。'
  },
  {
    id: 'b10-020', name: '鸭血粉丝汤', emoji: '🍜',
    need: ['duckblood', 'vermicelli'], extra: ['ginger', 'scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '鸭血切一厘米厚片，放淡盐水中泡十分钟去腥。',
      '粉丝温水泡软，锅中水加姜片烧开。',
      '下鸭血煮三分钟，再放粉丝煮两分钟。',
      '加盐和白胡椒粉调味，撒葱花，淋几滴香油。'
    ],
    tip: '鸭血别久煮，老了口感像橡皮。'
  },
  {
    id: 'b10-021', name: '韭菜炒鸭血', emoji: '🥘',
    need: ['duckblood', 'chive'], extra: ['garlic', 'pepper'], time: 12, level: 1,
    steps: [
      '鸭血切条，水开加少许盐汆一分钟捞出沥干。',
      '韭菜洗净切四厘米段，根部和叶子分开放。',
      '热油爆香蒜末，下鸭血轻推翻炒，别用铲子压。',
      '下韭菜根炒十秒，再下叶子，加盐和白胡椒炒匀。'
    ],
    tip: '鸭血易碎，用推锅的方式翻。'
  },
  {
    id: 'b10-022', name: '毛血旺', emoji: '🔥',
    need: ['duckblood', 'beansprout', 'luncheonmeat'], extra: ['douban', 'driedchili', 'sichuan'], time: 30, level: 3,
    steps: [
      '鸭血切块汆水，午餐肉切片，豆芽焯水后铺在碗底。',
      '热油小火炒豆瓣酱、干辣椒和花椒，加水煮开成红汤。',
      '下鸭血和午餐肉，中小火煮五分钟入味。',
      '连汤倒入碗中，表面撒蒜末辣椒面，淋一勺滚油。'
    ],
    tip: '淋的油要烧到冒烟，香味才出得来。'
  },
  {
    id: 'b10-023', name: '鸭血豆腐汤', emoji: '🍲',
    need: ['duckblood', 'tofu'], extra: ['ginger', 'scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '鸭血和嫩豆腐都切两厘米方块，分别用淡盐水浸五分钟。',
      '锅中水加姜丝烧开，先下鸭血煮两分钟。',
      '再放豆腐块，转小火煮三分钟，别让汤大滚。',
      '加盐和白胡椒粉，撒葱花，淋几滴香油。'
    ],
    tip: '豆腐下锅后只推不搅，保持完整。'
  },
  {
    id: 'b10-024', name: '豉汁蒸凤爪', emoji: '🐔',
    need: ['chickenfeet'], extra: ['douchi', 'garlic', 'oyster'], time: 60, level: 3,
    steps: [
      '鸡爪剪去指甲，冷水下锅加料酒煮十分钟，捞出擦干。',
      '油烧至六成热，鸡爪下锅炸至表皮起皱，捞出泡冰水。',
      '豆豉和蒜末剁碎，加蚝油、生抽和少许糖拌成酱。',
      '鸡爪拌酱装盘，上汽后大火蒸三十分钟。'
    ],
    tip: '炸完立刻泡冰水，皮才会起虎皮皱。'
  },
  {
    id: 'b10-025', name: '酱焖鸡爪', emoji: '🍗',
    need: ['chickenfeet'], extra: ['soybeanpaste', 'ginger', 'staranise'], time: 45, level: 2,
    steps: [
      '鸡爪剪指甲对半剁开，冷水焯水三分钟去腥。',
      '热油炒香姜片和八角，加一勺黄豆酱炒散。',
      '下鸡爪翻匀上色，加热水没过，放生抽和糖。',
      '小火焖三十分钟，大火收汁至黏亮。'
    ],
    tip: '收汁时勤翻动，胶质多容易糊底。'
  },
  {
    id: 'b10-026', name: '鸡爪玉米汤', emoji: '🌽',
    need: ['chickenfeet', 'corn'], extra: ['ginger', 'wine'], time: 60, level: 1,
    steps: [
      '鸡爪剪指甲，冷水下锅焯三分钟，捞出冲净。',
      '玉米切成五厘米长的段，姜切片备用。',
      '砂锅加水放鸡爪、玉米和姜片，大火烧开。',
      '转小火炖五十分钟，加盐调味即可。'
    ],
    tip: '鸡爪炖到脱骨，汤才有胶质感。'
  },
  {
    id: 'b10-027', name: '糟香鸡爪', emoji: '🍗',
    need: ['chickenfeet'], extra: ['fermentedrice', 'ginger', 'wine'], time: 40, level: 2,
    steps: [
      '鸡爪剪指甲，冷水下锅加姜片和料酒煮十五分钟。',
      '捞出立刻放冰水中泡十分钟，皮更爽脆。',
      '醪糟连汁加少许盐和糖调成糟卤，放入鸡爪。',
      '冷藏浸泡四小时以上，取出直接食用。'
    ],
    tip: '糟卤要没过鸡爪，冷藏一夜更入味。'
  },
  {
    id: 'b10-028', name: '蜜汁烤鸭腿', emoji: '🍗',
    need: ['duck'], extra: ['honey', 'fivespice', 'wine'], time: 60, level: 2,
    steps: [
      '鸭腿用叉子在皮上扎孔，抹盐、五香粉和料酒腌一小时。',
      '烤箱预热两百度，鸭腿皮朝上放烤架烤二十五分钟。',
      '取出刷蜂蜜水，翻面再烤十五分钟。',
      '最后皮朝上烤五分钟上色，静置五分钟再切。'
    ],
    tip: '扎孔能让油脂流出，皮更脆不腻。'
  },
  {
    id: 'b10-029', name: '卤鸭腿', emoji: '🍖',
    need: ['duck'], extra: ['staranise', 'cinnamon', 'bayleaf'], time: 70, level: 2,
    steps: [
      '鸭腿冷水下锅焯三分钟，捞出冲净血沫。',
      '锅中放八角、桂皮、香叶、姜片，加生抽老抽和冰糖煮开。',
      '下鸭腿，小火卤四十分钟，中途翻面一次。',
      '关火浸泡一小时，捞出斩块浇卤汁。'
    ],
    tip: '卤汁别倒，冷冻留着当老卤更香。'
  },
  {
    id: 'b10-030', name: '土豆焖鸭', emoji: '🥔',
    need: ['duck', 'potato'], extra: ['ginger', 'douban', 'wine'], time: 50, level: 2,
    steps: [
      '鸭腿斩块，冷水下锅加料酒焯水，捞出沥干。',
      '热锅不放油，鸭块皮朝下煎出油脂至微黄。',
      '下姜片和一勺豆瓣酱炒香，加热水没过鸭块。',
      '小火焖二十五分钟，放土豆块再焖十五分钟收汁。'
    ],
    tip: '鸭油多，先煎出油再焖才不腻。'
  },
  {
    id: 'b10-031', name: '柠檬鸭', emoji: '🍋',
    need: ['duck', 'lemon'], extra: ['pickledchili', 'garlic', 'ginger'], time: 45, level: 2,
    steps: [
      '鸭腿斩小块，冷水下锅焯水后沥干。',
      '热锅下鸭块干煸至出油微黄，盛出多余的油。',
      '下姜蒜和泡椒炒香，倒鸭块，加生抽和少许糖。',
      '加水焖二十分钟，起锅前放柠檬片翻炒一分钟。'
    ],
    tip: '柠檬最后放，久煮会发苦。'
  },
  {
    id: 'b10-032', name: '孜然羊肉', emoji: '🍖',
    need: ['lamb', 'onion'], extra: ['cumin', 'chilipowder', 'sesame'], time: 15, level: 2,
    steps: [
      '羊肉切薄片，加料酒、盐和少许淀粉抓匀腌十分钟。',
      '洋葱切丝，热油大火炒至微透明盛出。',
      '锅烧热下油，羊肉摊开大火煎至变色。',
      '倒回洋葱，撒孜然、辣椒面和芝麻，翻匀出锅。'
    ],
    tip: '羊肉别腌太久，盐会让肉出水变老。'
  },
  {
    id: 'b10-033', name: '手抓羊肉', emoji: '🍖',
    need: ['lamb'], extra: ['ginger', 'sichuan', 'wine'], time: 90, level: 2,
    steps: [
      '羊腿肉整块冷水浸泡一小时去血水，中途换两次水。',
      '冷水下锅，加姜片、花椒和料酒，大火烧开撇沫。',
      '转小火煮六十分钟，筷子能轻松插入即可。',
      '捞出稍凉切厚片，配盐和蒜泥蘸食。'
    ],
    tip: '煮羊肉别放八角，会压住本身的鲜味。'
  },
  {
    id: 'b10-034', name: '烤羊肉串', emoji: '🍢',
    need: ['lamb', 'onion'], extra: ['cumin', 'chilipowder'], time: 30, level: 2,
    steps: [
      '羊肉切两厘米方块，洋葱切碎，加盐和料酒抓匀腌一小时。',
      '竹签提前泡水，羊肉肥瘦相间串起，每串五六块。',
      '烤箱两百二十度烤十分钟，取出刷一层油。',
      '撒孜然和辣椒面，再烤五分钟至边缘焦香。'
    ],
    tip: '串的时候夹一块肥肉，烤出来才香。'
  },
  {
    id: 'b10-035', name: '咖喱羊肉', emoji: '🍛',
    need: ['lamb', 'potato'], extra: ['curry', 'ginger'], time: 70, level: 2,
    steps: [
      '羊肉切块冷水焯水，捞出冲净浮沫。',
      '热油炒香姜末，下羊肉块翻炒至表面收紧。',
      '加水没过，小火炖四十分钟，放土豆块再煮十五分钟。',
      '关小火放咖喱块搅化，煮五分钟至浓稠。'
    ],
    tip: '咖喱块下锅后要不停搅，防粘底。'
  },
  {
    id: 'b10-036', name: '羊肉炖豆腐', emoji: '🍲',
    need: ['lamb', 'firmtofu'], extra: ['ginger', 'scallion', 'pepper'], time: 50, level: 2,
    steps: [
      '羊肉切块冷水焯水，撇净浮沫后捞出。',
      '砂锅放羊肉和姜片，加开水，小火炖三十五分钟。',
      '老豆腐切块下锅，再炖十分钟至入味。',
      '加盐和白胡椒粉，撒葱花和香菜。'
    ],
    tip: '用老豆腐更耐炖，嫩豆腐容易碎。'
  },
  {
    id: 'b10-037', name: '蚝油牛肉', emoji: '🥩',
    need: ['beef'], extra: ['oyster', 'starch', 'garlic'], time: 15, level: 2,
    steps: [
      '牛肉逆纹切薄片，加生抽、淀粉和一勺水抓至发黏。',
      '淋一勺油封住水分，静置十五分钟。',
      '锅烧到冒烟下油，牛肉快速滑散至七成熟盛出。',
      '爆香蒜末，倒回牛肉，加蚝油大火翻匀出锅。'
    ],
    tip: '牛肉上浆后封油，滑炒才嫩。'
  },
  {
    id: 'b10-038', name: '芹菜炒牛肉', emoji: '🥩',
    need: ['beef', 'celery'], extra: ['garlic', 'wine', 'starch'], time: 15, level: 2,
    steps: [
      '牛肉逆纹切片，加料酒、淀粉和少许油抓匀腌十分钟。',
      '芹菜去筋切斜段，水开汆二十秒捞出过凉。',
      '热油大火滑炒牛肉至变色，立刻盛出。',
      '爆香蒜片下芹菜炒半分钟，倒回牛肉加盐炒匀。'
    ],
    tip: '芹菜先汆水，炒出来才脆绿。'
  },
  {
    id: 'b10-039', name: '卤牛肉', emoji: '🍖',
    need: ['beef'], extra: ['staranise', 'cinnamon', 'bayleaf'], time: 120, level: 2,
    steps: [
      '牛腱整块冷水浸泡两小时去血水，中途换水两次。',
      '冷水下锅焯五分钟，捞出冲净表面浮沫。',
      '锅中加生抽老抽、冰糖、八角桂皮香叶和姜片煮开。',
      '下牛肉小火卤九十分钟，关火浸泡三小时。'
    ],
    tip: '卤好连汁冷藏一夜，切片更紧实不散。'
  },
  {
    id: 'b10-040', name: '沙茶牛肉', emoji: '🥩',
    need: ['beef'], extra: ['shacha', 'garlic', 'starch'], time: 15, level: 2,
    steps: [
      '牛肉逆纹切薄片，加淀粉、生抽和一勺水抓匀。',
      '沙茶酱加两勺水和少许糖调开成酱汁。',
      '大火热油滑炒牛肉至七成熟，盛出。',
      '爆香蒜末，倒回牛肉和酱汁，快速翻匀收汁。'
    ],
    tip: '沙茶酱先用水调开，直接下锅会结块。'
  },
  {
    id: 'b10-041', name: '肥牛乌冬面', emoji: '🍜',
    need: ['beefroll', 'udon'], extra: ['scallion', 'pepper'], time: 15, level: 1,
    steps: [
      '锅中水烧开，乌冬面下锅煮两分钟，捞出装碗。',
      '另起锅加生抽和半碗水煮开成汤底。',
      '肥牛片下汤底汆十秒变色即捞出，铺在面上。',
      '浇上煮好的汤底，撒葱花和白胡椒粉即可。'
    ],
    tip: '肥牛一变色就捞，久煮又老又柴。'
  },
  {
    id: 'b10-042', name: '麻辣肥牛', emoji: '🌶',
    need: ['beefroll', 'beansprout'], extra: ['douban', 'driedchili', 'sichuan'], time: 20, level: 2,
    steps: [
      '豆芽焯水十秒铺在碗底，肥牛片解冻后分开。',
      '热油小火炒豆瓣酱、干辣椒和花椒，加水煮开。',
      '肥牛下锅汆十五秒，连汤一起倒入碗中。',
      '表面撒蒜末和辣椒面，淋一勺烧热的油。'
    ],
    tip: '肥牛别在锅里久煮，靠余温就熟。'
  },
  {
    id: 'b10-043', name: '红烧鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['ginger', 'staranise', 'rocksugar'], time: 40, level: 1,
    steps: [
      '鸡腿两面划两刀，冷水下锅焯水三分钟捞出。',
      '锅中少油放冰糖小火炒至枣红，下鸡腿裹糖色。',
      '加姜片、八角、生抽和老抽，倒热水没过鸡腿。',
      '小火焖二十五分钟，大火收汁至浓亮。'
    ],
    tip: '糖色起小泡就下鸡腿，炒过了会发苦。'
  },
  {
    id: 'b10-044', name: '椒盐鸡腿', emoji: '🍗',
    need: ['chickenleg'], extra: ['peppersalt', 'garlic', 'starch'], time: 25, level: 2,
    steps: [
      '鸡腿去骨切块，加盐、料酒和蒜末腌二十分钟。',
      '表面薄薄拍一层淀粉，抖掉多余的粉。',
      '油温六成热下鸡块，中火炸四分钟至金黄捞出。',
      '升高油温复炸三十秒，趁热撒椒盐翻匀。'
    ],
    tip: '复炸一次壳才脆，放凉也不软。'
  },
  {
    id: 'b10-045', name: '口水鸡', emoji: '🐔',
    need: ['chickenleg', 'peanut'], extra: ['chilioil', 'sichuanoil', 'sesame'], time: 30, level: 2,
    steps: [
      '鸡腿冷水下锅，加姜片和料酒，小火煮十八分钟。',
      '捞出立刻放冰水浸十分钟，皮爽肉嫩，斩块装盘。',
      '生抽、醋、糖、辣椒油和花椒油调成料汁。',
      '料汁浇在鸡块上，撒花生碎、芝麻和葱花。'
    ],
    tip: '煮鸡保持水面微沸，大滚肉就柴。'
  },
  {
    id: 'b10-046', name: '鸡胸肉沙拉', emoji: '🥗',
    need: ['chickenbreast', 'lettuce', 'cherrytomato'], extra: ['blackpepper', 'mayo'], time: 20, level: 1,
    steps: [
      '鸡胸肉横片成两片，用盐和黑胡椒腌十分钟。',
      '平底锅少油，中火每面煎三分钟至熟，切条。',
      '生菜撕片、圣女果对半切，与鸡胸肉一起装碗。',
      '淋沙拉酱，撒黑胡椒，吃前拌匀。'
    ],
    tip: '鸡胸肉片薄再煎，受热均匀不发柴。'
  },
  {
    id: 'b10-047', name: '黑椒鸡胸肉', emoji: '🥩',
    need: ['chickenbreast'], extra: ['blackpepper', 'oyster', 'garlic'], time: 20, level: 1,
    steps: [
      '鸡胸肉片成两片，用刀背轻拍松，撒盐和黑胡椒。',
      '加一勺蚝油和蒜末抓匀，腌十五分钟。',
      '平底锅中火少油，每面煎三分钟至金黄。',
      '锅中加两勺水和少许黑胡椒煮成汁，浇在肉上。'
    ],
    tip: '拍松再腌，入味快也更嫩。'
  },
  {
    id: 'b10-048', name: '柠檬鸡胸', emoji: '🍋',
    need: ['chickenbreast', 'lemon'], extra: ['honey', 'blackpepper'], time: 25, level: 1,
    steps: [
      '鸡胸肉切片，加盐、黑胡椒和半个柠檬汁腌十五分钟。',
      '平底锅少油中火，鸡肉两面各煎两分钟。',
      '蜂蜜加两勺水和柠檬片，小火煮成薄芡汁。',
      '芡汁浇在鸡胸上，摆柠檬片装饰。'
    ],
    tip: '柠檬汁腌太久肉质会发粉，十五分钟够。'
  },
  {
    id: 'b10-049', name: '卤鸡翅', emoji: '🍗',
    need: ['chickenwing'], extra: ['staranise', 'cinnamon', 'bayleaf'], time: 45, level: 1,
    steps: [
      '鸡翅两面划刀，冷水下锅焯三分钟捞出冲净。',
      '锅中放八角、桂皮、香叶、姜片，加生抽老抽和冰糖。',
      '加水煮开，下鸡翅小火卤二十分钟。',
      '关火浸泡三十分钟，捞出浇少许卤汁。'
    ],
    tip: '划刀能让鸡翅更快入味，也易熟透。'
  },
  {
    id: 'b10-050', name: '咖喱鸡翅', emoji: '🍗',
    need: ['chickenwing', 'potato'], extra: ['curry', 'garlic'], time: 40, level: 2,
    steps: [
      '鸡翅两面划刀，用盐和料酒腌十分钟。',
      '热油下鸡翅煎至两面金黄，盛出。',
      '锅中炒香蒜末，加水和土豆块煮十分钟。',
      '放咖喱块搅化，下鸡翅小火煮十分钟至浓稠。'
    ],
    tip: '鸡翅先煎再煮，皮不破也不腥。'
  },
  {
    id: 'b11-shuizhucaoyu', name: '水煮草鱼', emoji: '🐟',
    need: ['grasscarp', 'beansprout'], extra: ['douban', 'driedchili', 'pepper'], time: 30, level: 3,
    steps: [
      '草鱼去鳞去内脏，片成薄片，鱼骨剁段，用清水冲去血水沥干。',
      '鱼片加盐、料酒和淀粉抓匀腌十分钟，豆芽焯水后铺在碗底。',
      '锅中放油炒香豆瓣酱和干辣椒，加水烧开，先下鱼骨煮五分钟。',
      '转小火下鱼片汆至变白卷曲，连汤倒入碗中，撒白胡椒粉。'
    ],
    tip: '鱼片最后下，水微沸就够，煮久易碎。'
  },
  {
    id: 'b11-hongshaocaoyu', name: '红烧草鱼块', emoji: '🐟',
    need: ['grasscarp'], extra: ['ginger', 'scallion', 'wine'], time: 25, level: 2,
    steps: [
      '草鱼切大块，用盐和料酒抓匀腌十分钟，再用厨房纸吸干表面水分。',
      '锅烧热多放油，鱼块下锅煎至两面金黄定型，盛出备用。',
      '余油爆香姜片葱段，加生抽、老抽和糖，倒热水烧开。',
      '放回鱼块小火焖十分钟，转大火收汁，撒葱花出锅。'
    ],
    tip: '煎鱼前擦干水分，锅热油热才不粘皮。'
  },
  {
    id: 'b11-caoyudoufu', name: '草鱼豆腐汤', emoji: '🍲',
    need: ['grasscarp', 'tofu'], extra: ['ginger', 'scallion', 'wine'], time: 25, level: 1,
    steps: [
      '草鱼切块，用料酒和姜片腌十分钟；嫩豆腐切小块泡在淡盐水里。',
      '锅中少油把鱼块两面煎一下，冲入开水，大火滚出白汤。',
      '撇去浮沫，转中火煮十分钟，再下豆腐块煮五分钟。',
      '加盐调味，撒葱花和白胡椒粉关火。'
    ],
    tip: '一定加开水，汤才奶白不腥。'
  },
  {
    id: 'b11-qingzhenglongliyu', name: '清蒸龙利鱼', emoji: '🐟',
    need: ['basa'], extra: ['steamedsoy', 'scallion', 'ginger'], time: 15, level: 1,
    steps: [
      '龙利鱼柳解冻后用厨房纸吸干水分，抹盐和料酒腌五分钟。',
      '盘底铺姜片葱段，放上鱼柳，水开后大火蒸六分钟。',
      '倒掉盘中蒸出的水，拣去旧姜葱，重新铺一层葱丝。',
      '淋蒸鱼豉油，浇一勺烧到冒烟的热油激香。'
    ],
    tip: '鱼柳薄，六分钟就够，蒸久就散了。'
  },
  {
    id: 'b11-paojiaocaoyu', name: '泡椒草鱼片', emoji: '🌶️',
    need: ['grasscarp'], extra: ['pickledchili', 'ginger', 'garlic'], time: 25, level: 2,
    steps: [
      '草鱼片成薄片，加盐、料酒和淀粉抓匀腌十分钟。',
      '泡椒切碎，姜蒜切末，锅中放油小火炒出酸辣香味。',
      '加水烧开，下鱼骨煮三分钟，再逐片下鱼片汆熟。',
      '连汤装盘，撒一把葱花，淋一勺热油激香。'
    ],
    tip: '泡椒先炒出红油，酸辣味才够正。'
  },
  {
    id: 'b11-jiyudoufu', name: '鲫鱼豆腐汤', emoji: '🍲',
    need: ['cruciancarp', 'tofu'], extra: ['ginger', 'scallion', 'wine'], time: 30, level: 1,
    steps: [
      '鲫鱼刮净腹内黑膜，用料酒和姜片腌十分钟，擦干水分。',
      '锅中放油，鲫鱼两面煎至微黄，鱼皮定型不破。',
      '倒入开水没过鱼身，大火煮十分钟至汤色变白。',
      '下豆腐块再煮五分钟，加盐和白胡椒粉，撒葱花。'
    ],
    tip: '腹内黑膜不去干净，汤会发苦发腥。'
  },
  {
    id: 'b11-hongshaojiyu', name: '红烧鲫鱼', emoji: '🐟',
    need: ['cruciancarp'], extra: ['ginger', 'garlic', 'scallion'], time: 25, level: 2,
    steps: [
      '鲫鱼洗净，两面各划两刀，抹盐和料酒腌十分钟。',
      '热锅热油下鱼，煎至两面金黄后盛出。',
      '底油炒香姜蒜，加生抽、老抽、糖和热水烧开。',
      '放回鲫鱼小火焖十分钟，收浓汤汁撒葱花。'
    ],
    tip: '划两刀更入味，也更容易煎透。'
  },
  {
    id: 'b11-ganjianjiyu', name: '干煎鲫鱼', emoji: '🐟',
    need: ['cruciancarp'], extra: ['ginger', 'peppersalt', 'wine'], time: 20, level: 2,
    steps: [
      '鲫鱼去鳞去内脏，刮净腹内黑膜，用料酒和姜片腌十五分钟。',
      '擦干鱼身，表面薄薄拍一层淀粉。',
      '平底锅放油，中小火下鱼，一面煎五分钟再翻面。',
      '煎至两面焦黄、鱼身鼓起，撒椒盐即可。'
    ],
    tip: '小火慢煎，鱼骨才能煎酥。'
  },
  {
    id: 'b11-jiyuluobosi', name: '鲫鱼萝卜丝汤', emoji: '🍲',
    need: ['cruciancarp', 'radish'], extra: ['ginger', 'scallion', 'wine'], time: 30, level: 1,
    steps: [
      '鲫鱼处理干净，用料酒和姜片腌十分钟；白萝卜切细丝。',
      '锅中煎鱼至两面微黄，冲入开水大火煮白。',
      '下萝卜丝转中火煮十分钟，至萝卜透明软烂。',
      '加盐和白胡椒粉调味，撒葱花出锅。'
    ],
    tip: '萝卜丝后放，煮太久会失去清甜。'
  },
  {
    id: 'b11-qingzhenghuanghua', name: '清蒸黄花鱼', emoji: '🐟',
    need: ['yellowcroaker'], extra: ['steamedsoy', 'scallion', 'ginger'], time: 18, level: 1,
    steps: [
      '黄花鱼去鳞去内脏，刮净腹内黑膜，两面各划两刀。',
      '鱼身抹少许盐和料酒，盘底垫姜片葱段，腌十分钟。',
      '水开后上锅大火蒸八分钟，关火再焖两分钟。',
      '倒掉盘中腥水，铺新葱丝，淋蒸鱼豉油和热油。'
    ],
    tip: '蒸出的水一定要倒掉，不然腥。'
  },
  {
    id: 'b11-hongshaohuanghua', name: '红烧黄花鱼', emoji: '🐟',
    need: ['yellowcroaker'], extra: ['ginger', 'garlic', 'scallion'], time: 25, level: 2,
    steps: [
      '黄花鱼洗净擦干，两面划刀，抹薄盐腌十分钟。',
      '热锅放油，鱼下锅煎至两面微黄定型。',
      '下姜蒜爆香，加生抽、老抽、糖和半碗热水。',
      '小火焖十分钟，转大火收汁，撒葱花出锅。'
    ],
    tip: '收汁时用勺淋汤汁，鱼身更亮更入味。'
  },
  {
    id: 'b11-ganjianhuanghua', name: '干煎黄花鱼', emoji: '🐟',
    need: ['yellowcroaker'], extra: ['ginger', 'wine', 'peppersalt'], time: 18, level: 2,
    steps: [
      '小黄花鱼去头去内脏，洗净后用料酒和姜片腌十五分钟。',
      '用厨房纸彻底吸干水分，两面薄拍一层淀粉。',
      '平底锅放油，中小火逐条下锅，煎三分钟再翻面。',
      '两面金黄酥脆后撒椒盐，捞出沥油。'
    ],
    tip: '鱼身越干越酥，下锅别急着翻动。'
  },
  {
    id: 'b11-qingzhengxueyu', name: '清蒸鳕鱼', emoji: '🐟',
    need: ['cod'], extra: ['steamedsoy', 'scallion', 'ginger'], time: 15, level: 1,
    steps: [
      '鳕鱼解冻后用厨房纸吸干水分，抹少许盐和料酒腌五分钟。',
      '盘底铺姜片葱段，放上鳕鱼，水开后大火蒸七分钟。',
      '倒掉盘里的水，去掉旧姜葱，重新铺一层葱丝。',
      '淋蒸鱼豉油，浇一勺烧到冒烟的热油。'
    ],
    tip: '鳕鱼肉嫩，蒸过八分钟就散了。'
  },
  {
    id: 'b11-xiangjianxueyu', name: '香煎鳕鱼', emoji: '🐟',
    need: ['cod'], extra: ['blackpepper', 'starch', 'wine'], time: 15, level: 1,
    steps: [
      '鳕鱼解冻吸干水分，用盐、料酒和黑胡椒腌十分钟。',
      '两面薄薄拍一层淀粉，抖掉多余的粉末。',
      '平底锅放少许油，中火下鱼煎三分钟再翻面。',
      '两面金黄后出锅，再撒一点黑胡椒碎。'
    ],
    tip: '解冻后用纸反复按压，越干越不粘锅。'
  },
  {
    id: 'b11-hongshaoxueyu', name: '红烧鳕鱼', emoji: '🐟',
    need: ['cod'], extra: ['ginger', 'scallion', 'wine'], time: 22, level: 2,
    steps: [
      '鳕鱼切大块，用料酒和姜片腌十分钟，吸干水分。',
      '锅中放油，鱼块下锅轻煎至表面微黄。',
      '加姜丝、生抽、老抽、糖和小半碗热水。',
      '小火焖八分钟，收浓汤汁，撒葱花。'
    ],
    tip: '鳕鱼易碎，用推锅代替铲子翻动。'
  },
  {
    id: 'b11-suanrongshenghao', name: '蒜蓉生蚝', emoji: '🐚',
    need: ['oysterraw'], extra: ['garlic', 'scallion', 'chilioil'], time: 20, level: 2,
    steps: [
      '生蚝用刷子刷净壳面泥沙，撬开壳，取出蚝肉冲洗干净。',
      '蚝肉放回壳内，用料酒和少许姜汁抓一下去腥。',
      '大蒜剁成蓉，一半用热油炒香，再与生蒜蓉、生抽拌匀。',
      '蒜蓉铺在蚝肉上，大火蒸八分钟，撒葱花淋辣椒油。'
    ],
    tip: '蚝肉边缘的黑膜要撕掉，腥味都在那。'
  },
  {
    id: 'b11-qingzhengshenghao', name: '清蒸生蚝', emoji: '🐚',
    need: ['oysterraw'], extra: ['ginger', 'scallion', 'steamedsoy'], time: 12, level: 1,
    steps: [
      '生蚝用硬刷刷洗外壳，冲净壳缝里的泥沙。',
      '蒸锅水烧开，生蚝平铺上锅，大火蒸六分钟至壳开。',
      '姜切细丝，葱切段，另用小碟调好蒸鱼豉油。',
      '出锅后剥开壳，淋豉油，配姜葱一起食用。'
    ],
    tip: '壳一开就是熟了，再蒸肉会缩成一小团。'
  },
  {
    id: 'b11-shenghaodoufu', name: '生蚝豆腐汤', emoji: '🍲',
    need: ['oysterraw', 'tofu'], extra: ['ginger', 'scallion', 'pepper'], time: 18, level: 1,
    steps: [
      '生蚝肉加少许盐和淀粉轻轻抓洗，冲净表面黏液。',
      '嫩豆腐切小方块，姜切细丝备用。',
      '锅中水烧开，下姜丝和豆腐煮五分钟。',
      '放生蚝肉煮两分钟至边缘卷起，加盐、白胡椒粉和葱花。'
    ],
    tip: '生蚝最后下，久煮会老得咬不动。'
  },
  {
    id: 'b11-shenghaojiandan', name: '生蚝煎蛋', emoji: '🍳',
    need: ['oysterraw', 'egg'], extra: ['scallion', 'starch', 'pepper'], time: 15, level: 2,
    steps: [
      '生蚝肉用盐和淀粉抓洗两遍，冲净后沥干水分。',
      '鸡蛋打散，加盐、白胡椒粉和葱花，再拌入生蚝。',
      '加一小勺淀粉水，让蛋液更容易成型。',
      '平底锅热油，倒入蛋液摊平，中小火煎至两面金黄。'
    ],
    tip: '生蚝先焯十秒再煎，不出水更好成型。'
  },
  {
    id: 'b11-congjiangchengzi', name: '葱姜炒蛏子', emoji: '🐚',
    need: ['razorclam'], extra: ['ginger', 'scallion', 'wine'], time: 15, level: 2,
    steps: [
      '蛏子放淡盐水里滴几滴油，静置两小时吐净泥沙。',
      '逐个冲洗外壳，剪掉露出的水管部分。',
      '锅中热油爆香姜丝和葱白，倒入蛏子大火翻炒。',
      '加料酒和少许盐，蛏壳全开后撒葱绿出锅。'
    ],
    tip: '吐沙的盐水别太咸，中途换一次水。'
  },
  {
    id: 'b11-fensizhengchengzi', name: '粉丝蒸蛏子', emoji: '🐚',
    need: ['razorclam', 'vermicelli'], extra: ['garlic', 'scallion', 'steamedsoy'], time: 20, level: 2,
    steps: [
      '蛏子用淡盐水加几滴油养两小时吐沙，刷净外壳。',
      '粉丝温水泡软，剪成短段铺在盘底。',
      '蛏子开口朝上摆在粉丝上，铺满炒香的蒜蓉。',
      '水开后大火蒸六分钟，淋蒸鱼豉油，撒葱花。'
    ],
    tip: '蛏子开口朝上摆，汤汁全流进粉丝里。'
  },
  {
    id: 'b11-lachaochengzi', name: '辣炒蛏子', emoji: '🌶️',
    need: ['razorclam'], extra: ['douban', 'driedchili', 'garlic'], time: 18, level: 2,
    steps: [
      '蛏子用盐水加几滴香油养两小时，刷洗干净外壳。',
      '锅中放油，小火炒香蒜末、干辣椒和豆瓣酱。',
      '倒入蛏子大火翻炒，沿锅边淋少许料酒去腥。',
      '蛏壳全部张开后收一下汤汁，撒葱花出锅。'
    ],
    tip: '煮完不开口的蛏子是死的，挑出来别吃。'
  },
  {
    id: 'b11-suanrongxiaolongxia', name: '蒜蓉小龙虾', emoji: '🦞',
    need: ['crayfish'], extra: ['garlic', 'beer', 'ginger'], time: 30, level: 3,
    steps: [
      '小龙虾用刷子逐只刷净腹部，剪掉虾头前端，抽出虾线。',
      '锅中多放油，小龙虾下锅炸两分钟至壳变红，捞出。',
      '一半蒜蓉小火炒香，下小龙虾，倒啤酒没过一半。',
      '加盐、糖和姜片焖十分钟，收汁后拌入生蒜蓉。'
    ],
    tip: '虾线从尾部中间一拧一拉就出来。'
  },
  {
    id: 'b11-malaxiaolongxia', name: '麻辣小龙虾', emoji: '🦞',
    need: ['crayfish'], extra: ['douban', 'sichuan', 'driedchili'], time: 35, level: 3,
    steps: [
      '小龙虾刷洗干净，剪去虾头尖部和鳃，抽出虾线。',
      '锅中热油，下花椒、干辣椒和豆瓣酱炒出红油。',
      '倒入小龙虾翻炒至壳变红，加料酒和热水没过虾身。',
      '大火烧开转中火焖十五分钟，收汁后撒葱花。'
    ],
    tip: '油要足、火要猛，麻辣味才裹得住壳。'
  },
  {
    id: 'b11-shisanxiangxiaolongxia', name: '十三香小龙虾', emoji: '🦞',
    need: ['crayfish'], extra: ['thirteen', 'ginger', 'driedchili'], time: 35, level: 3,
    steps: [
      '小龙虾刷净腹部泥垢，剪头去鳃，抽出虾线后冲洗。',
      '热油下姜片和干辣椒炒香，倒入小龙虾翻炒至变色。',
      '加十三香、生抽、糖和热水，水面没过虾身一半。',
      '中火焖十五分钟，转大火收汁至浓稠挂壳。'
    ],
    tip: '十三香分两次放，起锅前补一勺更香。'
  },
  {
    id: 'b11-pijiuxiaolongxia', name: '啤酒小龙虾', emoji: '🦞',
    need: ['crayfish'], extra: ['beer', 'ginger', 'garlic'], time: 35, level: 2,
    steps: [
      '小龙虾刷洗干净，剪去虾头前端，抽出虾线。',
      '锅中热油爆香姜蒜，下小龙虾翻炒至壳色变红。',
      '倒入一整罐啤酒，加盐和糖，大火烧开。',
      '中火焖十五分钟，开盖转大火收汁。'
    ],
    tip: '啤酒要没过虾身，酒气挥发后只留麦香。'
  },
  {
    id: 'b11-congshaohaishen', name: '葱烧海参', emoji: '🐚',
    need: ['seacucumber'], extra: ['scallion', 'ginger', 'oyster'], time: 30, level: 3,
    steps: [
      '泡发好的海参剪开腹部，去掉沙嘴和内筋，反复冲洗干净。',
      '锅中水加姜片烧开，海参下锅汆一分钟捞出沥干。',
      '大葱切段，用油小火煎至金黄出香，盛出备用。',
      '锅中加蚝油、生抽、糖和水，下海参小火煨十分钟，放回葱段收汁。'
    ],
    tip: '海参腹内白筋要去净，否则带沙腥味。'
  },
  {
    id: 'b11-haishenxiaomi', name: '海参小米粥', emoji: '🍚',
    need: ['seacucumber', 'millet'], extra: ['ginger', 'scallion', 'pepper'], time: 35, level: 1,
    steps: [
      '小米淘洗后泡二十分钟，海参切小段，姜切细丝。',
      '锅中水烧开下小米，小火煮二十分钟至米粒开花。',
      '加姜丝和海参段，转小火再煮八分钟，煮到粥稠。',
      '加盐和白胡椒粉调味，撒葱花出锅。'
    ],
    tip: '海参最后放，煮久会化得没有口感。'
  },
  {
    id: 'b11-haishenjitang', name: '海参鸡汤', emoji: '🍲',
    need: ['seacucumber', 'chickenleg'], extra: ['ginger', 'scallion', 'wine'], time: 35, level: 2,
    steps: [
      '鸡腿剁块冷水下锅，加姜片和料酒焯去血沫，捞出冲净。',
      '海参切段，用姜片水汆一下去腥。',
      '砂锅放鸡块和姜片，加足量热水，小火炖二十五分钟。',
      '下海参再炖八分钟，加盐调味，撒葱花。'
    ],
    tip: '水量一次加够，中途加水汤就寡了。'
  },
  {
    id: 'b11-yuwanziicai', name: '鱼丸紫菜汤', emoji: '🍲',
    need: ['fishball', 'seaweed'], extra: ['scallion', 'sesamoil', 'pepper'], time: 12, level: 1,
    steps: [
      '鱼丸用清水冲一下，紫菜撕成小片，小葱切成葱花。',
      '锅中水烧开，下鱼丸煮至全部浮起。',
      '放入紫菜煮一分钟，加盐和白胡椒粉调味。',
      '关火淋几滴芝麻油，撒葱花即可。'
    ],
    tip: '鱼丸浮起来就是熟了，别久煮。'
  },
  {
    id: 'b11-galiliyuwan', name: '咖喱鱼丸', emoji: '🍛',
    need: ['fishball', 'potato', 'onion'], extra: ['curry'], time: 25, level: 1,
    steps: [
      '鱼丸解冻，土豆去皮和洋葱一起切小块。',
      '锅中放油炒香洋葱，下土豆块翻炒两分钟。',
      '加水没过食材，煮十分钟至土豆变软。',
      '关小火放咖喱块搅化，下鱼丸煮五分钟收稠。'
    ],
    tip: '咖喱块最后放，火太大会糊底。'
  },
  {
    id: 'b11-yuwanbocai', name: '鱼丸菠菜汤', emoji: '🍲',
    need: ['fishball', 'spinach'], extra: ['ginger', 'scallion', 'pepper'], time: 12, level: 1,
    steps: [
      '菠菜洗净切段，用开水焯十秒去掉草酸，捞出过凉。',
      '锅中水加姜丝烧开，下鱼丸煮三分钟至浮起。',
      '放菠菜煮半分钟，加盐和白胡椒粉调味。',
      '撒葱花，滴两滴香油，趁热盛出食用。'
    ],
    tip: '菠菜先焯水，汤才不会发涩发黑。'
  },
  {
    id: 'b11-yuwanchumian', name: '鱼丸粗面', emoji: '🍜',
    need: ['fishball', 'noodle', 'bokchoy'], extra: ['scallion', 'sesamoil'], time: 15, level: 1,
    steps: [
      '鱼丸对半切开，小青菜洗净，小葱切花。',
      '锅中水烧开，下面条煮至八成熟。',
      '下鱼丸和小青菜，再煮三分钟至面条断生。',
      '加盐调味，盛碗后淋芝麻油、撒葱花。'
    ],
    tip: '鱼丸切开更容易煮透，也更入味。'
  },
  {
    id: 'b11-suanrongkaibeixia', name: '蒜蓉开背虾', emoji: '🦐',
    need: ['shrimp'], extra: ['garlic', 'steamedsoy', 'scallion'], time: 20, level: 2,
    steps: [
      '大虾剪去虾枪虾须，从背部剪开，挑出虾线冲洗干净。',
      '用刀背轻拍虾身，让虾平铺不卷曲。',
      '蒜蓉一半用油炒香，与生蒜蓉、生抽拌匀铺在虾背上。',
      '水开后大火蒸六分钟，撒葱花淋热油。'
    ],
    tip: '开背后虾线一挑就出，腥味也去得干净。'
  },
  {
    id: 'b11-yanshuixia', name: '盐水虾', emoji: '🦐',
    need: ['shrimp'], extra: ['ginger', 'scallion', 'sichuan'], time: 12, level: 1,
    steps: [
      '虾剪去虾须，用牙签从第二节挑出虾线，冲洗干净。',
      '锅中水加姜片、葱段和几粒花椒烧开。',
      '下虾煮两分钟，虾身变红卷曲立刻捞出。',
      '过一遍冰水沥干，配姜醋蘸汁上桌。'
    ],
    tip: '水开再下虾，两分钟足够，久了肉柴。'
  },
  {
    id: 'b11-siguachaoxiaren', name: '丝瓜炒虾仁', emoji: '🥒',
    need: ['shrimp', 'luffa'], extra: ['garlic', 'ginger', 'starch'], time: 15, level: 1,
    steps: [
      '虾去壳去虾线，用盐、料酒和淀粉抓匀腌十分钟。',
      '丝瓜去皮切滚刀块，泡在淡盐水里防止氧化发黑。',
      '锅中热油下虾仁滑散至变色，盛出备用。',
      '底油炒香蒜末，下丝瓜炒软，回锅虾仁加盐炒匀。'
    ],
    tip: '丝瓜别炒太久，断生就行，才清甜。'
  },
  {
    id: 'b11-huangjinxiaqiu', name: '黄金虾球', emoji: '🦐',
    need: ['shrimp', 'breadcrumb', 'egg'], extra: ['starch', 'pepper', 'mayo'], time: 30, level: 3,
    steps: [
      '虾去壳留尾，挑净虾线，用盐和料酒腌十分钟。',
      '虾身先裹一层淀粉，再蘸蛋液，最后滚满面包糠。',
      '锅中油烧至六成热，下虾球中小火炸两分钟。',
      '捞出放在厨房纸上沥油，配沙拉酱蘸食。'
    ],
    tip: '油温别太高，面包糠容易焦黑发苦。'
  },
  {
    id: 'b11-xiangjianxiahuabing', name: '香煎虾滑饼', emoji: '🍤',
    need: ['shrimppaste'], extra: ['starch', 'pepper', 'scallion'], time: 18, level: 2,
    steps: [
      '虾滑解冻后加淀粉、白胡椒粉和葱花，顺一个方向搅上劲。',
      '手上抹点水，把虾滑团成小饼，厚度约一厘米。',
      '平底锅放薄油，中小火下饼，煎三分钟再翻面。',
      '两面金黄鼓起，按压有弹性即可出锅。'
    ],
    tip: '手上沾水再团，虾滑不粘手。'
  },
  {
    id: 'b11-suantangxiaohua', name: '酸汤虾滑', emoji: '🍤',
    need: ['shrimppaste', 'enoki'], extra: ['pickledchili', 'garlic', 'ginger'], time: 20, level: 2,
    steps: [
      '虾滑解冻，金针菇去根撕散洗净。',
      '锅中放油炒香蒜末、姜末和泡椒，加水烧开。',
      '下金针菇煮三分钟，转小火把虾滑挤成小条下锅。',
      '虾滑全部浮起后加盐调味，撒葱花。'
    ],
    tip: '虾滑下锅后别搅动，定型了再轻推。'
  },
  {
    id: 'b11-duojiaozhengluyu', name: '剁椒蒸鲈鱼', emoji: '🐟',
    need: ['fish'], extra: ['choppedchili', 'ginger', 'scallion'], time: 20, level: 1,
    steps: [
      '鲈鱼去鳞去内脏，刮净腹内黑膜，两面各划三刀。',
      '鱼身抹盐和料酒，盘底垫姜片，腌十分钟。',
      '剁椒拌少许油铺在鱼身上，水开后大火蒸八分钟。',
      '倒掉盘中水，撒葱花，淋一勺热油。'
    ],
    tip: '剁椒本身有咸味，盐要少放一点。'
  },
  {
    id: 'b11-chizhizhengluyu', name: '豉汁蒸鲈鱼', emoji: '🐟',
    need: ['fish'], extra: ['douchi', 'ginger', 'scallion'], time: 20, level: 1,
    steps: [
      '鲈鱼处理干净，腹内黑膜刮掉，两面划刀。',
      '豆豉剁碎，与姜末、生抽、少许糖拌匀。',
      '鱼抹料酒腌十分钟，把豉汁铺在鱼身上。',
      '水开后大火蒸八分钟，撒葱花淋热油。'
    ],
    tip: '豆豉先剁碎再拌，香味才出得来。'
  },
  {
    id: 'b11-jiaoyandaiyu', name: '椒盐带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['peppersalt', 'starch', 'wine'], time: 25, level: 2,
    steps: [
      '带鱼去头去内脏，剪开腹部刮净黑膜，切六厘米长段。',
      '用料酒、姜片和少许盐腌十五分钟，擦干水分。',
      '带鱼段薄拍一层淀粉，抖掉多余粉末。',
      '油锅六成热下带鱼炸至金黄，捞出撒椒盐。'
    ],
    tip: '带鱼表面银膜别刮掉，那是鲜味所在。'
  },
  {
    id: 'b11-suangshaodaiyu', name: '蒜烧带鱼', emoji: '🐟',
    need: ['hairtail'], extra: ['garlic', 'ginger', 'scallion'], time: 25, level: 2,
    steps: [
      '带鱼处理干净切段，用料酒和姜片腌十分钟。',
      '带鱼段下锅煎至两面微黄，盛出备用。',
      '锅中留油，下整瓣大蒜小火煎香至微黄。',
      '加生抽、糖和热水，放回带鱼焖十分钟收汁。'
    ],
    tip: '蒜要多放，煎到微黄才没有生辣味。'
  },
  {
    id: 'b11-heijiaosanwenyu', name: '黑椒三文鱼', emoji: '🐟',
    need: ['salmon'], extra: ['blackpepper', 'starch', 'oyster'], time: 18, level: 2,
    steps: [
      '三文鱼解冻吸干水分，切厚块，用盐和黑胡椒腌十分钟。',
      '表面薄拍一层淀粉，锁住鱼肉水分。',
      '平底锅放少许油，鱼块下锅中火煎两分钟再翻面。',
      '加蚝油和少许水调成汁淋上，再撒黑胡椒。'
    ],
    tip: '三文鱼别煎全熟，中间微粉最嫩。'
  },
  {
    id: 'b11-sanwenyushala', name: '三文鱼沙拉', emoji: '🥗',
    need: ['salmon', 'lettuce', 'tomato'], extra: ['blackpepper', 'mayo'], time: 12, level: 1,
    steps: [
      '三文鱼切厚片，用盐和黑胡椒腌五分钟。',
      '平底锅少油，两面各煎一分钟至表面变色，取出晾凉。',
      '生菜撕小片，番茄切块，一起放进大碗。',
      '摆上三文鱼，淋沙拉酱，撒黑胡椒。'
    ],
    tip: '煎好放凉再拌，生菜才不会塌。'
  },
  {
    id: 'b11-baizhuoyouyu', name: '白灼鱿鱼', emoji: '🦑',
    need: ['squid'], extra: ['ginger', 'scallion', 'steamedsoy'], time: 15, level: 2,
    steps: [
      '鱿鱼撕去表面紫膜，去掉软骨和内脏，冲洗干净。',
      '鱿鱼身切花刀再切块，鱿鱼须切成段。',
      '锅中水加姜片和料酒烧开，下鱿鱼汆四十秒至卷曲。',
      '立刻捞出过冰水，配姜葱豉油蘸食。'
    ],
    tip: '汆水超过一分钟就老，卷起马上捞。'
  },
  {
    id: 'b11-tiebanyouyu', name: '铁板鱿鱼', emoji: '🦑',
    need: ['squid', 'onion'], extra: ['cumin', 'chilipowder', 'chilioil'], time: 20, level: 2,
    steps: [
      '鱿鱼去膜去内脏，切条，用料酒和盐腌十分钟。',
      '洋葱切丝，平底锅烧到冒烟，刷一层薄油。',
      '下鱿鱼大火快煎，用铲子压出水分，煎至边缘微焦。',
      '加洋葱丝、孜然和辣椒面翻匀，淋辣椒油出锅。'
    ],
    tip: '锅一定要烧够热，鱿鱼才不出水变韧。'
  },
  {
    id: 'b11-ganguoyouyu', name: '干锅鱿鱼', emoji: '🌶️',
    need: ['squid', 'greenpepper', 'onion'], extra: ['douban', 'driedchili', 'garlic'], time: 25, level: 2,
    steps: [
      '鱿鱼去膜切圈，用料酒腌十分钟；青椒洋葱切块。',
      '鱿鱼下开水汆二十秒，捞出沥干水分。',
      '锅中热油，炒香蒜片、干辣椒和豆瓣酱。',
      '下青椒洋葱炒断生，加鱿鱼大火翻炒，收干汤汁。'
    ],
    tip: '鱿鱼先汆后炒，出锅不出水。'
  },
  {
    id: 'b11-jiucaichaohage', name: '韭菜炒花蛤', emoji: '🐚',
    need: ['clam', 'chive'], extra: ['ginger', 'garlic', 'wine'], time: 18, level: 2,
    steps: [
      '花蛤放盐水里滴几滴油，养两小时吐净泥沙。',
      '花蛤下开水汆至壳开，捞出取肉，用清水冲掉残沙。',
      '韭菜切段，锅中热油爆香姜末和蒜片。',
      '下花蛤肉大火炒半分钟，加韭菜和盐炒匀出锅。'
    ],
    tip: '汆过再炒，沙子不会混进菜里。'
  },
  {
    id: 'b11-hagegedatang', name: '花蛤疙瘩汤', emoji: '🍲',
    need: ['clam', 'flour', 'tomato'], extra: ['ginger', 'scallion', 'pepper'], time: 25, level: 2,
    steps: [
      '花蛤盐水养两小时吐沙，下开水汆至开口，取肉留汤。',
      '面粉加少许水，用筷子一点点搅成小疙瘩。',
      '锅中放油炒软番茄，倒入花蛤汤和清水烧开。',
      '下疙瘩煮五分钟，放花蛤肉，加盐、白胡椒粉和葱花。'
    ],
    tip: '疙瘩要一点点滴水搅，颗粒才均匀。'
  },
  {
    id: 'b11-zhishishanbei', name: '芝士焗扇贝', emoji: '🐚',
    need: ['scallop'], extra: ['cheese', 'garlic', 'mayo'], time: 22, level: 2,
    steps: [
      '扇贝刷净外壳，取出贝肉，去掉黑色内脏团，冲洗干净。',
      '贝肉放回壳中，用料酒和少许盐腌五分钟。',
      '蒜末用油炒香，拌入沙拉酱铺在贝肉上。',
      '盖一片芝士，烤箱两百度烤八分钟至表面金黄。'
    ],
    tip: '贝肉周围那圈黑膜要撕掉，腥味重。'
  },
  {
    id: 'b11-shanbeichaolusun', name: '扇贝炒芦笋', emoji: '🐚',
    need: ['scallop', 'asparagus'], extra: ['garlic', 'oyster', 'starch'], time: 18, level: 2,
    steps: [
      '扇贝肉去内脏，用盐和淀粉轻抓，冲净表面黏液。',
      '芦笋削去老皮，斜切段，下开水焯三十秒捞出。',
      '锅中热油下扇贝快速滑炒至变白，盛出。',
      '炒香蒜末，下芦笋和扇贝，加蚝油翻匀。'
    ],
    tip: '芦笋焯水时加几滴油，颜色更绿。'
  },
  {
    id: 'b11-xianglaxie', name: '香辣蟹', emoji: '🦀',
    need: ['crab'], extra: ['douban', 'driedchili', 'ginger'], time: 30, level: 3,
    steps: [
      '螃蟹刷净外壳，掀开蟹壳，去掉蟹鳃和胃袋，斩成四块。',
      '切口处蘸一层淀粉，防止下锅时蟹黄流失。',
      '锅中多放油，蟹块切面朝下煎至定型变红，盛出。',
      '炒香姜片、干辣椒和豆瓣酱，回锅蟹块，加料酒焖五分钟。'
    ],
    tip: '蟹鳃是灰白色羽毛状，一定要去干净。'
  },
  {
    id: 'b11-pangxiechaoniangao', name: '螃蟹炒年糕', emoji: '🦀',
    need: ['crab', 'ricecake'], extra: ['ginger', 'scallion', 'oyster'], time: 30, level: 3,
    steps: [
      '螃蟹刷净斩块，切口蘸淀粉；年糕片用温水泡软。',
      '锅中热油，蟹块切面朝下煎至变红定型。',
      '下姜片爆香，加料酒、生抽和热水烧开。',
      '放年糕片小火焖八分钟至软糯，收汁撒葱花。'
    ],
    tip: '年糕先泡软，才不会吸干汤汁粘锅。'
  },
  {
    id: 'b11-pangxiezhou', name: '螃蟹粥', emoji: '🍚',
    need: ['crab', 'rice'], extra: ['ginger', 'scallion', 'pepper'], time: 35, level: 2,
    steps: [
      '大米淘洗后加少许油和盐拌匀，泡二十分钟。',
      '螃蟹刷净斩块，去掉蟹鳃和胃袋，切口蘸淀粉。',
      '锅中水烧开下米，小火煮二十分钟至米粒开花。',
      '下蟹块和姜丝煮八分钟，加盐、白胡椒粉，撒葱花。'
    ],
    tip: '蟹下锅后不要久搅，蟹肉才成块。'
  },
  {
    id: 'b12-sanzi-zhengdan', name: '三色蒸蛋', emoji: '🥚',
    need: ['egg', 'centuryegg', 'saltedegg'], extra: ['sesamoil', 'scallion'], time: 18, level: 1,
    steps: [
      '皮蛋和熟咸鸭蛋各剥壳切小丁，铺在深盘底部。',
      '鸡蛋三个打散，加半碗温水搅匀后过筛去泡沫。',
      '蛋液倒入盘中，盖保鲜膜扎孔，中火蒸十分钟。',
      '出锅淋半勺生抽和几滴芝麻油，撒葱花即可。'
    ],
    tip: '温水是蛋液的一倍半，蒸出来才嫩滑无孔。'
  },
  {
    id: 'b12-doufu-zhengdangeng', name: '豆腐蒸蛋羹', emoji: '🍮',
    need: ['tofu', 'egg', 'driedshrimp'], extra: ['sesamoil', 'scallion'], time: 16, level: 1,
    steps: [
      '嫩豆腐切小块铺碗底，虾皮用温水泡两分钟沥干。',
      '两个鸡蛋加等量温水打散过筛，倒入豆腐碗中。',
      '撒上虾皮，盖保鲜膜扎几个孔，中小火蒸十二分钟。',
      '淋少许生抽和芝麻油，撒葱花趁热吃。'
    ],
    tip: '虾皮本身有咸味，生抽别放多。'
  },
  {
    id: 'b12-xiapi-zhengdan', name: '虾皮蒸蛋', emoji: '🥚',
    need: ['egg', 'driedshrimp'], extra: ['sesamoil', 'scallion'], time: 14, level: 1,
    steps: [
      '虾皮一小把用清水冲净，挤干水分备用。',
      '鸡蛋两个加温水打匀过筛，倒入浅碗。',
      '蛋液上撒虾皮，盖保鲜膜后扎几个小孔。',
      '水开后中小火蒸十分钟，出锅淋生抽和香油。'
    ],
    tip: '蒸锅水烧开再放碗，蛋面才平整。'
  },
  {
    id: 'b12-xianggu-zhengdan', name: '香菇蒸蛋', emoji: '🍄',
    need: ['egg', 'shiitake'], extra: ['sesamoil', 'scallion'], time: 18, level: 1,
    steps: [
      '香菇两朵去蒂切薄片，用少许油煸半分钟出香。',
      '鸡蛋三个加温水打散过筛，倒入碗中。',
      '铺上香菇片，盖膜扎孔，中火蒸十二分钟。',
      '淋一勺生抽，撒上葱花即可上桌。'
    ],
    tip: '香菇先煸过再蒸，香味更浓不寡淡。'
  },
  {
    id: 'b12-xiaren-zhengdan', name: '虾仁蒸蛋', emoji: '🍤',
    need: ['egg', 'shrimp'], extra: ['wine', 'starch', 'scallion'], time: 16, level: 2,
    steps: [
      '虾仁六只去虾线，用料酒和淀粉抓匀腌五分钟。',
      '鸡蛋三个加温水打散过筛，倒入平底碗。',
      '盖膜中火蒸八分钟，蛋液半凝固时摆上虾仁。',
      '再蒸四分钟，淋生抽和香油出锅。'
    ],
    tip: '虾仁后放才不会沉底，口感也嫩。'
  },
  {
    id: 'b12-xiandan-zhengroubing', name: '咸蛋蒸肉饼', emoji: '🍳',
    need: ['saltedegg', 'mincedpork'], extra: ['starch', 'sesamoil', 'ginger'], time: 22, level: 1,
    steps: [
      '猪肉末二百克加一勺淀粉、少许生抽顺向搅上劲。',
      '肉末铺在盘里压成薄饼，中间按两个小窝。',
      '磕入两个生咸鸭蛋，蛋黄留在窝里。',
      '水开后中火蒸十五分钟，撒葱花出锅。'
    ],
    tip: '肉饼别压太厚，两厘米内才熟得均匀。'
  },
  {
    id: 'b12-jinxiangu-danbing', name: '金针菇蛋饼', emoji: '🍳',
    need: ['enoki', 'egg', 'flour'], extra: ['pepper', 'oyster'], time: 15, level: 1,
    steps: [
      '金针菇一小把切去根部，撕散后焯水一分钟捞出。',
      '两个鸡蛋加三勺面粉和少许盐，调成稀糊。',
      '拌入金针菇，平底锅刷油倒入摊平。',
      '小火煎三分钟至底面定型，翻面再煎两分钟。'
    ],
    tip: '面糊调到能缓慢流动，摊出来才薄。'
  },
  {
    id: 'b12-jiuxiang-danbing', name: '韭香蛋饼', emoji: '🌿',
    need: ['chive', 'egg', 'flour'], extra: ['pepper'], time: 15, level: 1,
    steps: [
      '韭菜一小把洗净切碎，加两个鸡蛋和三勺面粉。',
      '加少许盐和半碗水，搅成无颗粒的面糊。',
      '平底锅烧热刷薄油，倒入面糊转圈摊开。',
      '小火煎至两面金黄，卷起后切段装盘。'
    ],
    tip: '韭菜最后拌入面糊，久放会出水。'
  },
  {
    id: 'b12-huluobo-danbing', name: '胡萝卜蛋饼', emoji: '🥕',
    need: ['carrot', 'egg', 'flour'], extra: ['pepper', 'scallion'], time: 16, level: 1,
    steps: [
      '胡萝卜半根擦成细丝，用少许油炒软盛出。',
      '加两个鸡蛋、三勺面粉和少许盐拌成糊。',
      '平底锅刷油，倒入面糊用铲子摊成圆饼。',
      '小火两面各煎三分钟，切块装盘。'
    ],
    tip: '胡萝卜先炒软，饼才不会发硬。'
  },
  {
    id: 'b12-xiahua-danbing', name: '虾滑蛋饼', emoji: '🍤',
    need: ['shrimppaste', 'egg'], extra: ['starch', 'pepper'], time: 18, level: 2,
    steps: [
      '虾滑一百克加少许白胡椒粉，顺向搅打到发黏。',
      '三个鸡蛋打散，加一勺淀粉水搅匀。',
      '平底锅刷油，倒入一半蛋液摊成薄饼。',
      '铺上虾滑抹平，卷起后小火再煎三分钟切段。'
    ],
    tip: '虾滑铺薄一点，卷的时候不易散。'
  },
  {
    id: 'b12-xihulu-danbing', name: '西葫芦蛋饼', emoji: '🥒',
    need: ['zucchini', 'egg', 'flour'], extra: ['pepper'], time: 16, level: 1,
    steps: [
      '西葫芦半根擦丝，加少许盐腌五分钟挤干水。',
      '加两个鸡蛋、四勺面粉拌成稠糊。',
      '平底锅刷油，舀一勺面糊摊成小圆饼。',
      '小火两面各煎三分钟，煎到金黄焦香。'
    ],
    tip: '西葫芦一定挤干水，饼才不成糊。'
  },
  {
    id: 'b12-pijiu-ludan', name: '啤酒卤蛋', emoji: '🍺',
    need: ['egg'], extra: ['staranise', 'rocksugar', 'ginger'], time: 30, level: 1,
    steps: [
      '鸡蛋八个冷水下锅，水开煮八分钟，捞出过凉剥壳。',
      '用刀在蛋身划两三道浅刀口，方便入味。',
      '锅里放半罐啤酒、两勺生抽、一颗八角和小块冰糖。',
      '放入鸡蛋小火煮十五分钟，关火泡半小时。'
    ],
    tip: '卤好别急着捞，泡一夜颜色更深。'
  },
  {
    id: 'b12-xiangla-ludan', name: '香辣卤蛋', emoji: '🌶️',
    need: ['egg'], extra: ['sichuan', 'staranise', 'rocksugar'], time: 28, level: 2,
    steps: [
      '鸡蛋六个煮熟剥壳，表面划几道浅口。',
      '锅中少油，下干辣椒、花椒和姜片小火炒香。',
      '加两碗水、两勺生抽和一块冰糖煮开。',
      '下鸡蛋小火卤二十分钟，收汁至浓稠。'
    ],
    tip: '辣椒花椒要小火焙香，炒糊会发苦。'
  },
  {
    id: 'b12-kele-quail', name: '可乐鹌鹑蛋', emoji: '🥚',
    need: ['quaillegg'], extra: ['staranise', 'sesame', 'cola'], time: 25, level: 1,
    steps: [
      '鹌鹑蛋二十个冷水下锅，煮五分钟捞出过凉剥壳。',
      '剥好的蛋用牙签在表面扎几个小孔。',
      '锅中倒入半罐可乐，加一勺生抽和一片姜。',
      '下鹌鹑蛋小火煮十分钟，大火收汁裹匀。'
    ],
    tip: '可乐本身够甜，不用再加糖。'
  },
  {
    id: 'b12-wuxiang-dougan', name: '五香卤豆干', emoji: '🍢',
    need: ['driedtofu'], extra: ['fivespice', 'staranise', 'rocksugar'], time: 28, level: 1,
    steps: [
      '豆干六块切厚片，用开水焯两分钟去豆腥。',
      '锅中放两碗水，加五香粉、八角、桂皮和冰糖。',
      '加两勺生抽煮开，放入豆干小火卤十五分钟。',
      '关火后浸泡半小时，捞出沥干切片。'
    ],
    tip: '卤好连汤放凉，泡着才越吃越有味。'
  },
  {
    id: 'b12-jiaoyan-jiandoufu', name: '椒盐煎豆腐', emoji: '🍳',
    need: ['firmtofu'], extra: ['peppersalt', 'scallion'], time: 14, level: 1,
    steps: [
      '老豆腐一块切一厘米厚片，用厨房纸吸干表面水。',
      '平底锅多放些油，中火下豆腐片煎至底面金黄。',
      '翻面再煎三分钟，两面都煎出硬壳。',
      '撒上椒盐和葱花，颠锅拌匀后出锅装盘。'
    ],
    tip: '豆腐一定吸干水，下锅才不溅油。'
  },
  {
    id: 'b12-ziran-jiandoufu', name: '孜然煎豆腐', emoji: '🍢',
    need: ['firmtofu'], extra: ['cumin', 'chilipowder', 'scallion'], time: 15, level: 1,
    steps: [
      '老豆腐切厚片，两面拍一层薄薄的干淀粉。',
      '平底锅热油，中火煎至两面金黄酥脆。',
      '倒掉多余油，撒孜然粉和辣椒面。',
      '小火翻匀让调料裹住豆腐，撒葱花出锅。'
    ],
    tip: '拍层淀粉再煎，外皮更脆更挂味。'
  },
  {
    id: 'b12-suanxiang-jiandoufu', name: '蒜香煎豆腐', emoji: '🧄',
    need: ['firmtofu'], extra: ['oyster', 'scallion', 'garlic'], time: 18, level: 1,
    steps: [
      '老豆腐切方块，用淡盐水泡五分钟捞出沥干。',
      '平底锅少油，中火把豆腐煎至六面微黄。',
      '另起锅下蒜末小火炒香，加一勺蚝油和小半碗水。',
      '倒入豆腐小火焖三分钟，收汁撒葱花。'
    ],
    tip: '蒜末要小火慢炒，火大容易发苦。'
  },
  {
    id: 'b12-danjian-riben', name: '蛋煎日本豆腐', emoji: '🍥',
    need: ['eggtofu', 'egg'], extra: ['starch', 'pepper', 'scallion'], time: 16, level: 2,
    steps: [
      '日本豆腐切两厘米段，表面裹一层干淀粉。',
      '鸡蛋一个打散，把豆腐段在蛋液里滚一圈。',
      '平底锅热油，中火下豆腐煎至表面金黄。',
      '撒白胡椒粉和葱花，淋少许生抽出锅。'
    ],
    tip: '日本豆腐很嫩，用铲子轻推别翻搅。'
  },
  {
    id: 'b12-baicai-youzhafu', name: '白菜油豆腐煲', emoji: '🍲',
    need: ['friedtofu', 'cabbage'], extra: ['oyster', 'garlic'], time: 20, level: 1,
    steps: [
      '油豆腐八个对半切开，白菜半棵切大片。',
      '砂锅少油下蒜末炒香，铺入白菜帮炒软。',
      '放油豆腐和白菜叶，加一碗水和一勺蚝油。',
      '盖盖中小火焖十分钟，收汁即可上桌。'
    ],
    tip: '油豆腐先切开会吸汤，咬开才不烫嘴。'
  },
  {
    id: 'b12-youzhafu-shaorou', name: '油豆腐烧肉', emoji: '🍖',
    need: ['friedtofu', 'porkbelly'], extra: ['staranise', 'rocksugar'], time: 35, level: 2,
    steps: [
      '五花肉三百克切块，冷水下锅焯水后沥干。',
      '锅中不放油，下肉块小火煸出油，加冰糖炒色。',
      '加两勺生抽、一颗八角和热水没过肉，小火炖二十分钟。',
      '放油豆腐再炖十分钟，大火收汁。'
    ],
    tip: '油豆腐后放，炖太久会烂成渣。'
  },
  {
    id: 'b12-xianxia-doufubao', name: '鲜虾豆腐煲', emoji: '🍲',
    need: ['shrimp', 'tofu', 'enoki'], extra: ['oyster', 'wine', 'scallion'], time: 20, level: 2,
    steps: [
      '虾八只去壳留尾，用料酒和白胡椒腌五分钟。',
      '嫩豆腐切块，金针菇去根撕散铺砂锅底。',
      '放豆腐，加一碗高汤或清水，中火煮八分钟。',
      '下虾仁再煮三分钟，加蚝油调味撒葱花。'
    ],
    tip: '虾最后下，煮久了肉就老了。'
  },
  {
    id: 'b12-moyu-doufubao', name: '魔芋豆腐煲', emoji: '🍲',
    need: ['konjac', 'tofu'], extra: ['douban', 'garlic', 'scallion'], time: 20, level: 1,
    steps: [
      '魔芋一块切条，用开水焯三分钟去碱味。',
      '嫩豆腐切块，砂锅少油下蒜末和豆瓣酱炒香。',
      '加两碗水煮开，放魔芋和豆腐小火炖十分钟。',
      '淋少许水淀粉勾薄芡，撒葱花出锅。'
    ],
    tip: '魔芋焯水这一步别省，不然有涩味。'
  },
  {
    id: 'b12-paoduan-moyu', name: '泡椒魔芋', emoji: '🌶️',
    need: ['konjac'], extra: ['garlic', 'sichuan', 'pickledchili'], time: 15, level: 1,
    steps: [
      '魔芋切细条，焯水两分钟后沥干备用。',
      '锅中热油，下泡椒段、蒜末和几粒花椒炒香。',
      '倒入魔芋条，大火翻炒两分钟至干爽。',
      '加少许生抽和半勺糖，炒匀收干出锅。'
    ],
    tip: '魔芋不出水，炒到锅底干爽才够味。'
  },
  {
    id: 'b12-moyu-paigu', name: '魔芋排骨汤', emoji: '🥣',
    need: ['konjac', 'ribs'], extra: ['ginger', 'wine'], time: 40, level: 1,
    steps: [
      '排骨四百克冷水下锅焯去血沫，捞出冲净。',
      '砂锅放排骨、姜片和一勺料酒，加足量水烧开。',
      '转小火炖四十分钟，撇净表面浮油。',
      '魔芋切条焯水后放入，再煮十分钟，加盐。'
    ],
    tip: '水一次加足，中途添水汤会变淡。'
  },
  {
    id: 'b12-liangban-mianjin', name: '凉拌面筋', emoji: '🥗',
    need: ['gluten', 'cucumber'], extra: ['tahini', 'garlic', 'chilioil'], time: 12, level: 1,
    steps: [
      '面筋两块撕成条，入开水焯一分钟捞出过凉。',
      '黄瓜半根拍碎切段，和面筋一起放碗里。',
      '芝麻酱两勺用温水澥开，加蒜末和辣椒油。',
      '把料汁浇在面筋上拌匀，撒香菜。'
    ],
    tip: '面筋焯后要挤干水，拌酱才挂得住。'
  },
  {
    id: 'b12-mianjin-sairou', name: '面筋塞肉', emoji: '🍢',
    need: ['gluten', 'mincedpork'], extra: ['ginger', 'starch', 'staranise'], time: 30, level: 2,
    steps: [
      '猪肉末二百克加姜末、淀粉和生抽搅上劲。',
      '面筋球用手指捅个小洞，把肉馅塞进去。',
      '锅中放生抽、八角和一碗水烧开。',
      '放入面筋球小火焖二十分钟，收汁。'
    ],
    tip: '肉馅别塞太满，煮的时候会胀破。'
  },
  {
    id: 'b12-tangcu-mianjin', name: '糖醋面筋', emoji: '🍯',
    need: ['gluten'], extra: ['ketchup', 'whitevinegar', 'sesame'], time: 18, level: 2,
    steps: [
      '面筋撕成小块，挤干水分后拍一层干淀粉。',
      '六成热油下锅炸至外壳微硬，捞出控油。',
      '锅留底油，加番茄酱、白醋和糖小火熬稠。',
      '倒入面筋快速翻匀，撒芝麻出锅。'
    ],
    tip: '糖醋汁熬到冒小泡再下面筋才挂得住。'
  },
  {
    id: 'b12-qingjiao-mianjin', name: '青椒炒面筋', emoji: '🌶️',
    need: ['gluten', 'greenpepper'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '面筋三块撕条，青椒两个切菱形片。',
      '锅中热油下蒜末炒香，先放青椒大火炒一分钟。',
      '倒入面筋继续大火翻炒两分钟至软。',
      '加一勺生抽和少许盐，炒匀出锅。'
    ],
    tip: '青椒断生就够，炒久颜色发黄。'
  },
  {
    id: 'b12-xiangla-doufupi', name: '香辣豆腐皮', emoji: '🌶️',
    need: ['tofuskin'], extra: ['chilioil', 'garlic', 'sesame'], time: 10, level: 1,
    steps: [
      '豆腐皮两张切细丝，开水焯一分钟捞出过凉。',
      '碗中放辣椒油、蒜末、生抽和少许糖。',
      '把豆腐皮丝放入料汁中充分拌匀。',
      '撒白芝麻和香菜段，冷藏十分钟更入味。'
    ],
    tip: '焯过的豆腐皮不干硬，拌着更顺口。'
  },
  {
    id: 'b12-doufupi-danhuatang', name: '豆腐皮蛋花汤', emoji: '🥣',
    need: ['tofuskin', 'egg'], extra: ['starch', 'sesamoil', 'scallion'], time: 12, level: 1,
    steps: [
      '豆腐皮一张切细丝，用温水泡软。',
      '锅中两碗水烧开，下豆腐皮煮三分钟。',
      '加少许盐和白胡椒粉，淋入水淀粉勾薄芡。',
      '鸡蛋一个打散画圈淋入，凝固后关火淋香油。'
    ],
    tip: '勾薄芡再淋蛋液，蛋花才成片不散。'
  },
  {
    id: 'b12-doufupi-juanjin', name: '豆腐皮卷金针', emoji: '🌿',
    need: ['tofuskin', 'enoki'], extra: ['steamedsoy', 'scallion', 'garlic'], time: 18, level: 1,
    steps: [
      '金针菇一把去根撕散，焯水一分钟后挤干。',
      '豆腐皮切成长方片，铺上金针菇卷紧。',
      '上锅大火蒸六分钟，取出稍晾定形。',
      '淋一勺蒸鱼豉油，撒葱花，浇一勺热油。'
    ],
    tip: '卷紧一点再蒸，切段时才不散。'
  },
  {
    id: 'b12-xiahua-doufugeng', name: '虾滑豆腐羹', emoji: '🥣',
    need: ['shrimppaste', 'tofu'], extra: ['starch', 'pepper', 'scallion'], time: 18, level: 1,
    steps: [
      '嫩豆腐半盒切小丁，放淡盐水里泡着。',
      '锅中两碗水烧开，下豆腐丁煮三分钟。',
      '虾滑一百克挤成小丸子下锅，煮到浮起。',
      '淋水淀粉勾芡，加盐和白胡椒粉，撒葱花。'
    ],
    tip: '勺子沾水再挤虾滑，丸子更圆。'
  },
  {
    id: 'b12-xiandan-bandoufu', name: '咸蛋拌豆腐', emoji: '🥚',
    need: ['saltedegg', 'tofu'], extra: ['sesamoil', 'scallion'], time: 8, level: 1,
    steps: [
      '熟咸鸭蛋两个剥壳，蛋白切碎、蛋黄压成泥。',
      '嫩豆腐一盒倒扣盘中，用刀划成小块。',
      '把咸蛋碎和蛋黄泥均匀铺在豆腐上。',
      '淋芝麻油和少许生抽，撒葱花拌匀吃。'
    ],
    tip: '咸蛋本身够咸，生抽只点几滴。'
  },
  {
    id: 'b12-xiandan-huang-kugua', name: '咸蛋黄焗苦瓜', emoji: '🍳',
    need: ['saltedegg', 'bittergourd'], extra: [], time: 16, level: 2,
    steps: [
      '苦瓜一根剖开去瓤切薄片，用盐腌五分钟冲净。',
      '再下开水焯一分钟捞出，挤干水分。',
      '咸蛋黄三个压碎，锅中少油小火炒至起泡。',
      '倒入苦瓜大火翻炒，让蛋黄裹匀即可。'
    ],
    tip: '蛋黄要炒到冒细泡才香，火大发苦。'
  },
  {
    id: 'b12-pidan-banhuanggua', name: '皮蛋拌黄瓜', emoji: '🥒',
    need: ['centuryegg', 'cucumber'], extra: ['garlic', 'chilioil'], time: 8, level: 1,
    steps: [
      '皮蛋两个剥壳切瓣，黄瓜一根拍碎切段。',
      '蒜三瓣捣成泥，加生抽、醋和辣椒油调成汁。',
      '皮蛋和黄瓜放碗中，倒入调好的料汁。',
      '撒上香菜拌匀，静置五分钟更入味。'
    ],
    tip: '皮蛋用线勒开，刀切容易粘蛋黄。'
  },
  {
    id: 'b12-quail-shaorou', name: '鹌鹑蛋烧肉', emoji: '🍖',
    need: ['quaillegg', 'porkbelly'], extra: ['staranise', 'rocksugar'], time: 38, level: 2,
    steps: [
      '鹌鹑蛋十六个煮熟剥壳，五花肉三百克切块。',
      '锅中下肉块小火煸出油，加冰糖炒至上色。',
      '加生抽、一颗八角和热水，小火炖二十五分钟。',
      '放鹌鹑蛋再烧十分钟，大火收汁。'
    ],
    tip: '鹌鹑蛋表面划两刀，更容易吸汁。'
  },
  {
    id: 'b12-quail-shaochibang', name: '鹌鹑蛋烧鸡翅', emoji: '🍗',
    need: ['quaillegg', 'chickenwing'], extra: ['wine', 'ginger', 'rocksugar'], time: 32, level: 2,
    steps: [
      '鸡翅八个两面划刀，冷水下锅焯水后擦干。',
      '锅中少油把鸡翅煎至两面微黄，加姜片炒香。',
      '加生抽、料酒和一碗水，小火焖十五分钟。',
      '放入煮好剥壳的鹌鹑蛋十个，再烧八分钟收汁。'
    ],
    tip: '鸡翅先煎出油，皮更香也不腥。'
  },
  {
    id: 'b12-fuzhu-donggua', name: '腐竹烧冬瓜', emoji: '🍲',
    need: ['fuzhu', 'wintermelon'], extra: ['oyster', 'garlic', 'scallion'], time: 22, level: 1,
    steps: [
      '腐竹三根用温水泡软，切段挤干水。',
      '冬瓜四百克去皮去瓤，切成厚片。',
      '锅中热油下蒜末炒香，放冬瓜翻炒两分钟。',
      '加腐竹、一碗水和一勺蚝油，小火焖十分钟。'
    ],
    tip: '腐竹用温水泡，热水泡容易外烂内硬。'
  },
  {
    id: 'b12-riben-doufugeng', name: '日本豆腐羹', emoji: '🥣',
    need: ['eggtofu', 'corn'], extra: ['starch', 'pepper', 'scallion'], time: 15, level: 1,
    steps: [
      '日本豆腐两条切小丁，玉米粒半碗解冻备用。',
      '锅中两碗水烧开，下玉米粒煮三分钟。',
      '放豆腐丁，加盐和白胡椒粉，轻推不要搅。',
      '淋水淀粉勾芡，撒葱花和少许香油。'
    ],
    tip: '豆腐下锅后用推的，别拿勺乱搅。'
  },
  {
    id: 'b12-zhacai-doufutang', name: '榨菜豆腐汤', emoji: '🥣',
    need: ['tofu', 'zhacai'], extra: ['sesamoil', 'scallion'], time: 14, level: 1,
    steps: [
      '榨菜半包切细丝，用清水泡五分钟去咸。',
      '嫩豆腐一盒切小块，用淡盐水泡两分钟。',
      '锅中少油下榨菜丝炒香，加两碗水烧开。',
      '下豆腐煮五分钟，撒葱花，淋几滴香油。'
    ],
    tip: '榨菜先泡水，汤才不会过咸。'
  },
  {
    id: 'b12-liangban-dougan', name: '凉拌豆干丝', emoji: '🥗',
    need: ['driedtofu', 'cilantro'], extra: ['chilioil', 'garlic', 'sesame'], time: 10, level: 1,
    steps: [
      '豆干四块切细丝，开水焯一分钟捞出过凉。',
      '香菜一小把切段，大蒜两瓣切成末。',
      '碗中放生抽、醋、辣椒油和蒜末调匀。',
      '倒入豆干丝和香菜拌匀，静置五分钟。'
    ],
    tip: '豆干切得越细，越容易入味。'
  },
  {
    id: 'b12-dougan-suanmiao', name: '豆干炒蒜苗', emoji: '🌿',
    need: ['driedtofu', 'garlicshoot'], extra: ['oyster', 'garlic'], time: 15, level: 1,
    steps: [
      '豆干四块切条，蒜苗三根斜切段，梗叶分开。',
      '锅中热油下豆干，小火煎至边缘微焦。',
      '放蒜苗梗大火炒一分钟，加一勺蚝油。',
      '最后下蒜苗叶，翻炒半分钟出锅。'
    ],
    tip: '蒜苗叶最后放，才能保持翠绿辛香。'
  },
  {
    id: 'b12-majiang-bandoufu', name: '麻酱拌豆腐', emoji: '🥗',
    need: ['tofu'], extra: ['garlic', 'sesame', 'scallion'], time: 8, level: 1,
    steps: [
      '嫩豆腐一盒倒扣盘中，切块后倒掉渗出的水。',
      '芝麻酱两勺用温水少量多次澥开至顺滑。',
      '加少许盐、生抽和蒜泥搅匀成料汁。',
      '浇在豆腐上，撒上葱花和白芝麻。'
    ],
    tip: '澥麻酱要一点点加水，一次加多会结块。'
  },
  {
    id: 'b12-shougong-danjiao', name: '手工蛋饺', emoji: '🍳',
    need: ['egg', 'mincedpork'], extra: ['starch', 'ginger', 'sesamoil'], time: 30, level: 3,
    steps: [
      '猪肉末二百克加姜末、淀粉和生抽搅上劲。',
      '鸡蛋三个打散，加一勺淀粉水搅匀。',
      '小锅刷薄油，舀一勺蛋液转成小圆皮。',
      '放肉馅，趁蛋皮未全干对折压边，蒸八分钟。'
    ],
    tip: '蛋液里加淀粉水，蛋皮才不易破。'
  },
  {
    id: 'b12-xiahua-niangdoufu', name: '虾滑酿豆腐', emoji: '🍤',
    need: ['shrimppaste', 'tofu'], extra: ['oyster', 'pepper', 'scallion'], time: 22, level: 2,
    steps: [
      '老豆腐一块切厚方片，用小勺在中间挖浅窝。',
      '虾滑一百克加少许白胡椒搅匀，填进窝里。',
      '平底锅少油，虾滑面朝下煎两分钟定型。',
      '翻面加半碗水、一勺蚝油，盖盖焖五分钟。'
    ],
    tip: '挖出的豆腐别扔，拌进虾滑更嫩。'
  },
  {
    id: 'b12-riben-doufubao', name: '日本豆腐煲', emoji: '🍲',
    need: ['eggtofu', 'shiitake'], extra: ['oyster', 'scallion', 'starch'], time: 20, level: 1,
    steps: [
      '日本豆腐两条切段，香菇三朵切片。',
      '砂锅放少许油，下香菇片炒出香味。',
      '放入豆腐段，加一碗水、一勺蚝油和少许生抽。',
      '中小火焖八分钟，淋水淀粉收汁撒葱花。'
    ],
    tip: '豆腐沿锅边轻轻放，别用勺翻。'
  },
  {
    id: 'b12-fuzhu-shaoluobo', name: '腐竹烧萝卜', emoji: '🍲',
    need: ['fuzhu', 'radish'], extra: ['staranise', 'scallion', 'ginger'], time: 25, level: 1,
    steps: [
      '腐竹三根温水泡软切段，白萝卜半根切滚刀块。',
      '锅中热油下姜片和萝卜块，翻炒三分钟。',
      '加生抽、一颗八角和一碗水，小火炖十分钟。',
      '放腐竹再焖八分钟，收汁撒葱花。'
    ],
    tip: '萝卜先炒过再炖，去生味更清甜。'
  },
  {
    id: 'b12-suancai-doufubao', name: '酸菜豆腐煲', emoji: '🍲',
    need: ['pickled', 'tofu'], extra: ['garlic', 'pepper', 'sesamoil'], time: 20, level: 1,
    steps: [
      '酸菜一小把切碎，挤干水后下锅干煸出香。',
      '砂锅少油下蒜末和酸菜炒一分钟。',
      '加两碗水烧开，放嫩豆腐块小火煮十分钟。',
      '加少许白胡椒粉，撒葱花，淋几滴香油。'
    ],
    tip: '酸菜先干煸，酸味更醇不涩口。'
  },
  {
    id: 'b12-maodou-chaodougan', name: '毛豆炒豆干', emoji: '🍚',
    need: ['edamame', 'driedtofu'], extra: ['garlic', 'oyster'], time: 15, level: 1,
    steps: [
      '毛豆米一碗焯水三分钟捞出过凉。',
      '豆干三块切小丁，锅中热油下锅煎香。',
      '倒入毛豆米大火翻炒两分钟至断生。',
      '加一勺生抽和少许盐，炒匀出锅。'
    ],
    tip: '毛豆焯水时加几滴油，颜色更绿。'
  },
  {
    id: 'b13-hotpepper-egg', name: '尖椒炒鸡蛋', emoji: '🌶',
    need: ['hotpepper', 'egg'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '尖椒洗净去蒂，斜切成细圈，怕辣的把白筋和籽刮干净。',
      '鸡蛋磕入碗里加一小撮盐打散，打到蛋液表面起细泡。',
      '热锅多放一点油，倒入蛋液炒成大块盛出，锅里留底油。',
      '下蒜末和尖椒圈大火炒半分钟，倒回鸡蛋加盐翻匀出锅。'
    ],
    tip: '尖椒最后下锅才脆，炒久了发黄出水。'
  },
  {
    id: 'b13-greenradish-shrimp', name: '青萝卜炒虾皮', emoji: '🥕',
    need: ['greenradish', 'driedshrimp'], extra: ['scallion', 'garlic'], time: 12, level: 1,
    steps: [
      '青萝卜削皮切细丝，撒少许盐抓匀腌五分钟，攥掉水分去涩。',
      '虾皮用清水冲两遍沥干，小葱切段，大蒜切片备用。',
      '锅烧热放油，下虾皮小火煸出香味，再下蒜片炒香。',
      '倒入萝卜丝大火翻炒两分钟，加盐和葱段炒匀即可。'
    ],
    tip: '萝卜丝先杀水，炒出来才脆甜不出汤。'
  },
  {
    id: 'b13-caitai', name: '炝炒菜薹', emoji: '🌿',
    need: ['caitai'], extra: ['driedchili', 'sichuan', 'garlic'], time: 10, level: 2,
    steps: [
      '菜薹掐去老根，粗梗撕掉外皮，洗净后切成五厘米长段。',
      '锅中水烧开滴几滴油，菜薹下锅烫二十秒捞出沥干。',
      '热锅凉油下花椒和干辣椒段，小火炸香后把渣捞出。',
      '转大火下蒜末和菜薹，快速翻炒一分半，加盐炒匀出锅。'
    ],
    tip: '菜薹梗比叶难熟，先下梗再下叶更均匀。'
  },
  {
    id: 'b13-malabar', name: '蒜蓉木耳菜', emoji: '🍃',
    need: ['malabar'], extra: ['garlic'], time: 8, level: 1,
    steps: [
      '木耳菜摘下嫩叶和嫩尖，老梗丢掉，用清水冲洗两遍。',
      '大蒜四五瓣拍碎剁成蓉，分成两份，一份生一份熟。',
      '锅烧热放油，下一半蒜蓉小火炒到微黄出香。',
      '倒入木耳菜大火快炒一分钟，菜叶塌软加盐和剩下的蒜蓉。'
    ],
    tip: '木耳菜本身滑嫩，炒久了出黏汁，全程大火。'
  },
  {
    id: 'b13-sweetpotatoleaf', name: '蒜香红薯叶', emoji: '🍠',
    need: ['sweetpotatoleaf'], extra: ['garlic', 'driedchili'], time: 8, level: 1,
    steps: [
      '红薯叶摘去老梗，只留嫩叶嫩茎，泡水洗净后沥干。',
      '蒜切厚片，干辣椒剪成小段，抖掉多余的辣椒籽。',
      '热锅放稍多的油，下蒜片和干辣椒段炒出香味。',
      '先下叶梗炒十秒，再放叶子大火翻炒一分半，加盐炒匀。'
    ],
    tip: '叶子和梗分开下锅，梗先炒才不会一硬一烂。'
  },
  {
    id: 'b13-mustardgreen-egg', name: '芥菜咸蛋汤', emoji: '🥚',
    need: ['mustardgreen', 'saltedegg'], extra: ['ginger'], time: 15, level: 1,
    steps: [
      '芥菜洗净切段，菜梗和菜叶分开放；咸鸭蛋剥壳切小块。',
      '锅中放水加两片姜烧开，先下芥菜梗煮两分钟。',
      '再放菜叶和咸蛋块，用勺子把蛋黄轻轻压散出味。',
      '煮三分钟后尝一下味道，咸蛋本身带咸，通常不用再加盐。'
    ],
    tip: '咸蛋先下蛋黄出味，蛋白最后放口感更嫩。'
  },
  {
    id: 'b13-snowcabbage-pork', name: '雪里蕻炒肉末', emoji: '🥩',
    need: ['snowcabbage', 'mincedpork'], extra: ['garlic', 'driedchili', 'wine'], time: 12, level: 2,
    steps: [
      '腌雪里蕻用清水泡十分钟去咸，攥干后切成碎末。',
      '肉末加料酒和一勺清水抓匀，静置五分钟会更松散。',
      '锅里放油下肉末，中火炒到变色出油，把多余的油倒出。',
      '下蒜末、干辣椒和雪里蕻末，大火炒两分钟，加少许糖提味。'
    ],
    tip: '雪里蕻很咸，泡水后先尝再决定放不放盐。'
  },
  {
    id: 'b13-watercress-soup', name: '西洋菜瘦肉汤', emoji: '🍲',
    need: ['watercress', 'porkloin'], extra: ['ginger', 'starch'], time: 20, level: 1,
    steps: [
      '西洋菜摘去老根洗净；瘦肉切薄片，加淀粉和少许油抓匀。',
      '锅中放水和姜片烧开，下西洋菜煮三分钟到变软。',
      '把肉片一片片抖散下锅，先别搅动，等变色再轻轻推开。',
      '再煮两分钟，加盐调味关火，汤会带一点清苦回甘。'
    ],
    tip: '肉片用淀粉抓过再下锅，久煮也不发柴。'
  },
  {
    id: 'b13-chrysanthemum', name: '凉拌苦菊', emoji: '🥗',
    need: ['chrysanthemum'], extra: ['garlic', 'sesamoil', 'sesame'], time: 8, level: 1,
    steps: [
      '苦菊切掉根部，掰成小朵，用淡盐水泡五分钟再冲洗干净。',
      '洗净后一定要甩干水分，带水拌出来会稀汤寡水。',
      '碗里放蒜末、生抽、醋、少许糖和芝麻油调成料汁。',
      '吃之前再把料汁淋上，轻轻抓匀，最后撒白芝麻。'
    ],
    tip: '料汁最后拌，提前拌会塌软发苦。'
  },
  {
    id: 'b13-shepherdspurse-tofu', name: '荠菜豆腐羹', emoji: '🍲',
    need: ['shepherdspurse', 'tofu'], extra: ['starch', 'sesamoil', 'pepper'], time: 15, level: 2,
    steps: [
      '荠菜择洗干净，下开水锅烫三十秒，捞出过凉挤干切碎。',
      '嫩豆腐切小丁，放淡盐水里泡两分钟去掉豆腥味。',
      '锅里加两碗水烧开，下豆腐丁煮三分钟，再放荠菜碎。',
      '淀粉加水调匀淋入勾薄芡，边倒边搅，加盐和白胡椒粉。'
    ],
    tip: '荠菜先焯水再切，能去土腥味，颜色也更绿。'
  },
  {
    id: 'b13-fennel-egg', name: '茴香煎蛋', emoji: '🍳',
    need: ['fennel', 'egg'], extra: ['pepper'], time: 10, level: 1,
    steps: [
      '茴香只取嫩叶，洗净后彻底晾干，切成半厘米长的小段。',
      '鸡蛋打散加盐和白胡椒粉，倒入茴香段拌匀。',
      '平底锅放油烧到五成热，倒入蛋液摊平，转小火慢煎。',
      '底面定型后翻面再煎一分钟，出锅切成小块装盘。'
    ],
    tip: '茴香叶要沥干水，不然蛋液稀，煎不成块。'
  },
  {
    id: 'b13-perilla-clam', name: '紫苏炒花蛤', emoji: '🐚',
    need: ['perilla', 'clam'], extra: ['garlic', 'ginger', 'douban'], time: 15, level: 2,
    steps: [
      '花蛤用淡盐水泡两小时吐沙，冲洗两遍后沥干水分。',
      '紫苏叶洗净切粗丝，蒜姜切末；花蛤下开水烫到开口捞出。',
      '热锅放油下蒜姜末和豆瓣酱炒出红油，倒入花蛤大火翻炒。',
      '淋一勺料酒，放紫苏丝炒半分钟，汤汁略收就可以出锅。'
    ],
    tip: '没开口的花蛤挑掉，说明不新鲜，别吃。'
  },
  {
    id: 'b13-mint-tomato-salad', name: '薄荷番茄沙拉', emoji: '🍅',
    need: ['tomato', 'mint'], extra: ['honey', 'sesame'], time: 8, level: 1,
    steps: [
      '番茄洗净切厚片，撒一小撮盐静置三分钟，倒掉渗出的汁。',
      '薄荷叶摘下洗净，用厨房纸吸干，大片的手撕成小片。',
      '蜂蜜加两勺温水和几滴白醋调开，均匀淋在番茄上。',
      '撒上薄荷叶和白芝麻，拌匀后冰五分钟更清爽。'
    ],
    tip: '薄荷最后放，拌太久会发黑变蔫。'
  },
  {
    id: 'b13-soybeansprout-vermicelli', name: '黄豆芽炒粉条', emoji: '🍜',
    need: ['soybeansprout', 'vermicelli'], extra: ['garlic', 'driedchili', 'oyster'], time: 15, level: 2,
    steps: [
      '粉条用温水泡二十分钟到能弯折，剪成两段，别泡到发烂。',
      '黄豆芽洗净，掐掉发黑的豆瓣尖，沥干水分。',
      '热锅放油下蒜末和干辣椒段炒香，倒豆芽大火炒两分钟。',
      '下粉条，加生抽和老抽上色，翻炒到汤汁被吸干即可。'
    ],
    tip: '粉条泡到七分软就够，靠炒的时候吸汤变软。'
  },
  {
    id: 'b13-babyscorn-shrimp', name: '玉米笋炒虾仁', emoji: '🦐',
    need: ['babyscorn', 'shrimp'], extra: ['garlic', 'starch', 'wine'], time: 12, level: 2,
    steps: [
      '虾仁挑去虾线，加料酒、淀粉和少许盐抓匀腌十分钟。',
      '玉米笋斜刀切成两半，下开水锅烫一分钟捞出过凉。',
      '热锅放油，下虾仁滑炒到卷曲变红，立刻盛出。',
      '锅里留油下蒜末炒香，放玉米笋炒一分钟，倒回虾仁加盐。'
    ],
    tip: '虾仁卷起来就盛出，回锅一次，别反复炒。'
  },
  {
    id: 'b13-leek-tofu', name: '大葱烧豆腐', emoji: '🍲',
    need: ['leek', 'firmtofu'], extra: ['oyster', 'starch'], time: 18, level: 2,
    steps: [
      '老豆腐切两厘米厚的片，用厨房纸吸干表面的水分。',
      '大葱斜切成段，葱白葱绿分开放；淀粉加水调成水淀粉。',
      '平底锅放油，豆腐片小火煎到两面金黄后盛出。',
      '下葱白炒香，加生抽、蚝油和小半碗水烧开，放豆腐焖三分钟。',
      '下葱绿，淋水淀粉收汁，汁裹住豆腐就可以出锅。'
    ],
    tip: '豆腐煎定型再烧，翻动用铲子托底不易碎。'
  },
  {
    id: 'b13-purplesweetpotato-tremella', name: '紫薯银耳羹', emoji: '🍠',
    need: ['purplesweetpotato', 'tremella', 'jujube'], extra: ['rocksugar'], time: 45, level: 1,
    steps: [
      '银耳提前用凉水泡一小时，剪掉黄色根部，撕成小朵。',
      '银耳加足量水大火烧开，转小火炖三十分钟到出胶。',
      '紫薯去皮切小方块，用清水冲掉表面的淀粉。',
      '把紫薯和红枣放进银耳汤里，再炖十分钟，加冰糖化开。'
    ],
    tip: '紫薯后放，炖久了汤会发灰，颜色不好看。'
  },
  {
    id: 'b13-watercaltrop-pork', name: '菱角烧肉', emoji: '🥩',
    need: ['watercaltrop', 'porkbelly'], extra: ['ginger', 'staranise', 'rocksugar'], time: 40, level: 3,
    steps: [
      '菱角洗净，用刀在壳上划一道口，下锅煮十分钟后剥壳。',
      '五花肉切麻将块，冷水下锅加姜片焯三分钟，撇净浮沫。',
      '锅里放少许油和冰糖，小火炒到糖色发红，下五花肉裹匀。',
      '加姜片、八角、生抽和老抽，倒热水没过肉，小火炖二十五分钟。',
      '放入菱角再炖八分钟，转大火收汁到浓稠发亮。'
    ],
    tip: '菱角后放，炖久了会散，最后八分钟刚好入味。'
  },
  {
    id: 'b13-cowpea-egg', name: '豇豆炒鸡蛋', emoji: '🍳',
    need: ['cowpea', 'egg'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '豇豆掐头去尾，撕掉两侧的老筋，斜切成薄片。',
      '锅中水烧开，豇豆下锅烫两分钟，捞出过凉水沥干。',
      '鸡蛋加少许盐打散，热锅热油炒成块后盛出。',
      '下蒜末炒香，倒入豇豆大火炒两分钟，回锅鸡蛋加盐炒匀。'
    ],
    tip: '豇豆一定要焯透，半生的豆角吃了容易闹肚子。'
  },
  {
    id: 'b13-flatbean', name: '蒜香扁豆', emoji: '🌿',
    need: ['flatbean'], extra: ['garlic', 'driedchili'], time: 15, level: 2,
    steps: [
      '扁豆撕掉两侧的筋，掰成五厘米长的段，洗净沥干。',
      '开水锅里加一点盐，扁豆下锅焯三分钟，捞出控干。',
      '热锅多放点油，下扁豆中火煸到表皮起皱发白。',
      '下蒜末和干辣椒段炒香，加盐和少许生抽翻匀出锅。'
    ],
    tip: '扁豆要炒到完全变色发软，半生的有毒。'
  },
  {
    id: 'b13-eggplant-greenbean', name: '茄子烧豆角', emoji: '🍆',
    need: ['eggplant', 'greenbean'], extra: ['garlic', 'douban'], time: 22, level: 3,
    steps: [
      '茄子切滚刀块，撒盐腌十分钟，挤掉水分减少吸油。',
      '豆角撕筋掰成段，热锅少油煸到表皮起皱后盛出。',
      '锅里补一点油下茄子块，中火煎到边缘发软金黄。',
      '下蒜末和豆瓣酱炒香，倒回豆角和茄子，加生抽和小半碗水烧五分钟。'
    ],
    tip: '茄子先腌再煎，比直接炸省一半油也不腻。'
  },
  {
    id: 'b13-cucumber-salad', name: '蓑衣黄瓜', emoji: '🥒',
    need: ['cucumber'], extra: ['garlic', 'chilioil', 'sesame'], time: 15, level: 2,
    steps: [
      '黄瓜洗净，两侧各放一根筷子挡刀，先直刀切薄片不切断。',
      '把黄瓜翻面，斜刀再切一遍，切完能拉开像弹簧。',
      '撒盐腌十分钟，倒掉渗出的水，轻轻压一下挤干。',
      '蒜末、生抽、醋和辣椒油调成汁浇上，撒白芝麻腌五分钟。'
    ],
    tip: '垫筷子是关键，切到底也不会散架。'
  },
  {
    id: 'b13-greenpepper-potato', name: '青椒土豆丝', emoji: '🥔',
    need: ['greenpepper', 'potato'], extra: ['garlic', 'whitevinegar', 'sichuan'], time: 12, level: 2,
    steps: [
      '土豆去皮切细丝，放清水里抓洗两遍，洗掉表面的淀粉。',
      '泡土豆丝的水里滴几滴白醋，泡五分钟会更脆。',
      '青椒去籽切丝；锅烧热放油，下几粒花椒炸香后捞出。',
      '下蒜末和土豆丝大火炒一分半，放青椒丝炒半分钟，加盐和白醋。'
    ],
    tip: '土豆丝洗到水清再炒，才不会粘锅发糊。'
  },
  {
    id: 'b13-onion-potato', name: '洋葱炒土豆片', emoji: '🥔',
    need: ['onion', 'potato'], extra: ['blackpepper', 'oyster'], time: 15, level: 1,
    steps: [
      '土豆去皮切半厘米厚的片，泡水五分钟去掉表面淀粉。',
      '洋葱切粗丝，用手掰散；土豆片捞出沥干水分。',
      '热锅放油，土豆片中火煎到两面微黄、边缘变透明。',
      '下洋葱丝炒到变软发甜，加盐、蚝油和黑胡椒炒匀。'
    ],
    tip: '洋葱炒到透明才出甜味，早放盐容易出水。'
  },
  {
    id: 'b13-carrot-broccoli', name: '胡萝卜炒西兰花', emoji: '🥦',
    need: ['carrot', 'broccoli'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '西兰花掰成小朵，用淡盐水泡十分钟，冲净缝隙里的杂质。',
      '胡萝卜切薄片，切得和西兰花差不多大小才好一起熟。',
      '水烧开加盐和几滴油，西兰花焯一分钟，胡萝卜焯两分钟。',
      '热锅下蒜末炒香，倒入两样菜大火翻炒，加蚝油和盐炒匀。'
    ],
    tip: '焯水时加点油，西兰花颜色能保持翠绿。'
  },
  {
    id: 'b13-braised-radish', name: '素烧萝卜', emoji: '🥕',
    need: ['radish'], extra: ['ginger', 'staranise'], time: 25, level: 2,
    steps: [
      '白萝卜去皮切滚刀块，大小尽量一致，熟的时间才同步。',
      '锅中放油下姜片和八角炒香，倒入萝卜块翻炒两分钟。',
      '加生抽、少许老抽和一小勺糖，倒热水到萝卜的一半高。',
      '盖盖小火炖十五分钟，开盖转大火收汁到萝卜透亮。'
    ],
    tip: '炖到筷子能轻松插透，才有软糯的口感。'
  },
  {
    id: 'b13-cabbage-shrimp', name: '虾皮炒白菜', emoji: '🍲',
    need: ['cabbage', 'driedshrimp'], extra: ['garlic'], time: 12, level: 1,
    steps: [
      '白菜取嫩帮和叶子，帮子斜刀片薄，叶子用手撕成块。',
      '虾皮用清水泡两分钟，洗掉多余的盐分后沥干。',
      '热锅放油，下虾皮小火炒到微微发黄出香，再下蒜末。',
      '先下白菜帮炒一分钟，再下叶子，加盐炒到变软出水。'
    ],
    tip: '虾皮先炒香再下菜，鲜味比直接煮更明显。'
  },
  {
    id: 'b13-spinach-soup', name: '上汤菠菜', emoji: '🥣',
    need: ['spinach', 'centuryegg'], extra: ['garlic', 'ginger'], time: 12, level: 2,
    steps: [
      '菠菜去根洗净切成两段，下开水锅烫二十秒去掉草酸。',
      '焯好的菠菜过一下凉水，挤掉水分，汤才不会发涩。',
      '皮蛋剥壳切小块，蒜拍碎；锅里放油把蒜和皮蛋煎香。',
      '加两碗热水烧开煮三分钟，放菠菜再煮一分钟，加盐。'
    ],
    tip: '菠菜先焯水，草酸去掉了汤才不涩口。'
  },
  {
    id: 'b13-lettuce-pork', name: '生菜包肉', emoji: '🌯',
    need: ['lettuce', 'porkbelly'], extra: ['soybeanpaste', 'garlic', 'sesame'], time: 20, level: 2,
    steps: [
      '生菜掰成大片，泡冰水十分钟后沥干，叶子会更脆。',
      '五花肉切薄片，冷锅下肉，中小火煎到两面微焦出油。',
      '倒掉多余的油，加蒜末和黄豆酱炒香，撒白芝麻翻匀。',
      '肉片盛出，吃的时候用生菜叶包起来，卷紧一口咬下。'
    ],
    tip: '肉要煎到边缘焦脆，包在生菜里才不腻。'
  },
  {
    id: 'b13-youmaicai-pork', name: '油麦菜炒肉丝', emoji: '🥩',
    need: ['youmaicai', 'porkloin'], extra: ['garlic', 'starch', 'oyster'], time: 15, level: 2,
    steps: [
      '里脊切细丝，加淀粉、生抽和一点水抓匀，腌十分钟。',
      '油麦菜洗净切长段，菜梗和菜叶分开摆放。',
      '热锅多放油，下肉丝快速滑散，变色就盛出。',
      '下蒜末和菜梗炒半分钟，放叶子，倒回肉丝加蚝油炒匀。'
    ],
    tip: '肉丝滑到七成熟就盛出，回锅刚好嫩。'
  },
  {
    id: 'b13-tonghao-tofu', name: '茼蒿豆腐汤', emoji: '🍲',
    need: ['tonghao', 'tofu'], extra: ['ginger', 'sesamoil'], time: 15, level: 1,
    steps: [
      '茼蒿洗净切段，嫩豆腐切小方块，姜切成细丝。',
      '锅中放两碗水，下姜丝和豆腐块，小火煮五分钟。',
      '放入茼蒿段，煮到叶子变深绿、梗变软，大约两分钟。',
      '加盐调味，滴几滴芝麻油就关火，汤清味鲜。'
    ],
    tip: '茼蒿久煮会发黄发苦，最后两分钟下锅正好。'
  },
  {
    id: 'b13-waterspinach-pork', name: '空心菜炒肉丝', emoji: '🌿',
    need: ['waterspinach', 'porkloin'], extra: ['garlic', 'douchi'], time: 15, level: 2,
    steps: [
      '空心菜摘去老梗，切成五厘米段，梗和叶分开放。',
      '瘦肉切丝，加生抽和淀粉抓匀；豆豉稍微剁碎。',
      '热锅放油，下肉丝滑炒到变色后盛出。',
      '下蒜末和豆豉炒香，先炒菜梗再下叶子，回锅肉丝加盐。'
    ],
    tip: '空心菜下锅前再洗，洗好久放容易发黑。'
  },
  {
    id: 'b13-amaranth-broadbean', name: '苋菜炒蚕豆', emoji: '🌱',
    need: ['amaranth', 'broadbean'], extra: ['garlic'], time: 15, level: 2,
    steps: [
      '蚕豆剥去外壳，再剥掉表面的薄皮，豆瓣才够嫩。',
      '苋菜摘嫩叶洗净；蚕豆下开水锅煮三分钟捞出。',
      '热锅放油下蒜末炒香，倒入蚕豆翻炒一分钟。',
      '放苋菜大火快炒，叶子塌软出红汁，加盐炒匀即可。'
    ],
    tip: '苋菜会出红色汤汁，拌饭吃很香，别收太干。'
  },
  {
    id: 'b13-gailan', name: '白灼芥蓝', emoji: '🥦',
    need: ['gailan'], extra: ['steamedsoy', 'ginger', 'scallion'], time: 10, level: 1,
    steps: [
      '芥蓝削去根部老皮，粗梗用刀划十字，方便同时熟。',
      '锅中水烧开，加盐和几滴油，芥蓝下锅烫一分半。',
      '捞出立刻过冰水，颜色会更翠绿，口感也更脆。',
      '摆盘淋上蒸鱼豉油，铺姜丝葱丝，浇一勺热油激香。'
    ],
    tip: '芥蓝根部老皮一定要削，不然嚼不动。'
  },
  {
    id: 'b13-tomato-cauliflower', name: '番茄花菜', emoji: '🍅',
    need: ['cauliflower', 'tomato'], extra: ['garlic', 'ketchup'], time: 15, level: 1,
    steps: [
      '花菜掰成小朵，用淡盐水泡十分钟，冲净后沥干。',
      '番茄顶部划十字，用开水烫一下撕掉皮，切成小丁。',
      '锅中水烧开，花菜焯两分钟捞出，别焯过头。',
      '热锅下蒜末和番茄丁，炒到出沙，加番茄酱，倒花菜炒匀。'
    ],
    tip: '番茄炒出沙再放花菜，汤汁才裹得住。'
  },
  {
    id: 'b13-zucchini-shrimp', name: '西葫芦炒虾皮', emoji: '🥒',
    need: ['zucchini', 'driedshrimp'], extra: ['garlic', 'scallion'], time: 10, level: 1,
    steps: [
      '西葫芦洗净对半切开，斜切成半厘米厚的片。',
      '虾皮冲洗两遍挤干；西葫芦片撒少许盐腌三分钟。',
      '热锅放油下虾皮和蒜末，小火炒到虾皮酥香。',
      '倒入西葫芦大火炒两分钟，撒葱花翻匀出锅。'
    ],
    tip: '西葫芦容易出水，全程大火，别盖锅盖。'
  },
  {
    id: 'b13-garlic-luffa', name: '蒜蓉蒸丝瓜', emoji: '🥒',
    need: ['luffa'], extra: ['garlic', 'scallion', 'steamedsoy'], time: 15, level: 1,
    steps: [
      '丝瓜刮掉外层硬皮，留一点青皮，切成五厘米长的段。',
      '每段竖着划两刀不切断，摆在盘里，撒一点盐。',
      '大蒜剁成蓉，一半用热油炒香，和生蒜蓉拌在一起铺在丝瓜上。',
      '水开后大火蒸六分钟，出锅淋蒸鱼豉油，撒葱花。'
    ],
    tip: '丝瓜蒸过头会塌成一摊水，六分钟足够。'
  },
  {
    id: 'b13-bittergourd-salad', name: '凉拌苦瓜', emoji: '🥒',
    need: ['bittergourd'], extra: ['garlic', 'honey', 'chilioil'], time: 12, level: 1,
    steps: [
      '苦瓜对半剖开，用勺子刮净白瓤和内层薄膜，那是苦味来源。',
      '斜刀切薄片，撒盐抓匀腌五分钟，出水后挤干。',
      '水烧开下苦瓜烫三十秒，捞出过冰水，保持脆感。',
      '蒜末、生抽、醋、蜂蜜和辣椒油调成料汁，拌匀冷藏十分钟。'
    ],
    tip: '白瓤刮得越干净苦味越淡，冰水一过更脆。'
  },
  {
    id: 'b13-wintermelon-shrimp', name: '冬瓜烧虾皮', emoji: '🍲',
    need: ['wintermelon', 'driedshrimp'], extra: ['garlic', 'scallion', 'oyster'], time: 18, level: 1,
    steps: [
      '冬瓜去皮去瓤，切成两厘米厚的片，边缘修整齐。',
      '虾皮用清水泡洗两遍，挤干水分备用。',
      '热锅放油，下虾皮和蒜末炒香，倒入冬瓜片翻炒。',
      '加半碗水和蚝油，盖盖小火焖八分钟，收汁撒葱花。'
    ],
    tip: '冬瓜焖到透明就好，太烂会散，汤汁拌饭很鲜。'
  },
  {
    id: 'b13-pumpkin-lily', name: '南瓜炒百合', emoji: '🎃',
    need: ['pumpkin', 'lilybulb'], extra: ['garlic'], time: 15, level: 2,
    steps: [
      '南瓜去皮去籽，切成半厘米厚的薄片，尽量大小一致。',
      '鲜百合掰成瓣，削掉根部和边缘发黑的地方，洗净。',
      '南瓜片下开水锅焯一分钟，捞出沥干水分。',
      '热锅下蒜末，放南瓜片炒两分钟，加百合炒到边缘透明，加盐。'
    ],
    tip: '百合最后放，炒到半透明就出锅，久了会碎。'
  },
  {
    id: 'b13-peppersalt-corn', name: '椒盐玉米粒', emoji: '🌽',
    need: ['corn'], extra: ['peppersalt', 'starch', 'scallion'], time: 15, level: 2,
    steps: [
      '甜玉米剥成粒，下开水锅煮三分钟捞出，彻底沥干水。',
      '玉米粒拌上干淀粉，让每一粒都薄薄裹上一层。',
      '锅中放油烧到六成热，下玉米粒炸到外壳微脆捞出。',
      '锅留底油，倒回玉米粒，撒椒盐和葱花翻匀。'
    ],
    tip: '玉米粒要沥干再裹粉，粉才挂得住，炸时少溅油。'
  },
  {
    id: 'b13-celery-peanut', name: '芹菜拌花生米', emoji: '🥜',
    need: ['celery', 'peanut'], extra: ['staranise', 'sesamoil', 'garlic'], time: 20, level: 1,
    steps: [
      '花生米提前泡两小时，加八角和盐，小火煮二十分钟。',
      '煮好的花生连汤泡着放凉，这样更入味也不发干。',
      '芹菜去叶切段，下开水锅烫一分钟，捞出过凉水。',
      '芹菜和花生沥干，加蒜末、生抽、醋和芝麻油拌匀。'
    ],
    tip: '花生煮完别急着捞，泡在汤里放凉更入味。'
  },
  {
    id: 'b13-chive-tofuskin', name: '韭菜炒豆皮', emoji: '🌿',
    need: ['chive', 'tofuskin'], extra: ['garlic'], time: 10, level: 1,
    steps: [
      '豆腐皮用温水泡软，切成细条，再用开水烫一下去豆味。',
      '韭菜洗净沥干，切成四厘米长的段，根部和叶子分开。',
      '热锅放油下蒜末，先放韭菜根炒十秒，再下豆皮翻炒。',
      '放韭菜叶，大火炒半分钟，加盐炒匀立刻出锅。'
    ],
    tip: '韭菜下锅就熟，炒久了发黄出水，手要快。'
  },
  {
    id: 'b13-garlicsprout-salad', name: '凉拌蒜苔', emoji: '🥗',
    need: ['garlicsprout'], extra: ['garlic', 'chilioil', 'sesamoil'], time: 15, level: 1,
    steps: [
      '蒜苔掐去老梗，切成五厘米长的段，粗的从中间划开。',
      '水烧开加一点盐，蒜苔下锅烫一分半，捞出过冰水。',
      '用手把蒜苔撕成细丝，撕开的断面更容易吸味。',
      '加蒜末、生抽、醋、辣椒油和芝麻油拌匀，腌十分钟。'
    ],
    tip: '蒜苔撕成丝比整段拌更入味，口感也更嫩。'
  },
  {
    id: 'b13-sweetsour-lotus', name: '糖醋藕丁', emoji: '🥢',
    need: ['lotus'], extra: ['ketchup', 'sesame', 'starch'], time: 15, level: 2,
    steps: [
      '莲藕去皮切一厘米见方的丁，泡在清水里防止氧化发黑。',
      '水烧开下藕丁焯两分钟，捞出过凉水沥干。',
      '番茄酱、糖、醋和一点水淀粉调成糖醋汁备用。',
      '热锅放油下藕丁炒两分钟，倒入糖醋汁翻炒到收稠裹匀。'
    ],
    tip: '藕丁焯过再炒更脆，糖醋汁收稠才挂得住。'
  },
  {
    id: 'b13-yam-celtuce', name: '山药炒莴笋', emoji: '🌱',
    need: ['yam', 'celtuce'], extra: ['garlic'], time: 12, level: 2,
    steps: [
      '山药去皮切薄片，立刻泡进淡盐水，防止氧化发黑。',
      '莴笋削皮去筋，切成同样大小的薄片；蒜切片。',
      '水烧开，山药片和莴笋片分别焯三十秒后捞出。',
      '热锅下蒜片炒香，倒入两样片大火翻炒一分钟，加盐出锅。'
    ],
    tip: '山药黏液会让手发痒，削皮时戴个手套更省事。'
  },
  {
    id: 'b13-taro-chicken', name: '芋头焖鸡', emoji: '🍗',
    need: ['taro', 'chickenleg'], extra: ['ginger', 'oyster', 'wine'], time: 35, level: 3,
    steps: [
      '鸡腿剁成小块，冷水下锅加姜片和料酒焯三分钟去腥。',
      '芋头去皮切滚刀块，下油锅煎到表面微黄定型。',
      '锅中放油下姜片炒香，倒鸡块炒到表皮收紧，加生抽和蚝油。',
      '倒热水没过鸡块，小火焖十五分钟，再放芋头焖十分钟收汁。'
    ],
    tip: '芋头先煎一下，焖的时候才不会散成糊。'
  },
  {
    id: 'b13-sweetpotato-ginger', name: '红薯姜汤', emoji: '🍠',
    need: ['sweetpotato', 'jujube'], extra: ['ginger', 'brownsugar'], time: 25, level: 1,
    steps: [
      '红薯去皮切滚刀块，泡水冲掉表面淀粉，汤才清亮。',
      '老姜切厚片，红枣去核，用刀拍一下更容易出味。',
      '锅中放水和姜片红枣，大火烧开转小火煮十分钟。',
      '放红薯块煮十二分钟，加红糖搅到化开，关火焖五分钟。'
    ],
    tip: '选黄心红薯更甜糯，筷子能插透就好。'
  },
  {
    id: 'b13-bambooshoot-bacon', name: '竹笋炒腊肉', emoji: '🥓',
    need: ['bambooshoot', 'curedmeat'], extra: ['garlic', 'driedchili', 'wine'], time: 20, level: 2,
    steps: [
      '竹笋剥壳切薄片，下开水锅煮五分钟去涩，捞出沥干。',
      '腊肉切薄片，用温水泡十分钟去掉表面浮油和多余盐分。',
      '冷锅下腊肉，小火慢慢煸出油，肉片卷边后盛出一半油。',
      '下蒜末和干辣椒炒香，倒笋片大火炒三分钟，加少许生抽。'
    ],
    tip: '竹笋一定先煮去涩，否则有麻嘴的草酸味。'
  },
  {
    id: 'b13-waterbamboo-pork', name: '茭白炒肉片', emoji: '🥩',
    need: ['waterbamboo', 'porkloin'], extra: ['garlic', 'oyster', 'starch'], time: 15, level: 2,
    steps: [
      '茭白剥去外层老壳，切掉底部老根，斜刀切薄片。',
      '里脊切薄片，加淀粉、生抽和一点水抓匀腌十分钟。',
      '热锅多放油，下肉片滑炒到变色后立刻盛出。',
      '下蒜末炒香，倒茭白片炒两分钟，回锅肉片加蚝油炒匀。'
    ],
    tip: '茭白含草酸，炒前用开水烫一下口感更清甜。'
  },
  {
    id: 'b13-asparagus-mushroom', name: '芦笋炒口蘑', emoji: '🍄',
    need: ['asparagus', 'buttonmushroom'], extra: ['garlic', 'blackpepper', 'oyster'], time: 12, level: 1,
    steps: [
      '芦笋切掉根部老段，用削皮刀削去下半段的粗皮。',
      '斜切成段，下开水锅烫四十秒，捞出过凉水保持翠绿。',
      '口蘑切厚片，热锅不放油先干煸一分钟逼出水分。',
      '加油和蒜末炒香，倒芦笋翻炒，加蚝油和黑胡椒炒匀。'
    ],
    tip: '口蘑先干煸出水，再炒才不会出一盘汤。'
  },
  {
    id: 'b13-okra-salad', name: '凉拌秋葵', emoji: '🥗',
    need: ['okra'], extra: ['garlic', 'steamedsoy', 'sesamoil'], time: 12, level: 1,
    steps: [
      '秋葵用盐搓洗表面绒毛，冲净后切掉蒂部硬头，别切破。',
      '水烧开加几滴油，秋葵下锅烫两分钟，捞出过冰水。',
      '斜刀切成小段，切面会拉出黏液，这是正常的。',
      '蒜末、蒸鱼豉油和芝麻油调成汁淋上，拌匀即可。'
    ],
    tip: '秋葵整根焯水再切，黏液和营养不会流失。'
  },
  {
    id: 'b13-snowpea-shrimp', name: '荷兰豆炒虾仁', emoji: '🦐',
    need: ['snowpea', 'shrimp'], extra: ['garlic', 'starch', 'wine'], time: 12, level: 2,
    steps: [
      '荷兰豆撕掉两侧老筋，洗净沥干；虾仁挑去虾线。',
      '虾仁加料酒、淀粉和少许盐抓匀，腌十分钟。',
      '水烧开，荷兰豆焯一分钟捞出过凉，颜色更绿。',
      '热锅下蒜末，倒虾仁炒到卷曲，放荷兰豆大火翻炒加盐。'
    ],
    tip: '荷兰豆焯水后再炒，能熟透又不失脆感。'
  },
  {
    id: 'b13-peas-shiitake', name: '豌豆炒香菇', emoji: '🍄',
    need: ['peas', 'shiitake'], extra: ['garlic', 'oyster'], time: 12, level: 1,
    steps: [
      '鲜豌豆剥出豆粒，下开水锅煮三分钟捞出沥干。',
      '香菇去蒂切小丁，蒂别扔，切碎一起炒更香。',
      '热锅放油下蒜末，倒香菇丁中火炒到变软出香。',
      '加豌豆翻炒两分钟，放蚝油和盐炒匀出锅。'
    ],
    tip: '鲜豌豆先煮再炒，去豆腥也更容易熟。'
  },
  {
    id: 'b13-edamame-zhacai', name: '毛豆炒榨菜', emoji: '🌱',
    need: ['edamame', 'zhacai'], extra: ['garlic', 'driedchili'], time: 12, level: 2,
    steps: [
      '毛豆剥出豆粒，搓洗掉表面薄皮，下开水锅煮五分钟。',
      '榨菜切细丁，用清水泡五分钟去掉部分咸味，挤干。',
      '热锅放油，下蒜末和干辣椒段炒香，倒榨菜丁炒出味。',
      '加毛豆大火翻炒两分钟，尝过味道再决定要不要加盐。'
    ],
    tip: '榨菜本身很咸，盐最后尝过再放，免得过咸。'
  },
  {
    id: 'b14-001', name: '草菇炒肉片', emoji: '🍄',
    need: ['strawmushroom', 'porkloin'], extra: ['oyster', 'scallion', 'garlic'], time: 15, level: 2,
    steps: [
      '草菇对半切开，入沸水加少许盐焯两分钟，捞出沥干去土腥味。',
      '里脊逆纹切薄片，加料酒、淀粉和一点生抽抓匀，腌十分钟。',
      '热锅多放点油，肉片大火滑炒至变色，先盛出备用。',
      '锅留底油爆香蒜末，下草菇炒出香味，倒回肉片加蚝油炒匀。',
      '撒葱花翻匀，关火装盘，趁热吃口感最嫩。'
    ],
    tip: '草菇必须焯透，否则有生土味，吃了也不舒服。'
  },
  {
    id: 'b14-002', name: '草菇丝瓜汤', emoji: '🍲',
    need: ['strawmushroom', 'luffa'], extra: ['ginger', 'scallion'], time: 15, level: 1,
    steps: [
      '草菇切厚片，沸水焯一分钟捞出；丝瓜削皮切滚刀块泡淡盐水防黑。',
      '锅里少油下姜丝爆香，倒入丝瓜块中火翻炒到边缘变软。',
      '加两碗热水煮开，放入草菇继续煮三分钟。',
      '调盐和少许白胡椒，撒葱花关火，汤清味鲜。'
    ],
    tip: '丝瓜别久煮，断生就关火，不然会发黄发苦。'
  },
  {
    id: 'b14-003', name: '猴头菇鸡汤', emoji: '🍲',
    need: ['lionmane', 'chickenleg', 'jujube'], extra: ['ginger', 'wine'], time: 60, level: 2,
    steps: [
      '干猴头菇用温水泡两小时，中途换水三次，反复挤干去掉黄水苦味。',
      '泡好的猴头菇剪去硬蒂，撕成小块，沸水焯三分钟再挤干。',
      '鸡腿剁块冷水下锅，加料酒姜片焯去血沫，捞出冲净。',
      '砂锅放鸡块、猴头菇、红枣和姜片，加足量热水大火烧开。',
      '转小火炖五十分钟，出锅前调盐，汤色金黄不带苦。'
    ],
    tip: '猴头菇泡发换水越勤，苦味去得越干净。'
  },
  {
    id: 'b14-004', name: '猴头菇蒸肉饼', emoji: '🍄',
    need: ['lionmane', 'mincedpork'], extra: ['oyster', 'starch', 'scallion'], time: 30, level: 2,
    steps: [
      '猴头菇温水泡软后挤干，剪去硬蒂剁成细末，越碎越好。',
      '猪肉末加菇末、蚝油、淀粉和一点盐，顺一个方向搅上劲。',
      '肉馅铺进浅盘压平，中间按个小窝，淋一勺清水。',
      '水开后上锅大火蒸十五分钟，关火再焖两分钟。',
      '出锅撒葱花，倒掉盘里多余汤汁再上桌。'
    ],
    tip: '加勺淀粉肉饼才嫩，蒸出来的汤别浪费，拌饭香。'
  },
  {
    id: 'b14-005', name: '羊肚菌炖排骨', emoji: '🍲',
    need: ['morel', 'ribs'], extra: ['ginger', 'wine'], time: 70, level: 2,
    steps: [
      '干羊肚菌用温水泡二十分钟，泡的水静置后只取上层清液。',
      '羊肚菌剪开菌柄冲洗内壁泥沙，换水再洗两遍。',
      '排骨冷水下锅，加料酒姜片焯水，撇净浮沫后捞出。',
      '排骨、羊肚菌和姜片入砂锅，倒入沉淀好的泡菌水，再加开水。',
      '大火烧开转小火炖五十分钟，最后调盐，鲜味很厚。'
    ],
    tip: '泡菌水是精华，只取上层，底部泥沙要倒掉。'
  },
  {
    id: 'b14-006', name: '羊肚菌蒸蛋', emoji: '🥚',
    need: ['morel', 'egg'], extra: ['scallion', 'sesamoil'], time: 20, level: 1,
    steps: [
      '羊肚菌温水泡二十分钟，反复冲洗褶皱里的沙，挤干切碎。',
      '两个鸡蛋打散，加一点盐和一点五倍温水搅匀，过筛去泡。',
      '蛋液倒进碗里，盖保鲜膜扎几个小孔，中小火蒸八分钟。',
      '揭开膜撒上羊肚菌碎，再蒸四分钟至完全凝固。',
      '淋几滴芝麻油和生抽，撒葱花即可。'
    ],
    tip: '蛋液过筛、盖膜蒸，表面才滑得像布丁。'
  },
  {
    id: 'b14-007', name: '羊肚菌焖饭', emoji: '🍚',
    need: ['morel', 'rice'], extra: ['oyster', 'scallion'], time: 35, level: 2,
    steps: [
      '羊肚菌温水泡二十分钟洗净沙粒，泡菌水沉淀后留上层备用。',
      '大米淘洗后沥干，羊肚菌切条，泡菌水按正常水量兑进米里。',
      '锅中少油把羊肚菌煎香，加蚝油和一点盐翻炒半分钟。',
      '炒好的菌连汁倒进米中拌匀，按下电饭煲煮饭键。',
      '跳闸后焖十分钟再开盖，撒葱花把饭翻松。'
    ],
    tip: '泡菌水替清水煮饭，一开锅全是菌香。'
  },
  {
    id: 'b14-008', name: '蟹味菇炒蛋', emoji: '🍄',
    need: ['crabmushroom', 'egg'], extra: ['scallion', 'oyster'], time: 12, level: 1,
    steps: [
      '蟹味菇切去根部，掰散后冲洗干净，沸水焯一分钟去生味。',
      '鸡蛋三个加少许盐打散，加一勺清水炒出来更嫩。',
      '热锅倒油，蛋液下锅炒成嫩块，盛出备用。',
      '底油下蟹味菇大火煸炒两分钟，加蚝油炒匀。',
      '倒回鸡蛋快速翻炒均匀，撒葱花出锅装盘。'
    ],
    tip: '菇先焯再炒不出水，鸡蛋才能保持嫩滑。'
  },
  {
    id: 'b14-009', name: '蟹味菇豆腐汤', emoji: '🍲',
    need: ['crabmushroom', 'tofu'], extra: ['scallion', 'pepper'], time: 15, level: 1,
    steps: [
      '蟹味菇去根撕散洗净，嫩豆腐切小方块，用淡盐水泡五分钟。',
      '锅中少油下蟹味菇炒软，炒出香味后加两碗热水煮开。',
      '放入豆腐块，转中火煮五分钟，别大力翻动免得碎。',
      '调盐和白胡椒粉，撒葱花，点几滴香油出锅。'
    ],
    tip: '豆腐先用盐水泡，煮的时候不容易散。'
  },
  {
    id: 'b14-010', name: '竹荪扒芦笋', emoji: '🎋',
    need: ['bamboofungus', 'asparagus'], extra: ['oyster', 'garlic'], time: 20, level: 2,
    steps: [
      '干竹荪用淡盐水泡十五分钟，剪掉菌盖和网状裙边，只留菌柄。',
      '竹荪反复冲洗至水清，沸水焯一分钟捞出，挤干切段。',
      '芦笋削去老根老皮，切段后沸水加盐焯一分钟，过凉摆盘。',
      '锅中爆香蒜末，加半碗水、蚝油和一点糖烧开。',
      '下竹荪煮两分钟，勾薄芡浇在芦笋上即可。'
    ],
    tip: '竹荪的网裙味重，一定要剪掉，只吃菌柄。'
  },
  {
    id: 'b14-011', name: '竹荪炖鸡', emoji: '🍲',
    need: ['bamboofungus', 'chickenleg', 'jujube'], extra: ['ginger'], time: 60, level: 2,
    steps: [
      '竹荪淡盐水泡十五分钟，剪去菌盖和网裙，冲洗干净后切段。',
      '鸡腿剁块冷水下锅焯去血沫，捞出用温水冲净。',
      '砂锅放鸡块、姜片和红枣，加足量开水大火烧开。',
      '转小火炖四十分钟，再放入竹荪炖十分钟。',
      '出锅前调盐，竹荪久煮会烂，时间要控好。'
    ],
    tip: '竹荪最后十分钟才下，早了就化在汤里。'
  },
  {
    id: 'b14-012', name: '裙带菜豆腐汤', emoji: '🍲',
    need: ['wakame', 'tofu'], extra: ['scallion', 'pepper'], time: 12, level: 1,
    steps: [
      '干裙带菜用冷水泡三分钟即发，洗去沙粒，剪成小段。',
      '嫩豆腐切块，锅里烧开水，放入豆腐小火煮三分钟。',
      '下裙带菜再煮两分钟，裙带菜易熟，久煮会软烂。',
      '调盐和白胡椒粉，撒葱花，淋几滴香油关火。'
    ],
    tip: '裙带菜三分钟就泡开，别用热水泡，会发黏。'
  },
  {
    id: 'b14-013', name: '凉拌裙带菜', emoji: '🥗',
    need: ['wakame', 'cucumber'], extra: ['garlic', 'sesamoil', 'whitevinegar'], time: 10, level: 1,
    steps: [
      '干裙带菜冷水泡三分钟，洗净沙粒后沸水焯十秒，捞出过冰水。',
      '黄瓜拍碎切段，加一点盐腌五分钟，倒掉渗出的水。',
      '蒜末、白醋、生抽、糖和芝麻油调成料汁，尝一下咸淡。',
      '裙带菜和黄瓜放一起，淋料汁拌匀，冷藏十分钟更爽口。'
    ],
    tip: '焯完过冰水，裙带菜口感才脆不发黏。'
  },
  {
    id: 'b14-015', name: '紫菜虾皮汤', emoji: '🍲',
    need: ['seaweed', 'driedshrimp'], extra: ['scallion', 'sesamoil'], time: 8, level: 1,
    steps: [
      '紫菜撕成小片，虾皮用温水泡五分钟洗去浮盐，沥干。',
      '碗里放紫菜、虾皮、葱花和一点白胡椒。',
      '锅中烧开两碗水，加盐和生抽调味，冲入碗中。',
      '滴几滴芝麻油搅匀，趁热喝，汤鲜得不用鸡精。'
    ],
    tip: '用开水冲而不是久煮，紫菜才不会糊成一片。'
  },
  {
    id: 'b14-016', name: '虾皮烧冬瓜', emoji: '🍈',
    need: ['driedshrimp', 'wintermelon'], extra: ['garlic', 'scallion'], time: 20, level: 1,
    steps: [
      '虾皮温水泡五分钟沥干；冬瓜去皮去瓤，切成厚片。',
      '锅中少油下虾皮小火煸出香味，再放蒜末炒香。',
      '倒入冬瓜片中火翻炒两分钟，加小半碗水盖上焖八分钟。',
      '冬瓜变透明后调盐，大火收汁，撒葱花出锅。'
    ],
    tip: '虾皮煸过才香，冬瓜焖到透明最入味。'
  },
  {
    id: 'b14-017', name: '干贝烧萝卜', emoji: '🥕',
    need: ['driedscallop', 'radish'], extra: ['oyster', 'ginger', 'scallion'], time: 40, level: 2,
    steps: [
      '干贝用温水加一勺料酒泡三十分钟，撕成细丝，泡的水留着。',
      '白萝卜去皮切厚片，沸水焯三分钟去掉辛辣味。',
      '锅中爆香姜丝，下干贝丝小火炒出鲜味。',
      '放萝卜片、泡干贝的水和半碗清水，加蚝油烧开。',
      '转小火焖二十分钟至萝卜软糯，收汁撒葱花。'
    ],
    tip: '干贝泡发的水别倒，那是整道菜的鲜味来源。'
  },
  {
    id: 'b14-018', name: '干贝炒饭', emoji: '🍚',
    need: ['driedscallop', 'rice', 'egg'], extra: ['scallion', 'oyster'], time: 20, level: 2,
    steps: [
      '干贝温水加料酒泡三十分钟，撕成丝，上锅蒸十分钟备用。',
      '隔夜米饭用手抓散，加一点油拌开，炒的时候不结块。',
      '热锅下蛋液炒散，放干贝丝小火煸出香味。',
      '倒入米饭大火翻炒三分钟，加盐和一点蚝油。',
      '撒葱花大火翻匀，出锅前尝一下咸淡再装盘。'
    ],
    tip: '干贝先蒸再炒，鲜味才出得来还不发硬。'
  },
  {
    id: 'b14-019', name: '琥珀核桃', emoji: '🍯',
    need: ['walnut'], extra: ['sesame', 'honey'], time: 25, level: 3,
    steps: [
      '核桃仁沸水焯两分钟，捞出趁热剥掉薄皮，去掉涩味。',
      '核桃仁铺进烤盘，一百五十度烤八分钟至微微出香。',
      '小锅放糖和水小火熬到起小泡，加蜂蜜搅匀。',
      '倒入核桃仁快速翻拌，让每颗都裹上糖浆。',
      '撒白芝麻摊在油纸上晾凉，凉透后才酥脆。'
    ],
    tip: '糖浆别熬过头，微黄就下核桃，否则发苦。'
  },
  {
    id: 'b14-020', name: '核桃拌菠菜', emoji: '🥗',
    need: ['walnut', 'spinach'], extra: ['garlic', 'sesamoil', 'whitevinegar'], time: 15, level: 1,
    steps: [
      '核桃仁用温水泡十分钟剥去薄皮，小火干炒到香脆。',
      '菠菜洗净，沸水加几滴油焯三十秒，捞出过凉水。',
      '菠菜挤干水分切段，蒜末、白醋、生抽、糖、芝麻油调汁。',
      '淋在菠菜上拌匀，最后撒核桃仁，保持脆感。'
    ],
    tip: '核桃最后放，早拌会被汁泡软不脆。'
  },
  {
    id: 'b14-021', name: '板栗烧鸡', emoji: '🍗',
    need: ['chestnut', 'chickenleg'], extra: ['oyster', 'ginger', 'wine'], time: 45, level: 3,
    steps: [
      '板栗用刀划十字口，冷水下锅煮十分钟，趁热剥壳去内膜。',
      '鸡腿剁块冷水焯水，加料酒姜片去腥，捞出沥干。',
      '锅中少油下冰糖炒出糖色，倒入鸡块翻炒上色。',
      '加姜片、生抽、蚝油和热水没过鸡块，大火烧开。',
      '转小火焖二十分钟，放板栗再焖十分钟，收汁。'
    ],
    tip: '板栗后放，早了下锅会焖成碎泥。'
  },
  {
    id: 'b14-022', name: '板栗排骨汤', emoji: '🍲',
    need: ['chestnut', 'ribs', 'goji'], extra: ['ginger'], time: 70, level: 2,
    steps: [
      '板栗划口煮十分钟，剥壳去膜；排骨冷水下锅焯去血沫。',
      '排骨、姜片入砂锅，加足量开水，大火烧开转小火炖四十分钟。',
      '放入板栗继续炖二十分钟，汤色转成淡淡奶白。',
      '出锅前三分钟撒入枸杞，调盐关火，枸杞别久煮。'
    ],
    tip: '枸杞最后放，煮久了会发酸还会掉色。'
  },
  {
    id: 'b14-023', name: '板栗烧肉', emoji: '🍖',
    need: ['chestnut', 'porkbelly'], extra: ['staranise', 'ginger', 'rocksugar'], time: 60, level: 3,
    steps: [
      '板栗划十字口煮十分钟，趁热剥壳，撕净褐色内膜。',
      '五花肉切块冷水下锅焯水，捞出擦干表面水分。',
      '锅内少油下冰糖炒糖色，倒肉块翻炒至均匀上色。',
      '加姜片、八角、老抽和热水没过肉，小火炖三十分钟。',
      '放板栗再炖十五分钟，大火收汁至浓稠发亮。'
    ],
    tip: '五花肉擦干再下锅，不溅油还容易上色。'
  },
  {
    id: 'b14-024', name: '红枣蒸南瓜', emoji: '🎃',
    need: ['jujube', 'pumpkin'], extra: ['honey', 'rocksugar'], time: 25, level: 1,
    steps: [
      '红枣温水泡十分钟，剪开去掉枣核，撕成小条。',
      '南瓜去皮去瓤，切成两指厚的片，整齐码进盘里。',
      '红枣条均匀铺在南瓜上，撒几粒冰糖增加甜味。',
      '水开后上锅蒸十五分钟，筷子能轻松戳透即可。',
      '出锅淋一点蜂蜜，趁温热吃最软糯。'
    ],
    tip: '挑老南瓜，蒸出来才粉甜不水。'
  },
  {
    id: 'b14-025', name: '银耳莲子羹', emoji: '🥣',
    need: ['tremella', 'lotusseed', 'jujube', 'goji'], extra: ['rocksugar'], time: 80, level: 1,
    steps: [
      '银耳冷水泡两小时至完全发开，剪掉黄色硬蒂，撕成小朵。',
      '莲子温水泡一小时，掰开去掉绿色莲心，不然会发苦。',
      '银耳和莲子入锅，加足量水大火烧开，转小火炖一小时。',
      '放红枣和冰糖再炖十五分钟，汤变浓稠出胶。',
      '关火前撒枸杞焖五分钟，凉了会更稠。'
    ],
    tip: '银耳撕得越小越容易出胶，硬蒂必须剪掉。'
  },
  {
    id: 'b14-026', name: '莲子猪肚汤', emoji: '🍲',
    need: ['lotusseed', 'porktripe'], extra: ['ginger', 'pepper', 'wine'], time: 90, level: 3,
    steps: [
      '猪肚用面粉和盐反复搓洗三遍，冲净黏液，再去掉内壁白油。',
      '猪肚冷水下锅，加料酒姜片焯五分钟，捞出切条。',
      '莲子温水泡一小时去芯，和猪肚、姜片一起放进砂锅。',
      '加足量开水，大火烧开转小火炖一个半小时。',
      '汤色发白时调盐和白胡椒，撒葱花即可。'
    ],
    tip: '猪肚用面粉搓比用碱好，去腥又不伤手。'
  },
  {
    id: 'b14-027', name: '百合炒西芹', emoji: '🥬',
    need: ['lilybulb', 'celery'], extra: ['garlic', 'starch'], time: 15, level: 2,
    steps: [
      '鲜百合掰成小瓣，削掉根部发褐的部分，冷水泡五分钟洗净。',
      '西芹撕去老筋，斜刀切段，沸水加盐焯二十秒捞出过凉。',
      '锅中少油爆香蒜末，下西芹大火翻炒三十秒。',
      '放百合快炒一分钟，百合边缘变透明就熟了。',
      '调盐，淋一点水淀粉勾薄芡，出锅保持脆嫩。'
    ],
    tip: '百合别久炒，边缘透明就关火，炒久发苦。'
  },
  {
    id: 'b14-028', name: '百合绿豆汤', emoji: '🥣',
    need: ['lilybulb', 'mungbean'], extra: ['rocksugar'], time: 50, level: 1,
    steps: [
      '绿豆洗净用清水泡两小时，泡到豆皮微微开裂。',
      '鲜百合掰瓣洗净，削去根部褐色部分，泡在清水里备用。',
      '绿豆加六碗水大火烧开，转小火煮三十分钟至开花。',
      '放冰糖煮化，再下百合煮三分钟关火。',
      '晾凉后放冰箱冷藏两小时，天热喝着最解燥。'
    ],
    tip: '百合最后三分钟下，早了会煮化没口感。'
  },
  {
    id: 'b14-029', name: '凉拌双耳', emoji: '🥗',
    need: ['fungus', 'tremella'], extra: ['garlic', 'sesamoil', 'whitevinegar'], time: 25, level: 1,
    steps: [
      '木耳冷水泡一小时，银耳冷水泡两小时，都剪去硬蒂撕小朵。',
      '两种耳分别沸水焯两分钟，木耳久一点，捞出过冰水。',
      '沥干水分，加蒜末、白醋、生抽、糖和芝麻油。',
      '拌匀后冷藏二十分钟，入味更爽脆。'
    ],
    tip: '木耳忌热水泡，冷水慢慢发才够脆。'
  },
  {
    id: 'b14-030', name: '木耳炒白菜', emoji: '🥬',
    need: ['fungus', 'cabbage'], extra: ['garlic', 'oyster'], time: 15, level: 2,
    steps: [
      '木耳冷水泡一小时至完全涨发，剪去根部，撕成小朵洗净。',
      '白菜帮斜刀片薄，菜叶手撕成块，帮和叶分开放。',
      '热锅爆香蒜末，先下白菜帮大火炒一分钟。',
      '放木耳和菜叶翻炒两分钟，加蚝油和盐炒匀。',
      '出锅前淋一点香油，菜帮脆、木耳弹。'
    ],
    tip: '菜帮先炒再下叶，一盘里脆嫩都有。'
  },
  {
    id: 'b14-031', name: '黄花菜炒肉丝', emoji: '🍖',
    need: ['daylily', 'porkloin'], extra: ['garlic', 'oyster'], time: 20, level: 2,
    steps: [
      '干黄花菜温水泡三十分钟，中途换水两次，掐掉硬根。',
      '泡好的黄花菜沸水焯两分钟，彻底去掉秋水仙碱的涩味。',
      '里脊切丝，加生抽、淀粉抓匀腌十分钟。',
      '热锅滑油炒散肉丝至变色，加蒜末炒香。',
      '下黄花菜大火翻炒两分钟，调盐和蚝油出锅。'
    ],
    tip: '黄花菜必须泡透再焯水，绝不能生着下锅。'
  },
  {
    id: 'b14-032', name: '黄花菜排骨汤', emoji: '🍲',
    need: ['daylily', 'ribs', 'jujube'], extra: ['ginger'], time: 70, level: 2,
    steps: [
      '干黄花菜温水泡三十分钟，中途换水，掐掉硬蒂反复洗净。',
      '排骨冷水下锅焯去血沫，捞出用温水冲一遍。',
      '排骨、姜片、红枣入砂锅，加开水大火烧开后转小火炖四十分钟。',
      '放黄花菜再炖十五分钟，汤带一点微酸的回甘。'
    ],
    tip: '黄花菜泡到水清再下锅，汤才不发涩。'
  },
  {
    id: 'b14-033', name: '凉拌海带丝', emoji: '🥗',
    need: ['kelp'], extra: ['garlic', 'chilipowder', 'sesamoil'], time: 30, level: 1,
    steps: [
      '干海带冷水泡两小时，中途换两次水，洗掉表面白霜和沙。',
      '海带卷起切细丝，沸水焯三分钟，捞出过凉水沥干。',
      '蒜末、辣椒面放碗里，浇一勺热油激出香味。',
      '加生抽、白醋、糖和芝麻油调匀，倒在海带丝上。',
      '拌好后冷藏二十分钟，口感更脆更入味。'
    ],
    tip: '海带别泡太久，两小时足够，泡久了发软。'
  },
  {
    id: 'b14-034', name: '海带烧肉', emoji: '🍖',
    need: ['kelp', 'porkbelly'], extra: ['ginger', 'staranise'], time: 60, level: 3,
    steps: [
      '干海带冷水泡两小时洗净，切宽条后打结，沸水焯三分钟。',
      '五花肉切块冷水焯水，捞出擦干，锅中煸炒至微黄出油。',
      '加姜片、八角、老抽和料酒炒香，倒热水没过肉块。',
      '大火烧开转小火炖三十分钟，放海带结再炖二十分钟。',
      '调盐后大火收汁，海带吸饱肉汁最下饭。'
    ],
    tip: '海带结别切太小，炖久了容易散开。'
  },
  {
    id: 'b14-035', name: '海带豆腐汤', emoji: '🍲',
    need: ['kelp', 'tofu'], extra: ['scallion', 'pepper'], time: 20, level: 1,
    steps: [
      '干海带冷水泡两小时，洗净切菱形片，沸水焯两分钟去腥。',
      '嫩豆腐切块，用淡盐水泡五分钟，煮时不易碎。',
      '锅中加两碗水烧开，放入海带煮五分钟。',
      '下豆腐转中小火煮三分钟，调盐和白胡椒粉。',
      '撒葱花，滴几滴香油，关火盛出，汤清味鲜。'
    ],
    tip: '海带先焯水，汤才不腥不浑。'
  },
  {
    id: 'b14-036', name: '银耳炖梨', emoji: '🍐',
    need: ['tremella', 'pear', 'goji'], extra: ['rocksugar'], time: 60, level: 1,
    steps: [
      '银耳冷水泡两小时，剪掉黄色硬蒂，撕成小朵，越小越出胶。',
      '梨洗净去核，带皮切滚刀块，皮别削掉更润。',
      '银耳加水大火烧开，转小火炖四十分钟至汤稠。',
      '放梨块和冰糖再炖十五分钟，梨变透明即可。',
      '关火撒入枸杞焖五分钟，温热喝最润喉。'
    ],
    tip: '梨带皮炖才润，银耳泡够两小时才出胶。'
  },
  {
    id: 'b14-037', name: '香菇鸡肉粥', emoji: '🥣',
    need: ['shiitake', 'chickenbreast', 'rice'], extra: ['ginger', 'scallion'], time: 40, level: 2,
    steps: [
      '干香菇温水泡三十分钟，泡软后切薄片，泡菇水沉淀留上层。',
      '大米淘洗后加泡菇水和清水，大火烧开转小火煮二十分钟。',
      '鸡胸切小丁，加盐、淀粉和姜丝抓匀腌十分钟。',
      '粥变稠后下香菇片煮五分钟，再放鸡丁煮三分钟。',
      '调盐和白胡椒，撒葱花，滴几滴香油。'
    ],
    tip: '鸡丁最后下，煮三分钟就熟，久了发柴。'
  },
  {
    id: 'b14-038', name: '番茄金针菇汤', emoji: '🍅',
    need: ['enoki', 'tomato'], extra: ['garlic', 'scallion'], time: 15, level: 1,
    steps: [
      '金针菇切掉老根，掰散洗净，沸水焯一分钟去掉涩味。',
      '番茄顶部划十字，开水烫一分钟去皮，切小丁。',
      '锅中少油下番茄丁，加一点盐炒出红汤。',
      '加两碗热水烧开，放金针菇煮三分钟。',
      '调盐，撒葱花，喜欢酸可以再点几滴醋。'
    ],
    tip: '番茄用盐炒才出沙，汤色更红更浓。'
  },
  {
    id: 'b14-039', name: '软炸平菇', emoji: '🍄',
    need: ['mushroom', 'egg'], extra: ['starch', 'peppersalt', 'pepper'], time: 25, level: 3,
    steps: [
      '平菇撕成条，加盐抓匀腌五分钟，挤干渗出的水分。',
      '鸡蛋、淀粉和面粉调成能挂住的糊，加一点盐和白胡椒。',
      '平菇条裹匀面糊，抖掉挂不住的厚糊，免得炸不透。',
      '油温六成热下锅，中火炸三分钟至浅黄捞出。',
      '油温升高复炸三十秒，撒椒盐趁热吃。'
    ],
    tip: '平菇一定挤干水，否则下油锅会炸得很凶。'
  },
  {
    id: 'b14-040', name: '黑椒杏鲍菇', emoji: '🍄',
    need: ['kingoyster'], extra: ['blackpepper', 'oyster', 'garlic'], time: 15, level: 2,
    steps: [
      '杏鲍菇切厚片，两面打十字花刀，容易入味也不卷。',
      '平底锅刷薄油，中火把菇片煎至两面金黄。',
      '煎的时候会出水，耐心等水收干再翻面。',
      '加蒜末、黑胡椒碎和蚝油，翻匀让酱汁裹满。',
      '调少许盐翻匀出锅，口感弹得像在吃肉。'
    ],
    tip: '杏鲍菇要煎到水干才香，中途别急着翻。'
  },
  {
    id: 'b14-041', name: '白玉菇蛋花汤', emoji: '🍲',
    need: ['shimeji', 'egg'], extra: ['scallion', 'sesamoil'], time: 12, level: 1,
    steps: [
      '白玉菇切去根部，掰散洗净，沸水焯一分钟捞出。',
      '锅中加两碗水烧开，放入白玉菇煮三分钟。',
      '鸡蛋打散，沿锅边转圈缓缓淋入，静置十秒再推。',
      '蛋花浮起后调盐和白胡椒，撒葱花。',
      '滴几滴芝麻油关火盛出，汤清蛋花嫩。'
    ],
    tip: '淋蛋液时火要小，蛋花才成片不散。'
  },
  {
    id: 'b14-042', name: '香煎口蘑', emoji: '🍄',
    need: ['buttonmushroom'], extra: ['blackpepper', 'cheese'], time: 15, level: 1,
    steps: [
      '口蘑用湿布擦净，不要泡水，掰掉菌柄只留菌盖。',
      '平底锅放一点黄油或食用油，菌盖朝下小火煎三分钟。',
      '翻面再煎两分钟，菌盖里会积出一汪鲜汁。',
      '撒盐和黑胡椒，关火后放一片芝士盖住焖化。'
    ],
    tip: '口蘑别水洗，用布擦，煎的时候才不溅油。'
  },
  {
    id: 'b14-043', name: '茶树菇老鸭汤', emoji: '🍲',
    need: ['teatree', 'duck'], extra: ['ginger', 'wine'], time: 90, level: 2,
    steps: [
      '干茶树菇剪掉老根，温水泡三十分钟，反复洗净泥沙。',
      '鸭腿剁块冷水下锅，加料酒姜片焯水，撇净浮沫捞出。',
      '鸭块、茶树菇和姜片入砂锅，加足量开水。',
      '大火烧开转小火炖一个半小时，汤色转深。',
      '调盐再煮五分钟，出锅撒少许葱花。'
    ],
    tip: '茶树菇根硬味苦，剪干净汤才不涩。'
  },
  {
    id: 'b14-044', name: '老醋花生', emoji: '🥜',
    need: ['peanut', 'cilantro'], extra: ['whitevinegar', 'garlic'], time: 20, level: 3,
    steps: [
      '花生米挑去坏粒，冷油下锅小火慢炸，边炸边搅。',
      '听到噼啪声变密就捞出，摊开晾凉才会脆。',
      '蒜末、香菜段、白醋、生抽、糖和一点盐调成汁。',
      '汁倒进晾凉的花生米里拌匀，泡五分钟更入味。'
    ],
    tip: '花生冷油下锅，炸好晾凉才酥，热时是软的。'
  },
  {
    id: 'b14-045', name: '西湖牛肉羹', emoji: '🥣',
    need: ['beef', 'egg', 'tofu', 'cilantro'], extra: ['starch', 'pepper'], time: 25, level: 2,
    steps: [
      '牛里脊剁成细末，加一点盐、淀粉和水抓匀，腌十分钟。',
      '嫩豆腐切小丁，沸水焯一分钟去豆腥，捞出沥干。',
      '锅中加两碗高汤或清水烧开，下牛肉末划散，撇去浮沫。',
      '放豆腐丁煮三分钟，淋水淀粉勾芡至微稠。',
      '关小火淋蛋清搅出蛋花，撒香菜和白胡椒。'
    ],
    tip: '勾芡后再淋蛋清，蛋花才细滑不成块。'
  },
  {
    id: 'b14-046', name: '什锦菌菇汤', emoji: '🍲',
    need: ['shiitake', 'enoki', 'shimeji', 'kingoyster'], extra: ['scallion', 'pepper'], time: 25, level: 1,
    steps: [
      '香菇泡软切片，金针菇去根撕散，白玉菇去根，杏鲍菇切片。',
      '四种菇分别沸水焯一分钟，去掉生味和多余水分。',
      '锅中少油下香菇片炒香，加两碗热水烧开。',
      '放其余三种菇煮五分钟，调盐和白胡椒。',
      '撒葱花，滴两滴香油，趁热喝最鲜。'
    ],
    tip: '几种菇先焯再煮，汤不浑也没有生涩味。'
  },
  {
    id: 'b14-047', name: '干贝鸡丝羹', emoji: '🥣',
    need: ['driedscallop', 'chickenbreast', 'egg', 'cilantro'], extra: ['starch'], time: 30, level: 2,
    steps: [
      '干贝加温水、一勺料酒泡三十分钟，撕成丝，上锅蒸十分钟。',
      '鸡胸冷水下锅煮十分钟，晾凉后顺着纹理撕成细丝。',
      '锅中加两碗水烧开，放干贝丝和鸡丝煮三分钟。',
      '淋水淀粉勾薄芡，边倒边搅，避免结块。',
      '关小火淋蛋液搅出蛋花，撒香菜和白胡椒。'
    ],
    tip: '干贝自带咸鲜，调味前先尝，盐要少放。'
  },
  {
    id: 'b14-048', name: '核桃燕麦粥', emoji: '🥣',
    need: ['walnut', 'oats', 'milk'], extra: ['honey'], time: 15, level: 1,
    steps: [
      '核桃仁掰成小块，小火干炒两分钟，炒出香味盛出。',
      '燕麦片加两碗水，中火煮五分钟至变稠。',
      '倒入牛奶转小火再煮两分钟，别煮沸溢出。',
      '关火加蜂蜜调甜，撒核桃碎和几粒枸杞。'
    ],
    tip: '牛奶最后加，久煮会起膜还容易糊底。'
  },
  {
    id: 'b14-050', name: '山药枸杞鸡汤', emoji: '🍲',
    need: ['yam', 'goji', 'chickenleg', 'jujube'], extra: ['ginger'], time: 60, level: 2,
    steps: [
      '鸡腿剁块冷水下锅焯去血沫，捞出用温水冲净。',
      '山药去皮切段，泡在清水里防止氧化变黑。',
      '鸡块、姜片、红枣入砂锅，加开水大火烧开后转小火炖三十分钟。',
      '放山药再炖十五分钟，山药变软糯即可。',
      '出锅前撒枸杞焖三分钟，调盐关火。'
    ],
    tip: '山药最后放，煮久了会化在汤里。'
  },
  {
    id: 'b15-blackrice-jujube', name: '黑米红枣粥', emoji: '🥣',
    need: ['blackrice', 'jujube', 'glutinousrice'], extra: ['rocksugar'], time: 55, level: 1,
    steps: [
      '黑米50克、糯米30克淘净，冷水泡2小时，红枣6颗去核撕小块。',
      '锅中加水1200毫升，米和枣一起下锅，大火烧开转小火。',
      '盖盖留缝煮40分钟，每隔10分钟顺一个方向搅动防糊底。',
      '米粒开花汤变浓稠时放冰糖，搅化后再煮3分钟关火。'
    ],
    tip: '黑米外皮硬，泡不够两小时煮不糯。'
  },
  {
    id: 'b15-blackrice-cake', name: '黑米蒸糕', emoji: '🍘',
    need: ['blackrice', 'flour', 'milk'], extra: ['yeast', 'rocksugar'], time: 80, level: 2,
    steps: [
      '黑米100克泡4小时，连少量清水打成细米浆，过筛去掉粗渣。',
      '米浆加面粉150克、牛奶100毫升、酵母3克、冰糖粉40克拌成稠糊。',
      '盖保鲜膜放温暖处发1小时，表面起密集小泡后搅一下排气。',
      '倒进抹油的模具七分满，冷水上锅，水开蒸25分钟再焖5分钟。'
    ],
    tip: '关火别急开盖，焖五分钟糕面不回缩。'
  },
  {
    id: 'b15-blackrice-roll', name: '黑米油条饭团', emoji: '🍙',
    need: ['blackrice', 'glutinousrice', 'youtiao', 'zhacai'], extra: ['sesame'], time: 45, level: 2,
    steps: [
      '黑米80克、糯米120克泡3小时，混匀后加水没过一指节。',
      '电饭煲煮熟再焖10分钟，趁热拌入少许盐和香油。',
      '竹帘铺保鲜膜，摊一层米饭压平，放半根油条和榨菜丝。',
      '用帘子卷紧成筒，两头往中间收，静置2分钟再切段。'
    ],
    tip: '米饭要趁热卷，凉了发硬卷不紧。'
  },
  {
    id: 'b15-udon-curry', name: '咖喱乌冬面', emoji: '🍜',
    need: ['udon', 'onion', 'carrot'], extra: ['curry'], time: 20, level: 1,
    steps: [
      '洋葱半个切丝，胡萝卜半根切薄片，乌冬面200克拆开备用。',
      '热油把洋葱炒到透明，下胡萝卜片翻炒1分钟。',
      '加水500毫升烧开，放咖喱块2小块，小火搅到完全化开。',
      '下乌冬面煮3分钟，汤汁略稠时关火，撒葱花。'
    ],
    tip: '咖喱块先化开再放面，不容易结块。'
  },
  {
    id: 'b15-udon-beef', name: '肥牛炒乌冬', emoji: '🍜',
    need: ['udon', 'beefroll', 'onion'], extra: ['oyster', 'blackpepper'], time: 15, level: 1,
    steps: [
      '乌冬面200克用开水烫1分钟，捞出沥干抖散。',
      '洋葱半个切粗丝，肥牛卷150克解冻后一片片拆散。',
      '热锅下油，肥牛大火炒到刚变色立刻盛出，别炒老。',
      '原锅炒洋葱，下乌冬和肥牛，加蚝油1勺、黑胡椒翻匀。'
    ],
    tip: '乌冬先烫过再炒，不粘锅也不发坨。'
  },
  {
    id: 'b15-udon-shrimp', name: '番茄鲜虾乌冬', emoji: '🍜',
    need: ['udon', 'tomato', 'shrimp'], extra: ['oyster'], time: 20, level: 1,
    steps: [
      '番茄2个划十字烫去皮切块，虾8只去虾线剪掉虾枪。',
      '热油下番茄块，中火边压边炒3分钟至出红汁。',
      '加600毫升热水烧开，下乌冬面煮2分钟。',
      '放虾仁煮1分半至卷曲变红，加蚝油和盐调味。'
    ],
    tip: '番茄一定炒出沙，汤才够浓。'
  },
  {
    id: 'b15-udon-egg', name: '荷包蛋乌冬', emoji: '🍜',
    need: ['udon', 'egg', 'bokchoy'], extra: ['sesamoil'], time: 15, level: 1,
    steps: [
      '小锅加水500毫升烧开，转小火打入鸡蛋，煮3分钟成荷包蛋。',
      '乌冬面200克下锅煮2分钟，小青菜2棵最后1分钟放入。',
      '碗里放生抽1勺、香油几滴，冲一勺热汤化开。',
      '捞面入碗，摆上荷包蛋和小青菜即可。'
    ],
    tip: '水微沸再打蛋，蛋形完整不散。'
  },
  {
    id: 'b15-soba-sesame', name: '麻酱荞麦面', emoji: '🍜',
    need: ['sobanoodle', 'cucumber'], extra: ['tahini', 'garlic', 'sesame'], time: 15, level: 1,
    steps: [
      '荞麦面100克下开水煮4分钟，捞出过两遍凉水沥干。',
      '芝麻酱2勺用温水少量多次澥开，调到能挂住勺子的稠度。',
      '加蒜末、生抽2勺、醋1勺、香油半勺拌成料汁。',
      '面装盘，铺黄瓜丝，淋料汁撒白芝麻拌匀。'
    ],
    tip: '麻酱用温水顺一个方向澥，不起疙瘩。'
  },
  {
    id: 'b15-soba-cold', name: '日式荞麦冷面', emoji: '🍜',
    need: ['sobanoodle', 'seaweed'], extra: ['mirin', 'scallion'], time: 15, level: 1,
    steps: [
      '荞麦面100克煮4分钟，捞出立刻放冰水搓洗掉表面淀粉。',
      '碗中放生抽3勺、味醂1勺、凉开水4勺调成蘸汁。',
      '蘸汁里加葱花和撕碎的紫菜，放冰箱冰5分钟。',
      '面条沥干装竹帘，配蘸汁，吃时夹一小筷蘸一下。'
    ],
    tip: '面洗完要冰镇，口感才弹。'
  },
  {
    id: 'b15-soba-beef', name: '牛肉荞麦汤面', emoji: '🍜',
    need: ['sobanoodle', 'beef', 'spinach'], extra: ['oyster'], time: 25, level: 1,
    steps: [
      '牛肉100克逆纹切薄片，加生抽、淀粉抓匀腌10分钟。',
      '锅中水开下荞麦面煮4分钟，捞出装碗。',
      '另起锅加清水或高汤400毫升，下牛肉片滑散煮1分钟。',
      '放菠菜段烫软，加蚝油调味，连汤浇在面上。'
    ],
    tip: '牛肉逆着纹路切，煮久也不柴。'
  },
  {
    id: 'b15-youtiao-soymilk', name: '咸豆浆油条', emoji: '🥣',
    need: ['youtiao', 'soybean', 'zhacai', 'driedshrimp'], extra: ['sesamoil'], time: 25, level: 1,
    steps: [
      '干黄豆80克泡一夜，加1000毫升水打成生豆浆后滤渣。',
      '豆浆中火煮开，转小火再煮8分钟，一定要彻底煮透。',
      '碗里放醋1勺、榨菜末、虾皮和几滴香油。',
      '滚烫豆浆从高处冲进碗里，静置1分钟起絮，泡油条段吃。'
    ],
    tip: '豆浆必须煮沸两遍，生豆浆有毒。'
  },
  {
    id: 'b15-jianbing', name: '煎饼果子', emoji: '🥞',
    need: ['flour', 'youtiao', 'egg'], extra: ['sweetbeanpaste', 'sesame'], time: 20, level: 2,
    steps: [
      '面粉100克加清水150毫升、盐少许，搅成能流动的稀糊。',
      '平底锅刷薄油小火加热，倒一勺面糊转锅摊成薄圆片。',
      '面皮边缘翘起时打一个鸡蛋，用铲子摊匀在表面。',
      '撒葱花和白芝麻，翻面刷甜面酱，放油条卷起对折。'
    ],
    tip: '面糊稀一点才摊得薄，全程小火。'
  },
  {
    id: 'b15-youtiao-shrimp', name: '油条酿虾滑', emoji: '🍤',
    need: ['youtiao', 'shrimppaste'], extra: ['pepper'], time: 25, level: 2,
    steps: [
      '油条2根剪成5厘米段，用筷子从中间捅松内部。',
      '虾滑150克装裱花袋，挤进油条空心处，两头抹平。',
      '平底锅少油中小火，接口朝下先煎1分钟定型。',
      '翻面再煎2分钟至外壳酥脆，撒白胡椒粉出锅。'
    ],
    tip: '小火慢煎，火大外壳焦里面还凉。'
  },
  {
    id: 'b15-springroll-sanzi', name: '三丝春卷', emoji: '🥟',
    need: ['springrollwrapper', 'cabbage', 'carrot', 'porkloin'], extra: ['oyster'], time: 40, level: 2,
    steps: [
      '白菜200克、胡萝卜半根、里脊100克分别切成细丝。',
      '热油先炒肉丝变色，下胡萝卜和白菜炒软，加蚝油收干汤汁。',
      '馅料盛出摊凉并沥干水分，太湿下锅必破皮。',
      '春卷皮放馅在下方三分之一处，卷一圈折两边再卷紧，封口抹面糊。',
      '油温六成热下锅，中小火炸3分钟至金黄。'
    ],
    tip: '馅一定放凉沥干，热馅必破皮。'
  },
  {
    id: 'b15-springroll-redbean', name: '豆沙春卷', emoji: '🥟',
    need: ['springrollwrapper', 'redbean'], extra: ['rocksugar'], time: 35, level: 1,
    steps: [
      '红豆150克泡4小时，加水煮40分钟至一捏就烂。',
      '沥去多余水，加冰糖50克，用勺子压成带颗粒的豆沙。',
      '豆沙搓成拇指粗的条，春卷皮包入卷紧，封口抹水淀粉。',
      '油温五成热下锅，小火炸4分钟，中间翻动上色均匀。'
    ],
    tip: '豆沙别炒太稀，否则炸时爆皮。'
  },
  {
    id: 'b15-cornmeal-wotou', name: '玉米面窝头', emoji: '🌽',
    need: ['cornmeal', 'flour'], extra: ['bakingsoda'], time: 40, level: 2,
    steps: [
      '玉米面200克、面粉100克混匀，小苏打2克用温水化开倒入。',
      '分次加温水约180毫升，揉成不粘手的团，盖布醒20分钟。',
      '揪成50克一个的剂子，搓圆后用拇指在底部顶出窝。',
      '冷水上锅，大火蒸20分钟，关火焖3分钟再开盖。'
    ],
    tip: '加三成白面，窝头才不散不噎。'
  },
  {
    id: 'b15-cornmeal-fagao', name: '玉米面发糕', emoji: '🍞',
    need: ['cornmeal', 'flour', 'milk'], extra: ['yeast', 'rocksugar'], time: 90, level: 2,
    steps: [
      '玉米面150克用100毫升开水烫成絮状，放凉到温热。',
      '加面粉150克、牛奶120毫升、酵母4克、糖40克揉成软团。',
      '盖保鲜膜温暖处发1小时，体积涨到两倍、戳洞不回缩。',
      '排气后倒入铺纸的模具，二次醒15分钟，表面撒红枣碎。',
      '水开上锅蒸30分钟，关火焖5分钟再取出。'
    ],
    tip: '玉米面先用开水烫过，口感才细腻。'
  },
  {
    id: 'b15-cornmeal-paste', name: '玉米面糊糊', emoji: '🥣',
    need: ['cornmeal'], extra: ['rocksugar'], time: 10, level: 1,
    steps: [
      '玉米面50克放碗里，加100毫升凉水搅到没有干粉颗粒。',
      '锅中加500毫升清水烧开，然后转成小火。',
      '一手把面糊缓缓倒入，一手拿勺不停搅动防沉底。',
      '小火煮3分钟至微微冒泡变稠，盛出按口味加糖。'
    ],
    tip: '一定用凉水先调开，直接下锅会结块。'
  },
  {
    id: 'b15-cornmeal-caitou', name: '玉米面菜团子', emoji: '🌽',
    need: ['cornmeal', 'bokchoy', 'driedshrimp'], extra: ['sesamoil'], time: 45, level: 2,
    steps: [
      '小青菜400克焯水1分钟，过凉后挤干水分切碎。',
      '加虾皮20克、香油1勺、盐拌匀，攥成乒乓球大的菜团。',
      '玉米面200克放盆里，菜团滚一圈裹粉，蘸水再滚，重复三次至厚实。',
      '笼屉铺湿布摆好，水开后蒸15分钟即可。'
    ],
    tip: '菜一定挤干水，团子才不塌。'
  },
  {
    id: 'b15-oats-milk', name: '燕麦牛奶粥', emoji: '🥣',
    need: ['oats', 'milk'], extra: ['honey'], time: 10, level: 1,
    steps: [
      '即食燕麦片50克倒入碗中，加牛奶250毫升搅一下。',
      '微波炉高火加热90秒，取出搅匀，再热30秒。',
      '静置2分钟让燕麦吸饱奶，粥会变得更稠。',
      '温度降到不烫嘴时再淋蜂蜜，撒几粒坚果碎。'
    ],
    tip: '蜂蜜别趁热加，高温会破坏风味。'
  },
  {
    id: 'b15-oats-pancake', name: '燕麦鸡蛋饼', emoji: '🥞',
    need: ['oats', 'egg', 'flour'], extra: ['pepper'], time: 15, level: 1,
    steps: [
      '燕麦片40克用80毫升温水泡5分钟至变软。',
      '加鸡蛋1个、面粉60克、盐和胡椒粉，搅成略稠的糊。',
      '平底锅刷薄油小火，倒入面糊摊平成圆饼。',
      '一面定型约2分钟后翻面，再煎1分半至两面微黄。'
    ],
    tip: '糊能缓慢流动最好，太稠饼会硬。'
  },
  {
    id: 'b15-oats-rice', name: '燕麦杂粮饭', emoji: '🍚',
    need: ['oats', 'rice', 'millet'], extra: [], time: 40, level: 1,
    steps: [
      '燕麦米40克、小米30克淘洗后泡1小时，大米150克淘净。',
      '三种米混匀倒入电饭煲，加水比平时煮饭多半格。',
      '滴几滴油，按下煮饭键，跳闸后再焖10分钟。',
      '开盖用饭勺翻松，让水汽散掉再盛碗。'
    ],
    tip: '燕麦米难熟，泡够一小时再煮。'
  },
  {
    id: 'b15-friedrice-soy', name: '酱油炒饭', emoji: '🍚',
    need: ['rice', 'egg'], extra: ['scallion', 'pepper'], time: 10, level: 1,
    steps: [
      '隔夜米饭1碗用手抓散，鸡蛋1个打散备用。',
      '热锅多放一点油，倒入蛋液炒成小块盛出。',
      '原锅下米饭，中大火不停翻炒2分钟至粒粒分明。',
      '沿锅边淋生抽1勺半，加蛋块和葱花炒匀，撒白胡椒粉。'
    ],
    tip: '用隔夜冷饭，水分少才炒得散。'
  },
  {
    id: 'b15-friedrice-kimchi', name: '泡菜炒饭', emoji: '🍚',
    need: ['rice', 'kimchi', 'egg', 'seaweed'], extra: ['sesamoil'], time: 12, level: 1,
    steps: [
      '辣白菜100克切碎，攥出的汁单独留着备用。',
      '热油下辣白菜碎炒1分钟，炒出酸香味。',
      '下隔夜饭1碗炒散，淋两勺泡菜汁翻匀上色。',
      '中间扒个坑打入鸡蛋，炒到蛋液裹住饭粒，淋香油撒紫菜碎。'
    ],
    tip: '泡菜汁是灵魂，别倒掉了。'
  },
  {
    id: 'b15-rice-pumpkin', name: '南瓜焖饭', emoji: '🍚',
    need: ['rice', 'pumpkin', 'bacon'], extra: ['oyster'], time: 40, level: 1,
    steps: [
      '南瓜300克去皮切2厘米块，培根2片切成小片。',
      '大米200克淘净入锅，水量比平时少一点，铺上南瓜和培根。',
      '加蚝油1勺、盐少许，按下煮饭键。',
      '跳闸后别开盖，焖10分钟，开盖把南瓜轻轻拌进饭里。'
    ],
    tip: '南瓜会出水，煮饭水要减一成。'
  },
  {
    id: 'b15-rice-tomato', name: '番茄玉米焖饭', emoji: '🍚',
    need: ['rice', 'tomato', 'corn', 'chinesesausage'], extra: ['oyster'], time: 40, level: 1,
    steps: [
      '番茄2个去蒂划十字，玉米粒100克，腊肠1根切薄片。',
      '大米200克淘净入锅，水按正常量，番茄整颗放正中间。',
      '周围铺玉米粒和腊肠，淋蚝油1勺，按下煮饭键。',
      '跳闸后焖10分钟，开盖挑掉番茄皮，把番茄压碎拌匀。'
    ],
    tip: '番茄整颗焖，汁水才不流失。'
  },
  {
    id: 'b15-babao', name: '八宝饭', emoji: '🍚',
    need: ['glutinousrice', 'redbean', 'jujube', 'lotusseed'], extra: ['rocksugar'], time: 90, level: 2,
    steps: [
      '糯米300克泡4小时，莲子20颗泡软去芯，红枣8颗去核。',
      '糯米上锅蒸30分钟至透明，趁热拌入冰糖粉40克和少许油。',
      '碗内壁抹油，红枣莲子红豆铺底，填入糯米压实。',
      '再上锅蒸20分钟，取出倒扣进盘，淋一勺糖水。'
    ],
    tip: '碗壁抹油，倒扣时才完整脱模。'
  },
  {
    id: 'b15-ciba', name: '红糖糍粑', emoji: '🍘',
    need: ['glutinousrice'], extra: ['brownsugar', 'sesame'], time: 55, level: 2,
    steps: [
      '糯米200克泡4小时，铺笼布上锅蒸30分钟至软烂。',
      '趁热倒入抹油的盆，用擀面杖反复捶捣10分钟成黏团。',
      '手上蘸水，把糯米团搓成长条，压扁切成5厘米段。',
      '少油小火煎至两面金黄，另起锅熬红糖水淋上，撒白芝麻。'
    ],
    tip: '捶得越久越糯，别怕费力气。'
  },
  {
    id: 'b15-millet-jujube', name: '小米红枣粥', emoji: '🥣',
    need: ['millet', 'jujube'], extra: ['rocksugar'], time: 40, level: 1,
    steps: [
      '小米80克淘洗两遍，红枣6颗去核切成长条。',
      '锅中加1000毫升水烧开，下小米和红枣。',
      '大火煮5分钟后转小火，盖盖煮25分钟。',
      '期间搅动三四次防粘底，粥面浮起米油时加冰糖。'
    ],
    tip: '小米别搓洗太久，营养在表层。'
  },
  {
    id: 'b15-noodle-oil', name: '油泼面', emoji: '🍜',
    need: ['noodle', 'beansprout'], extra: ['chilipowder', 'scallion', 'garlic'], time: 20, level: 2,
    steps: [
      '宽面条200克，豆芽100克洗净，大蒜切末，小葱切花。',
      '水开下面条煮3分钟，最后30秒下豆芽一起烫。',
      '捞出面和豆芽装碗，上面堆蒜末、葱花、辣椒面2勺和盐。',
      '锅中烧油至冒青烟，分两次泼在辣椒面上，拌醋即可。'
    ],
    tip: '油要烧到冒烟，泼下去才香。'
  },
  {
    id: 'b15-noodle-zhajiang', name: '炸酱面', emoji: '🍜',
    need: ['noodle', 'mincedpork', 'cucumber'], extra: ['sweetbeanpaste', 'soybeanpaste'], time: 25, level: 2,
    steps: [
      '甜面酱2勺、黄豆酱2勺加两勺清水调稀备用。',
      '热油下肉末150克炒散出油，加葱姜末炒香。',
      '倒入酱汁小火慢炒5分钟，炒到酱色发亮、油酱分离。',
      '面条煮熟过凉水装碗，铺黄瓜丝，浇两勺炸酱拌匀。'
    ],
    tip: '酱必须小火炒透，生酱有豆腥味。'
  },
  {
    id: 'b15-noodle-eggplant', name: '茄子打卤面', emoji: '🍜',
    need: ['noodle', 'eggplant', 'porkloin'], extra: ['soybeanpaste'], time: 30, level: 2,
    steps: [
      '茄子1根切小丁撒盐腌10分钟，用手挤掉水分。',
      '里脊100克切丁，热油滑散后盛出。',
      '原锅炒茄子丁至软塌，加黄豆酱1勺炒香，倒回肉丁。',
      '加200毫升水烧开，淋水淀粉勾薄芡成卤。',
      '面条煮熟捞入碗中，浇上卤汁拌匀。'
    ],
    tip: '茄子先腌出水，炒时不吃油。'
  },
  {
    id: 'b15-noodle-sanxian', name: '三鲜汤面', emoji: '🍜',
    need: ['noodle', 'shrimp', 'squid', 'bokchoy'], extra: ['sesamoil'], time: 25, level: 2,
    steps: [
      '虾6只去虾线，鱿鱼100克切圈，小青菜2棵洗净。',
      '热油下虾头煸出红油，加水600毫升煮5分钟后捞出虾头。',
      '下面条煮3分钟，放虾仁和鱿鱼圈再煮1分钟。',
      '加盐和香油调味，最后放青菜烫软即可。'
    ],
    tip: '虾头熬汤是鲜味关键，别丢。'
  },
  {
    id: 'b15-pasta-bacon', name: '奶油培根意面', emoji: '🍝',
    need: ['pasta', 'bacon', 'milk', 'buttonmushroom'], extra: ['cheese', 'blackpepper'], time: 25, level: 2,
    steps: [
      '意面100克下加盐的开水煮8分钟，留半碗煮面水。',
      '培根2片切条，口蘑5个切片，少油煎至边缘微焦。',
      '倒牛奶150毫升小火加热，放芝士片1片搅至融化。',
      '下意面和两勺面汤，翻拌1分钟至酱汁裹面，撒黑胡椒。'
    ],
    tip: '留点面汤调稠，酱才不会澥。'
  },
  {
    id: 'b15-pasta-beef', name: '黑椒牛肉意面', emoji: '🍝',
    need: ['pasta', 'beef', 'onion'], extra: ['blackpepper', 'oyster'], time: 25, level: 1,
    steps: [
      '牛肉120克切条，加生抽、淀粉抓匀腌10分钟。',
      '意面100克煮8分钟捞出，拌少许油防粘。',
      '热锅大火下牛肉条煎30秒，变色立刻盛出。',
      '炒洋葱丝至软，下意面和牛肉，加蚝油、大量黑胡椒翻匀。'
    ],
    tip: '牛肉大火快煎，久炒就咬不动。'
  },
  {
    id: 'b15-mixian-pot', name: '小锅米线', emoji: '🍜',
    need: ['ricevermicelli', 'mincedpork', 'pickled', 'leek'], extra: ['douban'], time: 20, level: 2,
    steps: [
      '米线200克温水泡软，酸菜50克切碎，韭菜切段。',
      '小锅热油，下肉末80克炒散，加豆瓣酱1勺炒出红油。',
      '加酸菜炒香，倒入500毫升清水或高汤烧开。',
      '下米线煮3分钟，加韭菜段和盐，连锅端上桌。'
    ],
    tip: '用带柄小锅煮，保温又入味。'
  },
  {
    id: 'b15-mixian-beef', name: '番茄肥牛米线', emoji: '🍜',
    need: ['ricevermicelli', 'beefroll', 'tomato'], extra: ['oyster'], time: 20, level: 1,
    steps: [
      '番茄2个切小块，米线200克用温水泡软。',
      '热油炒番茄，压出红汁后加600毫升水烧开。',
      '下米线煮3分钟，加蚝油和盐调味。',
      '肥牛卷150克最后下锅，烫20秒变色立刻关火。'
    ],
    tip: '肥牛最后放，久煮会老成渣。'
  },
  {
    id: 'b15-hefen-shacha', name: '沙茶牛肉河粉', emoji: '🍜',
    need: ['riceflakenoodle', 'beef', 'beansprout'], extra: ['shacha'], time: 20, level: 2,
    steps: [
      '牛肉100克逆纹切薄片，加生抽、淀粉抓匀腌10分钟。',
      '河粉300克用温水轻轻抖散，别用力扯断。',
      '热油炒沙茶酱1勺出香，加500毫升水烧开成汤。',
      '下河粉煮1分钟，放牛肉片和豆芽，牛肉变色即关火。'
    ],
    tip: '沙茶酱本身咸，盐要少放。'
  },
  {
    id: 'b15-instant-tomato', name: '番茄泡面', emoji: '🍜',
    need: ['instantnoodle', 'tomato', 'egg'], extra: ['oyster'], time: 12, level: 1,
    steps: [
      '番茄1个切小块，锅中少油炒软并压出汁水。',
      '加500毫升水烧开，放面饼煮2分钟。',
      '打入鸡蛋1个，先别搅动，让它凝成荷包蛋。',
      '放调料包半包、蚝油半勺，再煮1分钟关火。'
    ],
    tip: '调料包只放一半，汤不齁咸。'
  },
  {
    id: 'b15-bun-garlic', name: '蒜香烤馒头片', emoji: '🍞',
    need: ['bun'], extra: ['pepper', 'garlic'], time: 15, level: 1,
    steps: [
      '馒头2个放凉后切1厘米厚片，别切太薄容易焦。',
      '大蒜4瓣压成泥，加两勺油、盐和黑胡椒拌成蒜油。',
      '馒头片两面刷满蒜油，摆在铺纸的烤盘上。',
      '烤箱200度烤8分钟，边缘金黄酥脆即可。'
    ],
    tip: '冷馒头才好切，热的一切就碎。'
  },
  {
    id: 'b15-mantou-milk', name: '奶香馒头', emoji: '🍞',
    need: ['flour', 'milk'], extra: ['yeast', 'rocksugar'], time: 90, level: 2,
    steps: [
      '面粉500克、酵母5克、糖30克混匀，倒入温牛奶260毫升。',
      '揉15分钟至面团光滑不粘手，盖布发1小时至两倍大。',
      '排气后搓成长条，切成6厘米宽的剂子，二次醒15分钟。',
      '冷水上锅，水开后蒸15分钟，关火焖3分钟再揭盖。'
    ],
    tip: '牛奶温到不烫手，太烫会烫死酵母。'
  },
  {
    id: 'b15-bread-pudding', name: '吐司布丁', emoji: '🍞',
    need: ['bread', 'milk', 'egg'], extra: ['rocksugar'], time: 30, level: 1,
    steps: [
      '吐司3片切成小方块，铺进烤碗里。',
      '鸡蛋2个加冰糖粉30克打散，倒入牛奶200毫升搅匀。',
      '蛋奶液过筛后浇在吐司上，静置5分钟让其吸饱。',
      '烤箱180度烤20分钟，表面鼓起焦黄即可。'
    ],
    tip: '蛋液过筛，烤出来才细腻无孔。'
  },
  {
    id: 'b15-bread-eggsalad', name: '鸡蛋沙拉吐司', emoji: '🍞',
    need: ['bread', 'egg', 'cucumber'], extra: ['mayo', 'blackpepper'], time: 15, level: 1,
    steps: [
      '鸡蛋2个冷水下锅，水开煮8分钟，捞出过凉剥壳。',
      '用叉子把鸡蛋压成粗粒，黄瓜半根切片后挤干水。',
      '加沙拉酱2勺、黑胡椒和少许盐拌匀成馅。',
      '吐司2片烤1分钟，夹入蛋沙拉，对角切开。'
    ],
    tip: '黄瓜挤干水，吐司才不会湿塌。'
  },
  {
    id: 'b15-wrapper-shengjian', name: '饺子皮生煎包', emoji: '🥟',
    need: ['dumplingwrapper', 'mincedpork', 'cabbage'], extra: ['sesamoil'], time: 35, level: 2,
    steps: [
      '肉末200克加白菜碎100克、生抽、香油、盐，顺一个方向搅上劲。',
      '饺子皮用擀面杖把边缘擀薄一圈，包入馅料捏褶收口。',
      '平底锅刷油摆入小包，中火煎2分钟至底部微黄。',
      '沿锅边倒清水至包子三分之一高，盖盖焖8分钟。',
      '水干后开盖再煎1分钟，撒葱花和白芝麻出锅。'
    ],
    tip: '皮要擀薄边，褶子处才不夹生。'
  },
  {
    id: 'b15-wrapper-binghua', name: '冰花煎饺', emoji: '🥟',
    need: ['dumplingwrapper', 'mincedpork', 'cabbage'], extra: ['starch'], time: 30, level: 2,
    steps: [
      '肉末150克配白菜碎，加盐、生抽、香油拌匀成馅。',
      '饺子皮包馅，边缘捏紧，摆盘时底部沾点干粉防粘。',
      '平底锅少油中火，饺子排好煎2分钟至底部金黄。',
      '面粉10克加淀粉5克、水120毫升调匀，倒入锅中盖盖焖7分钟。',
      '水收干听到底部滋滋响，扣盘翻出冰花。'
    ],
    tip: '冰花水比例一比十二，太稠不成花。'
  },
  {
    id: 'b15-wonton-shepherd', name: '荠菜鲜肉馄饨', emoji: '🥟',
    need: ['wontonwrapper', 'shepherdspurse', 'mincedpork'], extra: ['sesamoil'], time: 40, level: 2,
    steps: [
      '荠菜300克焯水30秒，过凉后挤干切碎。',
      '肉末200克加姜末、生抽、香油搅上劲，再拌入荠菜。',
      '馄饨皮中央放一小勺馅，对折捏紧，两角向中间叠合。',
      '水开下馄饨，点两次凉水，浮起后再煮1分钟。',
      '碗底放紫菜、虾皮、香油，冲入热汤捞入馄饨。'
    ],
    tip: '馅别放多，皮薄馅大会煮破。'
  },
  {
    id: 'b15-wonton-apple', name: '馄饨皮苹果派', emoji: '🍎',
    need: ['wontonwrapper', 'apple'], extra: ['cinnamon', 'rocksugar'], time: 20, level: 1,
    steps: [
      '苹果1个去皮切小丁，加糖20克小火炒5分钟至软。',
      '撒肉桂粉拌匀，淋水淀粉收稠，盛出放凉。',
      '馄饨皮两张叠放，中间放一勺苹果馅，四周抹水。',
      '盖上另一张皮，用叉子压边封口，表面划两刀。',
      '六成油温炸1分钟至起泡金黄，捞出吸油。'
    ],
    tip: '馅必须放凉，热馅会泡软皮。'
  },
  {
    id: 'b15-ricecake-xuecai', name: '雪菜年糕汤', emoji: '🍲',
    need: ['ricecake', 'snowcabbage', 'porkloin'], extra: ['oyster'], time: 20, level: 1,
    steps: [
      '年糕200克切薄片泡水，雪菜80克切碎，里脊80克切丝。',
      '热油炒肉丝变色，下雪菜炒1分钟出香味。',
      '加600毫升水烧开，下年糕片煮3分钟至软。',
      '加蚝油和少许盐调味，撒葱花出锅。'
    ],
    tip: '年糕泡过水再煮，汤不糊。'
  },
  {
    id: 'b15-ricecake-redbean', name: '红豆年糕汤', emoji: '🍲',
    need: ['ricecake', 'redbean'], extra: ['rocksugar'], time: 50, level: 1,
    steps: [
      '红豆100克泡4小时，加水800毫升煮40分钟至开花。',
      '用勺背把一半红豆压碎，汤色变浑浊浓稠。',
      '加冰糖30克调味，年糕150克切小块放入。',
      '小火再煮5分钟至年糕浮起变软即可。'
    ],
    tip: '红豆压碎一半，汤才有沙感。'
  },
  {
    id: 'b15-vermicelli-cold', name: '凉拌粉丝', emoji: '🥗',
    need: ['vermicelli', 'cucumber', 'carrot'], extra: ['sesamoil', 'garlic'], time: 15, level: 1,
    steps: [
      '粉丝1把用温水泡10分钟至软，下开水烫1分钟。',
      '捞出过凉水，用剪刀剪两刀方便夹取，沥干。',
      '黄瓜和胡萝卜各半根，去皮后切成均匀细丝。',
      '加蒜末、生抽2勺、醋1勺、香油1勺和少许糖拌匀。'
    ],
    tip: '粉丝烫后过凉水，口感才筋道。'
  },
  {
    id: 'b15-scallion-pancake', name: '葱油饼', emoji: '🥞',
    need: ['flour'], extra: ['sesame', 'scallion'], time: 40, level: 2,
    steps: [
      '面粉300克加温水180毫升，揉成偏软的面团，盖布醒30分钟。',
      '小葱一把切碎，加盐和一勺油拌成葱油馅。',
      '面团分4份，擀成长方薄片，抹葱油后卷起盘成蜗牛状。',
      '压扁后再擀成0.5厘米厚的圆饼，别擀太薄把层次压死。',
      '平底锅多油中小火，两面各煎3分钟至酥脆。'
    ],
    tip: '面和得软，饼才外脆里软。'
  },
  {
    id: 'b15-handnoodle', name: '手擀面', emoji: '🍜',
    need: ['flour', 'egg'], extra: ['starch'], time: 45, level: 3,
    steps: [
      '面粉400克加盐3克，打入鸡蛋1个，分次加凉水150毫升。',
      '揉成偏硬的面团，盖布醒30分钟，中间再揉两次。',
      '撒淀粉防粘，擀成2毫米薄片，折叠后切成宽条。',
      '抖散面条，水开下锅煮2分钟，点一次凉水再开即熟。'
    ],
    tip: '面团要硬，加鸡蛋更筋道。'
  },
  {
    id: 'b15-baozi-pork', name: '猪肉大葱包子', emoji: '🥟',
    need: ['flour', 'mincedpork', 'leek'], extra: ['yeast', 'oyster'], time: 90, level: 3,
    steps: [
      '面粉500克加酵母5克、温水270毫升揉匀，发1小时至两倍大。',
      '肉末300克分三次加葱姜水150毫升，顺一个方向搅至黏稠。',
      '大葱2根切碎，最后拌进肉馅，加蚝油、盐和香油。',
      '面团排气分12份，擀成中间厚边缘薄的皮，包馅捏18个褶。',
      '二次醒20分钟，冷水上锅蒸15分钟，焖3分钟再开盖。'
    ],
    tip: '葱最后拌，早拌会出水发臭。'
  },
  {
    id: 'b15-pancake-chicken', name: '手抓饼卷鸡排', emoji: '🥞',
    need: ['frozenpancake', 'chickenbreast', 'lettuce'], extra: ['blackpepper', 'mayo'], time: 15, level: 1,
    steps: [
      '鸡胸肉1块片成薄片，用刀背拍松，撒盐和黑胡椒腌5分钟。',
      '平底锅少油中火，鸡排两面各煎2分钟至熟透。',
      '手抓饼1张不放油下锅，小火烙至两面起酥分层。',
      '饼上铺生菜和鸡排，挤一条沙拉酱卷紧即可。'
    ],
    tip: '手抓饼本身有油，锅里不用再放油。'
  },
  {
    id: 'b16-01', name: '绿豆百合汤', emoji: '🥣',
    need: ['mungbean', 'lilybulb'], extra: ['rocksugar'], time: 45, level: 1,
    steps: [
      '绿豆100克洗净，冷水泡1小时后沥干；鲜百合一瓣瓣掰开洗净。',
      '锅中加1000毫升水烧开，下绿豆大火煮10分钟。',
      '转小火盖盖煮25分钟，煮到绿豆开花起沙。',
      '放百合和冰糖20克，再煮5分钟关火，温热或放凉都行。'
    ],
    tip: '绿豆别用铁锅煮，容易发黑变味。'
  },
  {
    id: 'b16-02', name: '冰镇绿豆沙', emoji: '🧊',
    need: ['mungbean'], extra: ['rocksugar'], time: 55, level: 2,
    steps: [
      '绿豆150克挑去坏豆，加水泡2小时至豆子鼓胀。',
      '连水一起倒进锅里，大火烧开后撇净浮沫。',
      '中小火煮35分钟，用勺背把豆子一点点压成沙。',
      '加冰糖30克搅化，放凉后冷藏1小时会更稠。'
    ],
    tip: '压沙时留半碗整豆，口感更有层次。'
  },
  {
    id: 'b16-03', name: '红豆薏米水', emoji: '🍵',
    need: ['redbean', 'jobstears'], extra: ['rocksugar'], time: 60, level: 1,
    steps: [
      '红豆50克、薏米50克洗净，冷水泡2小时。',
      '薏米先下干锅小火炒3分钟，去寒味也更香。',
      '两样加1200毫升水大火煮开，转小火煮40分钟。',
      '加冰糖15克煮化，只滤出水喝，豆子可以另吃。'
    ],
    tip: '只想喝汤水时别煮太稠，清亮才顺口。'
  },
  {
    id: 'b16-04', name: '老红糖红豆沙', emoji: '🥣',
    need: ['redbean'], extra: ['brownsugar'], time: 80, level: 2,
    steps: [
      '红豆200克洗净，冷水泡4小时以上至捏得动。',
      '红豆加水没过大半指，大火烧开转小火煮50分钟。',
      '豆子软烂后加红糖40克，边搅边压成泥。',
      '再小火收10分钟，稠到能挂住勺子即可。'
    ],
    tip: '红糖一定后放，早放容易糊底发苦。'
  },
  {
    id: 'b16-05', name: '现磨黄豆浆', emoji: '🥛',
    need: ['soybean'], extra: [], time: 40, level: 2,
    steps: [
      '按口味加糖10克搅化，趁热喝最香。',
      '泡好的豆搓掉外皮，倒进料理机加800毫升水。',
      '高速打2分钟成浆，用纱布滤掉豆渣。',
      '豆浆倒锅里中火煮开，转小火再滚5分钟。',
      '按口味加糖10克搅化，趁热喝最香。'
    ],
    tip: '豆浆要彻底煮开，假沸喝了会闹肚子。'
  },
  {
    id: 'b16-06', name: '咸豆浆', emoji: '🥣',
    need: ['soybean', 'driedshrimp'], extra: ['sesamoil'], time: 30, level: 1,
    steps: [
      '黄豆80克泡8小时，加800毫升水打成浆后滤渣。',
      '豆浆中火煮开，转小火滚5分钟去豆腥。',
      '碗里放虾皮、紫菜和少许生抽，冲入滚豆浆。',
      '点几滴醋让它起絮，撒葱花淋香油即可。'
    ],
    tip: '醋别多，几滴就够起花，多了发酸。'
  },
  {
    id: 'b16-08', name: '苹果燕麦杯', emoji: '🥛',
    need: ['oats', 'apple', 'milk'], extra: ['honey'], time: 10, level: 1,
    steps: [
      '燕麦片40克加牛奶150毫升拌匀，冷藏泡一夜。',
      '苹果半个切小丁，泡淡盐水防发黑。',
      '早上取出泡软的燕麦，铺上苹果丁。',
      '淋上蜂蜜10克，拌匀就可以吃。'
    ],
    tip: '用厚燕麦片，泡一夜才有嚼劲。'
  },
  {
    id: 'b16-10', name: '黑米核桃糊', emoji: '🥣',
    need: ['blackrice', 'walnut', 'milk'], extra: [], time: 45, level: 1,
    steps: [
      '黑米60克泡3小时，核桃仁30克温水泡10分钟。',
      '两样连牛奶400毫升倒进料理机打成细浆。',
      '倒回锅里中小火煮，边煮边搅8分钟。',
      '冒小泡、明显变稠后加糖，搅匀关火。'
    ],
    tip: '核桃皮略苦，泡软后能搓掉一部分。'
  },
  {
    id: 'b16-11', name: '薏米燕麦粥', emoji: '🥣',
    need: ['jobstears', 'oats'], extra: [], time: 50, level: 1,
    steps: [
      '薏米50克洗净泡2小时，燕麦片30克备好。',
      '薏米加900毫升水大火煮开，转小火煮30分钟。',
      '下燕麦片再煮8分钟，勤搅防止沉底。',
      '煮到薏米开花、粥体浓稠即可关火。'
    ],
    tip: '薏米难烂，泡够时间才不硌牙。'
  },
  {
    id: 'b16-12', name: '柠檬薏米水', emoji: '🍋',
    need: ['jobstears', 'lemon'], extra: ['honey'], time: 50, level: 1,
    steps: [
      '薏米60克洗净，冷水泡2小时后沥干。',
      '加1200毫升水大火煮开，转小火煮35分钟。',
      '水色变微白后关火，晾到不烫手。',
      '挤半个柠檬汁，加蜂蜜20克调匀，冰镇更好喝。'
    ],
    tip: '柠檬放温了再加，太烫会发苦。'
  },
  {
    id: 'b16-13', name: '冰糖蒸雪梨', emoji: '🍐',
    need: ['pear'], extra: ['rocksugar'], time: 30, level: 1,
    steps: [
      '雪梨1个洗净，从顶部四分之一处切开当盖。',
      '挖掉梨核，塞入冰糖15克和几粒枸杞。',
      '盖回梨盖放碗里，水开后中火蒸20分钟。',
      '关火焖5分钟，连汤带梨一起吃。'
    ],
    tip: '梨皮别削，蒸出来的汤更清甜。'
  },
  {
    id: 'b16-14', name: '雪梨银耳羹', emoji: '🍐',
    need: ['pear', 'tremella'], extra: ['rocksugar'], time: 60, level: 1,
    steps: [
      '银耳1朵冷水泡1小时，剪掉黄根撕成小朵。',
      '银耳加1000毫升水大火煮开，转小火炖30分钟。',
      '雪梨去皮切块下锅，再煮15分钟。',
      '加冰糖20克煮化，汤汁黏稠即可。'
    ],
    tip: '银耳撕得越碎，越容易出胶。'
  },
  {
    id: 'b16-15', name: '苹果银耳羹', emoji: '🍎',
    need: ['apple', 'tremella', 'goji'], extra: ['rocksugar'], time: 60, level: 1,
    steps: [
      '银耳泡发1小时撕小朵，苹果1个去核切块。',
      '银耳加900毫升水大火烧开，小火炖35分钟。',
      '下苹果块和枸杞10粒，继续煮10分钟。',
      '加冰糖20克搅化，关火焖5分钟。'
    ],
    tip: '苹果后放，煮久了会散成泥没口感。'
  },
  {
    id: 'b16-16', name: '肉桂烤苹果', emoji: '🍎',
    need: ['apple'], extra: ['cinnamon', 'honey'], time: 30, level: 1,
    steps: [
      '苹果2个对半切开，用小勺挖掉果核。',
      '切面撒上肉桂粉，淋蜂蜜15克。',
      '烤箱180度预热，烤20分钟至边缘发软。',
      '出炉先放凉2分钟，趁温热时吃最香。'
    ],
    tip: '选脆苹果，烤完才不会塌成一摊。'
  },
  {
    id: 'b16-17', name: '苹果胡萝卜汁', emoji: '🍎',
    need: ['apple', 'carrot'], extra: [], time: 10, level: 1,
    steps: [
      '苹果1个去核切块，胡萝卜半根去皮切小块。',
      '两样放进料理机，加200毫升凉开水。',
      '高速打1分钟，打到看不见颗粒为止。',
      '用细筛滤掉渣，现打现喝最新鲜。'
    ],
    tip: '打好马上喝，放久会分层发暗。'
  },
  {
    id: 'b16-18', name: '琥珀核桃仁', emoji: '🌰',
    need: ['walnut'], extra: [], time: 25, level: 2,
    steps: [
      '核桃仁150克，开水焯1分钟去涩味，捞出晾干。',
      '锅里放糖40克和少量水，小火熬到起小泡。',
      '倒入核桃快速翻匀，让每颗都裹上糖浆。',
      '另起油锅五成热，下核桃小火炸2分钟捞出。',
      '摊开晾凉5分钟，糖壳变硬变脆即可。'
    ],
    tip: '炸时油温别高，糖一焦就发苦。'
  },
  {
    id: 'b16-19', name: '核桃拌芹菜', emoji: '🥗',
    need: ['walnut', 'celery'], extra: ['sesamoil'], time: 15, level: 1,
    steps: [
      '芹菜200克去筋切段，开水焯1分钟捞出过凉。',
      '核桃仁50克用干锅小火焙2分钟至出香。',
      '芹菜沥干，加盐、少许醋和香油拌匀。',
      '撒上核桃仁，吃前再拌一下保持脆。'
    ],
    tip: '核桃最后放，久泡会软塌不脆。'
  },
  {
    id: 'b16-20', name: '核桃燕麦糊', emoji: '🥣',
    need: ['walnut', 'oats', 'milk'], extra: [], time: 15, level: 1,
    steps: [
      '核桃仁30克、燕麦片40克倒进料理机。',
      '加牛奶300毫升，高速打1分钟成糊。',
      '倒小锅中小火加热，边煮边搅5分钟。',
      '微沸变稠后关火，按口味加糖5克。'
    ],
    tip: '不加热也能喝，煮过更香更暖胃。'
  },
  {
    id: 'b16-21', name: '糖水板栗', emoji: '🌰',
    need: ['chestnut'], extra: ['rocksugar'], time: 50, level: 1,
    steps: [
      '板栗300克洗净，用刀在鼓面划一道深口。',
      '冷水下锅煮10分钟，捞出趁热剥壳。',
      '剥好的栗子加800毫升水，放冰糖30克。',
      '小火煮30分钟，栗子粉糯、糖水微黄即可。'
    ],
    tip: '划口要划透内皮，剥起来才不粘。'
  },
  {
    id: 'b16-22', name: '板栗红枣汤', emoji: '🌰',
    need: ['chestnut', 'jujube'], extra: ['rocksugar'], time: 50, level: 1,
    steps: [
      '板栗200克划口煮10分钟，剥壳去内膜。',
      '红枣8颗洗净去核，和板栗一起下锅。',
      '加900毫升水大火烧开，转小火煮30分钟。',
      '放冰糖20克煮化，汤色转琥珀色关火。'
    ],
    tip: '红枣去核不易上火，汤也更清甜。'
  },
  {
    id: 'b16-23', name: '板栗蒸南瓜', emoji: '🎃',
    need: ['chestnut', 'pumpkin'], extra: [], time: 30, level: 1,
    steps: [
      '南瓜300克去皮切厚片，铺在盘底。',
      '板栗100克剥壳，对半切开摆在南瓜上。',
      '水开后上锅，中火蒸20分钟即可。',
      '筷子能轻松扎透就熟了，趁热吃。'
    ],
    tip: '南瓜本身够甜，不用再加糖。'
  },
  {
    id: 'b16-24', name: '红枣枸杞茶', emoji: '🍵',
    need: ['jujube', 'goji'], extra: [], time: 15, level: 1,
    steps: [
      '红枣6颗洗净，用刀划几道口方便出味。',
      '枸杞15粒用清水冲一遍，别久泡。',
      '红枣加600毫升水煮开，小火煮10分钟。',
      '关火放枸杞焖3分钟，喝完可续水。'
    ],
    tip: '枸杞最后放，久煮会发酸。'
  },
  {
    id: 'b16-26', name: '鲜百合雪梨汤', emoji: '🍐',
    need: ['lilybulb', 'pear'], extra: ['rocksugar'], time: 40, level: 1,
    steps: [
      '鲜百合2头掰瓣洗净，雪梨1个去核切块。',
      '雪梨加800毫升水大火煮开，小火煮20分钟。',
      '下百合再煮8分钟，煮到瓣边透明。',
      '加冰糖15克煮化，关火晾到温热。'
    ],
    tip: '百合久煮会烂，最后放才脆甜。'
  },
  {
    id: 'b16-27', name: '凉拌鲜百合', emoji: '🥗',
    need: ['lilybulb', 'cucumber'], extra: ['sesamoil', 'sesame'], time: 12, level: 1,
    steps: [
      '鲜百合2头掰成瓣，削掉发黄的边。',
      '水开加少许盐，百合焯20秒立刻捞出过凉。',
      '黄瓜半根切片，和百合一起沥干水。',
      '加盐、少许糖和香油拌匀，撒白芝麻。'
    ],
    tip: '焯水只20秒，久了百合就发面。'
  },
  {
    id: 'b16-28', name: '紫薯牛奶糊', emoji: '🍠',
    need: ['purplesweetpotato', 'milk'], extra: [], time: 25, level: 1,
    steps: [
      '紫薯300克去皮切块，上锅蒸15分钟至软。',
      '蒸好的紫薯压成泥，去掉粗纤维。',
      '加牛奶200毫升小火加热，边煮边搅。',
      '搅到顺滑微稠，按口味加糖即可。'
    ],
    tip: '紫薯偏干，牛奶分两次加更好搅开。'
  },
  {
    id: 'b16-29', name: '紫薯燕麦粥', emoji: '🍠',
    need: ['purplesweetpotato', 'oats'], extra: [], time: 30, level: 1,
    steps: [
      '紫薯200克去皮切小丁，燕麦片40克备好。',
      '紫薯加700毫升水煮开，小火煮12分钟。',
      '下燕麦片再煮8分钟，勤搅防粘锅。',
      '粥变紫稠、紫薯软烂，就可以关火。'
    ],
    tip: '紫薯丁切小点，和燕麦熟度才一致。'
  },
  {
    id: 'b16-30', name: '紫薯山药泥', emoji: '🍠',
    need: ['purplesweetpotato', 'yam', 'milk'], extra: ['honey'], time: 30, level: 1,
    steps: [
      '紫薯200克、山药200克去皮切块，分开蒸15分钟。',
      '山药压成泥，加牛奶30毫升拌到顺滑。',
      '紫薯也压成泥，太干就补一点牛奶。',
      '两色泥分层装碗，淋蜂蜜10克。'
    ],
    tip: '山药选铁棍的，蒸完更绵密。'
  },
  {
    id: 'b16-31', name: '菱角薏米汤', emoji: '🥣',
    need: ['watercaltrop', 'jobstears'], extra: ['rocksugar'], time: 55, level: 2,
    steps: [
      '菱角肉200克洗净，薏米50克泡2小时。',
      '薏米加1000毫升水大火煮开，小火煮25分钟。',
      '下菱角继续煮20分钟，煮到菱角粉糯。',
      '加冰糖20克煮化，喜欢清淡可以不加。'
    ],
    tip: '菱角生吃有风险，一定要煮透。'
  },
  {
    id: 'b16-32', name: '盐水煮菱角', emoji: '🥣',
    need: ['watercaltrop'], extra: [], time: 25, level: 1,
    steps: [
      '菱角500克用刷子刷净表面泥土。',
      '锅里加水没过菱角，放盐10克。',
      '大火烧开后转中火，继续煮15分钟。',
      '关火泡5分钟再捞，趁热剥壳最好剥。'
    ],
    tip: '煮时加点盐，菱角肉更紧实清甜。'
  },
  {
    id: 'b16-33', name: '冰糖马蹄水', emoji: '🍵',
    need: ['waterchestnut'], extra: ['rocksugar'], time: 30, level: 1,
    steps: [
      '马蹄10个削皮，冲洗干净后对半切开。',
      '加900毫升水和冰糖25克，大火煮开。',
      '转小火煮15分钟，汤水微甜发清。',
      '连汤带马蹄一起吃，冰镇更爽口。'
    ],
    tip: '马蹄削皮后泡水里，防氧化发黄。'
  },
  {
    id: 'b16-34', name: '马蹄雪梨汤', emoji: '🍐',
    need: ['waterchestnut', 'pear'], extra: ['rocksugar'], time: 40, level: 1,
    steps: [
      '马蹄8个去皮切块，雪梨1个去核切块。',
      '两样加900毫升水，大火煮开。',
      '转小火煮25分钟，梨块变透明。',
      '加冰糖15克煮化，温热喝最润喉。'
    ],
    tip: '梨核一定要去净，带核煮会发酸。'
  },
  {
    id: 'b16-35', name: '凉拌马蹄片', emoji: '🥗',
    need: ['waterchestnut', 'cucumber'], extra: ['sesamoil'], time: 12, level: 1,
    steps: [
      '马蹄10个去皮，切成2毫米薄片。',
      '水开下马蹄焯30秒捞出，过凉水沥干。',
      '黄瓜半根切片，和马蹄一起装碗。',
      '加盐、少许糖、醋和香油拌匀即可。'
    ],
    tip: '切薄片才脆，厚了口感发艮。'
  },
  {
    id: 'b16-36', name: '苹果梨果盘', emoji: '🍎',
    need: ['apple', 'pear'], extra: [], time: 8, level: 1,
    steps: [
      '苹果1个、梨1个洗净，各切四瓣去核。',
      '切成半厘米厚的月牙片，大小一致。',
      '泡淡盐水30秒捞出，防止氧化发褐。',
      '交错摆盘，淋少许蜂蜜或直接吃。'
    ],
    tip: '现切现吃，摆久会出水变软。'
  },
  {
    id: 'b16-37', name: '蜂蜜渍苹果片', emoji: '🍯',
    need: ['apple', 'lemon'], extra: ['honey'], time: 25, level: 1,
    steps: [
      '苹果2个去核，切成3毫米薄片。',
      '柠檬半个挤汁，加蜂蜜30克调匀。',
      '苹果片放进蜜汁里拌匀，每片都沾到。',
      '冷藏渍20分钟，中途翻一次更均匀。'
    ],
    tip: '柠檬汁既防变色又提香，别省。'
  },
  {
    id: 'b16-38', name: '糯米糖藕', emoji: '🥢',
    need: ['lotus', 'glutinousrice'], extra: ['brownsugar'], time: 90, level: 2,
    steps: [
      '莲藕1节去皮，从一端切下3厘米当盖子。',
      '糯米100克泡2小时，沥干塞进藕孔，边塞边戳实。',
      '盖回藕盖用牙签固定，加水没过并放红糖50克。',
      '大火烧开转小火煮70分钟，中途翻一次面。',
      '关火泡30分钟再切片，淋上原汤。'
    ],
    tip: '糯米塞七分满，煮胀后才不顶盖。'
  },
  {
    id: 'b16-39', name: '红枣夹核桃', emoji: '🌰',
    need: ['jujube', 'walnut'], extra: [], time: 10, level: 1,
    steps: [
      '红枣10颗洗净，用刀从侧面划开去核。',
      '核桃仁掰成小块，塞进红枣开口里。',
      '全部塞好摆盘，水开后上锅蒸5分钟。',
      '出锅稍凉2分钟，红枣回软后更好吃。'
    ],
    tip: '选肉厚的红枣，夹住核桃不易散。'
  },
  {
    id: 'b16-40', name: '枸杞蒸南瓜', emoji: '🎃',
    need: ['goji', 'pumpkin'], extra: [], time: 20, level: 1,
    steps: [
      '南瓜400克去皮，切2厘米厚块摆盘。',
      '枸杞15粒温水泡5分钟，沥干撒在南瓜上。',
      '水开后上锅，中火蒸12分钟关火。',
      '南瓜软透取出，可按口味淋少许蜂蜜。'
    ],
    tip: '南瓜选老一点的，蒸完粉甜不出水。'
  }

];
