/* ============================================================
   Pulse · 3D 运维根因沙盘 —— 渲染层
   自研透视投影：世界坐标 (x,y,z) → 屏幕 (sx,sy) + 深度排序
   粒子系统模拟请求在微服务间的流动
   ============================================================ */

export const PALETTE = {
  bg0: '#05070f',
  bg1: '#0a0f1e',
  grid: 'rgba(90,120,200,.13)',
  gridStrong: 'rgba(120,160,255,.26)',
  hot: '#f43f5e',
  warm: '#fb923c',
  cool: '#38bdf8',
  ok: '#34d399',
  text: '#e6ebff',
  dim: '#8b93b8'
};

const TIER_COLOR = {
  gw: '#38bdf8', biz: '#a78bfa', data: '#34d399', ext: '#fbbf24'
};

/* ── 相机 ──────────────────────────────────────────── */
export class Camera {
  constructor() {
    this.theta = -0.62;     // 方位角
    this.phi = 1.02;         // 仰角
    this.dist = 11.0;       // 距离
    this.tx = 0; this.ty = 0; this.tz = 0;
    this.fov = 52 * Math.PI / 180;
  }
  rotate(dx, dy) {
    this.theta -= dx * 0.006;
    this.phi = Math.max(0.32, Math.min(1.46, this.phi + dy * 0.005));
  }
  pan(dx, dy) {
    const s = this.dist * 0.0016;
    this.tx += dx * s * Math.cos(this.theta);
    this.tz += dx * s * Math.sin(this.theta);
    this.ty = Math.max(-1.5, Math.min(2.5, this.ty + dy * s));
  }
  zoom(d) { this.dist = Math.max(5.5, Math.min(22, this.dist + d * 0.0022)); }

  /* 世界 → 相机空间
     相机沿自身朝向后退 dist 距离，所以视线方向的深度 = dist + Z*cp + y*sp */
  toCam(wx, wy, wz) {
    const x = wx - this.tx, y = wy - this.ty, z = wz - this.tz;
    const ct = Math.cos(this.theta), st = Math.sin(this.theta);
    const X = x * ct - z * st;
    const Z = x * st + z * ct;
    const cp = Math.cos(this.phi), sp = Math.sin(this.phi);
    const Y = y * cp - Z * sp;
    const D = this.dist + Z * cp + y * sp;
    return { X, Y, D };
  }
  /* 相机空间 → 屏幕 */
  project(wx, wy, wz, W, H) {
    const c = this.toCam(wx, wy, wz);
    if (c.D < 0.35) return null;
    const f = (H / 2) / Math.tan(this.fov / 2) / c.D;
    return {
      sx: W / 2 + c.X * f,
      sy: H / 2 - c.Y * f,
      d: c.D,
      s: f
    };
  }
}

/* ── 场景：节点 + 连线 + 粒子 ──────────────────────── */
export class PulseScene {
  /**
   * @param {object} opts { services, metrics, traces, roots }
   */
  constructor(opts) {
    this.services = opts.services;
    this.metrics = opts.metrics;
    this.traces = opts.traces;
    this.roots = opts.roots || [];
    this.cam = new Camera();
    this.particles = [];
    this.pulses = [];      // 扩散冲击波
    this.selected = null;
    this.hover = null;
    this.time = 0;
    this.rnd = mulberry(20261022);
    this._buildParticles();
  }

  setData(metrics, traces, roots) {
    this.metrics = metrics; this.traces = traces; this.roots = roots;
    this._buildParticles();
  }

  svc(id) { return this.services.find(s => s.id === id); }

  _buildParticles() {
    this.particles = [];
    const byId = {};
    this.services.forEach(s => byId[s.id] = s);
    const t = this.traces || [];
    for (let i = 0; i < 150; i++) {
      const tr = t.length ? t[Math.floor(this.rnd() * t.length)] : null;
      const path = tr ? tr.path : ['gw'];
      const seg = Math.floor(this.rnd() * Math.max(1, path.length - 1));
      const from = byId[path[seg]] || byId.gw;
      const to = byId[path[seg + 1]] || from;
      this.particles.push({
        from: from.id, to: to.id,
        t: this.rnd(),
        speed: 0.22 + this.rnd() * 0.5,
        size: 0.7 + this.rnd() * 1.9,
        bad: tr ? tr.status !== 'ok' : false,
        jitter: (this.rnd() - 0.5) * 0.22
      });
    }
  }

