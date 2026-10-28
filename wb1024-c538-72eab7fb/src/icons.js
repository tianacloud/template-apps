/* 速配一餐 · 手绘食材图标库
 * 统一风格：暖色平涂 + 深褐色圆头描边 + 少量高光，64×64 视箱
 * 用法：foodSVG(id) 返回 <svg> 字符串；没有图标的返回空串（调用方回退到 emoji）
 */
(function () {
  'use strict';

  var O = '#6B4A33';

  function st(w) {
    return 'stroke="' + O + '" stroke-width="' + (w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"';
  }
  function hi(cx, cy, rx, ry, rot, op) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' +
      (op || 0.45) + '"' + (rot ? ' transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"' : '') + '/>';
  }

  /* ── 形状生成器 ── */
  var K = {
    // 一丛叶菜
    leafy: function (s) {
      var a = s.c[0], b = s.c[1] || s.c[0], v = s.v || 1;
      var out = '<path d="M32 57V30" ' + st(3) + '/>';
      if (v === 1) {
        // 阔叶丛：两片大叶抱开 + 中间一片立叶
        out += '<path d="M31 44C18 44 9 34 9 21c14 1 22 10 22 23z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M33 44c13 0 22-10 22-23-14 1-22 10-22 23z" fill="' + b + '" ' + st() + '/>';
        out += '<path d="M32 30C30 18 35 10 44 8c1 12-4 20-12 22z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M30 42c-2-8 2-14 8-16" ' + st(1.4) + ' opacity="0.35"/>';
      } else if (v === 2) {
        // 圆叶菜：叶子更宽，边上有波浪
        out += '<path d="M32 48C17 48 8 38 8 24c0-4 4-7 8-5 10 4 16 13 16 29z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 48c15 0 24-10 24-24 0-4-4-7-8-5-10 4-16 13-16 29z" fill="' + b + '" ' + st() + '/>';
        out += '<path d="M32 34C31 20 36 12 45 11c1 12-4 20-13 23z" fill="' + a + '" ' + st() + '/>';
      } else {
        // 细长叶：三片窄叶向两侧张开
        out += '<path d="M30 46C19 44 11 34 11 21c11 3 18 12 19 25z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M34 46c11-2 19-12 19-25-11 3-18 12-19 25z" fill="' + b + '" ' + st() + '/>';
        out += '<path d="M32 28C32 16 37 8 46 6c0 12-5 20-14 22z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M30 36c-2-7 1-12 6-14" ' + st(1.3) + ' opacity="0.3"/>';
      }
      return out;
    },

    // 花球（西兰花/花菜）
    floret: function (s) {
      var a = s.c[0], b = s.c[1] || a;
      var out = '<path d="M32 58V40" ' + st(3.2) + '/>';
      var buds = [[32, 22, 11], [20, 30, 8], [44, 30, 8], [26, 36, 7], [38, 36, 7]];
      buds.forEach(function (p, i) {
        out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + (i % 2 ? b : a) + '" ' + st() + '/>';
      });
      out += '<circle cx="28" cy="19" r="2" fill="#fff" opacity="0.35"/>';
      return out;
    },

    // 一把长叶菜（韭菜/蒜苔/大葱/芦笋）
    blades: function (s) {
      var a = s.c[0], b = s.c[1] || a;
      var out = '';
      var ang = [-16, -8, 0, 8, 16];
      ang.forEach(function (r, i) {
        out += '<g transform="rotate(' + r + ' 32 56)">';
        out += '<path d="M' + (32 - 4) + ' 56c-1-14 0-26 4-34 4 8 5 20 4 34z" fill="' + (i % 2 ? b : a) + '" ' + st(1.9) + '/>';
        out += '</g>';
      });
      out += '<path d="M24 52h16" ' + st(2.2) + '/>';
      return out;
    },

    // 结球叶菜（白菜/娃娃菜）
    column: function (s) {
      var a = s.c[0], b = s.c[1] || '#F4F7E8';
      var out = '<path d="M32 8c11 4 15 14 15 26 0 12-6 22-15 22S17 46 17 34C17 22 21 12 32 8z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M32 10v44M24 14c-2 12-2 26 0 38M40 14c2 12 2 26 0 38" ' + st(1.6) + ' opacity="0.5"/>';
      out += '<path d="M20 44c8 4 16 4 24 0" ' + st(1.5) + ' opacity="0.4"/>';
      out += '<path d="M26 52h12v6H26z" fill="' + b + '" ' + st(1.8) + '/>';
      return out;
    },

    // 羽状叶（茼蒿/苦菊/茴香/西洋菜）
    feather: function (s) {
      var a = s.c[0], b = s.c[1] || a;
      var out = '<path d="M32 58V14" ' + st(2.6) + '/>';
      for (var i = 0; i < 5; i++) {
        var y = 22 + i * 7, w = 15 - i * 1.6;
        out += '<path d="M31 ' + y + 'c-' + w + '-2-' + (w - 1) + '-6-' + (w - 3) + '-9' + ' 0 4 1 7 3 9z" fill="' +
          (i % 2 ? b : a) + '" ' + st(1.7) + '/>';
        out += '<path d="M33 ' + y + 'c' + w + '-2 ' + (w - 1) + '-6 ' + (w - 3) + '-9' + ' 0 4-1 7-3 9z" fill="' +
          (i % 2 ? a : b) + '" ' + st(1.7) + '/>';
      }
      out += '<path d="M32 14c0-4 2-7 6-8 0 5-2 7-6 8z" fill="' + a + '" ' + st(1.7) + '/>';
      return out;
    },

    // 单枝细叶（香菜/茴香/紫苏/薄荷/香椿）
    sprig: function (s) {
      var a = s.c[0], b = s.c[1] || s.c[0], v = s.v || 1;
      var out = '<path d="M32 56c0-14 1-26 3-36" ' + st(2.2) + '/>';
      var ys = [44, 37, 30, 23];
      for (var i = 0; i < ys.length; i++) {
        var y = ys[i], w = 11 - i * 1.6;
        out += '<path d="M33 ' + y + 'c-' + w + '-1-' + w + '-5-' + (w - 2) + '-8 ' + (w - 3) + ' 2-' + (w - 4) +
          ' 5-' + (w - 2) + ' 8z" fill="' + (i % 2 ? b : a) + '" ' + st(1.9) + '/>';
        out += '<path d="M34 ' + (y - 3) + 'c' + w + '-1 ' + w + '-5 ' + (w - 2) + '-8 -' + (w - 3) + ' 2-' +
          (w - 4) + ' 5-' + (w - 2) + ' 8z" fill="' + (i % 2 ? a : b) + '" ' + st(1.9) + '/>';
      }
      if (v === 2) out += '<circle cx="35" cy="17" r="2.4" fill="' + a + '" ' + st(1.6) + '/>';
      return out;
    },

    // 圆锥根茎（胡萝卜/萝卜）
    root: function (s) {
      var a = s.c[0], b = s.c[1] || '#7FA35C', v = s.v || 1;
      var body = v === 2
        ? '<path d="M24 24c-2 9 1 19 8 26 7-7 10-17 8-26z" fill="' + a + '" ' + st() + '/>'
        : '<path d="M23 24c-1 8 2 17 9 26 7-9 10-18 9-26z" fill="' + a + '" ' + st() + '/>';
      var out = body;
      out += '<path d="M23 24h18" ' + st(1.8) + '/>';
      out += '<path d="M28 34l7 2M27 42l6 2" ' + st(1.6) + '/>';
      out += '<path d="M31 24c-4-6-3-11 1-14 3 4 3 9-1 14z" fill="' + b + '" ' + st(1.9) + '/>';
      out += '<path d="M33 24c4-5 8-6 12-5-2 5-6 8-12 5z" fill="' + b + '" ' + st(1.9) + '/>';
      out += '<path d="M31 24c-5-3-9-3-12-1 2 4 7 6 12 1z" fill="' + b + '" ' + st(1.9) + '/>';
      return out;
    },

    // 长条瓜菜（黄瓜/丝瓜/苦瓜/秋葵）
    longveg: function (s) {
      var a = s.c[0], b = s.c[1] || '#B9D48A', v = s.v || 1;
      var out = '<g transform="rotate(-32 32 32)">';
      out += '<rect x="20" y="16" width="24" height="34" rx="11" fill="' + a + '" ' + st() + '/>';
      if (v === 1) {
        out += '<path d="M28 22v22M36 22v22" ' + st(1.5) + ' opacity="0.55"/>';
        out += '<path d="M32 14v-4" ' + st(2) + '/>';
      } else if (v === 2) {
        out += '<path d="M24 23l8 5M24 33l8 5M24 43l8 5" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" opacity="0.45"/>';
      } else {
        out += '<path d="M32 12c2-3 6-4 8-2-2 3-5 4-8 2z" fill="' + b + '" ' + st(1.7) + '/>';
      }
      out += '</g>';
      out += hi(26, 30, 3, 7, -32, 0.35);
      return out;
    },

    // 茄子
    eggplant: function (s) {
      var a = s.c[0];
      var out = '<path d="M36 20c8 4 12 13 9 21-3 9-13 14-21 10S12 37 16 29c3-7 12-13 20-9z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M35 20c-3-3-3-7-1-9 5 0 9 2 11 6-3 2-6 3-10 3z" fill="#7FA35C" ' + st() + '/>';
      out += '<path d="M37 11V6" ' + st(2.2) + '/>';
      out += hi(26, 32, 3.4, 8, -28, 0.3);
      return out;
    },

    // 青椒类
    pepper: function (s) {
      var a = s.c[0], v = s.v || 1;
      var w = v === 2 ? 0.84 : 1;
      var out = '<g transform="translate(32 36) scale(' + w + ' 1) translate(-32 -36)">';
      out += '<path d="M20 30c0-5 4-8 12-8s12 3 12 8c0 4-2 6-3 9 2 2 2 5 1 8-2 5-6 8-10 8s-8-3-10-8c-1-3-1-6 1-8-1-3-3-5-3-9z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M32 22c-1 8-1 18 0 33" ' + st(1.4) + ' opacity="0.4"/>';
      out += '<path d="M28 22c-1-5 0-8 4-10" ' + st(2.4) + '/>';
      out += '<path d="M33 13c3-2 6-2 8 0-2 3-5 3-8 0z" fill="#7FA35C" ' + st(1.8) + '/>';
      out += '</g>';
      out += hi(23, 30, 2.6, 5, -18, 0.4);
      return out;
    },

    // 辣椒
    chili: function (s) {
      var a = s.c[0];
      var out = '<path d="M27 16c7 3 13 11 13 21 0 9-4 15-9 14-6-1-8-9-7-18 1-8 2-13 3-17z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M27 16c-4-2-7-2-9 1 3 3 6 4 9 1z" fill="#6E9E4F" ' + st(1.9) + '/>';
      out += '<path d="M25 12l-4-3" ' + st(2.2) + '/>';
      out += '<path d="M33 26c1 8 1 17-1 22" ' + st(1.3) + ' opacity="0.35"/>';
      out += hi(28, 26, 2, 5, -6, 0.4);
      return out;
    },

    // 圆形果菜（番茄/苹果/土豆）
    round: function (s) {
      var a = s.c[0], b = s.c[1] || '#6E9E4F', v = s.v || 1;
      var out = '<ellipse cx="32" cy="36" rx="17" ry="15.5" fill="' + a + '" ' + st() + '/>';
      if (v === 1) {
        out += '<path d="M32 22c-3-4-2-8 1-9 2 3 1 7-1 9z" fill="' + b + '" ' + st(1.9) + '/>';
        out += '<path d="M32 22c3-4 7-5 10-4-1 4-5 6-10 4z" fill="' + b + '" ' + st(1.9) + '/>';
        out += '<path d="M32 22c-4-2-8-2-10 0 2 3 7 4 10 0z" fill="' + b + '" ' + st(1.9) + '/>';
      } else if (v === 2) {
        out += '<path d="M32 22v-6" ' + st(2.2) + '/>';
        out += '<path d="M32 21c-5-3-9-2-11 1 3 3 8 3 11-1z" fill="' + b + '" ' + st(1.8) + '/>';
      } else {
        out += '<circle cx="27" cy="33" r="1.8" fill="' + O + '" opacity="0.5"/>';
        out += '<circle cx="37" cy="39" r="1.8" fill="' + O + '" opacity="0.5"/>';
        out += '<circle cx="33" cy="29" r="1.4" fill="' + O + '" opacity="0.4"/>';
      }
      out += hi(25, 30, 4, 2.6, -22, 0.5);
      return out;
    },

    // 南瓜
    pumpkin: function (s) {
      var a = s.c[0], b = s.c[1] || '#C9742F';
      var out = '<ellipse cx="32" cy="38" rx="19" ry="14" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M22 26c-4 4-5 12-2 18M42 26c4 4 5 12 2 18M32 24v28" ' + st(1.6) + ' opacity="0.55"/>';
      out += '<path d="M32 24c0-4 1-7 4-9" ' + st(2.4) + '/>';
      out += '<path d="M36 15c3-1 5 0 6 2-2 2-5 1-6-2z" fill="#7FA35C" ' + st(1.7) + '/>';
      out += hi(23, 33, 4, 2.4, -18, 0.4);
      return out;
    },

    // 长根茎（红薯/紫薯/山药）
    squash: function (s) {
      var a = s.c[0], b = s.c[1] || a;
      var out = '<g transform="rotate(-35 32 32)">';
      out += '<path d="M22 20c4-4 12-4 16 0 5 5 5 18 0 25-4 5-12 5-16 0-5-7-5-20 0-25z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M32 22v22" ' + st(1.5) + ' opacity="0.35"/>';
      out += '<path d="M31 20c-1-4 1-7 4-8 1 4-1 7-4 8z" fill="' + b + '" ' + st(1.7) + '/>';
      out += '</g>';
      out += hi(26, 30, 2.6, 6, -35, 0.35);
      return out;
    },

    // 洋葱 / 芋头一类球茎
    bulb: function (s) {
      var a = s.c[0], b = s.c[1] || '#E6D9C4';
      var out = '<path d="M32 20c9 2 15 9 15 17 0 9-7 14-15 14s-15-5-15-14c0-8 6-15 15-17z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M32 21c-4 6-5 18-2 28M32 21c4 6 5 18 2 28" ' + st(1.5) + ' opacity="0.45"/>';
      out += '<path d="M32 20c-1-4 0-7 3-9 1 4 0 7-3 9z" fill="' + b + '" ' + st(1.8) + '/>';
      out += hi(25, 30, 3, 2.4, -25, 0.45);
      return out;
    },

    // 玉米
    corn: function (s) {
      var a = s.c[0], b = s.c[1] || '#7FA35C';
      var out = '<path d="M24 42c-4-6-4-16 0-22 5-7 11-5 14 2 3 7 3 15-1 20-4 5-10 4-13 0z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M27 24v18M32 22v22M37 24v18" ' + st(1.3) + ' opacity="0.5"/>';
      out += '<path d="M24 44c-4 2-8 0-9-4 4-2 8-1 9 4z" fill="' + b + '" ' + st(1.7) + '/>';
      out += '<path d="M40 44c4 2 8 0 9-4-4-2-8-1-9 4z" fill="' + b + '" ' + st(1.7) + '/>';
      return out;
    },

    // 豆荚（荷兰豆/豌豆/毛豆）
    pod: function (s) {
      var a = s.c[0], b = '#F4EFDC';
      var out = '<g transform="rotate(-28 32 32)">';
      out += '<path d="M32 14c7 3 11 12 9 22-2 8-7 13-9 13s-7-5-9-13c-2-10 2-19 9-22z" fill="' + a + '" ' + st() + '/>';
      out += '<circle cx="32" cy="24" r="3" fill="' + b + '" ' + st(1.5) + '/>';
      out += '<circle cx="31" cy="33" r="3" fill="' + b + '" ' + st(1.5) + '/>';
      out += '<circle cx="32" cy="42" r="3" fill="' + b + '" ' + st(1.5) + '/>';
      out += '</g>';
      return out;
    },

    // 豆粒一堆
    beans: function (s) {
      var a = s.c[0];
      var out = '';
      var pts = [[26, 28, -18], [38, 30, 14], [27, 41, 22], [39, 43, -10], [32, 34, 0]];
      pts.forEach(function (p, i) {
        out += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="6" ry="4.6" fill="' + (i === 4 ? '#F2EBD8' : a) + '" ' + st(1.9) +
          ' transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"/>';
      });
      return out;
    },

    // 蘑菇
    mushroom: function (s) {
      var a = s.c[0], b = s.c[1] || '#F0E6D2';
      var out = '<path d="M14 32c0-10 8-17 18-17s18 7 18 17z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M26 32c0 8-1 14-3 18 4 2 14 2 18 0-2-4-3-10-3-18z" fill="' + b + '" ' + st() + '/>';
      out += '<path d="M22 27c1-3 4-4 6-3M34 24c3-1 5 1 6 3" ' + st(1.4) + ' opacity="0.6"/>';
      return out;
    },

    // 海带 / 紫菜片
    sheet: function (s) {
      var a = s.c[0];
      var out = '<path d="M18 16h26c2 0 3 2 2 4-4 8-4 12 0 20 1 2 0 4-2 4H18c-2 0-3-2-2-4 4-8 4-12 0-20-1-2 0-4 2-4z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M24 22c2 6 2 14 0 20M32 22c2 6 2 14 0 20M40 22c2 6 2 14 0 20" ' + st(1.4) + ' opacity="0.45"/>';
      return out;
    },

    // 鱼
    fish: function (s) {
      var a = s.c[0], b = s.c[1] || '#9AB6C4';
      var out = '<path d="M14 34c6-8 16-12 24-10 5 1 8 4 9 8l7-6c1-1 2 0 2 2l-1 8c0 2 0 3 1 5 1 2 0 3-2 2l-7-5c-1 5-5 8-10 9-8 2-17-2-23-9z" fill="' + a + '" ' + st() + '/>';
      out += '<circle cx="23" cy="30" r="2.2" fill="' + O + '"/>';
      out += '<path d="M27 26c4 3 5 7 5 11" ' + st(1.6) + ' opacity="0.6"/>';
      out += hi(22, 27, 4, 2, -20, 0.35);
      return out;
    },

    // 贝类（花蛤/扇贝/生蚝/蛏子）
    shell: function (s) {
      var a = s.c[0], b = s.c[1] || '#E8D9C0', v = s.v || 1;
      var out = '';
      if (v === 2) {
        out += '<path d="M16 44c0-14 6-24 16-26 10 2 16 12 16 26z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 20v24M24 22c-2 7-3 14-3 22M40 22c2 7 3 14 3 22" ' + st(1.5) + ' opacity="0.5"/>';
      } else {
        out += '<path d="M18 40c-3-12 4-22 14-22s17 10 14 22c-3 6-25 6-28 0z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 18v22M24 20c-3 6-4 14-3 20M40 20c3 6 4 14 3 20" ' + st(1.5) + ' opacity="0.5"/>';
        out += '<path d="M18 42h28" ' + st(1.8) + '/>';
      }
      out += hi(26, 30, 4, 2, -30, 0.35);
      return out;
    },

    // 虾
    shrimp: function (s) {
      var a = s.c[0];
      var out = '<path d="M40 20c-8-4-18 0-21 8-3 9 4 17 13 17 7 0 12-4 14-9l7 3c2 1 3-1 2-3l-4-6c-1-2-1-4 0-6l3-5c1-2-1-3-3-2l-6 3z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M27 26c4 4 5 10 3 16M34 24c4 4 5 10 4 16" ' + st(1.4) + ' opacity="0.55"/>';
      out += '<circle cx="24" cy="27" r="2" fill="' + O + '"/>';
      return out;
    },

    // 螃蟹
    crab: function (s) {
      var a = s.c[0];
      var out = '<path d="M18 30c0-7 6-12 14-12s14 5 14 12c0 7-6 12-14 12s-14-5-14-12z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M18 28c-5-3-8-2-10 1 3 3 7 3 10-1zM46 28c5-3 8-2 10 1-3 3-7 3-10-1z" fill="' + a + '" ' + st(1.8) + '/>';
      out += '<path d="M20 40l-6 8M26 43l-4 8M44 40l6 8M38 43l4 8" ' + st(1.9) + '/>';
      out += '<circle cx="27" cy="27" r="2" fill="' + O + '"/><circle cx="37" cy="27" r="2" fill="' + O + '"/>';
      out += '<path d="M27 34c3 2 7 2 10 0" ' + st(1.6) + '/>';
      return out;
    },

    // 鱿鱼
    squid: function (s) {
      var a = s.c[0];
      var out = '<path d="M20 14h24c2 0 3 2 2 4l-4 14c-1 3-4 5-8 5h-4c-4 0-7-2-8-5L18 18c-1-2 0-4 2-4z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M28 37v10M32 37v12M36 37v10M24 37l-3 9M40 37l3 9" ' + st(1.9) + '/>';
      out += '<circle cx="27" cy="22" r="1.8" fill="' + O + '"/><circle cx="37" cy="22" r="1.8" fill="' + O + '"/>';
      return out;
    },

    // 肉片 / 牛排
    meat: function (s) {
      var a = s.c[0], b = s.c[1] || '#F0C8B4';
      var out = '<path d="M16 34c-2-8 4-15 13-16 10-1 19 4 19 12s-7 15-17 15c-8 0-13-4-15-11z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M22 30c5 2 12 2 18-1M21 37c6 3 15 3 20-1" ' + st(1.5) + ' opacity="0.55"/>';
      out += '<ellipse cx="38" cy="30" rx="4" ry="3" fill="' + b + '" opacity="0.8"/>';
      out += hi(24, 26, 4, 2, -18, 0.3);
      return out;
    },

    // 带层次的五花 / 牛腩
    layered: function (s) {
      var a = s.c[0], b = s.c[1] || '#F4D8C6';
      var out = '<g transform="rotate(-9 32 34)">';
      out += '<path d="M14 26c6-5 30-5 36 0 3 3 3 14 0 17-6 5-30 5-36 0-3-3-3-14 0-17z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M15 32c8 2 26 2 34 0" stroke="' + b + '" stroke-width="4.6" stroke-linecap="round" fill="none"/>';
      out += '<path d="M15 39c8 2 26 2 34 0" stroke="' + b + '" stroke-width="4.6" stroke-linecap="round" fill="none"/>';
      out += '<path d="M15 32c8 2 26 2 34 0" ' + st(1.1) + ' opacity="0.35"/>';
      out += '<path d="M15 39c8 2 26 2 34 0" ' + st(1.1) + ' opacity="0.35"/>';
      out += '</g>';
      return out;
    },

    // 鸡腿 / 鸡翅
    drumstick: function (s) {
      var a = s.c[0];
      var out = '<path d="M40 16c6 4 7 13 2 18-4 4-10 4-13 1l-9 10c-2 2-5 0-4-3l7-11c-3-4-1-10 4-13 4-3 10-4 13-2z" fill="' + a + '" ' + st() + '/>';
      out += '<circle cx="17" cy="47" r="4.4" fill="#F4EAD5" ' + st(1.9) + '/>';
      out += hi(38, 22, 3, 5, -30, 0.35);
      return out;
    },

    // 整鸡
    bird: function (s) {
      var a = s.c[0];
      var out = '<path d="M20 44c-6-8-4-20 6-24 9-4 19 1 21 10 1 5-1 10-5 13-6 5-16 5-22 1z" fill="' + a + '" ' + st() + '/>';
      out += '<circle cx="26" cy="22" r="7" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M21 17l-3-4 5 1z" fill="' + a + '" ' + st(1.7) + '/>';
      out += '<circle cx="24" cy="21" r="1.6" fill="' + O + '"/>';
      out += '<path d="M44 32c4-2 7 0 8 3-3 2-6 1-8-3z" fill="' + a + '" ' + st(1.8) + '/>';
      out += '<path d="M26 44l-2 8M40 44l2 8" ' + st(1.9) + '/>';
      return out;
    },

    // 蛋
    egg: function (s) {
      var a = s.c[0], y = s.c[1] || null, v = s.v || 1;
      var out = '<path d="M32 12c8 0 15 14 15 22 0 9-6 15-15 15s-15-6-15-15c0-8 7-22 15-22z" fill="' + a + '" ' + st() + '/>';
      if (y) out += '<ellipse cx="32" cy="36" rx="7" ry="6" fill="' + y + '" opacity="0.9"/>';
      if (v === 2) {
        out += '<circle cx="27" cy="26" r="1.6" fill="' + O + '" opacity="0.5"/><circle cx="37" cy="32" r="1.4" fill="' + O + '" opacity="0.5"/><circle cx="31" cy="42" r="1.5" fill="' + O + '" opacity="0.45"/>';
      }
      out += hi(26, 26, 3, 5, -20, 0.5);
      return out;
    },

    // 豆腐 / 豆干 / 魔芋块
    cube: function (s) {
      var a = s.c[0], b = s.c[1] || '#FFFCF4';
      var out = '<path d="M16 26l16-8 16 8v16l-16 8-16-8z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M16 26l16 8 16-8M32 34v16" fill="none" ' + st(1.8) + '/>';
      out += '<path d="M32 18l16 8-16 8-16-8z" fill="' + b + '" ' + st(1.6) + '/>';
      return out;
    },

    // 面碗 / 面饼 / 盘绕粉丝
    noodles: function (s) {
      var a = s.c[0], b = s.c[1] || '#F6F1E4', v = s.v || 1;
      var out = '';
      if (v === 2) {
        out += '<ellipse cx="32" cy="38" rx="17" ry="12" fill="' + b + '" ' + st() + '/>';
        out += '<path d="M20 38c0-4 5-7 12-7s12 3 12 7-5 7-12 7-12-3-12-7z" fill="none" stroke="' + a + '" stroke-width="2.6"/>';
        out += '<path d="M25 36c2-2 5-3 8-3s6 1 8 3" fill="none" stroke="' + a + '" stroke-width="2.2"/>';
        out += '<path d="M33 27l6-9" ' + st(2) + '/>';
        return out;
      }
      if (v === 3) {
        out += '<path d="M14 44c4-8 12-13 22-13s16 4 18 9c-4 5-12 8-22 8s-16-1-18-4z" fill="' + b + '" ' + st() + '/>';
        out += '<path d="M18 40c4-4 10-6 16-6s12 2 15 5" fill="none" stroke="' + a + '" stroke-width="2.4"/>';
        out += '<path d="M22 34c3-3 7-4 11-4s8 1 11 3" fill="none" stroke="' + a + '" stroke-width="2"/>';
        return out;
      }
      out += '<path d="M12 32h40c0 12-9 20-20 20S12 44 12 32z" fill="' + b + '" ' + st() + '/>';
      out += '<path d="M8 32h48" ' + st(2.4) + '/>';
      out += '<path d="M18 26c4-4 10-4 14 0M32 26c4-4 10-4 14 0M22 20c4-3 8-3 12 0" stroke="' + a + '" stroke-width="3" stroke-linecap="round"/>';
      out += '<path d="M20 40c4 2 8 2 12 0M32 40c4 2 8 2 12 0" ' + st(1.4) + ' opacity="0.35"/>';
      return out;
    },

    // 方便面饼
    instantblock: function (s) {
      var a = s.c[0];
      var out = '<path d="M14 26h36c2 0 3 2 2 4l-3 18c-1 4-4 6-8 6H23c-4 0-7-2-8-6l-3-18c-1-2 0-4 2-4z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M18 34c4-2 8 2 12 0s8 2 12 0M18 41c4-2 8 2 12 0s8 2 12 0" fill="none" stroke="' + O + '" stroke-width="1.8" opacity="0.5"/>';
      out += '<path d="M14 26c6-4 30-4 36 0" fill="none" ' + st(2) + '/>';
      return out;
    },

    // 年糕片叠起来
    cakeStack: function (s) {
      var a = s.c[0], b = s.c[1] || '#FFFFFF';
      var out = '';
      [[38, 10], [32, 12], [26, 14]].forEach(function (p, i) {
        out += '<ellipse cx="32" cy="' + p[0] + '" rx="' + p[1] + '" ry="5" fill="' + (i % 2 ? b : a) + '" ' + st() + '/>';
      });
      out += '<ellipse cx="32" cy="26" rx="14" ry="5" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M24 22c2-1 4-1 6 0" ' + st(1.2) + ' opacity="0.4"/>';
      return out;
    },

    // 饭碗
    ricebowl: function (s) {
      var a = s.c[0], b = s.c[1] || '#F6F1E4';
      var out = '<path d="M12 32h40c0 12-9 20-20 20S12 44 12 32z" fill="' + b + '" ' + st() + '/>';
      out += '<path d="M14 30c2-6 8-10 18-10s16 4 18 10z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M8 32h48" ' + st(2.4) + '/>';
      out += '<path d="M24 24l1 3M33 21l1 4M40 25l-1 3" ' + st(1.3) + ' opacity="0.5"/>';
      return out;
    },

    // 杂粮一堆
    grains: function (s) {
      var a = s.c[0];
      var out = '<path d="M12 44c2-13 10-22 20-22s18 9 20 22z" fill="' + a + '" ' + st() + '/>';
      var pts = [[22, 37], [30, 32], [38, 36], [26, 42], [35, 43]];
      pts.forEach(function (p, i) {
        out += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="3.4" ry="2.4" fill="#fff" opacity="0.' + (i % 2 ? 45 : 30) + '"/>';
      });
      return out;
    },

    // 花生
    peanut: function (s) {
      var a = s.c[0];
      var out = '<path d="M26 40c-6 0-10-5-10-10 0-4 3-7 6-7 3 0 5 2 6 5" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M28 28c1-7 6-12 11-11 5 1 8 6 7 12-1 6-5 10-10 10-4 0-7-2-8-5" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M24 31c2 1 4 0 5-2" ' + st(1.4) + ' opacity="0.5"/>';
      return out;
    },

    // 板栗 / 核桃
    nut: function (s) {
      var a = s.c[0], v = s.v || 1;
      var out = '';
      if (v === 2) {
        out += '<circle cx="32" cy="33" r="14" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 19v28M20 33h24M25 24c4 6 4 12 0 18M39 24c-4 6-4 12 0 18" ' + st(1.4) + ' opacity="0.5"/>';
      } else {
        out += '<path d="M18 40c-2-9 5-16 14-16s16 7 14 16c-1 5-6 8-14 8s-13-3-14-8z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 24c-2-4-1-7 2-8 2 3 1 6-2 8z" fill="#9A7A4A" ' + st(1.7) + '/>';
        out += '<path d="M26 34c4 2 8 2 12 0" ' + st(1.3) + ' opacity="0.45"/>';
      }
      return out;
    },

    // 面包 / 吐司 / 油条 / 饼
    bread: function (s) {
      var a = s.c[0], v = s.v || 1, out = '';
      if (v === 2) {
        out += '<path d="M18 26c0-8 6-13 14-13s14 5 14 13v18c0 3-2 5-5 5H23c-3 0-5-2-5-5z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M18 28h28" ' + st(1.6) + '/>';
        out += '<path d="M25 34h5M34 34h5M25 42h5M34 42h5" ' + st(1.4) + ' opacity="0.45"/>';
      } else if (v === 3) {
        out += '<g transform="rotate(-30 32 32)"><rect x="24" y="10" width="16" height="44" rx="8" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M32 14v36" ' + st(1.5) + ' opacity="0.4"/></g>';
      } else {
        out += '<path d="M14 36c-2-9 5-17 18-17s20 8 18 17c-1 6-8 9-18 9s-17-3-18-9z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M22 30c3-2 6-2 9 0M33 30c3-2 6-2 9 0" ' + st(1.4) + ' opacity="0.45"/>';
      }
      return out;
    },

    // 饺子 / 馄饨 / 春卷
    dumpling: function (s) {
      var a = s.c[0], v = s.v || 1, out = '';
      if (v === 2) {
        out += '<g transform="rotate(-25 32 32)"><rect x="16" y="14" width="26" height="38" rx="6" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M22 22l14 22" ' + st(1.4) + ' opacity="0.4"/></g>';
      } else {
        out += '<path d="M14 40c0-12 8-20 18-20s18 8 18 20c0 2-2 4-4 4H18c-2 0-4-2-4-4z" fill="' + a + '" ' + st() + '/>';
        out += '<path d="M20 30c2 4 3 8 3 12M26 26c2 4 3 10 3 16M32 25c0 5 0 11 0 17M38 26c-2 4-3 10-3 16M44 30c-2 4-3 8-3 12" ' + st(1.3) + ' opacity="0.45"/>';
      }
      return out;
    },

    // 面粉袋
    bag: function (s) {
      var a = s.c[0];
      var out = '<path d="M20 22h24l-3 26c0 2-2 4-4 4H27c-2 0-4-2-4-4z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M20 22c4 3 20 3 24 0M22 18h20v5H22z" fill="#F6F1E4" ' + st(1.8) + '/>';
      out += '<path d="M28 34h8M29 40h6" ' + st(1.4) + ' opacity="0.45"/>';
      return out;
    },

    // 牛奶盒
    carton: function (s) {
      var a = s.c[0];
      var out = '<path d="M22 20l10-8 10 8v28c0 2-2 4-4 4H26c-2 0-4-2-4-4z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M22 20l10 8 10-8" fill="none" ' + st(1.8) + '/>';
      out += '<path d="M27 34h10v10H27z" fill="#DCE9F2" ' + st(1.5) + '/>';
      return out;
    },

    // 莲藕
    lotus: function (s) {
      var a = s.c[0];
      var out = '<ellipse cx="32" cy="34" rx="17" ry="15" fill="' + a + '" ' + st() + '/>';
      var holes = [[26, 28, 3], [37, 30, 3.2], [27, 40, 3], [38, 40, 2.8], [32, 34, 3.6]];
      holes.forEach(function (h) {
        out += '<circle cx="' + h[0] + '" cy="' + h[1] + '" r="' + h[2] + '" fill="#FBF4E9" ' + st(1.5) + '/>';
      });
      return out;
    },

    // 竹笋
    shoot: function (s) {
      var a = s.c[0];
      var out = '<path d="M32 12c7 8 11 18 11 26 0 7-5 12-11 12s-11-5-11-12c0-8 4-18 11-26z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M22 34c6 2 14 2 20 0M25 26c4 2 10 2 14 0" ' + st(1.5) + ' opacity="0.5"/>';
      out += '<path d="M32 12v10" ' + st(1.4) + ' opacity="0.5"/>';
      return out;
    },

    // 豆芽
    sprout: function (s) {
      var a = s.c[0], b = s.c[1] || '#E8D89A';
      var out = '';
      [[23, -1], [32, 0], [41, 1]].forEach(function (p) {
        var x = p[0], d = p[1];
        out += '<path d="M' + x + ' 56c0-10 1-18 ' + (d * 3) + '-24" stroke="#F6F1E4" stroke-width="5" stroke-linecap="round" fill="none"/>';
        out += '<path d="M' + x + ' 56c0-10 1-18 ' + (d * 3) + '-24" ' + st(1.5) + ' fill="none"/>';
        out += '<ellipse cx="' + (x + d * 3) + '" cy="28" rx="5.6" ry="6.4" fill="' + b + '" ' + st(1.9) + '/>';
        out += '<path d="M' + (x + d * 3 - 2) + ' 26c1-2 3-2 4 0" ' + st(1.2) + ' opacity="0.5"/>';
      });
      return out;
    },

    // 鱼丸 / 肉丸
    balls: function (s) {
      var a = s.c[0];
      var out = '';
      [[26, 38, 9], [39, 36, 8], [32, 26, 7]].forEach(function (p) {
        out += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + a + '" ' + st() + '/>';
        out += hi(p[0] - 3, p[1] - 3, 2.6, 1.8, -20, 0.5);
      });
      return out;
    },

    // 柠檬/梨一类
    oval: function (s) {
      var a = s.c[0], b = s.c[1] || '#7FA35C';
      var out = '<path d="M32 18c9 0 16 8 16 17s-7 15-16 15-16-6-16-15 7-17 16-17z" fill="' + a + '" ' + st() + '/>';
      out += '<path d="M32 18c-2-4-1-7 2-8 2 3 1 6-2 8z" fill="' + b + '" ' + st(1.8) + '/>';
      out += '<path d="M32 18c3-3 7-4 10-2-1 4-5 5-10 2z" fill="' + b + '" ' + st(1.8) + '/>';
      out += hi(25, 28, 3.4, 2.2, -25, 0.45);
      return out;
    }
  };

  /* ── 每种食材的图形配方 ── */
  var SPEC = {
    // 蔬菜
    potato: ['oval', ['#D6A45E', '#C08A46']],
    tomato: ['round', ['#E2653F', '#6E9E4F'], 1],
    cherrytomato: ['round', ['#EC7A52', '#6E9E4F'], 1],
    greenpepper: ['pepper', ['#6E9E4F'], 1],
    hotpepper: ['chili', ['#4E8B3E']],
    bellpepper: ['pepper', ['#E0A03A'], 1],
    onion: ['bulb', ['#E0C3A8', '#B08A6A']],
    carrot: ['root', ['#E08A3C', '#7FA35C'], 1],
    radish: ['root', ['#F0EDE2', '#7FA35C'], 2],
    greenradish: ['root', ['#9CBF6E', '#6E9E4F'], 2],
    cabbage: ['column',['#B9D48A','#F2F6E4']],
    redcabbage: ['leafy', ['#9A6FA8', '#B081C0'], 2],
    bokchoy: ['leafy',['#6FA35A','#86B96A'],2],
    caixin: ['leafy',['#7FB05F','#94C275'],2],
    caitai: ['leafy',['#86B96A','#6E9E4F'],3],
    spinach: ['leafy',['#5E8E4A','#6FA35A'],1],
    babycabbage: ['column',['#C9DC9A','#F4F8E8']],
    lettuce: ['leafy',['#A8C97B','#94B96A'],1],
    youmaicai: ['leafy',['#7CA95E','#8FBB6E'],3],
    tonghao: ['feather',['#6E9C55','#7FAE63']],
    waterspinach: ['leafy',['#5F9B58','#74B06A'],3],
    amaranth: ['leafy',['#8A6E5C','#7FA85C'],1],
    malabar: ['leafy', ['#6E9E6A', '#84B47E'], 2],
    sweetpotatoleaf: ['leafy', ['#77A85B', '#8ABC6B'], 3],
    gailan: ['leafy',['#4F8B52','#62A063'],3],
    mustardgreen: ['leafy',['#8FB86A','#A3C97C'],2],
    snowcabbage: ['leafy',['#9CC072','#AED084'],3],
    watercress: ['feather',['#6FA35A','#84B86A']],
    chrysanthemum: ['feather',['#86AE66','#98C075']],
    shepherdspurse: ['leafy', ['#7CA05C', '#8FB46C'], 3],
    fennel: ['feather',['#9BC07A','#AECF8C']],
    toona: ['sprig', ['#A6603F', '#B97A54'], 2],
    cilantro: ['sprig', ['#7FAE63', '#93C176'], 1],
    perilla: ['sprig', ['#7A5AA0', '#8E70B4'], 2],
    mint: ['sprig', ['#7CBE8A', '#90CF9C'], 1],
    beansprout: ['sprout', ['#F0E6C8', '#F2E3B8']],
    soybeansprout: ['sprout', ['#E8D89A', '#EFE0A8']],
    peashoot: ['sprig', ['#7FB068', '#92C07A'], 1],
    cucumber: ['longveg', ['#6FA85E', '#B9D48A'], 1],
    eggplant: ['eggplant', ['#6E4E86']],
    broccoli: ['floret',['#4E8C4B','#3F7A3F']],
    cauliflower: ['floret',['#EFE7D2','#DCCFB0']],
    zucchini: ['longveg', ['#7FAE5E', '#C4DC9A'], 2],
    luffa: ['longveg', ['#8FBF6A', '#B9D48A'], 2],
    bittergourd: ['longveg', ['#A8C46A', '#C4DC9A'], 2],
    chayote: ['round', ['#9CC47A', '#6E9E4F'], 2],
    wintermelon: ['longveg', ['#A9C99B', '#C8DFB4'], 1],
    pumpkin: ['pumpkin', ['#E08B3E', '#C9742F']],
    corn: ['corn', ['#F0C552', '#7FA35C']],
    babyscorn: ['corn', ['#EAD98C', '#9CBF6E']],
    celery: ['blades',['#90BE6A','#6E9E4F']],
    chive: ['blades',['#4F8B4A','#63A05C']],
    yellowchive: ['blades',['#E3D07A','#D6C05E']],
    garlicsprout: ['blades',['#7FB05C','#93C472']],
    garlicshoot: ['blades',['#86B962','#9ACB76']],
    leek: ['blades',['#6FA35A','#F0EAD8']],
    lotus: ['lotus', ['#EFE4CC']],
    yam: ['squash', ['#E7DCC0', '#C9BC9A']],
    taro: ['bulb', ['#B79A8A', '#8A6E5E']],
    sweetpotato: ['squash', ['#C9713F', '#8A4A2A']],
    purplesweetpotato: ['squash', ['#7A5A8E', '#5E426E']],
    waterchestnut: ['round', ['#8A5A3A', '#6E9E4F'], 2],
    watercaltrop: ['nut', ['#5B4A3A'], 1],
    celtuce: ['longveg', ['#8FBF6A', '#C4DC9A'], 1],
    bambooshoot: ['shoot', ['#D9C48A']],
    waterbamboo: ['shoot', ['#E3E0C2']],
    asparagus: ['blades',['#7FAF5E','#94C472']],
    okra: ['longveg', ['#6FA35C', '#9CBF7A'], 2],
    snowpea: ['pod', ['#9CC47A']],
    peas: ['pod', ['#8FBF66']],
    greenbean: ['pod', ['#6E9E4F']],
    cowpea: ['pod', ['#7FA85C']],
    flatbean: ['pod', ['#8FB866']],
    edamame: ['pod', ['#9CC47A']],
    broadbean: ['pod', ['#A9BE7A']],
    pickled: ['leafy', ['#C9B36A', '#B8A055'], 3],
    kimchi: ['leafy', ['#D96A4A', '#C2532F'], 2],
    zhacai: ['squash', ['#B08A5A', '#8A6A44']],
    lemon: ['oval', ['#E8C94A', '#7FA35C']],
    apple: ['round', ['#D9553F', '#6E9E4F'], 1],
    pear: ['oval', ['#C9CE6A', '#8A6A3A']],

    // 肉蛋水产
    egg: ['egg', ['#F4EAD5', '#F0B84E'], 1],
    quaillegg: ['egg', ['#EFE6D2', null], 2],
    saltedegg: ['egg', ['#EFE7D6', '#E8A03A'], 1],
    centuryegg: ['egg', ['#6B5A4A', null], 1],
    porkbelly: ['layered', ['#E8B49A', '#F6DCCB']],
    porkloin: ['meat', ['#E89A8A', '#F4C4B4']],
    mincedpork: ['meat', ['#D98A7A', '#F0BEB0']],
    ribs: ['meat', ['#D9A08A', '#F2CFC0']],
    trotters: ['drumstick', ['#E0A890']],
    liver: ['meat', ['#8A4A3F', '#B07064']],
    porktripe: ['layered', ['#E3C4A8', '#F6E6D4']],
    porkblood: ['cube', ['#7A3A3A', '#9A5450']],
    curedmeat: ['layered', ['#B04A3A', '#E8B49A']],
    beef: ['meat', ['#B04A3F', '#D98A7A']],
    beefbrisket: ['layered', ['#A8493C', '#E0A08A']],
    beefroll: ['meat', ['#C9605A', '#E8A89A']],
    steak: ['meat', ['#A8453C', '#D98070']],
    lamb: ['meat', ['#C4705E', '#E0A08A']],
    chickenleg: ['drumstick', ['#E9C79A']],
    chickenbreast: ['meat', ['#F0DCC2', '#F8EEDC']],
    chickenwing: ['drumstick', ['#E5BE8E']],
    chickenfeet: ['drumstick', ['#E7C79E']],
    wholechicken: ['bird', ['#EFD6A8']],
    gizzard: ['meat', ['#B06A5A', '#D99484']],
    duck: ['drumstick', ['#C98A5E']],
    duckblood: ['cube', ['#7A3A44', '#9A545C']],
    shrimp: ['shrimp', ['#E88A6A']],
    shrimppaste: ['balls', ['#EFA08A']],
    fish: ['fish', ['#9FB6C4', '#B9CCD6']],
    grasscarp: ['fish', ['#8FA6B4', '#A8BEC8']],
    cruciancarp: ['fish', ['#A8BCC8', '#C0D2DA']],
    hairtail: ['fish', ['#C8D2DA', '#DCE4EA']],
    yellowcroaker: ['fish', ['#E0C46A', '#EFD98C']],
    salmon: ['fish', ['#E88A5E', '#F2AB86']],
    basa: ['fish', ['#D9D2C0', '#EBE6D8']],
    cod: ['fish', ['#E3E2D6', '#F2F1E8']],
    squid: ['squid', ['#EFD0C4']],
    clam: ['shell', ['#C9A98A'], 1],
    scallop: ['shell', ['#E8D9C0'], 2],
    oysterraw: ['shell', ['#C9B49A'], 1],
    razorclam: ['shell', ['#C4B49A'], 2],
    crab: ['crab', ['#D06A4A']],
    crayfish: ['crab', ['#D9664A']],
    seacucumber: ['squash', ['#5A4A44', '#3F332F']],
    bacon: ['meat', ['#D9765A', '#F0B49A']],
    sausage: ['drumstick', ['#E08A6A']],
    chinesesausage: ['layered', ['#A84F3F', '#D98A6A']],
    luncheonmeat: ['cube', ['#E8A0A0', '#F6CFCF']],
    ham: ['meat', ['#E8A08A', '#F6CFC0']],
    fishball: ['balls', ['#F0EAD8']],
    meatball: ['balls', ['#C4705A']],

    // 菌菇干货
    shiitake: ['mushroom', ['#8A5A3A', '#EFE4CC']],
    enoki: ['mushroom', ['#F0E4CC', '#FBF6EA']],
    mushroom: ['mushroom', ['#B49A8A', '#EFE4D6']],
    kingoyster: ['mushroom', ['#D8C0A0', '#F2E8D6']],
    shimeji: ['mushroom', ['#F2EAD8', '#FCF8EE']],
    buttonmushroom: ['mushroom', ['#EFE7DA', '#FBF7EE']],
    teatree: ['mushroom', ['#9A7A4A', '#E8D8B8']],
    strawmushroom: ['mushroom', ['#8A7A5A', '#E0D6C0']],
    lionmane: ['mushroom', ['#D8C49A', '#F0E6D2']],
    morel: ['mushroom', ['#7A5A3A', '#D9C8A8']],
    crabmushroom: ['mushroom', ['#E8DCC8', '#F8F2E6']],
    bamboofungus: ['shoot', ['#E3D8B8']],
    fungus: ['mushroom', ['#4A3A32', '#8A7A6A']],
    tremella: ['leafy', ['#EFE4D0', '#F6EFE0'], 2],
    kelp: ['sheet', ['#4A6A4A']],
    wakame: ['sheet', ['#5A7A4A']],
    seaweed: ['sheet', ['#3F4A3F']],
    driedshrimp: ['shrimp', ['#E8A87A']],
    driedscallop: ['shell', ['#E8D8A8'], 2],
    peanut: ['peanut', ['#D8B47A']],
    walnut: ['nut', ['#B08A5A'], 2],
    chestnut: ['nut', ['#8A5A3A'], 1],
    jujube: ['oval', ['#A83F3F', '#7A5A3A']],
    goji: ['beans', ['#D9603F']],
    lotusseed: ['beans', ['#EFE6CC']],
    lilybulb: ['leafy', ['#F0E8D8', '#FBF6EC'], 1],
    daylily: ['sprig', ['#C9A85A', '#DCC07E'], 2],
    soybean: ['beans', ['#E8D89A']],
    mungbean: ['beans', ['#7A9A5A']],
    redbean: ['beans', ['#A84F44']],
    jobstears: ['grains', ['#E0DCC8']],
    oats: ['grains', ['#D8C79A']],

    // 主食豆制品
    rice: ['ricebowl', ['#F4EFE0', '#F6F1E4']],
    glutinousrice: ['ricebowl', ['#F2EBD8', '#F6F1E4']],
    blackrice: ['ricebowl', ['#4A3A3A', '#F6F1E4']],
    millet: ['grains', ['#E8C85A']],
    noodle: ['noodles', ['#E8C98A']],
    udon: ['noodles', ['#EFE4D0'], 3],
    sobanoodle: ['noodles', ['#B0A080']],
    pasta: ['noodles', ['#E0B45A']],
    ricevermicelli: ['noodles', ['#F0EAD8'], 2],
    riceflakenoodle: ['noodles', ['#EFE8D2'], 3],
    instantnoodle: ['instantblock', ['#E8C86A']],
    bun: ['bread', ['#F0E6D2'], 1],
    bread: ['bread',['#D9A86A'],2],
    youtiao: ['bread', ['#C98A4A'], 3],
    dumplingwrapper: ['dumpling', ['#F0E8D6'], 1],
    wontonwrapper: ['dumpling', ['#F2EBD8'], 2],
    springrollwrapper: ['dumpling', ['#F0E9D8'], 2],
    ricecake: ['cakeStack', ['#F2EFE0', '#FBF8EC']],
    vermicelli: ['noodles', ['#EFEAD8'], 2],
    flour: ['bag', ['#F0EADC']],
    cornmeal: ['bag', ['#E8C86A']],
    frozenpancake: ['bread', ['#E0C49A'], 1],
    gluten: ['balls', ['#D9B47A']],
    tofu: ['cube', ['#F4EFE2', '#FFFDF6']],
    firmtofu: ['cube', ['#F0E8D2', '#FBF6E8']],
    driedtofu: ['cube', ['#B08A5A', '#D9BC94']],
    tofuskin: ['sheet', ['#E8D8A8']],
    friedtofu: ['cube', ['#D9A85A', '#F0CE96']],
    fuzhu: ['shoot', ['#E8D08A']],
    konjac: ['cube', ['#C8C4C0', '#E4E1DC']],
    eggtofu: ['cube', ['#EFE0A8', '#FAF2D2']],
    breadcrumb: ['grains', ['#D8B47A']],
    milk: ['carton', ['#F4F2EC']],
  };

  function foodSVG(id) {
    var cfg = SPEC[id];
    if (!cfg) return '';
    var fn = K[cfg[0]];
    if (!fn) return '';
    return '<svg class="fi" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<g transform="translate(32 32) scale(1.12) translate(-32 -32)">' +
      fn({ c: cfg[1] || [], v: cfg[2] || 1 }) + '</g></svg>';
  }

  window.foodSVG = foodSVG;
})();
