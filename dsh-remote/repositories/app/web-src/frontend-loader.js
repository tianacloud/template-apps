const ROOT = '/__dsh_remote__/';
const DATABASE = 'dsh-remote-assets-v1';
const LIMIT = 64 << 20;
const MAX_ITEM = 16 << 20;
const TTL = 30 * 24 * 60 * 60 * 1000;
const decoder = new TextDecoder('utf-8', { fatal: true });

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function completion(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onabort = transaction.onerror = () => reject(transaction.error);
  });
}

async function openDatabase() {
  const request = indexedDB.open(DATABASE, 2);
  request.onupgradeneeded = ({ oldVersion }) => {
    const store = oldVersion === 0 ? request.result.createObjectStore('assets', { keyPath: 'id' })
      : request.transaction.objectStore('assets');
    if (oldVersion === 0) request.result.createObjectStore('generations');
    store.createIndex('byUse', ['lastUsedAt', 'byteLength']);
  };
  return new Promise((resolve, reject) => {
    request.onblocked = () => reject(new Error('IndexedDB 升级受阻'));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function digest(bytes) {
  const value = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function verified(bytes, asset) {
  return bytes instanceof Uint8Array && bytes.length === asset.byteLength && await digest(bytes) === asset.sha256;
}

export async function readFrontendBody(response, limit) {
  if (!response.ok || !response.body) throw new Error('前端资源读取失败（HTTP ' + response.status + '）');
  let { body } = response;
  const encoding = response.headers.get('content-encoding') || 'identity';
  if (encoding === 'gzip' && typeof DecompressionStream === 'function') {
    body = body.pipeThrough(new DecompressionStream('gzip'));
  } else if (encoding !== 'identity') {
    throw new Error('不受支持的前端压缩格式');
  }
  const reader = body.getReader();
  const parts = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error('前端资源超过已授权大小');
      parts.push(value);
    }
  } catch (err) {
    await reader.cancel().catch(() => {});
    throw err;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.length;
  }
  return bytes;
}

function frontendHeaders() {
  return { 'x-dsh-encoding': typeof DecompressionStream === 'function' ? 'gzip' : 'identity' };
}

export async function requestFrontend(fetchAsset, signal) {
  const response = await fetchAsset(ROOT + 'bootstrap.json', { headers: frontendHeaders(), signal });
  return JSON.parse(decoder.decode(await readFrontendBody(response, 4 << 20)));
}

function scopeKey({ webId, tenantId, ownerUserId, hostId }) {
  return JSON.stringify([webId, tenantId, ownerUserId, hostId]);
}

function isSameWebScope(serializedScope, webId) {
  try {
    const parsed = JSON.parse(serializedScope);
    return Array.isArray(parsed) && parsed[0] === webId;
  } catch {
    return false;
  }
}

export async function clearFrontendCache(identity) {
  try {
    const db = await openDatabase();
    try {
      const tx = db.transaction(['assets', 'generations'], 'readwrite');
      const done = completion(tx);
      const key = scopeKey(identity);
      const store = tx.objectStore('assets');
      const rows = await requestResult(store.getAllKeys());
      for (const id of rows) {
        if (id[0] === key) store.delete(id);
      }
      tx.objectStore('generations').delete(key);
      await done;
    } finally {
      db.close();
    }
  } catch {
    // The browser can opt out of persistent storage.
  }
}

export async function clearWebFrontendCache(webId) {
  if (!webId) return;
  try {
    const db = await openDatabase();
    try {
      const tx = db.transaction(['assets', 'generations'], 'readwrite');
      const done = completion(tx);
      const store = tx.objectStore('assets');
      const rows = await requestResult(store.getAllKeys());
      for (const id of rows) {
        if (Array.isArray(id) && isSameWebScope(id[0], webId)) store.delete(id);
      }
      const generations = tx.objectStore('generations');
      const genKeys = await requestResult(generations.getAllKeys());
      for (const key of genKeys) {
        if (typeof key === 'string' && isSameWebScope(key, webId)) generations.delete(key);
      }
      await done;
    } finally {
      db.close();
    }
  } catch {
    // The browser can opt out of persistent storage.
  }
}

export async function createFrontendLoader(manifest, identity, fetchAsset, signal) {
  if (!Number.isSafeInteger(manifest.transformVersion) || !Number.isSafeInteger(manifest.generation) ||
      !Array.isArray(manifest.styles) || !Array.isArray(manifest.resources) ||
      manifest.resources.length > 4096 || !manifest.boot) {
    throw new Error('前端清单版本不受支持，请同步更新主机和应用');
  }
  const assets = new Map();
  let total = 0;
  for (const asset of manifest.resources) {
    if (!/^(core|plugin|chunk|asset):[^\r\n]+$/u.test(asset.key) || assets.has(asset.key) ||
        !/^[a-f0-9]{64}$/u.test(asset.sha256) || asset.rev !== asset.sha256 ||
        !Number.isSafeInteger(asset.byteLength) || asset.byteLength < 0 || asset.byteLength > MAX_ITEM ||
        typeof asset.mimeType !== 'string' || !/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/ui.test(asset.mimeType)) {
      throw new Error('无效的前端资源清单');
    }
    total += asset.byteLength;
    assets.set(asset.key, asset);
  }
  if (total > LIMIT) throw new Error('前端清单超过预算');
  for (const asset of assets.values()) {
    for (const link of asset.links ?? []) {
      if (!/^__DSH_(?:CORE|STYLE)_LINK_[0-9]+__$/u.test(link.marker) || !assets.has(link.key)) {
        throw new Error('无效的前端依赖');
      }
    }
  }

  const scope = scopeKey(identity);
  const version = manifest.transformVersion;
  const generation = [manifest.generation, manifest.serial];
  const cacheId = (key) => [scope, version, key];
  const db = await openDatabase().catch(() => null);
  if (db) {
    try {
      const tx = db.transaction(['assets', 'generations'], 'readwrite');
      const done = completion(tx);
      const epochs = tx.objectStore('generations');
      const previous = await requestResult(epochs.get(scope));
      if (!previous || previous[0] < generation[0] || (previous[0] === generation[0] && previous[1] <= generation[1])) {
        epochs.put(generation, scope);
        const entries = tx.objectStore('assets');
        const cursor = entries.openCursor();
        cursor.onsuccess = () => {
          const row = cursor.result;
          if (!row) return;
          const [owner, itemVersion, itemKey] = row.primaryKey;
          if (row.value.lastUsedAt < Date.now() - TTL ||
              (owner !== scope && isSameWebScope(owner, identity.webId)) ||
              (owner === scope && (itemVersion !== version || !assets.has(itemKey)))) row.delete();
          row.continue();
        };
        const genCursor = epochs.openCursor();
        genCursor.onsuccess = () => {
          const row = genCursor.result;
          if (!row) return;
          if (row.primaryKey !== scope && isSameWebScope(row.primaryKey, identity.webId)) row.delete();
          row.continue();
        };
      }
      await done;
    } catch {
      // Integrity checks are independent of persistence.
    }
  }

  const pendingBytes = new Map();
  const urls = new Map();
  const ownedUrls = new Set();
  const routeMap = new Map();
  for (const asset of assets.values()) {
    if (typeof asset.route === 'string') routeMap.set(asset.route, asset.key);
  }

  async function store(asset, bytes) {
    if (!db || signal.aborted) return;
    try {
      const tx = db.transaction(['assets', 'generations'], 'readwrite');
      const done = completion(tx);
      const current = await requestResult(tx.objectStore('generations').get(scope));
      if (current?.[0] === generation[0] && current[1] === generation[1] && !signal.aborted) {
        const entries = tx.objectStore('assets');
        entries.put({
          id: cacheId(asset.key), rev: asset.rev, sha256: asset.sha256,
          mimeType: asset.mimeType, byteLength: bytes.length, bytes, lastUsedAt: Date.now(),
        });
        // Sort only metadata, not asset data, after this write commits into the transaction.
        const request = entries.index('byUse').openKeyCursor();
        const metadata = [];
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            const [lastUsedAt, byteLength] = cursor.key;
            metadata.push({ id: cursor.primaryKey, byteLength, lastUsedAt });
            cursor.continue();
            return;
          }
          let size = metadata.reduce((sum, item) => sum + item.byteLength, 0);
          for (const item of metadata.sort((a, b) => a.lastUsedAt - b.lastUsedAt)) {
            if (size <= LIMIT) break;
            entries.delete(item.id);
            size -= item.byteLength;
          }
        };
      }
      await done;
    } catch {
      // This page retains its verified bytes when writes or quota fail.
    }
  }

  async function read(asset) {
    signal.throwIfAborted();
    let cached;
    if (db) {
      try {
        cached = await requestResult(db.transaction('assets').objectStore('assets').get(cacheId(asset.key)));
      } catch {
        // Opening or reading IndexedDB can fail in private environments.
      }
    }
    if (cached?.rev === asset.rev && await verified(cached.bytes, asset)) {
      await store(asset, cached.bytes);
      return cached.bytes;
    }
    if (db && cached?.rev === asset.rev) {
      try {
        const tx = db.transaction(['assets', 'generations'], 'readwrite');
        const done = completion(tx);
        const current = await requestResult(tx.objectStore('generations').get(scope));
        if (current?.[0] === generation[0] && current[1] === generation[1]) {
          tx.objectStore('assets').delete(cacheId(asset.key));
        }
        await done;
      } catch {
        // The trusted response can still replace an invalid local record.
      }
    }
    const params = new URLSearchParams({ key: asset.key, rev: asset.rev });
    const response = await fetchAsset(ROOT + 'asset?' + params, { headers: frontendHeaders(), signal });
    if (response.headers.get('content-type') !== asset.mimeType) throw new Error('前端资源类型与清单不一致');
    const bytes = await readFrontendBody(response, asset.byteLength);
    if (!await verified(bytes, asset)) throw new Error('前端资源 SHA-256 校验失败');
    signal.throwIfAborted();
    await store(asset, bytes);
    return bytes;
  }

  function bytesFor(key) {
    const asset = assets.get(key);
    if (!asset) throw new Error('资源不在授权清单');
    if (!pendingBytes.has(key)) pendingBytes.set(key, read(asset));
    return pendingBytes.get(key);
  }

  function blob(bytes, type) {
    signal.throwIfAborted();
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    ownedUrls.add(url);
    return url;
  }

  function urlFor(key, ancestry = []) {
    if (ancestry.includes(key)) throw new Error('前端静态模块存在循环依赖');
    if (!urls.has(key)) {
      urls.set(key, (async () => {
        const asset = assets.get(key);
        const bytes = await bytesFor(key);
        if (!asset.links?.length) return blob(bytes, asset.mimeType);
        let text = decoder.decode(bytes);
        for (const { marker, key: dependency } of asset.links) {
          const target = await urlFor(dependency, [...ancestry, key]);
          text = text.replaceAll(marker, target);
        }
        return blob(text, asset.mimeType);
      })());
    }
    return urls.get(key);
  }

  const registered = new Set();
  let scriptQueue = Promise.resolve();
  async function execute(key) {
    if (registered.has(key)) return;
    const asset = assets.get(key);
    const classicUrl = blob(await bytesFor(key), 'text/javascript');
    const target = globalThis.__ModuleLoader__;
    const accept = target.load;
    let registration;
    target.load = (value) => {
      if (!signal.aborted && !registration && value?.id === asset.registration &&
          value.chunk === asset.chunk && typeof value.factory === 'function') registration = value;
    };
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const finish = (err) => {
          script.remove();
          signal.removeEventListener('abort', abort);
          if (err) reject(err);
          else resolve();
        };
        const abort = () => finish(signal.reason);
        script.addEventListener('load', () => finish(), { once: true });
        script.addEventListener('error', () => finish(new Error('DSH 插件无法执行')), { once: true });
        signal.addEventListener('abort', abort, { once: true });
        script.src = classicUrl;
        document.head.append(script);
      });
      signal.throwIfAborted();
      if (!registration) throw new Error('DSH 插件注册与清单不一致: ' + asset.owner);
      accept.call(target, registration);
      registered.add(key);
    } finally {
      target.load = accept;
      URL.revokeObjectURL(classicUrl);
      ownedUrls.delete(classicUrl);
    }
  }

  function queueScript(key) {
    const task = scriptQueue.then(() => execute(key));
    scriptQueue = task.catch(() => {});
    return task;
  }

  const resolvedAssets = new Map();
  const assetByUrl = new Map();
  return {
    manifest,
    async prepare() {
      const preload = [...assets.keys()].filter((key) => key.startsWith('asset:') || key.startsWith('plugin:'));
      let next = 0;
      await Promise.all([
        urlFor(manifest.entry),
        ...manifest.styles.map((key) => urlFor(key)),
        ...Array.from({ length: 4 }, async () => {
          while (next < preload.length) {
            const key = preload[next++];
            if (key.startsWith('asset:')) {
              const url = await urlFor(key);
              resolvedAssets.set(assets.get(key).route, url);
              assetByUrl.set(url, key);
            } else await bytesFor(key);
          }
        }),
      ]);
    },
    async install() {
      for (const key of assets.keys()) if (key.startsWith('plugin:')) await queueScript(key);
      await Promise.all(manifest.styles.map(async (key) => {
        const sheet = document.createElement('link');
        const url = await urlFor(key);
        sheet.rel = 'stylesheet';
        await new Promise((resolve, reject) => {
          sheet.onload = resolve;
          sheet.onerror = () => reject(new Error('DSH 样式资源无法加载'));
          sheet.href = url;
          document.head.append(sheet);
        });
      }));
    },
    async importCore(key) {
      if (!key.startsWith('core:') || assets.get(key)?.mimeType !== 'text/javascript') throw new Error('无效的核心模块');
      return import(await urlFor(key));
    },
    loadBundle(reference) {
      const route = String(reference).replace(/^\//u, '');
      const key = routeMap.get(route);
      if (!key || !/^(plugin|chunk):/u.test(key)) return Promise.reject(new Error('插件版本已变化，请刷新工作台'));
      return queueScript(key);
    },
    resolveAsset(reference) {
      const route = String(reference).replace(/^\//u, '');
      const url = resolvedAssets.get(route);
      if (!url) throw new Error('插件资源未获准或不存在');
      return url;
    },
    fetchAssetUrl(url, method, requestSignal) {
      const key = assetByUrl.get(url);
      if (!key) return undefined;
      return (async () => {
        signal.throwIfAborted();
        requestSignal?.throwIfAborted();
        if (method !== 'GET' && method !== 'HEAD') return new Response(null, { status: 405 });
        const item = assets.get(key);
        const bytes = await bytesFor(key);
        requestSignal?.throwIfAborted();
        return new Response(method === 'HEAD' ? null : bytes, {
          headers: { 'content-type': item.mimeType, 'content-length': String(bytes.length) },
        });
      })();
    },
    close() {
      db?.close();
      for (const url of ownedUrls) URL.revokeObjectURL(url);
      ownedUrls.clear();
      assetByUrl.clear();
    },
  };
}
