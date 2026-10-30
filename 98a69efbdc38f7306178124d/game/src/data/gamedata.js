// 数据层：读表 + 派生属性。所有游戏数值来自 data/*.json，这里只做计算。

export const DATA = {
  classes: {}, skills: {}, items: {}, itemsById: {}, sets: {}, monsters: {},
  quests: {}, zones: {}, dungeons: {}, companions: {}, talents: {},
};

const FILES = [
  ['classes', 'classes.json'], ['skills', 'skills.json'], ['items', 'items.json'],
  ['monsters', 'monsters.json'], ['quests', 'quests.json'], ['zones', 'zones.json'],
  ['dungeons', 'dungeons.json'], ['companions', 'companions.json'], ['talents', 'talents.json'],
];

export async function loadData() {
  const results = await Promise.all(
    FILES.map(async ([key, file]) => {
      const res = await window.__aizeFiles.get('template-assets/data/' + file);
      if (!res.ok) throw new Error(`载入 ${file} 失败：${res.status}`);
      return [key, await res.json()];
    })
  );
  for (const [key, json] of results) DATA[key] = json;
  DATA.sets = DATA.items.sets || {};
  DATA.itemsById = {};
  for (const it of DATA.items.items) DATA.itemsById[it.id] = it;
  DATA.classesById = DATA.classes;
  return DATA;
}

export const QUALITY = {
  common: { name: '普通', color: '#FFFFFF', mul: 1 },
  uncommon: { name: '优秀', color: '#1EFF00', mul: 1.35 },
  rare: { name: '精良', color: '#0070DD', mul: 1.9 },
  epic: { name: '史诗', color: '#A335EE', mul: 2.6 },
};

export const SLOTS = ['head', 'shoulder', 'chest', 'hand', 'leg', 'feet', 'mainhand', 'offhand', 'neck', 'ring1', 'ring2', 'trinket1', 'trinket2'];
export const SLOT_LABEL = {
  head: '头部', shoulder: '肩部', chest: '胸部', hand: '手部', leg: '腿部', feet: '脚部',
  mainhand: '主手', offhand: '副手', neck: '项链', ring1: '戒指', ring2: '戒指', trinket1: '饰品', trinket2: '饰品',
};

export function itemById(id) {
  return DATA.itemsById[id] || null;
}

/** 该物品应该放进哪个槽位（戒指/饰品有空位优先） */
export function slotForItem(item, equip) {
  if (item.slot === 'ring') return !equip.ring1 ? 'ring1' : !equip.ring2 ? 'ring2' : 'ring1';
  if (item.slot === 'trinket') return !equip.trinket1 ? 'trinket1' : !equip.trinket2 ? 'trinket2' : 'trinket1';
  return item.slot;
}

export function emptyEquip() {
  const e = {};
  for (const s of SLOTS) e[s] = null;
  return e;
}

export function talentMods(talents) {
  const out = { cdReduce: {}, skillDmg: {}, layer: [] };
  for (const id of talents || []) {
    if (!id) continue;
    for (const cls of Object.values(DATA.talents)) {
      const t = cls.find((x) => x.id === id);
      if (!t) continue;
      out.layer.push(t.name);
      for (const [k, v] of Object.entries(t.mods || {})) {
        if (k === 'cdReduce' || k === 'skillDmg') Object.assign(out[k], v);
        else if (typeof v === 'number') out[k] = (out[k] || 0) + v;
        else out[k] = v;
      }
    }
  }
  return out;
}

