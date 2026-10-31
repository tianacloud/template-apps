export async function mount(root, context) {
  let elevationBytes, geography;
  try {
    const response = await context.files.get("template-assets/elevation.bin");
    if (!response.ok) throw new Error("asset unavailable");
    elevationBytes = new Uint8Array(await response.arrayBuffer());
    const geoResponse = await context.files.get("template-assets/geography.json");
    if (!geoResponse.ok) throw new Error("geography unavailable");
    geography = await geoResponse.json();
    if (elevationBytes.length !== 1440 * 720) throw new Error("invalid elevation data");
  } catch (error) {
    root.textContent = "地形数据加载失败，请刷新页面重试。";
    return;
  }
const link=document.createElement("link"); link.rel="stylesheet"; link.href=new URL("./app.css",import.meta.url); document.head.append(link);
root.innerHTML="\n<canvas id=\"globe\" tabindex=\"0\" role=\"img\" aria-label=\"交互式地球仪\" aria-describedby=\"globeHelp\"></canvas>\n<p id=\"globeHelp\" class=\"sr-only\">拖动或使用方向键旋转地球仪；滚轮或缩放按钮调整大小。将焦点放在地球仪上后按 Enter，可读取当前视图中心位置的信息。</p>\n\n<div class=\"topbar\">\n  <div class=\"brand\"><i>🌍</i><span class=\"t\">3D 地理地球仪</span></div>\n\n  <div class=\"group\" id=\"modes\">\n    <button class=\"b on\" data-mode=\"basic\" aria-pressed=\"true\">基础</button>\n    <button class=\"b\" data-mode=\"guide\" aria-pressed=\"false\">学习路线</button>\n    <button class=\"b\" data-mode=\"daynight\" aria-pressed=\"false\">昼夜四季</button>\n    <button class=\"b\" data-mode=\"timezone\">时区</button>\n    <button class=\"b\" data-mode=\"quiz\">练习</button>\n  </div>\n\n  <div class=\"group\" id=\"views\">\n    <button class=\"b on\" data-view=\"front\" aria-pressed=\"true\">正视图</button>\n    <button class=\"b\" data-view=\"north\" aria-pressed=\"false\">北极</button>\n    <button class=\"b\" data-view=\"south\" aria-pressed=\"false\">南极</button>\n  </div>\n  <button class=\"b\" id=\"btnLayers\" aria-expanded=\"false\" aria-controls=\"chips\">图层</button>\n\n  <div class=\"chips\" id=\"chips\"></div>\n\n  <div class=\"spacer\"></div>\n\n  <div class=\"group spin-grp\">\n    <span class=\"lbl\">转速</span>\n    <input type=\"range\" id=\"spinSpeed\" min=\"4\" max=\"120\" step=\"2\" value=\"48\" title=\"自转一圈所需秒数（越小越快）\">\n    <span class=\"val\" id=\"spinVal\">48秒/圈</span>\n  </div>\n\n  <div class=\"group\">\n    <button class=\"b\" id=\"btnSkin\" title=\"切换底色\">浅色底色</button>\n    <button class=\"b\" id=\"btnFull\" title=\"全屏 (F)\">全屏</button>\n    <a class=\"b\" id=\"btnDl\" href=\"./globe-3d.zip\" download title=\"下载离线版（地球仪 + 使用说明，断网可用）\">⤓ 下载离线版</a>\n  </div>\n</div>\n\n<div class=\"rail\">\n  <button id=\"btnZoomIn\"  title=\"放大 (+)\">＋</button>\n  <button id=\"btnZoomOut\" title=\"缩小 (−)\">−</button>\n  <div class=\"sep\"></div>\n  <button id=\"btnSpin\" class=\"on\" title=\"暂停/继续自转 (空格)\">⏸</button>\n  <button id=\"btnReset\" title=\"复位 (R)\">⟲</button>\n  <div class=\"sep\"></div>\n  <button id=\"btnShot\" title=\"导出当前画面 PNG（做 PPT 用）\">⤓</button>\n</div>\n\n<div class=\"panel\" id=\"panel\">\n  <div class=\"p-head\"><b id=\"pTitle\">模式</b><span class=\"sub\" id=\"pSub\"></span><button class=\"x\" id=\"pClose\" title=\"关闭面板 (Esc)\">×</button></div>\n  <div id=\"pBody\"></div>\n</div>\n\n<div class=\"info\" id=\"info\">\n  <div class=\"info-h\"><span class=\"pin\">📍</span><span class=\"co\" id=\"infoCo\">—</span><span class=\"tag\" id=\"infoTag\">悬停</span></div>\n  <dl id=\"infoDl\"></dl>\n</div>\n\n<div class=\"tip\">\n  拖动旋转 · 滚轮缩放 · <span class=\"kbd\">空格</span>暂停 · <span class=\"kbd\">1</span>-<span class=\"kbd\">5</span>切换模式 · <span class=\"kbd\">←→↑↓</span>微调 · <span class=\"kbd\">R</span>复位 · <span class=\"kbd\">F</span>全屏 · 点击锁定信息\n</div>\n\n<!-- 地形图例（仅在“地形”图层开启时显示） -->\n<div class=\"legend\" id=\"legend\">\n  <div class=\"t\">🏔️ <b>地形 · 海拔</b></div>\n  <div class=\"bar\" id=\"legendBar\"></div>\n  <div class=\"ticks\">\n    <span>8000m</span><span>4000</span><span>2000</span><span>1000</span>\n    <span>0 海平面</span><span>-2000</span><span>-6000</span>\n  </div>\n  <div class=\"mkey\">\n    <span style=\"color:#ff6b4a\"><i></i>山峰</span>\n    <span style=\"color:#3ea0d8\"><i></i>低地·海沟</span>\n    <span style=\"color:#ffd24a\"><i class=\"dot\"></i>地形区</span>\n  </div>\n</div>\n\n";
document.getElementById("btnDl").addEventListener("click", async function (event) {
  event.preventDefault();
  try {
    const response = await context.files.get("template-assets/globe-3d.zip");
    if (!response.ok) throw new Error("download failed");
    const url = URL.createObjectURL(await response.blob());
    const a = document.createElement("a"); a.href = url; a.download = "globe-3d.zip"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) { alert("离线版暂时无法下载，请稍后重试。"); }
});

/* 自动生成，勿手改。源：Natural Earth 110m (public domain) */
var GEO_CONTINENTS = geography.GEO_CONTINENTS;
var GEO_COASTLINE = geography.GEO_COASTLINE;
var GEO_BORDERS = geography.GEO_BORDERS;
var GEO_COUNTRIES = geography.GEO_COUNTRIES;
var GEO_CONT_ZH = geography.GEO_CONT_ZH;



/* 地形高程数据: z=3 terrarium 网格重采样为 1440x720 等经纬, 1字节非线性量化 */
var GEO_ELEV = {"w":1440,"h":720,"enc":"raw","q":[[-8000,0],[-6000,12],[-4000,28],[-3000,38],[-2000,50],[-1000,64],[-200,76],[-20,84],[0,88],[10,92],[100,100],[300,110],[500,118],[1000,130],[1500,140],[2000,150],[3000,165],[4000,178],[5000,190],[6000,205],[7000,225],[8000,245],[9000,255]]}; GEO_ELEV.bytes = elevationBytes;
var GEO_PEAKS = geography.GEO_PEAKS;


Object.assign(window,{GEO_ELEV,GEO_PEAKS,GEO_COASTLINE});

/* =====================================================================
   3D 交互地球仪 · 渲染引擎（零依赖，纯 Canvas 2D）
   ---------------------------------------------------------------------
   核心思想：把单位球面上的点用「中心经度 lon0 + 俯仰角 pitch」旋转到相机
   空间，做正交投影；用 z 符号区分正/背面；用 Sutherland-Hodgman 在球面
   上沿 z=0 大圆裁剪多边形，并对被切断处补齐地平圆弧（否则大洲会被切出
   直角缺口）。所有地理查询（点→经纬度→大洲/大洋/国家/时区/气候带）都
   建立在同一套正反投影之上。
   ===================================================================== */
(function () {
"use strict";

var RAD = Math.PI / 180, DEG = 180 / Math.PI;
var TAU = Math.PI * 2;

/* ------------------------------------------------------------------ *
 * 0. 常量：色板 / 图层 / 标签
 * ------------------------------------------------------------------ */
var CONT_KEYS = ["Asia", "Africa", "Europe", "North America",
                 "South America", "Oceania", "Antarctica"];

var PAL = {
  dark: {
    land: {
      "Asia": "#c9a35c", "Africa": "#c68a5c", "Europe": "#a4b56c",
      "North America": "#7da4c9", "South America": "#7fb98a",
      "Oceania": "#b48cb4", "Antarctica": "#ccd8e6"
    },
    landBack: "#243348", coast: "#0a1a2c", coastBack: "#1b2a3e",
    border: "rgba(228,240,255,.34)", grid: "rgba(255,255,255,.30)",
    gridBack: "rgba(255,255,255,.13)", star: true,
    oceanA: "#1a4a86", oceanB: "#0a2044", bg2: "#0d1730", bg3: "#050810",
    halo: "90,169,240"
  },
  light: {
    land: {
      "Asia": "#e3c184", "Africa": "#e2ab7c", "Europe": "#c8da95",
      "North America": "#a3c4dd", "South America": "#aed4b2",
      "Oceania": "#d3b4d0", "Antarctica": "#e9f0f8"
    },
    landBack: "#b9cfe2", coast: "#5b83a8", coastBack: "#a8c1d6",
    border: "rgba(40,72,110,.42)", grid: "rgba(47,93,138,.34)",
    gridBack: "rgba(47,93,138,.14)", star: false,
    oceanA: "#9ec9ea", oceanB: "#7fb5de", bg2: "#d3e4f6", bg3: "#eef5fc",
    halo: "120,190,240"
  }
};

var LAYERS = [
  { k: "equator", n: "赤道",       c: "#ff4d5e", on: true,  w: 2.4 },
  { k: "tropic",  n: "回归线",     c: "#ffc93c", on: true,  w: 1.8 },
  { k: "polar",   n: "极圈",       c: "#3ddc84", on: true,  w: 1.8 },
  { k: "prime",   n: "本初子午线", c: "#b06cff", on: true,  w: 1.8 },
  { k: "anti",    n: "180°经线",   c: "#b06cff", on: false, w: 1.6 },
  { k: "hemi",    n: "东西半球线", c: "#ff8a3d", on: false, w: 1.6 },
  { k: "grid",    n: "经纬网",     c: "#cfe2ff", on: true,  w: 1.0 },
  { k: "border",  n: "国界",       c: "#9fb3cc", on: false, w: 1.0 },
  { k: "label",   n: "地名",       c: "#ffffff", on: true,  w: 0   },
  { k: "axis",    n: "地轴",       c: "#ffffff", on: false, w: 1.6 },
  { k: "tilt",    n: "地轴倾斜",   c: "#ffd24d", on: false, w: 0   },
  { k: "terrain", n: "地形",       c: "#d99a4e", on: false, w: 0   },
  { k: "back",    n: "透明地球",   c: "#7f93ad", on: false, w: 0   },
  { k: "opaque",  n: "不透明",     c: "#9fd0ff", on: true,  w: 0   }
];

/* 大洲标注锚点（手工挑选的代表性位置，避开海面与边缘） */
var LAB_CONT = [
  { t: "亚洲",   lat: 44,  lon: 88,  s: 1.00 },
  { t: "欧洲",   lat: 53,  lon: 20,  s: 0.86 },
  { t: "非洲",   lat: 6,   lon: 20,  s: 1.00 },
  { t: "北美洲", lat: 45,  lon: -100, s: 1.00 },
  { t: "南美洲", lat: -12, lon: -60, s: 0.98 },
  { t: "大洋洲", lat: -24, lon: 134, s: 0.86 },
  { t: "南极洲", lat: -78, lon: 0,   s: 0.90 }
];
var LAB_OCEAN = [
  { t: "太平洋", lat: -8,  lon: -140, s: 1.00 },
  { t: "大西洋", lat: 12,  lon: -38,  s: 0.96 },
  { t: "印度洋", lat: -24, lon: 76,   s: 0.96 },
  { t: "北冰洋", lat: 80,  lon: -30,  s: 0.84 },
  { t: "南冰洋", lat: -58, lon: 60,   s: 0.80 }
];

var CONT_INFO = {
  "亚洲": "世界面积最大、人口最多的大洲",
  "非洲": "世界第二大洲，热带面积最广",
  "欧洲": "平均海拔最低的大洲",
  "北美洲": "世界第三大洲，跨寒、温、热三带",
  "南美洲": "拥有世界最大的热带雨林（亚马孙）",
  "大洋洲": "世界面积最小的大洲",
  "南极洲": "世界最冷、平均海拔最高的大洲，无常住人口"
};
var OCEAN_INFO = {
  "太平洋": "世界最大、最深的大洋，约占海洋总面积一半",
  "大西洋": "世界第二大洋，轮廓呈“S”形",
  "印度洋": "世界第三大洋，大部分位于南半球",
  "北冰洋": "世界最小、最浅、最冷的大洋",
  "南大洋（南冰洋）": "环绕南极洲，通常指 60°S 以南海域"
};

/* 主要海域：矩形范围近似（在“大洋”判定之前匹配，教学够用） */
var SEAS = [
  { n: "渤海",     lo: [117, 122], la: [37, 41] },
  { n: "黄海",     lo: [119, 127], la: [33, 40] },
  { n: "东海",     lo: [120, 130], la: [24, 33] },
  { n: "南海",     lo: [105, 121], la: [3, 23] },
  { n: "日本海",   lo: [127, 142], la: [34, 52] },
  { n: "鄂霍次克海", lo: [142, 163], la: [44, 62] },
  { n: "孟加拉湾", lo: [80, 95],   la: [5, 22] },
  { n: "阿拉伯海", lo: [50, 75],   la: [5, 25] },
  { n: "波斯湾",   lo: [47, 57],   la: [23, 30] },
  { n: "红海",     lo: [32, 44],   la: [12, 30] },
  { n: "地中海",   lo: [-6, 36],   la: [30, 46] },
  { n: "黑海",     lo: [27, 42],   la: [40, 47] },
  { n: "里海",     lo: [46, 55],   la: [36, 47] },
  { n: "波罗的海", lo: [9, 30],    la: [53, 66] },
  { n: "北海",     lo: [-4, 9],    la: [51, 61] },
  { n: "墨西哥湾", lo: [-98, -80], la: [18, 31] },
  { n: "加勒比海", lo: [-89, -59], la: [9, 23] },
  { n: "白令海",   lo: [163, 180], la: [51, 66] },
  { n: "珊瑚海",   lo: [145, 165], la: [-25, -10] },
  { n: "阿拉斯加湾", lo: [-155, -130], la: [48, 60] }
];

/* ------------------------------------------------------------------ *
 * 0b. 太阳 / 时区 / 题库
 *     —— 昼夜四季、时区对照、课堂练习三个模式共用的数据与数学
 * ------------------------------------------------------------------ */
var TERMS = [
  { n: "春分", d: 80,  desc: "太阳直射赤道，全球昼夜平分，晨昏线经过南北两极" },
  { n: "夏至", d: 173, desc: "太阳直射北回归线，北半球昼最长；北极圈（66.5°N）以内出现极昼" },
  { n: "秋分", d: 266, desc: "太阳直射赤道，全球昼夜平分" },
  { n: "冬至", d: 356, desc: "太阳直射南回归线，北半球昼最短；北极圈以内出现极夜" }
];
var MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dayToMD(d) {
  var m = 0;
  while (m < 11 && d > MONTH_DAYS[m]) { d -= MONTH_DAYS[m]; m++; }
  return (m + 1) + "月" + d + "日";
}
/* 太阳赤纬：以四个真实节气日为锚点做分段正弦插值。
   不用单一正弦（地球轨道有偏心率，单一正弦下秋分点会偏 1.4°），
   教学上「春分秋分 δ=0、夏至冬至 δ=±23.44」必须精确。 */
function sunDecl(d) {
  var H = Math.PI / 2, T = 23.44;
  var dd = (d < 80) ? d + 365 : d;
  if (dd < 173) return T * Math.sin(H * (dd - 80) / 93);
  if (dd < 266) return T * Math.sin(H * (1 + (dd - 173) / 93));
  if (dd < 356) return -T * Math.sin(H * (dd - 266) / 90);
  return -T * Math.sin(H * (1 + (dd - 356) / 89));
}
/* 太阳直射点经度：UTC 12:00 时太阳直射 0° 经线 */
function sunSubLon(utc) {
  var l = (12 - utc) * 15;
  return ((l + 180) % 360 + 360) % 360 - 180;
}
/* 太阳高度角（度）：>0 为白天，<0 为夜晚，0 即在晨昏线上 */
function sunAlt(lat, lon, decl, slon) {
  var p = lat * RAD, dd = decl * RAD, Hh = (lon - slon) * RAD;
  var s = Math.sin(p) * Math.sin(dd) + Math.cos(p) * Math.cos(dd) * Math.cos(Hh);
  return Math.asin(s > 1 ? 1 : (s < -1 ? -1 : s)) * DEG;
}
/* 昼长（小时）：极昼 24、极夜 0 */
function dayLength(lat, decl) {
  var la = Math.max(-89.9, Math.min(89.9, lat)) * RAD, dd = decl * RAD;
  /* cos(日出时角) = −tanφ·tanδ：
     ≤ −1 说明时角 ≥180°，太阳整日不落（极昼 24h）；≥ 1 则整日不升（极夜 0h） */
  var c = -Math.tan(la) * Math.tan(dd);
  if (c <= -1) return 24;
  if (c >= 1) return 0;
  return (24 / Math.PI) * Math.acos(c);
}
function fmtHM(t) {
  var h = Math.floor(t), m = Math.round((t - h) * 60);
  if (m === 60) { h++; m = 0; }
  while (h >= 24) h -= 24;
  while (h < 0) h += 24;
  return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
}
/* 球面两点角距（度），用于练习模式的「点对不对」判定 */
function angDist(lat1, lon1, lat2, lon2) {
  var p1 = lat1 * RAD, p2 = lat2 * RAD, dl = (lon2 - lon1) * RAD;
  var c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(dl);
  return Math.acos(c > 1 ? 1 : (c < -1 ? -1 : c)) * DEG;
}

var CITIES = [
  { n: "伦敦", lat: 51.5,  lon: -0.13,  tz: 0 },
  { n: "开罗", lat: 30.0,  lon: 31.2,   tz: 2 },
  { n: "北京", lat: 39.9,  lon: 116.4,  tz: 8 },
  { n: "东京", lat: 35.7,  lon: 139.7,  tz: 9 },
  { n: "悉尼", lat: -33.9, lon: 151.2,  tz: 10 },
  { n: "纽约", lat: 40.7,  lon: -74.0,  tz: -5 }
];
function cityTime(tzOff, utc) {
  var t = utc + tzOff;
  var d = Math.floor(t / 24);
  var r = t - d * 24;
  return { txt: fmtHM(r), h: r, d: d };
}

/* ---- 题库：位置 / 区域 / 国家（均带答案锚点，便于答错时指位置） ---- */
var Q_POS = [
  { q: "40°N，116°E",   lat: 40,    lon: 116,  tip: "中国华北地区，北京就在这里" },
  { q: "0°，0°",        lat: 0,     lon: 0,    tip: "赤道与本初子午线的交点，位于几内亚湾" },
  { q: "23.5°N，100°E", lat: 23.5,  lon: 100,  tip: "北回归线穿过中国云南、广西、广东" },
  { q: "34°S，151°E",   lat: -34,   lon: 151,  tip: "澳大利亚东南沿海，悉尼附近" },
  { q: "40.7°N，74°W",  lat: 40.7,  lon: -74,  tip: "美国东北部，纽约附近" },
  { q: "30°N，31°E",    lat: 30,    lon: 31,   tip: "非洲北部，尼罗河三角洲，开罗附近" },
  { q: "0°，20°E",      lat: 0,     lon: 20,   tip: "非洲中部的刚果盆地" },
  { q: "60°N，100°E",   lat: 60,    lon: 100,  tip: "俄罗斯的西伯利亚中部" },
  { q: "15°S，60°W",    lat: -15,   lon: -60,  tip: "南美洲中西部，巴西与玻利维亚交界一带" },
  { q: "90°N",          lat: 89,    lon: 0,    tip: "北极点，位于北冰洋的浮冰之上" },
  { q: "66.5°N，0°",    lat: 66.5,  lon: 0,    tip: "北极圈上，这里是挪威海" },
  { q: "23.5°S，135°E", lat: -23.5, lon: 135,  tip: "南回归线穿过澳大利亚中部" },
  { q: "10°S，75°W",    lat: -10,   lon: -75,  tip: "南美洲西部，秘鲁境内" },
  { q: "45°N，10°E",    lat: 45,    lon: 10,   tip: "欧洲南部，意大利北部的波河平原" },
  { q: "20°N，78°E",    lat: 20,    lon: 78,   tip: "印度中部的德干高原" }
];
var Q_AREA = [
  { q: "印度洋", lat: -20, lon: 80,   tip: "世界第三大洋，大部分在南半球，北面被亚洲包围" },
  { q: "太平洋", lat: 0,   lon: -150, tip: "世界最大最深的大洋，位于亚洲、大洋洲与美洲之间" },
  { q: "大西洋", lat: 20,  lon: -30,  tip: "世界第二大洋，轮廓像字母 S" },
  { q: "北冰洋", lat: 85,  lon: 0,    tip: "世界最小最浅的大洋，位于北极附近，终年有海冰" },
  { q: "亚洲",   lat: 45,  lon: 90,   tip: "世界面积最大、跨纬度最广的大洲" },
  { q: "非洲",   lat: 5,   lon: 20,   tip: "赤道横贯中部，是热带面积最广的大洲" },
  { q: "欧洲",   lat: 50,  lon: 15,   tip: "平均海拔最低的大洲，海岸线十分曲折" },
  { q: "北美洲", lat: 45,  lon: -100, tip: "世界第三大洲，北临北冰洋" },
  { q: "南美洲", lat: -10, lon: -55,  tip: "有世界最大的热带雨林——亚马孙雨林" },
  { q: "大洋洲", lat: -25, lon: 134,  tip: "世界面积最小的大洲，主体是澳大利亚大陆" },
  { q: "南极洲", lat: -80, lon: 20,   tip: "世界最冷、平均海拔最高的大洲，被厚冰盖覆盖" },
  { q: "地中海", lat: 35,  lon: 18,   tip: "被欧洲、非洲、亚洲三洲包围的内海" },
  { q: "南海",   lat: 12,  lon: 114,  tip: "中国近海中面积最大的边缘海" },
  { q: "红海",   lat: 20,  lon: 38,   tip: "位于非洲与阿拉伯半岛之间，是世界最咸的海" },
  { q: "里海",   lat: 42,  lon: 50,   tip: "世界最大的湖泊，虽称海却是内陆湖" }
];
var Q_CTRY = [
  { q: "中国",     lat: 39.9, lon: 116.4, tip: "亚洲东部，太平洋西岸" },
  { q: "美国",     lat: 39,   lon: -98,   tip: "北美洲中部，北邻加拿大" },
  { q: "巴西",     lat: -10,  lon: -52,   tip: "南美洲面积最大的国家，亚马孙雨林在其北部" },
  { q: "澳大利亚", lat: -25,  lon: 134,   tip: "独占一块大陆的国家" },
  { q: "印度",     lat: 22,   lon: 79,    tip: "亚洲南部，南亚次大陆的主体" },
  { q: "俄罗斯",   lat: 60,   lon: 90,    tip: "世界面积最大的国家，跨欧亚两洲" },
  { q: "埃及",     lat: 27,   lon: 30,    tip: "非洲东北部，尼罗河下游" },
  { q: "南非",     lat: -29,  lon: 25,    tip: "非洲最南端" },
  { q: "日本",     lat: 36,   lon: 138,   tip: "亚洲东部，太平洋上的岛国" },
  { q: "英国",     lat: 53,   lon: -2,    tip: "欧洲西北部，大西洋上的岛国" },
  { q: "加拿大",   lat: 58,   lon: -100,  tip: "北美洲北部，世界面积第二大的国家" },
  { q: "阿根廷",   lat: -34,  lon: -64,   tip: "南美洲南部，东临大西洋" },
  { q: "墨西哥",   lat: 23,   lon: -102,  tip: "北美洲南部，北接美国" },
  { q: "法国",     lat: 47,   lon: 2,     tip: "欧洲西部，本土轮廓近似六边形" }
];
var Q_KINDS = [
  { k: "mix",  n: "混合" },
  { k: "pos",  n: "看坐标找位置" },
  { k: "area", n: "找大洲大洋" },
  { k: "ctry", n: "找国家" }
];

/* ------------------------------------------------------------------ *
 * 1. 数据解析：增量编码字符串 -> 球面向量表
 * ------------------------------------------------------------------ */
function parseEnc(str) {
  var parts = str.split("|");
  var LON = [], CL = [], SL = [], rings = [];
  for (var r = 0; r < parts.length; r++) {
    var tk = parts[r].split(" ");
    if (tk.length < 3) continue;
    var s = LON.length, lon = 0, lat = 0, first = true;
    for (var j = 0; j < tk.length; j++) {
      var c = tk[j].indexOf(",");
      var dx = +tk[j].slice(0, c), dy = +tk[j].slice(c + 1);
      if (first) { lon = dx / 10; lat = dy / 10; first = false; }
      else { lon += dx / 10; lat += dy / 10; }
      if (lat > 90) lat = 90; else if (lat < -90) lat = -90;
      var la = lat * RAD;
      LON.push(lon * RAD);
      CL.push(Math.cos(la));
      SL.push(Math.sin(la));
    }
    rings.push({ s: s, n: tk.length });
  }
  return {
    lon: Float64Array.from(LON),
    cl: Float64Array.from(CL),
    sl: Float64Array.from(SL),
    rings: rings
  };
}

var CONT = {}, COAST = null, COUNTRIES = [];
var N = 0, LON = null, CL = null, SL = null;
var PX = null, PY = null, PZ = null;

function buildData() {
  var lonA = [], clA = [], slA = [];
  var off = 0;

  function pushBlock(parsed) {
    var n = parsed.lon.length;
    for (var i = 0; i < n; i++) {
      lonA.push(parsed.lon[i]); clA.push(parsed.cl[i]); slA.push(parsed.sl[i]);
    }
    var rr = parsed.rings.map(function (rg) { return { s: rg.s + off, n: rg.n }; });
    off += n;
    return rr;
  }

  for (var i = 0; i < CONT_KEYS.length; i++) {
    var k = CONT_KEYS[i];
    CONT[k] = { key: k, zh: GEO_CONT_ZH[k], rings: pushBlock(parseEnc(GEO_CONTINENTS[k])) };
  }
  COAST = pushBlock(parseEnc(GEO_COASTLINE));
  buildLandMask();
  for (var c = 0; c < GEO_COUNTRIES.length; c++) {
    var row = GEO_COUNTRIES[c];
    COUNTRIES.push({
      id: c + 1,
      cont: row[0], zh: row[1], en: row[2],
      rings: pushBlock(parseEnc(row[3]))
    });
  }

  N = lonA.length;
  LON = Float64Array.from(lonA);
  CL = Float64Array.from(clA);
  SL = Float64Array.from(slA);
  PX = new Float64Array(N); PY = new Float64Array(N); PZ = new Float64Array(N);
}

/* ------------------------------------------------------------------ *
 * 2. 状态
 * ------------------------------------------------------------------ */
var state = {
  lon0: 0,            // 中心经度（弧度）
  pitch: 0,           // 俯仰角（弧度，+ 表示看北半球）
  tilt: 0,            // 轴倾角（绕视线轴 roll，弧度；23.5°=黄赤交角）
  zoom: 1,
  spinning: true,
  spinPeriod: 48,    // 自转一圈秒数（转速滑块控制）
  skin: "dark",
  layers: {},
  hover: null,        // {cid, ctid, lat, lon, name...}
  pinned: false,
  mode: "basic",      // basic | guide | daynight | timezone | quiz
  anim: null,         // null | "year"（推进日期） | "day"（推进世界时）
  sun: { day: 173, utc: 12 },   // 年内第几天 / 世界时（小时）
  quiz: { kind: "mix", cur: null, ok: 0, all: 0, fb: null, seen: [] },
  guide: { lesson: 0, step: 0, completed: [], done: false }
};
for (var li = 0; li < LAYERS.length; li++) state.layers[LAYERS[li].k] = LAYERS[li].on;

var SPIN_RATE = TAU / 48;   // 48 秒一圈
var view = { w: 0, h: 0, cx: 0, cy: 0, R: 0, dpr: 1 };
var dirty = true;

/* ------------------------------------------------------------------ *
 * 3. 投影 / 反投影
 * ------------------------------------------------------------------ */
function tanPitch() { return [Math.cos(state.pitch), Math.sin(state.pitch)]; }

function projectAll() {
  var lon0 = state.lon0, cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  var cr = Math.cos(state.tilt), sr = Math.sin(state.tilt);
  for (var i = 0; i < N; i++) {
    var u = LON[i] - lon0;
    var cl = CL[i], sl = SL[i];
    var X0 = cl * Math.sin(u), Y0 = sl, Z0 = cl * Math.cos(u);
    var Y1 = Y0 * cp - Z0 * sp;
    PX[i] = X0 * cr - Y1 * sr;
    PY[i] = X0 * sr + Y1 * cr;
    PZ[i] = Y0 * sp + Z0 * cp;
  }
}

/* 屏幕坐标 -> 球面经纬度（正交投影反解）。返回 null 表示点在球外 */
function unproject(sx, sy) {
  var X2 = (sx - view.cx) / view.R;
  var Y2 = -(sy - view.cy) / view.R;
  var d2 = X2 * X2 + Y2 * Y2;
  if (d2 > 1) return null;
  var Z2 = Math.sqrt(1 - d2);
  var cr = Math.cos(state.tilt), sr = Math.sin(state.tilt);
  var X1 = X2 * cr + Y2 * sr;
  var Y1 = -X2 * sr + Y2 * cr;
  var cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  var Y0 = Y1 * cp + Z2 * sp;
  var Z0 = -Y1 * sp + Z2 * cp;
  if (Y0 > 1) Y0 = 1; else if (Y0 < -1) Y0 = -1;
  var lat = Math.asin(Y0) * DEG;
  var u = Math.atan2(X1, Z0);
  var lon = (state.lon0 + u) * DEG;
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  return { lat: lat, lon: lon };
}

/* ------------------------------------------------------------------ *
 * 4. 球面多边形裁剪（z=side* 半边）+ 地平圆弧补齐
 * ------------------------------------------------------------------ */
var _BUFN = 8192;
var _bx = new Float64Array(_BUFN), _by = new Float64Array(_BUFN), _be = new Uint8Array(_BUFN);

function traceRings(rings, side, ctx, R, cx, cy) {
  var started = false;
  for (var k = 0; k < rings.length; k++) {
    var s = rings[k].s, n = rings[k].n;
    var m = 0, first = true, px0 = 0, py0 = 0;
    for (var i = 0; i < n; i++) {
      var j = (i + 1 === n) ? 0 : i + 1;
      var ia = s + i, ib = s + j;
      var za = side * PZ[ia], zb = side * PZ[ib];
      var ax = PX[ia], ay = PY[ia], bxx = PX[ib], byy = PY[ib];
      var inA = za >= 0, inB = zb >= 0;
      if (inA) {
        if (m < _BUFN) { _bx[m] = cx + R * ax; _by[m] = cy - R * ay; _be[m] = 0; m++; }
      }
      if (inA !== inB) {
        var t = za / (za - zb);
        var ix = ax + (bxx - ax) * t, iy = ay + (byy - ay) * t;
        var L = Math.sqrt(ix * ix + iy * iy) || 1;
        ix /= L; iy /= L;
        if (m < _BUFN) { _bx[m] = cx + R * ix; _by[m] = cy - R * iy; _be[m] = 1; m++; }
      }
    }
    if (m < 3) continue;

    /* 输出：边界点之间沿球体轮廓圆补弧，避免大洲被切成直角缺口 */
    for (var q = 0; q < m; q++) {
      var X = _bx[q], Y = _by[q];
      if (first) { ctx.moveTo(X, Y); first = false; }
      else ctx.lineTo(X, Y);
      var q2 = (q + 1) % m;
      if (_be[q] && _be[q2] && m > 3) {
        var a1 = Math.atan2(Y - cy, X - cx);
        var a2 = Math.atan2(_by[q2] - cy, _bx[q2] - cx);
        var d = a2 - a1;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        var steps = Math.floor(Math.abs(d) / (2 * RAD));
        if (steps > 0 && steps < 400) {
          var st = d / steps;
          for (var g = 1; g < steps; g++) {
            var aa = a1 + st * g;
            ctx.lineTo(cx + R * Math.cos(aa), cy + R * Math.sin(aa));
          }
        }
      }
    }
    started = true;
  }
  return started;
}

/* ------------------------------------------------------------------ *
 * 5. 经纬线绘制
 * ------------------------------------------------------------------ */
function drawLatLine(latDeg, side, ctx, R, cx, cy, cp, sp, lon0, color, width, dashed) {
  ctx.beginPath();
  var open = false;
  for (var lon = -180; lon <= 180; lon += 3) {
    var la = latDeg * RAD, lo = lon * RAD;
    var u = lo - lon0;
    var cl = Math.cos(la);
    var X0 = cl * Math.sin(u), Y0 = Math.sin(la), Z0 = cl * Math.cos(u);
    var Y1 = Y0 * cp - Z0 * sp, Z = Y0 * sp + Z0 * cp;
    var _cr = Math.cos(state.tilt), _sr = Math.sin(state.tilt);
    var X = X0 * _cr - Y1 * _sr, Y = X0 * _sr + Y1 * _cr;
    if (Z * side >= 0) {
      var sx = cx + R * X, sy = cy - R * Y;
      if (open) ctx.lineTo(sx, sy); else { ctx.moveTo(sx, sy); open = true; }
    } else open = false;
  }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dashed ? [4, 5] : []);
  ctx.stroke(); ctx.setLineDash([]);
}

function drawLonLine(lonDeg, side, ctx, R, cx, cy, cp, sp, lon0, color, width, dashed) {
  ctx.beginPath();
  var open = false;
  for (var lat = -90; lat <= 90; lat += 3) {
    var la = lat * RAD, lo = lonDeg * RAD;
    var u = lo - lon0;
    var cl = Math.cos(la);
    var X0 = cl * Math.sin(u), Y0 = Math.sin(la), Z0 = cl * Math.cos(u);
    var Y1 = Y0 * cp - Z0 * sp, Z = Y0 * sp + Z0 * cp;
    var _cr = Math.cos(state.tilt), _sr = Math.sin(state.tilt);
    var X = X0 * _cr - Y1 * _sr, Y = X0 * _sr + Y1 * _cr;
    if (Z * side >= 0) {
      var sx = cx + R * X, sy = cy - R * Y;
      if (open) ctx.lineTo(sx, sy); else { ctx.moveTo(sx, sy); open = true; }
    } else open = false;
  }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dashed ? [4, 5] : []);
  ctx.stroke(); ctx.setLineDash([]);
}

/* ------------------------------------------------------------------ *
 * 6. 绘制主流程
 * ------------------------------------------------------------------ */
var cv = document.getElementById("globe");
var ctx = cv.getContext("2d");
var bgCv = document.createElement("canvas"), bgCtx = bgCv.getContext("2d");
var pickCv = document.createElement("canvas"), pickCtx = pickCv.getContext("2d", { willReadFrequently: true });
var stars = null;

function makeStars() {
  stars = [];
  for (var i = 0; i < 190; i++) {
    stars.push([Math.random(), Math.random(), Math.random() * 1.3 + 0.35, Math.random() * 0.55 + 0.2]);
  }
}

var gradCache = { key: "", ocean: null, halo: null };
function gradFor(cx, cy, R, P) {
  var key = cx + "|" + cy + "|" + R + "|" + state.skin;
  if (gradCache.key === key) return gradCache;
  var og = ctx.createRadialGradient(cx - R * 0.34, cy - R * 0.36, R * 0.06, cx, cy, R * 1.02);
  og.addColorStop(0, P.oceanA);
  og.addColorStop(1, P.oceanB);
  var hg = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.16);
  hg.addColorStop(0, "rgba(" + P.halo + ",.32)");
  hg.addColorStop(1, "rgba(" + P.halo + ",0)");
  gradCache = { key: key, ocean: og, halo: hg };
  return gradCache;
}

