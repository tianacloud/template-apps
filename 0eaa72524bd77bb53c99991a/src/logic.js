let currentConfig;
function loadConfig() {
  return currentConfig;
}
function expiringWithin(items, days, now = Date.now()) {
  const limit = now + days * 864e5;
  return items.filter(
    (d) => !d.expired && d.balance > 0 && d.expireTimeMs !== null && d.expireTimeMs <= limit
  );
}
function ledgerQuota(q, triggerPercent) {
  const mk = (o, fallbackUnlimited) => {
    const used = Number(o?.usedPercent ?? 0);
    const total = Number(o?.totalPercent ?? 100) || 100;
    const unlimited = Boolean(o?.unlimited ?? fallbackUnlimited);
    return {
      usedPercent: used,
      totalPercent: total,
      remainingPercent: Math.max(0, (total - used) / total) * 100,
      exhausted: !unlimited && total > 0 && used >= total,
      unlimited,
      triggered: isTriggered(used, total, unlimited, triggerPercent),
      resetTimeMs: Number(o?.resetTimeMs ?? 0) || null
    };
  };
  return {
    fiveHour: mk(q?.fiveHour, false),
    weekly: mk(q?.weekly, true)
  };
}
function ledgerInputs(v, now) {
  const rawCredits = Array.isArray(v?.credits) ? v.credits : null;
  const items = (rawCredits ?? []).map((c) => {
    const balance = Number(c?.balance ?? 0);
    const expireTimeMs = Number(c?.expireTimeMs ?? 0) || null;
    const expired = expireTimeMs !== null && expireTimeMs < now;
    return {
      kind: c?.source === "platform" ? "platform" : "code-credit",
      source: c?.source === "platform" ? "platform" : "code",
      label: String(c?.label ?? "积分"),
      granted: Number(c?.granted ?? 0),
      consumed: Number(c?.used ?? 0),
      balance,
      expireTimeMs,
      grantedAtMs: null,
      // 过期时仍有余额 = 真实损失；过期但已用尽不算损失
      lost: expired && balance > 0,
      expired
    };
  });
  const codeItems = items.filter((i) => i.source === "code");
  const platformPools = items.filter((i) => i.source === "platform");
  const live = codeItems.filter((i) => !i.expired);
  const codeCredits = {
    items: codeItems,
    totalCount: codeItems.length,
    truncated: false,
    liveBalance: live.reduce((sum, d) => sum + d.balance, 0),
    lostBalance: codeItems.filter((d) => d.lost).reduce((sum, d) => sum + d.balance, 0),
    lostCount: codeItems.filter((d) => d.lost).length,
    expiredCount: codeItems.filter((d) => d.expired).length
  };
  const cards = (Array.isArray(v?.cards) ? v.cards : []).map((c) => {
    const expireTimeMs = Number(c?.expireTimeMs ?? 0) || null;
    return {
      cardId: String(c?.cardId ?? ""),
      label: String(c?.label ?? "重置卡"),
      sourceType: String(c?.sourceType ?? ""),
      outBizNo: String(c?.outBizNo ?? ""),
      expireTimeMs,
      createTimeMs: null,
      expired: expireTimeMs !== null && expireTimeMs <= now
    };
  });
  return {
    platformPools,
    codeCredits,
    cards,
    // ⚠️ `credits` 字段缺失 ⇒ 数据不完整（不是「没有积分」）。
    creditDataComplete: rawCredits !== null
  };
}
const DEFAULT_QUOTA_TRIGGER_PERCENT = 99;
const DEFAULT_TIGHT_PERCENT = 80;
const DEFAULT_LOW_PERCENT = 95;
const DEFAULT_CARD_SKIP_BEFORE_RESET_MINUTES = 60;
function defaultConfig() {
  return {
    schemaVersion: 1,
    cardTriggerPercent: DEFAULT_QUOTA_TRIGGER_PERCENT,
    cardSkipBeforeResetMinutes: DEFAULT_CARD_SKIP_BEFORE_RESET_MINUTES,
    quotaLevels: { tight: DEFAULT_TIGHT_PERCENT, low: DEFAULT_LOW_PERCENT }
  };
}
function clampNumber(value, lo, hi, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}
export function normalizeConfig(raw) {
  const d = defaultConfig();
  const issues = [];
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const rawCard = src.cardTriggerPercent;
  const cardTriggerPercent = clampNumber(rawCard, 1, 100, d.cardTriggerPercent);
  if (rawCard != null && Number(rawCard) !== cardTriggerPercent) {
    issues.push(`cardTriggerPercent=${rawCard} 超出 1..100，已夹到 ${cardTriggerPercent}`);
  }
  const lv = src.quotaLevels && typeof src.quotaLevels === "object" ? src.quotaLevels : {};
  let tight = clampNumber(lv.tight, 1, 100, d.quotaLevels.tight);
  let low = clampNumber(lv.low, 1, 100, d.quotaLevels.low);
  if (!(tight < low)) {
    if (Object.keys(lv).length > 0) {
      issues.push(`quotaLevels 需满足 tight < low（收到 tight=${tight} low=${low}），已整体回退默认`);
    }
    tight = d.quotaLevels.tight;
    low = d.quotaLevels.low;
  }
  const rawSkip = src.cardSkipBeforeResetMinutes;
  const cardSkipBeforeResetMinutes = clampNumber(rawSkip, 0, 1440, d.cardSkipBeforeResetMinutes);
  if (rawSkip != null && Number(rawSkip) !== cardSkipBeforeResetMinutes) {
    issues.push(`cardSkipBeforeResetMinutes=${rawSkip} 超出 0..1440，已夹到 ${cardSkipBeforeResetMinutes}`);
  }
  const config = {
    schemaVersion: 1,
    cardTriggerPercent,
    cardSkipBeforeResetMinutes,
    quotaLevels: { tight, low }
  };
  return { config, issues };
}
const LEVEL_LABEL = {
  comfortable: "额度充足",
  tight: "额度紧张",
  low: "额度不足",
  burned: "额度燃尽"
};
function minutesToReset(fiveHour, nowMs) {
  const reset = fiveHour?.resetTimeMs;
  if (typeof reset !== "number" || !Number.isFinite(reset)) return null;
  return Math.max(0, (reset - nowMs) / 6e4);
}
function quotaLevel(used, total, unlimited, tight, low) {
  if (unlimited || total <= 0) return "comfortable";
  if (used >= total) return "burned";
  const ratio = used / total * 100;
  if (ratio >= low) return "low";
  if (ratio >= tight) return "tight";
  return "comfortable";
}
function isTriggered(used, total, unlimited, triggerPercent = DEFAULT_QUOTA_TRIGGER_PERCENT) {
  if (unlimited || total <= 0) return false;
  return used >= total * triggerPercent / 100;
}
const SOURCE_NAME = { platform: "平台积分", code: "Code 积分", card: "重置卡" };
function decide({ platformPools, codeCredits, cards, quota, creditDataComplete = true }, nowMs = Date.now()) {
  const now = nowMs;
  const liveCards = cards.filter((c) => !c.expired && c.outBizNo && c.sourceType);
  const liveCredits = [...platformPools, ...codeCredits].filter(
    (c) => c.balance > 0 && c.expireTimeMs && c.expireTimeMs > now
  );
  const earliestCard = liveCards[0] ?? null;
  const earliestCredit = liveCredits.sort(
    (a, b) => (a.expireTimeMs ?? Infinity) - (b.expireTimeMs ?? Infinity)
  )[0] ?? null;
  const cardExpire = earliestCard?.expireTimeMs ?? null;
  const creditExpire = earliestCredit?.expireTimeMs ?? null;
  const creditName = earliestCredit ? SOURCE_NAME[earliestCredit.source] : "积分";
  let action = "wait";
  let reason = "";
  let usedCard = false;
  const cfg = loadConfig();
  const { quotaLevels } = cfg;
  const level = quota ? quotaLevel(
    quota.fiveHour.usedPercent,
    quota.fiveHour.totalPercent,
    quota.fiveHour.unlimited,
    quotaLevels.tight,
    quotaLevels.low
  ) : "comfortable";
  const resetInMin = minutesToReset(quota?.fiveHour, now);
  const skipMinutes = Number(cfg.cardSkipBeforeResetMinutes ?? DEFAULT_CARD_SKIP_BEFORE_RESET_MINUTES);
  const skipCardReason = skipMinutes > 0 && resetInMin !== null && resetInMin <= skipMinutes ? `5 小时额度 ${resetInMin.toFixed(0)} 分钟后刷新，暂不消耗重置卡` : null;
  if (!quota) {
    reason = "未获取到额度状态";
  } else if (!quota.fiveHour.triggered && !quota.weekly.triggered) {
    action = "idle";
    reason = `${LEVEL_LABEL[level]}（5 小时已用 ${quota.fiveHour.usedPercent.toFixed(0)}%），未到 ${cfg.cardTriggerPercent}% 触发线，暂不动用重置卡`;
  } else if (!creditDataComplete) {
    action = "wait";
    reason = "积分数据读取不完整，本轮不执行写操作（等下一轮重新判定）";
  } else if (!earliestCredit) {
    if (earliestCard) {
      if (skipCardReason) {
        action = "wait";
        reason = skipCardReason;
      } else {
        action = "use-card";
        usedCard = true;
        reason = "没有可用积分，使用重置卡重置额度";
      }
    } else {
      action = "wait";
      reason = "额度已耗尽，既没有积分也没有可用的重置卡";
    }
  } else if (!earliestCard) {
    action = "use-credit";
    reason = `没有可用的重置卡，让${creditName}（${fmtDay(creditExpire)}到期）先消耗`;
  } else if (cardExpire < creditExpire) {
    if (skipCardReason) {
      action = "wait";
      reason = skipCardReason;
    } else {
      action = "use-card";
      usedCard = true;
      reason = `重置卡（${fmtDay(cardExpire)}）比${creditName}（${fmtDay(creditExpire)}）先过期，先用卡保住积分`;
    }
  } else {
    action = "use-credit";
    reason = `${creditName}（${fmtDay(creditExpire)}）比重置卡（${fmtDay(cardExpire)}）先过期，不用卡，让积分先消耗`;
  }
  return {
    action,
    usedCard,
    reason,
    // 等级随判定一起下发：页面据此给徽章上色，不再自己猜。
    level,
    // 距 5 小时额度刷新的倒计时（分钟）。页面直接显示，不用自己算。
    resetInMinutes: resetInMin,
    // 距刷新不足这个分钟数时**不建议用卡** —— 页面要说出来，
    // 否则用户看到「额度快没了却不建议用卡」会以为坏了。
    cardSkipBeforeResetMinutes: skipMinutes,
    skipCardActive: Boolean(skipCardReason),
    target: usedCard && earliestCard ? {
      cardId: earliestCard.cardId,
      sourceType: earliestCard.sourceType,
      outBizNo: earliestCard.outBizNo,
      expireTimeMs: cardExpire
    } : null,
    earliestCardExpireMs: cardExpire,
    earliestCreditExpireMs: creditExpire,
    earliestCreditSource: earliestCredit?.source ?? null,
    earliestCreditLabel: earliestCredit?.label ?? null,
    triggered: Boolean(quota && (quota.fiveHour.triggered || quota.weekly.triggered)),
    exhausted: Boolean(quota && (quota.fiveHour.exhausted || quota.weekly.exhausted))
  };
}
function fmtDay(ms) {
  if (!ms) return "未知";
  const d = new Date(ms);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
export function buildSnapshot(ledger, config, now = Date.now()) {
  currentConfig = normalizeConfig(config).config;
  const triggerPercent = loadConfig().cardTriggerPercent;
  const { platformPools, codeCredits, cards, creditDataComplete } = ledgerInputs(ledger, now);
  const quota = ledgerQuota(ledger?.quota, triggerPercent);
  cards.sort((a, b) => (a.expireTimeMs ?? Infinity) - (b.expireTimeMs ?? Infinity));
  codeCredits.items.sort((a, b) => (a.expireTimeMs ?? Infinity) - (b.expireTimeMs ?? Infinity));
  const decision = decide({
    platformPools,
    codeCredits: codeCredits.items,
    cards,
    quota,
    creditDataComplete
  }, now);
  const soon7 = expiringWithin(codeCredits.items, 7, now);
  const soon30 = expiringWithin(codeCredits.items, 30, now);
  const sumBalance = (list) => list.reduce((s, d) => s + d.balance, 0);
  return {
    fetchedAtMs: now,
    // 数据来自本地账本，没有「接口缓存」这一层 ⇒ 恒为新鲜。
    fresh: {
      quota: true,
      codeCredits: true,
      cards: true,
      platform: true,
      membership: true
    },
    // 账本自带的时间戳：用户最后一次更新账本是什么时候。
    ledgerUpdatedAtMs: Number(ledger?.updatedAtMs ?? 0) || null,
    creditSummary: null,
    platformCredits: {
      total: sumBalance(platformPools),
      used: 0,
      remaining: sumBalance(platformPools),
      fallbackEnabled: false,
      pools: platformPools
    },
    codeCredits: {
      available: creditDataComplete,
      totalCount: codeCredits.totalCount,
      liveBalance: codeCredits.liveBalance,
      lostBalance: codeCredits.lostBalance,
      active: codeCredits.items.filter((d) => !d.expired && d.balance > 0),
      lost: codeCredits.items.filter((d) => d.expired && d.balance > 0),
      usedUp: (() => {
        const zero = codeCredits.items.filter((d) => d.balance <= 0);
        return {
          count: zero.length,
          consumed: zero.reduce((sum, d) => sum + d.consumed, 0),
          expiredCount: zero.filter((d) => d.expired).length
        };
      })()
    },
    expiry: {
      soon7Count: soon7.length,
      soon7Balance: sumBalance(soon7),
      soon30Count: soon30.length,
      soon30Balance: sumBalance(soon30),
      nextExpireMs: codeCredits.items.find((d) => !d.expired && d.balance > 0)?.expireTimeMs ?? null
    },
    quota,
    cards: {
      total: cards.length,
      live: cards.filter((c) => !c.expired && c.outBizNo && c.sourceType).length,
      items: cards.filter((c) => !c.expired).slice(0, 12).map((c, i) => ({ index: i + 1, expireTimeMs: c.expireTimeMs })),
      raw: cards.filter((c) => !c.expired).map((c) => ({
        cardId: c.cardId,
        sourceType: c.sourceType,
        outBizNo: c.outBizNo,
        expireTimeMs: c.expireTimeMs
      }))
    },
    cardUsage: { available: false, usedCount: null, grantedCount: null, lastUsedAtMs: null },
    decision
  };
}
export function decideWithConfig(input, config, now) {
  currentConfig = normalizeConfig(config).config;
  return decide(input, now);
}
