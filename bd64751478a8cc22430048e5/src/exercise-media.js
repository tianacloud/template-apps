// Media belongs to the app's own Tiana file directory. ZIP STORE payloads are
// original unchanged files; the application never hotlinks the source instance.
const PREFIX = 'exercise-media/v1/';
const PACK_LIMIT = 4 * 1024 * 1024;

export class ExerciseMedia {
  constructor(files, {cacheBytes = 32 * 1024 * 1024, createURL = b => URL.createObjectURL(b), revokeURL = u => URL.revokeObjectURL(u)} = {}) {
    this.files = files;
    this.limit = cacheBytes;
    this.createURL = createURL;
    this.revokeURL = revokeURL;
    this.packs = new Map();
    this.pending = new Map();
    this.assets = new Map();
    this.bytes = 0;
    this.running = 0;
    this.waiters = [];
    this.disposed = false;
    this.listeners = new Set();
  }

  subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  refresh() { this.index = undefined; this.listeners.forEach(fn => fn()); }
  async preparation() {
    if (process.env.TIANA_DEMO === 'true') throw new Error('请在完整应用中准备动作素材');
    if (!this.preparer) this.preparer = import('./media-setup-provider.js').then(module => module.createMediaPreparation(this)).catch(error => { this.preparer = undefined; throw error; });
    return this.preparer;
  }

  async manifest() {
    if (!this.files || this.disposed) return null;
    if (!this.index) {
      this.index = (async () => {
        const response = await this.files.get(PREFIX + 'manifest.json');
        if (response.status === 404) return null;
        if (!response.ok) throw new Error('暂时无法读取动作演示');
        const index = await response.json();
        if (index.version !== 1 || index.exerciseCount !== 5632 || !Array.isArray(index.packs) || !index.items || Object.keys(index.items).length !== 5632) throw new Error('动作素材目录不完整');
        for (const pack of index.packs) {
          if (!/^(still|clip)-[a-f0-9]{20}\.zip$/.test(pack.path) || !/^[a-f0-9]{64}$/.test(pack.sha256) || !Number.isSafeInteger(pack.bytes) || pack.bytes < 1 || pack.bytes > PACK_LIMIT) throw new Error('动作素材目录无效');
        }
        return index;
      })().catch(error => {
        this.index = undefined;
        if (error.status === 404 || error.code === 'FILE_NOT_FOUND') return null;
        throw error;
      });
    }
    return this.index;
  }

  async slot() {
    if (this.running < 3) this.running++;
    else await new Promise(resolve => this.waiters.push(resolve));
  }
  freeSlot() {
    const next = this.waiters.shift();
    if (next) next();
    else this.running--;
  }

  async pack(info) {
    if (this.disposed) throw new Error('动作演示已关闭');
    if (this.packs.has(info.path)) {
      const bytes = this.packs.get(info.path);
      this.packs.delete(info.path);
      this.packs.set(info.path, bytes);
      return bytes;
    }
    if (!this.pending.has(info.path)) {
      const pending = (async () => {
        await this.slot();
        try {
          if (this.disposed) throw new Error('动作演示已关闭');
          const response = await this.files.get(PREFIX + info.path);
          if (!response.ok) throw new Error('动作演示暂时无法加载');
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength !== info.bytes) throw new Error('动作素材下载不完整');
          const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(x => x.toString(16).padStart(2, '0')).join('');
          if (hash !== info.sha256) throw new Error('动作素材校验未通过');
          if (this.disposed) throw new Error('动作演示已关闭');
          this.packs.set(info.path, buffer);
          this.bytes += buffer.byteLength;
          while (this.bytes > this.limit && this.packs.size > 1) {
            const [key, value] = this.packs.entries().next().value;
            this.packs.delete(key);
            this.bytes -= value.byteLength;
          }
          return buffer;
        } finally { this.freeSlot(); }
      })().finally(() => this.pending.delete(info.path));
      this.pending.set(info.path, pending);
    }
    return this.pending.get(info.path);
  }

  async acquire(id, kind = 'still') {
    if (kind !== 'still' && kind !== 'clip') throw new Error('未知动作素材类型');
    const index = await this.manifest();
    if (!index || !Object.hasOwn(index.items, id)) return null;
    const ref = index.items[id]?.[kind === 'still' ? 0 : 1];
    if (!Array.isArray(ref) || ref.length !== 3 || !ref.every(Number.isSafeInteger)) throw new Error('动作素材索引无效');
    const [packID, offset, size] = ref;
    const info = index.packs[packID];
    if (!info || info.kind !== kind || offset < 30 || size <= 0 || offset + size > info.bytes) throw new Error('动作素材索引越界');
    const key = kind + ':' + id;
    if (!this.assets.has(key)) {
      const buffer = await this.pack(info);
      if (this.disposed) throw new Error('动作演示已关闭');
      if (!this.assets.has(key)) {
        const bytes = buffer.slice(offset, offset + size);
        this.assets.set(key, {bytes: kind === 'clip' ? bytes : null,
          url: kind === 'still' ? this.createURL(new Blob([bytes], {type: 'image/webp'})) : null, refs: 0});
      }
    }
    const asset = this.assets.get(key);
    asset.refs++;
    let released = false;
    return {url: asset.url, bytes: asset.bytes, release: () => {
      if (released) return;
      released = true;
      asset.refs--;
      if (!asset.refs && this.assets.get(key) === asset) {
        if (asset.url) this.revokeURL(asset.url);
        this.assets.delete(key);
      }
    }};
  }

  dispose() {
    this.disposed = true;
    for (const asset of this.assets.values()) if (asset.url) this.revokeURL(asset.url);
    this.assets.clear();
    this.listeners.clear();
    this.packs.clear();
    this.bytes = 0;
  }
}
