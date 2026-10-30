"use strict";
/* ══════════ 数据层 ══════════ */
const TAU = Math.PI * 2;
const cl = (v,a,b) => v<a?a:v>b?b:v;

function m32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let RND = m32(20261011);
const rr=(a,b)=>a+RND()*(b-a);
const ri=(a,b)=>Math.floor(rr(a,b+1));
const pk=a=>a[Math.floor(RND()*a.length)];
function angD(a,b){let d=Math.abs(a-b)%TAU;return d>Math.PI?TAU-d:d}
function resetRnd(seed){RND=m32(seed)}

/* ── 围岩（原石外壳）：游戏素材，游戏内加法混合叠加 ── */
const SHELLS=[
  {n:"石灰岩",  img:"assets/rough_limestone.webp"},
  {n:"砂岩",    img:"assets/rough_sandstone.webp"},
  {n:"云母片岩",img:"assets/rough_schist.webp"}
];
const IMG_ANOMALY="assets/cluster_anomaly.webp";
/* 舞台背景：闲置（鉴石）态用带油灯景，工序态用无灯暗景。
   两图生成时已强制「画面正中央留空」，石料立绘摆在正中不会被道具挡住。 */
const IMG_TABLE="assets/bg_idle.webp";
const IMG_TABLE_WORK="assets/bg_work.webp";
/* 砖头料通用立绘：不分石种，一律用这堆灰白碎石（原 per-gem waste 图色相全偏，已弃用） */
const IMG_WASTE="assets/waste_rock.webp";

/* ── 宝石 ── */
const GEMS={
  emerald :{n:"祖母绿",c:"#2f7d55",c2:"#8fe0ae",ch:"#eafff3",mul:1.55,hd:7.5},
  ruby    :{n:"红宝石",c:"#8d3236",c2:"#e0868a",ch:"#ffe9e9",mul:1.70,hd:8.0},
  sapphire:{n:"蓝宝石",c:"#2c5f8a",c2:"#8ec6ee",ch:"#eaf6ff",mul:1.48,hd:8.5},
  amethyst:{n:"紫水晶",c:"#6a4a94",c2:"#c0a4dc",ch:"#f2e9ff",mul:1.22,hd:7.0},
  topaz   :{n:"黄玉",  c:"#a8823c",c2:"#edd08a",ch:"#fff6dd",mul:1.05,hd:6.5},
  garnet  :{n:"石榴石",c:"#8a3040",c2:"#d4757f",ch:"#ffe6e8",mul:0.92,hd:7.2},
  peridot :{n:"橄榄石",c:"#6b8a2c",c2:"#c2dd7e",ch:"#f6ffe4",mul:0.85,hd:6.8},
  quartz  :{n:"水晶",  c:"#7d7f84",c2:"#cfd2d6",ch:"#f4f6f8",mul:0.55,hd:7.0},
  /* ── 中等档（翡翠系）：糯冰 / 糯种 / 紫罗兰 / 飘花冰种 / 芙蓉种 ── */
  nuibing :{n:"糯冰",c:"#a8cfc6",c2:"#e6f6f0",ch:"#f3fbf8",mul:1.15,hd:6.8},
  nuozhong:{n:"糯种",c:"#c2c4ac",c2:"#e8ead6",ch:"#f8faef",mul:1.00,hd:6.5},
  ziluolan:{n:"紫罗兰",c:"#9d7fbe",c2:"#d8c4ea",ch:"#f5eefc",mul:1.22,hd:6.9},
  piaohua :{n:"飘花冰种",c:"#7fb2c8",c2:"#cfe6ef",ch:"#eef8fc",mul:1.28,hd:7.0},
  furong  :{n:"芙蓉种",c:"#c79ba1",c2:"#eecfd4",ch:"#fdf1f3",mul:1.08,hd:6.6},
  /* ── 下等档（杂石）：豆种 / 干青 ── */
  douzhong:{n:"豆种",c:"#a9b18b",c2:"#d6dcbb",ch:"#f5f7e9",mul:0.60,hd:6.0},
  ganqing :{n:"干青",c:"#2e6b4a",c2:"#83c49e",ch:"#e7f5ee",mul:0.66,hd:6.2}
};
let GK=Object.keys(GEMS);
for(const k of GK){ GEMS[k].img="assets/cluster_"+k+".webp"; GEMS[k].cutimg="assets/cut_"+k+".webp"; }

/* ── 工序状态立绘（纯黑背景）：
   錾剥 = 剥落石皮露晶体；开料 = 原石被切开；修磨 = 原石被打磨。
   每石种一套，工序中立绘直接贴整图，不再外壳挖洞+晶簇拼贴。 ── */
const WORK_ASSETS={};
for(const k of GK){
  WORK_ASSETS[k]={
    peel  :"assets/work_peel_"+k+".webp",
    cut   :"assets/work_cut_"+k+".webp",
    polish:"assets/work_polish_"+k+".webp"
  };
}
function workImgOf(gk,phase){
  const w=WORK_ASSETS[gk];
  return (w&&w[phase])?w[phase]:null;
}

