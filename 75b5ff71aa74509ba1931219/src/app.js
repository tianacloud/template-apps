

// -*- coding: utf-8 -*-
/*
 * 可组装拼接盒 —— 参数化几何核心（浏览器 / Node 双端，零依赖）
 * 由 box_core.py 逐行移植，数值行为保持一致
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BoxCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Python f-string 风格定点格式化：对 double 的【精确值】做 correct rounding，
  // 恰好半边时用 banker's rounding（half-even），与 Python 的 .Nf 逐字一致
  // （如 6.25 -> "6.2"，而 JS toFixed 给 "6.3"；0.05 -> "0.1" 亦一致）
  function pyfmt(v, nd) {
    nd = Math.max(0, Math.min(20, Math.round(Number(nd))));
    if (v === undefined || v === null || !isFinite(v)) return String(v);
    if (v === 0) return (1 / v < 0 ? '-0' : '0') + (nd ? '.' + '0'.repeat(nd) : '');
    const neg = v < 0;
    const f64 = new Float64Array(1);
    const u64 = new BigUint64Array(f64.buffer);
    f64[0] = Math.abs(v);
    const bits = u64[0];
    const expBits = Number((bits >> 52n) & 0x7ffn);
    const mant = bits & 0xfffffffffffffn;
    let m, e;                                   // |v| = m × 2^e（m、e 均为整数）
    if (expBits === 0) { m = mant; e = -1074; } // 次正规数
    else { m = mant | (1n << 52n); e = expBits - 1075; }
    const five = 5n ** BigInt(nd);              // 10^nd = 2^nd × 5^nd
    const shift = e + nd;
    let q;                                      // q = round_half_even(|v| × 10^nd)
    if (shift >= 0) {
      q = m * five * (1n << BigInt(shift));     // 恰为整数
    } else {
      const den = 1n << BigInt(-shift);
      const num = m * five;
      const fl = num / den, r = num % den;
      const twice = r * 2n;
      q = (twice > den) ? fl + 1n
        : (twice < den) ? fl
        : ((fl % 2n === 0n) ? fl : fl + 1n);    // 恰好半边 → half-even
    }
    let out = q.toString();
    if (nd > 0) {
      const t = out.padStart(nd + 1, '0');
      out = t.slice(0, t.length - nd) + '.' + t.slice(t.length - nd);
    }
    return (neg ? '-' : '') + out;
  }

  // ==================== 基础几何工具 ====================
  function signedArea(poly) {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return s * 0.5;
  }

  function d3(p, q, r) {
    return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  }

  function inTri(pt, a, b, c, eps) {
    eps = eps === undefined ? 1e-9 : eps;
    const d1 = d3(a, b, pt), d2 = d3(b, c, pt), d3v = d3(c, a, pt);
    return (d1 > eps && d2 > eps && d3v > eps) ||
           (d1 < -eps && d2 < -eps && d3v < -eps);
  }

  function dedupe(pts) {
    const out = [];
    for (const p of pts) {
      const last = out[out.length - 1];
      if (!out.length || Math.abs(p[0] - last[0]) > 1e-9 ||
          Math.abs(p[1] - last[1]) > 1e-9) out.push(p);
    }
    if (out.length > 1 &&
        Math.abs(out[0][0] - out[out.length - 1][0]) < 1e-9 &&
        Math.abs(out[0][1] - out[out.length - 1][1]) < 1e-9) out.pop();
    return out;
  }

  function dedupeCirc(poly) {
    return dedupe(poly.map(p => [p[0], p[1]]));
  }

  function onSegment(pt, a, b, eps) {
    eps = eps === undefined ? 1e-9 : eps;
    if (Math.abs(d3(a, b, pt)) > eps) return false;
    return (Math.min(a[0], b[0]) - eps <= pt[0] && pt[0] <= Math.max(a[0], b[0]) + eps &&
            Math.min(a[1], b[1]) - eps <= pt[1] && pt[1] <= Math.max(a[1], b[1]) + eps);
  }

  // ==================== 象限分片缝合 ====================
  function splitQuadrants(loop) {
    const n = loop.length, m = Math.floor(n / 4);
    if (m < 2 || n % 4) return null;
    const axes = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    for (let k = 0; k < 4; k++) {
      const src = loop[(k * m) % n];
      const proj = Math.abs(src[0] * axes[k][0] + src[1] * axes[k][1]);
      if (Math.abs(proj - Math.sqrt(src[0] * src[0] + src[1] * src[1])) > 1e-7) return null;
    }
    const quads = [];
    for (let k = 0; k < 4; k++) {
      const seg = [];
      for (let t = 0; t <= m; t++) seg.push(loop[(k * m + t) % n]);
      quads.push(seg);
    }
    return quads;
  }

  function ringQuadrant(outer, inner, z, mesh) {
    const qo = splitQuadrants(outer), qi = splitQuadrants(inner);
    if (qo === null || qi === null) return false;
    for (let k = 0; k < 4; k++) {
      const poly = qo[k].concat(qi[k].slice().reverse());
      for (const t of earClip(poly)) {
        mesh.tri([t[0][0], t[0][1], z], [t[1][0], t[1][1], z], [t[2][0], t[2][1], z]);
      }
    }
    return true;
  }

  // ==================== 耳切分 ====================
  function earClip(poly) {
    let V = dedupeCirc(poly);
    if (V.length < 3) return [];
    if (signedArea(V) < 0) V = V.slice().reverse();
    const n = V.length;
    if (n === 3) return [V.map(p => [p[0], p[1]])];
    // 凸判定 + 扇形三角化
    let convex = true;
    for (let i = 0; i < n; i++) {
      if (d3(V[i], V[(i + 1) % n], V[(i + 2) % n]) < -1e-9) { convex = false; break; }
    }
    if (convex) return convexFan(V);
    // 凹多边形：双向链表耳切分
    const nxt = [], prv = [];
    for (let i = 0; i < n; i++) { nxt.push((i + 1) % n); prv.push((i - 1 + n) % n); }
    const alive = new Array(n).fill(true);
    const tris = [];
    let cnt = n, i = 0, guard = 0;
    const limit = 4 * n * n + 5000;
    while (cnt > 3 && guard < limit) {
      guard += 1;
      const a = prv[i], c = nxt[i];
      const A = V[a], B = V[i], C = V[c];
      if (d3(A, B, C) > 1e-12) {
        let ok = true, j = nxt[c];
        while (j !== a) {
          if (inTri(V[j], A, B, C) || onSegment(V[j], A, C)) { ok = false; break; }
          j = nxt[j];
        }
        if (ok) {
          tris.push([[A[0], A[1]], [B[0], B[1]], [C[0], C[1]]]);
          nxt[a] = c; prv[c] = a;
          alive[i] = false; cnt -= 1;
          i = a;
          continue;
        }
      }
      i = nxt[i];
    }
    if (cnt >= 3) {
      const rest = [];
      for (let k = 0; k < n; k++) if (alive[k]) rest.push(k);
      if (rest.length >= 3) {
        const base = rest[0];
        for (let k = 1; k < rest.length - 1; k++) {
          tris.push([[V[base][0], V[base][1]],
                     [V[rest[k]][0], V[rest[k]][1]],
                     [V[rest[k + 1]][0], V[rest[k + 1]][1]]]);
        }
      }
    }
    return tris.map(t => [[t[0][0], t[0][1]], [t[1][0], t[1][1]], [t[2][0], t[2][1]]]);
  }

  function convexFan(V) {
    const n = V.length;
    function degenCount(a) {
      let c = 0;
      for (let i = 0; i < n; i++) {
        if (i === a) continue;
        if (Math.abs(d3(V[a], V[i], V[(i + 1) % n])) < 1e-12) c += 1;
      }
      return c;
    }
    let a = 0, bestKey = -Infinity;
    for (let i = 0; i < n; i++) {          // Python max() 取首个最大者
      const k = V[i][0] + V[i][1];
      if (k > bestKey) { bestKey = k; a = i; }
    }
    if (degenCount(a) !== 0) {
      let best = a, bestc = degenCount(a);
      for (let i = 0; i < n; i++) {
        if (i === a) continue;
        const c = degenCount(i);
        if (c < bestc) { best = i; bestc = c; if (c === 0) break; }
      }
      a = best;
    }
    const tris = [];
    for (let k = 1; k < n - 1; k++) {
      const i = (a + k) % n, j = (a + k + 1) % n;
      tris.push([[V[a][0], V[a][1]], [V[i][0], V[i][1]], [V[j][0], V[j][1]]]);
    }
    return tris;
  }

  // ==================== 弧长重采样 ====================
  function resample(poly, n) {
    const pts = poly.slice();
    if (Math.abs(pts[0][0] - pts[pts.length - 1][0]) > 1e-12 ||
        Math.abs(pts[0][1] - pts[pts.length - 1][1]) > 1e-12) pts.push(pts[0]);
    const seg = [];
    for (let i = 0; i < pts.length - 1; i++) {
      seg.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
    }
    const total = seg.reduce((a, b) => a + b, 0);
    const out = [];
    for (let i = 0; i < n; i++) {
      const s = total * i / n;
      let acc = 0, done = false;
      for (let j = 0; j < seg.length; j++) {
        if (acc + seg[j] >= s - 1e-12) {
          const t = (seg[j] ? (s - acc) / seg[j] : 0);
          out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t,
                    pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
          done = true; break;
        }
        acc += seg[j];
      }
      if (!done) out.push(pts[pts.length - 2]);
    }
    return out;
  }

  function resampleOpen(pts, count) {
    const seg = [];
    for (let i = 0; i < pts.length - 1; i++) {
      seg.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
    }
    const total = seg.reduce((a, b) => a + b, 0);
    const out = [];
    for (let i = 0; i < count; i++) {
      const s = total * i / (count - 1);
      let acc = 0, done = false;
      for (let j = 0; j < seg.length; j++) {
        if (acc + seg[j] >= s - 1e-12) {
          const t = (seg[j] ? (s - acc) / seg[j] : 0);
          out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t,
                    pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
          done = true; break;
        }
        acc += seg[j];
      }
      if (!done) out.push(pts[pts.length - 1]);
    }
    return out;
  }

  function roundedRect(half, r, n) {
    n = Math.round(Number(n));
    if (n % 4) n = n - (n % 4);
    const m = n >> 2;
    const a = half - r;
    const seg = [[half, 0.0], [half, a]];
    for (let k = 1; k < 25; k++) {
      const t = (Math.PI / 2) * k / 24;
      seg.push([a + r * Math.cos(t), a + r * Math.sin(t)]);
    }
    seg.push([a, half]);
    seg.push([0.0, half]);
    const q = resampleOpen(seg, m + 1);
    q[0] = [half, 0.0];
    q[q.length - 1] = [0.0, half];
    let pts = q.slice(), work = q;
    for (let k = 0; k < 3; k++) {
      work = work.map(p => [-p[1], p[0]]);
      pts = pts.concat(work.slice(1));
    }
    return dedupeCirc(pts).slice(0, n);
  }

  // ==================== 参数对象 ====================
  const FIELDS = ['box', 'wall', 'height', 'bottom', 'gap', 'clr', 'clr_t',
                  'ten_root', 'ten_p', 'u_ten', 'u_mor', 'cav_r', 'nozzle', 'n_seg'];
  const DEFAULTS = {
    box: 50.0, wall: 4.5, height: 25.0, bottom: 3.0, gap: 0.20, clr: 0.20,
    clr_t: 0.20, ten_root: 6.0, ten_p: 1.3, u_ten: 11.0, u_mor: -11.0,
    cav_r: 1.0, nozzle: 0.40, n_seg: 360
  };

  function makeParams(over) {
    const p = {};
    for (const f of FIELDS) p[f] = (over && over[f] !== undefined) ? Number(over[f]) : DEFAULTS[f];
    p.n_seg = Math.round(p.n_seg);
    // 挂派生量 getter，行为对齐 Python BoxParams 的 @property（不可枚举，JSON 序列化只含参数）
    for (const k of ['cav', 'half', 'cav_half', 'sock_d', 'sock_off', 'rem',
                     'a0t', 'a1t', 'a0s', 'a1s']) {
      Object.defineProperty(p, k, { get: () => derived(p)[k], enumerable: false });
    }
    return p;
  }
  function derived(p) {
    const cav = p.box - 2 * p.wall;
    return {
      cav: cav,
      half: p.box / 2,
      cav_half: cav / 2,
      sock_d: p.ten_p + p.clr_t - p.gap,
      sock_off: p.gap + p.clr * Math.SQRT2,
      rem: p.wall - (p.ten_p + p.clr_t - p.gap),
      a0t: p.ten_root / 2,
      a1t: p.ten_root / 2 + p.ten_p,
      a0s: p.ten_root / 2 + p.gap + p.clr * Math.SQRT2,
      a1s: p.ten_root / 2 + p.gap + p.clr * Math.SQRT2 + p.ten_p + p.clr_t - p.gap
    };
  }

  // 四面局部(u,v) -> 全局(x,y)
  const XFORMS = [
    (u, v) => [v, u],
    (u, v) => [-u, v],
    (u, v) => [-v, -u],
    (u, v) => [u, -v]
  ];

  function facePath(p, withTenon) {
    const d = derived(p);
    const path = [[-p.half, p.half],
                  [p.u_mor - d.a0s, p.half], [p.u_mor - d.a1s, p.half - d.sock_d],
                  [p.u_mor + d.a1s, p.half - d.sock_d], [p.u_mor + d.a0s, p.half],
                  [0.0, p.half]];
    if (withTenon) {
      path.push([p.u_ten - d.a0t, p.half], [p.u_ten - d.a1t, p.half + p.ten_p],
                [p.u_ten + d.a1t, p.half + p.ten_p], [p.u_ten + d.a0t, p.half]);
    }
    path.push([p.half, p.half]);
    return path;
  }

  function buildProfile(p, withTenon) {
    const pts = [];
    for (const xf of XFORMS) for (const uv of facePath(p, withTenon)) pts.push(xf(uv[0], uv[1]));
    let prof = dedupe(pts);
    if (signedArea(prof) < 0) prof.reverse();
    return prof;
  }

  function rotateTo(poly, target) {
    for (let i = 0; i < poly.length; i++) {
      if (Math.abs(poly[i][0] - target[0]) < 1e-9 && Math.abs(poly[i][1] - target[1]) < 1e-9) {
        return poly.slice(i).concat(poly.slice(0, i));
      }
    }
    throw new Error('bridge point not found: ' + target);
  }

  // ==================== STL 容器 ====================
  class Mesh {
    constructor() { this.tris = []; }
    tri(a, b, c) { this.tris.push([a, b, c]); }
    quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); }
    sides(loop, z0, z1) {
      const n = loop.length;
      for (let i = 0; i < n; i++) {
        const p = loop[i], q = loop[(i + 1) % n];
        this.quad([p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]);
      }
    }
    cap(loop, z, up) {
      for (const t of earClip(loop)) {
        if (up === undefined ? true : up) {
          this.tri([t[0][0], t[0][1], z], [t[1][0], t[1][1], z], [t[2][0], t[2][1], z]);
        } else {
          this.tri([t[2][0], t[2][1], z], [t[1][0], t[1][1], z], [t[0][0], t[0][1], z]);
        }
      }
    }
    add(other, dx, dy) {
      dx = dx || 0; dy = dy || 0;
      for (const t of other.tris) {
        this.tri([t[0][0] + dx, t[0][1] + dy, t[0][2]],
                 [t[1][0] + dx, t[1][1] + dy, t[1][2]],
                 [t[2][0] + dx, t[2][1] + dy, t[2][2]]);
      }
    }
    volume() {
      let v = 0;
      for (const t of this.tris) {
        const a = t[0], b = t[1], c = t[2];
        v += (a[0] * (b[1] * c[2] - b[2] * c[1]) -
              a[1] * (b[0] * c[2] - b[2] * c[0]) +
              a[2] * (b[0] * c[1] - b[1] * c[0])) / 6.0;
      }
      return Math.abs(v);
    }
    toArrayBuffer() {
      const n = this.tris.length;
      const buf = new ArrayBuffer(84 + 50 * n);
      const dv = new DataView(buf);
      dv.setUint32(80, n, true);
      let o = 84;
      for (const t of this.tris) {
        const a = t[0], b = t[1], c = t[2];
        const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
        const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const m = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;
        dv.setFloat32(o, nx / m, true); dv.setFloat32(o + 4, ny / m, true);
        dv.setFloat32(o + 8, nz / m, true);
        o += 12;
        for (const v of [a, b, c]) {         // 注意：需保持顺序
          dv.setFloat32(o, v[0], true); dv.setFloat32(o + 4, v[1], true);
          dv.setFloat32(o + 8, v[2], true); o += 12;
        }
        dv.setUint16(o, 0, true); o += 2;
      }
      return buf;
    }
  }

  function buildBox(p) {
    const m = new Mesh();
    const d = derived(p);
    const Pout = rotateTo(buildProfile(p, true), [p.half, 0.0]);
    const Qcav = roundedRect(d.cav_half, p.cav_r, p.n_seg);
    m.sides(Pout, 0.0, p.height);
    m.sides(Qcav.slice().reverse(), p.bottom, p.height);
    m.cap(Qcav, p.bottom, true);
    m.cap(Pout, 0.0, false);
    if (!ringQuadrant(Pout, Qcav, p.height, m)) {
      throw new Error('顶面环缝合失败：轮廓非 90° 四重对称');
    }
    return [m, Pout];
  }

  function buildCoupon(p, clr) {
    const m = new Mesh();
    const W = 26.0, D = 14.0, HH = 12.0;
    const d = derived(p);
    const a0t = p.ten_root / 2, a1t = a0t + p.ten_p;
    const a0s = a0t + p.gap + clr * Math.SQRT2;
    const a1s = a0s + d.sock_d;
    const A = [[0, -W / 2], [D, -W / 2], [D, -a0t], [D + p.ten_p, -a1t],
               [D + p.ten_p, a1t], [D, a0t], [D, W / 2], [0, W / 2]];
    m.sides(A, 0, HH); m.cap(A, HH, true); m.cap(A, 0, false);
    const X0 = D + p.gap;
    const B = [[X0, -W / 2], [X0 + D, -W / 2], [X0 + D, W / 2], [X0, W / 2],
               [X0, a0s], [X0 + d.sock_d, a1s], [X0 + d.sock_d, -a1s], [X0, -a0s]];
    m.sides(B, 0, HH); m.cap(B, HH, true); m.cap(B, 0, false);
    return m;
  }

  function buildArray(p, nx, ny) {
    const arr = new Mesh();
    const box = buildBox(p)[0];
    const pitch = p.box + p.gap;
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < ny; j++) {
        arr.add(box, (i - (nx - 1) / 2) * pitch, (j - (ny - 1) / 2) * pitch);
      }
    }
    return arr;
  }

  // ==================== 设计校核 ====================
  function validate(p) {
    const out = [];
    const E = '错误', W = '警告', N = '提示';
    const d = derived(p);
    if (p.box <= 0 || p.height <= 0) {
      out.push([E, '外尺寸与高度必须为正数']); return out;
    }
    if (p.wall <= 0) out.push([E, '壁厚必须大于 0']);
    if (d.cav <= 0) {
      out.push([E, `壁厚过大：内腔尺寸 = ${pyfmt(d.cav, 2)} ≤ 0（外 ${pyfmt(p.box, 1)} − 2×壁厚 ${pyfmt(p.wall, 1)}）`]);
    } else if (d.cav < 10) {
      out.push([W, `内腔仅 ${pyfmt(d.cav, 1)} mm，实用空间很小`]);
    }
    if (p.bottom <= 0) out.push([E, '底部厚度必须大于 0']);
    else if (p.bottom < 2.0) out.push([W, `底部封口仅 ${pyfmt(p.bottom, 2)} mm，低于 2mm 建议值，存在渗漏风险`]);
    if (p.bottom >= p.height) out.push([E, `底部厚度 ${pyfmt(p.bottom, 2)} ≥ 总高 ${pyfmt(p.height, 2)}，无内腔`]);

    if (d.sock_d <= 0) out.push([E, `卯槽深 ${pyfmt(d.sock_d, 2)} ≤ 0：需加大榫凸出量或端部让位`]);
    if (p.ten_p <= 0) out.push([E, '榫凸出量必须大于 0']);
    if (d.rem < 0.8) out.push([E, `剩余壁厚（槽底→内腔）仅 ${pyfmt(d.rem, 2)} mm，低于 0.8mm 打印下限`]);
    else if (d.rem < 2 * p.nozzle) out.push([W, `剩余壁厚 ${pyfmt(d.rem, 2)} mm 不足 2 道线宽，侧壁可能渗水`]);
    if (p.clr < p.nozzle * 0.5 - 1e-9) {
      out.push([E, `侧向间隙 ${pyfmt(p.clr, 2)} mm 低于 Ø${pyfmt(p.nozzle, 2)} 喷嘴可滑动下限 ${pyfmt((p.nozzle * 0.5), 2)} mm，两盒会粘连`]);
    } else if (p.clr < p.nozzle * 1.125 * 0.5) {
      out.push([W, `侧向间隙 ${pyfmt(p.clr, 2)} mm：PrusaSlicer(线宽0.45)下偏紧，建议 0.25 档`]);
    }
    if (p.clr_t <= 0) out.push([E, '榫端轴向让位必须大于 0，否则榫头顶死槽底']);

    const feats = [['榫', p.u_ten, d.a1t], ['卯', p.u_mor, d.a1s]];
    for (const f of feats) {
      if (Math.abs(f[1]) + f[2] > p.half - 1.0) {
        out.push([E, `${f[0]} 外缘距盒角仅 ${pyfmt((p.half - (Math.abs(f[1]) + f[2])), 2)} mm，特征会越出盒面`]);
      }
    }
    if (Math.abs(p.u_ten - p.u_mor) < d.a1t + d.a1s) {
      out.push([E, `榫与卯在面上重叠：中心距 ${pyfmt(Math.abs(p.u_ten - p.u_mor), 2)} < 所需 ${pyfmt((d.a1t + d.a1s), 2)}`]);
    }
    const corner = Math.min(p.half - (Math.abs(p.u_ten) + d.a1t),
                            p.half - (Math.abs(p.u_mor) + d.a1s));
    if (corner < 3.0) out.push([W, `特征距盒角仅 ${pyfmt(corner, 2)} mm，易磕碰`]);
    if (p.cav_r <= 0) out.push([W, '内腔圆角应为正数']);
    else if (p.cav_r > d.cav_half) out.push([E, `内腔圆角 ${pyfmt(p.cav_r, 1)} 超过内腔半宽`]);
    if (p.n_seg < 60) out.push([W, `轮廓分段数 ${p.n_seg} 偏少，圆弧会失真`]);
    if (!out.length) out.push([N, '校核通过：所有参数满足打印与装配要求']);
    return out;
  }

  function derivedReport(p) {
    const d = derived(p);
    return [
      ['内腔尺寸', `${pyfmt(d.cav, 1)} × ${pyfmt(d.cav, 1)} × ${pyfmt((p.height - p.bottom), 1)} mm`],
      ['内腔容积', `${pyfmt((d.cav * d.cav * (p.height - p.bottom) / 1000), 1)} mL`],
      ['卯槽深', `${pyfmt(d.sock_d, 2)} mm`],
      ['榫根 / 榫端宽', `${pyfmt(p.ten_root, 2)} / ${pyfmt((2 * d.a1t), 2)} mm`],
      ['卯口 / 卯底宽', `${pyfmt((2 * d.a0s), 2)} / ${pyfmt((2 * d.a1s), 2)} mm`],
      ['侧向垂直间隙', `${pyfmt(p.clr, 3)} mm（每侧）`],
      ['盒间贴合间隙', `${pyfmt(p.gap, 2)} mm`],
      ['榫端轴向让位', `${pyfmt(p.clr_t, 2)} mm`],
      ['槽底余量', `${pyfmt(d.rem, 2)} mm（${pyfmt((d.rem / p.nozzle), 1)} 道线宽）`],
      ['间隙 / 线宽', `${pyfmt((p.clr / p.nozzle), 2)} ×（Cura 0.40）`]
    ];
  }

  // ==================== 网格体检 ====================
  function checkMesh(mesh) {
    const tris = mesh.tris;
    const undirected = new Map(), directed = new Map();
    let degen = 0;
    for (const t of tris) {
      const a = t[0], b = t[1], c = t[2];
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (Math.sqrt(nx * nx + ny * ny + nz * nz) < 1e-9) { degen += 1; continue; }
      const es = [[a, b], [b, c], [c, a]];
      for (const e of es) {
        const k0 = e[0].join(','), k1 = e[1].join(',');
        const k = (k0 <= k1) ? k0 + '|' + k1 : k1 + '|' + k0;
        undirected.set(k, (undirected.get(k) || 0) + 1);
        const dk = k0 + '>' + k1;
        directed.set(dk, (directed.get(dk) || 0) + 1);
      }
    }
    let nonmanifold = 0;
    for (const v of undirected.values()) if (v !== 2) nonmanifold += 1;
    let dup = 0;
    for (const v of directed.values()) if (v > 1) dup += 1;
    return [degen, nonmanifold, dup, mesh.volume()];
  }

  function inPoly(pt, poly) {
    let inside = false;
    const x = pt[0], y = pt[1], n = poly.length;
    for (let i = 0; i < n; i++) {
      const p = poly[i], q = poly[(i + 1) % n];
      if ((p[1] > y) !== (q[1] > y)) {
        const xin = (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]) + p[0];
        if (x < xin) inside = !inside;
      }
    }
    return inside;
  }

  function interference(p, pitch, step) {
    step = step || 0.05;
    if (pitch === undefined) pitch = p.box + p.gap;
    const P = buildProfile(p, true);
    const d = derived(p);
    const Q = roundedRect(d.cav_half, p.cav_r, p.n_seg);
    const half = p.half;
    const solid = (x, y) => inPoly([x, y], P) && !inPoly([x, y], Q);
    const y0 = p.u_ten - 8.0, y1 = p.u_ten + 8.0;
    const x0 = half - 1.0, x1 = half + p.ten_p + 0.6;
    let overlap = 0, maxPen = -99.0;
    let x = x0;
    while (x < x1) {
      let y = y0;
      while (y < y1) {
        if (solid(x, y) && solid(x - pitch, y)) overlap += 1;
        if (solid(x, y) && x > half + p.gap) {
          const pen = x - (half + p.gap);
          if (pen > maxPen) maxPen = pen;
        }
        y += step;
      }
      x += step;
    }
    return [overlap, maxPen];
  }

  return {
    FIELDS: FIELDS, DEFAULTS: DEFAULTS, derived: derived, pyfmt: pyfmt,
    makeParams: makeParams, signedArea: signedArea, d3: d3, dedupe: dedupe,
    splitQuadrants: splitQuadrants, ringQuadrant: ringQuadrant,
    earClip: earClip, convexFan: convexFan, resample: resample,
    resampleOpen: resampleOpen, roundedRect: roundedRect, facePath: facePath,
    buildProfile: buildProfile, rotateTo: rotateTo, Mesh: Mesh,
    buildBox: buildBox, buildCoupon: buildCoupon, buildArray: buildArray,
    validate: validate, derivedReport: derivedReport, checkMesh: checkMesh,
    inPoly: inPoly, interference: interference, XFORMS: XFORMS
  };
});



(function () {
'use strict';
const C = BoxCore;
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 参数元数据（与桌面工具一致） ---------- */
const META = [
  ['box',      '外边长',       'mm', '外形', 0.5],
  ['height',   '盒总高',       'mm', '外形', 0.5],
  ['wall',     '四壁厚度',     'mm', '结构', 0.1],
  ['bottom',   '底部封口厚度', 'mm', '结构', 0.1],
  ['cav_r',    '内腔圆角',     'mm', '结构', 0.1],
  ['ten_root', '榫根宽度',     'mm', '榫卯', 0.1],
  ['ten_p',    '榫凸出量',     'mm', '榫卯', 0.1],
  ['u_ten',    '榫中心偏移',   'mm', '榫卯', 0.5],
  ['u_mor',    '卯中心偏移',   'mm', '榫卯', 0.5],
  ['gap',      '盒间贴合间隙', 'mm', '配合', 0.05],
  ['clr',      '侧向配合间隙', 'mm', '配合', 0.05],
  ['clr_t',    '榫端轴向让位', 'mm', '配合', 0.05],
  ['nozzle',   '喷嘴直径',     'mm', '配合', 0.05],
  ['n_seg',    '轮廓分段数',   '段', '配合', 20],
];
const PRESETS = {
  '标准盒 50×50×25': { box: 50, height: 25, wall: 4.5, bottom: 3.0 },
  '薄壁轻量盒 50×50×25':   { box: 50, height: 25, wall: 2.5, bottom: 3.0 },
  '大格收纳盒 60×60×35':   { box: 60, height: 35, wall: 3.5, bottom: 4.0 },
  '小格分装盒 40×40×20':   { box: 40, height: 20, wall: 3.0, bottom: 2.5 },
};

