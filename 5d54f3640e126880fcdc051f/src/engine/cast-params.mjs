import {
  castByCoins,
  castByHexagram,
  castByNumbers,
  castByTime,
  castDaily,
  tossCoins
} from "./divination.mjs";
import { hexagramByKey } from "./hexagrams.mjs";
const MAX_QUESTION = 120;
const MAX_NUMBER = 1e9;
const CAST_METHODS = Object.freeze(["time", "daily", "numbers", "coins", "hexagram"]);
const COIN_TOSSES = 6;
const COIN_SUM_MIN = 6;
const COIN_SUM_MAX = 9;
const PACKAGE_VERSION = "1.1.0";
class CastParamError extends Error {
  /**
   * @param {string} message
   * @param {string} [recovery]
   */
  constructor(message, recovery) {
    super(message);
    this.name = "CastParamError";
    this.recovery = recovery;
  }
}
function toBoundedInteger(value, max, label) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    throw new CastParamError(`${label}\u9700\u8981\u662F\u6574\u6570\u3002`, `\u628A${label}\u6362\u6210\u4E00\u4E2A 1 \u5230 ${max} \u4E4B\u95F4\u7684\u6574\u6570\u91CD\u8BD5\u3002`);
  }
  if (parsed < 1 || parsed > max) {
    throw new CastParamError(`${label}\u9700\u5728 1 \u5230 ${max} \u4E4B\u95F4\u3002`, `\u628A${label}\u6539\u5230 1 \u5230 ${max} \u4E4B\u95F4\u3002`);
  }
  return parsed;
}
function clampText(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function coinSumsFrom(sums) {
  if (!Array.isArray(sums) || sums.length !== COIN_TOSSES) {
    throw new CastParamError(
      `\u6447\u5366\u8981 ${COIN_TOSSES} \u6B21\u63B7\u94B1\u7ED3\u679C\u3002`,
      `\u4F20 ${COIN_TOSSES} \u4E2A 6 \u5230 9 \u4E4B\u95F4\u7684\u6574\u6570\u3002`
    );
  }
  return sums.map((sum, index) => {
    const parsed = toBoundedInteger(sum, COIN_SUM_MAX, `\u7B2C ${index + 1} \u6B21\u63B7\u94B1\u7ED3\u679C`);
    if (parsed < COIN_SUM_MIN) {
      throw new CastParamError(
        `\u7B2C ${index + 1} \u6B21\u63B7\u94B1\u70B9\u6570\u662F ${parsed}\u3002`,
        `\u4E09\u679A\u94DC\u94B1\u70B9\u6570\u53EA\u843D\u5728 ${COIN_SUM_MIN} \u5230 ${COIN_SUM_MAX} \u4E4B\u95F4\uFF1A\u80CC\u9762\u4E09\u4E2A\u4E3A ${COIN_SUM_MAX}\uFF0C\u6B63\u9762\u4E09\u4E2A\u4E3A ${COIN_SUM_MIN}\u3002`
      );
    }
    return parsed;
  });
}
function tossCoinSums() {
  return Array.from({ length: COIN_TOSSES }, () => tossCoins().sum);
}
function castFromParams(params, now) {
  const method = typeof params.method === "string" && params.method !== "" ? params.method : "time";
  if (!CAST_METHODS.includes(method)) {
    throw new CastParamError(
      `\u672A\u77E5\u7684\u8D77\u6CD5\uFF1A${method}`,
      `method \u53EA\u80FD\u662F ${CAST_METHODS.join("\u3001")}\u3002`
    );
  }
  if (method === "time") return castByTime(now);
  if (method === "daily") return castDaily(now);
  if (method === "coins") return castByCoins(coinSumsFrom(params.sums));
  if (method === "numbers") {
    const upper = toBoundedInteger(params.upper, MAX_NUMBER, "\u7B2C\u4E00\u6570");
    const lower = toBoundedInteger(params.lower, MAX_NUMBER, "\u7B2C\u4E8C\u6570");
    return castByNumbers(upper, lower);
  }
  const key = params.key;
  if (typeof key !== "string" || !/^[01]{6}$/.test(key)) {
    throw new CastParamError(
      "\u6307\u5B9A\u5366\u9700\u8981\u516D\u723B\u7684\u5366 key\u3002",
      "key \u5F62\u5982 010011\uFF0C\u81EA\u4E0B\u800C\u4E0A\u516D\u723B\uFF0C1 \u4E3A\u9633\u30010 \u4E3A\u9634\uFF1B\u7701\u7565 key \u5373\u6309\u5F53\u4E0B\u65F6\u8FB0\u8D77\u5366\u3002"
    );
  }
  return castByHexagram(hexagramByKey(key));
}
export {
  CAST_METHODS,
  CastParamError,
  MAX_NUMBER,
  MAX_QUESTION,
  PACKAGE_VERSION,
  castFromParams,
  clampText,
  tossCoinSums
};