function buildBg() {
  var w = view.w, h = view.h, P = PAL[state.skin];
  bgCv.width = Math.max(1, Math.round(w * view.dpr));
  bgCv.height = Math.max(1, Math.round(h * view.dpr));
  bgCtx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  var g = bgCtx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
  g.addColorStop(0, P.bg2);
  g.addColorStop(1, P.bg3);
  bgCtx.fillStyle = g;
  bgCtx.fillRect(0, 0, w, h);
  if (P.star && stars) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      bgCtx.beginPath();
      bgCtx.arc(s[0] * w, s[1] * h, s[2], 0, TAU);
      bgCtx.fillStyle = "rgba(255,255,255," + s[3] + ")";
      bgCtx.fill();
    }
  }
}

/* ================================================================== *
 * 10½. 地形高程图层（分层设色 hypsometric + 著名山峰/海沟标注）
 *      数据：terrarium z=3 网格 → 360×180 等经纬，1 字节非线性量化，内联 base64
 *      精确海拔数字来自 GEO_PEAKS 真实数据表，地形色仅作“高低起伏”示意
 * ================================================================== */
var ELEV = null, ELEV_W = 0, ELEV_H = 0, ELEV_Q = null, HYPSO = null;

  /* 采样对齐校准(像元): 高程值位于像元中心(-0.5) + terrarium源2048px半像素(0.088°=0.088*W/360)。
     1°网格(360x180)时=0.588; 0.25°网格(1440x720)时=0.852。
     缺此校正地形与矢量海岸线/国界系统性错位(赤道约4px)。 */
  var ELEV_OX = 0.852;
