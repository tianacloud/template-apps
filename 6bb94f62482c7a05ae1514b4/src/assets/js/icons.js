/* 季节食用指南 - 矢量插画生成器
 * 按「食材名称 + 类别」生成唯一的 SVG 食物插画，纯前端、无外部图片依赖。
 */
(function () {
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function hsl(h, s, l) { return 'hsl(' + h + ',' + s + '%,' + l + '%)'; }

  // 各类别色相池
  var HUE = {
    veg:   [110, 95, 130, 80, 145],
    fruit: [4, 28, 45, 340, 300, 12],
    meat:  [10, 20, 35, 0, 30],
    shell: [18, 8, 200, 32],
    fish:  [205, 195, 215, 8, 185],
    snack: [32, 40, 12, 25, 350],
    wild:  [28, 40, 22, 90, 15]
  };

  var T = {};

  /* ---------- 蔬菜 ---------- */
  T.leaf = function (c) {
    return '<path d="M50 88 C28 68 16 44 30 24 C40 10 60 10 70 24 C84 44 72 68 50 88 Z" fill="url(#g)"/>' +
      '<path d="M50 84 L50 18" stroke="' + c.d + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M50 42 L37 32 M50 42 L63 32 M50 58 L34 47 M50 58 L66 47 M50 72 L41 63 M50 72 L59 63" stroke="' + c.d + '" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>' +
      '<ellipse cx="38" cy="34" rx="7" ry="4" fill="#fff" opacity="0.28" transform="rotate(-35 38 34)"/>';
  };
  T.root = function (c) {
    return '<path d="M50 34 C64 44 64 66 54 82 C52 86 48 86 46 82 C36 66 36 44 50 34 Z" fill="url(#g)"/>' +
      '<path d="M50 34 C42 24 33 22 31 15 C40 12 49 19 50 30 Z" fill="' + c.d + '"/>' +
      '<path d="M50 34 C58 24 67 22 69 15 C60 12 51 19 50 30 Z" fill="' + c.d + '" opacity="0.85"/>' +
      '<path d="M50 84 q-5 4 -8 9 M50 84 q5 4 8 9" stroke="' + c.d + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="44" cy="52" rx="5" ry="9" fill="#fff" opacity="0.25"/>';
  };
  T.stalk = function (c) {
    return '<path d="M39 88 C39 58 43 38 50 16 C57 38 61 58 61 88 Z" fill="url(#g)"/>' +
      '<path d="M43 72 Q50 68 57 72 M42 58 Q50 54 58 58 M44 44 Q50 41 56 44 M46 30 Q50 28 54 30" stroke="' + c.d + '" fill="none" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>' +
      '<path d="M50 88 L50 62" stroke="#fff" opacity="0.2" stroke-width="4" stroke-linecap="round"/>';
  };

  /* ---------- 水果 ---------- */
  T.round = function (c) {
    return '<path d="M50 30 C50 22 56 17 64 15" stroke="' + c.d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M53 20 C59 11 71 9 76 15 C68 22 59 24 53 20 Z" fill="' + c.d + '"/>' +
      '<circle cx="50" cy="56" r="27" fill="url(#g)"/>' +
      '<ellipse cx="40" cy="45" rx="9" ry="6" fill="#fff" opacity="0.35" transform="rotate(-32 40 45)"/>';
  };
  T.berry = function (c) {
    return '<circle cx="37" cy="42" r="13" fill="' + c.m + '"/>' +
      '<circle cx="63" cy="42" r="13" fill="' + c.m + '" opacity="0.9"/>' +
      '<circle cx="50" cy="63" r="15" fill="url(#g)"/>' +
      '<circle cx="33" cy="37" r="4" fill="#fff" opacity="0.35"/>' +
      '<circle cx="59" cy="37" r="3.4" fill="#fff" opacity="0.28"/>' +
      '<path d="M50 28 C50 20 56 16 63 15" stroke="' + c.d + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M52 22 C58 14 69 12 74 17 C67 23 58 25 52 22 Z" fill="' + c.d + '"/>';
  };
  T.long = function (c) {
    return '<path d="M26 26 C24 56 44 80 74 74 C82 72 84 64 80 58 C64 66 44 64 38 46 C34 34 34 28 36 24 Z" fill="url(#g)"/>' +
      '<path d="M32 34 C36 52 50 66 68 70" stroke="#fff" opacity="0.28" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="30" cy="26" r="4" fill="' + c.d + '"/>';
  };

  /* ---------- 肉蛋奶 ---------- */
  T.meat = function (c) {
    return '<path d="M26 42 C34 28 64 28 74 40 C80 52 74 74 60 78 C42 84 24 70 26 56 Z" fill="url(#g)"/>' +
      '<path d="M34 48 C45 43 59 45 68 50" stroke="#fff" opacity="0.45" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M37 63 C47 58 59 60 66 65" stroke="#fff" opacity="0.3" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M72 36 C80 30 86 32 84 38 C82 44 76 44 72 40 Z" fill="' + c.d + '" opacity="0.9"/>';
  };
  T.egg = function (c) {
    return '<ellipse cx="50" cy="56" rx="25" ry="31" fill="url(#g)"/>' +
      '<ellipse cx="41" cy="43" rx="7" ry="11" fill="#fff" opacity="0.38" transform="rotate(-22 41 43)"/>' +
      '<path d="M30 66 C38 76 62 76 70 66" stroke="' + c.d + '" stroke-width="2" fill="none" opacity="0.35"/>';
  };
  T.milk = function (c) {
    return '<path d="M33 42 L67 42 L63 80 C63 85 58 87 50 87 C42 87 37 85 37 80 Z" fill="url(#g)"/>' +
      '<rect x="30" y="35" width="40" height="8" rx="4" fill="' + c.d + '"/>' +
      '<path d="M40 35 L40 22 C40 16 48 16 48 22 L48 35" fill="none" stroke="' + c.d + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M38 66 Q50 61 62 66" stroke="#fff" opacity="0.4" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="43" cy="52" rx="4" ry="6" fill="#fff" opacity="0.3"/>';
  };

  /* ---------- 虾蟹贝 ---------- */
  T.shrimp = function (c) {
    return '<path d="M64 28 C84 34 84 62 62 70 C52 74 40 68 42 56 C44 46 54 44 58 52" fill="none" stroke="' + c.m + '" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M43 62 L24 52 L27 68 L40 74 Z" fill="' + c.d + '"/>' +
      '<path d="M64 30 C60 18 52 12 42 13" stroke="' + c.d + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M62 32 C58 22 52 18 46 18" stroke="' + c.d + '" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>' +
      '<circle cx="60" cy="33" r="2.8" fill="#33322e"/>' +
      '<path d="M74 34 L82 44 M78 48 L86 54 M72 58 L80 64" stroke="#fff" opacity="0.35" stroke-width="2.5" stroke-linecap="round"/>';
  };
  T.crab = function (c) {
    return '<path d="M26 50 C15 41 11 30 18 26 C25 22 31 32 31 43" fill="' + c.d + '"/>' +
      '<path d="M74 50 C85 41 89 30 82 26 C75 22 69 32 69 43" fill="' + c.d + '"/>' +
      '<path d="M28 66 L18 78 M37 71 L33 85 M63 71 L67 85 M72 66 L82 78" stroke="' + c.d + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="55" rx="27" ry="21" fill="url(#g)"/>' +
      '<circle cx="42" cy="45" r="3.6" fill="#fff"/><circle cx="42" cy="45" r="1.9" fill="#33322e"/>' +
      '<circle cx="58" cy="45" r="3.6" fill="#fff"/><circle cx="58" cy="45" r="1.9" fill="#33322e"/>' +
      '<path d="M40 64 q10 6 20 0" stroke="' + c.d + '" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>';
  };
  T.clam = function (c) {
    return '<path d="M50 24 C65 24 79 39 79 54 C79 69 66 79 50 79 C34 79 21 69 21 54 C21 39 35 24 50 24 Z" fill="url(#g)"/>' +
      '<path d="M50 79 L50 28 M50 79 L33 35 M50 79 L67 35 M50 79 L24 50 M50 79 L76 50" stroke="' + c.d + '" stroke-width="2" opacity="0.5"/>' +
      '<ellipse cx="40" cy="44" rx="9" ry="6" fill="#fff" opacity="0.28" transform="rotate(-30 40 44)"/>';
  };

  /* ---------- 鱼鲜 ---------- */
  T.fish = function (c) {
    return '<path d="M74 50 L90 37 L85 50 L90 63 Z" fill="' + c.d + '"/>' +
      '<path d="M20 50 C31 33 62 31 76 50 C62 69 31 67 20 50 Z" fill="url(#g)"/>' +
      '<path d="M44 35 C51 27 60 27 63 33" fill="' + c.d + '" opacity="0.85"/>' +
      '<path d="M44 65 C51 73 60 73 63 67" fill="' + c.d + '" opacity="0.7"/>' +
      '<circle cx="33" cy="46" r="4" fill="#fff"/><circle cx="33" cy="46" r="2" fill="#33322e"/>' +
      '<path d="M46 41 q6 9 0 18 M58 41 q6 9 0 18" stroke="#fff" opacity="0.22" fill="none" stroke-width="2.4"/>' +
      '<ellipse cx="45" cy="42" rx="10" ry="6" fill="#fff" opacity="0.18"/>';
  };
  T.squid = function (c) {
    return '<path d="M38 64 C33 77 28 83 21 85 M46 68 C44 82 41 88 36 90 M54 68 C56 82 59 88 64 90 M62 64 C67 77 72 83 79 85" stroke="' + c.m + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M50 18 C67 18 75 33 75 47 C75 60 63 68 50 68 C37 68 25 60 25 47 C25 33 33 18 50 18 Z" fill="url(#g)"/>' +
      '<circle cx="40" cy="43" r="4.6" fill="#fff"/><circle cx="40" cy="43" r="2.3" fill="#33322e"/>' +
      '<circle cx="60" cy="43" r="4.6" fill="#fff"/><circle cx="60" cy="43" r="2.3" fill="#33322e"/>' +
      '<path d="M44 30 q6 8 12 0" stroke="' + c.d + '" stroke-width="2" fill="none" opacity="0.5" stroke-linecap="round"/>';
  };
  T.algae = function (c) {
    return '<path d="M50 16 C34 32 68 46 50 62 C34 78 66 84 52 92" stroke="' + c.m + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="36" cy="38" rx="11" ry="5.5" fill="' + c.d + '" transform="rotate(-32 36 38)"/>' +
      '<ellipse cx="63" cy="56" rx="11" ry="5.5" fill="' + c.d + '" transform="rotate(32 63 56)"/>' +
      '<ellipse cx="38" cy="74" rx="9" ry="5" fill="' + c.d + '" transform="rotate(-25 38 74)" opacity="0.9"/>';
  };

  /* ---------- 小吃 ---------- */
  T.bowl = function (c) {
    return '<path d="M40 30 C35 24 43 19 40 12" stroke="#fff" opacity="0.5" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M54 27 C49 21 57 16 54 9" stroke="#fff" opacity="0.4" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M30 44 C34 35 44 32 50 37 C56 32 66 35 70 44 Z" fill="' + c.l + '"/>' +
      '<path d="M20 46 C20 46 28 76 50 76 C72 76 80 46 80 46 Z" fill="url(#g)"/>' +
      '<ellipse cx="50" cy="46" rx="30" ry="8" fill="' + c.l + '"/>' +
      '<path d="M30 78 L70 78" stroke="' + c.d + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M36 58 q14 6 28 0" stroke="#fff" opacity="0.3" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  };
  T.dumpling = function (c) {
    return '<path d="M20 76 C28 86 72 86 80 76 C70 71 30 71 20 76 Z" fill="' + c.d + '"/>' +
      '<circle cx="50" cy="52" r="27" fill="url(#g)"/>' +
      '<path d="M25 52 C25 36 38 26 50 26 C62 26 75 36 75 52" fill="none" stroke="#fff" opacity="0.25" stroke-width="2.4"/>' +
      '<ellipse cx="40" cy="41" rx="8" ry="5" fill="#fff" opacity="0.32" transform="rotate(-28 40 41)"/>';
  };
  T.pastry = function (c) {
    return '<path d="M50 22 C71 22 81 39 81 55 C81 70 68 79 50 79 C32 79 19 70 19 55 C19 39 29 22 50 22 Z" fill="url(#g)"/>' +
      '<circle cx="50" cy="51" r="13" fill="none" stroke="#fff" opacity="0.32" stroke-width="2.6"/>' +
      '<circle cx="50" cy="51" r="4.5" fill="#fff" opacity="0.35"/>' +
      '<ellipse cx="36" cy="38" rx="8" ry="5" fill="#fff" opacity="0.22" transform="rotate(-30 36 38)"/>' +
      '<path d="M28 70 q22 8 44 0" stroke="' + c.d + '" stroke-width="2" fill="none" opacity="0.4"/>';
  };

  /* ---------- 山珍 ---------- */
  T.mushroom = function (c) {
    return '<path d="M37 56 C37 73 35 82 38 86 L62 86 C65 82 63 73 63 56 Z" fill="' + c.l + '"/>' +
      '<path d="M20 52 C20 32 33 21 50 21 C67 21 80 32 80 52 C80 58 68 60 50 60 C32 60 20 58 20 52 Z" fill="url(#g)"/>' +
      '<ellipse cx="36" cy="38" rx="8" ry="4.5" fill="#fff" opacity="0.3" transform="rotate(-20 36 38)"/>' +
      '<ellipse cx="62" cy="42" rx="6" ry="3.5" fill="#fff" opacity="0.24"/>' +
      '<path d="M42 68 q8 4 16 0" stroke="' + c.d + '" stroke-width="2" fill="none" opacity="0.4"/>';
  };
  T.nut = function (c) {
    return '<path d="M50 20 C67 20 77 37 77 54 C77 73 64 85 50 85 C36 85 23 73 23 54 C23 37 33 20 50 20 Z" fill="url(#g)"/>' +
      '<path d="M50 20 L50 85" stroke="' + c.d + '" stroke-width="2.2" opacity="0.45"/>' +
      '<path d="M50 30 C59 43 59 64 50 76" stroke="' + c.d + '" fill="none" stroke-width="2" opacity="0.35"/>' +
      '<ellipse cx="39" cy="43" rx="6" ry="9" fill="#fff" opacity="0.25"/>' +
      '<path d="M44 18 C48 12 54 12 57 17" stroke="' + c.d + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  };
  T.sprout = function (c) {
    return '<path d="M50 90 L50 44" stroke="' + c.d + '" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M50 46 C37 41 29 31 33 22 C44 23 51 34 50 45 Z" fill="url(#g)"/>' +
      '<path d="M50 46 C63 41 71 31 67 22 C56 23 49 34 50 45 Z" fill="' + c.l + '"/>' +
      '<path d="M40 66 C33 62 29 55 32 49" stroke="' + c.d + '" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>' +
      '<ellipse cx="40" cy="32" rx="5" ry="3" fill="#fff" opacity="0.28" transform="rotate(-30 40 32)"/>';
  };
  T.jar = function (c) {
    return '<rect x="29" y="36" width="42" height="46" rx="9" fill="url(#g)"/>' +
      '<rect x="25" y="24" width="50" height="13" rx="6" fill="' + c.d + '"/>' +
      '<path d="M36 54 C45 49 56 49 65 54" stroke="#fff" opacity="0.32" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M38 68 C46 64 56 64 64 68" stroke="#fff" opacity="0.2" stroke-width="3" fill="none" stroke-linecap="round"/>';
  };

  var TPL = {
    veg:   ['leaf', 'root', 'stalk'],
    fruit: ['round', 'berry', 'long'],
    meat:  ['meat', 'egg', 'milk'],
    shell: ['shrimp', 'crab', 'clam'],
    fish:  ['fish', 'squid', 'algae'],
    snack: ['bowl', 'dumpling', 'pastry'],
    wild:  ['mushroom', 'nut', 'sprout', 'jar']
  };

  window.foodIcon = function (name, cat, size) {
    var h = hashStr(name || '');
    var pool = HUE[cat] || HUE.veg;
    var hue = pool[h % pool.length];
    var c = {
      m: hsl(hue, 62, 56),
      d: hsl((hue + 6) % 360, 58, 38),
      l: hsl(hue, 68, 78)
    };
    var list = TPL[cat] || TPL.veg;
    var tplName = list[(h >>> 4) % list.length];
    var uid = 'g' + (h % 99991) + tplName;
    var body = T[tplName](c);
    var s = size || 96;
    return '<svg class="food-svg" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" role="img" aria-label="' + name + '">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0" stop-color="' + hsl(hue, 72, 72) + '"/>' +
      '<stop offset="0.55" stop-color="' + c.m + '"/>' +
      '<stop offset="1" stop-color="' + c.d + '"/></linearGradient></defs>' +
      '<circle cx="50" cy="52" r="46" fill="' + hsl(hue, 48, 93) + '"/>' +
      '<circle cx="50" cy="52" r="46" fill="none" stroke="' + hsl(hue, 40, 80) + '" stroke-width="1.5"/>' +
      body.replace(/url\(#g\)/g, 'url(#' + uid + ')') +
      '</svg>';
  };

  // 地区小徽标色
  window.regionColor = function (r) {
    var map = { '华北': '#e2703a', '东北': '#4a7fb5', '华东': '#3f9d76', '华中': '#d4a017', '华南': '#c94f7c', '西南': '#8a5cc4', '西北': '#a86b3c', '全国': '#5b8def' };
    return map[r] || '#5b8def';
  };
})();
