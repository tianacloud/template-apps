const randomInt = (max) => {
  const values = new Uint32Array(1);
  const limit = Math.floor(4294967296 / max) * max;
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return values[0] % max;
};
import {
  TRIGRAMS,
  earlyKey,
  hexagramByKey,
  hexagramByNumbers,
  hexagramSymbol,
  invertedHexagram,
  mutualHexagram,
  normalizeToEight,
  normalizeToSix,
  oppositeHexagram
} from "./hexagrams.mjs";
import { monthPillar, yearPillar, dayPillar, hourPillar, monthPo, xunKong, branchClash, BRANCHES, BRANCH_ELEMENTS } from "./almanac.mjs";
import { LINE_POSITIONS, responseTiming } from "./xiang.mjs";
import { lineText } from "./yao.mjs";
import { lineXiang } from "./xiang-chuan.mjs";
import { monthQi, hexagramQi } from "./guaqi.mjs";
import {
  jingfang,
  pickUseGod,
  hiddenGod,
  flyingRelation,
  shiYingRelation,
  elementRelation,
  voidReading,
  vitality,
  sixGods,
  SIX_GOD_MEANING,
  RELATIVE_MEANING,
  transformRelation,
  jinTui,
  useGodCircle,
  dayClashReading,
  heCombineReading,
  punishReading,
  hexagramClash,
  fanfuReading
} from "./jingfang.mjs";
import { detectTopic, godRelation, topicByKey, TOPIC_CLASSES } from "./topics.mjs";
const GENERATES = Object.freeze({ \u6728: "\u706B", \u706B: "\u571F", \u571F: "\u91D1", \u91D1: "\u6C34", \u6C34: "\u6728" });
const OVERCOMES = Object.freeze({ \u6728: "\u571F", \u571F: "\u6C34", \u6C34: "\u706B", \u706B: "\u91D1", \u91D1: "\u6728" });
function generates(a, b) {
  return GENERATES[a] === b;
}
function overcomes(a, b) {
  return OVERCOMES[a] === b;
}
const POSITION_LABELS = Object.freeze(["\u521D\u723B", "\u4E8C\u723B", "\u4E09\u723B", "\u56DB\u723B", "\u4E94\u723B", "\u4E0A\u723B"]);
const BRANCH_NAMES = Object.freeze(["\u5B50", "\u4E11", "\u5BC5", "\u536F", "\u8FB0", "\u5DF3", "\u5348", "\u672A", "\u7533", "\u9149", "\u620C", "\u4EA5"]);
function pad2(value) {
  return String(value).padStart(2, "0");
}
function counterpart(position) {
  if (position <= 3) return position + 3;
  return position - 3;
}
function buildLines(key, positions, sums, order = 0) {
  const moving = new Set(positions);
  return [...key].map((line, index) => {
    const position = index + 1;
    const value = (
      /** @type {0|1} */
      line === "1" ? 1 : 0
    );
    const sum = sums[index] ?? null;
    const isMoving = moving.has(position);
    const changed = isMoving ? value === 1 ? 0 : 1 : value;
    let kind = "\u9759\u723B";
    if (isMoving) kind = value === 1 ? "\u8001\u9633" : "\u8001\u9634";
    else if (sum === 7) kind = "\u5C11\u9633";
    else if (sum === 8) kind = "\u5C11\u9634";
    const text = order ? lineText(order, position) : null;
    return {
      position,
      label: POSITION_LABELS[index],
      value,
      changed: (
        /** @type {0|1} */
        changed
      ),
      sum,
      kind,
      moving: isMoving,
      text,
      title: text ? text.slice(0, text.indexOf("\uFF1A")) : null,
      xiang: order ? lineXiang(order, position) : null
    };
  });
}
function afterColon(entry) {
  if (!entry) return "";
  const at = entry.indexOf("\uFF1A");
  return at < 0 ? entry : entry.slice(at + 1);
}
function changedKey(lines) {
  return lines.map((line) => String(line.changed)).join("");
}
function castByTime(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const yearGanZhi = yearPillar(year, month, day);
  const monthGanZhi = monthPillar(year, month, day);
  const dayGanZhi = dayPillar(year, month, day);
  const hourGanZhi = hourPillar(dayGanZhi.stem, hour);
  const yearNumber = yearGanZhi.branch + 1;
  const hourNumber = hourGanZhi.branch + 1;
  const upperNumber = normalizeToEight(yearNumber + month + day);
  const lowerNumber = normalizeToEight(yearNumber + month + day + hourNumber);
  const position = normalizeToSix(yearNumber + month + day + hourNumber);
  const nextDate = new Date(date);
  const nextBranch = (hourGanZhi.branch + 1) % 12;
  nextDate.setHours((nextBranch * 2 + 23) % 24, 0, 0, 0);
  const nextHourNumber = nextBranch + 1;
  const nextHexagram = hexagramByNumbers(
    normalizeToEight(yearNumber + month + day),
    normalizeToEight(yearNumber + month + day + nextHourNumber)
  );
  const nextPosition = normalizeToSix(yearNumber + month + day + nextHourNumber);
  return {
    method: "\u65F6\u95F4\u8D77\u5366",
    summary: "\u4EE5\u5E74\u652F\u5E8F\u52A0\u516C\u5386\u6708\u3001\u65E5\u5F97\u4E0A\u4E0B\u5366\uFF0C\u518D\u52A0\u65F6\u652F\u5E8F\u5F97\u52A8\u723B\u3002",
    cadence: {
      basis: "\u65F6\u8FB0",
      current: `${BRANCH_NAMES[hourGanZhi.branch]}\u65F6\uFF08${pad2(date.getHours())}:00 \u8D77\uFF0C\u4E24\u5C0F\u65F6\u4E00\u6362\uFF09`,
      next: `${BRANCH_NAMES[nextBranch]}\u65F6\u5F97${nextHexagram.name}\uFF0C\u52A8${POSITION_LABELS[nextPosition - 1]}`,
      text: `\u65F6\u95F4\u8D77\u5366\u6309\u65F6\u8FB0\u53D6\u6570\uFF0C\u4E24\u5C0F\u65F6\u4E00\u6362\uFF0C\u540C\u4E00\u65F6\u8FB0\u5185\u7ED3\u679C\u76F8\u540C\uFF0C\u8DE8\u65F6\u8FB0\u5373\u53D8\u3002\u73B0\u8D77${BRANCH_NAMES[hourGanZhi.branch]}\u65F6\u4E4B\u5366\uFF1B\u5230${BRANCH_NAMES[nextBranch]}\u65F6\u518D\u8D77\uFF0C\u5C06\u5F97${nextHexagram.name}\u3002`
    },
    detail: [
      { label: "\u5E74\u652F\u5E8F", value: `${yearGanZhi.name}\uFF08${yearNumber}\uFF09` },
      { label: "\u6708 \xB7 \u65E5", value: `${month} + ${day}` },
      { label: "\u65F6\u652F\u5E8F", value: `${hourGanZhi.name}\uFF08${hourNumber}\uFF09\uFF0C${BRANCH_NAMES[hourGanZhi.branch]}\u65F6` },
      { label: "\u4E0A\u5366", value: `${(yearNumber + month + day).toString()} \u9664 8 \u4F59 ${upperNumber} \u2192 ${TRIGRAMS[earlyKey(upperNumber)].name}` },
      { label: "\u4E0B\u5366", value: `${(yearNumber + month + day + hourNumber).toString()} \u9664 8 \u4F59 ${lowerNumber} \u2192 ${TRIGRAMS[earlyKey(lowerNumber)].name}` },
      { label: "\u52A8\u723B", value: `${(yearNumber + month + day + hourNumber).toString()} \u9664 6 \u4F59 ${position} \u2192 ${POSITION_LABELS[position - 1]}` }
    ],
    hexagram: hexagramByNumbers(upperNumber, lowerNumber),
    positions: [position],
    sums: Array.from({ length: 6 }, () => null)
  };
}
function castByNumbers(upperNumber, lowerNumber) {
  const upper = normalizeToEight(upperNumber);
  const lower = normalizeToEight(lowerNumber);
  const position = normalizeToSix(upperNumber + lowerNumber);
  return {
    method: "\u6570\u5B57\u8D77\u5366",
    summary: "\u4EE5\u4E24\u4E2A\u6570\u5B57\u5206\u53D6\u4E0A\u4E0B\u5366\uFF0C\u4E24\u6570\u4E4B\u548C\u53D6\u52A8\u723B\u3002",
    cadence: {
      basis: "\u6240\u53D6\u4E4B\u6570",
      current: `\u672C\u6B21\u53D6\u6570 ${upperNumber} \u4E0E ${lowerNumber}`,
      next: "\u6362\u4E00\u7EC4\u6570\u5B57\u5373\u5F97\u53E6\u4E00\u5366",
      text: "\u6570\u5B57\u8D77\u5366\u7531\u4F60\u5FC3\u91CC\u9ED8\u5FF5\u7684\u4E24\u6570\u51B3\u5B9A\uFF0C\u6570\u5B57\u76F8\u540C\u81EA\u7136\u5366\u76F8\u540C\u2014\u2014\u8FD9\u662F\u53D6\u6570\uFF0C\u4E0D\u662F\u968F\u673A\u3002\u5FC3\u91CC\u5148\u6709\u4E8B\u518D\u9ED8\u5FF5\u6570\u5B57\uFF0C\u624D\u7B97\u5E94\u4E86\u300C\u4EE5\u6570\u8D77\u5366\u300D\u7684\u672C\u610F\u3002"
    },
    detail: [
      { label: "\u7B2C\u4E00\u6570", value: `${upperNumber} \u9664 8 \u4F59 ${upper} \u2192 ${TRIGRAMS[earlyKey(upper)].name}\u5366` },
      { label: "\u7B2C\u4E8C\u6570", value: `${lowerNumber} \u9664 8 \u4F59 ${lower} \u2192 ${TRIGRAMS[earlyKey(lower)].name}\u5366` },
      { label: "\u52A8\u723B", value: `${upperNumber + lowerNumber} \u9664 6 \u4F59 ${position} \u2192 ${POSITION_LABELS[position - 1]}` }
    ],
    hexagram: hexagramByNumbers(upper, lower),
    positions: [position],
    sums: Array.from({ length: 6 }, () => null)
  };
}
function castByHexagram(hexagram) {
  return castByNumbers(hexagram.upperTrigram.early, hexagram.lowerTrigram.early);
}
function castDaily(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const upper = normalizeToEight(year + month + day);
  const lower = normalizeToEight(year + 2 * month + day);
  const position = normalizeToSix(year + 3 * month + day);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tYear = tomorrow.getFullYear();
  const tMonth = tomorrow.getMonth() + 1;
  const tDay = tomorrow.getDate();
  const tomorrowHexagram = hexagramByNumbers(
    normalizeToEight(tYear + tMonth + tDay),
    normalizeToEight(tYear + 2 * tMonth + tDay)
  );
  return {
    method: "\u6BCF\u65E5\u4E00\u5366",
    summary: "\u6309\u5E74\u6708\u65E5\u786E\u5B9A\u6027\u63A8\u7B97\uFF0C\u540C\u4E00\u5929\u8D77\u5366\u7ED3\u679C\u4E0D\u53D8\u3002",
    cadence: {
      basis: "\u65E5\u671F",
      current: `${year} \u5E74 ${month} \u6708 ${day} \u65E5\u4E4B\u5366`,
      next: `\u660E\u65E5\uFF08${tMonth}/${tDay}\uFF09\u5F97${tomorrowHexagram.name}`,
      text: `\u6BCF\u65E5\u4E00\u5366\u4E00\u65E5\u4E00\u6362\uFF0C\u540C\u4E00\u5929\u5185\u53CD\u590D\u8D77\u5366\u81EA\u7136\u662F\u540C\u4E00\u4E2A\u5366\uFF0C\u6B21\u65E5\u96F6\u70B9\u540E\u5373\u53D8\u3002\u660E\u65E5\u4E4B\u5366\u4E3A${tomorrowHexagram.name}\u3002\u60F3\u968F\u65F6\u968F\u5730\u8D77\u4E0D\u540C\u7684\u5366\uFF0C\u8BF7\u7528\u94DC\u94B1\u6447\u5366\u6216\u6570\u5B57\u8D77\u5366\u3002`
    },
    detail: [
      { label: "\u65E5\u671F", value: `${year} \u5E74 ${month} \u6708 ${day} \u65E5` },
      { label: "\u4E0A\u5366", value: `${year} + ${month} + ${day} = ${year + month + day}\uFF0C\u9664 8 \u4F59 ${upper} \u2192 ${TRIGRAMS[earlyKey(upper)].name}` },
      { label: "\u4E0B\u5366", value: `${year} + ${2 * month} + ${day} = ${year + 2 * month + day}\uFF0C\u9664 8 \u4F59 ${lower} \u2192 ${TRIGRAMS[earlyKey(lower)].name}` },
      { label: "\u52A8\u723B", value: `${year} + ${3 * month} + ${day} = ${year + 3 * month + day}\uFF0C\u9664 6 \u4F59 ${position} \u2192 ${POSITION_LABELS[position - 1]}` }
    ],
    hexagram: hexagramByNumbers(upper, lower),
    positions: [position],
    sums: Array.from({ length: 6 }, () => null)
  };
}
function tossCoins() {
  const coins = [randomInt(2) === 1, randomInt(2) === 1, randomInt(2) === 1];
  const sum = coins.reduce((total, isBack) => total + (isBack ? 3 : 2), 0);
  return { sum, coins };
}
function castByCoins(sums) {
  if (!Array.isArray(sums) || sums.length !== 6 || sums.some((sum) => !Number.isInteger(sum) || sum < 6 || sum > 9)) {
    throw new Error("\u516D\u6B21\u63B7\u94B1\u7ED3\u679C\u5FC5\u987B\u662F 6 \u5230 9 \u4E4B\u95F4\u7684\u6574\u6570");
  }
  const key = sums.map((sum) => sum === 7 || sum === 9 ? "1" : "0").join("");
  const positions = sums.reduce(
    (list, sum, index) => sum === 6 || sum === 9 ? [...list, index + 1] : list,
    /** @type {number[]} */
    []
  );
  return {
    method: "\u6447\u5366",
    summary: "\u4E09\u679A\u94DC\u94B1\u63B7\u516D\u6B21\uFF0C\u81EA\u521D\u723B\u5411\u4E0A\u6210\u5366\uFF0C\u516D\u4E3A\u8001\u9634\u3001\u4E5D\u4E3A\u8001\u9633\u3002",
    cadence: {
      basis: "\u94DC\u94B1",
      current: `\u672C\u6B21\u63B7\u51FA ${sums.map((sum) => sum).join("\u3001")}`,
      next: "\u91CD\u63B7\u4E00\u6B21\u5373\u5F97\u53E6\u4E00\u5366",
      text: "\u6447\u5366\u7531\u94DC\u94B1\u968F\u673A\u800C\u6210\uFF0C\u6BCF\u4E00\u5366\u90FD\u4E0D\u4E00\u6837\uFF0C\u662F\u56DB\u6CD5\u4E2D\u6700\u63A5\u8FD1\u53E4\u6CD5\u7684\u4E00\u79CD\u3002"
    },
    detail: [
      { label: "\u63B7\u94B1", value: sums.map((sum) => `${sum}`).join(" \xB7 ") },
      { label: "\u52A8\u723B", value: positions.length ? positions.map((p) => POSITION_LABELS[p - 1]).join("\u3001") : "\u65E0\uFF08\u516D\u723B\u7686\u9759\uFF09" }
    ],
    hexagram: hexagramByKey(key),
    positions,
    sums
  };
}
function judgeRelation(bodyElement, useElement) {
  if (bodyElement === useElement) {
    return {
      key: "\u6BD4\u548C",
      verdict: "\u5409",
      weight: 1,
      text: `\u4F53\u5366${bodyElement}\u4E0E\u7528\u5366${useElement}\u540C\u6C14\u76F8\u6C42\uFF0C\u662F\u6BD4\u548C\u4E4B\u8C61\u3002\u5F7C\u6B64\u7ACB\u573A\u4E00\u81F4\uFF0C\u4E8B\u60C5\u5C11\u6709\u963B\u6EDE\uFF0C\u6309\u65E2\u5B9A\u8282\u594F\u63A8\u8FDB\u5373\u53EF\u3002`
    };
  }
  if (generates(useElement, bodyElement)) {
    return {
      key: "\u7528\u751F\u4F53",
      verdict: "\u5927\u5409",
      weight: 2,
      text: `\u7528\u5366${useElement}\u751F\u4F53\u5366${bodyElement}\uFF0C\u662F\u5BF9\u65B9\u4E3B\u52A8\u6765\u5C31\u6211\u3002\u5F97\u529B\u3001\u5F97\u52A9\u3001\u5F97\u4EBA\uFF0C\u963B\u529B\u6700\u5C0F\uFF0C\u662F\u56DB\u79CD\u5173\u7CFB\u91CC\u6700\u987A\u7684\u4E00\u79CD\u3002`
    };
  }
  if (overcomes(bodyElement, useElement)) {
    return {
      key: "\u4F53\u514B\u7528",
      verdict: "\u5C0F\u5409",
      weight: 1,
      text: `\u4F53\u5366${bodyElement}\u514B\u7528\u5366${useElement}\uFF0C\u662F\u6211\u80FD\u5236\u4F4F\u5C40\u9762\u3002\u4E8B\u60C5\u591A\u534A\u80FD\u529E\u6210\uFF0C\u4F46\u8981\u8D39\u4E9B\u5468\u6298\uFF0C\u5C5E\u4E8E\u4E3B\u52A8\u6743\u5728\u6211\u3001\u4EE3\u4EF7\u4E5F\u7531\u6211\u627F\u62C5\u3002`
    };
  }
  if (generates(bodyElement, useElement)) {
    return {
      key: "\u4F53\u751F\u7528",
      verdict: "\u51F6",
      weight: -1,
      text: `\u4F53\u5366${bodyElement}\u751F\u7528\u5366${useElement}\uFF0C\u662F\u6211\u8017\u81EA\u5DF1\u53BB\u6210\u5168\u5BF9\u65B9\u3002\u4E3B\u52A8\u6295\u5165\u5374\u6536\u4E0D\u56DE\uFF0C\u662F\u56DB\u79CD\u5173\u7CFB\u91CC\u6700\u8D39\u529B\u7684\u4E00\u79CD\uFF0C\u4E0D\u5B9C\u52C9\u5F3A\u3002`
    };
  }
  return {
    key: "\u7528\u514B\u4F53",
    verdict: "\u51F6",
    weight: -2,
    text: `\u7528\u5366${useElement}\u514B\u4F53\u5366${bodyElement}\uFF0C\u662F\u5BF9\u65B9\u538B\u5236\u6211\u3002\u5904\u5883\u88AB\u52A8\u3001\u53D7\u5236\u4E8E\u4EBA\uFF0C\u5B9C\u5B88\u4E0D\u5B9C\u653B\uFF0C\u5148\u907F\u5176\u950B\u3002`
  };
}
const TOPIC_OBJECTS = Object.freeze({
  wealth: "\u8FD9\u7B14\u8FDB\u9879",
  career: "\u8FD9\u4EFD\u524D\u7A0B",
  love: "\u8FD9\u6BB5\u5173\u7CFB",
  marriage: "\u8FD9\u6869\u5A5A\u4E8B",
  health: "\u8FD9\u6869\u75C5\u75C7",
  study: "\u8FD9\u573A\u8003\u8BD5\u6216\u8FD9\u7EB8\u6587\u4E66",
  property: "\u8FD9\u5904\u623F\u4EA7\u6216\u8FD9\u7EB8\u5951",
  dispute: "\u8FD9\u6869\u662F\u975E",
  journey: "\u8FD9\u8D9F\u884C\u7A0B\u6216\u8FD9\u4EF6\u5931\u7269"
});
const RELATION_FLAVOUR = Object.freeze({
  \u7528\u751F\u4F53: "\u5916\u5934\u6709\u4EBA\u6765\u6210\u5C31\u4F60",
  \u4F53\u514B\u7528: "\u8FD9\u4EF6\u4E8B\u4F60\u538B\u5F97\u4F4F",
  \u6BD4\u548C: "\u4E24\u8FB9\u7ACB\u573A\u7AD9\u5F97\u4E00\u822C\u9F50",
  \u4F53\u751F\u7528: "\u8FD9\u4EF6\u4E8B\u8981\u4F60\u5F80\u5916\u638F",
  \u7528\u514B\u4F53: "\u5916\u5934\u7684\u529B\u538B\u7740\u8FD9\u4EF6\u4E8B"
});
function topicSentence(topic, relationKey, label) {
  if (!topic) return null;
  const object = TOPIC_OBJECTS[topic.key];
  const flavour = RELATION_FLAVOUR[relationKey];
  if (!object || !flavour) return null;
  const strength = label === "\u5927\u5409" || label === "\u5409" ? "\u8FD9\u4E00\u5366\u843D\u5728\u5B83\u4E0A\u9762\u662F\u987A\u7684" : label === "\u5E73" ? "\u5B83\u4E0A\u8FD8\u770B\u4E0D\u51FA\u5F3A\u5F31" : "\u8FD9\u4E00\u5366\u843D\u5728\u5B83\u4E0A\u9762\u4E0D\u987A";
  return `\u95EE\u7684\u662F${topic.label}\uFF0C\u5366\u91CC\u8BF4\u7684\u5C31\u662F${object}\u2014\u2014${flavour}\uFF0C${strength}\u3002`;
}
const VITALITY_PLAIN = Object.freeze({
  \u65FA: "\u4F60\u6B64\u523B\u6700\u6709\u529B\u6C14",
  \u76F8: "\u6709\u4EBA\u6258\u7740\u4F60\uFF0C\u4E0D\u7B97\u6700\u5F3A\u4F46\u7AD9\u5F97\u4F4F",
  \u4F11: "\u4F60\u4F7F\u4E0D\u4E0A\u52B2\uFF0C\u8FD9\u4E00\u56DE\u5F97\u501F\u5916\u529B",
  \u56DA: "\u4F60\u88AB\u5C40\u9762\u56F0\u4F4F\uFF0C\u5904\u5883\u53D7\u5236",
  \u6B7B: "\u4F60\u6C14\u529B\u6700\u5F31\uFF0C\u6B64\u65F6\u5F3A\u63A8\u53CD\u800C\u5403\u4E8F"
});
function buildPlain({ question, topic, topicLine, verdict, body, use, timing, advice }) {
  const flavour = RELATION_FLAVOUR[verdict.key] ?? "\u4E24\u8005\u5173\u7CFB\u4E0D\u4E0A\u4E0D\u4E0B";
  const adjust = verdict.relationVerdict !== verdict.label ? `\u7167\u4E24\u4EBA\u4E4B\u95F4\u7684\u5173\u7CFB\u672C\u8BE5\u662F${verdict.relationVerdict}\uFF0C\u4F60\u8FD9\u4E2A\u6708\u7684\u72B6\u6001\u628A\u5B83\u62C9\u5230\u4E86\u300C${verdict.label}\u300D\u3002` : "";
  return {
    ask: question ? `\u4F60\u95EE\u7684\u662F\u300C${question}\u300D\u3002` : "\u4F60\u6CA1\u5199\u5177\u4F53\u95EE\u4EC0\u4E48\uFF0C\u6211\u6309\u8D77\u5366\u5F53\u65F6\u7684\u65F6\u8FB0\u7ED9\u4F60\u770B\u8FD9\u4E00\u5366\u3002",
    topic: topic ? `\u6211\u628A\u5B83\u5F52\u5230\u300C${topic.label}\u300D\u8FD9\u4E00\u7C7B\u2014\u2014\u8FD9\u4E00\u7C7B\u4EE5${topic.element}\u4E3A\u4E8B\u3002` : "\u4F60\u95EE\u7684\u4E8B\u4E0D\u5728\u90A3\u4E5D\u7C7B\u91CC\uFF0C\u4E8B\u7C7B\u5148\u7A7A\u7740\uFF0C\u65F6\u95F4\u4E0A\u6309\u90A3\u4EF6\u4E8B\u672C\u8EAB\u7B97\u3002",
    verdict: `\u8FD9\u4E00\u5366\u7ED9\u7684\u662F\u300C${verdict.label}\u300D\uFF0C${verdict.summary.split("\uFF1A").slice(1).join("\uFF1A") || "\u6CA1\u6709\u504F\u5411"}\u3002`,
    // 这一句是整块里最要紧的翻译：体卦是你、用卦是那件事、旺衰是你此刻的劲。
    why: `\u4F53\u5366${body.name}${body.element}\u662F\u4F60\uFF0C\u7528\u5366${use.name}${use.element}\u662F\u90A3\u4EF6\u4E8B\u2014\u2014${flavour}\uFF1B${VITALITY_PLAIN[verdict.vitality] ?? "\u4F60\u6B64\u523B\u7684\u72B6\u6001\u4E0D\u4E0A\u4E0D\u4E0B"}\u3002${adjust}`,
    onTopic: topicLine ?? "",
    timing: timing ? `\u65F6\u95F4\u4E0A\uFF1A${timing.wang}\u6708\u6216${timing.wang}\u65E5\u89C1\u7AEF\u502A\uFF0C\u5230${timing.xiang}\u524D\u540E\u6E10\u660E\u3002` : "",
    actions: `\u8BE5\u505A\u7684\u662F\uFF1A${advice.suitable.join("\u3001")}\u3002\u522B\u505A\u7684\u662F\uFF1A${advice.avoid.join("\u3001")}\u3002`,
    caution: advice.caution
  };
}
function judgeScore(score) {
  if (score >= 2) return { label: "\u5927\u5409", summary: "\u5927\u5409\uFF1A\u53EF\u8FDB" };
  if (score >= 1) return { label: "\u5409", summary: "\u5409\uFF1A\u5B9C\u884C" };
  if (score <= -2) return { label: "\u5927\u51F6", summary: "\u5927\u51F6\uFF1A\u5B9C\u6B62" };
  if (score <= -1) return { label: "\u51F6", summary: "\u51F6\uFF1A\u5B9C\u5B88" };
  return { label: "\u5E73", summary: "\u5E73\uFF1A\u5F85\u65F6" };
}
function buildReading(cast, options = {}) {
  const now = options.now ?? /* @__PURE__ */ new Date();
  const question = (options.question ?? "").trim();
  const { hexagram, positions, sums } = cast;
  const lines = buildLines(hexagram.key, positions, sums, hexagram.order);
  const movingLines = lines.filter((line) => line.moving);
  const hasChange = movingLines.length > 0;
  const changed = hasChange ? hexagramByKey(changedKey(lines)) : null;
  const mutual = mutualHexagram(hexagram);
  const opposite = oppositeHexagram(hexagram);
  const inverted = invertedHexagram(hexagram);
  const primaryPosition = positions[0] ?? 1;
  const bodyIsLower = primaryPosition <= 3;
  const bodyKey = bodyIsLower ? hexagram.lower : hexagram.upper;
  const useKey = bodyIsLower ? hexagram.upper : hexagram.lower;
  const body = TRIGRAMS[bodyKey];
  const use = TRIGRAMS[useKey];
  const shiyinPosition = counterpart(primaryPosition);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const monthBranch = monthPillar(year, month, day).branch;
  const monthElement = monthPillar(year, month, day).element;
  const bodyVitality = vitality(body.element, monthElement);
  const useVitality = vitality(use.element, monthElement);
  const relation = judgeRelation(body.element, use.element);
  const monthLord = monthQi(monthBranch);
  const selfQi = hexagramQi(hexagram.key);
  const explicitTopic = topicByKey(options.topic);
  const topic = explicitTopic ?? detectTopic(question);
  const topicSource = explicitTopic ? "explicit" : topic ? "detected" : null;
  const god = topic ? godRelation(topic.element, body.element, generates, overcomes) : null;
  const timing = topic ? responseTiming(topic.element, `${topic.label}\u7C7B\u795E`) : responseTiming(use.element, `\u7528\u5366${use.name}`);
  const linePosition = LINE_POSITIONS[primaryPosition - 1];
  const structure = {
    body: { key: bodyKey, name: body.name, element: body.element, nature: body.nature, image: body.image, direction: body.direction, position: bodyIsLower ? "\u5185\u5366\uFF08\u4E0B\u5366\uFF09" : "\u5916\u5366\uFF08\u4E0A\u5366\uFF09" },
    use: { key: useKey, name: use.name, element: use.element, nature: use.nature, image: use.image, direction: use.direction, position: bodyIsLower ? "\u5916\u5366\uFF08\u4E0A\u5366\uFF09" : "\u5185\u5366\uFF08\u4E0B\u5366\uFF09" },
    shi: { position: primaryPosition, label: POSITION_LABELS[primaryPosition - 1], role: "\u52A8\u723B \xB7 \u4F53\u5366" },
    ying: { position: shiyinPosition, label: POSITION_LABELS[shiyinPosition - 1], role: "\u914D\u723B \xB7 \u7528\u5366" },
    monthElement,
    bodyVitality: bodyVitality.key,
    useVitality: useVitality.key
  };
  const weight = relation.weight + (bodyVitality.tone === "strong" || bodyVitality.tone === "good" ? 1 : bodyVitality.tone === "bad" ? -1 : 0);
  const judged = judgeScore(weight);
  const verdict = {
    key: relation.key,
    label: judged.label,
    score: weight,
    summary: judged.summary,
    text: relation.text,
    relationVerdict: relation.verdict,
    vitality: bodyVitality.key,
    vitalityText: `\u4F53\u5366\u4E94\u884C\u5C5E${body.element}\uFF0C\u5F53\u6708\u4EE4\u4E3A${monthElement}\uFF0C\u65FA\u8870\u843D\u5728\u300C${bodyVitality.key}\u300D\u3002${{ \u65FA: "\u4F53\u5366\u5F97\u4EE4\uFF0C\u6240\u6C42\u4E4B\u4E8B\u6839\u57FA\u7A33\u3002", \u76F8: "\u4F53\u5366\u5F97\u6708\u4EE4\u4E4B\u52A9\uFF0C\u867D\u975E\u6700\u5F3A\u4F46\u6709\u6258\u5E95\u3002", \u4F11: "\u4F53\u5366\u5931\u4EE4\u800C\u4F11\uFF0C\u529B\u91CF\u4E0D\u8DB3\uFF0C\u5B9C\u501F\u5916\u529B\u3002", \u56DA: "\u4F53\u5366\u53D7\u6708\u4EE4\u6240\u56F0\uFF0C\u5904\u5883\u53D7\u5236\uFF0C\u5B9C\u5B88\u3002", \u6B7B: "\u4F53\u5366\u9022\u6708\u4EE4\u6B7B\u5730\uFF0C\u6C14\u529B\u6700\u5F31\uFF0C\u6B64\u65F6\u5F3A\u6C42\u4E0D\u5229\u3002" }[bodyVitality.key]}`
  };
  const insights = [];
  insights.push({ title: "\u5366\u8C61\u603B\u65AD", text: `\u672C\u5366${hexagram.name}\uFF0C${hexagram.judgment} ${hexagram.image}` });
  const yaoQuotes = movingLines.map((line) => {
    const say = line.text ? `${line.text}\u3000\u8C61\u66F0\uFF1A${afterColon(line.xiang)}` : "";
    return say;
  }).filter(Boolean);
  if (yaoQuotes.length > 0) {
    insights.push({ title: "\u52A8\u723B\u723B\u8F9E", text: yaoQuotes.join("\uFF1B") });
  }
  if (topic && god) {
    insights.push({
      title: "\u6240\u95EE\u4E4B\u4E8B",
      text: `\u6240\u95EE\u5F52\u300C${topic.label}\u300D\uFF0C\u7C7B\u795E\u53D6${topic.element}\u3002${topic.reason}${god.text}`
    });
  }
  insights.push({ title: "\u4F53\u7528\u5173\u7CFB", text: relation.text });
  insights.push({ title: "\u65FA\u8870\u5E94\u671F", text: verdict.vitalityText });
  if (monthLord) {
    const trend = monthLord.phase === "\u606F" ? "\u5F53\u6708\u9633\u6C14\u6E10\u957F\uFF0C\u4E3B\u4E8B\u6709\u63A8\u8FDB\u4E4B\u52BF" : "\u5F53\u6708\u9634\u6C14\u6E10\u76DB\uFF0C\u4E3B\u4E8B\u5B9C\u6536\u655B\u5B88\u6210";
    const self = selfQi ? `\u672C\u5366${hexagram.name}\u6B63\u5728\u5341\u4E8C\u8F9F\u5366\u4E4B\u4E2D\uFF0C\u4E3A${selfQi.short}\u5366\uFF0C\u5C5E${selfQi.phase}\uFF0C${selfQi.meaning}` : `\u672C\u5366${hexagram.name}\u4E0D\u5C5E\u5341\u4E8C\u8F9F\u5366\uFF0C\u5341\u4E8C\u8F9F\u5366\u662F\u4E7E\u5764\u4E8C\u5BAB\u4E13\u4E3B\u6708\u4EFD\u7684\u5341\u4E8C\u5366\uFF0C\u5176\u4F59\u4E94\u5341\u4E8C\u5366\u4E0D\u8BBA\u5366\u6C14`;
    const align = selfQi ? selfQi.phase === monthLord.phase ? `\u4E0E\u5F53\u6708${selfQi.phase === "\u606F" ? "\u540C\u5904\u9633\u957F\u4E4B\u6BB5\uFF0C\u65B9\u5411\u4E0E\u65F6\u52BF\u76F8\u5408" : "\u540C\u5904\u9634\u957F\u4E4B\u6BB5\uFF0C\u884C\u4E8B\u4E0E\u65F6\u52BF\u76F8\u5E94"}\u3002` : `\u4E0E\u5F53\u6708${monthLord.short}\u5366\u5206\u5904\u6D88\u957F\u4E24\u7AEF\uFF0C\u662F\u9006\u7740\u65F6\u52BF\u8D70\uFF0C\u5B9C\u653E\u7F13\u4E00\u6B65\u3002` : "";
    insights.push({
      title: "\u5366\u6C14 \xB7 \u5F53\u4EE4\u4E3B\u5366",
      text: `${BRANCHES[monthBranch]}\u6708\u5F53\u4EE4\u4E3B\u5366\u4E3A${monthLord.name}\uFF0C${monthLord.meaning}${trend}\u3002${self}${align}`
    });
  }
  insights.push({
    title: "\u4E92\u5366 \xB7 \u8FC7\u7A0B",
    text: `\u4E92\u5366\u4E3A${mutual.name}\uFF0C\u4E3B\u4E8B\u60C5\u4E2D\u95F4\u4E00\u6BB5\u7684\u8D70\u5411\u3002${mutual.image}`
  });
  if (changed) {
    insights.push({ title: "\u53D8\u5366 \xB7 \u7ED3\u679C", text: `\u52A8\u723B${movingLines.map((line) => line.label).join("\u3001")}\uFF0C\u53D8\u51FA${changed.name}\uFF0C\u4E3B\u4E8B\u60C5\u6700\u7EC8\u843D\u70B9\u3002${changed.image}` });
  } else {
    insights.push({ title: "\u53D8\u5366 \xB7 \u7ED3\u679C", text: "\u516D\u723B\u7686\u9759\uFF0C\u65E0\u53D8\u5366\u3002\u4E8B\u6001\u683C\u5C40\u7A33\u5B9A\uFF0C\u4E0D\u4F1A\u4E2D\u9014\u751F\u53D8\uFF0C\u5B88\u4F4F\u5F53\u524D\u4F4D\u7F6E\u5373\u53EF\u3002" });
  }
  insights.push({
    title: "\u9519\u5366 \xB7 \u65C1\u652F",
    text: `\u9519\u5366\u4E3A${opposite.name}\uFF0C\u662F\u540C\u4E00\u4EF6\u4E8B\u7684\u53E6\u4E00\u9762\uFF0C\u63D0\u9192\u4F60\u522B\u53EA\u76EF\u7740\u773C\u524D\u8FD9\u4E00\u5C42\u3002${opposite.image}`
  });
  insights.push({
    title: "\u7EFC\u5366 \xB7 \u53CD\u6C42",
    text: `\u7EFC\u5366\u4E3A${inverted.name}\uFF0C\u662F\u6B64\u4E8B\u7684\u5012\u5F71\uFF1A\u6362\u5230\u5BF9\u65B9\u7684\u4F4D\u7F6E\u770B\uFF0C\u5F80\u5F80\u80FD\u770B\u51FA\u81EA\u5DF1\u5FFD\u7565\u7684\u6761\u4EF6\u3002${inverted.image}`
  });
  const jf = jingfang(hexagram);
  const shiLine = jf.lines[jf.shi - 1];
  const yingLine = jf.lines[jf.ying - 1];
  const shengke = shiYingRelation(shiLine.element, yingLine.element);
  const movingRelatives = movingLines.map((line) => jf.lines[line.position - 1]).filter((line) => line.relative).map((line) => `${line.label}${line.relative}`);
  const uniqueRelatives = [...new Set(movingRelatives.map((item) => item.replace(/^.*?爻/u, "")))];
  insights.push({
    title: "\u516D\u4EB2\u4E16\u5E94",
    text: [
      `${jf.palaceName}${jf.stage}\u5366\uFF0C\u5C5E${jf.element}\u3002\u4E16\u723B${shiLine.label}\u6301${shiLine.relative}\uFF0C\u5E94\u723B${yingLine.label}\u4E3A${yingLine.relative}\u3002`,
      shengke ? `${shengke.text}\u3002` : "",
      movingRelatives.length > 0 ? `\u52A8\u723B${movingRelatives.join("\u3001")}\uFF0C\u4E8B\u843D\u5728${uniqueRelatives.join("\u3001")}\u4E0A\uFF1A${uniqueRelatives.map((name) => RELATIVE_MEANING[name]).filter(Boolean).join("\uFF1B")}\u3002` : "\u516D\u723B\u7686\u9759\uFF0C\u65E0\u52A8\u723B\uFF0C\u8EAB\u4EFD\u683C\u5C40\u7167\u65E7\u3002",
      jf.stage === "\u6E38\u9B42" || jf.stage === "\u5F52\u9B42" ? jf.stageMeaning : ""
    ].filter(Boolean).join("")
  });
  const movingPositions = movingLines.map((line) => line.position);
  const useGod = topic ? pickUseGod(jf, topic.god.relatives, movingPositions) : null;
  const dayBranch = dayPillar(year, month, day).branch;
  const dayGanZhi = dayPillar(year, month, day);
  const calendar = {
    monthElement,
    dayElement: BRANCH_ELEMENTS[dayBranch],
    // 旬空要靠日柱在六十甲子里的序号才排得出，月破与入墓要靠地支序号，都一并带上。
    dayIndex: dayGanZhi.index,
    dayStem: dayGanZhi.stem,
    dayBranch,
    monthBranch,
    movingPositions,
    movingElements: movingLines.map((line) => {
      const na = jf.lines[line.position - 1];
      return na ? na.element : body.element;
    })
  };
  const clash = dayClashReading(jf, calendar);
  const darkPositions = clash.dark.map((line) => line.position);
  const pressedPositions = clash.pressed.map((line) => line.position);
  const circle = useGod && useGod.picked ? circleReading(jf, useGod.picked, calendar, darkPositions, pressedPositions) : null;
  insights.push({
    title: "\u7528\u795E",
    text: useGod ? useGodText(topic, useGod, jf, movingPositions, calendar, circle, darkPositions, pressedPositions) : question ? `\u5199\u4E86\u95EE\u9898\uFF0C\u4F46\u8FD9\u53E5\u8BDD\u91CC\u6CA1\u6709\u672C\u5305\u8BA4\u5F97\u7684\u4E8B\u7C7B\u8BCD\u3002\u7528\u795E\u662F\u300C\u95EE\u4F55\u4E8B\u53D6\u4F55\u4EB2\u300D\uFF0C\u8BA4\u4E0D\u51FA\u6240\u95EE\u4F55\u4E8B\u5C31\u53D6\u4E0D\u51FA\u7528\u795E\u2014\u2014\u8868\u91CC\u63A5\u5F97\u4F4F\u7684\u662F${TOPIC_CLASSES.map((item) => item.label).join("\u3001")}\u8FD9\u4E5D\u7C7B\uFF0C\u628A\u8BDD\u91CC\u5E26\u4E0A\u5177\u4F53\u90A3\u4E00\u4EF6\u4E8B\u518D\u770B\u8FD9\u4E00\u6BB5\u3002` : "\u672A\u5199\u6240\u95EE\u4F55\u4E8B\uFF0C\u53D6\u4E0D\u51FA\u7528\u795E\u2014\u2014\u516D\u4EB2\u5404\u7BA1\u4E00\u644A\u4E8B\uFF0C\u6CA1\u6709\u6240\u6307\u5C31\u6CA1\u6709\u7528\u795E\u3002\u5199\u4E0B\u95EE\u9898\u518D\u770B\u8FD9\u4E00\u6BB5\u3002"
  });
  if (clash.dark.length > 0 || clash.dayBroken.length > 0 || clash.pressed.length > 0) {
    insights.push({ title: "\u6697\u52A8 \xB7 \u65E5\u7834 \xB7 \u51B2\u6563", text: dayClashText(clash, circle, calendar) });
  }
  const changedJf = changed ? jingfang(changed) : null;
  const combine = heCombineReading(jf, calendar, changedJf);
  if (combine.hasAny) {
    insights.push({ title: "\u9022\u5408 \xB7 \u5408\u8D77\u5408\u7ECA\u5408\u597D\u5316\u6276", text: heCombineText(combine, calendar) });
  }
  const punish = punishReading(jf, calendar);
  if (punish.hasAny) {
    insights.push({ title: "\u72AF\u5211", text: punishText(punish, jf, circle, calendar) });
  }
  const transforms = changedJf ? movingPositions.map((position) => transformReading(position, jf, changedJf, calendar)) : [];
  const fanfu = fanfuReading(jf, calendar, changedJf);
  if (fanfu.hasAny) {
    insights.push({
      title: "\u53CD\u4F0F\u4E0E\u5366\u53D8",
      text: fanfuText(fanfu, changed.name, topic, circle, calendar, movingPositions, transforms)
    });
  }
  const kinds = clashKinds({ hexagram, jf, changed, changedJf, movingPositions });
  if (kinds.chong || kinds.he || kinds.changedChong || kinds.transformClash.length > 0) {
    insights.push({ title: "\u516D\u51B2", text: clashText(kinds, circle, topic, calendar) });
  }
  insights.push({ title: "\u5316\u723B \xB7 \u53D8\u51FA\u4E4B\u723B", text: transformText(transforms, circle) });
  insights.push({
    title: "\u4E3B\u5BA2",
    text: `\u4F53\u5366\u5728${POSITION_LABELS[primaryPosition - 1]}\uFF0C\u662F\u6211\uFF1B\u7528\u5366\u5728${POSITION_LABELS[shiyinPosition - 1]}\uFF0C\u662F\u6240\u6D4B\u4E4B\u4E8B\u3002\u4E16\u4E3A\u5DF1\u3001\u5E94\u4E3A\u5F7C\uFF0C\u4E24\u723B\u76F8\u9694\u4E09\u4F4D\uFF0C\u6052\u5206\u5C45\u5185\u5366\u4E0E\u5916\u5366\u3002`
  });
  insights.push({
    title: "\u53D6\u8C61",
    text: `\u4E0B\u5366${body.name}\u53D6${body.image}\u8C61\uFF0C\u4E3B\u81EA\u8EAB\u4E0E\u5185\u91CC\uFF1B\u4E0A\u5366${use.name}\u53D6${use.image}\u8C61\uFF0C\u4E3B\u73AF\u5883\u4E0E\u5916\u5728\u3002\u4F53${body.nature}\u800C\u7528${use.nature}\uFF0C${body.nature === use.nature ? "\u4E24\u5366\u540C\u6027\uFF0C\u5185\u5916\u5982\u4E00" : `\u5185\u5916\u5F02\u8D28\uFF0C\u5916\u5728\u73AF\u5883\u662F${use.nature}\u7684\uFF0C\u5BF9\u4F60\u5F62\u6210${generates(use.element, body.element) ? "\u751F\u6276" : overcomes(use.element, body.element) ? "\u538B\u5236" : "\u8017\u635F"}\u3002`}${god ? `\u5C31\u6240\u95EE\u4E4B\u4E8B\u800C\u8BBA\uFF0C${god.text}` : ""}`
  });
  insights.push({
    title: `\u723B\u4F4D \xB7 ${linePosition.title}`,
    text: `\u52A8\u723B\u5728${POSITION_LABELS[primaryPosition - 1]}\u3002${linePosition.text}`
  });
  insights.push({
    title: "\u65B9\u6240",
    text: `\u4F53\u5366${body.name}\u5C45${body.direction}\uFF0C\u7528\u5366${use.name}\u5C45${use.direction}\u3002\u5BFB\u7269\u95EE\u8DEF\u53EF\u53D6\u6B64\u65B9\u4F4D\uFF1B\u4F53\u5366\u65B9\u4F4D\u4E3B\u4F60\u6240\u5F52\uFF0C\u7528\u5366\u65B9\u4F4D\u4E3B\u4F60\u8981\u53BB\u7684\u5730\u65B9\u3002`
  });
  if (timing) {
    insights.splice(2, 0, { title: "\u5E94\u671F", text: timing.text });
  }
  const advice = buildAdvice(verdict);
  const topicLine = topic ? topicSentence(topic, verdict.key, verdict.label) : null;
  return {
    id: options.id ?? buildId(hexagram, positions, now),
    method: cast.method,
    question,
    createdAt: now.toISOString(),
    hexagram: serialize(hexagram),
    changed: changed ? serialize(changed) : null,
    mutual: serialize(mutual),
    opposite: serialize(opposite),
    inverted: serialize(inverted),
    lines,
    movingLines,
    structure,
    jingfang: jf,
    changedJingfang: changedJf,
    // 六神自初爻向上各归一爻。只说是什么气氛，不参与生克，也不动吉凶。
    sixGods: sixGods(dayGanZhi.stem),
    // 旬空与月破是这一卦整体的两处日子，跟哪一卦无关，单列一份给右栏和历法页用。
    void: (() => {
      const kong = xunKong(dayGanZhi.index);
      const po = monthPo(monthBranch);
      return {
        headName: kong.headName,
        names: kong.voidNames,
        brokenName: BRANCHES[po]
      };
    })(),
    // 六爻各自逢什么：旬空（连真假）、月破、入墓、暗动、日破。卦体照这个画小标，断语照这个说话。
    // 注意两个「破」不是一回事：broken 是月建冲的月破，这里 dayBroken 才是日辰冲的日破。
    states: jf.lines.map((line) => {
      const v = voidReading(line, calendar);
      return {
        position: line.position,
        void: v.isVoid,
        voidKind: v.status,
        broken: v.isBroken,
        tomb: v.isTomb,
        dark: darkPositions.includes(line.position),
        dayBroken: clash.dayBroken.some((one) => one.position === line.position),
        // 冲散：动爻被日辰冲到。与暗动、日破互斥，三者不会同落一爻。
        pressed: pressedPositions.includes(line.position),
        // 逢合：这一爻合于日月、与另一动爻相合、或动爻化出之爻回头相合，三路任一即是。
        // 与上面那三个不互斥——冲的是被冲来的那一边，合的是被缠住的那一边，同一爻可以又逢冲又逢合。
        combined: combine.hitPositions.includes(line.position),
        // 犯刑：与「逢合」不是互斥的两路。合是被缠住，刑是被伤着，同一爻可以又合又刑。
        punished: punish.hitPositions.includes(line.position),
        rescues: v.rescues,
        empties: v.empties
      };
    }),
    // 日辰冲爻的三路各是哪些爻。暗动约逢三卦里一卦，日破略多，冲散（动爻逢冲）又约四卦里一卦；
    // 三路皆空时断语里不出这一段。
    dayClash: {
      dark: darkPositions,
      dayBroken: clash.dayBroken.map((line) => line.position),
      pressed: pressedPositions
    },
    // 爻之合那四名各是哪些爻。合起与合绊互斥（一爻要么静要么动），
    // 合好与化扶可以与它们同落一爻。日月合爻最常见，合好要两爻皆动、化扶要动爻化出之爻
    // 回头相合，都少得多。四路皆空时断语里不出这一段。
    // 反伏与卦变。两档不合成一条：卦变换过去的纳支并不逐位相冲，
    // 合成一条报，乾变坤就得被漏掉。内/外各报出换过去的那三支，方向不折。
    fanfu: {
      kind: fanfu.kind,
      inner: fanfu.inner,
      outer: fanfu.outer,
      guaChange: fanfu.guaChange,
      innerSwap: fanfu.inner ? [fanfu.innerFrom, fanfu.innerTo] : null,
      outerSwap: fanfu.outer ? [fanfu.outerFrom, fanfu.outerTo] : null
    },
    // 爻之刑。方向原样带出去（谁刑谁），不折成「这几爻犯刑」——折了就看不出是谁动的。
    punish: {
      linePairs: punish.linePairs.map((pair) => [pair.from.position, pair.to.position, pair.self]),
      outside: punish.outside.map((item) => [item.line.position, item.source, item.from, item.to, item.self])
    },
    combine: {
      rise: combine.rise.map((item) => [item.line.position, item.source]),
      bind: combine.bind.map((item) => [item.line.position, item.source]),
      friendly: combine.friendly.map((item) => [item.lineA.position, item.lineB.position]),
      support: combine.support.map((item) => item.line.position)
    },
    // 六冲章那六种冲逐条对出来的结果。本卦逢六冲十五卦中的十卦、六合八卦，都是整卦的
    // 定性；变卦那两路与动爻变冲要等动起来才谈得上。爻位一律用数字，便于程序取用。
    clash: {
      chong: kinds.chong,
      he: kinds.he,
      changedChong: kinds.changedChong,
      changedHe: kinds.changedHe,
      heToChong: kinds.heToChong,
      chongToChong: kinds.chongToChong,
      transformClash: kinds.transformClash.map((item) => item.position),
      incidental: kinds.incidental.map((pair) => [pair.a, pair.b]),
      pairs: kinds.pairs.map((pair) => ({
        lower: pair.lower.position,
        upper: pair.upper.position,
        kind: pair.kind
      })),
      // 变卦那三对同样给出去：卦体上本卦与变卦各画一组冲合连线，六冲变六冲那一路
      // 才看得见「两头都是三对皆冲」，而不是只在本卦上出。
      changedPairs: (changedJf ? hexagramClash(changed, changedJf).pairs : []).map((pair) => ({
        lower: pair.lower.position,
        upper: pair.upper.position,
        kind: pair.kind
      }))
    },
    useGod: useGod ? {
      topic: topic.key,
      relatives: useGod.relatives,
      present: useGod.present,
      absent: useGod.absent,
      picked: useGod.picked,
      why: useGod.why,
      // 用神周围那一圈：元神、忌神、仇神。用神定不下来时无此圈（伏神在卦外，
      // 两亲各看各的也无从取舍），所以是一段字段而不是逐爻摊开。
      circle: circle ? {
        yuan: circle.yuan.map((line) => line.position),
        ji: circle.ji.map((line) => line.position),
        chou: circle.chou.map((line) => line.position),
        elements: circle.elements
      } : null,
      // 用神不上卦时，从本宫首卦借来的伏神与压在它上面的飞神。
      // sentence 只给断语正文用，不进结构化字段——那段话断语里已经整段说过了。
      hidden: useGod && useGod.picked === null && useGod.present.length === 0 ? useGod.absent.map((name) => {
        const one = hiddenReading(name, jf, calendar);
        if (!one) return null;
        const { sentence, ...rest } = one;
        return rest;
      }).filter(Boolean) : []
    } : null,
    verdict,
    // 取象句挂在 verdict 上而不是平铺一层：它跟吉凶是一件事的两半——吉凶是那一档，
    // 取象句是这一档落在所问之事上是什么话。拆开放，页面就得自己拼回去。
    // 认不出事类时这个键压根不存在（不是 null），页面不摆这句，也不拿它凑数。
    ...topic ? { topicLine } : {},
    // 白话块：MCP 把它接在正文末尾，Agent 照着讲给用户听。每一句都从上面已算好的
    // 字段来，不另起一套判断，也不替没定吉凶的东西表态。
    plain: buildPlain({ question, topic, topicLine, verdict, body, use, timing, advice }),
    // 每一动爻变出来的那一爻：回头生克、进退神、化空化墓。断语正文与这里走同一份，
    // sentence 只进断语不进字段——那段话断语里已经整段说过了。
    transforms: transforms.map(({ sentence, ...rest }) => rest),
    topic: topic ? { key: topic.key, label: topic.label, element: topic.element, reason: topic.reason } : null,
    // 事类是谁定的：Agent 显式给的、关键词撞出来的，还是压根没定。前两种差别说大不大——
    // 关键词那一路会有「问的是感情，但原话里没一个词在表上」的漏判，Agent 显式给就绕开了。
    topicSource,
    qi: monthLord ? {
      branch: monthBranch,
      lord: monthLord.name,
      lordShort: monthLord.short,
      phase: monthLord.phase,
      yangCount: monthLord.yangCount,
      self: selfQi ? selfQi.short : null,
      selfName: selfQi ? selfQi.name : null,
      selfPhase: selfQi ? selfQi.phase : null
    } : null,
    timing: timing?.text ?? "",
    cadence: cast.cadence ?? null,
    insights,
    details: cast.detail,
    advice
  };
}
const GOD_SHI_TONE = Object.freeze({
  \u751F: "\u4E16\u723B\u751F\u7528\u795E\uFF0C\u7528\u795E\u5F97\u6276\uFF0C\u6240\u6C42\u4E4B\u4E8B\u6709\u5E95\u5B50\u3002",
  \u88AB\u751F: "\u7528\u795E\u751F\u4E16\u723B\uFF0C\u53CD\u662F\u6211\u88AB\u8FD9\u4EF6\u4E8B\u7275\u7740\u8D70\uFF0C\u591A\u4E3B\u6211\u51FA\u529B\u591A\u8FC7\u6536\u6210\u3002",
  \u514B: "\u4E16\u723B\u514B\u7528\u795E\uFF0C\u8FD9\u4EF6\u4E8B\u5728\u6211\u538B\u5236\u4E4B\u4E0B\uFF0C\u4E3B\u52A8\u6743\u5728\u63E1\u4F46\u8981\u8D39\u529B\u6C14\u3002",
  \u88AB\u514B: "\u7528\u795E\u514B\u4E16\u723B\uFF0C\u8FD9\u4EF6\u4E8B\u538B\u7740\u6211\uFF0C\u5B9C\u5B88\u4E0D\u5B9C\u653B\u3002",
  \u540C\u6C14: "\u7528\u795E\u4E0E\u4E16\u723B\u540C\u6C14\uFF0C\u6240\u6C42\u4E4B\u4E8B\u4E0E\u6211\u7684\u5904\u5883\u540C\u4E00\u8DEF\u6570\uFF0C\u987A\u52BF\u4E3A\u5B9C\u3002"
});
function hiddenReading(name, jingfang2, calendar) {
  const pair = hiddenGod(jingfang2, name);
  if (!pair) return null;
  const flying = flyingRelation(pair.hushen, pair.feishen);
  const fu = voidReading(pair.hushen, { ...calendar, isHidden: true, isStruck: flying.key === "\u98DE\u6765\u514B\u4F0F" });
  const god = sixGods(calendar.dayStem)[pair.hushen.position - 1];
  const fei = voidReading(pair.feishen, calendar);
  const emerges = hiddenVerdict(
    pair.hushen,
    pair.feishen,
    flying,
    calendar.monthElement,
    calendar.dayElement,
    calendar.movingElements,
    {
      isVoid: fu.isVoid,
      status: fu.status,
      isBroken: fu.isBroken,
      isTomb: fu.isTomb,
      flyingVoid: fei.isVoid,
      flyingBroken: fei.isBroken,
      flyingTomb: fei.isTomb
    }
  );
  return {
    relative: name,
    position: pair.hushen.position,
    hushen: `${pair.hushen.stem}${pair.hushen.branch}${pair.hushen.element}`,
    feishen: `${pair.feishen.stem}${pair.feishen.branch}${pair.feishen.element}`,
    feishenRelative: pair.feishen.relative,
    god,
    flying: flying.key,
    emerges,
    sentence: `${name}\u4F0F\u5728${pair.hushen.position}\u723B\u4E4B\u4E0B\u2014\u2014\u672C\u5BAB\u9996\u5366${pair.palaceName}\u7684${pair.hushen.stem}${pair.hushen.branch}${pair.hushen.element}\u5728\u6B64\u4F4D\uFF0C\u538B\u7740\u5B83\u7684${pair.feishen.stem}${pair.feishen.branch}${pair.feishen.element}${pair.feishen.relative}\u662F\u98DE\u795E\u3002${flying.text}\u3002\u4F0F\u795E\u4E34${god}\uFF0C${SIX_GOD_MEANING[god].meaning}\uFF0C\u53EA\u662F\u5B83\u7684\u8C03\u5B50\uFF0C\u6210\u4E0D\u6210\u4ECD\u53EA\u7531\u751F\u514B\u4E0E\u65FA\u8870\u5B9A\u3002${emerges.text}`
  };
}
function hiddenText(god, jingfang2, calendar) {
  const found = [];
  for (const name of god.absent) {
    const one = hiddenReading(name, jingfang2, calendar);
    if (!one) {
      found.push(`${name}\u5728\u672C\u5BAB\u9996\u5366\u91CC\u4E5F\u5BFB\u4E0D\u5230`);
      continue;
    }
    found.push(one.sentence);
  }
  return `\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u98DE\u4F0F\u795E\u7AE0\u300B\u4ECE\u672C\u5BAB\u9996\u5366\u53D6\u4F0F\u795E\uFF1A${found.join(" ")}`;
}
function hiddenVerdict(hushen, feishen, flying, monthElement, dayElement, movingElements, state) {
  const good = [];
  if (generates(monthElement, hushen.element)) good.push("\u5F97\u6708\u5EFA\u751F");
  if (generates(dayElement, hushen.element)) good.push("\u5F97\u65E5\u8FB0\u751F");
  const tone = vitality(hushen.element, monthElement);
  if (tone.tone === "strong" || tone.tone === "good") good.push(`\u4E8E\u6708\u5EFA${tone.key}`);
  if (flying.key === "\u98DE\u6765\u751F\u4F0F") good.push("\u5F97\u98DE\u795E\u751F");
  if (movingElements.some((element) => generates(element, hushen.element))) good.push("\u5F97\u52A8\u723B\u751F");
  if (state.flyingVoid || state.flyingBroken || state.flyingTomb) {
    good.push("\u98DE\u795E\u9022\u7A7A\u7834\u5893\uFF0C\u538B\u4E0D\u4F4F\u5B83");
  }
  const bad = [];
  if (overcomes(monthElement, hushen.element) || overcomes(dayElement, hushen.element)) {
    bad.push("\u88AB\u6708\u5EFA\u6216\u65E5\u8FB0\u514B");
  }
  if (["\u4F11", "\u56DA", "\u6B7B"].includes(tone.key)) bad.push(`\u4E8E\u6708\u5EFA${tone.key}\uFF0C\u4F11\u56DA\u65E0\u6C14`);
  if (overcomes(feishen.element, hushen.element) && ["strong", "good"].includes(vitality(feishen.element, monthElement).tone)) {
    bad.push("\u88AB\u65FA\u76F8\u7684\u98DE\u795E\u514B\u5BB3");
  }
  if (state.isTomb) bad.push("\u5360\u5366\u4E4B\u65E5\u6708\u4E8E\u4F0F\u795E\u6B63\u9022\u5165\u5893");
  if (state.isVoid) bad.push(`\u4F0F\u795E\u76F4${state.status || "\u65EC\u7A7A"}`);
  if (state.isBroken) bad.push("\u4F0F\u795E\u9022\u6708\u7834");
  const kongHead = (() => {
    if (!state.isVoid) return "";
    if (state.status === "\u771F\u7A7A") return "\u4F0F\u795E\u65EC\u7A7A\u800C\u771F\u7A7A\uFF0C";
    if (state.status === "\u5047\u7A7A") return "\u4F0F\u795E\u65EC\u7A7A\u800C\u5047\u7A7A\uFF0C\u7A7A\u4E0D\u4E3A\u5176\u60A3\uFF0C";
    return "\u4F0F\u795E\u65EC\u7A7A\uFF0C\u771F\u5047\u672A\u5224\uFF0C";
  })();
  if (good.length > 0) {
    return {
      key: "\u51FA\u5F97\u6765",
      text: `${kongHead}\u4F0F\u795E${good.join("\u3001")}\uFF0C\u51FA\u5F97\u6765\uFF0C\u65E0\u7528\u4EA6\u4E3A\u6709\u7528\u3002` + (state.status === "\u5047\u7A7A" ? "\u4E0D\u8FC7\u6B64\u662F\u5047\u7A7A\uFF0C\u51FA\u65EC\u6216\u9022\u51B2\u4E4B\u540E\u624D\u89C1\u771F\u7AE0\u3002" : "")
    };
  }
  if (bad.length > 0) return { key: "\u51FA\u4E0D\u6765", text: `${kongHead}\u4F0F\u795E${bad.join("\u3001")}\uFF0C\u7EC8\u4E0D\u5F97\u51FA\uFF0C\u867D\u6709\u5982\u65E0\u3002` };
  throw new Error("\u51FA\u4F0F\u5224\u5B9A\u6F0F\u4E86\u60C5\u5F62\uFF1A\u65FA\u8870\u672C\u8BE5\u8BA9 good \u6216 bad \u5FC5\u6709\u5176\u4E00");
}
function useGodText(topic, god, jingfang2, movingPositions, calendar, circle, darkPositions, pressedPositions) {
  const motion = motionTiers(calendar, darkPositions, pressedPositions);
  const where = (name) => god.all.filter((line) => line.relative === name).map((line) => {
    const kind = motion(line.position);
    return `${line.label}${kind === "\u9759" ? "" : `\uFF08${kind}\uFF09`}`;
  }).join("\u3001");
  const head = `\u6240\u95EE\u4E3A${topic.label}\uFF0C${topic.god.reason}`;
  if (!god.picked && god.present.length === 0) {
    return `${head}\u5366\u4E2D${god.relatives.join("\u3001")}\u4E00\u4EB2\u4E5F\u4E0D\u89C1\uFF0C\u5C5E\u7528\u795E\u4E0D\u4E0A\u5366\u3002${hiddenText(god, jingfang2, calendar)}`;
  }
  if (god.relatives.length > 1) {
    const rows = god.present.map((name) => `${name}\u89C1\u4E8E${where(name)}`).join("\uFF1B");
    const tail = topic.god.relate && god.present.length === 2 ? `${topic.god.relate}` : topic.god.byGender ? "\u5BF9\u7167\u81EA\u5DF1\u90A3\u4E00\u4EB2\u53D6\u7528\u3002" : "";
    return `${head}\u5366\u4E2D${rows}\u3002${god.present.length < god.relatives.length ? `${god.absent.join("\u3001")}\u4E0D\u4E0A\u5366\u3002` : ""}${tail}`;
  }
  const picked = god.picked;
  const parts = [head, `\u5366\u4E2D${god.present[0]}\u89C1\u4E8E${where(god.present[0])}\u3002`];
  if (god.all.length > 1) {
    parts.push(`\u4E24\u73B0\uFF0C\u6309${god.why}\u53D6${picked.label}\u3002`);
  }
  parts.push(circle.sentence);
  const relation = elementRelation(jingfang2.lines[jingfang2.shi - 1].element, picked.element);
  parts.push(picked.position === jingfang2.shi ? "\u7528\u795E\u6070\u5728\u4E16\u723B\u4E4B\u4E0A\uFF0C\u6240\u6C42\u4E4B\u4E8B\u5C31\u5728\u81EA\u5DF1\u8EAB\u4E0A\u3002" : GOD_SHI_TONE[relation]);
  const state = voidSentence(voidReading(picked, { ...calendar, movingPositions }));
  if (state) parts.push(state);
  const pickedGod = sixGods(calendar.dayStem)[picked.position - 1];
  parts.push(godSentence(pickedGod, picked.label));
  return parts.join("");
}
function transformReading(position, jingfang2, changedJingfang, calendar) {
  const moving = jingfang2.lines[position - 1];
  const ch = changedJingfang.lines[position - 1];
  const relation = transformRelation(moving, ch);
  const move = jinTui(moving.branch, ch.branch);
  const v = voidReading(ch, { ...calendar, movingPositions: [], movingElements: [] });
  const marks = [];
  if (v.isVoid) marks.push(v.status === "\u771F\u7A7A" ? "\u5316\u771F\u7A7A" : v.status === "\u5047\u7A7A" ? "\u5316\u5047\u7A7A" : "\u5316\u7A7A");
  if (v.isTomb) marks.push("\u5316\u5893");
  const stateText = marks.length === 0 ? "" : `\u53D8\u723B${marks.join("\u53C8")}\u2014\u2014\u8FD9\u662F\u8FD9\u4E00\u723B\u6B64\u523B\u7684\u5904\u5883\uFF0C\u770B\u5F97\u89C1\uFF1B\u6210\u4E0D\u6210\u4ECD\u65E7\u5F52\u4E0A\u5934\u90A3\u53E5\u8BDD\u7BA1\u3002`;
  return {
    position,
    label: moving.label,
    moving: `${moving.stem}${moving.branch}${moving.element}`,
    movingRelative: moving.relative,
    changed: `${ch.stem}${ch.branch}${ch.element}`,
    changedRelative: ch.relative,
    relation: relation.key,
    good: relation.good,
    jinTui: move ? move.key : null,
    marks,
    sentence: `${moving.label}${moving.stem}${moving.branch}${moving.element}${moving.relative}\u52A8\uFF0C\u53D8\u51FA${ch.stem}${ch.branch}${ch.element}${ch.relative}\u3002${relation.text}` + (move ? move.text : "") + stateText
  };
}
function motionTiers(calendar, darkPositions, pressedPositions) {
  const moving = new Set(calendar.movingPositions);
  const dark = new Set(darkPositions);
  const pressed = new Set(pressedPositions);
  return (position) => {
    if (pressed.has(position)) return "\u52A8\u800C\u9022\u65E5\u51B2";
    if (moving.has(position)) return "\u52A8";
    return dark.has(position) ? "\u6697\u52A8" : "\u9759";
  };
}
function circleReading(jingfang2, picked, calendar, darkPositions, pressedPositions) {
  const circle = useGodCircle(jingfang2, picked);
  const motion = motionTiers(calendar, darkPositions, pressedPositions);
  const say = (name, element, lines) => lines.length === 0 ? `${name}\u5C5E${element}\uFF0C\u672C\u5366\u516D\u723B\u91CC\u6CA1\u6709\u8FD9\u4E00\u884C` : `${name}\u5C5E${element}\uFF0C\u89C1${lines.map((line) => `${line.label}\uFF08${motion(line.position)}\uFF0C\u4E8E\u6708\u5EFA${vitality(line.element, calendar.monthElement).key}\uFF09`).join("\u3001")}`;
  const parts = [
    `\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u7528\u795E\u5143\u795E\u5FCC\u795E\u4EC7\u795E\u7AE0\u300B\uFF0C\u7528\u795E\u53D6${picked.label}${picked.element}\uFF0C\u5B83\u5468\u56F4\u8FD8\u6709\u4E09\u4E2A\u4F4D\u7F6E\uFF1A`,
    `${say("\u5143\u795E", circle.elements.yuan, circle.yuan)}\uFF0C\u6B63\u662F\u751F\u7528\u795E\u7684\u90A3\u4E00\u884C\u3002`,
    `${say("\u5FCC\u795E", circle.elements.ji, circle.ji)}\uFF0C\u6B63\u662F\u514B\u7528\u795E\u7684\u90A3\u4E00\u884C\u3002`,
    `${say("\u4EC7\u795E", circle.elements.chou, circle.chou)}\u3002`
  ];
  if (circle.chou.length > 0) {
    parts.push("\u4EC7\u795E\u5E76\u4E0D\u76F4\u63A5\u514B\u7528\u795E\uFF0C\u5B83\u538B\u7740\u5143\u795E\u53EB\u5143\u795E\u751F\u4E0D\u52A8\uFF0C\u81EA\u5DF1\u53C8\u53CD\u53BB\u751F\u5FCC\u795E\uFF0C\u4E24\u5934\u5E2E\u5012\u5FD9\u3002");
  }
  parts.push("\u8FD9\u4E09\u8005\u662F\u4E94\u884C\u4E0A\u7684\u4F4D\u7F6E\uFF0C\u4E0D\u662F\u5366\u91CC\u7684\u4EBA\u2014\u2014\u539F\u4E66\u7D27\u63A5\u7740\u5C31\u63D0\u9192\u300C\u52FF\u4EE5\u4EC7\u795E\u5373\u4EC7\u4EBA\u4E5F\u300D\uFF0C\u5366\u91CC\u90A3\u4E2A\u79F0\u4F5C\u4EC7\u4EBA\u7684\u53E6\u6709\u5176\u4EBA\uFF0C\u662F\u5E94\u723B\u514B\u4E16\uFF0C\u4E0D\u5728\u8FD9\u91CC\u5934\u3002");
  return {
    godPosition: picked.position,
    god: picked,
    yuan: circle.yuan,
    ji: circle.ji,
    chou: circle.chou,
    elements: circle.elements,
    sentence: parts.join("")
  };
}
function dayClashText(clash, circle, calendar) {
  const dayName = BRANCHES[calendar.dayBranch];
  const nameOf = (position) => {
    if (!circle) return "";
    if (circle.yuan.some((line) => line.position === position)) return "\u5143\u795E";
    if (circle.ji.some((line) => line.position === position)) return "\u5FCC\u795E";
    if (circle.chou.some((line) => line.position === position)) return "\u4EC7\u795E";
    return "";
  };
  const roleClause = (lines) => {
    if (!circle) return "";
    const said = [];
    for (const [name, row] of [["\u5143\u795E", circle.yuan], ["\u5FCC\u795E", circle.ji], ["\u4EC7\u795E", circle.chou]]) {
      const hit = lines.filter((line) => row.some((one) => one.position === line.position));
      if (hit.length === 0) continue;
      said.push(hit.length === 1 ? `${hit[0].label}\u6B63\u662F${name}\u90A3\u4E00\u884C` : `${name}\u90A3\u4E00\u884C\u5728${hit.map((line) => line.label).join("\u3001")}\u90FD\u5360\u7740`);
    }
    return said.length === 0 ? "" : `${said.join("\uFF0C")}\u3002`;
  };
  const list = (lines) => lines.map((line) => `${line.label}${line.element}\uFF08\u4E8E\u6708\u5EFA${vitality(line.element, calendar.monthElement).key}\uFF09`).join("\u3001");
  const opener = clash.dark.length > 0 || clash.dayBroken.length > 0 ? `\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u6697\u52A8\u7AE0\u7B2C\u4E8C\u5341\u4E8C\u300B\u300C\u975C\u723B\u65FA\u76F8\u65E5\u8FB0\u6C96\u4E4B\u7232\u6697\u52D5\uFF0C\u975C\u723B\u4F11\u56DA\u65E5\u8FB0\u6C96\u4E4B\u7232\u7834\u300D\uFF1A\u88AB${dayName}\u65E5\u51B2\u5230\u7684\u9759\u723B\uFF0C\u65FA\u8870\u5206\u4F5C\u4E24\u8DEF\u3002` : `\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u52A8\u6563\u7AE0\u7B2C\u4E8C\u5341\u4E09\u300B\u300C\u5360\u4EE5\u65E5\u8FB0\u800C\u6C96\u52D5\u723B\uFF0C\u8B02\u4E4B\u6C96\u6563\u300D\uFF1A\u88AB${dayName}\u65E5\u51B2\u5230\u7684\uFF0C\u662F\u52A8\u723B\u3002`;
  const parts = [opener];
  if (clash.dark.length > 0) {
    parts.push(`${list(clash.dark)}${clash.dark.length > 1 ? "\u7686\u4E3A\u6697\u52A8" : "\u4E3A\u6697\u52A8"}\u2014\u2014\u9759\u800C\u4E0D\u9759\uFF0C\u4ECA\u65E5\u8D77\u6697\u4E2D\u8D77\u4F5C\u7528\u3002${roleClause(clash.dark)}`);
    if (circle) {
      const yuanDark = clash.dark.find((line) => circle.yuan.some((one) => one.position === line.position));
      const jiDark = clash.dark.find((line) => circle.ji.some((one) => one.position === line.position));
      const chouDark = clash.dark.find((line) => circle.chou.some((one) => one.position === line.position));
      const godTone = vitality(circle.god.element, calendar.monthElement);
      const rests = ["\u4F11", "\u56DA", "\u6B7B"].includes(godTone.key);
      if (yuanDark || jiDark) {
        const judged = [];
        if (yuanDark) {
          judged.push(`\u5143\u795E${yuanDark.label}\u6697\u52A8\u6765\u751F\u7528\u795E\uFF0C\u6B63\u5408\u539F\u4E66\u300C\u7528\u795E\u4F11\u56DA\u5F97\u5143\u795E\u6697\u52D5\u4EE5\u76F8\u751F\u300D\u90A3\u53E5\uFF0C\u8C13\u4E4B\u559C`);
        }
        if (jiDark) {
          judged.push(`\u5FCC\u795E${jiDark.label}\u6697\u52A8\u8D77\u6765\u514B\u5BB3\u7528\u795E\uFF0C\u5373\u539F\u4E66\u300C\u7528\u795E\u4F11\u56DA\u7121\u52A9\uFF0C\u82E5\u9047\u5FCC\u795E\u514B\u5BB3\u7528\u795E\u300D\uFF0C\u8C13\u4E4B\u5FCC`);
        }
        parts.push(`\u539F\u4E66\u7D27\u63A5\u7740\u8BF4\u300C\u6697\u52D5\u8005\u6709\u559C\u6709\u5FCC\u300D\uFF0C\u5224\u7684\u6B63\u662F\u8FD9\u4E00\u5708\uFF1A${judged.join("\uFF1B")}\u3002` + (rests ? "" : `\u53EA\u662F\u8FD9\u4E24\u8DEF\u90FD\u5199\u5728\u300C\u7528\u795E\u4F11\u56DA\u300D\u4E4B\u4E0B\uFF0C\u672C\u5366\u7528\u795E${circle.god.label}\u4E8E\u6708\u5EFA\u4E3A${godTone.key}\uFF0C\u90A3\u4E00\u5C42\u524D\u63D0\u5E76\u4E0D\u9F50\u5907\u3002`));
      } else if (chouDark) {
        parts.push("\u6697\u52A8\u7AE0\u7684\u559C\u5FCC\u4E24\u8DEF\u53EA\u5206\u5143\u795E\u4E0E\u5FCC\u795E\u4E24\u652F\uFF0C\u4EC7\u795E\u6697\u52A8\u5F52\u54EA\u4E00\u652F\uFF0C\u539F\u4E66\u672A\u8A00\uFF0C\u8FD9\u91CC\u4E0D\u66FF\u5B83\u5B9A\u3002");
      } else {
        parts.push("\u6697\u52A8\u7AE0\u7684\u559C\u5FCC\u4E24\u8DEF\u5224\u7684\u662F\u5143\u795E\u4E0E\u5FCC\u795E\uFF0C\u5BF9\u522B\u7684\u723B\u6697\u52A8\u53EA\u8BF4\u300C\u6709\u559C\u6709\u5FCC\u300D\uFF0C\u6CA1\u518D\u5206\u6D3E\u5409\u51F6\uFF0C\u8FD9\u91CC\u4E0D\u66FF\u5B83\u5B9A\u3002");
      }
    }
  }
  if (clash.dayBroken.length > 0) {
    parts.push(`${list(clash.dayBroken)}${clash.dayBroken.length > 1 ? "\u7686\u4E3A\u65E5\u7834" : "\u4E3A\u65E5\u7834"}\u2014\u2014\u4F11\u56DA\u65E0\u6C14\u800C\u9022\u65E5\u51B2\uFF0C\u4E0E\u6697\u52A8\u6070\u662F\u540C\u4E00\u53E5\u8BDD\u7684\u4E24\u5934\u3002${roleClause(clash.dayBroken)}`);
  }
  if (clash.pressed.length > 0) {
    const listed = list(clash.pressed);
    const strong = clash.pressed.filter((line) => {
      const tone = vitality(line.element, calendar.monthElement).tone;
      return tone === "strong" || tone === "good";
    });
    parts.push(`${listed}${clash.pressed.length > 1 ? "\u7686\u9022\u65E5\u51B2" : "\u9022\u65E5\u51B2"}\uFF0C\u8C13\u4E4B\u51B2\u6563\u3002` + (strong.length > 0 ? `\u5176\u4E2D${strong.map((line) => line.label).join("\u3001")}\u4E8E\u6708\u5EFA\u65FA\u76F8\uFF0C\u539F\u4E66\u76F4\u8A00\u300C\u65FA\u76F8\u8005\u6C96\u4E4B\u4E0D\u6563\u300D\u3002` : "") + "\u8FD9\u4E00\u7AE0\u7684\u7ED3\u8BBA\u6070\u6070\u662F\u4E0D\u6563\uFF1A\u300C\u4E88\u5C62\u8A66\u4E4B\uFF0C\u65FA\u76F8\u8005\u6C96\u4E4B\u4E0D\u6563\uFF0C\u6709\u6C14\u8005\u6C96\u4E4B\u4E0D\u6563\uFF0C\u4F11\u56DA\u8005\u9593\u6709\u6C96\u6563\uFF0C\u4EA6\u5343\u767E\u4E2D\u4E4B\u4E00\u4E8C\u4E5F\u300D\uFF0C\u672B\u4E86\u5F52\u5230\u300C\u795E\u5146\u6A5F\u65BC\u52D5\uFF0C\u52D5\u5FC5\u6709\u56E0\u300D\u3002\u6240\u4EE5\u6B64\u5904\u53EA\u62A5\u300C\u54EA\u4E00\u723B\u52A8\u800C\u9022\u65E5\u51B2\u300D\u8FD9\u4EF6\u4E8B\u5B9E\uFF0C\u4E0D\u62FF\u5B83\u65AD\u51F6\u3002");
  }
  if (clash.dark.length > 0) {
    parts.push("\u300C\u5360\u4EE5\u6697\u52D5\u798F\u4F86\u800C\u4E0D\u77E5\uFF0C\u798D\u4F86\u800C\u4E0D\u89BA\u300D\u662F\u65E7\u8BF4\uFF0C\u539F\u4F5C\u8005\u5728\u672C\u7AE0\u672B\u5C3E\u5C31\u9A73\u4E86\u5B83\uFF1A\u300C\u5409\u51F6\u4E4B\u61C9\u65BC\u52D5\uFF0C\u6709\u6025\u7DE9\u4E4B\u61C9\uFF0C\u5247\u7DE9\u975E\u6B64\u8AD6\uFF0C\u4F55\u7576\u4E0D\u77E5\u4E0D\u89BA\uFF0C\u5831\u61C9\u4EA6\u975E\u7DE9\u4E5F\u3002\u300D\u6697\u52A8\u4E0D\u5FC5\u5F53\u6210\u8FDF\u7F13\u3002");
  }
  return parts.join("");
}
function heCombineText(combine, calendar) {
  const parts = ["\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u516D\u5408\u7AE0\u7B2C\u5341\u4E5D\u300B\u300C\u723B\u4E4B\u5408\u8005\uFF0C\u9759\u800C\u9022\u5408\uFF0C\u8C13\u4E4B\u5408\u8D77\uFF1B\u52A8\u800C\u9022\u5408\uFF0C\u8C13\u4E4B\u5408\u7ECA\uFF1B\u723B\u4E0E\u723B\u5408\u8C13\u4E4B\u5408\u597D\uFF0C\u723B\u52A8\u5316\u5408\u8C13\u4E4B\u5316\u6276\u300D\uFF1A\u5408\u843D\u5728\u8FD9\u51E0\u723B\u4E0A\uFF0C\u5206\u8FD9\u4E48\u56DB\u540D\u3002"];
  if (combine.rise.length > 0) {
    const said = combine.rise.map((item) => `${item.line.label}${item.line.branch}${item.line.element}\u5408${item.source}${item.branch}`).join("\u3001");
    parts.push(`${said}\u7686\u4E3A\u5408\u8D77\u2014\u2014\u9759\u723B\u5F97\u5408\u800C\u8D77\uFF0C\u539F\u4E66\u8BF4\u300C\u5373\u4F7F\u723B\u503C\u4F11\u56DA\u4EA6\u6709\u65FA\u76F8\u4E4B\u610F\u300D\uFF0C\u8D77\u5F97\u6765\u7684\u662F\u8FD9\u4E00\u723B\uFF0C\u4E0D\u7B49\u4E8E\u8FD9\u4EF6\u4E8B\u5C31\u6210\u3002`);
  }
  if (combine.bind.length > 0) {
    const said = combine.bind.map((item) => `${item.line.label}${item.line.branch}${item.line.element}\u5408${item.source}${item.branch}`).join("\u3001");
    parts.push(`${said}\u7686\u4E3A\u5408\u7ECA\u2014\u2014\u52A8\u723B\u88AB\u5408\u4F4F\uFF0C\u539F\u4E66\u8BF4\u300C\u53CD\u4E0D\u80FD\u52A8\u4E4B\u610F\u300D\uFF0C\u52A8\u8D77\u6765\u7684\u4E8B\u88AB\u7ECA\u5728\u8FD9\u91CC\u3002`);
  }
  if (combine.friendly.length > 0) {
    const said = combine.friendly.map((item) => `${item.lineA.label}${item.lineA.branch}\u4E0E${item.lineB.label}${item.lineB.branch}`).join("\u3001");
    parts.push(`${said}\u4E24\u52A8\u723B\u76F8\u5408\u4E3A\u5408\u597D\u2014\u2014\u662F\u4ED6\u6765\u5408\u6211\uFF0C\u539F\u4E66\u8BF4\u300C\u4E0E\u6211\u548C\u597D\u76F8\u52A9\u4E4B\u610F\u300D\u3002\u6B64\u5904\u53EA\u53D6\u4E24\u723B\u7686\u52A8\u7684\u90A3\u4E00\u8DEF\uFF1A\u540C\u7AE0\u300C\u4F46\u6709\u4E00\u723B\u4E0D\u52A8\uFF0C\u4EA6\u4E0D\u4E3A\u5408\u300D\uFF0C\u6709\u4E00\u723B\u9759\u7684\u7B97\u4E0D\u4E0A\u5408\u3002`);
  }
  if (combine.support.length > 0) {
    const said = combine.support.map((item) => `${item.line.label}${item.line.branch}\u5316\u51FA${item.changedLine.branch}\u56DE\u5934\u76F8\u5408`).join("\u3001");
    parts.push(`${said}\u4E3A\u5316\u6276\u2014\u2014\u52A8\u723B\u5316\u51FA\u53BB\u7684\u90A3\u4E00\u723B\u56DE\u5934\u6765\u5408\u672C\u723B\uFF0C\u539F\u4E66\u8BF4\u300C\u5F97\u4ED6\u6276\u52A9\u4E4B\u610F\u300D\u3002`);
  }
  parts.push("\u4EE5\u4E0A\u53EA\u8BF4\u5408\u7684\u5173\u7CFB\uFF0C\u4E0D\u636E\u6B64\u65AD\u5409\u51F6\uFF1A\u540C\u7AE0\u8BF4\u300C\u7136\u5FC5\u7528\u795E\u6709\u6C14\u76F8\u5B9C\uFF0C\u7528\u82E5\u5931\u9677\u65E0\u76CA\u300D\uFF0C\u53C8\u8BF4\u300C\u7528\u795E\u53D7\u514B\uFF0C\u516D\u5408\u6709\u4F55\u76CA\u54C9\u300D\uFF0C\u672B\u4E86\u4E00\u53E5\u300C\u5B9C\u5408\u5409\uFF0C\u4E0D\u5B9C\u5408\u51F6\u300D\u2014\u2014\u5408\u5409\u5408\u51F6\u4ECD\u8981\u770B\u7528\u795E\u65FA\u8870\u3002");
  return parts.join("");
}
function punishText(punish, jingfang2, circle, calendar) {
  const parts = ["\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u4E09\u5211\u7AE0\u7B2C\u4E8C\u5341\u4E00\u300B\u300C\u5BC5\u5211\u5DF3\u3001\u5DF3\u5211\u7533\u3001\u5B50\u5211\u536F\u3001\u536F\u5211\u5348\u3001\u4E11\u620C\u76F8\u5211\u3001\u672A\u8FB0\u76F8\u5211\u3002\u53C8\u4E91\uFF1A\u8FB0\u5348\u9149\u4EA5\u8C13\u4E4B\u81EA\u5211\u300D\uFF1A\u5211\u6709\u65B9\u5411\uFF0C\u4E0B\u9762\u6309\u300C\u8C01\u5211\u8C01\u300D\u539F\u6837\u6446\u51FA\u6765\u3002"];
  if (punish.linePairs.length > 0) {
    const said = punish.linePairs.map((pair) => `${pair.from.label}${pair.from.branch}${pair.self ? "\u81EA\u5211" : `\u5211${pair.to.branch}`}${pair.to.label}`).join("\u3001");
    parts.push(`\u5366\u4E2D${said}\u3002`);
  }
  if (punish.outside.length > 0) {
    const said = punish.outside.map((item) => item.self ? `${item.source}\u4E0E${item.line.label}${item.line.branch}\u81EA\u5211` : `${item.source}${item.from}\u5211${item.line.branch}`).join("\u3001");
    parts.push(`${said}\u3002`);
  }
  if (!circle) {
    parts.push("\u539F\u4E66\u8BF4\u300C\u6216\u56E0\u7528\u795E\u4F11\u56DA\u53C8\u517C\u4ED6\u723B\u72AF\u4E4B\uFF0C\u5211\u8005\u5219\u89C1\u51F6\u300D\u2014\u2014\u8FD9\u4E24\u6761\u524D\u63D0\u672C\u5366\u6838\u4E0D\u4E86\u7B2C\u4E00\u6761\uFF1A\u7528\u795E\u5B9A\u4E0D\u4E0B\u6765\u3002\u5199\u4E0B\u95EE\u9898\u518D\u770B\u8FD9\u4E00\u6BB5\uFF0C\u6216\u8005\u7531\u7740\u5B83\u53EA\u662F\u4E00\u6761\u5173\u7CFB\uFF0C\u4E0D\u4F5C\u5409\u51F6\u3002");
  } else {
    const godTone = vitality(circle.god.element, calendar.monthElement);
    const rests = ["\u4F11", "\u56DA", "\u6B7B"].includes(godTone.key);
    const others = punish.hitPositions.filter((position) => position !== circle.god.position);
    parts.push(`\u539F\u4E66\u8BF4\u300C\u6216\u56E0\u7528\u795E\u4F11\u56DA\u53C8\u517C\u4ED6\u723B\u72AF\u4E4B\uFF0C\u5211\u8005\u5219\u89C1\u51F6\u300D\u3002\u62FF\u672C\u5366\u6838\u8FD9\u4E24\u6761\uFF1A\u7528\u795E\u5728${circle.god.label}${circle.god.element}\uFF0C\u4E8E\u6708\u5EFA${godTone.key}\uFF0C${rests ? "\u6B63\u5408\u300C\u7528\u795E\u4F11\u56DA\u300D\u90A3\u6761" : "\u4E0D\u7B97\u4F11\u56DA\uFF0C\u90A3\u6761\u4E0D\u6210\u7ACB"}\uFF1B\u53E6\u6709${others.length > 0 ? `${others.map((position) => jingfang2.lines[position - 1].label).join("\u3001")}\u72AF\u4E4B` : "\u6CA1\u6709\u522B\u7684\u723B\u72AF\u4E4B"}\uFF0C\u300C\u53C8\u517C\u4ED6\u723B\u72AF\u4E4B\u300D\u90A3\u6761${others.length > 0 ? "\u6210\u7ACB" : "\u4E0D\u6210\u7ACB"}\u3002`);
  }
  parts.push("\u4F46\u539F\u4E66\u7D27\u63A5\u7740\u81EA\u5DF1\u6536\u4E86\u4E00\u53E5\uFF1A\u300C\u800C\u72EC\u72AF\u4E09\u5211\u5F97\u9A8C\u8005\u5C11\uFF0C\u5360\u8FC7\u6570\u5341\u5E74\u53EA\u9A8C\u5F97\u4E00\u5366\u300D\u2014\u2014\u6240\u4EE5\u8FD9\u4E00\u6BB5\u53EA\u62A5\u5211\u843D\u5728\u54EA\u91CC\u3001\u7531\u8C01\u52A8\u7684\u624B\uFF0C\u4E0D\u636E\u6B64\u65AD\u5409\u51F6\u3002");
  return parts.join("");
}
const FANFU_BY_TOPIC = Object.freeze({
  career: "\u5360\u529F\u540D\u8005\uFF0C\u7528\u723B\u65FA\u76F8\uFF0C\u9077\u800C\u53C8\u884C\u5F80\u4ED6\u8655\uFF0C\u53BB\u800C\u4ECD\u5FA9\u4F86",
  wealth: "\u5360\u8CA1\u7269\u805A\u6563\u4E0D\u5E38\uFF0C\u8CB7\u8CE3\u7D93\u71DF\u8208\u8870\u5F80\u4F86\u4E0D\u5B9A",
  property: "\u5360\u58B3\u5893\u5B85\u6368\uFF0C\u6B32\u9077\u4E0D\u9077\uFF0C\u6216\u9077\u4E4B\u800C\u518D\u9077\uFF0C\u6216\u76EE\u4E0B\u5C31\u6709\u9077\u79FB\u4E4B\u4E8B",
  marriage: "\u5360\u5A5A\u59FB\u53CD\u5FA9\u96E3\u6210",
  love: "\u5360\u5A5A\u59FB\u53CD\u5FA9\u96E3\u6210",
  health: "\u5360\u75BE\u75C5\u6108\u800C\u6709\u75C5",
  journey: "\u5360\u51FA\u884C\uFF0C\u884C\u81F3\u4E2D\u9014\u8B8A\u53CD\uFF0C\u537D\u4F7F\u5230\u5F7C\uFF0C\u4E00\u4E8B\u7121\u6210",
  dispute: "\u5360\u76DC\u8CCA\u5B98\u975E\uFF0C\u898B\u800C\u53C8\u898B"
});
const FANFU_ORIGINAL = "\u5366\u6709\u5366\u8B8A\uFF0C\u723B\u6709\u723B\u8B8A\u3002\u5366\u8B8A\u8005\u5167\u5916\u52D5\u800C\u53CD\u4F0F\u8005\u540C\u4E00\u5366\u4E5F\u3002\u5982\u4E7E\u5366\u8B8A\u5764\u5366\u3002\u723B\u8B8A\u8005\u5167\u5916\u723B\u52D5\u800C\u53CD\u4F0F\u8005\uFF0C\u975E\u540C\u4E00\u5366\u4E5F\u3002\u5982\u5347\u4E4B\u89C0\u662F\u4E5F\u3002\u53C8\u6709\u5916\u5366\u53CD\u4F0F\u800C\u5167\u5366\u4E0D\u52D5\u8005\uFF0C\u5982\u89C0\u4E4B\u5764\u662F\u4E5F\u3002\u53C8\u6709\u5167\u5366\u53CD\u4F0F\u800C\u5916\u5366\u4E0D\u52D5\u8005\u5982\u5DFD\u4E4B\u89C0\u662F\u4E5F";
const FANFU_CLOSING = "\u53CD\u4F0F\u5366\u7528\u795E\u65FA\u76F8\u4E0D\u8B8A\u6C96\u514B\u8005\u5247\u53CD\u5FA9\uFF0C\u4E8B\u4E4B\u5FC5\u6210\uFF0C\u7B2C\u6050\u7528\u795E\u800C\u5316\u56DE\u982D\u4E4B\u6C96\u514B\u8005\uFF0C\u537D\u662F\u5366\u8B8A\u5927\u51F6\u4E4B\u8C61";
function fanfuText(fanfu, changedName, topic, circle, calendar, movingPositions, transforms) {
  const parts = [];
  if (fanfu.guaChange) {
    parts.push(`\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u53CD\u4F0F\u7AE0\u7B2C\u4E8C\u5341\u4E94\u300B\u300C${FANFU_ORIGINAL}\u300D\uFF1A\u672C\u5366\u516D\u723B\u5168\u52A8\uFF0C\u53D8\u51FA${changedName}\u2014\u2014\u7AE0\u91CC\u300C\u540C\u4E00\u5366\u300D\u56DB\u4E2A\u5B57\u6307\u7684\u5C31\u662F\u672C\u5366\u4E0E\u53D8\u5366\u540C\u4E3A\u516B\u7EAF\u5366\u3001\u4E24\u4E24\u76F8\u5BF9\uFF08\u4E7E\u5764\u3001\u574E\u79BB\u3001\u9707\u5DFD\u3001\u826E\u5151\uFF09\u3002\u8FD9\u4E00\u6863\u6362\u8FC7\u53BB\u7684\u7EB3\u652F\u5E76\u4E0D\u9010\u4F4D\u76F8\u51B2\uFF0C\u6240\u4EE5\u4E0E\u4E0B\u9762\u90A3\u4E00\u6863\u4E0D\u662F\u4E00\u56DE\u4E8B\uFF0C\u672C\u5305\u5206\u6210\u4E24\u8DEF\u62A5\uFF0C\u5408\u5728\u4E00\u8D77\u7684\u8BDD\u4E7E\u53D8\u5764\u5C31\u5F97\u88AB\u6F0F\u6389\u3002`);
  } else {
    const swaps = [];
    if (fanfu.inner) swaps.push(`\u5185\u5366${fanfu.innerFrom}\u6362\u6210${fanfu.innerTo}`);
    if (fanfu.outer) swaps.push(`\u5916\u5366${fanfu.outerFrom}\u6362\u6210${fanfu.outerTo}`);
    parts.push(`\u6309\u300A\u589E\u5220\u535C\u6613\xB7\u53CD\u4F0F\u7AE0\u7B2C\u4E8C\u5341\u4E94\u300B\u300C${FANFU_ORIGINAL}\u300D\uFF1A\u672C\u5366\u53D8\u51FA${changedName}\uFF0C\u5176\u4E2D${swaps.join("\uFF0C")}\u3002\u5224\u636E\u662F\u9010\u4F4D\u516D\u51B2\u2014\u2014\u6362\u8FC7\u53BB\u7684\u90A3\u4E09\u652F\u4E0E\u672C\u5366\u90A3\u4E09\u652F\u4E00\u4E00\u76F8\u51B2\uFF0C\u7AE0\u91CC\u4E09\u4F8B\uFF08\u89C2\u4E4B\u5764\u3001\u5DFD\u4E4B\u89C2\u3001\u5347\u4E4B\u89C2\uFF09\u6362\u8FC7\u53BB\u7684\u90A3\u4E00\u7EC4\uFF0C\u65E0\u4E00\u4F8B\u5916\u90FD\u662F\u8FD9\u6837\u3002`);
    const say = fanfu.both ? "\u5167\u5916\u53CD\u4F0F\u8005\uFF0C\u5167\u5916\u4E0D\u5BE7\u4E4B\u8C61\u4E5F" : fanfu.inner ? "\u5167\u5366\u53CD\u4F0F\uFF0C\u5167\u5247\u4E0D\u5B89" : "\u5916\u5366\u53CD\u4F0F\uFF0C\u5916\u5247\u4E0D\u5BE7";
    parts.push(`${say}\u3002\u7AE0\u91CC\u7D27\u63A5\u7740\u5217\u4E86\u4E00\u4E32\u5BF9\u79F0\u7684\u8BF4\u6CD5\uFF1A\u300C\u7686\u4E3B\u6210\u800C\u6557\uFF0C\u6557\u800C\u6210\uFF0C\u6709\u800C\u537D\u7121\uFF0C\u7121\u800C\u537D\u6709\uFF0C\u5F97\u800C\u5931\uFF0C\u5931\u800C\u5F97\uFF0C\u4F86\u800C\u53BB\uFF0C\u53BB\u800C\u4F86\uFF0C\u6563\u800C\u805A\uFF0C\u805A\u800C\u6563\uFF0C\u52D5\u800C\u601D\u975C\uFF0C\u975C\u800C\u601D\u52D5\u300D\u2014\u2014\u8BF4\u7684\u662F\u540C\u4E00\u4EF6\u4E8B\u7684\u4E24\u5934\u4F1A\u7FFB\u9762\uFF0C\u4E0D\u662F\u5224\u5409\u51F6\u3002`);
    if (fanfu.inner !== fanfu.outer) {
      parts.push(fanfu.inner ? "\u7AE0\u91CC\u53E6\u6709\u4E00\u6761\u80FD\u76F4\u63A5\u5BF9\u4E0A\u53F7\uFF1A\u300C\u5360\u5F7C\u6B64\u4E4B\u5F62\u52E2\u8005\uFF0C\u5167\u5366\u53CD\u4F0F\uFF0C\u6211\u4E82\u4ED6\u5B9A\u300D\u2014\u2014\u5185\u5366\u53CD\u4F0F\uFF0C\u8FD9\u4E00\u8DEF\u8BF4\u7684\u662F\u6211\u8FD9\u4E00\u5934\u5148\u4E71\u3002" : "\u7AE0\u91CC\u53E6\u6709\u4E00\u6761\u80FD\u76F4\u63A5\u5BF9\u4E0A\u53F7\uFF1A\u300C\u5360\u5F7C\u6B64\u4E4B\u5F62\u52E2\u8005\u2026\u2026\u5916\u5366\u53CD\u4F0F\uFF0C\u4ED6\u4E82\u6211\u5B9A\u300D\u2014\u2014\u5916\u5366\u53CD\u4F0F\uFF0C\u8FD9\u4E00\u8DEF\u8BF4\u7684\u662F\u5BF9\u65B9\u90A3\u5934\u5148\u4E71\u3002");
    } else {
      parts.push("\u7AE0\u91CC\u90A3\u6761\u300C\u5360\u5F7C\u6B64\u4E4B\u5F62\u52E2\u8005\uFF0C\u5167\u5366\u53CD\u4F0F\uFF0C\u6211\u4E82\u4ED6\u5B9A\uFF0C\u5916\u5366\u53CD\u4F0F\uFF0C\u4ED6\u4E82\u6211\u5B9A\u300D\uFF0C\u5185\u5916\u90FD\u53CD\u4F0F\u65F6\u4E24\u53E5\u90FD\u6CBE\u5F97\u4E0A\uFF0C\u672C\u5305\u4E0D\u66FF\u4F60\u62E9\u4E00\u53E5\u3002");
    }
  }
  const line = topic ? FANFU_BY_TOPIC[topic.key] : null;
  if (line) {
    parts.push(`\u6240\u95EE\u843D\u5728\u300C${topic.label}\u300D\uFF0C\u7AE0\u91CC\u6B63\u6709\u8FD9\u4E00\u6761\uFF1A${line}\u3002`);
  } else if (topic) {
    parts.push(`\u6240\u95EE\u843D\u5728\u300C${topic.label}\u300D\uFF0C\u53CD\u4F0F\u7AE0\u8FD9\u4E00\u8282\u6CA1\u6709\u5BF9\u5F97\u4E0A\u7684\u5360\u6CD5\u2014\u2014\u7AE0\u91CC\u90A3\u5341\u6761\u5404\u7BA1\u4E00\u6869\u4E8B\uFF0C\u522B\u7684\u5360\u6CD5\u632A\u8FC7\u6765\u9876\u5C31\u662F\u66FF\u4EBA\u9009\u4E86\uFF0C\u6545\u6B64\u5904\u4E0D\u63A5\u3002`);
  } else {
    parts.push("\u6CA1\u5199\u6240\u95EE\u4F55\u4E8B\uFF0C\u53CD\u4F0F\u7AE0\u90A3\u5341\u6761\u5360\u6CD5\u5404\u7BA1\u4E00\u6869\u4E8B\uFF0C\u63A5\u4E0D\u4E0A\uFF1B\u5199\u4E0B\u95EE\u9898\u518D\u6309\u4E8B\u7C7B\u770B\u8FD9\u4E00\u6BB5\u3002");
  }
  if (!circle) {
    parts.push(`\u7AE0\u672B\u6536\u53E3\u7684\u662F\u300C${FANFU_CLOSING}\u300D\u2014\u2014\u8FD9\u4E24\u6761\u8981\u4EE5\u7528\u795E\u4E3A\u8F74\uFF0C\u800C\u672C\u5366\u53D6\u4E0D\u51FA\u7528\u795E\uFF0C\u7B2C\u4E00\u6761\u5C31\u6838\u4E0D\u4E86\u3002\u5199\u4E0B\u95EE\u9898\u518D\u770B\u8FD9\u4E00\u6BB5\u3002`);
    return parts.join("");
  }
  const godTone = vitality(circle.god.element, calendar.monthElement);
  const strong = !["\u4F11", "\u56DA", "\u6B7B"].includes(godTone.key);
  const godMoving = movingPositions.includes(circle.god.position);
  const huiTouKe = transforms.some(
    (item) => item.position === circle.god.position && item.relation === "\u56DE\u5934\u514B"
  );
  const close = `\u7AE0\u672B\u6536\u53E3\u7684\u662F\u300C${FANFU_CLOSING}\u300D\u3002\u62FF\u672C\u5366\u6838\u8FD9\u4E24\u6761\uFF1A\u7528\u795E\u5728${circle.god.label}${circle.god.element}\uFF0C\u4E8E\u6708\u5EFA${godTone.key}\uFF0C\u300C\u7528\u795E\u65FA\u76F8\u300D\u90A3\u6761${strong ? "\u6210\u7ACB" : "\u4E0D\u6210\u7ACB"}\uFF08${godTone.key}${strong ? "\u4E0D\u5C5E\u4F11\u56DA" : "\u6B63\u5C5E\u4F11\u56DA"}\uFF09` + (godMoving ? `\uFF1B\u7528\u795E\u672C\u723B\u5728\u52A8\uFF0C\u300C\u7528\u795E\u5316\u56DE\u5934\u51B2\u514B\u300D\u90A3\u6761${huiTouKe ? "\u6210\u7ACB" : "\u4E0D\u6210\u7ACB\uFF08\u53D8\u51FA\u6765\u7684\u90A3\u4E00\u723B\u4E0D\u514B\u672C\u723B\uFF09"}\u3002` : "\uFF1B\u7528\u795E\u672C\u723B\u4E0D\u5728\u52A8\uFF0C\u8C08\u4E0D\u4E0A\u300C\u5316\u300D\uFF0C\u56DE\u5934\u51B2\u514B\u90A3\u6761\u4E0D\u6210\u7ACB\u3002") + "\u7AE0\u91CC\u90A3\u53E5\u300C\u4E8B\u4E4B\u5FC5\u6210\u300D\u53EA\u5728\u8FD9\u4E24\u6761\u540C\u65F6\u6210\u7ACB\u65F6\u624D\u6709\uFF1B\u5316\u56DE\u5934\u51B2\u514B\u6210\u7ACB\u65F6\uFF0C\u7AE0\u91CC\u63A5\u7740\u8BF4\u90A3\u662F\u300C\u5366\u8B8A\u5927\u51F6\u4E4B\u8C61\u300D\u3002\u4E24\u6761\u90FD\u4EE5\u7528\u795E\u4E3A\u8F74\uFF0C\u6240\u4EE5\u8FD9\u4E00\u6BB5\u4E0D\u53E6\u4E0B\u5409\u51F6\u5224\u8BCD\uFF0C\u5224\u8BCD\u4ECD\u5F52\u7528\u795E\u65FA\u8870\u90A3\u4E00\u8DEF\u3002";
  parts.push(close);
  return parts.join("");
}
function clashKinds({ hexagram, jf, changed, changedJf, movingPositions }) {
  const here = hexagramClash(hexagram, jf);
  const there = changedJf ? hexagramClash(changed, changedJf) : null;
  const incidental = [];
  for (let a = 1; a <= 6; a += 1) {
    for (let b = a + 1; b <= 6; b += 1) {
      if (branchClash(jf.lines[a - 1].branchIndex) !== jf.lines[b - 1].branchIndex) continue;
      if (CLASH_STANDARD_PAIRS.some(([x, y]) => x === a && y === b || x === b && y === a)) continue;
      incidental.push({ a, b, lineA: jf.lines[a - 1], lineB: jf.lines[b - 1] });
    }
  }
  const transformClash = [];
  if (changedJf) {
    for (const position of movingPositions) {
      const line = jf.lines[position - 1];
      const changedLine = changedJf.lines[position - 1];
      if (branchClash(line.branchIndex) === changedLine.branchIndex) {
        transformClash.push({ position, line, changedLine });
      }
    }
  }
  return {
    chong: here.chong,
    he: here.he,
    pairs: here.pairs,
    changedChong: there?.chong ?? false,
    changedHe: there?.he ?? false,
    heToChong: Boolean(here.he && there?.chong),
    chongToChong: Boolean(here.chong && there?.chong),
    transformClash,
    incidental,
    incidentalOutsideChong: incidental.length > 0 && !here.chong,
    hasAny: here.chong || here.he || Boolean(there?.chong) || transformClash.length > 0 || incidental.length > 0
  };
}
const CLASH_STANDARD_PAIRS = Object.freeze([[1, 4], [2, 5], [3, 6]]);
function clashText(kinds, circle, topic, calendar) {
  const parts = [];
  if (kinds.chong || kinds.he) {
    const which = kinds.chong ? "\u516D\u51B2\u5366" : "\u516D\u5408\u5366";
    const spoken = kinds.pairs.map((pair) => `${pair.lower.branch}${pair.upper.branch}`).join("\u3001");
    parts.push(`\u672C\u5366\u662F${which}\u3002\u7EB3\u7532\u88C5\u51FA\u6765\u521D\u56DB\u3001\u4E8C\u4E94\u3001\u4E09\u516D\u4E09\u5BF9\uFF0C${kinds.chong ? "\u4E09\u5BF9\u7686\u51B2" : "\u4E09\u5BF9\u7686\u5408"}\uFF08${spoken}\uFF09\u3002`);
  } else {
    const near = kinds.pairs.filter((pair) => pair.kind !== null);
    parts.push(`\u672C\u5366\u65E2\u4E0D\u662F\u516D\u51B2\u5366\u4E5F\u4E0D\u662F\u516D\u5408\u5366\uFF1A\u521D\u56DB\u3001\u4E8C\u4E94\u3001\u4E09\u516D\u4E09\u5BF9\u91CC` + (near.length === 0 ? "\u4E00\u5BF9\u4E5F\u4E0D\u51B2\u4E0D\u5408\u3002" : `\u53EA\u6709${near.map((pair) => `${pair.lower.branch}${pair.upper.branch}`).join("\u3001")}\u8FD9\u4E00\u5BF9${near[0].kind}\u3002`));
  }
  const trans = [];
  if (kinds.transformClash.length > 0) {
    trans.push(`${kinds.transformClash.map((item) => `${item.line.label}\u5316\u51FA${item.changedLine.branch}`).join("\u3001")}\uFF0C\u53D8\u51FA\u53BB\u7684\u90A3\u4E00\u652F\u6B63\u597D\u51B2\u672C\u4F4D\u90A3\u4E00\u723B\uFF08\u52A8\u723B\u53D8\u51B2\uFF09`);
  }
  if (kinds.heToChong) {
    trans.push("\u672C\u5366\u516D\u5408\u3001\u53D8\u5366\u516D\u51B2\uFF08\u516D\u5408\u53D8\u516D\u51B2\uFF09");
  }
  if (kinds.chongToChong) {
    trans.push("\u672C\u5366\u516D\u51B2\u3001\u53D8\u5366\u4E5F\u662F\u516D\u51B2\uFF08\u516D\u51B2\u53D8\u516D\u51B2\uFF09");
  } else if (kinds.changedChong && !kinds.heToChong) {
    trans.push("\u53D8\u51FA\u6765\u7684\u90A3\u4E2A\u5366\u662F\u516D\u51B2\u5366\uFF08\u5366\u53D8\u516D\u51B2\uFF0C\u5E95\u672C\u4F5C\u300C\u51B2\u53D8\u516D\u51B2\u300D\uFF09");
  }
  if (trans.length > 0) parts.push(`${trans.join("\uFF1B")}\u3002`);
  if (kinds.incidentalOutsideChong) {
    parts.push(`\u5366\u91CC\u53E6\u6709${kinds.incidental.map((pair) => `${pair.lineA.label}${pair.lineA.branch}\u51B2${pair.lineB.label}${pair.lineB.branch}`).join("\u3001")}\u2014\u2014\u8FD9\u662F\u5366\u5185\u4E24\u723B\u76F8\u51B2\uFF0C\u4E0D\u7B49\u4E8E\u672C\u5366\u5C31\u662F\u516D\u51B2\u5366\u3002`);
  }
  if (kinds.heToChong) {
    parts.push("\u539F\u4E66\u5BF9\u516D\u5408\u53D8\u516D\u51B2\u5199\u5F97\u5F88\u91CD\uFF1A\u300C\u8BF8\u5360\u5148\u5408\u540E\u79BB\u3001\u5148\u4EB2\u540E\u758F\u3001\u5148\u6D53\u540E\u6DE1\uFF0C\u59CB\u8363\u7EC8\u60B4\uFF0C\u5F97\u800C\u590D\u5931\uFF0C\u6210\u800C\u540E\u8D25\uFF0C\u4E8B\u5C31\u800C\u53C8\u53D8\u4E5F\u3002\u60DF\u5360\u5B98\u975E\u3001\u76D7\u8D3C\u3001\u7ED3\u7EDD\u4E8B\u8005\u5B9C\u4E4B\u3002\u300D" + (topic?.key === "dispute" ? "\u6240\u95EE\u6B63\u843D\u5728\u5B98\u8BBC\u662F\u975E\u4E0A\uFF0C\u672B\u4E86\u90A3\u534A\u53E5\u8BF4\u7684\u5C31\u662F\u8FD9\u4E00\u7C7B\u3002" : "\u672B\u4E86\u90A3\u534A\u53E5\u8BF4\u7684\u662F\u5B98\u975E\u3001\u76D7\u8D3C\u3001\u7ED3\u7EDD\u4E8B\u4E00\u7C7B\uFF1B\u6240\u95EE\u4E0D\u5728\u6B64\uFF0C\u65AD\u8BED\u4E0D\u66FF\u5B83\u6539\u5224\u5409\u51F6\u3002"));
  }
  if (kinds.chongToChong) {
    parts.push("\u516D\u51B2\u53D8\u516D\u51B2\uFF0C\u539F\u4E66\u4F5C\u300C\u4E43\u5185\u5916\u53D8\u52A8\uFF0C\u4EA4\u76F8\u51B2\u51FB\uFF0C\u5FC5\u4E3B\u4E0A\u4E0B\u4E0D\u548C\uFF0C\u81F3\u4EB2\u53CD\u76EE\uFF0C\u5F7C\u6B64\u6000\u5978\uFF0C\u59CB\u7EC8\u4E0D\u5C31\u3002\u82E5\u7528\u795E\u518D\u53D7\u514B\u8005\uFF0C\u5927\u51F6\u4E4B\u5146\uFF0C\u7EB5\u7528\u795E\u65FA\u76F8\uFF0C\u4EA6\u4E0D\u957F\u4E45\u300D\u3002");
  }
  if (kinds.chong || kinds.heToChong || kinds.chongToChong) {
    parts.push("\u7AE0\u672B\u628A\u603B\u89C4\u77E9\u6536\u5728\u4E00\u53E5\u4E0A\uFF1A\u300C\u51B2\u8005\uFF0C\u6563\u4E5F\u3002\u51E1\u5360\u51F6\u4E8B\uFF0C\u5B9C\u4E8E\u51B2\u6563\uFF1B\u5360\u5409\u4E8B\uFF0C\u5219\u4E0D\u5B9C\u3002\u4EA6\u5FC5\u517C\u7528\u795E\u800C\u8A00\uFF0C\u7528\u795E\u82E5\u65FA\uFF0C\u867D\u51B2\u4E0D\u788D\uFF1B\u7528\u795E\u5931\u9677\uFF0C\u51F6\u800C\u53C8\u51F6\u3002\u300D\u6240\u95EE\u7B97\u5409\u4E8B\u8FD8\u662F\u51F6\u4E8B\uFF0C\u662F\u4F60\u81EA\u5DF1\u7684\u5B9A\u4F4D\uFF0C\u672C\u5305\u4E0D\u66FF\u4F60\u5F52\u8FD9\u4E00\u5934\uFF1B\u540E\u534A\u53E5\u5224\u5F97\u4E86\uFF0C\u6309\u7528\u795E\u8BF4\uFF1A");
    if (!circle) {
      parts.push("\u7528\u795E\u5B9A\u4E0D\u4E0B\u6765\uFF0C\u8FD9\u4E00\u5C42\u5C31\u4E0D\u63A5\u3002");
    } else {
      const tone = vitality(circle.god.element, calendar.monthElement);
      const strong = tone.tone === "strong" || tone.tone === "good";
      parts.push(strong ? `\u7528\u795E${circle.god.label}${circle.god.element}\u4E8E\u6708\u5EFA\u4E3A${tone.key}\uFF0C\u7167\u300C\u7528\u795E\u82E5\u65FA\uFF0C\u867D\u51B2\u4E0D\u788D\u300D\uFF0C\u8FD9\u5C42\u51B2\u4E0D\u788D\u7740\u5B83\u3002` : `\u7528\u795E${circle.god.label}${circle.god.element}\u4E8E\u6708\u5EFA\u4E3A${tone.key}\uFF0C\u843D\u5728\u5931\u9677\u90A3\u4E00\u5934\uFF0C\u7167\u300C\u7528\u795E\u5931\u9677\uFF0C\u51F6\u800C\u53C8\u51F6\u300D\uFF0C\u8FD9\u5C42\u51B2\u5BF9\u5B83\u4E0D\u662F\u597D\u4E8B\u3002`);
    }
  }
  if (topic?.key === "health" && (kinds.chong || kinds.heToChong || kinds.chongToChong)) {
    parts.push("\u5360\u75C5\u53E6\u6709\u4E00\u6761\u4E0D\u517C\u7528\u795E\u7684\uFF1A\u300C\u60DF\u5360\u75C5\uFF0C\u6709\u8FDC\u8FD1\u4E4B\u5206\uFF0C\u4E0D\u7528\u7528\u795E\uFF0C\u8FD1\u75C5\u9022\u51B2\u5373\u6108\uFF0C\u4E45\u75C5\u9022\u51B2\u5219\u6B7B\u3002\u300D\u65B0\u75C5\u8FD8\u662F\u4E45\u75C5\u53EA\u6709\u4F60\u6E05\u695A\uFF0C\u8FD9\u91CC\u53EA\u5F15\u8FD9\u53E5\u3001\u4E0D\u66FF\u4F60\u9009\u8FB9\u3002");
  }
  if (kinds.chong) {
    parts.push("\u539F\u4E66\u53E6\u6709\u4E00\u53E5\u515C\u5E95\uFF1A\u300C\u53E4\u4EE5\u516D\u51B2\u5366\uFF0C\u8BF8\u5360\u4E0D\u5409\u3002\u4E88\u5C61\u8BD5\u4E4B\uFF0C\u7528\u795E\u5931\u9677\uFF0C\u5B9E\u4E0D\u4E3A\u5409\uFF1B\u7528\u82E5\u5F97\u5730\uFF0C\u987B\u4EE5\u7528\u795E\u65AD\u4E4B\u3002\u300D\u6240\u4EE5\u516D\u51B2\u5366\u672C\u8EAB\u4E0D\u4F5C\u51F6\u8BBA\u3002");
  }
  return parts.join("");
}
function transformText(transforms, circle) {
  if (transforms.length === 0) {
    return "\u516D\u723B\u7686\u9759\uFF0C\u65E0\u53D8\u5366\uFF0C\u4E5F\u5C31\u8C08\u4E0D\u4E0A\u53D8\u51FA\u4E4B\u723B\u2014\u2014\u672C\u5366\u7684\u683C\u5C40\u5C31\u6B64\u5B9A\u683C\uFF0C\u4E0D\u4F1A\u4E2D\u9014\u751F\u53D8\u3002";
  }
  const at = (lines, position) => lines.some((line) => line.position === position);
  const rows = transforms.map((item) => {
    if (item.relation !== "\u56DE\u5934\u514B" || !circle) return item.sentence;
    if (item.position === circle.godPosition) {
      return `${item.sentence}\u8FD9\u4E00\u723B\u6B63\u662F\u7528\u795E\u2014\u2014\u7167\u300A\u535C\u7B6E\u6B63\u5B97\u300B\u300C\u539F\u7528\u4E8C\u795E\u9047\u4E4B\u5247\u51F6\u300D\uFF0C\u7528\u795E\u906D\u56DE\u5934\u514B\u662F\u5B9E\u6253\u5B9E\u7684\u51F6\u3002`;
    }
    if (at(circle.ji, item.position) || at(circle.chou, item.position)) {
      const name = at(circle.ji, item.position) ? "\u5FCC\u795E" : "\u4EC7\u795E";
      return `${item.sentence}\u8FD9\u4E00\u723B\u6B63\u843D\u5728${name}\u90A3\u4E00\u884C\u2014\u2014\u7167\u540C\u7AE0\u300C\u5FCC\u4EC7\u4E8C\u795E\u9047\u4E4B\u53CD\u5409\u300D\uFF0C\u56DE\u5934\u514B\u6253\u5728${name}\u4E0A\uFF0C\u8FD9\u4E00\u5366\u91CC\u53CD\u4E0D\u4F5C\u51F6\u8BBA\u3002`;
    }
    if (at(circle.yuan, item.position)) {
      return `${item.sentence}\u8FD9\u4E00\u723B\u6B63\u843D\u5728\u5143\u795E\u90A3\u4E00\u884C\u3002\u4E66\u4E0A\u56DE\u5934\u514B\u53EA\u4EA4\u4EE3\u7528\u795E\u4E0E\u5FCC\u4EC7\u4E24\u8DEF\uFF0C\u5143\u795E\u9047\u4E4B\u5982\u4F55\u539F\u4E66\u672A\u8A00\uFF0C\u8FD9\u91CC\u4E0D\u66FF\u5B83\u5B9A\u3002`;
    }
    return item.sentence;
  });
  return "\u6309\u300A\u589E\u5220\u535C\u6613\u300B\u300C\u592B\u8B8A\u51FA\u4E4B\u723B\uFF0C\u80FD\u751F\u514B\u6C96\u5408\u672C\u4F4D\u4E4B\u52D5\u723B\uFF0C\u4E0D\u80FD\u751F\u514B\u4ED6\u723B\u300D\uFF0C\u53D8\u723B\u53EA\u4E0E\u672C\u4F4D\u52A8\u723B\u76F8\u751F\u514B\uFF0C\u4E0D\u4E0E\u4ED6\u723B\u76F8\u5E72\uFF1A" + rows.join(" ");
}
function godSentence(god, lineLabel) {
  return `\u7528\u795E\u4E34${god}\uFF08${lineLabel}\uFF09\uFF0C${SIX_GOD_MEANING[god].meaning}\u2014\u2014\u8FD9\u662F\u8FD9\u4EF6\u4E8B\u7684\u8C03\u5B50\uFF0C\u6210\u4E0D\u6210\u4ECD\u53EA\u7531\u4E0A\u9762\u7684\u751F\u514B\u4E0E\u65FA\u8870\u5B9A\uFF0C\u516D\u795E\u4E0D\u6539\u5409\u51F6\u3002`;
}
function voidSentence(v) {
  const marks = [];
  if (v.isVoid) marks.push("\u65EC\u7A7A");
  if (v.isBroken) marks.push("\u6708\u7834");
  if (v.isTomb) marks.push("\u5165\u5893");
  if (marks.length === 0) return "";
  if (v.status === "\u5047\u7A7A") {
    return `${marks.join("\u53C8")}\uFF0C\u7136${v.rescues.join("\u3001")}\uFF0C\u662F\u5047\u7A7A\uFF1A\u51FA\u65EC\u6216\u9022\u51B2\u4E4B\u65E5\u7167\u65E7\u6709\u529B\uFF0C\u4E0D\u662F\u5168\u65E0\u6307\u671B\u3002`;
  }
  if (v.status === "\u771F\u7A7A") {
    const extra = v.empties.filter((one) => !(v.isBroken && one === "\u9022\u6708\u7834"));
    const because = extra.length === 0 ? "" : `\uFF0C\u4E14${extra.join("\u3001")}`;
    const wait = v.isBroken ? "\u5F85\u51FA\u6708\u3001\u9022\u503C\u518D\u8BBA" : "\u8FD9\u4E00\u65EC\u91CC\u505A\u4E0D\u6210\uFF0C\u7B49\u51FA\u65EC\u9022\u503C\u6216\u9022\u51B2\u518D\u8BBA";
    return `${marks.join("\u53C8")}${because}\uFF0C\u662F\u771F\u7A7A\uFF1A${wait}\u3002`;
  }
  return `${marks.join("\u53C8")}\uFF0C\u6682\u770B\u4E0D\u51FA\u771F\u5047\uFF0C\u7B49\u51FA\u65EC\u6216\u9022\u51B2\u4E4B\u65E5\u518D\u5B9A\u3002`;
}
function buildAdvice(verdict) {
  const good = verdict.score >= 1;
  const bad = verdict.score <= -1;
  return {
    suitable: good ? ["\u4E3B\u52A8\u63A8\u8FDB\uFF0C\u6293\u7D27\u65F6\u95F4", "\u4E89\u53D6\u5916\u63F4\u76F8\u52A9", "\u843D\u5B9A\u7ED3\u679C\u540E\u518D\u63A8\u8FDB\u4E0B\u4E00\u6B65"] : bad ? ["\u5B88\u6210\uFF0C\u4E0D\u5B9C\u6269\u5F20", "\u5148\u5904\u7406\u5185\u52A1\u518D\u5BF9\u5916", "\u907F\u5F00\u6B63\u9762\u5BF9\u6297"] : ["\u6309\u539F\u8BA1\u5212\u7B49\u5F85\u65F6\u673A", "\u5148\u89C2\u5BDF\u518D\u51B3\u5B9A\u8FDB\u9000"],
    avoid: good ? ["\u53CD\u590D\u72B9\u8C6B\u3001\u4E45\u62D6\u4E0D\u51B3", "\u8F7B\u4FE1\u53E3\u5934\u627F\u8BFA"] : bad ? ["\u6B63\u9762\u5F3A\u4E89", "\u989D\u5916\u6295\u5165\u4E0E\u52A0\u7801", "\u5728\u5BF9\u65B9\u4E3B\u573A\u884C\u4E8B"] : ["\u4E34\u65F6\u53D8\u5366\u3001\u968F\u610F\u66F4\u6539\u65B9\u5411"],
    caution: good ? "宜循序推进，留意条件变化。" : bad ? "宜审慎行事，留意条件变化。" : ""
  };
}
function serialize(hexagram) {
  return {
    order: hexagram.order,
    key: hexagram.key,
    name: hexagram.name,
    symbol: hexagramSymbol(hexagram.key),
    upper: hexagram.upperTrigram,
    lower: hexagram.lowerTrigram,
    judgment: hexagram.judgment,
    tuan: hexagram.tuan,
    image: hexagram.image,
    element: uniqueElement(hexagram.upperTrigram.element, hexagram.lowerTrigram.element)
  };
}
function uniqueElement(upper, lower) {
  return upper === lower ? upper : `${upper}${lower}`;
}
let idSequence = 0;
function buildId(hexagram, positions, now) {
  const stamp = now.toISOString().replace(/[-:.TZ]/gu, "").slice(0, 14);
  idSequence += 1;
  const seed = `${hexagram.order}-${positions.join("")}-${stamp}-${idSequence}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = hash * 31 + seed.charCodeAt(index) >>> 0;
  }
  return `${stamp}-${hash.toString(36).padStart(7, "0")}`;
}
export {
  buildReading,
  castByCoins,
  castByHexagram,
  castByNumbers,
  castByTime,
  castDaily,
  generates,
  overcomes,
  tossCoins
};
