export function mountApp() {

(function () {
  'use strict';

  var DATABASE_ID = 'records';
  var PROFILE_KEY = 'yabao_profile_v1';
  var DRAFT_PREFIX = 'yabao_draft_';
  var WEEK_GOAL = 3;

  var db = null;
  try {
    if (window.yabaoDb) {
      db = window.yabaoDb;
    }
  } catch (e) {
    db = null;
  }

  var ALL = [];
  var SCHEMA_OPTIONS = {};
  var PROFILE = null;
  var achvSel = [];
  var todayBodyId = '';
  var LIMITS = { 'today-list': 20, 'body-list': 15, 'diet-list': 15, 'sport-list': 15 };
  var isRefreshing = false;
  var refreshQueued = false;
  var refreshTimer = null;
  var draftTimers = {};
  var firstLoad = true;
  var toastTimer = null;

  var MET = { '居家徒手跟练': 5.5, '小器械力量': 5.0, '跑步': 7.5, '快走': 4.3, '跳绳': 10.0, '骑行': 6.8, '拉伸放松': 2.5, '其他': 5.0 };
  var ENCOURAGE = [
    '今天不用追求完美，做到 60 分就很好啦',
    '认真吃饭、好好运动，剩下的交给时间',
    '掉秤是惊喜，坚持才是日常',
    '体重只是数字，气色和状态才是真的',
    '慢一点没关系，别停下来就好',
    '你已经比昨天的自己更棒了',
    '对自己温柔一点，减脂是长期主义',
    '今天的努力，身体都记得'
  ];
  /* 营养口径：热量与三大营养素参考《中国食物成分表》(第6版) 常见条目，按括号内份量折算，为日常估算值 */
  var FOOD = [
    { t: '主食', items: [['米饭（1碗）', 174, 3.9, 38.7, 0.5], ['杂粮饭（1碗）', 170, 4.5, 35.0, 1.0], ['馒头（1个）', 223, 7.0, 47.0, 1.1], ['全麦面包（1片）', 88, 3.6, 15.4, 1.1], ['即食燕麦（40g）', 152, 5.0, 24.4, 2.8], ['玉米（1根）', 112, 4.0, 22.6, 1.2], ['红薯（1个）', 130, 1.5, 30.5, 0.3], ['荞麦面（1碗）', 220, 8.0, 43.0, 1.0], ['饺子（8个）', 320, 14.0, 44.0, 9.0]] },
    { t: '蛋白质', items: [['水煮蛋（1个）', 72, 6.5, 0.5, 5.0], ['鸡胸肉（100g）', 133, 19.4, 0, 5.0], ['瘦牛肉（100g）', 106, 20.2, 0, 2.3], ['嫩豆腐（100g）', 87, 6.2, 3.9, 3.1], ['无糖酸奶（1杯）', 100, 5.5, 7.0, 4.0], ['纯牛奶（250ml）', 135, 7.5, 12.0, 7.0], ['无糖豆浆（300ml）', 93, 9.0, 3.6, 4.8]] },
    { t: '蔬菜', items: [['西兰花（100g）', 36, 4.1, 4.3, 0.6], ['生菜（100g）', 16, 1.3, 2.0, 0.3], ['番茄（1个）', 30, 1.4, 6.0, 0.3], ['黄瓜（1根）', 32, 1.6, 5.8, 0.4], ['菠菜（100g）', 28, 2.6, 4.5, 0.3], ['冬瓜（100g）', 12, 0.4, 2.6, 0.2], ['蘑菇（100g）', 20, 2.7, 2.1, 0.1], ['胡萝卜（100g）', 39, 1.0, 8.8, 0.2]] },
    { t: '水果', items: [['苹果（1个）', 104, 0.4, 27.6, 0.4], ['香蕉（1根）', 138, 1.4, 33.0, 0.3], ['橙子（1个）', 94, 1.6, 22.2, 0.2], ['猕猴桃（1个）', 61, 0.8, 14.5, 0.6], ['圣女果（10颗）', 33, 1.4, 6.8, 0.3], ['西瓜（2片）', 93, 1.8, 22.8, 0.3], ['葡萄（100g）', 45, 0.5, 10.3, 0.2]] },
    { t: '饮品', items: [['无糖美式（1杯）', 5, 0.3, 0.7, 0], ['拿铁（中杯）', 180, 10.0, 13.0, 9.0], ['无糖茶（1瓶）', 0, 0, 0, 0], ['气泡水（1瓶）', 0, 0, 0, 0], ['奶茶（中杯）', 450, 4.0, 60.0, 20.0], ['鲜榨果汁（300ml）', 130, 2.0, 30.0, 0.5]] },
    { t: '小零食', items: [['原味坚果（1小把）', 120, 4.0, 4.0, 10.0], ['黑巧克力（2块）', 110, 1.5, 9.0, 7.0], ['海苔（1包）', 30, 2.0, 2.0, 1.5], ['蛋白棒（1根）', 200, 20.0, 15.0, 6.0], ['苏打饼干（3片）', 150, 2.5, 24.0, 5.0], ['薯片（1包）', 500, 4.0, 35.0, 38.0], ['蛋糕（1块）', 350, 5.0, 45.0, 17.0], ['冰淇淋（1个）', 280, 3.5, 30.0, 16.0]] }
  ];

  /* ---------------- 每日食谱库 ---------------- */
  /* 每餐 14 套，按日期轮换；食材名与 FOOD 库一致，份数可写 1.5 表示一份半 */
  var RECIPES = {
    '早餐': [
      { name: '云朵牛奶燕麦碗', items: [['即食燕麦（40g）', 1], ['纯牛奶（250ml）', 1], ['水煮蛋（1个）', 1]], tip: '燕麦先用温牛奶泡 5 分钟，软软糯糯更好吃' },
      { name: '全麦蛋堡早晨', items: [['全麦面包（1片）', 2], ['水煮蛋（1个）', 1], ['纯牛奶（250ml）', 1]], tip: '面包烤 30 秒再夹蛋，口感会好很多' },
      { name: '玉米晨光碟', items: [['玉米（1根）', 1], ['水煮蛋（1个）', 1], ['纯牛奶（250ml）', 1], ['圣女果（10颗）', 1]], tip: '玉米选黄粒的更甜，蒸比煮更能留住甜味' },
      { name: '红薯坚果碗', items: [['红薯（1个）', 1], ['无糖酸奶（1杯）', 1], ['水煮蛋（1个）', 1], ['原味坚果（1小把）', 0.5]], tip: '红薯压成泥拌酸奶，撒半把坚果碎，像在吃甜品' },
      { name: '杂粮温润早晨', items: [['杂粮饭（1碗）', 1], ['水煮蛋（1个）', 1], ['无糖豆浆（300ml）', 1]], tip: '胃不舒服的早上，这碗最温柔' },
      { name: '馒头豆浆蛋', items: [['馒头（1个）', 1], ['无糖豆浆（300ml）', 1], ['水煮蛋（1个）', 1]], tip: '馒头挑小个的，配豆浆刚好不撑' },
      { name: '香蕉奶香杯', items: [['香蕉（1根）', 1], ['无糖酸奶（1杯）', 1], ['水煮蛋（1个）', 1], ['原味坚果（1小把）', 0.5]], tip: '香蕉切片铺在酸奶上，像小甜品' },
      { name: '吐司太阳蛋', items: [['全麦面包（1片）', 2], ['水煮蛋（1个）', 1], ['无糖豆浆（300ml）', 1], ['圣女果（10颗）', 1]], tip: '番茄圣女果当蔬果，清爽开胃' },
      { name: '苹果燕麦盅', items: [['即食燕麦（40g）', 1], ['纯牛奶（250ml）', 1], ['苹果（1个）', 1], ['水煮蛋（1个）', 1]], tip: '苹果带皮吃，纤维都在皮里' },
      { name: '红薯酸奶盅', items: [['红薯（1个）', 1], ['无糖酸奶（1杯）', 1], ['水煮蛋（1个）', 1], ['猕猴桃（1个）', 1]], tip: '猕猴桃维 C 高，配酸奶吸收更好' },
      { name: '豆浆蛋蔬盘', items: [['无糖豆浆（300ml）', 1], ['水煮蛋（1个）', 1], ['番茄（1个）', 1], ['黄瓜（1根）', 1]], tip: '番茄黄瓜当蔬果，清爽零负担' },
,
      { name: '圣女果燕麦碗', items: [['即食燕麦（40g）', 1], ['无糖酸奶（1杯）', 1], ['水煮蛋（1个）', 1], ['圣女果（10颗）', 2]], tip: '燕麦泡酸奶再铺圣女果，清爽开胃' },
      { name: '牛奶玉米杯', items: [['玉米（1根）', 1], ['纯牛奶（250ml）', 1], ['水煮蛋（1个）', 1], ['圣女果（10颗）', 2]], tip: '玉米牛奶是温柔组合，不容易饿' },
      { name: '圣女果燕麦盅', items: [['即食燕麦（40g）', 1], ['无糖酸奶（1杯）', 1], ['圣女果（10颗）', 2], ['水煮蛋（1个）', 1]], tip: '酸甜小番茄配燕麦，开启元气满满的一天' }
    ],
    '午餐': [
      { name: '杂粮饭·香煎鸡胸', items: [['杂粮饭（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['西兰花（100g）', 1], ['蘑菇（100g）', 1]], tip: '鸡胸用少许黑胡椒腌 10 分钟，不柴' },
      { name: '米饭·快炒牛肉', items: [['米饭（1碗）', 1], ['瘦牛肉（100g）', 1.5], ['菠菜（100g）', 1], ['胡萝卜（100g）', 1]], tip: '牛肉大火快炒，变色就起锅，嫩' },
      { name: '荞麦凉面', items: [['荞麦面（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['黄瓜（1根）', 1], ['生菜（100g）', 1]], tip: '面过一遍冷水更筋道，料汁少放油' },
      { name: '米饭·清汤牛肉', items: [['米饭（1碗）', 1], ['瘦牛肉（100g）', 1.5], ['冬瓜（100g）', 1], ['蘑菇（100g）', 1], ['菠菜（100g）', 1]], tip: '冬瓜最后下锅，煮透明就好' },
      { name: '玉米鸡胸沙拉', items: [['玉米（1根）', 1], ['鸡胸肉（100g）', 1.5], ['生菜（100g）', 1], ['番茄（1个）', 1], ['无糖酸奶（1杯）', 1]], tip: '酸奶当沙拉酱，比沙拉酱省一半热量' },
      { name: '杂粮饭·牛肉时蔬', items: [['杂粮饭（1碗）', 1], ['瘦牛肉（100g）', 1.5], ['西兰花（100g）', 1], ['胡萝卜（100g）', 1]], tip: '牛肉配胡萝卜，补铁又好吸收' },
      { name: '米饭·鸡胸双蔬', items: [['米饭（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['菠菜（100g）', 1], ['蘑菇（100g）', 1]], tip: '蘑菇提鲜，少放调料也好吃' },
      { name: '荞麦面·鸡丝蔬', items: [['荞麦面（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['黄瓜（1根）', 1], ['西兰花（100g）', 1]], tip: '荞麦低 GI，下午不犯困' },
      { name: '豆腐鸡胸暖碗', items: [['杂粮饭（1碗）', 1], ['嫩豆腐（100g）', 2], ['鸡胸肉（100g）', 1], ['冬瓜（100g）', 1]], tip: '一荤一素一豆，均衡又顶饱' },
      { name: '玉米牛肉盘', items: [['玉米（1根）', 1], ['瘦牛肉（100g）', 1.5], ['生菜（100g）', 1], ['胡萝卜（100g）', 1]], tip: '玉米当主食，饱腹感强' },
      { name: '杂粮饭·双蛋白', items: [['杂粮饭（1碗）', 1], ['鸡胸肉（100g）', 1], ['嫩豆腐（100g）', 1], ['西兰花（100g）', 1], ['番茄（1个）', 1]], tip: '蛋白拉满，练后补给刚好' },
      { name: '荞麦·牛肉沙拉', items: [['荞麦面（1碗）', 1], ['瘦牛肉（100g）', 1.5], ['生菜（100g）', 1], ['黄瓜（1根）', 1], ['圣女果（10颗）', 1]], tip: '圣女果当水果，清爽收尾' }
,
      { name: '豆腐丰收碗', items: [['杂粮饭（1碗）', 1], ['嫩豆腐（100g）', 3], ['西兰花（100g）', 1]], tip: '不想吃肉的日子，这碗蛋白也管够' },
      { name: '米饭·豆腐鸡胸', items: [['米饭（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['嫩豆腐（100g）', 1.5], ['番茄（1个）', 1]], tip: '鸡胸配豆腐双蛋白，顶饱不腻' }
    ],
    '晚餐': [
      { name: '红薯·嫩煎鸡胸', items: [['红薯（1个）', 1], ['鸡胸肉（100g）', 1.5], ['菠菜（100g）', 1], ['冬瓜（100g）', 1]], tip: '晚餐主食换成薯类，饱腹又清爽' },
      { name: '玉米·鸡胸暖汤', items: [['玉米（1根）', 1], ['鸡胸肉（100g）', 1], ['冬瓜（100g）', 1], ['番茄（1个）', 1], ['无糖豆浆（300ml）', 1]], tip: '汤汤水水最暖胃，晚上吃着安心' },
      { name: '荞麦面·牛肉菠菜', items: [['荞麦面（1碗）', 1], ['瘦牛肉（100g）', 1], ['菠菜（100g）', 1], ['蘑菇（100g）', 1]], tip: '面量减半、菜量加倍，一样吃饱' },
      { name: '米饭·西兰花牛肉', items: [['米饭（1碗）', 1], ['瘦牛肉（100g）', 1.5], ['西兰花（100g）', 1], ['冬瓜（100g）', 1]], tip: '米饭盛小半碗，剩下的用菜填' },
      { name: '红薯·鸡胸蔬菜盘', items: [['红薯（1个）', 1], ['鸡胸肉（100g）', 1], ['黄瓜（1根）', 1], ['菠菜（100g）', 1], ['无糖豆浆（300ml）', 1]], tip: '黄瓜生吃就好，脆脆的最解腻' },
      { name: '杂粮饭·清蔬鸡胸', items: [['杂粮饭（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['西兰花（100g）', 1], ['蘑菇（100g）', 1]], tip: '蘑菇多糖，鲜味来自食材本身' },
      { name: '玉米·豆腐暖碗', items: [['玉米（1根）', 1], ['嫩豆腐（100g）', 2], ['菠菜（100g）', 1], ['番茄（1个）', 1]], tip: '番茄煮软更出味，暖心' },
      { name: '红薯·牛肉时蔬', items: [['红薯（1个）', 1], ['瘦牛肉（100g）', 1.5], ['生菜（100g）', 1], ['胡萝卜（100g）', 1]], tip: '牛肉补铁，红薯护肠胃' },
      { name: '荞麦·鸡胸双蔬', items: [['荞麦面（1碗）', 1], ['鸡胸肉（100g）', 1.5], ['黄瓜（1根）', 1], ['冬瓜（100g）', 1]], tip: '瓜类水分足，晚上不肿' },
      { name: '米饭·豆腐牛肉', items: [['米饭（1碗）', 1], ['瘦牛肉（100g）', 1], ['嫩豆腐（100g）', 1], ['菠菜（100g）', 1], ['蘑菇（100g）', 1]], tip: '一锅炖，少油也好吃' },
      { name: '玉米·鸡胸沙拉', items: [['玉米（1根）', 1], ['鸡胸肉（100g）', 1.5], ['生菜（100g）', 1], ['圣女果（10颗）', 1], ['无糖酸奶（1杯）', 1]], tip: '酸奶当酱，晚餐也清爽' },
      { name: '红薯·双蛋白盘', items: [['红薯（1个）', 1], ['鸡胸肉（100g）', 1], ['嫩豆腐（100g）', 1], ['西兰花（100g）', 1], ['番茄（1个）', 1]], tip: '双蛋白稳血糖，夜里不饿' }
,
      { name: '杂粮饭·豆腐双拼', items: [['杂粮饭（1碗）', 1], ['嫩豆腐（100g）', 3], ['生菜（100g）', 1]], tip: '晚上吃豆制品，消化负担小' },
      { name: '杂粮饭·豆腐鸡胸', items: [['杂粮饭（1碗）', 1], ['鸡胸肉（100g）', 1], ['嫩豆腐（100g）', 1.5], ['西兰花（100g）', 1]], tip: '豆腐当小菜，软嫩好入口' }
    ],
    '加餐': [
      { name: '苹果配牛奶', items: [['苹果（1个）', 1], ['纯牛奶（250ml）', 1]], tip: '苹果带皮吃，纤维都在皮里' },
      { name: '香蕉酸奶杯', items: [['香蕉（1根）', 1], ['无糖酸奶（1杯）', 1]], tip: '香蕉切片铺在酸奶上，像小甜品' },
      { name: '猕猴桃酸奶', items: [['猕猴桃（1个）', 1], ['无糖酸奶（1杯）', 1]], tip: '猕猴桃维 C 高，配酸奶吸收更好' },
      { name: '橙子与黑巧', items: [['橙子（1个）', 1], ['黑巧克力（2块）', 1]], tip: '馋甜的就吃这两块黑巧，别碰奶茶' },
      { name: '番茄豆浆', items: [['圣女果（10颗）', 1], ['无糖豆浆（300ml）', 1]], tip: '最轻盈的一档，睡前饿了也不怕' },
      { name: '蛋白棒小歇', items: [['蛋白棒（1根）', 1]], tip: '赶时间来一根，蛋白直接补上' },
      { name: '海苔脆配豆浆', items: [['海苔（1包）', 1], ['无糖豆浆（300ml）', 1]], tip: '海苔补点矿物质，咸香解馋' },
      { name: '香蕉牛奶', items: [['香蕉（1根）', 1], ['纯牛奶（250ml）', 1]], tip: '香蕉牛奶是温柔组合，稳稳的，不容易饿' },
      { name: '苹果酸奶', items: [['苹果（1个）', 1], ['无糖酸奶（1杯）', 1]], tip: '乳制品配水果，肠道舒服' },
      { name: '坚果黑巧', items: [['原味坚果（1小把）', 0.5], ['黑巧克力（2块）', 1]], tip: '坚果配黑巧，一小把就满足' },
      { name: '猕猴桃豆浆', items: [['猕猴桃（1个）', 1], ['无糖豆浆（300ml）', 1]], tip: '维 C 和植物蛋白一起补' },
,
      { name: '奶香坚果小歇', items: [['无糖酸奶（1杯）', 1], ['原味坚果（1小把）', 0.5], ['圣女果（10颗）', 2]], tip: '下午三四点吃，撑到晚饭不暴食' },
      { name: '圣女果燕麦杯', items: [['即食燕麦（40g）', 1], ['无糖酸奶（1杯）', 1], ['圣女果（10颗）', 2]], tip: '燕麦垫底，饱腹不长肉' },
      { name: '圣女果牛奶', items: [['圣女果（10颗）', 2], ['纯牛奶（250ml）', 1]], tip: '维 C 和蛋白一起补，加餐也清爽' }
    ]
  };

  var MEAL_SLOTS = [
    { key: '早餐', id: 'bf', time: '7:30 - 8:00' },
    { key: '午餐', id: 'lunch', time: '12:00 前后' },
    { key: '加餐', id: 'snack', time: '15:30 前后' },
    { key: '晚餐', id: 'dinner', time: '18:30 - 19:00' }
  ];

  /* 按名字在 FOOD 库里找食材（含所在分组） */
  function findFood(name) {
    for (var i = 0; i < FOOD.length; i++) {
      var its = FOOD[i].items;
      for (var j = 0; j < its.length; j++) {
        if (its[j][0] === name) {
          return { item: its[j], cat: FOOD[i].t };
        }
      }
    }
    return null;
  }

  /* 食材配 emoji，纯装饰 */
  function foodEmoji(name) {
    var s = String(name);
    if (s.indexOf('米饭') > -1 || s.indexOf('杂粮饭') > -1) { return '🍚'; }
    if (s.indexOf('馒头') > -1 || s.indexOf('面包') > -1) { return '🍞'; }
    if (s.indexOf('燕麦') > -1) { return '🥣'; }
    if (s.indexOf('玉米') > -1) { return '🌽'; }
    if (s.indexOf('红薯') > -1) { return '🍠'; }
    if (s.indexOf('面') > -1) { return '🍜'; }
    if (s.indexOf('饺子') > -1) { return '🥟'; }
    if (s.indexOf('蛋') > -1) { return '🥚'; }
    if (s.indexOf('鸡') > -1) { return '🍗'; }
    if (s.indexOf('牛肉') > -1 || s.indexOf('牛排') > -1) { return '🥩'; }
    if (s.indexOf('豆腐') > -1) { return '🧊'; }
    if (s.indexOf('毛豆') > -1) { return '🫛'; }
    if (s.indexOf('酸奶') > -1) { return '🥛'; }
    if (s.indexOf('牛奶') > -1) { return '🥛'; }
    if (s.indexOf('豆浆') > -1) { return '🫘'; }
    if (s.indexOf('西兰花') > -1) { return '🥦'; }
    if (s.indexOf('生菜') > -1 || s.indexOf('菠菜') > -1) { return '🥬'; }
    if (s.indexOf('番茄') > -1 || s.indexOf('圣女果') > -1) { return '🍅'; }
    if (s.indexOf('黄瓜') > -1) { return '🥒'; }
    if (s.indexOf('冬瓜') > -1) { return '🥒'; }
    if (s.indexOf('蘑菇') > -1) { return '🍄'; }
    if (s.indexOf('胡萝卜') > -1) { return '🥕'; }
    if (s.indexOf('牛油果') > -1) { return '🥑'; }
    if (s.indexOf('苹果') > -1) { return '🍎'; }
    if (s.indexOf('香蕉') > -1) { return '🍌'; }
    if (s.indexOf('蓝莓') > -1 || s.indexOf('葡萄') > -1) { return '🫐'; }
    if (s.indexOf('橙') > -1) { return '🍊'; }
    if (s.indexOf('猕猴桃') > -1) { return '🥝'; }
    if (s.indexOf('西瓜') > -1) { return '🍉'; }
    if (s.indexOf('坚果') > -1) { return '🌰'; }
    if (s.indexOf('巧克力') > -1) { return '🍫'; }
    if (s.indexOf('海苔') > -1) { return '🍙'; }
    if (s.indexOf('蛋白棒') > -1) { return '🍫'; }
    if (s.indexOf('饼干') > -1 || s.indexOf('薯片') > -1) { return '🍪'; }
    if (s.indexOf('蛋糕') > -1 || s.indexOf('冰淇淋') > -1) { return '🍰'; }
    if (s.indexOf('咖啡') > -1 || s.indexOf('美式') > -1 || s.indexOf('拿铁') > -1) { return '☕'; }
    if (s.indexOf('茶') > -1 || s.indexOf('气泡') > -1 || s.indexOf('果汁') > -1 || s.indexOf('奶茶') > -1) { return '🥤'; }
    return '🍽';
  }

  /* 算一套食谱的合计营养 */
  function calcRecipe(r) {
    var out = { kcal: 0, p: 0, c: 0, f: 0, lines: [], names: [] };
    if (!r || !r.items) {
      return out;
    }
    for (var i = 0; i < r.items.length; i++) {
      var spec = r.items[i];
      var name = typeof spec === 'string' ? spec : spec[0];
      var qty = typeof spec === 'string' ? 1 : (spec[1] || 1);
      var hit = findFood(name);
      if (!hit) {
        continue;
      }
      var it = hit.item;
      out.kcal += (it[1] || 0) * qty;
      out.p += (it[2] || 0) * qty;
      out.c += (it[3] || 0) * qty;
      out.f += (it[4] || 0) * qty;
      var label = qty === 1 ? name : name + ' ×' + qty;
      out.names.push(label);
      out.lines.push({ name: name, label: label, qty: qty, emoji: foodEmoji(name), cat: hit.cat });
    }
    out.kcal = Math.round(out.kcal);
    out.p = Math.round(out.p * 10) / 10;
    out.c = Math.round(out.c * 10) / 10;
    out.f = Math.round(out.f * 10) / 10;
    return out;
  }

  /* 今天该吃哪一套：用日期当种子，同一天刷新不变，每天自动换 */
  function todayRecipe(mealKey) {
    var list = RECIPES[mealKey];
    if (!list || !list.length) {
      return null;
    }
    var s = daySeed();
    var salt = mealKey === '早餐' ? 0 : mealKey === '午餐' ? 3 : mealKey === '加餐' ? 7 : 11;
    var idx = ((s + salt) % list.length + list.length) % list.length;
    return list[idx];
  }

  /* ---------- 4. 三大营养素目标 ---------- */
  function macroTarget(suggestKcal, weightKg) {
    if (!suggestKcal || suggestKcal <= 0) {
      return null;
    }
    var pGoal = 85;
    if (weightKg && weightKg > 0) {
      pGoal = Math.round(weightKg * 1.4);
    }
    var fGoal = Math.round(suggestKcal * 0.25 / 9);
    var cGoal = Math.round((suggestKcal - pGoal * 4 - fGoal * 9) / 4);
    if (cGoal < 80) {
      cGoal = 80;
    }
    return { p: pGoal, c: cGoal, f: fGoal, kcal: suggestKcal };
  }

  /* ---------------- 基础工具 ---------------- */

  function pad2(n) {
    var s = String(n);
    return s.length < 2 ? '0' + s : s;
  }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dateOnly(v) {
    if (v === null || v === undefined || v === '') {
      return '';
    }
    var s = String(v);
    return s.length >= 10 ? s.substr(0, 10) : s;
  }

  function shortDate(s) {
    return s && s.length >= 10 ? s.substr(5) : (s || '');
  }

  function fmt1(v) {
    if (v === null || v === undefined || v === '') {
      return '--';
    }
    var n = Number(v);
    if (isNaN(n)) {
      return '--';
    }
    return String(Math.round(n * 10) / 10);
  }

  function fmtInt(v) {
    var n = Number(v);
    if (isNaN(n)) {
      return '--';
    }
    return String(Math.round(n));
  }

  function numOrNull(v) {
    if (v === null || v === undefined || v === '') {
      return null;
    }
    var n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function clearEl(el) {
    if (!el) {
      return;
    }
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  function setText(root, sel, text) {
    var el = root.querySelector(sel);
    if (el) {
      el.textContent = text;
    }
  }

  function toggleEl(el, show) {
    if (el) {
      el.style.display = show ? '' : 'none';
    }
  }

  function emptyNode(text) {
    var p = document.createElement('p');
    p.className = 'muted';
    p.textContent = text;
    return p;
  }

  // 写入失败原因归类：给出能照做的下一步，而不是笼统的"再试一次"
  function dbErrMsg(err) {
    var s = '';
    try {
      s = String((err && err.message) || err || '');
    } catch (e) {
      s = '';
    }
    if (/401|not\s*login|未登录|登录已过期/i.test(s)) {
      return '要先登录一下才能记哦 · 刷新页面按提示登录就好';
    }
    if (/403|permission|denied|无权限|权限不足/i.test(s)) {
      return '这个页面还没给你记录权限 · 让哥哥在资料库里加你为协作者';
    }
    if (/network|fetch|timeout|ECONN|网络/i.test(s)) {
      return '网络不太好，等一下再试试';
    }
    return '没保存上，再点一次试试';
  }

  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) {
      return;
    }
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      el.classList.remove('show');
      toastTimer = null;
    }, 2600);
  }

  function setStat(name, text) {
    var el = document.querySelector('[data-stat="' + name + '"]');
    if (!el) {
      return;
    }
    el.textContent = text;
    el.setAttribute('data-sp-bindable', 'database');
    el.setAttribute('data-sp-database-id', DATABASE_ID);
  }

  function inputVal(formId, name) {
    var el = document.querySelector('#' + formId + ' [name="' + name + '"]');
    return el ? String(el.value).trim() : '';
  }

  function selectText(field, v) {
    if (v === null || v === undefined || v === '') {
      return '';
    }
    var list = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === v || list[i].text === v) {
        return list[i].text;
      }
    }
    return String(v);
  }

  function optionIdByText(field, text) {
    var list = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].text === text) {
        return list[i].id;
      }
    }
    return '';
  }

  function achvTexts(v) {
    if (!v) {
      return [];
    }
    var arr = [];
    if (typeof v === 'string') {
      arr = [v];
    } else if (v.length !== undefined) {
      arr = v;
    }
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var t = selectText('小成就', arr[i]);
      if (t) {
        out.push(t);
      }
    }
    return out;
  }

  /* ---------------- 数据读写 ---------------- */

  function fetchAll(startCursor, acc, guard) {
    acc = acc || [];
    guard = guard || 0;
    if (guard > 100) {
      return Promise.resolve(acc);
    }
    return db.query({
      databaseId: DATABASE_ID,
      sorts: [{ property: '日期', direction: 'descending' }],
      pageSize: 200,
      startCursor: startCursor
    }).then(function (r) {
      acc = acc.concat(r.results || []);
      var next = r.nextCursor;
      if (r.hasMore && next && next !== startCursor && (r.results || []).length) {
        return fetchAll(next, acc, guard + 1);
      }
      return acc;
    }).catch(function (err) {
      console.error('[database] 读取失败:', err);
      throw err;
    });
  }

  function showListsError() {
    var ids = ['today-list', 'body-list', 'diet-list', 'sport-list'];
    for (var i = 0; i < ids.length; i++) {
      var box = document.getElementById(ids[i]);
      if (box) {
        clearEl(box);
        box.appendChild(emptyNode('暂时加载不出来，刷新页面再试试'));
      }
    }
  }

  function refreshData() {
    if (!db) {
      return;
    }
    if (isRefreshing) {
      refreshQueued = true;
      return;
    }
    isRefreshing = true;
    if (firstLoad) {
      var lb = document.getElementById('loading-bar');
      if (lb) {
        lb.hidden = false;
      }
    }
    fetchAll().then(function (all) {
      ALL = all;
      renderAll();
      hideSkeleton();
      firstLoad = false;
      isRefreshing = false;
      lastRefreshAt = Date.now();
      var lb2 = document.getElementById('loading-bar');
      if (lb2) {
        lb2.hidden = true;
      }
      if (refreshQueued) {
        refreshQueued = false;
        refreshData();
      }
    }).catch(function (err) {
      console.error('[database] 数据加载失败:', err);
      isRefreshing = false;
      firstLoad = false;
      var lb3 = document.getElementById('loading-bar');
      if (lb3) {
        lb3.hidden = true;
      }
      hideSkeleton();
      toast('数据没加载出来，刷新页面试试');
      showListsError();
    });
  }

  function scheduleRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setTimeout(function () {
      refreshTimer = null;
      refreshData();
    }, 300);
  }

  /* ---------------- 渲染 ---------------- */

  function typeOfRow(r) {
    var t = selectText('记录类型', r['记录类型']);
    if (t === '身体数据') {
      return 'body';
    }
    if (t === '饮食') {
      return 'diet';
    }
    if (t === '运动') {
      return 'sport';
    }
    if (r['体重'] !== null && r['体重'] !== undefined) {
      return 'body';
    }
    if (r['腰围'] !== null && r['腰围'] !== undefined) {
      return 'body';
    }
    if (r['餐次'] || r['饮食内容'] || (r['摄入热量'] !== null && r['摄入热量'] !== undefined)) {
      return 'diet';
    }
    if (r['运动类型'] || r['运动项目'] || (r['运动时长'] !== null && r['运动时长'] !== undefined) || (r['消耗热量'] !== null && r['消耗热量'] !== undefined)) {
      return 'sport';
    }
    return 'body';
  }

  function normalizeRows() {
    var items = [];
    for (var i = 0; i < ALL.length; i++) {
      var r = ALL[i];
      if (!r || typeof r !== 'object') {
        continue;
      }
      items.push({ id: r._id || '', type: typeOfRow(r), date: dateOnly(r['日期']), raw: r });
    }
    items.sort(function (a, b) {
      if (a.date === b.date) {
        return 0;
      }
      return a.date < b.date ? 1 : -1;
    });
    return items;
  }

  function sumField(list, key) {
    var s = 0;
    for (var i = 0; i < list.length; i++) {
      var v = list[i].raw[key];
      if (typeof v === 'number') {
        s += v;
      }
    }
    return s;
  }

  function latestValue(items, type, key) {
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type !== type) {
        continue;
      }
      var v = it.raw[key];
      if (typeof v === 'number') {
        return { value: v, date: it.date };
      }
    }
    return null;
  }

  function calcStreak(dateMap) {
    var d = new Date();
    var key = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    if (!dateMap[key]) {
      d.setDate(d.getDate() - 1);
      key = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    var count = 0;
    var guard = 0;
    while (dateMap[key] && guard < 5000) {
      count++;
      d.setDate(d.getDate() - 1);
      key = d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
      guard++;
    }
    return count;
  }

  function weekStartDate() {
    var t = new Date();
    var day = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    var wd = (day.getDay() + 6) % 7;
    day.setDate(day.getDate() - wd);
    return day;
  }

  function weekDateMap() {
    var map = {};
    var d = weekStartDate();
    for (var i = 0; i < 7; i++) {
      map[d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())] = true;
      d.setDate(d.getDate() + 1);
    }
    return map;
  }

  function profileReady() {
    return !!(PROFILE && PROFILE.height > 0 && PROFILE.weight > 0 && PROFILE.age > 0);
  }

  function currentWeight(items) {
    var latest = latestValue(items, 'body', '体重');
    if (latest) {
      return latest.value;
    }
    if (PROFILE && PROFILE.weight > 0) {
      return PROFILE.weight;
    }
    return null;
  }

  function budgetInfo(latestW) {
    if (!profileReady()) {
      return null;
    }
    var w = PROFILE.weight;
    if (typeof latestW === 'number' && latestW > 0) {
      w = latestW;
    }
    var bmr = 10 * w + 6.25 * PROFILE.height - 5 * PROFILE.age - 161;
    var act = PROFILE.act > 0 ? PROFILE.act : 1.375;
    var tdee = bmr * act;
    var suggest = Math.round(tdee - 350);
    if (suggest < 1200) {
      suggest = 1200;
    }
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), suggest: suggest };
  }

  
  /* ================= 运动栏 · 与饮食栏对齐 ================= */
  /* 每日训练库：按日期+状态轮换；围绕居家器材 跑步机 / 健腹轮 设计，含徒手与瑜伽垫；level: gentle/normal/challenge */
  var WORKOUTS = [
    { name: '舒缓恢复日', level: 'gentle', items: [
      { name: '慢走热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '转肩绕膝，活动开关节再动' },
      { name: '瑜伽垫·猫牛式+臀桥', eqp: '瑜伽垫', type: '力量', sel: '居家徒手跟练', min: 8, kcal: 36, tip: '猫牛式活动脊柱，臀桥练臀不伤膝' },
      { name: '跑步机·超慢跑', eqp: '跑步机', type: '有氧', sel: '跑步', min: 15, kcal: 105, tip: '超慢跑对膝盖友好，燃脂不含糊' },
      { name: '深度拉伸', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 8, kcal: 20, tip: '每个动作停久一点，放松筋膜' }
    ]
    },
    { name: '温柔散步日', level: 'gentle', items: [
      { name: '慢走热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '轻松慢走，唤醒身体' },
      { name: '瑜伽垫·腹式呼吸+侧卧', eqp: '瑜伽垫', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 27, tip: '躺着也能放松核心，不费力' },
      { name: '跑步机·慢走收尾', eqp: '跑步机', type: '有氧', sel: '快走', min: 12, kcal: 84, tip: '慢走让心率慢慢降下来' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '经期舒缓日', level: 'gentle', items: [
      { name: '关节活动热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '转肩绕膝，预热关节' },
      { name: '瑜伽垫·臀桥+抬腿', eqp: '瑜伽垫', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 27, tip: '臀桥练臀，不压迫腹部' },
      { name: '跑步机·超慢跑', eqp: '跑步机', type: '有氧', sel: '跑步', min: 10, kcal: 70, tip: '超慢跑轻一点，别跑别跳' },
      { name: '深度拉伸', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 8, kcal: 20, tip: '放松筋膜，缓解坠胀' }
    ]
    },
    { name: '活力燃脂日', level: 'normal', items: [
      { name: '开合跳热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 35, tip: '跳之前活动手腕脚踝，落地轻一点护膝盖' },
      { name: '跑步机·快走爬坡', eqp: '跑步机', type: '有氧', sel: '快走', min: 20, kcal: 140, tip: '坡度 6–8、速度 5–6，边走边追剧一点都不累' },
      { name: '健腹轮·跪姿卷腹', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 6, kcal: 30, tip: '膝盖垫软垫，核心收紧，下去慢、回来更慢' },
      { name: '全身拉伸', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '每个动作停留 20 秒，呼吸别憋' }
    ]
    },
    { name: '核心雕刻日', level: 'normal', items: [
      { name: '慢跑热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 4, kcal: 28, tip: '慢跑到微微出汗，身体热起来再上力量' },
      { name: '健腹轮·标准卷腹', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 8, kcal: 40, tip: '从跪姿进阶到站姿前推，量力而行' },
      { name: '平板支撑+臀桥', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '平板撑到抖就停，臀桥慢起慢落' },
      { name: '跑步机·慢走收尾', eqp: '跑步机', type: '有氧', sel: '快走', min: 8, kcal: 56, tip: '收尾慢走让心率慢慢降下来' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '轻快有氧日', level: 'normal', items: [
      { name: '关节活动热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '转肩、绕膝、活动脚踝，预热关节' },
      { name: '跑步机·变速走', eqp: '跑步机', type: '有氧', sel: '快走', min: 22, kcal: 154, tip: '快慢交替，心率上来又下来，燃脂更稳' },
      { name: '徒手深蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '膝盖别内扣，屁股往后坐像坐椅子' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '拉伸到微微紧，不疼就好' }
    ]
    },
    { name: '居家小器械日', level: 'normal', items: [
      { name: '开合跳热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 35, tip: '开合跳热身，顺便把心率提上来' },
      { name: '健腹轮·跪姿', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 7, kcal: 35, tip: '跪姿稳住骨盆，别塌腰' },
      { name: '水瓶臂屈伸', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '两瓶矿泉水当小哑铃，举到酸就对了' },
      { name: '跑步机·快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 16, kcal: 112, tip: '稳住呼吸，能边走边聊天最合适' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '全身拉伸，尤其是腹部和腿' }
    ]
    },
    { name: '燃脂循环日', level: 'normal', items: [
      { name: '开合跳热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 35, tip: '开合跳热身，把心率提上来' },
      { name: '徒手深蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '膝盖别内扣，屁股往后坐像坐椅子' },
      { name: '跑步机·快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 18, kcal: 126, tip: '稳住呼吸，边走边聊天最合适' },
      { name: '平板支撑+臀桥', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '平板撑到抖就停，臀桥慢起慢落' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '徒手全身日', level: 'normal', items: [
      { name: '慢跑热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 4, kcal: 28, tip: '慢跑到微微出汗，身体热起来' },
      { name: '徒手弓步蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '左右各 10 个，腿臀一起练' },
      { name: '健腹轮·跪姿', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 6, kcal: 30, tip: '跪姿稳住骨盆，别塌腰' },
      { name: '快走收尾', eqp: '跑步机', type: '有氧', sel: '快走', min: 8, kcal: 56, tip: '收尾慢走让心率慢慢降下来' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '稳扎稳打日', level: 'normal', items: [
      { name: '关节活动', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '转肩绕膝，预热关节' },
      { name: '水瓶臂屈伸', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '两瓶矿泉水当小哑铃，举到酸' },
      { name: '跑步机·快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 16, kcal: 112, tip: '稳住呼吸，能边走边聊天' },
      { name: '瑜伽垫·臀桥', eqp: '瑜伽垫', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 27, tip: '臀桥慢起慢落，练臀不伤膝' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '周末挑战日', level: 'challenge', items: [
      { name: '开合跳+高抬腿热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 6, kcal: 45, tip: '高抬腿膝盖抬到腰，热身更带劲' },
      { name: '跑步机·爬坡快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 24, kcal: 168, tip: '坡度拉到 8，像在爬小山' },
      { name: '健腹轮·三连击', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 8, kcal: 40, tip: '跪姿-半站-站姿，循序渐进' },
      { name: '徒手弓步蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '左右各 10 个，腿臀一起练' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '收工拉伸，给身体一个句号' }
    ]
    },
    { name: '进阶燃脂日', level: 'challenge', items: [
      { name: '开合跳+高抬腿热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 6, kcal: 45, tip: '高抬腿膝盖抬到腰，热身更带劲' },
      { name: '跑步机·爬坡快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 26, kcal: 182, tip: '坡度拉到 8，燃脂更猛' },
      { name: '健腹轮·三连击', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 8, kcal: 40, tip: '跪姿-半站-站姿，循序渐进' },
      { name: '徒手弓步蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '左右各 10 个，腿臀一起练' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '收工拉伸，给身体一个句号' }
    ]
    },
    { name: '高阶力量日', level: 'challenge', items: [
      { name: '慢跑热身', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 4, kcal: 28, tip: '慢跑到微微出汗，再上力量' },
      { name: '健腹轮·标准卷腹', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 8, kcal: 40, tip: '标准卷腹，核心收紧' },
      { name: '徒手深蹲', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '膝盖别内扣，屁股往后坐' },
      { name: '水瓶臂屈伸', eqp: '徒手', type: '力量', sel: '居家徒手跟练', min: 6, kcal: 30, tip: '两瓶矿泉水当小哑铃' },
      { name: '跑步机·变速走', eqp: '跑步机', type: '有氧', sel: '快走', min: 20, kcal: 140, tip: '快慢交替，心率更稳' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 6, kcal: 15, tip: '练完拉伸，第二天不酸' }
    ]
    },
    { name: '长时有氧日', level: 'challenge', items: [
      { name: '关节活动', eqp: '徒手', type: '有氧', sel: '居家徒手跟练', min: 5, kcal: 30, tip: '转肩绕膝，预热关节' },
      { name: '跑步机·爬坡快走', eqp: '跑步机', type: '有氧', sel: '快走', min: 28, kcal: 196, tip: '坡度 8，长时燃脂' },
      { name: '健腹轮·跪姿', eqp: '健腹轮', type: '力量', sel: '小器械力量', min: 7, kcal: 35, tip: '跪姿稳住骨盆，别塌腰' },
      { name: '拉伸放松', eqp: '瑜伽垫', type: '拉伸', sel: '拉伸放松', min: 8, kcal: 20, tip: '拉伸到微微紧，不疼就好' }
    ]
    }
  ];

  var EX_CAT = ['有氧', '力量', '拉伸'];
  var EX_COLOR = { '有氧': '#7D90CC', '力量': '#CE7C9E', '拉伸': '#6FBFA8' };
  var EX_ICON = { '有氧': '🏃', '力量': '💪', '拉伸': '🧘' };
  var sportPlanData = [];

  function exEmoji(name) {
    var s = String(name);
    if (s.indexOf('跑步机') > -1 || s.indexOf('快走') > -1 || s.indexOf('慢跑') > -1 || s.indexOf('走') > -1) { return '🏃'; }
    if (s.indexOf('健腹轮') > -1) { return '🎯'; }
    if (s.indexOf('开合跳') > -1 || s.indexOf('高抬腿') > -1 || s.indexOf('热身') > -1) { return '🤸'; }
    if (s.indexOf('深蹲') > -1 || s.indexOf('弓步') > -1 || s.indexOf('平板') > -1 || s.indexOf('臀桥') > -1 || s.indexOf('核心') > -1) { return '🏋️'; }
    if (s.indexOf('拉伸') > -1 || s.indexOf('瑜伽') > -1 || s.indexOf('放松') > -1) { return '🧘'; }
    if (s.indexOf('跳绳') > -1) { return '🪢'; }
    return '💪';
  }

  function exCategoryOf(typeText) {
    var s = String(typeText || '');
    if (s.indexOf('拉伸') > -1) { return '拉伸'; }
    if (s.indexOf('小器械') > -1) { return '力量'; }
    if (s.indexOf('跑步') > -1 || s.indexOf('快走') > -1 || s.indexOf('跳绳') > -1 || s.indexOf('骑行') > -1 || s.indexOf('徒手') > -1) { return '有氧'; }
    return '有氧';
  }

  function calcWorkout(plan) {
    var out = { min: 0, kcal: 0, byCat: { '有氧': 0, '力量': 0, '拉伸': 0 }, byCatMin: { '有氧': 0, '力量': 0, '拉伸': 0 } };
    if (!plan || !plan.items) { return out; }
    for (var i = 0; i < plan.items.length; i++) {
      var e = plan.items[i];
      out.min += e.min;
      out.kcal += e.kcal;
      out.byCat[e.type] = (out.byCat[e.type] || 0) + e.kcal;
      out.byCatMin[e.type] = (out.byCatMin[e.type] || 0) + e.min;
    }
    return out;
  }

  function todayWorkout() {
    var s = daySeed();
    var buckets = { gentle: [], normal: [], challenge: [] };
    for (var i = 0; i < WORKOUTS.length; i++) {
      var lv = WORKOUTS[i].level || 'normal';
      if (!buckets[lv]) { buckets[lv] = []; }
      buckets[lv].push(WORKOUTS[i]);
    }
    var list;
    if (PERIOD && PERIOD.active) {
      list = buckets.gentle.length ? buckets.gentle : buckets.normal;
    } else {
      var wd = (new Date().getDay() + 6) % 7;
      var isWeekend = (wd === 5 || wd === 6);
      var want = isWeekend ? 'challenge' : 'normal';
      list = (buckets[want] && buckets[want].length) ? buckets[want] : buckets.normal;
    }
    if (!list || !list.length) { list = WORKOUTS; }
    var idx = ((s % list.length) + list.length) % list.length;
    return list[idx];
  }

  function todaySportState(items, today) {
    var sportToday = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type === 'sport' && items[i].date === today) {
        sportToday.push(items[i]);
      }
    }
    var loggedKcal = sumField(sportToday, '消耗热量');
    var loggedMin = sumField(sportToday, '运动时长');
    var doneCat = { '有氧': false, '力量': false, '拉伸': false };
    var loggedNames = [];
    var byCatActual = { '有氧': 0, '力量': 0, '拉伸': 0 };
    var byCatActualMin = { '有氧': 0, '力量': 0, '拉伸': 0 };
    for (var j = 0; j < sportToday.length; j++) {
      var rw = sportToday[j].raw || {};
      var t = selectText('运动类型', rw['运动类型']) || '';
      var cat = exCategoryOf(t);
      doneCat[cat] = true;
      var nm = rw['运动项目'] || t || '运动';
      loggedNames.push(nm);
      var kk = rw['消耗热量'];
      if (typeof kk === 'number') { byCatActual[cat] += kk; }
      var mm = rw['运动时长'];
      if (typeof mm === 'number') { byCatActualMin[cat] += mm; }
    }
    var plan = todayWorkout();
    var calc = calcWorkout(plan);
    return {
      sportToday: sportToday,
      loggedKcal: loggedKcal,
      loggedMin: loggedMin,
      doneCat: doneCat,
      loggedNames: loggedNames,
      byCatActual: byCatActual,
      byCatActualMin: byCatActualMin,
      plan: plan,
      calc: calc,
      mode: sportToday.length > 0 ? 'logged' : 'preview'
    };
  }

  /* 画三色环：弧长 = 各类型预计消耗占比 */
  function drawExRing(st) {
    var R = 44;
    var C = 2 * Math.PI * R;
    var segA = document.getElementById('ex-seg-aer');
    var segS = document.getElementById('ex-seg-str');
    var segF = document.getElementById('ex-seg-fle');
    if (!segA || !segS || !segF) { return; }
    var src = (st.mode === 'logged') ? st.byCatActual : st.calc.byCat;
    var a = src['有氧'] || 0;
    var s = src['力量'] || 0;
    var f = src['拉伸'] || 0;
    var sum = a + s + f;
    if (sum <= 0) {
      segA.style.strokeDasharray = '0 ' + C;
      segS.style.strokeDasharray = '0 ' + C;
      segF.style.strokeDasharray = '0 ' + C;
      return;
    }
    var la = a / sum * C;
    var ls = s / sum * C;
    var lf = f / sum * C;
    segA.style.strokeDasharray = la + ' ' + (C - la);
    segA.style.strokeDashoffset = '0';
    segS.style.strokeDasharray = ls + ' ' + (C - ls);
    segS.style.strokeDashoffset = String(-la);
    segF.style.strokeDasharray = lf + ' ' + (C - lf);
    segF.style.strokeDashoffset = String(-(la + ls));
  }

  function exRow(name, key, mins, kcal, maxK) {
    var wrap = document.createElement('div');
    wrap.className = 'mrow';
    var top = document.createElement('div');
    top.className = 'mrow-top';
    var dot = document.createElement('span');
    dot.className = 'mrow-dot ' + key;
    var nm = document.createElement('span');
    nm.className = 'mrow-name';
    nm.textContent = name;
    var g = document.createElement('span');
    g.className = 'mrow-goal';
    g.textContent = mins + ' 分钟';
    var v = document.createElement('span');
    v.className = 'mrow-val';
    v.textContent = kcal + ' kcal';
    top.appendChild(dot);
    top.appendChild(nm);
    top.appendChild(g);
    top.appendChild(v);
    wrap.appendChild(top);
    var bar = document.createElement('div');
    bar.className = 'mrow-bar ' + key;
    var fill = document.createElement('i');
    bar.appendChild(fill);
    wrap.appendChild(bar);
    var tag = document.createElement('p');
    tag.className = 'mrow-tag';
    wrap.appendChild(tag);
    var pct = maxK > 0 ? kcal / maxK * 100 : 0;
    if (pct > 100) { pct = 100; }
    fill.style.width = pct + '%';
    tag.textContent = mins + ' 分钟 · 约 ' + kcal + ' kcal';
    return wrap;
  }

  function renderExBoard(items, today) {
    var st = todaySportState(items, today);
    var board = document.getElementById('ex-board');
    if (board) {
      var slots = board.querySelectorAll('[data-ex-slot]');
      for (var k = 0; k < slots.length; k++) {
        var slot = slots[k];
        var cat = slot.getAttribute('data-ex-slot');
        var em = slot.querySelector('em');
        var plannedMin = st.calc.byCatMin[cat] || 0;
        if (st.doneCat[cat]) {
          slot.className = 'meal-slot done';
          if (em) {
            var dm = st.byCatActualMin[cat] || plannedMin;
            em.textContent = '✓ 已练 ' + dm + 'min';
          }
        } else {
          slot.className = 'meal-slot';
          if (em) { em.textContent = '计划 ' + plannedMin + 'min'; }
        }
      }
    }
    var noteEl = document.getElementById('ex-note');
    if (noteEl) {
      var done = 0;
      for (var c = 0; c < EX_CAT.length; c++) { if (st.doneCat[EX_CAT[c]]) { done++; } }
      var txt;
      if (done === 0) {
        txt = '今天还没动，先来 5 分钟开合跳热个身？';
      } else if (done >= 3) {
        txt = '有氧、力量、拉伸全都练到了，今天把自己照顾得很好';
      } else {
        txt = '还差 ' + (3 - done) + ' 类没练，照着下面点「打卡这个」就好';
      }
      noteEl.textContent = txt;
    }
  }

  function renderExPlate(items, today) {
    var st = todaySportState(items, today);
    var kcalEl = document.getElementById('ex-kcal');
    var subEl = document.getElementById('ex-sub');
    var rowsEl = document.getElementById('ex-rows');
    var noteEl = document.getElementById('ex-note2');
    var tagEl = document.getElementById('ex-plate-tag');
    if (kcalEl) {
      if (st.mode === 'logged') {
        kcalEl.textContent = st.loggedKcal > 0 ? String(Math.round(st.loggedKcal)) : '--';
      } else {
        kcalEl.textContent = st.calc.kcal > 0 ? String(st.calc.kcal) : '--';
      }
    }
    if (subEl) { subEl.textContent = st.mode === 'logged' ? '已消耗' : '今日计划'; }
    if (tagEl) { tagEl.textContent = st.mode === 'logged' ? '已记录的运动构成' : '按今日计划算'; }
    drawExRing(st);
    if (rowsEl) {
      clearEl(rowsEl);
      if (st.mode === 'logged') {
        var maxKA = Math.max(st.byCatActual['有氧'] || 0, st.byCatActual['力量'] || 0, st.byCatActual['拉伸'] || 0, 1);
        rowsEl.appendChild(exRow('有氧', 'aer', st.byCatActualMin['有氧'] || 0, st.byCatActual['有氧'] || 0, maxKA));
        rowsEl.appendChild(exRow('力量', 'str', st.byCatActualMin['力量'] || 0, st.byCatActual['力量'] || 0, maxKA));
        rowsEl.appendChild(exRow('拉伸', 'fle', st.byCatActualMin['拉伸'] || 0, st.byCatActual['拉伸'] || 0, maxKA));
      } else {
        var maxK = Math.max(st.calc.byCat['有氧'] || 0, st.calc.byCat['力量'] || 0, st.calc.byCat['拉伸'] || 0, 1);
        rowsEl.appendChild(exRow('有氧', 'aer', st.calc.byCatMin['有氧'] || 0, st.calc.byCat['有氧'] || 0, maxK));
        rowsEl.appendChild(exRow('力量', 'str', st.calc.byCatMin['力量'] || 0, st.calc.byCat['力量'] || 0, maxK));
        rowsEl.appendChild(exRow('拉伸', 'fle', st.calc.byCatMin['拉伸'] || 0, st.calc.byCat['拉伸'] || 0, maxK));
      }
    }
    if (noteEl) {
      if (st.mode === 'preview') {
        noteEl.textContent = '照今日计划练，一共约 ' + st.calc.kcal + ' kcal · ' + st.calc.min + ' 分钟';
      } else {
        noteEl.textContent = '今天已消耗 ' + Math.round(st.loggedKcal) + ' kcal，继续把计划补满更带劲';
      }
    }
  }

  function renderExPlan(items, today) {
    var st = todaySportState(items, today);
    var box = document.getElementById('today-exercises');
    if (!box) { return; }
    clearEl(box);
    sportPlanData = [];
    var totalK = 0;
    var totalM = 0;
    for (var i = 0; i < st.plan.items.length; i++) {
      var e = st.plan.items[i];
      totalK += e.kcal;
      totalM += e.min;
      sportPlanData.push(e);
      var idx = sportPlanData.length - 1;

      var card = document.createElement('div');
      card.className = 'rc-card';
      card.style.setProperty('--rc-c', EX_COLOR[e.type] || '#CE7C9E');

      var head = document.createElement('div');
      head.className = 'rc-head';
      var emo = document.createElement('span');
      emo.className = 'rc-emo';
      emo.textContent = exEmoji(e.name);
      var title = document.createElement('div');
      title.className = 'rc-title';
      var tb = document.createElement('b');
      tb.textContent = e.name;
      var ts = document.createElement('span');
      ts.textContent = e.eqp + ' · ' + e.min + ' 分钟';
      title.appendChild(tb);
      title.appendChild(ts);
      var kb = document.createElement('div');
      kb.className = 'rc-kcal';
      var kn = document.createElement('b');
      kn.textContent = String(e.kcal);
      var ku = document.createElement('span');
      ku.textContent = 'kcal';
      var ke = document.createElement('em');
      ke.textContent = e.type;
      kb.appendChild(kn);
      kb.appendChild(ku);
      kb.appendChild(ke);
      head.appendChild(emo);
      head.appendChild(title);
      head.appendChild(kb);
      card.appendChild(head);

      var its = document.createElement('div');
      its.className = 'rc-items';
      var pill1 = document.createElement('span');
      pill1.className = 'rc-item ex-eqp';
      var ic1 = document.createElement('i');
      ic1.textContent = '🛠';
      pill1.appendChild(ic1);
      pill1.appendChild(document.createTextNode(' ' + e.eqp));
      var pill2 = document.createElement('span');
      pill2.className = 'rc-item ex-min';
      var ic2 = document.createElement('i');
      ic2.textContent = '⏱';
      pill2.appendChild(ic2);
      pill2.appendChild(document.createTextNode(' ' + e.min + ' 分钟'));
      its.appendChild(pill1);
      its.appendChild(pill2);
      card.appendChild(its);

      var mb = document.createElement('div');
      mb.className = 'rc-macro';
      var seg = document.createElement('i');
      seg.style.width = '100%';
      seg.style.background = EX_COLOR[e.type] || '#CE7C9E';
      mb.appendChild(seg);
      card.appendChild(mb);

      var lg = document.createElement('div');
      lg.className = 'rc-legend';
      lg.textContent = '时长 ' + e.min + ' 分钟 · 约 ' + e.kcal + ' kcal';
      card.appendChild(lg);

      if (e.tip) {
        var tp = document.createElement('p');
        tp.className = 'rc-tip';
        tp.textContent = e.tip;
        card.appendChild(tp);
      }

      var foot = document.createElement('div');
      foot.className = 'rc-foot';
      var stp = document.createElement('p');
      var isDone = st.doneCat[e.type];
      stp.className = 'rc-status' + (isDone ? ' done' : '');
      stp.textContent = isDone ? '这类已经练过啦 ✓' : '练完点右边，账自动记好';
      var btn = document.createElement('button');
      btn.className = 'rc-btn';
      btn.type = 'button';
      btn.setAttribute('data-ex-log', String(idx));
      btn.textContent = isDone ? '再记一次' : '打卡这个';
      foot.appendChild(stp);
      foot.appendChild(btn);
      card.appendChild(foot);

      box.appendChild(card);
    }
    var cap = document.getElementById('exday-cap');
    if (cap) {
      cap.textContent = '今日计划「' + st.plan.name + '」· 合计约 ' + totalK + ' kcal · ' + totalM + ' 分钟';
    }
    var rtag = document.getElementById('ex-plan-tag');
    if (rtag) {
      var dd = new Date();
      rtag.textContent = (dd.getMonth() + 1) + '/' + dd.getDate() + ' 计划 · 每天自动换';
    }
  }

  function renderExBurn(items, today) {
    var st = todaySportState(items, today);
    var inKcal = st.loggedKcal;
    var planKcal = st.calc.kcal;
    var inBar = document.getElementById('exb-in-bar');
    var outBar = document.getElementById('exb-out-bar');
    var inNum = document.getElementById('exb-in-num');
    var outNum = document.getElementById('exb-out-num');
    var gapEl = document.getElementById('exb-gap');
    var gapNote = document.getElementById('exb-gap-note');
    var splitEl = document.getElementById('exb-split');
    var moveEl = document.getElementById('exb-move');

    if (inNum) { inNum.textContent = inKcal > 0 ? Math.round(inKcal) + ' kcal' : '0 kcal'; }
    if (outNum) { outNum.textContent = planKcal > 0 ? Math.round(planKcal) + ' kcal' : '--'; }
    var maxV = Math.max(inKcal, planKcal, 1);
    if (inBar) { inBar.style.width = (inKcal / maxV * 100) + '%'; }
    if (outBar) { outBar.style.width = planKcal > 0 ? (planKcal / maxV * 100) + '%' : '0%'; }

    if (gapEl && gapNote) {
      if (st.mode === 'preview') {
        gapEl.textContent = '--';
        gapNote.textContent = '今天还没动，计划 ' + planKcal + ' kcal 等你点亮';
      } else {
        var remain = Math.round(planKcal - inKcal);
        if (remain <= 0) {
          gapEl.textContent = '已达标 🎉';
          gapNote.textContent = '今日计划全完成啦，超棒的！';
        } else {
          gapEl.textContent = '还差 ' + remain + ' kcal';
          gapNote.textContent = '已经完成 ' + Math.round(inKcal) + ' kcal，继续把计划补满';
        }
      }
    }

    if (splitEl) {
      clearEl(splitEl);
      var catSrc = (st.mode === 'logged') ? st.byCatActual : st.calc.byCat;
      var parts = [
        ['有氧', catSrc['有氧'] || 0],
        ['力量', catSrc['力量'] || 0],
        ['拉伸', catSrc['拉伸'] || 0]
      ];
      for (var i = 0; i < parts.length; i++) {
        var sp = document.createElement('span');
        sp.textContent = parts[i][0] + ' ';
        var b = document.createElement('b');
        b.textContent = parts[i][1] + ' kcal';
        sp.appendChild(b);
        splitEl.appendChild(sp);
      }
    }

    if (moveEl) {
      clearEl(moveEl);
      var line1 = document.createElement('div');
      if (st.sportToday.length) {
        line1.appendChild(document.createTextNode('今天练了：'));
        var b1 = document.createElement('b');
        b1.textContent = st.loggedNames.join('、');
        line1.appendChild(b1);
        if (st.loggedMin > 0) {
          line1.appendChild(document.createTextNode(' ' + st.loggedMin + ' 分钟'));
        }
        if (inKcal > 0) {
          line1.appendChild(document.createTextNode(' · 消耗 '));
          var b2 = document.createElement('b');
          b2.textContent = Math.round(inKcal) + ' kcal';
          line1.appendChild(b2);
        }
      } else {
        var first = st.plan.items[0];
        line1.className = 'mv-none';
        line1.appendChild(document.createTextNode('今天还没动 · 建议先来：'));
        var b3 = document.createElement('b');
        b3.textContent = first ? first.name + '（' + first.min + ' 分钟）' : '开合跳 5 分钟';
        line1.appendChild(b3);
        if (first) {
          line1.appendChild(document.createTextNode(' 约 ' + first.kcal + ' kcal'));
        }
      }
      moveEl.appendChild(line1);
    }
  }

  var EX_TIPS = [
    '先练大肌群再练小肌群：跑步机热身 → 健腹轮 → 拉伸，顺序对了事半功倍',
    '同一动作做 3 组、每组做到力竭前停，比一直磨洋工更涨肌肉',
    '健腹轮别贪多：跪姿 8–10 个 ×3 组，比硬撑 20 个更安全也更有效',
    '跑步机想多燃脂：试试快慢交替，心率忽高忽低最掉脂',
    '练完别马上坐：慢走 3 分钟 + 拉伸，头晕和酸痛都少',
    '睡眠够才掉秤：23 点前睡，生长激素帮你在梦里悄悄燃脂',
    '记录比强度重要：哪怕只练 10 分钟，记下来就是胜利'
  ];

  function renderExTips(items, today) {
    var box = document.getElementById('ex-tips');
    if (!box) { return; }
    var st = todaySportState(items, today);
    clearEl(box);
    var tips = [];
    function add(icon, text, cls) { tips.push({ icon: icon, text: text, cls: cls || '' }); }

    if (st.mode === 'preview') {
      add('🏃', '今天还没动，先来 5 分钟开合跳热个身，动起来就好', 'warn');
    } else {
      var done = 0;
      for (var c = 0; c < EX_CAT.length; c++) { if (st.doneCat[EX_CAT[c]]) { done++; } }
      if (done < 3) {
        if (!st.doneCat['力量']) {
          add('🎯', '还差力量训练——来几组健腹轮跪姿，核心紧了腰也细了', 'warn');
        } else if (!st.doneCat['拉伸']) {
          add('🧘', '练完别忘了拉伸，5 分钟就能少酸一整天', 'warn');
        } else {
          add('💪', '已经动起来了，再把计划补满就更完美', 'warn');
        }
      } else {
        add('🎉', '有氧、力量、拉伸全练到了，今天的运动质量很高', 'good');
      }
      if (st.loggedKcal > 0) {
        add('🔥', '今天已消耗 ' + Math.round(st.loggedKcal) + ' kcal，相当于白赚了一碗米饭', 'good');
      }
    }
    var s = daySeed();
    add('💡', EX_TIPS[s % EX_TIPS.length]);

    for (var i = 0; i < tips.length && i < 3; i++) {
      var row = document.createElement('div');
      row.className = 'tip-item ' + tips[i].cls;
      var ic = document.createElement('span');
      ic.className = 'ti-ic';
      ic.textContent = tips[i].icon;
      var tx = document.createElement('span');
      tx.textContent = tips[i].text;
      row.appendChild(ic);
      row.appendChild(tx);
      box.appendChild(row);
    }
  }

  function handleExLog(idx) {
    var e = sportPlanData[idx];
    if (!e) { return; }
    switchTab('sport');
    var typeSel = document.querySelector('#form-sport [name="f-ex-type"]');
    if (typeSel) { typeSel.value = optionIdByText('运动类型', e.sel); }
    var itemEl = document.querySelector('#form-sport [name="f-ex-item"]');
    if (itemEl) { itemEl.value = e.name; }
    var minEl = document.querySelector('#form-sport [name="f-ex-min"]');
    if (minEl) { minEl.value = String(e.min); }
    var kcalEl = document.querySelector('#form-sport [name="f-ex-kcal"]');
    if (kcalEl) { kcalEl.value = String(e.kcal); }
    var noteEl = document.querySelector('#form-sport [name="f-note"]');
    if (noteEl) { noteEl.value = e.tip; }
    saveDraftSoon('form-sport');
    var form = document.getElementById('form-sport');
    if (form && form.scrollIntoView) {
      setTimeout(function () { form.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
    }
    toast('已填好「' + e.name + '」，确认一下就能打卡');
    focusField('form-sport', 'f-ex-min');
  }

  function bindSportUI() {
    document.addEventListener('click', function (e) {
      var node = e.target;
      var guard = 0;
      while (node && node !== document && guard < 10) {
        if (node.getAttribute) {
          var lk = node.getAttribute('data-ex-log');
          if (lk !== null && lk !== '') {
            handleExLog(parseInt(lk, 10));
            return;
          }
        }
        node = node.parentNode;
        guard++;
      }
    });
  }

function renderAll() {
    var items = normalizeRows();
    var today = todayStr();
    computePeriod(items, today);
    renderGreet();
    renderStats(items, today);
    renderFoodHint(items, today);
    renderMealBoard(items, today);
    renderTodayRecipes(items, today);
    renderNutrition(items, today);
    renderEnergyBalance(items, today);
    renderSmartTips(items, today);
    renderExBoard(items, today);
    renderExPlate(items, today);
    renderExPlan(items, today);
    renderExBurn(items, today);
    renderExTips(items, today);
    renderLists(items, today);
    renderJournal(items, today);
    renderTodayAchv(items, today);
    renderStarWall(items, today);
    renderCalendar(items);
    drawCharts(items);
    renderPlan(items);
    if (window.__renderExtras) {
      window.__renderExtras(items, today);
    }
  }

  function renderGreet() {
    var d = new Date();
    var h = d.getHours();
    var greet = '晚上好呀';
    if (h < 6) {
      greet = '夜深了，早点休息呀';
    } else if (h < 11) {
      greet = '早上好呀';
    } else if (h < 14) {
      greet = '中午好呀';
    } else if (h < 18) {
      greet = '下午好呀';
    }
    var name = PROFILE && PROFILE.name ? String(PROFILE.name) : '丫宝';
    var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    var el = document.getElementById('greet-line');
    if (el) {
      el.textContent = greet + '，' + name + ' · ' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + wk;
    }
    var enc = document.getElementById('encourage-line');
    if (enc) {
      enc.textContent = ENCOURAGE[d.getDate() % ENCOURAGE.length];
    }
  }

  function renderStats(items, today) {
    var dateMap = {};
    var bodyItems = [];
    var dietItems = [];
    var sportItems = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.date) {
        dateMap[it.date] = true;
      }
      if (it.type === 'body') {
        bodyItems.push(it);
      } else if (it.type === 'diet') {
        dietItems.push(it);
      } else if (it.type === 'sport') {
        sportItems.push(it);
      }
    }
    var streakN = calcStreak(dateMap);
    setStat('streak', String(streakN));
    var streakBox = document.querySelector('.streak');
    if (streakBox) {
      streakBox.classList.toggle('zero', streakN === 0);
    }

    var todayDiet = [];
    var todaySport = [];
    for (var a = 0; a < dietItems.length; a++) {
      if (dietItems[a].date === today) {
        todayDiet.push(dietItems[a]);
      }
    }
    for (var b = 0; b < sportItems.length; b++) {
      if (sportItems[b].date === today) {
        todaySport.push(sportItems[b]);
      }
    }
    var inKcal = sumField(todayDiet, '摄入热量');
    var burnKcal = sumField(todaySport, '消耗热量');
    var nowW = currentWeight(items);
    var budget = budgetInfo(nowW);

    setStat('k-in', fmtInt(inKcal));
    setStat('k-burn', fmtInt(burnKcal));
    setStat('d-in', fmtInt(inKcal));
    var proteinIn = sumField(todayDiet, '蛋白质');
    var pTarget = 85;
    if (nowW !== null && nowW > 0) {
      pTarget = Math.round(nowW * 1.4);
    }
    setStat('p-in', fmt1(proteinIn));
    setStat('p-target', String(pTarget));
    setStat('d-protein', fmt1(proteinIn));
    var proBar = document.getElementById('pro-bar');
    if (proBar) {
      var ppct = pTarget > 0 ? (proteinIn / pTarget) * 100 : 0;
      if (ppct > 100) {
        ppct = 100;
      }
      if (ppct < 0) {
        ppct = 0;
      }
      proBar.style.width = ppct + '%';
    }

    var deficitEl = document.querySelector('[data-stat="k-deficit"]');
    var deficitNote = document.getElementById('k-deficit-note');
    if (budget) {
      var left = Math.round(budget.suggest + burnKcal - inKcal);
      var deficit = Math.round(budget.tdee + burnKcal - inKcal);
      setStat('k-left', fmtInt(left));
      setStat('k-budget', fmtInt(budget.suggest));
      setStat('d-left', fmtInt(left));
      setStat('k-deficit', fmtInt(deficit));
      if (deficitEl) {
        var cls = 'd-low';
        if (deficit < 0) {
          cls = 'd-over';
        } else if (deficit > 600) {
          cls = 'd-high';
        } else if (deficit >= 200) {
          cls = 'd-good';
        }
        deficitEl.className = cls;
      }
      if (deficitNote) {
        if (deficit < 0) {
          deficitNote.textContent = '· 今天吃超了一点，没关系，明天继续就好';
        } else if (deficit > 600) {
          deficitNote.textContent = '· 缺口有点大，记得吃够基础营养呀';
        } else if (deficit >= 200) {
          deficitNote.textContent = '· 这个节奏刚刚好，稳住';
        } else {
          deficitNote.textContent = '· 有缺口就是在瘦的路上';
        }
      }
      var bar = document.getElementById('in-bar');
      if (bar) {
        var pct = budget.suggest > 0 ? (inKcal / budget.suggest) * 100 : 0;
        if (pct > 100) {
          pct = 100;
        }
        if (pct < 0) {
          pct = 0;
        }
        bar.style.width = pct + '%';
      }
      var tag = document.getElementById('budget-tag');
      if (tag) {
        tag.textContent = '按你的资料算的';
      }
    } else {
      setStat('k-left', '--');
      setStat('k-budget', '--');
      setStat('d-left', '--');
      setStat('k-deficit', '--');
      if (deficitEl) {
        deficitEl.className = 'd-low';
      }
      if (deficitNote) {
        deficitNote.textContent = '· 设置资料后自动计算';
      }
    }
    var hint = document.getElementById('no-profile-hint');
    if (hint) {
      hint.hidden = profileReady();
    }

    var wLatest = latestValue(bodyItems, 'body', '体重');
    if (nowW !== null) {
      setStat('w-now', fmt1(nowW));
      setStat('t-now', fmt1(nowW));
    } else {
      setStat('w-now', '--');
      setStat('t-now', '--');
    }
    var diffText = '--';
    if (nowW !== null && PROFILE && PROFILE.goal > 0) {
      var diff = Math.round((nowW - PROFILE.goal) * 10) / 10;
      diffText = diff <= 0 ? '已达成' : fmt1(diff) + ' kg';
    }
    setStat('w-diff', diffText);
    setStat('t-diff', diffText);

    var bmiText = '--';
    var bmiTag = '';
    if (nowW !== null && PROFILE && PROFILE.height > 0) {
      var hm = PROFILE.height / 100;
      var bmiVal = nowW / (hm * hm);
      bmiText = fmt1(bmiVal);
      if (bmiVal < 18.5) {
        bmiTag = '偏瘦';
      } else if (bmiVal < 24) {
        bmiTag = '正常';
      } else if (bmiVal < 28) {
        bmiTag = '超重';
      } else {
        bmiTag = '肥胖';
      }
    }
    setStat('w-bmi', bmiText);
    var bmiTagEl = document.getElementById('w-bmi-tag');
    if (bmiTagEl) {
      bmiTagEl.textContent = bmiTag;
    }

    if (wLatest) {
      setStat('w-last-date', shortDate(wLatest.date));
    } else {
      setStat('w-last-date', '--');
    }
    var latestSleep = null;
    var latestEnergy = '';
    var sleepSum = 0;
    var sleepCount = 0;
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    var cutoffStr = cutoff.getFullYear() + '-' + pad2(cutoff.getMonth() + 1) + '-' + pad2(cutoff.getDate());
    for (var rp = 0; rp < bodyItems.length; rp++) {
      var rb = bodyItems[rp];
      if (latestSleep === null && typeof rb.raw['睡眠'] === 'number') {
        latestSleep = rb.raw['睡眠'];
      }
      if (!latestEnergy && rb.raw['精力']) {
        latestEnergy = selectText('精力', rb.raw['精力']);
      }
      if (rb.date >= cutoffStr && typeof rb.raw['睡眠'] === 'number') {
        sleepSum += rb.raw['睡眠'];
        sleepCount++;
      }
    }
    setStat('r-sleep', latestSleep === null ? '--' : fmt1(latestSleep));
    setStat('r-energy', latestEnergy || '--');
    setStat('r-sleep-avg', sleepCount ? fmt1(sleepSum / sleepCount) : '--');

    var changeText = '--';
    if (bodyItems.length) {
      var newest = null;
      var oldest = null;
      for (var p = 0; p < bodyItems.length; p++) {
        var wp = bodyItems[p].raw['体重'];
        if (typeof wp !== 'number') {
          continue;
        }
        if (newest === null) {
          newest = wp;
        }
        oldest = wp;
      }
      if (newest !== null && oldest !== null) {
        var ch = Math.round((newest - oldest) * 10) / 10;
        changeText = (ch > 0 ? '+' : '') + fmt1(ch);
      }
    }
    setStat('t-change', changeText);

    var waistLatest = latestValue(bodyItems, 'body', '腰围');
    setStat('t-waist', waistLatest ? fmt1(waistLatest.value) : '--');

    var weekMap = weekDateMap();
    var weekDays = {};
    var weekMin = 0;
    var weekKcal = 0;
    for (var s = 0; s < sportItems.length; s++) {
      var si = sportItems[s];
      if (!weekMap[si.date]) {
        continue;
      }
      weekDays[si.date] = true;
      if (typeof si.raw['运动时长'] === 'number') {
        weekMin += si.raw['运动时长'];
      }
      if (typeof si.raw['消耗热量'] === 'number') {
        weekKcal += si.raw['消耗热量'];
      }
    }
    var weekCount = 0;
    for (var k in weekDays) {
      if (weekDays[k]) {
        weekCount++;
      }
    }
    setStat('s-week-count', String(weekCount));
    setStat('s-week-min', fmtInt(weekMin));
    setStat('s-week-kcal', fmtInt(weekKcal));
    setStat('plan-days', String(weekCount));
    var planBar = document.getElementById('plan-bar');
    if (planBar) {
      var ppct = (weekCount / WEEK_GOAL) * 100;
      if (ppct > 100) {
        ppct = 100;
      }
      planBar.style.width = ppct + '%';
    }
  }

  function fillRow(frag, item, hideDate) {
    var r = item.raw;
    var badge = frag.querySelector('[data-field="记录类型"]');
    if (badge) {
      if (item.type === 'diet') {
        badge.textContent = '饮食';
        badge.className = 'rec-badge badge-diet';
      } else if (item.type === 'sport') {
        badge.textContent = '运动';
        badge.className = 'rec-badge badge-sport';
      } else {
        badge.textContent = '身体数据';
        badge.className = 'rec-badge badge-body';
      }
    }
    var dateEl = frag.querySelector('[data-field="日期"]');
    if (dateEl) {
      dateEl.textContent = hideDate ? '' : shortDate(item.date);
      toggleEl(dateEl, !!item.date && !hideDate);
    }
    if (item.type === 'diet') {
      var mealTxt = selectText('餐次', r['餐次']) || '一餐';
      var mealBadge = frag.querySelector('[data-field="餐次"]');
      if (mealBadge) {
        mealBadge.textContent = mealTxt.charAt(0);
        mealBadge.className = 'meal-badge ' + (MEAL_BADGE_CLS[mealTxt] || 'mb-other');
      }
      setText(frag, '[data-field="饮食内容"]', r['饮食内容'] ? String(r['饮食内容']) : '');
      var kcalEl = frag.querySelector('[data-field="摄入热量"]');
      if (kcalEl) {
        if (typeof r['摄入热量'] === 'number') {
          kcalEl.textContent = fmtInt(r['摄入热量']) + ' kcal';
          toggleEl(kcalEl, true);
        } else {
          toggleEl(kcalEl, false);
        }
      }
      var pRowEl = frag.querySelector('[data-field="蛋白质"]');
      if (pRowEl) {
        if (typeof r['蛋白质'] === 'number') {
          pRowEl.textContent = '蛋白 ' + fmt1(r['蛋白质']) + 'g';
          toggleEl(pRowEl, true);
        } else {
          toggleEl(pRowEl, false);
        }
      }
    } else if (item.type === 'sport') {
      setText(frag, '[data-field="运动类型"]', selectText('运动类型', r['运动类型']) || '运动');
      setText(frag, '[data-field="运动项目"]', r['运动项目'] ? String(r['运动项目']) : '');
      var minEl = frag.querySelector('[data-field="运动时长"]');
      if (minEl) {
        if (typeof r['运动时长'] === 'number') {
          minEl.textContent = fmtInt(r['运动时长']) + ' 分钟';
          toggleEl(minEl, true);
        } else {
          toggleEl(minEl, false);
        }
      }
      var burnEl = frag.querySelector('[data-field="消耗热量"]');
      if (burnEl) {
        if (typeof r['消耗热量'] === 'number') {
          burnEl.textContent = '消耗 ' + fmtInt(r['消耗热量']) + ' kcal';
          toggleEl(burnEl, true);
        } else {
          toggleEl(burnEl, false);
        }
      }
    } else {
      var wEl = frag.querySelector('[data-field="体重"]');
      if (wEl) {
        wEl.textContent = typeof r['体重'] === 'number' ? fmt1(r['体重']) + ' kg' : '仅打卡';
      }
      var waistEl = frag.querySelector('[data-field="腰围"]');
      if (waistEl) {
        if (typeof r['腰围'] === 'number') {
          waistEl.textContent = '腰围 ' + fmt1(r['腰围']) + ' cm';
          toggleEl(waistEl, true);
        } else {
          toggleEl(waistEl, false);
        }
      }
      var sleepRowEl = frag.querySelector('[data-field="睡眠"]');
      if (sleepRowEl) {
        if (typeof r['睡眠'] === 'number') {
          sleepRowEl.textContent = '睡眠 ' + fmt1(r['睡眠']) + 'h';
          toggleEl(sleepRowEl, true);
        } else {
          toggleEl(sleepRowEl, false);
        }
      }
    }
    var achvTxt = achvTexts(r['小成就']).join(' · ');
    setText(frag, '[data-field="小成就"]', achvTxt);
    toggleEl(frag.querySelector('.r-achv'), !!achvTxt);
    var note = r['备注'] ? String(r['备注']) : '';
    setText(frag, '[data-field="备注"]', note);
    toggleEl(frag.querySelector('.r-note'), !!note);
  }

  function renderList(containerId, list, hideDate) {
    var box = document.getElementById(containerId);
    if (!box) {
      return;
    }
    clearEl(box);
    if (!list.length) {
      box.appendChild(emptyNode(containerId === 'diet-list' ? '还没有饮食记录，第一餐吃完来记一笔吧' : (containerId === 'today-list' ? '今天还没有记录，记一笔试试吧' : '暂无记录，慢慢就有了')));
      return;
    }
    var limit = LIMITS[containerId] || 15;
    var frag = document.createDocumentFragment();
    var prevDay = '';
    for (var i = 0; i < list.length && i < limit; i++) {
      var item = list[i];
      if (containerId === 'diet-list' && item.date && item.date !== prevDay) {
        prevDay = item.date;
        var dayEl = document.createElement('p');
        dayEl.className = 'rec-day';
        dayEl.textContent = dayLabel(item.date);
        frag.appendChild(dayEl);
      }
      var tplId = item.type === 'diet' ? 'tpl-row-diet' : (item.type === 'sport' ? 'tpl-row-sport' : 'tpl-row-body');
      var tpl = document.getElementById(tplId);
      if (!tpl) {
        continue;
      }
      var clone = document.importNode(tpl.content, true);
      var root = clone.firstElementChild;
      if (!root) {
        continue;
      }
      root.setAttribute('data-id', item.id);
      fillRow(clone, item, hideDate);
      frag.appendChild(clone);
    }
    box.appendChild(frag);
    var moreBtn = document.querySelector('[data-more="' + containerId + '"]');
    if (moreBtn) {
      if (list.length > limit) {
        moreBtn.style.display = '';
        moreBtn.textContent = '显示更早的记录（还有 ' + (list.length - limit) + ' 条）';
      } else {
        moreBtn.style.display = 'none';
      }
    }
  }

  var recFilter = { q: '', range: 'all' };
  var recLastArgs = null;

  function recCutoff(days) {
    var d = new Date();
    d.setDate(d.getDate() - days);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function recMatch(it) {
    if (recFilter.range === 'today' && it.date !== todayStr()) { return false; }
    if (recFilter.range === '7' && (!it.date || it.date < recCutoff(6))) { return false; }
    if (recFilter.q) {
      var raw = it.raw || {};
      var hay = [raw['饮食内容'], raw['运动项目'], raw['备注'], raw['心里话']].join(' ').toLowerCase();
      if (hay.indexOf(recFilter.q) === -1) { return false; }
    }
    return true;
  }

  function renderLists(items, today) {
    recLastArgs = { items: items, today: today };
    var todayItems = [];
    var bodyItems = [];
    var dietItems = [];
    var sportItems = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.date === today) {
        todayItems.push(it);
      }
      if (it.type === 'body') {
        bodyItems.push(it);
      } else if (it.type === 'diet') {
        dietItems.push(it);
      } else if (it.type === 'sport') {
        sportItems.push(it);
      }
    }
    renderList('today-list', todayItems, true);
    renderList('body-list', bodyItems.filter(recMatch), false);
    renderList('diet-list', dietItems.filter(recMatch), false);
    renderList('sport-list', sportItems.filter(recMatch), false);
  }

  function renderTodayAchv(items, today) {
    todayBodyId = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type === 'body' && it.date === today) {
        todayBodyId = it.id;
        break;
      }
    }
    renderTodayHabitChips();
  }

  function todayHabitStats() {
    var done = [];
    var undone = [];
    for (var i = 0; i < CARE_CHECKIN.length; i++) {
      var opt = optionByText('今日关照', CARE_CHECKIN[i]);
      if (!opt) {
        continue;
      }
      if (careSel.indexOf(opt.id) > -1) {
        done.push(opt);
      } else {
        undone.push(opt);
      }
    }
    return { done: done, undone: undone, total: CARE_CHECKIN.length };
  }

  function bumpProgress() {
    var pEl = document.getElementById('achv-progress');
    if (!pEl) {
      return;
    }
    pEl.classList.remove('bump');
    void pEl.offsetWidth;
    pEl.classList.add('bump');
  }

  function burstSparks(btn) {
    var r = btn.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var marks = ['\u2728', '\u2B50', '\u2734', '\u2728'];
    for (var i = 0; i < 5; i++) {
      (function (k) {
        var s = document.createElement('span');
        s.className = 'achv-spark';
        s.textContent = marks[k % marks.length];
        var ang = (Math.PI / 180) * (-90 + (k - 2) * 33 + (Math.random() * 12 - 6));
        var dist = 24 + Math.random() * 22;
        s.style.left = cx + 'px';
        s.style.top = cy + 'px';
        s.style.setProperty('--dx', (Math.cos(ang) * dist).toFixed(1) + 'px');
        s.style.setProperty('--dy', (Math.sin(ang) * dist - 7).toFixed(1) + 'px');
        s.style.setProperty('--rot', (Math.random() * 120 - 60).toFixed(0) + 'deg');
        s.style.animationDelay = (k * 22) + 'ms';
        document.body.appendChild(s);
        setTimeout(function () {
          if (s.parentNode) {
            s.parentNode.removeChild(s);
          }
        }, 820);
      })(i);
    }
    try {
      if (navigator.vibrate) {
        navigator.vibrate(12);
      }
    } catch (e) { /* 不支持就算了 */ }
  }

  function confetti() {
    var colors = ['#F2AFC2', '#CE7C9E', '#92A8D1', '#7D90CC', '#F6CBD8', '#A9BEE8'];
    for (var i = 0; i < 26; i++) {
      (function (k) {
        var p = document.createElement('i');
        p.className = 'confetti-piece';
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.background = colors[k % colors.length];
        p.style.animationDelay = (Math.random() * 240) + 'ms';
        p.style.animationDuration = (1150 + Math.random() * 620) + 'ms';
        document.body.appendChild(p);
        setTimeout(function () {
          if (p.parentNode) {
            p.parentNode.removeChild(p);
          }
        }, 2100);
      })(i);
    }
  }

  function celebrateAchv(btn, allDone) {
    burstSparks(btn);
    bumpProgress();
    if (allDone) {
      setTimeout(confetti, 180);
    }
  }

  function renderTodayHabitChips() {
    var list = SCHEMA_OPTIONS['今日关照'] || [];
    var sum = document.getElementById('achv-sum-line');
    if (!list.length) {
      if (sum) {
        sum.textContent = '正在读取你的记录…';
      }
      return;
    }
    var st = todayHabitStats();

    var prog = document.getElementById('achv-progress');
    if (prog) {
      prog.textContent = st.done.length + ' / ' + st.total;
    }
    var ring = document.getElementById('achv-ring-fg');
    if (ring) {
      var pct = st.total ? (st.done.length / st.total) : 0;
      ring.style.strokeDashoffset = (213.6 * (1 - pct)).toFixed(1);
    }
    var tag = document.getElementById('achv-count-tag');
    if (tag) {
      tag.textContent = st.done.length >= st.total ? '全亮啦' : '还剩 ' + st.undone.length + ' 项';
    }

    var dlist = document.getElementById('achv-done-list');
    if (dlist) {
      clearEl(dlist);
      var show = st.done.slice(0, 4);
      for (var i = 0; i < show.length; i++) {
        var d = document.createElement('span');
        d.className = 'achv-dot';
        var t = document.createElement('i');
        t.textContent = '\u2713';
        d.appendChild(t);
        d.appendChild(document.createTextNode(show[i].text));
        dlist.appendChild(d);
      }
      if (st.done.length > show.length) {
        var more = document.createElement('span');
        more.className = 'achv-dot more';
        more.textContent = '+' + (st.done.length - show.length);
        dlist.appendChild(more);
      }
    }

    if (sum) {
      if (!st.done.length) {
        sum.textContent = '今天还没点亮 · 去手账勾一项吧';
      } else if (st.done.length >= st.total) {
        sum.textContent = '全亮啦 · 今天对自己够温柔';
      } else {
        sum.textContent = '已点亮 ' + st.done.length + ' 项，再勾 ' + st.undone.length + ' 项就满了';
      }
    }

    var banner = document.getElementById('achv-banner');
    if (banner) {
      var wasHidden = banner.hidden;
      banner.hidden = st.done.length < st.total;
      if (wasHidden && !banner.hidden) {
        banner.style.animation = 'none';
        void banner.offsetWidth;
        banner.style.animation = '';
      }
    }
    renderStarWall(ALL, todayStr());
  }

  var WEEK_LABELS = ['\u65E5', '\u4E00', '\u4E8C', '\u4E09', '\u56DB', '\u4E94', '\u516D'];

  function starLevel(n) {
    if (n <= 0) { return ''; }
    if (n >= 8) { return ' lv3'; }
    if (n >= 4) { return ' lv2'; }
    return ' lv1';
  }

  function renderStarWall(items, today) {
    var box = document.getElementById('star-wall');
    if (!box) {
      return;
    }
    var rows = items || ALL;
    clearEl(box);
    var base = new Date();
    var lit = 0;
    for (var d = 6; d >= 0; d--) {
      var dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() - d);
      var ds = dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
      var n = 0;
      if (d === 0) {
        n = todayHabitStats().done.length;   // 今天取实时状态
      } else {
        for (var i = 0; i < rows.length; i++) {
          var it = rows[i];
          if (it.type !== 'body' || it.date !== ds) {
            continue;
          }
          var raw = it.raw['\u4ECA\u65E5\u5173\u7167'];
          var arr = typeof raw === 'string' ? [raw] : (raw || []);
          if (arr.length > n) {
            n = arr.length;
          }
        }
      }
      if (n > 0) {
        lit++;
      }
      var day = document.createElement('div');
      day.className = 'sw-day' + (d === 0 ? ' today' : '');
      var lab = document.createElement('em');
      lab.textContent = WEEK_LABELS[dt.getDay()];
      var cell = document.createElement('div');
      cell.className = 'sw-cell' + starLevel(n);
      cell.textContent = n > 0 ? String(n) : '\u00B7';
      day.appendChild(lab);
      day.appendChild(cell);
      box.appendChild(day);
    }
    var tag = document.getElementById('star-wall-tag');
    if (tag) {
      tag.textContent = lit > 0 ? '7 天里亮了 ' + lit + ' 天' : '最近 7 天';
    }
  }

  function renderCalendar(items) {
    var box = document.getElementById('cal-box');
    if (!box) {
      return;
    }
    clearEl(box);
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth();
    var title = document.getElementById('cal-title');
    if (title) {
      title.textContent = y + ' 年 ' + (m + 1) + ' 月';
    }
    var sportMap = {};
    var bodyMap = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.date) {
        continue;
      }
      if (it.type === 'sport') {
        sportMap[it.date] = true;
      }
      if (it.type === 'body') {
        bodyMap[it.date] = true;
      }
    }
    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var todayKey = todayStr();
    var cells = offset + daysInMonth;
    var totalCells = Math.ceil(cells / 7) * 7;
    for (var c = 0; c < totalCells; c++) {
      var cell = document.createElement('div');
      cell.className = 'cal-cell';
      var dayNum = c - offset + 1;
      if (dayNum >= 1 && dayNum <= daysInMonth) {
        var dateKey = y + '-' + pad2(m + 1) + '-' + pad2(dayNum);
        var inner = document.createElement('span');
        var cls = 'cal-in';
        if (sportMap[dateKey]) {
          cls += ' sport';
        } else if (bodyMap[dateKey]) {
          cls += ' empty-b';
        }
        if (dateKey === todayKey) {
          cls += ' today';
        }
        inner.className = cls;
        inner.textContent = String(dayNum);
        if (bodyMap[dateKey] && sportMap[dateKey]) {
          var dot = document.createElement('i');
          dot.className = 'cal-dot';
          inner.appendChild(dot);
        }
        cell.appendChild(inner);
      }
      box.appendChild(cell);
    }
  }

  function drawMiniChart(canvas, points, opts) {
    if (!canvas || !canvas.getContext) {
      return;
    }
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (points.length < 2) {
      ctx.fillStyle = '#B9B4CE';
      ctx.font = '15px Poppins, "MiSans VF", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.emptyText || '记录两次以上就能看到曲线啦', W / 2, H / 2);
      return;
    }
    var padL = 46;
    var padR = 18;
    var padT = 22;
    var padB = 30;
    var n = points.length;
    var min = points[0].v;
    var max = points[0].v;
    for (var i = 1; i < n; i++) {
      if (points[i].v < min) {
        min = points[i].v;
      }
      if (points[i].v > max) {
        max = points[i].v;
      }
    }
    if (opts.goal && opts.goal > 0) {
      if (opts.goal < min) {
        min = opts.goal;
      }
      if (opts.goal > max) {
        max = opts.goal;
      }
    }
    if (max - min < 1) {
      max = max + 0.8;
      min = min - 0.8;
    }
    var span = max - min;
    min = min - span * 0.12;
    max = max + span * 0.12;
    function xOf(idx) {
      return padL + (idx / (n - 1)) * (W - padL - padR);
    }
    function yOf(v) {
      return padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
    }
    ctx.strokeStyle = '#ECE9F7';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#A3A5BE';
    ctx.font = '12px Poppins, "MiSans VF", sans-serif';
    ctx.textAlign = 'right';
    for (var g = 0; g < 4; g++) {
      var gy = padT + (g / 3) * (H - padT - padB);
      ctx.beginPath();
      ctx.moveTo(padL, gy);
      ctx.lineTo(W - padR, gy);
      ctx.stroke();
      var gv = max - (g / 3) * (max - min);
      ctx.fillText(String(Math.round(gv * 10) / 10), padL - 8, gy + 4);
    }
    if (opts.goal && opts.goal > 0) {
      var goalY = yOf(opts.goal);
      ctx.strokeStyle = '#E8A0B8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(padL, goalY);
      ctx.lineTo(W - padR, goalY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B65E86';
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px Poppins, "MiSans VF", sans-serif';
      ctx.fillText('目标 ' + fmt1(opts.goal), padL + 4, goalY - 6);
    }
    var grad = ctx.createLinearGradient(0, padT, 0, H - padB);
    grad.addColorStop(0, 'rgba(125, 146, 206, 0.16)');
    grad.addColorStop(1, 'rgba(125, 146, 206, 0.01)');
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(points[0].v));
    for (var p = 1; p < n; p++) {
      ctx.lineTo(xOf(p), yOf(points[p].v));
    }
    ctx.lineTo(xOf(n - 1), H - padB);
    ctx.lineTo(xOf(0), H - padB);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = opts.color || '#7D92CE';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (var q = 0; q < n; q++) {
      if (q === 0) {
        ctx.moveTo(xOf(q), yOf(points[q].v));
      } else {
        ctx.lineTo(xOf(q), yOf(points[q].v));
      }
    }
    ctx.stroke();
    if (n <= 40) {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = opts.color || '#7D92CE';
      ctx.lineWidth = 2;
      for (var d = 0; d < n; d++) {
        ctx.beginPath();
        ctx.arc(xOf(d), yOf(points[d].v), 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    var lastX = xOf(n - 1);
    var lastY = yOf(points[n - 1].v);
    ctx.beginPath();
    ctx.fillStyle = opts.color || '#7D92CE';
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = opts.color || '#7D92CE';
    ctx.font = 'bold 14px Poppins, "MiSans VF", sans-serif';
    ctx.textAlign = 'right';
    var labelX = lastX - 6;
    if (labelX < padL + 40) {
      labelX = lastX + 44;
      ctx.textAlign = 'left';
    }
    ctx.fillText(fmt1(points[n - 1].v), labelX, lastY - 10);
    ctx.fillStyle = '#A3A5BE';
    ctx.font = '12px Poppins, "MiSans VF", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(shortDate(points[0].date), padL, H - 8);
    ctx.textAlign = 'right';
    ctx.fillText(shortDate(points[n - 1].date), W - padR, H - 8);
  }

  function drawCharts(items) {
    var weightPts = [];
    var waistPts = [];
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      if (it.type !== 'body') {
        continue;
      }
      if (typeof it.raw['体重'] === 'number') {
        weightPts.push({ date: it.date, v: it.raw['体重'] });
      }
      if (typeof it.raw['腰围'] === 'number') {
        waistPts.push({ date: it.date, v: it.raw['腰围'] });
      }
    }
    var wPoints = [];
    var startW = weightPts.length > 30 ? weightPts.length - 30 : 0;
    for (var a = startW; a < weightPts.length; a++) {
      wPoints.push(weightPts[a]);
    }
    drawMiniChart(document.getElementById('chart-weight'), wPoints, {
      goal: PROFILE && PROFILE.goal > 0 ? PROFILE.goal : 0,
      color: '#7D92CE',
      emptyText: '记录两次体重就能看到曲线啦'
    });
    var waistPoints = [];
    var startX = waistPts.length > 30 ? waistPts.length - 30 : 0;
    for (var b = startX; b < waistPts.length; b++) {
      waistPoints.push(waistPts[b]);
    }
    drawMiniChart(document.getElementById('chart-waist'), waistPoints, {
      goal: 0,
      color: '#CE7C9E',
      emptyText: '记录两次腰围就能看到变化啦'
    });
  }

  function renderPlan(items) {
    var wd = (new Date().getDay() + 6) % 7;
    var days = document.querySelectorAll('.plan-day');
    for (var i = 0; i < days.length; i++) {
      var el = days[i];
      var v = el.getAttribute('data-weekday');
      if (Number(v) === wd) {
        if (el.className.indexOf('today') === -1) {
          el.className = el.className + ' today';
        }
      } else {
        el.className = el.className.split(' today').join('');
      }
    }
    foldWeekPlan();
  }


  /* 手机端：一周计划默认只展开「今天」，其余 6 天折叠（幂等，可重复调用） */
  var FOLD_TITLES = [
    '今天要盯紧的 4 件事', '哥哥的暖心小提示', '丫宝的计划簿',
    '本周小目标', '丫宝的一周计划', '每餐这样吃'
  ];

  function buildFold(key, label, sub, els, wasOpen) {
    var fold = document.createElement('details');
    fold.className = 'j-fold';
    fold.setAttribute('data-fold-key', key);
    var sum = document.createElement('summary');
    sum.className = 'j-fold-sum';
    var b = document.createElement('b');
    b.textContent = label;
    var e = document.createElement('em');
    e.textContent = sub;
    sum.appendChild(b);
    sum.appendChild(e);
    fold.appendChild(sum);
    var body = document.createElement('div');
    body.className = 'j-fold-body';
    fold.appendChild(body);
    for (var i = 0; i < els.length; i++) {
      els[i].classList.add('j-fold-card');
      body.appendChild(els[i]);
    }
    if (wasOpen) {
      fold.open = true;
    }
    return fold;
  }

  function foldJournalExtras() {
    var view = document.getElementById('view-journal');
    if (!view) {
      return;
    }
    // 幂等：先拆旧壳，把卡片救回来，并记住展开状态
    var olds = view.querySelectorAll('.j-fold');
    var openMap = {};
    for (var q = 0; q < olds.length; q++) {
      openMap[olds[q].getAttribute('data-fold-key') || 'x'] = olds[q].open;
      var inner = olds[q].querySelectorAll('.j-fold-card');
      for (var k = 0; k < inner.length; k++) {
        view.insertBefore(inner[k], olds[q]);
        inner[k].classList.remove('j-fold-card');
      }
      olds[q].parentNode.removeChild(olds[q]);
    }

    var footer = view.querySelector('.j-footer');

    var menu = view.querySelector('[data-fold="menu"]');
    if (menu) {
      view.insertBefore(
        buildFold('menu', '今天的食谱', '四餐搭配 · 备用选项 · 解馋清单', [menu], openMap['menu'] === true),
        footer
      );
    }

    var picked = [];
    var kids = view.children;
    for (var i = 0; i < kids.length; i++) {
      var h2 = kids[i].querySelector('h2');
      if (!h2) {
        continue;
      }
      if (FOLD_TITLES.indexOf((h2.textContent || '').trim()) > -1) {
        picked.push(kids[i]);
      }
    }
    if (picked.length) {
      view.insertBefore(
        buildFold('more', '展开更多', '盯紧清单 · 暖心提示 · 周计划 · 吃饭小抄（' + picked.length + ' 张）', picked, openMap['more'] === true),
        footer
      );
    }
  }

  function foldWeekPlan() {
    var days = document.querySelectorAll('.plan-day');
    if (!days.length) {
      return;
    }
    var host = days[0].parentNode;
    var i;
    // 先拆掉旧的折叠壳，把里面的天救回来，保证可重复调用
    var olds = host.querySelectorAll('.week-fold');
    for (i = 0; i < olds.length; i++) {
      var oldFold = olds[i];
      var inner = oldFold.querySelectorAll('.plan-day');
      for (var m = 0; m < inner.length; m++) {
        host.appendChild(inner[m]);
      }
      oldFold.parentNode.removeChild(oldFold);
    }
    // 重新收集（DOM 顺序可能被打乱，按 data-weekday 重排）
    days = host.querySelectorAll('.plan-day');
    var list = [];
    var todayEl = null;
    for (i = 0; i < days.length; i++) {
      if (days[i].className.indexOf('today') > -1) {
        todayEl = days[i];
      } else {
        list.push(days[i]);
      }
    }
    if (!todayEl || list.length === 0) {
      return;
    }
    list.sort(function (a, b) {
      return Number(a.getAttribute('data-weekday')) - Number(b.getAttribute('data-weekday'));
    });
    var fold = document.createElement('details');
    fold.className = 'week-fold';
    var sum = document.createElement('summary');
    sum.textContent = '看完整周计划（另外 ' + list.length + ' 天）';
    fold.appendChild(sum);
    for (i = 0; i < list.length; i++) {
      fold.appendChild(list[i]);
    }
    if (todayEl.nextSibling) {
      host.insertBefore(fold, todayEl.nextSibling);
    } else {
      host.appendChild(fold);
    }
  }

  /* 旧版小食堂食材分组折叠（小食堂已下线，保留函数防止误引用报错） */
  function foldFoodGroups(box) {
    if (!box) {
      return;
    }
    var groups = box.querySelectorAll('.food-group');
    if (groups.length <= 3) {
      return;
    }
    var fold = document.createElement('details');
    fold.className = 'food-fold';
    var sum = document.createElement('summary');
    sum.textContent = '展开更多食材（还有 ' + (groups.length - 2) + ' 类）';
    fold.appendChild(sum);
    for (var i = 2; i < groups.length; i++) {
      fold.appendChild(groups[i]);
    }
    box.appendChild(fold);
  }

  /* ---------------- 表单与草稿 ---------------- */

  function setDateDefaults() {
    var els = document.querySelectorAll('input[name="f-date"]');
    for (var i = 0; i < els.length; i++) {
      els[i].value = todayStr();
    }
  }

  function saveDraft(formId) {
    var form = document.getElementById(formId);
    if (!form) {
      return;
    }
    try {
      var inputs = form.querySelectorAll('input, select');
      var data = {};
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        if (!el.name) {
          continue;
        }
        data[el.name] = el.value;
      }
      localStorage.setItem(DRAFT_PREFIX + formId, JSON.stringify(data));
    } catch (err) {
      return;
    }
  }

  function saveDraftSoon(formId) {
    if (draftTimers[formId]) {
      clearTimeout(draftTimers[formId]);
    }
    draftTimers[formId] = setTimeout(function () {
      draftTimers[formId] = null;
      saveDraft(formId);
    }, 300);
  }

  function clearDraft(formId) {
    try {
      localStorage.removeItem(DRAFT_PREFIX + formId);
    } catch (err) {
      return;
    }
  }

  function restoreDrafts() {
    var ids = ['form-body', 'form-diet', 'form-sport'];
    for (var k = 0; k < ids.length; k++) {
      try {
        var raw = localStorage.getItem(DRAFT_PREFIX + ids[k]);
        if (!raw) {
          continue;
        }
        var data = JSON.parse(raw);
        var form = document.getElementById(ids[k]);
        if (!form) {
          continue;
        }
        var inputs = form.querySelectorAll('input, select');
        for (var i = 0; i < inputs.length; i++) {
          var el = inputs[i];
          if (el.name && data[el.name] !== undefined && el.name !== 'f-date') {
            el.value = data[el.name];
          }
        }
      } catch (err) {
        continue;
      }
    }
  }

  function renderSelectOptions() {
    var map = [
      ['form-diet', 'f-meal', '餐次'],
      ['form-sport', 'f-ex-type', '运动类型'],
      ['form-body', 'f-energy', '精力']
    ];
    for (var i = 0; i < map.length; i++) {
      var sel = document.querySelector('#' + map[i][0] + ' [name="' + map[i][1] + '"]');
      if (!sel) {
        continue;
      }
      while (sel.options.length > 1) {
        sel.remove(1);
      }
      var list = SCHEMA_OPTIONS[map[i][2]] || [];
      for (var j = 0; j < list.length; j++) {
        var opt = document.createElement('option');
        opt.value = list[j].id;
        opt.textContent = list[j].text;
        sel.appendChild(opt);
      }
    }
  }

  function renderAchvChips() {
    var box = document.getElementById('achv-chips');
    if (!box) {
      return;
    }
    clearEl(box);
    var list = SCHEMA_OPTIONS['小成就'] || [];
    if (!list.length) {
      box.appendChild(emptyNode('暂时加载不出来，稍后再试'));
      return;
    }
    for (var i = 0; i < list.length; i++) {
      var opt = list[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.setAttribute('data-oid', opt.id);
      btn.textContent = opt.text;
      for (var j = 0; j < achvSel.length; j++) {
        if (achvSel[j] === opt.id) {
          btn.className = 'chip on';
        }
      }
      box.appendChild(btn);
    }
  }

  function handleFormSubmit(formId, builder) {
    var form = document.getElementById(formId);
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!db) {
        toast('登录之后才能保存记录哦');
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      var properties = builder(formId);
      if (!properties) {
        return;
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = '保存中…';
      }
      db.addRecord({ databaseId: DATABASE_ID, properties: properties }).then(function () {
        clearDraft(formId);
        form.reset();
        setDateDefaults();
        if (formId === 'form-body') {
          achvSel = [];
          renderAchvChips();
        }
        if (formId === 'form-diet') {
          syncMealPick();
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = formId === 'form-diet' ? '记下这一餐' : (formId === 'form-sport' ? '完成打卡' : '保存这条记录');
        }
        toast('记录好啦，继续保持');
        scheduleRefresh();
      }).catch(function (err) {
        console.error('[database] 保存失败:', err);
        if (btn) {
          btn.disabled = false;
          btn.textContent = formId === 'form-diet' ? '记下这一餐' : (formId === 'form-sport' ? '完成打卡' : '保存这条记录');
        }
        toast(dbErrMsg(err));
      });
    });
    form.addEventListener('input', function () {
      saveDraftSoon(formId);
    });
    form.addEventListener('change', function () {
      saveDraftSoon(formId);
    });
  }

  function buildBodyProps() {
    var weight = numOrNull(inputVal('form-body', 'f-weight'));
    if (weight === null) {
      toast('先填上体重再保存哦');
      return null;
    }
    var properties = {};
    properties['记录类型'] = { select: optionIdByText('记录类型', '身体数据') || '身体数据' };
    properties['日期'] = { date: inputVal('form-body', 'f-date') || todayStr() };
    properties['体重'] = { number: weight };
    var waist = numOrNull(inputVal('form-body', 'f-waist'));
    if (waist !== null) {
      properties['腰围'] = { number: waist };
    }
    var sleepH = numOrNull(inputVal('form-body', 'f-sleep'));
    if (sleepH !== null && sleepH > 0) {
      properties['睡眠'] = { number: sleepH };
    }
    var energy = inputVal('form-body', 'f-energy');
    if (energy) {
      properties['精力'] = { select: energy };
    }
    var period = numOrNull(inputVal('form-body', 'f-period'));
    if (period !== null && period > 0) {
      properties['经期'] = { number: period };
    }
    if (achvSel.length) {
      properties['小成就'] = { multi_select: [].concat(achvSel) };
    }
    var note = inputVal('form-body', 'f-note');
    if (note) {
      properties['备注'] = { text: note };
    }
    return properties;
  }

  function buildDietProps() {
    var meal = inputVal('form-diet', 'f-meal');
    var food = inputVal('form-diet', 'f-food');
    var kcal = numOrNull(inputVal('form-diet', 'f-kcal-in'));
    if (!meal || !food || kcal === null) {
      toast('餐次、吃了什么和热量都要填上哦');
      return null;
    }
    var properties = {};
    properties['记录类型'] = { select: optionIdByText('记录类型', '饮食') || '饮食' };
    properties['日期'] = { date: inputVal('form-diet', 'f-date') || todayStr() };
    properties['餐次'] = { select: meal };
    properties['饮食内容'] = { text: food };
    properties['摄入热量'] = { number: kcal };
    var prot = numOrNull(inputVal('form-diet', 'f-protein'));
    if (prot !== null) {
      properties['蛋白质'] = { number: prot };
    }
    var note = inputVal('form-diet', 'f-note');
    if (note) {
      properties['备注'] = { text: note };
    }
    return properties;
  }

  function buildSportProps() {
    var exType = inputVal('form-sport', 'f-ex-type');
    var minutes = numOrNull(inputVal('form-sport', 'f-ex-min'));
    if (!exType || minutes === null) {
      toast('运动类型和时长要填上哦');
      return null;
    }
    var properties = {};
    properties['记录类型'] = { select: optionIdByText('记录类型', '运动') || '运动' };
    properties['日期'] = { date: inputVal('form-sport', 'f-date') || todayStr() };
    properties['运动类型'] = { select: exType };
    properties['运动时长'] = { number: minutes };
    var item = inputVal('form-sport', 'f-ex-item');
    if (item) {
      properties['运动项目'] = { text: item };
    }
    var burn = numOrNull(inputVal('form-sport', 'f-ex-kcal'));
    if (burn === null) {
      // 留空时按当前体重+运动类型自动估算，保证实际消耗量被完整记录、能参与能量差与统计计算
      var typeSel = document.querySelector('#form-sport [name="f-ex-type"]');
      var typeText = (typeSel && typeSel.selectedIndex >= 0 && typeSel.options[typeSel.selectedIndex])
        ? typeSel.options[typeSel.selectedIndex].text : '';
      var items = normalizeRows();
      var w = currentWeight(items);
      var weightForCalc = w !== null ? w : 55;
      var met = MET[typeText] || 5.0;
      burn = Math.round(met * 3.5 * weightForCalc / 200 * minutes);
    }
    if (burn !== null && burn > 0) {
      properties['消耗热量'] = { number: burn };
    }
    var note = inputVal('form-sport', 'f-note');
    if (note) {
      properties['备注'] = { text: note };
    }
    return properties;
  }

  function estimateBurn() {
    var sel = document.querySelector('#form-sport [name="f-ex-type"]');
    var typeText = '';
    if (sel && sel.selectedIndex >= 0 && sel.options[sel.selectedIndex]) {
      typeText = sel.options[sel.selectedIndex].text;
    }
    var minutes = numOrNull(inputVal('form-sport', 'f-ex-min'));
    if (minutes === null || minutes <= 0) {
      toast('先填运动时长，我才能帮你算');
      return;
    }
    var items = normalizeRows();
    var w = currentWeight(items);
    var weightForCalc = w !== null ? w : 55;
    var met = MET[typeText] || 5.0;
    var kcal = Math.round(met * 3.5 * weightForCalc / 200 * minutes);
    var el = document.querySelector('#form-sport [name="f-ex-kcal"]');
    if (el) {
      el.value = String(kcal);
      saveDraftSoon('form-sport');
    }
    toast('按 ' + fmt1(weightForCalc) + ' kg 估算约 ' + kcal + ' kcal，可以手动调整');
  }

  /* ---------------- 删除记录 ---------------- */

  function handleListClick(e) {
    var node = e.target;
    var delBtn = null;
    var guard = 0;
    while (node && node !== document && guard < 12) {
      if (node.getAttribute && node.getAttribute('data-act') === 'del') {
        delBtn = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!delBtn) {
      return;
    }
    var row = delBtn;
    var id = '';
    guard = 0;
    while (row && row !== document && guard < 12) {
      if (row.getAttribute && row.getAttribute('data-id')) {
        id = row.getAttribute('data-id');
        break;
      }
      row = row.parentNode;
      guard++;
    }
    if (!id) {
      return;
    }
    if (!db) {
      toast('登录之后才能操作哦');
      return;
    }
    var recEl = delBtn.closest ? delBtn.closest('.rec') : row;
    if (window.__queueDelete) {
      window.__queueDelete(id, recEl);
    }
  }

  /* ---------------- 食物快选 ---------------- */

  var FOOD_COUNT_KEY = 'yabao_food_count';
  var FOOD_ALIAS = { '主食': '干饭区', '蛋白质': '涨力气区', '蔬菜': '吃草时间', '水果': '甜甜补给', '饮品': '咕嘟咕嘟', '小零食': '解馋角' };
  var FOOD_COLOR = { '主食': 'fc-rose', '蛋白质': 'fc-blue', '蔬菜': 'fc-lav', '水果': 'fc-lav', '饮品': 'fc-blue', '小零食': 'fc-rose' };

  function foodCounts() {
    try {
      var raw = localStorage.getItem(FOOD_COUNT_KEY);
      if (!raw) {
        return {};
      }
      var obj = JSON.parse(raw);
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (err) {
      return {};
    }
  }

  function bumpFoodCount(name) {
    try {
      var counts = foodCounts();
      counts[name] = (counts[name] || 0) + 1;
      localStorage.setItem(FOOD_COUNT_KEY, JSON.stringify(counts));
    } catch (err) {
      return;
    }
  }

  function preferOrder(arr) {
    var counts = foodCounts();
    var hot = [];
    var rest = [];
    for (var i = 0; i < arr.length; i++) {
      if ((counts[arr[i][0]] || 0) >= 2) {
        hot.push(arr[i]);
      } else {
        rest.push(arr[i]);
      }
    }
    hot.sort(function (a, b) {
      return (counts[b[0]] || 0) - (counts[a[0]] || 0);
    });
    return hot.concat(rest);
  }

  function appendFoodChip(wrap, item, cls) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'food-chip' + (cls ? ' ' + cls : '');
    btn.setAttribute('data-name', item[0]);
    btn.setAttribute('data-kcal', String(item[1]));
    btn.setAttribute('data-prot', String(item[2] || 0));
    btn.textContent = item[0];
    var span = document.createElement('span');
    span.textContent = item[1] + 'k';
    btn.appendChild(span);
    wrap.appendChild(btn);
  }

  function renderFoodChips() {
    var box = document.getElementById('food-box');
    if (!box) {
      return;
    }
    clearEl(box);
    var counts = foodCounts();
    var pairs = [];
    for (var g0 = 0; g0 < FOOD.length; g0++) {
      for (var i0 = 0; i0 < FOOD[g0].items.length; i0++) {
        var it0 = FOOD[g0].items[i0];
        if ((counts[it0[0]] || 0) > 0) {
          pairs.push([it0, counts[it0[0]]]);
        }
      }
    }
    pairs.sort(function (a, b) {
      return b[1] - a[1];
    });
    var topItems = [];
    for (var t = 0; t < pairs.length && t < 8; t++) {
      topItems.push(pairs[t][0]);
    }
    if (topItems.length) {
      var topGroup = document.createElement('div');
      topGroup.className = 'food-group';
      var topTitle = document.createElement('p');
      topTitle.className = 'fg-title';
      topTitle.textContent = '你最常吃的 · 心头好';
      topGroup.appendChild(topTitle);
      var topWrap = document.createElement('div');
      topWrap.className = 'chips';
      for (var w = 0; w < topItems.length; w++) {
        appendFoodChip(topWrap, topItems[w], 'fc-hot');
      }
      topGroup.appendChild(topWrap);
      box.appendChild(topGroup);
    }
    var skip = {};
    for (var k = 0; k < topItems.length; k++) {
      skip[topItems[k][0]] = true;
    }
    for (var g = 0; g < FOOD.length; g++) {
      var items = [];
      for (var i = 0; i < FOOD[g].items.length; i++) {
        if (!skip[FOOD[g].items[i][0]]) {
          items.push(FOOD[g].items[i]);
        }
      }
      if (!items.length) {
        continue;
      }
      var group = document.createElement('div');
      group.className = 'food-group';
      var title = document.createElement('p');
      title.className = 'fg-title';
      title.textContent = FOOD_ALIAS[FOOD[g].t] || FOOD[g].t;
      group.appendChild(title);
      var wrap = document.createElement('div');
      wrap.className = 'chips';
      for (var j = 0; j < items.length; j++) {
        appendFoodChip(wrap, items[j], FOOD_COLOR[FOOD[g].t] || '');
      }
      group.appendChild(wrap);
      box.appendChild(group);
    }
    foldFoodGroups(box);
  }

  function foodPoolHigh() {
    var out = [];
    var grp = foodGroup('蛋白质');
    for (var i = 0; i < grp.length; i++) {
      if ((grp[i][2] || 0) >= 7) {
        out.push(grp[i]);
      }
    }
    var snack = foodGroup('小零食');
    for (var k = 0; k < snack.length; k++) {
      if ((snack[k][2] || 0) >= 15) {
        out.push(snack[k]);
      }
    }
    return out;
  }

  function foodPoolLight() {
    var out = [];
    for (var g = 0; g < FOOD.length; g++) {
      for (var i = 0; i < FOOD[g].items.length; i++) {
        var it = FOOD[g].items[i];
        if (it[1] <= 60) {
          out.push(it);
        }
      }
    }
    return out;
  }

  function renderFoodHint(items, today) {
    var textEl = document.getElementById('fh-text');
    var chipsEl = document.getElementById('food-hint-chips');
    if (!textEl || !chipsEl) {
      return;
    }
    var dietItems = [];
    var sportItems = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].date !== today) {
        continue;
      }
      if (items[i].type === 'diet') {
        dietItems.push(items[i]);
      } else if (items[i].type === 'sport') {
        sportItems.push(items[i]);
      }
    }
    var inKcal = sumField(dietItems, '摄入热量');
    var burnKcal = sumField(sportItems, '消耗热量');
    var proteinIn = sumField(dietItems, '蛋白质');
    var nowW = currentWeight(items);
    var budget = budgetInfo(nowW);
    var pTarget = 85;
    if (nowW !== null && nowW > 0) {
      pTarget = Math.round(nowW * 1.4);
    }
    var pGap = Math.round(pTarget - proteinIn);
    var left = budget ? Math.round(budget.suggest + burnKcal - inKcal) : null;
    var pool = [];
    if (pGap >= 15) {
      textEl.textContent = '蛋白还差 ' + pGap + 'g 达标 · 先宠这几样：';
      pool = foodPoolHigh();
    } else if (left !== null && left < 0) {
      textEl.textContent = '今天吃得有点豪（超了 ' + Math.abs(left) + ' kcal）· 挑点清爽的：';
      pool = foodPoolLight();
    } else if (left !== null && left < 250) {
      textEl.textContent = '余额只剩 ' + left + ' kcal · 意思一下就好：';
      pool = foodPoolLight();
    } else {
      textEl.textContent = '今日营养营业中 · 加餐随便挑：';
      pool = foodPoolLight();
    }
    clearEl(chipsEl);
    if (!pool.length) {
      chipsEl.appendChild(emptyNode('今天先好好吃正餐呀'));
      return;
    }
    var s = daySeed();
    var n = pool.length;
    var picked = {};
    var count = 0;
    var j = 0;
    while (count < 3 && j < n) {
      var idx = (s + j * 5) % n;
      if (!picked[idx]) {
        picked[idx] = true;
        count++;
        appendFoodChip(chipsEl, pool[idx], 'fc-hot');
      }
      j++;
    }
  }

  /* ---------------- 今日餐桌（饮食页 v2） ---------------- */

  var MEAL_BADGE_CLS = { '早餐': 'mb-bf', '午餐': 'mb-lunch', '加餐': 'mb-snack', '晚餐': 'mb-dinner' };
  var MEAL_PICK_NOTES = {
    '早餐': '热乎的早餐，胃会谢谢你',
    '午餐': '午饭好好吃，下午才有劲',
    '加餐': '加餐小份垫垫，别顶掉晚饭',
    '晚餐': '晚饭清淡点，睡前更舒服'
  };
  var MEAL_ORDER = ['早餐', '午餐', '加餐', '晚餐'];

  function dayLabel(dateStr) {
    if (!dateStr) {
      return '';
    }
    if (dateStr === todayStr()) {
      return '今天';
    }
    var parts = String(dateStr).split('-');
    if (parts.length < 3) {
      return String(dateStr);
    }
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    var yest = new Date();
    yest.setDate(yest.getDate() - 1);
    var yStr = yest.getFullYear() + '-' + pad2(yest.getMonth() + 1) + '-' + pad2(yest.getDate());
    var label = Number(parts[1]) + '月' + Number(parts[2]) + '日';
    if (dateStr === yStr) {
      return '昨天 · ' + label;
    }
    var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    return label + ' ' + wk;
  }

  function syncMealPick() {
    var sel = document.querySelector('#form-diet [name="f-meal"]');
    var wrap = document.getElementById('meal-pick');
    if (!sel || !wrap) {
      return;
    }
    var val = sel.value;
    var btns = wrap.querySelectorAll('[data-meal-pick]');
    var picked = '';
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var opt = optionByText('餐次', b.getAttribute('data-meal-pick'));
      var on = !!(opt && val && opt.id === val);
      b.className = 'mp-btn' + (on ? ' on' : '');
      if (on) {
        picked = b.getAttribute('data-meal-pick');
      }
    }
    var note = document.getElementById('meal-note');
    if (note) {
      note.textContent = MEAL_PICK_NOTES[picked] || '先选餐次，点上面食谱的「照这个吃」自动填好';
    }
  }

  function handleMealPickClick(e) {
    var node = e.target;
    var btn = null;
    var guard = 0;
    while (node && node !== document && guard < 8) {
      if (node.getAttribute && node.getAttribute('data-meal-pick')) {
        btn = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!btn) {
      return;
    }
    var meal = btn.getAttribute('data-meal-pick');
    var sel = document.querySelector('#form-diet [name="f-meal"]');
    var opt = optionByText('餐次', meal);
    if (sel && opt) {
      sel.value = opt.id;
    }
    syncMealPick();
    saveDraftSoon('form-diet');
  }

  function handleMealSlotClick(e) {
    var node = e.target;
    var slot = null;
    var guard = 0;
    while (node && node !== document && guard < 8) {
      if (node.getAttribute && node.getAttribute('data-meal-slot')) {
        slot = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!slot) {
      return;
    }
    var meal = slot.getAttribute('data-meal-slot');
    setMealSelect(meal);
    focusField('form-diet', 'f-food');
    toast('帮你把「' + meal + '」选好啦，点食物或直接填都行');
  }

  function todayDietStats(items, today) {
    var meals = MEAL_ORDER;
    var sums = {};
    var hasRec = {};
    var dietToday = [];
    var burnKcal = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.date !== today) {
        continue;
      }
      if (it.type === 'diet') {
        dietToday.push(it);
        var t = selectText('餐次', it.raw['餐次']);
        var known = false;
        for (var q = 0; q < meals.length; q++) {
          if (meals[q] === t) {
            known = true;
          }
        }
        if (!known) {
          continue;
        }
        if (typeof it.raw['摄入热量'] === 'number') {
          sums[t] = (sums[t] || 0) + it.raw['摄入热量'];
        }
        hasRec[t] = true;
      } else if (it.type === 'sport' && typeof it.raw['消耗热量'] === 'number') {
        burnKcal += it.raw['消耗热量'];
      }
    }
    var recCount = 0;
    for (var k = 0; k < meals.length; k++) {
      if (hasRec[meals[k]]) {
        recCount++;
      }
    }
    return {
      sums: sums,
      hasRec: hasRec,
      recCount: recCount,
      dietToday: dietToday,
      burnKcal: burnKcal,
      inKcal: sumField(dietToday, '摄入热量'),
      proteinIn: sumField(dietToday, '蛋白质')
    };
  }

  function renderMealBoard(items, today) {
    var stats = todayDietStats(items, today);
    var board = document.getElementById('meal-board');
    if (board) {
      var slots = board.querySelectorAll('[data-meal-slot]');
      for (var k = 0; k < slots.length; k++) {
        var slot = slots[k];
        var m = slot.getAttribute('data-meal-slot');
        var em = slot.querySelector('em');
        if (stats.hasRec[m]) {
          slot.className = 'meal-slot done';
          if (em) {
            em.textContent = '✓ ' + fmtInt(stats.sums[m] || 0) + ' kcal';
          }
        } else {
          slot.className = 'meal-slot';
          if (em) {
            em.textContent = '待记录';
          }
        }
      }
    }
    var nowW = currentWeight(items);
    var budget = budgetInfo(nowW);
    var pTarget = 85;
    if (nowW !== null && nowW > 0) {
      pTarget = Math.round(nowW * 1.4);
    }
    var numKcal = document.getElementById('tb-kcal-num');
    var barIn = document.getElementById('tb-in-bar');
    if (numKcal) {
      if (budget) {
        var left = Math.round(budget.suggest + stats.burnKcal - stats.inKcal);
        if (left >= 0) {
          numKcal.textContent = '还可吃 ' + fmtInt(left);
          numKcal.className = 'tb-num';
        } else {
          numKcal.textContent = '超了 ' + fmtInt(Math.abs(left));
          numKcal.className = 'tb-num over';
        }
      } else {
        numKcal.textContent = '--';
        numKcal.className = 'tb-num';
      }
    }
    if (barIn) {
      var pct = 0;
      if (budget && budget.suggest > 0) {
        pct = (stats.inKcal / budget.suggest) * 100;
      }
      if (pct > 100) {
        pct = 100;
      }
      if (pct < 0) {
        pct = 0;
      }
      barIn.style.width = pct + '%';
    }
    var numPro = document.getElementById('tb-prot-num');
    if (numPro) {
      numPro.textContent = fmt1(stats.proteinIn) + ' / ' + pTarget + 'g';
    }
    var barPro = document.getElementById('tb-pro-bar');
    if (barPro) {
      var ppct = pTarget > 0 ? (stats.proteinIn / pTarget) * 100 : 0;
      if (ppct > 100) {
        ppct = 100;
      }
      if (ppct < 0) {
        ppct = 0;
      }
      barPro.style.width = ppct + '%';
    }
    var noteEl = document.getElementById('tb-note');
    if (noteEl) {
      var hour = new Date().getHours();
      var noteTxt;
      if (stats.recCount === 0) {
        noteTxt = '今天还没开张呢，第一口吃完就来记一笔呀';
      } else if (stats.recCount >= 4) {
        noteTxt = '四餐都记齐啦，今天把自己照顾得很好';
      } else if (hour >= 19 && !stats.hasRec['晚餐']) {
        noteTxt = '晚饭吃了什么呀？记上就凑齐今天的账啦';
      } else {
        noteTxt = '还差 ' + (4 - stats.recCount) + ' 餐没记，吃完随手记一笔就好';
      }
      noteEl.textContent = noteTxt;
    }
    var jKcal = document.getElementById('js-kcal');
    if (jKcal) {
      jKcal.textContent = stats.dietToday.length ? fmtInt(stats.inKcal) : '--';
    }
    var jProt = document.getElementById('js-prot');
    if (jProt) {
      jProt.textContent = stats.dietToday.length ? fmt1(stats.proteinIn) : '--';
    }
    var jMeals = document.getElementById('js-meals');
    if (jMeals) {
      jMeals.textContent = String(stats.recCount);
    }
  }

  function handleFoodClick(e) {
    var node = e.target;
    var btn = null;
    var guard = 0;
    while (node && node !== document && guard < 12) {
      if (node.getAttribute && node.getAttribute('data-name')) {
        btn = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!btn) {
      return;
    }
    var name = btn.getAttribute('data-name');
    var kcal = numOrNull(btn.getAttribute('data-kcal'));
    var prot = numOrNull(btn.getAttribute('data-prot'));
    var foodEl = document.querySelector('#form-diet [name="f-food"]');
    var kcalEl = document.querySelector('#form-diet [name="f-kcal-in"]');
    var protEl = document.querySelector('#form-diet [name="f-protein"]');
    if (!foodEl || !kcalEl) {
      return;
    }
    var curFood = foodEl.value ? String(foodEl.value).trim() : '';
    foodEl.value = curFood ? curFood + ' + ' + name : name;
    var curKcal = numOrNull(String(kcalEl.value).trim());
    var total = (curKcal === null ? 0 : curKcal) + (kcal === null ? 0 : kcal);
    kcalEl.value = String(Math.round(total));
    if (protEl) {
      var curProt = numOrNull(String(protEl.value).trim());
      var protSum = Math.round(((curProt === null ? 0 : curProt) + (prot === null ? 0 : prot)) * 10) / 10;
      protEl.value = String(protSum);
    }
    saveDraftSoon('form-diet');
    bumpFoodCount(name);
    renderFoodChips();
    toast('已加入 ' + name + '（' + (kcal === null ? 0 : kcal) + ' kcal · 蛋白 ' + (prot === null ? 0 : prot) + 'g）');
  }

  /* ---------------- 设置面板 ---------------- */

  function openSheet() {
    var mask = document.getElementById('sheet-mask');
    if (mask) {
      mask.classList.add('open');
    }
    fillSettingsForm();
    updateCalcPreview();
  }

  function closeSheet() {
    var mask = document.getElementById('sheet-mask');
    if (mask) {
      mask.classList.remove('open');
    }
  }

  function fillSettingsForm() {
    var form = document.getElementById('settings-form');
    if (!form) {
      return;
    }
    var nameEl = document.querySelector('#settings-form [name="p-name"]');
    var hEl = document.querySelector('#settings-form [name="p-height"]');
    var wEl = document.querySelector('#settings-form [name="p-weight"]');
    var gEl = document.querySelector('#settings-form [name="p-goal"]');
    var aEl = document.querySelector('#settings-form [name="p-age"]');
    var actEl = document.querySelector('#settings-form [name="p-act"]');
    if (PROFILE) {
      if (nameEl) {
        nameEl.value = PROFILE.name || '';
      }
      if (hEl) {
        hEl.value = PROFILE.height ? String(PROFILE.height) : '';
      }
      if (wEl) {
        wEl.value = PROFILE.weight ? String(PROFILE.weight) : '';
      }
      if (gEl) {
        gEl.value = PROFILE.goal ? String(PROFILE.goal) : '';
      }
      if (aEl) {
        aEl.value = PROFILE.age ? String(PROFILE.age) : '';
      }
      if (actEl && PROFILE.act) {
        actEl.value = String(PROFILE.act);
      }
    }
  }

  function updateCalcPreview() {
    var h = numOrNull(inputVal('settings-form', 'p-height'));
    var w = numOrNull(inputVal('settings-form', 'p-weight'));
    var a = numOrNull(inputVal('settings-form', 'p-age'));
    var act = numOrNull(inputVal('settings-form', 'p-act'));
    var el = document.getElementById('calc-preview');
    if (!el) {
      return;
    }
    if (h && w && a && act) {
      var bmr = 10 * w + 6.25 * h - 5 * a - 161;
      var tdee = bmr * act;
      var sug = Math.round(tdee - 350);
      if (sug < 1200) {
        sug = 1200;
      }
      var weekly = Math.round((tdee - sug) * 7 / 7700 * 100) / 100;
      el.textContent = '基础代谢 ' + Math.round(bmr) + ' · 每日消耗 ' + Math.round(tdee) + ' · 建议摄入 ' + sug + ' kcal · 每周约 -' + weekly + ' kg（理论）';
    } else {
      el.textContent = '基础代谢 -- · 每日消耗 -- · 建议摄入 -- · 每周约 -- kg（理论）';
    }
  }

  function saveProfile(e) {
    e.preventDefault();
    var h = numOrNull(inputVal('settings-form', 'p-height'));
    var w = numOrNull(inputVal('settings-form', 'p-weight'));
    var g = numOrNull(inputVal('settings-form', 'p-goal'));
    var a = numOrNull(inputVal('settings-form', 'p-age'));
    var act = numOrNull(inputVal('settings-form', 'p-act'));
    if (!h || !w || !g || !a) {
      toast('身高、体重、目标体重和年龄都填上，我才能算准');
      return;
    }
    var nameEl = document.querySelector('#settings-form [name="p-name"]');
    var nameVal = nameEl && nameEl.value ? String(nameEl.value).trim() : '';
    PROFILE = {
      name: nameVal || '丫宝',
      height: h,
      weight: w,
      goal: g,
      age: a,
      act: act || 1.375
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(PROFILE));
    } catch (err) {
      return;
    }
    toast('资料保存好啦，热量预算已更新');
    closeSheet();
    renderAll();
  }

  function exportBackup() {
    var payload = {
      app: '丫宝的减脂工作台',
      exportedAt: new Date().toISOString(),
      profile: PROFILE,
      records: ALL
    };
    var text = JSON.stringify(payload, null, 2);
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '减脂工作台备份-' + todayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 3000);
    toast('备份文件已导出');
  }

  function csvCell(v) {
    var t = (v === null || v === undefined) ? '' : String(v);
    if (/[",\n]/.test(t)) { return '"' + t.replace(/"/g, '""') + '"'; }
    return t;
  }

  function exportCSV() {
    if (!ALL || !ALL.length) {
      toast('还没有记录可以导出');
      return;
    }
    var head = ['日期', '类型', '餐次/项目', '内容', '热量kcal', '蛋白g', '时长min', '备注'];
    var lines = [head.join(',')];
    var rows = ALL.slice().sort(function (a, b) {
      return String(a['日期'] || '').localeCompare(String(b['日期'] || ''));
    });
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i] || {};
      var t = r['记录类型'];
      var tName = selectText('记录类型', t) || '';
      var detail = tName === '饮食' ? (r['饮食内容'] || '')
        : (tName === '运动' ? (r['运动项目'] || '') : '');
      lines.push([
        csvCell(r['日期']),
        csvCell(tName),
        csvCell(tName === '饮食' ? (selectText('餐次', r['餐次']) || '') : (selectText('运动类型', r['运动类型']) || '')),
        csvCell(detail),
        csvCell(tName === '饮食' ? r['摄入热量'] : (tName === '运动' ? r['消耗热量'] : '')),
        csvCell(r['蛋白质']),
        csvCell(r['运动时长']),
        csvCell(r['备注'])
      ].join(','));
    }
    // BOM 让 Excel 正确识别中文
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '减脂记录-' + todayStr() + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    toast('CSV 导出好了，可以用表格打开');
  }

  function wipeLocal() {
    if (!window.confirm('清除本机的个人资料和未提交草稿？云端打卡记录不会受影响。')) {
      return;
    }
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(DRAFT_PREFIX + 'form-body');
      localStorage.removeItem(DRAFT_PREFIX + 'form-diet');
      localStorage.removeItem(DRAFT_PREFIX + 'form-sport');
    } catch (err) {
      return;
    }
    PROFILE = null;
    fillSettingsForm();
    updateCalcPreview();
    renderAll();
    toast('本机资料已清除');
  }

  /* ---------------- 界面绑定 ---------------- */

  function switchTab(name) {
    var tabs = document.querySelectorAll('.tabbar .tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }
    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++) {
      views[j].classList.remove('active');
    }
    var tab = document.querySelector('.tab[data-tab="' + name + '"]');
    var view = document.getElementById('view-' + name);
    if (tab) {
      tab.classList.add('active');
    }
    if (view) {
      view.classList.add('active');
    }
    window.scrollTo(0, 0);
  }

  function focusField(formId, fieldName) {
    var el = document.querySelector('#' + formId + ' [name="' + fieldName + '"]');
    if (el) {
      setTimeout(function () {
        el.focus();
        if (el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 60);
    }
  }

  /* ---------------- 刷新：按钮 / 下拉 / 回到前台 ---------------- */

  var lastRefreshAt = 0;
  var ptrBusy = false;

  function ptrSet(on, text) {
    var box = document.getElementById('ptr');
    var tx = document.getElementById('ptr-text');
    if (box) {
      if (on) {
        box.classList.add('on');
      } else {
        box.classList.remove('on');
      }
    }
    if (tx && text) {
      tx.textContent = text;
    }
  }

  function spinRefreshBtn(on) {
    var btn = document.getElementById('btn-refresh');
    if (!btn) {
      return;
    }
    if (on) {
      btn.classList.remove('spin');
      void btn.offsetWidth;
      btn.classList.add('spin');
    } else {
      btn.classList.remove('spin');
    }
  }

  function manualRefresh(fromPull) {
    if (!db) {
      if (fromPull) {
        ptrSet(false, '下拉刷新');
      }
      toast('要先登录一下，数据才会同步过来哦');
      return;
    }
    ptrBusy = true;
    spinRefreshBtn(true);
    if (fromPull) {
      ptrSet(true, '正在刷新…');
    }
    var started = Date.now();
    refreshData();
    var tick = setInterval(function () {
      if (!isRefreshing || Date.now() - started > 8000) {
        clearInterval(tick);
        ptrBusy = false;
        spinRefreshBtn(false);
        if (fromPull) {
          ptrSet(true, '刷新好啦 ✨');
          setTimeout(function () {
            ptrSet(false, '');
            setTimeout(function () { ptrSet(false, '下拉刷新'); }, 260);
          }, 420);
        } else {
          toast('已经更新到最新啦');
        }
      }
    }, 120);
  }

  function bindPullRefresh() {
    var startY = null;
    var ready = false;

    function reset() {
      startY = null;
      ready = false;
      ptrSet(false, '');
    }

    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || ptrBusy) {
        return;
      }
      if (window.scrollY > 0 || document.documentElement.scrollTop > 0) {
        return;
      }
      startY = e.touches[0].clientY;
      ready = false;
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
      if (startY === null || ptrBusy || e.touches.length !== 1) {
        return;
      }
      var d = e.touches[0].clientY - startY;
      if (d <= 0 || window.scrollY > 0 || document.documentElement.scrollTop > 0) {
        reset();
        return;
      }
      if (d > 64) {
        if (!ready) {
          ready = true;
          ptrSet(true, '松手刷新 ✨');
        }
      } else {
        ready = false;
        ptrSet(true, '下拉刷新…');
      }
    }, { passive: true });

    document.addEventListener('touchend', function () {
      if (startY === null) {
        return;
      }
      var wasReady = ready;
      startY = null;
      ready = false;
      if (wasReady) {
        manualRefresh(true);
      } else {
        ptrSet(false, '');
      }
    }, { passive: true });

    document.addEventListener('touchcancel', reset, { passive: true });
  }

  function bindAutoRefresh() {
    function maybeRefresh() {
      if (Date.now() - lastRefreshAt < 30000) {
        return;
      }
      if (typeof scheduleRefresh === 'function') {
        scheduleRefresh();
        lastRefreshAt = Date.now();
      }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        maybeRefresh();
      }
    });
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        maybeRefresh();
      }
    });
  }

  /* ---------------- 版本检测（主屏缓存兜底） ---------------- */

  var PAGE_VER = document.documentElement.getAttribute('data-ver') || '';

  function baseUrl() {
    var u = location.href.split('#')[0];
    return u.replace(/[?&]_vc=\d+/, '').replace(/[?&]v=[^&]+/, '');
  }

  function hardReload(ver) {
    var u = baseUrl();
    u += (u.indexOf('?') === -1 ? '?' : '&') + (ver ? 'v=' + encodeURIComponent(ver) : 'r=' + Date.now());
    location.replace(u);
  }

  function showUpdatePill(ver) {
    if (document.getElementById('upd-pill')) {
      return;
    }
    var pill = document.createElement('button');
    pill.id = 'upd-pill';
    pill.className = 'upd-pill';
    pill.type = 'button';
    pill.innerHTML = '<i></i>有新版本啦 · 点我更新';
    pill.addEventListener('click', function () {
      pill.textContent = '正在更新…';
      hardReload(ver);
    });
    document.body.appendChild(pill);
    setTimeout(function () { pill.classList.add('show'); }, 30);
  }


  var skelShownAt = Date.now();
  function hideSkeleton() {
    document.body.classList.remove('skel-on');
    var el = document.getElementById('skel');
    if (!el) { return; }
    var wait = Math.max(0, 320 - (Date.now() - skelShownAt));
    setTimeout(function () {
      if (el.parentNode) { el.parentNode.removeChild(el); }
      document.body.classList.remove('skel-on');
    }, wait);
  }

  window.__hideSkeleton = hideSkeleton;
  /* 兜底：无论数据有没有回来，6 秒后一定把骨架撤掉，绝不让它挡住内容 */
  setTimeout(hideSkeleton, 6000);

  (function bindRecTools() {
    var boxes = document.querySelectorAll('.rec-tools');
    if (!boxes.length) { return; }
    for (var i = 0; i < boxes.length; i++) {
      (function (box) {
        var q = box.querySelector('.rec-q');
        if (q) {
          q.addEventListener('input', function () {
            recFilter.q = String(this.value || '').trim().toLowerCase();
            var fold = document.querySelector('.rec-fold');
            if (fold && recFilter.q) { fold.open = true; }
            if (recLastArgs) { renderLists(recLastArgs.items, recLastArgs.today); }
          });
        }
        box.addEventListener('click', function (e) {
          var btn = e.target;
          if (!btn || !btn.getAttribute) { return; }
          var r = btn.getAttribute('data-range');
          if (!r) { return; }
          recFilter.range = r;
          var fold0 = document.querySelector('.rec-fold');
          if (fold0) { fold0.open = true; }
          var all = document.querySelectorAll('.rec-range button');
          for (var k = 0; k < all.length; k++) {
            all[k].classList.toggle('on', all[k].getAttribute('data-range') === r);
          }
          if (recLastArgs) { renderLists(recLastArgs.items, recLastArgs.today); }
        });
      })(boxes[i]);
    }
  })();

  (function fillVer() {
    var el = document.getElementById('ver-line');
    if (el && PAGE_VER) {
      el.textContent = '当前版本 ' + PAGE_VER;
    }
  })();

  function bindRefreshBtn() {
    var btn = document.getElementById('btn-refresh');
    if (!btn) {
      return;
    }
    btn.addEventListener('click', function () {
      manualRefresh(false);
    });

    // 长按 0.8 秒：强制重新加载页面（主屏缓存太顽固时的兜底）
    var hold = null;
    function arm() {
      hold = setTimeout(function () {
        hold = null;
        hardReload();
      }, 800);
    }
    function disarm() {
      if (hold) {
        clearTimeout(hold);
        hold = null;
      }
    }
    btn.addEventListener('mousedown', arm);
    btn.addEventListener('touchstart', arm, { passive: true });
    btn.addEventListener('mouseup', disarm);
    btn.addEventListener('mouseleave', disarm);
    btn.addEventListener('touchend', disarm);
    btn.addEventListener('touchcancel', disarm);
  }

  function bindUI() {
    var tabs = document.querySelectorAll('.tabbar .tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          switchTab(btn.getAttribute('data-tab'));
        });
      })(tabs[i]);
    }

    var listIds = ['today-list', 'body-list', 'diet-list', 'sport-list'];
    for (var j = 0; j < listIds.length; j++) {
      var box = document.getElementById(listIds[j]);
      if (box) {
        box.addEventListener('click', handleListClick);
      }
    }

    var moreBtns = document.querySelectorAll('.more-btn');
    for (var m = 0; m < moreBtns.length; m++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-more');
          LIMITS[key] = (LIMITS[key] || 15) + 15;
          renderAll();
        });
      })(moreBtns[m]);
    }

    handleFormSubmit('form-body', buildBodyProps);
    handleFormSubmit('form-diet', buildDietProps);
    handleFormSubmit('form-sport', buildSportProps);

    /* ===================== 体验优化批次 =====================
       1 删除可撤销  2 常吃快捷  3 打开轻提醒  4 本周小结  5 饮水
       6 无惩罚反馈（streak 已在上方处理）  7 滚动降级毛玻璃
       ======================================================= */

    /* ---- 1. 删除可撤销（6 秒内可撤回）---- */
    var pendingDel = null;
    var undoBar = document.getElementById('undo-bar');

    function showUndo(txt) {
      if (!undoBar) { return; }
      var t = document.getElementById('undo-text');
      if (t) { t.textContent = txt || '已删除这条记录'; }
      undoBar.classList.add('on');
    }
    function hideUndo() {
      if (undoBar) { undoBar.classList.remove('on'); }
    }
    function commitPendingDel() {
      if (!pendingDel) { return; }
      var job = pendingDel;
      pendingDel = null;
      hideUndo();
      if (!db) { return; }
      db.deleteRecord({ databaseId: DATABASE_ID, recordId: job.id }).then(function () {
        refreshData();
      }).catch(function (err) {
        console.error('[database] 删除失败:', err);
        toast(dbErrMsg(err));
        refreshData();
      });
    }
    function undoPendingDel() {
      if (!pendingDel) { return; }
      clearTimeout(pendingDel.timer);
      if (pendingDel.el) { pendingDel.el.classList.remove('removing'); }
      pendingDel = null;
      hideUndo();
      toast('撤销了，记录还在');
    }
    function queueDelete(id, el) {
      commitPendingDel();               // 上一条先落地，避免堆叠
      if (el) { el.classList.add('removing'); }
      pendingDel = { id: id, el: el, timer: setTimeout(commitPendingDel, 6000) };
      showUndo('已删除这条记录');
    }
    var undoBtnEl = document.getElementById('undo-btn');
    if (undoBtnEl) { undoBtnEl.addEventListener('click', undoPendingDel); }
    window.__queueDelete = queueDelete;   // 删除按钮的处理器在别的作用域

    /* ---- 2. 常吃快捷（最近吃过，一点就填）---- */
    var QUICK_MAX = 6;

    function recentMeals() {
      var seen = {};
      var out = [];
      var rows = normalizeRows();
      var list = [];
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].type === 'diet') { list.push(rows[i]); }
      }
      list.sort(function (x, y) {
        return String(y.date || '').localeCompare(String(x.date || ''));
      });
      for (var k = 0; k < list.length && out.length < QUICK_MAX; k++) {
        var raw = list[k].raw || {};
        var name = String(raw['饮食内容'] || '').trim();
        if (!name || seen[name]) { continue; }
        seen[name] = 1;
        out.push({
          name: name,
          kcal: Number(raw['摄入热量']) || 0,
          protein: Number(raw['蛋白质']) || 0
        });
      }
      return out;
    }

    function renderQuickRow() {
      var box = document.getElementById('quick-row');
      if (!box) { return; }
      var items = recentMeals();
      box.innerHTML = '';
      if (!items.length) { return; }
      for (var i = 0; i < items.length; i++) {
        (function (it) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'quick-chip';
          var sp = document.createElement('span');
          sp.textContent = it.name.length > 11 ? it.name.slice(0, 11) + '…' : it.name;
          var em = document.createElement('em');
          em.textContent = it.kcal ? it.kcal + ' kcal' : '';
          b.appendChild(sp);
          b.appendChild(em);
          b.addEventListener('click', function () {
            var form = document.getElementById('form-diet');
            if (!form) { return; }
            var f1 = form.querySelector('[name="f-food"]');
            var f2 = form.querySelector('[name="f-kcal-in"]');
            var f3 = form.querySelector('[name="f-protein"]');
            if (f1) { f1.value = it.name; }
            if (f2 && it.kcal) { f2.value = String(it.kcal); }
            if (f3 && it.protein) { f3.value = String(it.protein); }
            var fs = [f1, f2, f3];
            for (var q = 0; q < fs.length; q++) {
              if (fs[q]) { fs[q].dispatchEvent(new Event('input', { bubbles: true })); }
            }
            saveDraftSoon('form-diet');
            toast('填好了，看看对不对');
          });
          box.appendChild(b);
        })(items[i]);
      }
    }

    /* ---- 4. 本周小结 ---- */
    function ymdOf(d) {
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function renderWeekCard(items, today) {
      var card = document.getElementById('week-card');
      if (!card) { return; }
      var base = new Date(today + 'T00:00:00');
      var mondayOffset = (base.getDay() + 6) % 7;
      var start = new Date(base.getTime() - mondayOffset * 86400000);
      var startStr = ymdOf(start);

      var days = {}, proteinSum = 0, proteinDays = {}, sportCount = 0;
      var weights = [];   // {date, w}
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var d = it.date || '';
        if (!d || d < startStr || d > today) { continue; }
        days[d] = true;
        var raw = it.raw || {};
        if (it.type === 'diet') {
          var p = Number(raw['蛋白质']);
          if (isFinite(p) && p > 0) {
            proteinSum += p;
            proteinDays[d] = (proteinDays[d] || 0) + p;
          }
        } else if (it.type === 'sport') {
          sportCount++;
        } else if (it.type === 'body') {
          var w = Number(raw['体重']);
          if (isFinite(w) && w > 0) { weights.push({ date: d, w: w }); }
        }
      }

      var dayCount = Object.keys(days).length;
      var pDayCount = Object.keys(proteinDays).length;
      var avgProtein = pDayCount ? Math.round(proteinSum / pDayCount) : 0;

      var wDelta = null;
      if (weights.length >= 2) {
        weights.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        wDelta = Math.round((weights[weights.length - 1].w - weights[0].w) * 10) / 10;
      }

      var setTxt = function (id, v) {
        var el = document.getElementById(id);
        if (el) { el.textContent = v; }
      };
      setTxt('wk-days', dayCount ? String(dayCount) : '--');
      setTxt('wk-protein', avgProtein ? String(avgProtein) : '--');
      setTxt('wk-sport', sportCount ? String(sportCount) : '--');
      setTxt('wk-weight', wDelta === null ? '--' : (wDelta > 0 ? '+' : '') + wDelta.toFixed(1));

      var range = document.getElementById('week-range');
      if (range) { range.textContent = '周一到今天'; }

      var note = document.getElementById('week-note');
      if (note) {
        if (dayCount === 0) {
          note.textContent = '这周还没开始记，想起来的时候记一笔就好。';
        } else if (dayCount < 3) {
          note.textContent = '这周记了 ' + dayCount + ' 天，先不用总结，记到第三天这里就有故事了。';
        } else {
          var bits = ['这周记了 ' + dayCount + ' 天'];
          if (avgProtein) { bits.push('日均蛋白 ' + avgProtein + 'g'); }
          if (sportCount) { bits.push('动了 ' + sportCount + ' 次'); }
          if (wDelta !== null) {
            if (wDelta < -0.1) { bits.push('体重降了 ' + Math.abs(wDelta).toFixed(1) + 'kg'); }
            else if (wDelta > 0.1) { bits.push('体重涨了 ' + wDelta.toFixed(1) + 'kg（正常的波动，别慌）'); }
            else { bits.push('体重基本稳住'); }
          }
          note.textContent = bits.join('，') + '。';
        }

        // 平台期：近 14 天体重几乎没动，且记录够多 → 给一句安慰 + 可执行建议
        var d14 = new Date(base.getTime() - 13 * 86400000);
        var w14 = [];
        for (var q = 0; q < items.length; q++) {
          var iq = items[q];
          if (iq.type !== 'body' || !iq.date || iq.date < ymdOf(d14)) { continue; }
          var wv = Number((iq.raw || {})['体重']);
          if (isFinite(wv) && wv > 0) { w14.push(wv); }
        }
        if (w14.length >= 5 && dayCount >= 5) {
          var mn = Math.min.apply(null, w14);
          var mx = Math.max.apply(null, w14);
          if (mx - mn <= 0.4) {
            note.textContent += ' 这两周体重一直很稳，不是没效果，是身体在适应 —— 可以把力量训练加到每周两次，围度会先动。';
          }
        }
      }
    }

    /* ---- 5. 饮水（只记本机）---- */
    var WATER_PREFIX = 'yabao_water_';
    var WATER_GOAL = 8;

    function waterGet() {
      try {
        var v = Number(localStorage.getItem(WATER_PREFIX + todayStr()));
        return isFinite(v) && v >= 0 ? Math.min(v, 20) : 0;
      } catch (e) { return 0; }
    }
    function waterSet(n) {
      try { localStorage.setItem(WATER_PREFIX + todayStr(), String(n)); } catch (e) {}
    }
    function renderWater() {
      var box = document.getElementById('water-cups');
      var tag = document.getElementById('water-tag');
      if (!box) { return; }
      var n = waterGet();
      box.innerHTML = '';
      var shows = Math.max(WATER_GOAL, Math.min(n, 12));
      for (var i = 0; i < shows; i++) {
        var cup = document.createElement('span');
        cup.className = 'water-cup' + (i < n ? ' on' : '');
        box.appendChild(cup);
      }
      if (tag) {
        tag.textContent = n >= WATER_GOAL ? '今天够啦 · ' + n + ' 杯' : n + ' / ' + WATER_GOAL + ' 杯';
      }
    }
    var waterBtn = document.getElementById('water-add');
    if (waterBtn) {
      waterBtn.addEventListener('click', function () {
        var n = waterGet();
        if (n >= 12) { toast('喝太多啦，先歇会儿'); return; }
        waterSet(n + 1);
        renderWater();
        if (n + 1 === WATER_GOAL) { toast('今天的水喝够了，很棒'); }
      });
    }

    /* ---- 6. 滚动时降级毛玻璃（iOS 合成开销）---- */
    (function bindScrollPerf() {
      var timer = null;
      window.addEventListener('scroll', function () {
        document.body.classList.add('is-scrolling');
        clearTimeout(timer);
        timer = setTimeout(function () {
          document.body.classList.remove('is-scrolling');
        }, 260);
      }, { passive: true });
    })();

    /* ---- 汇总渲染 ---- */
    function renderExtrasInner(items, today) {
      renderQuickRow();
      renderWeekCard(items, today);
      renderWater();
    }
    /* 这段代码在 bindUI 作用域内，renderAll 在顶层，需要在 window 上过一手 */
    window.__renderExtras = renderExtrasInner;

    var achvBox = document.getElementById('achv-chips');
    if (achvBox) {
      achvBox.addEventListener('click', function (e) {
        var node = e.target;
        var btn = null;
        var guard = 0;
        while (node && node !== document && guard < 8) {
          if (node.getAttribute && node.getAttribute('data-oid')) {
            btn = node;
            break;
          }
          node = node.parentNode;
          guard++;
        }
        if (!btn) {
          return;
        }
        var oid = btn.getAttribute('data-oid');
        var idx = achvSel.indexOf(oid);
        if (idx === -1) {
          achvSel.push(oid);
          btn.classList.add('on');
        } else {
          achvSel = achvSel.filter(function (x) {
            return x !== oid;
          });
          btn.classList.remove('on');
        }
      });
    }

    var achvGo = document.getElementById('achv-go');
    if (achvGo) {
      achvGo.addEventListener('click', function () {
        switchTab('journal');
        setTimeout(function () {
          var card = document.querySelector('.check-card');
          if (card && card.scrollIntoView) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 140);
      });
    }

    var foodBox = document.getElementById('food-box');
    if (foodBox) {
      foodBox.addEventListener('click', handleFoodClick);
    }
    var foodHintChips = document.getElementById('food-hint-chips');
    if (foodHintChips) {
      foodHintChips.addEventListener('click', handleFoodClick);
    }

    var estBtn = document.getElementById('btn-est');
    if (estBtn) {
      estBtn.addEventListener('click', estimateBurn);
    }

    var settingsBtn = document.getElementById('btn-settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', openSheet);
    }
    var inlineBtn = document.getElementById('open-settings-inline');
    if (inlineBtn) {
      inlineBtn.addEventListener('click', openSheet);
    }
    var closeBtn = document.getElementById('btn-sheet-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSheet);
    }
    var mask = document.getElementById('sheet-mask');
    if (mask) {
      mask.addEventListener('click', function (e) {
        if (e.target === mask) {
          closeSheet();
        }
      });
    }
    var settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', saveProfile);
      settingsForm.addEventListener('input', updateCalcPreview);
      settingsForm.addEventListener('change', updateCalcPreview);
    }
    var exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', exportBackup);
    }
    var exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', exportCSV);
    }
    var wipeBtn = document.getElementById('btn-wipe');
    if (wipeBtn) {
      wipeBtn.addEventListener('click', wipeLocal);
    }

    var qaWeight = document.getElementById('qa-weight');
    if (qaWeight) {
      qaWeight.addEventListener('click', function () {
        switchTab('trend');
        focusField('form-body', 'f-weight');
      });
    }
    var qaMeal = document.getElementById('qa-meal');
    if (qaMeal) {
      qaMeal.addEventListener('click', function () {
        switchTab('diet');
        focusField('form-diet', 'f-food');
      });
    }
    var qaSport = document.getElementById('qa-sport');
    if (qaSport) {
      qaSport.addEventListener('click', function () {
        switchTab('sport');
        focusField('form-sport', 'f-ex-item');
      });
    }
  }

  /* ---------------- 手账 ---------------- */

  var careSel = [];
  var menuRecs = {};
  var menuData = {};
  var brotherIdx = -1;
  var MOOD_TEXTS = ['还不错', '没感觉', '有点难过', '想被哄哄'];
  var CARE_CHECKIN = ['早餐', '午餐', '加餐', '晚餐', '散步完成', '多维 + 益生菌', '咖啡 9:30 前', '喝水 1600ml', '步数8000+', '没喝含糖饮料'];
  var CARE_ACT_ROWS = [
    { label: '慢走', sub: '20 分钟 · 顺路拿个快递', opt: '散步完成' },
    { label: '睡前拉伸', sub: '8 分钟', opt: '睡前拉伸' },
    { label: '热敷小腹', sub: '10 分钟 · 怕冷就继续', opt: '热敷小腹' },
    { label: '早点睡', sub: '23:00 前', opt: '早点睡' }
  ];
  var BROTHER_NOTES = [
    '想你了。一锅端的饭最香，锅底那口记得刮干净哦',
    '吃多少盛多少，别按两个人的量煮 —— 我心疼你吃撑了难受',
    '勾满它，哥哥就安心啦',
    '锅小，心意一点不少 —— 你在我这儿也是',
    '热乎的吃完，才准睡哦。梦里见。',
    '不想动就躺平，第 4 天也是放过自己的一天 —— 我批准',
    '水要喝温的，分次慢慢喝，肚肚喜欢，我也喜欢',
    '一会儿顺路拿个快递，就当今天的散步啦',
    '实在吃不下就热杯牛奶，这也算吃过 —— 不许说是偷懒',
    '慢慢来，快过去啦。等你满血复活，带你去吃好吃的'
  ];

  var TIPS_POOL = [
    '早上来碗热乎的最舒服，一碗下去，上午都暖暖的',
    '燕麦配牛奶是温柔组合，稳稳的，不容易饿',
    '红枣记得去核再煮，甜甜的，肚肚也喜欢',
    '做肉菜记得去皮，清爽一点，也更好消化',
    '焖饭按下"一键"就好，别站在灶台前累着自己',
    '酸奶提前一小时拿出来放温，冰的可不行',
    '苹果之类的水果慢慢吃，一小口一小口更舒服',
    '番茄这类酸酸甜甜的煮出汁，热汤最开胃也最安抚人',
    '肉片最后下锅烫熟就关火，嫩嫩的，胃也不用费力',
    '面条煮半份就好 —— 锅小，心意一点不少',
    '一餐一道菜不是敷衍，是把简单的事认真做',
    '饿了先喝两口温水，等十分钟再决定加不加餐',
    '吃饭时把手机放远一点，认真尝尝每一口',
    '饭后靠墙站十分钟，比马上躺下舒服很多',
    '咖啡放在 9:30 前喝，今晚的睡眠会谢谢它',
    '水杯放在看得到的地方，看到就喝两口',
    '不想做饭也没关系，热牛奶加红枣也是好好的晚餐',
    '肚肚胀的时候别硬扛，热毛巾敷一敷就舒服了',
    '情绪起伏是身体在调频道，不是你的错',
    '慢走不用赶，20 分钟里有 19 分钟可以发呆',
    '23 点前睡下，明天的气色会替你说谢谢',
    '体重这两天涨一点是水分，过两天会自己回去',
    '把自己照顾好这件小事，你每天都做得很好',
    '粉色是温柔，蓝色是安定，今天的你两个都拥有'
  ];

  function renderDailyTips() {
    var box = document.getElementById('journal-tips');
    if (!box) {
      return;
    }
    var d = new Date();
    var seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
    var n = TIPS_POOL.length;
    clearEl(box);
    var picked = {};
    var count = 0;
    var i = 0;
    while (count < 5 && i < n) {
      var idx = (seed + i * 5) % n;
      if (!picked[idx]) {
        picked[idx] = true;
        count++;
        var li = document.createElement('li');
        li.textContent = TIPS_POOL[idx];
        box.appendChild(li);
      }
      i++;
    }
  }

  function optionByText(field, text) {
    var list = SCHEMA_OPTIONS[field] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].text === text) {
        return list[i];
      }
    }
    return null;
  }

  function careStateFromItems(items, today) {
    var ids = [];
    var map = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type !== 'body' || it.date !== today) {
        continue;
      }
      var raw = it.raw['今日关照'];
      if (!raw) {
        continue;
      }
      var arr = typeof raw === 'string' ? [raw] : raw;
      for (var j = 0; j < arr.length; j++) {
        var t = selectText('今日关照', arr[j]);
        var opt = optionByText('今日关照', t);
        var key = opt ? opt.id : String(arr[j]);
        if (!map[key]) {
          map[key] = true;
          ids.push(key);
        }
      }
    }
    return ids;
  }

  function careOn(oid) {
    return careSel.indexOf(oid) > -1;
  }

  function buildJBox() {
    var box = document.createElement('span');
    box.className = 'jbox';
    box.textContent = '\u2713';
    return box;
  }

  function updateCheckTag(n) {
    var el = document.getElementById('check-tag');
    if (!el) {
      return;
    }
    el.textContent = n >= CARE_CHECKIN.length ? '全勾满啦 · 哥哥安心了' : '已勾 ' + n + ' / ' + CARE_CHECKIN.length;
  }

  function renderCareChips() {
    var checkinBox = document.getElementById('journal-checkin');
    var actBox = document.getElementById('journal-activity');
    var moodBox = document.getElementById('journal-mood');
    var careList = SCHEMA_OPTIONS['今日关照'] || [];
    if (!careList.length) {
      var msg = SCHEMA_OPTIONS['今日关照'] ? '暂时加载不出来，稍后再试' : '加载中…';
      if (checkinBox) { clearEl(checkinBox); checkinBox.appendChild(emptyNode(msg)); }
      if (actBox) { clearEl(actBox); actBox.appendChild(emptyNode(msg)); }
      if (moodBox) { clearEl(moodBox); moodBox.appendChild(emptyNode(msg)); }
      return;
    }
    if (checkinBox) {
      clearEl(checkinBox);
      var nOnCheck = 0;
      for (var i = 0; i < CARE_CHECKIN.length; i++) {
        var opt = optionByText('今日关照', CARE_CHECKIN[i]);
        if (!opt) {
          continue;
        }
        var isOn = careOn(opt.id);
        if (isOn) {
          nOnCheck++;
        }
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'jcheck' + (isOn ? ' on' : '');
        chip.setAttribute('data-oid', opt.id);
        chip.appendChild(buildJBox());
        var span = document.createElement('span');
        span.className = 'jcheck-text';
        span.textContent = opt.text;
        chip.appendChild(span);
        checkinBox.appendChild(chip);
      }
      updateCheckTag(nOnCheck);
    }
    if (actBox) {
      clearEl(actBox);
      for (var k = 0; k < CARE_ACT_ROWS.length; k++) {
        var row = CARE_ACT_ROWS[k];
        var opt2 = optionByText('今日关照', row.opt);
        var jr = document.createElement('button');
        jr.type = 'button';
        jr.className = 'jrow jcheck' + (opt2 && careOn(opt2.id) ? ' on' : '');
        if (opt2) {
          jr.setAttribute('data-oid', opt2.id);
        }
        jr.appendChild(buildJBox());
        var main = document.createElement('span');
        main.className = 'jrow-main';
        var bEl = document.createElement('b');
        bEl.textContent = row.label;
        var emEl = document.createElement('em');
        emEl.textContent = row.sub;
        main.appendChild(bEl);
        main.appendChild(emEl);
        jr.appendChild(main);
        actBox.appendChild(jr);
      }
    }
    if (moodBox) {
      clearEl(moodBox);
      var tpl = document.getElementById('tpl-mood-chip');
      var variants = { '还不错': 'happy', '没感觉': 'neutral', '有点难过': 'sad', '想被哄哄': 'hug' };
      for (var m = 0; m < MOOD_TEXTS.length; m++) {
        var mopt = optionByText('今日关照', MOOD_TEXTS[m]);
        if (!mopt || !tpl) {
          continue;
        }
        var clone = document.importNode(tpl.content, true);
        var mbtn = clone.firstElementChild;
        if (!mbtn) {
          continue;
        }
        mbtn.className = 'jcheck mood vf-' + (variants[MOOD_TEXTS[m]] || 'happy') + (careOn(mopt.id) ? ' on' : '');
        mbtn.setAttribute('data-oid', mopt.id);
        var mtext = clone.querySelector('.jcheck-text');
        if (mtext) {
          mtext.textContent = mopt.text;
        }
        moodBox.appendChild(clone);
      }
    }
  }

  function persistCare() {
    if (!db) {
      return;
    }
    var properties = {};
    properties['今日关照'] = { multi_select: [].concat(careSel) };
    if (todayBodyId) {
      db.updateRecord({ databaseId: DATABASE_ID, recordId: todayBodyId, properties: properties }).then(function () {
        scheduleRefresh();
      }).catch(function (err) {
        console.error('[database] 关照打卡失败:', err);
        toast(dbErrMsg(err));
      });
    } else {
      properties['记录类型'] = { select: optionIdByText('记录类型', '身体数据') || '身体数据' };
      properties['日期'] = { date: todayStr() };
      db.addRecord({ databaseId: DATABASE_ID, properties: properties }).then(function () {
        scheduleRefresh();
      }).catch(function (err) {
        console.error('[database] 关照打卡失败:', err);
        toast(dbErrMsg(err));
      });
    }
  }

  function isMoodId(oid) {
    for (var i = 0; i < MOOD_TEXTS.length; i++) {
      var opt = optionByText('今日关照', MOOD_TEXTS[i]);
      if (opt && opt.id === oid) {
        return true;
      }
    }
    return false;
  }

  function handleJournalClick(e) {
    var node = e.target;
    var btn = null;
    var guard = 0;
    while (node && node !== document && guard < 10) {
      if (node.getAttribute && node.getAttribute('data-oid')) {
        btn = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!btn) {
      return;
    }
    var oid = btn.getAttribute('data-oid');
    var idx = careSel.indexOf(oid);
    if (idx === -1) {
      careSel.push(oid);
      var mood = isMoodId(oid);
      if (mood) {
        var kept = [];
        for (var i = 0; i < careSel.length; i++) {
          if (careSel[i] === oid || !isMoodId(careSel[i])) {
            kept.push(careSel[i]);
          }
        }
        careSel = kept;
      }
      if (mood) {
        // 心情是单选，不撒花
        renderCareChips();
        renderTodayHabitChips();
        persistCare();
        return;
      }
      // 成就项：就地点亮 + 播动画，播完再重排
      btn.classList.add('on', 'pop');
      var tk = btn.querySelector('.jbox');
      if (tk) {
        tk.textContent = '\u2713';
      }
      var st2 = todayHabitStats();
      updateCheckTag(st2.done.length);
      celebrateAchv(btn, st2.undone.length === 0);
      renderTodayHabitChips();
      persistCare();
      setTimeout(function () {
        renderCareChips();
      }, 470);
    } else {
      careSel = careSel.filter(function (x) {
        return x !== oid;
      });
      renderCareChips();
      renderTodayHabitChips();
      persistCare();
    }
  }

  function updateMealStatus(items, today) {
    var meals = ['早餐', '午餐', '加餐', '晚餐'];
    var sums = {};
    var hasRec = {};
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type !== 'diet' || it.date !== today) {
        continue;
      }
      var t = selectText('餐次', it.raw['餐次']);
      var known = false;
      for (var q = 0; q < meals.length; q++) {
        if (meals[q] === t) {
          known = true;
        }
      }
      if (!known) {
        continue;
      }
      if (typeof it.raw['摄入热量'] === 'number') {
        sums[t] = (sums[t] || 0) + it.raw['摄入热量'];
      }
      hasRec[t] = true;
    }
    for (var k = 0; k < meals.length; k++) {
      var m = meals[k];
      var el = document.querySelector('[data-meal-status="' + m + '"]');
      if (!el) {
        continue;
      }
      if (hasRec[m]) {
        var rec = menuRecs[m];
        el.textContent = '已记 ' + fmtInt(sums[m]) + ' kcal' + (rec ? ' · 今日推荐 ' + rec + ' kcal' : ' · 记好啦');
        el.className = 'meal-status done';
      } else {
        el.textContent = '还没记，吃完来记一笔～';
        el.className = 'meal-status';
      }
      el.setAttribute('data-sp-bindable', 'database');
      el.setAttribute('data-sp-database-id', DATABASE_ID);
    }
  }

  function renderBrotherNote(next) {
    var el = document.getElementById('brother-note-text');
    if (!el) {
      return;
    }
    if (next) {
      var idx = brotherIdx;
      var tries = 0;
      while (idx === brotherIdx && tries < 20) {
        idx = Math.floor(Math.random() * BROTHER_NOTES.length);
        tries++;
      }
      brotherIdx = idx;
      var note = document.getElementById('brother-note');
      if (note) {
        note.classList.remove('pop');
        note.offsetWidth;
        note.classList.add('pop');
      }
    } else if (brotherIdx < 0) {
      var d = new Date();
      brotherIdx = (d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate()) % BROTHER_NOTES.length;
    }
    el.textContent = BROTHER_NOTES[brotherIdx];
  }

  var HW_DRAFT_PREFIX = 'yabao_hw_draft_';

  function hwDraftKey() {
    return HW_DRAFT_PREFIX + todayStr();
  }

  function fillHeartWords(items, today) {
    var input = document.getElementById('heart-words-input');
    if (!input) {
      return;
    }
    var val = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type !== 'body' || it.date !== today) {
        continue;
      }
      if (it.raw['心里话']) {
        val = String(it.raw['心里话']);
        break;
      }
    }
    if (document.activeElement === input) {
      return;
    }
    if (val) {
      if (input.value !== val) { input.value = val; }
      return;
    }
    // 今天还没寄出过：把本地草稿放回来，别让她白写
    var draft = '';
    try { draft = localStorage.getItem(hwDraftKey()) || ''; } catch (e) {}
    if (draft && input.value !== draft) {
      input.value = draft;
    }
  }

  (function bindHeartWordsDraft() {
    var input = document.getElementById('heart-words-input');
    if (!input) { return; }
    input.addEventListener('input', function () {
      var v = String(this.value || '').trim();
      try {
        if (v) { localStorage.setItem(hwDraftKey(), v); }
        else { localStorage.removeItem(hwDraftKey()); }
      } catch (e) {}
    });
  })();

  function saveHeartWords() {
    if (!db) {
      toast('登录之后才能寄出哦');
      return;
    }
    var input = document.getElementById('heart-words-input');
    if (!input) {
      return;
    }
    var text = String(input.value).trim();
    if (!text) {
      toast('先写一句想说的，哪怕三个字～');
      return;
    }
    var btn = document.getElementById('heart-words-save');
    if (btn) {
      btn.disabled = true;
    }
    var properties = {};
    properties['心里话'] = { text: text.length > 120 ? text.substr(0, 120) : text };
    function onOk() {
      if (btn) {
        btn.disabled = false;
      }
      input.value = '';
      try { localStorage.removeItem(hwDraftKey()); } catch (e) {}
      toast('寄出去啦，哥哥收得到');
      scheduleRefresh();
    }
    function onErr(err) {
      console.error('[database] 心里话保存失败:', err);
      if (btn) {
        btn.disabled = false;
      }
      toast('没寄出去，字还留着，再点一次试试');
    }
    if (todayBodyId) {
      db.updateRecord({ databaseId: DATABASE_ID, recordId: todayBodyId, properties: properties }).then(onOk).catch(onErr);
    } else {
      properties['记录类型'] = { select: optionIdByText('记录类型', '身体数据') || '身体数据' };
      properties['日期'] = { date: todayStr() };
      db.addRecord({ databaseId: DATABASE_ID, properties: properties }).then(onOk).catch(onErr);
    }
  }

  var MENU_NOTES = [
    '热乎的慢慢吃，上午都暖暖的',
    '一荤一素搭着吃，忙起来也香',
    '别按两个人的量煮，一人份刚刚好',
    '吃完靠墙站十分钟，舒服又轻松',
    '细嚼慢咽，尝尝每一口的味道',
    '配一杯温水，胃会谢谢你',
    '今天也要认真吃饭呀',
    '喜欢就多吃两口，不喜欢就换一样',
    '简单的一餐，也是好好的照顾',
    '冷了记得热一热再吃',
    '饿了先吃菜，再吃主食也不迟',
    '吃完记得去"饮食"里记一笔哦'
  ];

  function daySeed() {
    var d = new Date();
    return d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
  }

  function foodGroup(t) {
    for (var i = 0; i < FOOD.length; i++) {
      if (FOOD[i].t === t) {
        return FOOD[i].items;
      }
    }
    return [];
  }

  function pickFood(arr, idx) {
    if (!arr.length) {
      return null;
    }
    var n = arr.length;
    return arr[((idx % n) + n) % n];
  }

  function pickCat(arr, idx, cat) {
    var it = pickFood(arr, idx);
    if (!it) {
      return null;
    }
    return [it[0], it[1], it[2] || 0, it[3] || 0, it[4] || 0, cat];
  }

  function isDairy(name) {
    return name.indexOf('奶') > -1 || name.indexOf('豆浆') > -1;
  }

  function renderDailyMenu() {
    var zhushi = preferOrder(foodGroup('主食'));
    var danbai = preferOrder(foodGroup('蛋白质'));
    var shucai = preferOrder(foodGroup('蔬菜'));
    var shuiguo = preferOrder(foodGroup('水果'));
    if (!zhushi.length || !danbai.length || !shucai.length || !shuiguo.length) {
      return;
    }
    var mainP = [];
    var dairyP = [];
    for (var i = 0; i < danbai.length; i++) {
      if (isDairy(String(danbai[i][0]))) {
        dairyP.push(danbai[i]);
      } else {
        mainP.push(danbai[i]);
      }
    }
    if (!mainP.length) {
      mainP = danbai;
    }
    if (!dairyP.length) {
      dairyP = danbai;
    }
    var s = daySeed();
    var meals = [
      { id: 'bf', key: '早餐', items: [pickCat(zhushi, s * 2 + 1, '主食'), pickCat(mainP, s * 3 + 1, '蛋白'), pickCat(shuiguo, s * 7, '水果')] },
      { id: 'lunch', key: '午餐', items: [pickCat(zhushi, s * 2 + 3, '主食'), pickCat(mainP, s * 3 + 3, '蛋白'), pickCat(shucai, s * 5 + 1, '蔬菜'), pickCat(shucai, s * 5 + 4, '蔬菜')] },
      { id: 'snack', key: '加餐', items: [pickCat(shuiguo, s * 7 + 4, '水果'), pickCat(dairyP, s, '奶豆')] },
      { id: 'dinner', key: '晚餐', items: [pickCat(zhushi, s * 2 + 5, '主食'), pickCat(mainP, s * 3 + 4, '蛋白'), pickCat(shucai, s * 5 + 3, '蔬菜'), pickCat(shucai, s * 5 + 6, '蔬菜')] }
    ];
    menuRecs = {};
    for (var m = 0; m < meals.length; m++) {
      var meal = meals[m];
      var box = document.getElementById('menu-items-' + meal.id);
      var kcalEl = document.getElementById('menu-kcal-' + meal.id);
      var noteEl = document.getElementById('menu-note-' + meal.id);
      var total = 0;
      var names = [];
      var prot = 0;
      if (box) {
        clearEl(box);
      }
      for (var k = 0; k < meal.items.length; k++) {
        var item = meal.items[k];
        if (!item) {
          continue;
        }
        total += item[1];
        prot += (item[2] || 0);
        names.push(item[0]);
        if (box) {
          var cat = item[3] || '';
          var pill = document.createElement('span');
          var pcls = 'dish-pill';
          if (cat === '主食') {
            pcls += ' dp-rose';
          } else if (cat === '蛋白' || cat === '奶豆') {
            pcls += ' dp-blue';
          } else {
            pcls += ' dp-lav';
          }
          pill.className = pcls;
          pill.textContent = item[0];
          box.appendChild(pill);
        }
      }
      menuRecs[meal.key] = total;
      menuData[meal.key] = { names: names, kcal: total, prot: Math.round(prot * 10) / 10 };
      if (kcalEl) {
        kcalEl.textContent = String(total);
      }
      var protEl = document.getElementById('menu-prot-' + meal.id);
      if (protEl) {
        protEl.textContent = '蛋白 ' + fmt1(prot) + 'g';
      }
      if (noteEl) {
        noteEl.textContent = MENU_NOTES[(s * 2 + m * 3) % MENU_NOTES.length];
      }
    }
    var grand = 0;
    for (var g = 0; g < meals.length; g++) {
      grand += menuRecs[meals[g].key] || 0;
    }
    var totalEl = document.getElementById('menu-total');
    if (totalEl) {
      totalEl.textContent = String(grand);
    }
  }

  /* ---------------- 经期联动 ---------------- */

  var PERIOD = { active: false, day: 0 };

  function parseDateStr(s) {
    if (!s || s.length < 10) {
      return null;
    }
    var y = parseInt(s.substr(0, 4), 10);
    var m = parseInt(s.substr(5, 2), 10);
    var d = parseInt(s.substr(8, 2), 10);
    if (!y || !m || !d) {
      return null;
    }
    return new Date(y, m - 1, d).getTime();
  }

  function dayDiff(fromStr, toStr) {
    var a = parseDateStr(fromStr);
    var b = parseDateStr(toStr);
    if (a === null || b === null) {
      return -1;
    }
    return Math.round((b - a) / 86400000);
  }

  function computePeriod(items, today) {
    PERIOD = { active: false, day: 0 };
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.type !== 'body') {
        continue;
      }
      var v = it.raw['经期'];
      if (typeof v !== 'number' || v <= 0) {
        continue;
      }
      var delta = dayDiff(it.date, today);
      if (delta >= 0 && delta <= 8) {
        var day = Math.round(v) + delta;
        if (day < 1) {
          day = 1;
        }
        PERIOD = { active: true, day: day };
      }
      break;
    }
  }

  function applyPeriod(items, today) {
    computePeriod(items, today);
    var chip = document.getElementById('j-period-chip');
    if (chip) {
      chip.textContent = PERIOD.active ? ('经期第 ' + PERIOD.day + ' 天 · 轻一点') : '温柔模式 · 轻一点';
    }
    var note = document.getElementById('care-cycle-note');
    if (note) {
      note.textContent = PERIOD.active ? ('今天经期第 ' + PERIOD.day + ' 天 · 还是轻着来（散步就够了，别跑别跳）') : '今天还是轻着来（散步就够了，别跑别跳）';
    }
    var line = document.getElementById('j-period-line');
    if (line) {
      if (PERIOD.active && PERIOD.day <= 2) {
        line.textContent = '头两天最该赖着 —— 想吃什么热的就做什么，红糖姜茶别断';
      } else if (PERIOD.active && PERIOD.day <= 5) {
        line.textContent = '量少啦，肚肚基本放假 —— 今天一餐就一道菜，简单又不浪费';
      } else if (PERIOD.active) {
        line.textContent = '快结束啦，状态会一点点回来的 —— 这两天怎么舒服怎么来';
      } else {
        line.textContent = '今天也好好吃饭 —— 简单的一餐，也是认真照顾自己';
      }
    }
    var dateLine = document.getElementById('j-date-line');
    if (dateLine) {
      var dp = String(today).split('-');
      if (dp.length === 3) {
        var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(Number(dp[0]), Number(dp[1]) - 1, Number(dp[2])).getDay()];
        var dtxt = dp[0] + '.' + dp[1] + '.' + dp[2] + ' ' + wk;
        dateLine.textContent = PERIOD.active ? (dtxt + ' · 经期第 ' + PERIOD.day + ' 天') : dtxt;
      }
    }
    var totalLine = document.getElementById('care-total-line');
    if (totalLine) {
      totalLine.textContent = PERIOD.active ? ('总时长 约 30 分钟 · 不想动就躺平，第 ' + PERIOD.day + ' 天也是放过自己的一天') : '总时长 约 30 分钟 · 不想动就躺平，今天休息也是训练的一部分';
    }
    var quoteA = document.getElementById('j-quote-a');
    var quoteB = document.getElementById('j-quote-b');
    if (quoteA && quoteB) {
      if (PERIOD.active && PERIOD.day <= 2) {
        quoteA.textContent = '头两天慢慢来，不舒服就多躺着。';
        quoteB.textContent = '吃点热乎的，肚肚会舒服很多 —— 红糖姜茶别断';
      } else if (PERIOD.active && PERIOD.day <= 5) {
        quoteA.textContent = '经期尾声啦，状态会一点点回来的。';
        quoteB.textContent = '一餐一道菜也是好好吃饭 —— 锅小，心意一点不少';
      } else if (PERIOD.active) {
        quoteA.textContent = '快过去啦，力气会慢慢回来的。';
        quoteB.textContent = '这两天的清淡和规律，身体都记得';
      } else {
        quoteA.textContent = '今天也在认真照顾自己呀。';
        quoteB.textContent = '简单的一餐，也是好好吃饭 —— 锅小，心意一点不少';
      }
    }
    var input = document.querySelector('#form-body [name="f-period"]');
    if (input && !input.value && PERIOD.active && document.activeElement !== input) {
      input.value = String(PERIOD.day);
    }
  }

  var BIG_BANG = [
    { n: '番茄滑蛋燕麦碗', k: 350, p: 22, d: '燕麦 40g + 番茄 1 个 + 鸡蛋 2 个 + 菠菜一小把', s: '番茄炒出沙，蛋液滑进去，酸甜裹着麦香，热乎乎一锅端' },
    { n: '鸡胸彩椒杂粮碗', k: 410, p: 32, d: '杂粮饭 1 碗 + 鸡胸肉 100g + 彩椒 1 个 + 西兰花 100g', s: '红黄绿配色先赢一半，鸡胸煎出焦边，拌着杂粮饭超满足' },
    { n: '香蕉酸奶全麦吐司', k: 330, p: 14, d: '全麦面包 2 片 + 无糖酸奶 1 杯 + 香蕉半根', s: '吐司烤到微微焦，抹上酸奶铺香蕉片，甜得刚刚好' },
    { n: '番茄豆腐蔬菜煲', k: 370, p: 19, d: '嫩豆腐 1 盒 + 番茄 2 个 + 蘑菇 100g + 青菜 + 杂粮饭 1 碗', s: '红汤咕嘟咕嘟，豆腐吸饱番茄汁，拌饭一绝' },
    { n: '牛肉杏鲍菇焖饭', k: 450, p: 28, d: '瘦牛肉 100g + 杏鲍菇 1 根 + 胡萝卜半根 + 米 80g', s: '电饭煲一键的懒人智慧：牛肉滑嫩、菇子鲜香，一锅端走' },
    { n: '鸡腿土豆胡萝卜煲', k: 340, p: 30, d: '去皮鸡腿 1 块 + 土豆 1 个 + 胡萝卜半根 + 西兰花', s: '炖到土豆起沙，汤汁收得亮亮的，暖胃又有力' },
    { n: '咖喱鸡肉杂蔬锅', k: 340, p: 28, d: '鸡胸肉 100g + 土豆 1 个 + 胡萝卜半根 + 洋葱半个 + 咖喱粉', s: '金黄色的一锅，香料味一飘，米饭都要多盛半碗（就半碗）' },
    { n: '番茄鸡蛋荞麦面', k: 480, p: 24, d: '荞麦面 1 碗 + 番茄 2 个 + 鸡蛋 2 个 + 小青菜', s: '国民搭配永远的神：酸甜汤底，蛋花软嫩，面滑溜溜' },
    { n: '香菇滑蛋蒸鸡', k: 350, p: 30, d: '鸡蛋 2 个 + 鸡胸肉 50g + 香菇 3 朵 + 杂粮饭半碗', s: '上锅一蒸就嫩得发抖，香菇的鲜全在里面，清淡但一点不寡' },
    { n: '紫薯燕麦牛奶糊', k: 360, p: 14, d: '紫薯 1 个 + 燕麦 30g + 牛奶 250ml', s: '梦幻紫色的一碗，浓稠拉丝，甜是紫薯自己的甜' },
    { n: '牛油果鸡蛋全麦卷', k: 360, p: 15, d: '全麦卷饼 1 张 + 鸡蛋 1 个 + 牛油果半个 + 生菜', s: '卷起来咬一口，绵密加清爽，早餐界的文艺片' },
    { n: '番茄牛肉豆腐煲', k: 430, p: 26, d: '牛肉片 80g + 嫩豆腐半盒 + 番茄 2 个 + 金针菇 + 杂粮饭 1 碗', s: '番茄熬出浓汤，牛肉最后烫熟，酸香滚烫，抱着锅吃' },
    { n: '香菇鸡丝青菜粥', k: 320, p: 20, d: '米 60g + 鸡胸肉 50g + 香菇 2 朵 + 小青菜', s: '熬到米开花，鸡丝和香菇的香缠在一起，胃在说谢谢' },
    { n: '菠菜蘑菇蛋饼', k: 300, p: 23, d: '鸡蛋 2 个 + 菠菜一小把 + 蘑菇 100g + 全麦面粉 30g', s: '绿油油的蛋饼卷起来切段，配一杯豆浆就是完整早晨' },
    { n: '南瓜小米粥套餐', k: 290, p: 14, d: '南瓜 200g + 小米 40g + 水煮蛋 1 个 + 凉拌黄瓜', s: '金黄的粥配脆生生黄瓜，清清淡淡，舒服得像晒太阳' },
    { n: '彩虹鸡肉红薯碗', k: 330, p: 30, d: '红薯 1 个 + 鸡胸肉 100g + 紫甘蓝 + 西兰花', s: '紫的绿的橙的凑一碗，看着就开心，蛋白还管够' }
,
,
      { n: '嫩豆腐鸡蛋杂粮炒饭', k: 430, p: 24, d: '杂粮饭 1 碗 + 嫩豆腐 150g + 鸡蛋 1 个 + 玉米粒', s: '嫩豆腐煎到金黄再下锅，粒粒分明，越嚼越香' },
      { n: '圣女果酸奶燕麦杯', k: 270, p: 12, d: '无糖酸奶 1 杯 + 圣女果 10 颗 + 燕麦 30g', s: '免开火！圣女果切半铺在酸奶上，分层装杯美到舍不得拌' }
  ];

  function renderBigBang() {
    var box = document.getElementById('big-bang-body');
    if (!box) {
      return;
    }
    var s = daySeed();
    var n = BIG_BANG.length;
    clearEl(box);
    var picked = {};
    var count = 0;
    var i = 0;
    while (count < 3 && i < n) {
      var idx = (s + i * 5) % n;
      if (!picked[idx]) {
        picked[idx] = true;
        count++;
        var r = BIG_BANG[idx];
        var item = document.createElement('div');
        item.className = 'bb-item';
        var title = document.createElement('p');
        title.className = 'bb-title';
        var name = document.createElement('b');
        name.textContent = r.n;
        var meta = document.createElement('span');
        meta.className = 'bb-meta';
        meta.textContent = r.k + ' kcal · 蛋白 ' + r.p + 'g';
        title.appendChild(name);
        title.appendChild(meta);
        var ing = document.createElement('p');
        ing.className = 'bb-ing';
        ing.textContent = r.d;
        var note = document.createElement('p');
        note.className = 'bb-note';
        note.textContent = r.s;
        item.appendChild(title);
        item.appendChild(ing);
        item.appendChild(note);
        box.appendChild(item);
      }
      i++;
    }
  }

  function renderJournal(items, today) {
    careSel = careStateFromItems(items, today);
    renderCareChips();
    updateJournalTabDot();
    applyPeriod(items, today);
    updateMealStatus(items, today);
    renderDailyTips();
    renderBigBang();
    renderBrotherNote(false);
    fillHeartWords(items, today);
  }

  function bindJournal() {
    var view = document.getElementById('view-journal');
    if (view) {
      view.addEventListener('click', handleJournalClick);
    }
    var btn = document.getElementById('brother-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        renderBrotherNote(true);
      });
    }
    var saveBtn = document.getElementById('heart-words-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveHeartWords);
    }
  }

  /* ---------------- 今日表情 ---------------- */

  var FACES = [
    { t: '笑出小牙', l: '看到好吃的就开心，简单又真诚' },
    { t: '气鼓鼓', l: '不开心先哄哄自己，三十秒就好' },
    { t: '呼呼大睡', l: '睡够觉是头等养生，谁也别叫我' },
    { t: '惊到下巴', l: '世界这么大，总有新鲜事好玩' },
    { t: '悄悄掉眼泪', l: '难过就哭一小会儿，哭完喝口温水' },
    { t: '小得意', l: '有点小成绩，允许自己骄傲三十秒' },
    { t: '优雅翻白眼', l: '今天不想理的人和事，退到三米外' },
    { t: '害羞软软', l: '被夸就脸红，但心里偷偷开心' },
    { t: '元气点赞', l: '给努力的自己比个赞，今天也很棒' }
  ];
  var faceIdx = -1;

  function renderFaceCard(next) {
    var big = document.getElementById('face-big');
    var title = document.getElementById('face-title');
    var line = document.getElementById('face-line');
    if (!big || !title || !line) {
      return;
    }
    if (next) {
      faceIdx = (faceIdx + 1) % FACES.length;
    } else if (faceIdx < 0) {
      faceIdx = daySeed() % FACES.length;
    }
    var f = FACES[faceIdx];
    big.className = 'face-big face-img fx-' + (faceIdx + 1);
    title.textContent = f.t;
    line.textContent = f.l;
    if (next) {
      var stage = document.getElementById('face-stage');
      if (stage) {
        stage.classList.remove('pop');
        stage.offsetWidth;
        stage.classList.add('pop');
      }
    }
  }

  function setupFaceCard() {
    renderFaceCard(false);
    var card = document.getElementById('face-card');
    if (card) {
      card.addEventListener('click', function () {
        renderFaceCard(true);
      });
    }
  }

  /* ---------------- 联动 ---------------- */

  function setMealSelect(mealText) {
    var sel = document.querySelector('#form-diet [name="f-meal"]');
    var opt = optionByText('餐次', mealText);
    if (sel && opt) {
      sel.value = opt.id;
    }
    syncMealPick();
  }

  function guessMealSelect() {
    var sel = document.querySelector('#form-diet [name="f-meal"]');
    if (!sel || sel.value) {
      return;
    }
    var h = new Date().getHours();
    var want = '加餐';
    if (h < 10) {
      want = '早餐';
    } else if (h < 14) {
      want = '午餐';
    } else if (h < 17) {
      want = '加餐';
    } else if (h < 21) {
      want = '晚餐';
    }
    setMealSelect(want);
  }

  function flashEl(el) {
    if (!el) {
      return;
    }
    el.classList.remove('flash-once');
    el.offsetWidth;
    el.classList.add('flash-once');
  }

  function handleJumpClick(e) {
    var node = e.target;
    var t = null;
    var guard = 0;
    while (node && node !== document && guard < 10) {
      if (node.getAttribute && node.getAttribute('data-jump')) {
        t = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!t) {
      return;
    }
    var act = t.getAttribute('data-jump');
    if (act === 'weight') {
      switchTab('trend');
      focusField('form-body', 'f-weight');
    } else if (act === 'meal') {
      switchTab('diet');
      guessMealSelect();
      focusField('form-diet', 'f-food');
    } else if (act === 'sport') {
      switchTab('sport');
      focusField('form-sport', 'f-ex-item');
    } else if (act === 'diet') {
      switchTab('diet');
    } else if (act === 'mood') {
      switchTab('journal');
      var mood = document.getElementById('journal-mood');
      if (mood) {
        setTimeout(function () {
          if (mood.scrollIntoView) {
            mood.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          flashEl(mood);
        }, 80);
      }
    }
  }

  function handleMenuLogClick(e) {
    var node = e.target;
    var t = null;
    var guard = 0;
    while (node && node !== document && guard < 10) {
      if (node.getAttribute && node.getAttribute('data-menu-log')) {
        t = node;
        break;
      }
      node = node.parentNode;
      guard++;
    }
    if (!t) {
      return;
    }
    var meal = t.getAttribute('data-menu-log');
    var data = menuData[meal];
    if (!data) {
      return;
    }
    switchTab('diet');
    setMealSelect(meal);
    var foodEl = document.querySelector('#form-diet [name="f-food"]');
    var kcalEl = document.querySelector('#form-diet [name="f-kcal-in"]');
    if (foodEl) {
      foodEl.value = data.names.join(' + ');
    }
    if (kcalEl) {
      kcalEl.value = String(data.kcal);
    }
    var protInput = document.querySelector('#form-diet [name="f-protein"]');
    if (protInput) {
      protInput.value = String(data.prot || 0);
    }
    saveDraftSoon('form-diet');
    toast('按手账菜单帮你填好啦，确认一下就能记');
    focusField('form-diet', 'f-food');
  }

  /* ================= 饮食页 · 营养中枢 ================= */

  /* 收集今天的饮食/运动，算出三大营养素实况 */
  function todayMacroState(items, today) {
    var diet = [];
    var sport = [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].date !== today) {
        continue;
      }
      if (items[i].type === 'diet') {
        diet.push(items[i]);
      } else if (items[i].type === 'sport') {
        sport.push(items[i]);
      }
    }
    var inKcal = sumField(diet, '摄入热量');
    var inP = sumField(diet, '蛋白质');
    var nowW = currentWeight(items);
    var budget = budgetInfo(nowW);
    var target = budget ? macroTarget(budget.suggest, nowW) : null;

    var logged = {};
    var anyLogged = false;
    for (var d = 0; d < diet.length; d++) {
      var mk = diet[d].raw ? selectText('餐次', diet[d].raw['餐次']) : '';
      if (mk) {
        logged[mk] = true;
        anyLogged = true;
      }
    }

    /* 已记录的餐次：用当日该餐食谱推算碳水脂肪 */
    var estK = 0;
    var estP = 0;
    var estC = 0;
    var estF = 0;
    var planK = 0;
    var planP = 0;
    var planC = 0;
    var planF = 0;
    for (var m = 0; m < MEAL_SLOTS.length; m++) {
      var key = MEAL_SLOTS[m].key;
      var rec = todayRecipe(key);
      if (!rec) {
        continue;
      }
      var n = calcRecipe(rec);
      planK += n.kcal;
      planP += n.p;
      planC += n.c;
      planF += n.f;
      if (logged[key]) {
        estK += n.kcal;
        estP += n.p;
        estC += n.c;
        estF += n.f;
      }
    }

    var st = {
      mode: anyLogged ? 'logged' : 'preview',
      inKcal: inKcal,
      inP: inP,
      diet: diet,
      sport: sport,
      budget: budget,
      target: target,
      weight: nowW,
      plan: { kcal: Math.round(planK), p: Math.round(planP * 10) / 10, c: Math.round(planC * 10) / 10, f: Math.round(planF * 10) / 10 },
      logged: logged
    };

    if (anyLogged) {
      /* 蛋白取真实记录；脂肪按食谱估算；碳水用剩余热量反推，保证三者供能之和 = 实际摄入 */
      st.kcal = inKcal;
      st.p = inP;
      st.f = Math.round(estF * 10) / 10;
      var restK = inKcal - inP * 4 - st.f * 9;
      st.c = restK > 0 ? Math.round(restK / 4 * 10) / 10 : 0;
    } else {
      st.kcal = st.plan.kcal;
      st.p = st.plan.p;
      st.c = st.plan.c;
      st.f = st.plan.f;
    }
    return st;
  }

  /* 画三色环：弧长 = 真实供能比 */
  function drawMacroRing(st) {
    var R = 44;
    var C = 2 * Math.PI * R;
    var segP = document.getElementById('mr-seg-p');
    var segC = document.getElementById('mr-seg-c');
    var segF = document.getElementById('mr-seg-f');
    if (!segP || !segC || !segF) {
      return;
    }
    var pk = st.p * 4;
    var ck = st.c * 4;
    var fk = st.f * 9;
    var sum = pk + ck + fk;
    if (sum <= 0 || st.kcal <= 0) {
      segP.style.strokeDasharray = '0 ' + C;
      segC.style.strokeDasharray = '0 ' + C;
      segF.style.strokeDasharray = '0 ' + C;
      return;
    }
    var lp = pk / sum * C;
    var lc = ck / sum * C;
    var lf = fk / sum * C;
    segP.style.strokeDasharray = lp + ' ' + (C - lp);
    segP.style.strokeDashoffset = '0';
    segC.style.strokeDasharray = lc + ' ' + (C - lc);
    segC.style.strokeDashoffset = String(-lp);
    segF.style.strokeDasharray = lf + ' ' + (C - lf);
    segF.style.strokeDashoffset = String(-(lp + lc));
  }

  function macroRow(name, key, val, goal) {
    var wrap = document.createElement('div');
    wrap.className = 'mrow';
    var top = document.createElement('div');
    top.className = 'mrow-top';
    var dot = document.createElement('span');
    dot.className = 'mrow-dot ' + key;
    var nm = document.createElement('span');
    nm.className = 'mrow-name';
    nm.textContent = name;
    var v = document.createElement('span');
    v.className = 'mrow-val';
    v.textContent = (Math.round(val * 10) / 10) + 'g';
    var g = document.createElement('span');
    g.className = 'mrow-goal';
    g.textContent = goal ? '/ ' + goal + 'g' : '';
    top.appendChild(dot);
    top.appendChild(nm);
    top.appendChild(g);
    top.appendChild(v);
    wrap.appendChild(top);
    var bar = document.createElement('div');
    bar.className = 'mrow-bar ' + key;
    var fill = document.createElement('i');
    bar.appendChild(fill);
    wrap.appendChild(bar);
    var tag = document.createElement('p');
    tag.className = 'mrow-tag';
    wrap.appendChild(tag);
    if (goal && goal > 0) {
      var pct = val / goal * 100;
      if (pct > 100) {
        pct = 100;
      }
      fill.style.width = pct + '%';
      if (val / goal < 0.5) {
        tag.textContent = '还差 ' + Math.round((goal - val) * 10) / 10 + 'g';
      } else if (val / goal < 0.85) {
        tag.textContent = '再补 ' + Math.round((goal - val) * 10) / 10 + 'g';
      } else if (val / goal <= 1.15) {
        tag.textContent = '刚刚好';
        tag.className = 'mrow-tag good';
      } else {
        tag.textContent = '超了 ' + Math.round((val - goal) * 10) / 10 + 'g';
        tag.className = 'mrow-tag over';
      }
    } else {
      tag.textContent = '设置资料后给出目标';
    }
    return wrap;
  }

  function renderNutrition(items, today) {
    var st = todayMacroState(items, today);
    var kcalEl = document.getElementById('mr-kcal');
    var subEl = document.getElementById('mr-sub');
    var rowsEl = document.getElementById('macro-rows');
    var noteEl = document.getElementById('macro-note');
    var tagEl = document.getElementById('macro-tag');
    if (kcalEl) {
      kcalEl.textContent = st.kcal > 0 ? String(Math.round(st.kcal)) : '--';
    }
    if (subEl) {
      subEl.textContent = st.mode === 'logged' ? '已吃' : '今日食谱';
    }
    if (tagEl) {
      tagEl.textContent = st.mode === 'logged' ? '已记录的构成' : '按今日食谱算';
    }
    drawMacroRing(st);
    if (rowsEl) {
      clearEl(rowsEl);
      var tg = st.target;
      rowsEl.appendChild(macroRow('蛋白质', 'p', st.p, tg ? tg.p : 0));
      rowsEl.appendChild(macroRow('碳水化合物', 'c', st.c, tg ? tg.c : 0));
      rowsEl.appendChild(macroRow('脂肪', 'f', st.f, tg ? tg.f : 0));
    }
    if (noteEl) {
      if (st.mode === 'preview') {
        noteEl.textContent = '照今日四餐吃，一天约 ' + st.plan.kcal + ' kcal · 蛋白 ' + st.plan.p + 'g';
      } else {
        var tg2 = st.target;
        if (tg2) {
          noteEl.textContent = '蛋白目标 ' + tg2.p + 'g · 还差 ' + Math.max(0, Math.round((tg2.p - st.p) * 10) / 10) + 'g 就到啦';
        } else {
          noteEl.textContent = '填上身高体重，目标才算得准';
        }
      }
    }
    return st;
  }

  /* ---------- 今日四餐食谱 ---------- */
  var MEAL_ICON = { '早餐': '🌅', '午餐': '🍱', '加餐': '🍎', '晚餐': '🌙' };
  var MEAL_CLS = { '早餐': 'bf', '午餐': 'lunch', '加餐': 'snack', '晚餐': 'dinner' };

  function renderTodayRecipes(items, today) {
    var box = document.getElementById('today-recipes');
    if (!box) {
      return;
    }
    var state = todayMacroState(items, today);
    clearEl(box);
    var totalK = 0;
    var totalP = 0;
    for (var i = 0; i < MEAL_SLOTS.length; i++) {
      var meal = MEAL_SLOTS[i];
      var rec = todayRecipe(meal.key);
      if (!rec) {
        continue;
      }
      var n = calcRecipe(rec);
      totalK += n.kcal;
      totalP += n.p;
      menuData[meal.key] = { names: n.names, kcal: n.kcal, prot: n.p };

      var card = document.createElement('div');
      card.className = 'rc-card ' + MEAL_CLS[meal.key];

      var head = document.createElement('div');
      head.className = 'rc-head';
      var emo = document.createElement('span');
      emo.className = 'rc-emo';
      emo.textContent = MEAL_ICON[meal.key] || '🍽';
      var title = document.createElement('div');
      title.className = 'rc-title';
      var tb = document.createElement('b');
      tb.textContent = meal.key + ' · ' + rec.name;
      var ts = document.createElement('span');
      ts.textContent = meal.time;
      title.appendChild(tb);
      title.appendChild(ts);
      var kb = document.createElement('div');
      kb.className = 'rc-kcal';
      var kn = document.createElement('b');
      kn.textContent = String(n.kcal);
      var ku = document.createElement('span');
      ku.textContent = 'kcal';
      var ke = document.createElement('em');
      ke.textContent = '蛋白 ' + (Math.round(n.p * 10) / 10) + 'g';
      kb.appendChild(kn);
      kb.appendChild(ku);
      kb.appendChild(ke);
      head.appendChild(emo);
      head.appendChild(title);
      head.appendChild(kb);
      card.appendChild(head);

      var its = document.createElement('div');
      its.className = 'rc-items';
      for (var j = 0; j < n.lines.length; j++) {
        var pill = document.createElement('span');
        pill.className = 'rc-item';
        var ic = document.createElement('i');
        ic.textContent = n.lines[j].emoji;
        pill.appendChild(ic);
        pill.appendChild(document.createTextNode(n.lines[j].label));
        its.appendChild(pill);
      }
      card.appendChild(its);

      var mk = n.p * 4;
      var mc = n.c * 4;
      var mf = n.f * 9;
      var sum = mk + mc + mf || 1;
      var mb = document.createElement('div');
      mb.className = 'rc-macro';
      var sp = document.createElement('i');
      sp.className = 'p';
      sp.style.width = (mk / sum * 100) + '%';
      var sc = document.createElement('i');
      sc.className = 'c';
      sc.style.width = (mc / sum * 100) + '%';
      var sf = document.createElement('i');
      sf.className = 'f';
      sf.style.width = (mf / sum * 100) + '%';
      mb.appendChild(sp);
      mb.appendChild(sc);
      mb.appendChild(sf);
      card.appendChild(mb);

      var lg = document.createElement('div');
      lg.className = 'rc-legend';
      lg.textContent = '蛋白 ' + n.p + 'g · 碳水 ' + n.c + 'g · 脂肪 ' + n.f + 'g';
      card.appendChild(lg);

      if (rec.tip) {
        var tp = document.createElement('p');
        tp.className = 'rc-tip';
        tp.textContent = rec.tip;
        card.appendChild(tp);
      }

      var foot = document.createElement('div');
      foot.className = 'rc-foot';
      var stp = document.createElement('p');
      var isDone = !!state.logged[meal.key];
      stp.className = 'rc-status' + (isDone ? ' done' : '');
      stp.textContent = isDone ? '已经记下啦 ✓' : '吃完点右边，账自动记好';
      var btn = document.createElement('button');
      btn.className = 'rc-btn';
      btn.type = 'button';
      btn.setAttribute('data-recipe-log', meal.key);
      btn.textContent = isDone ? '再记一次' : '照这个吃';
      foot.appendChild(stp);
      foot.appendChild(btn);
      card.appendChild(foot);

      box.appendChild(card);
    }
    var cap = document.getElementById('rday-cap');
    if (cap) {
      var tg = state.target;
      var tail = tg ? ' · 你的目标 ' + tg.kcal + ' kcal / 蛋白 ' + tg.p + 'g' : '';
      cap.textContent = '今日四餐合计约 ' + totalK + ' kcal · 蛋白 ' + (Math.round(totalP * 10) / 10) + 'g' + tail;
    }
    var rtag = document.getElementById('recipe-tag');
    if (rtag) {
      var dd = new Date();
      rtag.textContent = (dd.getMonth() + 1) + '/' + dd.getDate() + ' 菜单 · 每天自动换';
    }
  }

  /* ---------- 今日热量收支 ---------- */
  function renderEnergyBalance(items, today) {
    var st = todayMacroState(items, today);
    var inKcal = st.inKcal;
    var burnKcal = sumField(st.sport, '消耗热量');
    var budget = st.budget;
    var outKcal = budget ? budget.tdee + burnKcal : 0;
    var inBar = document.getElementById('eb-in-bar');
    var outBar = document.getElementById('eb-out-bar');
    var inNum = document.getElementById('eb-in-num');
    var outNum = document.getElementById('eb-out-num');
    var gapEl = document.getElementById('eb-gap');
    var gapNote = document.getElementById('eb-gap-note');
    var splitEl = document.getElementById('eb-split');
    var moveEl = document.getElementById('eb-move');

    if (inNum) {
      inNum.textContent = inKcal > 0 ? Math.round(inKcal) + ' kcal' : '0 kcal';
    }
    if (outNum) {
      outNum.textContent = outKcal > 0 ? Math.round(outKcal) + ' kcal' : '--';
    }
    var maxV = Math.max(inKcal, outKcal, 1);
    if (inBar) {
      inBar.style.width = (inKcal / maxV * 100) + '%';
    }
    if (outBar) {
      outBar.style.width = outKcal > 0 ? (outKcal / maxV * 100) + '%' : '0%';
    }

    if (gapEl && gapNote) {
      if (!budget) {
        gapEl.textContent = '--';
        gapNote.textContent = '填上身高体重，就能算出每天的账';
      } else {
        var gap = Math.round(outKcal - inKcal);
        gapEl.textContent = (gap >= 0 ? '-' : '+') + Math.abs(gap) + ' kcal';
        if (gap < 0) {
          gapNote.textContent = '今天吃超了一点，明天清淡些就好，别自责';
        } else if (gap > 600) {
          gapNote.textContent = '缺口有点大，记得吃够基础营养呀';
        } else if (gap >= 200) {
          gapNote.textContent = '今天的热量缺口刚刚好，稳住这个节奏';
        } else if (st.mode === 'preview') {
          gapNote.textContent = '按今日食谱吃，缺口约 ' + Math.round(budget.tdee + burnKcal - st.plan.kcal) + ' kcal';
        } else {
          gapNote.textContent = '有缺口就是在瘦的路上，继续';
        }
      }
    }

    if (splitEl) {
      clearEl(splitEl);
      if (budget) {
        var parts = [
          ['基础代谢', Math.round(budget.bmr)],
          ['日常活动', Math.round(budget.tdee - budget.bmr)],
          ['今天运动', Math.round(burnKcal)]
        ];
        for (var i = 0; i < parts.length; i++) {
          var sp = document.createElement('span');
          sp.textContent = parts[i][0] + ' ';
          var b = document.createElement('b');
          b.textContent = parts[i][1] + ' kcal';
          sp.appendChild(b);
          splitEl.appendChild(sp);
        }
      } else {
        splitEl.textContent = '设置个人资料后，这里会拆开算给你看';
      }
    }

    if (moveEl) {
      clearEl(moveEl);
      var line1 = document.createElement('div');
      if (st.sport.length) {
        var names = [];
        var mins = 0;
        for (var s = 0; s < st.sport.length; s++) {
          var rw = st.sport[s].raw || {};
          var nm = selectText('运动类型', rw['运动类型']) || '运动';
          names.push(nm);
          var mm = rw['运动时长'];
          if (typeof mm === 'number') {
            mins += mm;
          }
        }
        line1.innerHTML = '';
        line1.appendChild(document.createTextNode('今天动了：'));
        var b1 = document.createElement('b');
        b1.textContent = names.join('、');
        line1.appendChild(b1);
        line1.appendChild(document.createTextNode(mins > 0 ? ' ' + mins + ' 分钟' : ''));
        if (burnKcal > 0) {
          line1.appendChild(document.createTextNode(' · 消耗 '));
          var b2 = document.createElement('b');
          b2.textContent = Math.round(burnKcal) + ' kcal';
          line1.appendChild(b2);
        }
      } else {
        var sug = CARE_ACT_ROWS && CARE_ACT_ROWS.length ? CARE_ACT_ROWS[0] : null;
        var est = 0;
        if (sug && st.weight && st.weight > 0) {
          est = Math.round(3.0 * 3.5 * st.weight / 200 * 20);
        }
        line1.className = 'mv-none';
        line1.appendChild(document.createTextNode('今天还没动 · 建议：'));
        var b3 = document.createElement('b');
        b3.textContent = sug ? sug.label + '（' + sug.sub + '）' : '慢走 20 分钟';
        line1.appendChild(b3);
        if (est > 0) {
          line1.appendChild(document.createTextNode(' 约 ' + est + ' kcal'));
        }
      }
      moveEl.appendChild(line1);
    }
  }

  /* ---------- 怎么吃更健康 · 动态建议 ---------- */
  var SWAP_TIPS = [
    '主食换一半：白米饭 → 杂粮饭或红薯，同样饱，血糖更稳',
    '肉类挑瘦的：鸡胸、牛里脊比五花肉每 100g 少 150 kcal 以上',
    '蔬菜先上桌：先吃一盘青菜再动筷子，正餐自然少吃两口',
    '喝够水：有时候以为饿，其实是渴了，先喝一杯温水等 10 分钟',
    '水果整颗吃：别打成果汁，纤维没了、糖还吸收更快',
    '外食挑做法：点单看到"红烧、糖醋、干锅"，换成"清蒸、白灼、凉拌"'
  ];

  function renderSmartTips(items, today) {
    var box = document.getElementById('smart-tips');
    if (!box) {
      return;
    }
    var st = todayMacroState(items, today);
    clearEl(box);
    var tips = [];

    function add(icon, text, cls) {
      tips.push({ icon: icon, text: text, cls: cls || '' });
    }

    var tg = st.target;
    if (!tg) {
      add('📝', '先在「个人资料」里填上身高体重年龄，我才能按你的身体算目标');
    } else {
      if (st.mode === 'preview') {
        add('🍽', '今天四餐已经配好，合计约 ' + st.plan.kcal + ' kcal，照着吃就很稳', 'good');
      } else {
        /* 蛋白 */
        if (st.p < tg.p * 0.6) {
          add('🥚', '蛋白还差 ' + Math.round(tg.p - st.p) + 'g —— 加一个水煮蛋(6.5g)或一杯牛奶(7.5g)就补上一大截', 'warn');
        } else if (st.p >= tg.p * 0.9) {
          add('💪', '蛋白吃得很到位，肌肉保住了，减的才是脂肪', 'good');
        }
        /* 脂肪 */
        if (st.f > tg.f * 1.25) {
          add('🫒', '今天脂肪偏多，坚果减半、炒菜少放半勺油，轻松省 100 kcal', 'warn');
        }
        /* 碳水 */
        if (st.c > tg.c * 1.25) {
          add('🍚', '碳水偏多了些，晚餐主食换成红薯或玉米，饱腹还不涨秤', 'warn');
        }
        /* 热量 */
        if (st.budget && st.inKcal > st.budget.suggest) {
          add('⚖️', '今天超出目标 ' + Math.round(st.inKcal - st.budget.suggest) + ' kcal，明天清淡一天就补回来了', 'warn');
        } else if (st.budget && st.inKcal > 0) {
          var gap = st.budget.tdee + sumField(st.sport, '消耗热量') - st.inKcal;
          if (gap >= 200 && gap <= 600) {
            add('🎯', '热量缺口刚刚好，这个速度最不容易反弹', 'good');
          }
        }
        /* 餐数 */
        var doneMeals = 0;
        for (var k in st.logged) {
          if (st.logged.hasOwnProperty(k) && st.logged[k]) {
            doneMeals++;
          }
        }
        if (doneMeals > 0 && doneMeals < 4) {
          add('⏰', '还有 ' + (4 - doneMeals) + ' 餐没记，别跳餐 —— 跳餐容易下一餐报复性吃多');
        }
      }
      /* 每天轮换一条实用技巧 */
      var s = daySeed();
      add('💡', SWAP_TIPS[s % SWAP_TIPS.length]);
    }

    for (var i = 0; i < tips.length && i < 3; i++) {
      var row = document.createElement('div');
      row.className = 'tip-item ' + tips[i].cls;
      var ic = document.createElement('span');
      ic.className = 'ti-ic';
      ic.textContent = tips[i].icon;
      var tx = document.createElement('span');
      tx.textContent = tips[i].text;
      row.appendChild(ic);
      row.appendChild(tx);
      box.appendChild(row);
    }
  }

  /* ---------- 点「照这个吃」：填表并滚过去 ---------- */
  function handleRecipeLog(mealKey) {
    var data = menuData[mealKey];
    if (!data) {
      return;
    }
    switchTab('diet');
    setMealSelect(mealKey);
    var foodEl = document.querySelector('#form-diet [name="f-food"]');
    var kcalEl = document.querySelector('#form-diet [name="f-kcal-in"]');
    var protEl = document.querySelector('#form-diet [name="f-protein"]');
    if (foodEl) {
      foodEl.value = data.names.join(' + ');
    }
    if (kcalEl) {
      kcalEl.value = String(data.kcal);
    }
    if (protEl) {
      protEl.value = String(data.prot || 0);
    }
    saveDraftSoon('form-diet');
    var form = document.getElementById('form-diet');
    if (form && form.scrollIntoView) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    toast('按今日食谱填好啦，确认一下就能记');
    focusField('form-diet', 'f-food');
  }

  function updateJournalTabDot() {
    var tab = document.querySelector('.tab[data-tab="journal"]');
    if (!tab) {
      return;
    }
    if (careSel.length === 0) {
      tab.classList.add('has-dot');
    } else {
      tab.classList.remove('has-dot');
    }
  }

  function bindNutritionUI() {
    document.addEventListener('click', function (e) {
      var node = e.target;
      var guard = 0;
      while (node && node !== document && guard < 10) {
        if (node.getAttribute) {
          var mk = node.getAttribute('data-recipe-log');
          if (mk) {
            handleRecipeLog(mk);
            return;
          }
          if (node.getAttribute('data-jump-diet')) {
            switchTab('diet');
            var first = document.getElementById('today-recipes');
            if (first && first.scrollIntoView) {
              first.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
          }
        }
        node = node.parentNode;
        guard++;
      }
    });
  }

  function bindLinkage() {
    document.addEventListener('click', handleJumpClick);
    document.addEventListener('click', handleMenuLogClick);
    document.addEventListener('click', handleMealSlotClick);
    var mealPick = document.getElementById('meal-pick');
    if (mealPick) {
      mealPick.addEventListener('click', handleMealPickClick);
    }
  }

  /* ---------------- 初始化 ---------------- */

  function loadProfile() {
    try {
      var raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        PROFILE = JSON.parse(raw);
      }
    } catch (err) {
      PROFILE = null;
    }
  }

  function extractSchema(schema) {
    var list = (schema && schema.properties) || [];
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (p && p.config && p.config.options) {
        SCHEMA_OPTIONS[p.name] = p.config.options;
      }
    }
  }

  function init() {
    bindUI();
    bindRefreshBtn();
    bindPullRefresh();
    bindAutoRefresh();
    
    bindJournal();
    setupFaceCard();
    bindLinkage();
    bindNutritionUI();
    bindSportUI();
    setDateDefaults();
    loadProfile();
    fillSettingsForm();
    updateCalcPreview();
    renderFoodChips();
    renderAll();
    foldJournalExtras();

    if (!db) {
      if (window.__hideSkeleton) { window.__hideSkeleton(); }
      var lb = document.getElementById('loading-bar');
      if (lb) {
        lb.hidden = false;
        lb.textContent = '请从工作台入口打开：登录后数据会自动同步过来';
      }
      var ids = ['today-list', 'body-list', 'diet-list', 'sport-list'];
      for (var i = 0; i < ids.length; i++) {
        var box = document.getElementById(ids[i]);
        if (box) {
          clearEl(box);
          box.appendChild(emptyNode('登录后就能看到记录啦'));
        }
      }
      return;
    }

    if (typeof db.onUpdated === 'function') {
      db.onUpdated(function (payload) {
        var ids = (payload && payload.databaseIds) || [];
        if (ids.indexOf(DATABASE_ID) === -1) {
          return;
        }
        scheduleRefresh();
      });
    }

    db.getSchema({ databaseId: DATABASE_ID }).then(function (schema) {
      extractSchema(schema);
      renderSelectOptions();
      renderAchvChips();
      restoreDrafts();
      syncMealPick();
      refreshData();
    }).catch(function (err) {
      console.error('[database] schema 加载失败:', err);
      toast('初始化不太顺利，刷新页面试试');
      refreshData();
    });

    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(function () {
        renderAll();
      });
    }
  }

  init();
})();

}