/** 玩家派生属性：基础属性 + 装备 + 套装 + 天赋 */
export function derivePlayer(player) {
  const cls = DATA.classes[player.classId];
  const lvl = player.level;
  const mods = talentMods(player.talent);

  const stats = { str: 0, agi: 0, int: 0, sta: 0 };
  for (const k of Object.keys(stats)) {
    stats[k] = Math.round(cls.base[k] + (cls.perLevel[k] || 0) * (lvl - 1));
  }

  let armor = 0, power = 0, gearCrit = 0, spMul = 0, apMul = 0, dmgMul = 0, critDmg = 0, dr = 0;
  const setCount = {};
  for (const slot of SLOTS) {
    const item = player.equip?.[slot];
    if (!item) continue;
    const def = itemById(item);
    if (!def) continue;
    armor += def.armor || 0;
    if (slot === 'mainhand') power = def.power || 0;
    for (const [k, v] of Object.entries(def.stats || {})) {
      if (k === 'crit') gearCrit += v;
      else if (k === 'armor') armor += v;
      else stats[k] = (stats[k] || 0) + v;
    }
    if (def.set) setCount[def.set] = (setCount[def.set] || 0) + 1;
  }
  for (const [setId, n] of Object.entries(setCount)) {
    const set = DATA.sets[setId];
    if (!set) continue;
    const apply = (b) => {
      for (const [k, v] of Object.entries(b || {})) {
        if (k === 'str' || k === 'agi' || k === 'int' || k === 'sta') stats[k] += v;
        else if (k === 'crit') gearCrit += v;
        else if (k === 'spMul') spMul += v;
        else if (k === 'apMul') apMul += v;
        else if (k === 'dmgMul') dmgMul += v;
        else if (k === 'critDmg') critDmg += v;
        else if (k === 'dr') dr += v;
      }
    };
    if (n >= 2) apply(set.b2);
    if (n >= 4) apply(set.b4);
  }

  const primary = cls.id === 'warrior' ? 'str' : cls.id === 'rogue' ? 'agi' : 'int';
  const ap = (primary === 'str' ? stats.str * 2 : primary === 'agi' ? stats.agi * 2 : stats.int * 0.5) + power;
  const sp = stats.int * 1.8 + power * 0.8;
  const maxHp = Math.round((70 + stats.sta * 9) * (1 + (mods.hpMul || 0)));
  let maxRes = cls.resourceMax;
  if (primary === 'int') maxRes = Math.round((110 + stats.int * 6) * (1 + (mods.resourceMaxMul || 0)));
  maxRes += mods.resourceMaxAdd || 0;

  return {
    stats, armor, power,
    ap: Math.round(ap * (1 + spMul * 0.5 + apMul + (mods.dmgMul || 0))),
    sp: Math.round(sp * (1 + spMul + (mods.dmgMul || 0))),
    crit: Math.min(0.6, 0.05 + stats.agi * 0.0012 + gearCrit + (mods.crit || 0)),
    critDmg: 2 + critDmg + (mods.critDmg || 0),
    dr: dr + (mods.dr || 0),
    maxHp, maxRes,
    mods,
    setCount,
    dmgMul: dmgMul + (mods.dmgMul || 0),
    healMul: mods.healMul || 0,
  };
}

/** AI 队友属性：同职业模板，按玩家等级缩放并乘上角色系数 */
export function deriveCompanion(compId, playerLevel) {
  const c = DATA.companions[compId];
  const cls = DATA.classes[c.classId];
  const lvl = Math.max(1, playerLevel - 1);
  const stats = { str: 0, agi: 0, int: 0, sta: 0 };
  for (const k of Object.keys(stats)) {
    stats[k] = Math.round(cls.base[k] + (cls.perLevel[k] || 0) * (lvl - 1));
  }
  const primary = cls.id === 'warrior' ? 'str' : cls.id === 'rogue' ? 'agi' : 'int';
  const ap = (primary === 'str' ? stats.str * 2 : primary === 'agi' ? stats.agi * 2 : stats.int * 0.5) + lvl * 3;
  const sp = stats.int * 1.8 + lvl * 2;
  return {
    stats,
    armor: 40 + lvl * 18,
    ap: Math.round(ap * c.dmgMul),
    sp: Math.round(sp * c.dmgMul),
    crit: 0.06,
    critDmg: 2,
    dr: 0,
    maxHp: Math.round((70 + stats.sta * 9) * c.hpMul),
    maxRes: cls.resourceMax,
    resource: cls.resource,
    mods: { cdReduce: {}, skillDmg: {} },
  };
}

export function xpForLevel(level) {
  return Math.round(80 + 30 * Math.pow(level, 1.55));
}

/** 装备粗评分，用于掉落提示与 tooltip 对比 */
export function itemScore(item) {
  if (!item) return 0;
  let s = (item.armor || 0) * 0.45 + (item.power || 0) * 2.2;
  for (const [k, v] of Object.entries(item.stats || {})) {
    s += k === 'crit' ? v * 260 : v * (k === 'sta' ? 1.4 : 2);
  }
  return Math.round(s);
}

export function qualityOf(item) {
  return QUALITY[item?.quality || 'common'];
}

/** 任务目标文字 */
export function objectiveText(obj, progress) {
  const p = progress || 0;
  const verb = obj.kind === 'kill' ? '击杀' : obj.kind === 'collect' ? '' : '';
  return `${verb}${obj.label.replace(/^(击杀|拾取|收集|查看|读取|把|与|向|回到)/, '')} ${p}/${obj.count}`;
}
