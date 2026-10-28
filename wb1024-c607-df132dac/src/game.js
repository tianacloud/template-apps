
// ============================================================
// 游戏配置
// ============================================================
const ROWS = 5;
const COLS = 9;
const CELL_W = 0; // 动态计算

// ============================================================
// 斗蛐蛐模式 (Cricket Battle) 配置与状态
// ============================================================
const CRICKET_ROW_CAP = 5;      // 每行最多5个植物 = 一个队伍
const CRICKET_MAX_LEVEL = 16;   // 旧随机升级系统的上限(达到后不再升级)
const CRICKET_NEW_MAX = 5;      // 新固定升级系统的等级上限(0-5级)

// 飞升判词: 植物升至5级飞升时展示的中二四字判词(贴合各植物特性)
const ASCENSION_VERDICT = {
  peashooter:'灭世锋芒', sunflower:'辉耀九天', wallnut:'不破金身',
  cherrybomb:'湮灭虚空', snowpea:'冰封万界', chomper:'吞天噬地',
  repeater:'双锋裂空', gatling:'弹幕倾天', jalapeno:'焚世炎狱',
  potatomine:'不死图腾', torchwood:'燎原业火', spikeweed:'棘刺封疆',
  tallnut:'铁壁无双', cornpult:'陨星破阵', watermelon:'瓠碎苍穹',
  randombox:'混沌天平', cricketbigbox:'乾坤倒转', magmapea:'熔狱焚锋',
  doublesun:'双辉并曜', ironcactus:'钢刺镇魂', thornking:'荆棘王座',
  frostshroom:'凛冬永冻', stormflower:'雷霆审判', poisonvine:'蚀骨幽冥',
  lumapot:'圣辉涤世', iceshard:'碎冰绝境', venus:'噬界之花',
  shieldfern:'守护壁垒'
};
const CRICKET_ATK_SPEED_CAP = 0.5; // 新系统豌豆: 攻击间隔累计减少上限(达到即"攻速满")
const CRICKET_GRACE = 3;        // 战斗开始前发育秒数
const CRICKET_SPAWN_START = 10;   // 开局: 每行盲盒僵尸间隔(秒) = 10秒一个(每行独立计时)
const CRICKET_SPAWN_END = 1;      // 20分钟(1200s)时: 每只僵尸间隔(秒) = 1秒一个
const CRICKET_SPAWN_RAMP = 1200;  // 从开局到最终密度的过渡时长(秒) = 20分钟
// 布阵可选植物 + 随机盒子
const CRICKET_PLANTS = [
  'peashooter','wallnut','snowpea','repeater','gatling','chomper',
  'torchwood','spikeweed','tallnut','watermelon','cornpult',
  'potatomine',
  'magmapea','ironcactus','thornking','frostshroom',
  'stormflower','poisonvine','lumapot','iceshard','venus','shieldfern',
  'randombox','cricketbigbox'
];
let cricketSetup = false;       // 是否处于布阵阶段
let cricketTimer = 0;           // 战斗计时(秒)
let cricketGraceT = 0;          // 发育期剩余
let cricketRowAlive = [];       // 每行队伍是否存活
let cricketRowSpawnTimers = [];  // 每行独立的生成倒计时(逐行独立触发, 各行互不共用计时器)
let cricketEnded = false;       // 是否已结算
let cricketTeams = [];          // 开战前每行完整队伍(用于英灵殿收藏)
let cricketPendingTeam = null;  // 英灵殿待部署队伍(整队): 点击某行放置

// ============================================================
// 视口等比缩放（手机/平板适配，设计尺寸 1280x800）
// ============================================================
const DESIGN_W = 1280, DESIGN_H = 800;
let VIEW_SCALE = 1;
function updateViewportScale(){
  const s = Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H);
  VIEW_SCALE = s;
  document.getElementById('game').style.transform = 'translate(-50%,-50%) scale(' + s + ')';
}
window.addEventListener('resize', updateViewportScale);
window.addEventListener('orientationchange', () => setTimeout(updateViewportScale, 100));
updateViewportScale();

// 把视口坐标换算成 #game 内部设计坐标（消除缩放导致的坐标偏差）
function gRect(el){
  const r = el.getBoundingClientRect();
  const g = document.getElementById('game').getBoundingClientRect();
  const s = VIEW_SCALE || 1;
  return {
    left: (r.left - g.left) / s,
    top: (r.top - g.top) / s,
    right: (r.right - g.left) / s,
    bottom: (r.bottom - g.top) / s,
    width: r.width / s,
    height: r.height / s,
  };
}

// 植物配置
const PLANTS = {
  peashooter: {
    name:'豌豆射手', cost:100, cooldown:5, hp:300,
    action:'shoot', actionInterval:1.5, damage:20, projectile:'pea',
    css:'plant-peashooter'
  },
  sunflower: {
    name:'向日葵', cost:50, cooldown:7, hp:300,
    action:'produce_sun', actionInterval:10,
    css:'plant-sunflower'
  },
  wallnut: {
    name:'坚果墙', cost:50, cooldown:20, hp:4000,
    action:'none', css:'plant-wallnut'
  },
  cherrybomb: {
    name:'樱桃炸弹', cost:150, cooldown:30, hp:9999,
    action:'explode', actionInterval:1.2, damage:1800, radius:1,
    css:'plant-cherrybomb'
  },
  snowpea: {
    name:'寒冰射手', cost:175, cooldown:6, hp:300,
    action:'shoot', actionInterval:1.5, damage:20, projectile:'snow', slow:true,
    css:'plant-snowpea'
  },
  chomper: {
    name:'食人花', cost:150, cooldown:15, hp:300,
    action:'chomp', actionInterval:12, damage:1800, range:3,
    css:'plant-chomper'
  },
  repeater: {
    name:'双发射手', cost:200, cooldown:8, hp:300,
    action:'shoot', actionInterval:1.5, damage:20, projectile:'pea', shots:2,
    css:'plant-repeater'
  },
  gatling: {
    name:'机枪射手', cost:450, cooldown:30, hp:300,
    action:'shoot', actionInterval:1.5, damage:20, projectile:'pea', shots:4,
    css:'plant-gatling'
  },
  jalapeno: {
    name:'火爆辣椒', cost:125, cooldown:35, hp:9999,
    action:'explode', actionInterval:1.2, damage:1800, rowExplode:true,
    css:'plant-jalapeno'
  },
  potatomine: {
    name:'土豆地雷', cost:25, cooldown:25, hp:300,
    action:'arm', actionInterval:12, armTime:12, damage:1800,
    css:'plant-potatomine'
  },
  torchwood: {
    name:'火炬树桩', cost:175, cooldown:8, hp:300,
    action:'none', ember:true,
    css:'plant-torchwood'
  },
  spikeweed: {
    name:'地刺', cost:100, cooldown:8, hp:300,
    action:'spike', actionInterval:0.4, damage:10,
    css:'plant-spikeweed'
  },
  tallnut: {
    name:'高坚果', cost:125, cooldown:20, hp:8000,
    action:'none', blocksVault:true,
    css:'plant-tallnut'
  },
  cornpult: {
    name:'玉米投手', cost:100, cooldown:8, hp:300,
    action:'lob', actionInterval:2.2, damage:20, projectile:'corn',
    butterChance:0.2,
    css:'plant-cornpult'
  },
  watermelon: {
    name:'西瓜投手', cost:300, cooldown:10, hp:300,
    action:'lob', actionInterval:2.5, damage:40, projectile:'watermelon',
    splash:true, splashRadius:1,
    css:'plant-watermelon'
  },
  randombox: {
    name:'随机盒子', cost:50, cooldown:5, hp:300,
    action:'none', css:'plant-randombox',
    isBox:true,
  },
  // ===== 斗蛐蛐专属盲盒 =====
  cricketbigbox: {
    name:'斗蛐蛐大盲盒', cost:150, cooldown:5, hp:300,
    action:'none', css:'plant-cricketbigbox',
    isBox:true, cricketOnly:true,
    boxPool:'cricket6', // 只放出已设计 0–5 级固定机制的植物
  },
  // ===== 斗蛐蛐专属植物 (cricketOnly) =====
  magmapea: {
    name:'熔岩豌豆', cost:175, cooldown:6, hp:300,
    action:'shoot', actionInterval:1.5, damage:24, projectile:'pea',
    alwaysFire:true, fireMult:1.8, cricketOnly:true,
  },
  doublesun: {
    name:'双生葵', cost:75, cooldown:8, hp:300,
    action:'produce_sun', actionInterval:9, sunMult:2.2, cricketOnly:true,
  },
  ironcactus: {
    name:'钢刺仙人掌', cost:125, cooldown:8, hp:400,
    action:'spike', actionInterval:0.4, damage:14, rangeBonus:0.8, armorPierce:1.5, cricketOnly:true,
  },
  thornking: {
    name:'荆棘王', cost:150, cooldown:20, hp:6000,
    action:'cricket_thorns', actionInterval:0.5, damage:90, cricketOnly:true,
  },
  frostshroom: {
    name:'寒霜菇', cost:175, cooldown:6, hp:300,
    action:'shoot', actionInterval:1.6, damage:18, projectile:'frostbolt', slow:true, cricketOnly:true,
  },
  stormflower: {
    name:'雷鸣花', cost:200, cooldown:10, hp:300,
    action:'cricket_chain', actionInterval:1.4, damage:30, chainCount:3, cricketOnly:true,
  },
  poisonvine: {
    name:'剧毒藤', cost:125, cooldown:8, hp:400,
    action:'cricket_poison', actionInterval:0.5, damage:6, poisonDps:18, poisonTime:3, poisonRange:0.9, cricketOnly:true,
  },
  lumapot: {
    name:'光菇', cost:125, cooldown:10, hp:600,
    action:'cricket_heal', actionInterval:1.5, healAmount:25, healRange:1, cricketOnly:true,
  },
  iceshard: {
    name:'冰晶柱', cost:150, cooldown:12, hp:500,
    action:'cricket_slowfield', actionInterval:1.5, slowRange:5, slowMult:0.5, cricketOnly:true,
  },
  venus: {
    name:'追踪花', cost:225, cooldown:12, hp:300,
    action:'cricket_snipe', actionInterval:2.0, damage:200, range:3, cricketOnly:true,
  },
  shieldfern: {
    name:'护盾蕨', cost:150, cooldown:12, hp:600,
    action:'cricket_shield', actionInterval:2.0, shieldDR:0.4, shieldRange:1, cricketOnly:true,
  },
};

// 僵尸配置
// 僵尸啃咬伤害倍率(每秒基础啃咬伤害 = ZOMBIES[type].damage * ZOMBIE_BITE_MULT)
const ZOMBIE_BITE_MULT = 18;

// 巨人僵尸挥棒状态机时长(秒): 前摇(蓄力) → 挥击(瞬间秒杀) → 后摇(收棒)
const GIANT_WINDUP  = 0.55;
const GIANT_STRIKE  = 0.16;
const GIANT_RECOVER = 0.55;

const ZOMBIES = {
  basic: { name:'普通僵尸', hp:200, speed:18, damage:1, css:'basic' },
  flag: { name:'旗帜僵尸', hp:200, speed:28, damage:1, css:'flag' },
  conehead: { name:'路障僵尸', hp:560, speed:18, damage:1, css:'conehead' },
  polevaulter: { name:'撑杆僵尸', hp:340, speed:30, damage:1, css:'polevaulter', special:'vault' },
  buckethead: { name:'铁桶僵尸', hp:1100, speed:18, damage:1, css:'buckethead' },
  newspaper: { name:'报纸僵尸', hp:340, speed:18, damage:1, css:'newspaper', special:'anger', angerHp:170, angerSpeed:42 },
  football: { name:'橄榄球僵尸', hp:1000, speed:28, damage:2, css:'football' },
  dancing: { name:'跳舞僵尸', hp:400, speed:18, damage:1, css:'dancing', special:'summon' },
  imp: { name:'小鬼僵尸', hp:100, speed:44, damage:1, css:'imp' },
  giant: { name:'巨人僵尸', hp:4000, speed:9, damage:1, css:'giant', special:'giant', oneShot:true },
  blindbox: { name:'盲盒僵尸', hp:200, speed:18, damage:1, css:'blindbox' },
};

// ============================================================
// 植物升级配置 — 每种植物的经验升级池
// stats: 数值升级 (可多级)
// skills: 特殊技能 (1级解锁, 2级强化)
// apply: 接收plant对象, 直接修改属性
// ============================================================
const PLANT_UPGRADES = {
  peashooter: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'射速强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'pierce',name:'穿透豌豆',icon:'🎯',max:3,levels:[
        {desc:'豌豆穿透2个僵尸',apply:p=>{p.pierce=2}},
        {desc:'豌豆穿透4个僵尸',apply:p=>{p.pierce=4}},
        {desc:'豌豆穿透6个僵尸',apply:p=>{p.pierce=6}},
      ]},
      {id:'extra',name:'连射',icon:'🔥',max:3,levels:[
        {desc:'额外发射1颗豌豆',apply:p=>{const prev=p.shotBonusExtra||0;p.shotBonusExtra=1;p.shots=(p.shots||1)-prev+1}},
        {desc:'额外发射2颗豌豆',apply:p=>{const prev=p.shotBonusExtra||0;p.shotBonusExtra=2;p.shots=(p.shots||1)-prev+2}},
        {desc:'额外发射3颗豌豆',apply:p=>{const prev=p.shotBonusExtra||0;p.shotBonusExtra=3;p.shots=(p.shots||1)-prev+3}},
      ]},
    ],
  },
  sunflower: {
    stats:[
      {id:'sun',name:'产量强化',desc:'+50% 阳光产量',max:3,icon:'☀️',apply:p=>{p.sunMult=(p.sunMult||1)*1.5}},
      {id:'rof',name:'效率强化',desc:'+30% 生产速度',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.7}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'double',name:'双倍阳光',icon:'✨',max:3,levels:[
        {desc:'阳光产量x2',apply:p=>{const prev=p.sunDoubleMult||1;p.sunDoubleMult=2;p.sunMult=(p.sunMult||1)/prev*2}},
        {desc:'阳光产量x3',apply:p=>{const prev=p.sunDoubleMult||1;p.sunDoubleMult=3;p.sunMult=(p.sunMult||1)/prev*3}},
        {desc:'阳光产量x4',apply:p=>{const prev=p.sunDoubleMult||1;p.sunDoubleMult=4;p.sunMult=(p.sunMult||1)/prev*4}},
      ]},
      {id:'heal',name:'治愈光环',icon:'💚',max:3,levels:[
        {desc:'每3秒治疗周围植物15%',apply:p=>{p.auraHeal=true;p.auraHealInterval=3;p.auraHealAmount=0.15;p.auraTimer=3}},
        {desc:'每2秒治疗周围植物25%',apply:p=>{p.auraHealInterval=2;p.auraHealAmount=0.25;p.auraTimer=2}},
        {desc:'每2秒治疗周围植物40%',apply:p=>{p.auraHealInterval=2;p.auraHealAmount=0.4;p.auraTimer=2}},
      ]},
    ],
  },
  wallnut: {
    stats:[
      {id:'hp',name:'生命强化',desc:'+80% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.8;p.hp=p.maxHp}},
      {id:'regen',name:'自我修复',desc:'每秒回复1%血量',max:1,icon:'🔄',apply:p=>{p.regen=true}},
    ],
    skills:[
      {id:'reflect',name:'反伤甲',icon:'🛡️',max:3,levels:[
        {desc:'反弹50%啃咬伤害',apply:p=>{p.reflect=0.5}},
        {desc:'反弹75%啃咬伤害',apply:p=>{p.reflect=0.75}},
        {desc:'反弹100%啃咬伤害',apply:p=>{p.reflect=1.0}},
      ]},
      {id:'hard',name:'硬化',icon:'🪨',max:3,levels:[
        {desc:'受伤减少30%',apply:p=>{p.dr=0.3}},
        {desc:'受伤减少50%',apply:p=>{p.dr=0.5}},
        {desc:'受伤减少70%',apply:p=>{p.dr=0.7}},
      ]},
    ],
  },
  snowpea: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'射速强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'freeze',name:'冰冻射线',icon:'🧊',max:3,levels:[
        {desc:'击中的僵尸冻结1秒',apply:p=>{p.freezeShot=true;p.freezeDuration=1}},
        {desc:'击中的僵尸冻结2秒',apply:p=>{p.freezeShot=true;p.freezeDuration=2}},
        {desc:'击中的僵尸冻结3秒',apply:p=>{p.freezeShot=true;p.freezeDuration=3}},
      ]},
      {id:'aura',name:'寒冰光环',icon:'❄️',max:3,levels:[
        {desc:'每1秒减速同行僵尸2秒',apply:p=>{p.slowAura=true;p.auraInterval=1;p.slowDuration=2;p.auraTimer=1}},
        {desc:'每1秒减速同行僵尸3秒',apply:p=>{p.slowDuration=3;p.auraTimer=1}},
        {desc:'每0.5秒减速同行僵尸4秒',apply:p=>{p.auraInterval=0.5;p.slowDuration=4;p.auraTimer=0.5}},
      ]},
    ],
  },
  chomper: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+50% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.5}},
      {id:'digest',name:'快速消化',desc:'消化时间-25%',max:3,icon:'⚡',apply:p=>{p.digestMult=(p.digestMult||1)*0.75}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'range',name:'远程吞食',icon:'👅',max:3,levels:[
        {desc:'攻击范围+1格',apply:p=>{p.rangeBonus=1}},
        {desc:'攻击范围+2格',apply:p=>{p.rangeBonus=2}},
        {desc:'攻击范围+3格',apply:p=>{p.rangeBonus=3}},
      ]},
      {id:'insta',name:'即时消化',icon:'🌀',max:3,levels:[
        {desc:'30%概率无消化时间',apply:p=>{p.instaDigest=0.3}},
        {desc:'50%概率无消化时间',apply:p=>{p.instaDigest=0.5}},
        {desc:'80%概率无消化时间',apply:p=>{p.instaDigest=0.8}},
      ]},
    ],
  },
  repeater: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'射速强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'pierce',name:'穿透豌豆',icon:'🎯',max:3,levels:[
        {desc:'豌豆穿透2个僵尸',apply:p=>{p.pierce=2}},
        {desc:'豌豆穿透4个僵尸',apply:p=>{p.pierce=4}},
        {desc:'豌豆穿透6个僵尸',apply:p=>{p.pierce=6}},
      ]},
      {id:'triple',name:'三连射',icon:'🔥',max:3,levels:[
        {desc:'额外发射1颗豌豆',apply:p=>{const prev=p.shotBonusTriple||0;p.shotBonusTriple=1;p.shots=(p.shots||1)-prev+1}},
        {desc:'额外发射2颗豌豆',apply:p=>{const prev=p.shotBonusTriple||0;p.shotBonusTriple=2;p.shots=(p.shots||1)-prev+2}},
        {desc:'额外发射3颗豌豆',apply:p=>{const prev=p.shotBonusTriple||0;p.shotBonusTriple=3;p.shots=(p.shots||1)-prev+3}},
      ]},
    ],
  },
  gatling: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'射速强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'pierce',name:'穿透豌豆',icon:'🎯',max:3,levels:[
        {desc:'豌豆穿透3个僵尸',apply:p=>{p.pierce=3}},
        {desc:'豌豆穿透5个僵尸',apply:p=>{p.pierce=5}},
        {desc:'豌豆穿透8个僵尸',apply:p=>{p.pierce=8}},
      ]},
      {id:'fire',name:'燃烧弹',icon:'🔥',max:3,levels:[
        {desc:'豌豆变火焰弹伤害x2',apply:p=>{p.alwaysFire=true;p.fireMult=2}},
        {desc:'火焰弹伤害x2.5',apply:p=>{p.fireMult=2.5}},
        {desc:'火焰弹伤害x3',apply:p=>{p.fireMult=3}},
      ]},
    ],
  },
  torchwood: {
    stats:[
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
      {id:'dmg',name:'烈焰强化',desc:'火豆伤害倍率+50%',max:3,icon:'🔥',apply:p=>{p.fireMult=(p.fireMult||2)*1.5}},
    ],
    skills:[
      {id:'aura',name:'火焰光环',icon:'🔆',max:3,levels:[
        {desc:'每0.5秒灼烧同行僵尸15伤害',apply:p=>{p.fireAura=true;p.auraInterval=0.5;p.fireDamage=15;p.auraTimer=0.5}},
        {desc:'每0.5秒灼烧同行僵尸30伤害',apply:p=>{p.fireDamage=30;p.auraTimer=0.5}},
        {desc:'每0.5秒灼烧同行僵尸50伤害',apply:p=>{p.fireDamage=50;p.auraTimer=0.5}},
      ]},
      {id:'splash',name:'溅射火焰',icon:'💥',max:3,levels:[
        {desc:'火豆溅射范围1格',apply:p=>{p.fireSplash=true;p.fireSplashRadius=1}},
        {desc:'火豆溅射范围2格',apply:p=>{p.fireSplashRadius=2}},
        {desc:'火豆溅射范围3格',apply:p=>{p.fireSplashRadius=3}},
      ]},
      {id:'frostflame',name:'寒焰',icon:'❄️',max:3,levels:[
        {desc:'豌豆变寒火豆: 伤害x2+减速2秒',apply:p=>{p.frostFlame=true;p.frostMult=2;p.frostSlowDuration=2}},
        {desc:'寒火豆伤害x2.5+减速3秒',apply:p=>{p.frostMult=2.5;p.frostSlowDuration=3}},
        {desc:'寒火豆伤害x3+减速4秒',apply:p=>{p.frostMult=3;p.frostSlowDuration=4}},
      ]},
    ],
  },
  spikeweed: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+40% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.4}},
      {id:'rof',name:'攻速强化',desc:'+30% 攻速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.7}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'wide',name:'尖刺扩散',icon:'📐',max:3,levels:[
        {desc:'影响范围+1格',apply:p=>{p.rangeBonus=1}},
        {desc:'影响范围+2格',apply:p=>{p.rangeBonus=2}},
        {desc:'影响范围+3格',apply:p=>{p.rangeBonus=3}},
      ]},
      {id:'armor',name:'破甲尖刺',icon:'🔪',max:3,levels:[
        {desc:'无视护甲伤害+50%',apply:p=>{p.armorPierce=0.5}},
        {desc:'无视护甲伤害+100%',apply:p=>{p.armorPierce=1.0}},
        {desc:'无视护甲伤害+150%',apply:p=>{p.armorPierce=1.5}},
      ]},
    ],
  },
  tallnut: {
    stats:[
      {id:'hp',name:'生命强化',desc:'+80% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.8;p.hp=p.maxHp}},
      {id:'regen',name:'自我修复',desc:'每秒回复1%血量',max:1,icon:'🔄',apply:p=>{p.regen=true}},
    ],
    skills:[
      {id:'reflect',name:'反伤甲',icon:'🛡️',max:3,levels:[
        {desc:'反弹50%啃咬伤害',apply:p=>{p.reflect=0.5}},
        {desc:'反弹75%啃咬伤害',apply:p=>{p.reflect=0.75}},
        {desc:'反弹100%啃咬伤害',apply:p=>{p.reflect=1.0}},
      ]},
      {id:'hard',name:'硬化',icon:'🪨',max:3,levels:[
        {desc:'受伤减少30%',apply:p=>{p.dr=0.3}},
        {desc:'受伤减少50%',apply:p=>{p.dr=0.5}},
        {desc:'受伤减少70%',apply:p=>{p.dr=0.7}},
      ]},
    ],
  },
  cornpult: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'投速强化',desc:'+25% 投速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'butter',name:'黄油大师',icon:'🧈',max:3,levels:[
        {desc:'黄油概率→50%',apply:p=>{p.butterBoost=true}},
        {desc:'黄油概率→70%',apply:p=>{p.butterBoost=true;p.butterChance=0.7}},
        {desc:'黄油概率→100%',apply:p=>{p.butterBoost=true;p.butterChance=1.0}},
      ]},
      {id:'double',name:'双投',icon:'✌️',max:3,levels:[
        {desc:'一次投掷2颗',apply:p=>{p.doubleThrow=true;p.throwCount=2}},
        {desc:'一次投掷3颗',apply:p=>{p.doubleThrow=true;p.throwCount=3}},
        {desc:'一次投掷4颗',apply:p=>{p.doubleThrow=true;p.throwCount=4}},
      ]},
    ],
  },
  watermelon: {
    stats:[
      {id:'dmg',name:'伤害强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'投速强化',desc:'+25% 投速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'freeze',name:'冰冻西瓜',icon:'🧊',max:3,levels:[
        {desc:'击中的僵尸冻结1秒',apply:p=>{p.freezeShot=true;p.freezeDuration=1}},
        {desc:'击中的僵尸冻结2秒',apply:p=>{p.freezeShot=true;p.freezeDuration=2}},
        {desc:'击中的僵尸冻结3秒',apply:p=>{p.freezeShot=true;p.freezeDuration=3}},
      ]},
      {id:'splash',name:'范围扩大',icon:'💥',max:3,levels:[
        {desc:'溅射范围+1格',apply:p=>{p.splashBoost=true;p.splashBonus=1}},
        {desc:'溅射范围+2格',apply:p=>{p.splashBoost=true;p.splashBonus=2}},
        {desc:'溅射范围+3格',apply:p=>{p.splashBoost=true;p.splashBonus=3}},
      ]},
    ],
  },
  // ===== 斗蛐蛐专属植物升级池 =====
  magmapea: {
    stats:[
      {id:'dmg',name:'岩浆强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'喷发强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'burn',name:'燃烧',icon:'🔥',max:3,levels:[
        {desc:'火焰伤害+30%',apply:p=>{p.fireMult=(p.fireMult||1.8)*1.3}},
        {desc:'火焰伤害+60%',apply:p=>{p.fireMult=(p.fireMult||1.8)*1.6}},
        {desc:'火焰伤害+100%',apply:p=>{p.fireMult=(p.fireMult||1.8)*2}},
      ]},
    ],
  },
  potatomine: {
    stats:[
      {id:'dmg',name:'雷伤强化',desc:'+35% 雷伤',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'频率强化',desc:'-15% 间隔',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.85}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'multi',name:'多重雷',icon:'💣',max:3,levels:[
        {desc:'同时向最前2个僵尸布雷',apply:p=>{p.mineTargets=2}},
        {desc:'同时向最前3个僵尸布雷',apply:p=>{p.mineTargets=3}},
        {desc:'同时向最前4个僵尸布雷',apply:p=>{p.mineTargets=4}},
      ]},
      {id:'emp',name:'电磁雷',icon:'🌀',max:3,levels:[
        {desc:'雷爆炸使范围内僵尸减速并叠加寒意',apply:p=>{p.mineSlow=true;p.mineSlowMult=0.6;p.mineSlowDur=1}},
        {desc:'减速更强且持续2秒',apply:p=>{p.mineSlowMult=0.45;p.mineSlowDur=2}},
        {desc:'减速极强且持续3秒',apply:p=>{p.mineSlowMult=0.3;p.mineSlowDur=3}},
      ]},
    ],
  },
  ironcactus: {
    stats:[
      {id:'dmg',name:'尖刺强化',desc:'+40% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.4}},
      {id:'pierce',name:'破甲强化',desc:'+50% 破甲',max:3,icon:'🪓',apply:p=>{p.armorPierce=(p.armorPierce||1.5)+0.5}},
      {id:'range',name:'范围强化',desc:'+1 格范围',max:3,icon:'📏',apply:p=>{p.rangeBonus=(p.rangeBonus||0.8)+0.4}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'quill',name:'飞针',icon:'🎯',max:3,levels:[
        {desc:'每次攻击额外向最前方僵尸射出20伤飞针',apply:p=>{p.quillDmg=20}},
        {desc:'飞针伤害40',apply:p=>{p.quillDmg=40}},
        {desc:'飞针伤害60',apply:p=>{p.quillDmg=60}},
      ]},
    ],
  },
  thornking: {
    stats:[
      {id:'dmg',name:'荆棘强化',desc:'+35% 反伤',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'频率强化',desc:'+25% 频率',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'护甲强化',desc:'+50% 血量',max:3,icon:'🛡️',apply:p=>{p.maxHp*=1.5;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'ward',name:'王之守护',icon:'👑',max:3,levels:[
        {desc:'荆棘王获得30%减伤',apply:p=>{p.dr=0.3}},
        {desc:'荆棘王获得50%减伤',apply:p=>{p.dr=0.5}},
        {desc:'荆棘王获得70%减伤',apply:p=>{p.dr=0.7}},
      ]},
    ],
  },
  frostshroom: {
    stats:[
      {id:'dmg',name:'霜冻强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'rof',name:'射速强化',desc:'+25% 射速',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'frost',name:'凛冬',icon:'🧊',max:3,levels:[
        {desc:'减速更强',apply:p=>{p.slow=true;p.slowMult=(p.slowMult||0.5)*0.8}},
        {desc:'减速极强',apply:p=>{p.slow=true;p.slowMult=(p.slowMult||0.5)*0.6}},
        {desc:'命中即冻',apply:p=>{p.freezeShot=true;p.freezeDuration=1}},
      ]},
    ],
  },
  stormflower: {
    stats:[
      {id:'dmg',name:'雷强强化',desc:'+35% 伤害',max:3,icon:'⚔️',apply:p=>{p.damage*=1.35}},
      {id:'chain',name:'连锁强化',desc:'+1 连锁目标',max:3,icon:'⚡',apply:p=>{p.chainCount=(p.chainCount||3)+1}},
      {id:'rof',name:'频率强化',desc:'+25% 频率',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'arc',name:'寒雷',icon:'❄️',max:3,levels:[
        {desc:'连锁命中的僵尸叠加寒意',apply:p=>{p.chainChill=true}},
        {desc:'寒雷扩散(连锁+1)',apply:p=>{p.chainCount=(p.chainCount||3)+1;p.chainChill=true}},
        {desc:'寒雷连锁+2',apply:p=>{p.chainCount=(p.chainCount||3)+2;p.chainChill=true}},
      ]},
    ],
  },
  poisonvine: {
    stats:[
      {id:'pdp',name:'毒强强化',desc:'+40% 毒伤',max:3,icon:'☠️',apply:p=>{p.poisonDps*=1.4}},
      {id:'pt',name:'毒期强化',desc:'+1秒 毒期',max:3,icon:'⏱️',apply:p=>{p.poisonTime+=1}},
      {id:'range',name:'范围强化',desc:'+0.5 格范围',max:3,icon:'📏',apply:p=>{p.poisonRange=(p.poisonRange||0.9)+0.4}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'epidemic',name:'瘟疫',icon:'🦠',max:3,levels:[
        {desc:'中毒目标叠加寒意(减速)',apply:p=>{p.poisonChill=true}},
        {desc:'瘟疫扩散(毒伤+20%)',apply:p=>{p.poisonDps*=1.2;p.poisonChill=true}},
        {desc:'瘟疫爆发(毒伤+40%)',apply:p=>{p.poisonDps*=1.4;p.poisonChill=true}},
      ]},
    ],
  },
  lumapot: {
    stats:[
      {id:'heal',name:'治疗强化',desc:'+10 治疗量',max:3,icon:'💚',apply:p=>{p.healAmount+=10}},
      {id:'range',name:'光环强化',desc:'+1 格范围',max:3,icon:'📏',apply:p=>{p.healRange=(p.healRange||1)+1}},
      {id:'rof',name:'频率强化',desc:'+25% 频率',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'sanctuary',name:'圣域',icon:'🛡️',max:3,levels:[
        {desc:'治疗时给范围内植物10%减伤',apply:p=>{p.healDR=0.1}},
        {desc:'减伤20%',apply:p=>{p.healDR=0.2}},
        {desc:'减伤30%',apply:p=>{p.healDR=0.3}},
      ]},
    ],
  },
  iceshard: {
    stats:[
      {id:'range',name:'减速范围',desc:'+1 格减速范围',max:3,icon:'📏',apply:p=>{p.slowRange=(p.slowRange||5)+1}},
      {id:'str',name:'减速强度',desc:'更强减速',max:3,icon:'❄️',apply:p=>{p.slowMult=Math.max(0.2,(p.slowMult||0.5)-0.1)}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'blizzard',name:'暴雪',icon:'🌨️',max:3,levels:[
        {desc:'力场内僵尸更快积累寒意',apply:p=>{p.fieldChillBonus=true}},
        {desc:'暴雪扩散(范围+1)',apply:p=>{p.slowRange=(p.slowRange||5)+1;p.fieldChillBonus=true}},
        {desc:'极寒暴雪(范围+2)',apply:p=>{p.slowRange=(p.slowRange||5)+2;p.fieldChillBonus=true}},
      ]},
    ],
  },
  venus: {
    stats:[
      {id:'dmg',name:'狙击强化',desc:'+35% 伤害',max:3,icon:'🎯',apply:p=>{p.damage*=1.35}},
      {id:'range',name:'射程强化',desc:'+1 格射程',max:3,icon:'📏',apply:p=>{p.range=(p.range||3)+1}},
      {id:'rof',name:'频率强化',desc:'+25% 频率',max:3,icon:'⚡',apply:p=>{p.attackInterval*=0.8}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'pierce',name:'贯穿',icon:'➡️',max:3,levels:[
        {desc:'狙击穿透直线2个僵尸',apply:p=>{p.snipePierce=2}},
        {desc:'狙击穿透直线3个僵尸',apply:p=>{p.snipePierce=3}},
        {desc:'狙击穿透直线4个僵尸',apply:p=>{p.snipePierce=4}},
      ]},
    ],
  },
  shieldfern: {
    stats:[
      {id:'dr',name:'护盾强化',desc:'+10% 减伤',max:3,icon:'🛡️',apply:p=>{p.shieldDR=Math.min(0.85,(p.shieldDR||0.4)+0.1)}},
      {id:'range',name:'光环强化',desc:'+1 格范围',max:3,icon:'📏',apply:p=>{p.shieldRange=(p.shieldRange||1)+1}},
      {id:'hp',name:'生命强化',desc:'+60% 血量',max:3,icon:'❤️',apply:p=>{p.maxHp*=1.6;p.hp=p.maxHp}},
    ],
    skills:[
      {id:'reflect',name:'荆棘护盾',icon:'🪞',max:3,levels:[
        {desc:'护盾范围内植物获得50%啃咬反伤',apply:p=>{p.shieldReflect=0.5}},
        {desc:'反伤75%',apply:p=>{p.shieldReflect=0.75}},
        {desc:'反伤100%',apply:p=>{p.shieldReflect=1.0}},
      ]},
    ],
  },
};

// 波次配置
const WAVES = [
  // 波次1: 5个普通（入门，节奏舒缓）
  { zombies: [
    {type:'basic',time:4},{type:'basic',time:14},{type:'basic',time:24},
    {type:'basic',time:34},{type:'basic',time:44},
  ]},
  // 波次2: 8个混合，旗帜僵尸带头
  { zombies: [
    {type:'flag',time:1},{type:'basic',time:3},{type:'basic',time:7},
    {type:'conehead',time:11},{type:'basic',time:15},{type:'basic',time:19},
    {type:'conehead',time:23},{type:'basic',time:27},{type:'basic',time:31},
  ]},
  // 波次3: 10个，首次出现撑杆僵尸
  { zombies: [
    {type:'basic',time:2},{type:'conehead',time:5},{type:'basic',time:8},
    {type:'polevaulter',time:12},{type:'basic',time:15},{type:'buckethead',time:18},
    {type:'conehead',time:21},{type:'basic',time:24},{type:'conehead',time:28},
    {type:'basic',time:32},
  ]},
  // 波次4: 12个，报纸僵尸登场
  { zombies: [
    {type:'flag',time:1},{type:'conehead',time:4},{type:'basic',time:7},
    {type:'newspaper',time:10},{type:'buckethead',time:13},{type:'conehead',time:16},
    {type:'basic',time:19},{type:'polevaulter',time:22},{type:'conehead',time:25},
    {type:'basic',time:28},{type:'buckethead',time:31},{type:'basic',time:34},
  ]},
  // 波次5: 14个，橄榄球僵尸登场
  { zombies: [
    {type:'flag',time:1},{type:'basic',time:3},{type:'football',time:6},
    {type:'conehead',time:9},{type:'newspaper',time:12},{type:'basic',time:15},
    {type:'buckethead',time:18},{type:'polevaulter',time:21},{type:'football',time:24},
    {type:'conehead',time:27},{type:'basic',time:30},{type:'buckethead',time:33},
    {type:'conehead',time:36},{type:'basic',time:39},
  ]},
  // 波次6: 16个，跳舞僵尸召唤小鬼
  { zombies: [
    {type:'flag',time:1},{type:'conehead',time:3},{type:'football',time:5},
    {type:'basic',time:8},{type:'dancing',time:11},{type:'buckethead',time:14},
    {type:'polevaulter',time:17},{type:'newspaper',time:20},{type:'conehead',time:23},
    {type:'football',time:26},{type:'basic',time:29},{type:'dancing',time:32},
    {type:'buckethead',time:35},{type:'conehead',time:38},{type:'polevaulter',time:41},
    {type:'basic',time:44},
  ]},
  // 波次7(最终波): 20个，全军出击！
  { zombies: [
    {type:'flag',time:1},{type:'basic',time:2},{type:'conehead',time:3},
    {type:'football',time:5},{type:'basic',time:7},{type:'buckethead',time:9},
    {type:'dancing',time:11},{type:'polevaulter',time:13},{type:'newspaper',time:15},
    {type:'conehead',time:17},{type:'football',time:19},{type:'basic',time:21},
    {type:'buckethead',time:23},{type:'dancing',time:25},{type:'polevaulter',time:27},
    {type:'conehead',time:29},{type:'newspaper',time:31},{type:'football',time:33},
    {type:'buckethead',time:35},{type:'basic',time:37},
  ]},
];

// 普通模式(冒险/挑战)也出现巨人僵尸: 在后期波次注入巨人, 难度递增
WAVES.forEach((w, i) => {
  if(i >= WAVES.length - 3){ // 最后3波(对应后期关卡)
    const lastTime = w.zombies.length ? w.zombies[w.zombies.length - 1].time : 5;
    w.zombies.push({type:'giant', time: lastTime + 4});
  }
});

// ============================================================
// 游戏状态
// ============================================================
let state = {
  sun: 50,
  selectedPlant: null,
  shovelMode: false,
  gloveMode: false,
  heldPlant: null,
  heldFrom: null,
  gloveCd: 0,
  grid: [], // [row][col] = 植物数组 (支持叠种)
  zombies: [],
  projectiles: [],
  suns: [],
  explosions: [],
  lawnmowers: [],
  waveIndex: 0,
  waveSpawnIndex: 0,
  waveTimer: 0,
  graceTimer: 0,
  gameRunning: false,
  ascensionFreeze: 0,   // 飞升时间停止剩余秒数(>0 时冻结世界更新, 真实时间)
  gameMode: 'adventure', // 'adventure' | 'endless' | 'challenge'
  challengeId: null,     // 当前挑战 id
  endlessRound: 0,
  sunDropTimer: 5,
  lastTime: 0,
  cooldowns: {}, // plantType -> remaining seconds
  zombiesKilled: 0,
  totalZombies: 0,
  gameTime: 0,        // 战斗累计时间(秒), 用于计算DPS
  teamDamage: [],      // 每行(队伍)累计造成伤害
  cursorDecayTimer: 0, // 光标标记全局衰减计时器(每5秒减1层)
};

// Debug 开关 (独立于 state, 重开局不重置)
const debug = {
  stack: false,      // 叠种模式
  infSun: false,     // 无限阳光
  noCd: false,       // 植物无冷却
  spawnMult: 1,      // 僵尸生成速度倍率
  speed: 1,          // 游戏整体加速倍率
};

// 计算总僵尸数
WAVES.forEach(w => state.totalZombies += w.zombies.length);

// ============================================================
// 初始化
// ============================================================
function initGame(){
  // 生成格子
  const lawn = document.getElementById('lawn');
  for(let r=0; r<ROWS; r++){
    state.grid[r] = [];
    for(let c=0; c<COLS; c++){
      state.grid[r][c] = [];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => onCellClick(r, c));
      cell.addEventListener('contextmenu', (e) => onCellRightClick(r, c, e));
      cell.addEventListener('mouseenter', () => onCellHover(r, c, true));
      cell.addEventListener('mouseleave', () => onCellHover(r, c, false));
      lawn.appendChild(cell);
    }
  }

  // 伤害统计与计时初始化
  state.teamDamage = new Array(ROWS).fill(0);
  state.gameTime = 0;

  // 生成种子栏 - 使用战前选中的植物
  const seedbar = document.getElementById('seedbar');
  seedbar.innerHTML = '';
  const seedOrder = chosenPlants.length > 0 ? chosenPlants : (currentLevelConfig ? currentLevelConfig.plants : Object.keys(PLANTS).filter(t => !PLANTS[t].cricketOnly));
  for(const type of seedOrder){
    const cfg = PLANTS[type];
    const slot = document.createElement('div');
    slot.className = 'seed-slot';
    slot.dataset.plant = type;
    slot.innerHTML = `
      <div class="seed-icon">${createPlantHTML(type)}</div>
      <div class="cost">☀${cfg.cost}</div>
      <div class="cooldown-overlay" style="height:0%"></div>
    `;
    slot.addEventListener('click', () => selectPlant(type));
    seedbar.appendChild(slot);
    state.cooldowns[type] = 0;
  }

  // 生成割草机 - 含升级加成
  const extraMowers = getExtraMowers();
  const lawnRect0 = gRect(lawn);
  const rowH = lawnRect0.height / ROWS;
  for(let r=0; r<ROWS; r++){
    for(let m=0; m < 1 + extraMowers; m++){
      const mower = document.createElement('div');
      mower.className = 'lawnmower';
      mower.innerHTML = `
        <div class="blade"></div>
        <div class="body"></div>
        <div class="wheel left"></div>
        <div class="wheel right"></div>
      `;
      mower.style.top = (r * rowH + rowH - 52) + 'px';
      mower.style.left = (m * -45) + 'px';
      mower.style.display = m > 0 ? 'none' : 'block';
      lawn.appendChild(mower);
      let statEl = null;
      if(m === 0){
        statEl = document.createElement('div');
        statEl.className = 'mower-stat';
        statEl.textContent = 'DPS 0  总伤 0';
        mower.appendChild(statEl);
      }
      state.lawnmowers.push({el:mower, row:r, used:false, active:false, x:0, slot:m, statEl:statEl});
    }
  }

  const waveCount = currentLevelWaves.length || WAVES.length;
  if(state.gameMode === 'endless'){
    document.getElementById('wave-total').textContent = '∞';
    document.getElementById('wave-num').textContent = state.endlessRound || 1;
  } else {
    document.getElementById('wave-total').textContent = waveCount;
    document.getElementById('wave-num').textContent = '1';
  }
  state.gameRunning = true;
  // 挑战模式: 开局预置植物
  if(state.gameMode === 'challenge'){
    placePrePlacedPlants();
  }
  // 启动发育阶段 (挑战可自定义时长)
  const chGrace = getChallengeCfg();
  startGracePeriod(
    waveCount === 1,
    (chGrace && chGrace.config.graceSeconds !== undefined) ? chGrace.config.graceSeconds : undefined
  );
  startGameLoop();
}

// ============================================================
// 发育阶段 (开局宽限期)
// ============================================================
function startGracePeriod(isSingleWave, customSec){
  state._graceIsSingle = isSingleWave;
  const banner = document.getElementById('grace-banner');
  const countEl = document.getElementById('grace-count');
  // 无法种植的挑战(无预置可布防): 跳过发育阶段, 立即开波
  const ch = getChallengeCfg();
  if(ch && (!ch.config.plants || ch.config.plants.length === 0)){
    state.graceTimer = 0;
    banner.style.display = 'none';
    showWaveBanner(1, isSingleWave);
    return;
  }
  const secs = (customSec !== undefined) ? customSec : 25;
  if(secs <= 0){
    // 挑战: 无发育阶段, 立即开波
    state.graceTimer = 0;
    banner.style.display = 'none';
    showWaveBanner(1, isSingleWave);
    return;
  }
  state.graceTimer = secs;
  countEl.textContent = String(Math.ceil(secs));
  banner.style.display = 'block';
}

function endGracePeriod(){
  const banner = document.getElementById('grace-banner');
  banner.style.display = 'none';
  if(state.gameMode === 'endless'){
    showWaveBanner(state.endlessRound, false);
  } else {
    showWaveBanner(1, state._graceIsSingle || false);
  }
  // 恢复默认发育横幅文本
  document.getElementById('grace-label').textContent = '🌱 发育阶段';
  document.getElementById('grace-tip').textContent = '僵尸尚未出现，抓紧种植！';
}

// ============================================================
// 植物/僵尸素材映射
// ============================================================
const PLANT_SPRITES = {
  peashooter:'assets/peashooter.webp',
  sunflower:'assets/sunflower.webp',
  wallnut:'assets/wallnut.webp',
  cherrybomb:'assets/cherrybomb.webp',
  snowpea:'assets/snowpea.webp',
  chomper:'assets/chomper.webp',
  repeater:'assets/repeater.webp',
  gatling:'assets/gatling.webp',
  torchwood:'assets/torchwood.webp',
  tallnut:'assets/tallnut.webp',
  jalapeno:'assets/jalapeno.webp',
  potatomine:'assets/potatomine.webp',
  spikeweed:'assets/spikeweed.png',
  watermelon:'assets/watermelon.webp',
  cornpult:'assets/cornpult.webp',
};
const ZOMBIE_SPRITES = {
  basic:'assets/z_basic.png',
  flag:'assets/z_flag.png',
  conehead:'assets/z_conehead.webp',
  polevaulter:'assets/z_polevaulter.webp',
  buckethead:'assets/z_buckethead.webp',
  football:'assets/z_football.png',
  dancing:'assets/z_dancing.png',
  imp:'assets/z_imp.webp',
  newspaper:'assets/z_newspaper.webp',
};

// ============================================================
// 创建植物HTML (CSS 精灵绘制)
// ============================================================
function createPlantHTML(type){
  switch(type){
    case 'peashooter':
      return `<div class="plant-peashooter">
        <div class="stem"></div>
        <div class="leaf left"></div><div class="leaf right"></div>
        <div class="head"><div class="eye"></div><div class="mouth"></div></div>
      </div>`;
    case 'sunflower': {
      let petals = '';
      for(let i = 0; i < 8; i++){
        petals += `<div class="petal" style="transform:rotate(${i * 45}deg)"></div>`;
      }
      return `<div class="plant-sunflower">
        <div class="stem"></div>
        <div class="leaf left"></div>
        <div class="flower">${petals}<div class="center"></div></div>
      </div>`;
    }
    case 'wallnut':
      return `<div class="plant-wallnut">
        <div class="body">
          <div class="eye-l"></div><div class="eye-r"></div>
          <div class="mouth"></div>
          <div class="crack c1"></div><div class="crack c2"></div><div class="crack c3"></div>
        </div>
      </div>`;
    case 'cherrybomb':
      return `<div class="plant-cherrybomb">
        <div class="cherry left"><div class="eye"></div></div>
        <div class="cherry right"><div class="eye"></div></div>
        <div class="stem"></div><div class="stem2"></div>
        <div class="leaf"></div>
      </div>`;
    case 'snowpea':
      return `<div class="plant-snowpea">
        <div class="stem"></div>
        <div class="leaf left"></div><div class="leaf right"></div>
        <div class="head"><div class="eye"></div><div class="mouth"></div></div>
      </div>`;
    case 'chomper':
      return `<div class="plant-chomper">
        <div class="stem"></div>
        <div class="leaf"></div>
        <div class="head">
          <div class="upper-jaw"></div>
          <div class="lower-jaw"></div>
          <div class="eye"></div>
          <div class="teeth-front"><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div><div class="tooth"></div></div>
        </div>
      </div>`;
    case 'repeater':
      return `<div class="plant-repeater">
        <div class="stem"></div>
        <div class="leaf left"></div><div class="leaf right"></div>
        <div class="head-back"></div>
        <div class="head"><div class="eye"></div><div class="mouth"></div></div>
      </div>`;
    case 'gatling':
      return `<div class="plant-gatling">
        <div class="stem"></div>
        <div class="leaf left"></div><div class="leaf right"></div>
        <div class="helmet"></div>
        <div class="head"><div class="eye"></div></div>
        <div class="barrels"><div></div><div></div><div></div><div></div></div>
      </div>`;
    case 'jalapeno':
      return `<div class="plant-jalapeno">
        <div class="stem"></div>
        <div class="body"><div class="eye-l"></div><div class="eye-r"></div><div class="brow-l"></div><div class="brow-r"></div></div>
      </div>`;
    case 'potatomine':
      return `<div class="plant-potatomine">
        <div class="mound"></div>
        <div class="body"><div class="light"></div><div class="eye-l"></div><div class="eye-r"></div></div>
      </div>`;
    case 'torchwood':
      return `<div class="plant-torchwood">
        <div class="flame"></div>
        <div class="trunk"><div class="eye-l"></div><div class="eye-r"></div><div class="mouth"></div></div>
      </div>`;
    case 'spikeweed':
      return `<div class="plant-spikeweed">
        <div class="base"></div>
        <div class="spike s1"></div><div class="spike s2"></div><div class="spike s3"></div><div class="spike s4"></div>
      </div>`;
    case 'tallnut':
      return `<div class="plant-tallnut">
        <div class="body"><div class="eye-l"></div><div class="eye-r"></div><div class="mouth"></div></div>
      </div>`;
    case 'cornpult':
      return `<div class="plant-cornpult">
        <div class="stem"></div>
        <div class="leaf"></div>
        <div class="arm"></div>
        <div class="cob"><div class="eye-l"></div><div class="eye-r"></div></div>
      </div>`;
    case 'watermelon':
      return `<div class="plant-watermelon">
        <div class="stem"></div>
        <div class="leaf"></div>
        <div class="arm"></div>
        <div class="fruit"><div class="eye-l"></div><div class="eye-r"></div></div>
      </div>`;
    case 'randombox':
      return `<div class="plant-randombox">
        <div class="box-body"><div class="box-q">?</div></div>
        <div class="box-lid"></div>
      </div>`;
    case 'cricketbigbox':
      return `<div class="plant-cricketbigbox">
        <div class="box-body"><div class="box-star">★</div></div>
        <div class="box-lid"></div>
        <div class="box-tag">大</div>
      </div>`;
    // ===== 斗蛐蛐专属植物 =====
    case 'magmapea':
      return `<div class="plant-cricket cr-magmapea"><div class="cr-body"><span class="cr-eye l"></span><span class="cr-eye r"></span><span class="cr-mouth"></span></div><div class="cr-stem"></div><div class="cr-sub">熔岩豌豆</div></div>`;
    case 'doublesun':
      return `<div class="plant-cricket cr-doublesun"><div class="cr-body"><div class="cr-sun"><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-sun"><span class="cr-eye l"></span><span class="cr-eye r"></span></div></div><div class="cr-stem"></div><div class="cr-sub">双生葵</div></div>`;
    case 'ironcactus':
      return `<div class="plant-cricket cr-ironcactus"><div class="cr-body"><span class="cr-spike s1"></span><span class="cr-spike s2"></span><span class="cr-spike s3"></span><span class="cr-spike s4"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">钢刺仙人掌</div></div>`;
    case 'thornking':
      return `<div class="plant-cricket cr-thornking"><div class="cr-body"><span class="cr-crown"></span><span class="cr-thorn t1"></span><span class="cr-thorn t2"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">荆棘王</div></div>`;
    case 'frostshroom':
      return `<div class="plant-cricket cr-frostshroom"><div class="cr-body"><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">寒霜菇</div></div>`;
    case 'stormflower':
      return `<div class="plant-cricket cr-stormflower"><div class="cr-body"><span class="cr-bolt"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">雷鸣花</div></div>`;
    case 'poisonvine':
      return `<div class="plant-cricket cr-poisonvine"><div class="cr-body"><span class="cr-drop d1"></span><span class="cr-drop d2"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">剧毒藤</div></div>`;
    case 'lumapot':
      return `<div class="plant-cricket cr-lumapot"><div class="cr-body"><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">光菇</div></div>`;
    case 'iceshard':
      return `<div class="plant-cricket cr-iceshard"><div class="cr-body"><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">冰晶柱</div></div>`;
    case 'venus':
      return `<div class="plant-cricket cr-venus"><div class="cr-body"><span class="cr-jaw"></span><span class="cr-reticle"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">追踪花</div></div>`;
    case 'shieldfern':
      return `<div class="plant-cricket cr-shieldfern"><div class="cr-body"><span class="cr-frond f1"></span><span class="cr-frond f2"></span><span class="cr-shield"></span><span class="cr-eye l"></span><span class="cr-eye r"></span></div><div class="cr-stem"></div><div class="cr-sub">护盾蕨</div></div>`;
    default:
      return `<div class="plant-peashooter"><div class="stem"></div><div class="head"></div></div>`;
  }
}

// ============================================================
// 创建僵尸HTML (CSS 精灵绘制)
// ============================================================
function createZombieHTML(type){
  let cls = 'zombie';
  let acc = '';
  if(type === 'flag'){
    cls += ' flag';
    acc += '<div class="flag-pole"></div><div class="flag-cloth"></div>';
  }else if(type === 'conehead'){
    acc += '<div class="cone"></div>';
  }else if(type === 'buckethead'){
    acc += '<div class="bucket"></div>';
  }else if(type === 'polevaulter'){
    cls += ' polevaulter';
    acc += '<div class="pole"></div>';
  }else if(type === 'newspaper'){
    cls += ' newspaper';
    acc += '<div class="newspaper"></div>';
  }else if(type === 'football'){
    cls += ' football';
    acc += '<div class="football-helmet"></div>';
  }else if(type === 'dancing'){
    cls += ' dancing';
    acc += '<div class="afro"></div><div class="disco-collar"></div>';
  }else if(type === 'imp'){
    cls += ' imp';
  }else if(type === 'giant'){
    cls += ' giant';
    acc += '<div class="giant-club"></div><div class="giant-back-imp"></div>';
  }else if(type === 'blindbox'){
    cls += ' blindbox';
    acc += '<div class="bb-box"><div class="bb-q">?</div></div>';
  }
  return `<div class="${cls}">
    ${acc}
    <div class="head"><div class="eye-l"></div><div class="eye-r"></div><div class="mouth"></div></div>
    <div class="body"></div>
    <div class="arm left"></div><div class="arm right"></div>
    <div class="leg left"></div><div class="leg right"></div>
  </div>`;
}

// ============================================================
// 植物选择
// ============================================================
function selectPlant(type){
  if(!state.gameRunning) return;
  if(!debug.noCd && state.cooldowns[type] > 0) return;
  if(!debug.infSun && state.sun < PLANTS[type].cost) return;

  // 选植物时关闭铲子和手套
  if(state.shovelMode){
    state.shovelMode = false;
    updateShovelUI();
  }
  if(state.gloveMode && state.heldPlant){
    // 取消手持: 植物回原位
    const from = state.heldFrom;
    const p = state.heldPlant;
    state.heldPlant = null;
    state.gloveMode = false;
    if(from) movePlant(p, from.r, from.c);
    updateGloveUI();
  } else if(state.gloveMode){
    state.gloveMode = false;
    updateGloveUI();
  }

  if(state.selectedPlant === type){
    state.selectedPlant = null;
  } else {
    state.selectedPlant = type;
  }
  updateSeedbarUI();
}

function updateSeedbarUI(){
  document.querySelectorAll('.seed-slot').forEach(slot => {
    const type = slot.dataset.plant;
    slot.classList.toggle('selected', state.selectedPlant === type);
    const disabled = (!debug.noCd && state.cooldowns[type] > 0) ||
      (state.gameMode !== 'cricket' && !debug.infSun && state.sun < PLANTS[type].cost);
    slot.classList.toggle('disabled', disabled);
    const cd = slot.querySelector('.cooldown-overlay');
    if(!debug.noCd && state.cooldowns[type] > 0){
      const maxCd = getCooldown(PLANTS[type].cooldown);
      cd.style.height = (state.cooldowns[type] / maxCd * 100) + '%';
    } else {
      cd.style.height = '0%';
    }
  });
}

// ============================================================
// 铲子
// ============================================================
function toggleShovel(){
  if(!state.gameRunning) return;
  if(challengeFlag('noShovel')) return; // 挑战禁用铲子
  // 开铲子时取消手套
  if(state.gloveMode){
    const p = state.heldPlant;
    const from = state.heldFrom;
    state.heldPlant = null;
    state.gloveMode = false;
    if(p && from) movePlant(p, from.r, from.c);
    updateGloveUI();
  }
  state.shovelMode = !state.shovelMode;
  if(state.shovelMode) state.selectedPlant = null;
  document.getElementById('shovel-btn').classList.toggle('active', state.shovelMode);
  updateSeedbarUI();
}

function updateShovelUI(){
  const btn = document.getElementById('shovel-btn');
  if(btn) btn.classList.toggle('active', state.shovelMode);
}

// ============================================================
// 手套 (移动植物)
// ============================================================
const GLOVE_COOLDOWN = 5; // 秒

function toggleGlove(){
  if(!state.gameRunning) return;
  // 冷却中不可用
  if(state.gloveCd > 0) return;
  // 手上有植物时再点手套 = 取消, 植物回到原位
  if(state.heldPlant){
    const p = state.heldPlant;
    const from = state.heldFrom;
    state.heldPlant = null;
    state.gloveMode = false;
    if(from) movePlant(p, from.r, from.c);
    updateGloveUI();
    return;
  }
  state.gloveMode = !state.gloveMode;
  if(state.gloveMode){
    state.selectedPlant = null;
    state.shovelMode = false;
    updateShovelUI();
  }
  updateGloveUI();
  updateSeedbarUI();
}

function updateGloveUI(){
  const btn = document.getElementById('glove-btn');
  if(!btn) return;
  btn.classList.toggle('active', state.gloveMode);
  if(state.gloveCd > 0){
    btn.classList.add('cooldown');
    btn.innerHTML = '<span>🧤</span>冷却 ' + state.gloveCd.toFixed(1) + 's';
  } else {
    btn.classList.remove('cooldown');
    btn.innerHTML = '<span>🧤</span>手套';
  }
}

function updateGloveCooldown(dt){
  if(state.gloveCd > 0){
    state.gloveCd -= dt;
    if(state.gloveCd < 0) state.gloveCd = 0;
    updateGloveUI();
  }
}

function movePlant(plant, r, c){
  if(!plant || plant.dead) return;
  // 从原格移除
  const oldStack = state.grid[plant.row][plant.col];
  const i = oldStack.indexOf(plant);
  if(i >= 0) oldStack.splice(i, 1);
  plant.el.classList.remove('held');
  // 放入新格
  const cells = document.querySelectorAll('.cell');
  cells[r * COLS + c].appendChild(plant.el);
  plant.row = r;
  plant.col = c;
  state.grid[r][c].push(plant);
}

// ============================================================
// 格子交互
// ============================================================
function onCellHover(r, c, enter){
  if(state.gloveMode && enter){
    document.querySelectorAll('.cell').forEach(cl => cl.classList.remove('highlight','shovel-target','glove-target'));
    const cells = document.querySelectorAll('.cell');
    const idx = r * COLS + c;
    if(state.heldPlant){
      // 手持植物: 高亮可放置的空格/原格
      const isOrigin = state.heldPlant.row === r && state.heldPlant.col === c;
      if(state.grid[r][c].length === 0 || debug.stack || isOrigin){
        if(cells[idx]) cells[idx].classList.add('glove-target');
      }
    } else if(state.grid[r][c].length > 0){
      // 待拿起: 高亮有植物的格子
      if(cells[idx]) cells[idx].classList.add('glove-target');
    }
    return;
  }
  if(state.shovelMode && enter && state.grid[r][c] && state.grid[r][c].length > 0){
    document.querySelectorAll('.cell').forEach(cl => cl.classList.remove('highlight','shovel-target','glove-target'));
    const cells = document.querySelectorAll('.cell');
    const idx = r * COLS + c;
    if(cells[idx]) cells[idx].classList.add('shovel-target');
    return;
  }
  if(!state.selectedPlant || !enter) {
    document.querySelectorAll('.cell').forEach(cl => cl.classList.remove('highlight','shovel-target','glove-target'));
    return;
  }
  document.querySelectorAll('.cell').forEach(cl => cl.classList.remove('highlight','shovel-target','glove-target'));
  // 空格子可种; 叠种模式下占用格子也可种
  if(state.grid[r][c].length === 0 || debug.stack){
    const cells = document.querySelectorAll('.cell');
    const idx = r * COLS + c;
    if(cells[idx]) cells[idx].classList.add('highlight');
  }
}

function onCellClick(r, c){
  if(!state.gameRunning) return;

  // 手套模式: 点击拿起/放下植物
  if(state.gloveMode){
    const stack = state.grid[r][c];
    if(state.heldPlant){
      // 放下 (目标格为空/原格/叠种模式)
      const isOrigin = state.heldPlant.row === r && state.heldPlant.col === c;
      if(stack.length === 0 || debug.stack || isOrigin){
        if(!isOrigin){
          movePlant(state.heldPlant, r, c);
        } else {
          state.heldPlant.el.classList.remove('held');
        }
        state.heldPlant = null;
        state.heldFrom = null;
        state.gloveMode = false;
        state.gloveCd = challengeFlag('gloveNoCd') ? 0 : GLOVE_COOLDOWN; // 进入5秒冷却 (挑战可免冷却)
        updateGloveUI();
        document.querySelectorAll('.cell').forEach(cl => cl.classList.remove('glove-target'));
      }
    } else if(stack && stack.length > 0){
      // 拿起该格最上层植物
      state.heldPlant = stack[stack.length - 1];
      state.heldFrom = {r: state.heldPlant.row, c: state.heldPlant.col};
      state.heldPlant.el.classList.add('held');
    }
    return;
  }

  // 优先检查: 是否有可升级植物
  if(!state.shovelMode && !state.selectedPlant){
    const stack = state.grid[r][c];
    if(stack){
      const readyPlant = stack.find(p => p && !p.dead && p.levelReady);
      if(readyPlant){
        openLevelUp(readyPlant);
        return;
      }
    }
  }

  // 铲子模式: 移除该格最上层植物
  if(state.shovelMode){
    const stack = state.grid[r][c];
    if(stack && stack.length > 0){
      const plant = stack[stack.length - 1];
      removePlant(plant, true); // 铲除不计入植物损失
    }
    return;
  }

  // 斗蛐蛐布阵阶段: 点击放置 (不计阳光/冷却)
  if(cricketSetup){
    if(!state.selectedPlant) return;
    handleCricketPlace(r, c);
    return;
  }

  if(!state.selectedPlant) return;
  if(state.grid[r][c].length > 0 && !debug.stack) return;

  const type = state.selectedPlant;
  const cfg = PLANTS[type];
  if(!debug.infSun && state.sun < cfg.cost) return;
  if(!debug.noCd && state.cooldowns[type] > 0) return;

  // 扣阳光
  if(!debug.infSun){
    state.sun -= cfg.cost;
    updateSunDisplay();
  }

  // 冷却 (受升级影响)
  if(!debug.noCd){
    state.cooldowns[type] = getCooldown(cfg.cooldown);
  }

  // 种植 (应用升级加成)
  const upgradedHp = getPlantHp(cfg.hp);
  const plant = {
    type: type,
    row: r,
    col: c,
    name: null,
    hp: upgradedHp,
    maxHp: upgradedHp,
    actionTimer: cfg.actionInterval || 0,
    attackInterval: cfg.actionInterval || 0,
    shots: cfg.shots || 1,
    armed: false,
    armTimer: cfg.armTime || 0,
    el: null,
    digesting: false,
    digestTimer: 0,
    // 食人花专属: 吞噬等级系统
    devourLevel: 0,          // 吞噬等级(每吞噬1个僵尸+1, 受 devourCap 限制)
    devourCap: 10,           // 吞噬等级上限(随斗蛐蛐等级提升: 10→15→20→25→30)
    devourRangeBase: 3,      // 基础攻击距离(格); 实际 = base + devourLevel*0.5
    baseDigest: 12,          // 基础消化时间(秒); 实际 = max(2, base - devourLevel*0.3)
    nitiantBite: false,      // 逆天之咬(1级解锁): 可啃咬巨人
    biteInstakill: 0,        // 逆天之咬秒杀巨人几率(4级=0.05)
    biteInterval: 1.0,       // 逆天之咬攻速(秒/次; 5级=0.5)
    damage: cfg.damage ? getPlantDamage(cfg.damage) : cfg.damage,
    // 经验升级系统
    level: 1,
    xp: 0,
    xpToNext: xpToNextFor(1, type),
    levelReady: false,
    kills: 0,
    statLevels: {},  // statId → level
    skills: {},      // skillId → level (1-based)
    crossSkills: {}, // "sourceType:skillId" → level (跨植物技能)
    crossLevelReady: false, // 自身满级后可学跨植物技能
    crossTimer: 0,   // 跨植物自动升级倒计时(秒)
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'plant-wrapper';
  wrapper.innerHTML = createPlantHTML(type);
  // 添加血量条
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar';
  hpBar.innerHTML = '<div class="hp-fill high"></div>';
  wrapper.appendChild(hpBar);
  // 添加等级显示
  const lvlDiv = document.createElement('div');
  lvlDiv.className = 'plant-level';
  lvlDiv.textContent = 'Lv.1';
  wrapper.appendChild(lvlDiv);
  // 添加经验条
  const xpBar = document.createElement('div');
  xpBar.className = 'xp-bar';
  xpBar.innerHTML = '<div class="xp-fill"></div>';
  wrapper.appendChild(xpBar);
  // 添加吞噬等级徽章 (食人花专属, 红色, 显示于正常等级上方)
  const devDiv = document.createElement('div');
  devDiv.className = 'devour-level';
  devDiv.textContent = '吞0';
  devDiv.style.display = 'none';
  wrapper.appendChild(devDiv);
  plant.el = wrapper;
  updateDevourLevel(plant);

  const cells = document.querySelectorAll('.cell');
  const idx = r * COLS + c;
  cells[idx].appendChild(wrapper);
  state.grid[r][c].push(plant);

  // 取消选择
  state.selectedPlant = null;
  updateSeedbarUI();
}

// ============================================================
// 阳光系统
// ============================================================
function updateSunDisplay(){
  document.getElementById('sun-count').textContent = state.sun;
}

function dropSun(){
  if(!state.gameRunning) return;
  const lawn = document.getElementById('lawn');
  const rect = gRect(lawn);
  const x = Math.random() * (rect.width - 60) + rect.left;
  const targetY = Math.random() * (rect.height - 120) + rect.top + 60;

  createSun(x, rect.top, x, targetY);
}

function createSun(startX, startY, endX, endY){
  const sun = document.createElement('div');
  sun.className = 'sun';
  sun.style.left = startX + 'px';
  sun.style.top = startY + 'px';
  sun.addEventListener('click', () => collectSun(sunObj));

  document.getElementById('game').appendChild(sun);
  const sunObj = {el:sun, x:startX, y:startY, targetY:endY, collected:false, life:8};
  state.suns.push(sunObj);
}

function collectSun(sunObj){
  if(sunObj.collected) return;
  sunObj.collected = true;
  state.sun += (sunObj.value || 25);
  updateSunDisplay();
  // 飞向阳光计数器
  const counter = document.getElementById('sun-counter');
  const rect = gRect(counter);
  sunObj.el.style.transition = 'all .4s ease-in';
  sunObj.el.style.left = rect.left + rect.width/2 - 25 + 'px';
  sunObj.el.style.top = rect.top + rect.height/2 - 25 + 'px';
  sunObj.el.style.transform = 'scale(.3)';
  sunObj.el.style.opacity = '0';
  setTimeout(() => {
    if(sunObj.el.parentNode) sunObj.el.parentNode.removeChild(sunObj.el);
  }, 400);
}

// ============================================================
// 僵尸生成
// ============================================================
function spawnZombie(type, row, forceNormal, xOverride, bigBox){
  let cfg = ZOMBIES[type];
  let zombieType = type;
  let innerType = null;
  let isBigBox = false;
  // 斗蛐蛐模式: 所有僵尸都是盲盒僵尸, 内部强度由随机僵尸类型决定(含巨人: 也裹成盲盒, 击杀盲盒后才会揭示出巨人, 不会从底线直接登场)
  if(state.gameMode === 'cricket' && !forceNormal && type !== 'blindbox'){
    if(type === 'giant'){
      // 巨人: 仍裹成盲盒, 但内部固定为巨人(击杀盲盒揭示真实巨人, 或可被食人花「逆天之咬」撕开)
      innerType = 'giant';
      zombieType = 'blindbox';
      cfg = {
        hp: ZOMBIES.giant.hp,
        speed: ZOMBIES.giant.speed,
        damage: ZOMBIES.giant.damage,
        css: 'blindbox', name: '盲盒僵尸', special: null
      };
    } else {
      const innerPool = ['basic','flag','conehead','polevaulter','buckethead','newspaper','football','dancing','imp'];
      innerType = innerPool[Math.floor(Math.random() * innerPool.length)];
      zombieType = 'blindbox';
      if(bigBox){
        // 大盲盒僵尸: 金红大盒 + ★, 击杀后开出精英僵尸(而非普通随机僵尸)
        isBigBox = true;
        cfg = {
          hp: ZOMBIES[innerType].hp,
          speed: ZOMBIES[innerType].speed,
          damage: ZOMBIES[innerType].damage,
          css: 'blindbox-big', name: '大盲盒僵尸', special: null
        };
      } else {
        cfg = {
          hp: ZOMBIES[innerType].hp,
          speed: ZOMBIES[innerType].speed,
          damage: ZOMBIES[innerType].damage,
          css: 'blindbox', name: '盲盒僵尸', special: null
        };
      }
    }
  }
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const rowHeight = lawnRect.height / ROWS;

  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.width = '78px';
  el.style.height = '120px';
  el.style.zIndex = '150';
  el.innerHTML = createZombieHTML(zombieType);
  // 大盲盒僵尸: 在外层僵尸元素上叠加"金红大盒 + ★"外观, 与普通盲盒区分
  if(isBigBox){
    const zel = el.querySelector('.zombie');
    if(zel){
      zel.classList.add('blindbox-big');
      const q = zel.querySelector('.bb-q');
      if(q) q.textContent = '★';
    }
  }

  // 添加血量条
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar';
  hpBar.innerHTML = '<div class="hp-fill high"></div>';
  el.appendChild(hpBar);

  const zombie = {
    type: zombieType,
    row: row,
    x: (xOverride !== undefined && xOverride !== null) ? xOverride : (lawnRect.width - 10),
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed * (currentLevelConfig && (currentLevelConfig.special === 'fast' || currentLevelConfig.special === 'apocalypse') ? 1.3 : 1),
    damage: cfg.damage,
    slowed: false,
    slowTimer: 0,
    frozen: false,
    frozenTimer: 0,
    chill: 0,
    chillCd: 0,
    chillImmune: 0,
    chillEl: null,
    eating: false,
    eatTarget: null,
    el: el,
    dead: false,
    // 特殊属性
    special: cfg.special || null,
    vaulted: false,          // 撑杆僵尸是否已跳过
    vaulting: false,          // 撑杆僵尸是否正在跳跃中
    angered: false,          // 报纸僵尸是否已愤怒
    summonTimer: 3,          // 跳舞僵尸召唤计时器
    isBlindbox: zombieType === 'blindbox', // 盲盒僵尸: 击杀不获经验, 冒出随机僵尸
    isBigBox: isBigBox,     // 大盲盒僵尸: 击杀后开出精英僵尸(而非普通随机僵尸)
    innerType: innerType,    // 盲盒内部僵尸类型(仅用于显示/调试)
    // 巨人僵尸挥棒状态机
    giantPhase: 'walk',      // walk / windup / strike / recover
    giantTimer: 0,           // 当前阶段剩余时间
    giantThrew: false,       // 半血是否已投掷小鬼(只投一次)
    backImp: zombieType === 'giant', // 半血前背上有小鬼(装饰)
  };

  // 无尽模式: 僵尸逐轮增强
  if(state.gameMode === 'endless' && state.endlessRound > 1){
    const hpMult = 1 + (state.endlessRound - 1) * 0.12;
    const spdMult = 1 + (state.endlessRound - 1) * 0.03;
    zombie.hp = Math.floor(zombie.hp * hpMult);
    zombie.maxHp = zombie.hp;
    zombie.speed *= spdMult;
  }

  // 挑战模式: 僵尸强化倍率
  const chCfg = getChallengeCfg();
  if(chCfg){
    if(chCfg.config.zombieHpMult){
      zombie.hp = Math.floor(zombie.hp * chCfg.config.zombieHpMult);
      zombie.maxHp = zombie.hp;
    }
    if(chCfg.config.zombieSpeedMult){
      zombie.speed *= chCfg.config.zombieSpeedMult;
    }
    // 挑战阶段强化 (阶段Ⅱ/Ⅲ 额外加成)
    const stCfg = CHALLENGE_STAGES[(currentChallengeStage || 1) - 1];
    if(stCfg && stCfg.hpMult !== 1){
      zombie.hp = Math.floor(zombie.hp * stCfg.hpMult);
      zombie.maxHp = zombie.hp;
    }
    if(stCfg && stCfg.speedMult !== 1){
      zombie.speed *= stCfg.speedMult;
    }
  }

  // 斗蛐蛐模式: 僵尸血量增速放缓 + 更平滑
  // - 盲盒僵尸不随全局增长, 始终保持初始血量(内部类型基础 hp)
  // - 其他僵尸: 从 25%(0.25×) 增长, 上限由 1.5× 降至 1.25×, 并用幂曲线(k^1.5)压低早期增速
  if(state.gameMode === 'cricket' && !zombie.isBlindbox){
    const k = CRICKET_SPAWN_RAMP > 0 ? Math.min(1, cricketTimer / CRICKET_SPAWN_RAMP) : 0;
    const hpMult = 0.25 + (1.25 - 0.25) * Math.pow(k, 1.5); // 0.25 -> 1.25, 早期更平缓
    zombie.hp = Math.floor(zombie.hp * hpMult);
    zombie.maxHp = zombie.hp;
  }
  if(state.gameMode === 'cricket'){
    zombie.speed *= 1 + cricketTimer * 0.004; // 速度仍随时间小幅提升(与刷怪节奏一致)
  }

  // 精英染色(泛化): 任意非盲盒真实僵尸均按概率获得颜色变种(默认 5%; 大盲盒开启 100%)
  // 必须在所有 HP/速度倍率计算之后, 让 elite 的 ×4 血量叠加在已计算好的基线上
  if(!zombie.isBlindbox){
    tryMakeElite(zombie, false);
  }

  el.style.left = zombie.x + 'px';
  el.style.top = (row * rowHeight + rowHeight - 120) + 'px';
  lawn.appendChild(el);
  state.zombies.push(zombie);
  return zombie;
}

// ============================================================
// 主游戏循环
// ============================================================
let gameLoopId = 0;

function startGameLoop(){
  gameLoopId++;
  const id = gameLoopId;
  state.lastTime = performance.now();
  requestAnimationFrame(function(ts){ gameLoop(ts, id); });
}

function gameLoop(timestamp, id){
  if(id !== gameLoopId || !state.gameRunning) return;
  const rawDt = Math.min((timestamp - state.lastTime) / 1000, 0.1);
  state.lastTime = timestamp;

  // 飞升时间停止: 冻结世界更新1秒(真实时间), 但保持循环存活
  if(state.ascensionFreeze > 0){
    state.ascensionFreeze = Math.max(0, state.ascensionFreeze - rawDt);
    requestAnimationFrame(function(ts){ gameLoop(ts, id); });
    return;
  }

  // 多步更新: 高速时拆分为多个小步, 避免穿模
  const speed = debug.speed || 1;
  const stepCount = Math.min(Math.max(1, Math.ceil(speed)), 20);
  const stepDt = (rawDt * speed) / stepCount;
  for(let i = 0; i < stepCount && state.gameRunning; i++){
    update(stepDt);
  }

  requestAnimationFrame(function(ts){ gameLoop(ts, id); });
}

function update(dt){
  if(state.gameRunning) state.gameTime += dt;
  // 光标标记全局衰减: 每5秒所有僵尸减少1层
  state.cursorDecayTimer += dt;
  if(state.cursorDecayTimer >= 5){
    state.cursorDecayTimer = 0;
    for(const z of state.zombies){
      if(!z.dead && z.cursorStacks > 0){
        z.cursorStacks = Math.max(0, z.cursorStacks - 1);
        if(z.el){
          const zb = z.el.querySelector('.zombie');
          if(zb){
            if(z.cursorStacks === 0){ zb.classList.remove('has-cursor'); const b = zb.querySelector('.cursor-badge'); if(b) b.remove(); }
            else { const b = zb.querySelector('.cursor-badge'); if(b) b.textContent = '☀×' + z.cursorStacks; }
          }
        }
      }
    }
  }
  updateTeamStats();

  // 手套冷却
  updateGloveCooldown(dt);

  // 阳光冷却
  for(const type in state.cooldowns){
    if(state.cooldowns[type] > 0){
      state.cooldowns[type] -= dt;
      if(state.cooldowns[type] < 0) state.cooldowns[type] = 0;
    }
  }
  updateSeedbarUI();

  // 天降阳光 (受升级和关卡特殊规则影响)
  let sunInterval = getSunDropInterval();
  if(currentLevelConfig && (currentLevelConfig.special === 'dark' || currentLevelConfig.special === 'apocalypse')){
    sunInterval *= 2; // 暗夜关卡阳光掉落减半
  }
  state.sunDropTimer += dt;
  if(state.sunDropTimer >= sunInterval){
    state.sunDropTimer = 0;
    if(!challengeFlag('noSunDrop') && state.gameMode !== 'cricket') dropSun();
  }

  // 阳光下落和消失
  for(let i = state.suns.length - 1; i >= 0; i--){
    const s = state.suns[i];
    if(s.collected) continue;
    if(s.y < s.targetY){
      s.y += 60 * dt;
      s.el.style.top = s.y + 'px';
    }
    s.life -= dt;
    if(s.life <= 0){
      if(s.el.parentNode) s.el.parentNode.removeChild(s.el);
      state.suns.splice(i, 1);
    }
  }

  // 波次系统 / 斗蛐蛐系统
  if(state.gameMode === 'cricket' && !cricketSetup){
    updateCricket(dt);
  } else {
    updateWaves(dt);
  }

  // 植物行动
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      for(const plant of state.grid[r][c]){
        if(!plant || plant.dead) continue;
        updatePlant(plant, dt);
        updatePlantPassives(plant, dt);
      }
    }
  }

  // 僵尸移动
  for(let i = state.zombies.length - 1; i >= 0; i--){
    const z = state.zombies[i];
    if(z.dead) continue;
    updateZombie(z, dt);
  }

  // 更新血量条和经验条
  for(let r=0; r<ROWS; r++){
    for(let c=0; c<COLS; c++){
      for(const plant of state.grid[r][c]){
        if(!plant || plant.dead) continue;
        updateHPBar(plant.el, plant.hp, plant.maxHp);
        updatePlantXPBar(plant);
      }
    }
  }
  for(const z of state.zombies){
    if(z.dead) continue;
    updateHPBar(z.el, z.hp, z.maxHp);
  }

  // 投射物
  for(let i = state.projectiles.length - 1; i >= 0; i--){
    const p = state.projectiles[i];
    updateProjectile(p, dt);
    if(p.dead){
      if(p.el.parentNode) p.el.parentNode.removeChild(p.el);
      state.projectiles.splice(i, 1);
    }
  }

  // 爆炸
  for(let i = state.explosions.length - 1; i >= 0; i--){
    const e = state.explosions[i];
    e.timer -= dt;
    if(e.timer <= 0){
      if(e.el.parentNode) e.el.parentNode.removeChild(e.el);
      state.explosions.splice(i, 1);
    }
  }

  // 割草机
  for(const m of state.lawnmowers){
    if(m.active){
      m.x += 300 * dt;
      m.el.style.left = m.x + 'px';
      // 检查碰撞
      for(const z of state.zombies){
        if(z.dead || z.row !== m.row) continue;
        if(Math.abs(z.x - m.x) < 40){
          z.hp = 0;
          killZombie(z);
        }
      }
      // 出界则隐藏
      const lawnRect = gRect(document.getElementById('lawn'));
      if(m.x > lawnRect.width + 50){
        m.el.style.display = 'none';
        m.active = false;
      }
    }
  }

  // 检查胜利 (斗蛐蛐模式由 updateCricket 自行结算)
  if(state.gameMode !== 'cricket'){
    const waves = currentLevelWaves.length ? currentLevelWaves : WAVES;
    if(state.waveIndex >= waves.length && state.zombies.length === 0 && state.gameRunning){
      if(state.gameMode === 'endless'){
        startEndlessRound(state.endlessRound + 1);
      } else {
        winGame();
      }
    }
  }
}

// ============================================================
// 波次系统
// ============================================================
function updateWaves(dt){
  const waves = currentLevelWaves.length ? currentLevelWaves : WAVES;
  if(state.waveIndex >= waves.length) return;

  // === 发育阶段: 前20秒不生成僵尸 ===
  if(state.graceTimer > 0){
    state.graceTimer -= dt;
    const countEl = document.getElementById('grace-count');
    if(countEl) countEl.textContent = Math.max(0, Math.ceil(state.graceTimer));
    if(state.graceTimer <= 0){
      endGracePeriod();
    }
    // 进度条不动, 也不累积波次计时
    return;
  }

  const wave = waves[state.waveIndex];
  state.waveTimer += dt * debug.spawnMult; // debug: 僵尸生成速度倍率

  // 生成僵尸
  while(state.waveSpawnIndex < wave.zombies.length){
    const spawn = wave.zombies[state.waveSpawnIndex];
    if(state.waveTimer >= spawn.time){
      const row = (spawn.row !== undefined) ? spawn.row : Math.floor(Math.random() * ROWS);
      spawnZombie(spawn.type, row);
      state.waveSpawnIndex++;
    } else {
      break;
    }
  }

  // 检查波次完成
  if(state.waveSpawnIndex >= wave.zombies.length){
    // 等待所有僵尸被消灭
    const aliveZombies = state.zombies.filter(z => !z.dead);
    if(aliveZombies.length === 0){
      state.waveIndex++;
      state.waveTimer = 0;
      state.waveSpawnIndex = 0;
      if(state.waveIndex < waves.length){
        document.getElementById('wave-num').textContent =
          state.gameMode === 'endless' ? state.endlessRound : (state.waveIndex + 1);
        // 奖励阳光 (无尽模式由 startEndlessRound 单独发放)
        if(state.gameMode !== 'endless'){
          state.sun += 50;
          updateSunDisplay();
        }
        // 波次提示
        const isFinal = state.gameMode === 'endless' ? false :
          (state.waveIndex === waves.length - 1);
        showWaveBanner(
          state.gameMode === 'endless' ? state.endlessRound : (state.waveIndex + 1),
          isFinal
        );
      }
    }
  }

  // 更新进度条
  if(state.gameMode === 'endless'){
    // 无尽模式: 显示当前波次进度
    const wp = wave ? (state.waveSpawnIndex / wave.zombies.length) * 100 : 0;
    document.getElementById('progress-fill').style.width = Math.min(wp, 100) + '%';
  } else {
    const totalProgress = (state.waveIndex / waves.length) * 100 +
      (state.waveSpawnIndex / wave.zombies.length) * (100 / waves.length);
    document.getElementById('progress-fill').style.width = Math.min(totalProgress, 100) + '%';
  }
}

// ============================================================
// 植物行为
// ============================================================
function updatePlant(plant, dt){
  const cfg = PLANTS[plant.type];
  if(!plant.dead) plant.aliveTime = (plant.aliveTime || 0) + dt;

  // 坚果墙HP形态变化
  if(plant.type === 'wallnut'){
    const wrapper = plant.el;
    const plantEl = wrapper.querySelector('.plant-wallnut');
    if(plantEl){
      const ratio = plant.hp / plant.maxHp;
      if(ratio > 0.66){
        plantEl.classList.remove('stage2','stage3');
      } else if(ratio > 0.33){
        plantEl.classList.remove('stage3');
        plantEl.classList.add('stage2');
      } else {
        plantEl.classList.remove('stage2');
        plantEl.classList.add('stage3');
      }
    }
  }

  // 食人花消化中
  if(plant.type === 'chomper' && plant.digesting){
    plant.digestTimer -= dt;
    if(plant.digestTimer <= 0){
      // 消化完成
      plant.digesting = false;
      plant.actionTimer = 0.5;
      const plantEl = plant.el.querySelector('.plant-chomper');
      if(plantEl) plantEl.classList.remove('digesting');
      // 显示消化完成提示
      showDigestComplete(plant);
    }
    return; // 消化中不做其他动作
  }

  if(cfg.action === 'none' && !plant.action) return;

  plant.actionTimer -= dt;
  if(plant.actionTimer > 0) return;

  switch(plant.action || cfg.action){
    case 'shoot':
      // 检查同行是否有僵尸
      if(hasZombieInRow(plant.row, plant.col)){
        // 连发 (双发射手2发/机枪射手4发)
        const shots = plant.shots || cfg.shots || 1;
        for(let i = 0; i < shots; i++){
          // 机枪射手(斗蛐蛐): 最后一发固定为元素豆(冰豆/寒火豆)
          const forceEl = (plant.lastShotElement && i === shots - 1) ? plant.lastShotElement : null;
          if(i === 0){
            shootProjectile(plant, forceEl);
          } else {
            const delay = i * 170;
            setTimeout(() => { if(!plant.dead) shootProjectile(plant, forceEl); }, delay);
          }
        }
        // 射击动画
        const plantEl = plant.el.querySelector('.plant-' + plant.type);
        if(plantEl){
          plantEl.classList.add('shooting');
          setTimeout(() => plantEl.classList.remove('shooting'), 250);
        }
        plant.actionTimer = plant.attackInterval != null ? plant.attackInterval : cfg.actionInterval;
        // 新系统植物: 每次攻击减少0.01s攻击间隔(仅豌豆射手无上限, 其它封顶 CRICKET_ATK_SPEED_CAP)
        if(plant.cricketLeveled && plant.atkSpeedReduction != null){
          const _cap = plant.atkSpeedUncapped ? Infinity : CRICKET_ATK_SPEED_CAP;
          plant.atkSpeedReduction = Math.min(_cap, (plant.atkSpeedReduction || 0) + 0.01);
          plant.actionTimer = Math.max(0.2, plant.attackInterval - plant.atkSpeedReduction);
        }
        // 寒冰射手: 每发射两发寒冰豌豆, 同步发射寒冰激光(全行)
        if(plant.iceLaser){
          const _cnt = plant.laserCount || 1;
          for(let _li = 0; _li < _cnt; _li++){
            if(_li === 0) fireIceLaser(plant);
            else setTimeout(() => { if(!plant.dead) fireIceLaser(plant); }, _li * 120);
          }
        }
        // 机枪射手(斗蛐蛐)「火力全开」大招: 每次攻击概率触发
        if(plant.firepower && Math.random() < (plant.ultimateChance || 0)){
          triggerUltimate(plant);
        }
      }
      break;

    case 'cricket_sunflower':
      // 全行动作(全行施加"光标" + "阳光突击")在 updatePlantPassives 中处理; 此处仅占位避免走默认 produce_sun
      plant.actionTimer = 999;
      break;

    case 'produce_sun':
      produceSunFromPlant(plant);
      // 向日葵发光脉冲
      const sunflowerEl = plant.el.querySelector('.plant-sunflower');
      if(sunflowerEl){
        sunflowerEl.classList.add('glowing');
        setTimeout(() => sunflowerEl.classList.remove('glowing'), 800);
      }
      plant.actionTimer = plant.attackInterval != null ? plant.attackInterval : cfg.actionInterval;
      break;

    case 'explode':
      // 樱桃炸弹/火爆辣椒延迟爆炸
      plant.actionTimer = 999;
      const bombEl = plant.el.querySelector('.plant-' + plant.type);
      if(bombEl) bombEl.classList.add('shaking');
      setTimeout(() => {
        if(plant.dead) return;
        if(cfg.rowExplode){
          // 火爆辣椒: 烧毁整行
          explodeRow(plant.row, plant.damage || cfg.damage, plant);
        } else {
          explodeAt(plant.row, plant.col, plant.damage || cfg.damage, cfg.radius, plant);
        }
        removePlant(plant);
      }, cfg.rowExplode ? 600 : 800);
      break;

    case 'arm':
      // 土豆地雷: 埋设时间结束后武装
      if(!plant.armed){
        plant.armTimer -= dt;
        if(plant.armTimer <= 0){
          plant.armed = true;
          const mineEl = plant.el.querySelector('.plant-potatomine');
          if(mineEl) mineEl.classList.add('armed');
        }
      }
      break;

    case 'chomp':
    case 'cricket_chomp': {
      // 食人花吞噬系统: 攻击距离与消化时间随吞噬等级变化
      const dLevel = plant.devourLevel || 0;
      const range = (plant.devourRangeBase || 3) + dLevel * 0.5;
      // 优先选择可吞噬的非巨人僵尸; 巨人需「逆天之咬」才能啃咬(含盲盒包裹的巨人)
      let target = null, giantTarget = null;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        const zCol = getZombieCol(z);
        if(Math.abs(zCol - plant.col) <= range){
          const isG = (z.type === 'giant') || (z.isBlindbox && z.innerType === 'giant');
          if(isG){
            if(!giantTarget) giantTarget = z;
          } else {
            if(!target) target = z;
          }
        }
      }
      // 巨人仅在拥有「逆天之咬」时允许被啃咬; 否则跳过(不吞噬、不进入冷却)
      if(!target && giantTarget && plant.nitiantBite) target = giantTarget;
      if(!target){
        plant.actionTimer = 0.4; // 无目标(或被巨人阻挡且无逆天之咬), 快速重试
        break;
      }
      // 巨人(真实巨人 或 包裹巨人的盲盒): 需「逆天之咬」(1级解锁)才能啃咬
      if((target.type === 'giant') || (target.isBlindbox && target.innerType === 'giant')){
        // 撕开盲盒: 包裹巨人的盲盒直接化为真实巨人, 再由「逆天之咬」啃咬
        let giant = target;
        if(target.isBlindbox){
          const gx = target.x, gr = target.row;
          const idx = state.zombies.indexOf(target);
          if(idx >= 0) state.zombies.splice(idx, 1);
          if(target.el && target.el.parentNode) target.el.parentNode.removeChild(target.el);
          giant = spawnZombie('giant', gr, true, gx); // 真实巨人(forceNormal)
        }
        const biteDmg = dLevel * 10;                 // 每次造成 吞噬等级×10 伤害
        giant.hp -= biteDmg;
        if(plant.biteInstakill && Math.random() < plant.biteInstakill) giant.hp = 0; // 4级: 5%几率秒杀巨人
        if(giant.hp <= 0) killZombie(giant, plant);
        const biteEl = plant.el.querySelector('.plant-chomper');
        if(biteEl){
          biteEl.classList.add('biting');
          setTimeout(() => { if(biteEl) biteEl.classList.remove('biting'); }, 300);
        }
        plant.actionTimer = plant.biteInterval || 1.0; // 攻速: 1秒/次(5级→0.1)
        break;
      }
      // 普通/盲盒僵尸: 秒杀吞噬 (盲盒被吞噬 → 不再开出内部僵尸, 且正常获得经验)
      target.consumedByChomper = true;
      target.hp = 0;
      killZombie(target, plant);
      // 吞噬等级 +1 (仅斗蛐蛐模式: 受上限限制; 普通模式维持原样, 不累积吞噬等级)
      if(plant.cricketLeveled && dLevel < (plant.devourCap || 10)){
        plant.devourLevel = dLevel + 1;
        updateDevourLevel(plant);
      }
      // 咬合 + 消化动画
      const chomperEl = plant.el.querySelector('.plant-chomper');
      const digestTime = Math.max(2, (plant.baseDigest || 12) - plant.devourLevel * 0.3);
      if(chomperEl){
        chomperEl.classList.add('biting');
        setTimeout(() => { if(chomperEl) chomperEl.classList.remove('biting'); }, 400);
        plant.digesting = true;
        plant.digestTimer = digestTime;
        setTimeout(() => {
          if(!plant.dead && plant.digesting){ chomperEl.classList.add('digesting'); }
        }, 400);
        plant.actionTimer = 999; // 消化期间不能行动
      } else {
        plant.digesting = true;
        plant.digestTimer = digestTime;
        plant.actionTimer = 999;
      }
      break;
    }

    case 'lob':
      // 投掷类植物: 玉米投手/西瓜投手, 找到同行最靠左的僵尸投掷
      if(hasZombieInRow(plant.row, plant.col)){
        const throwCount = plant.throwCount || 1;
        for(let t = 0; t < throwCount; t++){
          lobProjectile(plant);
        }
        const lobEl = plant.el.querySelector('.plant-' + plant.type);
        if(lobEl){
          lobEl.classList.add('shooting');
          setTimeout(() => lobEl.classList.remove('shooting'), 300);
        }
        plant.actionTimer = plant.attackInterval != null ? plant.attackInterval : cfg.actionInterval;
      }
      break;

    case 'spike':
      // 地刺: 持续伤害踩在它及相邻格上的僵尸 (damage 表示每次攻击伤害)
      let spikeHit = false;
      // 范围检查: 基础覆盖自身格 + 相邻1格(即可攻击到正在啃食身后植物的僵尸); rangeBonus 技能再向外扩展
      const spikeRange = 1 + (plant.rangeBonus || 0);
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        const zCol = getZombieCol(z);
        if(Math.abs(zCol - plant.col) <= spikeRange){
          let dmg = plant.damage || cfg.damage;
          if(plant.armorPierce) dmg *= (1 + plant.armorPierce);
          dealDamage(plant, z, dmg);
          spikeHit = true;
          if(z.hp <= 0) killZombie(z, plant);
        }
      }
      // 飞针技能: 每次攻击额外向本行最前方僵尸射出穿透飞针
      if(plant.quillDmg){
        let front = null;
        for(const z of state.zombies){
          if(z.dead || z.row !== plant.row) continue;
          if(!front || z.x < front.x) front = z;
        }
        if(front){
          let qd = plant.quillDmg;
          if(plant.armorPierce) qd *= (1 + plant.armorPierce);
          dealDamage(plant, front, qd);
        }
      }
      if(spikeHit){
        const spEl = plant.el.querySelector('.plant-spikeweed');
        if(spEl){
          spEl.classList.add('shooting');
          setTimeout(() => spEl.classList.remove('shooting'), 200);
        }
      }
      plant.actionTimer = plant.attackInterval != null ? plant.attackInterval : cfg.actionInterval;
      break;

    // ===== 斗蛐蛐模式专用: 非攻击/一次性植物改造为持续战斗单位 =====
    case 'cricket_thorns':
      // 坚果墙/高坚果: 对啃食自己的僵尸持续反伤
      {
        const dmg = (plant.damage || 50) * (plant.attackInterval || 0.5);
        let hit = false;
        for(const z of state.zombies){
          if(z.dead || z.row !== plant.row) continue;
          const zCol = getZombieCol(z);
          if(Math.abs(zCol - plant.col) <= 0.8){
            dealDamage(plant, z, dmg);
            if(z.hp <= 0) killZombie(z, plant);
            hit = true;
          }
        }
        if(hit){
          const el = plant.el.querySelector('.plant-' + plant.type);
          if(el){ el.classList.add('thorns'); setTimeout(() => el.classList.remove('thorns'), 150); }
        }
      }
      plant.actionTimer = plant.attackInterval || 0.5;
      break;

    case 'cricket_aura':
      // 火炬树桩: 周围一格火焰光环
      {
        const dmg = (plant.damage || 35) * (plant.attackInterval || 0.6);
        let hit = false;
        for(const z of state.zombies){
          if(z.dead) continue;
          if(Math.abs(z.row - plant.row) > 1) continue;
          const zCol = getZombieCol(z);
          if(Math.abs(zCol - plant.col) <= 1){
            dealDamage(plant, z, dmg);
            if(z.hp <= 0) killZombie(z, plant);
            hit = true;
          }
        }
        if(hit){
          const el = plant.el.querySelector('.plant-torchwood');
          if(el){ el.classList.add('flaming'); setTimeout(() => el.classList.remove('flaming'), 200); }
        }
      }
      plant.actionTimer = plant.attackInterval || 0.6;
      break;

    case 'cricket_pulse':
      // 樱桃炸弹: 持续范围爆炸 (不再一次性)
      if(plant.el && plant.el.parentNode){
        explodeAt(plant.row, plant.col, plant.damage || 130, 1.2, plant);
      }
      plant.actionTimer = plant.attackInterval || 1.0;
      break;

    case 'cricket_rowfire':
      // 火爆辣椒: 持续灼烧整行 (不再一次性)
      if(plant.el && plant.el.parentNode){
        explodeRow(plant.row, plant.damage || 70, plant);
      }
      plant.actionTimer = plant.attackInterval || 0.5;
      break;

    case 'cricket_minelayer':
      // 土豆地雷(斗蛐蛐): 每 attackInterval 秒向本行最前僵尸投下爆弹(1格AOE), 死亡时秒杀周围1格
      {
        const rowZ = state.zombies.filter(z => !z.dead && z.row === plant.row).sort((a,b)=>a.x-b.x);
        if(rowZ.length){
          dropPotatoBomb(plant, plant.row, plant.bombDamage || 200); // 从本体向前飞行, 碰到僵尸才爆炸
          const el = plant.el.querySelector('.plant-potatomine');
          if(el){ el.classList.add('shooting'); setTimeout(() => { if(el) el.classList.remove('shooting'); }, 200); }
        }
      }
      plant.actionTimer = plant.attackInterval || 10;
      break;

    // ===== 斗蛐蛐专属植物动作 =====
    case 'cricket_chain': {
      const targets = [];
      for(const z of state.zombies){
        if(z.dead) continue;
        if(Math.abs(z.row - plant.row) > 1) continue;
        const zCol = getZombieCol(z);
        if(Math.abs(zCol - plant.col) <= 5) targets.push(z);
      }
      targets.sort((a, b) => Math.abs(getZombieCol(a) - plant.col) - Math.abs(getZombieCol(b) - plant.col));
      const n = Math.min(plant.chainCount || 3, targets.length);
      for(let i = 0; i < n; i++){
        const z = targets[i];
        const zx = z.x, zr = z.row;
        dealDamage(plant, z, (plant.damage || 30));
        if(plant.chainChill) applyChill(z, plant);
        if(z.hp <= 0) killZombie(z, plant);
        spawnBeamFx(plant, zx, zr, false);
      }
      const el = plant.el.querySelector('.plant-cricket');
      if(el){ el.classList.add('shooting'); setTimeout(() => el.classList.remove('shooting'), 200); }
      plant.actionTimer = plant.attackInterval || 1.4;
      break;
    }
    case 'cricket_poison': {
      const dmg = (plant.damage || 6) * (plant.attackInterval || 0.5);
      let hit = false;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        const zCol = getZombieCol(z);
        if(Math.abs(zCol - plant.col) <= (plant.poisonRange || 0.9)){
          dealDamage(plant, z, dmg);
          z.poison = { dps: plant.poisonDps || 15, t: plant.poisonTime || 3, owner: plant };
          if(plant.poisonChill) applyChill(z, plant);
          if(z.hp <= 0) killZombie(z, plant);
          hit = true;
        }
      }
      if(hit){
        const el = plant.el.querySelector('.plant-cricket');
        if(el){ el.classList.add('poisoning'); setTimeout(() => el.classList.remove('poisoning'), 200); }
      }
      plant.actionTimer = plant.attackInterval || 0.5;
      break;
    }
    case 'cricket_heal': {
      const amt = plant.healAmount || 20;
      let healed = 0;
      for(let r = plant.row - 1; r <= plant.row + 1; r++){
        if(r < 0 || r >= ROWS) continue;
        for(let c = plant.col - 1; c <= plant.col + 1; c++){
          if(c < 0 || c >= COLS) continue;
          for(const p of (state.grid[r][c] || [])){
          if(p && !p.dead && p !== plant && p.hp < p.maxHp){
            p.hp = Math.min(p.maxHp, p.hp + amt);
            updateHPBar(p.el, p.hp, p.maxHp);
            if(plant.healDR) p.dr = plant.healDR;
            healed++;
          }
          }
        }
      }
      if(healed > 0) awardXP(plant, healed); // 治疗支援经验
      const el = plant.el.querySelector('.plant-cricket');
      if(el){ el.classList.add('healing'); setTimeout(() => el.classList.remove('healing'), 300); }
      plant.actionTimer = plant.attackInterval || 1.5;
      break;
    }
    case 'cricket_slowfield': {
      // 冰晶柱(斗蛐蛐): 在前面5格内创造减速空间, 持续对范围内僵尸施加减速
      const lawn = document.getElementById('lawn');
      const lr = gRect(lawn);
      const colW = (lr.width - 160) / COLS, rowH = lr.height / ROWS;
      const plantX = 160 + plant.col * colW + colW / 2;
      const range = (plant.slowRange || 5) * colW; // 前面5格
      const slowMult = plant.slowMult || 0.5;
      // 减速力场视觉 (首次创建)
      if(!plant.zoneEl){
        const zEl = document.createElement('div');
        zEl.className = 'slow-zone';
        zEl.style.left = (plantX - colW * 0.5) + 'px';
        zEl.style.top = (plant.row * rowH) + 'px';
        zEl.style.width = (range + colW) + 'px';
        zEl.style.height = rowH + 'px';
        lawn.appendChild(zEl);
        plant.zoneEl = zEl;
      }
      let affected = 0;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        // 前面 = 朝入口方向 (x 更大), 且在5格范围内
        if(z.x >= plantX - colW * 0.5 && z.x <= plantX + range){
          applySlowToZombie(z, slowMult, 0.8, plant);
          if(plant.fieldChillBonus) applyChill(z, plant, true); // 暴雪: 额外叠加寒意
          affected++;
        }
      }
      if(affected > 0){
        // 冰晶柱无直接伤害, 靠减速/寒意支援积累经验以升级
        awardXP(plant, affected);
        const el = plant.el.querySelector('.plant-cricket');
        if(el){ el.classList.add('freezing'); setTimeout(() => el.classList.remove('freezing'), 300); }
      }
      plant.actionTimer = plant.attackInterval || 1.5;
      break;
    }
    case 'cricket_snipe': {
      const targets = [];
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        const zCol = getZombieCol(z);
        if(Math.abs(zCol - plant.col) <= (plant.range || 3)) targets.push(z);
      }
      if(targets.length){
        targets.sort((a,b)=> Math.abs(getZombieCol(a)-plant.col) - Math.abs(getZombieCol(b)-plant.col));
        const n = Math.min(plant.snipePierce || 1, targets.length);
        for(let i=0;i<n;i++){
          const target = targets[i];
          dealDamage(plant, target, (plant.damage || 120));
          spawnBeamFx(plant, target.x, target.row, true);
          if(target.hp <= 0) killZombie(target, plant);
        }
      }
      const el = plant.el.querySelector('.plant-cricket');
      if(el){ el.classList.add('shooting'); setTimeout(() => el.classList.remove('shooting'), 200); }
      plant.actionTimer = plant.attackInterval || 2.0;
      break;
    }
    case 'cricket_shield': {
      const dr = plant.shieldDR || 0.4;
      let shielded = 0;
      for(let r = plant.row - 1; r <= plant.row + 1; r++){
        if(r < 0 || r >= ROWS) continue;
        for(let c = plant.col - 1; c <= plant.col + 1; c++){
          if(c < 0 || c >= COLS) continue;
          for(const p of (state.grid[r][c] || [])){
            if(p && !p.dead && p !== plant){ p.dr = dr; if(plant.shieldReflect) p.reflect = plant.shieldReflect; shielded++; }
          }
        }
      }
      if(shielded > 0) awardXP(plant, shielded); // 护盾支援经验
      const el = plant.el.querySelector('.plant-cricket');
      if(el){ el.classList.add('shielding'); setTimeout(() => el.classList.remove('shielding'), 300); }
      plant.actionTimer = plant.attackInterval || 2.0;
      break;
    }
  }
}

// 连锁/狙击光束视觉
function spawnBeamFx(plant, targetX, targetRow, snipe){
  try{
    const lawn = document.getElementById('lawn');
    const pr = gRect(lawn);
    const colW = (pr.width - 160) / COLS, rowH = pr.height / ROWS;
    const x1 = 160 + plant.col * colW + colW / 2;
    const y1 = plant.row * rowH + rowH / 2;
    const x2 = targetX;
    const y2 = targetRow * rowH + rowH / 2;
    const el = document.createElement('div');
    el.className = 'cr-beam' + (snipe ? ' snipe' : '');
    el.style.left = Math.min(x1, x2) + 'px';
    el.style.top = ((y1 + y2) / 2) + 'px';
    el.style.width = Math.max(2, Math.abs(x2 - x1)) + 'px';
    lawn.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.parentNode.removeChild(el); }, 260);
  }catch(e){}
}

// 伤害浮动数字
function spawnDamageNumber(x, y, dmg, cls){
  try{
    const lawn = document.getElementById('lawn');
    if(!lawn) return;
    const el = document.createElement('div');
    el.className = 'dmg-num' + (cls ? ' ' + cls : '');
    el.textContent = (dmg >= 10 ? Math.round(dmg) : (Math.round(dmg * 10) / 10));
    el.style.left = (x + (Math.random() * 20 - 10)) + 'px';
    el.style.top = y + 'px';
    lawn.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.parentNode.removeChild(el); }, 850);
  }catch(e){}
}

// ============================================================
// 寒意(chill)机制 — 减速叠加寒意层数, 3层冰冻, 火焰清空
// ============================================================
const CHILL_FREEZE_TIME = 5;   // 寒意冰冻持续时间(秒)
const CHILL_STACK_CD    = 0.7; // 同一僵尸叠加寒意的冷却(秒), 防止被连续减速瞬间叠满
const CHILL_BREAK_DMG   = 50;  // 破冰伤害(冰冻解除时施加)
const CHILL_FREEZE_IMMUNE = 3.0; // 解冻后寒意免疫时长(秒): 期间不再叠加寒意

// 给僵尸叠加1层寒意(force 可无视冷却, 用于暴雪等强化)
function applyChill(z, plant, force){
  if(!z || z.dead) return;
  if(z.chillImmune > 0) return; // 解冻后免疫期内不受任何寒意影响(含暴雪等强制来源)
  if(!force && z.chillCd > 0) return; // 节流
  z.chillCd = CHILL_STACK_CD;
  z.chill = (z.chill || 0) + 1;
  updateChillVisual(z);
  if(z.chill >= 3){
    if(!z.frozen){
      // 达到3层 → 冰冻在原地
      z.frozen = true;
      z.frozenTimer = CHILL_FREEZE_TIME;
      const zEl = z.el && z.el.querySelector('.zombie');
      if(zEl) zEl.classList.add('frozen');
    } else {
      // 冰冻时再次叠加寒意 → 造成10倍寒意层数伤害
      const dmg = 10 * z.chill;
      dealDamage(plant, z, dmg);
      spawnDamageNumber(z.x, (z.el ? z.el.offsetTop : 0) + 12, dmg, 'chill');
      if(z.hp <= 0) killZombie(z, plant); // 寒意击杀(盲盒僵尸会在此冒出真实僵尸)
    }
  }
}

// 刷新寒意层数显示(❄ 图标), 并在僵尸身上叠加霜冻视觉
function updateChillVisual(z){
  if(!z.el) return;
  if(!z.chillEl){
    const el = document.createElement('div');
    el.className = 'chill-pips';
    z.el.appendChild(el);
    z.chillEl = el;
  }
  z.chillEl.textContent = z.chill > 0 ? '❄'.repeat(Math.min(z.chill, 6)) : '';
  const zEl = z.el.querySelector('.zombie');
  if(zEl){
    if(z.chill >= 1) zEl.classList.add('chilled'); else zEl.classList.remove('chilled');
  }
}

// 统一减速入口: 设置减速 + 叠加寒意(所有减速来源都走这里)
function applySlowToZombie(z, mult, dur, plant){
  if(!z || z.dead) return;
  z.slowed = true;
  z.slowMult = mult;
  z.slowTimer = Math.max(z.slowTimer || 0, dur);
  const ze = z.el && z.el.querySelector('.zombie');
  if(ze && !ze.classList.contains('slowed')) ze.classList.add('slowed');
  applyChill(z, plant);
}

// 盲盒僵尸开出的真实僵尸继承盲盒的所有状态效果(寒意/冰冻/减速/光标等)
function inheritBlindboxEffects(src, dst){
  if(!src || !dst || dst.dead) return;
  // 寒意层数
  dst.chill = src.chill || 0;
  dst.chillCd = src.chillCd || 0;
  dst.chillImmune = src.chillImmune || 0;
  updateChillVisual(dst);
  // 冰冻
  if(src.frozen){
    dst.frozen = true;
    dst.frozenTimer = src.frozenTimer || 0;
    const zEl = dst.el && dst.el.querySelector('.zombie');
    if(zEl) zEl.classList.add('frozen');
  }
  // 减速
  if(src.slowed){
    dst.slowed = true;
    dst.slowMult = src.slowMult;
    dst.slowTimer = src.slowTimer || 0;
    const zEl = dst.el && dst.el.querySelector('.zombie');
    if(zEl) zEl.classList.add('slowed');
  }
  // 光标(聚光)层数
  if(src.cursorStacks){
    dst.cursorStacks = 0;
    addCursor(dst, src.cursorStacks);
  }
}

// 火焰子弹命中: 清空寒意僵尸的寒意层数, 并造成 寒意层数×10 的 AOE 伤害(带特效)
function fireClearChill(centerZ, owner){
  try{
    const lawn = document.getElementById('lawn');
    const lr = gRect(lawn);
    const colW = (lr.width - 160) / COLS;
    const radius = colW * 1.5;
    const targets = [];
    for(const z of state.zombies){
      if(z.dead) continue;
      if(z === centerZ){ if(z.chill > 0) targets.push(z); }
      else if(z.chill > 0 && Math.abs(z.x - centerZ.x) < radius && Math.abs(z.row - centerZ.row) <= 1) targets.push(z);
    }
    for(const z of targets){
      const aoe = 10 * z.chill;
      dealDamage(owner, z, aoe);
      spawnChillFireBurst(z);
      z.chill = 0;
      if(z.chillEl) z.chillEl.textContent = '';
      const zEl = z.el.querySelector('.zombie');
      if(zEl){
        zEl.classList.remove('chilled');
        if(z.frozen){ z.frozen = false; z.frozenTimer = 0; zEl.classList.remove('frozen'); z.chillImmune = CHILL_FREEZE_IMMUNE; }
      }
      if(z.hp <= 0) killZombie(z, owner); // 火焰寒意击杀(盲盒僵尸在此冒出真实僵尸)
    }
  }catch(e){}
}

// 寒冰射手「寒冰激光」: 对全行僵尸减速 + 伤害 + (可选)寒意
function fireIceLaser(plant){
  const row = plant.row;
  const dmg = plant.laserDamage || 20;
  const slowMult = plant.laserSlowMult || 0.5;
  const slowDur = plant.laserSlowDur || 3;
  const chillLayers = plant.laserChill || 0;
  for(const z of state.zombies){
    if(z.dead || z.row !== row) continue;
    // 减速 (全行)
    z.slowed = true;
    z.slowMult = slowMult;
    z.slowTimer = Math.max(z.slowTimer || 0, slowDur);
    const ze = z.el && z.el.querySelector('.zombie');
    if(ze && !ze.classList.contains('slowed')) ze.classList.add('slowed');
    // 伤害
    dealDamage(plant, z, dmg);
    // 击杀判定: 寒冰激光造成的伤害足以击杀时, 正常结算死亡(盲盒僵尸也会在此冒出内部僵尸)
    if(z.hp <= 0) killZombie(z, plant);
    // 寒意 (4级施加2层)
    if(chillLayers > 0) addChillStacks(z, chillLayers, plant);
    // 命中闪烁
    if(ze){
      ze.classList.add('damaged');
      setTimeout(() => { if(ze && ze.parentNode) ze.classList.remove('damaged'); }, 150);
    }
  }
  spawnIceLaserBeam(plant, row);
}

// 叠加寒意层数(不触发冰冻, 仅用于显示与火焰清寒意 AOE)
function addChillStacks(z, n, plant){
  if(!z || z.dead || z.chillImmune > 0) return;
  z.chill = (z.chill || 0) + n;
  updateChillVisual(z);
}

// 寒冰激光束横扫特效 (从寒冰射手"当前真实位置"向右延伸至草坪边缘)
function spawnIceLaserBeam(plant, row){
  try{
    const lawn = document.getElementById('lawn');
    if(!lawn) return;
    const beam = document.createElement('div');
    beam.className = 'ice-laser-beam';
    const lawnRect = lawn.getBoundingClientRect();
    const rowHeight = lawnRect.height / ROWS;
    // 激光纵向对齐该行僵尸的几何中心(僵尸脚对齐行底、高120, 中心 = 行底 - 60),
    // 不再依赖 plant.el 的垂直中心, 避免植物 wrapper 在格子内定位导致光束上下偏移
    const top = row * rowHeight + rowHeight - 60;
    let startX;
    if(plant.el){
      const pr = plant.el.getBoundingClientRect();
      startX = (pr.left + pr.width * 0.5) - lawnRect.left;   // 寒冰射手中心 X (水平方向仍取植物真实位置)
    } else {
      startX = 0;
    }
    const lawnW = lawn.offsetWidth || 900;
    beam.style.top = top + 'px';
    beam.style.left = startX + 'px';
    beam.style.width = Math.max(0, lawnW - startX) + 'px';
    lawn.appendChild(beam);
    setTimeout(() => { if(beam.parentNode) beam.parentNode.removeChild(beam); }, 320);
  }catch(e){}
}

// 破冰碎裂特效(冰冻解除时)
function spawnChillShatter(z){
  try{
    const lawn = document.getElementById('lawn');
    const el = document.createElement('div');
    el.className = 'chill-shatter';
    el.style.left = z.x + 'px';
    el.style.top = (z.el.offsetTop + 20) + 'px';
    lawn.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.parentNode.removeChild(el); }, 500);
  }catch(e){}
}

// 火焰清寒意爆发特效
function spawnChillFireBurst(z){
  try{
    const lawn = document.getElementById('lawn');
    const el = document.createElement('div');
    el.className = 'chill-fire';
    el.style.left = z.x + 'px';
    el.style.top = (z.el.offsetTop + 20) + 'px';
    lawn.appendChild(el);
    setTimeout(() => { if(el.parentNode) el.parentNode.removeChild(el); }, 500);
  }catch(e){}
}

// 统一伤害入口: 扣血 + 统计(植物/队伍) + 浮动数字
// 斗蛐蛐: "光标"标记 — 每层使僵尸受到的伤害+25%, 每5秒全局减少1层
function addCursor(z, n){
  if(!z || z.dead) return;
  z.cursorStacks = Math.min(10, (z.cursorStacks || 0) + n);
  if(z.el){
    const zb = z.el.querySelector('.zombie');
    if(zb){
      zb.classList.add('has-cursor');
      let badge = zb.querySelector('.cursor-badge');
      if(!badge){
        badge = document.createElement('div');
        badge.className = 'cursor-badge';
        zb.appendChild(badge);
      }
      badge.textContent = '☀×' + z.cursorStacks;
    }
  }
}

function dealDamage(plant, z, dmg, opts){
  if(!z || z.dead) return;
  dmg = dmg || 0;
  // 光标标记: 每层使受到的伤害增加25%
  if(z.cursorStacks > 0) dmg = dmg * (1 + 0.25 * z.cursorStacks);
  z.hp -= dmg;
  if(z.row != null && state.teamDamage){
    state.teamDamage[z.row] = (state.teamDamage[z.row] || 0) + dmg;
  }
  if(plant && !plant.dead){
    plant.dmgDealt = (plant.dmgDealt || 0) + dmg;
  }
  const y = (z.el ? z.el.offsetTop : 0) + 12;
  spawnDamageNumber(z.x != null ? z.x : 0, y, Math.round(dmg), opts && opts.crit ? 'crit' : (opts && opts.heal ? 'heal' : ''));
}

// 小推车处显示每支队伍(每行)的总体DPS与总伤害
function updateTeamStats(){
  try{
    for(const m of state.lawnmowers){
      if(m.slot !== 0 || !m.statEl) continue;
      const r = m.row;
      const total = state.teamDamage[r] || 0;
      const t = state.gameTime || 0;
      const dps = t > 0 ? (total / t) : 0;
      m.statEl.textContent = 'DPS ' + (dps >= 10 ? Math.round(dps) : (Math.round(dps * 10) / 10)) + '  总伤 ' + Math.round(total);
    }
  }catch(e){}
}

// 显示消化完成浮动文字
function showDigestComplete(plant){
  const text = document.createElement('div');
  text.className = 'digest-complete-text';
  text.textContent = '消化完成！';
  plant.el.appendChild(text);
  setTimeout(() => {
    if(text.parentNode) text.parentNode.removeChild(text);
  }, 1500);
}

// 更新血量条
function updateHPBar(el, hp, maxHp){
  const bar = el.querySelector('.hp-bar');
  if(!bar) return;
  const fill = bar.querySelector('.hp-fill');
  if(!fill) return;
  const pct = Math.max(0, hp / maxHp);
  fill.style.width = (pct * 100) + '%';
  fill.className = 'hp-fill ' + (pct > 0.6 ? 'high' : pct > 0.3 ? 'mid' : 'low');
  // 满血时隐藏
  bar.style.opacity = pct >= 1 ? '0' : '1';
}

function hasZombieInRow(row, fromCol){
  for(const z of state.zombies){
    if(z.dead || z.row !== row) continue;
    const zCol = getZombieCol(z);
    if(zCol >= fromCol) return true;
  }
  return false;
}

function getZombieCol(z){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const x = z.x;
  return Math.floor((x - 160) / colWidth);
}

function getZombieCellX(z){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  return z.x;
}

function shootProjectile(plant, forceEl){
  const cfg = PLANTS[plant.type];
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const rowHeight = lawnRect.height / ROWS;

  const x = 160 + plant.col * colWidth + colWidth * 0.7;
  const y = plant.row * rowHeight + rowHeight * 0.3;

  const el = document.createElement('div');
  el.className = 'projectile ' + (plant.projectile || cfg.projectile);

  // 子弹大小随攻击力缩放（以该植物基础伤害为1x基准）
  const baseDmg = cfg.damage || 20;
  let dmg = plant.damage != null ? plant.damage : baseDmg;
  // 子弹减速状态(默认): 寒冰射手等标记 slow
  let pjSlow = (plant.slow || cfg.slow || false);
  // 燃烧弹技能: 豌豆起始即为火焰弹 (伤害按fireMult倍率)
  let preFired = false;
  if(plant.alwaysFire){
    preFired = true;
    pjSlow = false;
    const fireMult = plant.fireMult || 2;
    dmg *= fireMult;
    el.classList.remove('pea','snow');
    el.classList.add('fire');
    const fSize = Math.round(14 * 1.35 * Math.min(4, Math.max(0.6, Math.sqrt(dmg / baseDmg))));
    el.style.width = fSize + 'px';
    el.style.height = fSize + 'px';
    el.style.marginLeft = ((14 - fSize) / 2) + 'px';
    el.style.marginTop = ((14 - fSize) / 2) + 'px';
  } else {
    const scale = Math.min(4, Math.max(0.6, Math.sqrt(dmg / baseDmg)));
    const size = Math.round(14 * scale);
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.marginLeft = ((14 - size) / 2) + 'px';
    el.style.marginTop = ((14 - size) / 2) + 'px';
  }

  // 斗蛐蛐双发射手「元素大师」: 概率将豌豆变为元素豆(火豆/冰豆/寒火豆/炎豆)
  if(plant.elementMaster && Math.random() < plant.elementChance){
    const et = plant.elementTypes || 3;
    const roll = Math.floor(Math.random() * et);
    if(roll === 0){
      // 火豆: 伤害×2, 清寒意, 不减速
      dmg *= 2; preFired = true; pjSlow = false;
      el.classList.remove('pea','snow'); el.classList.add('fire');
      const fSize = Math.round(14 * 1.35);
      el.style.width = el.style.height = fSize + 'px';
      el.style.marginLeft = el.style.marginTop = ((14 - fSize) / 2) + 'px';
    } else if(roll === 1){
      // 冰豆: 减速, 伤害不变 (蓝色)
      pjSlow = true;
      el.classList.remove('pea','snow'); el.classList.add('snow');
    } else if(roll === 2){
      // 寒火豆: 伤害×2 + 减速 + 清寒意
      dmg *= 2; preFired = true; pjSlow = true;
      el.classList.remove('pea','snow'); el.classList.add('frostfire');
      const fSize = Math.round(14 * 1.35);
      el.style.width = el.style.height = fSize + 'px';
      el.style.marginLeft = el.style.marginTop = ((14 - fSize) / 2) + 'px';
    } else if(roll === 3){
      // 炎豆: 伤害×4, 清寒意, 不减速 (4级解锁; 红色)
      dmg *= 4; preFired = true; pjSlow = false;
      el.classList.remove('pea','snow'); el.classList.add('flame');
      const fSize = Math.round(14 * 1.35);
      el.style.width = el.style.height = fSize + 'px';
      el.style.marginLeft = el.style.marginTop = ((14 - fSize) / 2) + 'px';
    }
  }

  // 强制元素豆(机枪射手: 第4发固定为冰豆/寒火豆; 火力全开大招部分豌豆为寒火豆)
  if(forceEl === 'snow'){
    // 冰豆: 减速, 伤害不变
    pjSlow = true;
    el.classList.remove('pea','snow'); el.classList.add('snow');
  } else if(forceEl === 'frostfire'){
    // 寒火豆: 伤害×2 + 减速 + 清寒意
    dmg *= 2; preFired = true; pjSlow = true;
    el.classList.remove('pea','snow'); el.classList.add('frostfire');
    const fSize = Math.round(14 * 1.35);
    el.style.width = el.style.height = fSize + 'px';
    el.style.marginLeft = el.style.marginTop = ((14 - fSize) / 2) + 'px';
  }

  el.style.left = x + 'px';
  el.style.top = y + 'px';
  lawn.appendChild(el);

  state.projectiles.push({
    el: el,
    x: x,
    y: y,
    row: plant.row,
    speed: plant.bulletSpeed || 350,
    damage: dmg,
    slow: pjSlow,
    fired: preFired,
    dead: false,
    owner: plant,
    pierce: plant.pierce || 0,
    hitSet: new Set(),
    freezeShot: preFired ? false : (plant.freezeShot || false),
    freezeDuration: plant.freezeDuration || 1,
  });
}

// 斗蛐蛐机枪射手「火力全开」大招: 持续3秒倾泻大量豌豆(部分寒火豆), 触发后概率永久提升(上限15%)
function triggerUltimate(plant){
  const total = plant.ultimateCount || 80;
  const frost = plant.ultimateFrost || 20;
  const duration = 3000;
  // 均匀散布寒火豆位置
  const frostSet = new Set();
  if(total > 0 && frost > 0){
    for(let k = 0; k < frost; k++){
      frostSet.add(Math.floor(k * total / frost));
    }
  }
  for(let k = 0; k < total; k++){
    const t = duration * (k / Math.max(1, total - 1));
    setTimeout(() => {
      if(plant.dead) return;
      shootProjectile(plant, frostSet.has(k) ? 'frostfire' : null);
    }, t);
  }
  // 4级+: 每次释放大招, 大招概率永久 +2%(上限15%)
  if(plant.ultimateScales){
    plant.ultimateChance = Math.min(plant.ultimateChanceCap || 0.15, (plant.ultimateChance || 0) + (plant.ultimateChanceStep || 0.02));
  }
  cricketFloat(plant, '🔥 火力全开!');
}

// 斗蛐蛐向日葵「阳光突击」: 向前发射阳光子弹, 命中僵尸施加1层"光标"(不直接造成伤害)
function fireSunAssault(plant){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const rowHeight = lawnRect.height / ROWS;
  const x = 160 + plant.col * colWidth + colWidth * 0.7;
  const y = plant.row * rowHeight + rowHeight * 0.3;
  const el = document.createElement('div');
  el.className = 'projectile sunassault';
  const size = 18;
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.marginLeft = ((14 - size) / 2) + 'px';
  el.style.marginTop = ((14 - size) / 2) + 'px';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  lawn.appendChild(el);
  state.projectiles.push({
    el: el, x: x, y: y, row: plant.row,
    speed: 320, damage: 0, dead: false, owner: plant,
    pierce: 0, hitSet: new Set(), applyCursor: true,
  });
}

// 投掷类子弹 (玉米/西瓜): 抛物线飞向同行最左僵尸, 落点造成伤害
function lobProjectile(plant){
  const cfg = PLANTS[plant.type];
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const rowHeight = lawnRect.height / ROWS;

  // 找同行前方最靠左(最接近房屋)的僵尸作为落点
  const plantCellX = 160 + plant.col * colWidth + colWidth * 0.5;
  let target = null;
  for(const z of state.zombies){
    if(z.dead || z.row !== plant.row) continue;
    if(z.x < plantCellX) continue; // 跳过后方僵尸
    if(!target || z.x < target.x) target = z;
  }
  if(!target) return;

  const startX = 160 + plant.col * colWidth + colWidth * 0.7;
  const startY = plant.row * rowHeight + rowHeight * 0.3;
  const targetX = target.x;
  const targetY = plant.row * rowHeight + rowHeight * 0.55;

  const el = document.createElement('div');
  el.className = 'projectile ' + cfg.projectile;

  // 子弹大小随攻击力缩放
  const baseDmg = cfg.damage || 20;
  const dmg = plant.damage != null ? plant.damage : baseDmg;
  const scale = Math.min(4, Math.max(0.6, Math.sqrt(dmg / baseDmg)));
  const size = Math.round(14 * scale);
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.marginLeft = ((14 - size) / 2) + 'px';
  el.style.marginTop = ((14 - size) / 2) + 'px';

  el.style.left = startX + 'px';
  el.style.top = startY + 'px';
  lawn.appendChild(el);

  // 是否本次投出黄油(玉米投手, butterBoost技能提升概率)
  let butterChance = cfg.butterChance || 0;
  if(plant.butterBoost) butterChance = plant.butterChance || 0.5;
  const isButter = butterChance > 0 && Math.random() < butterChance;

  // 溅射范围 (splashBoost技能增加范围)
  const splashR = (cfg.splashRadius || 0) + (plant.splashBonus || 0);

  state.projectiles.push({
    el: el,
    x: startX,
    y: startY,
    startX: startX,
    startY: startY,
    targetX: targetX,
    targetY: targetY,
    dist: Math.max(1, Math.abs(targetX - startX)),
    row: plant.row,
    speed: plant.bulletSpeed ? Math.round(plant.bulletSpeed * 1.2) : 420,
    damage: dmg,
    lob: true,
    splash: cfg.splash || false,
    splashRadius: splashR,
    butter: isButter,
    dead: false,
    owner: plant,
    freezeShot: plant.freezeShot || false,
    freezeDuration: plant.freezeDuration || 1,
  });
}

function produceSunFromPlant(plant){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const rowHeight = lawnRect.height / ROWS;

  // 使用视口坐标（阳光元素在 #game 中，#game 从视口 0,0 开始）
  const px = lawnRect.left + 160 + plant.col * colWidth + colWidth/2;
  const py = lawnRect.top + plant.row * rowHeight + rowHeight/2;
  const targetY = py + 20;

  // 在植物附近生成阳光
  const sun = document.createElement('div');
  sun.className = 'sun';
  sun.style.left = (px - 25 + (Math.random()*20-10)) + 'px';
  sun.style.top = py + 'px';
  sun.addEventListener('click', () => collectSun(sunObj));

  document.getElementById('game').appendChild(sun);
  // 阳光产量受升级影响
  const sunValue = Math.round(25 * (plant.sunMult || 1));
  const sunObj = {el:sun, x:px-25, y:py, targetY:targetY, collected:false, life:10, value:sunValue};
  // 如果产量>25, 显示更大的阳光
  if(sunValue > 25){
    sun.style.transform = 'scale(1.3)';
    sun.style.filter = 'drop-shadow(0 0 6px gold)';
  }
  state.suns.push(sunObj);
}

function findZombieNearPlant(plant, range){
  for(const z of state.zombies){
    if(z.dead || z.row !== plant.row) continue;
    const zCol = getZombieCol(z);
    if(Math.abs(zCol - plant.col) <= range) return z;
  }
  return null;
}

function explodeAt(row, col, damage, radius, killerPlant){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  const rowHeight = lawnRect.height / ROWS;
  const cx = 160 + col * colWidth + colWidth/2;
  const cy = row * rowHeight + rowHeight/2;

  // 爆炸视觉
  const el = document.createElement('div');
  el.className = 'explosion';
  el.style.left = cx + 'px';
  el.style.top = cy + 'px';
  lawn.appendChild(el);
  state.explosions.push({el:el, timer:0.6});

  // 范围伤害
  for(const z of state.zombies){
    if(z.dead) continue;
    if(Math.abs(z.row - row) <= radius){
      const zCol = getZombieCol(z);
      if(Math.abs(zCol - col) <= radius){
        dealDamage(killerPlant, z, damage);
        z.el.querySelector('.zombie').classList.add('damaged');
        setTimeout(() => {
          if(z.el.querySelector('.zombie'))
            z.el.querySelector('.zombie').classList.remove('damaged');
        }, 150);
        if(z.hp <= 0) killZombie(z, killerPlant);
      }
    }
  }
}

// 火爆辣椒: 烧毁整行
function explodeRow(row, damage, killerPlant){
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const rowHeight = lawnRect.height / ROWS;
  const cy = row * rowHeight + rowHeight/2;

  // 整行火焰视觉
  const el = document.createElement('div');
  el.className = 'row-fire';
  el.style.top = cy + 'px';
  lawn.appendChild(el);
  state.explosions.push({el:el, timer:0.8});

  // 整行伤害
  for(const z of state.zombies){
    if(z.dead || z.row !== row) continue;
    dealDamage(killerPlant, z, damage);
    z.el.querySelector('.zombie').classList.add('damaged');
    setTimeout(() => {
      if(z.el.querySelector('.zombie'))
        z.el.querySelector('.zombie').classList.remove('damaged');
    }, 150);
    if(z.hp <= 0) killZombie(z, killerPlant);
  }
}

function removePlant(plant, silent){
  if(plant.dead) return;
  // 斗蛐蛐土豆地雷: 死亡时秒杀周围1格内僵尸
  if(!silent && plant.type === 'potatomine' && plant.cricketLeveled){
    potatoDeathBlast(plant);
  }
  // 斗蛐蛐土豆地雷5级复活: 拥有复活次数则原地复活为4级(可再次升级获得复活), 不移除
  if(!silent && plant.type === 'potatomine' && plant.cricketLeveled && (plant.reviveCharges || 0) > 0){
    plant.reviveCharges -= 1;
    plant.level = 4;
    plant.xp = 0;
    plant.xpToNext = cricketNewXpToNext(plant); // 复活重置为 4→5 正确经验需求(否则沿用 5 级值导致无法再升级)
    plant.levelReady = false;
    plant.dead = false;
    plant.hp = plant.maxHp;
    clearLevelReadyUI(plant);
    const def = CRICKET_LEVELS.potatomine;
    if(def && def.levels[4] && def.levels[4].apply) def.levels[4].apply(plant); // 还原4级效果(狂轰滥炸 +50)
    if(plant.el){
      const lvlDiv = plant.el.querySelector('.plant-level');
      if(lvlDiv) lvlDiv.textContent = 'Lv.4';
    }
    cricketFloat(plant, '⬆ 复活 Lv.4');
    updatePlantXPBar(plant);
    return;
  }
  // 斗蛐蛐植物死亡: 累计经验传承给同一行其他植物
  if(!silent && state.gameMode === 'cricket'){
    distributeDeathXP(plant);
  }
  plant.dead = true;
  if(plant.el.parentNode) plant.el.parentNode.removeChild(plant.el);
  const stack = state.grid[plant.row][plant.col];
  if(stack){
    const i = stack.indexOf(plant);
    if(i >= 0) stack.splice(i, 1);
  }
  // silent=true 为铲子铲除, 不计入植物损失
  if(!silent) state.plantsLost++;
}

// ============================================================
// 植物经验升级系统
// ============================================================
let levelingPlant = null; // 当前正在升级的植物

// 非攻击植物 (无法直接对僵尸造成伤害): 移除其专属被动经验, 改为依赖同行击杀的共享经验, 且升级所需经验更低
const NON_ATTACKER_TYPES = new Set(['sunflower','wallnut','tallnut','torchwood']);
function isNonAttacker(type){ return NON_ATTACKER_TYPES.has(type); }
// 无法攻击植物(无法直接击杀僵尸)升级所需经验为普通量的 25%, 使其更容易成长
const NON_ATTACKER_XP_MULT = 0.25;
// 经验曲线配置: fromLevel = 当前等级(升级前). 过渡倍率: 0->1与1->2同为基准值, 2->3为2倍, 3->4为4倍, 4->5为10倍; 更高等级封顶10倍
const XP_BASE = 50; // 植物升级所需经验总量(已按要求翻倍: 原 25 → 50)
const XP_MULT = [1, 1, 2, 4, 10];
function xpCurveCost(fromLevel){
  const m = (fromLevel >= 0 && fromLevel < XP_MULT.length) ? XP_MULT[fromLevel] : 10;
  return XP_BASE * m;
}
function xpToNextFor(level, type){
  return xpCurveCost(level);
}
// 斗蛐蛐专属升级折扣(作用于升级起点 fromLevel): 0->1 减80%(×0.2), 1->2 减50%(×0.5), 2->3 减30%(×0.7), 3->4 减10%(×0.9), 4->5 不变(×1)。对所有斗蛐蛐植物生效
const CRICKET_XP_DISCOUNT = [0.2, 0.5, 0.7, 0.9, 1.0];
// 全局再折减: 所有斗蛐蛐植物升级经验额外 -25% (×0.75)
const CRICKET_XP_GLOBAL_MULT = 0.75;
// 统一乘算: 所有斗蛐蛐植物升级经验 ×85 (本次需求: 原有经验量 × 85)
const CRICKET_XP_EXTRA_MULT = 85;

// 植物累计(总)经验: 已升过的每一级所需经验累加 + 当前进度(用于死亡传承)
function plantTotalXP(p){
  let total = p.xp || 0;
  for(let i = 0; i < (p.level || 0); i++){
    total += cricketNewXpToNext({ type: p.type, level: i });
  }
  return total;
}

// 程序化发放经验(支持一次跨多级: 在升级时扣除本级所需, 避免溢出丢失); 与 cricketAutoUpgrade 行为一致
function grantXPFully(p, amount){
  if(!p || p.dead || !PLANT_UPGRADES[p.type]) return;
  if(!p.cricketLeveled) return; // 仅斗蛐蛐植物参与经验传承
  if(p.levelReady || p.crossLevelReady) return; // 已有待升级则跳过, 避免重复升级风暴
  p.xp += amount;
  let guard = 0;
  while(!p.dead && p.level < CRICKET_NEW_MAX && p.xp >= p.xpToNext && guard < 50){
    guard++;
    p.level++;
    maybeAscend(p);
    const def = CRICKET_LEVELS[p.type];
    const lvl = def && def.levels[p.level];
    if(lvl && lvl.apply) lvl.apply(p);
    p.xp = Math.max(0, p.xp - p.xpToNext);
    p.xpToNext = cricketNewXpToNext(p);
    if(p.el){
      const lvlDiv = p.el.querySelector('.plant-level');
      if(lvlDiv) lvlDiv.textContent = 'Lv.' + p.level;
    }
    cricketFloat(p, '⬆ Lv.' + p.level);
    updatePlantXPBar(p);
  }
}

// 植物死亡: 将其累计经验平均分给同一行其他斗蛐蛐植物
function distributeDeathXP(plant){
  if(!plant) return;
  const total = plantTotalXP(plant);
  if(total <= 0) return;
  const row = plant.row;
  const mates = [];
  if(state && state.grid && state.grid[row]){
    for(let c = 0; c < state.grid[row].length; c++){
      const cell = state.grid[row][c];
      if(!cell) continue;
      for(const p of cell){
        if(!p || p === plant || p.dead) continue;
        if(!PLANT_UPGRADES[p.type] || !p.cricketLeveled) continue;
        if(p.levelReady || p.crossLevelReady) continue;
        if(p.level >= CRICKET_NEW_MAX) continue;
        mates.push(p);
      }
    }
  }
  if(mates.length === 0) return;
  const share = Math.floor(total / mates.length);
  if(share <= 0) return;
  for(const m of mates){
    grantXPFully(m, share);
    cricketFloat(m, '💠 +' + share);
  }
}

function awardXP(plant, amount){
  if(!plant || plant.dead) return;
  if(!PLANT_UPGRADES[plant.type]) return;
  if(state.gameMode === 'cricket'){
    const cap = plant.cricketLeveled ? CRICKET_NEW_MAX : CRICKET_MAX_LEVEL;
    if(plant.level >= cap) return; // 已达上限(仅斗蛐蛐), 不再积累经验
  }
  if(plant.levelReady || plant.crossLevelReady) return; // 已可升级, 不再积累
  // 无法攻击植物不再额外加成经验, 获得经验量与普通植物一致(经由降低升级所需经验来平衡成长)
  const gained = amount;
  plant.xp += gained;
  if(plant.xp >= plant.xpToNext){
    plant.xp = plant.xpToNext; // 锁定, 等待玩家选择
    // 新固定升级系统: 直接走固定升级, 不弹随机选项
    if(plant.cricketLeveled){
      if(plant.level >= CRICKET_NEW_MAX){
        plant.xp = 0; plant.xpToNext = cricketNewXpToNext(plant);
        updatePlantXPBar(plant);
        return;
      }
      plant.levelReady = true;
      if(plant.el){
        plant.el.classList.add('level-ready');
        const badge = document.createElement('div');
        badge.className = 'level-up-badge';
        badge.textContent = '⬆';
        badge.onclick = function(e){ e.stopPropagation(); openLevelUp(plant); };
        plant.el.appendChild(badge);
      }
      if(state.gameMode === 'cricket'){
        setTimeout(() => { if(!plant.dead && plant.levelReady) cricketAutoUpgrade(plant); }, 400);
      }
      updatePlantXPBar(plant);
      return;
    }
    // 检查是否所有自身升级都已满级
    const options = generateUpgradeOptions(plant);
    if(options.length === 0){
      if(state.gameMode === 'cricket'){
        // 斗蛐蛐模式: 不获得随机其他植物技能, 直接满级强化
        autoMaxLevelBoost(plant);
        return;
      }
      // 自身满级, 检查是否有可用的跨植物技能
      const crossAvail = getAllCrossSkills(plant);
      if(crossAvail.length > 0){
        plant.crossLevelReady = true;
        plant.crossTimer = 3; // 3秒倒计时
        if(plant.el){
          plant.el.classList.add('level-ready');
          const badge = document.createElement('div');
          badge.className = 'level-up-badge cross-badge';
          badge.textContent = '🔄3';
          badge.onclick = function(e){
            e.stopPropagation();
            openLevelUp(plant);
          };
          plant.el.appendChild(badge);
        }
        updatePlantXPBar(plant);
        return;
      }
      // 无跨植物技能, 自动应用满级强化
      autoMaxLevelBoost(plant);
      return;
    }
    plant.levelReady = true;
    // 视觉提示
    if(plant.el){
      plant.el.classList.add('level-ready');
      const badge = document.createElement('div');
      badge.className = 'level-up-badge';
      badge.textContent = '⬆';
      badge.onclick = function(e){
        e.stopPropagation();
        openLevelUp(plant);
      };
      plant.el.appendChild(badge);
    }
    if(state.gameMode === 'cricket'){
      setTimeout(() => { if(!plant.dead && plant.levelReady) cricketAutoUpgrade(plant); }, 400);
    }
  }
  updatePlantXPBar(plant);
}

// 满级后自动强化 (所有升级选项已满级时触发, 仅旧随机升级系统使用)
function autoMaxLevelBoost(plant){
  if(state.gameMode === 'cricket' && !plant.cricketLeveled && plant.level >= CRICKET_MAX_LEVEL) return; // 已达上限(仅斗蛐蛐, 旧系统), 不再强化
  plant.damage = (plant.damage || PLANTS[plant.type].damage || 20) * 1.1;
  plant.maxHp *= 1.1; plant.hp = plant.maxHp;
  if(plant.attackInterval) plant.attackInterval *= 0.9;
  plant.level++;
  maybeAscend(plant);
  plant.xp = 0;
  plant.xpToNext = xpToNextFor(plant.level, plant.type);
  plant.levelReady = false;
  plant.crossLevelReady = false;
  plant.crossTimer = 0;
  if(plant.el){
    plant.el.classList.remove('level-ready');
    const badge = plant.el.querySelector('.level-up-badge');
    if(badge) badge.remove();
  }
  updatePlantXPBar(plant);
  // 浮动提示
  if(plant.el){
    const text = document.createElement('div');
    text.className = 'auto-level-text';
    text.textContent = '🌟满级强化! Lv.' + plant.level;
    plant.el.appendChild(text);
    setTimeout(() => { if(text.parentNode) text.parentNode.removeChild(text); }, 1500);
  }
}

// 食人花: 刷新吞噬等级红色徽章(显示于正常等级上方)
function updateDevourLevel(plant){
  if(!plant || !plant.el) return;
  const d = plant.el.querySelector('.devour-level');
  if(d){
    // 仅斗蛐蛐模式(已 cricketLeveled)的食人花显示吞噬等级徽章; 普通模式维持原样(不显示)
    if(plant.type === 'chomper' && plant.cricketLeveled){
      d.textContent = '吞' + (plant.devourLevel || 0);
      d.style.display = 'block';
    } else {
      d.style.display = 'none';
    }
  }
  // 同步驱动模型尺寸: 吞噬等级越高, 食人花模型越大
  setChomperScale(plant);
}

// 食人花尺寸: 吞噬等级 -> --chomper-scale CSS 变量
// 公式: scale = 1 + devourLevel * 0.04 (上限 devourCap=30 时 scale=2.2)
function setChomperScale(plant){
  if(!plant || plant.type !== 'chomper' || !plant.el) return;
  const chomperEl = plant.el.querySelector('.plant-chomper');
  if(!chomperEl) return;
  // 普通模式: 维持原版尺寸(不随吞噬等级缩放)
  if(!plant.cricketLeveled){
    chomperEl.style.setProperty('--chomper-scale', '1');
    return;
  }
  const lvl = plant.devourLevel || 0;
  // base=1, 增量0.04/级, 最高 2.2(对应 cap 30); 当未解锁为1.0
  const scale = 1 + lvl * 0.04;
  chomperEl.style.setProperty('--chomper-scale', scale.toFixed(3));
}

function updatePlantXPBar(plant){
  if(!plant.el) return;
  const xpBar = plant.el.querySelector('.xp-bar');
  const xpFill = plant.el ? (plant.el.querySelector('.xp-fill')) : null;
  const lvlDiv = plant.el.querySelector('.plant-level');
  if(!xpBar || !xpFill) return;
  // 有升级配置的植物显示经验条
  if(PLANT_UPGRADES[plant.type]){
    xpBar.classList.add('active');
    if(lvlDiv) lvlDiv.classList.add('show');
    const pct = (plant.levelReady || plant.crossLevelReady) ? 100 : (plant.xp / plant.xpToNext * 100);
    xpFill.style.width = pct + '%';
    if(lvlDiv) lvlDiv.textContent = 'Lv.' + plant.level;
  }
}

function openLevelUp(plant){
  if(!plant || plant.dead) return;
  if(!plant.levelReady && !plant.crossLevelReady) return;
  // 斗蛐蛐模式: 自动升级, 不暂停
  if(state.gameMode === 'cricket'){
    if(plant.levelReady) cricketAutoUpgrade(plant);
    else if(plant.crossLevelReady) cricketAutoCross(plant);
    return;
  }
  levelingPlant = plant;
  // 暂停游戏
  state.gameRunning = false;
  const overlay = document.getElementById('plant-level-overlay');
  const cfg = PLANTS[plant.type];
  const cardsContainer = document.getElementById('lu-cards');
  cardsContainer.innerHTML = '';

  // === 跨植物升级模式 ===
  if(plant.crossLevelReady){
    document.getElementById('lu-title').textContent = '🔄 ' + cfg.name + ' Lv.' + plant.level + ' → Lv.' + (plant.level + 1);
    document.getElementById('lu-sub').textContent = '选择一个其他植物的专属技能';
    const options = generateCrossOptions(plant);
    if(options.length === 0){
      // 无跨植物技能, 走满级强化
      clearCrossBadge(plant);
      autoMaxLevelBoost(plant);
      state.gameRunning = true;
      startGameLoop();
      return;
    }
    options.forEach(function(opt){
      const card = document.createElement('div');
      card.className = 'upgrade-card skill';
      let html = '';
      html += '<div class="uc-skill-tag" style="background:linear-gradient(90deg,#7B1FA2,#E91E63);">🔄 ' + opt.sourceName + '</div>';
      html += '<div class="uc-icon">' + opt.icon + '</div>';
      html += '<div class="uc-name">' + opt.name + '</div>';
      html += '<div class="uc-desc">' + opt.desc + '</div>';
      if(opt.currentLevel != null) html += '<div class="uc-level">Lv.' + opt.currentLevel + ' → ' + (opt.currentLevel + 1) + '/' + opt.maxLevel + '</div>';
      card.innerHTML = html;
      card.onclick = function(){
        clearCrossBadge(plant);
        applyCrossUpgrade(plant, opt);
        closeLevelUp();
        state.gameRunning = true;
        startGameLoop();
      };
      cardsContainer.appendChild(card);
    });
    overlay.classList.add('show');
    return;
  }

  // === 自身升级模式 ===
  document.getElementById('lu-title').textContent = '⬆ ' + cfg.name + ' Lv.' + plant.level + ' → Lv.' + (plant.level + 1);
  document.getElementById('lu-sub').textContent = '选择一个升级选项';
  // 生成3个随机选项
  const options = generateUpgradeOptions(plant);
  // 如果没有可用升级, 显示满级提示
  if(options.length === 0){
    document.getElementById('lu-sub').textContent = '已达满级! 获得额外强化';
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = '<div class="uc-icon">🌟</div><div class="uc-name">满级强化</div><div class="uc-desc">全属性+10%</div>';
    card.onclick = function(){
      plant.damage = (plant.damage || PLANTS[plant.type].damage || 20) * 1.1;
      plant.maxHp *= 1.1; plant.hp = plant.maxHp;
      if(plant.attackInterval) plant.attackInterval *= 0.9;
      plant.level++;
      plant.xp = 0;
      plant.xpToNext = xpToNextFor(plant.level, plant.type);
      plant.levelReady = false;
      if(plant.el){
        plant.el.classList.remove('level-ready');
        const badge = plant.el.querySelector('.level-up-badge');
        if(badge) badge.remove();
      }
      updatePlantXPBar(plant);
      closeLevelUp();
      state.gameRunning = true;
      startGameLoop();
    };
    cardsContainer.appendChild(card);
    overlay.classList.add('show');
    return;
  }
  options.forEach(function(opt){
    const card = document.createElement('div');
    card.className = 'upgrade-card' + (opt.isSkill ? ' skill' : '');
    let html = '';
    if(opt.isSkill) html += '<div class="uc-skill-tag">技能</div>';
    html += '<div class="uc-icon">' + opt.icon + '</div>';
    html += '<div class="uc-name">' + opt.name + '</div>';
    html += '<div class="uc-desc">' + opt.desc + '</div>';
    if(opt.currentLevel != null) html += '<div class="uc-level">Lv.' + opt.currentLevel + ' → ' + (opt.currentLevel + 1) + '/' + opt.maxLevel + '</div>';
    card.innerHTML = html;
    card.onclick = function(){ applyUpgrade(plant, opt); };
    cardsContainer.appendChild(card);
  });
  overlay.classList.add('show');
}

function generateUpgradeOptions(plant){
  const pool = PLANT_UPGRADES[plant.type];
  if(!pool) return [];
  // 防御性: 部分植物(如斗蛐蛐非固定系统植物经 cricketifyPlant 改造)可能未初始化这些字段
  const _statLevels = plant.statLevels || {};
  const _skills = plant.skills || {};
  const available = [];
  // 收集可用数值升级
  if(pool.stats){
    for(const s of pool.stats){
      const curLevel = _statLevels[s.id] || 0;
      if(curLevel < s.max){
        available.push({
          id: s.id, name: s.name, desc: s.desc, icon: s.icon,
          maxLevel: s.max, currentLevel: curLevel, isSkill: false,
          apply: s.apply,
        });
      }
    }
  }
  // 收集可用技能升级 (使用levels数组获取下一级描述和效果)
  if(pool.skills){
    for(const s of pool.skills){
      const curLevel = _skills[s.id] || 0;
      if(curLevel < s.max){
        const nextLevel = s.levels[curLevel];
        available.push({
          id: s.id, name: s.name, desc: nextLevel.desc, icon: s.icon,
          maxLevel: s.max, currentLevel: curLevel, isSkill: true,
          apply: nextLevel.apply,
        });
      }
    }
  }
  if(available.length === 0) return [];
  // 优先技能: 如果有未选技能, 提高技能出现概率
  // 随机选3个 (不重复)
  const result = [];
  const tempPool = available.slice();
  // 技能优先: 先尝试选1个技能
  const skills = tempPool.filter(o => o.isSkill);
  if(skills.length > 0 && result.length < 3){
    const pick = skills[Math.floor(Math.random() * skills.length)];
    result.push(pick);
    const idx = tempPool.indexOf(pick);
    tempPool.splice(idx, 1);
  }
  // 填满3个
  while(result.length < 3 && tempPool.length > 0){
    const idx = Math.floor(Math.random() * tempPool.length);
    result.push(tempPool[idx]);
    tempPool.splice(idx, 1);
  }
  // 如果不足3个, 用已有的凑数 (允许重复显示但选了后扣减)
  while(result.length < 3 && available.length > 0){
    result.push(available[Math.floor(Math.random() * available.length)]);
  }
  // 打乱顺序
  result.sort(function(){ return Math.random() - 0.5; });
  return result;
}

function applyUpgrade(plant, opt){
  // 应用效果
  opt.apply(plant);
  // 记录等级
  if(opt.isSkill){
    plant.skills[opt.id] = (plant.skills[opt.id] || 0) + 1;
  } else {
    plant.statLevels[opt.id] = (plant.statLevels[opt.id] || 0) + 1;
  }
  // 升级
  plant.level++;
  plant.xp = 0;
  plant.xpToNext = xpToNextFor(plant.level, plant.type);
  plant.levelReady = false;
  plant.kills = plant.kills || 0;
  // 清除升级提示
  if(plant.el){
    plant.el.classList.remove('level-ready');
    const badge = plant.el.querySelector('.level-up-badge');
    if(badge) badge.remove();
  }
  updatePlantXPBar(plant);
  // 关闭弹窗
  closeLevelUp();
  // 恢复游戏 - 重启游戏循环
  state.gameRunning = true;
  startGameLoop();
}

function closeLevelUp(){
  document.getElementById('plant-level-overlay').classList.remove('show');
  levelingPlant = null;
}

// 更新植物被动技能 (regen, aura等)
function updatePlantPassives(plant, dt){
  const cfg = PLANTS[plant.type];
  // 斗蛐蛐向日葵: 全行施加"光标" + "阳光突击"发射阳光子弹
  if(plant.cricketSunflower){
    // 全行施加光标(每 cursorInterval 秒)
    plant.cursorTimer -= dt;
    if(plant.cursorTimer <= 0){
      plant.cursorTimer = plant.cursorInterval;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        addCursor(z, 1);
      }
    }
    // 阳光突击(3级解锁): 每 sunAssaultInterval 秒发射阳光子弹, 命中僵尸施加1层光标
    if(plant.sunAssault){
      plant.sunAssaultTimer -= dt;
      if(plant.sunAssaultTimer <= 0){
        plant.sunAssaultTimer = plant.sunAssaultInterval;
        fireSunAssault(plant);
      }
    }
  }
  // 斗蛐蛐坚果墙: 生命回复 + 周期性全行护盾
  if(plant.type === 'wallnut' && plant.cricketLeveled){
    if(plant.regenFlat && plant.hp < plant.maxHp){
      plant.hp = Math.min(plant.maxHp, plant.hp + plant.regenFlat * dt);
    }
    if(plant.rowShield){
      plant.shieldTimer -= dt;
      if(plant.shieldTimer <= 0){
        plant.shieldTimer = 300; // 每5分钟刷新
        applyRowShield(plant.row, 300);
      }
    }
  }
  // 自我修复
  if(plant.regen && plant.hp < plant.maxHp){
    plant.hp = Math.min(plant.maxHp, plant.hp + plant.maxHp * 0.01 * dt);
  }
  // 治愈光环 (向日葵)
  if(plant.auraHeal){
    plant.auraTimer -= dt;
    if(plant.auraTimer <= 0){
      plant.auraTimer = plant.auraHealInterval || 3;
      const healAmount = plant.auraHealAmount || 0.15;
      // 治疗周围3x3范围的植物
      for(let dr = -1; dr <= 1; dr++){
        for(let dc = -1; dc <= 1; dc++){
          const r = plant.row + dr, c = plant.col + dc;
          if(r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
          if(!state.grid[r] || !state.grid[r][c]) continue;
          for(const p of state.grid[r][c]){
            if(p && !p.dead && p !== plant && p.hp < p.maxHp){
              p.hp = Math.min(p.maxHp, p.hp + p.maxHp * healAmount);
            }
          }
        }
      }
    }
  }
  // 寒冰光环 (寒冰射手): 减速同行所有僵尸
  if(plant.slowAura){
    plant.auraTimer -= dt;
    if(plant.auraTimer <= 0){
      plant.auraTimer = plant.auraInterval || 1;
      const slowDur = plant.slowDuration || 2;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        applySlowToZombie(z, 0.5, slowDur, plant);
      }
    }
  }
  // 火焰光环 (火炬树桩): 灼烧同行所有僵尸
  if(plant.fireAura){
    plant.auraTimer -= dt;
    if(plant.auraTimer <= 0){
      plant.auraTimer = plant.auraInterval || 0.5;
      const fireDmg = plant.fireDamage || 15;
      for(const z of state.zombies){
        if(z.dead || z.row !== plant.row) continue;
        dealDamage(plant, z, fireDmg);
        if(z.hp <= 0) killZombie(z, plant);
      }
    }
  }
  // 跨植物升级倒计时
  if(plant.crossLevelReady){
    plant.crossTimer -= dt;
    if(plant.el){
      const cb = plant.el.querySelector('.cross-badge');
      if(cb) cb.textContent = '🔄' + Math.ceil(plant.crossTimer);
    }
    if(plant.crossTimer <= 0){
      autoCrossUpgrade(plant);
    }
  }
}

// ============================================================
// 跨植物专属升级系统
// ============================================================

// 收集所有其他植物的可用跨植物技能
function getAllCrossSkills(plant){
  const result = [];
  const ownSkillIds = new Set(Object.keys(plant.skills || {}).filter(id => (plant.skills[id] || 0) > 0));
  for(const [srcType, pool] of Object.entries(PLANT_UPGRADES)){
    if(srcType === plant.type) continue; // 跳过自身
    if(!pool.skills) continue;
    for(const s of pool.skills){
      // 跳过自身已拥有的同ID技能 (避免效果冲突)
      if(ownSkillIds.has(s.id)) continue;
      const crossKey = srcType + ':' + s.id;
      const curLevel = plant.crossSkills[crossKey] || 0;
      if(curLevel < s.max){
        const nextLevel = s.levels[curLevel];
        if(nextLevel){
          result.push({
            id: s.id, name: s.name, desc: nextLevel.desc, icon: s.icon,
            maxLevel: s.max, currentLevel: curLevel, isSkill: true,
            isCross: true, sourceType: srcType, sourceName: PLANTS[srcType].name,
            crossKey: crossKey, apply: nextLevel.apply,
          });
        }
      }
    }
  }
  return result;
}

// 生成3个随机跨植物技能选项
function generateCrossOptions(plant){
  const available = getAllCrossSkills(plant);
  if(available.length === 0) return [];
  const result = [];
  const tempPool = available.slice();
  while(result.length < 3 && tempPool.length > 0){
    const idx = Math.floor(Math.random() * tempPool.length);
    result.push(tempPool[idx]);
    tempPool.splice(idx, 1);
  }
  // 不足3个时用已有的补
  while(result.length < 3 && available.length > 0){
    result.push(available[Math.floor(Math.random() * available.length)]);
  }
  result.sort(function(){ return Math.random() - 0.5; });
  return result;
}

// 自动跨植物升级 (倒计时结束)
function autoCrossUpgrade(plant){
  if(!plant || plant.dead || !plant.crossLevelReady) return;
  const available = getAllCrossSkills(plant);
  if(available.length === 0){
    // 无可学跨植物技能, 走满级强化
    plant.crossLevelReady = false;
    plant.crossTimer = 0;
    clearCrossBadge(plant);
    autoMaxLevelBoost(plant);
    return;
  }
  // 随机选一个
  const pick = available[Math.floor(Math.random() * available.length)];
  applyCrossUpgrade(plant, pick);
}

// 应用跨植物升级
function applyCrossUpgrade(plant, opt){
  opt.apply(plant);
  plant.crossSkills[opt.crossKey] = (plant.crossSkills[opt.crossKey] || 0) + 1;
  plant.level++;
  plant.xp = 0;
  plant.xpToNext = xpToNextFor(plant.level, plant.type);
  plant.crossLevelReady = false;
  plant.crossTimer = 0;
  clearCrossBadge(plant);
  updatePlantXPBar(plant);
  // 浮动提示
  if(plant.el){
    const text = document.createElement('div');
    text.className = 'auto-level-text';
    text.textContent = '🔄' + opt.sourceName + ' Lv.' + plant.level;
    plant.el.appendChild(text);
    setTimeout(() => { if(text.parentNode) text.parentNode.removeChild(text); }, 1500);
  }
}

// 清除跨植物升级标记
function clearCrossBadge(plant){
  plant.crossLevelReady = false;
  plant.crossTimer = 0;
  if(plant.el){
    plant.el.classList.remove('level-ready');
    const badge = plant.el.querySelector('.cross-badge');
    if(badge) badge.remove();
  }
}

// ============================================================
// 僵尸行为
// ============================================================
function updateZombie(z, dt){
  if(z.dead) return;

  // 寒意叠加冷却递减(冰冻期间也照常递减, 以便冰冻中可继续叠加寒意)
  if(z.chillCd > 0) z.chillCd -= dt;
  // 解冻后寒意免疫递减
  if(z.chillImmune > 0) z.chillImmune -= dt;

  // === 巨人僵尸: 半血时向前投掷小鬼(只投一次), 并移除背上的小鬼贴图 ===
  if(z.type === 'giant' && !z.giantThrew && z.hp <= z.maxHp / 2){
    z.giantThrew = true;
    const _zEl = z.el.querySelector('.zombie');
    if(_zEl){ const bi = _zEl.querySelector('.giant-back-imp'); if(bi) bi.remove(); }
    throwGiantImp(z);
  }

  // === 黄油定身: 完全无法行动/进食 (并打断巨人挥棒) ===
  if(z.buttered){
    if(z.type === 'giant') cancelGiantSwing(z);
    z.butterTimer -= dt;
    if(z.butterTimer <= 0){
      z.buttered = false;
      z.el.querySelector('.zombie').classList.remove('buttered');
    } else {
      return; // 定身期间什么都不做
    }
  }

  // === 冰冻定身: 完全无法行动/进食 (并打断巨人挥棒) ===
  if(z.frozen){
    if(z.type === 'giant') cancelGiantSwing(z);
    z.frozenTimer -= dt;
    if(z.frozenTimer <= 0){
      z.frozen = false;
      z.chillImmune = CHILL_FREEZE_IMMUNE; // 解冻后短暂免疫寒意
      const zEl = z.el.querySelector('.zombie');
      if(zEl) zEl.classList.remove('frozen');
      // 寒意机制: 冰冻解除 → 寒意清零 + 破冰伤害 + 碎冰特效
      if(z.chill > 0){
        dealDamage(null, z, CHILL_BREAK_DMG);
        spawnChillShatter(z);
        z.chill = 0;
        if(z.chillEl) z.chillEl.textContent = '';
        if(zEl) zEl.classList.remove('chilled');
        if(z.hp <= 0) killZombie(z, null); // 破冰击杀(盲盒僵尸在此冒出真实僵尸)
      }
    } else {
      return; // 冰冻期间什么都不做
    }
  }

  // 持续中毒 (剧毒藤)
  if(z.poison){
    z.poison.t -= dt;
    const _pd = z.poison.dps * dt;
    dealDamage(z.poison.owner, z, _pd);
    if(z.hp <= 0){
      killZombie(z, z.poison.owner);
      return;
    }
    if(z.poison.t <= 0) z.poison = null;
  }

  // 减速效果
  if(z.slowed){
    z.slowTimer -= dt;
    if(z.slowTimer <= 0){
      z.slowed = false;
      z.el.querySelector('.zombie').classList.remove('slowed');
    }
  }

  // === 报纸僵尸愤怒检查 ===
  if(z.type === 'newspaper' && !z.angered && z.hp <= ZOMBIES.newspaper.angerHp){
    z.angered = true;
    z.speed = ZOMBIES.newspaper.angerSpeed;
    const zEl = z.el.querySelector('.zombie');
    if(zEl){
      zEl.classList.add('newspaper-angry');
      const ns = zEl.querySelector('.newspaper');
      if(ns) ns.remove();
    }
  }

  // === 跳舞僵尸召唤 ===
  if(z.type === 'dancing' && !z.dead){
    z.summonTimer -= dt;
    if(z.summonTimer <= 0 && !z.eating){
      z.summonTimer = 999; // 只召唤一次
      summonImps(z);
    }
  }

  // 检查是否要吃植物 (叠种时吃最前面/最底层那株)
  const zCol = getZombieCol(z);
  let targetPlant = null;
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const colWidth = (lawnRect.width - 160) / COLS;
  if(zCol >= 0 && zCol < COLS){
    const stack = state.grid[z.row][zCol];
    let plant = null;
    if(stack && stack.length > 0) plant = stack[0];
    if(plant && !plant.dead){
      // 地刺: 僵尸直接踩过去, 不会被吃
      if(plant.type === 'spikeweed'){
        targetPlant = null;
      } else {
        const plantX = 160 + zCol * colWidth + colWidth/2;
        if(Math.abs(z.x - plantX) < colWidth * 0.5){
          targetPlant = plant;
        }
      }
    }
  }

  // === 土豆地雷触发: 武装后被踩中爆炸 (仅普通模式; 斗蛐蛐土豆地雷为投弹机, 不触发接触爆炸) ===
  // 必须在撑杆僵尸跳跃之前判定, 否则撑杆会直接跳过地雷而不引爆(地雷瞬间被跳过, 僵尸直冲小推车)
  if(targetPlant && targetPlant.type === 'potatomine' && targetPlant.armed && !targetPlant.dead && !targetPlant.cricketLeveled){
    explodeAt(z.row, zCol, targetPlant.damage, targetPlant.explodeRadius || 1, targetPlant);
    removePlant(targetPlant);
    targetPlant = null;
  }

  // === 撑杆僵尸跳过第一株植物 (高坚果会挡住撑杆, 无法越过) ===
  if(z.type === 'polevaulter' && !z.vaulted && targetPlant && targetPlant.type !== 'tallnut'){
    z.vaulted = true;
    z.vaulting = true;
    // 实际越过植物: 位置前移约1.3格
    const lawnEl = document.getElementById('lawn');
    const lawnR = gRect(lawnEl);
    const cw = (lawnR.width - 160) / COLS;
    z.x -= cw * 1.3;
    z.el.style.left = z.x + 'px';
    // 视觉跳跃动画
    const zEl = z.el;
    zEl.style.transition = 'transform .4s ease-out';
    zEl.style.transform = 'translateY(-50px)';
    setTimeout(() => {
      zEl.style.transition = 'transform .3s ease-out';
      zEl.style.transform = 'translateY(0)';
      z.speed = ZOMBIES.polevaulter.speed * 0.6;
      z.vaulting = false;
    }, 400);
    targetPlant = null; // 不吃，直接跳过
  }

  if(z.type === 'giant'){
    updateGiant(z, dt, targetPlant);
  } else if(targetPlant && !z.vaulting){
    // 吃植物
    z.eating = true;
    z.el.querySelector('.zombie').classList.add('eating');
    let eatDmg = ZOMBIES[z.type].damage * ZOMBIE_BITE_MULT * dt;
    // 伤害减免 (硬化技能)
    if(targetPlant.dr) eatDmg *= (1 - targetPlant.dr);
    damagePlant(targetPlant, eatDmg);
    // 反伤 (反伤甲技能)
    if(targetPlant.reflect){
      z.hp -= eatDmg * targetPlant.reflect;
      if(z.hp <= 0) killZombie(z, targetPlant);
    }
    if(targetPlant.hp <= 0){
      removePlant(targetPlant);
    }
  } else {
    // 移动
    z.eating = false;
    z.el.querySelector('.zombie').classList.remove('eating');
    zombieMoveAndEnd(z, dt);
  }
}

// 僵尸向左移动 + 割草机/房屋判定(普通僵尸与巨人共用)
function zombieMoveAndEnd(z, dt){
  const speed = z.slowed ? z.speed * (z.slowMult || 0.5) : z.speed;
  z.x -= speed * dt;
  z.el.style.left = z.x + 'px';

  // 检查是否到达割草机位置
  if(z.x < 155){
    const mower = state.lawnmowers.find(m => m.row === z.row && !m.used && !m.active);
    if(mower){
      mower.active = true;
      mower.used = true;
      mower.el.style.display = 'block';
      mower.el.classList.add('moving');
      z.hp = 0;
      killZombie(z);
      // 斗蛐蛐模式: 小推车触发即判定该队伍失败, 清场该行
      if(state.gameMode === 'cricket' && cricketRowAlive[z.row]){
        cricketRowAlive[z.row] = false;
        showCricketBanner('第 ' + (z.row + 1) + ' 队阵亡！(小推车触发)');
        for(const oz of state.zombies){
          if(!oz.dead && oz.row === z.row){ oz.hp = 0; killZombie(oz); }
        }
      }
    }
  }
  // 检查是否到达房屋（斗蛐蛐模式下该行已阵亡，直接移除僵尸）
  if(z.x < 30){
    if(state.gameMode === 'cricket'){
      z.dead = true;
      if(z.el.parentNode) z.el.parentNode.removeChild(z.el);
      return;
    }
    loseGame();
  }
}

// 取消巨人挥棒(被冰冻/黄油打断时调用): 重置状态机并移除挥棒动画类
function cancelGiantSwing(z){
  if(z.type === 'giant' && z.giantPhase !== 'walk'){
    z.giantPhase = 'walk';
    z.giantTimer = 0;
    const zEl = z.el && z.el.querySelector('.zombie');
    if(zEl) zEl.classList.remove('winding', 'striking', 'recovering');
  }
}

// 巨人僵尸挥棒状态机: 走到植物前 → 前摇(windup) → 挥击秒杀(strike) → 后摇(recover) → 继续走
function updateGiant(z, dt, targetPlant){
  const zEl = z.el.querySelector('.zombie');
  const hasTarget = !!(targetPlant && !targetPlant.dead);
  switch(z.giantPhase){
    case 'walk': {
      z.eating = false;
      if(zEl) zEl.classList.remove('winding', 'striking', 'recovering');
      if(hasTarget){
        // 进入前摇
        z.giantPhase = 'windup';
        z.giantTimer = GIANT_WINDUP;
        if(zEl) zEl.classList.add('winding');
      } else {
        zombieMoveAndEnd(z, dt);
      }
      break;
    }
    case 'windup': {
      if(!hasTarget){
        // 目标消失, 取消挥棒
        z.giantPhase = 'walk'; z.giantTimer = 0;
        if(zEl) zEl.classList.remove('winding');
        break;
      }
      z.giantTimer -= dt;
      if(z.giantTimer <= 0){
        z.giantPhase = 'strike'; z.giantTimer = GIANT_STRIKE;
        if(zEl){ zEl.classList.remove('winding'); zEl.classList.add('striking'); }
        // 挥击瞬间: 一击秒杀植物
        if(hasTarget && targetPlant && !targetPlant.dead) killGiantPlant(targetPlant);
      }
      break;
    }
    case 'strike': {
      z.giantTimer -= dt;
      if(z.giantTimer <= 0){
        z.giantPhase = 'recover'; z.giantTimer = GIANT_RECOVER;
        if(zEl){ zEl.classList.remove('striking'); zEl.classList.add('recovering'); }
      }
      break;
    }
    case 'recover': {
      z.giantTimer -= dt;
      if(z.giantTimer <= 0){
        z.giantPhase = 'walk'; z.giantTimer = 0;
        if(zEl) zEl.classList.remove('recovering');
      }
      break;
    }
  }
}

// 巨人一击秒杀植物(无视护甲/血量, 直接摧毁)
function killGiantPlant(plant){
  if(!plant || plant.dead) return;
  // 韧性坚果(斗蛐蛐坚果墙3级+): 可扛巨人砸击, 每次受砸仅损失固定生命(而非被秒杀)
  if(plant.toughNut){
    const smash = plant.smashDamage || 1000;
    plant.hp -= smash;
    if(plant.el){
      plant.el.classList.add('nut-hit');
      setTimeout(() => { if(plant.el) plant.el.classList.remove('nut-hit'); }, 220);
    }
    if(plant.hp <= 0) removePlant(plant);
    return;
  }
  plant.hp = 0;
  removePlant(plant);
}

// 植物受伤(含护盾吸收): 护盾优先吸收伤害, 溢出才扣本体生命
function damagePlant(plant, dmg){
  if(!plant || plant.dead) return;
  if(plant.shieldHp && plant.shieldHp > 0){
    const absorbed = Math.min(plant.shieldHp, dmg);
    plant.shieldHp -= absorbed;
    dmg -= absorbed;
    if(plant.shieldHp <= 0){
      plant.shieldHp = 0;
      updateShieldVisual(plant, false);
    }
  }
  if(dmg > 0) plant.hp -= dmg;
}

// 切换植物护盾视觉特效
function updateShieldVisual(plant, on){
  if(!plant.el) return;
  if(on) plant.el.classList.add('shielded');
  else plant.el.classList.remove('shielded');
}

// 为某一行所有植物附加(不可叠加)护盾
function applyRowShield(row, amount){
  if(!state.grid || !state.grid[row]) return;
  for(let c = 0; c < COLS; c++){
    const cell = state.grid[row][c];
    if(!cell) continue;
    for(const p of cell){
      if(p && !p.dead){
        p.shieldHp = amount;      // 不可叠加: 直接覆盖
        updateShieldVisual(p, true);
      }
    }
  }
}

// 巨人半血投掷小鬼: 向前(朝房屋方向)投掷5格, 最多落到第2列
function throwGiantImp(z){
  try{
    const lawn = document.getElementById('lawn');
    const lawnRect = gRect(lawn);
    const colWidth = (lawnRect.width - 160) / COLS;
    const zCol = getZombieCol(z);
    let landCol = (zCol !== null && zCol >= 0) ? (zCol - 5) : 3;
    if(landCol < 2) landCol = 2;            // 最多投到第2列处
    if(landCol > COLS - 1) landCol = COLS - 1;
    const landX = 160 + landCol * colWidth + colWidth / 2;
    spawnImp(z.row, landX);
    // 投掷提示
    const y = (z.el ? z.el.offsetTop : 0) + 12;
    spawnDamageNumber(z.x != null ? z.x : 0, y, '🧌', '');
  }catch(e){}
  }

// 僵尸击杀经验: 以普通僵尸(maxHp=200)为基准给予 1 点经验,
// 其余僵尸按血量比例递增 —— 血量越高, 经验越多; 但至少 1 点。
function zombieKillXP(z){
  const BASE_HP = 200;               // 普通僵尸血量 = 基准 1 经验
  const ratio = (z.maxHp || BASE_HP) / BASE_HP;
  // 斗蛐蛐模式: 击杀最低经验量调整为 100 (其他模式保持原值 1, 不触碰冒险/无尽原版配置)
  const floor = (typeof state !== 'undefined' && state.gameMode === 'cricket') ? 100 : 1;
  return Math.max(floor, Math.round(ratio));
}

// 土豆地雷(斗蛐蛐)爆弹: 在 (x,row) 落下, 1格AOE 造成伤害; 若「狂轰滥炸」击杀则连锁投下半伤害爆弹(+50固定, 不受减半影响)
// 土豆地雷(斗蛐蛐)投弹: 从发射点向前(右)逐帧飞行, 碰到同行僵尸才爆炸(不再飞到预设落点后 AOE)
// 飞行速度较慢, 由 POTATO_MINE_SPEED 控制(px/s)
const POTATO_MINE_SPEED = 280;
function dropPotatoBomb(plant, row, dmg, originX){
  try{
    const lawn = document.getElementById('lawn');
    const lr = gRect(lawn);
    const colW = (lr.width - 160) / COLS, rowH = lr.height / ROWS;
    const startX = (originX != null) ? originX : (160 + (plant.col || 0) * colW + colW / 2); // 默认从本体所在列中心发射
    const topY = row * rowH + rowH - 34;
    const mine = document.createElement('div');
    mine.className = 'cricket-mine';
    mine.style.left = (startX - 15) + 'px';
    mine.style.top = topY + 'px';
    mine.classList.add('mine-trail');                         // 拖尾特效
    lawn.appendChild(mine);
    let bx = startX;
    const maxX = lr.width + 40;                              // 飞出草坪右边界则消失(未命中)
    const gmSpeed = (typeof debug !== 'undefined' && debug && debug.speed) ? debug.speed : 1; // 随游戏倍速同步: 5倍速下爆弹不再相对变慢, 地雷进攻效率与僵尸同步
    let last = performance.now();
    function step(){
      try{
        if(!state.gameRunning || plant.dead){ cleanup(); return; }
        const now = performance.now();
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        const prevBx = bx;
        bx += POTATO_MINE_SPEED * gmSpeed * dt;
        mine.style.left = (bx - 15) + 'px';
        // 扫掠重叠碰撞: 爆弹从 prevBx 移动到 bx, 与同行僵尸命中区间重叠即爆炸(高速下防穿模漏判), 取最靠前(最小x)的一个
        let hit = null;
        for(const z of state.zombies){
          if(z.dead || z.row !== row) continue;
          const bLo = bx - colW * 0.5, bHi = bx + colW * 0.5;
          const zLo = z.x - colW * 0.5, zHi = z.x + colW * 0.5;
          if(!(bHi < zLo || bLo > zHi)){ if(!hit || z.x < hit.x) hit = z; }
        }
        if(hit){ explodeAt(hit.x); return; }
        if(bx > maxX){ cleanup(); return; }
        requestAnimationFrame(step);
      }catch(e){ cleanup(); }
    }
    function explodeAt(impactX){
      mine.classList.add('mine-burst');                      // 命中爆闪
      const killed = [];
      for(const z of state.zombies){
        if(z.dead || z.row !== row) continue;
        if(Math.abs(z.x - impactX) <= colW){                 // 1格范围(同行)溅射
          const zTop = z.el ? z.el.offsetTop + 18 : 0;
          dealDamage(plant, z, dmg);
          spawnDamageNumber(z.x, zTop, dmg, 'crit');   // 爆弹伤害飘字: 红色
          if(z.hp <= 0 && !z.dead){ killZombie(z, plant); killed.push(z); }
        }
      }
      // 狂轰滥炸: 击杀则连锁投下半伤害爆弹(从被击杀处继续向前, 4级额外 +50 不受减半影响)
        if(killed.length && plant.carpetBomb){
          const nextDmg = Math.floor(dmg / 2) + (plant.carpetBonus || 0);
          if(nextDmg > 0){
            // 狂轰滥炸连锁弹从本体发射(与主线一致), 向前飞行追击下一个僵尸
            setTimeout(() => {
              if(!plant.dead && state.gameRunning) dropPotatoBomb(plant, row, nextDmg);
            }, 160);
          }
        }
      setTimeout(() => { if(mine.parentNode) mine.parentNode.removeChild(mine); }, 200);
    }
    function cleanup(){ if(mine.parentNode) mine.parentNode.removeChild(mine); }
    requestAnimationFrame(step);
  }catch(e){}
}

// 土豆地雷(斗蛐蛐)死亡: 秒杀四周1格内所有僵尸
function potatoDeathBlast(plant){
  try{
    const lawn = document.getElementById('lawn');
    const lr = gRect(lawn);
    const colW = (lr.width - 160) / COLS, rowH = lr.height / ROWS;
    const cx = 160 + (plant.col || 0) * colW + colW / 2;
    const mine = document.createElement('div');
    mine.className = 'cricket-mine';
    mine.style.left = (cx - 14) + 'px';
    mine.style.top = (plant.row * rowH + rowH - 34) + 'px';
    lawn.appendChild(mine);
    setTimeout(() => { if(mine.parentNode) mine.parentNode.removeChild(mine); }, 320);
    for(const z of state.zombies){
      if(z.dead) continue;
      if(Math.abs(z.row - plant.row) <= 1 && Math.abs(z.x - cx) <= colW){
        if(!z.dead) killZombie(z, plant); // 秒杀
      }
    }
    cricketFloat(plant, '💥 不死图腾');
  }catch(e){}
}

function killZombie(z, killerPlant){
  if(z.dead) return;
  z.dead = true;
  state.zombiesKilled++;
  // 赏金猎人(豌豆): 拥有该技能后, 每击杀一个僵尸增加攻击力(累计上限 +30)
  if(state.gameMode === 'cricket' && killerPlant && killerPlant.bountyHunter){
    const room = Math.max(0, BOUNTY_HUNTER_MAX_BONUS - (killerPlant.bountyBonus || 0));
    const inc = Math.min(killerPlant.bountyPerKill || 0, room);
    if(inc > 0){
      killerPlant.damage += inc;
      killerPlant.bountyBonus += inc;
    }
  }
  // 盲盒僵尸: 击杀不增加经验, 但在"死亡位置"冒出一个真实僵尸(同位置, 不再是底线刷新)
  // 例外: 被食人花吞噬的盲盒(consumedByChomper)→ 不再开出内部僵尸, 且按正常击杀给予经验
  if(z.isBlindbox && !z.consumedByChomper && state.gameMode === 'cricket'){
    const deathX = z.x;
    setTimeout(() => {
      if(state.gameRunning && cricketRowAlive[z.row] !== false){
        let revealed = null;
        if(z.isBigBox){
          revealed = spawnEliteZombie(z.row, deathX); // 大盲盒: 开出精英僵尸(红血/蓝攻/速移)
        } else {
          const t = z.innerType || pickCricketZombie(cricketTimer); // 盲盒内部类型(含巨人), 否则随机
          revealed = spawnZombie(t, z.row, true, deathX); // forceNormal: 真实僵尸, 在盲盒死亡位置生成
        }
        inheritBlindboxEffects(z, revealed); // 开出的僵尸继承盲盒的所有状态效果
      }
    }, 250);
    } else {
      // 击杀经验奖励
      if(killerPlant && !killerPlant.dead && PLANT_UPGRADES[killerPlant.type]){
        const isGiant = (z.type === 'giant') || (z.isBlindbox && z.innerType === 'giant');
        const total = zombieKillXP(z) * ((isGiant && state.gameMode === 'cricket') ? 3 : 1); // 击杀巨人经验翻三倍(含盲盒内巨人)
        // 同行其他植物 (排除击杀者本身): 仅纳入"未达满级"的同伴
        const others = [];
        const rowPlants = state.grid[killerPlant.row];
        if(rowPlants){
          for(const stack of rowPlants){
            for(const p of stack){
              if(p && p !== killerPlant && !p.dead && PLANT_UPGRADES[p.type] && !p.levelReady && !p.crossLevelReady){
                const capped = (state.gameMode === 'cricket') && (p.level >= (p.cricketLeveled ? CRICKET_NEW_MAX : CRICKET_MAX_LEVEL));
                if(!capped) others.push(p);
              }
            }
          }
        }
        // 击杀者已达满级: 本次击杀产生的 100% 经验全部由同行其余未达满级的植物平均平分
        const killerCapped = (state.gameMode === 'cricket') && (killerPlant.level >= (killerPlant.cricketLeveled ? CRICKET_NEW_MAX : CRICKET_MAX_LEVEL));
        if(killerCapped){
          if(others.length){
            const share = total / others.length;
            for(const p of others) awardXP(p, share);
          }
        } else {
          // 击杀者未达满级: 击杀者获得 60%, 其余 40% 由同行其他植物平分
          awardXP(killerPlant, total * 0.6);
          if(others.length){
            const share = (total * 0.4) / others.length;
            for(const p of others) awardXP(p, share);
          }
        }
      }
    }
  // 巨人僵尸死亡: 若半血时还未投掷小鬼(被瞬杀跳过半血触发), 则补投一只
  if(z.type === 'giant' && state.gameRunning && !z.giantThrew){
    const gx = z.x;
    setTimeout(() => {
      if(state.gameRunning && cricketRowAlive[z.row] !== false){ spawnImp(z.row, gx - 10); }
    }, 200);
  }
  // 淡出动画
  z.el.style.transition = 'all .5s ease-out';
  z.el.style.opacity = '0';
  z.el.style.transform = 'translateY(20px) rotate(90deg)';
  setTimeout(() => {
    if(z.el.parentNode) z.el.parentNode.removeChild(z.el);
  }, 500);
  // 从数组移除
  setTimeout(() => {
    const idx = state.zombies.indexOf(z);
    if(idx >= 0) state.zombies.splice(idx, 1);
  }, 600);
}

// 跳舞僵尸召唤小鬼僵尸
function summonImps(dancer){
  const count = 3;
  for(let i = 0; i < count; i++){
    const row = Math.max(0, Math.min(ROWS - 1, dancer.row + (i - 1)));
    spawnImp(row, dancer.x - 20 - i * 15);
  }
}

// 生成小鬼僵尸（在指定位置）
function spawnImp(row, x){
  const cfg = ZOMBIES.imp;
  const lawn = document.getElementById('lawn');
  const lawnRect = gRect(lawn);
  const rowHeight = lawnRect.height / ROWS;

  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.width = '78px';
  el.style.height = '120px';
  el.style.zIndex = '150';
  el.innerHTML = createZombieHTML('imp');

  // 添加血量条
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar';
  hpBar.innerHTML = '<div class="hp-fill high"></div>';
  el.appendChild(hpBar);

  const zombie = {
    type: 'imp',
    row: row,
    x: x,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed * (currentLevelConfig && (currentLevelConfig.special === 'fast' || currentLevelConfig.special === 'apocalypse') ? 1.3 : 1),
    damage: cfg.damage,
    slowed: false,
    slowTimer: 0,
    frozen: false,
    frozenTimer: 0,
    chill: 0,
    chillCd: 0,
    chillImmune: 0,
    chillEl: null,
    eating: false,
    eatTarget: null,
    el: el,
    dead: false,
    special: null,
    vaulted: false,
    angered: false,
    summonTimer: 999,
  };

  el.style.left = zombie.x + 'px';
  el.style.top = (row * rowHeight + rowHeight - 120) + 'px';
  lawn.appendChild(el);
  state.zombies.push(zombie);
}

// ============================================================
// 投射物
// ============================================================
function updateProjectile(p, dt){
  const lawn = document.getElementById('lawn');
  // === 投掷类子弹: 抛物线飞向落点 ===
  if(p.lob){
    const dir = p.targetX > p.startX ? 1 : -1;
    p.x += p.speed * dt * dir;
    const prog = Math.min(1, Math.abs(p.x - p.startX) / p.dist);
    const arcH = 70;
    p.y = p.startY + (p.targetY - p.startY) * prog - Math.sin(prog * Math.PI) * arcH;
    p.el.style.left = p.x + 'px';
    p.el.style.top = p.y + 'px';

    if(prog >= 1){
      // 落点伤害
      const radius = p.splash ? p.splashRadius : 0;
      for(const z of state.zombies){
        if(z.dead || z.row !== p.row) continue;
        const hitRange = 30 + radius * 60;
          if(Math.abs(z.x - p.targetX) < hitRange){
            dealDamage(p.owner, z, p.damage);
          z.el.querySelector('.zombie').classList.add('damaged');
          setTimeout(() => {
            if(z.el.querySelector('.zombie'))
              z.el.querySelector('.zombie').classList.remove('damaged');
          }, 150);
          // 黄油定身
          if(p.butter){
            z.buttered = true;
            z.butterTimer = 3;
            z.el.querySelector('.zombie').classList.add('buttered');
          }
          // 冰冻西瓜技能: 完全冻结
          if(p.freezeShot && !z.frozen){
            z.frozen = true;
            z.frozenTimer = p.freezeDuration || 1;
            z.el.querySelector('.zombie').classList.add('frozen');
            z.el.querySelector('.zombie').classList.remove('slowed');
          }
          if(z.hp <= 0) killZombie(z, p.owner);
        }
      }
      // 西瓜溅射视觉
      if(p.splash){
        const spl = document.createElement('div');
        spl.className = 'splash';
        spl.style.left = p.targetX + 'px';
        spl.style.top = p.targetY + 'px';
        lawn.appendChild(spl);
        setTimeout(() => { if(spl.parentNode) spl.parentNode.removeChild(spl); }, 400);
      }
      p.dead = true;
    }
    return;
  }

  p.x += p.speed * dt;
  p.el.style.left = p.x + 'px';

  // 出界
  const lawnRect = gRect(lawn);
  if(p.x > lawnRect.width){
    p.dead = true;
    return;
  }

  // === 火炬树桩: 豌豆经过后变成火豆/寒火豆 (伤害增幅可叠加) ===
  {
    const colWidth = (lawnRect.width - 160) / COLS;
    const pCol = Math.floor((p.x - 160) / colWidth);
    if(pCol >= 0 && pCol < COLS && state.grid[p.row] && state.grid[p.row][pCol]){
      const tw = state.grid[p.row][pCol].find(pl => pl && !pl.dead && pl.type === 'torchwood');
      if(tw){
        let converted = false;
        // 寒焰技能: 豌豆变寒火豆 (伤害增幅+减速, 可与火豆叠加)
        if(tw.frostFlame && !p.frosted){
          p.frosted = true;
          p.damage *= (tw.frostMult || 2);
          p.frostSlow = true;
          p.frostSlowDuration = tw.frostSlowDuration || 2;
          p.el.classList.remove('pea', 'snow', 'fire');
          p.el.classList.add('frostfire');
          converted = true;
        }
        // 普通火豆 (伤害x2, 失去冰冻)
        else if(!tw.frostFlame && !p.fired){
          p.fired = true;
          p.damage *= (tw.fireMult || 2);
          p.slow = false;
          p.freezeShot = false;
          p.el.classList.remove('pea', 'snow');
          p.el.classList.add('fire');
          converted = true;
        }
        if(converted){
          // 溅射火焰技能
          if(tw.fireSplash){
            p.fireSplash = true;
            p.fireSplashRadius = tw.fireSplashRadius || 1;
          }
          // 火豆/寒火豆更大
          const size = Math.round(14 * 1.35);
          p.el.style.width = size + 'px';
          p.el.style.height = size + 'px';
          p.el.style.marginLeft = ((14 - size) / 2) + 'px';
          p.el.style.marginTop = ((14 - size) / 2) + 'px';
        }
      }
    }
  }

  // 碰撞检测
  for(const z of state.zombies){
    if(z.dead || z.row !== p.row) continue;
    const zombieX = z.x;
    if(Math.abs(p.x - zombieX) < 30){
      // 穿透子弹: 跳过已命中的僵尸
      if(p.pierce > 0 && p.hitSet.has(z)) continue;
      // 命中
      let hitDmg = p.damage;
      // 突出豌豆: 对近距离敌人造成更多伤害(越近倍率越高, 最高 prominentMax 倍)
      if(p.owner && p.owner.prominentPea){
        const colWidth = (lawnRect.width - 160) / COLS;
        const plantX = 160 + p.owner.col * colWidth + colWidth * 0.5;
        const maxDist = Math.max(1, lawnRect.width - plantX);
        const ratio = Math.min(1, Math.max(0, (z.x - plantX) / maxDist));
        hitDmg = p.damage * (p.owner.prominentMax + (1 - p.owner.prominentMax) * ratio);
      }
      dealDamage(p.owner, z, hitDmg);
      // 阳光突击子弹: 命中施加1层光标
      if(p.applyCursor) addCursor(z, 1);
      // 伤害闪烁
      z.el.querySelector('.zombie').classList.add('damaged');
      setTimeout(() => {
        if(z.el.querySelector('.zombie'))
          z.el.querySelector('.zombie').classList.remove('damaged');
      }, 150);

      // 减速效果 (寒冰射手) + 叠加寒意
      if(p.slow) applySlowToZombie(z, 0.5, 3, p.owner);
      // 冰冻射线技能: 完全冻结
      if(p.freezeShot && !z.frozen){
        z.frozen = true;
        z.frozenTimer = p.freezeDuration || 1;
        z.el.querySelector('.zombie').classList.add('frozen');
        z.el.querySelector('.zombie').classList.remove('slowed');
      }
      // 寒火豆减速 (火炬树桩-寒焰技能): 刷新减速并叠加寒意
      if(p.frostSlow) applySlowToZombie(z, 0.5, p.frostSlowDuration || 2, p.owner);

      // 火焰子弹(普通火豆): 清空命中僵尸及其周围寒意僵尸的寒意, 并造成寒意层数×10 的 AOE 伤害
      // 注意: 寒火豆(p.frostSlow)只叠加寒意、不清除寒意, 故排除之
      if(p.fired && !p.frostSlow) fireClearChill(z, p.owner);

      // 溅射火焰 (火炬树桩技能): 对附近僵尸造成溅射伤害
      if(p.fireSplash){
        const splashR = p.fireSplashRadius || 1;
        const colWidth = (lawnRect.width - 160) / COLS;
        const splashDmg = p.damage * 0.5;
        for(const z2 of state.zombies){
          if(z2.dead || z2.row !== p.row || z2 === z) continue;
          if(Math.abs(z2.x - z.x) < 30 + splashR * colWidth){
            dealDamage(p.owner, z2, splashDmg);
            z2.el.querySelector('.zombie').classList.add('damaged');
            setTimeout(() => {
              if(z2.el.querySelector('.zombie'))
                z2.el.querySelector('.zombie').classList.remove('damaged');
            }, 150);
            if(z2.hp <= 0) killZombie(z2, p.owner);
          }
        }
        // 溅射视觉
        const spl = document.createElement('div');
        spl.className = 'splash';
        spl.style.left = z.x + 'px';
        spl.style.top = z.el.offsetTop + 'px';
        spl.style.background = 'radial-gradient(circle,rgba(255,152,0,0.6),transparent)';
        lawn.appendChild(spl);
        setTimeout(() => { if(spl.parentNode) spl.parentNode.removeChild(spl); }, 300);
      }

      // 穿透: 继续飞行但消耗穿透次数
      if(p.pierce > 0){
        p.hitSet.add(z);
        p.pierce--;
        if(p.pierce <= 0) p.dead = true;
      } else {
        p.dead = true;
      }

      if(z.hp <= 0) killZombie(z, p.owner);
      if(p.dead) break;
    }
  }
}

// ============================================================
// 胜负
// ============================================================
function winGame(){
  state.gameRunning = false;
  // 挑战模式: 发放徽章 + 金币奖励 (按阶段)
  if(state.gameMode === 'challenge'){
    const ch = getChallengeCfg();
    if(ch){
      const stage = currentChallengeStage || 1;
      const prevLv = getChallengeBadgeLevel(ch.id);
      const isNew = stage > prevLv; // 首次通过该阶段 → 徽章升级
      const coins = isNew ? ch.rewardCoins * stage : Math.floor(ch.rewardCoins * 0.2);
      if(isNew) progress.challengeBadges[ch.id] = stage;
      progress.coins += coins;
      saveProgress();
      showChallengeReward(ch, coins, stage, isNew);
    }
    return;
  }
  // 计算星级
  const stars = calculateStars();
  // 更新最佳记录
  const prevStars = progress.levelStars[progress.currentLevel] || 0;
  if(stars > prevStars){
    progress.levelStars[progress.currentLevel] = stars;
  }
  // 计算金币奖励
  const coins = calculateCoinReward(stars);
  progress.coins += coins;
  saveProgress();
  // 显示奖励弹窗
  showReward(stars, coins);
}

function loseGame(){
  state.gameRunning = false;
  if(state.gameMode === 'endless'){
    // 保存最高轮数
    if(state.endlessRound > (progress.endlessHighScore || 0)){
      progress.endlessHighScore = state.endlessRound;
      saveProgress();
    }
    document.getElementById('msg-title').textContent = '💀 无尽模式结束';
    document.getElementById('msg-text').textContent = '你坚持到了第 ' + state.endlessRound + ' 轮！再接再厉。';
    document.getElementById('msg-btn').textContent = '重新挑战';
    document.getElementById('msg-btn').onclick = restartGame;
  } else if(state.gameMode === 'challenge'){
    const ch = getChallengeCfg();
    document.getElementById('msg-title').textContent = '💀 挑战失败';
    document.getElementById('msg-text').textContent = (ch ? '「' + ch.name + '」' : '挑战') + '未能完成，调整策略再试一次吧！';
    document.getElementById('msg-btn').textContent = '重新挑战';
    document.getElementById('msg-btn').onclick = restartGame;
  } else {
    document.getElementById('msg-title').textContent = '💀 游戏结束';
    document.getElementById('msg-text').textContent = '僵尸吃掉了你的脑子！再来一次吧。';
    document.getElementById('msg-btn').textContent = '重新挑战';
    document.getElementById('msg-btn').onclick = restartGame;
  }
  document.getElementById('message-overlay').style.display = 'flex';
}

// ============================================================
// 斗蛐蛐模式 (Cricket Battle)
// 每行最多5个植物 = 一个队伍；布阵后源源不断僵尸来袭，频率递增；
// 某行植物全灭则该行不再出现僵尸；只剩一行时结算，幸存行入英灵殿。
// ============================================================
function fmtTime(s){
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
}

function buildCricketGrid(){
  const lawn = document.getElementById('lawn');
  state.grid = [];
  for(let r = 0; r < ROWS; r++){
    state.grid[r] = [];
    for(let c = 0; c < COLS; c++){
      state.grid[r][c] = [];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r; cell.dataset.col = c;
      cell.addEventListener('click', () => onCellClick(r, c));
      cell.addEventListener('contextmenu', (e) => onCellRightClick(r, c, e));
      cell.addEventListener('mouseenter', () => onCellHover(r, c, true));
      cell.addEventListener('mouseleave', () => onCellHover(r, c, false));
      lawn.appendChild(cell);
    }
  }
  // 割草机 (某队被突破时清场一次)
  const extraMowers = getExtraMowers();
  const lawnRect0 = gRect(lawn);
  const rowH = lawnRect0.height / ROWS;
  for(let r = 0; r < ROWS; r++){
    for(let m = 0; m < 1 + extraMowers; m++){
      const mower = document.createElement('div');
      mower.className = 'lawnmower';
      mower.innerHTML = '<div class="blade"></div><div class="body"></div><div class="wheel left"></div><div class="wheel right"></div>';
      mower.style.top = (r * rowH + rowH - 52) + 'px';
      mower.style.left = (m * -45) + 'px';
      mower.style.display = m > 0 ? 'none' : 'block';
      lawn.appendChild(mower);
      let statEl = null;
      if(m === 0){
        statEl = document.createElement('div');
        statEl.className = 'mower-stat';
        statEl.textContent = 'DPS 0  总伤 0';
        mower.appendChild(statEl);
      }
      state.lawnmowers.push({el:mower, row:r, used:false, active:false, x:0, slot:m, statEl:statEl});
    }
  }
}

function placePlantObject(r, c, type){
  const cfg = PLANTS[type];
  const upgradedHp = getPlantHp(cfg.hp);
  const plant = {
    type: type, row: r, col: c, name: null,
    hp: upgradedHp, maxHp: upgradedHp,
    actionTimer: cfg.actionInterval || 0, attackInterval: cfg.actionInterval || 0,
    shots: cfg.shots || 1, armed: false, armTimer: cfg.armTime || 0,
    el: null, digesting: false, digestTimer: 0,
    damage: cfg.damage ? getPlantDamage(cfg.damage) : cfg.damage,
    level: 1, xp: 0, xpToNext: xpToNextFor(1, type), levelReady: false, kills: 0,
    statLevels: {}, skills: {}, crossSkills: {},
    crossLevelReady: false, crossTimer: 0,
    dmgDealt: 0, aliveTime: 0,
  };
  // 继承配置中的可选战斗字段 (斗蛐蛐专属植物依赖)
  for(const _k of ['alwaysFire','fireMult','slow','freezeShot','freezeDuration','bulletSpeed','pierce','armorPierce','sunMult','sunDoubleMult','sunAmount','splash','splashRadius','butterChance','range','rangeBonus','blocksVault','ember','projectile','chainCount','poisonDps','poisonTime','poisonRange','healAmount','healRange','freezeRange','shieldDR','shieldRange']){
    if(cfg[_k] !== undefined) plant[_k] = cfg[_k];
  }
  const wrapper = document.createElement('div');
  wrapper.className = 'plant-wrapper';
  wrapper.innerHTML = createPlantHTML(type);
  const hpBar = document.createElement('div');
  hpBar.className = 'hp-bar'; hpBar.innerHTML = '<div class="hp-fill high"></div>';
  wrapper.appendChild(hpBar);
  const lvlDiv = document.createElement('div');
  lvlDiv.className = 'plant-level'; lvlDiv.textContent = 'Lv.1';
  wrapper.appendChild(lvlDiv);
  const xpBar = document.createElement('div');
  xpBar.className = 'xp-bar'; xpBar.innerHTML = '<div class="xp-fill"></div>';
  wrapper.appendChild(xpBar);
  const devDiv = document.createElement('div');
  devDiv.className = 'devour-level';
  devDiv.textContent = '吞0';
  devDiv.style.display = 'none';
  wrapper.appendChild(devDiv);
  plant.el = wrapper;
  updateDevourLevel(plant);
  const cells = document.querySelectorAll('.cell');
  const idx = r * COLS + c;
  cells[idx].appendChild(wrapper);
  state.grid[r][c].push(plant);
  return plant;
}

// ============================================================
// 斗蛐蛐植物固定升级系统 (0-5级, 每级增益/技能固定, 不再随机, 不再随机加属性)
//  - levels[0] 为初始0级基准(base 覆盖), 不额外应用效果
//  - levels[1..5] 为达到该等级时应用的固定效果
//  - 仅在此登记的植物(豌豆射手/向日葵/坚果墙)走新系统; 其余(高坚果/火炬/樱桃/辣椒/土豆等)仍走旧随机升级系统
//  - 不影响非斗蛐蛐模式(相关字段仅在斗蛐蛐初始化时赋值)
// ============================================================
const CRICKET_LEVELS = {
  peashooter: {
    base: { damage: 5, attackInterval: 1.5 },
    levels: [
      null, // 0级 = base, 不应用额外效果
      { desc:'豌豆攻击力 → 10', apply: p => { p.damage = 10; } },
      { desc:'获得「突出豌豆」：对近距离敌人最多造成150%伤害', apply: p => { p.prominentPea = true; p.prominentMax = 1.5; } },
      { desc:'「突出豌豆」最多造成200%伤害', apply: p => { p.prominentMax = 2.0; } },
      { desc:'获得「赏金猎人」：攻速满时每击杀1僵尸 +0.5 攻击力', apply: p => { p.bountyHunter = true; p.bountyPerKill = 0.5; } },
      { desc:'「赏金猎人」每击杀 +1 攻击力', apply: p => { p.bountyPerKill = 1; } },
    ]
  },
  sunflower: {
    base: {},
    levels: [
      null, // 0级 = base, 不应用额外效果
      { desc:'光标施加间隔 → 4秒', apply: p => { p.cursorInterval = 4; } },
      { desc:'光标施加间隔 → 3秒', apply: p => { p.cursorInterval = 3; } },
      { desc:'获得「阳光突击」：每5秒向前发射阳光子弹，命中僵尸施加1层光标', apply: p => { p.sunAssault = true; p.sunAssaultInterval = 5; p.sunAssaultTimer = 0; } },
      { desc:'「阳光突击」发射间隔 → 4秒', apply: p => { p.sunAssaultInterval = 4; } },
      { desc:'「阳光突击」发射间隔 → 3秒', apply: p => { p.sunAssaultInterval = 3; } },
    ]
  },
  wallnut: {
    base: { hp: 2000 },
    levels: [
      null, // 0级 = base(2000生命), 不攻击
      { desc:'最大生命 → 3000', apply: p => { p.maxHp = p.hp = 3000; } },
      { desc:'最大生命 → 4000', apply: p => { p.maxHp = p.hp = 4000; } },
      { desc:'获得「韧性坚果」：可扛巨人砸击，每次受砸仅损失1000生命', apply: p => { p.toughNut = true; p.smashDamage = 1000; } },
      { desc:'获得每秒 20 点生命回复', apply: p => { p.regenFlat = 20; } },
      { desc:'「韧性坚果」受砸减血 → 500，且每5分钟为全行植物附加300点不可叠加护盾（升级瞬间立即给全行护盾）', apply: p => { p.smashDamage = 500; p.rowShield = true; p.shieldTimer = 300; applyRowShield(p.row, 300); } },
    ]
  },
  snowpea: {
    base: { damage: 5, attackInterval: 1.5 },
    levels: [
      null, // 0级 = base, 一次发射两发寒冰豌豆(每发5, 命中减速); 攻击伤害已下调至原值25%(20→5)
      { desc:'寒冰豌豆伤害 → 7.5', apply: p => { p.damage = 7.5; } }, // 下调至原值25%(30→7.5), 仅影响攻击伤害, 技能/攻速/射程不变
      { desc:'解锁「寒冰激光」：每发射两发寒冰豌豆，发射1发寒冰激光（伤害4，仅减速，全行）', apply: p => { p.iceLaser = true; p.laserDamage = 4; p.laserCount = 1; } },
      { desc:'「寒冰激光」每轮发射 2 发（覆盖更广减速）', apply: p => { p.laserCount = 2; } },
      { desc:'「寒冰激光」减速更持久（减速时长×2，不再附加寒意）', apply: p => { p.laserSlowDur = (p.laserSlowDur || 3) * 2; } },
      { desc:'「寒冰激光」减速更强（减速幅度提升，不再附加寒意）', apply: p => { p.laserSlowMult = (p.laserSlowMult || 0.5) * 0.8; } },
    ]
  },
  chomper: {
    base: { hp: 300 },
    levels: [
      null, // 0级 = base: 吞噬秒杀普通/盲盒僵尸, 初始攻击距离3格, 消化12秒, 不可秒杀巨人
      { desc:'吞噬等级上限 → 15，生命 +500，解锁「逆天之咬」：可啃咬巨人，每次造成 吞噬等级×10 伤害（攻速0.2秒/次）', apply: p => { p.devourCap = 15; p.maxHp += 500; p.hp += 500; p.nitiantBite = true; p.biteInterval = 0.2; } },
      { desc:'吞噬等级上限 → 20', apply: p => { p.devourCap = 20; } },
      { desc:'吞噬等级上限 → 25', apply: p => { p.devourCap = 25; } },
      { desc:'「逆天之咬」有 5% 几率秒杀巨人', apply: p => { p.biteInstakill = 0.05; } },
      { desc:'吞噬等级上限 → 30，「逆天之咬」攻速 → 0.1秒/次', apply: p => { p.devourCap = 30; p.biteInterval = 0.1; } },
    ]
  },
  repeater: {
    base: { damage: 20, attackInterval: 1.5, shots: 2 },
    levels: [
      null, // 0级 = base: 每1.5秒发射2发20伤害豌豆, 元素大师20%触发(火豆/冰豆/寒火豆)
      { desc:'「元素大师」触发概率 → 33%', apply: p => { p.elementChance = 0.33; } },
      { desc:'普攻一次射出 3 发豌豆', apply: p => { p.shots = 3; } },
      { desc:'「元素大师」触发概率 → 50%', apply: p => { p.elementChance = 0.50; } },
      { desc:'解锁「炎豆」：4种元素豆概率相等（炎豆=火豆2倍伤害）', apply: p => { p.elementTypes = 4; } },
      { desc:'「元素大师」触发概率 → 100%', apply: p => { p.elementChance = 1.0; } },
    ]
  },
  gatling: {
    base: { damage: 15, attackInterval: 2, shots: 4 },
    levels: [
      null, // 0级 = base: 每2秒发射4发15伤害豌豆, 第4发固定冰豆
      { desc:'攻击间隔 → 1.9 秒', apply: p => { p.attackInterval = 1.9; } },
      { desc:'第4发改为「寒火豆」(伤害×2 + 减速 + 清寒意)', apply: p => { p.lastShotElement = 'frostfire'; } },
      { desc:'解锁「火力全开」：攻击 3% 概率触发大招，3秒倾泻 80 颗豌豆（含20颗寒火豆）', apply: p => { p.firepower = true; p.ultimateChance = 0.03; } },
      { desc:'每次释放大招，大招概率永久 +2%（上限 15%）', apply: p => { p.ultimateScales = true; p.ultimateChanceStep = 0.02; p.ultimateChanceCap = 0.15; } },
      { desc:'大招豌豆 → 120 颗（含 30 颗寒火豆）', apply: p => { p.ultimateCount = 120; p.ultimateFrost = 30; } },
    ]
  },
  potatomine: {
    base: { hp: 1200, bombDamage: 200, attackInterval: 10 },
    levels: [
      null, // 0级 = base: 每10秒向本行最前僵尸投下爆弹, 1格AOE 200 伤害; 死亡时秒杀周围1格僵尸; 本体被接近不爆炸
      { desc:'爆弹伤害 → 300', apply: p => { p.bombDamage = 300; } },
      { desc:'攻击间隔 → 9 秒', apply: p => { p.attackInterval = 9; } },
      { desc:'解锁「狂轰滥炸」：爆弹击杀僵尸时连锁投下减半伤害的爆弹，再次击杀则继续连锁', apply: p => { p.carpetBomb = true; } },
      { desc:'「狂轰滥炸」连锁爆弹额外获得 +50 固定伤害（不受减半影响）', apply: p => { p.carpetBonus = 50; } },
      { desc:'获得 1 次复活机会；复活后变为 4 级，可再次升级重新获得复活', apply: p => { p.reviveCharges = (p.reviveCharges || 0) + 1; } },
    ]
  },
};

// 新系统植物升级所需经验(随等级递增): 0→1需25, 1→2需50 ... 4→5需125
// 无法攻击植物升级所需经验降为普通的 25% (NON_ATTACKER_XP_MULT); 叠加斗蛐蛐专属升级折扣 CRICKET_XP_DISCOUNT
function cricketNewXpToNext(plant){
  // 土豆地雷专属: 4级升5级(飞升「不死图腾」)所需经验(已叠加全局 -25% 折减)
  if(plant && plant.type === 'potatomine' && plant.level === 4) return Math.max(1, Math.round(10 * CRICKET_XP_GLOBAL_MULT * CRICKET_XP_EXTRA_MULT));
  const level = (plant && plant.level != null) ? plant.level : 0;
  const mult = (plant && isNonAttacker(plant.type)) ? NON_ATTACKER_XP_MULT : 1;
  const disc = (level >= 0 && level < CRICKET_XP_DISCOUNT.length) ? CRICKET_XP_DISCOUNT[level] : 1;
  return Math.max(1, Math.round(xpCurveCost(level) * mult * disc * CRICKET_XP_GLOBAL_MULT * CRICKET_XP_EXTRA_MULT));
}

// 斗蛐蛐模式: 将非攻击/一次性植物改造为持续战斗单位
function cricketifyPlant(plant){
  // 新固定升级系统: 已登记的植物走0-5级固定升级, 初始0级
  const def = CRICKET_LEVELS[plant.type];
  if(def){
    plant.level = 0;
    plant.cricketLeveled = true;
    if(def.base){
      if(def.base.damage !== undefined) plant.damage = def.base.damage;
      if(def.base.attackInterval !== undefined) plant.attackInterval = def.base.attackInterval;
      if(def.base.hp !== undefined){ plant.maxHp = def.base.hp; plant.hp = def.base.hp; }
    if(def.base.bombDamage !== undefined) plant.bombDamage = def.base.bombDamage;
    }
    plant.atkSpeedReduction = 0;   // 每次攻击减少0.01s攻击间隔(豌豆射手无上限, 其它封顶 CRICKET_ATK_SPEED_CAP)
    plant.atkSpeedUncapped = (plant.type === 'peashooter'); // 豌豆射手: 攻速增加取消上限
    plant.prominentPea = false;     // 突出豌豆: 近距离造成更多伤害
    plant.prominentMax = 1;         // 突出豌豆最大倍率
    plant.bountyHunter = false;     // 赏金猎人: 攻速满时击杀加攻击力
    plant.bountyPerKill = 0;        // 赏金猎人每次击杀增加攻击力
    plant.bountyBonus = 0;         // 赏金猎人累计已加攻击力(封顶 BOUNTY_HUNTER_MAX_BONUS=30)
    plant.xp = 0;
    plant.xpToNext = cricketNewXpToNext(plant);
    plant.levelReady = false;
    plant.crossLevelReady = false;
    if(plant.el){
      const lvlDiv = plant.el.querySelector('.plant-level');
      if(lvlDiv) lvlDiv.textContent = 'Lv.0';
    }
    // 类型专属初始化 (斗蛐蛐形态动作与状态)
    if(plant.type === 'sunflower'){
      plant.action = 'cricket_sunflower';
      plant.cricketSunflower = true;
      plant.cursorInterval = 5;   // 全行施加光标间隔(秒)
      plant.cursorTimer = 0;
      plant.sunAssault = false;   // 阳光突击(3级解锁)
      plant.sunAssaultInterval = 5;
      plant.sunAssaultTimer = 0;
    } else if(plant.type === 'wallnut'){
      plant.action = 'none';      // 纯防御, 不攻击
      plant.actionTimer = 999;
      plant.toughNut = false;     // 韧性坚果(3级解锁): 可扛巨人砸击
      plant.smashDamage = 1000;   // 每次砸击损失的生命(3-4级=1000, 5级=500)
      plant.regenFlat = 0;        // 每秒生命回复(4级=20)
      plant.rowShield = false;    // 全行护盾(5级解锁)
      plant.shieldTimer = 300;    // 护盾刷新间隔(秒)=5分钟
      plant.shieldHp = 0;
    } else if(plant.type === 'snowpea'){
      plant.action = 'shoot';
      plant.projectile = 'frostbolt';
      plant.slow = true;          // 寒冰豌豆命中减速
      plant.shots = 2;            // 一次发射两发寒冰豌豆
      plant.iceLaser = false;     // 寒冰激光(2级解锁)
      plant.laserDamage = 4;      // 寒冰激光基础伤害(2级解锁时仍为4; 攻击伤害下调后保持弱输出, 仅减速)
      plant.laserCount = 1;       // 每轮激光数量(5级→2)
      plant.laserSlowMult = 0.5;
      plant.laserSlowDur = 3;
      plant.laserChill = 0;       // 4级→2层寒意
    } else if(plant.type === 'chomper'){
      plant.action = 'cricket_chomp';
      plant.devourLevel = 0;
      plant.devourCap = 10;       // 0级初始吞噬上限 10
      plant.devourRangeBase = 1.5;  // 初始攻击距离 1.5 格
      plant.baseDigest = 12;      // 初始消化 12 秒
      plant.nitiantBite = false;  // 逆天之咬(1级解锁)
      plant.biteInstakill = 0;    // 逆天之咬秒杀巨人几率(4级=0.05)
      plant.biteInterval = 0.2;   // 逆天之咬攻速(秒/次; 原1.0, ×5=0.2; 5级=0.1)
      updateDevourLevel(plant);
    } else if(plant.type === 'repeater'){
      plant.action = 'shoot';
      plant.projectile = 'pea';
      plant.shots = 2;            // 0级: 一次发射 2 发
      plant.elementMaster = true; // 元素大师: 豌豆概率变为元素豆
      plant.elementChance = 0.20; // 0级触发概率 20%
      plant.elementTypes = 3;     // 0级: 火豆/冰豆/寒火豆 三种(概率相等)
    } else if(plant.type === 'gatling'){
      plant.action = 'shoot';
      plant.projectile = 'pea';
      plant.shots = 4;                 // 0级: 一次发射 4 发
      plant.lastShotElement = 'snow';  // 0级: 第4发固定为冰豆(减速)
      plant.firepower = false;         // 火力全开(3级解锁)
      plant.ultimateChance = 0.03;
      plant.ultimateCount = 80;
      plant.ultimateFrost = 20;
      plant.ultimateScales = false;
    }
  }
  const t = plant.type;
  // 防御性: 确保升级系统所需字段存在(非固定系统植物经 cricketifyPlant 改造, 仍走 generateUpgradeOptions 升级路径)
  plant.statLevels = plant.statLevels || {};
  plant.skills = plant.skills || {};
  if(t === 'tallnut'){
    // 高坚果 → 荆棘反伤 (对啃食自己的僵尸持续造成伤害)
    plant.action = 'cricket_thorns';
    plant.damage = 50;
    plant.attackInterval = 0.5;
    plant.actionTimer = 0;
  } else if(t === 'torchwood'){
    // 火炬树桩 → 火焰光环 (周围一格持续灼烧)
    plant.action = 'cricket_aura';
    plant.damage = 35;
    plant.attackInterval = 0.6;
    plant.actionTimer = 0;
  } else if(t === 'cherrybomb'){
    // 樱桃炸弹 → 持续范围爆炸 (不再一次性)
    plant.action = 'cricket_pulse';
    plant.damage = 130;
    plant.attackInterval = 1.0;
    plant.actionTimer = 0.5;
    plant.maxHp = plant.hp = 9999;
  } else if(t === 'jalapeno'){
    // 火爆辣椒 → 持续灼烧整行 (不再一次性)
    plant.action = 'cricket_rowfire';
    plant.damage = 70;
    plant.attackInterval = 0.5;
    plant.actionTimer = 0.3;
    plant.maxHp = plant.hp = 9999;
  } else if(t === 'potatomine'){
    // 土豆地雷 → 雷层机: 每10秒向本行最前僵尸投下爆弹(1格AOE伤害), 死亡时秒杀周围1格僵尸
    plant.action = 'cricket_minelayer';
    plant.armed = true;
    plant.actionTimer = 0;
    // hp / 爆弹伤害 / 攻击间隔由 CRICKET_LEVELS.potatomine.base 提供
    // 种下即变为出土(armed)形态
    const _mineEl = plant.el && plant.el.querySelector('.plant-potatomine');
    if(_mineEl) _mineEl.classList.add('armed');
  }
}

function countRowPlants(r){
  let n = 0;
  for(let c = 0; c < COLS; c++){
    for(const p of state.grid[r][c]){ if(p && !p.dead) n++; }
  }
  return n;
}

function enterCricketSetup(preset){
  currentChallengeIdx = -1;
  currentLevelConfig = { name:'斗蛐蛐', startSun:0, plants:[], special:null };
  state.gameMode = 'cricket';
  showScreen(null);
  resetGameState(); // 清空草坪, gameRunning=false
  buildCricketGrid();
  cricketSetup = true;
  cricketTimer = 0;
  cricketGraceT = 0;
  cricketEnded = false;
  cricketRowAlive = [true, true, true, true, true];
  cricketTeams = [];
  state.gameRunning = true; // 允许点击放置 (循环尚未启动)
  document.getElementById('lawn').style.bottom = '180px'; // 给底部提示条留空间, 避免挡住植物槽
  document.getElementById('sun-counter').style.display = 'none';
  document.getElementById('wave-info').style.display = 'none';
  document.getElementById('cricket-timer').style.display = 'none';
  document.getElementById('seedbar').style.display = '';
  document.getElementById('cricket-setup-banner').style.display = 'flex';
  renderCricketSeedbar();
  // 从英灵殿带入预置队伍: 作为"待部署整队", 由玩家点击某行放置(可部署多支不同队伍)
  cricketPendingTeam = null;
  if(preset && Array.isArray(preset) && preset.length){
    cricketPendingTeam = preset.slice();
  }
  updateCricketSetupUI();
  updateDeployTray();
}

function renderCricketSeedbar(){
  const seedbar = document.getElementById('seedbar');
  seedbar.innerHTML = '';
  // 斗蛐蛐模式: 只保留盲盒类植物(随机盒子🎁 / 斗蛐蛐大盲盒🎁★), 取消其它所有植物栏位
  for(const type of CRICKET_PLANTS){
    if(!PLANTS[type].isBox) continue;
    const cfg = PLANTS[type];
    const boxIcon = type === 'randombox' ? '🎁' : '🎁★';
    const slot = document.createElement('div');
    slot.className = 'seed-slot';
    slot.dataset.plant = type;
    slot.innerHTML = '<div class="seed-icon">' + createPlantHTML(type) + '</div>' +
      '<div class="cost">' + boxIcon + '</div>' +
      '<div class="cooldown-overlay" style="height:0%"></div>';
    slot.addEventListener('click', () => { state.selectedPlant = type; updateSeedbarUI(); });
    seedbar.appendChild(slot);
    state.cooldowns[type] = 0;
  }
  // 默认选中随机盒子, 玩家可点击"斗蛐蛐大盲盒"切换
  state.selectedPlant = 'randombox';
  updateSeedbarUI();
}

function updateCricketSetupUI(){
  let ready = true;
  const rowNames = ['①', '②', '③', '④', '⑤'];
  let html = '';
  for(let r = 0; r < ROWS; r++){
    const n = countRowPlants(r);
    if(n < 1) ready = false;
    html += rowNames[r] + '队 ' + n + '/' + CRICKET_ROW_CAP + '　';
  }
  document.getElementById('cricket-progress').innerHTML = html;
  document.getElementById('cricket-start-btn').disabled = !ready;
  document.getElementById('cricket-msg').textContent = ready ? '' : '每行至少放置 1 个植物';
}

function allRowsHavePlant(){
  for(let r = 0; r < ROWS; r++){ if(countRowPlants(r) < 1) return false; }
  return true;
}

function handleCricketPlace(r, c){
  if(state.grid[r][c].length > 0) return;
  const rowCount = countRowPlants(r);
  if(rowCount >= CRICKET_ROW_CAP){ flashCricketMsg('该行已满（最多 ' + CRICKET_ROW_CAP + ' 个）'); return; }
  let type = state.selectedPlant;
  if(!type) return;
  const selCfg = PLANTS[type];
  if(selCfg && selCfg.isBox){
    let pool;
    if(type === 'randombox'){
      // 随机盒子: 从全部非盲盒斗蛐蛐植物中随机抽取
      pool = CRICKET_PLANTS.filter(p => !PLANTS[p].isBox);
    } else if(type === 'cricketbigbox'){
      // 斗蛐蛐大盲盒: 只放出已设计 0–5 级固定机制的植物
      pool = Object.keys(CRICKET_LEVELS);
    }
    type = pool[Math.floor(Math.random() * pool.length)];
    // 不消耗选择: 可继续点击放置盲盒植物
  }
  placePlantObject(r, c, type);
  updateCricketSetupUI();
}

function flashCricketMsg(msg){
  const banner = document.getElementById('cricket-setup-banner');
  if(banner && banner.style.display !== 'none'){
    const m = document.getElementById('cricket-msg');
    m.textContent = msg;
    setTimeout(() => { if(m) m.textContent = ''; }, 1500);
  } else {
    showCricketBanner(msg);
  }
}

function startCricketBattle(){
  if(!allRowsHavePlant()){ flashCricketMsg('每行至少放置 1 个植物'); return; }
  cricketSetup = false;
  cricketPendingTeam = null;
  const tray = document.getElementById('cricket-deploy');
  if(tray) tray.style.display = 'none';
  // 伤害统计与计时初始化
  state.teamDamage = new Array(ROWS).fill(0);
  state.gameTime = 0;
  // 开战前快照每行完整队伍(无论战斗中是否阵亡, 英灵殿都收藏完整阵容)
  cricketTeams = [];
  for(let r = 0; r < ROWS; r++){
    const rowTypes = [];
    for(let c = 0; c < COLS; c++){
      for(const p of state.grid[r][c]){ if(p && !p.dead && p.type) rowTypes.push(p.type); }
    }
    cricketTeams[r] = rowTypes;
  }
  document.getElementById('cricket-setup-banner').style.display = 'none';
  document.getElementById('lawn').style.bottom = '0';
  document.getElementById('seedbar').style.display = 'none';
  document.getElementById('cricket-timer').style.display = 'flex';
  // 显示阳光图标(斗蛐蛐无阳光经济, 仅用于手机长按呼出 Debug 菜单)
  const scEl = document.getElementById('sun-counter');
  if(scEl){ scEl.style.display = ''; scEl.classList.add('cricket-hide-count'); }
  state.selectedPlant = null;
  // 将非攻击/一次性植物改造为持续战斗单位
  for(let r = 0; r < ROWS; r++){
    for(let c = 0; c < COLS; c++){
      for(const p of state.grid[r][c]){ if(p && !p.dead) cricketifyPlant(p); }
    }
  }
  cricketGraceT = CRICKET_GRACE;
  // 每行独立初始化各自的生成倒计时(各自节奏, 初始错峰以避免同行同帧齐刷)
  cricketRowSpawnTimers = [];
  for(let r = 0; r < ROWS; r++){
    cricketRowSpawnTimers[r] = cricketSpawnInterval(0) * (0.3 + Math.random() * 0.9);
  }
  startGameLoop();
}

function cricketSpawnInterval(t){
  // 线性过渡: 开局每 5 秒一只 -> 20 分钟(1200s)时每 1 秒一只
  const k = CRICKET_SPAWN_RAMP > 0 ? Math.min(1, t / CRICKET_SPAWN_RAMP) : 1;
  return CRICKET_SPAWN_START + (CRICKET_SPAWN_END - CRICKET_SPAWN_START) * k;
}

// 大盲盒出场概率: 8分钟(480s)前为 0, 8→10分钟由 0 平滑升到 100%
function cricketBigBoxChance(t){
  if(t < 480) return 0;
  const k = Math.min(1, (t - 480) / 120);
  return k;
}

function pickCricketZombie(t){
  const pool = ['basic', 'basic', 'flag', 'conehead'];
  if(t > 15) pool.push('buckethead', 'polevaulter', 'newspaper');
  if(t > 40) pool.push('football', 'dancing');
  if(t > 70) pool.push('imp', 'imp');
  if(t > 90) pool.push('giant', 'giant'); // 90秒后: 巨人僵尸登场(精英怪)
  return pool[Math.floor(Math.random() * pool.length)];
}

// 精英僵尸: 任意非盲盒真实僵尸均按概率获得颜色变种(普通 5%, 大盲盒 100%)
// 三种颜色对应不同强化(高血量 / 高攻击 / 高移速); 不再限定为 3 种基础僵尸, 任何僵尸 type 都可叠加
const ELITE_COLORS = [
  { key:'red',   cls:'elite-red',   badge:'血', apply: z => { z.hp = Math.floor(z.hp * 4); z.maxHp = z.hp; } }, // 红: 高血量 ×4
  { key:'blue',  cls:'elite-blue',  badge:'攻', apply: z => { z.damage = Math.floor(z.damage * 4); } },          // 蓝: 高攻击 ×4
  { key:'speed', cls:'elite-speed', badge:'速', apply: z => { z.speed = z.speed * 2.2; } },                        // 速: 高移速 ×2.2
];
const ELITE_CHANCE_NORMAL = 0.05;  // 普通生成 5% 概率
const ELITE_CHANCE_BIGBOX = 1.0;   // 大盲盒开启 100%

// 尝试将已生成的真实僵尸改造为精英变种; force=true 时强制开精英
// 注: 盲盒僵尸 (isBlindbox) 不在此处理(精英作用于内部真实僵尸, 击杀揭示后才显示)
function tryMakeElite(zombie, force){
  if(!zombie || zombie.isElite || zombie.isBlindbox) return false;
  // 斗蛐蛐: 8分钟(480s)前不出精英僵尸
  if(state.gameMode === 'cricket' && cricketTimer < 480) return false;
  const chance = force ? 1.0 : ELITE_CHANCE_NORMAL;
  if(Math.random() >= chance) return false;
  const c = ELITE_COLORS[Math.floor(Math.random() * ELITE_COLORS.length)];
  zombie.isElite = true;
  zombie.eliteColor = c.key;
  const zel = zombie.el.querySelector('.zombie');
  if(zel){
    zel.classList.add(c.cls);
    const badge = document.createElement('div');
    badge.className = 'elite-badge';
    badge.textContent = c.badge;
    zel.appendChild(badge);
  }
  c.apply(zombie);
  return true;
}

// 兼容旧调用: 大盲盒开启专用, 抽出随机真实僵尸并强制精英
function spawnEliteZombie(row, x){
  // 斗蛐蛐: 8分钟(480s)前大盲盒只开出普通僵尸, 不产出精英
  if(state.gameMode === 'cricket' && cricketTimer < 480){
    return spawnZombie(pickCricketZombie(cricketTimer), row, true, x);
  }
  const t = pickCricketZombie(cricketTimer);
  const z = spawnZombie(t, row, true, x); // forceNormal=true: 真实僵尸(不裹盲盒)
  if(z) tryMakeElite(z, true);             // 大盲盒: 100% 开精英
  return z;
}

function updateCricket(dt){
  // 发育阶段
  if(cricketGraceT > 0){
    cricketGraceT -= dt;
    const g = document.getElementById('grace-banner');
    g.style.display = 'block';
    document.getElementById('grace-label').textContent = '⚔️ 战斗即将开始';
    document.getElementById('grace-tip').textContent = '坚守你的队伍，僵尸即将来袭！';
    document.getElementById('grace-count').textContent = String(Math.ceil(Math.max(0, cricketGraceT)));
    if(cricketGraceT <= 0) g.style.display = 'none';
    return;
  }
  // 计时
  cricketTimer += dt;
  document.getElementById('cricket-timer').textContent = fmtTime(cricketTimer);
  // 每行独立生成系统: 每行拥有自己的生成倒计时, 间隔到达时仅该行在自身位置独立刷出盲盒僵尸
  // 各行互不共用计时器、互不统一触发, 各自按自身节奏生成(开局每5秒一只 -> 20分钟每1秒一只, 见 cricketSpawnInterval)
  // 8 分钟(480s)起该行独立出现"大盲盒"僵尸(概率渐增), 击杀后开出精英僵尸
  for(let r = 0; r < ROWS; r++){
    if(!cricketRowAlive[r]) continue;        // 已阵亡的行停止生成
    if(cricketRowSpawnTimers[r] == null) cricketRowSpawnTimers[r] = cricketSpawnInterval(cricketTimer);
    cricketRowSpawnTimers[r] -= dt;
    if(cricketRowSpawnTimers[r] <= 0){
      const big = Math.random() < cricketBigBoxChance(cricketTimer);
      spawnZombie('basic', r, false, null, big); // cricket 模式下裹成盲盒; big=大盲盒; 仅本行触发
      // 重置该行自身计时: 基准间隔叠加随机抖动, 使各行天然错峰、不会统一触发
      cricketRowSpawnTimers[r] = cricketSpawnInterval(cricketTimer) * (0.7 + Math.random() * 0.6);
    }
  }
  // 行死亡检测: 斗蛐蛐模式改为"小推车触发即阵亡", 故此处不再以植物全灭判定
  // (植物全灭但小推车未触发时, 僵尸终将走到小推车触发失败, 见 updateZombie)
  // 结算: 只剩一行
  const aliveCount = cricketRowAlive.filter(Boolean).length;
  if(aliveCount <= 1 && !cricketEnded){
    cricketEnded = true;
    setTimeout(endCricket, 1200);
  }
}

function showCricketBanner(msg){
  const b = document.getElementById('wave-banner');
  document.getElementById('banner-text').textContent = msg;
  document.getElementById('banner-sub').textContent = '';
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
  setTimeout(() => b.classList.remove('show'), 1500);
}

function endCricket(){
  state.gameRunning = false;
  const winner = cricketRowAlive.indexOf(true);
  const time = Math.floor(cricketTimer);
  let team = [];
  if(winner >= 0){
    // 优先使用开战前快照的完整队伍(包含战斗中阵亡的植物)
    if(cricketTeams[winner] && cricketTeams[winner].length > 0){
      team = cricketTeams[winner].slice();
    } else {
      for(let c = 0; c < COLS; c++){
        const stack = state.grid[winner][c];
        const p = stack.find(x => !x.dead);
        if(p) team.push(p.type);
      }
    }
  }
  if(winner >= 0 && team.length > 0){
    if(!progress.valhalla) progress.valhalla = [];
    progress.valhalla.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('zh-CN'),
      time: time, plants: team.slice(), row: winner,
    });
    if(progress.valhalla.length > 30) progress.valhalla.length = 30;
    saveProgress();
  }
  showCricketResult(winner, team, time);
}

function showCricketResult(winner, team, time){
  const box = document.getElementById('cr-box');
  let html = '';
  if(winner >= 0){
    html += '<div class="cr-title">🏆 冠军队诞生！</div>';
    html += '<div class="cr-sub">第 ' + (winner + 1) + ' 行的队伍坚守到了最后</div>';
    html += '<div class="cr-team">';
    for(const t of team) html += '<div class="cr-plant">' + createPlantHTML(t) + '</div>';
    html += '</div>';
    html += '<div class="cr-time">⏱ 坚持时间：<b>' + fmtTime(time) + '</b></div>';
    html += '<div class="cr-date">📅 ' + new Date().toLocaleDateString('zh-CN') + '</div>';
    html += '<div class="cr-note">已收藏入英灵殿！</div>';
  } else {
    html += '<div class="cr-title">💀 全军覆没</div>';
    html += '<div class="cr-sub">没有队伍活到最后</div>';
  }
  html += '<div class="cr-btns">' +
    '<button class="cr-btn cr-btn-pri" onclick="openValhalla()">🏛️ 英灵殿</button>' +
    '<button class="cr-btn cr-btn-sec" onclick="backToMenu()">返回菜单</button>' +
    '</div>';
  box.innerHTML = html;
  document.getElementById('cricket-result').classList.add('show');
}

// 斗蛐蛐: 植物自动随机升级 (升到上限/无可选后停止)
// 飞升特效: 植物升至5级时, 触发持续1秒的时间停止 + 居中"XX植物飞升！" + 中二四字判词
function triggerAscension(plant){
  try{
    const name = (PLANTS[plant.type] && PLANTS[plant.type].name) || plant.type || '神秘植物';
    const verdict = ASCENSION_VERDICT[plant.type] || '破境飞升';
    // 路数标识: 植物所在行(0基) → 显示「X路」(1基), 如第3行显示「3路」
    const lane = (plant.row != null ? plant.row : 0) + 1;
    state.ascensionFreeze = 1.0; // 时间停止 1 秒(真实时间, 与游戏倍速无关)
    // 移除上一次残留的 overlay(避免叠加)
    const old = document.getElementById('ascension-overlay');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    const ov = document.createElement('div');
    ov.id = 'ascension-overlay';
    ov.innerHTML =
      '<div class="ascension-ring"></div>' +
      '<div class="ascension-lane">' + lane + '路</div>' +
      '<div class="ascension-title">' + name + '飞升！</div>' +
      '<div class="ascension-verdict">' + verdict + '</div>';
    document.body.appendChild(ov);
    // 草坪时间停止视觉: 去色 + 暗化
    const lawn = document.getElementById('lawn');
    if(lawn) lawn.classList.add('time-stopped');
    // 1 秒后淡出并清理(与 freeze 时长一致)
    setTimeout(function(){
      ov.classList.add('fade-out');
      if(lawn) lawn.classList.remove('time-stopped');
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 500);
    }, 1000);
  }catch(e){}
}

// 升级到5级时仅触发一次飞升特效 + 解锁专属酷炫皮肤
function maybeAscend(plant){
  if(!plant) return;
  if(plant.level === 5 && !plant._ascended5){
    plant._ascended5 = true;
    applyLevel5Skin(plant);
    triggerAscension(plant);
  }
}

// 5级飞升专属酷炫皮肤: 在植物外层包裹加金色光环 + 旋转圣环(纯 CSS 动画)
function applyLevel5Skin(plant){
  if(!plant || !plant.el) return;
  plant.el.classList.add('ascended-skin');
}

function cricketAutoUpgrade(plant){
  if(!plant || plant.dead || !plant.levelReady) return;
  // 新固定升级系统: 应用 CRICKET_LEVELS 中对应等级的固定效果, 不再随机
  if(plant.cricketLeveled){
    if(plant.level >= CRICKET_NEW_MAX){
      plant.levelReady = false; clearLevelReadyUI(plant); updatePlantXPBar(plant);
      return;
    }
    const def = CRICKET_LEVELS[plant.type];
    plant.level++;
    maybeAscend(plant);
    const lvl = def && def.levels[plant.level];
    if(lvl && lvl.apply) lvl.apply(plant);
    plant.xp = 0;
    plant.xpToNext = cricketNewXpToNext(plant);
    plant.levelReady = false;
    clearLevelReadyUI(plant);
    cricketFloat(plant, '⬆ Lv.' + plant.level);
    updatePlantXPBar(plant);
    return;
  }
  if(plant.level >= CRICKET_MAX_LEVEL){
    plant.levelReady = false; clearLevelReadyUI(plant); updatePlantXPBar(plant);
    return;
  }
  // 斗蛐蛐模式: 非固定升级系统植物(高坚果/火炬/樱桃/辣椒/土豆)保证获得核心战斗强化。
  // 旧的随机升级池技能(穿透/连射/冰冻等)对其斗蛐蛐动作(均依赖 plant.damage)无效,
  // 会导致"升级了但属性没变强"。这里改为确定性强化, 确保每次升级都实打实变强。
  if(state.gameMode === 'cricket'){
    plant.level++;
    maybeAscend(plant);
    plant.damage = (plant.damage != null ? plant.damage : 20) * 1.2;        // 核心伤害 +20%
    plant.maxHp = (plant.maxHp || 200) * 1.1; plant.hp = plant.maxHp;        // 生命 +10%
    if(plant.attackInterval){ plant.attackInterval = Math.max(0.15, plant.attackInterval * 0.9); } // 攻速提升
    plant.xp = 0;
    plant.xpToNext = cricketNewXpToNext(plant);
    plant.levelReady = false; clearLevelReadyUI(plant);
    cricketFloat(plant, '⬆ 强化 Lv.' + plant.level);
    updatePlantXPBar(plant);
    return;
  }
  // 斗蛐蛐模式: 只使用植物自身升级, 不获得随机的其他植物技能(跨植物技能)
  const own = generateUpgradeOptions(plant);
  if(own.length === 0){
    // 自身升级池已空: 满级强化(不引入跨植物技能), 植物仍可继续成长
    plant.levelReady = false; clearLevelReadyUI(plant); updatePlantXPBar(plant);
    cricketFloat(plant, '🌟 满级'); autoMaxLevelBoost(plant); return;
  }
  // 即便达到等级上限, 只要自身还有可升级项就继续升(不拿跨植物技能)
  const opt = own[Math.floor(Math.random() * own.length)];
  applyUpgrade(plant, opt);
  cricketFloat(plant, '⬆ Lv.' + plant.level);
}

function cricketAutoCross(plant){
  if(!plant || plant.dead || !plant.crossLevelReady) return;
  const avail = getAllCrossSkills(plant);
  if(avail.length === 0){
    plant.crossLevelReady = false; clearCrossBadge(plant);
    return;
  }
  const opt = avail[Math.floor(Math.random() * avail.length)];
  applyCrossUpgrade(plant, opt);
  cricketFloat(plant, '🔄 Lv.' + plant.level);
}

function cricketFloat(plant, text){
  if(!plant.el) return;
  const t = document.createElement('div');
  t.className = 'auto-level-text';
  t.textContent = text;
  plant.el.appendChild(t);
  setTimeout(() => { if(t.parentNode) t.parentNode.removeChild(t); }, 1500);
}

function resetCricketUI(){
  cricketSetup = false;
  cricketTeams = [];
  const sb = document.getElementById('cricket-setup-banner'); if(sb) sb.style.display = 'none';
  const tm = document.getElementById('cricket-timer'); if(tm) tm.style.display = 'none';
  const sb2 = document.getElementById('seedbar'); if(sb2) sb2.style.display = '';
  const sc = document.getElementById('sun-counter'); if(sc){ sc.style.display = ''; sc.classList.remove('cricket-hide-count'); }
  const wi = document.getElementById('wave-info'); if(wi) wi.style.display = '';
  const gb = document.getElementById('grace-banner'); if(gb) gb.style.display = 'none';
  const cr = document.getElementById('cricket-result'); if(cr) cr.classList.remove('show');
  const lw = document.getElementById('lawn'); if(lw) lw.style.bottom = '0';
}

// ============================================================
// 英灵殿 (Valhalla) —— 收藏斗蛐蛐冠军队伍
// ============================================================
function openValhalla(){
  showScreen('valhalla-screen');
  renderValhalla();
}

// container: 渲染目标容器(默认英灵殿独立界面 #valhalla-grid; 传入时可在图鉴内嵌渲染)
function renderValhalla(container){
  const grid = container || document.getElementById('valhalla-grid');
  const countEl = document.getElementById('vh-count');
  if(countEl) countEl.textContent = (progress.valhalla || []).length;
  if(!progress.valhalla || progress.valhalla.length === 0){
    grid.innerHTML = '<div class="vh-empty">🏛️ 还没有英雄入殿。<br>去「斗蛐蛐」赢下一场吧！</div>';
    return;
  }
  let html = '';
  progress.valhalla.forEach((v, idx) => {
    html += '<div class="vh-card">';
    html += '<div class="vh-date">📅 ' + v.date + '</div>';
    html += '<div class="vh-time">⏱ 坚持 ' + fmtTime(v.time) + '</div>';
    html += '<div class="vh-team">';
    for(const t of v.plants) html += '<div class="vh-plant">' + createPlantHTML(t) + '</div>';
    html += '</div>';
    html += '<div class="vh-btns">';
    html += '<button class="vh-btn vh-btn-pri" onclick="deployTeam(' + idx + ', true)">⚔️ 摆出挑战</button>';
    html += '<button class="vh-btn vh-btn-sec" onclick="deleteValhalla(' + idx + ')">🗑 删除</button>';
    html += '</div>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

function deployTeam(idx, keep){
  closeAlmanac(); // 从图鉴内嵌的英灵殿部署时, 先关闭图鉴浮层露出布阵界面
  const v = progress.valhalla && progress.valhalla[idx];
  if(!v) return;
  if(cricketSetup && keep){
    // 布阵中再次选择英灵队伍: 保留已有布置, 仅将新队伍设为待部署
    cricketPendingTeam = v.plants.slice();
    state.selectedPlant = 'randombox';
    updateSeedbarUI();
    showScreen(null); // 关闭英灵殿, 回到布阵界面
    updateCricketSetupUI();
    updateDeployTray();
    return;
  }
  enterCricketSetup(v.plants.slice());
}

// 将待部署整队放到某一行(清空该行后整队落位), 可多次部署不同队伍到不同行
function deployPendingTeamToRow(r){
  if(!cricketSetup || !cricketPendingTeam || !cricketPendingTeam.length) return;
  // 清空该行已有植物
  for(let c = 0; c < COLS; c++){
    const stack = state.grid[r][c];
    if(stack){ while(stack.length) removePlant(stack[stack.length - 1], true); }
  }
  // 整队落位
  for(let i = 0; i < cricketPendingTeam.length && i < COLS; i++){
    const t = cricketPendingTeam[i];
    if(PLANTS[t] && !PLANTS[t].isBox) placePlantObject(r, i, t);
  }
  cricketPendingTeam = null;
  updateCricketSetupUI();
  updateDeployTray();
  flashCricketMsg('已在该行列队！可继续从英灵殿部署其它队伍，或手动补充。');
}

// 刷新布阵界面中的"英灵殿待部署"面板(队伍图标 + 行号按钮)
function updateDeployTray(){
  const tray = document.getElementById('cricket-deploy');
  if(!tray) return;
  if(cricketPendingTeam && cricketPendingTeam.length && cricketSetup){
    tray.style.display = 'flex';
    const teamEl = document.getElementById('cricket-deploy-team');
    if(teamEl) teamEl.innerHTML = cricketPendingTeam.map(t => '<div class="vh-plant">' + createPlantHTML(t) + '</div>').join('');
    const rowsEl = document.getElementById('cricket-deploy-rows');
    if(rowsEl){
      rowsEl.innerHTML = '';
      const names = ['①', '②', '③', '④', '⑤'];
      for(let r = 0; r < ROWS; r++){
        (function(rr){
          const b = document.createElement('button');
          b.className = 'csd-row-btn';
          b.textContent = names[rr];
          b.onclick = function(){ deployPendingTeamToRow(rr); };
          rowsEl.appendChild(b);
        })(r);
      }
    }
  } else {
    tray.style.display = 'none';
  }
}

// 从布阵界面打开英灵殿(保留当前布置, 用于再选一支队伍)
function openValhallaFromSetup(){
  renderValhalla();
  showScreen('valhalla-screen');
}

function deleteValhalla(idx){
  if(!progress.valhalla) return;
  progress.valhalla.splice(idx, 1);
  saveProgress();
  renderValhalla();
}

function showReward(stars, coins){
  const overlay = document.getElementById('reward-overlay');
  document.getElementById('reward-title').textContent = '🎉 关卡完成！';
  // 隐藏徽章 (挑战奖励专用)
  document.getElementById('reward-badge').classList.remove('show');
  // 星级显示
  let starHtml = '';
  for(let i = 0; i < 3; i++){
    starHtml += `<span class="star ${i < stars ? '' : 'empty'}" style="animation-delay:${i * 0.3}s">★</span>`;
  }
  document.getElementById('reward-stars').innerHTML = starHtml;
  document.getElementById('reward-coins').textContent = coins;
  // 下一关按钮
  const nextBtn = document.getElementById('reward-next-btn');
  const isLastLevel = progress.currentLevel >= LEVELS.length - 1;
  if(isLastLevel){
    nextBtn.textContent = '返回菜单';
    nextBtn.onclick = backToMenu;
  } else {
    nextBtn.textContent = '下一关';
    nextBtn.onclick = nextLevel;
  }
  overlay.classList.add('show');
}

// 挑战完成奖励弹窗 (支持阶段/徽章升级)
function showChallengeReward(ch, coins, stage, isNew){
  const overlay = document.getElementById('reward-overlay');
  const st = CHALLENGE_STAGES[(stage || 1) - 1];
  document.getElementById('reward-title').textContent = '🏅 挑战完成！' + st.label + ' ' + st.name;
  // 隐藏星级, 显示徽章
  document.getElementById('reward-stars').innerHTML = '';
  const badgeBox = document.getElementById('reward-badge');
  badgeBox.classList.add('show');
  const tier = BADGE_TIERS[stage] || BADGE_TIERS[1];
  document.getElementById('rb-icon').textContent = ch.badgeIcon;
  const rbIcon = document.getElementById('rb-icon');
  rbIcon.style.borderColor = stage === 3 ? '#FFD700' : stage === 2 ? '#CFD8DC' : '#CD7F32';
  rbIcon.style.boxShadow = '0 0 14px ' + (stage === 3 ? 'rgba(255,215,0,.7)' : stage === 2 ? 'rgba(207,216,220,.6)' : 'rgba(205,127,50,.6)');
  document.getElementById('rb-name').textContent = ch.badgeName + ' · ' + tier.name;
  badgeBox.querySelector('.rb-sub').textContent = isNew
    ? (stage === 1 ? '获得专属收藏徽章（铜级）！' : '徽章升级为「' + tier.name + '级」！(' + tier.stars + ')')
    : '该阶段已通关 · 重复挑战奖励';
  document.getElementById('reward-coins').textContent = coins;
  const nextBtn = document.getElementById('reward-next-btn');
  // 还有下一阶段: 提示继续挑战更高难度
  if(isNew && stage < 3){
    nextBtn.textContent = '挑战 ' + CHALLENGE_STAGES[stage].label + ' ' + CHALLENGE_STAGES[stage].name + ' →';
    nextBtn.onclick = () => {
      badgeBox.classList.remove('show');
      rbIcon.style.borderColor = '';
      rbIcon.style.boxShadow = '';
      startChallenge(currentChallengeIdx, stage + 1);
    };
  } else {
    nextBtn.textContent = '返回挑战';
    nextBtn.onclick = () => {
      badgeBox.classList.remove('show');
      rbIcon.style.borderColor = '';
      rbIcon.style.boxShadow = '';
      openChallengeSelect();
    };
  }
  overlay.classList.add('show');
}

function showMessage(title, text){
  document.getElementById('msg-title').textContent = title;
  document.getElementById('msg-text').textContent = text;
  document.getElementById('msg-btn').textContent = '重新开始';
  document.getElementById('msg-btn').onclick = restartGame;
  document.getElementById('message-overlay').style.display = 'flex';
}

function showWaveBanner(waveNum, isFinal){
  const banner = document.getElementById('wave-banner');
  const text = document.getElementById('banner-text');
  const sub = document.getElementById('banner-sub');
  if(isFinal){
    text.textContent = '⚠ 最终波次 ⚠';
    sub.textContent = '僵尸大军来袭！';
  } else {
    text.textContent = '第 ' + waveNum + ' 波';
    sub.textContent = '僵尸即将到来...';
  }
  banner.classList.remove('show');
  void banner.offsetWidth; // 触发重排以重启动画
  banner.classList.add('show');
}

function restartGame(){
  if(state.gameMode === 'endless'){
    currentLevelWaves = [generateEndlessWave(1)];
    resetGameState();
    state.gameMode = 'endless';
    state.endlessRound = 1;
    initGame();
  } else {
    resetGameState();
    initGame();
  }
}

// ============================================================
// 图鉴系统
// ============================================================
const PLANT_INFO = {
  peashooter: {
    desc:'最基础的攻击型植物。每隔1.5秒射出一颗豌豆，对前方同行僵尸造成20点伤害。性价比最高的选择。',
    stats:{hp:300, cost:100, cooldown:'5秒', damage:20}
  },
  sunflower: {
    desc:'经济型植物，不具攻击力。每10秒产生一个阳光（+25阳光值），是游戏前期积累阳光的关键。',
    stats:{hp:300, cost:50, cooldown:'7秒', special:'产阳光'}
  },
  wallnut: {
    desc:'防御型植物，拥有高达4000点的血量，用来阻挡僵尸前进。自身不具备攻击力，但能为后排植物争取宝贵时间。',
    stats:{hp:4000, cost:50, cooldown:'20秒', special:'高防御'}
  },
  cherrybomb: {
    desc:'一次性爆炸植物。种植后1.2秒引爆，对周围1格范围内所有僵尸造成1800点毁灭性伤害。爆炸后自身消失。',
    stats:{hp:'-', cost:150, cooldown:'30秒', damage:1800, special:'范围爆炸'}
  },
  snowpea: {
    desc:'豌豆射手的冰冻变种。射出的冰豌豆除了造成20点伤害外，还能使僵尸减速50%持续3秒。对付快速僵尸的利器。',
    stats:{hp:300, cost:175, cooldown:'6秒', damage:20, special:'冰冻减速'}
  },
  chomper: {
    desc:'近战吞噬型植物。基础可一口秒杀前方1.5格内的普通/盲盒僵尸并获得经验（盲盒被吞噬后不再开出内部僵尸），但吞噬后需消化。拥有专属「吞噬等级」系统：每吞噬1个僵尸提升1级，每级攻击距离+0.5格、消化时间-0.3秒。升至1级解锁「逆天之咬」可啃咬巨人。',
    stats:{hp:300, cost:150, cooldown:'15秒', damage:'秒杀', special:'吞噬等级系统/逆天之咬'}
  },
  repeater: {
    desc:'豌豆射手的强化版。每次攻击连续射出2颗豌豆，火力翻倍！性价比极高的中坚输出，配合火炬树桩效果更佳。',
    stats:{hp:300, cost:200, cooldown:'8秒', damage:'20x2', special:'连发2颗'}
  },
  gatling: {
    desc:'终极火力输出！戴着头盔、架着四管的机枪射手，每次攻击倾泻4颗豌豆，是全游戏最强的持续输出植物。',
    stats:{hp:300, cost:450, cooldown:'30秒', damage:'20x4', special:'连发4颗'}
  },
  jalapeno: {
    desc:'脾气火爆的红辣椒。种下后瞬间爆燃，火焰席卷所在行的整排僵尸，造成1800点毁灭性伤害。对付成排僵尸的杀手锏。',
    stats:{hp:'-', cost:125, cooldown:'35秒', damage:1800, special:'整行爆炸'}
  },
  potatomine: {
    desc:'斗蛐蛐雷层机：每10秒自动在本行最前方僵尸的脚底投下一颗瞬爆雷，造成300点范围伤害并溅射邻近僵尸。解放双手的自动炮台，升级可强化雷伤与投雷频率。',
    stats:{hp:1200, cost:25, cooldown:'25秒', damage:'300/10秒', special:'自动瞬爆雷层'}
  },
  torchwood: {
    desc:'点燃火力的树桩。自身不攻击，但经过它的豌豆会被点燃变成火豆，伤害翻倍且弹体变大！寒冰豌豆经过后会失去冰冻效果。与双发射手、机枪射手是绝配。升级可习得「寒焰」技能：豌豆变寒火豆，伤害增幅的同时还能减速敌人，且与火豆的增伤效果可叠加。',
    stats:{hp:300, cost:175, cooldown:'8秒', special:'火豆x2伤害/寒焰减速'}
  },
  spikeweed: {
    desc:'铺在地面的尖刺植物。僵尸踩过时会持续受到伤害，且无法被普通僵尸啃食（直接踩过去）。低成本的前线输出，适合铺在坚果墙后方持续消耗。',
    stats:{hp:300, cost:100, cooldown:'8秒', damage:'10/0.4秒', special:'不可被吃/踩踏伤害'}
  },
  tallnut: {
    desc:'比坚果墙更高更厚的超级防御墙，8000点生命值！最关键的是能挡住撑杆僵尸——撑杆僵尸无法越过它，只能乖乖啃食。终极防线。',
    stats:{hp:8000, cost:125, cooldown:'20秒', special:'挡撑杆/超高防御'}
  },
  cornpult: {
    desc:'投掷玉米粒的投手植物。能越过坚果墙等障碍攻击同行最靠前的僵尸。每次有20%概率投出黄油，命中僵尸会定身3秒无法行动！控制利器。',
    stats:{hp:300, cost:100, cooldown:'8秒', damage:20, special:'20%黄油定身3秒'}
  },
  watermelon: {
    desc:'投掷西瓜的重火力投手。伤害高达40且落点溅射，能同时打击落点周围的所有僵尸！群体清场专家，配合玉米投手控制效果极佳。',
    stats:{hp:300, cost:300, cooldown:'10秒', damage:40, special:'范围溅射'}
  },
};

const ZOMBIE_INFO = {
  basic: {
    desc:'最普通的僵尸，缓慢前行，只有200点生命值。成群出现时也不容小觑，是所有波次的主力军。',
    stats:{hp:200, speed:'慢', damage:'低'}
  },
  flag: {
    desc:'波次先锋！举着红色旗帜的普通僵尸，速度更快，标志着新一波僵尸进攻的开始。血量与普通僵尸相同。',
    stats:{hp:200, speed:'较快', damage:'低', special:'波次标志'}
  },
  conehead: {
    desc:'头顶橙色路障的僵尸，路障提供了额外防护。560点生命值让它比普通僵尸更耐打，需要更多火力才能击倒。',
    stats:{hp:560, speed:'慢', damage:'低', special:'路障防护'}
  },
  polevaulter: {
    desc:'手持撑杆的敏捷僵尸。初次遇到植物时会跳过第一株植物直接翻越！跳过后速度降低。需要提前布置多重防线。',
    stats:{hp:340, speed:'快', damage:'低', special:'撑杆跳越'}
  },
  buckethead: {
    desc:'头顶金属铁桶的重装僵尸。1100点生命值使其成为最难缠的常规僵尸之一，需要持续输出才能击破。',
    stats:{hp:1100, speed:'慢', damage:'低', special:'铁桶防护'}
  },
  newspaper: {
    desc:'手持报纸的僵尸，初始速度普通。当报纸被打掉（生命值低于170）时会暴怒，速度暴增到极快！务必在其暴怒前击杀。',
    stats:{hp:340, speed:'慢→极快', damage:'低', special:'暴怒加速'}
  },
  football: {
    desc:'穿戴橄榄球头盔和护甲的运动僵尸。1000点生命值加上28的速度，兼具高血量和快速移动，每次攻击造成双倍伤害。',
    stats:{hp:1000, speed:'快', damage:'中', special:'高血量+高速'}
  },
  dancing: {
    desc:'头戴爆炸头、身穿亮色西装的迪斯科僵尸。入场3秒后会召唤3只小鬼僵尸出现在邻近行！务必优先击杀。',
    stats:{hp:400, speed:'慢', damage:'低', special:'召唤小鬼'}
  },
  imp: {
    desc:'体型娇小但速度极快的小鬼僵尸。仅100点生命值，但44的移动速度让它能迅速穿越防线。通常由跳舞僵尸召唤出现。',
    stats:{hp:100, speed:'极快', damage:'低', special:'小型/极速'}
  },
  giant: {
    desc:'体型巨大的精英僵尸！4000点超高生命值，移动极慢。它不会慢慢啃咬——而是挥动巨棒，一击秒杀挡路的植物（挥棒有前摇与后摇，期间可被冰冻、黄油等强控制打断）。半血之前背上驮着一只小鬼，血量过半时会把小鬼向前抛出5格（最多落到第2列）。挥棒时体型保持不变。',
    stats:{hp:4000, speed:'极慢', damage:'秒杀', special:'一击秒杀+半血投鬼+可被强控打断'}
  },
};

// 斗蛐蛐专属植物图鉴数据 (能力与普通模式植物不同, 仅在斗蛐蛐模式出现)
const CRICKET_PLANT_INFO = {
  magmapea: {
    desc:'熔岩豌豆：喷射滚烫岩浆豌豆，伤害比普通豌豆更高，并附带持续灼烧。斗蛐蛐模式的主力远程输出。',
    stats:{hp:300, cost:175, cooldown:'6秒', damage:'24/1.5秒', special:'岩浆灼烧×1.8'}
  },
  ironcactus: {
    desc:'钢刺仙人掌：贴地钢刺，高频穿刺伤害，并附带破甲效果，对铁桶等重甲僵尸额外有效。',
    stats:{hp:400, cost:125, cooldown:'8秒', damage:'14/0.4秒', special:'破甲×1.5'}
  },
  thornking: {
    desc:'荆棘王：厚甲荆棘王，持续对啃咬它的僵尸反弹高额尖刺伤害，越被打越疼。',
    stats:{hp:6000, cost:150, cooldown:'20秒', damage:'90反弹', special:'尖刺反伤'}
  },
  frostshroom: {
    desc:'寒霜菇：发射寒霜弹，造成伤害的同时冻结并减速僵尸，是控场利器。',
    stats:{hp:300, cost:175, cooldown:'6秒', damage:'18/1.6秒', special:'冰冻减速'}
  },
  stormflower: {
    desc:'雷鸣花：释放连锁闪电，在同行及邻近行间跳跃，最多劈中 3 个僵尸。',
    stats:{hp:300, cost:200, cooldown:'10秒', damage:'30连锁', special:'连锁×3'}
  },
  poisonvine: {
    desc:'剧毒藤：持续对周围僵尸造成直接伤害，并附加剧毒，按时间持续掉血。',
    stats:{hp:400, cost:125, cooldown:'8秒', damage:'6+18/秒毒', special:'中毒3秒'}
  },
  lumapot: {
    desc:'光菇：散发治愈光辉，持续为周围残血植物回复生命，是团队的奶妈。',
    stats:{hp:600, cost:125, cooldown:'10秒', special:'治疗25/1.5秒'}
  },
  iceshard: {
    desc:'冰晶柱：在身前5格范围内持续制造减速力场，踏入的僵尸被持续减速，让他们寸步难行。升级可扩大范围并强化减速强度。',
    stats:{hp:500, cost:150, cooldown:'12秒', damage:'减速力场5格', special:'持续减速'}
  },
  venus: {
    desc:'追踪花：锁定同行血量最高的僵尸进行狙击，造成200点巨额单体伤害，专治精英怪。',
    stats:{hp:300, cost:225, cooldown:'12秒', damage:200, special:'狙击精英'}
  },
  shieldfern: {
    desc:'护盾蕨：展开灵盾光环，为周围植物提供伤害减免，是前排的坚实护盾。',
    stats:{hp:600, cost:150, cooldown:'12秒', special:'减伤40%'}
  },
};

// 斗蛐蛐模式: 所有植物 0–5 级固定成长（用于图鉴展示）。
// 0级为初始形态, 1–5级为逐级固定增益/技能; 与斗蛐蛐实战的 6 级固定升级系统一致。
const CRICKET_CODEX_LEVELS = {
  peashooter: {
    levels: [
      { t:'0级 · 初始', d:'每1.5秒射出5攻击力的豌豆；每次射击减少0.01秒攻击间隔（封顶0.5秒）。' },
      { t:'1级 · 强力豌豆', d:'豌豆攻击力提升至 10。' },
      { t:'2级 · 突出豌豆', d:'获得「突出豌豆」：对近距离敌人最多造成 150% 伤害。' },
      { t:'3级 · 强化突出', d:'「突出豌豆」最多造成 200% 伤害。' },
      { t:'4级 · 赏金猎人', d:'获得「赏金猎人」：攻速满时，每击杀 1 僵尸 +0.5 攻击力（累计上限 +30）。' },
      { t:'5级 · 终极赏金', d:'「赏金猎人」每击杀 +1 攻击力。' },
    ]
  },
  sunflower: {
    levels: [
      { t:'0级 · 初始', d:'每5秒对全行僵尸施加1层「光标」（每层使受到伤害+25%，每5秒自动减少1层）。' },
      { t:'1级 · 急速光标', d:'光标施加间隔 → 4秒。' },
      { t:'2级 · 频施光标', d:'光标施加间隔 → 3秒。' },
      { t:'3级 · 阳光突击', d:'获得「阳光突击」：每5秒向前发射阳光子弹，命中僵尸施加1层光标。' },
      { t:'4级 · 突击加速', d:'「阳光突击」发射间隔 → 4秒。' },
      { t:'5级 · 突击极速', d:'「阳光突击」发射间隔 → 3秒。' },
    ]
  },
  wallnut: {
    levels: [
      { t:'0级 · 初始', d:'厚实坚果：2000 生命，纯防御不攻击，为后排争取时间。' },
      { t:'1级 · 加固', d:'最大生命提升至 3000。' },
      { t:'2级 · 强体', d:'最大生命提升至 4000。' },
      { t:'3级 · 韧性坚果', d:'解锁「韧性坚果」：可扛巨人砸击，每次受砸仅损失 1000 生命（不再被秒杀）。' },
      { t:'4级 · 自愈', d:'获得每秒 20 点生命回复。' },
      { t:'5级 · 神盾坚果', d:'「韧性坚果」受砸减血降至 500，且升级瞬间立即为全行植物附加 300 点不可叠加护盾，之后每 5 分钟刷新（持续护盾特效）。' },
    ]
  },
  cherrybomb: {
    levels: [
      { t:'0级 · 初始', d:'持续范围脉冲，每1秒对周围造成130爆炸伤害（本体无敌）。' },
      { t:'1级 · 强脉冲', d:'脉冲伤害提升至 180。' },
      { t:'2级 · 扩圈', d:'爆炸范围 +1格。' },
      { t:'3级 · 燃爆', d:'伤害提升至 240，并附点燃灼烧。' },
      { t:'4级 · 高频', d:'脉冲频率提升（间隔→0.7秒）。' },
      { t:'5级 · 灭世爆', d:'伤害提升至 320，范围再+1。' },
    ]
  },
  snowpea: {
    levels: [
      { t:'0级 · 初始', d:'一次发射两发寒冰豌豆（每发20伤害，命中减速僵尸）。' },
      { t:'1级 · 寒冰', d:'寒冰豌豆伤害提升至 30。' },
      { t:'2级 · 寒冰激光', d:'解锁「寒冰激光」：每发射两发寒冰豌豆，发射1发寒冰激光（伤害4，仅减速，全行僵尸）。' },
      { t:'3级 · 双激光', d:'「寒冰激光」每轮发射 2 发（覆盖更广减速）。' },
      { t:'4级 · 寒霜', d:'「寒冰激光」减速更持久（减速时长×2，不再附加寒意）。' },
      { t:'5级 · 极寒', d:'「寒冰激光」减速更强（减速幅度提升，不再附加寒意）。' },
    ]
  },
  chomper: {
    levels: [
      { t:'0级 · 初始', d:'吞噬秒杀前方3格普通/盲盒僵尸（盲盒不再产僵尸），消化12秒，不可秒杀巨人。' },
      { t:'1级 · 吞界', d:'吞噬等级上限 → 15，生命 +500，解锁「逆天之咬」：可啃咬巨人，每次造成 吞噬等级×10 伤害（攻速0.2秒/次）。' },
      { t:'2级 · 深吞', d:'吞噬等级上限 → 20。' },
      { t:'3级 · 厚吞', d:'吞噬等级上限 → 25。' },
      { t:'4级 · 必杀咬', d:'「逆天之咬」有 5% 几率直接秒杀巨人。' },
      { t:'5级 · 吞天', d:'吞噬等级上限 → 30，「逆天之咬」攻速 → 0.1秒/次。' },
    ]
  },
  repeater: {
    levels: [
      { t:'0级 · 初始', d:'每1.5秒射出 2 颗豌豆（每颗20伤害）。获得「元素大师」：每发豌豆 20% 概率变为火豆 / 冰豆 / 寒火豆（概率相等）。' },
      { t:'1级 · 元素大师', d:'「元素大师」触发概率提升至 33%。' },
      { t:'2级 · 三连', d:'普攻一次射出 3 颗豌豆。' },
      { t:'3级 · 元素大师', d:'「元素大师」触发概率提升至 50%。' },
      { t:'4级 · 炎豆', d:'「元素大师」新增「炎豆」（红色，伤害为火豆2倍），4种元素豆概率相等。' },
      { t:'5级 · 元素大师', d:'「元素大师」触发概率提升至 100%（每发必为元素豆）。' },
    ]
  },
  gatling: {
    levels: [
      { t:'0级 · 初始', d:'每2秒射出 4 颗豌豆（每颗15伤害），第4发固定为冰豆（减速）。' },
      { t:'1级 · 提速', d:'攻击间隔缩短至 1.9 秒。' },
      { t:'2级 · 寒火', d:'第4发改为「寒火豆」（伤害×2 + 减速 + 清寒意）。' },
      { t:'3级 · 火力全开', d:'获得「火力全开」：攻击时 3% 概率触发大招，持续3秒共倾泻 80 颗豌豆（含20颗寒火豆）。' },
      { t:'4级 · 蓄能', d:'每次释放大招，大招触发概率永久 +2%（上限 15%）。' },
      { t:'5级 · 弹幕倾天', d:'大招豌豆增至 120 颗（含 30 颗寒火豆）。' },
    ]
  },
  jalapeno: {
    levels: [
      { t:'0级 · 初始', d:'持续灼烧整行，每0.5秒造成70伤害（本体无敌）。' },
      { t:'1级 · 烈焰', d:'灼烧伤害提升至 110。' },
      { t:'2级 · 燃迹', d:'附加点燃持续伤害。' },
      { t:'3级 · 爆焰', d:'灼烧伤害提升至 160。' },
      { t:'4级 · 疾焰', d:'频率提升（间隔→0.35秒）。' },
      { t:'5级 · 焚尽', d:'灼烧提升至 220，点燃伤害翻倍。' },
    ]
  },
  potatomine: {
    levels: [
      { t:'0级 · 初始', d:'每10秒向本行最前僵尸投下爆弹，造成范围(1格)200伤害；本体被接近不会爆炸；死亡时秒杀周围1格内所有僵尸。' },
      { t:'1级 · 重雷', d:'爆弹伤害提升至 300。' },
      { t:'2级 · 频投', d:'投弹间隔缩短至 9 秒。' },
      { t:'3级 · 狂轰滥炸', d:'爆弹击杀僵尸时连锁投下减半伤害的爆弹，若再次击杀则继续连锁。' },
      { t:'4级 · 狂轰强化', d:'「狂轰滥炸」连锁爆弹额外获得 +50 固定伤害（不受减半影响）。' },
      { t:'5级 · 不死图腾', d:'获得 1 次复活机会；复活后变为 4 级，可再次升级重新获得复活。' },
    ]
  },
  torchwood: {
    levels: [
      { t:'0级 · 初始', d:'火焰光环，持续灼烧周围1格僵尸，每0.6秒35伤害。' },
      { t:'1级 · 旺焰', d:'灼烧伤害提升至 55。' },
      { t:'2级 · 扩环', d:'光环范围 +1格。' },
      { t:'3级 · 燃环', d:'灼烧提升至 80，并附点燃。' },
      { t:'4级 · 巨环', d:'光环再 +1格。' },
      { t:'5级 · 焚环', d:'灼烧提升至 120，点燃伤害翻倍。' },
    ]
  },
  spikeweed: {
    levels: [
      { t:'0级 · 初始', d:'地刺：踩过的僵尸每0.4秒受10伤害，且不可被啃食。' },
      { t:'1级 · 利刺', d:'伤害提升至 18。' },
      { t:'2级 · 广刺', d:'攻击范围 +1格。' },
      { t:'3级 · 破甲刺', d:'伤害提升至 28，且破甲。' },
      { t:'4级 · 巨广', d:'范围再 +1格。' },
      { t:'5级 · 钢刺', d:'伤害提升至 40，破甲翻倍。' },
    ]
  },
  tallnut: {
    levels: [
      { t:'0级 · 初始', d:'超高血量荆棘墙，每0.5秒反弹50伤害。' },
      { t:'1级 · 尖刺', d:'反弹伤害提升至 80。' },
      { t:'2级 · 厚甲', d:'血量提升至 10000。' },
      { t:'3级 · 减速刺', d:'反弹提升至 120，并附带减速。' },
      { t:'4级 · 巨墙', d:'血量提升至 12000，反伤溅射。' },
      { t:'5级 · 破甲刺', d:'反弹提升至 180，反弹可破甲。' },
    ]
  },
  cornpult: {
    levels: [
      { t:'0级 · 初始', d:'每2.2秒投玉米，20伤害，20%黄油定身3秒。' },
      { t:'1级 · 黄油', d:'黄油概率提升至 35%。' },
      { t:'2级 · 重玉', d:'伤害提升至 30。' },
      { t:'3级 · 定身', d:'黄油→50%，定身4秒。' },
      { t:'4级 · 速投', d:'攻击间隔缩短至 1.6 秒。' },
      { t:'5级 · 黄油大师', d:'伤害提升至 45，黄油→70%。' },
    ]
  },
  watermelon: {
    levels: [
      { t:'0级 · 初始', d:'每2.5秒投西瓜，40伤害且落点溅射。' },
      { t:'1级 · 重瓜', d:'伤害提升至 55。' },
      { t:'2级 · 广溅', d:'溅射范围 +1格。' },
      { t:'3级 · 速投', d:'攻击间隔缩短至 1.8 秒。' },
      { t:'4级 · 巨瓜', d:'伤害提升至 75。' },
      { t:'5级 · 震瓜', d:'溅射附带短暂眩晕。' },
    ]
  },
  magmapea: {
    levels: [
      { t:'0级 · 初始', d:'每1.5秒射熔岩豌豆，24伤害并灼烧（×1.8）。' },
      { t:'1级 · 岩浆', d:'伤害提升至 34。' },
      { t:'2级 · 燃爆', d:'灼烧伤害进一步提升。' },
      { t:'3级 · 双岩', d:'连射 2 发熔岩豌豆。' },
      { t:'4级 · 巨岩', d:'伤害提升至 50。' },
      { t:'5级 · 爆浆', d:'命中爆炸，溅射相邻格。' },
    ]
  },
  doublesun: {
    levels: [
      { t:'0级 · 初始', d:'改造为「双生阳光弹射手」，每1.2秒射2发16伤害阳光弹。' },
      { t:'1级 · 重弹', d:'单发伤害提升至 24。' },
      { t:'2级 · 兼职', d:'偶尔额外产出阳光。' },
      { t:'3级 · 重弹II', d:'单发伤害提升至 34。' },
      { t:'4级 · 三连', d:'连射 3 发阳光弹。' },
      { t:'5级 · 极速双生', d:'单发提升至 50，攻击间隔缩短。' },
    ]
  },
  ironcactus: {
    levels: [
      { t:'0级 · 初始', d:'高频钢刺，每0.4秒14伤害，破甲×1.5。' },
      { t:'1级 · 利刺', d:'伤害提升至 22。' },
      { t:'2级 · 广刺', d:'攻击范围 +1格。' },
      { t:'3级 · 重破甲', d:'破甲提升至 ×2.5。' },
      { t:'4级 · 巨刺', d:'伤害提升至 32。' },
      { t:'5级 · 钢王', d:'范围再+1，破甲提升至 ×4。' },
    ]
  },
  thornking: {
    levels: [
      { t:'0级 · 初始', d:'厚甲荆棘王，每0.5秒反弹90伤害。' },
      { t:'1级 · 尖刺', d:'反弹伤害提升至 140。' },
      { t:'2级 · 溅刺', d:'反弹溅射相邻格。' },
      { t:'3级 · 减速刺', d:'反弹提升至 200，并减速。' },
      { t:'4级 · 巨甲', d:'血量提升至 8000。' },
      { t:'5级 · 荆棘帝', d:'反弹提升至 280，反弹可破甲。' },
    ]
  },
  frostshroom: {
    levels: [
      { t:'0级 · 初始', d:'每1.6秒射寒霜弹，18伤害并减速。' },
      { t:'1级 · 寒霜', d:'伤害提升至 28。' },
      { t:'2级 · 久冻', d:'减速更强。' },
      { t:'3级 · 双霜', d:'连射 2 发寒霜弹。' },
      { t:'4级 · 冻结', d:'伤害提升至 42，有概率冻结。' },
      { t:'5级 · 极寒', d:'伤害提升至 58，冻结概率提升。' },
    ]
  },
  stormflower: {
    levels: [
      { t:'0级 · 初始', d:'每1.4秒释放连锁闪电，劈中3个僵尸，30伤害。' },
      { t:'1级 · 强雷', d:'伤害提升至 45。' },
      { t:'2级 · 广链', d:'连锁目标提升至 5 个。' },
      { t:'3级 · 暴雷', d:'伤害提升至 65。' },
      { t:'4级 · 巨链', d:'连锁目标提升至 7 个。' },
      { t:'5级 · 雷神', d:'伤害提升至 90，连锁→9且眩晕。' },
    ]
  },
  poisonvine: {
    levels: [
      { t:'0级 · 初始', d:'每0.5秒6直接伤害 + 18/秒毒（3秒），范围0.9。' },
      { t:'1级 · 剧毒', d:'毒伤害提升至 28/秒。' },
      { t:'2级 · 广毒', d:'范围提升至 1.4格。' },
      { t:'3级 · 猛毒', d:'毒伤害提升至 40/秒。' },
      { t:'4级 · 巨广', d:'范围提升至 2.0格。' },
      { t:'5级 · 死毒', d:'毒提升至 60/秒，直接伤害→12。' },
    ]
  },
  lumapot: {
    levels: [
      { t:'0级 · 初始', d:'每1.5秒为周围植物回复25血，范围1格。' },
      { t:'1级 · 疗愈', d:'治疗量提升至 40。' },
      { t:'2级 · 广疗', d:'范围提升至 2 格。' },
      { t:'3级 · 圣疗', d:'治疗量提升至 60。' },
      { t:'4级 · 战意', d:'附加攻击力光环。' },
      { t:'5级 · 复活', d:'治疗提升至 90，可复活残血植物。' },
    ]
  },
  iceshard: {
    levels: [
      { t:'0级 · 初始', d:'身前5格减速力场，僵尸速度 ×0.5。' },
      { t:'1级 · 霜冻', d:'减速提升至 ×0.4。' },
      { t:'2级 · 广域', d:'范围提升至 7 格。' },
      { t:'3级 · 寒冻', d:'减速提升至 ×0.3。' },
      { t:'4级 · 巨域', d:'范围提升至 9 格。' },
      { t:'5级 · 冰封', d:'减速提升至 ×0.2，并附带冰冻。' },
    ]
  },
  venus: {
    levels: [
      { t:'0级 · 初始', d:'每2秒狙击同行最前僵尸，200伤害。' },
      { t:'1级 · 重狙', d:'伤害提升至 300。' },
      { t:'2级 · 远狙', d:'射程提升至全行。' },
      { t:'3级 · 强狙', d:'伤害提升至 420。' },
      { t:'4级 · 速狙', d:'攻击间隔缩短至 1.4 秒。' },
      { t:'5级 · 死神', d:'伤害提升至 600，可必杀残血。' },
    ]
  },
  shieldfern: {
    levels: [
      { t:'0级 · 初始', d:'为周围植物提供 40% 减伤，范围1格。' },
      { t:'1级 · 护盾', d:'减伤提升至 55%。' },
      { t:'2级 · 广盾', d:'范围提升至 2 格。' },
      { t:'3级 · 坚盾', d:'减伤提升至 70%。' },
      { t:'4级 · 反盾', d:'附带反伤。' },
      { t:'5级 · 神盾', d:'减伤提升至 85%，并提供护盾值。' },
    ]
  },
};

// 斗蛐蛐图鉴: 展示所有植物（通用 + 专属）的 0–5 级成长, 含每级升级所需经验
// 经验曲线: 全植物沿用统一曲线 xpCurveCost(level) = XP_BASE(50) * XP_MULT[level] (=[1,1,2,4,10])
// 每株植物可单独指定 xpMult 倍率(默认 1); 仅对拥有完整 0–5 级(共 6 条)的植物在图鉴展示逐级经验
function alpXpCost(type, level){
  if(type === 'potatomine' && level === 4) return Math.max(1, Math.round(10 * CRICKET_XP_GLOBAL_MULT * CRICKET_XP_EXTRA_MULT)); // 土豆地雷 4→5 专属(已叠加全局 -25% 与 ×85)
  let mult = (PLANTS[type] && PLANTS[type].xpMult) || 1;
  if(mult === 1 && isNonAttacker(type)) mult = NON_ATTACKER_XP_MULT; // 无法攻击植物升级经验降为 25%
  const disc = (level >= 0 && level < CRICKET_XP_DISCOUNT.length) ? CRICKET_XP_DISCOUNT[level] : 1; // 斗蛐蛐专属升级折扣
  return Math.max(1, Math.round(xpCurveCost(level) * mult * disc * CRICKET_XP_GLOBAL_MULT * CRICKET_XP_EXTRA_MULT)); // 全局 -25% 后再 ×85
}

function renderAlmanacCricket(container){
  // 展示全部植物（排除盲盒类植物），通用与斗蛐蛐专属都展示其 0–5 级成长
  const list = Object.keys(PLANTS).filter(t => !PLANTS[t].isBox && PLANTS[t]);
  let html = `<div class="alm-cricket-note">🥊 斗蛐蛐模式下，每株植物都拥有 0–5 级固定成长（初始 0 级，逐级获得固定增益与技能，不再随机）。下方以「通用」与「斗蛐蛐专属」区分来源，点击卡牌查看各等级能力及升级经验。仅拥有 6 级（0–5）的植物在每条 Lv.1+ 介绍下方标注「升至本级所需经验」。</div>`;
  for(const type of list){
    const cfg = PLANTS[type];
    const isCricketOnly = !!cfg.cricketOnly;

    // 0–5 级成长面板
    let lvHtml = '';
    const lvData = CRICKET_CODEX_LEVELS[type];
    const has6Lv = lvData && Array.isArray(lvData.levels) && lvData.levels.length >= 6;
    if(lvData && lvData.levels){
      let rows = '';
      lvData.levels.forEach((lv, i) => {
        const baseCls = i === 0 ? ' base' : '';
        let xpMultShow = '';
        const customMult = (PLANTS[type] && PLANTS[type].xpMult) || 1;
        if(customMult !== 1){
          xpMultShow = ` <span class="alm-lv-xpm">(${customMult}×)</span>`;
        } else if(isNonAttacker(type)){
          xpMultShow = ` <span class="alm-lv-xpm">(25%)</span>`;
        }
        const xpLine = (has6Lv && i >= 1)
          ? `<div class="alm-lv-xp">升至本级所需经验：<b>${alpXpCost(type, i - 1)}</b>${xpMultShow}</div>`
          : '';
        rows += `<div class="alm-lv-row${baseCls}">
          <div class="alm-lv-tag">Lv.${i}</div>
          <div class="alm-lv-body">
            <div class="alm-lv-title">${lv.t}</div>
            <div class="alm-lv-desc">${lv.d}</div>
            ${xpLine}
          </div>
        </div>`;
      });
      lvHtml = `<div class="alm-cricket-lv">
        <div class="alm-upg-title">📈 0–5 级成长</div>
        <div class="alm-lv-list">${rows}</div>
      </div>`;
    }

    html += `<div class="almanac-card">
      <div class="almanac-sprite">${createPlantHTML(type)}</div>
      <div class="almanac-info">
        <div class="almanac-name">${cfg.name} <span class="alm-tag-${isCricketOnly ? 'cricket' : 'normal'}">${isCricketOnly ? '斗蛐蛐专属' : '通用'}</span></div>
        ${lvHtml}
      </div>
    </div>`;
  }
  container.innerHTML = html;
}

let almanacTab = 'plants';

function openAlmanac(){
  document.getElementById('almanac-overlay').classList.add('show');
  // 恢复上次打开的标签(不再强制回到植物图鉴)
  document.querySelectorAll('.almanac-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === almanacTab);
  });
  renderAlmanac();
}

function closeAlmanac(){
  document.getElementById('almanac-overlay').classList.remove('show');
}

function switchAlmanacTab(tab){
  almanacTab = tab;
  document.querySelectorAll('.almanac-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderAlmanac();
}

function renderAlmanac(){
  const content = document.getElementById('almanac-content');
  if(almanacTab === 'plants'){
    renderAlmanacPlants(content);
  } else if(almanacTab === 'cricket'){
    renderAlmanacCricket(content);
  } else if(almanacTab === 'badges'){
    renderAlmanacBadges(content);
  } else if(almanacTab === 'valhalla'){
    // 英灵殿内嵌到图鉴: 先放说明, 再放一个子容器给 renderValhalla 填充
    content.innerHTML = '<div class="alm-cricket-note">🏛️ 这里收藏着你斗蛐蛐获胜的队伍。点击「⚔️ 摆出挑战」会直接进入布阵界面，把整支队伍放到某一行（可摆出多支不同的英灵队伍）。</div>' +
      '<div class="vh-grid" id="vh-grid-almanac"></div>';
    renderValhalla(document.getElementById('vh-grid-almanac'));
  } else {
    renderAlmanacZombies(content);
  }
}

// 徽章收藏页: 展示所有挑战徽章及等级 (铜/银/金)
function renderAlmanacBadges(container){
  let earned = 0, totalStages = 0;
  CHALLENGES.forEach(ch => {
    const lv = getChallengeBadgeLevel(ch.id);
    if(lv > 0){ earned++; totalStages += lv; }
  });
  let html = `<div class="badge-summary">已收集 <b>${earned}</b> / ${CHALLENGES.length} 枚徽章 · 阶段进度 <b>${totalStages}</b> / ${CHALLENGES.length * 3}<br>
    <span style="font-size:12px;color:#8D6E63;">每个挑战分 3 个阶段，通关更高阶段可将徽章从 🥉铜 升级为 🥈银、🥇金</span></div>`;
  html += '<div class="badge-grid">';
  CHALLENGES.forEach(ch => {
    const lv = getChallengeBadgeLevel(ch.id);
    if(lv > 0){
      const tier = BADGE_TIERS[lv];
      html += `<div class="badge-card">
        <div class="badge-medal ${tier.cls}">${ch.badgeIcon}</div>
        <div class="badge-name">${ch.badgeName}<br>· ${tier.name} ·</div>
        <div class="badge-stars">${tier.stars}</div>
        <div class="badge-stage-tag ${tier.cls}">${tier.name}级 · ${CHALLENGE_STAGES[lv-1].label}${CHALLENGE_STAGES[lv-1].name}</div>
        <div class="badge-from">来自「${ch.name}」</div>
      </div>`;
    } else {
      html += `<div class="badge-card locked">
        <div class="badge-medal">${ch.badgeIcon}</div>
        <div class="badge-name">？？？</div>
        <div class="badge-stars">☆☆☆</div>
        <div class="badge-from">通关「${ch.name}」Ⅰ初试获取</div>
      </div>`;
    }
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderAlmanacPlants(container){
  const plantTypes = ['peashooter','sunflower','wallnut','cherrybomb','snowpea','chomper','repeater','gatling','jalapeno','potatomine','torchwood','spikeweed','tallnut','cornpult','watermelon'];
  let html = '';
  for(const type of plantTypes){
    const cfg = PLANTS[type];
    const info = PLANT_INFO[type];
    const stats = info.stats;
    let badges = '';
    if(stats.hp !== undefined) badges += `<span class="stat-badge hp">❤ ${stats.hp}</span>`;
    if(stats.cost !== undefined) badges += `<span class="stat-badge cost">☀ ${stats.cost}</span>`;
    if(stats.cooldown !== undefined) badges += `<span class="stat-badge cooldown">⏱ ${stats.cooldown}</span>`;
    if(stats.damage !== undefined) badges += `<span class="stat-badge damage">⚔ ${stats.damage}</span>`;
    if(stats.special !== undefined) badges += `<span class="stat-badge special">★ ${stats.special}</span>`;

    // 升级效果展示 (数值升级展开, 专属技能点击展开)
    let upgHtml = '';
    const pool = PLANT_UPGRADES[type];
    if(pool){
      let statsHtml = '';
      (pool.stats || []).forEach(s => {
        statsHtml += `<span class="alm-stat-item">${s.icon} ${s.name} <span class="lv">${s.desc}·最高${s.max}级</span></span>`;
      });
      let skillsHtml = '';
      (pool.skills || []).forEach(sk => {
        let lvls = '';
        sk.levels.forEach((lv, i) => { lvls += `<div class="alm-skill-level"><b>Lv.${i+1}</b>${lv.desc}</div>`; });
        skillsHtml += `<details class="alm-skill">
          <summary><span class="arrow">▶</span>${sk.icon} ${sk.name} <span class="sk-max">(${sk.max}级·点击展开)</span></summary>
          <div class="alm-skill-levels">${lvls}</div>
        </details>`;
      });
      upgHtml = `<div class="alm-upgrades">
        <div class="alm-upg-title">⬆ 数值升级</div>
        <div class="alm-stats-list">${statsHtml}</div>
        <div class="alm-upg-title">✨ 专属技能</div>
        ${skillsHtml}
      </div>`;
    }

    html += `<div class="almanac-card">
      <div class="almanac-sprite">${createPlantHTML(type)}</div>
      <div class="almanac-info">
        <div class="almanac-name">${cfg.name}</div>
        <div class="almanac-desc">${info.desc}</div>
        <div class="almanac-stats">${badges}</div>
        ${upgHtml}
      </div>
    </div>`;
  }
  container.innerHTML = html;
}

function renderAlmanacZombies(container){
  const zombieTypes = ['basic','flag','conehead','polevaulter','buckethead','newspaper','football','dancing','imp','giant'];
  let html = '';
  for(const type of zombieTypes){
    const cfg = ZOMBIES[type];
    const info = ZOMBIE_INFO[type];
    const stats = info.stats;
    let badges = '';
    if(stats.hp !== undefined) badges += `<span class="stat-badge hp">❤ ${stats.hp}</span>`;
    if(stats.speed !== undefined) badges += `<span class="stat-badge speed">🏃 ${stats.speed}</span>`;
    if(stats.damage !== undefined) badges += `<span class="stat-badge damage">⚔ ${stats.damage}</span>`;
    if(stats.special !== undefined) badges += `<span class="stat-badge special">★ ${stats.special}</span>`;

    html += `<div class="almanac-card">
      <div class="almanac-sprite">${createZombieHTML(type)}</div>
      <div class="almanac-info">
        <div class="almanac-name">${cfg.name}</div>
        <div class="almanac-desc">${info.desc}</div>
        <div class="almanac-stats">${badges}</div>
      </div>
    </div>`;
  }
  container.innerHTML = html;
}

// ============================================================
// 关卡配置
// ============================================================
const LEVELS = [
  {
    name:'初出茅庐', difficulty:'easy', desc:'5波普通僵尸，轻松上手',
    startSun:100, waves:'1-5', plants:['sunflower','peashooter','wallnut'],
    special:null,
  },
  {
    name:'旗帜飘扬', difficulty:'easy', desc:'5波，旗帜僵尸登场',
    startSun:75, waves:'1-5', plants:['sunflower','peashooter','wallnut','snowpea'],
    special:null,
  },
  {
    name:'路障来袭', difficulty:'normal', desc:'6波，路障与撑杆僵尸',
    startSun:75, waves:'1-6', plants:['sunflower','peashooter','wallnut','snowpea','cherrybomb','spikeweed'],
    special:null,
  },
  {
    name:'铁桶防线', difficulty:'normal', desc:'6波，铁桶僵尸登场',
    startSun:75, waves:'1-6', plants:['sunflower','peashooter','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut'],
    special:null,
  },
  {
    name:'暴怒报纸', difficulty:'normal', desc:'7波，报纸僵尸暴怒加速',
    startSun:75, waves:'1-7', plants:['sunflower','peashooter','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','repeater','cornpult'],
    special:null,
  },
  {
    name:'橄榄冲撞', difficulty:'hard', desc:'7波，橄榄球僵尸高血量高速',
    startSun:50, waves:'1-7', plants:['sunflower','peashooter','repeater','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','cornpult','jalapeno'],
    special:null,
  },
  {
    name:'迪斯科之夜', difficulty:'hard', desc:'7波，跳舞僵尸召唤小鬼',
    startSun:50, waves:'1-7', plants:['sunflower','peashooter','repeater','torchwood','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','cornpult','watermelon','jalapeno'],
    special:null,
  },
  {
    name:'极速风暴', difficulty:'hard', desc:'7波，所有僵尸速度+30%',
    startSun:50, waves:'1-7', plants:['sunflower','peashooter','repeater','torchwood','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','cornpult','watermelon','jalapeno'],
    special:'fast',
  },
  {
    name:'暗夜降临', difficulty:'extreme', desc:'7波，阳光掉落减半',
    startSun:50, waves:'1-7', plants:['sunflower','peashooter','repeater','torchwood','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','cornpult','watermelon','jalapeno'],
    special:'dark',
  },
  {
    name:'终极决战', difficulty:'extreme', desc:'7波全量僵尸，速度+30%，阳光减半',
    startSun:50, waves:'1-7', plants:['sunflower','peashooter','repeater','gatling','torchwood','wallnut','snowpea','cherrybomb','chomper','potatomine','spikeweed','tallnut','cornpult','watermelon','jalapeno'],
    special:'apocalypse',
  },
];

// 根据关卡waves配置生成WAVES子集
function getLevelWaves(levelIdx){
  const level = LEVELS[levelIdx];
  const range = level.waves.split('-');
  const start = parseInt(range[0]) - 1;
  const end = parseInt(range[1]);
  return WAVES.slice(start, end);
}

// ============================================================
// 挑战模式
// config 字段说明:
//   startSun   起始阳光
//   plants     可用植物列表 (挑战可为空 = 不可种植)
//   waves      自定义波次 (僵尸可带 row 字段固定行, 否则随机行)
//   prePlaced  开局预置植物 [{type,row,col}]
//   gloveNoCd  手套无冷却
//   noSunDrop  不掉落天降阳光
// ============================================================
const CHALLENGES = [
  {
    id: 'lastplant',
    name: '最后一植',
    icon: '🫘',
    badgeIcon: '🎯',
    badgeName: '孤胆射手徽章',
    desc: '第5列预置一排坚果墙，第1列仅有一个豌豆射手。无法种植新植物，用手套（无冷却）移动唯一的射手驰援各行，守住全场！',
    rules: ['🧤 手套无冷却', '🚫 无法种植', '☀️ 无阳光掉落', '🥜 预置坚果墙'],
    difficulty: 'hard',
    rewardCoins: 200,
    config: {
      startSun: 0,
      plants: [],
      gloveNoCd: true,
      noSunDrop: true,
      prePlaced: [
        {type:'wallnut', row:0, col:4},
        {type:'wallnut', row:1, col:4},
        {type:'wallnut', row:2, col:4},
        {type:'wallnut', row:3, col:4},
        {type:'wallnut', row:4, col:4},
        {type:'peashooter', row:2, col:0},
      ],
      waves: [
        { zombies: [
          {type:'basic',time:3},{type:'basic',time:22},{type:'basic',time:42},{type:'basic',time:60},
        ]},
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:18},{type:'conehead',time:34},
          {type:'basic',time:50},{type:'basic',time:66},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'basic',time:6},{type:'basic',time:16},
          {type:'conehead',time:28},{type:'basic',time:40},{type:'basic',time:52},
          {type:'conehead',time:64},{type:'basic',time:76},
        ]},
      ],
    },
  },
  {
    id: 'blitz',
    name: '闪电战',
    icon: '⚡',
    badgeIcon: '⚡',
    badgeName: '闪电徽章',
    desc: '僵尸全员加速50%，发育时间只有10秒，波次接踵而至。考验你的快速布防能力！',
    rules: ['🏃 僵尸速度x1.5', '⏱️ 发育仅10秒', '🌊 4波速攻'],
    difficulty: 'normal',
    rewardCoins: 150,
    config: {
      startSun: 150,
      graceSeconds: 10,
      zombieSpeedMult: 1.5,
      plants: ['sunflower','peashooter','wallnut','repeater','snowpea','potatomine','cherrybomb'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:12},{type:'basic',time:24},{type:'basic',time:34},
        ]},
        { zombies: [
          {type:'basic',time:1},{type:'conehead',time:10},{type:'basic',time:20},
          {type:'basic',time:28},{type:'conehead',time:38},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'basic',time:5},{type:'conehead',time:12},
          {type:'polevaulter',time:20},{type:'basic',time:28},{type:'conehead',time:36},
          {type:'polevaulter',time:44},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:4},{type:'conehead',time:10},
          {type:'buckethead',time:18},{type:'polevaulter',time:24},{type:'conehead',time:32},
          {type:'buckethead',time:40},{type:'basic',time:48},{type:'basic',time:52},
        ]},
      ],
    },
  },
  {
    id: 'irontide',
    name: '钢铁洪流',
    icon: '🛡️',
    badgeIcon: '🛡️',
    badgeName: '钢铁徽章',
    desc: '铁桶与橄榄球组成重甲军团碾压而来，血量再提升20%。用火炬与投手穿透重甲吧！',
    rules: ['🪖 重甲僵尸为主', '❤️ 僵尸血量x1.2', '🔥 预置火炬树桩'],
    difficulty: 'hard',
    rewardCoins: 250,
    config: {
      startSun: 200,
      zombieHpMult: 1.2,
      plants: ['sunflower','peashooter','repeater','torchwood','wallnut','snowpea','cornpult','watermelon','cherrybomb','jalapeno'],
      prePlaced: [
        {type:'torchwood', row:0, col:2},{type:'torchwood', row:1, col:2},
        {type:'torchwood', row:2, col:2},{type:'torchwood', row:3, col:2},
        {type:'torchwood', row:4, col:2},
      ],
      waves: [
        { zombies: [
          {type:'buckethead',time:2},{type:'basic',time:20},{type:'buckethead',time:40},{type:'basic',time:58},
        ]},
        { zombies: [
          {type:'football',time:2},{type:'buckethead',time:16},{type:'basic',time:30},
          {type:'buckethead',time:46},{type:'football',time:62},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'football',time:4},{type:'buckethead',time:10},
          {type:'buckethead',time:18},{type:'football',time:28},{type:'buckethead',time:38},
          {type:'football',time:48},{type:'buckethead',time:58},{type:'football',time:68},
        ]},
      ],
    },
  },
  {
    id: 'olympics',
    name: '撑杆跳大赛',
    icon: '🏃',
    badgeIcon: '🤸',
    badgeName: '跳高徽章',
    desc: '撑杆僵尸组团来袭，轻松跃过普通植物！高坚果是他们唯一无法逾越的屏障。',
    rules: ['🤸 撑杆僵尸为主', '🥜 高坚果可阻挡跳跃'],
    difficulty: 'normal',
    rewardCoins: 150,
    config: {
      startSun: 150,
      plants: ['sunflower','peashooter','repeater','tallnut','wallnut','snowpea','chomper','potatomine'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'polevaulter',time:22},{type:'basic',time:42},{type:'polevaulter',time:60},
        ]},
        { zombies: [
          {type:'polevaulter',time:2},{type:'polevaulter',time:14},{type:'conehead',time:28},
          {type:'polevaulter',time:42},{type:'polevaulter',time:56},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'polevaulter',time:4},{type:'polevaulter',time:10},
          {type:'conehead',time:20},{type:'polevaulter',time:30},{type:'polevaulter',time:40},
          {type:'buckethead',time:52},{type:'polevaulter',time:62},{type:'polevaulter',time:70},
        ]},
      ],
    },
  },
  {
    id: 'pressrush',
    name: '新闻风暴',
    icon: '📰',
    badgeIcon: '📰',
    badgeName: '头条徽章',
    desc: '报社全体出动！报纸被打碎后他们会暴怒狂奔——速战速决，别给他们发飙的机会。',
    rules: ['📰 报纸僵尸海量', '😡 暴怒后速度狂飙'],
    difficulty: 'normal',
    rewardCoins: 150,
    config: {
      startSun: 150,
      plants: ['sunflower','peashooter','repeater','gatling','snowpea','wallnut','tallnut','cherrybomb','jalapeno'],
      waves: [
        { zombies: [
          {type:'newspaper',time:2},{type:'basic',time:20},{type:'newspaper',time:40},{type:'basic',time:58},
        ]},
        { zombies: [
          {type:'newspaper',time:2},{type:'newspaper',time:16},{type:'conehead',time:32},
          {type:'newspaper',time:48},{type:'newspaper',time:62},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'newspaper',time:4},{type:'newspaper',time:12},
          {type:'conehead',time:22},{type:'newspaper',time:32},{type:'newspaper',time:42},
          {type:'buckethead',time:54},{type:'newspaper',time:64},{type:'newspaper',time:72},
        ]},
      ],
    },
  },
  {
    id: 'dancenight',
    name: '舞王之夜',
    icon: '💃',
    badgeIcon: '🕺',
    badgeName: '舞王徽章',
    desc: '迪斯科僵尸开演唱会了！他们会不停召唤小鬼伴舞，优先集火舞王，否则小鬼会越来越多！',
    rules: ['💃 跳舞僵尸召唤小鬼', '👶 小鬼速度极快'],
    difficulty: 'hard',
    rewardCoins: 200,
    config: {
      startSun: 175,
      plants: ['sunflower','peashooter','repeater','snowpea','wallnut','spikeweed','chomper','cherrybomb','watermelon'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'dancing',time:25},{type:'basic',time:45},{type:'basic',time:62},
        ]},
        { zombies: [
          {type:'dancing',time:2},{type:'conehead',time:18},{type:'dancing',time:36},
          {type:'basic',time:52},{type:'dancing',time:66},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'dancing',time:4},{type:'dancing',time:14},
          {type:'conehead',time:26},{type:'dancing',time:38},{type:'imp',time:48},
          {type:'dancing',time:58},{type:'buckethead',time:68},{type:'dancing',time:78},
        ]},
      ],
    },
  },
  {
    id: 'imprush',
    name: '小鬼狂潮',
    icon: '👶',
    badgeIcon: '👻',
    badgeName: '驱鬼徽章',
    desc: '数不尽的小鬼僵尸蜂拥而至，速度快、数量多！地刺与范围伤害是你的最佳朋友。',
    rules: ['👶 小鬼海量来袭', '🏃 速度+20%', '🌊 4波狂潮'],
    difficulty: 'normal',
    rewardCoins: 150,
    config: {
      startSun: 150,
      zombieSpeedMult: 1.2,
      plants: ['sunflower','peashooter','repeater','snowpea','spikeweed','wallnut','jalapeno','cherrybomb','torchwood'],
      waves: [
        { zombies: [
          {type:'imp',time:2},{type:'imp',time:8},{type:'imp',time:14},{type:'imp',time:20},
          {type:'imp',time:26},{type:'imp',time:32},
        ]},
        { zombies: [
          {type:'imp',time:1},{type:'imp',time:5},{type:'conehead',time:10},{type:'imp',time:16},
          {type:'imp',time:22},{type:'imp',time:28},{type:'imp',time:34},{type:'imp',time:40},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'imp',time:3},{type:'imp',time:7},{type:'imp',time:11},
          {type:'conehead',time:16},{type:'imp',time:22},{type:'imp',time:26},{type:'imp',time:30},
          {type:'buckethead',time:38},{type:'imp',time:44},{type:'imp',time:48},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'imp',time:2},{type:'imp',time:5},{type:'imp',time:8},
          {type:'imp',time:11},{type:'imp',time:14},{type:'imp',time:17},{type:'imp',time:20},
          {type:'imp',time:23},{type:'imp',time:26},{type:'imp',time:29},{type:'imp',time:32},
          {type:'imp',time:35},{type:'imp',time:38},
        ]},
      ],
    },
  },
  {
    id: 'darknight',
    name: '暗夜无光',
    icon: '🌑',
    badgeIcon: '🌙',
    badgeName: '月夜徽章',
    desc: '漆黑的夜晚，天空不再降下阳光——你的每一缕阳光都要靠向日葵亲手产出！',
    rules: ['☀️ 无天降阳光', '🌻 仅靠向日葵产阳光', '⏱️ 发育30秒'],
    difficulty: 'hard',
    rewardCoins: 200,
    config: {
      startSun: 100,
      noSunDrop: true,
      graceSeconds: 30,
      plants: ['sunflower','peashooter','repeater','snowpea','wallnut','potatomine','cherrybomb','jalapeno','spikeweed'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:22},{type:'conehead',time:44},{type:'basic',time:62},
        ]},
        { zombies: [
          {type:'basic',time:2},{type:'conehead',time:18},{type:'basic',time:36},
          {type:'buckethead',time:54},{type:'basic',time:70},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:5},{type:'basic',time:14},
          {type:'buckethead',time:26},{type:'conehead',time:40},{type:'polevaulter',time:52},
          {type:'buckethead',time:64},{type:'conehead',time:76},
        ]},
      ],
    },
  },
  {
    id: 'midnightrush',
    name: '无眠突袭',
    icon: '🌙',
    badgeIcon: '☄️',
    badgeName: '守夜徽章',
    desc: '没有发育时间，开局第1秒僵尸就已冲来！好在开局自带防御阵型——立即迎战！',
    rules: ['🚫 无发育阶段', '🕐 开局即开波', '🥜 预置防御阵'],
    difficulty: 'hard',
    rewardCoins: 220,
    config: {
      startSun: 50,
      graceSeconds: 0,
      plants: ['sunflower','peashooter','wallnut','snowpea','potatomine','cherrybomb'],
      prePlaced: [
        {type:'peashooter', row:0, col:1},{type:'peashooter', row:1, col:1},
        {type:'peashooter', row:2, col:1},{type:'peashooter', row:3, col:1},
        {type:'peashooter', row:4, col:1},
        {type:'wallnut', row:0, col:4},{type:'wallnut', row:1, col:4},
        {type:'wallnut', row:2, col:4},{type:'wallnut', row:3, col:4},
        {type:'wallnut', row:4, col:4},
      ],
      waves: [
        { zombies: [
          {type:'basic',time:1},{type:'basic',time:14},{type:'conehead',time:30},{type:'basic',time:46},{type:'basic',time:60},
        ]},
        { zombies: [
          {type:'basic',time:1},{type:'conehead',time:12},{type:'basic',time:26},
          {type:'polevaulter',time:40},{type:'conehead',time:54},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:6},{type:'basic',time:14},
          {type:'buckethead',time:24},{type:'polevaulter',time:34},{type:'conehead',time:46},
          {type:'buckethead',time:58},{type:'basic',time:70},
        ]},
      ],
    },
  },
  {
    id: 'icespice',
    name: '冰火两重天',
    icon: '❄️',
    badgeIcon: '🌡️',
    badgeName: '冰火徽章',
    desc: '阵容限定：只能使用豌豆、寒冰、火炬、坚果与向日葵。善用冰豌豆过火变双倍寒火弹的精髓连招！',
    rules: ['🧊 阵容严格限定', '🔥 火炬+寒冰连招', '🚫 无樱桃无辣椒'],
    difficulty: 'normal',
    rewardCoins: 180,
    config: {
      startSun: 150,
      plants: ['sunflower','peashooter','snowpea','torchwood','wallnut','tallnut'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:20},{type:'conehead',time:40},{type:'basic',time:58},
        ]},
        { zombies: [
          {type:'conehead',time:2},{type:'basic',time:16},{type:'buckethead',time:32},
          {type:'conehead',time:48},{type:'basic',time:62},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:5},{type:'buckethead',time:14},
          {type:'basic',time:24},{type:'football',time:36},{type:'conehead',time:50},
          {type:'buckethead',time:62},{type:'basic',time:74},
        ]},
      ],
    },
  },
  {
    id: 'grinder',
    name: '绞肉机',
    icon: '🌽',
    badgeIcon: '⚙️',
    badgeName: '绞肉徽章',
    desc: '你只能使用坚果、高坚果、地刺和食人花防御——没有射手！用坚壁与陷阱磨碎它们！',
    rules: ['🚫 无远程植物', '🥜 坚果+地刺+食人花', '🚫 禁用铲子'],
    difficulty: 'hard',
    rewardCoins: 260,
    config: {
      startSun: 200,
      noShovel: true,
      plants: ['wallnut','tallnut','spikeweed','chomper','potatomine'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:20},{type:'basic',time:40},{type:'conehead',time:58},
        ]},
        { zombies: [
          {type:'conehead',time:2},{type:'basic',time:16},{type:'conehead',time:32},
          {type:'basic',time:48},{type:'conehead',time:62},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:5},{type:'buckethead',time:14},
          {type:'basic',time:26},{type:'conehead',time:38},{type:'buckethead',time:50},
          {type:'polevaulter',time:62},{type:'conehead',time:74},
        ]},
      ],
    },
  },
  {
    id: 'sunbank',
    name: '阳光银行',
    icon: '🏦',
    badgeIcon: '💰',
    badgeName: '首富徽章',
    desc: '开局赠送1000阳光，但僵尸也会一波接一波永不停歇地进攻。存钱不如花光！',
    rules: ['☀️ 开局1000阳光', '🌊 5波进攻', '😌 入门友好'],
    difficulty: 'easy',
    rewardCoins: 80,
    config: {
      startSun: 1000,
      plants: ['sunflower','peashooter','wallnut','snowpea','repeater','cherrybomb','potatomine','jalapeno'],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:20},{type:'basic',time:40},
        ]},
        { zombies: [
          {type:'conehead',time:2},{type:'basic',time:16},{type:'basic',time:32},{type:'conehead',time:50},
        ]},
        { zombies: [
          {type:'basic',time:2},{type:'conehead',time:14},{type:'buckethead',time:30},{type:'basic',time:46},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:6},{type:'polevaulter',time:18},
          {type:'buckethead',time:32},{type:'conehead',time:46},{type:'basic',time:60},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'buckethead',time:4},{type:'conehead',time:14},
          {type:'football',time:26},{type:'buckethead',time:40},{type:'conehead',time:54},
          {type:'buckethead',time:66},
        ]},
      ],
    },
  },
  {
    id: 'doomsday',
    name: '末日降临',
    icon: '💀',
    badgeIcon: '☠️',
    badgeName: '末日徽章',
    desc: '最强挑战！僵尸血量+30%、速度+30%，全明星阵容轮番轰炸，发育时间只有15秒。你能撑到最后吗？',
    rules: ['❤️ 血量x1.3', '🏃 速度x1.3', '⏱️ 发育仅15秒', '💀 全明星僵尸'],
    difficulty: 'extreme',
    rewardCoins: 400,
    config: {
      startSun: 250,
      zombieHpMult: 1.3,
      zombieSpeedMult: 1.3,
      graceSeconds: 15,
      plants: ['sunflower','peashooter','repeater','gatling','torchwood','snowpea','tallnut','watermelon','cherrybomb','jalapeno','spikeweed'],
      waves: [
        { zombies: [
          {type:'conehead',time:2},{type:'conehead',time:16},{type:'buckethead',time:32},
          {type:'conehead',time:48},{type:'basic',time:62},
        ]},
        { zombies: [
          {type:'football',time:2},{type:'buckethead',time:14},{type:'polevaulter',time:26},
          {type:'buckethead',time:40},{type:'football',time:54},{type:'conehead',time:68},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'dancing',time:4},{type:'buckethead',time:12},
          {type:'football',time:22},{type:'newspaper',time:34},{type:'buckethead',time:46},
          {type:'polevaulter',time:58},{type:'football',time:70},{type:'dancing',time:82},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'football',time:3},{type:'buckethead',time:8},
          {type:'football',time:16},{type:'dancing',time:24},{type:'buckethead',time:32},
          {type:'football',time:42},{type:'newspaper',time:52},{type:'buckethead',time:62},
          {type:'football',time:72},{type:'dancing',time:82},{type:'football',time:92},
        ]},
      ],
    },
  },
  {
    id: 'highway',
    name: '中央高速',
    icon: '🛣️',
    badgeIcon: '🏁',
    badgeName: '旗手徽章',
    desc: '所有僵尸只从中央3行（第2/3/4行）进攻，边路绝对安全！把火力集中到中路，构筑死亡走廊！',
    rules: ['🛣️ 僵尸只走中路3行', '🎯 火力集中', '🌊 4波车流'],
    difficulty: 'normal',
    rewardCoins: 130,
    config: {
      startSun: 150,
      plants: ['sunflower','peashooter','repeater','torchwood','wallnut','snowpea','spikeweed','cherrybomb'],
      waves: [
        { zombies: [
          {type:'basic',time:2,row:2},{type:'basic',time:18,row:1},{type:'basic',time:34,row:3},
          {type:'basic',time:50,row:2},
        ]},
        { zombies: [
          {type:'conehead',time:2,row:2},{type:'basic',time:14,row:1},{type:'conehead',time:28,row:3},
          {type:'basic',time:42,row:2},{type:'conehead',time:56,row:1},
        ]},
        { zombies: [
          {type:'flag',time:1,row:2},{type:'basic',time:6,row:1},{type:'basic',time:6,row:3},
          {type:'conehead',time:18,row:2},{type:'buckethead',time:32,row:1},
          {type:'conehead',time:46,row:3},{type:'buckethead',time:60,row:2},
        ]},
        { zombies: [
          {type:'flag',time:1,row:2},{type:'conehead',time:4,row:1},{type:'conehead',time:4,row:3},
          {type:'buckethead',time:12,row:2},{type:'polevaulter',time:24,row:1},
          {type:'buckethead',time:36,row:3},{type:'conehead',time:48,row:2},
          {type:'buckethead',time:60,row:1},{type:'buckethead',time:60,row:3},
        ]},
      ],
    },
  },
  {
    id: 'daisychain',
    name: '极限接力',
    icon: '🔗',
    badgeIcon: '🥇',
    badgeName: '接力徽章',
    desc: '开局只有一个向日葵和一个机枪射手，无天降阳光、无法种植——机枪吃经验进化，手套无冷却全场救火！',
    rules: ['🚫 无法种植', '☀️ 无阳光掉落', '🧤 手套无冷却', '🔫 预置机枪射手'],
    difficulty: 'extreme',
    rewardCoins: 380,
    config: {
      startSun: 0,
      plants: [],
      gloveNoCd: true,
      noSunDrop: true,
      graceSeconds: 12,
      prePlaced: [
        {type:'sunflower', row:2, col:0},
        {type:'gatling', row:2, col:1},
      ],
      waves: [
        { zombies: [
          {type:'basic',time:2},{type:'basic',time:20},{type:'basic',time:38},{type:'basic',time:54},
        ]},
        { zombies: [
          {type:'conehead',time:2},{type:'basic',time:16},{type:'conehead',time:32},
          {type:'basic',time:48},{type:'conehead',time:62},
        ]},
        { zombies: [
          {type:'flag',time:1},{type:'conehead',time:6},{type:'buckethead',time:18},
          {type:'conehead',time:32},{type:'buckethead',time:46},{type:'conehead',time:60},
          {type:'buckethead',time:72},
        ]},
      ],
    },
  },
];

// 当前挑战索引 (-1 = 非挑战模式)
let currentChallengeIdx = -1;
// 当前挑战阶段 (1~3)
let currentChallengeStage = 1;

// 挑战阶段配置: 每阶段逐步加大难度, 徽章随之升级 (1铜/2银/3金)
const CHALLENGE_STAGES = [
  { label:'Ⅰ', name:'初试', hpMult:1,    speedMult:1,    timeMult:1,    sunMult:1    },
  { label:'Ⅱ', name:'进阶', hpMult:1.35, speedMult:1.15, timeMult:0.85, sunMult:0.75 },
  { label:'Ⅲ', name:'极限', hpMult:1.75, speedMult:1.3,  timeMult:0.7,  sunMult:0.5  },
];
const BADGE_TIERS = [
  null,
  { name:'铜', stars:'★☆☆', cls:'tier-1' },
  { name:'银', stars:'★★☆', cls:'tier-2' },
  { name:'金', stars:'★★★', cls:'tier-3' },
];

// 获取某挑战已获得的徽章等级 (0=未获得, 1~3)
function getChallengeBadgeLevel(id){
  const v = progress.challengeBadges && progress.challengeBadges[id];
  return (v === true) ? 1 : (v || 0); // 兼容旧存档的 true
}

function getChallengeCfg(){
  return currentChallengeIdx >= 0 ? CHALLENGES[currentChallengeIdx] : null;
}

function openChallengeSelect(){
  showScreen('challenge-screen');
  renderChallengeSelect();
}

function renderChallengeSelect(){
  document.getElementById('ch-coins').textContent = progress.coins;
  const grid = document.getElementById('ch-grid');
  let html = '';
  CHALLENGES.forEach((ch, i) => {
    const badgeLv = getChallengeBadgeLevel(ch.id);
    const diffText = ch.difficulty === 'easy' ? '简单' :
                     ch.difficulty === 'normal' ? '普通' :
                     ch.difficulty === 'hard' ? '困难' : '极难';
    const rulesHtml = ch.rules.map(r => `<span class="ch-rule">${r}</span>`).join('');
    // 阶段按钮: 已完成=done(可重打), 下一阶段=open, 其后=locked
    let stagesHtml = '';
    for(let s = 1; s <= 3; s++){
      const st = CHALLENGE_STAGES[s - 1];
      const stateCls = s <= badgeLv ? 'done' : (s === badgeLv + 1 ? 'open' : 'locked');
      const stSub = s <= badgeLv ? '✓ 已通关' : (s === badgeLv + 1 ? '可挑战' : '🔒');
      stagesHtml += `<button class="ch-stage-btn ${stateCls}" ${stateCls === 'locked' ? 'disabled' : ''}
        onclick="event.stopPropagation();startChallenge(${i},${s})">
        <span class="st-label">${st.label} ${st.name}</span>
        <span class="st-sub">${stSub}</span>
      </button>`;
    }
    // 点击整卡 = 进入下一个可挑战阶段 (阶段按钮可指定阶段)
    const nextStage = Math.min(badgeLv + 1, 3);
    html += `<div class="challenge-card ${badgeLv > 0 ? 'completed' : ''}" onclick="startChallenge(${i},${nextStage})" title="点击进入 ${CHALLENGE_STAGES[nextStage - 1].label}${CHALLENGE_STAGES[nextStage - 1].name}阶段">
      <div class="ch-header">
        <div class="ch-icon">${ch.icon}</div>
        <div>
          <div class="ch-name">${ch.name} ${badgeLv > 0 ? `<span style="font-size:13px;color:${BADGE_TIERS[badgeLv].cls === 'tier-3' ? '#FFD700' : BADGE_TIERS[badgeLv].cls === 'tier-2' ? '#CFD8DC' : '#CD7F32'}">🏅${BADGE_TIERS[badgeLv].name}</span>` : ''}</div>
          <span class="ch-diff ${ch.difficulty}">${diffText}</span>
        </div>
      </div>
      <div class="ch-desc">${ch.desc}</div>
      <div class="ch-rules">${rulesHtml}</div>
      <div class="ch-stage-info">难度: Ⅰ基础 → Ⅱ血量+35%/速度+15% → Ⅲ血量+75%/速度+30% (徽章 <b>铜→银→金</b>) · 🖱️ 点击卡片进入下一阶段</div>
      <div class="ch-footer">
        <div class="ch-stages">${stagesHtml}</div>
        <div class="ch-reward">🪙 ${ch.rewardCoins}~${ch.rewardCoins * 3}</div>
      </div>
    </div>`;
  });
  grid.innerHTML = html;
}

function startChallenge(idx, stage){
  const ch = CHALLENGES[idx];
  if(!ch) return;
  stage = stage || 1;
  // 必须按顺序解锁: 不能挑战超过 (当前徽章等级+1) 的阶段
  if(stage > getChallengeBadgeLevel(ch.id) + 1) return;
  currentChallengeIdx = idx;
  currentChallengeStage = stage;
  const st = CHALLENGE_STAGES[stage - 1];
  // 阶段缩放: 阳光按比例减少 (0阳光挑战保持0)
  const scaledSun = ch.config.startSun > 0 ? Math.max(50, Math.floor(ch.config.startSun * st.sunMult)) : 0;
  currentLevelConfig = {
    name: '挑战: ' + ch.name + ' ' + st.label + st.name,
    difficulty: ch.difficulty,
    startSun: scaledSun,
    plants: ch.config.plants,
    special: null,
  };
  // 波次时间按阶段压缩
  currentLevelWaves = JSON.parse(JSON.stringify(ch.config.waves)).map(w => ({
    zombies: w.zombies.map(z => ({ ...z, time: Math.max(1, Math.round(z.time * st.timeMult)) })),
  }));
  chosenPlants = ch.config.plants.slice(); // 挑战固定阵容, 无战前选卡
  // 直接开始战斗 (挑战不进选植物界面)
  showScreen(null);
  state.gameMode = 'challenge';
  state.challengeId = ch.id;
  resetGameState();
  initGame();
}

// 是否当前挑战生效某机制
function challengeFlag(flag){
  const ch = getChallengeCfg();
  return !!(ch && ch.config[flag]);
}

// 开局预置植物 (initGame 中调用)
function placePrePlacedPlants(){
  const ch = getChallengeCfg();
  if(!ch || !ch.config.prePlaced) return;
  for(const pp of ch.config.prePlaced){
    const cfg = PLANTS[pp.type];
    if(!cfg) continue;
    const upgradedHp = getPlantHp(cfg.hp);
    const plant = {
      type: pp.type,
      row: pp.row,
      col: pp.col,
      name: null,
      hp: upgradedHp,
      maxHp: upgradedHp,
      actionTimer: cfg.actionInterval || 0,
      attackInterval: cfg.actionInterval || 0,
      shots: cfg.shots || 1,
      armed: false,
      armTimer: cfg.armTime || 0,
      el: null,
      digesting: false,
      digestTimer: 0,
      damage: cfg.damage ? getPlantDamage(cfg.damage) : cfg.damage,
      level: 1,
      xp: 0,
      xpToNext: xpToNextFor(1, pp.type),
      levelReady: false,
      kills: 0,
      statLevels: {},
      skills: {},
      crossSkills: {},
      crossLevelReady: false,
      crossTimer: 0,
    };
    const wrapper = document.createElement('div');
    wrapper.className = 'plant-wrapper';
    wrapper.innerHTML = createPlantHTML(pp.type);
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    hpBar.innerHTML = '<div class="hp-fill high"></div>';
    wrapper.appendChild(hpBar);
    const lvlDiv = document.createElement('div');
    lvlDiv.className = 'plant-level';
    lvlDiv.textContent = 'Lv.1';
    wrapper.appendChild(lvlDiv);
    const xpBar = document.createElement('div');
    xpBar.className = 'xp-bar';
    xpBar.innerHTML = '<div class="xp-fill"></div>';
    wrapper.appendChild(xpBar);
    const devDiv = document.createElement('div');
    devDiv.className = 'devour-level';
    devDiv.textContent = '吞0';
    devDiv.style.display = 'none';
    wrapper.appendChild(devDiv);
    plant.el = wrapper;
    updateDevourLevel(plant);
    const cells = document.querySelectorAll('.cell');
    cells[pp.row * COLS + pp.col].appendChild(wrapper);
    state.grid[pp.row][pp.col].push(plant);
  }
}

// ============================================================
// 局外成长系统 (localStorage 持久化)
// ============================================================
const UPGRADES = {
  sunBonus: {
    name:'☀ 阳光储备', desc:'每级增加25点起始阳光', icon:'☀️',
    maxLevel:5, costs:[100,200,350,550,800],
    values:[25,50,75,100,125],
  },
  plantHp: {
    name:'🛡️ 植物强化', desc:'每级增加10%植物血量', icon:'🛡️',
    maxLevel:5, costs:[150,300,500,750,1100],
    values:[0.1,0.2,0.3,0.4,0.5],
  },
  plantDmg: {
    name:'⚔ 火力提升', desc:'每级增加10%植物伤害', icon:'⚔️',
    maxLevel:5, costs:[200,400,650,950,1300],
    values:[0.1,0.2,0.3,0.4,0.5],
  },
  cooldown: {
    name:'⏱ 冷却缩减', desc:'每级减少10%植物冷却时间', icon:'⏱️',
    maxLevel:3, costs:[300,600,1000],
    values:[0.1,0.2,0.3],
  },
  sunDrop: {
    name:'🌧️ 阳光降雨', desc:'每级减少15%阳光掉落间隔', icon:'🌧️',
    maxLevel:3, costs:[250,500,850],
    values:[0.15,0.3,0.45],
  },
  mowers: {
    name:'🚜 备用割草机', desc:'每级为每行额外提供1辆割草机', icon:'🚜',
    maxLevel:2, costs:[500,1000],
    values:[1,2],
  },
  plantSlots: {
    name:'🎴 额外植物槽', desc:'增加战前可选植物数量（8→9→10）', icon:'🎴',
    maxLevel:2, costs:[800,2000],
    values:[9,10],
  },
  speedUnlock: {
    name:'⚡ 加速模式', desc:'解锁战斗内右上角加速按钮（1~5倍速切换）', icon:'⚡',
    maxLevel:1, costs:[400],
    values:[1],
  },
};

let progress = {
  coins: 0,
  levelStars: {}, // {0: 3, 1: 2, ...}
  upgrades: {},   // {sunBonus: 2, plantHp: 1, ...}
  currentLevel: 0,
  allPlantsUnlocked: false,
  endlessHighScore: 0, // 无尽模式最高轮数
  plantSlots: 0, // 额外植物槽等级 (0=默认8, 1=9, 2=10)
  challengeBadges: {}, // {challengeId: 1~3} 已获得的挑战徽章等级 (铜/银/金)
  valhalla: [], // 英灵殿: [{id,date,time,plants:[type...],row}]
};

function loadProgress(){
  try {
    const saved = localStorage.getItem('pvz_progress');
    if(saved){
      progress = JSON.parse(saved);
      if(!progress.levelStars) progress.levelStars = {};
      if(!progress.upgrades) progress.upgrades = {};
      if(progress.coins === undefined) progress.coins = 0;
      if(progress.allPlantsUnlocked === undefined) progress.allPlantsUnlocked = false;
      if(progress.endlessHighScore === undefined) progress.endlessHighScore = 0;
      if(progress.plantSlots === undefined) progress.plantSlots = 0;
      if(!progress.challengeBadges) progress.challengeBadges = {};
      if(!progress.valhalla) progress.valhalla = [];
      // 旧存档兼容: 徽章从 true 迁移为阶段数 1
      for(const k in progress.challengeBadges){
        if(progress.challengeBadges[k] === true) progress.challengeBadges[k] = 1;
      }
    }
  } catch(e){ console.log('Load progress failed:', e); }
}

function saveProgress(){
  try {
    localStorage.setItem('pvz_progress', JSON.stringify(progress));
  } catch(e){ console.log('Save progress failed:', e); }
}

function getUpgradeLevel(key){
  return progress.upgrades[key] || 0;
}

function getUpgradeValue(key){
  const cfg = UPGRADES[key];
  const lv = getUpgradeLevel(key);
  if(lv === 0 || !cfg) return 0;
  return cfg.values[lv - 1];
}

// 计算升级后的起始阳光
function getStartSun(baseSun){
  return baseSun + getUpgradeValue('sunBonus');
}

// 计算升级后的植物血量
function getPlantHp(baseHp){
  return Math.floor(baseHp * (1 + getUpgradeValue('plantHp')));
}

// 计算升级后的植物伤害
function getPlantDamage(baseDmg){
  return Math.floor(baseDmg * (1 + getUpgradeValue('plantDmg')));
}

// 计算升级后的冷却时间
function getCooldown(baseCd){
  return baseCd * (1 - getUpgradeValue('cooldown'));
}

// 计算阳光掉落间隔
function getSunDropInterval(){
  return 10 * (1 - getUpgradeValue('sunDrop'));
}

// 计算额外割草机数量
function getExtraMowers(){
  return getUpgradeValue('mowers');
}

// 计算可用植物槽位数量
function getPlantSlotCount(){
  const val = getUpgradeValue('plantSlots');
  return val || 8;
}

// ============================================================
// 界面管理
// ============================================================
function showScreen(id){
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('level-select').classList.remove('show');
  document.getElementById('challenge-screen').classList.remove('show');
  document.getElementById('shop-screen').classList.remove('show');
  document.getElementById('plant-select').classList.remove('show');
  document.getElementById('reward-overlay').classList.remove('show');
  document.getElementById('plant-level-overlay').classList.remove('show');
  document.getElementById('valhalla-screen').classList.remove('show');
  document.getElementById('cricket-result').classList.remove('show');
  if(id === 'main-menu'){
    document.getElementById('main-menu').classList.remove('hidden');
  } else if(id){
    document.getElementById(id).classList.add('show');
  }
}

function updateMenuStats(){
  let totalStars = 0;
  let completed = 0;
  for(let i = 0; i < LEVELS.length; i++){
    const stars = progress.levelStars[i] || 0;
    totalStars += stars;
    if(stars > 0) completed++;
  }
  document.getElementById('menu-coins').textContent = progress.coins;
  document.getElementById('menu-stars').textContent = totalStars;
  document.getElementById('menu-levels').textContent = completed + '/' + LEVELS.length;
  document.getElementById('menu-endless-hi').textContent = progress.endlessHighScore || 0;
  let badgeCount = 0;
  CHALLENGES.forEach(ch => { badgeCount += getChallengeBadgeLevel(ch.id); });
  document.getElementById('menu-badges').textContent = badgeCount + '/' + CHALLENGES.length * 3;
}

function openLevelSelect(){
  showScreen('level-select');
  renderLevelSelect();
}

function openShop(){
  showScreen('shop-screen');
  renderShop();
}

function backToMenu(){
  state.gameRunning = false;
  resetCricketUI();
  showScreen('main-menu');
  updateMenuStats();
  // 隐藏游戏内元素
  document.getElementById('message-overlay').style.display = 'none';
  document.getElementById('wave-banner').classList.remove('show');
  document.getElementById('grace-banner').style.display = 'none';
  document.getElementById('endless-round-banner').classList.remove('show');
}

function exitToMenu(){
  state.gameRunning = false;
  resetCricketUI();
  showScreen('main-menu');
  updateMenuStats();
  document.getElementById('message-overlay').style.display = 'none';
  document.getElementById('wave-banner').classList.remove('show');
  document.getElementById('grace-banner').style.display = 'none';
  document.getElementById('endless-round-banner').classList.remove('show');
  closeLevelUp();
}

// ============================================================
// 关卡选择渲染
// ============================================================
function renderLevelSelect(){
  document.getElementById('ls-coins').textContent = progress.coins;
  const grid = document.getElementById('ls-grid');
  let html = '';
  for(let i = 0; i < LEVELS.length; i++){
    const lv = LEVELS[i];
    const stars = progress.levelStars[i] || 0;
    const prevStars = i > 0 ? (progress.levelStars[i-1] || 0) : 1;
    const unlocked = i === 0 || prevStars > 0;
    let starHtml = '';
    for(let s = 0; s < 3; s++){
      starHtml += `<span class="star ${s < stars ? '' : 'empty'}">★</span>`;
    }
    html += `<div class="level-card ${unlocked ? '' : 'locked'} ${stars > 0 ? 'completed' : ''}" 
      ${unlocked ? `onclick="startLevel(${i})"` : ''}>
      ${unlocked ? '' : '<div class="level-lock">🔒</div>'}
      <div class="level-num">${i + 1}</div>
      <div class="level-name">${lv.name}</div>
      <div class="level-difficulty ${lv.difficulty}">${
        lv.difficulty === 'easy' ? '简单' :
        lv.difficulty === 'normal' ? '普通' :
        lv.difficulty === 'hard' ? '困难' : '极难'
      }</div>
      <div class="level-desc">${lv.desc}</div>
      <div class="level-stars">${starHtml}</div>
    </div>`;
  }
  grid.innerHTML = html;
}

// ============================================================
// 商店渲染
// ============================================================
function renderShop(){
  document.getElementById('shop-coins').textContent = progress.coins;
  const content = document.getElementById('shop-content');
  let html = '';
  for(const key in UPGRADES){
    const cfg = UPGRADES[key];
    const lv = getUpgradeLevel(key);
    let dots = '';
    for(let i = 0; i < cfg.maxLevel; i++){
      dots += `<div class="upgrade-dot ${i < lv ? 'filled' : ''}"></div>`;
    }
    let btnHtml;
    if(lv >= cfg.maxLevel){
      btnHtml = `<button class="upgrade-buy maxed">已满级</button>`;
    } else {
      const cost = cfg.costs[lv];
      const affordable = progress.coins >= cost;
      btnHtml = `<button class="upgrade-buy ${affordable ? 'affordable' : 'unaffordable'}" 
        ${affordable ? `onclick="buyUpgrade('${key}')"` : 'disabled'}>
        🪙 ${cost}
      </button>`;
    }
    html += `<div class="shop-card">
      <div class="upgrade-icon">${cfg.icon}</div>
      <div class="upgrade-info">
        <div class="upgrade-name">${cfg.name} <span style="font-size:13px;color:#FFD54F;">Lv.${lv}/${cfg.maxLevel}</span></div>
        <div class="upgrade-desc">${cfg.desc}</div>
        <div class="upgrade-level-bar">${dots}</div>
      </div>
      ${btnHtml}
    </div>`;
  }
  content.innerHTML = html;
}

function buyUpgrade(key){
  const cfg = UPGRADES[key];
  const lv = getUpgradeLevel(key);
  if(lv >= cfg.maxLevel) return;
  const cost = cfg.costs[lv];
  if(progress.coins < cost) return;
  progress.coins -= cost;
  progress.upgrades[key] = lv + 1;
  saveProgress();
  if(key === 'speedUnlock') refreshSpeedCtrl();
  renderShop();
}

// ============================================================
// 启动关卡
// ============================================================
// 无尽模式
// ============================================================
function generateEndlessWave(round){
  // 僵尸种类随轮次解锁
  const pool = ['basic'];
  if(round >= 2) pool.push('conehead');
  if(round >= 3) pool.push('polevaulter');
  if(round >= 4) pool.push('buckethead');
  if(round >= 5) pool.push('newspaper');
  if(round >= 6) pool.push('football');
  if(round >= 7) pool.push('dancing');
  if(round >= 10) pool.push('imp');
  if(round >= 8) pool.push('giant'); // 无尽模式第8轮起出现巨人僵尸

  // 僵尸数量随轮次增长, 上限35
  const count = Math.min(3 + Math.floor(round * 1.5), 35);
  // 生成间隔逐渐缩短, 最低1.2秒
  const interval = Math.max(1.2, 3.5 - round * 0.12);
  const zombies = [];

  // 每5轮以旗帜僵尸带头
  if(round % 5 === 0){
    zombies.push({type:'flag', time:0.5});
  }

  for(let i = 0; i < count; i++){
    const type = pool[Math.floor(Math.random() * pool.length)];
    zombies.push({type, time: 1.5 + i * interval});
  }

  return { zombies };
}

function startEndless(){
  currentChallengeIdx = -1; // 退出挑战模式
  currentLevelConfig = {
    name: '无尽模式',
    difficulty: 'normal',
    startSun: 150,
    plants: Object.keys(PLANTS),
    special: null,
  };
  currentLevelWaves = [generateEndlessWave(1)];
  pendingGameMode = 'endless';
  // 进入选植物界面
  openPlantSelect();
}

function startEndlessRound(round){
  state.endlessRound = round;
  // 生成新波次并追加 (植物保留不重置)
  const wave = generateEndlessWave(round);
  currentLevelWaves.push(wave);
  state.totalZombies += wave.zombies.length;
  // 奖励阳光
  state.sun += 25;
  updateSunDisplay();
  // 修复割草机
  restoreLawnmowers();
  // 短暂休整期 (10秒)
  state.graceTimer = 10;
  document.getElementById('grace-label').textContent = '🌿 回合间隙';
  document.getElementById('grace-tip').textContent = '植物已保留，抓紧休整备战！';
  const countEl = document.getElementById('grace-count');
  if(countEl) countEl.textContent = '10';
  document.getElementById('grace-banner').style.display = 'block';
  // 更新顶部栏
  document.getElementById('wave-num').textContent = round;
  document.getElementById('wave-total').textContent = '∞';
  // 显示轮次横幅
  showEndlessRoundBanner(round);
}

function showEndlessRoundBanner(round){
  const banner = document.getElementById('endless-round-banner');
  document.getElementById('er-title').textContent = '♾️ 第 ' + round + ' 轮';
  const isBoss = round % 5 === 0;
  document.getElementById('er-sub').textContent = isBoss ? '⚠ 大波僵尸来袭！' : '僵尸即将来袭！';
  document.getElementById('er-bonus').textContent = '☀️ +25 阳光 · 🚜 割草机已修复';
  banner.classList.remove('show');
  void banner.offsetWidth;
  banner.classList.add('show');
  setTimeout(() => banner.classList.remove('show'), 2500);
}

function restoreLawnmowers(){
  for(const m of state.lawnmowers){
    m.used = false;
    m.active = false;
    m.x = m.slot * -45;
    m.el.style.left = m.x + 'px';
    m.el.style.display = m.slot === 0 ? 'block' : 'none';
    m.el.classList.remove('moving');
  }
}

// ============================================================
// 关卡系统
// ============================================================
let currentLevelWaves = [];
let currentLevelConfig = null;
let chosenPlants = []; // 战前选中的植物列表
let pendingGameMode = 'adventure'; // 记录即将开始的游戏模式

function startLevel(idx){
  progress.currentLevel = idx;
  currentChallengeIdx = -1; // 退出挑战模式
  currentLevelConfig = LEVELS[idx];
  currentLevelWaves = getLevelWaves(idx);
  pendingGameMode = 'adventure';
  // 进入选植物界面
  openPlantSelect();
}

// ============================================================
// 战前选植物系统
// ============================================================
function getAvailablePlants(){
  const allPlants = ['sunflower','peashooter','repeater','gatling','torchwood','wallnut','tallnut','snowpea','cherrybomb','jalapeno','potatomine','chomper','spikeweed','cornpult','watermelon'];
  if(progress.allPlantsUnlocked) return allPlants;
  if(currentLevelConfig && currentLevelConfig.name === '无尽模式') return allPlants;
  return currentLevelConfig ? currentLevelConfig.plants : allPlants;
}

function openPlantSelect(){
  chosenPlants = [];
  showScreen('plant-select');
  renderPlantSelect();
}

function cancelPlantSelect(){
  chosenPlants = [];
  if(pendingGameMode === 'endless'){
    backToMenu();
  } else {
    openLevelSelect();
  }
}

function renderPlantSelect(){
  const maxSlots = getPlantSlotCount();
  document.getElementById('ps-max-slots').textContent = maxSlots;
  document.getElementById('ps-selected-count').textContent = chosenPlants.length;

  // 渲染已选槽位
  const slotsBar = document.getElementById('ps-slots-bar');
  let slotsHtml = '';
  for(let i = 0; i < maxSlots; i++){
    if(i < chosenPlants.length){
      const type = chosenPlants[i];
      const cfg = PLANTS[type];
      slotsHtml += `<div class="ps-slot filled" onclick="removeFromSlot(${i})">
        <div class="ps-slot-icon">${createPlantHTML(type)}</div>
        <div class="ps-slot-cost">☀${cfg.cost}</div>
        <div class="ps-slot-remove">✕</div>
      </div>`;
    } else {
      slotsHtml += `<div class="ps-slot empty"></div>`;
    }
  }
  slotsBar.innerHTML = slotsHtml;

  // 渲染可选植物
  const grid = document.getElementById('ps-grid');
  const available = getAvailablePlants();
  let gridHtml = '';
  for(const type of available){
    const cfg = PLANTS[type];
    const isSelected = chosenPlants.includes(type);
    gridHtml += `<div class="ps-plant-card ${isSelected ? 'selected' : ''}"
      ${isSelected ? '' : `onclick="addToSlot('${type}')"`}>
      <div class="ps-card-icon">${createPlantHTML(type)}</div>
      <div class="ps-card-name">${cfg.name}</div>
      <div class="ps-card-cost">☀${cfg.cost}</div>
    </div>`;
  }
  grid.innerHTML = gridHtml;

  // 更新开始按钮状态
  document.getElementById('ps-start-btn').disabled = chosenPlants.length === 0;
}

function addToSlot(type){
  const maxSlots = getPlantSlotCount();
  if(chosenPlants.length >= maxSlots) return;
  if(chosenPlants.includes(type)) return;
  chosenPlants.push(type);
  renderPlantSelect();
}

function removeFromSlot(index){
  chosenPlants.splice(index, 1);
  renderPlantSelect();
}

function confirmPlantSelect(){
  if(chosenPlants.length === 0) return;
  // 隐藏选植物界面
  showScreen(null);
  // 设置游戏模式并启动
  state.gameMode = pendingGameMode;
  if(pendingGameMode === 'endless'){
    state.endlessRound = 1;
  }
  resetGameState();
  initGame();
}

function resetGameState(){
  const lawn = document.getElementById('lawn');
  lawn.innerHTML = '<div id="house"><span class="house-icon">🏠</span></div>';
  document.querySelectorAll('.sun').forEach(s => s.remove());
  document.querySelectorAll('.projectile').forEach(p => p.remove());
  document.querySelectorAll('.explosion').forEach(e => e.remove());
  document.getElementById('message-overlay').style.display = 'none';
  document.getElementById('wave-banner').classList.remove('show');
  document.getElementById('reward-overlay').classList.remove('show');
  const rbEl = document.getElementById('reward-badge');
  if(rbEl) rbEl.classList.remove('show');
  document.getElementById('plant-level-overlay').classList.remove('show');
  updateShovelUI();
  updateGloveUI();
  refreshSpeedCtrl();

  const startSun = getStartSun(currentLevelConfig.startSun);
  const prevMode = state.gameMode || 'adventure';
  state = {
    sun: startSun,
    selectedPlant: null,
    shovelMode: false,
    gloveMode: false,
    heldPlant: null,
    heldFrom: null,
    gloveCd: 0,
    grid: [],
    zombies: [],
    projectiles: [],
    suns: [],
    explosions: [],
    lawnmowers: [],
    waveIndex: 0,
    waveSpawnIndex: 0,
    waveTimer: 0,
    graceTimer: 0,
    gameRunning: false,
    gameMode: prevMode,
    challengeId: (prevMode === 'challenge') ? state.challengeId : null,
    endlessRound: 0,
    sunDropTimer: 5,
    lastTime: 0,
    cooldowns: {},
    zombiesKilled: 0,
    totalZombies: 0,
    plantsLost: 0,
  };
  updateSunDisplay(); // 立即刷新阳光计数(开局阳光在宽限期内也正确显示, 修复挑战/关卡起始阳光不生效)
  currentLevelWaves.forEach(w => state.totalZombies += w.zombies.length);
  // 重置手套和加速按钮 UI (state 已重建)
  updateGloveUI();
  refreshSpeedCtrl();
}

// ============================================================
// 星级评定和奖励
// ============================================================
function calculateStars(){
  let stars = 1; // 通关即1星
  // 2星: 损失不超过2株植物
  if(state.plantsLost <= 2) stars = 2;
  // 3星: 损失不超过0株植物
  if(state.plantsLost === 0) stars = 3;
  return stars;
}

function calculateCoinReward(stars){
  const diff = currentLevelConfig.difficulty;
  const base = diff === 'extreme' ? 100 :
               diff === 'hard' ? 60 :
               diff === 'normal' ? 30 : 20;
  return base * stars;
}

function nextLevel(){
  const next = progress.currentLevel + 1;
  if(next < LEVELS.length){
    startLevel(next);
  } else {
    backToMenu();
  }
}

// ============================================================
// Debug 菜单
// ============================================================
function toggleDebugPanel(){
  document.getElementById('debug-panel').classList.toggle('show');
}

function setDebugSpawn(val){
  debug.spawnMult = parseFloat(val);
  document.getElementById('debug-spawn-val').textContent = debug.spawnMult.toFixed(1) + 'x';
}

function setDebugSpeed(val){
  debug.speed = parseFloat(val);
  document.getElementById('debug-speed-val').textContent = debug.speed.toFixed(1) + 'x';
  updateSpeedCtrlUI(); // 同步战斗内加速按钮高亮
}

// ============================================================
// 战斗内加速控制 (商店解锁的普通版, 最高5倍)
// ============================================================
const BATTLE_MAX_SPEED = 5;

function isSpeedUnlocked(){
  return getUpgradeLevel('speedUnlock') > 0;
}

function setBattleSpeed(v){
  if(!isSpeedUnlocked()) return;
  v = Math.min(BATTLE_MAX_SPEED, Math.max(1, v));
  debug.speed = v;
  // 同步 debug 滑杆显示
  const slider = document.getElementById('debug-speed');
  if(slider) slider.value = v;
  const sval = document.getElementById('debug-speed-val');
  if(sval) sval.textContent = v.toFixed(1) + 'x';
  updateSpeedCtrlUI();
}

function updateSpeedCtrlUI(){
  document.querySelectorAll('#speed-ctrl .spd-btn').forEach(b => {
    b.classList.toggle('active', Math.round(debug.speed) === parseInt(b.dataset.spd, 10));
  });
}

function refreshSpeedCtrl(){
  const el = document.getElementById('speed-ctrl');
  if(!el) return;
  el.classList.toggle('show', isSpeedUnlocked());
  updateSpeedCtrlUI();
}

function unlockAllPlants(){
  progress.allPlantsUnlocked = true;
  // 同时解锁全部关卡
  for(let i = 0; i < LEVELS.length; i++){
    if(!progress.levelStars[i]) progress.levelStars[i] = 1;
  }
  saveProgress();
  updateMenuStats();
  // 视觉反馈
  const btn = document.querySelector('.debug-unlock');
  if(btn){
    btn.textContent = '✅ 已解锁全部植物和关卡';
    btn.style.background = 'linear-gradient(180deg,#43A047,#2E7D32)';
    setTimeout(() => {
      btn.textContent = '🔓 一键解锁所有植物';
      btn.style.background = '';
    }, 2000);
  }
}

// ============================================================
// 植物属性编辑器 (右键植物)
// ============================================================
let editingPlant = null;

function onCellRightClick(r, c, e){
  e.preventDefault();
  // 斗蛐蛐布阵阶段: 右键铲除该格最上层植物
  if(cricketSetup){
    const stack = state.grid[r][c];
    if(stack && stack.length > 0){
      removePlant(stack[stack.length - 1], true); // 不计入损失
      updateCricketSetupUI();
    }
    return;
  }
  if(!state.gameRunning) return;
  const stack = state.grid[r][c];
  if(!stack || stack.length === 0) return;

  // 编辑该格最上层的植物
  editingPlant = stack[stack.length - 1];
  const cfg = PLANTS[editingPlant.type];

  document.getElementById('editor-type').textContent = cfg.name;
  document.getElementById('editor-name').value = editingPlant.name || cfg.name;
  document.getElementById('editor-damage').value = editingPlant.damage != null ? editingPlant.damage : (cfg.damage || 0);
  document.getElementById('editor-interval').value = editingPlant.attackInterval != null ? editingPlant.attackInterval : (cfg.actionInterval || 1);
  document.getElementById('editor-hp').value = Math.round(editingPlant.hp);
  document.getElementById('editor-bulletspeed').value = editingPlant.bulletSpeed || 350;
  document.getElementById('editor-pierce').value = editingPlant.pierce || 0;
  document.getElementById('editor-shots').value = editingPlant.shots || 1;
  renderEditorSkills(editingPlant);
  refreshEditorStats();
  if(window._editorStatTimer) clearInterval(window._editorStatTimer);
  window._editorStatTimer = setInterval(refreshEditorStats, 300);
  document.getElementById('plant-editor').classList.add('show');
  // 斗蛐蛐专属操作(直接升级/获得经验)仅在斗蛐蛐模式显示
  const showCricket = state.gameMode === 'cricket';
  const ct = document.getElementById('editor-cricket-title');
  const ca = document.getElementById('editor-cricket-actions');
  if(ct) ct.style.display = showCricket ? '' : 'none';
  if(ca) ca.style.display = showCricket ? '' : 'none';
  document.getElementById('editor-name').focus();
}

// 右键面板: 实时刷新本植物 DPS 与总伤害
function refreshEditorStats(){
  const p = editingPlant;
  if(!p) return;
  const total = Math.round(p.dmgDealt || 0);
  const t = p.aliveTime || 0;
  const dps = t > 0 ? (total / t) : 0;
  const dpsEl = document.getElementById('editor-dps');
  const totEl = document.getElementById('editor-totaldmg');
  if(dpsEl) dpsEl.textContent = (dps >= 10 ? Math.round(dps) : (Math.round(dps * 10) / 10));
  if(totEl) totEl.textContent = total;
}

function closePlantEditor(){
  if(window._editorStatTimer){ clearInterval(window._editorStatTimer); window._editorStatTimer = null; }
  document.getElementById('plant-editor').classList.remove('show');
  editingPlant = null;
}

function applyPlantEditor(){
  if(!editingPlant || editingPlant.dead){ closePlantEditor(); return; }
  const cfg = PLANTS[editingPlant.type];

  // 名字（与默认名相同则视为清除）
  const name = document.getElementById('editor-name').value.trim();
  editingPlant.name = (name && name !== cfg.name) ? name : null;

  // 攻击力
  const dmg = parseFloat(document.getElementById('editor-damage').value);
  if(!isNaN(dmg) && dmg >= 0) editingPlant.damage = dmg;

  // 攻击间隔（攻速）
  const itv = parseFloat(document.getElementById('editor-interval').value);
  if(!isNaN(itv) && itv > 0) editingPlant.attackInterval = itv;

  // 血量（同时设为满血）
  const hp = parseFloat(document.getElementById('editor-hp').value);
  if(!isNaN(hp) && hp > 0){
    editingPlant.maxHp = hp;
    editingPlant.hp = hp;
  }

  // 子弹速度
  const bs = parseFloat(document.getElementById('editor-bulletspeed').value);
  if(!isNaN(bs) && bs > 0) editingPlant.bulletSpeed = bs;

  // 穿透数
  const pr = parseInt(document.getElementById('editor-pierce').value, 10);
  if(!isNaN(pr) && pr >= 0) editingPlant.pierce = pr;

  // 发射数
  const sh = parseInt(document.getElementById('editor-shots').value, 10);
  if(!isNaN(sh) && sh >= 1) editingPlant.shots = sh;

  updateNameTag(editingPlant);
  renderEditorSkills(editingPlant);
  closePlantEditor();
}

// ============================================================
// 编辑器: 技能列表 / 一键升级 / 一键满级 / 删除技能
// ============================================================
// 技能删除时对应的效果重置 (将该技能涉及的属性恢复默认)
const SKILL_RESET = {
  pierce:     p => { p.pierce = 0; },
  extra:      p => { delete p.shotBonusExtra; p.shots = (PLANTS[p.type].shots || 1) + (p.shotBonusTriple || 0); },
  triple:     p => { delete p.shotBonusTriple; p.shots = (PLANTS[p.type].shots || 1) + (p.shotBonusExtra || 0); },
  double:     p => { p.sunMult = (p.sunMult || 1) / (p.sunDoubleMult || 1); delete p.sunDoubleMult; p.doubleThrow = false; delete p.throwCount; },
  heal:       p => { p.auraHeal = false; delete p.auraHealInterval; delete p.auraHealAmount; },
  reflect:    p => { delete p.reflect; },
  hard:       p => { delete p.dr; },
  freeze:     p => { p.freezeShot = false; delete p.freezeDuration; },
  aura:       p => { p.slowAura = false; p.fireAura = false; delete p.auraInterval; delete p.slowDuration; delete p.fireDamage; delete p.auraTimer; },
  range:      p => { delete p.rangeBonus; },
  insta:      p => { delete p.instaDigest; },
  fire:       p => { p.alwaysFire = false; delete p.fireMult; },
  splash:     p => { p.fireSplash = false; delete p.fireSplashRadius; p.splashBoost = false; delete p.splashBonus; },
  frostflame: p => { p.frostFlame = false; delete p.frostMult; delete p.frostSlowDuration; },
  wide:       p => { delete p.rangeBonus; },
  armor:      p => { delete p.armorPierce; },
  butter:     p => { p.butterBoost = false; delete p.butterChance; },
};

function renderEditorSkills(plant){
  const box = document.getElementById('editor-skills');
  if(!box) return;
  const pool = PLANT_UPGRADES[plant.type];
  const ids = Object.keys(plant.skills || {}).filter(id => plant.skills[id] > 0);
  const crossKeys = Object.keys(plant.crossSkills || {}).filter(k => plant.crossSkills[k] > 0);
  if((!pool || ids.length === 0) && crossKeys.length === 0){
    box.innerHTML = '<div style="font-size:11px;color:#90A4AE;padding:2px;">暂未学习技能</div>';
    return;
  }
  let html = '';
  // 自身技能
  ids.forEach(id => {
    const skillDef = pool && (pool.skills || []).find(s => s.id === id);
    const name = skillDef ? `${skillDef.icon} ${skillDef.name}` : id;
    const lv = plant.skills[id];
    html += `<div class="editor-skill-row">
      <span class="sk-name">${name} Lv.${lv}</span>
      <button class="editor-skill-del" onclick="removeEditorSkill('${id}')">删除</button>
    </div>`;
  });
  // 跨植物技能
  crossKeys.forEach(ck => {
    const parts = ck.split(':');
    const srcType = parts[0], skillId = parts[1];
    const srcPool = PLANT_UPGRADES[srcType];
    const skillDef = srcPool && (srcPool.skills || []).find(s => s.id === skillId);
    const srcName = PLANTS[srcType] ? PLANTS[srcType].name : srcType;
    const name = skillDef ? `${skillDef.icon} ${skillDef.name}` : skillId;
    const lv = plant.crossSkills[ck];
    html += `<div class="editor-skill-row" style="border-color:#7B1FA2;">
      <span class="sk-name">🔄 ${srcName} ${name} Lv.${lv}</span>
      <button class="editor-skill-del" onclick="removeEditorCrossSkill('${ck}')">删除</button>
    </div>`;
  });
  box.innerHTML = html;
}

function removeEditorCrossSkill(crossKey){
  if(!editingPlant || editingPlant.dead) return;
  const skillId = crossKey.split(':')[1];
  const reset = SKILL_RESET[skillId];
  if(reset) reset(editingPlant);
  delete editingPlant.crossSkills[crossKey];
  // 同步编辑框显示
  document.getElementById('editor-pierce').value = editingPlant.pierce || 0;
  document.getElementById('editor-shots').value = editingPlant.shots || 1;
  renderEditorSkills(editingPlant);
}

function removeEditorSkill(skillId){
  if(!editingPlant || editingPlant.dead) return;
  const reset = SKILL_RESET[skillId];
  if(reset) reset(editingPlant);
  delete editingPlant.skills[skillId];
  // 同步编辑框显示
  document.getElementById('editor-pierce').value = editingPlant.pierce || 0;
  document.getElementById('editor-shots').value = editingPlant.shots || 1;
  renderEditorSkills(editingPlant);
}

// 清除"可升级"标记
function clearLevelReadyUI(plant){
  plant.levelReady = false;
  plant.crossLevelReady = false;
  plant.crossTimer = 0;
  if(plant.el){
    plant.el.classList.remove('level-ready');
    const badge = plant.el.querySelector('.level-up-badge');
    if(badge) badge.remove();
  }
}

// 同步编辑框数值 (升级后调用)
function syncEditorFields(plant){
  document.getElementById('editor-damage').value = plant.damage != null ? Math.round(plant.damage) : 0;
  document.getElementById('editor-interval').value = plant.attackInterval != null ? plant.attackInterval.toFixed(2) : 1;
  document.getElementById('editor-hp').value = Math.round(plant.hp);
  document.getElementById('editor-pierce').value = plant.pierce || 0;
  document.getElementById('editor-shots').value = plant.shots || 1;
  renderEditorSkills(plant);
}

// 一键升级: 立即随机应用一个升级选项 (不弹窗)
function editorQuickLevelUp(){
  if(!editingPlant || editingPlant.dead) return;
  const options = generateUpgradeOptions(editingPlant);
  if(options.length === 0){
    // 自身满级, 尝试跨植物技能
    const crossOpts = getAllCrossSkills(editingPlant);
    if(crossOpts.length > 0){
      const opt = crossOpts[Math.floor(Math.random() * crossOpts.length)];
      opt.apply(editingPlant);
      editingPlant.crossSkills[opt.crossKey] = (editingPlant.crossSkills[opt.crossKey] || 0) + 1;
      editingPlant.level++;
      editingPlant.xp = 0;
      editingPlant.xpToNext = xpToNextFor(editingPlant.level, editingPlant.type);
      clearLevelReadyUI(editingPlant);
      updatePlantXPBar(editingPlant);
    } else {
      autoMaxLevelBoost(editingPlant);
    }
  } else {
    const opt = options[Math.floor(Math.random() * options.length)];
    opt.apply(editingPlant);
    if(opt.isSkill) editingPlant.skills[opt.id] = (editingPlant.skills[opt.id] || 0) + 1;
    else editingPlant.statLevels[opt.id] = (editingPlant.statLevels[opt.id] || 0) + 1;
    editingPlant.level++;
    editingPlant.xp = 0;
    editingPlant.xpToNext = xpToNextFor(editingPlant.level, editingPlant.type);
    clearLevelReadyUI(editingPlant);
    updatePlantXPBar(editingPlant);
  }
  syncEditorFields(editingPlant);
}

// 一键满级: 所有数值升级和技能全部升满
function editorMaxLevel(){
  if(!editingPlant || editingPlant.dead) return;
  const pool = PLANT_UPGRADES[editingPlant.type];
  if(!pool) return;
  let gained = 0;
  (pool.stats || []).forEach(s => {
    const cur = editingPlant.statLevels[s.id] || 0;
    for(let i = cur; i < s.max; i++){ s.apply(editingPlant); editingPlant.statLevels[s.id] = i + 1; gained++; }
  });
  (pool.skills || []).forEach(s => {
    const cur = editingPlant.skills[s.id] || 0;
    for(let i = cur; i < s.max; i++){ s.levels[i].apply(editingPlant); editingPlant.skills[s.id] = i + 1; gained++; }
  });
  if(gained > 0){
    editingPlant.level += gained;
    editingPlant.xp = 0;
    editingPlant.xpToNext = xpToNextFor(editingPlant.level, editingPlant.type);
    clearLevelReadyUI(editingPlant);
    updatePlantXPBar(editingPlant);
  }
  syncEditorFields(editingPlant);
}

// 斗蛐蛐专属: 右键菜单"直接升级" —— 走 cricket 升级逻辑(非普通模式升级)
function editorCricketLevelUp(){
  if(!editingPlant || editingPlant.dead) return;
  if(state.gameMode !== 'cricket') return; // 仅斗蛐蛐模式
  editingPlant.levelReady = true;          // cricketAutoUpgrade 要求 levelReady 才生效
  cricketAutoUpgrade(editingPlant);
  syncEditorFields(editingPlant);
}

// 斗蛐蛐专属: 右键菜单"获得经验" —— 给予植物指定数量的经验(走 cricket 经验体系)
function editorGainXP(){
  if(!editingPlant || editingPlant.dead) return;
  if(state.gameMode !== 'cricket' || !editingPlant.cricketLeveled) return;
  const input = document.getElementById('editor-xp-amount');
  let amount = parseFloat(input && input.value);
  if(isNaN(amount) || amount <= 0) amount = 100;
  const p = editingPlant;
  // 调试专用: 忽略"待升级"闸门, 直接注入经验(后续由 cricket 逻辑正常结算升级)
  p.levelReady = false; p.crossLevelReady = false;
  grantXPFully(p, amount);
  syncEditorFields(p);
}

function updateNameTag(plant){
  let tag = plant.el.querySelector('.plant-name-tag');
  if(plant.name){
    if(!tag){
      tag = document.createElement('div');
      tag.className = 'plant-name-tag';
      plant.el.appendChild(tag);
    }
    tag.textContent = plant.name;
  } else if(tag){
    tag.parentNode.removeChild(tag);
  }
}

// E 键开关 Debug 面板
document.addEventListener('keydown', (e) => {
  if(e.key === 'e' || e.key === 'E'){
    // 避免和输入框冲突
    const tag = (e.target && e.target.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA') return;
    toggleDebugPanel();
  }
});

// 关闭 Debug 面板 (右上角叉号)
(function(){
  const btn = document.getElementById('debug-close');
  if(btn) btn.onclick = () => document.getElementById('debug-panel').classList.remove('show');
})();

// 手机端: 长按阳光图标呼出 Debug 菜单
(function(){
  const sun = document.getElementById('sun-counter');
  if(!sun) return;
  let lpTimer = null;
  const LONG_PRESS = 500;
  function openPanel(){
    const p = document.getElementById('debug-panel');
    if(p) p.classList.add('show');
    if(navigator.vibrate) navigator.vibrate(30);
  }
  function startLP(){
    if(lpTimer) return;
    lpTimer = setTimeout(() => { lpTimer = null; openPanel(); }, LONG_PRESS);
  }
  function cancelLP(){
    if(lpTimer){ clearTimeout(lpTimer); lpTimer = null; }
  }
  sun.addEventListener('touchstart', (e) => {
    if(e.touches && e.touches.length > 1){ cancelLP(); return; }
    startLP();
  }, {passive:true});
  sun.addEventListener('touchend', cancelLP);
  sun.addEventListener('touchmove', cancelLP);
  sun.addEventListener('touchcancel', cancelLP);
  sun.addEventListener('contextmenu', (e) => e.preventDefault()); // 抑制长按弹出系统菜单
})();

// ============================================================
// 启动 - 加载存档并显示主菜单
// ============================================================
loadProgress();
updateMenuStats();
updateSunDisplay();
