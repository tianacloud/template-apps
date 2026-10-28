// 低多边形模型工厂：全部用基础几何体拼装，平涂材质，不加载任何外部资源。

import * as THREE from '../../vendor/three.module.js';

const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cone4: new THREE.ConeGeometry(1, 1, 4),
  cone5: new THREE.ConeGeometry(1, 1, 5),
  cone6: new THREE.ConeGeometry(1, 1, 6),
  cyl6: new THREE.CylinderGeometry(1, 1, 1, 6),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),
  ico: new THREE.IcosahedronGeometry(1, 0),
  ico1: new THREE.IcosahedronGeometry(1, 1),
  sphere: new THREE.SphereGeometry(1, 7, 5),
  ring: new THREE.RingGeometry(0.92, 1, 40),
  disc: new THREE.CircleGeometry(1, 28),
};

for (const g of Object.values(GEO)) g.userData.shared = true;

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    const m = new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
    m.userData.shared = true;
    matCache.set(key, m);
  }
  return matCache.get(key);
}

function mesh(geo, color, sx, sy, sz, x, y, z, opts) {
  const m = new THREE.Mesh(geo, mat(color, opts));
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  return m;
}

/** 被定身时套在角色身上的冰壳：半透明冰块包住身体 + 冰棱 + 脚下冰环（几何/材质共用，反复施加也不漏） */
const ICE = {
  block: new THREE.BoxGeometry(1.05, 2.0, 1.0),
  block2: new THREE.BoxGeometry(0.85, 1.5, 0.85),
  shard: new THREE.ConeGeometry(0.22, 0.9, 5),
  ring: new THREE.RingGeometry(0.55, 1.02, 22),
  blockMat: new THREE.MeshLambertMaterial({
    color: '#a8e2ff', transparent: true, opacity: 0.28,
    emissive: '#2f7fb8', emissiveIntensity: 0.35, flatShading: true, depthWrite: false,
  }),
  shardMat: new THREE.MeshLambertMaterial({
    color: '#cdefff', transparent: true, opacity: 0.6,
    emissive: '#3f8fc8', emissiveIntensity: 0.5, flatShading: true, depthWrite: false,
  }),
  ringMat: new THREE.MeshBasicMaterial({
    color: '#bfe9ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false,
  }),
};
for (const v of Object.values(ICE)) v.userData.shared = true;

export function makeIceShell() {
  const g = new THREE.Group();
  const block = new THREE.Mesh(ICE.block, ICE.blockMat);
  block.position.y = 1.0;
  block.rotation.y = 0.35;
  block.rotation.z = 0.04;
  g.add(block);

  const block2 = new THREE.Mesh(ICE.block2, ICE.blockMat);
  block2.position.set(0.18, 1.15, -0.12);
  block2.rotation.y = -0.5;
  g.add(block2);

  const shards = [
    [0.52, 1.45, 0.12, 0.25, 0, 0.2],
    [-0.5, 0.85, -0.18, -0.35, 0, -0.25],
    [0.2, 2.0, -0.4, 0.15, 0, 0.35],
    [-0.28, 1.85, 0.38, -0.2, 0, -0.4],
    [0.0, 0.55, 0.52, 0.1, 0, 0.15],
  ];
  for (const [x, y, z, rz, ry, rx] of shards) {
    const m = new THREE.Mesh(ICE.shard, ICE.shardMat);
    m.position.set(x, y, z);
    m.rotation.set(rz, ry, rx);
    g.add(m);
  }

  const ring = new THREE.Mesh(ICE.ring, ICE.ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  g.add(ring);
  return g;
}

const BLOB_GEO = new THREE.CircleGeometry(1, 16);
BLOB_GEO.userData.shared = true;
const BLOB_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });
BLOB_MAT.userData.shared = true;

export function shadowBlob(radius = 0.6, color = 0x000000) {
  const m = new THREE.Mesh(BLOB_GEO, BLOB_MAT);
  m.scale.setScalar(radius);
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.03;
  m.userData.isShadow = true;
  return m;
}

