/* ===== 宝贝升级乐园 · 第 8 模块：宠物养成 pet.js =====
   8 个品种 · Q 版程序化建模（状态覆盖层 + 灵动动画）· 多宠物
   9 大场景（陪伴/房间/客厅/小院子/公园/学校/医院/海边/商店）
   30 种随机事件（伤病→医院/药箱双出口）· 把戏 · 旅行相册 · 房间装饰
*/
(function () {
  'use strict';
  var $ = APP.$, $$ = APP.$$, esc = APP.esc;
  var S = function () { return APP.state; };
  var H = window.MODULE_HELPERS;
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function P() { return APP.activePet(); }
  function PETS() { return S().pets || []; }
  function breedOf(id) { var b = DATA.breeds().filter(function (x) { return x.id === id; })[0]; return b || DATA.breeds()[0]; }
  function stageIdx(level) { return level >= 9 ? 3 : level >= 6 ? 2 : level >= 3 ? 1 : 0; }
  function needExp(level) { return 20 + level * 15; }

  /* ---------- 状态衰减（健康不被动衰减） ---------- */
  function tick(pet) {
    var now = Date.now();
    if (!pet.lastTick) { pet.lastTick = now; return; }
    var hrs = (now - pet.lastTick) / 3600000;
    if (hrs < 0.02) return;
    hrs = Math.min(hrs, 48);
    var slow = (pet.items || []).indexOf('house') >= 0 ? 0.5 : 1;
    var beach = pet.beachUntil && pet.beachUntil > now ? 0.3 : 1;
    pet.hunger = clamp(pet.hunger - hrs * 4);
    pet.clean = clamp(pet.clean - hrs * 3);
    pet.mood = clamp(pet.mood - hrs * 3 * slow * beach);
    pet.lastTick = now;
  }
  function addExp(pet, n) {
    pet.exp = (pet.exp || 0) + n;
    var up = 0;
    while (pet.exp >= needExp(pet.level)) { pet.exp -= needExp(pet.level); pet.level++; up++; }
    return up;
  }

  /* ===================== Q 版小狗建模 ===================== */
  function bandage(x, y, w, h) {
    return '<g class="bandage"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#FFF7F0" stroke="#E8C9B0" stroke-width="1.5"/>' +
      '<line x1="' + (x + w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + (y + h) + '" stroke="#FF7E7E" stroke-width="2.4"/>' +
      '<line x1="' + x + '" y1="' + (y + h / 2) + '" x2="' + (x + w) + '" y2="' + (y + h / 2) + '" stroke="#FF7E7E" stroke-width="2.4"/></g>';
  }
  function dogSVG(pet, scene) {
    var b = breedOf(pet.breed), si = stageIdx(pet.level), st = DATA.stages()[si];
    var items = pet.items || [], has = function (id) { return items.indexOf(id) >= 0; };
    var asleep = !!pet.asleep, sick = !!pet.sick, injured = pet.injury, dirty = (pet.clean || 100) < 30, hungry = (pet.hunger || 100) < 30;
    var happy = (pet.mood || 100) > 60 && !sick && !injured && !hungry && !dirty && !asleep;
    var body = b.body, ear = b.ear, light = '#FFFFFF', scale = st.scale;
    var headR = [44, 42, 40, 39][si];
    var bodyRx = [48, 54, 60, 65][si], bodyRy = [35, 38, 41, 44][si];
    var legH = b.short ? 12 : [16, 20, 24, 28][si];
    var s = '';
    var cls = 'pet-svg' + (happy ? ' pet-happy' : asleep ? ' pet-sleep' : (sick || injured || hungry || dirty) ? ' pet-sad' : '');
    s += '<svg class="' + cls + '" viewBox="0 0 260 250" width="260" height="250" role="img" aria-label="' + esc(b.name) + '">';
    s += sceneBackdrop(scene, pet);
    s += '<ellipse cx="132" cy="232" rx="' + (78 * scale) + '" ry="11" fill="rgba(90,70,120,.14)"/>';

    // 尾巴
    if (b.curly) s += '<g class="tail"><circle cx="200" cy="126" r="13" fill="' + body + '"/><circle cx="212" cy="112" r="10" fill="' + body + '"/></g>';
    else s += '<g class="tail"><path d="M188 150 C214 144 222 118 210 104 C222 118 218 150 194 162 Z" fill="' + body + '"/></g>';

    // 后腿 / 前腿
    [168, 188].forEach(function (x) { s += '<rect x="' + x + '" y="' + (170 + bodyRy - 42) + '" width="18" height="' + (legH + 28) + '" rx="9" fill="' + ear + '"/>'; });
    [98, 122].forEach(function (x) { s += '<rect x="' + x + '" y="' + (170 + bodyRy - 42) + '" width="18" height="' + (legH + 28) + '" rx="9" fill="' + body + '"/>'; });
    // 脚垫
    [98, 122, 168, 188].forEach(function (x) { s += '<ellipse cx="' + (x + 9) + '" cy="' + (170 + bodyRy - 42 + legH + 26) + '" rx="9" ry="5" fill="#FFC9C0"/>'; });

    // 身体（带呼吸动画）
    s += '<g class="breathe">';
    s += '<ellipse cx="142" cy="162" rx="' + bodyRx + '" ry="' + bodyRy + '" fill="' + body + '"/>';
    if (b.curly) { s += '<circle cx="114" cy="142" r="16" fill="' + body + '"/><circle cx="152" cy="134" r="15" fill="' + body + '"/><circle cx="174" cy="154" r="14" fill="' + body + '"/>'; }
    s += '<ellipse cx="138" cy="178" rx="' + (bodyRx * .6) + '" ry="' + (bodyRy * .5) + '" fill="' + light + '" opacity=".6"/>';
    // 肚子高光
    s += '<ellipse cx="138" cy="172" rx="' + (bodyRx * .42) + '" ry="' + (bodyRy * .34) + '" fill="#fff" opacity=".22"/>';
    s += '</g>';

    // 小窝 / 玩具球（背景道具）
    if (has('house')) s += '<path d="M16 228 L16 178 L54 150 L92 178 L92 228 Z" fill="#F7C6A0"/><path d="M10 180 L54 146 L98 180" stroke="#E08B57" stroke-width="7" fill="none" stroke-linejoin="round"/><ellipse cx="54" cy="214" rx="20" ry="26" fill="#8B5E3C"/>';
    if (has('ball')) s += '<circle cx="224" cy="216" r="15" fill="#8BE0B0" stroke="#4FB585" stroke-width="3"/><path d="M210 216 h28 M224 202 v28" stroke="#4FB585" stroke-width="3"/>';
    if (has('frisbee')) s += '<ellipse cx="40" cy="220" rx="18" ry="7" fill="#FF9E5E" stroke="#E07B3A" stroke-width="2"/>';

    // 头
    var hx = 92, hy = 102;
    if (b.bat) { // 法斗蝙蝠耳
      s += '<path d="M' + (hx - 30) + ' ' + (hy - 18) + ' q-14 -26 -2 -34 q10 8 12 30 Z" fill="' + ear + '"/>';
      s += '<path d="M' + (hx + 30) + ' ' + (hy - 18) + ' q14 -26 2 -34 q-10 8 -12 30 Z" fill="' + ear + '"/>';
    } else if (b.id === 'shiba' || b.id === 'corgi' || b.id === 'husky') {
      s += '<path d="M' + (hx - 34) + ' ' + (hy - 22) + ' L' + (hx - 46) + ' ' + (hy - 64) + ' L' + (hx - 8) + ' ' + (hy - 38) + ' Z" fill="' + ear + '"/>';
      s += '<path d="M' + (hx + 34) + ' ' + (hy - 22) + ' L' + (hx + 46) + ' ' + (hy - 64) + ' L' + (hx + 8) + ' ' + (hy - 38) + ' Z" fill="' + ear + '"/>';
    } else {
      s += '<ellipse cx="' + (hx - 40) + '" cy="' + (hy + 4) + '" rx="15" ry="26" fill="' + ear + '" transform="rotate(-14 ' + (hx - 40) + ' ' + (hy + 4) + ')"/>';
      s += '<ellipse cx="' + (hx + 40) + '" cy="' + (hy + 4) + '" rx="15" ry="26" fill="' + ear + '" transform="rotate(14 ' + (hx + 40) + ' ' + (hy + 4) + ')"/>';
    }
    s += '<circle cx="' + hx + '" cy="' + hy + '" r="' + headR + '" fill="' + body + '"/>';
    if (b.curly) { s += '<circle cx="' + (hx - 26) + '" cy="' + (hy - 26) + '" r="14" fill="' + body + '"/><circle cx="' + (hx + 26) + '" cy="' + (hy - 26) + '" r="14" fill="' + body + '"/><circle cx="' + hx + '" cy="' + (hy - 36) + '" r="15" fill="' + body + '"/>'; }
    if (b.id === 'golden' || b.id === 'shiba' || b.id === 'husky' || b.id === 'samoyed') s += '<ellipse cx="' + hx + '" cy="' + (hy + 18) + '" rx="' + (headR * .62) + '" ry="' + (headR * .5) + '" fill="' + light + '" opacity=".88"/>';

    // 眼睛
    [-16, 16].forEach(function (dx) {
      var ex = hx + dx, ey = hy - 4;
      if (asleep) {
        s += '<path d="M' + (ex - 7) + ' ' + ey + ' q7 6 14 0" stroke="#3B3355" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
      } else {
        s += '<circle cx="' + ex + '" cy="' + ey + '" r="7" fill="#3B3355"/>';
        s += '<circle cx="' + (ex + 2.4) + '" cy="' + (ey - 2.6) + '" r="2.4" fill="#fff"/>';
        if (b.blue) s += '<circle cx="' + (ex - 1) + '" cy="' + (ey + 1) + '" r="1.5" fill="#9FD8FF" opacity=".8"/>';
        if (sick) s += '<path d="M' + (ex - 7) + ' ' + ey + ' q7 5 14 0" stroke="#3B3355" stroke-width="2" fill="none" opacity=".5"/>';
      }
    });
    // 口鼻
    s += '<ellipse cx="' + hx + '" cy="' + (hy + 20) + '" rx="18" ry="13" fill="' + light + '" opacity=".92"/>';
    s += '<ellipse cx="' + hx + '" cy="' + (hy + 13) + '" rx="7" ry="5.4" fill="#3B3355"/>';
    s += '<path d="M' + hx + ' ' + (hy + 18) + ' v5 M' + hx + ' ' + (hy + 23) + ' q-7 6 -12 0 M' + hx + ' ' + (hy + 23) + ' q7 6 12 0" stroke="#3B3355" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    if (happy) s += '<path d="M' + (hx - 6) + ' ' + (hy + 28) + ' q6 11 12 0 Z" fill="#FF8FB1"/>';
    // 腮红
    s += '<ellipse cx="' + (hx - 28) + '" cy="' + (hy + 12) + '" rx="7" ry="4.6" fill="#FF9EC4" opacity="' + (happy ? .6 : .32) + '"/>';
    s += '<ellipse cx="' + (hx + 28) + '" cy="' + (hy + 12) + '" rx="7" ry="4.6" fill="#FF9EC4" opacity="' + (happy ? .6 : .32) + '"/>';
    // 胡须
    s += '<path d="M' + (hx + 14) + ' ' + (hy + 16) + ' l16 -3 M' + (hx + 14) + ' ' + (hy + 20) + ' l16 2" stroke="#C9B9A8" stroke-width="1" opacity=".7"/>';

    // 状态覆盖层
    if (dirty) { s += '<circle cx="' + (hx - 20) + '" cy="' + (hy - 18) + '" r="5" fill="#8B6B43" opacity=".55"/><circle cx="' + (hx + 22) + '" cy="' + (hy - 14) + '" r="4" fill="#8B6B43" opacity=".5"/><ellipse cx="150" cy="178" rx="20" ry="9" fill="#8B6B43" opacity=".4"/>'; }
    if (hungry) { s += '<text x="' + (hx + 30) + '" y="' + (hy - 26) + '" font-size="16">💧</text>'; }
    if (sick) {
      s += '<rect x="70" y="80" width="120" height="120" rx="30" fill="#7BC86C" opacity=".16"/>';
      s += '<text x="196" y="86" font-size="20">🤒</text>';
      s += '<text x="' + (hx - 10) + '" y="' + (hy + 52) + '" font-size="13" opacity=".8">不太舒服…</text>';
    }
    if (injured === 'leg') { s += bandage(182, 196, 26, 11); }
    if (injured === 'paw') { s += bandage(118, 214, 24, 10); }
    if (injured === 'head') { s += bandage(hx - 22, hy - 30, 44, 12); }
    if (asleep) { s += '<text x="200" y="90" font-size="16">💤</text><text x="210" y="78" font-size="13">💤</text>'; }

    // 外观：项圈 / 帽子 / 墨镜(海边) / 生日帽
    if (has('collar')) { s += '<path d="M' + (hx - 32) + ' ' + (hy + 38) + ' q32 16 64 0" stroke="#FF7BAC" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="' + hx + '" cy="' + (hy + 48) + '" r="7" fill="#FFE066" stroke="#E8C43B" stroke-width="2"/>'; }
    if (has('hat')) { s += '<path d="M' + (hx - 32) + ' ' + (hy - headR + 4) + ' h64 v-6 h-15 v-22 h-34 v22 h-15 z" fill="#7B5CD6"/><rect x="' + (hx - 17) + '" y="' + (hy - headR - 16) + '" width="34" height="7" fill="#FFE066"/>'; }
    var onBeach = pet.beachUntil && pet.beachUntil > Date.now();
    if (onBeach) { s += '<rect x="' + (hx - 20) + '" y="' + (hy - 14) + '" width="40" height="10" rx="5" fill="#222" opacity=".7"/><rect x="' + (hx - 16) + '" y="' + (hy - 12) + '" width="32" height="6" rx="3" fill="#FFD24D"/>'; }

    s += '</svg>';
    return s;
  }

  function sceneBackdrop(scene, pet) {
    var s = '';
    if (scene === 'room') {
      s += '<rect x="0" y="150" width="260" height="100" fill="#E9DCC8"/>';
      s += '<rect x="20" y="40" width="80" height="70" rx="8" fill="#BFE3F2" stroke="#9CC7DA"/>';
      s += '<line x1="60" y1="40" x2="60" y2="110" stroke="#9CC7DA" stroke-width="3"/><line x1="20" y1="75" x2="100" y2="75" stroke="#9CC7DA" stroke-width="3"/>';
      s += '<rect x="180" y="170" width="64" height="30" rx="8" fill="#C9A06B"/><rect x="186" y="150" width="52" height="22" rx="6" fill="#E7C79A"/>';
      if ((pet.decor || []).indexOf('bed') >= 0) s += '<rect x="176" y="160" width="72" height="40" rx="10" fill="#FFD9E6"/><rect x="182" y="168" width="60" height="22" rx="8" fill="#FFFBF0"/>';
    } else if (scene === 'living') {
      s += '<rect x="0" y="160" width="260" height="90" fill="#E7E0D2"/>';
      s += '<rect x="30" y="150" width="120" height="60" rx="14" fill="#B7C7E0"/>';
      s += '<rect x="170" y="80" width="70" height="52" rx="6" fill="#3A3A4D"/><rect x="176" y="86" width="58" height="40" rx="3" fill="#7FD0FF"/>';
      if ((pet.decor || []).indexOf('plant') >= 0) s += '<rect x="220" y="150" width="22" height="26" fill="#C8743C"/><circle cx="231" cy="142" r="16" fill="#6Fae5a"/>';
    } else if (scene === 'yard') {
      s += '<rect x="0" y="170" width="260" height="80" fill="#9BD86B"/>';
      s += '<circle cx="40" cy="60" r="30" fill="#8FD07A"/><rect x="36" y="80" width="8" height="40" fill="#8B5E3C"/>';
      s += '<rect x="190" y="150" width="70" height="40" rx="10" fill="#C9A06B"/><path d="M186 150 h78 v-22 h-39 z" fill="#A9D98E"/>';
      s += '<rect x="120" y="120" width="40" height="50" fill="#CFE3F2" opacity=".5"/>';
      if ((pet.decor || []).indexOf('swing') >= 0) s += '<line x1="80" y1="40" x2="80" y2="120" stroke="#9B7A4C" stroke-width="3"/><line x1="120" y1="40" x2="120" y2="120" stroke="#9B7A4C" stroke-width="3"/><rect x="86" y="120" width="28" height="8" rx="4" fill="#FF9E5E"/>';
    } else if (scene === 'park') {
      s += '<rect x="0" y="175" width="260" height="75" fill="#A7DC7C"/>';
      s += '<circle cx="50" cy="70" r="34" fill="#86C96E"/><rect x="46" y="100" width="8" height="40" fill="#8B5E3C"/>';
      s += '<circle cx="215" cy="80" r="30" fill="#86C96E"/><rect x="211" y="108" width="8" height="34" fill="#8B5E3C"/>';
      s += '<rect x="110" y="120" width="56" height="10" rx="5" fill="#C9A06B"/><rect x="116" y="100" width="44" height="22" rx="4" fill="#B7C7E0"/>';
    } else if (scene === 'school') {
      s += '<rect x="0" y="160" width="260" height="90" fill="#F0E6D2"/>';
      s += '<rect x="30" y="40" width="150" height="80" rx="6" fill="#2E6B4F" stroke="#1F4A37" stroke-width="4"/>';
      s += '<text x="105" y="92" font-size="34" text-anchor="middle" fill="#fff">ABC</text>';
      s += '<rect x="200" y="150" width="40" height="30" rx="4" fill="#C98B5A"/>';
    } else if (scene === 'hospital') {
      s += '<rect x="0" y="160" width="260" height="90" fill="#EAF2F8"/>';
      s += '<rect x="40" y="60" width="60" height="60" rx="8" fill="#fff" stroke="#E0E0E0"/><text x="70" y="100" font-size="30" text-anchor="middle" fill="#FF6B6B">+</text>';
      s += '<rect x="160" y="140" width="70" height="40" rx="8" fill="#CFE0EC"/>';
    } else if (scene === 'beach') {
      s += '<rect x="0" y="0" width="260" height="120" fill="#BFEAFF"/>';
      s += '<circle cx="210" cy="44" r="22" fill="#FFD24D"/>';
      s += '<rect x="0" y="120" width="260" height="70" fill="#FFE3A8"/>';
      s += '<path d="M0 120 q65 -16 130 0 t130 0 v20 H0 Z" fill="#7FD0FF" opacity=".9"/>';
      s += '<rect x="180" y="86" width="6" height="40" fill="#9B7A4C"/><path d="M150 86 h60 l-30 -22 z" fill="#FF8E5E"/>';
    } else { // home / 陪伴
      s += '<rect x="0" y="178" width="260" height="72" fill="#F3E7CF"/>';
      s += '<rect x="186" y="150" width="60" height="34" rx="8" fill="#D8B98C"/>';
    }
    return s;
  }

  /* ===================== 模块入口 ===================== */
  APP.registerModule({
    id: 'pet', hash: '/宠物养成', name: '宠物养成', short: '宠物', icon: '🐶', order: 8,
    desc: '用星星养一群可爱的小伙伴',
    render: function (view, params) {
      var scene = params[0] || 'home';
      if (!PETS().length) { adopt(view, false); return; }
      var p = P();
      tick(p); APP.save();
      S().progress.pet.visits = (S().progress.pet.visits || 0) + 1;
      renderScene(view, scene);
    }
  });

  /* ===================== 领养 ===================== */
  function adopt(view, isExtra) {
    var title = isExtra ? '🐶 领养新朋友' : '🐶 领养小宠物';
    var sub = isExtra ? '第二只起需要 50⭐，它会陪你一起长大' : '挑一只喜欢的，它会陪你一起长大';
    var h = H.head(title, sub);
    h += '<div class="note">领养免费！之后的喂食、洗澡、看病要用⭐星星，星星靠学习赚哦～</div>';
    h += '<div class="grid g3" id="breedGrid">';
    DATA.breeds().forEach(function (b) {
      var demo = { breed: b.id, level: 3, exp: 0, hunger: 80, clean: 80, mood: 80, health: 100, items: [], decor: [], tricks: [], album: [], beachUntil: 0, lastTick: Date.now() };
      h += '<div class="card" data-b="' + b.id + '" style="cursor:pointer;text-align:center">' +
        '<div style="transform:scale(.7);transform-origin:center;height:185px;overflow:hidden">' + dogSVG(demo, 'home') + '</div>' +
        '<div style="font-weight:900;font-size:19px">' + esc(b.name) + ' ' + b.emoji + '</div>' +
        '<div><span class="pill p">' + esc(b.trait) + '</span></div>' +
        '<div class="page-sub" style="margin-top:6px">' + esc(b.desc) + '</div>' +
        '<button class="btn primary sm" style="margin-top:10px">选它！</button></div>';
    });
    h += '</div>';
    view.innerHTML = h;
    $$('[data-b]', view).forEach(function (el) {
      el.onclick = function () {
        var b = breedOf(el.dataset.b);
        APP.modal({
          title: '给' + b.name + '起个名字',
          body: '<p class="page-sub">起好名字就可以带它回家啦！</p><input type="text" id="petName" maxlength="8" value="' + esc(b.name + '宝宝') + '" placeholder="最多 8 个字">',
          actions: [
            { label: '再看看', cls: 'ghost' },
            {
              label: isExtra ? '🏠 花50⭐领养' : '🏠 带回家', cls: 'primary', onClick: function (root) {
                if (isExtra && !APP.spendStars(50, '领养新宠物')) return true;
                var nm = ($('#petName', root).value || '').trim() || (b.name + '宝宝');
                var pet = { breed: b.id, name: nm, level: 1, exp: 0, hunger: 70, clean: 70, mood: 80, health: 100, items: [], decor: [], tricks: [], album: [], injured: null, sick: false, cured: 0, adoptedAt: Date.now(), lastTick: Date.now(), lastEvent: 0, lastTreasure: 0, beachUntil: 0, schoolProgress: 0 };
                PETS().push(pet); S().activePet = PETS().length - 1;
                APP.save(true); APP.confetti(46); APP.toast('欢迎 ' + nm + ' 回家！🎉', 'good');
                APP.speak('欢迎' + nm + '回家', 'zh-CN');
                APP.checkBadges(); APP.route();
              }
            }
          ]
        });
      };
    });
  }

  /* ===================== 场景渲染 ===================== */
  function header(view, scene) {
    var stars = '<span class="pill y" style="align-self:center">⭐ ' + S().stars + '</span>';
    var pets = PETS();
    var switcher = '<div class="pet-switch">';
    pets.forEach(function (p, i) {
      var on = i === (S().activePet || 0);
      switcher += '<div class="pet-chip' + (on ? ' on' : '') + '" data-pet="' + i + '" title="' + esc(p.name) + '">' +
        '<div style="transform:scale(.42);transform-origin:center;width:64px;height:64px;margin:-18px 0">' + dogSVG(p, 'home') + '</div>' +
        '<span>' + esc(p.name) + '</span></div>';
    });
    switcher += '<div class="pet-chip add" data-add="1" title="领养新朋友">➕</div></div>';

    var tabs = '<div class="tabs scene-tabs">';
    DATA.petScenes().forEach(function (sc) {
      tabs += '<button class="tab' + (sc.id === scene ? ' active' : '') + '" data-sc="' + sc.id + '">' + sc.ico + (sc.id === 'home' ? ' 陪伴' : sc.name.replace('小', '')) + '</button>';
    });
    tabs += stars + '</div>';
    return switcher + tabs;
  }

  function bindHeader(view, scene) {
    $$('[data-sc]', view).forEach(function (b) { b.onclick = function () { APP.go('/宠物养成/' + b.dataset.sc); }; });
    $$('[data-pet]', view).forEach(function (el) { el.onclick = function () { S().activePet = +el.dataset.pet; APP.route(); }; });
    var add = $('[data-add]', view); if (add) add.onclick = function () { adopt(view, true); };
  }

  function renderScene(view, scene) {
    var p = P();
    var h = H.head('🐶 ' + esc(p.name), breedOf(p.breed).name + ' · ' + DATA.stages()[stageIdx(p.level)].name + ' ' + DATA.stages()[stageIdx(p.level)].emoji + ' · Lv.' + p.level);
    h += header(view, scene);
    view.innerHTML = h;
    bindHeader(view, scene);
    var body = document.createElement('div');
    body.id = 'sceneBody';
    view.appendChild(body);

    if (scene === 'home') sceneHome(body, p);
    else if (scene === 'room') sceneRoom(body, p);
    else if (scene === 'living') sceneLiving(body, p);
    else if (scene === 'yard') sceneYard(body, p);
    else if (scene === 'park') scenePark(body, p);
    else if (scene === 'school') sceneSchool(body, p);
    else if (scene === 'hospital') sceneHospital(body, p);
    else if (scene === 'beach') sceneBeach(body, p);
    else if (scene === 'shop') sceneShop(body, p);

    // 随机事件（除商店/医院外进入时按冷却概率触发）
    if (scene !== 'shop' && scene !== 'hospital' && scene !== 'school') {
      tryEvent(view, scene);
    }
  }

  function stageCard(p) {
    var b = breedOf(p.breed), si = stageIdx(p.level), st = DATA.stages()[si];
    var need = needExp(p.level);
    var warn = [];
    if (p.sick) warn.push('生病了，快去宠物医院 🏥');
    if (p.injury) warn.push('受伤了（' + (p.injury === 'leg' ? '腿' : p.injury === 'paw' ? '爪子' : '头') + '），需要处理 🩹');
    if (!p.sick && !p.injury && p.hunger < 30) warn.push('肚子饿啦，快喂点东西 🥣');
    if (!p.sick && !p.injury && p.clean < 30) warn.push('身上脏兮兮，该洗澡啦 🛁');
    if (!p.sick && !p.injury && p.mood < 30) warn.push('有点无聊，陪我玩会儿 🎾');
    var note = warn.length
      ? '<div class="note" style="margin-top:10px;background:#FFE6F0;border-color:#FF9EC4">' + warn.map(esc).join('<br>') + '</div>'
      : '<div class="note" style="margin-top:10px;background:#EAFBF2;border-color:#8BE0B0">' + esc(p.name) + ' 现在状态不错，正在开心地摇尾巴～</div>';
    var html = '<div class="grid g2" style="align-items:start">';
    html += '<div><div class="pet-stage" id="petStage">' + dogSVG(p, 'home') + '</div>' + note + '</div>';
    html += '<div><div class="card">' +
      statRow('饱食', 'hunger', p.hunger) + statRow('清洁', 'clean', p.clean) +
      statRow('心情', 'mood', p.mood) + statRow('健康', 'health', p.health) +
      statRow('经验', 'exp', Math.round(p.exp / need * 100), p.exp + '/' + need) +
      '<div class="page-sub">成长阶段：' + st.name + '（幼崽 → 幼年 → 少年 → 成年）</div></div>';
    html += '<div class="card" style="margin-top:14px"><h3>🎮 互动</h3><div class="grid g4" style="margin-top:8px">' +
      DATA.petActions().map(function (a) {
        return '<div class="tile" data-act="' + a.id + '"><div style="font-size:26px">' + a.ico + '</div>' +
          '<div style="font-weight:800">' + esc(a.name) + '</div><div class="sm">' + (a.cost ? '⭐ ' + a.cost : '免费') + '</div></div>';
      }).join('') + '</div>' +
      '<p class="page-sub" style="margin-top:10px">有「玩具球/飞盘」陪玩心情更高；「温暖小窝」心情掉得更慢。</p></div>';
    html += '<div class="card" style="margin-top:14px"><h3>🎒 我的物品</h3><div style="font-size:24px;margin-top:6px">' +
      (p.items.length ? p.items.map(function (id) { var it = DATA.shop().filter(function (x) { return x.id === id; })[0]; return it ? '<span title="' + esc(it.name) + '">' + it.ico + '</span> ' : ''; }).join('') : '<span class="page-sub" style="font-size:14px">还没有道具，去商店逛逛吧～</span>') +
      '</div><div class="btn-row" style="margin-top:12px"><button class="btn ghost sm" id="btnRename">✏️ 改名字</button>' +
      '<button class="btn ghost sm" id="btnGoShop">🛒 去商店</button></div></div>';
    html += '</div></div>';
    return html;
  }

  function sceneHome(body, p) {
    body.innerHTML = stageCard(p);
    bindActions(body, p);
    $('#btnGoShop', body).onclick = function () { APP.go('/宠物养成/shop'); };
    $('#btnRename', body).onclick = function () { renameModal(p); };
  }

  function bindActions(root, p) {
    $$('[data-act]', root).forEach(function (el) {
      el.onclick = function () {
        var a = DATA.petActions().filter(function (x) { return x.id === el.dataset.act; })[0];
        if (a.cost > 0 && !APP.spendStars(a.cost, a.name)) return;
        var eff = Object.assign({}, a.effect);
        if (a.id === 'play' && (p.items.indexOf('ball') >= 0 || p.items.indexOf('frisbee') >= 0)) { eff.mood += 8; eff.exp += 4; }
        if (a.id === 'groom' && p.items.indexOf('comb') >= 0) { eff.mood += 2; }
        p.asleep = false;
        var up = applyEffect(p, eff);
        p.lastEvent = p.lastEvent || 0;
        var says = { pet: '汪～好舒服', feed: '呜姆呜姆，真好吃', wash: '哗啦啦，香喷喷', play: '汪汪！再来一次', train: '我学会啦！', groom: '毛毛顺顺的～', water: '咕咚咕咚', walk: '出去玩咯！' };
        APP.toast(p.name + '：' + (says[a.id] || '好耶'), 'good');
        APP.speak(says[a.id] || '好耶', 'zh-CN');
        APP.confetti(12);
        if (up) levelUpMsg(p, up);
        APP.checkBadges(); APP.route();
      };
    });
  }

  function applyEffect(pet, eff) {
    if (eff.hunger) pet.hunger = clamp(pet.hunger + eff.hunger);
    if (eff.clean) pet.clean = clamp(pet.clean + eff.clean);
    if (eff.mood) pet.mood = clamp(pet.mood + eff.mood);
    var up = 0;
    if (eff.exp) up = addExp(pet, eff.exp);
    APP.save();
    return up;
  }

  function renameModal(p) {
    APP.modal({
      title: '给它改个名字', body: '<input type="text" id="rn" maxlength="8" value="' + esc(p.name) + '">',
      actions: [{ label: '取消', cls: 'ghost' }, {
        label: '保存', cls: 'primary', onClick: function (root) {
          var v = ($('#rn', root).value || '').trim(); if (v) { p.name = v; APP.save(true); APP.route(); APP.toast('改好啦 ✅', 'good'); }
        }
      }]
    });
  }

  function levelUpMsg(pet, times) {
    APP.confetti(50);
    APP.modal({
      title: '🎉 升级啦！',
      body: '<div style="text-align:center">' + dogSVG(pet, 'home') + '<h2 style="margin-top:6px">' + esc(pet.name) + ' 升到 Lv.' + pet.level + '</h2>' +
        '<p class="page-sub">当前形态：' + DATA.stages()[stageIdx(pet.level)].name + ' ' + DATA.stages()[stageIdx(pet.level)].emoji + '</p></div>',
      actions: [{ label: '好耶！', cls: 'primary' }]
    });
    APP.speak(pet.name + '升级啦', 'zh-CN');
  }

  /* ---------- 房间 ---------- */
  function sceneRoom(body, p) {
    var decorOn = (p.decor || []).indexOf('bed') >= 0;
    var album = p.album || [];
    var h = '<div class="pet-stage">' + dogSVG(p, 'room') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🛏️ 房间</h3><div class="grid g3" style="margin-top:8px">' +
      tile('sleep', '睡觉', '😴', '免费·恢复') + tile('tidy', '整理', '🧹', '免费·心情+') + tile('album', '相册', '🖼️', album.length + ' 张') + '</div>';
    h += '<p class="page-sub" style="margin-top:8px">' + (decorOn ? '🌟 你买了小床装饰，房间更温馨啦！' : '去商店买「小床装饰」能让房间更漂亮～') + '</p></div>';
    if (album.length) {
      h += '<div class="card" style="margin-top:12px"><h3>🖼️ 旅行相册</h3><div class="page-sub">' + album.map(esc).join(' · ') + '</div></div>';
    }
    body.innerHTML = h;
    bindTile(body, p);
  }
  /* ---------- 客厅 ---------- */
  function sceneLiving(body, p) {
    var decorOn = (p.decor || []).indexOf('plant') >= 0;
    var h = '<div class="pet-stage">' + dogSVG(p, 'living') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🛋️ 客厅</h3><div class="grid g3" style="margin-top:8px">' +
      tile('sit', '陪坐', '🛋️', '免费·心情+') + tile('tv', '看电视', '📺', '免费·心情+') + tile('feedL', '喂食', '🥣', '⭐5') + '</div>';
    h += '<p class="page-sub" style="margin-top:8px">' + (decorOn ? '🌟 绿植让客厅更有生机！' : '去商店买「绿植」装饰客厅～') + '</p></div>';
    body.innerHTML = h;
    bindTile(body, p);
  }
  /* ---------- 小院子 ---------- */
  function sceneYard(body, p) {
    var decorOn = (p.decor || []).indexOf('swing') >= 0;
    var h = '<div class="pet-stage">' + dogSVG(p, 'yard') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🌿 小院子</h3><div class="grid g3" style="margin-top:8px">' +
      tile('walkY', '遛弯', '🌿', '免费·心情+') + tile('toilet', '上厕所', '🚽', '免费·心情+') + tile('dig', '挖宝藏', '⛏️', '碰碰运气') + '</div>';
    h += '<p class="page-sub" style="margin-top:8px">' + (decorOn ? '🌟 秋千是小院子里的快乐源泉！' : '去商店买「院子秋千」装饰院子～') + '</p></div>';
    body.innerHTML = h;
    bindTile(body, p);
  }
  /* ---------- 公园 ---------- */
  function scenePark(body, p) {
    var h = '<div class="pet-stage">' + dogSVG(p, 'park') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🌳 公园</h3><div class="grid g3" style="margin-top:8px">' +
      tile('walkP', '玩飞盘', '🥏', '免费·心情+') + tile('treasure', '捡宝箱', '🎁', '可能得⭐') + tile('event', '逛一逛', '🔍', '看看惊喜') + '</div>' +
      '<p class="page-sub" style="margin-top:8px">公园是偶遇随机事件的好地方，还能捡到宝箱（每天限一次）。</p></div>';
    body.innerHTML = h;
    bindTile(body, p);
  }
  /* ---------- 宠物学校 ---------- */
  function sceneSchool(body, p) {
    var learned = p.tricks || [];
    var all = DATA.petTricks();
    var h = '<div class="pet-stage">' + dogSVG(p, 'school') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🏫 宠物学校</h3>';
    h += '<div class="page-sub">已学会 ' + learned.length + '/' + all.length + ' 个把戏</div><div style="font-size:26px;margin:6px 0">' +
      (learned.length ? learned.map(function (id) { var t = all.filter(function (x) { return x.id === id; })[0]; return t ? t.ico : ''; }).join(' ') : '🐾 还没学会把戏，去上课吧！') + '</div>';
    h += '<div class="grid g3" style="margin-top:6px">' +
      tile('class', '上课', '📚', '⭐12') + tile('perform', '表演', '🎬', '炫炫才艺') + tile('backhome', '回家', '🏠', '回陪伴') + '</div></div>';
    body.innerHTML = h;
    bindTile(body, p);
  }
  /* ---------- 宠物医院 ---------- */
  function sceneHospital(body, p) {
    var h = '<div class="pet-stage">' + dogSVG(p, 'hospital') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🏥 宠物医院</h3>';
    if (p.sick || p.injury) {
      h += '<div class="note" style="background:#FFE6F0;border-color:#FF9EC4">' + (p.sick ? '它生病了，' : '') + (p.injury ? '它受伤了（' + (p.injury === 'leg' ? '腿' : p.injury === 'paw' ? '爪子' : '头') + '），' : '') + '需要治疗哦。</div>';
      h += '<div class="grid g2" style="margin-top:10px">' +
        '<div class="tile" data-doc="hospital"><div style="font-size:26px">🏥</div><div style="font-weight:800">看医生</div><div class="sm">⭐20 治好</div></div>' +
        '<div class="tile" data-doc="med"><div style="font-size:26px">💊</div><div style="font-weight:800">家庭药箱</div><div class="sm">⭐18 平替</div></div></div>';
    } else {
      h += '<div class="note" style="background:#EAFBF2;border-color:#8BE0B0">' + esc(p.name) + ' 很健康，定期来看看就好～</div>';
    }
    h += '</div>';
    body.innerHTML = h;
    $$('[data-doc]', body).forEach(function (el) {
      el.onclick = function () {
        var kind = el.dataset.doc;
        var cost = kind === 'hospital' ? 20 : 18;
        if (!APP.spendStars(cost, '治疗宠物')) return;
        p.health = 100; p.sick = false; p.injury = null; p.mood = clamp(p.mood + 10);
        p.cured = (p.cured || 0) + 1; S().progress.pet.cured = (S().progress.pet.cured || 0) + 1;
        APP.save(); APP.confetti(24); APP.toast('治好啦，' + p.name + ' 活蹦乱跳！', 'good');
        APP.checkBadges(); APP.route();
      };
    });
  }
  /* ---------- 海边 ---------- */
  function sceneBeach(body, p) {
    var hasTravel = p.items.indexOf('travel') >= 0;
    var onBeach = p.beachUntil && p.beachUntil > Date.now();
    var h = '<div class="pet-stage">' + dogSVG(p, 'beach') + '</div>';
    h += '<div class="card" style="margin-top:12px"><h3>🏖️ 海边</h3>';
    if (!hasTravel) {
      h += '<div class="note" style="background:#FFF6D9;border-color:#FFD98A">想去海边度假需要先买「旅行包」（商店 🎒）。</div>';
    } else if (onBeach) {
      var left = Math.ceil((p.beachUntil - Date.now()) / 3600000);
      h += '<div class="note" style="background:#E6F7FF;border-color:#8FD3FF">🌴 正在度假中，还有约 ' + left + ' 小时心情恢复超快！</div>';
      h += '<div class="grid g2" style="margin-top:10px">' + tile('postcard', '收明信片', '📮', '心情+') + tile('backhome', '回家', '🏠', '回陪伴') + '</div>';
    } else {
      h += '<div class="note">花 30⭐ 带它去海边度假 48 小时，期间心情衰减大幅变慢，还会收获旅行相册！</div>';
      h += '<div class="grid g2" style="margin-top:10px"><div class="tile" data-go="beach"><div style="font-size:26px">🏖️</div><div style="font-weight:800">去度假</div><div class="sm">⭐30</div></div>' +
        tile('backhome', '回家', '🏠', '回陪伴') + '</div>';
    }
    h += '</div>';
    body.innerHTML = h;
    var go = $('[data-go="beach"]', body); if (go) go.onclick = function () {
      if (!APP.spendStars(30, '海边度假')) return;
      p.beachUntil = Date.now() + 48 * 3600000; p.mood = clamp(p.mood + 20); p.health = clamp(p.health + 10);
      if ((p.album || []).indexOf('海边旅行 🏖️') < 0) p.album.push('海边旅行 🏖️');
      APP.save(); APP.confetti(30); APP.toast(p.name + ' 在海边玩得超开心！', 'good');
      APP.checkBadges(); APP.route();
    };
    bindTile(body, p);
  }
  /* ---------- 商店 ---------- */
  function sceneShop(body, p) {
    var h = '<div class="grid g2" id="shopList"></div>';
    body.innerHTML = h;
    var host = $('#shopList', body);
    host.innerHTML = DATA.shop().map(function (it) {
      var owned = (it.cat === 'item' || it.cat === 'decor') && p.items.indexOf(it.id) >= 0;
      var tag = it.cat === 'medicine' ? '💊 药品' : it.cat === 'decor' ? '🏠 装饰' : it.cat === 'item' ? '✨ 道具' : '🍖 消耗';
      return '<div class="shop-item"><span class="si-ico">' + it.ico + '</span>' +
        '<div class="si-main"><div class="si-name">' + esc(it.name) + ' <span class="pill" style="font-size:11px">' + tag + '</span></div><div class="si-desc">' + esc(it.desc) + '</div></div>' +
        (owned ? '<span class="owned">已拥有</span>' : '<button class="btn yellow sm" data-buy="' + it.id + '">⭐ ' + it.price + '</button>') + '</div>';
    }).join('');
    $$('[data-buy]', host).forEach(function (btn) {
      btn.onclick = function () {
        var it = DATA.shop().filter(function (x) { return x.id === btn.dataset.buy; })[0];
        if (!APP.spendStars(it.price, '买了' + it.name)) return;
        if (it.cat === 'item' || it.cat === 'decor') p.items.push(it.id);
        if (it.cat === 'decor') (p.decor = p.decor || []).push(it.id);
        if (it.effect) applyEffect(p, it.effect);
        APP.confetti(18);
        APP.checkBadges(); APP.route();
      };
    });
  }

  function tile(id, name, ico, sub) { return '<div class="tile" data-tile="' + id + '"><div style="font-size:26px">' + ico + '</div><div style="font-weight:800">' + name + '</div><div class="sm">' + sub + '</div></div>'; }

  function bindTile(root, p) {
    $$('[data-tile]', root).forEach(function (el) {
      el.onclick = function () { doTile(el.dataset.tile, p, root); };
    });
  }

  function doTile(id, p, root) {
    var rerender = true;
    switch (id) {
      case 'sleep': p.asleep = true; p.mood = clamp(p.mood + 18); addExp(p, 2); APP.toast(p.name + ' 睡了个香喷喷的午觉 😴', 'good'); break;
      case 'tidy': p.mood = clamp(p.mood + 5); APP.toast('房间收拾干净啦', 'good'); break;
      case 'album': APP.toast('相册里有 ' + (p.album || []).length + ' 张回忆～', 'good'); rerender = false; break;
      case 'sit': p.mood = clamp(p.mood + 8); APP.toast(p.name + ' 靠着你好安心', 'good'); break;
      case 'tv': p.mood = clamp(p.mood + 10); APP.toast(p.name + ' 看动画笑哈哈', 'good'); break;
      case 'feedL': if (!APP.spendStars(5, '喂食')) return; p.hunger = clamp(p.hunger + 25); addExp(p, 4); APP.toast(p.name + ' 吃饱啦', 'good'); break;
      case 'walkY': case 'walkP': p.mood = clamp(p.mood + 8); addExp(p, 2); APP.toast(p.name + ' 散步超开心 🌿', 'good'); break;
      case 'toilet': p.mood = clamp(p.mood + 10); APP.toast('解决完，轻松多啦', 'good'); break;
      case 'dig': {
        var ev = DATA.petEvents().filter(function (e) { return e.id === 'e30'; })[0];
        showEvent(root.closest('.view') || document, ev); rerender = false; return;
      }
      case 'treasure': {
        var ev2 = DATA.petEvents().filter(function (e) { return e.id === 'e23'; })[0];
        showEvent(root.closest('.view') || document, ev2); rerender = false; return;
      }
      case 'event': tryEvent(root.closest('.view') || document, 'park', true); rerender = false; return;
      case 'class': {
        if (!APP.spendStars(12, '宠物学校上课')) return;
        var ev3 = DATA.petEvents().filter(function (e) { return e.id === 'e26'; })[0];
        showEvent(root.closest('.view') || document, ev3); rerender = false; return;
      }
      case 'perform': {
        if (!(p.tricks || []).length) { APP.toast('还没学会把戏，先去上课吧', 'warn'); rerender = false; break; }
        APP.confetti(28); APP.toast(p.name + ' 表演了 ' + (p.tricks || []).length + ' 个把戏，全场鼓掌！🎬', 'good'); APP.speak(p.name + '表演真棒', 'zh-CN');
        p.mood = clamp(p.mood + 6); break;
      }
      case 'postcard': {
        if ((p.album || []).indexOf('海边旅行 🏖️') < 0) p.album.push('海边旅行 🏖️');
        p.mood = clamp(p.mood + 15); APP.toast('明信片收进相册啦 📮', 'good'); break;
      }
      case 'backhome': APP.go('/宠物养成/home'); return;
      default: rerender = false;
    }
    if (rerender) { APP.save(); APP.checkBadges(); APP.route(); }
  }

  /* ===================== 随机事件 ===================== */
  function tryEvent(view, scene, force) {
    var p = P();
    var now = Date.now();
    if (!force) {
      if (now - (p.lastEvent || 0) < 6 * 3600 * 1000) return;
      if (Math.random() > 0.35) return;
    }
    var pool = DATA.petEvents().filter(function (e) { return !e.manual && (e.cond === 'any' || e.cond === scene); });
    if (!pool.length) { if (force) APP.toast('这一刻风平浪静～', 'good'); return; }
    var ev = pick(pool);
    p.lastEvent = now; APP.save();
    showEvent(view, ev);
  }

  function showEvent(view, ev) {
    var p = P();
    var text = (ev.text || '').replace(/\{n\}/g, p.name);
    var body = '<div style="text-align:center;font-size:46px">' + ev.ico + '</div>' +
      '<h2 style="text-align:center;margin:6px 0">' + esc(ev.title) + '</h2>' +
      '<p class="page-sub" style="text-align:center">' + esc(text) + '</p>' +
      '<div class="grid g2" id="evChoices" style="margin-top:10px"></div>';
    var md = APP.modal({ title: '✨ 随机事件', body: body, actions: [{ label: '稍后再说', cls: 'ghost' }] });
    var host = md.el.querySelector('#evChoices');
    ev.choices.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (ch.cost ? 'yellow' : 'primary') + ' sm';
      btn.innerHTML = ch.ico + ' ' + esc(ch.label) + (ch.cost ? ' ⭐' + ch.cost : '');
      btn.onclick = function () {
        if (ch.cost && !APP.spendStars(ch.cost, ev.title)) return;
        md.close();
        if (ch.quiz) {
          miniQuiz(p, ch.winEff || {}, ch.loseEff || {}, ch.msg || '搞定！');
        } else {
          applyEventEff(p, ch.eff || {});
          APP.toast((ch.msg || '').replace(/\{n\}/g, p.name), 'good');
          APP.confetti(20);
          APP.checkBadges(); APP.route();
        }
      };
      host.appendChild(btn);
    });
  }

  function applyEventEff(pet, eff) {
    if (eff.hunger) pet.hunger = clamp(pet.hunger + eff.hunger);
    if (eff.clean) pet.clean = clamp(pet.clean + eff.clean);
    if (eff.mood) pet.mood = clamp(pet.mood + eff.mood);
    if (eff.health) pet.health = clamp(pet.health + eff.health);
    if (eff.exp) addExp(pet, eff.exp);
    if (eff.cured) { pet.cured = (pet.cured || 0) + eff.cured; S().progress.pet.cured = (S().progress.pet.cured || 0) + eff.cured; }
    if (eff.injury !== undefined) pet.injury = eff.injury;
    if (eff.sick !== undefined) pet.sick = eff.sick;
    if (eff.beach) pet.beachUntil = Date.now() + 48 * 3600000;
    if (eff.album && (pet.album || []).indexOf(eff.album) < 0) pet.album.push(eff.album);
    if (eff.trick) learnNextTrick(pet);
    if (eff.item && pet.items.indexOf(eff.item) < 0) pet.items.push(eff.item);
    if (eff.gift) grantGift(pet);
    if (eff.treasure) {
      var now = Date.now();
      if (now - (pet.lastTreasure || 0) < 24 * 3600 * 1000) { APP.toast('今天已经捡过宝箱啦～', 'warn'); }
      else { var n = rnd(5, 12); pet.lastTreasure = now; APP.awardStars(n, '公园捡到宝箱'); }
    }
    pet.asleep = false;
    APP.save();
  }

  function learnNextTrick(pet) {
    var learned = pet.tricks || [];
    if (learned.length >= DATA.petTricks().length) return;
    pet.tricks = learned.concat([DATA.petTricks()[learned.length].id]);
  }
  function grantGift(pet) {
    var pool = ['collar', 'hat', 'ball', 'frisbee', 'bone'].filter(function (id) { return pet.items.indexOf(id) < 0; });
    if (pool.length) pet.items.push(pick(pool));
    else pet.mood = clamp(pet.mood + 5);
  }

  /* 迷你学习测验（事件/学校） */
  function makeMiniQuestion() {
    if (Math.random() < 0.5) {
      var a = rnd(2, 9), b = rnd(2, 9), ans = a * b;
      var opts = shuffle([ans, ans + rnd(1, 3), Math.max(1, ans - rnd(1, 3)), ans + rnd(4, 8)]);
      return { q: a + ' × ' + b + ' = ?', opts: opts.map(String), ans: opts.indexOf(ans) };
    }
    var L = [['b', '波'], ['p', '坡'], ['m', '摸'], ['f', '佛'], ['d', '得'], ['t', '特'], ['n', '讷'], ['l', '勒'], ['g', '哥'], ['k', '科'], ['h', '喝']];
    var pl = pick(L);
    var others = shuffle(L.filter(function (x) { return x[0] !== pl[0]; })).slice(0, 3).map(function (x) { return x[0]; });
    var opts2 = shuffle([pl[0]].concat(others));
    return { q: '拼音「' + pl[1] + '」对应哪个字母？', opts: opts2, ans: opts2.indexOf(pl[0]) };
  }
  function miniQuiz(pet, winEff, loseEff, winMsg) {
    var q = makeMiniQuestion();
    var body = '<p class="page-sub">答对就能帮 ' + esc(pet.name) + ' 解决哦～</p>' +
      '<div style="font-size:20px;font-weight:800;margin:10px 0;text-align:center">' + esc(q.q) + '</div>' +
      '<div class="grid g2" id="mq">' + q.opts.map(function (o, i) { return '<button class="btn sm" data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>';
    var md = APP.modal({ title: '📚 小测验', body: body, actions: [{ label: '稍后再说', cls: 'ghost' }] });
    md.el.querySelectorAll('#mq button').forEach(function (b) {
      b.onclick = function () {
        var i = +b.dataset.i; md.close();
        if (i === q.ans) { applyEventEff(pet, winEff); APP.toast(winMsg.replace(/\{n\}/g, pet.name), 'good'); APP.confetti(20); }
        else { applyEventEff(pet, loseEff || {}); APP.toast('答错啦，下次加油～', 'warn'); }
        APP.checkBadges(); APP.route();
      };
    });
  }

  function statRow(name, key, val, text) {
    return '<div class="stat-row"><span class="st-name">' + name + '</span>' +
      '<div class="progress bar-' + key + '"><i style="width:' + clamp(val) + '%"></i></div>' +
      '<span class="st-val">' + (text || clamp(val) + '%') + '</span></div>';
  }
})();
