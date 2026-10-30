// game/game.js
// 游戏编排：装载关卡、驱动擦拭、判定完成、清洁剂卡、存档读写、对外回调。
// 不直接操作 DOM；通过 callbacks 通知 HUD。three 仅经由 GlassPane 间接使用。

import { generateLevel, PLANE_W, PLANE_H } from '../level/generator.js';
import { GlassPane } from './glass.js';
import { Wiper, isCleared } from './wiper.js';
import { playWipe } from './sound.js';
import { SaveStore } from '../core/save.js';
import {
  defaultState, currentDayIndex, isUnlocked, recordUnlock,
  dailyCheckIn, consumeCleanerCard, loadState, dayStatus,
} from '../core/progress.js';
import { localDateStr, parseDate } from '../core/date.js';

const AVG = (PLANE_W + PLANE_H) / 2;

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// dayIndex 对应的真实日历日期串（anchorDate + (dayIndex-1) 天）
export function dayDateString(state, dayIndex) {
  const base = parseDate(state.anchorDate);
  base.setDate(base.getDate() + (dayIndex - 1));
  return localDateStr(base);
}

export class Game {
  // scene: THREE.Scene；saveStore: SaveStore；font: 字体对象（可后补）
  // callbacks: { onProgress, onComplete, onToast, onState }
  constructor({ scene, saveStore, font = null, callbacks = {} }) {
    this.scene = scene;
    this.saveStore = saveStore || new SaveStore();
    this.font = font;
    this.callbacks = callbacks;

    this.glass = new GlassPane(scene);
    this.wiper = new Wiper();

    // 经由迁移编排读取（含 §5.3 顺序迁移 + §5.2 容错），并结构补全
    const loaded = loadState(this.saveStore);
    this.state = loaded.state;
    this.persist(); // 确保版本/结构最新写回

    this.level = null;
    this.makeup = false;
    this.completed = false;
    this.cardArmed = false;
    this._lastWvUv = null; // 擦拭音效用：记录上一帧 uv，判断指针是否移动
  }

  setFont(font) { this.font = font; }
  setTool(tool) { this.wiper.setTool(tool); }

  // 持久化（带配额容错）。写入失败则提示，不静默丢档。
  persist() {
    const ok = this.saveStore.safeWrite('glass365', this.state);
    if (!ok && this.callbacks.onToast) {
      this.callbacks.onToast('存档写入失败：存储空间不足');
    }
    return ok;
  }

  // ---- 关卡装载 ----
  loadDay(dayIndex, { makeup = false } = {}) {
    // F3 纵深防御：仅允许 1..365 且非 locked 的天进入，防止其它入口越权加载锁定天/越界天。
    if (!Number.isInteger(dayIndex) || dayIndex < 1 || dayIndex > 365) {
      if (this.callbacks.onToast) this.callbacks.onToast('该关卡不存在');
      return;
    }
    if (dayStatus(this.state, dayIndex) === 'locked') {
      if (this.callbacks.onToast) this.callbacks.onToast('该关卡尚未解锁');
      return;
    }
    this.makeup = makeup;
    const level = generateLevel(dayIndex);
    const unlocked = isUnlocked(this.state, dayIndex);
    if (unlocked) {
      for (const s of level.stains) { s.coverage = 0; s._wasCleared = true; }
    }
    this.level = level;
    this.completed = unlocked;
    this.cardArmed = false;
    this._lastWvUv = null;
    this.wiper.end();
    this.glass.build(level, this.font, { alreadyUnlocked: unlocked });
    this.glass.syncStains(level);
    if (this.callbacks.onProgress) this.callbacks.onProgress(this.getProgress());
    if (this.callbacks.onState) this.callbacks.onState(this.getHudState());
  }

  // ---- 擦拭（由控制器每帧调用）----
  beginWipe(uv, face) {
    if (this.completed) return;
    this._lastWvUv = null;
    this.wiper.begin(uv, this.wiper.tool, face);
  }

  tickWipe(uv, face, dt) {
    if (!this.level || this.completed) return;
    // 判断是否发生清洁动作：擦拭/刷子看 coverage 是否下降；喷水看指针是否移动（喷水本身是动作）
    const moved = !this._lastWvUv || Math.hypot(uv.u - this._lastWvUv.u, uv.v - this._lastWvUv.v) > 1e-4;
    this._lastWvUv = { u: uv.u, v: uv.v };
    let before = 0;
    for (const s of this.level.stains) before += s.coverage;
    const { hints, clearedNow } = this.wiper.tick(this.level.stains, uv, dt);
    let after = 0;
    for (const s of this.level.stains) after += s.coverage;
    const cleaned = after < before - 1e-6;
    const tool = this.wiper.tool;
    if ((tool !== 'spray' && cleaned) || (tool === 'spray' && moved)) {
      playWipe(tool); // 不同工具发出不同擦拭音效
    }
    this.glass.syncStains(this.level);
    if (hints.length && this.callbacks.onToast) this.callbacks.onToast(hints[0]);
    if (this.callbacks.onProgress) this.callbacks.onProgress(this.getProgress());
    if (this._allCleared()) this._completeLevel();
  }

