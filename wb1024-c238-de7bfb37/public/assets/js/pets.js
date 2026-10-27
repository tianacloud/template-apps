/* ============================================================
   老李的世界Online · 宠物养成模块（pets.js）
   依赖 app.js 提供的 getProfile/addExp/showExpToast 等，全部做降级守卫
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 0) 数据表 ---------- */
  const PET_DB = {
    pets: 'pets',
    trips: 'trips',
    bag: 'bag'
  };
  const LS_PETS = 'earth_online_pets';
  const LS_TRIPS = 'earth_online_pet_trips';
  const LS_BAG = 'earth_online_pet_bag';
  const LS_YARD = 'earth_online_pet_yard';
  const LS_GAME = 'earth_online_pet_game';
  const LS_ADOPT = 'earth_online_pet_adopt_pool';

  const MAX_PETS = 3;

  /* ---------- 1) 存储读写 ---------- */
  function lsGet(k, def) {
    try { const v = JSON.parse(localStorage.getItem(k)); return (v === null || v === undefined) ? def : v; }
    catch (e) { return def; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  function getPets() { return lsGet(LS_PETS, []); }
  function savePets(list) { lsSet(LS_PETS, list); queueSync('pets'); }
  function getTrips() { return lsGet(LS_TRIPS, []); }
  function saveTrips(list) { lsSet(LS_TRIPS, list); queueSync('trips'); }
  function getBag() { return lsGet(LS_BAG, []); }
  function saveBag(list) { lsSet(LS_BAG, list); queueSync('bag'); }
  function getYard() {
    let y = null;
    try { y = JSON.parse(localStorage.getItem(LS_YARD)); } catch (e) { y = null; }
    if (!y || typeof y !== 'object') {
      // 首次：立即落盘，保证 seedsAt 持久化（否则每次页面加载都重置计时，三叶草永远长不出来）
      y = { seedsAt: Date.now(), grown: 0, lucky: 0 };
      lsSet(LS_YARD, y);
    }
    if (!y.seedsAt) y.seedsAt = Date.now();
    return y;
  }
  function saveYard(y) { lsSet(LS_YARD, y); }
  function getGameStat() { return lsGet(LS_GAME, { date: '', times: 0 }); }
  function saveGameStat(g) { lsSet(LS_GAME, g); }

  function todayStr() {
    const d = new Date();
    const p = n => (n < 10 ? '0' : '') + n;
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function uid(prefix) { return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ---------- 2) 品种库（20 只） ---------- */
  /* palette: body 主色 / belly 肚皮色 / accent 点缀色 / line 描边色 */
  const BREEDS = [
    { id: 'naituan', name: '奶团团', form: 'blob', rarity: '普通', desc: '刚蒸好的奶香团子，摸一下会晃三下。', pal: { b: '#FFF3DC', a: '#F6D9A8', c: '#FFC7A0', l: '#8A6A45' }, favor: '牛奶' },
    { id: 'jiaotang', name: '焦糖布丁', form: 'blob', rarity: '普通', desc: '跑起来一抖一抖，甜度超标。', pal: { b: '#F8C77A', a: '#FFF0D2', c: '#C9822F', l: '#7C4D1C' }, favor: '布丁' },
    { id: 'caomei', name: '草莓麻薯', form: 'blob', rarity: '普通', desc: '头顶一颗小草莓，心情好会变红。', pal: { b: '#FFD3D9', a: '#FFF3F2', c: '#FF7A96', l: '#8C4553' }, favor: '草莓' },
    { id: 'zhima', name: '芝麻汤圆', form: 'blob', rarity: '普通', desc: '圆到滚不动，睡着像一颗芝麻球。', pal: { b: '#DCD7DE', a: '#FBF8FB', c: '#8E86A0', l: '#4C4457' }, favor: '芝麻糊' },
    { id: 'mocha', name: '抹茶小熊', form: 'bear', rarity: '普通', desc: '耳朵里藏着一小撮抹茶粉。', pal: { b: '#BFD9A6', a: '#F2F7E6', c: '#7FA45C', l: '#415C31' }, favor: '抹茶饼干' },
    { id: 'ningmeng', name: '柠檬气泡', form: 'slime', rarity: '普通', desc: '身体里有会冒泡的汽水。', pal: { b: '#FFE98A', a: '#FFFBE0', c: '#FFC943', l: '#8A6A12' }, favor: '柠檬水' },
    { id: 'lanmei', name: '蓝莓冰沙', form: 'slime', rarity: '普通', desc: '凉丝丝的，夏天最爱黏着你。', pal: { b: '#C9C7F2', a: '#EDECFB', c: '#8C86E8', l: '#464072' }, favor: '蓝莓' },
    { id: 'shimi', name: '蜜桃兔兔', form: 'bunny', rarity: '普通', desc: '耳朵尖是蜜桃色，害羞时会并拢。', pal: { b: '#FFD8CE', a: '#FFF4F0', c: '#FF9376', l: '#8E4B3C' }, favor: '水蜜桃' },
    { id: 'yuni', name: '芋泥啵啵', form: 'bunny', rarity: '普通', desc: '软糯糯，说话带着一点点甜。', pal: { b: '#D9C7EC', a: '#F6F0FB', c: '#A482CB', l: '#523A6E' }, favor: '芋泥啵啵奶茶' },
    { id: 'zhishi', name: '芝士小猫', form: 'cat', rarity: '普通', desc: '尾巴尖是融化的芝士黄。', pal: { b: '#FFF0C2', a: '#FFFBF0', c: '#F5B942', l: '#8A6013' }, favor: '芝士' },
    { id: 'heitang', name: '黑糖小猫', form: 'cat', rarity: '普通', desc: '夜里只看得见两颗眼睛在发光。', pal: { b: '#C0A58C', a: '#F3E7D8', c: '#6F4E33', l: '#3D2A1B' }, favor: '黑糖糕' },
    { id: 'chai', name: '抹茶柴犬', form: 'dog', rarity: '普通', desc: '笑起来像弯弯的月牙。', pal: { b: '#E0B785', a: '#FFF6E8', c: '#A9713A', l: '#5E3C1B' }, favor: '肉干' },
    { id: 'xueli', name: '雪梨小鸟', form: 'bird', rarity: '普通', desc: '会在窗台上哼一小段调子。', pal: { b: '#E7EEB8', a: '#FAFCF0', c: '#9DBF57', l: '#4C6132' }, favor: '小米' },
    { id: 'qishui', name: '汽水企鹅', form: 'penguin', rarity: '普通', desc: '走路啪嗒啪嗒，肚子凉凉的。', pal: { b: '#BFE0F5', a: '#FFFFFF', c: '#5B9BC9', l: '#2F5B7E' }, favor: '小鱼干' },
    { id: 'yunyang', name: '云朵羊咩', form: 'sheep', rarity: '稀有', desc: '毛是云做的，剪下来能当枕芯。', pal: { b: '#FFFFFF', a: '#FFF6F2', c: '#FFC6D6', l: '#7E7E8C' }, favor: '苜蓿草' },
    { id: 'xinglong', name: '星星小龙', form: 'dragon', rarity: '稀有', desc: '打喷嚏会喷出一小把星星。', pal: { b: '#BFD6FF', a: '#F2F6FF', c: '#7A8CE0', l: '#33407A' }, favor: '星星糖' },
    { id: 'yueguang', name: '月光史莱姆', form: 'slime', rarity: '稀有', desc: '只在有月亮的夜里发亮。', pal: { b: '#E4EEFF', a: '#FFFFFF', c: '#9FB6E8', l: '#4A5B86' }, favor: '月见团子' },
    { id: 'penzai', name: '盆栽小芽', form: 'plant', rarity: '稀有', desc: '顶着一片小叶子，晒太阳会长大。', pal: { b: '#CFE8C0', a: '#F4FBE9', c: '#6FAE52', l: '#3A6231' }, favor: '阳光' },
    { id: 'yinhe', name: '银河鲸鱼', form: 'whale', rarity: '闪光', desc: '肚子里装着一整片银河。', pal: { b: '#7E8BD6', a: '#E8EBFF', c: '#3B449E', l: '#232A66' }, favor: '海盐汽水' },
    { id: 'zhaocai', name: '招财小狮', form: 'lion', rarity: '传说', desc: '传说摸一下它的鬃毛会带来好运。', pal: { b: '#FFC85C', a: '#FFF3D2', c: '#E88B2A', l: '#8A4C11' }, favor: '金元宝酥' }
  ];
  const BREED_MAP = {}; BREEDS.forEach(b => { BREED_MAP[b.id] = b; });
  const RARITY_STYLE = {
    '普通': { bg: '#EFEAE0', fg: '#8A7C63', label: 'N' },
    '稀有': { bg: '#DDEBFF', fg: '#3F6BB5', label: 'R' },
    '闪光': { bg: '#F1E6FF', fg: '#7854B8', label: 'SR' },
    '传说': { bg: '#FFEBD2', fg: '#B36A15', label: 'SSR' }
  };

  /* ---------- 3) 食材 / 道具 / 特产 ---------- */
  const FOODS = [
    { name: '牛奶', ico: '🥛', hun: 14, mood: 4, tag: '奶香' },
    { name: '布丁', ico: '🍮', hun: 18, mood: 6, tag: '甜点' },
    { name: '草莓', ico: '🍓', hun: 10, mood: 8, tag: '水果' },
    { name: '芝麻糊', ico: '🥣', hun: 16, mood: 3, tag: '暖胃' },
    { name: '抹茶饼干', ico: '🍪', hun: 15, mood: 5, tag: '点心' },
    { name: '柠檬水', ico: '🍋', hun: 8, mood: 10, tag: '清爽' },
    { name: '蓝莓', ico: '🫐', hun: 9, mood: 9, tag: '水果' },
    { name: '水蜜桃', ico: '🍑', hun: 12, mood: 7, tag: '水果' },
    { name: '玉米', ico: '🌽', hun: 20, mood: 2, tag: '主食' },
    { name: '小鱼干', ico: '🐟', hun: 17, mood: 6, tag: '海鲜' },
    { name: '肉干', ico: '🍖', hun: 22, mood: 3, tag: '主食' },
    { name: '蜂蜜', ico: '🍯', hun: 13, mood: 11, tag: '甜点' },
    { name: '星星糖', ico: '🍬', hun: 6, mood: 14, tag: '甜点' },
    { name: '猫草面包', ico: '🍞', hun: 19, mood: 4, tag: '主食' }
  ];
  const FOOD_MAP = {}; FOODS.forEach(f => { FOOD_MAP[f.name] = f; });

  const TOOLS = [
    { name: '粗布帐篷', ico: '⛺', desc: '野外过夜，更容易结交朋友', effect: 'friend+' },
    { name: '复古相机', ico: '📷', desc: '带回的明信片更精致', effect: 'card+' },
    { name: '幸运护符', ico: '🧧', desc: '提高稀有明信片的概率', effect: 'rare+' },
    { name: '防水雨伞', ico: '☂️', desc: '雨天也能安心赶路', effect: 'safe' },
    { name: '手绘地图', ico: '🗺️', desc: '去得更远，特产更丰富', effect: 'gift+' },
    { name: '热乎毛毯', ico: '🧣', desc: '路上休息好，回来心情更高', effect: 'mood+' }
  ];
  const TOOL_MAP = {}; TOOLS.forEach(t => { TOOL_MAP[t.name] = t; });

  /* ---------- 4) 目的地池 ---------- */
  /* scene 决定 SVG 场景配色；tier 决定稀有度 */
  const SPOTS = [
    { name: '奶油山丘', scene: 'hill', tier: 1, lines: ['风把云吹成了棉花糖的形状', '山那边的牧场请我喝了热牛奶', '我在最高的那块石头上睡了午觉'], gifts: ['牛奶', '抹茶饼干'], friends: ['放牛的小羊', '风铃店主'] },
    { name: '橘子海日出', scene: 'sea', tier: 1, lines: ['日出把整片海染成了橘子味', '我在礁石上捡到一枚会唱歌的贝壳', '海浪一遍遍替我数着步数'], gifts: ['小鱼干', '海盐汽水'], friends: ['灯塔看守人', '冲浪的海獭'] },
    { name: '橡果森林', scene: 'forest', tier: 1, lines: ['松鼠把我当成了一颗大号的坚果', '森林里有踩上去会响的落叶地毯', '树洞里藏着别人的旅行笔记'], gifts: ['蓝莓', '草莓'], friends: ['戴眼镜的松鼠', '树皮邮差'] },
    { name: '云上小镇', scene: 'cloud', tier: 1, lines: ['这里的房子都是用云搭的', '邮筒飘在半空，要踮脚才够得着', '风一吹，屋顶就会换一个形状'], gifts: ['布丁', '蜂蜜'], friends: ['云朵裁缝', '会织毛衣的老奶奶'] },
    { name: '橘子园', scene: 'farm', tier: 1, lines: ['整片山坡都是甜的', '我在树荫下做了一个橘色的梦', '果农说今年的橘子特别好'], gifts: ['水蜜桃', '柠檬水'], friends: ['看园的橘猫', '送货的小货车司机'] },
    { name: '旧车站', scene: 'station', tier: 1, lines: ['候车厅的钟比我的脚步慢半拍', '月台上有人在弹吉他', '车票被风吹到了下一站'], gifts: ['猫草面包', '牛奶'], friends: ['吉他手', '卖票的机器人'] },
    { name: '青苔温泉', scene: 'onsen', tier: 1, lines: ['泡到脚趾都皱了还不肯起来', '水汽把石头染成了温柔的绿', '温泉蛋是我帮你吃的'], gifts: ['芝麻糊', '蜂蜜'], friends: ['温泉老板', '泡汤的雪猴'] },
    { name: '萤火谷', scene: 'firefly', tier: 2, lines: ['成千上万只萤火虫替我照路', '山谷安静得能听见自己的心跳', '我把一小撮光装进了口袋'], gifts: ['星星糖', '柠檬水'], friends: ['提灯的萤火虫向导', '守夜的猫头鹰'] },
    { name: '书页图书馆', scene: 'library', tier: 2, lines: ['这里的书名都长得吓人', '管理员是一只戴圆眼镜的猫头鹰', '我在第五排书架后面睡着了'], gifts: ['抹茶饼干', '蜂蜜'], friends: ['猫头鹰管理员', '会讲故事的旧书'] },
    { name: '雪松车站', scene: 'snow', tier: 2, lines: ['雪落下来的时候没有一点声音', '我在雪地上按了五个小爪印', '热可可的香气跟着我走了一路'], gifts: ['热可可饼干', '布丁'], friends: ['铲雪的小熊', '热可可摊老板'] },
    { name: '潮汐美术馆', scene: 'museum', tier: 2, lines: ['潮水每天来重画一次展览', '有一幅画只画了一半', '我在最喜欢的作品前站了很久'], gifts: ['水蜜桃', '抹茶饼干'], friends: ['看展的章鱼', '画一半的画家'] },
    { name: '屋顶夜市', scene: 'night', tier: 2, lines: ['灯笼串把夜空顶得高高的', '一口热气腾腾的小摊就是全世界', '我在天台边数了三百颗星星'], gifts: ['肉干', '星星糖'], friends: ['烧烤摊老板', '占卜的纸鹤'] },
    { name: '沙漠绿洲', scene: 'desert', tier: 2, lines: ['沙子烫得像刚出炉的面包', '绿洲的水甜得难以置信', '骆驼说它已经走过八千次这条路'], gifts: ['柠檬水', '玉米'], friends: ['戴帽子的骆驼', '卖冰的小贩'] },
    { name: '苔藓小镇', scene: 'moss', tier: 2, lines: ['台阶上长着比猫还软的苔藓', '下雨时屋顶会咕嘟咕嘟冒泡', '邮差是一只会跳的青蛙'], gifts: ['草莓', '蜂蜜'], friends: ['青蛙邮差', '种苔藓的老爷爷'] },
    { name: '星屑湖畔', scene: 'lake', tier: 3, lines: ['湖面把星星都收了进去', '我捞起了一捧碎掉的月光', '对岸有人在等我一起看流星'], gifts: ['星星糖', '月见团子'], friends: ['摆渡的银鱼', '写诗的水獭'] },
    { name: '极光营地', scene: 'aurora', tier: 3, lines: ['天空在我头顶换了七种颜色', '篝火把每个人的脸都烤得暖暖的', '极光落下来的时候我们都没说话'], gifts: ['热可可饼干', '蜂蜜'], friends: ['极光摄影师', '会拉手风琴的旅人'] },
    { name: '云端灯塔', scene: 'lighthouse', tier: 3, lines: ['灯塔守了三百年的夜', '光扫过的时候，连影子都在笑', '我把今天写在了值班日志上'], gifts: ['小鱼干', '海盐汽水'], friends: ['守灯的老船长', '迷路的信天翁'] },
    { name: '花火港', scene: 'fireworks', tier: 3, lines: ['烟花炸开的声音像远处的海浪', '整个港口都被照成了白天的颜色', '我们一起喊了三声好高'], gifts: ['布丁', '星星糖'], friends: ['放烟花的兄弟俩', '卖面具的狐狸'] },
    { name: '时间面包房', scene: 'bakery', tier: 3, lines: ['刚出炉的时间是热乎的', '老板说慢一些面包才香', '我买了一整个下午的空闲'], gifts: ['猫草面包', '布丁', '蜂蜜'], friends: ['面包房老板娘', '打瞌睡的老钟'] },
    { name: '四叶草高地', scene: 'clover', tier: 4, lines: ['整片高地只长四片叶子的草', '风一过，愿望就排好了队', '我把最大的一片留给了你'], gifts: ['幸运四叶草', '月见团子'], friends: ['守护幸运草的小鹿', '许愿的风'] },
    { name: '银河渡口', scene: 'galaxy', tier: 4, lines: ['渡船是半个月亮做的', '划一次桨就渡过一万个夏天', '星星在我手心里轻轻发烫'], gifts: ['银河沙', '星星糖'], friends: ['摆渡的月兔', '收集星座的孩子'] },
    { name: '初雪神祠', scene: 'shrine', tier: 4, lines: ['第一场雪总是先落在这里', '我替你求了一支上上签', '签上说，好事正在路上'], gifts: ['御守之铃', '芝麻糊'], friends: ['扫雪的巫女', '雪白的灵狐'] },
    { name: '海尽头邮局', scene: 'postoffice', tier: 4, lines: ['所有没寄出的信都寄到了这里', '邮戳是一只打哈欠的海豹', '它也替我给你盖了个章'], gifts: ['远方邮票', '海盐汽水'], friends: ['盖戳的海豹', '写一整年信的老人'] },
    { name: '彩虹尽头', scene: 'rainbow', tier: 4, lines: ['彩虹的尽头居然是一间小卖部', '老板说运气好才看得见这里', '我买了一个愿望，还没拆'], gifts: ['虹色玻璃珠', '彩虹软糖'], friends: ['小卖部老板', '住在雨后的小孩'] }
  ];
  const SPECIAL_GIFTS = ['幸运四叶草', '银河沙', '御守之铃', '远方邮票', '虹色玻璃珠', '彩虹软糖', '热可可饼干', '海盐汽水', '月见团子'];
  const SCENE_PAL = {
    hill: { sky: ['#FFE7C4', '#FFD3A3'], far: '#C8D79A', mid: '#9CC46B', near: '#6FA84A' },
    sea: { sky: ['#FFD9C0', '#FFB9A3'], far: '#F6C9A8', mid: '#7FBEE6', near: '#4A90BF' },
    forest: { sky: ['#DDEFD0', '#BFDFAE'], far: '#8FBF83', mid: '#5F9E58', near: '#3C7440' },
    cloud: { sky: ['#CFE6FF', '#E8F3FF'], far: '#FFFFFF', mid: '#DCE9F7', near: '#B9CCE6' },
    farm: { sky: ['#FFF0C9', '#FFE3A8'], far: '#F1C96B', mid: '#D69B3E', near: '#A66E25' },
    station: { sky: ['#E5E0F2', '#D3CCE8'], far: '#B7AED2', mid: '#8E86B4', near: '#655E8C' },
    onsen: { sky: ['#DCEFE6', '#C4E4D8'], far: '#9BC9B6', mid: '#6FAA95', near: '#4C8573' },
    firefly: { sky: ['#33406B', '#4B5A8C'], far: '#3A4A73', mid: '#2C3760', near: '#1E2547' },
    library: { sky: ['#F1E7D3', '#E2D2B6'], far: '#C9AE84', mid: '#A98A61', near: '#7F6544' },
    snow: { sky: ['#E8F1FA', '#D6E5F5'], far: '#FFFFFF', mid: '#DFEAF6', near: '#BCCFE6' },
    museum: { sky: ['#F3E9F5', '#E3D2EE'], far: '#C4AED8', mid: '#9C86BE', near: '#73639B' },
    night: { sky: ['#2F3A63', '#43507F'], far: '#3C4870', mid: '#2B3459', near: '#1D2440' },
    desert: { sky: ['#FFE6BE', '#FFD08A'], far: '#F5CE8F', mid: '#E0A45C', near: '#B87B36' },
    moss: { sky: ['#E3EFD9', '#CDE4BC'], far: '#A8CD8C', mid: '#7FB163', near: '#5C8C46' },
    lake: { sky: ['#39356E', '#514A93'], far: '#4B4A85', mid: '#34346A', near: '#22224F' },
    aurora: { sky: ['#1F2A52', '#3A2E63'], far: '#57C7B8', mid: '#3B7FA8', near: '#26456E' },
    lighthouse: { sky: ['#243B5E', '#35507A'], far: '#2E4670', mid: '#1F3357', near: '#152342' },
    fireworks: { sky: ['#241C4A', '#3B2560'], far: '#FF8FB1', mid: '#6B4A96', near: '#2A2050' },
    bakery: { sky: ['#FFEFD3', '#F7DDB2'], far: '#E6BE86', mid: '#C08E52', near: '#8F6134' },
    clover: { sky: ['#DEF5CD', '#C6EDAC'], far: '#9ED678', mid: '#71B552', near: '#4F8F39' },
    galaxy: { sky: ['#241B4D', '#3A2A6E'], far: '#6B5BB5', mid: '#453589', near: '#241B4D' },
    shrine: { sky: ['#E9F0F8', '#D3E0F0'], far: '#FFFFFF', mid: '#C9D7E8', near: '#9FB2CC' },
    postoffice: { sky: ['#CBE7F3', '#A9D5EA'], far: '#8FC3DE', mid: '#5FA1C4', near: '#3F7EA6' },
    rainbow: { sky: ['#FFE9F0', '#E4EEFF'], far: '#FFC6D6', mid: '#BFE0F5', near: '#9CC8A8' }
  };

  /* ---------- 5) 宠物数值与成长 ---------- */
  const STAGES = ['蛋', '幼崽', '少年', '成年', '星辰'];
  function stageOfLv(lv) {
    if (lv >= 9) return '星辰';
    if (lv >= 6) return '成年';
    if (lv >= 4) return '少年';
    if (lv >= 2) return '幼崽';
    return '幼崽';
  }
  function expNeed(lv) { return 30 + lv * 22; }

  function newPet(breedId, nickname) {
    const b = BREED_MAP[breedId] || BREEDS[0];
    const now = Date.now();
    return {
      id: uid('pet'), breed: b.id, name: nickname || b.name,
      level: 1, exp: 0, stage: '幼崽',
      mood: 80, hun: 70, clean: 85, energy: 90, bond: 10,
      status: '在家', bornAt: todayStr(), lastTick: now,
      trips: 0, returnAt: 0, pendingTrip: null, adoptedAt: now
    };
  }

  /* 离线/在线衰减：每 5 分钟 -1 点；>=48 小时不再衰减，避免长期离线直接归零 */
  function applyDecay(p) {
    const now = Date.now();
    const last = p.lastTick || now;
    let mins = Math.floor((now - last) / 60000);
    mins = Math.min(mins, 5760); // 上限 4 天
    if (mins > 0) {
      const step = Math.floor(mins / 5);
      p.hun = clamp(p.hun - step, 0, 100);
      p.clean = clamp(p.clean - Math.floor(step * 0.7), 0, 100);
      p.energy = clamp(Math.min(p.energy + Math.floor(step * 1.2), 100), 0, 100);
      const avgStat = (p.hun + p.clean) / 2;
      p.mood = clamp(Math.round(p.mood + (avgStat - 50) * 0.05 * step / 2), 0, 100);
    }
    p.lastTick = now;
    return p;
  }
  function moodFace(p) {
    const v = p.mood;
    if (p.status === '旅行中') return 'away';
    if (p.energy <= 15) return 'sleepy';
    if (v >= 75) return 'happy';
    if (v >= 45) return 'calm';
    if (v >= 20) return 'sad';
    return 'cry';
  }
  function moodText(p) {
    if (p.status === '旅行中') return '出门旅行中～';
    if (p.energy <= 15) return '困得睁不开眼';
    if (p.hun <= 20) return '肚子咕咕叫';
    if (p.clean <= 20) return '有点邋遢了';
    if (p.mood >= 85) return '心情超级好！';
    if (p.mood >= 60) return '心情不错';
    if (p.mood >= 35) return '有点无聊';
    return '想让你陪陪我';
  }

  /* ---------- 6) 背包操作 ---------- */
  function bagAdd(name, type, n) {
    const bag = getBag();
    const it = bag.find(x => x.name === name);
    if (it) it.n = (it.n || 0) + (n || 1);
    else bag.push({ name: name, type: type, n: n || 1 });
    saveBag(bag);
  }
  function bagUse(name, n) {
    const bag = getBag();
    const it = bag.find(x => x.name === name);
    if (!it || (it.n || 0) < (n || 1)) return false;
    it.n -= (n || 1);
    if (it.n <= 0) bag.splice(bag.indexOf(it), 1);
    saveBag(bag);
    return true;
  }
  function bagCount(name) {
    const it = getBag().find(x => x.name === name);
    return it ? (it.n || 0) : 0;
  }
  function bagByType(t) { return getBag().filter(x => x.type === t); }

  /* ---------- 7) 经验 & 掉落联动（调用 app.js 的 addExp，做降级） ---------- */
  function grantExp(n, reason) {
    try {
      if (typeof addExp === 'function') { addExp(n, '🐾' + (reason || '')); return; }
    } catch (e) { }
    try {
      const raw = JSON.parse(localStorage.getItem('earth_online_player')) || { exp: 0 };
      raw.exp = (raw.exp || 0) + n;
      localStorage.setItem('earth_online_player', JSON.stringify(raw));
      if (typeof showExpToast === 'function') showExpToast(n, reason);
    } catch (e) { }
  }
  function toast(msg, type, extra) {
    try { if (typeof showToast === 'function') { showToast(msg, type); return; } } catch (e) { }
    const el = document.getElementById('expToast');
    if (!el) return;
    el.innerHTML = '<span style="font-size:13px">' + esc(msg) + '</span>';
    el.style.display = 'flex';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.style.display = 'none'; }, 2200);
  }

  /* ---------- 8) 庭院：三叶草（每 3 分钟 1 片，上限 24） ---------- */
  function yardTick() {
    const y = getYard();
    const now = Date.now();
    const grow = Math.floor((now - (y.seedsAt || now)) / 180000);
    if (grow > 0) {
      y.grown = Math.min(24, (y.grown || 0) + grow);
      y.seedsAt = now;
      if (Math.random() < 0.06 * grow) { y.lucky = (y.lucky || 0) + 1; }
      saveYard(y);
    }
    return y;
  }
  function yardHarvest() {
    const y = yardTick();
    const n = y.grown || 0;
    if (n <= 0) { toast('还没有长出三叶草，再等一会儿～'); return; }
    const luckyCount = y.lucky || 0;
    // 每个 lucky 代表一颗四叶草夹在里面
    let clover = n, lucky = luckyCount;
    if (clover > 0) bagAdd('三叶草', '食材', clover);
    if (lucky > 0) bagAdd('幸运四叶草', '道具', lucky);
    y.grown = 0; y.lucky = 0; y.seedsAt = Date.now();
    saveYard(y);
    grantExp(Math.min(6, 2 + Math.floor(n / 4)), '收获三叶草');
    toast('收获了 ' + clover + ' 片三叶草' + (lucky ? ' + ' + lucky + ' 颗四叶草！' : '！'));
    renderPets();
  }
  function yardNextIn() {
    const y = getYard();
    const el = (y.seedsAt || Date.now()) + 180000 - Date.now();
    return Math.max(0, Math.ceil(el / 1000));
  }

  /* ---------- 9) 同步到资料库 ---------- */
  function dbSdkPet() {
    try { if (window.__DBQ && window.__DBQ.sdk) return window.__DBQ.sdk(); } catch(e) {}
    return (window.__SMART_PAGE__ && window.__SMART_PAGE__.database) || null;
  }
  // 云端调用一律串行（并发会被平台拒绝）
  function petRun(fn, tries) {
    try { if (window.__DBQ && window.__DBQ.run) return window.__DBQ.run(fn, tries); } catch(e) {}
    return Promise.resolve().then(fn);
  }
  /* 弹窗：优先用 app.js 的自绘弹窗（沙箱 iframe 会静默拦截原生 confirm/prompt） */
  function uiConfirm(msg) { return typeof window.xConfirm === 'function' ? window.xConfirm(msg) : Promise.resolve(confirm(msg)); }
  function uiPrompt(msg, def) { return typeof window.xPrompt === 'function' ? window.xPrompt(msg, def) : Promise.resolve(prompt(msg, def)); }
  /* 云端删除：按条件删除某张表的记录并刷新缓存（防止下次拉取复活） */
  async function petCloudDelete(dbId, kind, pred) {
    const sdk = dbSdkPet(); if (!sdk) return;
    try {
      const rows = await queryAll(dbId);
      for (const r of rows) {
        if (!pred || pred(r)) {
          try { await petRun(() => sdk.deleteRecord({ databaseId: dbId, recordId: r._id })); } catch (e) { }
        }
      }
      try {
        const fresh = await queryAll(dbId);
        const cache = _cache[kind] || (_cache[kind] = []);
        cache.length = 0; fresh.forEach(x => cache.push(x));
      } catch (e) { }
    } catch (e) { }
  }
  /* 供 app.js 重置账号时调用：清空宠物相关三张表的云端记录 */
  window.petClearCloud = async function () {
    await petCloudDelete(PET_DB.pets, 'pets', null);
    await petCloudDelete(PET_DB.trips, 'trips', null);
    await petCloudDelete(PET_DB.bag, 'bag', null);
    _cloudHasData = false;
  };
  function extendKeyMap() {
    try {
      if (typeof DB_NUM_KEYS !== 'undefined') {
        ['等级', '经验', '心情', '饱食', '清洁', '体力', '亲密度', '旅行次数', '数量'].forEach(k => {
          if (DB_NUM_KEYS.indexOf(k) < 0) DB_NUM_KEYS.push(k);
        });
      }
      if (typeof DB_SELECT_KEYS !== 'undefined') {
        ['稀有度', '阶段', '类型'].forEach(k => { if (DB_SELECT_KEYS.indexOf(k) < 0) DB_SELECT_KEYS.push(k); });
      }
    } catch (e) { }
  }
  extendKeyMap();

  /* 宠物模块自己的串行同步链（app.js 的 _dbSyncChain 是其 IIFE 内的局部变量，
     跨文件不可见；此前 typeof 检查永远落空，导致同步任务只靠 setTimeout 兜底、
     无法保证顺序，pullAll 也无法等待推送排空） */
  let _petSyncChain = Promise.resolve();

  function queueSync(kind) {
    const sdk = dbSdkPet();
    if (!sdk) return;
    _petSyncChain = _petSyncChain.then(() => doSync(kind)).catch(() => { });
  }

  async function doSync(kind) {
    const sdk = dbSdkPet();
    if (!sdk) return;
    try {
      if (kind === 'pets') {
        await syncColl(PET_DB.pets, ['昵称'], getPets(), p => ({
          '昵称': p.name, '品种': (BREED_MAP[p.breed] || {}).name || p.breed,
          '稀有度': (BREED_MAP[p.breed] || {}).rarity || '普通',
          '状态': p.status || '在家', '阶段': p.stage || stageOfLv(p.level || 1),
          '等级': p.level || 1, '经验': Math.round(p.exp || 0),
          '心情': Math.round(p.mood || 0), '饱食': Math.round(p.hun || 0),
          '清洁': Math.round(p.clean || 0), '体力': Math.round(p.energy || 0),
          '亲密度': Math.round(p.bond || 0), '旅行次数': p.trips || 0,
          '诞生日期': p.bornAt || todayStr()
        }), 'pets');
      } else if (kind === 'trips') {
        await syncColl(PET_DB.trips, ['日期', '宠物', '目的地'], getTrips(), t => ({
          '日期': t.date, '宠物': t.pet, '目的地': t.spot,
          '明信片': t.line, '特产': (t.gifts || []).join('、'),
          '结识朋友': (t.friends || []).join('、'), '心情': t.moodText || ''
        }), 'trips');
      } else if (kind === 'bag') {
        await syncColl(PET_DB.bag, ['物品'], getBag(), b => ({
          '物品': b.name, '类型': b.type || '食材', '数量': b.n || 0
        }), 'bag');
      }
    } catch (e) { }
  }

  const _cache = { pets: [], trips: [], bag: [] };
  async function queryAll(dbId) {
    const sdk = dbSdkPet();
    if (!sdk) throw new Error('SDK_NOT_READY');
    let out = [], cursor = null, guard = 0;
    do {
      const params = { databaseId: dbId, pageSize: 200 };
      if (cursor) params.startCursor = cursor;
      const r = await petRun(() => sdk.query(params));
      const page = (r && r.results) || [];
      out = out.concat(page);
      guard++;
      const next = r && r.nextCursor;
      cursor = (r && r.hasMore && next && next !== cursor && page.length && guard < 100) ? next : null;
    } while (cursor);
    return out;
  }
  async function syncColl(dbId, keys, list, mapFn, kind) {
    const sdk = dbSdkPet();
    if (!sdk) return;
    try {
      const cache = _cache[kind] || (_cache[kind] = []);
      const keyOf = obj => keys.map(k => String(obj[k] == null ? '' : obj[k])).join('|');
      // 缓存为空 / 陈旧时先拉一次云端，避免把已存在的行重复插入
      if (!cache.length) {
        try {
          const Fresh = await queryAll(dbId);
          cache.length = 0;
          (Fresh || []).forEach(x => cache.push(x));
        } catch (e) { }
      }
      const cloud = new Map();
      cache.forEach(r => { const k = keyOf(r); if (!cloud.has(k)) cloud.set(k, r._id); });
      let addedAny = false;
      for (const item of list) {
        const payload = mapFn(item);
        const k = keys.map(kk => {
          const v = payload[kk];
          if (v === true || v === false) return v ? '1' : '0';
          return String(v == null ? '' : v);
        }).join('|');
        const rid = cloud.get(k);
        if (rid) { try { await petRun(() => sdk.updateRecord({ databaseId: dbId, recordId: rid, properties: buildProps(payload) })); } catch (e) { } }
        else {
          try { await petRun(() => sdk.addRecord({ databaseId: dbId, properties: buildProps(payload) })); addedAny = true; } catch (e) { }
          cloud.set(k, 'just_added');
        }
      }
      if (addedAny) {
        try { const fresh = await queryAll(dbId); cache.length = 0; (fresh || []).forEach(x => cache.push(x)); } catch (e) { }
      }
    } catch (e) { }
  }
  function buildProps(raw) {
    const props = {};
    const sel = ['稀有度', '阶段', '类型', '状态'];
    const num = ['等级', '经验', '心情', '饱食', '清洁', '体力', '亲密度', '旅行次数', '数量'];
    const date = ['诞生日期', '日期'];
    Object.keys(raw || {}).forEach(k => {
      const v = raw[k];
      if (v === null || v === undefined) return;
      if (num.indexOf(k) >= 0) { props[k] = { number: Number(v) || 0 }; return; }
      if (sel.indexOf(k) >= 0) { if (String(v)) props[k] = { select: String(v) }; return; }
      if (date.indexOf(k) >= 0) { const s = String(v || '').slice(0, 10); if (s) props[k] = { date: s }; return; }
      if (String(v)) props[k] = { text: String(v) };
    });
    return props;
  }

  /* ---------- 10) 拉取：云端 -> 本地（本地优先，云端只补新增） ----------
     早期版本无条件用云端覆盖本地，启动竞态会把刚收获的三叶草/
     刚喂的食回滚掉（表现为：背包数量不变、喂食面板没东西可选）。
     现改为「本地为准 + 云端补新增」：
     - bag：本地物品数量不变；云端有而本地没有的物品才引入
     - pets：本地已有的宠物完全以本地为准（游戏状态机在本地）；仅云端有则引入
     - trips：本地 ∪ 云端，按 日期|宠物|目的地|明信片 去重
     拉取前先等本地待推送修改全部上云；拉取后把本地结果推回云端。 */
  async function pullAll() {
    const sdk = dbSdkPet();
    if (!sdk) return false;
    try {
      const txt = (r, k) => { const v = r[k]; return v === undefined || v === null ? '' : String(v); };

      // 0) 先等本地待推送的修改全部上云，避免拉到中间态旧数据
      try { await _petSyncChain; } catch (e) { }

      // 串行逐表拉取，单表失败不影响其它表
      const grab = async (dbId) => { try { return await queryAll(dbId); } catch (e) { return []; } };
      const pr = await grab(PET_DB.pets);
      const tr = await grab(PET_DB.trips);
      const br = await grab(PET_DB.bag);
      _cache.pets = pr; _cache.trips = tr; _cache.bag = br;
      _cloudHasData = pr.length > 0 || br.length > 0;

      const num = r => Number(r) || 0;

      // --- 背包：本地为准，云端只补充「本地没有的物品」（换设备场景）---
      if (br.length) {
        const local = getBag();
        const has = Object.create(null);
        local.forEach(it => { has[it.name] = 1; });
        let changed = false;
        br.forEach(r => {
          const nm = txt(r, '物品'); if (!nm || has[nm]) return;
          const cn = num(r['数量']);
          if (cn > 0) { local.push({ name: nm, type: txt(r, '类型') || '食材', n: cn }); has[nm] = 1; changed = true; }
        });
        if (changed) lsSet(LS_BAG, local);
      }

      // --- 宠物：本地为准（游戏状态机在本地，云端只是备份），云端只补充本地没有的 ---
      if (pr.length) {
        const local = getPets();
        const localByName = Object.create(null);
        local.forEach(p => { localByName[p.name] = p; });
        let changed = false;
        pr.forEach(r => {
          const breedName = txt(r, '品种');
          const b = BREEDS.filter(x => x.name === breedName)[0] || BREEDS[0];
          const name = txt(r, '昵称') || b.name;
          if (localByName[name]) return; // 本地已有：完全以本地为准
          // 仅云端有：引入（典型场景：换设备/清缓存后恢复）
          local.push({
            id: uid('pet'), breed: b.id, name: name,
            level: num(r['等级']) || 1, exp: num(r['经验']) || 0,
            stage: txt(r, '阶段') || '幼崽',
            mood: num(r['心情']), hun: num(r['饱食']), clean: num(r['清洁']),
            energy: num(r['体力']), bond: num(r['亲密度']),
            status: txt(r, '状态') || '在家',
            bornAt: String(txt(r, '诞生日期') || todayStr()).slice(0, 10),
            lastTick: Date.now(), trips: num(r['旅行次数']),
            returnAt: 0, pendingTrip: null, adoptedAt: Date.now()
          });
          localByName[name] = local[local.length - 1];
          changed = true;
        });
        if (changed) lsSet(LS_PETS, local);
      }

      // --- 旅行明信片：并集去重 ---
      if (tr.length) {
        const seen = Object.create(null);
        const trips = [];
        getTrips().forEach(t => {
          const k = [t.date, t.pet, t.spot, t.line].join('|');
          if (seen[k]) return;
          seen[k] = 1; trips.push(t);
        });
        tr.forEach(r => {
          const row = {
            id: uid('trip'),
            date: String(txt(r, '日期') || todayStr()).slice(0, 10),
            pet: txt(r, '宠物'), spot: txt(r, '目的地'),
            line: txt(r, '明信片'),
            gifts: txt(r, '特产').split(/[、,，]/).filter(Boolean),
            friends: txt(r, '结识朋友').split(/[、,，]/).filter(Boolean),
            moodText: txt(r, '心情'), opened: true
          };
          const k = [row.date, row.pet, row.spot, row.line].join('|');
          if (seen[k]) return;
          seen[k] = 1;
          trips.push(row);
        });
        lsSet(LS_TRIPS, trips);
      }

      // --- 把合并结果推回云端（修复云端滞后，防止下次又被旧数据干扰）---
      try {
        queueSync('bag'); queueSync('pets'); queueSync('trips');
        await _petSyncChain;
      } catch (e) { }
      return true;
    } catch (e) { return false; }
  }

  /* ---------- 导出给全局（供 onclick 使用） ---------- */
  window.__PET__ = {
    getPets, getTrips, getBag, getYard, BREEDS, MAX_PETS, savePets, saveBag, todayStr
  };
  /* ============================================================
     11) SVG 绘制引擎（全内联，无任何外部图片依赖）
     ============================================================ */
  const DECO = {
    caomei: 'strawberry', zhima: 'sesame', yunyang: 'cloud', xinglong: 'star',
    yinhe: 'sparkle', zhaocai: 'coin', penzai: 'leaf', ningmeng: 'bubble',
    lanmei: 'berry', mocha: 'matcha', xueli: 'twig'
  };

  /* ===== 漫画风呆萌脸 Q版（超大眼睛 + 三高光 + 搞怪表情） ===== */
  const PET_INK = '#1c1710';

  function eyesByFace(face, lx, rx, ey, col) {
    const ink = PET_INK;
    // 默认：超大 Q 版漫画眼（白眼底 + 墨瞳 + 三高光）
    const glossy = function (x) {
      return '<ellipse cx="' + x + '" cy="' + ey + '" rx="6.8" ry="8.2" fill="#fff" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<circle cx="' + x + '" cy="' + (ey + 1) + '" r="4.5" fill="' + ink + '"/>' +
        '<circle cx="' + (x - 2.1) + '" cy="' + (ey - 3.1) + '" r="2.2" fill="#fff"/>' +
        '<circle cx="' + (x + 2.3) + '" cy="' + (ey + 3.2) + '" r="1.2" fill="#fff" opacity="0.95"/>' +
        '<circle cx="' + (x - 0.3) + '" cy="' + (ey - 0.4) + '" r="0.8" fill="#fff" opacity="0.85"/>';
    };
    switch (face) {
      case 'happy': // 眯眯笑眼（向上弯的粗月牙）
        return '<path d="M' + (lx - 7.5) + ' ' + (ey + 3.5) + ' q7.5 -13 15 0" stroke="' + ink + '" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + (rx - 7.5) + ' ' + (ey + 3.5) + ' q7.5 -13 15 0" stroke="' + ink + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
      case 'sleepy': // 睡眼 + 鼻涕泡（搞怪）
        return '<path d="M' + (lx - 6) + ' ' + ey + ' q6 7 12 0" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + (rx - 6) + ' ' + ey + ' q6 7 12 0" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
          '<circle cx="' + (rx + 11) + '" cy="' + (ey - 8) + '" r="3.8" fill="#BFE0F5" stroke="' + ink + '" stroke-width="1.8" opacity="0.9"/>' +
          '<circle cx="' + (rx + 14.5) + '" cy="' + (ey - 12.5) + '" r="2.2" fill="#BFE0F5" stroke="' + ink + '" stroke-width="1.4" opacity="0.7"/>';
      case 'sad': // 委屈眼（八字眉 + 水汪汪 + 嘴角发抖）
        return '<ellipse cx="' + lx + '" cy="' + ey + '" rx="5.9" ry="7.2" fill="#fff" stroke="' + ink + '" stroke-width="2.4"/>' +
          '<ellipse cx="' + rx + '" cy="' + ey + '" rx="5.9" ry="7.2" fill="#fff" stroke="' + ink + '" stroke-width="2.4"/>' +
          '<circle cx="' + lx + '" cy="' + (ey + 1.5) + '" r="3.7" fill="' + ink + '"/><circle cx="' + rx + '" cy="' + (ey + 1.5) + '" r="3.7" fill="' + ink + '"/>' +
          '<circle cx="' + (lx - 1.7) + '" cy="' + (ey - 2.4) + '" r="1.7" fill="#fff"/><circle cx="' + (rx - 1.7) + '" cy="' + (ey - 2.4) + '" r="1.7" fill="#fff"/>' +
          '<path d="M' + (lx - 7) + ' ' + (ey - 8) + ' l11 -4" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + (rx - 4) + ' ' + (ey - 12) + ' l11 4" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      case 'cry': // 嚎啕大哭（>< 紧闭眼 + 大泪珠喷泉）
        return '<path d="M' + (lx - 6.5) + ' ' + (ey - 4) + ' l6.5 4.5 l-6.5 4.5" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M' + (rx + 6.5) + ' ' + (ey - 4) + ' l-6.5 4.5 l6.5 4.5" stroke="' + ink + '" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M' + (lx + 1) + ' ' + (ey + 6) + ' q4 11 -1 15 q-6 -4 -4 -13z" fill="#8FD0F5" stroke="' + ink + '" stroke-width="1.8"/>' +
          '<path d="M' + (rx - 1) + ' ' + (ey + 6) + ' q-4 11 1 15 q6 -4 4 -13z" fill="#8FD0F5" stroke="' + ink + '" stroke-width="1.8"/>';
      default:
        return glossy(lx) + glossy(rx);
    }
  }
  function blush(lx, rx, y, op) {
    // 漫画式腮红：粉椭圆 + 斜线排线
    const hatch = function (x) {
      return '<path d="M' + (x - 3.8) + ' ' + (y + 2.8) + ' l7.6 -4.8 M' + (x - 3.8) + ' ' + (y + 6) + ' l7.6 -4.8" stroke="#FF6F82" stroke-width="2" stroke-linecap="round" opacity="0.8"/>';
    };
    return '<ellipse cx="' + lx + '" cy="' + y + '" rx="6" ry="3.8" fill="#FF9AA6" opacity="' + (op || 0.5) + '"/>' +
      '<ellipse cx="' + rx + '" cy="' + y + '" rx="6" ry="3.8" fill="#FF9AA6" opacity="' + (op || 0.5) + '"/>' +
      hatch(lx) + hatch(rx);
  }
  function mouthSmile(cx, y, kind) {
    const ink = PET_INK;
    kind = kind || 'smile';
    if (kind === 'open') { // 开口笑（口腔 + 小舌头）
      return '<path d="M' + (cx - 7) + ' ' + y + ' q7 9.5 14 0z" fill="#7E2A38" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="' + cx + '" cy="' + (y + 4.6) + '" rx="3.8" ry="2.3" fill="#FF8FA0"/>';
    }
    if (kind === 'cat') { // ω 猫嘴
      return '<path d="M' + (cx - 6) + ' ' + (y - 1) + ' q3 4.5 6 1.2 q3 3.3 6 -1.2" stroke="' + ink + '" stroke-width="2.3" fill="none" stroke-linecap="round"/>';
    }
    if (kind === 'wail') { // 大哭嘴
      return '<path d="M' + (cx - 6) + ' ' + (y - 2) + ' q6 -3.5 12 0 q-0.5 9 -6 9 q-5.5 0 -6 -9z" fill="#7E2A38" stroke="' + ink + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<ellipse cx="' + cx + '" cy="' + (y + 4.2) + '" rx="3.2" ry="2" fill="#FF8FA0"/>';
    }
    if (kind === 'flat') { // 委屈波浪嘴
      return '<path d="M' + (cx - 4.5) + ' ' + y + ' q2.2 -3 4.5 0 q2.3 3 4.5 0" stroke="' + ink + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    }
    // smile 小微笑
    return '<path d="M' + (cx - 4.2) + ' ' + y + ' q4.2 4.8 8.4 0" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
  }
  function faceMouth(face) {
    return face === 'happy' ? 'open' : face === 'sad' ? 'flat' : face === 'cry' ? 'wail' : 'smile';
  }

  /* 各形态的"身体"绘制（返回 svg 片段），坐标基于 120x120 画布
     设计原则：Q版大头身比 / 不对称小动作 / 搞怪细节 / 每只都有"梗" */
  const FORMS = {
    blob(p) { // 团子：软乎乎果冻 + 头顶小芽 + 挥手小手 + 抖动线
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<ellipse cx="60" cy="71" rx="33" ry="26" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="78" rx="20" ry="14" fill="' + a + '" opacity="0.8"/>' +
        '<path d="M60 46 q1 -8 5 -11" stroke="' + l + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="54" cy="34" rx="6.5" ry="3.6" fill="' + c + '" stroke="' + l + '" stroke-width="2" transform="rotate(-28 54 34)"/>' +
        '<ellipse cx="69" cy="32" rx="6.5" ry="3.6" fill="' + c + '" stroke="' + l + '" stroke-width="2" transform="rotate(22 69 32)"/>' +
        '<ellipse cx="28" cy="60" rx="6.5" ry="9" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(-32 28 60)"/>' +
        '<ellipse cx="92" cy="60" rx="6.5" ry="9" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(32 92 60)"/>' +
        '<ellipse cx="47" cy="96" rx="8" ry="5" fill="' + c + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<ellipse cx="73" cy="96" rx="8" ry="5" fill="' + c + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<path d="M24 46 q-5 7 0 14 M96 46 q5 7 0 14" stroke="' + l + '" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.55"/>' +
        eyesByFace(face, 46, 74, 64, l) + blush(39, 81, 72) + mouthSmile(60, 75, faceMouth(face));
    },
    bear(p) { // 小熊：圆耳 + 大鼻筒 + 举爪打招呼
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<circle cx="35" cy="43" r="11.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<circle cx="35" cy="43" r="5.5" fill="' + c + '" opacity="0.7"/>' +
        '<circle cx="85" cy="43" r="11.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<circle cx="85" cy="43" r="5.5" fill="' + c + '" opacity="0.7"/>' +
        '<ellipse cx="60" cy="72" rx="31" ry="27" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="81" rx="18" ry="14" fill="' + a + '"/>' +
        '<ellipse cx="30" cy="66" rx="7.5" ry="9.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(-30 30 66)"/>' +
        '<ellipse cx="90" cy="66" rx="7.5" ry="9.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(30 90 66)"/>' +
        '<ellipse cx="60" cy="78" rx="11.5" ry="8.5" fill="' + a + '" stroke="' + l + '" stroke-width="1.8"/>' +
        '<ellipse cx="60" cy="73.5" rx="4.4" ry="3.3" fill="' + l + '"/>' +
        eyesByFace(face, 47, 73, 57, l) + blush(40, 80, 66) + mouthSmile(60, 80, face === 'calm' ? 'cat' : faceMouth(face));
    },
    bunny(p) { // 兔兔：一只耳朵竖一只耳朵塌 + 大门牙（搞怪担当）
      const { b, a, c, l } = p.pal; const face = p.face;
      const teeth = (face === 'happy' || face === 'calm')
        ? '<rect x="56.6" y="79" width="3.4" height="5" rx="1.2" fill="#fff" stroke="' + l + '" stroke-width="1.4"/>' +
          '<rect x="60.4" y="79" width="3.4" height="5" rx="1.2" fill="#fff" stroke="' + l + '" stroke-width="1.4"/>'
        : '';
      return '<ellipse cx="44" cy="30" rx="8" ry="21" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" transform="rotate(-12 44 30)"/>' +
        '<ellipse cx="44" cy="30" rx="4" ry="13" fill="' + c + '" opacity="0.55" transform="rotate(-12 44 30)"/>' +
        '<ellipse cx="80" cy="38" rx="7.5" ry="19" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" transform="rotate(62 80 38)"/>' +
        '<ellipse cx="80" cy="38" rx="3.8" ry="11" fill="' + c + '" opacity="0.55" transform="rotate(62 80 38)"/>' +
        '<ellipse cx="60" cy="75" rx="28" ry="24" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="82" rx="16" ry="12" fill="' + a + '"/>' +
        '<circle cx="90" cy="84" r="6.5" fill="' + a + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<ellipse cx="31" cy="70" rx="6" ry="8.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.2" transform="rotate(-24 31 70)"/>' +
        eyesByFace(face, 47, 73, 65, l) + blush(41, 79, 74) + mouthSmile(60, 76, faceMouth(face)) + teeth;
    },
    cat(p) { // 小猫：尖耳 + 长胡须 + 小尖牙 + 条纹卷尾
      const { b, a, c, l } = p.pal; const face = p.face;
      const fang = (face === 'happy' || face === 'calm')
        ? '<path d="M55 76 l2.2 4.4 l2.2 -4.4z" fill="#fff" stroke="' + l + '" stroke-width="1.2"/>'
        : '';
      return '<path d="M33 58 L37 34 L55 47 Z" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M87 58 L83 34 L65 47 Z" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M39 52 L43 44 L49 50 Z" fill="' + c + '" opacity="0.6"/>' +
        '<path d="M81 52 L77 44 L71 50 Z" fill="' + c + '" opacity="0.6"/>' +
        '<path d="M89 80 q17 5 15 -17" stroke="' + b + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        '<path d="M95.5 76.5 q6 -1.5 7 -7 M92 80.5 q7 0.5 10.5 -4" stroke="' + c + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="60" cy="72" rx="29" ry="25" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="81" rx="16" ry="12" fill="' + a + '"/>' +
        '<path d="M60 71 l-3.2 3.4 h6.4z" fill="#FF9AA6" stroke="' + l + '" stroke-width="1.2"/>' +
        '<path d="M30 64 l-13 -3 M30 70 l-13 0.5 M30 76 l-12 3.5" stroke="' + l + '" stroke-width="1.7" stroke-linecap="round" opacity="0.75"/>' +
        '<path d="M90 64 l13 -3 M90 70 l13 0.5 M90 76 l12 3.5" stroke="' + l + '" stroke-width="1.7" stroke-linecap="round" opacity="0.75"/>' +
        eyesByFace(face, 47, 73, 61, l) + blush(41, 79, 70) + mouthSmile(60, 74, face === 'calm' ? 'cat' : faceMouth(face)) + fang;
    },
    slime(p) { // 史莱姆：融化滴落 + 体内气泡 + 头顶呆毛
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<path d="M60 34 q27 4 31 32 q2 10 -3 15 q3 11 -3 11 q-6 0 -6 -9 q-9 9 -19 9 q-10 0 -19 -9 q0 9 -6 9 q-6 0 -3 -11 q-5 -5 -3 -15 q4 -28 30 -32z" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M60 34 q-23 6 -25 30 q-1 18 23 25 q-5 -17 -5 -38 q3 -13 7 -17z" fill="' + a + '" opacity="0.7"/>' +
        '<ellipse cx="47" cy="50" rx="6.5" ry="4.5" fill="#fff" opacity="0.6" transform="rotate(-25 47 50)"/>' +
        '<circle cx="70" cy="72" r="3.2" fill="#fff" opacity="0.55"/>' +
        '<circle cx="77" cy="83" r="2.1" fill="#fff" opacity="0.5"/>' +
        '<circle cx="50" cy="80" r="1.8" fill="#fff" opacity="0.45"/>' +
        '<path d="M57 33 q1 -8 6 -10" stroke="' + l + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        eyesByFace(face, 47, 73, 65, l) + blush(40, 80, 75) + mouthSmile(60, 76, faceMouth(face));
    },
    sheep(p) { // 羊咩：爆炸云卷毛 + 探出的脸 + 细棍腿（反差萌）
      const { b, a, c, l } = p.pal; const face = p.face;
      let puff = '';
      [[33, 56], [87, 56], [29, 74], [91, 74], [42, 44], [78, 44], [60, 38], [60, 94], [37, 90], [83, 90]].forEach(function (q) {
        puff += '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="11.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.4"/>';
      });
      return puff +
        '<path d="M52 96 v9 M68 96 v9" stroke="' + l + '" stroke-width="3.4" stroke-linecap="round"/>' +
        '<ellipse cx="49" cy="106" rx="5" ry="2.6" fill="' + l + '"/><ellipse cx="71" cy="106" rx="5" ry="2.6" fill="' + l + '"/>' +
        '<circle cx="60" cy="69" r="21" fill="' + a + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<path d="M48 51 q5 -8 12 -5 q7 -3 12 5" stroke="' + c + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="40" cy="66" rx="4.5" ry="7" fill="' + a + '" stroke="' + l + '" stroke-width="2" transform="rotate(20 40 66)"/>' +
        '<ellipse cx="80" cy="66" rx="4.5" ry="7" fill="' + a + '" stroke="' + l + '" stroke-width="2" transform="rotate(-20 80 66)"/>' +
        eyesByFace(face, 51, 69, 66, l) + blush(45, 75, 75) + mouthSmile(60, 77, face === 'calm' ? 'cat' : faceMouth(face));
    },
    dog(p) { // 柴犬：塌拉耳 + 吐舌头 + 摇尾巴残影（狗勾就是开心）
      const { b, a, c, l } = p.pal; const face = p.face;
      const tongue = (face === 'happy' || face === 'calm')
        ? '<path d="M56 78 q-1 11 4 11 q5 0 4 -11z" fill="#FF8FA0" stroke="' + l + '" stroke-width="2"/>' +
          '<path d="M60 80 v6" stroke="#E2556B" stroke-width="1.4"/>'
        : '';
      return '<ellipse cx="33" cy="56" rx="9.5" ry="17" fill="' + c + '" stroke="' + l + '" stroke-width="2.6" transform="rotate(28 33 56)"/>' +
        '<ellipse cx="87" cy="56" rx="9.5" ry="17" fill="' + c + '" stroke="' + l + '" stroke-width="2.6" transform="rotate(-28 87 56)"/>' +
        '<path d="M87 86 q15 -3 13 -17" stroke="' + b + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path d="M96 62 q7 -5 5 -12 M90 58 q3 -7 0 -12" stroke="' + l + '" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>' +
        '<ellipse cx="60" cy="73" rx="29" ry="25" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="83" rx="17" ry="12" fill="' + a + '"/>' +
        '<ellipse cx="60" cy="75" rx="9.5" ry="7" fill="' + a + '" stroke="' + l + '" stroke-width="1.6"/>' +
        '<ellipse cx="60" cy="71.5" rx="4.2" ry="3.2" fill="' + l + '"/>' +
        eyesByFace(face, 48, 72, 60, l) + blush(42, 78, 68) +
        (tongue ? '' : mouthSmile(60, 78, faceMouth(face))) + tongue;
    },
    bird(p) { // 小鸟：呆毛三根 + 张嘴唱歌 + 音符
      const { b, a, c, l } = p.pal; const face = p.face;
      const note = (face === 'happy')
        ? '<path d="M96 46 v-11 l7 -2 v11" stroke="' + l + '" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<ellipse cx="94" cy="47" rx="3.4" ry="2.6" fill="' + l + '" transform="rotate(-18 94 47)"/>' +
          '<ellipse cx="101" cy="44" rx="3.4" ry="2.6" fill="' + l + '" transform="rotate(-18 101 44)"/>'
        : '';
      return '<path d="M60 42 q28 2 28 29 q0 27 -28 27 q-28 0 -28 -27 q0 -27 28 -29z" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="78" rx="18" ry="16" fill="' + a + '"/>' +
        '<ellipse cx="38" cy="70" rx="9.5" ry="13" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(-18 38 70)"/>' +
        '<ellipse cx="82" cy="70" rx="9.5" ry="13" fill="' + b + '" stroke="' + l + '" stroke-width="2.4" transform="rotate(18 82 70)"/>' +
        '<path d="M57 41 q-2 -11 -8 -14 M61 41 q1 -12 -2 -17 M65 42 q5 -10 3 -15" stroke="' + l + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M84 60 l11 4 l-11 5 l-2.5 -4.5z" fill="#F5A623" stroke="' + l + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M52 97 v6 M68 97 v6" stroke="#E08A2E" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="49" cy="104" rx="6" ry="3" fill="#E08A2E"/><ellipse cx="71" cy="104" rx="6" ry="3" fill="#E08A2E"/>' +
        eyesByFace(face, 49, 71, 61, l) + blush(43, 73, 69) + note;
    },
    penguin(p) { // 企鹅：圆筒身 + 举鳍挥手 + 啪嗒脚丫
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<ellipse cx="60" cy="69" rx="27" ry="31" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="77" rx="18" ry="22" fill="' + a + '"/>' +
        '<ellipse cx="32" cy="62" rx="7" ry="17" fill="' + b + '" stroke="' + l + '" stroke-width="2.2" transform="rotate(38 32 62)"/>' +
        '<ellipse cx="88" cy="72" rx="7" ry="17" fill="' + b + '" stroke="' + l + '" stroke-width="2.2" transform="rotate(-14 88 72)"/>' +
        '<path d="M60 57 l7.5 5 l-7.5 5 l-7.5 -5z" fill="#F5A623" stroke="' + l + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<ellipse cx="49" cy="99" rx="7.5" ry="4" fill="#F5A623" stroke="' + l + '" stroke-width="1.8"/>' +
        '<ellipse cx="71" cy="99" rx="7.5" ry="4" fill="#F5A623" stroke="' + l + '" stroke-width="1.8"/>' +
        eyesByFace(face, 49, 71, 50, l) + blush(43, 77, 60);
    },
    dragon(p) { // 小龙：圆角 + 小翅膀 + 喷嚏喷星星（梗）
      const { b, a, c, l } = p.pal; const face = p.face;
      const sneeze = (face === 'happy')
        ? '<path d="M88 40 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#FFD34D" stroke="' + l + '" stroke-width="1.4"/>' +
          '<circle cx="97" cy="50" r="1.8" fill="#FFD34D"/><circle cx="82" cy="32" r="1.5" fill="#FFD34D"/>'
        : '';
      return '<path d="M41 46 q-9 -15 2 -19 q5 6 6 15z" fill="' + c + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M79 46 q9 -15 -2 -19 q-5 6 -6 15z" fill="' + c + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M29 64 q-17 -13 -5 -22 q7 8 15 12z" fill="' + a + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M91 64 q17 -13 5 -22 q-7 8 -15 12z" fill="' + a + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M33 58 l-4 -4 M38 52 l-4 -5 M87 58 l4 -4 M82 52 l4 -5" stroke="' + l + '" stroke-width="1.6" opacity="0.5"/>' +
        '<path d="M85 88 q16 4 15 -13 q-6 5 -12 3z" fill="' + b + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<path d="M97 75 l3 -3 l1 4z" fill="' + c + '" stroke="' + l + '" stroke-width="1.4"/>' +
        '<ellipse cx="60" cy="72" rx="29" ry="26" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="81" rx="17" ry="13" fill="' + a + '"/>' +
        '<path d="M51 44 q9 -6 18 0" stroke="' + c + '" stroke-width="2.8" fill="none" opacity="0.75"/>' +
        eyesByFace(face, 48, 72, 62, l) + blush(41, 79, 72) + mouthSmile(60, 74, faceMouth(face)) + sneeze;
    },
    plant(p) { // 盆栽芽：花盆身体 + 两片大叶 + 露珠
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<path d="M37 96 L44 113 L76 113 L83 96 Z" fill="#E0A073" stroke="' + l + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M35 92 h50 v7 h-50z" fill="#C98757" stroke="' + l + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<ellipse cx="60" cy="66" rx="27" ry="24" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<ellipse cx="60" cy="74" rx="17" ry="13" fill="' + a + '" opacity="0.85"/>' +
        '<path d="M60 93 v-13" stroke="#6FAE52" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M60 44 q-15 -5 -19 -17 q15 -3 19 9z" fill="' + c + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M60 44 q15 -5 19 -17 q-15 -3 -19 9z" fill="#87C96B" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<circle cx="76" cy="26" r="3" fill="#BFE0F5" stroke="' + l + '" stroke-width="1.4"/>' +
        '<circle cx="75" cy="25" r="1" fill="#fff"/>' +
        eyesByFace(face, 49, 71, 63, l) + blush(43, 77, 72) + mouthSmile(60, 73, faceMouth(face));
    },
    whale(p) { // 鲸鱼：喷水柱带星星 + 大尾巴 + 豆豆眉
      const { b, a, c, l } = p.pal; const face = p.face;
      return '<path d="M92 62 q14 -10 13 -24 q-8 8 -15 10z" fill="' + b + '" stroke="' + l + '" stroke-width="2.2" stroke-linejoin="round"/>' +
        '<path d="M50 40 q-3 -9 3 -12 M58 38 q1 -10 7 -12 M50 40 q8 -4 15 -2" stroke="' + c + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="46" cy="24" r="2.4" fill="#BFE0F5" stroke="' + l + '" stroke-width="1.2"/>' +
        '<circle cx="62" cy="21" r="2.8" fill="#BFE0F5" stroke="' + l + '" stroke-width="1.2"/>' +
        '<circle cx="72" cy="28" r="2" fill="#BFE0F5" stroke="' + l + '" stroke-width="1.2"/>' +
        '<path d="M28 72 q4 -27 32 -27 q29 0 33 20 q3 13 -10 17 q-25 8 -43 4 q-14 -4 -12 -14z" fill="' + b + '" stroke="' + l + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M38 87 q25 9 47 -2 q-21 13 -47 2z" fill="' + a + '"/>' +
        '<path d="M42 78 q-8 2 -10 8 q7 2 12 -2z" fill="' + b + '" stroke="' + l + '" stroke-width="2"/>' +
        '<circle cx="48" cy="56" r="1.8" fill="#fff" opacity="0.9"/><circle cx="60" cy="50" r="1.6" fill="#fff" opacity="0.8"/>' +
        '<circle cx="72" cy="58" r="1.6" fill="#fff" opacity="0.8"/><circle cx="66" cy="66" r="1.3" fill="#fff" opacity="0.7"/>' +
        eyesByFace(face, 43, 59, 66, l) + blush(37, 63, 74) + mouthSmile(51, 76, faceMouth(face));
    },
    lion(p) { // 招财小狮：爆炸鬃毛 + 圆耳 + 小尾巴球
      const { b, a, c, l } = p.pal; const face = p.face;
      let mane = '';
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const x = 60 + Math.cos(ang) * 33.5, y = 69 + Math.sin(ang) * 30;
        mane += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="10.5" fill="' + c + '" stroke="' + l + '" stroke-width="1.6" opacity="0.98"/>';
      }
      return mane +
        '<path d="M87 86 q15 0 13 -14 q-6 6 -10 4z" fill="' + b + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<circle cx="100" cy="70" r="6" fill="' + c + '" stroke="' + l + '" stroke-width="2"/>' +
        '<circle cx="45" cy="46" r="7.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<circle cx="75" cy="46" r="7.5" fill="' + b + '" stroke="' + l + '" stroke-width="2.2"/>' +
        '<circle cx="60" cy="69" r="26" fill="' + b + '" stroke="' + l + '" stroke-width="2.6"/>' +
        '<circle cx="60" cy="77" r="17" fill="' + a + '"/>' +
        '<path d="M60 73 l-3.4 3.4 h6.8z" fill="' + l + '"/>' +
        '<circle cx="52" cy="80" r="1" fill="' + l + '" opacity="0.5"/><circle cx="55" cy="83" r="1" fill="' + l + '" opacity="0.5"/>' +
        '<circle cx="68" cy="80" r="1" fill="' + l + '" opacity="0.5"/><circle cx="65" cy="83" r="1" fill="' + l + '" opacity="0.5"/>' +
        eyesByFace(face, 49, 71, 62, l) + blush(43, 77, 72) + mouthSmile(60, 80, faceMouth(face));
    }
  };

  function drawDeco(kind, pal) {
    switch (kind) {
      case 'strawberry':
        return '<path d="M60 22 q10 0 10 9 q0 10 -10 15 q-10 -5 -10 -15 q0 -9 10 -9z" fill="#FF6B84" stroke="#8C4553" stroke-width="2"/>' +
          '<path d="M54 24 q6 -5 12 0 q-6 -2 -12 0z" fill="#7FC35B" stroke="#3C7440" stroke-width="1.6"/>';
      case 'sesame':
        return '<circle cx="54" cy="52" r="1.6" fill="#4C4457" opacity="0.6"/><circle cx="66" cy="48" r="1.6" fill="#4C4457" opacity="0.6"/>' +
          '<circle cx="70" cy="58" r="1.4" fill="#4C4457" opacity="0.6"/>';
      case 'cloud':
        return '<ellipse cx="60" cy="26" rx="16" ry="7" fill="#fff" stroke="#7E7E8C" stroke-width="2"/>' +
          '<circle cx="52" cy="22" r="6" fill="#fff" stroke="#7E7E8C" stroke-width="2"/><circle cx="66" cy="23" r="5" fill="#fff" stroke="#7E7E8C" stroke-width="2"/>';
      case 'star':
        return '<path d="M60 16 l3.5 7.5 8 1 -6 5.5 1.8 8 -7.3 -4 -7.3 4 1.8 -8 -6 -5.5 8 -1z" fill="#FFD34D" stroke="#B3771A" stroke-width="1.8"/>';
      case 'sparkle':
        return '<path d="M36 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff"/>' +
          '<path d="M88 52 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#FFE9A8"/>' +
          '<path d="M70 30 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4z" fill="#fff"/>';
      case 'coin':
        return '<circle cx="60" cy="26" r="9" fill="#FFD34D" stroke="#B3771A" stroke-width="2"/>' +
          '<path d="M60 21 v10 M57 23.5 h6" stroke="#B3771A" stroke-width="1.8" stroke-linecap="round"/>';
      case 'leaf':
        return '<path d="M60 40 q-12 -4 -14 -14 q12 -2 14 8z" fill="#6FAE52" stroke="#3A6231" stroke-width="2"/>' +
          '<path d="M60 40 q12 -4 14 -14 q-12 -2 -14 8z" fill="#87C96B" stroke="#3A6231" stroke-width="2"/>';
      case 'bubble':
        return '<circle cx="42" cy="52" r="3" fill="#fff" opacity="0.8"/><circle cx="76" cy="60" r="2.4" fill="#fff" opacity="0.75"/>' +
          '<circle cx="52" cy="44" r="2" fill="#fff" opacity="0.7"/>';
      case 'berry':
        return '<circle cx="54" cy="50" r="3" fill="#6A5AA8" opacity="0.6"/><circle cx="68" cy="55" r="2.6" fill="#6A5AA8" opacity="0.6"/>' +
          '<circle cx="60" cy="44" r="2.2" fill="#6A5AA8" opacity="0.5"/>';
      case 'matcha':
        return '<path d="M50 44 q4 -6 8 -1 q4 -5 8 1" stroke="#7FA45C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      case 'twig':
        return '<path d="M60 36 q2 -8 6 -10" stroke="#8A6A45" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
          '<ellipse cx="68" cy="25" rx="5" ry="3" fill="#9DBF57" stroke="#4C6132" stroke-width="1.6"/>';
      default: return '';
    }
  }

  function stageExtra(stage, pal) {
    if (stage === '星辰') {
      return '<path d="M32 44 l2.4 5.4 5.4 2.4 -5.4 2.4 -2.4 5.4 -2.4 -5.4 -5.4 -2.4 5.4 -2.4z" fill="#FFE9A8" opacity="0.95"/>' +
        '<path d="M92 36 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2z" fill="#FFE9A8" opacity="0.95"/>' +
        '<ellipse cx="60" cy="104" rx="30" ry="6" fill="#FFD34D" opacity="0.35"/>';
    }
    if (stage === '成年') {
      return '<path d="M40 92 q20 10 40 0 q-4 10 -20 12 q-16 -2 -20 -12z" fill="' + pal.c + '" opacity="0.9"/>' +
        '<path d="M78 94 q6 8 2 14" stroke="' + pal.c + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    }
    if (stage === '少年') {
      return '<path d="M42 88 q18 8 36 0" stroke="' + pal.c + '" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85"/>';
    }
    return '';
  }

  /* 主绘制：返回完整 <svg> 字符串（漫画风：墨线描边 + 赛璐璐上色） */
  function petSvg(pet, size) {
    const b0 = BREED_MAP[pet.breed] || BREEDS[0];
    // 墨线强制：描边/瞳孔/鼻头统一墨黑，并加粗主轮廓
    const b = Object.assign({}, b0, { pal: Object.assign({}, b0.pal, { l: '#1c1710' }) });
    const face = pet.status === '旅行中' ? 'calm' : moodFace(pet);
    const stage = pet.stage || stageOfLv(pet.level || 1);
    let scale = stage === '幼崽' ? 0.78 : (stage === '少年' ? 0.88 : (stage === '成年' ? 0.96 : 1.02));
    const ctx = { pal: b.pal, face: face, stage: stage };
    let body;
    if (stage === '蛋') {
      const pal = b.pal;
      body = '<ellipse cx="60" cy="68" rx="26" ry="31" fill="' + pal.a + '" stroke="' + pal.l + '" stroke-width="3.4"/>' +
        '<circle cx="52" cy="60" r="5" fill="' + pal.c + '" opacity="0.5"/><circle cx="70" cy="76" r="6" fill="' + pal.c + '" opacity="0.45"/>' +
        '<circle cx="62" cy="52" r="3.4" fill="' + pal.c + '" opacity="0.4"/>' +
        '<path d="M44 88 q16 6 32 0" stroke="' + pal.l + '" stroke-width="2" fill="none" opacity="0.5"/>';
      scale = 0.85;
    } else {
      const fn = FORMS[b.form] || FORMS.blob;
      body = fn(ctx);
    }
    const deco = (stage === '蛋') ? '' : drawDeco(DECO[pet.breed], b.pal);
    const extra = (stage === '蛋') ? '' : stageExtra(stage, b.pal);
    // 漫画化后处理：主轮廓统一加粗
    let inked = body + deco + extra;
    inked = inked
      .replace(/stroke-width="2\.6"/g, 'stroke-width="3.4"')
      .replace(/stroke-width="2\.4"/g, 'stroke-width="3"')
      .replace(/stroke-width="2\.2"/g, 'stroke-width="2.7"');
    // 头顶高光弧（赛璐璐质感）
    const shine = '<path d="M43 51 q7 -9 17 -10" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity="0.6"/>';
    const w = size || 132;
    // Q版漫画感：整体微歪头 + 横向压扁（呆萌），配合粗墨线
    const tilt = stage === '蛋' ? -4 : -2.5;
    const squash = stage === '蛋' ? '' : ' scale(1.05 0.95)';
    return '<svg class="manga-pet" viewBox="0 0 120 120" width="' + w + '" height="' + w + '" style="display:block">' +
      '<ellipse cx="60" cy="107" rx="30" ry="5.5" fill="rgba(0,0,0,.12)"/>' +
      '<g transform="translate(60 66) rotate(' + tilt + ') scale(' + scale + ')' + squash + ' translate(-60 -66)">' + inked + shine + '</g>' +
      '</svg>';
  }

  /* 房间背景（随时间变化的小窗） */
  function roomSvg() {
    const h = new Date().getHours();
    const night = (h >= 19 || h < 6);
    const sky = night ? ['#3B4A78', '#5C6BA0'] : (h < 11 ? ['#BFE0F5', '#E6F3FF'] : ['#FFE1B8', '#FFF0D8']);
    const sunmoon = night
      ? '<circle cx="92" cy="26" r="7" fill="#FFF3C4"/><circle cx="95" cy="23" r="6" fill="' + sky[0] + '"/>'
      : '<circle cx="92" cy="26" r="7" fill="#FFD34D"/>';
    return '<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" style="width:100%;height:150px;display:block">' +
      '<defs><linearGradient id="wtop" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + sky[0] + '"/><stop offset="100%" stop-color="' + sky[1] + '"/></linearGradient>' +
      '<linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FBF3E3"/><stop offset="100%" stop-color="#F3E6CE"/></linearGradient></defs>' +
      '<rect width="300" height="150" fill="url(#wallg)"/>' +
      '<rect y="118" width="300" height="32" fill="#E4C99C"/>' +
      '<rect y="118" width="300" height="4" fill="#C8A775"/>' +
      '<rect x="66" y="18" width="64" height="52" rx="6" fill="url(#wtop)" stroke="#B99A63" stroke-width="3"/>' +
      '<path d="M98 18 v52 M66 44 h64" stroke="#B99A63" stroke-width="3"/>' + sunmoon +
      '<rect x="226" y="86" width="52" height="34" rx="5" fill="#D9A87C" stroke="#A87B52" stroke-width="3"/>' +
      '<path d="M226 96 h52" stroke="#A87B52" stroke-width="2.4"/>' +
      '<rect x="234" y="72" width="8" height="16" fill="#F5D9A8" stroke="#A87B52" stroke-width="2"/>' +
      '<rect x="246" y="70" width="8" height="18" fill="#E9C9A0" stroke="#A87B52" stroke-width="2"/>' +
      '<ellipse cx="52" cy="120" rx="40" ry="8" fill="#E9D5BA" stroke="#C8A775" stroke-width="2.6"/>' +
      '<path d="M18 118 q34 -14 68 0 q-34 14 -68 0z" fill="#F6E7D2" stroke="#C8A775" stroke-width="2.4"/>' +
      '<circle cx="150" cy="112" r="14" fill="#CFE8C0" stroke="#6FAE52" stroke-width="2.6"/>' +
      '<path d="M150 112 q-6 -8 -10 -10 q8 -2 12 6z" fill="#87C96B" stroke="#3A6231" stroke-width="1.8"/>' +
      '<path d="M150 112 q6 -8 10 -10 q-8 -2 -12 6z" fill="#9ED678" stroke="#3A6231" stroke-width="1.8"/>' +
      '</svg>';
  }

  /* 明信片场景（按目的地配色生成的小风景） */
  function postcardSvg(spot, size) {
    const s = SCENE_PAL[spot.scene] || SCENE_PAL.hill;
    const gid = 'pc' + Math.random().toString(36).slice(2, 7);
    const night = ['firefly', 'night', 'lake', 'aurora', 'lighthouse', 'fireworks', 'galaxy'].indexOf(spot.scene) >= 0;
    let sky = '<circle cx="240" cy="34" r="16" fill="' + (night ? '#FFF3C4' : '#FFD34D') + '" opacity="0.95"/>';
    if (night) {
      sky = '<circle cx="240" cy="34" r="15" fill="#FFF3C4"/><circle cx="246" cy="30" r="13" fill="' + s.sky[0] + '"/>';
      for (let i = 0; i < 16; i++) {
        const x = 12 + Math.random() * 260, y = 10 + Math.random() * 70, r = 0.8 + Math.random() * 1.6;
        sky += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="#fff" opacity="' + (0.5 + Math.random() * 0.5).toFixed(2) + '"/>';
      }
      if (spot.scene === 'aurora') {
        sky += '<path d="M0 60 q60 -30 130 -6 q70 24 170 -14" stroke="#57C7B8" stroke-width="9" fill="none" opacity="0.5"/>' +
          '<path d="M0 74 q80 -26 140 0 q60 26 160 -10" stroke="#8FD9C8" stroke-width="7" fill="none" opacity="0.4"/>';
      }
      if (spot.scene === 'fireworks') {
        sky += '<g stroke="#FF8FB1" stroke-width="2.4">' +
          '<path d="M70 40 l0 -14 M70 40 l10 -10 M70 40 l-10 -10 M70 40 l14 0 M70 40 l-14 0"/>' +
          '<g opacity="0.7" transform="translate(190 26)"><path d="M0 0 l0 -12 M0 0 l9 -8 M0 0 l-9 -8 M0 0 l12 0 M0 0 l-12 0"/></g></g>';
      }
    } else {
      sky += '<ellipse cx="60" cy="30" rx="22" ry="10" fill="#fff" opacity="0.85"/><ellipse cx="80" cy="26" rx="16" ry="8" fill="#fff" opacity="0.7"/>' +
        '<ellipse cx="176" cy="46" rx="18" ry="8" fill="#fff" opacity="0.6"/>';
    }
    let feature = '';
    if (spot.scene === 'station') feature = '<rect x="30" y="92" width="60" height="30" rx="4" fill="#8E86B4" stroke="#3F3A5C" stroke-width="2"/><path d="M26 92 h68 l-8 -10 h-52z" fill="#655E8C" stroke="#3F3A5C" stroke-width="2"/>';
    if (spot.scene === 'lighthouse') feature = '<path d="M196 118 l6 -46 h14 l6 46z" fill="#F5F0E6" stroke="#2F4670" stroke-width="2"/><rect x="200" y="66" width="18" height="10" fill="#FFD34D" stroke="#2F4670" stroke-width="2"/>';
    if (spot.scene === 'shrine') feature = '<path d="M150 118 v-34 h44 v34z" fill="#C9D7E8" stroke="#7F8FA8" stroke-width="2"/><path d="M144 84 l28 -18 l28 18z" fill="#9FB2CC" stroke="#7F8FA8" stroke-width="2"/>';
    if (spot.scene === 'bakery') feature = '<rect x="140" y="94" width="46" height="24" fill="#C08E52" stroke="#6F4B24" stroke-width="2"/><path d="M136 94 l25 -14 l25 14z" fill="#E6BE86" stroke="#6F4B24" stroke-width="2"/>';
    if (spot.scene === 'desert') feature = '<path d="M120 118 q10 -30 24 -30 q14 0 24 30z" fill="#E0A45C" stroke="#8F5F27" stroke-width="2"/>';
    if (spot.scene === 'rainbow') feature = '<path d="M20 118 a120 90 0 0 1 240 0" stroke="#FF8FB1" stroke-width="7" fill="none" opacity="0.8"/><path d="M34 118 a106 78 0 0 1 212 0" stroke="#FFD34D" stroke-width="7" fill="none" opacity="0.8"/><path d="M48 118 a92 66 0 0 1 184 0" stroke="#7FC6F0" stroke-width="7" fill="none" opacity="0.8"/>';
    if (spot.scene === 'postoffice') feature = '<rect x="128" y="92" width="44" height="26" fill="#8FC3DE" stroke="#3F7EA6" stroke-width="2"/><path d="M124 92 l24 -12 l24 12z" fill="#5FA1C4" stroke="#3F7EA6" stroke-width="2"/>';
    if (spot.scene === 'museum') feature = '<rect x="136" y="96" width="38" height="22" fill="#C4AED8" stroke="#5F4B85" stroke-width="2"/><path d="M130 96 l25 -14 l25 14z" fill="#9C86BE" stroke="#5F4B85" stroke-width="2"/>';
    if (spot.scene === 'snow' || spot.scene === 'aurora') feature = '<path d="M20 118 l30 -40 l22 30 l18 -22 l26 32z" fill="#fff" stroke="#BCCFE6" stroke-width="2"/>';
    if (spot.scene === 'onsen') feature = '<ellipse cx="240" cy="112" rx="40" ry="14" fill="#9BC9B6" stroke="#4C8573" stroke-width="2"/><ellipse cx="240" cy="110" rx="30" ry="9" fill="#C4E4D8" opacity="0.8"/>';
    if (spot.scene === 'galaxy') feature = '<ellipse cx="150" cy="70" rx="90" ry="16" fill="#6B5BB5" opacity="0.5"/><ellipse cx="150" cy="70" rx="60" ry="10" fill="#B9A8FF" opacity="0.4"/>';
    const w = size || 300;
    return '<svg viewBox="0 0 300 150" width="100%" style="display:block;border-radius:8px">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + s.sky[0] + '"/><stop offset="100%" stop-color="' + s.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="300" height="150" fill="url(#' + gid + ')"/>' + sky +
      '<path d="M0 108 q60 -26 130 -8 q70 18 170 -12 v62 H0z" fill="' + s.far + '" opacity="0.9"/>' +
      '<path d="M0 124 q70 -18 140 -2 q60 14 160 -10 v38 H0z" fill="' + s.mid + '"/>' +
      feature +
      '<path d="M0 138 q80 -12 160 0 q70 10 140 -6 v20 H0z" fill="' + s.near + '"/>' +
      '</svg>';
  }

  window.__PET_DRAW__ = { petSvg, roomSvg, postcardSvg, FORMS, eyesByFace, BREEDS, SPOTS };
  /* ============================================================
     12) UI 状态 & 主渲染调度（单向：事件 -> 数据 -> renderPets）
     ============================================================ */
  const ui = { tab: 'room', petId: null, sub: 'card', adoptOpen: false, adoptPool: [], gameState: null, feedOpen: false, tripTool: '', tripBento: [] };

  /* 提交单只宠物的修改：按 id 回写到最新列表，避免被旧副本覆盖 */
  function commitPets(p) {
    const list = getPets();
    const i = list.findIndex(x => x.id === p.id);
    if (i >= 0) list[i] = p; else list.push(p);
    savePets(list);
  }

  function currentPet() {
    const list = getPets();
    if (!list.length) return null;
    let p = list.filter(x => x.id === ui.petId)[0];
    if (!p) p = list[0];
    return p;
  }

  /* 到期检查（统一在渲染前跑一次） */
  function tickPets() {
    const list = getPets();
    let dirty = false;
    list.forEach(p => {
      applyDecay(p);
      if (p.status === '休息' && p.returnAt && Date.now() >= p.returnAt) { p.status = '在家'; p.returnAt = 0; dirty = true; }
      if (p.status === '旅行中' && p.returnAt && Date.now() >= p.returnAt && !p.pendingGift) {
        p.pendingGift = buildTripResult(p);
        dirty = true;
      }
    });
    if (dirty) savePets(list);
    return dirty;
  }

  function renderPets() {
    tickPets();
    const host = document.getElementById('petBody');
    if (!host) return;
    const pets = getPets();
    if (!pets.length) { renderAdopt(host); return; }
    const p = currentPet();
    if (!p) { renderAdopt(host); return; }
    ui.petId = p.id;

    let html = '';
    html += renderPetTabs(pets);
    html += renderSubTabs();
    if (ui.adoptOpen) { host.innerHTML = html + renderAdoptPanel(); return; }
    if (ui.tab === 'room') html += renderRoom(p);
    else if (ui.tab === 'travel') html += renderTravel(p);
    else if (ui.tab === 'book') html += renderBook();
    else html += renderBagUi(p);
    host.innerHTML = html;
    startRoomTickers(p);
  }
  window.renderPets = renderPets;

  /* ---------- 顶部宠物切换 ---------- */
  function renderPetTabs(pets) {
    let h = '<div class="pet-tabs">';
    pets.forEach(p => {
      const b = BREED_MAP[p.breed] || BREEDS[0];
      const act = p.id === ui.petId ? ' active' : '';
      h += '<button class="pet-chip' + act + '" onclick="window.petSwitch(\'' + p.id + '\')">' +
        '<span class="pet-chip-ico">' + petSvg({ breed: p.breed, status: '在家', mood: 80, energy: 90, level: 1, stage: '幼崽' }, 40) + '</span>' +
        '<span class="pet-chip-name">' + esc(p.name) + '</span>' +
        (p.status === '旅行中' ? '<span class="pet-chip-dot away"></span>' : (p.mood < 35 || p.hun < 30 ? '<span class="pet-chip-dot need"></span>' : '')) +
        '</button>';
    });
    if (pets.length < MAX_PETS) {
      h += '<button class="pet-chip add" onclick="window.petOpenAdopt()"><span class="pet-chip-add">＋</span><span class="pet-chip-name">领养</span></button>';
    }
    h += '</div>';
    return h;
  }

  function renderSubTabs() {
    const tabs = [['room', '我的房间', '🏠'], ['travel', '去旅行', '🧳'], ['book', '图鉴', '📔'], ['bag', '背包', '🎒']];
    let h = '<div class="pet-subtabs">';
    tabs.forEach(t => {
      h += '<button class="pet-subtab' + (ui.tab === t[0] ? ' active' : '') + '" onclick="window.petTab(\'' + t[0] + '\')">' +
        '<span class="pst-ico">' + t[2] + '</span>' + t[1] + '</button>';
    });
    h += '</div>';
    return h;
  }

  /* ============================================================
     13) 房间
     ============================================================ */
  function renderRoom(p) {
    const b = BREED_MAP[p.breed] || BREEDS[0];
    const rs = RARITY_STYLE[b.rarity] || RARITY_STYLE['普通'];
    const face = moodFace(p);
    let h = '';

    /* 房间场景 */
    h += '<section class="pet-card room-scene">' + roomSvg() +
      '<div class="room-pet" onclick="window.petPat()">' + petSvg(p, 118) + '</div>' +
      '<div class="room-bubble">' + esc(moodText(p)) + '</div>' +
      '<div class="room-hint">点点它试试 👆</div>' +
      '</section>';

    /* 状态 */
    h += '<section class="pet-card">' +
      '<div class="pet-row-head"><span class="pet-title">' + esc(p.name) + '</span>' +
      '<span class="rarity-badge" style="background:' + rs.bg + ';color:' + rs.fg + '">' + rs.label + ' · ' + b.rarity + '</span></div>' +
      '<div class="pet-sub">' + esc(b.name) + ' · ' + esc(p.stage || stageOfLv(p.level)) + ' · Lv.' + p.level + '</div>' +
      '<div class="pet-expbar"><div class="pet-expfill" style="width:' + Math.round((p.exp || 0) / expNeed(p.level) * 100) + '%"></div>' +
      '<span class="pet-exptext">' + (p.exp || 0) + ' / ' + expNeed(p.level) + ' EXP</span></div>';

    const bars = [['心情', p.mood, '#FF9AA6', '💗'], ['饱食', p.hun, '#F5A623', '🍽'], ['清洁', p.clean, '#7FC6F0', '🛁'], ['体力', p.energy, '#9ED678', '⚡']];
    h += '<div class="pet-bars">';
    bars.forEach(x => {
      h += '<div class="pet-bar"><span class="pb-ico">' + x[3] + '</span><span class="pb-label">' + x[0] + '</span>' +
        '<span class="pb-track"><i style="width:' + clamp(x[1], 0, 100) + '%;background:' + x[2] + '"></i></span>' +
        '<span class="pb-num">' + Math.round(x[1]) + '</span></div>';
    });
    h += '<div class="pet-bar"><span class="pb-ico">💞</span><span class="pb-label">亲密度</span>' +
      '<span class="pb-track"><i style="width:' + clamp(p.bond / 300 * 100, 0, 100) + '%;background:#C79BE8"></i></span>' +
      '<span class="pb-num">' + Math.round(p.bond) + '</span></div>';
    h += '</div></section>';

    /* 快捷照顾 */
    h += '<section class="pet-card">' +
      '<div class="pet-card-title">照顾一下</div>' +
      '<div class="pet-acts">' +
      '<button class="pet-act" onclick="window.petFeedOpen()"><span class="pa-ico">🍽</span><span class="pa-txt">喂食</span></button>' +
      '<button class="pet-act" onclick="window.petBath()"><span class="pa-ico">🛁</span><span class="pa-txt">洗澡</span></button>' +
      '<button class="pet-act" onclick="window.petPat()"><span class="pa-ico">💗</span><span class="pa-txt">摸头</span></button>' +
      '<button class="pet-act" onclick="window.petSleep()"><span class="pa-ico">😴</span><span class="pa-txt">哄睡</span></button>' +
      '<button class="pet-act hi" onclick="window.petPlay()"><span class="pa-ico">🎮</span><span class="pa-txt">陪玩</span></button>' +
      '</div></section>';

    if (ui.feedOpen) h += renderFeedPanel(p);

    /* 庭院 */
    const y = yardTick();
    const sec = yardNextIn();
    h += '<section class="pet-card yard">' +
      '<div class="pet-card-title">小院子 · 三叶草<img alt class="tiny-ico" src="./assets/assets/img/icons/sun.png"></div>' +
      '<div class="yard-row">' +
      '<div class="yard-grass" id="yardGrass">' + yardSvg(y.grown, y.lucky) + '</div>' +
      '<div class="yard-info">' +
      '<div class="yard-num" id="yardNum">可收获 <b>' + (y.grown || 0) + '</b> 片三叶草' + ((y.lucky || 0) ? '，其中 <b>' + y.lucky + '</b> 颗四叶草！' : '') + '</div>' +
      '<div class="yard-tip">四叶草可以当作幸运护符，带着去旅行会遇见好事</div>' +
      '<button class="btn-pixel" onclick="window.petHarvest()">🧺 全部收下</button>' +
      '<div class="yard-cd" id="yardCd">下一片还需 ' + fmtSec(sec) + '</div>' +
      '</div></div></section>';

    /* 档案 */
    h += '<section class="pet-card">' +
      '<div class="pet-card-title">它的小档案</div>' +
      '<div class="pet-file">' + esc(b.desc) + '</div>' +
      '<div class="pet-meta-grid">' +
      '<div><span>品种</span><b>' + esc(b.name) + '</b></div>' +
      '<div><span>最爱</span><b>' + esc(b.favor) + '</b></div>' +
      '<div><span>诞生</span><b>' + esc(p.bornAt) + '</b></div>' +
      '<div><span>旅行</span><b>' + (p.trips || 0) + ' 次</b></div>' +
      '</div>' +
      '<button class="btn-pixel secondary tiny" onclick="window.petRelease()">放归森林（我不养它了）</button>' +
      '</section>';
    return h;
  }

  function fmtSec(s) {
    if (s <= 0) return '马上就好';
    const m = Math.floor(s / 60);
    return m > 0 ? (m + ' 分 ' + (s % 60) + ' 秒') : (s + ' 秒');
  }
  function yardSvg(n, lucky) {
    let g = '';
    const total = Math.min(n, 24);
    for (let i = 0; i < 24; i++) {
      const x = 14 + (i % 8) * 22, y = 34 + Math.floor(i / 8) * 24;
      if (i < total) {
        const isLucky = lucky && i < lucky;
        g += '<g transform="translate(' + x + ' ' + y + ')">' +
          '<path d="M0 0 v-8" stroke="#4F8F39" stroke-width="2"/>' +
          (isLucky
            ? '<circle cx="-5" cy="-9" r="4" fill="#7FC35B"/><circle cx="5" cy="-9" r="4" fill="#7FC35B"/><circle cx="-5" cy="-15" r="4" fill="#7FC35B"/><circle cx="5" cy="-15" r="4" fill="#7FC35B"/>'
            : '<circle cx="-4" cy="-9" r="3.6" fill="#87C96B"/><circle cx="4" cy="-9" r="3.6" fill="#87C96B"/><circle cx="0" cy="-14" r="3.6" fill="#87C96B"/>') +
          '</g>';
      } else {
        g += '<g transform="translate(' + x + ' ' + y + ')" opacity="0.35"><path d="M0 0 v-4" stroke="#4F8F39" stroke-width="1.6"/><circle cx="0" cy="-5" r="2.4" fill="#9ED678"/></g>';
      }
    }
    return '<svg viewBox="0 0 200 100" style="width:100%;height:96px;display:block">' +
      '<rect width="200" height="100" rx="8" fill="#EDF7DF"/>' +
      '<path d="M0 74 q50 -12 100 -2 q50 10 100 -4 v32 H0z" fill="#CFE8C0"/>' + g + '</svg>';
  }

  function renderFeedPanel(p) {
    const bag = bagByType('食材');
    let h = '<section class="pet-card feed-panel"><div class="pet-card-title">喂点什么给它？</div>';
    if (!bag.length) {
      h += '<div class="pet-empty">背包空空的...去小院子收三叶草，或者完成今日待办、记录经历，会掉落食材哦。</div>' +
        '<button class="btn-pixel secondary" onclick="window.petTab(\'bag\')">看看背包</button>';
    } else {
      h += '<div class="feed-grid">';
      bag.forEach(it => {
        const f = FOOD_MAP[it.name] || { ico: '🍽', hun: 10, mood: 3 };
        const like = (BREED_MAP[p.breed] || {}).favor === it.name;
        h += '<button class="feed-item" onclick="window.petFeed(\'' + esc(it.name) + '\')">' +
          '<span class="fi-ico">' + f.ico + '</span><span class="fi-name">' + esc(it.name) + '</span>' +
          '<span class="fi-n">×' + it.n + '</span>' +
          '<span class="fi-eff">饱食 +' + f.hun + ' 心情 +' + f.mood + (like ? ' <b class="like">最爱!</b>' : '') + '</span>' +
          '</button>';
      });
      h += '</div>';
    }
    h += '<button class="btn-pixel secondary" onclick="window.petFeedClose()">收起</button></section>';
    return h;
  }

  /* ============================================================
     14) 照顾动作
     ============================================================ */
  function petGain(p, exp, reason) {
    p.exp = (p.exp || 0) + exp;
    let up = 0;
    while (p.exp >= expNeed(p.level) && p.level < 99) {
      p.exp -= expNeed(p.level);
      p.level += 1;
      up += 1;
    }
    const newStage = stageOfLv(p.level);
    const stageUp = newStage !== p.stage;
    p.stage = newStage;
    return { up: up, stageUp: stageUp, stage: newStage };
  }
  function celebrate(p, r) {
    if (r.up > 0) {
      const gift = pick(FOODS).name;
      bagAdd(gift, '食材', 2);
      if (r.stageUp) {
        bagAdd('幸运四叶草', '道具', 1);
        toast('✨ ' + p.name + ' 进化成「' + r.stage + '」啦！奖励：幸运四叶草 ×1', 'level');
      }
      toast('🎉 ' + p.name + ' 升到 Lv.' + p.level + '！获得食材礼包：' + gift + ' ×2', 'level');
      grantExp(10, p.name + ' 升到 Lv.' + p.level);
    }
  }

  function petSwitch(id) { ui.petId = id; ui.feedOpen = false; ui.gameState = null; renderPets(); }
  function petTab(t) { ui.tab = t; ui.feedOpen = false; ui.gameState = null; renderPets(); }
  function petFeedOpen() { ui.feedOpen = true; renderPets(); }
  function petFeedClose() { ui.feedOpen = false; renderPets(); }

  function petFeed(foodName) {
    try {
      const p = currentPet(); if (!p) return;
      if (p.status === '旅行中') { toast('它出门旅行啦，回来再喂～'); return; }
      if (!bagUse(foodName, 1)) { toast('这种食材没有了'); return; }
      const f = FOOD_MAP[foodName] || { hun: 10, mood: 3 };
      const like = (BREED_MAP[p.breed] || {}).favor === foodName;
      const mul = like ? 2 : 1;
      p.hun = clamp(p.hun + f.hun, 0, 100);
      p.mood = clamp(p.mood + f.mood * mul, 0, 100);
      p.energy = clamp(p.energy + 3, 0, 100);
      p.bond = clamp(p.bond + (like ? 4 : 2), 0, 999);
      const r = petGain(p, like ? 12 : 6, '喂食');
      commitPets(p);
      like ? toast(p.name + '：这是我超爱吃的！💕（双倍加成）') : toast(p.name + ' 吃得好开心～');
      celebrate(p, r);
    } catch (e) {
      try { toast('哎呀出了一点小问题，再试一次？'); } catch (e2) { }
    } finally {
      // 无论成功失败都收起面板并刷新，避免「点了没反应」的观感
      ui.feedOpen = false;
      try { renderPets(); } catch (e) { }
    }
  }

  function petBath() {
    const p = currentPet(); if (!p) return;
    if (p.status === '旅行中') { toast('等它旅行回来再洗吧～'); return; }
    if (p.clean >= 98) { toast('它现在香喷喷的，不用洗啦'); return; }
    p.clean = 100;
    p.mood = clamp(p.mood + 5, 0, 100);
    p.energy = clamp(p.energy - 4, 0, 100);
    p.bond = clamp(p.bond + 1, 0, 999);
    const r = petGain(p, 4, '洗澡');
    commitPets(p);
    toast('🛁 洗得干干净净，还吹出了泡泡！');
    celebrate(p, r);
    renderPets();
  }

  let _patAt = 0;
  function petPat() {
    const p = currentPet(); if (!p) return;
    if (p.status === '旅行中') { toast('它不在家，摸了个空～'); return; }
    const now = Date.now();
    if (now - _patAt < 4000) { toast('它有点害羞了，等几秒再摸摸～'); return; }
    _patAt = now;
    p.mood = clamp(p.mood + 8, 0, 100);
    p.bond = clamp(p.bond + 2, 0, 999);
    const r = petGain(p, 3, '摸头');
    commitPets(p);
    const say = BREED_MAP[p.breed] && p.mood >= 90 ? '蹭了蹭你的手心 💕' : pick(['歪着头看你', '发出了呼噜呼噜的声音', '眯起了眼睛', '往你手边靠了靠']);
    toast(p.name + ' ' + say);
    celebrate(p, r);
    renderPets();
  }

  function petSleep() {
    const p = currentPet(); if (!p) return;
    if (p.status === '旅行中') { toast('它在外面过夜啦～'); return; }
    if (p.energy >= 95) { toast('它精力满满，还不想睡'); return; }
    p.status = '休息';
    p.returnAt = Date.now() + 60000;
    p.energy = 100;
    p.mood = clamp(p.mood + 6, 0, 100);
    const r = petGain(p, 5, '哄睡');
    commitPets(p);
    toast('😴 ' + p.name + ' 睡着了，一分钟后醒来精神满满～');
    celebrate(p, r);
    renderPets();
  }

  async function petRelease() {
    const pets = getPets(); const p = currentPet(); if (!p) return;
    if (!(await uiConfirm('确定让「' + p.name + '」回到森林吗？它的成长记录会留在图鉴里。'))) return;
    const next = pets.filter(x => x.id !== p.id);
    savePets(next);
    petCloudDelete(PET_DB.pets, 'pets', r => String(r['昵称'] || '') === p.name);
    ui.petId = next.length ? next[0].id : null;
    toast('再见啦，' + p.name + '。谢谢你陪我走过这一段。');
    renderPets();
  }

  /* ============================================================
     15) 领养所
     ============================================================ */
  function rollPool() {
    const weights = [['普通', 66], ['稀有', 25], ['闪光', 7], ['传说', 2]];
    const owned = getPets().map(x => x.breed);
    const out = [];
    let guard = 0;
    while (out.length < 3 && guard < 200) {
      guard++;
      let r = Math.random() * 100, acc = 0, target = '普通';
      for (const w of weights) { acc += w[1]; if (r <= acc) { target = w[0]; break; } }
      const cand = BREEDS.filter(b => b.rarity === target && owned.indexOf(b.id) < 0);
      if (!cand.length) continue;
      const b = pick(cand);
      if (out.filter(x => x.id === b.id).length) continue;
      out.push(b);
    }
    if (!out.length) out.push.apply(out, BREEDS.filter(b => owned.indexOf(b.id) < 0).slice(0, 3));
    ui.adoptPool = out.map(b => b.id);
    // 首次输入名额不足时兜底：允许重复品种（不同昵称）
    if (!ui.adoptPool.length) ui.adoptPool = BREEDS.map(b => b.id).sort(() => Math.random() - 0.5).slice(0, 3);
  }

  function renderAdopt(host) {
    if (!ui.adoptPool.length) rollPool();
    let h = '<section class="pet-card adopt-hero">' +
      '<div class="adopt-title">🐾 领养所</div>' +
      '<div class="adopt-sub">在「老李的世界」里，可以同时照顾最多 <b>3</b> 只小动物。<br>它们会长大、会闹脾气，也会出门旅行给你寄明信片。</div>' +
      '</section>';
    h += '<section class="pet-card"><div id="adoptCards">' + renderAdoptCards() + '</div></section>';
    h += '<section class="pet-card"><div class="pet-card-title">领养礼包</div>' +
      '<div class="adopt-gifts">' +
      '<div class="ag-item">🥛 牛奶 ×3</div><div class="ag-item">🍪 抹茶饼干 ×2</div><div class="ag-item">🌿 三叶草 ×5</div>' +
      '</div></section>';
    host.innerHTML = h;
  }
  function renderAdoptInto() {
    const el = document.getElementById('adoptCards');
    if (!el) return;
    if (!ui.adoptPool.length) rollPool();
    el.innerHTML = renderAdoptCards();
  }
  function renderAdoptCards() {
    if (!ui.adoptPool.length) rollPool();
    let h = '<div class="adopt-grid">';
    ui.adoptPool.forEach((id, i) => {
      const b = BREED_MAP[id]; if (!b) return;
      const rs = RARITY_STYLE[b.rarity];
      h += '<div class="adopt-card">' +
        '<span class="rarity-badge" style="background:' + rs.bg + ';color:' + rs.fg + '">' + rs.label + ' · ' + b.rarity + '</span>' +
        '<div class="adopt-pet">' + petSvg({ breed: id, status: '在家', mood: 88, energy: 90, level: 1, stage: '幼崽' }, 104) + '</div>' +
        '<div class="adopt-name">' + esc(b.name) + '</div>' +
        '<div class="adopt-desc">' + esc(b.desc) + '</div>' +
        '<div class="adopt-like">最爱：' + esc(b.favor) + '</div>' +
        '<button class="btn-pixel" onclick="window.petAdopt(\'' + id + '\')">就是你了 ♥</button>' +
        '</div>';
    });
    h += '</div>' +
      '<div class="adopt-bar">' +
      '<button class="btn-pixel secondary" onclick="window.petReroll()">🎲 换一批看看（免费）</button>' +
      '<span class="adopt-tip">稀有品种会在特定时候更容易出现</span>' +
      '</div>';
    return h;
  }
  function renderAdoptPanel() {
    return '<section class="pet-card adopt-hero">' +
      '<div class="adopt-title">🐾 领养所</div>' +
      '<div class="adopt-sub">最多还能再领养 <b>' + (MAX_PETS - getPets().length) + '</b> 只</div>' +
      '</section>' +
      '<section class="pet-card"><div id="adoptCards">' + renderAdoptCards() + '</div></section>' +
      '<section class="pet-card"><button class="btn-pixel secondary" onclick="window.petCloseAdopt()">← 回到宠物房</button></section>';
  }

  function petOpenAdopt() { ui.adoptOpen = true; ui.adoptPool = []; rollPool(); renderPets(); }
  function petCloseAdopt() { ui.adoptOpen = false; renderPets(); }
  function petReroll() { ui.adoptPool = []; rollPool(); renderAdoptInto(); }
  async function petAdopt(breedId) {
    const pets = getPets();
    if (pets.length >= MAX_PETS) { toast('已经有 3 只小伙伴啦，先放归一只才能带新的回家～'); return; }
    const b = BREED_MAP[breedId]; if (!b) return;
    const nick = await uiPrompt('给它取个名字吧！', b.name);
    if (nick === null) return;
    const p = newPet(breedId, (nick || '').trim() || b.name);
    getPets().length;
    pets.push(p);
    savePets(pets);
    bagAdd('牛奶', '食材', 3); bagAdd('抹茶饼干', '食材', 2); bagAdd('三叶草', '食材', 5);
    const y = getYard(); y.seedsAt = Date.now(); saveYard(y);
    ui.petId = p.id; ui.adoptOpen = false; ui.tab = 'room';
    grantExp(15, '领养了 ' + p.name);
    toast('🎉 欢迎 ' + p.name + ' 来到老李的世界！');
    renderPets();
  }

  function startRoomTickers(p) {
    clearInterval(startRoomTickers._t);
    const cd = document.getElementById('yardCd');
    if (cd) {
      startRoomTickers._t = setInterval(() => {
        const el = document.getElementById('yardCd');
        if (!el) { clearInterval(startRoomTickers._t); return; }
        const sec = yardNextIn();
        if (sec <= 0) {
          // 倒计时归零：结算生长，并原地更新可收获数量/草地（不整页重渲染，避免打断操作）
          const y = yardTick();
          const numEl = document.getElementById('yardNum');
          if (numEl) numEl.innerHTML = '可收获 <b>' + (y.grown || 0) + '</b> 片三叶草' + ((y.lucky || 0) ? '，其中 <b>' + y.lucky + '</b> 颗四叶草！' : '');
          const grassEl = document.getElementById('yardGrass');
          if (grassEl) grassEl.innerHTML = yardSvg(y.grown, y.lucky);
        }
        el.textContent = '下一片还需 ' + fmtSec(yardNextIn());
      }, 1000);
    }
    // 旅行倒计时
    clearInterval(startRoomTickers._t2);
    startRoomTickers._t2 = setInterval(() => {
      const el = document.getElementById('tripCd');
      if (!el) { clearInterval(startRoomTickers._t2); return; }
      const pet = currentPet();
      if (!pet || pet.status !== '旅行中' || !pet.returnAt) return;
      const left = Math.max(0, Math.floor((pet.returnAt - Date.now()) / 1000));
      el.textContent = left > 0 ? fmtSec(left) : '它回来了！';
    }, 1000);
  }

  window.petSwitch = petSwitch;
  window.petTab = petTab;
  window.petFeedOpen = petFeedOpen;
  window.petFeedClose = petFeedClose;
  window.petFeed = petFeed;
  window.petBath = petBath;
  window.petPat = petPat;
  window.petSleep = petSleep;
  window.petRelease = petRelease;
  window.petHarvest = yardHarvest;
  window.petOpenAdopt = petOpenAdopt;
  window.petCloseAdopt = petCloseAdopt;
  window.petReroll = petReroll;
  window.petAdopt = petAdopt;
  window.petPlay = function () { openGameMenu(); };
  /* ============================================================
     16) 旅行（旅行青蛙式：准备 → 出发 → 归来 → 拆礼物）
     ============================================================ */
  const NEWS = [
    '路边的小猫冲它叫了一声',
    '它在溪边捧着水洗了把脸',
    '风把它头顶的小叶子吹歪了',
    '它在一块大石头上坐了很久',
    '路过的人给了它一颗糖',
    '它把你的名字写在了一张落叶上',
    '前面下雨了，它躲进了小亭子',
    '它睡了一小会儿，做了一个很短的梦'
  ];
  const SPOT_TIERS = [[1], [2], [3], [4]];

  function rollSpot(luckyPriority) {
    const r = Math.random() * 100;
    let tier = 1;
    if (luckyPriority) {
      if (r < 4) tier = 4; else if (r < 24) tier = 3; else if (r < 62) tier = 2; else tier = 1;
    } else {
      if (r < 1.5) tier = 4; else if (r < 10) tier = 3; else if (r < 40) tier = 2; else tier = 1;
    }
    const pool = SPOTS.filter(s => s.tier === tier);
    return pick(pool.length ? pool : SPOTS);
  }

  function renderTravel(p) {
    let h = '';

    /* 1) 归来待拆 */
    if (p.pendingGift) {
      h += '<section class="pet-card gift-card">' +
        '<div class="pet-card-title">✉️ ' + esc(p.name) + ' 回来啦！</div>' +
        '<div class="gift-hero">' + petSvg(p, 96) + '</div>' +
        '<div class="gift-tip">它背着一个鼓鼓的小包，好像带了不少东西回来</div>' +
        '<button class="btn-pixel big" onclick="window.petOpenGift()">拆开它的小包 🎁</button>' +
        '</section>';
      return h;
    }

    /* 2) 旅行中 */
    if (p.status === '旅行中') {
      const left = Math.max(0, Math.floor(((p.returnAt || 0) - Date.now()) / 1000));
      const news = NEWS[Math.floor(Date.now() / 20000) % NEWS.length];
      h += '<section class="pet-card trip-away">' +
        '<div class="pet-card-title">🧳 出远门中</div>' +
        '<div class="trip-away-art">' + petSvg({ breed: p.breed, status: '旅行中', mood: 70, energy: 60, level: p.level, stage: p.stage }, 96) + '</div>' +
        '<div class="trip-cd-row"><span>预计还有</span><b id="tripCd">' + fmtSec(left) + '</b></div>' +
        '<div class="trip-news">📨 ' + esc(news) + '</div>' +
        '<button class="btn-pixel secondary" onclick="window.petRecall()">🔔 提前叫它回来</button>' +
        '<div class="trip-warn">提前回来会让兴致少一点点哦</div>' +
        '</section>';
      return h;
    }

    /* 3) 睡觉中 */
    if (p.status === '休息') {
      h += '<section class="pet-card trip-away">' +
        '<div class="pet-card-title">😴 正在睡觉</div>' +
        '<div class="trip-away-art">' + petSvg(p, 96) + '</div>' +
        '<div class="trip-news">它盖着小被子，呼吸慢下来了～</div>' +
        '<div class="trip-cd-row"><span>醒来倒计时</span><b id="tripCd">' + fmtSec(Math.max(0, Math.floor(((p.returnAt || 0) - Date.now()) / 1000))) + '</b></div>' +
        '</section>';
      return h;
    }

    /* 4) 在家：准备出行 */
    const foods = bagByType('食材');
    const tools = bagByType('道具');
    h += '<section class="pet-card">' +
      '<div class="pet-card-title">🧺 准备便当（选 1~3 样食材）</div>';
    if (!foods.length) {
      h += '<div class="pet-empty">还没有食材。去小院子收三叶草，或者完成今日待办会掉落食材。</div>';
    } else {
      h += '<div class="bento-grid">';
      foods.forEach(f => {
        const sel = ui.tripBento.indexOf(f.name) >= 0;
        const meta = FOOD_MAP[f.name] || { ico: '🍽' };
        h += '<button class="bento-item' + (sel ? ' on' : '') + '" onclick="window.petPickFood(\'' + esc(f.name) + '\')">' +
          '<span class="bi-ico">' + meta.ico + '</span><span class="bi-name">' + esc(f.name) + '</span><span class="bi-n">×' + f.n + '</span></button>';
      });
      h += '</div>';
    }
    h += '</section>';

    h += '<section class="pet-card"><div class="pet-card-title">🎒 带一件行囊</div>';
    if (!tools.length) {
      h += '<div class="pet-empty">暂时还没有道具。升级、旅行礼物和活动中会慢慢攒起来。</div>';
    } else {
      h += '<div class="bento-grid">';
      tools.forEach(t => {
        const meta = TOOL_MAP[t.name] || { ico: '🎁', desc: '带着它出门吧' };
        const sel = ui.tripTool === t.name;
        h += '<button class="bento-item tool' + (sel ? ' on' : '') + '" onclick="window.petPickTool(\'' + esc(t.name) + '\')">' +
          '<span class="bi-ico">' + meta.ico + '</span><span class="bi-name">' + esc(t.name) + '</span><span class="bi-n">×' + t.n + '</span>' +
          '<span class="bi-desc">' + esc(meta.desc) + '</span></button>';
      });
      h += '</div>';
      h += '<button class="btn-pixel secondary tiny" onclick="window.petPickTool(\'\')">不带了</button>';
    }
    h += '</section>';

    if (ui.tripTool) {
      const t = TOOL_MAP[ui.tripTool];
      const safety = getPets().filter(x => x.status === '旅行中').length;
      h += '<section class="pet-card ready">' +
        '<div class="ready-title">准备就绪！</div>' +
        '<div class="ready-line">🎒 ' + esc(ui.tripTool) + '：' + esc(t ? t.desc : '带着它出门') + '</div>' +
        (ui.tripBento.length ? '<div class="ready-line">🧺 ' + ui.tripBento.map(x => esc(x)).join(' + ') + '</div>' : '<div class="ready-line warn">没带便当的话，它会走得比较保守…</div>') +
        '<button class="btn-pixel big" onclick="window.petGoTrip()">出发去旅行 🎈</button>' +
        '<div class="trip-warn">它会在外面待一会儿，回来时记得来收礼物' + (safety ? '（现在还有同伴在路上）' : '') + '</div>' +
        '</section>';
    } else if (ui.tripBento.length) {
      h += '<section class="pet-card ready">' +
        '<div class="ready-line">🧺 ' + ui.tripBento.map(x => esc(x)).join(' + ') + '</div>' +
        '<button class="btn-pixel big" onclick="window.petGoTrip()">出发去旅行 🎈</button>' +
        '<div class="trip-warn">不带行囊也可以出发，但走到哪儿就全靠它自己啦</div>' +
        '</section>';
    }

    /* 历史 */
    const mine = getTrips().filter(t => t.pet === p.name).slice(-8).reverse();
    h += '<section class="pet-card"><div class="pet-card-title">📮 它寄回来的（' + getTrips().filter(t => t.pet === p.name).length + ' 封）</div>';
    if (!mine.length) {
      h += '<div class="pet-empty">还没有旅行记录。带上便当出发吧！</div>';
    } else {
      h += '<div class="trip-log">';
      mine.forEach(t => {
        h += '<div class="tl-item"><span class="tl-date">' + esc(t.date) + '</span>' +
          '<span class="tl-spot">' + esc(t.spot) + '</span>' +
          '<span class="tl-line">' + esc(t.line) + '</span></div>';
      });
      h += '</div>';
    }
    h += '</section>';
    return h;
  }

  function petPickFood(name) {
    if (ui.tripBento.indexOf(name) >= 0) ui.tripBento.splice(ui.tripBento.indexOf(name), 1);
    else if (ui.tripBento.length >= 3) { toast('便当最多装 3 样～'); return; }
    else ui.tripBento.push(name);
    renderPets();
  }
  function petPickTool(name) { ui.tripTool = name || ''; renderPets(); }

  function petGoTrip() {
    const p = currentPet(); if (!p) return;
    if (p.status !== '在家') { toast('它现在不在家哦'); return; }
    ui.tripBento.forEach(f => bagUse(f, 1));
    if (ui.tripTool) bagUse(ui.tripTool, 1);
    const tool = TOOL_MAP[ui.tripTool];
    const spot = rollSpot(ui.tripTool === '幸运护符');
    let mins = 18 + Math.floor(Math.random() * 22);       // 18~40 分钟
    if (ui.tripTool === '手绘地图') mins += 12;
    if (ui.tripBento.length === 3) mins -= 3;
    let dur = mins * 60000;
    // 体验优化：真实等待过长时给出「快进」选项（不改写礼物）
    p.status = '旅行中';
    p.returnAt = Date.now() + dur;
    p.pendingGift = null;
    p.tripCtx = { spot: spot.name, tool: ui.tripTool || '', bento: ui.tripBento.slice(), dur: dur, startAt: Date.now() };
    p.energy = clamp(p.energy - 20, 0, 100);
    commitPets(p);
    ui.tripBento = []; ui.tripTool = '';
    toast('🎈 ' + p.name + ' 出发啦！大约 ' + mins + ' 分钟后回来');
    renderPets();
  }

  function petRecall() {
    const p = currentPet(); if (!p || p.status !== '旅行中') return;
    p.returnAt = Date.now();
    p.mood = clamp(p.mood - 10, 0, 100);
    if (!p.tripCtx) p.tripCtx = { spot: pick(SPOTS).name, tool: '', bento: [], dur: 0, startAt: Date.now() };
    p.tripCtx.recalled = true;
    commitPets(p);
    tickPets();
    toast('🔔 把它叫回来了，它看起来还有点舍不得');
    renderPets();
  }

  function buildTripResult(p) {
    const ctx = p.tripCtx || {};
    const spot = SPOTS.filter(s => s.name === ctx.spot)[0] || pick(SPOTS);
    const tool = ctx.tool || '';
    const full = !ctx.recalled;
    let gifts = spot.gifts.slice();
    if (tool === '手绘地图') gifts = gifts.concat(pick(FOODS).name);
    let n = tool === '手绘地图' ? 3 : (Math.random() < 0.45 ? 2 : 1);
    if (!full) n = Math.max(1, n - 1);
    const picked = [];
    for (let i = 0; i < n && gifts.length; i++) {
      const idx = Math.floor(Math.random() * gifts.length);
      picked.push(gifts.splice(idx, 1)[0]);
    }
    const friends = [];
    let friendChance = tool === '粗布帐篷' ? 1 : 0.65;
    if (full && Math.random() < friendChance) {
      friends.push(pick(spot.friends));
      if (tool === '粗布帐篷' && Math.random() < 0.5) {
        const extra = spot.friends.filter(f => friends.indexOf(f) < 0);
        if (extra.length) friends.push(pick(extra));
      }
    }
    const line = pick(spot.lines);
    const luckyBoost = tool === '幸运护符' ? 0.28 : 0.07;
    const hasEgg = full && Math.random() < luckyBoost && getPets().length < MAX_PETS;
    return {
      spot: spot.name, scene: spot.scene, line: line,
      gifts: picked, friends: friends, hasEgg: hasEgg, full: full
    };
  }

  function petOpenGift() {
    const p = currentPet(); if (!p || !p.pendingGift) return;
    const g = p.pendingGift;
    const list = getPets();
    (g.gifts || []).forEach(x => bagAdd(x, '食材', 1));
    if (g.full && (g.friends || []).length) bagAdd('星星糖', '食材', 1);
    const trip = {
      id: uid('trip'), date: todayStr(), pet: p.name, spot: g.spot,
      line: g.line, gifts: g.gifts || [], friends: g.friends || [], moodText: moodText(p), opened: true
    };
    const trips = getTrips(); trips.push(trip); saveTrips(trips);

    p.mood = clamp(p.mood + (g.full ? 18 : 8), 0, 100);
    p.bond = clamp(p.bond + (g.full ? 10 : 4), 0, 999);
    p.energy = clamp(p.energy - 25, 0, 100);
    p.hun = clamp(p.hun - 25, 0, 100);
    p.trips = (p.trips || 0) + 1;
    p.status = '在家';
    p.pendingGift = null;
    p.tripCtx = null;
    const r = petGain(p, g.full ? 40 : 18, '旅行归来');
    commitPets(p);
    grantExp(15, p.name + ' 旅行归来');

    let html = '<div class="gift-modal">' +
      '<div class="gift-pc">' + postcardSvg({ scene: g.scene }, 300) + '</div>' +
      '<div class="gift-spot">' + esc(g.spot) + '</div>' +
      '<div class="gift-line">「' + esc(g.line) + '」</div>' +
      '<div class="gift-section"><b>带回来的特产</b><div class="gift-chips">' +
      (g.gifts.length ? g.gifts.map(x => '<span class="gchip">' + ((FOOD_MAP[x] || {}).ico || '🎁') + ' ' + esc(x) + '</span>').join('') : '<span class="gchip empty">这次两手空空…</span>') +
      '</div></div>' +
      (g.friends.length ? '<div class="gift-section"><b>路上认识的朋友</b><div class="gift-chips">' + g.friends.map(x => '<span class="gchip friend">' + esc(x) + '</span>').join('') + '</div></div>' : '') +
      (g.hasEgg ? '<div class="gift-section egg"><b>🥚 惊喜！</b><div class="gift-line">它在草丛里发现了一颗还温热的蛋！</div>' +
        '<button class="btn-pixel" onclick="window.petHatchEgg()">带回家孵化</button></div>' : '') +
      '<button class="btn-pixel secondary" onclick="window.petCloseGift()">收下啦 ♥</button>' +
      '</div>';
    const box = document.getElementById('giftModal');
    if (box) { box.innerHTML = html; box.style.display = 'flex'; }
    celebrate(p, r);
    renderPets();
  }
  function petCloseGift() {
    const box = document.getElementById('giftModal');
    if (box) { box.style.display = 'none'; box.innerHTML = ''; }
    renderPets();
  }
  function petHatchEgg() {
    const pets = getPets();
    if (pets.length >= MAX_PETS) { toast('位置不够啦，先放归一只吧'); return; }
    ui.adoptOpen = false; _eggMode = true;
    const pool = BREEDS.filter(b => b.rarity !== '普通');
    const b = pick(pool.length ? pool : BREEDS);
    _eggBreed = b.id;
    const box = document.getElementById('giftModal');
    if (box) {
      box.innerHTML = '<div class="gift-modal">' +
        '<div class="gift-pc">' + petSvg({ breed: b.id, status: '在家', mood: 80, energy: 90, level: 1, stage: '蛋' }, 130) + '</div>' +
        '<div class="gift-spot">蛋壳裂开了！</div>' +
        '<div class="gift-line">一只<b>' + esc(b.name) + '</b>（' + b.rarity + '）探出了小脑袋</div>' +
        '<button class="btn-pixel" onclick="window.petTakeEgg()">抱回家 ♥</button>' +
        '</div>';
    }
  }
  let _eggBreed = '', _eggMode = false;
  function petTakeEgg() {
    const pets = getPets();
    if (pets.length >= MAX_PETS) { toast('位置不够啦'); return; }
    const b = BREED_MAP[_eggBreed] || pick(BREEDS.filter(x => x.rarity !== '普通'));
    const p = newPet(b.id, b.name);
    p.stage = '幼崽';
    p.bond = 20;
    pets.push(p); savePets(pets);
    ui.petId = p.id;
    grantExp(25, '孵化了 ' + p.name);
    const box = document.getElementById('giftModal');
    if (box) { box.style.display = 'none'; box.innerHTML = ''; }
    toast('🎉 欢迎空降的小伙伴 ' + p.name + '！');
    renderPets();
  }

  /* ============================================================
     17) 图鉴
     ============================================================ */
  function renderBook() {
    const trips = getTrips();
    const spots = {}; const gifts = {}; const friends = {};
    trips.forEach(t => {
      if (t.spot) spots[t.spot] = (spots[t.spot] || 0) + 1;
      (t.gifts || []).forEach(g => { gifts[g] = (gifts[g] || 0) + 1; });
      (t.friends || []).forEach(f => { friends[f] = (friends[f] || 0) + 1; });
    });
    const sub = ui.sub || 'card';
    let h = '<div class="pet-subtabs small">' +
      '<button class="pet-subtab' + (sub === 'card' ? ' active' : '') + '" onclick="window.petBook(\'card\')">📮 明信片 ' + Object.keys(spots).length + '/' + SPOTS.length + '</button>' +
      '<button class="pet-subtab' + (sub === 'gift' ? ' active' : '') + '" onclick="window.petBook(\'gift\')">🎁 特产 ' + Object.keys(gifts).length + '</button>' +
      '<button class="pet-subtab' + (sub === 'friend' ? ' active' : '') + '" onclick="window.petBook(\'friend\')">🐾 朋友 ' + Object.keys(friends).length + '</button>' +
      '</div>';

    if (sub === 'card') {
      h += '<div class="book-grid">';
      SPOTS.forEach(s => {
        const got = spots[s.name];
        if (got) {
          h += '<div class="book-card got"><div class="book-pc">' + postcardSvg(s, 240) + '</div>' +
            '<div class="book-name">' + esc(s.name) + '</div>' +
            '<div class="book-meta">到访 ' + got + ' 次</div></div>';
        } else {
          h += '<div class="book-card lock"><div class="book-pc lock-art">?</div>' +
            '<div class="book-name">??? 还没去过</div><div class="book-meta">让宠物带上不同的行囊试试</div></div>';
        }
      });
      h += '</div>';
    } else if (sub === 'gift') {
      const all = Object.keys(gifts);
      h += '<div class="book-chips">';
      if (!all.length) h += '<div class="pet-empty">还没有收藏到特产，让宠物出门跑一趟吧。</div>';
      all.forEach(g => {
        h += '<div class="book-chip"><span class="bc-ico">' + ((FOOD_MAP[g] || {}).ico || '🎁') + '</span><span class="bc-name">' + esc(g) + '</span><span class="bc-n">×' + gifts[g] + '</span></div>';
      });
      const locked = SPECIAL_GIFTS.filter(g => !gifts[g]);
      locked.forEach(g => { h += '<div class="book-chip lock"><span class="bc-ico">?</span><span class="bc-name">未发现</span></div>'; });
      h += '</div>';
    } else {
      const all = Object.keys(friends);
      h += '<div class="book-chips">';
      if (!all.length) h += '<div class="pet-empty">路上还没有遇到朋友。带上「粗布帐篷」更容易交到朋友哦。</div>';
      all.forEach(f => { h += '<div class="book-chip"><span class="bc-ico">🐾</span><span class="bc-name">' + esc(f) + '</span><span class="bc-n">×' + friends[f] + '</span></div>'; });
      h += '</div>';
    }
    return h;
  }
  function petBook(sub) { ui.sub = sub; renderPets(); }

  /* ============================================================
     18) 背包
     ============================================================ */
  function renderBagUi(p) {
    const bag = getBag();
    let h = '<section class="pet-card"><div class="pet-card-title">👜 我的背包（' + bag.reduce((a, b) => a + (b.n || 0), 0) + ' 件）</div>';
    if (!bag.length) {
      h += '<div class="pet-empty">背包还是空的。三叶草是小院自己长的，其它食材要完成任务才有机会掉落。</div>';
    } else {
      h += '<div class="bag-list">';
      bag.forEach(it => {
        const meta = FOOD_MAP[it.name] || TOOL_MAP[it.name] || null;
        const icon = meta ? meta.ico : (it.type === '道具' ? '✨' : (it.type === '特产' ? '🎁' : '🍽'));
        const info = meta && meta.hun ? ('饱食 +' + meta.hun + ' 心情 +' + meta.mood) : (meta && meta.desc ? meta.desc : '');
        h += '<div class="bag-row"><span class="br-ico">' + icon + '</span>' +
          '<span class="br-name">' + esc(it.name) + '<i class="br-type">' + esc(it.type) + '</i></span>' +
          '<span class="br-info">' + esc(info) + '</span>' +
          '<span class="br-n">×' + it.n + '</span></div>';
      });
      h += '</div>';
    }
    h += '</section>';
    h += '<section class="pet-card"><div class="pet-card-title">去哪儿搞吃的？</div>' +
      '<div class="bag-guide">' +
      '<div class="bg-item"><b>🌿 小院子</b><span>每 3 分钟长出 1 片三叶草，偶尔会长出幸运四叶草</span></div>' +
      '<div class="bg-item"><b>✅ 今日待办</b><span>每勾一项，有几率掉落食材</span></div>' +
      '<div class="bg-item"><b>📖 记录经历</b><span>写一段经历，宠物也会跟着沾光</span></div>' +
      '<div class="bg-item"><b>🎈 旅行归来</b><span>宠物会带特产和道具回来</span></div>' +
      '</div></section>';
    return h;
  }

  /* ============================================================
     19) 现实联动：完成待办/记录经验 → 掉落食材
     ============================================================ */
  function petDrop(reason) {
    const st = getGameStat();
    const d = todayStr();
    if (st.date !== d) { st.date = d; st.times = 0; saveGameStat(st); }
    if (st.times >= 6) return false;
    if (Math.random() > 0.42) return false;
    st.times += 1; saveGameStat(st);
    if (Math.random() < 0.12) {
      const t = pick(['幸运四叶草', '复古相机', '粗布帐篷', '防水雨伞', '幸运护符', '手绘地图', '热乎毛毯']);
      bagAdd(t, '道具', 1);
      toast('🎁 ' + (reason || '完成任务') + ' → 获得行囊道具：' + t);
    } else {
      const f = pick(FOODS).name;
      bagAdd(f, '食材', 1);
      toast('🌰 ' + (reason || '完成任务') + ' → 掉落食材：' + f);
    }
    return true;
  }
  window.petDrop = petDrop;

  window.petPickFood = petPickFood;
  window.petPickTool = petPickTool;
  window.petGoTrip = petGoTrip;
  window.petRecall = petRecall;
  window.petOpenGift = petOpenGift;
  window.petCloseGift = petCloseGift;
  window.petHatchEgg = petHatchEgg;
  window.petTakeEgg = petTakeEgg;
  window.petBook = petBook;
  /* ============================================================
     20) 小游戏①：猜猜我在哪（捉迷藏）
     ============================================================ */
  function bushSvg(showPet, pet, opened) {
    let inner = '';
    if (opened) {
      inner = showPet
        ? '<g transform="translate(40 40) scale(0.55)">' + (petSvg(pet, 120).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')) + '</g>'
        : '<circle cx="60" cy="56" r="14" fill="#E9D5BA" stroke="#C8A775" stroke-width="2"/>' +
        '<path d="M52 54 q8 -6 16 0" stroke="#C8A775" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
    return '<svg class="manga-pet" viewBox="0 0 120 120" style="width:100%;height:100%;display:block">' +
      '<ellipse cx="60" cy="102" rx="34" ry="6" fill="rgba(0,0,0,.08)"/>' +
      inner +
      '<path d="M18 100 q-6 -30 14 -38 q4 -22 28 -22 q24 0 28 22 q20 8 14 38z" fill="#7FC35B" stroke="#3A6231" stroke-width="3"/>' +
      '<path d="M34 92 q10 -14 20 -6 M64 88 q12 -16 22 -4" stroke="#4F8F39" stroke-width="2.6" fill="none"/>' +
      '</svg>';
  }

  function playable() {
    const st = getGameStat();
    const d = todayStr();
    if (st.date !== d) return 3 - 0;
    return Math.max(0, 3 - (st.playTimes || 0));
  }
  function consumePlay() {
    const st = getGameStat(); const d = todayStr();
    if (st.date !== d) { st.date = d; st.playTimes = 0; }
    st.playTimes = (st.playTimes || 0) + 1;
    saveGameStat(st);
  }

  function openGameMenu() {
    const p = currentPet(); if (!p) return;
    if (p.status !== '在家') { toast('它不在家，等回来再一起玩～'); return; }
    ui.gameState = { type: 'menu' };
    renderPets();
  }
  function renderGameZone(p) {
    const g = ui.gameState;
    if (!g) return '';
    let h = '<section class="pet-card game-zone">';
    h += '<div class="pet-card-title">🎮 陪它玩一会儿<span class="game-left">今天还能玩 ' + playable() + ' 次</span></div>';
    if (g.type === 'menu') {
      h += '<div class="game-menu">' +
        '<button class="game-card" onclick="window.petGameHide()"><span class="gc-ico">🌿</span>' +
        '<span class="gc-name">猜猜我在哪</span><span class="gc-desc">它躲在草丛里，凭直觉找找看 · 5 轮</span></button>' +
        '<button class="game-card" onclick="window.petGameCatch()"><span class="gc-ico">🎁</span>' +
        '<span class="gc-name">接住小礼物</span><span class="gc-desc">它把礼物从天上扔下来 · 20 秒</span></button>' +
        '</div>' +
        '<button class="btn-pixel secondary tiny" onclick="window.petGameEnd()">先不玩了</button>';
    } else if (g.type === 'hide') {
      h += renderHide(p, g);
    } else if (g.type === 'catch') {
      h += renderCatch(p, g);
    } else if (g.type === 'result') {
      h += '<div class="game-result">' +
        '<div class="gr-score">' + g.text + '</div>' +
        '<div class="gr-reward">' + g.reward + '</div>' +
        '<div class="game-btns">' +
        '<button class="btn-pixel" onclick="window.petGameAgain()">再来一局</button>' +
        '<button class="btn-pixel secondary" onclick="window.petGameEnd()">收手啦</button>' +
        '</div></div>';
    }
    h += '</section>';
    return h;
  }
  function renderHide(p, g) {
    let h = '<div class="hide-head">第 ' + (g.round + 1) + ' / 5 轮 · 猜中 ' + g.score + ' 次</div>';
    h += '<div class="hide-grid">';
    for (let i = 0; i < 3; i++) {
      const opened = g.revealed === i;
      h += '<button class="hide-bush' + (opened ? (g.hidden === i ? ' hit' : ' miss') : '') + '" ' +
        (g.phase === 'wait' ? 'onclick="window.petHidePick(' + i + ')"' : 'disabled') + '>' +
        bushSvg(g.hidden === i, p, opened) + '</button>';
    }
    h += '</div>';
    h += '<div class="hide-msg">' + esc(g.msg || (g.phase === 'wait' ? '它已经藏好啦，猜猜在哪个草丛里？' : '')) + '</div>';
    if (g.phase === 'result') h += '<button class="btn-pixel" onclick="window.petHideNext()">' + (g.round + 1 >= 5 ? '看看结果' : '下一轮') + '</button>';
    return h;
  }
  function petGameHide() {
    if (playable() <= 0) { toast('今天玩够啦，明天再来陪它吧～'); return; }
    ui.gameState = { type: 'hide', round: 0, score: 0, hidden: Math.floor(Math.random() * 3), revealed: -1, phase: 'wait', msg: '' };
    renderPets();
  }
  function petHidePick(i) {
    const g = ui.gameState; if (!g || g.phase !== 'wait') return;
    g.revealed = i;
    g.phase = 'result';
    if (i === g.hidden) { g.score += 1; g.msg = pick(['找到啦！它蹦了出来 🐾', '它的尾巴露馅了～', '一把抓住软软的一团！']); }
    else { g.msg = pick(['空的…它早就溜走了～', '只有一阵风吹过', '这里只有几片叶子']); }
    renderPets();
  }
  function petHideNext() {
    const g = ui.gameState; if (!g) return;
    if (g.round + 1 >= 5) return finishHide();
    g.round += 1; g.hidden = Math.floor(Math.random() * 3); g.revealed = -1; g.phase = 'wait'; g.msg = '';
    renderPets();
  }
  function finishHide() {
    const p = currentPet(); if (!p) return;
    const g = ui.gameState;
    consumePlay();
    const bonusFood = ['牛奶', '布丁', '蜂蜜', '星星糖', '猫草面包'].slice(0, Math.max(1, Math.ceil(g.score / 2)));
    p.mood = clamp(p.mood + 6 + g.score * 3, 0, 100);
    p.bond = clamp(p.bond + 4 + g.score * 2, 0, 999);
    p.energy = clamp(p.energy - 12, 0, 100);
    const r = petGain(p, 8 + g.score * 4, '捉迷藏');
    commitPets(p);
    grantExp(6 + g.score * 2, '陪 ' + p.name + ' 玩捉迷藏');
    bonusFood.forEach(f => bagAdd(f, '食材', 1));
    ui.gameState = {
      type: 'result', last: 'hide',
      text: '猜中 ' + g.score + ' / 5 次 —— ' + (g.score >= 5 ? '它怀疑你在偷看 🙈' : g.score >= 3 ? '默契不错嘛！' : '它觉得下次还能躲更好'),
      reward: '心情 +' + (6 + g.score * 3) + ' · 亲密度 +' + (4 + g.score * 2) + ' · 食材 ' + bonusFood.join('、')
    };
    celebrate(p, r);
    renderPets();
  }

  /* ============================================================
     21) 小游戏②：接住小礼物（canvas）
     ============================================================ */
  function renderCatch(p, g) {
    return '<div class="catch-head">接住它扔下来的礼物！还剩 <b id="catchTime">' + (g.left || 20) + '</b> 秒 · 得分 ' + (g.score || 0) + '</div>' +
      '<canvas id="catchCanvas" width="320" height="240" class="catch-canvas"></canvas>' +
      '<div class="catch-ctrl">' +
      '<button class="cbtn" id="cLeft">◀ 左</button>' +
      '<button class="cbtn" id="cRight">右 ▶</button>' +
      '</div>' +
      '<div class="catch-tip">按住左右移动小篮子，手指也能直接拖动画面</div>';
  }
  function petGameCatch() {
    if (playable() <= 0) { toast('今天玩够啦，明天再来陪它吧～'); return; }
    ui.gameState = { type: 'catch', score: 0, left: 20 };
    renderPets();
    startCatchLoop();
  }
  function petGameAgain() {
    const g = ui.gameState;
    if (g && g.last === 'hide') return petGameHide();
    return petGameCatch();
  }
  function petGameEnd() { ui.gameState = null; renderPets(); }

  let _catchRaf = null;
  function startCatchLoop() {
    cancelAnimationFrame(_catchRaf);
    const cv = document.getElementById('catchCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const basket = { x: W / 2 - 30, w: 60, h: 14, v: 0 };
    const items = [];
    const emo = ['🍬', '🍓', '🍪', '🥛', '🌟', '🍮', '🍑'];
    let spawnAt = 0, lastT = Date.now(), acc = 0;
    const g = ui.gameState;

    const keys = { l: false, r: false };
    const bindBtn = (id, key) => {
      const el = document.getElementById(id); if (!el) return;
      const down = e => { e.preventDefault(); keys[key] = true; };
      const up = e => { e.preventDefault(); keys[key] = false; };
      el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up);
      el.addEventListener('pointerleave', up); el.addEventListener('pointercancel', up);
    };
    bindBtn('cLeft', 'l'); bindBtn('cRight', 'r');
    let dragging = false;
    const onMove = e => {
      if (!dragging) return;
      const r0 = cv.getBoundingClientRect();
      const x = (e.clientX - r0.left) / r0.width * W;
      basket.x = clamp(x - basket.w / 2, 0, W - basket.w);
    };
    cv.addEventListener('pointerdown', e => { dragging = true; onMove(e); });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', () => { dragging = false; });

    function loop() {
      const now = Date.now();
      const dt = Math.min(50, now - lastT); lastT = now;
      acc += dt;
      const timeEl = document.getElementById('catchTime');
      if (acc >= 1000) {
        acc -= 1000;
        g.left -= 1;
        if (timeEl) timeEl.textContent = g.left;
      }
      // 篮子
      if (keys.l) basket.x -= 0.34 * dt;
      if (keys.r) basket.x += 0.34 * dt;
      basket.x = clamp(basket.x, 0, W - basket.w);
      // 掉落物
      spawnAt -= dt;
      if (spawnAt <= 0 && g.left > 0) {
        const life = 20 - Math.min(14, (g.score || 0) * 0.7);
        spawnAt = 520 + Math.random() * 420;
        items.push({ x: 14 + Math.random() * (W - 34), y: -18, vy: 0.08 + Math.random() * 0.05, emo: pick(emo), size: 22 });
      }
      // 更新
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.vy * dt;
        if (it.y > H - 26 && it.y < H - 12 && it.x > basket.x - it.size / 2 && it.x < basket.x + basket.w + it.size / 2) {
          g.score = (g.score || 0) + 1;
          items.splice(i, 1);
          continue;
        }
        if (it.y > H) items.splice(i, 1);
      }
      // 绘制
      ctx.clearRect(0, 0, W, H);
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#FFF6E0'); grd.addColorStop(1, '#EAF7DA');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#CFE8C0'; ctx.fillRect(0, H - 26, W, 26);
      ctx.font = '22px system-ui';
      items.forEach(it => { ctx.fillText(it.emo, it.x, it.y); });
      // 篮子
      ctx.fillStyle = '#D9A87C'; ctx.strokeStyle = '#A87B52'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(basket.x, H - 26); ctx.lineTo(basket.x + basket.w, H - 26);
      ctx.lineTo(basket.x + basket.w - 8, H - 12); ctx.lineTo(basket.x + 8, H - 12); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // 宠物在角落看
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.font = '12px system-ui';
      ctx.fillText('接住 ' + (g.score || 0) + ' 个', 10, 20);

      if (g.left <= 0) {
        window.removeEventListener('pointermove', onMove);
        finishCatch(g.score || 0);
        return;
      }
      _catchRaf = requestAnimationFrame(loop);
    }
    loop();
  }
  function finishCatch(score) {
    cancelAnimationFrame(_catchRaf);
    const p = currentPet(); if (!p) return;
    consumePlay();
    const tiers = [[0, 0, ['三叶草']], [3, 1, ['牛奶', '三叶草']], [7, 2, ['布丁', '蜂蜜', '三叶草']], [12, 3, ['星星糖', '布丁', '蜂蜜', '猫草面包']]];
    let reward = tiers[0];
    tiers.forEach(t => { if (score >= t[0]) reward = t; });
    const foods = reward[2].slice(0, Math.max(1, reward[1]));
    foods.forEach(f => bagAdd(f, '食材', 1));
    p.mood = clamp(p.mood + 8 + Math.min(20, score), 0, 100);
    p.bond = clamp(p.bond + 5 + Math.floor(score / 2), 0, 999);
    p.energy = clamp(p.energy - 10, 0, 100);
    const r = petGain(p, 10 + score * 2, '接礼物');
    commitPets(p);
    grantExp(4 + score, '陪 ' + p.name + ' 玩接礼物');
    ui.gameState = {
      type: 'result', last: 'catch',
      text: '接住了 ' + score + ' 个礼物！' + (score >= 12 ? '手速惊人 🎉' : score >= 7 ? '相当不错～' : '下次再加油'),
      reward: '心情 +' + (8 + Math.min(20, score)) + ' · 亲密度 +' + (5 + Math.floor(score / 2)) + ' · 食材 ' + foods.join('、')
    };
    celebrate(p, r);
    renderPets();
  }

  /* ============================================================
     22) 演示数据 & 初始化
     ============================================================ */
  const LS_DEMO = 'earth_online_pet_demo1';
  let _cloudHasData = false;
  function ensureSeed(force) {
    if (!force && localStorage.getItem(LS_DEMO) === '1') return false;
    if (getPets().length) { localStorage.setItem(LS_DEMO, '1'); return false; }
    // 云端已经有数据（或刚才已拉到）时不再播种示例，避免把示例重复推上云
    if (_cloudHasData || ((_cache.pets || []).length) || ((_cache.bag || []).length)) return false;
    const p = newPet('naituan', '团子');
    p.level = 3; p.exp = 12; p.stage = '少年'; p.bond = 46; p.trips = 1;
    p.mood = 88; p.hun = 74; p.clean = 92; p.energy = 80;
    p.demo = true;
    savePets([p]);
    const bag = [];
    [['牛奶', '食材', 3], ['抹茶饼干', '食材', 2], ['三叶草', '食材', 6], ['布丁', '食材', 1], ['粗布帐篷', '道具', 1], ['星星糖', '食材', 2]]
      .forEach(x => bag.push({ name: x[0], type: x[1], n: x[2] }));
    saveBag(bag);
    const demoSpot = SPOTS.filter(s => s.name === '奶油山丘')[0];
    saveTrips([{
      id: 'demo_trip', date: todayStr(), pet: '团子', spot: demoSpot.name,
      line: demoSpot.lines[0], gifts: ['牛奶'], friends: ['放牛的小羊'], moodText: '心情超级好！', opened: true
    }]);
    const y = getYard(); y.seedsAt = Date.now() - 240000; saveYard(y);
    localStorage.setItem(LS_DEMO, '1');
    return true;
  }
  async function petClearDemo() {
    if (!(await uiConfirm('清空示例的宠物/食材/旅行记录？清空后你可以自己从领养所开始。'))) return;
    localStorage.removeItem(LS_PETS); localStorage.removeItem(LS_BAG);
    localStorage.removeItem(LS_TRIPS); localStorage.removeItem(LS_YARD);
    localStorage.removeItem(LS_ADOPT);
    localStorage.setItem(LS_DEMO, '1');
    ui.petId = null; ui.tab = 'room'; ui.adoptPool = []; ui.adoptOpen = false;
    toast('已清空，去领养所挑一只吧 🐾');
    renderPets();
    // 同步清空云端三张表（异步，不阻塞界面）
    window.petClearCloud();
  }
  window.petClearDemo = petClearDemo;

  /* 统一的宠物模块启动：等 SDK → 拉云端 → 再决定是否播种示例
     （顺序不能反，否则会把示例宠物重复推到云端） */
  let _petBootP = null;
  function petBootOnce() {
    if (_petBootP) return _petBootP;
    _petBootP = (async function () {
      try {
        if (window.__DBQ && window.__DBQ.ready) await window.__DBQ.ready(9000);
        await pullAll();
      } catch (e) { }
      try { ensureSeed(false); } catch (e) { }
      try { if (typeof renderPetEntry === 'function') renderPetEntry(); } catch (e) { }
      try { if (typeof renderPets === 'function' && document.getElementById('page-pets') &&
        document.getElementById('page-pets').style.display !== 'none') renderPets(); } catch (e) { }
      return true;
    })();
    return _petBootP;
  }
  window.petInit = petBootOnce;
  window.petEnsureSeed = ensureSeed;

  document.addEventListener('DOMContentLoaded', function () { petBootOnce(); });
  petBootOnce();

  /* ============================================================
     23) 首页「宠物小院」入口卡
     ============================================================ */
  function renderPetEntry() {
    const host = document.getElementById('petEntry');
    if (!host) return;
    const pets = getPets();
    if (!pets.length) {
      host.innerHTML = '<section class="pet-card pet-entry" onclick="goPage(\'page-pets\')">' +
        '<div class="pe-left"><span class="pe-emoji">🥚</span></div>' +
        '<div class="pe-mid"><div class="pe-title">还没有领养小伙伴</div>' +
        '<div class="pe-sub">最多可以养 3 只，它们会长大会旅行，还会给你寄明信片</div></div>' +
        '<span class="pe-go">去看看 ›</span></section>';
      return;
    }
    tickPets();
    const away = pets.filter(p => p.status === '旅行中').length;
    const need = pets.filter(p => p.status !== '旅行中' && (p.hun < 35 || p.mood < 35 || p.clean < 30)).length;
    let avatars = '<div class="pe-avatars">';
    pets.slice(0, 3).forEach(p => {
      avatars += '<span class="pe-avatar">' + petSvg(p, 44) + '</span>';
    });
    avatars += '</div>';
    let tip = '';
    if (away) tip = away + ' 只正在外面旅行' + (pets.find(p => p.pendingGift) ? '，还有礼物等你拆！' : '～');
    else if (need) tip = need + ' 只正等着你照顾 🐾';
    else tip = '大家今天都很精神:)';
    host.innerHTML = '<section class="pet-card pet-entry" onclick="goPage(\'page-pets\')">' +
      '<div class="pe-left">' + avatars + '</div>' +
      '<div class="pe-mid"><div class="pe-title">宠物小院 · ' + pets.length + ' 只小伙伴</div>' +
      '<div class="pe-sub">' + esc(tip) + '</div></div>' +
      '<span class="pe-go">进院子 ›</span></section>';
  }
  window.renderPetEntry = renderPetEntry;

  window.petGameHide = petGameHide;
  window.petGameCatch = petGameCatch;
  window.petGameEnd = petGameEnd;
  window.petGameAgain = petGameAgain;
  window.petHidePick = petHidePick;
  window.petHideNext = petHideNext;

  /* 房间渲染中插入游戏区 */
  const _renderRoomRaw = renderRoom;
  renderRoom = function (p) {
    const gz = renderGameZone(p);
    const demoBtn = p.demo ? '<div class="demo-tip">这是示例宠物「' + esc(p.name) + '」<button class="btn-pixel secondary tiny" onclick="window.petClearDemo()">清空从这里重新开始</button></div>' : '';
    return gz + demoBtn + _renderRoomRaw(p);
  };
  /* @@END@@ */
})();
