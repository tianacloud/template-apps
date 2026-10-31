// main.js —— 组合根（composition root）
// 组装渲染器/场景/相机/光照/字体/Game/Controls/HUD/Calendar，并启动主循环。
// 运行方式见 index.html 顶部注释：必须用静态服务器（npx serve / python -m http.server）。

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { Game } from './game/game.js';
import { ControlsManager } from './input/controls.js';
import { HUD } from './ui/hud.js';
import { Calendar } from './ui/calendar.js';
import { SaveStore } from './core/save.js';
import { localDateStr } from './core/date.js';
import { playChime, unlockAudio } from './game/sound.js';
import { cursorFor } from './ui/cursors.js';
import { openShareModal, sloganForDay } from './ui/share.js';
import { setUsePlainStains, getUsePlainStains } from './game/stainMaterial.js';
import { maybeShowTutorial } from './ui/tutorial.js';

export async function startGame(files) {
const saveStore = await SaveStore.open();

// ---------- 渲染器 / 场景 / 相机 ----------
const canvas = document.getElementById('scene'); // eslint-disable-line

// 鼠标指针形态：随「工具 / 模式 / 卡片」变化（自定义 SVG 指针，见 ui/cursors.js）
const uiCursorState = { mode: 'wipe', tool: 'wipe', cardArmed: false, rotating: false };
function refreshCursor() {
  if (!canvas) return;
  if (uiCursorState.mode === 'rotate') {
    canvas.style.cursor = uiCursorState.rotating ? 'grabbing' : 'grab';
    return;
  }
  if (uiCursorState.cardArmed) { canvas.style.cursor = cursorFor('card'); return; }
  canvas.style.cursor = cursorFor(uiCursorState.tool);
}

// 移动端 / 低端设备检测：粗指针（触屏）或窄屏视为移动端，降低渲染开销。
const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 820;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !IS_MOBILE,        // 移动端关闭 MSAA（与 transmission 叠加太贵）
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true,  // 通关后导出分享截图需要读取画布像素
});
// 移动端把像素比压到 1.25（transmission 折射需要在离屏缓冲重渲整场，降分辨率收益最大）；
// 桌面端仍给到 2 保清晰。
renderer.setPixelRatio(Math.min(IS_MOBILE ? 1.25 : 2, window.devicePixelRatio || 1));
renderer.setSize(window.innerWidth, window.innerHeight);
// 真实玻璃（transmission）需要更「电影感」的色调映射，否则高光发灰
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

// 写实污渍 shader 的真机兜底：若某设备 GPU 编译我们注入的 GLSL 失败，
// three.js 会触发此回调（此时默认错误日志已被接管）。我们持久化「普通材质」标记，
// 并立即重建当前关卡（用普通 MeshStandardMaterial），保证不黑屏、不崩溃。
renderer.debug.onShaderError = (gl, program, glVertexShader, glFragmentShader) => {
  const log =
    gl.getShaderInfoLog(glFragmentShader) ||
    gl.getShaderInfoLog(glVertexShader) ||
    gl.getProgramInfoLog(program) || '(no log)';
  console.error('[GlassQuest] 着色器编译失败，已自动回退普通污渍材质：', log);
  try {
    setUsePlainStains(true);
    const idx = game.level ? game.level.dayIndex : game.currentDayIndex();
    // 延后一帧重建，避开当前编译上下文
    setTimeout(() => {
      try { game.loadDay(idx, { makeup: game.makeup }); } catch (e) { console.warn(e); }
    }, 50);
  } catch (e) { console.warn('[GlassQuest] 回退重建失败', e); }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfe3f0);

// 程序化生成环境贴图（RoomEnvironment → PMREM），供玻璃折射/反射与 PBR 材质使用。
// 完全离线：不依赖任何外部 HDR 文件。
const pmrem = new THREE.PMREMGenerator(renderer);
const envTexture = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.environment = envTexture;

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