  /* 服务当前负载 */
  loadOf(id) {
    const m = this.metrics && this.metrics.points[id];
    if (!m) return { cpu: 0.3, err: 0, p95: 0 };
    const p = m.points[m.points.length - 1];
    return {
      cpu: Math.max(0, Math.min(1, p.cpu / 100)),
      err: Math.max(0, Math.min(1, p.errRate / 8)),
      p95: p.p95
    };
  }

  rootInfo(id) {
    const r = this.roots.find(x => x.id === id);
    return r || null;
  }

  update(dt) {
    this.time += dt;
    for (const p of this.particles) {
      p.t += dt * p.speed;
      if (p.t >= 1) {
        p.t = 0;
        p.from = p.to;
        const tr = this.traces && this.traces.length
          ? this.traces[Math.floor(this.rnd() * this.traces.length)] : null;
        const path = tr ? tr.path : ['gw'];
        const idx = path.indexOf(p.from);
        const next = idx >= 0 && idx < path.length - 1 ? path[idx + 1] : path[0];
        p.to = next;
        p.bad = tr ? tr.status !== 'ok' : false;
        p.speed = 0.22 + this.rnd() * 0.5;
      }
    }
    this.pulses = this.pulses.filter(p => (p.life -= dt) > 0);
  }

  /* 根因确认时发出冲击波 */
  burst(id) { this.pulses.push({ id, life: 1.4, max: 1.4 }); }

  /* ── 绘制 ───────────────────────────────────────── */
  draw(ctx, W, H) {
    const cam = this.cam;
    // 背景
    const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, Math.max(W, H) * 0.72);
    g.addColorStop(0, '#0d1428');
    g.addColorStop(0.55, PALETTE.bg1);
    g.addColorStop(1, PALETTE.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    this.drawGrid(ctx, W, H);

    // 深度排序的绘制列表
    const drawables = [];
    for (const s of this.services) {
      const p = cam.project(s.x, 0.55, s.z, W, H);
      if (!p) continue;
      drawables.push({ kind: 'node', s, p, d: p.d });
    }
    // 连线（依赖边）
    for (const s of this.services) {
      for (const dep of s.deps) {
        const t = this.svc(dep);
        if (!t) continue;
        const a = cam.project(s.x, 0.28, s.z, W, H);
        const b = cam.project(t.x, 0.28, t.z, W, H);
        if (!a || !b) continue;
        drawables.push({ kind: 'edge', a, b, from: s.id, to: t.id, d: (a.d + b.d) / 2 });
      }
    }
    drawables.sort((p, q) => q.d - p.d);

    for (const d of drawables) {
      if (d.kind === 'edge') this.drawEdge(ctx, d);
      else this.drawNode(ctx, d.s, d.p);
    }

    this.drawParticles(ctx, W, H);
    this.drawPulses(ctx, W, H);
    this.drawHud(ctx, W, H);
  }

  drawGrid(ctx, W, H) {
    const cam = this.cam;
    const R = 7;
    const S = 1;
    ctx.lineWidth = 1;
    // 地面网格（透视网格由投影自动产生）
    for (let i = -R; i <= R; i++) {
      const a = cam.project(i * S, 0, -R * S, W, H);
      const b = cam.project(i * S, 0, R * S, W, H);
      if (!a || !b) continue;
      ctx.strokeStyle = Math.abs(i) % 3 === 0 ? PALETTE.gridStrong : PALETTE.grid;
      ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
      const c = cam.project(-R * S, 0, i * S, W, H);
      const e = cam.project(R * S, 0, i * S, W, H);
      if (!c || !e) continue;
      ctx.strokeStyle = Math.abs(i) % 3 === 0 ? PALETTE.gridStrong : PALETTE.grid;
      ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(e.sx, e.sy); ctx.stroke();
    }
    // 外圈辉光
    const o1 = cam.project(-R * S, 0, -R * S, W, H);
    const o2 = cam.project(R * S, 0, R * S, W, H);
    if (o1 && o2) {
      ctx.strokeStyle = 'rgba(56,189,248,.10)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(o1.sx, o1.sy); ctx.lineTo(o2.sx, o2.sy); ctx.stroke();
    }
  }

