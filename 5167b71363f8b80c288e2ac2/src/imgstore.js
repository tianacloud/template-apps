'use strict';

/* 图片保存在当前应用的文件目录。 */

export const ImageStore = (() => {
  const MAX_EDGE = 1400;
  const PNG_LIMIT = 700 * 1024;
  let files;
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
    init(api) { files = api; },
    async add(file) {
      const { blob, type } = await prepare(file);
      const id = 'images/' + crypto.randomUUID();
      await files.put(id, blob);
      return { id, type, size: blob.size };
    },
    async get(id) {
      const response = await files.get(id);
      if (!response.ok) throw new Error('图片读取失败');
      return response.blob();
    },
    async del(id) {
      await files.delete(id);
    },
    async dataURL(id) {
      const blob = await this.get(id);
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