// ---------------- 人形 ----------------
export function buildHumanoid({ color = '#8a7a5c', accent = '#c9a227', scale = 1, weapon = 'sword', hunch = 0, cape = false } = {}) {
  const g = new THREE.Group();
  const skin = '#c9a884';
  const dark = new THREE.Color(color).multiplyScalar(0.62).getStyle();

  const hips = mesh(GEO.box, dark, 0.5, 0.3, 0.34, 0, 0.78, 0);
  const torso = mesh(GEO.box, color, 0.62, 0.72, 0.38, 0, 1.24, 0);
  const chest = mesh(GEO.box, accent, 0.2, 0.46, 0.06, 0, 1.3, 0.2);
  const head = mesh(GEO.box, skin, 0.36, 0.36, 0.34, 0, 1.78, 0);
  const hair = mesh(GEO.box, dark, 0.4, 0.12, 0.38, 0, 1.96, -0.02);
  g.add(hips, torso, chest, head, hair);

  const padL = mesh(GEO.box, accent, 0.24, 0.18, 0.4, -0.4, 1.52, 0);
  const padR = mesh(GEO.box, accent, 0.24, 0.18, 0.4, 0.4, 1.52, 0);
  g.add(padL, padR);

  const armL = new THREE.Group();
  armL.position.set(-0.4, 1.46, 0);
  armL.add(mesh(GEO.box, color, 0.16, 0.58, 0.2, 0, -0.28, 0));
  armL.add(mesh(GEO.box, skin, 0.15, 0.15, 0.15, 0, -0.62, 0));
  const armR = new THREE.Group();
  armR.position.set(0.4, 1.46, 0);
  armR.add(mesh(GEO.box, color, 0.16, 0.58, 0.2, 0, -0.28, 0));
  armR.add(mesh(GEO.box, skin, 0.15, 0.15, 0.15, 0, -0.62, 0));
  g.add(armL, armR);

  const legL = new THREE.Group();
  legL.position.set(-0.17, 0.72, 0);
  legL.add(mesh(GEO.box, dark, 0.22, 0.66, 0.24, 0, -0.34, 0));
  const legR = new THREE.Group();
  legR.position.set(0.17, 0.72, 0);
  legR.add(mesh(GEO.box, dark, 0.22, 0.66, 0.24, 0, -0.34, 0));
  g.add(legL, legR);

  let wpn = null;
  if (weapon === 'sword') {
    wpn = new THREE.Group();
    wpn.add(mesh(GEO.box, '#8d9298', 0.08, 0.95, 0.14, 0, 0.45, 0));
    wpn.add(mesh(GEO.box, '#6b4a25', 0.1, 0.2, 0.1, 0, -0.06, 0));
    wpn.add(mesh(GEO.box, accent, 0.3, 0.06, 0.1, 0, 0.02, 0));
    wpn.position.set(0, -0.6, 0.05);
    armR.add(wpn);
  } else if (weapon === 'axe') {
    wpn = new THREE.Group();
    wpn.add(mesh(GEO.box, '#6b4a25', 0.08, 1.0, 0.08, 0, 0.4, 0));
    wpn.add(mesh(GEO.box, '#9aa0a6', 0.1, 0.42, 0.5, 0, 0.78, 0.16));
    wpn.position.set(0, -0.6, 0.05);
    armR.add(wpn);
  } else if (weapon === 'staff') {
    wpn = new THREE.Group();
    wpn.add(mesh(GEO.cyl6, '#6b4a25', 0.05, 1.35, 0.05, 0, 0.3, 0));
    wpn.add(mesh(GEO.ico, accent, 0.16, 0.16, 0.16, 0, 1.0, 0, { emissive: accent, emissiveIntensity: 0.6 }));
    wpn.position.set(0, -0.62, 0.06);
    armR.add(wpn);
  } else if (weapon === 'dagger') {
    wpn = new THREE.Group();
    wpn.add(mesh(GEO.box, '#b8bec4', 0.06, 0.45, 0.1, 0, 0.2, 0));
    wpn.position.set(0, -0.6, 0.05);
    armR.add(wpn);
  } else if (weapon === 'mace') {
    wpn = new THREE.Group();
    wpn.add(mesh(GEO.box, '#6b4a25', 0.08, 0.9, 0.08, 0, 0.35, 0));
    wpn.add(mesh(GEO.ico, accent, 0.18, 0.18, 0.18, 0, 0.82, 0));
    wpn.position.set(0, -0.6, 0.05);
    armR.add(wpn);
  }

  if (cape) {
    const c = mesh(GEO.box, accent, 0.56, 0.9, 0.06, 0, 1.25, -0.24);
    c.rotation.x = -0.08;
    g.add(c);
  }

  if (hunch) {
    torso.rotation.x = hunch;
    head.position.z += 0.12;
    head.position.y -= 0.05;
    armL.rotation.x = -hunch * 1.4;
    armR.rotation.x = -hunch * 1.4;
  }

  g.scale.setScalar(scale);
  return { group: g, parts: { legL, legR, armL, armR, head, torso, weapon: wpn } };
}