/* ── 受损晶体簇贴图：全石种实拍裂痕/断口，彻底替代线条 ── */
const DMGIMG={
  emerald :{crack:"assets/dmg_crack_emerald.webp",  chip:"assets/dmg_chip_emerald.webp"},
  ruby    :{crack:"assets/dmg_crack_ruby.webp",     chip:"assets/dmg_chip_ruby.webp"},
  sapphire:{crack:"assets/dmg_crack_sapphire.webp", chip:"assets/dmg_chip_sapphire.webp"},
  amethyst:{crack:"assets/dmg_crack_amethyst.webp", chip:"assets/dmg_chip_amethyst.webp"},
  topaz   :{crack:"assets/dmg_crack_topaz.webp",    chip:"assets/dmg_chip_topaz.webp"},
  garnet  :{crack:"assets/dmg_crack_garnet.webp",   chip:"assets/dmg_chip_garnet.webp"},
  peridot :{crack:"assets/dmg_crack_peridot.webp",  chip:"assets/dmg_chip_peridot.webp"},
  quartz  :{crack:"assets/dmg_crack_quartz.webp",   chip:"assets/dmg_chip_quartz.webp"},
  obsidian:{crack:"assets/dmg_crack_obsidian.webp", chip:"assets/dmg_chip_obsidian.webp"},
  nuibing :{crack:"assets/dmg_crack_nuibing.webp",  chip:"assets/dmg_chip_nuibing.webp"},
  nuozhong:{crack:"assets/dmg_crack_nuozhong.webp", chip:"assets/dmg_chip_nuozhong.webp"},
  ziluolan:{crack:"assets/dmg_crack_ziluolan.webp", chip:"assets/dmg_chip_ziluolan.webp"},
  piaohua :{crack:"assets/dmg_crack_piaohua.webp",  chip:"assets/dmg_chip_piaohua.webp"},
  furong  :{crack:"assets/dmg_crack_furong.webp",   chip:"assets/dmg_chip_furong.webp"},
  douzhong:{crack:"assets/dmg_crack_douzhong.webp", chip:"assets/dmg_chip_douzhong.webp"},
  ganqing :{crack:"assets/dmg_crack_ganqing.webp",  chip:"assets/dmg_chip_ganqing.webp"}
};
/* ── 受损刻面宝石贴图：成品阶段同样全石种 ── */
const CUTDMG={
  emerald :{crack:"assets/cutdmg_crack_emerald.webp",  chip:"assets/cutdmg_chip_emerald.webp"},
  ruby    :{crack:"assets/cutdmg_crack_ruby.webp",     chip:"assets/cutdmg_chip_ruby.webp"},
  sapphire:{crack:"assets/cutdmg_crack_sapphire.webp", chip:"assets/cutdmg_chip_sapphire.webp"},
  amethyst:{crack:"assets/cutdmg_crack_amethyst.webp", chip:"assets/cutdmg_chip_amethyst.webp"},
  topaz   :{crack:"assets/cutdmg_crack_topaz.webp",    chip:"assets/cutdmg_chip_topaz.webp"},
  garnet  :{crack:"assets/cutdmg_crack_garnet.webp",   chip:"assets/cutdmg_chip_garnet.webp"},
  peridot :{crack:"assets/cutdmg_crack_peridot.webp",  chip:"assets/cutdmg_chip_peridot.webp"},
  quartz  :{crack:"assets/cutdmg_crack_quartz.webp",   chip:"assets/cutdmg_chip_quartz.webp"},
  obsidian:{crack:"assets/cutdmg_crack_obsidian.webp", chip:"assets/cutdmg_chip_obsidian.webp"},
  nuibing :{crack:"assets/cutdmg_crack_nuibing.webp",  chip:"assets/cutdmg_chip_nuibing.webp"},
  nuozhong:{crack:"assets/cutdmg_crack_nuozhong.webp", chip:"assets/cutdmg_chip_nuozhong.webp"},
  ziluolan:{crack:"assets/cutdmg_crack_ziluolan.webp", chip:"assets/cutdmg_chip_ziluolan.webp"},
  piaohua :{crack:"assets/cutdmg_crack_piaohua.webp",  chip:"assets/cutdmg_chip_piaohua.webp"},
  furong  :{crack:"assets/cutdmg_crack_furong.webp",   chip:"assets/cutdmg_chip_furong.webp"},
  douzhong:{crack:"assets/cutdmg_crack_douzhong.webp", chip:"assets/cutdmg_chip_douzhong.webp"},
  ganqing :{crack:"assets/cutdmg_crack_ganqing.webp",  chip:"assets/cutdmg_chip_ganqing.webp"}
};
/* ── 原石粗坯：未开窗的整块 rock，台面初始态与开箱弹窗都用它（不再一上来就露宝石） ── */
const ROUGH={};
for(const k of GK) ROUGH[k]="assets/rough_"+k+".webp";
/* 开窗原石：外壳磨开一角露出内部宝石（明料，价高但鉴定更容易） */
const WINDOWS={
  emerald :"assets/window_emerald.webp",
  ruby    :"assets/window_ruby.webp",
  sapphire:"assets/window_sapphire.webp",
  amethyst:"assets/window_amethyst.webp"
};

/* ── 工具：eff 出料效率 · risk 失控系数 · 解锁声誉 ── */
const TOOLS={
  chisel:{n:"尖凿",k:"凿",eff:1.00,risk:1.00,req:0, ds:"软岩通用，容错最宽"},
  saw   :{n:"金刚线锯",k:"锯",eff:1.85,risk:0.82,req:30,ds:"硬岩首选，出料稳"},
  sonic :{n:"超声震裂",k:"震",eff:2.40,risk:1.35,req:65,ds:"沿解理一击，成或碎"}
};
const TKS=["chisel","saw","sonic"];

/* ── 开料方式：由已学技艺决定。线割需「利刃」，震解需「稳手」，震解更高级 ── */
const CUTWAYS={
  plain:{k:"plain", n:"开料", skill:null,    add:0.00, req:0,  ds:"沿解理下手，稳妥"},
  wire :{k:"wire",  n:"线割", skill:"blade", add:0.05, req:42, ds:"金刚线锯沿纹裁切，成功率 +5%"},
  sonic:{k:"sonic", n:"震解", skill:"hand",  add:0.08, req:52, ds:"超声震裂解石，成功率 +8%"}
};