/* ---------- 参数面板 ---------- */
const inputs = {};
function buildPanel() {
  const panel = $('#panel');
  const groups = {};
  for (const m of META) (groups[m[3]] = groups[m[3]] || []).push(m);
  for (const g of ['外形', '结构', '榫卯', '配合']) {
    const h = document.createElement('div');
    h.className = 'sec'; h.textContent = g;
    panel.appendChild(h);
    for (const [f, lab, unit, , step] of groups[g]) {
      const row = document.createElement('div');
      row.className = 'row';
      const lb = document.createElement('label');
      lb.textContent = lab; lb.htmlFor = 'in_' + f;
      const inp = document.createElement('input');
      inp.id = 'in_' + f; inp.type = 'number'; inp.step = String(step);
      inp.dataset.field = f;
      inp.addEventListener('input', onParamInput);
      inp.addEventListener('change', onParamInput);
      const un = document.createElement('span');
      un.className = 'unit'; un.textContent = unit;
      row.append(lb, inp, un);
      panel.appendChild(row);
      inputs[f] = inp;
    }
  }
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = '改动任意参数即自动重建。校核面板会实时判断可打印性；'
    + '导出前建议先看「网格体检」三项是否全为 0。';
  panel.appendChild(hint);

  const sel = $('#preset');
  sel.appendChild(new Option('自定义', ''));
  for (const k of Object.keys(PRESETS)) sel.appendChild(new Option(k, k));
  sel.addEventListener('change', () => {
    const d = PRESETS[sel.value];
    if (!d) return;
    for (const f in inputs) inputs[f].value = (d[f] !== undefined ? d[f] : C.DEFAULTS[f]);
    log('已应用预设：' + sel.value);
    refresh(true);
  });
}

