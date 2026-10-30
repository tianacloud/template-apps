const STEMS = Object.freeze(["\u7532", "\u4E59", "\u4E19", "\u4E01", "\u620A", "\u5DF1", "\u5E9A", "\u8F9B", "\u58EC", "\u7678"]);
const BRANCHES = Object.freeze(["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"]);
const ZODIAC = Object.freeze(["\u9F20", "\u725B", "\u864E", "\u5154", "\u9F99", "\u86C7", "\u9A6C", "\u7F8A", "\u7334", "\u9E21", "\u72D7", "\u732A"]);
const ELEMENTS = Object.freeze(["\u6728", "\u706B", "\u571F", "\u91D1", "\u6C34"]);
const STEM_ELEMENTS = Object.freeze(["\u6728", "\u6728", "\u706B", "\u706B", "\u571F", "\u571F", "\u91D1", "\u91D1", "\u6C34", "\u6C34"]);
const BRANCH_ELEMENTS = Object.freeze(["\u6C34", "\u571F", "\u6728", "\u6728", "\u571F", "\u706B", "\u706B", "\u571F", "\u91D1", "\u91D1", "\u571F", "\u6C34"]);
const TRIPLE_HARMONY = Object.freeze([
  { branches: [8, 0, 4], element: "\u6C34", name: "\u7533\u5B50\u8FB0" },
  { branches: [11, 3, 7], element: "\u6728", name: "\u4EA5\u536F\u672A" },
  { branches: [2, 6, 10], element: "\u706B", name: "\u5BC5\u5348\u620C" },
  { branches: [5, 9, 1], element: "\u91D1", name: "\u5DF3\u9149\u4E11" }
]);
const SIX_HARMONY = Object.freeze([
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7]
]);
function branchClash(branch) {
  return (branch + 6) % 12;
}
const XUNKONG_SONG = Object.freeze([
  "\u7532\u5B50\u65EC\u4E2D\u620C\u4EA5\u7A7A",
  "\u7532\u620C\u65EC\u4E2D\u7533\u9149\u7A7A",
  "\u7532\u7533\u65EC\u4E2D\u5348\u672A\u7A7A",
  "\u7532\u5348\u65EC\u4E2D\u8FB0\u5DF3\u7A7A",
  "\u7532\u8FB0\u65EC\u4E2D\u5BC5\u536F\u7A7A",
  "\u7532\u5BC5\u65EC\u4E2D\u5B50\u4E11\u7A7A"
]);
function xunKong(dayIndex) {
  const xun = Math.floor(dayIndex / 10);
  const head = xun * 10 % 12;
  const voidBranches = [(head + 10) % 12, (head + 11) % 12];
  return {
    xun,
    head,
    headName: BRANCHES[head],
    voidBranches,
    voidNames: voidBranches.map((index) => BRANCHES[index])
  };
}
function monthPo(monthBranch) {
  return branchClash(monthBranch);
}
const MU_JUE = Object.freeze({
  \u91D1: Object.freeze({ mu: 1 }),
  // 墓丑
  \u6728: Object.freeze({ mu: 7 }),
  // 墓未
  \u6C34: Object.freeze({ mu: 4 }),
  // 墓辰
  \u571F: Object.freeze({ mu: 4 }),
  // 墓辰
  \u706B: Object.freeze({ mu: 10 })
  // 墓戌
});
function muJue(element) {
  return MU_JUE[element];
}
const SEASON_VACUOUS = Object.freeze([
  Object.freeze({ season: "\u51AC", vacuousElement: "\u706B" }),
  // 亥
  Object.freeze({ season: "\u51AC", vacuousElement: "\u706B" }),
  // 子
  Object.freeze({ season: "\u6625", vacuousElement: "\u571F" }),
  // 寅
  Object.freeze({ season: "\u6625", vacuousElement: "\u571F" }),
  // 卯
  Object.freeze({ season: "\u6625", vacuousElement: "\u571F" }),
  // 辰
  Object.freeze({ season: "\u590F", vacuousElement: "\u91D1" }),
  // 巳
  Object.freeze({ season: "\u590F", vacuousElement: "\u91D1" }),
  // 午
  Object.freeze({ season: "\u590F", vacuousElement: "\u91D1" }),
  // 未
  Object.freeze({ season: "\u79CB", vacuousElement: "\u6728" }),
  // 申
  Object.freeze({ season: "\u79CB", vacuousElement: "\u6728" }),
  // 酉
  Object.freeze({ season: "\u79CB", vacuousElement: "\u6728" }),
  // 戌
  Object.freeze({ season: "\u51AC", vacuousElement: "\u706B" })
  // 亥
]);
function seasonVacuous(monthBranch) {
  return SEASON_VACUOUS[monthBranch];
}
const SHICHEN = Object.freeze(
  BRANCHES.map((name, index) => {
    const startHour = (index * 2 + 23) % 24;
    const endHour = (startHour + 2) % 24;
    return Object.freeze({
      index,
      name: `${name}\u65F6`,
      branch: name,
      startHour,
      endHour,
      range: `${pad(startHour)}:00 - ${pad(endHour)}:00`
    });
  })
);
const TWELVE_OFFICE = Object.freeze([
  { name: "\u9752\u9F99", auspicious: true },
  { name: "\u660E\u5802", auspicious: true },
  { name: "\u5929\u5211", auspicious: false },
  { name: "\u6731\u96C0", auspicious: false },
  { name: "\u91D1\u532E", auspicious: true },
  { name: "\u5929\u5FB7", auspicious: true },
  { name: "\u767D\u864E", auspicious: false },
  { name: "\u7389\u5802", auspicious: true },
  { name: "\u5929\u7262", auspicious: false },
  { name: "\u7384\u6B66", auspicious: false },
  { name: "\u53F8\u547D", auspicious: true },
  { name: "\u52FE\u9648", auspicious: false }
]);
const JIANCHU = Object.freeze([
  { name: "\u5EFA", suitable: "\u51FA\u884C\u3001\u4E0A\u4EFB\u3001\u7948\u798F", avoid: "\u52A8\u571F\u3001\u5F00\u4ED3" },
  { name: "\u9664", suitable: "\u626B\u820D\u3001\u6CBB\u75C5\u3001\u89E3\u9664", avoid: "\u51FA\u884C\u3001\u6C42\u8D22" },
  { name: "\u6EE1", suitable: "\u796D\u7940\u3001\u7948\u798F\u3001\u5F00\u5E02", avoid: "\u670D\u836F" },
  { name: "\u5E73", suitable: "\u4FEE\u9970\u3001\u6574\u5E73\u9053\u8DEF", avoid: "\u6C42\u533B" },
  { name: "\u5B9A", suitable: "\u51A0\u7B04\u3001\u5B89\u5E8A\u3001\u5AC1\u5A36", avoid: "\u8BC9\u8BBC" },
  { name: "\u6267", suitable: "\u9020\u5C4B\u3001\u6536\u8D2D\u3001\u6355\u6349", avoid: "\u5F00\u5E02" },
  { name: "\u7834", suitable: "\u7834\u5C4B\u574F\u57A3\u3001\u6C42\u533B", avoid: "\u5AC1\u5A36\u3001\u5F00\u5E02" },
  { name: "\u5371", suitable: "\u5B89\u5E8A\u3001\u796D\u7940", avoid: "\u767B\u9AD8\u3001\u884C\u8239" },
  { name: "\u6210", suitable: "\u5F00\u5E02\u3001\u5AC1\u5A36\u3001\u5165\u5B66", avoid: "\u8BC9\u8BBC" },
  { name: "\u6536", suitable: "\u7EB3\u8D22\u3001\u8FDB\u4EBA\u53E3", avoid: "\u5F00\u4ED3" },
  { name: "\u5F00", suitable: "\u5F00\u5E02\u3001\u5165\u5B66\u3001\u52A8\u571F", avoid: "\u5B89\u846C" },
  { name: "\u95ED", suitable: "\u7B51\u5824\u3001\u57CB\u7A74\u3001\u5B89\u846C", avoid: "\u5F00\u5E02\u3001\u51FA\u884C" }
]);
const SOLAR_TERMS = Object.freeze([
  { name: "\u7ACB\u6625", month: 2, day: 4, kind: "\u8282", branch: 2, solar: "\u4E1C\u98CE\u89E3\u51BB\uFF0C\u86F0\u866B\u59CB\u632F\uFF0C\u9C7C\u965F\u8D1F\u51B0" },
  { name: "\u96E8\u6C34", month: 2, day: 19, kind: "\u4E2D\u6C14", solar: "\u736D\u796D\u9C7C\uFF0C\u9E3F\u96C1\u6765\uFF0C\u8349\u6728\u840C\u52A8" },
  { name: "\u60CA\u86F0", month: 3, day: 6, kind: "\u8282", branch: 3, solar: "\u6843\u59CB\u534E\uFF0C\u4ED3\u5E9A\u9E23\uFF0C\u9E70\u5316\u4E3A\u9E20" },
  { name: "\u6625\u5206", month: 3, day: 21, kind: "\u4E2D\u6C14", solar: "\u7384\u9E1F\u81F3\uFF0C\u96F7\u4E43\u53D1\u58F0\uFF0C\u59CB\u7535" },
  { name: "\u6E05\u660E", month: 4, day: 5, kind: "\u8282", branch: 4, solar: "\u6850\u59CB\u534E\uFF0C\u7530\u9F20\u5316\u4E3A\u9D3D\uFF0C\u8679\u59CB\u89C1" },
  { name: "\u8C37\u96E8", month: 4, day: 20, kind: "\u4E2D\u6C14", solar: "\u840D\u59CB\u751F\uFF0C\u9E23\u9E20\u62C2\u5176\u7FBD\uFF0C\u6234\u80DC\u964D\u4E8E\u6851" },
  { name: "\u7ACB\u590F", month: 5, day: 6, kind: "\u8282", branch: 5, solar: "\u877C\u8748\u9E23\uFF0C\u86AF\u8693\u51FA\uFF0C\u738B\u74DC\u751F" },
  { name: "\u5C0F\u6EE1", month: 5, day: 21, kind: "\u4E2D\u6C14", solar: "\u82E6\u83DC\u79C0\uFF0C\u9761\u8349\u6B7B\uFF0C\u9EA6\u79CB\u81F3" },
  { name: "\u8292\u79CD", month: 6, day: 6, kind: "\u8282", branch: 6, solar: "\u87B3\u8782\u751F\uFF0C\u9D59\u59CB\u9E23\uFF0C\u53CD\u820C\u65E0\u58F0" },
  { name: "\u590F\u81F3", month: 6, day: 21, kind: "\u4E2D\u6C14", solar: "\u9E7F\u89D2\u89E3\uFF0C\u8729\u59CB\u9E23\uFF0C\u534A\u590F\u751F" },
  { name: "\u5C0F\u6691", month: 7, day: 7, kind: "\u8282", branch: 7, solar: "\u6E29\u98CE\u81F3\uFF0C\u87CB\u87C0\u5C45\u58C1\uFF0C\u9E70\u59CB\u631A" },
  { name: "\u5927\u6691", month: 7, day: 23, kind: "\u4E2D\u6C14", solar: "\u8150\u8349\u4E3A\u8424\uFF0C\u571F\u6DA6\u6EBD\u6691\uFF0C\u5927\u96E8\u65F6\u884C" },
  { name: "\u7ACB\u79CB", month: 8, day: 8, kind: "\u8282", branch: 8, solar: "\u51C9\u98CE\u81F3\uFF0C\u767D\u9732\u964D\uFF0C\u5BD2\u8749\u9E23" },
  { name: "\u5904\u6691", month: 8, day: 23, kind: "\u4E2D\u6C14", solar: "\u9E70\u4E43\u796D\u9E1F\uFF0C\u5929\u5730\u59CB\u8083\uFF0C\u79BE\u4E43\u767B" },
  { name: "\u767D\u9732", month: 9, day: 8, kind: "\u8282", branch: 9, solar: "\u9E3F\u96C1\u6765\uFF0C\u96C0\u5165\u5927\u6C34\u4E3A\u86E4\uFF0C\u83CA\u6709\u9EC4\u534E" },
  { name: "\u79CB\u5206", month: 9, day: 23, kind: "\u4E2D\u6C14", solar: "\u96F7\u59CB\u6536\u58F0\uFF0C\u86F0\u866B\u576F\u6237\uFF0C\u6C34\u59CB\u6DB8" },
  { name: "\u5BD2\u9732", month: 10, day: 8, kind: "\u8282", branch: 10, solar: "\u9E3F\u96C1\u6765\u5BBE\uFF0C\u96C0\u5165\u5927\u6C34\u4E3A\u86E4\uFF0C\u83CA\u6709\u9EC4\u534E" },
  { name: "\u971C\u964D", month: 10, day: 23, kind: "\u4E2D\u6C14", solar: "\u8C7A\u4E43\u796D\u517D\uFF0C\u8349\u6728\u9EC4\u843D\uFF0C\u86F0\u866B\u54B8\u4FEF" },
  { name: "\u7ACB\u51AC", month: 11, day: 7, kind: "\u8282", branch: 11, solar: "\u6C34\u59CB\u51B0\uFF0C\u5730\u59CB\u51BB\uFF0C\u96C9\u5165\u5927\u6C34\u4E3A\u8703" },
  { name: "\u5C0F\u96EA", month: 11, day: 22, kind: "\u4E2D\u6C14", solar: "\u8679\u85CF\u4E0D\u89C1\uFF0C\u5929\u6C14\u4E0A\u5347\u5730\u6C14\u4E0B\u964D" },
  { name: "\u5927\u96EA", month: 12, day: 7, kind: "\u8282", branch: 0, solar: "\u9E56\u9D20\u4E0D\u9E23\uFF0C\u864E\u59CB\u4EA4\uFF0C\u8354\u633A\u51FA" },
  { name: "\u51AC\u81F3", month: 12, day: 22, kind: "\u4E2D\u6C14", solar: "\u86AF\u8693\u7ED3\uFF0C\u9E8B\u89D2\u89E3\uFF0C\u6C34\u6CC9\u52A8" },
  { name: "\u5C0F\u5BD2", month: 1, day: 6, kind: "\u8282", branch: 1, solar: "\u96C1\u5317\u4E61\uFF0C\u9E4A\u59CB\u5DE2\uFF0C\u96C9\u59CB\u96CA" },
  { name: "\u5927\u5BD2", month: 1, day: 20, kind: "\u4E2D\u6C14", solar: "\u9E21\u59CB\u4E73\uFF0C\u5F81\u9E1F\u5389\u75BE\uFF0C\u6C34\u6CFD\u8179\u575A" }
].map((term) => Object.freeze(term)));
const JIE_TERMS = SOLAR_TERMS.filter((term) => term.kind === "\u8282");
function julianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}
function dayPillar(year, month, day) {
  const index = ((julianDayNumber(year, month, day) + 49) % 60 + 60) % 60;
  const stem = index % 10;
  const branch = index % 12;
  return { index, stem, branch, name: `${STEMS[stem]}${BRANCHES[branch]}` };
}
function yearPillar(year, month, day) {
  const effectiveYear = month < 2 || month === 2 && day < 4 ? year - 1 : year;
  const offset = (effectiveYear - 4) % 60;
  const stem = (offset % 10 + 10) % 10;
  const branch = (offset % 12 + 12) % 12;
  return {
    year: effectiveYear,
    index: offset,
    stem,
    branch,
    name: `${STEMS[stem]}${BRANCHES[branch]}`,
    element: STEM_ELEMENTS[stem],
    zodiac: ZODIAC[branch]
  };
}
function currentJie(year, month, day) {
  const current = month * 100 + day;
  let bestTerm = null;
  let bestOrder = -1;
  for (const term2 of JIE_TERMS) {
    const order = term2.month * 100 + term2.day;
    if (order <= current && order > bestOrder) {
      bestTerm = term2;
      bestOrder = order;
    }
  }
  const term = bestTerm ?? JIE_TERMS.find((item) => item.name === "\u5927\u96EA");
  if (!term || term.branch === void 0) throw new Error("solar term table is incomplete");
  return { term, branch: term.branch };
}
function cycleIndex(stem, branch) {
  for (let i = 0; i < 60; i += 1) {
    if (i % 10 === stem && i % 12 === branch) return i;
  }
  return -1;
}
function monthPillar(year, month, day) {
  const jie = currentJie(year, month, day);
  const yearStem = yearPillar(year, month, day).stem;
  const yinStem = (yearStem % 5 * 2 + 2) % 10;
  const stem = (yinStem + (jie.branch - 2 + 12) % 12) % 10;
  return {
    index: cycleIndex(stem, jie.branch),
    stem,
    branch: jie.branch,
    name: `${STEMS[stem]}${BRANCHES[jie.branch]}`,
    jie: jie.term.name,
    element: BRANCH_ELEMENTS[jie.branch]
  };
}
function hourPillarByBranch(dayStem, branch) {
  const stem = (dayStem % 5 * 2 + branch) % 10;
  return { index: cycleIndex(stem, branch), stem, branch, name: `${STEMS[stem]}${BRANCHES[branch]}` };
}
function hourPillar(dayStem, hour) {
  return hourPillarByBranch(dayStem, Math.floor((hour + 1) % 24 / 2));
}
function hourOffice(dayBranch, hourBranch) {
  const trigramGroup = [
    [8, 0, 4],
    [2, 6, 10],
    [5, 9, 1],
    [11, 3, 7]
  ].findIndex((group) => group.includes(dayBranch));
  const qinglongPosition = [0, 2, 5, 11][trigramGroup] ?? 0;
  const offset = (hourBranch - qinglongPosition + 12) % 12;
  const office = TWELVE_OFFICE[offset];
  return { name: office.name, auspicious: office.auspicious, type: office.auspicious ? "\u9EC4\u9053" : "\u9ED1\u9053" };
}
function jianchu(dayBranch, monthBranch) {
  return JIANCHU[((dayBranch - monthBranch) % 12 + 12) % 12];
}
function shujiu(year, month, day) {
  const dongzhi = SOLAR_TERMS.find((term) => term.name === "\u51AC\u81F3");
  if (!dongzhi) return null;
  const current = julianDayNumber(year, month, day);
  const startYear = month * 100 + day >= 1222 ? year : year - 1;
  const start = julianDayNumber(startYear, dongzhi.month, dongzhi.day);
  const elapsed = current - start;
  if (elapsed < 0 || elapsed > 80) return null;
  const round = Math.floor(elapsed / 9) + 1;
  const numerals = ["", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D"];
  const label = `${numerals[round]}\u4E5D`;
  const stage = elapsed <= 8 ? "\u5165\u4E5D" : elapsed >= 72 ? "\u51FA\u4E5D" : "\u6570\u4E5D\u4E2D";
  return { round, label, stage, elapsed, total: 81 };
}
function almanac(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const dayGanZhi = dayPillar(year, month, day);
  const yearGanZhi = yearPillar(year, month, day);
  const monthGanZhi = monthPillar(year, month, day);
  const currentHour = hourPillar(dayGanZhi.stem, hour);
  const jian = jianchu(dayGanZhi.branch, monthGanZhi.branch);
  const hours = SHICHEN.map((shichen) => {
    const pillar = hourPillarByBranch(dayGanZhi.stem, shichen.index);
    const office = hourOffice(dayGanZhi.branch, shichen.index);
    return {
      index: shichen.index,
      branch: shichen.branch,
      name: shichen.name,
      range: shichen.range,
      pillar: pillar.name,
      pillarBranch: BRANCHES[pillar.branch],
      office: office.name,
      officeType: office.type,
      auspicious: office.auspicious,
      verdict: office.auspicious ? "\u5409\u65F6" : "\u51F6\u65F6",
      current: shichen.index === currentHour.branch
    };
  });
  return {
    date: `${year}-${pad(month)}-${pad(day)}`,
    year: yearGanZhi,
    month: monthGanZhi,
    day: dayGanZhi,
    hour: { ...currentHour, name: `${BRANCHES[currentHour.branch]}\u65F6`, range: SHICHEN[currentHour.branch].range },
    jianchu: jian,
    shujiu: shujiu(year, month, day),
    currentTerm: monthGanZhi.jie,
    hours,
    luckyHours: hours.filter((item) => item.auspicious).map((item) => item.name)
  };
}
function zodiacProfile(branch) {
  const harmony = SIX_HARMONY.find((pair) => pair.includes(branch));
  const partner = harmony ? harmony[0] === branch ? harmony[1] : harmony[0] : void 0;
  const triple = TRIPLE_HARMONY.find((group) => group.branches.includes(branch));
  const conflict = (branch + 6) % 12;
  return {
    zodiac: ZODIAC[branch],
    branch: BRANCHES[branch],
    element: BRANCH_ELEMENTS[branch],
    harmony: partner === void 0 ? void 0 : ZODIAC[partner],
    triple: triple ? { name: triple.name, element: triple.element } : void 0,
    conflict: ZODIAC[conflict]
  };
}
function pad(value) {
  return String(value).padStart(2, "0");
}
export {
  BRANCHES,
  BRANCH_ELEMENTS,
  ELEMENTS,
  JIANCHU,
  SHICHEN,
  SIX_HARMONY,
  SOLAR_TERMS,
  STEMS,
  STEM_ELEMENTS,
  TRIPLE_HARMONY,
  XUNKONG_SONG,
  ZODIAC,
  almanac,
  branchClash,
  currentJie,
  dayPillar,
  hourOffice,
  hourPillar,
  hourPillarByBranch,
  jianchu,
  julianDayNumber,
  monthPillar,
  monthPo,
  muJue,
  seasonVacuous,
  shujiu,
  xunKong,
  yearPillar,
  zodiacProfile
};
