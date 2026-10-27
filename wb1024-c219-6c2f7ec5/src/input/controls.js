// input/controls.js
// 移动端统一 Pointer 事件 + OrbitControls（旋转/缩放）+ 射线拾取玻璃取 uv。
// 规则：单指命中玻璃 = 擦拭（并禁用轨道旋转）；单指背景 = 旋转；双指捏合 = 缩放。
// 清洁剂卡已「armed」时，单指命中玻璃 = 直接清除一块污渍。

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ControlsManager {
  // deps: { renderer, camera, game, glass, onRotating }
  constructor({ renderer, camera, game, glass, onRotating }) {
    this.renderer = renderer;
    this.dom = renderer.domElement;
    this.camera = camera;
    this.game = game;
    this.glass = glass;
    this.onRotating = onRotating || null; // 旋转模式按下/松开时通知（用于切换 grab/grabbing 指针）

    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();

    this.gesture = null; // 'wipe' | 'card' | null
    this.wipeUv = null; // {u,v}
    this.activePointer = null;
    this.mode = 'wipe'; // 'wipe' | 'rotate'：与擦拭行为完全分离的独立旋转 UI

    this._focus = null; // 通关时把相机平滑转到金句正视角：{ t, from, to, onDone }

    this._setupOrbit();
    this._bind();
    this.setMode('wipe');
  }

  _setupOrbit() {
    const controls = new OrbitControls(this.camera, this.dom);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = true; // 双指捏合 / 滚轮缩放，两种模式都可用
    controls.minDistance = 3.2;
    controls.maxDistance = 11;
    // 放宽方位/极角限制，让玩家可以旋转到 6 个面分别清理
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 0.8;
    controls.target.set(0, 0, 0);
    this.orbit = controls;
  }

  _bind() {
    // 捕获阶段：先于 OrbitControls 的冒泡监听执行，从而能在命中玻璃时及时禁用旋转
    this.dom.addEventListener('pointerdown', (e) => this._onDown(e), { capture: true });
    this.dom.addEventListener('pointermove', (e) => this._onMove(e), { capture: true });
    this.dom.addEventListener('pointerup', (e) => this._onUp(e), { capture: true });
    this.dom.addEventListener('pointercancel', (e) => this._onUp(e), { capture: true });
    this.dom.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _toNdc(e) {
    const rect = this.dom.getBoundingClientRect();
    this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  // 射线拾取 6 个拾取面，返回 {u, v, face} 或 null（face 由拾取面的 userData.face 决定）
  _pickUv() {
    const meshes = this.glass.getPickMeshes();
    if (!meshes || meshes.length === 0) return null;
    this.raycaster.setFromCamera(this.ndc, this.camera);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length && hits[0].uv) {
      return { u: hits[0].uv.x, v: hits[0].uv.y, face: hits[0].object.userData.face };
    }
    return null;
  }

  // 切换交互模式：'wipe'（拖动擦污渍）| 'rotate'（拖动旋转视角）。
  // 二者完全分离：rotate 模式把整个画布交给 OrbitControls；wipe 模式禁用轨道旋转、单指/鼠标只擦。
  setMode(mode) {
    this.mode = mode === 'rotate' ? 'rotate' : 'wipe';
    if (this.orbit) this.orbit.enableRotate = (this.mode === 'rotate');
  }

  _onDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // 仅主指针
    if (this.activePointer !== null) return; // 仅允许单指/单指针手势，避免多指冲突
    if (this.mode === 'rotate') {
      // 旋转模式：直接交给 OrbitControls；仅切换「抓取中」指针反馈
      if (this.onRotating) this.onRotating(true);
      return;
    }
    this._toNdc(e);
    const uv = this._pickUv();
    if (!uv) {
      // 背景：交给 OrbitControls 旋转/缩放，保持 enabled
      this.gesture = null;
      return;
    }
    // 命中玻璃：禁用轨道（捕获阶段先于 OrbitControls 生效）
    this.orbit.enabled = false;
    this.activePointer = e.pointerId;
    try { this.dom.setPointerCapture(e.pointerId); } catch (_) {}

    if (this.game.cardArmed) {
      this.game.useCleanerCardAt(uv, uv.face);
      this.gesture = 'card';
      this.wipeUv = null;
      return;
    }
    // 擦拭
    this.gesture = 'wipe';
    this.wipeUv = uv;
    this.game.beginWipe(uv, uv.face);
  }

  _onMove(e) {
    if (this.gesture !== 'wipe' || e.pointerId !== this.activePointer) return;
    this._toNdc(e);
    const uv = this._pickUv();
    if (uv) this.wipeUv = uv; // 未命中（移到边框外）则保留上次 uv
  }

  _onUp(e) {
    if (this.activePointer !== null && e.pointerId !== this.activePointer) return;
    if (this.mode === 'rotate') {
      if (this.onRotating) this.onRotating(false); // 结束抓取指针反馈
    }
    if (this.gesture === 'wipe') this.game.endWipe();
    this.gesture = null;
    this.wipeUv = null;
    this.activePointer = null;
    this.orbit.enabled = true; // 恢复轨道
    try { this.dom.releasePointerCapture(e.pointerId); } catch (_) {}
  }

  // 每帧：轨道阻尼更新 + 擦拭推进（即便指针静止也按 dt 推进，用于贴纸长按/打圈判定）
  update(dt) {
    if (this._focus && this._focus.active) {
      // 通关：相机平滑转到金句正视角（前表面 +Z 方向），期间禁用轨道以免争抢相机
      const f = this._focus;
      f.t = Math.min(1, f.t + dt / 0.8); // 0.8s 缓动到位
      const e = f.t < 0.5 ? 4 * f.t * f.t * f.t : 1 - Math.pow(-2 * f.t + 2, 3) / 2; // easeInOutCubic
      this.camera.position.lerpVectors(f.from, f.to, e);
      this.camera.lookAt(0, 0, 0);
      if (f.t >= 1) {
        f.active = false;
        if (this.orbit) {
          this.orbit.target.set(0, 0, 0);
          this.orbit.enabled = true;
          this.orbit.update(); // 读取当前相机位置，保持正视角、不产生回弹
        }
        if (f.onDone) f.onDone();
      }
      this._afterWipe(dt);
      return;
    }
    this.orbit.update();
    this._afterWipe(dt);
  }

  // 通关回调：把相机平滑旋转到金句正视角（前表面）。完成后通过 onDone 通知。
  focusFront(onDone) {
    this._focus = {
      active: true,
      t: 0,
      from: this.camera.position.clone(),
      to: new THREE.Vector3(0, 0, 6),
      onDone,
    };
    if (this.orbit) this.orbit.enabled = false; // 动画期间冻结用户轨道
  }

  _afterWipe(dt) {
    if (this.gesture === 'wipe' && this.wipeUv && !this.game.completed) {
      this.game.tickWipe(this.wipeUv, this.wipeUv.face, dt);
    }
  }

  resetView() {
    this.camera.position.set(0, 0, 6);
    this.orbit.target.set(0, 0, 0);
    this.orbit.update();
  }
}
