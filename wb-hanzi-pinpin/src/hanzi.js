// 拆字资料：随应用托管的 hanzi-common.json（BabelStone IDS 派生，事实性数据）。
// 结构：chars[char] = { m, p, lk, n, st, s, py, en, r }

import { assetUrl } from './web-root.js';

const DATA_URL = assetUrl('data/hanzi-common.json');

let dictionary = null;
let loading = null;

export function loadDictionary() {
  if (dictionary) return Promise.resolve(dictionary);
  if (!loading) {
    loading = fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error('汉字词典加载失败');
        return response.json();
      })
      .then((data) => { dictionary = data; return data; })
      .catch((error) => { loading = null; throw error; });
  }
  return loading;
}

export const isDictionaryReady = () => Boolean(dictionary);
export const entryOf = (char) => dictionary?.chars?.[char] ?? null;

const OPERATORS = new Set(['⿰', '⿱', '⿲', '⿳', '⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺', '⿻']);
const ENCLOSING = new Set(['⿴', '⿵', '⿶', '⿷', '⿸', '⿹', '⿺']);
const isLeaf = (node) => Object.prototype.hasOwnProperty.call(node, 'leaf');

export function parseIds(ids) {
  if (!ids) return null;
  const chars = [...ids].filter((ch) => !/[a-zA-Z0-9^$()[\]{}<>]/.test(ch));
  let cursor = 0;
  const next = () => {
    if (cursor >= chars.length) return null;
    const ch = chars[cursor];
    if (OPERATORS.has(ch)) {
      cursor += 1;
      const arity = ch === '⿲' || ch === '⿳' ? 3 : 2;
      const kids = [];
      for (let i = 0; i < arity; i += 1) {
        const kid = next();
        if (!kid) return null;
        kids.push(kid);
      }
      return { op: ch, kids };
    }
    cursor += 1;
    return { leaf: ch };
  };
  const tree = next();
  return !tree || cursor !== chars.length ? null : tree;
}

export function leavesOf(tree) {
  const out = [];
  const walk = (node) => {
    if (isLeaf(node)) { out.push(node.leaf); return; }
    node.kids.forEach(walk);
  };
  if (tree) walk(tree);
  return out;
}

export const idsLeaves = (ids) => leavesOf(parseIds(ids));

export const isEnclosingIds = (ids) => {
  const tree = parseIds(ids);
  return Boolean(tree && !isLeaf(tree) && ENCLOSING.has(tree.op));
};

export const expectedFormation = (structure) => {
  if (!structure) return null;
  if (/上中下|上下/.test(structure)) return 'tb';
  if (/左中右|左右/.test(structure)) return 'lr';
  return null;
};

export const STRUCTURES = ['左右结构', '上下结构', '左中右结构', '上中下结构', '半包围结构', '全包围结构', '独体字'];

// 教师覆盖优先；否则用词典条目。
export function planOf(char, override) {
  const base = entryOf(char);
  if (override && Array.isArray(override.parts) && override.parts.length) {
    return {
      mode: override.mode || 'A',
      parts: override.parts,
      lockParts: override.lockParts || [],
      structure: override.structure || base?.st || '',
      ids: base?.s || '',
      overridden: true,
      py: base?.py || '',
      en: base?.en || '',
      reason: '教师覆盖拆法',
    };
  }
  if (!base) {
    return { mode: 'F', parts: [char], lockParts: [], structure: '', ids: '', overridden: false, py: '', en: '', reason: '词库未收录该字' };
  }
  return {
    mode: base.m,
    parts: base.p,
    lockParts: base.lk || [],
    structure: base.st,
    ids: base.s || '',
    overridden: false,
    py: base.py || '',
    en: base.en || '',
    reason: base.r || '',
  };
}

export const MODE_LABEL = { A: '可拆', B: '可拆', C: '独体', F: '未收录' };
export const MODE_BADGE = { A: 'A', B: 'B', C: '独', F: '?' };
export const isPlayable = (plan) => plan.mode !== 'C' && plan.mode !== 'F' && plan.parts.length >= 2;

export function splitChars(text) {
  return [...new Set((text || '').replace(/[^\u3400-\u9FFF\uF900-\uFAFF]/g, '').split(''))];
}
