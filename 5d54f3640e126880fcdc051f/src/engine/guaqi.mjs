const MONTH_ORDER = [
  [0, "\u590D", "\u5730\u96F7\u590D", "\u606F", 1, "100000", "\u4E00\u9633\u6765\u590D\u3002\u51AC\u81F3\u4E4B\u540E\u9633\u6C14\u521D\u751F\uFF0C\u9633\u723B\u751F\u4E8E\u521D\u723B\uFF0C\u6545\u66F0\u590D\u3002"],
  [1, "\u4E34", "\u5730\u6CFD\u4E34", "\u606F", 2, "110000", "\u4E8C\u9633\u606F\u9634\u3002\u9633\u6C14\u7EED\u957F\u800C\u53CA\u4E8E\u4E8C\u723B\uFF0C\u51AC\u53BB\u6625\u4E34\uFF0C\u6545\u66F0\u4E34\u3002"],
  [2, "\u6CF0", "\u5730\u5929\u6CF0", "\u606F", 3, "111000", "\u4E09\u9633\u606F\u9634\u3002\u5929\u5730\u6C14\u4EA4\uFF0C\u4E0A\u4E0B\u76F8\u901A\uFF0C\u4E09\u9633\u5F00\u6CF0\uFF0C\u6545\u66F0\u6CF0\u3002"],
  [3, "\u5927\u58EE", "\u96F7\u5929\u5927\u58EE", "\u606F", 4, "111100", "\u56DB\u9633\u606F\u9634\u3002\u9633\u6C14\u5DF2\u8FC7\u534A\u6625\uFF0C\u96F7\u52A8\u4E8E\u5929\uFF0C\u6545\u66F0\u5927\u58EE\u3002"],
  [4, "\u592C", "\u6CFD\u5929\u592C", "\u606F", 5, "111110", "\u4E94\u9633\u606F\u9634\u3002\u9634\u6C14\u4EC5\u4F59\u4E0A\u723B\uFF0C\u9633\u76DB\u800C\u9634\u51B3\uFF0C\u6545\u66F0\u592C\u3002"],
  [5, "\u4E7E", "\u4E7E\u4E3A\u5929", "\u606F", 6, "111111", "\u516D\u9633\u606F\u9634\u3002\u7EAF\u9633\u4E4B\u5366\uFF0C\u9633\u6C14\u81F3\u6B64\u800C\u6781\uFF0C\u6545\u66F0\u4E7E\u3002"],
  [6, "\u59E4", "\u5929\u98CE\u59E4", "\u6D88", 1, "011111", "\u4E00\u9634\u6D88\u9633\u3002\u590F\u81F3\u4E4B\u540E\u9634\u6C14\u59CB\u751F\u4E8E\u521D\u723B\uFF0C\u9633\u6781\u800C\u9634\u5C06\u8D77\uFF0C\u6545\u66F0\u59E4\u3002"],
  [7, "\u9041", "\u5929\u5C71\u9041", "\u6D88", 2, "001111", "\u4E8C\u9634\u6D88\u9633\u3002\u9634\u6C14\u6E10\u957F\uFF0C\u9633\u6C14\u9000\u907F\uFF0C\u6545\u66F0\u9041\u3002"],
  [8, "\u5426", "\u5929\u5730\u5426", "\u6D88", 3, "000111", "\u4E09\u9634\u6D88\u9633\u3002\u5929\u5730\u4E0D\u4EA4\uFF0C\u4E0A\u4E0B\u4E0D\u901A\uFF0C\u6545\u66F0\u5426\u3002"],
  [9, "\u89C2", "\u98CE\u5730\u89C2", "\u6D88", 4, "000011", "\u56DB\u9634\u6D88\u9633\u3002\u98CE\u884C\u5730\u4E0A\uFF0C\u89C2\u4E4E\u5929\u6587\u4EE5\u5BDF\u65F6\u53D8\uFF0C\u6545\u66F0\u89C2\u3002"],
  [10, "\u5265", "\u5C71\u5730\u5265", "\u6D88", 5, "000001", "\u4E94\u9634\u6D88\u9633\u3002\u9634\u6C14\u5265\u5C3D\u5728\u4E0B\u4E4B\u9633\uFF0C\u4E07\u7269\u81F3\u6B64\u800C\u5265\uFF0C\u6545\u66F0\u5265\u3002"],
  [11, "\u5764", "\u5764\u4E3A\u5730", "\u6D88", 6, "000000", "\u516D\u9634\u6D88\u9633\u3002\u7EAF\u9634\u4E4B\u5366\uFF0C\u9634\u6C14\u81F3\u6B64\u800C\u6781\uFF0C\u4E00\u9633\u5C06\u590D\uFF0C\u6545\u66F0\u5764\u3002"]
];
const BY_BRANCH = new Map(
  MONTH_ORDER.map(([branch, short, name, phase, yangCount, key, meaning]) => [
    branch,
    { branch, short, name, phase, yangCount, key, meaning }
  ])
);
const BY_KEY = new Map(MONTH_ORDER.map(([, , , , , key]) => [key, toEntry(key)]));
function monthQi(branch) {
  return BY_BRANCH.get(branch) ?? null;
}
function hexagramQi(key) {
  const entry = BY_KEY.get(key);
  if (!entry) return null;
  return {
    name: entry.name,
    short: entry.short,
    phase: entry.phase,
    yangCount: entry.yangCount,
    meaning: entry.meaning,
    yang: entry.phase === "\u606F"
  };
}
function toEntry(key) {
  const [branch, short, name, phase, yangCount, , meaning] = MONTH_ORDER.find((row) => row[5] === key);
  return { branch, short, name, phase, yangCount, key, meaning };
}
const TWELVE_MESSAGES = Object.freeze([...BY_BRANCH.values()]);
export {
  TWELVE_MESSAGES,
  hexagramQi,
  monthQi
};