// 地形山体阴影(hillshade)：光来自西北方、仰角约45°；EXAG 为垂直夸张，仅调制明暗、不改高程
var TERRAIN_EXAG = 28, TERRAIN_SHADE_GAIN = 2.6;   // EXAG 控制坡面强度，GAIN 控制明暗对比
var TERRAIN_DLAT = 1.0, TERRAIN_DLON = 1.0;
var TERRAIN_LX = -0.5, TERRAIN_LY = 0.5, TERRAIN_LZ = 0.707; // 光照方向(东,北,上)，已单位化

function initElev() {
  if (!window.GEO_ELEV || !window.GEO_PEAKS) return;
  var ev = window.GEO_ELEV;
  ELEV_W = ev.w; ELEV_H = ev.h; ELEV_Q = ev.q;
  ELEV = ev.bytes;
  HYPSO = new Uint8Array(256 * 3);
  for (var q = 0; q < 256; q++) {
    var c = hypsoColor(qToM(q));
    HYPSO[q * 3] = c[0]; HYPSO[q * 3 + 1] = c[1]; HYPSO[q * 3 + 2] = c[2];
  }
}

/* 字节(量化值) → 米：断点线性插值 */
function qToM(q) {
  var Q = ELEV_Q; if (!Q) return 0;
  if (q <= Q[0][1]) return Q[0][0];
  for (var i = 0; i < Q.length - 1; i++) {
    if (q >= Q[i][1] && q < Q[i + 1][1]) {
      var t = (q - Q[i][1]) / (Q[i + 1][1] - Q[i][1]);
      return Q[i][0] + t * (Q[i + 1][0] - Q[i][0]);
    }
  }
  return Q[Q.length - 1][0];
}

/* 海拔(米) → RGB（分层设色：深海蓝→浅海青→海岸绿→黄→橙棕→高山裸岩→雪白） */
/* --- 矢量海岸线陆地掩膜: 用屏幕上同一条海岸线数据栅格化陆地/海洋,
   地形色块边界直接贴齐矢量线, 消除 DEM 海岸混合像元导致的“地形渗入海洋”。
   2880x1440 (0.125°), 偶奇填充(XOR), 跨日界线环用经度展开处理。 */
