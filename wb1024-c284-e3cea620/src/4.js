
/* ==== illustrations.js ==== */
/*插画绘制器 —— 纯 Canvas 代码绘制，无需任何图片素材与依赖。
   运行时生成两张风格化风景插画并注入页面。*/
(function (global) {
  'use strict';

  const W = 1000, H = 640, SS = 2;
  const CW = W * SS, CH = H * SS;

  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t))
  ];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* 竖直线性渐变填充 */
  function vgrad(ctx, x, y, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, rgba(top, 1));
    g.addColorStop(1, rgba(bottom, 1));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  /* ============ 广州 · 珠江夜色 ============ */
  function guangzhou(ctx) {
    const horizon = Math.round(CH * 0.72);

    vgrad(ctx, 0, 0, CW, CH, [14, 24, 58], [214, 118, 62]);

    // 高空星点
    const rnd = mulberry32(7);
    for (let i = 0; i < 300; i++) {
      const x = rnd() * CW, y = rnd() * CH * 0.46;
      const a = 0.16 + rnd() * 0.5, r = (rnd() < 0.75 ? 1 : 2) * SS;
      ctx.fillStyle = `rgba(255,245,220,${a})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }

    // 晚霞光晕
    let g = ctx.createRadialGradient(CW * 0.72, horizon - CH * 0.08, CH * 0.02, CW * 0.72, horizon - CH * 0.08, CH * 0.46);
    g.addColorStop(0, 'rgba(255,176,96,0.30)');
    g.addColorStop(1, 'rgba(255,176,96,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);

    // 远景城市剪影
    function skyline(baseY, maxH, color, seed, winAlpha) {
      const r = mulberry32(seed);
      let x = -40;
      while (x < CW + 40) {
        const bw = CW * (0.012 + r() * 0.033);
        const bh = maxH * (0.28 + r() * 0.72);
        ctx.fillStyle = rgba(color, 1);
        ctx.fillRect(x, baseY - bh, bw, bh);
        for (let k = 0; k < bh / (14 * SS); k++) {
          if (r() < 0.4) {
            ctx.fillStyle = `rgba(255,205,130,${winAlpha * (0.35 + r() * 0.65)})`;
            ctx.fillRect(x + 3 + r() * (bw - 8), baseY - 5 - r() * (bh - 6), 3 * SS, 4 * SS);
          }
        }
        x += bw + r() * CW * 0.01;
      }
    }
    skyline(horizon, CH * 0.30, [24, 30, 56], 11, 0.75);
    skyline(horizon + 6 * SS, CH * 0.19, [16, 20, 40], 23, 0.5);

    /* ---- 广州塔（小蛮腰）---- */
    const tx = CW * 0.615, baseY = horizon + 4 * SS, topY = CH * 0.16;
    const Hh = baseY - topY;
    const wMax = CW * 0.088, wMin = CW * 0.026;
    const halfW = t => wMin + (wMax - wMin) * Math.pow(Math.sin(t * Math.PI), 0.62);

    const steps = 150, left = [], right = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, y = baseY - t * Hh, hw = halfW(t);
      left.push([tx - hw, y]); right.push([tx + hw, y]);
    }

    ctx.beginPath();
    left.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    right.slice().reverse().forEach(p => ctx.lineTo(p[0], p[1]));
    ctx.closePath();
    ctx.fillStyle = rgba([28, 32, 58], 1); ctx.fill();

    // 桁架斜纹
    ctx.lineWidth = SS;
    ctx.strokeStyle = 'rgba(126,148,196,0.47)';
    const gap = Math.max(2, Math.round(steps / 44));
    for (let i = 0; i < steps; i += gap) {
      for (let j = i + 1; j < Math.min(steps, i + gap + 1); j++) {
        ctx.beginPath();
        if (Math.floor(i / gap) % 2 === 0) { ctx.moveTo(left[i][0], left[i][1]); ctx.lineTo(right[j][0], right[j][1]); }
        else { ctx.moveTo(right[i][0], right[i][1]); ctx.lineTo(left[j][0], left[j][1]); }
        ctx.stroke();
      }
    }

    // 边缘红光 + 障碍灯
    ctx.lineWidth = 1.6 * SS; ctx.strokeStyle = 'rgba(255,118,92,0.6)';
    [left, right].forEach(side => {
      ctx.beginPath();
      side.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.stroke();
    });
    for (let i = 0; i <= 40; i++) {
      const t = i / 40, y = baseY - t * Hh, hw = halfW(t);
      [tx - hw, tx + hw].forEach(sx => {
        ctx.beginPath(); ctx.arc(sx, y, 3.2 * SS, 0, 7);
        ctx.fillStyle = 'rgba(255,92,72,0.92)'; ctx.fill();
      });
    }
    // 顶部观光平台 + 塔顶灯
    ctx.fillStyle = 'rgba(255,196,120,0.75)';
    ctx.fillRect(tx - wMax, topY + Hh * 0.055, wMax * 2, Hh * 0.033);
    ctx.beginPath(); ctx.arc(tx, topY, 5 * SS, 0, 7);
    ctx.fillStyle = 'rgba(255,120,96,1)'; ctx.fill();

    /* ---- 江面 ---- */
    vgrad(ctx, 0, horizon, CW, CH - horizon, [18, 28, 56], [8, 12, 26]);

    // 倒影：截取画面上部镜像后拉伸贴回江面
    const reflH = Math.round(CH * 0.30);
    const tmp = document.createElement('canvas');
    tmp.width = Math.round(reflW(CW)); tmp.height = reflH;
    const tc = tmp.getContext('2d');
    tc.drawImage(ctx.canvas, 0, 0, CW, CH, 0, 0, tmp.width, reflH, 0, CH - reflH - (CH - horizon) - reflH + reflH - reflH, reflH * 2);
    // 简化处理：直接做竖向渐变化的塔影
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.filter = `blur(${2 * SS}px)`;
    const rg = ctx.createLinearGradient(0, horizon, 0, horizon + reflH * 0.8);
    rg.addColorStop(0, 'rgba(255,168,110,0.75)');
    rg.addColorStop(0.35, 'rgba(120,140,190,0.35)');
    rg.addColorStop(1, 'rgba(60,80,130,0)');
    ctx.fillStyle = rg;
    const rw = CW * 0.11;
    ctx.beginPath();
    ctx.moveTo(tx - rw * 0.55, horizon);
    ctx.lineTo(tx + rw * 0.55, horizon);
    ctx.lineTo(tx + rw * 1.5, horizon + reflH * 0.8);
    ctx.lineTo(tx - rw * 1.5, horizon + reflH * 0.8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.filter = 'none';

    // 水面波纹
    const r2 = mulberry32(31);
    for (let i = 0; i < 260; i++) {
      const y = r2() * (CH - horizon) + horizon;
      const depth = (y - horizon) / (CH - horizon);
      const x = r2() * CW;
      const ln = CW * 0.02 * (0.3 + depth) + r2() * CW * 0.14 * (0.3 + depth);
      ctx.strokeStyle = r2() < 0.5
        ? `rgba(255,190,130,${0.24 + 0.28 * depth})`
        : `rgba(150,180,220,${0.24 + 0.28 * depth})`;
      ctx.lineWidth = (1 + depth * 2) * SS;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ln, y); ctx.stroke();
    }

    // 前景江堤 + 栏杆灯
    ctx.fillStyle = 'rgba(10,14,28,1)';
    ctx.fillRect(0, CH - CH * 0.045, CW, CH * 0.045);
    for (let x = 0; x < CW; x += CW * 0.045) {
      ctx.fillStyle = 'rgba(255,208,150,0.82)';
      ctx.fillRect(x, CH - CH * 0.062, CW * 0.005, CH * 0.022);
    }

    function reflW(w) { return Math.round(w * 0.30); }
  }

  /* ============ 塔克拉玛干沙漠 ============ */
  function taklamakan(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [58, 122, 178], [247, 214, 168]);

    // 薄云
    [[0.16, 0.30, 0.28, 0.032, 0.28], [0.23, 0.66, 0.21, 0.026, 0.23],
     [0.11, 0.83, 0.17, 0.021, 0.19], [0.28, 0.12, 0.15, 0.019, 0.16]]
      .forEach(([cy, cx, rw, rh, al]) => {
        const g = ctx.createRadialGradient(cx * CW, cy * CH, 0, cx * CW, cy * CH, rw * CW);
        g.addColorStop(0, `rgba(255,252,246,${al})`);
        g.addColorStop(1, 'rgba(255,252,246,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, CW, CH);
      });

    // 太阳 + 光晕
    const sx = CW * 0.685, sy = CH * 0.335, sr = CH * 0.062;
    let g = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 3.2);
    g.addColorStop(0, 'rgba(255,232,176,0.55)');
    g.addColorStop(1, 'rgba(255,232,176,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7);
    ctx.fillStyle = 'rgba(255,250,226,1)'; ctx.fill();

    const horizon = CH * 0.545;
    const layers = [
      [horizon, 0.030, 1.55, 0.4, [236, 202, 152], [214, 174, 122]],
      [horizon + CH * 0.075, 0.058, 1.15, 2.1, [228, 186, 132], [201, 155, 104]],
      [horizon + CH * 0.170, 0.080, 0.92, 4.0, [214, 166, 110], [180, 133, 84]],
      [horizon + CH * 0.290, 0.095, 0.78, 1.2, [196, 144, 92], [156, 110, 68]],
      [horizon + CH * 0.430, 0.085, 0.95, 5.3, [168, 118, 72], [124, 85, 52]],
      [CH + CH * 0.06, 0.060, 1.30, 3.3, [132, 90, 55], [92, 62, 38]]
    ];

    layers.forEach(([base, amp, wl, ph, cLight, cDark]) => {
      const yAt = x => base + CH * amp * (
        Math.sin(x / CW * Math.PI * 2 * wl + ph) * 0.62 +
        Math.sin(x / CW * Math.PI * 2 * wl * 2.3 + ph * 1.7) * 0.38);

      const pts = [];
      for (let x = 0; x <= CW + 12; x += 8) pts.push([x, yAt(x)]);

      ctx.beginPath();
      pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      ctx.lineTo(CW, CH + 20); ctx.lineTo(0, CH + 20); ctx.closePath();
      ctx.fillStyle = rgba(cDark, 1); ctx.fill();

      // 脊线明暗
      ctx.lineWidth = 3.2 * SS;
      for (let i = 0; i < pts.length - 1; i++) {
        const lit = 0.5 + 0.5 * Math.sin(pts[i][0] / CW * Math.PI * 2 * wl + ph);
        ctx.strokeStyle = rgba(mix(cLight, cDark, 0.15 + 0.85 * (1 - lit)), 1);
        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
      }
      // 沙脊高光
      ctx.lineWidth = 2.2 * SS;
      for (let i = 0; i < pts.length - 1; i++) {
        const lit = 0.5 + 0.5 * Math.sin(pts[i][0] / CW * Math.PI * 2 * wl + ph + 0.6);
        if (lit > 0.55) {
          ctx.strokeStyle = `rgba(255,238,198,${0.6 * (lit - 0.55) / 0.45})`;
          ctx.beginPath();
          ctx.moveTo(pts[i][0], pts[i][1] - 3 * SS);
          ctx.lineTo(pts[i + 1][0], pts[i + 1][1] - 3 * SS);
          ctx.stroke();
        }
      }
      // 风纹
      ctx.lineWidth = SS;
      ctx.strokeStyle = 'rgba(255,232,186,0.18)';
      for (let x = 0; x < CW; x += 26 * SS) {
        const yy = yAt(x);
        for (let row = 0; row < 3; row++) {
          const oy = yy + (6 + row * 9) * SS;
          if (oy < CH) {
            ctx.beginPath();
            ctx.moveTo(x, oy); ctx.lineTo(x + (20 + row * 16) * SS, oy + 3 * SS);
            ctx.stroke();
          }
        }
      }
    });

    // 驼队剪影
    function camel(x, y, s, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - 26 * s, y);
      ctx.lineTo(x + 24 * s, y);
      ctx.lineTo(x + 18 * s, y - 20 * s);
      ctx.lineTo(x - 20 * s, y - 20 * s);
      ctx.closePath(); ctx.fill();
      [[x - 20 * s, y - 26 * s, 7 * s], [x - 2 * s, y - 34 * s, 9 * s], [x + 15 * s, y - 24 * s, 6.5 * s]]
        .forEach(([hx, hy, hr]) => {
          ctx.beginPath(); ctx.ellipse(hx, hy, hr, hr * 1.5, 0, 0, 7); ctx.fill();
        });
      ctx.lineWidth = 3.4 * s; ctx.strokeStyle = col;
      [x - 18 * s, x - 9 * s, x + 9 * s, x + 17 * s].forEach(lx => {
        ctx.beginPath(); ctx.moveTo(lx, y - 18 * s); ctx.lineTo(lx + 1.5 * s, y); ctx.stroke();
      });
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath(); ctx.moveTo(x + 20 * s, y - 22 * s); ctx.lineTo(x + 34 * s, y - 28 * s); ctx.stroke();
    }
    [[0.315, 0.665, 1.05], [0.372, 0.660, 0.92], [0.421, 0.658, 0.80], [0.468, 0.657, 0.70]]
      .forEach(([fx, fy, fs]) => camel(CW * fx, CH * fy, fs * 34 * SS, 'rgba(74,46,27,1)'));

    // 前景强对比沙丘
    ctx.beginPath();
    for (let x = 0; x <= CW + 12; x += 8) {
      const y = CH * 0.90 + CH * 0.055 * Math.sin(x / CW * Math.PI * 2 * 0.9 + 2.2);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineTo(CW, CH + 20); ctx.lineTo(0, CH + 20); ctx.closePath();
    ctx.fillStyle = 'rgba(74,47,28,1)'; ctx.fill();
    ctx.lineWidth = 3.5 * SS; ctx.strokeStyle = 'rgba(126,86,52,1)';
    ctx.stroke();

    // 暖色滤镜
    ctx.fillStyle = 'rgba(255,186,110,0.10)';
    ctx.fillRect(0, 0, CW, CH);
  }

  /* 生成图片并回调 */
  function generate(name) {
    const c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    const ctx = c.getContext('2d');
    try {
      (name === 'guangzhou' ? guangzhou : taklamakan)(ctx);
    } catch (e) {
      vgrad(ctx, 0, 0, CW, CH, [40, 46, 70], [18, 22, 38]);
      ctx.fillStyle = '#fff'; ctx.font = `${28 * SS}px sans-serif`;
      ctx.fillText('插画生成失败: ' + e.message, 40, 80);
    }
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    out.getContext('2d').drawImage(c, 0, 0, W, H);
    return out.toDataURL('image/jpeg', 0.9);
  }

  global.ILLUSTRATIONS = { guangzhou: () => generate('guangzhou'), taklamakan: () => generate('taklamakan') };
})(window);