/* ── 分级损伤 ── */
const DMG={
  crack:{n:"裂纹",p:.85,rp:1,ds:"售价 −15%，可修复"},
  chip :{n:"崩边",p:.65,rp:1,ds:"售价 −35%，修复昂贵"},
  lost :{n:"缺料",p:.78,rp:1,ds:"料被磨薄，售价 −22%"},
  haze :{n:"雾化",p:.50,rp:1,ds:"售价 −50%，修复昂贵"},
  broken:{n:"破损",p:.35,rp:1,ds:"石体受损，售价 −65%，修复昂贵"},
  shat :{n:"粉化",p:0,  rp:0,ds:"料全毁，按进价返还三成"}
};
const DK=Object.keys(DMG);
const DLV={crack:1,chip:2,lost:3,haze:4,shat:5,broken:5};

/* ── 鉴定体系（四类）：天品 / 上等 / 中等 / 下等 ──
   每块原石在完成全部工序后按此概率判为某一档：
   天品 = 龙石（绝料现形，仅此一途）；上等 = 红宝石/蓝宝石等高档宝石；
   中等 = 糯冰/糯种/紫罗兰/飘花冰种/芙蓉种等翡翠系；下等 = 豆种/干青等杂石（砖头料直接认定失败）。
   概率：天品 0.5% / 上等 4% / 中等 25% / 下等 70.5% */
const GRADE_RARE="rare";         // 天品：龙石
const GRADE_WASTE="waste";       // 下等：豆种/干青/砖头料（砖头料失败）
const GRADE_FLOWER="flower";     // 中等：糯冰/糯种/紫罗兰/飘花冰种/芙蓉种
const GRADE_HIGH="high";         // 上等：红宝石/蓝宝石等
/* 概率权重：天0.5 : 下70.5 : 中25 : 上4 = 总100 */
const GRADE_WEIGHT={ rare:0.5, waste:70.5, flower:25, high:4 };
/* 普通箱：不出天品（天品只由异石现形），权重沿用下70.5/中25/上1 */
const GRADE_WEIGHT_NORMAL={ rare:0, waste:74, flower:25, high:1 };
/* 异石箱：产出石种与普箱同一套池，但概率不同 —— 上等概率精确 10%
   天4 : 下26 : 中60 : 上10 = 总100 */
const GRADE_WEIGHT_EX={ rare:4, waste:26, flower:60, high:10 };
const GRADE_DESC={
  rare  :{n:"天品", ds:"青苔裹缝、霜纹透光 —— 传说级龙石现形，百年不遇。"},
  waste :{n:"下等", ds:"豆种干青，颗粒粗，水头不足，卖不上价。"},
  flower:{n:"中等", ds:"糯冰糯种、飘花芙蓉，底子润，能出件过得去的货。"},
  high  :{n:"上等", ds:"种老肉细或通透起胶，红蓝宝级色料，可做收藏级首饰。"}
};
/* 材质对售价的影响系数 */
/* 档位定价系数。天品(rare) 与上等(high) 提升到原值的 5 倍：
   rare 3.20 → 16.00，high 1.80 → 9.00。中等(flower) 提升到原值的 3 倍：
   flower 1.00 → 3.00。下等(waste) 不变。
   裸石与首饰共用 itemBase，故两者同时生效。 */
const GRADE_PRICE_K={ rare:16.00, waste:0.30, flower:3.00, high:9.00 };
/* ── 档位判定：rand 在 [0,1) 均匀分布，按权重切分（天品最低，次到下等→中等→上等） ── */
function pickGrade(w){
  w = w || GRADE_WEIGHT;
  const r=RND();
  const total=(w.rare||0)+w.waste+w.flower+w.high;
  if(r<(w.rare||0)/total) return GRADE_RARE;
  if(r<((w.rare||0)+w.waste)/total) return GRADE_WASTE;
  if(r<((w.rare||0)+w.waste+w.flower)/total) return GRADE_FLOWER;
  return GRADE_HIGH;
}
/* 材质对应的立绘贴图路径（按石种×等级×状态索引） */
const GRADE_ASSETS={};
for(const gk of GK){
  if(gk==="obsidian") continue; // 专属石不走分级
  GRADE_ASSETS[gk]={
    waste :{img:"assets/cluster_"+gk+"_waste.webp", cutimg:"assets/cut_"+gk+"_waste.webp", ring:"assets/jewel_ring_"+gk+"_waste.webp", pendant:"assets/jewel_pendant_"+gk+"_waste.webp", earring:"assets/jewel_earring_"+gk+"_waste.webp", dmg_img:""},
    flower:{img:"assets/cluster_"+gk+"_flower.webp", cutimg:"assets/cut_"+gk+"_flower.webp", ring:"assets/jewel_ring_"+gk+"_flower.webp", pendant:"assets/jewel_pendant_"+gk+"_flower.webp", earring:"assets/jewel_earring_"+gk+"_flower.webp", dmg_img:""},
    high  :{img:"assets/cluster_"+gk+"_high.webp",   cutimg:"assets/cut_"+gk+"_high.webp",   ring:"assets/jewel_ring_"+gk+"_high.webp",   pendant:"assets/jewel_pendant_"+gk+"_high.webp",   earring:"assets/jewel_earring_"+gk+"_high.webp",   dmg_img:""}
  };
}
/* 橄榄石废料级晶簇图补位：原素材包缺 cluster_peridot_waste.webp，
   桌面素材包提供的同名文件实为一张泥土特写、与橄榄石不符，已剔除不用。
   此处回落至普通级橄榄石晶簇，保证废料级不缺图。 */
GRADE_ASSETS.peridot.waste.img="assets/cluster_peridot.webp";

/* ── 鉴石迹象：开箱后细看时「有机会」撞见的隐晦细节 ──
   全部是真实提示（不骗人），但不是每块石头都有迹象 —— 有没有、有几条、什么时候撞见，
   看门道也看运气。运势越高，越容易撞见。 */