// ---------------- 怪物 ----------------
export function buildMonster(modelType, color, scale = 1) {
  const g = new THREE.Group();
  const dark = new THREE.Color(color).multiplyScalar(0.6).getStyle();
  const parts = {};

  if (modelType === 'beast') {
    g.add(mesh(GEO.box, color, 1.0, 0.72, 1.5, 0, 0.78, 0));
    g.add(mesh(GEO.box, dark, 0.62, 0.5, 0.5, 0, 0.86, 0.86));
    g.add(mesh(GEO.box, dark, 0.34, 0.16, 0.26, 0, 0.66, 1.08));
    g.add(mesh(GEO.cone4, '#e8e0c8', 0.05, 0.22, 0.05, -0.12, 0.74, 1.06));
    g.add(mesh(GEO.cone4, '#e8e0c8', 0.05, 0.22, 0.05, 0.12, 0.74, 1.06));
    for (const [x, z] of [[-0.34, 0.5], [0.34, 0.5], [-0.34, -0.5], [0.34, -0.5]]) {
      g.add(mesh(GEO.box, dark, 0.18, 0.55, 0.18, x, 0.28, z));
    }
    g.add(mesh(GEO.cone4, dark, 0.06, 0.3, 0.06, 0, 0.95, 1.02));
  } else if (modelType === 'wolf') {
    g.add(mesh(GEO.box, color, 0.68, 0.62, 1.5, 0, 0.95, 0));
    g.add(mesh(GEO.box, dark, 0.42, 0.4, 0.56, 0, 1.02, 0.84));
    g.add(mesh(GEO.box, dark, 0.24, 0.16, 0.3, 0, 0.92, 1.16));
    g.add(mesh(GEO.cone4, color, 0.1, 0.26, 0.1, -0.14, 1.24, 0.78));
    g.add(mesh(GEO.cone4, color, 0.1, 0.26, 0.1, 0.14, 1.24, 0.78));
    const tail = mesh(GEO.cone4, dark, 0.12, 0.7, 0.12, 0, 1.0, -0.9);
    tail.rotation.x = 0.9;
    g.add(tail);
    for (const [x, z] of [[-0.26, 0.5], [0.26, 0.5], [-0.26, -0.5], [0.26, -0.5]]) {
      g.add(mesh(GEO.box, dark, 0.16, 0.68, 0.16, x, 0.34, z));
    }
  } else if (modelType === 'spider') {
    g.add(mesh(GEO.ico, color, 0.9, 0.6, 1.05, 0, 0.85, -0.2));
    g.add(mesh(GEO.ico, dark, 0.42, 0.34, 0.42, 0, 0.8, 0.6));
    g.add(mesh(GEO.sphere, '#d8e04a', 0.06, 0.06, 0.06, -0.16, 0.9, 0.9, { emissive: '#d8e04a', emissiveIntensity: 1 }));
    g.add(mesh(GEO.sphere, '#d8e04a', 0.06, 0.06, 0.06, 0.16, 0.9, 0.9, { emissive: '#d8e04a', emissiveIntensity: 1 }));
    const legs = [];
    for (let i = 0; i < 4; i++) {
      for (const s of [-1, 1]) {
        const pivot = new THREE.Group();
        pivot.position.set(s * 0.45, 0.85, 0.45 - i * 0.32);
        const up = mesh(GEO.box, dark, 0.1, 0.5, 0.1, s * 0.28, 0.18, 0);
        up.rotation.z = -s * 0.9;
        const down = mesh(GEO.box, dark, 0.08, 0.55, 0.08, s * 0.55, -0.1, 0);
        down.rotation.z = -s * 0.35;
        pivot.add(up, down);
        g.add(pivot);
        legs.push(pivot);
      }
    }
    parts.legs = legs;
  } else if (modelType === 'lizard') {
    g.add(mesh(GEO.box, color, 0.9, 0.42, 1.5, 0, 0.55, 0));
    g.add(mesh(GEO.box, dark, 0.5, 0.34, 0.5, 0, 0.58, 0.86));
    for (let i = 0; i < 3; i++) {
      g.add(mesh(GEO.ico, dark, 0.2, 0.16, 0.2, 0, 0.85, 0.3 - i * 0.34));
    }
    g.add(mesh(GEO.cone4, dark, 0.18, 1.1, 0.18, 0, 0.5, -1.1, {}));
    for (const [x, z] of [[-0.42, 0.5], [0.42, 0.5], [-0.42, -0.5], [0.42, -0.5]]) {
      g.add(mesh(GEO.box, dark, 0.16, 0.42, 0.16, x, 0.22, z));
    }
  } else if (modelType === 'undead') {
    const h = buildHumanoid({ color, accent: '#7f8a6a', scale: 1.04, weapon: 'none', hunch: 0.28 });
    g.add(h.group);
    parts.legL = h.parts.legL; parts.legR = h.parts.legR;
    parts.armL = h.parts.armL; parts.armR = h.parts.armR;
    // 破布
    g.add(mesh(GEO.box, '#2f332b', 0.66, 0.4, 0.42, 0, 1.0, 0));
  } else if (modelType === 'construct') {
    g.add(mesh(GEO.box, color, 1.1, 1.2, 0.9, 0, 1.3, 0));
    g.add(mesh(GEO.box, dark, 0.7, 0.6, 0.5, 0, 1.95, 0.1));
    g.add(mesh(GEO.ico, '#ff7a3c', 0.18, 0.18, 0.18, 0, 1.42, 0.46, { emissive: '#ff7a3c', emissiveIntensity: 1.2 }));
    const armL = new THREE.Group(); armL.position.set(-0.72, 1.7, 0);
    armL.add(mesh(GEO.ico, dark, 0.34, 0.5, 0.34, 0, -0.45, 0));
    const armR = new THREE.Group(); armR.position.set(0.72, 1.7, 0);
    armR.add(mesh(GEO.ico, dark, 0.34, 0.5, 0.34, 0, -0.45, 0));
    g.add(armL, armR);
    parts.armL = armL; parts.armR = armR;
    for (const x of [-0.34, 0.34]) g.add(mesh(GEO.box, dark, 0.34, 0.75, 0.4, x, 0.38, 0));
  } else {
    // humanoid / boss
    const weapon = modelType === 'boss' ? 'axe' : 'sword';
    const h = buildHumanoid({ color, accent: '#b03a2e', scale: 1, weapon, cape: modelType === 'boss' });
    g.add(h.group);
    parts.legL = h.parts.legL; parts.legR = h.parts.legR;
    parts.armL = h.parts.armL; parts.armR = h.parts.armR;
    parts.head = h.parts.head;
    if (modelType === 'boss') {
      g.add(mesh(GEO.cone4, '#e6dcc0', 0.08, 0.38, 0.08, -0.16, 2.06, 0));
      g.add(mesh(GEO.cone4, '#e6dcc0', 0.08, 0.38, 0.08, 0.16, 2.06, 0));
      g.add(mesh(GEO.ico, '#a335ee', 0.14, 0.14, 0.14, 0, 1.5, 0.22, { emissive: '#a335ee', emissiveIntensity: 0.9 }));
    }
  }

  g.scale.setScalar(scale);
  g.add(shadowBlob(modelType === 'boss' ? 1.6 : 0.75));
  return { group: g, parts };
}

