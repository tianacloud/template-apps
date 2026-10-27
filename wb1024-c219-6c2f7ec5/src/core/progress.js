// core/progress.js
// 纯逻辑：存档状态结构、连续登录/赠卡、通关解锁。无任何平台依赖（不直接碰 localStorage），
// 因此可在 node 下完整自测。状态结构与总设计案一致：
//   { version, anchorDate, unlocked:{dayIndex->{text,clearedAt}},
//     streak:{current,longest,lastCheckIn}, props:{cleanerCards}, settings:{sound,music,haptics} }

import { localDateStr, daysBetween } from './date.js';

export const SAVE_VERSION = 1;
export const MAX_CARDS = 10; // 清洁剂卡上限
export const CARD_EVERY = 3; // 连续登录每满 3 天赠 1 张

export function defaultState(anchorDate = localDateStr()) {
  return {
    version: SAVE_VERSION,
    anchorDate,
    unlocked: {},
    streak: { current: 0, longest: 0, lastCheckIn: null },
    props: { cleanerCards: 0 },
    settings: { sound: true, music: true, haptics: true },
  };
}

// 由 anchorDate 推算「今天」对应第几天（1-based）。封顶 365：本作是 365 天 finite 循环，
// 超出后「今天」停在第 365 天，避免 currentDayIndex 无限增长导致越界（F2 修复）。
export function currentDayIndex(state, todayStr = localDateStr()) {
  const d = daysBetween(state.anchorDate, todayStr) + 1;
  return Math.min(365, Math.max(1, d));
}

// 记录某天通关（写入 unlocked）。补卡与正常通关都调用它。
export function recordUnlock(state, dayIndex, text) {
  state.unlocked[dayIndex] = { text, clearedAt: Date.now() };
}

// 是否已通关
export function isUnlocked(state, dayIndex) {
  return !!state.unlocked[dayIndex];
}

// 每日打卡：推进连续登录、更新最长连击、每满 3 天赠清洁剂卡（上限 10）。
// 返回 { grantedCard:boolean, already:boolean, streak:number }
// 注意：同一天重复调用不会重复赠卡（靠 lastCheckIn 去重）。
export function dailyCheckIn(state, todayStr = localDateStr()) {
  const s = state.streak;
  if (s.lastCheckIn === todayStr) {
    return { grantedCard: false, already: true, streak: s.current };
  }
  if (s.lastCheckIn && s.lastCheckIn === yesterdayOf(todayStr)) {
    s.current += 1;
  } else {
    s.current = 1; // 首次或断签
  }
  if (s.current > s.longest) s.longest = s.current;

  let grantedCard = false;
  if (s.current > 0 && s.current % CARD_EVERY === 0) {
    if (state.props.cleanerCards < MAX_CARDS) {
      state.props.cleanerCards += 1;
      grantedCard = true;
    }
  }
  s.lastCheckIn = todayStr;
  return { grantedCard, already: false, streak: s.current };
}

function yesterdayOf(todayStr) {
  const d = new Date(todayStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

// 使用清洁剂卡：库存 -1（调用方需先确认库存 >0）。返回是否成功。
export function consumeCleanerCard(state) {
  if (state.props.cleanerCards <= 0) return false;
  state.props.cleanerCards -= 1;
  return true;
}

// 关卡可用性（用于日历）
// 返回 'today' | 'done' | 'makeup' | 'locked'
export function dayStatus(state, dayIndex, todayStr = localDateStr()) {
  const cur = currentDayIndex(state, todayStr);
  if (dayIndex > cur) return 'locked';
  if (isUnlocked(state, dayIndex)) return 'done';
  return dayIndex === cur ? 'today' : 'makeup';
}

// ---- 存档迁移编排（§5.3）----
// 顺序迁移链：读 -> 判定 version -> 按 MIGRATIONS 顺序 apply 到最新 -> 写回。
// 当前仅 v1；未来新增版本时在 MIGRATIONS 补 step(version): state=>nextState 即可，旧档不会变砖。
// 每个 step 必须：产出 version+1 的状态，且保持字段结构。
export const MIGRATIONS = {
  // 示例（未来启用）：
  // 1: (s) => ({ ...s, version: 2, /* 新字段/结构变更 */ }),
};

// 结构补全：防御缺字段（旧档/手写档），保证下游不崩
function normalizeState(s) {
  return {
    version: SAVE_VERSION,
    anchorDate: s.anchorDate || localDateStr(),
    unlocked: s.unlocked && typeof s.unlocked === 'object' ? s.unlocked : {},
    streak:
      s.streak && typeof s.streak === 'object'
        ? {
            current: s.streak.current | 0,
            longest: s.streak.longest | 0,
            lastCheckIn: s.streak.lastCheckIn || null,
          }
        : { current: 0, longest: 0, lastCheckIn: null },
    props: s.props && typeof s.props === 'object' ? { cleanerCards: s.props.cleanerCards | 0 } : { cleanerCards: 0 },
    settings:
      s.settings && typeof s.settings === 'object'
        ? { sound: !!s.settings.sound, music: !!s.settings.music, haptics: !!s.settings.haptics }
        : { sound: true, music: true, haptics: true },
  };
}

// 读取并迁移到最新版本。saveStore: SaveStore 实例。
// 返回 { state, migrated, reset }
//   reset=true 表示旧档无法迁移，已降级为新存档（避免旧档变砖）。
export function loadState(saveStore) {
  const raw = saveStore.read('glass365');
  if (!raw || typeof raw !== 'object') {
    return { state: defaultState(localDateStr()), migrated: false, reset: false };
  }
  let state = raw;
  let migrated = false;
  let guard = 0;
  while (typeof state.version === 'number' && state.version < SAVE_VERSION && guard < 64) {
    const step = MIGRATIONS[state.version];
    if (!step) break; // 无可用迁移步骤
    state = step(state);
    migrated = true;
    guard++;
  }
  if (state.version !== SAVE_VERSION) {
    // 无法迁移到最新版本：降级为全新存档（保留 anchorDate 当天仍从第1天起算）
    console.warn('[progress] 存档版本无法迁移，已重置为默认（旧档被放弃）');
    return { state: defaultState(localDateStr()), migrated: false, reset: true };
  }
  return { state: normalizeState(state), migrated };
}