const SIGNS=[
  {k:"g_emerald", t:"石皮缝里沁出一点青意",          tag:"石色"},
  {k:"g_ruby",    t:"断面透着暗红，像干透的血",       tag:"石色"},
  {k:"g_sapphire",t:"避光处看，皮壳泛一层藏蓝",       tag:"石色"},
  {k:"g_amethyst",t:"紫褐斑点嵌在石纹里",             tag:"石色"},
  {k:"g_topaz",   t:"蜜色锈斑顺着解理面爬",           tag:"石色"},
  {k:"g_garnet",  t:"暗红细粒挤在一条矿脉里",         tag:"石色"},
  {k:"g_peridot", t:"橄榄色的粉沾在凹坑底",           tag:"石色"},
  {k:"g_quartz",  t:"灰白玻璃光躲在缝里",             tag:"石色"},
  {k:"g_obsidian",t:"黑得反常，缝里有暗红星点",       tag:"石色"},
  {k:"dense",     t:"皮壳紧实，指节叩上去发闷",       tag:"料质"},
  {k:"loose",     t:"蛛纹从一面爬到另一面",           tag:"料质"},
  {k:"hard",      t:"边缘划得动钢片",                 tag:"硬度"},
  {k:"soft",      t:"指甲能掐出一道白痕",             tag:"硬度"},
  {k:"anom",      t:"灯移开那一下，影子里还有东西在动", tag:"异象"}
];
const SIGN_TAG_COLOR={石色:"#8ec6ee",料质:"#8fbf9f",硬度:"#c9ae6e",异象:"#c07a6e"};
const GRADE=["丁等","丙等","乙等","甲等"];

/* ══════════ 运气 ══════════
   唯一硬通货：既是每日额度，也是所有判定的门槛。
   ① 每落一手（凿/锯/震）都扣 1 点运气，运气见底就动不了手；
   ② 「看初始石头成色」要花运气，额度不够时按钮置灰不可点；
   ③ 运气还决定开箱时能不能摸到高价石。 */
const LUCK_MAX=10;             // 每日运气上限（总额度 10）
const LUCK_START=10;           // 每日开局运气（满额度）
const LUCK_COST_HIT=1;         // 每落一手消耗
const LUCK_COST_GAZE=1;        // 看一次初始成色消耗（固定花费，与异象无关）
const LUCK_SIGN_BASE=0.15;     // 细看时每次检定的基础触发率
const LUCK_SIGN_K=0.0052;      // 每点运势追加的触发率
const LUCK_RATE_K=0.0006;      // 每点运气（相对 15）对加工成功率的影响
const LUCK_GEM_K=1.5;          // 运气对箱内高价石的加权强度

/* ── 成色鉴定：看得懂原石的底子 ──
   看一次花 LUCK_COST_GAZE 点运气，交出的是石种、品质、硬度的实情。 */
const GAZE_GRADES=[
  {k:"rough",n:"下等",  ds:"皮壳粗砺，晶体多半藏在深里 —— 豆种干青，卖不上价"},
  {k:"fair", n:"中等",  ds:"壳薄有窗，能窥见一点颜色 —— 糯冰糯种，底子尚润"},
  {k:"fine", n:"上等",  ds:"壳薄色正，窗内已有晶光浮动 —— 红蓝宝级色料"},
  {k:"rare", n:"天品",  ds:"青苔裹缝、霜纹透光 —— 百年不遇。若出自异石，便是传说中的龙石现形"}
];

/* ── 首饰工坊 ── */
const METALS={ silver:{n:"银托",cost:28,g:"#c9cdd2"}, gold:{n:"金托",cost:76,g:"#d5ab5e"} };
/* 佩戴首饰等价于「佩戴即激活技艺」：buff.k 就是它替你激活的那门技艺 */
const JEWELS={
  ring   :{n:"素面戒指", metal:"silver",mul:1.40,t:2,ds:"一枚戒面，最省工",
           buff:{k:"hand",  n:"手更稳",  ds:"凿、震每击 +6% 成功率"}},
  pendant:{n:"银镶项链", metal:"silver",mul:1.58,t:2,ds:"坠子吃光，卖相好",
           buff:{k:"blade", n:"刃更利",  ds:"锯每击 +6% 成功率"}},
  earring:{n:"鎏金耳环", metal:"gold",  mul:1.80,t:3,ds:"成对出货，价最高",
           buff:{k:"tongue",n:"舌更巧",  ds:"拍卖成交价 +15%"}}
};
const JKS=["ring","pendant","earring"];
const WEAR_MAX=1;                 // 身上最多戴一件（同时只激活一项技艺）

/* ── 修复台：可修复的损伤（DMG.rp=1）才可修 ── */
/* 修复价目：除粉化（全毁）外均可修复，越严重越贵 */
const REPAIR={
  crack :{cost:60},    // 裂纹 −15%
  lost  :{cost:110},   // 缺料 −22%
  chip  :{cost:180},   // 崩边 −35%
  haze  :{cost:320},   // 雾化 −50%
  broken:{cost:520}    // 破损 −65%
};

/* ── 每日异象事件：开铺时抽一条，影响当天 ── */
const EVENTS=[
  {k:"quake",n:"地脉震动",a:"震",ds:"地底在翻身 —— 今日剥离失控风险上浮",
   tip:"凿击损伤 +30%", lc:1},
  {k:"black",n:"线路故障",a:"电",ds:"灯丝暗了一截 —— 今日鉴定的成色看得更糊",
   tip:"鉴定成色偏保守，看不出绝料", lc:0},
  {k:"guest",n:"深夜访客",a:"客",ds:"有人提前摸进铺子 —— 今夜拍卖客人手头更宽裕",
   tip:"拍卖预算 +20%", lc:2},
  {k:"night",n:"梦魇",    a:"梦",ds:"昨夜梦见姐姐站在柜前 —— 醒来时手还在抖",
   tip:"锯击容错 −15%", lc:0},
  {k:"radio",n:"污染频道",a:"频",ds:"收音机自己响了，播着不存在的矿场编号",
   tip:"异像石出现率翻倍，运气 +3", lc:3},
  {k:"fog",  n:"潮雾",    a:"雾",ds:"雾从地缝渗进来 —— 台面湿滑",
   tip:"修磨更难，运气 +2", lc:2}
];

