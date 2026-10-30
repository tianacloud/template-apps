import {zipSync} from 'fflate';

export const MEDIA_PREFIX = 'exercise-media/v1/';
export const ORIGINAL_COMMIT = 'e348fc17c42c7e9a211c5972e573ad3698190ee2';
const PACK_LIMIT = 4 * 1024 * 1024;
export const sha256 = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('');
const fail = (code, message) => Object.assign(new Error(message), {code, mediaPreparation: true});

export function packEntries(index, packId) {
  const pack = index.packs[packId], kindIndex = pack.kind === 'still' ? 0 : 1;
  return Object.entries(index.items).flatMap(([id, refs]) => {
    const ref = refs[kindIndex];
    return ref?.[0] === packId ? [{id, offset: ref[1], size: ref[2], name: id + (kindIndex ? '.mp4' : '.webp')}] : [];
  }).sort((a, b) => a.offset - b.offset);
}

export function validatePreparationIndex(index) {
  if (index.version !== 1 || index.sourceCommit !== ORIGINAL_COMMIT || !Number.isInteger(index.exerciseCount) || index.exerciseCount < 1 ||
    Object.keys(index.items || {}).length !== index.exerciseCount || !Array.isArray(index.packs) || !index.packs.length) throw fail('BAD_INDEX', '素材目录无效');
  for (const [id, refs] of Object.entries(index.items)) {
    if (!/^\d{4,8}$/.test(id) || !Array.isArray(refs) || refs.length !== 2) throw fail('BAD_INDEX', '素材目录无效');
    refs.forEach((ref, kind) => {
      const pack = index.packs[ref?.[0]];
      if (!Array.isArray(ref) || ref.length !== 3 || !ref.every(Number.isSafeInteger) || !pack || pack.kind !== (kind ? 'clip' : 'still') ||
        ref[1] < 30 || ref[2] < 1 || ref[1] + ref[2] > pack.bytes) throw fail('BAD_INDEX', '素材位置无效');
    });
  }
  for (const pack of index.packs) {
    if (!/^(still|clip)-[a-f0-9]{20}\.zip$/.test(pack.path) || !/^[a-f0-9]{64}$/.test(pack.sha256) ||
      !Number.isSafeInteger(pack.bytes) || pack.bytes < 1 || pack.bytes > PACK_LIMIT) throw fail('BAD_INDEX', '素材包无效');
  }
  return index;
}

export async function createOriginalPack(index, packId, loadAsset, concurrency = 6) {
  const entries = packEntries(index, packId), data = new Array(entries.length);
  let next = 0, failure;
  await Promise.all(Array.from({length: Math.min(concurrency, entries.length)}, async () => {
    while (!failure && next < entries.length) {
      const at = next++, entry = entries[at];
      try {
        data[at] = new Uint8Array(await loadAsset(entry, index.packs[packId].kind));
        if (data[at].byteLength !== entry.size) throw fail('SOURCE_INCOMPLETE', '下载的素材不完整，已完成进度会保留');
      } catch (error) { failure ||= error; }
    }
  }));
  if (failure) throw failure;
  const files = {};
  entries.forEach((entry, i) => { files[entry.name] = [data[i], {level: 0, mtime: new Date(2026, 9, 1), os: 3, attrs: 0o600 << 16}]; });
  const bytes = zipSync(files), expected = index.packs[packId];
  if (bytes.byteLength !== expected.bytes || await sha256(bytes) !== expected.sha256) throw fail('SOURCE_INTEGRITY', '素材校验未通过，未写入云端');
  return bytes;
}

const notFound = error => error?.status === 404 || error?.code === 'FILE_NOT_FOUND';
const terminal = value => ['FAILED', 'CANCELLED', 'EXPIRED'].includes(String(value?.state || value?.status || '').toUpperCase());

