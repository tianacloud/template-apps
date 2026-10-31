
/* ==== eco-scenes.js ==== */
/* 中国七大生态系统 · 插画绘制器
   纯 Canvas 代码绘制，无图片素材、无外部依赖。
   在 window.ILLUSTRATIONS 上注册，供index.html 按需调用并缓存。*/
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

  function vgrad(ctx, x, y, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, rgba(top, 1));
    g.addColorStop(1, rgba(bottom, 1));
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  /* 通用的起伏山脊/地形线 */
  function waveY(x, baseY, amp, wl, ph, h) {
    return baseY + (h || CH) * amp * (
      Math.sin(x / CW * Math.PI * 2 * wl + ph) * 0.62 +
      Math.sin(x / CW * Math.PI * 2 * wl * 2.3 + ph * 1.7) * 0.38
    );
  }
  function fillBand(ctx, yAt, bottom, fill) {
    ctx.beginPath();
    for (let x = 0; x <= CW + 12; x += 8) {
      const y = yAt(x);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineTo(CW, bottom); ctx.lineTo(0, bottom); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
  }
  function ridge(ctx, baseY, amp, wl, ph, fill, h) {
    fillBand(ctx, x => waveY(x, baseY, amp, wl, ph, h), CH + 20, fill);
  }
  function strokeRidge(ctx, baseY, amp, wl, ph, color, width, h) {
    ctx.beginPath();
    for (let x = 0; x <= CW + 12; x += 8) {
      const y = waveY(x, baseY, amp, wl, ph, h);
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
  }

  /* 尖顶针叶树 */
  function fir(ctx, x, y, h, w, col, snow) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y - h);
    let ty = y - h;
    const tiers = 4;
    for (let i = 0; i < tiers; i++) {
      const f = i / tiers;
      const t0 = y - h * (0.30 + f * 0.70);
      const t1 = y - h * (0.30 + (f + 1) / tiers * 0.70);
      const ww = w * (1 - f * 0.55);
      ctx.lineTo(x - ww * 0.5, t1);
      ctx.lineTo(x - ww * 0.26, t1);
      ty = t1;
    }
    ctx.lineTo(x - w * 0.05, y);
    ctx.lineTo(x + w * 0.05, y);
    for (let i = tiers - 1; i >= 0; i--) {
      const f = i / tiers;
      const t0 = y - h * (0.30 + f * 0.70);
      const t1 = y - h * (0.30 + (f + 1) / tiers * 0.70);
      const ww = w * (1 - f * 0.55);
      ctx.lineTo(x + ww * 0.26, t1);
      ctx.lineTo(x + ww * 0.5, t1);
    }
    ctx.closePath(); ctx.fill();
    if (snow) {
      ctx.fillStyle = snow;
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - w * 0.16, y - h * 0.78);
      ctx.lineTo(x - w * 0.07, y - h * 0.80);
      ctx.lineTo(x - w * 0.05, y - h * 0.70);
      ctx.lineTo(x + w * 0.05, y - h * 0.70);
      ctx.lineTo(x + w * 0.07, y - h * 0.80);
      ctx.lineTo(x + w * 0.16, y - h * 0.78);
      ctx.closePath(); ctx.fill();
    }
  }

  /* 积云 */
  function puffy(ctx, cx, cy, w, h, col, alpha) {
    ctx.save();
    ctx.fillStyle = rgba(col, alpha === undefined ? 0.95 : alpha);
    const blobs = 7;
    for (let i = 0; i < blobs; i++) {
      const t = i / (blobs - 1);
      const bx = cx - w / 2 + t * w;
      const by = cy - Math.sin(t * Math.PI) * h * 0.62;
      const r = h * (0.34 + Math.sin(t * Math.PI) * 0.42);
      ctx.beginPath(); ctx.arc(bx, by, r, 0, 7); ctx.fill();
    }
    ctx.fillRect(cx - w / 2, cy, w, h * 0.4);
    ctx.restore();
  }

  function sunGlow(ctx, x, y, r, core, halo, strength) {
    let g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 4);
    g.addColorStop(0, rgba(halo, strength));
    g.addColorStop(1, rgba(halo, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
    g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(core, 1));
    g.addColorStop(1, rgba(core, 0.15));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  function vignette(ctx, strength) {
    const g = ctx.createRadialGradient(CW / 2, CH / 2, CH * 0.34, CW / 2, CH / 2, CH * 0.92);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength || 0.26})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  }

  /* ================================================================
     1. 森林生态系统 —— 长白山温带针阔混交林
     ================================================================ */
  function forest(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [148, 176, 200], [226, 232, 232]);
    const hz = CH * 0.60;

    sunGlow(ctx, CW * 0.24, CH * 0.24, CH * 0.052, [255, 252, 238], [255, 246, 214], 0.42);

    // 层叠山脊：由远及近加深
    ridge(ctx, hz - CH * 0.02, 0.075, 1.15, 0.7, [150, 168, 182]);
    ridge(ctx, hz + CH * 0.03, 0.065, 0.85, 2.4, [104, 126, 142]);
    ridge(ctx, hz + CH * 0.10, 0.055, 1.45, 4.1, [66, 88, 100]);

    // 林线上的雾带
    let g = ctx.createLinearGradient(0, hz - CH * 0.10, 0, hz + CH * 0.16);
    g.addColorStop(0, 'rgba(232,238,242,0)');
    g.addColorStop(.45, 'rgba(232,238,242,0.66)');
    g.addColorStop(1, 'rgba(232,238,242,0)');
    ctx.fillStyle = g; ctx.fillRect(0, hz - CH * 0.10, CW, CH * 0.26);

    const rnd = mulberry32(17);

    // 中景针叶林（三排，越近越深越大）
    const rows = [
      { y: hz + CH * 0.11, hMin: .055, hMax: .095, col: [42, 62, 52] },
      { y: hz + CH * 0.20, hMin: .085, hMax: .145, col: [28, 46, 40] },
      { y: hz + CH * 0.31, hMin: .130, hMax: .215, col: [17, 32, 29] }
    ];
    rows.forEach((row, ri) => {
      let x = -60;
      while (x < CW + 60) {
        const h = CH * (row.hMin + rnd() * (row.hMax - row.hMin));
        const w = h * (0.42 + rnd() * 0.16);
        const jitter = (rnd() - 0.5) * CH * 0.02;
        fir(ctx, x, row.y + jitter, h, w, rgba(row.col, 1),
            ri === 2 && rnd() < 0.28 ? 'rgba(226,238,244,0.55)' : null);
        x += w * (0.52 + rnd() * 0.34);
      }
    });

    // 林下灌木与树干
    let x2 = -40;
    while (x2 < CW + 40) {
      const h = CH * (0.22 + rnd() * 0.16);
      ctx.fillStyle = 'rgba(24,18,14,0.85)';
      ctx.fillRect(x2 - 5 * SS, CH * 0.94 - h, 10 * SS, h);
      x2 += 90 + rnd() * 150;
    }

    // 前景地面
    ridge(ctx, CH * 0.93, 0.018, 1.1, 1.9, [30, 40, 30], CH);

    // 林间地面：苔藓斑块 + 落叶层 + 透光斑
    const gm = mulberry32(59);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, CH * 0.86, CW, CH * 0.20); ctx.clip();
    for (let i = 0; i < 90; i++) {
      const x = gm() * CW, y = CH * (0.87 + gm() * 0.19);
      const rx = CW * (0.012 + gm() * 0.045), ry = CH * (0.004 + gm() * 0.014);
      ctx.fillStyle = `rgba(${86 + gm() * 40 | 0},${112 + gm() * 36 | 0},${62 + gm() * 28 | 0},${0.16 + gm() * 0.26})`;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
    }
    // 落叶（金黄/赭红点缀）
    for (let i = 0; i < 700; i++) {
      const x = gm() * CW, y = CH * (0.87 + gm() * 0.19);
      ctx.fillStyle = gm() < 0.5
        ? `rgba(196,150,66,${0.25 + gm() * 0.45})`
        : `rgba(158,86,44,${0.22 + gm() * 0.4})`;
      ctx.beginPath(); ctx.ellipse(x, y, (2.5 + gm() * 5) * SS, (1.4 + gm() * 2.6) * SS, gm() * 3, 0, 7); ctx.fill();
    }
    ctx.restore();

    // 树干间的丁达尔光斑
    for (let i = 0; i < 26; i++) {
      const x = gm() * CW, y = CH * (0.40 + gm() * 0.50);
      const r = CH * (0.03 + gm() * 0.09);
      const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
      g2.addColorStop(0, `rgba(255,250,220,${0.05 + gm() * 0.10})`);
      g2.addColorStop(1, 'rgba(255,250,220,0)');
      ctx.fillStyle = g2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }

    // 前景大树枝（框住构图）
    const branch = (bx, by, dir, len, w, col) => {
      ctx.save(); ctx.translate(bx, by); ctx.scale(dir, 1);
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.45, -len * 0.10, len, -len * 0.30);
      ctx.stroke();
      for (let i = 1; i <= 7; i++) {
        const t = i / 8;
        const px = len * t, py = -len * 0.30 * t * t - len * 0.06 * Math.sin(t * 3);
        const nl = len * (0.20 - t * 0.11), nw = w * 0.62;
        for (const s of [-1, 1]) {
          ctx.lineWidth = nw;
          ctx.beginPath(); ctx.moveTo(px, py);
          ctx.lineTo(px + s * nl * 0.5, py - nl);
          ctx.stroke();
          // 针叶簇
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.ellipse(px + s * nl * 0.5, py - nl, nl * 0.34, nl * 0.16, s * 0.4, 0, 7);
          ctx.fill();
        }
      }
      ctx.restore();
    };
    branch(-20, CH * 0.04, 1, CW * 0.34, 9 * SS, 'rgba(20,34,30,0.95)');
    branch(CW + 20, CH * 0.10, -1, CW * 0.28, 8 * SS, 'rgba(20,34,30,0.92)');

    // 阳光光柱
    g = ctx.createLinearGradient(CW * 0.24, 0, CW * 0.24, CH);
    g.addColorStop(0, 'rgba(255,250,225,0.20)');
    g.addColorStop(1, 'rgba(255,250,225,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(CW * 0.20, 0); ctx.lineTo(CW * 0.32, 0);
    ctx.lineTo(CW * 0.56, CH); ctx.lineTo(CW * 0.30, CH);
    ctx.closePath(); ctx.fill();

    // 高处穿林薄雾（增加纵深）
    for (let i = 0; i < 7; i++) {
      const y = CH * (0.62 + i * 0.055);
      const mg = ctx.createLinearGradient(0, y, 0, y + CH * 0.075);
      mg.addColorStop(0, 'rgba(226,234,238,0)');
      mg.addColorStop(.5, `rgba(226,234,238,${0.10 - i * 0.011})`);
      mg.addColorStop(1, 'rgba(226,234,238,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(0, y, CW, CH * 0.075);
    }

    vignette(ctx, 0.30);
  }

  /* ================================================================
     2. 草原生态系统 —— 呼伦贝尔草原
     ================================================================ */
  function grassland(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [56, 122, 200], [206, 226, 234]);
    const hz = CH * 0.52;

    sunGlow(ctx, CW * 0.78, CH * 0.17, CH * 0.055, [255, 253, 240], [255, 240, 190], 0.50);

    puffy(ctx, CW * 0.24, CH * 0.17, CW * 0.30, CH * 0.10, [255, 255, 255], 0.95);
    puffy(ctx, CW * 0.58, CH * 0.12, CW * 0.22, CH * 0.075, [255, 255, 255], 0.82);
    puffy(ctx, CW * 0.86, CH * 0.24, CW * 0.18, CH * 0.055, [248, 250, 252], 0.7);
    puffy(ctx, CW * 0.08, CH * 0.28, CW * 0.16, CH * 0.045, [248, 250, 252], 0.6);

    // 远山
    ridge(ctx, hz - CH * 0.015, 0.035, 1.3, 0.3, [146, 176, 168]);

    // 草浪：由远及近，逐层加深并加大起伏
    const bands = [
      [hz + CH * 0.015, 0.022, 1.05, 0.8, [150, 186, 116], [128, 166, 100]],
      [hz + CH * 0.075, 0.032, 0.85, 2.6, [122, 168, 88], [100, 148, 76]],
      [hz + CH * 0.155, 0.042, 0.72, 4.3, [96, 148, 70], [76, 126, 60]],
      [hz + CH * 0.255, 0.050, 0.62, 1.5, [72, 124, 56], [56, 104, 46]],
      [hz + CH * 0.380, 0.055, 0.80, 5.1, [52, 100, 44], [38, 82, 36]]
    ];
    bands.forEach(([by, amp, wl, ph, cl, cd]) => {
      ridge(ctx, by, amp, wl, ph, rgba(cd, 1));
      // 受光草坡
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= CW + 12; x += 8) {
        const y = waveY(x, by, amp, wl, ph);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.lineTo(CW, CH + 20); ctx.lineTo(0, CH + 20); ctx.closePath();
      ctx.clip();
      // 每条草坡顶部的一条亮边
      for (let x = 0; x <= CW + 12; x += 8) {
        const y = waveY(x, by, amp, wl, ph);
        ctx.fillStyle = rgba(cl, 0.85);
        ctx.fillRect(x, y, 9, CH * 0.014);
      }
      ctx.restore();
    });

    // 羊群（远处 -> 前景）
    const rnd = mulberry32(29);
    const sheep = [
      [0.30, 0.615, 1.0], [0.345, 0.622, 0.95], [0.385, 0.618, 1.05], [0.425, 0.630, 0.9],
      [0.47, 0.622, 1.0], [0.615, 0.700, 1.5], [0.665, 0.708, 1.4], [0.715, 0.698, 1.55],
      [0.78, 0.712, 1.45], [0.20, 0.760, 2.1], [0.31, 0.775, 2.0], [0.44, 0.768, 2.15]
    ];
    sheep.forEach(([fx, fy, fs]) => {
      const x = CW * fx, y = CH * fy, s = fs * 9 * SS;
      ctx.fillStyle = 'rgba(252,250,244,0.96)';
      ctx.beginPath(); ctx.ellipse(x, y - s * 0.55, s * 1.0, s * 0.62, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(x + s * 0.82, y - s * 0.95, s * 0.36, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,110,96,0.9)'; ctx.lineWidth = s * 0.16;
      [-0.5, -0.1, 0.34, 0.62].forEach(o => {
        ctx.beginPath(); ctx.moveTo(x + s * o, y - s * 0.15); ctx.lineTo(x + s * o, y); ctx.stroke();
      });
    });

    // 前景草丛（随风倾斜）
    const r2 = mulberry32(41);
    ctx.strokeStyle = 'rgba(46,88,38,0.75)';
    for (let i = 0; i < 900; i++) {
      const x = r2() * CW;
      const y = CH * (0.90 + r2() * 0.12);
      const len = CH * (0.016 + r2() * 0.030) * ((y / CH - 0.86) / 0.18 + 0.35);
      const bend = (r2() - 0.35) * len * 0.5;
      ctx.lineWidth = (0.9 + r2() * 1.5) * SS;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + bend * 0.4, y - len * 0.6, x + bend, y - len);
      ctx.stroke();
    }

    vignette(ctx, 0.24);
  }

  /* ================================================================
     3. 湿地生态系统 —— 若尔盖高寒沼泽（黑颈鹤栖息地）
     ================================================================ */
  function wetland(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [120, 156, 186], [232, 220, 196]);
    const hz = CH * 0.44;

    sunGlow(ctx, CW * 0.68, CH * 0.16, CH * 0.048, [255, 250, 232], [255, 238, 200], 0.34);

    puffy(ctx, CW * 0.30, CH * 0.15, CW * 0.34, CH * 0.075, [255, 253, 250], 0.8);
    puffy(ctx, CW * 0.70, CH * 0.25, CW * 0.26, CH * 0.055, [252, 250, 248], 0.6);

    // 远山
    ridge(ctx, hz, 0.055, 1.05, 0.9, [128, 138, 148]);
    ridge(ctx, hz + CH * 0.05, 0.040, 0.75, 3.2, [92, 104, 106]);

    // 水面
    vgrad(ctx, 0, hz + CH * 0.06, CW, CH - hz, [122, 152, 170], [42, 74, 92]);

    // 远岸草洲
    ridge(ctx, hz + CH * 0.055, 0.014, 1.8, 0.4, [126, 132, 96], CH * 0.4);

    // 水面倒影带（云与山）
    let g = ctx.createLinearGradient(0, hz + CH * 0.07, 0, CH * 0.80);
    g.addColorStop(0, 'rgba(255,250,235,0.42)');
    g.addColorStop(0.5, 'rgba(180,200,210,0.12)');
    g.addColorStop(1, 'rgba(30,52,70,0)');
    ctx.fillStyle = g; ctx.fillRect(0, hz + CH * 0.07, CW, CH);

    // 水面波纹
    const rnd = mulberry32(53);
    for (let i = 0; i < 320; i++) {
      const y = hz + CH * 0.08 + rnd() * CH * 0.70;
      const x = rnd() * CW;
      ctx.strokeStyle = `rgba(226,238,244,${0.06 + rnd() * 0.16})`;
      ctx.lineWidth = (0.8 + rnd() * 1.4) * SS;
      const ln = CW * (0.01 + rnd() * 0.05);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + ln, y); ctx.stroke();
    }

    // 芦苇丛（越近越大）
    const reed = (x, y, h, col, tipCol) => {
      const rnd2 = mulberry32(Math.round(x));
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const ox = (i - 4) * h * 0.055 + (rnd2() - .5) * h * .04;
        const hh = h * (0.6 + rnd2() * 0.55);
        const bend = (rnd2() - 0.4) * hh * 0.16;
        ctx.lineWidth = Math.max(1, h * 0.018);
        ctx.beginPath();
        ctx.moveTo(x + ox, y);
        ctx.quadraticCurveTo(x + ox + bend * .4, y - hh * .6, x + ox + bend, y - hh);
        ctx.stroke();
        // 芦花
        ctx.fillStyle = tipCol;
        ctx.beginPath();
        ctx.ellipse(x + ox + bend, y - hh - h * .045, h * .028, h * .075, bend * .05, 0, 7);
        ctx.fill();
      }
    };
    [[0.08, 0.70, 0.075], [0.22, 0.735, 0.085], [0.34, 0.715, 0.070],
     [0.72, 0.725, 0.080], [0.86, 0.705, 0.072], [0.95, 0.745, 0.090]]
      .forEach(([fx, fy, fh]) => reed(CW * fx, CH * fy, CH * fh, 'rgba(104,104,72,0.9)', 'rgba(196,168,124,0.95)'));
    [[0.13, 0.90, 0.16], [0.42, 0.94, 0.19], [0.66, 0.90, 0.155], [0.90, 0.95, 0.20]]
      .forEach(([fx, fy, fh]) => reed(CW * fx, CH * fy, CH * fh, 'rgba(78,78,52,0.95)', 'rgba(178,150,108,0.95)'));

    // 黑颈鹤
    const crane = (x, y, s, dark) => {
      ctx.strokeStyle = dark; ctx.lineWidth = 2 * SS; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - s * .5, y); ctx.lineTo(x - s * .45, y - s * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * .45, y); ctx.lineTo(x + s * .4, y - s * 1.5); ctx.stroke();
      ctx.fillStyle = 'rgba(250,250,248,0.97)';
      ctx.beginPath(); ctx.ellipse(x, y - s * 1.85, s * .78, s * .52, -0.12, 0, 7); ctx.fill();
      // 颈
      ctx.strokeStyle = 'rgba(38,38,42,0.95)'; ctx.lineWidth = 3.2 * SS;
      ctx.beginPath();
      ctx.moveTo(x - s * .6, y - s * 1.95);
      ctx.quadraticCurveTo(x - s * 1.5, y - s * 2.4, x - s * 1.25, y - s * 3.05);
      ctx.stroke();
      // 头 + 红顶
      ctx.fillStyle = 'rgba(250,250,248,0.98)';
      ctx.beginPath(); ctx.arc(x - s * 1.25, y - s * 3.12, s * .30, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(198,42,44,0.95)';
      ctx.beginPath(); ctx.arc(x - s * 1.28, y - s * 3.30, s * .21, 0, 7); ctx.fill();
      // 尾羽
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(x + s * .5, y - s * 2.15); ctx.lineTo(x + s * 1.25, y - s * 1.5);
      ctx.lineTo(x + s * .55, y - s * 1.6); ctx.closePath(); ctx.fill();
    };
    crane(CW * 0.42, CH * 0.66, 15 * SS, 'rgba(44,44,50,0.92)');
    crane(CW * 0.60, CH * 0.62, 12 * SS, 'rgba(60,60,66,0.88)');
    crane(CW * 0.53, CH * 0.70, 20 * SS, 'rgba(28,28,34,0.95)');
    crane(CW * 0.74, CH * 0.69, 17 * SS, 'rgba(36,36,42,0.93)');

    // 远处飞鸟群（V 字队列）
    const flock = (cx, cy, n, sc, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 1.6 * SS * sc; ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / 2), side = i % 2 ? 1 : -1;
        const x = cx + side * row * CW * .022;
        const y = cy - row * CH * .020;
        const w = CW * .011 * sc;
        ctx.beginPath();
        ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x - w * .4, y - w * .5, x, y - w * .12);
        ctx.quadraticCurveTo(x + w * .4, y - w * .5, x + w, y);
        ctx.stroke();
      }
    };
    flock(CW * 0.30, CH * 0.30, 9, 1.0, 'rgba(70,74,82,0.75)');
    flock(CW * 0.66, CH * 0.36, 7, 0.8, 'rgba(88,92,100,0.6)');

    // 水面浮萍/水草斑块
    const pad = mulberry32(73);
    for (let i = 0; i < 160; i++) {
      const x = pad() * CW;
      const y = hz + CH * 0.10 + pad() * CH * 0.72;
      const rx = CW * (0.004 + pad() * 0.016), ry = CH * (0.002 + pad() * 0.007);
      ctx.fillStyle = `rgba(${70 + pad() * 40 | 0},${104 + pad() * 44 | 0},${62 + pad() * 30 | 0},${0.14 + pad() * 0.3})`;
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fill();
    }

    // 前景枯草与水线
    const fg = mulberry32(89);
    ctx.strokeStyle = 'rgba(96,92,58,0.8)'; ctx.lineCap = 'round';
    for (let i = 0; i < 620; i++) {
      const x = fg() * CW;
      const base = CH * (0.965 + fg() * 0.04);
      const h = CH * (0.02 + fg() * 0.055);
      ctx.lineWidth = (1 + fg() * 1.6) * SS;
      ctx.beginPath(); ctx.moveTo(x, base);
      ctx.quadraticCurveTo(x + (fg() - .5) * h * .3, base - h * .6, x + (fg() - .5) * h * .8, base - h);
      ctx.stroke();
    }

    vignette(ctx, 0.28);
  }

  /* ================================================================
     4. 农田生态系统 —— 三江平原（黑土商品粮基地）
     ================================================================ */
  function farmland(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [104, 156, 206], [226, 226, 208]);
    const hz = CH * 0.40;

    sunGlow(ctx, CW * 0.30, CH * 0.18, CH * 0.05, [255, 254, 238], [255, 244, 196], 0.36);
    puffy(ctx, CW * 0.68, CH * 0.14, CW * 0.26, CH * 0.06, [255, 255, 255], 0.72);

    // 远处林带
    ridge(ctx, hz, 0.012, 1.6, 0.7, [76, 104, 82]);
    // 防风林带（树冠锯齿）
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, hz + CH * 0.012);
    for (let x = 0; x <= CW; x += CW / 90) {
      ctx.lineTo(x, hz + CH * 0.012 - Math.abs(Math.sin(x / CW * 46)) * CH * 0.014);
    }
    ctx.lineTo(CW, hz + CH * 0.03); ctx.lineTo(0, hz + CH * 0.03); ctx.closePath();
    ctx.fillStyle = 'rgba(48,76,58,0.95)'; ctx.fill();
    ctx.restore();

    /* 透视田块网格 */
    const vpx = CW * 0.5;                       // 灭点
    const ROWS = 13;
    const rowY = i => {
      const t = i / ROWS;
      return hz + CH * 0.03 + Math.pow(t, 1.85) * CH * 0.70;
    };
    const colX = (i, j) => {
      const t = i / ROWS;
      const spread = lerp(0.55, 1, t);          // 近处更宽
      const p = (j - 4) / 4;
      return vpx + p * CW * 0.62 * spread + Math.sin(j * 2.3) * CW * 0.012 * spread;
    };

    const rnd = mulberry32(67);
    const cropCols = [
      [206, 186, 96], [178, 186, 92], [148, 172, 78], [196, 202, 118],
      [170, 150, 84], [136, 160, 72], [214, 198, 128], [122, 148, 66]
    ];
    const soil = [122, 96, 68];

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < 9; j++) {
        if (j === 8) continue;
        const y0 = rowY(i), y1 = rowY(i + 1);
        const x0 = colX(i, j), x1 = colX(i, j + 1);
        const x2 = colX(i + 1, j + 1), x3 = colX(i + 1, j);
        // 水渠 / 垄沟
        const isChannel = (j % 4 === 2);
        const isBare = rnd() < 0.10;
        let col;
        if (isChannel) col = [92, 128, 132];
        else if (isBare) col = soil;
        else col = cropCols[(i * 3 + j * 2) % cropCols.length];

        const depth = 0.42 + 0.58 * (i / ROWS);
        const c = mix(col, [40, 46, 40], (1 - depth) * 0.35);

        ctx.beginPath();
        ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x2, y1); ctx.lineTo(x3, y1);
        ctx.closePath();
        ctx.fillStyle = rgba(c, 1); ctx.fill();

        // 田埂
        if (!isChannel && i % 2 === 0) {
          ctx.strokeStyle = rgba(mix(c, [255, 250, 230], 0.28), 0.5);
          ctx.lineWidth = 1.2 * SS;
          ctx.stroke();
        }
      }
    }

    // 田块内的作物纹理：随透视收敛，近处行列明显、远处融合
    ctx.save();
    ctx.beginPath(); ctx.rect(0, CH * 0.60, CW, CH * 0.44); ctx.clip();
    const r2 = mulberry32(83);
    for (let i = 0; i < 3000; i++) {
      const t = r2();                 // 0=远 1=近
      const y = CH * 0.60 + Math.pow(t, 1.7) * CH * 0.44;
      const x = r2() * CW;
      const scale = 0.25 + t * 1.5;   // 近处笔画更长更粗
      const ln = CH * 0.006 * scale;
      ctx.strokeStyle = r2() < 0.55
        ? `rgba(240,230,170,${0.12 + r2() * 0.34 * t})`
        : `rgba(68,82,44,${0.10 + r2() * 0.30 * t})`;
      ctx.lineWidth = Math.max(0.8, 1.1 * scale * SS);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (r2() - .5) * ln * 0.5, y + ln);
      ctx.stroke();
    }
    ctx.restore();

    // 前景：金黄成熟作物 + 秸秆垄（强化近景层次）
    const r3 = mulberry32(97);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, CH * 0.90, CW, CH * 0.14); ctx.clip();
    vgrad(ctx, 0, CH * 0.90, CW, CH * 0.14, [188, 158, 74], [140, 114, 52]);
    for (let i = 0; i < 2400; i++) {
      const x = r3() * CW;
      const y = CH * 0.90 + r3() * CH * 0.14;
      ctx.strokeStyle = r3() < 0.5
        ? `rgba(226,206,132,${0.2 + r3() * 0.4})`
        : `rgba(112,88,40,${0.2 + r3() * 0.4})`;
      ctx.lineWidth = (0.9 + r3() * 1.4) * SS;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (r3() - .5) * 8, y - 10 - r3() * 12); ctx.stroke();
    }
    ctx.restore();

    // 田埂小路（从近景通向远方，强化纵深）
    ctx.beginPath();
    ctx.moveTo(CW * 0.50, CH * 1.02);
    ctx.lineTo(CW * 0.505, CH * 0.60);
    ctx.lineTo(CW * 0.512, CH * 0.42);
    ctx.strokeStyle = 'rgba(196,182,150,0.55)';
    ctx.lineWidth = 7 * SS; ctx.stroke();
    ctx.strokeStyle = 'rgba(222,212,182,0.4)';
    ctx.lineWidth = 3 * SS; ctx.stroke();

    // 前景收割机
    const mx = CW * 0.80, my = CH * 0.90, ms = CW * 0.052;
    ctx.fillStyle = 'rgba(176,42,34,0.97)';
    ctx.fillRect(mx - ms * .5, my - ms * .78, ms * 1.05, ms * .62);
    ctx.fillStyle = 'rgba(150,36,30,0.97)';
    ctx.fillRect(mx + ms * .3, my - ms * 1.02, ms * .5, ms * .26);
    ctx.fillStyle = 'rgba(46,44,44,0.95)';
    ctx.beginPath(); ctx.arc(mx - ms * .32, my - ms * .12, ms * .28, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(mx + ms * .34, my - ms * .10, ms * .36, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,190,160,0.85)'; ctx.lineWidth = 2.4 * SS;
    ctx.beginPath();
    ctx.moveTo(mx + ms * .55, my - ms * .95);
    ctx.lineTo(mx + ms * 1.15, my - ms * .5);
    ctx.lineTo(mx + ms * 1.5, my - ms * .5);
    ctx.stroke();

    vignette(ctx, 0.26);
  }

  /* ================================================================
     5. 海洋与海岸带生态系统 —— 三亚珊瑚礁
     ================================================================ */
  function marine(ctx) {
    const hz = CH * 0.34;
    vgrad(ctx, 0, 0, CW, CH, [64, 168, 214], [190, 232, 238]);

    sunGlow(ctx, CW * 0.20, CH * 0.13, CH * 0.05, [255, 254, 236], [255, 246, 200], 0.45);
    puffy(ctx, CW * 0.66, CH * 0.11, CW * 0.24, CH * 0.055, [255, 255, 255], 0.85);

    // 海面（由远及近变深）
    const sea = [
      [hz, 0.30, [104, 196, 214]], [hz + CH * 0.08, 0.20, [78, 182, 208]],
      [hz + CH * 0.18, 0.12, [52, 160, 194]], [hz + CH * 0.30, 0.06, [32, 132, 176]],
      [hz + CH * 0.44, 0.02, [20, 100, 152]]
    ];
    sea.forEach(([y, a, c]) => vgrad(ctx, 0, y, CW, CH - y + 20, c, mix(c, [8, 56, 100], .35)));

    // 远处海岛与椰树
    ctx.fillStyle = 'rgba(44,92,88,0.85)';
    ctx.beginPath();
    ctx.moveTo(CW * 0.60, hz);
    ctx.quadraticCurveTo(CW * 0.70, hz - CH * 0.075, CW * 0.84, hz);
    ctx.closePath(); ctx.fill();
    const palm = (x, y, s) => {
      ctx.strokeStyle = 'rgba(38,70,58,0.95)'; ctx.lineWidth = 2.4 * SS;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + s * .16, y - s * .55, x + s * .3, y - s * .9); ctx.stroke();
      ctx.strokeStyle = 'rgba(34,96,72,0.95)'; ctx.lineWidth = 3 * SS;
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI * (0.15 + i * 0.14);
        ctx.beginPath();
        ctx.moveTo(x + s * .3, y - s * .9);
        ctx.quadraticCurveTo(
          x + s * .3 + Math.cos(a) * s * .34, y - s * .9 + Math.sin(a) * s * .30,
          x + s * .3 + Math.cos(a) * s * .62, y - s * .9 + Math.sin(a) * s * .48 + s * .1);
        ctx.stroke();
      }
    };
    palm(CW * 0.74, hz - CH * 0.030, CH * 0.062);
    palm(CW * 0.795, hz - CH * 0.020, CH * 0.048);

    // 海面高光
    const rnd = mulberry32(97);
    for (let i = 0; i < 240; i++) {
      const t = rnd();
      const y = hz + t * CH * 0.55;
      const x = rnd() * CW;
      ctx.strokeStyle = `rgba(255,255,255,${(0.05 + rnd() * 0.18) * (1 - t * 0.5)})`;
      ctx.lineWidth = (1 + rnd() * 2) * SS;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CW * (0.02 + rnd() * 0.08), y); ctx.stroke();
    }

    /* ---- 水下珊瑚礁（透视：越近越大） ---- */
    // 珊瑚枝
    const branchCoral = (x, y, s, col) => {
      ctx.strokeStyle = col; ctx.lineCap = 'round';
      const draw = (px, py, len, ang, w) => {
        if (len < s * .09) return;
        const ex = px + Math.cos(ang) * len, ey = py + Math.sin(ang) * len;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
        draw(ex, ey, len * .72, ang - .42 - Math.random() * .2, w * .7);
        draw(ex, ey, len * .72, ang + .42 + Math.random() * .2, w * .7);
        if (Math.random() < .5) draw(ex, ey, len * .55, ang + (Math.random() - .5) * .3, w * .6);
      };
      draw(x, y, s, -Math.PI / 2, s * .13);
    };
    // 扇珊瑚
    const fanCoral = (x, y, s, col) => {
      ctx.save(); ctx.translate(x, y); ctx.fillStyle = rgba(col, .92);
      ctx.beginPath(); ctx.moveTo(0, 0);
      for (let a = -Math.PI * .82; a <= -Math.PI * .18; a += .09) {
        ctx.lineTo(Math.cos(a) * s * 1.25, Math.sin(a) * s);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba(mix(col, [255, 255, 255], .3), .55); ctx.lineWidth = 1.4 * SS;
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI * .78 + i * .075;
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * s * 1.15, Math.sin(a) * s * .92); ctx.stroke();
      }
      ctx.restore();
    };
    // 脑珊瑚
    const brainCoral = (x, y, s, col) => {
      ctx.fillStyle = rgba(col, .93);
      ctx.beginPath(); ctx.ellipse(x, y - s * .5, s, s * .8, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = rgba(mix(col, [255, 255, 255], .35), .5); ctx.lineWidth = 1.3 * SS;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.ellipse(x, y - s * .5, s * (.2 + i * .17), s * (.16 + i * .13), 0.2, 0, 7);
        ctx.stroke();
      }
    };

    const corals = [
      //远景
      [0.10, 0.60, 0.030, 'branch', [214, 122, 118]], [0.20, 0.625, 0.026, 'fan', [236, 152, 176]],
      [0.86, 0.615, 0.028, 'branch', [198, 110, 132]], [0.93, 0.64, 0.024, 'brain', [228, 186, 118]],
      [0.32, 0.66, 0.034, 'branch', [236, 140, 96]], [0.62, 0.655, 0.032, 'brain', [216, 164, 128]],
      [0.72, 0.68, 0.038, 'fan', [232, 128, 160]],
      // 中景
      [0.15, 0.755, 0.062, 'fan', [240, 146, 172]], [0.27, 0.79, 0.055, 'branch', [232, 126, 96]],
      [0.42, 0.745, 0.050, 'brain', [226, 176, 116]], [0.58, 0.80, 0.062, 'branch', [214, 116, 130]],
      [0.76, 0.765, 0.058, 'fan', [238, 160, 182]], [0.90, 0.82, 0.065, 'branch', [230, 134, 104]],
      // 前景
      [0.06, 0.94, 0.115, 'branch', [206, 104, 128]], [0.24, 0.99, 0.135, 'fan', [244, 158, 186]],
      [0.47, 0.92, 0.105, 'brain', [224, 170, 110]], [0.68, 1.02, 0.145, 'branch', [218, 118, 136]],
      [0.88, 0.95, 0.125, 'fan', [236, 148, 178]]
    ];
    corals.forEach(([fx, fy, fs, kind, col]) => {
      const x = CW * fx, y = CH * fy, s = CH * fs;
      if (kind === 'branch') branchCoral(x, y, s, rgba(col, .95));
      else if (kind === 'fan') fanCoral(x, y, s, col);
      else brainCoral(x, y, s, col);
    });

    // 鱼群
    const fish = (x, y, s, col, dir) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, 0, s * .6, s * .3, 0, 0, 7); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * .5, 0); ctx.lineTo(-s * .95, -s * .3); ctx.lineTo(-s * .95, s * .3);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    for (let k = 0; k < 3; k++) {
      const n = 7 - k;
      for (let i = 0; i < n; i++) {
        fish(CW * (0.62 + i * 0.030), CH * (0.53 + k * 0.045) + (i % 2) * CH * 0.012,
          CH * (0.016 - k * 0.003),
          ['rgba(255,196,72,.95)', 'rgba(255,140,60,.92)', 'rgba(120,220,230,.9)'][k], 1);
      }
    }
    for (let i = 0; i < 5; i++) {
      fish(CW * (0.12 + i * 0.035), CH * (0.80 + i * 0.02), CH * 0.020, 'rgba(250,236,180,.9)', -1);
    }

    // 海龟
    const turtle = (x, y, s, dir) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.fillStyle = 'rgba(74,110,84,0.95)';
      ctx.beginPath(); ctx.ellipse(0, 0, s * .8, s * .52, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(58,92,70,0.95)';
      ctx.beginPath(); ctx.arc(s * .78, 0, s * .26, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(58,92,70,0.9)'; ctx.lineWidth = s * .1;
      [[-.3, -1], [-.3, 1], [.2, -1], [.2, 1]].forEach(([ox, oy]) => {
        ctx.beginPath(); ctx.moveTo(ox * s, oy * s * .35);
        ctx.quadraticCurveTo(ox * s * 1.5, oy * s * 1.1, ox * s * 1.9, oy * s * 1.5);
        ctx.stroke();
      });
      ctx.restore();
    };
    turtle(CW * 0.34, CH * 0.86, CH * 0.038, 1);

    // 焦散光斑
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 120; i++) {
      const x = rnd() * CW, y = hz + rnd() * (CH - hz);
      ctx.fillStyle = `rgba(190,240,255,${0.03 + rnd() * 0.05})`;
      ctx.beginPath(); ctx.ellipse(x, y, CW * (.01 + rnd() * .035), CH * (.004 + rnd() * .012), 0, 0, 7); ctx.fill();
    }
    ctx.restore();

    vignette(ctx, 0.30);
  }

  /* ================================================================
     6. 高山生态系统 —— 珠穆朗玛峰（高山寒漠 / 永久冰雪带）
     ================================================================ */
  function alpine(ctx) {
    vgrad(ctx, 0, 0, CW, CH, [16, 30, 78], [156, 168, 208]);
    const hz = CH * 0.78;

    // 高处星点（稀薄空气、洁净天空）
    const rnd = mulberry32(101);
    for (let i = 0; i < 200; i++) {
      const x = rnd() * CW, y = rnd() * CH * 0.5;
      const a = 0.12 + rnd() * 0.5;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(x, y, (rnd() < .8 ? 1 : 1.8) * SS, 0, 7); ctx.fill();
    }

    sunGlow(ctx, CW * 0.82, CH * 0.20, CH * 0.045, [255, 254, 244], [255, 238, 208], 0.40);

    // 霞光带
    let g = ctx.createLinearGradient(0, CH * 0.18, 0, hz);
    g.addColorStop(0, 'rgba(255,196,150,0)');
    g.addColorStop(0.55, 'rgba(255,176,142,0.30)');
    g.addColorStop(1, 'rgba(255,206,170,0.05)');
    ctx.fillStyle = g; ctx.fillRect(0, CH * 0.18, CW, hz - CH * 0.18);

    /* --- 远峰群 --- */
    const peak = (cx, baseY, h, w, rock, snowLit, snowShade) => {
      ctx.beginPath();
      ctx.moveTo(cx - w, baseY);
      ctx.lineTo(cx - w * .30, baseY - h * .55);
      ctx.lineTo(cx - w * .08, baseY - h * .92);
      ctx.lineTo(cx, baseY - h);
      ctx.lineTo(cx + w * .12, baseY - h * .86);
      ctx.lineTo(cx + w * .34, baseY - h * .52);
      ctx.lineTo(cx + w, baseY);
      ctx.closePath();
      ctx.fillStyle = rgba(rock, 1); ctx.fill();
      // 雪冠（受光面）
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - w, baseY); ctx.lineTo(cx - w * .30, baseY - h * .55);
      ctx.lineTo(cx - w * .08, baseY - h * .92); ctx.lineTo(cx, baseY - h);
      ctx.lineTo(cx + w * .12, baseY - h * .86); ctx.lineTo(cx + w * .34, baseY - h * .52);
      ctx.lineTo(cx + w, baseY); ctx.closePath();
      ctx.clip();
      ctx.fillStyle = rgba(snowShade, 1);
      ctx.fillRect(cx - w * .45, baseY - h * 1.1, w * .62, h * 1.3);
      ctx.fillStyle = rgba(snowLit, 1);
      ctx.beginPath();
      ctx.moveTo(cx, baseY - h);
      ctx.lineTo(cx + w * .02, baseY - h * .88);
      ctx.lineTo(cx + w * .16, baseY - h * .70);
      ctx.lineTo(cx + w * .06, baseY - h * .74);
      ctx.lineTo(cx - w * .10, baseY - h * .62);
      ctx.lineTo(cx - w * .16, baseY - h * .50);
      ctx.lineTo(cx - w * .40, baseY - h * .30);
      ctx.lineTo(cx - w * .5, baseY);
      ctx.lineTo(cx + w * .1, baseY);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      // 山脊棱线
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6 * SS;
      ctx.beginPath();
      ctx.moveTo(cx - w * .30, baseY - h * .55);
      ctx.lineTo(cx - w * .08, baseY - h * .92);
      ctx.lineTo(cx, baseY - h);
      ctx.stroke();
    };

    peak(CW * 0.16, hz - CH * .02, CH * .30, CW * .17, [104, 112, 148], [214, 226, 244], [140, 152, 186]);
    peak(CW * 0.84, hz - CH * .03, CH * .26, CW * .15, [96, 104, 142], [208, 222, 242], [130, 144, 180]);

    /* --- 主峰：珠穆朗玛 --- */
    const ex = CW * 0.48, eBase = hz + CH * .10, eH = CH * .68, eW = CW * .27;
    ctx.beginPath();
    ctx.moveTo(ex - eW, eBase);
    ctx.lineTo(ex - eW * .26, eBase - eH * .48);
    ctx.lineTo(ex - eW * .10, eBase - eH * .86);
    ctx.lineTo(ex, eBase - eH);
    ctx.lineTo(ex + eW * .10, eBase - eH * .90);
    ctx.lineTo(ex + eW * .26, eBase - eH * .62);
    ctx.lineTo(ex + eW * .40, eBase - eH * .30);
    ctx.lineTo(ex + eW, eBase);
    ctx.closePath();
    ctx.fillStyle = rgba([74, 82, 116], 1); ctx.fill();

    // 主峰雪被：左侧受光、右侧背光
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ex - eW, eBase); ctx.lineTo(ex - eW * .26, eBase - eH * .48);
    ctx.lineTo(ex - eW * .10, eBase - eH * .86); ctx.lineTo(ex, eBase - eH);
    ctx.lineTo(ex + eW * .10, eBase - eH * .90); ctx.lineTo(ex + eW * .26, eBase - eH * .62);
    ctx.lineTo(ex + eW * .40, eBase - eH * .30); ctx.lineTo(ex + eW, eBase);
    ctx.closePath(); ctx.clip();

    ctx.fillStyle = 'rgba(158, 172, 208, 1)';           // 背光冰雪
    ctx.fillRect(ex - eW * .1, eBase - eH * 1.2, eW * 1.4, eH * 1.4);
    ctx.fillStyle = 'rgba(240, 246, 255, 1)';           // 受光冰雪
    ctx.beginPath();
    ctx.moveTo(ex, eBase - eH);
    ctx.lineTo(ex - eW * .04, eBase - eH * .84);
    ctx.lineTo(ex - eW * .18, eBase - eH * .66);
    ctx.lineTo(ex - eW * .10, eBase - eH * .70);
    ctx.lineTo(ex - eW * .26, eBase - eH * .44);
    ctx.lineTo(ex - eW * .18, eBase - eH * .48);
    ctx.lineTo(ex - eW * .42, eBase - eH * .18);
    ctx.lineTo(ex - eW * .34, eBase);
    ctx.lineTo(ex - eW * .5, eBase);
    ctx.closePath(); ctx.fill();

    // 岩石露头（雪线附近的暗色条带）
    ctx.fillStyle = 'rgba(92, 96, 128, 0.85)';
    for (let i = 0; i < 7; i++) {
      const ry = eBase - eH * (0.10 + i * 0.055);
      ctx.beginPath();
      ctx.moveTo(ex - eW * (.7 - i * .06), ry);
      ctx.quadraticCurveTo(ex - eW * .1, ry - CH * .012, ex + eW * (.6 - i * .06), ry + CH * .004);
      ctx.lineTo(ex + eW * (.6 - i * .06), ry + CH * .009);
      ctx.quadraticCurveTo(ex - eW * .1, ry - CH * .003, ex - eW * (.7 - i * .06), ry + CH * .005);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // 主峰棱线
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.2 * SS;
    ctx.beginPath();
    ctx.moveTo(ex - eW * .26, eBase - eH * .48);
    ctx.lineTo(ex - eW * .10, eBase - eH * .86);
    ctx.lineTo(ex, eBase - eH);
    ctx.lineTo(ex + eW * .10, eBase - eH * .90);
    ctx.stroke();

    // 峰顶旗幡（珠峰 summit marker）
    ctx.strokeStyle = 'rgba(40,42,50,0.9)'; ctx.lineWidth = 2 * SS;
    ctx.beginPath(); ctx.moveTo(ex, eBase - eH); ctx.lineTo(ex, eBase - eH - CH * .052); ctx.stroke();
    const flagCols = [[222, 76, 66], [248, 196, 68], [86, 168, 224], [240, 240, 240], [92, 180, 116]];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = rgba(flagCols[i], .95);
      const fy = eBase - eH - CH * .050 + i * CH * .0092;
      ctx.fillRect(ex, fy, CW * .022, CH * .0072);
    }

    // 高原面上的冰裂缝与碎石（增强岩质感）
    for (let i = 0; i < 60; i++) {
      const x = rnd() * CW, y = CH * (0.80 + rnd() * 0.20);
      const len = CW * (0.012 + rnd() * 0.05);
      ctx.strokeStyle = `rgba(${110 + rnd() * 60 | 0},${126 + rnd() * 60 | 0},${158 + rnd() * 60 | 0},${0.2 + rnd() * 0.3})`;
      ctx.lineWidth = (1 + rnd() * 2.4) * SS;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * (rnd() - .5), y + len * 0.32);
      ctx.stroke();
    }
    // 前景碎石堆
    for (let i = 0; i < 130; i++) {
      const x = rnd() * CW, y = CH * (0.93 + rnd() * 0.09);
      const r = (1.6 + rnd() * 4.4) * SS;
      ctx.fillStyle = `rgba(${118 + rnd() * 56 | 0},${132 + rnd() * 52 | 0},${164 + rnd() * 50 | 0},${0.35 + rnd() * 0.5})`;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.68, rnd() * 3, 0, 7); ctx.fill();
    }
    // 雪面高光斑
    for (let i = 0; i < 40; i++) {
      const x = rnd() * CW, y = CH * (0.80 + rnd() * 0.19);
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.13})`;
      ctx.beginPath(); ctx.ellipse(x, y, CW * (.008 + rnd() * .03), CH * (.003 + rnd() * .009), 0, 0, 7); ctx.fill();
    }

    // 前景冰雪坡与岩石
    ridge(ctx, eBase + CH * .10, 0.030, 0.9, 1.7, [222, 232, 248], CH);
    strokeRidge(ctx, eBase + CH * .10, 0.030, 0.9, 1.7, 'rgba(255,255,255,0.7)', 2.4 * SS, CH);
    ridge(ctx, CH * 0.97, 0.020, 1.25, 3.4, [178, 190, 216], CH);

    // 高原风（雪雾）
    for (let i = 0; i < 90; i++) {
      const x = rnd() * CW, y = CH * (0.62 + rnd() * 0.34);
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.16})`;
      ctx.beginPath(); ctx.ellipse(x, y, CW * (.015 + rnd() * .07), CH * (.004 + rnd() * .012), 0, 0, 7); ctx.fill();
    }

    vignette(ctx, 0.34);
  }

  /* ================================================================
     生成器
     ================================================================ */
  const SCENES = { forest, grassland, wetland, farmland, marine, alpine };

  function generate(name) {
    const c = document.createElement('canvas');
    c.width = CW; c.height = CH;
    const ctx = c.getContext('2d');
    const fn = SCENES[name];
    if (fn) {
      try { fn(ctx); }
      catch (e) {
        vgrad(ctx, 0, 0, CW, CH, [40, 46, 70], [18, 22, 38]);
        ctx.fillStyle = '#fff'; ctx.font = `${26 * SS}px sans-serif`;
        ctx.fillText('插画生成失败: ' + e.message, 40, 80);
        console.error('[illustrations]', name, e);
      }
    }
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    out.getContext('2d').drawImage(c, 0, 0, W, H);
    return out.toDataURL('image/jpeg', 0.9);
  }

  const I = global.ILLUSTRATIONS || (global.ILLUSTRATIONS = {});
  Object.keys(SCENES).forEach(k => { I[k] = () => generate(k); });

  // 便于离线检查
  if (typeof module !== 'undefined' && module.exports) module.exports = { SCENES };
})(typeof window !== 'undefined' ? window : this);