/* ── 天赐：陈列后提升全店售价（异像石剥离所得，集齐不再产出）── */
const GIFTS=[
  {k:"symbiosis", n:"共生核",   bonus:5, ds:"多矿共生原石，承上古矿脉灵气，异质晶体缠结相生，离山仍自缓缓搏动",           img:"assets/relic_symbiosis.webp"},
  {k:"deepsea",   n:"深海之眼", bonus:5, ds:"深海矿层孕育的蓝宝石单晶，浑圆如瞳，久观似闻浪涛回响",                   img:"assets/relic_deepsea.webp"},
  {k:"pulse",     n:"搏动晶簇", bonus:5, ds:"簇状原生矿晶，脉息与人声心跳相和，易主之时，振律便悄然改换",             img:"assets/relic_pulse.webp"},
  {k:"vein",      n:"地脉碎片", bonus:5, ds:"地底岩层崩落之矿块，断面逸出地中气，裹挟淡淡铁锈清息",                 img:"assets/relic_vein.webp"}
];

/* ── 藏珍：图鉴式的佳石记录，记的是开出来过的好石头 ──
   每条存石种、极品成色、当日评语；点开看得到立绘。 */
const KEEPCAP=60;               // 藏珍最多收录的条目数

/* ── 技艺：声誉换手艺，每一项都有明确机制 ── */
const SKILLS=[
  {k:"ore",   n:"察矿", req:20, cost:1000, ds:"习得辨矿识皮之术，可开启晶簇箱，探查矿中杂料原石，甄别基础石料品相。", unlock:"晶簇箱"},
  {k:"jade",  n:"寻玉", req:32, cost:2000, ds:"通晓玉皮蟒纹征兆，可开启明料匣，辨明内里种水，开采高阶玉料原石。",     unlock:"明料匣"},
  {k:"blade", n:"利刃", req:42, cost:3000, ds:"习得金刚线锯之术，可开料「线割」，成功率 +5%，沿石纹裁切、保全玉料。",   unlock:"线割"},
  {k:"hand",  n:"稳手", req:52, cost:4000, ds:"习得超声震裂技法，可开料「震解」，成功率 +8%，震动解石、崩损更少。",   unlock:"震解"},
  {k:"art",   n:"巧匠", req:60, cost:5000, ds:"首饰制作成功率 +10%"},
  {k:"tongue",n:"妙语", req:68, cost:6000, ds:"深谙竞价言谈之道，竞拍时言辞善诱，竞拍出价提升 10%。"},
  {k:"mind",  n:"凝神", req:78, cost:7000, ds:"静心凝气观石，每日第一次原石鉴定，无需消耗资源。"}
];
/* 技艺 → 解锁物：箱位与工具都由技艺点名放行 */
const SKILL_UNLOCK={ ore:"晶簇箱", jade:"明料匣", hand:"震解", blade:"线割" };
/* 箱位解锁：晶簇箱须「察矿」，明料匣须「寻玉」；杂矿袋是起始箱，无需技艺 */
const BOX_SKILL={ crate:"ore", vitrine:"jade" };
/* 工具解锁：声誉达标只是「能取用」，真正「能用」要在技艺里点名考取对应手艺。
   凿 = 起始手艺（无需考取）；锯需「利刃」；震需「稳手」+ 声誉 65。 */
const TOOL_SKILL={chisel:null, saw:"blade", sonic:"hand"};
const SONIC_REP=65;            // 震另需声誉门槛
/* 妙语：竞拍出价提升 10%（作用于客人预算与落槌成交额） */
const TONGUE_AUC_K=0.10;

/* ── 拍卖会客人 ── */
const CUSTOMERS=[
  {n:"红衣绅士",  a:"绅", like:"ruby",     k:1.28},
  {n:"蒙面贵妇",  a:"妇", like:"emerald",  k:1.24},
  {n:"钟表匠",    a:"钟", like:"sapphire", k:1.18},
  {n:"地志画师",  a:"画", like:"topaz",    k:1.15},
  {n:"守灯人遗孀",a:"孀", like:"amethyst", k:1.12},
  {n:"矿务干事",  a:"事", like:"garnet",   k:1.10},
  {n:"聋耳上校",  a:"校", like:"peridot",  k:1.14},
  {n:"收藏怪人",  a:"怪", like:"quartz",   k:1.06}
];

/* ── 声誉：能换技艺，也能抬价 ──
   卖出的石头越值钱，声誉涨得越快；卖劣质宝石（水晶/橄榄石/石榴石）反倒折损声誉。 */
const REP_STEP=[70, 130, 210, 320, 480];   // 达成对应单件成交价时的涨幅
const REP_LOSS=4;                // 卖出劣质宝石的单次折损
const REP_MAX=1000;              // 声望上限（原 100，已调高至 1000）
const WEAK_GEMS=["quartz","peridot","garnet","douzhong","ganqing"];   // 卖这些要折声誉（下等杂石）
const REP_AUCTION_K=0.012;       // 每点声誉给成交价 +1.2%（上限 +120%）
const RESTOCK_COST=120;      // 赊一件原石
const DAY_TIME=24;           // 每日营业时辰（够开两块料）
/* ── 租金系统：每5天收一次1000金，破产则游戏结束 ── */
const RENT_INTERVAL=5;      // 每几天收一次租
const RENT_AMOUNT=5000;     // 每次租金金额
const POLISH_BASE=3;         // 抛光基础次数
const LUCK_DECAY=6;          // 打烊后运气全额回落（次日重掷）
const ANOM_BASE=0.26;        // 异像石基础出现率
const ANOM_TIER=0.07;        // 每阶货档加成
const WINDOW_RATE=0.28;      // 开窗石（明料）出现率
const WINDOW_MUL=1.55;       // 开窗料加价（高价买信息）

