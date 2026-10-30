/* ============================================================
   华夏五千年 · 视觉引擎（WebGL2）
   1. 流体 Ink Shader 背景（fbm 域扭曲 + 鼠标墨晕）
   2. 3D 线框浮动碎片（实例化 GL_LINES + 罗德里格旋转）
   3. 鼠标跟随粒子（GL_POINTS）
   4. Bloom 泛光（辉光缓冲 → 多次高斯 → 以「减墨」方式合成）
   全部原生实现，无第三方依赖；WebGL2 不可用时自动降级 CSS 背景
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("gl-canvas");
  if (!canvas) return;

  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance"
    });
  } catch (e) { gl = null; }

  if (!gl) { docEl.classList.add("no-gl"); return; }

  /* ---------------------------------------------------------
     着色器
     --------------------------------------------------------- */

  var VS_QUAD = [
    "#version 300 es",
    "layout(location = 0) in vec2 aPos;",
    "out vec2 vUv;",
    "void main(){",
    "  vUv = aPos * 0.5 + 0.5;",
    "  gl_Position = vec4(aPos, 0.0, 1.0);",
    "}"
  ].join("\n");

  var FS_INK = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "out vec4 fragColor;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec2 uMouse;",
    "uniform float uAspect;",
    "uniform float uEnergy;",

    "float hash21(vec2 p){",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",
    "float vnoise(vec2 p){",
    "  vec2 i = floor(p);",
    "  vec2 f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  float a = hash21(i);",
    "  float b = hash21(i + vec2(1.0, 0.0));",
    "  float c = hash21(i + vec2(0.0, 1.0));",
    "  float d = hash21(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0;",
    "  float a = 0.5;",
    "  for (int i = 0; i < 3; i++){",
    "    v += a * vnoise(p);",
    "    p = p * 2.03 + 11.7;",
    "    a *= 0.5;",
    "  }",
    "  return v / 0.875;",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  vec2 p = vec2(uv.x * uAspect, uv.y);",
    "  float t = uTime * 0.05;",

    "  vec2 q = vec2(",
    "    fbm(p * 1.25 + vec2(t, -t * 0.7)),",
    "    fbm(p * 1.25 + vec2(-t * 0.8, t * 0.6) + 4.3)",
    "  );",
    "  vec2 r = vec2(",
    "    fbm(p * 1.85 + q * 1.9 + vec2(t * 1.7, 0.0)),",
    "    fbm(p * 1.85 + q * 1.9 - vec2(0.0, t * 1.5) + 8.1)",
    "  );",
    "  float n = fbm(vec2(p.x * 1.9, p.y * 3.6) + r * 2.2 + vec2(0.0, -t * 0.55));",
    "  float ink = smoothstep(0.55, 0.93, n);",
    "  ink *= 0.40 + 0.60 * smoothstep(0.15, 0.95, r.y);",
    "  float wisp = smoothstep(0.74, 0.99, r.x);",
    "  ink = clamp(ink + wisp * 0.32, 0.0, 1.0);",
    "  float guard = mix(0.12, 1.0, smoothstep(0.02, 0.52, uv.x));",
    "  ink *= guard;",

    "  vec2 mp = vec2(uMouse.x * uAspect, uMouse.y);",
    "  float dm = length(p - mp);",
    "  float plume = exp(-dm * dm * 34.0);",

    "  ink = clamp(ink * 0.92 + plume * 0.85 * uEnergy, 0.0, 1.0);",
    "  float red = smoothstep(0.62, 1.0, r.y) * (0.20 + plume * 1.6 * uEnergy) * guard;",
    "  float gold = smoothstep(0.55, 1.0, q.x) * 0.55 * guard;",

    "  vec3 paper = vec3(0.973, 0.957, 0.925);",
    "  vec3 inkC  = vec3(0.149, 0.122, 0.090);",
    "  vec3 redC  = vec3(0.639, 0.184, 0.129);",
    "  vec3 goldC = vec3(0.729, 0.580, 0.318);",

    "  vec3 col = paper;",
    "  col = mix(col, inkC,  ink * 0.30);",
    "  col = mix(col, goldC, gold * 0.13);",
    "  col = mix(col, redC,  red * 0.18);",

    "  col *= 1.0 - 0.04 * smoothstep(0.35, 1.0, uv.y);",
    "  col *= 1.0 - 0.045 * smoothstep(0.0, 0.35, uv.x);",
    "  fragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  var VS_LINE = [
    "#version 300 es",
    "layout(location = 0) in vec3 aVert;",
    "layout(location = 1) in vec3 iPos;",
    "layout(location = 2) in vec3 iAxis;",
    "layout(location = 3) in vec3 iSeed;",
    "layout(location = 4) in vec2 iStyle;",
    "uniform float uTime;",
    "uniform float uAspect;",
    "out float vA;",
    "out float vHue;",
    "void main(){",
    "  float ph = iSeed.x, sp = iSeed.y, sc = iSeed.z;",
    "  float a = uTime * sp + ph;",
    "  vec3 ax = normalize(iAxis);",
    "  vec3 v = aVert * sc;",
    "  float c = cos(a), s = sin(a);",
    "  v = v * c + cross(ax, v) * s + ax * dot(ax, v) * (1.0 - c);",
    "  vec3 p = v + vec3(iPos.x * uAspect, iPos.y, iPos.z);",
    "  p.y += sin(uTime * 0.42 + ph) * 0.055;",
    "  p.x += cos(uTime * 0.31 + ph * 1.7) * 0.035;",
    "  float persp = 1.0 / (1.0 - p.z * 0.55);",
    "  vec2 xy = vec2(p.x / uAspect, p.y) * persp;",
    "  gl_Position = vec4(xy, 0.0, 1.0);",
    "  vA = iStyle.x;",
    "  vHue = iStyle.y;",
    "}"
  ].join("\n");

  var FS_LINE = [
    "#version 300 es",
    "precision mediump float;",
    "in float vA;",
    "in float vHue;",
    "out vec4 o;",
    "void main(){",
    "  vec3 ink = vec3(0.16, 0.13, 0.09);",
    "  vec3 acc = vec3(0.62, 0.19, 0.13);",
    "  o = vec4(mix(ink, acc, vHue), vA);",
    "}"
  ].join("\n");

  var VS_POINT = [
    "#version 300 es",
    "layout(location = 0) in vec2 aPos;",
    "layout(location = 1) in float aSize;",
    "layout(location = 2) in float aAlpha;",
    "layout(location = 3) in float aHue;",
    "uniform vec2 uRes;",
    "uniform float uScale;",
    "out float vA;",
    "out float vHue;",
    "void main(){",
    "  vec2 clip = aPos / uRes * 2.0 - 1.0;",
    "  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);",
    "  gl_PointSize = aSize * uScale;",
    "  vA = aAlpha;",
    "  vHue = aHue;",
    "}"
  ].join("\n");

  var FS_POINT = [
    "#version 300 es",
    "precision mediump float;",
    "in float vA;",
    "in float vHue;",
    "out vec4 o;",
    "uniform float uAdd;",
    "void main(){",
    "  vec2 d = gl_PointCoord - 0.5;",
    "  float r = length(d) * 2.0;",
    "  float a = smoothstep(1.0, 0.0, r);",
    "  a = pow(a, 2.4);",
    "  vec3 col = mix(vec3(0.60, 0.16, 0.11), vec3(0.78, 0.58, 0.26), vHue);",
    "  vec4 normal = vec4(col, a * vA);",
    "  vec4 premul = vec4(col * a * vA, 1.0);",
    "  o = mix(normal, premul, uAdd);",
    "}"
  ].join("\n");

  var FS_BLUR = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "out vec4 o;",
    "uniform sampler2D uTex;",
    "uniform vec2 uDir;",
    "void main(){",
    "  vec3 c = texture(uTex, vUv).rgb * 0.24;",
    "  c += texture(uTex, vUv + uDir * 1.3846).rgb * 0.28;",
    "  c += texture(uTex, vUv - uDir * 1.3846).rgb * 0.28;",
    "  c += texture(uTex, vUv + uDir * 3.2308).rgb * 0.10;",
    "  c += texture(uTex, vUv - uDir * 3.2308).rgb * 0.10;",
    "  o = vec4(c, 1.0);",
    "}"
  ].join("\n");

  var FS_COMPOSITE = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 vUv;",
    "out vec4 o;",
    "uniform sampler2D uScene;",
    "uniform sampler2D uBloom;",
    "uniform float uBloomStrength;",
    "uniform float uTime;",
    "uniform float uAspect;",
    "float hash21(vec2 p){",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",
    "void main(){",
    "  vec2 uv = vUv;",
    "  vec3 c = texture(uScene, uv).rgb;",
    "  vec3 bloom = texture(uBloom, uv).rgb;",
    "  c = max(c - bloom * uBloomStrength, 0.0);",
    "  float g = hash21(gl_FragCoord.xy + fract(uTime) * 137.0);",
    "  c += (g - 0.5) * 0.018;",
    "  vec2 vp = (uv - 0.5) * vec2(uAspect * 0.82, 1.0);",
    "  float vig = smoothstep(1.2, 0.3, length(vp) * 1.3);",
    "  c *= mix(0.97, 1.0, vig);",
    "  o = vec4(c, 1.0);",
    "}"
  ].join("\n");

  /* ---------------------------------------------------------
     工具
     --------------------------------------------------------- */
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("[fx] shader error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function createProgram(vsSrc, fsSrc) {
    var vs = compile(gl.VERTEX_SHADER, vsSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error("[fx] link error:", gl.getProgramInfoLog(p));
      return null;
    }
    return { id: p, locs: Object.create(null) };
  }

  function loc(prog, name) {
    if (!(name in prog.locs)) prog.locs[name] = gl.getUniformLocation(prog.id, name);
    return prog.locs[name];
  }

  function use(prog) { gl.useProgram(prog.id); }

  function makeBuffer(data, usage) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
    return b;
  }

  function makeTarget(w, h) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex: tex, fbo: fbo, w: w, h: h, ok: ok };
  }

  function freeTarget(t) {
    if (!t) return;
    gl.deleteTexture(t.tex);
    gl.deleteFramebuffer(t.fbo);
  }

  var progInk = createProgram(VS_QUAD, FS_INK);
  var progLine = createProgram(VS_LINE, FS_LINE);
  var progPoint = createProgram(VS_POINT, FS_POINT);
  var progBlur = createProgram(VS_QUAD, FS_BLUR);
  var progComp = createProgram(VS_QUAD, FS_COMPOSITE);

  if (!progInk || !progLine || !progPoint || !progBlur || !progComp) {
    docEl.classList.add("no-gl");
    return;
  }

  /* 全屏三角形 */
  var quadVAO = gl.createVertexArray();
  gl.bindVertexArray(quadVAO);
  gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(new Float32Array([-1, -1, 3, -1, -1, 3])));
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  /* ---------------------------------------------------------
     线框几何
     --------------------------------------------------------- */
  function flattenEdges(verts, edges, scale) {
    var out = new Float32Array(edges.length * 6);
    var k = 0;
    edges.forEach(function (pair) {
      [pair[0], pair[1]].forEach(function (vi) {
        out[k++] = verts[vi][0] * scale;
        out[k++] = verts[vi][1] * scale;
        out[k++] = verts[vi][2] * scale;
      });
    });
    return out;
  }

  var CUBE_VERTS = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];
  var CUBE_EDGES = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  var OCT_VERTS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  var OCT_EDGES = [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 4], [4, 3], [3, 5], [5, 2]
  ];

  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rnd = mulberry32(20261021);

  function buildInstances(count) {
    var data = new Float32Array(count * 11);
    for (var i = 0; i < count; i++) {
      var o = i * 11;
      data[o] = (rnd() * 2 - 1) * 1.32;
      data[o + 1] = (rnd() * 2 - 1) * 0.86;
      data[o + 2] = (rnd() * 2 - 1) * 0.5;

      var ax = rnd() * 2 - 1, ay = rnd() * 2 - 1, az = rnd() * 2 - 1;
      var len = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
      data[o + 3] = ax / len;
      data[o + 4] = ay / len;
      data[o + 5] = az / len;

      data[o + 6] = rnd() * Math.PI * 2;
      data[o + 7] = 0.12 + rnd() * 0.24;
      data[o + 8] = 0.10 + rnd() * 0.15;

      data[o + 9] = 0.14 + rnd() * 0.2;
      data[o + 10] = rnd() * 0.85;
    }
    return data;
  }

  function makeLineVAO(vertices, instances) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(vertices));
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(instances));
    var stride = 11 * 4;
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 12);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, stride, 24);
    gl.vertexAttribDivisor(3, 1);
    gl.enableVertexAttribArray(4);
    gl.vertexAttribPointer(4, 2, gl.FLOAT, false, stride, 36);
    gl.vertexAttribDivisor(4, 1);

    gl.bindVertexArray(null);
    return { vao: vao, count: vertices.length / 3, instances: instances.length / 11 };
  }

  var octVAO = makeLineVAO(flattenEdges(OCT_VERTS, OCT_EDGES, 0.62), buildInstances(8));
  var cubeVAO = makeLineVAO(flattenEdges(CUBE_VERTS, CUBE_EDGES, 0.46), buildInstances(6));

  /* ---------------------------------------------------------
     粒子
     --------------------------------------------------------- */
  var P_COUNT = 76;
  var pPos = new Float32Array(P_COUNT * 2);
  var pSize = new Float32Array(P_COUNT);
  var pAlpha = new Float32Array(P_COUNT);
  var pHue = new Float32Array(P_COUNT);
  var parts = [];
  var vw = window.innerWidth || 1280;
  var vh = window.innerHeight || 800;

  for (var i = 0; i < P_COUNT; i++) {
    var layer = i / P_COUNT;
    var size = 3 + Math.pow(Math.random(), 2) * 13;
    parts.push({
      x: vw * 0.5 + (Math.random() - 0.5) * 240,
      y: vh * 0.5 + (Math.random() - 0.5) * 240,
      vx: 0,
      vy: 0,
      k: 0.012 + (1 - layer) * 0.05,
      orbit: Math.random() * Math.PI * 2,
      radius: 14 + Math.random() * 130,
      spin: 0.22 + Math.random() * 0.9,
      alpha: 0.55 + Math.random() * 0.45
    });
    pSize[i] = size;
    pHue[i] = Math.random();
    pAlpha[i] = 0;
  }

  var pointVAO = gl.createVertexArray();
  gl.bindVertexArray(pointVAO);
  var posBuf = makeBuffer(pPos, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(pSize));
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

  var alphaBuf = makeBuffer(pAlpha, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, makeBuffer(pHue));
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  /* ---------------------------------------------------------
     尺寸 / 目标
     --------------------------------------------------------- */
  var quality = { scale: 0.8, maxDpr: 1.5, blurIters: 3 };
  var scene = null, glowA = null, glowB = null;
  var sizeW = 1, sizeH = 1, scaleFactor = 1;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    vw = Math.max(1, window.innerWidth);
    vh = Math.max(1, window.innerHeight);

    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = vw + "px";
    canvas.style.height = vh + "px";

    scaleFactor = dpr;
    sizeW = Math.max(1, Math.round(canvas.width * quality.scale));
    sizeH = Math.max(1, Math.round(canvas.height * quality.scale));

    freeTarget(scene); freeTarget(glowA); freeTarget(glowB);
    scene = makeTarget(sizeW, sizeH);
    glowA = makeTarget(Math.max(1, sizeW >> 1), Math.max(1, sizeH >> 1));
    glowB = makeTarget(Math.max(1, sizeW >> 1), Math.max(1, sizeH >> 1));
  }

  /* ---------------------------------------------------------
     鼠标
     --------------------------------------------------------- */
  var mouse = { x: vw * 0.5, y: vh * 0.5 };
  var target = { x: vw * 0.5, y: vh * 0.5 };
  var energy = 0;
  var lastMove = 0;

  function onPointer(e) {
    target.x = e.clientX;
    target.y = e.clientY;
    lastMove = performance.now();
    energy = Math.min(1, energy + 0.4);
  }

  if (!reduce) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
  }

  /* ---------------------------------------------------------
     绘制
     --------------------------------------------------------- */
  function drawBackground(time) {
    use(progInk);
    gl.uniform2f(loc(progInk, "uRes"), sizeW, sizeH);
    gl.uniform1f(loc(progInk, "uTime"), time);
    gl.uniform2f(loc(progInk, "uMouse"), mouse.x / vw, 1 - mouse.y / vh);
    gl.uniform1f(loc(progInk, "uAspect"), vw / vh);
    gl.uniform1f(loc(progInk, "uEnergy"), 0.18 + energy * 0.82);
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  function drawLines(time) {
    use(progLine);
    gl.uniform1f(loc(progLine, "uTime"), time);
    gl.uniform1f(loc(progLine, "uAspect"), vw / vh);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindVertexArray(octVAO.vao);
    gl.drawArraysInstanced(gl.LINES, 0, octVAO.count, octVAO.instances);

    gl.bindVertexArray(cubeVAO.vao);
    gl.drawArraysInstanced(gl.LINES, 0, cubeVAO.count, cubeVAO.instances);

    gl.bindVertexArray(null);
  }

  function drawPoints(scale, add) {
    use(progPoint);
    gl.uniform2f(loc(progPoint, "uRes"), vw, vh);
    gl.uniform1f(loc(progPoint, "uScale"), scale);
    gl.uniform1f(loc(progPoint, "uAdd"), add ? 1 : 0);
    gl.enable(gl.BLEND);
    if (add) gl.blendFunc(gl.ONE, gl.ONE);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(pointVAO);
    gl.drawArrays(gl.POINTS, 0, P_COUNT);
    gl.bindVertexArray(null);
  }

  function blurPass(src, dst, dx, dy) {
    use(progBlur);
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, dst.w, dst.h);
    gl.disable(gl.BLEND);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(loc(progBlur, "uTex"), 0);
    gl.uniform2f(loc(progBlur, "uDir"), dx / dst.w, dy / dst.h);
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  var start = performance.now();
  var degraded = false;

  function render(now) {
    var time = (now - start) / 1000;

    mouse.x += (target.x - mouse.x) * 0.075;
    mouse.y += (target.y - mouse.y) * 0.075;
    energy *= 0.995;

    if (now - lastMove > 2600) {
      var t = time * 0.22;
      target.x = vw * (0.5 + Math.cos(t) * 0.24);
      target.y = vh * (0.46 + Math.sin(t * 1.31) * 0.2);
    }

    /* 粒子 */
    for (var i = 0; i < P_COUNT; i++) {
      var p = parts[i];
      var ang = time * p.spin + p.orbit;
      var gx = mouse.x + Math.cos(ang) * p.radius;
      var gy = mouse.y + Math.sin(ang * 0.87) * p.radius * 0.72;

      p.vx += (gx - p.x) * p.k;
      p.vy += (gy - p.y) * p.k;
      p.vx *= 0.906;
      p.vy *= 0.906;
      p.x += p.vx;
      p.y += p.vy;

      pPos[i * 2] = p.x;
      pPos[i * 2 + 1] = p.y;

      var d = Math.sqrt((p.x - mouse.x) * (p.x - mouse.x) + (p.y - mouse.y) * (p.y - mouse.y));
      var near = 1 - Math.min(1, d / 430);
      pAlpha[i] = (0.14 + near * 0.74) * p.alpha * (0.85 + energy * 0.5);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pAlpha);

    /* 场景：墨底 + 线框 + 实心粒子 */
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.fbo);
    gl.viewport(0, 0, scene.w, scene.h);
    gl.disable(gl.BLEND);
    drawBackground(time);
    drawLines(time);
    drawPoints(scaleFactor * quality.scale, false);

    /* 辉光缓冲：只放粒子，做为「墨量」 */
    gl.bindFramebuffer(gl.FRAMEBUFFER, glowA.fbo);
    gl.viewport(0, 0, glowA.w, glowA.h);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawPoints(scaleFactor * quality.scale * 0.62, true);

    /* 高斯模糊（乒乓） */
    var iters = degraded ? 2 : quality.blurIters;
    var src = glowA, dst = glowB;
    for (var k = 0; k < iters; k++) {
      var spread = 1.4 + k * 2.4;
      blurPass(src, dst, spread, 0);
      blurPass(dst, src, 0, spread);
    }

    /* 合成 */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.BLEND);
    use(progComp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scene.tex);
    gl.uniform1i(loc(progComp, "uScene"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(loc(progComp, "uBloom"), 1);
    gl.uniform1f(loc(progComp, "uBloomStrength"), 1.05);
    gl.uniform1f(loc(progComp, "uTime"), time);
    gl.uniform1f(loc(progComp, "uAspect"), vw / vh);
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  /* ---------------------------------------------------------
     循环
     --------------------------------------------------------- */
  var rafId = 0;
  var running = true;
  var prev = 0;
  var slowFrames = 0;

  function loop(now) {
    if (!running) return;
    var dt = now - prev;
    prev = now;

    if (dt > 34) {
      slowFrames++;
      if (slowFrames > 100 && !degraded) {
        degraded = true;
        quality.blurIters = 2;
        quality.scale = 0.62;
        resize();
        slowFrames = 0;
      }
    } else if (slowFrames > 0) {
      slowFrames--;
    }

    render(now);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (reduce) {
      render(performance.now() + 9000);
      return;
    }
    running = true;
    prev = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loop);
  }

  var resizeTimer = 0;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduce) render(performance.now() + 9000);
    }, 160);
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else if (!reduce) {
      running = true;
      prev = performance.now();
      rafId = requestAnimationFrame(loop);
    }
  });

  resize();
  startLoop();

  window.HistoryFX = {
    degraded: function () { return degraded; }
  };
})();