var LMW = 2880, LMH = 1440, LMASK = null;
function buildLandMask() {
  var parts = (window.GEO_COASTLINE || "").split("|");
  if (parts.length < 3 || LMASK) return;
  var m = new Uint8Array(LMW * LMH);
  for (var pi = 0; pi < parts.length; pi++) {
    var tk = parts[pi].split(" ");
    if (tk.length < 3) continue;
    var lon = 0, lat = 0, first = true, xs = [], ys = [];
    for (var j = 0; j < tk.length; j++) {
      var cc = tk[j].indexOf(",");
      var dxx = +tk[j].slice(0, cc), dyy = +tk[j].slice(cc + 1);
      if (first) { lon = dxx / 10; lat = dyy / 10; first = false; }
      else { lon += dxx / 10; lat += dyy / 10; }
      if (lat > 90) lat = 90; else if (lat < -90) lat = -90;
      xs.push(lon); ys.push(lat);   // 经度保持连续(可超±180, 环闭合处再对齐)
    }
    var n = xs.length, gx = new Array(n), gy = new Array(n);
    gx[0] = (xs[0] + 180) / 360 * LMW; gy[0] = (90 - ys[0]) / 180 * LMH;
    for (var i2 = 1; i2 < n; i2++) {
      var dl = xs[i2] - xs[i2 - 1];
      if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
      gx[i2] = gx[i2 - 1] + dl / 360 * LMW;
      gy[i2] = (90 - ys[i2]) / 180 * LMH;
    }
    var gLo = 1e9, gHi = -1e9;
    for (var i3 = 0; i3 < n; i3++) { if (gy[i3] < gLo) gLo = gy[i3]; if (gy[i3] > gHi) gHi = gy[i3]; }
    var rLo = Math.max(0, Math.ceil(gLo - 0.5)), rHi = Math.min(LMH - 1, Math.floor(gHi - 0.5));
    var rows = {};
    for (var i4 = 0; i4 < n; i4++) {
      var j4 = (i4 + 1) % n;
      if (gy[i4] === gy[j4]) continue;
      var x2 = gx[j4];
      if (j4 === 0) {   // 闭合边: 终点取与起点最近的展开副本
        var k2 = Math.round((gx[n - 1] - gx[0]) / LMW);
        x2 = gx[0] + k2 * LMW;
      }
      var gA = Math.min(gy[i4], gy[j4]), gB = Math.max(gy[i4], gy[j4]);
      var r0 = Math.max(rLo, Math.ceil(gA - 0.5)), r1 = Math.min(rHi, Math.floor(gB - 0.5));
      for (var r = r0; r <= r1; r++) {
        var yc = r + 0.5;
        var tt = (yc - gy[i4]) / (gy[j4] - gy[i4]);
        var xi = gx[i4] + (x2 - gx[i4]) * tt;
        (rows[r] || (rows[r] = [])).push(xi);
      }
    }
    for (var rk in rows) {
      var arr = rows[rk].sort(function (a, b) { return a - b; });
      var rowBase = (+rk) * LMW;
      for (var k3 = 0; k3 + 1 < arr.length; k3 += 2) {
        var xa = Math.ceil(arr[k3] - 0.5), xb = Math.floor(arr[k3 + 1] - 0.5 - 1e-9);
        for (var x = xa; x <= xb; x++) {
          var xm = x % LMW; if (xm < 0) xm += LMW;
          m[rowBase + xm] ^= 1;
        }
      }
    }
  }
  LMASK = m;
}
function sampleMask(lat, lon) {
  if (!LMASK) return -1;
  var fx = (lon + 180) / 360 * LMW - 0.5, fy = (90 - lat) / 180 * LMH - 0.5;
  if (fx < 0) fx = 0; else if (fx > LMW - 1) fx = LMW - 1;
  if (fy < 0) fy = 0; else if (fy > LMH - 1) fy = LMH - 1;
  var x0 = Math.floor(fx), y0 = Math.floor(fy);
  var x1 = x0 + 1; if (x1 >= LMW) x1 = 0;            // 经度环绕
  var y1 = y0 + 1; if (y1 >= LMH) y1 = LMH - 1;      // 纬度不环绕
  var dx = fx - x0, dy = fy - y0;
  var a = LMASK[y0 * LMW + x0] * (1 - dx) + LMASK[y0 * LMW + x1] * dx;
  var b = LMASK[y1 * LMW + x0] * (1 - dx) + LMASK[y1 * LMW + x1] * dx;
  return a * (1 - dy) + b * dy;
}
function hypsoColor2(m) {   // 纯海色梯度(无近岸绿过渡), 供地形海侧使用
  if (m > 0) m = 0;
  var t = -m / 6000; if (t > 1) t = 1; if (t < 0) t = 0;
  return [Math.round(22 + 88 * t), Math.round(53 + 122 * t), Math.round(98 + 107 * t)];
}
function hypsoColor(m) {
  if (m < 0) {
    var t = -m / 6000; if (t > 1) t = 1; if (t < 0) t = 0;
    var d = [22, 53, 98], s = [110, 175, 205];
    var r = Math.round(d[0] + (s[0] - d[0]) * t),
        g = Math.round(d[1] + (s[1] - d[1]) * t),
        b = Math.round(d[2] + (s[2] - d[2]) * t);
    if (m > -60) {            // 近岸：向海岸绿过渡
      var k = (m + 60) / 60, gl = [156, 207, 122];
      r = Math.round(r + (gl[0] - r) * k); g = Math.round(g + (gl[1] - g) * k); b = Math.round(b + (gl[2] - b) * k);
    }
    return [r, g, b];
  }
  var stops = [
    [0,    [156, 207, 122]], [200,  [210, 226, 164]], [1000, [221, 196, 99]],
    [2000, [216, 169, 78]],  [3000, [203, 141, 82]],  [4500, [219, 183, 142]],
    [6000, [236, 224, 203]], [8000, [244, 246, 248]]
  ];
  var mm = m; if (mm > 8000) mm = 8000;
  for (var i = 0; i < stops.length - 1; i++) {
    if (mm >= stops[i][0] && mm <= stops[i + 1][0]) {
      var t = (mm - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      var a = stops[i][1], c2 = stops[i + 1][1];
      return [Math.round(a[0] + (c2[0] - a[0]) * t), Math.round(a[1] + (c2[1] - a[1]) * t), Math.round(a[2] + (c2[2] - a[2]) * t)];
    }
  }
  return [244, 246, 248];
}

/* 双线性采样高程字节网格 */
function sampleElev(lat, lon) {
  if (!ELEV) return null;
  var fx = (lon + 180) / 360 * ELEV_W - ELEV_OX, fy = (90 - lat) / 180 * ELEV_H - ELEV_OX;
  if (fx < 0) fx = 0; else if (fx > ELEV_W - 1) fx = ELEV_W - 1;   // 防止负向插值外推
  if (fy < 0) fy = 0; else if (fy > ELEV_H - 1) fy = ELEV_H - 1;
  var x0 = Math.floor(fx);
  if (x0 < 0) x0 = 0; else if (x0 >= ELEV_W) x0 = ELEV_W - 1;
  var x1 = x0 + 1; if (x1 >= ELEV_W) x1 = 0;          // 经度环绕
  var y0 = Math.floor(fy);
  if (y0 < 0) y0 = 0; else if (y0 >= ELEV_H) y0 = ELEV_H - 1;
  var y1 = y0 + 1; if (y1 >= ELEV_H) y1 = ELEV_H - 1;   // 纬度不环绕
  var dx = fx - x0, dy = fy - y0;
  var i00 = ELEV[y0 * ELEV_W + x0], i10 = ELEV[y0 * ELEV_W + x1],
      i01 = ELEV[y1 * ELEV_W + x0], i11 = ELEV[y1 * ELEV_W + x1];
  var a = i00 * (1 - dx) + i10 * dx, b = i01 * (1 - dx) + i11 * dx;
  return a * (1 - dy) + b * dy;
}

/* 最近著名地点（经纬曼哈顿距，命中用于信息卡精读） */
function nearestPeak(lat, lon, deg) {
  if (!window.GEO_PEAKS) return null;
  var best = null, bd = deg;
  for (var i = 0; i < window.GEO_PEAKS.length; i++) {
    var pk = window.GEO_PEAKS[i];
    var d = Math.abs(pk[1] - lat) + Math.abs(pk[2] - lon);
    if (d < bd) { bd = d; best = pk; }
  }
  return best;
}

/* 逐像素把地形渲染到离屏画布，再贴到球面（正面半球）。
   TRES 随球体半径缩放；视空间单位向量预计算，逐帧只做旋转+采样，性能可控。 */
var _tcv = null, _tctx = null, _timg = null, _tvx = null, _tvy = null, _tvz = null, _tres = 0;
function drawTerrain(ctx, R, cx, cy, cp, sp, lon0) {
  if (!ELEV) return;
  var TRES = Math.max(120, Math.min(560, Math.round(R * 0.85)));
  if (!_tcv || _tres !== TRES) {
    _tcv = document.createElement("canvas"); _tcv.width = TRES; _tcv.height = TRES;
    _tctx = _tcv.getContext("2d");
    _timg = _tctx.createImageData(TRES, TRES);
    _tvx = new Float32Array(TRES * TRES); _tvy = new Float32Array(TRES * TRES); _tvz = new Float32Array(TRES * TRES);
    var cen = TRES / 2, rad = TRES / 2;
    for (var oy = 0; oy < TRES; oy++) for (var ox = 0; ox < TRES; ox++) {
      var idx = oy * TRES + ox;
      var X = (ox + 0.5 - cen) / rad, Y = -(oy + 0.5 - cen) / rad;
      /* +0.5: drawImage 放大到 2R 时像素中心对齐——
         离屏像素 ox 的屏幕中心在 (ox+0.5-cen)/rad，不补会整体右下偏 ~1.2 屏幕px */
      var d2 = X * X + Y * Y;
      if (d2 > 1) { _tvz[idx] = -1; continue; }
      _tvx[idx] = X; _tvy[idx] = Y; _tvz[idx] = Math.sqrt(1 - d2);
    }
    _tres = TRES;
  }
  var data = _timg.data;
  var _cr = Math.cos(state.tilt), _sr = Math.sin(state.tilt);   // 地轴倾斜(roll), 与 projectAll/unproject 同公式
  for (var oy2 = 0; oy2 < TRES; oy2++) {
    for (var ox2 = 0; ox2 < TRES; ox2++) {
      var idx2 = oy2 * TRES + ox2, Z = _tvz[idx2], p = idx2 * 4;
      if (Z < 0) { data[p + 3] = 0; continue; }
      var X2 = _tvx[idx2], Y2 = _tvy[idx2];
      /* 逆 roll(tilt) 旋转: X2/Y2 是屏幕视空间向量, 须先逆 tilt 还原到未倾斜坐标系,
         再逆 pitch。此前漏了这一步 -> 倾斜开启时地形经纬度整体错位, 陆地色块相对海岸线矢量歪掉。 */
      var X1 = X2 * _cr + Y2 * _sr, Y1 = -X2 * _sr + Y2 * _cr;
      var Y0 = Y1 * cp + Z * sp, Z0 = -Y1 * sp + Z * cp;
      if (Y0 > 1) Y0 = 1; else if (Y0 < -1) Y0 = -1;
      var lat = Math.asin(Y0) * DEG, u = Math.atan2(X1, Z0), lon = (lon0 + u) * DEG;
      if (lon > 180) lon -= 360; else if (lon < -180) lon += 360;
      var q = sampleElev(lat, lon); var qi = q | 0; if (qi < 0) qi = 0; else if (qi > 255) qi = 255;
      var _m = qToM(qi);
      /* 海陆判定: 5 点超采样(中心+四角, 各偏半像元); 任一子样为陆即判陆 -> 陆地色填满至海岸线,
         再由下方海岸线矢量裁剪精确收边, 使色块边界与黑线重合(不受低分辨率纹理量化偏移)。 */
      var _lm;
      if (!LMASK) {
        _lm = -1;
      } else {
        var _clm = Math.cos(lat * RAD); if (_clm < 0.2) _clm = 0.2;
        var _dLa = 90 / TRES, _dLo = _dLa / _clm;
        /* 低阈值陆地判定: 任一子样掩膜>0.1 即判陆 -> 陆地色紧贴 0.5 等值线(≈海岸线矢量)填满,
           再由下方 COAST 矢量裁剪精确收边, 把"绿块不贴线/海岸蓝边"压到约 0.3px 以内。
           掩膜与海岸矢量同源于 GEO_COASTLINE, 故为构造性对齐而非调参近似。 */
        var _lc = 0;
        if (sampleMask(lat, lon) > 0.1) _lc++;
        if (sampleMask(lat - _dLa, lon - _dLo) > 0.1) _lc++;
        if (sampleMask(lat - _dLa, lon + _dLo) > 0.1) _lc++;
        if (sampleMask(lat + _dLa, lon - _dLo) > 0.1) _lc++;
        if (sampleMask(lat + _dLa, lon + _dLo) > 0.1) _lc++;
        _lm = _lc > 0 ? 1 : 0;
      }
      var _r, _g, _b;
      if (_lm < 0) { var _c0 = hypsoColor(_m); _r = _c0[0]; _g = _c0[1]; _b = _c0[2]; }
      else if (_lm > 0.98) {   // 矢量陆地: DEM 负值(沿海洼地/盆地/死海)一律钳0, 陆地内不露蓝点
        var _ml = _m < 0 ? 0 : _m;
        var _c1 = hypsoColor(_ml); _r = _c1[0]; _g = _c1[1]; _b = _c1[2];
      }
      else if (_lm < 0.02) {   // 矢量海洋: 非负钳-1; 不做近岸绿过渡(防绿渗过线)
        var _c2 = hypsoColor2(_m < 0 ? _m : -1); _r = _c2[0]; _g = _c2[1]; _b = _c2[2];
      }
      else {                   // 海岸带: 两侧混色, 边界贴齐矢量线
        var _ml2 = _m > -150 ? (_m < 0 ? 0 : _m) : _m;
        var _ca = hypsoColor(_ml2), _cb = hypsoColor2(_m < 0 ? _m : -1);
        _r = Math.round(_ca[0] + (_cb[0] - _ca[0]) * _lm);
        _g = Math.round(_ca[1] + (_cb[1] - _ca[1]) * _lm);
        _b = Math.round(_ca[2] + (_cb[2] - _ca[2]) * _lm);
      }
      var _sh = 1.0;
      if (_lm >= 0.5 && _m >= 0) {
        var _eE = qToM(sampleElev(lat, TERRAIN_DLON + lon) | 0);
        var _eN = qToM(sampleElev(TERRAIN_DLAT + lat, lon) | 0);
        var _cl = Math.cos(lat * RAD); if (_cl < 0.05) _cl = 0.05;
        var _dE = 111.32 * TERRAIN_DLON * _cl, _dN = 110.57 * TERRAIN_DLAT;
        var _sx = (_eE - _m) / (_dE * 1000), _sy = (_eN - _m) / (_dN * 1000);
        if (_sx > 0.5) _sx = 0.5; else if (_sx < -0.5) _sx = -0.5;
        if (_sy > 0.5) _sy = 0.5; else if (_sy < -0.5) _sy = -0.5;
        var _nx = -TERRAIN_EXAG * _sx, _ny = -TERRAIN_EXAG * _sy, _nz = 1;
        var _nl = Math.sqrt(_nx * _nx + _ny * _ny + _nz * _nz);
        var _dot = (_nx * TERRAIN_LX + _ny * TERRAIN_LY + _nz * TERRAIN_LZ) / _nl;
        _sh = 1 + TERRAIN_SHADE_GAIN * (_dot - TERRAIN_LZ);
        if (_sh < 0.5) _sh = 0.5; else if (_sh > 1.5) _sh = 1.5;
      }
      data[p] = _r * _sh; data[p + 1] = _g * _sh; data[p + 2] = _b * _sh; data[p + 3] = 255;
    }
  }
  _tctx.putImageData(_timg, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  /* 地形按 LMASK 海陆(≈海岸线矢量, 0.125°)直接绘制, 仅受球体裁剪。
     不再裁到 COAST 矢量路径: 实测 traceRings(COAST)+evenodd 对跨临边/跨半球大陆会漏裁约 8.6% 陆地像元,
     露出蓝色海洋球形成"色块内蓝斑/不贴线"。现由 LMASK 自身定义海陆边界(±0.125°≈0.77px),
     海岸线黑线仍精确描在矢量上, 边界肉眼不可辨。 */
  ctx.drawImage(_tcv, cx - R, cy - R, 2 * R, 2 * R);
  ctx.restore();
}

/* 著名山峰/海沟/地形区标记（仅在地形图层开启时绘制，投影到正面半球） */
function drawPeaks(ctx, R, cx, cy, cp, sp, lon0) {
  if (!window.GEO_PEAKS) return;
  for (var i = 0; i < window.GEO_PEAKS.length; i++) {
    var pk = window.GEO_PEAKS[i];
    var pr = projLL(pk[1], pk[2], cp, sp, lon0, cx, cy, R);
    if (!pr || pr[2] <= 0) continue;
    var x = pr[0], y = pr[1], tp = pk[4], sz = Math.max(4, R * 0.02);
    var col = tp === "peak" ? "#ff6b4a" : (tp === "low" ? "#3ea0d8" : "#ffd24a");
    ctx.beginPath();
    if (tp === "region") ctx.arc(x, y, sz * 0.55, 0, TAU);
    else { ctx.moveTo(x, y - sz); ctx.lineTo(x - sz, y + sz); ctx.lineTo(x + sz, y + sz); ctx.closePath(); }
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,0,0,.55)"; ctx.stroke();
  }
}

function render() {
  var w = view.w, h = view.h, cx = view.cx, cy = view.cy;
  var R = view.R, P = PAL[state.skin];
  var cp = Math.cos(state.pitch), sp = Math.sin(state.pitch), lon0 = state.lon0;
  state.tilt = state.layers.tilt ? -23.5 * RAD : 0;  // 一键斜轴（黄赤交角，负号=北极倾向右上，与教材图1.8/1.9一致）
  var showBack = state.layers.back && !state.layers.opaque;  // 不透明开关优先：开启时不画背面

  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  ctx.drawImage(bgCv, 0, 0, bgCv.width, bgCv.height, 0, 0, w, h);

  projectAll();

  /* --- 大气外层光晕 --- */
  var grads = gradFor(cx, cy, R, P);
  ctx.fillStyle = grads.halo;
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.16, 0, TAU); ctx.fill();

  /* --- 海洋球体 --- */
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
  ctx.fillStyle = grads.ocean; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();   // 球体裁剪，杜绝越界

  /* --- 背面陆地（隐约可见，增强“球”的体积感；可由“透明地球”开关关闭） --- */
  if (showBack) {
    ctx.fillStyle = P.landBack;
    for (var i = 0; i < CONT_KEYS.length; i++) {
      ctx.beginPath();
      traceRings(CONT[CONT_KEYS[i]].rings, -1, ctx, R, cx, cy);
      ctx.fill();
    }
  }

  /* --- 背面经纬网（虚线；可由“透明地球”开关关闭） --- */
  if (showBack && state.layers.grid) {
    for (var la = -75; la <= 75; la += 15) {
      if (la === 0) continue;
      drawLatLine(la, -1, ctx, R, cx, cy, cp, sp, lon0, P.gridBack, 0.8, true);
    }
    for (var lo = -180; lo < 180; lo += 15) {
      drawLonLine(lo, -1, ctx, R, cx, cy, cp, sp, lon0, P.gridBack, 0.8, true);
    }
  }

  /* --- 正面陆地填充(裁剪到海岸线矢量, 使陆色与黑线齐边, 不露出 CONT 较粗轮廓产生的色块外溢) --- */
  if (COAST && COAST.length) { ctx.save(); ctx.beginPath(); traceRings(COAST, 1, ctx, R, cx, cy); ctx.clip('evenodd'); }
  for (var c = 0; c < CONT_KEYS.length; c++) {
    var k = CONT_KEYS[c];
    ctx.beginPath();
    if (!traceRings(CONT[k].rings, 1, ctx, R, cx, cy)) continue;
    ctx.fillStyle = P.land[k];
    ctx.strokeStyle = P.land[k];
    ctx.lineWidth = 1;              // 同色描边：填掉相邻国之间的抗锯齿缝隙
    ctx.lineJoin = "round";
    ctx.fill(); ctx.stroke();
  }
  if (COAST && COAST.length) { ctx.restore(); }

  /* --- 地形高程（分层设色）：正面半球逐像素覆盖，置于海岸线之前 --- */
  if (state.layers.terrain) {
    drawTerrain(ctx, R, cx, cy, cp, sp, lon0);
  }

  /* --- 悬停高亮：叠加亮色 --- */
  if (state.hover && state.hover.ctid > 0) {
    var hc = COUNTRIES[state.hover.ctid - 1];
    if (hc) {
      ctx.beginPath();
      if (traceRings(hc.rings, 1, ctx, R, cx, cy)) {
        ctx.fillStyle = "rgba(255,255,255,.30)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.72)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }
  }

  /* --- 海岸线 --- */
  ctx.beginPath();
  if (traceRings(COAST, 1, ctx, R, cx, cy)) {
    ctx.strokeStyle = P.coast; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
    ctx.stroke();
  }
  if (showBack) {
    ctx.beginPath();
    if (traceRings(COAST, -1, ctx, R, cx, cy)) {
      ctx.strokeStyle = P.coastBack; ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /* --- 国界 --- */
  if (state.layers.border) {
    ctx.beginPath();
    for (var q = 0; q < COUNTRIES.length; q++) traceRings(COUNTRIES[q].rings, 1, ctx, R, cx, cy);
    ctx.strokeStyle = P.border; ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* --- 经纬网 --- */
  if (state.layers.grid) {
    for (var la2 = -75; la2 <= 75; la2 += 15) {
      if (la2 === 0) continue;
      drawLatLine(la2, 1, ctx, R, cx, cy, cp, sp, lon0, P.grid, 0.7, false);
    }
    for (var lo2 = -180; lo2 < 180; lo2 += 15) {
      drawLonLine(lo2, 1, ctx, R, cx, cy, cp, sp, lon0, P.grid, 0.7, false);
    }
  }

  /* --- 特殊经纬线 --- */
  function special(latDeg, lonDeg, color, width, isLat, dashed) {
    ctx.save();
    ctx.shadowColor = color; ctx.shadowBlur = 7;
    if (isLat) drawLatLine(latDeg, 1, ctx, R, cx, cy, cp, sp, lon0, color, width, !!dashed);
    else drawLonLine(lonDeg, 1, ctx, R, cx, cy, cp, sp, lon0, color, width, !!dashed);
    ctx.restore();
  }
  /* 背面特殊线用低透明度虚线呼应 */
  function specialBack(latDeg, lonDeg, color, isLat) {
    if (!showBack) return;
    ctx.globalAlpha = 0.34;
    if (isLat) drawLatLine(latDeg, -1, ctx, R, cx, cy, cp, sp, lon0, color, 1.1, true);
    else drawLonLine(lonDeg, -1, ctx, R, cx, cy, cp, sp, lon0, color, 1.1, true);
    ctx.globalAlpha = 1;
  }
  var L = state.layers;
  if (L.equator) { special(0, 0, "#ff4d5e", 2.6, true); specialBack(0, 0, "#ff4d5e", true); }
  if (L.tropic) {
    special(23.5, 0, "#ffc93c", 1.9, true, true); special(-23.5, 0, "#ffc93c", 1.9, true, true);
    specialBack(23.5, 0, "#ffc93c", true); specialBack(-23.5, 0, "#ffc93c", true);
  }
  if (L.polar) {
    special(66.5, 0, "#3ddc84", 1.9, true, true); special(-66.5, 0, "#3ddc84", 1.9, true, true);
    specialBack(66.5, 0, "#3ddc84", true); specialBack(-66.5, 0, "#3ddc84", true);
  }
  if (L.prime) { special(0, 0, "#b06cff", 1.9, false); specialBack(0, 0, "#b06cff", false); }
  if (L.anti) { special(0, 180, "#b06cff", 1.7, false); specialBack(0, 180, "#b06cff", false); }
  if (L.hemi) {
    special(0, -20, "#ff8a3d", 1.7, false); special(0, 160, "#ff8a3d", 1.7, false);
    specialBack(0, -20, "#ff8a3d", false); specialBack(0, 160, "#ff8a3d", false);
  }

  /* --- 地轴 --- */
  if (L.axis) {
    var _cr = Math.cos(state.tilt), _sr = Math.sin(state.tilt), _cp = Math.cos(state.pitch);
    var _dx = R * 1.22 * _cp * _sr, _dy = R * 1.22 * _cp * _cr;
    ctx.beginPath();
    ctx.moveTo(cx - _dx, cy - _dy); ctx.lineTo(cx + _dx, cy + _dy);
    ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1.4;
    ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
  }

  /* --- 昼夜晨昏线 / 太阳直射点 / 时区盘 / 练习标记（随模式启用） --- */
  var md = state.mode;
  if (md === "daynight" || md === "timezone") {
    var decl = sunDecl(state.sun.day), slon = sunSubLon(state.sun.utc);
    var Sc = sunCam(decl, slon, lon0, cp, sp);
    drawNight(ctx, Sc, cx, cy, R);
    var tm = terminator(Sc);
    if (tm.seg.length > 1) {
      ctx.save();
      if (buildNightPath(ctx, Sc, cx, cy, R)) ctx.clip();   // 晨昏线辉光只落在夜半球，不再溢出到昼半球
      ctx.save();
      ctx.globalAlpha = 0.28; ctx.shadowColor = "#ff9d3c"; ctx.shadowBlur = 14;
      strokeTerm(ctx, tm, cx, cy, R, "rgba(255,170,70,1)", Math.max(5, R * 0.022));
      ctx.restore();
      strokeTerm(ctx, tm, cx, cy, R, "#ffb454", 2.2);
      ctx.restore();
    }
    if (md === "timezone") drawTimeZones(ctx, R, cx, cy, cp, sp, lon0, decl, slon);
    drawSunMark(ctx, R, cx, cy, cp, sp, lon0, decl, slon);
  }
  if (md === "quiz") drawQuizMark(ctx, R, cx, cy, cp, sp, lon0);

  /* --- 标注 --- */
  if (L.label) drawLabels(ctx, R, cx, cy, cp, sp, lon0);

  /* --- 球体边缘描线 --- */
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
  ctx.strokeStyle = "rgba(120,190,255,.55)"; ctx.lineWidth = 1.4; ctx.stroke();

  ctx.restore();

  /* --- 地形标注：著名山峰 / 海沟 / 地形区（地形图层开启时） --- */
  if (state.layers.terrain) drawPeaks(ctx, R, cx, cy, cp, sp, lon0);

  /* --- 拾取标记（锁定点的位置环） --- */
  if (state.hover && state.pinned) {
    var hp = projLL(state.hover.lat, state.hover.lon, cp, sp, lon0, cx, cy, R);
    if (hp && hp[2] > 0) {
      ctx.beginPath();
      ctx.arc(hp[0], hp[1], Math.max(6, R * 0.026), 0, TAU);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath();
      ctx.arc(hp[0], hp[1], Math.max(6, R * 0.026) + 3.5, 0, TAU);
      ctx.strokeStyle = "rgba(0,0,0,.45)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hp[0], hp[1] - Math.max(6, R * 0.026) - 4);
      ctx.lineTo(hp[0], hp[1] - Math.max(6, R * 0.026) - 12);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
}

function projLL(latD, lonD, cp, sp, lon0, cx, cy, R) {
  var la = latD * RAD, u = lonD * RAD - lon0;
  var cl = Math.cos(la);
  var X0 = cl * Math.sin(u), Y0 = Math.sin(la), Z0 = cl * Math.cos(u);
  var Y1 = Y0 * cp - Z0 * sp, Z = Y0 * sp + Z0 * cp;
  var cr = Math.cos(state.tilt), sr = Math.sin(state.tilt);
  var X = X0 * cr - Y1 * sr, Y = X0 * sr + Y1 * cr;
  if (Z < 0) return null;            // 仅背面剔除；极点/边缘点(z≈0)仍应可投影
  return [cx + R * X, cy - R * Y, Z];
}

function drawLabels(ctx, R, cx, cy, cp, sp, lon0) {
  var boxes = [];
  var fs1 = Math.max(11, Math.round(R * 0.052));
  var fs2 = Math.max(10, Math.round(R * 0.042));
  var items = [];

  for (var i = 0; i < LAB_OCEAN.length; i++) {
    var o = LAB_OCEAN[i];
    var p = projLL(o.lat, o.lon, cp, sp, lon0, cx, cy, R);
    if (p) items.push({ t: o.t, x: p[0], y: p[1], z: p[2], s: o.s, oc: true });
  }
  for (var j = 0; j < LAB_CONT.length; j++) {
    var c = LAB_CONT[j];
    var p2 = projLL(c.lat, c.lon, cp, sp, lon0, cx, cy, R);
    if (p2) items.push({ t: c.t, x: p2[0], y: p2[1], z: p2[2], s: c.s, oc: false });
  }
  /* 大洲优先绘制（在下层保障可读性），大洋次之 */
  items.sort(function (a, b) { return (a.oc ? 1 : 0) - (b.oc ? 1 : 0); });

  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (var k = 0; k < items.length; k++) {
    var it = items[k];
    var alpha = Math.min(1, Math.max(0, (it.z - 0.12) / 0.30));
    if (alpha <= 0.02) continue;
    var fs = it.oc ? fs2 : fs1 * (it.s || 1);
    ctx.font = (it.oc ? "500 " : "700 ") + fs.toFixed(1) + "px system-ui,-apple-system,'Noto Sans SC','Microsoft YaHei',sans-serif";
    var wdt = ctx.measureText(it.t).width;
    var bx1 = it.x - wdt / 2 - 5, by1 = it.y - fs * 0.78, bx2 = it.x + wdt / 2 + 5, by2 = it.y + fs * 0.78;
    var hit = false;
    for (var b = 0; b < boxes.length; b++) {
      var B = boxes[b];
      if (bx1 < B[2] && bx2 > B[0] && by1 < B[3] && by2 > B[1]) { hit = true; break; }
    }
    if (hit) continue;
    boxes.push([bx1, by1, bx2, by2]);
    ctx.globalAlpha = alpha;
    /* 描边兜底：任何底色上都能读 */
    ctx.lineWidth = Math.max(2.6, fs * 0.24);
    ctx.strokeStyle = state.skin === "dark" ? "rgba(4,10,20,.78)" : "rgba(255,255,255,.88)";
    ctx.lineJoin = "round";
    ctx.strokeText(it.t, it.x, it.y);
    ctx.fillStyle = it.oc ? (state.skin === "dark" ? "#bfe0ff" : "#1c5a86")
                          : (state.skin === "dark" ? "#ffffff" : "#12324f");
    ctx.fillText(it.t, it.x, it.y);
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------------ *
 * 6b. 昼夜晨昏线 / 太阳直射点 / 时区盘 / 练习标记
 *     昼夜区的数学：太阳方向单位向量 S，球面点 P 满足 dot(P,S)>0 为昼、
 *     <0 为夜，dot=0 即晨昏线（一个大圆）。渲染时把它当球面多边形处理：
 *     晨昏线可见段 + 球轮廓上「照不到」的那半圆弧，闭合成夜区。
 * ------------------------------------------------------------------ */
function cross3(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm3(v) {
  var L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / L, v[1] / L, v[2] / L];
}
/* 世界坐标 -> 相机坐标（与 projectAll 用的是同一套旋转） */
function w2c(v, lon0, cp, sp) {
  var cl = Math.cos(lon0), sl = Math.sin(lon0);
  var X = v[0] * cl - v[2] * sl;
  var Zt = v[2] * cl + v[0] * sl;
  return [X, v[1] * cp - Zt * sp, v[1] * sp + Zt * cp];
}
function sunCam(decl, slon, lon0, cp, sp) {
  var d = decl * RAD, l = slon * RAD, cd = Math.cos(d);
  return w2c([cd * Math.sin(l), Math.sin(d), cd * Math.cos(l)], lon0, cp, sp);
}
/* 晨昏线大圆采样，只保留朝向观察者的半段 */
function terminator(Sc) {
  var s = norm3(Sc);
  var e1 = Math.abs(s[0]) < 0.9 ? norm3(cross3([1, 0, 0], s)) : norm3(cross3([0, 1, 0], s));
  var e2 = cross3(s, e1);
  var M = 480, pts = [], zs = [], i;
  for (i = 0; i < M; i++) {
    var t = TAU * i / M, ct = Math.cos(t), st = Math.sin(t);
    pts.push([e1[0] * ct + e2[0] * st, e1[1] * ct + e2[1] * st, e1[2] * ct + e2[2] * st]);
    zs.push(pts[i][2]);
  }
  var start = -1;
  for (i = 0; i < M; i++) {
    if (zs[i] >= 0 && zs[(i + M - 1) % M] < 0) { start = i; break; }
  }
  var seg = [];
  if (start >= 0) {
    for (i = 0; i < M; i++) {
      var k = (start + i) % M;
      if (zs[k] < 0) break;
      seg.push(pts[k]);
    }
  }
  return { s: s, seg: seg };
}
function buildNightPath(ctx, Sc, cx, cy, R) {
  var seg = terminator(Sc).seg;
  if (seg.length < 2) return false;
  ctx.beginPath();
  ctx.moveTo(cx + R * seg[0][0], cy - R * seg[0][1]);
  for (var i = 1; i < seg.length; i++) ctx.lineTo(cx + R * seg[i][0], cy - R * seg[i][1]);
  var A = seg[0], B = seg[seg.length - 1];
  var aB = Math.atan2(-B[1], B[0]), aA = Math.atan2(-A[1], A[0]);
  var d1 = aA - aB;
  while (d1 < 0) d1 += TAU;
  while (d1 >= TAU) d1 -= TAU;
  var mid = aB + d1 / 2;
  var n3 = norm3(Sc);
  if (n3[0] * Math.cos(mid) - n3[1] * Math.sin(mid) < 0) ctx.arc(cx, cy, R, aB, aB + d1, false);
  else ctx.arc(cx, cy, R, aB, aB - (TAU - d1), true);
  ctx.closePath();
  return true;
}
function drawNight(ctx, Sc, cx, cy, R) {
  var n = norm3(Sc);
  var fill = state.skin === "dark" ? "rgba(3,8,22,.64)" : "rgba(16,42,76,.44)";
  /* 太阳几乎正对观察者 -> 全昼；几乎正背 -> 全夜（此时轮廓弧的选择会退化，必须特判） */
  if (n[2] > 0.995) return;
  if (n[2] < -0.995) {
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.fillStyle = fill; ctx.fill();
    return;
  }
  if (buildNightPath(ctx, Sc, cx, cy, R)) {
    ctx.fillStyle = fill; ctx.fill();
  }
}
function strokeTerm(ctx, tm, cx, cy, R, color, width) {
  var seg = tm.seg;
  if (seg.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(cx + R * seg[0][0], cy - R * seg[0][1]);
  for (var i = 1; i < seg.length; i++) ctx.lineTo(cx + R * seg[i][0], cy - R * seg[i][1]);
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.stroke();
}
function drawSunMark(ctx, R, cx, cy, cp, sp, lon0, decl, slon) {
  var r = Math.max(7, R * 0.030);
  /* 直射纬度虚线：直观呈现「直射点在南北回归线之间来回移动」 */
  ctx.save();
  ctx.setLineDash([6, 6]);
  drawLatLine(decl, 1, ctx, R, cx, cy, cp, sp, lon0, "rgba(255,205,70,.55)", 1.2, true);
  ctx.restore();
  var p = projLL(decl, slon, cp, sp, lon0, cx, cy, R);
  if (!p) return;
  ctx.save();
  ctx.shadowColor = "#ffd23f"; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU);
  ctx.fillStyle = "#ffd23f"; ctx.fill();
  ctx.restore();
  ctx.strokeStyle = "#ffe27a"; ctx.lineWidth = Math.max(1.3, r * 0.20); ctx.lineCap = "round";
  ctx.beginPath();
  for (var i = 0; i < 8; i++) {
    var a = TAU * i / 8 + 0.3927;
    ctx.moveTo(p[0] + Math.cos(a) * r * 1.4, p[1] + Math.sin(a) * r * 1.4);
    ctx.lineTo(p[0] + Math.cos(a) * r * 1.95, p[1] + Math.sin(a) * r * 1.95);
  }
  ctx.stroke();
  var fs = Math.max(11, Math.round(R * 0.040));
  var txt = "太阳直射 " + Math.abs(decl).toFixed(1) + "°" + (decl >= 0 ? "N" : "S");
  ctx.font = "700 " + fs + "px system-ui,-apple-system,'Noto Sans SC','Microsoft YaHei',sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.lineWidth = Math.max(2.8, fs * 0.28);
  ctx.strokeStyle = state.skin === "dark" ? "rgba(4,10,20,.85)" : "rgba(255,255,255,.92)";
  ctx.lineJoin = "round";
  ctx.strokeText(txt, p[0], p[1] - r * 2.0);
  ctx.fillStyle = "#ffdc6b";
  ctx.fillText(txt, p[0], p[1] - r * 2.0);
}
function overlaps(boxes, b) {
  for (var i = 0; i < boxes.length; i++) {
    var B = boxes[i];
    if (b[0] < B[2] && b[2] > B[0] && b[1] < B[3] && b[3] > B[1]) return true;
  }
  return false;
}
function drawTimeZones(ctx, R, cx, cy, cp, sp, lon0, decl, slon) {
  var i, lo, p;
  for (lo = -180; lo < 180; lo += 15) {
    var strong = (lo % 60 === 0);
    drawLonLine(lo, 1, ctx, R, cx, cy, cp, sp, lon0,
      strong ? "rgba(255,255,255,.42)" : "rgba(255,255,255,.20)",
      strong ? 1.4 : 0.9, !strong);
  }
  drawLonLine(180, 1, ctx, R, cx, cy, cp, sp, lon0, "#ff7b6b", 2.4, false);

  var fs = Math.max(9.5, Math.round(R * 0.030));
  ctx.font = "600 " + fs + "px system-ui,-apple-system,'Noto Sans SC',sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  var boxes = [];
  for (lo = -180; lo < 180; lo += 15) {
    var n = tzOf(lo);
    p = projLL(7, lo, cp, sp, lon0, cx, cy, R);
    if (!p || p[2] < 0.24) continue;
    var t = "UTC" + (n >= 0 ? "+" : "") + n;
    var wdt = ctx.measureText(t).width;
    var b = [p[0] - wdt / 2 - 3, p[1] - fs * 0.72, p[0] + wdt / 2 + 3, p[1] + fs * 0.72];
    if (overlaps(boxes, b)) continue;
    boxes.push(b);
    ctx.lineWidth = Math.max(2.4, fs * 0.32);
    ctx.strokeStyle = state.skin === "dark" ? "rgba(4,10,20,.82)" : "rgba(255,255,255,.92)";
    ctx.lineJoin = "round";
    ctx.strokeText(t, p[0], p[1]);
    ctx.fillStyle = state.skin === "dark" ? "#cfe4ff" : "#1b3f66";
    ctx.fillText(t, p[0], p[1]);
  }
  /* 国际日界线注记 */
  p = projLL(48, 180, cp, sp, lon0, cx, cy, R);
  if (p && p[2] > 0.18) {
    var fsd = Math.max(10, Math.round(R * 0.032));
    ctx.font = "700 " + fsd + "px system-ui,-apple-system,'Noto Sans SC',sans-serif";
    ctx.lineWidth = Math.max(2.6, fsd * 0.3);
    ctx.strokeStyle = state.skin === "dark" ? "rgba(4,10,20,.85)" : "rgba(255,255,255,.92)";
    ctx.lineJoin = "round";
    ctx.strokeText("国际日界线（180°）", p[0], p[1]);
    ctx.fillStyle = "#ff9b8a";
    ctx.fillText("国际日界线（180°）", p[0], p[1]);
  }
  /* 城市锚点：名字 + 当地时间 + 昼夜 */
  var fs2 = Math.max(11, Math.round(R * 0.036));
  var rdot = Math.max(3, fs2 * 0.17);
  ctx.font = "700 " + fs2 + "px system-ui,-apple-system,'Noto Sans SC','Microsoft YaHei',sans-serif";
  for (i = 0; i < CITIES.length; i++) {
    var ct = CITIES[i];
    p = projLL(ct.lat, ct.lon, cp, sp, lon0, cx, cy, R);
    if (!p || p[2] < 0.12) continue;
    var tm = cityTime(ct.tz, state.sun.utc);
    var day = sunAlt(ct.lat, ct.lon, decl, slon) > 0;
    ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(3.2, R * 0.011), 0, TAU);
    ctx.fillStyle = "#ffffff"; ctx.fill();
    ctx.strokeStyle = "#0b2440"; ctx.lineWidth = 1.6; ctx.stroke();

    var label = ct.n + " " + tm.txt;
    var w2 = ctx.measureText(label).width;
    var lx = p[0] + 10, ly = p[1] - fs2 * 1.05;
    if (lx + w2 > cx + R - 4) lx = p[0] - w2 - 10;
    ctx.beginPath(); ctx.arc(lx - 4 - rdot, ly, rdot, 0, TAU);
    ctx.fillStyle = day ? "#ffd23f" : "#25405f"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.textAlign = "left";
    ctx.lineWidth = Math.max(2.6, fs2 * 0.26);
    ctx.strokeStyle = state.skin === "dark" ? "rgba(4,10,20,.85)" : "rgba(255,255,255,.92)";
    ctx.lineJoin = "round";
    ctx.strokeText(label, lx, ly);
    ctx.fillStyle = day ? "#fff2c2" : "#d3e2f4";
    ctx.fillText(label, lx, ly);
    ctx.textAlign = "center";
  }
}
/* 练习模式的答案 / 学生点击标记 */
function drawQuizMark(ctx, R, cx, cy, cp, sp, lon0) {
  var q = state.quiz;
  if (!q.fb) return;
  function ring(lat, lon, color, dash) {
    var p = projLL(lat, lon, cp, sp, lon0, cx, cy, R);
    if (!p) return;
    ctx.save();
    if (dash) ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(9, R * 0.034), 0, TAU);
    ctx.strokeStyle = color; ctx.lineWidth = 2.6; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.arc(p[0], p[1], 2.8, 0, TAU);
    ctx.fillStyle = color; ctx.fill();
  }
  if (q.fb.ans) ring(q.fb.ans[0], q.fb.ans[1], "#4cc9f0", true);
  if (q.fb.at) ring(q.fb.at[0], q.fb.at[1], q.fb.ok ? "#3ddc84" : "#ff6b6b", false);
}

/* ------------------------------------------------------------------ *
 * 7. 地理信息查询
 * ------------------------------------------------------------------ */
function tzOf(lon) {
  var n = Math.round(lon / 15);
  if (n < -12) n = -12;
  if (n > 14) n = 14;
  return n;
}
var CN_NUM = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
function tzText(n) {
  var s = Math.abs(n) <= 12 ? CN_NUM[Math.abs(n)] : String(Math.abs(n));
  if (n === 0) return "0（中时区）";
  return (n > 0 ? "+" : "−") + Math.abs(n) + "（" + (n > 0 ? "东" : "西") + s + "区）";
}
function zone5(lat) {
  var a = Math.abs(lat);
  if (a < 23.44) return "热带";
  if (a < 66.56) return lat > 0 ? "北温带" : "南温带";
  return lat > 0 ? "北寒带" : "南寒带";
}
function climate(lat) {
  var a = Math.abs(lat);
  if (a < 10) return "热带雨林 / 热带季风气候（终年高温多雨）";
  if (a < 23.44) return "热带草原 / 热带沙漠气候（干湿季分明）";
  if (a < 30) return "亚热带（西岸地中海气候 / 东岸亚热带季风）";
  if (a < 40) return "温带过渡带（冬温夏热，降水适中）";
  if (a < 55) return "温带（西岸海洋性 / 东岸季风 / 内陆大陆性）";
  if (a < 66.56) return "亚寒带针叶林气候（冬长严寒）";
  return "寒带气候（苔原 / 冰原，终年严寒）";
}
function oceanOf(lat, lon) {
  if (lat < -60) return "南大洋（南冰洋）";
  if (lat > 66.5) return "北冰洋";
  for (var i = 0; i < SEAS.length; i++) {
    var s = SEAS[i];
    if (lon >= s.lo[0] && lon <= s.lo[1] && lat >= s.la[0] && lat <= s.la[1]) return s.n;
  }
  if (lon >= -70 && lon < 20) {
    if (lat > 30 && lon < 42) return "大西洋（欧洲近海一带）";
    return "大西洋";
  }
  if (lon >= 20 && lon < 120) {
    if (lat < 30) return "印度洋";
    if (lon >= 46 && lon <= 55 && lat >= 36 && lat <= 47) return "里海（世界最大内陆湖）";
    return "亚洲内陆水域 / 印度洋方向";
  }
  return "太平洋";
}

function fmtLat(v) {
  var a = Math.abs(v);
  return a.toFixed(1) + "°" + (v >= 0 ? "N" : "S");
}
function fmtLon(v) {
  if (Math.abs(v) < 0.05) return "0°（本初子午线）";
  var a = Math.abs(v);
  return a.toFixed(1) + "°" + (v >= 0 ? "E" : "W");
}

/* ------------------------------------------------------------------ *
 * 8. 拾取（离屏 ID 画布）
 * ------------------------------------------------------------------ */
var pickDirty = true, mouse = { x: -1, y: -1, inside: false };

function buildPick() {
  var w = view.w, h = view.h, R = view.R, cx = view.cx, cy = view.cy;
  if (pickCv.width !== w || pickCv.height !== h) { pickCv.width = w; pickCv.height = h; }
  pickCtx.setTransform(1, 0, 0, 1, 0, 0);
  pickCtx.clearRect(0, 0, w, h);
  pickCtx.save();
  pickCtx.beginPath(); pickCtx.arc(cx, cy, R, 0, TAU); pickCtx.clip();
  /* 第一层：大洲 -> R 通道 */
  for (var i = 0; i < CONT_KEYS.length; i++) {
    pickCtx.beginPath();
    if (!traceRings(CONT[CONT_KEYS[i]].rings, 1, pickCtx, R, cx, cy)) continue;
    pickCtx.fillStyle = "rgb(" + (i + 1) + ",0,0)";
    pickCtx.strokeStyle = pickCtx.fillStyle;
    pickCtx.lineWidth = 1.2; pickCtx.lineJoin = "round";
    pickCtx.fill(); pickCtx.stroke();
  }
  /* 第二层：国家 -> G/B 通道（大洲 ID 写回 R） */
  for (var c = 0; c < COUNTRIES.length; c++) {
    var ct = COUNTRIES[c];
    var ci = CONT_KEYS.indexOf(ct.cont) + 1;
    if (ci <= 0) continue;
    var id = ct.id;
    pickCtx.beginPath();
    if (!traceRings(ct.rings, 1, pickCtx, R, cx, cy)) continue;
    pickCtx.fillStyle = "rgb(" + ci + "," + (id & 255) + "," + (id >> 8) + ")";
    pickCtx.strokeStyle = pickCtx.fillStyle;
    pickCtx.lineWidth = 2.4; pickCtx.lineJoin = "round";
    pickCtx.fill(); pickCtx.stroke();
  }
  pickCtx.restore();
}

function pickAt(sx, sy) {
  var x = Math.round(sx), y = Math.round(sy);
  if (x < 0 || y < 0 || x >= pickCv.width || y >= pickCv.height) return null;
  var d;
  try { d = pickCtx.getImageData(x, y, 1, 1).data; }
  catch (e) { return null; }
  var ci = d[0], id = d[2] * 256 + d[1];
  var geo = unproject(sx, sy);
  if (!geo) return null;
  return { ci: ci, ctid: id, lat: geo.lat, lon: geo.lon };
}

function describe(p) {
  if (!p) return null;
  var cont = p.ci > 0 ? CONT_KEYS[p.ci - 1] : null;
  var contZh = cont ? GEO_CONT_ZH[cont] : null;
  var ct = p.ctid > 0 ? COUNTRIES[p.ctid - 1] : null;

  var title, tag, rows;
  if (contZh) {
    var sameAsCont = ct && ct.zh === contZh;   // “南极洲”这类：既是地区条目也等于大洲名
    title = ct ? ct.zh : contZh;
    tag = sameAsCont ? ("大洲 · " + contZh)
                     : (ct ? "国家 / 地区 · " + contZh : "大洲 · " + contZh);
    rows = [];
    if (ct && ct.zh !== contZh) rows.push(["所属大洲", contZh]);
    rows.push(["位置", fmtLat(p.lat) + " · " + fmtLon(p.lon)]);
    rows.push(["五带", zone5(p.lat)]);
    rows.push(["气候带", climate(p.lat)]);
    rows.push(["理论时区", "UTC" + tzText(tzOf(p.lon))]);
    rows.push(["半球", (p.lat >= 0 ? "北半球" : "南半球") + " / " + (p.lon > -20 && p.lon <= 160 ? "东半球" : "西半球")]);
    if (CONT_INFO[contZh]) rows.push(["大洲概况", CONT_INFO[contZh]]);
  } else {
    var on = oceanOf(p.lat, p.lon);
    title = on;
    tag = "海洋 / 海域";
    rows = [["位置", fmtLat(p.lat) + " · " + fmtLon(p.lon)]];
    var base = on.replace(/（.*?）/, "");
    if (OCEAN_INFO[base]) rows.push(["海域概况", OCEAN_INFO[base]]);
    else if (OCEAN_INFO[on]) rows.push(["海域概况", OCEAN_INFO[on]]);
    rows.push(["五带", zone5(p.lat)]);
    rows.push(["气候带", climate(p.lat)]);
    rows.push(["理论时区", "UTC" + tzText(tzOf(p.lon))]);
    rows.push(["半球", (p.lat >= 0 ? "北半球" : "南半球") + " / " + (p.lon > -20 && p.lon <= 160 ? "东半球" : "西半球")]);
  }
  /* 地形图层：补充海拔读数与最近著名地点（精确值取自真实数据表） */
  if (state.layers.terrain && ELEV) {
    var pk = nearestPeak(p.lat, p.lon, 2.5);
    if (pk) {
      var pt = pk[4] === "peak" ? "著名山峰" : (pk[4] === "low" ? "著名低地 / 海沟" : "著名地形区");
      var pv = pk[3] >= 0 ? ("海拔 " + pk[3] + " 米") : ("低于海平面 " + (-pk[3]) + " 米");
      rows.unshift(["🏔 " + pk[0], pt + " · " + pv]);
    }
    var qv = sampleElev(p.lat, p.lon), mv = Math.round(qToM(qv | 0));
    rows.push(["海拔（地形模型）", mv < 0 ? ("低于海平面约 " + Math.abs(mv) + " 米") : ("约 " + mv + " 米")]);
  }
  return { title: title, tag: tag, rows: rows, lat: p.lat, lon: p.lon };
}

/* ------------------------------------------------------------------ *
 * 9. UI
 * ------------------------------------------------------------------ */
var infoBox = document.getElementById("info");
var infoCo = document.getElementById("infoCo");
var infoTag = document.getElementById("infoTag");
var infoDl = document.getElementById("infoDl");

function showInfo(dsc, pinned) {
  if (!dsc) { infoBox.classList.remove("show"); return; }
  infoCo.textContent = dsc.title;
  infoTag.textContent = pinned ? "已锁定" : dsc.tag;
  var html = "";
  for (var i = 0; i < dsc.rows.length; i++) {
    html += "<dt>" + esc(dsc.rows[i][0]) + "</dt><dd>" + esc(dsc.rows[i][1]) + "</dd>";
  }
  html += '<dt style="grid-column:1/-1;margin-top:4px;font-size:11.5px">' +
          "教学提示：气候带按纬度带简化模型给出，实际气候受海陆位置与洋流影响</dt>";
  infoDl.innerHTML = html;
  infoBox.classList.add("show");
  infoBox.classList.toggle("pinned", !!pinned);
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (m) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
  });
}

/* 图层 chips */
var chipsEl = document.getElementById("chips");
var btnLayers = document.getElementById("btnLayers");
btnLayers.addEventListener("click", function () {
  var open = chipsEl.classList.toggle("open");
  btnLayers.setAttribute("aria-expanded", String(open));
});
var legendEl = document.getElementById("legend");
LAYERS.forEach(function (ly) {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (ly.on ? " on" : "");
  b.setAttribute("aria-pressed", String(!!ly.on));
  b.dataset.k = ly.k;
  b.innerHTML = '<span class="dot" style="background:' + ly.c + '"></span>' + ly.n;
  b.addEventListener("click", function () {
    var nv = !state.layers[ly.k];
    state.layers[ly.k] = nv;
    if (ly.k === "back" && nv) state.layers.opaque = false;   // 透明地球与不透明互斥
    if (ly.k === "opaque" && nv) state.layers.back = false;
    syncChips();
    if (ly.k === "terrain" && legendEl) legendEl.classList.toggle("show", state.layers.terrain);
    dirty = true;
  });
  chipsEl.appendChild(b);
});

/* 视图预设 */
document.getElementById("views").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-view]");
  if (!b) return;
  var v = b.dataset.view;
  Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
  b.classList.add("on"); b.setAttribute("aria-pressed", "true");
  if (v === "front") { state.pitch = 0; }
  else if (v === "north") { state.pitch = 88 * RAD; }
  else if (v === "south") { state.pitch = -88 * RAD; }
  dirty = true;
});

function setZoom(z) {
  state.zoom = Math.max(0.55, Math.min(3.2, z));
  resize();
}
document.getElementById("btnZoomIn").addEventListener("click", function () { setZoom(state.zoom * 1.18); });
document.getElementById("btnZoomOut").addEventListener("click", function () { setZoom(state.zoom / 1.18); });

var btnSpin = document.getElementById("btnSpin");
btnSpin.addEventListener("click", function () {
  state.spinning = !state.spinning;
  btnSpin.classList.toggle("on", state.spinning);
  btnSpin.textContent = state.spinning ? "⏸" : "▶";
  btnSpin.title = state.spinning ? "暂停自转 (空格)" : "继续自转 (空格)";
  dirty = true;
});

var spinSpeed = document.getElementById("spinSpeed");
var spinVal = document.getElementById("spinVal");
spinSpeed.addEventListener("input", function () {
  state.spinPeriod = +spinSpeed.value;
  SPIN_RATE = TAU / state.spinPeriod;
  spinVal.textContent = state.spinPeriod + "秒/圈";
  dirty = true;
});

document.getElementById("btnReset").addEventListener("click", function () {
  state.lon0 = 0; state.pitch = 0; state.zoom = 1;
  state.spinning = true; state.spinPeriod = 48; SPIN_RATE = TAU / 48;
  spinSpeed.value = 48; spinVal.textContent = "48秒/圈";
  btnSpin.classList.add("on"); btnSpin.textContent = "⏸";
  state.pinned = false; state.hover = null;
  infoBox.classList.remove("show", "pinned");
  Array.prototype.forEach.call(document.querySelectorAll("#views button"), function (x, i) {
    x.classList.toggle("on", i === 0); x.setAttribute("aria-pressed", String(i === 0));
  });
  resize(); dirty = true;
});

var btnSkin = document.getElementById("btnSkin");
btnSkin.addEventListener("click", function () {
  state.skin = state.skin === "dark" ? "light" : "dark";
  document.body.classList.toggle("light", state.skin === "light");
  btnSkin.textContent = state.skin === "dark" ? "浅色底色" : "深色底色";
  buildBg(); dirty = true;
});

document.getElementById("btnFull").addEventListener("click", function () {
  if (document.fullscreenElement) document.exitFullscreen();
  else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
});

/* ------------------------------------------------------------------ *
 * 9b. 模式面板：昼夜四季 / 时区对照 / 课堂练习
 * ------------------------------------------------------------------ */
var panelEl = document.getElementById("panel");
var pTitleEl = document.getElementById("pTitle");
var pSubEl = document.getElementById("pSub");
var pBodyEl = document.getElementById("pBody");
var pCloseEl = document.getElementById("pClose");

var MODES = {
  basic:    { t: "", sub: "", n: "基础" },
  guide:    { t: "学习路线", sub: "边观察，边建立地理概念", n: "学习路线" },
  daynight: { t: "昼夜与四季", sub: "太阳直射点的移动", n: "昼夜四季" },
  timezone: { t: "时区对照",   sub: "东加西减 · 国际日界线", n: "时区对照" },
  quiz:     { t: "课堂练习",   sub: "点一点，练一练", n: "课堂练习" }
};

var GUIDE_LESSONS = [
  { title: "经纬网与坐标", goal: "用赤道和本初子午线建立经纬度的方向感。", steps: [
    { title: "找到坐标原点", text: "观察赤道与本初子午线的交点。想一想：它的纬度、经度分别是多少？", action: { kind: "focus", lon: 0, pitch: 0, zoom: 1, layers: ["equator", "prime", "grid"] }, explanation: "交点坐标是 0°、0°，位于几内亚湾附近。纬度以赤道为起点向南北计量，经度以本初子午线为起点向东西计量。" },
    { title: "比较南北纬", text: "打开回归线与极圈图层，比较它们相对赤道的位置；再拖动地球，从不同方向观察。", action: { kind: "focus", lon: 90, pitch: 0, zoom: 1, layers: ["equator", "tropic", "polar", "grid"] }, explanation: "纬度表示某地相对赤道的南北位置；同一条纬线上的各点纬度相同，但经度可以不同。" }
  ] },
  { title: "大洲与国家", goal: "观察国家边界与大洲分区的关系。", steps: [
    { title: "从区域到国家", text: "开启国界和地名图层，点击地球上的一个国家。看看信息卡显示的所属大洲与坐标。", action: { kind: "focus", lon: 100, pitch: 8, zoom: 1, layers: ["border", "label", "grid"] }, explanation: "大洲是大尺度的自然地理区域，国家是政治地理单元；一个大洲通常包含多个国家，俄罗斯等国家横跨大洲分界。" }
  ] },
  { title: "地形与海拔", goal: "通过地形图层比较高地、低地与海沟。", steps: [
    { title: "观察高低起伏", text: "开启地形图层并聚焦青藏高原附近。点击山地或高原，观察信息卡中的海拔读数与著名地形提示。", action: { kind: "focus", lon: 86, pitch: 27, zoom: 1.35, layers: ["terrain", "label"] }, explanation: "地形颜色主要用于表现高低起伏，局部海拔属于地形模型的近似读数；著名地形点的标注值与网格采样值含义不同。" }
  ] },
  { title: "昼夜与四季", goal: "用太阳直射点和晨昏线理解季节差异。", steps: [
    { title: "模拟夏至昼夜", text: "打开昼夜与四季模式，选择“夏至”，再播放昼夜交替。观察北极圈内的昼夜变化；完成后可回到本路线。", action: { kind: "daynight" }, explanation: "地轴倾斜使太阳直射点在南北回归线之间移动，导致不同纬度的昼长和季节变化。模拟用于帮助观察规律，不替代精密天文历算。" }
  ] }
];
var panelUpd = null;
var quizSavedLabel = true;

function setSpin(on) {
  state.spinning = on;
  btnSpin.classList.toggle("on", on);
  btnSpin.textContent = on ? "⏸" : "▶";
  btnSpin.title = on ? "暂停自转 (空格)" : "继续自转 (空格)";
  dirty = true;
}
function syncChips() {
  Array.prototype.forEach.call(chipsEl.children, function (b) {
    b.classList.toggle("on", !!state.layers[b.dataset.k]);
    b.setAttribute("aria-pressed", String(!!state.layers[b.dataset.k]));
  });
  if (legendEl) legendEl.classList.toggle("show", !!state.layers.terrain);
}
function kvRow(k, v) { return "<dt>" + esc(k) + "</dt><dd>" + esc(v) + "</dd>"; }
function termDesc(n) {
  for (var i = 0; i < TERMS.length; i++) if (TERMS[i].n === n) return TERMS[i].desc;
  return "";
}
/* 离哪个节气最近（±2 天内就算） */
function nearTerm(d) {
  var best = null, bd = 999;
  for (var i = 0; i < TERMS.length; i++) {
    var diff = Math.abs(d - TERMS[i].d);
    if (diff > 182) diff = 365 - diff;
    if (diff < bd) { bd = diff; best = TERMS[i].n; }
  }
  return bd <= 2 ? best : "";
}
function dayOfYear(now) {
  var start = Date.UTC(now.getUTCFullYear(), 0, 1);
  return Math.floor((now.getTime() - start) / 86400000) + 1;
}

/* ---------------- 昼夜四季面板 ---------------- */
function buildDayPanel() {
  pBodyEl.innerHTML =
      '<div class="p-sec">日期 —— 决定太阳直射在哪条纬线上</div>'
    + '<div class="row"><label for="sDay">日期</label><input type="range" id="sDay" aria-label="日期，年内第几天" min="1" max="365" step="1">'
    + '<span class="val" id="sDayV"></span></div>'
    + '<div class="row"><label for="sUtc">世界时</label><input type="range" id="sUtc" aria-label="世界时，UTC 小时" min="0" max="24" step="0.25">'
    + '<span class="val" id="sUtcV"></span></div>'
    + '<div class="p-sec">关键节气（一键跳转）</div><div class="seg" id="segTerm"></div>'
    + '<div class="p-sec">自动演示</div><div class="seg" id="segAnim">'
    + '<button data-anim="year">▶ 直射点移动（一年）</button>'
    + '<button data-anim="day">▶ 昼夜交替（一天）</button>'
    + '<button data-anim="">■ 停止</button></div>'
    + '<div class="p-sec">此时此刻</div><dl class="kv" id="sunKv"></dl>'
    + '<div class="note" id="sunNote"></div>';

  var sDay = document.getElementById("sDay");
  var sUtc = document.getElementById("sUtc");
  var sDayV = document.getElementById("sDayV");
  var sUtcV = document.getElementById("sUtcV");
  var kv = document.getElementById("sunKv");
  var note = document.getElementById("sunNote");
  var segAnim = document.getElementById("segAnim");
  var segTerm = document.getElementById("segTerm");

  function stopAnim() { state.anim = null; syncAnim(); }
  function syncAnim() {
    Array.prototype.forEach.call(segAnim.children, function (b) {
      b.classList.toggle("on", (b.dataset.anim || null) === state.anim);
    });
  }
  sDay.addEventListener("input", function () {
    state.sun.day = +sDay.value; stopAnim(); dirty = true; upd();
  });
  sUtc.addEventListener("input", function () {
    state.sun.utc = +sUtc.value; stopAnim(); dirty = true; upd();
  });
  TERMS.forEach(function (t) {
    var b = document.createElement("button");
    b.textContent = t.n + " · " + dayToMD(t.d);
    b.addEventListener("click", function () {
      state.sun.day = t.d; stopAnim(); dirty = true; upd();
    });
    segTerm.appendChild(b);
  });
  Array.prototype.forEach.call(segAnim.children, function (b) {
    b.addEventListener("click", function () {
      state.anim = b.dataset.anim || null; syncAnim(); dirty = true;
    });
  });

  function upd() {
    sDay.value = state.sun.day;
    sUtc.value = state.sun.utc;
    var d = state.sun.day, decl = sunDecl(d), slon = sunSubLon(state.sun.utc);
    var tn = nearTerm(d);
    sDayV.textContent = dayToMD(d) + (tn ? " " + tn : "");
    sUtcV.textContent = fmtHM(state.sun.utc) + " UTC";
    var dn = sunDecl(d + 6 > 365 ? d + 6 - 365 : d + 6);
    var move = dn > decl + 0.05 ? "向北移动" : (dn < decl - 0.05 ? "向南移动" : "折返点附近");
    var dl = dayLength(39.9, decl);
    var polar = Math.abs(decl) < 0.3 ? "全球无极昼极夜"
              : (decl > 0 ? "北极圈内极昼 / 南极圈内极夜" : "北极圈内极夜 / 南极圈内极昼");
    kv.innerHTML =
        kvRow("太阳直射点", Math.abs(decl).toFixed(1) + "°" + (decl >= 0 ? "N" : "S") + "，" + fmtLon(slon))
      + kvRow("直射点移动", move)
      + kvRow("北京昼长", dl >= 23.9 ? "约 24 小时" : (dl <= 0.1 ? "约 0 小时" : dl.toFixed(1) + " 小时"))
      + kvRow("昼夜极值", polar);
    note.innerHTML = tn
      ? "<b>" + tn + "：</b>" + termDesc(tn)
      : "<b>怎么用：</b>先点“夏至”，再点“▶ 昼夜交替”，让学生看晨昏线扫过北冰洋——" +
        "北极圈内全天不落进黑夜，这就是极昼。";
  }
  syncAnim();
  panelUpd = upd;
  upd();
}

/* ---------------- 时区面板 ---------------- */
function buildTzPanel() {
  pBodyEl.innerHTML =
      '<div class="row"><label for="tUtc">世界时</label><input type="range" id="tUtc" aria-label="世界时，UTC 小时" min="0" max="24" step="0.25">'
    + '<span class="val" id="tUtcV"></span></div>'
    + '<div class="seg"><button id="tNow">设为现在</button>'
    + '<button id="tBJ">北京正午</button><button id="tPlay">▶ 走一天</button></div>'
    + '<div class="p-sec">世界各地此时此刻</div><div id="cityList"></div>'
    + '<div class="note"><b>日界线：</b>自东向西越过 180° 经线，日期加一天；' +
      '自西向东越过，日期减一天。列表里的“明天 / 昨天”就是这么来的。</div>';

  var tUtc = document.getElementById("tUtc");
  var tUtcV = document.getElementById("tUtcV");
  var list = document.getElementById("cityList");
  var tPlay = document.getElementById("tPlay");

  tUtc.addEventListener("input", function () {
    state.sun.utc = +tUtc.value; state.anim = null; dirty = true; upd();
  });
  document.getElementById("tNow").addEventListener("click", function () {
    var now = new Date();
    state.sun.utc = now.getUTCHours() + now.getUTCMinutes() / 60;
    state.sun.day = dayOfYear(now);
    state.anim = null; dirty = true; upd();
  });
  document.getElementById("tBJ").addEventListener("click", function () {
    state.sun.utc = 4; state.anim = null; dirty = true; upd();
  });
  tPlay.addEventListener("click", function () {
    state.anim = state.anim === "day" ? null : "day"; dirty = true;
  });

  function upd() {
    tUtc.value = state.sun.utc;
    tUtcV.textContent = fmtHM(state.sun.utc) + " UTC";
    tPlay.classList.toggle("on", state.anim === "day");
    var decl = sunDecl(state.sun.day), slon = sunSubLon(state.sun.utc);
    var h = "";
    for (var i = 0; i < CITIES.length; i++) {
      var c = CITIES[i];
      var ct = cityTime(c.tz, state.sun.utc);
      var day = sunAlt(c.lat, c.lon, decl, slon) > 0;
      var dd = ct.d === 0 ? "今天" : (ct.d > 0 ? "明天" : "昨天");
      h += '<div class="city">'
         + '<span class="ic">' + (day ? "☀" : "☾") + '</span>'
         + '<span class="nm">' + esc(c.n) + '</span>'
         + '<span class="tm">' + ct.txt + '</span>'
         + '<span class="dy">' + dd + '</span>'
         + '<span class="tz">UTC' + (c.tz >= 0 ? "+" : "") + c.tz + " · " + esc(tzText(c.tz)) + '</span>'
         + '</div>';
    }
    list.innerHTML = h;
  }
  panelUpd = upd;
  upd();
}

/* ---------------- 练习面板 ---------------- */
function pickPool() {
  var k = state.quiz.kind, all = [], i;
  if (k !== "area" && k !== "ctry") for (i = 0; i < Q_POS.length; i++) all.push({ type: "pos", d: Q_POS[i] });
  if (k !== "pos" && k !== "ctry") for (i = 0; i < Q_AREA.length; i++) all.push({ type: "area", d: Q_AREA[i] });
  if (k !== "pos" && k !== "area") for (i = 0; i < Q_CTRY.length; i++) all.push({ type: "ctry", d: Q_CTRY[i] });
  return all;
}
function buildQuizPanel() {
  var q = state.quiz;
  pBodyEl.innerHTML =
      '<div class="seg" id="qKind"></div>'
    + '<div class="q" id="qText"></div>'
    + '<div class="qsub" id="qSub"></div>'
    + '<div class="fb" id="qFb"></div>'
    + '<div class="score"><span>答对 <b id="qOk">0</b> ／ 已答 <b id="qAll">0</b> 次</span>'
    + '<span class="grow"></span>'
    + '<button id="qNext">下一题</button><button id="qSkip">看答案</button>'
    + '<button id="qReset">重来</button></div>';

  var segKind = document.getElementById("qKind");
  Q_KINDS.forEach(function (kd) {
    var b = document.createElement("button");
    b.textContent = kd.n;
    b.classList.toggle("on", q.kind === kd.k);
    b.addEventListener("click", function () {
      q.kind = kd.k;
      Array.prototype.forEach.call(segKind.children, function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      q.seen = []; nextQuestion();
    });
    segKind.appendChild(b);
  });
  document.getElementById("qNext").addEventListener("click", function () { nextQuestion(); });
  document.getElementById("qSkip").addEventListener("click", function () { reveal(); });
  document.getElementById("qReset").addEventListener("click", function () {
    q.ok = 0; q.all = 0; q.seen = []; nextQuestion();
  });
  if (!q.cur) nextQuestion(); else renderQuiz();
}
function nextQuestion() {
  var q = state.quiz, pool = pickPool();
  if (q.seen.length >= pool.length) q.seen = [];
  var idx = Math.floor(Math.random() * pool.length), guard = 0;
  while (q.seen.indexOf(idx) >= 0 && guard++ < 500) idx = Math.floor(Math.random() * pool.length);
  q.seen.push(idx);
  q.cur = pool[idx];
  q.fb = null;
  renderQuiz();
  dirty = true;
}
function renderQuiz() {
  var q = state.quiz;
  var t = document.getElementById("qText");
  if (!t) return;
  var s = document.getElementById("qSub");
  var fb = document.getElementById("qFb");
  var c = q.cur;
  if (!c) { t.textContent = "—"; return; }
  var head = c.type === "pos" ? "请在地球上点击这处位置"
           : c.type === "area" ? "请在地球上点击这片区域"
           : "请在地球上点击这个国家";
  t.innerHTML = head + '：<span class="hl">' + esc(c.d.q) + '</span>';
  s.textContent = c.type === "pos"
    ? "提示：先看纬度定南北，再看经度定东西（允许误差约 7°）"
    : ("提示：" + c.d.tip);
  var okEl = document.getElementById("qOk"), allEl = document.getElementById("qAll");
  if (okEl) okEl.textContent = q.ok;
  if (allEl) allEl.textContent = q.all;
  if (!fb) return;
  if (q.fb) {
    fb.className = "fb show " + (q.fb.ok ? "ok" : "no");
    fb.innerHTML = "<b>" + (q.fb.ok ? "✓ 答对了" : (q.fb.at ? "✗ 差一点" : "答案在这里")) + "</b>" + esc(q.fb.msg);
    if (!q.fb.ok && q.fb.at) {
      fb.innerHTML += '<div style="margin-top:7px"><button type="button" class="retry-btn" id="qRetry">再试一次</button></div>';
      document.getElementById("qRetry").addEventListener("click", function () { q.fb = null; renderQuiz(); dirty = true; });
    }
  } else {
    fb.className = "fb"; fb.innerHTML = "";
  }
}
function hintDir(p, t) {
  var s = "";
  s += t.lat > p.lat + 2 ? "北" : (t.lat < p.lat - 2 ? "南" : "");
  var dl = t.lon - p.lon;
  while (dl > 180) dl -= 360;
  while (dl < -180) dl += 360;
  s += dl > 2 ? "东" : (dl < -2 ? "西" : "");
  return s || "附近";
}
function answerAt(p) {
  var q = state.quiz;
  if (!q.cur || q.fb) return;
  var c = q.cur;
  q.all++;
  var ok = false, msg = "";
  if (c.type === "pos") {
    var dist = angDist(p.lat, p.lon, c.d.lat, c.d.lon);
    ok = dist <= 7;
    if (ok) msg = "离目标只差 " + dist.toFixed(1) + "°（约 " + Math.round(dist * 111) + " 公里）。" + c.d.tip;
    else if (dist <= 18) msg = "偏了 " + dist.toFixed(1) + "°——方向对了，再往" + hintDir(p, c.d) + "挪一点。" + c.d.tip;
    else msg = "偏了 " + dist.toFixed(1) + "°，位置差得比较多，看蓝圈处的正确答案。" + c.d.tip;
  } else {
    var name = null;
    if (p.ci > 0) name = GEO_CONT_ZH[CONT_KEYS[p.ci - 1]];
    if (c.type === "ctry" && p.ctid > 0) {
      var ct = COUNTRIES[p.ctid - 1];
      if (ct) name = ct.zh;
    }
    if (!name) name = oceanOf(p.lat, p.lon);
    var hit = (name === c.d.q);
    if (!hit && c.type === "area" && p.ctid > 0) {
      var ct2 = COUNTRIES[p.ctid - 1];
      if (ct2 && GEO_CONT_ZH[ct2.cont] === c.d.q) hit = true;   // 点在国家上也算找到所属大洲
    }
    ok = hit;
    msg = ok ? ("没错，" + c.d.tip)
             : ("你点到了" + (name || "海面上") + "。正确答案在蓝圈附近：" + c.d.tip);
  }
  if (ok) q.ok++;
  q.fb = { ok: ok, at: [p.lat, p.lon], ans: [c.d.lat, c.d.lon], msg: msg };
  renderQuiz();
  dirty = true;
}
function reveal() {
  var q = state.quiz;
  if (!q.cur) return;
  if (!q.fb) q.all++;
  q.fb = { ok: false, at: null, ans: [q.cur.d.lat, q.cur.d.lon],
           msg: "正确答案就在蓝圈处：" + q.cur.d.tip };
  renderQuiz();
  dirty = true;
}

/* ---------------- 引导式学习路线 ---------------- */
function buildGuidePanel() {
  pBodyEl.innerHTML =
      '<div class="guide-progress"><span id="guideCount"></span><div class="guide-track" role="progressbar" aria-label="学习路线完成进度" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"><i id="guideFill"></i></div></div>'
    + '<div class="seg guide-tabs" id="guideTabs"></div>'
    + '<div class="guide-card"><div class="guide-meta" id="guideMeta"></div><h3 id="guideTitle"></h3>'
    + '<p class="guide-goal" id="guideGoal"></p><p id="guideText"></p>'
    + '<div class="note" id="guideExplain" hidden></div>'
    + '<div class="seg guide-actions"><button type="button" id="guideAction">定位观察</button><button type="button" id="guideDone">我观察到了，继续</button></div></div>'
    + '<div class="score guide-footer"><button type="button" id="guidePrev">上一步</button><span class="grow"></span><button type="button" id="guideReset">重置路线</button><button type="button" id="guideNext">下一步</button></div>';
  var tabs = document.getElementById("guideTabs");
  GUIDE_LESSONS.forEach(function (lesson, i) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = lesson.title;
    b.addEventListener("click", function () { state.guide.lesson = i; state.guide.step = 0; renderGuide(); });
    tabs.appendChild(b);
  });
  document.getElementById("guideAction").addEventListener("click", function () {
    var step = GUIDE_LESSONS[state.guide.lesson].steps[state.guide.step];
    var a = step.action || {};
    if (a.kind === "daynight") {
      state.sun.day = 173; state.sun.utc = 12;
      setMode("daynight");
      return;
    }
    if (a.layers) a.layers.forEach(function (k) { state.layers[k] = true; });
    syncChips();
    if (a.lon !== undefined) state.lon0 = a.lon * RAD;
    if (a.pitch !== undefined) state.pitch = a.pitch * RAD;
    if (a.zoom !== undefined) state.zoom = a.zoom;
    setSpin(false);
    resize(); dirty = true; pickDirty = true;
    renderGuide();
  });
  document.getElementById("guideDone").addEventListener("click", function () {
    var g = state.guide, key = g.lesson + ":" + g.step;
    if (g.completed.indexOf(key) < 0) g.completed.push(key);
    if (g.lesson === GUIDE_LESSONS.length - 1 && g.step === GUIDE_LESSONS[g.lesson].steps.length - 1) {
      g.done = true;
    } else if (g.step < GUIDE_LESSONS[g.lesson].steps.length - 1) {
      g.step++;
    } else {
      g.lesson++; g.step = 0;
    }
    renderGuide();
  });
  document.getElementById("guidePrev").addEventListener("click", function () {
    var g = state.guide;
    if (g.step > 0) g.step--;
    else if (g.lesson > 0) { g.lesson--; g.step = GUIDE_LESSONS[g.lesson].steps.length - 1; }
    renderGuide();
  });
  document.getElementById("guideNext").addEventListener("click", function () {
    var g = state.guide;
    if (g.step < GUIDE_LESSONS[g.lesson].steps.length - 1) g.step++;
    else if (g.lesson < GUIDE_LESSONS.length - 1) { g.lesson++; g.step = 0; }
    renderGuide();
  });
  document.getElementById("guideReset").addEventListener("click", function () {
    state.guide = { lesson: 0, step: 0, completed: [], done: false };
    renderGuide();
  });
  renderGuide();
}
function renderGuide() {
  var g = state.guide, lesson = GUIDE_LESSONS[g.lesson], step = lesson.steps[g.step];
  var total = GUIDE_LESSONS.reduce(function (n, l) { return n + l.steps.length; }, 0);
  var count = document.getElementById("guideCount");
  if (!count) return;
  var bar = count.parentNode.querySelector('[role="progressbar"]');
  count.textContent = "已完成 " + g.completed.length + " / " + total + " 个观察点";
  bar.setAttribute("aria-valuemax", String(total));
  bar.setAttribute("aria-valuenow", String(g.completed.length));
  document.getElementById("guideFill").style.width = (100 * g.completed.length / total) + "%";
  Array.prototype.forEach.call(document.getElementById("guideTabs").children, function (b, i) {
    b.classList.toggle("on", i === g.lesson); b.setAttribute("aria-pressed", String(i === g.lesson));
  });
  document.getElementById("guideMeta").textContent = "第 " + (g.lesson + 1) + " 课 · 观察点 " + (g.step + 1) + " / " + lesson.steps.length;
  document.getElementById("guideTitle").textContent = step.title;
  document.getElementById("guideGoal").innerHTML = "<b>本课目标：</b>" + esc(lesson.goal);
  document.getElementById("guideText").textContent = step.text;
  var note = document.getElementById("guideExplain");
  note.innerHTML = "<b>观察结论：</b>" + esc(step.explanation);
  note.hidden = g.completed.indexOf(g.lesson + ":" + g.step) < 0;
  document.getElementById("guideAction").textContent = step.action && step.action.kind === "daynight" ? "打开昼夜与四季模式" : "定位并开启相关图层";
  document.getElementById("guideDone").textContent = g.done ? "路线已完成" : (g.lesson === GUIDE_LESSONS.length - 1 && g.step === lesson.steps.length - 1 ? "完成学习路线" : "我观察到了，继续");
  document.getElementById("guidePrev").disabled = g.lesson === 0 && g.step === 0;
  document.getElementById("guideNext").disabled = g.lesson === GUIDE_LESSONS.length - 1 && g.step === lesson.steps.length - 1;
  if (g.done) note.innerHTML = "<b>学习路线完成：</b>你已完成经纬网、大洲国家、地形和昼夜四季的观察。可以回到任一课复习，或进入练习模式检验掌握情况。";
}

/* ---------------- 模式切换 ---------------- */
function buildPanel() {
  var m = state.mode;
  pTitleEl.textContent = MODES[m].t;
  pSubEl.textContent = MODES[m].sub;
  panelUpd = null;
  if (m === "basic") { panelEl.classList.remove("show"); pBodyEl.innerHTML = ""; return; }
  panelEl.classList.add("show");
  if (m === "daynight") buildDayPanel();
  else if (m === "timezone") buildTzPanel();
  else if (m === "quiz") buildQuizPanel();
  else if (m === "guide") buildGuidePanel();
}
function setMode(m) {
  var prev = state.mode;
  state.mode = m;
  Array.prototype.forEach.call(document.querySelectorAll("#modes button"), function (b) {
    b.classList.toggle("on", b.dataset.mode === m);
    b.setAttribute("aria-pressed", String(b.dataset.mode === m));
  });
  if (prev === "quiz" && m !== "quiz") {
    state.layers.label = quizSavedLabel;
    syncChips();
    state.quiz.fb = null;
  }
  if (m === "quiz") {
    /* 只在「首次」进入时记下原来的地名开关，否则会把已隐藏的状态当成原状态存回去 */
    if (prev !== "quiz") {
      quizSavedLabel = state.layers.label;
      if (state.layers.label) { state.layers.label = false; syncChips(); }
    }
    setSpin(false);
  }
  if (m === "daynight" || m === "timezone" || m === "guide") setSpin(false);
  if (m === "timezone") {
    state.lon0 = 20 * RAD; state.pitch = 8 * RAD;
    if (state.zoom > 1.05) setZoom(0.92);
  }
  if (m === "basic" || m === "guide") state.anim = null;
  buildPanel();
  dirty = true; pickDirty = true;
}
document.getElementById("modes").addEventListener("click", function (e) {
  var b = e.target.closest("button[data-mode]");
  if (!b) return;
  /* 再点一次当前模式 = 收起面板（toggle 只在按钮上生效，API 调用保持幂等） */
  var m = b.dataset.mode;
  setMode(m !== "basic" && state.mode === m ? "basic" : m);
});
pCloseEl.addEventListener("click", function () { setMode("basic"); });

/* 导出当前画面（做 PPT 用） */
document.getElementById("btnShot").addEventListener("click", function () {
  try {
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "地球仪_" + MODES[state.mode].n + "_" + Date.now() + ".png";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  } catch (err) { /* 少数环境禁用 canvas 导出，静默 */ }
});

/* ------------------------------------------------------------------ *
 * 10. 交互
 * ------------------------------------------------------------------ */
var drag = null;

cv.addEventListener("pointerdown", function (e) {
  cv.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, moved: false };
  cv.classList.add("dragging");
});
cv.addEventListener("pointermove", function (e) {
  var rect = cv.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.inside = true;
  if (drag) {
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    state.lon0 -= dx / view.R;
    state.pitch += dy / view.R;
    var lim = 89.5 * RAD;
    if (state.pitch > lim) state.pitch = lim;
    if (state.pitch < -lim) state.pitch = -lim;
    state.lon0 = ((state.lon0 + Math.PI) % TAU + TAU) % TAU - Math.PI;
    drag.x = e.clientX; drag.y = e.clientY;
    dirty = true; pickDirty = true;
  } else {
    pickDirty = true;
  }
});
cv.addEventListener("pointerup", function (e) {
  cv.classList.remove("dragging");
  if (drag && !drag.moved) {
    var rect = cv.getBoundingClientRect();
    var sxq = e.clientX - rect.left, syq = e.clientY - rect.top;
    if (state.mode === "quiz") {          // 练习模式：点击即作答，不弹信息卡
      buildPick();                        // 先按当前视图重建拾取画布，判定才准
      pickDirty = false;
      var p = pickAt(sxq, syq);
      if (p) answerAt(p);
      drag = null;
      return;
    }
    if (pickDirty) { buildPick(); pickDirty = false; }
    var p = pickAt(sxq, syq);
    var d = describe(p);
    if (d) {
      state.hover = { lat: d.lat, lon: d.lon, ctid: p.ctid, ci: p.ci };
      state.pinned = true;
      showInfo(d, true);
    } else {
      state.pinned = false; state.hover = null;
      infoBox.classList.remove("show", "pinned");
    }
    dirty = true;
  }
  drag = null;
});
cv.addEventListener("pointerleave", function () {
  mouse.inside = false;
  if (!state.pinned) { state.hover = null; infoBox.classList.remove("show"); dirty = true; }
});

cv.addEventListener("wheel", function (e) {
  e.preventDefault();
  setZoom(state.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
}, { passive: false });

/* 触摸双指缩放 */
var pinch = null;
cv.addEventListener("touchstart", function (e) {
  if (e.touches.length === 2) {
    pinch = { d: dist2(e.touches[0], e.touches[1]) };
  }
}, { passive: true });
cv.addEventListener("touchmove", function (e) {
  if (pinch && e.touches.length === 2) {
    e.preventDefault();
    var d = dist2(e.touches[0], e.touches[1]);
    setZoom(state.zoom * (d / pinch.d));
    pinch.d = d;
  }
}, { passive: false });
cv.addEventListener("touchend", function () { pinch = null; }, { passive: true });
function dist2(a, b) { var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY; return Math.hypot(dx, dy); }

/* 键盘 */
window.addEventListener("keydown", function (e) {
  if (e.target && (e.target.matches("input,button,select,textarea") || e.target.isContentEditable)) return;
  var k = e.key;
  if (k === "Enter" && document.activeElement === cv) {
    if (pickDirty) { buildPick(); pickDirty = false; }
    var centerPick = pickAt(view.cx, view.cy);
    var centerInfo = describe(centerPick);
    if (centerInfo) { state.hover = { lat: centerInfo.lat, lon: centerInfo.lon, ctid: centerPick.ctid, ci: centerPick.ci }; state.pinned = true; showInfo(centerInfo, true); }
    e.preventDefault();
  } else if (k === " ") {
    e.preventDefault();
    document.getElementById("btnSpin").click();
  } else if (k === "ArrowLeft") { state.lon0 -= 2 * RAD; dirty = true; e.preventDefault(); }
  else if (k === "ArrowRight") { state.lon0 += 2 * RAD; dirty = true; e.preventDefault(); }
  else if (k === "ArrowUp") { state.pitch = Math.min(89.5 * RAD, state.pitch + 2 * RAD); dirty = true; e.preventDefault(); }
  else if (k === "ArrowDown") { state.pitch = Math.max(-89.5 * RAD, state.pitch - 2 * RAD); dirty = true; e.preventDefault(); }
  else if (k === "+" || k === "=") { setZoom(state.zoom * 1.15); }
  else if (k === "-" || k === "_") { setZoom(state.zoom / 1.15); }
  else if (k === "r" || k === "R") { document.getElementById("btnReset").click(); }
  else if (k === "f" || k === "F") { document.getElementById("btnFull").click(); }
  else if (k === "Escape") {                       // 键盘出口：先收面板，再解锁信息卡
    if (chipsEl.classList.contains("open")) { chipsEl.classList.remove("open"); btnLayers.setAttribute("aria-expanded", "false"); }
    else if (state.mode !== "basic") setMode("basic");
    else if (state.pinned) {
      state.pinned = false; state.hover = null;
      infoBox.classList.remove("show", "pinned");
      dirty = true;
    }
  }
  else if (k === "1") { setMode("basic"); }
  else if (k === "2") { setMode("daynight"); }
  else if (k === "3") { setMode("timezone"); }
  else if (k === "4") { setMode("quiz"); }
  else if (k === "5") { setMode("guide"); }
  else if (k === "n" || k === "N") { if (state.mode === "quiz") nextQuestion(); }
});

/* ------------------------------------------------------------------ *
 * 11. 尺寸 & 主循环
 * ------------------------------------------------------------------ */
function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.w = w; view.h = h; view.dpr = dpr;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + "px"; cv.style.height = h + "px";
  view.cx = w / 2;
  view.cy = h / 2 + (window.innerWidth < 820 ? 0 : 6);
  view.R = Math.min(w * 0.46, h * 0.44) * state.zoom;
  document.body.classList.toggle("narrow", w < 820);
  buildBg();
  dirty = true; pickDirty = true;
}
window.addEventListener("resize", resize);

var lastTs = 0, frame = 0;
function loop(ts) {
  var dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.12) : 0.016;
  lastTs = ts;
  frame++;

  if (state.spinning) { state.lon0 -= SPIN_RATE * dt; dirty = true; }

  /* 教学演示动画：一年 26 秒走完（直射点移动）、一天 22 秒走完（昼夜交替） */
  if (state.anim === "year") {
    state.sun.day += dt * (365 / 26);
    while (state.sun.day > 365) state.sun.day -= 365;
    dirty = true;
  } else if (state.anim === "day") {
    state.sun.utc += dt * (24 / 22);
    while (state.sun.utc >= 24) state.sun.utc -= 24;
    dirty = true;
  }
  if (state.anim && panelUpd && frame % 2 === 0) panelUpd();

  if (dirty) {
    render();
    dirty = false;
  }

  /* 拾取画布任何模式都保持最新（练习模式点击判定依赖它）；仅“非练习”才弹悬停信息卡 */
  var wantPick = mouse.inside && (pickDirty || (state.spinning && frame % 4 === 0));
  if (wantPick && !state.pinned && !drag) {
    buildPick();
    pickDirty = false;
    if (state.mode !== "quiz") {        // 仅“非练习模式”才弹悬停信息卡
      var p = pickAt(mouse.x, mouse.y);
      var d = describe(p);
      if (d) {
        state.hover = { lat: d.lat, lon: d.lon, ctid: p ? p.ctid : 0, ci: p ? p.ci : 0 };
        showInfo(d, false);
        dirty = true;
      } else {
        if (state.hover) { state.hover = null; infoBox.classList.remove("show"); dirty = true; }
      }
    }
  }

  requestAnimationFrame(loop);
}

