
/* 文书档案工作台 · 数据层
 * 存储：应用数据库（记录）与应用文件目录（照片）
 * 核心约束：boxId 一经生成永不变更
 */
(function (global) {
  'use strict';

  var VERSION = '1.5';
  /* ---------- 默认状态：在匣 / 借出 / 移动 ---------- */
  var DEFAULT_STATUSES = [
    { name: '在匣', fg: '#374151', bg: '#F3F4F6', builtin: true, enabled: true, desc: '在匣存放，可随时查找', order: 0 },
    { name: '借出', fg: '#B45309', bg: '#FEF3C7', builtin: true, enabled: true, desc: '已被借出，尚未归还', order: 1 },
    { name: '移动', fg: '#1D4ED8', bg: '#DBEAFE', builtin: true, enabled: true, desc: '正在流转或移交途中', order: 2 }
  ];

  /* ---------- 密级 ---------- */
  /* 四级：明文 / 内部 / 秘密 / 机密。颜色由浅到深，一眼能分辨。 */
  var SECRET_LEVELS = [
    { name: '明文', fg: '#4B5563', bg: '#F3F4F6', order: 0, desc: '可公开、无特殊要求' },
    { name: '内部', fg: '#1D4ED8', bg: '#DBEAFE', order: 1, desc: '限本单位内部使用' },
    { name: '秘密', fg: '#B45309', bg: '#FEF3C7', order: 2, desc: '限一定范围人员知悉' },
    { name: '机密', fg: '#B91C1C', bg: '#FEE2E2', order: 3, desc: '限特定人员知悉' }
  ];

  function secretMeta(name) {
    for (var i = 0; i < SECRET_LEVELS.length; i++) {
      if (SECRET_LEVELS[i].name === name) return SECRET_LEVELS[i];
    }
    return SECRET_LEVELS[0];   // 未设置一律按「明文」显示
  }

  function secretLevels() { return clone(SECRET_LEVELS); }

  /* 状态：老的「常规/借阅/借出未还/已归还」映射到新的三种 */
  var STATUS_ALIAS = {
    '常规': '在匣', '借阅': '借出', '借出未还': '借出', '已归还': '在匣'
  };

  function normalizeStatusName(n) {
    return STATUS_ALIAS[n] || n || '在匣';
  }

  function secretOrder(n) {
    return secretMeta(n).order;
  }

  var COLORS = ['#2563EB', '#D97706', '#6D28D9', '#047857', '#BE185D', '#0F766E', '#B91C1C', '#4B5563'];

  /* ---------- 匣 ID 生成：HJ-XXXX-XX ---------- */
  var ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混淆的 I O 0 1

  function genBoxId() {
    var s = '';
    for (var i = 0; i < 4; i++) s += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
    var n = String(Math.floor(Math.random() * 90) + 10);
    return 'HJ-' + s + '-' + n;
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- 日志：记录匣与资料的每一次变动 ---------- */
  var LOG_MAX = 500;          // 最多保留条数，超出从最旧的开始丢
  var LOG_LABEL = {
    'box.add': '新建匣', 'box.rename': '匣改名', 'box.update': '修改匣信息',
    'box.delete': '删除匣', 'box.restore': '恢复匣', 'box.regen': '重生成匣 ID',
    'doc.add': '新增资料', 'doc.edit': '修改资料', 'doc.status': '状态变更',
    'doc.secret': '密级变更', 'doc.move': '资料移动', 'doc.delete': '删除资料',
    'import': '导入清单', 'status.add': '新建状态', 'status.edit': '修改状态',
    'status.del': '删除状态'
  };

  function addLog(type, text, extra) {
    try {
      var rec = {
        id: uid(),
        at: Date.now(),
        type: type,
        kind: (type || '').split('.')[0] || 'doc',
        label: LOG_LABEL[type] || '变动',
        text: text || ''
      };
      if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) rec[k] = extra[k];
      state.log.unshift(rec);
      if (state.log.length > LOG_MAX) state.log.length = LOG_MAX;
    } catch (e) { /* 日志失败不能影响主流程 */ }
    return rec;
  }

  /* 日志搜索：标题、正文、匣名都匹配 */
  function searchLog(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return state.log.slice();
    return state.log.filter(function (r) {
      return (r.text || '').toLowerCase().indexOf(q) >= 0 ||
        (r.boxName || '').toLowerCase().indexOf(q) >= 0 ||
        (r.label || '').toLowerCase().indexOf(q) >= 0;
    });
  }

  function clearLog() {
    state.log = [];
    return save();
  }

  /* ---------- 内存状态 ---------- */
  var state = {
    boxes: [],      // [{id,name,color,location,note,createdAt,updatedAt}]
    docs: [],       // [{id,boxId,title,docNo,attachments,status,statusNote,secret,addedAt,source,photos:[]}]
    statuses: [],   // [{name,fg,bg,builtin,enabled,desc,order}]
    trash: [],      // 回收站
    log: []         // 日志：资料/匣的每一次变动
  };

  var backend = 'cloud';

  function applySnapshot(d) {
    if (!d || (!d.boxes && !d.docs)) return false;
    state.boxes = d.boxes || [];
    state.docs = d.docs || [];
    state.statuses = (d.statuses && d.statuses.length) ? d.statuses : clone(DEFAULT_STATUSES);
    state.trash = d.trash || [];
    state.log = d.log || [];
    migrate();
    return true;
  }

  /* 老版本存下来的数据没有「密级」字段，状态名也是旧的四个。
     这里做一次就地升级，保证老用户升级后看到的仍然正常。 */
  function migrate() {
    // 1) 状态名归一化 + 旧内置状态换成新的三个
    var oldBuiltin = { '常规': 1, '借阅': 1, '借出未还': 1, '已归还': 1 };
    var custom = state.statuses.filter(function (s) {
      return !(oldBuiltin[s.name] && s.builtin !== false);
    });
    var names = {};
    var merged = DEFAULT_STATUSES.map(function (s) { return clone(s); });
    merged.forEach(function (s) { names[s.name] = 1; });
    custom.forEach(function (s) {
      if (!names[s.name]) { names[s.name] = 1; merged.push(s); }
    });
    merged.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    state.statuses = merged;
    state.statuses.forEach(function (s, i) { s.order = i; });

    // 2) 资料：状态名映射 + 补上密级 / 文号 / 附件字段
    state.docs.forEach(function (d) {
      d.status = normalizeStatusName(d.status);
      if (!getStatusNameLocal(d.status)) d.status = '在匣';
      if (!d.secret) d.secret = '明文';
      d.secret = secretMeta(d.secret).name;
      if (d.docNo === undefined) d.docNo = '';
      if (!Array.isArray(d.attachments)) d.attachments = [];
    });

    // 3) 回收站里的资料同样处理
    (state.trash || []).forEach(function (t) {
      (t.docs || []).forEach(function (d) {
        d.status = normalizeStatusName(d.status);
        if (!d.secret) d.secret = '明文';
        d.secret = secretMeta(d.secret).name;
      });
    });
  }

  function getStatusNameLocal(n) {
    for (var i = 0; i < state.statuses.length; i++) {
      if (state.statuses[i].name === n) return state.statuses[i];
    }
    return null;
  }

  function load() {
    if (!applySnapshot(global.archiveCloud.initial)) state.statuses = clone(DEFAULT_STATUSES);
    return Promise.resolve(state);
  }
  function snapshot() { return {boxes:state.boxes,docs:state.docs,statuses:state.statuses,trash:state.trash,log:state.log}; }
  function save() { return global.archiveCloud.save(snapshot()).catch(function(e) { if(global.U) global.U.toast(e.message, 8000); throw e; }); }
  function flush() { return Promise.resolve(true); }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------- 匣 ---------- */
  function addBox(data) {
    var box = {
      id: genBoxId(),
      name: (data.name || '').trim() || '未命名匣',
      color: data.color || COLORS[0],
      location: (data.location || '').trim(),
      note: (data.note || '').trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    // 极小概率碰撞，重试
    var guard = 0;
    while (getBox(box.id) && guard++ < 10) box.id = genBoxId();
    state.boxes.unshift(box);
    addLog('box.add', '新建匣「' + box.name + '」，ID ' + box.id, { boxId: box.id, boxName: box.name });
    return save().then(function () { return box; });
  }

  function getBox(id) {
    for (var i = 0; i < state.boxes.length; i++) if (state.boxes[i].id === id) return state.boxes[i];
    return null;
  }

  function updateBox(id, patch) {
    var b = getBox(id);
    if (!b) return Promise.resolve(null);
    var before = { name: b.name, location: b.location || '', note: b.note || '', color: b.color };
    for (var k in patch) if (patch.hasOwnProperty(k)) b[k] = patch[k];
    b.updatedAt = Date.now();

    // 只记有实质变化的字段，色标变化不进日志（太碎）
    if (patch.name && patch.name !== before.name) {
      addLog('box.rename', '匣「' + before.name + '」改名为「' + patch.name + '」，ID ' + b.id + ' 不变',
        { boxId: b.id, boxName: patch.name });
    } else if ((patch.location !== undefined && patch.location !== before.location) ||
      (patch.note !== undefined && patch.note !== before.note)) {
      addLog('box.update', '修改匣「' + b.name + '」的基础信息', { boxId: b.id, boxName: b.name });
    }
    return save().then(function () { return b; });
  }

  function deleteBox(id) {
    var b = getBox(id);
    if (!b) return Promise.resolve();
    var docs = state.docs.filter(function (d) { return d.boxId === id; });
    state.trash.push({ box: b, docs: docs, deletedAt: Date.now() });
    if (state.trash.length > 5) state.trash.shift();
    state.boxes = state.boxes.filter(function (x) { return x.id !== id; });
    state.docs = state.docs.filter(function (d) { return d.boxId !== id; });
    addLog('box.delete', '删除匣「' + b.name + '」，' + docs.length + ' 份资料已移入回收站',
      { boxId: id, boxName: b.name });
    return save();
  }

  /* 重新生成 ID（会同时迁移其下所有资料） */
  function regenBoxId(id) {
    var b = getBox(id);
    if (!b) return Promise.resolve(null);
    var old = b.id, nid = genBoxId(), guard = 0;
    while (getBox(nid) && guard++ < 10) nid = genBoxId();
    b.id = nid;
    b.updatedAt = Date.now();
    state.docs.forEach(function (d) { if (d.boxId === old) d.boxId = nid; });
    addLog('box.regen', '匣「' + b.name + '」重生成 ID：' + old + ' → ' + nid + '，需重印贴纸',
      { boxId: nid, boxName: b.name });
    return save().then(function () { return nid; });
  }

  /* ---------- 资料 ---------- */
  function addDoc(data) {
    var doc = {
      id: uid(),
      boxId: data.boxId,
      title: (data.title || '').trim(),
      docNo: (data.docNo || '').trim(),
      attachments: Array.isArray(data.attachments) ? data.attachments.slice() : [],
      status: normalizeStatusName(data.status),
      statusNote: (data.statusNote || '').trim(),
      secret: secretMeta(data.secret).name,
      addedAt: Date.now(),
      source: data.source || 'manual',
      photos: data.photos || []
    };
    state.docs.unshift(doc);
    touchBox(doc.boxId);
    addLog('doc.add', '「' + doc.title + '」→ 匣「' + boxName(doc.boxId) + '」（' +
      doc.status + ' · ' + secretMeta(doc.secret).name + '）',
      { boxId: doc.boxId, boxName: boxName(doc.boxId), docId: doc.id });
    return save().then(function () { return doc; });
  }

  function boxName(id) {
    var b = getBox(id);
    return b ? b.name : '未知匣';
  }

  function getDoc(id) {
    for (var i = 0; i < state.docs.length; i++) if (state.docs[i].id === id) return state.docs[i];
    return null;
  }

  function updateDoc(id, patch) {
    var d = getDoc(id);
    if (!d) return Promise.resolve(null);
    var oldBox = d.boxId;
    var before = {
      title: d.title, status: normalizeStatusName(d.status),
      secret: secretMeta(d.secret).name, docNo: d.docNo || '',
      statusNote: d.statusNote || '',
      attachments: (d.attachments || []).slice()
    };
    for (var k in patch) if (patch.hasOwnProperty(k)) d[k] = patch[k];
    if (patch.status) d.status = normalizeStatusName(patch.status);
    if (patch.secret) d.secret = secretMeta(patch.secret).name;
    if (patch.docNo !== undefined) d.docNo = String(patch.docNo || '').trim();
    if (patch.attachments !== undefined) d.attachments = Array.isArray(patch.attachments) ? patch.attachments.slice() : [];
    touchBox(oldBox);
    if (d.boxId !== oldBox) touchBox(d.boxId);

    var after = {
      title: d.title, status: normalizeStatusName(d.status),
      secret: secretMeta(d.secret).name, docNo: d.docNo || '',
      statusNote: d.statusNote || '',
      attachments: (d.attachments || []).slice()
    };
    logDocDiff(d, before, after, oldBox);
    return save().then(function () { return d; });
  }

  /* 把一次编辑拆成几条可读的日志，改了什么就记什么 */
  function logDocDiff(d, a, b, oldBox) {
    var base = { boxId: d.boxId, boxName: boxName(d.boxId), docId: d.id };
    var title = '「' + b.title + '」';

    if (a.status !== b.status) {
      addLog('doc.status', title + ' 状态 ' + a.status + ' → ' + b.status +
        (b.statusNote ? '（' + b.statusNote + '）' : ''), base);
    }
    if (a.secret !== b.secret) {
      addLog('doc.secret', title + ' 密级 ' + a.secret + ' → ' + b.secret, base);
    }
    if (oldBox !== d.boxId) {
      addLog('doc.move', title + ' 从匣「' + boxName(oldBox) + '」移到「' + boxName(d.boxId) + '」', base);
    }
    if (a.title !== b.title) {
      addLog('doc.edit', '资料改名：' + (a.title ? '「' + a.title + '」' : '（无标题）') + ' → ' + title, base);
    }
    if (a.docNo !== b.docNo) {
      addLog('doc.edit', title + ' 文号 ' + (a.docNo || '（空）') + ' → ' + (b.docNo || '（空）'), base);
    }
    if (a.statusNote !== b.statusNote) {
      addLog('doc.edit', title + ' 备注改为「' + (b.statusNote || '（空）') + '」', base);
    }
    if (a.attachments.join('|') !== b.attachments.join('|')) {
      var add = b.attachments.filter(function (x) { return a.attachments.indexOf(x) < 0; });
      var del = a.attachments.filter(function (x) { return b.attachments.indexOf(x) < 0; });
      if (add.length) addLog('doc.edit', title + ' 新增附件：' + add.join('、'), base);
      if (del.length) addLog('doc.edit', title + ' 移除附件：' + del.join('、'), base);
    }
    // 上面都没命中，说明是其它字段微调，给一条笼统记录
    if (a.status === b.status && a.secret === b.secret && oldBox === d.boxId &&
      a.title === b.title && a.docNo === b.docNo && a.statusNote === b.statusNote &&
      a.attachments.join('|') === b.attachments.join('|')) {
      addLog('doc.edit', title + ' 已保存修改', base);
    }
  }

  /* 把一份资料移到另一个匣：匣 ID 与二维码都不受影响 */
  function moveDoc(id, toBoxId) {
    var d = getDoc(id);
    if (!d || !getBox(toBoxId)) return Promise.resolve(null);
    var from = d.boxId;
    if (from === toBoxId) return Promise.resolve(d);
    d.boxId = toBoxId;
    touchBox(from);
    touchBox(toBoxId);
    addLog('doc.move', '「' + d.title + '」从匣「' + boxName(from) + '」移到「' + boxName(toBoxId) + '」',
      { boxId: toBoxId, boxName: boxName(toBoxId), docId: d.id });
    return save().then(function () { return d; });
  }

  function deleteDoc(id) {
    var d = getDoc(id);
    if (d) touchBox(d.boxId);
    state.docs = state.docs.filter(function (x) { return x.id !== id; });
    if (d) {
      addLog('doc.delete', '删除资料「' + d.title + '」（原在匣「' + boxName(d.boxId) + '」）',
        { boxName: boxName(d.boxId) });
    }
    return save();
  }

  function docsOf(boxId) {
    return state.docs.filter(function (d) { return d.boxId === boxId; });
  }

  function touchBox(boxId) {
    var b = getBox(boxId);
    if (b) b.updatedAt = Date.now();
  }

  /* ---------- 状态 ---------- */
  function enabledStatuses() {
    return state.statuses.filter(function (s) { return s.enabled !== false; })
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  function getStatus(name) {
    for (var i = 0; i < state.statuses.length; i++) if (state.statuses[i].name === name) return state.statuses[i];
    return null;
  }

  function addStatus(s) {
    s.order = state.statuses.length;
    s.builtin = false;
    s.enabled = true;
    state.statuses.push(s);
    return save();
  }

  function updateStatus(name, patch) {
    var s = getStatus(name);
    if (!s) return Promise.resolve();
    var oldName = s.name;
    for (var k in patch) if (patch.hasOwnProperty(k)) s[k] = patch[k];
    // 改名要同步所有资料
    if (patch.name && patch.name !== oldName) {
      state.docs.forEach(function (d) { if (d.status === oldName) d.status = patch.name; });
    }
    return save();
  }

  function deleteStatus(name) {
    var s = getStatus(name);
    if (!s) return Promise.resolve();
    var inUse = state.docs.filter(function (d) { return d.status === name; }).length;
    if (inUse > 0) {
      state.docs.forEach(function (d) { if (d.status === name) d.status = '在匣'; });
    }
    state.statuses = state.statuses.filter(function (x) { return x.name !== name; });
    return save().then(function () { return inUse; });
  }

  /* ---------- 统计 ---------- */
  function boxStats(boxId) {
    var ds = docsOf(boxId);
    var st = { total: ds.length, byStatus: {}, bySecret: {}, topSecret: null, topSecretOrder: -1 };
    ds.forEach(function (d) {
      var s = normalizeStatusName(d.status);
      st.byStatus[s] = (st.byStatus[s] || 0) + 1;
      var sec = secretMeta(d.secret).name;
      st.bySecret[sec] = (st.bySecret[sec] || 0) + 1;
      var o = secretMeta(sec).order;
      if (o > st.topSecretOrder) { st.topSecretOrder = o; st.topSecret = sec; }
    });
    return st;
  }

  /* ---------- 管理页：全库按密级 / 按状态分组 ---------- */
  function groupBySecret() {
    var groups = SECRET_LEVELS.map(function (lv) {
      return { name: lv.name, fg: lv.fg, bg: lv.bg, order: lv.order, desc: lv.desc, total: 0, docs: [] };
    });
    var idx = {};
    groups.forEach(function (g) { idx[g.name] = g; });
    state.docs.forEach(function (d) {
      var g = idx[secretMeta(d.secret).name] || groups[0];
      g.total++;
      g.docs.push({ doc: d, box: getBox(d.boxId) });
    });
    // 组内按匣名再按标题排，方便核账
    groups.forEach(function (g) {
      g.docs.sort(function (a, b) {
        var an = a.box ? a.box.name : '', bn = b.box ? b.box.name : '';
        if (an !== bn) return an.localeCompare(bn, 'zh');
        return (b.doc.addedAt || 0) - (a.doc.addedAt || 0);
      });
    });
    return groups;
  }

  function groupByStatus() {
    var order = enabledStatuses();
    var groups = order.map(function (st) {
      return { name: st.name, fg: st.fg, bg: st.bg, desc: st.desc || '', total: 0, docs: [] };
    });
    var idx = {};
    groups.forEach(function (g) { idx[g.name] = g; });
    var other = null;
    state.docs.forEach(function (d) {
      var n = normalizeStatusName(d.status);
      var g = idx[n];
      if (!g) {
        // 用了已停用/已删除状态的资料，单独归到「其他」
        if (!other) other = { name: '其他', fg: '#4B5563', bg: '#F3F4F6', desc: '状态已停用或已删除', total: 0, docs: [] };
        g = other;
      }
      g.total++;
      g.docs.push({ doc: d, box: getBox(d.boxId) });
    });
    if (other) groups.push(other);
    groups.forEach(function (g) {
      g.docs.sort(function (a, b) {
        var an = a.box ? a.box.name : '', bn = b.box ? b.box.name : '';
        if (an !== bn) return an.localeCompare(bn, 'zh');
        return (b.doc.addedAt || 0) - (a.doc.addedAt || 0);
      });
    });
    return groups;
  }

  /* ---------- 搜索（模糊：匣名 + 资料名） ---------- */
  function search(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return { boxes: [], docs: [] };
    var hitBoxes = [], hitDocs = [];
    state.boxes.forEach(function (b) {
      var inName = b.name.toLowerCase().indexOf(q) >= 0;
      var inLoc = (b.location || '').toLowerCase().indexOf(q) >= 0;
      var ds = docsOf(b.id).filter(function (d) { return d.title.toLowerCase().indexOf(q) >= 0; });
      if (inName || inLoc || ds.length) {
        hitBoxes.push({ box: b, docs: ds.length, inName: inName });
      }
    });
    state.docs.forEach(function (d) {
      if (d.title.toLowerCase().indexOf(q) >= 0) {
        hitDocs.push({ doc: d, box: getBox(d.boxId) });
      }
    });
    return { boxes: hitBoxes, docs: hitDocs };
  }

  /* ---------- 导出 ---------- */
  function buildExport(scope, opts) {
    opts = opts || {};
    var boxes = scope === 'all' ? state.boxes : state.boxes.filter(function (b) { return b.id === scope; });
    var out = {
      app: '文书档案工作台',
      version: 1,
      exportedAt: new Date().toISOString(),
      boxes: []
    };
    boxes.forEach(function (b) {
      var o = {
        boxId: b.id, boxName: b.name, color: b.color,
        location: b.location || '', note: b.note || '',
        createdAt: opts.includeTime ? new Date(b.createdAt).toISOString() : undefined,
        docs: []
      };
      docsOf(b.id).forEach(function (d) {
        o.docs.push({
          title: d.title,
          docNo: d.docNo || '',
          attachments: (d.attachments || []).slice(),
          status: normalizeStatusName(d.status),
          secret: secretMeta(d.secret).name,
          statusNote: d.statusNote || '',
          addedAt: opts.includeTime ? new Date(d.addedAt).toISOString() : undefined,
          source: d.source || 'manual',
          photos: opts.includePhotos ? (d.photos || []) : []
        });
      });
      out.boxes.push(o);
    });
    // 一并带上自定义状态，换机后状态配色不丢
    out.statuses = state.statuses.filter(function (s) { return !s.builtin; });
    return out;
  }

  function toCSV(data) {
    var rows = [['匣ID', '匣名称', '存放位置', '资料标题', '文号', '状态', '密级', '状态备注', '附件', '录入时间']];
    data.boxes.forEach(function (b) {
      if (!b.docs.length) {
        rows.push([b.boxId, b.boxName, b.location, '', '', '', '', '', '', '']);
      }
      b.docs.forEach(function (d) {
        rows.push([b.boxId, b.boxName, b.location, d.title,
          d.docNo || '', normalizeStatusName(d.status), secretMeta(d.secret).name,
          d.statusNote || '', (d.attachments || []).join('；'),
          d.addedAt ? d.addedAt.slice(0, 10) : '']);
      });
    });
    return '\ufeff' + rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
  }

  /* ---------- 导入合并 ----------
   * 去重键 = 匣ID + 资料标题
   * 三种策略：merge（默认）/ replace / newbox
   */
  function previewImport(data) {
    var items = [];
    (data.boxes || []).forEach(function (b) {
      var exist = getBox(b.boxId);
      var docs = b.docs || [];
      var added = 0, dup = 0;
      if (exist) {
        var titles = {};
        docsOf(exist.id).forEach(function (d) { titles[d.title] = 1; });
        docs.forEach(function (d) {
          if (titles[d.title]) dup++; else added++;
        });
      } else added = docs.length;
      items.push({
        boxId: b.boxId, boxName: b.boxName, exist: !!exist,
        docs: docs.length, added: added, dup: dup,
        hasStatus: docs.some(function (d) { return d.status && normalizeStatusName(d.status) !== '在匣'; })
      });
    });
    return items;
  }

  function doImport(data, strategy) {
    strategy = strategy || 'merge';
    var addedBoxes = 0, addedDocs = 0, skipped = 0;

    // 先合并自定义状态
    (data.statuses || []).forEach(function (s) {
      if (!getStatus(s.name)) {
        s.builtin = false; s.enabled = true;
        s.order = state.statuses.length;
        state.statuses.push(s);
      }
    });

    (data.boxes || []).forEach(function (b) {
      var exist = getBox(b.boxId);
      var targetId;

      if (strategy === 'newbox' || (strategy === 'replace' && false)) {
        var nb = {
          id: genBoxId(), name: b.boxName, color: b.color || COLORS[0],
          location: b.location || '', note: b.note || '',
          createdAt: b.createdAt ? Date.parse(b.createdAt) : Date.now(),
          updatedAt: Date.now()
        };
        var g = 0; while (getBox(nb.id) && g++ < 10) nb.id = genBoxId();
        state.boxes.unshift(nb);
        targetId = nb.id;
        addedBoxes++;
      } else if (exist) {
        targetId = exist.id;
        if (strategy === 'replace') {
          // 覆盖：清掉本机该匣资料
          state.docs = state.docs.filter(function (d) { return d.boxId !== targetId; });
          exist.name = b.boxName;
          exist.color = b.color || exist.color;
          exist.location = b.location || '';
          exist.note = b.note || '';
          exist.updatedAt = Date.now();
        }
      } else {
        var nb2 = {
          id: b.boxId, name: b.boxName, color: b.color || COLORS[0],
          location: b.location || '', note: b.note || '',
          createdAt: b.createdAt ? Date.parse(b.createdAt) : Date.now(),
          updatedAt: Date.now()
        };
        state.boxes.unshift(nb2);
        targetId = nb2.id;
        addedBoxes++;
      }

      var titles = {};
      if (strategy === 'merge') {
        docsOf(targetId).forEach(function (d) { titles[d.title] = 1; });
      }
      (b.docs || []).forEach(function (d) {
        if (strategy === 'merge' && titles[d.title]) { skipped++; return; }
        state.docs.unshift({
          id: uid(),
          boxId: targetId,
          title: d.title,
          docNo: (d.docNo || '').trim(),
          attachments: Array.isArray(d.attachments) ? d.attachments.slice() : splitAttach(d.attachments),
          status: normalizeStatusName(d.status),
          secret: secretMeta(d.secret).name,
          statusNote: d.statusNote || '',
          addedAt: d.addedAt ? Date.parse(d.addedAt) : Date.now(),
          source: d.source || 'manual',
          photos: d.photos || []
        });
        addedDocs++;
      });
    });

    addLog('import', '导入清单：新增 ' + addedDocs + ' 份资料' +
      (addedBoxes ? '、' + addedBoxes + ' 个匣' : '') +
      (skipped ? '，跳过 ' + skipped + ' 份重复' : ''));

    return save().then(function () {
      return { addedBoxes: addedBoxes, addedDocs: addedDocs, skipped: skipped };
    });
  }

  /* 附件：Excel 里多个用 ；;、, 分隔都认 */
  function splitAttach(v) {
    if (Array.isArray(v)) return v.slice();
    if (!v) return [];
    return String(v).split(/[；;，,\n]/).map(function (s) { return s.trim(); })
      .filter(function (s) { return !!s; });
  }

  /* ======================= Excel 批量导入 =======================
   * 模板由本应用生成（见 TPL_COLS / buildTemplate），列顺序固定，
   * 但解析时按「列名」而非列序号认，用户自己调列顺序或删掉几列也能读。
   */
  var TPL_COLS = ['匣名称 *', '匣ID（选填）', '资料标题 *', '文号', '密级', '状态', '状态备注', '附件标题（多个用；分隔）'];
  var TPL_SAMPLE = [
    ['2026年度考核材料', '', '关于2024年度考核工作的通知', '示例〔2024〕15号', '内部', '在匣', '', '考核名册；测评表'],
    ['2026年度考核材料', '', '2024年度考核结果汇总表', '示例〔2024〕16号', '秘密', '借出', '借予示例人员', '']
  ];
  var TPL_NAME = '文书档案工作台批量导入模板.xlsx';

  /* 列名 → 内部字段。写法差异都列进来，避免用户改个词就识别不了 */
  var COL_ALIAS = [
    ['boxName', ['匣名称', '匣名', '盒名称', '盒名', '档案匣', '匣子名称', '匣子']],
    ['boxId', ['匣id', '匣编号', '匣号', 'id', '二维码id']],
    ['title', ['资料标题', '文件标题', '标题', '资料名称', '文件名称', '名称']],
    ['docNo', ['文号', '发文号', '文件号', '编号', '文号/编号']],
    ['secret', ['密级', '秘密等级', '涉密等级']],
    ['status', ['状态', '资料状态']],
    ['statusNote', ['状态备注', '备注', '说明']],
    ['attachments', ['附件标题', '附件', '附件名称', '附件清单']]
  ];

  function normCol(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[\s*＊（）()【】\[\]:：]/g, '').replace(/[（(].*?[)）]/g, '');
  }

  /* rows: 二维数组，第一行是表头。返回可直接喂给导入预览的数据结构 */
  function parseExcelRows(rows) {
    var out = { boxes: [], errors: [], totalRows: 0, blank: 0 };
    if (!rows || !rows.length) { out.errors.push('表格是空的'); return out; }

    // 1) 找表头行（前 5 行里哪行含「标题」或「匣名称」就算表头）
    var hIdx = -1, map = null;
    for (var r = 0; r < Math.min(5, rows.length); r++) {
      var m = buildColMap(rows[r]);
      if (m && m.title !== undefined) { hIdx = r; map = m; break; }
    }
    if (hIdx < 0) {
      out.errors.push('没找到表头行，请保留模板的第一行（含「资料标题」）');
      return out;
    }

    var boxIdx = {};   // 匣名 / 匣ID → boxes 里的下标
    for (var i = hIdx + 1; i < rows.length; i++) {
      var row = rows[i] || [];
      var title = String(map.title !== undefined ? (row[map.title] || '') : '').trim();
      var bName = String(map.boxName !== undefined ? (row[map.boxName] || '') : '').trim();
      var bId = String(map.boxId !== undefined ? (row[map.boxId] || '') : '').trim();
      if (!title && !bName) { out.blank++; continue; }
      if (!title) { out.errors.push('第 ' + (i + 1) + ' 行缺「资料标题」，已跳过'); continue; }
      if (!bName) bName = '未命名匣';

      var key = bId || ('N:' + bName);
      var bi = boxIdx[key];
      if (bi === undefined) {
        var realId = bId;
        if (!realId) {
          // 没填匣ID：同名匣优先复用，否则现生成一个
          var exist = null;
          for (var k = 0; k < state.boxes.length; k++) {
            if (state.boxes[k].name === bName) { exist = state.boxes[k]; break; }
          }
          realId = exist ? exist.id : genBoxId();
        }
        boxIdx[key] = out.boxes.length;
        bi = out.boxes.length;
        out.boxes.push({ boxId: realId, boxName: bName, location: '', note: '', docs: [] });
      }

      var secRaw = String(map.secret !== undefined ? (row[map.secret] || '') : '').trim();
      var stRaw = String(map.status !== undefined ? (row[map.status] || '') : '').trim();
      var secret = secRaw ? secretMeta(secRaw).name : '明文';
      if (secRaw && secretMeta(secRaw).name !== secRaw) {
        out.errors.push('第 ' + (i + 1) + ' 行密级「' + secRaw + '」不在四级内，已按「明文」处理');
      }
      var status = normalizeStatusName(stRaw || '在匣');
      if (stRaw && !getStatus(status)) {
        out.errors.push('第 ' + (i + 1) + ' 行状态「' + stRaw + '」不存在，已按「在匣」处理');
        status = '在匣';
      }

      out.boxes[bi].docs.push({
        title: title,
        docNo: String(map.docNo !== undefined ? (row[map.docNo] || '') : '').trim(),
        attachments: splitAttach(map.attachments !== undefined ? row[map.attachments] : ''),
        status: status,
        secret: secret,
        statusNote: String(map.statusNote !== undefined ? (row[map.statusNote] || '') : '').trim(),
        source: 'excel',
        photos: []
      });
      out.totalRows++;
    }

    if (!out.totalRows) {
      out.errors.push('没有解析到任何资料行，请检查表格内容');
    }
    return out;
  }

  function buildColMap(headerRow) {
    if (!headerRow || !headerRow.length) return null;
    var map = {};
    headerRow.forEach(function (cell, i) {
      var n = normCol(cell);
      if (!n) return;
      for (var a = 0; a < COL_ALIAS.length; a++) {
        var field = COL_ALIAS[a][0];
        if (map[field] !== undefined) continue;
        for (var b = 0; b < COL_ALIAS[a][1].length; b++) {
          if (n === COL_ALIAS[a][1][b] || n.indexOf(COL_ALIAS[a][1][b]) === 0) {
            map[field] = i;
            return;
          }
        }
      }
    });
    return map.title !== undefined ? map : null;
  }

  function templateRows() {
    return [TPL_COLS.slice()].concat(TPL_SAMPLE.map(function (r) { return r.slice(); }));
  }

  /* 切后台 / 关页面 / 退出 App 时立刻把数据写完，不留丢数据的窗口 */
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('pagehide', flush);
  }

  global.Store = {
    VERSION: VERSION,
    load: load, save: save, flush: flush,
    backend: function () { return backend; },
    state: state,
    COLORS: COLORS,
    addLog: addLog, searchLog: searchLog, clearLog: clearLog,
    LOG_LABEL: function () { return clone(LOG_LABEL); },
    groupBySecret: groupBySecret, groupByStatus: groupByStatus,
    parseExcelRows: parseExcelRows, templateRows: templateRows,
    TPL_NAME: TPL_NAME, splitAttach: splitAttach,
    DEFAULT_STATUSES: function () { return clone(DEFAULT_STATUSES); },
    genBoxId: genBoxId, uid: uid,
    addBox: addBox, getBox: getBox, updateBox: updateBox, deleteBox: deleteBox,
    regenBoxId: regenBoxId,
    addDoc: addDoc, getDoc: getDoc, updateDoc: updateDoc, deleteDoc: deleteDoc,
    moveDoc: moveDoc,
    docsOf: docsOf, boxStats: boxStats, search: search,
    enabledStatuses: enabledStatuses, getStatus: getStatus,
    addStatus: addStatus, updateStatus: updateStatus, deleteStatus: deleteStatus,
    SECRET_LEVELS: secretLevels, secretMeta: secretMeta,
    normalizeStatusName: normalizeStatusName,
    buildExport: buildExport, toCSV: toCSV,
    previewImport: previewImport, doImport: doImport,
    trash: function () { return state.trash; }
  };
})(window);