/* ── 成功率衰减：每落一手，成功率按乘数递减（越深越难） ── */
/* 衰减放缓：前几手仍有机会，坡度足够陡才形成「要不要收刀」的抉择 */
const DECAY={ peel:0.945, cut:0.930, polish:0.915 };
const RATE_FLOOR=0.22;          // 成功率下限，防止后期变成必砸
const RATE_CAP=0.96;            // 成功率上限
/* 底噪：石头的固有损耗（内应力、雾度）对成功率的影响放大放缓 */
const RISK_SOFT=0.62;

/* ── 收刀（半成品结算）系数：按实际推进到哪一道工序折价 ── */
const STOP_RATIO={ rough:0, peel:0.34, cut:0.70, polish:0.92 };
/* 收刀封顶：任何时候提前收手都拿不到满价，最多 92% */
const STOP_CAP=0.92;
/* 起手门槛：至少落了一手 / 一刀，才谈得上收（否则系数为 0，扣不住按钮） */
const STOP_MIN_HIT=1;

/* ── 积分「石筹」：盲盒可用金币或石筹开箱 ── */
const PTS_FROM_KEEP=0.028;      // 成品入柜：按底价折算石筹
const PTS_FROM_SALE=0.020;      // 拍卖成交：按成交额折算石筹

/* ── 盲盒：矿石商的原石不再明码，改为按档位开箱，箱内三选一 ── */
const BOXES=[
  {k:"sack",  n:"杂矿袋", tier:1, gold:150, pts:8,
   gems:["quartz","peridot","garnet","topaz"],
   shell:"#6b6257",
   ds:"矿商从尾矿堆里随手抓的粗料。石种常见、裂隙多，但价钱也贱。"},
  {k:"crate", n:"晶簇箱", tier:2, gold:360, pts:20,
   gems:["topaz","amethyst","garnet","emerald"],
   shell:"#7a5a34",
   ds:"矿商按产地挑过的箱料。常见石种之外，紫水晶与祖母绿露面的机会明显更大。"},
  {k:"vitrine",n:"明料匣", tier:3, gold:760, pts:42,
   gems:["emerald","ruby","sapphire","amethyst"],
   shell:"#5d4a6e",
   ds:"只有过手的老矿才有资格开。硬料多、裂隙少，价钱也最狠。"}
];
/* 充电专属石不在箱内随机池中，须在石市单独购入（见EX_STONE） */

/* ── 排行榜 / 社交加成 / 充电专属 ── */
const LB_BOARD=1;                 // 排行榜槽位 1：累计收益（官方 SDK board 为数字 1~5）
const LB_BOARD_VAL=2;             // 排行榜槽位 2：单件最高成交价（宝石 / 首饰）
const LB_LIMIT=10;                // 只记录前十名
/* 前三名专属称号（仅榜上有名才有，不随存档写入） */
const LB_TITLES={1:"琢玉天工", 2:"斫璞灵工", 3:"慧眼识石"};
const LB_TITLES_VAL={1:"点石成金", 2:"慧眼识珍", 3:"巧手出器"};
const SOCIAL_BONUS=0.06;            // 一键三连 + 关注 合计 +6% 成功率
const CHARGE_BONUS=0.04;          // 包月充电 / 粉丝牌 额外 +4% 成功率
/* 石种稀有度：用于盲盒三选一的文案与「看货」提示 */
const RARITY=[
  {max:0.85, n:"常见", d:"市面常见，价钱随行就市"},
  {max:1.35, n:"中见", d:"行内少见，识货的人才肯出价"},
  {max:1.75, n:"稀有", d:"一两矿脉才出一块，拍卖必争"},
  {max:99,   n:"绝品", d:"地渊深处的传说，传闻没人真的切出来过"}
];
/* ── 充电专属石「异石」：不在盲盒池里，须在石市单独购入 ──
   设定：异石为原石名，档位按四类结算；天品档现形即为龙石（gtype 切换为 dragon，见 game.js）。 */