let params = null;
function readParams() {
  const o = {};
  for (const f of C.FIELDS) {
    const v = parseFloat(inputs[f].value);
    o[f] = isFinite(v) ? v : C.DEFAULTS[f];
  }
  return C.makeParams(o);
}
function fillParams(p) {
  for (const f of C.FIELDS) inputs[f].value = String(p[f]);
}

/* ---------- 防抖刷新 ---------- */
let timer = null;
function onParamInput() { scheduleRefresh(); }
function scheduleRefresh() {
  clearTimeout(timer);
  timer = setTimeout(doRefresh, 130);
}
function refresh(now) { if (now) { clearTimeout(timer); doRefresh(); } else scheduleRefresh(); }

let lastMesh = null, lastOutline = null;
function doRefresh() {
  params = readParams();
  scheduleSave();
  const t0 = performance.now();
  let mesh, Pout;
  try {
    const r = C.buildBox(params);
    mesh = r[0]; Pout = r[1];
  } catch (e) {
    $('#cvErr').style.display = 'flex';
    $('#cvErr').textContent = '当前参数无法构建模型：' + e.message;
    $('#geomTag').textContent = '构建失败';
    $('#geomTag').className = 'tag bad';
    $('#stats').innerHTML = '<span class="bad">模型无效</span>';
    return;
  }
  $('#cvErr').style.display = 'none';
  lastMesh = mesh; lastOutline = Pout;
  drawAll(Pout);
  renderDerived();
  renderCheck();
  const chk = C.checkMesh(mesh);
  const iv = C.interference(params);
  renderStats(chk, iv, performance.now() - t0);
}

