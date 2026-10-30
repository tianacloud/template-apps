/* 云端业务存储 */
(function (global) {
  'use strict';

  var RECORDS_KEY = 'bon_records_v1';
  var REMINDERS_KEY = 'bon_reminders_v1';
  var FLAGS_KEY = 'bon_flags_v1';
  function setRaw(key, value) { return global.BonCloud.set(key, value); }
  function getRaw(key) { return global.BonCloud.get(key); }

  function parseList(raw) {
    if (!raw) return [];
    try {
      var value = JSON.parse(raw);
      return Object.prototype.toString.call(value) === '[object Array]' ? value : [];
    } catch (e) {
      return [];
    }
  }

  function genId() {
    return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
  }

  function loadRecords() {
    return getRaw(RECORDS_KEY).then(parseList);
  }

  function saveRecords(list) {
    return setRaw(RECORDS_KEY, JSON.stringify(list));
  }

  function addRecord(record) {
    return loadRecords().then(function (list) {
      var item = Object.assign({ id: genId(), bought: null, thumb: '' }, record);
      list.unshift(item);
      return global.BonCloud.savePhoto(item.thumb).then(function (path) { item.thumb = path; return saveRecords(list); }).then(function () { return item; });
    });
  }

  function updateRecord(id, patch) {
    return loadRecords().then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i] = Object.assign({}, list[i], patch);
          break;
        }
      }
      return saveRecords(list);
    });
  }

  function removeRecord(id) {
    return loadRecords().then(function (list) {
      var next = list.filter(function (r) { return r.id !== id; });
      return saveRecords(next);
    });
  }

  function loadReminders() {
    return getRaw(REMINDERS_KEY).then(parseList);
  }

  function saveReminders(list) {
    return setRaw(REMINDERS_KEY, JSON.stringify(list));
  }

  function addReminder(reminder) {
    return loadReminders().then(function (list) {
      var item = Object.assign({ id: genId(), status: 'active', seen: false }, reminder);
      list.unshift(item);
      return saveReminders(list).then(function () { return item; });
    });
  }

  function updateReminder(id, patch) {
    return loadReminders().then(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list[i] = Object.assign({}, list[i], patch);
          break;
        }
      }
      return saveReminders(list);
    });
  }

  function removeReminder(id) {
    return loadReminders().then(function (list) {
      return saveReminders(list.filter(function (r) { return r.id !== id; }));
    });
  }

  /* 「下次不显示」的提醒在次日恢复；返回最新列表 */
  function reviveSnoozed() {
    var now = Date.now();
    return loadReminders().then(function (list) {
      var changed = false;
      list.forEach(function (r) {
        if (r.status === 'snoozed' && r.snoozeUntil && r.snoozeUntil <= now) {
          r.status = 'active';
          changed = true;
        }
      });
      if (!changed) return list;
      return saveReminders(list).then(function () { return list; });
    });
  }

  function dueBanners() {
    return reviveSnoozed().then(function (list) {
      var now = Date.now();
      return list.filter(function (r) {
        return r.dueTs <= now && r.status === 'active';
      });
    });
  }

  function unreadCount() {
    return reviveSnoozed().then(function (list) {
      var now = Date.now();
      return list.filter(function (r) {
        return r.dueTs <= now && !r.seen && r.status !== 'dismissed';
      }).length;
    });
  }

  function loadFlags() {
    return getRaw(FLAGS_KEY).then(function (raw) {
      if (!raw) return {};
      try {
        var value = JSON.parse(raw);
        return value && typeof value === 'object' ? value : {};
      } catch (e) {
        return {};
      }
    });
  }

  function getFlag(name) {
    return loadFlags().then(function (flags) { return !!flags[name]; });
  }

  function setFlag(name) {
    return loadFlags().then(function (flags) {
      flags[name] = true;
      return setRaw(FLAGS_KEY, JSON.stringify(flags));
    });
  }

  function nextDayStart() {
    var d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }

  global.BonStore = {
    loadRecords: loadRecords,
    addRecord: addRecord,
    updateRecord: updateRecord,
    removeRecord: removeRecord,
    loadReminders: loadReminders,
    addReminder: addReminder,
    updateReminder: updateReminder,
    removeReminder: removeReminder,
    reviveSnoozed: reviveSnoozed,
    dueBanners: dueBanners,
    unreadCount: unreadCount,
    getFlag: getFlag,
    setFlag: setFlag,
    nextDayStart: nextDayStart,
  };
})(window);