// 光照（玻璃/金句用 StandardMaterial，需要光）
scene.add(new THREE.AmbientLight(0xffffff, 0.95));

// 浏览器策略：音频需用户手势后才能播放。首次交互时解锁 AudioContext。
window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('click', unlockAudio, { once: true });
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(2, 3, 4);
scene.add(dir);
const fill = new THREE.DirectionalLight(0xffffff, 0.25);
fill.position.set(-3, -1, 2);
scene.add(fill);

// 启动前读取云端存档与本次安装的字体。
let font = null;
try {
  const response = await files.get('template-assets/fonts/helvetiker_regular.typeface.json');
  if (!response.ok) throw new Error('字体读取失败');
  font = new FontLoader().parse(await response.json());
} catch (error) {
  console.error(error);
  document.body.insertAdjacentHTML('beforeend', '<div role="alert" style="position:fixed;top:0;background:#fff;padding:12px;z-index:9999">字体读取失败，金句立体文字暂不可用。请刷新重试。</div>');
}

const game = new Game({
  scene,
  saveStore,
  font,
  callbacks: {
    onProgress: (p) => hud.setProgress(p),
    onComplete: (info) => {
      hud.showComplete(info);
      hud.update(game.getHudState());
      // 通关：金句平滑旋转至正视角 + 弹出通关音效
      controls.focusFront();
      playChime();
    },
    onToast: (m) => hud.showToast(m),
    onState: (s) => hud.update(s),
    onCardArmed: (armed) => {
      hud.setCardArmed(armed);
      // 使用清洁剂卡需要在擦拭模式下点污渍，若当前是旋转模式则切回擦拭
      if (armed) { controls.setMode('wipe'); hud.setModeUI('wipe'); }
    },
  },
});

const controls = new ControlsManager({
  renderer,
  camera,
  game,
  glass: game.glass,
  onRotating: (b) => { uiCursorState.rotating = b; refreshCursor(); },
});

const hud = new HUD({
  game,
  callbacks: {
    onOpenCalendar: () => calendar.open(),
    onResetView: () => controls.resetView(),
    onSetMode: (mode) => controls.setMode(mode),
    onCursor: ({ mode, tool, cardArmed } = {}) => {
      if (mode !== undefined) uiCursorState.mode = mode;
      if (tool !== undefined) uiCursorState.tool = tool;
      if (cardArmed !== undefined) uiCursorState.cardArmed = cardArmed;
      refreshCursor();
    },
    onResetLevel: () => {
      game.resetLevel();
      hud.update(game.getHudState());
    },
    onShare: () => {
      const lvl = game.level;
      const day = lvl ? lvl.dayIndex : game.currentDayIndex();
      const quote = lvl ? lvl.quote : '';
      const slogan = sloganForDay(day);
      openShareModal({ getShot: getScreenshot, day, quote, slogan });
    },
  },
});

// 导出当前 3D 画面为 PNG dataURL：临时把相机转正为正面（保证金句正向入镜），截完还原。
function getScreenshot() {
  const camPos = camera.position.clone();
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  camera.position.copy(camPos);
  camera.lookAt(0, 0, 0);
  return url;
}

const calendar = new Calendar({
  game,
  onSelectDay: (d, opts) => game.loadDay(d, opts),
  onResetSave: () => {
    game.resetSave();
    game.loadDay(game.currentDayIndex(), { makeup: false });
    hud.update(game.getHudState());
    hud.showToast('存档已重置');
  },
});

// ---------- 自适应 ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- 主循环 ----------
const clock = new THREE.Clock();
function animate() {
  const dt = Math.min(0.05, clock.getDelta()); // 限制 dt，避免切后台后跳变
  controls.update(dt);
  game.glass.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// ---------- 启动 ----------
(async function start() {
  const day = game.currentDayIndex();
  game.loadDay(day, { makeup: false });
  maybeShowTutorial(saveStore); // 首次进入展示新手引导（已看过则自动跳过）
  animate();
})();

}