/* ---------- 三视图 ---------- */
const INK = '#1f2937', MUT = '#6b7280', RED = '#dc2626', BLU = '#2563eb';
function poly(ctx, pts, fill, stroke, lw, dash) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.lineWidth = lw || 1;
  ctx.strokeStyle = stroke || INK;
  ctx.stroke();
  ctx.setLineDash([]);
}
function txt(ctx, s, x, y, color, font, align) {
  ctx.fillStyle = color || MUT;
  ctx.font = font || '11px "Microsoft YaHei UI", sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function line(ctx, x1, y1, x2, y2, color, lw, dash) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  if (dash) ctx.setLineDash(dash); else ctx.setLineDash([]);
  ctx.lineWidth = lw || 1; ctx.strokeStyle = color || MUT; ctx.stroke();
  ctx.setLineDash([]);
}

function drawAll(Pout) {
  const cv = $('#cv'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, h = cv.clientHeight;
  if (w < 40 || h < 40) return;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  const w1 = Math.floor(w * 0.46), hj = Math.floor(h * 0.62);
  drawTop(ctx, 0, 0, w1, h, Pout);
  drawJoint(ctx, w1, 0, w - w1, hj);
  drawSection(ctx, w1, hj, w - w1, h - hj);
}

function drawTop(ctx, x0, y0, w, h, prof) {
  const p = params;
  const xs = prof.map(q => q[0]), ys = prof.map(q => q[1]);
  const mnx = Math.min(...xs), mxx = Math.max(...xs);
  const mny = Math.min(...ys), mxy = Math.max(...ys);
  const pad = 26;
  const s = Math.min((w - 2 * pad) / Math.max(mxx - mnx, 1e-6),
                     (h - 2 * pad) / Math.max(mxy - mny, 1e-6));
  const cx = x0 + w / 2, cy = y0 + h / 2;
  const T = q => [cx + (q[0] - (mnx + mxx) / 2) * s, cy - (q[1] - (mny + mxy) / 2) * s];
  const cav = C.roundedRect(p.cav_half, p.cav_r, 160);
  poly(ctx, cav.map(T), '#f4f6f9', '#c3c9d2', 1, [3, 3]);
  poly(ctx, prof.map(T), '#ffffff', INK, 1.6);
  const fp = C.facePath(p, true);
  for (const xf of C.XFORMS) {
    const ten = fp.slice(6, 10).map(uv => xf(uv[0], uv[1]));
    poly(ctx, ten.map(T), '#fee2e2', RED, 1.2);
    const mor = fp.slice(1, 5).map(uv => xf(uv[0], uv[1]));
    poly(ctx, mor.map(T), '#dbeafe', BLU, 1.2);
  }
  txt(ctx, '俯视图（红=榫 蓝=卯 虚线=内腔）', x0 + 10, y0 + 16);
  line(ctx, T([mnx, mny])[0], T([mnx, mny])[1], T([mxx, mny])[0], T([mxx, mny])[1], MUT, 1, [4, 3]);
  txt(ctx, '外边长 ' + C.pyfmt(p.box, 1) + ' mm', cx, y0 + h - 10, MUT, '11px Consolas, monospace', 'center');
}

function drawJoint(ctx, x0, y0, w, h) {
  const p = params;
  const W = 26.0, D = 14.0;
  const a0t = p.ten_root / 2, a1t = a0t + p.ten_p;
  const a0s = a0t + p.gap + p.clr * Math.SQRT2;
  const a1s = a0s + p.sock_d;
  const A = [[0, -W / 2], [D, -W / 2], [D, -a0t], [D + p.ten_p, -a1t],
             [D + p.ten_p, a1t], [D, a0t], [D, W / 2], [0, W / 2]];
  const X0 = D + p.gap;
  const B = [[X0, -W / 2], [X0 + D, -W / 2], [X0 + D, W / 2], [X0, W / 2],
             [X0, a0s], [X0 + p.sock_d, a1s], [X0 + p.sock_d, -a1s], [X0, -a0s]];
  const pad = 20;
  const xLo = -1.5, xHi = X0 + D + 1.5, yLo = -W / 2 - 1.0, yHi = W / 2 + 1.0;
  const aw = w - 2 * pad, ah = h - 2 * pad - 30;
  const s = Math.min(aw / (xHi - xLo), ah / (yHi - yLo));
  const cx = x0 + w / 2, cy = y0 + 46 + ah / 2;
  const T = q => [cx + (q[0] - (xLo + xHi) / 2) * s, cy - (q[1] - (yLo + yHi) / 2) * s];
  poly(ctx, A.map(T), '#fee2e2', '#b91c1c', 1.5);
  poly(ctx, B.map(T), '#dbeafe', '#1d4ed8', 1.5);
  const ten = [[D, -a0t], [D + p.ten_p, -a1t], [D + p.ten_p, a1t], [D, a0t]];
  poly(ctx, ten.map(T), '#fca5a5', '#7f1d1d', 1.2);
  txt(ctx, '榫卯接头剖面（1:1 试样，已啮合）', x0 + 10, y0 + 13);
  txt(ctx, 'A 块（红，出榫）', x0 + 10, y0 + 30, '#b91c1c');
  txt(ctx, 'B 块（蓝，开卯）', x0 + 96, y0 + 30, '#1d4ed8');
  const ins = p.ten_p - p.gap;
  txt(ctx, '榫凸出 ' + C.pyfmt(p.ten_p, 2) + ' ｜ 槽深 ' + C.pyfmt(p.sock_d, 2)
        + ' ｜ 插入 ' + C.pyfmt(ins, 2) + ' ｜ 间隙 ' + C.pyfmt(p.clr, 2),
      x0 + w - 10, y0 + 13, MUT, '11px Consolas, monospace', 'right');
  txt(ctx, '槽底余壁 ' + C.pyfmt(p.rem, 2) + ' mm ｜ 盒间贴合 ' + C.pyfmt(p.gap, 2) + ' mm',
      x0 + 10, y0 + h - 10, MUT, '11px Consolas, monospace');
}

function drawSection(ctx, x0, y0, w, h) {
  const p = params;
  const pad = 34;
  const s = Math.min((w - 2 * pad) / (p.box + 6), (h - 2 * pad) / (p.height + 6));
  const cx = x0 + w / 2, cy = y0 + h / 2;
  const T = (y, z) => [cx + y * s, cy - (z - p.height / 2) * s];
  const hb = p.half;
  const poly8 = [T(-hb, 0), T(hb, 0), T(hb, p.height), T(hb - p.wall, p.height),
                 T(hb - p.wall, p.bottom), T(-hb + p.wall, p.bottom),
                 T(-hb + p.wall, p.height), T(-hb, p.height)];
  poly(ctx, poly8, '#e8edf3', INK, 1.5);
  const cav = [T(-p.cav_half, p.bottom), T(p.cav_half, p.bottom),
               T(p.cav_half, p.height), T(-p.cav_half, p.height)];
  poly(ctx, cav, '#ffffff', '#94a3b8', 1.2);
  const b0 = T(-hb + 1.5, 0), b1 = T(-hb + 1.5, p.bottom);
  line(ctx, b0[0], b0[1], b1[0], b1[1], RED, 2);
  txt(ctx, '底 ' + C.pyfmt(p.bottom, 1), b1[0] - 6, T(0, p.bottom / 2)[1], RED, '11px Consolas, monospace', 'right');
  const t0 = T(hb - 1.5, p.height - 6), t1 = T(hb - 1.5, p.height);
  line(ctx, t0[0], t0[1], t1[0], t1[1], BLU, 2);
  txt(ctx, '壁 ' + C.pyfmt(p.wall, 1), t1[0] + 6, T(0, p.height - 3)[1], BLU, '11px Consolas, monospace');
  txt(ctx, '竖向剖面', x0 + 10, y0 + 14);
  txt(ctx, '内腔 ' + C.pyfmt(p.cav, 1) + '×' + C.pyfmt(p.cav, 1) + '×' + C.pyfmt(p.height - p.bottom, 1)
      + ' ｜ 容积 ' + C.pyfmt(p.cav * p.cav * (p.height - p.bottom) / 1000, 1) + ' mL',
      x0 + 10, y0 + h - 10, MUT, '11px Consolas, monospace');
}

/* ---------- 派生量 / 校核 / 体检 ---------- */
function renderDerived() {
  const rows = C.derivedReport(params);
  $('#derived').innerHTML = rows.map(r =>
    `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
}
function renderCheck() {
  const va = C.validate(params);
  const box = $('#checkList');
  box.innerHTML = va.map(v =>
    `<div class="lv-${v[0] === '错误' ? 'E' : v[0] === '警告' ? 'W' : 'N'}">`
    + `[${v[0]}] ${v[1]}</div>`).join('');
  const bad = va.some(v => v[0] === '错误');
  const tag = $('#checkTag');
  tag.textContent = bad ? '存在错误' : (va.some(v => v[0] === '警告') ? '可通过（有警告）' : '全部通过');
  tag.className = 'tag' + (bad ? ' bad' : '');
}
function renderStats(chk, iv, ms) {
  const [dg, nm, dp, vol] = chk;
  const cls = v => v === 0 ? 'ok' : 'bad';
  $('#stats').innerHTML =
    `<span>面片 <b>${lastMesh.tris.length}</b></span>`
    + `<span>体积 <b>${C.pyfmt(vol, 1)}</b> mm³</span>`
    + `<span>退化面 <b class="${cls(dg)}">${dg}</b></span>`
    + `<span>非流形边 <b class="${cls(nm)}">${nm}</b></span>`
    + `<span>重复边 <b class="${cls(dp)}">${dp}</b></span>`
    + `<span>干涉重叠 <b class="${cls(iv[0])}">${iv[0]}</b></span>`
    + `<span>插入深度 <b>${C.pyfmt(iv[1], 2)}</b> mm</span>`
    + `<span style="color:var(--muted)">${ms.toFixed(0)} ms</span>`;
  $('#geomTag').textContent = (dg === 0 && nm === 0 && dp === 0) ? '零缺陷' : '网格异常';
  $('#geomTag').className = 'tag' + ((dg === 0 && nm === 0 && dp === 0) ? '' : ' bad');
}

/* ---------- 日志 ---------- */
function log(s) {
  const el = $('#log');
  const t = new Date();
  const stamp = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0')
    + ':' + String(t.getSeconds()).padStart(2, '0');
  el.textContent += `[${stamp}] ${s}\n`;
  el.scrollTop = el.scrollHeight;
}

/* ---------- 导出 ---------- */
function stamp(p, tag) {
  return `拼接盒_${C.pyfmt(p.box, 0)}x${C.pyfmt(p.box, 0)}x${C.pyfmt(p.height, 0)}`
    + `_壁${C.pyfmt(p.wall, 1)}_底${C.pyfmt(p.bottom, 1)}_${tag}`;
}
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function stlBlob(mesh) {
  return new Blob([mesh.toArrayBuffer()], { type: 'application/octet-stream' });
}
function exportOne(kind) {
  const p = params;
  let mesh, tag;
  if (kind === 'box') { mesh = C.buildBox(p)[0]; tag = '单盒'; }
  else if (kind === 'array') {
    const n = Math.max(2, Math.min(8, parseInt($('#arrN').value) || 4));
    mesh = C.buildArray(p, n, n); tag = `阵列${n}x${n}`;
  } else {
    const clr = parseFloat($('#couponClr').value);
    const c = isFinite(clr) ? clr : 0.20;
    mesh = C.buildCoupon(p, c); tag = `试样c${C.pyfmt(c, 2)}`;
  }
  download(stlBlob(mesh), stamp(p, tag) + '.stl');
  log(`已导出 ${tag}：${mesh.tris.length} 面 / ${C.pyfmt(mesh.volume(), 1)} mm³`);
}
async function exportAll() {
  const clrs = $('#couponClr').value.split(/[,，\s]+/).filter(s => s).map(parseFloat)
    .filter(v => isFinite(v));
  const list = clrs.length ? clrs : [0.20];
  exportOne('box');
  await sleep(350);
  exportOne('array');
  await sleep(350);
  for (const c of list) {
    $('#couponClr').value = String(c);
    exportOne('coupon');
    await sleep(350);
  }
  log('全部生成完成（' + (2 + list.length) + ' 个文件）');
}

/* ---------- 参数存取 ---------- */
function plain() {
  const o = {};
  for (const f of C.FIELDS) o[f] = params[f];
  return o;
}
let saveTimer, pendingSave = null, saving = false, saveBlocked = false, initialized = false;
function scheduleSave() {
  if (saveBlocked || !initialized) return;
  pendingSave = JSON.stringify(plain());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 600);
}
async function flushSave() {
  if (saving || !pendingSave || saveBlocked) return;
  const value = pendingSave; pendingSave = null; saving = true;
  try {
    await window.boxDatabase.execute('INSERT INTO box_parameters(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', [{type:'text',value}]);
  } catch (e) {
    saveBlocked = true;
    log('云端保存结果未知，请重新打开页面核对后继续：' + e.message);
  } finally {
    saving = false;
    if (pendingSave && !saveBlocked) flushSave();
  }
}
function saveJson() {
  const data = {
    app: '可组装拼接盒_参数化建模工具', format: 1,
    saved: new Date().toISOString(), params: plain(),
    derived: C.derivedReport(params),
    checks: C.validate(params)
  };
  download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    '拼接盒参数_' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json');
  log('参数已另存为 JSON');
}

/* ---------- 自检 ---------- */
const CASES = [
  ['default', {}], ['box40', { box: 40 }], ['box60', { box: 60 }],
  ['wall2.5', { wall: 2.5 }], ['wall6', { wall: 6 }], ['h20', { height: 20 }],
  ['h40', { height: 40 }], ['r3', { cav_r: 3 }], ['seg64', { n_seg: 64 }],
  ['seg720', { n_seg: 720 }], ['ten2.0', { ten_p: 2.0 }],
  ['biggap', { gap: 0.4, clr: 0.3 }], ['bot1.5', { bottom: 1.5 }],
  ['combo', { wall: 3.0, bottom: 2.0, cav_r: 2.5, ten_root: 8.0, u_ten: 13.0, u_mor: -13.0, ten_p: 1.5 }],
  ['small', { box: 30, wall: 2.0 }],
];
async function selftest() {
  const btn = $('#btnSelf');
  btn.disabled = true; btn.textContent = '自检中…';
  $('#selfWrap').style.display = 'block';
  $('#selfWrap').innerHTML = '';
  const rows = [];
  for (const [name, over] of CASES) {
    const p = C.makeParams(over);
    let mesh = null, dg = -1, nm = -1, dp = -1, vol = NaN, err = '—';
    try {
      mesh = C.buildBox(p)[0];
      const c = C.checkMesh(mesh);
      dg = c[0]; nm = c[1]; dp = c[2]; vol = c[3];
      const va = C.validate(p);
      const e = va.filter(v => v[0] === '错误');
      err = e.length ? `${e.length} 条错误` : '无错误';
    } catch (e) {
      err = '构建失败';
    }
    rows.push({ name, faces: mesh ? mesh.tris.length : '—', vol, dg, nm, dp, err });
    await sleep(0);
  }
  const iv = C.interference(C.makeParams({}));
  const geoOk = rows.every(r => r.dg === 0 && r.nm === 0 && r.dp === 0 && r.err !== '构建失败');
  const html = `<table class="st"><tr><th class="l">用例</th><th>面片</th><th>体积 mm³</th>`
    + `<th>退化</th><th>非流形</th><th>重复边</th><th class="l">校核</th><th>几何</th></tr>`
    + rows.map(r => `<tr><td class="l">${r.name}</td><td>${r.faces}</td>`
    + `<td>${isFinite(r.vol) ? C.pyfmt(r.vol, 1) : '—'}</td>`
    + `<td>${r.dg}</td><td>${r.nm}</td><td>${r.dp}</td><td class="l">${r.err}</td>`
    + `<td class="${(r.dg === 0 && r.nm === 0 && r.dp === 0) ? 'pass' : 'fail'}">`
    + `${(r.dg === 0 && r.nm === 0 && r.dp === 0) ? '通过' : '异常'}</td></tr>`).join('')
    + `</table>`;
  $('#selfWrap').innerHTML = html;
  const concl = `自检结论：${rows.length} 组参数几何 ${geoOk ? '全部通过' : '存在异常'}`
    + `（退化/非流形/重复边均为 0）；干涉重叠 ${iv[0]}、插入深度 ${C.pyfmt(iv[1], 2)} mm。`;
  log(concl);
  const sum = document.createElement('div');
  sum.style.cssText = 'margin-top:6px;font-size:12px';
  sum.innerHTML = `<b class="${geoOk && iv[0] === 0 ? 'pass' : 'fail'}">${concl}</b>`
    + `<span style="color:var(--muted)">　注：small 为 30mm 盒的边界用例，其「错误」条目属预期提示，不代表内核异常。</span>`;
  $('#selfWrap').appendChild(sum);
  btn.disabled = false; btn.textContent = '自检';
}

/* ---------- 事件绑定 ---------- */
function bind() {
  $('#btnBox').onclick = () => exportOne('box');
  $('#btnArr').onclick = () => exportOne('array');
  $('#btnCoupon').onclick = () => exportOne('coupon');
  $('#btnAll').onclick = exportAll;
  $('#btnSelf').onclick = selftest;
  $('#btnReset').onclick = () => {
    fillParams(C.makeParams({}));
    $('#preset').value = '';
    log('已恢复默认参数');
    refresh(true);
  };
  $('#btnSave').onclick = saveJson;
  $('#btnLoad').onclick = () => $('#fileJson').click();
  $('#fileJson').addEventListener('change', ev => {
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        const src = d.params || d;
        const bad = C.FIELDS.filter(k => src[k] === undefined || !isFinite(Number(src[k])));
        if (bad.length) throw new Error('缺少或非法字段：' + bad.join(', '));
        fillParams(C.makeParams(src));
        $('#preset').value = '';
        log('已载入参数文件：' + f.name);
        refresh(true);
      } catch (e) {
        log('载入失败：' + e.message);
        alert('参数文件无法解析：' + e.message);
      }
    };
    rd.readAsText(f);
    ev.target.value = '';
  });
  let rt = null;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (lastOutline) drawAll(lastOutline); }, 120);
  });
}

/* ---------- 启动 ---------- */
buildPanel();
bind();
const controls = [...document.querySelectorAll("input, select, button")];
controls.forEach(control => { control.disabled = true; });
(async () => {
  try {
    const result = await window.boxDatabase.execute('SELECT data FROM box_parameters WHERE id = 1');
    const saved = result.rows?.[0]?.[0]?.value;
    fillParams(C.makeParams(saved ? JSON.parse(saved) : {}));
    if (saved) log('已恢复云端参数');
  } catch (e) {
    saveBlocked = true;
    fillParams(C.makeParams({}));
    log('无法读取云端参数，请检查连接后重新打开：' + e.message);
  }
  log('就绪');
  doRefresh();
  initialized = true;
  controls.forEach(control => { control.disabled = false; });
})();
})();
