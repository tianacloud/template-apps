import {ALG_TABLE,parseAlg,tokenizeAlg} from './notation.js';
import { Cube, parse as readMove } from "./cube.js";
function mountCubeUI({saveSetting = () => {}} = {}) {
  const logicalCube = new Cube();
  let revision = 0;
  const TAU = Math.PI / 180;
  const IDENT = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];
  function matMul(a, b) {
    const o = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return o;
  }
  function mulVec(m, v) {
    return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
  }
  function tr(m) {
    return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function rotAxis(u, th) {
    const [x, y, z] = u, c = Math.cos(th), s = Math.sin(th), t = 1 - c;
    return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
  }
  const ROT24 = (() => {
    const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
    const out = [];
    for (const p of perms) for (let sg = 0; sg < 8; sg++) {
      const s = [sg & 1 ? -1 : 1, sg & 2 ? -1 : 1, sg & 4 ? -1 : 1];
      const m = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 3; i++) m[i * 3 + p[i]] = s[i];
      const det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
      if (det > 0.5) out.push(m);
    }
    return out;
  })();
  function snapOrbit(O2) {
    let best = ROT24[0], bv = -Infinity;
    for (const R of ROT24) {
      let s = 0;
      for (let i = 0; i < 9; i++) s += O2[i] * R[i];
      if (s > bv) {
        bv = s;
        best = R;
      }
    }
    return best;
  }
  function cssMat(m) {
    const a = [m[0], m[3], m[6], 0, m[1], m[4], m[7], 0, m[2], m[5], m[8], 0, 0, 0, 0, 1];
    return "matrix3d(" + a.map((v) => Math.abs(v) < 1e-9 ? 0 : +v.toFixed(6)).join(",") + ")";
  }
  function axisAngle(m) {
    const ang = Math.acos(Math.max(-1, Math.min(1, (m[0] + m[4] + m[8] - 1) / 2)));
    if (ang < 1e-6) return { axis: [0, 1, 0], ang: 0 };
    let ax;
    if (ang < Math.PI - 1e-4) {
      ax = [m[7] - m[5], m[2] - m[6], m[3] - m[1]];
    } else {
      const d = [Math.sqrt(Math.max(0, (m[0] + 1) / 2)), Math.sqrt(Math.max(0, (m[4] + 1) / 2)), Math.sqrt(Math.max(0, (m[8] + 1) / 2))];
      const k = d[0] >= d[1] ? d[0] >= d[2] ? 0 : 2 : d[1] >= d[2] ? 1 : 2;
      const s = 4 * Math.max(d[k], 1e-6);
      if (k === 0) ax = [d[0], (m[1] + m[3]) / s, (m[2] + m[6]) / s];
      else if (k === 1) ax = [(m[1] + m[3]) / s, d[1], (m[5] + m[7]) / s];
      else ax = [(m[2] + m[6]) / s, (m[5] + m[7]) / s, d[2]];
    }
    const n = Math.hypot(ax[0], ax[1], ax[2]) || 1;
    return { axis: [ax[0] / n, ax[1] / n, ax[2] / n], ang };
  }
  const C_UP = "#F2F2F2", C_DN = "#FFD500", C_FR = "#009B48", C_BK = "#0045AD", C_RT = "#B90000", C_LF = "#FF5900", C_IN = "#15181d";
  const FACES = [{ key: "F", dir: [0, 0, 1], tf: "translateZ(var(--tz))", col: C_FR }, { key: "B", dir: [0, 0, -1], tf: "rotateY(180deg) translateZ(var(--tz))", col: C_BK }, { key: "R", dir: [1, 0, 0], tf: "rotateY(90deg) translateZ(var(--tz))", col: C_RT }, { key: "L", dir: [-1, 0, 0], tf: "rotateY(-90deg) translateZ(var(--tz))", col: C_LF }, { key: "U", dir: [0, -1, 0], tf: "rotateX(90deg) translateZ(var(--tz))", col: C_UP }, { key: "D", dir: [0, 1, 0], tf: "rotateX(-90deg) translateZ(var(--tz))", col: C_DN }];
  const stage = document.getElementById("stage");
  const scene = document.getElementById("scene");
  const cubeEl = document.getElementById("cube");
  const elMv = document.getElementById("mv");
  const elTm = document.getElementById("tm");
  const elLast = document.getElementById("last");
  const elMsg = document.getElementById("msg");
  const btnHelp = document.getElementById("btnHelp");
  btnHelp.onclick = () => {
    const on = document.body.classList.toggle("helpOpen");
    btnHelp.classList.toggle("on", on);
  };
  const btnNota = document.getElementById("btnNota");
  btnNota.onclick = () => {
    document.body.classList.remove("whbarOpen");
    btnWhole.classList.remove("on");
    btnWhole.setAttribute("aria-pressed", false);
    const on = document.body.classList.toggle("notabOpen");
    btnNota.classList.toggle("on", on);
    btnNota.setAttribute("aria-pressed", on);
  };
  const btnWhole = document.getElementById("btnWhole");
  function closeWhole() {
    document.body.classList.remove("whbarOpen");
    btnWhole.classList.remove("on");
    btnWhole.setAttribute("aria-pressed", false);
  }
  btnWhole.onclick = () => {
    document.body.classList.remove("notabOpen");
    btnNota.classList.remove("on");
    btnNota.setAttribute("aria-pressed", false);
    const on = document.body.classList.toggle("whbarOpen");
    btnWhole.classList.toggle("on", on);
    btnWhole.setAttribute("aria-pressed", on);
  };
  const whClose = document.getElementById("whClose");
  whClose.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    whClose.classList.add("act");
    closeWhole();
  });
  whClose.addEventListener("pointerup", () => whClose.classList.remove("act"));
  whClose.addEventListener("pointercancel", () => whClose.classList.remove("act"));
  whClose.addEventListener("pointerleave", () => whClose.classList.remove("act"));
  document.querySelectorAll("#whbar .wt").forEach((el) => {
    const tok = el.dataset.w;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const base = ALG_TABLE[tok[0] === "S" ? "S" : tok[0].toLowerCase()];
      const prime = tok.indexOf("\u2032") >= 0;
      const twice = tok.indexOf("2") >= 0;
      const deg = base[2] * (prime ? -1 : 1) * (twice ? 2 : 1);
      const a = gripAxis(base[0]);
      el.classList.add("act");
      fire({ A: a, sigma: base[1], deg, abs: a, whole: !!base[3], tok, src: "w" + tok });
      if (base[3]) gripAdd(a, deg);
    });
    const off = () => el.classList.remove("act");
    el.addEventListener("pointerup", off);
    el.addEventListener("pointercancel", off);
    el.addEventListener("pointerleave", off);
  });
  let CELL = 58, CUBIE = 54;
  const cubies = [];
  function buildCube() {
    cubeEl.innerHTML = "";
    cubies.length = 0;
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if (!x && !y && !z) continue;
      const el = document.createElement("div");
      el.className = "cubie";
      for (const f of FACES) {
        const d = document.createElement("div");
        d.className = "face";
        d.style.transform = f.tf;
        const i = document.createElement("i");
        const on = dot(f.dir, [x, y, z]) === 1;
        i.style.background = on ? f.key === "U" ? upCol : f.col : C_IN;
        if (on) i.dataset.f = f.key;
        d.appendChild(i);
        el.appendChild(d);
      }
      cubeEl.appendChild(el);
      const zeros = (x === 0 ? 1 : 0) + (y === 0 ? 1 : 0) + (z === 0 ? 1 : 0);
      cubies.push({ el, home: [x, y, z], pos: [x, y, z], m: IDENT(), isCenter: zeros === 2 });
    }
  }
  function place(c, R, liftCell) {
    let p = c.pos, m = c.m;
    if (R) {
      p = mulVec(R, p);
      m = matMul(R, m);
    }
    if (liftCell) p = [p[0] + liftCell[0], p[1] + liftCell[1], p[2] + liftCell[2]];
    c.el.style.transform = "translate3d(" + (p[0] * CELL).toFixed(2) + "px," + (p[1] * CELL).toFixed(2) + "px," + (p[2] * CELL).toFixed(2) + "px) " + cssMat(m);
  }
  const applyOrbit = () => {
    cubeEl.style.transform = cssMat(O);
    updateLabels();
  };
  const DEFAULT_O = matMul(rotAxis([1, 0, 0], -22 * TAU), rotAxis([0, 1, 0], -32 * TAU));
  let O = DEFAULT_O.slice();
  let anim = null;
  const pending = [];
  const MOVE_MS = 195;
  const SCRAM_MS = 115;
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function startMove(it) {
    if (anim) return false;
    const a = (it.abs || mulVec(tr(snapOrbit(O)), it.A)).map(Math.round);
    const layer = cubies.filter((c) => it.wide ? dot(c.pos, a) !== -it.sigma : dot(c.pos, a) === it.sigma);
    if (!layer.length) return false;
    let deg = it.deg;
    if (it.msign) {
      const c = MID_CANON[LET_MID[a.join(",")]];
      deg = (c ? 90 * dot(a, c) : 90) * it.msign;
    }
    anim = { layer, axis: a, sigma: it.sigma, ang: deg * TAU, t0: performance.now(), dur: it.dur || MOVE_MS, kind: it.kind || "", src: it.src || "", tok: it.tok || "", wide: !!it.wide };
    for (const c of layer) c.el.classList.add("turning");
    return true;
  }
  let lastTap = { src: "", t: 0 };
  function pushMove(letter, src) {
    const now = performance.now();
    const prev = moveSeq.length ? moveSeq[moveSeq.length - 1] : "";
    const base = letter.replace(/['′2]$/, "");
    const is2 = /2$/.test(letter);
    const curPrime = /['′]$/.test(letter);
    if (src && lastTap.src === src && now - lastTap.t < 700 && prev) {
      if (is2) {
        if (prev === letter) moveSeq.pop();
        else pushSeq(moveSeq, letter);
      } else if (prev === letter) {
        moveSeq[moveSeq.length - 1] = base + "2";
      } else if (prev === letter + "2") {
        moveSeq[moveSeq.length - 1] = base + (curPrime ? "" : "\u2032");
      } else {
        pushSeq(moveSeq, letter);
      }
    } else {
      pushSeq(moveSeq, letter);
    }
    lastTap = { src: src || "", t: now };
    elLast.textContent = moveSeq.length ? moveSeq[moveSeq.length - 1] : letter;
  }
  function finishMove() {
    revision++;
    const absToken = moveLetter(anim.axis, anim.sigma, anim.ang / TAU);
    const move = readMove(absToken)[0];
    if (anim.wide) move.wide = true;
    logicalCube.move(move);
    const R = rotAxis(anim.axis, anim.ang);
    for (const c of anim.layer) {
      c.el.classList.remove("turning");
      c.pos = mulVec(R, c.pos).map(Math.round);
      c.m = matMul(R, c.m);
      place(c, null);
    }
    const letter = anim.tok || moveLetter(anim.axis, anim.sigma, anim.ang / TAU);
    if (anim.kind === "scram") {
      pushSeq(scramSeq, letter);
    } else {
      pushMove(letter, anim.src);
    }
    renderSeq();
    if (anim.kind !== "scram") {
      moves++;
      trSource = "move";
    }
    anim = null;
    updateHud();
    if (timerAuto && !timerOn && !solved && !scrambling && !timerUserOff) {
      if (tAcc > 0) timerReset();
      timerStart();
    }
  }
  function tick(now) {
    if (anim) {
      const t = Math.min(1, (now - anim.t0) / anim.dur);
      const R = rotAxis(anim.axis, anim.ang * easeInOut(t));
      const k = Math.sin(Math.PI * t) * 0.07 * anim.sigma;
      const lift = [anim.axis[0] * k, anim.axis[1] * k, anim.axis[2] * k];
      for (const c of anim.layer) place(c, R, lift);
      if (t >= 1) finishMove();
    } else if (pending.length && !viewAnim) {
      const it = pending.shift();
      if (it.whole) {
        revision++;
        animateView(matMul(O, rotAxis(it.abs, it.deg * TAU)), 200);
        pushMove(it.tok, it.src);
        trSource = "move";
        renderSeq();
      } else if (!startMove(it)) {
        pending.unshift(it);
      }
    }
    if (scrambling && !anim && !pending.length) {
      scrambling = false;
      if (timerAuto) timerReset();
      if (!solved) elMsg.textContent = "";
    }
    if (timerAuto && timerOn && !anim && solved && !wasSolved) {
      timerPause(false);
      elMsg.textContent = "\u5DF2\u590D\u539F \u{1F389}";
    }
    wasSolved = solved;
    if (timerOn) {
      const s = fmt(timerMs());
      if (s !== tmShown) {
        elTm.textContent = s;
        tmShown = s;
      }
    }
  }
  const MAXQ = 400;
  function fire(o) {
    if (pending.length >= MAXQ) return;
    pending.push({ A: o.A, sigma: o.sigma, deg: o.deg || 0, dur: o.dur || MOVE_MS, kind: o.kind || "", abs: o.abs || null, whole: !!o.whole, tok: o.tok || "", src: o.src || "", msign: o.msign || 0, wide: !!o.wide });
  }
  const SIDE = { U: { A: [0, 1, 0], sigma: -1, orient: "h" }, D: { A: [0, 1, 0], sigma: 1, orient: "h" }, L: { A: [1, 0, 0], sigma: -1, orient: "v" }, R: { A: [1, 0, 0], sigma: 1, orient: "v" } };
  const MID = { h: { A: [1, 0, 0], sigma: 0, orient: "v" }, v: { A: [0, 1, 0], sigma: 0, orient: "h" } };
  const CORNER = { cBL: { A: [0, 0, 1], sigma: -1, deg: -90 }, cBR: { A: [0, 0, 1], sigma: -1, deg: 90 }, cFL: { A: [0, 0, 1], sigma: 1, deg: 90 }, cFR: { A: [0, 0, 1], sigma: 1, deg: -90 } };
  const LET_FACE = { "1,0,0": "R", "-1,0,0": "L", "0,1,0": "D", "0,-1,0": "U", "0,0,1": "F", "0,0,-1": "B" };
  const LET_MID = { "1,0,0": "M", "-1,0,0": "M", "0,1,0": "E", "0,-1,0": "E", "0,0,1": "S", "0,0,-1": "S" };
  const MID_CANON = { M: [-1, 0, 0], E: [0, 1, 0], S: [0, 0, 1] };
  function moveLetter(a, sigma, deg) {
    const k = a.join(",");
    let L, pos;
    if (sigma === 0) {
      L = LET_MID[k] || "?";
      const c = MID_CANON[L];
      pos = c ? 90 * dot(a, c) : 90;
    } else {
      const s = sigma > 0 ? 1 : -1;
      L = LET_FACE[[a[0] * s, a[1] * s, a[2] * s].join(",")] || "?";
      pos = sigma * 90;
    }
    if (L !== "?" && deg !== void 0 && Math.abs(deg) > 1e-6) {
      if (Math.abs(Math.round(deg)) === 180) L += "2";
      else if (Math.round(deg) !== Math.round(pos)) L += "\u2032";
    }
    return L;
  }

  let gripG = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const gripAxis = (n) => mulVec(tr(gripG), n).map(Math.round);
  const gripReset = () => {
    gripG = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  };
  function gripAdd(a, deg) {
    gripG = matMul(rotAxis(a, deg * TAU), gripG).map(Math.round);
  }
  const LABELS = [];
  function regLabel(el, A, sigma, deg, msign) {
    if (el) LABELS.push({ el, A, sigma, deg, msign });
  }
  const KNOB_SIGN = { U: 1, D: -1, L: 1, R: -1 };
  const halfDeg = (isH, dir) => isH ? dir * 90 : -dir * 90;
  for (const id in SIDE) {
    const bar = document.getElementById("bar" + id);
    const isH = bar.classList.contains("h");
    const side = SIDE[id];
    bar.querySelectorAll(".half").forEach((h) => {
      regLabel(h.querySelector(".mv"), side.A, side.sigma, halfDeg(isH, +h.dataset.dir));
    });
    const mid = MID[isH ? "h" : "v"];
    const kn = bar.querySelector(".knob");
    const hz = mid.orient === "h";
    regLabel(kn.querySelector(".gl"), mid.A, mid.sigma, void 0, KNOB_SIGN[id]);
    regLabel(kn.querySelector(hz ? ".lf" : ".up"), mid.A, mid.sigma, hz ? -90 : 90);
    regLabel(kn.querySelector(hz ? ".rt" : ".dn"), mid.A, mid.sigma, hz ? 90 : -90);
  }
  for (const id in CORNER) {
    const c = CORNER[id];
    regLabel(document.getElementById(id).querySelector(".cn"), c.A, c.sigma, c.deg);
  }
  let lastSnapKey = "";
  function updateLabels() {
    const Ob = viewAnim ? matMul(rotAxis(viewAnim.axis, viewAnim.ang), viewAnim.base) : O;
    const S = snapOrbit(Ob), key = S.join(",");
    if (key === lastSnapKey) return;
    lastSnapKey = key;
    const T = tr(S);
    for (const it of LABELS) {
      const a = mulVec(T, it.A).map(Math.round);
      let deg = it.deg;
      if (it.msign) {
        const c = MID_CANON[LET_MID[a.join(",")]];
        deg = (c ? 90 * dot(a, c) : 90) * it.msign;
      }
      it.el.textContent = moveLetter(a, it.sigma, deg);
    }
  }
  const ORBIT_K = 86e-4;
  let drag = null;
  function onDown(e) {
    if (e.button !== void 0 && e.button !== 0) return;
    if (drag) return;
    const t = e.target;
    if (document.body.classList.contains("whbarOpen")) closeWhole();
    if (t.closest(".corner")) return;
    msgHold = false;
    const knob = t.closest(".knob");
    const bar = t.closest(".bar");
    let spec = null, knobEl = null, barEl = null, halfEl = null;
    if (knob) {
      barEl = knob.closest(".bar");
      spec = MID[barEl.classList.contains("h") ? "h" : "v"];
      knobEl = knob;
    } else if (bar) {
      spec = SIDE[bar.dataset.side];
      barEl = bar;
      halfEl = t.closest(".half");
    }
    if (barEl) barEl.classList.add("act");
    if (knobEl) knobEl.classList.add("act");
    if (halfEl) halfEl.classList.add("act");
    const baseT = Math.max(14, Math.round(stage.clientWidth * 0.045));
    const T = knobEl ? Math.max(24, Math.round(baseT * 1.5)) : baseT;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, spec, knobEl, barEl, halfEl, T, baseT, fired: 0, done: false, moved: false, dir: 0 };
    try {
      stage.setPointerCapture(e.pointerId);
    } catch (_) {
    }
  }
  const TAP_SLOP = 14;
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (!drag.spec) {
      viewAnim = null;
      O = matMul(rotAxis([1, 0, 0], -dy * ORBIT_K), matMul(rotAxis([0, 1, 0], dx * ORBIT_K), O));
      applyOrbit();
      return;
    }
    if (drag.done) return;
    const tx = e.clientX - drag.sx, ty = e.clientY - drag.sy;
    if (Math.abs(tx) > TAP_SLOP || Math.abs(ty) > TAP_SLOP) drag.moved = true;
    if (drag.knobEl) {
      const h = drag.spec.orient === "h";
      const q2 = h ? ty : tx, p2 = h ? tx : ty;
      if (Math.abs(q2) > Math.max(30, drag.T * 1.15) && Math.abs(q2) > Math.abs(p2) * 1.5) {
        const fb = SIDE[drag.barEl.dataset.side];
        drag.spec = fb;
        fire({ A: fb.A, sigma: fb.sigma, deg: fb.orient === "h" ? q2 > 0 ? 90 : -90 : q2 > 0 ? -90 : 90 });
        rearm(e);
        return;
      }
    }
    const horiz = drag.spec.orient === "h";
    const p = horiz ? tx : ty;
    const q = horiz ? ty : tx;
    if (Math.abs(p) > TAP_SLOP && Math.abs(p) >= Math.abs(q)) drag.dir = p > 0 ? 1 : -1;
    if (Math.abs(p) > drag.T && Math.abs(p) >= Math.abs(q)) {
      fire({ A: drag.spec.A, sigma: drag.spec.sigma, deg: horiz ? p > 0 ? 90 : -90 : p > 0 ? -90 : 90 });
      rearm(e);
    }
  }
  function rearm(e) {
    drag.fired++;
    if (drag.knobEl) {
      drag.done = true;
      return;
    }
    if (drag.fired < 3) {
      drag.sx = e.clientX;
      drag.sy = e.clientY;
      drag.T = Math.round(drag.baseT * 6.5);
    } else {
      drag.done = true;
    }
  }
  function onUp(e) {
    if (!drag || e.pointerId !== void 0 && e.pointerId !== drag.id) return;
    try {
      stage.releasePointerCapture(drag.id);
    } catch (_) {
    }
    if (drag.spec && !drag.fired) {
      if (drag.dir) {
        const horiz = drag.spec.orient === "h";
        fire({ A: drag.spec.A, sigma: drag.spec.sigma, deg: horiz ? drag.dir > 0 ? 90 : -90 : drag.dir > 0 ? -90 : 90 });
      } else if (!drag.moved) {
        const src = drag.knobEl ? "k" + drag.barEl.id : "h" + drag.barEl.id + drag.halfEl.dataset.dir;
        if (drag.knobEl) {
          fire({ A: drag.spec.A, sigma: drag.spec.sigma, msign: KNOB_SIGN[drag.barEl.dataset.side] || 1, src });
        } else if (drag.halfEl) {
          fire({ A: drag.spec.A, sigma: drag.spec.sigma, deg: halfDeg(drag.barEl.classList.contains("h"), +drag.halfEl.dataset.dir), src });
        }
      }
    }
    if (drag.barEl) drag.barEl.classList.remove("act");
    if (drag.knobEl) drag.knobEl.classList.remove("act");
    if (drag.halfEl) drag.halfEl.classList.remove("act");
    drag = null;
  }
  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", onUp);
  stage.addEventListener("pointercancel", onUp);
  addEventListener("pointerup", onUp);
  addEventListener("pointercancel", onUp);
  stage.addEventListener("contextmenu", (e) => e.preventDefault());
  let holdT = null, holdR = null;
  function stopHold() {
    clearTimeout(holdT);
    clearInterval(holdR);
    holdT = holdR = null;
    document.querySelectorAll(".corner.act").forEach((e) => e.classList.remove("act"));
  }
  document.querySelectorAll(".corner").forEach((el) => {
    const spec = CORNER[el.id];
    const go = (src) => fire({ A: spec.A, sigma: spec.sigma, deg: spec.deg, src });
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopHold();
      el.classList.add("act");
      go(el.id);
      holdT = setTimeout(() => {
        holdR = setInterval(() => go(""), 340);
      }, 480);
    });
  });
  addEventListener("pointerup", stopHold);
  addEventListener("pointercancel", stopHold);
  addEventListener("blur", stopHold);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopHold();
  });
  let moves = 0, solved = true;
  let scrambling = false;
  let msgHold = false;
  let wasSolved = true;
  const scramSeq = [], moveSeq = [];
  const SEQ_MAX = 600;
  function pushSeq(arr, s) {
    arr.push(s);
    if (arr.length > SEQ_MAX) arr.shift();
  }
  const elSeqScram = document.getElementById("seqScram");
  const elSeqMove = document.getElementById("seqMove");
  function renderSeq() {
    for (const [el, arr] of [[elSeqScram, scramSeq], [elSeqMove, moveSeq]]) {
      el.textContent = arr.length ? arr.join(" ") : "\u2014";
      el.classList.toggle("empty", !arr.length);
    }
    elSeqMove.scrollTop = elSeqMove.scrollHeight;
    refreshTranslate();
  }
  const isIdentity = (m) => {
    const I = IDENT();
    let d = 0;
    for (let i = 0; i < 9; i++) d += Math.abs(m[i] - I[i]);
    return d < 1e-3;
  };
  function updateHud() {
    elMv.textContent = moves;
    solved = cubies.every((c) => c.pos[0] === c.home[0] && c.pos[1] === c.home[1] && c.pos[2] === c.home[2] && (c.isCenter || isIdentity(c.m)));
    if (!solved && !scrambling && !msgHold) elMsg.textContent = "";
  }
  const fmt = (ms) => {
    const s = Math.floor(ms / 1e3);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  let timerEdited = false, whiteEdited = false;
  let timerOn = false, tStart = 0, tAcc = 0, timerUserOff = false;
  let tmShown = "";
  let timerAuto = true;
  const timerMs = () => tAcc + (timerOn ? performance.now() - tStart : 0);
  const btnTime = document.getElementById("btnTime");
  const btnTimeR = document.getElementById("btnTimeR");
  const btnTMode = document.getElementById("btnTMode");
  function syncTimerUI() {
    btnTMode.textContent = timerAuto ? "\u81EA\u52A8\u8BA1\u65F6" : "\u624B\u52A8\u8BA1\u65F6";
    btnTMode.classList.toggle("on", timerAuto);
    btnTMode.setAttribute("aria-pressed", timerAuto);
    btnTime.textContent = timerAuto ? timerOn ? "\u8BA1\u65F6\u4E2D" : "\u5F85\u5F00\u59CB" : timerOn ? "\u6682\u505C" : "\u5F00\u59CB";
    btnTime.classList.toggle("on", timerOn && !timerAuto);
    btnTime.disabled = timerAuto;
    btnTimeR.disabled = timerAuto;
    btnTime.title = timerAuto ? "\u81EA\u52A8\u8BA1\u65F6\uFF1A\u8D70\u7B2C\u4E00\u6B65\u81EA\u52A8\u5F00\u59CB\uFF0C\u5B8C\u5168\u590D\u539F\u81EA\u52A8\u505C\u6B62" : "\u624B\u52A8\u8BA1\u65F6\uFF1A\u6309\u4E00\u4E0B\u5F00\u59CB\uFF0C\u518D\u6309\u6682\u505C";
    btnTimeR.title = timerAuto ? "\u81EA\u52A8\u8BA1\u65F6\u4E0B\u4E0D\u53EF\u624B\u52A8\u590D\u4F4D\uFF08\u70B9\u300C\u6253\u4E71\u300D\u6216\u300C\u590D\u539F\u300D\u624D\u4F1A\u6E05\u96F6\uFF09" : "\u628A\u7528\u65F6\u6E05\u96F6";
  }
  function setTimerMode(auto, persist = true) {
    timerAuto = !!auto;
    if (persist) { timerEdited = true; saveSetting("timerAuto", timerAuto ? "1" : "0"); }
    timerReset();
    timerUserOff = false;
  }
  function timerStart() {
    if (timerOn) return;
    tStart = performance.now();
    timerOn = true;
    timerUserOff = false;
    syncTimerUI();
  }
  function timerPause(user) {
    if (!timerOn) return;
    tAcc += performance.now() - tStart;
    timerOn = false;
    if (user) timerUserOff = true;
    const s = fmt(timerMs());
    if (s !== tmShown) {
      elTm.textContent = s;
      tmShown = s;
    }
    syncTimerUI();
  }
  function timerReset() {
    tAcc = 0;
    tStart = performance.now();
    timerOn = false;
    timerUserOff = false;
    elTm.textContent = "00:00";
    tmShown = "00:00";
    syncTimerUI();
  }
  btnTime.onclick = () => {
    if (timerAuto) return;
    timerOn ? timerPause(true) : timerStart();
  };
  btnTimeR.onclick = () => {
    if (timerAuto) return;
    timerReset();
  };
  btnTMode.onclick = () => setTimerMode(!timerAuto);
  syncTimerUI();
  function reset(keepView) {
    revision++;
    logicalCube.reset();
    pending.length = 0;
    anim = null;
    for (const c of cubies) {
      c.el.classList.remove("turning");
      c.pos = c.home.slice();
      c.m = IDENT();
      place(c, null);
    }
    scrambling = false;
    msgHold = false;
    moveSeq.length = 0;
    moves = 0;
    solved = true;
    wasSolved = true;
    trSource = "move";
    gripReset();
    elLast.textContent = "\u2014";
    renderSeq();
    timerReset();
    elMsg.textContent = "";
    if (!keepView) {
      O = DEFAULT_O.slice();
      applyOrbit();
    }
    updateHud();
  }
  function scramble(n) {
    reset(true);
    scramSeq.length = 0;
    renderSeq();
    const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    let last = -1;
    for (let i = 0; i < n; i++) {
      let ai;
      do {
        ai = Math.floor(Math.random() * 3);
      } while (ai === last);
      last = ai;
      fire({ A: axes[ai], sigma: Math.random() < 0.5 ? 1 : -1, deg: Math.random() < 0.5 ? 90 : -90, dur: SCRAM_MS, kind: "scram" });
    }
    scrambling = true;
    elMsg.textContent = "\u6253\u4E71\u4E2D\u2026";
  }
  let viewAnim = null;
  function animateView(target, dur) {
    const { axis, ang } = axisAngle(matMul(target, tr(O)));
    viewAnim = { axis, ang, t0: performance.now(), dur: dur || 320, base: O.slice() };
  }
  function tickView(now) {
    if (!viewAnim) return;
    const t = Math.min(1, (now - viewAnim.t0) / viewAnim.dur);
    O = matMul(rotAxis(viewAnim.axis, viewAnim.ang * (1 - Math.pow(1 - t, 3))), viewAnim.base);
    applyOrbit();
    if (t >= 1) viewAnim = null;
  }
  document.getElementById("btnScr").onclick = () => scramble(24);
  document.getElementById("btnReset").onclick = () => reset(true);
  document.getElementById("btnView").onclick = () => animateView(DEFAULT_O.slice());
  document.getElementById("btnMark").onclick = (e) => {
    const on = document.body.classList.toggle("mk");
    e.currentTarget.classList.toggle("on", on);
    e.currentTarget.setAttribute("aria-pressed", on);
  };
  const ALG_MS = 150;
  const algIn = document.getElementById("algIn");



  function runAlg(text) {
    const { out, bad } = parseAlg(text);
    msgHold = false;
    if (!out.length && !bad.length) {
      elMsg.textContent = "\u8BF7\u5148\u8F93\u5165\u516C\u5F0F";
      return false;
    }
    const room = MAXQ - pending.length;
    if (out.length > room) {
      out.length = Math.max(0, room);
      msgHold = true;
      elMsg.textContent = "\u516C\u5F0F\u8FC7\u957F\uFF0C\u53EA\u6267\u884C\u524D " + room + " \u6B65";
    }
    const dur = out.length > 12 ? 110 : ALG_MS;
    for (const it of out) {
      const a = gripAxis(it.a);
      fire({ A: a, sigma: it.sigma, deg: it.deg, dur, abs: a, whole: it.whole, tok: it.tok, wide: it.wide });
      if (it.whole) gripAdd(a, it.deg);
    }
    if (bad.length) {
      msgHold = true;
      elMsg.textContent = "\u65E0\u6CD5\u8BC6\u522B\uFF1A" + bad.join(" ") + "\u3000\uFF08\u652F\u6301 U D L R F B M E S x y z\u3001\u5BBD\u8F6C Rw Uw Fw\u2026\uFF0C\u53EF\u5E26 2 \u6216 \u2032\uFF09";
    }
    return bad.length === 0;
  }
  document.getElementById("btnAlg").onclick = () => {
    if (runAlg(algIn.value)) algIn.blur();
  };
  document.getElementById("btnAlgC").onclick = () => {
    algIn.value = "";
    clearClipboard();
    elMsg.textContent = "\u5DF2\u6E05\u7A7A \xB7 \u526A\u8D34\u677F\u5DF2\u6E05\u7A7A";
    algIn.focus();
  };
  algIn.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runAlg(algIn.value);
    }
  });
  function copyText(s) {
    const done = (ok) => {
      elMsg.textContent = ok ? "\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F" : "\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u4E2D";
    };
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = s;
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, s.length);
        const ok = document.execCommand("copy");
        ta.remove();
        done(ok);
      } catch (_) {
        done(false);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(() => done(true), fallback);
    else fallback();
  }
  function clearClipboard() {
    const legacy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        ta.value = "";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, 0);
        if (!document.execCommand("copy")) {
          ta.value = " ";
          ta.select();
          ta.setSelectionRange(0, 1);
          document.execCommand("copy");
        }
        ta.remove();
      } catch (_) {
      }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("").then(null, legacy);
        return;
      }
    } catch (_) {
    }
    legacy();
  }
  function clearSeq(arr, name) {
    if (arr.length) {
      arr.length = 0;
      renderSeq();
    }
    clearClipboard();
    elMsg.textContent = (name ? name + "\u5DF2\u6E05\u7A7A \xB7 " : "") + "\u526A\u8D34\u677F\u5DF2\u6E05\u7A7A";
  }
  document.getElementById("btnCopyS").onclick = () => {
    if (scramSeq.length) copyText(scramSeq.join(" "));
    else elMsg.textContent = "\u8FD8\u6CA1\u6709\u6253\u4E71\u5E8F\u5217";
  };
  document.getElementById("btnCopyM").onclick = () => {
    if (moveSeq.length) copyText(moveSeq.join(" "));
    else elMsg.textContent = "\u8FD8\u6CA1\u6709\u8D70\u6CD5\u8BB0\u5F55";
  };
  document.getElementById("btnClrS").onclick = () => clearSeq(scramSeq, "\u6253\u4E71\u5E8F\u5217");
  document.getElementById("btnClrM").onclick = () => clearSeq(moveSeq, "\u8D70\u6CD5");
  const trbox = document.getElementById("trbox");
  const trHead = document.getElementById("trHead");
  const trList = document.getElementById("trList");
  const trNote = document.getElementById("trNote");
  let trSource = "move";
  let trRendered = 0;
  let trWhole = 0;
  const FACE_N = { U: "\u4E0A\u5C42\uFF08\u9876\u9762\uFF09", D: "\u4E0B\u5C42\uFF08\u5E95\u9762\uFF09", L: "\u5DE6\u5C42", R: "\u53F3\u5C42", F: "\u524D\u5C42\uFF08\u671D\u5411\u4F60\uFF09", B: "\u540E\u5C42\uFF08\u80CC\u5411\u4F60\uFF09" };
  const MID_N = { M: "\u4E2D\u5C42 M\uFF08\u7AD6\u76F4\uFF0C\u65B9\u5411\u4E0E\u5DE6\u5C42 L \u4E00\u81F4\uFF09", E: "\u8D64\u9053\u5C42 E\uFF08\u6C34\u5E73\uFF0C\u65B9\u5411\u4E0E\u4E0B\u5C42 D \u4E00\u81F4\uFF09", S: "\u4FA7\u5C42 S\uFF08\u65B9\u5411\u4E0E\u524D\u5C42 F \u4E00\u81F4\uFF09" };
  const WHOLE_N = { x: "\u6574\u4F53\u7ED5\u53F3\u8F74", y: "\u6574\u4F53\u7ED5\u4E0A\u8F74", z: "\u6574\u4F53\u7ED5\u524D\u8F74" };
  function describeToken(raw) {
    const t = String(raw).replace(/[’`´‵ʻʹ′]/g, "'").replace(/[²]/g, "2").replace(/('+)/g, (m2) => m2.length % 2 ? "'" : "");
    const m = /^([UDLRFBMESXYZ])(W?)(2[']?|[']?2?)?$/i.exec(t);
    if (!m) return null;
    const face = m[1].toUpperCase();
    const low = m[1].toLowerCase();
    const isFace = "udlrfb".indexOf(low) >= 0;
    const wide = m[2] !== "" || isFace && m[1] === m[1].toLowerCase();
    const suf = m[3] || "";
    const twice = suf.indexOf("2") >= 0;
    const prime = suf.indexOf("'") >= 0;
    const dir = twice ? "\u8F6C180\xB0" : prime ? "\u9006\u65F6\u9488\u8F6C90\xB0" : "\u987A\u65F6\u9488\u8F6C90\xB0";
    if (wide && !FACE_N[face]) return null;
    if (wide) {
      const f = FACE_N[face] || face;
      return "\u5BBD\u8F6C\uFF1A" + f + "\u8FDE\u540C\u4E2D\u95F4\u5C42\u4E00\u8D77" + (twice ? "\u8F6C180\xB0" : prime ? "\u9006\u65F6\u9488\u8F6C90\xB0" : "\u987A\u65F6\u9488\u8F6C90\xB0");
    }
    if (FACE_N[face]) return FACE_N[face] + dir;
    if (MID_N[face]) return MID_N[face] + dir;
    if (WHOLE_N[face.toLowerCase()]) return WHOLE_N[face.toLowerCase()] + dir + "\uFF08\u6362\u63E1\u6301/\u89C6\u89D2\uFF0C\u4E0D\u8BA1\u6B65\uFF09";
    return null;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function openTranslate(text, label, source, forceFull) {
    const prevSource = trSource;
    trSource = source;
    trHead.textContent = "\u767D\u8BDD\u7FFB\u8BD1 \xB7 " + label;
    const toks = tokenizeAlg(text);
    const append = !forceFull && prevSource === source && trRendered > 0 && toks.length > trRendered;
    if (append) {
      let frag = "", addWhole = 0;
      for (let i = trRendered; i < toks.length; i++) {
        const tk = toks[i], d = describeToken(tk), bad = d === null;
        if (!bad && /^[xyz]$/i.test(tk[0]) && !/w/i.test(tk)) addWhole++;
        frag += '<div class="tline"><i' + (bad ? ' style="color:#ff8f8f"' : "") + ">" + (i + 1) + ".</i><span><b>" + esc(tk) + "</b> " + (bad ? "\u65E0\u6CD5\u8BC6\u522B\u6B64\u8BB0\u53F7" : d) + "</span></div>";
      }
      if (frag) trList.insertAdjacentHTML("beforeend", frag);
      trRendered = toks.length;
      trWhole += addWhole;
    } else {
      if (!toks.length) {
        const emptyMsg = source === "move" ? "\uFF08\u8FD8\u6CA1\u6709\u8D70\u6CD5\uFF0C\u79FB\u52A8\u9B54\u65B9\u540E\u8FD9\u91CC\u4F1A\u9010\u6761\u663E\u793A\uFF09" : source === "scram" ? "\uFF08\u8FD8\u6CA1\u6709\u6253\u4E71\uFF09" : "\uFF08\u516C\u5F0F\u6846\u662F\u7A7A\u7684\uFF09";
        trList.innerHTML = '<div class="tline"><span style="color:#8b93a7">' + emptyMsg + "</span></div>";
        trRendered = 0;
        trWhole = 0;
      } else {
        let html = "", whole = 0;
        toks.forEach((tk, i) => {
          const d = describeToken(tk), bad = d === null;
          if (!bad && /^[xyz]$/i.test(tk[0]) && !/w/i.test(tk)) whole++;
          html += '<div class="tline"><i' + (bad ? ' style="color:#ff8f8f"' : "") + ">" + (i + 1) + ".</i><span><b>" + esc(tk) + "</b> " + (bad ? "\u65E0\u6CD5\u8BC6\u522B\u6B64\u8BB0\u53F7" : d) + "</span></div>";
        });
        trList.innerHTML = html;
        trRendered = toks.length;
        trWhole = whole;
      }
    }
    let note = "\u5171 " + toks.length + " \u6B65";
    if (trWhole) note += "\uFF0C\u5176\u4E2D\u6574\u8F6C " + trWhole + " \u6B65\u53EA\u6362\u63E1\u6301/\u89C6\u89D2\u3001\u4E0D\u8BA1\u5165\u6B65\u6570";
    if (source === "scram") note += "\uFF08\u6253\u4E71\u5E8F\u5217\u672C\u8EAB\u4E0D\u8BA1\u5165\u4F60\u7684\u6B65\u6570\uFF09";
    if (trWhole) note += "\u3002x/y/z \u4E4B\u540E\u5199\u7684 U/R \u7B49\u6309\u300C\u65B0\u63E1\u6301\u300D\u7406\u89E3\u3002";
    trNote.textContent = note;
    if (append) trList.scrollTop = trList.scrollHeight;
  }
  function refreshTranslate() {
    if (trSource === "alg") openTranslate(algIn.value, "\u516C\u5F0F\u8F93\u5165\u6846", "alg", false);
    else if (trSource === "scram") openTranslate(scramSeq.join(" "), "\u6253\u4E71\u5E8F\u5217", "scram", false);
    else openTranslate(moveSeq.join(" "), "\u4F60\u7684\u8D70\u6CD5", "move", false);
  }
  algIn.addEventListener("click", () => openTranslate(algIn.value, "\u516C\u5F0F\u8F93\u5165\u6846", "alg", false));
  algIn.addEventListener("input", () => {
    if (trSource === "alg") openTranslate(algIn.value, "\u516C\u5F0F\u8F93\u5165\u6846", "alg", true);
  });
  elSeqScram.addEventListener("click", () => openTranslate(scramSeq.join(" "), "\u6253\u4E71\u5E8F\u5217", "scram", false));
  elSeqMove.addEventListener("click", () => openTranslate(moveSeq.join(" "), "\u4F60\u7684\u8D70\u6CD5", "move", false));
  const trCopy = document.getElementById("trCopy");
  trCopy.addEventListener("click", () => {
    const lines = [...trList.querySelectorAll(".tline")].map((el) => "\xB7 " + el.textContent.replace(/\s+/g, " ").replace(/^(\d+\.)(?=\S)/, "$1 ").trim());
    let txt = trHead.textContent + "\n" + lines.join("\n");
    const note = trNote.textContent.trim();
    if (note) txt += "\n" + note;
    copyText(txt);
    trCopy.textContent = "\u5DF2\u590D\u5236";
    trCopy.classList.add("done");
    clearTimeout(trCopy._t);
    trCopy._t = setTimeout(() => {
      trCopy.textContent = "\u590D\u5236";
      trCopy.classList.remove("done");
    }, 1400);
  });
  const UP_LEVELS = [{ n: "\u7EAF\u767D", c: "#FFFFFF" }, { n: "\u6781\u6D45", c: "#EDEFF1" }, { n: "\u6D45\u7070", c: "#D6D9DE" }, { n: "\u4E2D\u7070", c: "#BFC4CC" }, { n: "\u7070", c: "#A6ACB6" }, { n: "\u6DF1\u7070", c: "#8D939D" }, { n: "\u6697\u7070", c: "#6E747D" }, { n: "\u5FAE\u6697", c: "#5A606A" }, { n: "\u66F4\u6DF1", c: "#464C55" }, { n: "\u8FD1\u9ED1", c: "#2E3238" }];
  const rampEl = document.getElementById("ramp");
  const rampNow = document.getElementById("rampNow");
  let upCol = UP_LEVELS[0].c, upIdx = 0;
  function applyUpLevel(i, persist = true) {
    upIdx = Math.max(0, Math.min(UP_LEVELS.length - 1, i | 0));
    upCol = UP_LEVELS[upIdx].c;
    for (const el of cubeEl.querySelectorAll('i[data-f="U"]')) el.style.background = upCol;
    [...rampEl.children].forEach((b, k) => {
      const on = k === upIdx;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    rampNow.textContent = UP_LEVELS[upIdx].n + " " + upCol;
    if (persist) { whiteEdited = true; saveSetting("whiteLevel", String(upIdx)); }
  }
  UP_LEVELS.forEach((lv, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.style.background = lv.c;
    b.title = lv.n + " " + lv.c;
    b.setAttribute("aria-label", "\u767D\u9762\u8272\u9636 " + lv.n);
    b.setAttribute("aria-pressed", "false");
    b.onclick = () => applyUpLevel(i);
    rampEl.appendChild(b);
  });
  applyUpLevel(matchMedia("(pointer: coarse)").matches ? 6 : 0, false);
  const KEYMAP = {};
  for (const k of ["U", "D", "L", "R", "F", "B", "M", "E", "S", "x", "y", "z"]) {
    const t = ALG_TABLE[k];
    KEYMAP["Key" + k.toUpperCase()] = { a: t[0], sigma: t[1], deg: t[2], whole: !!t[3], k };
  }
  addEventListener("keydown", (e) => {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    const m = KEYMAP[e.code];
    if (!m) return;
    e.preventDefault();
    const deg = m.deg * (e.shiftKey ? -1 : 1);
    const tok = m.k + (deg < 0 ? "\u2032" : "");
    const a = gripAxis(m.a);
    fire({ A: a, sigma: m.sigma, deg, abs: a, whole: m.whole, tok, src: "key" + m.k });
    if (m.whole) gripAdd(a, deg);
  });
  function layout() {
    const s = Math.max(240, Math.min(innerWidth - 24, innerHeight - 300, 460));
    stage.style.width = s + "px";
    stage.style.height = s + "px";
    CELL = Math.round(s * 0.15);
    CUBIE = Math.round(CELL * 0.93);
    const span = CELL * 3;
    document.documentElement.style.setProperty("--cubie", CUBIE + "px");
    document.documentElement.style.setProperty("--tz", CUBIE / 2 + "px");
    scene.style.width = span + "px";
    scene.style.height = span + "px";
    scene.style.marginLeft = -span / 2 + "px";
    scene.style.marginTop = -span / 2 + "px";
    for (const c of cubies) place(c, null);
    const csz = Math.round(Math.max(40, Math.min(54, s * 0.13)));
    const bth = Math.round(Math.max(44, Math.min(52, s * 0.115)));
    const rs = document.documentElement.style;
    rs.setProperty("--csz", csz + "px");
    rs.setProperty("--bth", bth + "px");
    rs.setProperty("--ksz", Math.round(Math.max(34, Math.min(42, bth - 12))) + "px");
    rs.setProperty("--bin", csz + 12 + "px");
  }
  addEventListener("resize", layout);
  addEventListener("orientationchange", () => setTimeout(layout, 120));
  buildCube();
  layout();
  applyOrbit();
  updateHud();
  renderSeq();
  openTranslate(moveSeq.join(" "), "\u4F60\u7684\u8D70\u6CD5", "move", false);
  requestAnimationFrame(function loop(t) {
    tick(t);
    tickView(t);
    requestAnimationFrame(loop);
  });
  return { snapshot() {
    return { revision, moves: moveSeq.join(" "), elapsedMs: Math.round(timerMs()), steps: moves, solved, busy: !!(anim || pending.length || viewAnim), signature: logicalCube.signature() };
  }, validFormula(text) {
    return parseAlg(text);
  }, loadFormula(text) {
    algIn.value = text;
    openTranslate(text, "\u516C\u5F0F\u8F93\u5165\u6846", "alg", true);
  }, applySettings(settings) {
    if (!timerEdited && (settings.timerAuto === "0" || settings.timerAuto === "1")) { setTimerMode(settings.timerAuto === "1", false); syncTimerUI(); }
    if (!whiteEdited && /^\d+$/.test(settings.whiteLevel ?? "") && +settings.whiteLevel < UP_LEVELS.length) applyUpLevel(+settings.whiteLevel, false);
  }, resetDemo() {
    stopHold();
    drag = null;
    viewAnim = null;
    reset(false);
    scramSeq.length = 0;
    algIn.value = "";
    renderSeq();
    document.body.classList.remove("helpOpen", "notabOpen", "whbarOpen", "mk");
    ["btnHelp", "btnNota", "btnWhole", "btnMark"].forEach((id) => {
      const e = document.getElementById(id);
      e.classList.remove("on");
      e.setAttribute("aria-pressed", "false");
    });
    timerEdited = whiteEdited = false;
    setTimerMode(true, false);
    applyUpLevel(matchMedia("(pointer: coarse)").matches ? 6 : 0, false);
  } };
}
export {
  mountCubeUI
};
