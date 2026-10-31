import './style.css';
const sheet = document.createElement('link'); sheet.rel = 'stylesheet'; sheet.href = new URL('app.css', import.meta.url).href; document.head.appendChild(sheet);
document.body.innerHTML = "\n\n<canvas id=\"scene\"></canvas>\n<div class=\"vignette\"></div>\n<div class=\"speedwash\" id=\"wash\"></div>\n<div id=\"flash\"></div>\n\n<div class=\"ui\" id=\"ui\">\n  <div class=\"topbar\">\n    <div class=\"brand\"><span class=\"dot\"></span><span>Pelican Ride</span></div>\n    <div class=\"controls\">\n      <button class=\"chip view\" id=\"viewBtn\"><span class=\"vk\">V</span><span id=\"viewLabel\">第三人称</span></button>\n      <div class=\"scenes\">\n        <button class=\"chip active\" data-theme=\"sunset\">黄金时刻</button>\n        <button class=\"chip\" data-theme=\"neon\">霓虹夜行</button>\n        <button class=\"chip\" data-theme=\"aurora\">雪原极光</button>\n        <button class=\"chip\" data-theme=\"jungle\">雨林秘境</button>\n        <button class=\"chip\" data-theme=\"snowfield\">白昼雪原</button>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"speedo\">\n    <div class=\"val\"><span id=\"spd\">0</span><em>km/h</em></div>\n    <div class=\"bar\"><i id=\"bar\"></i></div>\n  </div>\n\n  <div class=\"hint\">\n    <kbd>←</kbd><kbd>→</kbd> 转向 <span class=\"sep\">·</span>\n    <kbd>↑</kbd><kbd>↓</kbd> 调速 <span class=\"sep\">·</span>\n    <kbd>空格</kbd> 刹车 <span class=\"sep\">·</span>\n    <kbd>V</kbd> 视角 <span class=\"sep\">·</span>\n    <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd><kbd>5</kbd> 场景\n  </div>\n</div>\n\n<div id=\"picker\">\n  <div class=\"picker-inner\">\n    <h1>鹈鹕<b>骑行</b></h1>\n    <p class=\"sub\">Choose your road</p>\n    <div class=\"cards\">\n      <button class=\"card\" data-theme=\"sunset\">\n        <div class=\"thumb t-sunset\"><i></i></div>\n        <div class=\"meta\"><b>黄金时刻</b><span>Desert Highway</span></div>\n      </button>\n      <button class=\"card\" data-theme=\"neon\">\n        <div class=\"thumb t-neon\"><i></i></div>\n        <div class=\"meta\"><b>霓虹夜行</b><span>Neon Boulevard</span></div>\n      </button>\n      <button class=\"card\" data-theme=\"aurora\">\n        <div class=\"thumb t-aurora\"><i></i></div>\n        <div class=\"meta\"><b>雪原极光</b><span>Frozen Aurora</span></div>\n      </button>\n      <button class=\"card\" data-theme=\"jungle\">\n        <div class=\"thumb t-jungle\"><i></i></div>\n        <div class=\"meta\"><b>雨林秘境</b><span>Rainforest</span></div>\n      </button>\n      <button class=\"card\" data-theme=\"snowfield\">\n        <div class=\"thumb t-snowfield\"><i></i></div>\n        <div class=\"meta\"><b>白昼雪原</b><span>Whiteout</span></div>\n      </button>\n    </div>\n    <p class=\"tip\">方向键操控 · 选定即刻出发</p>\n  </div>\n</div>\n\n<div id=\"loader\">\n  <div class=\"ring\"></div>\n  <p id=\"loadmsg\">装配中</p>\n</div>\n\n";

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* ============================================================
   0. 工具
   ============================================================ */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (cur, tgt, k, dt) => cur + (tgt - cur) * (1 - Math.exp(-k * dt));
const rnd = (a, b) => a + Math.random() * (b - a);
const UP = new THREE.Vector3(0, 1, 0);

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _c1 = new THREE.Color(), _c2 = new THREE.Color();

/* ============================================================
   1. 渲染器 / 场景 / 相机
   ============================================================ */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x3a2440, 55, 330);

const camera = new THREE.PerspectiveCamera(56, window.innerWidth / window.innerHeight, 0.1, 2600);
camera.position.set(0, 2.6, 12);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.42, 0.62, 0.86);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---- 环境反射贴图：金属材质必须有反射源，否则渲染为纯黑 ---- */
function buildEnvMap() {
  const w = 128, h = 64;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0.00, '#1b2650');
  g.addColorStop(0.40, '#5e4468');
  g.addColorStop(0.495, '#c47c56');
  g.addColorStop(0.515, '#3a2a28');
  g.addColorStop(1.00, '#100b0e');
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromEquirectangular(tex);
  tex.dispose();
  pmrem.dispose();
  return rt.texture;
}
scene.environment = buildEnvMap();

/* ============================================================
   2. 纹理工厂
   ============================================================ */
const TEX = {};

function glowTexture() {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.16, 'rgba(255,248,232,0.92)');
  g.addColorStop(0.38, 'rgba(255,198,140,0.34)');
  g.addColorStop(0.68, 'rgba(255,150,90,0.08)');
  g.addColorStop(1, 'rgba(255,140,90,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function dotTexture() {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.62)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roadTexture(laneColor, edgeColor, base) {
  const w = 512, h = 512, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = base || '#121319';
  x.fillRect(0, 0, w, h);

  // 沥青噪点
  const img = x.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 30;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);

  // 中央虚线（一段占 30%，其余空）
  x.fillStyle = laneColor;
  x.fillRect(w * 0.487, 0, w * 0.026, h * 0.30);
  // 两侧实线
  x.fillStyle = edgeColor;
  x.fillRect(w * 0.045, 0, w * 0.015, h);
  x.fillRect(w * 0.940, 0, w * 0.015, h);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 40);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