export function buildPlayerModel(classColor, weapon = 'sword') {
  const h = buildHumanoid({ color: '#43506b', accent: classColor, scale: 1, weapon, cape: true });
  h.group.add(shadowBlob(0.65));
  return h;
}

// ---------------- 场景道具 ----------------
export function makeTree(color) {
  const g = new THREE.Group();
  const trunk = mesh(GEO.cyl6, '#4b3a26', 0.18, 2.2, 0.18, 0, 1.1, 0);
  const c1 = mesh(GEO.cone5, color, 1.5, 1.9, 1.5, 0, 2.6, 0);
  const c2 = mesh(GEO.cone5, new THREE.Color(color).multiplyScalar(1.12).getStyle(), 1.1, 1.6, 1.1, 0, 3.7, 0);
  g.add(trunk, c1, c2);
  return g;
}

export function makeRock(color) {
  const m = mesh(GEO.ico, color, 1, 0.8, 1, 0, 0.4, 0);
  m.rotation.set(Math.random(), Math.random(), Math.random());
  const g = new THREE.Group();
  g.add(m);
  return g;
}

export function makeGrass(color) {
  const g = new THREE.Group();
  const m = mesh(GEO.cone4, color, 0.16, 0.5, 0.16, 0, 0.25, 0);
  g.add(m);
  return g;
}