  drawEdge(ctx, d) {
    const { a, b } = d;
    const broken = this._edgeBroken(d.from, d.to);
    const alpha = Math.max(0.05, 0.55 - (a.d - 4) * 0.03);
    ctx.strokeStyle = broken
      ? `rgba(244,63,94,${0.55 * alpha + 0.18})`
      : `rgba(90,120,200,${alpha})`;
    ctx.lineWidth = broken ? 2.1 : 1.1;
    if (broken) { ctx.setLineDash([6, 4]); ctx.lineDashOffset = -this.time * 22; }
    else ctx.setLineDash([]);
    ctx.beginPath();
    const mx = (a.sx + b.sx) / 2, my = (a.sy + b.sy) / 2 - Math.abs(b.sx - a.sx) * 0.05;
    ctx.moveTo(a.sx, a.sy);
    ctx.quadraticCurveTo(mx, my, b.sx, b.sy);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _edgeBroken(from, to) {
    const rf = this.rootInfo(from), rt = this.rootInfo(to);
    const bad = (rf && rf.score > 30) || (rt && rt.score > 30);
    if (!bad) return false;
    // 根因的下游边标红
    const target = this.roots[0];
    return target && (to === target.id || from === target.id);
  }

  drawNode(ctx, s, p) {
    const load = this.loadOf(s.id);
    const info = this.rootInfo(s.id);
    const isRoot = info && info.isRoot;
    const color = hexRGB(TIER_COLOR[s.tier] || '#a78bfa');
    const h = 0.42 + load.cpu * 1.5;      // 柱高随 CPU
    const w = 0.34;
    const base = p;

    // 地面光斑
    const gg = ctx.createRadialGradient(base.sx, base.sy, 0, base.sx, base.sy, 38 * (p.s / 160));
    const gc = isRoot ? '244,63,94' : (load.err > 0.35 ? '251,146,60' : '56,189,248');
    gg.addColorStop(0, `rgba(${gc},${isRoot ? 0.42 : 0.20})`);
    gg.addColorStop(1, `rgba(${gc},0)`);
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.ellipse(base.sx, base.sy, 38 * (p.s / 160), 16 * (p.s / 160), 0, 0, Math.PI * 2);
    ctx.fill();

    // 立方体（3 面）
    const pts = [];
    const corners = [
      [-w, 0, -w], [w, 0, -w], [w, 0, w], [-w, 0, w],
      [-w, h, -w], [w, h, -w], [w, h, w], [-w, h, w]
    ];
    const W = this._w, H = this._h;
    corners.forEach(([cx, cy, cz]) => {
      const q = this.cam.project(s.x + cx, 0.42 + cy, s.z + cz, W, H);
      pts.push(q);
    });
    if (pts.some(q => !q)) return;

    const faces = [
      { idx: [4, 5, 6, 7], light: 1.0, top: true },
      { idx: [0, 1, 5, 4], light: 0.62 },
      { idx: [1, 2, 6, 5], light: 0.42 }
    ];
    faces.forEach(f => {
      const q = f.idx.map(i => pts[i]);
      ctx.beginPath();
      ctx.moveTo(q[0].sx, q[0].sy);
      for (let i = 1; i < q.length; i++) ctx.lineTo(q[i].sx, q[i].sy);
      ctx.closePath();
      const errMix = Math.min(1, load.err * 1.6);
      const cr = Math.round(lerpC(color[0], 244, errMix * 0.8));
      const cg = Math.round(lerpC(color[1], 63, errMix * 0.8));
      const cb = Math.round(lerpC(color[2], 94, errMix * 0.8));
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.42 * f.light + (isRoot ? 0.3 : 0)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.85 * f.light + 0.15})`;
      ctx.lineWidth = f.top ? 1.8 : 1.1;
      ctx.stroke();
    });

    // 选中/根因光环
    if (this.selected === s.id || isRoot) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 3.4);
      ctx.strokeStyle = isRoot ? `rgba(244,63,94,${0.5 + 0.4 * pulse})` : `rgba(56,189,248,${0.35 + 0.3 * pulse})`;
      ctx.lineWidth = isRoot ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.ellipse(base.sx, base.sy, 30 * (p.s / 160), 13 * (p.s / 160), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 标签
    const fs = Math.max(9, Math.min(13, 11 * (p.s / 190)));
    ctx.font = `600 ${fs}px "Segoe UI", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    const label = s.name;
    const tw = ctx.measureText(label).width;
    const ly = base.sy - 16 * (p.s / 190) - (isRoot ? 10 : 0);
    ctx.fillStyle = 'rgba(6,10,20,.72)';
    roundRect(ctx, base.sx - tw / 2 - 6, ly - fs, tw + 12, fs + 7, 5);
    ctx.fill();
    ctx.fillStyle = isRoot ? '#fda4af' : (this.selected === s.id ? '#bae6fd' : PALETTE.dim);
    ctx.fillText(label, base.sx, ly);

    // 错误率角标
    if (load.err > 0.2) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(base.sx + tw / 2 + 12, ly - fs / 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawParticles(ctx, W, H) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.particles) {
      const a = this.svc(p.from), b = this.svc(p.to);
      if (!a || !b) continue;
      const pt = this._lerpWorld(a, b, p.t, p.jitter);
      const q = this.cam.project(pt.x, pt.y, pt.z, W, H);
      if (!q) continue;
      const bad = p.bad;
      const col = bad ? '244,63,94' : '125,211,252';
      const r = p.size * (q.s / 190) * 1.9;
      const g = ctx.createRadialGradient(q.sx, q.sy, 0, q.sx, q.sy, r * 2.3);
      g.addColorStop(0, `rgba(${col},.92)`);
      g.addColorStop(0.4, `rgba(${col},.26)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(q.sx, q.sy, r * 2.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${col},.95)`;
      ctx.beginPath(); ctx.arc(q.sx, q.sy, r * 0.75, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  _lerpWorld(a, b, t, jit) {
    // 弧线插值 + 垂直抬升，模拟"调用在网络上飞行"
    const x = lerpC(a.x, b.x, t);
    const z = lerpC(a.z, b.z, t);
    const lift = Math.sin(t * Math.PI) * 0.55;
    return { x: x + jit * 0.4, y: 0.42 + lift, z: z + jit * 0.3 };
  }

  drawPulses(ctx, W, H) {
    this.pulses.forEach(pu => {
      const s = this.svc(pu.id);
      if (!s) return;
      const k = 1 - pu.life / pu.max;
      const q = this.cam.project(s.x, 0.42, s.z, W, H);
      if (!q) return;
      const R = 20 + k * 150 * (q.s / 190);
      ctx.strokeStyle = `rgba(244,63,94,${(1 - k) * 0.65})`;
      ctx.lineWidth = 3 * (1 - k) + 0.5;
      ctx.beginPath();
      ctx.ellipse(q.sx, q.sy, R, R * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  drawHud(ctx, W, H) {
    const cam = this.cam;
    // 左上角罗盘
    const cx = 44, cy = H - 44, R = 22;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(140,160,220,.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    // 指示三角
    const a = -cam.theta - Math.PI / 2;
    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2));
    ctx.lineTo(Math.cos(a + 2.5) * 7, Math.sin(a + 2.5) * 7);
    ctx.lineTo(Math.cos(a - 2.5) * 7, Math.sin(a - 2.5) * 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,215,255,.55)';
    ctx.font = '9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', Math.cos(a) * (R + 8), Math.sin(a) * (R + 8) + 3);
    ctx.restore();
  }

  /* 屏幕坐标拾取 */
  pick(sx, sy) {
    let best = null, bestD = 30 * 30;
    for (const s of this.services) {
      const p = this.cam.project(s.x, 0.42, s.z, this._w, this._h);
      if (!p) continue;
      const d = (p.sx - sx) ** 2 + (p.sy - sy) ** 2;
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }
  setSize(w, h) { this._w = w; this._h = h; }
}

function lerpC(a, b, t) { return a + (b - a) * t; }
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hexRGB(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