const EX_STONE={
  k:"obsidian", n:"异石", tier:4,
  gold:1200, pts:64,
  shell:"#4a1d1d",
  ds:"深红近黑，灯下不反光，转动时渗出暗星点。有可能开出传说中的龙石.",
  c:"#7a1e1e", c2:"#d66b6b", ch:"#ffe5e5", mul:2.35, hd:8.8,
  img:"assets/cluster_anomaly.webp", cutimg:"assets/cut_obsidian_waste.webp",
  rough:"assets/rough_obsidian.webp", exclusive:true
};
Object.assign(GEMS, {obsidian:{
  n:EX_STONE.n, c:EX_STONE.c, c2:EX_STONE.c2, ch:EX_STONE.ch,
  mul:EX_STONE.mul, hd:EX_STONE.hd,
  img:EX_STONE.img, cutimg:EX_STONE.cutimg, exclusive:true
}});
/* ── 龙石：天品档现形的传说石种，仅此一途可得 ── */
Object.assign(GEMS, {dragon:{
  n:"龙石", c:"#c9a227", c2:"#f2d878", ch:"#fffbe6",
  mul:2.80, hd:9.2,
  img:"assets/cluster_dragon.webp", cutimg:"assets/cut_dragon.webp", exclusive:true
}});
GK=Object.keys(GEMS);
/* 专属石/龙石的工序状态立绘（此二石在文件后部入 GEMS，此处补齐） */
WORK_ASSETS.obsidian={peel:"assets/work_peel_obsidian.webp", cut:"assets/work_cut_obsidian.webp", polish:"assets/work_polish_obsidian.webp"};
WORK_ASSETS.dragon  ={peel:"assets/work_peel_dragon.webp",   cut:"assets/work_cut_dragon.webp",   polish:"assets/work_polish_dragon.webp"};
ROUGH.obsidian=EX_STONE.rough;   // 专属石的粗坯
ROUGH.dragon="assets/rough_dragon.webp";   // 龙石粗坯（绝料现形后用）
/* 龙石的损伤贴图：破碎的龙石 */
DMGIMG.dragon ={crack:"assets/dmg_crack_dragon.webp",  chip:"assets/dmg_chip_dragon.webp"};
CUTDMG.dragon ={crack:"assets/cutdmg_crack_dragon.webp", chip:"assets/cutdmg_chip_dragon.webp"};
/* 龙石材质立绘：三档同图（完整龙石），首饰用专属龙石图 */
GRADE_ASSETS.dragon={
  waste :{img:"assets/cluster_dragon.webp", cutimg:"assets/cut_dragon.webp", ring:"assets/jewel_ring_dragon_waste.webp",   pendant:"assets/jewel_pendant_dragon_waste.webp",   earring:"assets/jewel_earring_dragon_waste.webp",   dmg_img:""},
  flower:{img:"assets/cluster_dragon.webp", cutimg:"assets/cut_dragon.webp", ring:"assets/jewel_ring_dragon_flower.webp",  pendant:"assets/jewel_pendant_dragon_flower.webp",  earring:"assets/jewel_earring_dragon_flower.webp",  dmg_img:""},
  high  :{img:"assets/cluster_dragon.webp", cutimg:"assets/cut_dragon.webp", ring:"assets/jewel_ring_dragon_high.webp",    pendant:"assets/jewel_pendant_dragon_high.webp",    earring:"assets/jewel_earring_dragon_high.webp",    dmg_img:""}
};

/* ── 异石（obsidian）立绘：三档独立（生图模型生成），中等/上等档各自成一套 ── */
GRADE_ASSETS.obsidian={
  waste :{img:"assets/cluster_obsidian_waste.webp",  cutimg:"assets/cut_obsidian_waste.webp",  ring:"assets/jewel_ring_obsidian_waste.webp",  pendant:"assets/jewel_pendant_obsidian_waste.webp",  earring:"assets/jewel_earring_obsidian_waste.webp",  dmg_img:""},
  flower:{img:"assets/cluster_obsidian_flower.webp", cutimg:"assets/cut_obsidian_flower.webp", ring:"assets/jewel_ring_obsidian_flower.webp", pendant:"assets/jewel_pendant_obsidian_flower.webp", earring:"assets/jewel_earring_obsidian_flower.webp", dmg_img:""},
  high  :{img:"assets/cluster_obsidian_high.webp",   cutimg:"assets/cut_obsidian_high.webp",   ring:"assets/jewel_ring_obsidian_high.webp",   pendant:"assets/jewel_pendant_obsidian_high.webp",   earring:"assets/jewel_earring_obsidian_high.webp",   dmg_img:""}
};

/* ── 中等/下等石种（新档位固定石种）：三档同图（生图模型生成，石种视觉固定）── */
(function(){
  const TIER_GEMS=["nuibing","nuozhong","ziluolan","piaohua","furong","douzhong","ganqing"];
  for(const gk of TIER_GEMS){
    GRADE_ASSETS[gk]={
      waste :{img:"assets/cluster_"+gk+".webp",  cutimg:"assets/cut_"+gk+".webp",  ring:"assets/jewel_ring_"+gk+".webp",  pendant:"assets/jewel_pendant_"+gk+".webp",  earring:"assets/jewel_earring_"+gk+".webp",  dmg_img:""},
      flower:{img:"assets/cluster_"+gk+".webp",  cutimg:"assets/cut_"+gk+".webp",  ring:"assets/jewel_ring_"+gk+".webp",  pendant:"assets/jewel_pendant_"+gk+".webp",  earring:"assets/jewel_earring_"+gk+".webp",  dmg_img:""},
      high  :{img:"assets/cluster_"+gk+".webp",  cutimg:"assets/cut_"+gk+".webp",  ring:"assets/jewel_ring_"+gk+".webp",  pendant:"assets/jewel_pendant_"+gk+".webp",  earring:"assets/jewel_earring_"+gk+".webp",  dmg_img:""}
    };
  }
})();

/* ── 充电专属石改为「三选一」盲盒：与普石同规则（材质三档），但高档料有概率冲绝料（绝料即龙石） ── */
const EX_RARE_CHANCE=0.4;        // 专属石高档料里冲「绝料」的比例
BOXES.push({
  k:"exbox", n:"异石", tier:EX_STONE.tier, gold:EX_STONE.gold, pts:EX_STONE.pts,
  // 异石箱开出的也是实名石种（与普通箱同一套池），只是概率偏上等且独有机会现形龙石
  gems:["dragon","emerald","ruby","sapphire","amethyst","quartz","topaz","garnet","peridot"],
  shell:EX_STONE.shell, ds:EX_STONE.ds, ex:true
});

/* ══════════════════════════════════════════════════════════════
   赌 坊 · Gamble
   ────────────────────────────────────────────────────────────
   一刀下去，皮壳裂开。这里不鉴定、不瞻礼、不能反悔。
   石璞与产物全部独立于 GEMS，不复用任何现有宝石条目。
   砖头料沿用现网立绘与设定（waste_rock.webp）。
   ══════════════════════════════════════════════════════════════ */