/* ------------------------------------------------------------------ *
 * 12. 启动
 * ------------------------------------------------------------------ */
buildData();
makeStars();
initElev();
resize();
state.lon0 = 40 * RAD;        // 开局朝向亚欧非（教材常用的“世界中心”视角）
state.pitch = 16 * RAD;
dirty = true;
requestAnimationFrame(loop);

/* 暴露给自检脚本（不影响正常使用） */
window.__globe = {
  state: state, view: view, unproject: unproject, project: projLL,
  pickAt: pickAt, describe: describe, buildPick: buildPick,
  oceanOf: oceanOf, zone5: zone5, tzOf: tzOf, climate: climate,
  render: render, layers: LAYERS, maskSample: sampleMask,
  /* --- 地形高程 --- */
  initElev: initElev, elevOK: function () { return !!ELEV; },
  elevSample: function (lat, lon) {
    var q = sampleElev(lat, lon); if (q == null) return null;
    return { q: q | 0, m: Math.round(qToM(q | 0)) };
  },
  setTerrain: function (v) {
    state.layers.terrain = !!v;
    if (legendEl) legendEl.classList.toggle("show", state.layers.terrain);
    dirty = true;
  },
  /* 自检用：只读暴露离屏地形纹理与球面坐标（验证后保留，便于复测，不影响使用） */
  terrainTex: function () {
    return { cv: _tcv, tres: _tres, tvx: _tvx, tvy: _tvy, tvz: _tvz };
  },
  peaks: function () { return window.GEO_PEAKS ? window.GEO_PEAKS : []; },
  predictColor: function (lat, lon) {
    var q = sampleElev(lat, lon); if (q == null) return null;
    return hypsoColor(qToM(q | 0));
  },
  /* --- A. 昼夜四季 --- */
  sunDecl: sunDecl, sunSubLon: sunSubLon, sunAlt: sunAlt, dayLength: dayLength,
  sunCam: sunCam, terminator: terminator, nearTerm: nearTerm, dayToMD: dayToMD,
  setSun: function (d, u) {
    if (d != null) state.sun.day = d;
    if (u != null) state.sun.utc = u;
    state.anim = null; dirty = true; render();
    if (panelUpd) panelUpd();
  },
  sunNow: function () {
    return { day: state.sun.day, utc: state.sun.utc,
             decl: sunDecl(state.sun.day), lon: sunSubLon(state.sun.utc) };
  },
  /* --- B. 时区对照 --- */
  CITIES: CITIES, cityTime: cityTime,
  cityScreen: function (i) { return window.__globe.llToScreen(CITIES[i].lat, CITIES[i].lon); },
  /* --- C. 课堂练习 --- */
  setMode: setMode, quizPool: pickPool, quizAnswer: answerAt,
  quizNext: nextQuestion, quizReveal: reveal,
  /* 自检用：直接指定题目（按题面文本） */
  quizForce: function (qText) {
    var pool = pickPool();
    for (var i = 0; i < pool.length; i++) {
      if (pool[i].d.q === qText) {
        state.quiz.cur = pool[i]; state.quiz.fb = null;
        renderQuiz(); dirty = true; return true;
      }
    }
    return false;
  },
  quizState: function () {
    var q = state.quiz;
    return { kind: q.kind, ok: q.ok, all: q.all,
             cur: q.cur ? { type: q.cur.type, q: q.cur.d.q, lat: q.cur.d.lat, lon: q.cur.d.lon } : null,
             fb: q.fb ? { ok: q.fb.ok } : null };
  },
  panelText: function () { return pBodyEl.textContent; },
  llToScreen: function (lat, lon) {
    var cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
    return projLL(lat, lon, cp, sp, state.lon0, view.cx, view.cy, view.R);
  },
  /* 经纬度 -> 屏幕命中：返回 { screen, raw, dsc } */
  hitTest: function (lat, lon) {
    buildPick();
    var s = window.__globe.llToScreen(lat, lon);
    if (!s) return { screen: null, raw: null, dsc: null };
    var p = pickAt(s[0], s[1]);
    return { screen: [s[0], s[1]], raw: p, dsc: describe(p) };
  },
  countryNames: function () {
    return COUNTRIES.map(function (c) { return [c.zh, c.cont]; });
  },
  setView: function (lon, pitchDeg, zoom) {
    state.lon0 = lon * RAD; state.pitch = pitchDeg * RAD;
    if (zoom) state.zoom = zoom;
    resize(); dirty = true; render();
  }
};
})();


}
