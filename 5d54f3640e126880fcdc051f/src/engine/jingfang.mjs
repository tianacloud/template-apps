import { TRIGRAMS, HEXAGRAM_LIST, hexagramByKey } from "./hexagrams.mjs";
import { branchClash, muJue, seasonVacuous, xunKong, SIX_HARMONY, BRANCH_ELEMENTS as ELEMENT_BY_BRANCH } from "./almanac.mjs";
import { BRANCHES } from "./almanac.mjs";
const BRANCH_ORDER = BRANCHES;
const GENERATES = Object.freeze({ \u6728: "\u706B", \u706B: "\u571F", \u571F: "\u91D1", \u91D1: "\u6C34", \u6C34: "\u6728" });
const OVERCOMES = Object.freeze({ \u6728: "\u571F", \u571F: "\u6C34", \u6C34: "\u706B", \u706B: "\u91D1", \u91D1: "\u6728" });
function generatesTo(from, to) {
  return GENERATES[from] === to;
}
function overcomesTo(from, to) {
  return OVERCOMES[from] === to;
}
const ELEMENTS = Object.freeze(["\u6728", "\u706B", "\u571F", "\u91D1", "\u6C34"]);
const SIX_GOD_SONG = "\u7532\u4E59\u8D77\u9752\u9F99\uFF0C\u4E19\u4E01\u8D77\u6731\u96C0\uFF0C\u620A\u65E5\u8D77\u52FE\u9648\uFF0C\u5DF1\u65E5\u8D77\u87A3\u86C7\uFF0C\u5E9A\u8F9B\u8D77\u767D\u864E\uFF0C\u58EC\u7678\u8D77\u7384\u6B66\u3002\uFF08\u4FF1\u4ECE\u4E0B\u8D77\u81F3\u4E0A\u3002\uFF09";
const SIX_GOD_ORDER = Object.freeze(["\u9752\u9F99", "\u6731\u96C0", "\u52FE\u9648", "\u87A3\u86C7", "\u767D\u864E", "\u7384\u6B66"]);
const SIX_GOD_FIRST = Object.freeze([0, 0, 1, 1, 2, 3, 4, 4, 5, 5]);
const SIX_GOD_MEANING = Object.freeze({
  \u9752\u9F99: Object.freeze({ element: "\u6728", meaning: "\u559C\u5E86\u3001\u559C\u4E8B\u3001\u8D35\u4EBA\u3001\u9152\u8272\u3001\u6B63\u76F4" }),
  \u6731\u96C0: Object.freeze({ element: "\u706B", meaning: "\u53E3\u820C\u3001\u6587\u4E66\u3001\u6D88\u606F\u3001\u662F\u975E\u3001\u8BC9\u8BBC" }),
  \u52FE\u9648: Object.freeze({ element: "\u571F", meaning: "\u7530\u571F\u3001\u623F\u4EA7\u3001\u7275\u8FDE\u3001\u8FDF\u6EDE\u3001\u7262\u72F1" }),
  \u87A3\u86C7: Object.freeze({ element: "\u706B", meaning: "\u602A\u5F02\u3001\u865A\u60CA\u3001\u7F20\u7ED5\u3001\u5669\u68A6\u3001\u6B3A\u8BC8" }),
  \u767D\u864E: Object.freeze({ element: "\u91D1", meaning: "\u51F6\u9669\u3001\u8840\u5149\u3001\u4F24\u75C5\u3001\u4E27\u4E8B\u3001\u5A01\u731B" }),
  \u7384\u6B66: Object.freeze({ element: "\u6C34", meaning: "\u6697\u6627\u3001\u76D7\u8D3C\u3001\u9690\u79C1\u3001\u66A7\u6627\u3001\u6B3A\u7792" })
});
function sixGods(dayStem) {
  const start = SIX_GOD_FIRST[dayStem];
  if (start === void 0) return [];
  return SIX_GOD_ORDER.map((_, i) => SIX_GOD_ORDER[(start + i) % 6]);
}
const BRANCH_ELEMENTS = Object.freeze({
  \u5B50: "\u6C34",
  \u4E11: "\u571F",
  \u5BC5: "\u6728",
  \u536F: "\u6728",
  \u8FB0: "\u571F",
  \u5DF3: "\u706B",
  \u5348: "\u706B",
  \u672A: "\u571F",
  \u7533: "\u91D1",
  \u9149: "\u91D1",
  \u620C: "\u571F",
  \u4EA5: "\u6C34"
});
const PALACES = Object.freeze([
  { key: "qian", name: "\u4E7E\u5BAB", trigram: "\u4E7E", element: "\u91D1", polarity: "\u9633" },
  { key: "zhen", name: "\u9707\u5BAB", trigram: "\u9707", element: "\u6728", polarity: "\u9633" },
  { key: "kan", name: "\u574E\u5BAB", trigram: "\u574E", element: "\u6C34", polarity: "\u9633" },
  { key: "gen", name: "\u826E\u5BAB", trigram: "\u826E", element: "\u571F", polarity: "\u9633" },
  { key: "kun", name: "\u5764\u5BAB", trigram: "\u5764", element: "\u571F", polarity: "\u9634" },
  { key: "xun", name: "\u5DFD\u5BAB", trigram: "\u5DFD", element: "\u6728", polarity: "\u9634" },
  { key: "li", name: "\u79BB\u5BAB", trigram: "\u79BB", element: "\u706B", polarity: "\u9634" },
  { key: "dui", name: "\u5151\u5BAB", trigram: "\u5151", element: "\u91D1", polarity: "\u9634" }
]);
const STAGES = Object.freeze([
  { name: "\u672C\u5BAB", shi: 6, flips: [], meaning: "\u516B\u7EAF\u5366\u3002\u516D\u723B\u540C\u6C14\uFF0C\u4E8B\u4F53\u7EAF\u7CB9\uFF0C\u65E0\u4ECE\u53D8\u8D77\u3002" },
  { name: "\u4E00\u4E16", shi: 1, flips: [1], meaning: "\u4E00\u4E16\u53D8\u3002\u4E8B\u5728\u521D\u8D77\uFF0C\u60F3\u52A8\u800C\u672A\u8D70\u8FDC\u3002" },
  { name: "\u4E8C\u4E16", shi: 2, flips: [1, 2], meaning: "\u4E8C\u4E16\u53D8\u3002\u4E8B\u5DF2\u6210\u5F62\uFF0C\u884C\u5728\u534A\u9014\u3002" },
  { name: "\u4E09\u4E16", shi: 3, flips: [1, 2, 3], meaning: "\u4E09\u4E16\u53D8\u3002\u5185\u5366\u5C3D\u53D8\uFF0C\u5916\u8C61\u672A\u52A8\u3002" },
  { name: "\u56DB\u4E16", shi: 4, flips: [1, 2, 3, 4], meaning: "\u56DB\u4E16\u53D8\u3002\u5C06\u53CA\u4E8E\u5916\uFF0C\u5C40\u9762\u5C06\u5B9A\u672A\u5B9A\u3002" },
  { name: "\u4E94\u4E16", shi: 5, flips: [1, 2, 3, 4, 5], meaning: "\u4E94\u4E16\u53D8\u3002\u5916\u90E8\u5C3D\u53D8\uFF0C\u53EA\u4F59\u4E0A\u723B\u672C\u5BAB\u3002" },
  { name: "\u6E38\u9B42", shi: 4, flips: [1, 2, 3, 5], meaning: "\u6E38\u9B42\u3002\u5916\u5DF2\u590D\u672C\u800C\u5185\u5366\u79BB\u6563\uFF0C\u4E8B\u65E0\u5B9A\u5411\u3001\u5F80\u6765\u4E0D\u5B9A\u3002" },
  { name: "\u5F52\u9B42", shi: 3, flips: [5], meaning: "\u5F52\u9B42\u3002\u5185\u5366\u5F52\u4E8E\u672C\u5BAB\uFF0C\u4E8B\u6709\u5F52\u5904\u3001\u590D\u56DE\u672C\u4F4D\u3002" }
]);
const NAJIA = Object.freeze({
  qian: { inner: { stem: "\u7532", branches: ["\u5B50", "\u5BC5", "\u8FB0"] }, outer: { stem: "\u58EC", branches: ["\u5348", "\u7533", "\u620C"] } },
  zhen: { inner: { stem: "\u5E9A", branches: ["\u5B50", "\u5BC5", "\u8FB0"] }, outer: { stem: "\u5E9A", branches: ["\u5348", "\u7533", "\u620C"] } },
  kan: { inner: { stem: "\u620A", branches: ["\u5BC5", "\u8FB0", "\u5348"] }, outer: { stem: "\u620A", branches: ["\u7533", "\u620C", "\u5B50"] } },
  gen: { inner: { stem: "\u4E19", branches: ["\u8FB0", "\u5348", "\u7533"] }, outer: { stem: "\u4E19", branches: ["\u620C", "\u5B50", "\u5BC5"] } },
  kun: { inner: { stem: "\u4E59", branches: ["\u672A", "\u5DF3", "\u536F"] }, outer: { stem: "\u7678", branches: ["\u4E11", "\u4EA5", "\u9149"] } },
  xun: { inner: { stem: "\u8F9B", branches: ["\u4E11", "\u4EA5", "\u9149"] }, outer: { stem: "\u8F9B", branches: ["\u672A", "\u5DF3", "\u536F"] } },
  li: { inner: { stem: "\u5DF1", branches: ["\u536F", "\u4E11", "\u4EA5"] }, outer: { stem: "\u5DF1", branches: ["\u9149", "\u672A", "\u5DF3"] } },
  dui: { inner: { stem: "\u4E01", branches: ["\u5DF3", "\u536F", "\u4E11"] }, outer: { stem: "\u4E01", branches: ["\u4EA5", "\u9149", "\u672A"] } }
});
const POSITION_LABELS = Object.freeze(["\u521D\u723B", "\u4E8C\u723B", "\u4E09\u723B", "\u56DB\u723B", "\u4E94\u723B", "\u4E0A\u723B"]);
const HEXAGRAMS_BY_KEY = new Map(HEXAGRAM_LIST.map((item) => [item.key, item]));
function flip(key, positions) {
  const lines = key.split("").map(Number);
  for (const position of positions) lines[position - 1] = lines[position - 1] ? 0 : 1;
  return lines.join("");
}
const BY_HEXAGRAM_KEY = /* @__PURE__ */ new Map();
const PALACE_ROSTERS = /* @__PURE__ */ new Map();
for (const palace of PALACES) {
  const base = TRIGRAMS[palace.key].lines.repeat(2);
  const roster = [];
  for (const stage of STAGES) {
    const hexagram = hexagramByKey(flip(base, stage.flips));
    const existing = BY_HEXAGRAM_KEY.get(hexagram.key);
    if (existing) {
      throw new Error(`\u516B\u5BAB\u63A8\u5BFC\u649E\u8F66\uFF1A${hexagram.name} \u540C\u65F6\u7B97\u8FDB${existing.palace.name}\u4E0E${palace.name}`);
    }
    BY_HEXAGRAM_KEY.set(hexagram.key, { palace, stage });
    roster.push(Object.freeze({
      stage: stage.name,
      name: hexagram.name,
      key: hexagram.key,
      // 相对本宫纯卦变过哪几爻。游魂是五世卦第四爻复本来的，第四爻不在其中；
      // 归魂只变第五爻。正因为这两个反着来，「游」「归」两个字才不是随口起的。
      flips: Object.freeze([...stage.flips]),
      shi: stage.shi,
      ying: yingOf(stage.shi)
    }));
  }
  PALACE_ROSTERS.set(palace.key, Object.freeze(roster));
}
if (BY_HEXAGRAM_KEY.size !== HEXAGRAM_LIST.length) {
  throw new Error(`\u516B\u5BAB\u63A8\u5BFC\u53EA\u5F97\u5230 ${BY_HEXAGRAM_KEY.size} \u5366\uFF0C\u5E94\u4E3A ${HEXAGRAM_LIST.length} \u5366`);
}
function relativeOf(palaceElement, lineElement) {
  if (lineElement === palaceElement) return "\u5144\u5F1F";
  if (generatesTo(lineElement, palaceElement)) return "\u7236\u6BCD";
  if (generatesTo(palaceElement, lineElement)) return "\u5B50\u5B59";
  if (overcomesTo(lineElement, palaceElement)) return "\u5B98\u9B3C";
  if (overcomesTo(palaceElement, lineElement)) return "\u59BB\u8D22";
  return "\u5144\u5F1F";
}
function yingOf(shi) {
  return shi <= 3 ? shi + 3 : shi - 3;
}
function palaceEntry(hexagram) {
  const found = BY_HEXAGRAM_KEY.get(hexagram.key);
  if (!found) throw new Error(`\u516B\u5BAB\u67E5\u4E0D\u5230 ${hexagram.name || hexagram.key}`);
  return found;
}
function jingfang(hexagram) {
  const { palace, stage } = palaceEntry(hexagram);
  const record = HEXAGRAMS_BY_KEY.get(hexagram.key);
  const lower = NAJIA[record.lower];
  const upper = NAJIA[record.upper];
  const ying = yingOf(stage.shi);
  const lines = POSITION_LABELS.map((label, index) => {
    const position = index + 1;
    const isInner = position <= 3;
    const source = isInner ? lower.inner : upper.outer;
    const branch = source.branches[isInner ? position - 1 : position - 4];
    const element = BRANCH_ELEMENTS[branch];
    return Object.freeze({
      position,
      label,
      stem: source.stem,
      branch,
      // 旬空、月破、墓绝都按地支序号算，留着它就不用每处再查一次字表。
      branchIndex: BRANCH_ORDER.indexOf(branch),
      element,
      relative: relativeOf(palace.element, element),
      role: position === stage.shi ? "\u4E16" : position === ying ? "\u5E94" : ""
    });
  });
  return Object.freeze({
    palaceName: palace.name,
    palaceTrigram: palace.trigram,
    element: palace.element,
    polarity: `${palace.polarity}\u5BAB`,
    stage: stage.name,
    shi: stage.shi,
    ying,
    stageMeaning: stage.meaning,
    // 同宫那八卦。卦盘上那一列小卦就是它，每一格标着相对本宫纯卦变过哪几爻。
    roster: PALACE_ROSTERS.get(palace.key),
    lines: Object.freeze(lines)
  });
}
function palaceRoster(hexagram) {
  return PALACE_ROSTERS.get(palaceEntry(hexagram).palace.key);
}
function palaceOf(hexagram) {
  const { palace, stage } = palaceEntry(hexagram);
  return Object.freeze({ palace, stage, ying: yingOf(stage.shi) });
}
function shiYingRelation(shiElement, yingElement) {
  const pairs = [
    [generatesTo(shiElement, yingElement), "\u751F", "\u4E16\u751F\u5E94", "\u6211\u8FD9\u4E00\u65B9\u4E3B\u52A8\u53BB\u5C31\u5BF9\u65B9\uFF0C\u4ED8\u51FA\u5728\u524D\uFF0C\u8C0B\u4E8B\u591A\u7531\u6211\u63A8\u52A8"],
    [generatesTo(yingElement, shiElement), "\u88AB\u751F", "\u5E94\u751F\u4E16", "\u5BF9\u65B9\u4E3B\u52A8\u5411\u6211\uFF0C\u673A\u4F1A\u591A\u4ECE\u5BF9\u65B9\u6765\uFF0C\u5B9C\u53D7\u4E4B\u800C\u4E0D\u5B9C\u5F3A\u6C42"],
    [overcomesTo(shiElement, yingElement), "\u514B", "\u4E16\u514B\u5E94", "\u6211\u538B\u5F97\u4F4F\u5BF9\u65B9\uFF0C\u4E3B\u52A8\u6743\u5728\u63E1\uFF0C\u4F46\u8D39\u529B"],
    [overcomesTo(yingElement, shiElement), "\u88AB\u514B", "\u5E94\u514B\u4E16", "\u5BF9\u65B9\u538B\u4F4F\u6211\uFF0C\u5904\u5883\u53D7\u5236\uFF0C\u5B9C\u5B88\u4E0D\u5B9C\u653B"],
    [shiElement === yingElement, "\u6BD4\u548C", "\u4E16\u5E94\u6BD4\u548C", "\u4E24\u8FB9\u540C\u4E00\u8DEF\u4EBA\uFF0C\u7ACB\u573A\u76F8\u8FD1\uFF0C\u4E8B\u60C5\u597D\u8C08\u4F46\u4E5F\u96BE\u5206\u9AD8\u4E0B"]
  ];
  const hit = pairs.find(([matched]) => matched);
  return hit ? { key: (
    /** @type {string} */
    hit[1]
  ), text: `${/** @type {string} */
  hit[2]}\u2014\u2014${/** @type {string} */
  hit[3]}` } : null;
}
const RELATIVE_MEANING = Object.freeze({
  \u7236\u6BCD: "\u6587\u4E66\u5951\u7EA6\u3001\u957F\u8F88\u3001\u4E0A\u7EA7\u3001\u5E87\u62A4\u4E0E\u8F9B\u52B3",
  \u5144\u5F1F: "\u540C\u8F88\u3001\u540C\u884C\u3001\u7ADE\u4E89\u8005\uFF0C\u4E5F\u4E3B\u5206\u593A\u7834\u8017",
  \u5B50\u5B59: "\u540E\u8F88\u3001\u798F\u4F51\u3001\u89E3\u5FE7\uFF0C\u4E5F\u4E3B\u533B\u836F\u4E0E\u6D88\u5F2D",
  \u59BB\u8D22: "\u8D22\u7269\u3001\u8D27\u7269\u3001\u59BB\u4E0E\u6240\u6C42\u4E4B\u5229",
  \u5B98\u9B3C: "\u5B98\u804C\u3001\u540D\u4F4D\u3001\u592B\u5A7F\u3001\u5FE7\u60A3\u4E0E\u963B\u6320"
});
function pickUseGod(jingfang2, relatives, movingPositions = []) {
  const moving = new Set(movingPositions);
  const all = jingfang2.lines.filter((line) => relatives.includes(line.relative));
  const present = relatives.filter((name) => all.some((line) => line.relative === name));
  const absent = relatives.filter((name) => !present.includes(name));
  if (all.length === 0) {
    return Object.freeze({ relatives, present, absent, picked: null, all, why: "\u4E0D\u4E0A\u5366" });
  }
  if (relatives.length > 1) {
    return Object.freeze({ relatives, present, absent, picked: null, all, why: "\u4E24\u4EB2\u5404\u770B\u5404\u7684" });
  }
  if (all.length === 1) {
    return Object.freeze({ relatives, present, absent, picked: all[0], all, why: "\u5366\u4E2D\u72EC\u4E00" });
  }
  const animated = all.filter((line) => moving.has(line.position));
  const pool = animated.length > 0 ? animated : all;
  const why = animated.length > 0 ? "\u52A8\u723B\u4F18\u5148" : "\u8FD1\u4E16\u723B\u8005";
  let picked = pool[0];
  for (const line of pool) {
    if (Math.abs(line.position - jingfang2.shi) < Math.abs(picked.position - jingfang2.shi)) {
      picked = line;
    }
  }
  return Object.freeze({ relatives, present, absent, picked, all, why });
}
function hiddenGod(hexagramJingfang, relative) {
  const palace = PALACES.find((item) => item.name === hexagramJingfang.palaceName);
  if (!palace) return null;
  const palaceJingfang = jingfang(hexagramByKey(TRIGRAMS[palace.key].lines.repeat(2)));
  const candidates = palaceJingfang.lines.filter((line) => line.relative === relative);
  if (candidates.length === 0) return null;
  const hushen = candidates[0];
  return Object.freeze({
    hushen,
    feishen: hexagramJingfang.lines[hushen.position - 1],
    palaceName: palace.name,
    // 八纯卦里同一亲占两爻的情况（乾宫父母在三、六爻）。测试量过六十四卦全量：
    // 缺失六亲的实例与伏神爻一一对应，从没碰上过同亲两爻同时缺失，所以不必另设挑法。
    ambiguous: candidates.length > 1
  });
}
function flyingRelation(hushen, feishen) {
  const from = feishen.element;
  const to = hushen.element;
  if (from === to) return { key: "\u6BD4\u548C", text: "\u98DE\u4F0F\u540C\u6C14\uFF0C\u4F0F\u795E\u4E0D\u53E6\u5F97\u751F\u4E5F\u53E6\u4E0D\u5F97\u6CC4", good: null };
  if (generatesTo(from, to)) {
    return { key: "\u98DE\u6765\u751F\u4F0F", text: "\u98DE\u6765\u751F\u4F0F\u5F97\u957F\u751F\uFF1A\u538B\u7740\u5B83\u7684\u90A3\u4E00\u723B\u53CD\u5012\u751F\u5B83\uFF0C\u6240\u6C42\u4E4B\u4E8B\u867D\u4E0D\u5728\u660E\u9762\uFF0C\u5E95\u4E0B\u662F\u88AB\u517B\u7740\u7684", good: true };
  }
  if (generatesTo(to, from)) {
    return { key: "\u4F0F\u53BB\u751F\u98DE", text: "\u4F0F\u53BB\u751F\u98DE\u662F\u6CC4\u6C14\uFF1A\u4F0F\u795E\u4E00\u5473\u5F80\u4E0A\u4F9B\uFF0C\u8017\u795E\u8D39\u529B\uFF0C\u4ED8\u51FA\u591A\u800C\u6536\u6210\u8FDF", good: false };
  }
  if (overcomesTo(to, from)) {
    return { key: "\u4F0F\u6765\u514B\u98DE", text: "\u4F0F\u6765\u514B\u98DE\u662F\u51FA\u66B4\uFF1A\u4F0F\u795E\u4E00\u811A\u8E39\u5F00\u538B\u7740\u5B83\u7684\u723B\uFF0C\u4E8B\u60C5\u5E94\u5F97\u7A81\u7136\u800C\u6025\uFF0C\u591A\u4E3A\u4E0D\u5409\u4E4B\u5146", good: false };
  }
  return { key: "\u98DE\u6765\u514B\u4F0F", text: "\u98DE\u6765\u514B\u4F0F\u662F\u53CD\u4F24\uFF1A\u98DE\u795E\u6B7B\u6B7B\u538B\u4F4F\u4F0F\u795E\uFF0C\u6240\u6C42\u4E4B\u4E8B\u53D7\u538B\u5236\uFF0C\u96BE\u4EE5\u51FA\u5934", good: false };
}
function elementRelation(from, to) {
  if (from === to) return "\u540C\u6C14";
  if (generatesTo(from, to)) return "\u751F";
  if (generatesTo(to, from)) return "\u88AB\u751F";
  if (overcomesTo(from, to)) return "\u514B";
  if (overcomesTo(to, from)) return "\u88AB\u514B";
  return "\u65E0\u6D89";
}
function useGodCircle(jingfang2, picked) {
  const god = picked.element;
  const yuanElement = Object.keys(GENERATES).find((element) => GENERATES[element] === god) ?? "";
  const jiElement = Object.keys(OVERCOMES).find((element) => OVERCOMES[element] === god) ?? "";
  const chouElement = Object.keys(OVERCOMES).find((element) => OVERCOMES[element] === yuanElement) ?? "";
  const pick = (element) => jingfang2.lines.filter((line) => line.element === element);
  return Object.freeze({
    yuan: Object.freeze(pick(yuanElement)),
    ji: Object.freeze(pick(jiElement)),
    chou: Object.freeze(pick(chouElement)),
    elements: Object.freeze({ yuan: yuanElement, ji: jiElement, chou: chouElement })
  });
}
for (const god of ELEMENTS) {
  const { elements } = useGodCircle(
    { lines: ELEMENTS.map((element, index) => ({ position: index + 1, element })) },
    { element: god }
  );
  if ((/* @__PURE__ */ new Set([elements.yuan, elements.ji, elements.chou])).size !== 3) {
    throw new Error(`\u5143\u5FCC\u4EC7\u6821\u9A8C\u4E0D\u8FC7\uFF1A${god}\u7528\u795E\u4E4B\u4E0B\u7B97\u51FA\u5143${elements.yuan}\u5FCC${elements.ji}\u4EC7${elements.chou}\uFF0C\u4E94\u884C\u91CC\u8FD9\u4E09\u8005\u5E94\u5F53\u4E92\u5F02`);
  }
  if (god === "\u91D1" && (elements.yuan !== "\u571F" || elements.ji !== "\u706B" || elements.chou !== "\u6728")) {
    throw new Error(`\u5143\u5FCC\u4EC7\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u4E66\u4E0A\u8BF4\u91D1\u7528\u5219\u571F\u5143\u706B\u5FCC\u6728\u4EC7\uFF0C\u5B9E\u7B97\u51FA\u5143${elements.yuan}\u5FCC${elements.ji}\u4EC7${elements.chou}`);
  }
  if (GENERATES[elements.chou] !== elements.ji || GENERATES[elements.chou] === god) {
    throw new Error(`\u5143\u5FCC\u4EC7\u6821\u9A8C\u4E0D\u8FC7\uFF1A${god}\u7528\u795E\u4E4B\u4EC7\u795E${elements.chou}\u8BE5\u53CD\u751F\u5FCC\u795E${elements.ji}\u4E14\u4E0D\u751F\u7528\u795E`);
  }
}
const HUI_TOU_KE_PAIRS = Object.freeze([
  Object.freeze(["\u571F", "\u6728"]),
  Object.freeze(["\u6728", "\u91D1"]),
  Object.freeze(["\u91D1", "\u706B"]),
  Object.freeze(["\u706B", "\u6C34"]),
  Object.freeze(["\u6C34", "\u571F"])
]);
for (const [moving, changed] of HUI_TOU_KE_PAIRS) {
  if (!overcomesTo(changed, moving)) {
    throw new Error(`\u56DE\u5934\u514B\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u4E66\u4E0A\u8BF4${moving}\u723B\u52A8\u53D8${changed}\u662F\u56DE\u5934\u514B\uFF0C\u800C${changed}\u5E76\u4E0D\u514B${moving}`);
  }
}
for (const moving of ELEMENTS) {
  for (const changed of ELEMENTS) {
    if (overcomesTo(changed, moving) && !HUI_TOU_KE_PAIRS.some(([m, c]) => m === moving && c === changed)) {
      throw new Error(`\u56DE\u5934\u514B\u6821\u9A8C\u4E0D\u8FC7\uFF1A${moving}\u723B\u52A8\u53D8${changed}\u5C5E\u4E8E\u53D8\u723B\u514B\u672C\u723B\uFF0C\u6B4C\u8BC0\u8868\u91CC\u5374\u6CA1\u6709\u8FD9\u4E00\u5BF9`);
    }
  }
}
function transformRelation(moving, changed) {
  const from = moving.element;
  const to = changed.element;
  if (from === to) {
    return { key: "\u5316\u6BD4\u548C", good: null, text: "\u53D8\u723B\u4E0E\u672C\u723B\u540C\u6C14\uFF0C\u662F\u5316\u6BD4\u548C\uFF1A\u529B\u91CF\u4E0D\u76F8\u589E\u51CF\uFF0C\u4E8B\u60C5\u7EF4\u6301\u539F\u6709\u683C\u5C40\uFF0C\u4E0D\u8FDB\u4E0D\u9000\u3002" };
  }
  if (generatesTo(to, from)) {
    return { key: "\u56DE\u5934\u751F", good: true, text: "\u53D8\u723B\u56DE\u5934\u4EE5\u751F\u672C\u723B\uFF0C\u4F5C\u5409\u65AD\uFF1A\u52A8\u723B\u5F80\u53D8\u723B\u90A3\u4E00\u5934\u53BB\uFF0C\u53CD\u5012\u5F97\u4E86\u751F\u6276\uFF0C\u8D8A\u5F80\u540E\u8D8A\u6709\u8F6C\u673A\u3002" };
  }
  if (overcomesTo(to, from)) {
    return {
      key: "\u56DE\u5934\u514B",
      good: false,
      text: "\u53D8\u723B\u56DE\u5934\u4EE5\u514B\u672C\u723B\uFF0C\u4F5C\u51F6\u63A8\u3002\u300A\u535C\u7B6E\u6B63\u5B97\u300B\u8BF4\u5B83\u300C\u5F7B\u5E95\u514B\u5C3D\u300D\uFF0C\u843D\u5728\u7528\u795E\u8EAB\u4E0A\u5219\u51F6\uFF0C\u843D\u5728\u5FCC\u795E\u4EC7\u795E\u8EAB\u4E0A\u53CD\u5409\u3002"
    };
  }
  if (generatesTo(from, to)) {
    return { key: "\u5316\u6CC4", good: null, text: "\u672C\u723B\u751F\u53D8\u723B\uFF0C\u662F\u5316\u6CC4\uFF1A\u52A8\u723B\u7684\u529B\u91CF\u4E00\u8DEF\u6CC4\u8FDB\u53D8\u723B\uFF0C\u4ED8\u51FA\u5728\u524D\uFF0C\u6536\u6210\u5728\u540E\u3002" };
  }
  return { key: "\u5316\u8017", good: null, text: "\u672C\u723B\u514B\u53D8\u723B\uFF0C\u662F\u5316\u8017\uFF1A\u52A8\u723B\u65E2\u51FA\u4E86\u529B\u53C8\u53BB\u514B\u4E0B\uFF0C\u4E24\u5934\u8017\u7740\uFF0C\u5F97\u6765\u4E0D\u6613\u3002" };
}
const JIN_TUI_SONG = "\u8FDB\u795E\uFF1A\u4EA5\u5316\u5B50\uFF0C\u5BC5\u5316\u536F\uFF0C\u5DF3\u5316\u5348\uFF0C\u7533\u5316\u9149\uFF0C\u4E11\u5316\u8FB0\uFF0C\u8FB0\u5316\u672A\uFF0C\u672A\u5316\u620C\uFF0C\u620D\u5316\u4E11\u3002\u9000\u795E\uFF1A\u5B50\u5316\u4EA5\uFF0C\u536F\u5316\u5BC5\uFF0C\u5348\u5316\u5DF3\uFF0C\u9149\u5316\u7533\uFF0C\u8FB0\u5316\u4E11\uFF0C\u672A\u5316\u8FB0\uFF0C\u620D\u5316\u672A\uFF0C\u4E11\u5316\u620D\u3002";
const JIN_TUI = Object.freeze({
  "\u4EA5\u5B50": "\u8FDB\u795E",
  "\u5B50\u4EA5": "\u9000\u795E",
  "\u5BC5\u536F": "\u8FDB\u795E",
  "\u536F\u5BC5": "\u9000\u795E",
  "\u5DF3\u5348": "\u8FDB\u795E",
  "\u5348\u5DF3": "\u9000\u795E",
  "\u7533\u9149": "\u8FDB\u795E",
  "\u9149\u7533": "\u9000\u795E",
  "\u4E11\u8FB0": "\u8FDB\u795E",
  "\u8FB0\u4E11": "\u9000\u795E",
  "\u8FB0\u672A": "\u8FDB\u795E",
  "\u672A\u8FB0": "\u9000\u795E",
  "\u672A\u620C": "\u8FDB\u795E",
  "\u620C\u672A": "\u9000\u795E",
  "\u620C\u4E11": "\u8FDB\u795E",
  "\u4E11\u620C": "\u9000\u795E"
});
for (const [pair, key] of Object.entries(JIN_TUI)) {
  const from = pair[0];
  const to = pair[1];
  if (BRANCH_ELEMENTS[from] !== BRANCH_ELEMENTS[to]) {
    throw new Error(`\u8FDB\u9000\u795E\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u6B4C\u8BC0\u8BF4${from}\u5316${to}\uFF0C\u800C\u4E24\u652F\u4E0D\u540C\u884C`);
  }
  const back = JIN_TUI[`${to}${from}`];
  if (back !== (key === "\u8FDB\u795E" ? "\u9000\u795E" : "\u8FDB\u795E")) {
    throw new Error(`\u8FDB\u9000\u795E\u6821\u9A8C\u4E0D\u8FC7\uFF1A${from}\u5316${to}\u4E3A${key}\uFF0C\u53CD\u65B9\u5411${to}\u5316${from}\u5374\u662F${back ?? "\u65E0"}`);
  }
}
if (Object.keys(JIN_TUI).length !== 16) {
  throw new Error(`\u8FDB\u9000\u795E\u53EA\u5217\u4E86 ${Object.keys(JIN_TUI).length} \u5BF9\uFF0C\u6B4C\u8BC0\u4E24\u9996\u5404\u516B\u5B57\uFF0C\u5E94\u4E3A 16 \u5BF9`);
}
function jinTui(fromBranch, toBranch) {
  const key = JIN_TUI[`${fromBranch}${toBranch}`];
  if (!key) return null;
  return {
    key,
    text: key === "\u8FDB\u795E" ? `${fromBranch}\u5316${toBranch}\u662F\u8FDB\u795E\uFF1A\u4E8B\u60C5\u5F80\u524D\u8D70\u4E00\u6B65\uFF0C\u529B\u91CF\u6E10\u957F\uFF0C\u5B9C\u987A\u52BF\u63A8\u8FDB\u3002` : `${fromBranch}\u5316${toBranch}\u662F\u9000\u795E\uFF1A\u4E8B\u60C5\u5F80\u56DE\u9000\u4E00\u6B65\uFF0C\u529B\u91CF\u6E10\u6D88\uFF0C\u5B9C\u5B88\u5B9C\u7F13\u3002`
  };
}
for (const element of ELEMENTS) {
  const j = BRANCH_ORDER[(muJue(element).mu + 1) % 12];
  if (BRANCH_ELEMENTS[j] === element) {
    throw new Error(`\u7EB3\u652F\u7EDD\u5730\u6821\u9A8C\u4E0D\u8FC7\uFF1A${element}\u7684\u7EDD\u5730\u662F${j}\uFF0C\u800C\u7EB3\u7532\u504F\u504F\u628A${j}\u4E5F\u6D3E\u7ED9\u4E86${element}\uFF0C\u300C\u9022\u7EDD\u300D\u91CD\u65B0\u6210\u7ACB\uFF0C\u5893\u8868\u4E0E\u7EB3\u652F\u5F97\u91CD\u6838`);
  }
}
function voidReading(line, calendar) {
  const kong = xunKong(calendar.dayIndex);
  const isVoid = kong.voidBranches.includes(line.branchIndex);
  const isBroken = branchClash(calendar.monthBranch) === line.branchIndex;
  const mj = muJue(line.element);
  const isTomb = mj.mu === line.branchIndex;
  if (!isVoid) {
    if (!isBroken) {
      return Object.freeze({
        isVoid: false,
        isBroken,
        isTomb,
        status: null,
        rescues: Object.freeze([]),
        empties: Object.freeze([])
      });
    }
    return Object.freeze({
      isVoid: false,
      isBroken,
      isTomb,
      status: "\u771F\u7A7A",
      rescues: Object.freeze([]),
      empties: Object.freeze(["\u9022\u6708\u7834"])
    });
  }
  const dayElement = ELEMENT_BY_BRANCH[calendar.dayBranch];
  const monthElement = ELEMENT_BY_BRANCH[calendar.monthBranch];
  const moving = new Set(calendar.movingPositions);
  const rescues = [];
  const tone = vitality(line.element, monthElement).tone;
  if (tone === "strong" || tone === "good") {
    rescues.push(`\u65FA\u76F8\uFF08\u4E8E\u6708\u5EFA${tone === "strong" ? "\u65FA" : "\u76F8"}\uFF09`);
  }
  if (moving.has(line.position)) rescues.push("\u53D1\u52A8");
  if (generatesTo(dayElement, line.element) || calendar.movingElements.some((e) => generatesTo(e, line.element))) {
    rescues.push("\u5F97\u65E5\u8FB0\u6216\u52A8\u723B\u751F\u6276");
  }
  if (calendar.isHidden && (tone === "strong" || tone === "good")) rescues.push("\u4F0F\u800C\u65FA\u76F8");
  const empties = [];
  if (isBroken) empties.push("\u9022\u6708\u7834");
  if ((tone === "strong" || tone === "good") && !moving.has(line.position)) {
    empties.push("\u6709\u6C14\u800C\u4E0D\u52A8");
  }
  if (calendar.isStruck) empties.push("\u4F0F\u800C\u88AB\u514B");
  const vacuous = seasonVacuous(calendar.monthBranch);
  if (vacuous.vacuousElement === line.element) {
    empties.push(`${vacuous.season}\u4EE4\u6B63\u7A7A${vacuous.vacuousElement}`);
  }
  const status = rescues.length > 0 ? "\u5047\u7A7A" : empties.length > 0 ? "\u771F\u7A7A" : "\u65EC\u7A7A\u672A\u5224";
  return Object.freeze({
    isVoid: true,
    isBroken,
    isTomb,
    status,
    rescues: Object.freeze(rescues),
    empties: Object.freeze(empties)
  });
}
function vitality(element, monthElement) {
  if (element === monthElement) return { key: "\u65FA", tone: "strong" };
  if (generatesTo(monthElement, element)) return { key: "\u76F8", tone: "good" };
  if (generatesTo(element, monthElement)) return { key: "\u4F11", tone: "weak" };
  if (overcomesTo(element, monthElement)) return { key: "\u56DA", tone: "bad" };
  return { key: "\u6B7B", tone: "bad" };
}
function dayClashReading(jingfang2, calendar) {
  const monthElement = ELEMENT_BY_BRANCH[calendar.monthBranch];
  const moving = new Set(calendar.movingPositions);
  const clashed = branchClash(calendar.dayBranch);
  const dark = [];
  const dayBroken = [];
  const pressed = [];
  for (const line of jingfang2.lines) {
    if (line.branchIndex !== clashed) continue;
    if (moving.has(line.position)) {
      pressed.push(line);
      continue;
    }
    const tone = vitality(line.element, monthElement).tone;
    (tone === "strong" || tone === "good" ? dark : dayBroken).push(line);
  }
  return Object.freeze({
    dark: Object.freeze(dark),
    dayBroken: Object.freeze(dayBroken),
    pressed: Object.freeze(pressed)
  });
}
function hexagramClash(hexagram, prepared) {
  const jf = prepared ?? jingfang(hexagram);
  const pairs = CLASH_PAIR_OFFSETS.map(([lower, upper]) => {
    const a = jf.lines[lower - 1];
    const b = jf.lines[upper - 1];
    const kind = branchClash(a.branchIndex) === b.branchIndex ? "\u51B2" : SIX_HARMONY.some(([x, y]) => x === a.branchIndex && y === b.branchIndex || x === b.branchIndex && y === a.branchIndex) ? "\u5408" : null;
    return { lower: a, upper: b, kind };
  });
  const chong = pairs.every((pair) => pair.kind === "\u51B2");
  const he = pairs.every((pair) => pair.kind === "\u5408");
  return Object.freeze({ chong, he, pairs: Object.freeze(pairs) });
}
const PUNISH_PAIRS = Object.freeze([
  ["\u5BC5", "\u5DF3"],
  ["\u5DF3", "\u7533"],
  ["\u5B50", "\u536F"],
  ["\u536F", "\u5348"],
  ["\u4E11", "\u620C"],
  ["\u672A", "\u8FB0"]
]);
const SELF_PUNISH_BRANCHES = Object.freeze(["\u8FB0", "\u5348", "\u9149", "\u4EA5"]);
function branchPunishes(a, b) {
  return PUNISH_PAIRS.some(([from, to]) => from === a && to === b);
}
function branchSelfPunishes(a, b) {
  return a === b && SELF_PUNISH_BRANCHES.includes(a);
}
function punishReading(jingfang2, calendar) {
  const linePairs = [];
  for (let a = 1; a <= 6; a += 1) {
    for (let b = 1; b <= 6; b += 1) {
      if (a === b) continue;
      const from = jingfang2.lines[a - 1];
      const to = jingfang2.lines[b - 1];
      if (branchPunishes(from.branch, to.branch)) {
        linePairs.push(Object.freeze({ from, to, self: false }));
      } else if (branchSelfPunishes(from.branch, to.branch) && a < b) {
        linePairs.push(Object.freeze({ from, to, self: true }));
      }
    }
  }
  const outside = [];
  for (const source of [
    { name: "\u65E5\u8FB0", branch: BRANCH_ORDER[calendar.dayBranch] },
    { name: "\u6708\u5EFA", branch: BRANCH_ORDER[calendar.monthBranch] }
  ]) {
    for (const line of jingfang2.lines) {
      if (branchPunishes(source.branch, line.branch)) {
        outside.push(Object.freeze({ line, source: source.name, from: source.branch, to: line.branch, self: false }));
      } else if (branchPunishes(line.branch, source.branch)) {
        outside.push(Object.freeze({ line, source: source.name, from: line.branch, to: source.branch, self: false }));
      } else if (branchSelfPunishes(source.branch, line.branch)) {
        outside.push(Object.freeze({ line, source: source.name, from: line.branch, to: source.branch, self: true }));
      }
    }
  }
  const hit = /* @__PURE__ */ new Set();
  for (const item of linePairs) {
    hit.add(item.from.position);
    hit.add(item.to.position);
  }
  for (const item of outside) hit.add(item.line.position);
  const hitPositions = [...hit].sort((a, b) => a - b);
  return Object.freeze({
    linePairs: Object.freeze(linePairs),
    outside: Object.freeze(outside),
    hitPositions: Object.freeze(hitPositions),
    hasAny: linePairs.length > 0 || outside.length > 0
  });
}
const SIX_CLASH_PAIRS = Object.freeze([
  ["\u5B50", "\u5348"],
  ["\u4E11", "\u672A"],
  ["\u5BC5", "\u7533"],
  ["\u536F", "\u9149"],
  ["\u8FB0", "\u620C"],
  ["\u5DF3", "\u4EA5"]
]);
function branchClash6(branch) {
  for (const [x, y] of SIX_CLASH_PAIRS) {
    if (x === branch) return y;
    if (y === branch) return x;
  }
  return "";
}
function trigramBranches(jingfang2, inner) {
  return jingfang2.lines.slice(inner ? 0 : 3, inner ? 3 : 6).map((line) => line.branch).join("");
}
function fanfuReading(jingfang2, calendar, changedJingfang) {
  const moving = new Set(calendar.movingPositions);
  const allSixMoving = jingfang2.lines.every((line) => moving.has(line.position));
  if (!changedJingfang) {
    return Object.freeze({
      inner: false,
      outer: false,
      both: false,
      hasAny: false,
      guaChange: false,
      allSixMoving,
      innerFrom: "",
      innerTo: "",
      outerFrom: "",
      outerTo: "",
      kind: ""
    });
  }
  const innerFrom = trigramBranches(jingfang2, true);
  const innerTo = trigramBranches(changedJingfang, true);
  const outerFrom = trigramBranches(jingfang2, false);
  const outerTo = trigramBranches(changedJingfang, false);
  const inner = innerFrom !== innerTo && innerTo === [...innerFrom].map(branchClash6).join("");
  const outer = outerFrom !== outerTo && outerTo === [...outerFrom].map(branchClash6).join("");
  const guaChange = allSixMoving && jingfang2.stage === "\u672C\u5BAB" && changedJingfang.stage === "\u672C\u5BAB";
  const both = inner && outer;
  return Object.freeze({
    inner,
    outer,
    both,
    guaChange,
    allSixMoving,
    innerFrom,
    innerTo,
    outerFrom,
    outerTo,
    hasAny: inner || outer || guaChange,
    kind: guaChange ? "\u5366\u53D8" : both ? "\u5185\u5916" : inner ? "\u5185\u5366" : outer ? "\u5916\u5366" : ""
  });
}
const CLASH_PAIR_OFFSETS = Object.freeze([[1, 4], [2, 5], [3, 6]]);
function branchHarmony(branch) {
  for (const [x, y] of SIX_HARMONY) {
    if (x === branch) return y;
    if (y === branch) return x;
  }
  return -1;
}
function heCombineReading(jingfang2, calendar, changedJingfang) {
  const moving = new Set(calendar.movingPositions);
  const calendars = calendar.dayBranch === calendar.monthBranch ? [{ name: "\u65E5\u8FB0", branchIndex: calendar.dayBranch }] : [
    { name: "\u65E5\u8FB0", branchIndex: calendar.dayBranch },
    { name: "\u6708\u5EFA", branchIndex: calendar.monthBranch }
  ];
  const rise = [];
  const bind = [];
  const friendly = [];
  const support = [];
  for (const line of jingfang2.lines) {
    for (const source of calendars) {
      if (branchHarmony(line.branchIndex) !== source.branchIndex) continue;
      (moving.has(line.position) ? bind : rise).push(Object.freeze({
        line,
        source: source.name,
        branch: BRANCH_ORDER[source.branchIndex]
      }));
    }
  }
  for (let a = 1; a <= 6; a += 1) {
    for (let b = a + 1; b <= 6; b += 1) {
      if (!moving.has(a) || !moving.has(b)) continue;
      const lineA = jingfang2.lines[a - 1];
      const lineB = jingfang2.lines[b - 1];
      if (branchHarmony(lineA.branchIndex) !== lineB.branchIndex) continue;
      if (CLASH_PAIR_OFFSETS.some(([x, y]) => x === a && y === b || x === b && y === a)) continue;
      friendly.push(Object.freeze({ lineA, lineB }));
    }
  }
  if (changedJingfang) {
    for (const position of calendar.movingPositions) {
      const line = jingfang2.lines[position - 1];
      const changedLine = changedJingfang.lines[position - 1];
      if (branchHarmony(line.branchIndex) !== changedLine.branchIndex) continue;
      support.push(Object.freeze({ line, changedLine }));
    }
  }
  const hit = /* @__PURE__ */ new Set();
  for (const item of rise) hit.add(item.line.position);
  for (const item of bind) hit.add(item.line.position);
  for (const item of friendly) {
    hit.add(item.lineA.position);
    hit.add(item.lineB.position);
  }
  for (const item of support) hit.add(item.line.position);
  const hitPositions = [...hit].sort((a, b) => a - b);
  return Object.freeze({
    rise: Object.freeze(rise),
    bind: Object.freeze(bind),
    friendly: Object.freeze(friendly),
    support: Object.freeze(support),
    hitPositions: Object.freeze(hitPositions),
    hasAny: rise.length > 0 || bind.length > 0 || friendly.length > 0 || support.length > 0
  });
}
{
  const chongNames = [];
  const heNames = [];
  const pairCount = 3;
  for (const hexagram of HEXAGRAM_LIST) {
    const clash = hexagramClash(hexagram);
    if (clash.chong) chongNames.push(hexagram.name);
    if (clash.he) heNames.push(hexagram.name);
    const chongPairs = clash.pairs.filter((pair) => pair.kind === "\u51B2").length;
    const hePairs = clash.pairs.filter((pair) => pair.kind === "\u5408").length;
    if (chongPairs > 0 !== clash.chong) {
      throw new Error(`\u516D\u51B2\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u53EA\u6709${chongPairs}\u5BF9\u51B2\uFF0C\u5374\u5224\u6210\u975E\u516D\u51B2\u2014\u2014\u300C\u4E00\u7EC4\u51B2\u5219\u4E09\u7EC4\u7686\u51B2\u300D\u8FD9\u6761\u7ED3\u6784\u4E8B\u5B9E\u4E0D\u6210\u7ACB\uFF0C\u914D\u5BF9\u4F4D\u6216\u7EB3\u7532\u8868\u6709\u95EE\u9898`);
    }
    if (hePairs > 0 !== clash.he) {
      throw new Error(`\u516D\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u53EA\u6709${hePairs}\u5BF9\u5408\uFF0C\u5374\u5224\u6210\u975E\u516D\u5408\u2014\u2014\u300C\u4E00\u7EC4\u5408\u5219\u4E09\u7EC4\u7686\u5408\u300D\u8FD9\u6761\u7ED3\u6784\u4E8B\u5B9E\u4E0D\u6210\u7ACB\uFF0C\u914D\u5BF9\u4F4D\u6216\u516D\u5408\u8868\u6709\u95EE\u9898`);
    }
    if (clash.chong && chongPairs !== pairCount) {
      throw new Error(`\u516D\u51B2\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u5224\u6210\u516D\u51B2\uFF0C\u649E\u4E0A\u7684\u5374\u53EA\u6709${chongPairs}\u5BF9\uFF0C\u4E0D\u662F\u4E09\u5BF9\u5168\u649E\u3002\u914D\u5BF9\u4F4D\u6216\u7EB3\u7532\u8868\u6709\u95EE\u9898\uFF0C\u8FDE\u7EBF\u4F1A\u753B\u51FA\u534A\u622A\u7684\u5366\u4F53`);
    }
    if (clash.he && hePairs !== pairCount) {
      throw new Error(`\u516D\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u5224\u6210\u516D\u5408\uFF0C\u649E\u4E0A\u7684\u5374\u53EA\u6709${hePairs}\u5BF9\uFF0C\u4E0D\u662F\u4E09\u5BF9\u5168\u649E\u3002\u914D\u5BF9\u4F4D\u6216\u516D\u5408\u8868\u6709\u95EE\u9898\uFF0C\u8FDE\u7EBF\u4F1A\u753B\u51FA\u534A\u622A\u7684\u5366\u4F53`);
    }
  }
  if (chongNames.length !== 10) {
    throw new Error(`\u516D\u51B2\u5366\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u4F20\u4E16\u540D\u5355\u5341\u4E2A\uFF08\u516B\u7EAF\u5366\u52A0\u5929\u96F7\u65E0\u5984\u3001\u96F7\u5929\u5927\u58EE\uFF09\uFF0C\u5B9E\u7B97\u51FA${chongNames.length}\u4E2A\uFF1A${chongNames.join("\u3001")}`);
  }
  if (heNames.length !== 8) {
    throw new Error(`\u516D\u5408\u5366\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u4F20\u4E16\u540D\u5355\u516B\u4E2A\uFF08\u6CF0\u5426\u8C6B\u8D32\u590D\u56F0\u65C5\u8282\uFF09\uFF0C\u5B9E\u7B97\u51FA${heNames.length}\u4E2A\uFF1A${heNames.join("\u3001")}`);
  }
}
for (let branch = 0; branch < 12; branch += 1) {
  const clashed = branchClash(branch);
  if (generatesTo(ELEMENT_BY_BRANCH[branch], ELEMENT_BY_BRANCH[clashed])) {
    throw new Error(`\u65E5\u8FB0\u751F\u6276\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u65E5\u652F${BRANCH_ORDER[branch]}\u80FD\u751F${BRANCH_ORDER[clashed]}\uFF0C\u5219\u88AB\u65E5\u8FB0\u51B2\u7684\u9759\u723B\u8FD8\u80FD\u5F97\u65E5\u8FB0\u751F\u6276\uFF0C\u300C\u6697\u52A8\u4E0D\u9760\u65E5\u8FB0\u751F\u6276\u300D\u8FD9\u6761\u53D6\u820D\u5F97\u91CD\u6838`);
  }
}
{
  const SELF_TOTAL = 4;
  let selfChen = 0;
  for (const hexagram of HEXAGRAM_LIST) {
    const branches = jingfang(hexagram).lines.map((line) => line.branch);
    const chen = branches.filter((branch) => branch === "\u8FB0").length;
    if (chen > 1) {
      throw new Error(`\u7EB3\u7532\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u91CC\u51FA\u73B0\u4E86${chen}\u4E2A\u8FB0\uFF0C\u4E00\u5366\u53EA\u6709\u4E00\u4E2A\u4E0B\u5366\uFF0C\u8FB0\u53EA\u88C5\u5728\u5185\u5366\u4E09\u723B\uFF0C\u78B0\u4E0D\u51FA\u4E24\u4E2A\u2014\u2014\u7EB3\u7532\u8868\u6709\u95EE\u9898`);
    }
  }
  for (const hexagram of HEXAGRAM_LIST) {
    const branches = jingfang(hexagram).lines.map((line) => line.branch);
    for (let a = 0; a < 6; a += 1) {
      for (let b = 0; b < 6; b += 1) {
        if (a === b) continue;
        if (branchSelfPunishes(branches[a], branches[b]) && branches[a] === "\u8FB0") selfChen += 1;
      }
    }
  }
  if (selfChen !== 0) {
    throw new Error(`\u81EA\u5211\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u8FB0\u81EA\u5211\u5728\u516D\u5341\u56DB\u5366\u4E0A\u78B0\u51FA\u4E86${selfChen}\u6B21\uFF0C\u8FB0\u53EA\u88C5\u5728\u5185\u5366\u4E09\u723B\uFF0C\u4E00\u5366\u6700\u591A\u4E00\u4E2A\uFF0C\u78B0\u4E0D\u51FA\u81EA\u5211\u8FB0\u2014\u2014\u7EB3\u7532\u8868\u6216\u81EA\u5211\u56DB\u652F\u6709\u95EE\u9898`);
  }
  const pairHits = new Map(PUNISH_PAIRS.map(([from, to]) => [`${from}\u5211${to}`, 0]));
  let hexWithPunish = 0;
  for (const hexagram of HEXAGRAM_LIST) {
    const jf = jingfang(hexagram);
    let hit = false;
    for (let a = 1; a <= 6 && !hit; a += 1) {
      for (let b = 1; b <= 6; b += 1) {
        if (a === b) continue;
        const key = `${jf.lines[a - 1].branch}\u5211${jf.lines[b - 1].branch}`;
        if (!pairHits.has(key)) continue;
        pairHits.set(key, pairHits.get(key) + 1);
        hit = true;
      }
    }
    if (hit) hexWithPunish += 1;
  }
  for (const [key, count] of pairHits) {
    if (count === 0) {
      throw new Error(`\u4E09\u5211\u6821\u9A8C\u4E0D\u8FC7\uFF1A${key}\u5728\u516D\u5341\u56DB\u5366\u4E0A\u4E00\u6B21\u4E5F\u78B0\u4E0D\u51FA\uFF0C\u8FD9\u4E00\u6761\u591A\u534A\u662F\u5199\u9519\u4E86\u5B57\uFF0C\u5211\u8FD9\u4E00\u8DEF\u4F1A\u9759\u6084\u6084\u5C11\u6389\u4E00\u6761`);
    }
  }
  if (hexWithPunish !== 28) {
    throw new Error(`\u4E09\u5211\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u5E95\u672C\u90A3\u516D\u6761\u5728\u516D\u5341\u56DB\u5366\u4E0A\u78B0\u51FA${hexWithPunish}\u5366\uFF0C\u5E94\u4E3A\u4E8C\u5341\u516B\u5366\u2014\u2014\u6539\u4E86\u5211\u7684\u6761\u76EE\u6216\u7EB3\u7532\u8868\uFF0C\u8FD9\u91CC\u7ACB\u523B\u54CD`);
  }
  if (PUNISH_PAIRS.length !== 6) {
    throw new Error(`\u4E09\u5211\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u5E95\u672C\u90A3\u516D\u6761\u73B0\u5728\u662F${PUNISH_PAIRS.length}\u6761\u3002\u547D\u7406\u90A3\u516B\u6761\u53E6\u5B58\u4E00\u5904\u53EF\u4EE5\uFF0C\u522B\u6DF7\u8FDB\u6765\u2014\u2014\u4E24\u5957\u4E00\u8D77\u6392\uFF0C\u300C\u6709\u51E0\u723B\u72AF\u5211\u300D\u8FD9\u53E5\u8BDD\u5C31\u6CA1\u610F\u4E49\u4E86`);
  }
  void SELF_TOTAL;
}
{
  let guaChange = 0;
  for (const hexagram of HEXAGRAM_LIST) {
    const jingfangValue = jingfang(hexagram);
    const allSix = [1, 2, 3, 4, 5, 6];
    const changedKey = flip(hexagram.key, allSix);
    const changedHexagram = HEXAGRAMS_BY_KEY.get(changedKey);
    const hit = fanfuReading(
      jingfangValue,
      { movingPositions: allSix },
      jingfang(changedHexagram)
    );
    if (!hit.allSixMoving) {
      throw new Error(`\u53CD\u4F0F\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u516D\u723B\u5168\u52A8\u5374\u6CA1\u8BA4\u6210\u5168\u52A8`);
    }
    if (hit.guaChange) guaChange += 1;
  }
  if (guaChange !== 8) {
    throw new Error(`\u53CD\u4F0F\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u516D\u723B\u5168\u52A8\u80FD\u843D\u5230\u516B\u7EAF\u5366\u7684\u73B0\u5728\u662F${guaChange}\u7EC4\uFF0C\u5E94\u4E3A\u516B\u7EC4\uFF08\u4E7E\u5764\u3001\u574E\u79BB\u3001\u9707\u5DFD\u3001\u826E\u5151\uFF09\u3002\u6539\u4E86\u300C\u672C\u5BAB\u300D\u7684\u5224\u6CD5\uFF0C\u8FD9\u91CC\u7ACB\u523B\u54CD`);
  }
  let inner = 0;
  let outer = 0;
  let both = 0;
  let union = 0;
  let overlapWithGuaChange = 0;
  for (const hexagram of HEXAGRAM_LIST) {
    const jingfangValue = jingfang(hexagram);
    for (let mask = 1; mask < 64; mask += 1) {
      const movingPositions = [];
      for (let i = 0; i < 6; i += 1) if (mask & 1 << i) movingPositions.push(i + 1);
      const changedHexagram = HEXAGRAMS_BY_KEY.get(flip(hexagram.key, movingPositions));
      const hit = fanfuReading(jingfangValue, { movingPositions }, jingfang(changedHexagram));
      if (hit.inner) inner += 1;
      if (hit.outer) outer += 1;
      if (hit.both) both += 1;
      if (hit.hasAny) union += 1;
      if (hit.guaChange && (hit.inner || hit.outer)) overlapWithGuaChange += 1;
    }
  }
  if (inner !== 128 || outer !== 128 || both !== 4 || union !== 260) {
    throw new Error(`\u53CD\u4F0F\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u5185\u53CD${inner}\u3001\u5916\u53CD${outer}\u3001\u5185\u5916\u90FD\u53CD${both}\u3001\u53CD\u4F0F\u6216\u5366\u53D8\u5171${union}\u79CD\uFF0C\u5E94\u4E3A 128\u3001128\u30014\u3001260\uFF08252 \u53CD\u4F0F + 8 \u5366\u53D8\uFF09\u3002\u6539\u4E86\u7EB3\u7532\u8868\u6216\u9010\u4F4D\u516D\u51B2\u7684\u5224\u5B9A\uFF0C\u8FD9\u91CC\u7ACB\u523B\u54CD`);
  }
  if (overlapWithGuaChange !== 0) {
    throw new Error(`\u53CD\u4F0F\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u5366\u53D8\u4E0E\u53CD\u4F0F\u90A3\u4E00\u6863\u51FA\u73B0\u4E86${overlapWithGuaChange}\u5904\u91CD\u53E0\uFF0C\u4E24\u6863\u539F\u672C\u4E92\u4E0D\u76F8\u4EA4\uFF0C\u91CD\u53E0\u8BF4\u660E\u300C\u53CD\u4F0F\u300D\u7684\u5224\u636E\u88AB\u653E\u5BBD\u4E86`);
  }
  const still = jingfang(HEXAGRAM_LIST[0]);
  const quiet = fanfuReading(still, { movingPositions: [] }, null);
  if (quiet.hasAny || quiet.kind !== "") {
    throw new Error("\u53CD\u4F0F\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u516D\u723B\u7686\u9759\u5374\u62A5\u51FA\u4E86\u53CD\u4F0F\u6216\u5366\u53D8");
  }
}
{
  const seen = /* @__PURE__ */ new Set();
  for (let branch = 0; branch < 12; branch += 1) {
    const partner = branchHarmony(branch);
    if (partner < 0) {
      throw new Error(`\u516D\u5408\u8868\u6821\u9A8C\u4E0D\u8FC7\uFF1A${BRANCH_ORDER[branch]}\u6CA1\u6709\u914D\u5230\u5408\u652F\uFF0C\u8868\u5C11\u4E86\u4E00\u7EC4`);
    }
    if (seen.has(branch)) {
      throw new Error(`\u516D\u5408\u8868\u6821\u9A8C\u4E0D\u8FC7\uFF1A${BRANCH_ORDER[branch]}\u88AB\u914D\u4E86\u4E24\u6B21\uFF0C\u8868\u91CC\u6709\u91CD\u590D`);
    }
    seen.add(branch);
    if (branchHarmony(partner) !== branch) {
      throw new Error(`\u516D\u5408\u8868\u6821\u9A8C\u4E0D\u8FC7\uFF1A${BRANCH_ORDER[branch]}\u4E0E${BRANCH_ORDER[partner]}\u76F8\u5408\uFF0C\u4F46${BRANCH_ORDER[partner]}\u7684\u5408\u652F\u4E0D\u662F${BRANCH_ORDER[branch]}\u2014\u2014\u5408\u5FC5\u987B\u53CC\u5411`);
    }
  }
  for (let day = 0; day < 12; day += 1) {
    for (let month = 0; month < 12; month += 1) {
      if (day === month) continue;
      for (let branch = 0; branch < 12; branch += 1) {
        if (branchHarmony(day) === branch && branchHarmony(month) === branch) {
          throw new Error(`\u516D\u5408\u8868\u6821\u9A8C\u4E0D\u8FC7\uFF1A${BRANCH_ORDER[branch]}\u540C\u65F6\u5408\u4E8E\u65E5\u652F${BRANCH_ORDER[day]}\u4E0E\u6708\u652F${BRANCH_ORDER[month]}\uFF0C\u5219\u300C\u4E0E\u8C01\u5408\u300D\u6709\u4E24\u4E2A\u7B54\u6848\uFF0C\u56DB\u540D\u91CC\u8BE5\u843D\u54EA\u4E00\u8DEF\u5C31\u5B9A\u4E86`);
        }
      }
    }
  }
  for (const hexagram of HEXAGRAM_LIST) {
    const jf = jingfang(hexagram);
    for (let day = 0; day < 12; day += 1) {
      for (let month = 0; month < 12; month += 1) {
        for (let mask = 0; mask < 64; mask += 1) {
          const moving = [];
          for (let position = 1; position <= 6; position += 1) {
            if (mask & 1 << position - 1) moving.push(position);
          }
          const got = heCombineReading(jf, { monthBranch: month, dayBranch: day, movingPositions: moving });
          const isMoving = (position) => moving.includes(position);
          for (const item of got.rise) {
            if (isMoving(item.line.position)) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u662F\u52A8\u723B\uFF0C\u5374\u843D\u8FDB\u5408\u8D77\u2014\u2014\u5408\u8D77\u53EA\u7BA1\u9759\u723B\uFF0C\u52A8\u723B\u9022\u65E5\u6708\u90A3\u4E00\u8DEF\u53EB\u5408\u7ECA`);
            }
            const partner = branchHarmony(item.line.branchIndex);
            if (partner !== day && partner !== month) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u62A5\u4E86\u5408\u8D77\uFF0C\u5374\u65E2\u4E0D\u5408\u65E5\u652F${BRANCH_ORDER[day]}\u4E5F\u4E0D\u5408\u6708\u652F${BRANCH_ORDER[month]}`);
            }
          }
          for (const item of got.bind) {
            if (!isMoving(item.line.position)) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u662F\u9759\u723B\uFF0C\u5374\u843D\u8FDB\u5408\u7ECA\u2014\u2014\u5408\u7ECA\u53EA\u7BA1\u52A8\u723B\uFF0C\u9759\u723B\u9022\u65E5\u6708\u90A3\u4E00\u8DEF\u53EB\u5408\u8D77`);
            }
            const partner = branchHarmony(item.line.branchIndex);
            if (partner !== day && partner !== month) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u62A5\u4E86\u5408\u7ECA\uFF0C\u5374\u65E2\u4E0D\u5408\u65E5\u652F${BRANCH_ORDER[day]}\u4E5F\u4E0D\u5408\u6708\u652F${BRANCH_ORDER[month]}`);
            }
          }
          for (const item of got.friendly) {
            if (!isMoving(item.lineA.position) || !isMoving(item.lineB.position)) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.lineA.label}\u4E0E${item.lineB.label}\u62A5\u4E86\u5408\u597D\uFF0C\u5176\u4E2D\u6709\u9759\u723B\u2014\u2014\u300C\u4F46\u6709\u4E00\u723B\u4E0D\u52A8\uFF0C\u4EA6\u4E0D\u4E3A\u5408\u300D`);
            }
            if (branchHarmony(item.lineA.branchIndex) !== item.lineB.branchIndex) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.lineA.label}\u4E0E${item.lineB.label}\u62A5\u4E86\u5408\u597D\uFF0C\u4E24\u652F\u5374\u5E76\u4E0D\u76F8\u5408`);
            }
            if (CLASH_PAIR_OFFSETS.some(([x, y]) => x === item.lineA.position && y === item.lineB.position || x === item.lineB.position && y === item.lineA.position)) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.lineA.label}\u4E0E${item.lineB.label}\u662F\u521D\u56DB\u4E8C\u4E94\u4E09\u516D\u90A3\u4E00\u5BF9\uFF0C\u62A5\u4E86\u5408\u597D\u2014\u2014\u90A3\u4E00\u5BF9\u5C5E\u6574\u5366\u516D\u5408\uFF0C\u4E0D\u5728\u8FD9\u91CC\u518D\u8BB0\u4E00\u6B21`);
            }
          }
          for (const item of got.support) {
            if (!isMoving(item.line.position)) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u62A5\u4E86\u5316\u6276\uFF0C\u672C\u723B\u5374\u4E0D\u662F\u52A8\u723B`);
            }
            if (branchHarmony(item.line.branchIndex) !== item.changedLine.branchIndex) {
              throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684${item.line.label}\u62A5\u4E86\u5316\u6276\uFF0C\u53D8\u51FA\u7684${item.changedLine.branch}\u5374\u4E0E\u672C\u723B${item.line.branch}\u4E0D\u76F8\u5408`);
            }
          }
          const union = /* @__PURE__ */ new Set();
          for (const item of got.rise) union.add(item.line.position);
          for (const item of got.bind) union.add(item.line.position);
          for (const item of got.friendly) {
            union.add(item.lineA.position);
            union.add(item.lineB.position);
          }
          for (const item of got.support) union.add(item.line.position);
          if (union.size !== got.hitPositions.length || [...union].some((position) => !got.hitPositions.includes(position))) {
            throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\uFF08\u65E5\u652F${BRANCH_ORDER[day]}\u3001\u6708\u652F${BRANCH_ORDER[month]}\u3001\u52A8\u723B${moving.join(",") || "\u65E0"}\uFF09\u5366\u4F53\u4E0A\u6807\u7684\u9022\u5408\u723B\u4E0E\u56DB\u8DEF\u5B9E\u9645\u62A5\u51FA\u7684\u5BF9\u4E0D\u4E0A`);
          }
          if (got.hasAny !== got.hitPositions.length > 0) {
            throw new Error(`\u9022\u5408\u6821\u9A8C\u4E0D\u8FC7\uFF1A${hexagram.name}\u7684 hasAny \u4E0E\u5B9E\u9645\u547D\u4E2D\u7684\u723B\u4F4D\u5BF9\u4E0D\u4E0A`);
          }
        }
      }
    }
  }
}
const FOUR_SEASONS_TONE = [
  { branch: 2, \u6728: "\u65FA", \u706B: "\u76F8", \u571F: "\u6B7B", \u91D1: "\u56DA", \u6C34: "\u4F11" },
  { branch: 3, \u6728: "\u65FA", \u706B: "\u76F8", \u571F: "\u6B7B", \u91D1: "\u56DA", \u6C34: "\u4F11" },
  { branch: 5, \u6728: "\u4F11", \u706B: "\u65FA", \u571F: "\u76F8", \u91D1: "\u6B7B", \u6C34: "\u56DA" },
  { branch: 6, \u6728: "\u4F11", \u706B: "\u65FA", \u571F: "\u76F8", \u91D1: "\u6B7B", \u6C34: "\u56DA" },
  { branch: 8, \u6728: "\u6B7B", \u706B: "\u56DA", \u571F: "\u4F11", \u91D1: "\u65FA", \u6C34: "\u76F8" },
  { branch: 9, \u6728: "\u6B7B", \u706B: "\u56DA", \u571F: "\u4F11", \u91D1: "\u65FA", \u6C34: "\u76F8" },
  { branch: 11, \u6728: "\u76F8", \u706B: "\u6B7B", \u571F: "\u56DA", \u91D1: "\u4F11", \u6C34: "\u65FA" },
  { branch: 0, \u6728: "\u76F8", \u706B: "\u6B7B", \u571F: "\u56DA", \u91D1: "\u4F11", \u6C34: "\u65FA" }
];
for (const row of FOUR_SEASONS_TONE) {
  for (const element of ELEMENTS) {
    const got = vitality(element, ELEMENT_BY_BRANCH[row.branch]).key;
    if (got !== row[element]) {
      throw new Error(`\u65FA\u8870\u6821\u9A8C\u4E0D\u8FC7\uFF1A\u300A\u56DB\u65F6\u65FA\u76F8\u7AE0\u300B${BRANCH_ORDER[row.branch]}\u6708${element}\u723B\u4F5C${row[element]}\uFF0C\u5B9E\u7B97\u51FA${got}\u3002\u56DA\u4E0E\u6B7B\u6700\u6613\u6389\u4E2A\u4E2A\u513F\u2014\u2014\u4EE4\u514B\u8005\u6B7B\u3001\u514B\u4EE4\u8005\u56DA\uFF0C\u5FF5\u53CD\u4E86\u5C31\u4F1A\u9519\u6389\u8FD9\u4E24\u6863`);
    }
  }
}
export {
  BRANCH_ELEMENTS,
  HUI_TOU_KE_PAIRS,
  JIN_TUI_SONG,
  RELATIVE_MEANING,
  SIX_GOD_MEANING,
  SIX_GOD_ORDER,
  SIX_GOD_SONG,
  dayClashReading,
  elementRelation,
  fanfuReading,
  flyingRelation,
  heCombineReading,
  hexagramClash,
  hiddenGod,
  jinTui,
  jingfang,
  palaceOf,
  palaceRoster,
  pickUseGod,
  punishReading,
  shiYingRelation,
  sixGods,
  transformRelation,
  useGodCircle,
  vitality,
  voidReading
};
