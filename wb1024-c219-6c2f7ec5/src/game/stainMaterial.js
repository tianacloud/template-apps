// game/stainMaterial.js
// 写实污渍材质：在 MeshStandardMaterial 之上用 onBeforeCompile 注入「程序化噪声 + 类型纹理」，
// 让水雾/灰尘/指纹/油污/顽固渍/贴纸呈现真实质感（不规则软边、mottling、脊线、颗粒、油亮），
// 而非单纯色块。保留 coverage->opacity 的擦除逻辑：本模块只改 diffuseColor 的纹理与软边，
// 不改变「material.opacity 由 coverage 驱动」的既有契约，故 game/glass.js 的 syncStains 无需改动。
//
// 不使用 uv 属性（避免 USE_UV 未定义导致编译失败），改用局部 position 派生 uv（基础几何均为单位尺寸）。

import * as THREE from 'three';

// ---------- 真机兜底：写实 shader 保底 ----------
// 某些显卡/驱动可能编译失败我们的注入 GLSL。一旦失败，自动回退为「普通 MeshStandardMaterial」，
// 保证污渍仍可见、游戏不黑屏不崩溃。回退状态写入 localStorage，下次直接走普通材质；
// 也可用 URL 参数强制：?stain=plain 强制普通，?stain=fancy 强制写实（并清除回退标记）。
function readPlainFlag() {
  try {
    const u = new URLSearchParams(location.search).get('stain');
    if (u === 'plain') return true;
    if (u === 'fancy') { try { localStorage.removeItem('gq_plain_stains'); } catch (e) {} return false; }
    return localStorage.getItem('gq_plain_stains') === '1';
  } catch (e) { return false; }
}
let _usePlain = readPlainFlag();
export function getUsePlainStains() { return _usePlain; }
export function setUsePlainStains(v) {
  _usePlain = !!v;
  try {
    if (_usePlain) localStorage.setItem('gq_plain_stains', '1');
    else localStorage.removeItem('gq_plain_stains');
  } catch (e) { /* ignore */ }
}

// 污渍类型 -> 整数，供 shader 分支
export const STAIN_TYPE_ID = {
  mist: 0,
  dust: 1,
  fingerprint: 2,
  oil: 3,
  stubborn: 4,
  sticker: 5,
};

// 共享 GLSL 噪声（hash / value noise / fbm）
const NOISE_GLSL = `
float _hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float _vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = _hash(i);
  float b = _hash(i + vec2(1.0, 0.0));
  float c = _hash(i + vec2(0.0, 1.0));
  float d = _hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float _fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 4; k++){ v += a * _vnoise(p); p *= 2.0; a *= 0.5; }
  return v;
}
`;

// 创建一块污渍的材质。
// 参数：color(十六进制), type(字符串), seed(数字), shape('dot'|'block')
export function createStainMaterial({ color, type, seed = 0, shape = 'dot' }) {
  const base = {
    color: new THREE.Color(color),
    roughness: type === 'oil' ? 0.22 : (type === 'stubborn' ? 0.88 : (type === 'sticker' ? 0.55 : 0.6)),
    metalness: type === 'oil' ? 0.18 : 0.0,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide,
  };

  // 兜底：若已标记为「普通材质」（GPU 编译失败过 / URL 强制），直接返回普通标准材质。
  if (_usePlain) {
    const m = new THREE.MeshStandardMaterial(base);
    m.customProgramCacheKey = () => 'stain-mat-plain';
    return m;
  }

  const mat = new THREE.MeshStandardMaterial(base);

  const uniforms = {
    uSeed: { value: seed },
    uShape: { value: shape === 'block' ? 1 : 0 },
    uType: { value: STAIN_TYPE_ID[type] ?? 0 },
    uScale: { value: 5.5 + (Math.abs(seed) % 3) },
  };

  // 整段注入包在 try/catch 内：即便字符串替换/拼接在 JS 层出错，也只放弃写实纹理，
  // 退化为普通标准材质（仍可正常渲染），绝不抛错导致整块污渍黑屏。
  mat.onBeforeCompile = (shader) => {
    try {
      shader.uniforms.uSeed = uniforms.uSeed;
      shader.uniforms.uShape = uniforms.uShape;
      shader.uniforms.uType = uniforms.uType;
      shader.uniforms.uScale = uniforms.uScale;

      // 顶点：用局部 position 派生 uv（单位几何 -> 0..1），避免依赖 uv 属性
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vStainUv;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vStainUv = position.xy * 0.5 + 0.5;');

      // 片元：在 diffuseColor 计算后注入噪声纹理 + 不规则软边
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec2 vStainUv;\nuniform float uSeed;\nuniform float uShape;\nuniform int uType;\nuniform float uScale;\n' + NOISE_GLSL
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
  {
    vec2 p = vStainUv;
    float n = _fbm(p * uScale + uSeed);
    float n2 = _fbm(p * (uScale * 2.7) + uSeed * 1.7 + 5.0);
    float r = length(vStainUv - 0.5) * 2.0;
    // 软边：mist 更虚更柔，其余略实（noise 侵蚀边缘形成不规则轮廓）
    float edgeInner = (uType == 0) ? 0.50 : 0.80;
    float edgeOuter = (uType == 0) ? 1.02 : 1.0;
    float eroded = 1.0 - smoothstep(edgeInner - 0.18 * n, edgeOuter, r);
    float shapeMask = (uShape < 0.5) ? eroded : 1.0;
    // 各类型纹理
    float dens = 1.0;
    if (uType == 0) {            // mist 水雾：极淡、大块、柔边
      dens = mix(0.28, 0.85, n);
    } else if (uType == 1) {     // dust 灰尘：细密颗粒
      dens = mix(0.32, 1.0, n2) * (0.6 + 0.4 * step(0.45, n));
    } else if (uType == 2) {     // fingerprint 指纹：同心/螺旋脊线
      float ang = atan(p.y - 0.5, p.x - 0.5);
      float ridge = 0.5 + 0.5 * sin(r * 54.0 - ang * 2.5 + n * 7.0);
      dens = mix(0.42, 1.0, ridge);
    } else if (uType == 3) {     // oil 油污：暗而油亮
      dens = mix(0.28, 0.85, n);
    } else if (uType == 4) {     // stubborn 顽固渍：厚块、斑驳
      dens = mix(0.55, 1.0, n);
    } else {                     // sticker 贴纸：边缘清晰、略磨损
      float worn = smoothstep(0.0, 0.10, abs(r - 0.90));
      dens = 0.80 + 0.20 * n;
      shapeMask *= (0.55 + 0.45 * worn);
    }
    diffuseColor.a *= clamp(shapeMask * dens, 0.0, 1.0);
    diffuseColor.rgb *= mix(0.72, 1.12, n);
  }`
        );
    } catch (err) {
      console.warn('[stainMaterial] 写实 shader 注入在 JS 层失败，已退化为普通材质：', err);
    }
  };

  // 相同源码的程序缓存复用（seed/type/shape 走 uniform，不影响缓存键）。
  // 不同 roughness/metalness 仅是 uniform 差异，不影响程序缓存。
  mat.customProgramCacheKey = () => 'stain-mat-v1';

  mat.userData.uniforms = uniforms;
  return mat;
}