export function makeBuilding(type, theme) {
  const g = new THREE.Group();
  const wood = '#5a4530';
  const stone = '#6d6a62';
  const cloth = '#8a6a45';
  const gold = theme.accent || '#c9a227';
  if (type === 'tower') {
    g.add(mesh(GEO.cyl8, stone, 2.0, 5.4, 2.0, 0, 2.7, 0));
    g.add(mesh(GEO.cyl8, '#57544d', 2.35, 0.5, 2.35, 0, 5.5, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      g.add(mesh(GEO.box, stone, 0.5, 0.9, 0.5, Math.cos(a) * 2.0, 6.0, Math.sin(a) * 2.0));
    }
    g.add(mesh(GEO.cone6, '#5f3b2e', 2.5, 1.8, 2.5, 0, 7.2, 0));
    g.add(mesh(GEO.box, gold, 0.1, 1.4, 0.1, 0, 8.6, 0));
    g.add(mesh(GEO.box, gold, 0.9, 0.5, 0.08, 0.45, 8.8, 0, { emissive: gold, emissiveIntensity: 0.4 }));
  } else if (type === 'house') {
    g.add(mesh(GEO.box, wood, 5.2, 3.2, 4.4, 0, 1.6, 0));
    g.add(mesh(GEO.cone4, '#6b3f2c', 4.4, 2.2, 3.8, 0, 4.2, 0)).rotation;
    const roof = g.children[g.children.length - 1];
    roof.rotation.y = Math.PI / 4;
    g.add(mesh(GEO.box, '#2f261c', 1.2, 2.0, 0.2, 0, 1.0, 2.22));
    g.add(mesh(GEO.box, gold, 5.3, 0.12, 4.5, 0, 3.2, 0, { emissive: gold, emissiveIntensity: 0.15 }));
  } else if (type === 'tent') {
    g.add(mesh(GEO.cone4, cloth, 2.6, 3.0, 2.6, 0, 1.5, 0));
    g.add(mesh(GEO.box, '#2f261c', 0.9, 1.4, 0.12, 0, 0.7, 1.5));
    g.add(mesh(GEO.box, gold, 2.62, 0.1, 2.62, 0, 2.0, 0, { emissive: gold, emissiveIntensity: 0.1 }));
  } else if (type === 'forge') {
    g.add(mesh(GEO.box, stone, 4.4, 2.4, 3.6, 0, 1.2, 0));
    g.add(mesh(GEO.cyl6, '#4a4038', 0.55, 3.2, 0.55, 1.2, 3.4, -0.8));
    g.add(mesh(GEO.box, '#2a2320', 1.8, 1.2, 0.2, 0, 1.0, 1.85));
    const fire = mesh(GEO.ico1, '#ff8a3c', 0.5, 0.4, 0.5, 0, 1.0, 1.75, { emissive: '#ff6a20', emissiveIntensity: 1.3 });
    g.add(fire);
    const light = new THREE.PointLight('#ff7a33', 1.4, 16, 2);
    light.position.set(0, 1.6, 2.2);
    g.add(light);
  } else if (type === 'wall') {
    g.add(mesh(GEO.box, stone, 6.0, 3.4, 1.6, 0, 1.7, 0));
    for (let i = -2; i <= 2; i++) g.add(mesh(GEO.box, '#5d5a52', 0.8, 0.8, 1.7, i * 1.2, 3.7, 0));
  } else if (type === 'well') {
    g.add(mesh(GEO.cyl8, stone, 1.4, 1.0, 1.4, 0, 0.5, 0));
    g.add(mesh(GEO.cyl8, '#1a2020', 1.05, 0.2, 1.05, 0, 1.0, 0));
    g.add(mesh(GEO.box, wood, 0.2, 2.0, 0.2, -1.1, 1.5, 0));
    g.add(mesh(GEO.box, wood, 0.2, 2.0, 0.2, 1.1, 1.5, 0));
    g.add(mesh(GEO.cone4, '#6b3f2c', 1.8, 1.0, 1.6, 0, 2.8, 0));
  }
  return g;
}

export function makePillar() {
  const g = new THREE.Group();
  g.add(mesh(GEO.cyl6, '#5b574d', 0.9, 4.6, 0.9, 0, 2.3, 0));
  g.add(mesh(GEO.box, '#6a6558', 2.2, 0.5, 2.2, 0, 4.7, 0));
  g.add(mesh(GEO.box, '#4e4a42', 2.4, 0.4, 2.4, 0, 0.2, 0));
  return g;
}

export function makeBell() {
  const g = new THREE.Group();
  g.add(mesh(GEO.box, '#4a4133', 0.6, 6.0, 0.6, -2.4, 3, 0));
  g.add(mesh(GEO.box, '#4a4133', 0.6, 6.0, 0.6, 2.4, 3, 0));
  g.add(mesh(GEO.box, '#4a4133', 5.4, 0.6, 0.6, 0, 6.0, 0));
  const bell = mesh(GEO.cone5, '#8a7d3a', 1.5, 2.4, 1.5, 0, 4.6, 0, { emissive: '#3a3418', emissiveIntensity: 0.4 });
  bell.rotation.x = Math.PI;
  g.add(bell);
  g.add(mesh(GEO.box, '#6b5f2c', 0.12, 0.9, 0.12, 0, 5.3, 0));
  return g;
}

export function makeLava() {
  const g = new THREE.Group();
  g.add(mesh(GEO.disc, '#ff5a1f', 2.2, 1, 2.2, 0, 0.06, 0, { emissive: '#ff4a10', emissiveIntensity: 1.1 }));
  g.children[0].rotation.x = -Math.PI / 2;
  return g;
}

export function makeAnvil() {
  const g = new THREE.Group();
  g.add(mesh(GEO.box, '#3a3a3e', 1.2, 0.5, 0.7, 0, 0.9, 0));
  g.add(mesh(GEO.box, '#2d2d31', 0.5, 0.7, 0.5, 0, 0.35, 0));
  g.add(mesh(GEO.box, '#3a3a3e', 0.5, 0.3, 0.9, 0, 0.9, 0.5));
  return g;
}

export function makeNpcMarker(color) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
  );
  g.add(m);
  // 竖直光柱：营地里一眼能看到哪个 NPC 有事
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 5.0, 6, 1, true),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.15,
      depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    })
  );
  beam.position.y = 0;
  g.add(beam);
  return g;
}

// ---------------- 地面预警 ----------------
const teleMatCache = new Map();
function teleMat(color, opacity) {
  const key = color + opacity;
  if (!teleMatCache.has(key)) {
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
    m.userData.shared = true;
    teleMatCache.set(key, m);
  }
  return teleMatCache.get(key);
}

export function makeTelegraph(radius, color = '#ff3b30') {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(GEO.ring, teleMat(color, 0.85));
  ring.rotation.x = -Math.PI / 2;
  ring.scale.setScalar(radius);
  ring.position.y = 0.06;
  const fill = new THREE.Mesh(GEO.disc, teleMat(color, 0.22));
  fill.rotation.x = -Math.PI / 2;
  fill.position.y = 0.05;
  fill.scale.setScalar(0.01);
  g.add(ring, fill);
  return { group: g, ring, fill, radius };
}

export { GEO };
