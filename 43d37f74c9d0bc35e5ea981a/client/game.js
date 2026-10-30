
/*==== HERO SPRITES ====*/
// 角色贴图由应用文件目录加载
const SPR_DOGMILK_SRC = "" + window.gameAssetUrls["dogmilk.png"] + "";
const SPR_THROWER_SRC = "" + window.gameAssetUrls["thrower.jpg"] + "";
const SPR_DOGMILK = (typeof Image !== "undefined") ? new Image() : null;
// 投掷者纪念形象
const SPR_THROWER = (typeof Image !== "undefined") ? new Image() : null;
if(SPR_DOGMILK) SPR_DOGMILK.src = SPR_DOGMILK_SRC;
if(SPR_THROWER) SPR_THROWER.src = SPR_THROWER_SRC;
const SPR_KETCHUP_SRC = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="53" r="43" fill="#e34a35"/><path d="M50 14 Q38 3 29 15 Q42 16 46 25 Q58 14 71 15 Q62 5 50 14" fill="#55a34c"/><circle cx="35" cy="48" r="4"/><circle cx="65" cy="48" r="4"/><path d="M36 65 Q50 77 64 65" fill="none" stroke="#55231b" stroke-width="4"/></svg>');
const SPR_KETCHUP = (typeof Image !== "undefined") ? new Image() : null;
if(SPR_KETCHUP) SPR_KETCHUP.src = SPR_KETCHUP_SRC;
/*==== /HERO SPRITES ====*/

// ===== CONSTANTS & STATE =====
const cvs = document.getElementById('game');
// let（不是 const）：🎬 制作人员面板的小画布肖像要把全局 ctx 临时换成目标画布的（见 withCtx）
let ctx = cvs.getContext('2d');
// 小画布绘制助手：把全局 ctx 临时指向 c2，fn 里所有 draw* 函数就画到 c2 上（用完自动还原）
function withCtx(c2, fn){ const _o = ctx; ctx = c2; try { fn(); } finally { ctx = _o; } }
let W = 0, H = 0;
function resize(){ W = cvs.width = innerWidth; H = cvs.height = innerHeight; }
resize(); addEventListener('resize', resize);

const G = {
  state:'menu', // menu, playing, levelup, gameover, win
  time:0, wave:0, waveTimer:0, waveEnemiesLeft:0, spawnTimer:0,
  enemies:[], bullets:[], gems:[], particles:[], effects:[], floaters:[], slimes:[], bombZones:[], tornadoes:[],
  walls:[], // 🪨 魔法师土墙掩体（玩家立在身前的实体障碍：挡弹幕 / 顶怪 / 次数耗尽塌下）
  broomTrail:[], // 🧹💨 魔法师扫帚飞行的尾迹（世界里逐渐淡去的紫色光斑+金火星，纯视觉）
  stones:[],       // 🪨 投石角色的地图石块（红/黄/蓝长方形石，走上去即捡；见 updateStones）
  stoneShots:[],   // 🪨 投石角色抛出的石头（抛物线飞行中，落地才结算伤害；见 updateStoneShots）
  boomerangs:[],   // 🪃 回旋镖角色扔出的镖（普攻：去程→折返→回程→接住；大招：甩出→环绕 5 秒→收回；见 updateBoomerangs）
  boss:null, bossNum:0, inBossWave:false,
  player:null, keys:{}, mouse:{x:0,y:0},
  mouseDown:false, // 🖱 鼠标左键按住状态（HUD/调试用）
  mouseClicks:0,   // 🖱 左键点击累计次数：所有角色的「主动技能」都按"次数"消费（单击=放技能），避免快速点击被同一帧漏掉
  mouseRClicks:0,  // 🖱 右键点击累计次数：🔮 魔法师「法术轮盘」切换用（只在游戏中记账，菜单里点右键不算）
  shootCD:0,
  screenShake:0,
  paused:false, // 暂停（游戏中按⏸按钮）
  flash:0, // 全屏白闪（0→1淡出）
  kills:0, // 累计击杀数（成就用）
  cutscene:null, // 剧情状态机：null=无；{type:'wrath', t, phase, minions, cx, cy, radius, ang, rotSpeed}
  wrathBoss:null, // 小怪之怒引用（双Boss胜利判定用）
  cmod:null, // 挑战模式修正因子（null=普通模式；startGame(true) 时由 rollChallenge 生成）
  coop:false, // 多人模式（≥2 人：双人 / 与AI组队 / 三人）
  players:[], // 玩家数组：players[0]=1P 键鼠，players[1]=2P 手柄，players[2]=3P（三人模式，由 AI 接管）；单人模式只有 [0]
  cursor2:{x:0,y:0}, // 2P 手柄瞄准光标（多人模式）
  cursor3:{x:0,y:0}, // 3P 瞄准光标（三人模式，由 AI 驱动）
  challengeOn:false, // 主界面挑战模式开关（可与任意开局方式组合）
  ai2p:false, // 🤖 兼容别名：= aiSeats 含 1（「与 AI 组队」时 AI 坐 2P）。三人模式该值为 false（2P 是真人在用手柄）
  aiSeats:[], // 🤖 由内置 AI 接管的座位号数组（与AI组队=[1]；三人模式=[2]；双人/单人=[]）
  mode:'solo', // 开局模式：solo=单人 / duo=双人（键鼠+手柄）/ ai2p=与AI组队 / trio=三人（键鼠+手柄+AI）/ pvp=对战
  pvp:false, // ⚔️ 对战模式：不刷怪、玩家之间可以互相造成伤害、血量打完即分胜负
  pvpAI:false, // ⚔️ 对战模式下 2P 由内置 AI 接管（「对战 · 打 AI」）
  pvpWinner:-1, // ⚔️ 对战结算：胜者座位（-1=未结算/平局），供结算画面与测试读取
  pvpLoser:-1,  // ⚔️ 对战结算：败者座位
  pvpVictory:null, // ⚔️ 胜利动画进行中（null=没有；对象含 t/dur/winner/loser/sp/rings/hero）
  endlessOn:false, // ♾ 无尽模式开关（主界面开关，可与挑战/双人任意组合）：波次不封顶、Boss 每10波轮回加强
  hordeOn:false, // 🧟 尸潮模式开关（模式选择面板里与挑战/无尽并列，可叠加在任意模式上；记忆到 gameStore）：无技能卡 + 尸潮刷怪 + 连杀加伤
  horde:false, // 🧟 尸潮模式本局标记（startGame 时由 hordeOn 落下；对战模式强制 false——纯竞技场不刷怪）
  combo:0,     // 🧟 尸潮连杀数（2.5s 内连续击杀叠层，断档归零）
  comboT:0,    // 🧟 连杀剩余时间（秒）
  comboBest:0, // 🧟 本局最高连杀（结算展示）
  endlessBest:0,   // ♾ 无尽模式历史最高波次（gameStore 记忆）
  hordeBest:0,     // 🧟 尸潮模式历史最高波次（gameStore 记忆）
  endlessNewBest:false, // 本局是否刷新了最高纪录（死亡结算提示用）
  viewMode:'normal', // 👁️ 视角：'normal'=固定（世界铺满屏幕）/ 'follow'=玩家居中（地图边缘画可视化墙壁）
  menuMode:'solo',   // 🎮 主界面「模式选择」：当前选中的模式（solo/coop/trio/ai2p/pvp-ai/pvp/net），「开始游戏」按此开局
  deviceType:'computer', // 📱 设备类型：'phone'=手机（触控双摇杆+技能按钮+横屏）/ 'computer'=电脑（鼠标键盘）
  hero:'gunner',   // 🗡 1P 角色：gunner=射手（远程自动射击，🖱左键=环形弹幕）/ swordsman=剑士（大剑近战挥砍，🖱左键=斩灭）/ laser=激光（持续光束）/ bomber=爆破（🖱左键投放轰炸区）/ tornado=龙卷风（突进卷风）/ venom=毒液（每5发留毒液领域）/ general=将军（长枪近战+冲刺/征召）/ mage=魔法师（🖱右键切换法术：火球/冰霜/土墙，普攻放当前选中的那个）
  hero2:'gunner',  // 🗡 2P 角色（多人模式开局各选一个）
  hero3:'gunner',  // 🗡 3P 角色（三人模式的第 3 人，由 AI 接管；默认射手）
  bossTier:1,      // Boss 轮回层数：1~3=第一轮（第10/20/30波），4~6=第二轮（第40/50/60波）…
  bossFinal:false, // 本场 Boss 是否为最终 Boss（仅普通模式第 30 波为 true；无尽模式永远 false）
  world:1,         // 🌌 当前世界：1=世界1（暗影/熔岩/虚空），2=世界2（虚空裂隙）
  worldSel:1,      // 🌌 主界面选中的世界（按钮切换：1→2→3 循环）；**世界2/世界3 无需解锁，随时可切**
  world1Cleared:false, // 🌌 是否已通关世界1（第30波最终Boss）——**只作记录，不作门禁**：世界2 随时可进，无需解锁
  showDamage:false, // 🔢 设置开关：显示伤害数值（造成/受到伤害时弹出会升起后掉落消失的数字）
};
// 🌌 世界2 资源系统：技能消耗的统一数值（魔力/体力共用一个消耗常量）
const RES_SKILL_COST = 35;     // 放一次主动技能/大招消耗的资源量（魔力或体力）
const RES_REGEN_MANA = 8;       // 魔力每秒回复（2026-10-12 用户定"慢一些"：14→8，回满一次技能 35 需 4.4s，原 2.5s）
const RES_REGEN_STA  = 7;       // 体力每秒回复（2026-10-12 用户定"慢一些"：11→7，回满一次技能 35 需 5.0s，原 3.2s）
const RES_MOD_RANGE  = 0.15;    // 资源对「普攻伤害」/「移速」的调制幅度（±15%，用户定"小范围"）

// G.player 动态化：双人模式下敌人自动锁定最近的存活玩家（1P 模式恒为 P1）
let __p1 = null;
Object.defineProperty(G, 'player', {
  configurable: true,
  get(){
    if(multiOn()){
      const alive = G.players.filter(p => !p.dead);
      if(alive.length === 1) return alive[0];
      if(alive.length === 0) return G.players[0];
      // 都存活：取第一个（兼容旧逻辑里"G.player≈玩家自己"的读法）
      return alive[0];
    }
    return __p1;
  },
  set(v){ __p1 = v; }
});

// ===== 👥 多人座位体系（2人/3人通用）=====
// 「几个玩家在打」这件事以前到处写死 `G.players.length === 2`，三人模式必须全部泛化。
// 统一口径：① 人数判定一律用 multiOn() ② 谁是 AI 用 isAIPlayer(p)/isAISeat(n) ③ 显示名用 seatLabel(p)
const SEAT_NAMES = ['1P', '2P', '3P'];
const SEAT_TXT_COLOR = ['#8cf', '#fd8', '#8f8']; // 各座位 HUD 标签色（1P 蓝 / 2P 橙 / 3P 绿）
const seatLabel = p => SEAT_NAMES[(p && p.seat) || 0] || '1P';
function multiOn(){ return !!(G.coop && G.players && G.players.length >= 2); } // 本局是否有多个玩家（≥2）
function isAISeat(seat){
  if(G.aiSeats && G.aiSeats.indexOf(seat) >= 0) return true;
  if(G.ai2p && seat === 1) return true; // 兼容：只设了 G.ai2p 的旧代码/旧测试（AI 坐 2P）
  return false;
}
function isAIPlayer(p){ return !!p && isAISeat(p.seat || 0); }
function cursorOf(seat){ return seat === 2 ? G.cursor3 : (seat === 1 ? G.cursor2 : null); } // 该座位的瞄准光标（1P 用鼠标，无光标）
function humanPlayers(){ return (G.players || []).filter(p => !isAIPlayer(p)); } // 真人玩家（用于「AI 让经验」等按人判断的逻辑）
function seatIndex(p){ const i = (G.players || []).indexOf(p); return i >= 0 ? i : 0; }

// 实体的仇恨目标：多人模式下记住自己正在追的玩家，目标死了才换最近的存活者
function targetOf(e){
  // 🪖 将军小兵仇恨：被小兵砍过的小怪会转头去咬小兵（替玩家挡刀）。
  //    Boss / 远程怪 / 激光怪不受仇恨（它们的弹幕与光束碰不到小兵），咬死小兵后自动回归玩家。
  const m = e.aggro;
  if(m && !m.dead && (e.aggroT||0) > 0 && !e.isBoss && !e.isRanged && !e.isLaser && !e.isBullet) return m;
  if(!multiOn()) return G.player;
  if(e._tgt && !e._tgt.dead) return e._tgt;
  const alive = G.players.filter(p => !p.dead);
  if(!alive.length) return G.players[0];
  let best = alive[0], bd = Infinity;
  for(const p of alive){
    const d = (p.x-e.x)*(p.x-e.x) + (p.y-e.y)*(p.y-e.y);
    if(d < bd){ bd = d; best = p; }
  }
  e._tgt = best;
  return best;
}
// 🌌 环境敌人（Boss / 小怪 / 敌人弹幕）伤害玩家的目标集合：所有存活玩家。
//   关键修复：pvp 模式下 G.coop 为 false → multiOn()=false，原写法退化成 [G.player]/[targetOf]，
//   导致 pvp 下对手（玩家口中的「2P」）完全免疫 Boss 弹幕 / AoE / 接触伤害。
//   这里统一返回所有存活玩家（coop / pvp / 单人三种模式都正确：单人=1人、coop=多人、pvp=双方）。
function bossHitTargets(){
  const ps = (G.players || []).filter(p => p && !p.dead);
  // 兜底：单人/测试场景中可能只设了 G.player 而没把玩家塞进 G.players，
  // 此时退化为 [G.player]，保证「锁定目标」仍能吃到伤害（与原单人多选退路一致）。
  if(ps.length === 0 && G.player && !G.player.dead) return [G.player];
  return ps;
}
// 敌群狂暴（挑战减益 enemySpdMul）实际倍率：
//   单人 → 全局生效（谁抽到就全场加速）
//   双人 → 只对「锁定该玩家的怪」生效：怪追谁，就用谁身上的因子（没有=原速）
function enemySpdMulFor(e){
  const c = G.cmod;
  if(!c) return 1;
  if(c.isCoop){
    const t = e ? targetOf(e) : null;
    return (t && t.cmod && t.cmod.enemySpdMul) || 1;
  }
  return c.enemySpdMul || 1;
}
// 当前应参与结算的玩家列表（正常流程= G.players；测试/未开局直接给 G.player 赋值时兜底）
function activePlayers(){
  if(G.players && G.players.length) return G.players;
  return G.player ? [G.player] : [];
}

// ===== 共享经验池（已移除：双人经验改为各自独立计算） =====
// 双人：一名玩家阵亡（另一名挺过 3 个整波后，原地半血复活：第7波死→第11波复活）
function coopPlayerDie(p){
  if(p.dead) return;
  p.dead = true;
  p.reviveWave = G.wave + 4; // 挺过 3 个整波：7 波死 → 8/9/10 波挺过 → 11 波复活
  p._tgt = null;
  const allDead = G.players.every(q => q.dead);
  if(!allDead){ // 还有队友活着才弹阵亡提示；双亡=游戏结束，不用再说复活的事
    try { // 阵亡提示横幅
      const el = document.getElementById('coop-toast');
      el.innerHTML = `${seatLabel(p)} 阵亡！第 ${p.reviveWave} 波复活`;
      el.style.display = 'block'; el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 500); }, 2600);
    } catch(e){}
  }
  if(allDead) gameOver(); // 双亡 = 游戏结束
}
function coopCheckRevive(){ // startWave 时调用：到波次的阵亡玩家原地半血复活
  if(!G.coop) return;
  G.players.forEach(p => {
    if(p.dead && G.wave >= p.reviveWave){
      p.dead = false;
      p._dqByOverload = false; // 🏳️ 复活了就算翻篇：这次"超载之死"不再算到最终结算头上（否则后面被怪打死也会错报 DQ）
      p.hp = Math.ceil(p.maxHp / 2);
      p.invuln = 1; // 复活保护 1 秒
      p.stun = 0;
      try {
        const el = document.getElementById('coop-toast');
        el.innerHTML = `✨ ${seatLabel(p)} 复活！（半血）`;
        el.style.display = 'block'; el.style.opacity = '1';
        setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 500); }, 2200);
      } catch(e){}
    }
  });
}

// ===== GAMEPAD（手柄输入：标准映射，兼容普通手柄） =====
const GP = {
  pad:null, connected:false,
  poll(){ // 每帧/定时轮询：找到第一个已连接手柄
    try {
      if(typeof navigator === 'undefined' || !navigator.getGamepads){ this.connected = false; this.pad = null; this.updateCoupling(); return; }
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for(const p of pads){ if(p && p.connected){ this.pad = p; this.connected = true; this.updateCoupling(); return; } }
    } catch(e){}
    this.connected = false; this.pad = null; this.updateCoupling();
  },
  dpad(){ // 标准十字键 → 移动方向（按键设置可绑，默认 12上/13下/14左/15右）
    const K = KEYBINDS.binds.p2;
    const pr = l => KEYBINDS.any(l);
    return { dx:(pr(K.mvRight)?1:0)-(pr(K.mvLeft)?1:0), dy:(pr(K.mvDown)?1:0)-(pr(K.mvUp)?1:0) };
  },
  cursorKeys(){ // 光标方向（按键设置可绑，默认数字键 0=↑ 1=→ 2=↓ 3=←）
    const K = KEYBINDS.binds.p2;
    const pr = l => KEYBINDS.any(l);
    return { dx:(pr(K.curRight)?1:0)-(pr(K.curLeft)?1:0), dy:(pr(K.curDown)?1:0)-(pr(K.curUp)?1:0) };
  },
  stick(){ return this.leftStickClean(); }, // 左摇杆（已去除右摇杆串扰）；原始值见 stickRaw()
  stickRaw(){ // 左摇杆原始值 [-1,1]（未去串扰）
    const ax = (this.pad && this.pad.axes) || [];
    return { x: ax[0] || 0, y: ax[1] || 0 };
  },
  stickDir(){ // 左摇杆当前倾斜方向（主轴判定，死区0.5）：'up'/'down'/'left'/'right'/null（按键设置绑定摇杆用）
    const s = this.stick();
    if(Math.hypot(s.x, s.y) < 0.5) return null;
    if(Math.abs(s.x) > Math.abs(s.y)) return s.x > 0 ? 'right' : 'left';
    return s.y > 0 ? 'down' : 'up';
  },
  hatDir(){ // DInput 普通手柄的 POV 帽轴：axes[≥2] 中一对只取 -1/0/1 的轴（上=(0,-1)）
    const ax = (this.pad && this.pad.axes) || [];
    const dig = v => v === -1 || v === 0 || v === 1;
    for(let i = 2; i + 1 < ax.length; i++){
      const x = ax[i], y = ax[i+1];
      if(dig(x) && dig(y) && (x !== 0 || y !== 0)) return { dx: x, dy: y };
    }
    // 单轴 POV 编码（值 = k/7，-1 居中，故 0=上 不可与静止轴区分、跳过）；左摇杆静止时才信任，防止摇杆满推时误判
    const POV = { 0.1429:[1,-1], 0.2857:[1,0], 0.4286:[1,1], 0.5714:[0,1], 0.7143:[-1,1], 0.8571:[-1,0], 1:[-1,-1] };
    if(Math.abs(ax[0]||0) < 0.05 && Math.abs(ax[1]||0) < 0.05){
      for(let i = 2; i < ax.length; i++){
        for(const k in POV){
          if(Math.abs(ax[i] - Number(k)) < 0.002){ const [dx,dy] = POV[k]; return { dx, dy }; }
        }
      }
    }
    return null;
  },
  // 🎮 左摇杆 → 360° 全方位模拟量（纯函数，便于测试）
  //   死区 0.12（轻推即有反应）；行程到 0.72 即算满速 —— 补偿很多手柄推到底也到不了 1.0 的问题
  analogMove(sx, sy){
    const x = (sx === undefined) ? this.stick().x : sx;
    const y = (sy === undefined) ? this.stick().y : sy;
    const mag = Math.hypot(x, y);
    if(mag < 0.12 || mag < 1e-6) return { dx: 0, dy: 0, analog: true };
    const n = Math.min(1, (mag - 0.12) / 0.60);
    return { dx: x/mag*n, dy: y/mag*n, analog: true };
  },
  moveInput(){ // 2P 移动统一入口：十字键 → 帽轴 → 左摇杆模拟量（摇杆主控移动，手机玩家左手习惯）
    const d = this.dpad();
    if(d.dx || d.dy) return { dx: d.dx, dy: d.dy };
    const h = this.hatDir();
    if(h && (h.dx || h.dy)) return { dx: h.dx, dy: h.dy };
    return this.analogMove(); // 🎮 360° 模拟量（死区 0.12 / 行程补偿）
  },
  // 摇杆→光标速度（纯函数，便于测试）：死区 0.18，死区外归一化后 m^1.5 加速曲线，最大 560 px/s
  cursorVel(sx, sy){
    const DEAD = 0.18, MAX = 560;
    const mag = Math.hypot(sx, sy);
    if(mag < DEAD) return { vx:0, vy:0 };
    const n = Math.min(1, (mag - DEAD) / (1 - DEAD)); // 死区外 0→1
    const spd = MAX * n * n; // 平方缓动：轻推精细、推到底快
    return { vx: sx/mag * spd, vy: sy/mag * spd };
  },
  // 🎮 双摇杆串扰解耦：很多手柄把一根摇杆的信号也漏进另一根的轴（甚至两轴都带两根杆），
  //   导致「动左摇杆→角色+光标一起动」「动右摇杆→也控两个」。这里把读值建模为
  //     Read_L = L + a·R   （左轴 = 左杆 L + 右杆漏进来的 a·R）
  //     Read_R = R + b·L   （右轴 = 右杆 R + 左杆漏进来的 b·L）
  //   在线平滑标定 a、b（某根杆单独动、且两读数近乎平行时 → 估出对应泄漏系数，0.15 步长收敛），
  //   每帧反解：
  //     L = (Read_L - a·Read_R)/(1-a·b)   ← 角色移动用（纯左杆）
  //     R = (Read_R - b·Read_L)/(1-a·b)   ← 光标瞄准用（纯右杆）
  //   标准手柄 a=b=0 → 恒等式，零影响；换手柄自动重置。
  _dec: { a:0, b:0, padId:null },
  _resetDec(){ const R=this._dec; R.a=R.b=0; },
  updateCoupling(){
    const R = this._dec;
    if(!this.pad){ if(R.padId !== null){ R.padId = null; this._resetDec(); } return; }
    if(R.padId !== this.pad.id){ R.padId = this.pad.id; this._resetDec(); }
    const ax = this.pad.axes || [];
    const lx=ax[0]||0, ly=ax[1]||0, rx=ax[2]||0, ry=ax[3]||0;
    const lm=Math.hypot(lx,ly), rm=Math.hypot(rx,ry);
    if(lm > 0.25 && rm > 0.25){
      const cos = (lx*rx + ly*ry)/(lm*rm); // 两读数方向余弦：≈1 才像「只有一根杆在动、另一根是泄漏」
      if(cos > 0.85){
        if(lm > rm && rm/lm < 0.9){ const s = rm/lm; R.b += 0.15 * (Math.max(-0.4, Math.min(0.85, s)) - R.b); } // 左杆主导 → 估 b（左→右泄漏）
        else if(rm > lm && lm/rm < 0.9){ const s = lm/rm; R.a += 0.15 * (Math.max(-0.4, Math.min(0.85, s)) - R.a); } // 右杆主导 → 估 a（右→左泄漏）
      }
    }
  },
  rightStickRaw(){ const ax=(this.pad&&this.pad.axes)||[]; return { x:ax[2]||0, y:ax[3]||0 }; },
  leftStickClean(){
    const ax=(this.pad&&this.pad.axes)||[];
    const lx=ax[0]||0, ly=ax[1]||0, rx=ax[2]||0, ry=ax[3]||0;
    const a=this._dec.a, b=this._dec.b, den=Math.max(0.15, 1-a*b);
    return { x:(lx - a*rx)/den, y:(ly - a*ry)/den };
  },
  rightStickClean(){
    const ax=(this.pad&&this.pad.axes)||[];
    const lx=ax[0]||0, ly=ax[1]||0, rx=ax[2]||0, ry=ax[3]||0;
    const a=this._dec.a, b=this._dec.b, den=Math.max(0.15, 1-a*b);
    return { x:(rx - b*lx)/den, y:(ry - b*ly)/den };
  },
  _btnPrev:{},
  btnPressed(ids){ // 任一指定按键“刚按下”沿（上一帧未按→本帧按下）；只跟踪传入的键位
    const b = (this.pad && this.pad.buttons) || [];
    const pr = i => !!(b[i] && (b[i].pressed || b[i].value > 0.5));
    let hit = false;
    for(const i of ids){
      const cur = pr(i);
      if(cur && !this._btnPrev[i]) hit = true;
      this._btnPrev[i] = cur;
    }
    return hit;
  },
};

// 🎮 1P 能否使用手柄左摇杆：双人模式下 2P 要用手柄（本地同屏），此时让给 2P；
//    单人 / AI 组队 / 联机主机（2P 是手机）时手柄空闲，1P 可自由使用
// 🎮 1P 能否使用手柄左摇杆：只要 2P 是真人在用手柄（双人/三人模式），手柄就归 2P；
//    单人 / 与 AI 组队（2P 是 AI）/ 联机主机（2P 是手机）时手柄空闲，1P 可自由使用
function padUsableBy1P(){ return !(multiOn() && !isAISeat(1) && !netIsHostLinked()); }

// ===== ⚡ 各角色「主动技能」释放键（2026-10-06 统一改为 🖱 鼠标左键单击） =====
// 剑士斩灭 / 射手环形弹幕 / 激光旋转扫射 / 爆破轰炸区 / 龙卷风突进 / 将军冲刺 —— 全部同一个键：
//   1P：🖱 鼠标左键**单击**（键盘空格已取消）；2P / 3P 真人：手柄按钮 5（RB）
// 只认「单击那一瞬」：按"点击次数"消费（mousedown/mouseup 落在同一帧也不会漏掉），
//   菜单里点的鼠标全部作废，不会一开局就自动放技能。AI 座位不看这个（各自走 AI 决策）。
const BOMB_PAD_BTN = 5;
// 每个技能线各自一个"已消费到的点击序号"游标：同一帧里两条线互不抢（不同角色只会走其中一条）
const _ultClickSeen = { bomb: 0, dash: 0, spring: 0 };
function mouseClickEdge(key){
  const c = G.mouseClicks || 0;
  if(c < _ultClickSeen[key]) _ultClickSeen[key] = c; // 计数被重置（重开局）→ 游标跟随，免得"要点好多次才生效"
  let hit = false;
  if(G.state === 'playing' && c > _ultClickSeen[key]) hit = true; // 有待消费的点击
  _ultClickSeen[key] = c;                                          // 消费掉（本次不管能不能放，都不再重复触发）
  return hit;
}
// 手柄 RB 按下沿（2P/3P 真人独占手柄；单人 / 与 AI 组队 / 联机主机时 1P 也能用，与移动让位规则同口径）
const _padPrev = { bomb: false, dash: false };
function _padRBEdge(seat, key){
  const padMine = (seat > 0) ? !isAISeat(seat) : padUsableBy1P();
  let hit = false, cur = false;
  if(padMine){
    const bts = GP.pad && GP.pad.buttons;
    cur = !!(bts && bts[BOMB_PAD_BTN] && (bts[BOMB_PAD_BTN].pressed || bts[BOMB_PAD_BTN].value > 0.5));
    if(cur && !_padPrev[key]) hit = true;
  }
  _padPrev[key] = cur;
  return hit;
}
// 通用主动技能键（剑士斩灭 / 射手环形弹幕 / 激光旋转扫射 / 爆破轰炸区 / 龙卷风突进共用）
function bombFirePressed(seat){
  const click = (seat === 0) && mouseClickEdge('bomb');
  return click || _padRBEdge(seat, 'bomb') || (seat === 1 && net2PSkillPressed());
}
// ⚔️ 将军「冲刺」：同一个鼠标左键（独立游标，与上面的技能线互不抢）
function dashFirePressed(seat){
  const click = (seat === 0) && mouseClickEdge('dash');
  return click || _padRBEdge(seat, 'dash') || (seat === 1 && net2PSkillPressed());
}
// 🥎 投掷角色「大铁锤」：🖱 右键单击（1P）/ 手柄 RB（2P·3P 与 1P 用手柄时）。右手独立通道（mouseRClicks），不与左键投掷抢
// ===== 🔮 魔法师「法术轮盘」（2026-10-08 用户定：取消随机施法，改成手动切）=====
// 玩法：🖱 右键单击（1P）/ 手柄 LB（2P·3P）循环切换当前法术 →
//   普攻（自动出手，间隔 shootRate）**释放当前选中的法术**，不再看运气。
// 核心口径：选中的法术**冷却中 → 这一手哑火**（不出手，白等一个出手间隔）——
//   这就是"最吃操作"的来源：必须在出手前把法术切对，还得同时盯住冷却。
//   🔥 火球永远可用（普攻）／❄️ 冰霜 2.2s 冷却（随机时代靠 1/3 概率天然分摊，手动后必须显式限，
//   否则无限冻怪）／🪨 土墙沿用 30s 冷却 + 不可叠加。
const MAGE_SPELLS = ['fire', 'frost', 'earth']; // 轮盘顺序（右键 → 下一个，循环）
const MAGE_SPELL_COL = { fire:'#ff8a3d', frost:'#9fe4ff', earth:'#a8845a' }; // 火橙 / 冰青 / **土墙棕**（土=与土墙本体同源的棕色，2026-10-08 用户定）
function nextMageSpell(cur){
  const i = MAGE_SPELLS.indexOf(cur);
  return MAGE_SPELLS[(i < 0 ? 0 : i + 1) % MAGE_SPELLS.length];
}
// 该法术此刻能不能放（false → 这一手哑火）
function mageSpellReady(p, s){
  if(!p) return false;
  if(s === 'frost') return (p.frostCd || 0) <= 0;
  if(s === 'earth') return (p.wallCd || 0) <= 0 && !wallOf(p);
  return true; // 🔥 火球 = 普攻，永远可放
}
// 就绪度 0~1（HUD 轮盘画冷却弧：1 = 可以放）
function mageSpellFrac(p, s){
  if(!p) return 0;
  if(s === 'frost') return clamp(1 - (p.frostCd || 0) / Math.max(0.001, p.frostCdMax || 0.001), 0, 1);
  if(s === 'earth'){
    const w = wallOf(p);
    if(w) return clamp(w.hits / Math.max(1, w.maxHits), 0, 1); // 立着自己的墙 → 显示墙的剩余次数
    return clamp(1 - (p.wallCd || 0) / Math.max(0.001, p.wallCdMax || 0.001), 0, 1);
  }
  return 1;
}
// 🔮 法术切换键：1P 鼠标右键（独立计数游标，与左键技能线互不抢）+ 手柄 LB（按钮 4）
const MAGE_CYCLE_PAD_BTN = 4;
const _rClickSeen = { mage: 0, spring: 0 };
const _padPrevLB = { mage: false, tult: false, spring: false };
function mouseRClickEdge(key){
  const c = G.mouseRClicks || 0;
  if(c < _rClickSeen[key]) _rClickSeen[key] = c; // 计数被重置（重开局）→ 游标跟随，免得"要按好几次才切一次"
  let hit = false;
  if(G.state === 'playing' && c > _rClickSeen[key]) hit = true; // 有待消费的右键
  _rClickSeen[key] = c;
  return hit;
}
function _padLBEdge(seat, key){
  const padMine = (seat > 0) ? !isAISeat(seat) : padUsableBy1P();
  let hit = false, cur = false;
  if(padMine){
    const bts = GP.pad && GP.pad.buttons;
    cur = !!(bts && bts[MAGE_CYCLE_PAD_BTN] && (bts[MAGE_CYCLE_PAD_BTN].pressed || bts[MAGE_CYCLE_PAD_BTN].value > 0.5));
    if(cur && !_padPrevLB[key]) hit = true;
  }
  _padPrevLB[key] = cur;
  return hit;
}
function mageCyclePressed(seat){
  const click = (seat === 0) && mouseRClickEdge('mage');
  return click || _padLBEdge(seat, 'mage');
}
// 🥊 弹簧「弹簧钩」释放键：🖱 鼠标**右键**（1P，与左键蓄力拳分工）/ 手柄 LB（法师切法术那个键）/ 触屏技能按钮 / 联机 2P 数据通道
//   （走右键独立通道：左键是"按住蓄力、松手出拳"的普攻键，主动技必须另用一个键，否则按住就放钩索）
function springHookPressed(seat){
  const click = (seat === 0) && mouseRClickEdge('spring');
  // 📱 触屏「技能」按钮走的是**左键单击通道**（mouseClicks，见 bindSkillBtn）——手机上它就是技能键，
  //    与出拳不冲突（触屏没有"按住"手势，出拳在 updateSpring 里自动快拳进行）
  const tap = (seat === 0) && G.deviceType === 'phone' && mouseClickEdge('spring');
  return click || tap || _padLBEdge(seat, 'spring') || (seat === 1 && net2PSkillPressed());
}
// 🥊 弹簧拳蓄力键（**按住状态**，不是按下沿）：1P 🖱 鼠标左键 / 🎮 手柄按钮 5（RB，全角色主动技同键——
//    但弹簧的主动技在 LB，RB 专供蓄力拳：按住攒劲、松手弹射）。2P/3P 手柄座位各自判归属（不跟 1P 鼠标抢）
function springPunchHeld(seat){
  const padMine = (seat > 0) ? !isAISeat(seat) : padUsableBy1P();
  if(!padMine) return false;
  const bts = GP.pad && GP.pad.buttons;
  return !!(bts && bts[BOMB_PAD_BTN] && (bts[BOMB_PAD_BTN].pressed || bts[BOMB_PAD_BTN].value > 0.5));
}

// ===== 🐣 新手「战吼」：团队的临时号令（2026-10-08 用户定：尖叫升级成战吼）=====
// 吼完 3 秒内：**自己和队友**直接造成的伤害 ×1.5（击退半步保留）。口径：
//   · 只加成**玩家的直接攻击**（普攻 / 主动技 / 大招 / 开着的战车炮）；
//   · 自治单位不吃：将军征召的小兵、工程师的炮台（它们不是"被吼到的人"）；
//   · 队友 = 同阵营玩家（合作/AI 组队/联机的所有玩家座位）；⚔️对战里对手不吃。
const ROAR_MUL = 1.5;
// ===== 🧟 尸潮模式：连杀加成（"越杀越爽"的数值引擎）=====
// 2.5 秒内每击杀一个敌人叠 1 层：每层 +1.5% 伤害（封顶 +60%），断档归零。
// 加伤从 CM().dmgMul 统一入口注入 —— 所有伤害出口（普攻/近战/技能/大招/召唤物）都读它，全角色一视同仁。
const HORDE_COMBO_T = 2.5, HORDE_COMBO_STEP = 0.015, HORDE_COMBO_MAX = 0.60;
const HORDE_XP_MUL = 1.6; // 🧟 尸潮经验倍率：无技能卡模式下等级是唯一成长线，必须喂饱
function comboMul(){ return (G.horde && G.combo > 0) ? 1 + Math.min(HORDE_COMBO_MAX, G.combo * HORDE_COMBO_STEP) : 1; }
// 🧟 连杀计时衰减：窗口内没新击杀就断档归零（主循环每帧调；独立成函数便于测试）
function updateHordeCombo(dt){
  if(!G.horde || G.comboT <= 0) return;
  G.comboT -= dt;
  if(G.comboT <= 0){ G.comboT = 0; G.combo = 0; }
}
const ROAR_DUR = 3; // 战吼增伤持续（秒）
function roarMul(p){ return (p && p.rageT > 0) ? ROAR_MUL : 1; }

// ===== 🐣 菜鸟「扔木棍」（2026-10-09 用户定）：一把不长眼的木棍，**全程 0 伤害**，只绊人 ====
// 口径（用户原话）：每 5 秒丢一根到自己**周围随机位置**；砸到怪 → 怪不受伤、木棍消失；
//   落地后存在 10 秒，踩到的**怪或自己**都被绊倒、眩晕 0.5 秒后起身继续走；
//   超 10 秒或被踩 4 次 → 木棍消失；「挥快一点」升级时**同时**缩短挥棍间隔和丢棍间隔。
const ROOKIE_TOSS_CD   = 5;    // 初始丢棍间隔（秒）
const ROOKIE_TOSS_STEP = 0.4;  // 「挥快一点」每级同时缩短（5 → 3 秒）
const ROOKIE_TOSS_MIN  = 2;    // 丢棍间隔下限（满级再学也不会变成连发）
const STICK_FLY        = 0.38; // 木棍飞行时间（秒，抛物线）
const STICK_LIFE       = 10;   // 落地后存在时长（秒）
const STICK_HITS_MAX   = 4;    // 被踩 4 次 → 打滚着跑掉（不是碎掉）
const STICK_ROLL_TIME  = 0.7;  // 🪵 退场动画：滚走时长（秒）
const STICK_ROLL_DIST  = 150;  // 滚走的距离（px，初快末慢）
// 木棍退场为什么是「滚走」而不是「碎掉」：木棍滚起来就是**滚木**，而滚木永远不可能存在 ——
// 所以它滚出去之后就没了（2026-10-09 用户定）。滚动期间只是视觉，不再绊人。
const STICK_STUN       = 0.5;  // 绊倒眩晕 0.5 秒后起身继续走（**始终 0 伤害**）
const STICK_IMMUNE     = 1.2;  // 被绊倒后的免疫窗（防同一根/多根把人连控死）
const STICK_R          = 13;   // 木棍的绊倒判定半径
const STICK_TOSS_MIN_D = 70;   // 落点：离自己最近
const STICK_TOSS_MAX_D = 170;  // 落点：离自己最远
const STICK_ARC        = 16;   // 飞行弧高（纯视觉）
function recalcTossCD(p){ // 🐣 丢棍间隔**唯一写点**：等级全部来自「挥快一点」（r_rate）
  p.rkTossCDMax = Math.max(ROOKIE_TOSS_MIN, ROOKIE_TOSS_CD - ROOKIE_TOSS_STEP * (p.skills.r_rate || 0));
}

// ===== 🪃 回旋镖（第十三角色）：普攻**往返双段** + 大招**贴身环绕 5 秒** =====
// ⚠️ 2026-10-10 用户定口径（别再合并成一套）：
//   · **普攻** = 往返双段：朝瞄准方向直线飞出 BM_RANGE → 折返 → **追踪玩家飞回来** → 接住；
//     去程与回程**各算一次伤害**（同一敌人最多吃两段）→ 输出靠"把怪留在弧线上"。
//   · **大招「万镖齐发」** = 环绕刀网：一圈甩出 BM_ULT_N 枚，每枚飞到轨道半径后**贴身高速环绕**
//     BM_ORBIT_T(5) 秒（跟着人走）→ 时间到自动**收回**。环绕期间是持续输出（每 0.35 秒咬一口）。
// 与射手的区别：射手是"直线单段、越快越密"；回旋镖普攻是"弧线双段、要等它回来"，大招是"贴身刀网"。
const BM_RANGE      = 300;  // 普攻：去程飞行距离（到点折返；📏长弧可加）
const BM_SPD_OUT    = 560;  // 去程速度
const BM_SPD_BACK   = 780;  // 回程速度（回来更急：往返一圈更短）
const BM_MAX        = 2;    // 场上同时最多几枚（基础；满了这一手不扔）
const BM_MAXLIFE    = 3.0;  // 普攻单枚最长存活（秒）——超时算"没接住"，落地消失
const BM_PIERCE     = 2;    // 去程 / 回程各自的穿透数（➹贯穿可加）
const BM_R          = 11;   // 镖体判定半径（绘制同一系数 → 看得见就打得中）
const BM_RETURN_MUL = 1.0;  // 回程伤害倍率（「回旋重击」可升到 1.2/1.4/1.6）
const BM_CATCH_TOL  = 22;   // 接住判定的额外容差（px）
// ---- 🌀 大招「万镖齐发」专属：贴身环绕 ----
const BM_ORBIT_R    = 105;  // 环绕半径（绕着玩家转的圈；📏长弧可加）
const BM_ORBIT_W    = 12;   // 环绕角速度（rad/s ≈ 每秒 1.9 圈，"高速"；💨破风可加）
const BM_ORBIT_T    = 5.0;  // 环绕持续（秒）—— 到点自动收回（2026-10-10 用户定）
const BM_ORBIT_TICK = 0.35; // 同一敌人的再伤间隔（秒）：环绕是持续输出，靠它防"每帧都咬一口"
const BM_ORBIT_LIFE = 7.6;  // 大招镖最长存活（甩出 ~0.2 + 环绕 5 + 收回 ~0.3，留足余量）
const BM_ULT_CD     = 30;   // 大招「万镖齐发」冷却（秒）
const BM_ULT_N      = 8;    // 大招一次扔出几枚（镖阵扩张可提升）
const BM_ULT_GAP    = 0.09; // 大招逐枚投出的节拍（秒）
const BM_ULT_DMGMUL = 0.5;  // 大招那批镖的伤害折扣（一次 8 枚同时环绕，不打折会瞬间清场）

// ===== 🍅 番茄酱之神（第十六角色）常量 =====
// 核心：普攻 = 扔出一包麦当劳番茄酱（命中敌人 → 严重减速 + 当场爆出一滩大酱潭；没扔中、撞墙/出界也爆）；
//   主动技「吃番茄酱」= 吃下一包回 20 血 + 顺手把空袋捏爆：酱汁呈放射状爆出许多滴，
//   滴子飞出去落地，每一滴都化成一滩大「番茄酱潭」（ketchuppool 效果）：
//   潭内敌人严重减速（移速 ×0.5）+ 持续掉血（每 0.4 秒一跳）。
const KET_DROPS = 6;      // 🍅 每次捏爆爆出的酱滴数（围绕自身一圈撒开，落地成多滩大酱潭）
const KET_R      = 55;    // 大酱潭半径（世界坐标；视觉与判定同一个口径）
const KET_DUR    = 4.5;   // 大酱潭持续时间（秒）
const KET_DROP_SPD = 235; // 酱滴飞行速度（px/s，带随机浮动）
const KET_DROP_FLT = 0.36;// 酱滴飞行时长（秒）——落点 = 速度×时长，随机不呆板
const KET_TICK   = 0.4;   // 酱潭结算节拍（秒/跳）
const KET_DMG    = 7;     // 每跳伤害 + 扔中直接伤害基准（必须 > 新手的 6：新手是「全员最弱」硬口径，见 test_rookie E3）
const KET_SLOW   = 0.50;  // 潭内敌人移速倍率（"严重减速"；Boss 免疫减速但照常吃伤害）
const KET_THROW_SPD = 560;// 🍅 扔出番茄酱包的弹速（px/s，同卡牌弹丸一档）
const KET_PACK_R = 8;     // 番茄酱包子弹半径（世界坐标）
const KET_HIT_SLOW_T = 2.0; // 🍅 扔中敌人的减速持续时长（秒）
const KET_POOL_CHANCE = 1.0;  // 🍅 扔中时爆出一滩大酱潭：恒为 1.0 = 「扔中必爆」（2026-10-21 用户改：原 0.35 概率 → 命中必定当场爆潭）
const KET_RATE   = 0.85;  // 普攻出手间隔（秒）
const KET_EAT_CD = 30;    // 🍅 主动技「吃番茄酱」冷却（秒）
const KET_EAT_HP = 20;    // 回血量
const KET_SKILL_DUR_BONUS = 3.0; // 🍅 技能捏爆出的酱潭额外多活 3 秒（4.5→7.5；「酱汁持久」照常叠加）

// ===== 🛡 骑士（第十七角色 · 重甲坦克剑士）常量 =====
// 核心三件套（2026-10-21 用户定稿）：
//   ① 挥剑：高伤 · 低频 · **有前摇**（起手式 0.30s 才落刀）——重剑收不住，前摇结束照斩
//   ② 举盾：**不攻击时**（挥砍动画那 0.18s 之外）自动举盾，挡住**正面扇区**飞来的攻击与弹幕
//      （判定：来源在盾半径内 + 落在以瞄准方向为中的盾面张角里；挡住即无事发生，敌人的攻击照常进 CD）
//   ③ 主动技「勇士冲锋」（🖱 左键 / 手柄RB）：**自身无敌 5 秒** + 移速 ×1.5 + 出手间隔 ×0.6；
//      期间**范围内有队友就给每人挂 1 层「次数盾」**（一击即破）+ **范围内队友减伤 50%**（范围减伤只挂在技能上，没有常驻光环）
const KN_HP        = 160;  // 生命上限：全场最厚（剑士 130 / 将军 126）
const KN_SPD       = 185;  // 移速：全场最慢（菜鸟 205 / 工程师 235）
const KN_RATE      = 0.90; // 挥剑间隔：全场最慢一档（菜鸟 0.62 / 剑士 0.45）
const KN_DMG       = 36;   // 单剑伤害：全场最高（剑士 26 / 将军 22）——DPS 让给盾与生存
const KN_RANGE     = 80;   // 挥剑半径（世界坐标；剑士 78）
const KN_ARC       = 50 * Math.PI/180; // 挥剑张角半角：正面 100°（比剑士 90° 略宽，重剑抡得开）
const KN_WINDUP    = 0.30; // 前摇时长（秒）：起手式到落刀之间（🛡举盾中，玩家可决定继续还是取消走位）
const KN_SHIELD_R  = 90;   // 举盾挡截半径（世界坐标）：来袭进入这个范围才谈得上被挡
const KN_SHIELD_ARC= 60 * Math.PI/180; // 盾面张角半角：正面 120°（比剑宽一档，盾本来就是宽的）
const KN_CHARGE_CD = 24;   // 「勇士冲锋」冷却（秒；2026-10-23 削：20→24）
const KN_CHARGE_T  = 3.0;  // 「勇士冲锋」持续（秒；2026-10-23 削：5→3，保留举盾、只削无敌时长）
const KN_CHARGE_SPD= 1.5;  // 冲锋期间自身移速倍率
const KN_CHARGE_RATE = 0.6; // 冲锋期间自身出手间隔倍率（×0.6 = 快 40%）
const KN_AURA_R    = 220;  // 队友增益半径（世界坐标）：范围内的队友吃次数盾 + 减伤
const KN_AURA_DR   = 0.50; // 队友减伤比例（50%；「守护誓言」可加深）
const KN_WIND_FLOOR = 0.15; // 前摇最短时长（「疾风斩」下限，重剑不许零前摇）

// ===== 🎻 吟游诗人（第十八角色 · 团队治疗）常量 =====
//   定位：**远程 · 唯一的治疗位** —— 输出全场最低，但能把队友从死亡线上拉回来。
//   普攻 = 拨弦发出一道**穿透音波**（默认穿 2 个目标，共打 3 个；伤害低但很好打中）。
//   主动技「回旋曲」：原地拉曲 3 秒，每秒给自己与范围内队友回血 + 移速加成；自己挨打就断。
const BARD_HP        = 85;   // 生命上限（用户定：全场最脆）
const BARD_SPD       = 240;  // 移速（快一档：脆皮只能靠跑）
const BARD_RATE      = 0.30; // 普攻出手间隔（秒）
const BARD_DMG       = 8;    // 单道音波伤害（全场最低，靠穿透和辅助吃饭）
const BARD_WAVE_R    = 11;   // 音波半径（宽一点，好打中）
const BARD_WAVE_SPD  = 430;  // 音波飞行速度（px/s，慢一些更像一道声浪）
const BARD_WAVE_LIFE = 0.60; // 音波寿命（秒）→ 射程 ≈ 258px
const BARD_PIERCE    = 2;    // 穿透数（穿 2 个 = 共打 3 个；「和弦」可加）
const BARD_SONG_T    = 3.0;  // 「回旋曲」引导时长（秒；「长音」可加长）
const BARD_SONG_CD   = 22;   // 「回旋曲」冷却（秒；「加演」可缩短）
const BARD_SONG_R    = 200;  // 曲子半径：治疗 / 移速增益的生效范围
const BARD_HEAL      = 8;    // 每秒回血（「变奏」可加）
const BARD_SPD_BUFF  = 0.15; // 拉曲期间队友移速加成（+15%）

// ===== 🥊 弹簧（第十九个角色 · 蓄力弹飞 + 弹簧钩）常量 =====
//   定位：**近战 · 蓄力弹簧拳** —— 全场唯一"手动蓄力普攻"的角色：按住蓄力、松手出拳，
//   拳锋把面前的怪**弹飞**；蓄力越久飞得越远、伤害越高。被弹飞的怪**撞到墙**会受到
//   额外伤害并炸开一道冲击波（把旁边的怪一起掀翻）。
//   主动技「弹簧钩」：甩出一根弹簧钩锚到光标处，把自己**拉过去**——牵引途中**无敌**，
//   并对沿途碰到的怪造成伤害（位移技 + 穿怪技二合一）。
//   生命 102（用户定）：比剑士薄、比诗人厚 —— 弹开怪群就是它的"防御"。
const SP_HP        = 102;    // 生命上限（用户定 102）
const SP_SPD       = 250;    // 移速（中快一档：弹簧要敢跳进怪堆打出拳，也要能拔出来）
const SP_CHARGE_MAX= 1.0;    // 满蓄时长（秒）：按住左键攒满 1 秒即最大蓄力
const SP_RATE      = 0.42;   // 出拳后冷却（秒）：蓄力是主要节奏，冷却只防无脑连点
const SP_RANGE     = 132;    // 拳程基础（世界坐标；满蓄 +SP_RANGE_CHG）
const SP_RANGE_CHG = 46;     // 满蓄附加拳程（132→178）
const SP_ARC       = 0.62;   // 出拳张角半角（弧度 ≈ 71°）：正面一锥，不是一整排
const SP_DMG       = 12;     // 单拳基础伤害（命中锥内**所有**敌人；满蓄 +SP_DMG_CHG）
const SP_DMG_CHG   = 30;     // 满蓄附加伤害（12→42）
const SP_LAUNCH    = 760;    // 弹飞初速基础（px/s；满蓄 +SP_LAUNCH_CHG）
const SP_LAUNCH_CHG= 980;    // 满蓄附加弹飞初速（760→1740）
const SP_FLY_T     = 0.60;   // 弹飞滞留时长（秒）：期间敌人 AI 冻结（stun），位移由弹簧系统接管
const SP_WALL_DMG  = 18;     // 撞墙额外伤害基础（满蓄 +SP_WALL_DMG_CHG）
const SP_WALL_DMG_CHG = 26;  // 满蓄附加撞墙伤害（18→44）
const SP_WAVE_R    = 110;    // 冲击波半径基础（满蓄 +SP_WAVE_R_CHG）
const SP_WAVE_R_CHG= 70;     // 满蓄附加冲击波半径（110→180）
const SP_WAVE_DMG  = 10;     // 冲击波伤害基础（满蓄 +SP_WAVE_DMG_CHG）
const SP_WAVE_DMG_CHG = 16;  // 满蓄附加冲击波伤害（10→26）
const SP_WAVE_KB   = 420;    // 冲击波击退冲量（px/s；与体型成反比，见 springWaveHit）
const SP_HOOK_CD   = 9;      // 「弹簧钩」冷却（秒）
const SP_HOOK_RANGE= 460;    // 钩索最大锚距（世界坐标；光标更远就夹到这个距离）
const SP_HOOK_SPD  = 1050;   // 牵引速度（px/s）：抽回去的手感要快
const SP_HOOK_T    = 0.50;   // 牵引时长上限（秒）：距离除以速度，封顶这个数
const SP_HOOK_DMG  = 14;     // 牵引碰伤（每次牵引每个敌人只结算一次）
const SP_HOOK_KB   = 260;    // 牵引碰伤的击退冲量（px/s）
const SP_TOUCH_FRAC= 0.2;    // 📱 触屏自动快拳的蓄力档（没有"按住"手势，用最小蓄力的快拳）

// ===== 🎵 「回旋曲」旋律（拉曲那 3 秒里真的在放一段曲子）=====
//   结构：圆舞曲三拍感（0.3 秒一格）+ C 大调五声音阶（C D E G A，不含半音 → 怎么走都不脏）
//   走向：A5-G5-E5（落）→ D5-E5-G5（起）→ A5-C6（最高点）→ A5-E5（收回，循环回 A5）
//   低音铺底：C3 → A2 → F3 → C3（C-Am-F-C，最稳的流行进行）
//   每行 = [相对起手时间, 频率(Hz), 时长, 音量, 音色]；必须按时间升序（推进器靠顺序 break）
const BARD_MELODY = [
  [0.30,  130.81, 0.85, 0.030, 'sine'],     // C3  低音
  [0.30,  880.00, 0.26, 0.052, 'triangle'], // A5
  [0.60,  783.99, 0.24, 0.050, 'triangle'], // G5
  [0.90,  659.25, 0.30, 0.052, 'triangle'], // E5
  [1.20,  110.00, 0.85, 0.030, 'sine'],     // A2  低音
  [1.20,  587.33, 0.26, 0.048, 'triangle'], // D5
  [1.50,  659.25, 0.26, 0.050, 'triangle'], // E5
  [1.80,  783.99, 0.28, 0.052, 'triangle'], // G5
  [2.10,  174.61, 0.85, 0.030, 'sine'],     // F3  低音
  [2.10,  880.00, 0.26, 0.052, 'triangle'], // A5
  [2.40, 1046.50, 0.34, 0.054, 'triangle'], // C6  ← 最高点（这一段最好听的地方）
  [2.70,  130.81, 0.60, 0.028, 'sine'],     // C3  低音收
  [2.70,  880.00, 0.24, 0.048, 'triangle'], // A5
  [2.95,  659.25, 0.40, 0.046, 'triangle'], // E5  → 循环回 A5（属音回主音，接得上）
];
const BARD_MELODY_LEN = 3.35; // 一轮长度（秒）；「长音」把引导拉到 4/5 秒时会自动从头再来一遍


// ===== UTILS =====
const rand = (a,b) => a + Math.random()*(b-a);
const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
// 🩸 吸血鬼豁免判定（"血线吸附版"的遗留框架 · 一代设定下恒为 false，保留以便将来切换）：
//   原本语义：只要「这只怪自己」正被吸血鬼的血线吸着（src = 那只怪本身 / 它射出的弹幕 / 它打出的范围技），
//   它就对吸血鬼造成不了任何伤害。**一代没有血线**（Player.vampLinks 恒空）→ 本函数恒返回 false。
//   src 认法（血线版）：① src 就是那只怪；② src.owner 是那只怪（它射的弹幕带着 owner）；
//                       ③ fromBoss 的群体技（火雨/岩浆/火焰/黑洞/激光）统一归给当前 Boss。
function vampBlocked(P, src){
  return !!(P && P.isVampire && typeof P.vampLinked === 'function' && P.vampLinked(src));
}
// 🛡 骑士举盾格挡（2026-10-21 用户定：「不攻击时举盾防御，抵挡前方的攻击和弹幕」）——
//   三条同时满足才挡下：① 是骑士本人，且**不在挥砍动画中**（挥剑那 0.18s 盾是收起的——"不攻击时才举盾"）
//                     ② 来袭来源落在**盾半径**内（kShieldR，默认 90：太远的来袭盾还摸不到，等它飞进来）
//                     ③ 来袭方向落在**以瞄准方向为中线**的盾面张角里（kShieldArc，默认半角 60°=正面 120°）
//   只认「攻击与弹幕」类来源（敌方弹幕 / 小怪 / Boss 的接触与冲撞），不认持续伤害与地形（酱潭/毒潭/岩浆等没有敌人身份）
//   挡下 = 近身攻击无事发生（不掉血、不吃击退）；**敌方弹幕被盾直接消掉**（dead 掉，不再穿过去飞），符合"用盾消除弹幕"的口径
function knightShieldBlock(p, src){
  if(!p || !p.isKnight) return false;
  if(p.swingT > 0) return false;   // 挥砍中：盾牌收起（攻击时不能防御）；攻击前摇期间盾仍举着（可挡）
  if(!src || typeof src.x !== 'number' || typeof src.y !== 'number') return false;
  // 只认「攻击与弹幕」类来源：敌人/敌弹/Boss/小兵（都带 takeDamage 方法）、⚔️对战的对手与其子弹；
  // 不认持续伤害与地形效果（酱潭/毒潭/腐蚀潭/岩浆/冲击波等都是纯数据对象，没有 takeDamage）
  const isAttackSrc = typeof src.takeDamage === 'function' || src.isBullet === true
    || src instanceof Bullet || (src.seat !== undefined && !src.isBoss);
  if(!isAttackSrc) return false;
  if(dist(p, src) > (p.kShieldR || KN_SHIELD_R)) return false;
  const fa = angleTo(p, p.aimPoint());              // 盾面朝向 = 当前瞄准方向（玩家用鼠标转盾）
  const inc = Math.atan2(src.y - p.y, src.x - p.x); // 来袭来源相对玩家的方向
  const diff = Math.abs(((inc - fa + Math.PI*3) % (Math.PI*2)) - Math.PI);
  if(diff > (p.kShieldArc || KN_SHIELD_ARC)) return false; // 身侧/背后来的一律不挡
  // 挡下了：盾面火花 + 闷响（kBlockFx 供 draw 画盾牌闪光）
  p.kBlockFx = 0.2;
  p.kBlocks = (p.kBlocks || 0) + 1;
  spawnParticles(src.x, src.y, '#cfe4ff', 5);
  SND.knightBlock();
  // 🛡 弹幕被盾消掉（不是穿过去）：正面挡下的敌弹/对手子弹直接销毁；近身敌人/Boss 接触伤害只挡不杀
  if(src.isBullet || src instanceof Bullet) src.dead = true;
  return true;
}
// 点到线段的最短距离（🦇 血月突袭的"沿途切击"带状判定：线段 = 突进轨迹，半径 = 爪宽）
function ptSegDist(px, py, x1, y1, x2, y2){
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx*dx + dy*dy;
  let t = L2 > 0 ? ((px - x1)*dx + (py - y1)*dy) / L2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + dx*t), py - (y1 + dy*t));
}
const lerp = (a,b,t) => a+(b-a)*t;
const angleTo = (a,b) => Math.atan2(b.y-a.y, b.x-a.x);
const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
// 🗡 挥砍动画角度：k=0→1。前 70% 剑刃由 dir-arc 扫到 dir+arc（出手快、末段缓），
// 后 30% 从 dir+arc 收回正前方 —— 收刀保证动画结束时与「朝向鼠标」的静止姿态无缝衔接
function swingAngle(dir, arc, k){
  if(k <= 0) return dir - arc;
  if(k >= 1) return dir;
  if(k < 0.7){
    const t = k / 0.7, e = 1 - Math.pow(1 - t, 3); // easeOutCubic
    return dir - arc + arc * 2 * e;
  }
  const t = (k - 0.7) / 0.3, e = t * t; // easeInQuad 收回
  return dir + arc - arc * e;
}
function pushPlayer(Q, fx, fy, force){ // 击退玩家：施加从(fx,fy)指向玩家的冲量（kbx/kby 在 Player.update 内衰减）
  const d = Math.hypot(Q.x-fx, Q.y-fy) || 1;
  Q.kbx = (Q.x-fx)/d*force;
  Q.kby = (Q.y-fy)/d*force;
};
// 🛡 伤害来源判定：这一击算「远程」还是「近战」——护盾类机制（斩铁剑皇的盾）按此减免
//   远程角色 = 射手 / 激光 / 爆破 / 毒液 / 魔法师（子弹 · 光束 · 轰炸区 · 毒液领域 · 魔法都在远处生效）
//   近战角色 = 剑士 / 龙卷风（挥砍、剑气、剑轮、风眼）：贴身作战，不吃护盾的远程减免
//   seat 缺省（无主伤害）时按近战处理 → 永不误伤"没传座位的调用方"
const SHIELD_RANGED_MUL = 0.5; // 远程角色打护盾：伤害 ×0.5
function isRangedSource(seat){
  if(seat === undefined || seat === null) return false;
  const p = G.players && G.players[seat];
  if(!p) return false;
  const k = heroKind(p);
  return k === 'gunner' || k === 'laser' || k === 'bomber' || k === 'venom' || k === 'mage' || k === 'stone' || k === 'boomerang' || k === 'ketchup' || k === 'bard'; // 🪨 投石也是远程来源（石头是抛出去砸的，站在远处）；🪃 回旋镖同理；🍅 番茄酱包是甩出去砸人的（同投掷口径）；🎭 试剂瓶也是扔出去砸的
}

// ===== ⚖️ 经验平衡：AI 队友主动把经验让给落后的玩家 =====
// 规则：AI 队友的累计经验高于任意一位真人玩家时，这位 AI 不吸不捡经验宝石 ——
//      宝石留在地上，谁走近都不算（只有玩家自己来磁吸才拿得到）。
//      两个例外仍归 AI：① 宝石快消失了（不捡就白丢）② 那位玩家已阵亡（那就没必要让了）
//      👥 多人通用：三人模式里有两个真人、一个 AI —— AI 只要领先其中任何一位就让，避免它一个人滚雪球
const XP_YIELD_GRACE = 6; // 宝石剩余寿命 ≤ 该秒数时不再让（免得让到过期，经验白丢）
// 🧲 经验宝石磁吸的跟随速度（2026-10-09 用户定：「永远快于玩家」）——
//    原先写死 400px/s：🦇吸血鬼(330) 学「移速强化」、♾无尽刷速之后，宝石追不上主人，一路跟到过期白丢。
//    现在按**玩家此刻的移速**算：玩家越快，宝石追得越急，永远有富余能咬上去。
const GEM_SPD_BASE = 400;  // 跟随速度下限（慢角色用，保持原来的手感）
const GEM_SPD_MUL  = 1.45; // 跟随速度 = max(下限, 玩家当前移速 × 该倍数) —— 必须 >1，否则追不上
function gemFollowSpd(p){ // 玩家此刻的"实际移动速度"（战车形态按车速，本体 speed 属性不是它真正跑的像素数）
  if(!p) return GEM_SPD_BASE;
  const v = p.veh ? VEH_SPD : (p.speed || 0);
  return Math.max(GEM_SPD_BASE, v * GEM_SPD_MUL);
}
function xpTotalOf(p){ // 累计获得经验：按同一条需求曲线（10 → ×1.55+8）把当前等级折算回去，再加手上未用掉的 xp
  let total = 0, need = 10;
  for(let i = p.lv; i > 1; i--){ total += need; need = Math.floor(need * 1.55 + 8); }
  return total + (p.xp || 0);
}
function aiYielding(ai){ // ⚖️ 该 AI 是否正在"让经验"：它累计经验领先至少一位存活真人玩家
  if(!ai || !isAIPlayer(ai) || ai.dead) return false;
  if(!G.coop || !G.players || G.players.length < 2) return false;
  const humans = G.players.filter(p => p !== ai && !p.dead && !isAIPlayer(p)); // 只跟真人比（AI 之间没必要互相让）
  if(!humans.length) return false;
  const mine = xpTotalOf(ai);
  return humans.some(h => mine > xpTotalOf(h));
}
function gemYieldAI(){ // 兼容旧读法：返回第一位"正在让经验"的 AI 玩家（没有则 null）
  const list = G.players || [];
  for(const p of list) if(aiYielding(p)) return p;
  return null;
}

// ===== 🤖 AI 队友（陪玩 AI：可接管 2P「与 AI 组队」或 3P「三人模式」）=====
// 每帧给 AI 座位输出一个移动方向（归一化模拟量，与手机摇杆同格式），并刷新该座位的瞄准光标。
// 决策用"加权向量合成"：危险源给斥力、经验宝石给引力、队友给跟随力、边界给回推力。
// 🎭 三种角色打法不同 → AI 的走位策略跟着它自己的角色换（不是一套逻辑走天下）：
//   🗡 剑士：主动凑到挥砍距离（keep 74 < 挥砍半径 76）贴脸输出，敢吃接触伤；残血自动收手改保命
//   🏹 射手：中距离风筝，把怪压在感知半径外，从不贴身
//   🔆 激光：射程全屏所以站得最远，人也最脆 → 躲弹幕权重最高；过热期间完全没输出，躲得更狠
//  ⚖️ 另外：AI 累计经验领先真人玩家时不吸不捡经验宝石、也不去追（见 aiYielding）—— 主动让经验，等级保持接近
const AI = {
  NOISE: 0.08,       // 轻微走位抖动：不做完美机器人，避免贴脸极限闪避
  // 角色策略表：keep/aggro = 🗡贴身距离与引力；nearRange/nearK = 近身怪斥力；bulletK = 躲弹幕；
  //            follow/followW = 跟随队友；gemK/dangerFloor = 贪经验强度与「多危险才放弃捡」
  CFG: {
    melee:  { keep: 74, aggro: 1.35, nearRange: 200, nearK: 0.6,  bulletK: 0.85, follow: 300, followW: 0.7,  gemK: 0.85, dangerFloor: 1.15 },
    gunner: { keep: 0,  aggro: 0,    nearRange: 200, nearK: 1.2,  bulletK: 1.0,  follow: 230, followW: 0.85, gemK: 0.62, dangerFloor: 0.85 },
    laser:  { keep: 0,  aggro: 0,    nearRange: 340, nearK: 1.45, bulletK: 1.3,  follow: 250, followW: 0.8,  gemK: 0.55, dangerFloor: 0.8  },
    // 💣 爆破：中距离站位（投弹半径 96/爆炸 88，比射手稍远一点防止自己吃溅射），其余同射手
    bomber: { keep: 0,  aggro: 0,    nearRange: 240, nearK: 1.1,  bulletK: 1.0,  follow: 250, followW: 0.8,  gemK: 0.6,  dangerFloor: 0.9  },
    // 🌀 龙卷风：近战（360° 旋风斩半径 78，所以 keep 要略小于挥砍半径）——比剑士更敢往怪堆里扎：
    //    吸怪期间有 60% 减伤兜底，所以对"身边有怪"没那么怕（nearK 更低、dangerFloor 更高）
    tornado:{ keep: 70, aggro: 1.5,  nearRange: 240, nearK: 0.55, bulletK: 0.85, follow: 300, followW: 0.7,  gemK: 0.85, dangerFloor: 1.15 },
    // 🧪 毒液：远程（和射手同套走位），但毒液能挡怪 → 站位可以比射手更靠前一点（keep 仍为 0，nearK 更小）
    venom:  { keep: 0,  aggro: 0,    nearRange: 220, nearK: 1.05, bulletK: 1.0,  follow: 240, followW: 0.8,  gemK: 0.6,  dangerFloor: 0.9  },
    // ⚔️ 将军：近战长枪（突刺半径 118，keep 略小于枪距）——有突进跑路 + 小兵抗线，敢站得比剑士稍前
    general:{ keep: 95, aggro: 1.35, nearRange: 220, nearK: 0.6,  bulletK: 0.85, follow: 300, followW: 0.7,  gemK: 0.85, dangerFloor: 1.1  },
    // 🔮 魔法师：远程（火球/冰霜/土墙），有冰冻控场 + 土墙掩体 → 站位和毒液同档，但更敢贴一点
    mage:   { keep: 0,  aggro: 0,    nearRange: 230, nearK: 0.95, bulletK: 0.95, follow: 240, followW: 0.8,  gemK: 0.6,  dangerFloor: 0.95 },
    // 🦇 吸血鬼：近战利爪（半径只有 70，keep 必须比剑士更小才撕得到）+ 全场最快 330 → 最敢往怪堆里钻：
    //    它的"血条"就是出刀时身边怪的数量（命中即回血），所以 nearK 最低、dangerFloor 最高，抢经验也最凶
    vampire:{ keep: 62, aggro: 1.5,  nearRange: 190, nearK: 0.5,  bulletK: 0.8,  follow: 300, followW: 0.7,  gemK: 0.9,  dangerFloor: 1.2  },
    // 🪨 投石：远程站位（普攻拾取器只有 76 的戳击半径 → 必须像射手一样拉开距离，不能贴身）
    //    额外一条专属行为：空手时会主动跑去捡石头（见 aiStonePull —— 石头就是它的输出）
    stone:  { keep: 0,  aggro: 0,    nearRange: 230, nearK: 1.15, bulletK: 1.0,  follow: 240, followW: 0.8,  gemK: 0.7,  dangerFloor: 0.95 },
    // 🐣 新手：近战木棍（挥砍半径只有 62，全场最短 → keep 必须比它更小才够得着），但它是**全员最弱**：
    //    血 70 / 速 205 / 单棍 6 伤。所以这套策略的基调就是"怂"：不主动黏怪（aggro 最低）、
    //    对贴身怪更敏感（nearK 最高）、躲弹幕最积极（bulletK 最高）、最不贪经验（gemK 最低），
    //    而且 **半血就先收手**（fleeAt 0.45，别人是 32%）—— 它真打不过，先活着
    rookie: { keep: 52, aggro: 1.1,  nearRange: 210, nearK: 0.95, bulletK: 1.05, follow: 290, followW: 0.75, gemK: 0.68, dangerFloor: 0.95, fleeAt: 0.45 },
    // ⚙️ 工程师：放置系 —— 本体扳手只有 68（够短），真正的输出是射程 260 的炮台。
    //    所以它的走位基调是"站远一点、守着塔打"：不主动黏怪（aggro 0/keep 0），
    //    对贴身怪敏感（nearK 1.05），但**比射手稍敢贴**（炮台会先替它吃伤害的错觉 + 要能及时续塔）
    engineer: { keep: 0, aggro: 0,  nearRange: 255, nearK: 1.05, bulletK: 0.95, follow: 250, followW: 0.8, gemK: 0.62, dangerFloor: 0.9 },
    // 🪃 回旋镖：远程投掷系（回旋镖绕身边飞，和射手同档走位：拉开距离让镖自己绕）
    boomerang: { keep: 0, aggro: 0,  nearRange: 230, nearK: 1.1,  bulletK: 1.0,  follow: 240, followW: 0.8,  gemK: 0.62, dangerFloor: 0.9 },
    // 🐶 野生狗奶：近战短刀（半径 66，keep 必须比剑士更小才舔得到）—— 和吸血鬼同档"敢贴"
    dogmilk: { keep: 60, aggro: 1.4,  nearRange: 200, nearK: 0.55, bulletK: 0.85, follow: 290, followW: 0.7,  gemK: 0.85, dangerFloor: 1.15 },
    // 🃏 卡牌大师：远程赌徒（弹速 560 的卡牌弹丸，和射手同档风筝）
    cardmaster: { keep: 0, aggro: 0, nearRange: 220, nearK: 1.05, bulletK: 1.0,  follow: 240, followW: 0.8,  gemK: 0.6,  dangerFloor: 0.9 },
    // 🥎 投掷者：远程投掷系（道具 720 初速直飞 + 铁锤近战兜底 → 走位比射手稍敢贴，铁锤够得着人）
    // 🍅 番茄酱之神：控场系（酱滴围着自身炸开、落地成潭 → 保持中距走位，把怪引到落点那片酱里）
    ketchup: { keep: 0, aggro: 0,   nearRange: 190, nearK: 0.85, bulletK: 1.0,  follow: 250, followW: 0.8,  gemK: 0.62, dangerFloor: 0.95 },
    // 🛡 骑士：近战重剑（挥砍半径 80，keep 略小于它）—— 举盾能吃掉正面伤害 + 冲锋无敌兜底，
    //    比剑士更敢站定（盾就是它的走位）；但出手慢（0.9s + 前摇）→ 站桩输出，不追着怪跑
    knight:  { keep: 70, aggro: 1.3, nearRange: 190, nearK: 0.55, bulletK: 0.8,  follow: 280, followW: 0.7,  gemK: 0.8,  dangerFloor: 1.1 },
    // 🥊 弹簧：近战蓄力拳（拳程 132~178，keep 取中）—— 出拳把怪弹飞就是它的"防御"，
    //    所以 AI 的打法是"贴上去打满蓄力拳"，对贴身怪反而没别人那么敏感（nearK 低）；
    //    钩索留给残血脱身（见 aiSpringHook）
    spring:  { keep: 96, aggro: 1.35, nearRange: 200, nearK: 0.6, bulletK: 0.85, follow: 280, followW: 0.7,  gemK: 0.82, dangerFloor: 1.1 },
  },
  cfgFor(P){
    try { return this.CFG[heroKind(P)] || this.CFG.gunner; } catch(e){ return this.CFG.gunner; }
  },
  // 🪨 投石 AI 专属：空手时朝最近的那块石头走几步（手里有石头就不再贪 —— 专心走位丢石头）
  //    返回一个"拉向石头"的向量（没得捡就返回 0 向量），交给 think/pvpThink 叠加
  aiStonePull(P, w){
    if(!P || !P.isStone || P.stoneHold) return { x:0, y:0 };
    let bs = null, bd = 1e9;
    for(const st of (G.stones || [])){
      if(st.dead) continue;
      const d = Math.hypot(st.x - P.x, st.y - P.y);
      if(d < bd){ bd = d; bs = st; }
    }
    if(!bs || bd > 460 || bd < 1) return { x:0, y:0 };
    return { x: (bs.x - P.x)/bd * w, y: (bs.y - P.y)/bd * w };
  },
  // 威胁与目标评估 → 合成向量（vx,vy 合力方向；danger 危险强度，用于决定是否贪经验）
  think(P){
    if(G.pvp) return this.pvpThink(P); // ⚔️ 对战：场上一个怪都没有，「躲弹幕/避怪/贪经验」整套失效 → 走专门的对人策略
    const cfg = this.cfgFor(P);
    const lowHp = P.hp < P.maxHp * (cfg.fleeAt || 0.32); // 🐣 新手更早收手（fleeAt 0.45）
    const aggro = (cfg.aggro > 0 && !lowHp) ? cfg.aggro : 0;   // 🗡 剑士残血收手：不再主动贴脸
    const nearK = (cfg.aggro > 0 && lowHp) ? 1.3 : cfg.nearK;
    const bulletK = (cfg.bulletK > 1.2 && P.overheated) ? cfg.bulletK * 1.3 : cfg.bulletK; // 🔆 过热中纯保命
    const yielding = aiYielding(P); // ⚖️ 让经验中（这位 AI 累计经验领先真人）：宝石反正拿不到，索性不去追，位置留给走位/输出
    let vx = 0, vy = 0, danger = 0;
    const W = WW(), H = WH();
    // 🗡 剑士的攻击目标（最近的可打怪）：凑到它身上挥砍，而不是躲它
    let atkTarget = null, atkD = 1e9;
    if(aggro > 0){
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet) continue;
        const d = Math.hypot(e.x - P.x, e.y - P.y);
        if(d < atkD){ atkD = d; atkTarget = e; }
      }
    }
    // ① 敌弹：只躲"正在靠近"的（远离的弹幕不用理）
    //    ⚠️关键：弹幕比玩家快（如 420 vs 240），沿"远离弹幕"方向跑会被同向追死 ——
    //    必须是「垂直于弹幕航线的侧向闪避」。用航线垂距判断是否会命中：
    //    会命中 → 垂直侧闪；只是路过 → 轻微避让。
    for(const e of G.enemies){
      if(e.dead || !e.isBullet) continue;
      const dx = P.x - e.x, dy = P.y - e.y;   // r：弹幕 → 我
      const d = Math.hypot(dx, dy);
      if(d > 280 || d < 0.01) continue;
      const sp = Math.hypot(e.vx||0, e.vy||0) || 1;
      const ux = e.vx/sp, uy = e.vy/sp;       // 弹幕飞行单位向量
      const closing = dx*ux + dy*uy;          // >0：弹幕正朝我逼近
      if(closing <= 0){                       // 正在飞离：只给很弱的避让
        const w = (280-d)/280 * 0.22 * bulletK;
        vx += dx/d*w; vy += dy/d*w; danger += w;
        continue;
      }
      const tHit = closing / sp;              // 多少秒后到达航线最近点
      const cross = dx*uy - dy*ux;            // 有符号垂距（正负决定往哪一侧闪）
      const perp = Math.abs(cross);
      if(perp > 34 || tHit > 1.6){            // 航线不会撞到我：轻微避让即可
        const w = (280-d)/280 * 0.5 * bulletK;
        vx += dx/d*w; vy += dy/d*w; danger += w; continue;
      }
      // 航线正对我 → 垂直于弹幕飞行方向侧闪（越正对越急）
      // 法向 n=(uy,-ux)；cross = r·n 是玩家在航线两侧的有符号垂距，往「自己所在一侧」闪
      const side = cross >= 0 ? 1 : -1;
      const w = 2.2 * Math.max(0.45, (34 - perp)/34) * bulletK;
      vx += uy*side*w; vy += (-ux)*side*w;
      vx += dx/d*0.3; vy += dy/d*0.3;         // 叠一点反向分量，避免与弹幕贴行
      danger += w;
    }
    // ② 近身怪：接触伤很痛，一般保持距离（贴身怪越大越躲）；🗡剑士例外——它要凑上去砍
    for(const e of G.enemies){
      if(e.dead || e.isBullet) continue;
      const dx = P.x - e.x, dy = P.y - e.y;
      const d = Math.hypot(dx, dy);
      if(d < 0.01) continue;
      if(e === atkTarget){
        // 🗡 弹簧：远了凑上去（朝怪走）、贴太近退半步，稳定停在挥砍距离里（怪会动，每帧都在修正）
        const err = d - cfg.keep;
        if(Math.abs(err) > 6){
          const w = Math.min(1, Math.abs(err)/70) * (err > 0 ? aggro : 0.9);
          const sgn = err > 0 ? -1 : 1; // dx/dy 是「怪→我」方向：太远取反 = 朝怪走，太近保持 = 退开
          vx += dx/d*w*sgn; vy += dy/d*w*sgn;
        }
        danger += 0.12; // 贴脸必然吃接触伤，记一点危险（但不足以劝退）
        continue;
      }
      const safe = e.r + P.r + 46;
      const R = cfg.nearRange; // 🏹射手 200 / 🔆激光 340（全屏射程下站得更远）
      if(d > R) continue;
      const w = Math.max(0, (R - d)/R) * (d < safe ? 1.3 : 0.8) * nearK;
      vx += dx/d*w; vy += dy/d*w;
      danger += w*0.7;
    }
    // ③ 粘液/岩浆水洼：绕开（踩上去减速+灼烧）；踩在正中心时 d≈0 需要单独给方向
    for(const s of G.slimes){
      const dx = P.x - s.x, dy = P.y - s.y;
      const d = Math.hypot(dx, dy);
      const rr = s.r + 60;
      if(d > rr) continue;
      let nx, ny;
      if(d < 1){ // 正好踩在中心：随机挑一个方向冲出去（否则斥力方向无法定义）
        nx = rand(-1, 1); ny = rand(-1, 1);
        const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      } else { nx = dx/d; ny = dy/d; }
      const w = (1 - d/rr) * 0.8 + 0.6; // 保证有基础推力（正中心也不至于站着不动）
      vx += nx*w; vy += ny*w;
      danger += w*0.5;
    }
    // ④ 跟随队友：太远靠过去（不脱节），贴太近让开半步（不重叠挡枪）
    //    👥 多人：优先跟真人（跟人打才有配合），没人可选时跟另一个 AI；取最近的
    if(multiOn()){
      const mates = G.players.filter(q => q !== P && !q.dead);
      const humans = mates.filter(q => !isAIPlayer(q));
      const pool = humans.length ? humans : mates;
      let mate = null, md = Infinity;
      for(const q of pool){ const dd = Math.hypot(q.x - P.x, q.y - P.y); if(dd < md){ md = dd; mate = q; } }
      if(mate){
        const dx = mate.x - P.x, dy = mate.y - P.y;
        const d = Math.hypot(dx, dy) || 1;
        const F = cfg.follow; // 🗡剑士愿意冲在前头（跟随距离放得更宽）
        if(d > F){ const w = Math.min(1, (d-F)/180) * cfg.followW; vx += dx/d*w; vy += dy/d*w; }
        else if(d < 64){ const w = (64-d)/64 * 0.6; vx -= dx/d*w; vy -= dy/d*w; }
      }
    }
    // ⑤ 捡经验：只在当前够安全时才贪（危险时命要紧；🗡剑士贴脸时危险值天然偏高，门槛放宽）
    //    ⚖️ 让经验中：普通宝石不追（追了也拿不到）；只有"快过期"的才去兜底捡走，免得白丢
    if(danger < cfg.dangerFloor){
      let bg = null, bd = 1e9;
      for(const gm of G.gems){
        if(yielding && !(gm.life <= XP_YIELD_GRACE)) continue;
        const d = Math.hypot(gm.x - P.x, gm.y - P.y);
        if(d < bd){ bd = d; bg = gm; }
      }
      if(bg && bd < 340 && bd > 1){
        const w = 0.6 * cfg.gemK * (1 - bd/340);
        vx += (bg.x - P.x)/bd*w; vy += (bg.y - P.y)/bd*w;
      }
    }
    // ⑤b 🪨 投石 AI：手里没石头就去捡（石头=它的输出，但危险时先保命）—— 只在安全时才绕路
    if(danger < 1.0){
      const sp = this.aiStonePull(P, 0.9);
      vx += sp.x; vy += sp.y;
    }
    // ⑥ 边界回避：贴墙时往场内推（视野扩大后边界随 WW/WH 变化）
    const m = 96;
    if(P.x < m) vx += (m - P.x)/m * 1.2;
    else if(P.x > W - m) vx -= (P.x - (W - m))/m * 1.2;
    if(P.y < m) vy += (m - P.y)/m * 1.2;
    else if(P.y > H - m) vy -= (P.y - (H - m))/m * 1.2;
    return { vx, vy, danger };
  },
  // ⚔️ 对战（1v1）专用思考：把「敌人」换成「对面那个人」，其余照搬 PVE 的合成向量思路
  //   ① 距离控制：近战职业贴上去（keep），远程职业卡 280 的对射带（近了吃近战、远了打不到）
  //   ② 侧向环绕：沿切线绕圈，不站桩当靶子；每 1.8s 换一次环绕方向（防被预判走位）
  //   ③ 躲对面子弹：玩家子弹在 G.bullets（ownerIdx=座位）—— 沿用「垂直航线侧闪」，不是沿远离方向跑
  //   ④ 躲水洼（对手铺的毒/火）+ ⑤ 边界回避
  pvpThink(P){
    const cfg = this.cfgFor(P);
    const W = WW(), H = WH();
    let vx = 0, vy = 0, danger = 0;
    const foe = (G.players || []).find(q => q && q !== P && !q.dead);
    if(foe){
      const dx = foe.x - P.x, dy = foe.y - P.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx/d, uy = dy/d;
      // ① 距离控制：近战（aggro>0）想贴脸；远程想拉开到对射带；近战残血反而先拉开喘口气
      const meleeish = cfg.aggro > 0;
      const lowHp = P.hp < P.maxHp * (cfg.fleeAt || 0.3); // 🐣 新手在对战里也是半血先撤
      const want = meleeish ? (cfg.keep || 70) : 280;
      let err = d - want;
      if(meleeish && lowHp) err = Math.min(err, 0) - 120; // 负值 → 后退（远离对手）
      if(Math.abs(err) > 12){
        const w = Math.min(1, Math.abs(err)/140) * (err > 0 ? 1.0 : 0.85);
        const sgn = err > 0 ? 1 : -1; // err>0：太远 → 朝对手逼近；err<0：太近 → 退开
        vx += ux * w * sgn; vy += uy * w * sgn;
      }
      // ② 侧向环绕：切线方向 = (-uy, ux)；每 1.8s 换向
      const side = (Math.floor(G.time / 1.8) % 2 === 0) ? 1 : -1;
      vx += -uy * 0.6 * side; vy += ux * 0.6 * side;
      danger += 0.5;
    }
    // ③ 躲对手子弹（和躲怪弹幕同一套：只躲"正在逼近"的；航线正对 → 垂直侧闪）
    for(const b of G.bullets){
      if(!b || b.dead || b.ownerIdx === P.seat) continue;
      const dx = P.x - b.x, dy = P.y - b.y;
      const d = Math.hypot(dx, dy);
      if(d > 320 || d < 0.01) continue;
      const sp = Math.hypot(b.vx||0, b.vy||0) || 1;
      const bux = b.vx/sp, buy = b.vy/sp;
      const closing = dx*bux + dy*buy;            // >0：子弹正朝我逼近
      if(closing <= 0){ const w = (320-d)/320 * 0.25; vx += dx/d*w; vy += dy/d*w; danger += w; continue; }
      const tHit = closing / sp;
      const cross = dx*buy - dy*bux;              // 有符号垂距（决定往哪一侧闪）
      const perp = Math.abs(cross);
      if(perp > 30 || tHit > 1.4){ const w = (320-d)/320 * 0.5; vx += dx/d*w; vy += dy/d*w; danger += w; continue; }
      const sgn = cross >= 0 ? 1 : -1;
      const w = 2.2 * Math.max(0.45, (30 - perp)/30);
      vx += buy*sgn*w; vy += (-bux)*sgn*w;
      vx += dx/d*0.3; vy += dy/d*0.3;
      danger += w;
    }
    // ④ 水洼（对手可能铺的毒圈/火海）：绕开
    for(const s of G.slimes){
      const dx = P.x - s.x, dy = P.y - s.y;
      const d = Math.hypot(dx, dy);
      const rr = s.r + 60;
      if(d > rr) continue;
      let nx, ny;
      if(d < 1){ nx = rand(-1,1); ny = rand(-1,1); const l = Math.hypot(nx,ny) || 1; nx /= l; ny /= l; }
      else { nx = dx/d; ny = dy/d; }
      const w = (1 - d/rr) * 0.8 + 0.6;
      vx += nx*w; vy += ny*w;
      danger += w*0.5;
    }
    // ⑤ 边界回避：贴墙时往场内推
    const m = 96;
    if(P.x < m) vx += (m - P.x)/m * 1.2;
    else if(P.x > W - m) vx -= (P.x - (W - m))/m * 1.2;
    if(P.y < m) vy += (m - P.y)/m * 1.2;
    else if(P.y > H - m) vy -= (P.y - (H - m))/m * 1.2;
    return { vx, vy, danger };
  },
  // 输出移动输入（analog 格式：dx/dy 已含速度比例 0~1）
  move(P){    const t = this.think(P);
    let len = Math.hypot(t.vx, t.vy);
    if(len < 0.08) return { dx: 0, dy: 0, analog: true }; // 无威胁也无目标：原地待命
    let dx = t.vx/len, dy = t.vy/len;
    if(this.NOISE){ // 加噪后重新归一化，保持速度上限不变
      dx += rand(-this.NOISE, this.NOISE);
      dy += rand(-this.NOISE, this.NOISE);
      const l2 = Math.hypot(dx, dy) || 1;
      dx /= l2; dy /= l2;
    }
    const th = t.danger > 0.6 ? 1 : 0.78; // 危险时全速跑，安全时略收着走
    return { dx: dx*th, dy: dy*th, analog: true };
  },
  // 瞄准：三个角色都得"锁住打得到的目标"，但优先级不同
  //   🗡 剑士：近处有怪先锁最近的（它要凑上去砍；锁远处 Boss 会一路冲、被挡路的怪白打）
  //   🏹/🔆：Boss / 小怪之怒 优先集火，否则锁最近的
  aim(P){
    if(G.pvp){ // ⚔️ 对战：光标直接锁定对面那个人（场上没有怪可锁，PVE 那套索敌会全程空转）
      const foe = (G.players || []).find(q => q && q !== P && !q.dead);
      if(foe){ const c = cursorOf(P.seat); if(c){ c.x = foe.x; c.y = foe.y; } }
      return;
    }
    const kind = (() => { try { return heroKind(P); } catch(e){ return 'gunner'; } })();
    let boss = null, bossD = 1e9, near = null, nd = 1e9;
    for(const e of G.enemies){
      if(e.dead || e.isBullet) continue;
      const d = Math.hypot(e.x - P.x, e.y - P.y);
      if(e.isBoss || e.isWrath){ if(d < bossD){ bossD = d; boss = e; } continue; }
      if(d < nd){ nd = d; near = e; }
    }
    const t = (kind === 'melee' || kind === 'general') ? ((near && nd < 280) ? near : (near || boss)) : (boss || near);
    if(t){ const c = cursorOf(P.seat); if(c){ c.x = t.x; c.y = t.y; } } // 光标跟着 AI 的座位走（2P/3P 各一个）
  },
};
const AI2P = AI; // 兼容旧名（「与 AI 组队」时期的历史命名，现已是通用 AI 队友模块）

// ===== KEYBINDS（按键设置：1P/2P 每个操作可绑定键盘键或手柄键，gameStore 记忆） =====
// 绑定格式：'k:w' = 键盘 key（e.key 小写），'g:12' = 手柄按钮索引
const KEYBINDS = {
  defs: {
    p1: { up:['k:w','k:arrowup'], down:['k:s','k:arrowdown'], left:['k:a','k:arrowleft'], right:['k:d','k:arrowright'] },
    p2: { curUp:['g:0'], curRight:['g:1'], curDown:['g:2'], curLeft:['g:3'], // 光标方向（普通手柄数字键）
          mvUp:['g:12'], mvRight:['g:15'], mvDown:['g:13'], mvLeft:['g:14'] }, // 移动（标准十字键）
  },
  binds: null, // 运行时绑定（load() 或深拷贝 defs）
  listen: null, // {group, action} 等待用户按键绑定的槽位
  _lp: {}, // 监听期间手柄按键沿缓存
  clone(o){ return JSON.parse(JSON.stringify(o)); },
  load(){
    this.binds = this.clone(this.defs);
    try{
      const o = JSON.parse(gameStore.getItem('wb_keybinds') || 'null');
      if(!o) return;
      for(const g in this.binds){
        if(!o[g]) continue;
        for(const a in this.binds[g]){
          const v = o[g][a];
          if(Array.isArray(v) && v.length && v.every(x => typeof x === 'string' && /^[kg]:/.test(x))) this.binds[g][a] = v;
        }
      }
    }catch(e){}
  },
  save(){ try{ gameStore.setItem('wb_keybinds', JSON.stringify(this.binds)); }catch(e){} },
  reset(){ this.binds = this.clone(this.defs); this.save(); },
  any(list){ // 任一绑定当前处于按下状态（键盘/手柄按键/摇杆方向通用）
    for(const b of list){
      if(b[0] === 'k'){ if(G.keys[b.slice(2)]) return true; }
      else if(b[0] === 'j'){ if(GP.stickDir() === b.slice(2)) return true; } // 摇杆方向绑定
      else {
        const i = +b.slice(2), bts = GP.pad && GP.pad.buttons;
        if(bts && bts[i] && (bts[i].pressed || bts[i].value > 0.5)) return true;
      }
    }
    return false;
  },
  applyBind(code){ // 监听槽位绑定一个输入（'k:w' / 'g:12'）
    if(!this.listen) return;
    this.binds[this.listen.group][this.listen.action] = [code];
    this.listen = null; // 注意：不清 _lp——手柄持续按住时切槽位不会立刻误绑定
    this.save(); renderKeybinds();
  },
  cancelListen(){ this.listen = null; renderKeybinds(); },
  pollGpListen(){ // 主循环调用：监听中扫描所有手柄按键上升沿（点槽位后按手柄键即绑定）
    if(!this.listen) return;
    try{
      const pads = (typeof navigator !== 'undefined' && navigator.getGamepads) ? navigator.getGamepads() : [];
      for(const p of pads){
        if(!p || !p.connected) continue;
        const bs = p.buttons || [];
        for(let i = 0; i < bs.length; i++){
          const pr = bs[i] && (bs[i].pressed || bs[i].value > 0.5);
          const key = p.index + ':' + i;
          const prev = this._lp[key];
          this._lp[key] = pr; // 先记录按键沿再触发，防止绑定后同键立即误绑下一槽位
          if(pr && !prev){ this.applyBind('g:' + i); return; }
        }
        // 左摇杆方向检测：倾斜过死区（0.5）即绑定 'j:方向'
        const ax = p.axes || [], sx = ax[0] || 0, sy = ax[1] || 0;
        let sd = null;
        if(Math.hypot(sx, sy) >= 0.5){
          if(Math.abs(sx) > Math.abs(sy)) sd = sx > 0 ? 'right' : 'left';
          else sd = sy > 0 ? 'down' : 'up';
        }
        const skey = p.index + ':stick', sprev = this._lp[skey];
        this._lp[skey] = sd;
        if(sd && sprev !== sd){ this.applyBind('j:' + sd); return; }
      }
    }catch(e){}
  },
  keyName(b){ // 绑定显示名
    if(b[0] === 'k'){
      const n = b.slice(2);
      return ({ arrowup:'↑', arrowdown:'↓', arrowleft:'←', arrowright:'→', ' ':'空格',
        control:'Ctrl', alt:'Alt', shift:'Shift', enter:'Enter', tab:'Tab', escape:'Esc' })[n] || n.toUpperCase();
    }
    if(b[0] === 'j') return '摇杆' + ({ up:'↑', down:'↓', left:'←', right:'→' })[b.slice(2)];
    return '手柄' + b.slice(2);
  },
  slotName(group, action){ return this.binds[group][action].map(b => this.keyName(b)).join(' / '); },
};
KEYBINDS.load();

// ===== SOUND (Web Audio 合成音效，无外部文件) =====
const SND = {
  ctx:null, master:null, muted:false, vol:0.4,
  init(){ // 必须在用户交互（点击开始）后调用
    if(this.ctx){ if(this.ctx.state==='suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.vol; // 音量（设置面板可调，gameStore 记忆）
    this.master.connect(this.ctx.destination);
  },
  toggle(){ this.muted = !this.muted; if(this.muted) Music.stop(); else if(SND.ctx && Music.on) Music.start(); return this.muted; },
  tone(freq, dur, type, vol, slideTo, delay){
    if(!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + (delay||0);
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo), t0+dur);
    g.gain.setValueAtTime(vol||0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0+dur+0.02);
  },
  noise(dur, vol, freq){
    if(!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const n = Math.max(1, Math.floor(this.ctx.sampleRate*dur));
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1)*(1-i/n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = freq || 1500;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol||0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t0);
  },
  // ---- 具体音效 ----
  shoot(){ this.tone(880, 0.06, 'square', 0.09, 440); },        // 射击（高频短促，音量低防吵）
  hit(){ this.tone(230, 0.05, 'square', 0.10, 110); },           // 子弹命中
  crit(){ this.tone(880, 0.06, 'square', 0.14, 1320); this.noise(0.04, 0.1, 3800); }, // 暴击（短促高音+噪声）
  enemyDie(){ this.tone(520, 0.16, 'sawtooth', 0.13, 90); },     // 小怪死亡（下滑音）
  bossDie(){ this.tone(400, 0.5, 'sawtooth', 0.22, 50); this.noise(0.3, 0.12, 800); }, // Boss死亡（长下滑+噪声）
  gem(){ this.tone(660, 0.08, 'sine', 0.14, 990); },             // 拾取经验宝石（上升音）
  bossGem(){ this.tone(660, 0.09, 'sine', 0.16, 880); this.tone(990, 0.12, 'sine', 0.18, null, 0.07); this.tone(1320, 0.22, 'sine', 0.16, null, 0.14); }, // 拾取Boss宝石（华丽三连上升音）
  shieldBlock(){ // 护盾抵挡/弹开（90ms节流防刷屏）
    const now = performance.now();
    if(now - (this._shieldT||0) < 90) return;
    this._shieldT = now;
    this.tone(480, 0.07, 'square', 0.12, 760); this.noise(0.05, 0.08, 2600);
  },
  levelUp(){ this.tone(523, 0.12, 'square', 0.18); this.tone(784, 0.18, 'square', 0.18, null, 0.1); }, // 升级（两连音）
  hurt(){ this.tone(170, 0.22, 'sawtooth', 0.26, 65); },         // 玩家受伤（低闷音）
  bossWarn(){ this.tone(140, 0.22, 'sawtooth', 0.22, 110); this.tone(110, 0.3, 'sawtooth', 0.22, 80, null, 0.26); }, // Boss登场警报
  warnUp(){ this.tone(520, 0.12, 'square', 0.15, 780); this.tone(780, 0.14, 'square', 0.15, 1040, 0.12); }, // 技能预警（双连上升音，提示玩家躲避）
  magma(){ this.tone(70, 0.5, 'sawtooth', 0.2, 45); this.noise(0.4, 0.12, 400); }, // 岩浆大招（低沉轰鸣+噪声，喷发瞬间播放）
  flame(){ this.tone(200, 0.25, 'sawtooth', 0.15, 80); this.noise(0.25, 0.1, 600); }, // 火焰喷射（呼啸感，喷射瞬间播放）
  boom(){ this.noise(0.25, 0.2, 600); this.tone(120, 0.25, 'sawtooth', 0.18, 40); }, // 爆炸
  charge(){ this.tone(300, 0.28, 'square', 0.14, 520); },        // 冲撞怪蓄力警告（上升音）
  enemyShoot(){ this.tone(210, 0.05, 'square', 0.05, 150); },    // 敌人弹幕（极轻）
  gameOver(){ this.tone(420, 0.5, 'sawtooth', 0.22, 70); this.tone(180, 0.7, 'sawtooth', 0.2, 45, null, 0.32); }, // 失败（长下滑）
  win(){ this.tone(523, 0.15, 'square', 0.2); this.tone(659, 0.15, 'square', 0.2, null, 0.14); this.tone(784, 0.3, 'square', 0.22, null, 0.28); }, // 胜利（上行琶音）
  swordUlt(){ this.tone(1400, 0.5, 'sawtooth', 0.22, 110); this.noise(0.35, 0.2, 3000); }, // 🗡 斩灭：高频破空下斩 + 大片金属噪声
  laserUlt(){ this.tone(1800, 0.45, 'sawtooth', 0.2, 260); this.noise(0.3, 0.16, 4200); },  // 🔆 旋转扫射：高频旋起 + 电流噪声
  summon(){ this.tone(392, 0.12, 'square', 0.16); this.tone(523, 0.12, 'square', 0.16, null, 0.1); this.tone(659, 0.2, 'square', 0.18, null, 0.2); }, // ⚔️ 召唤小兵：上行三连号角
  bloodDash(){ this.tone(320, 0.16, 'sawtooth', 0.16, 900); this.noise(0.14, 0.12, 1800); }, // 🦇 血月突袭：低频猛起 + 一道破空噪声

  // ===== 🎭 角色专属攻击音效（2026-10-08 用户定）=====
  // 每个角色的普攻各有一把「声音名片」，从**武器材质**出发做区分：
  //   🗡剑士=钢铁破空 / 🌀龙卷风=风刃 / 🦇吸血鬼=利爪撕裂 / ⚔️将军=长枪金属 / 🐣新手=木棍闷响 / ⚙️工程师=扳手敲铁
  //   💣爆破=闷弹 / 🧪毒液=黏腻喷吐 / 🔮法师=魔法（火/冰/土三种）/ 🪨投石=掷石风声 / 🔆激光=光束电子音
  //   🏹射手**沿用 shoot()**（用户要求不改）——heroAtk 的 default 分支即它。
  // 一律用 tone()/noise() 现场合成，无外部音频文件；音量压在与既有普攻同一档（0.04~0.13），不盖 BGM。
  atkGate(k, gap){ // 同角色普攻节流（默认 50ms）：防"一帧多响/双管齐响"叠成噪音墙（静音时不消耗时间戳）
    if(!this.ctx || this.muted) return false;
    const t = this._atkT || (this._atkT = {});
    const now = this.ctx.currentTime;
    if(t[k] !== undefined && now - t[k] < (gap || 0.05)) return false;
    t[k] = now;
    return true;
  },
  aSwordsman(){ if(!this.atkGate('melee')) return;      // 🗡 大剑劈砍：一记破空噪声 + 金属尾音（"唰——"）
    this.noise(0.10, 0.13, 5600); this.tone(1180, 0.08, 'sawtooth', 0.09, 380); },
  aLaser(){ if(!this.atkGate('laser', 0.24)) return;    // 🔆 光束电子音：起照"啾"一声，持续照射每 0.24 秒一记
    this.tone(1500, 0.09, 'sine', 0.06, 700); this.noise(0.07, 0.04, 6800); },
  aBomber(){ if(!this.atkGate('bomber')) return;        // 💣 闷弹出膛（"噗"）
    this.tone(340, 0.07, 'square', 0.08, 170); this.noise(0.06, 0.09, 900); },
  aTornado(){ if(!this.atkGate('tornado')) return;      // 🌀 风刃旋切（呼啸）
    this.noise(0.13, 0.11, 2600); this.tone(680, 0.12, 'sine', 0.06, 1500); },
  aVenom(){ if(!this.atkGate('venom')) return;          // 🧪 黏腻喷吐（咕噜）
    this.tone(430, 0.09, 'sine', 0.09, 200); this.noise(0.07, 0.06, 1200); },
  aGeneral(){ if(!this.atkGate('general')) return;      // ⚔️ 长枪横扫（金属锋 + 号角底）
    this.tone(640, 0.10, 'square', 0.10, 300); this.noise(0.08, 0.08, 3600); },
  aVampire(){ if(!this.atkGate('vampire')) return;      // 🦇 利爪撕裂（尖啸 + 撕布噪声）
    this.tone(1450, 0.07, 'sawtooth', 0.09, 900); this.noise(0.07, 0.10, 4200); },
  aRookie(){ if(!this.atkGate('rookie')) return;        // 🐣 木棍抡（干木头闷响，故意不脆）
    this.noise(0.06, 0.10, 1600); this.tone(260, 0.06, 'triangle', 0.07, 150); },
  aEngineer(){ if(!this.atkGate('engineer')) return;    // ⚙️ 扳手敲铁（清脆金属"叮" + 机械噪声）
    this.tone(1900, 0.07, 'square', 0.08, 1200); this.noise(0.05, 0.07, 5200); },
  aMage(kind){                                          // 🔮 魔法施放：火/冰/土各一声
    if(!this.atkGate('mage')) return;
    if(kind === 'frost'){ this.tone(1900, 0.09, 'sine', 0.08, 2900); this.noise(0.06, 0.06, 7000); }        // ❄️ 结晶脆响（上滑）
    else if(kind === 'earth'){ this.tone(180, 0.12, 'triangle', 0.11, 90); this.noise(0.10, 0.10, 700); }  // 🪨 落石闷响
      else { this.noise(0.10, 0.11, 1400); this.tone(520, 0.10, 'sawtooth', 0.08, 1180); }                   // 🔥 爆燃（噪声+上滑）
  },
  mageSwitch(){ if(!this.atkGate('mageSw', 0.04)) return; // 🔮 法术轮盘切换（一声轻脆定向"叮"，与施法声区分开）
    this.tone(880, 0.05, 'triangle', 0.06, 1320); this.tone(1320, 0.04, 'sine', 0.04, 1760, null, 0.04); },
  aStonePoke(){ if(!this.atkGate('stone')) return;      // 🪨 拾取器一戳（短促"笃"）
    this.tone(520, 0.05, 'square', 0.08, 300); this.noise(0.05, 0.06, 2200); },
  aStoneThrow(){ if(!this.atkGate('stoneT', 0.12)) return; // 🪨 掷石出手（低沉"呼"）
    this.noise(0.14, 0.11, 1100); this.tone(300, 0.13, 'sine', 0.07, 160); },
  aTurret(){ if(!this.atkGate('turret', 0.08)) return; // ⚙️ 自动炮台开火（机械"哒——"）
    this.tone(760, 0.05, 'square', 0.07, 380); this.noise(0.05, 0.07, 3200); },
  aBoomerang(){ if(!this.atkGate('boomerang')) return; // 🪃 木镖脱手（"咻"的一记旋风声，木头味不脆不金属）
    this.noise(0.10, 0.10, 2400); this.tone(540, 0.09, 'triangle', 0.06, 1080); },
  aDogmilk(){ if(!this.atkGate('dogmilk')) return; // 🐶 野生狗奶：短促"噗/哞"——木头闷响 + 一点鼻音（奶一下）
    this.tone(380, 0.07, 'triangle', 0.08, 200); this.noise(0.06, 0.10, 1200); },
  dogUlt(){ // 🐶 野生狗奶大招「春秋邻域」：低沉轰鸣（场地放大）+ 厚重噪声（爆炸）
    this.tone(150, 0.7, 'sawtooth', 0.18, 55); this.noise(0.55, 0.2, 280); this.tone(70, 0.8, 'sine', 0.12, 40); },
  aCardmaster(){ if(!this.atkGate('cardmaster', 0.05)) return; // 🃏 卡牌大师：翻牌"咔哒"（短促木质 click）+ 清脆高音（一张牌飞出）
    this.noise(0.04, 0.07, 3200); this.tone(900, 0.05, 'square', 0.05, 1500); },
  cardUlt(){ // 🃏 卡牌大师大招「飞机」：甩牌的凌厉破风 + 拍下的厚重一击（斗地主名场面）
    this.tone(300, 0.18, 'sawtooth', 0.12, 120); this.noise(0.12, 0.14, 2600); this.tone(90, 0.5, 'sine', 0.16, 45); },
  aVehicle(){ if(!this.atkGate('vehicle', 0.10)) return; // 🚜 战车双管（重炮：低频闷 + 金属噪声）
    this.tone(220, 0.10, 'sawtooth', 0.10, 90); this.noise(0.08, 0.12, 1800); },
  aRookieCry(){ if(!this.atkGate('rkCry', 0.30)) return; // 🐣 新手战吼（一声"嗷——"，0 伤害但全队 +50% 伤害）
    this.tone(520, 0.16, 'sawtooth', 0.12, 900); this.tone(760, 0.14, 'sawtooth', 0.10, 380, null, 0.12); },
  aKetchup(){ if(!this.atkGate('ketchup', 0.05)) return; // 🍅 捏爆番茄酱包：塑料膜"啪" + 酱挤出来的闷"噗"
    this.noise(0.05, 0.12, 2600); this.tone(430, 0.10, 'sine', 0.09, 170); this.noise(0.09, 0.07, 700); },
  ketchupEat(){ // 🍅 主动技「吃番茄酱」：响亮的一记"吸溜"（上滑音 + 湿哒哒的噪声）
    this.tone(260, 0.20, 'sine', 0.12, 660); this.noise(0.14, 0.07, 1700); this.tone(660, 0.10, 'triangle', 0.06, 880, null, 0.06); },
  aKnight(){ if(!this.atkGate('knight')) return; // 🛡 骑士重剑落下：沉闷厚猛的"夯"（低频金属 + 重噪声，比剑士更沉更慢）
    this.tone(150, 0.16, 'sawtooth', 0.16, 60); this.noise(0.14, 0.14, 1100); this.tone(900, 0.07, 'square', 0.07, 400); },
  knightWind(){ if(!this.atkGate('knightW', 0.10)) return; // 🛡 起手式（前摇）：剑被举过头顶的"嗡——"剑鸣（提示"这一刀要落了"）
    this.tone(520, 0.22, 'sawtooth', 0.07, 880); },
  knightCharge(){ // 🛡 主动技「勇士冲锋」：号角长鸣（两头上行号角）+ 金属共振（全军进击）
    this.tone(392, 0.5, 'sawtooth', 0.16, 523); this.tone(523, 0.5, 'sawtooth', 0.14, 659, null, 0.18); this.noise(0.3, 0.10, 2400); },
  knightBlock(){ if(!this.atkGate('knightB', 0.06)) return; // 🛡 举盾挡下：盾牌闷响（短促低频 + 金属"叮"）
    this.tone(240, 0.08, 'square', 0.10, 140); this.tone(1500, 0.05, 'sine', 0.06, 900); },
  aBard(){ if(!this.atkGate('bard', 0.05)) return; // 🎻 拨弦：一声清亮的短音（基音 + 泛音）
    this.tone(880, 0.10, 'triangle', 0.05, 1245); this.tone(1320, 0.06, 'sine', 0.035, 1480); },
  bardSong(){ // 🎻 回旋曲起手：三个音上行的琶音（像拉开一段曲子）
    this.tone(523, 0.26, 'triangle', 0.08, 587); this.tone(659, 0.26, 'triangle', 0.07, 740, null, 0.14); this.tone(784, 0.34, 'triangle', 0.07, 988, null, 0.28); },
  bardNote(f, dur, vol, type){ // 🎵 回旋曲引导中的旋律单音（主音 + 一层微弱的八度泛音，像真拨了一根弦）
    if(!this.atkGate('bardMel' + f.toFixed(1), 0.04)) return; // 同频同帧只响一次（低音与旋律同帧不互相吞）
    this.tone(f, dur, type || 'triangle', vol);
    if((type || 'triangle') === 'triangle') this.tone(f*2, dur*0.5, 'sine', vol*0.28); // 泛音只给旋律，低音不加（否则糊）
  },
  bardBreak(){ // 🎻 断弦：一声短促的"嘣"（弦崩噪声）+ 快速滑下去 —— 听得出这一曲被打断了
    this.noise(0.09, 0.10, 2600); this.tone(620, 0.18, 'triangle', 0.07, 165); },
  aSpring(){ // 🥊 弹簧拳出拳：弹簧释放的"嘣——嗡"（低频闷响 + 快速上滑的金属余音）
    if(!this.atkGate('spring', 0.05)) return;
    this.tone(180, 0.14, 'square', 0.13, 90); this.tone(330, 0.22, 'sawtooth', 0.07, 620); },
  springCharge(){ // 🥊 蓄力中：一圈轻微的"上弦"电流声（音量随蓄力档位由调用方控制，见 updateSpring）
    this.tone(520, 0.05, 'sine', 0.02, 700); },
  springWall(){ // 🥊 怪撞墙：闷响（墙体吃上一记重的）+ 金属扭曲尾音
    this.tone(90, 0.22, 'square', 0.16, 45); this.noise(0.12, 0.12, 900); },
  springHook(){ // 🥊 弹簧钩出钩：金属抽拉声（弹簧一节节绷紧的"嚓啷"感）+ 锚定的"铛"
    this.tone(700, 0.16, 'sawtooth', 0.09, 240); this.tone(1200, 0.07, 'square', 0.06, 800, null, 0.10); },
  // 🎭 普攻音效总入口：hero = heroKind(p)（'melee' 即剑士）；kind 仅法师用（'fire'/'frost'/'earth'）
  heroAtk(hero, kind){
    switch(hero){
      case 'melee':    this.aSwordsman(); break;
      case 'laser':    this.aLaser(); break;
      case 'bomber':   this.aBomber(); break;
      case 'tornado':  this.aTornado(); break;
      case 'venom':    this.aVenom(); break;
      case 'general':  this.aGeneral(); break;
      case 'mage':     this.aMage(kind); break;
      case 'vampire':  this.aVampire(); break;
      case 'stone':    this.aStonePoke(); break;
      case 'rookie':   this.aRookie(); break;
      case 'engineer': this.aEngineer(); break;
      case 'boomerang': this.aBoomerang(); break;
      case 'dogmilk': this.aDogmilk(); break; // 🐶 野生狗奶：短促"噗/哞"
      case 'cardmaster': this.aCardmaster(); break; // 🃏 卡牌大师：翻牌"咔哒"+清脆音
      case 'ketchup':  this.aKetchup(); break; // 🍅 番茄酱之神：捏爆酱包的"啪+噗"
      case 'knight':   this.aKnight(); break; // 🛡 骑士：重剑闷"夯"
      case 'bard': this.aBard(); break; // 🎻 吟游诗人：拨弦
      case 'spring': this.aSpring(); break; // 🥊 弹簧：弹簧拳"嘣——"
      default:         this.shoot(); break; // 🏹 射手：原样（用户要求不改）
    }
  },
};
function updateSoundBtn(){
  document.querySelectorAll('.js-sound-btn').forEach(b => b.textContent = SND.muted ? '🔇' : '🔊');
}

// ===== BGM (Web Audio 程序化循环配乐，无外部文件) =====
// 四种曲风：普通波 calm（D小调、120BPM、稀疏推进）/
//   Boss1 暗影领主 boss1（D小调、150BPM、密集鼓点+琶音）/
//   Boss2 熔岩巨兽 boss2（A小调、140BPM、锯齿重低音岩浆感）/
//   Boss3 虚空主宰 boss3（E小调、165BPM、十六分快速琶音极限紧张）
// 16步音序循环：{k}ick鼓 {s}nare军鼓 {h}at踩镲 {b}ass低音 {l}ead旋律
// 可选自定义乐器参数：bt/bd/bv（低音波形/时长/音量）、lt/ld/lv（旋律波形/时长/音量）
const Music = {
  ctx:null, master:null, on:true, playing:false, _gen:0, _bc:null, _id:'', _otherAlive:0,
  mode:'menu', step:0, nextTime:0, stepDur:0, timer:null,
  // 音高表（跨调式：A小调菜单 / D小调 / A小调 / E小调）
  N:{ D3:146.83, Bb2:116.54, F2:87.31, C3:130.81, D5:587.33, F5:698.46, A5:880, C5:523.25, C6:1046.5,
      A2:110, E2:82.41, A4:440, E5:659.26, G4:392, B2:123.47, B4:493.88, Fs5:739.99,
      E4:329.63, A3:220, C4:261.63, F4:349.23, G2:98, B3:246.94, D4:293.66,
      // 🌌 世界2 调式补充：C小调 / C#小调 + 三全音（虚空感、不谐和）
      D2:73.42, Cs2:69.30, Ab2:103.83, Cs3:138.59, Eb3:155.56, E3:164.81, F3:174.61,
      G3:196, Ab3:207.65, Bb3:233.08, Cs4:277.18, Eb4:311.13, Fs4:369.99, Ab4:415.30,
      Bb4:466.16, Cs5:554.37, Eb5:622.25, G5:783.99, Ab5:830.61 },
  // 🌌 世界2「虚空裂隙」专属曲速：菜单 88／普通波 96（失重 + 轻脉冲）／ 三 Boss 138/146/158（越往后越压迫）
  //   ⚠️ 世界1 的 menu/calm/boss1~5 是老曲，**一个音符都不许改**（用户 2026-10-12 明确要求原样保留）
  BPM:{ menu:100, calm:120, boss1:150, boss2:140, boss3:165, boss4:172, boss5:152,
        w2menu:88, w2calm:96, w2boss6:144, w2boss7:146, w2boss8:158, w2boss9:152,
        w3menu:84, w3calm:100, w3boss10:140, w3boss11:148, w3boss12:162, w3boss13:156 },
  // 主界面专属曲（A小调、100BPM、轻柔钢琴琶音，无军鼓）：Am → F → C → G
  MENU:[
    {k:1,b:'A2',bd:0.5,bv:0.20,l:'E4',lv:0.07},{l:'C5',lv:0.06},
    {h:1,l:'E5',lv:0.05},{l:'C5',lv:0.06},
    {k:1,b:'F2',bd:0.5,bv:0.20,l:'A3',lv:0.07},{l:'C4',lv:0.06},
    {h:1,l:'F4',lv:0.05},{l:'C4',lv:0.06},
    {k:1,b:'C3',bd:0.5,bv:0.20,l:'E4',lv:0.07},{l:'G4',lv:0.06},
    {h:1,l:'C5',lv:0.05},{l:'G4',lv:0.06},
    {k:1,b:'G2',bd:0.5,bv:0.20,l:'B3',lv:0.07},{l:'D4',lv:0.06},
    {h:1,l:'G4',lv:0.05},{l:'D4',lv:0.06},
  ],
  CALM:[
    {k:1,h:1,b:'D3'},{h:1},{h:1,b:'D3'},{h:1},
    {k:1,h:1,b:'Bb2'},{h:1},{h:1,b:'Bb2'},{h:1},
    {k:1,h:1,b:'F2',l:'D5'},{h:1},{h:1,b:'F2'},{h:1},
    {k:1,h:1,b:'C3',l:'C5'},{h:1},{h:1,b:'C3'},{h:1},
  ],
  BOSS1:[
    {k:1,h:1,b:'D3',l:'D5'},{h:1,b:'D3'},{k:1,h:1,b:'D3',l:'F5'},{h:1,b:'D3'},
    {k:1,s:1,h:1,b:'Bb2',l:'A5'},{h:1,b:'Bb2'},{k:1,h:1,b:'Bb2',l:'F5'},{h:1,b:'Bb2'},
    {k:1,h:1,b:'F2',l:'F5'},{h:1,b:'F2'},{k:1,h:1,b:'F2',l:'A5'},{h:1,b:'F2'},
    {k:1,s:1,h:1,b:'C3',l:'C6'},{h:1,b:'C3'},{k:1,h:1,b:'C3',l:'A5'},{h:1,b:'C3'},
  ],
  BOSS2:[
    {k:1,h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20,l:'A4',lv:0.09},{h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20},{k:1,h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20,l:'C5',lv:0.09},{h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'F2',bd:0.20,bt:'sawtooth',bv:0.20,l:'E5',lv:0.09},{h:1,b:'F2',bd:0.20,bt:'sawtooth',bv:0.20},{k:1,h:1,b:'F2',bd:0.20,bt:'sawtooth',bv:0.20,l:'D5',lv:0.09},{h:1,b:'F2',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20,l:'C5',lv:0.09},{h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20},{k:1,h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20,l:'E5',lv:0.09},{h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'E2',bd:0.20,bt:'sawtooth',bv:0.20,l:'A4',lv:0.09},{h:1,b:'E2',bd:0.20,bt:'sawtooth',bv:0.20},{k:1,h:1,b:'E2',bd:0.20,bt:'sawtooth',bv:0.20,l:'G4',lv:0.09},{h:1,b:'E2',bd:0.20,bt:'sawtooth',bv:0.20},
  ],
  BOSS3:[
    {k:1,h:1,b:'E2',l:'E5',lv:0.06},{l:'B4',lv:0.06},{h:1,b:'E2',l:'G4',lv:0.06},{l:'B4',lv:0.06},
    {k:1,s:1,h:1,b:'C3',l:'C5',lv:0.06},{l:'G4',lv:0.06},{h:1,b:'C3',l:'C5',lv:0.06},{l:'G4',lv:0.06},
    {k:1,h:1,b:'A2',l:'A4',lv:0.06},{l:'E5',lv:0.06},{h:1,b:'A2',l:'A4',lv:0.06},{l:'E5',lv:0.06},
    {k:1,s:1,h:1,b:'B2',l:'B4',lv:0.06},{l:'Fs5',lv:0.06},{h:1,b:'B2',l:'B4',lv:0.06},{l:'Fs5',lv:0.06},
  ],
  // 🔷 Boss4 棱光穹主（B小调、172BPM、十六分高速琶音：冰蓝光束的电子感）
  BOSS4:[
    {k:1,h:1,b:'B2',l:'B4',lv:0.06},{l:'D5',lv:0.06},{h:1,b:'B2',l:'Fs5',lv:0.06},{l:'D5',lv:0.06},
    {k:1,s:1,h:1,b:'G2',l:'A5',lv:0.06},{l:'Fs5',lv:0.06},{h:1,b:'G2',l:'D5',lv:0.06},{l:'B4',lv:0.06},
    {k:1,h:1,b:'A2',l:'A4',lv:0.06},{l:'C5',lv:0.06},{h:1,b:'A2',l:'E5',lv:0.06},{l:'C5',lv:0.06},
    {k:1,s:1,h:1,b:'F2',l:'A5',lv:0.06},{l:'E5',lv:0.06},{h:1,b:'F2',l:'C5',lv:0.06},{l:'A4',lv:0.06},
  ],
  // ⚔ Boss5 斩铁剑皇（D小调、152BPM、重低音心跳 + 号角式高音：钢铁与战场的厚重感）
  BOSS5:[
    {k:1,h:1,b:'D3',bd:0.22,bv:0.22,l:'D5',lv:0.07},{h:1,b:'D3',bd:0.22,bv:0.22},{k:1,h:1,b:'D3',l:'F5',lv:0.07},{h:1,b:'D3',bd:0.22,bv:0.22},
    {k:1,s:1,h:1,b:'Bb2',bd:0.22,bv:0.22,l:'A5',lv:0.07},{h:1,b:'Bb2'},{k:1,h:1,b:'Bb2',l:'F5',lv:0.07},{h:1,b:'Bb2'},
    {k:1,h:1,b:'F2',bd:0.22,bv:0.22,l:'C5',lv:0.07},{h:1,b:'F2'},{k:1,h:1,b:'F2',l:'A5',lv:0.07},{h:1,b:'F2',bd:0.22,bv:0.22},
    {k:1,s:1,h:1,b:'A2',bd:0.22,bv:0.22,l:'D5',lv:0.07},{h:1,b:'A2'},{k:1,h:1,b:'A2',l:'E5',lv:0.07},{h:1,b:'A2'},
  ],
  // ===== 🌌 世界2「虚空裂隙」专属曲（与世界1 曲库完全隔离，零共用）=====
  // 🌌 世界2 主界面曲（C小调、88BPM）：空灵 pad 铺底 + **一条能哼出来的主旋律**（用户嫌旧版"只有长音在漂"太难听）
  //   旋律走向：i(Cm) → VI(Ab) → III(Eb) → VII(Bb)，动机是「上行跳进 + 下行收尾」，两句对称、能跟着哼
  //   ⚠️ 与 W2_CALM 的区分口径不变：主界面=无鼓无踩镲、有旋律线；战斗普通波=有轻脉冲+踩镲、高音是点状不是旋律
  W2_MENU:[
    {p:'C3',pd:1.0,pv:0.11,l:'G4',ld:0.50,lt:'triangle',lv:0.070},
    {l:'Bb4',ld:0.50,lt:'triangle',lv:0.065},
    {l:'C5',ld:0.60,lt:'triangle',lv:0.075},
    {l:'Bb4',ld:0.50,lt:'triangle',lv:0.065},
    {p:'Ab2',pd:1.0,pv:0.11,l:'Ab4',ld:0.50,lt:'triangle',lv:0.070},
    {l:'G4',ld:0.50,lt:'triangle',lv:0.065},
    {l:'Eb4',ld:0.70,lt:'triangle',lv:0.070},
    {},                                          // 句尾留白：让旋律换气
    {p:'Eb3',pd:1.0,pv:0.11,l:'F4',ld:0.50,lt:'triangle',lv:0.065},
    {l:'G4',ld:0.50,lt:'triangle',lv:0.070},
    {l:'Bb4',ld:0.60,lt:'triangle',lv:0.075},
    {l:'G4',ld:0.50,lt:'triangle',lv:0.065},
    {p:'Bb2',pd:1.0,pv:0.11,l:'Eb4',ld:0.50,lt:'triangle',lv:0.070},
    {l:'D4',ld:0.50,lt:'triangle',lv:0.065},
    {l:'C4',ld:0.80,lt:'triangle',lv:0.070},
    {},
  ],
  // 普通波（C小调、96BPM、失重漂浮）：空灵长音 pad 打底 + 极轻脉冲 + 稀疏星尘高音，无军鼓
  W2_CALM:[
    {k:1,kv:0.22,p:'C3',pd:0.7,pv:0.13},
    {},
    {h:1,l:'G4',ld:0.5,lt:'triangle',lv:0.05},
    {},
    {p:'Ab2',pd:0.7,pv:0.13},
    {},
    {l:'Eb4',ld:0.5,lt:'triangle',lv:0.05},
    {h:1},
    {k:1,kv:0.22,p:'Bb2',pd:0.7,pv:0.13},
    {},
    {h:1,l:'F4',ld:0.5,lt:'triangle',lv:0.05},
    {},
    {p:'G2',pd:0.7,pv:0.13},
    {h:1},
    {l:'D4',ld:0.5,lt:'triangle',lv:0.05},
    {},
  ],
  // 棱光八角（C小调、144BPM、棱镜驱动）：借鉴「裂光十字」的胜因——锯齿号角长音 + 反拍军鼓 + 稳定底鼓，
  //   但保留 C 小调的冷冽青蓝底色（区别于 7 的 C#小调），八步和弦 i–VI–III–VII 循环更密更亮
  W2_BOSS6:[
    {k:1,h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20,l:'Eb4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,s:1,h:1,b:'C3',bd:0.20,bt:'sawtooth',bv:0.20,l:'G4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,h:1,b:'Ab2',bd:0.20,bt:'sawtooth',bv:0.20,l:'C4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,s:1,h:1,b:'Ab2',bd:0.20,bt:'sawtooth',bv:0.20,l:'Eb4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,h:1,b:'Bb2',bd:0.20,bt:'sawtooth',bv:0.20,l:'D4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,s:1,h:1,b:'Bb2',bd:0.20,bt:'sawtooth',bv:0.20,l:'F4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,h:1,b:'Eb3',bd:0.20,bt:'sawtooth',bv:0.20,l:'G4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
    {k:1,s:1,h:1,b:'Eb3',bd:0.20,bt:'sawtooth',bv:0.20,l:'Bb4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1},
  ],
  // 裂光十字（C#小调、146BPM、庄严审判）：锯齿号角长音 + 军鼓重拍，金色十字的威压感
  W2_BOSS7:[
    {k:1,h:1,b:'Cs3',bd:0.20,bt:'sawtooth',bv:0.20,l:'Cs4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs3',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'Cs3',bd:0.20,bt:'sawtooth',bv:0.20,l:'Ab4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs3',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20,l:'Cs4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20,l:'E4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'A2',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,h:1,b:'E3',bd:0.20,bt:'sawtooth',bv:0.20,l:'Ab4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'E3',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'E3',bd:0.20,bt:'sawtooth',bv:0.20,l:'B4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'E3',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.20,l:'D4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.20,l:'Fs4',ld:0.34,lt:'sawtooth',lv:0.075},
    {h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.20},
  ],
  // 虚空裂界者（D小调、158BPM、最终压迫）：保留极低音心跳 + 三全音不谐和高音的终局张力，
  //   借鉴「裂光十字」给主旋律加长音钩子（ld），让最终 Boss 不止是噪音压迫、还有能记住的动机
  W2_BOSS8:[
    {k:1,h:1,b:'D2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Fs4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'C5',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,s:1,h:1,b:'D2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Fs4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'A4',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,h:1,b:'Cs2',bd:0.26,bt:'sawtooth',bv:0.26,l:'G4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'Eb5',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,s:1,h:1,b:'Cs2',bd:0.26,bt:'sawtooth',bv:0.26,l:'G4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'Ab5',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,h:1,b:'Bb2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Fs4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'Bb4',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,s:1,h:1,b:'Bb2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Fs4',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'C5',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,h:1,b:'A2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Eb5',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'Ab4',ld:0.32,lt:'triangle',lv:0.085},
    {k:1,s:1,h:1,b:'A2',bd:0.26,bt:'sawtooth',bv:0.26,l:'Eb5',ld:0.32,lt:'triangle',lv:0.085},{h:1,l:'A4',ld:0.32,lt:'triangle',lv:0.085},
  ],
  // 碎撞巨像（C#小调、152BPM、沉重碾压）：锯齿贝斯 + 反拍军鼓 + 低音心跳，强调"碾压突进"的压迫鼓点（与 7/8 同族、更闷更重）
  //   ⚠️ 只用音高表内已有的世界2 音名（Cs2/D2/Ab2 低音贝斯 + Cs4/Ab3/Eb4/G3/Bb4/Fs4/Eb3 高音），不引入新音名
  W2_BOSS9:[
    {k:1,h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Cs4',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,s:1,h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Ab3',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,h:1,b:'D2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Cs4',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'D2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,s:1,h:1,b:'D2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Eb4',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'D2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,h:1,b:'Ab2',bd:0.24,bt:'sawtooth',bv:0.28,l:'G3',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Ab2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,s:1,h:1,b:'Ab2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Bb4',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Ab2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Fs4',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28},
    {k:1,s:1,h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28,l:'Eb3',ld:0.32,lt:'sawtooth',lv:0.075},
    {h:1,b:'Cs2',bd:0.24,bt:'sawtooth',bv:0.28},
  ],
  // ===== 🌿 世界3「蚀根林海」专属曲（与世界1/世界2 曲库完全隔离，零共用）=====
  // 2026-10-24 晚重写：旧版六首全是「D 自然小调 + 世界2 同款配方」（pad+锯齿号角+反拍军鼓），
  //   用户实机听后反馈"一股世界2味"。现在整套换语汇，从三个维度拉开区分：
  //   ① 调式避开世界2 的自然小调主场：D 弗里吉亚（D Eb F G A Bb C，b2 阴冷异域，bII 和弦是身份证）
  //      / D 多利亚（D E F G A B C，自然6音 B 古朴）/ D 和声小调（D E F G A Bb C#，升7导音戏剧张力）
  //   ② 配器换口味：世界2 = 空灵 triangle + 锯齿号角；世界3 = **木管方波 square**（腐木/空腔感）
  //   ③ 节奏换骨架：世界2 = 四平八稳 4×4 反拍；世界3 = 切分/不规则鼓点 + 长线条旋律（不是点状星尘）
  // 🌿 世界3 主界面曲（D弗里吉亚、84BPM、藤蔓垂落）：pad 铺底 + 方波木管主旋律
  //   两句对称：A 句下行 A4→G4→F4→Eb4（落到 b2 阴冷点）；B 句上行 D4→F4→A4→Bb4→A4 长音收尾
  //   和声 i(Dm)–bII(Ebm)–i(Dm)–bVII(C)–bVI(Bb)：bII 是弗里吉亚的身份证，世界2 没有这个味道
  W3_MENU:[
    {p:'D3',pd:1.2,pv:0.11,b:'D2',bd:0.5,bt:'triangle',bv:0.12,l:'A4',ld:0.55,lt:'square',lv:0.070},
    {},
    {},
    {l:'G4',ld:0.45,lt:'square',lv:0.065},
    {p:'Eb3',pd:1.2,pv:0.11},
    {},
    {l:'F4',ld:0.55,lt:'square',lv:0.070},
    {l:'Eb4',ld:0.45,lt:'square',lv:0.065},
    {p:'D3',pd:1.2,pv:0.11,b:'D2',bd:0.5,bt:'triangle',bv:0.12,l:'D4',ld:0.50,lt:'square',lv:0.070},
    {},
    {l:'F4',ld:0.45,lt:'square',lv:0.065},
    {p:'C3',pd:1.2,pv:0.11,b:'C3',bd:0.5,bt:'triangle',bv:0.12},
    {l:'A4',ld:0.50,lt:'square',lv:0.070},
    {},
    {p:'Bb2',pd:1.2,pv:0.11,b:'Bb2',bd:0.5,bt:'triangle',bv:0.12,l:'Bb4',ld:0.45,lt:'square',lv:0.065},
    {l:'A4',ld:0.75,lt:'square',lv:0.075},
  ],
  // 普通波（D弗里吉亚、100BPM、腐林游荡）：不规则脉搏（底鼓只踩 0/8 两步）+ 奇拍踩镲
  //   + 方波行走低音 D–Eb–F（弗里吉亚上行，一步比一步阴）+ 短句方波高音；无军鼓（保持 calm 口径）
  W3_CALM:[
    {k:1,kv:0.22,p:'D3',pd:0.7,pv:0.13,b:'D2',bd:0.30,bt:'square',bv:0.16},
    {h:1},
    {b:'Eb3',bd:0.30,bt:'square',bv:0.16,l:'F4',ld:0.4,lt:'square',lv:0.050},
    {},
    {p:'Eb3',pd:0.7,pv:0.13},
    {h:1},
    {b:'F3',bd:0.30,bt:'square',bv:0.16,l:'Eb4',ld:0.4,lt:'square',lv:0.055},
    {},
    {k:1,kv:0.22,p:'D3',pd:0.7,pv:0.13,b:'D2',bd:0.30,bt:'square',bv:0.16},
    {h:1},
    {b:'C3',bd:0.30,bt:'square',bv:0.16,l:'D4',ld:0.5,lt:'square',lv:0.050},
    {},
    {p:'Bb2',pd:0.7,pv:0.13},
    {h:1},
    {b:'Bb2',bd:0.30,bt:'square',bv:0.16,l:'A4',ld:0.4,lt:'square',lv:0.050},
    {},
  ],
  // 万藤母巢（D弗里吉亚、140BPM、菌丝蠕动）：**切分鼓点**（底鼓 0/3/8/11、军鼓 6/14）一反世界2 的
  //   四平八稳反拍；方波固定低音 D–Eb 对位（b2 摩擦=母巢的"不干净"）；triangle 短促答句
  W3_BOSS10:[
    {k:1,h:1,b:'D2',bd:0.22,bt:'square',bv:0.22,l:'D4',ld:0.20,lt:'triangle',lv:0.070},
    {h:1},
    {h:1,b:'Eb3',bd:0.22,bt:'square',bv:0.22},
    {k:1,h:1},
    {k:1,h:1,b:'Eb3',bd:0.22,bt:'square',bv:0.22,l:'Eb4',ld:0.20,lt:'triangle',lv:0.070},
    {h:1},
    {s:1,h:1,b:'D2',bd:0.22,bt:'square',bv:0.22},
    {h:1},
    {k:1,h:1,b:'D2',bd:0.22,bt:'square',bv:0.22,l:'F4',ld:0.20,lt:'triangle',lv:0.070},
    {h:1},
    {h:1,b:'Eb3',bd:0.22,bt:'square',bv:0.22},
    {k:1,h:1},
    {k:1,h:1,b:'C3',bd:0.22,bt:'square',bv:0.22,l:'Eb4',ld:0.20,lt:'triangle',lv:0.070},
    {h:1},
    {s:1,h:1,b:'Bb2',bd:0.22,bt:'square',bv:0.22},
    {h:1,b:'A2',bd:0.22,bt:'square',bv:0.22,l:'D4',ld:0.30,lt:'triangle',lv:0.075},
  ],
  // 蚀光古树（D多利亚、148BPM、年轮行进）：重踏四拍底鼓 + 反拍军鼓（古树缓慢而不可阻挡）
  //   + 锯齿长音贝斯踏板 + 号角答句；**自然6音 B**（多利亚身份证，世界2 全场没有）点在 10/14 两步
  W3_BOSS11:[
    {k:1,h:1,b:'D2',bd:0.40,bt:'sawtooth',bv:0.22,l:'D4',ld:0.36,lt:'sawtooth',lv:0.075},
    {h:1},
    {h:1,l:'F4',ld:0.30,lt:'sawtooth',lv:0.070},
    {h:1},
    {k:1,s:1,h:1,b:'G2',bd:0.40,bt:'sawtooth',bv:0.22},
    {h:1},
    {h:1,b:'G2',bd:0.20,bt:'sawtooth',bv:0.18,l:'G4',ld:0.30,lt:'sawtooth',lv:0.070},
    {h:1},
    {k:1,h:1,b:'A2',bd:0.40,bt:'sawtooth',bv:0.22,l:'A4',ld:0.36,lt:'sawtooth',lv:0.075},
    {h:1},
    {h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.18,l:'B4',ld:0.30,lt:'sawtooth',lv:0.070},
    {h:1},
    {k:1,s:1,h:1,b:'D2',bd:0.40,bt:'sawtooth',bv:0.22,l:'A4',ld:0.36,lt:'sawtooth',lv:0.075},
    {h:1},
    {h:1,b:'B2',bd:0.20,bt:'sawtooth',bv:0.18,l:'G4',ld:0.30,lt:'sawtooth',lv:0.070},
    {h:1},
  ],
  // 蚀根龙王（D和声小调、162BPM、终局戏剧）：驱动鼓点 + 低音锯齿贝斯；**V 级(A) + 升7导音 C#** 是
  //   和声小调的身份证（世界2 最终Boss 靠三全音摩擦，龙王靠 C#→D 的导音解决）；钩子 A–Bb / Bb–C–D / C#–E / A–G–F–E
  W3_BOSS12:[
    {k:1,h:1,b:'D2',bd:0.30,bt:'sawtooth',bv:0.24,l:'A4',ld:0.30,lt:'triangle',lv:0.085},
    {h:1,l:'Bb4',ld:0.30,lt:'triangle',lv:0.080},
    {h:1},
    {k:1,h:1,b:'D2',bd:0.16,bt:'sawtooth',bv:0.20},
    {k:1,s:1,h:1,b:'G2',bd:0.30,bt:'sawtooth',bv:0.24,l:'Bb4',ld:0.30,lt:'triangle',lv:0.085},
    {h:1,l:'C5',ld:0.30,lt:'triangle',lv:0.080},
    {k:1,h:1,b:'G2',bd:0.16,bt:'sawtooth',bv:0.20,l:'D5',ld:0.30,lt:'triangle',lv:0.085},
    {h:1},
    {k:1,h:1,b:'A2',bd:0.30,bt:'sawtooth',bv:0.24,l:'Cs5',ld:0.30,lt:'triangle',lv:0.090},
    {h:1},
    {k:1,h:1,b:'Cs3',bd:0.16,bt:'sawtooth',bv:0.20,l:'E4',ld:0.26,lt:'triangle',lv:0.080},
    {h:1},
    {k:1,s:1,h:1,b:'D2',bd:0.30,bt:'sawtooth',bv:0.24,l:'A4',ld:0.30,lt:'triangle',lv:0.085},
    {h:1,l:'G4',ld:0.26,lt:'triangle',lv:0.080},
    {k:1,h:1,b:'D2',bd:0.16,bt:'sawtooth',bv:0.20,l:'F4',ld:0.26,lt:'triangle',lv:0.080},
    {h:1,l:'E4',ld:0.40,lt:'triangle',lv:0.075},
  ],
  // 万秽之源（D弗里吉亚、156BPM、污染源）：**D+Eb 小二度摩擦**（贝斯 D2 贴高音 Eb4，怎么听都不干净）
  //   + 不规则底鼓（0/5/8/13）+ 每拍踩镲 + 低音 pad 污雾（世界2 的 9 号没有 pad 层，这是新增脏度）
  W3_BOSS13:[
    {k:1,h:1,p:'D3',pd:0.9,pv:0.10,b:'D2',bd:0.22,bt:'sawtooth',bv:0.26,l:'Eb4',ld:0.22,lt:'square',lv:0.070},
    {h:1,b:'Eb3',bd:0.22,bt:'sawtooth',bv:0.24,l:'D4',ld:0.22,lt:'square',lv:0.070},
    {h:1},
    {s:1,h:1,b:'D2',bd:0.22,bt:'sawtooth',bv:0.26},
    {h:1,b:'Eb3',bd:0.22,bt:'sawtooth',bv:0.24,l:'Eb4',ld:0.22,lt:'square',lv:0.070},
    {k:1,h:1,b:'D2',bd:0.22,bt:'sawtooth',bv:0.26,l:'D4',ld:0.22,lt:'square',lv:0.070},
    {h:1},
    {h:1,b:'Eb3',bd:0.22,bt:'sawtooth',bv:0.24},
    {k:1,h:1,p:'Bb2',pd:0.9,pv:0.10,b:'Bb2',bd:0.22,bt:'sawtooth',bv:0.26,l:'F4',ld:0.22,lt:'square',lv:0.070},
    {h:1,b:'A2',bd:0.22,bt:'sawtooth',bv:0.24,l:'Eb4',ld:0.22,lt:'square',lv:0.070},
    {h:1},
    {s:1,h:1,b:'Bb2',bd:0.22,bt:'sawtooth',bv:0.26,l:'D4',ld:0.22,lt:'square',lv:0.070},
    {h:1,b:'A2',bd:0.22,bt:'sawtooth',bv:0.24},
    {k:1,h:1,b:'G2',bd:0.22,bt:'sawtooth',bv:0.26,l:'Eb4',ld:0.22,lt:'square',lv:0.070},
    {h:1,b:'F2',bd:0.22,bt:'sawtooth',bv:0.24},
    {h:1,l:'D4',ld:0.35,lt:'square',lv:0.075},
  ],
  start(){
    if(!SND.ctx || !this.on) return;
    if(this.playing) this.stop(); // 幂等：先彻底清掉旧层，保证任何调用顺序下都只有一层 BGM
    // 跨标签互斥：多个页面实例同时开着时，只让一个实例播 BGM（否则每个预览页各放一份=叠加）
    if(!this._bgmOwn()) return;
    this.ctx = SND.ctx;
    const gen = ++this._gen; // 代际号：schedule 回调只认自己这代
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5; // BGM 独立增益，压低不盖音效
    this.master.connect(SND.master);
    this.playing = true;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.stepDur = 60 / this.BPM[this.mode] / 4;
    this._startBeat(); // 心跳：告诉其他页面"我在播"
    this.timer = setInterval(() => {
      if(gen !== this._gen) return; // 旧代际的定时器：静默失效
      this.schedule();
    }, 30);
  },
  stop(){
    this.playing = false;
    this._gen++; // 所有旧定时器立即失效
    this._stopBeat(); // 停止持有者心跳
    clearInterval(this.timer); this.timer = null;
    if(this.master){ try{ this.master.disconnect(); }catch(e){} this.master = null; }
  },
  // 跨标签 BGM 互斥：持有者播放期间每秒广播心跳；发现别人的心跳则立即让位
  _bgmOwn(){
    if(typeof BroadcastChannel === 'undefined') return true; // 沙盒/老浏览器：跳过
    if(!this._bc){
      try{
        this._bc = new BroadcastChannel('wb-bgm-mutex');
        this._id = Math.random().toString(36).slice(2);
        this._otherAlive = 0;
        this._bc.onmessage = (ev) => {
          if(ev && ev.data && ev.data !== this._id){
            this._otherAlive = Date.now();
            if(this.playing) this.stop(); // 别的页面也在播：本页立即让位（后到者优先）
          }
        };
      }catch(e){ return true; }
    }
    if(Date.now() - this._otherAlive > 3500){
      try{ this._bc.postMessage(this._id); }catch(e){}
      return true;
    }
    return false; // 别的标签页正持有 BGM（3.5s 内有心跳）：本页静默
  },
  _startBeat(){ // 播放期间每秒广播心跳，让其他页面知道"有人持有"
    this._stopBeat();
    if(typeof BroadcastChannel === 'undefined' || !this._bc) return;
    this._beat = setInterval(() => { try{ if(this._bc) this._bc.postMessage(this._id); }catch(e){} }, 1000);
  },
  _stopBeat(){ if(this._beat){ clearInterval(this._beat); this._beat = null; } },
  setMode(m){
    if(this.mode === m) return;
    this.mode = m;
    if(this.playing && this.ctx){
      this.step = 0; // 换曲从第1步开始
      this.nextTime = this.ctx.currentTime + 0.05;
      this.stepDur = 60 / this.BPM[m] / 4;
    }
  },
  toggle(){ this.on = !this.on; if(!this.on) this.stop(); else if(SND.ctx){ if(SND.ctx.state==='suspended') SND.ctx.resume(); this.start(); } return this.on; },
  // 🌌 战斗曲切换唯一入口：世界2/世界3 走全新曲库（w2* / w3*），世界1 完全维持原曲
  setBattleMode(world, bossNum){
    if(world === 2){
      this.setMode((bossNum >= 6 && bossNum <= 9) ? ('w2boss' + bossNum) : 'w2calm');
    } else if(world === 3){
      this.setMode((bossNum >= 10 && bossNum <= 13) ? ('w3boss' + bossNum) : 'w3calm');
    } else {
      this.setMode(bossNum ? ('boss' + bossNum) : 'calm');
    }
  },
  schedule(){ // 提前调度未来 0.12s 内的音符（lookahead）
    if(!this.playing || this.ctx.state !== 'running') return;
    let seq;
    if(this.mode === 'menu') seq = this.MENU;
    else if(this.mode === 'calm') seq = this.CALM;
    else if(this.mode === 'w2menu') seq = this.W2_MENU;                       // 🌌 世界2 主界面
    else if(this.mode === 'w2calm') seq = this.W2_CALM;                       // 🌌 世界2 普通波
    else if(this.mode.slice(0,6) === 'w2boss') seq = this['W2_BOSS' + this.mode.slice(6)]; // 🌌 世界2 三 Boss
    else if(this.mode === 'w3menu') seq = this.W3_MENU;                       // 🌿 世界3 主界面
    else if(this.mode === 'w3calm') seq = this.W3_CALM;                       // 🌿 世界3 普通波
    else if(this.mode.slice(0,6) === 'w3boss') seq = this['W3_BOSS' + this.mode.slice(6)]; // 🌿 世界3 四 Boss
    else seq = this['BOSS' + this.mode.slice(4)];
    if(!seq) return; // 🛡 曲目缺失（如未知 boss 编号）时静默跳过，别每 30ms 抛错
    while(this.nextTime < this.ctx.currentTime + 0.12){
      const s = seq[this.step];
      this.playStep(s, this.nextTime);
      this.nextTime += this.stepDur;
      this.step = (this.step+1) % 16;
    }
  },
  playStep(s, t0){
    if(!s) return;
    if(s.k) this.kick(t0, s.kv);
    if(s.s) this.snare(t0);
    if(s.h) this.hat(t0);
    if(s.b) this.note(this.N[s.b], t0, s.bd||0.11, s.bt||'triangle', s.bv||0.30);
    if(s.l) this.note(this.N[s.l], t0, s.ld||0.22, s.lt||'square', s.lv||0.07);
    if(s.p) this.pad(this.N[s.p], t0, s.pd||0.8, s.pv||0.12); // 🌌 世界2 空灵长音层
  },
  pad(freq, t0, dur, vol){ // 🌌 空灵长音：双振荡微失谐 + 低通 + 缓入缓出（世界2 的"虚空"底噪）
    if(!freq) return;
    const g = this.ctx.createGain();
    const f = this.ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + dur*0.25);
    g.gain.setValueAtTime(vol, t0 + dur*0.55);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    f.connect(g); g.connect(this.master);
    for(const det of [-7, 7]){
      const o = this.ctx.createOscillator();
      o.type='sine'; o.frequency.value = freq; o.detune.value = det;
      o.connect(f); o.start(t0); o.stop(t0 + dur + 0.05);
    }
  },
  note(freq, t0, dur, type, vol){
    if(!freq) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0+dur+0.02);
  },
  kick(t0, vol){ // 底鼓：160→45Hz 下坠（vol 可覆盖，世界2 用更轻的脉冲）
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(160, t0);
    o.frequency.exponentialRampToValueAtTime(45, t0+0.12);
    g.gain.setValueAtTime(vol || 0.5, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+0.13);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0+0.15);
  },
  snare(t0){ // 军鼓：带通噪声
    const n = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate*0.1), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*(1-i/d.length);
    n.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1900; f.Q.value=0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.25, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+0.1);
    n.connect(f); f.connect(g); g.connect(this.master);
    n.start(t0);
  },
  hat(t0){ // 踩镲：高频短噪声
    const n = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate*0.05), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*(1-i/d.length);
    n.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=6500;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0+0.04);
    n.connect(f); f.connect(g); g.connect(this.master);
    n.start(t0);
  },
};
function updateMusicBtn(){
  document.querySelectorAll('.js-music-btn').forEach(b => { b.textContent = '🎵'; b.style.opacity = Music.on ? 1 : 0.35; });
}

// ===== PLAYER =====
class Player {
  constructor(x,y,seat){
    this.x=x; this.y=y; this.r=14;
    // 🪑 座位号：0=1P（键鼠）/ 1=2P（手柄）/ 2=3P（三人模式的第三人，由 AI 接管）
    //    兼容旧调用：传 true 视为 2P(1)、false/undefined 视为 1P(0)
    this.seat = (seat === true) ? 1 : ((seat === false || seat === undefined || seat === null) ? 0 : (seat | 0));
    this.isP2 = this.seat > 0; // 兼容旧读法：非 1P 即"手柄侧"（用光标瞄准而非鼠标、屏幕外观是橙色系）
    this.isP3 = this.seat === 2; // 🪑 3P：三人模式的第三人
    this.hp=100; this.maxHp=100;
    // 🌌 世界2 资源系统（仅世界2 + 指定英雄生效；世界1 完全不用，零影响）
    this.resType = null;   // 'mana'（魔法师/吸血鬼）| 'stamina'（剑士/将军）| null（其它英雄 / 世界1）
    this.mana = 100; this.maxMana = 100; this.stamina = 100; this.maxStamina = 100; this._resRegenT = 0;
    if(pCM(this).maxHpMul !== 1){ this.maxHp = Math.round(this.maxHp * pCM(this).maxHpMul); this.hp = this.maxHp; } // 挑战模式：玻璃之躯（双人按个人因子）
    this.speed=240;
    this.lv=1; // 个人等级（双人各自独立升级）
    this.xp=0; this.xpNext=10; // 个人经验（双人各自独立计算，需求曲线与单人版一致）
    this.dead=false; this.reviveWave=0; // 双人模式：阵亡标记与复活波次
    this.shootCD=0; // 射击冷却（按玩家独立，双人互不干扰）
    this.skills={}; this.shootRate=0.35; this.bulletDmg=10;
    this.bulletSpd=520; this.bulletR=6; this.pierce=0;
    this.invuln=0; this.regen=0; this.regenTimer=0;
    this.multishot=1; this.explosive=0; this.homing=0;
    this.shield=0; this.shieldAngle=0;
    this.magnetRange=120; // 经验磁吸距离（拾取距离技能加成）
    this.shieldFlash=0;   // 护盾抵挡特效计时器（白闪反馈）
    this.slowed=false; this.dotFlash=0; this.slowedFor=0; // 粘液减速/中毒；🌶️胡椒命中玩家的减速计时（⚔️对战）
    this.webSlowUntil=0; this.webSlowMul=1; // 🕸️ 蛛网黏住：踩到织网者的网 → 减速到 G.time+0.3 秒为止（走出自动恢复）
    this.stun=0; // 眩晕剩余秒数（眩晕时除护盾外所有技能失效）
    this.stunImmune=0; // 被冲撞怪撞晕后的撞击免疫剩余秒数（防连控到死）
    this.frozen=0; this.frozenMax=0; // ❄️ 被魔法师冰霜冻住（⚔️对战玩家也能吃冰：壳是视觉，定身靠 stun）
    this.frostImmune=0; // ❄️ 冰冻免疫窗：冻完要再隔几秒才能被再冻（**不许连控玩家**；怪无此限制）
    this.kbx=0; this.kby=0; // 击退速度（近战怪/boss命中冲量，update 内衰减）
    this.padEngaged = false; // 🎮 1P 手柄摇杆是否已接管移动（滞回：大死区接管、小死区松开，防摇杆漂移带着玩家乱走）
    // 🗡 剑士（近战角色）：不射击，改为大剑扇形挥砍——能斩伤敌人 / 击退 / 斩掉敌方弹幕
    //    1P / 2P 各自独立取角色（G.hero / G.hero2）：双人可以让两个人都当剑士，也可以一近一远
    this.melee = false;
    this.isSwordsman = false;
    this.slashFx = 0;     // 挥砍特效计时（绘制时剑身加长加亮）
    this.slashArc = Math.PI/4; // 挥砍扇形半角（弧度，45° → 基础总张角 90°）；出刀时由 arcFromSkills() 实时重算
    this.slashRange = 76; // 挥砍半径（世界坐标，与绘制同一系数 → 看得见就砍得到）
    this.swingT = 0;      // 🗡 挥砍动画计时：出刀后剑刃从一侧扫到另一侧再收回
    this.swingDur = 0.18; // 挥砍动画时长（秒）
    this.swingDirs = [];  // 本次挥砍的方向（当前始终只有一个：张开的是张角，不是多开方向）
    // 剑士专属技能属性（初始 0，由近战技能 apply 提升）
    this.whirlArc = 0;     // 🔁 回旋斩：张角半角（弧度），0 = 未学。唯一会改挥砍张角的技能，其余技能一律不动
    this.cutBonus = 0;     // ✂️ 裂空：额外可斩掉的敌方弹幕上限
    this.dashPerSlash = 0; // 💨 突进斩：出刀瞬间的前冲距离
    this.guardRate = 0;    // 🧱 铁壁：出刀后的减伤率
    this.guardTime = 0;    // 🧱 铁壁：剩余减伤时间
    const myHero = this.seat === 2 ? (G.hero3 || 'gunner') : (this.seat === 1 ? (G.hero2 || 'gunner') : (G.hero || 'gunner')); // 各人取各自的角色
    this.isDogmilk = false; // 🐶 野生狗奶（第十四角色）标志：默认关，狗奶分支里开
    this.isCardmaster = false; // 🃏 卡牌大师（第十五角色）标志：默认关，卡牌大师分支里开
    this.isKnight = false; // 🛡 骑士（第十七角色）标志：默认关，骑士分支里开（重甲坦克剑士：前摇挥剑+举盾+勇士冲锋）
    // 🔆 激光角色（第三角色）：不发射子弹，改为「自动锁定 + 持续光束」——射程全屏，但不穿透
    //    （打到第一个敌人就停，和激光小怪同一套光路：墙/敌人截断光束；弹幕不挡光、只被顺路烧掉）
    //    代价是过热：连续照射积热，热量满则强制冷却到 0，期间完全不输出 → 玩法核心是"把控照射节奏"
    this.isLaser = false;
    this.beamDps = 0;      // 光束每秒伤害
    this.beamRange = 0;    // 光束射程（世界坐标；🔆激光=全屏，见 beamFullRange()）
    this.beamWidth = 0;    // 光束判定半宽（世界坐标）
    this.beamForks = 0;    // 🔱 分光棱镜：额外分叉光束数
    this.beamHeat = 0;     // 当前热量
    this.heatMax = 0;      // 过热阈值
    this.heatRate = 0;     // 照射时每秒积热
    this.coolRate = 0;     // 每秒散热
    this.overheated = false; // 过热锁定：必须冷却到 0 才能再照
    this.beamOn = false;   // 本帧是否真的在照射（判定/绘制共用）
    this.beamAngs = [];    // 本帧各道光束的方向
    this.beamLens = [];    // 本帧各道光束的长度（🚫不穿透：各自停在墙/第一个敌人处）
    this.beamStops = [];   // 本帧各道光束的截断结果 {ang,len,hit}
    this.beamLen = 0;      // 主光束长度（绘制用，= beamLens[0]）
    this.beamAcc = 0;      // 伤害结算节拍累加（0.12s 一跳）
    this.beamCut = 0;      // 烧弹幕配额累加（每秒最多 3 发）
    // 💣 爆破角色（第四角色）：普攻仍是自动射击（吃射手远程技能池），额外带一个主动技能——
    //    按 🖱 左键单击（1P）/ 手柄 RB（按键 5），在鼠标或手柄光标处投放一个「持续轰炸区」：
    //    区域内每 0.55 秒随机落一发炮弹（爆炸半径 88、伤害 26），持续 3.5 秒，投放后进入冷却
    this.isBomber = false;
    this.bombCD = 0;           // 当前冷却剩余（秒）
    this.bombCDMax = 6.0;      // 冷却总时长（⏱️轰炸节奏可缩短）
    this.bombZoneR = 96;       // 轰炸区半径（🌐扩大轰炸可增大）
    this.bombBlastR = 88;      // 单发炮弹爆炸半径
    this.bombDmg = 26;         // 单发炮弹伤害
    this.bombDur = 3.5;        // 轰炸区持续时间
    this.bombDropEvery = 0.55; // 落弹间隔
    this.bombWarn = 0.42;      // 落点预警时长（炮弹落下前的闪烁提示圈）
    this.bombFx = 0;           // 投放瞬间的本体特效计时
    this.bombStun = 0;         // 💫震荡弹：爆炸眩晕时长（0=未学）
    this.bombCluster = 0;      // ✳️集束弹：落地额外散出的小弹数（0=未学）
    this.bombBurn = 0;         // 🔥燃烧弹：弹坑火海每跳伤害（0=未学）
    // 🌀 龙卷风角色（第五角色）：**近战角色**——普攻是自动挥出的「360° 旋风斩」（判定等同剑士满级回旋斩：
    //    前后左右一圈全打，半径 78；有怪在范围内才出刀，不空挥），额外带一个主动技能——
    //    按 🖱 左键单击（1P）/ 手柄 RB（按键 5）：朝鼠标或光标「突进」一段（突进方向要瞄准），落点卷起龙卷风：
    //    ① 吸怪：范围内敌人被持续拉向风眼（Boss 体型大打折）② 吸怪期间本体减伤 60%
    //    ③ 风眼范围内持续伤害（每 0.3 秒一跳）④ 风停瞬间把范围内敌人向外击退（见 updateTornadoes）
    //    玩法闭环：瞄准 → 突进冲进怪堆 → 顶着 60% 减伤把怪吸成一团 → 旋风斩 + 风伤打满 → 风停吹散
    this.isTornado = false;
    this.torCD = 0;            // 当前冷却剩余（秒）
    this.torCDMax = 7.0;       // 冷却总时长（⏱️快速成风可缩短）
    this.torR = 150;           // 风眼半径（吸怪 + 持续伤害的范围）
    this.torDur = 2.2;         // 吸怪持续时间（归零即击退）
    this.torDmg = 14;          // 每跳伤害（🌬️锐利风刃可提升）
    this.torTick = 0.3;        // 伤害结算间隔
    this.torPull = 320;        // 吸力：敌人每秒被拉近的距离（🌀漩涡吸力可提升）
    this.torKnock = 1000;      // 收尾击退冲量（🕐持久风暴可提升）
    this.torGuard = 0.6;       // 吸怪期间减伤率（基础 60%，🛡️风壁护体可提升；2026-10-10 削：80→60）
    this.torDash = 220;        // 突进距离上限
    this.dashT = 0;            // 突进剩余时间（>0 时按 dashVX/dashVY 位移）
    this.dashVX = 0; this.dashVY = 0;
    this.torFx = 0;            // 起风瞬间的本体特效计时
    // 🧪 毒液角色（第六角色）：**远程角色**——普攻和射手一样是自动射击（吃射手远程技能池），
    //    特色是「每射满 5 发子弹，第 5 发变成毒液弹」：这发子弹**命中敌人或飞出场地时**，
    //    在落点留下一小滩「毒液领域」（G.effects 里的 venompool）——范围内敌人持续掉血 + 被减速，
    //    领域持续 2.6 秒、每 0.4 秒结算一跳。玩法闭环：拉线走位不停输出 → 毒液沿弹道铺路 →
    //    怪群踩进毒液里被拖慢、被烧血，射手最怕的"贴脸怪"被自己的毒液挡在远处。
    this.isVenom = false;
    this.venomCount = 0;       // 距离下一滩毒液的已射子弹数（每射 1 发 +1，满 venomEvery 清零）
    this.venomEvery = 5;       // 每几发子弹留一滩毒液（🔫浓缩毒素可降低）
    this.venR = 46;            // 毒液领域半径（小范围；🌊扩散毒圈可增大）
    this.venDur = 2.6;         // 领域持续时间（⏳持久毒素可延长）
    this.venTick = 0.4;        // 伤害结算间隔
    this.venDmg = 7;           // 每跳伤害（☠️剧毒可提升）
    this.venSlow = 0.65;       // 领域内敌人移速倍率（🕸️粘稠毒液可再降）
    this.venFx = 0;            // 射出毒液弹瞬间的本体特效计时（枪口一绿）
    // 🔮 魔法师角色（第八角色）：**远程角色**——不射普通子弹，普攻放**自己选定的法术**：
    //    🔥 火球（永远可放）：低直伤火球，命中处爆炸 + 点燃（初始伤害低，输出重心在爆炸与灼烧）
    //    ❄️ 冰霜（2.2s 冷却）：以**瞄准点**为中心的范围冻结 —— 圈内敌人**定身且无法攻击 3 秒**（Boss 有抗性 1.5 秒）
    //    🪨 土墙（30s 冷却）：在**贴身前方**立一堵横墙（掩体），墙有独立**耐久次数**（基础 10 次）
    //        ① 挡下打向己方的敌方弹幕（弹幕撞墙即碎，消耗 1 次）
    //        ② 把扑过来的怪顶在墙外表面（怪一直挤墙则 0.5 秒扣 1 次，节流防一帧扣光）
    //        ③ 次数耗尽 → 塌下 → 消失；**不可叠加**（同时最多一堵）
    //    ⚠️ 2026-10-06 用户定：**不设血量，只算次数** —— 挨一下算一次，弱弹与重击一视同仁
    //    🎛 2026-10-08 用户定（**取消随机施法**）：法术由 🖱 右键 / 手柄LB **手动切换**（见 MAGE_SPELLS 与 castMagic）；
    //       选中的法术冷却中 → **这一手哑火**（不出手，白等一个出手间隔）—— 全游戏唯一"选错就白打"的角色
    this.isMage = false;
    this.mageSpell = 'fire';    // 🔮 当前选中的法术（'fire'/'frost'/'earth'）：🖱 右键 / 手柄LB 循环切换，普攻释放它
    this.mageSpellUsed = false; // 🔮 本局是否切过法术（false → 轮盘下方显示「右键切换」的操作提示，切过一次就收起）
    this.mageSwitchFx = 0;      // 🔮 切换法术瞬间的提示特效计时（轮盘闪一圈）
    this.mageDryFx = 0;         // 🔮 哑火提示计时（选中的法术冷却中 → 这一手没出去，头顶冒一缕灰烟）
    this.frostCd = 0;           // ❄️ 冰霜冷却剩余（秒）——取消随机后必须显式限，否则可以无限冻怪
    this.frostCdMax = 2.2;      // ❄️ 冰霜冷却总时长（≈随机时代的平均出手间隔 1/3×0.62s 的宽松版）
    this.wallHits = 10;         // 🪨 土墙可挡**次数**（磐石护盾可提升）：挨一下算一次，不看伤害大小
    this.wallCd = 0;            // 🪨 立墙内置冷却剩余（秒）
    this.wallCdMax = 30;        // 🪨 立墙内置冷却总时长（土墙速凝可缩短）
    this.wallFx = 0;            // 🪨 立墙瞬间的本体特效计时
    this.fireDmg = 8;           // 🔥 火球直伤（初始很低）
    this.fireBlast = 1;         // 🔥 火球爆炸倍率（走 Bullet 的 explosive 口径：半径 40+15×倍率 / 伤害 直伤×0.5×倍率）
    this.fireBurnDps = 6;       // 🔥 灼烧每秒伤害（每 0.5 秒结算一跳 = dps×0.5；烈焰精通可提升）
    this.fireBurnT = 3;         // 🔥 灼烧持续（秒）
    this.frostR = 120;          // ❄️ 冰霜范围半径（以瞄准点为中心；霜域扩张可增大）
    this.frostDur = 3;          // ❄️ 冰冻时长（秒；极寒延长可提升）
    this.frostBossDur = 1.5;    // ❄️ Boss 抗性：只冻 1.5 秒
    this.frostHits = 0;         // ❄️ 最近一次冻结到的敌人数（读数/测试用）
    this.frostX = 0; this.frostY = 0; // ❄️ 最近一次冰冻的中心（读数/测试用）
    this.mageFxType = '';       // 🔮 本次施放的法术类型（'fire' / 'frost' / 'earth'）
    this.mageFx = 0;            // 🔮 施放瞬间的本体特效计时
    // 🧹 扫帚飞行（主动技能 · 🖱 左键单击 / 手柄RB）：骑上扫帚 10 秒，**移速 ×3**；冷却 30 秒
    //    设计定位：魔法师最脆（92 血）、最慢（速率 0.62 咏唱），扫帚是它唯一的"跑路 + 赶场"手段
    this.broomCD = 0;           // 🧹 冷却剩余（秒）
    this.broomCDMax = 30;       // 🧹 冷却总时长（30 秒）
    this.broomT = 0;            // 🧹 飞行剩余时长（>0 = 正在飞）
    this.broomDur = 10;         // 🧹 飞行时长（10 秒）
    this.broomMul = 3;          // 🧹 移速倍率（×3）
    this.broomFx = 0;           // 🧹 起飞瞬间的本体特效计时
    this.broomLandFx = 0;       // 🧹 落地扬尘特效计时
    this.broomTrailT = 0;       // 🧹💨 尾迹发射节拍（每 ~0.03 秒在身下留一朵紫色光斑，见 G.broomTrail）
    this.broomWispT = 0;        // 🧹✨ 金火星节拍（从扫帚毛刷端甩出的火花）
    // 🦇 吸血鬼角色（第九角色）：**近战角色 · 全场最快**——不射击，用一套比剑士更短更快的利爪连撕
    //    ⚡ 极速：基础移速 300（全场第一，剑士 250 / 龙卷风 260 / 将军 255；2026-10-23 削：330→300）
    //    🩸 嗜血（被动 · 核心）：**每次挥爪命中敌人就回血**（不是击杀才回 —— 打满一窝兵=当场回满）
    //       单刀回血封顶 = vampLeech × vampLeechCap（3），防止一刀扎进怪堆里瞬间满血
    //    🖱 血月突袭（主动技）：朝光标瞬移一段距离，沿途被血刃划过的敌人吃 1.5× 爪击伤害并吸血；CD 6 秒
    this.isVampire = false;
    this.vampCD = 0;            // 🖱 血月突袭：冷却剩余（秒）
    this.vampCDMax = 6;         // 🖱 血月突袭：冷却总时长 6 秒（血月疾行可缩短）
    this.vampDash = 300;        // 🖱 血月突袭：突进距离上限（血月疾行可提升）
    this.vampLeech = 0;         // 🩸 每次命中回血点数（**只有吸血鬼**会在下面的角色分支里开成 1；嗜血技能可提升）
    this.vampLeechCap = 1;      // 🩸 单刀回血上限 = vampLeech × 该值（2026-10-21 削：3→2；2026-10-23 削：2→1，压续航）
    this.vampFx = 0;            // 🦇 突袭瞬间的本体特效计时
    this.vampHealFx = 0;        // 🩸 回血瞬间的提示计时（身上泛红光）
    this.vampDashHits = 0;      // 🖱 最近一次突袭切到的敌人数（读数/测试用）
    this.vampDashHeal = 0;      // 🩸 最近一次突袭回的血量（读数/测试用）
    this.vampHealAmt = 0;       // 🩸 最近一刀挥砍回了多少血（读数/测试用）
    // 🪨 投石角色（第十角色）：**弹药型远程**——自己不产石头，全靠地图上刷出来的三色长方石。
    //    玩法闭环：跑位捡石 → 1 秒装填 → 自动抛物线抛出（高伤）→ 空手时用拾取器贴身保命
    //    ⚠️ 手里同时只能拿一块：装填期间踩到第二块 → 超载自伤 50（石袋加固可减），那块石头当场碎掉
    this.isStone = false;
    this.isRookie = false;  // 🐣 新手（第十一角色）：木棍近战，全员最弱
    this.isEngineer = false; // ⚙️ 工程师（第十二角色）：放置系——本体弱，伤害全靠自动炮台
    this.stoneHold = null;      // 🪨 手里那块石头：{ color:'red'|'yellow'|'blue' }；null = 空手
    this.stoneLoad = 0;         // 🪨 装填剩余秒数（>0 = 装填中，到 0 那一帧自动抛出）
    this.stoneLoadMax = 1.0;    // 🪨 装填总时长（基础 1 秒，快速装填可缩短）
    this.stonePick = 30;        // 🪨 拾取半径（走多近算"踩到石头"，广口拾取器可加大）
    this.stoneThrowRange = Infinity; // 🪨 投掷射程 = 全屏（无上限：落点就是鼠标指针，见 throwStone；2026-10-07 用户定）
    this.stoneHitFx = 0;        // 🪨 落地瞬间的本体反馈计时
    this.stoneOverFx = 0;       // 🪨 超载（踩到第二块自伤）的提示计时
    this.stoneThrows = 0;       // 🪨 本局已投出多少块（读数/测试用）
    this.stoneLastHit = 0;      // 🪨 最近一次投石打出的最高单次伤害（读数/测试用）
    this.stoneMatch = 0;        // 🪨 最近一次投石命中了几只"同色"的怪（读数/测试用）
    this._dqByOverload = false; // 🏳️ 死于超载（试图双持）：结算标题换「你被DQ了！」
    this._dqCause = false;      // 🏳️ 超载结算**进行中**的临时牌：takeDamage 扣空血会当场同步调 gameOver()，
                                //    那一刻 _dqByOverload 还没写上，所以结算画面必须靠这张临牌认出来（见 overloadHurt）
    // 🎭 挑战减益「骗人」：假技能等级 —— 只用于"显示上升了一级"，绝不参与任何数值计算
    this.fakeLv = {};
    this.vampArc = 45 * Math.PI/180; // 🦇 利爪基础张角：正面 90°（半角 45°），比剑士窄（爪是撕不是抡）
    // 🩸 血线系列（vampDps / vampLinks / vampHealAcc … 与 vampBlocked 免伤）是"血线吸附版"的遗留：
    //    当前一代设定下**不再使用** —— vampLinks 恒为空 → vampLinked() 恒返回 false → 免伤永不触发。
    //    保留字段与函数，是为了让 ~10 处伤害调用点不必回改（行为上完全等于一代）。
    this.vampLinks = [];
    // ⚡ 剑士 / 射手的主动技能（2026-10-06 新增）——与爆破·龙卷风共用同一套「主动技能键」：
    //    1P = 🖱 左键单击；2P/3P 真人 = 手柄 RB（按键 5）；AI 座位自动判断该不该放
    //    🗡 剑士「斩灭」：以自身朝向为中线，左右各 75°（总张角 150°）、半径 = 屏幕长边的 1/4，
    //       扇形内**除 Boss 外的怪全部秒杀**（清场保命牌），冷却 60 秒
    //    🏹 射手「环形弹幕」：以自身为中心向四周连放 6 圈弹幕（每圈 12 发、360° 均分），冷却 30 秒
    this.swCD = 0;              // 🗡 斩灭：冷却剩余（秒）
    this.swCDMax = 60;          // 🗡 斩灭：冷却总时长（秒）
    this.swArc = 75 * Math.PI/180; // 🗡 斩灭：扇形半角 = 75°（左右各 75°，总 150°）
    this.swFx = 0;              // 🗡 斩灭：施放瞬间的本体特效计时
    this.swKills = 0;           // 🗡 斩灭：最近一次斩掉的小怪数（读数/测试用）
    this.ringCD = 0;            // 🏹 环形弹幕：冷却剩余（秒）
    this.ringCDMax = 30;        // 🏹 环形弹幕：冷却总时长（秒）
    this.ringCount = 6;         // 🏹 环形弹幕：一共放几圈
    this.ringBullets = 12;      // 🏹 环形弹幕：每圈几发（360° 均分 → 每 30° 一发）
    this.ringGap = 0.16;        // 🏹 环形弹幕：圈与圈之间的间隔（秒）
    this.ringLeft = 0;          // 🏹 环形弹幕：还剩几圈没放（>0 表示正在连放中）
    this.ringT = 0;             // 🏹 环形弹幕：下一圈的倒计时
    this.ringPhase = 0;         // 🏹 环形弹幕：每圈旋转偏移（六圈叠成星芒，纯视觉）
    this.ringFx = 0;            // 🏹 环形弹幕：施放瞬间的本体特效计时
    // 🔆 激光的主动技能「旋转扫射」（2026-10-06 新增，同样吃「主动技能键」：1P 🖱 左键单击 / 手柄RB）
    //    参考棱光穹主的「旋转光环」：以自身为中心放出 6 道等角光束，整体匀速**自转**，
    //    光束穿人穿怪、只在屏幕边缘停（跟 Boss 那套同源），转到的怪就挨打；
    //    持续 3 秒，期间主光束熄灭、余热照常散（等于送一个"散热窗口"）。冷却 30 秒。
    //    另外激光的**散热指示改成体色**：照射时身体由亮紫逐渐变红、冷却时褪回亮紫（见 laserBodyColor）。
    this.laserUltCD = 0;        // 🔆 旋转扫射：冷却剩余（秒）
    this.laserUltCDMax = 30;    // 🔆 旋转扫射：冷却总时长（秒）
    this.laserUltT = 0;         // 🔆 旋转扫射：剩余持续时间（>0 = 正在扫射）
    this.laserUltDur = 3.0;     // 🔆 旋转扫射：持续时间（秒）
    this.laserUltBeams = 6;     // 🔆 旋转扫射：光束道数（等角分布）
    this.laserUltSpin = 5.0;    // 🔆 旋转扫射：自转角速度（弧度/秒）
    this.laserUltA = 0;         // 🔆 旋转扫射：当前整体角度
    this.laserUltA0 = 0;        // 🔆 旋转扫射：上一帧角度（本帧扫过的扇区 = A0→A）
    this.laserUltAcc = 0;       // 🔆 旋转扫射：伤害节拍累加（0.12s 一跳，与主光束同口径）
    this.laserUltDps = 0;       // 🔆 旋转扫射：施放瞬间锁定的每秒伤害
    this.laserUltFx = 0;        // 🔆 旋转扫射：起手本体特效计时
    this.laserUltCut = 0;       // 🔆 旋转扫射：烧弹幕配额（每秒 6 发）
    if(myHero === 'swordsman'){
      this.melee = true; this.isSwordsman = true;
      this.maxHp = Math.round(130 * pCM(this).maxHpMul); // 近战要贴脸：血更厚
      this.hp = this.maxHp;
      this.speed = 250;
      this.shootRate = 0.45; // 挥砍间隔
      this.bulletDmg = 26;   // 斩击基础伤害
    } else if(myHero === 'laser'){
      this.isLaser = true;
      this.maxHp = Math.round(88 * pCM(this).maxHpMul); // 最脆：靠全屏射程换生存，被贴脸很危险
      this.hp = this.maxHp;
      this.speed = 250;
      this.beamDps = 42;     // 每秒 42 伤害（只打光束第一个撞上的敌人，不穿透）
      this.beamRange = this.beamFullRange(); // 🔆 射程=全屏（世界=屏幕对角线，每帧随视野缩放刷新）
      this.beamWidth = 9;    // 判定半宽 9
      this.heatMax = 100;    // 连续照射约 3.6 秒过热
      this.heatRate = 28;
      this.coolRate = 48;    // 从满热冷到 0 约 2.1 秒
      this.bulletDmg = 42;   // 与光束同源：面板/结算沿用同一字段（射击技能与光束无关）
    } else if(myHero === 'bomber'){
      this.isBomber = true;
      this.maxHp = Math.round(110 * pCM(this).maxHpMul); // 比射手略厚：投弹要往怪堆边上站
      this.hp = this.maxHp;
      this.speed = 240;
      this.shootRate = 0.45; // 普攻比射手慢一档（强度补偿给主动技能）
      this.bulletDmg = 8;    // 🔻基础子弹削弱（原 11 → 8）：轰炸区才是它的主要输出
    } else if(myHero === 'tornado'){
      this.isTornado = true;
      this.melee = true;     // 🌀 近战：走剑士同一套挥砍系统（shoot() → slash()），但判定是整圈
      this.isSwordsman = false; // 不是剑士：不吃剑士专属技能，也不是"大剑"造型
      this.maxHp = Math.round(118 * pCM(this).maxHpMul); // 要冲进怪堆里卷风，比射手厚一点
      this.hp = this.maxHp;
      this.speed = 260;      // 风一般的速度：突进 + 走位都是它的强项
      this.shootRate = 0.5;  // 整圈都能打到 → 出刀间隔比剑士慢一档（斩击 20）：伤害靠"吸成一团再打满"
      this.bulletDmg = 20;   // 旋风斩单次伤害（近战口径，与剑士的 26 同源）
      this.slashRange = 78;  // 旋风斩半径（世界坐标，与绘制同一系数 → 看得见就砍得到）
      this.slashArc = Math.PI/2; // 🌀 基础张角：正面 180°（半角 90°）——🔄回旋风刃学满才是整圈 360°；与判定/动画共用
    } else if(myHero === 'venom'){
      this.isVenom = true;
      this.maxHp = Math.round(96 * pCM(this).maxHpMul); // 比射手略脆：毒液能挡怪，站位可以更靠后
      this.hp = this.maxHp;
      this.speed = 245;
      this.shootRate = 0.38; // 比射手略慢一档（毒液领域是主要补偿）
      this.bulletDmg = 9;    // 🔻直伤略低于射手（10 → 9）：输出重心在毒液领域
    } else if(myHero === 'mage'){
      // 🔮 魔法师（第八角色）：**远程**，但普攻不是子弹而是「法术轮盘」里选中的那个魔法（见 castMagic）
      this.isMage = true;
      this.maxHp = Math.round(92 * pCM(this).maxHpMul); // 全场最脆：自保全靠土墙掩体 + 冰霜控场
      this.hp = this.maxHp;
      this.speed = 240;
      this.shootRate = 0.62; // 咏唱节奏：比射手慢（每次出手都带爆炸/控场/护盾，不能太快）
      this.bulletDmg = 8;    // 火球直伤（低）
      this.fireDmg = 8;
    } else if(myHero === 'vampire'){
      // 🦇 吸血鬼（第九角色）：**近战**——比剑士更短更快的利爪连撕，靠"极速 + 刀刀回血"活命
      //    代价：血最薄（86）、爪最短（70）、单刀伤害最低（15）—— 全靠出刀快、走得快、回得回来
      this.isVampire = true;
      this.melee = true;     // 近战：走剑士同一套挥砍系统（shoot() → slash()）
      this.isSwordsman = false; // 不是剑士：不吃剑士专属技能，用利爪自己的一套技能池
      this.maxHp = Math.round(86 * pCM(this).maxHpMul); // 全场最薄：回血才是它的血条
      this.hp = this.maxHp;
      this.speed = 300;      // ⚡ 极速：全场最快（射手 240 / 剑士 250 / 将军 255 / 龙卷风 260）——2026-10-23 削：330→300，不再那么难抓
      this.shootRate = 0.30; // 连撕：出刀间隔只有剑士的 2/3（0.45 → 0.30），伤害靠频率堆
      this.bulletDmg = 14;   // 单爪伤害（低于剑士 26，但出手快一倍；2026-10-21 削：17→15；2026-10-23 削：15→14）
      this.slashRange = 70;  // 利爪最短（剑士 78 / 龙卷风 78 / 将军 118）——必须真的贴上去
      this.slashArc = this.vampArc; // 正面 90°（半角 45°）：爪是撕不是抡，张角比剑士窄
      this.vampLeech = 1;    // 🩸 嗜血被动只此一家：**开场就开**（其它近战角色恒为 0，一刀都不回血）
    } else if(myHero === 'stone'){
      // 🪨 投石（第十角色）：**远程但吃弹药**——自己不会产石头，输出全靠地图上刷出来的三色长方石
      //    ① 普攻 = 「拾取器」：贴身一戳，低频（0.75s）低伤（7）——空手时唯一的防身手段，不是输出
      //    ② 捡石 = 走上去自动捡（不用按键）→ **1 秒装填** → 到点自动朝最近的怪抛出（抛物线）
      //    ③ 石头效果：🟡黄=单体最痛 / 🔵蓝=命中减速 / 🔴红=落地范围爆炸；砸中间色标记的怪额外重伤
      //    ④ 手里同时只能拿一块：装填中踩到第二块 → 超载自伤 50（那块石头当场碎）
      this.isStone = true;
      this.maxHp = Math.round(108 * pCM(this).maxHpMul); // 中等偏厚：捡石要满地图跑，太脆活不下来
      this.hp = this.maxHp;
      this.speed = 252;      // 略快于射手（240）：捡石是往返跑，腿脚得利索
      this.shootRate = 0.75; // 拾取器出手很慢（它就是"没石头时的防身手段"，不能抢投石的戏）
      this.bulletDmg = 7;    // 拾取器单次伤害（低）
      this.pickRange = 76;   // 拾取器戳击半径（世界坐标）
      this.pickArc = 32 * Math.PI/180; // 拾取器张角半角（正面 64°，很窄——它是拿来"戳"的）
    } else if(myHero === 'rookie'){
      // 🐣 新手（第十一角色）：**全员最弱** —— 一根木棍走天下，数值全面垫底，还带一条自嘲式缺陷。
      //    ① 血最少（70）/ 走得最慢（205）/ 木棍最短（62）/ 单棍最轻（6）—— 没有任何一项拿得出手
      //    ② 缺陷「手滑」：每 4 棍有一棍打空（只挥出去、不结算伤害），学了「手不抖了」才解除
      //    ③ 主动技「战吼」（2026-10-08 用户定，原"尖叫"升级）：把身边怪吼退半步 + **自己和队友伤害 ×1.5 持续 3 秒**（CD 12 秒）
      //       —— 自己还是最弱，但它是全队都想带上的辅助
      //    （2026-10-08 用户定：本体要"真弱"，不许靠技能翻身；强的是它给团队的增益）
      this.isRookie = true;
      this.melee = true;        // 近战：走剑士同一套挥砍系统（shoot() → slash()）
      this.isSwordsman = false; // 不是剑士：不吃剑士专属池，用木棍自己那套
      this.maxHp = Math.round(70 * pCM(this).maxHpMul); // 全场最薄（吸血鬼 86 → 新手 70）
      this.hp = this.maxHp;
      this.speed = 205;         // 全场最慢（原本最慢 240）
      this.shootRate = 0.62;    // 挥棍间隔最长（剑士 0.45 / 吸血鬼 0.30）
      this.bulletDmg = 6;       // 单棍伤害最低（剑士 26 / 吸血鬼 17）——满级敲重一点也才 21
      this.slashRange = 62;     // 木棍最短（吸血鬼 70 / 剑士 78）
      this.slashArc = 45 * Math.PI/180; // 正面 90°（半角 45°）
      this.rkSwings = 0;        // 🐣 手滑计数：每 4 棍打空一棍
      this.rkMissFx = 0;        // 🐣 「手滑！」飘字计时
      this.rkCryCD = 0;         // 📣 战吼：冷却剩余（秒）
      this.rkCryCDMax = 12;     // 📣 战吼：冷却总时长 12 秒（嗓门大可缩短）
      this.rkCryFx = 0;         // 📣 战吼：本体特效计时
      this.rkCryR = 150;        // 📣 战吼：吼退半径（击退半步 + 团队增伤，依然 0 伤害）
      this.rageT = 0;           // 📣 战吼增伤剩余（秒）：>0 时自己和队友伤害 ×1.5（见 ROAR_MUL）
      this.rkTossCDMax = ROOKIE_TOSS_CD; // 🤾 扔木棍：丢棍间隔（学「挥快一点」会一起缩短，见 recalcTossCD）
      this.rkTossT = 1.2;       // 🤾 扔木棍：下一根的倒计时（开局先等一会儿再开始丢）
      this.rkTossFx = 0;        // 🤾 扔木棍：抬臂起手特效计时
    } else if(myHero === 'general'){
      // ⚔️ 将军（第七角色）：**近战**——长枪突刺，攻击距离比剑士远得多（118 vs 78），但张角窄（正面 100°）
      //    ① 🖱 主动技「冲刺」：鼠标左键单击向光标突进（纯位移/跑路），CD 5 秒（疾风突进可缩短）
      //    ② 🪖 「征召」：**每 10 秒自动召唤 1 名剑士小兵**（集结号可缩短间隔）——与冲刺彻底分开，不用撞怪才能召
      this.isGeneral = true;
      this.melee = true;     // 近战：走剑士同一套挥砍系统（shoot() → slash()）
      this.isSwordsman = false; // 不是剑士：不吃剑士专属技能，用长枪自己的技能池
      this.maxHp = Math.round(126 * pCM(this).maxHpMul); // 冲锋陷阵：比剑士略薄一点（冲刺可以跑路）
      this.hp = this.maxHp;
      this.speed = 255;      // 统兵之人：脚下得快
      this.shootRate = 0.5;  // 枪是刺不是抡：间隔比剑士慢一档（伤害 18）
      this.bulletDmg = 18;   // 长枪突刺单次伤害（2026-10-23 削：22→18，DPS 压到 ~36）
      this.slashRange = 118; // 长枪攻击距离远（剑士 78 / 龙卷风 78 / 将军 118）
      this.slashArc = 50 * Math.PI/180; // 突刺张角窄：正面 100°（半角 50°）——横扫千军可加宽
      this.genCD = 0;        // ⚔️ 冲刺：冷却剩余（秒）
      this.genCDMax = 5;     // ⚔️ 冲刺：冷却总时长 5 秒（疾风突进可缩短）
      this.genDash = 230;    // ⚔️ 冲刺距离上限
      this.summonCount = 1;  // ⚔️ 每次征召召唤几只小兵（征召令可提升）
      this.minionCap = 4;    // ⚔️ 自己的小兵存量上限（征召令可提升）
      this.minionPow = 1;    // ⚔️ 小兵伤害倍率（精锐亲兵可提升）
      this.summonEvery = 13; // ⚔️ 征召间隔（秒）：每 13 秒自动召 1 名小兵（2026-10-23 削：10→13；集结号可缩短）
      this.summonT = 13;     // ⚔️ 征召倒计时（开局先等满一轮再出兵）
      this.genFx = 0;        // ⚔️ 冲刺瞬间的本体特效计时（冷却环外扩用）
      this.sumFx = 0;        // ⚔️ 征召出兵瞬间的特效计时（冷却环外圈提示用）
    } else if(myHero === 'engineer'){
      // ⚙️ 工程师（第十二角色）：**放置系** —— 本体输出很弱，伤害全靠**自动炮台**站场输出。
      //    ① 普攻 = 🔧 扳手敲击：8 伤 / 0.70s / 半径 68 / 正面 80°（空手防身，不是输出）
      //    ② **自动炮台**：每 engEvery 秒自动在附近立一座（场上上限 engMax 座、每座存在 engLife 秒），
      //       炮台自动索敌（射程 engRange）连续开火（射速 engRate / 单发 engDmg）——这就是它的"放置"输出
      //    ③ 大招「🛠 建造战车」：按一下施工 3 秒 → 上车（车体更大/更厚/更快/免疫控制/能推怪，双炮管自动远射）
      //    平衡口径：稳态 = engLife/engEvery ≈ 1.5 座在岗 → 约 18 DPS（与射手 28.6 同档），
      //             战车是"爆发窗口"：60 秒冷却 + 装甲不可恢复，打爆即结束（不是常驻形态）
      this.isEngineer = true;
      this.melee = true;        // 近战：走剑士同一套挥砍系统（配扳手动画）
      this.isSwordsman = false; // 不是剑士：不吃剑士专属池，用工程师自己那套
      this.maxHp = Math.round(100 * pCM(this).maxHpMul); // 中等：炮台替它挡枪，本体不必太厚
      this.hp = this.maxHp;
      this.speed = 235;         // 略慢于射手（240）：它该"守着炮台打"，不该满地图跑
      this.shootRate = 0.70;    // 扳手出手很慢（防身用，不能抢炮台的戏）
      this.bulletDmg = 8;       // 扳手单次伤害（低）
      this.slashRange = 68;     // 扳手很短（仅次于新手的 62）
      this.slashArc = 40 * Math.PI/180; // 正面 80°（半角 40°）
      this.engDmg = 12;         // ⚙️ 炮台：单发伤害
      this.engRate = 1.0;       // ⚙️ 炮台：开火间隔（秒）
      this.engRange = 260;      // ⚙️ 炮台：索敌半径 = 射程
      this.engLife = 12;        // ⚙️ 炮台：存在时长（秒）
      this.engMax = 3;          // ⚙️ 炮台：场上同时存在的上限（座）
      this.engEvery = 8;        // ⚙️ 自动部署间隔（秒）
      this.engT = 8;            // ⚙️ 下一次自动部署的倒计时（开局先等满一轮）
      this.engBuilt = 0;        // ⚙️ 累计建了多少座（读数/测试用）
      // ④ 大招「🛠 建造战车」（2026-10-08 用户定，取代原来的手动布塔）：按一下开始施工 3 秒 → 上车。
      //    战车口径：体积更大（r 14→34）/ 装甲更厚（260，**任何方式都无法恢复**）/ 车速更快（235→300）/
      //    **免疫一切控制**（眩晕·击退·减速全不吃）/ **能推着除 Boss 外的任何怪走** / 双炮管自动索敌远射。
      //    被打只扣装甲（本体血量全程锁在车里）；装甲清零 → 战车炸毁、本体弹出，
      //    **冷却从炸毁这一刻才开始走**（固定 60 秒，不可被技能缩短）。
      this.veh = null;          // ⚙️ 战车状态：null = 徒步；否则 { hp, maxHp, cd[2], ang, tread, ... }
      this.vehCD = 0;           // ⚙️ 大招冷却剩余（秒）—— 只在"没施工、也没上车"时才倒数
      this.vehCDMax = VEH_CD;   // ⚙️ 冷却总时长：固定 60 秒（技能不可缩短）
      this.vehBuild = 0;        // ⚙️ 施工倒计时（> 0 = 正在建造战车）
      this.vehBuildMax = 3;     // ⚙️ 施工时长（3 秒；「快速组装」可缩短）
      this.vehSpot = null;      // ⚙️ 施工点（{x,y}）—— 建成后玩家在这里上车
      this.vehFx = 0;           // ⚙️ 特效计时（起建 / 上车 / 炸毁）
      this.r0 = 0;              // ⚙️ 本体半径备份（上车变大、下车还原）
    } else if(myHero === 'boomerang'){
      // 🪃 回旋镖（第十三角色）：**普攻往返双段 + 大招贴身环绕 5 秒**（两套口径，别合并）。
      //    ① 普攻：朝瞄准方向扔出回旋镖（自动）→ 直线飞出 BM_RANGE 后**折返**、追踪玩家飞回来
      //    ② 往返双段：去程与回程**各算一次伤害** → 输出靠"把怪留在弧线上"
      //    ③ 接住它 = 没有额外收益（飞回来就是接住）；没接住（超时 3 秒）就白扔一枚
      //    ④ 场上同时最多 BM_MAX 枚（基础 2）：扔太勤会"堵住" → 逼玩家算节奏
      //    ⑤ 大招「万镖齐发」：一圈甩出 8 枚，每枚**贴身环绕 5 秒**再收回（持续输出，伤害打折）
      this.isBoomerang = true;
      this.maxHp = Math.round(100 * pCM(this).maxHpMul); // 中等：要贴到"往返路径"上，比射手略厚
      this.hp = this.maxHp;
      this.speed = 255;         // 略快：往返路径要玩家自己走位去"卡"，腿脚得利索
      this.shootRate = 0.55;    // 出手间隔（扔镖不如射手快：一枚镖能打两段，总量并不低）
      this.bulletDmg = 10;      // 单段伤害（去程 10 / 回程 10×回程倍率；2026-10-23 削：12→10，DPS 压到 ~36）
      this.bmRange = BM_RANGE;      // 普攻：去程飞行距离（📏长弧可提升）
      this.bmOrbitR = BM_ORBIT_R;   // 大招：环绕半径（📏长弧可提升）
      this.bmOrbitW = BM_ORBIT_W;   // 大招：环绕角速度（💨破风可提升）
      this.bmOrbitT = BM_ORBIT_T;   // 大招：环绕持续秒数（固定 5 秒）
      this.bmOutSpd = BM_SPD_OUT;   // 去程速度（💨破风可提升）
      this.bmBackSpd = BM_SPD_BACK; // 回程速度（💨破风可提升，按同比例）
      this.bmBackMul = BM_RETURN_MUL; // 🔁 回程伤害倍率（🔁回旋重击可提升）
      this.bmPierce = BM_PIERCE;    // 每条路径的穿透数（➹贯穿可提升）
      this.bmMax = BM_MAX;          // 场上同时最多几枚（🔱双镖齐飞可提升）
      this.bmMultishot = 1;         // 每次扔出几枚（🔱双镖齐飞可提升）
      this.bmCatchFx = 0;           // 接住瞬间的回声特效计时
      this.bmCaught = 0;            // 本局接住了多少枚（读数/测试用）
      this.bmThrown = 0;            // 本局扔出多少枚（读数/测试用）
      // 🌀 大招「万镖齐发」（🖱 左键单击 / 手柄RB）：向四周连甩 BM_ULT_N 枚回旋镖，全部贴身环绕 5 秒再收回
      this.bmUltCD = 0;          // 冷却剩余（秒）
      this.bmUltCDMax = BM_ULT_CD; // 冷却总时长（风暴之眼可缩短）
      this.bmUltN = BM_ULT_N;    // 一次扔几枚（镖阵扩张可提升）
      this.bmUltLeft = 0;        // 还剩几枚没扔（>0 = 正在连甩）
      this.bmUltT = 0;           // 下一枚的倒计时
      this.bmUltFx = 0;          // 施放瞬间的本体特效计时
      this.bmUltSpin = 0;        // 连甩时的初始角度偏移（逐枚旋转，甩成风车）
    } else if(myHero === 'dogmilk'){
      // 🐶 野生狗奶（第十四角色）：**近战 · 攻击距离短**，但**命中即「奶住」敌人**——
      //   被奶到的敌人**定身** + 持续掉血（秒伤 10，持续 等级×2 秒）；大招「春秋邻域」是全屏核弹。
      this.isDogmilk = true;
      this.melee = true;          // 近战：走剑士同一套挥砍系统（shoot() → slash()）
      this.isSwordsman = false;   // 不是剑士：不吃剑士专属技能，用狗奶自己的技能池
      this.maxHp = Math.round(100 * pCM(this).maxHpMul); // 中等血量：靠定身+DOT 拉扯，不靠硬抗
      this.hp = this.maxHp;
      this.speed = 235;           // 中等偏慢（手短，得贴脸，风险高）
      this.shootRate = 0.55;      // 出刀间隔（近战偏慢，靠控制拉扯）
      this.bulletDmg = 12;        // 短刀基础伤害
      this.slashRange = 66;       // 🐶 攻击距离短（剑士 78 / 新手 62 / 狗奶 66：比剑士短一截，得真贴上去）
      this.slashArc = Math.PI/2;  // 正面 90° 张角
      // 🐶 大招「春秋邻域」（🖱 左键单击 / 手柄RB）：开启后视野内敌人全部定身，场地从中心不断放大、最后爆炸——
      //   动画结束后**秒杀所有非 Boss 敌人**（Boss 受 80% 重创，不致死，避免每 3 分钟直接通关）；冷却 180 秒。
      this.dogCD = 0;             // 大招冷却剩余（秒）
      this.dogCDMax = 180;        // 大招冷却总时长（3 分钟）
      this.dogUltT = 0;           // 大招动画剩余时长（>0 = 正在播放）
      this.dogUltDur = 2.6;       // 大招动画总时长（秒）：从场地放大 → 爆炸
      this.dogFx = 0;             // 起手特效计时
      this.dogKills = 0;          // 最近一次大招秒掉的敌人数（读数/测试用）
    } else if(myHero === 'cardmaster'){
      // 🃏 卡牌大师（第十五角色）：**远程 · 赌徒**——每次出手从 54 张牌随机抽 5 张，逐张变卡牌弹丸扇出；
      //   同点数 2/3/4 张 → 该组 ×2/×3/×4；双王（王炸）→ 全牌秒杀；顺子额外加伤。
      //   大招「飞机」（🖱 左键 / 手柄RB）：一记斗地主「飞机」拍下去，面前（瞄准方向锥形）所有敌人被击退 + 眩晕 + 重创。
      this.isCardmaster = true;
      this.isGunnerType = true;  // 远程：走射手同一套自动射击节奏（shoot() → shootCards()）
      this.maxHp = Math.round(100 * pCM(this).maxHpMul); // 中等血量
      this.hp = this.maxHp;
      this.speed = 230;          // 中等移速
      this.shootRate = 0.85;     // 出手间隔（每次抽一手 5 张，比射手慢一档，但一手是 5 连发）
      this.bulletDmg = 10;       // 名义基础伤害（实际伤害由牌面点数决定，此处仅占位）
      this.bulletSpd = 560;      // 卡牌弹丸速度
      this.bulletR = 6;          // 卡牌弹丸半径（绘制成小卡牌）
      this.pierce = 0;           // 卡牌不穿透（一张打一个，靠倍率堆伤害）
      this.lastHand = null;      // 最近一手牌（调试/手牌特效用）
      this.cmHandFx = 0;         // 出手手牌特效计时
      // 🃏 大招「飞机」（🖱 左键单击 / 手柄RB）：斗地主名场面——"十七张牌你能秒我？出一个飞机"。
      //   面前（瞄准方向 ~140° 锥、半径 560）所有敌人被**大量击退 + 眩晕 2.5 秒 + 重创**；Boss 同样吃但（按惯例）不致死。冷却 100 秒。
      this.cmCD = 0;             // 大招冷却剩余（秒）
      this.cmCDMax = 100;        // 大招冷却总时长（「飞机强化」可缩短）
      this.cmUltT = 0;           // 大招动画剩余时长（>0 = 飞机正飞过来）
      this.cmUltDur = 1.0;       // 大招动画总时长（秒）：从牌堆甩出飞机 → 拍下
      this.cmFx = 0;             // 起手特效计时
      this.cmKills = 0;          // 最近一次大招波及的敌人数（读数/测试用）
    } else if(myHero === 'ketchup'){
      // 🍅 番茄酱之神（第十六角色）：**控场系** —— 手持麦当劳番茄酱包，
      //   ① 普攻 = 把一包番茄酱**扔出去**：命中敌人 → 严重减速（移速只剩一半，持续 2 秒），
      //      并且当场爆出一滩大酱潭（扔中必爆；没扔中、撞墙/出界也爆；潭内敌人持续掉血 + 走不动）
      //   ② 主动技「吃番茄酱」（🖱 左键 / 手柄RB）：当场吃下一包回 20 血，
      //      顺手把空袋狠狠**捏爆**——酱汁呈放射状爆出许多滴、飞出去落地，
      //      每一滴都化成一滩大酱潭：冷却 30 秒
      this.isKetchup = true;
      this.maxHp = Math.round(100 * pCM(this).maxHpMul); // 中等血量（靠减速拉扯，不靠硬抗）
      this.hp = this.maxHp;
      this.speed = 240;          // 中等偏上移速（扔包要走位、捏爆要贴怪群，腿脚得利索）
      this.shootRate = KET_RATE; // 扔包出手间隔
      this.bulletDmg = KET_DMG;  // 名义攻击力（面板/暂停数值读它；扔中的直接伤害，见 castKetchupThrow）
      // —— 酱潭参数（专属技能可调；apply() 从基准重算）——
      this.kDmg = KET_DMG;       // 每跳伤害
      this.kR = KET_R;           // 大酱潭半径
      this.kDur = KET_DUR;       // 持续秒数
      this.kSlow = KET_SLOW;     // 移速倍率
      this.kFx = 0;              // 出手/捏爆动画计时（>0 = 手上那包正在被甩出去/捏爆）
      this.kEatFx = 0;           // 吃酱特效计时（>0 = 头上冒小红花）
      // —— 主动技「吃番茄酱」字段 ——
      this.kCD = 0;              // 冷却剩余（秒）
      this.kCDMax = KET_EAT_CD;  // 冷却总时长（「再来一包」可缩短）
      this.kHeal = KET_EAT_HP;   // 回血量（「再来一包」可提升）
    } else if(myHero === 'knight'){
      // 🛡 骑士（第十七角色）：**重甲坦克剑士** —— 全场最厚（160）+ 全场最慢（185），
      //    换来三件事：单剑最重（36 伤）、出手最慢（0.90s）且**带 0.30s 前摇**、
      //    **不攻击时自动举盾**挡住正面扇区飞来的攻击与弹幕。
      //    主动技「勇士冲锋」（CD 20s）：自身无敌 5 秒 + 移速 ×1.5 + 出手 ×0.6，
      //    并给范围内队友挂 1 层次数盾（一击即破）+ 50% 减伤（范围减伤只存在于技能期间）。
      //    平衡口径：DPS（40）低于剑士（58）——盾与冲锋是它的输出之外的"第二条命"；
      //              举盾只挡正面（120°），身侧和背后照常挨打，玩家要用鼠标把盾转向威胁。
      this.isKnight = true;
      this.melee = true;          // 近战：走剑士同一套挥砍系统（shoot() → slash()）
      this.isSwordsman = false;   // 不是剑士：不吃剑士专属技能，用骑士自己的一套技能池
      this.maxHp = Math.round(KN_HP * pCM(this).maxHpMul); // 全场最厚：血牛坦克
      this.hp = this.maxHp;
      this.speed = KN_SPD;        // 全场最慢：重甲拖脚（换来的补偿是盾）
      this.shootRate = KN_RATE;   // 挥剑间隔：最慢一档（重剑要抡圆了才砍得出去）
      this.bulletDmg = KN_DMG;    // 单剑伤害：全场最高
      this.slashRange = KN_RANGE; // 挥剑半径
      this.slashArc = KN_ARC;     // 正面 100°
      // —— 前摇 / 举盾字段 ——
      this.kNWindMax = KN_WINDUP; // 前摇时长（秒；「疾风斩」可缩短，下限 KN_WIND_FLOOR）
      this.kNWindT = 0;           // 前摇剩余（>0 = 起手式中，落刀后清零）
      this.kNFx = 0;              // 起手式剑鸣特效计时（前摇开始的闪光）
      this.kShieldR = KN_SHIELD_R;   // 举盾挡截半径（世界坐标）
      this.kShieldArc = KN_SHIELD_ARC; // 盾面张角半角（「盾面加宽」可加大）
      this.kBlockFx = 0;          // 挡下攻击的闪光计时（盾面火花）
      this.kBlocks = 0;           // 本局举盾挡下的攻击数（读数/测试用）
      // —— 主动技「勇士冲锋」字段 ——
      this.knCD = 0;              // 冲锋冷却剩余（秒）
      this.knCDMax = KN_CHARGE_CD; // 冷却总时长（固定 20 秒；「冲锋意志」可缩短）
      this.knDurMax = KN_CHARGE_T; // 单次冲锋持续秒数（「冲锋意志」可延长）
      this.kInvT = 0;             // 无敌剩余（秒）：>0 时任何伤害都不掉血（勇士冲锋）
      this.kAuraR = KN_AURA_R;    // 队友增益半径（「守护誓言」可扩大）
      this.kAuraDR = KN_AURA_DR;  // 队友减伤比例（「守护誓言」可加深）
      this.kAuraT = 0;            // （挂在队友身上）范围减伤剩余秒数
      this.kShieldCnt = 0;        // （挂在队友身上）次数盾层数：一击即破
      this.kShieldFx = 0;         // （挂在队友身上）盾破闪光计时
      this.kCharges = 0;          // 本局放了几次冲锋（读数/测试用）
    } else if(myHero === 'bard'){
      // 🎻 吟游诗人（第十八角色）：远程 · 团队治疗
      this.isBard = true;
      this.maxHp = Math.round(BARD_HP * pCM(this).maxHpMul); // 全场最脆（用户定 85）＋挑战因子
      this.speed = BARD_SPD;
      this.shootRate = BARD_RATE;
      this.bulletDmg = BARD_DMG;
      this.bulletSpd = BARD_WAVE_SPD;
      this.bulletR = BARD_WAVE_R;
      this.bardPierce = BARD_PIERCE;         // 音波穿透数（「和弦」可加）
      this.bardCD = 0;                       // 回旋曲剩余冷却
      this.bardCDMax = BARD_SONG_CD;         // 冷却总时长（「加演」可缩短）
      this.bardSongT = 0;                    // 引导剩余（>0 = 正在拉曲）
      this.bardSongMax = BARD_SONG_T;        // 引导总时长（「长音」可加长）
      this.bardHealR = BARD_SONG_R;          // 曲子半径
      this.bardHealRate = BARD_HEAL;         // 每秒回血（「变奏」可加）
      this.bardAcc = 0;                      // 治疗累积（攒满 1 点发一次，血量不出小数）
      this.bardBuffUntil = 0;                // 移速增益到期（绝对时间戳）
      this.bardFx = 0;                       // 拨弦动画计时
      this.bardInterruptFx = 0;              // 断曲提示计时
      this.bardSongs = 0;                    // 本局拉了几次曲（读数/测试用）
      this.bardMelT = 0;                     // 🎵 旋律推进：本轮已过去的秒数
      this.bardMelIdx = 0;                   // 🎵 旋律推进：下一个待放的音符下标（BARD_MELODY）
    } else if(myHero === 'spring'){
      // 🥊 弹簧（第十九个角色）：近战 · 蓄力弹飞 + 弹簧钩
      //    ① 普攻「弹簧拳」：**按住左键蓄力、松手出拳**（桌面）——拳锋把面前的怪弹飞，
      //       蓄力越久飞得越远、伤害越高；被弹飞的怪撞墙 → 额外伤害 + 冲击波。
      //       📱 触屏没有"按住"手势 → 退化为自动快拳（范围内有怪 + 冷却好了就出最小蓄力的拳）。
      //    ② 主动技「弹簧钩」：🖱 右键 / 手柄LB / 触屏技能按钮 —— 锚到光标处把自己拉过去，
      //       牵引途中无敌，沿途碰到的怪全部受伤。
      //    平衡口径：DPS 中游（命中是多目标但每下不重），真正的价值是"把怪推走"的控场与墙撞爆发；
      //              102 血比剑士薄 —— 弹出破绽就要用钩索补位移，不能站着对撸。
      this.isSpring = true;
      this.melee = true;          // 近战口径（走位/AI/护盾剑轮判定都按近战；但普攻不走 slash()，见 castSpringPunch）
      this.maxHp = Math.round(SP_HP * pCM(this).maxHpMul); // 用户定 102 血 ＋挑战因子
      this.hp = this.maxHp;
      this.speed = SP_SPD;
      this.shootRate = SP_RATE;   // 出拳后冷却（蓄力才是主节奏）
      this.bulletDmg = SP_DMG;    // 名义攻击力（面板读它；实际伤害 = bulletDmg + 满蓄加成×蓄力档，见 castSpringPunch）
      this.slashRange = SP_RANGE; // 复用挥砍半径字段：拳程（满蓄另加，见 punchRange()）
      this.slashArc = SP_ARC;     // 复用张角字段：出拳张角半角
      // —— 蓄力状态 ——
      this.spCharging = false;    // 是否正在蓄力（按住左键）
      this.spChargeT = 0;         // 已蓄力秒数（0 ~ SP_CHARGE_MAX）
      this.spChargeFx = 0;        // 蓄满时的"咔哒"锁定闪光计时
      this.spPunchFx = 0;         // 出拳动画计时（>0 = 拳头正在伸出）
      this.spPunchDir = 0;        // 出拳方向（弧度）：出拳动画的伸出方向
      this.spPunchRange = SP_RANGE; // 出拳动画的伸出长度（读取用）
      this.spPunches = 0;         // 本局出拳数（读数/测试用）
      this.spWallHits = 0;        // 本局墙撞次数（读数/测试用）
      // —— 专属技能可调参数（apply() 从基准重算）——
      this.spLaunch = SP_LAUNCH;      // 弹飞初速基础（「超弹压缩」可加）
      this.spFlyT = SP_FLY_T;         // 弹飞滞留时长（「超弹压缩」可加）
      this.spWallDmg = SP_WALL_DMG;   // 撞墙额外伤害（「墙裂冲击」可加）
      this.spWaveR = SP_WAVE_R;       // 冲击波半径（「墙裂冲击」可加）
      this.spWaveDmg = SP_WAVE_DMG;   // 冲击波伤害（「墙裂冲击」可加）
      this.spHookRange = SP_HOOK_RANGE; // 钩索锚距（「长臂钩索」可加）
      this.spHookDmg = SP_HOOK_DMG;     // 牵引碰伤（「长臂钩索」可加）
      // —— 主动技「弹簧钩」字段 ——
      this.spCD = 0;              // 钩索冷却剩余（秒）
      this.spCDMax = SP_HOOK_CD;  // 冷却总时长（「快速上弦」可缩短）
      this.spPull = null;         // 牵引中：{ tx, ty, t, dur, id }（null = 不在牵引）
      this.spHookFx = 0;          // 出钩动画计时（>0 = 弹簧钩正在甩出去）
      this.spHookId = 0;          // 牵引编号：每次牵引 +1（碰伤"每次每怪只算一次"的凭据）
      this.spHooks = 0;           // 本局放了几次钩索（读数/测试用）
    }
    // 🌌 世界2 资源归属：世界2 下，魔法师/吸血鬼用魔力，剑士/将军用体力；其余英雄（含世界1）无资源条
    if(G.world !== 1){ // 🌌🌿 世界2/世界3 都有资源条（魔力/体力）；世界1 无资源
      if(myHero === 'mage' || myHero === 'vampire') this.resType = 'mana';
      else if(myHero === 'swordsman' || myHero === 'general' || myHero === 'knight' || myHero === 'spring') this.resType = 'stamina'; // 🛡 骑士也是近战体力系（冲锋吃体力）；🥊 弹簧近战体力系（钩索吃体力）
    }
  }
  // 🌌🌿 世界2/世界3 资源系统：所有资源相关方法的统一入口（世界1 / 无资源英雄走默认值，零影响）
  resFrac(){
    if(this.resType === 'mana') return clamp(this.mana / this.maxMana, 0, 1);
    if(this.resType === 'stamina') return clamp(this.stamina / this.maxStamina, 0, 1);
    return 1;
  }
  resSpdMul(){ // 体力 → 移速（满 +15%、空 -15%）；非体力英雄恒 1
    if(this.resType !== 'stamina') return 1;
    return 1 + RES_MOD_RANGE * (this.resFrac() - 0.5) * 2;
  }
  manaDmgMul(){ // 魔力 → 普攻伤害（满 +15%、空 -15%）；非魔力英雄恒 1
    if(this.resType !== 'mana') return 1;
    return 1 + RES_MOD_RANGE * (this.resFrac() - 0.5) * 2;
  }
  spendRes(cost){ // 放技能消耗资源（魔力/体力）；无资源则不扣
    if(this.resType === 'mana') this.mana = Math.max(0, this.mana - cost);
    else if(this.resType === 'stamina') this.stamina = Math.max(0, this.stamina - cost);
  }
  regenRes(dt){ // 资源随时间回复（仅世界2 + 有资源的英雄）
    if(!this.resType) return;
    if(this.resType === 'mana'){ if(this.mana < this.maxMana) this.mana = Math.min(this.maxMana, this.mana + RES_REGEN_MANA * dt); }
    else if(this.resType === 'stamina'){ if(this.stamina < this.maxStamina) this.stamina = Math.min(this.maxStamina, this.stamina + RES_REGEN_STA * dt); }
  }
  // 🎯 该玩家的瞄准点：1P 用鼠标，2P/3P 用各自的光标（光标缺失时兜底指向自己前方，避免 NaN）
  aimPoint(){
    if(this.seat === 0){
      // 📱 手机模式：1P 瞄准由触屏右摇杆方向决定（在瞄准方向远处取一点，等价于鼠标世界坐标）
      if(G.deviceType === 'phone' && TPAD.on){
        const ax = TPAD.aim.x, ay = TPAD.aim.y;
        if(ax !== 0 || ay !== 0) return { x: this.x + ax * 320, y: this.y + ay * 320 };
      }
      // 🎮 手柄模式：1P 用右摇杆瞄准（与手机右摇杆同口径）—— 右摇杆推出死区才接管，否则照旧用鼠标；
      //    只在他真归 1P 时生效（单人/AI 组队/联机主机；双人真人同屏时手柄归 2P，不抢）
      if(GP.connected && padUsableBy1P()){
        const rc = GP.rightStickClean();
        if(Math.hypot(rc.x, rc.y) > 0.18) return { x: this.x + rc.x * 320, y: this.y + rc.y * 320 };
      }
      return mouseWorld();
    }
    const c = cursorOf(this.seat);
    return c || { x: this.x, y: this.y - 120 };
  }
  update(dt){
    // dot flash decay
    if(this.dotFlash>0) this.dotFlash -= dt;
    if(this.shieldFlash>0) this.shieldFlash -= dt;
    if(this.slashFx>0) this.slashFx -= dt; // 🗡 剑士挥砍特效计时
    if(this.swingT>0) this.swingT -= dt;   // 🗡 挥砍动画计时
    if(this.venFx>0) this.venFx -= dt;     // 🧪 毒液弹射出瞬间的枪口毒环
    // 🔮 魔法师：施放特效 + 立墙内置冷却计时（冷却从立墙那一刻就开始走）
    if(this.mageFx>0) this.mageFx -= dt;
    if(this.wallFx>0) this.wallFx -= dt;
    if(this.wallCd>0) this.wallCd = Math.max(0, this.wallCd - dt); // 钳零：浮点递减不留小负数
    if(this.frostCd>0) this.frostCd = Math.max(0, this.frostCd - dt); // ❄️ 冰霜冷却（取消随机后新加的显式限）
    if(this.mageSwitchFx>0) this.mageSwitchFx -= dt; // 🔮 切法术的轮盘闪光
    if(this.mageDryFx>0) this.mageDryFx -= dt;       // 🔮 哑火提示（选中的法术在冷却中）
    if(this.guardTime>0) this.guardTime -= dt; // 🧱 铁壁：出刀减伤窗口
    if(this.slowedFor>0) this.slowedFor -= dt; // 🌶️ 胡椒减速（⚔️对战被辣到）计时
    if(this.invuln>0) this.invuln -= dt;
    if(this.stunImmune>0) this.stunImmune -= dt; // 撞击免疫计时
    if(this.frostImmune>0) this.frostImmune -= dt; // ❄️ 冰冻免疫窗递减（结束前冰霜冻不了这位玩家）
    if(this.rageT>0) this.rageT = Math.max(0, this.rageT - dt); // 📣 战吼增伤剩余（吼完 3 秒内伤害 ×1.5，钳零不留小负数）
    // 🛡 骑士：起手式剑鸣 / 举盾挡下的闪光 / 勇士冲锋无敌与光环计时 / 队友次数盾闪光
    if(this.kNFx>0) this.kNFx -= dt;
    if(this.kBlockFx>0) this.kBlockFx -= dt;
    if(this.kInvT>0) this.kInvT = Math.max(0, this.kInvT - dt);
    if(this.kAuraT>0) this.kAuraT = Math.max(0, this.kAuraT - dt);
    if(this.kShieldFx>0) this.kShieldFx -= dt;
    if(this.frozen>0) this.frozen -= dt;           // ❄️ 冰壳计时（纯视觉，定身由 stun 负责）
    if(this.stun>0 && !this.veh){ // ⚙️ 战车免疫眩晕：车内永远不进"不能动"分支
      this.stun -= dt; // 眩晕中：不能移动、不能回血
    } else {
      // movement（2P：十字键/帽轴/摇杆模拟量；1P：键盘）
      let dx=0,dy=0, analog=false;
      if(this.seat > 0){
        if(NET.state === 'connected' && NET.role === 'host' && this.seat === 1){ // 🌐联机：2P 移动来自手机触屏摇杆
          dx = NET.remote.m[0] || 0; dy = NET.remote.m[1] || 0; analog = true; // 已是归一化模拟量
        } else if(isAIPlayer(this)){ // 🤖 AI 接管（与AI组队的 2P / 三人模式的 3P）：内置队友接管（躲弹幕/避怪/捡经验/跟随队友），瞄准光标同时刷新
          const d = AI.move(this);
          dx = d.dx; dy = d.dy; analog = true;
          AI.aim(this);
        } else {
          const d = GP.moveInput();
          dx = d.dx; dy = d.dy; analog = !!d.analog;
        }
      } else {
        const K = KEYBINDS.binds.p1; // 按键设置：1P 移动可绑定键盘键或手柄键
        if(KEYBINDS.any(K.up)) dy-=1;
        if(KEYBINDS.any(K.down)) dy+=1;
        if(KEYBINDS.any(K.left)) dx-=1;
        if(KEYBINDS.any(K.right)) dx+=1;
        // 🎮 1P 用手柄左摇杆：360° 全方位模拟量（任意角度、轻推慢走、推到底满速）
        //    键盘/按键没输入时才接管；2P 是真人手柄时让位（双人同用一个手柄的摇杆）
        //    接管用「大死区 0.25、松开 0.12」的滞回：手柄摇杆回中不良/漂移时不会带着玩家自己乱走
        if(dx === 0 && dy === 0 && padUsableBy1P()){
          const raw = GP.stick();
          const mag = Math.hypot(raw.x, raw.y);
          if(this.padEngaged ? mag > 0.12 : mag > 0.25){
            const d = GP.analogMove(raw.x, raw.y);
            if(d.dx !== 0 || d.dy !== 0){ dx = d.dx; dy = d.dy; analog = true; this.padEngaged = true; }
          } else this.padEngaged = false; // 回中/漂移幅度过小 → 断开接管
        }
        // 📱 手机模式：1P 移动直接用触屏左摇杆（覆盖键盘/手柄，手机没有这些输入）
        if(G.deviceType === 'phone' && TPAD.on){
          dx = TPAD.move.x; dy = TPAD.move.y; analog = true;
        }
      }
      // 踩粘液减速50%；🕸️ 踩蛛网减速（倍率=webSlowMul，黏住但不冻结）；挑战模式移速修正（双人按个人因子）；🧹 扫帚飞行期间再乘 3 倍
      // ⚙️ 战车：车速直接取 VEH_SPD 常量（不吃本体加成、升级重算也覆盖不了它）+ **免疫粘液减速**
      const webSlow = (this.webSlowUntil > G.time) ? (this.webSlowMul || 1) : 1;
      const base = this.veh ? VEH_SPD : (this.slowed || this.slowedFor > 0 ? this.speed*0.5 : this.speed) * webSlow;
      // 🛡 勇士冲锋期间移速 ×1.5（重甲坦克唯一的"冲锋"时刻）
      const spd = base * pCM(this).speedMul * (this.broomT > 0 ? this.broomMul : 1) * this.resSpdMul() * (this.bardBuffUntil > G.time ? (1 + BARD_SPD_BUFF) : 1) * (this.kInvT > 0 ? KN_CHARGE_SPD : 1); // 🌌 世界2 体力→移速调制
      const len=Math.hypot(dx,dy)||1;
      if(analog){ this.x += dx*spd*dt; this.y += dy*spd*dt; } // 摇杆模拟量：dx/dy 已含速度比例
      else { this.x += dx/len*spd*dt; this.y += dy/len*spd*dt; }
      this.x = clamp(this.x, this.r, WW()-this.r); // 👁️视野扩大：活动边界随世界扩大
      this.y = clamp(this.y, this.r, WH()-this.r);
      // regen
      if(this.regen>0){
        this.regenTimer += dt;
        if(this.regenTimer >= 1/this.regen){
          this.hp = Math.min(this.maxHp, this.hp+1);
          this.regenTimer = 0;
        }
      }
    }
    this.regenRes(dt); // 🌌 世界2 资源回复（世界1 / 无资源英雄是空操作）
    // 🌀 突进位移（龙卷风主动技能）：向光标方向冲一段。无碰撞阻挡，只受世界边界限制；
    //    速度 = 位移/时长、时长正好倒数到 0 → 积分结果精确落在龙卷风风眼上（人和风一起到）
    if(this.dashT > 0){
      this.dashT -= dt;
      this.x = clamp(this.x + this.dashVX*dt, this.r, WW()-this.r);
      this.y = clamp(this.y + this.dashVY*dt, this.r, WH()-this.r);
      if(this.dashT <= 0){ this.dashT = 0; this.dashVX = 0; this.dashVY = 0; }
    }
    // 击退位移（近战怪/boss 命中冲量；眩晕中同样生效——被冲撞撞飞）
    // ⚙️ 战车**免疫击退**：冲量直接丢弃（车重 260 装甲的推土机，被撞一下纹丝不动）
    if(!this.veh && (this.kbx !== 0 || this.kby !== 0)){
      this.x = clamp(this.x + this.kbx*dt, this.r, WW()-this.r);
      this.y = clamp(this.y + this.kby*dt, this.r, WH()-this.r);
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 多人专属因子（距离联动，每对只结算一次，避免每人 update 各算一遍翻倍）
    //    👥 三人=两对：以「第一位存活玩家」为协调者，对所有其他存活玩家各结算一次
    if(multiOn() && G.players.find(q => !q.dead) === this && !this.dead){
      for(const other of G.players){
        if(other === this || other.dead) continue;
        const d = dist(this, other);
        if(CM().hug && d < 150){ // 相濡以沫：贴身每秒回 2% 最大生命
          this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.02 * dt);
          other.hp = Math.min(other.maxHp, other.hp + other.maxHp * 0.02 * dt);
        }
        if(CM().soulBond && d > 420){ // 灵魂绑定：离太远双方每秒流失 2.5% 最大生命（绕过无敌帧）
          for(const q of [this, other]){
            q.hp -= q.maxHp * 0.025 * dt;
            q.dotFlash = 0.15;
            if(q.hp <= 0){ q.hp = 0; coopPlayerDie(q); }
          }
        }
      }
    }
    // auto-shoot (眩晕时暂停；射击CD按玩家独立，双人互不干扰)
    // 🗡 剑士：挥砍范围内有怪（含敌方弹幕）且已冷却完毕才自动出刀，否则不出刀（不空挥）；方向仍由玩家自己瞄准
    // 🔆 激光：不吃射击CD，改为「持续光束 + 过热」——锁到目标就照，热满强制冷却（见 updateBeam）
    this.shootCD -= dt;
    if(this.isBomber) this.updateBombSkill(dt); // 💣 主动技能：投放轰炸区（🖱 左键单击 / 手柄RB）
    if(this.isTornado) this.updateTornadoSkill(dt); // 🌀 主动技能：突进 + 卷起龙卷风（同一套按键）
    if(this.isGeneral) this.updateGeneralSkill(dt); // ⚔️ 将军两条线：🖱冲刺（左键/CD5s）+ 🪖征召（每10s自动出兵）
    // 🦇 吸血鬼：🖱 血月突袭（左键 / CD6s：突进 + 沿途切击 + 吸血）
    if(this.isVampire) this.updateVampireSkill(dt);
    if(this.isMage) this.updateBroomSkill(dt); // 🧹 主动技能：扫帚飞行（🖱 左键单击 / 手柄RB：10 秒 ×3 移速，冷却 30s）
    if(this.isMage) this.updateMageSpellSkill(dt); // 🔮 法术轮盘：🖱 右键单击 / 手柄LB 切换当前要放的法术
    if(this.isStone) this.updateStoneSkill(dt); // 🪨 投石：捡石 → 1 秒装填 → 自动抛物线抛出（无左键主动技）
    if(this.isRookie) this.updateRookieSkill(dt); // 🐣 主动技：战吼（吼退半步 + 自己和队友 ×1.5 增伤 3 秒，CD 12s）
    if(this.isEngineer) this.updateEngineerSkill(dt); // ⚙️ 工程师：自动布塔（每 8s）+ 🛠 大招「建造战车」
    if(this.isBoomerang) this.updateBoomerangUlt(dt); // 🪃 回旋镖：大招「万镖齐发」（🖱 左键 / RB：连甩一圈回旋镖）
    if(this.isDogmilk) this.updateDogUlt(dt);  // 🐶 大招「春秋邻域」（🖱 左键 / RB：场地放大→爆炸→秒杀）
    if(this.isCardmaster) this.updateCardUlt(dt); // 🃏 大招「飞机」（🖱 左键 / RB：面前锥形击退+眩晕+重创）
    if(this.isKetchup) this.updateKetchup(dt); // 🍅 番茄酱之神：到点扔出一包番茄酱（命中减速并爆潭）+ 主动技「吃番茄酱」回血并捏爆铺大酱潭（左键/RB）
    if(this.isBard) this.updateBard(dt); // 🎻 吟游诗人：回旋曲引导/治疗/打断 + 主动技触发（左键/RB）
    if(this.isKnight) this.updateKnight(dt); // 🛡 骑士：前摇挥剑收尾 + 主动技「勇士冲锋」（无敌5s/加速/加攻速/队友次数盾+减伤）
    if(this.isSpring) this.updateSpring(dt); // 🥊 弹簧：按住蓄力/松手出拳 + 主动技「弹簧钩」（牵引无敌+碰伤）
    if(this.isSwordsman) this.updateSwordUlt(dt);   // 🗡 主动技能：斩灭（前方 150° 扇形秒杀小怪，CD60s）
    if(heroKind(this) === 'gunner') this.updateGunnerUlt(dt); // 🏹 主动技能：环形弹幕（360° 连放 6 圈，CD30s；只有射手有）
    if(this.isLaser) this.updateLaserUlt(dt); // 🔆 主动技能：旋转扫射激光（自转 6 道光束扫场，CD30s）
    if(this.isLaser){
      this.updateBeam(dt);
    } else if(this.isKnight){
      // 🛡 骑士攻击门：冷却好了 + 范围内有目标 → **起手式（前摇）**；真斩由 updateKnight 在前摇结束时落下
      //    （起手式一举剑：前 0.30s 前摇盾仍举着可挡，真斩那 0.18s 收盾——攻击时不能防御，出刀要挑时机）
      if(!this.veh && this.stun<=0 && this.kNWindT<=0 && this.shootCD <= 0 && G.state==='playing'){
        const meleeSource = G.pvp ? (G.players || []).filter(q => q && !q.dead && q.seat !== this.seat) : G.enemies;
        const hasTarget = meleeSource.some(e => !e.dead && !e.dying && dist(this, e) < this.slashRange + (e.r||8));
        if(hasTarget){
          this.kNWindT = this.kNWindMax || KN_WINDUP; // 起手式开始（落刀在 updateKnight）
          this.kNFx = this.kNWindT;                   // 剑鸣闪光
          SND.knightWind();
        }
      }
    } else if(this.isSpring){
      // 🥊 弹簧：普攻是「按住蓄力、松手出拳」的**手动蓄力拳**（桌面）—— 没有"到点自动出手"这回事，
      //    全部蓄力/出拳/钩索逻辑都在 updateSpring 里；📱 触屏（无按住手势）退化为自动快拳，也在那里。
      //    这里必须显式排除：否则会掉进下面的通用自动攻击门，把蓄力拳变成自动挥砍。
    } else if(!this.veh && this.stun<=0 && this.shootCD <= 0 && G.state==='playing'){
      // ⚙️ 战车期间不发扳手（火力交给两根炮管，见 updateVehicle）
      // 🍅 番茄酱之神不在这门里显式排除：updateKetchup 与这门同帧抢 shootCD——它一到点就置正，
      //    等门判断时 shootCD 早已 >0，门永远赶不上；shoot() 里也另有 isKetchup 兜底 return
      // ⚔️ 对战：近战角色的"有目标才出手"门槛改为检查对手玩家（PVE 时照旧看场上的怪）
      const meleeSource = G.pvp ? (G.players || []).filter(q => q && !q.dead && q.seat !== this.seat) : G.enemies;
      const meleeTarget = !this.melee || meleeSource.some(e => !e.dead && !e.dying && dist(this, e) < this.slashRange + (e.r||8));
        if(meleeTarget){
          // 🌌 腐蚀区降攻速：踩在腐蚀毒潭里时出手间隔 ×1.6（攻击频率变慢）
          const atkSlow = (G.time < (this.corrodeAtkSlowUntil||0)) ? 1.6 : 1;
          this.shootCD = this.shootRate * pCM(this).rateMul * atkSlow;
          this.shoot();
        }
    }
    // shield
    if(this.shield>0){
      this.shieldAngle += dt*3;
      // 🗡 剑士：护盾化为「剑轮」——触碰即斩；纯击退对剑士是重复功能（大剑本身就会把怪劈飞），
      // 所以剑士这边把盾球做成有伤害的旋转剑刃，射手维持原样（纯击退 + 挡弹幕）
      const bladed = this.melee && !this.isSpring; // 🥊 弹簧的盾球维持纯击退（它的拳本身就把怪弹飞，剑轮是重复功能）
      for(let i=0;i<this.shield;i++){
        const a = this.shieldAngle + i*(Math.PI*2/this.shield);
        const sx = this.x + Math.cos(a)*45;
        const sy = this.y + Math.sin(a)*45;
        G.enemies.forEach(e=>{
          if(e.dead || e.isBullet || e.invincible) return;
          const reach = bladed ? 22 : 18; // 剑轮刀刃更长，判定略宽
          if(dist({x:sx,y:sy}, e) < e.r+reach){
            if(bladed){
              // 🗡 剑轮：只斩不推 —— 剑身本来就负责击退，剑轮若也把敌人推开，就永远砍不到第二下
              // （同一敌人 0.4 秒结算一次，防止逐帧刷伤害）
              const now = G.time;
              if((e.bladeNextT || -9) <= now){
                e.bladeNextT = now + 0.4;
                const bdmg = Math.max(3, Math.round(this.bulletDmg * 0.65 * (e.isBoss ? 1.5 : 1))); // 🗡 剑轮同样吃对 Boss ×1.5
                e.takeDamage(bdmg, '#ffd166', false, this.seat); // 🗡 剑轮=近战来源（不吃护盾的远程减免）
                e.lastHitIdx = this.seat; // 击杀归属（吸血/挑战模式结算）
                spawnParticles(e.x, e.y, '#ffd166', 3);
              }
            } else {
              // knockback away from shield orb (no damage)；Boss 体重大，击退力度减半
              // 击退力与体型成反比：小怪弹得远、大怪/Boss 弹得近（r=16→640，r=35 Boss→约293）
              const kf = Math.max(160, Math.min(960, Math.round(10240 / e.r)));
              const ka = Math.atan2(e.y-sy, e.x-sx);
              e.kbx = Math.cos(ka)*kf;
              e.kby = Math.sin(ka)*kf;
            }
            SND.shieldBlock(); // 弹开敌人音效（内部节流防刷屏）
            this.shieldFlash = 0.15; // 护盾白闪反馈
          }
        });
      }
    }
  }
  // ================= 🔆 激光角色：持续光束（主武器，不吃射击CD） =================
  // ① 射程全屏：世界=屏幕，所以光束只要能到墙就够得着屏幕上任何目标（视野扩大时世界等比放大，同系数）
  // ② 不穿透：光路被「墙 或 第一个敌人」截断，和激光小怪同一套判定（rayCircleHit）
  //    弹幕不挡光——只被顺路烧掉（每秒 3 发配额）；伤害 0.12s 一跳，光束暴击只加伤、不眩晕
  // ③ 过热：照满 heatMax 强制冷却到 0 才能再照；💥过载爆发 会在过热这一刻原地炸开
  // ④ 🔮棱镜反射（专属技能）：打到敌人后折向最近的「本束没打过」的敌人，可折 1/2/3 次 →
  //    每束光变成一条折线（path），绘制/判定/烧弹幕全走同一条折线；反射段伤害 ×0.6
  beamFullRange(){ // 🔆 全屏射程：屏幕（=世界）对角线，屏幕内任何角落都够得着
    const w = W || (typeof innerWidth === 'number' ? innerWidth : 1280);
    const h = H || (typeof innerHeight === 'number' ? innerHeight : 720);
    return Math.hypot(w, h) / visionZoom(); // 👁️视野扩大：世界等比缩小，射程同系数放大
  }
  pickBeamTarget(){
    const aim = this.aimPoint();
    const a0 = angleTo(this, aim);
    const R = this.beamRange || this.beamFullRange(); // 🔆 全屏射程（锁定范围）
    const RN = Math.min(R, 500); // 距离项的归一化基准：超过 500px 就饱和——不然全屏射程会把"就近"权重稀释掉
    // 🎯 对准才开火：瞄准方向上没有敌人就不锁定（光束不亮、不积热，防过热空烧）
    //   宽容角 = 光柱真的够得到它的角度（asin((半宽+敌半径)/距离)，垂距等价式）再留 0.10rad(≈6°) 手感余量；
    //   🔱分光后分光束偏 0.28rad 也能打到 → 宽容角再叠加 0.28
    const forkTol = this.beamForks > 0 ? 0.28 : 0;
    let best = null, bestScore = Infinity;
    for(const e of targetsFor(this.seat)){ // ⚔️ 对战：锁定对手玩家；PVE：锁定敌人
      if(e.dead || e.dying || e.isBullet) continue; // 不锁定弹幕（弹幕只会被顺手烧掉）
      if(e.invincible) continue;                    // 无敌的敌人（冲撞怪冲锋）不锁定——光也穿不过去打不着
      const dx = e.x - this.x, dy = e.y - this.y;
      const d = Math.hypot(dx, dy);
      if(d > R + e.r) continue; // 全屏射程下这条只挡"世界之外"的异常坐标
      const ea = Math.atan2(dy, dx);
      const diff = Math.abs(((ea - a0 + Math.PI*3) % (Math.PI*2)) - Math.PI); // 与瞄准方向的夹角 0~π
      if(diff > Math.max(Math.atan2(this.beamWidth + e.r, d), 0.10) + forkTol) continue; // 🎯 指偏了不开火
      const score = diff * 2 + Math.min(d, RN) / RN * 0.9; // 瞄准方向优先（角度权重 2），其次近的优（距离权重 0.9）
      if(score < bestScore){ bestScore = score; best = e; }
    }
    return best;
  }
  // 🔮 棱镜反射：下一个折向目标 = 最近的「本束还没打过」的敌人（弹幕/无敌的不算，免得反弹白费）
  pickBounceTarget(from, hits){
    let best = null, bd = Infinity;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(hits.includes(e)) continue;
      const d = dist(from, e);
      if(d < bd){ bd = d; best = e; }
    }
    return best;
  }
  // 🚫 光路截断（不穿透，同激光小怪）：每道光束算「墙 或 第一个敌人」的距离，
  //   判定宽度用垂距等价式 rayCircleHit(半径 = 判定半宽 + 敌半径) → 视觉粗细 = 判定粗细
  //   🔮 棱镜反射：学了以后每打到一名敌人就折向下一个，于是每束光变成折线 path：
  //   path[0]=枪口，path[k]=第 k 个命中点；segs/lens 是每一段的「方向 / 长度」（共 hits.length 段）
  //   返回值只暂存在局部变量里（实例上的 this.beamStops 是本帧结果的数组，别和方法重名）
  beamCast(angs){
    const out = [];
    const Wd = this.beamWidth;
    const prism = this.skills.l_prism || 0;  // 🔮 可反射次数（0 = 未学 = 老的不穿透）
    const fallback = this.beamRange || this.beamFullRange();
    for(const a of angs){
      const path = [{ x: this.x, y: this.y }], segs = [], lens = [], hits = [];
      let ox = this.x, oy = this.y, dir = a;
      for(let step = 0; step <= prism; step++){ // prism=0 → 只走一段（打第一个敌人就停）
        const dx = Math.cos(dir), dy = Math.sin(dir);
        let len = Infinity;
        if(dx >  1e-6) len = Math.min(len, (WW() - ox) / dx); // 右墙
        if(dx < -1e-6) len = Math.min(len, -ox / dx);         // 左墙
        if(dy >  1e-6) len = Math.min(len, (WH() - oy) / dy); // 下墙
        if(dy < -1e-6) len = Math.min(len, -oy / dy);         // 上墙
        let hit = null;
        for(const e of targetsFor(this.seat)){ // ⚔️ 对战：对手玩家也会挡住光路
          if(e.dead || e.dying || e.isBullet) continue; // 弹幕不挡光
          if(e.invincible) continue;                    // 无敌的敌人（冲撞怪冲锋）挡不住光——和子弹"穿过"一致
          if(hits.includes(e)) continue;                // 🔮 本束已打过的敌人不再挡光（光从它身上折走了）
          const t = rayCircleHit(ox, oy, dx, dy, e.x, e.y, e.r + Wd);
          if(t !== null && t < len){ len = t; hit = e; }
        }
        if(!isFinite(len)) len = fallback; // 兜底：没有墙也没有敌人时按全屏
        len = Math.max(0, len);
        segs.push(dir); lens.push(len);
        path.push({ x: ox + dx * len, y: oy + dy * len });
        if(!hit) break;                 // 被墙挡住（或前方无人）→ 光路到此为止
        hits.push(hit);
        if(hits.length > prism) break;  // 反射次数用尽
        const next = this.pickBounceTarget(hit, hits);
        if(!next) break;                // 场上没有别的敌人可折 → 光停在当前敌人身上
        ox = hit.x; oy = hit.y; dir = Math.atan2(next.y - hit.y, next.x - hit.x); // 折向下一个
      }
      out.push({ ang: a, len: lens[0], hit: hits[0] || null, hits, path, segs, lens });
    }
    return out;
  }
  updateBeam(dt){
    const owner = this.seat;
    const critLv = this.skills.crit || 0;
    const burnLv = this.skills.l_burn || 0;
    const chainLv = this.skills.l_chain || 0;
    const slowLv = this.skills.l_slow || 0;
    const firing = this.stun <= 0 && !this.dead && G.state === 'playing';
    this.beamOn = false;
    // 🔆 旋转扫射期间：主光束熄灭（这段时间光都去转圈了），但余热照常散 —— 相当于送一个散热窗口
    if(this.laserUltT > 0){
      if(this.beamHeat > 0){
        this.beamHeat = Math.max(0, this.beamHeat - this.coolRate * dt);
        if(this.beamHeat <= 0) this.overheated = false; // 热散尽了就解除锁定（扫射中也能顺手解锁）
      }
      this.beamStops = []; this.beamAngs = []; this.beamLens = []; this.beamLen = 0;
      return;
    }
    this.beamRange = this.beamFullRange(); // 🔆 射程=全屏（每帧刷新：视野扩大时世界等比放大，射程同系数）
    // 过热锁定：强制散热，冷到 0 才能重新照射
    if(this.overheated){
      this.beamHeat -= this.coolRate * dt;
      if(this.beamHeat <= 0){ this.beamHeat = 0; this.overheated = false; }
      return;
    }
    const target = firing ? this.pickBeamTarget() : null;
    if(!target){ // 没目标：光束关闭，余热慢慢散掉
      if(this.beamHeat > 0) this.beamHeat = Math.max(0, this.beamHeat - this.coolRate * dt);
      return;
    }
    this.beamHeat += this.heatRate * dt;
    // 主光束方向 = 指向锁定目标；🔱分光棱镜：左右交替偏 0.28rad（第 3、4 束偏得更开）
    const a0 = Math.atan2(target.y - this.y, target.x - this.x);
    const angs = [a0];
    for(let i=0;i<this.beamForks;i++){
      const k = Math.floor(i/2) + 1;
      angs.push(a0 + (i % 2 === 0 ? 1 : -1) * 0.28 * k);
    }
    // 🚫 光路截断：每道光束各自算到「墙 或 第一个敌人」的距离（不穿透）；绘制与判定用同一长度
    const stops = this.beamCast(angs);
    this.beamStops = stops; // 绘制要用（命中点亮斑 / 每束长度）
    this.beamAngs = angs;
    this.beamLens = stops.map(s => s.len);
    this.beamLen = this.beamLens[0] || 0;
    this.beamOn = true;
    SND.aLaser(); // 🎭 激光专属攻击音：光束在响（起照"啾"一声，持续照射每 0.24 秒一记电子滋滋）
    // 过热：这一刻触发 💥过载爆发（学了才有）——过热不再是纯惩罚
    if(this.beamHeat >= this.heatMax){
      this.beamHeat = this.heatMax;
      this.overheated = true;
      this.beamOn = false;
      if(this.skills.l_over > 0){
        const lv = this.skills.l_over;
        spawnExplosion(this.x, this.y, [0, 90, 130, 170][lv], Math.round(this.beamDps * roarMul(this) * [0, 1.5, 2, 2.5][lv]), this.seat); // 🔆 过载爆发=远程来源
        G.screenShake = Math.max(G.screenShake || 0, 9);
        SND.bossWarn();
      }
      return;
    }
    // ③ 烧弹幕：每秒最多 3 发（配额按时间累积并封顶，不会攒着一次烧一片）
    //    弹幕不挡光，但只有落在「光束够得到的那些线段」里才会被烧（🔮反射后每段各烧各的）
    this.beamCut = Math.min(3, this.beamCut + dt * 3);
    if(this.beamCut >= 1){
      for(const s of stops){
        for(let i = 0; i < s.segs.length && this.beamCut >= 1; i++){
          const o = s.path[i];
          const dx = Math.cos(s.segs[i]), dy = Math.sin(s.segs[i]);
          const maxLen = s.lens[i];
          for(const e of G.enemies){
            if(this.beamCut < 1) break;
            if(e.dead || !e.isBullet) continue;
            const t = rayCircleHit(o.x, o.y, dx, dy, e.x, e.y, e.r + this.beamWidth);
            if(t === null || t > maxLen) continue;
            this.beamCut -= 1;
            e.dead = true;
            spawnParticles(e.x, e.y, '#f0a6ff', 4);
            SND.shieldBlock();
          }
        }
      }
    }
    // ② 伤害节拍：0.12s 一跳（子弹是"一发一次"，光束是"DPS×时间"，用节拍避免逐帧刷特效/跳字）
    this.beamAcc += dt;
    if(this.beamAcc < 0.12) return;
    const tickDt = this.beamAcc; this.beamAcc = 0;
    // 🚫不穿透 / 🔮棱镜反射：按折线依次结算命中（多束命中同一敌人只算一次；反射段伤害 ×0.6）
    const PRISM_MUL = 0.6;
    const hitted = [];
    for(const s of stops){
      for(let k = 0; k < s.hits.length; k++){
        const e = s.hits[k];
        if(hitted.some(h => h.e === e)) continue;
        hitted.push({ e, mul: k === 0 ? 1 : PRISM_MUL });
      }
    }
    const chained = [];
    for(const { e, mul } of hitted){
      if(e.dead || e.invincible) continue;
      let dmg = this.beamDps * roarMul(this) * tickDt * mul * CM().dmgMul;
      let crit = false;
      if(critLv > 0 && Math.random() < critLv / 5){
        dmg *= (2.0 + critLv / 5);
        crit = true;
      }
      // 光束暴击只加伤、不传 isCrit：逐帧判定的光束若也施加 0.5s 眩晕，会把敌人永久定住
      e.takeDamage(Math.max(1, Math.round(dmg)), crit ? '#f60' : '#f0a6ff', false, this.seat);
      e.lastHitIdx = owner;
      if(!e.dead && burnLv > 0){ // 🔥 灼烧：与烈焰斩/灼烧弹同一套着火系统
        e.burnT = 3; e.burnStacks = Math.min((e.burnStacks||0) + 1, burnLv);
        e.burnDps = 4*burnLv*e.burnStacks; e.burnTick = 0; e.burnIdx = owner;
      }
      if(!e.dead && slowLv > 0){ // 🕸️ 迟滞：离开光束 1 秒后自动恢复（按绝对时间判定，无需逐帧维护计时器）
        e.laserSlowUntil = G.time + 1;
        e.laserSlowMul = 1 - 0.2*slowLv;
      }
      if(!e.dead && chainLv > 0 && !chained.includes(e) && (e.beamChainT || 0) <= G.time){ // ⚡ 电弧：同一敌人 0.45s 一次
        e.beamChainT = G.time + 0.45;
        chained.push(e);
        let from = e;
        for(let hop = 0; hop < chainLv; hop++){
          let next = null, nd = (120 + 50*chainLv) * visionZoom(); // 链距随视野等比缩小
          for(const t of G.enemies){
            if(t.dead || t.isBullet || t.invincible || chained.includes(t) || t === from) continue;
            const d2 = dist(from, t);
            if(d2 < nd){ nd = d2; next = t; }
          }
          if(!next) break;
          next.takeDamage(Math.max(1, Math.round(this.beamDps * roarMul(this) * 0.5 * CM().dmgMul)), '#8ef', false, this.seat);
          next.lastHitIdx = owner;
          G.effects.push({ type:'zap', x1:from.x, y1:from.y, x2:next.x, y2:next.y, life:0.15, max:0.15 });
          chained.push(next);
          from = next;
        }
      }
    }
  }
  // ================= 🔆 激光主动技能「旋转扫射」（🖱 左键单击 / 手柄RB） =================
  // 参考棱光穹主的旋转光环：6 道等角光束整体自转，光束穿人穿怪（只在屏幕边缘停），
  // 转到的怪就吃伤害 —— 全向覆盖的"扫场"牌。持续 3 秒，期间主光束熄灭（顺带散热）。
  // 判定用「本帧扫过的扇区」而不是"当前瞬间那一条线"：转速再快也不会从敌人身上漏过去。
  updateLaserUlt(dt){
    if(this.laserUltFx > 0) this.laserUltFx -= dt;
    if(this.laserUltCD > 0) this.laserUltCD -= dt;
    if(this.laserUltT > 0){ // 扫射进行中：只持续推进（不可打断，眩晕也只是停转不消失）
      if(this.stun > 0 || this.dead || G.state !== 'playing'){
        this.laserUltT = Math.max(0, this.laserUltT - dt); // 被控/结算中照常走完，避免卡住
        return;
      }
      this.laserUltT -= dt;
      this.laserUltA0 = this.laserUltA;
      this.laserUltA += this.laserUltSpin * dt; // 自转
      this.applyLaserUlt(dt);
      if(this.laserUltT < 0) this.laserUltT = 0;
      return;
    }
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.laserUltCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.aiLaserUltWorth()) return; // AI 不空放：身边怪够多、或有 Boss 在射程内才转
    } else if(!fire) return; // 与爆破/龙卷风/剑士/射手共用「主动技能键」
    this.castLaserUlt();
  }
  // AI 判断：身边 320px 内 ≥2 只怪，或 520px 内有 Boss → 值得转（与剑士/射手同一个"别攒大招"口径）
  aiLaserUltWorth(){
    let n = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(e.isBoss){ if(d <= 520) return true; continue; }
      if(d <= 320) n++;
    }
    return n >= 2;
  }
  castLaserUlt(){
    this.laserUltT = this.laserUltDur;
    this.laserUltCD = this.laserUltCDMax;
    this.laserUltA = angleTo(this, this.aimPoint()); // 从当前朝向起步（正对鼠标的光束先扫出去）
    this.laserUltA0 = this.laserUltA;
    // 每秒伤害：与主光束同源（🔆功率提升 / 🎡光轮增幅都能抬它）
    this.laserUltDps = Math.max(1, Math.round(this.beamDps * roarMul(this) * 2.5 * (this.laserUltAmp || 1) * CM().dmgMul));
    this.laserUltAcc = 0;     // 伤害节拍从 0 起算：起手后 0.12 秒第一跳（tickDt 不会虚高）
    this.laserUltCut = 6;     // 烧弹幕配额
    this.laserUltFx = 0.4;
    SND.laserUlt();
    spawnParticles(this.x, this.y, '#f0a6ff', 14);
  }
  // 6 道光束的当前角度（等角分布 + 整体自转）
  laserUltAngs(){
    const n = Math.max(1, this.laserUltBeams);
    const out = [];
    for(let i = 0; i < n; i++) out.push(this.laserUltA + i / n * Math.PI * 2);
    return out;
  }
  // 光束打到屏幕边缘的距离（与棱光穹主 beamLenAt 同一套：只按墙截断，穿人穿怪）
  rayToWall(ang){
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let len = Infinity;
    if(dx >  1e-6) len = Math.min(len, (WW() - this.x) / dx);
    if(dx < -1e-6) len = Math.min(len, -this.x / dx);
    if(dy >  1e-6) len = Math.min(len, (WH() - this.y) / dy);
    if(dy < -1e-6) len = Math.min(len, -this.y / dy);
    return isFinite(len) ? Math.max(0, len) : 1500;
  }
  // 扫射结算：① 顺路烧掉敌方弹幕（配额 6/秒）② 每 0.12 秒对「本帧扫过扇区」里的敌人结算一跳
  //   扇区口径：每道光束这一帧从 A0 扫到 A（扫过 D 弧度），加上光束自身宽度 → 半宽 = D/2 + 角度宽
  //   因为 6 道光束等角分布，只需把目标的方位角按 2π/n 折回到"最近那道光束"上比较一次即可
  applyLaserUlt(dt){
    if(!(dt > 0)) return;
    const n = Math.max(1, this.laserUltBeams);
    const step = Math.PI * 2 / n;
    const D = Math.abs(this.laserUltA - this.laserUltA0);
    const mid = (this.laserUltA + this.laserUltA0) / 2; // 本帧扫区的中心角
    const Wd = this.beamWidth;
    // ① 烧弹幕
    this.laserUltCut = Math.min(6, (this.laserUltCut || 0) + dt * 6);
    if(this.laserUltCut >= 1){
      const angs = this.laserUltAngs();
      outer:
      for(const e of G.enemies){
        if(e.dead || !e.isBullet) continue;
        for(const a of angs){
          const t = rayCircleHit(this.x, this.y, Math.cos(a), Math.sin(a), e.x, e.y, e.r + Wd);
          if(t !== null && t <= this.rayToWall(a)){
            this.laserUltCut -= 1;
            e.dead = true;
            spawnParticles(e.x, e.y, '#f0a6ff', 4);
            SND.shieldBlock();
            if(this.laserUltCut < 1) break outer;
            break;
          }
        }
      }
    }
    // ② 伤害节拍（0.12s 一跳，与主光束同口径）
    this.laserUltAcc += dt;
    if(this.laserUltAcc < 0.12) return;
    const tickDt = this.laserUltAcc; this.laserUltAcc = 0;
    const dmg = Math.max(1, Math.round(this.laserUltDps * tickDt));
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      const halfArc = Math.asin(clamp((e.r + Wd) / Math.max(1, d), 0, 1)); // 目标在角度上占的半宽
      let rel = (Math.atan2(e.y - this.y, e.x - this.x) - mid) % step;
      if(rel >  step/2) rel -= step;
      if(rel < -step/2) rel += step;
      if(Math.abs(rel) > D/2 + halfArc) continue; // 本帧没扫到它
      e.takeDamage(dmg, '#f0a6ff', false, this.seat);
      e.lastHitIdx = this.seat;
    }
  }
  // 🔆 激光体色 = 热量计：冷 → 亮紫 #d9a6ff；照射积热 → 越来越红；散热时褪回亮紫。
  //    过热锁定期间额外做红白闪烁（提示"现在照不了"），替代原来那圈热量环。
  laserBodyColor(){
    const heat = clamp(this.beamHeat / (this.heatMax || 1), 0, 1);
    const pulse = this.overheated ? (0.5 + 0.5 * Math.sin(G.time * 14)) : 0;
    const r = Math.round(217 + 38 * heat + 0 * pulse);
    const g = Math.round(166 - 106 * heat + 70 * pulse);
    const b = Math.round(255 - 195 * heat + 70 * pulse);
    return `rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`;
  }
  shoot(){
    if(this.isSpring) return; // 🥊 弹簧：普攻是手动蓄力拳（castSpringPunch），永不进通用射击/挥砍（双保险）
    if(this.isKetchup) return; // 🍅 番茄酱之神：普攻走 updateKetchup（捏爆铺酱），永不进通用射击（双保险）
    if(this.isBard) return this.playWave(); // 🎻 吟游诗人：普攻 = 拨弦发出一道穿透音波
    if(this.melee) return this.slash(); // 🗡 剑士 / 🦇 吸血鬼：以挥砍替代射击（同一套攻击节奏/CD）
    if(this.isMage) return this.castMagic(); // 🔮 魔法师：放「法术轮盘」当前选中的那个（火 / 冰 / 土，右键切换）
    if(this.isStone) return this.pickPoke(); // 🪨 投石：普攻是「拾取器」贴身一戳（投石走的是捡石→装填→自动抛，不走普攻）
    if(this.isBoomerang) return this.throwBoomerang(); // 🪃 回旋镖：扔出去的镖会飞回来（去程+回程各打一次）
    if(this.isCardmaster) return this.shootCards(); // 🃏 卡牌大师：抽 5 张牌 → 5 枚卡牌弹丸（倍率/王炸）
    SND.heroAtk(this.atkSndKind()); // 🎭 普攻音效按角色分发：🏹射手=原 shoot() / 💣爆破=闷弹 / 🧪毒液=喷吐
    const aim = this.aimPoint(); // 2P/3P 朝各自光标射击，1P 朝鼠标（视野缩放时换算世界坐标）
    const a = angleTo(this, aim);
    for(let i=0;i<this.multishot;i++){
      const spread = (i-(this.multishot-1)/2) * 0.12;
      const ang = a + spread;
      // 🧪 毒液：每射满 venomEvery（默认 5）发子弹，这一发就变成「毒液弹」——
      //    绿色子弹，飞出场地或命中敌人时在落点留下一小滩毒液领域（见 dropVenom / spawnVenomPool）。
      //    口径：按"子弹发数"计数（多重射击一次射 3 发就算 3 发），逐发判定，不按射击次数。
      let venom = null;
      if(this.isVenom){
        this.venomCount = (this.venomCount || 0) + 1;
        if(this.venomCount >= this.venomEvery){
          this.venomCount = 0;
          venom = {
            r: this.venR, dur: this.venDur, tick: this.venTick,
            dmg: Math.max(1, Math.round(this.venDmg * roarMul(this) * CM().dmgMul)), // 挑战模式伤害修正
            slow: this.venSlow,
          };
          this.venFx = 0.25;
        }
      }
      G.bullets.push(new Bullet(
        this.x, this.y, Math.cos(ang)*this.bulletSpd, Math.sin(ang)*this.bulletSpd,
        this.bulletDmg * roarMul(this) * CM().dmgMul, this.bulletR, this.pierce, this.explosive, this.homing,
        this.seat, this.skills.crit || 0, // 记录归属玩家（座位号）与暴击等级（多人结算用）
        venom // 🧪 第 12 参：毒液弹的领域参数（非毒液弹为 null）
      ));
    }
  }
  // ================= 🃏 卡牌大师：普攻「抽牌」 =================
  // 每次出手从 54 张牌随机抽 5 张，逐张变一枚卡牌弹丸（小扇形扇出）：
  //   基础伤害 = 牌面点数（3..15）；同点数 2/3/4 张 → 该组每张 ×2/×3/×4；双王（王炸）→ 全牌秒杀。
  //   王炸那几张牌：无限穿透（命中不消耗、不消失）+ 大范围秒杀爆炸（范围内一切连同 Boss 归零）。
  //   顺子（5 张连续）额外加伤（「顺子」技能强化）。命中即按各牌伤害结算。
  shootCards(){
    // 🎭 普攻音效在 shootCards 内分发（卡牌翻牌声）
    SND.heroAtk(this.atkSndKind());
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const hand = cmDealHand();
    this.lastHand = hand; // 供手牌特效 / 调试读取
    const sc = cmScoreHand(this, hand);
    const fx = cmHandFx(hand);                                        // 🃏 对子→连锁闪电 / 炸→每张牌爆炸
    this.cmPairZapped = false; // 对子连锁闪电每手只触发一次
    const spd = this.bulletSpd;
    const n = hand.length;
    for(let i = 0; i < n; i++){
      const spread = (i - (n - 1) / 2) * 0.10; // 5 张小扇形（±0.2rad 内）
      const ang = a + spread;
      const b = new Bullet(
        this.x, this.y, Math.cos(ang) * spd, Math.sin(ang) * spd,
        Math.max(1, Math.round(sc.perCard[i] * roarMul(this) * CM().dmgMul)), this.bulletR, this.pierce, 0, 0,
        this.seat, this.skills.crit || 0, null
      );
      b.cardVal = hand[i].joker ? 0 : hand[i].rank;
      b.cardSuit = hand[i].suit;
      b.cardJoker = hand[i].joker;
      b.instakill = sc.instakill;
      b.cmRoyal = sc.instakill; // 🃏 王炸那几张牌：无限穿透 + 大范围秒杀爆炸
      b.cardFx = 0.35;
      b.cmPair = fx.pair;
      b.cmBomb = fx.bomb;
      G.bullets.push(b);
    }
    this.cmHandFx = 1.5; // 出手瞬间在身前亮一手牌（1.5 秒，够看清牌面；跟随玩家移动）
    G.effects.push({ type:'cardhand', x:this.x, y:this.y, hand, instakill:sc.instakill, straight:sc.straight, life:1.5, max:1.5, seat:this.seat });
  }
  // ================= 🔮 魔法师：法术轮盘普攻（火 / 冰 / 土，手动切换） =================
  // 🎛 2026-10-08 用户定：**取消随机施法** —— 法术由 🖱 右键单击 / 手柄 LB 手动循环切换（见 MAGE_SPELLS），
  //   普攻（自动出手，间隔 shootRate）放的就是**当前选中的那一个**。
  //   🔥 火球：低直伤弹，命中处爆炸 + 点燃灼烧（初始伤害低，靠灼烧/爆炸成长）· 永远可放
  //   ❄️ 冰霜：以**瞄准点**为中心的范围冻结 —— 圈内敌人定身且无法攻击 3 秒（Boss 抗性 1.5 秒）· 2.2s 冷却
  //   🪨 土墙：贴身立一堵**按次数抵挡**的掩体土墙（挡弹幕 + 顶怪，每次抵挡 -1 次，次数耗尽塌下）
  //       （不可叠加、30 秒冷却；不设血量）
  //   ⚠️ 选中的法术**冷却中 → 这一手哑火**（不出手、白等一个出手间隔）—— 这是"最吃操作"的核心。
  castMagic(){
    // 真人 = 自己切的那个；AI = 按场面自己挑（aiMagePick，同样只会挑"此刻放得出来"的）
    const pick = isAIPlayer(this) ? this.aiMagePick() : (this.mageSpell || 'fire');
    if(!mageSpellReady(this, pick)){ // 冷却中 → 哑火（shootCD 已在调用方扣掉，等于白等一手）
      this.mageDryFx = 0.32;
      this.mageFxType = pick; // 轮盘仍显示玩家选的是哪个（只暗下去，不改成别的）
      return false;
    }
    this.mageSpell = pick; // AI 也写回：轮盘/队友看到的就是它正在放的法术（视觉一致）
    this.mageFxType = pick;
    this.mageFx = 0.22;
    if(pick === 'fire') this.castFireMagic();
    else if(pick === 'frost') this.castFrostMagic();
    else this.castEarthMagic();
    return true;
  }
  // 🤖 AI 法术选择（确定性策略，不掷骰）：土墙挡贴身怪群/贴脸对手 → 冰霜圈住扎堆的怪 → 否则火球输出
  aiMagePick(){
    // 🪨 土墙优先：身边挤成一团（260px 内 ≥3 只）或 ⚔️对战里对手贴到 300px 内
    if(mageSpellReady(this, 'earth')){
      let near = 0;
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet) continue;
        if(dist(this, e) < 260) near++;
      }
      const foe = G.pvp ? (G.players || []).find(q => q && !q.dead && q.seat !== this.seat && dist(this, q) < 300) : null;
      if(near >= 3 || foe) return 'earth';
    }
    // ❄️ 冰霜其次：瞄准点圈内能罩到 ≥2 只（或场上有 Boss 且在 520px 内）
    if(mageSpellReady(this, 'frost')){
      const c = this.aimPoint();
      let inR = 0;
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet) continue;
        if(dist(c, e) <= this.frostR + (e.r || 0)) inR++;
      }
      if(inR >= 2 || G.enemies.some(e => e.isBoss && !e.dead && dist(this, e) < 520)) return 'frost';
    }
    return 'fire';
  }
  // 🔮 法术轮盘切换（每帧调用）：🖱 右键（1P）/ 手柄 LB（2P·3P真人）→ 下一个法术，循环
  updateMageSpellSkill(dt){
    if(this.mageSwitchFx > 0) this.mageSwitchFx -= dt;
    if(this.mageDryFx > 0) this.mageDryFx -= dt;
    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(isAIPlayer(this)) return; // AI 不看输入（各自走 aiMagePick）
    if(!mageCyclePressed(this.seat)) return;
    this.mageSpell = nextMageSpell(this.mageSpell);
    this.mageSpellUsed = true; // 切过一次 → 收起「右键切换」操作提示
    this.mageSwitchFx = 0.3;
    this.mageDryFx = 0;        // 切过来就清掉上一手的哑火灰烟，免得误读成"这个也放不出来"
    SND.mageSwitch();
  }
  // 🔥 火球：低直伤 + 命中爆炸（复用 Bullet 的 explosive 口径）+ 点燃（复用灼烧系统）
  castFireMagic(){
    SND.aMage('fire'); // 🎭 火球＝爆燃声（角色专属）
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    for(let i=0;i<this.multishot;i++){
      const spread = (i-(this.multishot-1)/2) * 0.12;
      const ang = a + spread;
      const b = new Bullet(
        this.x, this.y, Math.cos(ang)*this.bulletSpd, Math.sin(ang)*this.bulletSpd,
        this.fireDmg * roarMul(this) * CM().dmgMul * this.manaDmgMul(), this.bulletR + 3, this.pierce, this.fireBlast, this.homing,
        this.seat, this.skills.crit || 0,
        null // 不是毒液弹
      );
      b.fireBall = true; // 🔥 火球标记（绘制走火焰配色）
      b.fireBurn = { t: this.fireBurnT, dps: this.fireBurnDps }; // 命中点燃参数
      G.bullets.push(b);
    }
  }
  // ❄️ 冰霜：以瞄准点为中心，圈内敌人全部冻结（定身 + 无法攻击）
  castFrostMagic(){
    const FROST_PLAYER_GAP = 3; // ⚔️ 对玩家：冻完（1.5s）再隔 3 秒才能被再冻 —— 连控保护窗口
    this.frostCd = this.frostCdMax; // ❄️ 冰霜冷却：取消随机后必须显式限（否则一直选冰霜就能无限冻怪）
    SND.aMage('frost'); // 🎭 冰霜＝结晶脆响（角色专属）
    const raw = this.aimPoint();
    const cx = clamp(raw.x, 0, WW()), cy = clamp(raw.y, 0, WH());
    const R = this.frostR;
    this.frostX = cx; this.frostY = cy; this.frostHits = 0;
    G.effects.push({ type:'frost', x:cx, y:cy, r:R, life:0.55, max:0.55 });
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue;
      if(dist({ x:cx, y:cy }, e) > R + e.r) continue;
      const dur = e.isBoss ? this.frostBossDur : this.frostDur; // Boss 抗性：只冻 1.5 秒
      if(e.isBoss){
        // 🧊 Boss 专属口径（2026-10-06 用户定）：**只禁移动，不禁止攻击** —— 冻住脚、冻不住嘴
        //    靠 rooted 定身（主循环回滚位移），出招/弹幕/范围技照常推进；1.5 秒的"禁锢窗口"而不是"木桩"
        e.rooted = Math.max(e.rooted || 0, dur);
      } else {
        e.stun = Math.max(e.stun || 0, dur); // 小怪：完全冻结（复用眩晕定身：不移动、不攻击）
      }
      e.frozen = dur;                        // ❄️ 冰冻标记：绘制冰壳（与暴击眩晕的星星区分）
      e.frozenMax = dur;
      this.frostHits++;
    }
    // ❄️ ⚔️ 对战：对手玩家也会被冻住（2026-10-08 用户定：能冻玩家，但**取消连控玩家的能力**；怪依旧可连控）
    //     · 免疫窗（frostImmune）内再中冰霜直接无视 —— 冻 1.5 秒 + 窗口 3 秒，想靠手速连冻锁死对手没门
    //     · 🚜 战车免控口径照旧：车内一律不冻；合作模式（含 AI 队友/联机）不冻队友
    if(G.pvp){
      for(const p of G.players){
        if(!p || p.dead || p.veh || p.seat === this.seat) continue;
        if(dist({ x:cx, y:cy }, p) > R + p.r) continue;
        if(p.frostImmune > 0) continue;      // 🛡 连控保护：免疫窗内冻不住
        const dur = this.frostBossDur;       // 玩家抗性与 Boss 同档：只冻 1.5 秒（比怪短，防锁死）
        p.stun = Math.max(p.stun || 0, dur);
        p.frozen = dur; p.frozenMax = dur;
        p.frostImmune = dur + FROST_PLAYER_GAP; // 冻结结束后还要再隔 3 秒才能被再冻
        this.frostHits++;
      }
    }
  }
  // ═══════════ 🪨 土墙掩体（魔法师「土盾」→ 掩体版）═══════════
  // 与旧版「自身护盾池」的区别：不再是贴在身上的第二层血，而是**立在身前的实体障碍**
  //   ① 敌方弹幕撞墙即碎，消耗 1 次 —— 挡弹幕
  //   ② 扑过来的怪被顶在墙外表面（怪一直挤墙则每 0.5 秒扣 1 次）—— 挡怪的伤害
  //   ③ 次数耗尽 → 塌下（0.6 秒坠地扬尘）→ 消失；不可叠加（同时最多一堵）、30 秒冷却
  //   ⚠️ 口径（2026-10-06 用户定）：**只算次数，不设血量** —— 挨一下算一次，弱弹与重击一视同仁
  castEarthMagic(){
    const a = angleTo(this, this.aimPoint());
    const off = this.r + WALL_THICK/2 + 6; // 贴身：与角色留一点缝（不与玩家重叠，也不给怪留钻过去的空档）
    const cx = clamp(this.x + Math.cos(a)*off, 30, Math.max(30, WW()-30));
    const cy = clamp(this.y + Math.sin(a)*off, 30, Math.max(30, WH()-30));
    if(!G.walls) G.walls = [];
    G.walls.forEach(w => { if(w.seat === this.seat && !w.dead && w.fall <= 0) w.fall = WALL_FALL_T; }); // 不可叠加：旧墙开始塌（0.6 秒后消失）
    G.walls.push({
      seat: this.seat, x: cx, y: cy, ang: a,
      halfLen: WALL_LEN/2, thick: WALL_THICK,
      hits: this.wallHits, maxHits: this.wallHits,
      born: WALL_BORN_T, fall: 0, hitFx: 0, hurtCd: 0, // hurtCd：怪顶墙的扣次数节流（0.5 秒一次）
    });
    this.wallCd = this.wallCdMax;
    this.wallFx = 0.4;
    SND.aMage('earth'); // 🎭 土墙＝落石闷响（角色专属，取代原来的通用护盾音）
    spawnParticles(cx, cy, '#c9a86a', 12);
  }
  // ================= 💣 爆破角色：主动技能「轰炸区」 =================
  // 输入：1P = 🖱 鼠标左键单击（键盘空格已取消）或手柄 RB（按键 5）；2P/3P 真人 = 手柄 RB；AI 座位 = 自动找敌人最密处投放
  // 规则：按下的一瞬投放（不是按住持续），冷却好才生效；同时最多存在 4 个轰炸区
  // 判定：炮弹落地时才结算伤害，落地前有 0.42 秒落点预警圈（玩家和敌人都有机会躲）
  updateBombSkill(dt){
    if(this.bombFx > 0) this.bombFx -= dt;
    if(this.bombCD > 0) this.bombCD -= dt;
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.bombCD > 0) return;
    if(isAIPlayer(this)){
      const t = this.aiBombTarget();
      if(!t) return; // AI 不浪费：没有值得炸的点就不投
      const c = cursorOf(this.seat); if(c){ c.x = t.x; c.y = t.y; } // AI 光标跟投放点（视觉一致）
    } else if(!fire) return;
    this.castBombZone();
  }
  // AI 选点：附近 700px 内「敌人最密集」的位置（Boss 权重更高）；太稀疏就不值得投
  aiBombTarget(){
    let best = null, bestScore = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(dist(this, e) > 700) continue;
      let score = e.isBoss ? 1 : 0;
      for(const o of G.enemies){
        if(o.dead || o.dying || o.isBullet) continue;
        if(dist(e, o) < 160) score += (o.isBoss ? 3 : 1);
      }
      if(score > bestScore){ bestScore = score; best = e; }
    }
    return bestScore >= 3 ? best : null; // 至少 3 个目标挤在一起（或 1 只 Boss + 2 只）才投
  }
  // 投放：以瞄准点（1P 鼠标 / 2P·3P 光标）为中心生成轰炸区，交给 updateBombZones 推进
  castBombZone(){
    const p = pCM(this);
    if(!G.bombZones) G.bombZones = [];
    if(G.bombZones.length >= 4) G.bombZones.shift(); // 超上限先顶掉最老的（高冷却缩减下防堆积）
    // 🎯 圆心 = 瞄准点（1P 鼠标 / 2P·3P 手柄光标 / AI 光标），**严格指哪打哪，永不吸附到怪身上**。
    //    ⚠️ 历史上出现过两种"以怪为中心"的写法，均已废弃（用户明确：爆破是以鼠标为中心点）：
    //       ① 锁「离玩家最近的敌人」→ 只要场上有怪就顶掉鼠标点；追着玩家咬的贴身怪总在
    //          「玩家刚走过的位置」，于是圈看着像落在鼠标半秒前的地方。
    //       ② "瞄准点附近有怪（≤ 轰炸区半径）就吸附到那只怪身上" → 圆心仍会偏离鼠标，
    //          想炸的地方被挪走半格，手感像"不跟手"。
    //    AI 同样走这条：它在 updateBombSkill 里先把光标移到「怪最密集」的点，再照常投放。
    const aim = this.aimPoint();
    const x = clamp(aim.x, 0, WW()), y = clamp(aim.y, 0, WH());
    G.bombZones.push({
      seat: this.seat, x, y,
      r: this.bombZoneR, life: this.bombDur, max: this.bombDur,
      every: this.bombDropEvery, next: 0.18,
      dmg: Math.max(1, Math.round(this.bombDmg * roarMul(this) * p.dmgMul)), // 挑战模式伤害修正
      blast: this.bombBlastR, warn: this.bombWarn, bombs: [],
      stun: this.bombStun || 0,       // 💫 震荡弹：爆炸眩晕时长（0=未学）
      cluster: this.bombCluster || 0, // ✳️ 集束弹：落地额外散出的小弹数（0=未学）
      burn: this.bombBurn || 0,       // 🔥 燃烧弹：弹坑火海每跳伤害（0=未学）
    });
    this.bombCD = this.bombCDMax;
    this.bombFx = 0.35;
    SND.charge();
    spawnParticles(x, y, '#ffd166', 8);
  }
  // ================= 🧹 魔法师：主动技能「扫帚飞行」 =================
  // 输入：1P = 🖱 鼠标左键单击（或手柄 RB）；2P/3P 真人 = 手柄 RB；AI 座位 = 被围/残血时自救
  // 效果：10 秒内移速 ×3（速度那条乘数在 Player.update 的 spd 一行）
  // 冷却：按下即进冷却（30 秒）——不是"飞完才开始算"，否则实际空档变成 40 秒
  // 注意：飞行期间照样能攻击（不是无敌、不是位移技，纯粹"跑得快"）
  updateBroomSkill(dt){
    if(!this.isMage) return; // 只有魔法师骑扫帚（其他人也有字段，但不该响应左键）
    if(this.broomFx > 0) this.broomFx -= dt;
    if(this.broomLandFx > 0) this.broomLandFx -= dt;
    if(this.broomCD > 0) this.broomCD = Math.max(0, this.broomCD - dt); // 钳到 0：冷却完就是整 0，不残留小负数
    if(this.broomT > 0){
      this.broomT -= dt;
      if(this.broomT <= 0){ this.broomT = 0; this.broomLandFx = 0.4; } // 飞行结束：落地扬尘
      else this.emitBroomTrail(dt);                                   // 🧹💨 飞行中：一路留尾迹
    }
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.broomCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.aiBroomWorth()) return; // AI 不空放：没被围、血还厚就先留着
    } else if(!fire) return;
    this.castBroomFly();
  }
  // AI 值不值得起飞：被围（近身 200px 内 ≥3 个目标）或残血（<45%）—— 扫帚是跑路技，不是输出技
  //   ⚔️ 对战模式：目标换成对手玩家，另外「离对手太远」时也飞一次赶场
  aiBroomWorth(){
    if(this.hp < this.maxHp * 0.45) return true;
    const list = targetsFor(this.seat);
    if(!list || !list.length) return false;
    let n = 0;
    for(const e of list){
      if(!e || e.dead || e.dying || e.isBullet) continue;
      if(dist(this, e) < 200){ n++; if(n >= 3) return true; }
    }
    if(G.pvp){
      const o = list.find(q => q && !q.dead);
      if(o && dist(this, o) > 420) return true; // 对手拉太远 → 骑扫帚追上去
    }
    return false;
  }
  castBroomFly(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：魔法师放扫帚飞行消耗魔力（世界1/无资源为空操作）
    this.broomT = this.broomDur;      // 10 秒
    this.broomCD = this.broomCDMax;   // 30 秒（起飞即开始计冷却）
    this.broomFx = 0.45;
    this.broomTrailT = 0; this.broomWispT = 0; // 🧹💨 起飞立刻开始拉尾迹
    SND.charge();
    spawnParticles(this.x, this.y, '#c9a6ff', 14);
  }
  // 🧹💨 扫帚尾迹发射：每 ~0.03 秒在身下留一朵紫色光斑（带一段沿航线的拉丝），
  //    毛刷两端每 ~0.05 秒甩一颗金色火星。全部存进 G.broomTrail（世界坐标），
  //    主循环推进/淡出、drawBroomTrail 画在玩家层之下 —— 纯视觉，不参与任何判定。
  //    速度越快，光斑之间的间隔自然拉得越开（3 倍速 ≈ 3 倍间距），一眼看出"飞起来了"。
  emitBroomTrail(dt){
    const trail = G.broomTrail || (G.broomTrail = []);
    const put = (w) => { if(trail.length < 300) trail.push(w); }; // 上限：极端帧率下也不无限堆积
    const a = angleTo(this, this.aimPoint());       // 朝向（与本体朝向线同一口径）
    const bx = Math.PI/2, cx = Math.cos(a + bx), cy = Math.sin(a + bx); // 扫帚横着 = 与朝向垂直
    // 本帧实际位移（飞行中每帧移动量 ×3，用来给光斑拉丝定长度）
    const px = this._btPx, py = this._btPy;
    const move = (px === undefined) ? 0 : Math.hypot(this.x - px, this.y - py);
    this._btPx = this.x; this._btPy = this.y;
    const hue = this.seat === 1 ? 32 : (this.seat === 2 ? 140 : 268); // 座位色：1P 紫罗兰 / 2P 橙 / 3P 绿
    this.broomTrailT -= dt;
    if(this.broomTrailT <= 0){
      this.broomTrailT = 0.028;
      put({
        type: 'wisp',
        x: this.x, y: this.y + this.r * 0.5, a, hue,
        r: this.r * rand(0.5, 0.78),
        len: this.r * 0.55 + Math.min(this.r * 1.7, move * 0.9),
        life: 0.42, max: 0.42,
      });
    }
    this.broomWispT -= dt;
    if(this.broomWispT <= 0){
      this.broomWispT = 0.05;
      const side = Math.random() < 0.5 ? -1 : 1;    // 从扫帚头（毛刷端）甩出来
      const L = this.r * 1.85;
      put({
        type: 'spark',
        x: this.x + cx * side * L + rand(-4, 4), y: this.y + this.r * 0.5 + cy * side * L + rand(-4, 4),
        vx: -Math.cos(a) * rand(30, 80) + rand(-25, 25),
        vy: -Math.sin(a) * rand(30, 80) + rand(-25, 25),
        r: rand(1.4, 2.6), color: '#ffd77a',
        life: rand(0.26, 0.44), max: 0.44,
      });
    }
  }
  // ================= 🌀 龙卷风角色：主动技能「突进·龙卷风」 =================
  // 输入与爆破完全共用一套「主动技能键」判定（1P = 🖱 左键单击 / 手柄 RB；2P·3P 真人 = 手柄 RB；AI 座位自动选点）。
  // 按下的一瞬：先朝光标突进，落点生成一个龙卷风实体（G.tornadoes），后续推进交给 updateTornadoes：
  //   吸怪（持续拉向风眼）→ 风眼范围内持续伤害 → 风停瞬间向外击退。
  // 吸怪期间本体减伤 60%（tornadoGuardMul）——这是它敢冲进怪堆的资本（2026-10-10 从 80% 削下来）。
  updateTornadoSkill(dt){
    if(this.torFx > 0) this.torFx -= dt;
    if(this.torCD > 0) this.torCD -= dt;
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.torCD > 0) return;
    if(isAIPlayer(this)){
      const t = this.aiTornadoTarget();
      if(!t) return; // AI 不空放：附近没有值得卷的怪堆就不冲
      const c = cursorOf(this.seat); if(c){ c.x = t.x; c.y = t.y; } // AI 光标跟落点（视觉一致）
    } else if(!fire) return; // 与爆破共用「主动技能键」判定（🖱 左键单击 / 手柄RB）
    this.castTornado();
  }
  // AI 选点：附近 300px 内「敌人最密集」的位置（突进 220 + 风眼 150 够得着）；太稀疏就不值得冲
  aiTornadoTarget(){
    let best = null, bestScore = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(dist(this, e) > 300) continue;
      let score = e.isBoss ? 1 : 0;
      for(const o of G.enemies){
        if(o.dead || o.dying || o.isBullet) continue;
        if(dist(e, o) < 150) score += (o.isBoss ? 3 : 1);
      }
      if(score > bestScore){ bestScore = score; best = e; }
    }
    return bestScore >= 3 ? best : null; // 至少 3 个目标挤在一起（或 1 只 Boss + 2 只）才冲
  }
  // 突进 + 起风：光标近就冲到光标处，远了就冲到突进上限；风眼落在突进终点
  castTornado(){
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const d0 = clamp(dist(this, aim), 60, this.torDash); // 最少冲 60（光标贴脸时不至于原地起风）
    const tx = clamp(this.x + Math.cos(a)*d0, this.r, WW()-this.r);
    const ty = clamp(this.y + Math.sin(a)*d0, this.r, WH()-this.r);
    const dur = 0.18; // 突进时长：速度按位移反推，积分精确等于位移
    this.dashT = dur;
    this.dashVX = (tx - this.x)/dur;
    this.dashVY = (ty - this.y)/dur;
    const p = pCM(this);
    if(!G.tornadoes) G.tornadoes = [];
    if(G.tornadoes.length >= 3) G.tornadoes.shift(); // 同屏最多 3 个（高冷却缩减下防堆叠）
    G.tornadoes.push({
      seat: this.seat, x: tx, y: ty,
      r: this.torR, life: this.torDur, max: this.torDur,
      dmg: Math.max(1, Math.round(this.torDmg * roarMul(this) * p.dmgMul)), // 挑战模式伤害修正
      tick: this.torTick, next: 0.12,
      pull: this.torPull, knock: this.torKnock,
      spin: Math.random() < 0.5 ? -1 : 1, // 旋转方向随机（纯视觉变化）
    });
    this.torCD = this.torCDMax;
    this.torFx = 0.35;
    SND.charge();
    spawnParticles(tx, ty, '#8ef0ff', 10);
  }
  // 吸怪期间减伤：自己的任意一个龙卷风还在吸（life>0）就生效；风停即失效
  tornadoGuardMul(){
    if(!this.isTornado || !G.tornadoes || !G.tornadoes.length) return 0;
    for(const t of G.tornadoes) if(t.seat === this.seat && t.life > 0) return this.torGuard;
    return 0;
  }
  // ================= 🪨 投石三件套（第十角色，2026-10-07 新增）=================
  // ① 普攻「拾取器」：贴身低频低伤的一戳（空手时的防身手段，主输出永远是投石）
  // ② 捡石：走上去自动捡（不用按键）→ 1 秒装填 → 到点自动抛出（用户定：捡到石头等一秒自动扔）
  // ③ 超载：手里同时只能拿一块，装填期间踩到第二块 → 自伤 50（那块石头当场碎）
  pickPoke(){
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const half = this.pickArc || (32 * Math.PI/180);
    const R = this.pickRange || 76;
    const dmgBase = this.bulletDmg * pCM(this).dmgMul;
    const critLv = this.skills.crit || 0;
    let hitAny = false;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      const d = dist(this, e);
      if(d > R + e.r) continue;
      const ea = Math.atan2(e.y - this.y, e.x - this.x);
      const diff = Math.abs(((ea - a + Math.PI*3) % (Math.PI*2)) - Math.PI);
      if(diff > half) continue;
      let dmg = dmgBase, crit = false;
      if(critLv > 0 && Math.random() < critLv / 5){ dmg = dmgBase * (2.0 + critLv / 5); crit = true; }
      e.takeDamage(Math.max(1, Math.round(dmg * (e.isBoss ? 1.5 : 1))), crit ? '#f60' : '#ffd166', crit, this.seat);
      e.lastHitIdx = this.seat;
      // 轻推开一点：拾取器也是"把贴脸的怪扒拉开"的保命手段
      const kf = Math.max(60, Math.min(280, Math.round(3200 / Math.max(8, e.r))));
      e.kbx = Math.cos(ea) * kf; e.kby = Math.sin(ea) * kf;
      spawnParticles(e.x, e.y, '#ffd166', 3);
      hitAny = true;
    }
    if(G.pvp){ // ⚔️ 对战：拾取器同样能戳到对手玩家
      const n = pvpMeleeHit(this, this.x, this.y, a, half, R, dmgBase, '#ffd166', this);
      if(n > 0) hitAny = true;
    }
    SND.aStonePoke(); // 🎭 拾取器一戳：投石的专属音（比通用 shoot() 更"钝"）
    if(hitAny) SND.hit();
    return hitAny;
  }
  overloadHurt(n){ // 🪨 超载自伤：自己作的伤不吃无敌帧（否则连续踩石头就白嫖了），走正常死亡结算
    if(this.dead || this.hp <= 0) return 0;
    this.invuln = 0;
    // ⚠️ 顺序不能反（2026-10-07 修「DQ 没触发」）：takeDamage 扣空血时会**当场同步调 gameOver()**，
    //    而结算画面的 HTML 就是那一瞬间拼好的 —— 标记若写在 takeDamage **之后**，画面早就拼完了，
    //    永远读不到 → 实测彩蛋从来不出现。所以先挂「本次致死算超载」的临牌，再结算。
    this._dqCause = true;
    this.takeDamage(Math.max(1, Math.round(n)), null);
    this._dqCause = false;                                   // 挺过去了 → 摘牌
    if(this.dead || this.hp <= 0) this._dqByOverload = true; // 🏳️ 真的死于超载（试图双持）：落成永久标记
    return n;
  }
  throwStone(color){ // 🪨 抛出：**落点 = 鼠标指针**（2026-10-07 用户定稿）
                     //   ① 以鼠标指针为中心，绝不自动索敌
                     //   ② **射程 = 全屏**：扔多远由指针决定，没有距离上限，只有场地边界会钳住（原先 520 的上限已取消）
    const C = STONE_COLORS[color] || STONE_COLORS.yellow;
    const aim = this.aimPoint();
    const tx = clamp(aim.x, 8, WW() - 8);
    const ty = clamp(aim.y, 8, WH() - 8);
    G.stoneShots.push({ seat: this.seat, color, sx: this.x, sy: this.y, x: tx, y: ty,
                        t: 0, dur: STONE_FLY_T, arc: STONE_ARC,
                        splash: 18 * (this.skills.s_splash || 0), dead: false });
    this.stoneThrows = (this.stoneThrows || 0) + 1;
    SND.aStoneThrow(); // 🎭 掷石出手（低沉"呼"）
    return C;
  }
  updateStoneSkill(dt){ // 🪨 每帧：捡石 → 装填 → 到点自动抛出
    if(this.stoneOverFx > 0) this.stoneOverFx -= dt;
    if(this.stoneHitFx > 0) this.stoneHitFx -= dt;
    if(G.state !== 'playing' || this.dead) return; // 只有正式对局里才推进
    // ① 捡石（走上去自动捡；手里已经有 → 超载）
    if(G.stones && G.stones.length){
      let dirty = false;
      for(const st of G.stones){
        if(st.dead || st.born > 0) continue;
        if(Math.hypot(st.x - this.x, st.y - this.y) > this.stonePick + STONE_R) continue;
        st.dead = true; dirty = true;
        if(!this.stoneHold){
          this.stoneHold = { color: st.color };
          this.stoneLoadMax = Math.max(0.25, STONE_LOAD_T - 0.15 * (this.skills.s_load || 0)); // ⏱️ 快速装填
          this.stoneLoad = this.stoneLoadMax;
          SND.gem();
          spawnParticles(st.x, st.y, STONE_COLORS[st.color].body, 10);
        } else {
          const hurt = Math.max(10, STONE_OVERLOAD - 10 * (this.skills.s_hold || 0)); // 🧱 石袋加固
          this.overloadHurt(hurt);
          this.stoneOverFx = 0.5; // 🏳️ 只闪 0.5 秒（用户定：显示时长砍半）
          spawnParticles(st.x, st.y, '#ff4d4d', 14);
        }
      }
      if(dirty) G.stones = G.stones.filter(st => !st.dead);
    }
    // ② 装填 → 到 0 的那一帧自动抛出
    if(this.stoneHold){
      this.stoneLoad -= dt;
      if(this.stoneLoad <= 0){
        const held = this.stoneHold;
        this.stoneHold = null; this.stoneLoad = 0;
        this.throwStone(held.color);
      }
    }
  }
  // ================= ⚔️ 将军两条线（2026-10-06 拆分，用户定：冲刺 / 征召各走各的） =================
  // ① 🖱「冲刺」：鼠标左键单击（2P/3P 真人 = 手柄 RB）向光标突进，纯位移跑路，CD 5 秒。
  // ② 🪖「征召」：每 summonEvery 秒（默认 10s）**自动**召唤小兵，不需要撞怪、不占用冲刺键。
  //    小兵等级 = 自身等级÷2（向下取整，最低 1 级），存量受 minionCap 约束（超员最老离场）。
  updateGeneralSkill(dt){
    if(this.genFx > 0) this.genFx -= dt;
    if(this.sumFx > 0) this.sumFx -= dt;
    if(this.genCD > 0) this.genCD -= dt;
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && dashFirePressed(this.seat);

    if(this.dead || G.state !== 'playing') return;
    // ② 征召倒计时：到点自动出兵（不空放、看兵不看怪）
    this.summonT -= dt;
    if(this.summonT <= 0){
      this.summonT = this.summonEvery;
      this.summonMinions();
    }
    // ① 冲刺：晕住不能用（跑路技能，被控就不能跑才合理）
    if(this.stun > 0) return;
    if(this.genCD > 0) return;
    if(isAIPlayer(this)){
      const p = this.aiDashPoint();
      if(!p) return; // AI 不空放：没威胁也不拉近距离就不冲
      const c = cursorOf(this.seat); if(c){ c.x = p.x; c.y = p.y; } // AI 光标跟冲刺落点（视觉一致）
    } else if(!fire) return; // 🖱 1P 鼠标左键 / 2P·3P 手柄 RB
    this.castGeneralDash();
  }
  // AI 冲刺决策：残血被贴脸 → 朝反方向跑；离最近的怪还远（>160）→ 冲过去贴身开枪
  //   返回落点坐标；不满足条件返回 null（不空放）
  aiDashPoint(){
    const th = this.aiNearestThreat(520);
    if(!th) return null;
    const d = dist(this, th);
    const lowHp = this.hp / Math.max(1, this.maxHp) < 0.35;
    if(lowHp && d < 200){
      const a = angleTo(th, this); // 背离威胁的方向
      return { x: this.x + Math.cos(a) * this.genDash, y: this.y + Math.sin(a) * this.genDash };
    }
    if(d > 160) return { x: th.x, y: th.y }; // 拉近距离：冲过去开长枪
    return null;
  }
  // AI 视野内最近的威胁（半径 R 内的怪；含 Boss）
  aiNearestThreat(R){
    let best = null, nd = R === undefined ? 1e9 : R;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(d < nd){ nd = d; best = e; }
    }
    return best;
  }
  // 突进：光标近就冲到光标处，远了冲到上限（位移系统与龙卷风共用 dashT/dashVX/dashVY）
  castGeneralDash(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：将军冲刺消耗体力（世界1/无资源为空操作）
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const d0 = clamp(dist(this, aim), 60, this.genDash); // 最少冲 60（光标贴脸时不至于原地踏步）
    const dur = 0.18; // 突进时长：速度按位移反推，积分精确等于位移
    this.dashT = dur;
    this.dashVX = Math.cos(a) * d0 / dur;
    this.dashVY = Math.sin(a) * d0 / dur;
    this.genCD = this.genCDMax;
    this.genFx = 0.3;
    SND.charge();
    spawnParticles(this.x, this.y, '#e8c25a', 8);
  }
  // 召唤小兵：数量 = summonCount（征召令提升）；小兵等级 = 自身等级÷2（向下取整，最低 1）
  // 存量上限 minionCap 按「自己的小兵」算：超员时最老的离场（多座位互不挤占）
  summonMinions(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：将军征召小兵消耗体力（世界1/无资源为空操作）
    if(!G.minions) G.minions = [];
    const mlv = Math.max(1, Math.floor(this.lv / 2));
    const mine = () => G.minions.filter(m => m.owner === this.seat && !m.dead); // 排除刚标记离场的（防同帧连召死循环）
    while(mine().length + this.summonCount > this.minionCap){
      const oldest = mine()[0];
      if(!oldest) break;
      oldest.dead = true;
      spawnParticles(oldest.x, oldest.y, '#e8c25a', 6);
    }
    for(let i = 0; i < this.summonCount; i++){
      const a = Math.PI*2 * i / this.summonCount + Math.random()*0.6;
      G.minions.push(new Minion(this, this.x + Math.cos(a)*26, this.y + Math.sin(a)*26, mlv));
    }
    SND.summon();
    this.sumFx = 0.45; // ⚔️ 出兵瞬间：外圈征召环亮一下（冷却显示模块用）
    spawnParticles(this.x, this.y, '#ffd166', 12);
  }
  // ================= ⚡ 剑士主动技能「斩灭」（🖱 左键单击 / 手柄RB） =================
  // 判定范围：以「当前朝向」为中线，左右各 75°（总张角 150°）的扇形；半径 = 屏幕长边的 1/4。
  // 结算：扇形内**除 Boss 外的怪全部秒杀**（含冲锋无敌中的冲撞怪 —— 这是"斩灭"的牌面），
  //      Boss 免疫秒杀（连血都不掉，别指望用它白嫖 Boss）。代价是 60 秒冷却 → 清场保命牌。
  // 朝向来源：1P = 鼠标；2P/3P = 各自的手柄光标；AI 座位 = AI 光标（已指向最 threat 的目标）。
  // 🩸 豁免判定（"血线吸附版"遗留 · 当前一代设定下不再使用）：
  //   src 是否就是"正被血线吸着的那只怪"。因为一代没有血线，this.vampLinks 恒为空
  //   → 本函数恒返回 false → vampBlocked 恒为 false → 免伤永不触发（行为上完全等于一代）。
  vampLinked(src){
    if(!src) return false;
    const links = this.vampLinks;
    if(!links || !links.length) return false;
    for(const l of links){
      const e = l.e;
      if(!e || e.dead) continue;
      if(src === e) return true;                 // ① 这只怪本体（贴身接触 / 冲撞 / 近战）
      if(src.owner && src.owner === e) return true; // ② 它射出来的弹幕/粘液弹（工厂里挂了 owner）
    }
    // ③ Boss 的群体技（火雨/岩浆/火焰/黑洞/激光）没有逐发 owner，调用点统一把「当前 Boss」当来源传进来
    //    —— 命中这里说明 src 就是 G.boss，而 G.boss 就在 G.enemies 里，所以 ① 其实已经拦住了；留作兜底。
    if(src.isBoss && links.some(l => l.e === src)) return true;
    return false;
  }
  // ===== 🦇 吸血鬼：🖱 血月突袭（CD 6s）=====
  //   与将军「冲刺」的区别：将军是**纯位移跑路**（不造成伤害），血月突袭是**位移 + 伤害 + 吸血**三合一 ——
  //   朝光标瞬移一段距离，沿途被血刃划过的敌人吃 1.5× 爪击伤害，每一击都按嗜血回血。是位移也是输出。
  //   （血线吸附版已于 2026-10-06 按用户要求回退为一代 · 利爪挥砍版）
  updateVampireSkill(dt){
    if(this.vampFx > 0) this.vampFx -= dt;
    if(this.vampHealFx > 0) this.vampHealFx -= dt;
    if(this.vampCD > 0) this.vampCD -= dt;
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && dashFirePressed(this.seat);

    if(this.dead || G.state !== 'playing') return;
    if(this.stun > 0) return;   // 晕住不能用（位移技，被控就不能跑才合理）
    if(this.vampCD > 0) return;
    if(isAIPlayer(this)){
      const p = this.aiBloodDashPoint();
      if(!p) return;            // AI 不空放：没威胁也不拉近距离就不突
      const c = cursorOf(this.seat); if(c){ c.x = p.x; c.y = p.y; } // AI 光标跟落点（视觉一致）
    } else if(!fire) return;    // 🖱 1P 鼠标左键 / 2P·3P 手柄 RB
    this.castBloodDash();
  }
  // AI 血月突袭决策：残血被贴脸 → 朝反方向拉开（顺便切一刀吸血）；离最近的怪还远 → 冲过去贴脸撕
  aiBloodDashPoint(){
    const th = this.aiNearestThreat(560);
    if(!th) return null;
    const d = dist(this, th);
    const lowHp = this.hp / Math.max(1, this.maxHp) < 0.4;
    if(lowHp && d < 190){
      const a = angleTo(th, this); // 背离威胁
      return { x: this.x + Math.cos(a) * this.vampDash, y: this.y + Math.sin(a) * this.vampDash };
    }
    if(d > 150) return { x: th.x, y: th.y };
    return null;
  }
  castBloodDash(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：吸血鬼放血月突袭消耗魔力（世界1/无资源为空操作）
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const d0 = clamp(dist(this, aim), 80, this.vampDash); // 最少冲 80（光标贴脸时也要有位移）
    const dur = 0.13;                                     // 比将军更快（0.18 → 0.13）：血月是"闪"过去的
    const sx = this.x, sy = this.y;                       // 起点（特效要拉一条血痕）
    this.dashT = dur;
    this.dashVX = Math.cos(a) * d0 / dur;
    this.dashVY = Math.sin(a) * d0 / dur;
    this.vampCD = this.vampCDMax;
    this.vampFx = 0.32;
    this.invuln = Math.max(this.invuln, dur + 0.05);      // 突进帧无敌：高速穿过怪堆不会被卡住
    SND.bloodDash();
    // 沿途切击：轨迹线段 + 爪宽 的带状判定（判定与绘制同一系数 → 看得见的血痕就是打得中的范围）
    const ex = clamp(this.x + Math.cos(a) * d0, this.r, WW() - this.r);
    const ey = clamp(this.y + Math.sin(a) * d0, this.r, WH() - this.r);
    const band = this.slashRange * 1.15;
    const dmgBase = this.bulletDmg * roarMul(this) * CM().dmgMul * 1.5;   // 突袭单次 = 爪击 ×1.5（一次位移换一刀重击）
    let hits = 0, heal = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(ptSegDist(e.x, e.y, sx, sy, ex, ey) > band + (e.r || 0)) continue;
      let dmg = dmgBase, crit = false;
      const critLv = this.skills.crit || 0;
      if(critLv > 0 && Math.random() < critLv / 5){ dmg = dmgBase * (2.0 + critLv / 5); crit = true; }
      e.takeDamage(Math.round(dmg * (e.isBoss ? 1.5 : 1)), crit ? '#ff4d6d' : '#fff', crit, this.seat);
      e.lastHitIdx = this.seat;
      if(this.vampLeech > 0) heal += this.vampLeech;      // 🩸 沿途每一击都按嗜血回血
      hits++;
      spawnParticles(e.x, e.y, '#ff4d6d', 4);
    }
    // ⚔️ 对战：突袭掠过对手玩家也照常切击（线段判定，与敌人同一套 band 宽度）
    if(G.pvp){
      for(const q of G.players){
        if(!q || q.dead || q.seat === this.seat) continue;
        if(ptSegDist(q.x, q.y, sx, sy, ex, ey) > band + (q.r || 0)) continue;
        q.takeDamage(Math.max(1, Math.round(dmgBase * PVP_DMG_MUL)), '#ff8a8a');
        spawnParticles(q.x, q.y, '#ff6b6b', 4);
        hits++;
      }
    }
    this.vampDashHits = hits;
    const real = Math.min(heal, Math.max(0, this.maxHp - this.hp));
    this.vampDashHeal = real;
    if(real > 0){ this.hp += real; this.vampHealFx = 0.3; }
    G.effects.push({ type:'blooddash', x1:sx, y1:sy, x2:ex, y2:ey, w:band, life:0.26, max:0.26 });
    spawnParticles(sx, sy, '#ff4d6d', 10);
  }
  // ================= 🐣 新手：手滑计数 + 战吼 =================
  // 📣 主动技「战吼」（2026-10-08 用户定，原「尖叫」升级）：把身边的怪**吼退半步**（依然 0 伤害），
  //    同时给自己**和队友**打气 —— 3 秒内所有玩家的伤害 ×1.5（CD 12 秒；Boss 照旧几乎吼不动）。
  //    这就是新手的辅助价值：自己还是全员最弱，但队友吃着 ×1.5 的增益。
  updateRookieSkill(dt){
    if(this.rkCryFx > 0) this.rkCryFx = Math.max(0, this.rkCryFx - dt); // 钳零：浮点递减不留小负数
    if(this.rkMissFx > 0) this.rkMissFx = Math.max(0, this.rkMissFx - dt);
    if(this.rkCryCD > 0) this.rkCryCD = Math.max(0, this.rkCryCD - dt);
    if(this.rkTossFx > 0) this.rkTossFx = Math.max(0, this.rkTossFx - dt);
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat); // 与其它角色共用「主动技能键」（🖱左键 / RB）
    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    // 🤾 扔木棍（2026-10-09 用户定，学了 r_toss 才有）：**自动**丢，不需要按键 ——
    //    每 rkTossCDMax 秒朝自己周围随机位置甩一根（砸到怪不伤、落地变绊脚陷阱）
    if(this.skills && this.skills.r_toss){
      this.rkTossT -= dt;
      if(this.rkTossT <= 0){ this.rkTossT = this.rkTossCDMax || ROOKIE_TOSS_CD; this.tossStick(); }
    }
    if(this.rkCryCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.rkCryWorth()) return; // AI 不空喊：身边至少 2 只怪才叫
    } else if(!fire) return;
    this.castRookieCry();
  }
  // 🤾 扔木棍：朝**自己周围随机方向/距离**甩一根（不瞄准、不听指挥 —— 这就是菜鸟的手法）
  //    木棍是 0 伤害的绊脚陷阱，规则见文件顶部 STICK_* 常量
  tossStick(){
    if(!G.sticks) G.sticks = [];
    const ang = rand(0, Math.PI * 2);
    const d = rand(STICK_TOSS_MIN_D, STICK_TOSS_MAX_D);
    const tx = clamp(this.x + Math.cos(ang) * d, 16, WW() - 16); // 落点不许出场地
    const ty = clamp(this.y + Math.sin(ang) * d, 16, WH() - 16);
    G.sticks.push({
      sx: this.x, sy: this.y, x: this.x, y: this.y, tx, ty, t: 0,
      air: true, ang: rand(0, Math.PI), spin: rand(-11, 11),
      life: STICK_LIFE, hits: 0, cool: 0, shake: 0, seat: this.seat, dead: false,
      rollT: 0, rollX0: 0, rollY0: 0, rollDir: 0, rollSpin: 0, // 🪵 滚走退场（见 rollStickAway）
    });
    this.rkTossFx = 0.25;
    SND.aRookie(); // 🎭 木棍闷响（同一条"干木头"音色）
  }
  rkCryWorth(){
    // ⚔️ 对战：场上一个怪都没有，「身边 ≥2 只怪」这套永远为假 → 看**对手贴得多近**：
    //    被贴到尖叫半径的一半（75px，刚好在木棍够不着的地方）就喊开，给自己腾出距离
    if(G.pvp){
      const foe = (G.players || []).find(q => q && q !== this && !q.dead && (q.seat || 0) !== (this.seat || 0));
      return !!foe && dist(this, foe) <= this.rkCryR * 0.5;
    }
    let n = 0;
    for(const e of G.enemies){ if(!e.dead && !e.dying && dist(this, e) < this.rkCryR + e.r) n++; }
    // 📣 战吼有团队增益：有队友在场 → 圈里只有 1 只怪也值得吼（队友吃 ×1.5 比怪的血更值钱）；单干时依旧 2 只才吼
    const hasMate = (G.players || []).some(q => q && q !== this && !q.dead && (q.seat || 0) !== (this.seat || 0));
    return n >= (hasMate ? 1 : 2);
  }
  castRookieCry(){
    this.rkCryCD = this.rkCryCDMax;
    this.rkCryFx = 0.35;
    SND.aRookieCry(); // 🎭 新手战吼（专属吼声，替代原来借用的开枪音）
    // 📣 团队增伤：自己和**同阵营队友**都吃 ×1.5（3 秒）；自治单位（小兵/炮台）不吃 ——
    //    吼的是"人"，不是兵。每人都重置到满 3 秒（连吼可续）。
    for(const q of (G.players || [])){
      if(!q || q.dead) continue;
      if(G.pvp && (q.seat || 0) !== (this.seat || 0)) continue; // ⚔️ 对战：对手不吃自己的战吼
      q.rageT = ROAR_DUR;
    }
    if(G.pvp){ // ⚔️ 对战：把人**吼开**（依旧 0 伤害、纯位移）—— 新手唯一的"控距"手段
      for(const q of (G.players || [])){
        if(!q || q === this || q.dead) continue;
        if(dist(this, q) > this.rkCryR + q.r) continue;
        pushPlayer(q, this.x, this.y, 260); // 人比怪重：冲量比怪的 300 小一档（Boss 只有 60）
      }
      return;
    }
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(dist(this, e) > this.rkCryR + e.r) continue;
      const ea = Math.atan2(e.y - this.y, e.x - this.x);
      const kf = e.isBoss ? 60 : 300; // Boss 几乎推不动（它比新手重得多）
      e.kbx = (e.kbx || 0) + Math.cos(ea) * kf;
      e.kby = (e.kby || 0) + Math.sin(ea) * kf;
    }
  }
  // ================= ⚙️ 工程师：放置系（自动炮台 + 🛠 大招「建造战车」） =================
  // 放置的基本盘：**自动**产塔，不需要玩家操作（落点见 engAutoSpot）
  //   ① 自动：每 engEvery 秒自己立一座（场上上限 engMax 座、每座存在 engLife 秒）
  // 大招（输入同全游戏统一键位：1P = 🖱 鼠标左键单击 / 手柄 RB；AI 座位 = 自己判断值不值得开）：
  //   ② 施工 3 秒（工地落在瞄准点方向、离身不超过 VEH_SPOT_MAX）→ 上车开战，
  //      战车被打爆后**才开始**走 60 秒冷却（口径见构造函数注释）
  updateEngineerSkill(dt){
    if(this.vehFx > 0) this.vehFx = Math.max(0, this.vehFx - dt); // 钳零：浮点递减不留小负数
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
    if(this.dead || G.state !== 'playing') return;
    // ① 自动部署（倒计时一到就立一座；塔满了就跳过这一轮，不攒着）—— 上车/施工期间照常跑，这才是"放置"
    this.engT -= dt;
    if(this.engT <= 0){
      this.engT = this.engEvery;
      if(engTurretCount(this.seat) < this.engMax){
        const spot = this.engAutoSpot();
        if(spot) engSpawnTurret(this, spot.x, spot.y);
      }
    }
    // ② 坐在战车里：只跑战车（免疫控制 + 双炮管开火）
    if(this.veh){ this.updateVehicle(dt); }
    else {
      // 大招冷却：**只有"没施工、也没上车"时才倒数** —— 口径 = 战车被破坏那一刻才开始冷却
      if(this.vehBuild <= 0 && this.vehCD > 0) this.vehCD = Math.max(0, this.vehCD - dt);
      // ③ 施工中（3 秒）：进度走完就上车；期间玩家照常走位开火（无人机在工地干活）
      if(this.vehBuild > 0){
        this.vehBuild -= dt;
        if(this.vehSpot && Math.random() < 0.6)
          spawnParticles(this.vehSpot.x + rand(-20, 20), this.vehSpot.y + rand(-16, 16), Math.random() < 0.5 ? '#ffb347' : '#ffd166', 1);
        if(this.vehBuild <= 0){ this.vehBuild = 0; this.enterVehicle(); }
        return;
      }
      // ④ 起建：眩晕中不能开（与其它主动技同口径），冷却中不能开
      if(this.stun > 0 || this.vehCD > 0) return;
      if(isAIPlayer(this)){
        if(!this.aiEngUltWorth()) return; // AI 不空放：没有值得上车的局面就攒着
        const t = this.aiEngTarget();     // 工地选在"怪堆方向"：车一建成正好朝那边开过去
        if(t){ const c = cursorOf(this.seat); if(c){ c.x = t.x; c.y = t.y; } }
      } else if(!fire) return;
      this.startVehicleBuild();
    }
  }
  // 🛠 起建：工地落在瞄准点方向（钳在离身 VEH_SPOT_MAX 内 + 场地内），3 秒后在那儿上车
  startVehicleBuild(){
    const aim = this.aimPoint();
    let dx = aim.x - this.x, dy = aim.y - this.y;
    const d = Math.hypot(dx, dy);
    if(!isFinite(dx) || !isFinite(dy) || d < 1){ dx = 1; dy = 0; }        // 光标压在脚下：给个确定方向
    else if(d > VEH_SPOT_MAX){ dx = dx / d * VEH_SPOT_MAX; dy = dy / d * VEH_SPOT_MAX; }
    const m = VEH_R + 6;
    this.vehSpot = { x: clamp(this.x + dx, m, Math.max(m, WW() - m)), y: clamp(this.y + dy, m, Math.max(m, WH() - m)) };
    this.vehBuild = Math.max(0.4, this.vehBuildMax);
    this.vehFx = 0.4;
    spawnParticles(this.vehSpot.x, this.vehSpot.y, '#ffb347', 12);
    SND.charge(); // 起建音（与炮台部署同一档：低频上升）
  }
  // 🚜 上车：体积变大、装甲上账、控制清空；车上的血量/装甲都不是"本体血量"
  enterVehicle(){
    const s = this.vehSpot || { x: this.x, y: this.y };
    this.vehSpot = null;
    this.r0 = this.r;                    // 记下本体半径（炸车后还原）
    this.r = VEH_R;                      // **体积更大**（中弹面积同步变大）
    this.x = clamp(s.x, this.r, Math.max(this.r, WW() - this.r));
    this.y = clamp(s.y, this.r, Math.max(this.r, WH() - this.r));
    this.veh = { hp: VEH_HP, maxHp: VEH_HP, ang: angleTo(this, this.aimPoint()),
      cd: [0.30, 0.75], twin: 0, tread: 0, muzzle: 0, hitFx: 0, cast: 0 };
    this.vehFx = 0.5;
    this.stun = 0; this.kbx = 0; this.kby = 0; this.slowed = false; // 上车即清状态（免疫从这一刻起）
    this.invuln = Math.max(this.invuln, 0.5);                      // 上车短暂无敌（别刚落地就挨打）
    spawnParticles(this.x, this.y, '#ffb347', 20);
    SND.summon(); // 上车音（上行三连，与"征召出兵"同档）
  }
  // 💥 炸车/下车：本体弹出（本体血量原封不动）、**冷却从这一刻开始**（固定 60 秒）
  destroyVehicle(){
    if(!this.veh) return;
    this.veh = null;
    this.r = this.r0 || 14;
    this.x = clamp(this.x, this.r, Math.max(this.r, WW() - this.r));
    this.y = clamp(this.y, this.r, Math.max(this.r, WH() - this.r));
    this.vehCD = this.vehCDMax;                  // ⚙️ 口径：战车被破坏后才开始冷却
    this.vehFx = 0.6;
    this.invuln = Math.max(this.invuln, 1.2);    // 弹出后短暂无敌（免得刚出车就被贴身怪秒了）
    const zb = visionZoom();
    G.effects.push({ type:'boom', x:this.x, y:this.y, r:96*zb, maxR:96*zb, life:0.55, max:0.55, dmg:0, done:true });
    spawnParticles(this.x, this.y, '#ff8a3d', 26);
    spawnParticles(this.x, this.y, '#5b6880', 16);
    SND.boom();
    G.screenShake = 14;
  }
  // 🚜 车内推进：免疫一切控制（眩晕·击退·减速逐帧清空）+ 两根炮管交错自动开火
  updateVehicle(dt){
    const v = this.veh; if(!v) return;
    v.tread += dt;
    if(v.muzzle > 0) v.muzzle -= dt;
    if(v.hitFx > 0) v.hitFx -= dt;
    if(v.cast > 0) v.cast -= dt;
    // **免疫一切控制效果**：眩晕/击退/减速每帧归零（即使被别的系统塞进来也活不过这一帧）
    this.stun = 0; this.kbx = 0; this.kby = 0; this.slowed = false;
    v.ang = angleTo(this, this.aimPoint());
    // 两根炮管各自计冷却：先整体倒数，谁好了谁开火（交错发射 → 火力不断档）
    for(let i = 0; i < 2; i++){
      if(v.cd[i] > 0) v.cd[i] -= dt;                       // ⚠️ 倒数不能漏：漏了炮管就永远"冷却中"（实机冒烟抓到过）
      if(v.cd[i] > 0) continue;
      v.cd[i] = Math.max(0.25, VEH_RATE * pCM(this).rateMul); // 挑战模式：反应迟钝同样拉长
      this.vehFire(i);
    }
  }
  // 🚜 炮管开火（i = 0 左管 / 1 右管）：从自己的炮口出膛，弹道/命中/暴击全走既有 Bullet 管线
  vehFire(i){
    const v = this.veh; if(!v) return null;
    const per = v.ang + Math.PI/2;
    const off = (i === 0 ? -1 : 1) * VEH_BARREL_OFF;                 // 两根管子左右分开
    const bx = this.x + Math.cos(v.ang) * VEH_BARREL_LEN + Math.cos(per) * off;
    const by = this.y + Math.sin(v.ang) * VEH_BARREL_LEN + Math.sin(per) * off;
    const spd = 620, dmg = Math.max(1, Math.round(VEH_DMG * roarMul(this) * pCM(this).dmgMul));
    const b = new Bullet(bx, by, Math.cos(v.ang)*spd, Math.sin(v.ang)*spd, dmg, 5, 0, 0, 0, this.seat, this.skills.crit || 0, null);
    G.bullets.push(b);
    v.muzzle = 0.1;
    if(!G._vehSndT || G.time - G._vehSndT > 0.12){ G._vehSndT = G.time; SND.aVehicle(); } // 🎭 战车重炮（双管齐响时节流，免得吵）
    return b;
  }
  // 🚜 战车挨打：只扣装甲（**任何方式都不会恢复**），装甲清零 → 炸车 + 开始 60 秒冷却
  vehHurt(d){
    const v = this.veh; if(!v) return;
    d = Math.max(0, Math.round((d || 0) * pCM(this).takenMul)); // 挑战模式受伤修正（与本体同口径）
    v.hp = Math.max(0, v.hp - d);
    v.hitFx = 0.2;
    this.invuln = G.pvp ? 0.35 : 0.6; // 无敌帧与本体同档（对战更短，节奏利落）
    G.screenShake = 6;
    SND.hurt();
    if(v.hp <= 0) this.destroyVehicle();
  }
  // 🤖 AI 是否值得开大招：对战里对手够近 / PVE 里怪堆够厚或血线吃紧（Boss 场必开）
  aiEngUltWorth(){
    if(this.veh) return false;
    if(this.vehCD > 0 || this.vehBuild > 0) return false;
    if(G.pvp){
      const foe = (G.players || []).find(q => q && !q.dead && (q.seat || 0) !== (this.seat || 0));
      return !!foe && dist(this, foe) < 460; // 对手进入"车能压到"的距离就上
    }
    let near = 0, boss = false;
    for(const e of (G.enemies || [])){
      if(!e || e.dead || e.dying || e.isBullet) continue;
      if(e.isBoss){ boss = true; continue; }
      if(dist(this, e) < 340) near++;
    }
    if(boss) return true;                                   // Boss 在场：战车能扛能推，直接上
    if(near >= 3) return true;                              // 三只以上围过来了：上车碾过去
    return this.hp < this.maxHp * 0.55;                     // 血线吃紧：靠装甲换一条命
  }
  // 自动部署落点：朝最近的怪方向前压一段（火力顶到前线），但不塞进怪嘴里；没怪就立在自己侧前方
  engAutoSpot(){
    let nearest = null, nd = 1e9;
    const src = G.pvp ? (G.players || []).filter(q => q && !q.dead && q.seat !== this.seat) : G.enemies;
    for(const e of (src || [])){
      if(!e || e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(d < nd){ nd = d; nearest = e; }
    }
    if(nearest){
      const a = Math.atan2(nearest.y - this.y, nearest.x - this.x);
      const step = clamp(nd - 90, 60, 170); // 离怪越远越往前压，最多 170px
      return { x: this.x + Math.cos(a)*step, y: this.y + Math.sin(a)*step };
    }
    return { x: this.x + 70, y: this.y + 40 }; // 场上没目标：立在身侧，保持"身边有塔"
  }
  // AI 大招工地选点：附近 620px 内「敌人最密集」的位置（≥2 只挤在一起就值得；Boss 权重更高）
  //   ⚔️ 对战模式：场上没怪 → 直接朝对手方向建车（车建成后正好压过去）
  aiEngTarget(){
    let best = null, bestScore = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(dist(this, e) > 620) continue;
      let score = e.isBoss ? 2 : 0;
      for(const o of G.enemies){
        if(o.dead || o.dying || o.isBullet) continue;
        if(dist(e, o) < 170) score += (o.isBoss ? 3 : 1);
      }
      if(score > bestScore){ bestScore = score; best = e; }
    }
    if(bestScore >= 2) return best; // 门槛比爆破（≥3）低一档：炮台是持续输出，值得勤放
    return G.pvp ? ((G.players || []).find(q => q && !q.dead && (q.seat || 0) !== (this.seat || 0)) || null) : null;
  }
  updateSwordUlt(dt){
    if(this.swFx > 0) this.swFx -= dt;
    if(this.swCD > 0) this.swCD -= dt;
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.swCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.aiSwordUltWorth()) return; // AI 不空放：扇形里至少 3 只小怪才斩
    } else if(!fire) return; // 与爆破/龙卷风共用「主动技能键」（🖱 左键单击 / 手柄RB）
    this.castSwordUlt();
  }
  // 🗡 斩灭半径：屏幕「长边」的 1/4（世界坐标 → 视野扩大时等比换算，视觉上永远是屏幕的 1/4）+ 🌌开天阔刃加成
  swordUltRange(){ return Math.max(WW(), WH()) / 4 + (this.swRangeBonus || 0); }
  // 🗡 扇形判定：目标是否落在「朝向 ± swArc、半径 R」内（判定与绘制同一系数 → 看得见就斩得到）
  inSwordArc(e, a, R){
    const d = dist(this, e);
    if(d > R + (e.r || 0)) return false;
    const ea = Math.atan2(e.y - this.y, e.x - this.x);
    const diff = Math.abs(((ea - a + Math.PI*3) % (Math.PI*2)) - Math.PI);
    return diff <= this.swArc;
  }
  // 🗡 AI 是否值得放：扇形里**有任何怪**（含 Boss —— 重斩能削它 585+ 血）就用，CD 60 秒不攒着。
  //    旧口径「≥2 只小怪」实战几乎凑不齐：AI 清怪太快，60% 的时间扇形里只有 1 只怪，玩家看着像"从不放大"。
  aiSwordUltWorth(){
    const a = angleTo(this, this.aimPoint());
    const R = this.swordUltRange();
    for(const e of targetsFor(this.seat)){ // ⚔️ 对战：目标是对手玩家（PVE 时是场上怪物）
      if(e.dead || e.dying) continue;
      if(this.inSwordArc(e, a, R)) return true;
    }
    return false;
  }
  castSwordUlt(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：剑士放斩灭消耗体力（世界1/无资源为空操作）
    const a = angleTo(this, this.aimPoint());
    const R = this.swordUltRange();
    let killed = 0, hitBoss = false;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue; // 敌方弹幕不归它管（那是普攻格挡的活）
      if(!this.inSwordArc(e, a, R)) continue;
      e.lastHitIdx = this.seat;                     // 击杀归属（挑战模式吸血 / 结算）
      if(e.isBoss){                                 // 🗡 Boss 秒不掉，但吃一记重斩（挥砍伤害×15，近战打 Boss ×1.5 照算；斩铁皇的盾正常结算）
        e.takeDamage(Math.round(this.bulletDmg * 15 * 1.5), '#ffd166', false, this.seat);
        spawnParticles(e.x, e.y, '#ffd166', 8);
        hitBoss = true;
        continue;
      }
      e.hp = 0;                                     // 秒杀：血量一次性归零（读数/血条口径都干净）
      spawnParticles(e.x, e.y, '#ffd166', 5);
      e.die();                                      // 直接走死亡流程（掉落 / 粒子 / 音效 / 计数）
      killed++;
    }
    this.swKills = killed;
    this.swCD = this.swCDMax;                       // 进入 60 秒冷却
    this.swFx = 0.45;
    if(G.pvp){ // ⚔️ 对战：斩灭同样斩得到对手玩家（重斩伤害按 PVP 折算）
      const hits = pvpMeleeHit(this, this.x, this.y, a, this.swArc, R, Math.round(this.bulletDmg * 3), '#ffd166', this);
      if(hits > 0) hitBoss = true;
    }
    G.effects.push({ type:'swordult', x:this.x, y:this.y, ang:a, arc:this.swArc, r:R, seat:this.seat, life:0.5, max:0.5 });
    SND.swordUlt();
    if(killed > 0 || hitBoss) G.screenShake = Math.max(G.screenShake || 0, 10); // 斩到手（含砍到 Boss）才震屏（空放不震）
  }
  // ================= 🐶 野生狗奶大招「春秋邻域」（🖱 左键单击 / 手柄RB） =================
  // 开启后视野内（即全场）敌人全部定身，场地从中心不断放大、最后爆炸；动画结束秒杀所有非 Boss 敌人（Boss 重创 80%）。
  // 冷却 180 秒。
  updateDogUlt(dt){
    if(this.dogFx > 0) this.dogFx -= dt;
    if(this.dogCD > 0) this.dogCD -= dt;
    if(this.dogUltT > 0){ // 动画播放中：每帧维持敌人定身（dogHold），结束触发爆炸
      this.dogUltT -= dt;
      G.enemies.forEach(e => {
        if(e.dead || e.isBullet) return;
        e.dogHold = Math.max(e.dogHold || 0, 0.06); // 维持完全冻结直到动画结束
      });
      if(this.dogUltT <= 0) this.dogUltBoom();
      return;
    }
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.dogCD > 0) return;
    if(isAIPlayer(this)){
      if(targetsFor(this.seat).length < 1) return; // AI 不空放：场上至少一个目标（⚔️对战看对手玩家）
    } else if(!fire) return;
    this.castDogUlt();
  }
  castDogUlt(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：放技能消耗资源（世界1/无资源为空操作）
    // 视野内（全场）敌人无法动弹：完全冻结直到动画结束
    G.enemies.forEach(e => {
      if(e.dead || e.isBullet) return;
      e.dogHold = this.dogUltDur + 0.3;
      e.lastHitIdx = this.seat;
    });
    if(G.pvp){ // ⚔️ 对战：春秋邻域冻结的是对手玩家（冰壳视觉 + stun 定身，同时长）
      for(const q of G.players){
        if(!q || q.dead || q.seat === this.seat) continue;
        q.stun = Math.max(q.stun || 0, this.dogUltDur + 0.3);
        q.frozen = this.dogUltDur + 0.3; q.frozenMax = q.frozen;
        q.lastHitIdx = this.seat;
      }
    }
    this.dogUltT = this.dogUltDur;   // 启动「场地放大 → 爆炸」动画
    this.dogCD = this.dogCDMax;      // 进入 180 秒冷却
    this.dogFx = 0.3;
    SND.dogUlt();
    G.screenShake = Math.max(G.screenShake || 0, 8);
    G.effects.push({ type:'dogult', x:this.x, y:this.y, life:this.dogUltDur, max:this.dogUltDur });
  }
  dogUltBoom(){ // 动画结束：场地爆炸 + 秒杀所有敌人（非 Boss 直接死；Boss 受 80% 重创，不致死）
    let killed = 0;
    G.enemies.forEach(e => {
      if(e.dead || e.isBullet) return;
      e.lastHitIdx = this.seat;
      if(e.isBoss){
        e.takeDamage(Math.round(e.hp * 0.8), '#9ef04a', false, this.seat); // Boss：重创 80%（不致死，避免每 3 分钟秒 Boss 通关）
        spawnParticles(e.x, e.y, '#9ef04a', 12);
      } else {
        e.hp = 0; e.die(); // 小怪 / 精英 / 召唤物：秒杀
        spawnParticles(e.x, e.y, '#9ef04a', 6);
        killed++;
      }
    });
    this.dogKills = killed;
    if(G.pvp){ // ⚔️ 对战：爆炸重创对手玩家（同 Boss 口径：削 80% 当前血，按 PVP 折算，不致死）
      for(const q of G.players){
        if(!q || q.dead || q.seat === this.seat) continue;
        const d = Math.max(1, Math.round(q.hp * 0.8 * PVP_DMG_MUL));
        q.takeDamage(d, '#9ef04a');
        spawnParticles(q.x, q.y, '#9ef04a', 12);
        killed++;
      }
    }
    this.dogKills = killed;
    G.effects.push({ type:'dogboom', x:WW()/2, y:WH()/2, life:0.6, max:0.6, r:Math.max(WW(), WH()) });
    G.screenShake = Math.max(G.screenShake || 0,18);
  }
  // ================= 🃏 卡牌大师大招「飞机」（🖱 左键单击 / 手柄RB） =================
  // 斗地主名场面："十七张牌你能秒我？出一个飞机" —— 一记飞机拍下去，
  // 面前（瞄准方向 ~140° 锥形、半径 560）所有敌人被<b>大量击退 + 眩晕 2.5 秒 + 重创</b>；Boss 同样吃但按惯例不致死。
  // 冷却 100 秒。
  updateCardUlt(dt){
    if(this.cmFx > 0) this.cmFx -= dt;
    if(this.cmCD > 0) this.cmCD -= dt;
    if(this.cmUltT > 0){ // 飞机正飞过来：到时拍下
      this.cmUltT -= dt;
      if(this.cmUltT <= 0) this.cmUltBoom();
      return;
    }
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.cmCD > 0) return;
    if(isAIPlayer(this)){
      if(targetsFor(this.seat).length < 1) return; // AI 不空放：场上至少一个目标（⚔️对战看对手玩家）
    } else if(!fire) return;
    this.castCardUlt();
  }
  castCardUlt(){
    this.spendRes(RES_SKILL_COST); // 🌌 世界2：放技能消耗资源（世界1/无资源为空操作）
    const a = angleTo(this, this.aimPoint());
    this.cmUltT = this.cmUltDur;   // 启动「甩飞机 → 拍下」动画
    this.cmCD = this.cmCDMax;      // 进入 100 秒冷却
    this.cmFx = 0.3;
    SND.cardUlt();
    G.screenShake = Math.max(G.screenShake || 0, 7);
    G.effects.push({ type:'plane', x:this.x, y:this.y, ang:a, life:this.cmUltDur, max:this.cmUltDur, seat:this.seat });
  }
  cmUltBoom(){ // 飞机拍下：面前锥形范围内敌人大量击退 + 眩晕 + 重创（Boss 同样吃但不致死）
    let hit = 0;
    const a = angleTo(this, this.aimPoint());
    const R = 560, half = 70 * Math.PI/180; // 锥形：±70°（约 140°）
    const dmg = Math.round(240 * (1 + 0.25*(this.skills.cm_ult || 0))); // 飞机强化提升大招伤害
    for(const e of G.enemies){
      if(e.dead || e.isBullet) continue;
      const d = dist(this, e);
      if(d > R + (e.r || 0)) continue;
      let da = Math.atan2(e.y - this.y, e.x - this.x) - a;
      while(da > Math.PI) da -= Math.PI*2; while(da < -Math.PI) da += Math.PI*2;
      if(Math.abs(da) > half) continue; // 不在面前锥形内
      // 大量击退（从玩家方向把敌人推开）
      const ka = Math.atan2(e.y - this.y, e.x - this.x);
      const kf = 760;
      e.kbx = Math.cos(ka) * kf; e.kby = Math.sin(ka) * kf;
      e.stun = Math.max(e.stun || 0, 2.5); // 眩晕 2.5 秒
      e.lastHitIdx = this.seat;
      if(e.isBoss){ e.takeDamage(dmg, '#ffd166', false, this.seat); spawnParticles(e.x, e.y, '#ffd166', 12); }
      else { e.takeDamage(dmg, '#ffd166', false, this.seat); spawnParticles(e.x, e.y, '#ffd166', 7); hit++; }
    }
    this.cmKills = hit;
    if(G.pvp){ // ⚔️ 对战：飞机同样拍得到对手玩家（同一 ±70° 锥形：击退 + 眩晕 + 重创按 PVP 折算）
      const a0 = angleTo(this, this.aimPoint());
      for(const q of G.players){
        if(!q || q.dead || q.seat === this.seat) continue;
        const d = dist(this, q);
        if(d > R + q.r) continue;
        let da = Math.atan2(q.y - this.y, q.x - this.x) - a0;
        while(da > Math.PI) da -= Math.PI*2; while(da < -Math.PI) da += Math.PI*2;
        if(Math.abs(da) > half) continue;
        const ka = Math.atan2(q.y - this.y, q.x - this.x);
        q.kbx = Math.cos(ka) * 760; q.kby = Math.sin(ka) * 760; // 大量击退
        q.stun = Math.max(q.stun || 0, 2.5);                    // 眩晕 2.5 秒
        q.lastHitIdx = this.seat;
        q.takeDamage(Math.max(1, Math.round(dmg * PVP_DMG_MUL)), '#ffd166');
        spawnParticles(q.x, q.y, '#ffd166', 12);
        hit++;
      }
    }
    this.cmKills = hit;
    G.effects.push({ type:'planeboom', x:this.x, y:this.y, ang:a, life:0.5, max:0.5, r:R, half });
    G.screenShake = Math.max(G.screenShake || 0, 16);
  }
  // ================= ⚡ 射手主动技能「环形弹幕」（🖱 左键单击 / 手柄RB） =================
  // 以自身为中心向四周连放 6 圈弹幕（每圈 12 发、360° 均分），圈间隔 0.16 秒 —— 一圈接一圈叠出去。
  // 每圈比上一圈转一点角度（ringPhase），六圈叠成星芒，视觉上更"弹幕"。
  // 弹体沿用射手的普攻参数（伤害/穿透/爆炸），但不吃追踪（追踪会把圆环拉塌，破坏造型）；冷却 30 秒。
  updateGunnerUlt(dt){
    if(this.ringFx > 0) this.ringFx -= dt;
    if(this.ringCD > 0) this.ringCD -= dt;
    if(this.ringLeft > 0){ // 连放中：一圈接一圈（中途被眩晕/结算则中断，已放出去的照飞）
      if(this.stun > 0 || this.dead || G.state !== 'playing'){ this.ringLeft = 0; return; }
      this.ringT -= dt;
      while(this.ringLeft > 0 && this.ringT <= 0){
        this.fireRing();
        this.ringLeft--;
        this.ringT += this.ringGap;
      }
      return;
    }
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);

    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.ringCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.aiRingUltWorth()) return; // AI 不空放：身边 260px 内至少 3 只怪才转
    } else if(!fire) return;
    this.castRingBarrage();
  }
  // 🏹 AI 是否值得放：环射是全向的 → 只看身边有多少怪（不看向）。
  //    实战口径：320px 内 ≥2 只、或有怪贴到 150px 内（紧急自救）、或 380px 内有 Boss（贴脸输出机会）——
  //    原来"260px 内 3 只"对风筝走位的射手 AI 来说太苛刻，基本永远攒不齐
  aiRingUltWorth(){
    let n = 0;
    for(const e of targetsFor(this.seat)){ // ⚔️ 对战：目标是对手玩家（贴身就转，中距离攒两个）
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(e.isBoss){ if(d <= 380) return true; continue; }
      if(d <= 150) return true;   // 贴脸怪：立刻转一圈自保
      if(d <= 320) n++;
    }
    return G.pvp ? n >= 1 : n >= 2; // ⚔️ 对战只有一个对手：进 320 距离就转（PVE 维持原口径 2 只）
  }
  castRingBarrage(){
    this.ringLeft = Math.max(0, this.ringCount - 1); // 第一圈立刻放，剩下 5 圈按节奏接上
    this.ringT = this.ringGap;
    this.ringPhase = 0;
    this.ringCD = this.ringCDMax;                    // 进入 30 秒冷却
    this.ringFx = 0.3;
    this.fireRing();
    SND.charge();
  }
  // 放出一圈：12 发 360° 均分（每 30° 一发），朝向随 ringPhase 逐圈旋转
  fireRing(){
    const n = Math.max(1, this.ringBullets);
    const dmg = this.bulletDmg * roarMul(this) * CM().dmgMul;        // 与普攻同源（挑战模式伤害修正）
    for(let i = 0; i < n; i++){
      const ang = this.ringPhase + i / n * Math.PI * 2;
      G.bullets.push(new Bullet(
        this.x, this.y, Math.cos(ang)*this.bulletSpd, Math.sin(ang)*this.bulletSpd,
        dmg, this.bulletR, this.pierce, this.explosive, 0, // 不吃追踪：圆环要保形
        this.seat, this.skills.crit || 0
      ));
    }
    this.ringPhase += Math.PI / (n * this.ringCount); // 逐圈微转 → 六圈叠成星芒
    spawnParticles(this.x, this.y, '#7cd8ff', 6);
    SND.shoot();
  }
  // ================= 🪃 回旋镖：普攻「扔出去、再飞回来」（去程 + 回程双段） =================
  // 与其它远程角色最大的不同：**子弹不会消失，它会回来**。所以：
  //   · 输出不是"每秒多少发"，而是"这条往返弧扫过多少怪 × 2 段" → 玩家要主动把怪引到弧线上
  //   · 场上同时最多 bmMax 枚：扔太勤就"堵住"（满了这发不扔，等旧的回来）→ 逼玩家算节奏
  //   · 每枚镖的去程、回程各自独立命中（同一敌人两段都吃 → 单枚对单体的上限是 2 段）
  //   ⚠️ 环绕 5 秒是**大招**的口径（见 castBoomerangStorm），普攻永远是往返双段。
  throwBoomerang(){
    const alive = (G.boomerangs || []).reduce((n, b) => n + (b.seat === this.seat && !b.dead ? 1 : 0), 0);
    if(alive >= this.bmMax) return null; // 场上已经满了：这一手不扔（等镖飞回来）
    SND.heroAtk('boomerang'); // 🎭 木镖脱手（"咻"一声风声）
    const aim = this.aimPoint();
    const base = angleTo(this, aim);
    const n = Math.max(1, this.bmMultishot | 0);
    let last = null;
    for(let i = 0; i < n; i++){
      const spread = (i - (n - 1) / 2) * 0.22; // 多枚时左右散开一点，别完全重叠
      last = spawnBoomerang(this, base + spread);
    }
    this.bmThrown += n;
    return last;
  }
  // 🌀 大招「万镖齐发」：向四周连甩一圈回旋镖（每枚都贴身环绕 5 秒，伤害打折），冷却 BM_ULT_CD 秒
  updateBoomerangUlt(dt){
    if(this.bmUltFx > 0) this.bmUltFx -= dt;
    if(this.bmCatchFx > 0) this.bmCatchFx = Math.max(0, this.bmCatchFx - dt); // 钳零：浮点递减不留小负数
    if(this.bmUltCD > 0) this.bmUltCD -= dt;
    if(this.bmUltLeft > 0){ // 连甩中：一枚接一枚（眩晕/结算则中断，已扔出去的照飞）
      if(this.stun > 0 || this.dead || G.state !== 'playing'){ this.bmUltLeft = 0; return; }
      this.bmUltT -= dt;
      while(this.bmUltLeft > 0 && this.bmUltT <= 0){
        // 逐枚旋转（风车造型）：一圈平均分 + 每枚稍微提前一点，甩出去更好看
        const ang = this.bmUltSpin + (this.bmUltN - this.bmUltLeft) * (Math.PI * 2 / Math.max(1, this.bmUltN));
        spawnBoomerang(this, ang, { orbit: true, dmgMul: BM_ULT_DMGMUL }); // 🌀 大招专属：贴身环绕 5 秒（普攻不走这条）
        this.bmThrown++;
        this.bmUltLeft--;
        this.bmUltT += BM_ULT_GAP;
      }
      return;
    }
    // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
    const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
    if(this.stun > 0 || this.dead || G.state !== 'playing') return;
    if(this.bmUltCD > 0) return;
    if(isAIPlayer(this)){
      if(!this.aiBoomerangUltWorth()) return; // AI 不空放：身边有怪才甩
    } else if(!fire) return;
    this.castBoomerangStorm();
  }
  // 🤖 AI 是否值得放大招：身边 320px 内 ≥2 只怪 / 或 150px 内有贴脸怪 / 或 380px 内有 Boss
  aiBoomerangUltWorth(){
    let n = 0;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(e.isBoss){ if(d <= 380) return true; continue; }
      if(d <= 150) return true;
      if(d <= 320) n++;
    }
    return n >= 2;
  }
  castBoomerangStorm(){
    this.bmUltN = Math.max(1, this.bmUltN | 0);
    this.bmUltLeft = this.bmUltN;
    this.bmUltT = 0;                 // 第一枚立刻甩出
    this.bmUltSpin = angleTo(this, this.aimPoint()); // 从朝向开始转一圈
    this.bmUltCD = this.bmUltCDMax;  // 进入冷却
    this.bmUltFx = 0.35;
    SND.charge();
  }
  // 🎭 普攻音效键：与 heroKind() 同口径，但写成实例方法 —— shoot()/slash() 内部不必依赖全局函数，
  //    （单元测试常用真 Player 实例直接调这两个方法，实例方法一定在原型上，不会踩沙盒导出缺失）
  atkSndKind(){
    if(this.isTornado) return 'tornado';   // 🌀 近战要排在 melee 前面（与 heroKind 同序）
    if(this.isGeneral) return 'general';
    if(this.isVampire) return 'vampire';
    if(this.isStone) return 'stone';       // 🪨 投石（普攻走 pickPoke，不走 shoot/slash；留着只是口径一致）
    if(this.isRookie) return 'rookie';
    if(this.isEngineer) return 'engineer';
    if(this.isBoomerang) return 'boomerang'; // 🪃 回旋镖（远程：不回血/不近战，判定与 heroKind 同序）
    if(this.isDogmilk) return 'dogmilk';     // 🐶 野生狗奶（近战：不回血/不近战，判定与 heroKind 同序）
    if(this.isCardmaster) return 'cardmaster'; // 🃏 卡牌大师（远程：抽牌扇出，判定与 heroKind 同序）
    if(this.isKetchup) return 'ketchup';   // 🍅 番茄酱之神（控场系：普攻=捏爆番茄酱，判定与 heroKind 同序）
    if(this.isKnight) return 'knight';     // 🛡 骑士（重甲坦克剑士：挥剑+举盾+勇士冲锋，判定与 heroKind 同序）
    if(this.isBard) return 'bard'; // 🎻 吟游诗人（远程：穿透音波 + 回旋曲，判定与 heroKind 同序）
    if(this.isSpring) return 'spring'; // 🥊 弹簧（近战：蓄力弹簧拳 + 弹簧钩，判定与 heroKind 同序）
    if(this.melee) return 'melee';         // 🗡 剑士
    if(this.isLaser) return 'laser';
    if(this.isBomber) return 'bomber';
    if(this.isVenom) return 'venom';
    if(this.isMage) return 'mage';
    return 'gunner';                       // 🏹 射手（默认）
  }
  // 🗡 剑士：大剑扇形挥砍。判定与绘制用同一世界半径（看得见的范围就是砍得到的范围）
  //   ① 斩伤扇形内的敌人并击退 ② 斩掉扇形内的敌方弹幕（近战角色的核心生存手段）
  //   🛡 例外：骑士（isKnight）不斩弹幕——它靠正面举盾挡弹幕（knightShieldBlock），剑只管砍人/砍怪
  // 近战技能全部来自剑士专属池：连斩(出刀间隔)/重斩(伤害+张角)/回旋斩(张角大幅张开)/裂空(半径+斩弹)
  //   突进斩(出刀前冲)/爆裂斩(命中爆炸)/烈焰斩(剑刃点火)/引雷斩(斩击引雷)/剑气斩(远程剑气)/铁壁(出刀减伤)
  // 🌀 挥砍张角（半角，弧度）—— 每刀实时结算。
  //   🌀龙卷风：固定整圈（半角 π = 360°），等同剑士满级回旋斩的判定，不吃任何技能加减
  //   其余（🗡剑士）：只由「基础 90°」和「🔁回旋斩等级」决定，其它技能（🪓重斩、通用技能……）一律不碰张角
  arcFromSkills(){
    if(this.isRookie){
      // 🐣 抡圆一点：基础正面 90°（半角 45°），每级 +30° 总张角 → 120°/150°
      return (45 + 15*(this.skills.r_arc||0)) * Math.PI / 180;
    }
    if(this.isGeneral){
      // ⚔️ 横扫千军：基础正面 100°（半角 50°），每级 +30° 总张角 → 130°/160°
      return (50 + 15*(this.skills.gen_arc||0)) * Math.PI / 180;
    }
    if(this.isEngineer){
      // ⚙️ 工程师扳手：正面固定 80°（半角 40°）—— 它不靠本体打伤害，没有加张角的技能
      return 40 * Math.PI / 180;
    }
    if(this.isTornado){
      // 🌀 回旋风刃：基础正面 180°（半角 90°），每级 +60° 总张角 → 240°/300°/360°（满级整圈）
      const lv = this.skills.t_whirl || 0;
      return (90 + 30*lv) * Math.PI / 180;
    }
    if(this.isVampire){
      // 🦇 血月轮：基础正面 90°（半角 45°，爪是"撕"不是"抡"），每级 +54° 总张角 → 144°/198°/252°/306°/360°
      return this.vampArc || (45 * Math.PI / 180);
    }
    if(this.isKnight){
      // 🛡 骑士重剑：固定正面 100°（半角 50°）—— 重剑抡得开，但没有加张角的技能（宽活交给盾）
      return KN_ARC;
    }
    const lv = this.skills.m_whirl || 0;                      // 🔁 回旋斩：0 = 未学
    const whirl = lv > 0 ? (90 + 54*lv) * Math.PI / 360 : 0;  // 90°→144°→198°→252°→306°→360°（半角）
    return Math.max(Math.PI/4, whirl);                        // 基础 90° 打底：回旋斩只加宽、不会变窄
  }
  slash(){
    // 🐣 新手缺陷「手滑」：每 4 棍有一棍打空 —— 只有挥动动画，**不结算任何伤害**（「手不抖了」解除）。
    //    必须放在最前面直接 return：打空那一下不能顺带触发剑气/爆炸/吸血等附带效果。
    if(this.isRookie && !this.skills.r_steady){
      this.rkSwings = (this.rkSwings || 0) + 1;
      if(this.rkSwings % 4 === 0){
        const aM = angleTo(this, this.aimPoint());
        this.slashArc = this.arcFromSkills();
        this.rkMissFx = 0.6;
        this.slashFx = 0.18;
        this.swingT = 0.18; this.swingDur = 0.18; this.swingDirs = [aM];
        G.effects.push({ type:'slash', x:this.x, y:this.y, dirs:[aM], r:this.slashRange, arc:this.slashArc, life:0.18, max:0.18 });
        SND.aRookie(); // 🎭 新手挥空：木棍闷响（也是"啪——什么都没打到"的听感）
        return;
      }
    }
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const owner = this.seat;
    // 🗡 张角每刀重算（不缓存、不受其它技能影响）：基础 90°，只有回旋斩能加宽
    this.slashArc = this.arcFromSkills();
    const dirs = [a]; // 始终只朝瞄准方向一刀：张开的是扇形张角，而不是多开几个方向
    const dmgBase = this.bulletDmg * roarMul(this) * CM().dmgMul * this.manaDmgMul(); // 🌌 世界2 魔力→普攻伤害调制
    const critLv = this.skills.crit || 0;
    const flameLv = this.skills.m_flame || 0;     // 🔥 烈焰斩
    const thunderLv = this.skills.m_thunder || 0; // ⚡ 引雷斩
    const cutLimit = 3 + (this.cutBonus || 0);    // ✂️ 裂空：一刀最多斩掉几发弹幕
    let cut = 0, hitAny = false, firstHit = null;
    const chained = [];
    let leeched = 0;                              // 🦇 本刀累计吸血（结算时封顶，见下方吸血鬼嗜血）
    this.vampHealAmt = 0;
    for(const dir of dirs){
      G.enemies.forEach(e => {
        if(e.dead || e.dying) return;
        const d = dist(this, e);
        if(d > this.slashRange + e.r) return;
        const ea = Math.atan2(e.y - this.y, e.x - this.x);
        // 角度差归一化到 0~π
        const diff = Math.abs(((ea - dir + Math.PI*3) % (Math.PI*2)) - Math.PI);
        if(diff > this.slashArc) return;
        if(e.isBullet){ // 挥砍格挡：斩掉敌方弹幕（🛡 骑士除外——它靠举盾挡弹幕，不靠剑斩）
          if(this.isKnight) return; // 骑士：剑不斩弹幕，弹幕交给正面举盾（knightShieldBlock）
          if(cut >= cutLimit) return;
          cut++;
          e.dead = true;
          spawnParticles(e.x, e.y, '#fff', 4);
          SND.shieldBlock();
          return;
        }
        if(e.invincible) return; // 冲撞怪冲锋无敌：斩不动（与子弹判定一致）
        let dmg = dmgBase, crit = false;
        if(critLv > 0 && Math.random() < critLv / 5){
          dmg = dmgBase * (2.0 + critLv / 5); // 暴击规则与子弹一致
          crit = true;
        }
        // 🗡 对 Boss 伤害 ×1.5：近战贴身风险高，对 Boss 线补偿（含小怪之怒；🌪️剑气弹不吃加成）
        e.takeDamage(Math.round(dmg * (e.isBoss ? 1.5 : 1)), crit ? '#f60' : '#fff', crit, this.seat); // 🗡 挥砍=近战来源
        e.lastHitIdx = owner; // 击杀归属（挑战模式吸血结算）
        // 大剑击退：力度与体型成反比（小怪弹得远、Boss 推得近）
        const kf = Math.max(120, Math.min(620, Math.round(6200 / e.r)));
        e.kbx = Math.cos(ea) * kf; e.kby = Math.sin(ea) * kf;
        hitAny = true;
        if(this.isDogmilk && !e.dead){
          // 🐶 野生狗奶：命中即「奶住」——敌人定身 + 持续掉血（秒伤 10，持续 等级×2 秒）
          const dur = Math.min((this.lv || 1) * 2 + (this.skills.dm_dur || 0) * 1.5, 6); // 奶力持久：每级 +1.5s（软上限 6s）
          if(e.isBoss) e.rooted = Math.max(e.rooted || 0, Math.min(dur, 1.8)); // Boss 只冻脚（遵循 Boss 免疫硬控铁律）
          else e.stun = Math.max(e.stun || 0, dur);                          // 小怪完全冻结
          e.kbx = 0; e.kby = 0;                                              // 奶住就钉在原地（不击退）
          e.dogDotT = dur; e.dogDotDps = (10 + (this.skills.dm_dot || 0) * 4) * 2; e.dogDotTick = 0; e.dogDotIdx = owner; // 奶水更浓：秒伤 10→逐增（每 0.5s 一跳）
          if(this.skills.dm_heal) this.hp = Math.min(this.maxHp, this.hp + 2 + 2 * (this.skills.dm_heal || 0)); // 舔舐伤口：命中回血
        }
        // 🦇 嗜血：**命中即回血**（不是击杀才回 —— 这是它薄血的活路）
        // ⚠️ 2026-10-06 修 bug：这里以前只判 `vampLeech > 0`，而 vampLeech 在构造函数里默认就是 1
        //    → 把吸血鬼的被动漏给了所有走 slash() 的近战（剑士 / 龙卷风 / 将军 一刀普攻就回 1 点血）。
        //    嗜血是吸血鬼的**专属**被动，必须按 isVampire 判定。
        if(this.isVampire && this.vampLeech > 0) leeched += this.vampLeech;
        if(!firstHit && !e.isBoss) firstHit = { x: e.x, y: e.y };
        if(flameLv > 0 && !e.dead){ // 🔥 烈焰斩：剑刃点火
          e.burnT = 3; e.burnStacks = Math.min((e.burnStacks||0) + 1, flameLv);
          e.burnDps = 4*flameLv*e.burnStacks; e.burnTick = 0; e.burnIdx = owner;
        }
        if(thunderLv > 0 && !chained.includes(e)){ // ⚡ 引雷斩：雷电弹向附近敌人（每跳 60% 伤害）
          chained.push(e);
          let from = e;
          for(let hop = 0; hop < thunderLv; hop++){
            let next = null, nd = (120 + 50*thunderLv) * visionZoom(); // 链距随视野等比缩小
            G.enemies.forEach(t => {
              if(t.dead || t.isBullet || t.invincible || chained.includes(t) || t === from) return;
              const d2 = dist(from, t);
              if(d2 < nd){ nd = d2; next = t; }
            });
            if(!next) break;
            next.takeDamage(Math.max(1, Math.round(dmgBase * 0.6)), '#8ef', false, this.seat);
            next.lastHitIdx = owner;
            G.effects.push({ type:'zap', x1:from.x, y1:from.y, x2:next.x, y2:next.y, life:0.15, max:0.15 });
            chained.push(next);
            from = next;
          }
        }
      });
    }
    // ⚔️ 对战：近战挥砍同样能砍到对手玩家（同一套扇形判定 + PVP 折算）
    if(G.pvp){
      const pvpHits = pvpMeleeHit(this, this.x, this.y, a, this.slashArc, this.slashRange, dmgBase, null, this);
      if(pvpHits > 0){
        hitAny = true;
        this.slashFx = 0.18;
        if(this.isVampire && this.vampLeech > 0) leeched += this.vampLeech * pvpHits; // 🦇 嗜血在 PVP 同样生效：撕到对手就回血（同样只限吸血鬼）
      }
    }
    if(leeched > 0 && !this.dead){ // 🦇 嗜血结算：单刀封顶 vampLeech×vampLeechCap，且不溢出最大生命
      const cap = this.vampLeech * (this.vampLeechCap || 3);
      const heal = Math.min(leeched, cap);
      const real = Math.min(heal, Math.max(0, this.maxHp - this.hp));
      this.vampHealAmt = heal;
      if(real > 0){
        this.hp += real;
        this.vampHealFx = 0.25;
        spawnParticles(this.x, this.y, '#ff4d6d', 5);
      }
    }
    if(this.explosive > 0 && firstHit) spawnExplosion(firstHit.x, firstHit.y, 40 + this.explosive*15, dmgBase*0.5*this.explosive, this.seat); // 💥 爆裂斩：斩中处爆炸（近战来源）
    if(this.dashPerSlash > 0){ // 💨 突进斩：出刀瞬间朝瞄准方向前冲（追击 + 突入弹幕）
      this.x = clamp(this.x + Math.cos(a)*this.dashPerSlash, this.r, WW()-this.r);
      this.y = clamp(this.y + Math.sin(a)*this.dashPerSlash, this.r, WH()-this.r);
    }
    if(this.guardRate > 0) this.guardTime = 0.45; // 🧱 铁壁：出刀后 0.45 秒内减伤
    // 🌪️ 剑气斩：出刀同时向前劈出一道剑气（伤害=斩击的 50%/75%/100%，可穿透 1/2/3 个敌人）
    //   近战角色的中距离手段：不用贴脸也能先削一波，但伤害低于本体一刀
    const galeLv = (this.skills.m_gale || 0) || (this.skills.v_gale || 0); // 🌪️ 剑气斩 / 🦇 血刃（同一个机制，两套名字）
    if(galeLv > 0){
      const wave = new Bullet(this.x, this.y, Math.cos(a)*420, Math.sin(a)*420,
        Math.max(1, Math.round(dmgBase * 0.25 * (galeLv + 1))), 8, galeLv, 0, 0, owner, critLv);
      wave.blade = true;                 // 剑气外观（月牙刀光，不是子弹小圆点）
      wave.life = 1.1 / visionZoom();    // 中距离射程（👁️视野扩大时同步换算，保持世界距离）
      G.bullets.push(wave);
    }
    SND.heroAtk(this.atkSndKind()); // 🎭 挥击音按角色分发：🗡剑士/🌀龙卷风/🦇吸血鬼/⚔️将军/🐣新手/⚙️工程师各一声
    if(hitAny) SND.hit();        // 命中再补一记打击反馈（挥空就只剩材质的"呼"声）
    this.slashFx = 0.18;
    // 🗡 挥砍动画：记录本次方向，draw 阶段让剑刃真的扫过去（张角越大扫过的弧越长，满级 360° 就是转一整圈）
    this.swingT = 0.18; this.swingDur = 0.18; this.swingDirs = dirs.slice();
    G.effects.push({ type:'slash', x:this.x, y:this.y, dirs, r:this.slashRange, arc:this.slashArc, life:0.18, max:0.18 });
  }
  takeDamage(d, src){
    if(this.invuln>0 || this.dead) return;
    // 🛡 勇士冲锋：完全无敌（不是受击无敌帧，是实打实整段不掉血）
    if(this.kInvT > 0) return;
    // 🛡 举盾挡下这一击（正面扇区来袭的攻击/弹幕；火花与音效在 knightShieldBlock 内）
    if(knightShieldBlock(this, src)) return;
    // ⚙️ 战车期间（用户定）：**被打了扣战车的血** —— 本体血量全程锁着，一分伤害都不落在人身上。
    //    （连带"共感疼痛"等挂在本体上的结算也一并跳过：伤害被车体挡在门外）
    // 🎻 拉曲被打断：曲子断了，只剩一半（剩下的立刻补回一半，不至于全白拉）
    if(this.isBard && this.bardSongT > 0){
      const rest = Math.round(this.bardHealRate * this.bardSongT * 0.5);
      this.bardSongT = 0; this.bardAcc = 0; this.bardInterruptFx = 0.5;
      this.bardMelIdx = BARD_MELODY.length; // 🎵 旋律立刻掐断（指针推到表尾 → 本帧不再放任何音）
      SND.bardBreak();                      // 🎻 断弦音：一声闷"嘣" + 快速滑下去，听得出曲子没了
      if(rest > 0) this.hp = Math.min(this.maxHp, this.hp + rest);
      spawnParticles(this.x, this.y - this.r, '#ffb0b0', 8);
    }
    if(this.veh){ this.vehHurt(d); return; }
    // 🛡 骑士给队友挂的「次数盾」：一击即破（破盾不掉血、不触发任何后续结算）
    if(this.kShieldCnt > 0){
      this.kShieldCnt--;
      this.kShieldFx = 0.25;
      spawnParticles(this.x, this.y - this.r, '#ffd166', 8);
      SND.knightBlock();
      return;
    }
    // 🩸 vampBlocked 是"血线吸附版"的遗留守卫：一代设定下 vampLinks 恒为空 → 恒返回 false → 不生效
    if(vampBlocked(this, src)) return;
    d = Math.round(d * pCM(this).takenMul); // 挑战模式：受伤修正（不死之身减伤 / 易伤体质增伤；双人按个人因子）
    // 🛡 骑士「勇士冲锋」光环：期间范围内队友减伤（默认 50%；范围减伤只挂在技能上，没有常驻光环）
    if(this.kAuraT > 0) d = Math.max(1, Math.round(d * (1 - (this.kAuraDR || 0.5))));
    // 🪨 魔法师土墙（掩体版）：不再有挂在身上的护盾池 —— 伤害全部由「立在身前的土墙」在
    //    updateWalls 阶段就拦下（弹幕撞墙即碎 / 怪被顶在墙外），打完墙才轮到本体
    if(this.guardTime > 0 && this.guardRate > 0) d = Math.max(1, Math.round(d * (1 - this.guardRate))); // 🧱 铁壁：出刀后 0.45 秒内减伤
    // 🌀 吸怪期间减伤（龙卷风基础 80%；风停即失效）。typeof 兜底：单元测试会用"假 this"直接调 takeDamage
    const tguard = (typeof this.tornadoGuardMul === 'function') ? this.tornadoGuardMul() : 0;
    if(tguard > 0) d = Math.max(1, Math.round(d * (1 - tguard)));
    // 双人挑战因子「共感疼痛」：一方受伤，另一方承受30%同额伤害（⚔️对战时关掉：对手不是队友，没有"共感"一说）
    if(G.coop && !G.pvp && CM().empathy){
      const other = G.players.find(q => q !== this);
      if(other && !other.dead && other.invuln <= 0){
        other.hp -= Math.round(d * 0.3);
        if(G.showDamage) spawnDamageText(other.x, other.y - other.r - 4, Math.round(d * 0.3), '#ff5b5b', false, true); // 🔢 共感疼痛也算受击
        other.invuln = 0.3;
        if(other.hp <= 0){ other.hp = 0; coopPlayerDie(other); }
      }
    }
    this.hp = Math.max(0, this.hp - d); // 血量下限0：任何伤害都不会让玩家血量变负数（HUD 永不显示负数）
    if(G.showDamage) spawnDamageText(this.x, this.y - this.r - 4, d, '#ff5b5b', false, true); // 🔢 受到伤害：红色伤害数字
    this.invuln = G.pvp ? 0.35 : 0.6;   // ⚔️ 对战：无敌帧缩短，单挑节奏更利落（不会一发一停顿）
    G.screenShake = 8;
    SND.hurt();
    if(this.hp <= 0){
      this.hp = 0;
      if(G.pvp) pvpResolveWin(this);   // ⚔️ 对战：谁先被打空谁输，一局定胜负（不走 coop 复活/游戏结束）
      else if(G.coop) coopPlayerDie(this);
      else gameOver();
    }
  }
  gainXP(n){
    // 经验归拾取者本人（双人各自计算，需求曲线与单人版一致，不再×2）
    n = Math.round(n * pCM(this).xpMul); // 挑战模式：经验修正（知识渊博 / 新手上路；双人按个人因子）
    if(G.horde) n = Math.round(n * HORDE_XP_MUL); // 🧟 尸潮：经验×1.6 —— 技能（自动习得）要跟得上怪潮密度，等级就是战力
    this.xp += n;
    while(this.xp >= this.xpNext){
      this.xp -= this.xpNext;
      this.lv++;
      this.xpNext = Math.floor(this.xpNext * 1.55 + 8);
      Achieve.checkLevel(this.lv);
      // 双人因子「教学相长」：一方升级，队友回 15% 最大生命（阵亡的不回、不复活）
      if(CM().teach && multiOn()){
        const mate = G.players.find(q => q !== this);
        if(mate && !mate.dead) mate.hp = Math.min(mate.maxHp, mate.hp + mate.maxHp * 0.15);
      }
      triggerLevelUp(this);
    }
  }
  draw(){
    // 阵亡：⚔️对战败者 = 瘫成一团灰影 + 头顶 ✕（没有复活这回事）；👥双人阵亡 = 身体变灰 + 复活倒计时波数
    if(this.dead){
      ctx.save();
      if(G.pvp){
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#777';
        ctx.beginPath(); ctx.ellipse(this.x, this.y + this.r*0.45, this.r*1.25, this.r*0.55, 0, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 0.85; ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        const k = this.r*0.42;
        ctx.beginPath();
        ctx.moveTo(this.x - k, this.y - this.r*0.9 - k); ctx.lineTo(this.x + k, this.y - this.r*0.9 + k);
        ctx.moveTo(this.x + k, this.y - this.r*0.9 - k); ctx.lineTo(this.x - k, this.y - this.r*0.9 + k);
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#888';
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
        const left = Math.max(0, this.reviveWave - G.wave); // 还差几个波复活
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(left, this.x, this.y + 5);
      }
      ctx.restore();
      return;
    }
    // 🚜 战车（大招形态）：车体把本体罩住 —— 单独一套绘制（车体 + 履带 + 双炮管 + 装甲条 + 冷却环）
    if(this.veh){ drawPlayerVehicle(this); return; }
    // 🔆 激光光束（画在身体底下：光柱从身上射出去，身体压在光柱根部）
    //    🚫不穿透：每道光束画到它自己的截断点（墙/第一个敌人），光柱正好停在敌人身上
    //    🔮棱镜反射：学了以后每束是一条折线（path），逐段描一遍即可，折返点画一圈棱镜环
    if(this.isLaser && this.beamOn){
      const pulse = 0.85 + 0.15 * Math.sin(G.time * 30);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for(let i = 0; i < this.beamAngs.length; i++){
        const st = this.beamStops && this.beamStops[i];
        let path = st && st.path && st.path.length > 1 ? st.path : null;
        if(!path){ // 兜底（理论上不会走到）：单段直线
          const bl = this.beamLens[i] != null ? this.beamLens[i] : this.beamLen;
          path = [{ x: this.x, y: this.y },
                  { x: this.x + Math.cos(this.beamAngs[i]) * bl, y: this.y + Math.sin(this.beamAngs[i]) * bl }];
        }
        const stroke = (color, width) => {
          ctx.strokeStyle = color; ctx.lineWidth = width;
          ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
          for(let p = 1; p < path.length; p++) ctx.lineTo(path[p].x, path[p].y);
          ctx.stroke();
        };
        stroke('rgba(216,140,255,.28)', this.beamWidth * 3.0 * pulse); // 外发光
        stroke('#f0a6ff', this.beamWidth * 1.3);                       // 光束本体
        stroke('#fff', Math.max(1.6, this.beamWidth * 0.42));          // 内核
        // 命中亮斑（每个被光打到的敌人身上一个）+ 折返点棱镜环
        const hits = (st && st.hits) || [];
        for(let k = 0; k < hits.length; k++){
          const pt = path[k + 1]; if(!pt) continue;
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          ctx.beginPath(); ctx.arc(pt.x, pt.y, this.beamWidth * 1.5 * pulse, 0, Math.PI*2); ctx.fill();
          if(k < hits.length - 1){ // 🔮 折返点：一圈紫环，一眼看出光在这里弹了一下
            ctx.strokeStyle = 'rgba(226,170,255,.9)';
            ctx.lineWidth = 2.2;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, this.beamWidth * 2.2 * pulse, 0, Math.PI*2); ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
    // 🔆 旋转扫射：6 道自转光束（穿人穿怪，只在屏幕边缘停）—— 每道一个色相（棱镜色散）：
    //    扇区判定用的就是这些角度（laserUltAngs），所以"画出来的光"和"打到的范围"永远一致
    if(this.isLaser && this.laserUltT > 0){
      const spin = 0.85 + 0.15 * Math.sin(G.time * 26);
      const angs = this.laserUltAngs();
      ctx.save();
      ctx.lineCap = 'round';
      for(let i = 0; i < angs.length; i++){
        const a = angs[i];
        const len = this.rayToWall(a);
        const ex = this.x + Math.cos(a) * len, ey = this.y + Math.sin(a) * len;
        const hue = 265 + (i / angs.length) * 110; // 紫 → 粉 → 青
        ctx.strokeStyle = `hsla(${hue},100%,72%,${0.22 * spin})`;
        ctx.lineWidth = this.beamWidth * 3.4 * spin;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = `hsla(${hue},100%,82%,.95)`;
        ctx.lineWidth = this.beamWidth * 1.15;
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = Math.max(1.4, this.beamWidth * 0.4);
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.restore();
    }
    // body
    ctx.save();
    if(this.invuln>0 && Math.floor(this.invuln*20)%2) ctx.globalAlpha=0.5;
    const bodyColor = this.isBard ? '#7ee0c0' : (this.dotFlash>0 ? '#5c5' : (this.seat === 2 ? '#4ade80' : (this.seat === 1 ? '#f84' : (this.isTornado ? '#8ef0ff' : (this.isGeneral ? '#e8c25a' : (this.isVampire ? '#c0304a' : (this.isEngineer ? '#ff8a3d' : (this.isBoomerang ? '#ff5fa2' : (this.isKetchup ? '#e63b2e' : (this.isKnight ? '#7d9cc0' : (this.melee ? (this.isSpring ? '#6ee7a0' : '#eaf6ff') : (this.isLaser ? this.laserBodyColor() : (this.isBomber ? '#ffb347' : (this.isVenom ? '#9ef04a' : (this.isMage ? '#b48cff' : '#4cf'))))))))))))))); // 3P 绿 / 2P 橙 / 1P 蓝（🌀龙卷风青蓝 / ⚔️将军金甲 / 🦇吸血鬼血红 / ⚙️工程师橙红 / 🪃回旋镖琥珀 / 🍅番茄酱之神番茄红 / 🛡骑士钢蓝 / 🗡剑士亮银 / 🔆激光=热量体色：亮紫→红 / 💣爆破金黄 / 🧪毒液毒绿 / 🔮魔法师紫罗兰 / 🥎投掷者深蓝）；中毒变绿
    // 🎻 拉曲中：脚下两圈同色音环 + 上升的音符（靠"外圈"表达，不新增部件）
    if(this.isBard && this.bardSongT > 0){
      const kk = clamp(this.bardSongT / Math.max(0.001, this.bardSongMax), 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.16 + 0.08*Math.sin(G.time*6);
      ctx.fillStyle = '#7ee0c0';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.bardHealR, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.bardHealR * (1 - 0.05*Math.sin(G.time*3)), 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 8 + 12*(1 - kk), 0, Math.PI*2); ctx.stroke();
      ctx.font = Math.round(this.r*0.95) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for(let i = 0; i < 3; i++){
        const ph = (G.time*0.55 + i/3) % 1;
        ctx.globalAlpha = 0.9 * (1 - ph);
        ctx.fillStyle = '#ffe9a8';
        ctx.fillText('♪', this.x + Math.cos(i*2.1 + G.time*0.9)*this.r*1.15, this.y - this.r*0.5 - ph*this.r*2.4);
      }
      ctx.restore();
    }
    // ===== 角色本体：体色实心圆 + 白描边（所有角色共用，武器/配饰再叠上去）=====
    ctx.fillStyle = bodyColor;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    drawHeroCrest(this); // 🐶🃏🪃 头部配饰（专属外观标识）：靠形状区分，不依赖身体颜色
    // 朝向（2P 朝手柄光标；1P 朝鼠标）：仍是一根白色朝向线——剑士的这条线就是他的大剑
    const a = angleTo(this, this.aimPoint());
    if(this.melee){
      // 🗡 挥砍动画：出刀后剑刃由一侧扫到另一侧再收回，身后拖出渐隐刀光
      // 🌀 龙卷风：同一个动画，但张角是整圈（swingAngle 直接扫 360°）、刃色换成青蓝（风刃）
      const swinging = this.swingT > 0 && this.swingDirs.length > 0;
      const k = swinging ? 1 - this.swingT / this.swingDur : 1; // 动画进度 0→1
      const bladeLen = this.r * (this.slashFx > 0 ? 2.9 : 2.4); // 挥砍瞬间剑身更长更亮
      const dirs = swinging ? this.swingDirs : [a];
      const ghost = this.isTornado ? '140,240,255' : '255,209,102';
      ctx.save();
      ctx.lineCap = 'round';
      // 🛡 骑士起手式（前摇）：剑举过头顶向后拉开（比瞄准角再仰 1.1 弧度）——看得见的"这一刀要落了"
      const raised = (!swinging && this.isKnight && this.kNWindT > 0);
      dirs.forEach(dir => {
        const da = swinging ? swingAngle(dir, this.slashArc, k) : (raised ? dir - 1.1 : dir); // 刀锋当前角度
        if(swinging){ // 刀光拖尾：从起手角到剑刃当前位置的渐隐弧（越靠刀锋越亮越粗）
          const from = dir - this.slashArc, R = this.slashRange, seg = this.isTornado ? 12 : 6; // 整圈多切几段，弧线更顺
          for(let i=0;i<seg;i++){
            const s0 = from + (da - from) * (i/seg);
            const s1 = from + (da - from) * ((i+1)/seg);
            if(s1 <= s0) continue;
            const st = (i+1)/seg;
            ctx.strokeStyle = `rgba(255,255,255,${0.8*st*(1-k*0.4)})`;
            ctx.lineWidth = 3 + 5.5*st;
            ctx.beginPath(); ctx.arc(this.x, this.y, R, s0, s1); ctx.stroke();
          }
          ctx.strokeStyle = `rgba(${ghost},${0.6*(1-k)})`; // 内圈残影（剑士金 / 龙卷风青）
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, R*0.7, from, da); ctx.stroke();
        }
        // 🗡 手持近战武器（剑士大剑 / 龙卷风双刃 / 将军长枪），跟着挥砍角度一起摆
        drawMeleeWeapon(this, da, bladeLen, this.r);
      });
      // 🛡 骑士举盾：非挥砍时（含攻击前摇）左手塔盾立在身前——攻击前摇期间盾仍举着（可挡），仅挥砍动画中收盾；盾面朝向 = 瞄准方向（玩家用鼠标转盾）
      if(this.isKnight && !swinging) drawKnightShield(this, a);
      ctx.restore();
    } else if(this.isMage){
      // 🧹 扫帚飞行（主动技能）：脚下横着一把扫帚（两头露在身体外）+ 身后紫色速度拖尾
      if(this.broomT > 0 || this.broomFx > 0 || this.broomLandFx > 0){
        const bx = Math.PI/2;                       // 扫帚横着 = 与朝向垂直
        const cx = Math.cos(a + bx), cy = Math.sin(a + bx);
        const L = this.r * 1.85, lift = this.broomT > 0 ? this.r * 0.5 : this.r * 0.28;
        const pa = this.broomT > 0 ? 1 : Math.max(0, (this.broomFx || this.broomLandFx) / 0.4);
        ctx.save();
        ctx.globalAlpha = pa;
        if(this.broomT > 0){ // 速度拖尾：三条紫色气流线（越靠边越短）
          ctx.strokeStyle = 'rgba(190,150,255,.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
          for(let i = -1; i <= 1; i++){
            const off = i * this.r * 0.72, len = this.r * (1.7 - Math.abs(i) * 0.45);
            const sx = this.x - Math.cos(a) * this.r * 0.9 + cx * off, sy = this.y - Math.sin(a) * this.r * 0.9 + cy * off;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - Math.cos(a) * len, sy - Math.sin(a) * len);
            ctx.stroke();
          }
        }
        // 扫帚杆
        const hx = this.x, hy = this.y + lift;
        ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx - cx * L, hy - cy * L);
        ctx.lineTo(hx + cx * L, hy + cy * L);
        ctx.stroke();
        // 扫帚头（杆尾那端散出一簇金黄毛刷）
        const tx = hx - cx * L, ty = hy - cy * L;
        ctx.strokeStyle = '#e8c46a'; ctx.lineWidth = 2.6;
        for(let i = -2; i <= 2; i++){
          const k = i * 0.75;                        // 毛刷张开角度
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - cx * 15 + (-cy) * k * 7, ty - cy * 15 + cx * k * 7 + 3);
          ctx.stroke();
        }
        ctx.restore();
      }
      // 🔮 魔法师武器「法杖」：木杆 + 握把金环 + 顶端宝珠（宝珠颜色随本次魔法：火橙红 / 冰蓝 / 土青绿）
      //    施法瞬间宝珠变大爆亮 + 外扩一圈法术环（一眼看出"刚放了什么"）——统一画法，随角色半径等比缩放
      drawMageWeapon(this, a, this.r);
    } else if(this.isKetchup){
      // 🍅 番茄酱之神：手持一包麦当劳番茄酱（捏爆时抖一下 + 滴酱）
      drawKetchupWeapon(this, a, this.r);
    } else if(this.isBard){
      // 🎻 吟游诗人：手持一把鲁特琴（琴身 + 琴颈 + 三根弦，不加任何配饰）
      drawBardLute(this, a, this.r);
    } else {
      // 🔫 远程四把手持武器：射手双管手枪 / 激光发射器 / 爆破炮 / 毒液喷枪
      drawGunWeapon(this, a, this.r);
    }
    ctx.restore();
    // 🔆 旋转扫射冷却环（亮紫）：冷却中画进度弧，充满即可放；扫射期间改画一圈自转的虚线环 + 起手外扩环
    //    （原来那圈"热量环"已取消 —— 散热进度现在直接看体色：越红越热，见 laserBodyColor）
    if(this.isLaser){
      const frac = clamp(1 - this.laserUltCD / Math.max(0.001, this.laserUltCDMax), 0, 1);
      const spinning = this.laserUltT > 0;
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = spinning ? '#ffd0ff' : (frac >= 1 ? '#f0a6ff' : '#7a4a9a');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(spinning){
        ctx.strokeStyle = `rgba(240,166,255,${0.35 + 0.3*Math.sin(G.time*12)})`;
        ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 14, this.laserUltA, this.laserUltA + Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
      } else if(this.laserUltFx > 0){
        ctx.strokeStyle = `rgba(240,166,255,${Math.max(0, this.laserUltFx)/0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.4 - this.laserUltFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 💣 轰炸区冷却环（金黄）：冷却中画进度弧，充满即可投放；投放瞬间再补一圈外扩金环
    if(this.isBomber){
      const frac = clamp(1 - this.bombCD / Math.max(0.001, this.bombCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ffe08a' : '#ffa03a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.bombFx > 0){
        ctx.strokeStyle = `rgba(255,209,102,${Math.max(0, this.bombFx)/0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.35 - this.bombFx)*60, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🔮 魔法师：土墙冷却环（土黄）—— 场上立着自己的墙时视为"已就绪"，否则按冷却进度充能
    if(this.isMage){
      const myWall = wallOf(this);
      // 场上立着自己的墙 → 环显示墙的剩余次数；否则显示立墙冷却进度
      const frac = myWall ? clamp(myWall.hits / Math.max(1, myWall.maxHits), 0, 1)
                          : clamp(1 - this.wallCd / Math.max(0.001, this.wallCdMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      // 立着墙=土棕（血量）/ 冷却好=亮土黄（可以立墙）/ 冷却中=暗土
      ctx.strokeStyle = myWall ? '#c9a86a' : (frac >= 1 ? '#e8c25a' : '#6b5a2f');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.wallFx > 0){ // 立墙瞬间：外扩土黄环（墙体本身由 drawWalls 画）
        ctx.strokeStyle = `rgba(216,180,90,${Math.max(0, this.wallFx)/0.4})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.4 - this.wallFx)*70, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🧹 扫帚飞行环（紫罗兰）：飞行中 = 剩余时间弧（亮紫 + 呼吸光）；冷却中 = 充能进度弧（暗紫 → 满则亮）
    //    画在 r+14（土墙冷却环 r+7 的外侧），两圈同心不打架
    if(this.isMage){
      ctx.save();
      const rB = this.r + 14;
      if(this.broomT > 0){
        const frac = clamp(this.broomT / Math.max(0.001, this.broomDur), 0, 1);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = 'rgba(190,150,255,.9)';
        ctx.beginPath(); ctx.arc(this.x, this.y, rB, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
        ctx.strokeStyle = `rgba(220,190,255,${0.3 + 0.28*Math.sin(G.time*14)})`; // 飞行中的呼吸光，一眼看出"还在骑"
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, rB + 4, 0, Math.PI*2); ctx.stroke();
      } else {
        const frac = clamp(1 - this.broomCD / Math.max(0.001, this.broomCDMax), 0, 1);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,.14)';
        ctx.beginPath(); ctx.arc(this.x, this.y, rB, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = frac >= 1 ? '#d9b8ff' : 'rgba(150,110,220,.8)';
        ctx.beginPath(); ctx.arc(this.x, this.y, rB, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      }
      if(this.broomFx > 0){ // 起飞瞬间：外扩紫环
        ctx.strokeStyle = `rgba(200,160,255,${Math.max(0, this.broomFx)/0.45})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, rB + (0.45 - this.broomFx)*95, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    drawMageWheel(this); // 🔮 法术轮盘 HUD（脚下三点：选中的法术 + 各自冷却，见函数定义）
    // 🌀 龙卷风冷却环（青蓝）：冷却中画进度弧，充满即可突进；起风瞬间补一圈外扩青环；
    //    吸怪期间再加一圈旋转虚线护体环（= 正在吃 60% 减伤，给玩家一个看得见的提示）
    if(this.isTornado){
      const frac = clamp(1 - this.torCD / Math.max(0.001, this.torCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#a8f4ff' : '#4ab8d8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.tornadoGuardMul() > 0){
        ctx.strokeStyle = `rgba(140,240,255,${0.45 + 0.3*Math.sin(G.time*10)})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([9, 7]);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 13, G.time*4, G.time*4 + Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
      }
      if(this.torFx > 0){
        ctx.strokeStyle = `rgba(140,240,255,${Math.max(0, this.torFx)/0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.35 - this.torFx)*60, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🐣 新手：战吼冷却环（满 = 亮黄）+ 吼的瞬间一圈外扩声波 + 「手滑！」飘字 + 📣 战吼增伤环
    if(this.isRookie){
      const frac = clamp(1 - this.rkCryCD / Math.max(0.001, this.rkCryCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ffe08a' : '#8d9bb0';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      if(this.rkCryFx > 0){
        const p0 = 1 - this.rkCryFx / 0.35;
        ctx.strokeStyle = `rgba(255,225,140,${Math.max(0, this.rkCryFx)/0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.rkCryR * (0.4 + 0.6*p0), 0, Math.PI*2); ctx.stroke();
      }
      if(this.rkMissFx > 0){ // 🐣「手滑！」：这一棍打空了（纯提示，不掉血、不伤人）
        ctx.globalAlpha = clamp(this.rkMissFx / 0.6, 0, 1);
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('手滑！', this.x, this.y - this.r - 26);
      }
      ctx.restore();
    }
    // 📣 战吼增伤状态（**所有玩家**都画，不只新手）：金色双环呼吸 + 剩余时间小弧 —— 一眼看出"我现在打得痛"
    if(this.rageT > 0){
      ctx.save();
      const frac = clamp(this.rageT / ROAR_DUR, 0, 1);
      ctx.strokeStyle = `rgba(255,209,102,${0.45 + 0.3*Math.sin(G.time*10)})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 20, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,209,102,.9)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 20, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      ctx.restore();
    }
    // ⚙️ 工程师：大招「建造战车」冷却环（满 = 亮橙可开；施工中改画施工进度）
    //    + 起建/上车/炸车瞬间一圈外扩橙环 + 自动布塔倒计时小点（外圈蓝弧）
    if(this.isEngineer){
      const building = this.vehBuild > 0;
      const frac = building ? clamp(1 - this.vehBuild / Math.max(0.001, this.vehBuildMax), 0, 1)
                            : clamp(1 - this.vehCD / Math.max(0.001, this.vehCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = building ? '#ffd166' : (frac >= 1 ? '#ffb347' : '#8d9bb0');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      if(!building && frac >= 1){ // 大招就绪：外圈一圈呼吸橙环（"随时能上车"）
        ctx.strokeStyle = `rgba(255,179,71,${0.22 + 0.18*Math.sin(G.time*6)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 12, 0, Math.PI*2); ctx.stroke();
      }
      if(this.vehFx > 0){ // 起建 / 上车 / 炸车瞬间：一圈外扩橙环
        ctx.strokeStyle = `rgba(255,179,71,${clamp(this.vehFx / 0.6, 0, 1)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.6 - this.vehFx) * 120, 0, Math.PI*2); ctx.stroke();
      }
      // 自动布塔进度小点（外圈，绕身一圈 = 又该立一根新塔了）
      const auto = clamp(1 - this.engT / Math.max(0.001, this.engEvery), 0, 1);
      ctx.strokeStyle = 'rgba(120,200,255,.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 13, -Math.PI/2, -Math.PI/2 + Math.PI*2*auto); ctx.stroke();
      ctx.restore();
    }
    // 🛡 骑士：主动技「勇士冲锋」冷却环（满 = 亮金可冲）+ 冲锋期间的"无敌金环" + 起手式剑鸣闪光
    if(this.isKnight){
      const frac = clamp(1 - this.knCD / Math.max(0.001, this.knCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ffd166' : '#8d9bb0';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      if(this.kInvT > 0){ // 冲锋中：金色无敌环（呼吸亮度 = 还剩多久）
        const t = clamp(this.kInvT / Math.max(0.001, this.knDurMax || KN_CHARGE_T), 0, 1);
        ctx.strokeStyle = `rgba(255,209,102,${0.55 + 0.35*Math.sin(G.time*12)})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 11, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,209,102,.95)'; // 剩余时间小弧
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 11, -Math.PI/2, -Math.PI/2 + Math.PI*2*t); ctx.stroke();
        // 增益范围圈（队友在这圈里才吃得到次数盾+减伤）
        ctx.strokeStyle = `rgba(255,209,102,${0.14 + 0.08*Math.sin(G.time*8)})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.kAuraR || KN_AURA_R, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
      }
      if(this.kNFx > 0){ // 起手式：头顶一圈剑鸣闪光（"要落了"）
        ctx.strokeStyle = `rgba(255,255,255,${clamp(this.kNFx / Math.max(0.001, this.kNWindMax || KN_WINDUP), 0, 1) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 5 + (1 - this.kNFx / (this.kNWindMax || KN_WINDUP)) * 14, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🥊 弹簧：主动技「弹簧钩」冷却环（满 = 亮青可钩）+ 蓄力上弦圈（蓄得越久涨得越满）+ 牵引无敌环
    if(this.isSpring){
      const frac = clamp(1 - this.spCD / Math.max(0.001, this.spCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#7fe8c0' : '#8d9bb0';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
      if(this.spCharging){ // 蓄力中：内圈随蓄力档往满涨（满蓄时更亮）
        const cf = clamp((this.spChargeT||0) / SP_CHARGE_MAX, 0, 1);
        ctx.strokeStyle = `rgba(255,209,102,${0.5 + 0.45*cf})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 3, -Math.PI/2, -Math.PI/2 + Math.PI*2*cf); ctx.stroke();
      }
      if(this.spPull){ // 牵引中：青色无敌环（呼吸亮度 = 还在飞）
        ctx.strokeStyle = `rgba(127,232,192,${0.55 + 0.35*Math.sin(G.time*12)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 11, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🛡 骑士给挂上的「次数盾」（**所有玩家**都画）：头顶一枚小金盾 + 剩余层数 —— 一击即破的视觉提示
    if(this.kShieldCnt > 0){
      ctx.save();
      const by = this.y - this.r - 20, bs = this.kShieldFx > 0 ? 1.25 : 1;
      ctx.globalAlpha = this.kShieldFx > 0 ? 1 : 0.92;
      ctx.translate(this.x, by); ctx.scale(bs, bs);
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(0, -7); ctx.lineTo(6, -4); ctx.lineTo(6, 3); ctx.lineTo(0, 8); ctx.lineTo(-6, 3); ctx.lineTo(-6, -4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#8a6a1f'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#8a6a1f'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(this.kShieldCnt), 0, 3);
      ctx.restore();
    }
    // 🧪 毒素进度环（毒绿）：显示"离下一滩毒液还差几发子弹"（射满一圈就是毒液弹）；
    //    射出毒液弹的瞬间补一圈外扩毒环（枪口一绿），让"这发是毒的"看得见
    if(this.isVenom){
      const frac = clamp((this.venomCount || 0) / Math.max(1, this.venomEvery), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 0.8 ? '#d8ff7a' : '#7cc23a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.venFx > 0){
        ctx.strokeStyle = `rgba(180,255,110,${Math.max(0, this.venFx)/0.25})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.25 - this.venFx)*60, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🪃 回旋镖：大招「万镖齐发」冷却环（琥珀）——冷却中画进度弧，充满即可甩一圈；甩的瞬间补一圈外扩环
    //    另外：接住飞回来的镖时，贴身处闪一圈青环（"接住了"的即时反馈）
    if(this.isBoomerang){
      const frac = clamp(1 - this.bmUltCD / Math.max(0.001, this.bmUltCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ffd166' : '#a8762f';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.bmUltFx > 0){
        ctx.strokeStyle = `rgba(255,209,102,${Math.max(0, this.bmUltFx)/0.35})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.35 - this.bmUltFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      if(this.bmCatchFx > 0){ // 接住回镖：贴身一圈青色回声
        ctx.strokeStyle = `rgba(142,240,255,${Math.max(0, this.bmCatchFx)/0.22})`;
        ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 3, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🐶 野生狗奶大招「春秋邻域」冷却环（毒绿，与大招场地绿环同色系）：冷却中画进度弧，充满即可一键清场；
    //    起手瞬间补一圈外扩绿环 —— 180 秒的大招，环的存在就是提醒"这波到底能不能清场"
    if(this.isDogmilk){
      const frac = clamp(1 - this.dogCD / Math.max(0.001, this.dogCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#c8ff8a' : '#4a7a2a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.dogFx > 0){ // 起手瞬间：外扩毒绿环
        ctx.strokeStyle = `rgba(158,240,74,${Math.max(0, this.dogFx)/0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.3 - this.dogFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🃏 卡牌大师大招「飞机」冷却环（扑克紫）：冷却中画进度弧，充满即可甩飞机；甩的瞬间补一圈外扩紫环
    if(this.isCardmaster){
      const frac = clamp(1 - this.cmCD / Math.max(0.001, this.cmCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#c8b0ff' : '#4a3a8a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.cmFx > 0){ // 甩飞机瞬间：外扩紫环
        ctx.strokeStyle = `rgba(160,130,255,${Math.max(0, this.cmFx)/0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.3 - this.cmFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🗡 斩灭冷却环（金）：冷却中画进度弧，充满即可一键清场；施放瞬间补一圈外扩金环
    if(this.isSwordsman){
      const frac = clamp(1 - this.swCD / Math.max(0.001, this.swCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ffe08a' : '#c8a03a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.swFx > 0){
        ctx.strokeStyle = `rgba(255,225,140,${Math.max(0, this.swFx)/0.45})`;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.45 - this.swFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🍅 「吃番茄酱」冷却环（红）：冷却中画进度弧，充满即可回血；吃下的瞬间补一圈外扩绿环（"吃饱了"）
    if(this.isKetchup){
      const frac = clamp(1 - this.kCD / Math.max(0.001, this.kCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = frac >= 1 ? '#ff8a7a' : '#a02c22';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(this.kEatFx > 0){
        ctx.strokeStyle = `rgba(95,209,138,${Math.max(0, this.kEatFx)/0.35})`;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.35 - this.kEatFx)*80, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🏹 环形弹幕冷却环（蓝）：冷却中画进度弧；连放期间补一圈旋转虚线环（提示"正在放"）
    if(heroKind(this) === 'gunner'){
      const frac = clamp(1 - this.ringCD / Math.max(0.001, this.ringCDMax), 0, 1);
      const casting = this.ringLeft > 0;
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = casting ? '#bfe9ff' : (frac >= 1 ? '#8fd6ff' : '#3a7fa8');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac);
      ctx.stroke();
      if(casting){
        ctx.strokeStyle = `rgba(160,220,255,${0.35 + 0.3*Math.sin(G.time*14)})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 13, G.time*5, G.time*5 + Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
      } else if(this.ringFx > 0){
        ctx.strokeStyle = `rgba(150,215,255,${Math.max(0, this.ringFx)/0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.3 - this.ringFx)*70, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // ⚔️ 将军双技能冷却环（两条线各画一圈，一眼分清「能不能冲」和「下一个兵还有多久」）
    //    ① 内圈（金，r+7）= 🖱冲刺：冷却中画进度弧、充满变亮金即可左键突进；冲刺瞬间补一圈外扩金环
    //    ② 外圈（银青，r+13）= 🪖征召：离下一名小兵还有多久（自动出兵，不需按键）；出兵瞬间外圈亮起 + 外扩环
    if(this.isGeneral){
      const fDash = clamp(1 - this.genCD / Math.max(0.001, this.genCDMax), 0, 1);
      const fSum  = clamp(1 - this.summonT / Math.max(0.001, this.summonEvery), 0, 1);
      ctx.save();
      // ① 内圈：冲刺（与其它角色同一口径：底环 + 进度弧）
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = fDash >= 1 ? '#ffe08a' : '#c8a03a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*fDash);
      ctx.stroke();
      // ② 外圈：征召（细一档，避免和冲刺环抢视线）
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 13, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = fSum >= 1 ? '#dff2ff' : '#7f93a8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 13, -Math.PI/2, -Math.PI/2 + Math.PI*2*fSum);
      ctx.stroke();
      // 冲刺瞬间：外扩金环
      if(this.genFx > 0){
        ctx.strokeStyle = `rgba(255,225,140,${Math.max(0, this.genFx)/0.3})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.3 - this.genFx)*80, 0, Math.PI*2); ctx.stroke();
      }
      // 出兵瞬间：外圈亮起 + 外扩银环
      if(this.sumFx > 0){
        ctx.strokeStyle = `rgba(223,242,255,${Math.max(0, this.sumFx)/0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 13 + (0.45 - this.sumFx)*70, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🦇 吸血鬼主动技冷却环（血红，r+7）= 🖱血月突袭：充满变亮即可左键突进切击；突袭瞬间补一圈外扩血环
    //    🩸 另外：回血瞬间内圈泛一层红光 —— 一眼看出"这一刀回上来了"（薄血角色最需要这个反馈）
    if(this.isVampire){
      const fDash = clamp(1 - this.vampCD / Math.max(0.001, this.vampCDMax), 0, 1);
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = fDash >= 1 ? '#ff8fa3' : '#8e2a44';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*fDash);
      ctx.stroke();
      if(this.vampFx > 0){        // 扑击瞬间：外扩血环
        ctx.strokeStyle = `rgba(255,77,109,${Math.max(0, this.vampFx)/0.32})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.32 - this.vampFx)*110, 0, Math.PI*2); ctx.stroke();
      }
      if(this.vampHealFx > 0){    // 🩸 回血瞬间：贴着身体的内圈红光
        ctx.strokeStyle = `rgba(255,77,109,${Math.max(0, this.vampHealFx)/0.25})`;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 2, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 🎻 吟游诗人主动技「回旋曲」冷却环（淡金，r+7）：充满变亮即可左键开拉。
    //    引导中不画进度（CD 已扣完），改画一圈自转虚线环 = 「正在拉曲，别打断」；
    //    被打断时补一圈灰红外扩环（"啪"地断了）——治疗位最需要"我这一曲没拉完"的即时反馈
    if(this.isBard){
      const fSong = clamp(1 - this.bardCD / Math.max(0.001, this.bardCDMax), 0, 1);
      const singing = this.bardSongT > 0;
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,255,255,.16)';   // 底环（永远在，标出"这里有个技能"）
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
      if(singing){
        ctx.strokeStyle = '#ffe9a8';
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -G.time * 26;         // 自转：视觉上"弦还在震"
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = fSong >= 1 ? '#ffe9a8' : '#8a7a45'; // 充满亮金 / 充能中暗金
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r + 7, -Math.PI/2, -Math.PI/2 + Math.PI*2*fSong);
        ctx.stroke();
        if(fSong >= 1){ // 就绪：外圈淡金呼吸光，一眼看出"现在能拉"
          ctx.globalAlpha = 0.22 + 0.18*Math.sin(G.time*4);
          ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7, 0, Math.PI*2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      if(this.bardInterruptFx > 0){ // 断曲：灰红外扩环
        ctx.strokeStyle = `rgba(255,120,110,${Math.max(0, this.bardInterruptFx)/0.5})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 7 + (0.5 - this.bardInterruptFx)*90, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    }
    // 眩晕状态提示：头顶旋转星星
    if(this.stun>0) drawStunStars(this.x, this.y - this.r - 12, 9);
    if(this.frozen>0) drawFrozenShell(this.x, this.y, this.r, this.frozen, this.frozenMax); // ❄️ 玩家被冰霜冻住也画冰壳（⚔️对战）
    // shield
    if(this.shield>0){
      for(let i=0;i<this.shield;i++){
        const sa = this.shieldAngle + i*(Math.PI*2/this.shield);
        const sx=this.x+Math.cos(sa)*45, sy=this.y+Math.sin(sa)*45;
        ctx.fillStyle='rgba(74,207,255,.5)';
        ctx.beginPath(); ctx.arc(sx,sy,16,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = this.shieldFlash>0 ? '#fff' : '#4cf'; // 抵挡时白闪
        ctx.lineWidth = this.shieldFlash>0 ? 3 : 2; ctx.stroke();
      }
    }
  }
}

// ===== BULLET =====
class Bullet {
  constructor(x,y,vx,vy,dmg,r,pierce,explosive,homing,ownerIdx,critLv,venom,ketPack){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;
    this.dmg=dmg;this.r=r;this.pierce=pierce;this.explosive=explosive;
    this.homing=homing;this.dead=false;this.hits=new Set();
    this.ownerIdx = ownerIdx||0; this.critLv = critLv||0; // 归属玩家（双人吸血/暴击结算）
    this.life = 2.5 / visionZoom(); this.trail=[]; // 👁️视野扩大：世界变大，寿命同比延长保持有效射程
    this.exploded=false; // 爆炸只触发一次
    this.blade=false;    // 🌪️剑气斩：月牙刀光外观（朝向飞行方向的白色弯刃，不是小圆点）
    this.venom = venom || null; // 🧪 毒液弹：携带的「毒液领域」参数（普通子弹恒 null）
    this.venomDropped = false;  // 毒素只留一滩（命中 / 出界二选一，谁先到算谁）
    this.ketchupPack = ketPack || null; // 🍅 番茄酱包：命中减速 + 概率爆大酱潭的参数（普通子弹恒 null）
    this.ketDropped = false;  // 🍅 番茄酱包：爆潭只铺一次（命中 / 碰墙 / 出界 三选一，谁先到算谁，防止重复铺潭）
    this.fireBall = false;      // 🔥 魔法师火球：外观走火焰配色（由 castFireMagic 置位）
    this.fireBurn = null;       // 🔥 火球命中的点燃参数 {t, dps}
    // 🃏 卡牌大师：卡牌弹丸的牌面 + 王炸秒杀标记
    this.cardVal = 0;           // 牌面点数（0 = 王）；绘制用
    this.cardSuit = -1;         // 花色 0..3（-1 = 王）
    this.cardJoker = 0;         // 0=普通牌 / 1=小王 / 2=大王
    this.instakill = false;     // 王炸：命中即秒杀（无视血量，Boss 也秒）
    this.cmRoyal = false;       // 🃏 王炸牌：无限穿透 + 大范围秒杀爆炸（命中不消耗、不消失）
    this.cardFx = 0;            // 卡牌弹丸旋转动画计时
  }
  // 🧪 毒液弹落地：在当前位置铺一小滩毒液领域（出界时钳回场地内，免得毒圈落在画外看不见）
  dropVenom(){
    if(!this.venom || this.venomDropped) return;
    this.venomDropped = true;
    spawnVenomPool(clamp(this.x, 0, WW()), clamp(this.y, 0, WH()), this.venom, this.ownerIdx);
  }
  // 🍅 番茄酱包：没扔中、撞墙/出界时也当场爆出一滩大酱潭（"没扔中碰墙也爆"；命中分支已直接铺，这里管漏掉的死亡路径）
  //   用 ketDropped 兜底，与命中分支共享「只爆一次」，避免同一包既命中又出界重复铺潭
  explodeKetchup(){
    if(!this.ketchupPack || this.ketDropped) return;
    this.ketDropped = true;
    spawnKetchupPool(clamp(this.x, 24, WW()-24), clamp(this.y, 24, WH()-24), this.ketchupPack.pool, this.ownerIdx);
  }
  update(dt){
    this.life -= dt;
    if(this.life<=0){ this.dropVenom(); this.explodeKetchup(); this.dead=true; return; }
    // homing（只锁定屏幕内的敌人：屏幕外打不到，锁了纯浪费子弹）
    if(this.homing>0){
      let nearest=null, nd=9999;
      G.enemies.forEach(e=>{
        if(e.dead || e.isBullet) return; // 不追踪弹幕
        if(e.x < -60 || e.x > WW()+60 || e.y < -60 || e.y > WH()+60) return; // 屏幕外（含60px边缘余量，👁️按扩大后世界）不索敌
        const d=dist(this,e);
        if(d<nd){ nd=d; nearest=e; }
      });
      if(nearest && nd<400){
        const a = angleTo(this, nearest);
        const spd = Math.hypot(this.vx,this.vy);
        const cur = Math.atan2(this.vy,this.vx);
        let na = cur + clamp(((a-cur+Math.PI*3)%(Math.PI*2)-Math.PI)*0.15, -0.15, 0.15);
        this.vx = Math.cos(na)*spd; this.vy = Math.sin(na)*spd;
      }
    }
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>6) this.trail.shift();
    this.x += this.vx*dt; this.y += this.vy*dt;
    if(this.x<0||this.x>WW()||this.y<0||this.y>WH()){ this.dropVenom(); this.explodeKetchup(); this.dead=true; } // 👁️视野扩大：出界判定按扩大后世界；🍅 番茄酱包出界即爆潭（碰墙也爆）；🎭 试剂瓶出界即在落点炸开
  }
  draw(){
    if(this.cardJoker !== 0 || this.cardVal){ // 🃏 卡牌弹丸：标准小扑克牌（点数 + 花色；王画大/小 + 星）
      if(this.cmRoyal){ // 🃏 王炸牌：红色烈焰拖尾（世界坐标画在变换前；无限穿透的视觉标识）
        this.trail.forEach((p,i)=>{
          const f = (i+1)/this.trail.length;
          ctx.fillStyle = `rgba(255,60,60,${f*0.30})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, this.r*(0.5+f*0.5), 0, Math.PI*2); ctx.fill();
        });
      }
      const ang = Math.atan2(this.vy, this.vx);
      const w = this.r * 2.4, h = this.r * 3.4; // 竖版卡（上数字/字母·王 JOKER·下花色）
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(ang);
      drawPokerCard(ctx, 0, 0, w, h, { rank:this.cardVal, suit:this.cardSuit, joker:this.cardJoker }, { instakill:!!this.instakill });
      if(this.instakill){ ctx.strokeStyle = 'rgba(255,60,60,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0, h*0.62, 0, Math.PI*2); ctx.stroke(); }
      ctx.restore();
      return;
    }
    if(this.bardWave){ // 🎻 音波：三道同心弧往前推（越外越淡），像一圈声浪
      const ang = Math.atan2(this.vy, this.vx);
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(ang);
      for(let i = 0; i < 3; i++){
        ctx.globalAlpha = 0.78 - i*0.22;
        ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.4 - i*0.6;
        ctx.beginPath(); ctx.arc(-i*this.r*0.75, 0, this.r*0.95, -1.05, 1.05); ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
      return;
    }
    if(this.ketchupPack){ // 🍅 番茄酱之神扔出的番茄酱包：麦当劳小红袋（红袋+黄M+米白撕口）边滚边飞
      const ang = Math.atan2(this.vy, this.vx);
      const w = this.r * 2.2, h = this.r * 2.8;
      this.trail.forEach((p,i)=>{ // 拖尾：红色酱痕
        ctx.fillStyle = `rgba(214,40,40,${(i+1)/this.trail.length*0.22})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, this.r*0.5, 0, Math.PI*2); ctx.fill();
      });
      ctx.save(); ctx.translate(this.x, this.y);
      ctx.rotate(ang + Math.PI/2 + Math.sin(G.time*18)*0.14); // 顺着飞向自旋 + 微微摇摆
      ctx.fillStyle = '#d62828'; ctx.strokeStyle = '#8f1414'; ctx.lineWidth = 1.2; // 麦当劳红包体
      ctx.beginPath(); ctx.rect(-w/2, -h/2, w, h); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f5e9d0'; for(let i=0;i<4;i++) ctx.fillRect(-w/2 + i*(w/4), -h/2, w/8, h*0.16); // 米白锯齿撕口
      ctx.strokeStyle = '#ffc72c'; ctx.lineWidth = Math.max(1.4, h*0.09); ctx.lineCap = 'round';        // 金黄 M（金拱门）
      ctx.beginPath();
      ctx.moveTo(-w*0.26, h*0.16); ctx.lineTo(-w*0.13, -h*0.12); ctx.lineTo(0, h*0.16);
      ctx.lineTo(w*0.13, -h*0.12);  ctx.lineTo(w*0.26, h*0.16);
      ctx.stroke();
      ctx.restore();
      return;
    }
    if(this.blade){ // 🌪️ 剑气：白色月牙刀光 + 金色内刃，开口朝后、锋面朝前
      const ang = Math.atan2(this.vy, this.vx);
      const R = this.r * 2.6;
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(ang);
      this.trail.forEach((p,i)=>{
        const f = (i+1)/this.trail.length;
        ctx.strokeStyle = `rgba(255,255,255,${0.30*f})`; ctx.lineWidth = 1 + 2*f;
        ctx.beginPath(); ctx.arc(p.x-this.x-R*0.55, p.y-this.y, R*0.9, -0.9, 0.9); ctx.stroke();
      });
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(-R*0.55, 0, R, -1.0, 1.0); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,209,102,0.95)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(-R*0.55, 0, R - 2.4, -0.92, 0.92); ctx.stroke();
      ctx.restore();
      return;
    }
    // trail（被黑洞捕获：拖尾转紫，提示子弹已被吸住）
    const ven = !!this.venom; // 🧪 毒液弹：拖尾与弹体走毒绿配色
    const fire = !!this.fireBall; // 🔥 火球：拖尾与弹体走橙红火焰配色
    this.trail.forEach((p,i)=>{
      ctx.fillStyle = this.holed
        ? `rgba(200,120,255,${i/this.trail.length*0.5})`
        : (ven ? `rgba(150,255,90,${i/this.trail.length*0.5})` : (fire ? `rgba(255,110,30,${i/this.trail.length*0.55})` : `rgba(255,230,100,${i/this.trail.length*0.4})`));
      ctx.beginPath(); ctx.arc(p.x,p.y,this.r*0.6,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle = this.holed ? '#8b5cc8' : (ven ? '#9ef04a' : (fire ? '#ff5a1e' : (this.explosive>0 ? '#f80' : '#fe4')));
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = this.holed ? '#d8b0ff' : (ven ? '#eaffb0' : (this.homing>0?'#0ff':'#fff')); ctx.lineWidth=1; ctx.stroke();
  }
}

// ===== 🃏 卡牌大师：54 张牌库 + 抽牌/算伤（第十五角色）=====
// 牌库：13 个点数（3..15，斗地主大小顺序：3<4<…<10<J(11)<Q(12)<K(13)<A(14)<2(15)）× 4 花色 + 小王 + 大王 = 54 张
const CARD_RANKS = [3,4,5,6,7,8,9,10,11,12,13,14,15];
const CARD_SUITS = 4;
const CARD_DECK = (() => {
  const d = [];
  for(const r of CARD_RANKS) for(let s = 0; s < CARD_SUITS; s++) d.push({ rank:r, suit:s, joker:0 });
  d.push({ rank:0, suit:-1, joker:1 }); // 小王
  d.push({ rank:0, suit:-1, joker:2 }); // 大王
  return d;
})();
function cmDealHand(){ // 随机抽 5 张（一手不放回：每手重新洗牌，手与手之间独立）
  const idx = CARD_DECK.map((_, i) => i);
  for(let i = idx.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  return idx.slice(0, 5).map(i => CARD_DECK[i]);
}
// 算一手牌的逐张伤害 / 是否王炸 / 是否顺子（纯函数，便于测试）
function cmScoreHand(p, hand){
  const hasSmall = hand.some(c => c.joker === 1), hasBig = hand.some(c => c.joker === 2);
  const instakill = hasSmall && hasBig; // 🃏 王炸：双王同抽 → 全牌秒杀
  const counts = {};
  for(const c of hand){ if(c.joker) continue; counts[c.rank] = (counts[c.rank] || 0) + 1; }
  const multiBonus = (p.skills.cm_multi || 0) * 0.5; // 对子专家：相同点数倍率额外 +0.5/级（2张→×2.5…）
  const jokerBase = 16 + 8 * (p.skills.cm_joker || 0); // 单王基础伤害（「王上加王」可抬）
  const perCard = hand.map(c => {
    if(c.joker) return jokerBase;
    const base = c.rank + 2 * (p.skills.cm_dmg || 0); // 稳赢：每张牌基础伤害 +2/级
    const cnt = counts[c.rank] || 0;
    const mul = cnt >= 2 ? (cnt + multiBonus) : 1;     // 2张→×2 / 3张→×3 / 4张→×4（+额外）
    return base * mul;
  });
  // 顺子：5 张全是普通牌、点数各不相同且连续 → 总伤害加成（「顺子」技能强化）
  let straight = false;
  const normal = hand.filter(c => !c.joker).map(c => c.rank).sort((a, b) => a - b);
  if(!instakill && normal.length === 5 && new Set(normal).size === 5){
    let cons = true; for(let i = 1; i < 5; i++) if(normal[i] !== normal[i-1] + 1){ cons = false; break; }
    if(cons) straight = true;
  }
  if(straight){ const m = 1 + 0.15 * (p.skills.cm_straight || 0); for(let i = 0; i < perCard.length; i++) perCard[i] *= m; }
  return { perCard, instakill, straight, hasSmall, hasBig };
}

// ===== 🃏 卡牌大师：标准扑克牌绘制（飞行弹丸 + 发牌手牌展示共用） =====
//   上边写数字 / 字母（王写 JOKER），下边画花色；圆角白卡 + 描边
const CM_SUIT_GLYPH = ['♠','♥','♦','♣']; // 黑桃 ♠ / 红心 ♥ / 方块 ♦ / 梅花 ♣
function cmRankLab(rank){ return ({11:'J',12:'Q',13:'K',14:'A',15:'2'})[rank] || ('' + rank); }
function cmSuitColor(suit){ return (suit === 1 || suit === 2) ? '#d83a3a' : '#23232e'; } // ♥♦ 红、♠♣ 黑
function drawPokerCard(g, cx, cy, w, h, card, opt){
  opt = opt || {};
  const joker = card.joker || 0;
  const ink = joker ? (joker === 2 ? '#b22222' : '#7a3fb0') : cmSuitColor(card.suit);
  g.save(); g.translate(cx, cy); if(opt.rot) g.rotate(opt.rot);
  // 圆角白卡（竖版）
  const rr = Math.min(4, w*0.16);
  g.beginPath();
  g.moveTo(-w/2+rr, -h/2);
  g.lineTo(w/2-rr, -h/2); g.quadraticCurveTo(w/2,-h/2, w/2,-h/2+rr);
  g.lineTo(w/2, h/2-rr); g.quadraticCurveTo(w/2,h/2, w/2-rr,h/2);
  g.lineTo(-w/2+rr, h/2); g.quadraticCurveTo(-w/2,h/2, -w/2,h/2-rr);
  g.lineTo(-w/2, -h/2+rr); g.quadraticCurveTo(-w/2,-h/2, -w/2+rr,-h/2);
  g.closePath();
  g.fillStyle = opt.instakill ? '#fff0f0' : '#fdfcf5'; g.fill();
  g.lineWidth = opt.instakill ? 2.4 : 1.3;
  g.strokeStyle = opt.instakill ? '#ff4d4d' : (joker ? (joker===2?'#b22222':'#7a3fb0') : '#9a9aa2'); g.stroke();
  // 上边：数字 / 字母（王 = JOKER），按卡宽自动缩字以容纳长标签
  const top = joker ? 'JOKER' : cmRankLab(card.rank);
  const tf = Math.min(h*0.34, (w*0.9)/(0.62*top.length));
  g.fillStyle = ink; g.textAlign='center'; g.textBaseline='middle';
  g.font = 'bold '+tf+'px system-ui,sans-serif';
  g.fillText(top, 0, -h*0.22);
  // 下边：花色（王用 ★ 占位）
  const sglyph = joker ? '★' : CM_SUIT_GLYPH[card.suit];
  g.font = (h*0.3)+'px system-ui,sans-serif';
  g.fillText(sglyph, 0, h*0.24);
  g.restore();
}
// 🃏 手牌类型文字（对子/三条/四条/两对/葫芦/顺子/王炸/散牌）—— 供发牌展示写出
function cmHandLabel(hand){
  if(!hand || !hand.length) return { text:'', color:'#cfcfcf' };
  const jokers = hand.filter(c => c.joker);
  const hasS = jokers.some(c => c.joker === 1), hasB = jokers.some(c => c.joker === 2);
  if(hasS && hasB) return { text:'王炸 · 穿透秒杀!', color:'#ff3b3b' };
  const ranks = hand.filter(c => !c.joker).map(c => c.rank);
  const counts = {}; for(const r of ranks) counts[r] = (counts[r]||0)+1;
  const vals = Object.values(counts).sort((a,b)=>b-a);
  let cat = '散牌';
  if(vals[0] >= 4) cat = '四条!';
  else if(vals[0] === 3 && vals[1] === 2) cat = '葫芦!';
  else if(vals[0] === 3) cat = '三条!';
  else if(vals[0] === 2 && vals[1] === 2) cat = '两对!';
  else if(vals[0] === 2) cat = '对子!';
  if(ranks.length === 5){
    const uniq = [...new Set(ranks)].sort((a,b)=>a-b);
    if(uniq.length === 5){ let cons=true; for(let i=1;i<5;i++) if(uniq[i]!==uniq[i-1]+1){cons=false;break;} if(cons) cat = cat==='散牌'?'顺子!':cat+'·顺子'; }
  }
  if((hasS || hasB) && cat === '散牌') cat = (hasS&&hasB)?'王炸 · 穿透秒杀!':'单王';
  return { text: cat, color: cat.indexOf('王炸')>=0 ? '#ff3b3b' : (cat==='散牌'?'#cfcfcf':'#ffd166') };
}
// 🃏 卡牌大师·手牌效果分类：散牌=无 / 对子·两对·三条=连锁闪电（每手一次）/ 炸（四条·王炸）=每张牌爆炸
function cmHandFx(hand){
  const lab = cmHandLabel(hand).text;
  const pair = lab === '对子!' || lab === '两对!' || lab === '三条!';   // 🃏 对子/两对/三条：命中后弹一道连锁闪电到怪身上（每手一次）
  const bomb = lab === '四条!' || lab.indexOf('王炸') >= 0;             // 🃏 炸（四条·王炸）：每张牌命中附带爆炸
  return { pair, bomb };
}
// 🃏 卡牌大师·对子连锁闪电（怪与怪之间弹，像技能里的链）：以 (ox,oy) 为起点（通常是被卡牌命中的怪），朝【最近的其他怪】弹一道闪电，再链式跳 3 次（每次 0.6 伤害）；skip=起点怪（已被卡牌打过，不再被闪电打）
function cmChainZap(ox, oy, ownerIdx, dmg, skip){
  const hit = new Set();
  if(skip) hit.add(skip); // 起点怪不算被闪电打（它已经被这张卡牌打过了）
  let first = null, fd = Infinity;
  G.enemies.forEach(t => { if(t.dead || t.isBullet || t.invincible || hit.has(t)) return; const d = dist({x:ox,y:oy}, t); if(d < fd){ fd = d; first = t; } });
  if(!first) return;
  first.takeDamage(dmg, '#8ef', false, ownerIdx); first.lastHitIdx = ownerIdx; hit.add(first);
  G.effects.push({ type:'zap', x1:ox, y1:oy, x2:first.x, y2:first.y, life:0.15, max:0.15 });
  let prev = first;
  for(let hop = 0; hop < 3; hop++){
    let next = null, nd = 240 * visionZoom();
    G.enemies.forEach(t => { if(t.dead || t.isBullet || t.invincible || hit.has(t)) return; const d = dist(prev, t); if(d < nd){ nd = d; next = t; } });
    if(!next) break;
    next.takeDamage(Math.max(1, Math.round(dmg * 0.6)), '#8ef', false, ownerIdx); next.lastHitIdx = ownerIdx;
    G.effects.push({ type:'zap', x1:prev.x, y1:prev.y, x2:next.x, y2:next.y, life:0.15, max:0.15 });
    hit.add(next); prev = next;
  }
}

// ===== ⚔️ 将军的小兵（召唤物） =====
// 迷你剑士：**锁敌**（420 索敌圈内主动扑最近的怪，冲到突刺距离就出刀），砍中小怪后把它的仇恨拉过来
//（小怪转头咬小兵 → 替玩家挡刀）。周围没怪时才跟主人走（保持 ~70px）。伤害低、血量薄：是诱饵不是主C。
// 伤害归属主人的座位（吸血/结算）。
class Minion {
  constructor(owner, x, y, mlv){
    this.owner = owner.seat;          // 主人座位：伤害归属 / 上限分组
    this.isMinion = true;             // 敌人贴身结算用它区分「咬小兵还是咬玩家」
    this.x = x; this.y = y;
    this.r = 9;                       // 比玩家（r≈12）小一圈：一眼看出是兵不是将
    this.mlv = mlv;                   // 小兵等级 = 主人等级 ÷2（向下取整，最低 1）
    // 伤害：压得比主人低一大截（1级8 / 2级10 / 3级13 ...），小兵是诱饵+补刀，不是输出主力
    this.dmg = Math.max(1, Math.round(8 * (1 + 0.3*(mlv-1)) * owner.minionPow * pCM(owner).dmgMul));
    // 血量较低：普通小怪咬 2~3 口就倒（咬死仇恨自动解除，怪回头找玩家）
    this.maxHp = 20 + 5*mlv;
    this.hp = this.maxHp;
    this.atkCD = 0.2;                 // 落地后短暂蓄力再出刀
    this.atkRate = 0.55;              // 出刀间隔（比玩家慢一档：小兵是辅助输出）
    this.range = 74;                  // 突刺距离
    this.arc = 55 * Math.PI/180;      // 突刺半角（小兵比主人还窄一点）
    this.speed = 170;                 // 移速削弱（235 → 170）：小兵跑得慢，追不上远处的怪，只能就近作战
    this.ang = -Math.PI/2;            // 当前朝向（画剑用）
    this.atkFx = 0;                   // 突刺特效计时
    this.spawnT = 0.35;               // 落地光环计时
    this.flash = 0;                   // 被咬白闪
    this.dead = false;
  }
  takeDamage(d){ // 敌人贴身咬小兵走这里（被咬死仇恨自动解除，见 targetOf 的 m.dead 判定）
    if(this.dead) return;
    this.hp = Math.max(0, this.hp - d);
    this.flash = 0.1;
    if(this.hp <= 0){
      this.dead = true;
      spawnParticles(this.x, this.y, '#c9d4e4', 8);
    }
  }
  update(dt){
    if(this.spawnT > 0) this.spawnT -= dt;
    if(this.atkFx > 0) this.atkFx -= dt;
    if(this.atkCD > 0) this.atkCD -= dt;
    if(this.flash > 0) this.flash -= dt;
    // 🔍 锁敌：找最近怪（420 索敌圈）——有怪就主动扑上去，没怪才跟主人
    //    ⚔️ 对战：场上一个怪都没有 → 锁定「对手玩家」（对手 = 主人以外的那个座位）
    const pvpFoes = G.pvp ? (G.players||[]).filter(q => q && !q.dead && q.seat !== this.owner) : null;
    let tgt = null, nd = 1e9;
    for(const e of (pvpFoes || G.enemies)){
      if(e.dead || e.dying || e.isBullet) continue;
      const d = dist(this, e);
      if(d < nd){ nd = d; tgt = e; }
    }
    if(tgt && nd < 420){
      this.ang = angleTo(this, tgt);
      if(nd > this.range + tgt.r){
        // 追：朝锁定的怪逼近（到突刺距离外沿就停，站桩输出位）
        const a = this.ang;
        this.x += Math.cos(a) * this.speed * dt;
        this.y += Math.sin(a) * this.speed * dt;
      } else if(this.atkCD <= 0){
        // 突刺：扇形内所有怪各吃一刀（小兵版挥砍，无格挡/击退弱化版）
        this.atkCD = this.atkRate;
        this.atkFx = 0.2;
        for(const e of G.enemies){
          if(e.dead || e.dying || e.isBullet || e.invincible) continue;
          const d = dist(this, e);
          if(d > this.range + e.r) continue;
          const ea = Math.atan2(e.y - this.y, e.x - this.x);
          const diff = Math.abs(((ea - this.ang + Math.PI*3) % (Math.PI*2)) - Math.PI);
          if(diff > this.arc) continue;
          e.takeDamage(Math.round(this.dmg * (e.isBoss ? 1.5 : 1)), '#fff', false, this.owner); // 近战来源
          e.lastHitIdx = this.owner; // 击杀归属：主人
          if(!e.isBoss && !e.isRanged && !e.isLaser){
            // 🪖 砍中小怪 → 拉仇恨：它转头来咬小兵（持续5秒，每刀刷新；Boss/远程怪不吃这套）
            e.aggro = this;
            e.aggroT = 5;
          }
          const kf = Math.round(1400 / e.r); // 弱化版击退
          e.kbx = (e.kbx||0) + Math.cos(ea) * kf;
          e.kby = (e.kby||0) + Math.sin(ea) * kf;
        }
        // ⚔️ 对战：场上没有怪，上面那个 for 是空转 —— 突刺要单独刺向对手玩家（走同一套 PVP 折算）
        if(G.pvp) pvpMeleeHit(this, this.x, this.y, this.ang, this.arc, this.range, this.dmg, '#fff', this);
      }
    } else if(G.players && G.players[this.owner] && !G.players[this.owner].dead){
      // 没怪：跟着主人走（保持 ~70px 距离，落后太多就加速归队）——不再瞎逛乱跑
      const p = G.players[this.owner];
      const d = dist(this, p);
      if(d > 70){
        const a = angleTo(this, p);
        const spd = d > 260 ? this.speed * 1.6 : this.speed; // 掉队太远加速归队
        this.x += Math.cos(a) * spd * dt;
        this.y += Math.sin(a) * spd * dt;
        this.ang = a;
      }
    }
    this.x = clamp(this.x, this.r, WW()-this.r);
    this.y = clamp(this.y, this.r, WH()-this.r);
  }
  draw(){
    // 落地光环（用全局画布上下文 ctx，与玩家/龙卷风同源）
    if(this.spawnT > 0){
      ctx.save();
      ctx.strokeStyle = `rgba(255,209,102,${this.spawnT/0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 4 + (0.35-this.spawnT)*40, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    // 身体：银甲小兵 + 金色描边（主人的兵）；被咬时白闪
    ctx.fillStyle = this.flash > 0 ? '#fff' : '#c9d4e4';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#e8c25a'; ctx.lineWidth = 1.5; ctx.stroke();
    // 头顶小血条（掉血才画：小兵血量低，被围咬时看得见倒计时）
    if(this.hp > 0 && this.hp < this.maxHp){
      const bw = this.r*2;
      const bx = this.x - bw/2, by = this.y - this.r - 7;
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.fillRect(bx, by, bw, 3);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(bx, by, bw*clamp(this.hp/this.maxHp, 0, 1), 3);
    }
    // 长剑：白色朝向线，突刺瞬间又长又亮
    const len = this.r * (this.atkFx > 0 ? 2.6 : 1.9);
    ctx.strokeStyle = this.atkFx > 0 ? '#fff' : 'rgba(255,255,255,.85)';
    ctx.lineWidth = this.atkFx > 0 ? 3 : 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x + Math.cos(this.ang)*this.r*0.4, this.y + Math.sin(this.ang)*this.r*0.4);
    ctx.lineTo(this.x + Math.cos(this.ang)*len, this.y + Math.sin(this.ang)*len);
    ctx.stroke();
  }
}
// 小兵推进：逐个 update，清理离场标记
function updateMinions(dt){
  if(!G.minions || !G.minions.length) return;
  for(const m of G.minions) if(!m.dead) m.update(dt);
  G.minions = G.minions.filter(m => !m.dead);
}
// 小兵绘制：画在玩家层（将军身旁一队小兵）
function drawMinions(){
  if(!G.minions || !G.minions.length) return;
  G.minions.forEach(m => m.draw());
}

// ===== ENEMY =====
class Enemy {
  constructor(x,y,hp,speed,dmg,r,color){
    this.x=x;this.y=y;this.r=r||16;
    this.hp=hp;this.maxHp=hp;
    // this.speed 是「基础速度」；实际速度 = 基础 × 敌群狂暴倍率（见 getter / enemySpdMulFor）
    //   双人时倍率按「这只怪锁定的玩家」实时结算 → 只有追携带者的怪才加速
    this._spd = speed;
    this.dmg=Math.round(dmg * enemyDmgMul());this.color=color||'#f44'; // ♾无尽模式：伤害随波次成长
    this.dead=false;this.flash=0;
    this.xpDrop=Math.max(1,Math.floor(hp/8));
    this.touchCD=0;
    this.laserSlowUntil = 0; this.laserSlowMul = 1; // 🕸️ 激光「迟滞」：被光束照到 → 减速到 G.time+1 秒为止
    this.venomSlowUntil = 0; this.venomSlowMul = 1; // 🧪 毒液领域：踩在里面 → 减速到 G.time+0.6 秒为止（每跳刷新）
    this.stoneSlowUntil = 0; this.stoneSlowMul = 1; // 🪨 蓝石命中：减速到 G.time+C.slowT 秒为止（投石角色）
    this.webSlowUntil = 0; this.webSlowMul = 1; // 🕸️ 蛛网：踩到被黏住减速到 G.time+0.3 秒为止（织网者的网，敌人自己也会踩）
    this.kbx=0; this.kby=0; // knockback velocity
    // 🛡 护盾血量：普通怪恒 0（无盾）；只有斩铁剑皇会设值（见 BladeBoss 构造）
    //    有盾时伤害先扣盾（远程角色只造成 50%），盾破才轮到 hp
    this.shieldHp = 0;
    this.shieldHitFx = 0;   // 盾被击中的白闪计时（绘制用）
    this.shieldBreakFx = 0; // 盾破瞬间的碎盾特效计时（绘制用）
    // 🫧 虚空泡（世界2 专属）：泡泡护罩 —— 有泡泡时**完全免疫伤害**，泡泡被打爆才能伤到本体
    //    与 shieldHp（斩铁剑皇的实体剑盾）区分：泡泡可在敌人之间转移，且破泡泡只掉泡泡血
    this.bubbleHp = 0;       // 泡泡血量（>0 = 本体无敌）
    this.bubbleHitUntil = 0; // 泡泡被击中的白闪（绝对时间戳；泡泡会转移给别的敌人，那些敌人未必更新基类 → 用时间戳最稳）
    this.bubbleBreakUntil = 0; // 泡泡破瞬间的碎泡光（绝对时间戳，同上）
    this.stun=0;        // 眩晕剩余秒数（暴击命中施加0.5s；眩晕中定身不动不攻击）
    this.frozen=0;      // ❄️ 冰冻剩余秒数（魔法师冰霜；>0 时绘制冰壳，与眩晕星星区分）
    this.rooted=0;      // 🧊 冰冻「定身」剩余秒数（**只禁移动、照常出招**）——Boss 专属：冰霜对 Boss 只冻脚不冻嘴
                        //    落地：主循环敌人更新处回滚位移（见 G.enemies.forEach 里的 rooted 分支）
    this.dogHold=0;     // 🐶 野生狗奶大招「春秋邻域」：完全冻结剩余秒数（>0 时不移动、不出招、不摸伤）
    this.dogDotT=0; this.dogDotDps=0; this.dogDotTick=0; this.dogDotIdx=0; // 🐶 狗奶「奶住」DOT：持续掉血（秒伤 10，持续 等级×2 秒）
    this.critShake=0;  // 被暴击后头顶血条颤动计时器
    this.dying=false;  // 暴击致死：先身体颤动再真正死亡
    this.deathShake=0; // 颤动剩余时间
    // 多人：出生即随机分配目标（一部分打1P、一部分打2P/3P），目标阵亡才换人
    this._tgt = null;
    if(multiOn()){
      this._tgt = G.players[Math.floor(Math.random() * G.players.length)];
    }
    this.aggro = null;  // 🪖 仇恨目标（将军小兵砍过它后指向那只小兵）
    this.aggroT = 0;    // 仇恨剩余秒数（每次被小兵砍中刷新，归零/小兵死亡即脱仇）
  }
  // 实际移动速度（所有子类的 this.speed 用法自动继承）：
  //   基础速度 × 敌群狂暴倍率 × 🔆激光「迟滞」减速 × 🧪毒液领域减速 × 🪨蓝石减速 × 🕸️蛛网黏住
  //   （三个减速都用「减速到这个绝对时间为止」判定，到期自动恢复，无需逐帧维护计时器；缺字段的假敌人自然按 1 处理）
  get speed(){
    const slow = (this.laserSlowUntil > G.time) ? (this.laserSlowMul || 1) : 1;
    const vslow = (this.venomSlowUntil > G.time) ? (this.venomSlowMul || 1) : 1;
    const sslow = (this.stoneSlowUntil > G.time) ? (this.stoneSlowMul || 1) : 1; // 🪨 蓝石减速
    const wslow = (this.webSlowUntil > G.time) ? (this.webSlowMul || 1) : 1;   // 🕸️ 蛛网黏住
    return this._spd * enemySpdMulFor(this) * slow * vslow * sslow * wslow;
  }
  set speed(v){ this._spd = v; }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.aggroT > 0) this.aggroT -= dt; // 🪖 仇恨倒计时
    if(this.flash>0) this.flash -= dt;
    if(this.bubbleHitUntil > 0 && G.time > this.bubbleHitUntil) this.bubbleHitUntil = 0;   // 🫧 泡泡白闪到期
    if(this.dogHold > 0){ this.dogHold -= dt; return; } // 🐶 野生狗奶大招「春秋邻域」：完全冻结（不移动、不攻击、不摸伤）
    // knockback
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt;
      this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 暴击眩晕 / ❄️冰冻：定身（不移动、不攻击、不摸伤），击退位移已先结算不受影响
    if(this.frozen > 0) this.frozen -= dt; // 冰壳计时（与 stun 同步递减，纯视觉）
    if(this.stun > 0){
      this.stun -= dt;
      return;
    }
    // 🥎 香水瓶失志 / 🌶️ 胡椒瓶缩索敌：随投掷角色（2026-10-22 删除）一并移除
    const _aggroRange = (WW() + WH()); // 基础覆盖全屏（永远追）
    const P = targetOf(this); // 双人：锁定最近存活玩家；🪖有小兵仇恨时锁定小兵
    const a = angleTo(this, P);
    if(P && dist(this, P) <= _aggroRange){
      this.x += Math.cos(a)*this.speed*dt;
      this.y += Math.sin(a)*this.speed*dt;
    } else {
      // 索敌被压 / 出范围：随机乱走（不追玩家），方向频繁抖动、间歇重置
      if(this._pepAng === undefined || (this._pepT = (this._pepT||0) - dt) <= 0){ this._pepAng = rand(0, Math.PI*2); this._pepT = rand(0.4, 1.2); }
      this._pepAng += rand(-3, 3) * dt;
      this.x += Math.cos(this._pepAng) * this.speed * 0.6 * dt;
      this.y += Math.sin(this._pepAng) * this.speed * 0.6 * dt;
    }
    // 防卡死：敌人永远被拉回屏幕附近（击退/异常位移出屏太多时，避免清波判定永远不通过导致"不刷怪"）
    this.x = clamp(this.x, -70, WW()+70); // 👁️视野扩大：冲撞怪巡场边界随世界扩大
    this.y = clamp(this.y, -70, WH()+70);
    this.collidePlayer();
  }
  // 接触伤害（近战怪：与玩家不重叠——玩家被怪顶到边缘"推动"，怪贴身按CD攻击，命中附加击退冲量；双人：碰到谁谁掉血）
  //   提成独立方法：🌿 世界3 几个"自己写 update 不调 super"的怪（掠花粉蜂/角棘冲锋兽/追踪种子）复用同一套接触规则
  collidePlayer(){
    if(this.dmg <= 0) return; // 零接触伤害的功能型敌人（织网者/缠根妖）不摸人
    const P = targetOf(this);
    if(P && P.isMinion){
      // 🪖 仇恨在身：贴身咬小兵（小兵血量低扛不了几下，咬死仇恨自动解除）
      if(this.touchCD<=0 && dist(this, P) < this.r + P.r){
        P.takeDamage(this.dmg, this);
        this.touchCD = 0.5;
      }
      return;
    }
    const cands = bossHitTargets();
    for(const Q of cands){
      const d = Q ? dist(this, Q) : 9999;
      if(Q && d < this.r + Q.r){
        let nx, ny;
        if(d > 0.001){ nx = (Q.x-this.x)/d; ny = (Q.y-this.y)/d; } // 怪→玩家方向
        else { nx = 1; ny = 0; } // 完全重合兜底：向右推开
        // 位置推挤：玩家被顶到怪的边缘（玩家撞近战怪会被挡下，无法穿过）
        Q.x = clamp(this.x + nx*(this.r+Q.r), Q.r, WW()-Q.r);
        Q.y = clamp(this.y + ny*(this.r+Q.r), Q.r, WH()-Q.r);
        if(this.touchCD<=0){
          Q.takeDamage(this.dmg, this);
          this.touchCD = 0.5;
          Q.kbx = nx*320; Q.kby = ny*320; // 命中击退冲量
        }
        break; // 一次接触结算一次，0.5s 冷却防连击
      }
    }
  }
  // srcSeat = 伤害来源座位（可选）：只给「带护盾的敌人」（斩铁剑皇）判定远程/近战减免用
  takeDamage(d, color, isCrit, srcSeat){
    // 🫧 虚空泡：有泡泡时**完全免疫**（伤害全额吸到泡泡上），泡泡破了才轮到本体
    //    ⚠️ 秒杀类伤害（🃏王炸 dmg=1e9）**穿透泡泡**：否则会破坏「王炸秒杀一切（含 Boss）」的既有口径
    if(this.bubbleHp > 0 && d < 1e8){
      this.bubbleHp = Math.max(0, this.bubbleHp - d);
      this.flash = 0.1;
      this.bubbleHitUntil = G.time + 0.16;
      if(this.bubbleHp <= 0) this.breakBubble(); // 泡泡破：特效 + 本体开始掉血
      return;
    }
    if(this.bubbleHp > 0 && d >= 1e8) this.bubbleHp = 0; // 秒杀穿透：泡泡直接碎掉
    // 🛡 护盾（斩铁剑皇）：盾还有血 → 伤害先扣盾，本体一滴血不掉（溢出不穿透）
    //    远程角色（射手/激光/爆破/毒液）打盾只有 50% 伤害，近战角色（剑士/龙卷风）全额 —— 逼你贴近了打
    if(this.shieldHp > 0){
      const sd = Math.max(1, Math.round(isRangedSource(srcSeat) ? d * SHIELD_RANGED_MUL : d));
      this.shieldHp = Math.max(0, this.shieldHp - sd);
      this.flash = 0.1;
      this.shieldHitFx = 0.16;
      if(this.shieldHp <= 0) this.breakShield(); // 盾破：特效 + 音效（本体开始掉血）
      return;
    }
    this.hp = Math.max(0, this.hp - d); // 血量下限0：暴击过量伤害不再把血量扣成负数（否则头顶血条会画成反向/负宽度）
    if(G.showDamage) spawnDamageText(this.x, this.y - this.r - 4, d, color || '#fff', isCrit, false); // 🔢 造成伤害：白色/暴击色数字
    this.flash = 0.1;
    if(isCrit){
      this.critShake = 0.3; // 暴击：头顶血条颤动一下
      if(!this.isBoss) this.stun = Math.max(this.stun||0, 0.5); // 暴击眩晕敌人0.5秒（Boss免疫）
    }
    if(this.hp <= 0){
      if(isCrit){
        // 暴击致死：先身体颤动一下再真正死亡
        this.dying = true;
        this.deathShake = 0.35;
        this.critShake = 0.35;
      } else {
        this.die();
      }
    }
  }
  // 🫧 泡泡破：特效 + 音效；本体从这一刻起才真的开始掉血
  breakBubble(){
    this.bubbleHp = 0;
    this.bubbleBreakUntil = G.time + 0.4;
    SND.shieldBlock();
    spawnParticles(this.x, this.y, '#bff0ff', 16);
    G.effects.push({ type:'bubbleBreak', x:this.x, y:this.y, r:this.r + 18, life:0.4, max:0.4 });
  }
  die(){ // 真正死亡：掉落、粒子、音效
    if(this.dead) return;
    this.dead = true;
    // 🫧 泡泡转移：泡泡主人死了 → 泡泡跳到**最近的敌人**身上（它不会凭空消失）
    if(this.bubbleHp > 0) transferBubble(this);
    if(this.isBoss) SND.bossDie(); else SND.enemyDie();
    G.kills = (G.kills||0) + 1; Achieve.checkKill(); // 击杀数累计（成就用）
    if(this.isBoss) Achieve.checkBossDie(this.bossNum);
    G.gems.push(new ExpGem(this.x, this.y, this.xpDrop));
    spawnParticles(this.x, this.y, this.color, 8);
    healOnKill(this.lastHitIdx); // 挑战模式吸血（双人按击杀归属结算）
  }
  draw(){
    ctx.save();
    let ox = 0, oy = 0;
    if(this.dying){ // 暴击致死：死亡前身体颤动
      ox = (Math.random()-0.5) * 12;
      oy = (Math.random()-0.5) * 8;
    }
    if(this.flash>0) ctx.fillStyle='#fff';
    else ctx.fillStyle=this.color;
    ctx.beginPath(); ctx.arc(this.x+ox, this.y+oy, this.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.5)'; ctx.lineWidth=2; ctx.stroke();
    // 🫧 虚空泡泡：套在本体外的半透明护罩（有泡泡 = 本体无敌，所以这圈必须显眼）
    if(this.bubbleHp > 0){
      const br = this.r + 8 + Math.sin(G.time*3 + this.x*0.01)*1.5; // 呼吸感
      const hit = G.time < this.bubbleHitUntil; // 白闪（用时间戳：泡泡可能挂在不更新基类的敌人身上）
      ctx.save();
      ctx.fillStyle = hit ? 'rgba(255,255,255,.30)' : 'rgba(150,230,255,.18)';
      ctx.beginPath(); ctx.arc(this.x, this.y, br, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = hit ? 'rgba(255,255,255,.95)' : 'rgba(190,245,255,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, br, 0, Math.PI*2); ctx.stroke();
      // 高光：左上一小段弧（泡泡的标志性反光）
      ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(this.x, this.y, br - 3, Math.PI*1.05, Math.PI*1.45); ctx.stroke();
      ctx.restore();
    } else if(this.bubbleBreakUntil > G.time){
      // 泡泡刚破：残留的碎泡闪光
      ctx.save();
      const t = (this.bubbleBreakUntil - G.time) / 0.4;
      ctx.strokeStyle = `rgba(200,245,255,${0.8*t})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 8 + (1-t)*22, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // hp bar (if damaged) —— 被暴击时血条横向颤动；血量已下限0，宽度再 clamp 一次防负宽度反向
    if(this.hp > 0 && this.hp < this.maxHp){
      const bw = this.r*2;
      let bx = this.x - bw/2;
      const by = this.y - this.r - 8;
      if(this.critShake > 0) bx += (Math.random()-0.5) * 10;
      ctx.fillStyle='rgba(0,0,0,.5)';
      ctx.fillRect(bx, by, bw, 4);
      ctx.fillStyle='#f44';
      ctx.fillRect(bx, by, bw*clamp(this.hp/this.maxHp, 0, 1), 4);
    }
    // ❄️ 冰冻（魔法师冰霜）：身体外一层冰壳（与头顶的眩晕星星区分：这是被冻住）
    if(this.frozen > 0) drawFrozenShell(this.x, this.y, this.r, this.frozen, this.frozenMax);
    // 眩晕提示：头顶旋转星星（暴击眩晕）
    if(this.stun > 0) drawStunStars(this.x, this.y - this.r - 18, 8);
    if(this.dogDotT > 0){ // 🐶 奶住：绿色毒圈标记（被狗奶持续掉血中）
      ctx.save(); ctx.strokeStyle = 'rgba(158,240,74,0.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 5, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    }
  }
}

// ===== 🕸️ 织网者（世界1 第 5 波起的功能型敌人）=====
// 定位：**零接触伤害**的功能型敌人 —— 它不冲上来咬人，只在**玩家周围**一张张铺蛛丝陷阱。
//   落点跟着玩家走（WEB_AIM_MIN~WEB_AIM_MAX 圈内的随机点）→ 网必定威胁到人，织在远处角落的网毫无意义。
//   蛛网无差别：**敌人自己也会被黏住** → 天然形成"自伤型阵地"，最优解是把它赶进它自己的网里。
//   数值很克制（血少 / 慢 / 零伤害）：任何角色都能秒它，威胁全在"网铺在哪"，不在它自己身上。
const WEB_R = 46;            // 蛛网半径（世界坐标，与判定同口径）
const WEB_SLOW = 0.45;       // 蛛网内移速倍率（黏住减速 55%，不冻结）
const WEB_DUR = 6;           // 蛛网存在时长（秒）
const WEB_MAX = 5;           // 同屏蛛网上限（超出则最早那张消失）
const WEB_CD = 3.2;          // 织网间隔（秒）
// 落点范围：织在【玩家周围】而不是随便某处 —— 网必须真的威胁到人才有意义
const WEB_AIM_MIN = 40;      // 落点离玩家最近距离（太近会直接盖脸上）
const WEB_AIM_MAX = 190;     // 落点离玩家最远距离（太远就够不着了）
const WEB_KEEPDIST = 340;    // 织网者与玩家的理想距离：够近能织到网，又不会被贴脸
const WEB_RETREAT = 250;     // 比理想距离更近时开始后退

// 铺一张蛛网（落在场地内）；同屏超过 WEB_MAX 时移除最早的一张
// owner = 织网者本人（死亡时用它清掉自己织的网）
function spawnWeb(x, y, owner){
  if(!G.effects) G.effects = [];
  const webs = G.effects.filter(ef => ef.type === 'web');
  for(let i = 0; webs.length - i >= WEB_MAX && i < webs.length; i++){
    const idx = G.effects.indexOf(webs[i]);
    if(idx >= 0) G.effects.splice(idx, 1);
  }
  G.effects.push({
    type:'web', x: clamp(x, WEB_R, WW()-WEB_R), y: clamp(y, WEB_R, WH()-WEB_R),
    r: WEB_R * visionZoom(),
    life: WEB_DUR, max: WEB_DUR,
    slow: WEB_SLOW,
    owner: owner || null,   // 织网者（死亡时清网用）
    seed: Math.random() * 6.283, // 纯视觉：蛛网纹路相位随机，多张网不会一模一样
  });
}
class WebSpiderEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 45*(hpScale||1), 70, 0, 14, '#8b7bb8'); // dmg=0：本身完全无接触伤害；体型瘦小（r=14，比普通怪 15 还小一点）
    this.webTimer = WEB_CD * 0.5; // 错开首次织网节奏
    this.isWebSpider = true;
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.stun > 0){ this.stun -= dt; return; } // 暴击眩晕：定身（不移动、不织网）
    const P = targetOf(this);
    // 织网：每 WEB_CD 秒在**玩家周围** WEB_AIM_MIN~WEB_AIM_MAX 的范围里随机落一张网
    //   落点跟着玩家走 → 网必定能威胁到人（织在远处角落的网毫无意义）
    this.webTimer -= dt;
    if(this.webTimer <= 0){
      this.webTimer = WEB_CD;
      const base = P || this;                       // 没有玩家时退回以自己为中心
      const a = rand(0, Math.PI*2);
      const d = rand(WEB_AIM_MIN, WEB_AIM_MAX);
      spawnWeb(base.x + Math.cos(a)*d, base.y + Math.sin(a)*d, this);
    }
    // 移动：与玩家维持 WEB_KEEPDIST 左右的距离（够近能织到网，又不会被贴脸）
    if(P){
      const ang = angleTo(this, P);
      const d = dist(this, P);
      if(d < WEB_RETREAT){ // 太近 → 后退
        this.x -= Math.cos(ang) * this.speed * dt;
        this.y -= Math.sin(ang) * this.speed * dt;
      } else if(d > WEB_KEEPDIST){ // 太远 → 靠近（维持织网距离）
        this.x += Math.cos(ang) * this.speed * dt;
        this.y += Math.sin(ang) * this.speed * dt;
      }
      this.x = clamp(this.x, -70, WW()+70);
      this.y = clamp(this.y, -70, WH()+70);
    }
  }
  die(){
    if(this.dead) return;
    // 死亡：炸开自己织的所有网（网瞬间消失）—— 所以"留着不打"是坏策略
    for(let i = G.effects.length - 1; i >= 0; i--){
      const ef = G.effects[i];
      if(ef.type === 'web' && ef.owner === this) G.effects.splice(i, 1);
    }
    super.die();
  }
}

// ===== 🌌 世界2 新怪（仅 G.world===2 的普通波刷出）=====
// ① 裂变怪（🟣）：死亡裂成 2 只小裂变怪（小裂变怪不再裂变）
class FissionEnemy extends Enemy {
  constructor(x,y,hpScale){
    // 对标世界1 普通怪 25血/110速/10伤：全面更高（2026-10-12 用户报「有些怪还没世界1 的强」→ 提速提伤）
    super(x, y, 34*(hpScale||1), 118, 12, 17, '#b06bff');
    this.splits = true; // 标记：死亡时裂变
  }
  die(){
    super.die();
    if(this.splits){
      for(let i=0;i<2;i++){
        G.enemies.push(new FissionChild(this.x + rand(-12,12), this.y + rand(-12,12)));
      }
    }
  }
}
class FissionChild extends Enemy {
  constructor(x,y){
    super(x, y, 14, 130, 7, 10, '#d9b3ff'); // 小裂变怪：血量低、速度更快、不再裂变
  }
}
// ② 腐蚀者（🟤）：周期性在原地留下腐蚀毒潭（对站在里面的玩家持续掉血，不伤敌人）
class CorrodeEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 40*(hpScale||1), 75, 10, 18, '#9a7b4f');
    this.corrodeT = rand(1.5, 3);
  }
  update(dt){
    super.update(dt);
    if(this.dead) return;
    this.corrodeT -= dt;
    if(this.corrodeT <= 0){
      this.corrodeT = rand(2.5, 4);
      G.effects.push({ type:'corrode', x:this.x, y:this.y, r:60*visionZoom(), life:3.5, max:3.5, tick:0.5, next:0.1, dmg:11 });
    }
  }
}
// ③ 汲取者（🔵）：靠近玩家时吸取其资源（魔力/体力）；世界1 无资源英雄不受任何影响
class DrainEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 28*(hpScale||1), 110, 8, 15, '#4ab0ff');
  }
  update(dt){
    super.update(dt);
    if(this.dead) return;
    const P = targetOf(this);
    if(P && !P.dead && dist(this, P) < this.r + P.r + 120){ // 🌌 汲取范围加大（60→120）
      let drained = 0;
      if(P.resType === 'mana'){ const b = P.mana; P.mana = Math.max(0, P.mana - 22*dt); drained = b - P.mana; }
      else if(P.resType === 'stamina'){ const b = P.stamina; P.stamina = Math.max(0, P.stamina - 22*dt); drained = b - P.stamina; }
      // 🌌 汲取到的资源化为力量，给自己回血（每秒约回 30）
      if(drained > 0) this.hp = Math.min(this.maxHp, this.hp + drained * 1.4);
    }
  }
}

// ④ 虚空疾行者（🩵）：世界2 的快速怪 —— 极高速贴脸 + 周期性短距闪现（对标世界1 快速怪：更快更烦）
class VoidDarter extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 22*(hpScale||1), 205, 10, 12, '#5ce1ff'); // 世界1 快速怪 15血/180速/8伤/10半径 → 全面更强
    this.blinkT = rand(1.2, 2.4);
  }
  update(dt){
    super.update(dt);
    if(this.dead) return;
    this.blinkT -= dt;
    if(this.blinkT <= 0){
      this.blinkT = rand(1.6, 2.8);
      const P = targetOf(this);
      const a = angleTo(this, P);
      const step = 90; // 朝玩家瞬闪一小段（贴脸更快，但不会穿到场地外）
      this.x = clamp(this.x + Math.cos(a)*step, this.r, WW()-this.r);
      this.y = clamp(this.y + Math.sin(a)*step, this.r, WH()-this.r);
      spawnParticles(this.x, this.y, '#5ce1ff', 5); // 闪现残影
    }
  }
}
// ⑤ 晶壁巨兽（🟪）：世界2 的坦克怪 —— 厚甲减伤 35%（对标世界1 坦克怪：更硬更疼）
class BulwarkEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 78*(hpScale||1), 62, 18, 26, '#8f6bd8'); // 世界1 坦克怪 50血/70速/15伤/22半径 → 全面加厚
    this.armor = 0.35; // 受到的一切伤害 -35%
  }
  takeDamage(d, color, isCrit, srcSeat){
    super.takeDamage(d * (1 - this.armor), color, isCrit, srcSeat);
  }
}
// ⑥ 裂隙冲撞者（🩷）：世界2 的冲撞怪 —— 取消蓄力，直接高速冲撞；撞墙前 1 秒急停（对标世界1 冲撞怪：更快更疼）
class RiftCharger extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 38*(hpScale||1), 120, 18, 20, '#ff6fb5'); // 世界1 冲撞怪 25血/110速/15伤/18半径 → 全面更强
    this.chCD = rand(0.8, 1.6);
    this.chState = 'chase'; // chase | charge
    this.chT = 0;
    this.chDir = {x:0, y:0};
    this.chHit = false;     // 每次冲撞只结算一次命中
    this.chEstop = 0;       // 撞墙前急停计时
  }
  takeDamage(d, color, isCrit, srcSeat){
    if(this.chState === 'charge') return; // 冲撞中无敌（子弹直接穿过）
    super.takeDamage(d, color, isCrit, srcSeat);
  }
  timeToWall(sp){ // 沿当前冲撞方向，到达任一墙还需多少秒
    let t = Infinity;
    if(this.chDir.x > 0) t = Math.min(t, (WW()-this.r - this.x) / (this.chDir.x*sp));
    else if(this.chDir.x < 0) t = Math.min(t, (this.x-this.r) / (-this.chDir.x*sp));
    if(this.chDir.y > 0) t = Math.min(t, (WH()-this.r - this.y) / (this.chDir.y*sp));
    else if(this.chDir.y < 0) t = Math.min(t, (this.y-this.r) / (-this.chDir.y*sp));
    return t;
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    if(this.stun > 0){ this.stun -= dt; this.chState='chase'; this.invincible=false; this.chEstop=0; return; } // 眩晕打断冲锋
    this.invincible = (this.chState === 'charge');
    const P = targetOf(this);
    const cands = G.players.filter(q => !q.dead && q.stunImmune<=0);
    if(this.chState === 'chase'){
      const a = angleTo(this, P);
      this.x += Math.cos(a)*this.speed*dt;
      this.y += Math.sin(a)*this.speed*dt;
      this.chCD -= dt;
      if(this.chCD <= 0 && P && dist(this, P) < 460){
        // 取消蓄力：直接锁定方向开撞
        const aa = angleTo(this, P);
        this.chDir = { x:Math.cos(aa), y:Math.sin(aa) };
        this.chState = 'charge'; this.chT = 1.2; this.chHit = false; this.chEstop = 0;
      }
      if(this.dmg>0) for(const Q of cands){
        if(Q && dist(this, Q) < this.r + Q.r){
          if(this.touchCD<=0){ Q.takeDamage(this.dmg, this); this.touchCD=0.5; }
          break;
        }
      }
    } else { // charge：直接冲撞，撞墙前 1 秒急停（不穿墙、给玩家躲避窗口）
      this.chT -= dt;
      const CHSPD = 700;
      const tw = this.timeToWall(CHSPD);
      if(tw < 1.0) this.chEstop = Math.max(this.chEstop, 1.0); // 撞墙前 1 秒急停
      if(this.chEstop > 0){
        this.chEstop -= dt; // 急停：原地不动
      } else {
        this.x += this.chDir.x*CHSPD*dt;
        this.y += this.chDir.y*CHSPD*dt;
        this.x = clamp(this.x, this.r, WW()-this.r);
        this.y = clamp(this.y, this.r, WH()-this.r);
      }
      if(!this.chHit) for(const Q of cands){
        if(Q && dist(this, Q) < this.r + Q.r){
          Q.takeDamage(this.dmg*1.6, this); // 冲撞命中：伤害 ×1.6 + 强击退
          const d = Math.max(0.001, dist(this, Q));
          Q.kbx = (Q.x-this.x)/d*420; Q.kby = (Q.y-this.y)/d*420;
          this.chHit = true; break;
        }
      }
      if(this.chT <= 0){ this.chState='chase'; this.chCD=rand(2.2, 3.4); this.invincible=false; this.chEstop=0; }
    }
  }
}
// ⑦ 棱光射手（🟡）：世界2 的激光怪 —— 保持中距离，三棱散射弹幕（对标世界1 激光怪：血更厚、一次三发）
class PrismShooter extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 30*(hpScale||1), 85, 0, 15, '#ffd24a'); // 世界1 激光怪 20血/80速/14半径 → 血更厚，改散射弹幕
    this.shootT = rand(0.8, 2.0);
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    if(this.stun > 0){ this.stun -= dt; return; } // 眩晕：停火
    const P = targetOf(this);
    const base = angleTo(this, P);
    const pd = dist(this, P);
    if(pd > 320){ this.x += Math.cos(base)*this.speed*dt; this.y += Math.sin(base)*this.speed*dt; }
    else if(pd < 240){ this.x -= Math.cos(base)*this.speed*dt; this.y -= Math.sin(base)*this.speed*dt; }
    this.shootT -= dt;
    if(this.shootT <= 0){
      this.shootT = rand(1.8, 2.8);
      const a0 = angleTo(this, P);
      for(let i=0;i<3;i++){
        const aa = a0 + (i-1)*0.22; // 三棱散射（留出可躲缝隙）
        const sp = 330;
        G.enemies.push({
          isBullet:true, owner:this, x:this.x, y:this.y, vx:Math.cos(aa)*sp, vy:Math.sin(aa)*sp, r:7,
          hp:999, maxHp:999, dead:false, flash:0, dmg:12, color:'#ffd24a', touchCD:0, speed:0, bounces:1,
          update(dt){
            this.x += this.vx*dt; this.y += this.vy*dt;
            if(voidReflectBounce(this, dt)) return; // 🌌 棱光射手弹幕：碰墙/炮台/战车反弹一次（不含其他怪）
            if(this.x<-20||this.x>WW()+20||this.y<-20||this.y>WH()+20){ this.dead=true; return; }
            const sh = shieldOrbHit(this.x, this.y, this.r); // 盾球可挡（判定半径=绘制世界半径）
            if(sh){ this.dead=true; SND.shieldBlock(); sh.owner.shieldFlash=0.15; spawnParticles(sh.x, sh.y, '#8ff', 8); return; }
            if(this.touchCD>0) this.touchCD -= dt;
            const cs = bossHitTargets();
            for(const Q of cs){
              if(!Q) continue;
              if(this.touchCD<=0 && dist(this, Q) < this.r + Q.r){ Q.takeDamage(this.dmg, this); this.touchCD=0.5; break; }
            }
          },
          draw(){
            ctx.fillStyle=this.color;
            ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
          },
          takeDamage(){},
        });
      }
    }
  }
}

// ⑧ 虚空泡（🫧）：世界2 的护罩敌人 —— 身上带一颗**虚空泡泡**：有泡泡时**完全免疫伤害**，
//    泡泡被打爆才能伤到本体；泡泡主人死了，泡泡会**跳到最近的敌人身上**继续护着（不会凭空消失）。
//    玩法：泡泡会让一只怪长时间打不动 → 玩家得先集火破泡（或等泡泡跳到别人身上），是"处理顺序"的考验。
const BUBBLE_HP = 60;        // 泡泡血量（破了才能伤本体）
function transferBubble(from){
  // 泡泡转移：找最近的、还活着且身上没有泡泡的敌人，把泡泡给它
  let best = null, bd = Infinity;
  for(const t of G.enemies){
    if(t === from || t.dead || t.dying || t.isBullet || t.invincible) continue;
    if(t.bubbleHp > 0) continue;         // 已有泡泡的不给（一只敌人最多一颗）
    const d = dist(from, t);
    if(d < bd){ bd = d; best = t; }
  }
  if(!best) return;                       // 没有接手人 → 泡泡随主人一起消失
  best.bubbleHp = from.bubbleHp;          // 泡泡血量原样带走（不打折，转移是"换人护"不是"削弱"）
  best.bubbleHitUntil = G.time + 0.2;
  // 转移特效：一道泡泡飞行轨迹（从旧主人到新主人）
  G.effects.push({ type:'bubbleMove', x1:from.x, y1:from.y, x2:best.x, y2:best.y, life:0.35, max:0.35 });
}
class VoidBubbleEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 26*(hpScale||1), 95, 8, 15, '#7fe3ff');
    this.bubbleHp = BUBBLE_HP;   // 开局自带一颗泡泡
    this.isVoidBubble = true;
  }
}

// ===== 🌿 世界3「蚀根林海」新怪（仅 G.world===3 的普通波刷出）=====
// 主题：被「蚀根」吞掉的古城森林。数值对标世界2 同阶，但机制整套换新——
//   世界2 = 资源抽取 + 泡泡护罩 + 冲撞；世界3 = 地面持续伤害 + 荆棘反伤 + 根须缠绕 + 种子爆散
//   共 8 种，一一对应世界1 的七种角色 + 一个额外功能种

// ① 腐藤怪（🟢）：世界3 的普通怪 —— 走过之处留下**减速藤痕**（不伤血，只黏脚；敌我双方都吃）
class VineWretch extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 36*(hpScale||1), 112, 12, 17, '#4fbf6a');
    this.vineT = rand(0, 0.5); // 错开留痕节奏，避免一整排同时铺
  }
  update(dt){
    super.update(dt);
    if(this.dead) return;
    this.vineT -= dt;
    if(this.vineT <= 0){
      this.vineT = 0.55;
      G.effects.push({ type:'vine', x:this.x, y:this.y, r:34, life:2.6, max:2.6, slow:0.55, seed:rand(0,6.28) });
    }
  }
}
// ② 孢囊妖（🟤）：世界3 的远程怪 —— 抛物线孢子弹，落地炸成一团**孢子云**（持续掉血 + 降攻速）
class SporePod extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 30*(hpScale||1), 78, 10, 15, '#a8763f');
    this.sporeT = rand(1.2, 2.4);
  }
  update(dt){
    super.update(dt);
    if(this.dead) return;
    this.sporeT -= dt;
    if(this.sporeT <= 0){
      this.sporeT = rand(2.6, 3.6);
      const P = targetOf(this);
      const a = P ? angleTo(this, P) + rand(-0.25, 0.25) : rand(0, 6.28);
      const d = P ? Math.min(280, Math.max(90, dist(this, P))) : 200; // 落在玩家附近（不打脸，给走位空间）
      G.effects.push({ type:'sporeArc', sx:this.x, sy:this.y,
        tx:clamp(this.x + Math.cos(a)*d, 30, WW()-30), ty:clamp(this.y + Math.sin(a)*d, 30, WH()-30),
        vx:Math.cos(a)*300, vy:Math.sin(a)*300, t:0, dur:Math.max(0.35, d/300), life:1.2, max:1.2 });
    }
  }
}
// ③ 掠花粉蜂（🟡）：世界3 的快速怪 —— 极高速 + 周期性横向摇摆（Z 字突进，比世界1 快速怪更难瞄）
class PollenWasp extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 20*(hpScale||1), 196, 9, 11, '#e8d24a');
    this.zigT = rand(0, 1.2);
    this.zigDir = Math.random() < 0.5 ? 1 : -1;
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){ this.x += this.kbx*dt; this.y += this.kby*dt; this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt); }
    const P = targetOf(this);
    if(P && !P.dead){
      const a = angleTo(this, P);
      this.zigT -= dt;
      if(this.zigT <= 0){ this.zigT = rand(0.5, 0.9); this.zigDir *= -1; } // 周期性换边
      const za = a + this.zigDir * 0.85; // 侧向 48°：走 Z 字
      const sp = this.speed;
      this.x += Math.cos(za)*sp*dt; this.y += Math.sin(za)*sp*dt;
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
    this.collidePlayer();
  }
}
// ④ 荆棘傀（🟩）：世界3 的坦克怪 —— 厚甲 + **反弹 30% 子弹伤害给射击者**（无脑扫射会被自己打死，改用技能/爆炸破）
class ThornPuppet extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 88*(hpScale||1), 58, 18, 27, '#2f8f4e');
    this.armor = 0.25;     // 受到的一切伤害 -25%
    this.thorn = 0.30;     // 反弹比例（仅子弹伤害，见 takeDamage）
  }
  takeDamage(d, color, isCrit, srcSeat, isBullet){
    // 🌿 荆棘反伤：只有「子弹」打过来才扎人（爆炸/技能不弹，给玩家留出解）
    if(isBullet && srcSeat !== undefined && srcSeat !== null){
      const src = G.players && G.players[srcSeat];
      if(src && !src.dead) src.takeDamage(Math.max(1, d * this.thorn), this, false, true);
    }
    super.takeDamage(d * (1 - this.armor), color, isCrit, srcSeat);
  }
}
// ⑤ 蚀光藤眼（🟣）：世界3 的激光怪 —— 原地生根，缓慢旋转扫射一道**藤光射线**（先预警 0.5s 再开火）
class TendrilEye extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 34*(hpScale||1), 46, 0, 18, '#9b5fd0');
    this.eyeT = rand(1.0, 2.0);
    this.eyeA = rand(0, 6.28);
    this.beam = null; // {t, dur, a}
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){ this.x += this.kbx*dt; this.y += this.kby*dt; this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt); }
    if(this.beam){
      this.beam.t -= dt;
      if(this.beam.t <= 0){ this.beam = null; this.eyeT = rand(1.6, 2.4); }
      return;
    }
    this.eyeT -= dt;
    if(this.eyeT > 0) return;
    this.eyeT = rand(2.2, 3.0);
    const P = targetOf(this);
    this.eyeA = P ? angleTo(this, P) : rand(0, 6.28);
    this.beam = { t:0.9, dur:0.9, a:this.eyeA };
    SND.enemyShoot();
    // 光束本体作为特效存在（预警 0.5s 只描线，之后逐帧结算持续伤害，见 updateEffects 的 tendrilBeam 分支）
    G.effects.push({ type:'tendrilBeam', x:this.x, y:this.y, a:this.eyeA, len:520*visionZoom(),
      w:16, warn:0.5, t:0.9, life:1.4, max:1.4, dmg:26 });
  }
}
// ⑥ 角棘冲锋兽（🟫）：世界3 的冲撞怪 —— 短蓄力后高速冲撞，撞墙定身 0.6 秒（对标世界1 冲撞怪：更疼更闷）
class BrambleCharger extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 40*(hpScale||1), 116, 20, 21, '#6b4a2f');
    this.chCD = rand(1.0, 2.0);
    this.chState = 'chase'; // chase | wind | charge | stun
    this.chT = 0;
    this.chDir = { x:0, y:0 };
    this.chHit = false;
  }
  takeDamage(d, color, isCrit, srcSeat, isBullet){
    if(this.chState === 'charge') return; // 冲撞中无敌（子弹直接穿过）
    super.takeDamage(d, color, isCrit, srcSeat);
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    this.chT -= dt;
    if(this.chState === 'chase'){
      const P = targetOf(this);
      if(P && !P.dead){
        const a = angleTo(this, P);
        this.x += Math.cos(a)*this.speed*dt; this.y += Math.sin(a)*this.speed*dt;
      }
      this.chCD -= dt;
      if(this.chCD <= 0 && this.chT <= 0){
        this.chState = 'wind'; this.chT = 0.55; this.chCD = rand(2.0, 3.2);
        const P2 = targetOf(this);
        const a2 = P2 ? angleTo(this, P2) : rand(0, 6.28);
        this.chDir = { x:Math.cos(a2), y:Math.sin(a2) };
      }
    } else if(this.chState === 'wind'){
      if(this.chT <= 0){ this.chState = 'charge'; this.chT = 0.75; this.chHit = false; SND.bossWarn(); }
    } else if(this.chState === 'charge'){
      const sp = 620;
      const nx = this.x + this.chDir.x*sp*dt, ny = this.y + this.chDir.y*sp*dt;
      if(nx < this.r || nx > WW()-this.r || ny < this.r || ny > WH()-this.r){
        this.chState = 'stun'; this.chT = 0.6; // 撞墙定身（玩家可趁机输出）
        spawnParticles(this.x, this.y, '#6b4a2f', 10);
      } else { this.x = nx; this.y = ny; }
    } else if(this.chState === 'stun'){
      if(this.chT <= 0) this.chState = 'chase';
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
    this.collidePlayer();
  }
}
// ⑦ 缠根妖（🕸）：世界3 的功能型敌人 —— 首个「零接触伤害 + 零移动」的阵地点：
//    每隔几秒在玩家周围随机落一团**根须**（黏住减速 + 周期性小伤害），逼玩家走位而不是站桩
class RootSnarer extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 52*(hpScale||1), 70, 0, 16, '#5c7a3a'); // dmg=0：碰到不掉血，纯阵地威胁
    this.rootCD = rand(1.2, 2.2);
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    this.rootCD -= dt;
    if(this.rootCD > 0) return;
    this.rootCD = rand(3.0, 4.2);
    // 🌿 落点跟随玩家：WEB_AIM_MIN~MAX 范围随机，保证威胁到人（织在远处角落毫无意义）
    const P = targetOf(this);
    const cx = P ? P.x : WW()/2, cy = P ? P.y : WH()/2;
    const a = rand(0, 6.28), d = rand(40, 190);
    const rx = clamp(cx + Math.cos(a)*d, 30, WW()-30), ry = clamp(cy + Math.sin(a)*d, 30, WH()-30);
    G.effects.push({ type:'root', owner:this, x:rx, y:ry, r:52, life:6.5, max:6.5, slow:0.45, dmg:9, tick:0.55, next:0.2, seed:rand(0,6.28) });
  }
  die(){
    super.die();
    // 死亡时炸掉自己铺的所有根须（不留陷阱，"留着不打"不是好策略）
    for(let i = G.effects.length - 1; i >= 0; i--){
      if(G.effects[i] && G.effects[i].type === 'root' && G.effects[i].owner === this) G.effects.splice(i, 1);
    }
  }
}
// ⑧ 蚀种魔（🫘）：世界3 的爆散怪 —— 死亡时炸开 4 颗**追踪种子**（追着玩家飞 6 秒，血量极低但烦人）
class SeedBomber extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 28*(hpScale||1), 128, 14, 15, '#c46a8e');
  }
  die(){
    if(!this.dead){
      for(let i = 0; i < 4; i++){
        const a = i/4*Math.PI*2 + rand(-0.3, 0.3);
        G.enemies.push(new SeedSwarm(this.x + Math.cos(a)*16, this.y + Math.sin(a)*16));
      }
      spawnParticles(this.x, this.y, '#c46a8e', 12);
    }
    super.die();
  }
}
// 追踪种子：飞出去后 6 秒内慢慢转向玩家（不是无限追，给玩家拉开的空间）
class SeedSwarm extends Enemy {
  constructor(x,y){
    super(x, y, 8, 150, 7, 9, '#e8a0bd');
    this.life = 6;
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    this.life -= dt;
    if(this.life <= 0){ this.dead = true; return; }
    const P = targetOf(this);
    if(P && !P.dead){
      const a = angleTo(this, P);
      const cur = Math.atan2(this.vy0 || 0, this.vx0 || 0);
      const da = a - cur;
      const turn = 2.6 * dt; // 每秒约 149° 转向：追得到，但绕圈能甩掉
      let na = cur + clamp(da, -turn, turn);
      this.vx0 = Math.cos(na) * this.speed; this.vy0 = Math.sin(na) * this.speed;
      this.x += this.vx0*dt; this.y += this.vy0*dt;
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
    this.collidePlayer();
  }
}

// 每2秒散射3发慢速弹幕：中间朝玩家，左右各偏30°
class RangedEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 20*hpScale, 90, 10, 13, '#4af');
    this.shootTimer = rand(0, 1.5); // 错开射击节奏
    this.isRanged = true;
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    // knockback
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 暴击眩晕：定身（不移动、不射击、不摸伤）
    if(this.stun > 0){ this.stun -= dt; return; }
    // 与玩家保持距离：远了靠近，近了后退
    const P = targetOf(this);
    const d = dist(this, P);
    const a = angleTo(this, P);
    const ideal = 280;
    if(d > ideal+30){
      this.x += Math.cos(a)*this.speed*dt;
      this.y += Math.sin(a)*this.speed*dt;
    } else if(d < ideal-30){
      this.x -= Math.cos(a)*this.speed*dt;
      this.y -= Math.sin(a)*this.speed*dt;
    }
    // 接触伤害（双人：碰到谁谁掉血）
    if(this.dmg > 0 && this.touchCD<=0){
      const cands = bossHitTargets();
      for(const Q of cands){
        if(Q && dist(this, Q) < this.r + Q.r){
          Q.takeDamage(this.dmg, this);
          this.touchCD = 0.5;
          break;
        }
      }
    }
    // 散射3发弹幕
    this.shootTimer += dt;
    if(this.shootTimer >= 2){
      this.shootTimer = 0;
      const baseA = angleTo(this, P);
      const spread = Math.PI/6; // 30°
      for(let i=0;i<3;i++){
        const ang = baseA + (i-1)*spread; // -30°, 0°, +30°
        fireEnemyBullet(this.x, this.y, Math.cos(ang)*160, Math.sin(ang)*160, 6, 6, '#4af');
      }
    }
  }
  draw(){
    super.draw();
  }
}

// ===== SLIME ENEMY (粘液怪-绿) =====
// 数值介于普通/快速怪之间，无近战伤害；不与玩家贴脸，而是保持距离绕圈游走；
// 每1.5秒身下定时生成粘液；若身体碰到玩家或护盾球，无视技能CD立即产一滩粘液；死亡生成大粘液
class SlimeEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 20*hpScale, 145, 0, 13, '#5c5'); // dmg=0 无近战
    this.slimeTimer = rand(0, 1.5);
    this.touchSlimeCD = 0;   // 接触产粘液的短冷却（防贴身刷屏，0.6s）
    this.orbitDir = Math.random() < 0.5 ? 1 : -1; // 绕圈方向随机（避免全部同向转圈）
    this.isSlime = true;
  }
  takeDamage(d, color, isCrit){
    this.hp = Math.max(0, this.hp - d); // 血量下限0（同基类：暴击过量不出现负血量）
    this.flash = 0.1;
    if(isCrit){
      this.critShake = 0.3;
      this.stun = Math.max(this.stun||0, 0.5); // 暴击眩晕0.5秒
    }
    if(this.hp <= 0){
      if(isCrit){
        // 暴击致死：先颤动再死亡（死亡时仍生成大粘液）
        this.dying = true; this.deathShake = 0.35; this.critShake = 0.35;
      } else {
        this.die();
      }
    }
  }
  die(){
    if(this.dead) return;
    this.dead = true;
    G.kills = (G.kills||0) + 1; Achieve.checkKill(); // 粘液怪覆写 die：同样累计击杀
    G.gems.push(new ExpGem(this.x, this.y, this.xpDrop));
    spawnParticles(this.x, this.y, this.color, 8);
    // 死亡生成大粘液（半径=自身r×4，直径的4倍比例）
    G.slimes.push(new Slime(this.x, this.y, this.r*4));
    healOnKill(this.lastHitIdx); // 挑战模式吸血（双人按击杀归属结算）
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.touchSlimeCD>0) this.touchSlimeCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 暴击眩晕：定身（不移动、不产粘液）
    if(this.stun > 0){ this.stun -= dt; return; }
    const p = targetOf(this); // 双人：锁定最近存活玩家
    const d = dist(this, p);
    const a = angleTo(this, p);
    const ideal = 180; // 与玩家保持的游走距离
    if(d > ideal + 40){
      // 太远：靠近玩家
      this.x += Math.cos(a)*this.speed*dt;
      this.y += Math.sin(a)*this.speed*dt;
    } else if(d < ideal - 40){
      // 太近：后退拉开距离
      this.x -= Math.cos(a)*this.speed*dt;
      this.y -= Math.sin(a)*this.speed*dt;
    } else {
      // 距离合适：绕玩家切向游走
      const ta = a + this.orbitDir*Math.PI/2;
      this.x += Math.cos(ta)*this.speed*dt;
      this.y += Math.sin(ta)*this.speed*dt;
    }
    // 身体碰到玩家或护盾球 → 无视1.5s技能CD，立即产一滩粘液（0.6s短冷却防刷屏）
    const bodyTouch = d < this.r + p.r;
    let shieldTouch = false;
    if(p.shield > 0){
      for(let i=0;i<p.shield;i++){
        const sa = p.shieldAngle + i*(Math.PI*2/p.shield);
        const sx = p.x + Math.cos(sa)*45;
        const sy = p.y + Math.sin(sa)*45;
        if(dist(this, {x:sx, y:sy}) < this.r + 18){ shieldTouch = true; break; }
      }
    }
    if((bodyTouch || shieldTouch) && this.touchSlimeCD <= 0){
      this.touchSlimeCD = 0.6;
      G.slimes.push(new Slime(this.x, this.y, this.r*3)); // 普通水洼：半径=自身r×3（直径3倍比例）
    }
    // 定时生成粘液（游走时持续布设陷阱）
    this.slimeTimer += dt;
    if(this.slimeTimer >= 1.5){
      this.slimeTimer = 0;
      G.slimes.push(new Slime(this.x, this.y, this.r*3)); // 普通水洼：半径=自身r×3（直径3倍比例）
    }
  }
  draw(){
    super.draw();
  }
}

// ===== 🔫 手持武器外观（只换"手里那把家伙"：体型 / 判定 / 弹道一律不动）=====
// 统一画法：把原点挪到角色中心、把 x 轴转到瞄准角，再一律用「角色半径 r 的倍数」当尺寸单位
//   → 视野缩放 / 大小技能变化时武器自动跟着缩，不会出现"人小枪大"。
function wpnBegin(p, ang){ ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
function wpnEnd(){ ctx.restore(); }
function wpnPoly(pts, fill, stroke, lw){ // 折线多边形（pts 为 [x,y] 数组）
  ctx.beginPath();
  for(let i = 0; i < pts.length; i++){ const q = pts[i]; if(i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]); }
  ctx.closePath();
  if(fill){ ctx.fillStyle = fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
// 近战三把（跟着挥砍动画摆）：🗡剑士大剑 / 🌀龙卷风双刃 / ⚔️将军长枪
function drawMeleeWeapon(p, ang, len, R){
  const L = len / R;                       // 刀锋总长换算成 r 的倍数（平时 2.4 / 挥砍瞬间 2.9）
  wpnBegin(p, ang);
  if(p.isSpring){
    // 🥊 弹簧「弹簧拳」：一节节拉开的钢圈弹簧 + 红色拳击手套（喜剧拳既视感）
    //    蓄力时整条拳压回身后（蓄得越久缩得越短、圈上金光越亮）；出拳那一下整个弹出去
    const chg = p.spCharging ? clamp((p.spChargeT||0) / SP_CHARGE_MAX, 0, 1) : 0; // 蓄力档 0~1
    const out = (p.spPunchFx > 0) ? 1 : 0;                       // 出拳伸展标志
    const baseX = R * 0.30;                                      // 弹簧圈起点（手边）
    const tipX  = R * L * (0.98 + 0.22*out);                     // 拳头顶端（出拳时探得更远）
    const tip   = tipX - chg * R * 0.55;                         // 蓄力把拳拉回身后
    const coilN = 6;                                             // 弹簧圈数
    const squish = 1 - 0.45*chg;                                 // 蓄力时圈被压扁
    // 钢丝弹簧：正弦绕出的一节节圈（不用真螺旋，正面看就是"弹簧"）
    ctx.strokeStyle = '#c9d4e0'; ctx.lineWidth = R * 0.11;
    ctx.beginPath();
    for(let i=0;i<=coilN*8;i++){
      const t = i/(coilN*8);
      const px = baseX + (tip - baseX) * t;
      const py = Math.sin(t*Math.PI*coilN) * R * 0.16 * squish;
      if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; // 钢丝高光
    ctx.beginPath();
    for(let i=0;i<=coilN*8;i++){
      const t = i/(coilN*8);
      const px = baseX + (tip - baseX) * t;
      const py = Math.sin(t*Math.PI*coilN) * R * 0.16 * squish - R*0.03;
      if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // 红色拳套：圆拳面 + 大拇指 + 腕口（一眼认出"这是打出去的那只拳"）
    const gr = R * 0.30, gx = tip - gr*0.35;
    ctx.fillStyle = '#e0405a';
    ctx.beginPath(); ctx.arc(gx, 0, gr, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8a1626'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#f26d82';                                   // 拳面高光
    ctx.beginPath(); ctx.arc(gx - gr*0.32, -gr*0.30, gr*0.26, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c23248';                                   // 大拇指（侧边翘起）
    ctx.beginPath(); ctx.ellipse(gx - gr*0.95, -gr*0.55, gr*0.34, gr*0.22, -0.7, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8a1626'; ctx.lineWidth = 1.2; ctx.stroke();
    if(chg > 0){ // 蓄力金光：蓄得越久越亮，满蓄呼吸闪烁（"这一拳要大了"）
      ctx.strokeStyle = `rgba(255,209,102,${0.35 + 0.5*chg})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, 0, gr + 3 + 2*Math.sin(G.time*18), 0, Math.PI*2); ctx.stroke();
    }
  } else if(p.isEngineer){
    // ⚙️ 工程师「扳手」：长钢柄 + 张嘴的呆头扳手（工业橙漆）——挥起来像敲钉子，呼应 8 伤的微弱输出
    const tip = R * L * 0.98;                                // 与其它近战同长（弱不在短，在伤害低）
    ctx.strokeStyle = '#8d949f'; ctx.lineWidth = R * 0.22;   // 扳手柄（钢）
    ctx.beginPath(); ctx.moveTo(R * 0.04, 0); ctx.lineTo(tip - R * 0.32, 0); ctx.stroke();
    ctx.strokeStyle = '#3f4550'; ctx.lineWidth = R * 0.30;   // 手握处（防滑橡胶套）
    ctx.beginPath(); ctx.moveTo(R * 0.04, 0); ctx.lineTo(R * 0.34, 0); ctx.stroke();
    const hx = tip - R * 0.16;                               // 扳手头（工业橙块）
    ctx.fillStyle = '#ffb347';
    ctx.beginPath();
    ctx.moveTo(hx - R * 0.30, -R * 0.34); ctx.lineTo(hx + R * 0.32, -R * 0.34);
    ctx.lineTo(hx + R * 0.32, R * 0.34); ctx.lineTo(hx - R * 0.30, R * 0.34);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a5b16'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#2c313a'; ctx.lineWidth = R * 0.16;   // 开口（咬螺栓的豁口）
    ctx.beginPath(); ctx.moveTo(hx + R * 0.32, -R * 0.15); ctx.lineTo(hx + R * 0.02, -R * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + R * 0.32,  R * 0.15); ctx.lineTo(hx + R * 0.02,  R * 0.15); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; // 钢面高光
    ctx.beginPath(); ctx.moveTo(R * 0.10, -R * 0.05); ctx.lineTo(tip - R * 0.36, -R * 0.05); ctx.stroke();
  } else if(p.isRookie){
    // 🐣 新手「木棍」：一根削过的树杈 + 一片叶子（全员最短最寒酸的武器，呼应 62 的范围）
    const tip = R * L * 0.98;  // 与大剑/利爪同长（2.4r）—— 弱不在短，在细和寒酸
    ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = R * 0.20;   // 木棍本体
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(tip, 0); ctx.stroke();
    ctx.strokeStyle = '#5b3f26'; ctx.lineWidth = R * 0.28;   // 手握处（深一档）
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * 0.32, 0); ctx.stroke();
    ctx.strokeStyle = '#a8895c'; ctx.lineWidth = R * 0.09;   // 木纹
    ctx.beginPath(); ctx.moveTo(R * 0.40, -R * 0.06); ctx.lineTo(tip - R * 0.08, -R * 0.06); ctx.stroke();
    ctx.fillStyle = '#5fbf6a';                               // 一小片叶子（树杈上没撸干净）
    ctx.beginPath(); ctx.ellipse(tip - R * 0.18, -R * 0.18, R * 0.22, R * 0.10, -0.6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; // 上缘高光
    ctx.beginPath(); ctx.moveTo(R * 0.12, -R * 0.04); ctx.lineTo(tip, -R * 0.04); ctx.stroke();
  } else if(p.isVampire){
    // 🦇 吸血鬼「血爪」：暗红拳套 + 三道血刃爪（爪尖带弯钩，跟着挥砍一起甩出去）
    const tipX = R * L, baseX = R * (L - 0.55);
    ctx.fillStyle = '#3d0f1e';                                   // 拳套
    ctx.beginPath(); ctx.arc(R * 0.22, 0, R * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 1.4; ctx.stroke();
    for(let i = -1; i <= 1; i++){                                // 三道爪（中间最长，两侧外撇）
      const off = i * 0.15;
      wpnPoly([[R * 0.30, R * off * 1.6], [baseX, R * off * 2.0 - R * 0.10], [tipX, R * off * 3.0], [baseX, R * off * 2.0 + R * 0.10]],
        i === 0 ? '#ff6b86' : '#d63a58', '#ffd0d8', 1.1);
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; // 爪脊高光
      ctx.beginPath(); ctx.moveTo(R * 0.34, R * off * 1.6); ctx.lineTo(baseX, R * off * 2.0); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,77,109,.85)';                      // 掌心血珠
    ctx.beginPath(); ctx.arc(R * 0.22, 0, R * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if(p.isGeneral){
    // ⚔️ 将军「长枪」：长木杆 + 三道缠手绳 + 金菱形枪头 + 红缨（枪身最长，呼应 118 的突刺距离）
    const head = L * 0.62;                 // 枪头起点
    ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = R * 0.26;
    ctx.beginPath(); ctx.moveTo(R * 0.10, 0); ctx.lineTo(R * head, 0); ctx.stroke();
    ctx.strokeStyle = '#c08a4a'; ctx.lineWidth = R * 0.30;   // 手握缠绳
    for(let i = 0; i < 3; i++){
      const x = R * (0.34 + i * 0.16);
      ctx.beginPath(); ctx.moveTo(x, -R * 0.17); ctx.lineTo(x, R * 0.17); ctx.stroke();
    }
    ctx.strokeStyle = '#e0453a'; ctx.lineWidth = R * 0.15;   // 红缨两撮
    ctx.beginPath(); ctx.moveTo(R * head, 0); ctx.lineTo(R * (head - 0.44), -R * 0.30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R * head, 0); ctx.lineTo(R * (head - 0.44), R * 0.30); ctx.stroke();
    wpnPoly([[R * head, 0], [R * (head + 0.34), -R * 0.24], [R * L, 0], [R * (head + 0.34), R * 0.24]], '#ffd166', '#fff3b0', 1.4);
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; // 枪脊高光
    ctx.beginPath(); ctx.moveTo(R * head, 0); ctx.lineTo(R * L, 0); ctx.stroke();
  } else if(p.isTornado){
    // 🌀 龙卷风「双刃」：以自身为轴的一对青蓝弧刃（前后各一，转起来像风车）
    for(let s = 0; s < 2; s++){
      ctx.save(); if(s === 1) ctx.rotate(Math.PI);
      const blade = L * 0.90;
      ctx.strokeStyle = '#2c5a66'; ctx.lineWidth = R * 0.20;  // 短柄
      ctx.beginPath(); ctx.moveTo(-R * 0.50, 0); ctx.lineTo(R * 0.06, 0); ctx.stroke();
      wpnPoly([[R * 0.06, 0], [R * blade, -R * 0.26], [R * (blade + 0.26), 0], [R * blade, R * 0.26]], '#8ef0ff', '#e6ffff', 1.6);
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * blade, 0); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#d8b45a';                                   // 轴心
    ctx.beginPath(); ctx.arc(0, 0, R * 0.24, 0, Math.PI * 2); ctx.fill();
  } else if(p.isDogmilk){
    // 🐶 野生狗奶「短刀（奶刀）」：短粗木柄 + 一截短刃（比大剑短一大截，呼应近身短刀的弱射程；不再是剑士大剑）
    const blade = L * 0.60;
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = R * 0.20;   // 木柄
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * 0.40, 0); ctx.stroke();
    wpnPoly([[R * 0.40, -R * 0.11], [R * blade, -R * 0.15], [R * (blade + 0.14), 0], [R * blade, R * 0.15], [R * 0.40, R * 0.11]],
      '#dfe9ff', 'rgba(255,255,255,.9)', 1.1);               // 短刃（银白）
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;             // 刃脊高光
    ctx.beginPath(); ctx.moveTo(R * 0.42, 0); ctx.lineTo(R * blade, 0); ctx.stroke();
  } else if(p.isKnight){
    // 🛡 骑士「重剑」：比剑士更宽更厚的钢蓝大剑（金十字护手 + 缠绳握把 + 深蓝刃身）
    //    刃身刻意做得宽一档（半宽 0.20r vs 剑士 0.16r）——一眼看出"这一把更重"
    const guard = L * 0.42;
    ctx.strokeStyle = '#4a3a28'; ctx.lineWidth = R * 0.26;      // 握把（深木）
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * guard, 0); ctx.stroke();
    ctx.strokeStyle = '#7a9cc0'; ctx.lineWidth = R * 0.28;      // 缠绳（钢蓝）
    for(let i = 0; i < 2; i++){
      const x = R * (0.16 + i * 0.13);
      ctx.beginPath(); ctx.moveTo(x, -R * 0.15); ctx.lineTo(x, R * 0.15); ctx.stroke();
    }
    ctx.fillStyle = '#ffd166';                                  // 剑首
    ctx.beginPath(); ctx.arc(R * 0.04, 0, R * 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = R * 0.22;      // 十字护手（金）
    ctx.beginPath(); ctx.moveTo(R * guard, -R * 0.46); ctx.lineTo(R * guard, R * 0.46); ctx.stroke();
    wpnPoly([[R * guard, -R * 0.20], [R * (L - 0.18), -R * 0.20], [R * L, 0], [R * (L - 0.18), R * 0.20], [R * guard, R * 0.20]],
      '#a9c4e2', 'rgba(255,255,255,.9)', 1.3);                  // 宽厚剑身（钢蓝）
    ctx.strokeStyle = '#e8f2ff'; ctx.lineWidth = R * 0.12;      // 亮刃口（上缘）
    ctx.beginPath(); ctx.moveTo(R * guard, -R * 0.20); ctx.lineTo(R * (L - 0.18), -R * 0.20); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,110,160,.9)'; ctx.lineWidth = R * 0.07; // 中脊（深蓝）
    ctx.beginPath(); ctx.moveTo(R * (guard + 0.06), 0); ctx.lineTo(R * (L - 0.12), 0); ctx.stroke();
  } else {
    // 🗡 剑士「大剑」：宽白剑身 + 金刃口 + 十字护手 + 缠绳剑柄 + 剑首
    const guard = L * 0.42;                  // 护手位置
    ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = R * 0.24;      // 剑柄
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * guard, 0); ctx.stroke();
    ctx.strokeStyle = '#9a7550'; ctx.lineWidth = R * 0.26;      // 缠绳
    for(let i = 0; i < 2; i++){
      const x = R * (0.16 + i * 0.13);
      ctx.beginPath(); ctx.moveTo(x, -R * 0.15); ctx.lineTo(x, R * 0.15); ctx.stroke();
    }
    ctx.fillStyle = '#ffd166';                                  // 剑首
    ctx.beginPath(); ctx.arc(R * 0.04, 0, R * 0.17, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = R * 0.20;      // 十字护手
    ctx.beginPath(); ctx.moveTo(R * guard, -R * 0.42); ctx.lineTo(R * guard, R * 0.42); ctx.stroke();
    wpnPoly([[R * guard, -R * 0.16], [R * (L - 0.16), -R * 0.16], [R * L, 0], [R * (L - 0.16), R * 0.16], [R * guard, R * 0.16]],
      '#f2f6ff', 'rgba(255,255,255,.9)', 1.2);                  // 剑身
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = R * 0.11;      // 金刃口（上缘）
    ctx.beginPath(); ctx.moveTo(R * guard, -R * 0.16); ctx.lineTo(R * (L - 0.16), -R * 0.16); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,185,230,.85)'; ctx.lineWidth = R * 0.06; // 中脊
    ctx.beginPath(); ctx.moveTo(R * (guard + 0.06), 0); ctx.lineTo(R * (L - 0.10), 0); ctx.stroke();
  }
  wpnEnd();
}
// 🛡 骑士「塔盾」（不攻击时举着）：亮银筝形盾 + 深钢蓝厚边 + 金饰边 + 中央十字徽，立在身侧前方（朝瞄准方向）
//   盾刻意做得比身体还大、颜色用亮银——和钢蓝身体强对比，任何背景下一眼看得见"盾在这儿"
//   外加一圈常驻淡白辉光（贴身在深色身体/怪堆里也不糊）；挡下攻击的瞬间（kBlockFx>0）盾面刷白闪 + 外扩火花环
function drawKnightShield(p, ang){
  const R = p.r;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(ang);
  // 盾位：身前方、偏左侧（右手持剑，盾在左）——明显在身体外沿，不糊在一起
  const ox = R * 1.00, oy = -R * 0.42, sw = R * 0.86, sh = R * 1.00;
  ctx.save();
  ctx.translate(ox, oy);
  // 常驻淡白辉光（放大一圈的虚影）：钢蓝身体旁也一眼看得见
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.fillStyle = '#d6e8ff';
  ctx.beginPath();
  ctx.moveTo(0, -sh * 1.24);
  ctx.bezierCurveTo(sw * 1.16, -sh * 1.24, sw * 1.26, -sh * 0.62, sw * 1.26, -sh * 0.08);
  ctx.bezierCurveTo(sw * 1.26, sh * 0.74, sw * 0.60, sh * 1.12, 0, sh * 1.28);
  ctx.bezierCurveTo(-sw * 0.60, sh * 1.12, -sw * 1.26, sh * 0.74, -sw * 1.26, -sh * 0.08);
  ctx.bezierCurveTo(-sw * 1.26, -sh * 0.62, -sw * 1.16, -sh * 1.24, 0, -sh * 1.24);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.beginPath(); // 筝形（上圆下尖）
  ctx.moveTo(0, -sh);
  ctx.bezierCurveTo(sw * 0.9, -sh, sw, -sh * 0.55, sw, -sh * 0.1);
  ctx.bezierCurveTo(sw, sh * 0.55, sw * 0.45, sh * 0.85, 0, sh);
  ctx.bezierCurveTo(-sw * 0.45, sh * 0.85, -sw, sh * 0.55, -sw, -sh * 0.1);
  ctx.bezierCurveTo(-sw, -sh * 0.55, -sw * 0.9, -sh, 0, -sh);
  ctx.closePath();
  ctx.fillStyle = '#e9f1fb'; ctx.fill();                                  // 亮银盾面（与深钢蓝身体强对比）
  ctx.strokeStyle = '#2c4a6e'; ctx.lineWidth = Math.max(1.8, R * 0.17); ctx.stroke(); // 深钢蓝厚边
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = Math.max(1.2, R * 0.10); ctx.stroke(); // 金饰内边
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.stroke();         // 内缘高光
  ctx.strokeStyle = '#2c4a6e'; ctx.lineWidth = Math.max(1.3, R * 0.11);               // 中央十字徽
  ctx.beginPath(); ctx.moveTo(0, -sh * 0.55); ctx.lineTo(0, sh * 0.55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-sw * 0.42, -sh * 0.1); ctx.lineTo(sw * 0.42, -sh * 0.1); ctx.stroke();
  ctx.fillStyle = '#ffd166';                                                 // 徽心金珠
  ctx.beginPath(); ctx.arc(0, -sh * 0.1, R * 0.10, 0, Math.PI * 2); ctx.fill();
  if(p.kBlockFx > 0){ // 挡下的白闪
    ctx.globalAlpha = clamp(p.kBlockFx / 0.2, 0, 1);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if(p.kBlockFx > 0){ // 火花外扩环
    const k = 1 - clamp(p.kBlockFx / 0.2, 0, 1);
    ctx.strokeStyle = `rgba(200,225,255,${0.8 * (1 - k)})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ox, oy, sw * (1 + k * 1.6), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
// 远程四把（固定朝瞄准方向）：🔫射手双管手枪 / 🔆激光发射器 / 💣爆破炮 / 🧪毒液喷枪
function drawGunWeapon(p, ang, R){
  const kind = heroKind(p);
  wpnBegin(p, ang);
  if(kind === 'laser'){
    // 🔆 「激光发射器」：长筒 + 散热鳍 + 发光透镜（颜色=当前热量）+ 尾部电池
    wpnPoly([[R * 0.22, -R * 0.30], [R * 1.55, -R * 0.30], [R * 1.55, R * 0.30], [R * 0.22, R * 0.30]], '#2a2438', '#7a6aa8', 1.4);
    ctx.strokeStyle = '#6a5a8a'; ctx.lineWidth = 1.4;
    for(let i = 0; i < 4; i++){
      const x = R * (0.58 + i * 0.22);
      ctx.beginPath(); ctx.moveTo(x, -R * 0.33); ctx.lineTo(x, R * 0.33); ctx.stroke();
    }
    ctx.fillStyle = '#4a3a6a';                                  // 电池
    ctx.fillRect(R * 0.08, -R * 0.20, R * 0.26, R * 0.40);
    ctx.strokeStyle = '#c8a6ff'; ctx.lineWidth = 1.6;           // 供能线
    ctx.beginPath(); ctx.moveTo(R * 0.34, 0); ctx.lineTo(R * 0.72, 0); ctx.stroke();
    const col = p.laserBodyColor();
    ctx.fillStyle = col;                                        // 前端透镜
    ctx.beginPath(); ctx.arc(R * 1.52, 0, R * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.beginPath(); ctx.arc(R * 1.52, 0, R * 0.13, 0, Math.PI * 2); ctx.fill();
    wpnPoly([[R * 0.42, R * 0.26], [R * 0.62, R * 0.26], [R * 0.58, R * 0.74], [R * 0.38, R * 0.74]], '#3a3050', null, 0);
  } else if(kind === 'bomber'){
    // 💣 「爆破炮」：粗短炮管 + 金炮口 + 侧挂榴弹鼓 + 握把
    wpnPoly([[R * 0.20, -R * 0.42], [R * 1.28, -R * 0.42], [R * 1.28, R * 0.42], [R * 0.20, R * 0.42]], '#4a4038', '#8a7a5a', 1.4);
    ctx.fillStyle = '#ffb347';                                  // 炮口
    ctx.beginPath(); ctx.arc(R * 1.28, 0, R * 0.46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(R * 1.28, 0, R * 0.24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(R * 1.28, 0, R * 0.46, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#6a5030';                                  // 榴弹鼓
    ctx.beginPath(); ctx.arc(R * 0.70, R * 0.54, R * 0.44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,209,102,.85)';                    // 鼓上三发榴弹
    for(let i = 0; i < 3; i++){
      const t = -0.6 + i * 0.6;
      ctx.beginPath(); ctx.arc(R * (0.70 + Math.cos(t) * 0.20), R * (0.54 + Math.sin(t) * 0.20), R * 0.10, 0, Math.PI * 2); ctx.fill();
    }
    wpnPoly([[R * 0.32, R * 0.34], [R * 0.56, R * 0.34], [R * 0.52, R * 0.94], [R * 0.28, R * 0.94]], '#3a3028', null, 0);
  } else if(kind === 'venom'){
    // 🧪 「毒液喷枪」：墨绿枪身 + 细长喷嘴 + 侧挂毒液罐（半透明液体）+ 输液管
    wpnPoly([[R * 0.20, -R * 0.26], [R * 1.05, -R * 0.26], [R * 1.05, R * 0.26], [R * 0.20, R * 0.26]], '#33421f', '#7fae3a', 1.4);
    wpnPoly([[R * 1.05, -R * 0.13], [R * 1.72, -R * 0.17], [R * 1.72, R * 0.17], [R * 1.05, R * 0.13]], '#9ac04a', '#d6f08a', 1.1);
    ctx.fillStyle = '#c8f26a';                                  // 喷嘴口（一滴毒）
    ctx.beginPath(); ctx.arc(R * 1.72, 0, R * 0.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(158,240,74,.5)';                      // 毒液罐
    ctx.beginPath(); ctx.arc(R * 0.66, R * 0.56, R * 0.44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d6f08a'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.2; // 液面高光
    ctx.beginPath(); ctx.arc(R * 0.66, R * 0.56, R * 0.44, -Math.PI * 0.2, Math.PI * 0.5); ctx.stroke();
    ctx.strokeStyle = '#9ef04a'; ctx.lineWidth = 1.4;           // 输液管
    ctx.beginPath(); ctx.moveTo(R * 0.62, R * 0.16); ctx.lineTo(R * 0.46, R * 0.14); ctx.stroke();
    ctx.fillStyle = 'rgba(200,242,106,.9)';                     // 压力表
    ctx.beginPath(); ctx.arc(R * 0.58, -R * 0.28, R * 0.13, 0, Math.PI * 2); ctx.fill();
  } else if(kind === 'stone'){
    // 🪨 投石「拾取器·滚筒」：一台小滚筒 —— **滚筒横向**（鼓的轴垂直于朝向，像压路机那样横着扫过去）
    //    结构：木推杆 → 前端分上下两支叉臂伸到鼓的两头轴头 → 鼓是横躺的圆柱（俯视＝胶囊 + 滚棱 + 中缝高光）
    //    与其它手持武器同一套 r 倍数画法，随体型/视野等比缩放；贴身一戳 = 拿滚筒怼一下
    const drumX = R * 1.30, drumL = R * 0.88, drumW = R * 0.56;
    ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = R * 0.16;      // 木推杆
    ctx.beginPath(); ctx.moveTo(R * 0.04, 0); ctx.lineTo(drumX - R * 0.34, 0); ctx.stroke();
    ctx.strokeStyle = '#9a7550'; ctx.lineWidth = R * 0.10;      // 握把缠绳
    ctx.beginPath(); ctx.moveTo(R * 0.08, 0); ctx.lineTo(R * 0.26, 0); ctx.stroke();
    ctx.strokeStyle = '#5a4a38'; ctx.lineWidth = R * 0.11;      // 上下叉臂（先画，压不到鼓面 → 像伸到鼓两头的轴头）
    ctx.beginPath(); ctx.moveTo(drumX - R * 0.34, 0); ctx.lineTo(drumX, -drumL); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(drumX - R * 0.34, 0); ctx.lineTo(drumX,  drumL); ctx.stroke();
    // 滚筒鼓（横躺的圆柱：本地 y 方向 = 垂直于朝向 = "横向"，两端半圆头）
    ctx.beginPath();
    ctx.arc(drumX, -drumL, drumW / 2, Math.PI, Math.PI * 2);
    ctx.lineTo(drumX + drumW / 2, drumL);
    ctx.arc(drumX, drumL, drumW / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#98a4b8'; ctx.fill();
    ctx.strokeStyle = '#d7e0ee'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#6b7688'; ctx.lineWidth = 1.2;           // 滚棱（两条，沿轴）
    for(const dx of [-drumW * 0.22, drumW * 0.22]){
      ctx.beginPath(); ctx.moveTo(drumX + dx, -drumL * 0.84); ctx.lineTo(drumX + dx, drumL * 0.84); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = R * 0.08; // 中缝高光（鼓面反光）
    ctx.beginPath(); ctx.moveTo(drumX, -drumL * 0.88); ctx.lineTo(drumX, drumL * 0.88); ctx.stroke();
    ctx.fillStyle = '#ffd166';                                  // 两头轴头（俯视看到的轴心）
    for(const dy of [-1, 1]){
      ctx.beginPath(); ctx.arc(drumX, dy * drumL, R * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1; ctx.stroke();
    }
  } else if(kind === 'boomerang'){
    // 🪃 「回旋镖」：握把 + 一只 V 形回旋镖（双弯臂朝前举着）；攻击时真正飞出去又飞回来的镖由 drawBoomerangs 负责，这里只是持握的这枚
    ctx.strokeStyle = '#9a6b3a'; ctx.lineWidth = R * 0.16;      // 握把
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * 0.30, 0); ctx.stroke();
    ctx.strokeStyle = '#e8a33d'; ctx.lineWidth = R * 0.28;      // 两臂（橙黄木色）
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(R * 0.30, 0); ctx.lineTo(R * 1.08, -R * 0.46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R * 0.30, 0); ctx.lineTo(R * 1.08,  R * 0.46); ctx.stroke();
    ctx.strokeStyle = '#b9742a'; ctx.lineWidth = R * 0.20;      // 外缘圆润转角（V 的根部）
    ctx.beginPath(); ctx.arc(R * 0.30, 0, R * 0.30, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; // 双臂高光
    ctx.beginPath(); ctx.moveTo(R * 0.34, -R * 0.06); ctx.lineTo(R * 1.0, -R * 0.34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R * 0.34,  R * 0.06); ctx.lineTo(R * 1.0,  R * 0.34); ctx.stroke();
  } else if(kind === 'cardmaster'){
    // 🃏 「卡牌大师」：手中一叠扇开的扑克牌（攻击时真卡由 shootCards 飞出，这里只是持握的一小叠）
    ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = R * 0.14;      // 握把
    ctx.beginPath(); ctx.moveTo(R * 0.06, 0); ctx.lineTo(R * 0.24, 0); ctx.stroke();
    const suits = ['#e0405a', '#222', '#e0405a'];
    for(let i = 0; i < 3; i++){
      const a = (-0.5 + i * 0.5) * 0.85;                       // 三张牌扇形展开
      ctx.save(); ctx.translate(R * 0.28, 0); ctx.rotate(a);
      ctx.fillStyle = '#f7f7fb'; ctx.strokeStyle = '#cdcde0'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(0, -R * 0.30, R * 0.84, R * 0.60); ctx.fill(); ctx.stroke();
      ctx.fillStyle = suits[i];                                  // 花色点缀（中心 + 角标）
      ctx.beginPath(); ctx.arc(R * 0.22, 0, R * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(R * 0.10, -R * 0.18, R * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  } else {
    // 🔫 射手「双管能量手枪」：深色枪身 + 银灰双枪管 + 蓝色弹匣 + 枪口能量点 + 顶部瞄具
    wpnPoly([[R * 0.18, -R * 0.30], [R * 1.02, -R * 0.30], [R * 1.02, R * 0.30], [R * 0.18, R * 0.30]], '#39404f', '#8f9bb3', 1.4);
    ctx.fillStyle = '#b9c3d6';                                  // 双枪管
    ctx.fillRect(R * 1.02, -R * 0.34, R * 0.56, R * 0.20);
    ctx.fillRect(R * 1.02, R * 0.14, R * 0.56, R * 0.20);
    ctx.fillStyle = '#4cf';                                     // 枪口能量点
    ctx.beginPath(); ctx.arc(R * 1.58, -R * 0.24, R * 0.10, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(R * 1.58, R * 0.24, R * 0.10, 0, Math.PI * 2); ctx.fill();
    wpnPoly([[R * 0.42, R * 0.28], [R * 0.66, R * 0.28], [R * 0.60, R * 0.86], [R * 0.34, R * 0.86]], '#2f8ed6', null, 0); // 弹匣
    ctx.fillStyle = 'rgba(120,220,255,.9)';                     // 枪身能量条
    ctx.fillRect(R * 0.34, -R * 0.06, R * 0.50, R * 0.12);
    ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 1.2;           // 顶部瞄具
    ctx.beginPath(); ctx.moveTo(R * 0.82, -R * 0.30); ctx.lineTo(R * 0.82, -R * 0.50); ctx.stroke();
  }
  wpnEnd();
}
// 🐶🃏🥎 角色头部配饰（专属外观标识）：画在身体圆上方，靠形状/剪影区分角色，不依赖身体颜色（2P/3P 换色也能认出）
// 🖼 角色贴图绘制（直接以参考图作为角色外观）：圆形裁切 + cover 缩放；k 越大贴图越大（"宁可大一点"）
function drawCharSprite(p, img, k){
  if(!img || !img.complete || !img.naturalWidth) return;   // 首帧未加载：先保留身体圆
  const iw = img.naturalWidth, ih = img.naturalHeight;
  // contain：最长边对齐 2*r*k，整图完整可见（不放大裁切、不丢细节）
  const s = (p.r * 2 * (k || 1.0)) / Math.max(iw, ih);
  const w = iw * s, h = ih * s, R = Math.max(w, h) / 2;
  const x = p.x, y = p.y;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  ctx.restore();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);       // 圆框描边，贴图边界更清楚
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2; ctx.stroke();
}
function drawHeroCrest(p){
  const x = p.x, y = p.y, R = p.r;
  if(p.isDogmilk){
    // 🐶 野生狗奶：直接贴「野生狗奶」包装图（base64 内嵌），圆形裁切、比身体大一圈
    drawCharSprite(p, SPR_DOGMILK, 1.0);
  } else if(p.isCardmaster){
    // 🃏 礼帽：黑帽筒 + 宽帽檐 + 一条红 band（一眼认出"赌徒/魔术师"）
    ctx.fillStyle = '#2b2b33'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x, y - R * 0.80, R * 0.64, R * 0.18, 0, 0, Math.PI * 2); ctx.fill(); // 帽檐
    ctx.fillRect(x - R * 0.34, y - R * 1.38, R * 0.68, R * 0.62);                                       // 帽筒
    ctx.fillStyle = '#e0405a'; ctx.fillRect(x - R * 0.34, y - R * 0.98, R * 0.68, R * 0.12);            // 红 band
  } else if(p.isKetchup){
    // 🍅 番茄酱之神：绘制角色贴图，圆形裁切并放大一圈
    drawCharSprite(p, SPR_KETCHUP, 1.0);
  }
  // 🪃 回旋镖：不戴帽子（2026-10-20 用户令删掉那顶绿帽），靠手里的 V 形回旋镖 + 粉体色识别
}
// 🔮 魔法师「法杖」（与远程四把同一套 r 倍数画法，随体型/视野等比缩放）：
//    木杆 + 握把金环 + 顶端宝珠（宝珠颜色随本次魔法：火橙红 / 冰蓝 / 土青绿），施法瞬间宝珠变大爆亮 + 外扩法术环
function drawMageWeapon(p, ang, R){
  wpnBegin(p, ang);
  const tipX = R * 2.05;                                        // 杖头（原 2.05r，口径不变）
  ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = R * 0.23;        // 木杆
  ctx.beginPath(); ctx.moveTo(R * 0.30, 0); ctx.lineTo(tipX, 0); ctx.stroke();
  ctx.strokeStyle = '#d8b45a'; ctx.lineWidth = R * 0.14;        // 握把金环
  ctx.beginPath(); ctx.arc(R * 0.95, 0, R * 0.23, 0, Math.PI * 2); ctx.stroke();
  // 🔮 法杖宝珠颜色 = **当前选中的法术**（施法瞬间用本次实放的那个）—— 玩家一眼看出"下一手放什么"
  //    2026-10-08 用户定：🪨 土墙用**土墙本体的棕色**（原先是青绿 #7fe0c8，跟土墙不搭）；
  //    土墙还在冷却里又切到土墙 → 宝珠**变灰**（不看脚下也知道"这一手放不出来"）
  const orbType = (p.mageFx > 0 && p.mageFxType) ? p.mageFxType : (p.mageSpell || 'fire');
  const justEarth = (p.mageFx > 0 && p.mageFxType === 'earth'); // 刚真的立了墙：这一手有效，保持棕色
  const orbCol = orbType === 'fire' ? '#ff7a2e'
               : orbType === 'frost' ? '#9fe4ff'
               : (justEarth || mageSpellReady(p, 'earth')) ? MAGE_SPELL_COL.earth : '#8d8d99';
  const orbR = R * (p.mageFx > 0 ? 0.54 : 0.40);                // 施法瞬间宝珠变大
  ctx.fillStyle = orbCol;
  ctx.beginPath(); ctx.arc(tipX, 0, orbR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.4; ctx.stroke();
  if(p.mageFx > 0){                                             // 外扩一圈法术环
    const k = clamp(p.mageFx / 0.22, 0, 1);
    ctx.strokeStyle = orbCol; ctx.globalAlpha = 0.75 * k; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(tipX, 0, R * 0.71 + (1 - k) * R * 1.15, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  wpnEnd();
}

//    持握角与其它角色一致（制作面板里统一 -0.38rad 右下斜持）；比例以 R 为基准，等比缩放
// 🎻 吟游诗人的鲁特琴（极简：椭圆琴身 + 琴颈 + 三根弦 + 音孔；不加任何配饰）
function drawBardLute(p, ang, R){
  wpnBegin(p, ang);
  const bx = R*0.98;   // 琴身中心（离手心一点）
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = Math.max(1.4, R*0.17); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(R*0.46, 0); ctx.lineTo(bx + R*0.40, 0); ctx.stroke(); // 琴颈
  ctx.save(); ctx.translate(bx, 0); ctx.rotate(-0.45);
  ctx.beginPath(); ctx.ellipse(0, 0, R*0.54, R*0.42, 0, 0, Math.PI*2);
  ctx.fillStyle = '#d9a45b'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.4; ctx.stroke();       // 琴身 + 白描边
  ctx.fillStyle = '#5a3f22'; ctx.beginPath(); ctx.arc(R*0.12, 0, R*0.14, 0, Math.PI*2); ctx.fill(); // 音孔
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1;
  for(let i = -1; i <= 1; i++){                                                     // 三根弦
    ctx.beginPath(); ctx.moveTo(-R*0.48, i*R*0.11); ctx.lineTo(R*0.46, i*R*0.11); ctx.stroke();
  }
  ctx.restore();
  wpnEnd();
}
// ===== ❄️ FROZEN SHELL (冰冻状态提示-魔法师冰霜) =====
// 画在敌人身上：一层半透明冰蓝壳 + 外圈冰环 + 六角冰晶尖刺（转动 = 冰在"结"）
// 与头顶的眩晕星星区分：星星=暴击眩晕，冰壳=被魔法师冻住（定身且无法攻击）
function drawFrozenShell(x, y, r, t, tMax){
  const k = clamp(t / Math.max(0.001, tMax || t), 0, 1); // 剩余比例：越接近解冻越淡
  ctx.save();
  ctx.fillStyle = `rgba(150,225,255,${0.20 + 0.20*k})`;
  ctx.beginPath(); ctx.arc(x, y, r*1.22, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = `rgba(205,245,255,${0.55 + 0.35*k})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r*1.22, 0, Math.PI*2); ctx.stroke();
  ctx.strokeStyle = `rgba(235,252,255,${0.30 + 0.45*k})`; ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  for(let i=0;i<6;i++){
    const a = G.time*0.8 + i*Math.PI/3;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a)*r*1.05, y + Math.sin(a)*r*1.05);
    ctx.lineTo(x + Math.cos(a)*r*1.52, y + Math.sin(a)*r*1.52);
    ctx.stroke();
  }
  ctx.restore();
}
// ===== STUN STAR (眩晕状态提示-头顶旋转星星) =====
function drawStunStars(x, y, r){
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(G.time*6);
  ctx.fillStyle = '#ffd54a';
  ctx.strokeStyle = '#8a6d00';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for(let i=0;i<8;i++){
    const rr = i%2===0 ? r : r*0.45;
    const ang = i/8*Math.PI*2;
    const px = Math.cos(ang)*rr, py = Math.sin(ang)*rr;
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ===== 几何工具 =====
// 线段(x1,y1)-(x2,y2) 与圆(cx,cy,r) 是否相交（用于高速冲撞的扫掠碰撞检测）
function segCircleHit(x1,y1,x2,y2,cx,cy,r){
  const dx=x2-x1, dy=y2-y1;
  const len2 = dx*dx+dy*dy;
  if(len2 === 0) return Math.hypot(x1-cx, y1-cy) < r;
  const t = ((cx-x1)*dx + (cy-y1)*dy)/len2;
  const t2 = Math.max(0, Math.min(1, t));
  const px = x1+dx*t2, py = y1+dy*t2;
  return Math.hypot(px-cx, py-cy) < r;
}
// 射线(x0,y0)方向(dx,dy) 与圆(cx,cy,r) 首个交点的距离；不相交/在后方返回 null（用于激光截断）
function rayCircleHit(x0,y0,dx,dy,cx,cy,r){
  const px = cx-x0, py = cy-y0;
  const proj = px*dx + py*dy;
  if(proj <= 0) return null; // 圆在射线后方
  const perp2 = px*px + py*py - proj*proj;
  if(perp2 >= r*r) return null;
  return proj - Math.sqrt(r*r - perp2);
}
// 护盾球命中检测：点(x,y)半径r 是否碰到任一存活玩家的盾球（盾球在玩家周围45px环绕、半径16）
// 命中返回 {x,y,owner}（owner=盾球所属玩家），未命中/无盾返回 null —— 只有攻击真正碰到盾球才算"抵挡"
function shieldOrbHit(x, y, r){
  const cands = bossHitTargets();
  for(const p of cands){
    if(!p || p.shield <= 0) continue;
    for(let i=0;i<p.shield;i++){
      const a = p.shieldAngle + i*(Math.PI*2/p.shield);
      const sx = p.x + Math.cos(a)*45;
      const sy = p.y + Math.sin(a)*45;
      if(dist({x,y}, {x:sx,y:sy}) < 16 + r) return {x:sx, y:sy, owner:p};
    }
  }
  return null;
}

// ===== CHARGER ENEMY (冲撞怪-粉) =====
// 每1秒冲撞一次：蓄力0.75秒(方向提示) → 冲刺(无敌, 速度1440=原480×3, 拖尾特效)
// 撞到玩家：20伤害+眩晕1秒，怪急停(不眩晕)；没撞到则不停下，冲到底，撞墙才自晕0.5秒
// 体型 r=18：介于普通怪(15)和坦克怪(22)之间
class ChargerEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 25*hpScale, 110, 15, 18, '#f5a');
    this.chargeCD = rand(0.5, 1.0); // 首次冲撞错开时间
    this.state = 'chase';   // chase | windup | charge | stop | stun
    this.stateTimer = 0;
    this.chargeDir = {x:0, y:0};
    this.chargedHit = false; // 每轮冲撞只对玩家造成一次伤害
    this.isCharger = true;
  }
  takeDamage(d, color, isCrit, srcSeat){
    if(this.state === 'charge') return; // 冲撞时无敌
    super.takeDamage(d, color, isCrit, srcSeat); // 透传伤害来源座位（护盾减免判定用）
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.aggroT > 0) this.aggroT -= dt; // 🪖 仇恨倒计时
    if(this.flash>0) this.flash -= dt;
    // 击退（蓄力/冲刺中同样生效：护盾可以把冲撞中的怪弹开、打断轨迹）
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 暴击眩晕：定身；若晕在冲撞/蓄力中，晕醒后回到追猎（打断冲锋轨迹）
    if(this.stun > 0){
      this.stun -= dt;
      this.state = 'chase';
      this.invincible = false;
      return;
    }
    // 冲撞时无敌（玩家子弹直接穿过）
    this.invincible = (this.state === 'charge');
    if(this.state === 'chase'){
      // 追踪玩家（双人：锁定最近存活目标，蓄力方向也锁定该目标）
      const P = targetOf(this);
      const a = angleTo(this, P);
      this.x += Math.cos(a)*this.speed*dt;
      this.y += Math.sin(a)*this.speed*dt;
      // 触摸伤害（撞击免疫期间无效；近战怪贴边推玩家+命中击退；双人：碰到谁谁掉血）
      if(this.dmg>0){
        if(P && P.isMinion){
          // 🪖 仇恨在身：贴身咬小兵
          if(this.touchCD<=0 && dist(this, P) < this.r + P.r){
            P.takeDamage(this.dmg, this); this.touchCD = 0.5;
          }
        } else {
        const cands = G.players.filter(q => !q.dead && q.stunImmune<=0);
        for(const Q of cands){
          const d = Q ? dist(this, Q) : 9999;
          if(Q && d < this.r+Q.r){
            let nx, ny;
            if(d > 0.001){ nx = (Q.x-this.x)/d; ny = (Q.y-this.y)/d; }
            else { nx = 1; ny = 0; } // 完全重合兜底
            Q.x = clamp(this.x + nx*(this.r+Q.r), Q.r, WW()-Q.r); // 玩家被顶到边缘
            Q.y = clamp(this.y + ny*(this.r+Q.r), Q.r, WH()-Q.r);
            if(this.touchCD<=0){
              Q.takeDamage(this.dmg, this); this.touchCD = 0.5;
              Q.kbx = nx*320; Q.kby = ny*320; // 命中击退冲量
            }
            break;
          }
        }
        }
      }
      this.chargeCD -= dt;
      if(this.chargeCD <= 0){
        // 开始蓄力：锁定冲刺方向
        SND.charge();
        this.state = 'windup';
        this.stateTimer = 0.75;
        this.chargedHit = false; // 新一轮冲撞重置伤害标记
        const a2 = angleTo(this, P);
        this.chargeDir = {x:Math.cos(a2), y:Math.sin(a2)};
      }
    } else if(this.state === 'windup'){
      this.stateTimer -= dt;
      if(this.stateTimer <= 0){
        this.state = 'charge';
        spawnParticles(this.x, this.y, '#f5a', 6);
      }
    } else if(this.state === 'charge'){
      // 冲刺：速度1440（原480×3），扫掠检测保证高速下不穿模（双人：路径上的所有玩家都会被撞/被盾挡）
      const T = targetOf(this); // 主目标（冲刺方向），路径上的其他玩家同样会被波及
      const nx = this.x + this.chargeDir.x * 1440 * dt;
      const ny = this.y + this.chargeDir.y * 1440 * dt;
      const cands = bossHitTargets();
      let sh = null, shOwner = null, hitAny = false;
      for(const Q of cands){
        if(!Q) continue;
        const qproj = (Q.x - this.x)*this.chargeDir.x + (Q.y - this.y)*this.chargeDir.y;
        // 先检测冲撞路径是否撞到该玩家的护盾球（且盾球比玩家更先被路径经过，才算抵挡）
        let qsh = null;
        if(Q.shield > 0 && !this.chargedHit && qproj > 0){
          for(let i=0;i<Q.shield;i++){
            const a = Q.shieldAngle + i*(Math.PI*2/Q.shield);
            const shx = Q.x + Math.cos(a)*45;
            const shy = Q.y + Math.sin(a)*45;
            const sproj = (shx - this.x)*this.chargeDir.x + (shy - this.y)*this.chargeDir.y;
            if(sproj < qproj && segCircleHit(this.x, this.y, nx, ny, shx, shy, 16)){ qsh = {x:shx,y:shy}; break; }
          }
        }
        if(qsh){ sh = qsh; shOwner = Q; break; } // 盾球挡下冲撞：反弹
        if(!this.chargedHit && Q.stunImmune <= 0 && segCircleHit(this.x, this.y, nx, ny, Q.x, Q.y, Q.r)){
          // 撞到玩家（没被盾挡住）：20伤害 + 眩晕1秒 + 沿冲撞方向撞飞
          // ⚙️ 战车免疫控制：伤害照吃（记在装甲上），但**眩晕与撞飞都不生效**
          hitAny = true;
          Q.takeDamage(20, this);
          if(!Q.veh){
            Q.stun = 1;
            Q.stunImmune = 1; // 被撞晕后免疫一切撞击1秒
            Q.kbx = this.chargeDir.x*560; Q.kby = this.chargeDir.y*560; // 冲撞击退（眩晕中同样位移）
          } else Q.stunImmune = 1; // 车内同样给免疫：免得刚炸车就被连着撞
          spawnParticles(this.x, this.y, '#ff5', 10);
        }
      }
      if(sh){
        // 冲撞撞上盾球：玩家不受伤不眩晕，冲撞怪被反弹
        this.chargedHit = true;
        SND.shieldBlock();
        shOwner.shieldFlash = 0.25;
        spawnParticles(sh.x, sh.y, '#8ff', 12);
        this.state = 'stop'; this.stateTimer = 0.6;
        this.kbx = -this.chargeDir.x * 900; // 反向弹飞（stop状态会应用击退）
        this.kby = -this.chargeDir.y * 900;
      } else if(hitAny){
        // 怪急停（不眩晕，无提示），短暂停留后重新追猎
        this.chargedHit = true;
        this.state = 'stop'; this.stateTimer = 0.5;
      }
      // 没撞到玩家：不停下，继续冲到底
      if(this.state === 'charge'){
        this.x = nx; this.y = ny;
        // 冲刺拖尾特效
        if(Math.random() < 0.6) spawnParticles(this.x, this.y, '#f9c', 1);
        // 撞到屏幕边缘：自晕0.5秒
        if(this.x < this.r || this.x > WW()-this.r || this.y < this.r || this.y > WH()-this.r){ // 👁️按扩大后世界判边
          this.state = 'stun'; this.stateTimer = 0.5;
          spawnParticles(this.x, this.y, '#f5a', 6);
        }
      }
    } else if(this.state === 'stop'){
      // 撞到玩家后的急停（非眩晕：无星星提示），0.5秒后重新追猎
      this.stateTimer -= dt;
      if(this.stateTimer <= 0){
        this.state = 'chase';
        this.chargeCD = 1; // 1秒冷却后再次冲撞
      }
    } else if(this.state === 'stun'){
      this.stateTimer -= dt;
      if(this.stateTimer <= 0){
        this.state = 'chase';
        this.chargeCD = 1; // 1秒冷却后再次冲撞
      }
    }
  }
  draw(){
    // 蓄力方向提示（随蓄力进度变亮变粗）
    if(this.state === 'windup'){
      const prog = 1 - this.stateTimer/0.75;
      const a = Math.atan2(this.chargeDir.y, this.chargeDir.x);
      ctx.strokeStyle = `rgba(255,120,190,${0.35 + prog*0.55})`;
      ctx.lineWidth = 3 + prog*4;
      ctx.setLineDash([8,6]);
      ctx.beginPath(); ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(a)*(this.r+40+prog*20), this.y + Math.sin(a)*(this.r+40+prog*20));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    super.draw();
    // 自晕提示
    if(this.state === 'stun'){
      drawStunStars(this.x, this.y - this.r - 12, 8);
    }
  }
}

// ===== LASER ENEMY (激光怪-黄) =====
// 持续发射激光：在玩家方向±20°内以20°/秒来回扫射，DPS 15（绕过无敌帧直接扣血）
// 光束碰到墙壁/玩家/其他怪时停止延伸（取最近交点截断）
class LaserEnemy extends Enemy {
  constructor(x,y,hpScale){
    super(x, y, 20*hpScale, 80, 0, 14, '#fd0'); // dmg=0 无近战
    this.isLaser = true;
    this.laserW = 9;    // 激光半径
    this.beamAngle = 0; // 当前激光角度
    this.beamLen = 0;   // 当前光束长度（到最近阻挡物的距离）
    this.sweepDir = 1;  // 扫射方向 ±1
  }
  update(dt){
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.flash>0) this.flash -= dt;
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // 暴击眩晕：定身（激光停扫）
    if(this.stun > 0){ this.stun -= dt; return; }
    // 追踪玩家：保持中距离（240~300），防止贴近后方向角 0°/180° 跳变导致扫射基准混乱
    const P = targetOf(this);
    const base = angleTo(this, P);
    const pd = dist(this, P);
    if(pd > 300){
      this.x += Math.cos(base)*this.speed*dt;
      this.y += Math.sin(base)*this.speed*dt;
    } else if(pd < 240){
      this.x -= Math.cos(base)*this.speed*dt;
      this.y -= Math.sin(base)*this.speed*dt;
    }
    // 扫射：激光在 base±20° 之间来回摆动，速度 13.3°/秒（原20°/秒的三分之二，削弱）
    const SWEEP = Math.PI/9; // 20°
    const SPD = Math.PI*2/27; // 13.3°/秒 = (20°/s)×2/3
    this.beamAngle += this.sweepDir * SPD * dt;
    let off = this.beamAngle - base;
    off = Math.atan2(Math.sin(off), Math.cos(off)); // 归一化到(-π,π]
    if(off > SWEEP){ this.beamAngle = base + SWEEP; this.sweepDir = -1; }
    else if(off < -SWEEP){ this.beamAngle = base - SWEEP; this.sweepDir = 1; }
    // 计算光束终点：墙/玩家/其他怪中最近的一个（碰到就停止延伸；双人：任一玩家都能挡/挨光束）
    const dx = Math.cos(this.beamAngle), dy = Math.sin(this.beamAngle);
    let len = Infinity;
    if(dx > 1e-6) len = Math.min(len, (WW()-this.x)/dx); // 右墙（👁️按扩大后世界）
    if(dx < -1e-6) len = Math.min(len, (-this.x)/dx);  // 左墙
    if(dy > 1e-6) len = Math.min(len, (WH()-this.y)/dy);  // 下墙
    if(dy < -1e-6) len = Math.min(len, (-this.y)/dy);  // 上墙
    const beamCands = bossHitTargets();
    const tps = new Map(); // 每个玩家的光路交点
    for(const Q of beamCands){
      if(!Q) continue;
      const tq = rayCircleHit(this.x, this.y, dx, dy, Q.x, Q.y, Q.r + this.laserW*visionZoom()); // 👁️激光判定宽度等比缩小
      tps.set(Q, tq);
      if(tq !== null) len = Math.min(len, tq);
    }
    // 其他怪也挡激光（不含自己、不含弹幕）
    for(const e of G.enemies){
      if(e.dead || e === this || e.isBullet) continue;
      const t2 = rayCircleHit(this.x, this.y, dx, dy, e.x, e.y, e.r + this.laserW*visionZoom());
      if(t2 !== null) len = Math.min(len, t2);
    }
    this.beamLen = len;
    // 逐玩家结算：护盾球挡激光（光束必须先被盾球截住才算抵挡），否则掉血
    for(const Q of beamCands){
      if(!Q) continue;
      const tp = tps.get(Q);
      let shT = null, shPos = null;
      if(Q.shield > 0){
        for(let i=0;i<Q.shield;i++){
          const a = Q.shieldAngle + i*(Math.PI*2/Q.shield);
          const shx = Q.x + Math.cos(a)*45;
          const shy = Q.y + Math.sin(a)*45;
          const t2 = rayCircleHit(this.x, this.y, dx, dy, shx, shy, 16 + this.laserW*visionZoom());
          if(t2 !== null && (shT === null || t2 < shT)){ shT = t2; shPos = {x:shx,y:shy}; }
        }
      }
      if(shT !== null && (tp === null || shT < tp) && shT <= len){
        // 光束被盾球挡住：在盾球处截断熄灭（终点火花），玩家不掉血
        this.beamLen = Math.min(this.beamLen, Math.max(0, shT - 50));
        Q.shieldFlash = 0.1;
        SND.shieldBlock(); // 内部90ms节流，激光持续也只会间歇发声
        if(shPos) spawnParticles(shPos.x, shPos.y, '#8ff', 4);
      } else if(tp !== null && tp <= len && !vampBlocked(Q, this)){
        Q.hp -= 8 * dt; // DPS 8（与粘液互换），绕过 invuln
        Q.dotFlash = 0.15;
        if(Q.hp <= 0){ Q.hp = 0; if(G.coop) coopPlayerDie(Q); else gameOver(); }
      }
    }
  }
  // 激光光束（在渲染时画到玩家上层，保证完整可见）
  drawBeam(){
    const a = this.beamAngle;
    const len = isFinite(this.beamLen) ? this.beamLen : 1500;
    const ex = this.x + Math.cos(a)*len;
    const ey = this.y + Math.sin(a)*len;
    const pulse = 1 + Math.sin(G.time*20)*0.1;
    const lwv = visionZoom(); // 👁️视野扩大：光束绘制宽度与判定宽度同步缩放
    // 外圈光晕
    ctx.strokeStyle = `rgba(255,210,40,${0.3*pulse})`;
    ctx.lineWidth = 26*lwv;
    ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
    // 内核
    ctx.strokeStyle = 'rgba(255,255,210,.95)';
    ctx.lineWidth = 7*lwv;
    ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
    // 光束终点火花（碰到东西时）
    if(isFinite(this.beamLen)){
      ctx.fillStyle = `rgba(255,230,120,${0.5+0.3*Math.sin(G.time*20)})`;
      ctx.beginPath(); ctx.arc(ex, ey, 5*lwv, 0, Math.PI*2); ctx.fill();
    }
  }
  draw(){
    super.draw();
  }
}
// 圆形水洼：玩家踩上减速50%+持续伤害。默认绿色粘液（5秒）；可传 opts 变体：
//   {magma:true, life:3.5} → 熔岩洼（Boss2 狂暴专属，橙红配色，机制与粘液完全一致）
class Slime {
  constructor(x,y,r,opts){
    r *= visionZoom(); // 👁️视野扩大：粘液水洼范围随视野缩放等比缩小
    this.x=x;this.y=y;this.r=r;
    opts = opts || {};
    this.life = opts.life || 5; this.max = this.life;
    this.dead=false;
    this.dps = opts.dps || 15; // 与激光互换：需玩家踩中才生效，伤害应更高
    this.magma = !!opts.magma; // 熔岩洼标记（配色用，判定与粘液相同）
    this.body = this.magma ? '255,120,20' : '80,220,80';   // 填充 rgb
    this.edge = this.magma ? '255,190,80' : '140,255,140'; // 描边 rgb
  }
  update(dt){
    this.life -= dt;
    if(this.life<=0){ this.dead=true; return; }
    // 双人：任意存活玩家踩上都生效
    const cands = bossHitTargets();
    for(const P of cands){
      if(!P) continue;
      if(dist(this, P) < this.r){
        P.slowed = true;
        P.hp -= this.dps * dt;
        P.dotFlash = 0.15;
        if(P.hp <= 0){ P.hp = 0; if(G.coop) coopPlayerDie(P); else gameOver(); }
      }
    }
  }
  draw(){
    const t = this.life/this.max;
    const pulse = 1 + Math.sin(G.time*3)*0.06;
    const r = this.r * pulse;
    ctx.fillStyle = `rgba(${this.body},${0.3*t})`;
    ctx.beginPath(); ctx.arc(this.x,this.y,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(${this.edge},${0.65*t})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(this.x,this.y,r,0,Math.PI*2); ctx.stroke();
  }
}

// ===== ENEMY BULLET (共享弹幕工厂) =====
function fireEnemyBullet(x,y,vx,vy,r,dmg,color,owner){
  SND.enemyShoot();
  G.enemies.push({
    isBullet:true, x, y, vx, vy, r:r||6,
    hp:999, maxHp:999, dead:false, flash:0, dmg: Math.round(dmg * enemyDmgMul()),
    color:color||'#f6c', touchCD:0, speed:0, kbx:0, kby:0, owner: owner || null, // 🩸 owner=谁射的（吸血鬼血线豁免判定用）
    update(dt){
      this.x += this.vx*dt; this.y += this.vy*dt;
      if(this.x<-20||this.x>WW()+20||this.y<-20||this.y>WH()+20) this.dead=true; // 👁️视野扩大：弹幕出界按扩大后世界
      const sh = shieldOrbHit(this.x, this.y, this.r); // 弹幕必须碰到盾球才被抵挡（判定半径=绘制世界半径）
      if(sh){ // 弹幕撞上盾球：在盾球处消失+特效音效，玩家不受伤
        this.dead = true;
        SND.shieldBlock();
        sh.owner.shieldFlash = 0.15; // 谁的盾球挡的闪谁的
        spawnParticles(sh.x, sh.y, '#8ff', 8);
        return;
      }
      if(this.touchCD>0) this.touchCD -= dt;
      // 双人：检查所有存活玩家，谁被撞谁掉血
      const cands = bossHitTargets();
      for(const P of cands){
        if(!P) continue;
        if(this.touchCD<=0 && dist(this,P) < this.r + P.r){ // 弹幕命中=绘制世界半径（不再乘视野缩放，避免"看着没碰到却掉血"）
          P.takeDamage(this.dmg, this); this.touchCD=0.5;
          break;
        }
      }
    },
    draw(){
      ctx.fillStyle=this.color;
      ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
    },
    takeDamage(){},
  });
}

// ===== EXP GEM =====
class ExpGem {
  constructor(x,y,val,color,r,isBoss){
    this.x=x;this.y=y;this.val=val;
    this.r=r||7; // 普通宝石7，Boss宝石翻倍14
    this.color=color||'#0f8'; // 普通宝石绿色，Boss宝石=Boss身体颜色
    this.isBoss = !!isBoss;
    this.life=30;this.dead=false;
    this.vx=rand(-50,50); this.vy=rand(-50,50);
    this.magnet=false;
  }
  update(dt){
    this.life -= dt;
    if(this.life<=0){ this.dead=true; return; }
    // 双人：磁吸/拾取对最近存活玩家生效（经验归拾取者本人）
    let cands = bossHitTargets().filter(Boolean);
    if(this._tutOwner !== undefined && G.players[this._tutOwner]) cands = [G.players[this._tutOwner]]; // 教程专属：宝石只归指定玩家（2P 练习宝石 1P 捡不到）
    // ⚖️ AI 让经验：让经验中的 AI 从候选里摘掉 → 宝石只认真人玩家（玩家自己走近才磁吸，AI 路过也拿不走）
    //    多人通用：三人模式下可能同时有 AI 在让，逐个过滤
    if(this.life > XP_YIELD_GRACE){
      cands = cands.filter(P => !aiYielding(P));
    }
    let nearest = null, nd = Infinity;
    for(const P of cands){
      if(!P) continue;
      const d = dist(this, P);
      if(d < nd){ nd = d; nearest = P; }
    }
    if(!nearest) return;
    const d = nd;
    if(d < nearest.magnetRange * magnetEffMul(nearest)) this.magnet = true; // 磁吸=拾取距离×倍率；磁力失效时靠学拾取距离逐级恢复
    const ox = this.x, oy = this.y; // 本帧移动前的位置（拾取判定要看"这一帧走过的那条线"）
    if(this.magnet){
      const a = angleTo(this, nearest);
      const spd = gemFollowSpd(nearest); // 🧲 跟随速度随玩家移速走：玩家越快，宝石追得越急（永远追得上）
      this.vx = lerp(this.vx, Math.cos(a)*spd, 0.2);
      this.vy = lerp(this.vy, Math.sin(a)*spd, 0.2);
    } else {
      this.vx *= 0.92; this.vy *= 0.92;
    }
    this.x += this.vx*dt; this.y += this.vy*dt;
    // 🧲 拾取判定 = 本帧线段到玩家的最近距离（不是轨迹终点）：
    //    跟随速度可能很高（高速角色），一帧就跨过玩家 —— 用线段判定才不会"穿过去却吃不到"
    const npt = segNearest(nearest.x, nearest.y, ox, oy, this.x, this.y);
    if(Math.hypot(npt.x - nearest.x, npt.y - nearest.y) < nearest.r + this.r){
      if(this.isBoss) SND.bossGem(); else SND.gem(); // Boss宝石专属音效
      const v = this.xpNextMul ? Math.max(1, Math.floor(nearest.xpNext * this.xpNextMul)) : this.val;
      nearest.gainXP(v);
      this.dead = true;
    }
  }
  draw(){
    const pulse = 1 + Math.sin(G.time*8)*0.15;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y-this.r*pulse);
    ctx.lineTo(this.x+this.r*pulse, this.y);
    ctx.lineTo(this.x, this.y+this.r*pulse);
    ctx.lineTo(this.x-this.r*pulse, this.y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
  }
}

// ===== PARTICLES =====
function spawnParticles(x,y,color,n){
  for(let i=0;i<n;i++){
    const a = rand(0, Math.PI*2);
    const s = rand(50, 200);
    G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(0.3,0.8),max:0.8,color,r:rand(2,4)});
  }
}

// ===== EFFECTS (explosions, etc) =====
function spawnExplosion(x,y,r,dmg,srcSeat){ // srcSeat：伤害来源座位（护盾减免判定用；缺省按近战处理）
  r *= visionZoom(); // 👁️视野扩大：范围伤害判定与特效等比缩小（视觉=判定，始终一致）
  SND.boom();
  G.effects.push({type:'boom',x,y,r,maxR:r,life:0.55,max:0.55,dmg,done:false});
  G.enemies.forEach(e=>{
    if(e.dead) return;
    if(dist({x,y},e) < r+e.r) e.takeDamage(dmg, '#f80', false, srcSeat);
  });
  pvpHitPlayers(srcSeat, x, y, r, dmg, '#f80'); // ⚔️ 对战：爆炸同样炸到对手玩家
}

// ===== 💣 轰炸区（爆破角色的主动技能）=====
// 持续期间每 every 秒在区域内随机撒一发炮弹：先给 warn 秒「落点预警」（闪烁收缩圈），到点才爆炸结算；
// 判定半径走 spawnExplosion 同一口径（乘视野缩放），击杀归属记在投放者座位上（挑战模式吸血/双人结算）
function updateBombZones(dt){
  const zs = G.bombZones;
  if(!zs || !zs.length) return;
  for(const z of zs){
    z.life -= dt;
    if(z.life > 0){
      z.next -= dt;
      if(z.next <= 0){
        z.next = z.every;
        const a = rand(0, Math.PI*2), rr = Math.sqrt(Math.random()) * z.r * 0.8; // sqrt → 撒点面积均匀（不是挤在圆心）
        z.bombs.push({ x: z.x + Math.cos(a)*rr, y: z.y + Math.sin(a)*rr, t: z.warn, max: z.warn });
      }
    }
    const newborn = []; // ✳️ 集束弹散出的小弹：先收集，循环结束后再并入（避免边遍历边追加）
    for(const b of z.bombs){
      b.t -= dt;
      if(b.t <= 0 && !b.done){
        b.done = true;
        const sub = !!b.sub; // 小弹：爆炸更小、伤害 40%，不再套娃、不留火海
        bombExplode(b.x, b.y, sub ? z.blast*0.55 : z.blast, sub ? Math.max(1, Math.round(z.dmg*0.4)) : z.dmg, z.seat, z, sub);
        if(z.cluster > 0 && !sub && z.life > 0.3){
          for(let i=0;i<z.cluster;i++){
            const a = rand(0, Math.PI*2), rr = z.blast * rand(0.6, 1.15);
            newborn.push({ x: clamp(b.x + Math.cos(a)*rr, 0, WW()), y: clamp(b.y + Math.sin(a)*rr, 0, WH()),
              t: 0.26, max: 0.26, sub: true });
          }
        }
      }
    }
    if(newborn.length) z.bombs.push(...newborn);
    z.bombs = z.bombs.filter(b => !b.done);
  }
  G.bombZones = zs.filter(z => z.life > 0);
}
// ===== ⚙️ 工程师「自动炮台」（2026-10-08 第 12 角色 · 放置系核心）=====
// 放置玩法：炮台立在地上**自动索敌开火**（不占玩家操作），代价是数量上限 + 存在时长。
// 口径：① 索敌 = 射程内最近的怪；⚔️ 对战模式里改为锁对手玩家（与将军小兵同一套判定）
//       ② 开火 = 发射普通 Bullet（归属工程师座位）→ 命中 / 暴击 / 击杀结算全走既有管线，不另开一套
//       ③ 超上限顶掉最老的一座（防高冷却缩减下把画面铺满）
//       ④ 主人阵亡 → 炮台停火但按寿命自然消失（不做连锁引爆）
const ENG_TURRET_R = 13;                 // 炮台底座半径（绘制与出膛点用）
// 🚜 战车（2026-10-08 用户定的大招形态）：数值全部走常量 —— 车速/车体半径**不吃本体加成**，
//    这样"升级重算速度""技能给张角"之类的既有管线都不会把车改歪（免疫控制也是靠"派生值"而不是存字段）
const VEH_R = 34;            // 车体半径（本体 14 → 34：**体积更大**）
const VEH_HP = 260;          // 战车装甲上限（本体 100 的 2.6 倍；**任何方式都无法恢复**）
const VEH_SPD = 300;         // 车速（本体 235 → 300：**移速更快**）
const VEH_DMG = 15;          // 每根炮管单发伤害
const VEH_RATE = 0.9;        // 每根炮管的开火间隔（两根交错 ≈ 0.45 秒一发）
const VEH_BARREL_LEN = 26;   // 炮口距车心（出膛点）
const VEH_BARREL_OFF = 11;   // 两根炮管各偏车轴 ±11px
const VEH_SPOT_MAX = 220;    // 工地离玩家最远距离（上车是"走过去"，不是瞬移半张地图）
const VEH_CD = 60;           // 大招冷却（**从战车被破坏那一刻**起算，固定 60 秒）
function engTurretCount(seat){ return ((G.turrets || []).filter(t => t.seat === seat && t.life > 0)).length; }
function engSpawnTurret(P, x, y){
  if(!G.turrets) G.turrets = [];
  x = clamp(x, 26, Math.max(26, WW() - 26));
  y = clamp(y, 26, Math.max(26, WH() - 26));
  if(G.turrets.length >= Math.max(1, P.engMax | 0)) G.turrets.shift(); // 上限：顶掉最老的一座
  G.turrets.push({ seat: P.seat, x, y, ang: -Math.PI/2, cd: 0.22, scan: 0, firing: 0,
    life: P.engLife, max: P.engLife, dmg: P.engDmg, rate: P.engRate, range: P.engRange });
  P.engBuilt = (P.engBuilt || 0) + 1;
  spawnParticles(x, y, '#ffb347', 7);
  SND.charge();
}
function updateTurrets(dt){
  const list = G.turrets;
  if(!list || !list.length) return;
  for(const t of list){
    t.life -= dt;
    if(t.firing > 0) t.firing -= dt;
    if(t.life <= 0) continue;
    const P = (G.players || []).find(q => q && q.seat === t.seat);
    if(!P || P.dead || G.state !== 'playing') continue; // 主人阵亡 / 非对局中：停火，但仍按寿命自然消亡
    // 技能升级**立即**作用到已立起来的炮台（换塔太麻烦，直接生效手感更好）
    t.dmg = P.engDmg; t.rate = P.engRate; t.range = P.engRange;
    // 🔍 索敌：射程内最近的怪；⚔️ 对战模式里改锁对手玩家（场上没怪时才轮到玩家 —— 同将军小兵）
    let tgt = null, best = 1e9;
    const pvpFoes = G.pvp ? (G.players || []).filter(q => q && !q.dead && q.seat !== t.seat) : null;
    for(const e of (pvpFoes || G.enemies || [])){
      if(!e || e.dead || e.dying || e.isBullet || e.invincible) continue;
      const d = dist(t, e) - (e.r || 0);
      if(d < best && d <= t.range){ best = d; tgt = e; }
    }
    if(!tgt){ t.scan += dt; continue; }                  // 没目标：炮管慢慢扫视
    t.ang = angleTo(t, tgt);
    t.cd -= dt;
    if(t.cd <= 0){
      t.cd = Math.max(0.18, t.rate);
      t.firing = 0.12;
      const spd = 560, dmg = Math.max(1, Math.round(t.dmg * pCM(P).dmgMul)); // 挑战模式伤害修正
      G.bullets.push(new Bullet(t.x + Math.cos(t.ang)*ENG_TURRET_R, t.y + Math.sin(t.ang)*ENG_TURRET_R,
        Math.cos(t.ang)*spd, Math.sin(t.ang)*spd, dmg, 5, 0, 0, 0, t.seat, P.skills.crit || 0, null));
      if(!G._engSndT || G.time - G._engSndT > 0.16){ G._engSndT = G.time; SND.aTurret(); } // 🎭 炮台机械炮声（多塔齐射时节流，免得连响吵）
    }
  }
  G.turrets = list.filter(t => t.life > 0);
}
// z = 所属轰炸区（带上技能开关：💫震荡弹 / 🔥燃烧弹）；isSub = 集束弹散出的小弹（不留火海）
function bombExplode(x, y, r, dmg, seat, z, isSub){
  const worldR = r;      // 世界半径（火海/视觉用，不缩）
  r *= visionZoom();     // 👁️视野扩大：范围伤害判定与特效等比缩小（与 spawnExplosion 同口径）
  SND.boom();
  G.effects.push({ type:'boom', x, y, r, maxR:r, life:0.55, max:0.55, dmg:0, done:true });
  G.enemies.forEach(e => {
    if(e.dead || e.dying || e.invincible) return; // 冲撞怪冲锋无敌期间炸不动（与子弹口径一致）
    if(dist({x,y}, e) < r + e.r){
      e.takeDamage(dmg, '#f80', false, seat);
      e.lastHitIdx = seat; // 击杀归属：投放者
      if(z && z.stun > 0 && !e.isBoss) e.stun = Math.max(e.stun || 0, z.stun); // 💫 震荡弹（Boss 免疫）
    }
  });
  pvpHitPlayers(seat, x, y, r, dmg, '#f80'); // ⚔️ 对战：轰炸区的爆炸同样伤到对手玩家
  if(z && z.burn > 0 && !isSub){ // 🔥 燃烧弹：主弹落地留下火海（小弹不铺火，免得满地火）
    G.effects.push({ type:'firepool', x, y, r: worldR * 0.75 * visionZoom(),
      life: 2.5, max: 2.5, tick: 0.5, next: 0.5, dmg: z.burn, seat });
  }
}

// ===== 🧪 毒液领域（毒液角色的核心机制）=====
// 每射满 5 发子弹的那一发是「毒液弹」，命中敌人或飞出场地时在落点留下一个小型毒液领域。
// 领域期间每 tick 秒对圈内敌人结算一次毒伤（firepool 同口径），并把圈内敌人减速（venomSlowMul，每跳刷新）。
// 半径：世界半径 × visionZoom（与炮弹/火海同口径，👁️视野扩大时视觉与判定一起缩）；
// 同屏上限 MAX_VENOM_POOLS 滩，超了顶掉最早的一滩（多重射击 + 高射速下防铺满全场）。
// ═══════════ 🪨 魔法师 · 土墙掩体（挡弹幕 / 顶怪 / 次数耗尽塌下）═══════════
// 实体是一条"线段墙"：中点 (x,y)、朝向 ang（= 立墙那一刻的瞄准方向）、半长 halfLen、厚度 thick
// 墙的方向垂直于 ang —— 正好横在「玩家 → 敌人」这条连线上，替玩家吃伤害
// ⚠️ 耐久口径（2026-10-06 用户定）：**算次数不算血量** —— 每次抵挡（一发弹幕 / 怪挤一次）消耗 1 次，
//    与伤害数值无关。基础 10 次（磐石护盾 10→15/20/25）。
const WALL_LEN = 100;      // 墙长（半长 50）
const WALL_THICK = 20;     // 墙厚（判定与绘制同一个世界口径）
const WALL_BORN_T = 0.32;  // 出土动画时长
const WALL_FALL_T = 0.6;   // 塌下动画时长（次数耗尽后）
const WALL_HURT_CD = 0.5;  // 怪顶墙的扣次数节流间隔（秒）
// 取某玩家当前立着的墙（塌下中的不算）
function wallOf(p){
  if(!p || !G.walls) return null;
  return G.walls.find(w => w.seat === p.seat && !w.dead && w.fall <= 0) || null;
}
// 墙的两个端点（线段方向 = 瞄准方向转 90°）
function wallSeg(w){
  const px = Math.cos(w.ang + Math.PI/2), py = Math.sin(w.ang + Math.PI/2);
  return [ w.x - px*w.halfLen, w.y - py*w.halfLen, w.x + px*w.halfLen, w.y + py*w.halfLen ];
}
// 点到线段的最近点（推怪用：ptSegDist 只给距离，这里要落点）
function segNearest(px, py, x1, y1, x2, y2){
  const dx = x2 - x1, dy = y2 - y1, L2 = dx*dx + dy*dy;
  let t = L2 > 0 ? ((px - x1)*dx + (py - y1)*dy) / L2 : 0;
  t = clamp(t, 0, 1);
  return { x: x1 + dx*t, y: y1 + dy*t };
}
// 🪨 攻击线 (ax,ay)→(bx,by) 是否被某堵墙 w 挡在中间（墙身有限，落在半长范围内才算挡住）
//   · 用于「土墙挡近战 / 挡对手本身」：对手站在墙外挥砍 / 冲撞，墙身挡在攻防双方之间则这记攻击被墙挡下
function wallBlocksBetween(w, ax, ay, bx, by){
  if(!w || w.fall > 0 || w.dead) return false;
  const nx = Math.cos(w.ang), ny = Math.sin(w.ang);   // 墙法线 = 立墙时的瞄准方向
  const tx = -ny, ty = nx;                             // 墙身方向（垂直于法线）
  const dA = (ax - w.x)*nx + (ay - w.y)*ny;
  const dB = (bx - w.x)*nx + (by - w.y)*ny;
  if(dA * dB > 0) return false;                        // 攻防双方在墙同侧：墙不在中间
  const denom = (dA - dB);
  const t = (Math.abs(dA) + Math.abs(dB) < 1e-6) ? 0 : dA / denom;
  const cx = ax + (bx - ax)*t, cy = ay + (by - ay)*t;  // 攻击线与墙所在平面的交点
  const off = (cx - w.x)*tx + (cy - w.y)*ty;            // 交点沿墙身方向离墙中心的偏移
  return Math.abs(off) <= w.halfLen + 1;                // 落在墙身范围内（含 1px 容差）
}
// 墙挨一下：扣 1 次 + 白闪 + 掉土渣；次数耗尽 → 开始塌下（返回 0=没生效 / 1=扣了一次 / 2=塌了）
//   ⚠️ 第二参数起是**命中点坐标**（不再有伤害参数：次数制不看伤害大小）
function hurtWall(w, hx, hy){
  if(!w || w.dead || w.fall > 0 || w.hits <= 0) return 0;
  w.hits = Math.max(0, w.hits - 1);
  w.hitFx = 0.16;
  spawnParticles(hx !== undefined ? hx : w.x, hy !== undefined ? hy : w.y, '#c9a86a', 3);
  if(w.hits <= 0){ w.fall = WALL_FALL_T; spawnParticles(w.x, w.y, '#a8845a', 18); SND.shieldBlock(); return 2; }
  return 1;
}
// 每帧推进：① 拦敌方弹幕 ② 把怪顶在墙外表面 ③ 清理塌完的墙
function updateWalls(dt){
  if(!G.walls){ G.walls = []; return; }
  for(const w of G.walls){
    if(w.hitFx > 0) w.hitFx -= dt;
    if(w.hurtCd > 0) w.hurtCd -= dt;
    if(w.born > 0) w.born -= dt;
    // 塌下过程中不再阻挡任何东西；计时走完 → 标记 dead 交给末尾的 filter 移除
    // （踩过的坑：早期写成 `fall -= dt` 后判定 `fall <= 0`，负数会被 wallOf 当成"活墙"复活）
    if(w.fall > 0){
      w.fall -= dt;
      if(w.fall <= 0){ w.fall = 0; w.dead = true; }
      continue;
    }
    const seg = wallSeg(w);
    const x1 = seg[0], y1 = seg[1], x2 = seg[2], y2 = seg[3];
    const nx = Math.cos(w.ang), ny = Math.sin(w.ang); // 墙法线 = 立墙时的瞄准方向
    // ① 敌方弹幕：撞墙即碎（每发消耗墙 1 次）
    for(const e of G.enemies){
      if(e.dead || !e.isBullet) continue;
      if(ptSegDist(e.x, e.y, x1, y1, x2, y2) > e.r + w.thick/2) continue;
      e.dead = true;
      hurtWall(w, e.x, e.y);
    }
    // ①b ⚔️ 对战：对手打过来的子弹同样被拦下（自己的子弹穿墙）
    if(G.pvp){
      for(const b of G.bullets){
        if(b.dead || (b.ownerIdx || 0) === w.seat) continue;
        if(ptSegDist(b.x, b.y, x1, y1, x2, y2) > b.r + w.thick/2) continue;
        b.dead = true;
        if(b.ketchupPack) b.explodeKetchup(); // 🍅 番茄酱包撞上对手的土墙也当场炸开（碰墙也爆）
        hurtWall(w, b.x, b.y);
      }
    }
    if(w.fall > 0 || w.hits <= 0) continue;
    // ② 怪的伤害：把怪顶到墙外表面（怪一直挤墙 → 每 0.5 秒消耗 1 次）
    for(const e of G.enemies){
      if(e.dead || e.isBullet || e.invincible) continue;
      const np = segNearest(e.x, e.y, x1, y1, x2, y2);
      let dx = e.x - np.x, dy = e.y - np.y;
      let dd = Math.hypot(dx, dy);
      const need = e.r + w.thick/2; // 墙外表面：怪中心离墙中线 = 怪半径 + 半厚（保证怪碰不到墙后的玩家）
      if(dd >= need) continue;
      if(dd < 0.001){ dx = nx; dy = ny; dd = 1; } // 正好压在墙轴线上：按"墙外侧"处理
      else { dx /= dd; dy /= dd; }
      const s = (dx*nx + dy*ny) >= 0 ? 1 : -1;    // 从哪一侧撞上来，就推回哪一侧
      e.x = np.x + nx*s*need;
      e.y = np.y + ny*s*need;
      if(w.hurtCd <= 0 && (e.dmg || 0) > 0){ w.hurtCd = WALL_HURT_CD; hurtWall(w, np.x, np.y); }
    }
    // ②b ⚔️ 对战：对手玩家同样被顶在墙外表面（2026-08 用户定：土墙也挡玩家）
    //     · 只挡不耗次数：玩家挤墙没有"攻击"结算口径，墙对玩家是纯掩体；怪顶墙照旧每 0.5 秒扣 1 次
    //     · 立墙者自己（含同 seat 的墙）照常穿行 —— 自家掩体随便进出；🚜 战车同样被顶住（实体阻挡≠控制）
    if(G.pvp){
      for(const p of G.players){
        if(!p || p.dead || p.seat === w.seat) continue;
        const np = segNearest(p.x, p.y, x1, y1, x2, y2);
        let dx = p.x - np.x, dy = p.y - np.y;
        let dd = Math.hypot(dx, dy);
        const need = p.r + w.thick/2; // 与怪同一口径：中心离墙中线 = 半径 + 半厚
        if(dd >= need) continue;
        if(dd < 0.001){ dx = nx; dy = ny; dd = 1; }
        else { dx /= dd; dy /= dd; }
        const s = (dx*nx + dy*ny) >= 0 ? 1 : -1; // 从哪侧撞上来就推回哪侧
        p.x = np.x + nx*s*need;
        p.y = np.y + ny*s*need;
      }
    }
  }
  G.walls = G.walls.filter(w => !w.dead); // 塌完（或次数耗尽后已播完塌下动画）的墙彻底移除
}
// ===== 🧹💨 扫帚飞行尾迹（纯视觉，画在最底层：地面层之下、玩家之下） =====
//   光斑：一朵淡紫光点 + 一段沿航线的拉丝（越飞越长），0.42 秒内收缩淡出；
//   火星：从扫帚毛刷端甩出的金色小点，减速飘散。
//   颜色按座位区分（1P 紫罗兰 / 2P 橙 / 3P 绿），2P·3P 魔法师骑扫帚也一眼能认出是谁。
function drawBroomTrail(){
  const trail = G.broomTrail;
  if(!trail || !trail.length) return;
  ctx.save();
  ctx.lineCap = 'round';
  for(const w of trail){
    const k = clamp(w.life / Math.max(0.001, w.max), 0, 1); // 1 → 0（越旧越淡）
    if(w.type === 'wisp'){
      const r = w.r * (0.5 + 0.5 * k);
      const hue = w.hue === undefined ? 268 : w.hue;
      if(w.len > 0){ // 拖在身后的流线
        ctx.strokeStyle = `hsla(${hue},100%,78%,${0.26 * k})`;
        ctx.lineWidth = r * 1.15;
        ctx.beginPath();
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(w.x - Math.cos(w.a) * w.len, w.y - Math.sin(w.a) * w.len);
        ctx.stroke();
      }
      ctx.fillStyle = `hsla(${hue},100%,80%,${0.34 * k})`; // 外圈（虚）
      ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `hsla(${hue},100%,95%,${0.5 * k})`;  // 内芯（亮）
      ctx.beginPath(); ctx.arc(w.x, w.y, r * 0.42, 0, Math.PI*2); ctx.fill();
    } else { // 金火星
      ctx.globalAlpha = 0.9 * k;
      ctx.fillStyle = w.color || '#ffd77a';
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r * (0.35 + 0.65 * k), 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}
// 🔮 魔法师 HUD（画在脚下）：**只留一个土墙冷却圈** —— 2026-10-08 用户定：
//    "有一个土墙冷却圈就够了，把三个技能的标志去掉"（原来三个 🔥❄️🪨 徽标太花）。
//    · 土墙在冷却中（或场上已有自己的墙）→ 一圈土棕进度弧（转满 = 可以立墙）；能放就收起来不占视觉
//    · 切换法术的瞬间脚下闪一圈白光（替代原来的图标切换反馈）
//    · 哑火往上升灰烟；还没切过法术时留一行操作提示小字
function drawMageWheel(p){
  if(!p || !p.isMage || p.dead) return;
  const cx = p.x, cy = p.y + p.r + 18;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // ① 🪨 土墙冷却圈（全游戏唯一常驻的法术 HUD）
  const eFrac = mageSpellFrac(p, 'earth');
  if(eFrac < 1){
    const r0 = 10;
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = MAGE_SPELL_COL.earth;
    ctx.beginPath(); ctx.arc(cx, cy, r0, -Math.PI/2, -Math.PI/2 + Math.PI*2*eFrac); ctx.stroke();
  }
  if(p.mageSwitchFx > 0){                                                // 切到下一个：脚下闪一圈白光
    const k = clamp(p.mageSwitchFx / 0.3, 0, 1);
    ctx.strokeStyle = `rgba(255,255,255,${k*0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 22 + (1 - k) * 22, 0, Math.PI*2); ctx.stroke();
  }
  if(p.mageDryFx > 0){                                                   // 哑火：往上冒几缕灰烟
    const k = clamp(p.mageDryFx / 0.32, 0, 1);
    ctx.fillStyle = `rgba(150,150,160,${0.42*k})`;
    for(let i = 0; i < 3; i++){
      ctx.beginPath();
      ctx.arc(cx + (i - 1) * 5, cy - 8 - (1 - k) * 16 - i * 4, 2.6 - i * 0.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  if(!p.mageSpellUsed){                                                  // 还没切过 → 教一次操作（切过就永久收起）
    ctx.globalAlpha = 0.5 + 0.25 * Math.sin(G.time*3);
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#cfd8ff';
    ctx.fillText('右键 / LB 切换法术', cx, cy + 16);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
// 绘制（地面障碍层：画在玩家之前，站在墙后的角色不会被挡住）
function drawWalls(){
  if(!G.walls || !G.walls.length) return;
  for(const w of G.walls){
    const nx = Math.cos(w.ang), ny = Math.sin(w.ang);
    let k = 1, sink = 0;
    if(w.born > 0) k = clamp(1 - w.born / WALL_BORN_T, 0, 1);  // 出土：从地里长出来
    if(w.fall > 0){ const f = clamp(w.fall / WALL_FALL_T, 0, 1); k *= f; sink = (1 - f) * 24; } // 塌下：矮下去 + 渐隐
    const seg = wallSeg(w);
    const th = Math.max(2, w.thick * k), cap = th / 2;
    ctx.save();
    ctx.globalAlpha = 0.2 + 0.8 * k;
    ctx.lineCap = 'butt';
    // 落地阴影
    ctx.strokeStyle = 'rgba(0,0,0,.26)'; ctx.lineWidth = th + 5;
    ctx.beginPath(); ctx.moveTo(seg[0], seg[1] + 5 + sink); ctx.lineTo(seg[2], seg[3] + 5 + sink); ctx.stroke();
    // 墙体（夯土）
    ctx.strokeStyle = '#a8845a'; ctx.lineWidth = th;
    ctx.beginPath(); ctx.moveTo(seg[0], seg[1] + sink); ctx.lineTo(seg[2], seg[3] + sink); ctx.stroke();
    // 顶面受光
    ctx.strokeStyle = '#dcbb83'; ctx.lineWidth = Math.max(1.5, th*0.2);
    ctx.beginPath(); ctx.moveTo(seg[0], seg[1] + sink - cap*0.55); ctx.lineTo(seg[2], seg[3] + sink - cap*0.55); ctx.stroke();
    // 砖缝（沿墙方向分三段，短横线横跨厚度）
    if(k > 0.5){
      ctx.strokeStyle = 'rgba(88,62,34,.5)'; ctx.lineWidth = Math.max(1, th*0.11);
      for(let i = 1; i <= 3; i++){
        const t = i/4;
        const bx = seg[0] + (seg[2]-seg[0])*t, by = seg[1] + (seg[3]-seg[1])*t + sink;
        ctx.beginPath();
        ctx.moveTo(bx - nx*cap*0.75, by - ny*cap*0.75);
        ctx.lineTo(bx + nx*cap*0.75, by + ny*cap*0.75);
        ctx.stroke();
      }
    }
    // 被击中：白闪
    if(w.hitFx > 0){
      ctx.strokeStyle = `rgba(255,255,255,${clamp(w.hitFx/0.16, 0, 1)*0.85})`;
      ctx.lineWidth = th + 3;
      ctx.beginPath(); ctx.moveTo(seg[0], seg[1] + sink); ctx.lineTo(seg[2], seg[3] + sink); ctx.stroke();
    }
    // 耐久（墙上沿；满次数不显示）：剩余次数 = 条（比例） + 右侧「×N」数字
    if(w.fall <= 0 && w.hits < w.maxHits){
      const f = clamp(w.hits / Math.max(1, w.maxHits), 0, 1);
      const bw = w.halfLen * 1.5, bx = w.x - bw/2, by = w.y - w.thick/2 - 16;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(bx - 1, by - 1, bw + 2, 7);
      ctx.fillStyle = f > 0.5 ? '#d8b45a' : (f > 0.22 ? '#e0a33a' : '#d9534f');
      ctx.fillRect(bx, by, bw * f, 5);
      // 剩余次数（一眼看清还能挡几下）
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffe6a8'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('×' + w.hits, bx + bw + 5, by + 6);
    }
    ctx.restore();
  }
}
const MAX_VENOM_POOLS = 12;
function spawnVenomPool(x, y, spec, seat){
  if(!spec) return;
  if(!G.effects) G.effects = [];
  // 摘掉超额的旧毒圈（从最早的开始删）
  let pools = G.effects.filter(ef => ef.type === 'venompool');
  for(let i = 0; pools.length - i >= MAX_VENOM_POOLS && i < pools.length; i++){
    const idx = G.effects.indexOf(pools[i]);
    if(idx >= 0) G.effects.splice(idx, 1);
  }
  G.effects.push({
    type:'venompool', x, y,
    r: (spec.r || 46) * visionZoom(),
    life: spec.dur || 2.6, max: spec.dur || 2.6,
    tick: spec.tick || 0.4, next: 0.12,
    dmg: Math.max(1, Math.round(spec.dmg || 7)), // 挑战模式修正已在拿出毒液弹时结算
    slow: (spec.slow === undefined ? 0.65 : spec.slow),
    seat,
    seed: Math.random() * 6.283, // 纯视觉：气泡相位随机，多滩毒液不会整齐划一
  });
  SND.hit();
}

// ===== 🌀 龙卷风（龙卷风角色的主动技能）=====
// 生命期内（life>0）= 吸怪阶段：每 tick 秒对风眼范围内敌人结算一次伤害，并把敌人持续拉向风眼；
// life 归零的那一帧 = 收尾：范围内敌人被向外击退，并留下一个扩散风环特效。
// 半径口径：风眼半径是世界坐标（与挥砍半径同一口径，不额外乘视野缩放）——看得见的圈就是吸得到的圈。
function updateTornadoes(dt){
  const ts = G.tornadoes;
  if(!ts || !ts.length) return;
  for(let i = ts.length - 1; i >= 0; i--){
    const t = ts[i];
    t.life -= dt;
    if(t.life <= 0){ tornadoBurst(t); ts.splice(i, 1); continue; } // 风停 → 击退
    // ① 吸怪：范围内敌人被持续拉向风眼（Boss 体型大打折；冲撞怪冲锋无敌期间吸不动）
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      const d = dist(t, e);
      if(d > t.r + e.r || d < 1) continue;
      const a = Math.atan2(t.y - e.y, t.x - e.x);
      const k = e.isBoss ? 0.35 : 1;                            // 体型越大越难吸
      const kf = t.pull * k * (0.45 + 0.55 * clamp(d/t.r, 0, 1)); // 越靠边吸力越强（贴边也能被卷进来）
      e.x += Math.cos(a) * kf * dt;
      e.y += Math.sin(a) * kf * dt;
    }
    // ② 持续伤害：每 tick 秒一跳（范围同风眼半径）
    t.next -= dt;
    if(t.next <= 0){
      t.next = t.tick;
      let hit = false;
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(dist(t, e) > t.r + e.r) continue;
        e.takeDamage(t.dmg, '#8ef0ff', false, t.seat); // 🌀 风伤=近战来源
        e.lastHitIdx = t.seat; // 击杀归属：施法者
        hit = true;
      }
      if(pvpHitPlayers(t.seat, t.x, t.y, t.r, t.dmg, '#8ef0ff') > 0) hit = true; // ⚔️ 对战：风眼卷到对手也掉血
      if(hit) SND.hit();
    }
  }
}
function tornadoBurst(t){ // 风停：范围内敌人被向外击退（离风眼越近吹得越远，体型越大吹得越近）
  const R = t.r * 1.2;
  G.effects.push({ type:'windburst', x:t.x, y:t.y, r:R, life:0.45, max:0.45 });
  G.screenShake = Math.max(G.screenShake || 0, 6);
  SND.shieldBlock();
  for(const e of G.enemies){
    if(e.dead || e.dying || e.isBullet || e.invincible) continue;
    const d = dist(t, e);
    if(d > R + e.r) continue;
    const a = d > 1 ? Math.atan2(e.y - t.y, e.x - t.x) : rand(0, Math.PI*2);
    // 体型越大越难吹（与护盾球同一口径：小怪弹得远、大怪弹得近）+ Boss 只剩 30%（吹得动一点，但吹不飞）
    const mass = clamp(16 / Math.max(8, e.r), 0.4, 1.5);
    const kf = t.knock * mass * (e.isBoss ? 0.3 : 1) * clamp(1 - d/(R + e.r), 0.45, 1);
    e.kbx += Math.cos(a) * kf;
    e.kby += Math.sin(a) * kf;
  }
}

// ===== 🪨 投石角色：地图石块 + 装填 + 抛物线投掷（第十角色）=====
// 三色石口径（用户定稿）：🟡 黄=伤害最高（单体最痛）/ 🔵 蓝=命中减速 / 🔴 红=落地范围爆炸
// 颜色匹配：石头颜色 === 怪的石头颜色族 → 额外重伤（见 STONE_MATCH_MUL）；
//   怪的"石头颜色"由它自己的绘制颜色按**色相**归类（红族 h≥300 或 h<20 / 黄族 20≤h<150 / 蓝族 150≤h<300），
//   并且会画在怪身上（见 drawStoneTags）—— 玩家照标记打，不用去猜。
const STONE_COLORS = {
  yellow: { key:'yellow', name:'黄石', body:'#ffd23f', ring:'#fff3b0', dmg:130, radius:52,  slow:1,    slowT:0   }, // 🟡 单体最痛（只打范围内最靠中心的一只）
  blue:   { key:'blue',   name:'蓝石', body:'#4fa3ff', ring:'#cfe6ff', dmg:72,  radius:86,  slow:0.45, slowT:2.5 }, // 🔵 中伤 + 命中减速
  red:    { key:'red',    name:'红石', body:'#ff4d4d', ring:'#ffc7c7', dmg:85,  radius:118, slow:1,    slowT:0   }, // 🔴 落地范围爆炸
};
const STONE_KEYS = ['red', 'yellow', 'blue'];  // 刷新池（三色等概率）
const STONE_MATCH_MUL = 1.6;   // 🎯 颜色匹配额外伤害倍率（色感敏锐可提升）
const STONE_LOAD_T = 1.0;      // 🪨 捡起后装填秒数（到点自动抛出 —— 用户定的"捡到石头等一秒自动扔出"）
const STONE_FLY_T = 0.5;       // 🪨 抛物线飞行时长（秒）
const STONE_ARC = 110;         // 🪨 抛物线视觉弧高（世界坐标；只影响绘制高度，判定始终在落点）
const STONE_OVERLOAD = 50;     // 🪨 超载自伤：手里已有一块时又踩到第二块
const STONE_MAX_ON_MAP = 6;    // 🪨 地图上同时存在的石头上限（石头增产可提升）
const STONE_SEED = 4;          // 🪨 开局先铺几块
const STONE_RESPAWN_T = 4.5;   // 🪨 补石节奏（每 4.5 秒补 1 块，直到回到上限）
// 💪 2026-10-10 用户「加强投石」：**玩家身边 STONE_NEAR_R 内恒定保持 STONE_NEAR_N 块**（捡走就补）
//    以前石头全图随机刷（还刻意离玩家 ≥150），投石常常"手里没货" → 现在近身永远有弹药
const STONE_NEAR_R   = 300;    // 「自身一定距离」= 300px（圈内恒有 3 块）
const STONE_NEAR_N   = 3;      // 圈内必刷几块
const STONE_NEAR_MIN = 70;     // 离玩家至少这么远（不糊在脸上——一出生就被踩/超载不是加强是坑）
const STONE_NEAR_GAP = 70;     // 圈内石头彼此至少隔这么远（不叠成一坨）
const STONE_NEAR_T   = 0.6;    // 补位巡检间隔（秒）：捡走一块 0.6 秒内就补上
const STONE_SIZEW = 34, STONE_SIZEH = 16; // 🪨 长方形石尺寸（世界坐标）
const STONE_R = 20;            // 🪨 石头自身的拾取判定半径（与玩家的 stonePick 相加）

// 十六进制颜色 → 色相（0~360）；灰阶（无彩色）当红族
function hexHue(hex){
  let h = String(hex || '').replace('#', '');
  if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if(h.length !== 6) return 0;
  const r = parseInt(h.slice(0,2),16)/255, g = parseInt(h.slice(2,4),16)/255, b = parseInt(h.slice(4,6),16)/255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx - mn;
  if(!(d > 0)) return 0;
  let hue;
  if(mx === r) hue = 60 * (((g - b) / d) % 6);
  else if(mx === g) hue = 60 * (((b - r) / d) + 2);
  else hue = 60 * (((r - g) / d) + 4);
  if(hue < 0) hue += 360;
  return hue;
}
function stoneColorOf(hex){ // 颜色 → 红/黄/蓝三族（口径写死，测试按同一张表断言）
  const hue = hexHue(hex);
  if(hue >= 300 || hue < 20) return 'red';   // 红 / 品红 / 粉
  if(hue < 150) return 'yellow';             // 橙 / 黄 / 黄绿（绿怪归黄族）
  return 'blue';                             // 青 / 蓝 / 紫 / 紫罗兰
}
function stoneTagOf(e){ // 这只怪的"石头颜色"（缓存到 e.stoneTag；Boss 用 bodyColor 主色）
  if(!e) return 'red';
  if(e.stoneTag) return e.stoneTag;
  e.stoneTag = stoneColorOf(e.bodyColor || e.color || '#f44');
  return e.stoneTag;
}
function stoneHeroOn(){ // 场上有投石角色吗？（没有就不刷石头，免得满地杂物）
  return (G.players || []).some(p => p && p.isStone && !p.dead) || !!(G.player && G.player.isStone && !G.player.dead);
}
function stoneMapLv(){ // 「石头增产」按场上所有投石角色里的最高等级结算（地图是世界共享的）
  let lv = 0;
  for(const p of (G.players || [])) if(p && p.isStone) lv = Math.max(lv, p.skills.s_stone || 0);
  if(G.player && G.player.isStone) lv = Math.max(lv, G.player.skills.s_stone || 0);
  return lv;
}
function spawnStone(){ // 🪨 随机刷一块长方形石（离玩家 ≥150 免得一出生就被超载坑；离已有石头 ≥90 免得叠一起）
  const W = WW(), H = WH();
  const color = STONE_KEYS[Math.floor(Math.random() * STONE_KEYS.length)];
  let x = 0, y = 0, ok = false;
  for(let tries = 0; tries < 40 && !ok; tries++){
    x = rand(70, Math.max(90, W - 70));
    y = rand(70, Math.max(90, H - 70));
    ok = true;
    for(const p of (G.players || [])){
      if(p && !p.dead && Math.hypot(p.x - x, p.y - y) < 150){ ok = false; break; }
    }
    if(ok) for(const st of (G.stones || [])){
      if(Math.hypot(st.x - x, st.y - y) < 90){ ok = false; break; }
    }
  }
  const st = { color, x, y, ang: rand(0, Math.PI), born: 0.35, dead: false };
  G.stones.push(st);
  return st;
}
// 💪 圈内补位：在玩家身边的环形带里刷一块（min~R 之间的圆环，不糊脸、不叠石、不出场地）
function spawnStoneNear(p){
  const W = WW(), H = WH();
  const color = STONE_KEYS[Math.floor(Math.random() * STONE_KEYS.length)];
  // ⚠️ 安全距离：必须落在**拾取范围之外**（广口拾取器满级 62+20=82）→ 否则一刷出来就被捡走、
  //    手里有货时更是直接触发超载自伤 50（"加强"变"陷阱"）
  const minD = Math.max(STONE_NEAR_MIN, (p.stonePick || 30) + STONE_R + 15);
  for(let tries = 0; tries < 50; tries++){
    const a = rand(0, Math.PI * 2), d = rand(minD, STONE_NEAR_R);
    const x = clamp(p.x + Math.cos(a) * d, 60, Math.max(70, W - 60));
    const y = clamp(p.y + Math.sin(a) * d, 60, Math.max(70, H - 60));
    if(Math.hypot(x - p.x, y - p.y) < minD) continue;   // 夹回场地后可能太近 → 重试
    let ok = true;
    for(const st of (G.stones || [])) if(Math.hypot(st.x - x, st.y - y) < STONE_NEAR_GAP){ ok = false; break; }
    if(!ok) continue;
    const st = { color, x, y, ang: rand(0, Math.PI), born: 0.35, dead: false, near: true };
    G.stones.push(st);
    return st;
  }
  return null;
}
function nearStoneCount(p){ // 圈内现有几块（near 标记只作读数，判定一律按真实距离）
  let n = 0;
  for(const st of (G.stones || [])) if(Math.hypot(st.x - p.x, st.y - p.y) <= STONE_NEAR_R) n++;
  return n;
}
function stoneHeros(){ // 场上活着、且能用石头的玩家（多人各补各的）
  const out = [];
  for(const p of (G.players || [])) if(p && p.isStone && !p.dead) out.push(p);
  if(G.player && G.player.isStone && !G.player.dead && out.indexOf(G.player) < 0) out.push(G.player);
  return out;
}
function ensureNearStones(limit){ // 💪 铁律：每个投石玩家身边恒有 STONE_NEAR_N 块（捡走立刻补）
  if(!G.stones) G.stones = [];
  const cap = (limit === undefined ? STONE_MAX_ON_MAP + stoneMapLv() : limit);
  for(const p of stoneHeros()){
    let guard = 0;
    while(nearStoneCount(p) < STONE_NEAR_N && guard++ < STONE_NEAR_N){
      if(G.stones.length >= cap) break;    // 总上限仍然最大（近身优先，但不许刷爆地图）
      if(!spawnStoneNear(p)) break;        // 实在挤不下就算了（下一轮巡检再试）
    }
  }
  return G.stones.length;
}
function seedStones(){ // 🪨 开局铺场（每局开始/重开各一次）
  if(!G.stones) G.stones = [];
  G.stones.length = 0;
  G.stoneRespawnT = STONE_RESPAWN_T;
  G.stoneNearT = 0;
  if(!stoneHeroOn()){ G.stoneSeeded = true; return; }
  ensureNearStones();                          // 💪 先保证每人身边 3 块
  const cap = STONE_MAX_ON_MAP + stoneMapLv();
  for(let i = 0; i < STONE_SEED; i++) if(G.stones.length < cap) spawnStone(); // 再在全图撒几块（捡石跑位仍然有意义）
  G.stoneSeeded = true;
}
function updateStones(dt){
  if(!G.stones) G.stones = [];
  if(!stoneHeroOn()){ if(G.stones.length) G.stones.length = 0; return; } // 没人用投石 → 一块都不留
  for(const st of G.stones) if(st.born > 0) st.born -= dt;
  const lv = stoneMapLv();
  const cap = STONE_MAX_ON_MAP + lv;
  // 💪 近身补位（比全图补石快得多）：捡走一块 → STONE_NEAR_T 秒内回到 3 块
  if(G.stoneNearT === undefined) G.stoneNearT = 0;
  G.stoneNearT -= dt;
  if(G.stoneNearT <= 0){
    G.stoneNearT = STONE_NEAR_T;
    ensureNearStones(cap);
  }
  if(G.stoneRespawnT === undefined) G.stoneRespawnT = STONE_RESPAWN_T;
  G.stoneRespawnT -= dt;
  if(G.stoneRespawnT <= 0){
    G.stoneRespawnT = Math.max(1.5, STONE_RESPAWN_T * (1 - 0.15 * lv)); // 石头增产：补得更快
    // 全图那部分要给"近身 3 块"留位置（不然远处的石头把名额占满，近身永远补不上）
    const filler = Math.max(0, cap - STONE_NEAR_N * Math.max(1, stoneHeros().length));
    if(G.stones.length < filler) spawnStone();
  }
  G.stones = G.stones.filter(st => !st.dead);
}
// ===== 🐣 菜鸟「扔木棍」：地面绊脚陷阱推进（0 伤害，只绊倒）=====
// 一根木棍的一生：飞行（砸到怪即消失）→ 落地 → 存在 10 秒 / 被踩 4 次 → **滚走退场**
// ⚠️ 全程不结算任何伤害：绊倒只给 stun（怪 0.5s / 玩家 0.5s）。Boss **免疫**绊倒，但会一脚把木棍踩碎（立刻销毁）
// 🪵 木棍退场 = **滚走**（2026-10-09 用户定：不再碎掉）：木棍滚起来就是「滚木」，
//    而滚木永远不可能存在 —— 所以它滚出去之后就没了。滚动期间只剩视觉，不再参与绊倒判定。
function rollStickAway(st, dir){
  if(st.rollT > 0) return; // 已经在滚了就别重置（否则越滚越远）
  st.rollT = STICK_ROLL_TIME;
  st.rollX0 = st.x; st.rollY0 = st.y;
  st.rollDir = dir;
  st.rollSpin = (rand(0, 1) < 0.5 ? -1 : 1) * rand(8, 13); // 俯视角看就是"在地上打滚"
  st.air = false;
}
function updateSticks(dt){
  if(!G.sticks) G.sticks = [];
  // 绊倒免疫窗先递减（跟场上有几根棍无关，否则没棍时窗口会卡住不消失）
  for(const e of G.enemies) if(e.stickImmuneT > 0) e.stickImmuneT = Math.max(0, e.stickImmuneT - dt);
  for(const q of (G.players || [])) if(q && q.stickImmuneT > 0) q.stickImmuneT = Math.max(0, q.stickImmuneT - dt);
  if(!G.sticks.length) return;
  for(const st of G.sticks){
    if(st.rollT > 0){ // ⓪ 正在滚走（退场）：边滚边减速，滚完就"滚木不存在了"
      st.rollT = Math.max(0, st.rollT - dt);
      const kk = 1 - st.rollT / STICK_ROLL_TIME;
      const ee = 1 - (1 - kk) * (1 - kk); // 初快末慢
      st.x = clamp(st.rollX0 + Math.cos(st.rollDir) * STICK_ROLL_DIST * ee, 16, WW() - 16);
      st.y = clamp(st.rollY0 + Math.sin(st.rollDir) * STICK_ROLL_DIST * ee, 16, WH() - 16);
      st.ang += st.rollSpin * dt;
      if(st.rollT <= 0) st.dead = true;
      continue;
    }
    if(st.air){
      st.t += dt;
      const k = clamp(st.t / STICK_FLY, 0, 1);
      st.x = st.sx + (st.tx - st.sx) * k;
      st.y = st.sy + (st.ty - st.sy) * k;
      // ① 飞行中砸到怪：怪**不受伤**，木棍直接消失（不落地、不反弹）
      let hit = false;
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(Math.hypot(e.x - st.x, e.y - st.y) <= e.r + STICK_R){ hit = true; break; }
      }
      if(hit){ st.dead = true; continue; }
      if(k >= 1){ st.air = false; st.x = st.tx; st.y = st.ty; st.ang = rand(0, Math.PI); } // 落地
      continue;
    }
    // ② 落地：10 秒寿命（到点自己滚走 —— 不用人管）
    st.life -= dt;
    if(st.shake > 0) st.shake = Math.max(0, st.shake - dt);
    if(st.life <= 0){ rollStickAway(st, rand(0, Math.PI * 2)); continue; }
    if(st.cool > 0){ st.cool -= dt; continue; } // 刚被踩过的一瞬：不重复结算
    // ③ 踩到就绊倒（**始终 0 伤害**）：先看怪，再看玩家（包括丢棍的菜鸟自己 / ⚔️对战对手）
    let tripped = null;
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(Math.hypot(e.x - st.x, e.y - st.y) > e.r + STICK_R) continue;
      if(e.isBoss){ // 🏋️ Boss：**免疫**绊倒，但一脚把木棍踩碎（立刻销毁，不滚走、不计数）
        st.dead = true;
        spawnParticles(st.x, st.y, '#c9a36a', 8);
        SND.aRookie(); // 木头被踩裂的闷响
        break;
      }
      if(e.stickImmuneT > 0) continue;
      e.stun = Math.max(e.stun || 0, STICK_STUN); // 绊倒：眩晕 0.5 秒后起身继续走
      e.stickImmuneT = STICK_IMMUNE;
      tripped = e; break;
    }
    if(!st.dead){
      if(!tripped){
        for(const q of (G.players || [])){
          if(!q || q.dead || q.stickImmuneT > 0) continue;
          if(Math.hypot(q.x - st.x, q.y - st.y) > q.r + STICK_R) continue;
          q.stun = Math.max(q.stun || 0, STICK_STUN); // 自己也照绊：棍不长眼
          q.stickImmuneT = STICK_IMMUNE;
          tripped = q; break;
        }
      }
      if(tripped){
        st.hits++;
        st.cool = 0.35; st.shake = 0.3;
        spawnParticles(st.x, st.y, '#a8845a', 4);
        SND.aRookie(); // 又一声木棍闷响
        // 被踩满 4 次 → 顺着"被踩出去"的方向滚走（背对着踩它的人），滚完就没了
        if(st.hits >= STICK_HITS_MAX) rollStickAway(st, Math.atan2(st.y - tripped.y, st.x - tripped.x));
      }
    }
  }
  G.sticks = G.sticks.filter(s => !s.dead);
}
function drawSticks(){ // 🐣 菜鸟木棍（地面层：旋转飞行 / 落地木棍 + 影子 + 被踩抖动 + 最后 2 秒闪烁 + 滚走退场）
  if(!G.sticks || !G.sticks.length) return;
  for(const st of G.sticks){
    const rolling = st.rollT > 0; // 正在滚走（滚木不存在 → 滚完淡出消失）
    const k = st.air ? clamp(st.t / STICK_FLY, 0, 1) : 1;
    const h = st.air ? STICK_ARC * 4 * k * (1 - k) : 0; // 抛物线高度（起落为 0，中点最高）
    const fade = rolling ? clamp(st.rollT / (STICK_ROLL_TIME * 0.45), 0, 1) : 1; // 滚走的尾段渐渐滚没
    ctx.save(); // 地面影子
    ctx.globalAlpha = 0.22 * fade;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(st.x, st.y, 12, 4.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    if(!st.air && !rolling){ // 落地后：淡棕色范围圈（提示"这玩意儿踩了会绊倒"，圈就是判定半径）；滚走了就不再绊人
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#c9a36a'; ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.arc(st.x, st.y, STICK_R, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(st.x, st.y - h);
    if(st.shake > 0 && !rolling) ctx.translate(rand(-2, 2), rand(-1, 1)); // 被踩的瞬间抖一下（滚走时不用抖）
    ctx.rotate(st.air ? (st.ang + st.t * st.spin) : st.ang);
    if(rolling) ctx.globalAlpha = fade;
    else if(!st.air && st.life < 2) ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(st.life * 9)); // 快滚走：闪
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 6; // 深色描边（浅地面上勾出轮廓）
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
    ctx.strokeStyle = '#c9a36a'; ctx.lineWidth = 3.4; // 木棍本体（亮棕，黑地面上也看得清）
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
    ctx.strokeStyle = '#8a6437'; ctx.lineWidth = 2; // 两端的枝节
    ctx.beginPath(); ctx.moveTo(-12, -2.8); ctx.lineTo(-8, -2.8); ctx.moveTo(8, 2.8); ctx.lineTo(12, 2.8); ctx.stroke();
    ctx.restore();
  }
}
// ================= 🪃 回旋镖：普攻「往返双段」 + 大招「环绕 5 秒」两套口径 =================
// ⚠️ 2026-10-10 用户口径：**普攻保持原来的往返双段**，改成环绕的只有**大招**。
// 普攻一枚镖的一生：① 去程（沿出手方向直线飞出，穿透）→ ② 抵达最远点折返（或撞边界）→
//   ③ 回程（**追踪玩家当前位置**飞回来，路上再穿一遍）→ ④ 被接住（消失）。
// 大招一枚镖的一生：① 甩出（飞到轨道半径）→ ② **贴身高速环绕** BM_ORBIT_T(5) 秒（跟着人走）→
//   ③ 时间到自动**收回**（追踪玩家飞回）→ ④ 被接住（消失）。
// 关键口径：
//   · 去程 / 回程**各自独立命中**（hitOut / hitBack 两个集合）→ 同一敌人最多吃 2 段
//   · 每条路径的穿透数各自封顶（bmPierce）→ 不能一路横扫到天边
//   · 环绕期间（仅大招）是**持续输出**：同一敌人有 BM_ORBIT_TICK 秒再伤冷却（ecool）+ 一圈名额
//   · 回程速度比去程快（真实回旋镖回来更急）→ 一圈时间短、手感利落
//   · 超时（BM_MAXLIFE / BM_ORBIT_LIFE）没接住 → 落地消失（当作扔丢了，无任何收益）
function spawnBoomerang(owner, ang, opt){
  if(!G.boomerangs) G.boomerangs = [];
  opt = opt || {};
  const orbit = !!opt.orbit;     // 🌀 只有大招那批镖走环绕（普攻永远是往返双段）
  const dmg = Math.max(1, Math.round(owner.bulletDmg * (opt.dmgMul || 1) * roarMul(owner) * CM().dmgMul)); // 单段伤害（挑战模式修正 + 大招折扣）
  const b = {
    seat: owner.seat, x: owner.x, y: owner.y,
    sx: owner.x, sy: owner.y,          // 出场点（去程起点；绘制残影用）
    ang, phase: 'out',                 // 'out' 去程 / 'orbit' 环绕（仅大招）/ 'back' 回程
    orbit,                             // 🌀 是否环绕镖（大招）
    travelled: 0,                      // 去程已飞距离
    range: orbit ? (owner.bmOrbitR || BM_ORBIT_R) : (owner.bmRange || BM_RANGE), // 去程到此距离折返 / 上轨道
    orbitW: owner.bmOrbitW || BM_ORBIT_W,
    orbitMax: owner.bmOrbitT || BM_ORBIT_T,
    orbitT: 0,                         // 已环绕秒数（≥ orbitMax → 收回）
    orbAng: ang,                       // 当前环绕角（相对玩家）
    lapAcc: 0, lapSet: new Set(),      // 本圈已咬过谁（转满一圈清零 → 一圈最多咬 pierce 个）
    outSpd: owner.bmOutSpd || BM_SPD_OUT,
    backSpd: owner.bmBackSpd || BM_SPD_BACK,
    backMul: owner.bmBackMul || BM_RETURN_MUL, // 🔁 回程伤害倍率
    pierce: Math.max(1, owner.bmPierce || BM_PIERCE),
    dmg, critLv: owner.skills.crit || 0,
    dmgMul: opt.dmgMul || 1,           // 大招那批镖打折（一次 8 枚同时环绕）
    ecool: new Map(),                  // 敌人 → 再伤冷却（大招环绕持续输出用）
    hitOut: new Set(), hitBack: new Set(),
    r: BM_R, spin: 0, life: orbit ? BM_ORBIT_LIFE : BM_MAXLIFE, dead: false, caught: false,
  };
  G.boomerangs.push(b);
  return b;
}
function updateBoomerangs(dt){
  if(!G.boomerangs) G.boomerangs = [];
  for(const b of G.boomerangs){
    if(b.dead) continue;
    b.spin += dt * 22;                       // 自转（视觉）
    b.life -= dt;
    const p = (G.players && G.players[b.seat]) || G.player;
    if(!p || p.dead){ b.dead = true; continue; }
    let segDmg = b.dmg, hitSet = null, isBack = false, isOrbit = false;

    if(b.phase === 'out'){
      // ① 去程：沿出手方向直线飞出（大招镖飞满的是"轨道半径"，普攻镖飞满的是"折返距离"）
      const step = b.outSpd * dt;
      b.travelled += step;
      b.x += Math.cos(b.ang) * step;
      b.y += Math.sin(b.ang) * step;
      const off = (b.x < b.r || b.x > WW() - b.r || b.y < b.r || b.y > WH() - b.r);
      if(off){ b.x = clamp(b.x, b.r, WW() - b.r); b.y = clamp(b.y, b.r, WH() - b.r); }
      if(b.travelled >= b.range || off){       // 到最远点（或撞到世界边界）：普攻折返 / 大招上轨道
        if(b.orbit){
          b.phase = 'orbit';
          b.orbAng = Math.atan2(b.y - p.y, b.x - p.x); // 以玩家为心、此刻的方位角 = 环绕起点
          b.x = clamp(p.x + Math.cos(b.orbAng) * b.range, b.r, WW() - b.r); // 吸到轨道上（不留在越界/超冲点）
          b.y = clamp(p.y + Math.sin(b.orbAng) * b.range, b.r, WH() - b.r);
          b.lapAcc = 0; b.lapSet = new Set();
        } else {
          b.phase = 'back';
          b.life = Math.max(b.life, 1.6);        // 回程给足时间飞回来（别刚折返就超时）
        }
      }
      hitSet = b.hitOut; segDmg = b.dmg;
    } else if(b.phase === 'orbit'){
      // ② 贴身高速环绕（**只有大招那批镖会走到这里**）：位置**锚在玩家身上**（人走圈也走）
      b.orbitT += dt;
      b.orbAng += b.orbitW * dt;
      b.lapAcc = (b.lapAcc || 0) + b.orbitW * dt;
      if(b.lapAcc >= Math.PI * 2){ b.lapAcc -= Math.PI * 2; (b.lapSet || (b.lapSet = new Set())).clear(); } // 每转满一圈重开咬人名额
      b.x = clamp(p.x + Math.cos(b.orbAng) * b.range, b.r, WW() - b.r);
      b.y = clamp(p.y + Math.sin(b.orbAng) * b.range, b.r, WH() - b.r);
      if(b.orbitT >= b.orbitMax){             // 满 BM_ORBIT_T 秒 → 自动收回
        b.phase = 'back';
        b.life = Math.max(b.life, 1.6);        // 收回段给足时间飞回手里
      }
      isOrbit = true; segDmg = b.dmg;
    } else {
      // ③ 回程 / 收回：追踪玩家当前位置飞回（人动了镖也跟着回）
      const a = angleTo(b, p);
      const step = b.backSpd * dt;
      b.x += Math.cos(a) * step;
      b.y += Math.sin(a) * step;
      if(Math.hypot(b.x - p.x, b.y - p.y) <= p.r + BM_CATCH_TOL){
        b.caught = true; b.dead = true;      // 接住：消失 + 回声特效
        if(p.isBoomerang){ p.bmCaught = (p.bmCaught || 0) + 1; p.bmCatchFx = 0.22; }
        spawnParticles(b.x, b.y, '#ffd166', 4);
        continue;
      }
      hitSet = b.hitBack; isBack = true; segDmg = b.dmg * b.backMul;
    }
    if(b.life <= 0){ b.dead = true; continue; } // 超时没接住 → 落地消失

    // ---- 环绕段：持续输出（同一敌人 BM_ORBIT_TICK 秒才能再咬，一圈最多咬 pierce 个） ----
    if(isOrbit){
      for(const [k, v] of b.ecool){ const nv = v - dt; if(nv <= 0) b.ecool.delete(k); else b.ecool.set(k, nv); }
      if(!b.lapSet) b.lapSet = new Set();
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(b.ecool.has(e)) continue;
        if(b.lapSet.size >= b.pierce) break;
        if(dist(b, e) >= b.r + e.r) continue;
        bmBite(b, e, segDmg, false);
        b.ecool.set(e, BM_ORBIT_TICK);
        b.lapSet.add(e);
      }
      // ⚔️ 对战：环绕的刀网也能扫到对手玩家（同一对象同样吃再伤冷却）
      if(G.pvp){
        for(const q of (G.players || [])){
          if(!q || q.dead || q.seat === b.seat || b.ecool.has(q)) continue;
          if(b.lapSet.size >= b.pierce) break;
          if(Math.hypot(b.x - q.x, b.y - q.y) >= b.r + q.r) continue;
          q.takeDamage(Math.max(1, Math.round(segDmg * PVP_DMG_MUL)), '#ffd166');
          spawnParticles(q.x, q.y, '#ff8a8a', 3);
          b.ecool.set(q, BM_ORBIT_TICK); b.lapSet.add(q);
        }
      }
      continue;
    }
    // ---- 甩出段 / 收回段：各自独立命中（同一敌人两段各吃一次） ----
    if(hitSet.size >= b.pierce) continue;    // 这条路径的穿透已用完 → 只飞不打
    for(const e of G.enemies){
      if(e.dead || e.dying || e.isBullet || e.invincible) continue;
      if(hitSet.has(e)) continue;
      if(hitSet.size >= b.pierce) break;
      if(dist(b, e) >= b.r + e.r) continue;
      bmBite(b, e, segDmg, isBack);
      hitSet.add(e);
    }
    // ⚔️ 对战：甩出/收回同样能打到对手玩家（同一套 PVP 折算）
    if(G.pvp){
      for(const q of (G.players || [])){
        if(!q || q.dead || q.seat === b.seat || hitSet.has(q)) continue;
        if(hitSet.size >= b.pierce) break;
        if(Math.hypot(b.x - q.x, b.y - q.y) >= b.r + q.r) continue;
        hitSet.add(q);
        q.takeDamage(Math.max(1, Math.round(segDmg * PVP_DMG_MUL)), isBack ? '#8ef0ff' : '#ffd166');
        spawnParticles(q.x, q.y, '#ff8a8a', 4);
      }
    }
  }
  G.boomerangs = G.boomerangs.filter(b => !b.dead);
}
// 🪃 咬一口：伤害 + 暴击 + 火花 + 击退（甩出/环绕/收回三段共用）
function bmBite(b, e, segDmg, isBack){
  let dmg = segDmg, crit = false;
  if(b.critLv > 0 && Math.random() < b.critLv / 5){ dmg = Math.round(segDmg * (2.0 + b.critLv / 5)); crit = true; }
  e.takeDamage(Math.max(1, Math.round(dmg)), crit ? '#f60' : (isBack ? '#8ef0ff' : '#ffd166'), crit, b.seat);
  e.lastHitIdx = b.seat;
  spawnParticles(e.x, e.y, isBack ? '#8ef0ff' : '#ffd166', 3);
  SND.hit(); if(crit) SND.crit();
  // 击退：收回那一下更猛（镖回手里时劲儿大）
  const ea = Math.atan2(e.y - b.y, e.x - b.x);
  const kf = (isBack ? 210 : 150) * (e.isBoss ? 0.25 : 1);
  e.kbx = (e.kbx || 0) + Math.cos(ea) * kf;
  e.kby = (e.kby || 0) + Math.sin(ea) * kf;
}
function drawBoomerangs(){ // 🪃 回旋镖（飞行层：环绕轨迹圈 + 残影 + 旋转的双刃镖身 + 收回拖尾）
  if(!G.boomerangs || !G.boomerangs.length) return;
  // 环绕轨道：先画一圈淡淡的"刀网轨迹"，让玩家一眼看出镖会扫到哪
  for(const b of G.boomerangs){
    if(b.phase !== 'orbit') continue;
    const p = (G.players && G.players[b.seat]) || G.player;
    if(!p) continue;
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; ctx.setLineDash([7, 9]);
    ctx.beginPath(); ctx.arc(p.x, p.y, b.range, 0, Math.PI * 2); ctx.stroke();   // 轨道半径（大招镖专用）
    ctx.restore();
  }
  for(const b of G.boomerangs){
    const isBack = (b.phase === 'back');
    const wing = isBack ? '#8ef0ff' : '#ffd166';   // 去程/环绕金 / 回程青（一眼看出"这是回来的那段"）
    const core = isBack ? '#e8fbff' : '#fff4cf';
    // 收回拖尾（一条淡色残影，提示"它在往回飞"）：方向 = 朝玩家的反方向
    if(isBack){
      const p = (G.players && G.players[b.seat]) || G.player;
      const t = p ? angleTo(p, b) : (b.ang + Math.PI); // 从玩家指向镖 = 运动反方向
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = 'rgba(142,240,255,.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(b.x + Math.cos(t) * 6, b.y + Math.sin(t) * 6);
      ctx.lineTo(b.x + Math.cos(t) * 30, b.y + Math.sin(t) * 30);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(b.x, b.y);
    // 旋转残影（后面两帧角度略偏，做出"转得看不清"的运动感）
    for(let k = 2; k >= 0; k--){
      const ra = b.spin - k * 0.5;
      ctx.save();
      ctx.rotate(ra);
      ctx.globalAlpha = k === 0 ? 1 : 0.22 * (1 - k * 0.28);
      drawBoomerangBody(wing, core, b.r);
      ctx.restore();
    }
    ctx.restore();
  }
}
// 镖身：两片对称的弯刃 + 中间的握把（一个"V"字形的回旋镖）
function drawBoomerangBody(wing, core, R){
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for(const s of [1, -1]){ // 两片刃
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * R * 1.15, -R * 0.55, s * R * 1.5, -R * 0.05);
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = wing; ctx.lineWidth = 3.4;
    ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0, 0, R * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = core; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.6; ctx.stroke();
}
function drawStones(){ // 🪨 地面层：长方形石（旋转的实心块 + 高光 + 贴身提示）
  if(!G.stones || !G.stones.length) return;
  // 谁手里已经有石头了？（给"踩上去会超载"的石头加一圈红色警示）
  const holders = (G.players || []).filter(p => p && p.isStone && !p.dead);
  for(const st of G.stones){
    const C = STONE_COLORS[st.color] || STONE_COLORS.yellow;
    const pop = st.born > 0 ? (1 - st.born / 0.35) : 1; // 出生弹出
    const sc = 0.4 + 0.6 * clamp(pop, 0, 1);
    let warn = false;
    for(const p of holders){
      if(!p.stoneHold) continue;
      if(Math.hypot(p.x - st.x, p.y - st.y) < p.stonePick + STONE_R + 40) warn = true;
    }
    ctx.save();
    ctx.translate(st.x, st.y);
    // 地面投影
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(0, STONE_SIZEH * 0.7, STONE_SIZEW * 0.52 * sc, STONE_SIZEH * 0.42 * sc, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.rotate(st.ang);
    ctx.scale(sc, sc);
    ctx.fillStyle = C.body;
    ctx.fillRect(-STONE_SIZEW/2, -STONE_SIZEH/2, STONE_SIZEW, STONE_SIZEH);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2;
    ctx.strokeRect(-STONE_SIZEW/2, -STONE_SIZEH/2, STONE_SIZEW, STONE_SIZEH);
    // 石面高光（一条斜纹，读起来像"石头"而不是色块）
    ctx.strokeStyle = C.ring; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-STONE_SIZEW*0.30, -STONE_SIZEH*0.22); ctx.lineTo(STONE_SIZEW*0.30, -STONE_SIZEH*0.22);
    ctx.stroke();
    ctx.restore();
    // 🔴 手里已经有石头了：靠近会超载 → 红色虚线警示圈
    if(warn){
      ctx.save();
      ctx.strokeStyle = 'rgba(255,77,77,.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.arc(st.x, st.y, STONE_SIZEW * 0.72, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    }
  }
}
// 🍅 番茄酱之神手持物：一包**麦当劳番茄酱**（划重点：是麦当劳的）——
//   红色纸袋 + 黄色 M + 顶部米色锯齿撕口；捏爆瞬间袋子一抖、袋口挤出一滴酱。
function drawKetchupWeapon(P, a, r){
  wpnBegin(P, a);
  const sq = (P.kFx > 0) ? 1 + 0.14 * Math.sin(P.kFx * 55) : 1; // 捏爆瞬间整包抖一下
  ctx.fillStyle = '#f2c89a';                                              // 手（握点）
  ctx.beginPath(); ctx.arc(0, 0, r * 0.17, 0, Math.PI * 2); ctx.fill();
  const pw = r * 0.40, ph = r * 0.60, hx = r * 1.18;
  ctx.save();
  ctx.translate(hx, 0);
  ctx.scale(sq, sq);
  ctx.fillStyle = '#d62828'; ctx.strokeStyle = '#8f1414'; ctx.lineWidth = 1.2; // 麦当劳红包体
  ctx.beginPath(); ctx.rect(-pw / 2, -ph / 2, pw, ph); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f5e9d0';                                              // 顶部锯齿撕口（米白）
  for(let i = 0; i < 4; i++) ctx.fillRect(-pw / 2 + i * (pw / 4), -ph / 2 - 1.5, pw / 8, 3);
  ctx.strokeStyle = '#ffc72c'; ctx.lineWidth = Math.max(1.6, r * 0.10); ctx.lineCap = 'round'; // 黄色 M（金拱门）
  ctx.beginPath();
  ctx.moveTo(-pw * 0.28, ph * 0.14);
  ctx.lineTo(-pw * 0.14, -ph * 0.14); ctx.lineTo(0, ph * 0.14);
  ctx.lineTo(pw * 0.14, -ph * 0.14);  ctx.lineTo(pw * 0.28, ph * 0.14);
  ctx.stroke();
  ctx.restore();
  if(P.kFx > 0){ // 捏爆：袋口下方挂一滴将落未落的酱
    ctx.fillStyle = '#e6293a';
    ctx.beginPath(); ctx.arc(hx, ph * 0.55 + (1 - P.kFx / 0.22) * 6, r * 0.09, 0, Math.PI * 2); ctx.fill();
  }
  wpnEnd();
}
// ================= 🛡 骑士：前摇挥剑 + 举盾 + 主动技「勇士冲锋」 =================
// 攻击节奏（与其它近战同一套 shootCD，但多一道前摇）：
//   ① 通用攻击门见 update()：冷却好了且范围内有目标 → 只进「起手式」（kNWindT = 前摇时长），不出刀
//   ② 本函数每帧给前摇倒数 → 归零瞬间**落刀**（this.slash()）并重置 shootCD
//      （前摇期间目标跑了也照斩——重剑抡圆了收不住；这 0.30s 就是用户要的"前摇"手感）
// 主动技「勇士冲锋」（🖱 左键单击 / 手柄RB；AI 被贴身或残血时自动放）：
//   自身无敌 5 秒 + 移速 ×1.5 + 出手间隔 ×0.6；持续期间**范围内队友**每人挂 1 层「次数盾」（一击即破）
//   + 50% 减伤（减伤只存在于冲锋期间——没有常驻光环）。冷却 20 秒。
Player.prototype.updateKnight = function(dt){
  if(this.kNFx > 0) this.kNFx -= dt;
  // —— 前摇收尾：起手式结束 → 重剑落刀 ——
  if(this.kNWindT > 0){
    this.kNWindT -= dt;
    if(this.kNWindT <= 0){
      this.kNWindT = 0;
      // 出手间隔：腐蚀区降攻速 ×1.6 照吃；冲锋期间 ×0.6（更快）
      const atkSlow = (G.time < (this.corrodeAtkSlowUntil||0)) ? 1.6 : 1;
      const chargeRate = this.kInvT > 0 ? KN_CHARGE_RATE : 1;
      this.shootCD = this.shootRate * pCM(this).rateMul * atkSlow * chargeRate;
      this.slash(); // 落刀（走剑士同一套扇形斩击：伤害/击退/斩弹幕/对Boss×1.5 全继承）
    }
  }
  // —— 勇士冲锋：冷却 / 光环维持 ——
  if(this.knCD > 0) this.knCD -= dt;
  if(this.kInvT > 0){
    // 持续期间：走进范围的队友也补上次数盾 + 减伤（"此期间内周围如果有队友就给队友上1层护盾"）
    for(const q of (G.players || [])){
      if(!q || q.dead || q === this) continue;
      if(dist(this, q) <= (this.kAuraR || KN_AURA_R)){
        q.kShieldCnt = Math.max(q.kShieldCnt || 0, 1); // 1 层次数盾（一击即破；已破的补不回来）
        q.kAuraT = Math.max(q.kAuraT || 0, this.kInvT); // 减伤持续到冲锋结束
      }
    }
    // 冲锋拖尾特效（金色尘屑，跟着冲刺的脚步）
    if(Math.random() < dt * 30) spawnParticles(this.x, this.y, '#ffd166', 1);
  }
  // —— 主动技触发 ——
  const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
  if(this.stun > 0 || this.dead || G.state !== 'playing') return;
  if(this.knCD > 0) return;
  if(isAIPlayer(this)){
    // 🤖 AI：被贴身（170 内有敌人）或残血（<60%）才冲——不拿无敌换空气
    let threat = this.hp < this.maxHp * 0.6;
    if(!threat){
      for(const e of targetsFor(this.seat)){
        if(e.dead || e.dying) continue;
        if(dist(this, e) - (e.r || 0) < 170){ threat = true; break; }
      }
    }
    if(!threat) return;
  } else if(!fire) return; // 与其它角色共用「主动技能键」（🖱左键 / RB）
  this.castKnightCharge();
};
Player.prototype.castKnightCharge = function(){ // 🛡 勇士冲锋：号角长鸣，全军进击（CD 20s）
  this.spendRes(RES_SKILL_COST); // 🌌 世界2：放技能消耗体力（世界1/无资源英雄为空操作）
  this.kInvT = this.knDurMax || KN_CHARGE_T;   // 无敌 5 秒（技能可延长）
  this.knCD = this.knCDMax;                    // 进 20 秒冷却
  this.kCharges = (this.kCharges || 0) + 1;
  this.kNWindT = 0;                            // 冲锋打断起手式（不带着前摇冲）
  // 起手瞬间就给范围内队友挂上次数盾 + 减伤（随后每帧补新走进来的）
  for(const q of (G.players || [])){
    if(!q || q.dead || q === this) continue;
    if(dist(this, q) <= (this.kAuraR || KN_AURA_R)){
      q.kShieldCnt = Math.max(q.kShieldCnt || 0, 1);
      q.kAuraT = Math.max(q.kAuraT || 0, this.kInvT);
    }
  }
  SND.knightCharge();
  G.screenShake = Math.max(G.screenShake || 0, 6);
  G.effects.push({ type:'kcharge', x:this.x, y:this.y, r:this.kAuraR || KN_AURA_R, life:0.5, max:0.5 });
};
// ================= 🥊 弹簧（第十九个角色）：蓄力弹簧拳 + 弹簧钩 =================
// 普攻「弹簧拳」：**按住左键蓄力、松手出拳**（桌面）—— 拳锋把面前的怪弹飞；
//   蓄力越久飞得越远、伤害越高；被弹飞的怪**撞到场地墙** → 额外伤害 + 冲击波。
//   📱 触屏没有"按住"手势 → 退化为自动快拳（范围内有怪 + 冷却好了就出最小蓄力的拳）。
// 主动技「弹簧钩」：🖱 右键 / 手柄LB / 触屏技能按钮 —— 锚到光标处把自己拉过去，
//   牵引途中**无敌**，沿途碰到的怪全部受伤。
//   ⚔️ 对战：拳与钩索同样打得到对手玩家（PVE/PVP 双口径，见 targetsFor / pvpMeleeHit）。
Player.prototype.punchRange = function(frac){ // 拳程随蓄力档伸长（132 → 178）
  return (this.slashRange || SP_RANGE) + SP_RANGE_CHG * clamp(frac || 0, 0, 1);
};
Player.prototype.updateSpring = function(dt){
  if(this.spPunchFx > 0) this.spPunchFx -= dt;
  if(this.spHookFx > 0) this.spHookFx -= dt;
  if(this.spChargeFx > 0) this.spChargeFx -= dt;
  if(this.spCD > 0) this.spCD -= dt;
  this.shootCD -= dt;
  const ai = isAIPlayer(this);
  // —— 牵引中（弹簧钩）：朝锚点飞行 + 无敌 + 碰伤 ——
  if(this.spPull){
    const pl = this.spPull;
    pl.t -= dt;
    const dx = pl.tx - this.x, dy = pl.ty - this.y;
    const d = Math.hypot(dx, dy), step = SP_HOOK_SPD * dt;
    if(d <= step || pl.t <= 0){ this.x = pl.tx; this.y = pl.ty; this.spPull = null; } // 到位
    else { this.x += dx/d*step; this.y += dy/d*step; }
    this.x = clamp(this.x, this.r, Math.max(this.r, WW() - this.r)); // 双保险：锚点已在界内
    this.y = clamp(this.y, this.r, Math.max(this.r, WH() - this.r));
    this.invuln = Math.max(this.invuln, 0.12); // 牵引途中无敌（到站后还留 0.12s 缓冲）
    // 碰伤：**这次牵引里每个敌人只结算一次**（凭据 = 牵引编号 spHookId）
    const hitR = this.r + 14;
    const hdmg = Math.max(1, Math.round((this.spHookDmg || SP_HOOK_DMG) * roarMul(this) * CM().dmgMul));
    if(G.pvp){
      for(const q of targetsFor(this.seat)){
        if(!q || q.dead || q.spHookHit === pl.id) continue;
        if(dist(this, q) < hitR + q.r){
          q.spHookHit = pl.id;
          q.takeDamage(Math.max(1, Math.round(hdmg * PVP_DMG_MUL)), this);
          spawnParticles(q.x, q.y, '#8ef', 4);
        }
      }
    } else {
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.spHookHit === pl.id) continue;
        if(dist(this, e) < hitR + (e.r||0)){
          e.spHookHit = pl.id;
          e.takeDamage(hdmg, '#8ef', false, this.seat);
          e.lastHitIdx = this.seat;
          const oa = Math.atan2(e.y - this.y, e.x - this.x);
          const kf = SP_HOOK_KB * (e.isBoss ? 0.5 : 1);
          e.kbx = (e.kbx||0) + Math.cos(oa)*kf; e.kby = (e.kby||0) + Math.sin(oa)*kf;
          spawnParticles(e.x, e.y, '#8ef', 3);
        }
      }
    }
  }
  // —— 蓄力 / 出拳 ——
  // 🎮 蓄力键（"按住"口径，2026-10-24 用户定：手柄 5 键蓄力弹射）：1P 🖱 鼠标左键 / 🎮 手柄按钮 5（RB）
  //    鼠标只归 1P——2P/3P 是手柄座位，不能跟着 1P 的鼠标一起蓄力（各坐各的键）
  const punchDown = (this.seat === 0 && G.mouseDown) || springPunchHeld(this.seat);
  if(ai){
    // 🤖 AI：自动打**满蓄力拳**（有怪进拳程 + 冷却好了）—— 不学"按住"，直接按最大档出手
    if(!this.spPull && this.stun<=0 && this.shootCD <= 0 && G.state==='playing' && this.aiSpringTarget()){
      this.castSpringPunch(1);
    }
  } else if(G.deviceType === 'phone'){
    // 📱 触屏：自动快拳（最小蓄力档）—— 与其它近战一样"到点自动出手"
    if(!this.spPull && this.stun<=0 && this.shootCD <= 0 && G.state==='playing' && this.aiSpringTarget()){
      this.castSpringPunch(SP_TOUCH_FRAC);
    }
  } else if(punchDown && !this.spPull && this.stun<=0 && G.state==='playing'){
    // 🖱🎮 桌面/手柄：按住蓄力（松手出拳见下方 else 分支）
    if(!this.spCharging){
      if(this.shootCD <= 0){ this.spCharging = true; this.spChargeT = 0; }
    }
    if(this.spCharging){ // 同一帧就开攒（按下第一帧的时长不浪费）
      this.spChargeT = Math.min(SP_CHARGE_MAX, this.spChargeT + dt);
      if(this.spChargeT >= SP_CHARGE_MAX && this.spChargeFx <= 0){ this.spChargeFx = 0.3; SND.springCharge(); } // 满蓄"咔哒"
    }
  } else if(this.spCharging){
    // 松手 / 被打断 / 出钩取消 → 出拳（蓄力档 = 已蓄时长占比）
    const frac = clamp(this.spChargeT / SP_CHARGE_MAX, 0, 1);
    this.spCharging = false; this.spChargeT = 0;
    if(this.stun<=0 && G.state==='playing') this.castSpringPunch(frac);
  }
  // —— 主动技「弹簧钩」触发 ——
  const fire = !ai && springHookPressed(this.seat);
  if(this.stun > 0 || this.dead || G.state !== 'playing') return;
  if(this.spCD > 0) return;
  if(ai){
    // 🤖 AI：被贴身（160 内有怪）或残血（<50%）才放钩索——不拿位移换空气
    let need = this.hp < this.maxHp * 0.5;
    if(!need){
      for(const e of targetsFor(this.seat)){
        if(e.dead || e.dying) continue;
        if(dist(this, e) - (e.r||0) < 160){ need = true; break; }
      }
    }
    if(!need) return;
  } else if(!fire) return;
  this.castSpringHook();
};
Player.prototype.aiSpringTarget = function(){ // 拳程内最近的能打目标（AI/触屏自动拳共用）
  const range = this.punchRange(1);
  let best = null, bd = 1e9;
  for(const e of targetsFor(this.seat)){
    if(e.dead || e.dying || e.isBullet || e.invincible) continue;
    const d = dist(this, e);
    if(d < range + (e.r||0) && d < bd){ bd = d; best = e; }
  }
  return best;
};
Player.prototype.castSpringPunch = function(frac){ // 🥊 出拳：锥形判定 + 弹飞（蓄力档决定伤害/拳程/飞距）
  frac = clamp(frac || 0, 0, 1);
  const aim = this.aimPoint();
  const a = angleTo(this, aim);
  const range = this.punchRange(frac);
  const dmgBase = Math.max(1, Math.round((this.bulletDmg + SP_DMG_CHG*frac) * roarMul(this) * CM().dmgMul * this.manaDmgMul())); // 🌌 体力→普攻伤害调制
  const critLv = this.skills.crit || 0;
  const launchV = (this.spLaunch || SP_LAUNCH) + SP_LAUNCH_CHG*frac;   // 弹飞初速
  const flyT = this.spFlyT || SP_FLY_T;                                // 弹飞滞留（AI 冻结）时长
  const wallDmg = Math.max(1, Math.round(((this.spWallDmg || SP_WALL_DMG) + SP_WALL_DMG_CHG*frac) * roarMul(this) * CM().dmgMul)); // 撞墙额外伤害
  const waveR = (this.spWaveR || SP_WAVE_R) + SP_WAVE_R_CHG*frac;      // 冲击波半径
  const waveDmg = Math.max(1, Math.round(((this.spWaveDmg || SP_WAVE_DMG) + SP_WAVE_DMG_CHG*frac) * roarMul(this) * CM().dmgMul)); // 冲击波伤害
  // 出手间隔：腐蚀区降攻速 ×1.6 照吃（与其他角色同口径）
  const atkSlow = (G.time < (this.corrodeAtkSlowUntil||0)) ? 1.6 : 1;
  this.shootCD = this.shootRate * pCM(this).rateMul * atkSlow;
  this.spPunchFx = 0.16;                 // 出拳动画（拳头伸出去那一下）
  this.spPunchDir = a;
  this.spPunchRange = range;
  this.spPunches = (this.spPunches || 0) + 1;
  SND.aSpring();
  G.effects.push({ type:'springpunch', x:this.x, y:this.y, dir:a, r:range, arc:SP_ARC, frac, life:0.18, max:0.18 });
  // —— PVE：锥形内所有敌人（弹幕不弹——那是剑/盾的活；冲锋无敌的打不动）——
  for(const e of G.enemies){
    if(e.dead || e.dying || e.isBullet || e.invincible) continue;
    const d = dist(this, e);
    if(d > range + (e.r||0)) continue;
    const ea = Math.atan2(e.y - this.y, e.x - this.x);
    const diff = Math.abs(((ea - a + Math.PI*3) % (Math.PI*2)) - Math.PI);
    if(diff > SP_ARC) continue;
    let dmg = dmgBase, crit = false;
    if(critLv > 0 && Math.random() < critLv/5){ dmg = dmgBase * (2.0 + critLv/5); crit = true; }
    e.takeDamage(Math.round(dmg * (e.isBoss ? 1.2 : 1)), crit ? '#f60' : '#fff', crit, this.seat); // 近战来源；对 Boss ×1.2（低于剑士 1.5：拳是群体击退不是单体重击）
    e.lastHitIdx = this.seat; // 击杀归属
    // 弹飞：径向（从玩家指向怪）→ 多个怪呈扇形炸开；Boss 体重减半
    const kf = launchV * (e.isBoss ? 0.5 : 1);
    e.kbx = 0; e.kby = 0; // 覆盖原有击退（这一拳说了算）
    springLaunch(e, Math.cos(ea)*kf, Math.sin(ea)*kf, flyT, wallDmg, waveR, waveDmg, this.seat);
  }
  // —— ⚔️ 对战：拳同样打得到对手玩家（走通用扇形判定 + PVP 折算）——
  if(G.pvp) pvpMeleeHit(this, this.x, this.y, a, SP_ARC, range, dmgBase, null, this);
};
Player.prototype.castSpringHook = function(){ // 🥊 弹簧钩：锚到光标处把自己拉过去（牵引无敌 + 碰伤）
  this.spendRes(RES_SKILL_COST); // 🌌 世界2/3：放技能消耗体力（世界1 为空操作）
  this.spCD = this.spCDMax;
  this.spHooks = (this.spHooks || 0) + 1;
  this.spCharging = false; this.spChargeT = 0; // 出钩打断蓄力（不能带着一拳飞天）
  // 锚点：真人 = 光标方向（夹到最大锚距）；AI = 远离最近威胁的安全点
  let tx, ty;
  if(isAIPlayer(this)){
    const anc = this.aiSpringAnchor();
    tx = anc.x; ty = anc.y;
  } else {
    const aim = this.aimPoint();
    const a = angleTo(this, aim);
    const d = Math.min(dist(this, aim), this.spHookRange || SP_HOOK_RANGE);
    tx = this.x + Math.cos(a)*d;
    ty = this.y + Math.sin(a)*d;
  }
  // 锚点钳进世界内（别把人拉出场外）
  tx = clamp(tx, this.r + 2, Math.max(this.r + 2, WW() - this.r - 2));
  ty = clamp(ty, this.r + 2, Math.max(this.r + 2, WH() - this.r - 2));
  const d = Math.max(1, Math.hypot(tx - this.x, ty - this.y));
  this.spHookId = (this.spHookId || 0) + 1;
  this.spPull = { tx, ty, t: Math.min(SP_HOOK_T, d / SP_HOOK_SPD), id: this.spHookId };
  this.spHookFx = 0.25;                 // 出钩动画
  SND.springHook();
  G.effects.push({ type:'springhook', x:this.x, y:this.y, x1:tx, y1:ty, life:0.22, max:0.22 });
};
Player.prototype.aiSpringAnchor = function(){ // 🤖 AI 锚点：被贴身就朝反方向跳走，否则朝目标方向切入
  let best = null, bd = 1e9;
  for(const e of targetsFor(this.seat)){
    if(e.dead || e.dying) continue;
    const d = dist(this, e);
    if(d < bd){ bd = d; best = e; }
  }
  let a;
  if(best && bd < 260) a = Math.atan2(this.y - best.y, this.x - best.x); // 逃命：背离最近威胁
  else a = angleTo(this, this.aimPoint());                               // 切入：朝瞄准方向
  const d = this.spHookRange || SP_HOOK_RANGE;
  return { x: this.x + Math.cos(a)*d, y: this.y + Math.sin(a)*d };
};
// 🥊 把一个敌人标成"被弹簧拳弹飞中"：位移由 updateSpringFlyers 接管，AI 冻结（stun）
function springLaunch(e, vx, vy, t, wallDmg, waveR, waveDmg, seat){
  e.spFly = { vx, vy, t, wallDmg, waveR, waveDmg, seat };
  e.stun = Math.max(e.stun || 0, t);
  spawnParticles(e.x, e.y, '#a8f0c4', 4);
}
// 🥊 弹飞中的敌人逐帧位移 + 衰减 + 墙撞结算（主循环敌人更新之后调用）
function updateSpringFlyers(dt){
  if(!G.enemies) return;
  for(const e of G.enemies){
    const f = e.spFly;
    if(!f) continue;
    f.t -= dt;
    e.x += f.vx*dt;
    e.y += f.vy*dt;
    const dec = Math.pow(0.35, dt); // 衰减比普通击退（0.02）慢得多：飞得痛快
    f.vx *= dec; f.vy *= dec;
    // 墙撞：撞到场地边界 → 额外伤害 + 冲击波（把旁边的一起掀翻）
    const W2 = WW(), H2 = WH();
    let hitWall = false, nx = 0, ny = 0;
    if(e.x <= e.r){ hitWall = true; nx = 1; e.x = e.r; }
    else if(e.x >= W2 - e.r){ hitWall = true; nx = -1; e.x = W2 - e.r; }
    if(e.y <= e.r){ hitWall = true; ny = 1; e.y = e.r; }
    else if(e.y >= H2 - e.r){ hitWall = true; ny = -1; e.y = H2 - e.r; }
    if(hitWall && f.t > 0.02){ springWallHit(e, f, nx, ny); continue; }
    if(f.t <= 0){ // 滞留结束：剩余速度交还普通击退管道（继续滑一小段自然停下）
      e.kbx = f.vx; e.kby = f.vy;
      e.spFly = null;
    }
  }
}
// 🥊 撞墙结算：额外伤害 + 冲击波（立即结算范围内敌人的伤害与击退；视觉是 springwave 特效）
function springWallHit(e, f, nx, ny){
  e.spFly = null;
  e.stun = Math.max(e.stun || 0, 0.25); // 撞墙愣神
  e.takeDamage(Math.max(1, Math.round(f.wallDmg * (e.isBoss ? 0.6 : 1))), '#ffb347', false, f.seat);
  e.lastHitIdx = f.seat;
  const wr = f.waveR * visionZoom(); // 👁️ 视野扩大：判定半径与视觉等比（与 spawnExplosion 同口径）
  SND.springWall();
  G.screenShake = Math.max(G.screenShake || 0, 5);
  G.effects.push({ type:'springwave', x:e.x, y:e.y, r:wr, max:wr, nx, ny, life:0.45, max:0.45 });
  spawnParticles(e.x, e.y, '#ffd166', 10);
  for(const o of G.enemies){
    if(o.dead || o === e) continue;
    if(dist({x:e.x, y:e.y}, o) < wr + (o.r||0)){
      const oa = Math.atan2(o.y - e.y, o.x - e.x);
      const kf = Math.max(120, Math.min(620, Math.round(6200 / (o.r||16)))) * (o.isBoss ? 0.5 : 1);
      o.kbx = (o.kbx||0) + Math.cos(oa)*kf; o.kby = (o.kby||0) + Math.sin(oa)*kf;
      if(!o.isBullet){
        o.takeDamage(Math.max(1, Math.round(f.waveDmg * (o.isBoss ? 0.6 : 1))), '#ffd166', false, f.seat);
        o.lastHitIdx = f.seat;
      }
    }
  }
  const src = (G.players && G.players[f.seat]) || null; // 读数：本局墙撞次数
  if(src && src.spWallHits !== undefined) src.spWallHits++;
}
// ================= 🍅 番茄酱之神：扔番茄酱包 + 吃酱捏爆铺大酱潭 =================
// 普攻：甩手扔出一包麦当劳番茄酱（ketchupPack 子弹）——命中敌人 → 严重减速（2 秒），
//   并当场在命中点爆出一滩大酱潭（扔中必爆）；没扔中、撞墙/出界也爆（潭内敌人持续掉血 + 走不动）。
// 主动技「吃番茄酱」（🖱 左键单击 / 手柄RB）：吃下一包回 20 血，顺手把空袋捏爆 ——
//   酱汁呈放射状爆出许多滴（ketchupdrop），滴子飞出去落地，每一滴都化成一滩大酱潭。
Player.prototype.updateKetchup = function(dt){
  if(this.kFx > 0) this.kFx -= dt;
  if(this.kEatFx > 0) this.kEatFx -= dt;
  if(this.kCD > 0) this.kCD -= dt;
  this.shootCD -= dt;
  // 普攻：到点就扔（不需要场上先有怪——提前把包甩出去才能砸中过来的人）
  if(this.shootCD <= 0 && this.stun <= 0 && G.state === 'playing'){
    // 🌌 腐蚀区降攻速：踩在腐蚀毒潭里时出手间隔 ×1.6（与其他角色同口径）
    const atkSlow = (G.time < (this.corrodeAtkSlowUntil||0)) ? 1.6 : 1;
    this.shootCD = this.shootRate * pCM(this).rateMul * atkSlow;
    this.castKetchupThrow();
  }
  // 主动技「吃番茄酱」：回 20 血 + 捏爆空袋铺大酱潭（AI：半血以下才吃，不浪费 30 秒 CD）
  // 🖱 本帧点击：**提前消费**（否则"冷却中点的鼠标"会残留到冷却结束、技能自己放出去）
  const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
  if(this.stun > 0 || this.dead || G.state !== 'playing') return;
  if(this.kCD > 0) return;
  if(isAIPlayer(this)){
    if(this.hp >= this.maxHp * 0.55) return; // AI 血线还健康 → 留着
  } else if(!fire) return; // 与其它角色共用「主动技能键」（🖱左键 / RB）
  this.castKetchupEat();
};
// 🍅 普攻：甩手扔出一包麦当劳番茄酱（直线飞行；命中结算在 handleCollisions 的 ketchupPack 分支）
Player.prototype.castKetchupThrow = function(){
  const aim = this.aimPoint();
  const a = angleTo(this, aim);
  const dmg = Math.max(1, Math.round(this.bulletDmg * roarMul(this) * CM().dmgMul)); // 挑战模式伤害修正
  const b = new Bullet(
    this.x, this.y, Math.cos(a)*KET_THROW_SPD, Math.sin(a)*KET_THROW_SPD,
    dmg, KET_PACK_R, 0, 0, 0, this.seat, this.skills.crit || 0, null
  );
  b.ketchupPack = { // 🍅 命中结算参数（出手时定格，专属技能加成照常生效）
    slow: this.kSlow,                 // 命中减速倍率（Boss 免疫减速，照常吃伤害）
    slowT: KET_HIT_SLOW_T,            // 减速持续时长（秒）
    chance: KET_POOL_CHANCE,          // 命中时爆出大酱潭的概率
    pool: { r:this.kR, dur:this.kDur, tick:KET_TICK, dmg:Math.max(1, Math.round(this.kDmg * roarMul(this) * CM().dmgMul)), slow:this.kSlow },
  };
  G.bullets.push(b);
  this.kFx = 0.22;                    // 出手动画（甩手扔包）
  SND.aKetchup();                     // 撕袋/甩出去的"啪"
};
// 🍅 主动技的捏爆部分：围绕自身一圈爆出 KET_DROPS 滴酱：角度均布 + 随机抖动，速度/飞行时长也略随机
//   → 落点在身边围成一圈不规则的大酱潭（酱是"炸开撒出去的"，不是抹在面前一小摊）
//   🍅 技能潭比普攻概率潭多活 KET_SKILL_DUR_BONUS 秒（存在时间延长，圈怪更持久）
Player.prototype.castKetchupSqueeze = function(){
  const dmg = Math.max(1, Math.round(this.kDmg * roarMul(this) * CM().dmgMul)); // 挑战模式伤害修正
  const dur = this.kDur + KET_SKILL_DUR_BONUS; // 技能潭持续 = 普攻潭 + 额外 3 秒
  for(let i=0;i<KET_DROPS;i++){
    const a = (i/KET_DROPS)*Math.PI*2 + (Math.random()-0.5)*1.0;
    const spd = KET_DROP_SPD * (0.82 + Math.random()*0.42);
    const flt = KET_DROP_FLT * (0.8 + Math.random()*0.5);
    G.effects.push({
      type:'ketchupdrop', x:this.x, y:this.y,
      vx:Math.cos(a)*spd, vy:Math.sin(a)*spd,
      life:flt, max:flt,                       // 飞行倒计时：归零即落地成潭（随后被统一回收）
      r:this.kR, dur, dmg, slow:this.kSlow,     // 落潭参数出手时定格（专属技能加成照常生效）
      seat:this.seat, seed:Math.random()*6.283, // 纯视觉：酱泡相位随机，多滩酱不会整齐划一
    });
  }
  this.kFx = 0.22;                    // 捏爆动画（手上那包抖一下 + 袋口滴酱）
  SND.aKetchup();
  spawnParticles(this.x, this.y, '#e6293a', 8); // 爆开的酱点子
};
Player.prototype.castKetchupEat = function(){ // 🍅 吃下一包番茄酱：回 20 血，CD 30 秒；顺手把空袋捏爆铺大酱潭
  this.spendRes(RES_SKILL_COST); // 🌌 世界2：放技能消耗资源（世界1/无资源为空操作）
  this.kCD = this.kCDMax;
  this.kEatFx = 0.35;
  this.hp = Math.min(this.maxHp, this.hp + this.kHeal); // 回血（不超上限）
  spawnParticles(this.x, this.y - 10, '#5fd18a', 10);   // 头顶冒绿点点（"吃饱了"）
  this.castKetchupSqueeze();                            // 空袋狠狠捏爆 → 酱滴四溅、落地成多滩大酱潭
  spawnParticles(this.x, this.y, '#e6293a', 6);         // 顺手再溅一点酱
  SND.ketchupEat();
  G.screenShake = Math.max(G.screenShake || 0, 2);
};
// ================= 🎻 吟游诗人（第十八角色）：唯一的治疗位 =================
//   普攻 = 拨弦发出一道**穿透音波**；主动技「回旋曲」拉曲回血。
//   治疗目标遍历 G.players（⚔️ 对战模式只给自己回，不给对手送血）。
Player.prototype.bardAllyList = function(){
  const out = [];
  if(!G.players) return out;
  for(const p of G.players){
    if(!p || p === this || p.dead || p.hp <= 0) continue;
    if(G.pvp) continue;                                        // ⚔️ 对战不给对手回血
    if(Math.hypot(p.x - this.x, p.y - this.y) > this.bardHealR) continue;
    out.push(p);
  }
  return out;
};
// 🎻 回血的唯一入口：溢出部分直接浪费（不转护盾）
Player.prototype.healHp = function(amt){
  if(this.dead || !(amt > 0)) return 0;
  const before = this.hp;
  this.hp = Math.min(this.maxHp, this.hp + amt);
  return this.hp - before;
};
Player.prototype.updateBard = function(dt){
  if(this.bardFx > 0) this.bardFx -= dt;
  if(this.bardInterruptFx > 0) this.bardInterruptFx -= dt;
  if(this.bardCD > 0) this.bardCD = Math.max(0, this.bardCD - dt);
  // —— 引导中：每帧攒治疗，攒满 1 点就发一次（回血平滑、血量不出小数）——
  if(this.bardSongT > 0){
    // 🎵 旋律推进：到点就放对应的音（低音与旋律同在 BARD_MELODY 里按时间排好）
    //    一轮放完（BARD_MELODY_LEN）就从 0 重来 —— 「长音」把引导拉到 4/5 秒时曲子不会中断
    this.bardMelT += dt;
    for(let guard = 0; guard < 48; guard++){
      const n = BARD_MELODY[this.bardMelIdx];
      if(!n){ // 表走完了：整轮时长也到了才回绕（否则原地等着，不空转）
        if(this.bardMelT >= BARD_MELODY_LEN){ this.bardMelT -= BARD_MELODY_LEN; this.bardMelIdx = 0; continue; }
        break;
      }
      if(this.bardMelT < n[0]) break;      // 还没到这个音的时间
      SND.bardNote(n[1], n[2], n[3], n[4]);
      this.bardMelIdx++;
    }
    this.bardSongT -= dt;
    const targets = [this].concat(this.bardAllyList());
    this.bardAcc += this.bardHealRate * dt;
    while(this.bardAcc >= 1){
      this.bardAcc -= 1;
      for(const t of targets) t.healHp(1);
    }
    if(this.bardSongT <= 0){ this.bardSongT = 0; this.bardAcc = 0; } // 拉完
  }
  // —— 起手：🖱 左键 / 手柄RB；AI 自己判断血线 ——
  const fire = !isAIPlayer(this) && bombFirePressed(this.seat);
  if(this.stun > 0 || this.dead || G.state !== 'playing') return;
  if(this.bardCD > 0 || this.bardSongT > 0) return;
  if(isAIPlayer(this)){
    let need = this.hp < this.maxHp * 0.55;
    if(!need) for(const p of this.bardAllyList()) if(p.hp < p.maxHp * 0.6){ need = true; break; }
    if(!need) return;
  } else if(!fire) return;
  this.castSong();
};
// 🎻 主动技「回旋曲」：原地拉曲 3 秒（治疗与加速在 updateBard 里逐帧结算）
Player.prototype.castSong = function(){
  this.bardSongT = this.bardSongMax || BARD_SONG_T;
  this.bardCD = this.bardCDMax || BARD_SONG_CD;
  this.bardAcc = 0;
  this.bardMelT = 0; this.bardMelIdx = 0; // 🎵 旋律从头开始（起手三音琶音在 0/0.14/0.28 秒，旋律 0.30 秒接上，正好无缝）
  this.bardBuffUntil = G.time + this.bardSongT;
  for(const p of this.bardAllyList()) p.bardBuffUntil = this.bardBuffUntil; // 队友同享加速
  this.bardSongs++;
  SND.bardSong();
  spawnParticles(this.x, this.y, '#ffe9a8', 14);
  G.screenShake = Math.max(G.screenShake || 0, 2);
};
// 🎻 普攻：拨弦发出一道穿透音波
Player.prototype.playWave = function(){
  const a = angleTo(this, this.aimPoint());
  const dmg = Math.max(1, Math.round(this.bulletDmg * roarMul(this) * CM().dmgMul));
  const b = new Bullet(this.x, this.y, Math.cos(a)*this.bulletSpd, Math.sin(a)*this.bulletSpd,
    dmg, this.bulletR, this.bardPierce || 0, 0, 0, this.seat, this.skills.crit || 0, null, null);
  b.bardWave = true;            // 音波外观
  b.life = BARD_WAVE_LIFE;      // 射程 ≈ 430×0.60 ≈ 258px
  G.bullets.push(b);
  this.bardFx = 0.18;
  SND.heroAtk(this.atkSndKind());
};
// 🍅 大酱潭（番茄酱之神的核心机制）：同毒液领域同款地面持续效果，但颜色是番茄酱红、
//   减速更狠（0.5）。半径在生成时按视野缩放换算成世界值（视觉与判定同一个口径）。
const MAX_KETCHUP_POOLS = 10;
function spawnKetchupPool(x, y, spec, seat){
  if(!spec) return;
  if(!G.effects) G.effects = [];
  // 摘掉超额的旧酱潭（从最早的开始删）：连按铺场也不会把屏幕铺满
  let pools = G.effects.filter(ef => ef.type === 'ketchuppool');
  for(let i = 0; pools.length - i >= MAX_KETCHUP_POOLS && i < pools.length; i++){
    const idx = G.effects.indexOf(pools[i]);
    if(idx >= 0) G.effects.splice(idx, 1);
  }
  G.effects.push({
    type:'ketchuppool', x, y,
    r: (spec.r || KET_R) * visionZoom(),
    life: spec.dur || KET_DUR, max: spec.dur || KET_DUR,
    tick: spec.tick || KET_TICK, next: 0.12,
    dmg: Math.max(1, Math.round(spec.dmg || KET_DMG)),
    slow: (spec.slow === undefined ? KET_SLOW : spec.slow),
    seat,
    seed: Math.random() * 6.283, // 纯视觉：酱泡相位随机，多滩酱不会整齐划一
  });
}
// 🪨 投石结算：一块石头落地 → 按颜色结算伤害（黄=单体最痛 / 蓝=范围+减速 / 红=范围爆炸）
function stoneLand(s){
  const C = STONE_COLORS[s.color] || STONE_COLORS.yellow;
  const owner = (G.players && G.players[s.seat]) || G.player;
  const splash = s.splash || 0;
  const R = C.radius + splash;
  const dmgMul = owner ? pCM(owner).dmgMul : 1;
  const critLv = owner ? (owner.skills.crit || 0) : 0;
  const matchMul = STONE_MATCH_MUL + 0.4 * (owner ? (owner.skills.s_match || 0) : 0); // 🎯 色感敏锐
  const bossMul = 1 + 0.25 * (owner ? (owner.skills.s_boss || 0) : 0);                // 🪓 破甲投掷
  const slowMul = C.slow < 1 ? Math.max(0.28, C.slow - 0.07 * (owner ? (owner.skills.s_slow || 0) : 0)) : 1;
  // 候选：落点范围内的怪（含 Boss，不含弹幕/无敌）
  const cands = [];
  for(const e of G.enemies){
    if(e.dead || e.dying || e.isBullet || e.invincible) continue;
    const d = Math.hypot(e.x - s.x, e.y - s.y);
    if(d > R + (e.r || 8)) continue;
    cands.push({ e, d });
  }
  // 🟡 黄石 = 单体最痛：圈内优先砸"同色"的那只（🎯2026-10-07 用户定）；没同色才砸最靠中心的
  let list = cands;
  if(C.slow === 1 && C.radius <= 60 && !splash){ // 黄石（半径最小、无减速）单体最痛；学了「碎石飞溅」后也变成小范围（2026-10-07 修：此前溅射等级被单体制吞掉）
    let pick = null;
    const same = cands.filter(c => stoneTagOf(c.e) === s.color);
    if(same.length){ same.sort((a, b) => a.d - b.d); pick = same[0]; } // 同色（可能好几只 → 取最靠落点的）
    else { cands.sort((a, b) => a.d - b.d); pick = cands[0] || null; }
    list = pick ? [pick] : [];
  }
  let best = 0, matched = 0;
  const might = owner ? (owner.skills.s_might || 0) : 0; // 🪨 巨石强化：所有颜色统一加伤
  for(const { e } of list){
    let dmg = (C.dmg + 14 * might) * roarMul(owner) * dmgMul;
    let crit = false;
    if(critLv > 0 && Math.random() < critLv / 5){ dmg *= (2.0 + critLv / 5); crit = true; }
    if(e.isBoss) dmg *= bossMul;                              // 对 Boss（只有学了破甲才 >1）
    if(stoneTagOf(e) === s.color){ dmg *= matchMul; matched++; } // 🎯 颜色匹配：额外重伤
    dmg = Math.max(1, Math.round(dmg));
    e.takeDamage(dmg, crit ? '#f60' : C.body, crit, s.seat);
    e.lastHitIdx = s.seat;
    // 落地冲击：往外推一把（体型越大越难推）
    const a = Math.hypot(e.x - s.x, e.y - s.y) > 1 ? Math.atan2(e.y - s.y, e.x - s.x) : rand(0, Math.PI*2);
    const mass = clamp(16 / Math.max(8, e.r), 0.4, 1.5);
    const kf = (C.key === 'yellow' ? 420 : 300) * mass * (e.isBoss ? 0.3 : 1);
    e.kbx += Math.cos(a) * kf;
    e.kby += Math.sin(a) * kf;
    // 🔵 蓝石：命中减速（写进 speed getter 的第三个减速通道）
    if(C.slow < 1){
      e.stoneSlowUntil = G.time + C.slowT;
      e.stoneSlowMul = slowMul;
    }
    if(dmg > best) best = dmg;
  }
  // ⚔️ 对战：落点范围内的对手玩家也吃伤害（同一套 PVP 折算）
  if(G.pvp){
    for(const q of (G.players || [])){
      if(!q || q.dead || q.seat === s.seat) continue;
      if(Math.hypot(q.x - s.x, q.y - s.y) > R + q.r) continue;
      q.takeDamage(Math.max(1, Math.round(C.dmg * PVP_DMG_MUL)), C.body);
    }
  }
  // 反馈：碎石粒子 + 震屏 + 匹配命中额外一声暴击音
  spawnParticles(s.x, s.y, C.body, matched > 0 ? 22 : 14);
  G.screenShake = Math.max(G.screenShake || 0, C.key === 'red' ? 9 : 6);
  SND.hit();
  SND.noise(0.10, 0.10, 900);
  if(matched > 0) SND.crit();
  G.effects.push({ type:'windburst', x:s.x, y:s.y, r:R, life:0.3, max:0.3 }); // 复用风爆光环（同一个扩散圈效果）
  if(owner){
    owner.stoneLastHit = best;
    owner.stoneMatch = matched;
    owner.stoneHitFx = 0.25;
  }
}
function updateStoneShots(dt){ // 🪨 抛物线飞行：落点就是出手的鼠标位置（不追踪），落地才结算
  if(!G.stoneShots) G.stoneShots = [];
  for(const s of G.stoneShots){
    s.t += dt;
    if(s.t >= s.dur){ stoneLand(s); s.dead = true; }
  }
  if(G.stoneShots.length) G.stoneShots = G.stoneShots.filter(s => !s.dead);
}
function drawStoneShots(){ // 🪨 抛物线绘制：石头按弧线升高 + 地面影子 + 落点预告圈
  if(!G.stoneShots || !G.stoneShots.length) return;
  for(const s of G.stoneShots){
    const C = STONE_COLORS[s.color] || STONE_COLORS.yellow;
    const k = clamp(s.t / s.dur, 0, 1);
    const x = s.sx + (s.x - s.sx) * k;
    const y = s.sy + (s.y - s.sy) * k;
    const h = STONE_ARC * 4 * k * (1 - k);  // 抛物线高度（起落为 0，中点为最高）
    // 落点预告圈（随飞行收缩）
    ctx.save();
    ctx.strokeStyle = C.body;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(s.x, s.y, (C.radius) * (0.5 + 0.5 * k), 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    // 地面影子（越接近落地越大越实）
    ctx.save();
    ctx.globalAlpha = 0.18 + 0.22 * k;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(x, y, STONE_SIZEW * 0.42, STONE_SIZEH * 0.34, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // 石头本体（升起的高度直接体现在屏幕上）
    ctx.save();
    ctx.translate(x, y - h);
    ctx.rotate(s.t * 10);
    ctx.fillStyle = C.body;
    ctx.fillRect(-STONE_SIZEW/2, -STONE_SIZEH/2, STONE_SIZEW, STONE_SIZEH);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2;
    ctx.strokeRect(-STONE_SIZEW/2, -STONE_SIZEH/2, STONE_SIZEW, STONE_SIZEH);
    ctx.strokeStyle = C.ring; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-STONE_SIZEW*0.3, 0); ctx.lineTo(STONE_SIZEW*0.3, 0); ctx.stroke();
    ctx.restore();
  }
}
function drawStoneTags(){ // 🪨 怪的"石头颜色"标记（2026-10-07 定稿：只保留右上角一个小方块，不画色环）
  // ① 只在场上有投石角色时画（没投石就不刷石头，标记纯属杂物）
  // ② 尺寸必须 ÷visionZoom()：👁️视野扩大会把整个世界一起缩小，
  //    以前按世界尺寸画 3.2px → 三级视野时屏幕上只剩 1.8px，"看不见"就是这么来的。
  //    除以缩放系数后，标记在屏幕上**恒定大小**，开不开视野都一样清楚。
  // ③ 色环已删（用户 2026-10-07：只留小方块）——怪的造型回归"圆 + 一圈白描边"，标记只做右上角一点色
  if(!stoneHeroOn()) return;
  const k = 1 / visionZoom();
  const BADGE_S = 12, BADGE_GAP = 7;
  for(const e of G.enemies){
    if(e.isBullet || e.dead || e.dying) continue;
    const tag = stoneTagOf(e);
    const C = STONE_COLORS[tag] || STONE_COLORS.yellow;
    const R = e.r;                   // 只用来定位：方块浮在怪本体右上方（本体造型不变）
    ctx.save();
    // 右上角实心色块：远看也醒目，近看颜色更确定（白描边 + 深色外衬 → 任何背景上都跳出来）
    const a = -Math.PI * 0.25;       // 右上 45°（canvas 里 y 向下，负角才是"上"）
    const ox = e.x + Math.cos(a) * (R + BADGE_GAP * k);
    const oy = e.y + Math.sin(a) * (R + BADGE_GAP * k);
    const s = BADGE_S * k;
    ctx.globalAlpha = 1;
    ctx.fillStyle = C.body;
    ctx.beginPath(); ctx.rect(ox - s/2, oy - s/2, s, s); ctx.fill();
    ctx.lineWidth = 2 * k; ctx.strokeStyle = '#fff';
    ctx.beginPath(); ctx.rect(ox - s/2, oy - s/2, s, s); ctx.stroke();
    ctx.lineWidth = 1.2 * k; ctx.strokeStyle = 'rgba(15,15,25,.7)';
    ctx.beginPath(); ctx.rect(ox - s/2 - 1.6*k, oy - s/2 - 1.6*k, s + 3.2*k, s + 3.2*k); ctx.stroke();
    ctx.restore();
  }
}
function drawStoneHUD(){ // 🪨 投石玩家：手里那块石头 + 装填进度环 + 超载提示
  for(const p of (multiOn() ? G.players : [G.player])){
    if(!p || !p.isStone || p.dead) continue;
    const a = angleTo(p, p.aimPoint());
    // 超载提示（踩到第二块时自伤）：文案就一句「双持！」（用户定，2026-10-07）
    if(p.stoneOverFx > 0){
      ctx.save();
      ctx.globalAlpha = clamp(p.stoneOverFx / 0.5, 0, 1);
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('双持！', p.x, p.y - p.r - 26);
      ctx.restore();
    }
    if(!p.stoneHold) continue;
    const C = STONE_COLORS[p.stoneHold.color] || STONE_COLORS.yellow;
    const k = clamp(1 - p.stoneLoad / Math.max(0.01, p.stoneLoadMax), 0, 1); // 装填进度 0→1
    // 装填进度环（绕身一圈，满即抛出）
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 11, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = C.body; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 11, -Math.PI/2, -Math.PI/2 + Math.PI*2*k); ctx.stroke();
    // 手里举着的那块石头（在朝向那一侧）
    const hx = p.x + Math.cos(a) * (p.r + 15), hy = p.y + Math.sin(a) * (p.r + 15) - 6;
    ctx.translate(hx, hy);
    ctx.rotate(a + 0.5);
    ctx.fillStyle = C.body;
    ctx.fillRect(-STONE_SIZEW*0.32, -STONE_SIZEH*0.32, STONE_SIZEW*0.64, STONE_SIZEH*0.64);
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.6;
    ctx.strokeRect(-STONE_SIZEW*0.32, -STONE_SIZEH*0.32, STONE_SIZEW*0.64, STONE_SIZEH*0.64);
    ctx.restore();
  }
}

// === PART 2: BOSSES, WAVES, SKILLS ===

// ===== BOSS BASE =====
// 🗡 是否有玩家在用剑士（1P/2P 任一为剑士即算，双人两个剑士也只算一次）
function meleeHeroOn(){
  return G.players.some(q => q && q.melee) || !!(G.player && G.player.melee);
}
// 🌌 弹幕反弹：碰到「有碰撞体积的东西」（墙 / 炮台 / 战车，不含其他怪）反弹一次（小怪棱光射手专用；Boss 弹幕不带 bounces 不触发）
function voidReflectBounce(b, dt){
  if(b.bounces > 0){
    // 墙体反弹（按出界分量单独翻向，避免斜角卡边）
    if(b.x < -20 || b.x > WW()+20 || b.y < -20 || b.y > WH()+20){
      if(b.x < -20 || b.x > WW()+20) b.vx = -b.vx;
      if(b.y < -20 || b.y > WH()+20) b.vy = -b.vy;
      b.x = clamp(b.x, -19, WW()+19); b.y = clamp(b.y, -19, WH()+19);
      b.bounces--; spawnParticles(b.x, b.y, b.color, 4);
      return true;
    }
    // 炮台（炮台有碰撞体积）
    if(G.turrets) for(const t of G.turrets){
      if(t.dead) continue;
      const rr = ENG_TURRET_R + b.r;
      if(dist(b, t) < rr){
        const nx = b.x - t.x, ny = b.y - t.y, L = Math.hypot(nx,ny)||1;
        const ux = nx/L, uy = ny/L, dot = b.vx*ux + b.vy*uy;
        b.vx -= 2*dot*ux; b.vy -= 2*dot*uy;
        b.x = t.x + ux*rr; b.y = t.y + uy*rr;
        b.bounces--; spawnParticles(b.x, b.y, b.color, 4);
        return true;
      }
    }
    // 战车（玩家在车里，战车有碰撞体积；不反弹玩家本体）
    for(const P of (multiOn() ? G.players : [G.player])){
      if(!P || P.dead || !P.veh) continue;
      const VR = 34, rr = VR + b.r;
      if(dist(b, P) < rr){
        const nx = b.x - P.x, ny = b.y - P.y, L = Math.hypot(nx,ny)||1;
        const ux = nx/L, uy = ny/L, dot = b.vx*ux + b.vy*uy;
        b.vx -= 2*dot*ux; b.vy -= 2*dot*uy;
        b.x = P.x + ux*rr; b.y = P.y + uy*rr;
        b.bounces--; spawnParticles(b.x, b.y, b.color, 4);
        return true;
      }
    }
  }
  return false;
}

class Boss extends Enemy {
  constructor(num, tier){
    tier = Math.max(1, tier || 1); // ♾ 无尽模式 Boss 轮回层数（1=第一轮）
    // 🌌 世界2 三 Boss 血量（与世界1 同阶持平，不堆肉——难度靠侵略走位+高频出招+五技能）：棱光八角2000 / 裂光十字3200 / 虚空裂界者3600
    const W2_BOSS_HP = { 6:2000, 7:3200, 8:3600, 9:3000 }; // 🌌 9=碎撞巨像（冲撞主题 Boss，仅世界2无尽模式登场）
    // 🌿 世界3 四 Boss 血量：万藤母巢2000 / 蚀光古树3200 / 蚀根龙王3600（第30波通关）/ 万秽之源3000（仅世界3无尽）
    //   与世界2 同阶持平——难度不靠堆肉，靠"地面持续伤害 + 召唤海 + 光束"三重夹击
    const W3_BOSS_HP = { 10:2000, 11:3200, 12:3600, 13:3000 };
    const baseHp = W3_BOSS_HP[num] || W2_BOSS_HP[num] || [2000, 3200, !G.endlessOn ? 3600 : 6000][num-1]; // Boss1=2000 / Boss2=3200 / Boss3：常规模式3600；♾无尽模式维持6000
    const hpMul = 1 + (tier - 1) * 0.9; // ♾ 轮回：每多一轮 Boss 血量 +90%（第2轮 1.9 倍…）
    let hp = Math.round(baseHp * hpMul);
    // 🗡 剑士放水：常规模式玩家用剑士时，第1个Boss（暗影领主）血量打8折（2000→1600）；♾无尽模式不放水
    if(num === 1 && !G.endlessOn && meleeHeroOn()) hp = Math.round(hp * 0.8);
    // 📉 常规模式第30波双Boss削弱：虚空主宰接触伤 35→28（♾无尽模式维持 20+num*5 = 35）
    const W2_BOSS_TOUCH = { 6:40, 7:50, 8:60, 9:55 }; // 🌌 世界2 四 Boss 接触伤（6=40 / 7=50 / 8=60 / 9=55；冲撞Boss靠贴身撞击吃饭）
    // 🌿 世界3 四 Boss 接触伤：母巢40 / 古树50 / 龙王60（最终）/ 万秽之源55（母巢不靠贴身，靠召唤海）
    const W3_BOSS_TOUCH = { 10:40, 11:50, 12:60, 13:55 };
    const touchDmg = (num === 3 && !G.endlessOn) ? 28 : (W3_BOSS_TOUCH[num] || W2_BOSS_TOUCH[num] || (20 + num*5));
    super(WW()/2, 80, hp, 80+num*15, touchDmg, 35, '#f0f'); // 👁️世界中心出生
    this.bossNum = num;
    this.tier = tier;
    this.phase = 0;
    this.attackTimer = 0;
    this.specialTimer = 0;
    this.bossNames = ['暗影领主', '熔岩巨兽', '虚空主宰', '', '', '棱光八角', '裂光十字', '虚空裂界者', '碎撞巨像',
      '万藤母巢', '蚀光古树', '蚀根龙王', '万秽之源']; // 🌿 世界3 四 Boss：10=万藤母巢(圆+放射尖刺) / 11=蚀光古树(正方形年轮墩) / 12=蚀根龙王(正三角) / 13=万秽之源(六边形)
    this.name = this.bossNames[num-1] + (tier > 1 ? ' · 第' + tier + '轮' : '');
    this.bodyColor = ['#c4f','#f80','#a4f','','','#3fd0ff','#ffcf3d','#ff2d55','#b06bff',
      '#57c15a','#8fae3a','#c2402f','#5e7a3a'][num-1]; // 🌿 世界3 四 Boss：母巢=腐绿 / 古树=橄榄绿 / 龙王=暗红 / 万秽之源=褐绿
    // Boss经验 = 玩家当前升级所需经验的1.2倍（始终能升一整级还余20%）
    this.xpNextMul = 1.2; // Boss宝石：按拾取者当前升级需求×1.2 结算（双人各自独立）
    this.isBoss = true;
    this.orbitT = 0;   // Boss3 远程风筝走位：环绕方向切换计时
    this.orbitDir = 1; // Boss3 远程风筝走位：当前环绕方向（+1 / -1）
    this.moveT = 0;    // 规律性移动的相位计时（Boss1正弦走位）
    this.casting = 0;  // 施法剩余秒数：>0 时定身（Boss2岩浆大招喷发期间）
    this.attackPattern = 0; // Boss2 大招轮换：0=岩浆 1=火焰喷射 2=熔岩环爆（仅狂暴）
    this.spAlt = false;     // Boss1 狂暴：大招轮换指针（影爆双环 / 暗影突进）
    this.shadowDash = null; // Boss1 狂暴新招「暗影突进」：{state:'tele'|'dash', t, dx, dy}
    this.ringWaves = null;  // Boss2 狂暴新招「熔岩环爆」：{t, wave, total} 波次队列
    this.lavaTrailT = 0;    // Boss2 狂暴：脚下留岩浆洼的计时
    this.bulletSpeedMul = 1; // 弹速基础倍率（Boss3 的 ×1.5 只在狂暴阶段生效，见 fireBullet）
    this.bhT = 0; this.bhActive = false; // 黑洞技能周期：开3秒关7秒（仅Boss3）
    this.summonT = 0; // Boss3 召唤计时：每2秒1个小怪在boss身边
  }
  update(dt){
    if(this.dead) return; // Boss已死：不再移动、不再放任何技能
    if(this.flash>0) this.flash -= dt;
    // ❄️ 冰冻（魔法师冰霜）：Boss **只吃「定身」**——rooted 由主循环回滚位移实现（招式照常出），
    //    这里只负责冰壳计时递减；下面这个 stun 分支是**暴击眩晕**（另一套控制）：定身 + 不出招
    //    口径（2026-10-06 用户定）：冰霜冻 Boss 是"冻住脚、冻不住嘴"，1.5 秒抗性窗口
    if(this.frozen > 0) this.frozen -= dt;
    if(this.dogHold > 0){ this.dogHold -= dt; return; } // 🐶 野生狗奶大招：Boss 也被完全冻结（动画期间不出招不移动）
    if(this.stun > 0){
      this.stun -= dt;
      if(this.kbx!==0 || this.kby!==0){ // 冻结期间击退照常衰减（被打飞的过程不冻结）
        this.x += this.kbx*dt; this.y += this.kby*dt;
        this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
        if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
      }
      return;
    }
    this.attackTimer += dt;
    this.specialTimer += dt;

    // movement: 每个Boss各有走位；施法（如Boss2岩浆喷发）期间定身不能移动
    if(this.casting > 0){
      this.casting -= dt;
    } else if(this.bossNum === 1){
      if(this.shadowDash){ /* 暗影突进预警/冲刺期间：走位由 boss1AI 接管（预警定身、冲刺直行） */ }
      else this.moveBoss1(dt); // 规律性正弦摆动
    } else if(this.bossNum === 2){
      this.moveBoss2(dt); // 缓慢追踪玩家
    } else if(this.bossNum === 6){
      this.moveBoss6(dt); // 🌌 棱光八角：悬浮缓慢追踪 + 侧移绕行
    } else if(this.bossNum === 7){
      this.moveBoss7(dt); // 🌌 裂光十字：慢速漂移，偏爱场地中上部
    } else if(this.bossNum === 8){
      this.moveBoss8(dt); // 🌌 虚空裂界者：贴身压迫 + 侧移绕行
    } else if(this.bossNum === 9){
      this.moveBoss9(dt); // 🌌 碎撞巨像：追踪逼近 + 冲撞/预警期间定身
    } else if(this.bossNum === 10){
      this.moveBoss10(dt); // 🌿 万藤母巢：扎根中央缓慢漂移（不追人，靠召唤海和弹幕）
    } else if(this.bossNum === 11){
      this.moveBoss11(dt); // 🌿 蚀光古树：极慢横向挪动 + 上下呼吸
    } else if(this.bossNum === 12){
      this.moveBoss12(dt); // 🌿 蚀根龙王：贴身压迫 + 龙息横扫
    } else if(this.bossNum === 13){
      this.moveBoss13(dt); // 🌿 万秽之源：场内游荡 + 定点污染
    } else {
      this.moveBoss3(dt); // 远程风筝走位：保持中距离+绕玩家环绕（虚空主宰专属，不冲撞）
    }

    // 击退（护盾可弹开Boss）：叠加在走位之上，指数衰减
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt;
      this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }

    // boss-specific attacks
    if(this.bossNum === 1) this.boss1AI(dt);
    else if(this.bossNum === 2) this.boss2AI(dt);
    else if(this.bossNum === 3) this.boss3AI(dt);
    else if(this.bossNum === 6) this.boss6AI(dt); // 🌌 棱光八角
    else if(this.bossNum === 7) this.boss7AI(dt); // 🌌 裂光十字
    else if(this.bossNum === 8) this.boss8AI(dt); // 🌌 虚空裂界者
    else if(this.bossNum === 9) this.boss9AI(dt); // 🌌 碎撞巨像
    else if(this.bossNum === 10) this.boss10AI(dt); // 🌿 万藤母巢
    else if(this.bossNum === 11) this.boss11AI(dt); // 🌿 蚀光古树
    else if(this.bossNum === 12) this.boss12AI(dt); // 🌿 蚀根龙王
    else if(this.bossNum === 13) this.boss13AI(dt); // 🌿 万秽之源

    // touch damage（boss：碰到谁谁掉血 + 击退玩家；双人：碰到谁谁掉血）
    if(this.touchCD>0) this.touchCD -= dt;
    if(this.touchCD<=0){
      const cands = bossHitTargets();
      for(const Q of cands){
        if(Q && dist(this, Q) < this.r + Q.r){
          Q.takeDamage(this.dmg, this); this.touchCD=0.8;
          pushPlayer(Q, this.x, this.y, 560); // boss体术击退
          break;
        }
      }
    }
  }
  // Boss 1 走位：普通阶段在顶部做正弦摆动（水平大范围往返+轻微上下起伏，轨迹可预测方便玩家预判）；
  // 暗影狂暴(phase2)改为全屏随机游走（快速换随机目标点，轨迹不可预测，配合暗影突进压迫全场）
  // ⚠️ 必须写成「轨迹增量」而不是直接赋绝对坐标（2026-10-06 修瞬移 bug）：
  //    主循环对 rooted（冰霜定身）的敌人做**整帧位移回滚**，若这里用 `this.x = 中心 + sin(moveT)*A`
  //    直接赋绝对坐标，冻结期间 moveT 照常推进 → 解冻那一帧坐标直接跳到公式当前值（实测跳 254~487px "瞬移"）。
  //    改成只吃「本帧的轨迹增量」后：轨迹形状完全不变，但被回滚时增量不会累积 → 解冻原地续走。
  moveBoss1(dt){
    if(this.phase >= 2){
      this.wanderT = (this.wanderT || 0) - dt;
      if(!this.wanderTarget || this.wanderT <= 0 || dist(this, this.wanderTarget) < 30){
        this.wanderTarget = {x: rand(140, WW()-140), y: rand(90, WH()-140)};
        this.wanderT = rand(0.8, 1.6); // 每0.8~1.6秒换一个全屏随机落点
      }
      const a = angleTo(this, this.wanderTarget);
      const sp = this.speed*2.2; // 狂暴游走速度约210，明显高于普通阶段
      this.x += Math.cos(a)*sp*dt;
      this.y += Math.sin(a)*sp*dt;
      this.x = clamp(this.x, this.r, WW()-this.r);
      this.y = clamp(this.y, 60, WH()-this.r);
      return;
    }
    this.moveT += dt;
    // 期望轨迹点（原来的正弦摆动，形状与幅度一字未改）
    const fx = clamp(WW()/2 + Math.sin(this.moveT*0.7)*(WW()/2-140), 110, WW()-110); // 👁️视野扩大：绕世界中心摆动
    const fy = clamp(110 + Math.sin(this.moveT*1.9)*45, 70, 200);
    if(this._mvX === undefined){ this._mvX = fx; this._mvY = fy; this.x = fx; this.y = fy; } // 首次：直接落到轨迹上
    this.x = clamp(this.x + (fx - this._mvX), 110, WW()-110); // 只吃这一帧的轨迹增量
    this.y = clamp(this.y + (fy - this._mvY), 70, 200);
    this._mvX = fx; this._mvY = fy;
  }
  // Boss 2 走位：缓慢追踪玩家，保持 150~280 中距离（岩浆大招施法期间 casting 定身，不调用本方法）
  moveBoss2(dt){
    const T = targetOf(this);
    const a = angleTo(this, T);
    const pd = dist(this, T);
    const sp = this.speed*0.45*(this.phase>=2 ? 1.25 : 1); // 熔岩狂暴（phase2）：移速+25%
    if(pd > 280){ this.x += Math.cos(a)*sp*dt; this.y += Math.sin(a)*sp*dt; }
    else if(pd < 150){ this.x -= Math.cos(a)*sp*dt; this.y -= Math.sin(a)*sp*dt; }
    this.x = clamp(this.x, this.r+10, WW()-this.r-10); // 👁️视野扩大：活动边界随世界扩大
    this.y = clamp(this.y, 60, WH()-this.r-10);
  }
  // Boss 3 走位：远程风筝——与玩家保持中距离并横向环绕（贴身冲撞是"小怪之怒"的活，虚空主宰只做远程）
  moveBoss3(dt){
    const T = targetOf(this);
    if(!T) return; // 无目标（双人全灭等）：原地不动
    const soft = !G.endlessOn;         // 📉 常规模式削弱：风筝机动性下降、换向更慢（更好预判）
    const rage = this.phase >= 2;      // 狂暴：压迫半径收窄、环绕更快、换向更频繁
    const near = rage ? 170 : 210;     // 比 near 更近 → 后撤
    const far  = rage ? 300 : 350;     // 比 far 更远 → 接近
    const sp = this.speed * (rage ? (soft ? 0.95 : 1.15) : (soft ? 0.72 : 0.9));
    const pd = dist(this, T);
    const ang = angleTo(this, T);
    // 环绕方向定时切换：避免一直同向绕圈被玩家预判走位
    this.orbitT -= dt;
    if(this.orbitT <= 0){
      this.orbitT = (rage ? (soft ? 2.3 : 1.6) : (soft ? 3.4 : 2.4)) + rand(0, 1.2);
      this.orbitDir = Math.random() < 0.5 ? -1 : 1;
    }
    const tanAng = ang + this.orbitDir*Math.PI/2;
    // 径向分量：太近→后退，太远→靠近，舒适带→纯环绕
    let radial = 0;
    if(pd < near) radial = -1.5;
    else if(pd > far) radial = 1.0;
    let vx = Math.cos(ang)*radial + Math.cos(tanAng);
    let vy = Math.sin(ang)*radial + Math.sin(tanAng);
    const m = Math.hypot(vx, vy) || 1; // 归一化：合成速度恒定，不会因叠加而变快
    this.x += vx/m*sp*dt;
    this.y += vy/m*sp*dt;
    // 边界钳制（👁️视野扩大：活动边界随世界扩大）；贴着墙时切向分量仍保留 → 沿墙滑走而不是被卡在墙角
    this.x = clamp(this.x, this.r+10, WW()-this.r-10);
    this.y = clamp(this.y, this.r+10, WH()-this.r-10);
  }
  // Boss 1: bullet fan patterns + 暗影狂暴（25% 血：影爆双环 + 暗影突进）
  boss1AI(dt){
    // 🗡 剑士放水：常规模式玩家用剑士打第1个Boss时，暗影领主明显手下留情——
    //   攻击/大招间隔 ×1.5、弹速 ×0.8、暗影突进预警 0.6s→1.0s（更好躲）；♾无尽模式不放水
    const mercy = (!G.endlessOn && meleeHeroOn()) ? 1.5 : 1;
    const mercySpd = mercy > 1 ? 0.8 : 1;
    // ===== 阶段推进（一次性）：50% → phase1；25% → phase2 暗影狂暴 =====
    if(this.phase === 0 && this.hp < this.maxHp*0.5) this.phase = 1;
    if(this.phase === 1 && this.hp < this.maxHp*0.25){
      this.phase = 2;
      this.attackTimer = 0; this.specialTimer = 0;
      SND.bossWarn(); G.screenShake = 12; // 暗影狂暴警报
    }
    // ===== 狂暴新招「暗影突进」：预警（定身+方向虚线）→ 锁定玩家高速冲刺，起步放一圈影弹 =====
    if(this.shadowDash){
      const sd = this.shadowDash;
      sd.t -= dt;
      if(sd.state === 'tele'){
        if(sd.t <= 0){
          sd.state = 'dash'; sd.t = 0.5;
          for(let i=0;i<16;i++){ // 起步环形影弹
            const a = i/16*Math.PI*2 + rand(0,0.3);
            this.fireBullet(Math.cos(a)*190, Math.sin(a)*190, 6, '#d6f');
          }
          G.screenShake = 10;
        }
        return; // 预警期间定身、停火
      }
      // 冲刺：沿锁定方向直行（接触伤害/击退由通用 touch 结算，撞到就是一下）
      this.x = clamp(this.x + sd.dx*430*dt, this.r, WW()-this.r);
      this.y = clamp(this.y + sd.dy*430*dt, 60, WH()-this.r);
      if(sd.t <= 0){
        spawnParticles(this.x, this.y, '#c4f', 12); // 影子消散
        this.shadowDash = null; // 狂暴走位已是全屏随机游走，冲刺结束原地衔接即可（无需回归正弦轨迹）
      }
      return; // 冲刺期间停火
    }
    // 普攻：扇形弹（狂暴后间隔更短、弹数更多、弹速更快）
    const fanCd = (this.phase >= 2 ? 0.75 : 1.2) * mercy;
    const fanN = [8, 10, 12][this.phase];
    const fanSpd = (this.phase >= 2 ? 260 : 220) * mercySpd;
    if(this.attackTimer > fanCd){
      this.attackTimer = 0;
      const baseA = angleTo(this, targetOf(this));
      for(let i=0;i<fanN;i++){
        const a = baseA + (i-fanN/2)*0.25;
        this.fireBullet(Math.cos(a)*fanSpd, Math.sin(a)*fanSpd, 6, '#f6c');
      }
    }
    // 大招：狂暴后轮换「影爆双环 / 暗影突进」；狂暴前保持单圈环爆
    const spCd = (this.phase >= 2 ? 3.2 : 4) * mercy;
    if(this.specialTimer > spCd){
      this.specialTimer = 0;
      if(this.phase >= 2){
        if(this.spAlt){
          this.shadowRings();
        } else {
          SND.warnUp(); // 突进预警音
          const a = angleTo(this, targetOf(this));
          this.shadowDash = {state:'tele', t: mercy > 1 ? 1.0 : 0.6, dx:Math.cos(a), dy:Math.sin(a)};
        }
        this.spAlt = !this.spAlt;
      } else {
        // radial burst（单圈 24 发）
        for(let i=0;i<24;i++){
          const a = i/24*Math.PI*2;
          this.fireBullet(Math.cos(a)*180, Math.sin(a)*180, 8, '#f0f');
        }
      }
    }
  }
  // 影爆双环：内外两圈共 36 发、错半步角，内圈慢外圈快（暗影狂暴专属）
  shadowRings(){
    for(let i=0;i<18;i++){
      const a = i/18*Math.PI*2;
      this.fireBullet(Math.cos(a)*210, Math.sin(a)*210, 7, '#f0f');
    }
    for(let i=0;i<18;i++){
      const a = (i+0.5)/18*Math.PI*2;
      this.fireBullet(Math.cos(a)*165, Math.sin(a)*165, 5, '#c8f');
    }
  }
  // Boss 2: summon minions + magma eruption + flame spray + 熔岩狂暴（大招轮换，限制走位）
  boss2AI(dt){
    // ===== 阶段推进（一次性）：40% → 狂暴（大招更频繁）；20% → 熔岩狂暴（新招）=====
    if(this.phase === 0 && this.hp < this.maxHp*0.4){
      this.phase = 1;
      this.attackTimer = 0; this.specialTimer = 0;
      SND.bossWarn(); // 狂暴：大招频率提升
    }
    if(this.phase === 1 && this.hp < this.maxHp*0.2){
      this.phase = 2;
      this.attackTimer = 0; this.specialTimer = 0;
      this.lavaRainT = 1.5; // 狂暴落地即开始第一轮熔岩火雨
      SND.bossWarn();
      G.screenShake = 12;
    }
    // ===== 熔岩狂暴新招「熔岩环爆」：3 波环形弹幕，在自身施法定身期间逐波放出 =====
    if(this.ringWaves){
      this.ringWaves.t -= dt;
      if(this.ringWaves.t <= 0){
        const n = 14;
        for(let i=0;i<n;i++){
          const a = i/n*Math.PI*2 + this.ringWaves.wave*(Math.PI/n); // 每波错开半步角，形成交错的弹幕网
          this.fireBullet(Math.cos(a)*170, Math.sin(a)*170, 7, '#fd5');
        }
        this.ringWaves.wave++;
        this.ringWaves.t = 0.3;
        if(this.ringWaves.wave >= this.ringWaves.total) this.ringWaves = null;
      }
    }
    // ===== 熔岩狂暴新机制「熔岩火雨」：在玩家附近随机落6颗熔岩弹（0.7s预警圈→爆炸范围伤害）=====
    // 打的是玩家所在区域而非Boss自身路径，逼玩家持续走位（Boss2自身移速慢，走过留洼意义不大，已替换）
    if(this.phase >= 2){
      this.lavaRainT -= dt;
      if(this.lavaRainT <= 0){
        this.lavaRainT = 3.2;
        const T = targetOf(this);
        for(let i=0;i<6;i++){
          G.effects.push({
            type:'meteor', fromBoss:true,
            x: clamp(T.x + rand(-170,170), 30, WW()-30),
            y: clamp(T.y + rand(-170,170), 60, WH()-30),
            r: 46*visionZoom(), life:1.0, max:1.0, dmg:12, // 👁️爆炸半径随视野缩放
          });
        }
        SND.warnUp(); // 落点预警音
      }
    }
    // 施法（岩浆喷发/火焰喷射/熔岩环爆）期间定身且暂停普攻
    if(this.casting <= 0 && this.attackTimer > 0.65){
      this.attackTimer = 0;
      // aimed shots（熔岩狂暴：3 连发 → 5 连发）
      const shots = this.phase >= 2 ? 5 : 3;
      for(let i=0;i<shots;i++){
        const a = angleTo(this, targetOf(this)) + (i-(shots-1)/2)*0.2;
        this.fireBullet(Math.cos(a)*280, Math.sin(a)*280, 7, '#f80');
      }
    }
    const cd = this.phase === 2 ? 3.0 : (this.phase === 1 ? 3.5 : 4.5); // 狂暴后大招更频繁
    // 施法期间不开新大招（specialTimer 照常累计，施法一结束立刻接上）
    if(this.casting <= 0 && this.specialTimer > cd){
      this.specialTimer = 0;
      if(this.attackPattern === 0){
        // ===== 岩浆大招：召唤3小怪 + 5道Z字型岩浆柱 =====
        for(let i=0;i<3;i++){
          const ang = i/3*Math.PI*2 + rand(0,1);
          const ex = this.x + Math.cos(ang)*60;
          const ey = this.y + Math.sin(ang)*60;
          const e = new Enemy(ex, ey, 30+G.wave*3, 120, 8, 12, '#f60');
          G.enemies.push(e);
        }
        G.effects.push(this.magmaBurst());
        this.casting = 3; // 喷发期间定身3秒
        this.attackPattern = 1;
      } else if(this.attackPattern === 1 || this.phase < 2){
        // ===== 火焰喷射：锥形火焰，近端高DPS远端低DPS（0.8s预警后缓慢延伸）=====
        G.effects.push(this.flameSpray());
        this.casting = 3.4; // 喷射期间定身3.4秒（含0.8s预警+2.6s喷射）
        this.attackPattern = this.phase >= 2 ? 2 : 0;
      } else {
        // ===== 熔岩狂暴新招「熔岩环爆」：0.4s 预警后 3 波环形弹幕，定身 2.2s =====
        SND.warnUp(); // 预警音
        this.casting = 2.2;
        this.ringWaves = {t:0.4, wave:0, total:3};
        this.attackPattern = 0;
      }
    }
  }
  // 岩浆大招：以自身为中心向5个方向喷发Z字型岩浆柱（1道锁定玩家+4道随机），延伸至屏幕边缘，DPS 50，不可被盾抵挡
  magmaBurst(){
    SND.warnUp(); // 预警音（0.5s内路径提示，然后才喷发）
    const aimA = angleTo(this, targetOf(this)); // 双人：锁定最近存活玩家
    const beams = [];
    for(let i=0;i<5;i++){
      let ang;
      if(i === 0){
        ang = aimA; // 必定朝向玩家
      } else {
        // 随机方向，避开与锁定方向过近（防止多道重叠成一道）
        do {
          ang = rand(0, Math.PI*2);
        } while(Math.abs(Math.atan2(Math.sin(ang-aimA), Math.cos(ang-aimA))) < 0.35);
      }
      // 沿初始方向到屏幕边缘的射线距离（保证岩浆能延伸到屏幕边缘；👁️视野扩大：按扩大后世界计算）
      let maxDist = Infinity;
      const dxx = Math.cos(ang), dyy = Math.sin(ang);
      if(dxx > 1e-6) maxDist = Math.min(maxDist, (WW()-this.x)/dxx);
      if(dxx < -1e-6) maxDist = Math.min(maxDist, (-this.x)/dxx);
      if(dyy > 1e-6) maxDist = Math.min(maxDist, (WH()-this.y)/dyy);
      if(dyy < -1e-6) maxDist = Math.min(maxDist, (-this.y)/dyy);
      maxDist = Math.max(maxDist, 150); // 兜底：即便贴墙也不至于太短
      // Z字型折线：3段按 maxDist 比例分配（总长约1.35×maxDist，拐弯损失投影后最远点仍能覆盖屏幕边缘）
      // 👁️视野扩大：maxDist 已按扩大后世界计算（喷到新边缘），不再额外缩放
      const bendDir = (i % 2 === 0) ? 1 : -1; // 交替拐弯方向使视觉更丰富
      const segLens = [maxDist*0.5+rand(0,40), maxDist*0.35+rand(0,30), maxDist*0.5+rand(0,40)];
      const bends = [0, bendDir*rand(0.55,0.8), -bendDir*rand(0.55,0.8)];
      // 预计算折线端点
      const pts = [{x:this.x, y:this.y}];
      let cx = this.x, cy = this.y, ca = ang;
      for(let s=0;s<3;s++){
        ca += bends[s];
        cx += Math.cos(ca)*segLens[s];
        cy += Math.sin(ca)*segLens[s];
        pts.push({x:cx, y:cy});
      }
      const totalLen = segLens[0]+segLens[1]+segLens[2];
      beams.push({ang, len:0, pts, segLens, totalLen, visSegs:[]});
    }
    return {type:'magma', fromBoss:true, x:this.x, y:this.y, life:3.6, max:3.6, dmg:50, extendSpeed:450,
      state:'warn', warnT:0.5, warnMax:0.5, // 预警0.5s：虚线预告5道路径，之后才开始延伸
      beams};
  }
  // 火焰喷射：以自身为圆心向玩家方向喷锥形火焰，近端DPS高远端低，持续追踪玩家，延伸至屏幕边缘，不可被盾抵挡
  flameSpray(){
    SND.warnUp(); // 预警音（0.8s内角度锁定+危险区提示，然后才喷射）
    const aimA = angleTo(this, targetOf(this)); // 双人：锁定最近存活玩家
    return {
      type:'flameSpray', fromBoss:true, x:this.x, y:this.y,
      aim: aimA, range: Math.hypot(W,H)/visionZoom(), halfAngle:0.42, // 范围=扩大后世界对角线（👁️视野扩大：喷到新边缘）
      life:3.4, max:3.4, dpsNear:35, dpsFar:8,
      followRate:1.2, // 激活后火焰追踪速度（rad/s）
      state:'warn', warnT:0.8, warnMax:0.8, // 预警0.8s：角度锁定+闪烁虚线危险区
      extLen:0, extendSpeed:675, // 缓慢延伸：1.5×岩浆速度(450)
    };
  }
  // Boss 3: multi-phase, radial + charge + summon + 黑洞
  boss3AI(dt){
    const soft = !G.endlessOn; // 📉 常规模式削弱：黑洞周期拉长/范围缩小、召唤变慢、弹幕更疏更慢（♾无尽模式维持原强度）
    // ===== 黑洞技能：开启3秒。周期——狂暴10s（原样）/ 平时15s（削弱平时强度）=====
    const bhCycle = this.phase >= 2 ? (soft ? 14 : 10) : (soft ? 20 : 15);
    this.bhT += dt;
    if(this.bhT >= bhCycle){ this.bhT = 0; this.bhActive = false; }
    if(this.bhT < 3 && !this.bhActive){
      this.bhActive = true;
      SND.bossWarn(); // 黑洞开启预警音
      G.effects.push({
        type:'blackhole', fromBoss:true, x:WW()/2, y:WH()/2, r:G.player.r*(soft ? 4 : 5)*visionZoom(), // 世界中心（👁️），直径=玩家4/5倍
        life:3, max:3,
      });
    }
    // 召唤小怪（30%紫色精英 / 70%七种普通小怪各10%）：狂暴2s/只，平时3.2s/只（削弱平时强度）
    this.summonT -= dt;
    if(this.summonT <= 0){
      this.summonT = this.phase >= 2 ? (soft ? 2.8 : 2) : (soft ? 4.4 : 3.2);
      this.spawnWrathMinion();
    }
    if(this.phase === 0){
      // phase 1: spiral bullets
      if(this.attackTimer > (soft ? 0.45 : 0.3)){
        this.attackTimer = 0;
        const a = G.time * 4;
        const sspd = soft ? 175 : 200;
        for(let i=0;i<4;i++){
          const sa = a + i*Math.PI/2;
          this.fireBullet(Math.cos(sa)*sspd, Math.sin(sa)*sspd, 6, '#a6f');
        }
      }
      if(this.specialTimer > 6){
        this.specialTimer = 0;
        this.phase = 1;
      }
    } else if(this.phase === 1){
      // phase 2: 远程压制（原冲撞已移除，虚空主宰只做远程）——瞄准三连发
      if(this.specialTimer > (soft ? 2.8 : 2.2)){
        this.specialTimer = 0;
        const baseA = angleTo(this, targetOf(this)); // 瞄准最近存活玩家
        const tspd = soft ? 205 : 230;
        for(let i=0;i<3;i++){
          const a = baseA + (i-1)*0.18; // 对称 3 发（0.18 rad 间距，节拍间留可躲缝隙）
          this.fireBullet(Math.cos(a)*tspd, Math.sin(a)*tspd, 6, '#a6f');
        }
      }
      if(this.attackTimer > (soft ? 0.85 : 0.6)){
        this.attackTimer = 0;
        // ring of bullets
        const ringN = soft ? 12 : 16;
        const rspd = soft ? 160 : 180;
        for(let i=0;i<ringN;i++){
          const a = i/ringN*Math.PI*2 + G.time;
          this.fireBullet(Math.cos(a)*rspd, Math.sin(a)*rspd, 5, '#c8f');
        }
      }
      if(this.hp < this.maxHp*0.5 && !G.cutscene && !G.wrathBoss){
        this.phase = 2; // 半血：触发"小怪之怒"剧情（召唤7种小怪各1+围圈旋转收缩）
        startWrathCutscene();
      }
    } else {
      // phase 3: all-out
      if(this.attackTimer > (soft ? 0.55 : 0.4)){
        this.attackTimer = 0;
        const count = 4; // 扇形普攻 4 连发（原 6 连发弹幕太密躲不掉；角度对称分布留出缝隙）
        const baseA = angleTo(this, targetOf(this));
        const fspd = soft ? 220 : 250;
        for(let i=0;i<count;i++){
          const a = baseA + (i-(count-1)/2)*0.22;
          this.fireBullet(Math.cos(a)*fspd, Math.sin(a)*fspd, 7, '#f8f');
        }
      }
      if(this.specialTimer > (soft ? 3.6 : 3)){
        this.specialTimer = 0;
        // radial burst（召唤已改为每秒1个，独立计时）
        const burstN = soft ? 16 : 20;
        const bspd = soft ? 175 : 200;
        for(let i=0;i<burstN;i++){
          const a = i/burstN*Math.PI*2;
          this.fireBullet(Math.cos(a)*bspd, Math.sin(a)*bspd, 8, '#f0c');
        }
      }
    }
  }
  // Boss3 召唤：每2秒1个在boss身边。30%召唤原紫色精英怪，其余70%在7种普通小怪中随机（每种10%）
  spawnWrathMinion(){
    const hpScale = 1 + G.wave * (!G.endlessOn ? 0.10 : 0.15); // 👁️/📉 常规模式削弱：召唤怪血量成长放缓（30波 5.5倍 → 4.0倍）
    const ex = this.x + rand(-70,70), ey = this.y + rand(-35,35);
    if(Math.random() < 0.30){
      G.enemies.push(new Enemy(ex, ey, 40+G.wave*3, 140, 8, 12, '#c4f'));
    } else {
      const t = Math.floor(Math.random()*7);
      if(t===0)      G.enemies.push(new Enemy(ex, ey, 25*hpScale, 110, 10, 15, '#f44'));   // 普通怪
      else if(t===1) G.enemies.push(new Enemy(ex, ey, 15*hpScale, 180, 8, 10, '#fa4'));   // 快速怪
      else if(t===2) G.enemies.push(new Enemy(ex, ey, 50*hpScale, 70, 15, 22, '#84f'));   // 坦克怪
      else if(t===3) G.enemies.push(new RangedEnemy(ex, ey, hpScale));                     // 远程怪
      else if(t===4) G.enemies.push(new SlimeEnemy(ex, ey, hpScale));                      // 粘液怪
      else if(t===5) G.enemies.push(new ChargerEnemy(ex, ey, hpScale));                    // 冲撞怪
      else           G.enemies.push(new LaserEnemy(ex, ey, hpScale));                      // 激光怪
    }
  }
  fireBullet(vx,vy,r,color,dmg){ // 🌌 dmg 可选：世界2 Boss 指定弹幕伤害（不传则沿用 8+bossNum*2）
    // Boss3 虚空主宰：弹速×1.5 只在狂暴阶段(phase>=2)生效，平时保持常速（平衡：平时强度不该逼近狂暴）
    // 📉 常规模式削弱：狂暴弹速倍率 ×1.5 → ×1.3、弹幕伤害 14 → 11（♾无尽模式维持原样）
    const soft = this.bossNum === 3 && !G.endlessOn;
    const spdMul = (this.bulletSpeedMul || 1) * (this.bossNum === 3 && this.phase >= 2 ? (soft ? 1.3 : 1.5) : 1);
    vx *= spdMul; vy *= spdMul;
    G.enemies.push({
      isBullet:true, fromBoss:true, owner:this, x:this.x, y:this.y, vx, vy, r:r||6,
      hp:999, maxHp:999, dead:false, flash:0, dmg: dmg || (soft ? 11 : 8+this.bossNum*2),
      color:color||'#f6c', touchCD:0, speed:0, bounces:0,
      update(dt){
        this.x += this.vx*dt; this.y += this.vy*dt;
        if(voidReflectBounce(this, dt)) return; // 🌌 有反弹资格（bounces>0）的弹幕：碰墙/炮台/战车反弹一次
        if(this.x<-20||this.x>WW()+20||this.y<-20||this.y>WH()+20){
          this.dead = true; // 👁️ 视野扩大：弹幕出界按扩大后世界（无反弹资格直接消失）
        }
        const sh = shieldOrbHit(this.x, this.y, this.r); // 弹幕必须碰到盾球才被抵挡（判定半径=绘制世界半径）
        if(sh){ // 弹幕撞上盾球：在盾球处消失+特效音效，玩家不受伤
          this.dead = true;
          SND.shieldBlock();
          sh.owner.shieldFlash = 0.15; // 谁的盾球挡的闪谁的
          spawnParticles(sh.x, sh.y, '#8ff', 8);
          return;
        }
        if(this.touchCD>0) this.touchCD -= dt;
        // 双人：检查所有存活玩家，谁被撞谁掉血
        const cands = bossHitTargets();
        for(const P of cands){
          if(!P) continue;
          if(this.touchCD<=0 && dist(this,P) < this.r + P.r){ // 弹幕命中=绘制世界半径（不再乘视野缩放，避免"看着没碰到却掉血"）
            P.takeDamage(this.dmg, this); this.touchCD=0.5;
            break;
          }
        }
      },
      draw(){
        ctx.fillStyle=this.color;
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
      },
      takeDamage(){}, // bullets can't be killed by player
    });
  }
  takeDamage(d, color, isCrit){
    if(this.invincible) return; // 🌌 棱镜护盾期间无敌（棱光八角）
    this.hp = Math.max(0, this.hp - d); // 血量下限0：Boss 被暴击过量也不会出现负血量（顶部血条宽度变负会失效）
    if(G.showDamage) spawnDamageText(this.x, this.y - this.r - 4, d, color || '#fff', isCrit, false); // 🔢 对 Boss 造成伤害：白色/暴击色数字（基类被重写，这里手动补）
    this.flash = 0.08;
    if(isCrit) this.critShake = 0.3; // 暴击：顶部血条颤动
    if(this.hp <= 0){
      if(isCrit){
        // 暴击致死：身体颤动后再真正死亡
        this.dying = true;
        this.deathShake = 0.35;
        this.critShake = 0.35;
      } else {
        this.die();
      }
    }
  }
  die(){
    if(this.dead) return;
    this.dead = true;
    // Boss死亡：立即清除它产生的一切攻击（岩浆/火焰持续效果 + 空中弹幕），不留"死了还在放技能"
    G.effects = G.effects.filter(ef => !ef.fromBoss);
    G.enemies = G.enemies.filter(e => !e.fromBoss);
    // Boss宝石：Boss身体颜色，尺寸2倍（r=14），拾取有专属音效
    const bg = new ExpGem(this.x, this.y, 0, this.bodyColor, 14, true); // Boss宝石：价值按拾取者需求动态结算
    bg.xpNextMul = this.xpNextMul; // 关键：把 ×1.2 倍率传给宝石（否则宝石 val=0 → 捡了没经验）
    G.gems.push(bg);
    spawnParticles(this.x, this.y, this.bodyColor, 30);
    healOnKill(this.lastHitIdx); // 挑战模式吸血（双人按击杀归属结算）
    G.screenShake = 20;
    // boss defeated
    const waitWrath = (G.bossNum === 3) && !isFinalBossWave(); // 第3个Boss半血会招出小怪之怒（无尽轮回同样触发）
    if(isFinalBossWave()){
      // 最终Boss（普通模式第30波）：双Boss都死才算通关；若小怪之怒还活着则继续战斗
      if(!G.wrathBoss || G.wrathBoss.dead){
        winGame();
      }
    } else if(waitWrath && G.wrathBoss && !G.wrathBoss.dead){
      // ♾ 无尽模式：小怪之怒仍在场，等它被击杀后再推进（推进由它的 die 负责）
    } else {
      G.inBossWave = false;
      document.getElementById('boss-bar-wrap').style.display='none';
      G.wave++; // advance past boss wave
      startWave(G.wave);
    }
  }
  // 🌌 棱光八角走位：悬浮缓慢追踪 + 侧移绕行（不瞬移、不滚动）
  moveBoss6(dt){
    if(this.b6spikeT > 0) return; // 尖角突刺期间：突进由 boss6AI 自己处理
    const P = targetOf(this); if(!P) return;
    const d = dist(this, P), a = angleTo(this, P);
    const sp = this.speed*0.9;
    if(d > 240){ this.x += Math.cos(a)*sp*dt; this.y += Math.sin(a)*sp*dt; } // 远了猛追（侵略性）
    else if(d < 120){ this.x -= Math.cos(a)*sp*0.7*dt; this.y -= Math.sin(a)*sp*0.7*dt; } // 仅贴脸才后撤
    else {
      if(this.b6side === undefined) this.b6side = 1;
      const sa = a + Math.PI/2*this.b6side;
      this.x += Math.cos(sa)*sp*dt; this.y += Math.sin(sa)*sp*dt; // 侧移绕行
      this.x += Math.cos(a)*sp*0.4*dt; this.y += Math.sin(a)*sp*0.4*dt; // 环走同时收拢施压
      this.b6sideT = (this.b6sideT||0) - dt;
      if(this.b6sideT <= 0){ this.b6sideT = rand(1.2, 2.2); this.b6side *= -1; } // 换向更勤
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
  }
  // 🌌 棱光八角主动技：每 ~2.2s 轮换一招（攻击频率提升；棱光环爆 → 棱镜护盾 → 棱光潮汐 → 棱镜召唤 → 尖角突刺）
  boss6AI(dt){
    // 棱镜护盾：期间无敌 + 每 0.4s 甩一圈弹幕；护盾结束瞬间释放爆发环
    if(this.b6shield > 0){
      this.b6shield -= dt; this.b6shieldT = (this.b6shieldT||0) - dt;
      if(this.b6shieldT <= 0){
        this.b6shieldT = 0.4; const n = 8;
        for(let i=0;i<n;i++){ const a = i/n*Math.PI*2 + G.time; this.fireBullet(Math.cos(a)*260, Math.sin(a)*260, 6, '#7df', 20); }
      }
      if(this.b6shield <= 0){
        const n = 20; for(let i=0;i<n;i++){ const a = i/n*Math.PI*2; this.fireBullet(Math.cos(a)*340, Math.sin(a)*340, 7, '#3fd0ff', 22); }
        this.invincible = false; // 护盾结束：解除无敌
        SND.bossWarn();
      }
      return;
    }
    // 🌌 尖角突刺（⑤技能激活中）：角刺伸出窗口，朝玩家小幅突进 + 扎伤 + 震碎范围弹幕
    if(this.b6spikeT > 0){
      this.b6spikeT -= dt;
      if(this.b6spikeA === undefined) this.b6spikeA = 0;
      this.x = clamp(this.x + Math.cos(this.b6spikeA)*180*dt, this.r, WW()-this.r);
      this.y = clamp(this.y + Math.sin(this.b6spikeA)*180*dt, this.r, WH()-this.r);
      const L = this.b6spikeLen || (200*visionZoom()), hA = 0.12; // 🌌 尖角突刺：命中半角收窄到 ±6.9°（8 根只占 ~110°，留出 250° 安全区，可走位躲），不再 312° 必中
      const cands = bossHitTargets();
      for(const Q of cands){
        if(!Q) continue;
        const d = dist(this, Q);
        if(d > this.r + L || d < this.r*0.4) continue;
        const pa = Math.atan2(Q.y - this.y, Q.x - this.x);
        let hit = false;
        for(let i=0;i<8;i++){
          const sa = Math.PI/8 + i/8*Math.PI*2;
          let diff = pa - sa; while(diff>Math.PI) diff-=2*Math.PI; while(diff<-Math.PI) diff+=2*Math.PI;
          if(Math.abs(diff) < hA){ hit = true; break; }
        }
        if(hit){
          const key = (Q.seat !== undefined) ? Q.seat : 'p';
          if(!this.b6spikeHits[key]){ Q.takeDamage(40, this); this.b6spikeHits[key] = true; spawnParticles(Q.x, Q.y, '#bff3ff', 8); }
        }
      }
      return;
    }
    this.invincible = false; // 非护盾期：解除无敌（仅护盾分支内为 true）
    this.b6t = (this.b6t || 0) + dt;
    if(this.b6t < 2.2) return;
    this.b6t = 0;
    const step = (this.b6step || 0) % 5;
    this.b6step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 棱光环爆：一圈 18 发青蓝弹幕（螺旋相位）
      const n = 18 + (this.tier >= 2 ? 4 : 0);
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + G.time*0.7;
        this.fireBullet(Math.cos(a)*320, Math.sin(a)*320, 7, '#3fd0ff', 22);
      }
      SND.bossWarn();
    } else if(step === 1){ // ② 棱镜护盾：无敌 2.0s + 自旋甩弹幕（防御反击）
      this.b6shield = 2.0; this.b6shieldT = 0; this.invincible = true; SND.bossWarn();
    } else if(step === 2){ // ③ 棱光潮汐：青蓝扩散冲击波（掉血，无抽取）
      G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
        r: 300*visionZoom(), life:0.9, max:0.9, tick:0, dmg:28, drain:0, rgb:'63,208,255' });
      SND.bossWarn();
    } else if(step === 3){ // ④ 棱镜召唤：召 2~3 棱光射手 + 1 裂隙冲撞者
      const n = 2 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++){
        G.enemies.push(new PrismShooter(this.x + rand(-60,60), this.y + rand(-60,60), enemyHpScale(G.wave)));
      }
      G.enemies.push(new RiftCharger(this.x + rand(-60,60), this.y + rand(-60,60), enemyHpScale(G.wave)));
      SND.bossWarn();
    } else { // ⑤ 尖角突刺：八枚角刺扎向玩家 + 震碎范围内部分弹幕
      const tP = targetOf(this);
      this.b6spikeT = 0.6;                              // 角刺伸出窗口
      this.b6spikeA = tP ? angleTo(this, tP) : 0;       // 朝玩家方向突进（扎向玩家）
      this.b6spikeHits = {};                            // 本次突刺的命中记录（每人仅扎一次）
      this.b6spikeLen = 210 * visionZoom();
      const shatterR = 260 * visionZoom();              // 震碎范围内部分弹幕
      for(const e of G.enemies){
        if(e.isBullet && !e.dead && dist(e, this) < shatterR){ e.dead = true; spawnParticles(e.x, e.y, '#bff3ff', 3); }
      }
      SND.bossWarn();
    }
  }
  // 🌌 裂光十字走位：主动贴身追咬（不再只盘踞中上部）
  moveBoss7(dt){
    if(this.b7charge || this.b7slash) return; // 冲撞/十字斩期间：位移由对应分支处理
    if(this.b7spin === undefined) this.b7spin = 0;
    this.b7spin += dt*1.2; // 核心持续自转（绘制用相位）
    const P = targetOf(this);
    const sp = this.speed*1.0;
    if(P){
      const dx = P.x - this.x, dy = P.y - this.y; // 直接朝玩家位置逼近，压迫感拉满
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), sp*dt);
      this.y = clamp(this.y + Math.sign(dy) * Math.min(Math.abs(dy), sp*0.85*dt), this.r, WH()-this.r);
    } else {
      if(this.b7dir === undefined) this.b7dir = 1;
      this.x += this.b7dir*sp*dt;
      if(this.x < WW()*0.1){ this.x = WW()*0.1; this.b7dir = 1; }
      if(this.x > WW()*0.9){ this.x = WW()*0.9; this.b7dir = -1; }
      this.y = clamp(this.y + (WH()/2 - this.y)*Math.min(1, dt*3), this.r, WH()-this.r);
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
  }
  // 🌌 裂光十字主动技：每 ~2.0s 轮换一招（攻击频率提升；十字光刃 → 审判之柱 → 辉光轮转 → 裂光冲撞 → 十字斩）
  boss7AI(dt){
    if(this.b7slash){ // 🌌 十字斩（⑤技能激活中）：四道高伤激光整体旋转一圈，扫到即大额掉血，结束后消失
      this.b7slash.t -= dt;
      if(this.b7slash.t <= 0){ this.b7slash = null; return; }
      this.b7slash.rot += this.b7slash.spin * dt;
      const len = this.b7slash.len, hA = 0.13; // 🌌 十字斩：激光命中半角稍收窄（四道只占 ~104°，安全区更大），避免"贴脸必中"
      const cands = bossHitTargets();
      for(const Q of cands){
        if(!Q) continue;
        const px = Q.x - this.x, py = Q.y - this.y;
        const d = Math.hypot(px, py);
        if(d > len || d < 1) continue;
        const pa = Math.atan2(py, px);
        let onBeam = false;
        for(let i=0;i<4;i++){
          const ba = i*Math.PI/2 + this.b7slash.rot;
          let diff = pa - ba; while(diff>Math.PI)diff-=2*Math.PI; while(diff<-Math.PI)diff+=2*Math.PI;
          if(Math.abs(diff) < hA){ onBeam = true; break; }
        }
        if(onBeam) Q.takeDamage(140 * dt, this); // 高伤 DPS（激光横竖扫过）
      }
      return;
    }
    if(this.b7charge){ // 冲撞位移：同样放在 return 之前，保证每帧结算
      this.b7charge.t -= dt;
      this.x = clamp(this.x + this.b7charge.vx*dt, this.r, WW()-this.r);
      this.y = clamp(this.y + this.b7charge.vy*dt, this.r, WH()-this.r);
      if(this.b7charge.t <= 0) this.b7charge = null;
    }
    this.b7t = (this.b7t || 0) + dt;
    if(this.b7t < 2.0) return;
    this.b7t = 0;
    const step = (this.b7step || 0) % 5;
    this.b7step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 十字光刃：四个正方向各 3 发（共 12 发，摆成十字弹幕墙）
      for(let k=0;k<4;k++){
        const base = k*Math.PI/2;
        for(let i=0;i<3;i++){
          const a = base + (i-1)*0.16;
          this.fireBullet(Math.cos(a)*400, Math.sin(a)*400, 7, '#ffcf3d', 22);
        }
      }
      SND.bossWarn();
    } else if(step === 1){ // ② 审判之柱：在玩家周围砸下 3~4 根金色光柱（延迟爆发的审判区）
      const n = 3 + (this.tier >= 2 ? 1 : 0);
      const cx = P ? P.x : this.x, cy = P ? P.y : this.y;
      for(let i=0;i<n;i++){
        G.effects.push({ type:'corrode', x: clamp(cx + rand(-130,130), 20, WW()-20), y: clamp(cy + rand(-130,130), 20, WH()-20),
          r: 44*visionZoom(), life: 3.6, max: 3.6, tick: 0.5, next: 0.6, dmg: 20, rgb:'255,207,61' });
      }
      SND.bossWarn();
    } else if(step === 2){ // ③ 辉光轮转：环形 10 发，随核心自转相位整体偏转
      const n = 10;
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + (this.b7spin || 0);
        this.fireBullet(Math.cos(a)*360, Math.sin(a)*360, 6, '#ffe08a', 21);
      }
    } else if(step === 3){ // ④ 裂光冲撞：朝最近玩家高速冲 0.8s
      if(P){
        const a = angleTo(this, P);
        this.b7charge = { t: 0.8, a, vx: Math.cos(a)*620, vy: Math.sin(a)*620 };
      }
    } else { // ⑤ 十字斩：四道高伤激光（横竖 + 字），整体旋转一圈后消失
      this.b7slash = { t: 2.4, rot: 0, spin: Math.PI*2/2.4, len: Math.hypot(WW(),WH())*1.25 };
      SND.bossWarn();
    }
  }
  // 🌌 虚空裂界者走位：贴身压迫（保持 130~240），环走更快更贴（突进只归技能①）
  moveBoss8(dt){
    if(this.b8zone) return; // 场地分割期间：定身不动，让红区网格稳定可读
    const P = targetOf(this);
    if(!P) return;
    const d = dist(this, P), a = angleTo(this, P);
    const sp = this.speed*1.15;
    if(d > 240){ this.x += Math.cos(a)*sp*dt; this.y += Math.sin(a)*sp*dt; } // 追击范围更大
    else if(d < 130){ this.x -= Math.cos(a)*sp*0.8*dt; this.y -= Math.sin(a)*sp*0.8*dt; }
    else {
      if(this.b8side === undefined) this.b8side = 1;
      const sa = a + Math.PI/2*this.b8side;
      this.x += Math.cos(sa)*sp*dt; this.y += Math.sin(sa)*sp*dt; // 侧移绕行
      this.x += Math.cos(a)*sp*0.45*dt; this.y += Math.sin(a)*sp*0.45*dt; // 环走收拢施压
      this.b8sideT = (this.b8sideT || 0) - dt;
      if(this.b8sideT <= 0){ this.b8sideT = rand(1.0, 1.8); this.b8side *= -1; } // 换向更勤
    }
    this.x = clamp(this.x, this.r, WW()-this.r);
    this.y = clamp(this.y, this.r, WH()-this.r);
  }
  // 🌌 虚空裂界者主动技：每 ~1.8s 轮换一招（攻击频率提升；裁决突进 → 虚空射线 → 湮灭脉冲 → 虚空造物 → 场地分割）
  boss8AI(dt){
    if(this.b8zone){ // 🌌 场地分割（⑤技能激活中）：九宫格，仅 1 块安全，其余高频低伤；先预警再激活
      const z = this.b8zone;
      if(z.phase === 'warn'){
        z.t -= dt;
        if(z.t <= 0){ z.phase = 'active'; z.next = 0; } // 预警结束 → 激活危险区
        return; // 预警阶段只显示提示，不结算伤害
      }
      z.actT -= dt; z.next -= dt;
      const bw = WW()/z.grid, bh = WH()/z.grid;
      const cands = bossHitTargets();
      if(z.next <= 0){
        z.next = 0.16; // 高频低伤：每 0.16s 结算一次
        for(const Q of cands){
          if(!Q) continue;
          const col = Math.floor(Q.x / bw), row = Math.floor(Q.y / bh);
          const idx = row*z.grid + col;
          if(idx >= 0 && idx < z.grid*z.grid && idx !== z.safe) Q.takeDamage(6, this);
        }
      }
      if(z.actT <= 0) this.b8zone = null;
      return;
    }
    this.b8t = (this.b8t || 0) + dt;
    if(this.b8t < 1.8) return;
    this.b8t = 0;
    const step = (this.b8step || 0) % 5;
    this.b8step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 裁决突进：瞬移到玩家侧后方 + 落地砸出小范围冲击波（突进型标志性开招）
      if(P){
        const na = angleTo(this, P) + Math.PI + (Math.random() < 0.5 ? 0.6 : -0.6);
        spawnParticles(this.x, this.y, '#ff2d55', 16); // 起点残影
        this.x = clamp(P.x + Math.cos(na)*220, this.r, WW()-this.r);
        this.y = clamp(P.y + Math.sin(na)*220, this.r, WH()-this.r);
        spawnParticles(this.x, this.y, '#ff2d55', 16); // 落点爆发
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r: 160*visionZoom(), life:0.6, max:0.6, tick:0, dmg:34, drain:0, rgb:'255,45,85' });
        SND.bossWarn();
      }
    } else if(step === 1){ // ② 虚空射线：深红追踪光束（持续伤害 + 猛抽资源）
      if(P){
        const a = angleTo(this, P);
        G.effects.push({ type:'drainbeam', fromBoss:true, x:this.x, y:this.y, a, len: 1600,
          w: 30*visionZoom(), life: 2.4, max: 2.4, dmg: 34, drain: 44, ownerIdx:0,
          rgb:'255,45,85', rgbCore:'255,180,200', warn: 0.5 }); // warn：0.5s 预警（细瞄准线，不结算伤害）
      }
    } else if(step === 2){ // ③ 湮灭脉冲：以自身为中心的深红冲击波（掉血 + 抽资源）
      G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
        r: 300*visionZoom(), life:0.9, max:0.9, tick:0, dmg:30, drain:55, rgb:'255,45,85' });
      SND.bossWarn();
    } else if(step === 3){ // ④ 虚空造物：召 4~5 只世界2 精英（混合种类）
      const n = 4 + (this.tier >= 2 ? 1 : 0);
      const kinds = [FissionEnemy, VoidDarter, BulwarkEnemy, DrainEnemy, PrismShooter, RiftCharger];
      for(let i=0;i<n;i++){
        const K = kinds[Math.floor(Math.random()*kinds.length)];
        G.enemies.push(new K(this.x + rand(-70,70), this.y + rand(-70,70), enemyHpScale(G.wave)));
      }
      SND.bossWarn();
    } else { // ⑤ 场地分割：九宫格，仅 1 块安全，其余高频低伤（先预警再激活）
      this.b8zone = { phase:'warn', t:1.3, grid:3, safe: Math.floor(Math.random()*9), next:0, actT:3.6 };
      SND.bossWarn();
    }
  }
  // 🌌 碎撞巨像走位：缓慢追踪玩家（保持中距，给冲撞留空间）；冲撞/蓄力预警期间定身（位移由 boss9AI 接管）
  moveBoss9(dt){
    if(this.b9charge || this.b9tele || this.b9pathWarn || this.b9path) return; // 冲撞/预警/路径冲撞期间：位移由 boss9AI 处理
    const P = targetOf(this);
    if(!P) return;
    const d = dist(this, P), a = angleTo(this, P);
    const sp = this.speed*0.9;
    if(d > 200){ this.x += Math.cos(a)*sp*dt; this.y += Math.sin(a)*sp*dt; } // 拉开则追
    else if(d < 120){ this.x -= Math.cos(a)*sp*dt; this.y -= Math.sin(a)*sp*dt; } // 太近则后撤，准备冲
    else {
      if(this.b9side === undefined) this.b9side = 1;
      const sa = a + Math.PI/2*this.b9side;
      this.x += Math.cos(sa)*sp*0.8*dt; this.y += Math.sin(sa)*sp*0.8*dt; // 侧移绕行
      this.b9sideT = (this.b9sideT || 0) - dt;
      if(this.b9sideT <= 0){ this.b9sideT = rand(1.0, 1.8); this.b9side *= -1; }
    }
    this.x = clamp(this.x, this.r, WW()-this.r);
    this.y = clamp(this.y, this.r, WH()-this.r);
  }
  // 🌌 碎撞巨像主动技：每 ~2.0s 轮换一招（冲撞主题；蓄力冲撞 → 二连冲 → 冲撞震波 → 召唤裂隙冲撞者 → 贯穿冲撞带轨迹）
  boss9AI(dt){
    // 碎撞巨像：常驻拖尾（记录过往位置，draw 里画成一串半透明重影）
    if(this.b9trail === undefined) this.b9trail = [];
    this.b9trail.push({x:this.x, y:this.y});
    if(this.b9trail.length > 14) this.b9trail.shift();
    // 冲撞位移（预警锁定方向后高速突进；撞墙定身、不眩晕）
    if(this.b9charge){
      this.b9charge.t -= dt;
      const nx = clamp(this.x + this.b9charge.vx*dt, this.r, WW()-this.r);
      const ny = clamp(this.y + this.b9charge.vy*dt, this.r, WH()-this.r);
      if(this.b9charge.trail){ // ⑤ 终极贯穿冲撞：沿途残留危险小冲击波
        this.b9charge.acc = (this.b9charge.acc || 0) + dt;
        if(this.b9charge.acc >= 0.18){
          this.b9charge.acc = 0;
          G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
            r: 70*visionZoom(), life:0.5, max:0.5, tick:0, dmg:14, drain:0, rgb:'176,107,255' });
        }
      }
      this.x = nx; this.y = ny;
      if(this.b9charge.t <= 0){
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:(this.b9charge.big ? 320 : 200)*visionZoom(), life:0.6, max:0.6, tick:0,
          dmg: this.b9charge.big ? 36 : 24, drain:0, rgb:'176,107,255' }); // 收尾冲击波
        spawnParticles(this.x, this.y, '#b06bff', 18);
        if(this.b9next){ const nx2 = this.b9next; this.b9next = null; this.b9tele = { t:0.25, a:nx2.a, spd:nx2.spd, dur:nx2.dur }; }
        this.b9charge = null;
      }
      return;
    }
    // 蓄力预警：锁定方向、显示虚线，期间定身（撞到玩家由 update 的 touch 伤害结算）
    if(this.b9tele){
      this.b9tele.t -= dt;
      if(this.b9tele.t <= 0){
        const tl = this.b9tele;
        this.b9charge = { t: tl.dur, a: tl.a, vx: Math.cos(tl.a)*tl.spd, vy: Math.sin(tl.a)*tl.spd, trail: tl.trail, big: tl.big, acc:0 };
        this.b9tele = null;
        SND.bossWarn();
      }
      return;
    }
    // 路径冲撞：预警（画出随机拐弯的路径折线）→ 沿路径高速冲（很快）
    if(this.b9pathWarn){
      this.b9pathWarn.t -= dt;
      if(this.b9pathWarn.t <= 0){
        const w = this.b9pathWarn; this.b9pathWarn = null;
        const a0 = Math.atan2(w.pts[0].y - this.y, w.pts[0].x - this.x);
        this.b9path = { pts:w.pts, seg:0, spd:1000, vx:Math.cos(a0)*1000, vy:Math.sin(a0)*1000,
          target:w.pts[0], t:5.0, acc:0 };
        SND.bossWarn();
      }
      return;
    }
    if(this.b9path){
      const p = this.b9path;
      p.t -= dt;
      const nx = this.x + p.vx*dt, ny = this.y + p.vy*dt;
      p.acc = (p.acc || 0) + dt;
      if(p.acc >= 0.12){ // 沿途残留危险小冲击波（高速轨迹）
        p.acc = 0;
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:64*visionZoom(), life:0.4, max:0.4, tick:0, dmg:8, drain:0, rgb:'176,107,255' });
      }
      this.x = clamp(nx, this.r, WW()-this.r);
      this.y = clamp(ny, this.r, WH()-this.r);
      const hitWall = (nx !== this.x || ny !== this.y);
      const reached = p.target && Math.hypot(p.target.x - this.x, p.target.y - this.y) < this.r + 16;
      if(hitWall || p.t <= 0){ // 撞墙/超时 → 收尾大冲击波
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:300*visionZoom(), life:0.6, max:0.6, tick:0, dmg:30, drain:0, rgb:'176,107,255' });
        spawnParticles(this.x, this.y, '#b06bff', 18);
        this.b9path = null;
        return;
      }
      if(reached){
        p.seg++;
        if(p.seg < p.pts.length){
          const tgt = p.pts[p.seg], a = Math.atan2(tgt.y - this.y, tgt.x - this.x);
          p.vx = Math.cos(a)*p.spd; p.vy = Math.sin(a)*p.spd; p.target = tgt;
        } else p.target = null; // 最后一段：直冲到撞墙收尾
      }
      return;
    }
    this.b9t = (this.b9t || 0) + dt;
    if(this.b9t < 2.0) return;
    this.b9t = 0;
    const step = (this.b9step || 0) % 6;
    this.b9step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 蓄力冲撞：0.8s 预警锁定方向 → 760 速突进 0.7s（撞墙定身）
      if(P) this.b9tele = { t:0.8, a: angleTo(this, P), spd:760, dur:0.7 };
    } else if(step === 1){ // ② 二连冲：两发短预警、略偏角度的连冲
      if(P){
        const base = angleTo(this, P);
        this.b9tele = { t:0.5, a: base - 0.18, spd:720, dur:0.55 };
        this.b9next = { a: base + 0.18, spd:720, dur:0.55 }; // 第一发落地后自动触发第二发
      }
    } else if(step === 2){ // ③ 冲撞震波：原地砸下 → 中范围虚空冲击波（不冲也能威胁站位）
      G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
        r: 280*visionZoom(), life:0.7, max:0.7, tick:0, dmg:28, drain:0, rgb:'176,107,255' });
      spawnParticles(this.x, this.y, '#b06bff', 14);
      SND.bossWarn();
    } else if(step === 3){ // ④ 召唤裂隙冲撞者：召 2~3 只世界2 冲撞精英（主题一致）
      const n = 2 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++){
        G.enemies.push(new RiftCharger(this.x + rand(-60,60), this.y + rand(-60,60), enemyHpScale(G.wave)));
      }
      SND.bossWarn();
    } else if(step === 4){ // ⑤ 终极·贯穿冲撞：长预警 + 高速 1.2s + 沿途残留危险轨迹 + 收尾大冲击波
      if(P) this.b9tele = { t:1.0, a: angleTo(this, P), spd:950, dur:1.2, trail:true, big:true };
    } else { // ⑥ 路径冲撞：先画一条随机拐弯 5 次的路径（首点必经玩家），然后高速沿路径撞下去
      if(P){
        const pts = [{ x:P.x, y:P.y }]; // 首点=玩家当前位置（保证路径撞得到人）
        let ang = angleTo(this, P), lx = P.x, ly = P.y;
        for(let i=0;i<5;i++){ // 之后随机拐弯 5 次，逐段延伸（最终一段直冲出界/撞墙收尾）
          ang += rand(-1.0, 1.0);
          const len = rand(200, 360);
          const tx = clamp(lx + Math.cos(ang)*len, this.r, WW()-this.r);
          const ty = clamp(ly + Math.sin(ang)*len, this.r, WH()-this.r);
          pts.push({ x:tx, y:ty });
          lx = tx; ly = ty;
        }
        this.b9pathWarn = { t:0.7, pts };
        SND.bossWarn();
      }
    }
  }
  // ===== 🌿 世界3「蚀根林海」四 Boss =====
  // 共同设计口径：世界3 的压迫感不来自"冲撞贴脸"，而来自**地面被逐步污染**（孢云/根须/毒瘴）
  //   + 召唤海填满走位空间。所以四个 Boss 的走位都比世界2 更"懒"，把压力交给场地。
  // 🌿 万藤母巢：扎根场中缓慢正弦漂移（不追人——它靠召唤海和弹幕吃饭，追人反而好打）
  moveBoss10(dt){
    if(this.b10shell > 0) return; // 护壳期间定身
    this.b10mt = (this.b10mt || 0) + dt;
    const cx = WW()*0.5, cy = WH()*0.42;
    this.x = clamp(cx + Math.sin(this.b10mt*0.45)*WW()*0.22, this.r, WW()-this.r);
    this.y = clamp(cy + Math.cos(this.b10mt*0.32)*WH()*0.16, this.r, WH()-this.r);
  }
  boss10AI(dt){
    // 母巢护壳：无敌 1.8s + 每 0.45s 甩一圈孢子弹幕；破壳瞬间释放爆发环
    if(this.b10shell > 0){
      this.b10shell -= dt; this.b10shellT = (this.b10shellT||0) - dt;
      if(this.b10shellT <= 0){
        this.b10shellT = 0.45; const n = 9;
        for(let i=0;i<n;i++){ const a = i/n*Math.PI*2 + G.time; this.fireBullet(Math.cos(a)*250, Math.sin(a)*250, 6, '#a8e05a', 18); }
      }
      if(this.b10shell <= 0){
        const n = 22;
        for(let i=0;i<n;i++){ const a = i/n*Math.PI*2; this.fireBullet(Math.cos(a)*330, Math.sin(a)*330, 7, '#57c15a', 22); }
        this.invincible = false; SND.bossWarn();
      }
      return;
    }
    this.b10t = (this.b10t || 0) + dt;
    if(this.b10t < 2.0) return;
    this.b10t = 0;
    const step = (this.b10step || 0) % 5;
    this.b10step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 种子环爆：一圈 18 发孢子弹幕（螺旋相位， tier≥2 加量）
      const n = 18 + (this.tier >= 2 ? 4 : 0);
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + G.time*0.7;
        this.fireBullet(Math.cos(a)*310, Math.sin(a)*310, 7, '#a8e05a', 20);
      }
      SND.bossWarn();
    } else if(step === 1){ // ② 藤蔓召唤：召 2~3 腐藤怪 + 1 缠根妖（地面压力来源）
      const n = 2 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++) G.enemies.push(new VineWretch(this.x + rand(-70,70), this.y + rand(-70,70), enemyHpScale(G.wave)));
      G.enemies.push(new RootSnarer(this.x + rand(-70,70), this.y + rand(-70,70), enemyHpScale(G.wave)));
      SND.bossWarn();
    } else if(step === 2){ // ③ 孢云喷发：随机 3 处落孢子云（站桩就会被烧）
      const n = 3 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++){
        const sx = this.x, sy = this.y;
        const a = rand(0, 6.28), d = rand(80, 260);
        G.effects.push({ type:'sporeArc', sx, sy, tx:clamp(sx+Math.cos(a)*d, 40, WW()-40), ty:clamp(sy+Math.sin(a)*d, 40, WH()-40),
          vx:0, vy:0, t:0, dur:0.75, life:1.0, max:1.0 });
      }
      SND.bossWarn();
    } else if(step === 3){ // ④ 藤鞭横扫：朝玩家甩一条长鞭（先预警 0.45s 再扫，横向可躲）
      const a = P ? angleTo(this, P) : 0;
      G.effects.push({ type:'tendrilBeam', x:this.x, y:this.y, a, len:560*visionZoom(), w:20,
        warn:0.45, t:0.35, life:0.9, max:0.9, dmg:34, rgb:'87,193,90', rgbCore:'190,240,150' });
      SND.bossWarn();
    } else { // ⑤ 母巢护壳：无敌 1.8s + 自旋甩弹幕（防御反击）
      this.b10shell = 1.8; this.b10shellT = 0; this.invincible = true; SND.bossWarn();
    }
  }
  // 🌿 蚀光古树：树不会跑 —— 极慢横向挪动 + 上下"呼吸"（根系扎死，只做微小调整）
  moveBoss11(dt){
    if(this.b11ram > 0) return; // 根刺冲撞期间定身
    this.b11mt = (this.b11mt || 0) + dt;
    this.x = clamp(WW()*0.5 + Math.sin(this.b11mt*0.22)*WW()*0.26, this.r, WW()-this.r);
    this.y = clamp(WH()*0.40 + Math.sin(this.b11mt*0.7)*WH()*0.05, this.r, WH()-this.r);
  }
  boss11AI(dt){
    if(this.b11ram > 0){ // 根刺冲撞：朝玩家方向短距突进（撞墙定身 0.6s）
      this.b11ram -= dt;
      const nx = clamp(this.x + this.b11rvx*dt, this.r, WW()-this.r);
      const ny = clamp(this.y + this.b11rvy*dt, this.r, WH()-this.r);
      if(nx !== this.x + this.b11rvx*dt || ny !== this.y + this.b11rvy*dt){ this.b11ram = 0; spawnParticles(this.x, this.y, '#8fae3a', 12); }
      this.x = nx; this.y = ny;
      if(this.b11ram <= 0){
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:220*visionZoom(), life:0.6, max:0.6, tick:0, dmg:30, drain:0, rgb:'143,174,58' });
        spawnParticles(this.x, this.y, '#8fae3a', 16);
      }
      return;
    }
    this.b11t = (this.b11t || 0) + dt;
    if(this.b11t < 2.1) return;
    this.b11t = 0;
    const step = (this.b11step || 0) % 5;
    this.b11step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 蚀光柱：横竖两道藤光射线（各预警 0.5s），正交封走位
      G.effects.push({ type:'tendrilBeam', x:this.x, y:this.y, a:0, len:WW()*1.2, w:18,
        warn:0.5, t:0.5, life:1.1, max:1.1, dmg:30, rgb:'143,174,58', rgbCore:'220,240,160' });
      G.effects.push({ type:'tendrilBeam', x:this.x, y:this.y, a:Math.PI/2, len:WH()*1.2, w:18,
        warn:0.5, t:0.5, life:1.1, max:1.1, dmg:30, rgb:'143,174,58', rgbCore:'220,240,160' });
      SND.bossWarn();
    } else if(step === 1){ // ② 根须地刺：场地四周冒 4 团根须（比小怪的大一圈、更疼）
      for(let i=0;i<4;i++){
        const a = i/4*Math.PI*2 + rand(-0.4, 0.4);
        const d = rand(140, 260);
        G.effects.push({ type:'root', x:clamp(this.x+Math.cos(a)*d, 40, WW()-40), y:clamp(this.y+Math.sin(a)*d, 40, WH()-40),
          r:66, life:7, max:7, slow:0.42, dmg:12, tick:0.55, next:0.2, seed:rand(0,6.28) });
      }
      SND.bossWarn();
    } else if(step === 2){ // ③ 孢云雨：全场随机 5 处孢子云（把场地一点点煮成毒汤）
      const n = 5 + (this.tier >= 2 ? 2 : 0);
      for(let i=0;i<n;i++){
        const sx = this.x, sy = this.y;
        const tx = rand(50, WW()-50), ty = rand(50, WH()-50);
        const d = Math.hypot(tx-sx, ty-sy);
        G.effects.push({ type:'sporeArc', sx, sy, tx, ty, vx:0, vy:0, t:0, dur:Math.max(0.4, d/420), life:1.3, max:1.3 });
      }
      SND.bossWarn();
    } else if(step === 3){ // ④ 荆棘护卫：召 2 荆棘傀（反弹弹幕，逼玩家换技能/爆炸破）
      const n = 2 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++) G.enemies.push(new ThornPuppet(this.x + rand(-70,70), this.y + rand(-70,70), enemyHpScale(G.wave)));
      SND.bossWarn();
    } else { // ⑤ 根刺冲撞：短距突进（古树也会发脾气）
      const a = P ? angleTo(this, P) : rand(0, 6.28);
      this.b11ram = 0.6; this.b11rvx = Math.cos(a)*430; this.b11rvy = Math.sin(a)*430;
      SND.bossWarn();
    }
  }
  // 🌿 蚀根龙王（最终 Boss）：贴身压迫 + 侧移绕行，招式最密、最疼
  moveBoss12(dt){
    if(this.b12charge || this.b12breath) return; // 冲撞/龙息期间：位移由对应分支接管
    const P = targetOf(this);
    const sp = this.speed * (this.phase >= 2 ? 1.15 : 0.95);
    if(P){
      const dx = P.x - this.x, dy = P.y - this.y;
      const d = Math.hypot(dx, dy) || 1;
      // 压迫走位：朝玩家逼近，但保持 ~180 的最小距离（贴太近就没法放扇形龙息了）
      if(d > 180){ this.x += dx/d*sp*dt; this.y += dy/d*sp*dt; }
      else { this.x += -dy/d*sp*0.7*dt; this.y += dx/d*sp*0.7*dt; } // 太近就侧向绕行
    }
    this.x = clamp(this.x, this.r, WW()-this.r); this.y = clamp(this.y, this.r, WH()-this.r);
  }
  boss12AI(dt){
    if(this.b12charge){ // 蚀根冲撞：预警后高速直冲，撞墙定身 0.5s
      this.b12charge.t -= dt;
      const nx = clamp(this.x + this.b12charge.vx*dt, this.r, WW()-this.r);
      const ny = clamp(this.y + this.b12charge.vy*dt, this.r, WH()-this.r);
      if(nx !== this.x + this.b12charge.vx*dt || ny !== this.y + this.b12charge.vy*dt){
        this.b12charge = null; this.b12stun = 0.5; // 撞墙定身（玩家输出窗口）
        spawnParticles(this.x, this.y, '#c2402f', 14);
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:260*visionZoom(), life:0.6, max:0.6, tick:0, dmg:34, drain:0, rgb:'194,64,47' });
        return;
      }
      this.x = nx; this.y = ny;
      if(this.b12charge.t <= 0){
        this.b12charge = null;
        G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
          r:200*visionZoom(), life:0.5, max:0.5, tick:0, dmg:26, drain:0, rgb:'194,64,47' });
      }
      return;
    }
    if(this.b12stun > 0){ this.b12stun -= dt; return; }
    if(this.b12breath){ // 龙息锥形：3 波扇形弹幕连续喷（朝玩家）
      this.b12breath.t -= dt;
      this.b12breath.waveT -= dt;
      if(this.b12breath.waveT <= 0){
        this.b12breath.waveT = 0.22;
        const n = 7, spread = Math.PI/3.2;
        for(let i=0;i<n;i++){
          const a = this.b12breath.a + (i-(n-1)/2)*spread/n;
          this.fireBullet(Math.cos(a)*300, Math.sin(a)*300, 7, '#e0603a', 24);
        }
      }
      if(this.b12breath.t <= 0) this.b12breath = null;
      return;
    }
    this.b12t = (this.b12t || 0) + dt;
    const rage = this.phase >= 2; // 半血狂暴：节奏整体加快
    if(this.b12t < (rage ? 1.5 : 2.1)) return;
    this.b12t = 0;
    const step = (this.b12step || 0) % 5;
    this.b12step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 龙息锥形：3 波 × 7 发扇形（朝玩家方向）
      this.b12breath = { t:0.9, waveT:0, a: P ? angleTo(this, P) : 0 };
      SND.bossWarn();
    } else if(step === 1){ // ② 蚀根冲撞：预警 0.4s 后高速直冲
      const a = P ? angleTo(this, P) : 0;
      this.b12tele = 0.4; this.b12teleA = a;
      this.b12charge = { t:0.7, vx:Math.cos(a)*640, vy:Math.sin(a)*640 };
      SND.bossWarn();
    } else if(step === 2){ // ③ 召唤海：召 4 只混合怪（龙吟一声，腐林回应）
      const kinds = [VineWretch, PollenWasp, BrambleCharger, SeedBomber];
      for(let i=0;i<4;i++){
        const K = kinds[(i + (this.tier||1)) % kinds.length];
        G.enemies.push(new K(this.x + rand(-80,80), this.y + rand(-80,80), enemyHpScale(G.wave)));
      }
      SND.bossWarn();
    } else if(step === 3){ // ④ 全屏毒瘴：四角齐落根须 + 中央一团孢云（场地被煮开）
      for(let i=0;i<4;i++){
        const a = Math.PI/4 + i/4*Math.PI*2;
        G.effects.push({ type:'root', x:clamp(this.x+Math.cos(a)*230, 40, WW()-40), y:clamp(this.y+Math.sin(a)*230, 40, WH()-40),
          r:60, life:6.5, max:6.5, slow:0.42, dmg:11, tick:0.55, next:0.2, seed:rand(0,6.28) });
      }
      G.effects.push({ type:'sporeArc', sx:this.x, sy:this.y, tx:WW()*0.5, ty:WH()*0.5, vx:0, vy:0, t:0, dur:0.8, life:1.1, max:1.1 });
      SND.bossWarn();
    } else { // ⑤ 尾扫环爆：一圈 20 发暗红弹幕（收尾技，狂暴时加量）
      const n = 20 + (rage ? 6 : 0);
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + G.time*0.5;
        this.fireBullet(Math.cos(a)*300, Math.sin(a)*300, 7, '#c2402f', 26);
      }
      SND.bossWarn();
    }
  }
  // 🌿 万秽之源（世界3 无尽专属）：场内游荡 + 边走边排污，弹幕最密
  moveBoss13(dt){
    if(this.b13beacon > 0) return; // 定点污染期间定身
    this.b13mt = (this.b13mt || 0) + dt;
    const cx = WW()*0.5, cy = WH()*0.5;
    this.x = clamp(cx + Math.sin(this.b13mt*0.5)*WW()*0.3, this.r, WW()-this.r);
    this.y = clamp(cy + Math.cos(this.b13mt*0.38)*WH()*0.24, this.r, WH()-this.r);
  }
  boss13AI(dt){
    if(this.b13beacon > 0){ // 定点污染：每 0.25s 在身上铺一团孢云/根须（边走边把场地煮烂）
      this.b13beacon -= dt;
      this.b13bcT = (this.b13bcT || 0) - dt;
      if(this.b13bcT <= 0){
        this.b13bcT = 0.25;
        const a = rand(0, 6.28), d = rand(30, 130);
        if(Math.random() < 0.5){
          G.effects.push({ type:'root', x:clamp(this.x+Math.cos(a)*d, 40, WW()-40), y:clamp(this.y+Math.sin(a)*d, 40, WH()-40),
            r:56, life:5, max:5, slow:0.42, dmg:10, tick:0.55, next:0.15, seed:rand(0,6.28) });
        } else {
          G.effects.push({ type:'sporeArc', sx:this.x, sy:this.y, tx:clamp(this.x+Math.cos(a)*d, 40, WW()-40), ty:clamp(this.y+Math.sin(a)*d, 40, WH()-40),
            vx:0, vy:0, t:0, dur:0.45, life:0.7, max:0.7 });
        }
      }
      if(this.b13beacon <= 0){ this.invincible = false; }
      return;
    }
    this.b13t = (this.b13t || 0) + dt;
    if(this.b13t < 1.8) return;
    this.b13t = 0;
    const step = (this.b13step || 0) % 5;
    this.b13step = step + 1;
    const P = targetOf(this);
    if(step === 0){ // ① 污染脉冲：绿色汲取冲击波（掉血 + 抽资源）
      G.effects.push({ type:'voidpulse', fromBoss:true, x:this.x, y:this.y,
        r:320*visionZoom(), life:0.9, max:0.9, tick:0, dmg:30, drain:26, rgb:'94,122,58' });
      SND.bossWarn();
    } else if(step === 1){ // ② 高速螺旋弹幕：24 发双螺旋（比世界3 其他 Boss 都密）
      const n = 24;
      for(let i=0;i<n;i++){
        const a = i/n*Math.PI*2 + G.time*1.2;
        this.fireBullet(Math.cos(a)*380, Math.sin(a)*380, 6, '#a8c45a', 22);
      }
      SND.bossWarn();
    } else if(step === 2){ // ③ 秽种爆散：召 3 蚀种魔（死了还会炸追踪种子，越拖越乱）
      const n = 3 + (this.tier >= 2 ? 1 : 0);
      for(let i=0;i<n;i++) G.enemies.push(new SeedBomber(this.x + rand(-70,70), this.y + rand(-70,70), enemyHpScale(G.wave)));
      SND.bossWarn();
    } else if(step === 3){ // ④ 内爆吸力：把玩家往环心拽 + 周期掉血（躲不开就只能硬吃）
      G.effects.push({ type:'voidpull', x:this.x, y:this.y, r:300*visionZoom(), life:1.6, max:1.6,
        next:0.4, tick:0.4, pull:260, dmg:16 });
      SND.bossWarn();
    } else { // ⑤ 定点污染：无敌 2.4s + 持续在脚下铺孢云/根须（最恶心的一招）
      this.b13beacon = 2.4; this.b13bcT = 0; this.invincible = true; SND.bossWarn();
    }
  }
  draw(){
    ctx.save();
    if(this.dying) ctx.translate((Math.random()-0.5)*14, (Math.random()-0.5)*10); // 暴击致死：死亡前身体颤动
    ctx.fillStyle = this.flash>0 ? '#fff' : this.bodyColor;
    // boss body - 每个Boss独立形状：暗影领主=五角星，熔岩巨兽=六边形，虚空主宰=正方形
    // （虚空四顶点取 45/135/225/315 度 → 边水平/垂直，画出来是正方形，不是菱形）
    ctx.shadowColor = this.flash>0 ? '#fff' : this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    if(this.bossNum === 1){
      // 五角星
      for(let i=0;i<10;i++){
        const a = -Math.PI/2 + i*Math.PI/5;
        const rr = i%2===0 ? this.r : this.r*0.45;
        if(i===0) ctx.moveTo(this.x+Math.cos(a)*rr, this.y+Math.sin(a)*rr);
        else ctx.lineTo(this.x+Math.cos(a)*rr, this.y+Math.sin(a)*rr);
      }
    } else if(this.bossNum === 2){
      // 六边形
      for(let i=0;i<6;i++){
        const a = i/6*Math.PI*2;
        if(i===0) ctx.moveTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
        else ctx.lineTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
      }
    } else if(this.bossNum === 6){
      // 🌌 棱光八角：实心八边形（⛔ 不许镂空——用户 2026-10-12 明确讨厌"空心 Boss"）
      for(let i=0;i<8;i++){
        const a = Math.PI/8 + i/8*Math.PI*2; // 一条边水平朝上，辨识度清晰
        const px = this.x+Math.cos(a)*this.r, py = this.y+Math.sin(a)*this.r;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else if(this.bossNum === 7){
      // 🌌 裂光十字：正十字（臂长 r、臂宽 0.42r）——四臂张开的审判架
      const L = this.r, Wd = this.r*0.42;
      ctx.moveTo(this.x-Wd, this.y-L);
      ctx.lineTo(this.x+Wd, this.y-L);
      ctx.lineTo(this.x+Wd, this.y-Wd);
      ctx.lineTo(this.x+L,  this.y-Wd);
      ctx.lineTo(this.x+L,  this.y+Wd);
      ctx.lineTo(this.x+Wd, this.y+Wd);
      ctx.lineTo(this.x+Wd, this.y+L);
      ctx.lineTo(this.x-Wd, this.y+L);
      ctx.lineTo(this.x-Wd, this.y+Wd);
      ctx.lineTo(this.x-L,  this.y+Wd);
      ctx.lineTo(this.x-L,  this.y-Wd);
      ctx.lineTo(this.x-Wd, this.y-Wd);
      ctx.closePath();
    } else if(this.bossNum === 8){
      // 🌌 虚空裂界者：实心正三角形（尖朝上，⛔ 不许镂空）
      for(let i=0;i<3;i++){
        const a = -Math.PI/2 + i/3*Math.PI*2;
        const px = this.x+Math.cos(a)*this.r, py = this.y+Math.sin(a)*this.r;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else if(this.bossNum === 9){
      // 🌌 碎撞巨像：实心五边形（⛔ 不许镂空；五顶点，撞角鼻在装饰段画）
      for(let i=0;i<5;i++){
        const a = -Math.PI/2 + i/5*Math.PI*2;
        const px = this.x+Math.cos(a)*this.r, py = this.y+Math.sin(a)*this.r;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else if(this.bossNum === 10){
      // 🌿 万藤母巢：实心圆 + 12 枚放射尖刺（种子荚，尖朝外）—— 世界3 唯一"圆"形 Boss
      ctx.moveTo(this.x+this.r, this.y);
      for(let i=0;i<24;i++){
        const a = i/24*Math.PI*2;
        const rr = (i%2===0) ? this.r : this.r*0.72;
        const px = this.x+Math.cos(a)*rr, py = this.y+Math.sin(a)*rr;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else if(this.bossNum === 11){
      // 🌿 蚀光古树：实心正方形年轮墩（四顶点 45/135/225/315 度：边水平/垂直）
      for(let i=0;i<4;i++){
        const a = Math.PI/4 + i/4*Math.PI*2;
        if(i===0) ctx.moveTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
        else ctx.lineTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
      }
    } else if(this.bossNum === 12){
      // 🌿 蚀根龙王：实心正三角形（尖朝上，⛔ 不许镂空）
      for(let i=0;i<3;i++){
        const a = -Math.PI/2 + i/3*Math.PI*2;
        const px = this.x+Math.cos(a)*this.r, py = this.y+Math.sin(a)*this.r;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else if(this.bossNum === 13){
      // 🌿 万秽之源：实心六边形（腐败源的"结晶核"）
      for(let i=0;i<6;i++){
        const a = i/6*Math.PI*2;
        const px = this.x+Math.cos(a)*this.r, py = this.y+Math.sin(a)*this.r;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
    } else {
      // 正方形（四顶点 45/135/225/315 度：边水平/垂直）
      for(let i=0;i<4;i++){
        const a = Math.PI/4 + i/4*Math.PI*2;
        if(i===0) ctx.moveTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
        else ctx.lineTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
      }
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.stroke();
    // 🌌 世界2 三 Boss 的辨识度装饰（各自一个视觉锚点，扫一眼就能分清谁是谁）
    if(this.bossNum === 6){
      // 棱光八角：盘面上刻三道同心八边形环纹（实心八边形上"刻环"）+ 中心能量核 + 三颗旋转棱镜
      for(const k of [0.82, 0.60, 0.40]){
        ctx.beginPath();
        for(let i=0;i<8;i++){
          const a = Math.PI/8 + i/8*Math.PI*2;
          const px = this.x+Math.cos(a)*this.r*k, py = this.y+Math.sin(a)*this.r*k;
          if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(180,240,255,${0.30 + 0.12*(1-k)})`; ctx.lineWidth = 2; ctx.stroke();
      }
      const cg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.38);
      cg.addColorStop(0, 'rgba(240,255,255,0.95)');
      cg.addColorStop(0.55, 'rgba(120,215,255,0.55)');
      cg.addColorStop(1, 'rgba(60,160,230,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.38, 0, Math.PI*2);
      ctx.fillStyle = cg; ctx.fill();
      // 三颗绕中心旋转的棱镜（小菱形）
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(G.time*1.6);
      for(let i=0;i<3;i++){
        const pa = i/3*Math.PI*2, pr = this.r*0.62;
        const cx2 = Math.cos(pa)*pr, cy2 = Math.sin(pa)*pr;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2-6); ctx.lineTo(cx2+5, cy2); ctx.lineTo(cx2, cy2+6); ctx.lineTo(cx2-5, cy2);
        ctx.closePath();
        ctx.fillStyle = '#bff3ff'; ctx.fill();
      }
      ctx.restore();
      // 棱镜护盾（②技能期间）：外圈发光护盾
      if(this.b6shield > 0){
        const sa = Math.max(0, this.b6shield/2.0);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 14, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(140,240,255,${0.4 + 0.4*sa})`; ctx.lineWidth = 4; ctx.stroke();
      }
      // 尖角突刺（⑤技能激活中）：八枚角刺从八角伸出，扎向玩家
      if(this.b6spikeT > 0){
        const L = (this.b6spikeLen || 210*visionZoom()) * Math.min(1, this.b6spikeT/0.6 + 0.35);
        ctx.save();
        ctx.fillStyle = 'rgba(190,243,255,0.95)'; ctx.strokeStyle = '#eaffff'; ctx.lineWidth = 2;
        for(let i=0;i<8;i++){
          const a = Math.PI/8 + i/8*Math.PI*2;
          const bx = this.x + Math.cos(a)*this.r, by = this.y + Math.sin(a)*this.r;
          const tx = this.x + Math.cos(a)*(this.r + L), ty = this.y + Math.sin(a)*(this.r + L);
          const pa = a + Math.PI/2, pw = 12;
          ctx.beginPath();
          ctx.moveTo(bx + Math.cos(pa)*pw, by + Math.sin(pa)*pw);
          ctx.lineTo(tx, ty);
          ctx.lineTo(bx - Math.cos(pa)*pw, by - Math.sin(pa)*pw);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
    } else if(this.bossNum === 7){
      // 裂光十字：中心自转的菱形核心（金色十字的光源）
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(this.b7spin || 0);
      ctx.beginPath();
      ctx.moveTo(0, -this.r*0.34); ctx.lineTo(this.r*0.34, 0); ctx.lineTo(0, this.r*0.34); ctx.lineTo(-this.r*0.34, 0);
      ctx.closePath();
      ctx.fillStyle = '#8a5200'; ctx.fill();
      ctx.strokeStyle = '#fff8dc'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      // 十字斩（⑤技能激活中）：四道高伤激光（横竖 + 字），整体旋转
      if(this.b7slash){
        const len = this.b7slash.len, t = Math.max(0, this.b7slash.t/2.4);
        ctx.save(); ctx.lineCap = 'round';
        for(let i=0;i<4;i++){
          const ba = i*Math.PI/2 + this.b7slash.rot;
          const ex = this.x + Math.cos(ba)*len, ey = this.y + Math.sin(ba)*len;
          ctx.strokeStyle = `rgba(255,210,80,${0.30+0.30*t})`; ctx.lineWidth = 24;
          ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(ex,ey); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,235,0.95)'; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(ex,ey); ctx.stroke();
        }
        ctx.restore();
      }
    } else if(this.bossNum === 8){
      // 虚空裂界者：内嵌小三角形描边 + 中心睁开的"裂界之眼"（实心亮核）
      ctx.beginPath();
      for(let i=0;i<3;i++){
        const a = -Math.PI/2 + i/3*Math.PI*2;
        const px = this.x+Math.cos(a)*this.r*0.55, py = this.y+Math.sin(a)*this.r*0.55;
        if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,150,180,0.7)'; ctx.lineWidth = 2; ctx.stroke();
      // 中心能量核（实心亮核，⛔ 不许空心）
      const eg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.34);
      eg.addColorStop(0, 'rgba(255,228,238,0.95)');
      eg.addColorStop(0.55, 'rgba(255,80,140,0.55)');
      eg.addColorStop(1, 'rgba(180,20,70,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.34, 0, Math.PI*2);
      ctx.fillStyle = eg; ctx.fill();
      // 三颗绕眼旋转的暗红碎屑
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(-G.time*1.8);
      for(let i=0;i<3;i++){
        const pa = i/3*Math.PI*2, pr = this.r*0.5;
        ctx.beginPath(); ctx.arc(Math.cos(pa)*pr, Math.sin(pa)*pr, 3, 0, Math.PI*2);
        ctx.fillStyle = '#ff8fb0'; ctx.fill();
      }
      ctx.restore();
      // 场地分割（⑤技能激活中）：九宫格，仅 1 块安全，其余高频低伤（先预警再激活）
      if(this.b8zone){
        const z = this.b8zone, bw = WW()/z.grid, bh = WH()/z.grid;
        ctx.save();
        for(let r=0;r<z.grid;r++) for(let c=0;c<z.grid;c++){
          const idx = r*z.grid+c, safe = idx === z.safe;
          const x = c*bw, y = r*bh;
          if(z.phase === 'warn'){
            ctx.fillStyle = safe ? 'rgba(80,255,160,0.10)' : 'rgba(255,60,80,0.13)';
            ctx.fillRect(x,y,bw,bh);
            ctx.strokeStyle = safe ? 'rgba(120,255,180,0.85)' : 'rgba(255,90,110,0.85)';
            ctx.lineWidth = 2; ctx.strokeRect(x+1,y+1,bw-2,bh-2);
          } else {
            ctx.fillStyle = safe ? 'rgba(80,255,160,0.20)' : `rgba(255,50,70,${0.20+0.10*Math.sin(G.time*8)})`;
            ctx.fillRect(x,y,bw,bh);
            if(!safe){ ctx.strokeStyle='rgba(255,130,150,0.9)'; ctx.lineWidth=2; ctx.strokeRect(x+1,y+1,bw-2,bh-2); }
          }
        }
        ctx.fillStyle = z.phase==='warn' ? 'rgba(255,255,255,0.92)' : 'rgba(130,255,185,0.95)';
        ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(z.phase==='warn' ? '⚠ 红区即将危险 · 绿区安全' : '✔ 站绿区 · 离开红区', WW()/2, 30);
        ctx.restore();
      }
    } else if(this.bossNum === 9){
      // 碎撞巨像：常驻拖尾（由过往位置的半透明重影组成）
      if(this.b9trail && this.b9trail.length > 1){
        ctx.shadowBlur = 0;
        for(let i=0;i<this.b9trail.length;i++){
          const tp = this.b9trail[i];
          ctx.save();
          ctx.globalAlpha = 0.05 + 0.22*(i/this.b9trail.length);
          ctx.fillStyle = '#b06bff';
          ctx.beginPath();
          for(let k=0;k<5;k++){
            const a = -Math.PI/2 + k/5*Math.PI*2;
            const px = tp.x + Math.cos(a)*this.r, py = tp.y + Math.sin(a)*this.r;
            if(k===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
      // 碎撞巨像：中心实心能量核 + 朝冲撞方向的撞角（旋转三角鼻）+ 蓄力预警虚线
      const eg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.4);
      eg.addColorStop(0, 'rgba(230,200,255,0.95)');
      eg.addColorStop(0.55, 'rgba(176,107,255,0.55)');
      eg.addColorStop(1, 'rgba(120,60,200,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.4, 0, Math.PI*2);
      ctx.fillStyle = eg; ctx.fill();
      const P9 = targetOf(this);
      const fa = (this.b9charge && this.b9charge.a !== undefined) ? this.b9charge.a
               : (this.b9tele ? this.b9tele.a : (P9 ? angleTo(this, P9) : 0));
      const nose = this.b9charge ? this.r*0.9 : this.r*0.55;
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(fa);
      ctx.beginPath();
      ctx.moveTo(this.r*0.7, 0);
      ctx.lineTo(this.r + nose, -10);
      ctx.lineTo(this.r + nose, 10);
      ctx.closePath();
      ctx.fillStyle = (this.b9charge || this.b9tele) ? 'rgba(235,205,255,0.97)' : 'rgba(200,160,255,0.8)';
      ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
      // 蓄力预警：朝锁定方向的粉色虚线 + 感叹号
      if(this.b9tele){
        const a = this.b9tele.a, len = Math.hypot(WW(), WH());
        const pulse = 0.5 + 0.5*Math.sin(G.time*16);
        ctx.strokeStyle = `rgba(255,90,160,${0.35+0.35*pulse})`;
        ctx.lineWidth = 4; ctx.setLineDash([14,10]);
        ctx.beginPath(); ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(a)*len, this.y + Math.sin(a)*len);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,255,255,${0.8+0.2*pulse})`;
        ctx.font = 'bold 28px sans-serif'; ctx.textAlign='center';
        ctx.fillText('!', this.x, this.y - this.r - 14);
      }
      // 路径冲撞预警：画出随机拐弯的整条路径（虚线折线）+ 感叹号
      if(this.b9pathWarn){
        const pts = this.b9pathWarn.pts;
        const pulse = 0.5 + 0.5*Math.sin(G.time*16);
        ctx.strokeStyle = `rgba(255,90,160,${0.4+0.3*pulse})`;
        ctx.lineWidth = 4; ctx.setLineDash([14,10]);
        ctx.beginPath(); ctx.moveTo(this.x, this.y);
        for(const pt of pts) ctx.lineTo(pt.x, pt.y);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,255,255,${0.8+0.2*pulse})`;
        ctx.font = 'bold 28px sans-serif'; ctx.textAlign='center';
        ctx.fillText('!', this.x, this.y - this.r - 14);
      }
      // 沿路径冲撞中：画出剩余路径（淡虚线）提示走向
      if(this.b9path){
        const p = this.b9path;
        ctx.strokeStyle = 'rgba(200,140,255,0.5)';
        ctx.lineWidth = 3; ctx.setLineDash([10,8]);
        ctx.beginPath(); ctx.moveTo(this.x, this.y);
        for(let i=p.seg;i<p.pts.length;i++) ctx.lineTo(p.pts[i].x, p.pts[i].y);
        ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // 🌿 世界3 四 Boss 的辨识度装饰（各自一个视觉锚点，扫一眼就能分清谁是谁）
    if(this.bossNum === 10){
      // 万藤母巢：盘面三道同心圆环纹（种子荚的缝合线）+ 中心菌丝核 + 外圈蠕动尖刺 + 护壳光环
      for(const k of [0.80, 0.56, 0.32]){
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r*k, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(190,240,150,${0.28 + 0.14*(1-k)})`; ctx.lineWidth = 2; ctx.stroke();
      }
      const cg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.36);
      cg.addColorStop(0, 'rgba(245,255,220,0.95)');
      cg.addColorStop(0.55, 'rgba(140,210,90,0.55)');
      cg.addColorStop(1, 'rgba(60,120,40,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.36, 0, Math.PI*2);
      ctx.fillStyle = cg; ctx.fill();
      // 外圈蠕动尖刺：12 枚小棘随呼吸伸缩（母巢"活着"的证明）
      const pulse = 0.5 + 0.5*Math.sin(G.time*2.2);
      ctx.save();
      ctx.fillStyle = 'rgba(210,245,160,0.9)'; ctx.strokeStyle = '#eaffd0'; ctx.lineWidth = 1.5;
      for(let i=0;i<12;i++){
        const a = i/12*Math.PI*2 + G.time*0.4;
        const L = this.r*0.16*(0.6 + 0.4*pulse);
        const bx = this.x + Math.cos(a)*this.r*0.94, by = this.y + Math.sin(a)*this.r*0.94;
        const tx = this.x + Math.cos(a)*(this.r*0.94 + L), ty = this.y + Math.sin(a)*(this.r*0.94 + L);
        const pa = a + Math.PI/2, pw = 5;
        ctx.beginPath();
        ctx.moveTo(bx + Math.cos(pa)*pw, by + Math.sin(pa)*pw);
        ctx.lineTo(tx, ty);
        ctx.lineTo(bx - Math.cos(pa)*pw, by - Math.sin(pa)*pw);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      // 母巢护壳（⑤技能期间）：外圈发光护盾
      if(this.b10shell > 0){
        const sa = Math.max(0, this.b10shell/1.8);
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 16, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(170,240,120,${0.4 + 0.4*sa})`; ctx.lineWidth = 4; ctx.stroke();
      }
    } else if(this.bossNum === 11){
      // 蚀光古树：年轮（4 圈同心方框，越老越歪）+ 树心能量核 + 两根横伸的枯枝
      for(const k of [0.86, 0.64, 0.44, 0.26]){
        ctx.save();
        ctx.translate(this.x, this.y); ctx.rotate(k*0.25);
        const s = this.r*k;
        ctx.strokeStyle = `rgba(200,225,140,${0.26 + 0.12*(1-k)})`; ctx.lineWidth = 2;
        ctx.strokeRect(-s, -s, s*2, s*2);
        ctx.restore();
      }
      const tg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.40);
      tg.addColorStop(0, 'rgba(255,255,220,0.95)');
      tg.addColorStop(0.55, 'rgba(190,220,110,0.55)');
      tg.addColorStop(1, 'rgba(90,120,40,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.40, 0, Math.PI*2);
      ctx.fillStyle = tg; ctx.fill();
      // 两根横伸的枯枝（左右各一，随呼吸轻摆）
      const sway = Math.sin(G.time*1.1)*0.12;
      ctx.save();
      ctx.strokeStyle = '#5c4a22'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      for(const dir of [-1, 1]){
        ctx.beginPath();
        ctx.moveTo(this.x + dir*this.r*0.7, this.y - this.r*0.2);
        ctx.quadraticCurveTo(this.x + dir*this.r*1.25, this.y - this.r*0.45 + sway*this.r,
                             this.x + dir*this.r*1.5,  this.y - this.r*0.75 + sway*this.r*1.6);
        ctx.stroke();
      }
      ctx.restore();
      // 根刺冲撞预警（⑤技能蓄力中）：身周红圈 + 冲撞方向虚线
      if(this.b11ram > 0 || this.b11ram === 0 && this.b11rvx){
        const pulse = 0.5 + 0.5*Math.sin(G.time*16);
        ctx.strokeStyle = `rgba(255,90,60,${0.35+0.35*pulse})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 18 + (1-pulse)*10, 0, Math.PI*2); ctx.stroke();
      }
    } else if(this.bossNum === 12){
      // 蚀根龙王：中心龙眼（实心亮核 + 三颗绕眼转的暗红碎屑）+ 龙角 + 背脊棘
      const dg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.34);
      dg.addColorStop(0, 'rgba(255,235,225,0.95)');
      dg.addColorStop(0.55, 'rgba(230,90,60,0.55)');
      dg.addColorStop(1, 'rgba(120,20,10,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.34, 0, Math.PI*2);
      ctx.fillStyle = dg; ctx.fill();
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(-G.time*1.8);
      for(let i=0;i<3;i++){
        const pa = i/3*Math.PI*2, pr = this.r*0.52;
        ctx.beginPath(); ctx.arc(Math.cos(pa)*pr, Math.sin(pa)*pr, 3.5, 0, Math.PI*2);
        ctx.fillStyle = '#ff9a7a'; ctx.fill();
      }
      ctx.restore();
      // 龙角：头顶两只向后弯的角
      ctx.save();
      ctx.fillStyle = '#e8d8c0'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      for(const dir of [-1, 1]){
        ctx.beginPath();
        ctx.moveTo(this.x + dir*this.r*0.16, this.y - this.r*0.62);
        ctx.quadraticCurveTo(this.x + dir*this.r*0.55, this.y - this.r*1.02,
                             this.x + dir*this.r*0.30, this.y - this.r*1.22);
        ctx.quadraticCurveTo(this.x + dir*this.r*0.34, this.y - this.r*0.86,
                             this.x + dir*this.r*0.05, this.y - this.r*0.62);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      // 背脊棘：沿三角两侧一排小棘（最终 Boss 的凶相）
      ctx.save();
      ctx.fillStyle = 'rgba(255,190,160,0.9)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
      for(let i=0;i<5;i++){
        const t = 0.18 + i*0.16;
        const px = this.x - this.r*0.5 + this.r*1.0*t, py = this.y + this.r*0.42 - this.r*0.84*t;
        const L = 12 - i*1.4;
        ctx.beginPath();
        ctx.moveTo(px - 4, py + 4); ctx.lineTo(px, py - L); ctx.lineTo(px + 4, py + 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
      // 蚀根冲撞预警（②技能蓄力中）：冲撞方向虚线 + 感叹号
      if(this.b12charge && this.b12charge.t > 0.5){
        const pulse = 0.5 + 0.5*Math.sin(G.time*16);
        const a = Math.atan2(this.b12charge.vy, this.b12charge.vx);
        ctx.save(); ctx.setLineDash([12,10]);
        ctx.strokeStyle = `rgba(255,90,70,${0.35+0.35*pulse})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(a)*420, this.y + Math.sin(a)*420);
        ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,140,120,${0.6+0.4*pulse})`;
        ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('!', this.x, this.y - this.r - 14);
        ctx.restore();
      }
      // 龙息锥形（①技能喷发中）：面前扇形红光（看得见的火墙就是打得中的范围）
      if(this.b12breath){
        const b = this.b12breath, t = Math.max(0, b.t/0.9);
        ctx.save();
        ctx.translate(this.x, this.y); ctx.rotate(b.a);
        const g = ctx.createRadialGradient(0,0,this.r*0.5, 0,0, 430*visionZoom());
        g.addColorStop(0, `rgba(255,150,90,${0.30*t})`);
        g.addColorStop(1, 'rgba(255,80,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(0,0);
        ctx.arc(0, 0, 430*visionZoom(), -Math.PI/3.2, Math.PI/3.2);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    } else if(this.bossNum === 13){
      // 万秽之源：外圈六边形环纹 + 中心秽核 + 三颗绕核转的污团 + 定点污染光环
      for(const k of [0.82, 0.58, 0.34]){
        ctx.beginPath();
        for(let i=0;i<6;i++){
          const a = i/6*Math.PI*2 + k*0.3;
          const px = this.x+Math.cos(a)*this.r*k, py = this.y+Math.sin(a)*this.r*k;
          if(i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(190,210,120,${0.28 + 0.12*(1-k)})`; ctx.lineWidth = 2; ctx.stroke();
      }
      const sg = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*0.38);
      sg.addColorStop(0, 'rgba(240,250,200,0.95)');
      sg.addColorStop(0.55, 'rgba(150,180,80,0.55)');
      sg.addColorStop(1, 'rgba(60,80,30,0.10)');
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r*0.38, 0, Math.PI*2);
      ctx.fillStyle = sg; ctx.fill();
      // 三颗绕核旋转的污团（边转边滴）
      ctx.save();
      ctx.translate(this.x, this.y); ctx.rotate(G.time*1.4);
      for(let i=0;i<3;i++){
        const pa = i/3*Math.PI*2, pr = this.r*0.62;
        ctx.beginPath(); ctx.arc(Math.cos(pa)*pr, Math.sin(pa)*pr, 7, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(120,150,70,0.9)'; ctx.fill();
        ctx.beginPath(); ctx.arc(Math.cos(pa)*pr, Math.sin(pa)*pr, 3.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(220,240,170,0.9)'; ctx.fill();
      }
      ctx.restore();
      // 定点污染（⑤技能激活中）：身周不断外扩的污环
      if(this.b13beacon > 0){
        const k = 1 - Math.max(0, this.b13beacon/2.4);
        const rr = this.r + 20 + k*70;
        ctx.beginPath(); ctx.arc(this.x, this.y, rr, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(160,200,90,${0.5*(1-k)})`; ctx.lineWidth = 4; ctx.stroke();
      }
    }
    ctx.restore();
    // 施法光环：大招喷发期间脚下的橙色警示圈（Boss2岩浆定身时可见）
    if(this.casting > 0){
      const cp = this.casting / 3;
      ctx.strokeStyle = `rgba(255,120,20,${0.35 + 0.3*Math.sin(G.time*12)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 18 + (1-cp)*12, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = `rgba(255,90,0,${0.10 + 0.08*Math.sin(G.time*12)})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 18 + (1-cp)*12, 0, Math.PI*2); ctx.fill();
    }
    // 暗影突进预警：头顶感叹号 + 冲刺方向虚线（Boss1 暗影狂暴专属）
    if(this.shadowDash && this.shadowDash.state === 'tele'){
      const pulse = 0.5 + 0.5*Math.sin(G.time*16);
      ctx.strokeStyle = `rgba(255,80,200,${0.35+0.35*pulse})`;
      ctx.lineWidth = 3; ctx.setLineDash([12,10]);
      ctx.beginPath(); ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.shadowDash.dx*300, this.y + this.shadowDash.dy*300);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,120,220,${0.6+0.4*pulse})`;
      ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('!', this.x, this.y - this.r - 14);
    }
    // hp bar
    const bw = this.r*2.5;
    ctx.fillStyle='rgba(0,0,0,.6)';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw, 5);
    ctx.fillStyle='#f44';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw*clamp(this.hp/this.maxHp, 0, 1), 5);
  }
}

// ===== WRATH BOSS (小怪之怒) =====
// 虚空主宰半血剧情后出现的第二个Boss：集合7种小怪特性的融合体
// 血量4500 / 速度145（介于普通110与快速180之间）/ 接触伤15 / 体型圆r26 / 普通怪颜色#f44
// 技能：冲撞(CD3s蓄力1s冲刺8倍速1160撞墙不眩晕，冲撞时暂停其他技能)、激光(锁2s→警0.5s→射2s 追踪玩家40°/s DPS8黄，光束穿人不截断)、
//       远程弹幕(0.45s3发 弹速400 蓝 r10)，1/3概率变粘液弹(r13 不可被盾挡)；技能互斥：冲撞/激光释放期间不叠加其他技能
class WrathBoss extends Enemy {
  constructor(x,y){
    // 📉 常规模式削弱（♾无尽模式维持原强度）：血量/速度/接触伤全面下调
    const soft = !G.endlessOn;
    super(x, y, soft ? 2600 : 4500, soft ? 130 : 145, soft ? 12 : 15, 26, '#f44'); // 小怪之怒：常规模式 2600血/130速/12伤（玩家反馈30波太难，4500→3300→再削）；♾无尽模式维持 4500/145/15
    this.isBoss = true;
    this.isWrath = true;
    this.name = '小怪之怒';
    this.bodyColor = '#f44';
    this.xpNextMul = 1.6; // 小怪之怒宝石：按拾取者当前升级需求×1.6 结算
    this.flash = 0; this.critShake = 0; this.deathShake = 0; this.dying = false;
    this.soft = soft; // 📉 本实例是否吃到常规模式削弱（构造时定死，之后不随无尽开关变化）
    // 冲撞：CD / 蓄力 / 冲刺：📉 常规模式=CD3.8s/蓄力1.4s/4.5倍速(585)；♾无尽模式维持 3s/1s/8倍速(1160)；撞墙不眩晕
    this.chargeCD = soft ? 3.8 : 3;
    this.chargeWindup = soft ? 1.4 : 1;
    this.chargeMul = soft ? 4.5 : 8;
    this.chargeState = 'chase'; this.chargeTimer = this.chargeCD; this.chargeDir = {x:1,y:0};
    // 激光：lock锁 → warn预警 → fire射；全程匀速转向（最大 laserTurn），任何阶段都不瞬移对准玩家
    // 📉 常规模式：锁定2s→2.6s、预警0.5s→0.7s、照射2s→1.5s、DPS 8→6
    this.laserLock = soft ? 2.6 : 2;
    this.laserWarn = soft ? 0.7 : 0.5;
    this.laserFire = soft ? 1.5 : 2;
    this.laserDps  = soft ? 6 : 8;
    this.laserState = 'lock'; this.laserTimer = this.laserLock; this.laserAngle = 0; this.laserLen = 0;
    this.laserTurn = Math.PI/7.2; // 25°/s：走位够快可甩开光束（原本40°/s太黏 + 每轮还会瞬间对准）
    // 弹幕：3发/轮
    this.shootTimer = 0;
    this.touchCD = 0;
  }
  update(dt){
    if(this.dead) return;
    if(this.flash>0) this.flash -= dt;
    if(this.touchCD>0) this.touchCD -= dt;
    // 击退（护盾可弹开Boss）：全状态生效，指数衰减
    if(this.kbx!==0 || this.kby!==0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt);
      this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx)<1 && Math.abs(this.kby)<1){ this.kbx=0; this.kby=0; }
    }
    // ⚠️ 击退之后必须把 Boss 拉回场地内（2026-10-06 修 bug）：
    //    下面「蓄力(windup)」分支是 return 早退、**从来没有边界钳制**（chase 才有）。
    //    护盾球把 Boss 推出场外后，它会在场外原地站完整个蓄力（常规模式 1.4 秒 / 60fps ≈ 84 帧），
    //    等冲撞开始那一帧才被 charge 分支的 clamp 一把拉回场地 → **单帧位移可达 70px+**，
    //    玩家看到的就是"小怪之怒突然闪一下 / 消失了一下"。
    //    这里统一兜底：任何状态都不许待在场地外。
    this.x = clamp(this.x, this.r, WW()-this.r);
    this.y = clamp(this.y, this.r, WH()-this.r);
    const p = targetOf(this); // 双人：锁定最近存活玩家
    // ===== 冲撞状态机（蓄力/冲刺期间暂停其他技能）=====
    if(this.chargeState === 'windup'){
      this.chargeTimer -= dt;
      if(this.chargeTimer <= 0){
        this.chargeState = 'charge';
        this._chPX = undefined; this.chargeBlockT = 0; // 新一次冲撞：重置"被挡住"判定
        spawnParticles(this.x, this.y, '#f5a', 8);
      }
      return; // 蓄力期间暂停其他技能
    }
    if(this.chargeState === 'charge'){
      // 📌 被掩体挡住 → 结束这次冲撞（2026-10-06 修 bug）：
      //    冲撞只能由「撞世界边界」或「撞到玩家」结束，**没有时长上限**。而土墙是在敌人更新
      //    之后把 Boss 顶回表面的 → Boss 每帧"往墙里走 9.75px、又被推回原地"，净值≈0，
      //    两个结束条件永远都碰不到 → **冲撞状态永不结束**，而冲撞分支会 return 掉全部技能，
      //    于是小怪之怒顶着墙原地站到墙自己塌掉（次数越多越久，满级土墙可达 12 秒），
      //    玩家看到的就是"小怪之怒卡住不动、不放招"。
      //    判定：与上一帧的"起点"比净值位移，连续 0.35 秒纹丝不动 = 被墙顶住，与撞世界边界同一处理。
      const netFromPrev = (this._chPX === undefined) ? 99
        : Math.hypot(this.x - this._chPX, this.y - this._chPY);
      this._chPX = this.x; this._chPY = this.y;
      this.chargeBlockT = netFromPrev < 2 ? (this.chargeBlockT || 0) + dt : 0;
      if(this.chargeBlockT > 0.35){
        this.chargeBlockT = 0; this._chPX = undefined;
        this.chargeState = 'chase'; this.chargeTimer = this.chargeCD; // 撞墙不眩晕，冷却后再次冲撞
        spawnParticles(this.x, this.y, '#f9c', 6);
        return;
      }
      // 冲刺：📉 常规模式 4.5倍速(585，玩家反馈第30波太难，8倍速1160→6倍速870→再削)；♾无尽模式维持8倍速(1160)。撞墙不眩晕
      const cSpd = this.speed * this.chargeMul;
      this.x += this.chargeDir.x * cSpd * dt;
      this.y += this.chargeDir.y * cSpd * dt;
      if(Math.random()<0.6) spawnParticles(this.x, this.y, '#f9c', 1);
      const cands2 = bossHitTargets();
      for(const Q of cands2){
        if(Q && dist(this,Q) < this.r+Q.r && this.touchCD<=0){
          Q.takeDamage(this.dmg, this); this.touchCD = 0.8;
          pushPlayer(Q, this.x, this.y, 560); // boss冲撞击退
          this.chargeState = 'chase'; this.chargeTimer = this.chargeCD;
          break;
        }
      }
      if(this.x < this.r || this.x > WW()-this.r || this.y < this.r || this.y > WH()-this.r){ // 👁️按扩大后世界判边
        this.x = clamp(this.x, this.r, WW()-this.r);
        this.y = clamp(this.y, this.r, WH()-this.r);
        this.chargeState = 'chase'; this.chargeTimer = this.chargeCD; // 撞墙不眩晕，冷却后再次冲撞
      }
      return; // 冲撞期间暂停其他技能
    }
    // ===== chase：追击（速度=this.speed，📉常规模式130/♾145）+ 各技能 =====
    const a = angleTo(this, p);
    this.x += Math.cos(a)*this.speed*dt;
    this.y += Math.sin(a)*this.speed*dt;
    this.x = clamp(this.x, this.r, WW()-this.r); // 👁️视野扩大：活动边界随世界扩大
    this.y = clamp(this.y, this.r, WH()-this.r);
    const cands2 = bossHitTargets();
    for(const Q of cands2){
      if(Q && dist(this,Q) < this.r+Q.r && this.touchCD<=0){
        Q.takeDamage(this.dmg, this); this.touchCD = 0.8;
        pushPlayer(Q, this.x, this.y, 560); // boss体术击退
        break;
      }
    }
    // 冲撞冷却（技能互斥：激光预警/发射期间不启动冲撞）
    const laserBusy = this.laserState === 'warn' || this.laserState === 'fire';
    if(!laserBusy){
      this.chargeTimer -= dt;
      if(this.chargeTimer <= 0){
        this.chargeState = 'windup';
        this.chargeTimer = this.chargeWindup; // 📉 常规模式蓄力 1.4s（预警更久更好躲）/ ♾ 1s
        this.chargeDir = {x:Math.cos(a), y:Math.sin(a)};
        SND.charge();
      }
    }
    // ===== 激光状态机：锁定 → 预警 → 照射（追踪玩家）=====
    this.laserTimer -= dt;
    if(this.laserState === 'lock'){
      // 锁定阶段也匀速转向（不瞬移）：玩家能看见光束缓慢扫过来，才有得躲
      this.turnLaser(angleTo(this, p), dt);
      if(this.laserTimer <= 0){
        this.laserState = 'warn';
        this.laserTimer = this.laserWarn;
      }
    } else if(this.laserState === 'warn'){
      if(this.laserTimer <= 0){
        this.laserState = 'fire';
        this.laserTimer = this.laserFire;
        SND.bossWarn();
      }
    } else if(this.laserState === 'fire'){
      // 追踪玩家：匀速转向（最大 laserTurn=25°/s），走位够快可甩开光束
      this.turnLaser(angleTo(this, p), dt);
      const dx = Math.cos(this.laserAngle), dy = Math.sin(this.laserAngle);
      let len = Infinity;
      if(dx > 1e-6) len = Math.min(len, (W-this.x)/dx);
      if(dx < -1e-6) len = Math.min(len, (-this.x)/dx);
      if(dy > 1e-6) len = Math.min(len, (H-this.y)/dy);
      if(dy < -1e-6) len = Math.min(len, (-this.y)/dy);
      // 双人：光路上所有玩家都结算（护盾球可挡激光，继承激光怪特性）；光束穿人——不在玩家处截断
      const laserCands = bossHitTargets();
      let shMin = null; // 最近的盾球截断点（仅用于光束视觉）
      for(const Q of laserCands){
        if(!Q) continue;
        const tq = rayCircleHit(this.x, this.y, dx, dy, Q.x, Q.y, Q.r + 9*visionZoom()); // 👁️激光判定宽度等比缩小
        let shT = null;
        if(Q.shield > 0){
          for(let i=0;i<Q.shield;i++){
            const sa = Q.shieldAngle + i*(Math.PI*2/Q.shield);
            const t2 = rayCircleHit(this.x, this.y, dx, dy, Q.x+Math.cos(sa)*45, Q.y+Math.sin(sa)*45, 16 + 9*visionZoom());
            if(t2 !== null && (shT===null || t2<shT)) shT = t2;
          }
        }
        if(shT !== null && (tq===null || shT < tq)){
          Q.shieldFlash = 0.1;
          SND.shieldBlock();
          if(shMin === null || shT < shMin) shMin = shT; // 盾挡：该玩家不受伤，光束在此截断
        } else if(tq !== null && !vampBlocked(Q, this)){
          Q.hp -= this.laserDps*dt; // 📉 常规模式 DPS 6（原 8），绕过无敌帧
          Q.dotFlash = 0.15;
          if(Q.hp <= 0){ Q.hp = 0; if(G.coop) coopPlayerDie(Q); else gameOver(); }
        }
      }
      if(shMin !== null) len = Math.min(len, Math.max(0, shMin - 50));
      this.laserLen = len;
      if(this.laserTimer <= 0){
        this.laserState = 'lock';
        this.laserTimer = this.laserLock;
      }
    }
    // ===== 远程弹幕：📉 常规模式 0.9s 3发 / 弹速320（0.45s→0.6s→再削）；♾无尽模式维持 0.45s / 400。1/3概率变粘液弹（技能互斥：激光预警/发射期间停火）=====
    if(!laserBusy){
      this.shootTimer += dt;
      const shootCd = this.soft ? 0.9 : (G.endlessOn ? 0.45 : 0.6);
      const bSpd = this.soft ? 320 : 400;
      if(this.shootTimer >= shootCd){
        this.shootTimer = 0;
        const baseA = angleTo(this, p);
        const spread = Math.PI/6; // 远程怪30°散射
        for(let i=0;i<3;i++){
          const ang = baseA + (i-1)*spread;
          if(Math.random() < 1/3){
            this.fireSlimeBullet(p.x, p.y, Math.cos(ang)*bSpd, Math.sin(ang)*bSpd);
          } else {
            fireEnemyBullet(this.x, this.y, Math.cos(ang)*bSpd, Math.sin(ang)*bSpd, 10, 6, '#4af'); // Boss弹幕更大（r10）
          }
        }
      }
    }
  }
  // 激光转向：以最大 laserTurn（25°/s）匀速朝目标角转，任何阶段都不瞬移对准玩家（保证可躲）
  turnLaser(ta, dt){
    let da = ta - this.laserAngle;
    while(da > Math.PI) da -= Math.PI*2;
    while(da < -Math.PI) da += Math.PI*2;
    const maxStep = this.laserTurn * dt;
    this.laserAngle += Math.max(-maxStep, Math.min(maxStep, da));
  }
  // 粘液弹（绿）：护盾不可挡；滑行到发射时玩家位置→变一滩粘液（半径=boss自身r×2）；滑行中碰到玩家→变粘液+扣弹伤
  // 📌 水洼大小只看「小怪之怒自身半径」：r26 ×2 = 52（2026-10-05 用户澄清：×2 是给水洼的，不是给粘液弹的）
  // 📉 常规模式：碰人伤害 8→5
  fireSlimeBullet(tx, ty, vx, vy){
    const br = this.r; // 小怪之怒自身半径（r26），水洼以此为唯一基准
    G.enemies.push({
      isBullet:true, fromWrath:true, owner:this, x:this.x, y:this.y, vx, vy, r:13, // 粘液弹本体半径（原样 r13）
      hp:999, maxHp:999, dead:false, flash:0, dmg: this.soft ? 5 : 8,
      color:'#5c5', touchCD:0, speed:0, kbx:0, kby:0,
      st:{x:tx, y:ty},
      update(dt){
        this.x += this.vx*dt; this.y += this.vy*dt;
        // 滑行中碰到玩家：变粘液 + 扣正常弹伤害（护盾不可挡）；双人检查所有存活玩家
        const cands = bossHitTargets();
        for(const P of cands){
          if(!P) continue;
          if(dist(this, P) < this.r + P.r){
            G.slimes.push(new Slime(this.x, this.y, br*2)); // 水洼=小怪之怒自身r×2
            P.takeDamage(this.dmg, this);
            this.dead = true;
            return;
          }
        }
        // 到达目标点：变成一滩粘液（半径=小怪之怒自身r×2）
        if(Math.hypot(this.x-this.st.x, this.y-this.st.y) < 14){
          G.slimes.push(new Slime(this.x, this.y, br*2));
          this.dead = true;
          return;
        }
        if(this.x<-20||this.x>WW()+20||this.y<-20||this.y>WH()+20) this.dead=true; // 👁️视野扩大：弹幕出界按扩大后世界
      },
      draw(){
        ctx.fillStyle = 'rgba(120,255,120,0.85)';
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle='#0a0';
        ctx.beginPath(); ctx.arc(this.x,this.y,this.r*0.4,0,Math.PI*2); ctx.fill();
      },
      takeDamage(){},
    });
  }
  draw(){
    // 圆形身体（继承普通怪颜色）
    ctx.save();
    if(this.dying) ctx.translate((Math.random()-0.5)*14, (Math.random()-0.5)*10);
    ctx.shadowColor = this.flash>0 ? '#fff' : '#f44';
    ctx.shadowBlur = 20;
    ctx.fillStyle = this.flash>0 ? '#fff' : this.bodyColor;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.stroke();
    ctx.restore();
    // 冲撞蓄力方向提示（粉）
    if(this.chargeState === 'windup'){
      const prog = 1 - this.chargeTimer/1;
      const a = Math.atan2(this.chargeDir.y, this.chargeDir.x);
      ctx.strokeStyle = `rgba(255,120,190,${0.35 + prog*0.55})`;
      ctx.lineWidth = 3 + prog*4;
      ctx.setLineDash([8,6]);
      ctx.beginPath(); ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(a)*(this.r+40+prog*20), this.y + Math.sin(a)*(this.r+40+prog*20));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // 激光预警线（红，0.5s提示）
    if(this.laserState === 'warn'){
      const pulse = 0.5+0.5*Math.sin(G.time*14);
      ctx.strokeStyle = `rgba(255,60,0,${0.4+0.4*pulse})`;
      ctx.lineWidth = 3;
      ctx.setLineDash([10,8]);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + Math.cos(this.laserAngle)*1500, this.y + Math.sin(this.laserAngle)*1500);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,60,0,${0.7+0.3*pulse})`;
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', this.x, this.y - this.r - 14);
    }
    // hp bar
    const bw = this.r*2.5;
    ctx.fillStyle='rgba(0,0,0,.6)';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw, 5);
    ctx.fillStyle='#f44';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw*clamp(this.hp/this.maxHp, 0, 1), 5);
    if(this.frozen > 0) drawFrozenShell(this.x, this.y, this.r, this.frozen, this.frozenMax); // ❄️ 冰冻冰壳
  }
  // 激光光束（fire阶段在渲染层最上层绘制，完整可见）
  drawLaserBeam(){
    const a = this.laserAngle;
    const len = isFinite(this.laserLen) ? this.laserLen : 1500;
    const ex = this.x + Math.cos(a)*len;
    const ey = this.y + Math.sin(a)*len;
    const pulse = 1 + Math.sin(G.time*20)*0.1;
    const lwv = visionZoom(); // 👁️视野扩大：光束绘制宽度与判定宽度同步缩放
    // 外圈光晕（黄，继承激光怪颜色）
    ctx.strokeStyle = `rgba(255,210,40,${0.3*pulse})`;
    ctx.lineWidth = 26*lwv;
    ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
    // 内核
    ctx.strokeStyle = 'rgba(255,255,210,.95)';
    ctx.lineWidth = 7*lwv;
    ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
    // 光束终点火花
    if(isFinite(this.laserLen)){
      ctx.fillStyle = `rgba(255,230,120,${0.5+0.3*Math.sin(G.time*20)})`;
      ctx.beginPath(); ctx.arc(ex, ey, 5*lwv, 0, Math.PI*2); ctx.fill();
    }
  }
  die(){
    if(this.dead) return;
    this.dead = true;
    // 清除它产生的粘液弹
    G.enemies = G.enemies.filter(e => !e.fromWrath);
    const wg = new ExpGem(this.x, this.y, 0, '#f44', 14, true); // 小怪之怒宝石：价值按拾取者需求动态结算
    wg.xpNextMul = this.xpNextMul; // 关键：把 ×1.6 倍率传给宝石（否则宝石 val=0 → 捡了没经验）
    G.gems.push(wg);
    spawnParticles(this.x, this.y, '#f44', 30);
    healOnKill(this.lastHitIdx); // 挑战模式吸血（双人按击杀归属结算）
    G.screenShake = 20;
    G.wrathBoss = null;
    // 双Boss：虚空主宰也死了才算这一波结束（普通模式第30波=通关；♾ 无尽模式=推进到下一波）
    if(!G.boss || G.boss.dead){
      if(isFinalBossWave()){
        winGame();
      } else if(G.inBossWave){
        G.inBossWave = false;
        const bw = document.getElementById('boss-bar-wrap');
        if(bw) bw.style.display = 'none';
        G.wave++; // ♾ 无尽轮回：双Boss清完继续下一波
        startWave(G.wave);
      }
    }
  }
}

// ===== 🔷 棱光穹主（仅 ♾ 无尽模式登场：第 40/80/120… 波，即每 4 个 Boss 一轮的第 4 位）=====
// 定位：全技能都是激光的「走位考试」——不召唤小怪、不召唤小怪之怒、不发射一颗弹幕，只有光。
//   ① 主光束·追踪扫射：瞄准（虚线预警，匀速转向可被走位甩开）→ 照射（持续 DPS），招式间穿插
//   ② 三棱分光：3 道 ±20° 光束整体缓慢自转（棱镜色散：青/蓝/紫三色）
//   ③ 旋转光环：6/8 道等角光束像旋转门一样转，逼玩家跟着缝隙绕圈
//   ④ 光柱雨：玩家附近落下数道垂直光柱（预警圈 → 照射，区域封锁）
// 狂暴（<45% 血 → phase1）：转速/节拍全面提升、光柱更多更粗
// 判定口径与其它敌方激光完全一致：光柱半宽 × visionZoom()（绘制同系数 → 视觉=判定）；
// 光束穿人穿怪、被墙截断，护盾球能挡（与「小怪之怒」激光同一套规则）
class LaserBoss extends Enemy {
  constructor(tier){
    tier = Math.max(1, tier || 1);
    const hp = Math.round(5200 * (1 + (tier - 1) * 0.9)); // 比同轮虚空主宰（6000）略薄：威胁在光束密度而非血厚
    super(WW()/2, 130, hp, 95, 26, 40, '#2ee6ff');
    this.bossNum = 4;        // 造型/AI 分派标识（1/2/3 归 Boss 类，4 = 棱光穹主）
    this.tier = tier;
    this.isBoss = true;
    this.isLaserBoss = true; // 纯激光 Boss 标记：渲染层画光束 / 测试断言用
    this.name = '棱光穹主' + (tier > 1 ? ' · 第' + tier + '轮' : '');
    this.bodyColor = '#5ce1ff';
    this.xpNextMul = 1.5;    // 宝石：按拾取者当前升级需求 ×1.5 结算
    this.phase = 0;
    this.touchCD = 0;
    this.flash = 0; this.critShake = 0; this.deathShake = 0; this.dying = false;
    this.beams = [];   // 本帧全部光束（绘制与判定同源）：{ang, len, w, dps, tint, hue}
    this.pillars = []; // 光柱雨：{x, y, r, warn, t}
    this.aimState = 'aim'; this.aimT = 1.1; this.aimAngle = Math.PI/2;
    this.seq = ['sweep','fan','sweep','halo','sweep','rain']; // 招式轮换（主光束穿插在中间）
    this.seqIdx = 0; this.seqT = 0; this.seqDur = 0;
    this.spin = 1; this.driftT = 0; this.haloA = 0; this.fanA = 0;
    this.enterStep(this.seq[0]);
  }
  get rage(){ return this.phase >= 1; } // 狂暴（血量 <45%）
  dpsTier(){ return 1 + (this.tier - 1) * 0.25; } // ♾ 每多一轮，光束伤害 +25%
  enterStep(step){
    const rage = this.rage;
    this.seqT = 0;
    const T = targetOf(this) || { x:this.x, y:this.y + 100 };
    if(step === 'sweep'){        // 主光束：瞄准 → 照射
      this.seqDur = rage ? 2.3 : 2.7;
      this.aimState = 'aim'; this.aimT = rage ? 0.85 : 1.15;
    } else if(step === 'fan'){   // 三棱分光
      this.seqDur = rage ? 2.8 : 2.3;
      this.fanA = angleTo(this, T);
    } else if(step === 'halo'){  // 旋转光环
      this.seqDur = rage ? 3.3 : 2.9;
      this.haloA = Math.random()*Math.PI*2;
      this.spin = Math.random() < 0.5 ? -1 : 1;
    } else if(step === 'rain'){  // 光柱雨（一次性投放，后续靠 pillars 自行预警/照射）
      this.seqDur = 2.0;
      this.spawnPillars();
    }
  }
  update(dt){
    if(this.dead) return;
    if(this.flash > 0) this.flash -= dt;
    if(this.touchCD > 0) this.touchCD -= dt;
    if(this.critShake > 0) this.critShake -= dt;
    // 击退（护盾可弹开 Boss）：指数衰减
    if(this.kbx !== 0 || this.kby !== 0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx) < 1 && Math.abs(this.kby) < 1){ this.kbx = 0; this.kby = 0; }
    }
    // 暴击眩晕：定身 + 光束熄灭（光柱已落地的继续烧完）
    if(this.stun > 0){ this.stun -= dt; this.beams = []; return; }
    if(this.phase === 0 && this.hp < this.maxHp * 0.45){
      this.phase = 1; this.seqT = 0;   // 棱光狂暴
      SND.bossWarn(); G.screenShake = 12;
      spawnParticles(this.x, this.y, '#bef', 26);
    }
    this.moveLaserBoss(dt);
    this.seqT += dt;
    if(this.seqT >= this.seqDur){ // 换下一招
      this.seqIdx = (this.seqIdx + 1) % this.seq.length;
      this.enterStep(this.seq[this.seqIdx]);
    }
    this.beams = [];
    const step = this.seq[this.seqIdx];
    if(step === 'sweep') this.stepSweep(dt);
    else if(step === 'fan') this.stepFan(dt);
    else if(step === 'halo') this.stepHalo(dt);
    this.applyBeams(dt);
    this.updatePillars(dt);
    this.touchPlayer(dt);
  }
  // 走位：站得远（激光的射程优势）+ 绕玩家缓慢环绕漂移，轨迹可预判
  moveLaserBoss(dt){
    const T = targetOf(this);
    if(!T) return;
    const rage = this.rage;
    const pd = dist(this, T), ang = angleTo(this, T);
    const near = rage ? 250 : 300, far = rage ? 400 : 470;
    this.driftT += dt;
    const sway = Math.sin(this.driftT * (rage ? 1.2 : 0.85)) * 0.4;
    const tanAng = ang + this.spin*Math.PI/2 + sway;
    const radial = pd < near ? -1.4 : (pd > far ? 1.0 : 0);
    let vx = Math.cos(ang)*radial + Math.cos(tanAng);
    let vy = Math.sin(ang)*radial + Math.sin(tanAng);
    const m = Math.hypot(vx, vy) || 1;
    const sp = this.speed * (rage ? 1.35 : 1);
    this.x = clamp(this.x + vx/m*sp*dt, this.r + 10, WW()-this.r-10);
    this.y = clamp(this.y + vy/m*sp*dt, this.r + 10, WH()-this.r-10);
  }
  // 光束几何截断长度：只按墙算（光束穿人穿怪；盾球抵挡只影响伤害，不截断视觉）
  beamLenAt(ang){
    const dx = Math.cos(ang), dy = Math.sin(ang);
    let len = Infinity;
    if(dx >  1e-6) len = Math.min(len, (WW()-this.x)/dx);
    if(dx < -1e-6) len = Math.min(len, -this.x/dx);
    if(dy >  1e-6) len = Math.min(len, (WH()-this.y)/dy);
    if(dy < -1e-6) len = Math.min(len, -this.y/dy);
    return isFinite(len) ? Math.max(0, len) : 1500;
  }
  // 匀速转向（保证任何阶段都不会瞬移对准玩家：能看见光扫过来，才有得躲）
  turnAim(ta, dt, maxRate){
    let da = ta - this.aimAngle;
    while(da > Math.PI) da -= Math.PI*2;
    while(da < -Math.PI) da += Math.PI*2;
    const mx = maxRate*dt;
    this.aimAngle += Math.max(-mx, Math.min(mx, da));
  }
  // ① 主光束：瞄准期只画虚线（不结算伤害），随后照射追踪
  stepSweep(dt){
    const T = targetOf(this), rage = this.rage;
    if(this.aimState === 'aim'){
      if(T) this.turnAim(angleTo(this, T), dt, rage ? Math.PI/5 : Math.PI/6);
      this.beams.push({ ang:this.aimAngle, len:this.beamLenAt(this.aimAngle), w:3, dps:0, tint:'warn' });
      this.aimT -= dt;
      if(this.aimT <= 0){ this.aimState = 'fire'; SND.bossWarn(); G.screenShake = Math.max(G.screenShake||0, 6); }
      return;
    }
    if(T) this.turnAim(angleTo(this, T), dt, rage ? Math.PI/4.5 : Math.PI/6);
    this.beams.push({
      ang:this.aimAngle, len:this.beamLenAt(this.aimAngle),
      w:(rage ? 13 : 11)*visionZoom(), dps:(rage ? 30 : 24), tint:'prime', hue:192,
    });
  }
  // ② 三棱分光：青/蓝/紫三色光束整体自转
  stepFan(dt){
    const rage = this.rage;
    this.fanA += this.spin * (rage ? 1.15 : 0.85) * dt;
    const w = (rage ? 11 : 9) * visionZoom();
    const spread = rage ? 0.42 : 0.36;
    const hues = [192, 216, 286]; // 棱镜色散
    for(let i = 0; i < 3; i++){
      const a = this.fanA + (i-1)*spread;
      this.beams.push({ ang:a, len:this.beamLenAt(a), w, dps:(rage ? 19 : 16), tint:'fan', hue:hues[i] });
    }
  }
  // ③ 旋转光环：等角光束整体旋转，形成"旋转门"
  stepHalo(dt){
    const rage = this.rage;
    const n = rage ? 8 : 6;
    this.haloA += this.spin * (rage ? 0.72 : 0.55) * dt;
    const w = (rage ? 11 : 9) * visionZoom();
    for(let i = 0; i < n; i++){
      const a = this.haloA + i/n*Math.PI*2;
      this.beams.push({ ang:a, len:this.beamLenAt(a), w, dps:(rage ? 17 : 14), tint:'halo', hue: 190 + (i/n)*150 });
    }
  }
  // ④ 光柱雨：第一道砸玩家脚下，其余在附近散落（区域封锁，逼持续走位）
  spawnPillars(){
    const rage = this.rage;
    const n = rage ? 7 : 5;
    const T = targetOf(this);
    for(let i = 0; i < n; i++){
      let x, y;
      if(T && i === 0){ x = T.x; y = T.y; }
      else if(T){ x = T.x + rand(-220, 220); y = T.y + rand(-170, 170); }
      else { x = rand(120, WW()-120); y = rand(120, WH()-120); }
      this.pillars.push({
        x: clamp(x, 44, WW()-44), y: clamp(y, 44, WH()-44),
        r:(rage ? 46 : 40)*visionZoom(), warn:0.75, t: rage ? 1.15 : 0.95,
      });
    }
    SND.warnUp();
  }
  updatePillars(dt){
    if(!this.pillars.length) return;
    const dps = (this.rage ? 40 : 34) * this.dpsTier();
    const cands = bossHitTargets();
    for(const p of this.pillars){
      let left = dt;
      if(p.warn > 0){ // 预警期不结算伤害（本帧跨过预警结束时，只结算剩下的那部分）
        const use = Math.min(p.warn, left);
        p.warn -= use; left -= use;
        if(p.warn > 1e-9 || left <= 0) continue;
      }
      p.t -= left;
      for(const Q of cands){ if(Q && dist(p, Q) < p.r + Q.r) this.burnPlayer(Q, dps, left); }
    }
    this.pillars = this.pillars.filter(p => p.t > 0);
  }
  // 光束伤害：光路上所有玩家结算（护盾球能挡），穿人不截断 —— 与「小怪之怒」激光同一套规则
  applyBeams(dt){
    const cands = bossHitTargets();
    for(const b of this.beams){
      if(!b.dps) continue;
      const dx = Math.cos(b.ang), dy = Math.sin(b.ang);
      for(const Q of cands){
        if(!Q) continue;
        const tq = rayCircleHit(this.x, this.y, dx, dy, Q.x, Q.y, Q.r + b.w);
        if(tq === null || tq > b.len) continue; // 墙上这一段外够不到
        let blocked = false;
        if(Q.shield > 0){
          for(let i = 0; i < Q.shield; i++){
            const sa = Q.shieldAngle + i*(Math.PI*2/Q.shield);
            const t2 = rayCircleHit(this.x, this.y, dx, dy, Q.x+Math.cos(sa)*45, Q.y+Math.sin(sa)*45, 16 + b.w);
            if(t2 !== null && t2 <= tq){ blocked = true; break; }
          }
        }
        if(blocked){
          if(!(Q.shieldFlash > 0)) SND.shieldBlock();
          Q.shieldFlash = 0.1;
          continue;
        }
        this.burnPlayer(Q, b.dps * this.dpsTier(), dt);
      }
    }
  }
  // 光束/光柱的持续伤害：绕过无敌帧（与其它敌方激光一致）
  burnPlayer(Q, dps, dt){
    if(vampBlocked(Q, this)) return; // 🩸 吸血鬼正吸着这只怪 → 它烧不动他
    Q.hp -= dps*dt;
    Q.dotFlash = 0.15;
    if(Q.hp <= 0){ Q.hp = 0; if(G.coop) coopPlayerDie(Q); else gameOver(); }
  }
  touchPlayer(dt){
    if(this.touchCD > 0) return;
    const cands = bossHitTargets();
    for(const Q of cands){
      if(Q && dist(this, Q) < this.r + Q.r){
        Q.takeDamage(this.dmg, this); this.touchCD = 0.8;
        pushPlayer(Q, this.x, this.y, 560);
        break;
      }
    }
  }
  die(){
    if(this.dead) return;
    this.dead = true;
    this.beams = []; this.pillars = []; // 死亡瞬间光全灭
    G.effects = G.effects.filter(ef => !ef.fromBoss);
    const bg = new ExpGem(this.x, this.y, 0, this.bodyColor, 14, true);
    bg.xpNextMul = this.xpNextMul;
    G.gems.push(bg);
    spawnParticles(this.x, this.y, this.bodyColor, 30);
    healOnKill(this.lastHitIdx);
    G.screenShake = 20;
    SND.bossDie();
    G.kills = (G.kills||0) + 1; Achieve.checkKill();
    Achieve.checkBossDie(4); // 🔷 棱光破解者
    // 棱光穹主只在无尽模式出现：没有小怪之怒、没有通关判定，打完直接推进下一波
    if(G.inBossWave){
      G.inBossWave = false;
      const bw = document.getElementById('boss-bar-wrap');
      if(bw) bw.style.display = 'none';
      G.wave++; startWave(G.wave);
    }
  }
  // 造型：正三角形（三棱镜）+ 反向自转的白色棱镜芯
  draw(){
    ctx.save();
    if(this.dying) ctx.translate((Math.random()-0.5)*14, (Math.random()-0.5)*10);
    const spinA = G.time * 0.45;
    ctx.shadowColor = this.flash > 0 ? '#fff' : '#2ee6ff';
    ctx.shadowBlur = 22;
    ctx.fillStyle = this.flash > 0 ? '#fff' : this.bodyColor;
    ctx.beginPath();
    for(let i = 0; i < 3; i++){
      const a = -Math.PI/2 + spinA + i/3*Math.PI*2;
      if(i === 0) ctx.moveTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
      else ctx.lineTo(this.x+Math.cos(a)*this.r, this.y+Math.sin(a)*this.r);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#eafcff'; ctx.lineWidth = 3; ctx.stroke();
    const ca = -Math.PI/2 - spinA*1.8, cr = this.r*0.4;
    ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.35*Math.sin(G.time*7)})`;
    ctx.beginPath();
    for(let i = 0; i < 3; i++){
      const a = ca + i/3*Math.PI*2;
      if(i === 0) ctx.moveTo(this.x+Math.cos(a)*cr, this.y+Math.sin(a)*cr);
      else ctx.lineTo(this.x+Math.cos(a)*cr, this.y+Math.sin(a)*cr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if(this.rage){ // 狂暴：外圈旋转虚线环
      ctx.strokeStyle = `rgba(140,245,255,${0.3 + 0.3*Math.sin(G.time*10)})`;
      ctx.lineWidth = 3; ctx.setLineDash([14,10]);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r+16, G.time*1.2, G.time*1.2 + Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    }
    const bw = this.r*2.5;
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw, 5);
    ctx.fillStyle = '#4de1ff';
    ctx.fillRect(this.x-bw/2, this.y-this.r-12, bw*clamp(this.hp/this.maxHp, 0, 1), 5);
    if(this.frozen > 0) drawFrozenShell(this.x, this.y, this.r, this.frozen, this.frozenMax); // ❄️ 冰冻冰壳
  }
  // 光束 + 光柱（在渲染最上层绘制，完整可见）
  drawBeams(){
    const pulse = 0.85 + 0.15*Math.sin(G.time*22);
    ctx.save();
    ctx.lineCap = 'round';
    // ① 光柱雨（先画，压在光束下面）
    for(const p of this.pillars){
      if(p.warn > 0){
        const k = 1 - p.warn/0.75; // 由外圈向内填充的进度
        ctx.strokeStyle = `rgba(110,240,255,${0.45 + 0.35*Math.sin(G.time*18)})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = `rgba(80,230,255,${0.10 + 0.16*k})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, p.r*k), 0, Math.PI*2); ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(120,245,255,${0.42*pulse})`;
        ctx.lineWidth = p.r*1.15*pulse;
        ctx.beginPath(); ctx.moveTo(p.x, p.y-1400); ctx.lineTo(p.x, p.y+1400); ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = Math.max(2, p.r*0.3);
        ctx.beginPath(); ctx.moveTo(p.x, p.y-1400); ctx.lineTo(p.x, p.y+1400); ctx.stroke();
        ctx.fillStyle = 'rgba(190,250,255,.30)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      }
    }
    // ② 光束
    for(const b of this.beams){
      const ex = this.x + Math.cos(b.ang)*b.len;
      const ey = this.y + Math.sin(b.ang)*b.len;
      if(b.tint === 'warn'){ // 瞄准期：细虚线预警
        ctx.strokeStyle = `rgba(120,235,255,${0.35 + 0.35*Math.sin(G.time*16)})`;
        ctx.lineWidth = 3; ctx.setLineDash([12,9]);
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }
      const hue = b.hue == null ? 192 : b.hue;
      ctx.strokeStyle = `hsla(${hue},100%,72%,.26)`; // 外发光
      ctx.lineWidth = b.w*3.2*pulse;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = `hsl(${hue},100%,74%)`;      // 光束本体
      ctx.lineWidth = b.w*1.15;
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = '#fff';                       // 内核
      ctx.lineWidth = Math.max(2, b.w*0.5);
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
    }
    ctx.restore();
  }
}

// ===== ⚔ 大剑 Boss「斩铁剑皇」（纯大剑近战，仅无尽模式第 50/100/150… 波）====
// 造型：头戴王冠的六边形（几何家族），巨剑是握在手里的武器，剑尖随招式摆位=
// 与小怪之怒（冲撞近战）分工：它靠「巨型范围斩击 + 剑气」压迫，每一招都是剑的挥砍；
// 所有招式都有前摇预警（扇形亮起 / 突进虚线 / 抬剑），鼓励绕背、位移躲，而不是硬吃。
class BladeBoss extends Enemy {
  constructor(tier){
    tier = Math.max(1, tier || 1);
    const hp = Math.round(5600 * (1 + (tier - 1) * 0.9)); // 比棱光穹主略厚：招式好预判，但吃满一套很痛
    super(WW()/2, 120, hp, G.endlessOn ? 170 : 140, 30, 42, '#dfe9ff'); // 接触伤 30 / 本体半径 42（剑身另算）；移速 140（♾无尽再快一档 170，近战 Boss 得追得上满级移速的玩家）
    this.bossNum = 5;
    this.tier = tier;
    this.isBoss = true;
    this.isBladeBoss = true; // 渲染层画范围预警 / 测试断言用
    this.name = '斩铁剑皇' + (tier > 1 ? ' · 第' + tier + '轮' : '');
    this.bodyColor = '#dfe9ff';
    this.xpNextMul = 1.5;    // 宝石：按拾取者当前升级需求 ×1.5 结算
    this.phase = 0;          // 0 平时 / 1 狂暴（血 <45%）
    this.touchCD = 0;
    this.flash = 0; this.critShake = 0; this.deathShake = 0; this.dying = false;
    this.aimAng = Math.PI/2; // 剑尖朝向（平时指向目标，出招时由招式接管）
    this.swordAng = this.aimAng; // 手里巨剑的实际指向（draw 里按招式摆位）
    this.seq = ['cleave','spin','cleave','gale','guard','dash']; // 6 步轮换（横斩穿插；第 5 步格挡，专门化解远程子弹）
    this.seqIdx = 0; this.seqT = 0; this.seqDur = 0;
    this.state = 'wind'; this.timer = 0; // 招式内状态机：wind 前摇 → fire/cut 出招 → recover 收招
    this.swingLeft = 0;                  // 横斩剩余刀数（狂暴 = 三连斩）
    this.fan = null;                     // 当前扇形（预警与判定同参数同源）
    this.spinLeft = 0; this.spinTick = 0; this.spinAng = 0; // 回旋斩
    this.dashDir = { x:0, y:1 }; this.dashDist = 470; this.dashTravelled = 0; // 突进斩
    this.slashFx = 0;
    // 🛡 护盾（远程克星）：开场自带一层能量盾，伤害先扣盾、本体一滴血不掉；
    //    远程角色（射手/激光/爆破/毒液）打盾只有 50% 伤害，近战（剑士/龙卷风）全额 → 要么贴脸砍，要么慢慢磨。
    //    盾在狂暴（血 <45%）时会重新立起一层 → 两个阶段各有一次"破盾"节奏。
    this.shieldMax = Math.round(900 * (1 + (tier - 1) * 0.55)); // 盾值随轮次成长（比本体 5600 少，是"额外血条"不是主血条）
    this.shieldHp = this.shieldMax;
    this.shieldRegenDelay = 0;
    this.enterStep(this.seq[0]);
  }
  // 🛡 盾破：特效 + 音效；本体从这一刻起才真的开始掉血
  breakShield(){
    this.shieldHp = 0;
    this.shieldBreakFx = 0.5;
    SND.shieldBlock();
    G.screenShake = Math.max(G.screenShake || 0, 10);
    spawnParticles(this.x, this.y, '#9fd8ff', 22);
    G.effects.push({ type:'shieldBreak', x:this.x, y:this.y, r:this.r + 26, life:0.45, max:0.45 });
  }
  get rage(){ return this.phase >= 1; }
  dmgTier(){ return 1 + (this.tier - 1) * 0.25; } // ♾ 每多一轮，剑伤 +25%
  fanArc(){ return this.rage ? 1.30 : 1.05; }     // 扇形半角（60°→74°）
  fanR(){ return this.rage ? 205 : 182; }         // 扇形半径
  spinR(){ return this.rage ? 168 : 146; }        // 回旋斩半径
  enterStep(step, idx){
    const rage = this.rage;
    const T = targetOf(this);
    // 招式指针同步：轮换时由 update 传入真实下标（seq 里有重复的 'cleave'，不能用 indexOf 反查）；
    // 外部/调试直接 enterStep('gale') 时按名字定位（重复名以第一个为准）
    if(idx !== undefined) this.seqIdx = idx;
    else { const si = this.seq.indexOf(step); if(si >= 0) this.seqIdx = si; }
    this.seqT = 0;
    this.state = 'wind'; this.timer = 0;
    this.fan = null;
    if(step === 'cleave'){        // ① 横斩：锁定扇形 → 挥砍
      this.swingLeft = rage ? 3 : 1;
      this.seqDur = rage ? 2.4 : 1.4;
      if(T) this.aimAng = angleTo(this, T);
      this.fan = { ang: this.aimAng, arc: this.fanArc(), r: this.fanR() };
      this.timer = rage ? 0.55 : 0.78;
      this.windDur = this.timer; // 预警充能基准（连斩时每刀不同）
    } else if(step === 'spin'){   // ② 回旋斩：原地转圈，剑圈内持续掉血
      this.seqDur = rage ? 2.3 : 1.8;
      this.spinLeft = rage ? 7 : 5;
      this.spinTick = 0.3;
      this.spinAng = this.aimAng;
      this.state = 'fire';
    } else if(step === 'gale'){   // ③ 剑气波：抬剑 → 扇形剑气
      this.seqDur = 1.3;
      this.timer = rage ? 0.3 : 0.42;
    } else if(step === 'guard'){  // ④ 格挡：举剑化解 → 一剑扫灭身边所有玩家子弹
      this.seqDur = rage ? 1.15 : 1.35;
      this.timer = rage ? 0.4 : 0.55; // 举剑预备（预警圈同步亮起）
      this.windDur = this.timer;
    } else if(step === 'dash'){   // ⑤ 突进斩：锁定方向 → 虚线预警 → 冲刺 → 落点斩
      this.seqDur = rage ? 1.6 : 1.9;
      this.timer = rage ? 0.62 : 0.85;
      if(T){ const a = angleTo(this, T); this.dashDir = { x: Math.cos(a), y: Math.sin(a) }; this.aimAng = a; }
      this.dashTravelled = 0;
    }
  }
  update(dt){
    if(this.dead) return;
    if(this.flash > 0) this.flash -= dt;
    if(this.touchCD > 0) this.touchCD -= dt;
    if(this.critShake > 0) this.critShake -= dt;
    if(this.slashFx > 0) this.slashFx -= dt;
    if(this.shieldHitFx > 0) this.shieldHitFx -= dt;     // 🛡 盾被击中的白闪
    if(this.shieldBreakFx > 0) this.shieldBreakFx -= dt; // 🛡 盾破特效
    // 击退（护盾可弹开 Boss）：指数衰减
    if(this.kbx !== 0 || this.kby !== 0){
      this.x += this.kbx*dt; this.y += this.kby*dt;
      this.kbx *= Math.pow(0.02, dt); this.kby *= Math.pow(0.02, dt);
      if(Math.abs(this.kbx) < 1 && Math.abs(this.kby) < 1){ this.kbx = 0; this.kby = 0; }
    }
    // 暴击眩晕：定身（预警保留但不结算，招式计时冻结）
    if(this.stun > 0){ this.stun -= dt; this.touchPlayer(dt); return; }
    if(this.phase === 0 && this.hp < this.maxHp * 0.45){
      this.phase = 1; this.seqT = 0;
      SND.bossWarn(); G.screenShake = 14;
      spawnParticles(this.x, this.y, '#ffd166', 28);
      // 🛡 狂暴重新立盾：第二阶段再来一层护盾（盾破时会再响一次碎盾特效）
      if(this.shieldHp <= 0){
        this.shieldHp = this.shieldMax;
        spawnParticles(this.x, this.y, '#9fd8ff', 20);
        G.effects.push({ type:'shieldBreak', x:this.x, y:this.y, r:this.r + 26, life:0.45, max:0.45 });
      }
    }
    this.moveBladeBoss(dt);
    this.seqT += dt;
    if(this.seqT >= this.seqDur){ // 换下一招（seq 里有重复的 'cleave'，必须用真实下标推进）
      const ni = (this.seqIdx + 1) % this.seq.length;
      this.seqIdx = ni;
      this.enterStep(this.seq[ni], ni);
    }
    const step = this.seq[this.seqIdx];
    if(step === 'cleave') this.stepCleave(dt);
    else if(step === 'spin') this.stepSpin(dt);
    else if(step === 'gale') this.stepGale(dt);
    else if(step === 'guard') this.stepGuard(dt);
    else if(step === 'dash') this.stepDash(dt);
    this.touchPlayer(dt);
  }
  // 走位：贴身追击（大剑要靠近才砍得到），保持 96px 左右的"剑围"；前摇期间站桩让玩家看清往哪砍
  moveBladeBoss(dt){
    const step = this.seq[this.seqIdx];
    if(step === 'dash' && this.state === 'fire') return; // 冲刺推进由 stepDash 接管
    const T = targetOf(this);
    if(!T) return;
    const a = angleTo(this, T);
    const pd = dist(this, T);
    if(step !== 'dash' && step !== 'spin') this.aimAng = a; // 平时剑尖"剑指"目标（冲刺/回旋由招式控制朝向）
    let sp = this.speed * (this.rage ? 1.3 : 1);
    if(step === 'cleave' && this.state === 'wind') sp *= 0.22; // 横斩前摇：站桩举剑
    if(step === 'spin') sp *= 0.55;                            // 回旋斩：边转边缓慢逼近
    if(step === 'dash' && this.state === 'wind') sp *= 0.2;    // 突进前：站定锁定
    if(step === 'guard') sp *= 0.25;                           // 格挡：举剑站桩化解（不贴脸追人）
    if(pd > 96){ this.x += Math.cos(a)*sp*dt; this.y += Math.sin(a)*sp*dt; }
    else if(pd < 58){ this.x += Math.cos(a)*sp*0.3*dt; this.y += Math.sin(a)*sp*0.3*dt; } // 太近也慢慢挪（不后退，避免脱节）
    this.x = clamp(this.x, this.r + 10, WW()-this.r-10);
    this.y = clamp(this.y, this.r + 10, WH()-this.r-10);
  }
  // ① 横斩：锁定扇形 → 挥砍（狂暴变三连斩，末刀 360° 全周）
  stepCleave(dt){
    if(this.state === 'wind'){
      this.timer -= dt;
      if(this.timer > 0) return;
      this.state = 'cut';
    }
    if(this.state === 'cut'){
      this.doCleave();
      this.swingLeft--;
      if(this.swingLeft > 0){
        const T = targetOf(this);
        const base = T ? angleTo(this, T) : this.aimAng;
        // 狂暴：第二刀朝侧后偏 30°（逼换位躲），第三刀整圈横扫
        this.fan = this.swingLeft === 1
          ? { ang: 0, arc: Math.PI, r: this.fanR() }
          : { ang: base + (Math.random() < 0.5 ? -0.5 : 0.5), arc: this.fanArc(), r: this.fanR() };
        this.state = 'wind'; this.timer = this.rage ? 0.62 : 0.5;
        this.windDur = this.timer;
        return;
      }
      this.state = 'recover'; this.timer = 0.3;
    }
  }
  doCleave(){
    const f = this.fan;
    if(!f) return;
    const dmg = Math.round((this.rage ? 26 : 21) * this.dmgTier());
    this.slashFx = 0.2;
    G.effects.push({ type:'slash', x:this.x, y:this.y, dirs:[f.ang], r:f.r, arc:f.arc, life:0.2, max:0.2 });
    G.screenShake = Math.max(G.screenShake || 0, 7);
    if(this.hitArc(f.ang, f.arc, f.r, dmg, 460)) SND.hit(); else SND.shoot();
  }
  // ② 回旋斩：剑圈内持续掉血（绕过无敌帧，与光束/岩浆同一口径）——站在剑里就一直掉
  stepSpin(dt){
    this.spinTick -= dt;
    if(this.spinTick > 0) return;
    this.spinTick = 0.3;
    this.spinLeft--;
    const r = this.spinR();
    const dps = (this.rage ? 28 : 22) * this.dmgTier();
    this.spinAng += Math.PI*2 / (this.rage ? 7 : 5);
    this.aimAng = this.spinAng;
    G.effects.push({ type:'slash', x:this.x, y:this.y, dirs:[this.spinAng], r, arc:0.95, life:0.18, max:0.18 });
    const cands = bossHitTargets();
    for(const Q of cands){ if(Q && dist(this, Q) < r + Q.r) this.burnPlayer(Q, dps, 0.3); }
    if(this.spinLeft <= 0) this.state = 'recover';
  }
  // ③ 剑气波：抬剑 → 三/五道月牙剑气（可被 🗡 挥砍斩掉、盾球能挡，飞行 1.35s）
  stepGale(dt){
    if(this.state === 'fire') return;
    this.timer -= dt;
    if(this.timer > 0) return;
    this.state = 'fire';
    const T = targetOf(this);
    const base = T ? angleTo(this, T) : this.aimAng;
    this.aimAng = base;
    const rage = this.rage;
    const n = rage ? 5 : 3, spread = 0.2;
    for(let i = 0; i < n; i++){
      this.spawnGale(base + (i - (n-1)/2)*spread, rage ? 380 : 330,
        Math.round((rage ? 15 : 12) * this.dmgTier()));
    }
    G.effects.push({ type:'slash', x:this.x, y:this.y, dirs:[base], r:150, arc:0.7, life:0.18, max:0.18 });
    SND.enemyShoot(); G.screenShake = Math.max(G.screenShake || 0, 5);
  }
  // ④ 格挡（2026-10-05 新增）：举剑化解 → 一剑扫灭半径内所有玩家子弹（普通弹 / 剑气弹一并斩掉）
  //    给远程玩家一个「必须拉开或近身」的节拍：站在剑围之外输出不受影响，贴脸贪输出就被清弹
  //    只斩子弹，不挡玩家激光光束（那是另一套体系）；格挡本身也不减伤，玩家仍可近身砍它
  guardR(){ return this.rage ? 275 : 235; } // 格挡半径（预警圈 = 判定范围 = 绘制，同参数）
  stepGuard(dt){
    if(this.state === 'wind'){
      this.timer -= dt;
      if(this.timer > 0) return;
      this.state = 'cut';
    }
    if(this.state === 'cut'){
      this.doGuard();
      this.state = 'recover'; this.timer = 0.35;
    }
  }
  doGuard(){
    const R = this.guardR();
    let n = 0;
    for(const b of G.bullets){
      if(b.dead) continue;
      if(dist({ x:this.x, y:this.y }, b) < R + (b.r || 0)){
        b.dead = true; n++;
        spawnParticles(b.x, b.y, '#ffe9a8', 3); // 被斩灭的子弹爆成金色火星
      }
    }
    this.slashFx = 0.25;
    G.effects.push({ type:'parry', fromBoss:true, x:this.x, y:this.y, r:R, life:0.45, max:0.45, n });
    G.screenShake = Math.max(G.screenShake || 0, n > 0 ? 8 : 3);
    if(n > 0) SND.shieldBlock(); else SND.shoot();
  }
  spawnGale(ang, spd, dmg){
    G.enemies.push({
      isBullet:true, fromBlade:true, blade:true, fromBoss:true, owner:this,
      x: this.x + Math.cos(ang)*(this.r + 14), y: this.y + Math.sin(ang)*(this.r + 14),
      vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, ang,
      r: 19, hp:999, maxHp:999, dead:false, flash:0,
      dmg, color:'#ffe9a8', touchCD:0, speed:0, kbx:0, kby:0, life:1.35,
      update(dt){
        this.life -= dt;
        if(this.life <= 0){ this.dead = true; return; }
        this.x += this.vx*dt; this.y += this.vy*dt;
        if(this.x < -30 || this.x > WW()+30 || this.y < -30 || this.y > WH()+30){ this.dead = true; return; } // 👁️出界按扩大后世界
        const sh = shieldOrbHit(this.x, this.y, this.r);
        if(sh){ this.dead = true; SND.shieldBlock(); sh.owner.shieldFlash = 0.15; spawnParticles(sh.x, sh.y, '#8ff', 8); return; }
        if(this.touchCD > 0) this.touchCD -= dt;
        const cands = bossHitTargets();
        for(const P of cands){
          if(P && this.touchCD <= 0 && dist(this, P) < this.r + P.r){
            P.takeDamage(this.dmg, this); this.touchCD = 0.5; this.dead = true;
          }
        }
      },
      draw(){ // 月牙刀光：弯刃朝前、开口朝后
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(0, 0, 30, Math.PI*0.62, Math.PI*1.38); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 30, Math.PI*0.72, Math.PI*1.28); ctx.stroke();
        ctx.restore();
      },
      takeDamage(){}, // 本体不可被伤害（🗡 剑士挥砍可斩掉，见 Player.slash 的 isBullet 分支）
    });
  }
  // ④ 突进斩：锁定方向 → 虚线预警 → 高速冲刺（撞人即伤）→ 落点一圈斩
  stepDash(dt){
    if(this.state === 'wind'){
      this.timer -= dt;
      if(this.timer > 0.25){ // 前 0.6s 还能转向，最后 0.25s 锁死 → 能靠走位甩开
        const T = targetOf(this);
        if(T){ const a = angleTo(this, T); this.dashDir = { x: Math.cos(a), y: Math.sin(a) }; this.aimAng = a; }
      } else if(this.timer > 0){
        this.dashDist = this.dashPlan(); // 锁定瞬间定冲刺长度（预警线 = 实际距离，绝不多画）
      }
      if(this.timer <= 0){
        this.state = 'fire'; this.dashTravelled = 0;
        SND.charge(); G.screenShake = Math.max(G.screenShake || 0, 8);
      }
      return;
    }
    if(this.state === 'fire'){
      const spd = this.speed * 7;
      const mx = this.dashDir.x*spd*dt, my = this.dashDir.y*spd*dt;
      this.x += mx; this.y += my;
      this.dashTravelled += Math.hypot(mx, my);
      if(Math.random() < 0.7) spawnParticles(this.x, this.y, '#ffd166', 1);
      const dmg = Math.round((this.rage ? 30 : 24) * this.dmgTier());
      const hit = this.hitCircle(this.r + 24, dmg, 620); // 冲刺身位比剑身略宽一点
      const wall = this.x <= this.r+11 || this.x >= WW()-this.r-11 || this.y <= this.r+11 || this.y >= WH()-this.r-11;
      if(hit || wall || this.dashTravelled >= this.dashDist){
        this.x = clamp(this.x, this.r + 10, WW()-this.r-10);
        this.y = clamp(this.y, this.r + 10, WH()-this.r-10);
        this.state = 'burst'; this.timer = 0.22;
        this.doSlam();
      }
      return;
    }
    // burst：落点余波（站定 0.22s 再收招）
    this.timer -= dt;
    if(this.timer <= 0) this.state = 'recover';
  }
  doSlam(){
    const r = this.rage ? 150 : 130;
    const dmg = Math.round((this.rage ? 20 : 16) * this.dmgTier());
    this.slashFx = 0.2;
    G.effects.push({ type:'slash', x:this.x, y:this.y, dirs:[0], r, arc:Math.PI, life:0.22, max:0.22 });
    G.screenShake = Math.max(G.screenShake || 0, 12);
    SND.boom();
    this.hitCircle(r, dmg, 540);
  }
  // 到墙的直线距离 / 本次冲刺实际长度（取小值）
  dashLen(){
    const dx = this.dashDir.x, dy = this.dashDir.y;
    let len = 1600;
    if(dx >  1e-6) len = Math.min(len, (WW()-this.r-10-this.x)/dx);
    if(dx < -1e-6) len = Math.min(len, (this.r+10-this.x)/dx);
    if(dy >  1e-6) len = Math.min(len, (WH()-this.r-10-this.y)/dy);
    if(dy < -1e-6) len = Math.min(len, (this.r+10-this.y)/dy);
    return Math.max(0, len);
  }
  dashPlan(){ return Math.min(this.dashLen(), this.rage ? 560 : 470); }
  // 扇形命中（世界坐标，与预警/刀光同参数）：看得见的范围就能打到
  hitArc(ang, arc, r, dmg, force){
    const cands = bossHitTargets();
    let hit = false;
    for(const Q of cands){
      if(!Q) continue;
      if(dist(this, Q) > r + Q.r) continue;
      const ea = Math.atan2(Q.y - this.y, Q.x - this.x);
      const diff = Math.abs(((ea - ang + Math.PI*3) % (Math.PI*2)) - Math.PI);
      if(diff > arc) continue;
      Q.takeDamage(dmg, this);
      pushPlayer(Q, this.x, this.y, force || 460);
      hit = true;
    }
    return hit;
  }
  hitCircle(r, dmg, force){
    const cands = bossHitTargets();
    let hit = false;
    for(const Q of cands){
      if(Q && dist(this, Q) < r + Q.r){
        Q.takeDamage(dmg, this);
        pushPlayer(Q, this.x, this.y, force || 460);
        hit = true;
      }
    }
    return hit;
  }
  // 剑圈持续伤害：绕过无敌帧（与敌方光束/岩浆同一口径）
  burnPlayer(Q, dps, dt){
    if(vampBlocked(Q, this)) return; // 🩸 吸血鬼正吸着这只怪 → 它烧不动他
    Q.hp -= dps*dt;
    Q.dotFlash = 0.15;
    if(Q.hp <= 0){ Q.hp = 0; if(G.coop) coopPlayerDie(Q); else gameOver(); }
  }
  touchPlayer(dt){
    if(this.touchCD > 0) return;
    const cands = bossHitTargets();
    for(const Q of cands){
      if(Q && dist(this, Q) < this.r + Q.r){
        Q.takeDamage(this.dmg, this); this.touchCD = 0.8;
        pushPlayer(Q, this.x, this.y, 560);
        break;
      }
    }
  }
  die(){
    if(this.dead) return;
    this.dead = true;
    this.fan = null; // 死亡瞬间撤掉范围预警
    this.shieldHp = 0; // 🛡 死亡时撤掉护盾（避免尸体上还挂着一层盾）
    const bg = new ExpGem(this.x, this.y, 0, this.bodyColor, 14, true);
    bg.xpNextMul = this.xpNextMul;
    G.gems.push(bg);
    spawnParticles(this.x, this.y, this.bodyColor, 30);
    healOnKill(this.lastHitIdx);
    G.screenShake = 20;
    SND.bossDie();
    G.kills = (G.kills||0) + 1; Achieve.checkKill();
    Achieve.checkBossDie(5); // ⚔ 斩铁破军
    // 只在无尽模式出现：没有小怪之怒、没有通关判定，打完直接推进下一波
    if(G.inBossWave){
      G.inBossWave = false;
      const bw = document.getElementById('boss-bar-wrap');
      if(bw) bw.style.display = 'none';
      G.wave++; startWave(G.wave);
    }
  }
  // 造型：一把巨型双手大剑（剑尖朝目标）——白刃 + 金刃口 + 护手 + 剑柄 + 剑首
  draw(){
    ctx.save();
    if(this.dying) ctx.translate((Math.random()-0.5)*14, (Math.random()-0.5)*10);
    // ---- 本体：六边形（几何家族）+ 头戴王冠（王冠不随剑转，永远朝上）----
    ctx.shadowColor = this.flash > 0 ? '#fff' : (this.rage ? '#ff9a3c' : '#9fc6ff');
    ctx.shadowBlur = this.slashFx > 0 ? 26 : 16;
    ctx.fillStyle = this.flash > 0 ? '#fff' : this.bodyColor;
    ctx.beginPath();
    for(let i = 0; i < 6; i++){ // 六边形（顶点与熔岩巨兽同口径：i/6×2π）
      const a = i/6*Math.PI*2;
      const px = this.x + Math.cos(a)*this.r, py = this.y + Math.sin(a)*this.r;
      if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    // 王冠（金色）
    const cy0 = this.y - this.r - 3;
    ctx.fillStyle = this.flash > 0 ? '#fff' : '#ffd166';
    ctx.beginPath();
    ctx.moveTo(this.x - 16, cy0);
    ctx.lineTo(this.x - 16, cy0 - 13);
    ctx.lineTo(this.x - 8, cy0 - 5);
    ctx.lineTo(this.x, cy0 - 17);
    ctx.lineTo(this.x + 8, cy0 - 5);
    ctx.lineTo(this.x + 16, cy0 - 13);
    ctx.lineTo(this.x + 16, cy0);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.5; ctx.stroke();
    // ---- 巨剑：握在手里的武器（剑尖指向 swordAng，随招式摆位）----
    const step = this.seq[this.seqIdx];
    let sa = this.aimAng; // 平时"剑指"目标
    const f = this.fan;
    if(step === 'cleave' && f){
      if(this.state === 'wind'){
        const total = this.windDur || 0.78;
        const k = clamp(1 - Math.max(0, this.timer)/total, 0, 1);
        sa = f.ang - f.arc*1.35 + f.arc*0.9*k; // 举剑蓄力：从扇形一侧缓缓抬向挥砍位
      } else {
        sa = f.ang + f.arc*0.8;                // 挥出后停在另一侧
      }
    } else if(step === 'spin'){
      sa = this.spinAng;                       // 回旋：剑随身转
    } else if(step === 'dash'){
      sa = Math.atan2(this.dashDir.y, this.dashDir.x);
      if(this.state === 'wind') sa -= 1.0;     // 突进前举剑
    } else if(step === 'gale'){
      sa = this.state === 'wind' ? this.aimAng - 1.1 : this.aimAng + 0.4; // 抬剑 → 斩出剑气
    } else if(step === 'guard'){
      sa = this.state === 'wind' ? this.aimAng - Math.PI*0.5 : this.aimAng + Math.PI*0.55; // 横剑格挡 → 横扫一圈
    }
    this.swordAng = sa;
    const grip = this.r*0.72, L = this.r*2.15; // 握把离圆心距离 / 剑身长（护手到剑尖）
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(sa + Math.PI/2); // 局部 -y = 剑尖方向
    // 剑身（带剑尖）
    ctx.fillStyle = this.flash > 0 ? '#fff' : '#f4f8ff';
    ctx.shadowColor = this.rage ? '#ff9a3c' : '#9fc6ff'; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, -grip - L);
    ctx.lineTo(8, -grip - L*0.72);
    ctx.lineTo(8, -grip);
    ctx.lineTo(-8, -grip);
    ctx.lineTo(-8, -grip - L*0.72);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.rage ? '#ffb14d' : '#ffd166'; ctx.lineWidth = 2.5; ctx.stroke();
    // 血槽
    ctx.strokeStyle = 'rgba(120,150,200,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -grip - L*0.62); ctx.lineTo(0, -grip - 6); ctx.stroke();
    // 护手 / 剑柄 / 剑首
    ctx.fillStyle = '#c9d6ee';
    ctx.fillRect(-this.r*0.55, -grip - 4, this.r*1.1, 8);
    ctx.fillStyle = '#8b6a3f';
    ctx.fillRect(-5, -grip + 6, 10, 16);
    ctx.fillStyle = '#e8d59a';
    ctx.beginPath(); ctx.arc(0, -grip + 26, 7, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    if(this.rage){ // 狂暴：外圈旋转虚线环
      ctx.strokeStyle = `rgba(255,170,80,${0.3 + 0.3*Math.sin(G.time*10)})`;
      ctx.lineWidth = 3; ctx.setLineDash([14,10]);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r + 18, G.time*0.9, G.time*0.9 + Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    }
    // 🛡 能量盾：六边形护罩（与本体同为几何家族）+ 残余盾值进度弧
    if(this.shieldHp > 0){
      const k = clamp(this.shieldHp / this.shieldMax, 0, 1);
      const R = this.r + 26;
      const hit = this.shieldHitFx > 0;
      ctx.save();
      ctx.strokeStyle = hit ? '#fff' : `rgba(160,220,255,${0.42 + 0.3*k})`;
      ctx.lineWidth = hit ? 4 : 2.5;
      ctx.beginPath();
      for(let i = 0; i < 6; i++){ // 慢速旋转的六边形护罩
        const a = i/6*Math.PI*2 + G.time*0.5;
        const px = this.x + Math.cos(a)*R, py = this.y + Math.sin(a)*R;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = `rgba(140,210,255,${0.06 + 0.04*Math.sin(G.time*5)})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, R, 0, Math.PI*2); ctx.fill();
      // 盾值弧（正上方起顺时针）：一眼看出"还有多少盾"
      ctx.strokeStyle = hit ? '#fff' : (k > 0.5 ? '#8fe0ff' : '#ffb03a');
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.x, this.y, R + 5, -Math.PI/2, -Math.PI/2 + Math.PI*2*k); ctx.stroke();
      ctx.restore();
    } else if(this.shieldBreakFx > 0){ // 碎盾：向外飞散的棱片
      const k = 1 - this.shieldBreakFx/0.5;
      ctx.save();
      ctx.strokeStyle = `rgba(180,235,255,${0.9*(1-k)})`;
      ctx.lineWidth = 3;
      for(let i = 0; i < 6; i++){
        const a = i/6*Math.PI*2 + 0.5;
        const r0 = (this.r + 26) * (1 + k*0.7), r1 = r0 + 16*(1-k);
        ctx.beginPath();
        ctx.moveTo(this.x + Math.cos(a)*r0, this.y + Math.sin(a)*r0);
        ctx.lineTo(this.x + Math.cos(a)*r1, this.y + Math.sin(a)*r1);
        ctx.stroke();
      }
      ctx.restore();
    }
    const bw = this.r*2.5;
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(this.x-bw/2, this.y-this.r-24, bw, 5);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(this.x-bw/2, this.y-this.r-24, bw*clamp(this.hp/this.maxHp, 0, 1), 5);
    if(this.shieldHp > 0){ // 🛡 盾条（叠在血条上方）：青色 = 还有盾，打本体前先打掉它
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(this.x-bw/2, this.y-this.r-31, bw, 5);
      ctx.fillStyle = this.shieldHitFx > 0 ? '#fff' : '#8fe0ff';
      ctx.fillRect(this.x-bw/2, this.y-this.r-31, bw*clamp(this.shieldHp/this.shieldMax, 0, 1), 5);
    }
    ctx.restore(); // ⚠ 必须配对开头的 save()：少这一行会每帧泄漏一层画布变换，整个世界画面逐帧漂移消失
  }
  // 范围预警（渲染最上层绘制）：扇形前摇 / 回旋剑圈 / 突进虚线 + 落点圈
  drawBladeFx(){
    const step = this.seq[this.seqIdx];
    ctx.save();
    if(this.fan && step === 'cleave' && this.state === 'wind'){ // ① 横斩扇形（充能越满越亮）
      const total = this.windDur || 0.78;
      const k = clamp(1 - Math.max(0, this.timer)/total, 0, 1);
      ctx.fillStyle = `rgba(255,120,90,${0.10 + 0.24*k})`;
      ctx.beginPath(); ctx.moveTo(this.x, this.y);
      ctx.arc(this.x, this.y, this.fan.r, this.fan.ang - this.fan.arc, this.fan.ang + this.fan.arc);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,210,170,${0.55 + 0.35*Math.sin(G.time*18)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.fan.r, this.fan.ang - this.fan.arc, this.fan.ang + this.fan.arc); ctx.stroke();
    }
    if(step === 'spin'){ // ② 回旋剑圈
      ctx.strokeStyle = `rgba(255,190,110,${0.35 + 0.25*Math.sin(G.time*16)})`;
      ctx.lineWidth = 3; ctx.setLineDash([10,8]);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.spinR(), 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if(step === 'guard'){ // ④ 格挡圈：举剑期间亮起（圈内所有玩家子弹都会被斩灭，站圈外打就没事）
      const total = this.windDur || 0.55;
      const k = this.state === 'wind' ? clamp(1 - Math.max(0, this.timer)/total, 0, 1) : 1;
      ctx.strokeStyle = `rgba(255,228,150,${0.28 + 0.55*k})`;
      ctx.lineWidth = 3 + 3*k; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.arc(this.x, this.y, this.guardR(), 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,220,140,${0.05 + 0.07*k})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.guardR(), 0, Math.PI*2); ctx.fill();
    }
    if(step === 'dash' && this.state === 'wind'){ // ③ 突进轨迹 + 落点圈（长度 = 实际冲刺距离）
      const len = this.dashPlan();
      const ex = this.x + this.dashDir.x*len, ey = this.y + this.dashDir.y*len;
      const a0 = Math.atan2(this.dashDir.y, this.dashDir.x);
      ctx.strokeStyle = `rgba(255,140,110,${0.35 + 0.35*Math.sin(G.time*18)})`;
      ctx.lineWidth = 4; ctx.setLineDash([16,10]);
      ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,190,140,.5)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ex, ey, this.rage ? 150 : 130, 0, Math.PI*2); ctx.stroke();
      if(this.timer <= 0.25){ // 锁定提示：箭头
        ctx.fillStyle = '#ffb14d';
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - Math.cos(a0 - 0.4)*22, ey - Math.sin(a0 - 0.4)*22);
        ctx.lineTo(ex - Math.cos(a0 + 0.4)*22, ey - Math.sin(a0 + 0.4)*22);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }
}

// ===== 半血剧情：七小怪围圈旋转收缩 → 白光 → 小怪之怒 =====
function startWrathCutscene(){
  const cx = WW()/2, cy = WH()/2; // 👁️世界中心围圈
  const R = G.player.r * 6; // 圆圈直径=玩家6倍（半径=玩家r×6）
  const hpScale = 1 + G.wave*0.15;
  // 顺时针队形：普通、快速、坦克、远程、粘液、冲撞、激光
  const makers = [
    () => new Enemy(cx, cy, 25*hpScale, 110, 10, 15, '#f44'),
    () => new Enemy(cx, cy, 15*hpScale, 180, 8, 10, '#fa4'),
    () => new Enemy(cx, cy, 50*hpScale, 70, 15, 22, '#84f'),
    () => new RangedEnemy(cx, cy, hpScale),
    () => new SlimeEnemy(cx, cy, hpScale),
    () => new ChargerEnemy(cx, cy, hpScale),
    () => new LaserEnemy(cx, cy, hpScale),
  ];
  const minions = makers.map(mk => {
    const e = mk();
    e.csMinion = true; // 剧情小怪：位置由剧情控制，不受禁止移动限制
    e.kbx = 0; e.kby = 0;
    G.enemies.push(e);
    return e;
  });
  G.cutscene = {
    type:'wrath', t:0, phase:'circle',
    minions, cx, cy, radius:R,
    ang: -Math.PI/2, rotSpeed:0.4, rotAccel:1.5, // 旋转逐渐加速
    step: Math.PI*2/7, // 正七边形角度步长
  };
  SND.bossWarn();
  G.screenShake = 3;
}
function updateCutscene(dt){
  const cs = G.cutscene;
  if(!cs) return;
  cs.t += dt;
  cs.ang += cs.rotSpeed * dt;
  cs.rotSpeed += cs.rotAccel * dt; // 持续加速
  if(cs.phase === 'circle'){
    // 旋转逐渐加速，屏幕一直震动；转得飞快后开始收缩
    G.screenShake = Math.min(5, cs.rotSpeed*0.5);
    if(cs.rotSpeed >= 7) cs.phase = 'shrink';
  } else if(cs.phase === 'shrink'){
    // 缓慢向圆心收缩（减小半径、不停止旋转），震动更猛烈
    G.screenShake = 6;
    cs.radius -= 34 * dt; // 84→0 约2.5秒
    if(cs.radius <= 6){
      cs.phase = 'flash';
      cs.t = 0;
      G.flash = 1; // 全屏白光一瞬间
      G.screenShake = 16;
      SND.boom();
      cs.minions.forEach(m => m.dead = true); // 七小怪中心点重合消失
      G.wrathBoss = new WrathBoss(WW()/2, WH()/2); // 👁️世界中央出现小怪之怒
      G.enemies.push(G.wrathBoss);
    }
  } else if(cs.phase === 'flash'){
    G.screenShake = Math.max(0, 16 - cs.t*20);
    if(cs.t > 0.9){
      G.cutscene = null; // 剧情结束，恢复正常战斗（双Boss并存）
      G.screenShake = 0;
    }
  }
  // 更新七小怪位置：绕圆心沿圆轨迹旋转
  for(let i=0;i<cs.minions.length;i++){
    const m = cs.minions[i];
    if(m.dead) continue;
    m.x = cs.cx + Math.cos(cs.ang + i*cs.step) * cs.radius;
    m.y = cs.cy + Math.sin(cs.ang + i*cs.step) * cs.radius;
  }
}
function drawCutscene(){
  const cs = G.cutscene;
  if(!cs) return;
  // 残影：旋转飞快时（>3 rad/s）画拖影
  if(cs.rotSpeed > 3){
    const n = Math.min(3, Math.floor((cs.rotSpeed-3)/1.5));
    for(let i=0;i<cs.minions.length;i++){
      const m = cs.minions[i];
      if(m.dead) continue;
      for(let k=1;k<=n;k++){
        const bkA = cs.ang + i*cs.step - cs.rotSpeed*0.05*k;
        const bx = cs.cx + Math.cos(bkA)*cs.radius;
        const by = cs.cy + Math.sin(bkA)*cs.radius;
        ctx.fillStyle = `rgba(255,255,255,${0.25 - k*0.06})`;
        ctx.beginPath(); ctx.arc(bx, by, m.r, 0, Math.PI*2); ctx.fill();
      }
    }
  }
  // 头顶红色感叹号（大小约普通怪大小）
  const pulse = 0.7 + 0.3*Math.sin(G.time*16);
  ctx.fillStyle = `rgba(255,30,30,${pulse})`;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  for(const m of cs.minions){
    if(m.dead) continue;
    ctx.fillText('!', m.x, m.y - m.r - 14);
  }
  // 剧情提示
  ctx.fillStyle = `rgba(255,220,120,${0.8+0.2*Math.sin(G.time*8)})`;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('小怪之怒 即将降临！', WW()/2, 90); // 👁️世界中心上方
}

// ===== WAVE SYSTEM =====
function startWave(n){
  G.wave = n;
  G.waveTimer = 0;
  coopCheckRevive(); // 双人：到波次的阵亡玩家半血复活
  Achieve.checkWave(n); // 波次成就
  // 🧟 尸潮模式：**没有 Boss 波**——纯怪潮一路推；每 10 波是一轮「精英尸潮」（数量×1.4、血量×1.15，见 waveEnemyCount/enemyHpScale）
  const isBoss = n % 10 === 0 && !G.horde;
  let cyc = 0; // 第几个 Boss（1,2,3,4…）
  if(isBoss){
    // Boss 循环：第10/20/30波 = 暗影领主/熔岩巨兽/虚空主宰（普通模式到此为止）
    // ♾ 无尽模式：每 4 个 Boss 一轮 —— 第 40/80/120… 波是 🔷棱光穹主（纯激光 Boss，普通模式永远不出现），
    //   其余位置继续轮回复用 1/2/3，Boss 强度按「轮次」递增；
    //   另外每 50 波（第 50/100/150…）由 ⚔斩铁剑皇 独占（纯大剑近战 Boss，同样只在无尽模式）
    cyc = Math.round(n / 10);
    if(G.world === 2){
      // 🌌 世界2 Boss 轮换：普通模式 = 6/7/8 三 Boss（第30波虚空裂界者通关）；
      //   无尽模式 = 6→7→8→9(碎撞巨像) 四 Boss 循环（第40波起登场），tier 递增
      const w2cyc = Math.ceil(n / 10);
      if(G.endlessOn){
        G.bossNum = 6 + ((w2cyc - 1) % 4);
        G.bossTier = Math.floor((w2cyc - 1) / 4) + 1;
      } else {
        G.bossNum = 6 + ((w2cyc - 1) % 3);
        G.bossTier = Math.floor((w2cyc - 1) / 3) + 1;
      }
    } else if(G.world === 3){
      // 🌿 世界3 Boss 轮换：普通模式 = 10/11/12 三 Boss（第30波蚀根龙王通关）；
      //   无尽模式 = 10→11→12→13(万秽之源) 四 Boss 循环，tier 递增
      const w3cyc = Math.ceil(n / 10);
      if(G.endlessOn){
        G.bossNum = 10 + ((w3cyc - 1) % 4);
        G.bossTier = Math.floor((w3cyc - 1) / 4) + 1;
      } else {
        G.bossNum = 10 + ((w3cyc - 1) % 3);
        G.bossTier = Math.floor((w3cyc - 1) / 3) + 1;
      }
    } else if(G.endlessOn){
      if(cyc % 5 === 0){                       // ⚔ 斩铁剑皇：第 50/100/150… 波（优先于 4 轮换）
        G.bossNum = 5;
        G.bossTier = Math.floor((cyc - 1) / 5) + 1;
      } else {
        const slot = (cyc - 1) % 4;            // 0/1/2 = 暗影/熔岩/虚空，3 = 棱光穹主
        G.bossNum = slot < 3 ? slot + 1 : 4;
        G.bossTier = Math.floor((cyc - 1) / 4) + 1;
      }
    } else {
      G.bossNum = ((cyc - 1) % 3) + 1; // 造型与 AI 始终映射回 1/2/3
      G.bossTier = Math.ceil(cyc / 3); // 普通模式轮次（第30波 = 第1轮的第3个）
    }
  }
  // 🌌🌿 世界2/世界3 走全新曲库（w2* / w3*），世界1 完全维持原曲（boss1~5 / calm）
  Music.setBattleMode(G.world, isBoss ? G.bossNum : 0); // Boss波切专属曲风（按本轮 Boss 造型，无尽轮回也有效）
  document.getElementById('wave-info').textContent = waveLabel(n);
  // boss wave every 10
  if(isBoss){
    G.inBossWave = true;
    G.bossFinal = !G.endlessOn && ((G.world === 1 && cyc === 3) || ((G.world === 2 || G.world === 3) && n === 30)); // 🌌🌿 世界2/世界3 第30波也通关
    G.boss = (G.bossNum === 4) ? new LaserBoss(G.bossTier)
            : (G.bossNum === 5) ? new BladeBoss(G.bossTier)
            : new Boss(G.bossNum, G.bossTier);
    if(G.coop){ G.boss.maxHp = Math.round(G.boss.maxHp * 1.6); G.boss.hp = G.boss.maxHp; } // 双人：Boss血量×1.6
    G.enemies.push(G.boss);
    SND.bossWarn();
    document.getElementById('boss-name').textContent = G.boss.name;
    document.getElementById('boss-bar-wrap').style.display = 'block';
    G.waveEnemiesLeft = 0; // boss only
  } else {
    G.inBossWave = false;
    G.bossFinal = false;
    document.getElementById('boss-bar-wrap').style.display = 'none';
    G.waveEnemiesLeft = waveEnemyCount(n);
    G.spawnTimer = 0;
  }
}
// 波次标题：♾ 无尽模式带标记，Boss 轮回带轮次；🧟 尸潮带精英潮标记
function waveLabel(n){
  if(G.horde) return (n % 10 === 0 ? '🧟 精英尸潮 · 第 ' + n + ' 波' : '🧟 第 ' + n + ' 波');
  if(!G.endlessOn) return '第 ' + n + ' 波';
  return '♾ 第 ' + n + ' 波' + (n % 10 === 0 && G.bossTier > 1 ? ' · 第' + G.bossTier + '轮' : '');
}
// 波次敌人总数（双人×1.35 数量加成）与血量缩放（双人×1.6），独立成纯函数便于测试
// ♾ 无尽模式：数量设上限（防爆屏掉帧），血量 30 波后加速增长（技能满级后仍会越来越吃紧）
// 🧟 尸潮模式：数量×2.2 拉满（封顶 80）、每 10 波精英潮再×1.4 —— "潮"就是密度；血量成长放慢（0.10/波、封顶 8×）
//    保住"一刀一片"的割草快感（玩家靠升级自动习得技能变强，不靠怪变弱）
function waveEnemyCount(n){
  if(G.horde){
    let c = Math.round((6 + n * 2.6) * 2.2);
    if(n % 10 === 0) c = Math.round(c * 1.4); // 精英尸潮
    return Math.min(c, 80);
  }
  let c = 5 + n * 2;
  if(G.endlessOn) c = Math.min(c, 44);
  return Math.round(c * (G.coop ? 1.35 : 1));
}
function enemyHpScale(n){
  if(G.horde){
    let s = Math.min(1 + n * 0.10, 8);
    if(n % 10 === 0) s *= 1.15; // 精英尸潮
    return s;
  }
  let s = 1 + n * 0.15;
  if(G.endlessOn) s += Math.max(0, n - 30) * 0.25; // ♾ 无尽：30 波后每波额外 +25% 血量
  return s * (G.coop ? 1.6 : 1);
}
// ♾ 是否"最终 Boss 波"：普通模式第 30 波（第 3 个 Boss 的第一轮）才算通关；无尽模式永远继续
// （带兜底：即使外部只设置了 bossNum=3 也能正确判定，不依赖 bossFinal 一定被赋值）
function isFinalBossWave(){
  return !!G.bossFinal || (!G.endlessOn && G.bossNum === 3 && (G.bossTier || 1) === 1);
}
// ♾ 无尽模式敌人伤害成长：20 波后每波 +2%；Boss 轮回每层再 ×(1 + 0.25×(层-1))
function enemyDmgMul(){
  if(!G.endlessOn) return 1;
  let m = 1 + Math.max(0, G.wave - 20) * 0.02;
  if(G.inBossWave && G.bossTier > 1) m *= 1 + (G.bossTier - 1) * 0.25;
  return m;
}


function spawnEnemy(){
  // 🧟 尸潮：解锁门槛按"第 14 波"算——开局就是全谱系怪潮（普通/快速/坦克/远程/冲撞一应俱全）；
  //    但**血量成长仍按真实波次**（hpScale 用 G.wave，不能用抬高的解锁波次，否则一出生就肉到砍不动）
  const n = G.wave;                                   // 真实波次：血量/伤害成长读它
  const pn = G.horde ? Math.max(n, 14) : n;           // 解锁波次：尸潮开局即全谱系
  // spawn from edges
  const side = Math.floor(rand(0,4));
  let x, y;
  if(side===0){ x=rand(0,WW()); y=-30; } // 👁️视野扩大：出生边缘随世界扩大
  else if(side===1){ x=WW()+30; y=rand(0,WH()); }
  else if(side===2){ x=rand(0,WW()); y=WH()+30; }
  else { x=-30; y=rand(0,WH()); }
  const hpScale = enemyHpScale(n); // 双人×1.6 血量
  // 🌌 世界2 怪物池：8 种（一一对应世界1 的七种角色 + 🫧虚空泡额外一种）且整体更强；按波次梯度解锁（对标世界1 的 n>3/5/10/20）
  if(G.world === 2){
    const pool = [
      { w:3.0, make:() => new FissionEnemy(x, y, hpScale) },                    // 🟣 裂变怪（对标普通怪，全程）
      { w:2.2, make:() => new DrainEnemy(x, y, hpScale) },                      // 🔵 汲取者（对标远程怪，全程）
    ];
    if(pn > 3)  pool.push({ w:2.0, make:() => new VoidDarter(x, y, hpScale) });   // 🩵 虚空疾行者（对标快速怪）
    if(pn > 5)  pool.push({ w:1.6, make:() => new BulwarkEnemy(x, y, hpScale) }); // 🟪 晶壁巨兽（对标坦克怪）
    if(pn > 8)  pool.push({ w:1.8, make:() => new CorrodeEnemy(x, y, hpScale) }); // 🟤 腐蚀者（对标粘液怪）
    if(pn >= 11) pool.push({ w:1.5, make:() => new VoidBubbleEnemy(x, y, hpScale) }); // 🫧 虚空泡（护罩敌人·泡泡会转移）
    if(pn > 12) pool.push({ w:1.4, make:() => new RiftCharger(x, y, hpScale) });  // 🩷 裂隙冲撞者（对标冲撞怪）
    if(pn > 16) pool.push({ w:1.3, make:() => new PrismShooter(x, y, hpScale) }); // 🟡 棱光射手（对标激光怪）
    let sum = 0; for(const it of pool) sum += it.w;
    let r = Math.random() * sum;
    for(const it of pool){ r -= it.w; if(r <= 0){ G.enemies.push(it.make()); return; } }
    G.enemies.push(new FissionEnemy(x, y, hpScale)); // 兜底（浮点边界）
    return;
  }
  // 🌿 世界3 怪物池：8 种（对应世界1 七种角色 + 🫘蚀种魔额外一种），机制整套换新（地面污染 + 反伤 + 根须 + 种子爆散）
  if(G.world === 3){
    const pool = [
      { w:3.0, make:() => new VineWretch(x, y, hpScale) },                     // 🟢 腐藤怪（对标普通怪，全程；走过留减速藤痕）
      { w:2.2, make:() => new SporePod(x, y, hpScale) },                       // 🟤 孢囊妖（对标远程怪，全程；落地孢云持续掉血）
    ];
    if(pn > 3)  pool.push({ w:2.0, make:() => new PollenWasp(x, y, hpScale) });   // 🟡 掠花粉蜂（对标快速怪；Z 字突进）
    if(pn > 5)  pool.push({ w:1.6, make:() => new ThornPuppet(x, y, hpScale) });  // 🟩 荆棘傀（对标坦克怪；反弹 30% 子弹伤害）
    if(pn > 8)  pool.push({ w:1.8, make:() => new TendrilEye(x, y, hpScale) });   // 🟣 蚀光藤眼（对标激光怪；预警后扫射藤光）
    if(pn >= 11) pool.push({ w:1.5, make:() => new RootSnarer(x, y, hpScale) });  // 🕸 缠根妖（对标织网者；零接触伤害的阵地点）
    if(pn > 12) pool.push({ w:1.4, make:() => new BrambleCharger(x, y, hpScale) }); // 🟫 角棘冲锋兽（对标冲撞怪；撞墙定身）
    if(pn > 16) pool.push({ w:1.3, make:() => new SeedBomber(x, y, hpScale) });   // 🫘 蚀种魔（对标虚空泡档位；死亡爆追踪种子）
    let sum = 0; for(const it of pool) sum += it.w;
    let r = Math.random() * sum;
    for(const it of pool){ r -= it.w; if(r <= 0){ G.enemies.push(it.make()); return; } }
    G.enemies.push(new VineWretch(x, y, hpScale)); // 兜底（浮点边界）
    return;
  }
  // 🕸️ 织网者（第5波起）：**独立抽样**，不挤在 else-if 链里
  //    原因：链式概率会"漏"——低波次时前面的怪还没解锁，份额全漏给后面的分支，
  //    导致第5波织网者占到 14%（太高，场地会被网切碎、玩家寸步难行）。独立抽样让各波次都稳定在 6%。
  if(pn >= 5 && Math.random() < 0.06){
    G.enemies.push(new WebSpiderEnemy(x, y, hpScale));
    return;
  }
  const roll = Math.random();
  if(roll < 0.15 && pn > 3){
    // 快速怪
    G.enemies.push(new Enemy(x, y, 15*hpScale, 180, 8, 10, '#fa4'));
  } else if(roll < 0.25 && pn > 5){
    // 坦克怪
    G.enemies.push(new Enemy(x, y, 50*hpScale, 70, 15, 22, '#84f'));
  } else if(roll < 0.40 && pn > 10){
    // 远程怪（蓝）— 打完第一个Boss后刷新
    G.enemies.push(new RangedEnemy(x, y, hpScale));
  } else if(roll < 0.55 && pn > 10){
    // 粘液怪（绿）— 打完第一个Boss后刷新
    G.enemies.push(new SlimeEnemy(x, y, hpScale));
  } else if(roll < 0.68 && pn > 20){
    // 冲撞怪（粉）— 打完第二个Boss后刷新（概率与普通怪互换）
    G.enemies.push(new ChargerEnemy(x, y, hpScale));
  } else if(roll < 0.83 && pn > 20){
    // 激光怪（黄）— 打完第二个Boss后刷新
    G.enemies.push(new LaserEnemy(x, y, hpScale));
  } else {
    // 普通怪（概率最大：21+波次占17%）
    G.enemies.push(new Enemy(x, y, 25*hpScale, 110, 10, 15, '#f44'));
  }
}

// ===== SKILL SYSTEM =====
// ⚠️ 属性写点要唯一：同一角色技能池里**不许两个技能各写同一个 p.属性**（重算式会互相覆盖）
//    —— 共享属性请统一走下面的 recalcXxx()，改动前先跑 _smoke/audit_skill_attr.py 自检
//   🩹 2026-10-08 用户报「有些技能升级时不叠加、被重新算」：同一个属性被两个技能写时，
//      后学的那个用 `p.属性 = 基础值 + 步长×等级` 从基础值重算 → 把先学的加成整块抹掉。
//      修法：同属性的所有来源合并进一个重算函数；base 懒初始化（首级升级那刻的当前值 = 基准），
//      天然把挑战因子 / PvP 等外部修正算进来。所有相关技能统一调用它 → 任意学习顺序结果一致。
function recalcSpeed(p){
  if(p.baseSpeed === undefined) p.baseSpeed = p.speed;
  p.speed = p.baseSpeed
    + 25*(p.skills.speed  || 0)  // 🏃 移速强化（通用）
    + 18*(p.skills.v_fast || 0)  // 🦇 疾影
    + 12*(p.skills.r_spd  || 0); // 🐣 练练跑步
}
function recalcMaxHp(p){
  if(p.baseMaxHp === undefined) p.baseMaxHp = p.maxHp;
  p.maxHp = p.baseMaxHp
    + 30*(p.skills.maxhp || 0)   // ❤️ 生命上限（通用）
    + 8 *(p.skills.r_hp  || 0)   // 🩹 贴个创可贴
    + 15*(p.skills.kn_hp || 0)   // 🛡 重甲（骑士）
    + 12*(p.skills.sp_hp || 0);  // 🥊 弹簧骨架（弹簧）
}
function recalcBulletDmg(p){
  if(p.baseBulletDmg === undefined) p.baseBulletDmg = p.bulletDmg;
  let v = p.baseBulletDmg;
  v += 9 *(p.skills.m_heavy  || 0); // 🗡 重斩
  v += 7 *(p.skills.v_dmg    || 0); // 🦇 血爪
  v += 3 *(p.skills.r_dmg    || 0); // 🐣 敲重一点
  v += 3 *(p.skills.e_wrench || 0); // ⚙️ 扳手加强
  v += 5 *(p.skills.damage   || 0); // 🔫 伤害强化（🧪毒液 / 🔮魔法师 / 💣爆破 也吃）
  v += 8 *(p.skills.t_blade  || 0); // 🌀 狂风斩
  v += 9 *(p.skills.gen_dmg  || 0); // ⚔️ 枪锋淬刃
  v += 3 *(p.skills.v_shot   || 0); // 🧪 毒素强击
  v += 3 *(p.skills.m_dmg    || 0); // 🔮 奥术强化
  v += 12*(p.skills.l_amp    || 0); // 🔆 功率提升
  v += 4 *(p.skills.bm_dmg   || 0); // 🪃 开刃（回旋镖单段伤害）
  v += 4 *(p.skills.dm_dmg   || 0); // 🐶 短刀淬毒
  v += 8 *(p.skills.kn_dmg   || 0); // 🛡 剑术精进（骑士重剑）
  v += 6 *(p.skills.sp_power || 0); // 🥊 钢铁拳套（弹簧拳）
  p.bulletDmg = v;
  if(p.isLaser) p.beamDps = v;                                     // 🔆 光束与子弹同源
  if(p.isMage)  p.fireDmg  = p.baseBulletDmg + 3*(p.skills.m_dmg || 0); // 🔥 火球直伤（火球结算读的是这个字段）
}
// 各角色出手间隔下限（原先分散写死在各技能的 Math.max 里，现在统一到一处）
const SHOOT_RATE_FLOOR = { melee:0.12, vampire:0.08, rookie:0.32, tornado:0.22, general:0.12,
                           mage:0.20, venom:0.06, bomber:0.06, gunner:0.06, laser:0.06, stone:0.06, engineer:0.06,
                           boomerang:0.30, // 🪃 回旋镖下限 0.30（一枚镖要打完往返，比射手慢一档）
                           cardmaster:0.06, // 🃏 卡牌大师下限 0.06（和射手同档：抽牌扇出就是连发）
                           ketchup:0.45, // 🍅 番茄酱之神下限 0.45（捏包是手艺活，不比射手快）
                           knight:0.45, // 🛡 骑士下限 0.45（重剑永远是重剑：频率低是身份，技能只缩前摇不加射速）
                           spring:0.24, // 🥊 弹簧下限 0.24（蓄力是主节奏，冷却只防无脑连点）
                           bard:0.10 }; // 🎻 吟游诗人下限 0.10（拨弦有节拍，不会快到糊成一片）
function recalcShootRate(p){
  if(p.baseShootRate === undefined) p.baseShootRate = p.shootRate;
  let v = p.baseShootRate;
  v -= 0.06*(p.skills.m_combo  || 0); // 🗡 连斩
  v -= 0.04*(p.skills.v_rate   || 0); // 🦇 连撕
  v -= 0.06*(p.skills.r_rate   || 0); // 🐣 挥快一点
  v -= 0.04*(p.skills.firerate || 0); // 🔫 急速射击
  v -= 0.05*(p.skills.t_spin   || 0); // 🌀 迅捷旋风
  v -= 0.08*(p.skills.gen_spd  || 0); // ⚔️ 连刺
  v -= 0.07*(p.skills.m_spd    || 0); // 🔮 疾速咏唱
  v -= 0.05*(p.skills.bm_rate  || 0); // 🪃 快手投掷（回旋镖；下限 0.30，比射手慢一档）
  v -= 0.035*(p.skills.cm_rate || 0); // 🃏 快手洗牌（卡牌大师；下限 0.06，和射手同档）
  v -= 0.06*(p.skills.sp_cd   || 0); // 🥊 快速上弦（弹簧；下限 0.24）
  v -= 0.08 *(p.skills.k_fast  || 0); // 🍅 捏包老手（番茄酱之神；下限 0.45）
  v -= 0.025*(p.skills.bard_vib ||0); // 🎻 颤音（吟游诗人；下限 0.10）
  p.shootRate = Math.max(SHOOT_RATE_FLOOR[heroKind(p)] || 0.06, v);
}
// 所有技能均为线性数值增加（基于初始值，每级固定增量），避免复合增长
// 技能池按角色分家（hero: 'melee' 剑士专属 / 'laser' 激光专属 / 'gunner' 射手专属 / 'both' 通用）：
// 面板与随机学习只抽本角色可用的技能 —— 剑士不再硬套远程技能，改用一整套近战技能
const ALL_SKILLS = [
  // ===== 🗡 剑士专属（大剑近战，全新一套）=====
  { id:'m_combo', hero:'melee', name:'连斩', icon:'🌀', desc:'挥砍间隔-0.06秒（0.45→0.15，最短 0.12 秒），出刀越来越快；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'m_heavy', hero:'melee', name:'重斩', icon:'🪓', desc:'斩击伤害+9（26→71）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'m_whirl', hero:'melee', name:'回旋斩', icon:'🔁', desc:'挥砍张角从基础 90° 起，每级 +54°（1级144°/2级198°/3级252°/4级306°/5级360° 一整圈）', max:5,
    apply(p){ const lv = p.skills.m_whirl||0; p.whirlArc = lv > 0 ? (90 + 54*lv) * Math.PI/360 : 0; } },
  // 🗡 斩灭（剑士主动技）的两条升级线：转得更快 / 扇得更开
  { id:'m_ult_cd', hero:'melee', name:'斩意凝聚', icon:'⏱️', desc:'「斩灭」冷却 60→50/40/30 秒（更快攒出下一发清场）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.swCDMax = Math.max(30, 60 - 10*(p.skills.m_ult_cd||0)); } },
  { id:'m_ult_arc', hero:'melee', name:'开天阔刃', icon:'🌌', desc:'「斩灭」张角 150°→200°/250°/300°，半径 +50/级（清场范围更大）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.m_ult_arc||0; p.swArc = (75 + 25*lv) * Math.PI/180; p.swRangeBonus = 50*lv; } },
  { id:'m_rend', hero:'melee', name:'裂空', icon:'✂️', desc:'挥砍半径+16（76→124），一次可斩掉的敌方弹幕+2/级（3→9 发）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.m_rend||0; p.slashRange = 76 + 16*lv; p.cutBonus = 2*lv; } },
  { id:'m_dash', hero:'melee', name:'突进斩', icon:'💨', desc:'出刀瞬间朝瞄准方向突进 22/级（22→44）；♾无尽模式无等级上限', max:2, unl:1,
    apply(p){ p.dashPerSlash = 22*(p.skills.m_dash||0); } },
  { id:'m_burst', hero:'melee', name:'爆裂斩', icon:'💥', desc:'斩中的敌人身上爆炸：半径 40/55/70，伤害为斩击的 50%/100%/150%', max:3,
    apply(p){ p.explosive = (p.skills.m_burst||0); } },
  { id:'m_flame', hero:'melee', name:'烈焰斩', icon:'🔥', desc:'剑刃点燃：斩中后着火 3 秒，每 0.5 秒每层烧 4/8/12，层数上限=等级', max:3,
    apply(p){ /* 无属性修改：点燃在 slash 命中结算时读取 p.skills.m_flame */ } },
  { id:'m_thunder', hero:'melee', name:'引雷斩', icon:'⚡', desc:'斩中后雷电弹向附近敌人 1/2/3 次（链距 170/220/270），每跳 60% 伤害', max:3,
    apply(p){ /* 无属性修改：弹跳次数在 slash 命中结算时读取 p.skills.m_thunder */ } },
  { id:'m_gale', hero:'melee', name:'剑气斩', icon:'🌪️', desc:'每次挥砍额外向前劈出一道剑气：穿透 1/2/3 个敌人，伤害为斩击的 50%/75%/100%', max:3,
    apply(p){ /* 无属性修改：剑气在 slash 出刀时生成并读取 p.skills.m_gale */ } },
  { id:'m_guard', hero:'melee', name:'铁壁', icon:'🧱', desc:'每次挥砍后 0.45 秒内减伤 20%/级（最多 60%）', max:3,
    apply(p){ p.guardRate = Math.min(0.6, 0.2*(p.skills.m_guard||0)); } },
  // ===== 🦇 吸血鬼专属（利爪近战：极速 + 刀刀回血，伤害靠"出刀频率"而不是单刀重量）=====
  { id:'v_fast', hero:'vampire', name:'疾影', icon:'💨', desc:'移动速度+18（330→402，永远比怪快一大截）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ recalcSpeed(p); } },
  { id:'v_leech', hero:'vampire', name:'嗜血', icon:'🩸', desc:'每次挥砍命中回血 +1/级（每命中 1 个敌人回 1→5 点，单刀最多回 3 倍）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.vampLeech = 1 + (p.skills.v_leech||0); } },
  { id:'v_dmg', hero:'vampire', name:'血爪', icon:'🩸', desc:'爪击伤害+7（15→50）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'v_rate', hero:'vampire', name:'连撕', icon:'🌀', desc:'挥砍间隔-0.04秒（0.30→0.10，最短 0.08 秒）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'v_range', hero:'vampire', name:'裂血', icon:'✂️', desc:'爪击半径+14（70→112），一次可撕掉的敌方弹幕+2/级（3→9 发）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.v_range||0; p.slashRange = 70 + 14*lv; p.cutBonus = 2*lv; } },
  { id:'v_arc', hero:'vampire', name:'血月轮', icon:'🔁', desc:'爪击张角从基础 90° 起，每级 +54°（1级144°/2级198°/3级252°/4级306°/5级360° 一整圈）', max:5,
    apply(p){ const lv = p.skills.v_arc||0; p.vampArc = (45 + 27*lv) * Math.PI/180; } },
  // 🖱 血月突袭（吸血鬼主动技）的两条升级线：冲得更远 / 转得更快
  { id:'v_dash', hero:'vampire', name:'血月疾行', icon:'🌙', desc:'「血月突袭」距离 +70/级（300→510），冷却 6→4.8/3.6/2.4 秒；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.v_dash||0; p.vampDash = 300 + 70*lv; p.vampCDMax = Math.max(2, 6 - 1.2*lv); } },
  { id:'v_burst', hero:'vampire', name:'血爆', icon:'💥', desc:'爪击命中处炸开血花：半径 40/55/70，伤害为爪击的 50%/100%/150%', max:3,
    apply(p){ p.explosive = (p.skills.v_burst||0); } },
  { id:'v_gale', hero:'vampire', name:'血刃', icon:'🌪️', desc:'每次挥爪额外向前甩出一道穿透血刃：穿透 1/2/3 个敌人，伤害为爪击的 50%/75%/100%', max:3,
    apply(p){ /* 无属性修改：血刃在 slash 出刀时生成并读取 p.skills.v_gale */ } },
  // ===== 🐣 新手专属（全员最弱：木棍近战 + 「手滑」缺陷；技能全是小加成，不给翻盘口子）=====
  { id:'r_dmg', hero:'rookie', name:'敲重一点', icon:'🪵', desc:'木棍伤害+3（6→21）', max:5,
    apply(p){ recalcBulletDmg(p); } },
  { id:'r_rate', hero:'rookie', name:'挥快一点', icon:'💨', desc:'挥棍间隔-0.06秒（0.62→0.32）；同时缩短「扔木棍」的丢棍间隔（5→3 秒）', max:5,
    apply(p){ recalcShootRate(p); recalcTossCD(p); } },
  { id:'r_len', hero:'rookie', name:'换根长的', icon:'📏', desc:'木棍范围+10（62→112）', max:5,
    apply(p){ p.slashRange = 62 + 10*(p.skills.r_len||0); } },
  { id:'r_hp', hero:'rookie', name:'贴个创可贴', icon:'🩹', desc:'生命上限+8 并回血（70→110）', max:5,
    apply(p){ recalcMaxHp(p); p.hp = Math.min(p.maxHp, p.hp + 8); } },
  { id:'r_spd', hero:'rookie', name:'练练跑步', icon:'🏃', desc:'移动速度+12（205→265，满级也还是全场最慢）', max:5,
    apply(p){ recalcSpeed(p); } },
  { id:'r_arc', hero:'rookie', name:'抡圆一点', icon:'🔄', desc:'挥棍张角 90°→120°/150°', max:2,
    apply(p){ /* 无属性修改：张角在 arcFromSkills 出刀时实时读取 p.skills.r_arc */ } },
  { id:'r_steady', hero:'rookie', name:'手不抖了', icon:'✋', desc:'解除「手滑」：不再每 4 棍打空一次', max:1,
    apply(p){ /* 无属性修改：手滑在 slash 出刀时读取 p.skills.r_steady */ } },
  { id:'r_toss', hero:'rookie', name:'扔木棍', icon:'🤾', desc:'自动开丢：每 5 秒朝身边随机位置甩一根木棍（始终 0 伤害）——砸到怪木棍消失；落地后存在 10 秒，踩到的怪或本人被绊倒眩晕 0.5 秒（Boss 免疫绊倒，但一脚踩碎木棍）；被踩 4 次或超时会滚走消失（滚木不存在）。「挥快一点」同时缩短丢棍间隔', max:1,
    apply(p){ recalcTossCD(p); } },
  { id:'r_cry', hero:'rookie', name:'嗓门大', icon:'📢', desc:'「战吼」冷却 12→10/8 秒（吼得更勤：队友的 ×1.5 增伤覆盖更久）', max:2,
    apply(p){ p.rkCryCDMax = Math.max(8, 12 - 2*(p.skills.r_cry||0)); } },
  // ===== ⚙️ 工程师专属（放置系：全部围绕「自动炮台」）=====
  { id:'e_dmg', hero:'engineer', name:'炮台强化', icon:'💥', desc:'炮台单发伤害+4（12→32）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ p.engDmg = 12 + 4*(p.skills.e_dmg||0); } },
  { id:'e_rate', hero:'engineer', name:'炮台速射', icon:'⚡', desc:'炮台开火间隔-0.08秒（1.0→0.68）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.engRate = Math.max(0.30, 1.0 - 0.08*(p.skills.e_rate||0)); } },
  { id:'e_num', hero:'engineer', name:'生产线', icon:'🏭', desc:'炮台上限+1（3→4→5 座）——铺满一座炮阵', max:2,
    apply(p){ p.engMax = 3 + (p.skills.e_num||0); } },
  { id:'e_life', hero:'engineer', name:'长效电池', icon:'🔋', desc:'炮台存在时长+3秒（12→21 秒）', max:3,
    apply(p){ p.engLife = 12 + 3*(p.skills.e_life||0); } },
  { id:'e_auto', hero:'engineer', name:'自动流水线', icon:'🔧', desc:'自动部署间隔-1秒（8→5 秒）——自己动手的少了', max:3,
    apply(p){ p.engEvery = Math.max(3, 8 - 1*(p.skills.e_auto||0)); } },
  { id:'e_rapid', hero:'engineer', name:'快速组装', icon:'⏱️', desc:'战车建造时间-0.4秒（3.0→1.8 秒）——车来得更快，冷却仍是 60 秒', max:3,
    apply(p){ p.vehBuildMax = Math.max(1.8, 3 - 0.4*(p.skills.e_rapid||0)); } },
  { id:'e_range', hero:'engineer', name:'瞄准镜', icon:'🎯', desc:'炮台射程+40（260→380）——塔能打得更远', max:3,
    apply(p){ p.engRange = 260 + 40*(p.skills.e_range||0); } },
  { id:'e_wrench', hero:'engineer', name:'扳手加强', icon:'🔧', desc:'本体扳手伤害+3（8→23）——实在没塔了才用得上', max:5,
    apply(p){ recalcBulletDmg(p); } },
  // ===== 🪃 回旋镖专属（远程 · 普攻往返双段 + 大招贴身环绕 5 秒）=====
  { id:'bm_dmg', hero:'boomerang', name:'开刃', icon:'💢', desc:'镖刃伤害+4（单段 10→30，去程/回程/大招环绕每一下都提升）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'bm_rate', hero:'boomerang', name:'快手投掷', icon:'⚡', desc:'出手间隔-0.05秒（0.55→0.30，最短 0.30 秒）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'bm_range', hero:'boomerang', name:'长弧', icon:'📏', desc:'普攻去程距离+45（300→525）· 大招环绕半径+15（105→180）：弧更长、刀网更大', max:5,
    apply(p){ const lv = p.skills.bm_range||0; p.bmRange = BM_RANGE + 45*lv; p.bmOrbitR = BM_ORBIT_R + 15*lv; } },
  { id:'bm_fly', hero:'boomerang', name:'破风', icon:'💨', desc:'飞行速度+70（去程 560→910，回程同步变快）· 大招环绕角速度+2.4（每秒 1.9→2.3 圈）', max:5,
    apply(p){ const lv = p.skills.bm_fly||0; p.bmOutSpd = BM_SPD_OUT + 70*lv; p.bmBackSpd = BM_SPD_BACK + 70*lv; p.bmOrbitW = BM_ORBIT_W + 2.4*lv; } },
  { id:'bm_return', hero:'boomerang', name:'回旋重击', icon:'🔁', desc:'回程伤害 ×1.0→×1.2/1.4/1.6（回来那一下更疼——把怪留在回程路上）', max:3,
    apply(p){ p.bmBackMul = BM_RETURN_MUL + 0.2*(p.skills.bm_return||0); } },
  { id:'bm_pierce', hero:'boomerang', name:'贯穿', icon:'➹', desc:'去程/回程各自额外穿透+1（每条路径 2→3/4/5 个敌人，大招环绕一圈同样多咬）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bmPierce = BM_PIERCE + (p.skills.bm_pierce||0); } },
  { id:'bm_multi', hero:'boomerang', name:'双镖齐飞', icon:'🔱', desc:'每次多扔 1 枚（1→2→3 枚），场上同时上限也 +1（2→3→4）——弧线铺成一张网', max:2,
    apply(p){ p.bmMultishot = 1 + (p.skills.bm_multi||0); p.bmMax = BM_MAX + (p.skills.bm_multi||0); } },
  // 🌀 万镖齐发（回旋镖主动技）的两条升级线：转得更快 / 甩得更多
  { id:'bm_ult_cd', hero:'boomerang', name:'风暴之眼', icon:'⏱️', desc:'「万镖齐发」冷却 30→25/20/15 秒（风车转得更勤）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bmUltCDMax = Math.max(15, BM_ULT_CD - 5*(p.skills.bm_ult_cd||0)); } },
  { id:'bm_ult_n', hero:'boomerang', name:'镖阵扩张', icon:'🎇', desc:'「万镖齐发」一次甩 8→12/16 枚（同时环绕的刀网更密）；♾无尽模式无等级上限', max:2, unl:1,
    apply(p){ p.bmUltN = BM_ULT_N + 4*(p.skills.bm_ult_n||0); } },
  // ===== 🐶 野生狗奶专属（近战短刀：命中即「奶住」敌人——定身+持续掉血；大招「春秋邻域」全屏核弹）=====
  { id:'dm_dmg', hero:'dogmilk', name:'短刀淬毒', icon:'🗡️', desc:'短刀伤害+4（12→32）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'dm_rng', hero:'dogmilk', name:'伸长短刀', icon:'📏', desc:'攻击距离+10/级（66→96，手别太短，少贴脸）', max:3,
    apply(p){ p.slashRange = 66 + 10*(p.skills.dm_rng||0); } },
  { id:'dm_dur', hero:'dogmilk', name:'奶力持久', icon:'⏳', desc:'「奶住」定身/掉血时长 +1.5 秒/级（基础 等级×2 秒，软上限 6 秒）', max:3,
    apply(p){ /* 时长在 slash 命中时实时读 p.skills.dm_dur */ } },
  { id:'dm_dot', hero:'dogmilk', name:'奶水更浓', icon:'💧', desc:'「奶住」秒伤 +4/级（基础 10→22 每秒，每 0.5 秒一跳）', max:3,
    apply(p){ /* 秒伤在 slash 命中时实时读 p.skills.dm_dot */ } },
  { id:'dm_heal', hero:'dogmilk', name:'舔舐伤口', icon:'👅', desc:'命中「奶住」敌人时回血 +2/级（薄血近战的活路）', max:3,
    apply(p){ /* 回血在 slash 命中时实时读 p.skills.dm_heal */ } },
  { id:'dm_ult_cd', hero:'dogmilk', name:'春秋循环', icon:'⏱️', desc:'「春秋邻域」冷却 180→150/120/90 秒（核弹来得更勤）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.dogCDMax = Math.max(90, 180 - 30*(p.skills.dm_ult_cd||0)); } },
  // ===== 🃏 卡牌大师专属（远程赌徒：抽 5 张牌，同点数叠倍率，王炸秒杀）=====
  { id:'cm_dmg', hero:'cardmaster', name:'稳赢', icon:'💰', desc:'每张牌基础伤害 +2（手牌越差越能兜底）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ /* 实时读 p.skills.cm_dmg（cmScoreHand） */ } },
  { id:'cm_rate', hero:'cardmaster', name:'快手洗牌', icon:'🌀', desc:'抽牌出手间隔 -0.035 秒（0.38→0.18，最短 0.06 秒）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'cm_multi', hero:'cardmaster', name:'对子专家', icon:'👯', desc:'同点数倍率额外 +0.5/级（对子 ×2.5 → 四条 ×4.5）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ /* 实时读 p.skills.cm_multi（cmScoreHand） */ } },
  { id:'cm_straight', hero:'cardmaster', name:'同花顺专精', icon:'📈', desc:'顺子加成 ×1.15/级（5 张连号 → ×1.4）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ /* 实时读 p.skills.cm_straight（cmScoreHand） */ } },
  { id:'cm_joker', hero:'cardmaster', name:'王上加王', icon:'🃅', desc:'单张「王」基础伤害 16→32/级（单王不丢份）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ /* 实时读 p.skills.cm_joker（cmScoreHand） */ } },
  { id:'cm_ult', hero:'cardmaster', name:'飞机强化', icon:'✈️', desc:'大招「飞机」伤害 ×1.25/级（240→420 满级；击退眩晕范围不变）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ /* 实时读 p.skills.cm_ult（cmUltBoom） */ } },
  // ===== 🍅 番茄酱之神专属（酱潭控场 + 吃酱回血）=====
  { id:'k_thick', hero:'ketchup', name:'酱香浓郁', icon:'🥫', desc:'番茄酱潭每跳伤害 +3（7→19）、减速更狠（移速 ×0.50→×0.32，最低 0.32）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ const lv = p.skills.k_thick||0; p.kDmg = KET_DMG + 3*lv; p.kSlow = Math.max(0.32, KET_SLOW - 0.06*lv); } },
  { id:'k_big', hero:'ketchup', name:'大滩番茄酱', icon:'🟥', desc:'酱潭半径 +14（55→97），一滩盖住更大一片；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.kR = KET_R + 14*(p.skills.k_big||0); } },
  { id:'k_long', hero:'ketchup', name:'酱汁持久', icon:'⏳', desc:'酱潭持续时间 +1.2 秒（普攻潭 4.5→9.3、技能潭 7.5→12.3），怪在酱里多泡一会；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.kDur = KET_DUR + 1.2*(p.skills.k_long||0); } },
  { id:'k_fast', hero:'ketchup', name:'捏包老手', icon:'✋', desc:'扔包出手间隔 -0.08 秒（0.85→0.61，最短 0.45），酱包甩得更密；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'k_heal', hero:'ketchup', name:'再来一包', icon:'🍅', desc:'「吃番茄酱」回血 +12/级（20→56）、冷却 -4 秒/级（30→18，最短 18 秒）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.k_heal||0; p.kHeal = KET_EAT_HP + 12*lv; p.kCDMax = Math.max(18, KET_EAT_CD - 4*lv); } },
  // ===== 🛡 骑士专属（重甲坦克剑士：高伤低频前摇 + 举盾 + 勇士冲锋；全部只放大已有机制，不加新机制）=====
  { id:'kn_dmg', hero:'knight', name:'剑术精进', icon:'🗡️', desc:'重剑伤害+8/级（36→76，全场最重的单手剑）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'kn_hp', hero:'knight', name:'重甲', icon:'🛡', desc:'生命上限+15/级（160→235）并立即回血——坦克的甲再厚一层；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcMaxHp(p); p.hp = Math.min(p.maxHp, p.hp + 15); } },
  { id:'kn_wind', hero:'knight', name:'疾风斩', icon:'💨', desc:'挥剑前摇-0.05秒/级（0.30→0.10，最短 0.15 秒）——起手更快，但重剑永远有前摇；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.kNWindMax = Math.max(KN_WIND_FLOOR, KN_WINDUP - 0.05*(p.skills.kn_wind||0)); } },
  { id:'kn_wide', hero:'knight', name:'盾面加宽', icon:'🔷', desc:'举盾格挡张角 120°→160°/200°（半角 60°→80°/100°）——盾牌覆盖面更大，身侧来袭也吃得住', max:2,
    apply(p){ const lv = p.skills.kn_wide||0; p.kShieldArc = (60 + 20*lv) * Math.PI/180; } },
  { id:'kn_guard', hero:'knight', name:'守护誓言', icon:'✨', desc:'「勇士冲锋」期间队友减伤 50%→60%/70%、增益半径 220→260/300——护得住更多人', max:2,
    apply(p){ const lv = p.skills.kn_guard||0; p.kAuraDR = 0.5 + 0.1*lv; p.kAuraR = KN_AURA_R + 40*lv; } },
  { id:'kn_charge', hero:'knight', name:'冲锋意志', icon:'⏱️', desc:'「勇士冲锋」持续 5→6/7/8 秒、冷却 20→18/16 秒——冲得更久、来得更勤；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.kn_charge||0; p.knDurMax = KN_CHARGE_T + lv; p.knCDMax = Math.max(16, KN_CHARGE_CD - 2*lv); } },
  // ===== 🥊 弹簧专属（蓄力弹飞 + 弹簧钩）=====
  { id:'sp_power', hero:'spring', name:'钢铁拳套', icon:'💪', desc:'弹簧拳伤害 +6/级（12→42 基础档，满蓄 42→72）——拳套换了铁的，弹出去更疼；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'sp_launch', hero:'spring', name:'超弹压缩', icon:'🚀', desc:'弹飞初速 +180/级（760→1660 基础档）、弹飞滞留 +0.08 秒/级——怪被崩得更远，撞墙撞得更瓷实；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.sp_launch||0; p.spLaunch = SP_LAUNCH + 180*lv; p.spFlyT = SP_FLY_T + 0.08*lv; } },
  { id:'sp_wall', hero:'spring', name:'墙裂冲击', icon:'🧱', desc:'撞墙额外伤害 +10/级（18→48 基础档）、冲击波半径 +18/级、冲击波伤害 +6/级——往墙边打就是往墙上赚；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.sp_wall||0; p.spWallDmg = SP_WALL_DMG + 10*lv; p.spWaveR = SP_WAVE_R + 18*lv; p.spWaveDmg = SP_WAVE_DMG + 6*lv; } },
  { id:'sp_hook', hero:'spring', name:'长臂钩索', icon:'🪝', desc:'钩索锚距 +70/级（460→650）、牵引碰伤 +5/级（14→29）——胳膊更长，飞过去蹭倒一片；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.sp_hook||0; p.spHookRange = SP_HOOK_RANGE + 70*lv; p.spHookDmg = SP_HOOK_DMG + 5*lv; } },
  { id:'sp_cd', hero:'spring', name:'快速上弦', icon:'⚡', desc:'出拳间隔 -0.06 秒/级（0.42→0.24，最短 0.24 秒）——拳套回弹更快，蓄力拳接得更密；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'sp_hp', hero:'spring', name:'弹簧骨架', icon:'🦴', desc:'生命上限 +12/级（102→150）并立即回血——骨架换了弹簧钢，扛得多也更弹；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ recalcMaxHp(p); } },
  // ===== 🎻 吟游诗人专属（唯一的治疗位：穿透音波 + 回旋曲）=====
  { id:'bard_chord', hero:'bard', name:'和弦', icon:'🎼', desc:'音波多穿 1 个目标/级（穿 2→5 个，一串打穿）——怪越排队越划算；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bardPierce = BARD_PIERCE + (p.skills.bard_chord || 0); } },
  { id:'bard_long', hero:'bard', name:'长音', icon:'🎵', desc:'回旋曲引导 +1 秒/级（3→6 秒，多拉一秒多回一份血）——站得住才拉得完；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bardSongMax = BARD_SONG_T + (p.skills.bard_long || 0); } },
  { id:'bard_vib', hero:'bard', name:'颤音', icon:'🎶', desc:'音波出手间隔 -0.025 秒/级（0.30→0.20，最短 0.10 秒）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'bard_var', hero:'bard', name:'变奏', icon:'🎹', desc:'回旋曲每秒回血 +3/级（8→17 血/秒）——曲子还是那首，药效更足；♾无限模式无等级上限', max:3, unl:1,
    apply(p){ p.bardHealRate = BARD_HEAL + 3*(p.skills.bard_var || 0); } },
  { id:'bard_flourish', hero:'bard', name:'华彩', icon:'✨', desc:'「回旋曲」曲子半径 +45/级（200→245/290）——曲子覆盖更广，队友站远处也能吃到治疗与加速；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bardHealR = BARD_SONG_R + 45*(p.skills.bard_flourish || 0); } },
  { id:'bard_encore', hero:'bard', name:'加演', icon:'👏', desc:'回旋曲冷却 -3 秒/级（22→13 秒）——多演一场，多救一次；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bardCDMax = BARD_SONG_CD - 3*(p.skills.bard_encore || 0); } },
  // ===== 🔫 射手专属（远程自动射击）=====
  { id:'firerate', hero:'gunner', name:'急速射击', icon:'⚡', desc:'射击间隔-0.04秒（0.35→0.15，最短 0.06 秒）且弹速+50（520→770）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcShootRate(p); p.bulletSpd = 520 + 50*(p.skills.firerate||0); } },
  { id:'damage', hero:'gunner', name:'伤害强化', icon:'💥', desc:'子弹伤害+5（10→35）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'multishot', hero:'gunner', name:'多重射击', icon:'🔱', desc:'每次多射1发子弹', max:4,
    apply(p){ p.multishot += 1; } },
  { id:'pierce', hero:'gunner', name:'穿透弹', icon:'➹', desc:'子弹穿透+1个敌人；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.pierce += 1; } },
  { id:'explosive', hero:'gunner', name:'爆炸弹', icon:'🔥', desc:'子弹命中爆炸（半径 40+15/级、伤害随等级增长）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.explosive += 1; } },
  { id:'burn', hero:'gunner', name:'灼烧弹', icon:'♨️', desc:'命中点燃敌人3秒并+1层灼烧（层数上限=等级层），每0.5秒每层烧4/8/12，重复命中刷新时长', max:3,
    apply(p){ /* 无属性修改：点燃在子弹命中结算时读取 p.skills.burn */ } },
  { id:'chain', hero:'gunner', name:'连锁闪电', icon:'🌩️', desc:'命中后闪电弹向附近敌人1/2/3次（弹跳链距170/220/270），每跳60%伤害', max:3,
    apply(p){ /* 无属性修改：弹跳次数在子弹命中结算时读取 p.skills.chain */ } },
  { id:'homing', hero:'gunner', name:'追踪弹', icon:'🎯', desc:'子弹追踪敌人', max:2,
    apply(p){ p.homing += 1; } },
  // 🏹 环形弹幕（射手主动技）的两条升级线：转得更快 / 圈更密
  //    ultOnly:'gunner'：爆破/毒液共用射手池但没有环形弹幕，这两个不能进他们的选项
  { id:'g_ult_cd', hero:'gunner', name:'弹药风暴', icon:'⏱️', ultOnly:'gunner', desc:'「环形弹幕」冷却 30→25/20/15 秒（大招转得回来）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.ringCDMax = Math.max(15, 30 - 5*(p.skills.g_ult_cd||0)); } },
  { id:'g_ult_dens', hero:'gunner', name:'弹幕环阵', icon:'🎇', ultOnly:'gunner', desc:'「环形弹幕」每圈 12→16/20/24 发（6 圈一共 72→144 发）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.ringBullets = 12 + 4*(p.skills.g_ult_dens||0); } },
  // ===== 🔆 激光角色专属池（只改光束；不吃射速/射击CD，只吃"过热节奏"）=====
  { id:'l_amp', hero:'laser', name:'功率提升', icon:'🔆', desc:'光束每秒伤害 +12（42→102）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'l_focus', hero:'laser', name:'聚焦透镜', icon:'💠', desc:'光柱更粗：判定半宽 +7/级（9→30）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.l_focus||0; p.beamWidth = 9 + 7*lv; } },
  { id:'l_cool', hero:'laser', name:'散热片', icon:'❄️', desc:'过热上限 +25%/级、散热速度 +45%/级；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.l_cool||0; p.heatMax = 100*(1+0.25*lv); p.coolRate = 48*(1+0.45*lv); } },
  { id:'l_split', hero:'laser', name:'分光棱镜', icon:'🔱', desc:'额外分出 1/2 道光束（左右各偏 16°）', max:2,
    apply(p){ p.beamForks = (p.skills.l_split||0); } },
  { id:'l_burn', hero:'laser', name:'灼烧', icon:'🔥', desc:'被光束照到就着火 3 秒，每 0.5 秒每层烧 4/8/12，层数上限=等级', max:3,
    apply(p){ /* 无属性修改：着火在光束伤害结算时读取 p.skills.l_burn */ } },
  { id:'l_chain', hero:'laser', name:'电弧', icon:'⚡', desc:'光束照到后电弧弹向附近 1/2/3 个敌人（链距 170/220/270），每个敌人 0.45 秒触发一次，每跳 50% 每秒伤害', max:3,
    apply(p){ /* 无属性修改：弹跳在光束结算时读取 p.skills.l_chain */ } },
  { id:'l_over', hero:'laser', name:'过载爆发', icon:'💥', desc:'过热强制冷却的那一刻原地炸开：半径 90/130/170，伤害 = 每秒伤害 ×1.5/2/2.5', max:3,
    apply(p){ /* 无属性修改：过热瞬间读取 p.skills.l_over */ } },
  { id:'l_slow', hero:'laser', name:'迟滞', icon:'🕸️', desc:'被光束照到的敌人移动速度 -20%/级（离开光束 1 秒后恢复）', max:2,
    apply(p){ /* 无属性修改：减速在光束结算时读取 p.skills.l_slow */ } },
  { id:'l_prism', hero:'laser', name:'棱镜反射', icon:'🔮', desc:'光束打到敌人后折射向最近的另一名敌人，可反射 1/2/3 次；反射段每秒伤害 ×0.6', max:3,
    apply(p){ /* 无属性修改：折返在 beamCast 时读取 p.skills.l_prism */ } },
  // 🔆 旋转扫射（激光主动技）的两条升级线：转得更快 / 转得更疼
  { id:'l_ult_cd', hero:'laser', name:'棱镜谐振', icon:'⏱️', desc:'「旋转扫射」冷却 30→25/20/15 秒（光轮转得更勤）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.laserUltCDMax = Math.max(15, 30 - 5*(p.skills.l_ult_cd||0)); } },
  { id:'l_ult_amp', hero:'laser', name:'光轮增幅', icon:'🎡', desc:'「旋转扫射」每秒伤害 +30%/级（与功率提升叠加）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.laserUltAmp = 1 + 0.3*(p.skills.l_ult_amp||0); } },
  // ===== 💣 爆破专属（主动技能「轰炸区」：🖱 左键单击 / 手柄RB 在鼠标/光标处投放）=====
  { id:'b_power', hero:'bomber', name:'强化轰炸', icon:'💥', desc:'轰炸区每发炮弹伤害+10（26→56）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.bombDmg = 26 + 10*(p.skills.b_power||0); } },
  { id:'b_area', hero:'bomber', name:'扩大轰炸', icon:'🌐', desc:'轰炸区半径+18（96→150），炮弹爆炸半径+10（88→118）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.b_area||0; p.bombZoneR = 96 + 18*lv; p.bombBlastR = 88 + 10*lv; } },
  { id:'b_cool', hero:'bomber', name:'轰炸节奏', icon:'⏱️', desc:'轰炸区冷却-1.2秒（6.0→1.8 秒）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.bombCDMax = Math.max(1.8, 6.0 - 1.2*(p.skills.b_cool||0)); } },
  { id:'b_long', hero:'bomber', name:'持久轰炸', icon:'🕐', desc:'轰炸区持续+0.9秒（3.5→6.2），落弹间隔-0.06秒（更密）', max:3,
    apply(p){ const lv = p.skills.b_long||0; p.bombDur = 3.5 + 0.9*lv; p.bombDropEvery = Math.max(0.28, 0.55 - 0.06*lv); } },
  { id:'b_stun', hero:'bomber', name:'震荡弹', icon:'💫', desc:'每发炮弹爆炸使范围内敌人眩晕 0.35/0.5/0.65 秒（Boss 免疫）', max:3,
    apply(p){ const lv = p.skills.b_stun||0; p.bombStun = lv > 0 ? 0.35 + 0.15*(lv-1) : 0; } },
  { id:'b_cluster', hero:'bomber', name:'集束弹', icon:'✳️', desc:'每发炮弹落地后额外炸出 2/3/4 发小炮弹（爆炸半径 55%、伤害 40%，随机散落）', max:3,
    apply(p){ const lv = p.skills.b_cluster||0; p.bombCluster = lv > 0 ? 1 + lv : 0; } },
  { id:'b_burn', hero:'bomber', name:'燃烧弹', icon:'🕯️', desc:'弹坑燃起火海 2.5 秒（半径=爆炸半径×0.75），每 0.5 秒烧 6/11/16；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.b_burn||0; p.bombBurn = lv > 0 ? 6 + 5*(lv-1) : 0; } },
  // ===== 🌀 龙卷风专属（近战角色：普攻 = 360° 旋风斩；主动技能「突进·龙卷风」= 🖱 左键单击 / 手柄RB）=====
  { id:'t_blade', hero:'tornado', name:'狂风斩', icon:'🗡️', desc:'旋风斩伤害+8（20→60）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  // 🌀 回旋风刃：把旋风斩从"正面 180°"一路张到"整圈 360°"（开局只有面前扇形，学满才是全向风暴）
  { id:'t_whirl', hero:'tornado', name:'回旋风刃', icon:'🔄', desc:'旋风斩张角 180°→240°→300°→360°（满级整圈都打到）', max:3,
    apply(p){ /* 无属性修改：张角在 arcFromSkills 出刀时实时读取 p.skills.t_whirl */ } },
  { id:'t_spin', hero:'tornado', name:'迅捷旋风', icon:'💨', desc:'旋风斩出刀间隔-0.05秒（0.50→0.30，最短 0.22 秒）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ recalcShootRate(p); } },
  { id:'t_power', hero:'tornado', name:'锐利风刃', icon:'🌬️', desc:'龙卷风每跳伤害+7（14→35）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.torDmg = 14 + 7*(p.skills.t_power||0); } },
  { id:'t_area', hero:'tornado', name:'扩大风眼', icon:'🌐', desc:'风眼半径+24（150→222）：吸怪与伤害范围同时变大；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.torR = 150 + 24*(p.skills.t_area||0); } },
  { id:'t_cool', hero:'tornado', name:'快速成风', icon:'⏱️', desc:'冷却-1.3秒（7.0→2.0，最短 2.0 秒）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.torCDMax = Math.max(2.0, 7.0 - 1.3*(p.skills.t_cool||0)); } },
  { id:'t_long', hero:'tornado', name:'持久风暴', icon:'🕐', desc:'吸怪持续+0.6秒（2.2→4.0），收尾击退冲量+160', max:3,
    apply(p){ const lv = p.skills.t_long||0; p.torDur = 2.2 + 0.6*lv; p.torKnock = 1000 + 160*lv; } },
  { id:'t_vortex', hero:'tornado', name:'漩涡吸力', icon:'🌀', desc:'吸力+25%/级（敌人被拉得更快，更难逃出风眼）', max:3,
    apply(p){ p.torPull = 320 * (1 + 0.25*(p.skills.t_vortex||0)); } },
  { id:'t_guard', hero:'tornado', name:'风壁护体', icon:'🛡️', desc:'吸怪期间减伤 60% → 63%/66%/69%/72%（每级 +3%）', max:4,
    apply(p){ p.torGuard = Math.min(0.72, 0.6 + 0.03*(p.skills.t_guard||0)); } },
  // ===== ⚔️ 将军专属（近战长枪 + 🖱冲刺 + 🪖征召小兵）=====
  { id:'gen_dmg', hero:'general', name:'枪锋淬刃', icon:'🗡️', desc:'突刺伤害+9（22→67）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'gen_rng', hero:'general', name:'枪出如龙', icon:'📏', desc:'突刺距离+24（118→190，枪比剑长得多）', max:3,
    apply(p){ p.slashRange = 118 + 24*(p.skills.gen_rng||0); } },
  { id:'gen_spd', hero:'general', name:'连刺', icon:'⚡', desc:'出枪间隔-0.08秒（0.5→0.26，戳得越来越快）', max:3,
    apply(p){ recalcShootRate(p); } },
  { id:'gen_arc', hero:'general', name:'横扫千军', icon:'🌀', desc:'突刺张角 100°→130°/160°（正面扫得更宽）', max:2,
    apply(p){ p.slashArc = (50 + 15*(p.skills.gen_arc||0)) * Math.PI/180; } },
  { id:'gen_cd', hero:'general', name:'疾风突进', icon:'💨', desc:'「冲刺」冷却 5→4/3/2 秒', max:3,
    apply(p){ p.genCDMax = Math.max(2, 5 - (p.skills.gen_cd||0)); } },
  { id:'gen_army', hero:'general', name:'征召令', icon:'🪖', desc:'每次征召 1→2/3/4 名小兵，存量上限 4→6/8/10；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ const lv = p.skills.gen_army||0; p.summonCount = 1 + lv; p.minionCap = 4 + 2*lv; } },
  { id:'gen_horn', hero:'general', name:'集结号', icon:'📯', desc:'征召间隔 10→8/6/4 秒（小兵来得更快）', max:3,
    apply(p){ p.summonEvery = Math.max(4, 10 - 2*(p.skills.gen_horn||0)); } },
  { id:'gen_elite', hero:'general', name:'精锐亲兵', icon:'🎖️', desc:'小兵伤害 +40%/级（等级越高的小兵涨得越多）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.minionPow = 1 + 0.4*(p.skills.gen_elite||0); } },
  // ===== 🪨 投石专属（远程 + 弹药型：普攻=拾取器贴身戳；输出靠捡石→1 秒装填→自动抛；无主动技能）=====
  { id:'s_might', hero:'stone', name:'巨石强化', icon:'💪', desc:'投石伤害 +14（黄 130→200 / 红 85→155 / 蓝 72→142）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ /* 结算时按 p.skills.s_might 实时算，见 stoneLand */ } },
  { id:'s_load', hero:'stone', name:'快速装填', icon:'⏱️', desc:'装填时间 -0.15 秒（1.0→0.25，最短 0.25 秒）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ p.stoneLoadMax = Math.max(0.25, STONE_LOAD_T - 0.15*(p.skills.s_load||0)); if(p.stoneHold) p.stoneLoad = Math.min(p.stoneLoad, p.stoneLoadMax); } },
  { id:'s_pick', hero:'stone', name:'广口拾取器', icon:'🫳', desc:'拾取半径 +8（30→62）：不用贴到石头上就能捡起来；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.stonePick = 30 + 8*(p.skills.s_pick||0); } },
  { id:'s_hold', hero:'stone', name:'石袋加固', icon:'🧱', desc:'超载自伤 50→40/30/20/10（踩到第二块时扣得更少）', max:4,
    apply(p){ /* 超载扣血在 updateStoneSkill 里按 p.skills.s_hold 实时算 */ } },
  { id:'s_splash', hero:'stone', name:'碎石飞溅', icon:'💥', desc:'落点溅射半径 +18/级（三色石通用：黄也变成小范围）', max:3,
    apply(p){ /* 溅射半径在 throwStone 里按 p.skills.s_splash 实时算 */ } },
  { id:'s_boss', hero:'stone', name:'破甲投掷', icon:'🪓', desc:'投石对 Boss 伤害 +25%/级（Boss 体型大，砸得实）', max:3,
    apply(p){ /* 对 Boss 倍率在 stoneLand 里按 p.skills.s_boss 实时算 */ } },
  { id:'s_match', hero:'stone', name:'色感敏锐', icon:'🎯', desc:'同色命中加成 ×1.6 → ×2.0/2.4/2.8（砸中同色的怪更痛）', max:3,
    apply(p){ /* 同色加成在 stoneLand 里按 p.skills.s_match 实时算 */ } },
  { id:'s_stone', hero:'stone', name:'石头增产', icon:'🧺', desc:'地图石头上限 +1/级，补石间隔 -15%/级（1~3 级：7/8/9 块，3.8/3.2/2.5 秒一块）', max:3,
    apply(p){ /* 地图是世界共享的：实际按场上最高的「石头增产」等级结算，见 stoneMapLv() */ } },
  { id:'s_slow', hero:'stone', name:'冰蓝强化', icon:'🧊', desc:'蓝石减速更强：移速 ×0.45 → ×0.38/0.31/0.24', max:3,
    apply(p){ /* 蓝石减速在 stoneLand 里按 p.skills.s_slow 实时算 */ } },
  // ===== 🧪 毒液专属（远程角色：普攻 = 自动射击；每 5 发子弹留一小滩毒液领域，无主动技能）=====
  { id:'v_power', hero:'venom', name:'剧毒', icon:'☠️', desc:'毒液领域每跳伤害+5（7→22）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.venDmg = 7 + 5*(p.skills.v_power||0); } },
  { id:'v_area', hero:'venom', name:'扩散毒圈', icon:'🌊', desc:'毒液领域半径+16（46→94）：毒伤与减速范围同时变大；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.venR = 46 + 16*(p.skills.v_area||0); } },
  { id:'v_long', hero:'venom', name:'持久毒素', icon:'⏳', desc:'毒液领域持续+0.8秒（2.6→5.0），毒液滩在地上留得更久；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.venDur = 2.6 + 0.8*(p.skills.v_long||0); } },
  { id:'v_dense', hero:'venom', name:'浓缩毒素', icon:'🔫', desc:'每 4/3/2 发子弹就留一滩毒液（原 5 发）——毒液铺得更密', max:3,
    apply(p){ const lv = p.skills.v_dense||0; p.venomEvery = lv > 0 ? Math.max(2, 5 - lv) : 5; } },
  { id:'v_sticky', hero:'venom', name:'粘稠毒液', icon:'🕸️', desc:'毒液里敌人移速 65% → 55%/45%/35%（Boss 免疫减速，但仍吃毒伤）', max:3,
    apply(p){ const lv = p.skills.v_sticky||0; p.venSlow = lv > 0 ? Math.max(0.35, 0.65 - 0.10*lv) : 0.65; } },
  { id:'v_shot', hero:'venom', name:'毒素强击', icon:'💢', desc:'子弹伤害+3（9→24，弥补直伤偏低）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  // ===== 🔮 魔法师专属（手动轮盘：🖱右键切换 🔥火球 / ❄️冰霜 / 🪨土墙）=====
  { id:'m_fire', hero:'mage', name:'烈焰精通', icon:'🔥', desc:'火球的灼烧每秒 6→10/14/18（每 0.5 秒一跳：3→5/7/9）', max:3,
    apply(p){ p.fireBurnDps = 6 + 4*(p.skills.m_fire||0); } },
  { id:'m_blast', hero:'mage', name:'爆裂法球', icon:'💥', desc:'火球爆炸半径+15、爆炸伤害+50%/级（越炸越开）；♾无尽模式无等级上限', max:3, unl:1,
    apply(p){ p.fireBlast = 1 + (p.skills.m_blast||0); } },
  { id:'m_frost', hero:'mage', name:'极寒延长', icon:'❄️', desc:'冰冻时长 3→4/5/6 秒（Boss 抗性：1.5 秒不变）', max:3,
    apply(p){ p.frostDur = 3 + (p.skills.m_frost||0); } },
  { id:'m_width', hero:'mage', name:'霜域扩张', icon:'🌀', desc:'冰冻范围半径+25（120→195）：圈更大，冻得更多', max:3,
    apply(p){ p.frostR = 120 + 25*(p.skills.m_width||0); } },
  { id:'m_shield', hero:'mage', name:'磐石护盾', icon:'🪨', desc:'土墙可挡次数 10→15/20/25（墙更耐打）', max:3,
    apply(p){ p.wallHits = 10 + 5*(p.skills.m_shield||0); } },
  { id:'m_chant', hero:'mage', name:'土墙速凝', icon:'⏳', desc:'立墙冷却 30→24/18/12 秒（墙转得更快）', max:3,
    apply(p){ p.wallCdMax = Math.max(12, 30 - 6*(p.skills.m_chant||0)); } },
  { id:'m_dmg', hero:'mage', name:'奥术强化', icon:'💢', desc:'火球直伤+3（8→23）；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcBulletDmg(p); } },
  { id:'m_spd', hero:'mage', name:'疾速咏唱', icon:'⚡', desc:'出手间隔-0.07秒（0.62→0.34）：三种魔法都放得更勤', max:4,
    apply(p){ recalcShootRate(p); } },
  // ===== ♻️ 通用（射手 / 剑士 / 激光 都能学）=====
  { id:'crit', hero:'both', name:'暴击', icon:'💢', desc:'暴击率+20%/级，暴击伤害+20%/级，暴击眩晕敌人0.5秒（满级100%几率/300%伤害）；🔆激光光束暴击只加伤不眩晕', max:5,
    apply(p){ /* 无属性修改：暴击判定在命中结算时读取 p.skills.crit 等级计算概率与伤害倍率 */ } },
  { id:'speed', hero:'both', name:'移速强化', icon:'🏃', desc:'移动速度+25/级（在各自基础速度上叠加：射手/💣爆破/🔮法师 240→340；剑士/🔆激光 250→350；🌀龙卷风 260→360；🧪毒液 245→345；⚔️将军 255→355；⚙️工程师 235→335；🪨投石 252→352；🦇吸血鬼 330→430；🐣菜鸟 205→305）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ recalcSpeed(p); } },
  { id:'maxhp', hero:'both', name:'生命上限', icon:'❤️', desc:'最大生命+30并回满；♾无尽模式无等级上限', max:5, unl:1,
    apply(p){ recalcMaxHp(p); p.hp = p.maxHp; } },
  { id:'regen', hero:'both', name:'生命回复', icon:'✨', desc:'每秒回复+1生命；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.regen += 1; } },
  { id:'magnet', hero:'both', name:'拾取距离', icon:'🧲', desc:'经验磁吸距离+50（120→320）；♾无尽模式无等级上限', max:4, unl:1,
    apply(p){ p.magnetRange = 120 + 50*(p.skills.magnet||0); } },
  { id:'shield', hero:'both', name:'环绕护盾', icon:'🛡️', desc:'增加1个护盾（绕身旋转，击退敌人并挡下弹幕，最多3个）；🗡剑士：护盾化为旋转剑轮——碰到敌人即斩（斩击的 65%，每 0.4 秒一轮、不击退）', max:3,
    apply(p){ p.shield += 1; Achieve.checkShield(p); } },
  { id:'vision', hero:'both', name:'视野扩大', icon:'👁️', desc:'视野扩大15%/级：全场敌人/玩家/Boss/经验/弹幕等比例缩小；范围伤害（爆炸/闪电链距/岩浆柱/火焰/黑洞/粘液水洼）、子弹与激光判定也等比缩小，最多3级', max:3,
    apply(p){ /* 无属性修改：纯渲染层等比缩放，draw 阶段读取 skills.vision，命中判定不受影响 */ } },
];
// 🗡 技能池按角色分家：射手只抽远程技能、剑士只抽近战技能，两边共用通用技能
function heroKind(p){ // 角色判定：🗡melee=剑士 / 🔆laser=激光 / 💣bomber=爆破 / 🌀tornado=龙卷风 / 🧪venom=毒液 / ⚔️general=将军 / 🦇vampire=吸血鬼 / 🔮mage=魔法师 / gunner=射手（默认）
  if(!p) return 'gunner';
  if(p.isTornado) return 'tornado'; // 🌀 龙卷风也是近战（melee=true），判定要排在 melee 之前
  if(p.isGeneral) return 'general'; // ⚔️ 将军也是近战（melee=true，长枪），同样排在 melee 之前
  if(p.isVampire) return 'vampire'; // 🦇 吸血鬼也是近战（melee=true，利爪），同样排在 melee 之前
  if(p.isStone) return 'stone'; // 🪨 投石：远程（普攻是拾取器戳击 + 自动投石），不吃近战那套
  if(p.isRookie) return 'rookie'; // 🐣 新手也是近战（melee=true，木棍），判定同样要排在 melee 之前
  if(p.isEngineer) return 'engineer'; // ⚙️ 工程师也是近战（melee=true，扳手），同样排在 melee 之前
  if(p.isBoomerang) return 'boomerang'; // 🪃 回旋镖：远程（普攻是扔出去会飞回来的镖），不吃近战那套
  if(p.isDogmilk) return 'dogmilk'; // 🐶 野生狗奶：近战（短刀 + 奶住敌人），判定排在 melee 之前（与 heroKind 同序）
  if(p.isCardmaster) return 'cardmaster'; // 🃏 卡牌大师：远程（抽牌扇出），判定排在 gunner 之前（与 heroKind 同序）
  if(p.isKetchup) return 'ketchup'; // 🍅 番茄酱之神：控场系（普攻捏爆番茄酱铺酱潭，主动技吃酱回血；判定排在 melee 之前）
  if(p.isKnight) return 'knight'; // 🛡 骑士：重甲坦克剑士（高伤低频前摇 + 举盾 + 勇士冲锋；判定排在 melee 之前）
  if(p.isBard) return 'bard'; // 🎻 吟游诗人：远程（穿透音波 + 团队治疗，判定排在 melee 之前）
  if(p.isSpring) return 'spring'; // 🥊 弹簧：近战蓄力拳（普攻手动蓄力弹飞、主动技钩索牵引，判定排在 melee 之前）
  if(p.melee) return 'melee';
  if(p.isLaser) return 'laser';
  if(p.isBomber) return 'bomber';
  if(p.isVenom) return 'venom'; // 🧪 毒液：远程（普攻是子弹）
  if(p.isMage) return 'mage'; // 🔮 魔法师：远程（普攻是手动切换的法术：火球/冰霜/土墙）
  return 'gunner';
}
// 💣 爆破 / 🧪 毒液 的技能池 = 各自专属池 + 射手远程池（普攻都是子弹，所以远程技能全都吃）+ 通用
// 🌀 龙卷风是近战，不吃射手远程池：专属池 + 通用（通用里的环绕护盾在近战手上会变成旋转剑轮）
function skillsFor(p){
  const k = heroKind(p);
  // ultOnly：某些技能只强化特定角色的主动技（如「环形弹幕」只有射手有）——
  // 爆破/毒液虽然共用射手远程池，但不能吃到别人大招的升级（否则会出现"强化自己没有的技能"的废选项）
  // 🦇 吸血鬼：自己的利爪池（含血月突袭升级线）+ 通用 —— 不吃剑士池（斩灭是剑士的主动技）
  if(k === 'vampire') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'vampire');
  if(k === 'dogmilk') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'dogmilk'); // 🐶 野生狗奶：专属池 + 通用（不吃剑士近战池）
  if(k === 'cardmaster') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'cardmaster'); // 🃏 卡牌大师：专属池 + 通用（不吃射手远程池，普攻是抽牌）
  if(k === 'ketchup') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'ketchup'); // 🍅 番茄酱之神：专属池 + 通用（普攻捏酱，不吃近战/远程共用池）
  if(k === 'knight') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'knight'); // 🛡 骑士：专属池 + 通用（不吃剑士近战池——斩灭是剑士的主动技）
  if(k === 'spring') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'spring'); // 🥊 弹簧：专属池 + 通用（拳是手动蓄力的，不吃剑士近战池）
  if(k === 'bard') return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === 'bard'); // 🎻 吟游诗人：专属池 + 通用（不吃射手远程池——她的输出是全场最低的）
  if(k === 'bomber' || k === 'venom' || k === 'mage') return ALL_SKILLS.filter(s => (s.hero === 'both' || s.hero === 'gunner' || s.hero === k) && (!s.ultOnly || s.ultOnly === k)); // 🔮 魔法师同样吃射手远程池（普攻也是远程）
  return ALL_SKILLS.filter(s => s.hero === 'both' || s.hero === k);
}
// ♾ 无尽模式：标记了 unl:1 的「可无限成长」技能取消等级上限（数值都是线性加法，不会溢出）
//   结构性封顶的技能不在此列：回旋斩（满级整圈）、铁壁（60% 减伤上限）、环绕护盾（最多3个）、
//   视野扩大（最多3级）、多重射击/分光棱镜（弹道数量，防爆屏）、追踪弹（>1 级无额外收益）
function skillMaxLv(s){ return (s.unl && G.endlessOn) ? Infinity : s.max; }
const skillUnlockedInEndless = s => !!(s.unl && G.endlessOn); // 供升级卡片显示「∞」标记
function skillById(id){ return ALL_SKILLS.find(s => s.id === id); } // 技能 id 全局唯一 → 直接查表即为该角色版本

// ===== ACHIEVEMENTS (成就系统，可在设置中开关) =====
const ACHIEVEMENTS = [
  { id:'wave5',   icon:'🌱', name:'小试牛刀',   desc:'到达第 5 波' },
  { id:'boss1',   icon:'🌑', name:'暗影终结者', desc:'击败暗影领主' },
  { id:'boss2',   icon:'🌋', name:'熔岩克星',   desc:'击败熔岩巨兽' },
  { id:'boss3',   icon:'🌀', name:'虚空征服者', desc:'击败虚空主宰' },
  { id:'boss4',   icon:'🔷', name:'棱光破解者', desc:'击败棱光穹主（♾无尽模式）' },
  { id:'boss5',   icon:'⚔️', name:'斩铁破军',   desc:'击败斩铁剑皇（♾无尽模式）' },
  { id:'win',     icon:'👑', name:'通关大师',   desc:'击败全部 Boss 获得胜利' },
  { id:'kill100', icon:'⚔️', name:'初露锋芒',   desc:'累计击杀 100 个敌人' },
  { id:'kill500', icon:'💀', name:'割草机器',   desc:'累计击杀 500 个敌人' },
  { id:'lv10',    icon:'📈', name:'等级压制',   desc:'单局达到 10 级' },
  { id:'lv16',    icon:'🌟', name:'满级大佬',   desc:'单局达到 16 级' },
  { id:'shield3', icon:'🛡️', name:'绝对防御',   desc:'学满 3 个环绕护盾' },
];
const Achieve = {
  on:true, unlocked:{}, _queue:[], _showing:false,
  load(){
    try{ const s = gameStore.getItem('wb_ach'); if(s) this.unlocked = JSON.parse(s) || {}; }catch(e){}
    try{ this.on = gameStore.getItem('wb_ach_on') !== '0'; }catch(e){}
  },
  save(){ try{ gameStore.setItem('wb_ach', JSON.stringify(this.unlocked)); }catch(e){} },
  setOn(v){ this.on = !!v; try{ gameStore.setItem('wb_ach_on', v ? '1' : '0'); }catch(e){} },
  unlock(id){
    if(!this.on || this.unlocked[id]) return;
    const a = ACHIEVEMENTS.find(x => x.id === id); if(!a) return;
    this.unlocked[id] = Date.now();
    this.save();
    this._queue.push(a); this._next();
  },
  _next(){ // 成就解锁弹窗：右下角 toast 逐条展示（2.8s/条）
    if(this._showing || this._queue.length === 0) return;
    const a = this._queue.shift(); this._showing = true;
    let el = document.getElementById('ach-toast');
    if(!el){ el = document.createElement('div'); el.id = 'ach-toast'; document.body.appendChild(el); }
    el.innerHTML = `🏆 成就解锁：<b>${a.name}</b>（${a.desc}）`;
    el.style.display = 'block'; el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; this._showing = false; this._next(); }, 400);
    }, 2800);
  },
  // ---- 事件检查钩子 ----
  checkWave(n){ if(n >= 5) this.unlock('wave5'); },
  checkBossDie(num){ this.unlock('boss' + num); },
  checkKill(){
    if((G.kills||0) >= 100) this.unlock('kill100');
    if((G.kills||0) >= 500) this.unlock('kill500');
    // 🧟 尸潮连杀：每次击杀叠 1 层并续 2.5s（全击杀出口都经过这里：Enemy.die / 粘液 / Boss 覆写）
    if(G.horde){
      G.combo = (G.combo||0) + 1; G.comboT = HORDE_COMBO_T;
      if(G.combo > (G.comboBest||0)) G.comboBest = G.combo;
    }
  },
  checkLevel(lv){ if(lv >= 10) this.unlock('lv10'); if(lv >= 16) this.unlock('lv16'); },
  checkShield(p){ if((p.shield||0) >= 3) this.unlock('shield3'); },
  checkWin(){ this.unlock('win'); },
};
Achieve.load();

function triggerLevelUp(p){
  p = p || G.players[0] || G.player;
  if(p.dead) return; // 阵亡玩家不参与升级结算（经验/等级保留，复活后继续用）
  SND.levelUp();
  if(pCM(p).madness || G.horde){ // 挑战减益「精神错乱」/ 🧟 尸潮（无技能卡）：无法自选，升级者随机习得一个可用技能，不弹面板不暂停（双人按个人因子）
    const available = skillsFor(p).filter(s => (p.skills[s.id]||0) < skillMaxLv(s)); // 剑士只随机到近战技能（♾无尽：可无限成长的技能没有上限）
    let learned = '（已全部满级）';
    if(available.length > 0){
      const sk = available[Math.floor(Math.random()*available.length)];
      p.skills[sk.id] = (p.skills[sk.id]||0) + 1;
      sk.apply(p);
      learned = sk.icon + ' ' + sk.name;
    }
    updateSkillBar();
    try { // 右下角小提示（不进成就队列）
      let el = document.getElementById('madness-toast');
      if(!el){ el = document.createElement('div'); el.id = 'madness-toast'; document.body.appendChild(el); }
      el.innerHTML = G.horde
        ? `🧟 尸潮 · 自动习得 <b>${learned}</b>`
        : (G.coop
            ? `🌀 精神错乱：${seatLabel(p)} 随机习得一个技能`
            : '🌀 精神错乱：随机习得一个技能');
      el.style.display = 'block'; el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 400); }, 2200);
    } catch(e){}
    return;
  }
  // 升级面板队列（按玩家各自经验触发）：同帧都升时 1P 优先；1P 鼠标点、2P 手柄光标点（5 号键确认）
  if(!G.lvQueue) G.lvQueue = [];
  G.lvQueue.push(multiOn() ? G.players.indexOf(p) : 0);
  if(G.state !== 'levelup') openNextLevelPanel();
}
function showFakeToast(){ // 🎭 挑战减益「骗人」：选完才揭穿 —— 文字提示就一句「骗人！！」
  try {
    let el = document.getElementById('fake-toast');
    if(!el){ el = document.createElement('div'); el.id = 'fake-toast'; document.body.appendChild(el); }
    el.textContent = '🎭 骗人！！';
    el.style.display = 'block'; el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 400); }, 1600);
  } catch(e){}
}
function openNextLevelPanel(){ // 弹出队列中下一位玩家的升级面板（1P 优先）
  const staleRr = document.getElementById('lv-reroll');
  if(staleRr && staleRr.remove) staleRr.remove(); // 清掉上一次面板遗留的刷新按钮
  if(!G.lvQueue || !G.lvQueue.length){
    document.getElementById('levelup').style.display = 'none';
    G.state = 'playing';
    refreshTouchControls(); // 升级队列清空 → 回到战斗，重新启用摇杆
    return;
  }
  let who;
  const i0 = G.lvQueue.indexOf(0);
  if(multiOn() && i0 > -1) who = G.lvQueue.splice(i0, 1)[0]; // 同帧都升：1P 先弹
  else who = G.lvQueue.shift();
  const p = G.players[who] || G.player;
  if(p.dead){ return openNextLevelPanel(); } // 阵亡玩家跳过，轮到下一位
  G.state = 'levelup';
  const panel = document.getElementById('levelup');
  const title = document.getElementById('lv-title');
  if(title){ // 👥 标题按座位写对（此前只有 1P/2P 两种分支，三人模式 3P 升级会错写成「1P 升级！」）
    const nm = isAIPlayer(p) ? seatLabel(p) + '(AI)' : seatLabel(p);
    title.textContent = (G.coop && who > 0) ? `🎮 ${nm} 升级！（1P 鼠标代点）` : (G.coop ? '1P 升级！' : '升级！选择一项强化');
  }
  panel.style.display = 'block';
  refreshTouchControls(); // 升级面板打开 → 隐藏摇杆，确保升级选项可点（不压键）
  const choicesDiv = document.getElementById('choices');
  // 🎲 挑战增益「重选机会」：本次选择可刷新一次候选（每次弹面板各给 1 次）
  let rerolled = false;
  const renderChoices = () => {
    choicesDiv.innerHTML = '';
    // pick 3 random skills (not maxed)：按该玩家角色取可用技能池（剑士=近战技能，射手=远程技能）
    const available = skillsFor(p).filter(s => (p.skills[s.id]||0) < skillMaxLv(s));
    const picked = [];
    while(picked.length < 3 && available.length > 0){
      const idx = Math.floor(Math.random()*available.length);
      picked.push(available.splice(idx,1)[0]);
    }
    // 🎭 「骗人」：从这 3 张（不足 3 张就几张算几张）里随机挑 1 张当假卡 —— 每级必出一张
    const fakeIdx = picked.length ? Math.floor(Math.random() * picked.length) : -1;
    picked.forEach((sk, ci) => {
      const fakeLv = (p.fakeLv && p.fakeLv[sk.id]) || 0;
      const cur = (p.skills[sk.id] || 0) + fakeLv; // 🎭 显示等级 = 真等级 + 假等级（玩家看到的那个数）
      // 🎭 挑战减益「骗人」（用户 2026-10-07 定稿）：不是概率受骗，而是**这 3 张里必有 1 张是假的**
      //    —— 假的是哪张随机定，卡面完全看不出来（选完才揭穿「骗人！！」）
      const isFake = !!pCM(p).fake && ci === fakeIdx;
      const div = document.createElement('div');
      div.className = 'choice';
      div.innerHTML = `<div class="c-icon">${sk.icon}</div>
        <div class="c-info"><div class="c-name">${sk.name}</div>
        <div class="c-desc">${sk.desc}</div></div>
        <div class="c-tag">${cur>0 ? 'Lv.'+cur+' → Lv.'+(cur+1) : '新技能!'}${skillUnlockedInEndless(sk) ? ' ♾' : ''}</div>`;
      div.onclick = () => {
        if(isFake){
          // 🎭 假技能：等级照涨（只涨"显示"的那一级），数值一点都不变 —— 白选一次
          p.fakeLv = p.fakeLv || {};
          p.fakeLv[sk.id] = (p.fakeLv[sk.id] || 0) + 1;
          showFakeToast();
        } else {
          p.skills[sk.id] = (p.skills[sk.id]||0) + 1;
          sk.apply(p);
        }
        updateSkillBar();
        openNextLevelPanel(); // 队列还有就继续弹，否则收面板恢复游戏
      };
      choicesDiv.appendChild(div);
    });
  };
  renderChoices();
  if(pCM(p).reroll){
    const btn = document.createElement('button');
    btn.id = 'lv-reroll';
    btn.textContent = '🎲 刷新候选（还剩 1 次）';
    btn.onclick = () => {
      if(rerolled) return;
      rerolled = true;
      btn.disabled = true;
      btn.textContent = '🎲 已刷新';
      renderChoices();
    };
    panel.appendChild(btn);
  }
}

function updateFactorHUD(){ // 顶部按钮行只放双人专属因子（全队生效，1 枚）；个人因子挂在各玩家技能栏尾部
  const bar = document.getElementById('game-btns');
  if(!bar || !bar.querySelectorAll) return; // 沙盒测试环境的元素 mock 无 DOM 方法时跳过
  bar.querySelectorAll('.ch-fact').forEach(e => e.remove());
  const c = G.cmod;
  if(!c || !c.isCoop) return; // 单人因子在 1P 技能栏里，不占顶部
  const isBuff = m => CH_BUFFS.includes(m) || CH_COOP_BUFFS.includes(m);
  const tag = cmSeats(c).length > 2 ? '三人' : '双人'; // 👥 按本局人数标注（双人/三人）
  for(const m of c.team.mods){
    const d = document.createElement('div');
    d.className = 'ch-fact ' + (isBuff(m) ? 'ch-buff' : 'ch-debuff');
    d.title = '【' + tag + '·全队生效】' + m.name + '：' + m.desc;
    d.innerHTML = m.icon;
    bar.insertBefore(d, bar.firstChild);
  }
}
function playerFactorMods(p){ // 该玩家的个人挑战因子（双人各取各的 3 条，单人取全局 3 条）
  const c = G.cmod;
  if(!c) return [];
  if(c.isCoop) return ((c['p' + (seatIndex(p) + 1)]) || c.p1).mods; // 👥 按座位取个人因子（双人=2 份，三人=3 份）
  return c.mods;
}
function updateSkillBar(){
  const render = (p) => {
    let html = '';
    const pool = skillsFor(p); // 只显示本角色可用的技能（剑士栏不出现远程技能）
    // 🎭 骗人因子：显示等级要算上"假等级"（真等级没变，但玩家看到的数字确实涨了）
    const ids = Object.keys(p.skills || {});
    for(const fid in (p.fakeLv || {})) if(ids.indexOf(fid) < 0) ids.push(fid);
    for(const id of ids){
      const sk = pool.find(s=>s.id===id);
      if(!sk) continue;
      const lv = (p.skills[id] || 0) + ((p.fakeLv && p.fakeLv[id]) || 0);
      html += `<div class="skill-icon" title="${sk.name}: Lv.${lv}">
        <span style="font-size:20px">${sk.icon}</span>
        <span class="skill-name">${sk.name}</span>
        <span class="skill-lv">${lv}</span></div>`;
    }
    // 个人挑战因子挂在技能栏尾部（绿框增益 / 红框减益）
    for(const m of playerFactorMods(p)){
      const isBuff = CH_BUFFS.includes(m) || CH_COOP_BUFFS.includes(m);
      html += `<div class="skill-icon ${isBuff ? 'ch-buff' : 'ch-debuff'}" title="${m.name}：${modDesc(m, G.cmod && G.cmod.isCoop)}">
        <span style="font-size:20px">${m.icon}</span>
        <span class="skill-name">${m.name}</span></div>`;
    }
    return html;
  };
  document.getElementById('skill-bar').innerHTML = render(G.players[0] || G.player);
  // 双人：2P 技能栏（右下角，与 1P 齐平）；技能+因子太多两栏撞在一起时，2P 栏连同文字提示整体上移一格
  const bar2 = document.getElementById('skill-bar2');
  if(bar2){
    bar2.style.display = (multiOn()) ? 'flex' : 'none';
    bar2.innerHTML = G.coop && G.players[1] ? render(G.players[1]) : '';
    if(multiOn()){
      const n1 = Object.keys((G.players[0] || G.player).skills || {}).length;
      const n2 = Object.keys((G.players[1] || { skills:{} }).skills || {}).length;
      const f1 = playerFactorMods(G.players[0] || G.player).length;
      const f2 = playerFactorMods(G.players[1]).length;
      // 估算宽度：每个图标约 52px（44 宽 + 8 间距），左右各留 20px 边距 + 40px 缓冲
      const overlap = (n1 + f1 + n2 + f2) * 52 + 80 > W;
      bar2.style.bottom = overlap ? '76px' : '12px';
      const l2 = document.getElementById('skill-label2');
      if(l2) l2.style.bottom = overlap ? '128px' : '64px';
    }
  }
  // 👥 三人：3P 技能栏（居中第二行，绿色标注）—— 显隐与内容用内联样式，避免与 coop 布局 CSS 打架
  const bar3 = document.getElementById('skill-bar3');
  const q3 = (G.players || [])[2];
  const on3 = !!(G.coop && q3);
  if(bar3){
    bar3.style.display = on3 ? 'flex' : 'none';
    bar3.innerHTML = on3 ? render(q3) : '';
  }
  const l3 = document.getElementById('skill-label3');
  if(l3) l3.style.display = on3 ? 'block' : 'none';
}

// === PART 3: GAME LOOP, COLLISIONS, UI, INPUT ===

// ===== INPUT =====
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if(KEYBINDS.listen){ // 按键设置：等待绑定输入（按任意键绑定，ESC 取消）
    if(k === 'escape') KEYBINDS.cancelListen();
    else KEYBINDS.applyBind('k:' + k);
    e.preventDefault();
    return;
  }
  G.keys[k] = true;
  if(k === 'm' && !e.repeat){ SND.toggle(); updateSoundBtn(); }
  // 空格不再绑技能（主动技能统一改为鼠标左键单击），但对局中仍吃掉默认行为：防页面滚动 / 误触已聚焦的按钮
  if(k === ' ' && G.state === 'playing' && !e.repeat) e.preventDefault();
});
addEventListener('keyup', e => { G.keys[e.key.toLowerCase()] = false; });
// 窗口失焦 / 切标签页时清空按键状态：否则「按住方向键时 alt-tab」会丢掉 keyup，
// 回来后方向键永远卡在按下状态 —— 表现就是玩家自己不受控制地往一个方向走
addEventListener('blur', () => { G.keys = {}; G.mouseDown = false; }); // 🖱 失焦同时松开鼠标（别让冲刺键卡住）
if(typeof document !== 'undefined' && document.addEventListener){
  document.addEventListener('visibilitychange', () => { if(document.hidden) { G.keys = {}; G.mouseDown = false; } });
}
// 🖱 瞄准跟踪挂在 window 上而不是 canvas（2026-10-08 修）：HUD 覆盖层（boss 血条 / 技能栏 /
//    波次信息 / 联机角标 / 右上按钮组）会吃掉指针事件，挂在 canvas 上的话鼠标一掠过去 mousemove
//    就断流 —— 表现就是「瞄准方向冻在上一次的位置，鼠标怎么动都不跟手」。
//    挂 window 后任何 DOM 覆盖层都拦不住瞄准（坐标换算 clientX-画布rect 与原来完全一致）。
addEventListener('mousemove', e => {
  const r = cvs.getBoundingClientRect();
  G.mouse.x = e.clientX - r.left;
  G.mouse.y = e.clientY - r.top;
});
// 🖱 左键单击：累计次数（冲刺按次数消费）+ 按住状态（窗口级 mouseup 兜底，避免画布外松手卡住）
cvs.addEventListener('mousedown', e => {
  if(e.button === 0){
    // 🎯 按下瞬间同步校正鼠标坐标：mousemove 在主线程忙（怪多/弹幕多）时会排队，
    //    只靠它更新的话「按下」读到的可能是几百毫秒前的位置 —— 落点就会滞后。
    //    点击事件自带准确坐标，直接拿它覆盖（后续更晚的 mousemove 会照常更新，不会倒退）。
    const r = cvs.getBoundingClientRect();
    G.mouse.x = e.clientX - r.left;
    G.mouse.y = e.clientY - r.top;
    G.mouseDown = true; G.mouseClicks = (G.mouseClicks||0) + 1;
  }
});
addEventListener('mouseup', e => { if(e.button === 0) G.mouseDown = false; });
// 🖱 右键单击：🔮 魔法师「法术轮盘」切换（🔥 → ❄️ → 🪨 → 🔥）
//     挂 window（与瞄准同口径：任何 DOM 覆盖层都拦不住）；只在 G.state==='playing' 记账 ——
//     菜单/升级面板里点右键不会积压到开局，避免"一进游戏法术自己跳一格"。
addEventListener('mousedown', e => {
  if(e.button !== 2) return;
  if(G.state !== 'playing') return;
  G.mouseRClicks = (G.mouseRClicks||0) + 1;
});
// 🚫 屏蔽浏览器右键菜单：不拦的话每次切法术都会弹「另存为 / 检查」，还会卡住瞄准
addEventListener('contextmenu', e => e.preventDefault());

// ===== COLLISION =====
function updateBurns(dt){ // 灼烧弹 DoT：每 0.5 秒结算一跳（击杀归属按点燃者的子弹归属算，双人吸血兼容）
  G.enemies.forEach(e => {
    if(e.dead || e.isBullet || !(e.burnT > 0)) return;
    e.burnT -= dt;
    if(e.burnT <= 0) e.burnStacks = 0; // 烧完清层（下次命中从1层重新叠）
    e.burnTick += dt;
    if(e.burnTick >= 0.5){
      e.burnTick -= 0.5;
      e.lastHitIdx = (e.burnIdx !== undefined) ? e.burnIdx : 0;
      e.takeDamage(Math.max(1, Math.round(e.burnDps * 0.5)), '#f80', false, e.burnIdx); // 灼烧来源=点火者（近战烈焰斩 / 远程灼烧弹都按点火者算）
      if(!e.dead) e.flash = 0.12; // 烧一下闪一下（橙闪由伤害数字表现）
    }
  });
}
function updateDogDots(dt){ // 🐶 野生狗奶「奶住」DOT：每 0.5 秒结算一跳（秒伤 10 = 每跳 10，dps×0.5）
  G.enemies.forEach(e => {
    if(e.dead || e.isBullet || !(e.dogDotT > 0)) return;
    e.dogDotT -= dt;
    e.dogDotTick += dt;
    if(e.dogDotTick >= 0.5){
      e.dogDotTick -= 0.5;
      e.lastHitIdx = (e.dogDotIdx !== undefined) ? e.dogDotIdx : 0;
      e.takeDamage(Math.max(1, Math.round(e.dogDotDps * 0.5)), '#9ef04a', false, e.dogDotIdx); // 每 0.5s 10 点
      if(!e.dead) e.flash = 0.12;
    }
  });
}
function resolveEntityOverlaps(){ // 碰撞分离：怪与怪不重合（boss质量大基本不挪）；玩家推开远程/无近战伤害怪（近战怪与boss由各自接触规则处理）
  const solids = G.enemies.filter(e => !e.isBullet && !e.dead && !e.dying);
  // ⚙️ 炮台碰撞体积（2026-10-08 用户要求）：炮台是"死物"（质量无穷）—— 谁也别想和它重叠。
  //    怪被顶在底座圈外（贴着炮台绕行），玩家同样被顶开；Boss 例外：它比炮台重得多，直接从上面碾过去。
  if(G.turrets && G.turrets.length){
    const cands = (multiOn()) ? G.players.filter(q => q && !q.dead) : (G.player && !G.player.dead ? [G.player] : []);
    for(const t of G.turrets){
      if(t.life <= 0) continue;
      for(const e of solids){
        if(e.isBoss) continue; // Boss 无视炮台（与"玩家推不动 Boss"同一条质量口径）
        let dx = e.x - t.x, dy = e.y - t.y;
        let d = Math.hypot(dx, dy);
        const min = ENG_TURRET_R + e.r;
        if(d >= min) continue;
        if(d < 0.001){ dx = 1; dy = 0; d = 1; } // 正好立在怪脚心：给个确定方向顶出去
        e.x = t.x + dx/d*min; e.y = t.y + dy/d*min;
      }
      for(const Q of cands){
        let dx = Q.x - t.x, dy = Q.y - t.y;
        let d = Math.hypot(dx, dy);
        const min = ENG_TURRET_R + Q.r;
        if(d >= min) continue;
        if(d < 0.001){ dx = 1; dy = 0; d = 1; }
        Q.x = t.x + dx/d*min; Q.y = t.y + dy/d*min;
        Q.x = clamp(Q.x, Q.r, WW()-Q.r); Q.y = clamp(Q.y, Q.r, WH()-Q.r);
      }
    }
  }
  for(let i=0;i<solids.length;i++){
    const A = solids[i];
    // 玩家推开远程怪/无近战伤害怪（不管有没有近战伤害的远程怪都适用；boss与近战怪不被玩家推动）
    // ⚙️ 战车例外（用户定：**可以推着除 Boss 外的任何怪走**）—— 近战怪照推，整只顶到车体边缘
    if(!A.isBoss){
      const cands = (multiOn()) ? G.players.filter(q => !q.dead) : (G.player && !G.player.dead ? [G.player] : []);
      for(const Q of cands){
        if(!Q) continue;
        if(!Q.veh && !(A.isRanged || !(A.dmg > 0))) continue; // 普通角色仍只推"远程/不咬人"的怪
        const dx = A.x-Q.x, dy = A.y-Q.y;
        const min = A.r + Q.r, d = Math.hypot(dx,dy);
        if(d >= min) continue;
        const nx = d > 0.001 ? dx/d : 1, ny = d > 0.001 ? dy/d : 0; // 完全重合（正好叠在车心）：给个确定方向顶出去
        A.x = Q.x + nx*min; A.y = Q.y + ny*min; // 怪让位：被玩家推到边缘
      }
    }
    for(let j=i+1;j<solids.length;j++){
      const B = solids[j];
      const dx = B.x-A.x, dy = B.y-A.y;
      const min = A.r+B.r, d = Math.hypot(dx,dy);
      if(d >= min || d < 0.001) continue;
      const nx = dx/d, ny = dy/d, ov = min-d;
      const wa = A.isBoss ? 0.15 : 1, wb = B.isBoss ? 0.15 : 1; // boss质量大：被推移15%，小怪让位
      const tw = wa + wb;
      A.x -= nx*ov*(wa/tw); A.y -= ny*ov*(wa/tw);
      B.x += nx*ov*(wb/tw); B.y += ny*ov*(wb/tw);
    }
    // ⚠️ 分离只是"微调"，不能把人推出场地（2026-10-06 巡检抓到，补齐小兵早就有的那一钳）：
    //    怪自己的 update 里已经钳过界，但这一趟是**在它之后**才跑的 → 被互推、或被玩家推到
    //    场地边上的怪会探出边缘几个像素（实测小怪之怒挤在角落时溢出 ~3px，看着像半个身子
    //    进了墙/边框）。小兵段末尾本来就有这一钳，敌人段漏了，这里补上保持一致。
    A.x = clamp(A.x, A.r, WW()-A.r);
    A.y = clamp(A.y, A.r, WH()-A.r);
  }
  // 🪖 将军小兵碰撞箱：小兵之间对半让位不堆叠；嵌进怪身体时小兵让位（推到 92% 边缘——
  //    留一线重叠，保证仇恨中的怪贴身判定 `d < r+r` 仍然成立，能咬到小兵）
  if(G.minions && G.minions.length){
    const ms = G.minions.filter(m => !m.dead);
    for(let i=0;i<ms.length;i++){
      const M = ms[i];
      for(let j=i+1;j<ms.length;j++){
        const N = ms[j];
        let dx = N.x-M.x, dy = N.y-M.y;
        let d = Math.hypot(dx,dy);
        if(d < 1e-6){ dx = 1; dy = 0; d = 1e-6; } // 完全重合（同点召唤/被挤成一堆）：给个确定方向推开，别原地叠着
        const min = M.r+N.r;
        if(d < min){
          const nx = dx/d, ny = dy/d, ov = (min-d)/2;
          M.x -= nx*ov; M.y -= ny*ov;
          N.x += nx*ov; N.y += ny*ov;
        }
      }
      for(const e of solids){
        let dx = M.x-e.x, dy = M.y-e.y;
        let d = Math.hypot(dx,dy);
        if(d < 1e-6){ dx = -1; dy = 0; d = 1e-6; }
        const min = (M.r+e.r)*0.92;
        if(d < min){
          M.x = e.x + dx/d*min; M.y = e.y + dy/d*min; // 小兵让位：被挤到怪身边
        }
      }
      M.x = clamp(M.x, M.r, WW()-M.r);
      M.y = clamp(M.y, M.r, WH()-M.r);
    }
  }
}
function visionZoom(){ // 👁️视野扩大：每级视野+15%（世界等比缩小0.15），取所有存活玩家最高等级
  let lv = 0;
  (multiOn() ? G.players : [G.player]).forEach(p => { if(p && !p.dead && p.skills) lv = Math.max(lv, p.skills.vision || 0); });
  return 1 - 0.15*lv;
}
function mouseWorld(){ // 鼠标屏幕坐标 → 世界坐标（视野缩放时修正 1P 瞄准）
  const z = visionZoom();
  if(G.viewMode === 'follow' && G.player){ // 👁️ 跟随视角：屏幕中心=镜头锚点，需减回镜头偏移
    const c = camFocus();
    return { x: (G.mouse.x - W/2)/z + c.x, y: (G.mouse.y - H/2)/z + c.y };
  }
  return { x: G.mouse.x/z, y: G.mouse.y/z }; // 正常视角：左上角锚定（世界=屏幕÷缩放）
}
function WW(){ return W / visionZoom(); } // 👁️视野扩大：扩大后的世界宽度（移动/刷怪/弹幕边界同步扩大）
function WH(){ return H / visionZoom(); } // 👁️视野扩大：扩大后的世界高度
function camFocus(){ // 👁️ 跟随视角：镜头锚点 = 存活玩家；多人取存活者中点（pvp 也能都看见）
  const arr = (multiOn() || G.pvp) ? G.players : [G.player];
  const alive = arr.filter(p => p && !p.dead);
  const use = alive.length ? alive : []; // 👈 全灭/无存活 → 回退到世界中心（不追死人）
  if(!use.length) return { x: WW()/2, y: WH()/2 };
  if(use.length === 1) return use[0];
  let x = 0, y = 0; use.forEach(p => { x += p.x; y += p.y; });
  return { x: x/use.length, y: y/use.length };
}
function drawArenaWalls(){ // 👁️ 跟随视角：在竞技场边界画一圈可视化墙壁（红色实心 + 内缘描边），玩家被钳制在墙内
  const ww = WW(), wh = WH(), t = 18;
  ctx.save();
  ctx.fillStyle = 'rgba(255,82,82,0.55)';
  ctx.fillRect(-t, -t, ww + 2*t, t);   // 上
  ctx.fillRect(-t, wh, ww + 2*t, t);    // 下
  ctx.fillRect(-t, 0, t, wh);           // 左
  ctx.fillRect(ww, 0, t, wh);           // 右
  ctx.strokeStyle = '#ff8a8a'; ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, ww, wh);
  ctx.restore();
}
function drawBurnFx(){ // 灼烧特效：燃烧敌人身上火苗抖动 + 上飘火星（简洁不伤眼，无实体新增）
  G.enemies.forEach(e => {
    if(e.dead || e.isBullet || !(e.burnT > 0)) return;
    const r = e.r;
    const flick = Math.random(); // 每帧火苗抖动
    // 两簇小火苗（橙+黄，高低随机错落；贴在身体上半部，避免像耳朵）
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#f80';
    ctx.beginPath(); ctx.arc(e.x - r*0.35 + (Math.random()-0.5)*3, e.y - r*0.45 - flick*4, r*0.3 + flick*2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fd4';
    ctx.beginPath(); ctx.arc(e.x + r*0.3 + (Math.random()-0.5)*3, e.y - r*0.4 - (1-flick)*4, r*0.22, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // 火星：概率生成一粒上飘渐隐的小火星
    if(Math.random() < 0.12){
      G.particles.push({ x: e.x + (Math.random()-0.5)*r, y: e.y - r*0.6, vx: (Math.random()-0.5)*20, vy: -60 - Math.random()*50, life: 0.5, max: 0.5, color: '#fa4', r: 2 });
    }
  });
}
function handleCollisions(){
  // bullets vs enemies
  G.bullets.forEach(b => {
    if(b.dead) return;
    G.enemies.forEach(e => {
      if(e.dead || e.isBullet || e.invincible) return; // invincible: 冲撞中无敌，子弹穿过
      if(b.hits.has(e)) return;
      if(dist(b, e) < b.r + e.r){ // 命中判定=绘制世界半径（屏幕上看着重叠即命中；不再乘视野缩放，否则判定比视觉小）
        // 暴击判定：基础0%几率/200%伤害，每级+20%几率&+20%伤害（满级100%几率/300%伤害）
        // 用 critLv/5 代替 0.2*critLv，避免浮点误差（0.2*3=0.6000...1，3/5=0.6 精确）
        // 双人：暴击等级取自子弹归属玩家（射出时已记录）
        let dmg = b.dmg, crit = false;
        const critLv = (b.critLv !== undefined) ? b.critLv : (G.player.skills.crit || 0);
        if(b.instakill){ // 🃏 卡牌大师·王炸：命中即秒杀（无视血量，含 Boss）
          dmg = 1e9;
        } else if(critLv > 0 && Math.random() < critLv / 5){
          dmg = Math.round(b.dmg * (2.0 + critLv / 5));
          crit = true;
        }
        e.takeDamage(dmg, crit ? '#f60' : '#ff0', crit, b.ownerIdx, true); // 第5参=true=子弹伤害（🌿 荆棘傀据此反弹）
        e.lastHitIdx = b.ownerIdx; // 记录击杀归属（双人吸血结算用）
        // 灼烧弹：点燃敌人（3秒持续掉血；每次命中+1层，层数上限=等级层；每层每0.5秒烧4×等级）
        const ownerP = G.players[b.ownerIdx] || G.player;
        const burnLv = (ownerP && ownerP.skills.burn) || 0;
        if(burnLv > 0 && !e.dead){ e.burnT = 3; e.burnStacks = Math.min((e.burnStacks||0) + 1, burnLv); e.burnDps = 4*burnLv*e.burnStacks; e.burnTick = 0; e.burnIdx = b.ownerIdx; }
        // 连锁闪电：首次命中后闪电弹向附近敌人（每跳60%伤害，弹跳次数=等级；每次命中只触发一次）
        const chainLv = (ownerP && ownerP.skills.chain) || 0;
        if(chainLv > 0 && !b.chained){
          b.chained = true;
          b.hits.add(e); // 本体先计入已命中，防止闪电弹回起点
          let from = e;
          for(let hop = 0; hop < chainLv; hop++){
            // 弹跳链距随等级增长：170/220/270（每级+50）；并随视野扩大等比缩小（范围伤害同步缩放）
            let next = null, nd = (120 + 50*chainLv) * visionZoom();
            G.enemies.forEach(t => {
              if(t.dead || t.isBullet || t.invincible || b.hits.has(t) || t === from) return;
              const d2 = dist(from, t);
              if(d2 < nd){ nd = d2; next = t; }
            });
            if(!next) break;
            next.takeDamage(Math.max(1, Math.round(b.dmg * 0.6)), '#8ef', false, b.ownerIdx);
            next.lastHitIdx = b.ownerIdx;
            G.effects.push({ type:'zap', x1:from.x, y1:from.y, x2:next.x, y2:next.y, life:0.15, max:0.15 });
            b.hits.add(next);
            from = next;
          }
        }
        // 🔥 魔法师火球：命中即点燃（与「灼烧弹」同一套着火系统；固定 1 层，不走层数叠加）
        if(b.fireBurn && !e.dead){
          e.burnT = b.fireBurn.t;
          e.burnStacks = 1;
          e.burnDps = b.fireBurn.dps;
          e.burnTick = 0;
          e.burnIdx = b.ownerIdx;
        }
        // 🍅 番茄酱包：命中敌人 → 严重减速（Boss 免疫减速，照常吃伤害）+ 当场爆出一滩大酱潭（扔中必爆）
        if(b.ketchupPack && !e.dead){
          if(!e.isBoss){ e.venomSlowUntil = G.time + b.ketchupPack.slowT; e.venomSlowMul = b.ketchupPack.slow; }
          spawnKetchupPool(clamp(e.x, 24, WW()-24), clamp(e.y, 24, WH()-24), b.ketchupPack.pool, b.ownerIdx);
          b.ketDropped = true; // 命中已铺潭，防止出界兜底重复铺（理论上命中即死，双保险）
        }
        SND.hit();
        if(crit) SND.crit();
        b.hits.add(e);
        // 🃏 卡牌大师·手牌效果：炸（每条牌命中附带爆炸）/ 对子·两对·三条（命中后这只怪被电，闪电在怪与怪之间弹，每手仅一次）
        //   ⚠️ 王炸牌无视 !e.dead：命中即炸（秒杀也要炸）——否则「命中即秒杀」会把爆炸条件永远挡掉
        if(b.cmBomb && (b.cmRoyal || !e.dead)){
          if(b.cmRoyal){ // 🃏 王炸：大范围秒杀爆炸（范围内一切连同 Boss 一起归零）
            spawnExplosion(e.x, e.y, 260, 1e9, b.ownerIdx);
          } else {
            spawnExplosion(e.x, e.y, 80, Math.max(1, Math.round(b.dmg * 0.5)), b.ownerIdx);
          }
        }
        if(b.cmPair){
          const _op = G.players[b.ownerIdx] || G.player;
          if(_op && !_op.cmPairZapped){
            _op.cmPairZapped = true;
            // 起点 = 被这张牌命中的怪（e），闪电从它身上弹向最近的其他怪（怪↔怪链式跳跃）
            cmChainZap(e.x, e.y, b.ownerIdx, Math.max(1, Math.round(b.dmg)), e);
          }
        }
        // explosive (only on first hit)
        if(b.explosive > 0 && !b.exploded){
          b.exploded = true;
          spawnExplosion(b.x, b.y, 40 + b.explosive*15, b.dmg*0.5*b.explosive, b.ownerIdx); // 爆炸弹=远程来源
        }
        // 🧪 毒液弹：命中即在落点铺一小滩毒液领域（普通子弹没有这个方法 → typeof 兜底，单元测试的假子弹对象也安全）
        if(typeof b.dropVenom === 'function') b.dropVenom();
        if(b.cmRoyal){ /* 🃏 王炸牌：无限穿透——不消耗穿透次数、命中后不消失，一路穿到底 */ }
        else if(b.pierce > 0){
          b.pierce--;
        } else {
          b.dead = true;
        }
      }
    });
  });
  // ⚔️ 对战模式：玩家子弹同样能打到对手玩家（同一套命中口径，伤害走 PVP 折算）
  if(G.pvp && G.state === 'playing'){ // 结算/胜利动画后战斗已冻结，不再继续命中判定
    G.bullets.forEach(b => {
      if(b.dead) return;
      const seat = b.ownerIdx || 0;
      for(const q of G.players){
        if(!q || q.dead || q.seat === seat) continue;
        if(b.hits.has(q)) continue;
        if(dist(b, q) >= b.r + q.r) continue;
        b.hits.add(q);
        q.takeDamage(Math.max(1, Math.round(b.dmg * PVP_DMG_MUL)), b); // src=子弹本体：让 🛡 骑士举盾挡得下对手的子弹
        spawnParticles(q.x, q.y, '#ff6b6b', 4);
        // 爆炸弹/火球在对手身上炸开（爆炸本身也会经 spawnExplosion 二次结算给对手，正常）
        if(b.explosive > 0 && !b.exploded){
          b.exploded = true;
          spawnExplosion(b.x, b.y, 40 + b.explosive*15, b.dmg*0.5*b.explosive, seat);
        }
        if(typeof b.dropVenom === 'function') b.dropVenom(); // 🧪 毒液弹：打到对手也铺毒圈
        // 🍅 番茄酱包：砸中对手 → 当场在他脚下爆一滩大酱潭（扔中必爆；潭随后会烧他；减速只对怪生效，玩家不走这套）
        if(b.ketchupPack){
          spawnKetchupPool(clamp(q.x, 24, WW()-24), clamp(q.y, 24, WH()-24), b.ketchupPack.pool, seat);
          b.ketDropped = true;
        }
        if(b.cmRoyal){ /* 🃏 王炸牌：穿透对手玩家也不消失 */ }
        else if(b.pierce > 0) b.pierce--; else b.dead = true;
      }
    });
  }
}

// ===== UI UPDATE =====
function updateUI(){
  const p = G.players[0] || G.player;
  document.body.classList.toggle('coop', !!G.coop); // 多人布局开关
  document.body.classList.toggle('trio', !!(G.coop && G.players && G.players.length >= 3)); // 👥 三人专属布局（3P HUD/技能栏）
  // HP bar（1P，左上）—— 统一 0~100% 钳制：血量绝不显示负数（暴击过量/致死瞬间）
  // ⚙️ 战车期间：这条血条改显示**战车装甲**（本体血量被锁在车里，不显示也不掉血）
  const p1dead = G.coop && p.dead;
  const p1veh = (!p1dead && p.veh) ? p.veh : null;
  document.getElementById('hp-bar').style.width = p1dead ? '0%'
    : clamp((p1veh ? p1veh.hp / p1veh.maxHp : p.hp/p.maxHp)*100, 0, 100)+'%';
  document.getElementById('hp-text').innerHTML = (G.coop ? '<b style="color:#8cf">1P</b> ' : '')
    + (p1dead ? '阵亡' : (p1veh ? '🚜 战车装甲 ' + Math.max(0, Math.ceil(p1veh.hp)) + ' / ' + p1veh.maxHp
                                 : Math.max(0, Math.ceil(p.hp))+' / '+p.maxHp));
  // XP bar / 等级（1P，左上；双人时等级也显示在左上）
  document.getElementById('xp-bar').style.width = (p.xp/p.xpNext*100)+'%';
  document.getElementById('level-info').textContent = 'Lv.'+p.lv;
  document.getElementById('level1-info').textContent = 'Lv.'+p.lv;
  // 👥 2P/3P 信息块（右上角，仅多人显示）：血条+经验条+等级
  //    3P 块挂在 2P 块正下方（#p3-hud 由 CSS 定位），用同一套元素 id 规则：hp2/hp3、xp2/xp3、level2/level3
  for(let st = 1; st <= 2; st++){
    const hudEl = document.getElementById('p' + (st + 1) + '-hud');
    if(!hudEl) continue;
    const q = G.players[st];
    hudEl.style.display = (G.coop && q) ? 'flex' : 'none';
    if(!(G.coop && q)) continue;
    const d = q.dead;
    const qv = (!d && q.veh) ? q.veh : null; // ⚙️ 战车期间：血条改显示车体装甲（与 1P 同口径）
    const barEl = document.getElementById('hp' + (st + 1) + '-bar');
    const txtEl = document.getElementById('hp' + (st + 1) + '-text');
    if(barEl) barEl.style.width = d ? '0%' : clamp((qv ? qv.hp/qv.maxHp : q.hp/q.maxHp)*100, 0, 100)+'%';
    if(txtEl) txtEl.innerHTML = `<b style="color:${SEAT_TXT_COLOR[st]}">${seatLabel(q)}${isAIPlayer(q) ? '(AI)' : ''}</b> `
      + (d ? '阵亡' : (qv ? '🚜 ' + Math.max(0, Math.ceil(qv.hp)) + ' / ' + qv.maxHp
                            : Math.max(0, Math.ceil(q.hp))+' / '+q.maxHp));
    const xpEl = document.getElementById('xp' + (st + 1) + '-bar');
    if(xpEl) xpEl.style.width = (q.xp/q.xpNext*100)+'%';
    const lvEl = document.getElementById('level' + (st + 1) + '-info');
    if(lvEl) lvEl.textContent = 'Lv.'+q.lv;
    // ⚖️ AI 让经验：AI 累计经验领先时不捡宝石，HUD 上标出来（让玩家知道它是故意的，不是发呆）
    const yieldEl = document.getElementById('p' + (st + 1) + '-yield');
    if(yieldEl) yieldEl.style.display = (isAIPlayer(q) && aiYielding(q)) ? 'block' : 'none';
  }
  // Timer
  const m = Math.floor(G.time/60), s = Math.floor(G.time%60);
  document.getElementById('timer-info').textContent =
    String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  // 🧟 尸潮 HUD：连杀数 + 连杀加伤 + 精英波提示（只在尸潮局显示）
  const hordeEl = document.getElementById('horde-info');
  if(hordeEl){
    if(G.horde){
      const cb = Math.min(HORDE_COMBO_MAX, G.combo * HORDE_COMBO_STEP);
      const pct = Math.round(cb * 100);
      hordeEl.innerHTML = (G.wave % 10 === 0 ? '<span class="horde-elite">🧟 精英尸潮！</span> ' : '')
        + (G.combo >= 2
            ? '连杀 <span class="horde-combo">×' + G.combo + '</span> · 伤害 +' + pct + '%'
            : '击杀怪物叠连杀 · 每层伤害 +' + Math.round(HORDE_COMBO_STEP*100) + '%');
    } else if(hordeEl.style.display !== 'none'){
      hordeEl.style.display = 'none';
    }
  }
  // Boss bar（双Boss：虚空主宰优先显示；若已死但小怪之怒存活则显示小怪之怒血条）
  let bb = null;
  if(G.inBossWave && G.boss && !G.boss.dead) bb = G.boss;
  else if(G.inBossWave && G.wrathBoss && !G.wrathBoss.dead) bb = G.wrathBoss;
  if(bb){
    document.getElementById('boss-bar-wrap').style.display = 'block';
    document.getElementById('boss-bar').style.width = clamp(bb.hp/bb.maxHp*100, 0, 100)+'%'; // 钳制：暴击致死瞬间不留负宽度（负宽度是非法 CSS，会让血条卡住不动）
    // 🛡 护盾条：有盾才显示（斩铁剑皇）；名字后面补个盾标记，让"打本体前先破盾"一目了然
    const shieldBg = document.getElementById('boss-bar-shield-bg');
    if(shieldBg){
      const sh = bb.shieldHp || 0;
      if(sh > 0 && bb.shieldMax){
        shieldBg.style.display = 'block';
        document.getElementById('boss-bar-shield').style.width = clamp(sh/bb.shieldMax*100, 0, 100)+'%';
      } else shieldBg.style.display = 'none';
    }
    document.getElementById('boss-name').textContent = bb.name + ((bb.shieldHp || 0) > 0 ? ' 🛡' : '');
    const bwrap = document.getElementById('boss-bar-wrap');
    bwrap.style.transform = bb.critShake > 0
      ? `translateX(calc(-50% + ${(Math.random()-0.5)*10}px))`
      : 'translateX(-50%)';
  } else if(G.inBossWave){
    document.getElementById('boss-bar-wrap').style.display = 'none';
  }
  // 🌌 世界2 资源条（魔力=蓝 / 体力=橙）：仅 world2 + 有资源的英雄显示；其余（世界1 / 无资源英雄）隐藏
  const resEls = ['res-bar','res2-bar','res3-bar'];
  const resSeats = [G.players[0], G.players[1], G.players[2]];
  resEls.forEach((id, i) => {
    const el = document.getElementById(id);
    if(!el) return;
    const q = resSeats[i];
    if(q && q.resType){
      el.className = 'res-bar ' + q.resType; // 切蓝/橙配色
      el.style.display = 'block';
      const inner = el.firstElementChild;
      if(inner) inner.style.width = (q.resFrac()*100)+'%';
    } else {
      el.style.display = 'none';
    }
  });
}

// ===== EFFECTS UPDATE (逻辑更新，不含绘制) =====
function updateEffects(dt){
  updateFloaters(dt); // 🔢 伤害数字：每帧必跑（升起→落回→淡出移除）；原先误放在 drawVehicleSites 里，无战车时整段 return 导致数字不动不消失
  G.effects.forEach(ef => {
    ef.life -= dt;
    if(ef.type === 'laser'){
      // laser: 警告期(前60%)结束后发射并结算伤害
      const t = 1 - ef.life/ef.max;
      if(t >= 0.6 && !ef.done){
        ef.done = true;
        ef.fireLife = 0.1; // 发射后粗激光的显示时长
        const T = targetOf(ef); // 双人：锁定最近存活玩家（瞄准方向），但光路上所有玩家都结算
        const a = angleTo({x:ef.x,y:ef.y}, T);
        const dx = Math.cos(a), dy = Math.sin(a);
        // 双人：光路上所有存活玩家逐个结算（盾球挡得住就挡）
        const cands = bossHitTargets();
        for(const Q of cands){
          if(!Q) continue;
          const qDist = dist({x:ef.x,y:ef.y}, Q);
          const onBeam = (Q === T) || rayCircleHit(ef.x, ef.y, dx, dy, Q.x, Q.y, Q.r + 6*visionZoom()) !== null; // 👁️激光判定宽度等比缩小
          if(!onBeam) continue;
          let blocked = false, shPos = null;
          if(Q.shield > 0){
            for(let i=0;i<Q.shield;i++){
              const sa = Q.shieldAngle + i*(Math.PI*2/Q.shield);
              const shx = Q.x + Math.cos(sa)*45;
              const shy = Q.y + Math.sin(sa)*45;
              const t2 = rayCircleHit(ef.x, ef.y, dx, dy, shx, shy, 16 + 6*visionZoom()); // 16盾球+6激光半径（👁️激光部分等比缩小）
              if(t2 !== null && t2 < qDist){ blocked = true; shPos = {x:shx,y:shy}; break; }
            }
          }
          if(blocked){
            // 护盾球挡住Boss激光：不受伤，盾球处白闪+音效+粒子
            SND.shieldBlock();
            Q.shieldFlash = 0.3;
            spawnParticles(shPos.x, shPos.y, '#8ff', 14);
          } else {
            Q.takeDamage(ef.dmg, G.boss);
            G.screenShake = 12;
          }
        }
      }
    } else if(ef.type === 'meteor'){
      // 熔岩火雨：0.7s 预警圈 → 爆炸（一次范围伤害，走玩家 takeDamage 正常无敌帧/结算）
      const t = 1 - ef.life/ef.max;
      if(t >= 0.7 && !ef.boomed){
        ef.boomed = true;
        SND.magma(); // 爆炸轰鸣
        spawnParticles(ef.x, ef.y, '#f80', 14);
        const cands = bossHitTargets();
        for(const Q of cands){
          if(!Q) continue;
          if(dist(Q, ef) < ef.r + Q.r) Q.takeDamage(ef.dmg, G.boss);
        }
      }
    } else if(ef.type === 'magma'){
      // Z字型岩浆柱：预警0.5s（虚线预告路径）→ 沿预计算折线缓慢延伸，不可被盾抵挡；玩家被烧到 DPS 50（绕过无敌帧）
      if(ef.state === 'warn'){
        ef.warnT -= dt;
        if(ef.warnT <= 0){ ef.state = 'active'; SND.magma(); } // 预警结束，喷发
      } else {
        for(const b of ef.beams){
          b.len = Math.min(b.totalLen, b.len + ef.extendSpeed*dt); // 沿折线延伸
          // 计算当前可见段（折线中已延伸的部分）
          const visSegs = [];
          let acc = 0;
          for(let s=0;s<b.pts.length-1;s++){
            if(acc >= b.len) break;
            const sl = b.segLens[s];
            const remain = b.len - acc;
            const t = Math.min(1, remain/sl);
            visSegs.push({
              x1:b.pts[s].x, y1:b.pts[s].y,
              x2:b.pts[s].x+(b.pts[s+1].x-b.pts[s].x)*t,
              y2:b.pts[s].y+(b.pts[s+1].y-b.pts[s].y)*t,
            });
            acc += sl;
          }
          b.visSegs = visSegs; // 岩浆无视护盾：不截断
          // 玩家碰撞：检测可见段是否碰到任一存活玩家（双人全检查）
          const cands = bossHitTargets();
          for(const P of cands){
            if(!P) continue;
            let hit = false;
            for(const vs of visSegs){
              if(segCircleHit(vs.x1,vs.y1,vs.x2,vs.y2, P.x, P.y, P.r + 14*visionZoom())){ // 玩家世界半径 + 岩浆柱世界半宽（与绘制一致）
                hit = true; break;
              }
            }
            if(hit && !vampBlocked(P, G.boss)){
              P.hp -= ef.dmg * dt;
              P.dotFlash = 0.15;
              if(P.hp <= 0){ P.hp = 0; if(G.coop) coopPlayerDie(P); else gameOver(); }
            }
          }
        }
      }
    } else if(ef.type === 'flameSpray'){
      // 火焰喷射：预警0.8s（角度锁定+危险区提示）→ 缓慢延伸+追踪玩家，近端DPS高远端低，不可被盾抵挡
      if(ef.state === 'warn'){
        ef.warnT -= dt;
        if(ef.warnT <= 0){ ef.state = 'active'; SND.flame(); } // 预警结束，开始喷射
      } else {
        const T = targetOf(ef); // 双人：锁定最近存活玩家（追踪目标），但锥形内所有玩家都受伤
        const targetA = angleTo({x:ef.x,y:ef.y}, T);
        let diff = Math.atan2(Math.sin(targetA-ef.aim), Math.cos(targetA-ef.aim));
        ef.aim += clamp(diff, -ef.followRate*dt, ef.followRate*dt);
        ef.extLen = Math.min(ef.range, ef.extLen + ef.extendSpeed*dt); // 缓慢延伸
        // 锥形内所有存活玩家结算（火焰无视护盾：直接按距离结算伤害）
        const cands = bossHitTargets();
        for(const Q of cands){
          if(!Q) continue;
          const pa = angleTo({x:ef.x,y:ef.y}, Q);
          const aDiff = Math.abs(Math.atan2(Math.sin(pa-ef.aim), Math.cos(pa-ef.aim)));
          const pd = dist({x:ef.x,y:ef.y}, Q);
          if(aDiff < ef.halfAngle && pd < ef.extLen && !vampBlocked(Q, G.boss)){
            const t = Math.pow(clamp(pd / ef.range, 0, 1), 1.6);
            const dps = ef.dpsNear + (ef.dpsFar - ef.dpsNear) * t;
            Q.hp -= dps * dt;
            Q.dotFlash = 0.15;
            if(Q.hp <= 0){ Q.hp = 0; if(G.coop) coopPlayerDie(Q); else gameOver(); }
          }
        }
      }
    } else if(ef.type === 'web'){
      // 🕸️ 蛛网：踩上去被黏住减速（不冻结、不掉血）；**敌人踩到也一样被黏** → 自伤型阵地
      //   减速用「减速到这个绝对时间为止」判定：每帧刷新，走出网自动恢复
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(dist(ef, e) > ef.r + e.r) continue;
        if(!e.isBoss){ e.webSlowUntil = G.time + 0.3; e.webSlowMul = ef.slow; } // Boss 免疫（体型大，容易被控死）
      }
      for(const Q of bossHitTargets()){
        if(!Q) continue;
        if(dist(ef, Q) > ef.r + Q.r) continue;
        Q.webSlowUntil = G.time + 0.3; Q.webSlowMul = ef.slow; // 玩家被黏住（主要威胁）
      }
    } else if(ef.type === 'vine'){
      // 🌿 腐藤怪留下的藤痕：纯减速（不冻结、不掉血），敌我双方都吃 —— 与蛛网同口径，只是长得不一样
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(dist(ef, e) > ef.r + e.r) continue;
        if(!e.isBoss){ e.webSlowUntil = G.time + 0.3; e.webSlowMul = ef.slow; } // Boss 免疫（同上）
      }
      for(const Q of bossHitTargets()){
        if(!Q) continue;
        if(dist(ef, Q) > ef.r + Q.r) continue;
        Q.webSlowUntil = G.time + 0.3; Q.webSlowMul = ef.slow;
      }
    } else if(ef.type === 'sporeArc'){
      // 🌿 孢囊妖的飞孢：抛物线飞向落点，到点化成一团孢子云（持续掉血 + 降攻速）
      ef.t += dt;
      const k = Math.min(1, ef.t / ef.dur);
      ef.x = ef.sx + (ef.tx - ef.sx) * k;
      ef.y = ef.sy + (ef.ty - ef.sy) * k - Math.sin(k * Math.PI) * 90; // 拱形抛物线
      if(ef.t >= ef.dur){
        ef.type = 'spore';
        ef.r = 62; ef.life = 4.5; ef.max = 4.5; ef.dmg = 9; ef.tick = 0.6; ef.next = 0.2; ef.rgb = '150,190,80';
      }
    } else if(ef.type === 'spore'){
      // 🌿 孢子云：每 tick 对站在里面的玩家掉血 + 降攻速（复用腐蚀区的攻速削弱口径）
      //   ⚠️ life 已由 updateEffects 顶部统一递减，这里只跑 tick，别重复扣（否则云会提前消失）
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        for(const Q of bossHitTargets()){
          if(!Q) continue;
          if(dist(ef, Q) > ef.r + Q.r) continue;
          Q.takeDamage(ef.dmg, G.boss);
          Q.corrodeAtkSlowUntil = G.time + 0.6;
        }
      }
    } else if(ef.type === 'root'){
      // 🌿 缠根妖的根须：黏住减速 + 周期性小伤害（不冻结——减速 55% 仍走得动，不会卡死）
      //   ⚠️ life 由 updateEffects 顶部统一递减，这里只跑 tick
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        for(const Q of bossHitTargets()){
          if(!Q) continue;
          if(dist(ef, Q) > ef.r + Q.r) continue;
          Q.takeDamage(ef.dmg, G.boss);
        }
      }
      for(const e of G.enemies){
        if(e.dead || e.dying || e.isBullet || e.invincible) continue;
        if(dist(ef, e) > ef.r + e.r) continue;
        if(!e.isBoss){ e.webSlowUntil = G.time + 0.3; e.webSlowMul = ef.slow; } // 根须无差别：敌人踩到也被黏
      }
      for(const Q of bossHitTargets()){
        if(!Q) continue;
        if(dist(ef, Q) > ef.r + Q.r) continue;
        Q.webSlowUntil = G.time + 0.3; Q.webSlowMul = ef.slow;
      }
    } else if(ef.type === 'tendrilBeam'){
      // 🌿 蚀光藤眼的藤光射线：预警期只描线不伤人，开火后逐帧结算持续伤害
      if(ef.warn > 0){ ef.warn -= dt; }
      else {
        ef.t -= dt;
        const dx = Math.cos(ef.a), dy = Math.sin(ef.a);
        for(const Q of bossHitTargets()){
          if(!Q) continue;
          const px = Q.x - ef.x, py = Q.y - ef.y;
          const proj = px*dx + py*dy;
          if(proj < 0 || proj > ef.len) continue;
          if(Math.abs(px*dy - py*dx) > ef.w + Q.r) continue;
          Q.takeDamage(ef.dmg * dt, G.boss);
        }
        if(ef.t <= 0) ef.life = 0;
      }
    } else if(ef.type === 'firepool'){
      // 🔥 燃烧弹留下的火海：每 tick 秒对范围内敌人结算一次灼烧（半径已在生成时按视野缩放换算成世界值）
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        for(const e of G.enemies){
          if(e.dead || e.dying || e.isBullet || e.invincible) continue;
          if(dist(ef, e) > ef.r + e.r) continue;
          e.takeDamage(ef.dmg, '#f80', false, ef.seat); // 🔥 火海=爆破（远程来源）
          e.lastHitIdx = ef.seat; // 击杀归属：投放者
        }
        pvpHitPlayers(ef.seat, ef.x, ef.y, ef.r, ef.dmg, '#f80'); // ⚔️ 对战：火海同样烧到对手
      }
    } else if(ef.type === 'venompool'){
      // 🧪 毒液领域：每 tick 秒对圈内敌人结算一次毒伤，并把它们减速（减速每跳刷新，走出圈自动恢复）
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        for(const e of G.enemies){
          if(e.dead || e.dying || e.isBullet || e.invincible) continue;
          if(dist(ef, e) > ef.r + e.r) continue;
          e.takeDamage(ef.dmg, '#9ef04a', false, ef.seat); // 🧪 毒液=远程来源（远程角色打剑皇的盾只算 50%）
          e.lastHitIdx = ef.seat; // 击杀归属：射出毒液弹的人
          if(ef.slow > 0 && ef.slow < 1 && !e.isBoss){ // 🕸️ 减速：Boss 免疫（体型大，容易被毒圈控死）
            e.venomSlowUntil = G.time + ef.tick + 0.25; e.venomSlowMul = ef.slow;
          }
        }
        pvpHitPlayers(ef.seat, ef.x, ef.y, ef.r, ef.dmg, '#9ef04a'); // ⚔️ 对战：站在对手毒圈里也掉血
      }

    } else if(ef.type === 'ketchupdrop'){ // 🍅 飞酱滴：直线飞出，飞行倒计时归零即落地 → 化成一滩小酱潭（随后被统一回收）
      ef.x += ef.vx*dt; ef.y += ef.vy*dt;
      if(ef.life <= 0){
        // 落点钳进场地（酱不抹到界外去）；落潭参数=出手时定格的那份（专属技能加成照常生效）
        spawnKetchupPool(clamp(ef.x, 24, WW()-24), clamp(ef.y, 24, WH()-24),
          { r:ef.r, dur:ef.dur, tick:KET_TICK, dmg:ef.dmg, slow:ef.slow }, ef.seat);
      }
    } else if(ef.type === 'ketchuppool'){
      // 🍅 番茄酱潭：每 tick 秒对圈内敌人结算一次酱伤 + 严重减速（减速每跳刷新，走出酱潭自动恢复）
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        for(const e of G.enemies){
          if(e.dead || e.dying || e.isBullet || e.invincible) continue;
          if(dist(ef, e) > ef.r + e.r) continue;
          e.takeDamage(ef.dmg, '#e6293a', false, ef.seat); // 🍅 远程来源（酱是抹在远处地面的，同毒液口径）
          e.lastHitIdx = ef.seat; // 击杀归属：捏爆那包酱的人
          if(ef.slow > 0 && ef.slow < 1 && !e.isBoss){ // 🅰️ 减速：Boss 免疫（体型大，容易被一滩酱控死——与毒液领域同口径）
            e.venomSlowUntil = G.time + ef.tick + 0.25; e.venomSlowMul = ef.slow;
          }
        }
        pvpHitPlayers(ef.seat, ef.x, ef.y, ef.r, ef.dmg, '#e6293a'); // ⚔️ 对战：站在对手的酱潭里也掉血
        if(G.boss && !G.boss.dead && !G.boss.dying && dist(ef, G.boss) <= ef.r + G.boss.r){ // 👑 Boss：免疫减速，但照常吃酱伤（毒液潭不扫 Boss；番茄酱之神要能磨 Boss）
          G.boss.takeDamage(ef.dmg, '#e6293a', false, ef.seat);
        }
      }
    } else if(ef.type === 'corrode'){ // 🌌 腐蚀毒潭：每 tick 对站在里面的玩家结算一次毒伤（不伤敌人）
      ef.next -= dt;
      if(ef.next <= 0){
        ef.next = ef.tick;
        const cands = bossHitTargets();
        for(const Q of cands){
          if(Q && dist(ef, Q) < ef.r + Q.r){
            Q.takeDamage(ef.dmg, G.boss);
            Q.corrodeAtkSlowUntil = G.time + 0.6; // 🌌 腐蚀区：踩上去降低攻速（见玩家 shootCD）
          }
        }
      }
    } else if(ef.type === 'drainbeam'){ // 🌌 虚空裂界者·虚空射线：沿光束路径造成伤害 + 吸取资源
      if(ef.warn > 0){ ef.warn -= dt; } // 预警期：只显示细瞄准线，不结算伤害（给玩家反应/走位时间，不再"莫名其妙必中"）
      else {
      const cands = bossHitTargets();
      for(const Q of cands){
        if(!Q) continue;
        const dx = Math.cos(ef.a), dy = Math.sin(ef.a);
        const px = Q.x - ef.x, py = Q.y - ef.y;
        const proj = px*dx + py*dy;
        if(proj < 0 || proj > ef.len) continue;
        const perp = Math.abs(px*dy - py*dx);
        if(perp > ef.w + Q.r) continue;
        Q.takeDamage(ef.dmg * dt, G.boss);
        if(Q.resType === 'mana') Q.mana = Math.max(0, Q.mana - (ef.drain||30)*dt);
        else if(Q.resType === 'stamina') Q.stamina = Math.max(0, Q.stamina - (ef.drain||30)*dt);
      }
      }
    } else if(ef.type === 'voidpulse'){ // 🌌 裂光十字·汲取脉冲：圆形冲击波，范围内掉血 + 抽资源
      ef.life -= dt;
      ef.tick -= dt;
      const cands = bossHitTargets();
      for(const Q of cands){
        if(!Q) continue;
        if(dist(Q, ef) > ef.r + Q.r) continue;
        if(ef.tick <= 0) Q.takeDamage(ef.dmg, G.boss);
        if(Q.resType === 'mana') Q.mana = Math.max(0, Q.mana - (ef.drain||0)*dt);
        else if(Q.resType === 'stamina') Q.stamina = Math.max(0, Q.stamina - (ef.drain||0)*dt);
      }
      if(ef.tick <= 0) ef.tick = 0.4;
    } else if(ef.type === 'voidpull'){ // 🌌 内爆吸力（向心吸力场）：把玩家往环心拽 + 周期掉血
      ef.life -= dt;
      ef.next -= dt;
      const hit = ef.next <= 0;
      if(hit) ef.next = ef.tick;
      const cands = bossHitTargets();
      for(const Q of cands){
        if(!Q) continue;
        const d = dist(Q, ef);
        if(d > ef.r) continue;
        const a = Math.atan2(ef.y - Q.y, ef.x - Q.x);
        const k = 1 - d / ef.r; // 越靠近环心吸得越猛
        Q.x = clamp(Q.x + Math.cos(a)*(ef.pull||200)*(0.35+0.65*k)*dt, Q.r, WW()-Q.r);
        Q.y = clamp(Q.y + Math.sin(a)*(ef.pull||200)*(0.35+0.65*k)*dt, Q.r, WH()-Q.r);
        if(hit) Q.takeDamage(ef.dmg, G.boss);
      }
    } else if(ef.type === 'blackhole'){
      // ===== 黑洞：全屏范围吸引玩家与玩家弹幕，护盾无效（双人：吸引并伤害所有存活玩家）=====
      const bhx = ef.x, bhy = ef.y, bhr = ef.r;
      const cands = bossHitTargets();
      for(const P of cands){
        if(!P) continue;
        // 1) 吸引玩家：向心力（随距离衰减但全屏生效），玩家反向移动可逃离（净速度>0）
        const pd = dist(P, ef);
        if(pd > 1){
          const pa = Math.atan2(bhy - P.y, bhx - P.x);
          const pull = 150 * clamp(pd/600, 0.35, 1); // 引力 52.5~150 px/s < 玩家移速240
          P.x += Math.cos(pa) * pull * dt;
          P.y += Math.sin(pa) * pull * dt;
          P.x = clamp(P.x, P.r, WW()-P.r); // 👁️视野扩大：钳制边界随世界扩大
          P.y = clamp(P.y, P.r, WH()-P.r);
        }
        // 2) 玩家碰到黑洞主体：持续受伤（DPS 40），护盾挡不了
        if(pd < bhr + P.r && !vampBlocked(P, G.boss)){
          P.hp -= 40 * dt;
          P.dotFlash = 0.15;
          if(P.hp <= 0){ P.hp = 0; if(G.coop) coopPlayerDie(P); else gameOver(); }
        }
      }
      // 3) 吸引玩家弹幕：环绕黑洞螺旋内收（切向环绕 + 越近收得越快，与吸积盘同向旋转），被吸引后失去伤害，碰到主体消失
      for(const b of G.bullets){
        if(b.dead) continue;
        const bx = bhx - b.x, by = bhy - b.y;   // 指向黑洞中心的向量
        const bd = Math.hypot(bx, by) || 1;
        const nx = bx/bd, ny = by/bd;            // 径向单位向量（向内）
        const tx = ny, ty = -nx;                 // 切向单位向量（角度增大方向＝吸积盘旋转方向）
        const spd = Math.min(Math.hypot(b.vx, b.vy) + 260*dt, 620); // 加速但有上限，避免越转越快飞出去
        // 内收比例：远处几乎纯环绕（多转两圈才慢慢靠近），贴近时才猛烈卷入
        const inward = 0.10 + 0.55 * clamp(1 - bd/600, 0, 1);
        const dx2 = tx + nx*inward, dy2 = ty + ny*inward;
        const dl = Math.hypot(dx2, dy2) || 1;
        b.vx = dx2/dl*spd; b.vy = dy2/dl*spd;
        b.dmg = 0; // 被吸引后失去伤害
        b.homing = 0; // 被捕获后不再追踪敌人（否则追踪会跟环绕拉扯）
        b.holed = true; // 标记：绘制变暗提示已被捕获（拖尾转紫）
        if(bd < bhr + b.r) b.dead = true; // 碰到黑洞主体消失
      }
    }
    if(ef.fireLife > 0) ef.fireLife -= dt;
  });
  G.effects = G.effects.filter(ef => ef.life > 0);
}

// 💣 轰炸区绘制（地面层，与 updateBombZones 同参数：边界圈 + 落点预警收缩圈）
function drawBombZones(){
  if(!G.bombZones || !G.bombZones.length) return;
  ctx.save();
  for(const z of G.bombZones){
    const fade = Math.min(1, z.life / 0.5); // 最后 0.5 秒淡出
    ctx.fillStyle = `rgba(255,170,60,${0.07*fade})`;
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = `rgba(255,190,80,${(0.55 + 0.25*Math.sin(G.time*6))*fade})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 9]);
    ctx.beginPath(); ctx.arc(z.x, z.y, z.r, G.time*0.6, G.time*0.6 + Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    for(const b of z.bombs){ // 落点预警：外圈随时间收缩到中心（缩到最小即落地）
      const k = 1 - Math.max(0, b.t) / (b.max || 1);
      ctx.strokeStyle = `rgba(255,120,40,${0.55 + 0.45*k})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(b.x, b.y, 10 + 26*(1-k), 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = `rgba(255,200,90,${0.25 + 0.35*k})`;
      ctx.beginPath(); ctx.arc(b.x, b.y, 3 + 3*k, 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.restore();
}
// ⚙️ 工程师炮台绘制（地面层：底座 + 转塔 + 准星炮管 + 剩余寿命环）
function drawTurrets(){
  if(!G.turrets || !G.turrets.length) return;
  ctx.save();
  for(const t of G.turrets){
    const fade = Math.min(1, t.life / 0.7);   // 最后 0.7 秒淡出（寿命告警）
    const R = ENG_TURRET_R;
    ctx.globalAlpha = fade;
    // 地面阴影
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.beginPath(); ctx.ellipse(t.x, t.y + 7, R, R * 0.45, 0, 0, Math.PI*2); ctx.fill();
    // 八边形钢底座（厚度 + 顶面两档）
    ctx.fillStyle = '#333c4c';
    pvpOctPath(t.x, t.y + 4, R); ctx.fill();
    ctx.fillStyle = '#5b6880';
    pvpOctPath(t.x, t.y + 1, R * 0.92); ctx.fill();
    ctx.strokeStyle = '#20262f'; ctx.lineWidth = 2;
    pvpOctPath(t.x, t.y + 1, R * 0.92); ctx.stroke();
    // 立柱转台
    ctx.fillStyle = '#77839c';
    ctx.beginPath(); ctx.arc(t.x, t.y - 3, R * 0.5, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#39424f'; ctx.lineWidth = 1.5; ctx.stroke();
    // 炮管（跟着索敌角度转）：工业橙 + 枪口余温
    ctx.save();
    ctx.translate(t.x, t.y - 3);
    ctx.rotate(t.ang);
    ctx.fillStyle = t.firing > 0 ? '#ffd79a' : '#ffb347';
    ctx.beginPath();
    ctx.moveTo(0, -R * 0.28); ctx.lineTo(R * 1.38, -R * 0.17); ctx.lineTo(R * 1.38, R * 0.17); ctx.lineTo(0, R * 0.28);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a5b16'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,246,214,.95)';        // 枪口
    ctx.beginPath(); ctx.arc(R * 1.32, 0, R * 0.15, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // 顶部信号灯：有目标（最近 0.3 秒内转过向）亮橙，扫视时暗
    ctx.fillStyle = t.scan > 0.25 ? 'rgba(255,110,80,.55)' : 'rgba(120,255,170,.85)';
    ctx.beginPath(); ctx.arc(t.x, t.y - R * 0.62, 2.6, 0, Math.PI*2); ctx.fill();
    // 剩余寿命环（外圈，随时间减少）
    const frac = clamp(t.life / Math.max(0.001, t.max), 0, 1);
    ctx.strokeStyle = 'rgba(255,179,71,.20)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(t.x, t.y - 2, R + 6, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = frac < 0.25 ? 'rgba(255,110,80,.95)' : 'rgba(255,179,71,.9)';
    ctx.beginPath(); ctx.arc(t.x, t.y - 2, R + 6, -Math.PI/2, -Math.PI/2 + Math.PI*2*frac); ctx.stroke();
  }
  ctx.restore();
}

// 🚜 战车绘制（玩家层）：几何全部按 P.r 缩放 —— **看得见的车体就是挨打的判定圈**（不留隐形伤害）
//    造型：两条履带 + 八边形装甲车体 + 驾驶舱里露头的工程师 + 两根并排炮管（各自后坐）+ 头顶装甲条
function drawPlayerVehicle(P){
  const v = P.veh; if(!v) return;
  const R = P.r, a = v.ang, hurt = v.hitFx > 0; // 刚挨了一下：全车白闪
  const box = (x, y, w, h) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+w, y); ctx.lineTo(x+w, y+h); ctx.lineTo(x, y+h); ctx.closePath(); };
  ctx.save();
  ctx.translate(P.x, P.y);
  ctx.rotate(a);
  // 地面阴影
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  ctx.beginPath(); ctx.ellipse(0, R * 0.26, R * 1.30, R * 0.60, 0, 0, Math.PI*2); ctx.fill();
  // 两条履带（+x = 车头方向，履带分列左右）
  for(const s of [-1, 1]){
    const ty = s * R * 0.76, tl = R * 1.02, th = R * 0.33;
    ctx.fillStyle = '#2b3240';
    box(-tl, ty - th, tl * 2, th * 2); ctx.fill();
    ctx.strokeStyle = '#151a22'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(190,205,225,.45)'; ctx.lineWidth = 2; // 履带齿：滚动（tread 计时驱动，怠速也在慢慢转）
    for(let i = 0; i < 7; i++){
      const px = -tl + ((i * 0.30 * R * 2 + v.tread * 30) % (tl * 2));
      ctx.beginPath(); ctx.moveTo(px, ty - th + 2.5); ctx.lineTo(px, ty + th - 2.5); ctx.stroke();
    }
  }
  // 车体：八边形装甲（顶面 + 前装甲板），挨打时整块白闪
  ctx.fillStyle = hurt ? '#eef4ff' : '#5b6880';
  pvpOctPath(0, 0, R * 0.95); ctx.fill();
  ctx.strokeStyle = '#20262f'; ctx.lineWidth = 2.6; pvpOctPath(0, 0, R * 0.95); ctx.stroke();
  ctx.fillStyle = hurt ? '#ffffff' : '#77839c';   // 前装甲板（往车头方向拉一块亮面）
  box(-R * 0.30, -R * 0.62, R * 1.18, R * 1.24); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.6; ctx.stroke();
  // 驾驶舱（本体只在舱口露个头 —— "进入战车"看得见）
  ctx.fillStyle = '#39424f';
  ctx.beginPath(); ctx.arc(-R * 0.06, 0, R * 0.46, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#1b212b'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = hurt ? '#fff' : (P.seat === 2 ? '#4ade80' : (P.seat === 1 ? '#f84' : '#ff8a3d'));
  ctx.beginPath(); ctx.arc(-R * 0.06, 0, R * 0.30, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2;   // 安全帽檐（朝着车头）
  ctx.beginPath(); ctx.arc(-R * 0.06, 0, R * 0.30, -Math.PI * 0.42, Math.PI * 0.42); ctx.stroke();
  // 两根炮管：各自后坐（刚开火那根缩回去 + 枪口亮），i = 0 左 / 1 右
  for(let i = 0; i < 2; i++){
    const by = (i === 0 ? -1 : 1) * VEH_BARREL_OFF;
    const back = (v.cd[i] < 0.12) ? R * 0.13 : 0;                 // 开火后坐
    const x0 = R * 0.42 - back, x1 = R * 1.36 - back;
    ctx.fillStyle = (v.cd[i] < 0.12) ? '#ffd79a' : '#ffb347';
    box(x0, by - R * 0.13, x1 - x0, R * 0.26); ctx.fill();
    ctx.strokeStyle = '#8a5b16'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,246,214,.95)';                       // 炮口
    ctx.beginPath(); ctx.arc(x1, by, R * 0.115, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
  // 装甲条（世界坐标方向，永远水平：车顶上方一条，含数字）
  const w = R * 2.4, h = 6, bx = P.x - w/2, by = P.y - R - 20;
  const frac = clamp(v.hp / Math.max(1, v.maxHp), 0, 1);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(bx - 2, by - 2, w + 4, h + 4);
  ctx.fillStyle = frac > 0.5 ? '#6fe08a' : (frac > 0.25 ? '#ffb347' : '#ff5f5f');
  ctx.fillRect(bx, by, w * frac, h);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(bx, by + h/2); ctx.lineTo(bx + w * frac, by + h/2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('🚜 ' + Math.max(0, Math.ceil(v.hp)) + ' / ' + v.maxHp, P.x, by - 5);
  // 在岗环（车体一圈亮橙虚线：提示"大招正在生效，冷却没在走"）
  ctx.strokeStyle = `rgba(255,179,71,${0.55 + 0.25*Math.sin(G.time*5)})`;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath(); ctx.arc(P.x, P.y, R + 13, G.time * 1.6, G.time * 1.6 + Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  // 冒烟（装甲见底：车体自己冒黑烟，告诉玩家"快撑不住了"）
  if(frac <= 0.35){
    const t = G.time * 3;
    for(let i = 0; i < 3; i++){
      const ph = (t + i * 0.7) % 1;
      ctx.fillStyle = `rgba(60,60,66,${(1 - ph) * 0.5})`;
      ctx.beginPath();
      ctx.arc(P.x + Math.sin(t + i * 2) * 12, P.y - R - 4 - ph * 26, 5 + ph * 8, 0, Math.PI*2);
      ctx.fill();
    }
  }
  ctx.restore();
}
// 🚧 战车工地（地面层）：施工 3 秒期间的半成品 —— 四根立柱 + 顶框 + 随进度长起来的车体 + 进度环 + 倒计时
function drawVehicleSites(){
  const ps = (multiOn() ? (G.players || []) : [G.player]).filter(p => p && !p.dead && p.vehBuild > 0 && p.vehSpot);
  if(!ps.length) return;
  ctx.save();
  for(const p of ps){
    const s = p.vehSpot, R = VEH_R;
    const k = clamp(1 - p.vehBuild / Math.max(0.001, p.vehBuildMax), 0, 1); // 施工进度 0→1
    // 地面钢板（半透明，铺开中）
    ctx.globalAlpha = 0.20 + 0.45 * k;
    ctx.fillStyle = '#333c4c';
    ctx.beginPath(); ctx.ellipse(s.x, s.y + R * 0.25, R * 1.28, R * 0.58, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // 四根脚手架立柱（随进度从"矮"长到"高"）
    const hgt = 6 + 26 * k;
    ctx.strokeStyle = 'rgba(255,179,71,.9)'; ctx.lineWidth = 2.5;
    for(const dx of [-R * 0.78, R * 0.78]) for(const dy of [-R * 0.66, R * 0.66]){
      ctx.beginPath(); ctx.moveTo(s.x + dx, s.y + dy); ctx.lineTo(s.x + dx, s.y + dy - hgt); ctx.stroke();
    }
    // 半成品车体（虚 → 实、小 → 大）
    ctx.globalAlpha = 0.18 + 0.52 * k;
    ctx.fillStyle = '#5b6880';
    pvpOctPath(s.x, s.y, R * (0.52 + 0.41 * k)); ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = 'rgba(255,209,102,.9)'; ctx.lineWidth = 2;
    pvpOctPath(s.x, s.y, R * (0.52 + 0.41 * k)); ctx.stroke();
    ctx.globalAlpha = 1;
    // 施工进度环
    ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(s.x, s.y, R + 12, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(s.x, s.y, R + 12, -Math.PI/2, -Math.PI/2 + Math.PI*2*k); ctx.stroke();
    // 倒计时
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🚧 建造中 ' + p.vehBuild.toFixed(1) + 's', s.x, s.y - R - 22);
  }
  ctx.restore();
}

// 🌀 龙卷风绘制（地面层，与 updateTornadoes 同参数：风眼半径 = 吸怪/伤害范围）
function drawTornadoes(){
  if(!G.tornadoes || !G.tornadoes.length) return;
  ctx.save();
  for(const t of G.tornadoes){
    const fade = Math.min(1, t.life / 0.4); // 最后 0.4 秒淡出
    // 外围青色旋涡光晕（越靠风眼越亮）
    const grad = ctx.createRadialGradient(t.x, t.y, t.r*0.1, t.x, t.y, t.r);
    grad.addColorStop(0, `rgba(140,240,255,${0.26*fade})`);
    grad.addColorStop(0.6, `rgba(90,190,230,${0.12*fade})`);
    grad.addColorStop(1, 'rgba(60,140,190,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
    // 旋转气流：4 道螺旋弧（近风眼转得快，越靠外越慢）
    ctx.lineWidth = 2.5;
    for(let i=0;i<4;i++){
      const rr = t.r * (0.25 + i*0.22);
      const start = G.time * (3.0 - i*0.4) * t.spin + i*(Math.PI*2/4);
      ctx.strokeStyle = `rgba(180,245,255,${(0.5 - i*0.07)*fade})`;
      ctx.beginPath(); ctx.arc(t.x, t.y, rr, start, start + Math.PI*0.85); ctx.stroke();
    }
    // 被吸入的粒子流：从边缘螺旋流向风眼
    for(let i=0;i<10;i++){
      const pa = i/10*Math.PI*2 + G.time*2.4*t.spin;
      const pr = t.r * (0.9 - ((G.time*0.6 + i*0.17) % 1) * 0.75);
      ctx.fillStyle = `rgba(200,250,255,${0.5*fade})`;
      ctx.beginPath(); ctx.arc(t.x + Math.cos(pa)*pr, t.y + Math.sin(pa)*pr, 2, 0, Math.PI*2); ctx.fill();
    }
    // 风眼边界虚线圆：一眼看出吸怪范围
    ctx.strokeStyle = `rgba(160,240,255,${(0.5 + 0.25*Math.sin(G.time*7))*fade})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    // 收尾前 0.4 秒：亮环向外扩张 = 马上要把怪吹飞（半径逼近实际击退半径 1.2×r）
    if(t.life < 0.4){
      const k = 1 - t.life/0.4;
      ctx.strokeStyle = `rgba(220,255,255,${0.7*(1 - k*0.6)})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(t.x, t.y, t.r*(0.4 + 0.8*k), 0, Math.PI*2); ctx.stroke();
    }
  }
  ctx.restore();
}

// ===== 伤害数字（设置「显示伤害数值」开启时，造成/受到伤害弹出） =====
function spawnDamageText(x, y, dmg, color, isCrit, isPlayer){
  if(!G.showDamage) return; // 🔢 开关关着：完全不生成，零开销
  G.floaters.push({
    x: x + rand(-6, 6), y: y, baseY: y,    // baseY：生成高度，落回此处即"落地"
    dmg: Math.max(0, Math.round(dmg)),
    color: color || (isPlayer ? '#ff5b5b' : '#fff'),
    crit: !!isCrit, isPlayer: !!isPlayer,
    vy: -210, vx: rand(-90, 90), t: 0, life: 1.0, max: 1.0, landed: false
  });
}
function updateFloaters(dt){
  if(!G.floaters.length) return;
  for(let i = G.floaters.length - 1; i >= 0; i--){
    const f = G.floaters[i];
    f.t += dt;
    f.vy += 640 * dt;            // 重力始终向下：先抵消初速、再加速下落
    f.y += f.vy * dt;            // 自然抛物：弹起 → 落回 → 继续下坠
    f.x += f.vx * dt;            // 随机水平速度：朝随机方向斜向掉落（散射观感）
    if(!f.landed && f.y >= f.baseY + 6){ // 落回生成高度附近 = 触地
      f.landed = true; f.life = 0.30; f.vy = 70; // 进入落地淡出（轻微下沉）
    }
    f.life -= dt;
    if(f.life <= 0) G.floaters.splice(i, 1);
  }
}
function drawFloaters(){ // 世界坐标绘制（随镜头/缩放）
  if(!G.floaters || !G.floaters.length) return;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for(const f of G.floaters){
    let alpha = 1;
    if(f.landed) alpha = Math.max(0, f.life / 0.30); // 落地后 0.30s 内淡出（谈起/坠落阶段全程清晰）
    const txt = f.dmg >= 10000 ? 'K.O.' : ('' + f.dmg); // 秒杀/超大伤显示 K.O.
    const size = f.crit ? 23 : (f.dmg >= 10000 ? 20 : 16);
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(0,0,0,0.72)';
    ctx.strokeText(txt, f.x, f.y);          // 黑描边保证任何底色都看得清
    ctx.fillStyle = f.color;
    ctx.fillText(txt, f.x, f.y);
  }
  ctx.restore();
}

// ===== EFFECTS DRAW (在 RENDER 阶段调用，保证不被清屏覆盖) =====
function drawEffects(){
  G.effects.forEach(ef => {
    if(ef.type === 'slash'){ // 🗡 剑士挥砍弧光：刀锋扫过 + 扇形残影随生命淡出（world 坐标，与判定同半径）
      const t = 1 - ef.life/ef.max; // 0→1
      const fade = 1 - t;
      const R = ef.r * (0.72 + 0.28*Math.min(1, t*3));
      (ef.dirs || []).forEach(d => {
        const a0 = d - ef.arc, a1 = d + ef.arc;
        const head = a0 + (a1 - a0) * Math.min(1, t / 0.7); // 刀锋头部：前 70% 扫完整段弧
        // 扇形残影（低透明度，标出实际判定范围）
        ctx.fillStyle = `rgba(255,255,255,${0.16*fade})`;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.arc(ef.x, ef.y, R, a0, a1); ctx.closePath(); ctx.fill();
        // 刀光：从起手角到刀锋，分 8 段渐亮渐粗（越靠刀锋越亮）
        const seg = 8;
        for(let i=0;i<seg;i++){
          const s0 = a0 + (head - a0) * (i/seg);
          const s1 = a0 + (head - a0) * ((i+1)/seg);
          if(s1 - s0 < 1e-4) continue;
          const st = (i+1)/seg;
          ctx.strokeStyle = `rgba(255,255,255,${0.9*st*fade})`;
          ctx.lineWidth = 2 + 4*st;
          ctx.beginPath(); ctx.arc(ef.x, ef.y, R, s0, s1); ctx.stroke();
        }
        // 内圈金弧：剑刃本体的轨迹
        ctx.strokeStyle = `rgba(255,209,102,${0.55*fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, R*0.68, a0, head); ctx.stroke();
      });
    } else if(ef.type === 'boom'){
      const t = 1 - ef.life/ef.max; // 0→1
      // 前30%时间快速扩散到最大半径，之后保持最大半径淡出
      const expand = Math.min(1, t/0.3);
      const r = ef.maxR * expand;
      const fade = t < 0.3 ? t/0.3 : 1 - (t-0.3)/0.7;
      // 内部填充（半透明橙色）
      ctx.fillStyle = `rgba(255,180,40,${0.28*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r, 0, Math.PI*2); ctx.fill();
      // 冲击波环：从内向外扩散的明亮橙色圆环（醒目表示爆炸范围）
      const ringR = ef.maxR * (0.4 + 0.6*expand);
      ctx.strokeStyle = `rgba(255,170,50,${0.95*fade})`;
      ctx.lineWidth = 6*fade + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ringR, 0, Math.PI*2); ctx.stroke();
      // 爆炸范围边界圈（清晰可见）
      ctx.strokeStyle = `rgba(255,120,0,${0.9*fade})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r, 0, Math.PI*2); ctx.stroke();
      // 中心亮点
      ctx.fillStyle = `rgba(255,240,180,${0.8*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, 4, 0, Math.PI*2); ctx.fill();
    } else if(ef.type === 'blooddash'){ // 🦇 血月突袭：一道血色残痕（宽度 = 沿途判定带，看得见的血痕就是打得中的范围）
      const fade = Math.max(0, ef.life / ef.max);
      const dx = ef.x2 - ef.x1, dy = ef.y2 - ef.y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy/len, ny = dx/len;
      // 血雾带（外宽内窄的两层渐变）
      ctx.fillStyle = `rgba(255,77,109,${0.20*fade})`;
      ctx.beginPath();
      ctx.moveTo(ef.x1 + nx*ef.w, ef.y1 + ny*ef.w);
      ctx.lineTo(ef.x2 + nx*ef.w*0.45, ef.y2 + ny*ef.w*0.45);
      ctx.lineTo(ef.x2 - nx*ef.w*0.45, ef.y2 - ny*ef.w*0.45);
      ctx.lineTo(ef.x1 - nx*ef.w, ef.y1 - ny*ef.w);
      ctx.closePath(); ctx.fill();
      // 中心血线 + 前端血刃
      ctx.strokeStyle = `rgba(255,120,150,${0.95*fade})`;
      ctx.lineWidth = 3 + 5*fade;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ef.x1, ef.y1); ctx.lineTo(ef.x2, ef.y2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.8*fade})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(ef.x1, ef.y1); ctx.lineTo(ef.x2, ef.y2); ctx.stroke();
      ctx.fillStyle = `rgba(255,77,109,${0.7*fade})`;
      ctx.beginPath(); ctx.arc(ef.x2, ef.y2, 9*fade + 3, 0, Math.PI*2); ctx.fill();
    } else if(ef.type === 'frost'){ // ❄️ 魔法师冰霜：冰蓝扩散环 + 六角冰晶（判定范围 = 画出来的圈，不乘视野缩放外的任何系数）
      const t = 1 - ef.life/ef.max; // 0→1
      const fade = 1 - t;
      const R = ef.r * (0.45 + 0.55*Math.min(1, t*2.2)); // 快速扩到满圈再淡出
      ctx.fillStyle = `rgba(150,225,255,${0.16*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, R, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(205,245,255,${0.9*fade})`;
      ctx.lineWidth = 3 + 4*fade;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, R, 0, Math.PI*2); ctx.stroke();
      // 圈内六角冰晶：从中心炸开的小冰刺，标明"这一圈都被冻住"
      ctx.strokeStyle = `rgba(235,252,255,${0.8*fade})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for(let i=0;i<6;i++){
        const a = i*Math.PI/3 + t*0.5;
        const r1 = R*0.22, r2 = R*0.92;
        ctx.beginPath();
        ctx.moveTo(ef.x + Math.cos(a)*r1, ef.y + Math.sin(a)*r1);
        ctx.lineTo(ef.x + Math.cos(a)*r2, ef.y + Math.sin(a)*r2);
        ctx.stroke();
      }
    } else if(ef.type === 'windburst'){ // 🌀 龙卷风收尾：扩散的青色风环 + 一圈被吹散的短弧
      const t = 1 - ef.life/ef.max, fade = 1 - t;
      const R = ef.r * (0.35 + 0.65*Math.min(1, t*1.6));
      ctx.strokeStyle = `rgba(180,245,255,${0.85*fade})`;
      ctx.lineWidth = 3 + 5*fade;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, R, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(120,200,240,${0.5*fade})`;
      ctx.lineWidth = 2;
      for(let i=0;i<10;i++){
        const a = i/10*Math.PI*2 + t*0.9;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, R*0.92, a, a + 0.35); ctx.stroke();
      }
    } else if(ef.type === 'firepool'){ // 🔥 燃烧弹火海：地面跳动火苗 + 边界圈（半径=持续伤害范围）
      const fade = Math.min(1, ef.life/0.5);
      ctx.fillStyle = `rgba(255,120,30,${0.16*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(255,150,60,${(0.4 + 0.2*Math.sin(G.time*9))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      for(let i=0;i<7;i++){ // 火苗：小圆随正弦跳动（纯装饰）
        const a = i/7*Math.PI*2 + ef.x*0.01;
        const rr = ef.r * (0.25 + (i%3)*0.28);
        const fh = 3 + 2.5*Math.abs(Math.sin(G.time*6 + i*1.7));
        ctx.fillStyle = `rgba(255,${170 - i*8},60,${0.55*fade})`;
        ctx.beginPath(); ctx.arc(ef.x + Math.cos(a)*rr, ef.y + Math.sin(a)*rr - fh, 3 + fh*0.35, 0, Math.PI*2); ctx.fill();
      }
    } else if(ef.type === 'bubbleBreak'){ // 🫧 泡泡破裂：扩散的碎光圆环
      const t = 1 - ef.life/ef.max;
      ctx.strokeStyle = `rgba(200,245,255,${0.85*(1-t)})`;
      ctx.lineWidth = 3*(1-t) + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*(0.5 + t*0.9), 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = `rgba(160,230,255,${0.3*(1-t)})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*(0.4 + t*0.6), 0, Math.PI*2); ctx.fill();
    } else if(ef.type === 'bubbleMove'){ // 🫧 泡泡转移：旧主人 → 新主人的飞行轨迹
      const fade = ef.life/ef.max;
      const mx = (ef.x1 + ef.x2)/2 + (Math.random()-0.5)*16;
      const my = (ef.y1 + ef.y2)/2 + (Math.random()-0.5)*16;
      ctx.strokeStyle = `rgba(190,245,255,${0.85*fade})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ef.x1, ef.y1); ctx.quadraticCurveTo(mx, my, ef.x2, ef.y2); ctx.stroke();
      // 泡泡本体沿轨迹走
      const tt = 1 - fade;
      const px = (1-tt)*(1-tt)*ef.x1 + 2*(1-tt)*tt*mx + tt*tt*ef.x2;
      const py = (1-tt)*(1-tt)*ef.y1 + 2*(1-tt)*tt*my + tt*tt*ef.y2;
      ctx.fillStyle = `rgba(150,230,255,${0.5*fade})`;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(220,250,255,${0.9*fade})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2); ctx.stroke();
    } else if(ef.type === 'web'){ // 🕸️ 蛛网（织网者铺的陷阱）：放射蛛丝 + 同心环 + 边缘圈（半径=减速范围）
      const fade = Math.min(1, ef.life/0.5); // 最后 0.5 秒淡出
      const sd = ef.seed || 0;
      ctx.save();
      // 底色：淡淡的白色粘丝（能看清"这里是陷阱"，但不遮住底下的敌人）
      ctx.fillStyle = `rgba(226,222,240,${0.09*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      // 放射蛛丝：8 根从中心向外的丝
      ctx.strokeStyle = `rgba(240,236,255,${0.5*fade})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for(let i = 0; i < 8; i++){
        const a = i/8*Math.PI*2 + sd;
        ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x + Math.cos(a)*ef.r, ef.y + Math.sin(a)*ef.r);
      }
      ctx.stroke();
      // 同心环：3 圈（0.38 / 0.68 / 1.0 半径）
      ctx.strokeStyle = `rgba(240,236,255,${0.4*fade})`;
      ctx.lineWidth = 1.2;
      for(const k of [0.38, 0.68, 1.0]){
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*k, 0, Math.PI*2); ctx.stroke();
      }
      // 边缘圈：标出实际减速范围（看得见的圈就是踩得到的圈）
      ctx.strokeStyle = `rgba(190,175,235,${(0.55 + 0.2*Math.sin(G.time*4 + sd))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();

    } else if(ef.type === 'vine'){ // 🌿 腐藤怪的藤痕：贴地蔓生的暗绿细藤 + 边缘圈（半径=减速范围）
      const fade = Math.min(1, ef.life/0.5);
      const sd = ef.seed || 0;
      ctx.save();
      ctx.fillStyle = `rgba(58,120,60,${0.13*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      // 蔓生细藤：从中心向外绕圈爬的曲线（像藤蔓在地上摊开）
      ctx.strokeStyle = `rgba(96,190,104,${0.55*fade})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for(let i = 0; i < 5; i++){
        const a0 = i/5*Math.PI*2 + sd;
        for(let k = 0; k <= 8; k++){
          const t = k/8, rr = ef.r*(0.15 + 0.85*t);
          const aa = a0 + t*1.5;
          const px = ef.x + Math.cos(aa)*rr, py = ef.y + Math.sin(aa)*rr;
          if(k===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      // 边缘圈：标出实际减速范围
      ctx.strokeStyle = `rgba(120,220,130,${(0.5 + 0.2*Math.sin(G.time*5 + sd))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();

    } else if(ef.type === 'sporeArc'){ // 🌿 孢囊妖的飞孢：一颗带高光的黄绿孢子弹 + 拖尾
      const k = Math.min(1, ef.t / ef.dur);
      const trail = 5;
      ctx.save();
      ctx.strokeStyle = 'rgba(170,210,90,0.35)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ef.x, ef.y);
      for(let i = 1; i <= trail; i++){
        const tk = Math.max(0, k - i*0.035);
        ctx.lineTo(ef.sx + (ef.tx - ef.sx)*tk, ef.sy + (ef.ty - ef.sy)*tk - Math.sin(tk*Math.PI)*90);
      }
      ctx.stroke();
      ctx.fillStyle = '#c8e878';
      ctx.beginPath(); ctx.arc(ef.x, ef.y, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,220,0.85)';
      ctx.beginPath(); ctx.arc(ef.x - 2, ef.y - 2, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();

    } else if(ef.type === 'spore'){ // 🌿 孢子云：黄绿毒团 + 冒泡（半径=持续伤害范围）
      const fade = Math.min(1, ef.life/0.5);
      const sd = ef.seed || 0;
      const rgb = ef.rgb || '150,190,80';
      ctx.fillStyle = `rgba(${rgb},${0.20*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(${rgb},${0.13*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*0.62, 0, Math.PI*2); ctx.fill();
      // 上浮的孢子泡（位置随时间漂，纯装饰）
      ctx.fillStyle = `rgba(220,240,160,${0.30*fade})`;
      for(let i = 0; i < 4; i++){
        const pa = i/4*Math.PI*2 + sd + G.time*0.6;
        const pr = ef.r*(0.25 + 0.5*((G.time*0.4 + i*0.25) % 1));
        ctx.beginPath(); ctx.arc(ef.x + Math.cos(pa)*pr, ef.y + Math.sin(pa)*pr - 6, 3.2, 0, Math.PI*2); ctx.fill();
      }
      ctx.strokeStyle = `rgba(${rgb},${(0.5 + 0.2*Math.sin(G.time*7 + sd))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();

    } else if(ef.type === 'root'){ // 🌿 缠根妖的根须：地面盘结的褐色根网 + 蠕动节点（半径=减速+小伤害范围）
      const fade = Math.min(1, ef.life/0.5);
      const sd = ef.seed || 0;
      ctx.save();
      ctx.fillStyle = `rgba(70,58,32,${0.16*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      // 根网：多束从中心蜿蜒向外的根须（中段抖动=还在蠕动）
      ctx.strokeStyle = `rgba(120,96,54,${0.75*fade})`;
      ctx.lineWidth = 3.4;
      for(let i = 0; i < 7; i++){
        const a0 = i/7*Math.PI*2 + sd;
        ctx.beginPath();
        for(let k = 0; k <= 9; k++){
          const t = k/9, rr = ef.r*t;
          const wob = Math.sin(t*7 + sd + G.time*3)*ef.r*0.09*(1-t);
          const aa = a0 + wob/ef.r;
          const px = ef.x + Math.cos(aa)*rr, py = ef.y + Math.sin(aa)*rr;
          if(k===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // 蠕动节点：几颗沿根网滑动的亮结
      ctx.fillStyle = `rgba(190,160,90,${0.75*fade})`;
      for(let i = 0; i < 3; i++){
        const t = ((G.time*0.35 + i*0.34) % 1);
        const a0 = i/3*Math.PI*2 + sd;
        const px = ef.x + Math.cos(a0)*ef.r*t, py = ef.y + Math.sin(a0)*ef.r*t;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
      }
      ctx.strokeStyle = `rgba(160,130,70,${(0.5 + 0.2*Math.sin(G.time*4 + sd))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      ctx.restore();

    } else if(ef.type === 'tendrilBeam'){ // 🌿 蚀光藤眼的藤光射线：预警期细紫瞄准线，开火后粗光柱 + 白芯
      ctx.save();
      ctx.translate(ef.x, ef.y); ctx.rotate(ef.a);
      if((ef.warn || 0) > 0){ // 预警：细紫色瞄准线（无伤害），提示玩家走位避开
        const a = 0.35 + 0.25*Math.sin(G.time*14);
        ctx.fillStyle = `rgba(190,110,240,${a})`;
        ctx.fillRect(0, -2.5, ef.len, 5);
      } else {
        const a = 0.35 + 0.25*Math.sin(G.time*12);
        ctx.fillStyle = `rgba(${ef.rgb || '140,70,200'},${a})`;
        ctx.fillRect(0, -ef.w/2, ef.len, ef.w);
        ctx.fillStyle = `rgba(${ef.rgbCore || '220,180,255'},${a*0.6})`;
        ctx.fillRect(0, -ef.w/4, ef.len, ef.w/2);
        ctx.fillStyle = `rgba(255,255,255,${a*0.35})`;
        ctx.fillRect(0, -ef.w/8, ef.len, ef.w/4);
      }
      ctx.restore();

    } else if(ef.type === 'venompool'){ // 🧪 毒液领域：墨绿毒圈 + 边界圈 + 冒泡（半径=毒伤与减速范围）
      const fade = Math.min(1, ef.life/0.5); // 最后 0.5 秒淡出
      const sd = ef.seed || 0;
      ctx.fillStyle = `rgba(110,200,40,${0.16*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(150,240,80,${0.10*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*0.6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(170,240,110,${(0.45 + 0.2*Math.sin(G.time*7 + sd))*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      for(let i=0;i<6;i++){ // 冒泡：小圆随正弦上浮（纯装饰）
        const a = i/6*Math.PI*2 + sd;
        const ph = (G.time*0.8 + i*0.31 + sd) % 1;
        const rr = ef.r * (0.2 + (i%4)*0.2);
        const rad = (2.4 + 2.2*ph) * fade;
        ctx.fillStyle = `rgba(190,255,130,${0.55*(1-ph)*fade})`;
        ctx.beginPath(); ctx.arc(ef.x + Math.cos(a)*rr, ef.y + Math.sin(a)*rr - ph*8, rad, 0, Math.PI*2); ctx.fill();
      }
    } else if(ef.type === 'ketchupdrop'){ // 🍅 飞酱滴：一颗带高光的小红浆滴 + 短短拖尾（飞行中稍变大，落地即化潭）
      const t = 1 - ef.life/ef.max;      // 0→1 飞行进度
      const fade = Math.min(1, t*6);     // 起手别太突兀
      const rad = 3.2 + 2.2*Math.sin(t*Math.PI); // 飞行中憋大一点
      ctx.strokeStyle = `rgba(230,41,58,${0.35*fade})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.lineTo(ef.x - ef.vx*0.045, ef.y - ef.vy*0.045); ctx.stroke();
      ctx.fillStyle = `rgba(214,40,40,${0.95*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, rad, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,150,140,${0.8*fade})`;
      ctx.beginPath(); ctx.arc(ef.x - rad*0.3, ef.y - rad*0.3, rad*0.34, 0, Math.PI*2); ctx.fill();
    } else if(ef.type === 'ketchuppool'){ // 🍅 番茄酱潭：浓稠红酱 + 深色酱芯 + 酱边圈 + 上浮酱泡（半径=伤害与减速范围）
      const fade = Math.min(1, ef.life/0.5); // 最后 0.5 秒淡出
      const sd = ef.seed || 0;
      ctx.fillStyle = `rgba(214,40,40,${0.22*fade})`;          // 酱体（麦当劳番茄酱红）
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(150,18,26,${0.16*fade})`;          // 酱芯（更浓）
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*0.62, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(235,60,60,${(0.5 + 0.2*Math.sin(G.time*6 + sd))*fade})`; // 酱边（心跳似的一明一暗）
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
      for(let i=0;i<5;i++){ // 酱泡：小圆随正弦上浮（纯装饰，和毒液一个思路换成红色）
        const a = i/5*Math.PI*2 + sd;
        const ph = (G.time*0.6 + i*0.27 + sd) % 1;
        const rr = ef.r * (0.15 + (i%4)*0.22);
        const rad = (2.2 + 2.0*ph) * fade;
        ctx.fillStyle = `rgba(255,130,115,${0.5*(1-ph)*fade})`;
        ctx.beginPath(); ctx.arc(ef.x + Math.cos(a)*rr, ef.y + Math.sin(a)*rr - ph*7, rad, 0, Math.PI*2); ctx.fill();
      }
    } else if(ef.type === 'corrode'){ // 🌌 腐蚀毒潭：暗紫毒圈 + 边界圈（半径=毒伤范围）
      const fade = Math.min(1, ef.life/0.5);
      const cc = ef.rgb || '150,70,200'; // 🌌 默认虚空紫；裂光十字的审判柱传金色
      ctx.fillStyle = `rgba(${cc},${0.18*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(${cc},${0.14*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*0.6, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(${cc},${(0.55 + 0.2*Math.sin(G.time*7)) * fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
    } else if(ef.type === 'drainbeam'){ // 🌌 虚空裂界者·虚空射线：紫色半透明光柱（沿角度 ef.a 延伸到 ef.len）
      ctx.save();
      ctx.translate(ef.x, ef.y); ctx.rotate(ef.a);
      if((ef.warn || 0) > 0){ // 预警：细红色瞄准线（无伤害），提示玩家走位避开
        ctx.fillStyle = 'rgba(255,45,85,0.4)';
        ctx.fillRect(0, -3, ef.len, 6);
      } else {
        const a = 0.35 + 0.25*Math.sin(G.time*10);
        ctx.fillStyle = `rgba(${ef.rgb || '170,90,255'},${a})`;      // 🌌 虚空裂界者传深红，其余沿用虚空紫
        ctx.fillRect(0, -ef.w/2, ef.len, ef.w);
        ctx.fillStyle = `rgba(${ef.rgbCore || '220,170,255'},${a*0.6})`;
        ctx.fillRect(0, -ef.w/4, ef.len, ef.w/2);
      }
      ctx.restore();
    } else if(ef.type === 'voidpulse'){ // 🌌 裂光十字·汲取脉冲：向外扩散的青绿冲击环
      const k = Math.min(1, 1 - ef.life / ef.max);
      const al = Math.max(0, 1 - k);
      const rr = ef.r * (0.35 + 0.65*k);
      const vp = ef.rgb || '29,224,176'; // 🌌 默认青绿；虚空裂界者传深红
      ctx.strokeStyle = `rgba(${vp},${0.55*al})`;
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, rr, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(${vp},${0.32*al})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, rr*0.72, 0, Math.PI*2); ctx.stroke();
    } else if(ef.type === 'voidpull'){ // 🌌 内爆吸力（向心吸力场）：向心收缩的同心环 + 中心暗核
      const pl = ef.rgb || '63,208,255';
      const fade = Math.min(1, ef.life/0.5);
      ctx.fillStyle = `rgba(${pl},${0.10*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      for(let i=0;i<3;i++){
        const kk = ((G.time*0.8 + i/3) % 1);            // 0→1：从外圈往环心收
        ctx.strokeStyle = `rgba(${pl},${0.45*(1-Math.abs(kk-0.5)*1.2)*fade})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, Math.max(4, ef.r*(1-kk)), 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = `rgba(10,25,45,${0.5*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*0.16, 0, Math.PI*2); ctx.fill();
    } else if(ef.type === 'shieldBreak'){ // 🛡 碎盾：向外扩散的六边形光环 + 白闪
      const t = 1 - ef.life/ef.max, fade = 1 - t;
      const R = ef.r * (0.8 + 0.5*Math.min(1, t*1.5));
      ctx.save();
      ctx.strokeStyle = `rgba(190,235,255,${0.85*fade})`;
      ctx.lineWidth = 4*fade + 1;
      ctx.beginPath();
      for(let i = 0; i < 6; i++){
        const a = i/6*Math.PI*2 + t*0.6;
        const px = ef.x + Math.cos(a)*R, py = ef.y + Math.sin(a)*R;
        if(i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.restore();
    } else if(ef.type === 'parry'){ // ⚔ 斩铁剑皇格挡：金色扩散环 + 一道横扫剑光（一圈表示被斩灭的范围）
      const t = 1 - ef.life/ef.max;
      const fade = 1 - t;
      const r = ef.r * (0.35 + 0.65*Math.min(1, t/0.35));
      ctx.strokeStyle = `rgba(255,228,150,${0.95*fade})`;
      ctx.lineWidth = 5*fade + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.75*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r*0.86, 0, Math.PI*2); ctx.stroke();
      const a0 = G.time*3.4;
      ctx.strokeStyle = `rgba(255,209,102,${0.9*fade})`;
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r*0.72, a0, a0 + Math.PI*1.4); ctx.stroke();
    } else if(ef.type === 'kcharge'){ // 🛡 骑士「勇士冲锋」起手：金色号角环（内环实线 + 外环虚线扩散）= 增益范围的可视化
      const t = 1 - ef.life/ef.max;            // 0→1
      const fade = 1 - t;
      ctx.save();
      ctx.strokeStyle = `rgba(255,209,102,${0.9*fade})`;
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r * (0.35 + 0.65*t), 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([12, 9]);
      ctx.strokeStyle = `rgba(255,225,150,${0.5*fade})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r * (0.5 + 0.5*t), 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `rgba(255,209,102,${0.10*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(ef.type === 'springpunch'){ // 🥊 弹簧拳出拳：锥形拳影（扇形=实际判定范围）+ 前端弹簧圈拳头
      const t = 1 - ef.life/ef.max;            // 0→1
      const fade = 1 - t;
      const R = ef.r * (0.55 + 0.45*Math.min(1, t*3)); // 前 1/3 时间快速伸到最远
      const a0 = ef.dir - ef.arc, a1 = ef.dir + ef.arc;
      ctx.save();
      // 扇形拳压（半透明绿：看得见这一拳覆盖到哪）
      ctx.fillStyle = `rgba(61,220,132,${0.20*fade})`;
      ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.arc(ef.x, ef.y, R, a0, a1); ctx.closePath(); ctx.fill();
      // 两道收缩的弧线（拳锋"弹"出去的轨迹）
      for(const s of [0.98, 0.66]){
        ctx.strokeStyle = `rgba(168,240,196,${0.85*fade})`;
        ctx.lineWidth = 4*fade + 1;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, R*s, a0, a1); ctx.stroke();
      }
      // 前端拳头：一小一大两只弹簧拳套（蓄力档越大画得越大）
      const fx = ef.x + Math.cos(ef.dir)*R, fy = ef.y + Math.sin(ef.dir)*R;
      const fr = 7 + 9*(ef.frac || 0);
      ctx.fillStyle = '#3ddc84';
      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = '#9fb6a8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; // 拳套后的弹簧圈
      for(let i = 0; i < 3; i++){
        const rr = fr + 5 + i*4.5;
        ctx.globalAlpha = fade * (1 - i*0.22);
        ctx.beginPath(); ctx.arc(fx - Math.cos(ef.dir)*(fr + 3 + i*4.5), fy - Math.sin(ef.dir)*(fr + 3 + i*4.5), rr*0.42, 0, Math.PI*2); ctx.stroke();
      }
      ctx.restore();
    } else if(ef.type === 'springwave'){ // 🥊 撞墙冲击波：朝墙内陷的绿金冲击环 + 地面放射裂纹（半径字段 = ef.max，入池时 r/max 同值）
      const t = 1 - ef.life/ef.max;            // 0→1
      const fade = 1 - t;
      ctx.save();
      // 冲击环：快速扩到最大后淡出
      const expand = Math.min(1, t/0.35);
      const ringR = ef.max * (0.3 + 0.7*expand);
      ctx.strokeStyle = `rgba(255,209,102,${0.95*fade})`;
      ctx.lineWidth = 7*fade + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ringR, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = `rgba(61,220,132,${0.8*fade})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.max * expand, 0, Math.PI*2); ctx.stroke();
      // 内部充能（绿）
      ctx.fillStyle = `rgba(61,220,132,${0.16*fade})`;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.max * expand, 0, Math.PI*2); ctx.fill();
      // 放射裂纹：从撞击点朝墙的方向扎出去
      ctx.strokeStyle = `rgba(255,255,255,${0.6*fade})`;
      ctx.lineWidth = 2;
      const base = Math.atan2(ef.ny || 0, ef.nx || 1);
      for(let i = -2; i <= 2; i++){
        const a = base + i*0.42;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x + Math.cos(a)*ef.max*(0.55 + 0.35*Math.abs(2-Math.abs(i))/2), ef.y + Math.sin(a)*ef.max*(0.55 + 0.35*Math.abs(2-Math.abs(i))/2));
        ctx.stroke();
      }
      ctx.restore();
    } else if(ef.type === 'springhook'){ // 🥊 弹簧钩出钩：从玩家拉到锚点的弹簧（一节圈一节圈绷紧）+ 锚点"铛"的闪光
      const t = 1 - ef.life/ef.max;            // 0→1
      const fade = Math.min(1, (ef.life/ef.max) * 2.2); // 后半段才淡（出钩是瞬间动作）
      ctx.save();
      const dx = ef.x1 - ef.x, dy = ef.y1 - ef.y;
      const len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
      ctx.translate(ef.x, ef.y); ctx.rotate(ang);
      // 弹簧：沿线段画一串斜环（出得越远环越多）
      const coils = Math.max(3, Math.round(len / 16));
      ctx.strokeStyle = `rgba(207,216,228,${0.95*fade})`;
      ctx.lineWidth = 3;
      for(let i = 0; i < coils; i++){
        const x0 = (i/coils)*len, x1 = ((i+1)/coils)*len;
        ctx.beginPath(); ctx.moveTo(x0, -4); ctx.quadraticCurveTo((x0+x1)/2, 5, x1, -4); ctx.stroke();
      }
      // 锚点闪光
      ctx.fillStyle = `rgba(255,255,255,${0.9*fade})`;
      ctx.beginPath(); ctx.arc(len, 0, 5*fade + 2, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = `rgba(61,220,132,${0.9*fade})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(len, 0, 11*(1-t) + 5, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    } else if(ef.type === 'swordult'){ // 🗡 剑士「斩灭」：以朝向为中线的巨大扇形剑光（扇形=实际秒杀范围）
      // 视觉与判定完全同一套参数（中线 ef.ang、半角 ef.arc、半径 ef.r）→ 看到扇形边界就知道打哪
      const t = 1 - ef.life/ef.max;      // 0→1
      const fade = 1 - t;
      const R = ef.r;
      const a0 = ef.ang - ef.arc, a1 = ef.ang + ef.arc;
      ctx.save();
      // ① 扇形内填充：从满亮快速褪去的金白闪（斩中的"刷"一下）
      const grad = ctx.createRadialGradient(ef.x, ef.y, R*0.05, ef.x, ef.y, R);
      grad.addColorStop(0, `rgba(255,255,235,${0.5*fade})`);
      grad.addColorStop(0.65, `rgba(255,225,150,${0.3*fade})`);
      grad.addColorStop(1, `rgba(255,190,90,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.arc(ef.x, ef.y, R, a0, a1); ctx.closePath(); ctx.fill();
      // ② 两道斩击弧线从一侧扫到另一侧（刀锋走过的轨迹）
      const sweep = a0 + (a1 - a0) * Math.min(1, t / 0.45);
      ctx.strokeStyle = `rgba(255,255,255,${0.95*fade})`;
      ctx.lineWidth = 7*fade + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, R*0.97, a0, sweep); ctx.stroke();
      ctx.strokeStyle = `rgba(255,209,102,${0.85*fade})`;
      ctx.lineWidth = 15*fade + 1;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, R*0.72, a0, sweep); ctx.stroke();
      // ③ 扇形边界线（左右各一条，明确"角度到这儿为止"）
      ctx.strokeStyle = `rgba(255,235,180,${0.7*fade})`;
      ctx.lineWidth = 2;
      for(const a of [a0, a1]){
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x + Math.cos(a)*R, ef.y + Math.sin(a)*R); ctx.stroke();
      }
      ctx.restore();
    } else if(ef.type === 'dogult'){ // 🐶 野生狗奶大招「春秋邻域」：场地从中心不断放大的同心环（绿白）+ 中心绿光，最后爆炸
      const t = 1 - ef.life/ef.max;            // 0→1（放大进度）
      const cx = WW()/2, cy = WH()/2;
      const maxR = Math.hypot(WW(), WH())/2;
      ctx.save();
      for(let k=0;k<3;k++){
        const rr = maxR * Math.max(0, Math.min(1, t*1.25 - k*0.16));
        if(rr <= 2) continue;
        ctx.strokeStyle = `rgba(158,240,74,${0.55*(1-t)+0.2})`;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = `rgba(158,240,74,${0.14*(1-t)})`;
      ctx.beginPath(); ctx.arc(cx, cy, maxR*0.32*(0.5+t), 0, Math.PI*2); ctx.fill();
      ctx.restore();
    } else if(ef.type === 'dogboom'){ // 🐶 春秋邻域终结：全屏白闪 + 绿色冲击波环（秒杀/重创在 dogUltBoom 里已结算）
      const t = 1 - ef.life/ef.max;
      const cx = WW()/2, cy = WH()/2;
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${0.7*(1-Math.min(1,t/0.28))})`;
      ctx.fillRect(0,0,WW(),WH());
      const rr = ef.r * Math.min(1, t/0.5);
      ctx.strokeStyle = `rgba(158,240,74,${0.9*(1-t)})`;
      ctx.lineWidth = 14*(1-t)+2;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    } else if(ef.type === 'cardhand'){ // 🃏 卡牌大师出手：在身前亮一手 5 张牌（王炸全红 / 顺子描金；1.5 秒，前 65% 满显、后 35% 淡出；跟着玩家走）
      const t = 1 - ef.life/ef.max;             // 0→1
      // 跟随所属玩家（多人各看各的手牌；玩家对象没了就定格在原位）
      const host = (G.players && G.players[ef.seat]) || null;
      const hx = host ? host.x : ef.x, hy = host ? host.y : ef.y;
      const alpha = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35; // 先看牌，再谢幕
      const cw = 30, chh = 42, gap = 7;
      const n = (ef.hand || []).length || 5;
      const totW = n*cw + (n-1)*gap;
      // 起手小动画：五张牌从下往上"甩"到位（前 0.18 秒）
      const pop = Math.min(1, t/0.18);
      ctx.save();
      ctx.translate(hx, hy);
      ctx.globalAlpha = Math.max(0, alpha);
      for(let i = 0; i < n; i++){
        const c = ef.hand[i];
        const px = -totW/2 + i*(cw+gap) + cw/2;
        const py = -chh/2 - 30 - (ef.straight ? Math.sin(t*14 + i*0.7)*4 : 0) + (1 - pop)*14;
        drawPokerCard(ctx, px, py, cw, chh, c, { instakill: ef.instakill });
      }
      // 🃏 手牌类型文字（对子/三条/顺子/王炸…）写在牌组正上方，让玩家一眼看清这手牌
      const _lab = cmHandLabel(ef.hand);
      ctx.fillStyle = _lab.color;
      ctx.font = 'bold 15px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(_lab.text, 0, -chh/2 - 30 - chh/2 - 14 + (1 - pop)*14);
      ctx.restore();
    } else if(ef.type === 'plane'){ // 🃏 卡牌大师大招「飞机」：一沓扑克叠成的纸飞机沿瞄准线飞出（尾部拖牌影）
      const t = 1 - ef.life/ef.max;             // 0→1
      const fade = t < 0.85 ? 1 : (1 - t)/0.15;
      const s = 1 + t*0.35;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));
      ctx.translate(ef.x + Math.cos(ef.ang)*t*120, ef.y + Math.sin(ef.ang)*t*120);
      ctx.rotate(ef.ang);
      ctx.scale(s, s);
      // 机身：扑克牌折成的尖头三角（白底描黑边）
      ctx.fillStyle = '#fdfcf5'; ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(-16, -15); ctx.lineTo(-6, 0); ctx.lineTo(-16, 15); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // 机身压线（折痕）
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-16, -15); ctx.lineTo(-6, 0); ctx.lineTo(-16, 15); ctx.stroke();
      // 牌面红桃
      ctx.fillStyle = '#d43a3a'; ctx.font = 'bold 12px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('♥', 6, 0);
      // 尾迹：飘落的牌影
      for(let k = 0; k < 4; k++){
        const kt = t - k*0.06;
        if(kt <= 0) continue;
        ctx.save();
        ctx.translate(-Math.cos(ef.ang)*kt*120 - 20 - k*14, Math.sin(kt*9 + k)*7 - 4);
        ctx.rotate(-ef.ang + (k%2 ? 0.5 : -0.4));
        ctx.globalAlpha *= (0.5 - k*0.1);
        ctx.fillStyle = '#fdfcf5'; ctx.strokeStyle = 'rgba(43,43,43,0.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.rect(-10, -7, 20, 14); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    } else if(ef.type === 'planeboom'){ // 🃏 飞机拍下：面前锥形金色冲击（击退+眩晕+重创在 cmUltBoom 里已结算）
      const t = 1 - ef.life/ef.max;
      const a0 = ef.ang - ef.half, a1 = ef.ang + ef.half;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t);
      // 锥形填充（由浓转淡）
      const g = ctx.createRadialGradient(ef.x, ef.y, 20, ef.x, ef.y, ef.r*Math.min(1, t/0.6));
      g.addColorStop(0, 'rgba(255,236,170,0.55)');
      g.addColorStop(0.6, 'rgba(255,209,102,0.32)');
      g.addColorStop(1, 'rgba(255,209,102,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
      ctx.arc(ef.x, ef.y, ef.r*Math.min(1, t/0.6), a0, a1); ctx.closePath(); ctx.fill();
      // 前缘冲击波弧线
      ctx.strokeStyle = `rgba(255,209,102,${0.9*(1-t)})`;
      ctx.lineWidth = 8*(1-t)+2;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*Math.min(1, t/0.6), a0, a1); ctx.stroke();
      // 锥边
      ctx.strokeStyle = `rgba(255,236,170,${0.5*(1-t)})`;
      ctx.lineWidth = 2;
      for(const a of [a0, a1]){
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x + Math.cos(a)*ef.r, ef.y + Math.sin(a)*ef.r); ctx.stroke();
      }
      ctx.restore();
    } else if(ef.type === 'zap'){ // 连锁闪电：亮蓝折线（抖动）+ 白芯
      const fade = ef.life/ef.max;
      const mx = (ef.x1+ef.x2)/2 + (Math.random()-0.5)*10; // 中点随机抖动出折线感
      const my = (ef.y1+ef.y2)/2 + (Math.random()-0.5)*10;
      ctx.strokeStyle = `rgba(120,220,255,${0.9*fade})`;
      ctx.lineWidth = 4*fade + 1;
      ctx.beginPath(); ctx.moveTo(ef.x1, ef.y1); ctx.lineTo(mx, my); ctx.lineTo(ef.x2, ef.y2); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.9*fade})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ef.x1, ef.y1); ctx.lineTo(mx, my); ctx.lineTo(ef.x2, ef.y2); ctx.stroke();
    } else if(ef.type === 'laser'){
      const t = 1 - ef.life/ef.max;
      const lwv = visionZoom(); // 👁️视野扩大：激光绘制宽度与判定宽度同步缩放
      const a = angleTo({x:ef.x,y:ef.y}, {x:G.player.x,y:G.player.y});
      if(t < 0.6){
        // warning line to player's current position
        ctx.strokeStyle = `rgba(255,100,0,${0.3+Math.sin(G.time*30)*0.2})`;
        ctx.lineWidth = 3*lwv;
        ctx.setLineDash([10,10]);
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(G.player.x, G.player.y); ctx.stroke();
        ctx.setLineDash([]);
      } else if(ef.fireLife > 0){
        // 发射瞬间：粗激光
        ctx.strokeStyle = '#f80';
        ctx.lineWidth = 12*lwv;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x+Math.cos(a)*1500, ef.y+Math.sin(a)*1500); ctx.stroke();
      } else {
        // fading laser visual
        const fade = Math.max(0, ef.life / (ef.max*0.4));
        ctx.strokeStyle = `rgba(255,136,0,${fade*0.6})`;
        ctx.lineWidth = 8*fade*lwv;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.lineTo(ef.x+Math.cos(a)*1500, ef.y+Math.sin(a)*1500); ctx.stroke();
      }
    } else if(ef.type === 'meteor'){
      // 熔岩火雨：预警期闪烁橙红落点圈+从空中落下的熔岩弹，爆后消散火球
      const t = 1 - ef.life/ef.max;
      if(t < 0.7){
        const pulse = 0.5 + 0.5*Math.sin(G.time*16);
        ctx.fillStyle = `rgba(255,80,20,${0.10+0.12*pulse})`;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = `rgba(255,140,40,${0.4+0.4*pulse})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r, 0, Math.PI*2); ctx.stroke();
        const drop = 1 - t/0.7; // 熔岩弹从高空落向落点
        ctx.fillStyle = 'rgba(255,160,60,.9)';
        ctx.beginPath(); ctx.arc(ef.x, ef.y - 260*drop, 8, 0, Math.PI*2); ctx.fill();
      } else {
        const bt = (t-0.7)/0.3;
        ctx.fillStyle = `rgba(255,${Math.round(160-80*bt)},40,${0.8*(1-bt)})`;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, ef.r*(0.6+0.5*bt), 0, Math.PI*2); ctx.fill();
      }
    } else if(ef.type === 'magma'){
      if(ef.state === 'warn'){
        // ===== 预警阶段：沿5道岩浆路径画闪烁虚线预告 + Boss头顶感叹号 =====
        const pulse = 0.5 + 0.5*Math.sin(G.time*14);
        ctx.strokeStyle = `rgba(255,220,60,${0.35+0.35*pulse})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        for(const b of ef.beams){
          ctx.beginPath();
          ctx.moveTo(b.pts[0].x, b.pts[0].y);
          for(let i=1;i<b.pts.length;i++) ctx.lineTo(b.pts[i].x, b.pts[i].y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,230,80,${0.6+0.4*pulse})`;
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', ef.x, ef.y - 60);
      } else {
      // Z字型岩浆柱：加粗橙红发光柱体（外圈光晕+亮橙中圈+白热内核）+ 尖端熔岩火花
      for(const b of ef.beams){
        const segs = b.visSegs;
        if(!segs || segs.length === 0) continue;
        const pulse = 1 + Math.sin(G.time*16 + b.ang*3)*0.15;
        const bwv = visionZoom(); // 👁️视野扩大：岩浆柱绘制宽度与判定宽度同步缩放
        ctx.lineCap = 'round';
        for(const s of segs){
          // 外圈光晕（加粗）
          ctx.strokeStyle = `rgba(255,60,0,${0.30*pulse})`;
          ctx.lineWidth = 50*bwv;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          // 亮橙中圈
          ctx.strokeStyle = `rgba(255,150,30,${0.75*pulse})`;
          ctx.lineWidth = 28*bwv;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          // 白热内核
          ctx.strokeStyle = 'rgba(255,245,200,.95)';
          ctx.lineWidth = 9*bwv;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
        }
        ctx.lineCap = 'butt';
        // 尖端熔岩火花
        const last = segs[segs.length-1];
        ctx.fillStyle = `rgba(255,220,120,${0.6+0.3*Math.sin(G.time*24)})`;
        ctx.beginPath(); ctx.arc(last.x2, last.y2, 9*bwv, 0, Math.PI*2); ctx.fill();
      }
      }
    } else if(ef.type === 'flameSpray'){
      const fade = ef.life < 0.4 ? ef.life/0.4 : 1;
      const flicker = 0.85 + Math.sin(G.time*30)*0.15;
      const a1 = ef.aim - ef.halfAngle, a2 = ef.aim + ef.halfAngle;
      if(ef.state === 'warn'){
        // ===== 预警阶段：闪烁虚线锥形危险区 + Boss头顶感叹号（角度锁定提示即将喷射方向）=====
        const pulse = 0.5 + 0.5*Math.sin(G.time*12);
        ctx.save();
        ctx.fillStyle = `rgba(255,60,0,${0.10*pulse})`;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.arc(ef.x, ef.y, ef.range, a1, a2); ctx.closePath(); ctx.fill();
        // 弧形虚线描边
        ctx.strokeStyle = `rgba(255,220,60,${0.4+0.4*pulse})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(ef.x+Math.cos(a1)*ef.range, ef.y+Math.sin(a1)*ef.range);
        ctx.arc(ef.x, ef.y, ef.range, a1, a2);
        ctx.lineTo(ef.x, ef.y);
        ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
        // 两条侧边虚线段
        ctx.strokeStyle = `rgba(255,220,60,${0.35+0.35*pulse})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.lineTo(ef.x+Math.cos(a1)*ef.range, ef.y+Math.sin(a1)*ef.range); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y); ctx.lineTo(ef.x+Math.cos(a2)*ef.range, ef.y+Math.sin(a2)*ef.range); ctx.stroke();
        ctx.setLineDash([]);
        // Boss头顶感叹号
        ctx.fillStyle = `rgba(255,230,80,${0.6+0.4*pulse})`;
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', ef.x, ef.y - 60);
        ctx.restore();
      } else {
        // ===== 喷射阶段：火焰从Boss缓慢延伸（只画已延伸部分）+ 前端亮边 =====
        const R = Math.max(0.001, ef.extLen);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        // 外圈暗红光晕（已延伸范围）
        ctx.fillStyle = `rgba(255,50,0,${0.15*fade*flicker})`;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.arc(ef.x, ef.y, R, a1, a2); ctx.closePath(); ctx.fill();
        // 中圈亮橙
        ctx.fillStyle = `rgba(255,130,20,${0.30*fade*flicker})`;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.arc(ef.x, ef.y, R*0.72, a1, a2); ctx.closePath(); ctx.fill();
        // 近端白热核心
        ctx.fillStyle = `rgba(255,240,180,${0.45*fade*flicker})`;
        ctx.beginPath(); ctx.moveTo(ef.x, ef.y);
        ctx.arc(ef.x, ef.y, R*0.38, a1, a2); ctx.closePath(); ctx.fill();
        // 火焰前端亮边（延伸尖端）
        ctx.strokeStyle = `rgba(255,240,180,${0.55*fade})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ef.x, ef.y, R, a1, a2); ctx.stroke();
        ctx.restore();
        // 锥形边缘描边（到已延伸长度）
        ctx.strokeStyle = `rgba(255,100,20,${0.4*fade})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ef.x+Math.cos(a1)*R, ef.y+Math.sin(a1)*R);
        ctx.arc(ef.x, ef.y, R, a1, a2);
        ctx.lineTo(ef.x, ef.y);
        ctx.closePath(); ctx.stroke();
        // 满范围淡色虚线：提示完整危险区范围
        ctx.strokeStyle = `rgba(255,80,20,${0.12})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.moveTo(ef.x+Math.cos(a1)*ef.range, ef.y+Math.sin(a1)*ef.range);
        ctx.arc(ef.x, ef.y, ef.range, a1, a2);
        ctx.lineTo(ef.x, ef.y);
        ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if(ef.type === 'blackhole'){
      // ===== 黑洞：中心黑球 + 紫色吸积盘旋转光晕 + 吸入粒子效果 =====
      const r = ef.r;
      ctx.save();
      // 外围紫色引力场光晕
      const grad = ctx.createRadialGradient(ef.x, ef.y, r*0.2, ef.x, ef.y, r*1.8);
      grad.addColorStop(0, 'rgba(150,0,220,0.45)');
      grad.addColorStop(0.55, 'rgba(100,0,180,0.18)');
      grad.addColorStop(1, 'rgba(60,0,120,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r*1.8, 0, Math.PI*2); ctx.fill();
      // 吸积盘：3道旋转亮紫弧线
      ctx.strokeStyle = 'rgba(210,130,255,0.75)';
      ctx.lineWidth = 3;
      for(let i=0;i<3;i++){
        const start = G.time*2.2 + i*(Math.PI*2/3);
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, r*(0.85 + i*0.28), start, start + Math.PI*0.75);
        ctx.stroke();
      }
      // 被吸入的粒子流（从引力场边缘流向中心）
      for(let i=0;i<14;i++){
        const pa = i/14*Math.PI*2 + G.time*1.6;
        const pr = r*0.4 + (i%3)/3 * r*1.2;
        ctx.fillStyle = `rgba(220,150,255,${0.5 - (i%3)*0.13})`;
        ctx.beginPath(); ctx.arc(ef.x+Math.cos(pa)*pr, ef.y+Math.sin(pa)*pr, 1.8, 0, Math.PI*2); ctx.fill();
      }
      // 主体：纯黑圆 + 紫色描边
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#a4f'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r, 0, Math.PI*2); ctx.stroke();
      // 事件视界高光弧
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ef.x, ef.y, r*0.9, G.time*3, G.time*3+Math.PI); ctx.stroke();
      ctx.restore();
    }
  });
}

// ===== GAME LOOP =====
let lastTime = 0;
function moveCursor2(dt){ // 2P 光标移动：面键 8 方向步进 + 右摇杆平滑瞄准（仅游戏中驱动）
  if(NET.state === 'connected' && NET.role === 'host'){ // 🌐联机：2P 瞄准方向 = 手机摇杆方向，光标落在其前方
    const q = G.players[1];
    if(q && !q.dead){
      const a = NET.remote.a || [1,0];
      const al = Math.hypot(a[0], a[1]) || 1;
      G.cursor2.x = clamp(q.x + a[0]/al*260, 0, WW());
      G.cursor2.y = clamp(q.y + a[1]/al*260, 0, WH());
    }
    return;
  }
  // 🎮 手柄右摇杆 → 平滑瞄准（本地真人 2P 独占手柄时）：右摇杆经过双杆串扰解耦
  //   （GP.rightStickClean：去掉左摇杆漏进来的分量，确保「左杆只动角色、右杆只动光标」互不串），
  //   死区 0.18、平方缓动（轻推精细、推到底快）；与面键步进并存，玩家任选。
  if(GP.connected && multiOn() && !isAISeat(1) && !netIsHostLinked()){
    const rc = GP.rightStickClean();
    const v = GP.cursorVel(rc.x, rc.y);
    if(v.vx || v.vy){
      G.cursor2.x = clamp(G.cursor2.x + v.vx*dt, 0, WW()); // 👁️视野扩大：光标范围随世界扩大
      G.cursor2.y = clamp(G.cursor2.y + v.vy*dt, 0, WH());
    }
  }
  const ck = GP.cursorKeys();
  if(ck.dx || ck.dy){
    const clen = Math.hypot(ck.dx, ck.dy) || 1;
    const cspd = 460; // 数字键控光标：固定速度 px/s（对角线归一化）
    G.cursor2.x = clamp(G.cursor2.x + ck.dx/clen*cspd*dt, 0, WW()); // 👁️视野扩大：光标范围随世界扩大
    G.cursor2.y = clamp(G.cursor2.y + ck.dy/clen*cspd*dt, 0, WH());
  }
}
function loop(ts){
  const dt = Math.max(0, Math.min(0.05, (ts - lastTime)/1000)) || 0; // 钳制：不允许负 dt（时间戳回退会导致计时器倒涨）
  lastTime = ts;
  G.frame = (G.frame || 0) + 1; // 📱 每帧计数：联机 2P 技能边沿检测按帧去重
  GP.poll(); // 手柄轮询（主界面用于启用双人按钮，游戏中驱动2P）
  KEYBINDS.pollGpListen(); // 按键设置：监听中扫描手柄按键（点槽位后按手柄键即绑定）
  if(G.state === 'menu') update2PBtn();
  if(G.state === 'playing' && !G.paused){
    // 双人挑战因子：位置错乱（每30秒互换位置）/ 生命链接（队友阵亡期间每秒回1%最大生命）
    if(multiOn()){
      if(CM().swap){
        G.swapT = (G.swapT === undefined ? 30 : G.swapT - dt);
        if(G.swapT <= 0){
          G.swapT = 30;
          const [a, b2] = G.players;
          if(!a.dead && !b2.dead){
            const tx = a.x, ty = a.y;
            a.x = b2.x; a.y = b2.y; b2.x = tx; b2.y = ty;
            spawnParticles(a.x, a.y, '#f0f', 10); spawnParticles(b2.x, b2.y, '#f0f', 10);
          }
        }
      }
      if(CM().lifeLink){
        const deadP = G.players.find(q => q.dead);
        if(deadP){
          const aliveP = G.players.find(q => !q.dead);
          if(aliveP) aliveP.hp = Math.min(aliveP.maxHp, aliveP.hp + aliveP.maxHp * 0.01 * dt);
        }
      }
    }
    G.time += dt;
    if(G.cutscene){
      // ===== 剧情演出：全场冻结（玩家不可移动/不能造成或受到伤害，Boss与小怪暂停攻击移动且锁血），仅剧情推进 =====
      updateCutscene(dt);
    } else {
    // update slimes first (sets slowed flag + dot damage), then player
    G.players.forEach(p => p.slowed = false);
    G.slimes.forEach(s => s.update(dt));
    G.slimes = G.slimes.filter(s => !s.dead);
    // update players（双人：阵亡玩家跳过更新；2P 光标由手柄数字键 0=↑1=→2=↓3=← 驱动）
    G.players.forEach(p => { if(!p.dead && !p._tutHidden) p.update(dt); }); // _tutHidden：教程 2P 阶段隐藏 1P（不更新=不移动不开火）
    // 2P 光标由手柄数字键 0=↑1=→2=↓3=← 驱动（仅当 2P 是真人；AI 座位的光标由 AI.aim 直接锁定目标）
    if(multiOn() && G.players[1] && !G.players[1].dead && !isAISeat(1)) moveCursor2(dt);
    if(G.tutorial) updateTutorial(); // 新手教程状态机（练习场，无波次）
    updateBurns(dt); // 灼烧弹 DoT 结算（点燃的敌人持续掉血）
    updateDogDots(dt); // 🐶 狗奶「奶住」DOT 结算（命中敌人持续掉血）
    updateBombZones(dt); // 💣 轰炸区推进（落点预警 → 爆炸结算）
    updateTornadoes(dt); // 🌀 龙卷风推进（吸怪 + 持续伤害 → 风停击退）
    updateTurrets(dt);   // ⚙️ 工程师炮台推进（索敌 → 自动开火；超寿命消亡）
    updateMinions(dt); // ⚔️ 将军的小兵推进（锁敌追怪 / 近身突刺 / 挨咬掉血）
    updateWalls(dt); // 🪨 魔法师土墙掩体（拦敌方弹幕 / 把怪顶在墙外 / 次数耗尽塌下消失）
    // spawn enemies
    if(!G.tutorial && !G.pvp && !G.inBossWave && G.waveEnemiesLeft > 0){
      if(!isFinite(G.spawnTimer) || G.spawnTimer > 5) G.spawnTimer = 0.3; // 看门狗：刷怪计时器异常（NaN/超大）立即恢复
      G.spawnTimer -= dt;
      if(G.spawnTimer <= 0){
        spawnEnemy();
        G.waveEnemiesLeft--;
        // 🧟 尸潮：出怪节奏拉满（0.5s→0.10s，随波次再压缩）—— 怪是"涌"进来的，不是"走"进来的
        G.spawnTimer = G.horde ? Math.max(0.10, 0.5 - G.wave*0.015) : Math.max(0.3, 1.5 - G.wave*0.03);
      }
    }
    // check wave clear
    if(!G.tutorial && !G.pvp && !G.inBossWave && G.waveEnemiesLeft <= 0 && G.enemies.filter(e=>!e.isBullet&&!e.dead).length === 0){
      startWave(G.wave + 1);
    }
    // 🧟 尸潮连杀计时：2.5s 内没有新击杀 → 断档归零（连杀加伤随之消失）
    updateHordeCombo(dt);
    // update bullets
    G.bullets.forEach(b => { b.px = b.x; b.py = b.y; });
    G.bullets.forEach(b => b.update(dt));
    G.bullets = G.bullets.filter(b => !b.dead);
    // update enemies
    // 敌人更新：暴击血条颤动计时 / 暴击致死颤动（颤动期间暂停AI，结束才真正死亡）
    G.enemies.forEach(e => {
      if(e.critShake > 0) e.critShake -= dt;
      if(e.dying){
        e.deathShake -= dt;
        if(e.deathShake <= 0) e.die();
        return;
      }
      const _rx = e.x, _ry = e.y; // 🧊 冰冻定身（Boss 专属）：先记下更新前的位置
      e.update(dt);
      if(e.rooted > 0){
        // 🧊 被冰霜定身的 Boss：**只禁移动、不禁出招** —— 位移整帧回滚（含击退），
        //    但招式/弹幕/光束的生产逻辑已经照常跑完了 → "冻住脚，冻不住嘴"
        e.x = _rx; e.y = _ry; e.kbx = 0; e.kby = 0;
        e.rooted -= dt;
      }
    });
    updateSpringFlyers(dt); // 🥊 弹簧拳弹飞中的敌人：位移接管 + 墙撞结算（在所有敌人 update 之后）
    // collisions
    handleCollisions();
    // remove dead
    G.enemies.forEach(e => { // 防卡死：所有敌怪（含特殊AI）钳制在屏幕附近，防止卡出屏外导致清波判定永远不过
      if(!e.isBullet && !e.dead && !e.dying){
        e.x = clamp(e.x, -70, WW()+70); // 👁️视野扩大：防卡死钳制按扩大后世界
        e.y = clamp(e.y, -70, WH()+70);
      }
    });
    resolveEntityOverlaps(); // 怪间不重合 + 玩家推开远程/无近战怪（boss/近战由各自接触规则处理）
    G.enemies = G.enemies.filter(e => !e.dead);
    // update gems
    G.gems.forEach(g => g.update(dt));
    G.gems = G.gems.filter(g => !g.dead);
    // 🪨 投石：地图石块刷新 + 抛物线飞行中的石头（落地才结算伤害）
    updateStones(dt);
    updateStoneShots(dt);
    updateSticks(dt); // 🐣 菜鸟木棍（飞行 → 落地 → 绊倒 / 10 秒或踩 4 次后消失）
    updateBoomerangs(dt); // 🪃 回旋镖（甩出 → 贴身环绕 5 秒 → 收回接住；三段各自结算伤害）
    // particles
    G.particles.forEach(p => {
      p.x += p.vx*dt; p.y += p.vy*dt;
      p.vx *= 0.92; p.vy *= 0.92;
      p.life -= dt;
    });
    // 🧹💨 扫帚尾迹：光斑原地淡出 / 金火星飘散减速（纯视觉）
    if(G.broomTrail && G.broomTrail.length){
      G.broomTrail.forEach(w => {
        w.life -= dt;
        if(w.type === 'spark'){ w.x += w.vx*dt; w.y += w.vy*dt; w.vx *= 0.90; w.vy *= 0.90; }
      });
      G.broomTrail = G.broomTrail.filter(w => w.life > 0);
    }
    G.particles = G.particles.filter(p => p.life > 0);
    // effects
    updateEffects(dt);
    }
    // flash 白闪衰减（剧情结束时全屏白闪淡出）
    if(G.flash > 0) G.flash = Math.max(0, G.flash - dt*2.5);
    // screen shake
    if(G.screenShake > 0) G.screenShake -= dt*40;
    updateUI();
  }
  // ⚔️ 单挑胜利动画：战斗全面冻结，只推进专属庆祝演出（播完自动弹结算画面）
  //    HUD 也要继续刷新：不然败者的血条会冻在挨打前的数值（看着还满血却已经输了）
  if(G.state === 'pvpwin'){ updatePvpVictory(dt); updateUI(); }
  // ===== RENDER =====
  // 🌿 世界3 专属战场底色：暗绿腐林（世界1 深灰黑 / 世界2 虚空紫黑 / 世界3 腐林墨绿，一眼分清在哪）
  ctx.fillStyle = (G.world === 3) ? '#08120a' : '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  // grid background
  ctx.strokeStyle = (G.world === 3) ? 'rgba(50,90,55,.5)' : 'rgba(40,40,60,.5)';
  ctx.lineWidth = 1;
  const gs = 50;
  ctx.save();
  if(G.screenShake > 0){
    ctx.translate(rand(-G.screenShake,G.screenShake), rand(-G.screenShake,G.screenShake));
  }
  // 视野扩大（👁️）：以左上角为锚等比缩小整个世界（网格/敌人/玩家/Boss/经验/子弹/弹幕/激光全同步），世界[0,WW]×[0,WH]精确铺满全屏
  const vz = visionZoom();
  // 👁️ 视角：正常=镜头锚在世界中心（世界铺满屏幕）；跟随=镜头锚在玩家（玩家居中，边缘画墙）
  const cam = (G.viewMode === 'follow' && G.player) ? camFocus() : { x: WW()/2, y: WH()/2 };
  ctx.translate(W/2, H/2);
  ctx.scale(vz, vz);
  ctx.translate(-cam.x, -cam.y);
  for(let x=0;x<WW();x+=gs){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,WH()); ctx.stroke(); } // 👁️视野扩大：网格铺满扩大后世界
  for(let y=0;y<WH();y+=gs){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(WW(),y); ctx.stroke(); }
  // 👁️ 跟随视角：竞技场边界可视化墙壁（玩家被钳制在墙内，墙外是虚空）
  if(G.viewMode === 'follow' && G.player) drawArenaWalls();
  // 新手教程目标光圈（呼吸闪烁的虚线圆）
  if(G.tutorial && G.tutorial.ring){
    const rg = G.tutorial.ring;
    ctx.strokeStyle = '#4af'; ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.globalAlpha = 0.7 + Math.sin(G.time*5)*0.3;
    ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1; ctx.setLineDash([]);
  }
  // draw entities
  if(G.player){
    drawBroomTrail(); // 🧹💨 扫帚尾迹（最底层：地面层之下，纯视觉）
    G.particles.forEach(p => {
      ctx.globalAlpha = p.life/p.max;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    G.slimes.forEach(s => s.draw()); // 粘液陷阱（地面层）
    drawBombZones(); // 💣 轰炸区（地面层：区域边界 + 落点预警圈）
    drawTurrets();   // ⚙️ 工程师炮台（地面层：底座 + 转塔 + 炮管 + 寿命环）
    drawVehicleSites(); // 🚧 工程师战车工地（地面层：脚手架 + 半成品 + 施工进度环 + 倒计时）
    drawTornadoes(); // 🌀 龙卷风（地面层：风眼光晕 + 旋转气流 + 吸怪范围）
    G.gems.forEach(g => g.draw());
    drawStones(); // 🪨 投石角色的地图石块（地面层：长方形石 + 投影 + 超载警示圈）
    drawSticks(); // 🐣 菜鸟木棍（地面层：飞行中的旋转木棍 + 落地绊脚木棍）
    G.enemies.forEach(e => { if(!e.isBullet) e.draw(); });
    drawStoneTags(); // 🪨 怪的"石头颜色"标记（画在怪身上，玩家照它打同色石）
    G.bullets.forEach(b => b.draw());
    drawBoomerangs(); // 🪃 回旋镖（飞行层：环绕轨迹圈 + 旋转的双刃镖身 + 环绕金 / 收回青）
    drawStoneShots(); // 🪨 投石角色的抛物线飞行（影子 + 落点预告圈 + 升起的石头）
    G.enemies.forEach(e => { if(e.isBullet) e.draw(); });
    drawBurnFx(); // 灼烧特效：燃烧敌人火苗+火星（画在敌人层之上、玩家层之下）
    drawWalls(); // 🪨 魔法师土墙掩体（地面障碍层：画在玩家之前，站在墙后的角色不会被挡住）
    (multiOn() ? G.players : [G.player]).forEach(p => { if(p && !p._tutHidden) p.draw(); });
    drawMinions(); // ⚔️ 将军的小兵（玩家层：银甲小兵锁敌突刺，头顶血条）
    drawStoneHUD(); // 🪨 投石玩家：手里那块石头 + 装填进度环 + 超载提示（玩家层）
    // 2P/3P 瞄准光标（十字环，与系统鼠标区分；多人模式逐个座位绘制，颜色区分）
    if(multiOn() && G.state === 'playing'){
      const CUR_COLOR = ['#fff', '#fff', '#4ade80'];
      G.players.forEach((p, st) => {
        if(st === 0 || !p || p.dead) return;
        const c = cursorOf(st); if(!c) return;
        ctx.save();
        ctx.strokeStyle = CUR_COLOR[st] || '#fff'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(c.x, c.y, 11, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(c.x-16, c.y); ctx.lineTo(c.x-6, c.y);
        ctx.moveTo(c.x+6, c.y); ctx.lineTo(c.x+16, c.y);
        ctx.moveTo(c.x, c.y-16); ctx.lineTo(c.x, c.y-6);
        ctx.moveTo(c.x, c.y+6); ctx.lineTo(c.x, c.y+16);
        ctx.stroke();
        ctx.fillStyle = CUR_COLOR[st] || '#fff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText(seatLabel(p), c.x + 14, c.y - 12);
        ctx.restore();
      });
    }
    drawCutscene(); // 剧情演出特效（残影/感叹号/提示文字，画在实体上层）
    drawEffects(); // 爆炸冲击波 / Boss激光特效（渲染阶段绘制，不被清屏覆盖）
    drawFloaters(); // 🔢 伤害数字（升起后掉落消失）
    drawPvpVictory(); // ⚔️ 单挑胜利动画（每个英雄一套专属庆祝，画在最上层）
    // 激光光束（画在最上层，完整可见）
    G.enemies.forEach(e => { if(e.isLaser && !e.dead) e.drawBeam(); });
    // 小怪之怒激光光束（fire阶段）
    if(G.wrathBoss && !G.wrathBoss.dead && G.wrathBoss.laserState === 'fire') G.wrathBoss.drawLaserBeam();
    // 🔷 棱光穹主光束 + 光柱（纯激光 Boss，全部攻击都在这一层绘制）
    if(G.boss && G.boss.isLaserBoss && !G.boss.dead) G.boss.drawBeams();
    // ⚔ 斩铁剑皇范围预警（扇形前摇 / 回旋剑圈 / 突进轨迹，与判定同参数）
    if(G.boss && G.boss.isBladeBoss && !G.boss.dead) G.boss.drawBladeFx();
  }
  // 👁️ 还原镜头变换（抖动+缩放+镜头平移）：白闪/暂停遮罩以屏幕坐标绘制，不受镜头影响
  ctx.restore();
  // 全屏白闪（剧情高潮白光一瞬间，覆盖所有画面）
  if(G.flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, G.flash)})`;
    ctx.fillRect(0, 0, W, H);
  }
  // 暂停遮罩
  if(G.paused){
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('已暂停', W/2, H/2 - 15);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('点击右上角 ⏸ 按钮继续', W/2, H/2 + 25);
  }
  requestAnimationFrame(loop);
}

// ===== CHALLENGE MODE（挑战模式：开局随机 1 增益 + 2 减益，修正因子全局生效） =====
const DEF_CM = { dmgMul:1, speedMul:1, xpMul:1, takenMul:1, rateMul:1, enemySpdMul:1, magnetMul:1, maxHpMul:1, killHeal:0, gifted:false, madness:false, reroll:false, swap:false, empathy:false, lifeLink:false, hug:false, soulBond:false, teach:false, fake:false, mods:[] };
const CM = () => { // 统一取修正因子（普通模式/测试环境退回默认值）；双人返回团队视图
  const c = G.cmod;
  const base = !c ? DEF_CM
    : (c.isCoop ? { ...DEF_CM, enemySpdMul: c.enemySpdMul, swap: !!c.swap, empathy: !!c.empathy, lifeLink: !!c.lifeLink, hug: !!c.hug, soulBond: !!c.soulBond, teach: !!c.teach } : c);
  const cm = comboMul(); // 🧟 尸潮连杀加伤（无连杀时恒 1 → 原样返回，零行为变化）
  return cm === 1 ? base : { ...base, dmgMul: base.dmgMul * cm };
};
function pCM(p){ // 玩家实际生效的修正 = 团队/全局因子 + 个人因子（数值叠乘、布尔取或）
  const base = { ...CM() };
  const pc = p && p.cmod;
  if(!pc) return base;
  for(const k in base){
    if(k === 'mods' || k === 'enemySpdMul') continue; // 敌速属全局，已在 CM() 结算，避免双计
    if(typeof base[k] === 'number' && typeof pc[k] === 'number') base[k] = base[k] * pc[k];
    else if(base[k] === false && pc[k] === true) base[k] = true;
  }
  return base;
}
const CH_BUFFS = [
  { id:'rage',   icon:'💪', name:'强大战意', desc:'子弹伤害 +30%',                 apply(c){ c.dmgMul = 1.3; } },
  { id:'boots',  icon:'👟', name:'轻装上阵', desc:'移动速度 +25%',                 apply(c){ c.speedMul = 1.25; } },
  { id:'lucky',  icon:'⭐', name:'知识渊博', desc:'经验获取 +30%',                 apply(c){ c.xpMul = 1.3; } },
  { id:'vamp',   icon:'🦇', name:'刀刀吸血', desc:'每次击杀回复 1 点生命',         apply(c){ c.killHeal = 1; } },
  { id:'iron',   icon:'🛡️', name:'不死之身', desc:'受到伤害 -20%',                 apply(c){ c.takenMul = 0.8; } },
  { id:'gifted', icon:'🌟', name:'天赋异禀', desc:'开局前可从所有技能中额外选择 2 个', apply(c){ c.gifted = true; } },
  { id:'reroll', icon:'🎲', name:'重选机会', desc:'每次升级选技能时，可以刷新一次候选技能', apply(c){ c.reroll = true; } },
];
const CH_DEBUFFS = [
  { id:'fragile', icon:'🩸', name:'易伤体质', desc:'受到伤害 +25%',             apply(c){ c.takenMul = 1.25; } },
  { id:'chains',  icon:'⛓️', name:'体力耗尽', desc:'移动速度 -20%',             apply(c){ c.speedMul = 0.8; } },
  { id:'sluggish',icon:'🐢', name:'反应迟钝', desc:'射击间隔 +25%（射速降低）', apply(c){ c.rateMul = 1.25; } },
  { id:'curse',   icon:'📉', name:'新手上路', desc:'经验获取 -20%',             apply(c){ c.xpMul = 0.8; } },
  { id:'frenzy',  icon:'🔥', name:'敌群狂暴', desc:'敌人移动速度 +15%（双人：只有锁定你的敌人才加速）',
    coopDesc:'只有「锁定你」的敌人才会移动速度 +15%（追队友的那些照常）', apply(c){ c.enemySpdMul = 1.15; } },
  { id:'nomagnet',icon:'🧲', name:'磁力失效', desc:'磁吸彻底失效，只有身体碰到经验才算捡到（学习拾取距离可逐级恢复）', apply(c){ c.magnetMul = 0; } },
  { id:'glass',   icon:'💔', name:'身体虚弱', desc:'最大生命 -30%',             apply(c){ c.maxHpMul = 0.7; } },
  { id:'madness', icon:'🌀', name:'精神错乱', desc:'升级时无法自选技能，随机习得一个', apply(c){ c.madness = true; } },
  { id:'fake',    icon:'🎭', name:'骗人', desc:'升级三选一里必有 1 张假技能：等级照涨，数值一点不变（选完才告诉你「骗人！！」）', apply(c){ c.fake = true; } },
];
// 🎭 「骗人」因子（用户 2026-10-07 定稿）：升级三选一里**必有 1 张**是假卡（不是 20% 概率受骗）
//    假卡只涨"显示的等级"（fakeLv），不产生任何数值变化；候选不足 3 张时照样出 1 张假的
const FAKE_PER_PICK = 1;
// 双人挑战专属因子（只在双人模式抽取，全队生效）
const CH_COOP_DEBUFFS = [
  { id:'swap',    icon:'🔀', name:'位置错乱', desc:'每 30 秒两位玩家位置互换',         apply(c){ c.swap = true; }, coop:true },
  { id:'empathy', icon:'💔', name:'共感疼痛', desc:'一方受伤，另一方承受 30% 同额伤害', apply(c){ c.empathy = true; }, coop:true },
  { id:'soulbond',icon:'🌍', name:'灵魂绑定', desc:'两人相距超过 420px 时，双方每秒流失 2.5% 最大生命', apply(c){ c.soulBond = true; }, coop:true },
];
const CH_COOP_BUFFS = [
  { id:'lifelink', icon:'🔗', name:'生命链接', desc:'队友阵亡期间，你每秒回复 1% 最大生命', apply(c){ c.lifeLink = true; }, coop:true },
  { id:'hug',      icon:'💞', name:'相濡以沫', desc:'两人相距 150px 内时，双方每秒回复 2% 最大生命', apply(c){ c.hug = true; }, coop:true },
  { id:'teach',    icon:'🎓', name:'教学相长', desc:'一方升级时，另一方回复 15% 最大生命', apply(c){ c.teach = true; }, coop:true },
];
// 词条描述：个人因子在双人模式下用「只作用在自己身上」的口径（如敌群狂暴=只加速锁你的怪）
function modDesc(m, coopPersonal){ return (coopPersonal && m.coopDesc) ? m.coopDesc : m.desc; }
function rollPersonalCmod(){ // 个人随机因子：1 增益 + 2 减益（普通池，互不重复）
  const c = { ...DEF_CM, mods:[] };
  const buff = CH_BUFFS[Math.floor(Math.random() * CH_BUFFS.length)];
  const pool = [...CH_DEBUFFS];
  const d1 = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  const d2 = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  [buff, d1, d2].forEach(m => { c.mods.push(m); m.apply(c); });
  return c;
}
function rollChallenge(coop, nPlayers){ // 多人：每人独立抽 1增益+2减益，再全队抽 1 个团队专属因子（可增可减）
  if(!(coop && G.coop)){
    const c = rollPersonalCmod(); // 单人：结构与旧版一致（mods 3 词条全局生效）
    G.giftPicks = c.gifted ? [] : null; // 天赋异禀：开局前额外选 2 个技能
    return c;
  }
  const n = Math.max(2, nPlayers || 2); // 👥 双人=2 份个人因子，三人=3 份
  const team = (() => {
    const coopPool = [...CH_COOP_BUFFS, ...CH_COOP_DEBUFFS];
    const t = coopPool[Math.floor(Math.random() * coopPool.length)];
    const tc = { ...DEF_CM, mods:[t] };
    t.apply(tc);
    return tc;
  })();
  const out = {
    isCoop: true, team,
    enemySpdMul: 1, // 多人：敌速不再全局叠乘 —— 按「怪锁定的玩家」各自的因子实时结算（enemySpdMulFor）
    swap: team.swap, empathy: team.empathy, lifeLink: team.lifeLink,
    hug: team.hug, soulBond: team.soulBond, teach: team.teach,
  };
  G.giftPicks = {};
  for(let i = 1; i <= n; i++){
    const pc = rollPersonalCmod();
    out['p' + i] = pc;
    G.giftPicks[i] = pc.gifted ? [] : null; // 天赋异禀：抽到者各自选 2 个
  }
  return out;
}
function cmSeats(c){ // 挑战模式里个人因子的份数（双人=[1,2]，三人=[1,2,3]）
  const out = [];
  for(let i = 1; i <= 4; i++) if(c && c['p' + i]) out.push(i);
  return out;
}
function magnetEffMul(pl){ // 实际生效的磁吸倍率：磁力失效时按拾取距离技能等级逐级恢复（0级=0，满级=1）
  const owner = pl || G.player;
  const c = pCM(owner);
  if(c.magnetMul !== 0) return c.magnetMul;
  const sk = ALL_SKILLS.find(s => s.id === 'magnet');
  const lv = (owner && owner.skills.magnet) || 0;
  return sk ? lv / sk.max : 0;
}
function healOnKill(ownerIdx){ // 挑战模式吸血：击杀回血（按子弹归属玩家的个人因子结算；普通怪/粘液怪/Boss 通用）
  const P = (multiOn() && Number.isInteger(ownerIdx)) ? G.players[ownerIdx] : G.player;
  if(!P || P.dead) return;
  const heal = pCM(P).killHeal;
  if(heal > 0) P.hp = Math.min(P.maxHp, P.hp + heal);
}
function giftNeeded(){ // 开局需选的技能总数（抽到天赋异禀者每人 2 个）
  const c = G.cmod; if(!c) return 0;
  if(c.isCoop) return cmSeats(c).filter(i => c['p'+i].gifted).length * 2;
  return c.gifted ? 2 : 0;
}
function giftPickedCount(){ // 已选个数
  const c = G.cmod; if(!c) return 0;
  if(c.isCoop) return cmSeats(c).reduce((s,i) => s + ((G.giftPicks && G.giftPicks[i]) ? G.giftPicks[i].length : 0), 0);
  return (G.giftPicks || []).length;
}
function toggleGiftPick(id, btnEl, who){ // 天赋异禀：点选/取消一个开局技能（双人按玩家各选各的，每人最多 2 个）
  if(G.cmod && G.cmod.isCoop){
    const arr = (G.giftPicks && G.giftPicks[who]) || (G.giftPicks[who] = []);
    const idx = arr.indexOf(id);
    if(idx >= 0){ arr.splice(idx, 1); btnEl.classList.remove('picked'); }
    else {
      if(arr.length >= 2) return; // 该玩家已选满 2 个
      arr.push(id); btnEl.classList.add('picked');
    }
  } else {
    const idx = G.giftPicks.indexOf(id);
    if(idx >= 0){ G.giftPicks.splice(idx, 1); btnEl.classList.remove('picked'); }
    else {
      if(G.giftPicks.length >= 2) return; // 已选满 2 个
      G.giftPicks.push(id); btnEl.classList.add('picked');
    }
  }
  const go = document.getElementById('challenge-go');
  const done = giftPickedCount(), need = giftNeeded();
  go.textContent = done < need ? `选择 2 个技能（${done}/${need}）` : '开战！';
}
function showChallengePanel(){ // 开局展示抽到的词条，点击开战才解除暂停
  const panel = document.getElementById('challenge-panel');
  const box = document.getElementById('challenge-mods');
  const isBuff = m => CH_BUFFS.includes(m) || CH_COOP_BUFFS.includes(m);
  const modHtml = (m, coopPersonal) => `<div class="ch-mod ${isBuff(m) ? 'buff' : 'debuff'}"><span class="ch-icon">${m.icon}</span><span class="ch-name">${m.name}</span><span class="ch-desc">${modDesc(m, coopPersonal)}</span></div>`;
  const c = G.cmod;
  if(c.isCoop){
    // 个人栏用 coop 口径描述（如敌群狂暴=只加速锁你的怪），全队栏用通用描述
    const col = (title, color, mods, coopPersonal) => `<div class="ch-col"><div class="set-title" style="color:${color}">${title}</div>${mods.map(m => modHtml(m, coopPersonal)).join('')}</div>`;
    box.className = 'coop'; // 横排三栏，防止双天赋异禀时面板纵向超出屏幕
    const SEAT_COLORS = ['#8cf', '#f84', '#4ade80'];
    const perCols = cmSeats(c).map(i => col(SEAT_NAMES[i-1] + ' 个人因子', SEAT_COLORS[i-1] || '#ccc', c['p'+i].mods, true)).join('');
    box.innerHTML = perCols + col((cmSeats(c).length > 2 ? '三人' : '双人') + '因子（全队生效）', '#fc0', c.team.mods, false);
    // 提示行放在词条栏外面（块级一行），不挤进三栏 flex 里
    const note = document.getElementById('ch-note');
    if(note){
      note.textContent = '个人因子只作用在自己身上：🔥敌群狂暴只会加速「锁定你」的敌人，追队友的照常速度';
      note.classList.remove('hidden');
    }
  } else {
    box.className = '';
    box.innerHTML = c.mods.map(m => modHtml(m, false)).join('');
    const note = document.getElementById('ch-note');
    if(note) note.classList.add('hidden');
  }
  // 天赋异禀：面板里列出全部技能供选 2 个（单人 1 份；双人抽到者各 1 份、各选各的）
  const giftBox = document.getElementById('gift-pick-wrap');
  const giftedWho = c.isCoop ? cmSeats(c).filter(i => c['p'+i].gifted) : (c.gifted ? [0] : []);
  if(giftedWho.length){
    giftBox.classList.remove('hidden');
    giftBox.innerHTML = '';
    giftedWho.forEach(i => {
      const block = document.createElement('div');
      block.className = 'gift-block'; // 双人都抽到天赋异禀时两块并排，不纵向堆叠
      const title = document.createElement('div');
      title.className = 'set-title';
      title.textContent = `🌟 天赋异禀${c.isCoop ? ' · ' + (SEAT_NAMES[i-1] || ('P'+i)) : ''}：任选 2 个技能（点击选择）`;
      block.appendChild(title);
      const grid = document.createElement('div');
      grid.className = 'gift-grid';
      grid.setAttribute('data-who', i);
      block.appendChild(grid);
      giftBox.appendChild(block);
      const owner = (G.players && (c.isCoop ? G.players[i-1] : G.players[0])) || G.player; // 按该玩家角色列技能（剑士列近战技能）
      skillsFor(owner).forEach(sk => {
        const d = document.createElement('div');
        d.className = 'gift-cell';
        d.innerHTML = `<span class="g-icon">${sk.icon}</span><span class="g-name">${sk.name}</span>`;
        d.onclick = () => toggleGiftPick(sk.id, d, i);
        grid.appendChild(d);
      });
    });
  } else {
    giftBox.classList.add('hidden');
    giftBox.innerHTML = '';
  }
  const go = document.getElementById('challenge-go');
  go.textContent = giftNeeded() > 0 ? `选择 2 个技能（0/${giftNeeded()}）` : '开战！';
  panel.classList.remove('hidden');
  G.challengePanelOpen = true; // 面板打开期间 ⏸ 不响应（防面板后游戏偷跑）
}
function resumeChallenge(){ // 点击"开战"：关面板、解除暂停（天赋异禀必须先选满 2 个技能）
  const c = G.cmod;
  if(giftPickedCount() < giftNeeded()) return;
  const applyGifts = (ids, targets) => ids.forEach(id => {
    const sk = skillById(id);
    targets.forEach(p => {
      p.skills[id] = (p.skills[id]||0) + 1;
      sk.apply(p);
    });
  });
  if(c.isCoop){
    cmSeats(c).forEach(i => { // 天赋异禀：谁抽到归谁，各自获得自己选的技能
      const ids = (G.giftPicks && G.giftPicks[i]) || [];
      if(ids.length && G.players[i-1]) applyGifts(ids, [G.players[i-1]]);
    });
  } else if(c.gifted){
    applyGifts(G.giftPicks || [], activePlayers());
  }
  updateSkillBar();
  document.getElementById('challenge-panel').classList.add('hidden');
  G.challengePanelOpen = false; // 面板关闭：恢复 ⏸ 响应
  G.paused = false; hidePauseHome(); // 直接解除暂停同步收起「返回主页」按钮（防⏸双击后点开战导致按钮残留）
}

// ===== GAME STATE FUNCTIONS =====
function startAI2P(){ // 🤖 与 AI 组队：先进选角面板（1P 是你、2P 是 AI，两边都能选）
  openHeroPick('ai2p');
  G._pickHero2 = 'gunner'; // AI 队友默认射手（走位保持距离，近战/激光也能选）
  paintHeroPick();
}
function launchAI2P(){ // 🤖 选好角色后真正开局：多人模式 + 内置 AI 接管 2P（选角确认 / ?ai2p=1 直启都走这里）
  G._wantAI2P = true;
  try { startGame(false, true); } finally { G._wantAI2P = false; }
  try { // 开局横幅提示（复用阵亡/复活用的同一条 toast）
    const el = document.getElementById('coop-toast');
    if(el){
      el.innerHTML = '🤖 AI 队友已加入 2P —— 一起打！';
      el.style.display = 'block'; el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 500); }, 2600);
    }
  } catch(e){}
}
// ===== 👥 三人模式（1P 键鼠 + 2P 手柄 + 3P AI）=====
function startTrio(){ // 进选角面板（三栏：你 / 手柄队友 / AI）
  openHeroPick('trio');
  G._pickHero3 = G.hero3 || 'gunner'; // 3P（AI）默认射手
  paintHeroPick();
}
function launchTrio(){ // 🤖 选好角色后真正开局：三人模式（2P 真人 + 3P 由内置 AI 接管）
  G._wantTrio = true;
  try { startGame(false, true); } finally { G._wantTrio = false; }
  try {
    const el = document.getElementById('coop-toast');
    if(el){
      el.innerHTML = '👥 三人模式 —— 你（键鼠）+ 2P（手柄）+ 3P（AI），一起打！';
      el.style.display = 'block'; el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 500); }, 2800);
    }
  } catch(e){}
}
// ===== ⚔️ 对战模式（1v1 单挑）=====
//   设计（2026-10-06 用户定案）：
//     ① 纯竞技场 —— 不刷怪，开局直接把双方摆到场上互殴（没有波次、没有 Boss、没有小怪）
//     ② 血量打完即分胜负 —— 谁先被打空谁输，一局定胜负
//     ③ 玩家之间单独一套伤害折算（PVP_DMG_MUL）—— 玩家打玩家打折，不会一击秒杀
//   两个入口：⚔️ 对战·双人同屏（1P 键鼠 vs 2P 手柄）/ ⚔️ 对战·打 AI（2P 由内置 AI 接管）
const PVP_DMG_MUL = 0.30;   // ⚔️ 玩家打玩家的伤害折扣（只作用于 PVP，PVE 数值完全不受影响）
const PVP_START_SKILLS = 2; // ⚔️ 开局双方各自随机获得的技能数（不刷怪 → 没有升级，全靠这两个 + 角色底子）

// ⚔️ 对战：把一次「范围伤害」结算给对手玩家（attackerSeat = 攻击者座位）
//   与 PVE 完全对称的一行式钩子：在各伤害出口加一行即可，PVE 时直接返回 0（零开销）
//   dmg 传「原始伤害」，这里统一按 PVP_DMG_MUL 折算
function pvpHitPlayers(attackerSeat, x, y, r, dmg, color){
  if(!G.pvp || G.state !== 'playing' || !G.players) return 0; // 胜利动画中战斗已冻结，不再结算伤害
  let n = 0;
  for(const q of G.players){
    if(!q || q.dead || q.seat === attackerSeat) continue;
    if(Math.hypot(q.x - x, q.y - y) > r + q.r) continue;
    q.takeDamage(Math.max(1, Math.round((dmg || 0) * PVP_DMG_MUL)), color || '#ff8a8a');
    spawnParticles(q.x, q.y, '#ff6b6b', 4);
    n++;
  }
  return n;
}
// ⚔️ 对战：某座位的「可攻击/可锁定目标」取数口 —— PVE 时就是场上的敌人，PVP 时是对手玩家。
//   玩家对象天然具备 .x/.y/.r/.dead（敌人多出来的 .dying/.isBullet/.invincible 读作 undefined 全为假），
//   所以索敌/光路截断这类「遍历 G.enemies」的地方换成 targetsFor(seat) 即可同时支持两种模式。
function targetsFor(seat){
  if(G.pvp) return (G.players || []).filter(q => q && !q.dead && (q.seat || 0) !== (seat || 0));
  return G.enemies;
}
// ⚔️ 对战：近战/突袭这类「扇形或带状」判定的通用命中检查（返回命中的对手数）
//   src（可选）= 攻击者本体：传给 takeDamage 当伤害来源，让 🛡 骑士的举盾能挡下这一记（颜色串没有坐标，挡不了）
function pvpMeleeHit(attacker, x, y, dirA, halfArc, range, dmg, color, src){
  if(!G.pvp || G.state !== 'playing' || !G.players) return 0; // 胜利动画中战斗已冻结，不再结算伤害
  // 🤖 归属座位：玩家有 .seat；🧲 将军的小兵只有 .owner（主人的座位）→ 两种都认
  const atkSeat = (attacker && attacker.seat !== undefined) ? attacker.seat : ((attacker && attacker.owner) || 0);
  let n = 0;
  for(const q of G.players){
    if(!q || q.dead || q.seat === atkSeat) continue;
    const d = Math.hypot(q.x - x, q.y - y);
    if(d > range + q.r) continue;
    const ea = Math.atan2(q.y - y, q.x - x);
    const diff = Math.abs(((ea - dirA + Math.PI*3) % (Math.PI*2)) - Math.PI);
    if(diff > halfArc) continue;
    // 🪨 土墙「挡对手本身」：防守方 q 自己立的土墙若挡在攻击者与 q 之间，这记近战/冲撞被墙挡下
    const qw = wallOf(q);
    if(qw && wallBlocksBetween(qw, x, y, q.x, q.y)) continue;
    q.takeDamage(Math.max(1, Math.round((dmg || 0) * PVP_DMG_MUL)), src || color || '#ff8a8a');
    spawnParticles(q.x, q.y, '#ff6b6b', 4);
    n++;
  }
  return n;
}

function startPVPHuman(){ // ⚔️ 对战 · 双人同屏：1P 键鼠、2P 手柄，双方都是真人
  G._pvpAI = false; // 明确标记"对手是真人"（防止上一次「打 AI」留下的标记串味）
  openHeroPick('pvp');
}
function startPVPAI(){ // ⚔️ 对战 · 打 AI：对手由内置 AI 接管（角色由 AI 自己挑，2026-10-08 用户定）
  G._pvpAI = true;
  aiPickBrain(false);       // 🧠 先让 AI 想好：重抽性格 → 看你选了谁 → 挑一个（先算出结果，再演给你看）
  G._pickHero2 = G._aiPickFinal;
  openHeroPick('pvp');      // 打开面板（若 URL 带 ?hero= 会直接开局，那时角色也已定好）
  if(G._heroPickMode === 'pvp') aiPickTheater(7, 110);   // 🎬 把「挑选过程」在面板上演出来
}
// ===== 🤖 AI 选角大脑（2026-10-08 用户定：不是掷骰子，是 AI 自己“挑”）=====
//   ① 性格：每局抽一个风格（贴身狂 / 放风筝 / 均衡派）→ 决定它偏爱近战还是远程
//   ② 应对：读你（1P）角色的主战方式下菜 —— 你远程它就挑近战贴身拓、你近战它就挑远程拉开打
//   ③ 不重样：最近 3 局用过的角色进禁选池（gameStore 记，关掉页面再打开也记得）
//   性格 > 应对：性格定大方向，应对只做微调（两者都要时不会打架到没有个性）
const HERO_ROLE = {
  gunner:'ranged', swordsman:'melee', laser:'ranged', bomber:'ranged', tornado:'melee',
  venom:'ranged', general:'melee', mage:'ranged', vampire:'melee', stone:'ranged', rookie:'melee',
  engineer:'melee', // ⚙️ 工程师：本体是扳手近战（炮台只是"放置"的自动火力，走位仍按近战算）
  boomerang:'ranged', // 🪃 回旋镖：远程（扔出去会飞回来的镖，走位按远程算）
  dogmilk:'melee', // 🐶 野生狗奶：本体是短刀近战（命中奶住，走位按近战算）
  cardmaster:'ranged', // 🃏 卡牌大师：远程（抽牌扇出卡牌弹丸，走位按远程算）
  ketchup:'ranged', // 🍅 番茄酱之神：控场系（普攻是扔包、技能是贴身捏爆，走位按远程算——但不真贴脸）
  knight:'melee', // 🛡 骑士：重甲坦克剑士（举盾挡正面、冲锋带无敌，走位按近战算——贴脸才能砍到人）
  spring:'melee', // 🥊 弹簧：近战蓄力拳（拳程 132~178，走位按近战算——要贴上去才打得到人）
  bard:'ranged', // 🎻 吟游诗人：远程（穿透音波射程 258，走位按远程算——要站在队友身后）
};
const AI_STYLES = {
  aggro:    { name:'贴身狂', mine:'melee',  love:3.4, hate:0.50 },
  kite:     { name:'放风筝', mine:'ranged', love:3.4, hate:0.50 },
  balanced: { name:'均衡派', mine:null,     love:1.25, hate:1.25 },
};
const AI_STYLE_KEYS = ['aggro','kite','balanced'];
const AI_HIST_MAX = 3;      // 最近几局用过的角色不再选
let AI_HERO_HIST = [];      // 跨局记忆（gameStore 持久化）
function aiHistLoad(){ try { const s = gameStore.getItem('wb-ai-hero-hist'); if(s) AI_HERO_HIST = (JSON.parse(s) || []).filter(h => heroOk(h)); } catch(e){} }
function aiHistPush(h){
  if(!heroOk(h)) return;
  AI_HERO_HIST.push(h);
  while(AI_HERO_HIST.length > AI_HIST_MAX) AI_HERO_HIST.shift();
  try { gameStore.setItem('wb-ai-hero-hist', JSON.stringify(AI_HERO_HIST)); } catch(e){}
}
function aiRollStyle(){ return AI_STYLE_KEYS[Math.floor(Math.random() * AI_STYLE_KEYS.length)] || 'balanced'; }
// 🧠 挑人（纯函数，可测）：权重 = 性格偏好 × 应对你的角色 × 随机抖动 → 按权重抽一个
function aiPickHero(myHero, style, hist){
  const roleOf = h => HERO_ROLE[h] || 'ranged';
  const st = AI_STYLES[style] || AI_STYLES.balanced;
  const avoid = (hist || []).slice(-AI_HIST_MAX);
  let pool = HERO_KINDS.filter(h => avoid.indexOf(h) < 0);
  if(!pool.length) pool = HERO_KINDS.slice();                        // 池子被禁空 → 放开重来
  const myRole = roleOf(myHero);
  const W = {}; let tot = 0;
  for(const h of pool){
    const r = roleOf(h);
    let w = 1;
    if(st.mine) w *= (r === st.mine ? st.love : st.hate);            // ① 性格：偏爱某一类
    else        w *= st.love;                                       //    均衡派：都加点，不偏
    if(myRole === 'ranged')     w *= (r === 'melee'  ? 2.2 : 0.85);   // ② 应对：你远程 → 我贴身
    else if(myRole === 'melee') w *= (r === 'ranged' ? 2.2 : 0.85);   //    你近战 → 我风筝
    w *= 0.72 + Math.random() * 0.56;                                 // ③ 抖动：别吃死在某一个
    W[h] = w; tot += w;
  }
  let r = Math.random() * tot;
  for(const h of pool){ r -= W[h]; if(r <= 0) return h; }
  return pool[pool.length - 1];
}
// 🧠 这一局的“脑内活动”：抽性格 → 挑角色（rethink=true 表示你换了角色，沿用同一套性格重挑）
function aiPickBrain(rethink){
  if(!rethink) G._aiStyle = aiRollStyle();          // 新的一局 → 重抽性格（每局都不一样）
  else if(!G._aiStyle) G._aiStyle = aiRollStyle();  // 只是你换了角色 → 沿用这套性格，只重挑角色
  G._aiPickFinal = aiPickHero(G._pickHero || G.hero || 'gunner', G._aiStyle, AI_HERO_HIST);
}
let AI_PICK_TIMER = null;   // 🎬 选角演出的定时器（提前开战 / 关面板都要能掉）
function aiPickHint(settled){
  const t2 = document.getElementById('hp-t2');
  if(!t2) return;
  const st = (AI_STYLES[G._aiStyle] || AI_STYLES.balanced).name;
  t2.textContent = settled ? ('2P · AI 对手 · ' + st + '｜已选定') : '2P · AI 对手 · 🤔 正在挑选…';
}
// 🎬 演给玩家看：候选在 2P 栏跳几下再落锤（落点一定是 G._aiPickFinal → 你手快也不会选错）
function aiPickTheater(steps, gap){
  if(AI_PICK_TIMER){ clearInterval(AI_PICK_TIMER); AI_PICK_TIMER = null; }
  const final = G._aiPickFinal || 'gunner';
  G._aiPicking = true;
  let n = 0;
  const stop = () => { if(AI_PICK_TIMER){ clearInterval(AI_PICK_TIMER); AI_PICK_TIMER = null; } G._aiPicking = false; };
  const tick = () => {
    if(G._heroPickMode !== 'pvp'){ stop(); return; }   // 面板已关（玩家提前开战）→ 收工
    n++;
    if(n >= steps){
      stop();
      G._pickHero2 = final;
      aiPickHint(true);
      paintHeroPick();
      return;
    }
    let h = HERO_KINDS[Math.floor(Math.random() * HERO_KINDS.length)];
    if(h === final) h = HERO_KINDS[(HERO_KINDS.indexOf(final) + 1) % HERO_KINDS.length]; // 别提前露馅
    G._pickHero2 = h;
    aiPickHint(false);
    paintHeroPick();
  };
  tick();
  AI_PICK_TIMER = setInterval(tick, gap);
}
// 🤖 没有面板的直启路径（?pvp=ai / ?hero= 指定）也要 AI 自己挑，挑完直接记账
function aiPickForDirect(myHero){
  G._aiStyle = aiRollStyle();
  const h = aiPickHero(myHero || G.hero || 'gunner', G._aiStyle, AI_HERO_HIST);
  G._aiPickFinal = h;
  aiHistPush(h);
  return h;
}
function launchPVP(){ // ⚔️ 两边都选好 → 真正开局
  G._wantPVP = true;
  try { startGame(false, true); } finally { G._wantPVP = false; G._pvpAI = false; }
  try {
    const el = document.getElementById('coop-toast');
    if(el){
      el.innerHTML = G.pvpAI ? '⚔️ 对战开始 —— 你 vs AI，打空对方的血就赢！' : '⚔️ 对战开始 —— 打空对方的血就赢！';
      el.style.display = 'block'; el.style.opacity = '1';
      setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 500); }, 2600);
    }
  } catch(e){}
}
// 开局摆阵：不刷怪，只把双方摆到场地两侧、各随机发几个技能
function startPVPBattle(){
  G.wave = 0; G.inBossWave = false; G.waveEnemiesLeft = 0; G.boss = null;
  const wi = document.getElementById('wave-info');
  if(wi) wi.textContent = '⚔️ 对战 1v1';
  const bw = document.getElementById('boss-bar-wrap');
  if(bw) bw.style.display = 'none';
  const W = WW(), H = WH();
  G.players.forEach((p, i) => {
    p.x = i === 0 ? W * 0.25 : W * 0.75;
    p.y = H / 2;
    p.hp = p.maxHp;
    p.dead = false;
    p.invuln = 1.5;              // 开局短暂无敌：防一上来就隔空对射（也给双方反应时间）
    // ⚔️ 开局各自随机 N 个技能（双方独立随机 → 每局都有点变数）
    randomLevelSkills(PVP_START_SKILLS, p);
  });
  updateSkillBar();
}
// ⚔️ 对战结算：谁的血先被打空谁输，一局定胜负（不走 coop 的「阵亡→3波后复活」）
//   先播 2.4 秒左右的「胜者专属庆祝动画」（每个英雄一套，见 PVP_WIN_FX），播完才弹结算画面
//   真人 vs 真人 → 「1P/2P 胜利」；真人 vs AI → 「你赢了 / AI 胜利」
function pvpResolveWin(deadP){
  if(G.state !== 'playing') return; // 防重复：同一帧内两发伤害可能同时把双方归零
  deadP.dead = true;                // 败者标记阵亡（与合作模式的 coopPlayerDie 一致：不再参与更新/瞄准）
  const winner = (G.players || []).find(q => q && q !== deadP && !q.dead) || null;
  G.pvpWinner = winner ? winner.seat : -1; // 供测试 / 后续数据统计读取
  G.pvpLoser  = deadP.seat;
  G.paused = false; hidePauseHome();
  ['skill-bar','skill-bar2','skill-bar3'].forEach(id => { const e = document.getElementById(id); if(e) e.style.display = 'none'; });
  if(!winner){ showPvpResult(); return; } // 理论上不会发生（单挑只有一个人归零），兜底直接结算
  // 进入胜利演出：状态切到 'pvpwin'（主循环走专属分支，战斗全面冻结，只剩动画在跑）
  const hero = (() => { try { return heroKind(winner); } catch(e){ return 'gunner'; } })();
  const spec = PVP_WIN_FX[hero] || PVP_WIN_FX.gunner;
  G.pvpVictory = { t: 0, dur: spec.dur || PVP_WIN_DUR, seat: winner.seat, hero,
                   winner, loser: deadP, sp: [], rings: [], _marks: {} };
  G.state = 'pvpwin';
  SND.win();
}
// ⚔️ 胜利动画播完 → 弹正式结算画面
function showPvpResult(){
  G.state = 'gameover'; // 复用 gameover 状态：主循环停更玩家，但结算画面自己画
  const winner = (G.players || []).find(q => q && q.seat === G.pvpWinner) || null;
  let title, tone;
  if(!winner){ title = '⚔️ 同归于尽'; tone = 'lose-color'; SND.gameOver(); }
  else if(G.pvpAI){
    if(isAIPlayer(winner)){ title = '🤖 AI 胜利 —— 再来一局？'; tone = 'lose-color'; SND.gameOver(); }
    else { title = '🏆 你赢了！'; tone = 'win-color'; }
  } else {
    title = `🏆 ${seatLabel(winner)} 胜利`; tone = 'win-color';
  }
  const ov = document.getElementById('overlay');
  if(ov){
    ov.classList.remove('hidden');
    const hpLine = (G.players || []).filter(Boolean)
      .map(p => `${seatLabel(p)} ${Math.max(0, Math.round(p.hp))}/${p.maxHp}`).join('　|　');
    const t = Math.floor(G.time);
    ov.innerHTML = `<h1 class="${tone}">${title}</h1>
      <p>对战时长 ${Math.floor(t/60)}分${(t%60).toString().padStart(2,'0')}秒</p>
      <p>${hpLine}</p>
      <button onclick="restartPVP()">再来一局</button>
      <button onclick="backToMenu()">返回主页</button>`;
  }
}
// ===== ⚔️ 单挑胜利动画（每个英雄一套专属庆祝演出）=====
//   打空对手的血后先播 ~2.4 秒专属动画，播完才弹结算画面（见 pvpResolveWin / showPvpResult）
//   fx.sp = 自定义粒子（x,y,vx,vy,life,max,r,color,grav,shape）；fx.rings = 扩散环；fx._marks = 已触发的节拍标记
const PVP_WIN_DUR = 2.4;
function pvpSpark(fx, o){ fx.sp.push(Object.assign({ x:0, y:0, vx:0, vy:0, life:0.6, max:0.6, r:3, color:'#fff', grav:0, shape:'dot' }, o)); }
function pvpRing(fx, x, y, max, life, color, w){ fx.rings.push({ x, y, r:4, max, life, maxLife:life, color: color || '#ffd166', w: w || 3 }); }
// 某个时刻只触发一次的小工具（fx._marks 记录已触发的节拍）
function pvpOnce(fx, key, at){ if(fx.t >= at && !fx._marks[key]){ fx._marks[key] = true; return true; } return false; }

// ===== 🪨 投石胜利演出的"堆石台"（左上蓝方台 / 右下红方台 / 中间两座高脚八边形黄台）=====
//   平台本身画在 back 层（通用粒子之下），石块走通用粒子层 —— 这样石头才是"落在台面上"，不会被台面盖住。
const PVP_STONE_W = 26, PVP_STONE_H = 12;   // 石块尺寸（长方形石，与地图上的石头同一套画法，小一号）
const PVP_STONE_FACE = 16;                  // 平台厚度（立体台面/侧面的高度）
// 三波抛石计划：t0 = 首发时刻，gap = 连发间隔（"一口气"= 逐块连发，不歇气）
const PVP_STONE_VOLLIES = [
  { color:'blue',   plat:0, n:12, t0:0.15, gap:0.065 },  // 第 1 波：朝左上蓝台一口气 12 块蓝石
  { color:'red',    plat:1, n:12, t0:0.95, gap:0.065 },  // 第 2 波：朝右下红台一口气 12 块红石
  { color:'yellow', plat:2, n:3,  t0:1.72, gap:0.065 },  // 第 3 波：朝上黄台 3 块黄石
  { color:'yellow', plat:3, n:3,  t0:1.76, gap:0.065 },  //         朝下黄台 3 块黄石（两口一气，交错抛出）
];
function pvpShade(hex, k){                  // 颜色明暗：k>0 提亮 / k<0 压暗（顶面/侧面/正面的层次）
  const raw = String(hex || '#888888').replace('#', '');
  const full = raw.length === 3 ? raw.charAt(0)+raw.charAt(0)+raw.charAt(1)+raw.charAt(1)+raw.charAt(2)+raw.charAt(2) : raw;
  const n = parseInt(full, 16) || 0;
  const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return 'rgb(' + f((n >> 16) & 255) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}
function pvpStonePlats(fx){                 // 四座平台（惰性算一次；跟着画布尺寸走）
  if(fx._plat) return fx._plat;
  const w = WW(), h = WH(), mn = Math.min(w, h);
  const R = mn * 0.085, dep = mn * 0.045, OC = mn * 0.072;
  fx._plat = [
    { kind:'square', skey:'blue',   cx: w*0.14, cy: h*0.24, R: R,  dep, face: PVP_STONE_FACE },                  // 左上：方形立体蓝台
    { kind:'square', skey:'red',    cx: w*0.86, cy: h*0.76, R: R,  dep, face: PVP_STONE_FACE },                  // 右下：方形立体红台
    { kind:'oct',    skey:'yellow', cx: w*0.57, cy: h*0.42, R: OC, dep, face: PVP_STONE_FACE, base: h*0.64 },    // 上：高脚八边形黄台（右列）
    { kind:'oct',    skey:'yellow', cx: w*0.43, cy: h*0.62, R: OC, dep, face: PVP_STONE_FACE, base: h*0.90 },    // 下：与上台关于画面中轴对称（0.57↔0.43），杆脚放得更低（杆更长）
  ];
  return fx._plat;
}
// ⚙️ 工程师胜利动画「炮阵齐射」的四座炮台站位（惰性算一次；跟着画布尺寸走）
//    排在胜者脚下前方一排（微微错落），并钳进场地内 —— 免得贴边时跑到画外
function engineerWinSpots(P, fx){
  if(fx._engSpots) return fx._engSpots;
  const w = WW(), h = WH();
  const cx = clamp(P.x, 130, Math.max(130, w - 130));
  const cy = clamp(P.y + 74, 90, Math.max(90, h - 60));
  fx._engSpots = [
    { x: cx - 108, y: cy - 10 }, { x: cx - 36, y: cy + 6 },
    { x: cx + 36, y: cy + 6 },  { x: cx + 108, y: cy - 10 },
  ];
  return fx._engSpots;
}
function pvpPoly(pts){                      // 折线闭合（平台各面都用它画）
  ctx.beginPath();
  for(let i = 0; i < pts.length; i++){ if(i) ctx.lineTo(pts[i].x, pts[i].y); else ctx.moveTo(pts[i].x, pts[i].y); }
  ctx.closePath();
}
function pvpOctPath(cx, cy, r){             // 八边形（平顶平底，八条边）
  ctx.beginPath();
  for(let i = 0; i < 8; i++){
    const a = Math.PI/8 + i * Math.PI/4;
    const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
    if(i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function pvpStoneDrawPlats(fx){             // 画四座平台（back 层：在石块之下）
  const plats = pvpStonePlats(fx);
  ctx.save();
  for(const p of plats){
    const C = STONE_COLORS[p.skey] || STONE_COLORS.yellow;
    if(p.kind === 'oct'){
      // 八边形板下方中心的细立柱：先画杆（杆脚压在地上），再画板盖住杆顶
      const pw = Math.max(5, p.R * 0.17);
      const pTop = p.cy + p.R * 0.55, pBot = p.base;
      const pg = ctx.createLinearGradient(p.cx - pw, 0, p.cx + pw, 0);
      pg.addColorStop(0, '#98a1b1'); pg.addColorStop(0.45, '#5d6472'); pg.addColorStop(1, '#363b45');
      ctx.fillStyle = pg;
      ctx.fillRect(p.cx - pw/2, pTop, pw, Math.max(8, pBot - pTop));
      ctx.fillStyle = '#2b303a';
      ctx.beginPath(); ctx.ellipse(p.cx, pBot, pw * 1.7, pw * 0.75, 0, 0, Math.PI*2); ctx.fill(); // 杆脚底座
      ctx.fillStyle = pvpShade(C.body, -0.52);        // 板的厚度（下沉一份，露出下缘）
      pvpOctPath(p.cx, p.cy + p.face, p.R); ctx.fill();
      ctx.fillStyle = pvpShade(C.body, 0.24);         // 顶面
      pvpOctPath(p.cx, p.cy, p.R); ctx.fill();
      ctx.strokeStyle = pvpShade(C.body, -0.62); ctx.lineWidth = 3;
      pvpOctPath(p.cx, p.cy, p.R); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.30)'; ctx.lineWidth = 1.6;
      pvpOctPath(p.cx, p.cy, p.R * 0.68); ctx.stroke(); // 里圈高光
    } else {
      // 方形立体平台：顶面是斜投影的正方形 + 正面/右侧面撑出厚度
      const R = p.R, dv = p.dep / 2;
      const FL = { x: p.cx - R, y: p.cy + dv }, FR = { x: p.cx + R, y: p.cy + dv };
      const BR = { x: p.cx + R + p.dep, y: p.cy + dv - p.dep }, BL = { x: p.cx - R + p.dep, y: p.cy + dv - p.dep };
      ctx.fillStyle = pvpShade(C.body, -0.30);        // 正面
      pvpPoly([FL, FR, { x: FR.x, y: FR.y + p.face }, { x: FL.x, y: FL.y + p.face }]); ctx.fill();
      ctx.fillStyle = pvpShade(C.body, -0.52);        // 右侧面
      pvpPoly([FR, BR, { x: BR.x, y: BR.y + p.face }, { x: FR.x, y: FR.y + p.face }]); ctx.fill();
      ctx.fillStyle = pvpShade(C.body, 0.24);         // 顶面
      pvpPoly([FL, FR, BR, BL]); ctx.fill();
      ctx.strokeStyle = pvpShade(C.body, -0.62); ctx.lineWidth = 3; ctx.stroke();
      const c2 = { x: p.cx + p.dep/2, y: p.cy };      // 顶面重心（顶面高光往里缩一圈）
      ctx.strokeStyle = 'rgba(255,255,255,.26)'; ctx.lineWidth = 1.6;
      pvpPoly([FL, FR, BR, BL].map(q => ({ x: c2.x + (q.x - c2.x)*0.66, y: c2.y + (q.y - c2.y)*0.66 }))); ctx.stroke();
    }
  }
  ctx.restore();
}
function pvpStoneThrow(P, fx, plat, skey){  // 抛一块石头：算随机落点（压到已有石头就往上叠）+ 抛物线
  const C = STONE_COLORS[skey] || STONE_COLORS.yellow;
  let x = plat.cx, y = plat.cy;
  if(plat.kind === 'square'){               // 方形台：在斜投影的正方形面上随机取点
    const u = rand(-0.72, 0.72), t = rand(0.10, 0.90);
    x = plat.cx + u*plat.R + t*plat.dep;
    y = plat.cy + plat.dep/2 - t*plat.dep;
  } else {                                  // 八边形台：在板面内随机取点（半径 0.62R 稳在八边形里）
    const a = Math.random()*Math.PI*2, rr = Math.sqrt(Math.random()) * plat.R * 0.62;
    x = plat.cx + Math.cos(a)*rr;
    y = plat.cy + Math.sin(a)*rr;
  }
  for(const s2 of fx.sp){                   // 随机堆叠：同一条竖线上已经落了石头 → 这块就叠在它上面
    if(s2.shape !== 'stone' || !s2._rest || s2._plat !== plat) continue;
    if(Math.abs(s2.x - x) < PVP_STONE_W * 0.80) y = Math.min(y, s2.y - PVP_STONE_H * 0.55);
  }
  const dir = x >= P.x ? 1 : -1;            // 从角色手边朝平台抛出
  const sx = P.x + dir*16, sy = P.y - 30;
  const dist = Math.hypot(x - sx, y - sy);
  const T = clamp(0.32 + dist/1500, 0.34, 0.56);       // 飞行时长（近的快、远的稍慢）
  const arc = clamp(dist*0.55, 80, 400);               // 抛物弧高（越高越像"扔"出去的）
  fx.sp.push({ shape:'stone', skey, color: C.body,
    x: sx, y: sy, vx: 0, vy: 0, grav: 0, life: 99, max: 99, r: 0,
    _plat: plat, _T: T, _t0: fx.t, _sx: sx, _sy: sy,
    _mx: (sx + x)/2, _my: Math.min(sy, y) - arc,        // 二次贝塞尔控制点（高空）
    _tx: x, _ty: y, _ang0: rand(-0.5, 0.5), _spin: rand(-9, 9), ang: 0, _rest: false });
  pvpSpark(fx, { x: sx, y: sy, vx: -dir*rand(30, 70), vy: rand(-30, 30), life: 0.16, max: 0.16, r: 3, color: C.ring }); // 出手微光
}
function pvpStoneLand(fx, s){               // 落地：钉在台面上 + 扬尘（隔块出声，30 块连响太吵）
  const C = STONE_COLORS[s.skey] || STONE_COLORS.yellow;
  s._rest = true; s.x = s._tx; s.y = s._ty; s.ang = rand(-0.55, 0.55);
  fx._landed = (fx._landed || 0) + 1;
  if(fx._landed % 2 === 0) SND.hit();
  for(let i = 0; i < 4; i++){
    const a = Math.random()*Math.PI*2;
    pvpSpark(fx, { x: s.x, y: s.y + 4, vx: Math.cos(a)*rand(30, 70), vy: -rand(20, 60),
      life: 0.26, max: 0.26, r: rand(1.6, 2.8), color: C.ring });
  }
  if(fx._landed % 4 === 0) pvpRing(fx, s.x, s.y + 3, 20, 0.22, C.ring, 2);
}

const PVP_WIN_FX = {
  // 🏹 射手「礼花齐射」：朝天连发三组金色礼花弹，弹到顶点炸成一圈金芒
  gunner: { dur: 2.4, step(P, fx){
    if(fx.t < 1.35 && fx.t - (fx._last || -1) > 0.40){
      fx._last = fx.t;
      SND.shoot();
      for(let i = 0; i < 5; i++){
        const a = -Math.PI/2 + (i - 2) * 0.24;
        pvpSpark(fx, { x: P.x + Math.cos(a)*16, y: P.y + Math.sin(a)*16,
          vx: Math.cos(a)*260, vy: Math.sin(a)*430, life: 0.52, max: 0.52, r: 4, color: '#ffd166', shape:'tracer' });
      }
      spawnParticles(P.x, P.y, '#ffe08a', 6);
    }
    for(const s of fx.sp){ // 礼花弹到顶点 → 炸开成一圈金芒
      if(s.shape === 'tracer' && s.life <= 0 && !s._boom){
        s._boom = true;
        for(let i = 0; i < 12; i++){
          const a = i/12 * Math.PI*2;
          pvpSpark(fx, { x: s.x, y: s.y, vx: Math.cos(a)*140, vy: Math.sin(a)*140,
            life: 0.62, max: 0.62, r: 3, color: i % 2 ? '#ffd166' : '#fff6d0', grav: 90 });
        }
        pvpRing(fx, s.x, s.y, 46, 0.45, '#ffd166');
      }
    }
  } },
  // 🗡 剑士「大剑插地」：巨剑砸地 → 冲击环掀开 → 三道剑气绕身横扫
  //   ⚠️ 键名用 'melee'：heroKind() 对剑士返回的就是 'melee'（不是 'swordsman'）
  melee: { dur: 2.4, step(P, fx){
    if(pvpOnce(fx, 'slam', 0.34)){
      G.screenShake = 12; SND.boom();
      pvpRing(fx, P.x, P.y, 150, 0.5, '#cfe3ff', 5);
      for(let i = 0; i < 16; i++){
        const a = i/16 * Math.PI*2;
        pvpSpark(fx, { x: P.x, y: P.y, vx: Math.cos(a)*230, vy: Math.sin(a)*230, life: 0.5, max: 0.5, r: 3.5, color: '#cfe3ff', grav: 260 });
      }
    }
    for(let k = 0; k < 3; k++){ // 三道剑气：0.9 / 1.3 / 1.7 秒，一道比一道宽
      if(pvpOnce(fx, 'slash' + k, 0.9 + k*0.4)){
        SND.shieldBlock();
        pvpRing(fx, P.x, P.y, 78 + k*34, 0.34, '#fff', 4);
        for(let i = 0; i < 8; i++){
          const a = fx.t * 2 + i/8 * Math.PI*2;
          pvpSpark(fx, { x: P.x + Math.cos(a)*46, y: P.y + Math.sin(a)*46,
            vx: Math.cos(a)*180, vy: Math.sin(a)*180, life: 0.34, max: 0.34, r: 3, color: '#eaf2ff' });
        }
      }
    }
  }, draw(P, fx){
    // 大剑插地：0.34s 前从天而降 → 之后立在地上微微发光
    const t = Math.max(0, fx.t - 0.34);
    const drop = Math.max(0, 1 - fx.t/0.34);      // 下落进度（1→0）
    const sy = P.y + 16 - drop * 300;             // 剑尖 y（从高处落到脚边）
    ctx.save();
    ctx.strokeStyle = '#dfe9f7'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(P.x + 34, sy - 86); ctx.lineTo(P.x + 34, sy + 4); ctx.stroke();
    ctx.strokeStyle = '#9fb4d0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(P.x + 22, sy - 60); ctx.lineTo(P.x + 46, sy - 60); ctx.stroke(); // 护手
    ctx.globalAlpha = 0.35 + 0.25*Math.sin(fx.t*5);
    ctx.strokeStyle = '#7fb0ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(P.x + 34, sy + 6, 12 + 8*Math.sin(fx.t*3), 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  } },
  // 🔆 激光「冲天光柱」：一道光束直冲天顶，越烧越亮，最后分出两道斜光
  laser: { dur: 2.4, step(P, fx){
    if(pvpOnce(fx, 'ign', 0.1)) SND.laserUlt();
    if(fx.t < 1.9 && Math.random() < 0.5){ // 光柱周围溅出小火花
      pvpSpark(fx, { x: P.x + rand(-26, 26), y: P.y - Math.random()*300,
        vx: rand(-60, 60), vy: rand(-40, 120), life: 0.4, max: 0.4, r: 2.5, color: '#8ef0ff' });
    }
    if(pvpOnce(fx, 'fork', 1.55)){ SND.laserUlt(); pvpRing(fx, P.x, P.y, 120, 0.5, '#8ef0ff', 4); }
  }, draw(P, fx){
    const heat = Math.min(1, fx.t / 0.5) * (fx.t > 1.9 ? Math.max(0, (fx.dur - fx.t)/0.5) : 1); // 起燃渐亮 / 收尾渐灭
    const w1 = (7 + 3*Math.sin(fx.t*14)) * heat;
    ctx.save();
    ctx.globalAlpha = 0.85 * heat;
    ctx.strokeStyle = '#8ef0ff'; ctx.lineWidth = w1 + 8; // 外晕
    ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x, -20); ctx.stroke();
    ctx.strokeStyle = '#eafcff'; ctx.lineWidth = Math.max(1, w1); // 内芯
    ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(P.x, -20); ctx.stroke();
    if(fx.t >= 1.55){ // 分叉的两道斜光
      ctx.globalAlpha = 0.6 * heat; ctx.strokeStyle = '#8ef0ff'; ctx.lineWidth = 4;
      for(const s of [-1, 1]){
        ctx.beginPath(); ctx.moveTo(P.x, P.y);
        ctx.lineTo(P.x + s*460, P.y - 300); ctx.stroke();
      }
    }
    ctx.restore();
  } },
  // 💣 爆破「连环烟花爆」：脚下六个方位依次炸开小烟花，最后一记大爆炸收尾
  bomber: { dur: 2.5, step(P, fx){
    for(let i = 0; i < 6; i++){
      const at = 0.28 + i*0.26;
      if(pvpOnce(fx, 'pop' + i, at)){
        const a = i/6 * Math.PI*2 + 0.4;
        const x = P.x + Math.cos(a)*74, y = P.y + Math.sin(a)*74;
        if(i % 2 === 0) SND.boom(); else SND.flame();
        G.screenShake = 5;
        pvpRing(fx, x, y, 54, 0.36, i % 2 ? '#ffb347' : '#ff8a3d', 4);
        for(let k = 0; k < 10; k++){
          const b2 = k/10 * Math.PI*2;
          pvpSpark(fx, { x, y, vx: Math.cos(b2)*160, vy: Math.sin(b2)*160, life: 0.42, max: 0.42, r: 3,
            color: k % 2 ? '#ffcf6b' : '#ff8a3d', grav: 150 });
        }
      }
    }
    if(pvpOnce(fx, 'final', 2.0)){ // 收尾大爆炸
      G.screenShake = 14; SND.boom();
      pvpRing(fx, P.x, P.y, 170, 0.55, '#ffd166', 6);
      for(let k = 0; k < 22; k++){
        const b2 = k/22 * Math.PI*2;
        pvpSpark(fx, { x: P.x, y: P.y, vx: Math.cos(b2)*270, vy: Math.sin(b2)*270, life: 0.6, max: 0.6, r: 4, color: '#ffcf6b', grav: 200 });
      }
    }
  } },
  // 🌀 龙卷风「胜利旋风」：本体原地打转，三层风环越转越快，最后向外炸开一圈风刃
  tornado: { dur: 2.4, step(P, fx){
    if(fx.t - (fx._last || -1) > 0.38 && fx.t < 1.9){
      fx._last = fx.t;
      pvpRing(fx, P.x, P.y, 60 + fx.t*40, 0.5, 'rgba(142,240,255,0.9)', 3);
      for(let i = 0; i < 6; i++){
        const a = Math.random()*Math.PI*2;
        pvpSpark(fx, { x: P.x + Math.cos(a)*40, y: P.y + Math.sin(a)*40,
          vx: Math.cos(a+1.6)*190, vy: Math.sin(a+1.6)*190, life: 0.4, max: 0.4, r: 3, color: '#8ef0ff' });
      }
    }
    if(pvpOnce(fx, 'burst', 2.0)){ SND.shieldBlock(); G.screenShake = 10; pvpRing(fx, P.x, P.y, 180, 0.5, '#8ef0ff', 5); }
  }, draw(P, fx){
    ctx.save(); // 本体周围三层旋转风弧（转速逐层递增）
    for(let l = 0; l < 3; l++){
      const r = 34 + l*17, sp = 5 + l*3.4;
      ctx.strokeStyle = `rgba(142,240,255,${0.55 - l*0.13})`;
      ctx.lineWidth = 3;
      for(let k = 0; k < 3; k++){
        const a0 = fx.t*sp + k/3*Math.PI*2;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, a0, a0 + 1.25); ctx.stroke();
      }
    }
    ctx.restore();
  } },
  // 🧪 毒液「毒池庆典」：脚下漫开一滩绿毒 + 气泡咕嘟咕嘟往上冒
  venom: { dur: 2.4, step(P, fx){
    if(pvpOnce(fx, 'pool', 0.15)) SND.hit();
    if(fx.t > 0.3 && fx.t < 2.1 && Math.random() < 0.55){ // 上升气泡
      pvpSpark(fx, { x: P.x + rand(-56, 56), y: P.y + rand(-8, 20),
        vx: rand(-14, 14), vy: rand(-95, -45), life: 0.9, max: 0.9, r: rand(2.5, 5.5),
        color: Math.random() < 0.4 ? '#c6ff8a' : '#9ef04a', shape:'bubble' });
    }
    if(fx.t - (fx._last || -1) > 0.5 && fx.t < 2.0){ // 毒液滴溅
      fx._last = fx.t;
      for(let i = 0; i < 7; i++){
        const a = Math.random()*Math.PI*2;
        pvpSpark(fx, { x: P.x, y: P.y, vx: Math.cos(a)*150, vy: Math.sin(a)*150 - 60, life: 0.55, max: 0.55, r: 3, color: '#9ef04a', grav: 240 });
      }
    }
  }, draw(P, fx){
    const gr = Math.min(74, 14 + fx.t*52); // 毒池从脚下慢慢漫开
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#6fbf2a';
    ctx.beginPath(); ctx.ellipse(P.x, P.y + 14, gr, gr*0.42, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.8; ctx.strokeStyle = '#9ef04a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(P.x, P.y + 14, gr, gr*0.42, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  } },
  // 🍅 番茄酱之神「酱弹礼花」：朝天连发几包番茄酱，到顶点炸成一朵朵红酱花，最后天降一场酱雨
  ketchup: { dur: 2.5, step(P, fx){
    if(fx.t - (fx._last || -1) > 0.34 && fx.t < 1.5){
      fx._last = fx.t;
      SND.boom();
      for(let i = 0; i < 4; i++){
        const a = -Math.PI/2 + (i - 1.5) * 0.30;
        pvpSpark(fx, { x: P.x + Math.cos(a)*16, y: P.y + Math.sin(a)*16,
          vx: Math.cos(a)*250, vy: Math.sin(a)*420, life: 0.5, max: 0.5, r: 4.5, color: '#e6293a', shape:'tracer' });
      }
    }
    for(const s of fx.sp){ // 酱包到顶点 → 炸开成一圈红酱花
      if(s.shape === 'tracer' && s.life <= 0 && !s._boom){
        s._boom = true;
        for(let i = 0; i < 12; i++){
          const a = i/12 * Math.PI*2;
          pvpSpark(fx, { x: s.x, y: s.y, vx: Math.cos(a)*140, vy: Math.sin(a)*140,
            life: 0.6, max: 0.6, r: 3, color: i % 2 ? '#e6293a' : '#ff8a7a', grav: 90 });
        }
        pvpRing(fx, s.x, s.y, 46, 0.45, '#e6293a');
      }
    }
    if(pvpOnce(fx, 'rain', 1.7) && fx.t < 2.4){ // 收尾：天降酱雨（细密红点缓缓洒落）
      for(let i = 0; i < 16; i++){
        pvpSpark(fx, { x: P.x + rand(-150, 150), y: P.y - rand(40, 220),
          vx: rand(-12, 12), vy: rand(60, 130), life: 1.1, max: 1.1, r: rand(2, 4), color: '#e6293a', grav: 30 });
      }
    }
  }, draw(P, fx){
    ctx.save(); // 脚下漫开一滩番茄酱（胜者的"战绩"）
    const gr = Math.min(70, 12 + fx.t*48);
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#d62828';
    ctx.beginPath(); ctx.ellipse(P.x, P.y + 14, gr, gr*0.42, 0, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.75; ctx.strokeStyle = '#e6293a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(P.x, P.y + 14, gr, gr*0.42, 0, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
  } },
  // ⚔️ 将军「亲兵列队」：三名小兵依次落地列队，最后一记金色号角环扫全场
  general: { dur: 2.5, step(P, fx){
    for(let i = 0; i < 3; i++){
      if(pvpOnce(fx, 'sol' + i, 0.4 + i*0.32)){
        SND.summon();
        const x = P.x + (i - 1)*52, y = P.y + 34;
        pvpRing(fx, x, y, 34, 0.4, '#ffd166', 3);
        for(let k = 0; k < 8; k++){
          const a = k/8 * Math.PI*2;
          pvpSpark(fx, { x, y, vx: Math.cos(a)*110, vy: Math.sin(a)*110, life: 0.4, max: 0.4, r: 2.5, color: '#ffd166' });
        }
      }
    }
    if(pvpOnce(fx, 'horn', 1.7)){ SND.levelUp(); G.screenShake = 8; pvpRing(fx, P.x, P.y, 200, 0.6, '#ffd166', 6); }
  }, draw(P, fx){
    ctx.save(); // 三名银甲小兵 + 金描边（第 i 个在 0.4+i*0.32 秒落地，落地后原地轻轻踏步）
    for(let i = 0; i < 3; i++){
      const born = 0.4 + i*0.32;
      if(fx.t < born) continue;
      const age = fx.t - born;
      const x = P.x + (i - 1)*52, y = P.y + 34 - Math.abs(Math.sin(age*6))*4;
      ctx.globalAlpha = Math.min(1, age*5);
      ctx.fillStyle = '#c9d4e4';
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#e8c25a'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  } },
  // 🔮 魔法师「三色魔法阵」：脚下浮出双层旋转法阵，火/冰/土三色星屑螺旋升空
  mage: { dur: 2.5, step(P, fx){
    const cols = ['#ff8a3d', '#8ef0ff', '#d9b38c'];
    if(fx.t < 2.1 && Math.random() < 0.7){
      const a = Math.random()*Math.PI*2, rr = 26 + Math.random()*40;
      pvpSpark(fx, { x: P.x + Math.cos(a)*rr, y: P.y + Math.sin(a)*rr*0.5,
        vx: Math.cos(a+1.9)*70, vy: -rand(50, 130), life: 0.85, max: 0.85, r: 3,
        color: cols[Math.floor(Math.random()*3)] });
    }
    if(pvpOnce(fx, 'cast', 0.2)) SND.levelUp();
    if(pvpOnce(fx, 'cast2', 1.3)){ SND.flame(); pvpRing(fx, P.x, P.y, 110, 0.5, '#ff8a3d', 4); }
  }, draw(P, fx){
    ctx.save(); // 双层旋转法阵：外圈顺时针 + 内圈逆时针，三色小符文绕圈
    ctx.translate(P.x, P.y);
    for(let l = 0; l < 2; l++){
      const r = 40 + l*22, sp = (l ? -1.6 : 2.1);
      ctx.strokeStyle = l ? 'rgba(142,240,255,.55)' : 'rgba(255,138,61,.55)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 8, r, r*0.4, 0, 0, Math.PI*2); ctx.stroke();
      for(let k = 0; k < 6; k++){
        const a = fx.t*sp + k/6*Math.PI*2;
        ctx.fillStyle = ['#ff8a3d','#8ef0ff','#d9b38c'][k % 3];
        ctx.beginPath(); ctx.arc(Math.cos(a)*r, 8 + Math.sin(a)*r*0.4, 3.2, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  } },
  // 🦇 吸血鬼「血月与蝠群」：一轮血月从身后升起，蝙蝠群掠过，红雾弥漫
  vampire: { dur: 2.6, step(P, fx){
    if(pvpOnce(fx, 'moon', 0.15)) SND.bloodDash();
    if(fx.t > 0.5 && fx.t < 2.3 && Math.random() < 0.5){ // 蝙蝠群（V 形小翼）
      pvpSpark(fx, { x: P.x + rand(-140, 140), y: P.y + rand(10, 60),
        vx: rand(-70, 70), vy: rand(-150, -70), life: 1.1, max: 1.1, r: 6,
        color: '#ff4d6d', shape:'bat' });
    }
    if(fx.t - (fx._last || -1) > 0.45 && fx.t < 2.2){ // 血雾滴溅
      fx._last = fx.t;
      for(let i = 0; i < 6; i++){
        const a = Math.random()*Math.PI*2;
        pvpSpark(fx, { x: P.x, y: P.y, vx: Math.cos(a)*130, vy: Math.sin(a)*130 - 40, life: 0.6, max: 0.6, r: 3, color: '#ff4d6d', grav: 220 });
      }
    }
  }, draw(P, fx){
    const rise = Math.min(1, fx.t / 1.1); // 血月升起
    const my = P.y - 40 - rise*150, mr = 62;
    ctx.save();
    const g = ctx.createRadialGradient(P.x + 130, my, 6, P.x + 130, my, mr*2.1);
    g.addColorStop(0, 'rgba(255,77,109,.55)'); g.addColorStop(1, 'rgba(255,77,109,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x + 130, my, mr*2.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#c9203f';
    ctx.beginPath(); ctx.arc(P.x + 130, my, mr, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(120,20,40,.55)'; // 月面暗斑
    ctx.beginPath(); ctx.arc(P.x + 112, my - 14, 15, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(P.x + 148, my + 18, 10, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  } },
  // 🪨 投石「三处堆石山」（2026-10-08 用户定）：舞台四座平台 —— 左上方形立体蓝台 / 右下方形立体红台 /
  //    中间两座高脚八边形黄台（一上一下错开：上台 0.57w/下台 0.43w，关于画面中轴对称；下台杆脚更低·杆更长）。
  //    角色一口气朝蓝台抛 12 块蓝石、朝红台抛 12 块红石、
  //    最后朝两座黄台各抛 3 块黄石（共 30 块），每块落点随机，压到已有石头就往上叠 → 台上堆成小石山。
  stone: { dur: 3.0,
    back(P, fx){ pvpStoneDrawPlats(fx); },   // 平台画在通用粒子之下（石块才落得住、看得见）
    step(P, fx){
      const plats = pvpStonePlats(fx);
      if(pvpOnce(fx, 'snd0', 0.15)) SND.shoot();   // 每波起手一声（逐块配音太吵）
      if(pvpOnce(fx, 'snd1', 0.95)) SND.shoot();
      if(pvpOnce(fx, 'snd2', 1.72)) SND.shoot();
      for(let vi = 0; vi < PVP_STONE_VOLLIES.length; vi++){ // 三波连发：蓝 12 → 红 12 → 黄 3+3
        const v = PVP_STONE_VOLLIES[vi];
        for(let i = 0; i < v.n; i++){
          if(pvpOnce(fx, 'sv' + vi + '_' + i, v.t0 + i*v.gap)) pvpStoneThrow(P, fx, plats[v.plat], v.color);
        }
      }
      for(const s of fx.sp){                    // 抛物线飞行 → 到点落台（落定的石头原地不动）
        if(s.shape !== 'stone' || s._rest) continue;
        const u = Math.min(1, (fx.t - s._t0) / s._T), iu = 1 - u;
        s.x = iu*iu*s._sx + 2*iu*u*s._mx + u*u*s._tx;
        s.y = iu*iu*s._sy + 2*iu*u*s._my + u*u*s._ty;
        s.ang = s._ang0 + s._spin*u;
        if(u >= 1) pvpStoneLand(fx, s);
      }
    } },
  // ⚙️ 工程师「炮阵齐射」（2026-10-08 用户新增角色）：脚下依次拱起 4 座炮台 → 齐射橙色炮弹冲天 → 顶点炸成橙芒。
  //    炮台走 back 层（画在粒子之下），"从地里顶出来"用升起进度 k 表现。
  engineer: { dur: 2.6,
    back(P, fx){
      const spots = engineerWinSpots(P, fx);
      for(let i = 0; i < spots.length; i++){
        const k = clamp((fx.t - (0.20 + i*0.18)) / 0.24, 0, 1);   // 一座一座升起
        if(k <= 0) continue;
        const s = spots[i], R = 15 * (0.55 + 0.45*k), yy = s.y + (1 - k) * 26; // 从地里顶出来
        ctx.save();
        ctx.globalAlpha = k;
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        ctx.beginPath(); ctx.ellipse(s.x, s.y + 7, R, R*0.45, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#333c4c'; pvpOctPath(s.x, yy + 4, R); ctx.fill();
        ctx.fillStyle = '#5b6880'; pvpOctPath(s.x, yy + 1, R * 0.92); ctx.fill();
        ctx.strokeStyle = '#20262f'; ctx.lineWidth = 2; pvpOctPath(s.x, yy + 1, R * 0.92); ctx.stroke();
        ctx.fillStyle = '#77839c'; ctx.beginPath(); ctx.arc(s.x, yy - 3, R*0.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffb347';                               // 炮管一律朝上（齐射姿态）
        ctx.fillRect(s.x - R*0.24, yy - 3 - R*1.6, R*0.48, R*1.6);
        ctx.fillStyle = 'rgba(255,246,214,.95)';
        ctx.beginPath(); ctx.arc(s.x, yy - 3 - R*1.6, R*0.17, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    },
    step(P, fx){
      const spots = engineerWinSpots(P, fx);
      for(let i = 0; i < spots.length; i++){
        if(pvpOnce(fx, 'engBuild' + i, 0.20 + i*0.18)) SND.charge();   // 每升起一座：一声上膛
      }
      if(pvpOnce(fx, 'engVolley', 1.18)){                              // 齐射：4 座同时朝天一发
        SND.shoot(); G.screenShake = 6;
        for(const s of spots){
          pvpSpark(fx, { x: s.x, y: s.y - 26, vx: (s.x - P.x) * 0.35, vy: -470,
            life: 0.58, max: 0.58, r: 4, color:'#ffb347', shape:'tracer' });
        }
        pvpRing(fx, P.x, P.y + 40, 90, 0.4, '#ffb347', 3);
      }
      for(const s of fx.sp){ // 炮弹到顶点 → 炸成一圈橙芒
        if(s.shape === 'tracer' && s.life <= 0 && !s._boom){
          s._boom = true;
          for(let i = 0; i < 10; i++){
            const a = i/10 * Math.PI*2;
            pvpSpark(fx, { x:s.x, y:s.y, vx: Math.cos(a)*140, vy: Math.sin(a)*140,
              life: 0.5, max: 0.5, r: 3, color: i % 2 ? '#ffb347' : '#fff0cf', grav: 130 });
          }
          pvpRing(fx, s.x, s.y, 42, 0.4, '#ffb347');
        }
      }
    } },
  // 🐣 新手「我竟然赢了!」：**无特效** —— 不撒粒子、不掀环、不放礼花，连脚下一圈金光和顶部横幅都不给；
  //    只在头顶"啵"地弹出一个**长方形话语泡泡**，里面写一句「我竟然赢了!」（2026-10-08 用户定）。
  //    bare:true 的语义 = 跳过通用演出（金圈 + 顶部「XX 胜利！」），画面只留自己 draw 的这一样东西。
  rookie: { dur: 2.4, bare: true,
    bubble: { w: 216, h: 64, tail: 13, text: '我竟然赢了!' }, // 横长竖短＝长方形 + 底边居中的小三角尾巴
    step(P, fx){ /* 无特效：全程保持安静，一个粒子都不生成 */ },
    draw(P, fx){
      const B = this.bubble;                                    // 注意：draw 里的 this = 这个 spec
      const k = Math.min(1, fx.t / 0.32);                        // 弹出进度（0.32 秒弹到位）
      const sc = 0.55 + 0.45*k + (k < 1 ? 0.16*Math.sin(k*Math.PI) : 0); // 中段轻微过冲 = "啵"的一下
      const fade = fx.t > fx.dur - 0.3 ? Math.max(0, (fx.dur - fx.t)/0.3) : Math.min(1, fx.t*6);
      const W2 = B.w / 2, H2 = B.h / 2;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(P.x, P.y - 84);                             // 泡泡浮在头顶上方
      ctx.scale(sc, sc);
      ctx.beginPath();                                          // 长方形泡体 + 底边居中一个三角尾巴（指向角色）
      ctx.moveTo(-W2, -H2); ctx.lineTo(W2, -H2); ctx.lineTo(W2, H2);
      ctx.lineTo(B.tail, H2); ctx.lineTo(0, H2 + B.tail); ctx.lineTo(-B.tail, H2);
      ctx.lineTo(-W2, H2); ctx.closePath();
      ctx.fillStyle = 'rgba(250,251,255,.97)';
      ctx.fill();
      ctx.strokeStyle = '#2b3242'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.fillStyle = '#20263a';                                // 深字压浅泡：任何背景上都读得清
      ctx.font = 'bold 27px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(B.text, 0, 1);
      ctx.restore();
      ctx.globalAlpha = 1;
    } },
  // 🥊 弹簧「弹簧拳三连」：原地连出三记蓄力拳（一拳比一拳大），最后一记把冲击波砸向全场
  spring: { dur: 2.6, step(P, fx){
    for(let k = 0; k < 3; k++){
      if(pvpOnce(fx, 'punch' + k, 0.3 + k*0.5)){
        SND.aSpring();
        G.screenShake = 6 + k*3;
        pvpRing(fx, P.x, P.y, 60 + k*46, 0.4, k === 2 ? '#3ddc84' : '#a8f0c4', 4 + k);
        for(let i = 0; i < 8 + k*4; i++){
          const a = i/(8 + k*4) * Math.PI*2;
          pvpSpark(fx, { x: P.x + Math.cos(a)*(20 + k*14), y: P.y + Math.sin(a)*(20 + k*14),
            vx: Math.cos(a)*(160 + k*70), vy: Math.sin(a)*(160 + k*70), life: 0.4 + k*0.1, max: 0.5, r: 3 + k,
            color: i % 2 ? '#3ddc84' : '#eaffea', grav: 120 });
        }
      }
    }
  }, draw(P, fx){ // 一只大弹簧拳套悬在身侧（随出拳节奏一胀一缩）
    const k = Math.min(2, Math.floor(fx.t / 0.5));
    const pulse = 1 + 0.22*Math.sin(fx.t*10) + k*0.16;
    ctx.save();
    ctx.translate(P.x + 40, P.y - 8);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#3ddc84';
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#9fb6a8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; // 弹簧圈
    for(let i = 0; i < 3; i++){
      ctx.beginPath(); ctx.moveTo(10, -5 + i*5); ctx.quadraticCurveTo(20, -9 + i*5, 30, -5 + i*5); ctx.stroke();
    }
    ctx.restore();
  } },
};
// 胜利动画推进（主循环 'pvpwin' 分支调用）：通用粒子/特效继续播完 + 专属演出 + 到点弹结算
function updatePvpVictory(dt){
  // 残留的通用粒子 / 特效继续播完（击杀那一击的爆炸不该冻在半空）
  G.particles.forEach(p => { p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.92; p.vy *= 0.92; p.life -= dt; });
  G.particles = G.particles.filter(p => p.life > 0);
  updateEffects(dt);
  G.bullets.forEach(b => { b.x += (b.vx||0)*dt; b.y += (b.vy||0)*dt; b.life -= dt; if(b.life <= 0) b.dead = true; });
  G.bullets = G.bullets.filter(b => !b.dead);
  if(G.screenShake > 0) G.screenShake -= dt*40;
  const fx = G.pvpVictory;
  if(!fx){ showPvpResult(); return; } // 兜底：没有动画数据直接结算
  fx.t += dt;
  for(const s of fx.sp){ // 先积分（life 可能刚好减到 0，step 里据此触发"到顶点爆开"）
    s.life -= dt;
    s.x += s.vx*dt; s.y += s.vy*dt;
    s.vy += (s.grav || 0)*dt;
    s.vx *= 0.985; s.vy *= 0.985;
  }
  const spec = PVP_WIN_FX[fx.hero] || PVP_WIN_FX.gunner;
  if(spec.step) spec.step(fx.winner, fx);
  fx.sp = fx.sp.filter(s => s.life > 0 && !s._boom);
  fx.rings = fx.rings.filter(r => (r.life -= dt) > 0);
  if(fx.t >= fx.dur){ G.pvpVictory = null; showPvpResult(); }
}
// 胜利动画绘制（画在特效层之上）
function drawPvpVictory(){
  const fx = G.pvpVictory;
  if(!fx) return;
  const P = fx.winner;
  const spec = PVP_WIN_FX[fx.hero] || PVP_WIN_FX.gunner;
  ctx.save();
  // ① 胜者脚下金色光晕（呼吸）—— 🐣 新手是 bare（无特效）：连这圈金光也不给
  if(!spec.bare){
    const glow = 0.28 + 0.2*Math.sin(fx.t*6);
    ctx.globalAlpha = glow;
    const g = ctx.createRadialGradient(P.x, P.y, 4, P.x, P.y, 96);
    g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, 'rgba(255,233,168,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(P.x, P.y, 96, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // ①.5 专属背景层（画在通用粒子之下：🪨 投石的四座堆石台 —— 石块要"落"在台面上，不能被台面盖住）
  if(spec.back) spec.back(P, fx);
  // ② 自定义粒子
  for(const s of fx.sp){
    const al = Math.max(0, Math.min(1, s.life / s.max));
    ctx.globalAlpha = al;
    ctx.fillStyle = s.color;
    if(s.shape === 'tracer'){ // 礼花弹：亮点 + 短尾迹
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.globalAlpha = al*0.5;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx*0.05, s.y - s.vy*0.05); ctx.stroke();
    } else if(s.shape === 'stone'){ // 🪨 投石的石块：长方形石 + 深描边 + 石面高光（与地图上的石头同一套画法）
      const SC = STONE_COLORS[s.skey] || STONE_COLORS.yellow;
      const w2 = PVP_STONE_W/2, h2 = PVP_STONE_H/2;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.ang || 0);
      ctx.fillStyle = SC.body;
      ctx.beginPath();
      ctx.moveTo(-w2, -h2); ctx.lineTo(w2, -h2); ctx.lineTo(w2, h2); ctx.lineTo(-w2, h2); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = SC.ring; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-w2*0.6, -h2*0.44); ctx.lineTo(w2*0.6, -h2*0.44); ctx.stroke();
      ctx.restore();
    } else if(s.shape === 'bubble'){ // 毒液气泡：空心圆
      ctx.strokeStyle = s.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.stroke();
    } else if(s.shape === 'bat'){ // 蝙蝠：两片扑动的翼
      const flap = Math.sin(s.life*22) * 0.6;
      ctx.strokeStyle = s.color; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x - s.r, s.y - flap*4); ctx.quadraticCurveTo(s.x - s.r*0.4, s.y + 3, s.x, s.y);
      ctx.quadraticCurveTo(s.x + s.r*0.4, s.y + 3, s.x + s.r, s.y - flap*4);
      ctx.stroke();
    } else { // 默认：实心圆点
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // ③ 扩散环
  for(const r of fx.rings){
    const k = 1 - r.life / r.maxLife;
    ctx.globalAlpha = Math.max(0, r.life / r.maxLife) * 0.9;
    ctx.strokeStyle = r.color; ctx.lineWidth = r.w * (1 - k*0.6);
    ctx.beginPath(); ctx.arc(r.x, r.y, 4 + (r.max - 4)*k, 0, Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // ④ 英雄专属前景
  if(spec.draw) spec.draw(P, fx);
  // ⑤ 顶部提示：胜者名字 + 「胜利！」（放在局内按钮行下方，避免被按钮挡住）
  //    🐣 新手是 bare（无特效）：顶部横幅也不给 —— 它那句话由专属的长方形泡泡来说
  if(!spec.bare){
    ctx.globalAlpha = Math.min(1, fx.t*3) * (fx.t > fx.dur - 0.3 ? Math.max(0, (fx.dur - fx.t)/0.3) : 1);
    ctx.textAlign = 'center';
    ctx.font = 'bold 34px sans-serif';
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineJoin = 'round';
    ctx.strokeText((seatLabel(P) || '') + ' 胜利！', W/2, 132);
    ctx.fillStyle = '#ffd166';
    ctx.fillText((seatLabel(P) || '') + ' 胜利！', W/2, 132);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}
// ⚔️ 对战重开：回到选角面板（沿用上一局的选择做默认值），AI 模式继续由 AI 当对手
function restartPVP(){
  const ai = !!G.pvpAI;
  const ov = document.getElementById('overlay');
  if(ov){ ov.classList.add('hidden'); ov.innerHTML = ''; }
  G.pvp = false; G.pvpAI = false; G.aiSeats = []; G.ai2p = false; G.mode = 'solo'; G.players = []; G.pvpVictory = null;
  if(ai){ startPVPAI(); }              // 打 AI：重新进选角，2P 仍由 AI 接管
  else { G._pvpAI = false; openHeroPick('pvp'); }
}

function startGame(isChallenge, coop){
  closeHeroCodex(); closeCredits(); // 📖🎬 开战即收起角色图鉴/制作人员（它们只在主界面存在）
  if(netIsHostLinked()) coop = true; // 🌐联机：房主开局即双人（2P 由手机操控）
  const wantTrio = !!G._wantTrio && !netIsHostLinked(); // 👥 三人模式（联机时不支持——手机端只有 2P 一个位）
  const wantAI2P = !!G._wantAI2P && !wantTrio;
  const wantPVP = !!G._wantPVP && !netIsHostLinked(); // ⚔️ 对战模式（联机时不支持：手机当 2P 是合作，不是对打）
  const pvpAI = wantPVP && !!G._pvpAI;                // ⚔️ 对手是否由 AI 接管
  const wantHorde = !!G.hordeOn && !wantPVP;         // 🧟 尸潮开关（叠加在任意模式上）：无技能卡 + 尸潮刷怪 + 连杀加伤；对战纯竞技场不刷怪 → 强制不生效
  G.horde = wantHorde;
  G.combo = 0; G.comboT = 0; G.comboBest = 0;         // 🧟 连杀状态每局复位
  const hordeInfo = document.getElementById('horde-info');
  if(hordeInfo) hordeInfo.style.display = wantHorde ? 'block' : 'none'; // 🧟 尸潮 HUD（连杀/精英波提示）
  G.mode = wantPVP ? 'pvp' : (wantTrio ? 'trio' : (wantAI2P ? 'ai2p' : (coop ? 'duo' : 'solo')));
  G.world = G.worldSel; // 🌌 世界2：用主界面选中的世界开局（默认1；主界面按钮可在 1⇄2 间切换）
  G.pvp = wantPVP;
  G.pvpAI = pvpAI;
  G.ai2p = wantPVP ? pvpAI : wantAI2P; // 🤖 兼容别名：AI 坐 2P（三人模式下 2P 是真人，故为 false）
  G.aiSeats = wantPVP ? (pvpAI ? [1] : []) : (wantTrio ? [2] : (wantAI2P ? [1] : [])); // 🤖 由 AI 接管的座位
  if(wantTrio || wantPVP) coop = true;
  SND.init();
  Music.stop();           // 先断开主界面菜单音乐层，杜绝双曲叠加
  Music.setMode(G.world === 2 ? 'w2calm' : (G.world === 3 ? 'w3calm' : 'calm')); // 切普通波曲风（世界2 虚空曲 / 世界3 腐林曲；Boss波由 startWave 自动切换）
  Music.start();          // 干净重启游戏配乐
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-btns').style.display = 'flex'; // 对局中显示按钮行（暂停/音效/音乐/设置）
  document.getElementById('overlay').classList.add('hidden');
  G.state = 'playing';
  refreshTouchControls(); updateRotateHint(); // 📱 手机模式：进入游戏即亮出双摇杆+技能按钮，竖屏提示
  G.time = 0; G.wave = 0;
  G.enemies = []; G.bullets = []; G.gems = []; G.particles = []; G.effects = []; G.floaters = []; G.slimes = []; G.bombZones = []; G.tornadoes = []; G.minions = []; G.walls = []; G.turrets = []; G.broomTrail = []; G.stones = []; G.stoneShots = []; G.sticks = []; G.boomerangs = []; 
  G.boss = null; G.bossNum = 0; G.inBossWave = false;
  G.cutscene = null; G.wrathBoss = null; G.flash = 0;
  G.paused = false; hidePauseHome(); // 直接解除暂停必须同步收起「返回主页」按钮（防残留）
  G.kills = 0; // 击杀数每局重置（成就按单局计：kill100/kill500）
  G.endlessNewBest = false; // ♾ 无尽模式：本局新纪录标记复位
  G.bossTier = 1; G.bossFinal = false; // ♾ Boss 轮回层数/最终Boss 标记复位（startWave 会重算）
  G.coop = !!coop;
  G.lvQueue = [];
  if(G.coop){
    G.cursor2 = { x: W*0.65, y: H/2 }; // 2P 光标初始位置
    if(wantTrio) G.cursor3 = { x: W*0.5, y: H*0.75 }; // 3P 光标（AI 每帧锁定目标后会覆盖）
  }
  G.cmod = (isChallenge || G.challengeOn) ? rollChallenge(G.coop, G.coop ? (wantTrio ? 3 : 2) : 1) : null; // 挑战开关：主界面开关或参数开启（须在 new Player 前设置）
  const b = document.getElementById('pause-btn');
  if(b) b.textContent = '⏸';
  // 注意：G.player 是动态 getter（多人时返回存活玩家），此刻 G.players 还是上一局的旧数组，
  // 直接读 G.player 会把上一局已阵亡的旧 1P 塞进新局 —— 必须用局部变量构建，不经过 getter
  const p1 = new Player(W/2, H/2, 0);
  G.player = p1;
  G.players = [p1];
  if(G.coop){
    const p2 = new Player(W/2 + 80, H/2, 1); // 2P 橙色（手柄 / AI）
    G.players.push(p2);
    if(wantTrio) G.players.push(new Player(W/2 - 80, H/2 + 60, 2)); // 👥 3P 绿色（三人模式，AI 接管）
    if(G.cmod && G.cmod.isCoop){
      // 多人挑战：各挂各的个人因子（每人 1增益+2减益）；个人 maxHpMul（身体虚弱）构造时读不到，此处补算
      G.players.forEach((p, i) => {
        p.cmod = G.cmod['p' + (i + 1)] || G.cmod.p1;
        const m = p.cmod.maxHpMul;
        if(m !== 1){ p.maxHp = Math.round(p.maxHp * m); p.hp = p.maxHp; }
      });
    }
  }
  const ct = document.getElementById('coop-toast');
  if(ct){ ct.style.display = 'none'; ct.style.opacity = '0'; ct.innerHTML = ''; } // 清掉上一局残留的阵亡/复活横幅
  seedStones(); // 🪨 投石角色的开局铺场（没有投石角色则一块都不刷）
  updateFactorHUD(); // 顶部按钮行刷新挑战因子图标
  G.mouse.x = W/2; G.mouse.y = 0;
  document.getElementById('skill-bar').style.display = 'flex'; // 恢复技能栏显示
  updateSkillBar(); // 基于全新玩家刷新技能栏（含2P栏显隐），清除上一局残留图标
  document.getElementById('levelup').style.display = 'none'; // 防御：确保升级面板不残留
  // 调试辅助：URL 带 ?wave=n 时首次开局直接跳到第 n 波（仅首次生效，用后清除地址栏参数，重开局从第 1 波开始）
  //   ?boss=laser → 默认第 40 波（棱光穹主）；?boss=blade → 默认第 50 波（斩铁剑皇）
  const dbgWave = parseInt(new URLSearchParams(location.search).get('wave') || '', 10);
  const jumpDefault = G.laserBossJump ? 40 : (G.bladeBossJump ? 50 : NaN);
  const wantWave = Number.isFinite(dbgWave) && dbgWave >= 1 ? dbgWave : jumpDefault;
  if(wantPVP){
    startPVPBattle(); // ⚔️ 对战：不刷怪，直接把双方摆上场
  } else if(Number.isFinite(wantWave) && !G.dbgWaveUsed){
    G.dbgWaveUsed = true; // 标记已用过，之后"再来一次"等重开局不再跳波
    try { if(history && history.replaceState) history.replaceState(null, '', location.pathname); } catch(e){}
    startWave(wantWave);
  } else {
    startWave(1);
  }
  if(G.cmod){ G.paused = true; showChallengePanel(); } // 挑战模式：展示词条，点"开战"才开始
}
// 跳波模拟：从第 1 波正常打到第 n 波的理论经验 → 可升到的等级
// 普通波按 spawnEnemy 各类型概率算期望血量（xpDrop = floor(hp/8)），Boss 波按 Boss 掉落的 xpNext 比例算
function calcJumpLevels(n, endless){
  let lv = 1, xp = 0, xpNext = 10;
  const add = (v) => {
    xp += v;
    while(xp >= xpNext){ xp -= xpNext; lv++; xpNext = Math.floor(xpNext * 1.55 + 8); }
  };
  for(let i=1; i<=n; i++){
    if(i % 10 === 0){
      // Boss 波：Boss 宝石按拾取者当前升级需求算倍率
      //   1.2 = 暗影/熔岩/虚空；1.5 = 第40/80/120…波的🔷棱光穹主 与 第50/100/150…波的⚔斩铁剑皇；第30波还有小怪之怒 ×1.6
      add(Math.floor(xpNext * (endless && (i % 40 === 0 || i % 50 === 0) ? 1.5 : 1.2)));
      if(i >= 30) add(Math.floor(xpNext * 1.6));
    } else {
      const count = 5 + i * 2; // 跳波模拟按满编估算（不套用无尽模式的数量上限，避免低估经验）
      let scale = 1 + i * 0.15;
      if(endless) scale += Math.max(0, i - 30) * 0.25; // ♾ 无尽：30波后怪血量额外成长 → 经验同步变多
      // 期望基础血量（与 spawnEnemy 概率一致：快速15/坦克50/远程20/粘液20/冲撞25/激光20/普通25）
      let avg;
      if(i <= 3)            avg = 25;
      else if(i <= 5)       avg = 0.15*15 + 0.85*25;
      else if(i <= 10)      avg = 0.15*15 + 0.10*50 + 0.75*25;
      else if(i <= 20)      avg = 0.15*15 + 0.10*50 + 0.15*20 + 0.15*20 + 0.45*25;
      else                  avg = 0.15*15 + 0.10*50 + 0.15*20 + 0.15*20 + 0.13*25 + 0.15*20 + 0.17*25;
      add(count * Math.max(1, Math.floor(avg * scale / 8)));
    }
  }
  return { lv, xp, xpNext };
}

// 随机升级 count 次技能（只从未满级技能池里随机），返回实际学习次数
function randomLevelSkills(count, targetP){
  const p = targetP || G.players[0] || G.player; // 双人：可指定给谁随机学（默认 1P）
  let learned = 0;
  const drawn = new Set(); // 同一发里已发过的技能：优先避开，别两抽发成同一张（→ 只拿到 1 个技能）
  for(let i=0; i<count; i++){
    const avail = skillsFor(p).filter(s => (p.skills[s.id]||0) < s.max); // 跳波随机补技能同样按角色取池
    if(!avail.length) break;
    const fresh = avail.filter(s => !drawn.has(s.id)); // 没发过的优先；池子被抽干才允许重复
    const pool = fresh.length ? fresh : avail;
    const sk = pool[Math.floor(Math.random() * pool.length)];
    drawn.add(sk.id);
    p.skills[sk.id] = (p.skills[sk.id]||0) + 1;
    if(sk.apply) sk.apply(p);
    learned++;
  }
  updateSkillBar();
  return learned;
}

// 调试辅助：控制台输入 jumpToWave(n) 直接跳到第 n 波（游戏进行中也可用）
function jumpToWave(n){
  if(G.state !== 'playing') startGame();
  G.enemies = []; G.bullets = []; G.effects = []; G.floaters = []; G.slimes = []; G.bombZones = []; G.tornadoes = []; G.minions = []; G.walls = []; G.turrets = []; G.broomTrail = []; G.stones = []; G.stoneShots = []; G.sticks = []; G.boomerangs = []; 
  G.cutscene = null; G.wrathBoss = null; G.flash = 0;
  activePlayers().forEach(p => { p.x = WW() - 100; p.y = WH() - 100; if(p.dead){ p.dead = false; p.hp = p.maxHp; } }); // 跳波后落到右下角（👁️按扩大后世界） + 复活阵亡玩家，避开屏幕中央的升级技能面板
  startWave(n); // 先确保跳波成功（Boss 生成、wave 信息更新），再补升级
  // 跳波模拟升级：算出 1→n 波理论等级，随机补齐技能，否则属性不够打不动高波次
  // try-catch 兜底：升级环节失败绝不影响跳波本身
  try {
    const sim = calcJumpLevels(n, G.endlessOn); // ♾ 无尽模式：模拟等级同步按无尽血量成长估算
    activePlayers().forEach(p => {
      if(sim.lv > p.lv){
        const gained = sim.lv - p.lv;
        p.lv = sim.lv;
        p.xp = 0;
        p.xpNext = sim.xpNext; // 需求曲线与真实逐级升级一致（双人不再×2）
        if(!p.dead) randomLevelSkills(gained, p); // 随机补齐技能（不弹横幅提示）
      }
    });
  } catch(e){ console.error('跳波模拟升级失败（不影响跳波）', e); }
}

function gameOver(){
  SND.gameOver();
  // Music 不停止：作为主界面背景音乐继续播放
  G.state = 'gameover';
  G.paused = false; hidePauseHome(); // 死亡瞬间按钮若在显示状态，直接收起防残留
  refreshTouchControls(); // 结束画面隐藏摇杆，避免压住结算/重开按钮
  document.getElementById('skill-bar').style.display = 'none'; // 结束画面隐藏技能栏，避免残影
  // ♾ 无尽模式：结算显示到达波次，并刷新历史最高纪录
  let endlessLine = '';
  if(G.endlessOn){
    const prev = G.endlessBest || 0;
    if(G.wave > prev){
      G.endlessBest = G.wave; G.endlessNewBest = true;
      try { gameStore.setItem('wb-endless-best', String(G.wave)); } catch(e){}
    }
    endlessLine = '<p style="color:#71e0c4">♾ 无尽模式 · 到达第 ' + G.wave + ' 波'
      + (G.endlessNewBest ? ' —— <b style="color:#ffd166">新纪录！</b>' : '（最高纪录：第 ' + G.endlessBest + ' 波）')
      + '</p>';
    updateEndlessBtn(); // 主界面按钮同步显示最新纪录
  }
  // 🧟 尸潮模式结算：击杀总数 + 最高连杀 + 波次纪录（gameStore 持久化）
  let hordeLine = '';
  if(G.horde){
    const prev = G.hordeBest || 0;
    let best = false;
    if(G.wave > prev){
      G.hordeBest = G.wave; best = true;
      try { gameStore.setItem('wb-horde-best', String(G.wave)); } catch(e){}
    }
    hordeLine = '<p style="color:#8fe8b0">🧟 尸潮模式 · 到达第 <b>' + G.wave + '</b> 波 · 击杀 <b>' + (G.kills||0)
      + '</b> · 最高连杀 <b>×' + (G.comboBest||0) + '</b>'
      + (best ? ' —— <b style="color:#ffd166">新纪录！</b>' : '（最高纪录：第 ' + G.hordeBest + ' 波）')
      + '</p>';
    updateHordeBtn(); // 开关按钮同步显示最新纪录
  }
  const ov = document.getElementById('overlay');
  ov.classList.remove('hidden');
  const lvLine = (G.players && G.players.length ? G.players : [G.player]).filter(Boolean)
    .map(p => `${seatLabel(p)} Lv.${p.lv}`).join(' | '); // 👥 多人：各座位等级都列出来
  // 🪨 死于超载（投石玩家试图双持第二块石头被炸死）→ 结算标题换彩蛋文案
  //    ⚠️ 要连 `_dqCause` 一起认：扣空血到 gameOver() 是同一次同步调用栈里发生的，
  //       那时 `_dqByOverload` 还没落上（见 overloadHurt 的注释）
  const dq = (G.players && G.players.length ? G.players : [G.player])
    .some(p => p && (p._dqByOverload || p._dqCause));
  ov.innerHTML = `<h1 class="lose-color">${dq ? '你被DQ了！' : '游戏结束'}</h1>
    <p>你坚持了 ${Math.floor(G.time/60)}分${Math.floor(G.time%60)}秒</p>
    <p>到达第 ${G.wave} 波 | ${lvLine}</p>
    ${endlessLine}
    ${hordeLine}
    <button onclick="restartGame()">再来一次</button>
    <button onclick="backToMenu()">返回主页</button>`;
}
// 🔁 再来一次：沿用本局模式（单人 / 双人 / 与AI组队 / 三人），不要降级成单人
//   🧟 尸潮不用背旗标——hordeOn 开关本身持久，「再来一次」照常还是尸潮
function restartGame(){
  G._wantTrio = (G.mode === 'trio');
  G._wantAI2P = (G.mode === 'ai2p');
  try { startGame(false, G.coop); } finally { G._wantTrio = false; G._wantAI2P = false; }
}

function winGame(){
  SND.win();
  Achieve.checkWin(); // 通关成就
  if(!G.world1Cleared){ G.world1Cleared = true; try { gameStore.setItem('wb-world1-cleared', '1'); } catch(e){} } // 🌌 只记录「通关过世界1」，不再作为世界2 的门禁
  // Music 不停止：作为主界面背景音乐继续播放
  G.state = 'win';
  G.paused = false; hidePauseHome(); // 胜利瞬间同步收起「返回主页」按钮
  refreshTouchControls(); // 胜利画面隐藏摇杆，避免压住结算/重开按钮
  document.getElementById('skill-bar').style.display = 'none'; // 胜利画面隐藏技能栏，避免残影
  const sb2 = document.getElementById('skill-bar2');
  if(sb2) sb2.style.display = 'none';
  const sb3 = document.getElementById('skill-bar3'); // 👥 三人：3P 技能栏一并隐藏
  if(sb3) sb3.style.display = 'none';
  const l3 = document.getElementById('skill-label3');
  if(l3) l3.style.display = 'none';
  // 胜利界面展示本局升级过的所有技能（双人：两人分别列出）
  const listFor = (p, tag) => skillsFor(p).filter(s => (p.skills[s.id]||0) > 0)
    .map(s => `${s.icon} ${s.name} Lv.${p.skills[s.id]}`).join('　') || `（${tag}本局未学习技能）`;
  const lvLine = (G.players && G.players.length ? G.players : [G.player]).filter(Boolean)
    .map((p, i) => `${seatLabel(p)} Lv.${p.lv}`).join(' | ');
  const skList = multiOn()
    ? G.players.map((p, i) => `<p style="font-size:14px;color:${SEAT_TXT_COLOR[i] || '#8cf'}">${seatLabel(p)}${isAIPlayer(p) ? '(AI)' : ''}：${listFor(p, seatLabel(p))}</p>`).join('')
    : `<p style="font-size:14px;color:#8cf;max-width:600px;line-height:2">${listFor(G.player, '')}</p>`;
  const ov = document.getElementById('overlay');
  ov.classList.remove('hidden');
  ov.innerHTML = `<h1 class="win-color">胜利！</h1>
    <p>你击败了所有Boss！</p>
    <p>用时 ${Math.floor(G.time/60)}分${Math.floor(G.time%60)}秒 | ${lvLine}</p>
    ${skList}
    <button onclick="restartGame()">再玩一次</button>
    <button onclick="backToMenu()">返回主页</button>`;
}

// 暂停/继续（游戏中有效）
function hidePauseHome(){ // 收起暂停界面的「返回主页」按钮（所有绕过 togglePause 直接解除暂停的路径都必须调用，否则按钮残留）
  const phb = document.getElementById('pause-home-btn');
  if(phb) phb.style.display = 'none';
  const ps = document.getElementById('pause-stats'); // 同步收起角色数值面板
  if(ps) ps.style.display = 'none';
}
// 暂停时角色数值面板（2026-10-12）：展示当前角色各项数值（coop/pvp 双人都列）
function showPauseStats(){
  const el = document.getElementById('pause-stats');
  if(!el) return;
  const ps = (G.players && G.players.length) ? G.players : [G.player];
  let html = '<div class="ps-title">⏸ 角色数值一览（点击右上角 ⏸ 继续）</div><div class="ps-cards">';
  let any = false;
  for(const p of ps){
    if(!p) continue; any = true;
    const hk = (typeof heroKind === 'function') ? heroKind(p) : 'gunner';
    const hx = codexHero(hk);
    const hp = Math.max(0, Math.round(p.hp)), mhp = Math.round(p.maxHp);
    const rate = p.shootRate > 0 ? (1 / p.shootRate) : 0;
    let resRow = '';
    if(G.world !== 1){ // 🌌🌿 世界2/世界3 都有资源（魔力/体力）
      if(hk === 'mage' || hk === 'vampire') resRow = `<div class="ps-row"><span>魔力</span><span>${Math.round(p.mana)} / ${Math.round(p.maxMana)}</span></div>`;
      else if(hk === 'swordsman' || hk === 'general' || hk === 'knight' || hk === 'spring') resRow = `<div class="ps-row"><span>体力</span><span>${Math.round(p.stamina)} / ${Math.round(p.maxStamina)}</span></div>`;
    }
    const ids = Object.keys(p.skills || {});
    let sk = ids.length
      ? '<div class="ps-skills">' + ids.map(id => { const s = skillById(id); if(!s) return ''; return `<span class="ps-skill">${s.icon || ''}${s.name} Lv.${p.skills[id]}</span>`; }).join('') + '</div>'
      : '<div class="ps-skills" style="color:#889">（暂无已学技能）</div>';
    html += `<div class="ps-card">
      <div class="ps-hero">${hx.icon || ''} ${hx.name}<span class="ps-lv">Lv.${p.lv || 1}</span></div>
      <div class="ps-row"><span>生命</span><span>${hp} / ${mhp}</span></div>
      <div class="ps-row"><span>移速</span><span>${Math.round(p.speed)}</span></div>
      <div class="ps-row"><span>攻击力</span><span>${Math.round(p.bulletDmg)}</span></div>
      <div class="ps-row"><span>攻速</span><span>${rate.toFixed(2)} 次/秒</span></div>
      ${resRow}
      ${sk}
    </div>`;
  }
  html += '</div>';
  el.innerHTML = html;
  el.style.display = any ? 'block' : 'none';
}
function togglePause(){
  if(G.state !== 'playing') return;
  if(G.challengePanelOpen) return; // 挑战确认面板期间不响应 ⏸（防止面板后游戏偷跑/按钮状态错乱）
  G.paused = !G.paused;
  const b = document.getElementById('pause-btn');
  if(b) b.textContent = G.paused ? '▶' : '⏸';
  const hb = document.getElementById('pause-home-btn');
  if(hb) hb.style.display = G.paused ? 'block' : 'none'; // 暂停时显示「返回主页」
  const psEl = document.getElementById('pause-stats');
  if(psEl) psEl.style.display = G.paused ? 'block' : 'none'; // 暂停时显示角色数值面板
  if(G.paused) showPauseStats(); // 暂停瞬间填充最新数值
  refreshTouchControls(); // 暂停/恢复时同步摇杆显隐（暂停时隐藏，避免压住暂停面板按钮）
}

// 返回主页（从游戏结束/胜利界面回到主菜单，音乐继续当背景）
function backToMenu(){
  G.state = 'menu';
  G.paused = false;
  G.challengePanelOpen = false;
  G.coop = false;
  G.pvp = false; G.pvpAI = false; G.pvpWinner = -1; G.pvpLoser = -1; G.pvpVictory = null; // ⚔️ 对战标记复位：回主页后下一局仍是普通模式
  G.players = [];
  G.aiSeats = []; G.ai2p = false; G.mode = 'solo'; // 👥 主界面不是任何人的对局：模式与 AI 座位清空
  G.lvQueue = [];
  G.cutscene = null; G.wrathBoss = null; G.flash = 0;
  Music.setMode(G.worldSel === 2 ? 'w2menu' : (G.worldSel === 3 ? 'w3menu' : 'menu')); // 返回主页切回专属菜单曲（世界2/世界3 各是另一首，不中断直接换曲）
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('skill-bar').style.display = 'none';
  const sb2 = document.getElementById('skill-bar2');
  if(sb2) sb2.style.display = 'none';
  const sb3 = document.getElementById('skill-bar3'); // 👥 三人：3P 技能栏一并隐藏
  if(sb3) sb3.style.display = 'none';
  const l3 = document.getElementById('skill-label3');
  if(l3) l3.style.display = 'none';
  document.getElementById('levelup').style.display = 'none';
  document.getElementById('boss-bar-wrap').style.display = 'none';
  const hi = document.getElementById('horde-info'); // 🧟 尸潮 HUD：回主页一并收起（防残留悬浮字）
  if(hi) hi.style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('game-btns').style.display = 'none'; // 主界面隐藏局内按钮行
  const phb = document.getElementById('pause-home-btn');
  if(phb) phb.style.display = 'none'; // 清掉暂停「返回主页」按钮
  const b = document.getElementById('pause-btn');
  if(b) b.textContent = '⏸';
  updateChallengeBtn(); update2PBtn(); updateEndlessBtn(); updateWorldBtn(); // 主界面按钮状态恢复
  const hpPanel = document.getElementById('hero-pick');
  if(hpPanel) hpPanel.style.display = 'none'; // 收起开局选角面板（防残留）
  closeHeroCodex(); closeCredits(); // 📖🎬 收起角色图鉴/制作人员（回主界面时它们不该还开着）
  TPAD.disable(); updateRotateHint(); // 📱 退出游戏关掉触控与竖屏提示
}

// ===== 角色教程（设置「📘 进入教程」→ 选角色 → 按远程/近战分支练基础玩法 → 逐个试技能 → 主动技 → 技能图鉴）=====
//   每个角色的「主动技」释放键：🖱 左键 / 手柄 RB（🪨 投石 · 🧪 毒液 无主动技，跳过该节）
const TUT_ACTIVE = {
  gunner:{n:'环形弹幕',b:'左键'}, swordsman:{n:'斩灭',b:'左键'}, laser:{n:'旋转扫射',b:'左键'},
  bomber:{n:'轰炸区',b:'左键'}, tornado:{n:'突进卷风',b:'左键'}, general:{n:'冲刺',b:'左键'},
  mage:{n:'扫帚飞行',b:'左键'}, vampire:{n:'血月突袭',b:'左键'}, rookie:{n:'战吼',b:'左键'},
  engineer:{n:'建造战车',b:'左键'}, boomerang:{n:'万镖齐发',b:'左键'}, dogmilk:{n:'春秋邻域',b:'左键'},
  cardmaster:{n:'飞机',b:'左键'}, ketchup:{n:'吃番茄酱',b:'左键'},
  knight:{n:'勇士冲锋',b:'左键'},
  spring:{n:'弹簧钩',b:'右键'},
};
function startTutorial(){ // 入口：弹角色选择（覆盖在主界面上，选人后再进练习场）
  closeSettings(); closeHeroCodex(); closeCredits();
  hidePauseHome(); // 从暂停中进教程：收起「返回主页」浮动按钮（选人后 startHeroTutorial 会整体复位）
  buildTutHeroPick();
  document.getElementById('tut-hero-pick').style.display = 'block';
}
function tutPickBack(){ document.getElementById('tut-hero-pick').style.display = 'none'; } // 返回主界面
function buildTutHeroPick(){ // 角色网格：按 远程 / 近战 分组（数据来自 HERO_CODEX）
  const wrap = document.getElementById('tut-pick-grid'); if(!wrap) return;
  let html = '';
  for(const [label, role] of [['🏹 远程角色','ranged'], ['⚔️ 近战角色','melee']]){
    html += '<div class="tut-group-label">' + label + '</div><div class="tut-group">';
    for(const x of HERO_CODEX){
      if((HERO_ROLE[x.h]||'ranged') !== role) continue;
      html += '<div class="tut-hero" onclick="tutPickHero(\'' + x.h + '\')"><span class="th-icon">' + x.icon + '</span><span class="th-name">' + x.name + '</span></div>';
    }
    html += '</div>';
  }
  wrap.innerHTML = html;
}
function tutPickHero(h){ document.getElementById('tut-hero-pick').style.display = 'none'; startHeroTutorial(h); }
function startHeroTutorial(h){ // 选中角色 → 进场练习（G.hero=h 让 new Player 建成该角色）
  SND.init(); Music.stop(); Music.setMode(G.world === 2 ? 'w2calm' : (G.world === 3 ? 'w3calm' : 'calm')); Music.start();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-btns').style.display = 'flex';
  document.getElementById('overlay').classList.add('hidden');
  G.state = 'playing'; G.time = 0; G.wave = 0; G.waveTimer = 0;
  G.waveEnemiesLeft = 0; G.inBossWave = false;
  G.enemies = []; G.bullets = []; G.gems = []; G.particles = []; G.effects = []; G.floaters = []; G.slimes = []; G.bombZones = []; G.tornadoes = []; G.minions = []; G.walls = []; G.turrets = []; G.broomTrail = []; G.stones = []; G.stoneShots = []; G.sticks = []; G.boomerangs = []; 
  G.boss = null; G.bossNum = 0; G.cutscene = null; G.wrathBoss = null; G.flash = 0;
  G.paused = false; G.kills = 0; G.coop = false; G.pvp = false; G.pvpAI = false; G.pvpWinner = -1; G.pvpLoser = -1; G.pvpVictory = null; G.lvQueue = []; G.cmod = null; hidePauseHome(); G.challengePanelOpen = false;
  G.hero = h; // 关键：让随后的 new Player 建成选中角色
  G.cursor2 = { x: W/2, y: H/2 };
  const tp1 = new Player(W/2, H*0.42, 0); // 局部变量构建，同 startGame：避免动态 getter 读到旧玩家
  G.player = tp1; G.players = [tp1];
  const tct = document.getElementById('coop-toast');
  if(tct){ tct.style.display = 'none'; tct.style.opacity = '0'; tct.innerHTML = ''; }
  G.mouse.x = W/2; G.mouse.y = 0;
  try { seedStones(); } catch(e){} // 🪨 投石角色：铺场补弹药（非投石角色内部自动跳过）
  document.getElementById('skill-bar').style.display = 'none'; // 教程期间隐藏技能栏，把屏幕底部让给教学横幅
  document.getElementById('levelup').style.display = 'none';
  document.getElementById('tut-guide').style.display = 'none';
  updateSkillBar();
  G.tutorial = { hero:h, role:(HERO_ROLE[h]||'ranged'), phase:'basic', step:1, ring:null, gemTotal:0, skillIdx:0, skillList:[], clickBase:0, rcBase:0, done:false };
  document.getElementById('tut-banner').style.display = 'block';
  tutStep(1);
}
function tutBanner(text, opts){
  opts = opts || {};
  const t = document.getElementById('tut-text');
  if(t) t.innerHTML = text + (opts.done ? '<br><small style="color:#9cf">点下方按钮返回主界面</small>' : '');
  const nx = document.getElementById('tut-next-btn');
  if(nx) nx.style.display = opts.next ? 'inline-block' : 'none';
  const q = document.getElementById('tut-quit-btn');
  if(q) q.textContent = opts.done ? '✅ 完成 · 返回主界面' : '跳过教程';
}
function tutSpawnRing(x, y){ G.tutorial.ring = { x, y, r: 46 }; }
function tutSpawnDummies(n, cx, cy){
  for(let i=0;i<n;i++){
    const e = new Enemy(cx + (i - (n-1)/2)*95, cy, 20, 0, 0, 16, '#c96');
    e.isDummy = true; // 训练木桩：不动、不攻击
    G.enemies.push(e);
  }
}
function tutSpawnGems(n, cx, cy, owner){ // owner: 指定宝石只归该玩家索引（教程 2P 练习用），不传则所有人可捡
  G.tutorial.gemTotal = n;
  for(let i=0;i<n;i++){
    const g = new ExpGem(cx + (i-(n-1)/2)*70, cy + (i%2)*36, 5, '#0f8', 8, false);
    g._tut = true;
    if(owner !== undefined) g._tutOwner = owner;
    G.gems.push(g);
  }
}
function tutHeroName(){ const x = codexHero(G.tutorial.hero); return x.icon + ' ' + x.name; }
function tutBasicStep(n){ // 基础玩法（远程/近战分支）
  const T = G.tutorial, P1 = G.players[0];
  if(n === 1){ tutSpawnRing(W*0.72, H*0.62); tutBanner('【' + tutHeroName() + ' · 移动】用 <b>W A S D</b>（或方向键）移动，走进蓝色光圈'); }
  else if(n === 2){
    T.ring = null; tutSpawnDummies(3, W*0.4, H*0.36);
    if(T.role === 'melee'){
      if(T.hero === 'spring'){ // 🥊 弹簧是"手动蓄力拳"：桌面按住蓄力松手出拳；触屏没有按住手势 → 自动快拳
        tutBanner(G.deviceType === 'phone'
          ? '【' + tutHeroName() + ' · 近战攻击】你是<b>近战角色</b>——走近木桩，会自动打出<b>弹簧快拳</b>把木桩弹飞，击倒全部 3 个训练木桩！'
          : '【' + tutHeroName() + ' · 蓄力攻击】你是<b>近战角色</b>——走近木桩，<b>按住左键蓄力、松手出拳</b>：蓄得越久，拳飞得越远、伤害越高，击倒全部 3 个训练木桩！');
      }
      else tutBanner('【' + tutHeroName() + ' · 近战攻击】你是<b>近战角色</b>——<b>走近木桩</b>，武器会<b>自动挥砍</b>，击倒全部 3 个训练木桩！');
    }
    else tutBanner('【' + tutHeroName() + ' · 远程攻击】你是<b>远程角色</b>——移动<b>鼠标</b>瞄准木桩，武器会<b>自动开火</b>，击倒全部 3 个训练木桩！');
  }
  else if(n === 3){ tutSpawnGems(4, P1.x, Math.max(120, P1.y - 140)); tutBanner('【' + tutHeroName() + ' · 成长】走过去<b>拾取经验宝石</b>升级，在面板里点选一项强化'); }
  else if(n === 4){ tutStartSkills(); } // 基础毕业 → 逐个试技能
}
function tutStartSkills(){ // 进入技能阶段：取该角色可学技能（专属优先，再补通用），封顶 6 个逐个试
  const T = G.tutorial, P1 = G.players[0];
  T.phase = 'skills';
  const k = heroKind(P1);
  const all = skillsFor(P1);
  const excl = all.filter(s => s.hero === k), uni = all.filter(s => s.hero !== k);
  T.skillList = excl.concat(uni).slice(0, 6);
  T.skillIdx = 0;
  tutSkillStep();
}
function tutSkillStep(){ // 授予当前技能（累计生效）+ 出木桩让玩家试
  const T = G.tutorial, P1 = G.players[0];
  if(T.skillIdx >= T.skillList.length){ tutActiveStep(); return; }
  const sk = T.skillList[T.skillIdx];
  P1.skills[sk.id] = (P1.skills[sk.id]||0) + 1;
  try { sk.apply(P1); } catch(e){}
  updateSkillBar();
  tutSpawnDummies(2, W*0.4 + (T.skillIdx%2)*130, H*0.4);
  tutBanner('【技能 ' + (T.skillIdx+1) + ' / ' + T.skillList.length + '】' + (sk.icon||'') + ' <b>' + sk.name + '</b>：' + sk.desc
    + '<br><small style="color:#9cf">已生效——去打木桩试试，或点「下一个」</small>', { next:true });
}
function tutNextSkill(){ // 「下一个」按钮 / 木桩清完：推进到下一个技能
  const T = G.tutorial; if(!T || T.done || T.phase !== 'skills') return;
  T.skillIdx++;
  tutSkillStep();
}
function tutActiveStep(){ // 主动技（大招）：提示按键 + 检测点击
  const T = G.tutorial;
  const a = TUT_ACTIVE[T.hero];
  if(!a){ tutGuideStep(); return; } // 🪨 投石 / 🧪 毒液 无主动技 → 直接进图鉴
  T.phase = 'active';
  tutSpawnDummies(3, W*0.4, H*0.36);
  T.clickBase = G.mouseClicks || 0; T.rcBase = G.mouseRClicks || 0;
  const pad = (T.hero === 'mage' || T.hero === 'spring') ? 'LB' : 'RB'; // 🖱 右键系主动技（法师轮盘/弹簧钩）走手柄 LB
  tutBanner('【主动技】按 <b>' + a.b + '</b>（手柄 ' + pad + '）放出 <b>' + a.n + '</b>！<br><small style="color:#9cf">对准木桩放出去看看</small>');
}
function tutGuideStep(){ const T = G.tutorial; if(!T) return; T.phase = 'guide'; showTutGuide(); }
function showTutGuide(){ // 技能图鉴：角色介绍 + 全部可学技能（数据来自 HERO_CODEX + skillsFor）
  const T = G.tutorial; if(!T) return;
  const x = codexHero(T.hero), P1 = G.players[0];
  const skills = skillsFor(P1);
  const rows = skills.map(s =>
    '<div class="tg-skill"><span class="tg-ic">' + (s.icon||'') + '</span><b>' + s.name + '</b><span class="tg-d">' + s.desc + '</span></div>').join('');
  const body = document.getElementById('tut-guide-body');
  if(body) body.innerHTML =
    '<div class="tg-head"><span class="tg-ic">' + x.icon + '</span><span class="tg-name">' + x.name + '</span></div>'
    + '<div class="tg-role">' + x.role + '</div>'
    + '<div class="tg-desc">' + x.desc + '</div>'
    + '<div class="tg-skills-title">📚 可学习技能（' + skills.length + '）</div>' + rows;
  document.getElementById('tut-guide').style.display = 'block';
}
function tutStep(n){ // 步骤推进（基础阶段入口）
  const T = G.tutorial; if(!T) return;
  T.step = n;
  if(T.phase === 'basic') tutBasicStep(n);
}
function finishTutorial(skipped){
  const T = G.tutorial; if(!T) return;
  T.done = true; T.ring = null;
  G.enemies = G.enemies.filter(e => !e.isDummy); // 清掉残留木桩
  document.getElementById('tut-guide').style.display = 'none';
  tutBanner(skipped ? '✅ 教程结束。<br><b>角色教程完成！</b>'
                    : '🎓 <b>角色教程完成！</b>回去大杀四方吧！', { done:true });
}
function updateTutorial(){ // 主循环每帧调用（仅 playing 且未暂停时）
  const T = G.tutorial; if(!T || T.done) return;
  const P1 = G.players[0];
  if(!P1) return;
  if(T.phase === 'basic'){
    if(T.step === 1){
      if(T.ring && dist(P1, T.ring) < T.ring.r) tutStep(2);
    } else if(T.step === 2){
      if(!G.enemies.some(e => e.isDummy && !e.dead)) tutStep(3);
    } else if(T.step === 3){
      const left = G.gems.filter(g => g._tut && !g.dead).length;
      const settled = G.state === 'playing' && (!G.lvQueue || G.lvQueue.length === 0)
        && document.getElementById('levelup').style.display !== 'block';
      if(T.gemTotal > 0 && left === 0 && P1.lv >= 2 && settled) tutStep(4);
    }
  } else if(T.phase === 'skills'){
    if(!G.enemies.some(e => e.isDummy && !e.dead)) tutNextSkill(); // 木桩清完 → 自动下一个技能
  } else if(T.phase === 'active'){
    const clicked = (G.mouseClicks||0) > T.clickBase || (G.mouseRClicks||0) > T.rcBase;
    if(clicked) tutGuideStep(); // 检测到点击（放了主动技）→ 进图鉴
  }
}
function quitTutorial(){ // 玩家主动退出（跳过或完成后返回）
  G.tutorial = null;
  document.getElementById('tut-banner').style.display = 'none';
  document.getElementById('tut-guide').style.display = 'none';
  document.getElementById('tut-hero-pick').style.display = 'none';
  backToMenu();
}

// 调试辅助：直接开打第30波（虚空主宰）
function debugWave30(){
  startGame();
  jumpToWave(30);
}
// 调试辅助：跳到第30波小怪之怒召唤后阶段（虚空主宰半血+剧情直接触发）
function debugWrathStage(){
  startGame();
  jumpToWave(30);
  G.boss.phase = 2;
  G.boss.hp = Math.floor(G.boss.maxHp * 0.49); // 略低于半血，确保触发"小怪之怒"剧情
  startWrathCutscene();
}

// ===== SETTINGS (统一设置面板：音量/音乐/跳波/成就开关) =====
function openSettings(){
  if(G.state === 'playing' && !G.paused) togglePause(); // 游戏中打开设置自动暂停
  const sl = document.getElementById('vol-slider');
  const vol = Math.round(SND.vol * 100);
  sl.value = vol;
  document.getElementById('vol-val').textContent = vol;
  updateSetButtons();
  document.getElementById('settings-panel').classList.remove('hidden');
}
function closeSettings(){
  document.getElementById('settings-panel').classList.add('hidden');
}
// ===== 🎮 模式选择面板（整合挑战/无尽开关 + 单人/双人/三人/与AI组队/对战/联机入口） =====
function openModeSelect(){
  closeHeroCodex(); closeCredits();
  refreshModeSelect();
  document.getElementById('mode-select').style.display = 'block';
}
function closeModeSelect(){
  document.getElementById('mode-select').style.display = 'none';
  // 🌐 选了联机模式 → 直接弹出联机面板（生成/加入房间）
  if(G.menuMode === 'net') openNetPanel();
}
function refreshModeSelect(){ // 进面板时按手柄状态刷新双人/三人/对战同屏门禁
  update2PBtn();
  // 高亮当前选中的模式卡片
  document.querySelectorAll('#mode-select .ms-card').forEach(c => {
    c.classList.toggle('sel', (c.getAttribute('data-mode') || '') === G.menuMode);
  });
}
function selectMode(mode){ // 🎮 在「模式选择」面板里选一个模式（高亮），不直接开局
  G.menuMode = mode;
  document.querySelectorAll('#mode-select .ms-card').forEach(c => {
    c.classList.toggle('sel', (c.getAttribute('data-mode') || '') === mode);
  });
}
function startWithMenuMode(){ // 🎮 「开始游戏」：以当前选中的模式开局（挑战/无尽开关已叠加）
  const m = G.menuMode || 'solo';
  closeModeSelect();
  if(m === 'coop') openHeroPick('coop');
  else if(m === 'trio') openHeroPick('trio');
  else if(m === 'ai2p') openHeroPick('ai2p');
  else if(m === 'pvp-ai') startPVPAI();
  else if(m === 'pvp') startPVPHuman();
  else if(m === 'net') openNetPanel();
  else openHeroPick(); // solo（默认）
}
function toggleViewMode(){ // 👁️ 视角：正常（世界铺满屏幕）/ 跟随（玩家居中 + 边界墙）
  G.viewMode = (G.viewMode === 'follow') ? 'normal' : 'follow';
  try { gameStore.setItem('wb-viewmode', G.viewMode); } catch(e){}
  updateViewModeBtn();
}
function updateViewModeBtn(){
  const b = document.getElementById('set-view-btn');
  if(b) b.textContent = G.viewMode === 'follow' ? '👁️ 跟随（玩家居中）' : '👁️ 正常';
}
// ===== 按键设置 UI（选操作 → 按键盘/手柄键绑定） =====
function openKeybinds(){
  document.getElementById('settings-panel').classList.add('hidden');
  document.getElementById('keybind-panel').classList.remove('hidden');
  renderKeybinds();
}
function closeKeybinds(){
  if(KEYBINDS.listen) KEYBINDS.cancelListen();
  document.getElementById('keybind-panel').classList.add('hidden');
  openSettings(); // 返回设置面板
}
function kbListen(group, action){ // 进入监听：下一个键盘/手柄输入绑定到该槽位
  KEYBINDS.listen = { group, action };
  renderKeybinds();
}
function kbReset(){ KEYBINDS.reset(); renderKeybinds(); }
function renderKeybinds(){
  for(const g in KEYBINDS.binds){
    for(const a in KEYBINDS.binds[g]){
      const btn = document.getElementById(`kb-${g}-${a}`);
      if(!btn) continue;
      const listening = KEYBINDS.listen && KEYBINDS.listen.group === g && KEYBINDS.listen.action === a;
      btn.textContent = listening ? '⌨️/🎮 请按键…' : KEYBINDS.slotName(g, a);
      btn.classList.toggle('listening', !!listening);
    }
  }
}
// ===== 挑战开关 / 双人按钮门禁 / 手柄检测页 =====
function toggleChallenge(){ // 主界面挑战开关（可与普通/双人任意组合，记忆到 gameStore）
  G.challengeOn = !G.challengeOn;
  try { gameStore.setItem('wb-challenge-on', G.challengeOn ? '1' : '0'); } catch(e){}
  updateChallengeBtn();
}
function updateChallengeBtn(){
  const b = document.getElementById('btn-challenge');
  if(b){
    b.textContent = G.challengeOn ? '⚔ 挑战模式：开' : '⚔ 挑战模式：关';
    b.style.borderColor = G.challengeOn ? '#f6c' : '#555';
    b.style.color = G.challengeOn ? '#f9c' : '#fff';
  }
}
// ===== ♾ 无尽模式开关（可与挑战/双人/联机任意组合，记忆到 gameStore） =====
function toggleEndless(){
  G.endlessOn = !G.endlessOn;
  try { gameStore.setItem('wb-endless-on', G.endlessOn ? '1' : '0'); } catch(e){}
  updateEndlessBtn();
}
function updateEndlessBtn(){
  const b = document.getElementById('btn-endless');
  if(!b) return;
  const best = G.endlessBest > 0 ? '（最高第 ' + G.endlessBest + ' 波）' : '';
  b.textContent = (G.endlessOn ? '♾ 无尽模式：开' : '♾ 无尽模式：关') + best;
  b.style.borderColor = G.endlessOn ? '#3ed6b0' : '#555';
  b.style.color = G.endlessOn ? '#7ff0d8' : '#fff';
}
// ===== 🧟 尸潮模式开关（无技能卡 · 割草战斗；可与任意模式/挑战/无尽组合，记忆到 gameStore） =====
function toggleHorde(){
  G.hordeOn = !G.hordeOn;
  try { gameStore.setItem('wb-horde-on', G.hordeOn ? '1' : '0'); } catch(e){}
  updateHordeBtn();
}
function updateHordeBtn(){
  const b = document.getElementById('btn-horde');
  if(!b) return;
  const best = G.hordeBest > 0 ? '（最高第 ' + G.hordeBest + ' 波）' : '';
  b.textContent = (G.hordeOn ? '🧟 尸潮模式：开' : '🧟 尸潮模式：关') + best;
  b.style.borderColor = G.hordeOn ? '#5c8' : '#555';
  b.style.color = G.hordeOn ? '#8fe8b0' : '#fff';
}
// ===== 🌌🌿 世界切换开关（**不设解锁**：世界2/世界3 随时可进；gameStore 只记「是否通关过世界1」，不挡门） =====
// 三向循环：世界1 → 世界2 → 世界3 → 世界1
function toggleWorld(){
  G.worldSel = (G.worldSel === 1) ? 2 : (G.worldSel === 2 ? 3 : 1); // 1 → 2 → 3 → 1
  updateWorldBtn();
}
const WORLD_NAMES = { 1:'世界1', 2:'世界2（虚空裂隙）', 3:'世界3（蚀根林海）' };
function updateWorldBtn(){
  const b = document.getElementById('btn-world');
  if(!b) return;
  const w = G.worldSel; // 🌌 无解锁门槛：直接按当前选择显示
  try { document.body.classList.toggle('w2', w === 2); document.body.classList.toggle('w3', w === 3); } catch(e){} // 主界面换肤：世界2=虚空紫 / 世界3=腐林绿
  b.disabled = false;
  b.style.opacity = '1';
  b.textContent = '🌍 世界：' + (WORLD_NAMES[w] || '世界1');
  b.style.borderColor = w === 2 ? '#a07bff' : (w === 3 ? '#3fbf6a' : '#555');
  b.style.color = w === 2 ? '#cbb0ff' : (w === 3 ? '#9fe8ae' : '#fff');
  // 🌌 主界面氛围曲跟着世界走（只在菜单状态下生效，不打扰战斗中的曲子）
  try{ if(Music.mode === 'menu' || Music.mode === 'w2menu' || Music.mode === 'w3menu') Music.setMode(w === 2 ? 'w2menu' : (w === 3 ? 'w3menu' : 'menu')); }catch(e){}
}
// ===== 📖 角色图鉴（主界面「📖 角色」按钮打开） =====
//   2026-10-08 用户要求：选角色界面不再写角色介绍，介绍只在主界面「角色」里看
//   → 这里是 12 名角色介绍的**唯一**存放处（选角面板的卡片只剩图标 + 名字，别再往卡片里塞介绍）
//   口径：只有 G.state === 'menu'（主界面）才能打开；开战 / 返回主界面都会自动收起
const HERO_CODEX = [
  { h:'gunner', icon:'🏹', name:'射手', role:'远程 · 自动射击（最容易上手）', diffUp:2, diffMx:2, diffNote:'会走位就基本到位，天花板较浅。',
    desc:'远程自动射击<br>🖱 左键单击 / 手柄RB：环形弹幕（360°连放6圈，CD30s）<br>生命 100 · 机动灵活' },
  { h:'swordsman', icon:'🗡', name:'剑士', role:'近战 · 大剑扇形挥砍', diffUp:2, diffMx:3, diffNote:'上手容易；难在 60 秒一次的斩灭什么时候放。',
    desc:'大剑近战 · 范围内自动挥砍<br>🖱 左键单击 / 手柄RB：前方150°斩灭（小怪秒杀 · Boss吃重斩，CD60s）<br>生命 130 · 对 Boss 伤害 ×1.5' },
  { h:'laser', icon:'🔆', name:'激光', role:'远程 · 全屏光束（不穿透）', diffUp:4, diffMx:5, diffNote:'一边跟准一边管散热，两件事同时干；压住才有输出。',
    desc:'自动锁定 · 全屏光束（不穿透）<br>🖱 左键单击 / 手柄RB：旋转扫射激光（自转光束扫全场，CD30s）<br>对准怪才开火 · 生命 88 · 照射越久越红' },
  { h:'bomber', icon:'💣', name:'爆破', role:'远程 · 瞄准处投放轰炸区', diffUp:3, diffMx:5, diffNote:'落点严格＝光标，还要提前预判；每 6 秒交一次作业。',
    desc:'🖱 左键单击 / 手柄RB：在瞄准处投放轰炸区<br>持续落弹 · 生命 110' },
  { h:'tornado', icon:'🌀', name:'龙卷风', role:'近战 · 突进卷风（开局正面180°）', diffUp:3, diffMx:4, diffNote:'不用瞄得准，难在敢在正确的时候冲进怪堆。',
    desc:'旋风斩近战（开局正面180°，🔄回旋风刃学满360°）<br>🖱 左键单击 / 手柄RB：向光标突进卷起龙卷风<br>吸怪 · 期间减伤60% · 收尾击退 · 生命 118' },
  { h:'venom', icon:'🧪', name:'毒液', role:'远程 · 弹着留毒液领域', diffUp:2, diffMx:2, diffNote:'毒圈半自动生成，要动脑的只有站位。',
    desc:'远程自动射击<br>每 5 发子弹留下一小滩毒液<br>毒液领域持续掉血 · 减速敌人 · 生命 96' },
  { h:'general', icon:'⚔️', name:'将军', role:'近战 · 长枪远攻 + 自动征召小兵', diffUp:3, diffMx:4, diffNote:'118 距离 + 100° 张角，得用腿把枪送到该在的地方。',
    desc:'长枪近战 · 攻击距离远<br>🖱 左键单击：冲刺（CD 5s）<br>每 10 秒自动征召 1 名剑士小兵<br>小兵锁敌 · 砍中拉仇恨 · 生命 126' },
  { h:'mage', icon:'🔮', name:'魔法师', role:'远程 · 右键切换法术（最吃操作）', diffUp:4, diffMx:5, diffNote:'最难的一个：切法术、卡三套冷却、瞄准同时进行，切错或冷却中这一手直接哑火。',
    desc:'🖱 <b>右键单击</b>（手柄 LB）循环切换法术，普攻放的<b>就是当前选中的那个</b><br>🔥 火球（爆炸+灼烧，永远可放）<br>❄️ 冰霜（光标处一片敌人冰冻 3 秒 · 对 Boss 只定身 · <b>2 秒一次</b>）<br>🪨 土墙（贴身立一堵土墙挡弹幕与怪 · 可挡 10 次 · 30 秒一次）<br>⚠️ 选中的法术<b>冷却中这一手就白放</b> —— 得盯着脚下轮盘切<br>🧹 <b>扫帚飞行</b>（🖱 左键：10 秒三倍移速 · 冷却 30 秒）<br>生命 92' },
  { h:'vampire', icon:'🦇', name:'吸血鬼', role:'近战 · 利爪吸血（全场最快）', diffUp:2, diffMx:3, diffNote:'出手最快、容错最高，练的是手感不是脑子。',
    desc:'利爪近战 · <b>全场最快</b>（速度 330）<br>🩸 <b>每次挥爪命中就回血</b>（身边怪越多回得越多）<br>🗡 利爪最短最窄（半径 70 · 正面 90°），但出手比剑士快一半<br>🖱 左键单击：血月突袭（突进 + 沿途切击 + 吸血，CD 6s）<br>生命 86 · 出手极快' },
  { h:'stone', icon:'🪨', name:'投石', role:'远程 · 捡三色石手动砸（落点看鼠标）', diffUp:4, diffMx:5, diffNote:'不用瞄准，但手里只能拿一块 —— 多踩一块就把自己送走。',
    desc:'普攻 <b>拾取器</b>：贴身低频低伤（空手也能防身）<br>💪 <b>身边 300 内恒定 3 块石</b>（捡走 0.6 秒就补回来，永远有弹药）<br>地图上随机刷红/黄/蓝<b>长方形石</b>：走上去自动捡起 → <b>1 秒装填后自动抛出</b><br>落点 = <b>鼠标指针</b>（不自动索敌）<br>🟡 黄=单体最痛（优先砸同色怪） · 🔵 蓝=命中减速 · 🔴 红=范围爆炸<br>砸中<b>同色</b>的怪额外重伤（怪身上有颜色标记）<br>手里同时只能拿一块，踩到第二块<b>自伤 50</b> · 生命 108' },
  { h:'rookie', icon:'🐣', name:'菜鸟', role:'近战 · 木棍最弱，但战吼是全队增益（辅助位）', diffUp:1, diffMx:1, diffNote:'最简单：手滑不受控制，木棍还是随手乱丢、会绊到自己 —— 但都不用练（难的是队友）。',
    desc:'🪵 木棍近战 · <b>本体全员最弱</b>（生命 70 · 速度 205 · 单棍 6 伤 · 范围 62）<br>⚠️ <b>手滑</b>：每 4 棍有一棍打空（只挥出去，不结算伤害）<br>🤾 技能「<b>扔木棍</b>」：每 5 秒朝身边<b>随机位置</b>自动甩一根（<b>0 伤害</b>）——砸到怪木棍消失；落地的木棍谁踩到都<b>绊倒</b>（眩晕 0.5 秒后起身，怪和自己都算；<b>Boss 免疫绊倒但一脚踩碎木棍</b>），存在 10 秒或被踩 4 次就折断<br>🖱 左键单击 / 手柄RB：<b>📣 战吼</b> —— 怪吼退半步（0 伤害）+ <b>自己和队友伤害 ×1.5 持续 3 秒</b>（CD 12s）<br>本体别指望，<b>队友吃增益</b>：队里有个菜鸟，主力输出快一半 · 想受苦就单选它' },
  { h:'engineer', icon:'⚙️', name:'工程师', role:'放置系 · 自动炮台 + 大招「建造战车」', diffUp:3, diffMx:4, diffNote:'平时躺着，一分钟做一次决定；战车开错时机就罚站一分钟。',
    desc:'🔧 扳手近战 · 伤害很低（8 伤），<b>本体只是防身</b><br><b>放置系</b>：每 8 秒<b>自动立一座炮台</b>，炮台自动索敌开火（射程 260 · 存在 12 秒）<br>场上最多 3 座，超了顶掉最老的一座<br>🖱 左键单击 / 手柄RB：<b>大招「建造战车」</b> —— 施工 3 秒后上车：车体更大 · 装甲 260（<b>无法恢复</b>）· 车速 300 · <b>免疫控制</b> · 能推着 Boss 外的任何怪走 · 双炮管远射；打爆后才开始冷却 60s<br>专属技能全在强化炮台：伤害 / 射速 / 射程 / 时长 / 数量 · 生命 100' },
  { h:'boomerang', icon:'🪃', name:'回旋镖', role:'远程 · 扔出去会飞回来的镖（去程+回程各打一次）', diffUp:3, diffMx:4, diffNote:'不难上手（自动扔），难在「卡弧线」——要让怪同时待在去程和回程的路上，还得算着场上最多 2 枚的节奏；大招的刀网则要自己往怪堆里站。',
    desc:'普攻自动扔出回旋镖：朝瞄准方向飞出 <b>300</b> 后<b>折返、追踪你飞回来</b>（回程更快）<br>🎯 <b>往返双段</b>：去程与回程<b>各算一次伤害</b> → 同一个敌人最多吃两下（伤害靠"把怪留在弧线上"）<br>🪃 <b>接住</b>：镖飞回你身上即被接住消失；超时没接住就落地白扔<br>⚠️ 场上同时最多 <b>2 枚</b>：扔太勤会"堵住"—— 得算节奏，别无脑连点<br>🖱 左键单击 / 手柄RB：<b>大招「万镖齐发」</b> —— 向四周连甩 8 枚，每枚<b>贴身高速环绕 5 秒</b>（每秒约 1.9 圈、跟着人走）后自动收回，环绕期间每 0.35 秒咬一口（CD 30s）<br>专属技能：伤害 / 出手 / 弧长+环绕半径 / 飞速+转速 / 回程加重 / 贯穿 / 双镖齐飞 · 生命 100' },
  { h:'dogmilk', icon:'🐶', name:'野生狗奶', role:'近战 · 攻击距离短但命中即「奶住」（定身+持续掉血）', diffUp:2, diffMx:3, diffNote:'手短得贴脸，但奶到谁谁就动不了还掉血；大招「春秋邻域」是全屏核弹（3 分钟一次）。',
    desc:'🐶 短刀近战（攻击距离比剑士还短一截，得真贴上去）<br>命中敌人即「<b>奶住</b>」：<b>定身</b> + <b>秒伤 10 持续（等级×2 秒）</b>（Boss 只冻脚、不锁招）<br>🖱 左键单击 / 手柄RB：<b>大招「春秋邻域」</b> —— 视野内敌人<b>全部定身</b>，场地从中心不断放大、最后爆炸；动画结束<b>秒杀所有小怪/精英</b>（Boss 受 80% 重创，不致死），<b>冷却 180 秒</b><br>专属技能：短刀伤害 / 奶住时长 / 攻击距离 / 大招冷却 / 命中回血 · 生命 100' },
  { h:'cardmaster', icon:'🃏', name:'卡牌大师', role:'远程 · 赌徒（抽 5 张牌扇出，倍率叠伤害，王炸穿透秒杀）', diffUp:3, diffMx:4, diffNote:'看脸：一手好牌（对子/三带/四带/王炸/顺子）伤害爆炸，臭牌就刮痧；大招「飞机」是面前一片的击退+眩晕+重创。',
    desc:'🃏 <b>普攻抽牌</b>：每次出手从 <b>54 张牌随机抽 5 张</b>（13 点数 3~2 × 4 花色 + 大小王），逐张扇出卡牌弹丸<br>🃏 伤害 = <b>牌面点数</b>（3~15）；<b>同点数 2/3/4 张 → 该组每张 ×2/×3/×4</b><br>🃏 <b>王炸</b>（大小王同抽）→ 这一手所有牌<b>秒杀</b>（含 Boss）；顺子（5 张连续）额外加伤<br>🖱 左键单击 / 手柄RB：<b>大招「飞机」</b> —— 斗地主名场面：面前（瞄准方向锥形）所有敌人被<b>大量击退 + 眩晕 2.5 秒 + 重创</b>（Boss 同样吃但按惯例不致死），<b>冷却 100 秒</b><br>专属技能：稳赢(每张+伤) / 手速 / 对子专家(倍率+) / 顺子(加伤+) / 王上加王(单王更狠) / 飞机强化(CD↓+伤↑) · 生命 100' },
  { h:'ketchup', icon:'🍅', name:'番茄酱之神', role:'控场 · 扔番茄酱包减速并爆潭，吃酱捏爆铺大酱潭（重减速+持续伤害）', diffUp:2, diffMx:3, diffNote:'普攻是扔包，扔中就有减速；难在什么时候贴怪群放技能——酱是围着自己炸开的，要把怪引到落点那片酱里；吃酱回血的 30 秒也得挑时候。',
    desc:'🍅 <b>普攻 = 扔出一包番茄酱</b>：甩手扔出一包<b>麦当劳番茄酱</b>（划重点：是麦当劳的），<b>命中敌人 → 严重减速</b>（移速只剩一半，持续 2 秒），并<b>必定</b>当场爆出一滩大酱潭<br>🅰️ 潭内敌人<b>严重减速</b>（走不动）+ <b>持续掉血</b>（每 0.4 秒一跳，普攻潭持续 4.5 秒）<br>🖱 左键单击 / 手柄RB：<b>技能「吃番茄酱」</b> —— 当场吃下一包<b>回复 20 点生命</b>，顺手把空袋狠狠<b>捏爆</b>：酱汁炸出<b>许多滴</b>、落地成多滩大酱潭（持续 7.5 秒，比普攻潭更持久）<br>🧱 技能酱潭可<b>连续控场</b>：围着怪群撒一圈酱，怪追进来就走不动也挠不着你——全场最强的地面控场<br>专属技能：酱香浓郁(潭伤+减速) / 大滩番茄酱(范围) / 酱汁持久(时长) / 捏包老手(出手更快) / 再来一包(回血更多) · 生命 100' },
  { h:'knight', icon:'🛡️', name:'骑士', role:'近战 · 重甲坦克（最厚最慢，举盾挡正面，冲锋带无敌）', diffUp:2, diffMx:3, diffNote:'不用躲正面弹幕（举盾就行），难在把盾转向该挡的方向、以及敢不敢贴脸挥剑。',
    desc:'🛡️ <b>重甲坦克剑士</b>：<b>全场最厚</b>（生命 160）+ <b>全场最慢</b>（速度 185）——跑不快，但正面基本打不进来<br>🗡 <b>挥剑</b>：单剑<b>全场最重</b>（36 伤）、出手<b>全场最慢</b>（0.90 秒）且<b>带 0.30 秒前摇</b>（举剑过顶再落刀，<b>前摇期间盾仍举着能挡，只有真正挥砍那一下收盾——攻击时不能防御</b>）<br>🛡 <b>举盾</b>：<b>不攻击时自动举盾</b>，挡住<b>正面 120°</b> 扇区飞来的<b>攻击与弹幕</b>（挡下即无事发生）；身侧和背面照常挨打——<b>用鼠标把盾转向威胁</b>是核心操作<br>🖱 左键单击 / 手柄RB：<b>主动技「勇士冲锋」</b> —— <b>自身无敌 5 秒</b> + 移速 ×1.5 + 出手 ×0.6；期间<b>范围内的队友每人挂 1 层「次数盾」</b>（一击即破）+ <b>50% 减伤</b>（范围减伤只存在于冲锋期间，没有常驻光环），<b>冷却 20 秒</b><br>专属技能：剑术精进(伤害) / 重甲(血量) / 疾风斩(前摇缩短) / 盾面加宽(格挡张角) / 守护誓言(队友减伤+范围) / 冲锋意志(时长+冷却) · 生命 160' },
  { h:'bard', icon:'🎻', name:'吟游诗人', role:'远程 · 团队治疗（输出全场最低，但能把队友从死亡线拉回来）', diffUp:2, diffMx:3, diffNote:'输出全场最低，难在判断"什么时候该拉曲"——拉早了浪费、拉晚了人已经倒了；自己挨打会断曲，所以得站在队友背后。',
    desc:'🎻 <b>普攻 = 穿透音波</b>：拨弦发出一道音波，<b>一路穿过去</b>（默认穿 2 个目标，共打 3 个），伤害低但很好打中<br>🎵 <b>主动技「回旋曲」</b>（CD 22 秒）：原地拉曲 <b>3 秒</b>，每秒给<b>自己与范围内队友回 8 血</b>，同时<b>移速 +15%</b>（<b>真的在演奏一段曲子</b>：三拍子五声音阶，起手三音琶音接主旋律，越拉越亮）<br>💔 拉曲期间<b>自己挨打就断</b>（断掉只拿回剩下的一半，"嘣"一声断弦）——所以得挑安全的时候演<br>✨ <b>治疗全队</b>：拉曲期间范围内队友一起回血（满血溢出直接浪费，不转护盾）<br>生命只有 <b>85</b>（全场最脆），全靠走位和让队友挡在前面' },
  { h:'spring', icon:'🥊', name:'弹簧', role:'近战 · 蓄力弹飞（按住蓄力松手出拳，把怪打飞撞墙）+ 弹簧钩牵引', diffUp:3, diffMx:4, diffNote:'全场唯一要"攒招"的普攻：按多久决定打多疼、飞多远；难在敢不敢贴脸出拳、以及把怪往墙的方向打。',
    desc:'🥊 <b>普攻「弹簧拳」（按住蓄力）</b>：<b>按住鼠标左键</b>蓄力（最长 1 秒）、<b>松手出拳</b>——拳锋把面前的怪<b>弹飞</b>；<b>蓄力越久飞得越远、伤害越高</b>（伤害 12→42 · 弹飞 760→1740）<br>🧱 <b>撞墙</b>：被弹飞的怪<b>撞到场地墙</b>会受到<b>额外伤害</b>（18→44）并炸开一道<b>冲击波</b>（半径 110→180），把旁边的怪一起掀飞——<b>把怪往墙的方向打</b>是核心输出手法<br>🖱 <b>鼠标右键 / 🎮 手柄 LB（法师切法术那个键）/ 触屏技能按钮：主动技「弹簧钩」</b> —— 甩出一根弹簧钩<b>锚到光标处</b>，把自己<b>拉过去</b>；<b>牵引途中无敌</b>，沿途碰到的怪全部受伤（冷却 9 秒）<br>🎮 <b>手柄玩法</b>：<b>按住 5 键（RB）蓄力、松手弹射</b>，右摇杆瞄准，LB 放钩索<br>📱 触屏没有"按住"手势：出拳退化为<b>自动快拳</b>（范围内有怪就打出最小蓄力的拳），技能按钮照常放钩索<br>专属技能：钢铁拳套(拳伤) / 超弹压缩(飞更远更久) / 墙裂冲击(撞墙更疼波更大) / 长臂钩索(钩更远碰更疼) / 快速上弦(出拳更快) / 弹簧骨架(加血) · 生命 102' },
];
let _codexHero = 'gunner';
function codexHero(h){ for(let i = 0; i < HERO_CODEX.length; i++) if(HERO_CODEX[i].h === h) return HERO_CODEX[i]; return HERO_CODEX[0]; }
// 🎚 操作难度显示（2026-10-09 用户要求）：1~5 星，口径见「角色手法需求排名.md」
//   diffMx=精通（玩到顺手有多难，主口径）· diffUp=上手（第一次玩）
function diffStars(n){ let s = ''; for(let i = 1; i <= 5; i++) s += (i <= n ? '★' : '☆'); return s; }
function diffColor(n){ return n >= 5 ? '#ff6b6b' : n >= 4 ? '#ff9f43' : n >= 3 ? '#ffd166' : '#5fd18a'; }
function diffTier(n){ return n >= 5 ? '极高' : n >= 4 ? '偏高' : n >= 3 ? '中等' : n >= 2 ? '偏低' : '很低'; }
function buildHeroCodex(){ // 左侧角色名列表（每次打开重建，顺带恢复上次看的那一位）
  const list = document.getElementById('cdx-list');
  if(!list) return;
  list.innerHTML = HERO_CODEX.map(x =>
    '<div class="cdx-item' + (x.h === _codexHero ? ' sel' : '') + '" id="cdx-' + x.h + '" onclick="showCodexHero(\'' + x.h + '\')"><span class="ci">' + x.icon + '</span>' + x.name + '</div>').join('');
}
function showCodexHero(h){ // 右侧详情（介绍只有这一份数据，选角卡不再有）
  const x = codexHero(h);
  _codexHero = x.h;
  HERO_CODEX.forEach(y => {
    const it = document.getElementById('cdx-' + y.h);
    if(it) it.classList.toggle('sel', y.h === x.h);
  });
  const info = document.getElementById('cdx-info');
  if(info) info.innerHTML =
    '<div class="cdx-head"><span class="cx-icon">' + x.icon + '</span><span class="cx-name">' + x.name + '</span></div>' +
    '<div class="cdx-role">' + x.role + '</div>' +
    '<div class="cdx-diff"><span class="dl">操作难度</span>' +
      '<span class="dv" style="color:' + diffColor(x.diffMx) + '">' + diffStars(x.diffMx) + '</span>' +
      '<span class="dt">' + diffTier(x.diffMx) + '</span>' +
      '<span class="sep">｜</span>' +
      '<span class="dl">上手</span>' +
      '<span class="dv" style="color:' + diffColor(x.diffUp) + '">' + diffStars(x.diffUp) + '</span>' +
      '<span class="dt">' + diffTier(x.diffUp) + '</span></div>' +
    '<div class="cdx-note">' + x.diffNote + '</div>' +
    '<div class="cdx-desc">' + x.desc + '</div>';
}
function openHeroCodex(){ // 📖 角色图鉴：只有在主界面能打开（游戏中 / 选角面板开着时一律忽略）
  if(G.state !== 'menu') return;
  const hp = document.getElementById('hero-pick');
  if(hp && hp.style.display === 'block') return; // 选角面板在前时不许叠面板
  const c = document.getElementById('cdx-count');
  if(c) c.textContent = HERO_CODEX.length;
  buildHeroCodex(); showCodexHero(_codexHero);
  const p = document.getElementById('hero-codex');
  if(p) p.style.display = 'block';
}
function closeHeroCodex(){
  const p = document.getElementById('hero-codex');
  if(p) p.style.display = 'none';
}

// ===== 🎬 制作人员（主界面「🎬 制作人员」小按钮打开：角色外观墙 + 已删角色纪念像 + 制作名单）=====
//   外观不另做一套皮肤——全部复用游戏内同一套画法（体色链 / drawHeroCrest / 手持武器），
//   小画布肖像靠 withCtx 把全局 ctx 临时换到卡片画布上画（画完即还原）。
function drawCreditPortrait(cv, hero){ // 现役角色：临时造一个真 Player，只取它的外观
  const c2 = cv.getContext && cv.getContext('2d'); if(!c2) return;
  const W2 = cv.width, H2 = cv.height;
  c2.clearRect(0, 0, W2, H2);
  const keepHero = G.hero;
  try {
    G.hero = hero;
    const p = new Player(W2 / 2, H2 / 2, 0);
    p.r = Math.min(W2, H2) * 0.24;
    p.x = W2 / 2; p.y = H2 / 2 + p.r * 0.12;
    p.swingT = 0; p.kNWindT = 0; p.invuln = 0; p.dotFlash = 0; p.dead = false; p.veh = null;
    const ang = -0.38; // 固定持握角（右下斜持）：个个同角，并排才好比对
    withCtx(c2, () => {
      // 体色链与 Player.draw 里的 bodyColor 完全一致（改外观只改这一处口径的源头）
      const bodyColor = p.isBard ? '#7ee0c0' : (p.dotFlash>0 ? '#5c5' : (p.seat === 2 ? '#4ade80' : (p.seat === 1 ? '#f84' : (p.isTornado ? '#8ef0ff' : (p.isGeneral ? '#e8c25a' : (p.isVampire ? '#c0304a' : (p.isEngineer ? '#ff8a3d' : (p.isBoomerang ? '#ff5fa2' : (p.isKetchup ? '#e63b2e' : (p.isKnight ? '#7d9cc0' : (p.melee ? (p.isSpring ? '#6ee7a0' : '#eaf6ff') : (p.isLaser ? p.laserBodyColor() : (p.isBomber ? '#ffb347' : (p.isVenom ? '#9ef04a' : (p.isMage ? '#b48cff' : '#4cf')))))))))))))));
      ctx.fillStyle = bodyColor;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      drawHeroCrest(p); // 🐶🃏🍅 头部配饰 / 贴图
      if(p.melee){ drawMeleeWeapon(p, ang, p.r * 2.4, p.r); if(p.isKnight) drawKnightShield(p, ang); }
      else if(p.isMage) drawMageWeapon(p, ang, p.r);
      else if(p.isKetchup) drawKetchupWeapon(p, ang, p.r);
      else if(p.isBard) drawBardLute(p, ang, p.r); // 🎻 手持鲁特琴
      else drawGunWeapon(p, ang, p.r);
    });
  } finally { G.hero = keepHero; }
}
function drawMemorialPortrait(cv){ // 🥎 投掷者纪念像：角色已删（2026-10-22），用保留的 base64 贴图直接画
  const c2 = cv.getContext && cv.getContext('2d'); if(!c2) return;
  const W2 = cv.width, H2 = cv.height;
  c2.clearRect(0, 0, W2, H2);
  const dummy = { x: W2 / 2, y: H2 / 2, r: Math.min(W2, H2) * 0.30 };
  withCtx(c2, () => drawCharSprite(dummy, SPR_THROWER, 1.0));
}
function buildCredits(){
  const grid = document.getElementById('cr-grid'); if(!grid) return;
  grid.innerHTML = '';
  for(const x of HERO_CODEX){
    const card = document.createElement('div');
    card.className = 'cr-card'; card.id = 'cr-' + x.h;
    const cv = document.createElement('canvas');
    cv.width = 92; cv.height = 92; cv.id = 'cr-cv-' + x.h;
    const nm = document.createElement('div');
    nm.className = 'cr-name'; nm.textContent = x.icon + ' ' + x.name;
    card.appendChild(cv); card.appendChild(nm); grid.appendChild(card);
    drawCreditPortrait(cv, x.h);
  }
  const mem = document.getElementById('cr-mem'); // 🥎 纪念像格子（固定一位）
  if(mem){
    mem.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'cr-card mem'; card.id = 'cr-thrower';
    const cv = document.createElement('canvas');
    cv.width = 92; cv.height = 92; cv.id = 'cr-cv-thrower';
    const nm = document.createElement('div');
    nm.className = 'cr-name'; nm.textContent = '🥎 我的投掷有点菜';
    card.appendChild(cv); card.appendChild(nm); mem.appendChild(card);
    drawMemorialPortrait(cv);
  }
  const c = document.getElementById('cr-count'); if(c) c.textContent = HERO_CODEX.length;
  const note = document.getElementById('cr-mem-note');
  if(note) note.textContent = '「我的投掷有点菜」—— 以作者 B 站 ID 命名的投掷角色（2026-10-20 加入 → 2026-10-22 删除）。看不懂它含义的玩家不必纠结，这里只留一张样子作纪念。';
  const list = document.getElementById('cr-list');
  if(list) list.innerHTML =
    '<b>制作 · 程序 · 数值 · 策划</b> —— 作者本人（B 站「我的投掷有点菜」，一只爱扔道具的杰瑞玩家）<br>' +
    '<b>角色灵感</b> —— VEX 机器人队友：「野生狗奶」这个名字是他起的；「番茄酱之神」的角色创意也来自他<br>' +
    '<b>找 bug · 陪练</b> —— 每一个一路打到最后的玩家<br>' +
    '<b>立项</b> —— 2026-08-10 的一个下午，从一只会发射子弹的小蓝球开始';
}
function openCredits(){ // 🎬 制作人员：与图鉴同档，只有在主界面能打开（游戏中 / 选角面板开着时一律忽略）
  if(G.state !== 'menu') return;
  const hp = document.getElementById('hero-pick');
  if(hp && hp.style.display === 'block') return; // 选角面板在前时不许叠面板
  buildCredits();
  const p = document.getElementById('credits');
  if(p) p.style.display = 'block';
}
function closeCredits(){
  const p = document.getElementById('credits');
  if(p) p.style.display = 'none';
}

// ===== 🗡 开局角色选择（每局开始前弹面板选，不再在主界面提前定） =====
//  单人：点卡片即开局
//  双人：一次给 1P / 2P 各选一个（默认沿用上次的选择），点「开战！」开局
//  🤖AI组队：同样弹面板，1P 是你、2P 是 AI（默认高亮射手，可换剑士/激光），点「开战！」开局
// 七个可选角色：gunner 射手 / swordsman 剑士 / laser 激光 / bomber 爆破 / tornado 龙卷风 / venom 毒液 / general 将军
//   （💣爆破 · 🌀龙卷风 · 🧪毒液 2026-10-05 新增；⚔️将军 2026-10-06 新增）
const HERO_KINDS = ['gunner','swordsman','laser','bomber','tornado','venom','general','mage','vampire','stone','rookie','engineer','boomerang','dogmilk','cardmaster','ketchup','knight','bard','spring']; // 🥊 spring＝弹簧（2026-10-25 第十九个角色·蓄力弹飞：按住左键蓄力、松手出拳把面前的怪弹飞——蓄力越久飞得越远伤害越高，撞墙额外伤害+冲击波；主动技「弹簧钩」锚到光标处把自己拉过去，牵引无敌+碰伤） // 🐣 rookie＝菜鸟（2026-10-08 第十一角色，原名"新手"）· ⚙️ engineer＝工程师（2026-10-08 第十二角色·放置系）· 🪃 boomerang＝回旋镖（2026-10-09 第十三角色·普攻往返双段；2026-10-10 大招改为「环绕自身 5 秒收回」）· 🐶 dogmilk＝野生狗奶（2026-10-18 第十四角色·近战短手·命中奶住+大招核弹）· 🃏 cardmaster＝卡牌大师（2026-10-18 第十五角色·远程赌徒·抽5张牌扇出+王炸秒杀+大招「飞机」）· 🍅 ketchup＝番茄酱之神（2026-10-20 第十六角色·控场系·普攻扔麦当劳番茄酱包：命中严重减速 2s + 35% 概率爆大酱潭；主动技「吃番茄酱」回 20 血 + 捏爆空袋爆多滴酱落地成多滩大酱潭（持续 7.5s 比普攻潭持久），CD 30s）· 🛡 knight＝骑士（2026-10-21 第十七角色·重甲坦克剑士：全场最厚 160 血 + 最慢 185 速，单剑最重 36 伤/0.90s 且带 0.30s 前摇；不攻击时举盾挡正面 120° 攻击与弹幕；主动技「勇士冲锋」CD 20s：自身无敌 5s + 移速×1.5 + 出手×0.6，范围内队友挂 1 层次数盾（一击即破）+ 50% 减伤）  · 🎻 bard＝吟游诗人（2026-10-22 第十八角色·本作唯一的治疗位：普攻穿透音波，主动技「回旋曲」拉曲回血 + 移速，被打断只拿一半，华彩可加曲子半径）
const HERO_IDS = [0,1,2].flatMap(s => HERO_KINDS.map(h => 'hc' + (s+1) + '-' + h));
function heroOk(h){ return HERO_KINDS.indexOf(h) >= 0; } // URL / gameStore 里的角色名合法性校验（唯一口径）
aiHistLoad(); // 🤖 读回 AI 最近几局用过的角色（跨页面也不重样）
function heroCardId(side, hero){ return (side === 2 ? 'hc3-' : (side === 1 ? 'hc2-' : 'hc1-')) + (heroOk(hero) ? hero : 'gunner'); }
function paintHeroPick(){
  const picks = [G._pickHero || G.hero || 'gunner', G._pickHero2 || G.hero2 || 'gunner', G._pickHero3 || G.hero3 || 'gunner'];
  const m = G._heroPickMode;
  const nSide = m === 'trio' ? 3 : ((m === 'coop' || m === 'ai2p' || m === 'pvp') ? 2 : 1); // 本次要选几个座位（⚔️ 对战也是两栏：1P 你 / 2P 对手或 AI —— 抽到的 AI 角色也要高亮出来）
  HERO_IDS.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('sel');
    el.style.borderColor = '#555';
  });
  for(let i = 0; i < 3; i++){
    const el = document.getElementById(heroCardId(i, picks[i]));
    if(!el) continue;
    if(i < nSide){ el.classList.add('sel'); el.style.borderColor = '#ffd166'; }
  }
}
function openHeroPick(mode){ // mode: ''=单人开局 / 'coop'=双人 / 'ai2p'=与 AI 组队 / 'trio'=三人（键鼠+手柄+AI）
  closeHeroCodex(); closeCredits(); // 📖🎬 进选角就收起图鉴/制作人员（介绍只在主界面看，选角面板不叠它们）
  try { // URL 明确指定 ?hero= 时跳过面板直接用该角色（测试/分享链接用）
    const q = new URLSearchParams(location.search);
    const h = q.get('hero');
    if(heroOk(h)){
      G.hero = h;
      const h2 = q.get('hero2');
      if(heroOk(h2)) G.hero2 = h2;
      const h3 = q.get('hero3');
      if(heroOk(h3)) G.hero3 = h3;
      if(mode === 'ai2p'){ launchAI2P(); return; } // 🤖 AI 组队也尊重 URL 指定角色：直接开局
      if(mode === 'trio'){ launchTrio(); return; } // 👥 三人模式同理
      if(mode === 'pvp'){
        // 🤖 URL 没指定 ?hero2= 时，AI 的角色照样由它自己挑
        if(G._pvpAI && !heroOk(h2)){ G.hero2 = G._aiPickFinal || aiPickForDirect(h); aiHistPush(G.hero2); }
        launchPVP(); return;                       // ⚔️ 对战同理（?hero= / ?hero2= 指定双方角色）
      }
      return mode === 'coop' ? startGame(false, true) : startGame();
    }
  } catch(e){}
  G._heroPickMode = mode || '';
  G._pickHero = G.hero || 'gunner';
  G._pickHero2 = G.hero2 || 'gunner';
  G._pickHero3 = G.hero3 || 'gunner';
  const duo = mode === 'coop' || mode === 'ai2p' || mode === 'trio' || mode === 'pvp'; // 多人：一起选 + 开战按钮
  const trio = mode === 'trio';
  const pvp = mode === 'pvp'; // ⚔️ 对战：两栏（我方 / 对手），没有合作说法（对手是不是 AI 由入口决定）
  const side2 = document.getElementById('hp-side-2');
  const side3 = document.getElementById('hp-side-3');
  const go = document.getElementById('hp-go');
  const title = document.getElementById('hp-title');
  const sub = document.getElementById('hp-sub');
  const t1 = document.getElementById('hp-t1');
  const t2 = document.getElementById('hp-t2');
  const t3 = document.getElementById('hp-t3');
  if(side2) side2.style.display = duo ? 'flex' : 'none'; // 单人只显示 1P 那一半
  if(side3) side3.style.display = trio ? 'flex' : 'none';
  if(go) go.classList.toggle('hidden', !duo);            // 单人点卡片即开局，不需要开战按钮
  if(t1) t1.textContent = pvp ? '1P · 你' : (mode === 'ai2p' ? '1P · 你' : (trio ? '1P · 你（键鼠）' : (duo ? '1P 玩家' : '1P · 点卡片就开始'))); // 单人不再复述一遍大标题
  if(t2) t2.textContent = pvp ? (G._pvpAI ? '2P · AI 对手' : '2P · 手柄对手') : (mode === 'ai2p' ? '2P · AI 队友' : (trio ? '2P · 手柄队友' : '2P'));
  if(t3) t3.textContent = '3P · AI 队友';
  if(title) title.textContent = pvp ? '⚔️ 对战模式 · 各自选一个角色'
    : (trio ? '三人模式 · 各自选一个角色'
    : (mode === 'ai2p' ? '与 AI 组队 · 选角色' : (duo ? '双人模式 · 各自选一个角色' : '选择你的角色')));
  if(sub) sub.textContent = pvp
    ? (G._pvpAI
      ? '不刷怪 · 纯单挑：把对手的血打空就赢 —— 对手的角色由 AI 自己挑（它有自己的性格，也会看你选什么来应对，且不会连着两局用同一个），定好后点「开战！」'
      : '不刷怪 · 纯单挑：把对手的血打空就赢（玩家之间伤害单独折算，不会一击秒杀）—— 两边都选好后点「开战！」')
    : (trio
    ? '1P 用键鼠、2P 用手柄、3P 是 AI 队友 —— 三个角色都选好后点「开战！」（AI 累计经验领先时会主动让经验给你）'
    : (mode === 'ai2p'
      ? '1P 是你、2P 是 AI 队友，都选好后点「开战！」（AI 拿射手最顺手；你的经验落后时它会主动让经验）'
      : (duo ? '1P 和 2P 都选好后点「开战！」，两人可以都选同一个角色（剑士/激光都可以）' : '点一下卡片就开始')));
  paintHeroPick();
  const panel = document.getElementById('hero-pick');
  if(panel){ panel.classList.toggle('trio', mode === 'trio'); panel.style.display = 'block'; } // 👥 三栏紧凑布局开关
}
function pickHeroSide(side, hero){ // 多人：只切换高亮，等「开战！」
  const m = G._heroPickMode;
  if(m !== 'coop' && m !== 'ai2p' && m !== 'trio' && m !== 'pvp'){ return pickHero(hero); } // 单人守卫：误用也按单人处理
  if(G._pvpAI && side === 1) return;        // 🤖 打 AI 时对手的角色由 AI 自己挑，玩家点它没反应
  if(side === 2) G._pickHero3 = hero;
  else if(side === 1) G._pickHero2 = hero;
  else G._pickHero = hero;
  if(m === 'pvp' && G._pvpAI && side === 0){
    // 🧠 你换了角色 → AI 立刻重新应对（沿用同一套性格重挑一次 → 看得见它跟着变）
    aiPickBrain(true);
    aiPickTheater(3, 85);
    return;                                  // theater 自己会 paint（含「正在挑选」提示）
  }
  paintHeroPick();
}
function confirmHeroPick(){ // 多人：把各座位的选择一次落实 → 开局
  const mode = G._heroPickMode;
  if(G._pvpAI && G._aiPicking && G._aiPickFinal){   // 🤔 你手快，AI 还在“挑” → 直接把它早已算好的结果落锤
    if(AI_PICK_TIMER){ clearInterval(AI_PICK_TIMER); AI_PICK_TIMER = null; }
    G._aiPicking = false;
    G._pickHero2 = G._aiPickFinal;
  }
  G.hero = G._pickHero || 'gunner';
  G.hero2 = G._pickHero2 || 'gunner';
  G.hero3 = G._pickHero3 || 'gunner';
  if(mode === 'pvp' && G._pvpAI) aiHistPush(G.hero2); // 🤖 记下这局用了谁 → 下局不重样（“不能一直选同一个”）
  try { gameStore.setItem('wb-hero', G.hero); gameStore.setItem('wb-hero2', G.hero2); gameStore.setItem('wb-hero3', G.hero3); } catch(e){}
  closeHeroPick();
  if(mode === 'ai2p') launchAI2P();
  else if(mode === 'trio') launchTrio();
  else if(mode === 'pvp') launchPVP();
  else startGame(false, true);
}
function closeHeroPick(){
  if(AI_PICK_TIMER){ clearInterval(AI_PICK_TIMER); AI_PICK_TIMER = null; } // 🎬 面板一关，选角演出立即停
  G._aiPicking = false;
  const panel = document.getElementById('hero-pick');
  if(panel) panel.style.display = 'none';
  G._heroPickMode = null;
}
function pickHero(hero){ // 单人：选定角色 → 收面板 → 真正开局
  G.hero = hero;
  try { gameStore.setItem('wb-hero', hero); } catch(e){}
  const m = G._heroPickMode;
  closeHeroPick();
  if(m === 'coop'){ G.hero2 = G._pickHero2 || 'gunner'; startGame(false, true); }
  else startGame();
}
function update2PBtn(){ // 双人/三人/对战卡片：检测到手柄才可点击（2P 要用手柄）
  const b = document.getElementById('btn-coop');
  const b3 = document.getElementById('btn-trio');
  const bp = document.getElementById('btn-pvp');
  const setGating = (el, needPad) => {
    if(!el) return;
    const ok = !needPad || GP.connected;
    el.disabled = !ok;
    el.style.opacity = ok ? '1' : '0.45';
  };
  setGating(bp, true);   // 对战 · 双人同屏：需手柄
  setGating(b, true);    // 双人模式：需手柄
  setGating(b3, true);   // 三人模式：需手柄
}
function updateGpTest(){ // 设置面板里的手柄实时检测：显示按键编号与摇杆原始值
  const el = document.getElementById('gp-test');
  if(!el || document.getElementById('settings-panel').classList.contains('hidden')) return;
  GP.poll();
  if(!GP.connected){ el.innerHTML = '未检测到手柄——插上后<b>按任意键</b>唤醒'; return; }
  const btns = (GP.pad.buttons || []).map((b,i) => (b.pressed || b.value > 0.5) ? `<b style="color:#fd4">${i}</b>` : i);
  const ax = (GP.pad.axes || []).map(v => (v>=0?'+':'') + v.toFixed(2));
  el.innerHTML = `✅ 已连接：${GP.pad.id}<br>按键(${btns.length})：${btns.join(' ')}<br>摇杆：${ax.join(', ')}`;
}
setInterval(() => { try { updateGpTest(); } catch(e){} }, 150); // 手柄检测页实时刷新
try { if(gameStore.getItem('wb-challenge-on') === '1') G.challengeOn = true; } catch(e){}
try { if(gameStore.getItem('wb-endless-on') === '1') G.endlessOn = true; } catch(e){} // ♾ 无尽模式开关记忆
try { if(gameStore.getItem('wb-horde-on') === '1') G.hordeOn = true; } catch(e){} // 🧟 尸潮模式开关记忆
try { const h = gameStore.getItem('wb-hero'); if(heroOk(h)) G.hero = h; } catch(e){} // 🗡 角色记忆（1P）
try { const h2 = gameStore.getItem('wb-hero2'); if(heroOk(h2)) G.hero2 = h2; } catch(e){} // 🗡 角色记忆（2P）
try { G.world1Cleared = gameStore.getItem('wb-world1-cleared') === '1'; } catch(e){} // 🌌 仅读取通关记录（世界2 无需解锁）
try { const h3 = gameStore.getItem('wb-hero3'); if(heroOk(h3)) G.hero3 = h3; } catch(e){} // 🗡 角色记忆（3P）
try { G.endlessBest = Math.max(0, parseInt(gameStore.getItem('wb-endless-best') || '0', 10) || 0); } catch(e){} // ♾ 最高波次记录
try { G.hordeBest = Math.max(0, parseInt(gameStore.getItem('wb-horde-best') || '0', 10) || 0); } catch(e){} // 🧟 尸潮最高波次记录
try { G.showDamage = gameStore.getItem('wb_showdmg') === '1'; } catch(e){} // 🔢 显示伤害数值开关记忆
try { if(gameStore.getItem('wb-viewmode') === 'follow') G.viewMode = 'follow'; } catch(e){} // 👁️ 视角记忆
updateChallengeBtn();
updateEndlessBtn();
updateHordeBtn(); // 🧟 尸潮开关按钮状态
update2PBtn();
updateWorldBtn(); // 🌌 世界按钮（随时可在 世界1 ⇄ 世界2 间切换）
updateViewModeBtn(); // 👁️ 视角按钮状态
function applyVolume(v){ // 0~100 → 主音量（gameStore 记忆，音效+BGM 同步）
  v = Math.max(0, Math.min(100, parseInt(v, 10) || 0));
  document.getElementById('vol-val').textContent = v;
  SND.vol = v / 100;
  if(SND.master) SND.master.gain.value = SND.vol;
  try{ gameStore.setItem('wb_vol', '' + v); }catch(e){}
}
function toggleMusicSetting(){
  Music.toggle();
  updateSetButtons(); updateMusicBtn();
}
function toggleAchSetting(){
  Achieve.setOn(!Achieve.on);
  updateSetButtons();
}
function toggleDamageSetting(){ // 🔢 显示伤害数值开关（gameStore 记忆）
  G.showDamage = !G.showDamage;
  try{ gameStore.setItem('wb_showdmg', G.showDamage ? '1' : '0'); }catch(e){}
  updateSetButtons();
}
function settingsJump(n){ // 菜单里=开局跳波；对局里=直接跳
  if(G.state === 'playing') jumpToWave(n);
  else { startGame(); jumpToWave(n); }
  closeSettings();
  if(G.paused) togglePause(); // 对局暂停中跳波：跳完自动解除暂停回到战斗
}
// 🔷 跳到激光 Boss「棱光穹主」：它只在无尽模式出现（第 40/80/120… 波），
//   所以先把无尽模式打开再跳，否则第 40 波出的是暗影领主（普通模式轮换）
function settingsJumpLaserBoss(){ jumpToLaserBoss(); }
function jumpToLaserBoss(){
  if(!G.endlessOn){
    G.endlessOn = true;
    try { gameStore.setItem('wb-endless-on', '1'); } catch(e){}
    updateEndlessBtn();
  }
  settingsJump(40);
}
// ⚔ 跳到「斩铁剑皇」：同样只在无尽模式出现（第 50/100/150… 波），先开无尽再跳
function settingsJumpBladeBoss(){ jumpToBladeBoss(); }
function jumpToBladeBoss(){
  if(!G.endlessOn){
    G.endlessOn = true;
    try { gameStore.setItem('wb-endless-on', '1'); } catch(e){}
    updateEndlessBtn();
  }
  settingsJump(50);
}
// 💥 跳到「碎撞巨像」：世界2 无尽专属（第 40/80/120… 波 = 6+((4-1)%4)=9），先切世界2 + 开无尽再跳
function settingsJumpRamBoss(){ jumpToRamBoss(); }
function jumpToRamBoss(){
  G.worldSel = 2; // 🌌 切到世界2（碎撞巨像是世界2无尽专属 Boss）
  if(!G.endlessOn){
    G.endlessOn = true;
    try { gameStore.setItem('wb-endless-on', '1'); } catch(e){}
    updateEndlessBtn();
  }
  settingsJump(40); // 世界2无尽：w2cyc=4 → bossNum = 6+((4-1)%4) = 9
}
// 🌿 跳到「万秽之源」：世界3 无尽专属（第 40/80/120… 波 = 10+((4-1)%4)=13），先切世界3 + 开无尽再跳
function settingsJumpSourceBoss(){ jumpToSourceBoss(); }
function jumpToSourceBoss(){
  G.worldSel = 3; // 🌿 切到世界3（万秽之源是世界3无尽专属 Boss）
  if(!G.endlessOn){
    G.endlessOn = true;
    try { gameStore.setItem('wb-endless-on', '1'); } catch(e){}
    updateEndlessBtn();
  }
  settingsJump(40); // 世界3无尽：w3cyc=4 → bossNum = 10+((4-1)%4) = 13
}
function updateSetButtons(){
  const mb = document.getElementById('set-music-btn');
  if(mb) mb.textContent = (Music.on && Music.playing) ? '🎵 开' : '🎵 关';
  const ab = document.getElementById('set-ach-btn');
  if(ab) ab.textContent = Achieve.on ? '🏆 开' : '🏆 关';
  const db = document.getElementById('set-dmg-btn'); // 🔢 显示伤害数值开关
  if(db) db.textContent = G.showDamage ? '🟢 开' : '🔴 关';
}

// ===== 🌐 NET：局域网联机（WebRTC 直连 + 手动交换连接码，无需服务器） =====
// 架构：主机权威 —— 1P（房主，电脑）跑完整模拟；2P（客户端，手机）上行输入、下行快照后渲染
// 本模块中"编解码 / 协议"部分不依赖任何浏览器 API，可在 vm 沙盒直接单测；
// WebRTC 部分通过 NET._PC 注入构造器桩即可离线测试（沙盒没有 RTCPeerConnection）
function r3(v){ return Math.round(Number(v||0)*1000)/1000; }
function netIsPhone(){ // 粗略判定当前设备是不是「手机」（触屏 + 小屏）；用于镜像策略
  const touch = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  const small = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) <= 820;
  return !!(touch && small);
}

const B64U = { // base64url：自实现，不依赖 btoa/atob（沙盒可用）
  _t:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
  encBytes(buf){ // 字节数组 → base64url（连接码压缩的核心）
    let out = '';
    for(let i=0;i<buf.length;i+=3){
      const b0=buf[i], b1=buf[i+1], b2=buf[i+2];
      out += this._t[b0>>2];
      out += this._t[((b0&3)<<4) | ((b1||0)>>4)];
      out += (b1===undefined) ? '' : this._t[((b1&15)<<2) | ((b2||0)>>6)];
      out += (b2===undefined) ? '' : this._t[b2&63];
    }
    return out;
  },
  decBytes(s){
    s = String(s).replace(/[^A-Za-z0-9\-_]/g,'');
    const bytes = [];
    for(let i=0;i<s.length;i+=4){
      const c0=this._t.indexOf(s[i]), c1=this._t.indexOf(s[i+1]),
            c2=this._t.indexOf(s[i+2]), c3=this._t.indexOf(s[i+3]);
      if(c0<0||c1<0) break;
      bytes.push((c0<<2)|(c1>>4));
      if(c2>=0) bytes.push(((c1&15)<<4)|(c2>>2));
      if(c3>=0) bytes.push(((c2&3)<<6)|c3);
    }
    return bytes;
  },
  enc(str){
    const buf = (typeof TextEncoder !== 'undefined') ? new TextEncoder().encode(str)
      : Array.from(unescape(encodeURIComponent(str)), c => c.charCodeAt(0));
    return this.encBytes(buf);
  },
  dec(s){
    return decodeURIComponent(escape(String.fromCharCode.apply(null, this.decBytes(s))));
  }
};

const PROTO = {
  enc(o){ return JSON.stringify(o); },
  dec(s){ try{ const o = JSON.parse(s); return (o && typeof o === 'object') ? o : null; } catch(e){ return null; } },
  hello(){ return { t:'hello', v:(typeof NET!=='undefined'?NET.VER:1), app:(typeof NET!=='undefined'?NET.APP:'pc'), phone: netIsPhone() }; },
  input(move, aim, s){ const m = move||[0,0], a = aim||[0,0];
    return { t:'in', m:[r3(m[0]), r3(m[1])], a:[r3(a[0]), r3(a[1])], s: s ? 1 : 0 }; },
  ping(ts){ return { t:'ping', ts:ts||0 }; },
};

const NET = {
  VER: 1,
  APP: 'pc',                 // 端类型：'pc' 电脑版 / 'mobile' 手机版（两类互不联机）
  role:null,                 // 'host' | 'client'
  state:'idle',              // idle|making|waiting|connecting|connected|closed|error
  lastError:'',
  pc:null, dc:null, useStun:true,
  onState:null, onMessage:null,
  _PC:null,                  // 测试注入：RTCPeerConnection 构造器
  remote:{ m:[0,0], a:[1,0] }, // 房主侧：2P 最新上行输入（移动向量 / 瞄准向量）
  isPhone:false, peerPhone:false, vpc:null, vpcClient:null, mirrorOn:false, // 镜像画面相关
  msgs:[],                   // 收到过的消息（调试 & 测试用）
  setState(s){ this.state = s; if(typeof this.onState === 'function') this.onState(s); },
  // ---------- 连接码：精简 SDP → base64url ----------
  compactSDP(sdp){
    const lines = String(sdp).split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const first = p => lines.find(l => l.startsWith(p)) || '';
    const out = ['v=0','o=- 0 0 IN IP4 127.0.0.1','s=-','t=0 0'];
    lines.filter(l=>l.startsWith('a=group:')).forEach(l=>out.push(l));
    out.push('m=application 9 UDP/DTLS/SCTP webrtc-datachannel','c=IN IP4 0.0.0.0');
    ['a=ice-ufrag:','a=ice-pwd:','a=fingerprint:','a=setup:','a=mid:',
     'a=sctp-port:','a=max-message-size:'].forEach(p=>{ const l = first(p); if(l) out.push(l); });
    // 候选行：只保留 udp，并裁掉 generation/network-cost 等冗余尾段
    lines.filter(l=>l.startsWith('a=candidate:') && / udp /i.test(l)).forEach(l=>{
      const m = l.match(/^a=candidate:(\S+) (\d+) (udp) (\d+) (\S+) (\d+) typ (\S+)/i);
      out.push(m ? `a=candidate:${m[1]} ${m[2]} udp ${m[4]} ${m[5]} ${m[6]} typ ${m[7]}` : l);
    });
    return out.join('\r\n') + '\r\n';
  },
  // 连接码 V2：只打包"真正必需的字段"成字节（ufrag/pwd/指纹/IP+端口），约 90 字符；
  // 遇到无法打包的情况（比如候选地址是 mDNS 域名而非 IPv4）自动回退 V1 文本精简版
  parseSDP(sdp){
    const lines = String(sdp).split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const get = p => (lines.find(l=>l.startsWith(p)) || '').slice(p.length);
    const fpLine = lines.find(l=>l.startsWith('a=fingerprint:')) || '';
    const fpAlg = /sha-1/i.test(fpLine) ? 1 : (/sha-256/i.test(fpLine) ? 0 : -1);
    const fpHex = fpLine.replace(/^a=fingerprint:\S+\s+/, '').replace(/:/g, '').trim();
    const cands = [];
    lines.filter(l=>l.startsWith('a=candidate:') && / udp /i.test(l)).forEach(l=>{
      const t = l.split(/\s+/);
      const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(t[4] || '');
      const port = parseInt(t[5], 10);
      if(m && port > 0 && port < 65536) cands.push([ +m[1], +m[2], +m[3], +m[4], port ]);
    });
    return { ufrag:get('a=ice-ufrag:'), pwd:get('a=ice-pwd:'), fpAlg, fpHex,
             setup:(/a=setup:actpass/i.test(sdp) ? 1 : 0), cands };
  },
  packSDP(sdp){ // → 字节数组；无法打包返回 null（交给文本版兜底）
    const p = this.parseSDP(sdp);
    const fpLen = p.fpAlg === 1 ? 20 : 32;
    if(!p.ufrag || !p.pwd || p.fpAlg < 0 || !p.cands.length || p.fpHex.length !== fpLen*2) return null;
    const fp = new Array(fpLen);
    for(let i=0;i<fpLen;i++){
      const v = parseInt(p.fpHex.substr(i*2, 2), 16);
      if(!Number.isFinite(v)) return null;
      fp[i] = v;
    }
    const ub = [], pb = [];
    for(const c of p.ufrag){ const v = c.charCodeAt(0); if(v > 127) return null; ub.push(v); }
    for(const c of p.pwd){ const v = c.charCodeAt(0); if(v > 127) return null; pb.push(v); }
    const nc = Math.min(p.cands.length, 8);
    const out = new Array(4 + ub.length + pb.length + fpLen + nc*6);
    let o = 0;
    out[o++] = 2;                                       // 打包版本
    out[o++] = (p.fpAlg === 1 ? 1 : 0) | (p.setup ? 2 : 0); // 指纹算法 + actpass 标志
    out[o++] = ub.length; for(const v of ub) out[o++] = v;
    out[o++] = pb.length; for(const v of pb) out[o++] = v;
    for(const v of fp) out[o++] = v;
    out[o++] = nc;
    for(let i=0;i<nc;i++){ const c = p.cands[i];
      out[o++]=c[0]; out[o++]=c[1]; out[o++]=c[2]; out[o++]=c[3]; out[o++]=c[4]>>8; out[o++]=c[4]&255; }
    return out;
  },
  unpackSDP(b){
    let o = 0;
    if(b[o++] !== 2) throw new Error('连接码版本不对（请让对方重新生成）');
    const flags = b[o++], fpAlg = flags & 1, setup = !!(flags & 2);
    const ul = b[o++], ufrag = String.fromCharCode.apply(null, b.slice(o, o+ul)); o += ul;
    const pl = b[o++], pwd = String.fromCharCode.apply(null, b.slice(o, o+pl)); o += pl;
    const fpLen = fpAlg ? 20 : 32;
    let hex = '';
    for(let i=0;i<fpLen;i++){ const v = b[o+i]; hex += (v < 16 ? '0' : '') + v.toString(16); }
    const fpHex = hex.toUpperCase().match(/.{2}/g).join(':');
    o += fpLen;
    const nc = b[o++], cands = [];
    for(let i=0;i<nc;i++){
      const ip = b[o] + '.' + b[o+1] + '.' + b[o+2] + '.' + b[o+3]; o += 4;
      const port = (b[o++] << 8) | b[o++];
      cands.push(`a=candidate:1 1 udp 2130706431 ${ip} ${port} typ host`);
    }
    return ['v=0','o=- 0 0 IN IP4 127.0.0.1','s=-','t=0 0','a=group:BUNDLE 0',
      'm=application 9 UDP/DTLS/SCTP webrtc-datachannel','c=IN IP4 0.0.0.0',
      'a=ice-ufrag:' + ufrag, 'a=ice-pwd:' + pwd,
      'a=fingerprint:sha-' + (fpAlg ? '1' : '256') + ' ' + fpHex,
      'a=setup:' + (setup ? 'actpass' : 'active'),
      'a=mid:0','a=sctp-port:5000','a=max-message-size:262144'
    ].concat(cands).concat(['a=end-of-candidates']).join('\r\n') + '\r\n';
  },
  encodeSignal(sdp){
    const bin = this.packSDP(sdp);
    return bin ? ('b.' + B64U.encBytes(bin))                // V2 紧凑版（约 90 字符）
               : ('t.' + B64U.enc(this.compactSDP(sdp)));   // V1 兜底：文本精简版
  },
  decodeSignal(code){
    const s = String(code || '').trim();
    const i = s.indexOf('.');
    if(i < 0) throw new Error('连接码格式不对（请完整复制）');
    const kind = s.slice(0, i), body = s.slice(i+1);
    let out;
    if(kind === 'b') out = this.unpackSDP(B64U.decBytes(body));
    else if(kind === 't') out = B64U.dec(body);
    else throw new Error('连接码格式不对（请完整复制）');
    if(!/m=application/.test(out) || !/a=ice-ufrag:/.test(out) || !/a=ice-pwd:/.test(out))
      throw new Error('连接码内容不完整（请完整复制）');
    return out;
  },
  // ---------- WebRTC ----------
  _cfg(){ return { iceServers: [] }; },
  _ctor(){ return this._PC || (typeof RTCPeerConnection !== 'undefined' ? RTCPeerConnection : null); },
  _waitIce(pc, ms){ // 等 ICE 收集完成（拿到候选）；超时就用已收集到的候选
    return new Promise(res => {
      if(pc.iceGatheringState === 'complete') return res();
      let done = false;
      const fin = () => { if(!done){ done = true; res(); } };
      if(pc.addEventListener) pc.addEventListener('icegatheringstatechange', () => {
        if(pc.iceGatheringState === 'complete') fin();
      });
      setTimeout(fin, ms);
    });
  },
  _attach(pc, ch){
    const self = this;
    ch.onopen = () => { self.dc = ch; self.setState('connected'); self.send(PROTO.hello()); };
    ch.onclose = () => self.setState('closed');
    ch.onerror = e => { self.lastError = String((e && e.error) || '数据通道出错'); self.setState('error'); };
    ch.onmessage = ev => {
      const msg = PROTO.dec(ev.data);
      if(!msg) return;
      self.msgs.push(msg);
      if(msg.t === 'hello'){
        // 记录对端设备类型（手机/电脑），用于决定镜像策略；不再做版本隔离——同一份 game.html 互通
        if(typeof msg.phone === 'boolean') self.peerPhone = msg.phone;
        return;
      }
      if(msg.t === 'vsdp' || msg.t === 'vans' || msg.t === 'vice'){ self._onVideoSignal(msg); return; }
      if(msg.t === 'in'){ self.remote.m = msg.m; self.remote.a = msg.a; self.remote.s = (self.remote.s||0) + (msg.s||0); } // 📱 客户端技能按钮 → 累计待消费技能次数
      if(msg.t === 'ping'){ self.send({ t:'pong', ts:msg.ts }); }
      if(typeof self.onMessage === 'function') self.onMessage(msg);
    };
  },
  async makeOffer(){
    const C = this._ctor();
    if(!C) throw new Error('当前浏览器/环境不支持 WebRTC');
    this.role = 'host'; this.setState('making');
    const pc = new C(this._cfg());
    this.pc = pc;
    const ch = pc.createDataChannel('game');
    this._attach(pc, ch);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this._waitIce(pc, 2500);
    this.setState('waiting'); // 等对方应答码
    return this.encodeSignal(pc.localDescription.sdp);
  },
  async acceptAnswer(code){
    if(this.role !== 'host') throw new Error('当前不是房主，无法接收应答码');
    if(!this.pc) throw new Error('还没有生成邀请码');
    await this.pc.setRemoteDescription({ type:'answer', sdp:this.decodeSignal(code) });
    this.setState('connecting');
    return true;
  },
  async join(offerCode){
    const C = this._ctor();
    if(!C) throw new Error('当前浏览器/环境不支持 WebRTC');
    this.role = 'client'; this.setState('making');
    const pc = new C(this._cfg());
    this.pc = pc;
    pc.ondatachannel = ev => this._attach(pc, ev.channel);
    await pc.setRemoteDescription({ type:'offer', sdp:this.decodeSignal(offerCode) });
    const ans = await pc.createAnswer();
    await pc.setLocalDescription(ans);
    await this._waitIce(pc, 2500);
    this.setState('connecting');
    return this.encodeSignal(pc.localDescription.sdp);
  },
  send(obj){ if(this.dc && this.dc.readyState === 'open'){ try{ this.dc.send(PROTO.enc(obj)); }catch(e){} } },
  close(silent){
    try { this.dc && this.dc.close(); } catch(e){}
    try { this.pc && this.pc.close(); } catch(e){}
    try { this.vpc && this.vpc.close(); } catch(e){}
    try { this.vpcClient && this.vpcClient.close(); } catch(e){}
    this.dc = null; this.pc = null; this.vpc = null; this.vpcClient = null; this.mirrorOn = false;
    const v = document.getElementById('net-video');
    if(v){ try{ v.srcObject = null; }catch(e){} v.style.display = 'none'; }
    if(!silent) this.setState('idle');
  },
  // ---------- 镜像画面：主机 → 客户端 视频轨（仅在需要镜像时建立，走数据通道发信令，不需手动码）----------
  netShouldMirror(){ // 仅房主调用：房主永远显示；客户端收到镜像，除非「房主是电脑 且 客户端是手机」
    if(this.role !== 'host') return false;
    return !( !netIsPhone() && this.peerPhone );
  },
  async startMirrorHost(){
    try{
      const C = this._ctor(); if(!C) return;
      const cvs = document.getElementById('game');
      if(!cvs || !cvs.captureStream) return; // 环境不支持 → 退化为纯手柄
      const stream = cvs.captureStream(30);
      const vpc = new C(this._cfg());
      this.vpc = vpc;
      stream.getVideoTracks().forEach(t => { try{ vpc.addTrack(t, stream); }catch(e){} });
      vpc.onicecandidate = ev => { if(ev && ev.candidate) this.send({ t:'vice', c:ev.candidate }); };
      const off = await vpc.createOffer();
      await vpc.setLocalDescription(off);
      this.send({ t:'vsdp', sdp: vpc.localDescription.sdp });
    }catch(e){ /* 镜像失败不影响手柄操作 */ }
  },
  async _onVideoSignal(msg){
    try{
      const C = this._ctor(); if(!C) return;
      if(msg.t === 'vsdp'){            // 客户端收到房主视频 offer
        if(this.role !== 'client') return;
        if(!this.vpcClient){
          const vpc = new C(this._cfg());
          this.vpcClient = vpc;
          const self = this;
          vpc.ontrack = ev => {
            const v = document.getElementById('net-video');
            if(v && ev.streams && ev.streams[0]){ v.srcObject = ev.streams[0]; v.style.display = 'block'; self.mirrorOn = true; }
          };
          vpc.onicecandidate = ev => { if(ev && ev.candidate) self.send({ t:'vice', c:ev.candidate }); };
        }
        await this.vpcClient.setRemoteDescription({ type:'offer', sdp:msg.sdp });
        const ans = await this.vpcClient.createAnswer();
        await this.vpcClient.setLocalDescription(ans);
        this.send({ t:'vans', sdp: this.vpcClient.localDescription.sdp });
      } else if(msg.t === 'vans'){      // 房主收到客户端 answer
        if(this.role === 'host' && this.vpc) await this.vpc.setRemoteDescription({ type:'answer', sdp:msg.sdp });
      } else if(msg.t === 'vice'){      // ICE 候选互发（中继在数据通道里）
        if(this.role === 'client' && this.vpcClient) await this.vpcClient.addIceCandidate(msg.c);
        else if(this.role === 'host' && this.vpc) await this.vpc.addIceCandidate(msg.c);
      }
    }catch(e){}
  }
};

// ===== 📱 TPAD：手机触屏虚拟摇杆（左移动 / 右瞄准，松手后瞄准方向保持） =====
const TPAD = {
  on:false, R:58,
  move:{x:0,y:0}, aim:{x:1,y:0}, _lastAim:{x:1,y:0}, _bound:false,
  init(){
    if(this._bound) return;
    const mv = document.getElementById('pad-move'), am = document.getElementById('pad-aim');
    if(!mv || !am) return;
    this._pad(mv, this.move, false);
    this._pad(am, this.aim, true);
    bindSkillBtn(); // 📱 技能按钮（每次 init 幂等绑定）
    this._bound = true;
  },
  _pad(el, out, keepLast){
    const self = this;
    let pid = null;
    const knob = () => el.querySelector('.knob');
    const set = (nx, ny) => {
      out.x = nx; out.y = ny;
      const k = knob();
      if(k) k.style.transform = `translate(${(nx*self.R*0.9).toFixed(1)}px, ${(ny*self.R*0.9).toFixed(1)}px)`;
    };
    const upd = e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / (r.width/2));
      set(dx/d*k, dy/d*k);
      if(keepLast && (Math.abs(dx) > 4 || Math.abs(dy) > 4)){ self._lastAim.x = out.x; self._lastAim.y = out.y; }
    };
    el.addEventListener('pointerdown', e => { pid = e.pointerId; try{ el.setPointerCapture(pid); }catch(_){} upd(e); e.preventDefault(); });
    el.addEventListener('pointermove', e => { if(pid === e.pointerId){ upd(e); e.preventDefault(); } });
    const end = e => {
      if(pid !== e.pointerId) return;
      pid = null;
      if(keepLast){ set(self._lastAim.x, self._lastAim.y); } else { set(0,0); }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('lostpointercapture', end);
  },
  enable(){
    const layer = document.getElementById('touch-layer');
    if(!layer) return;
    this.init();
    layer.classList.add('on');
    layoutTouchControls();
    const sb = document.getElementById('pad-skill');
    if(sb) sb.style.display = 'block'; // 📱 技能按钮随触控一起亮出
    this.on = true;
  },
  disable(){
    const layer = document.getElementById('touch-layer');
    if(layer) layer.classList.remove('on');
    const sb = document.getElementById('pad-skill');
    if(sb) sb.style.display = 'none';
    this.on = false;
  }
};

// ===== 📱 设备类型（手机 / 电脑）=====
// 手机：双虚拟摇杆 + 技能按钮 + 横屏；电脑：鼠标键盘。
// 联机客户端（无论电脑还是手机）也启用触控（用摇杆操作 2P）。
function setDeviceMode(mode){
  if(mode !== 'phone' && mode !== 'computer') mode = 'computer';
  G.deviceType = mode;
  try { gameStore.setItem('wb-device', mode); } catch(e){}
  updateDeviceBtn();
  applyDeviceMode();
}
function updateDeviceBtn(){
  const bp = document.getElementById('set-dev-phone'), bc = document.getElementById('set-dev-pc');
  if(bp) bp.classList.toggle('active', G.deviceType === 'phone');
  if(bc) bc.classList.toggle('active', G.deviceType === 'computer');
}
// 根据设备类型 + 联机状态刷新触控与横屏/竖屏提示
function applyDeviceMode(){
  refreshTouchControls();
  updateRotateHint();
  layoutTouchControls();
  if(G.deviceType === 'phone' && TPAD.on) enterLandscape();
}
// 是否应该显示触控（双摇杆 + 技能按钮）
function needTouch(){
  if(G.deviceType === 'phone') return true;                 // 手机：本地玩家用触控
  if(NET.state === 'connected' && NET.role === 'client') return true; // 联机客户端（电脑也用摇杆操作 2P）
  return false;
}
function refreshTouchControls(){
  // 升级面板(levelup) / 暂停(paused) 打开时隐藏摇杆，避免摇杆圆压住升级选项与暂停按钮（且这些状态不需要移动）
  const canPlay = needTouch() && G.state === 'playing' && !G.paused;
  if(canPlay){ TPAD.enable(); if(G.deviceType === 'phone') enterLandscape(); }
  else if(!(NET.state === 'connected' && NET.role === 'client')) TPAD.disable();
}
// ⛶ 尝试横屏（部分浏览器仅在全屏下允许；失败则靠竖屏提示兜底）
function enterLandscape(){
  try {
    const so = screen.orientation;
    if(so && so.lock && so.lock.call) so.lock('landscape').catch(()=>{});
  } catch(e){}
}
// 📱 竖屏提示：手机模式 + 当前竖屏时盖屏提示横屏
function updateRotateHint(){
  const el = document.getElementById('rotate-hint');
  if(!el) return;
  const portrait = window.innerHeight > window.innerWidth;
  const show = (G.deviceType === 'phone') && portrait && TPAD.on; // 游玩中（含联机客户端镜像）才提示横屏
  el.style.display = show ? 'flex' : 'none';
}
// 📱 自适应触控布局：按当前屏幕宽高缩放并摆放左/右摇杆与技能按钮，任何尺寸都互不重叠
//    - 左/右摇杆贴底部两角；技能按钮贴右摇杆左侧、垂直居中对齐
//    - 单人游玩时把 1P 冷却环抬到控件上方居中，把底部整行让给三个控件（桌面 / 多人布局不动它）
//    - 摇杆直径同时受「短边」和「可用宽度」约束，保证 2d + s + 2gap + 2margin ≤ 屏宽（一行必排得下）
function layoutTouchControls(){
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  if(!vw || !vh) return;
  const shortSide = Math.min(vw, vh);
  const mv = document.getElementById('pad-move');
  const am = document.getElementById('pad-aim');
  const sk = document.getElementById('pad-skill');
  if(!mv || !am || !sk) return;
  const margin = Math.max(12, Math.min(26, Math.round(shortSide * 0.045)));
  const gap    = Math.max(12, Math.min(26, Math.round(shortSide * 0.05)));
  const s      = Math.max(66, Math.min(88, Math.round(shortSide * 0.19)));
  const maxDbyW = Math.floor((vw - 2 * margin - 2 * gap - s) / 2);
  let d = Math.min(140, Math.round(shortSide * 0.26), maxDbyW);
  d = Math.max(56, d);
  mv.style.left = margin + 'px'; mv.style.right = ''; mv.style.bottom = margin + 'px'; mv.style.width = d + 'px'; mv.style.height = d + 'px';
  am.style.right = margin + 'px'; am.style.left = ''; am.style.bottom = margin + 'px'; am.style.width = d + 'px'; am.style.height = d + 'px';
  sk.style.left = ''; sk.style.right = (margin + d + gap) + 'px'; sk.style.bottom = (margin + Math.round((d - s) / 2)) + 'px'; sk.style.width = s + 'px'; sk.style.height = s + 'px';
  const sb = document.getElementById('skill-bar');
  const layer = document.getElementById('touch-layer');
  let touchOn = false, coop = false;
  try { touchOn = !!(layer && layer.classList && typeof layer.classList.contains === 'function' && layer.classList.contains('on')); } catch(e){}
  try { const bl = document.body && document.body.classList; coop = !!(bl && typeof bl.contains === 'function' && (bl.contains('coop') || bl.contains('trio'))); } catch(e){}
  let sbVisible = false;
  try { sbVisible = !!(sb && typeof getComputedStyle === 'function' && getComputedStyle(sb).display !== 'none'); } catch(e){ sbVisible = false; }
  if(sb && touchOn && !coop && sbVisible){
    sb.style.left = '50%'; sb.style.right = 'auto'; sb.style.transform = 'translateX(-50%)'; sb.style.bottom = (margin + d + gap) + 'px';
  } else if(sb){
    sb.style.left = ''; sb.style.right = ''; sb.style.transform = ''; sb.style.bottom = '';
  }
}
// 📱 技能按钮：本地玩家（座位0）点一下 = 放主动技（与桌面左键同一入口）；联机客户端 → 经数据通道发给房主应用到 2P
function bindSkillBtn(){
  const b = document.getElementById('pad-skill');
  if(!b || b._bound) return;
  b._bound = true;
  const fire = e => {
    e.preventDefault();
    if(NET.state === 'connected' && NET.role === 'client'){
      NET.send(PROTO.input(TPAD.move, TPAD.aim, 1)); // 🌐 客户端 2P 主动技
    } else {
      G.mouseClicks = (G.mouseClicks||0) + 1;         // 🖱 本地 1P 主动技（鼠标左键单击口径）
    }
  };
  b.addEventListener('pointerdown', fire);
}
// 🌐 联机 2P 技能边沿：客户端技能按钮累计的 remote.s 消费成「按下沿」（按帧去重，bomb/dash 两线共用一个按钮）
let _netSkillSeen = 0, _netSkillFrame = -1, _netSkillHit = false;
function net2PSkillPressed(){
  const f = G.frame || 0;
  if(_netSkillFrame === f) return _netSkillHit; // 同帧只算一次
  _netSkillFrame = f;
  const c = (NET.remote && NET.remote.s) || 0;
  if(c < _netSkillSeen) _netSkillSeen = c; // 重开局重置跟随
  _netSkillHit = (NET.state === 'connected' && NET.role === 'host' && c > _netSkillSeen);
  _netSkillSeen = c;
  return _netSkillHit;
}

// ===== 联机面板 UI =====
function netIsHostLinked(){ return NET.state === 'connected' && NET.role === 'host'; } // 房主+已连线 → 开局走双人（2P 由手机操作）
function openNetPanel(){
  const p = document.getElementById('net-panel');
  if(p) p.classList.remove('hidden');
  TPAD.init(); // 预绑定摇杆（手机端加入后才显示）
}
function closeNetPanel(){
  const p = document.getElementById('net-panel');
  if(p) p.classList.add('hidden');
}
function netStartGame(){ // 🌐 房主在连上后点「开始游戏（双人）」→ 以联机双人开局（2P 由客户端驱动）
  if(NET.role !== 'host'){ return netSetStatus('只有房主能开始游戏（等房主点开始）', 'err'); }
  closeNetPanel();
  startGame(); // startGame 在 netIsHostLinked() 时自动按双人 coop 开局
}
function netSetStatus(text, kind){
  const el = document.getElementById('net-status');
  if(!el) return;
  el.textContent = text;
  el.className = 'nb' + (kind ? ' ' + kind : '');
  const badge = document.getElementById('net-badge');
  if(badge){ badge.style.display = 'inline-block'; badge.textContent = text; }
}
function netReadStun(){
  const c = document.getElementById('net-stun');
  NET.useStun = !!(c && c.checked);
}
async function netCreateOffer(){
  netReadStun();
  netSetStatus('正在生成邀请码…', '');
  try{
    const code = await NET.makeOffer();
    const ta = document.getElementById('net-offer');
    if(ta) ta.value = code;
    netSetStatus(`邀请码已生成（${code.length} 字符）—— 发给对方，等对方回传应答码`, '');
  }catch(e){
    NET.lastError = String(e && e.message || e);
    netSetStatus('生成失败：' + NET.lastError, 'err');
  }
}
function netCopy(id){
  const ta = document.getElementById(id);
  if(!ta || !ta.value) return netSetStatus('还没有可复制的内容', 'err');
  const done = () => netSetStatus('已复制到剪贴板 ✓', 'ok');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); document.execCommand && document.execCommand('copy'); done(); });
  } else { ta.select(); try{ document.execCommand && document.execCommand('copy'); }catch(e){} done(); }
}
function netCopyLink(){
  const ta = document.getElementById('net-offer');
  if(!ta || !ta.value) return netSetStatus('请先生成邀请码', 'err');
  const base = location.origin + location.pathname;
  const url = base + '?j=' + ta.value;
  const done = () => netSetStatus('邀请链接已复制 ✓ —— 对方点开即自动填好邀请码', 'ok');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(done, () => done());
  } else done();
}
async function netAcceptAnswer(){
  netReadStun();
  const ta = document.getElementById('net-answer');
  const code = (ta && ta.value || '').trim();
  if(!code) return netSetStatus('请先粘贴对方回传的应答码', 'err');
  try{
    await NET.acceptAnswer(code);
    netSetStatus('应答码已接收，正在建立连接…', '');
  }catch(e){
    netSetStatus('连接失败：' + String(e && e.message || e), 'err');
  }
}
async function netJoin(){
  netReadStun();
  const ta = document.getElementById('net-invite');
  const code = (ta && ta.value || '').trim();
  if(!code) return netSetStatus('请先粘贴邀请码', 'err');
  netSetStatus('正在生成应答码…', '');
  try{
    const ans = await NET.join(code);
    const out = document.getElementById('net-ans-out');
    if(out) out.value = ans;
    netSetStatus('应答码已生成 —— 回传给房主即可开打', '');
  }catch(e){
    netSetStatus('加入失败：' + String(e && e.message || e), 'err');
  }
}
// 连接状态 → 面板提示 + 手机端自动亮出摇杆
NET.onState = function(s){
  if(s === 'connected'){
    if(NET.role === 'host'){
      netSetStatus('🌐 已连接（我是房主 1P）', 'ok');
      const sr = document.getElementById('net-start-row');
      if(sr) sr.style.display = 'flex';
      if(NET.netShouldMirror()) NET.startMirrorHost(); // 房主推画面给客户端（如手机↔手机）
    } else {
      // 客户端永远是 2P：触屏/鼠标摇杆操控；手机↔手机时额外接收房主镜像画面。
      // 无论是否镜像都关掉面板（否则 z82 面板会盖住 z58 摇杆 / z57 视频），露出摇杆或镜像视频
      TPAD.enable();
      const getsMirror = !( !NET.peerPhone && netIsPhone() );
      netSetStatus(getsMirror ? '🌐 已连接（我是 2P，正在接收房主画面…）' : '🌐 已连接（我是 2P，用摇杆操作）', getsMirror ? '' : 'ok');
      closeNetPanel();
    }
  } else if(s === 'error'){
    netSetStatus('连接出错：' + NET.lastError, 'err');
  } else if(s === 'closed'){
    netSetStatus('连接已断开', 'err');
    TPAD.disable();
    const v = document.getElementById('net-video');
    if(v){ try{ v.srcObject = null; }catch(e){} v.style.display = 'none'; }
  }
};

// ⛶ 全屏切换：菜单和游戏中都可用；不支持 Fullscreen API 的浏览器（如 iPhone Safari）自动隐藏按钮
function toggleFullscreen(){
  const d = document, el = d.documentElement;
  if(!el) return;
  const on = !!(d.fullscreenElement || d.webkitFullscreenElement);
  try {
    if(!on){
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if(req) req.call(el);
    } else {
      const ex = d.exitFullscreen || d.webkitExitFullscreen;
      if(ex) ex.call(d);
    }
  } catch(e){}
}
function fsUpdateBtn(){
  const b = document.getElementById('fs-btn');
  if(!b) return;
  const root = document.documentElement;
  const supported = !!(root && (root.requestFullscreen || root.webkitRequestFullscreen));
  if(!supported){ b.style.display = 'none'; return; } // iPhone Safari 等无 API 环境：隐藏而不是摆设
  b.style.display = ''; // 恢复可见（防此前被隐藏）
  const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
  b.textContent = on ? '🗗' : '⛶'; // 全屏中显示还原图标
}
document.addEventListener('fullscreenchange', fsUpdateBtn);
document.addEventListener('webkitfullscreenchange', fsUpdateBtn);
fsUpdateBtn();

// 首次状态刷新（音效/音乐按钮文案）
try { updateSoundBtn(); updateMusicBtn(); } catch(e){}

// start render loop
requestAnimationFrame(loop);

// 主界面音乐：页面加载即尝试播放（若被浏览器自动播放策略挂起，点击"开始游戏"后会自动恢复）
try { SND.init(); Music.start(); } catch(e){}
// 自动播放策略兜底：首次任意点击/按键时恢复挂起的音频上下文（主界面音乐即刻出声）
['pointerdown','keydown'].forEach(ev => addEventListener(ev, () => {
  if(SND.ctx && SND.ctx.state === 'suspended') SND.ctx.resume();
}));
// 恢复上次音量设置（在 SND.master 创建后应用）
try { const v = parseInt(gameStore.getItem('wb_vol'), 10); if(Number.isFinite(v)) applyVolume(v); } catch(e){}
// 📱 设备类型：优先读上次手动选择；无记录则按触摸能力自动判定（有触屏=手机，否则=电脑）
try {
  const _d = gameStore.getItem('wb-device');
  if(_d === 'phone' || _d === 'computer') G.deviceType = _d;
  else G.deviceType = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) ? 'phone' : 'computer';
  updateDeviceBtn();
} catch(e){}
// 邀请链接自动填码：game.html?j=<邀请码> → 自动打开联机面板并填好邀请码（手机点开链接即就位）
try {
  const _j = new URLSearchParams(location.search).get('j');
  if(_j){
    const _el = document.getElementById('net-invite');
    if(_el){ _el.value = _j; openNetPanel(); netSetStatus('已自动填入邀请码 —— 点「生成应答码」继续', ''); }
  }
} catch(e){}
// 🗡 角色 / ♾ 无尽模式 URL 参数（便于分享与测试）：game.html?hero=swordsman&hero2=swordsman&endless=1
try {
  const _q = new URLSearchParams(location.search);
  if(heroOk(_q.get('hero'))){ G.hero = _q.get('hero'); } // 🗡 URL 指定角色：开局选角面板会跳过并直接使用
  if(heroOk(_q.get('hero2'))){ G.hero2 = _q.get('hero2'); } // 🗡 2P 角色（双人/三人模式）
  if(heroOk(_q.get('hero3'))){ G.hero3 = _q.get('hero3'); } // 🗡 3P 角色（三人模式）
  if(_q.get('endless') === '1'){ G.endlessOn = true; updateEndlessBtn(); }
  // 🔷 直达激光 Boss：game.html?boss=laser = 自动开无尽模式 + 首次开局跳到第 40 波「棱光穹主」
  // ⚔ 直达大剑 Boss：game.html?boss=blade = 自动开无尽模式 + 首次开局跳到第 50 波「斩铁剑皇」
  //   （未显式给 ?wave= 时按上面默认波；可叠加 ?hero= / ?ai2p=）
  if(_q.get('boss') === 'laser'){ G.endlessOn = true; G.laserBossJump = true; updateEndlessBtn(); }
  if(_q.get('boss') === 'blade'){ G.endlessOn = true; G.bladeBossJump = true; updateEndlessBtn(); }
} catch(e){}
// 🤖 与 AI 组队直接开局：game.html?ai2p=1（可叠加 ?wave=30 跳波）→ 双人模式 + 内置 AI 当 2P
//   （主界面按钮走选角面板；URL 直启沿用当前/URL 指定的角色，?hero2= 可给 AI 指定角色）
try {
  if(new URLSearchParams(location.search).get('ai2p') === '1') launchAI2P();
} catch(e){}
// 👥 三人模式直接开局：game.html?trio=1（可叠加 ?hero=/hero2=/hero3= 指定三人角色）
try {
  const _tq = new URLSearchParams(location.search);
  if(_tq.get('trio') === '1') launchTrio();
} catch(e){}
// ⚔️ 对战模式直接开局：game.html?pvp=1（真人 vs 真人）/ ?pvp=ai（真人 vs AI）
//   可叠加 ?hero= 与 ?hero2= 指定双方角色（1P / 2P 各一个）
try {
  const _pq = new URLSearchParams(location.search);
  const _pv = _pq.get('pvp');
  if(_pv === '1'){ G._pvpAI = false; launchPVP(); }
  else if(_pv === 'ai'){
    G._pvpAI = true;
    // 🤖 链接没指定 ?hero2= 时，让 AI 自己挑一个（和面板入口同一套大脑；指定了就尊重链接）
    if(!heroOk(_pq.get('hero2'))) G.hero2 = aiPickForDirect();
    launchPVP();
  }
} catch(e){}
// 📱 屏幕方向变化：竖屏提示随设备方向实时刷新（手机横屏模式必备）
addEventListener('orientationchange', updateRotateHint);
addEventListener('resize', updateRotateHint);
// 📱 触控控件自适应：旋转 / 改变窗口大小时重新摆放摇杆与技能按钮（保持互不重叠）
layoutTouchControls();
addEventListener('orientationchange', layoutTouchControls);
addEventListener('resize', layoutTouchControls);
// 🌐 联机客户端（手机 2P）：20Hz 上行摇杆输入（房主端直接读 NET.remote 驱动 2P）
setInterval(() => {
  if(NET.state === 'connected' && NET.role === 'client' && TPAD.on){
    NET.send(PROTO.input(TPAD.move, TPAD.aim));
  }
}, 50);
