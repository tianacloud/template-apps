// game/glass.js
// 玻璃：有厚度的立方体（体现体积感）+ 6 个隐形拾取面（承载可清理污渍）+ 金句 3D 立体字（贴前表面）。
// 金句初始即存在，被前表面的污渍遮挡；玩家擦净前表面污渍时，金句逐块显形（渐进式，不再一次性弹出）。
// 覆盖率数值由 wiper/game 维护，本类只负责按 coverage 调整污渍透明度。

import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import {
  PLANE_W, PLANE_H, GLASS_THICK, FACE_DIMS, FACE_FRONT, QUOTE_FACE,
} from '../level/generator.js';
import { STAIN_COLOR, coverageToAlpha } from '../level/stains.js';
import { createStainMaterial } from './stainMaterial.js';

const E = 0.001;        // 拾取面相对玻璃表面的微小外移，避免与玻璃体 z-fighting
const STAIN_EPS = 0.02; // 污渍相对所在拾取面的外移（贴在表面上）
const QUOTE_EPS = 0.008; // 金句相对前表面的外移（略低于污渍，确保污渍在其之上遮挡）

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// 高亮轮廓颜色（进度 > 90% 时点亮剩余污渍边缘，帮玩家找最后几处）
const HL_COLOR = 0xffa630;
const HL_THRESHOLD = 0.9; // 与 HUD 进度条「超过 90%」一致

// 4 种真实玻璃材质变体（MeshPhysicalMaterial + transmission：真实折射 + 反射）
// 不再用 opacity 近似透明，而是用 transmission/ior/thickness/attenuation 描述玻璃本身。
const VARIANTS = {
  clear: {
    transmission: 1.0, roughness: 0.04, ior: 1.5,
    thickness: 0.6, attenuationColor: 0xffffff, attenuationDistance: 6.0,
    clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 1.0,
  },
  frosted: {
    transmission: 1.0, roughness: 0.55, ior: 1.45,
    thickness: 0.6, attenuationColor: 0xeaf6ff, attenuationDistance: 3.0,
    clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.85,
  },
  tinted: {
    transmission: 0.97, roughness: 0.08, ior: 1.5,
    thickness: 0.9, attenuationColor: 0x5fae9b, attenuationDistance: 1.6,
    clearcoat: 0.7, clearcoatRoughness: 0.08, envMapIntensity: 1.0,
  },
  gradient: {
    transmission: 1.0, roughness: 0.06, ior: 1.5,
    thickness: 0.6, attenuationColor: 0xbfe0ff, attenuationDistance: 2.4,
    clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 1.0,
  },
};

// 6 个面的位置与朝向（local +Z 一律指向面外）。
// 关键：每面必须落在「玻璃立方体真实表面」上，否则污渍会嵌进玻璃内部无法操作。
// 玻璃是 BoxGeometry(PLANE_W, PLANE_H, GLASS_THICK)：
//   ±X 面（右/左）在 x=±PLANE_W/2，面尺寸 = GLASS_THICK × PLANE_H
//   ±Y 面（上/下）在 y=±PLANE_H/2，面尺寸 = PLANE_W × GLASS_THICK
//   ±Z 面（前/后）在 z=±GLASS_THICK/2，面尺寸 = PLANE_W × PLANE_H
const FACE_DEFS = [
  { face: 0, pos: [PLANE_W / 2 + E, 0, 0], rot: [0, Math.PI / 2, 0] },        // +X 右
  { face: 1, pos: [-(PLANE_W / 2 + E), 0, 0], rot: [0, -Math.PI / 2, 0] },   // -X 左
  { face: 2, pos: [0, PLANE_H / 2 + E, 0], rot: [-Math.PI / 2, 0, 0] },      // +Y 上
  { face: 3, pos: [0, -(PLANE_H / 2 + E), 0], rot: [Math.PI / 2, 0, 0] },    // -Y 下
  { face: 4, pos: [0, 0, GLASS_THICK / 2 + E], rot: [0, 0, 0] },             // +Z 前
  { face: 5, pos: [0, 0, -(GLASS_THICK / 2 + E)], rot: [0, Math.PI, 0] },    // -Z 后
];

