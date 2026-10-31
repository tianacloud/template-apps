/**
 * 被动收入小账本 · 数据层
 * 使用注入的存储适配器。
 */

var calc = (typeof window !== 'undefined') ? window.PILCalc : require('./calc.js');

var KEY_ASSETS = 'pil_assets_v1';
var KEY_SETTINGS = 'pil_settings_v1';

var DEFAULT_SETTINGS = {
  decimals: 2,        // 收益小数位
  notify: true,       // 到期提醒总开关
  goalDaily: 0        // 每日被动收入目标（可选）
};

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function createStore(storage) {
  var st = storage || { get: function () { return null; }, set: function () {} };

  function readRaw(key, fallback) {
    var v;
    try {
      v = st.get(key);
    } catch (e) {
      v = null;
    }
    if (v === '' || v === null || v === undefined) return fallback;
    if (typeof v === 'string') {
      try {
        v = JSON.parse(v);
      } catch (e2) {
        return fallback;
      }
    }
    return v === null || v === undefined ? fallback : v;
  }

  function writeRaw(key, value) {
    try {
      st.set(key, value);
    } catch (e) { /* 存储写满等异常不阻断 UI */ }
  }

  /* ---------------- 资产 ---------------- */

  function listAssets() {
    var arr = readRaw(KEY_ASSETS, []);
    if (!Array.isArray(arr)) arr = [];
    // 过滤脏数据，避免一条坏记录让整个列表崩掉
    return arr.filter(function (a) {
      return a && a.id && a.startDate && calc.isDateKey(a.startDate);
    });
  }

  function saveAssets(list) {
    writeRaw(KEY_ASSETS, list || []);
    return list || [];
  }

  function getAsset(id) {
    var list = listAssets();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function addAsset(draft) {
    var asset = calc.buildAsset(draft);
    var list = listAssets();
    list.push(asset);
    saveAssets(list);
    return asset;
  }

  /**
   * 编辑资产。
   * 本金 / 利率发生变化时，按“次日生效”追加一个计息分段（历史收益不被篡改）。
   */
  function updateAsset(id, patch, options) {
    var list = listAssets();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { idx = i; break; }
    }
    if (idx < 0) return null;

    var cur = list[idx];
    var today = (options && options.today) || calc.todayKey();
    var effFrom = (options && options.effectiveFrom) || calc.addDays(today, 1);
    var eff = calc.effective(cur, today);

    var next = clone(cur);
    var keys = ['type', 'name', 'note', 'startDate', 'endDate', 'remind'];
    for (var k = 0; k < keys.length; k++) {
      if (patch[keys[k]] !== undefined) next[keys[k]] = patch[keys[k]];
    }
    if (next.name) next.name = String(next.name).trim();
    if (next.startDate) next.startDate = String(next.startDate).slice(0, 10);
    next.endDate = next.endDate ? String(next.endDate).slice(0, 10) : '';
    next.remind = next.remind !== false;

    var newPrincipal = patch.principal !== undefined ? Number(patch.principal) : eff.principal;
    var newRate = patch.rate !== undefined ? Number(patch.rate) : eff.rate;
    if (!isFinite(newPrincipal)) newPrincipal = eff.principal;
    if (!isFinite(newRate)) newRate = eff.rate;

    var changed = (newPrincipal !== eff.principal) || (newRate !== eff.rate);
    var segs = calc.segmentsOf(cur).map(function (s) {
      return { from: s.from, principal: s.principal, rate: s.rate };
    });

    if (!segs.length) {
      segs = [{ from: next.startDate, principal: newPrincipal, rate: newRate }];
    } else if (changed) {
      if (effFrom <= segs[0].from) {
        // 起息日在未来 / 变更日期早于首段，直接改首段
        segs[0] = { from: segs[0].from, principal: newPrincipal, rate: newRate };
      } else {
        var kept = segs.filter(function (s) { return s.from !== effFrom; });
        kept.push({ from: effFrom, principal: newPrincipal, rate: newRate });
        kept.sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
        segs = kept;
      }
    }

    // 用户把起息日往前改：把首段起点一起对齐，避免出现“无分段覆盖”的空档
    if (next.startDate && segs.length && segs[0].from !== next.startDate && segs[0].from > next.startDate) {
      segs[0] = { from: next.startDate, principal: segs[0].principal, rate: segs[0].rate };
    }

    next.segments = segs;
    var last = segs[segs.length - 1];
    next.principal = last.principal;
    next.rate = last.rate;
    next.updatedAt = Date.now();

    list[idx] = next;
    saveAssets(list);
    return next;
  }

  /** 删除资产（返回是否真的删掉了） */
  function removeAsset(id) {
    if (!id) return false;
    var list = listAssets();
    var next = list.filter(function (a) { return a.id !== id; });
    if (next.length === list.length) return false;
    saveAssets(next);
    return true;
  }

  function removeAllAssets() {
    saveAssets([]);
    return true;
  }

  /** 快速调整本金（转入 / 转出），次日生效 */
  function setPrincipal(id, principal, options) {
    return updateAsset(id, { principal: Number(principal) }, options);
  }

  /** 快速调整利率，次日生效 */
  function setRate(id, rate, options) {
    return updateAsset(id, { rate: Number(rate) }, options);
  }

  function toggleRemind(id, remind) {
    var list = listAssets();
    var out = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        list[i].remind = remind !== false;
        out = list[i];
        break;
      }
    }
    if (out) saveAssets(list);
    return out;
  }

  function searchAssets(keyword) {
    var q = String(keyword || '').trim().toLowerCase();
    var list = listAssets();
    if (!q) return list;
    return list.filter(function (a) {
      return String(a.name || '').toLowerCase().indexOf(q) >= 0
        || String(a.note || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  /* ---------------- 设置 ---------------- */

  function getSettings() {
    var s = readRaw(KEY_SETTINGS, {}) || {};
    var out = clone(DEFAULT_SETTINGS);
    if (s && typeof s === 'object') {
      if (typeof s.decimals === 'number') out.decimals = Math.min(4, Math.max(0, Math.round(s.decimals)));
      if (typeof s.notify === 'boolean') out.notify = s.notify;
      if (typeof s.goalDaily === 'number' && s.goalDaily >= 0) out.goalDaily = s.goalDaily;
    }
    return out;
  }

  function saveSettings(patch) {
    var cur = getSettings();
    var next = clone(cur);
    if (patch && typeof patch === 'object') {
      for (var k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) next[k] = patch[k];
      }
    }
    next.decimals = Math.min(4, Math.max(0, Math.round(Number(next.decimals) || 0)));
    next.goalDaily = Math.max(0, Number(next.goalDaily) || 0);
    next.notify = next.notify !== false;
    writeRaw(KEY_SETTINGS, next);
    return next;
  }

  /* ---------------- 备份 / 恢复 ---------------- */

  function exportBackup() {
    return {
      app: '被动收入小账本',
      version: 1,
      exportedAt: new Date().toISOString(),
      assets: listAssets(),
      settings: getSettings()
    };
  }

  /**
   * 导入备份。接受对象或 JSON 字符串。
   * mode: 'replace' 覆盖 | 'merge' 合并（按 id 去重）
   */
  function importBackup(payload, mode) {
    var data = payload;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return { ok: false, error: '备份内容不是合法的 JSON' };
      }
    }
    if (!data || typeof data !== 'object') return { ok: false, error: '备份内容为空' };
    var incoming = Array.isArray(data.assets) ? data.assets : (Array.isArray(data) ? data : null);
    if (!incoming) return { ok: false, error: '备份里没有找到资产数据' };

    var cleaned = incoming.filter(function (a) {
      return a && a.id && a.startDate && calc.isDateKey(a.startDate);
    }).map(function (a) {
      var segs = calc.segmentsOf(a);
      var last = segs.length ? segs[segs.length - 1] : { principal: 0, rate: 0 };
      return {
        id: String(a.id),
        type: a.type || 'custom',
        name: String(a.name || '未命名资产').slice(0, 30),
        note: String(a.note || ''),
        startDate: String(a.startDate).slice(0, 10),
        endDate: a.endDate ? String(a.endDate).slice(0, 10) : '',
        remind: a.remind !== false,
        principal: Number(a.principal) || last.principal,
        rate: Number(a.rate) || last.rate,
        segments: segs,
        createdAt: a.createdAt || Date.now(),
        updatedAt: a.updatedAt || Date.now()
      };
    });

    if (mode === 'merge') {
      var map = {};
      var base = listAssets();
      for (var i = 0; i < base.length; i++) map[base[i].id] = base[i];
      for (var j = 0; j < cleaned.length; j++) map[cleaned[j].id] = cleaned[j];
      var merged = [];
      for (var key in map) {
        if (Object.prototype.hasOwnProperty.call(map, key)) merged.push(map[key]);
      }
      saveAssets(merged);
    } else {
      saveAssets(cleaned);
    }

    if (data.settings && typeof data.settings === 'object') {
      saveSettings(data.settings);
    }
    return { ok: true, count: cleaned.length, total: listAssets().length, mode: mode === 'merge' ? 'merge' : 'replace' };
  }

  return {
    KEY_ASSETS: KEY_ASSETS,
    KEY_SETTINGS: KEY_SETTINGS,
    listAssets: listAssets,
    getAsset: getAsset,
    addAsset: addAsset,
    updateAsset: updateAsset,
    removeAsset: removeAsset,
    removeAllAssets: removeAllAssets,
    setPrincipal: setPrincipal,
    setRate: setRate,
    toggleRemind: toggleRemind,
    searchAssets: searchAssets,
    getSettings: getSettings,
    saveSettings: saveSettings,
    exportBackup: exportBackup,
    importBackup: importBackup,
    saveAssets: saveAssets
  };
}

var api = { createStore: createStore, DEFAULT_SETTINGS: DEFAULT_SETTINGS };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
if (typeof window !== 'undefined') {
  window.PILStore = api;
}
