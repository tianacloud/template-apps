(function () {
  'use strict';

  /* =========================================================
     0. 环境守卫
     ========================================================= */
  if (typeof THREE === 'undefined') {
    var boot = document.getElementById('boot');
    boot.style.display = 'flex';
    boot.innerHTML = '三维引擎加载失败。<br>请刷新页面重试；若问题持续，请检查浏览器兼容性。';
    return;
  }

  /* =========================================================
     1. 数学与工具
     ========================================================= */
  var TAU = Math.PI * 2;
  var GRAV = 9.81;
  var UP = new THREE.Vector3(0, 1, 0);

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function damp(a, b, lambda, dt) { return lerp(a, b, 1 - Math.exp(-lambda * dt)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function approach(cur, tgt, step) {
    if (cur < tgt) return Math.min(cur + step, tgt);
    return Math.max(cur - step, tgt);
  }

  /* =========================================================
     2. 渲染器 / 场景 / 相机 / 灯光
     ========================================================= */
  var canvas = document.getElementById('scene');
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas, antialias: true, powerPreference: 'high-performance', stencil: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var FOG_COLOR = 0xcfe0ec;
  scene.fog = new THREE.Fog(FOG_COLOR, 95, 520);
  scene.background = new THREE.Color(FOG_COLOR);

  var camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1400);
  camera.position.set(0, 2.4, 7.5);

  function onResize() {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  // ---- 天空穹顶（渐变着色器）
  var skyGeo = new THREE.SphereGeometry(700, 32, 20);
  var skyMat = new THREE.ShaderMaterial({
    uniforms: {
      cTop: { value: new THREE.Color('#4f9ad4') },
      cMid: { value: new THREE.Color('#b6ddf1') },
      cBot: { value: new THREE.Color('#ffe3bd') }
    },
    vertexShader: [
      'varying vec3 vP;',
      'void main(){',
      '  vP = position;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vP;',
      'uniform vec3 cTop; uniform vec3 cMid; uniform vec3 cBot;',
      'void main(){',
      '  float h = normalize(vP).y;',
      '  vec3 c = mix(cBot, cMid, smoothstep(-0.06, 0.22, h));',
      '  c = mix(c, cTop, smoothstep(0.18, 0.72, h));',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'
    ].join('\n'),
    side: THREE.BackSide,
    depthWrite: false,
    fog: false
  });
  var sky = new THREE.Mesh(skyGeo, skyMat);
  sky.frustumCulled = false;
  scene.add(sky);

  // ---- 太阳光晕（精灵）
  function radialTexture(inner, outer) {
    var s = 128, c = document.createElement('canvas');
    c.width = c.height = s;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.35, inner.replace('1)', '0.55)'));
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, s, s);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }
  var sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture('rgba(255,246,220,1)', 'rgba(255,210,140,0)'),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    opacity: 0.85, fog: false
  }));
  sunSprite.scale.set(120, 120, 1);
  scene.add(sunSprite);
  var SUN_DIR = new THREE.Vector3(-0.42, 0.30, -0.86).normalize();

  // ---- 灯光
  var hemi = new THREE.HemisphereLight(0xd6ecff, 0x8d7c58, 0.62);
  scene.add(hemi);

  var sunLight = new THREE.DirectionalLight(0xffeecb, 1.12);
  sunLight.position.set(-16, 26, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1536, 1536);
  var shCam = sunLight.shadow.camera;
  shCam.left = -16; shCam.right = 16; shCam.top = 16; shCam.bottom = -16;
  shCam.near = 1; shCam.far = 90;
  sunLight.shadow.bias = -0.0009;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  scene.add(sunLight.target);

  var rimLight = new THREE.DirectionalLight(0xa9d8ff, 0.22);
  rimLight.position.set(14, 9, -18);
  scene.add(rimLight);

  /* =========================================================
     3. 程序化贴图
     ========================================================= */
  function newCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  function roadTexture() {
    var W = 512, H = 512, c = newCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#343941';
    g.fillRect(0, 0, W, H);
    // 沥青颗粒
    for (var i = 0; i < 16000; i++) {
      var v = 38 + Math.random() * 66;
      g.fillStyle = 'rgba(' + (v | 0) + ',' + ((v + 4) | 0) + ',' + ((v + 10) | 0) + ',' + (0.05 + Math.random() * 0.22).toFixed(2) + ')';
      var s = Math.random() * 2.4 + 0.5;
      g.fillRect(Math.random() * W, Math.random() * H, s, s);
    }
    // 补丁
    for (var k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(26,30,36,' + (0.07 + Math.random() * 0.08).toFixed(2) + ')';
      g.beginPath();
      g.ellipse(Math.random() * W, Math.random() * H, 24 + Math.random() * 46, 10 + Math.random() * 26, Math.random() * 3, 0, TAU);
      g.fill();
    }
    // 边线（该贴图 1 个 U 对应 11m 路宽，1 个 V 对应 5.5m 路长）
    g.fillStyle = 'rgba(232,228,214,.78)';
    g.fillRect(W * 0.045, 0, W * 0.012, H);
    g.fillRect(W * 0.943, 0, W * 0.012, H);
    // 中央虚线：3m 线 + 2.5m 空（V=5.5m）
    g.fillStyle = 'rgba(238,234,220,.86)';
    g.fillRect(W * 0.497, H * 0.02, W * 0.007, H * 0.545);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function noiseTexture(base, spread, dots, alpha) {
    var S = 256, c = newCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, S, S);
    for (var i = 0; i < dots; i++) {
      var v = Math.random() * 90 - 45;
      var r = Math.min(255, Math.max(0, 128 + v)) | 0;
      g.fillStyle = 'rgba(' + r + ',' + r + ',' + r + ',' + (Math.random() * alpha).toFixed(2) + ')';
      var s = Math.random() * 3 + 0.6;
      g.fillRect(Math.random() * S, Math.random() * S, s, s);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function textTexture(text, opt) {
    opt = opt || {};
    var W = opt.w || 512, H = opt.h || 128, c = newCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = opt.bg || '#14625f';
    g.fillRect(0, 0, W, H);
    if (opt.stripe) {
      g.fillStyle = 'rgba(255,255,255,.10)';
      for (var i = -H; i < W; i += 44) {
        g.save();
        g.translate(i, 0);
        g.rotate(-0.28);
        g.fillRect(0, -H, 20, H * 3);
        g.restore();
      }
    }
    g.strokeStyle = 'rgba(255,255,255,.5)';
    g.lineWidth = 6;
    g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = opt.fg || '#ffffff';
    g.font = '700 ' + (opt.size || 62) + 'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, W / 2, H / 2 + 2);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  function crateTexture() {
    var S = 128, c = newCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = '#c79c63';
    g.fillRect(0, 0, S, S);
    for (var i = 0; i < 900; i++) {
      g.fillStyle = 'rgba(150,110,64,' + (Math.random() * 0.25).toFixed(2) + ')';
      g.fillRect(Math.random() * S, Math.random() * S, Math.random() * 8 + 2, 1.4);
    }
    g.fillStyle = '#e6dcc2';
    g.fillRect(0, S * 0.40, S, S * 0.16);        // 封箱胶带
    g.fillStyle = 'rgba(60,44,28,.55)';
    g.fillRect(S * 0.62, S * 0.62, S * 0.26, S * 0.20);  // 面单
    g.fillStyle = 'rgba(255,255,255,.75)';
    g.fillRect(S * 0.65, S * 0.66, S * 0.20, 2);
    g.fillRect(S * 0.65, S * 0.71, S * 0.14, 2);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* =========================================================
     4. 地形（周期性高程，保证无缝循环）
     ========================================================= */
  var PERIOD = 2000;                    // 高程重复周期（米）
  var P1 = 200, P2 = 80, A1 = 1.1, A2 = 0.25, PH2 = 1.7;

  // 路面高程：y = A1 sin(2πz/P1) + A2 sin(2πz/P2 + φ)
  function elev(z) {
    return A1 * Math.sin(TAU * z / P1) + A2 * Math.sin(TAU * z / P2 + PH2);
  }
  // dY/dz
  function elevSlopeZ(z) {
    return A1 * (TAU / P1) * Math.cos(TAU * z / P1) + A2 * (TAU / P2) * Math.cos(TAU * z / P2 + PH2);
  }
  // 前进方向(-Z)的坡度：上坡为正
  function gradeAt(z) { return -elevSlopeZ(z); }
  // 车头俯仰（抬头为正）
  function pitchAt(z) { return Math.atan(gradeAt(z)); }

  // 任意横向位置的落地高度（与路面/沙滩/草坡的建模保持完全一致）
  function groundY(x, z) {
    var y = elev(z);
    if (x < -5.5) {
      var t = clamp((-5.5 - x) / 58, 0, 1);
      return y + Math.pow(t, 1.25) * 7.5;
    }
    if (x > 5.5) {
      var t2 = clamp((x - 5.5) / 9.5, 0, 1);
      return y - Math.pow(t2, 1.35) * 3.6;
    }
    return y;
  }

  /* =========================================================
     5. 地面 / 隔离带 / 海
     ========================================================= */
  var Z_HEAD = 140, Z_TAIL = -4260, SEGS = 440;

  function buildStrip(x0, x1, mat, uRep, vRep, yFn) {
    var n = SEGS + 1;
    var pos = new Float32Array(n * 2 * 3);
    var uvs = new Float32Array(n * 2 * 2);
    var idx = [];
    var dz = (Z_TAIL - Z_HEAD) / SEGS;

    for (var i = 0; i < n; i++) {
      var z = Z_HEAD + dz * i;
      var y0 = yFn(x0, z), y1 = yFn(x1, z);
      var o6 = i * 6, o4 = i * 4;
      pos[o6] = x0; pos[o6 + 1] = y0; pos[o6 + 2] = z;
      pos[o6 + 3] = x1; pos[o6 + 4] = y1; pos[o6 + 5] = z;
      uvs[o4] = 0; uvs[o4 + 1] = z / vRep;
      uvs[o4 + 2] = uRep; uvs[o4 + 3] = z / vRep;
    }
    for (var s = 0; s < SEGS; s++) {
      var a = s * 2, b = s * 2 + 1, c2 = s * 2 + 2, d = s * 2 + 3;
      idx.push(a, b, c2, b, d, c2);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    m.frustumCulled = false;
    return m;
  }

  // 路面
  var roadMat = new THREE.MeshStandardMaterial({
    map: roadTexture(), roughness: 0.94, metalness: 0.02, color: 0xffffff
  });
  var road = buildStrip(-5.5, 5.5, roadMat, 1, 5.5, function (x, z) { return elev(z); });
  scene.add(road);

  // 沙滩（向海侧下沉）
  var sandMat = new THREE.MeshStandardMaterial({
    map: noiseTexture('#e2cda0', 40, 3000, 0.35), roughness: 1, metalness: 0, color: 0xffffff
  });
  var beach = buildStrip(5.5, 15, sandMat, 2, 14, function (x, z) {
    var t = clamp((x - 5.5) / 9.5, 0, 1);
    return elev(z) - Math.pow(t, 1.35) * 3.6;
  });
  scene.add(beach);

  // 左侧草坡
  var grassMat = new THREE.MeshStandardMaterial({
    map: noiseTexture('#8ea56a', 40, 3000, 0.45), roughness: 1, metalness: 0, color: 0xffffff
  });
  var grass = buildStrip(-64, -5.5, grassMat, 12, 14, function (x, z) {
    var t = clamp((-5.5 - x) / 58, 0, 1);
    return elev(z) + Math.pow(t, 1.25) * 7.5;
  });
  scene.add(grass);

  // 海面
  var seaTex = noiseTexture('#2b7f92', 30, 1200, 0.30);
  seaTex.repeat.set(26, 300);
  var seaMat = new THREE.MeshStandardMaterial({
    map: seaTex, color: 0x2f8fa4, roughness: 0.54, metalness: 0.12
  });
  var seaGeo = new THREE.PlaneGeometry(700, 5000, 1, 1);
  var sea = new THREE.Mesh(seaGeo, seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(360, -3.9, -2000);
  sea.receiveShadow = false;
  scene.add(sea);

  // 岸边浪花带（贴着水陆交界，随时间推移）
  var foamTex = noiseTexture('#ffffff', 20, 900, 0.5);
  foamTex.repeat.set(2, 90);
  var foamMat = new THREE.MeshBasicMaterial({
    map: foamTex, transparent: true, opacity: 0.42, depthWrite: false, color: 0xf2fbff
  });
  var foam = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 5000), foamMat);
  foam.rotation.x = -Math.PI / 2;
  foam.position.set(12.6, -3.35, -2000);
  scene.add(foam);

  // 远山
  var mountainMat = new THREE.MeshStandardMaterial({ color: 0x6d8ba3, roughness: 1, flatShading: true });
  var mountains = new THREE.Group();
  for (var mi = 0; mi < 9; mi++) {
    var hgt = rand(40, 95);
    var mg = new THREE.Mesh(new THREE.ConeGeometry(rand(34, 70), hgt, 5, 1), mountainMat);
    mg.position.set(rand(-260, -110), hgt * 0.42, rand(-420, 60));
    mg.rotation.y = rand(0, TAU);
    mountains.add(mg);
  }
  scene.add(mountains);

  /* =========================================================
     6. 材质库
     ========================================================= */
  var M = {
    frame:   new THREE.MeshStandardMaterial({ color: 0x1f7a8c, roughness: 0.38, metalness: 0.45 }),
    frameDk: new THREE.MeshStandardMaterial({ color: 0x17606f, roughness: 0.45, metalness: 0.4 }),
    chrome:  new THREE.MeshStandardMaterial({ color: 0xdbe4ea, roughness: 0.28, metalness: 0.55 }),
    rubber:  new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.92, metalness: 0.0 }),
    seat:    new THREE.MeshStandardMaterial({ color: 0x4a3123, roughness: 0.72 }),
    feather: new THREE.MeshStandardMaterial({ color: 0xfaf7ee, roughness: 0.82 }),
    feather2:new THREE.MeshStandardMaterial({ color: 0xdad0bc, roughness: 0.86 }),
    beak:    new THREE.MeshStandardMaterial({ color: 0xf6a63c, roughness: 0.52 }),
    pouch:   new THREE.MeshStandardMaterial({ color: 0xf9cb8b, roughness: 0.68 }),
    eye:     new THREE.MeshStandardMaterial({ color: 0x191d22, roughness: 0.3 }),
    eyeRing: new THREE.MeshStandardMaterial({ color: 0xffd98a, roughness: 0.6 }),
    red:     new THREE.MeshStandardMaterial({ color: 0xd6412c, roughness: 0.55 }),
    scarf2:  new THREE.MeshStandardMaterial({ color: 0xb8361f, roughness: 0.62 }),
    dark:    new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.65 }),
    crate:   new THREE.MeshStandardMaterial({ map: crateTexture(), roughness: 0.88 }),
    tape:    new THREE.MeshStandardMaterial({ color: 0xe9dfc6, roughness: 0.8 }),
    metal:   new THREE.MeshStandardMaterial({ color: 0xb6c0c7, roughness: 0.42, metalness: 0.40 }),
    coneOr:  new THREE.MeshStandardMaterial({ color: 0xff6a1f, roughness: 0.6 }),
    coneWh:  new THREE.MeshStandardMaterial({ color: 0xf2f0e8, roughness: 0.7 }),
    puddle:  new THREE.MeshStandardMaterial({ color: 0x33566b, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.82 }),
    fish:    new THREE.MeshStandardMaterial({ color: 0x9fd6e8, roughness: 0.25, metalness: 0.78 }),
    crab:    new THREE.MeshStandardMaterial({ color: 0xe0573c, roughness: 0.6 }),
    wood:    new THREE.MeshStandardMaterial({ color: 0x8a6b4a, roughness: 0.9 }),
    leaf:    new THREE.MeshStandardMaterial({ color: 0x3f7a4a, roughness: 0.95, flatShading: true }),
    leaf2:   new THREE.MeshStandardMaterial({ color: 0x4f8f52, roughness: 0.95, flatShading: true }),
    rock:    new THREE.MeshStandardMaterial({ color: 0x8b8d8e, roughness: 1, flatShading: true }),
    lamp:    new THREE.MeshStandardMaterial({ color: 0x59636b, roughness: 0.5, metalness: 0.7 }),
    glow:    new THREE.MeshBasicMaterial({ color: 0xfff0c8 })
  };

  /* =========================================================
     7. 几何辅助
     ========================================================= */
  function cylinder(rTop, rBot, h, mat, seg) {
    return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg || 10), mat);
  }
  function tube(a, b, r, mat, seg) {
    var d = new THREE.Vector3().subVectors(b, a);
    var len = d.length();
    if (len < 1e-5) len = 1e-5;
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg || 8), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    return m;
  }
  function box(w, h, d, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }
  // 由 a 指向 b 的椭球（用来做翅膀这类扁长体）
  function blob(a, b, rx, rz, mat) {
    var d = new THREE.Vector3().subVectors(b, a);
    var len = d.length();
    if (len < 1e-5) len = 1e-5;
    var m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    m.scale.set(rx, len * 0.56, rz);
    return m;
  }
  function shadowOn(obj, cast, receive) {
    obj.traverse(function (o) {
      if (o.isMesh) { o.castShadow = cast !== false; o.receiveShadow = !!receive; }
    });
    return obj;
  }

  /* =========================================================
     8. 自行车 + 鹈鹕（全部以「前进 = -Z」建模）
     ========================================================= */
  var WR = 0.31;          // 车轮半径 m
  var WB = 1.02;          // 轴距 m
  var GEAR = 4.2;         // 齿比（轮转 / 曲柄转）
  var CRANK_R = 0.165;    // 曲柄长 m
  var BB = new THREE.Vector3(0, 0.285, 0.09);   // 中轴

  var bike = new THREE.Group();
  scene.add(bike);

  // ---- 车轮
  function buildWheel() {
    var pivot = new THREE.Group();
    pivot.rotation.y = Math.PI / 2;     // 轮轴 → 世界 X
    var spin = new THREE.Group();

    var tire = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.028, 0.028, 8, 30), M.rubber);
    spin.add(tire);

    var rim = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.062, 0.013, 6, 30), M.chrome);
    spin.add(rim);

    var hub = cylinder(0.036, 0.036, 0.10, M.chrome, 10);
    hub.rotation.x = Math.PI / 2;
    spin.add(hub);

    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * TAU;
      var spoke = cylinder(0.0055, 0.0055, (WR - 0.075) * 2, M.chrome, 5);
      spoke.position.set(Math.cos(a) * 0, Math.sin(a) * 0, 0);
      // 用旋转 + 位移构造辐条
      spoke.position.set(0, 0, 0);
      spoke.rotation.z = a - Math.PI / 2;
      spoke.scale.y = 1;
      spoke.geometry.translate(0, 0, 0);
      spin.add(spoke);
    }

    pivot.add(spin);
    pivot.userData.spin = spin;
    return pivot;
  }
  var wheelRear = buildWheel();
  var wheelFront = buildWheel();
  wheelRear.position.set(0, WR, 0.52);
  bike.add(wheelRear);

  // ---- 车架
  var seatTop = new THREE.Vector3(0, 0.72, 0.33);
  var headBot = new THREE.Vector3(0, 0.665, -0.40);
  var headTop = new THREE.Vector3(0, 0.865, -0.445);
  var rearAxle = new THREE.Vector3(0, WR, 0.52);
  var frontAxle = new THREE.Vector3(0, WR, -0.50);

  var frameGroup = new THREE.Group();
  frameGroup.add(tube(BB, seatTop, 0.026, M.frame));
  frameGroup.add(tube(seatTop, headBot, 0.024, M.frame));          // 上管
  frameGroup.add(tube(BB, headBot, 0.028, M.frameDk));             // 下管
  frameGroup.add(tube(headBot, headTop, 0.028, M.frameDk));        // 头管
  frameGroup.add(tube(seatTop, rearAxle, 0.019, M.frame));         // 后上叉
  frameGroup.add(tube(BB, rearAxle, 0.022, M.frameDk));            // 后下叉
  frameGroup.add(tube(new THREE.Vector3(0.052, 0.30, 0.10), new THREE.Vector3(0.052, WR, 0.515), 0.014, M.frame));
  frameGroup.add(tube(new THREE.Vector3(-0.052, 0.30, 0.10), new THREE.Vector3(-0.052, WR, 0.515), 0.014, M.frame));
  // 座杆 + 车座
  frameGroup.add(tube(seatTop, new THREE.Vector3(0, 0.795, 0.335), 0.017, M.chrome));
  var saddle = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), M.seat);
  saddle.scale.set(0.62, 0.30, 1.55);
  saddle.position.set(0, 0.80, 0.32);
  frameGroup.add(saddle);
  // 后货架
  var rack = box(0.24, 0.018, 0.32, M.metal);
  rack.position.set(0, 0.615, 0.50);
  frameGroup.add(rack);
  frameGroup.add(tube(new THREE.Vector3(0.10, 0.615, 0.40), new THREE.Vector3(0.10, WR, 0.52), 0.011, M.metal));
  frameGroup.add(tube(new THREE.Vector3(-0.10, 0.615, 0.40), new THREE.Vector3(-0.10, WR, 0.52), 0.011, M.metal));
  // 牙盘 + 链条
  var chainring = new THREE.Mesh(new THREE.TorusGeometry(0.083, 0.008, 6, 22), M.chrome);
  chainring.rotation.y = Math.PI / 2;
  chainring.position.copy(BB).add(new THREE.Vector3(0.075, 0, 0));
  frameGroup.add(chainring);
  var cog = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.007, 6, 14), M.metal);
  cog.rotation.y = Math.PI / 2;
  cog.position.set(0.055, WR, 0.52);
  frameGroup.add(cog);
  frameGroup.add(tube(new THREE.Vector3(0.075, BB.y + 0.083, BB.z), new THREE.Vector3(0.055, WR + 0.031, 0.52), 0.007, M.dark, 6));
  frameGroup.add(tube(new THREE.Vector3(0.075, BB.y - 0.083, BB.z), new THREE.Vector3(0.055, WR - 0.031, 0.52), 0.007, M.dark, 6));

  bike.add(frameGroup);

  // ---- 前叉总成（随转向摆动）
  var steerPivot = new THREE.Vector3(0, 0.72, -0.415);
  var steerGroup = new THREE.Group();
  steerGroup.position.copy(steerPivot);
  bike.add(steerGroup);

  // 前轮挂到前叉上（随转向摆动）
  wheelFront.position.set(0, WR - steerPivot.y, -0.50 - steerPivot.z);
  steerGroup.add(wheelFront);

  var headLocal = headBot.clone().sub(steerPivot);
  var axleLocal = frontAxle.clone().sub(steerPivot);
  steerGroup.add(tube(headLocal, axleLocal.clone().add(new THREE.Vector3(0.055, 0, 0)), 0.017, M.frame));
  steerGroup.add(tube(headLocal, axleLocal.clone().add(new THREE.Vector3(-0.055, 0, 0)), 0.017, M.frame));
  // 把立与车把
  steerGroup.add(tube(new THREE.Vector3(0, 0.145, -0.03), new THREE.Vector3(0, 0.245, 0.005), 0.017, M.chrome));
  var barCenter = new THREE.Vector3(0, 0.25, 0.005);
  var bar = cylinder(0.014, 0.014, 0.54, M.chrome, 8);
  bar.rotation.z = Math.PI / 2;
  bar.position.copy(barCenter);
  steerGroup.add(bar);
  var gripL = box(0.10, 0.034, 0.034, M.dark);
  gripL.position.set(-0.245, 0.25, 0.005);
  var gripR = box(0.10, 0.034, 0.034, M.dark);
  gripR.position.set(0.245, 0.25, 0.005);
  steerGroup.add(gripL); steerGroup.add(gripR);
  // 车铃
  var bell = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8, 0, TAU, 0, Math.PI / 2), M.chrome);
  bell.position.set(-0.15, 0.262, 0.01);
  steerGroup.add(bell);

  // 车头货筐（挂在车把下方，随车把转动）
  var basket = new THREE.Group();
  basket.position.set(0, 0.055, -0.22);
  steerGroup.add(basket);
  var basketBody = new THREE.MeshStandardMaterial({ color: 0xcbb894, roughness: 0.85 });
  // 浅口货盘：底板 + 四面矮板，箱子放进去能露出来，也不会把车把包住
  var bFloor = box(0.38, 0.016, 0.28, basketBody);
  bFloor.position.set(0, 0.008, 0);
  basket.add(bFloor);
  var bWallF = box(0.38, 0.10, 0.012, basketBody);
  bWallF.position.set(0, 0.058, -0.134);
  basket.add(bWallF);
  var bWallB = box(0.38, 0.10, 0.012, basketBody);
  bWallB.position.set(0, 0.058, 0.134);
  basket.add(bWallB);
  var bWallL = box(0.012, 0.10, 0.28, basketBody);
  bWallL.position.set(-0.184, 0.058, 0);
  basket.add(bWallL);
  var bWallR = box(0.012, 0.10, 0.28, basketBody);
  bWallR.position.set(0.184, 0.058, 0);
  basket.add(bWallR);
  basket.add(tube(new THREE.Vector3(-0.19, 0.108, -0.14), new THREE.Vector3(0.19, 0.108, -0.14), 0.008, M.chrome, 6));
  basket.add(tube(new THREE.Vector3(-0.19, 0.108, 0.14), new THREE.Vector3(0.19, 0.108, 0.14), 0.008, M.chrome, 6));
  basket.add(tube(new THREE.Vector3(-0.19, 0.108, -0.14), new THREE.Vector3(-0.19, 0.108, 0.14), 0.008, M.chrome, 6));
  basket.add(tube(new THREE.Vector3(0.19, 0.108, -0.14), new THREE.Vector3(0.19, 0.108, 0.14), 0.008, M.chrome, 6));
  // 货筐支撑杆（接到前轮轴）
  basket.add(tube(new THREE.Vector3(-0.14, 0.005, -0.02), new THREE.Vector3(-0.055, -0.465, 0.135), 0.010, M.chrome, 6));
  basket.add(tube(new THREE.Vector3(0.14, 0.005, -0.02), new THREE.Vector3(0.055, -0.465, 0.135), 0.010, M.chrome, 6));

  // 车灯（装在货筐前面）
  var headLamp = cylinder(0.036, 0.042, 0.05, M.chrome, 10);
  headLamp.rotation.x = Math.PI / 2;
  headLamp.position.set(0, 0.17, -0.395);
  steerGroup.add(headLamp);
  var lampGlass = new THREE.Mesh(new THREE.CircleGeometry(0.033, 12), M.glow);
  lampGlass.position.set(0, 0.17, -0.422);
  lampGlass.rotation.y = Math.PI;
  steerGroup.add(lampGlass);

  // ---- 曲柄（几何按 a=0 时朝下建模）
  var crankGroup = new THREE.Group();
  crankGroup.position.copy(BB);
  bike.add(crankGroup);
  var armR = box(0.022, CRANK_R, 0.032, M.chrome);
  armR.position.set(0.075, -CRANK_R / 2, 0);
  crankGroup.add(armR);
  var armL = box(0.022, CRANK_R, 0.032, M.chrome);
  armL.position.set(-0.075, CRANK_R / 2, 0);
  crankGroup.add(armL);

  // 踏板（每帧手动定位，保持水平）
  var pedalR = box(0.095, 0.018, 0.135, M.dark);
  var pedalL = box(0.095, 0.018, 0.135, M.dark);
  bike.add(pedalR); bike.add(pedalL);

  // ---- 鹈鹕
  var rider = new THREE.Group();
  bike.add(rider);

  // 躯干（纺锤形，坐姿前倾，稳稳落在车座上）
  var torso = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16), M.feather);
  torso.scale.set(0.200, 0.235, 0.300);
  torso.position.set(0, 1.000, 0.255);
  torso.rotation.x = -0.26;
  rider.add(torso);

  // 胸腹
  var belly = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), M.feather2);
  belly.scale.set(0.175, 0.170, 0.245);
  belly.position.set(0, 0.925, 0.285);
  belly.rotation.x = -0.26;
  rider.add(belly);

  // 尾羽
  for (var ti = 0; ti < 3; ti++) {
    var tail = box(0.050, 0.020, 0.215, M.feather2);
    tail.position.set((ti - 1) * 0.055, 0.965 - Math.abs(ti - 1) * 0.012, 0.545);
    tail.rotation.x = 0.30;
    tail.rotation.z = (ti - 1) * 0.16;
    rider.add(tail);
  }

  // 脖子（S 形曲线管）
  var neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.070, 0.100),
    new THREE.Vector3(0, 1.175, 0.010),
    new THREE.Vector3(0, 1.300, -0.048),
    new THREE.Vector3(0, 1.410, -0.058),
    new THREE.Vector3(0, 1.470, -0.048)
  ]);
  var neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 24, 0.072, 10, false), M.feather);
  rider.add(neck);

  // 头
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 14), M.feather);
  head.position.set(0, 1.505, -0.060);
  head.scale.set(1, 0.93, 1.05);
  rider.add(head);

  // 眼睛
  var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), M.eye);
  eyeL.position.set(-0.104, 1.540, -0.132);
  var eyeR = eyeL.clone(); eyeR.position.x = 0.104;
  rider.add(eyeL); rider.add(eyeR);
  var ringL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M.eyeRing);
  ringL.position.set(-0.099, 1.540, -0.128);
  var ringR = ringL.clone(); ringR.position.x = 0.099;
  rider.add(ringL); rider.add(ringR);

  // 喙（压扁的长锥，鹈鹕的标志）
  var billGeo = new THREE.CylinderGeometry(0.030, 0.090, 0.560, 8, 1, false);
  billGeo.scale(1, 1, 0.42);
  billGeo.rotateX(-Math.PI / 2);   // 轴向 → -Z
  var bill = new THREE.Mesh(billGeo, M.beak);
  bill.position.set(0, 1.455, -0.440);
  bill.rotation.x = -0.05;
  rider.add(bill);
  // 喙尖
  var billTip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), M.beak);
  billTip.position.set(0, 1.438, -0.712);
  billTip.scale.set(1, 0.6, 1.1);
  rider.add(billTip);
  // 喉囊
  var pouch = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 12), M.pouch);
  pouch.scale.set(0.085, 0.078, 0.230);
  pouch.position.set(0, 1.388, -0.420);
  pouch.rotation.x = 0.06;
  rider.add(pouch);

  // 快递帽
  var capTop = new THREE.Mesh(new THREE.SphereGeometry(0.138, 14, 10, 0, TAU, 0, Math.PI / 2), M.red);
  capTop.position.set(0, 1.612, -0.060);
  capTop.scale.set(1, 0.72, 1.02);
  rider.add(capTop);
  var capBrim = box(0.215, 0.016, 0.135, M.red);
  capBrim.position.set(0, 1.620, -0.198);
  capBrim.rotation.x = -0.10;
  rider.add(capBrim);

  // 围巾（会飘）
  var scarfSegs = [];
  for (var si = 0; si < 7; si++) {
    var seg = box(0.075, 0.024, 0.132, M.red);
    rider.add(seg);
    scarfSegs.push(seg);
  }

  // 翅膀：细长的翼臂伸向车把 + 腕部后掠的飞羽；组原点在肩，随车把转动
  function buildWing(side) {
    var g = new THREE.Group();
    g.position.set(side * 0.165, 1.055, 0.090);

    var grip = new THREE.Vector3(side * 0.080, -0.085, -0.500);
    g.add(blob(new THREE.Vector3(0, 0, 0), grip, 0.048, 0.062, M.feather2));

    // 收拢的飞羽（沿翼臂向后掠）
    for (var i = 0; i < 4; i++) {
      var f = box(0.020, 0.050, 0.150, M.feather2);
      f.position.set(side * (0.030 + i * 0.009), -0.072 - i * 0.008, -0.300 - i * 0.028);
      f.rotation.x = -0.22;
      f.rotation.z = side * 0.22;
      g.add(f);
    }
    g.userData.tip = grip;
    return g;
  }
  var wingL = buildWing(-1), wingR = buildWing(1);
  rider.add(wingL); rider.add(wingR);

  // 腿（两段 IK，脚始终踩在踏板上）
  var HIP_L = new THREE.Vector3(-0.125, 0.845, 0.300);
  var HIP_R = new THREE.Vector3(0.125, 0.845, 0.300);
  var THIGH = 0.40, SHIN = 0.42;

  function makeLeg() {
    var thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 1, 8), M.feather2);
    var shin = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 1, 8), M.beak);
    var foot = new THREE.Group();
    var sole = box(0.095, 0.024, 0.160, M.beak);
    sole.position.set(0, 0, 0.030);
    foot.add(sole);
    var web = box(0.110, 0.012, 0.048, M.beak);
    web.position.set(0, 0, -0.048);
    foot.add(web);
    var knee = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), M.feather2);
    bike.add(thigh); bike.add(shin); bike.add(foot); bike.add(knee);
    return { thigh: thigh, shin: shin, foot: foot, knee: knee };
  }
  var legL = makeLeg(), legR = makeLeg();

  // ---- 车上货物（可见的 6 件）
  var bikeCrates = [];
  for (var ci = 0; ci < 6; ci++) {
    var cr = box(0.145, 0.135, 0.145, M.crate);
    var tapeTop = box(0.148, 0.016, 0.032, M.tape);
    tapeTop.position.y = 0.070;
    cr.add(tapeTop);
    if (ci < 3) {
      // 车筐里（steerGroup 局部坐标）
      steerGroup.add(cr);
      cr.userData.slot = 'basket';
      cr.userData.idx = ci;
    } else {
      frameGroup.add(cr);
      cr.userData.slot = 'rack';
      cr.userData.idx = ci - 3;
    }
    cr.visible = false;
    bikeCrates.push(cr);
  }
  // 车筐里的初始箱位
  function layoutCrates(count) {
    for (var i = 0; i < bikeCrates.length; i++) {
      var c = bikeCrates[i];
      var on = i < count;
      c.visible = on;
      if (!on) continue;
      if (c.userData.slot === 'basket') {
        var i2 = c.userData.idx;
        c.position.set((i2 - 1) * 0.115, 0.139 + (i2 === 1 ? 0.010 : 0), -0.215);
        c.rotation.set(0, (i2 - 1) * 0.12, 0);
      } else {
        var i3 = c.userData.idx;
        c.position.set((i3 - 1) * 0.075, 0.685, 0.50 + (i3 === 1 ? 0.0 : 0.0));
        c.rotation.set(0, (i3 - 1) * 0.10, 0);
      }
    }
  }
  layoutCrates(0);

  shadowOn(bike, true, false);

  /* =========================================================
     9. 场景道具（循环复用）
     ========================================================= */
  function Palm() {
    var g = new THREE.Group();
    var h = rand(3.2, 5.4);
    var trunk = cylinder(0.10, 0.18, h, M.wood, 7);
    trunk.position.y = h / 2;
    trunk.rotation.z = rand(-0.05, 0.05);
    g.add(trunk);
    var top = h - 0.15;
    var crownY = top;

    // 叶冠：从树顶向外下方伸展的羽状叶
    var fronds = 11;
    for (var i = 0; i < fronds; i++) {
      var a = (i / fronds) * TAU + rand(-0.15, 0.15);
      var dir = new THREE.Vector3(Math.cos(a), rand(-0.40, -0.08), Math.sin(a)).normalize();
      var len = rand(1.7, 2.5);
      var frond = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.27, len, 4, 1),
        i % 2 ? M.leaf : M.leaf2
      );
      frond.position.set(0, crownY, 0).addScaledVector(dir, len * 0.5);
      frond.quaternion.setFromUnitVectors(UP, dir);
      frond.scale.z = 0.42;             // 压扁成叶片
      g.add(frond);
      // 叶尖下垂的一小段
      var tipDir = new THREE.Vector3(dir.x, dir.y - 0.55, dir.z).normalize();
      var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.075, len * 0.45, 4, 1), i % 2 ? M.leaf : M.leaf2);
      tip.position.set(0, crownY, 0).addScaledVector(dir, len).addScaledVector(tipDir, len * 0.22);
      tip.quaternion.setFromUnitVectors(UP, tipDir);
      tip.scale.z = 0.42;
      g.add(tip);
    }
    var coco = new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 6), M.wood);
    coco.position.set(0, crownY - 0.24, 0);
    coco.scale.set(1, 0.85, 1);
    g.add(coco);
    shadowOn(g, true, false);
    return g;
  }

  function Rock() {
    var s = rand(0.3, 1.0);
    var m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), M.rock);
    m.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
    m.scale.set(1, rand(0.5, 0.85), 1);
    shadowOn(m, true, false);
    return m;
  }

  function Bush() {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var b = new THREE.Mesh(new THREE.IcosahedronGeometry(rand(0.22, 0.4), 0), i % 2 ? M.leaf : M.leaf2);
      b.position.set(rand(-0.28, 0.28), rand(0.08, 0.28), rand(-0.28, 0.28));
      g.add(b);
    }
    shadowOn(g, true, false);
    return g;
  }

  function LampPost() {
    var g = new THREE.Group();
    var pole = cylinder(0.05, 0.07, 3.1, M.lamp, 8);
    pole.position.y = 1.55;
    g.add(pole);
    var arm = cylinder(0.035, 0.035, 0.62, M.lamp, 6);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(0.30, 3.02, 0);
    g.add(arm);
    var headM = box(0.26, 0.09, 0.16, M.lamp);
    headM.position.set(0.60, 2.98, 0);
    g.add(headM);
    var bulb = box(0.20, 0.03, 0.11, M.glow);
    bulb.position.set(0.60, 2.93, 0);
    g.add(bulb);
    shadowOn(g, true, false);
    return g;
  }

  function PostPair() {
    var g = new THREE.Group();
    var p1 = cylinder(0.035, 0.035, 0.78, M.metal, 6);
    p1.position.set(-5.75, 0.39, 0);
    var p2 = p1.clone(); p2.position.x = 5.75;
    g.add(p1); g.add(p2);
    shadowOn(g, true, false);
    return g;
  }

  function makePool(count, span, factory, place) {
    var items = [];
    for (var i = 0; i < count; i++) {
      var m = factory(i);
      m.userData.zo = -(i * span / count) - 8;
      place(m, i);
      scene.add(m);
      items.push(m);
    }
    return {
      items: items,
      span: span,
      place: place,
      update: function (bikeZ) {
        for (var i = 0; i < items.length; i++) {
          var m = items[i];
          while (m.userData.zo > bikeZ + 55) {
            m.userData.zo -= span;
            place(m, i);
          }
          m.position.z = m.userData.zo;
        }
      }
    };
  }

  var palmPool = makePool(20, 20 * 11, Palm, function (m, i) {
    m.position.x = rand(-9, -26);
    m.position.z = m.userData.zo;
    m.position.y = groundY(m.position.x, m.userData.zo) - 0.05;
    m.rotation.y = rand(0, TAU);
    var s = rand(0.85, 1.2);
    m.scale.set(s, s, s);
  });

  var rockPool = makePool(16, 16 * 15, Rock, function (m, i) {
    m.position.x = -rand(7, 40);
    m.position.z = m.userData.zo;
    m.position.y = groundY(m.position.x, m.userData.zo) + 0.05;
  });

  var bushPool = makePool(22, 22 * 9, Bush, function (m, i) {
    var side = Math.random() < 0.72 ? -1 : 1;
    m.position.x = side < 0 ? rand(-6.6, -18) : rand(6.2, 8.6);
    m.position.z = m.userData.zo;
    m.position.y = groundY(m.position.x, m.userData.zo);
    m.rotation.y = rand(0, TAU);
  });

  var postPool = makePool(46, 46 * 4, PostPair, function (m, i) {
    m.position.y = elev(m.userData.zo);
    m.visible = Math.random() < 0.55;
  });

  var lampPool = makePool(10, 10 * 34, LampPost, function (m, i) {
    m.position.x = -6.3;
    m.position.z = m.userData.zo;
    m.position.y = groundY(-6.3, m.userData.zo);
    m.rotation.y = 0;            // 灯臂朝路面（+x）
  });

  // 护栏：分段复用，逐段贴合路面坡度（不能整根拉直，否则会浮空/入地）
  function RailSegment() {
    var g = new THREE.Group();
    var r1 = box(0.05, 0.11, 19.4, M.metal);
    r1.position.set(-5.78, 0.75, 0);
    var r2 = box(0.05, 0.11, 19.4, M.metal);
    r2.position.set(5.78, 0.75, 0);
    var r3 = box(0.05, 0.07, 19.4, M.metal);
    r3.position.set(-5.78, 0.50, 0);
    var r4 = box(0.05, 0.07, 19.4, M.metal);
    r4.position.set(5.78, 0.50, 0);
    g.add(r1); g.add(r2); g.add(r3); g.add(r4);
    r1.castShadow = false; r2.castShadow = false;
    return g;
  }

  var railPool = makePool(24, 24 * 19, RailSegment, function (m, i) {
    var z = m.userData.zo;
    m.position.set(0, elev(z), z);
    m.rotation.x = pitchAt(z);
  });

  /* =========================================================
     10. 可玩物件：货箱 / 小鱼 / 路障 / 水洼 / 驿站
     ========================================================= */
  function PickupCrate() {
    var g = new THREE.Group();
    var b = box(0.30, 0.28, 0.30, M.crate);
    g.add(b);
    var t1 = box(0.31, 0.03, 0.055, M.tape); t1.position.y = 0.145; g.add(t1);
    var t2 = box(0.055, 0.03, 0.31, M.tape); t2.position.y = 0.146; g.add(t2);
    shadowOn(g, true, false);
    return g;
  }

  function PickupFish() {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), M.fish);
    body.scale.set(0.62, 0.95, 1.35);
    g.add(body);
    var tail = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.17, 5), M.fish);
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = 0.26;
    g.add(tail);
    var fin = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 4), M.fish);
    fin.rotation.x = Math.PI / 2;
    fin.position.set(0, 0.12, 0.02);
    g.add(fin);
    shadowOn(g, true, false);
    return g;
  }

  function ObstacleCone() {
    var g = new THREE.Group();
    var base = box(0.42, 0.05, 0.42, M.dark);
    base.position.y = 0.025;
    g.add(base);
    var cone = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.62, 10), M.coneOr);
    cone.position.y = 0.34;
    g.add(cone);
    var stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.113, 0.139, 0.11, 10, 1, true), M.coneWh);
    stripe.position.y = 0.36;
    g.add(stripe);
    shadowOn(g, true, false);
    return g;
  }

  function ObstacleCrab() {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), M.crab);
    body.scale.set(1.25, 0.62, 1);
    body.position.y = 0.16;
    g.add(body);
    for (var i = 0; i < 3; i++) {
      for (var s = -1; s <= 1; s += 2) {
        var leg = cylinder(0.022, 0.016, 0.26, M.crab, 5);
        leg.position.set(s * 0.24, 0.14, (i - 1) * 0.12);
        leg.rotation.z = s * 0.95;
        g.add(leg);
      }
    }
    for (var c = -1; c <= 1; c += 2) {
      var claw = new THREE.Mesh(new THREE.SphereGeometry(0.078, 8, 6), M.crab);
      claw.scale.set(1, 0.7, 1.5);
      claw.position.set(c * 0.20, 0.20, -0.28);
      g.add(claw);
    }
    for (var e = -1; e <= 1; e += 2) {
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 6, 5), M.eye);
      eye.position.set(e * 0.09, 0.30, -0.18);
      g.add(eye);
    }
    shadowOn(g, true, false);
    return g;
  }

  function Puddle() {
    var m = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), M.puddle);
    m.rotation.x = -Math.PI / 2;
    m.scale.set(1, rand(0.8, 1.4), 1);
    return m;
  }

  // 驿站门
  function buildGate() {
    var g = new THREE.Group();
    var postMat = new THREE.MeshStandardMaterial({ color: 0x1c8f88, roughness: 0.45, metalness: 0.3 });
    var p1 = cylinder(0.10, 0.13, 3.4, postMat, 8);
    p1.position.set(-4.9, 1.7, 0);
    var p2 = p1.clone(); p2.position.x = 4.9;
    g.add(p1); g.add(p2);
    var beam = box(9.9, 0.13, 0.16, postMat);
    beam.position.y = 3.3;
    g.add(beam);
    var banner = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 1.02),
      new THREE.MeshStandardMaterial({
        map: textTexture('海 边 驿 站 · 交 付 点', { w: 1024, h: 144, bg: '#11625f', size: 74, stripe: true }),
        roughness: 0.85, side: THREE.DoubleSide
      })
    );
    banner.position.set(0, 2.62, 0);
    g.add(banner);
    var flag = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), new THREE.MeshStandardMaterial({
      color: 0xff8a3d, roughness: 0.8, side: THREE.DoubleSide
    }));
    flag.position.set(4.9, 3.55, 0);
    g.add(flag);
    // 地面光带
    var pad = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 2.4), new THREE.MeshBasicMaterial({
      color: 0x5ce0d6, transparent: true, opacity: 0.24, depthWrite: false
    }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.03;
    g.add(pad);
    shadowOn(g, true, false);
    g.userData.flag = flag;
    g.userData.banner = banner;
    return g;
  }
  var gate = buildGate();
  scene.add(gate);
  var gateZ = -170;
  var gateDone = false;

  /* =========================================================
     11. 粒子
     ========================================================= */
  var PCOUNT = 90;
  var particles = [];
  var partGeo = new THREE.IcosahedronGeometry(0.040, 0);
  for (var pi = 0; pi < PCOUNT; pi++) {
    var pm = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    pm.visible = false;
    pm.userData = { life: 0, max: 1, vel: new THREE.Vector3(), spin: new THREE.Vector3() };
    scene.add(pm);
    particles.push(pm);
  }
  var partCursor = 0;

  function burst(pos, color, count, power, size) {
    for (var i = 0; i < count; i++) {
      var p = particles[partCursor];
      partCursor = (partCursor + 1) % PCOUNT;
      p.visible = true;
      p.position.copy(pos);
      p.position.x += rand(-0.16, 0.16);
      p.position.y += rand(0, 0.24);
      p.position.z += rand(-0.16, 0.16);
      p.material.color.set(color);
      p.material.opacity = 1;
      var s = size || 1;
      p.scale.setScalar(s * rand(0.6, 1.3));
      p.userData.vel.set(rand(-1, 1) * power, rand(0.5, 1.4) * power, rand(-1, 1) * power);
      p.userData.spin.set(rand(-8, 8), rand(-8, 8), rand(-8, 8));
      p.userData.life = p.userData.max = rand(0.4, 0.95);
    }
  }

  function updateParticles(dt) {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!p.visible) continue;
      var u = p.userData;
      u.life -= dt;
      if (u.life <= 0) { p.visible = false; continue; }
      u.vel.y -= 9.8 * dt;
      p.position.addScaledVector(u.vel, dt);
      p.rotation.x += u.spin.x * dt;
      p.rotation.y += u.spin.y * dt;
      p.rotation.z += u.spin.z * dt;
      var k = u.life / u.max;
      p.material.opacity = k;
      p.scale.multiplyScalar(1 - 0.6 * dt);
    }
  }

  /* =========================================================
     12. 输入
     ========================================================= */
  var input = { up: false, down: false, left: false, right: false, jump: false };
  var jumpLatch = false;

  var KEYMAP = {
    'KeyW': 'up', 'ArrowUp': 'up',
    'KeyS': 'down', 'ArrowDown': 'down',
    'KeyA': 'left', 'ArrowLeft': 'left',
    'KeyD': 'right', 'ArrowRight': 'right',
    'Space': 'jump'
  };

  var KEY_FALLBACK = { w: 'KeyW', s: 'KeyS', a: 'KeyA', d: 'KeyD', p: 'KeyP', ' ': 'Space', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Escape: 'Escape' };
  function eventCode(e) {
    if (e.code) return e.code;
    var key = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    return KEY_FALLBACK[key] || '';
  }

  window.addEventListener('keydown', function (e) {
    var code = eventCode(e);
    if (code === 'KeyP' || code === 'Escape') {
      togglePause();
      return;
    }
    var k = KEYMAP[eventCode(e)];
    if (!k) return;
    e.preventDefault();
    if (k === 'jump') {
      if (!jumpLatch) { input.jump = true; jumpLatch = true; }
    } else {
      input[k] = true;
    }
    if (!game.started && k !== 'jump') startGame();
  }, { passive: false });

  window.addEventListener('keyup', function (e) {
    var k = KEYMAP[eventCode(e)];
    if (!k) return;
    if (k === 'jump') { jumpLatch = false; }
    else input[k] = false;
  });

  window.addEventListener('blur', function () {
    input.up = input.down = input.left = input.right = false;
  });

  // 触屏
  var touchBtns = document.querySelectorAll('#touch button');
  for (var tbi = 0; tbi < touchBtns.length; tbi++) {
    (function (btn) {
      var key = btn.getAttribute('data-k');
      function on(e) {
        e.preventDefault();
        if (key === 'jump') { input.jump = true; }
        else input[key] = true;
        if (!game.started) startGame();
      }
      function off(e) {
        e.preventDefault();
        if (key !== 'jump') input[key] = false;
      }
      btn.addEventListener('touchstart', on, { passive: false });
      btn.addEventListener('touchend', off, { passive: false });
      btn.addEventListener('touchcancel', off, { passive: false });
      btn.addEventListener('mousedown', on);
      btn.addEventListener('mouseup', off);
      btn.addEventListener('mouseleave', off);
    })(touchBtns[tbi]);
  }

  /* =========================================================
     13. 游戏状态
     ========================================================= */
  var BIKE_MASS = 74;        // 车 + 骑手 kg
  var CARGO_MASS = 3.5;      // 每件货 kg
  var CAPACITY = 6;
  var RHO = 1.225;           // 空气密度
  var CDA = 0.50;            // 阻力面积 m²（≈ ½ρCdA = 0.306）
  var CRR = 0.012;           // 滚动阻力系数
  var P_MAX = 430;           // 骑手最大功率 W
  var F_MAX = 380;           // 低速扭矩/抓地上限 N

  var game = {
    started: false,
    paused: false,
    time: 0,
    dist: 0,
    speed: 0,
    x: 0,
    y: 0,
    z: 0,
    vy: 0,
    onGround: true,
    yaw: 0,
    yawRate: 0,
    roll: 0,
    pitch: 0,
    steer: 0,
    crank: 0,
    cadence: 0,
    wheelAng: 0,
    power: 0,
    drag: 0,
    stamina: 1,
    cargo: 0,
    delivered: 0,
    score: 0,
    boost: 0,
    shake: 0,
    flash: 0,
    squash: 0,
    slip: 0,
    cargoFlash: 0,
    energy: 0
  };

  var accelNow = 0;

  function resetGame() {
    game.time = 0; game.dist = 0; game.speed = 0; game.x = 0; game.z = 0;
    game.y = elev(0); game.vy = 0; game.onGround = true;
    game.yaw = 0; game.yawRate = 0; game.roll = 0; game.steer = 0;
    game.crank = 0; game.cadence = 0; game.wheelAng = 0;
    game.stamina = 1; game.cargo = 0; game.delivered = 0; game.score = 0;
    game.boost = 0; game.shake = 0; game.squash = 0; game.slip = 0; game.energy = 0;
    game.power = 0; game.drag = 0; accelNow = 0;
    gateZ = -170; gateDone = false;
    layoutCrates(0);
    resetPickups();
    toast('按住 W / ↑ 开始蹬车', 'good');
  }

  /* =========================================================
     14. 拾取物 / 障碍 池
     ========================================================= */
  var crates = [];
  var fishes = [];
  var cones = [];
  var crabs = [];
  var puddles = [];

  function spawnAt(obj, z, extra) {
    obj.userData.z = z;
    obj.position.z = z;
    var y = elev(z) + (extra === undefined ? 0.6 : extra);
    obj.position.y = y;
    obj.userData.baseY = y;        // 漂浮基准必须跟着路面起伏走，否则会悬空
    obj.userData.alive = true;
    obj.visible = true;
  }

  function buildPickups() {
    var i;
    for (i = 0; i < 10; i++) {
      var c = PickupCrate();
      c.userData = { kind: 'crate', z: 0, alive: true, spin: rand(0, TAU), baseY: 0.55 };
      scene.add(c); crates.push(c);
      spawnAt(c, -25 - i * 34, 0.62);
    }
    for (i = 0; i < 5; i++) {
      var f = PickupFish();
      f.userData = { kind: 'fish', z: 0, alive: true, spin: rand(0, TAU), baseY: 0.85 };
      scene.add(f); fishes.push(f);
      spawnAt(f, -60 - i * 78, 0.95);
    }
    for (i = 0; i < 7; i++) {
      var o = Math.random() < 0.72 ? ObstacleCone() : ObstacleCrab();
      o.userData = { kind: 'cone', z: 0, alive: true, spin: 0, baseY: 0 };
      scene.add(o); cones.push(o);
      spawnAt(o, -45 - i * 52, 0);
    }
    for (i = 0; i < 4; i++) {
      var p = Puddle();
      p.userData = { kind: 'puddle', z: 0, alive: true, spin: 0, baseY: 0.015 };
      scene.add(p); puddles.push(p);
      spawnAt(p, -70 - i * 95, 0.015);
    }
  }

  function resetPickups() {
    var i;
    for (i = 0; i < crates.length; i++) {
      spawnAt(crates[i], game.z - 25 - i * 34, 0.62);
    }
    for (i = 0; i < fishes.length; i++) {
      spawnAt(fishes[i], game.z - 60 - i * 78, 0.95);
    }
    for (i = 0; i < cones.length; i++) {
      spawnAt(cones[i], game.z - 45 - i * 52, 0);
    }
    for (i = 0; i < puddles.length; i++) {
      spawnAt(puddles[i], game.z - 70 - i * 95, 0.015);
    }
    gateZ = game.z - 170;
    gateDone = false;
  }

  buildPickups();

  /* =========================================================
     15. UI
     ========================================================= */
  var el = {
    dist: document.getElementById('hDist'),
    deliver: document.getElementById('hDeliver'),
    score: document.getElementById('hScore'),
    cargo: document.getElementById('hCargo'),
    slots: document.getElementById('hSlots'),
    cargoBar: document.getElementById('cargoBar'),
    mass: document.getElementById('hMass'),
    stam: document.getElementById('hStam'),
    stamBar: document.getElementById('staminaBar'),
    speed: document.getElementById('pSpeed'),
    cad: document.getElementById('pCad'),
    power: document.getElementById('pPower'),
    drag: document.getElementById('pDrag'),
    grade: document.getElementById('pGrade'),
    lean: document.getElementById('pLean'),
    leanBar: document.getElementById('leanBar'),
    note: document.getElementById('pNote'),
    state: document.getElementById('pState'),
    toasts: document.getElementById('toasts'),
    overlay: document.getElementById('overlay')
  };

  var slotEls = [];
  for (var sl = 0; sl < CAPACITY; sl++) {
    var d = document.createElement('div');
    d.className = 'slot';
    el.slots.appendChild(d);
    slotEls.push(d);
  }

  var toastTimers = [];
  function toast(msg, kind) {
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    el.toasts.appendChild(t);
    var timer = setTimeout(function () {
      if (t.parentNode) t.parentNode.removeChild(t);
    }, 2600);
    toastTimers.push(timer);
    if (el.toasts.children.length > 3) {
      el.toasts.removeChild(el.toasts.children[0]);
    }
  }

  function fmt(v, d) { return v.toFixed(d === undefined ? 0 : d); }

  function setText(node, txt) {
    if (node && node.textContent !== txt) node.textContent = txt;
  }

  function updateHUD() {
    setText(el.dist, String(Math.max(0, Math.floor(game.dist))));
    setText(el.deliver, String(game.delivered));
    setText(el.score, String(Math.floor(game.score)));
    el.cargo.textContent = game.cargo + ' / ' + CAPACITY + ' 件';
    var mass = BIKE_MASS + game.cargo * CARGO_MASS;
    el.mass.textContent = '整车质量 ' + mass.toFixed(1) + ' kg';
    el.cargoBar.style.width = (game.cargo / CAPACITY * 100) + '%';

    for (var i = 0; i < slotEls.length; i++) {
      var on = i < game.cargo;
      if (slotEls[i].classList.contains('on') !== on) {
        slotEls[i].classList.toggle('on', on);
      }
    }

    var sp = game.speed * 3.6;
    setText(el.speed, fmt(sp, 1));
    setText(el.cad, fmt(game.cadence));
    setText(el.power, fmt(game.power));
    setText(el.drag, fmt(game.drag, 1));
    var gr = gradeAt(game.z) * 100;
    setText(el.grade, (gr >= 0 ? '+' : '') + fmt(gr, 1));
    var leanDeg = game.roll * 180 / Math.PI;
    setText(el.lean, fmt(leanDeg, 1));
    var w = clamp(Math.abs(leanDeg) / 30, 0, 1) * 50;
    el.leanBar.style.width = w + '%';
    // 车向左倾(正角) → 指示条向左伸；向右倾 → 向右伸
    el.leanBar.style.left = leanDeg >= 0 ? (50 - w) + '%' : '50%';
    el.leanBar.style.background = leanDeg >= 0
      ? 'linear-gradient(90deg,rgba(255,138,61,.25),#ff8a3d)'
      : 'linear-gradient(270deg,rgba(62,198,192,.25),#3ec6c0)';

    el.stamBar.style.width = (game.stamina * 100) + '%';
    el.stamBar.className = game.stamina < 0.28 ? 'low' : '';
    el.stam.textContent = Math.round(game.stamina * 100) + '%';
    var st = '巡航';
    if (game.power > 300) st = '冲刺';
    else if (game.power > 60) st = '蹬踏中';
    if (game.boost > 0) st = '加速';
    if (!game.onGround) st = '腾空';
    if (game.speed < 0.2) st = '待机';
    el.state.textContent = st;

    setText(el.note, 'a = ' + (accelNow >= 0 ? '+' : '') + accelNow.toFixed(2) +
      ' m/s² · E = ' + (game.energy / 1000).toFixed(1) + ' kJ');
  }

  /* =========================================================
     16. 物理核心
     ========================================================= */
  function updatePhysics(dt) {
    var mass = BIKE_MASS + game.cargo * CARGO_MASS;
    var v = game.speed;

    /* ---- 骑手输出功率 P = F·v（受体力与抓地力约束） ---- */
    var boostK = game.boost > 0 ? 1.55 : 1;
    var wantPower = input.up ? P_MAX * boostK : 0;
    var availPower = (130 + 300 * game.stamina) * boostK;
    var P = Math.min(wantPower, availPower);
    if (v < 0.35) P = Math.min(P, 320);               // 起步扭矩受限，无法瞬时爆发
    var fCap = F_MAX * (game.boost > 0 ? 1.25 : 1);   // 轮胎抓地上限
    var Fpedal = Math.min(P / Math.max(v, 1.0), fCap);
    var Pactual = Fpedal * v;                         // 实际做功（v→0 时不做功）

    // 体力：按实际负荷的平方消耗，滑行时恢复
    var load = Pactual / P_MAX;
    if (load > 0.05) game.stamina -= load * load * 0.040 * dt;
    else game.stamina += 0.14 * dt;
    game.stamina = clamp(game.stamina, 0, 1);

    /* ---- 阻力 ---- */
    var Fdrag = 0.5 * RHO * CDA * v * v;                 // 空气阻力
    var Froll = CRR * mass * GRAV;                        // 滚动阻力
    game.drag = Fdrag;
    var Fbrake = input.down ? 320 : 0;                    // 刹车（限力）

    /* ---- 坡度重力分量 ---- */
    var grade = gradeAt(game.z);                          // 上坡为正
    var sinTheta = grade / Math.sqrt(1 + grade * grade);
    var Fgrav = mass * GRAV * sinTheta;

    /* ---- 合力 ---- */
    var Fnet = Fpedal - Fdrag - Froll - Fgrav - Fbrake;
    var a = Fnet / mass;
    accelNow = a;

    // 滑移（压到水洼后抓地下降，加速度打折）
    if (game.slip > 0) {
      game.slip -= dt;
      a *= 0.55;
    }

    v += a * dt;
    if (v < 0) v = 0;
    if (v > 34) v = 34;
    game.speed = v;

    /* ---- 功率 / 能量 ---- */
    game.power = Math.max(0, Pactual);
    game.energy += game.power * dt;

    /* ---- 前进位移 ---- */
    var ds = v * dt;
    game.z -= ds;
    game.dist += ds;

    /* ---- 转向动力学：yawRate = v·tanδ / L ---- */
    var steerIn = (input.left ? 1 : 0) - (input.right ? 1 : 0);
    game.steer = damp(game.steer, steerIn, 10, dt);
    var deltaMax = 0.20 * (1 - 0.55 * clamp(v / 16, 0, 1));
    var delta = game.steer * deltaMax;
    var yawRate = v * Math.tan(delta) / WB;
    game.yawRate = yawRate;
    game.yaw += yawRate * dt;
    // 自行车自稳定（陀螺效应 + 前叉拖曳距）：松把自动回正
    game.yaw = damp(game.yaw, 0, 3.2, dt);
    game.yaw = clamp(game.yaw, -0.62, 0.62);

    // 侧向位移（沿车头方向）
    game.x -= v * Math.sin(game.yaw) * dt;

    // 边界（撞到护栏 → 损失速度并被弹回）
    var limit = 4.55;
    if (game.x > limit) {
      game.x = limit;
      if (game.yaw < 0) game.yaw *= -0.25;   // 还在往右偏 → 弹回左
      game.speed *= 0.92;
    } else if (game.x < -limit) {
      game.x = -limit;
      if (game.yaw > 0) game.yaw *= -0.25;   // 还在往左偏 → 弹回右
      game.speed *= 0.92;
    }

    /* ---- 侧倾：φ = arctan(v·ω / g) ---- */
    var rollTarget = Math.atan((v * yawRate) / GRAV);
    rollTarget = clamp(rollTarget, -0.52, 0.52);
    game.roll = damp(game.roll, rollTarget, 7, dt);

    /* ---- 俯仰：跟随路面坡度 ---- */
    game.pitch = damp(game.pitch, pitchAt(game.z), 9, dt);

    /* ---- 垂直：跳跃与落地 ---- */
    if (input.jump) {
      input.jump = false;
      if (game.onGround) {
        game.vy = 4.15;
        game.onGround = false;
        burst(new THREE.Vector3(game.x, game.y + 0.12, game.z + 0.4), 0xd8cdb4, 8, 1.6, 0.9);
      }
    }
    if (!game.onGround) {
      game.vy -= GRAV * dt;
      game.y += game.vy * dt;
      var groundY = elev(game.z);
      if (game.y <= groundY) {
        var impact = -game.vy;
        game.y = groundY;
        game.vy = 0;
        game.onGround = true;
        game.squash = clamp(impact * 0.055, 0, 0.42);
        if (impact > 2) {
          burst(new THREE.Vector3(game.x, game.y + 0.06, game.z + 0.35), 0xcfc3a8, 10, 1.4, 0.85);
          game.shake = Math.min(0.5, impact * 0.06);
        }
      }
    } else {
      game.y = damp(game.y, elev(game.z), 22, dt);
    }

    game.squash = damp(game.squash, 0, 9, dt);

    /* ---- 传动：曲柄角速度 = 轮角速度 / 齿比（无滑移 ω=v/R） ---- */
    var wheelOmega = v / WR;
    game.wheelAng += wheelOmega * dt;
    if (P > 1 && v > 0.15) {
      game.crank += (wheelOmega / GEAR) * dt;
      game.cadence = (wheelOmega / GEAR) * 60 / TAU;
    } else {
      game.cadence = damp(game.cadence, 0, 8, dt);
    }

    /* ---- 轮子角加速度造成的抖动 & 速度转化 ---- */
    if (game.boost > 0) {
      game.boost -= dt;
      if (game.boost <= 0) game.boost = 0;
    }
    game.shake = damp(game.shake, 0, 4.5, dt);

    // 里程循环（地形周期 2000 m）
    if (game.z < -3700) {
      game.z += PERIOD;
      gateZ += PERIOD;
      for (var i = 0; i < crates.length; i++) crates[i].userData.z += PERIOD, crates[i].position.z += PERIOD;
      for (var j = 0; j < fishes.length; j++) fishes[j].userData.z += PERIOD, fishes[j].position.z += PERIOD;
      for (var k = 0; k < cones.length; k++) cones[k].userData.z += PERIOD, cones[k].position.z += PERIOD;
      for (var m = 0; m < puddles.length; m++) puddles[m].userData.z += PERIOD, puddles[m].position.z += PERIOD;
      for (var n = 0; n < palmPool.items.length; n++) palmPool.items[n].userData.zo += PERIOD;
      for (var n2 = 0; n2 < rockPool.items.length; n2++) rockPool.items[n2].userData.zo += PERIOD;
      for (var n3 = 0; n3 < bushPool.items.length; n3++) bushPool.items[n3].userData.zo += PERIOD;
      for (var n4 = 0; n4 < postPool.items.length; n4++) postPool.items[n4].userData.zo += PERIOD;
      for (var n5 = 0; n5 < lampPool.items.length; n5++) lampPool.items[n5].userData.zo += PERIOD;
      for (var n6 = 0; n6 < railPool.items.length; n6++) railPool.items[n6].userData.zo += PERIOD;
    }
  }

  /* =========================================================
     17. 交互：拾取 / 障碍 / 交付
     ========================================================= */
  function checkPickups() {
    var i, o, dx, dz, dy;
    // 车速越快，单帧跨过的距离越长，判定窗口要相应放宽（避免高速穿过漏判）
    var reachZ = 0.85 + game.speed * 0.055;
    for (i = 0; i < crates.length; i++) {
      o = crates[i];
      if (!o.userData.alive) continue;
      dz = o.position.z - game.z;
      if (dz > 5 || dz < -5) continue;
      dx = o.position.x - game.x;
      dy = o.position.y - (game.y + 0.7);
      if (Math.abs(dx) < 0.95 && Math.abs(dz) < reachZ && Math.abs(dy) < 1.15) {
        o.userData.alive = false;
        o.visible = false;
        if (game.cargo < CAPACITY) {
          game.cargo++;
          layoutCrates(game.cargo);
          game.cargoFlash = 1;
          burst(o.position.clone(), 0xffd79a, 10, 2.0, 1.0);
          toast('装载 1 件 · 整车 ' + (BIKE_MASS + game.cargo * CARGO_MASS).toFixed(1) + ' kg', 'good');
        } else {
          toast('货箱已满，装载被拒', 'bad');
        }
      }
    }
    for (i = 0; i < fishes.length; i++) {
      o = fishes[i];
      if (!o.userData.alive) continue;
      dz = o.position.z - game.z;
      if (dz > 5 || dz < -5) continue;
      dx = o.position.x - game.x;
      dy = o.position.y - (game.y + 0.8);
      if (Math.abs(dx) < 1.0 && Math.abs(dz) < reachZ && Math.abs(dy) < 1.3) {
        o.userData.alive = false;
        o.visible = false;
        game.boost = 3.4;
        game.stamina = clamp(game.stamina + 0.35, 0, 1);
        game.speed = Math.min(game.speed + 1.6, 26);
        burst(o.position.clone(), 0x8fe3f5, 14, 2.6, 1.0);
        toast('吃到小鱼 · 功率 +55%', 'good');
      }
    }
    for (i = 0; i < cones.length; i++) {
      o = cones[i];
      if (!o.userData.alive) continue;
      dz = o.position.z - game.z;
      if (dz > 4 || dz < -4) continue;
      dx = o.position.x - game.x;
      if (Math.abs(dx) < 0.75 && Math.abs(dz) < reachZ && game.onGround && game.y - elev(game.z) < 0.5) {
        o.userData.alive = false;
        o.visible = false;
        hitObstacle(o);
      }
    }
    for (i = 0; i < puddles.length; i++) {
      o = puddles[i];
      if (!o.userData.alive) continue;
      dz = o.position.z - game.z;
      if (dz > 4 || dz < -4) continue;
      dx = o.position.x - game.x;
      if (Math.abs(dx) < 0.85 && Math.abs(dz) < reachZ && game.onGround) {
        o.userData.alive = false;
        o.visible = false;
        game.slip = 1.1;
        game.shake = 0.28;
        burst(o.position.clone(), 0x9fd8e8, 14, 2.2, 0.9);
        toast('压到水洼 · 抓地力下降', 'bad');
      }
    }
  }

  function hitObstacle(o) {
    var lost = 0;
    game.speed *= 0.52;
    game.shake = 1.0;
    game.flash = 1;
    game.yaw += rand(-0.14, 0.14);
    if (game.cargo > 0) {
      lost = Math.min(2, game.cargo);
      game.cargo -= lost;
      layoutCrates(game.cargo);
    }
    burst(o.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 0xff9a4d, 16, 3.0, 1.1);
    toast(lost > 0 ? '撞上路障！掉件 ' + lost + ' 件，车速骤降' : '撞上路障！车速骤降', 'bad');
  }

  function checkGate() {
    if (!gateDone && game.z <= gateZ) {
      gateDone = true;
      if (game.cargo > 0) {
        var gain = game.cargo * 14 + Math.floor(game.dist / 20);
        game.score += gain;
        game.delivered += game.cargo;
        game.cargo = 0;
        layoutCrates(0);
        game.stamina = clamp(game.stamina + 0.22, 0, 1);
        burst(new THREE.Vector3(game.x, game.y + 1.0, game.z), 0x6ff0e2, 24, 3.4, 1.2);
        toast('交付成功 · ' + gain + ' 分', 'gold');
      } else {
        toast('空车通过驿站 · 记得先装货', 'bad');
      }
    }
    if (game.z < gateZ - 26) {
      gateZ = game.z - 165;
      gateDone = false;
    }
  }

  function updatePickupPool(list, gapMin, gapMax, yOff, kind) {
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      var need = !o.userData.alive || o.position.z > game.z + 16;
      if (need) {
        var z = game.z - gapMin - Math.random() * (gapMax - gapMin);
        o.userData.z = z;
        o.position.z = z;
        o.position.x = rand(-3.7, 3.7);
        var y = elev(z) + yOff;          // 关键：必须落在起伏路面上
        o.position.y = y;
        o.userData.baseY = y;
        o.userData.alive = true;
        o.visible = true;
        if (kind === 'puddle') {
          o.scale.set(rand(0.85, 1.5), rand(0.8, 1.4), 1);
        }
      }
    }
  }

  /* =========================================================
     18. 骑手动画
     ========================================================= */
  var _v1 = new THREE.Vector3();
  var _v2 = new THREE.Vector3();
  var _v3 = new THREE.Vector3();
  var _hip = new THREE.Vector3();

  function solveLeg(hip, target, thigh, shin, outKnee) {
    var dx = target.x - hip.x, dy = target.y - hip.y, dz = target.z - hip.z;
    var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (d < 1e-4) d = 1e-4;
    var dClamped = clamp(d, Math.abs(thigh - shin) + 0.03, thigh + shin - 0.01);
    var ux = dx / d, uy = dy / d, uz = dz / d;
    var cosA = clamp((dClamped * dClamped + thigh * thigh - shin * shin) / (2 * dClamped * thigh), -1, 1);
    var A = Math.acos(cosA);
    // 在 YZ 平面内的垂直方向（膝盖朝前 -Z）
    var px = 0, py = -uz, pz = uy;
    var pl = Math.sqrt(py * py + pz * pz);
    if (pl < 1e-4) { py = 0; pz = -1; pl = 1; }
    py /= pl; pz /= pl;
    outKnee.set(
      hip.x + (ux * Math.cos(A) + px * Math.sin(A)) * thigh * (dClamped / d),
      hip.y + (uy * Math.cos(A) + py * Math.sin(A)) * thigh * (dClamped / d),
      hip.z + (uz * Math.cos(A) + pz * Math.sin(A)) * thigh * (dClamped / d)
    );
    return outKnee;
  }

  function setBone(mesh, a, b) {
    _v1.subVectors(b, a);
    var len = _v1.length();
    if (len < 1e-5) len = 1e-5;
    mesh.position.copy(a).addScaledVector(_v1, 0.5);
    mesh.quaternion.setFromUnitVectors(UP, _v2.copy(_v1).normalize());
    mesh.scale.set(1, len, 1);
  }

  var _kneeL = new THREE.Vector3(), _kneeR = new THREE.Vector3();
  var _pedalL = new THREE.Vector3(), _pedalR = new THREE.Vector3();

  function animateRider(dt, t) {
    var a = game.crank;
    var bob = Math.sin(a * 2) * 0.012 * clamp(game.speed / 8, 0, 1);

    // 踏板位置（曲柄角 a，a=0 位于最低点）
    _pedalR.set(0.115, BB.y - Math.cos(a) * CRANK_R, BB.z + Math.sin(a) * CRANK_R);
    _pedalL.set(-0.115, BB.y - Math.cos(a + Math.PI) * CRANK_R, BB.z + Math.sin(a + Math.PI) * CRANK_R);
    crankGroup.rotation.x = -a;
    pedalR.position.copy(_pedalR);
    pedalL.position.copy(_pedalL);

    // 腿 IK
    _hip.copy(HIP_R);
    _hip.y += bob;
    solveLeg(_hip, _pedalR, THIGH, SHIN, _kneeR);
    setBone(legR.thigh, _hip, _kneeR);
    setBone(legR.shin, _kneeR, _pedalR);
    legR.knee.position.copy(_kneeR);

    _hip.copy(HIP_L);
    _hip.y += bob;
    solveLeg(_hip, _pedalL, THIGH, SHIN, _kneeL);
    setBone(legL.thigh, _hip, _kneeL);
    setBone(legL.shin, _kneeL, _pedalL);
    legL.knee.position.copy(_kneeL);

    legR.foot.position.set(_pedalR.x, _pedalR.y + 0.055, _pedalR.z);
    legR.foot.rotation.x = -0.05;
    legL.foot.position.set(_pedalL.x, _pedalL.y + 0.055, _pedalL.z);
    legL.foot.rotation.x = -0.05;

    // 转向（前叉 / 车把，翅膀随把转动）
    var steerVis = game.steer * 0.26;
    steerGroup.rotation.y = -steerVis;
    wingR.rotation.y = -steerVis * 0.85;
    wingL.rotation.y = -steerVis * 0.85;

    // 躯干随速度前倾 + 踩踏上下起伏
    var lean = clamp(game.speed / 13, 0, 1);
    rider.position.y = bob * 1.1;
    rider.rotation.x = damp(rider.rotation.x, -0.10 - lean * 0.10, 6, dt);
    rider.rotation.z = Math.sin(a) * 0.012 * clamp(game.speed / 6, 0, 1);

    // 头部微摆
    head.position.y = 1.505 + Math.sin(t * 1.7) * 0.006 + bob * 0.5;
    head.rotation.y = Math.sin(t * 0.9) * 0.06;
    head.rotation.z = Math.sin(t * 1.3) * 0.02;
    neck.scale.x = 1 + Math.sin(a * 2) * 0.02;

    // 围巾飘动
    for (var i = 0; i < scarfSegs.length; i++) {
      var seg = scarfSegs[i];
      var f = i / (scarfSegs.length - 1);
      var amp = 0.040 + clamp(game.speed / 12, 0, 1) * 0.14;
      var wave = Math.sin(t * 9 - i * 0.9) * amp * f;
      seg.position.set(
        wave,
        1.238 + Math.cos(t * 9 - i * 0.9) * amp * 0.25 * f,
        0.045 + f * 0.545 + clamp(game.speed / 12, 0, 1) * 0.09 * f
      );
      seg.rotation.x = 0.16;
      seg.rotation.z = wave * 0.45;
    }

    // 箱子闪光（装载反馈）
    game.cargoFlash = damp(game.cargoFlash, 0, 6, dt);
  }

  /* =========================================================
     19. 场景跟随
     ========================================================= */
  function updateWorld(dt, t) {
    bike.position.set(game.x, game.y, game.z);
    bike.rotation.y = game.yaw;
    bike.rotation.z = game.roll;
    bike.rotation.x = game.pitch;

    var sq = 1 - game.squash * 0.35;
    bike.scale.set(1 / Math.max(0.75, 1 - game.squash * 0.15), sq, 1);

    // 车轮（纯滚动：ω = v / R）
    wheelRear.userData.spin.rotation.z = -game.wheelAng;
    wheelFront.userData.spin.rotation.z = -game.wheelAng;

    // 道具池
    palmPool.update(game.z);
    rockPool.update(game.z);
    bushPool.update(game.z);
    postPool.update(game.z);
    lampPool.update(game.z);
    railPool.update(game.z);

    // 海面
    sea.position.z = game.z - 1400;
    foam.position.z = game.z - 1400;
    seaTex.offset.y = Math.sin(t * 0.25) * 0.02;
    seaTex.offset.x = t * 0.012;

    mountains.position.z = game.z - 60;

    // 太阳 / 天空跟随
    sky.position.copy(camera.position);
    sunSprite.position.copy(camera.position).addScaledVector(SUN_DIR, 560);

    // 阴影相机跟随
    sunLight.position.set(game.x - 15, game.y + 24, game.z + 13);
    sunLight.target.position.set(game.x, game.y, game.z - 2);
    sunLight.target.updateMatrixWorld();

    // 拾取物视觉
    var i, o;
    for (i = 0; i < crates.length; i++) {
      o = crates[i];
      if (!o.visible) continue;
      o.rotation.y += dt * 1.6;
      o.position.y = o.userData.baseY + Math.sin(t * 2.2 + i) * 0.07;
    }
    for (i = 0; i < fishes.length; i++) {
      o = fishes[i];
      if (!o.visible) continue;
      o.rotation.y += dt * 2.2;
      o.position.y = o.userData.baseY + Math.sin(t * 2.6 + i * 1.7) * 0.10;
    }
    for (i = 0; i < cones.length; i++) {
      o = cones[i];
      if (!o.visible) continue;
      o.position.y = elev(o.position.z);
    }
    for (i = 0; i < puddles.length; i++) {
      o = puddles[i];
      if (!o.visible) continue;
      o.position.y = elev(o.position.z) + 0.02;
    }

    // 驿站（横幅随距离轻微呼吸）
    gate.position.set(0, elev(gateZ), gateZ);
    gate.userData.flag.rotation.y = Math.sin(t * 2.4) * 0.5;
    var near = clamp(1 - Math.abs(game.z - gateZ) / 90, 0, 1);
    gate.userData.banner.scale.y = 1 + near * 0.02 * Math.sin(t * 3);
  }

  /* =========================================================
     20. 相机
     ========================================================= */
  var camPos = new THREE.Vector3(0, 2.6, 8);
  var camLook = new THREE.Vector3(0, 1.1, 0);
  var camX = 0, camY = 2.6;

  function updateCamera(dt) {
    var speedK = clamp(game.speed / 14, 0, 1);
    var back = 4.25 + speedK * 1.15;
    var up = 1.74 + speedK * 0.26;
    var side = -(1.95 + speedK * 0.22);      // 侧后方 3/4 视角，能看清车与鹈鹕侧影

    camX = damp(camX, game.x + side, 5.5, dt);
    camY = damp(camY, game.y + up, 6.5, dt);

    var sx = (Math.random() - 0.5) * game.shake * 0.32;
    var sy = (Math.random() - 0.5) * game.shake * 0.26;

    camPos.set(camX + sx, camY + sy, game.z + back);
    camLook.set(game.x * 0.94 + 0.46, game.y + 0.92, game.z - 3.4);

    camera.position.lerp(camPos, 1 - Math.exp(-12 * dt));
    camera.lookAt(camLook);
    camera.rotateZ(-game.roll * 0.16 + (Math.random() - 0.5) * game.shake * 0.02);

    var fovTarget = 57 + speedK * 9 + (game.boost > 0 ? 4 : 0);
    if (Math.abs(camera.fov - fovTarget) > 0.05) {
      camera.fov = damp(camera.fov, fovTarget, 5, dt);
      camera.updateProjectionMatrix();
    }
  }

  /* =========================================================
     21. 主循环
     ========================================================= */
  var last = performance.now();
  var elapsed = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = (now - last) / 1000;
    last = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.05);
    elapsed += dt;

    if (game.started && !game.paused) {
      updatePhysics(dt);
      checkPickups();
      checkGate();
      game.time += dt;

      // 拾取物回收
      updatePickupPool(crates, 26, 58, 0.62, 'crate');
      updatePickupPool(fishes, 90, 160, 0.95, 'fish');
      updatePickupPool(cones, 40, 85, 0, 'cone');
      updatePickupPool(puddles, 80, 170, 0.02, 'puddle');

      // 车轮扬尘
      if (game.speed > 5 && game.onGround && Math.random() < dt * 8) {
        burst(new THREE.Vector3(game.x, game.y + 0.04, game.z + 0.55),
          0xc4b89e, 1, 0.45, 0.65);
      }

      animateRider(dt, elapsed);
      updateWorld(dt, elapsed);
      updateParticles(dt);
      updateCamera(dt);
      updateHUD();
    } else {
      // 待机：保持模型动画（围巾/水波），但不推进物理
      animateRider(0.016, elapsed);
      updateWorld(0.016, elapsed);
      updateParticles(0.016);
      if (!game.started) {
        // 开场环绕镜头（暂停时冻结，避免镜头跳变）
        camera.position.set(
          Math.sin(elapsed * 0.25) * 2.6,
          2.05 + Math.sin(elapsed * 0.35) * 0.10,
          game.z + 4.9
        );
        camera.lookAt(game.x, 1.12, game.z - 0.4);
      }
    }

    renderer.render(scene, camera);
  }

  /* =========================================================
     22. 开始 / 暂停
     ========================================================= */
  function startGame() {
    if (game.started) return;
    resetGame();
    game.started = true;
    game.paused = false;
    el.overlay.classList.add('hide');
    last = performance.now();
  }

  function togglePause() {
    if (!game.started) return;
    game.paused = !game.paused;
    if (game.paused) {
      el.overlay.classList.remove('hide');
      el.overlay.querySelector('.kicker').textContent = '已暂停 · 按 P 继续';
      el.overlay.querySelector('.go').textContent = '继续配送';
    } else {
      el.overlay.classList.add('hide');
      last = performance.now();
    }
  }

  document.getElementById('btnStart').addEventListener('click', function (e) {
    e.stopPropagation();
    if (game.paused) { togglePause(); return; }
    startGame();
  });

  // 初始化
  game.y = elev(0);
  game.z = 0;
  layoutCrates(0);
  updateHUD();

  // 首帧预热
  updateWorld(0.016, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);

})();
