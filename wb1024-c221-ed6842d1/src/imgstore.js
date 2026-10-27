'use strict';

/* =========================================================
   图片仓库
   - 主存储：IndexedDB（存 Blob，不受 localStorage 5MB 限制）
   - 降级：主页面存储被禁（沙箱预览 / 隐私模式）时用内存 Map，
     本次会话可用，关闭即丢——与主数据的行为保持一致
   - 入库前统一压缩：长边 ≤ 1400px；PNG 优先，超过 700KB 退回 JPEG
   ========================================================= */

const ImageStore = (() => {
  const DB_NAME = 'todo-images';
  const OS_NAME = 'blobs';
  const MAX_EDGE = 1400;
  const PNG_LIMIT = 700 * 1024;

  let dbPromise = null;
  let mode = 'memory';        // 'local' | 'memory'
  const mem = new Map();
  let seq = 0;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) { reject(new Error('no-idb')); return; }
      let req;
      try { req = indexedDB.open(DB_NAME, 1); }
      catch (e) { reject(e); return; }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(OS_NAME)) db.createObjectStore(OS_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('idb-open-failed'));
      req.onblocked = () => reject(new Error('idb-blocked'));
    }).catch((e) => { dbPromise = null; throw e; });
    return dbPromise;
  }

  const wrap = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb-req-failed'));
  });

  function storeOf(mode2) {
    return openDB().then((db) => db.transaction(OS_NAME, mode2).objectStore(OS_NAME));
  }

  /* ---------- 压缩 ---------- */

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob-failed'))), type, quality);
    });
  }

  async function prepare(blob) {
    if (!blob || !blob.type || blob.type.indexOf('image/') !== 0) throw new Error('not-image');
    /* 动图与矢量图不重编码，避免丢帧 / 失真 */
    if (blob.type === 'image/gif' || blob.type === 'image/svg+xml') return { blob, type: blob.type };

    let bmp = null;
    try { bmp = await createImageBitmap(blob); }
    catch (e) { return { blob, type: blob.type }; }   // 解码失败就原样存

    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    if (scale === 1 && blob.size < PNG_LIMIT) { bmp.close(); return { blob, type: blob.type }; }

    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (blob.type === 'image/jpeg') {           // JPEG 无透明通道，先铺白底
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    let out = await canvasToBlob(canvas, 'image/png');
    let type = 'image/png';
    if (out.size > PNG_LIMIT) {
      out = await canvasToBlob(canvas, 'image/jpeg', 0.85);
      type = 'image/jpeg';
    }
    return { blob: out, type };
  }

  /* ---------- 接口 ---------- */

  const API = {
    get mode() { return mode; },

    init(preferred) {
      mode = preferred === 'local' ? 'local' : 'memory';
      if (mode === 'local') {
        openDB().catch(() => { mode = 'memory'; });
      }
    },

    async add(file) {
      const { blob, type } = await prepare(file);
      const id = 'img-' + Date.now().toString(36) + '-' + (seq++);
      if (mode === 'local') {
        try {
          await wrap((await storeOf('readwrite')).put(blob, id));
          return { id, type, size: blob.size };
        } catch (e) { /* 落库失败则退回内存 */ }
      }
      mem.set(id, { blob, type });
      return { id, type, size: blob.size, degraded: true };
    },

    async get(id) {
      if (mem.has(id)) return mem.get(id).blob;
      if (mode !== 'local') return null;
      try {
        const blob = await wrap((await storeOf('readonly')).get(id));
        return blob || null;
      } catch (e) { return null; }
    },

    async del(id) {
      mem.delete(id);
      if (mode !== 'local') return;
      try { await wrap((await storeOf('readwrite')).delete(id)); }
      catch (e) { /* noop */ }
    },

    async dataURL(id) {
      const rec = mem.get(id);
      const blob = rec ? rec.blob : await this.get(id);
      if (!blob) return null;
      return new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = () => resolve(null);
        fr.readAsDataURL(blob);
      });
    }
  };

  return API;
})();