export class GlassPane {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.boxMesh = null;
    this.pickPanels = []; // 6 个隐形拾取面（射线取 uv + 面）
    this.faceGroups = {}; // face -> 该面的拾取面 mesh（污渍/金句作为其子节点）
    this.stainMeshes = []; // 与 level.stains 同序
    this.stainOutlines = []; // 与 stainMeshes 同序：剩余污渍的高亮轮廓
    this.quoteMesh = null;
    this.glow = 0; // 通关时金句柔光脉冲
    this.highlight = false; // 进度 > 90% 时启用边缘高亮
    this._hlRingMat = null; // 点状污渍环形高亮材质（每关复用）
    this._hlLineMat = null; // 块状污渍描边材质（每关复用）
    this._hlTime = 0; // 高亮脉动计时
    this.level = null;
  }

  // 构建一关的可视对象。alreadyUnlocked=true 时污渍预清、金句直接完整可见。
  build(level, font, { alreadyUnlocked = false } = {}) {
    this.dispose();
    this.level = level;
    this.pickPanels = [];
    this.faceGroups = {};
    this.stainOutlines = [];
    this.quoteMesh = null;
    this.quoteOutline = null;
    this.quoteOutlineMat = null;
    this.highlight = false;
    this._hlTime = 0;
    this._hlRingMat = null;
    this._hlLineMat = null;

    // --- 玻璃体（立方体，真实 transmission 折射/反射，体现厚度）---
    const v = VARIANTS[level.material] || VARIANTS.clear;
    const boxGeo = new THREE.BoxGeometry(PLANE_W, PLANE_H, GLASS_THICK, 1, 1, 1);
    const boxMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: v.roughness,
      transmission: v.transmission,   // 真实透光：光线穿过玻璃（折射）
      ior: v.ior,
      thickness: v.thickness,         // 体积厚度，影响衰减与折射强度
      attenuationColor: new THREE.Color(v.attenuationColor),
      attenuationDistance: v.attenuationDistance,
      clearcoat: v.clearcoat,         // 表面清漆层，增加「玻璃光泽」
      clearcoatRoughness: v.clearcoatRoughness,
      envMapIntensity: v.envMapIntensity,
      side: THREE.DoubleSide,
      // transmission 已接管「透明/折射」，无需 transparent/opacity；默认 depthWrite 开启，
      // 使前表面污渍(在其前方)正确通过深度测试叠在玻璃之上。
    });
    this.boxMesh = new THREE.Mesh(boxGeo, boxMat);
    this.boxMesh.renderOrder = 0;
    this.group.add(this.boxMesh);

    // 边框（让立方体轮廓在灰盒下可见）
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(boxGeo),
      new THREE.LineBasicMaterial({ color: 0x8fb6c4 })
    );
    edges.renderOrder = 2;
    this.group.add(edges);

    // --- 6 个隐形拾取面（visible:true 但 opacity 0，供射线取 uv + 面）---
    for (const d of FACE_DEFS) {
      const dims = FACE_DIMS[d.face];
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(dims.w, dims.h),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
      );
      panel.position.set(d.pos[0], d.pos[1], d.pos[2]);
      panel.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      panel.userData.face = d.face;
      panel.renderOrder = 5;
      this.group.add(panel);
      this.pickPanels.push(panel);
      this.faceGroups[d.face] = panel;
    }

    // --- 污渍（贴在各自所在面的表面）：dot=轻薄污点；block=附着在表面的 3D 块 ---
    // 材质统一用 createStainMaterial（写实噪声 shader），覆盖率仍由 coverageToAlpha 驱动 opacity。
    this.stainMeshes = level.stains.map((s, i) => {
      const dims = FACE_DIMS[s.face];
      const seed = (s.id + 1) * 1.37;
      const mat = createStainMaterial({
        color: STAIN_COLOR[s.type] || 0x999999,
        type: s.type,
        seed,
        shape: s.shape, // 'dot' | 'block'
      });
      mat.opacity = coverageToAlpha(s.coverage, s.threshold);
      let mesh;
      if (s.shape === 'block') {
        // 3D 块：带厚度的盒子，沿面法线（局部 +Z）向外凸起，像脏东西附着在玻璃上
        // depth 控制向外凸起的厚度；限制不太大以免明显超出玻璃体积感
        const depth = 0.05;
        const geo = new THREE.BoxGeometry(1, 1, 1);
        mesh = new THREE.Mesh(geo, mat);
        const sx = s.radius * dims.w * 1.4;
        const sy = s.radius * dims.h * 1.4;
        mesh.scale.set(sx, sy, depth);
        mesh.position.set((s.u - 0.5) * dims.w, (s.v - 0.5) * dims.h, depth / 2 + STAIN_EPS);
        mesh.renderOrder = (s.face === QUOTE_FACE) ? 8 : 7; // 3D 块在最上层
      } else {
        const geo = new THREE.CircleGeometry(1, 28);
        mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(s.radius * dims.w, s.radius * dims.h, 1);
        mesh.position.set((s.u - 0.5) * dims.w, (s.v - 0.5) * dims.h, STAIN_EPS);
        mesh.renderOrder = (s.face === QUOTE_FACE) ? 7 : 6;
      }
      this.faceGroups[s.face].add(mesh);
      return mesh;
    });

    // --- 高亮轮廓（默认隐藏；进度 > 90% 时点亮剩余污渍边缘，帮玩家找最后几处）---
    // 每关复用一份材质，避免上百块污渍各自创建材质的开销。
    this._hlRingMat = new THREE.MeshBasicMaterial({
      color: HL_COLOR, transparent: true, opacity: 0.9,
      depthWrite: false, depthTest: true, side: THREE.DoubleSide,
    });
    this._hlLineMat = new THREE.LineBasicMaterial({
      color: HL_COLOR, transparent: true, opacity: 0.9, depthWrite: false,
    });
    this.stainOutlines = level.stains.map((s, i) => {
      const mesh = this.stainMeshes[i];
      let outline;
      if (s.shape === 'block') {
        // 块状污渍：用边线框包裹整个 3D 块（随父级缩放自动贴合）
        outline = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
          this._hlLineMat
        );
      } else {
        // 点状污渍：紧贴污点外径的环形描边（略前移确保可见）
        outline = new THREE.Mesh(
          new THREE.RingGeometry(0.86, 1.02, 40),
          this._hlRingMat
        );
        outline.position.set(0, 0, 0.005);
      }
      outline.visible = false;
      outline.renderOrder = (s.face === QUOTE_FACE) ? 9 : (s.shape === 'block' ? 9 : 8);
      mesh.add(outline); // 作为污渍子节点：继承其位置/缩放，自动随面/尺寸贴合
      return outline;
    });

    // --- 金句 3D 立体字（贴前表面，初始即存在，被前表面污渍遮挡，随擦除逐步显形）---
    this._buildQuote(level.quote, font, alreadyUnlocked);
  }

  _buildQuote(text, font, alreadyUnlocked) {
    if (!font) return; // 字体未就绪则跳过（game 会在字体就绪后重建）

    // 美化：立体字 + 斜角（bevel），让字母有厚度与高光面，比平片更有质感。
    const geo = new TextGeometry(text, {
      font,
      size: 0.17,
      height: 0.045,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 2,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    geo.center();

    // 过长则整体缩放以适配前表面宽度（含 bevel 后的实际宽度已在 w 中）
    const dims = FACE_DIMS[QUOTE_FACE];
    const maxW = dims.w * 0.92;
    let scale = 1;
    if (w > maxW) scale = maxW / w;

    // 金句材质：暖金、略带金属光泽，随擦除逐步显形。
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf4cf6b,
      emissive: 0x6a4f15,
      emissiveIntensity: 0.3,
      roughness: 0.35,
      metalness: 0.25,
      side: THREE.DoubleSide, // 从背面也能看到金句
      transparent: true,
      opacity: alreadyUnlocked ? 1 : 0, // 初始完全透明（被污渍遮挡）；随前表面擦净进度显形
      depthWrite: false,
    });
    this.quoteMesh = new THREE.Mesh(geo, mat);
    this.quoteMesh.scale.setScalar(scale);
    this.quoteMesh.position.set(0, 0, QUOTE_EPS); // 略低于前表面污渍，确保被其遮挡
    this.quoteMesh.renderOrder = 4;
    this.faceGroups[QUOTE_FACE].add(this.quoteMesh);

    // 通关边缘高亮：把同一几何体放大一点点、用 BackSide 渲染，形成「描边光晕」，
    // 仅在世界擦净(100%)时由 revealQuote() 点亮并呼吸。
    this.quoteOutlineMat = new THREE.MeshBasicMaterial({
      color: 0xffe6a3,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.quoteOutline = new THREE.Mesh(geo, this.quoteOutlineMat);
    this.quoteOutline.scale.setScalar(1.05);
    this.quoteOutline.position.set(0, 0, -0.006); // 略退后，避免与字面 z-fighting
    this.quoteOutline.renderOrder = 3; // 先于金句绘制，仅露出外圈形成光晕
    this.quoteOutline.visible = false;
    this.quoteMesh.add(this.quoteOutline); // 作为子节点继承金句变换

    this.glow = 0;
  }

  // 每帧：根据各污渍 coverage 更新色块透明度；并驱动金句随「前表面擦净进度」逐渐显形
  syncStains(level) {
    // 整体进度（与 game.getProgress 同公式）：每块污渍 (100-coverage)/(100-threshold) 取均值。
    // 超过 HL_THRESHOLD(0.9) 时点亮剩余污渍边缘，与 HUD 进度条「>90%」保持一致。
    let psum = 0;
    for (const s of level.stains) {
      psum += clamp01((100 - s.coverage) / (100 - s.threshold));
    }
    const overall = level.stains.length ? psum / level.stains.length : 0;
    this.highlight = overall > HL_THRESHOLD;

    let frontTotal = 0, frontCleared = 0;
    for (let i = 0; i < this.stainMeshes.length; i++) {
      const s = level.stains[i];
      const mesh = this.stainMeshes[i];
      mesh.material.opacity = coverageToAlpha(s.coverage, s.threshold);
      // oil 润湿后略亮一点提示
      if (s.type === 'oil' && s.wet > 0) {
        mesh.material.opacity = Math.min(1, mesh.material.opacity * 0.7 + 0.15);
      }
      // 已清除则隐藏
      mesh.visible = s.coverage > s.threshold;
      // 进度 > 90% 时，仅对「尚未清除」的污渍显示高亮轮廓
      const remaining = s.coverage > s.threshold;
      if (this.stainOutlines[i]) this.stainOutlines[i].visible = this.highlight && remaining;
      // 统计前表面（金句面）的擦净进度
      if (s.face === QUOTE_FACE) {
        frontTotal++;
        if (s.coverage <= s.threshold) frontCleared++;
      }
    }
    // 金句透明度 = 前表面被擦净的比例；起步为 0（完全被遮挡），擦净全部前表面后整句浮现
    if (this.quoteMesh) {
      const frac = frontTotal > 0 ? frontCleared / frontTotal : 0;
      this.quoteMesh.material.opacity = Math.max(this.quoteMesh.material.opacity, frac);
    }
  }

  // 通关：金句柔光脉冲 + 边缘高亮光晕（金句此前已随擦除逐步显形，这里做收尾强调）
  revealQuote() {
    this.glow = 1;
    if (this.quoteOutline) this.quoteOutline.visible = true; // 100% 擦净才点亮边缘
  }

  update(dt) {
    if (this.quoteMesh && this.glow > 0) {
      this.glow = Math.max(0, this.glow - dt * 0.8);
      this.quoteMesh.material.emissiveIntensity = 0.3 + 0.6 * this.glow;
    }
    // 金句边缘光晕呼吸：仅在通关(100%)后可见
    if (this.quoteOutline && this.quoteOutline.visible) {
      this._hlTime += dt;
      this.quoteOutlineMat.opacity = 0.4 + 0.45 * (0.5 + 0.5 * Math.sin(this._hlTime * 3.0));
    }
    // 高亮轮廓脉动：进度 > 90% 时剩余污渍边缘做轻微呼吸闪烁，更易定位
    if (this.highlight && (this._hlRingMat || this._hlLineMat)) {
      this._hlTime += dt;
      const o = 0.55 + 0.45 * Math.sin(this._hlTime * 6);
      if (this._hlRingMat) this._hlRingMat.opacity = o;
      if (this._hlLineMat) this._hlLineMat.opacity = o;
    }
  }

  // 返回 6 个拾取面供射线拾取（取 uv + 面）
  getPickMeshes() {
    return this.pickPanels;
  }

  // 重置相机到正面用的参考尺寸
  getSize() {
    return { w: PLANE_W, h: PLANE_H };
  }

  _disposeObject(obj) {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  }

  dispose() {
    // 递归释放（含拾取面的子节点：污渍、金句）
    const disposeDeep = (node) => {
      for (const child of [...node.children]) {
        disposeDeep(child);
        node.remove(child);
        this._disposeObject(child);
      }
    };
    disposeDeep(this.group);
    this.boxMesh = null;
    this.pickPanels = [];
    this.faceGroups = {};
    this.stainMeshes = [];
    this.stainOutlines = [];
    this.quoteMesh = null;
    this.quoteOutline = null;
    this.quoteOutlineMat = null;
    this.highlight = false;
    this._hlRingMat = null;
    this._hlLineMat = null;
  }
}