/* ── 四种石璞：每方200,000 金，一档不分高低 ──
   皮壳外观即全部信息。四璞倾向完全取消（期望随运气随机，常规 50%），
   选璞不构成决策，只换一层皮相。 */
const PU_PRICE=200000;                    // 每方石璞售价（金币）
const PU_PRICE_PTS=2000;                 // 每方石璞售价（石筹）—— 与金币二选一
/* 石筹折算金币的汇率：石筹来自成品入柜（PTS_FROM_KEEP=0.028）与成交（PTS_FROM_SALE=0.020），
   取两者中值 0.024 作为「1 石筹 ≈ 1/0.024 金」，用于赌坊投入统计的统一口径。 */
const PTS_GOLD_RATIO=1/0.024;
const PU=[
  {k:"tai", n:"苔璞", img:"assets/pu_tai.webp", ds:"灰白粗砺，苔痕爬满壳面，一抠掉粉",  c:"#8a9179"},
  {k:"lan", n:"岚璞", img:"assets/pu_lan.webp", ds:"灰蓝带霞，壳面如蒙一层薄雾",       c:"#7d93a8"},
  {k:"mo",  n:"墨璞", img:"assets/pu_mo.webp",  ds:"乌亮如漆，指甲划痕见银白",         c:"#4a4a52"},
  {k:"yao", n:"瑶璞", img:"assets/pu_yao.webp", ds:"石纹细密，霜纹透光，温润不刺手",   c:"#a8a093"}
];
const PUK=["tai","lan","mo","yao"];

/* ── 十档产物：基础概率合计 100%（砖头料 50%为血本无归那一档）── */
const PU_PROD=[
  {k:"wuzhan",  n:"砖头料", tier:"",p:0.5000, rec:0,      bo:0,    img:"assets/waste_rock.webp",
   ds:"一包灰渣。什么都没剩下。"},
  /* ── 寻常上品 ── */
  {k:"lingjin", n:"泠瑾", tier:"寻常上品", p:0.0900, rec:210000, bo:0.2, img:"assets/prod_lingjin.webp",
   ds:"冰种素玉，如水凝冰，通透莹润，自带胶感柔光，藏家喜爱的藏品。"},
  {k:"yanyu",   n:"烟瑜", tier:"寻常上品", p:0.1300, rec:184000, bo:0.2, img:"assets/prod_yanyu.webp",
   ds:"糯化烟青，底色朦胧如烟，质地匀净细腻，宜雕琢玉牌、平安佩。"},
  {k:"feiheng", n:"绯珩", tier:"寻常上品", p:0.0900, rec:168000, bo:0.2, img:"assets/prod_feiheng.webp",
   ds:"暖糯红翡，色泽温润内敛，底子干净，可制手镯与随身佩饰。"},
  /* ── 稀有上品 ── */
  {k:"jiangli", n:"绛璃", tier:"稀有上品", p:0.0600, rec:300000, bo:2.0, img:"assets/prod_jiangli.webp",
   ds:"冰种红翡，色泽浓而不燥，玉质清亮通透，红翡之中难得的上品。"},
  {k:"bixiao",  n:"碧绡", tier:"稀有上品", p:0.0800, rec:380000, bo:2.0, img:"assets/prod_bixiao.webp",
   ds:"高冰飘翠，翠色如轻纱游走玉内，灵动起光，品相绝佳。"},
  {k:"changyao",n:"菖瑶", tier:"稀有上品", p:0.0480, rec:400000, bo:2.0, img:"assets/prod_changyao.webp",
   ds:"糯种飘丝浅翠，翠线飘逸灵动，玉质柔和，质感雅致。"},
  /* ── 传世绝品 ── */
  {k:"chencai", n:"宸翠", tier:"传世绝品", p:0.0010, rec:480000, bo:5.0, img:"assets/prod_chencai.webp",
   ds:"满色浓翠，种质老透，光华凝敛，世间罕有的帝王级美玉。"},
  {k:"danyao",  n:"丹瑶", tier:"传世绝品", p:0.0005, rec:720000, bo:5.0, img:"assets/prod_danyao.webp",
   ds:"传世鸡冠红翡，红艳纯正，通透无杂，百年难遇的红翡至宝。"},
  {k:"yueli",   n:"月璃", tier:"传世绝品", p:0.0005, rec:1000000,bo:5.0, img:"assets/prod_yueli.webp",
   ds:"玻璃种素玉，清透如皓月，无棉无绺，莹光流转，稀世奇珍。"}
];
const PPK=["wuzhan","lingjin","yanyu","feiheng","jiangli","bixiao","changyao","chencai","danyao","yueli"];
/* 砖头料不入藏：唯一bo===0 且 tier==="" 的档位 */
const GAMBLE_KEEPABLE=PPK.filter(k=>k!=="wuzhan");

/* ── 门票：声望计价，只升不降、不限次、不设日限（方案 v3 §六）── */
const TICKET_BASE=10;             // 第 1 张票价
const TICKET_STEP=3;              // 每多一张递增
const TICKET_CAP=40;              // 封顶
const ticketPrice=n=>Math.min(TICKET_BASE+TICKET_STEP*(n-1), TICKET_CAP);

/* ── 赌藏：入藏产物换取全局售价加成，上限 +40% ── */
const VAULT_CAP=40;               // 赌藏加成上限（%）

/* ── 终极目标：买下玉石铺 ── */
const SHOP_GOAL=10000000;          // 契价（金）
const SHOP_NAME="玉石铺";

/* ── 赎铺分期存入的档位（不可取回）── */
const FUND_TIERS=[50000,200000,1000000];

/* ── 测试探针暴露 ── */
window.GEMS=GEMS;window.GIFTS=GIFTS;window.KEEPCAP=KEEPCAP;window.PU_PROD=PU_PROD;window.GRADE_HIGH=GRADE_HIGH;window.GRADE_RARE=GRADE_RARE;