// 地面斑驳纹理：草地 / 雪地靠它才有细节，否则纯色平板一眼假
function groundTexture(base, specks, count) {
  const s = 256, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, s, s);
  for (let i = 0; i < count; i++) {
    x.fillStyle = specks[(Math.random() * specks.length) | 0];
    x.beginPath();
    x.arc(rnd(0, s), rnd(0, s), rnd(1.2, 6.5), 0, 6.283);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(70, 70);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function shadowTexture() {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.45, 'rgba(0,0,0,0.28)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  return t;
}

function rayTexture() {
  const w = 64, h = 256, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const img = x.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const vy = 1 - y / h;                  // 顶部 1 → 底部 0
    const fall = Math.pow(vy, 1.45);
    for (let i = 0; i < w; i++) {
      const nx = (i / (w - 1)) * 2 - 1;
      const core = Math.pow(Math.max(0, 1 - nx * nx), 1.7);
      const o = (y * w + i) * 4;
      d[o] = 255; d[o + 1] = 255; d[o + 2] = 255;
      d[o + 3] = fall * core * 255;
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

TEX.glow = glowTexture();
TEX.dot = dotTexture();
TEX.shadow = shadowTexture();
TEX.ray = rayTexture();

/* ============================================================
   3. 主题定义
   ============================================================ */
const THEMES = {
  sunset: {
    accent: '#ff9a52',
    sky: { top: 0x0a1030, mid: 0x4a2656, low: 0xc44a54, hor: 0xffc27a },
    fog: { color: 0x9a4c46, near: 55, far: 320 },
    road: 0xffffff,
    ground: 0x6e5644,
    roadRough: 0.96,
    light: { sun: 0xffa55f, sunI: 3.4, fill: 0x6b86cc, fillI: 0.55, sky: 0x3b4a7a, gnd: 0x2a1a12, hemiI: 0.75 },
    disc: { color: 0xfff2d2, pos: [-13, 25, -336], size: 26, glow: 0xffb066, glowScale: 190 },
    discVisible: true,
    aurora: false,
    bloom: { strength: 0.40, threshold: 0.88 },
    props: 'palms',
    particles: { type: 'dust', count: 460, color: 0xffd7a4, size: 0.085 },
    lane: 'rgba(244,222,164,0.95)', edge: 'rgba(236,242,252,0.72)',
    key: 'sunset'
  },
  neon: {
    accent: '#ff3d9a',
    sky: { top: 0x03040c, mid: 0x150a2e, low: 0x50104e, hor: 0xa02a6a },
    fog: { color: 0x4a1440, near: 42, far: 275 },
    road: 0x8a94c8,
    ground: 0x12101a,
    roadRough: 0.55,
    light: { sun: 0xff5fa8, sunI: 1.5, fill: 0x4a7cff, fillI: 0.9, sky: 0x2a1a52, gnd: 0x0a0614, hemiI: 0.6 },
    disc: { color: 0xffe6f2, pos: [-30, 40, -350], size: 15, glow: 0xff4d9a, glowScale: 200 },
    discVisible: true,
    aurora: false,
    bloom: { strength: 0.42, threshold: 0.80 },
    props: 'city',
    particles: { type: 'dust', count: 520, color: 0x66e8ff, size: 0.07 },
    lane: 'rgba(126,232,255,0.85)', edge: 'rgba(255,96,190,0.5)',
    key: 'neon'
  },
  aurora: {
    accent: '#5ff0c0',
    sky: { top: 0x01040c, mid: 0x04121f, low: 0x123a48, hor: 0x9fc8da },
    fog: { color: 0x62889a, near: 58, far: 345 },
    road: 0xc6d6e6,
    ground: 0xc8dae6,
    roadRough: 0.65,
    light: { sun: 0x9fd8ff, sunI: 1.15, fill: 0x4060a0, fillI: 0.5, sky: 0x88c8e8, gnd: 0x8fa8bc, hemiI: 0.72 },
    disc: { color: 0xdceeff, pos: [30, 62, -352], size: 9, glow: 0xbfe4ff, glowScale: 95 },
    discVisible: true,
    aurora: true,
    bloom: { strength: 0.55, threshold: 0.72 },
    props: 'pines',
    particles: { type: 'snow', count: 900, color: 0xffffff, size: 0.075 },
    lane: 'rgba(212,232,248,0.5)', edge: 'rgba(200,220,240,0.3)',
    key: 'aurora'
  },
  jungle: {
    accent: '#9ec96a',
    // 阴天湿雾：没有可见太阳，靠天空球整体漫射
    sky: { top: 0x4a6b52, mid: 0x6e8f62, low: 0x93a878, hor: 0xc8d0ac },
    fog: { color: 0xa9bb8d, near: 18, far: 200 },
    road: 0xffffff,
    roadBase: '#3b3a31',
    ground: 0xffffff,
    groundTex: { base: '#46532e', specks: ['#4f5f33', '#3a4722', '#596b3c', '#33401d'], count: 1100 },
    roadRough: 0.95,
    light: { sun: 0xeaf2dc, sunI: 1.05, fill: 0x8aa878, fillI: 0.55, sky: 0xbcd0a8, gnd: 0x2a3218, hemiI: 1.55 },
    disc: { color: 0xffffff, pos: [0, 0, -260], size: 1, glow: 0xffffff, glowScale: 1 },
    discVisible: false,
    aurora: false,
    bloom: { strength: 0.08, threshold: 0.94 },
    exposure: 0.92,
    props: 'jungle',
    godrays: true,
    particles: { type: 'spore', count: 620, color: 0xe6f6c8, size: 0.07 },
    lane: 'rgba(206,214,168,0.30)', edge: 'rgba(196,206,172,0.20)',
    key: 'jungle'
  },
  snowfield: {
    accent: '#8fbfdc',
    // 阴天暴雪：全天均匀散射，不设太阳盘
    sky: { top: 0x9fb6c8, mid: 0xbcccd8, low: 0xd8e0e4, hor: 0xe8edee },
    fog: { color: 0xdce4e8, near: 15, far: 172 },
    road: 0xffffff,
    roadBase: '#74746f',
    ground: 0xffffff,
    groundTex: { base: '#e7edf0', specks: ['#e2eaef', '#edf3f6', '#dde6ec', '#f0f5f8'], count: 1600 },
    roadRough: 0.94,
    light: { sun: 0xeaf0f4, sunI: 0.9, fill: 0xb8cfe4, fillI: 0.7, sky: 0xe8f2f8, gnd: 0xd0dce4, hemiI: 1.55 },
    disc: { color: 0xffffff, pos: [0, 0, -300], size: 1, glow: 0xffffff, glowScale: 1 },
    discVisible: false,
    aurora: false,
    bloom: { strength: 0.06, threshold: 0.96 },
    exposure: 0.9,
    props: 'snowfield',
    particles: { type: 'blizzard', count: 1500, color: 0xffffff, size: 0.10, blend: 'normal' },
    lane: 'rgba(252,254,255,0.22)', edge: 'rgba(248,252,255,0.16)',
    key: 'snowfield'
  }
};

/* ============================================================
   4. 常驻世界：天空 / 地面 / 路面 / 灯光 / 相机架
   ============================================================ */
// ---- 天空穹顶 ----
const skyUniforms = {
  uTop: { value: new THREE.Color(0x0a1030) },
  uMid: { value: new THREE.Color(0x4a2656) },
  uLow: { value: new THREE.Color(0xc44a54) },
  uHor: { value: new THREE.Color(0xffc27a) }
};

const skyMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1400, 40, 26),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: skyUniforms,
    vertexShader: `
      varying vec3 vW;
      void main() {
        vW = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vW;
      uniform vec3 uTop, uMid, uLow, uHor;
      void main() {
        float h = normalize(vW).y;
        vec3 c = mix(uHor, uLow, smoothstep(-0.012, 0.085, h));
        c = mix(c, uMid, smoothstep(0.055, 0.30, h));
        c = mix(c, uTop, smoothstep(0.22, 0.78, h));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  })
);
skyMesh.renderOrder = -10;
scene.add(skyMesh);

// ---- 地面（沙地 / 雪地）----
const groundMat = new THREE.MeshStandardMaterial({ color: 0x1d1626, roughness: 1, metalness: 0 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.02, -400);
scene.add(ground);

// ---- 路面 ----
// 注意：material.color 与 map 是相乘关系，故 color 作为"主题色调乘数"使用
const roadMat = new THREE.MeshStandardMaterial({
  color: 0xffffff, roughness: 0.96, metalness: 0.05, map: roadTexture('rgba(244,222,164,0.95)', 'rgba(236,242,252,0.72)')
});
const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 760, 1, 1), roadMat);
road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -330);
scene.add(road);

// ---- 灯光 ----
const hemi = new THREE.HemisphereLight(0x3b4a7a, 0x2a1a12, 0.75);
scene.add(hemi);

const sunLight = new THREE.DirectionalLight(0xffa55f, 3.4);
sunLight.position.set(-26, 16, -120);
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x6b86cc, 0.55);
fillLight.position.set(6, 9, 22);
scene.add(fillLight);

const ambient = new THREE.AmbientLight(0x241a20, 1.1);
scene.add(ambient);

// 车头灯（挂在车上，见后文）

// ---- 假阴影 ----
const shadowGroup = new THREE.Group();
const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1.9, 3.4),
  new THREE.MeshBasicMaterial({ map: TEX.shadow, transparent: true, depthWrite: false, opacity: 0.85, toneMapped: false })
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = 0.015;
shadowGroup.add(shadowPlane);
scene.add(shadowGroup);

/* ============================================================
   5. 环境层（随主题重建）
   ============================================================ */
const envRoot = new THREE.Group();
scene.add(envRoot);
let env = {};

function disposeGroup(g) {
  while (g.children.length) {
    const c = g.children.pop();
    c.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
      }
    });
  }
}

/* ---------- 5.1 太阳盘 + 光晕 ---------- */
function buildSun(cfg, theme) {
  const g = new THREE.Group();
  if (cfg.discVisible) {
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(cfg.disc.size, 64),
      new THREE.MeshBasicMaterial({ color: cfg.disc.color, toneMapped: false, fog: false })
    );
    disc.position.fromArray(cfg.disc.pos);
    disc.userData.billboard = true;
    g.add(disc);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: TEX.glow, color: cfg.disc.glow, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false
    }));
    glow.scale.setScalar(cfg.disc.glowScale);
    glow.position.fromArray(cfg.disc.pos);
    g.add(glow);

    // 地平线光带
    if (cfg.disc.band !== false) {
      const band = new THREE.Sprite(new THREE.SpriteMaterial({
        map: TEX.glow, color: cfg.disc.glow, transparent: true, opacity: 0.55,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false
      }));
      band.scale.set(1000, 150, 1);
      band.position.set(cfg.disc.pos[0], cfg.disc.pos[1] * 0.32, cfg.disc.pos[2] - 14);
      g.add(band);
    }

    env.sunDisc = disc;
  }
  envRoot.add(g);
  return g;
}

/* ---------- 5.2 极光 ---------- */
function buildAurora() {
  const g = new THREE.Group();
  const palette = [
    [0x2bffb0, 0x0a7a5a],
    [0x39e8d8, 0x0a6a7a],
    [0x8a6bff, 0x2a1a6a],
    [0x38ffc8, 0x0a8060]
  ];
  for (let k = 0; k < 4; k++) {
    const geo = new THREE.PlaneGeometry(900, 230, 44, 1);
    const pos = geo.attributes.position;
    const ph = k * 1.7;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = Math.sin(x * 0.0125 + ph) * 34 + Math.sin(x * 0.031 + ph * 2.3) * 13;
      pos.setZ(i, z);
    }
    const cTop = new THREE.Color(palette[k][1]), cBot = new THREE.Color(palette[k][0]);
    const colors = new Float32Array(pos.count * 3);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);   // y: -115..115
      const t = clamp((y + 115) / 230, 0, 1);
      tmp.copy(cBot).lerp(cTop, Math.pow(t, 0.75));
      // 垂直光帘：横向正弦调制，避免整片均匀发色
      const curtain = 0.45 + 0.55 * Math.pow(Math.abs(Math.sin(x * 0.055 + ph * 2.1)), 0.7);
      // 底边淡出
      const fade = Math.min(1, (y + 115) / 95) * curtain;
      colors[i * 3] = tmp.r * fade;
      colors[i * 3 + 1] = tmp.g * fade;
      colors[i * 3 + 2] = tmp.b * fade;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.72,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      fog: false, toneMapped: false
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(rnd(-60, 60), 86 + k * 18, -400 - k * 12);
    m.rotation.z = rnd(-0.05, 0.05);
    m.userData.auroraPhase = rnd(0, 6.28);
    g.add(m);
  }
  envRoot.add(g);
  env.auroraGroup = g;
}

/* ---------- 5.3 树冠光柱（雨林） ---------- */
function buildGodRays() {
  const g = new THREE.Group();
  const cols = [0xeaffb8, 0xd6ffa4, 0xf8ffd4];
  for (let i = 0; i < 9; i++) {
    const h = rnd(22, 32);
    const w = rnd(3.2, 6.4);
    const mat = new THREE.MeshBasicMaterial({
      map: TEX.ray, color: cols[i % 3], transparent: true,
      opacity: rnd(0.022, 0.042),
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide, fog: false, toneMapped: false
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(rnd(-13, 13), h * 0.46, -rnd(2, 148));
    m.rotation.z = rnd(-0.34, 0.34);
    m.rotation.y = rnd(-0.5, 0.5);
    m.userData.phase = rnd(0, 6.28);
    m.userData.base = mat.opacity;
    m.renderOrder = 2;
    g.add(m);
  }
  envRoot.add(g);
  env.godrays = g;
}

/* ---------- 5.4 雨林远景树墙 ---------- */
// 雨林雾近，远山会被雾吃掉。用三层树冠团挡住地平线，才有"林海"而不是草原。
function buildJungleHorizon() {
  const g = new THREE.Group();
  const layers = [
    { z: -88, c: 0x2e4d22, n: 21, y0: 2.5, y1: 9, s: [5, 9] },
    { z: -114, c: 0x35562a, n: 17, y0: 4, y1: 13, s: [7, 12] },
    { z: -140, c: 0x3d6132, n: 14, y0: 6, y1: 17, s: [8, 14] }
  ];
  layers.forEach(L => {
    const mat = new THREE.MeshStandardMaterial({ color: L.c, roughness: 1, metalness: 0, flatShading: true });
    const geo = new THREE.SphereGeometry(1, 8, 6);
    for (let i = 0; i < L.n; i++) {
      const m = new THREE.Mesh(geo, mat);
      const x = -210 + (420 * i) / (L.n - 1) + rnd(-12, 12);
      m.position.set(x, rnd(L.y0, L.y1), L.z + rnd(-8, 8));
      const sc = rnd(L.s[0], L.s[1]);
      // 横向拉长，彼此叠成连续林冠线，而不是一颗颗圆球
      m.scale.set(sc * rnd(1.5, 2.3), sc * rnd(0.45, 0.8), sc * 0.55);
      g.add(m);
    }
  });
  envRoot.add(g);
}

/* ---------- 5.5 远山剪影 ---------- */
function buildRidge(z, baseY, amp, color, seed, opacity) {
  const W = 2000, N = 150;
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, -400);
  for (let i = 0; i <= N; i++) {
    const x = -W / 2 + (W * i) / N;
    const y = baseY
      + Math.sin(i * 0.19 + seed) * amp * 0.55
      + Math.sin(i * 0.062 + seed * 2.1) * amp
      + Math.sin(i * 0.47 + seed * 3.7) * amp * 0.16;
    shape.lineTo(x, y);
  }
  shape.lineTo(W / 2, -400);
  shape.closePath();
  const m = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, fog: false, toneMapped: false })
  );
  m.position.z = z;
  return m;
}

/* ---------- 5.4 路边装饰 ---------- */
const propMat = {};   // 每次重建都换新材质

function makePalm(x, z, s) {
  const g = new THREE.Group();
  const H = 3.4;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.20, H, 6, 1),
    new THREE.MeshStandardMaterial({ color: 0x241a26, roughness: 1, metalness: 0 })
  );
  trunk.position.y = H / 2;
  trunk.rotation.z = 0.05;
  g.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x12181e, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  const leafGeo = new THREE.SphereGeometry(1, 8, 5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rnd(-0.16, 0.16);
    const pivot = new THREE.Group();
    pivot.position.set(0, H - 0.08, 0);
    pivot.rotation.y = a;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(0.16, 0.05, rnd(1.0, 1.32));
    leaf.position.z = 0.92;
    leaf.rotation.x = rnd(0.44, 0.68);
    pivot.add(leaf);
    g.add(pivot);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, Math.PI * 2);
  return g;
}

function makeNeonPole(x, z, i) {
  const g = new THREE.Group();
  const h = rnd(2.2, 4.2);
  const cols = [0x00e5ff, 0xff3d9a, 0xffd166, 0x7c5cff];
  const c = cols[i % cols.length];

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, h, 6),
    new THREE.MeshBasicMaterial({ color: c, toneMapped: false, fog: false })
  );
  rod.position.y = h / 2;
  g.add(rod);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: TEX.glow, color: c, transparent: true, opacity: 0.34,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false
  }));
  halo.scale.setScalar(h * 0.42);
  halo.position.y = h * 0.6;
  g.add(halo);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.11, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0x14161f, roughness: 0.5, metalness: 0.8 })
  );
  base.position.y = 0.08;
  g.add(base);

  g.position.set(x, 0, z);
  return g;
}

function makeBuilding(x, z, i) {
  const w = rnd(3, 7), d = rnd(3, 7), h = rnd(9, 34);
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: 0x0c1020, roughness: 0.72, metalness: 0.35, emissive: 0x04060e, emissiveIntensity: 1 })
  );
  body.position.y = h / 2;
  g.add(body);

  // 竖向灯带
  const stripCols = [0x00c8e0, 0xff3d9a, 0x7c5cff, 0xffb347];
  const nStrip = 1 + (i % 2);
  for (let k = 0; k < nStrip; k++) {
    const sh = h * rnd(0.3, 0.75);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, sh, 0.09),
      new THREE.MeshBasicMaterial({ color: stripCols[(i + k) % 4], toneMapped: false, fog: false })
    );
    strip.position.set(
      (k === 0 ? -1 : 1) * (w / 2 + 0.02),
      rnd(sh / 2 + 1, h - sh / 2),
      rnd(-d / 3, d / 3)
    );
    g.add(strip);
  }
  g.position.set(x, 0, z);
  return g;
}

function makePine(x, z, s) {
  const g = new THREE.Group();
  const h = rnd(2.2, 4.4);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.12, h * 0.32, 6),
    new THREE.MeshStandardMaterial({ color: 0x1e2a30, roughness: 1 })
  );
  trunk.position.y = h * 0.16;
  g.add(trunk);

  const needle = new THREE.MeshStandardMaterial({ color: 0x0e2a2c, roughness: 1, metalness: 0 });
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xdceaf4, roughness: 0.85, metalness: 0 });

  for (let i = 0; i < 3; i++) {
    const t = i / 3;
    const r = 0.95 - t * 0.42;
    const ch = h * 0.34;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, ch, 7), needle);
    cone.position.y = h * 0.22 + i * h * 0.20 + ch / 2;
    g.add(cone);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.82, ch * 0.42, 7), snowMat);
    cap.position.y = cone.position.y + ch * 0.30;
    g.add(cap);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, 6.28);
  return g;
}

/* ---------- 5.5 雨林植被 ---------- */
function makeJungleTree(x, z, s) {
  const g = new THREE.Group();
  const H = rnd(7, 11);
  const r = rnd(0.17, 0.27);
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x4a4436, roughness: 0.95, metalness: 0 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1d4b23, roughness: 0.88, metalness: 0 });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r, H, 7, 1), barkMat);
  trunk.position.y = H / 2;
  g.add(trunk);

  // 板根
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + rnd(-0.25, 0.25);
    const root = new THREE.Mesh(new THREE.ConeGeometry(r * 1.0, rnd(1.2, 2.1), 4), barkMat);
    root.position.set(Math.cos(a) * r * 1.05, 0.55, Math.sin(a) * r * 1.05);
    root.rotation.z = Math.cos(a) * 0.3;
    root.rotation.x = -Math.sin(a) * 0.3;
    g.add(root);
  }

  // 树冠：七团互相叠合，收成一个饱满的伞盖
  const blobGeo = new THREE.SphereGeometry(1, 7, 5);
  for (let i = 0; i < 7; i++) {
    const a = rnd(0, 6.28);
    const rad = i === 0 ? 0 : rnd(0.2, 1.15);
    const blob = new THREE.Mesh(blobGeo, leafMat);
    blob.position.set(Math.cos(a) * rad, H + rnd(-0.6, 0.75), Math.sin(a) * rad * 0.9);
    blob.scale.set(rnd(2.4, 3.6), rnd(1.0, 1.9), rnd(2.4, 3.6));
    blob.rotation.y = a;
    g.add(blob);
  }

  // 中层横枝：只留粗枝，不挂叶团，避免出现悬空的小绿饼
  for (let i = 0; i < 2; i++) {
    const a = rnd(0, 6.28);
    const y = H * rnd(0.52, 0.78);
    const reach = rnd(0.7, 1.25);
    const p0 = new THREE.Vector3(0, y, 0);
    const p1 = new THREE.Vector3(Math.cos(a) * reach, y + rnd(0.5, 1.0), Math.sin(a) * reach);
    g.add(tubeBetween(p0, p1, r * 0.55, barkMat, 5));
  }

  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, 6.28);
  return g;
}

function makeFern(x, z, s) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x357a34, roughness: 0.9, metalness: 0 });
  const geo = new THREE.SphereGeometry(1, 6, 4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rnd(-0.2, 0.2);
    const pivot = new THREE.Group();
    pivot.rotation.y = a;
    const leaf = new THREE.Mesh(geo, mat);
    // 叶子从基部斜着向上抽出，而不是摊在地上
    leaf.position.set(0, rnd(0.34, 0.50), rnd(0.26, 0.40));
    leaf.scale.set(0.045, 0.095, 0.52);
    leaf.rotation.x = rnd(-1.20, -0.90);
    pivot.add(leaf);
    g.add(pivot);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, 6.28);
  return g;
}

function makeBigLeaf(x, z, s) {
  const g = new THREE.Group();
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3a6b28, roughness: 0.85 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x34742a, roughness: 0.8, side: THREE.DoubleSide });
  const leafGeo = new THREE.SphereGeometry(1, 8, 5);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + rnd(-0.3, 0.3);
    const h = rnd(0.9, 1.7);
    const pivot = new THREE.Group();
    pivot.rotation.y = a;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, h, 5), stemMat);
    stem.position.y = h / 2;
    pivot.add(stem);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(0.21, 0.020, 0.64);
    leaf.position.set(0, h * 0.95, 0.58);
    leaf.rotation.x = -0.28;
    pivot.add(leaf);
    g.add(pivot);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  return g;
}

function makeVine(x, z) {
  const g = new THREE.Group();
  const top = rnd(6.5, 10.5);
  const mat = new THREE.MeshStandardMaterial({ color: 0x24501f, roughness: 0.95 });
  const v = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.021, top - 1.4, 4), mat);
  v.position.y = (top + 1.4) / 2;
  g.add(v);
  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 5, 4), mat);
    leaf.scale.set(0.11, 0.012, 0.20);
    leaf.position.set(rnd(-0.1, 0.1), rnd(2.0, top - 0.5), rnd(-0.1, 0.1));
    leaf.rotation.y = rnd(0, 6.28);
    g.add(leaf);
  }
  g.position.set(x, 0, z);
  return g;
}

/* ---------- 5.6 雪原构件 ---------- */
function makeDeadTree(x, z, s) {
  const g = new THREE.Group();
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x2a2b2c, roughness: 0.95 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf4f9fc, roughness: 0.72 });
  const H = rnd(3.4, 6.2);

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.135, H, 6), barkMat);
  trunk.position.y = H / 2;
  g.add(trunk);

  const nb = 3 + Math.floor(rnd(0, 2));
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + rnd(-0.45, 0.45);
    const y0 = H * rnd(0.44, 0.84);
    const len = rnd(0.8, 1.7) * (1 - y0 / (H * 1.7));
    const p0 = new THREE.Vector3(0, y0, 0);
    const p1 = new THREE.Vector3(Math.cos(a) * len, y0 + rnd(0.35, 0.85), Math.sin(a) * len);
    g.add(tubeBetween(p0, p1, 0.026, barkMat, 5));

    // 枝上积雪
    const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), capMat);
    cap.scale.set(0.085, 0.032, len * 0.46);
    cap.position.copy(p0).lerp(p1, 0.62);
    cap.position.y += 0.035;
    cap.rotation.y = Math.PI / 2 - a;
    g.add(cap);
  }

  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, 6.28);
  return g;
}

function makeIceShard(x, z, s) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe2f2fd, roughness: 0.06, metalness: 0.04,
    emissive: 0x9fd0ee, emissiveIntensity: 0.30,
    transparent: true, opacity: 0.9, flatShading: true
  });
  const n = 2 + Math.floor(rnd(0, 3));
  for (let i = 0; i < n; i++) {
    const h = rnd(0.5, 1.5);
    const shard = new THREE.Mesh(new THREE.ConeGeometry(rnd(0.08, 0.18), h, 5), mat);
    shard.position.set(rnd(-0.4, 0.4), h / 2 - 0.05, rnd(-0.4, 0.4));
    shard.rotation.z = rnd(-0.14, 0.14);
    shard.rotation.x = rnd(-0.10, 0.10);
    g.add(shard);
  }
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  return g;
}

function makeSnowDune(x, z, s) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xdfe9f0, roughness: 0.95, metalness: 0 });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), mat);
  m.scale.set(rnd(1.2, 2.4), rnd(0.5, 1.0), rnd(1.2, 2.4));
  m.position.y = -0.18;
  g.add(m);
  g.position.set(x, 0, z);
  g.scale.setScalar(s);
  g.rotation.y = rnd(0, 6.28);
  return g;
}

function buildProps(kind) {
  const g = new THREE.Group();

  if (kind === 'palms') {
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makePalm(side * rnd(6.4, 17), -rnd(0, 300) + 18, rnd(0.85, 1.5)));
    }
    // 路灯
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1;
      const pole = new THREE.Group();
      const h = 5.4;
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.075, h, 6),
        new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 0.85 })
      );
      p.position.y = h / 2;
      pole.add(p);
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.9, 5),
        new THREE.MeshStandardMaterial({ color: 0x1a1420, roughness: 0.85 })
      );
      arm.position.set(-side * 0.45, h, 0);
      arm.rotation.z = Math.PI / 2;
      pole.add(arm);
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false, fog: false })
      );
      bulb.position.set(-side * 0.9, h - 0.05, 0);
      pole.add(bulb);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: TEX.glow, color: 0xffc27a, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false
      }));
      halo.scale.setScalar(3.4);
      halo.position.copy(bulb.position);
      pole.add(halo);
      pole.position.set(side * 5.6, 0, -rnd(0, 300) + 15);
      g.add(pole);
    }
  }

  if (kind === 'city') {
    // 近景高楼（更密）
    for (let i = 0; i < 34; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeBuilding(side * rnd(9, 34), -rnd(0, 320) + 24, i));
    }
    // 霓虹柱
    for (let i = 0; i < 22; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeNeonPole(side * rnd(5.3, 6.6), -rnd(0, 300) + 20, i));
    }
  }

  if (kind === 'pines') {
    for (let i = 0; i < 34; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makePine(side * rnd(6.2, 20), -rnd(0, 320) + 20, rnd(0.8, 1.45)));
    }
    // 雪堆
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xe8f2fa, roughness: 0.9, metalness: 0 });
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), snowMat);
      m.scale.set(rnd(0.7, 1.6), rnd(0.10, 0.22), rnd(0.7, 1.6));
      m.position.set(side * rnd(4.8, 9), -0.02, -rnd(0, 300) + 18);
      g.add(m);
    }
  }

  if (kind === 'jungle') {
    // 密林树干：贴着路肩长，形成绿色隧道
    for (let i = 0; i < 30; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeJungleTree(side * rnd(5.4, 16), -rnd(0, 120) + 16, rnd(0.8, 1.35)));
    }
    // 地被：蕨类与大叶植物交替
    for (let i = 0; i < 36; i++) {
      const side = i % 2 ? 1 : -1;
      const zz = -rnd(0, 115) + 12;
      if (i % 2) g.add(makeFern(side * rnd(4.4, 10), zz, rnd(0.75, 1.4)));
      else g.add(makeBigLeaf(side * rnd(4.4, 9), zz, rnd(0.75, 1.3)));
    }
    // 垂藤
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeVine(side * rnd(4.8, 11), -rnd(0, 125) + 10));
    }
    // 路肩苔藓带，压住路面与地被的接缝
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3f6026, roughness: 1, metalness: 0 });
    for (let i = 0; i < 22; i++) {
      const side = i % 2 ? 1 : -1;
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), mossMat);
      m.scale.set(rnd(0.9, 2.2), rnd(0.08, 0.20), rnd(0.9, 2.2));
      m.position.set(side * rnd(4.7, 7.0), -0.02, -rnd(0, 130) + 12);
      g.add(m);
    }
  }

  if (kind === 'snowfield') {
    // 枯树：与极光场景的雪松区分开
    for (let i = 0; i < 24; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeDeadTree(side * rnd(5.4, 18), -rnd(0, 200) + 16, rnd(0.8, 1.3)));
    }
    // 冰晶簇
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeIceShard(side * rnd(4.5, 7.4), -rnd(0, 130) + 12, rnd(0.8, 1.5)));
    }
    // 雪丘：路肩堆雪，把公路切成一条深色带
    for (let i = 0; i < 28; i++) {
      const side = i % 2 ? 1 : -1;
      g.add(makeSnowDune(side * rnd(6.2, 13), -rnd(0, 180) + 14, rnd(0.6, 1.1)));
    }
    // 半埋的护栏桩
    const postMat = new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: 0.9 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf6fbfe, roughness: 0.75 });
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1;
      const h = rnd(0.55, 0.95);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, h, 5), postMat);
      post.position.set(side * rnd(4.3, 4.9), h / 2 - 0.14, -rnd(0, 190) + 15);
      g.add(post);
      const capTop = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4), capMat);
      capTop.scale.set(0.075, 0.038, 0.075);
      capTop.position.copy(post.position).setY(h - 0.14 + 0.02);
      g.add(capTop);
    }
  }

  envRoot.add(g);
  env.propsGroup = g;
}

/* ---------- 5.5 粒子 ---------- */
function buildParticles(cfg) {
  const n = cfg.count;
  const wide = cfg.type === 'blizzard';
  const high = cfg.type === 'snow' || cfg.type === 'blizzard';
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = wide ? rnd(-16, 16) : rnd(-13, 13);
    pos[i * 3 + 1] = rnd(0.05, high ? 16 : 7);
    pos[i * 3 + 2] = rnd(-95, 18);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: cfg.color,
    size: cfg.size,
    map: TEX.dot,
    transparent: true,
    opacity: high ? 0.9 : 0.7,
    blending: cfg.blend === 'normal' ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false,
    fog: false
  });

  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  envRoot.add(pts);
  env.particles = { mesh: pts, arr: pos, type: cfg.type, n };
}

/* ---------- 5.6 应用主题 ---------- */
function applyTheme(key) {
  const t = THEMES[key];
  if (!t) return;

  disposeGroup(envRoot);
  env = {};

  // 天空
  skyUniforms.uTop.value.setHex(t.sky.top);
  skyUniforms.uMid.value.setHex(t.sky.mid);
  skyUniforms.uLow.value.setHex(t.sky.low);
  skyUniforms.uHor.value.setHex(t.sky.hor);

  // 雾
  scene.fog.color.setHex(t.fog.color);
  scene.fog.near = t.fog.near;
  scene.fog.far = t.fog.far;

  // 地面 / 路面
  if (groundMat.map) {
    groundMat.map.dispose();
    groundMat.map = null;
  }
  if (t.groundTex) {
    groundMat.map = groundTexture(t.groundTex.base, t.groundTex.specks, t.groundTex.count || 900);
  }
  groundMat.needsUpdate = true;
  groundMat.color.setHex(t.ground);
  groundMat.roughness = t.key === 'aurora' ? 0.88 : t.key === 'snowfield' ? 0.78 : 1;
  roadMat.color.setHex(t.road);
  roadMat.roughness = t.roadRough;
  roadMat.metalness = t.key === 'neon' ? 0.22 : t.key === 'jungle' ? 0.02 : 0.05;

  // 路面标线随场景重绘：雪原被雪掩埋、雨林被苔藓吞掉
  if (t.lane && roadMat.map) {
    roadMat.map.dispose();
    roadMat.map = roadTexture(t.lane, t.edge, t.roadBase);
  }

  // 灯光
  sunLight.color.setHex(t.light.sun);
  sunLight.intensity = t.light.sunI;
  fillLight.color.setHex(t.light.fill);
  fillLight.intensity = t.light.fillI;
  hemi.color.setHex(t.light.sky);
  hemi.groundColor.setHex(t.light.gnd);
  hemi.intensity = t.light.hemiI;

  // 后处理
  bloom.strength = t.bloom.strength;
  bloom.threshold = t.bloom.threshold;
  renderer.toneMappingExposure = t.exposure !== undefined ? t.exposure : 1.02;

  // 太阳
  buildSun(t, key);

  // 山
  if (t.key === 'sunset') {
    envRoot.add(buildRidge(-360, 12, 26, 0x2b1a34, 1.4, 1));
    envRoot.add(buildRidge(-300, 6, 17, 0x1a1024, 4.1, 1));
  } else if (t.key === 'neon') {
    envRoot.add(buildRidge(-360, 8, 30, 0x150a22, 2.2, 1));
    envRoot.add(buildRidge(-305, 4, 16, 0x0b0514, 5.3, 1));
  } else if (t.key === 'aurora') {
    envRoot.add(buildRidge(-365, 20, 40, 0x8fb8cc, 0.7, 0.9));
    envRoot.add(buildRidge(-310, 8, 24, 0x6a94aa, 3.2, 0.95));
  } else if (t.key === 'jungle') {
    // 雾太近，远山会被吃掉；改用三层树冠团封住地平线
    buildJungleHorizon();
  } else if (t.key === 'snowfield') {
    envRoot.add(buildRidge(-185, 14, 40, 0xc6d8e2, 1.1, 1));
    envRoot.add(buildRidge(-148, 4, 22, 0xb6c9d5, 4.4, 1));
  }

  // 极光
  if (t.aurora) buildAurora();

  // 装饰
  buildProps(t.props);

  // 树冠光柱
  if (t.godrays) buildGodRays();

  // 粒子
  buildParticles(t.particles);

  // HUD 强调色
  document.documentElement.style.setProperty('--accent', t.accent);
  const rgb = new THREE.Color(t.accent);
  document.documentElement.style.setProperty('--accent-soft',
    `rgba(${Math.round(rgb.r * 255)},${Math.round(rgb.g * 255)},${Math.round(rgb.b * 255)},.16)`);

  // 白天场景压暗角，避免画面四周发黑像夜景
  const dayLit = t.key === 'jungle' || t.key === 'snowfield';
  document.documentElement.style.setProperty('--vig1', dayLit ? '0.12' : '0.42');
  document.documentElement.style.setProperty('--vig2', dayLit ? '0.26' : '0.72');

  // 车灯色温微调：白天场景关灯，否则地面会被光锥打出一块白斑
  if (headLight) {
    headLight.color.setHex(t.key === 'aurora' ? 0xfff0d8 : 0xffe2b8);
    headLight.intensity =
      t.key === 'sunset' ? 14 :
      t.key === 'neon' ? 13 :
      t.key === 'aurora' ? 26 : 0;
  }
  if (headBulbMat) headBulbMat.color.setHex(t.key === 'aurora' ? 0xfff4e0 : 0xffd9a0);
  // 白天场景把灯珠压成暗玻璃，避免小亮点被 bloom 拉成光球
  if (headBulbMat && (t.key === 'jungle' || t.key === 'snowfield')) headBulbMat.color.setHex(0x8a8478);

  currentTheme = key;

  // chip 状态
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.theme === key));
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.theme === key));

  // Chromium 在 :root 自定义属性变化后不一定重新解析 var(--accent)，
  // 会让高亮块停留在上一个主题的配色。这里同步强制一次子树样式重算——
  // 同一个任务内完成，不会产生可见闪烁。
  [document.getElementById('ui'), document.getElementById('picker')].forEach(el => {
    if (!el) return;
    el.style.display = 'none';
    void el.offsetHeight;
    el.style.display = '';
  });
}

let currentTheme = 'sunset';

/* ============================================================
   6. 自行车
   ============================================================ */
const hero = new THREE.Group();       // 整车 + 鹈鹕
scene.add(hero);

const bike = new THREE.Group();
hero.add(bike);

const M = {
  frame: new THREE.MeshStandardMaterial({ color: 0x2b3040, roughness: 0.32, metalness: 0.92 }),
  frameHi: new THREE.MeshStandardMaterial({ color: 0xff9a52, roughness: 0.38, metalness: 0.4 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x16161c, roughness: 0.95, metalness: 0.0 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xc8ccd4, roughness: 0.28, metalness: 0.95 }),
  leather: new THREE.MeshStandardMaterial({ color: 0x3a2116, roughness: 0.55, metalness: 0.05 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x8f959f, roughness: 0.3, metalness: 1 })
};

const R_WHEEL = 0.40;

function tubeBetween(a, b, r, mat, seg = 8) {
  const dir = _v1.subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  return m;
}

function makeWheel() {
  const g = new THREE.Group();

  const tire = new THREE.Mesh(new THREE.TorusGeometry(R_WHEEL - 0.038, 0.042, 10, 40), M.tire);
  tire.rotation.y = Math.PI / 2;
  g.add(tire);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(R_WHEEL - 0.085, 0.014, 6, 40), M.rim);
  rim.rotation.y = Math.PI / 2;
  g.add(rim);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.085, 10), M.metal);
  hub.rotation.z = Math.PI / 2;
  g.add(hub);

  const spokeGeo = new THREE.CylinderGeometry(0.0055, 0.0055, (R_WHEEL - 0.085) * 2, 5);
  for (let i = 0; i < 10; i++) {
    const s = new THREE.Mesh(spokeGeo, M.metal);
    s.rotation.x = (i / 10) * Math.PI * 2;
    g.add(s);
  }
  return g;
}

// 后轮
const rearWheel = makeWheel();
rearWheel.position.set(0, R_WHEEL, 0.72);
bike.add(rearWheel);

// 前叉转向组（原点在前轮中心）
const steerPivot = new THREE.Group();
steerPivot.position.set(0, R_WHEEL, -0.70);
bike.add(steerPivot);

const frontWheel = makeWheel();
frontWheel.position.set(0, 0, 0);
steerPivot.add(frontWheel);

// 前叉
const forkL = tubeBetween(new THREE.Vector3(0.055, 0.02, 0), new THREE.Vector3(0.055, 0.32, 0.16), 0.018, M.frame);
const forkR = tubeBetween(new THREE.Vector3(-0.055, 0.02, 0), new THREE.Vector3(-0.055, 0.32, 0.16), 0.018, M.frame);
steerPivot.add(forkL, forkR);

/* ---- 车架几何基准点 ---- */
const P = {
  rearHub: new THREE.Vector3(0, R_WHEEL, 0.72),
  bb: new THREE.Vector3(0, 0.30, 0.10),          // 中轴
  seatTop: new THREE.Vector3(0, 0.86, 0.30),      // 座管顶
  headTop: new THREE.Vector3(0, 0.96, -0.44),     // 头管上
  headBot: new THREE.Vector3(0, 0.70, -0.50),     // 头管下
  frontHub: new THREE.Vector3(0, R_WHEEL, -0.70)
};

// 车架管
bike.add(tubeBetween(P.rearHub, P.bb, 0.022, M.frame));              // 后下叉
bike.add(tubeBetween(P.rearHub, P.seatTop, 0.020, M.frame));         // 后上叉
bike.add(tubeBetween(P.bb, P.seatTop, 0.028, M.frame));              // 立管
bike.add(tubeBetween(P.bb, P.headBot, 0.030, M.frame));              // 下管
bike.add(tubeBetween(P.seatTop, P.headTop, 0.026, M.frame));         // 上管
bike.add(tubeBetween(P.headBot, P.headTop, 0.032, M.frame));         // 头管

// 五通加强
const bbShell = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 10), M.frameHi);
bbShell.rotation.z = Math.PI / 2;
bbShell.position.copy(P.bb);
bike.add(bbShell);

// 座管 + 鞍座
const seatPost = tubeBetween(P.seatTop, new THREE.Vector3(0, 0.94, 0.32), 0.017, M.metal);
bike.add(seatPost);

const saddle = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10), M.leather);
saddle.scale.set(0.62, 0.34, 1.35);
saddle.position.set(0, 0.965, 0.30);
saddle.rotation.x = 0.06;
bike.add(saddle);

// 车把（挂在 steerPivot 坐标系：相对前轮中心）
const barGroup = new THREE.Group();
barGroup.position.set(0, P.headTop.y - R_WHEEL + 0.02, P.headTop.z + 0.70);
steerPivot.add(barGroup);

const stem = tubeBetween(
  new THREE.Vector3(0, 0, 0.02),
  new THREE.Vector3(0, 0.10, -0.06), 0.022, M.metal
);
barGroup.add(stem);

const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.56, 8), M.metal);
bar.rotation.z = Math.PI / 2;
bar.position.set(0, 0.10, -0.06);
barGroup.add(bar);

// 握把
const gripMat = new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.9 });
[-1, 1].forEach(s => {
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.12, 8), gripMat);
  grip.rotation.z = Math.PI / 2;
  grip.position.set(s * 0.25, 0.10, -0.06);
  barGroup.add(grip);
});

// 车头灯
const headBulbMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false });
const headBulb = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.06, 12), headBulbMat);
headBulb.rotation.x = Math.PI / 2;
headBulb.position.set(0, 0.10, -0.14);
barGroup.add(headBulb);

const headLight = new THREE.SpotLight(0xffe2b8, 24, 26, 0.30, 0.75, 1.4);
headLight.position.set(0, 1.06, -0.62);
headLight.target.position.set(0, 0.1, -8);
hero.add(headLight, headLight.target);

// 尾灯
const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a3c, toneMapped: false });
const tail = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), tailMat);
tail.position.set(0, 0.52, 0.80);
bike.add(tail);

// 曲柄组
const crankGroup = new THREE.Group();
crankGroup.position.copy(P.bb);
bike.add(crankGroup);

const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 24), M.metal);
chainring.rotation.z = Math.PI / 2;
chainring.position.x = 0.055;
crankGroup.add(chainring);

const CRANK_R = 0.16;
const crankArmGeo = new THREE.BoxGeometry(0.02, CRANK_R, 0.035);
const pedalGeo = new THREE.BoxGeometry(0.16, 0.022, 0.075);

const crankL = new THREE.Mesh(crankArmGeo, M.metal);
crankL.position.x = -0.055;
crankGroup.add(crankL);

const crankR = new THREE.Mesh(crankArmGeo, M.metal);
crankR.position.x = 0.055;
crankGroup.add(crankR);

const pedalL = new THREE.Mesh(pedalGeo, new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.85 }));
const pedalR = new THREE.Mesh(pedalGeo, pedalL.material);
bike.add(pedalL, pedalR);

/* ============================================================
   7. 鹈鹕
   ============================================================ */
const pelican = new THREE.Group();
hero.add(pelican);

const FEATHER = new THREE.MeshStandardMaterial({
  color: 0xfbf6ec, roughness: 0.82, metalness: 0.0,
  emissive: 0x3a2418, emissiveIntensity: 0.20
});
const BEAK = new THREE.MeshStandardMaterial({ color: 0xff9f43, roughness: 0.5, metalness: 0.05 });
const POUCH = new THREE.MeshStandardMaterial({ color: 0xffab52, roughness: 0.62, metalness: 0.02 });
const EYE = new THREE.MeshStandardMaterial({ color: 0x14100e, roughness: 0.22, metalness: 0.1 });
const EYE_HI = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
const LEG = new THREE.MeshStandardMaterial({ color: 0xff9d3c, roughness: 0.62 });
const DARK_F = new THREE.MeshStandardMaterial({ color: 0x24202a, roughness: 0.9 });

// ---- 身体 ----
const bodyPivot = new THREE.Group();      // 用于踩踏起伏
pelican.add(bodyPivot);

const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 26, 18), FEATHER);
body.scale.set(0.80, 0.92, 1.22);
body.position.set(0, 1.26, 0.10);
body.rotation.x = -0.16;
bodyPivot.add(body);

// 胸部
const chest = new THREE.Mesh(new THREE.SphereGeometry(0.30, 20, 14), FEATHER);
chest.scale.set(0.86, 0.94, 0.86);
chest.position.set(0, 1.30, -0.26);
bodyPivot.add(chest);

// ---- 脖子（S 形管）----
const neckCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 1.44, -0.14),
  new THREE.Vector3(0, 1.60, -0.24),
  new THREE.Vector3(0, 1.74, -0.34),
  new THREE.Vector3(0, 1.80, -0.48),
  new THREE.Vector3(0, 1.79, -0.58)
]);
const neck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 28, 0.097, 12, false), FEATHER);
bodyPivot.add(neck);

// ---- 头部（可轻微转动）----
const headGroup = new THREE.Group();
headGroup.position.set(0, 1.80, -0.60);
bodyPivot.add(headGroup);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 16), FEATHER);
head.scale.set(0.95, 1.0, 1.05);
headGroup.add(head);

// 喙：上颌
const beak = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.078, 0.56, 10), BEAK);
beak.rotation.x = -Math.PI / 2 + 0.14;
beak.scale.set(1.22, 1, 0.34);
beak.position.set(0, -0.035, -0.345);
headGroup.add(beak);

// 喙尖小钩
const hook = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), BEAK);
hook.scale.set(1.0, 0.85, 1.1);
hook.position.set(0, -0.075, -0.615);
headGroup.add(hook);

// 喉囊
const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), POUCH);
pouch.scale.set(0.52, 0.72, 1.55);
pouch.position.set(0, -0.135, -0.30);
headGroup.add(pouch);

// 眼睛
[-1, 1].forEach(s => {
  const ring = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 10), BEAK);
  ring.position.set(s * 0.115, 0.022, -0.055);
  headGroup.add(ring);

  const e = new THREE.Mesh(new THREE.SphereGeometry(0.033, 12, 10), EYE);
  e.position.set(s * 0.134, 0.024, -0.062);
  headGroup.add(e);

  const hi = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), EYE_HI);
  hi.position.set(s * 0.152, 0.042, -0.078);
  headGroup.add(hi);
});

// 头顶羽冠
for (let i = 0; i < 3; i++) {
  const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.10, 3, 6), FEATHER);
  f.position.set((i - 1) * 0.032, 0.16, 0.02);
  f.rotation.x = 0.55 + i * 0.08;
  f.rotation.z = (i - 1) * 0.22;
  headGroup.add(f);
}

// ---- 翅膀（两段式，抓住车把）----
const WING_SEG1 = 0.316, WING_SEG2 = 0.354;
const wingGeo1 = new THREE.CapsuleGeometry(0.072, WING_SEG1 - 0.144, 4, 10);
const wingGeo2 = new THREE.CapsuleGeometry(0.062, WING_SEG2 - 0.124, 4, 10);

const wingTips = [];
[-1, 1].forEach(s => {
  const shoulder = new THREE.Vector3(s * 0.24, 1.38, 0.02);
  const elbow = new THREE.Vector3(s * 0.44, 1.16, -0.22);
  const wrist = new THREE.Vector3(s * 0.27, 1.02, -0.52);

  const seg1 = new THREE.Mesh(wingGeo1, FEATHER);
  seg1.position.copy(shoulder).add(elbow).multiplyScalar(0.5);
  seg1.quaternion.setFromUnitVectors(UP, _v1.subVectors(elbow, shoulder).normalize());
  seg1.scale.set(1, WING_SEG1 / WING_SEG1, 1);
  pelican.add(seg1);

  const seg2 = new THREE.Mesh(wingGeo2, FEATHER);
  seg2.position.copy(elbow).add(wrist).multiplyScalar(0.5);
  seg2.quaternion.setFromUnitVectors(UP, _v1.subVectors(wrist, elbow).normalize());
  pelican.add(seg2);

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), FEATHER);
  joint.position.copy(elbow);
  pelican.add(joint);

  // 翅尖黑羽（向后飘）
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.20, 3, 6), DARK_F);
    f.position.set(s * (0.40 + i * 0.03), 1.16 - i * 0.035, -0.12 + i * 0.03);
    f.quaternion.setFromUnitVectors(UP, _v1.set(s * 0.18, -0.45, 1).normalize());
    pelican.add(f);
  }

  wingTips.push(wrist);
});

// ---- 尾羽 ----
for (let i = 0; i < 4; i++) {
  const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.030, 0.24, 3, 6), FEATHER);
  f.position.set((i - 1.5) * 0.07, 1.16, 0.52);
  f.quaternion.setFromUnitVectors(UP, _v1.set((i - 1.5) * 0.3, 0.5, 1).normalize());
  pelican.add(f);
}

/* ---- 腿（IK 驱动）---- */
const THIGH = 0.38, SHIN = 0.38;
const legGeo = new THREE.CapsuleGeometry(0.040, (THIGH - 0.08), 4, 10);

const hipL = { x: -0.13, y: 0.885, z: 0.16 };
const hipR = { x: 0.13, y: 0.885, z: 0.16 };

function makeLeg() {
  const thigh = new THREE.Mesh(legGeo, LEG);
  const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, SHIN - 0.068, 4, 10), LEG);
  const foot = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), LEG);
  foot.scale.set(1.25, 0.42, 1.75);
  const knee = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), LEG);
  bike.add(thigh, shin, foot, knee);
  return { thigh, shin, foot, knee };
}
const legL = makeLeg();
const legR = makeLeg();

/* ============================================================
   8. 状态 / 输入
   ============================================================ */
const state = {
  speed: 0,
  targetSpeed: 9.5,
  steer: 0,
  steerSmooth: 0,
  distance: 0,
  crank: 0,
  started: false,
  introT: 0
};

const keys = { up: false, down: false, left: false, right: false, brake: false };

// Preserve physical key codes; some keyboards supply only the logical key.
function inputCode(e) {
  if (e.code) return e.code;
  const key = e.key || '';
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(key)) return key;
  if (key === ' ' || key === 'Spacebar' || key === 'Space') return 'Space';
  if (/^[wasdv]$/i.test(key)) return 'Key' + key.toUpperCase();
  if (/^[1-5]$/.test(key)) return 'Digit' + key;
  return '';
}
window.addEventListener('keydown', e => {
  const code = inputCode(e);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) e.preventDefault();
  if (code === 'ArrowUp' || code === 'KeyW') keys.up = true;
  if (code === 'ArrowDown' || code === 'KeyS') keys.down = true;
  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = true;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = true;
  if (code === 'Space') keys.brake = true;
  if (code === 'Digit1') switchTheme('sunset');
  if (code === 'Digit2') switchTheme('neon');
  if (code === 'Digit3') switchTheme('aurora');
  if (code === 'Digit4') switchTheme('jungle');
  if (code === 'Digit5') switchTheme('snowfield');
  if (code === 'KeyV' && !e.repeat) toggleView();
  if (code === 'Escape' && state.started) openPicker();
});
window.addEventListener('keyup', e => {
  const code = inputCode(e);
  if (code === 'ArrowUp' || code === 'KeyW') keys.up = false;
  if (code === 'ArrowDown' || code === 'KeyS') keys.down = false;
  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = false;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = false;
  if (code === 'Space') keys.brake = false;
});

/* ============================================================
   9. 场景切换 / 选路 UI
   ============================================================ */
const picker = document.getElementById('picker');
const ui = document.getElementById('ui');
const loader = document.getElementById('loader');

let switching = false;
const flashEl = document.getElementById('flash');

function flashOut(peak) {
  flashEl.style.transition = 'opacity .14s ease-out';
  flashEl.style.opacity = String(peak);
  setTimeout(() => {
    flashEl.style.transition = 'opacity .62s ease-in';
    flashEl.style.opacity = '0';
  }, 150);
}

function switchTheme(key) {
  if (switching || !THEMES[key]) return;
  switching = true;
  flashOut(0.62);
  setTimeout(() => {
    applyTheme(key);
    setTimeout(() => { switching = false; }, 420);
  }, 150);
}

function startRide(key) {
  flashOut(0.9);
  applyTheme(key);
  picker.classList.remove('on');
  ui.classList.add('on');
  state.started = true;
  state.introT = 0;
  state.targetSpeed = 9.5;
  state.speed = 4;
}

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => startRide(card.dataset.theme));
});
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => switchTheme(chip.dataset.theme));
});

function openPicker() {
  picker.classList.add('on');
  ui.classList.remove('on');
}

/* ============================================================
   10. 动画循环
   ============================================================ */
const clock = new THREE.Clock();
const spdEl = document.getElementById('spd');
const barEl = document.getElementById('bar');
const washEl = document.getElementById('wash');

let time = 0;

/* ---- 视角状态 ---- */
const camThird = new THREE.Vector3(0, 4.6, 16);
const _eye = new THREE.Vector3();
const _lookThird = new THREE.Vector3();
const _lookFirst = new THREE.Vector3();
const _look = new THREE.Vector3();
let viewTarget = 0;   // 0 = 第三人称, 1 = 第一人称
let viewBlend = 0;

const viewBtn = document.getElementById('viewBtn');
const viewLabel = document.getElementById('viewLabel');

function toggleView() {
  viewTarget = viewTarget === 0 ? 1 : 0;
  viewLabel.textContent = viewTarget === 1 ? '第一人称' : '第三人称';
  viewBtn.classList.toggle('fp', viewTarget === 1);
}
viewBtn.addEventListener('click', toggleView);

function updateLeg(leg, hip, ped, side) {
  // 2D IK in (y,z)
  const dy = ped.y - hip.y, dz = ped.z - hip.z;
  let d = Math.hypot(dy, dz);
  d = Math.max(d, 0.0001);
  const maxd = THIGH + SHIN - 0.001;
  const dc = Math.min(d, maxd);
  const uy = dy / d, uz = dz / d;
  const a = (THIGH * THIGH - SHIN * SHIN + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(0, THIGH * THIGH - a * a));

  const py = -uz, pz = uy;
  const k1 = { y: hip.y + uy * a + py * h, z: hip.z + uz * a + pz * h };
  const k2 = { y: hip.y + uy * a - py * h, z: hip.z + uz * a - pz * h };
  const knee = k1.z < k2.z ? k1 : k2;

  const hipV = _v1.set(hip.x, hip.y, hip.z);
  const kneeV = _v2.set(hip.x, knee.y, knee.z);
  const pedV = _v3.set(side * 0.13, ped.y, ped.z);

  const t = leg.thigh;
  const dir1 = new THREE.Vector3().subVectors(kneeV, hipV);
  const len1 = dir1.length();
  t.position.copy(hipV).addScaledVector(dir1, 0.5);
  t.quaternion.setFromUnitVectors(UP, dir1.clone().normalize());
  t.scale.set(1, len1 / THIGH, 1);

  const s = leg.shin;
  const dir2 = new THREE.Vector3().subVectors(pedV, kneeV);
  const len2 = dir2.length();
  s.position.copy(kneeV).addScaledVector(dir2, 0.5);
  s.quaternion.setFromUnitVectors(UP, dir2.clone().normalize());
  s.scale.set(1, len2 / SHIN, 1);

  leg.knee.position.copy(kneeV);
  leg.foot.position.copy(pedV).add(new THREE.Vector3(0, 0.02, -0.05));
  leg.foot.rotation.x = 0.12;
}

function updateParticles(dt) {
  const p = env.particles;
  if (!p) return;
  const arr = p.arr;
  const n = p.n;

  if (p.type === 'snow') {
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      arr[i3 + 1] -= (0.9 + (i % 7) * 0.12) * dt * 2.2;
      arr[i3 + 2] += state.speed * dt * 0.55;
      arr[i3] += Math.sin(time * 0.9 + i) * 0.06 * dt * 6;
      if (arr[i3 + 1] < 0) { arr[i3 + 1] = 16; arr[i3] = rnd(-13, 13); }
      if (arr[i3 + 2] > 18) arr[i3 + 2] -= 110;
    }
  } else if (p.type === 'spore') {
    // 雨林孢子：缓慢飘浮，靠车的前进把它们推向镜头
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      arr[i3 + 2] += state.speed * dt * 0.85;
      arr[i3] += Math.sin(time * 0.85 + i * 1.7) * 0.55 * dt;
      arr[i3 + 1] += Math.cos(time * 0.62 + i * 1.1) * 0.42 * dt;
      if (arr[i3 + 1] < 0.12) arr[i3 + 1] = 0.12;
      if (arr[i3 + 1] > 6.5) arr[i3 + 1] = 6.5;
      if (arr[i3 + 2] > 18) {
        arr[i3 + 2] -= 108;
        arr[i3] = rnd(-13, 13);
        arr[i3 + 1] = rnd(0.15, 6.5);
      }
    }
  } else if (p.type === 'blizzard') {
    // 白昼暴雪：强侧风，几乎打横飞
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      arr[i3 + 1] -= (5.5 + (i % 5) * 0.8) * dt;
      arr[i3 + 2] += (state.speed * 0.9 + 4.5) * dt;
      arr[i3] += 2.6 * dt + Math.sin(time * 2.2 + i) * 0.4 * dt;
      if (arr[i3 + 1] < 0) { arr[i3 + 1] = 15; arr[i3] = rnd(-16, 16); }
      if (arr[i3 + 2] > 18) { arr[i3 + 2] -= 108; arr[i3] = rnd(-16, 16); }
      if (arr[i3] > 16) arr[i3] -= 32;
    }
  } else {
    const push = state.speed * dt * 1.55 + 1.6 * dt;
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      arr[i3 + 2] += push * (0.7 + (i % 5) * 0.14);
      arr[i3 + 1] += Math.sin(time * 1.6 + i * 0.7) * 0.22 * dt;
      if (arr[i3 + 2] > 18) {
        arr[i3 + 2] -= 112;
        arr[i3] = rnd(-13, 13);
        arr[i3 + 1] = rnd(0.05, 7);
      }
    }
  }
  p.mesh.geometry.attributes.position.needsUpdate = true;
}

function rollProps(dt) {
  const dz = state.speed * dt;
  const g = env.propsGroup;
  if (g) {
    for (let i = 0; i < g.children.length; i++) {
      const c = g.children[i];
      c.position.z += dz;
      if (c.position.z > 32) c.position.z -= 340;
    }
  }
  // 光柱：单独用较短的回收距离，避免飞得太远还看得见
  if (env.godrays) {
    for (let i = 0; i < env.godrays.children.length; i++) {
      const c = env.godrays.children[i];
      c.position.z += dz;
      if (c.position.z > 22) c.position.z -= 172;
    }
  }
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  time += dt;

  /* ---- 速度 ---- */
  let target = 9.5;
  if (keys.up) target = 23;
  if (keys.down) target = 2.2;
  if (keys.brake) target = 0;
  state.targetSpeed = target;
  state.speed = damp(state.speed, target, keys.brake ? 5.5 : 1.35, dt);

  /* ---- 转向 ---- */
  let steerInput = 0;
  if (keys.left) steerInput -= 1;
  if (keys.right) steerInput += 1;
  // 低速时转向更弱
  const steerAuthority = clamp(state.speed / 9, 0.35, 1);
  state.steerSmooth = damp(state.steerSmooth, steerInput, 4.2, dt);

  const lateral = state.steerSmooth * steerAuthority * state.speed * dt * 0.085;
  hero.position.x = clamp(hero.position.x + lateral, -3.4, 3.4);

  const steerAngle = state.steerSmooth * steerAuthority * 0.26;
  steerPivot.rotation.y = -steerAngle;

  hero.rotation.y = damp(hero.rotation.y, -state.steerSmooth * 0.30, 5, dt);
  hero.rotation.z = damp(hero.rotation.z, -state.steerSmooth * 0.26 - (state.speed / 23) * 0.02, 5, dt);

  /* ---- 前进里程 ---- */
  state.distance += state.speed * dt;

  // 路面纹理滚动
  const map = roadMat.map;
  map.offset.y = (map.offset.y + (state.speed * dt) / (760 / 40)) % 1;

  // 车轮
  const wheelSpin = (state.speed * dt) / R_WHEEL;
  rearWheel.rotation.x -= wheelSpin;
  frontWheel.rotation.x -= wheelSpin;

  // 曲柄
  state.crank -= (state.speed * dt) / R_WHEEL / 2.4;
  const ca = state.crank;

  // 曲柄臂：几何高度 = CRANK_R，中心置于中轴到踏板的中点
  crankL.position.set(-0.055, Math.cos(ca) * CRANK_R * 0.5, Math.sin(ca) * CRANK_R * 0.5);
  crankR.position.set(0.055, Math.cos(ca + Math.PI) * CRANK_R * 0.5, Math.sin(ca + Math.PI) * CRANK_R * 0.5);
  crankL.rotation.x = ca;
  crankR.rotation.x = ca + Math.PI;
  chainring.rotation.x = ca;

  const pedLY = P.bb.y + Math.cos(ca) * CRANK_R;
  const pedLZ = P.bb.z + Math.sin(ca) * CRANK_R;
  const pedRY = P.bb.y + Math.cos(ca + Math.PI) * CRANK_R;
  const pedRZ = P.bb.z + Math.sin(ca + Math.PI) * CRANK_R;

  pedalL.position.set(-0.115, pedLY, pedLZ);
  pedalR.position.set(0.115, pedRY, pedRZ);

  /* ---- 鹈鹕呼吸 / 踩踏起伏 ---- */
  const bob = Math.sin(ca * 2) * 0.016 + Math.sin(time * 1.6) * 0.006;
  bodyPivot.position.y = bob;
  bodyPivot.rotation.z = Math.sin(time * 1.1) * 0.012;
  bodyPivot.rotation.x = Math.sin(ca * 2 + 1) * 0.008;

  headGroup.rotation.y = damp(headGroup.rotation.y, -state.steerSmooth * 0.36, 5, dt);
  headGroup.rotation.x = Math.sin(time * 2.1) * 0.03 + (state.speed / 23) * 0.05;
  headGroup.rotation.z = damp(headGroup.rotation.z, state.steerSmooth * 0.12, 4, dt);

  /* ---- 腿 ---- */
  updateLeg(legL, hipL, { y: pedLY, z: pedLZ }, -1);
  updateLeg(legR, hipR, { y: pedRY, z: pedRZ }, 1);

  /* ---- 环境 ---- */
  rollProps(dt);
  updateParticles(dt);
  shadowGroup.position.set(hero.position.x, 0, hero.position.z);
  shadowGroup.rotation.y = hero.rotation.y;

  // 太阳朝相机
  if (env.sunDisc) env.sunDisc.lookAt(camera.position);

  // 极光漂浮
  if (env.auroraGroup) {
    env.auroraGroup.children.forEach((m, i) => {
      m.position.y = 86 + i * 18 + Math.sin(time * 0.28 + m.userData.auroraPhase) * 7;
      m.material.opacity = 0.60 + Math.sin(time * 0.42 + m.userData.auroraPhase) * 0.14;
    });
  }

  // 树冠光柱呼吸
  if (env.godrays) {
    env.godrays.children.forEach(m => {
      const pulse = 0.72 + Math.sin(time * 0.5 + m.userData.phase) * 0.28;
      m.material.opacity = m.userData.base * pulse;
    });
  }

  /* ---- 摄像机（第三人称 / 第一人称平滑插值） ---- */
  const speedK = clamp(state.speed / 23, 0, 1);
  state.introT += dt * 0.85;
  const ie = 1 - Math.pow(1 - clamp(state.introT, 0, 1), 3); // easeOutCubic

  // 第三人称跟随目标：略偏右后方，形成 3/4 视角，避免鹈鹕挡住整车
  const CAM_SIDE = 0.88;
  const back = 6.7 + speedK * 1.5 + (1 - ie) * 8.5;
  const height = 2.45 + speedK * 0.28 + (1 - ie) * 2.4;
  const shake = speedK * 0.008;

  camThird.x = damp(camThird.x, hero.position.x * 0.72 + CAM_SIDE + Math.sin(time * 21) * shake, 4.5, dt);
  camThird.y = damp(camThird.y, height + Math.sin(time * 17.3) * shake * 0.7, 3.6, dt);
  camThird.z = damp(camThird.z, back, 3.2, dt);

  _lookThird.set(hero.position.x * 0.55, 1.06 + (1 - ie) * 0.5, -2.6);

  // 第一人称：位于喙根上方，视线越过喙尖
  viewBlend = damp(viewBlend, viewTarget, 9, dt);
  const vb = viewBlend;

  hero.updateMatrix();
  hero.matrixWorld.copy(hero.matrix);

  _eye.set(0.0, 1.93 + Math.sin(ca * 2) * 0.010, -0.80);
  hero.localToWorld(_eye);
  _lookFirst.set(0.0, 1.50, -6.5);
  hero.localToWorld(_lookFirst);

  camera.position.copy(camThird).lerp(_eye, vb);
  _look.copy(_lookThird).lerp(_lookFirst, vb);

  // 第一人称保留车身侧倾，让转弯有重量感
  const roll = hero.rotation.z * 0.8 * vb;
  camera.up.set(Math.sin(roll), Math.cos(roll), 0).normalize();
  camera.lookAt(_look);

  const targetFov = (56 + speedK * 11) * (1 - vb) + 76 * vb;
  camera.fov = damp(camera.fov, targetFov, 6, dt);
  camera.updateProjectionMatrix();

  // 天空跟随相机（避免走出穹顶）
  skyMesh.position.copy(camera.position);

  /* ---- HUD ---- */
  const kmh = state.speed * 3.6;
  spdEl.textContent = Math.round(kmh);
  barEl.style.width = clamp((state.speed / 23) * 100, 0, 100) + '%';
  washEl.style.opacity = String(clamp((speedK - 0.45) * 0.9, 0, 0.55));

  composer.render();
}

/* ============================================================
   11. 启动
   ============================================================ */
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.resolution.set(w, h);
}
window.addEventListener('resize', onResize);

// 预览容器可重置页面内的演示状态。
window.addEventListener('pelican-preview-reset', () => {
  Object.assign(state, { speed: 6, targetSpeed: 9.5, steer: 0, steerSmooth: 0, distance: 0, crank: 0, started: false, introT: 0 });
  Object.keys(keys).forEach(key => { keys[key] = false; });
  viewTarget = 0; viewBlend = 0; viewLabel.textContent = '第三人称'; viewBtn.classList.remove('fp');
  switching = false; hero.position.set(0, 0, 0); applyTheme('sunset'); openPicker();
});

// 预置场景（供选路界面背景）
applyTheme('sunset');
hero.position.set(0, 0, 0);
state.speed = 6;

tick();

// 首帧后隐藏 loader，弹出选路
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    loader.classList.add('hide');
    setTimeout(() => {
      if (state.started) return;   // 用户抢先点了卡片，就别再弹出选路层
      picker.classList.add('on');
      document.querySelector('.card[data-theme="sunset"]').classList.add('sel');
    }, 380);
  });
});

// 兜底：模块加载失败提示
setTimeout(() => {
  if (!document.getElementById('loader').classList.contains('hide')) {
    document.getElementById('loadmsg').outerHTML =
      '<div class="err">场景加载失败，请检查浏览器是否支持 WebGL 后重试。</div>';
  }
}, 12000);
