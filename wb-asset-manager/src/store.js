/* ==========================================================================
 * 资产管理系统 · 前端状态 / 缓存层
 * 说明：
 *   - tables      : 数据表列表（含每表记录数 count）
 *   - fieldsMap   : 每个表的字段定义
 *   - assetsMap   : 每个表的「全量记录」缓存（用于客户端筛选/排序/分页，用于界面交互）
 *   - filesMap    : 每个资产已加载的附件元信息缓存
 *   - S           : 界面状态（仅前端，不下发后端）
 * 所有写操作后调用 reloadAssets / reloadTables 刷新缓存即可，渲染逻辑无需改动。
 * ========================================================================== */
(function (global) {
  'use strict';
  var API = global.API;

  var TYPE_LABELS = { asset: '设备资产', change: '硬件更换', custom: '自定义表', rack: '机房图表' };
  var TYPE_ICON = { asset: 'box', change: 'swap', custom: 'grid', rack: 'layers' };

  var S = {
    tableId: null, section: 'all', status: '', keyword: '',
    page: 1, pageSize: 20, sortKey: '', sortDir: 1,
    selected: {}, showPwd: {}, filters: {},
    expiry: ''            // '' | 'soon'(30天内到期) | 'expired'(已过期)
  };

  var tables = [];
  var fieldsMap = {};
  var assetsMap = {};   // tid -> [asset]
  var filesMap = {};    // 'tid/aid' -> [file]

  function key(tid, aid) { return tid + '/' + aid; }

  var Store = {
    TYPE_LABELS: TYPE_LABELS,
    TYPE_ICON: TYPE_ICON,
    S: S,

    getTables: function () { return tables; },
    getFields: function (tid) { return fieldsMap[tid] || []; },
    getAssets: function (tid) { return assetsMap[tid] || []; },

    tableOf: function (id) {
      for (var i = 0; i < tables.length; i++) if (tables[i].id === id) return tables[i];
      return tables[0];
    },
    curTable: function () { return this.tableOf(S.tableId); },
    curFields: function () { return fieldsMap[S.tableId] || []; },
    curAssets: function () { return assetsMap[S.tableId] || []; },
    curType: function () { var t = this.curTable(); return t ? t.type : 'asset'; },

    /* 同步取缓存中的附件列表（未加载则空数组，由 loadFiles 触发加载） */
    filesOf: function (tid, aid) {
      var k = key(tid, aid);
      if (!filesMap[k]) filesMap[k] = [];
      return filesMap[k];
    },
    findFile: function (tid, aid, fid) {
      var arr = this.filesOf(tid, aid);
      for (var i = 0; i < arr.length; i++) if (arr[i].id === fid) return arr[i];
      return null;
    },

    /* --------------------------- 加载 --------------------------- */
    loadTables: function () {
      return API.getTables().then(function (list) {
        tables = list || [];
        if (!S.tableId && tables.length) S.tableId = tables[0].id;
        return tables;
      });
    },
    loadTable: function (tid) {
      return Promise.all([API.getFields(tid), API.getAssets(tid, { page: 1, pageSize: 100000 })])
        .then(function (res) {
          fieldsMap[tid] = res[0] || [];
          assetsMap[tid] = (res[1] && res[1].rows) || [];
          return res;
        });
    },
    reloadAssets: function (tid) {
      return API.getAssets(tid, { page: 1, pageSize: 100000 }).then(function (r) {
        assetsMap[tid] = (r && r.rows) || [];
        return r;
      });
    },
    reloadTables: function () { return this.loadTables(); },
    loadFiles: function (tid, aid) {
      return API.getFiles(tid, aid).then(function (list) {
        filesMap[key(tid, aid)] = (list || []).map(function (f) {
          return { id: f.id, name: f.name, size: f.size, type: f.ftype, ext: f.ext, time: f.created_at };
        });
        return filesMap[key(tid, aid)];
      });
    },
    clearFiles: function (tid, aid) { delete filesMap[key(tid, aid)]; },
    bumpCount: function (tid) {
      var t = this.tableOf(tid);
      if (t) t.count = (assetsMap[tid] || []).length;
    },
    clearTableCache: function (tid) {
      delete assetsMap[tid];
      delete fieldsMap[tid];
      Object.keys(filesMap).forEach(function (k) { if (k.indexOf(tid + '/') === 0) delete filesMap[k]; });
    },
    ensureTableLoaded: function (tid) {
      if (!tid) return Promise.reject(new Error('数据表未就绪，请刷新页面后重试'));
      if (assetsMap[tid]) return Promise.resolve();
      return this.loadTable(tid);
    },
    /* 恢复备份 / 切换用户等场景：一次性清空所有缓存 */
    clearAll: function () {
      tables = []; fieldsMap = {}; assetsMap = {}; filesMap = {};
      S.tableId = null;
    }
  };

  global.Store = Store;
})(window);