  endWipe() {
    this._lastWvUv = null;
    this.wiper.end();
  }

  // ---- 清洁剂卡 ----
  toggleCard() {
    if (this.cardArmed) { this.cardArmed = false; this._emitCardArmed(); return false; }
    if (this.state.props.cleanerCards <= 0) {
      if (this.callbacks.onToast) this.callbacks.onToast('没有清洁剂卡了');
      return false;
    }
    this.cardArmed = true;
    if (this.callbacks.onToast) this.callbacks.onToast('点击一块污渍清除');
    this._emitCardArmed();
    return true;
  }

  _emitCardArmed() {
    if (this.callbacks.onCardArmed) this.callbacks.onCardArmed(this.cardArmed);
  }

  // 在 uv 处直接清除「同一面」最近的一块未清除污渍，库存 -1
  useCleanerCardAt(uv, face) {
    if (this.state.props.cleanerCards <= 0) {
      if (this.callbacks.onToast) this.callbacks.onToast('没有清洁剂卡了');
      return false;
    }
    if (!this.level) return false;
    let target = null, best = Infinity;
    for (const s of this.level.stains) {
      if (isCleared(s)) continue;
      if (face != null && s.face !== face) continue; // 只清同一面
      const fw = s.fw ?? PLANE_W;
      const fh = s.fh ?? PLANE_H;
      const sx = (s.u - uv.u) * fw;
      const sy = (s.v - uv.v) * fh;
      const d = Math.hypot(sx, sy);
      const brushW = this.wiper.brushWorldNow({ w: fw, h: fh });
      if (d < brushW + s.radius * (fw + fh) / 2 && d < best) { best = d; target = s; }
    }
    if (!target) {
      if (this.callbacks.onToast) this.callbacks.onToast('请点在某块污渍上');
      return false;
    }
    target.coverage = 0;
    target._wasCleared = true;
    consumeCleanerCard(this.state);
    this.persist();
    this.glass.syncStains(this.level);
    this.cardArmed = false;
    this._emitCardArmed();
    if (this.callbacks.onProgress) this.callbacks.onProgress(this.getProgress());
    if (this.callbacks.onState) this.callbacks.onState(this.getHudState());
    if (this._allCleared()) this._completeLevel();
    return true;
  }

  // ---- 完成判定 ----
  _allCleared() {
    if (!this.level) return false;
    return this.level.stains.every((s) => isCleared(s));
  }

  _completeLevel() {
    if (this.completed) return;
    const idx = this.level.dayIndex;
    const isToday = !this.makeup && idx === currentDayIndex(this.state);
    // 防御：quote 永不写 undefined（generateLevel 已封顶，这里再兜底）
    recordUnlock(this.state, idx, this.level.quote || '');
    let grantedCard = false;
    if (isToday) {
      const r = dailyCheckIn(this.state, localDateStr());
      grantedCard = r.grantedCard;
    }
    this.persist();
    this.completed = true;
    this.cardArmed = false;
    this.glass.revealQuote();
    if (this.callbacks.onComplete) {
      this.callbacks.onComplete({ dayIndex: idx, grantedCard, isToday });
    }
    if (this.callbacks.onState) this.callbacks.onState(this.getHudState());
  }

  // ---- 状态查询 ----
  getProgress() {
    if (!this.level || this.level.stains.length === 0) return this.completed ? 100 : 0;
    let sum = 0;
    for (const s of this.level.stains) {
      const p = clamp01((100 - s.coverage) / (100 - s.threshold));
      sum += p;
    }
    return Math.round((sum / this.level.stains.length) * 100);
  }

  getHudState() {
    const dayIndex = this.level ? this.level.dayIndex : currentDayIndex(this.state);
    return {
      dayIndex,
      dayDate: dayDateString(this.state, dayIndex),
      material: this.level ? this.level.material : 'clear',
      streak: this.state.streak.current,
      cards: this.state.props.cleanerCards,
      completed: this.completed,
    };
  }

  // 当前可玩的最大天数（今天），用于日历上限
  currentDayIndex() { return currentDayIndex(this.state); }

  // 重置「当前关」：重新生成同一确定性关卡，全部污渍回到满覆盖、金句重新遮挡，
  // completed 复位为 false，玩家可从头再擦直到通关。不改变存档（已通关记录保留）。
  resetLevel() {
    if (!this.level) return;
    const dayIndex = this.level.dayIndex;
    const makeup = this.makeup;
    const level = generateLevel(dayIndex); // 确定性同布局
    this.makeup = makeup;
    this.level = level;
    this.completed = false;
    this.cardArmed = false;
    this._lastWvUv = null;
    this.wiper.end();
    this.glass.build(level, this.font, { alreadyUnlocked: false }); // 金句初始透明、被遮挡
    this.glass.syncStains(level);
    if (this.callbacks.onProgress) this.callbacks.onProgress(this.getProgress());
    if (this.callbacks.onState) this.callbacks.onState(this.getHudState());
    if (this.callbacks.onToast) this.callbacks.onToast('已重置，可从头再擦');
  }

  // 重置存档（开发/测试用）
  resetSave() {
    this.saveStore.remove('glass365');
    this.state = defaultState(localDateStr());
    this.persist();
  }
}