export class MediaPreparation {
  constructor(files, {appId, index, manifestText, notices, storage = globalThis.localStorage, fetchAsset, onReady = () => {}}) {
    if (!files?.put || !files?.get || !files?.list || !appId) throw fail('UNAVAILABLE', '请在安装后的完整应用中准备素材');
    this.files = files; this.index = validatePreparationIndex(index); this.manifestText = manifestText;
    this.notices = notices; this.storage = storage; this.fetchAsset = fetchAsset; this.onReady = onReady;
    this.key = 'opengym-media-prepare:' + appId; this.appId = appId; this.listeners = new Set();
    this.state = {status: 'idle', assets: 0, total: index.exerciseCount * 2, error: '', pending: false};
    this.journal = {version: 1, appId, sourceCommit: index.sourceCommit, completed: {}, pending: null};
    const saved = this.storage?.getItem(this.key);
    if (saved) {
      const value = JSON.parse(saved);
      if (value.version !== 1 || value.appId !== appId || value.sourceCommit !== index.sourceCommit || !value.completed || typeof value.completed !== 'object') throw fail('JOURNAL_INVALID', '上次准备记录无法读取，请先保留本页记录');
      this.journal = value;
    }
    this.state.assets = index.packs.reduce((n, pack, id) => n + (this.journal.completed[pack.path]?.sha256 === pack.sha256 ? packEntries(index, id).length : 0), 0);
    this.state.pending = !!this.journal.pending;
    if (saved) this.state.status = this.journal.complete ? 'done' : 'paused';
  }
  subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  snapshot = () => this.state;
  emit(update) { this.state = {...this.state, ...update}; this.listeners.forEach(fn => fn()); }
  save() {
    try { this.storage.setItem(this.key, JSON.stringify(this.journal)); }
    catch { throw fail('JOURNAL_UNAVAILABLE', '浏览器无法保存准备进度，请允许此站点使用本地存储'); }
  }
  pause() { this.pauseRequested = true; this.emit({pausing: true}); }
  async targets() {
    const encoder = new TextEncoder();
    const textTarget = async (name, text) => { const bytes = encoder.encode(text); return {name, bytes: bytes.byteLength, sha256: await sha256(bytes), content: bytes, assets: 0}; };
    return [await textTarget('NOTICE.md', this.notices.original), await textTarget('MEDIA-NOTICE.md', this.notices.media),
      ...this.index.packs.map((pack, id) => ({...pack, name: pack.path, packId: id, assets: packEntries(this.index, id).length})),
      await textTarget('manifest.json', this.manifestText)];
  }
  async readExisting(target) {
    let response;
    try { response = await this.files.get(MEDIA_PREFIX + target.name); }
    catch (error) { if (notFound(error)) return false; throw error; }
    if (response.status === 404) return false;
    if (!response.ok) throw fail('READ_FAILED', '暂时无法核对云端素材，请稍后继续');
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== target.bytes || await sha256(bytes) !== target.sha256) throw fail('EXISTING_MISMATCH', '云端已有同名素材但校验不同，已停止准备并保留现有文件');
    return true;
  }
  mark(target, receipt = {}) {
    this.journal.completed[target.name] = {sha256: target.sha256, ...receipt}; this.journal.pending = null; this.save();
  }
  async reconcilePending(targets) {
    const pending = this.journal.pending;
    if (!pending) return;
    const target = targets.find(t => t.name === pending.name && t.sha256 === pending.sha256);
    if (!target) throw fail('JOURNAL_INVALID', '上次准备记录与素材目录不符');
    if (pending.uploadId) {
      const status = await this.files.uploadStatus(pending.uploadId);
      if (terminal(status)) {
        if (await this.readExisting(target)) this.mark(target, {uploadId: pending.uploadId, reconciled: true});
        else { this.journal.pending = null; this.save(); }
        return;
      }
      if (!status.completed) await this.files.completeUpload(pending.uploadId);
      if (!await this.readExisting(target)) throw fail('OUTCOME_UNKNOWN', '上次保存结果尚未确认，请稍后核对并继续');
      this.mark(target, {uploadId: pending.uploadId, reconciled: true});
    } else if (await this.readExisting(target)) this.mark(target, {reconciledByReadback: true});
    else throw fail('OUTCOME_UNKNOWN', '上次保存未收到回执，已保留进度；请稍后核对结果');
  }
  async existingNames() {
    const names = new Set(), seen = new Set(); let cursor;
    for (let page = 0; page < 16; page++) {
      let result;
      try { result = await this.files.list(MEDIA_PREFIX, {cursor}); }
      catch (error) { if (notFound(error)) return names; throw error; }
      if (!Array.isArray(result?.items)) throw fail('LIST_INVALID', '暂时无法读取素材目录');
      result.items.forEach(item => { if (typeof item.path === 'string') names.add(item.path.split('/').at(-1)); });
      cursor = result.cursor || result.next_cursor || undefined;
      if (!cursor) return names;
      if (seen.has(cursor)) break; seen.add(cursor);
    }
    throw fail('LIST_INVALID', '素材目录分页异常，已停止准备');
  }
  async put(target, bytes) {
    const pending = {name: target.name, sha256: target.sha256, requestId: crypto.randomUUID(), uploadId: null};
    this.journal.pending = pending; this.save();
    try {
      const result = await this.files.put(MEDIA_PREFIX + target.name,
        new Blob([bytes], {type: target.name.endsWith('.zip') ? 'application/zip' : target.name.endsWith('.json') ? 'application/json' : 'text/markdown'}),
        {requestId: pending.requestId, onPrepared: receipt => { pending.uploadId = receipt.id; this.save(); }});
      if (!await this.readExisting(target)) throw fail('OUTCOME_UNKNOWN', '素材保存结果尚未确认，请稍后核对');
      this.mark(target, {uploadId: result?.id || pending.uploadId});
    } catch (error) {
      if (error.uploadId) { pending.uploadId = error.uploadId; this.save(); }
      // An explicit rejection before preparation has no accepted upload to replay.
      if (!pending.uploadId && [400, 401, 403, 409, 413].includes(error.status)) {
        this.journal.pending = null; this.save();
        if (await this.readExisting(target)) { this.mark(target, {existing: true}); return; }
      } else if (pending.uploadId) {
        try { await this.reconcilePending([target]); if (!this.journal.pending && this.journal.completed[target.name]) return; }
        catch { /* Preserve the original receipt and require another readback. */ }
      }
      throw error;
    }
  }
  async run({accepted, directoryFiles} = {}) {
    if (!accepted) throw fail('LICENSE_REQUIRED', '请先确认个人非商业使用条件');
    if (this.running) return this.running;
    const beforeUnload = event => { event.preventDefault(); event.returnValue = ''; };
    globalThis.addEventListener?.('beforeunload', beforeUnload);
    const prepare = async lock => {
      if (lock === null) { this.emit({status: 'error', error: '另一个页面正在准备素材，请在该页面继续或暂停后再试'}); throw fail('ANOTHER_PAGE', '另一个页面正在准备素材'); }
      return this.prepare(directoryFiles);
    };
    const locks = globalThis.navigator?.locks;
    const operation = locks ? locks.request('opengym-media-' + this.appId, {ifAvailable: true}, prepare) : prepare(undefined);
    this.running = operation.finally(() => { this.running = null; globalThis.removeEventListener?.('beforeunload', beforeUnload); });
    return this.running;
  }
  async prepare(directoryFiles) {
    this.pauseRequested = false; this.emit({status: 'preparing', pausing: false, error: ''});
    try {
      const targets = await this.targets();
      let local;
      if (directoryFiles) {
        local = new Map();
        for (const file of directoryFiles) { if (local.has(file.name)) throw fail('DIRECTORY_DUPLICATE', '所选目录有重复文件名'); local.set(file.name, file); }
        for (const target of targets) if (!local.has(target.name)) throw fail('DIRECTORY_INCOMPLETE', '所选目录缺少所需素材文件');
      }
      await this.reconcilePending(targets);
      const existing = await this.existingNames(); let completedAssets = 0;
      for (const target of targets) {
        if (this.pauseRequested) { this.emit({status: 'paused', pausing: false}); return; }
        this.emit({phase: target.name === 'manifest.json' ? '正在保存完整素材目录…' : '正在准备图片与动画…'});
        if ((existing.has(target.name) || this.journal.completed[target.name]) && await this.readExisting(target)) this.mark(target, {verifiedExisting: true});
        else {
          let bytes;
          if (local) bytes = new Uint8Array(await local.get(target.name).arrayBuffer());
          else bytes = target.content || await createOriginalPack(this.index, target.packId, this.fetchAsset);
          if (bytes.byteLength !== target.bytes || await sha256(bytes) !== target.sha256) throw fail('SOURCE_INTEGRITY', '素材校验未通过，未写入云端');
          await this.put(target, bytes); existing.add(target.name);
        }
        completedAssets += target.assets; this.emit({assets: completedAssets, pending: !!this.journal.pending});
      }
      this.journal.complete = true; this.save();
      this.emit({status: 'done', phase: '', assets: this.state.total, pausing: false}); this.onReady();
    } catch (error) {
      this.emit({status: 'error', pausing: false, pending: !!this.journal.pending,
        error: error.mediaPreparation ? error.message : error.status === 403 ? '暂时无法保存素材，请检查账号权限和剩余空间；已完成进度保留' : '准备暂未完成，已保存的进度会保留；检查网络和空间后可继续'});
      throw error;
    }
  }
}
