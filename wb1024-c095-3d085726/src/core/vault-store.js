/**
 * VaultStore 模块（Phase 3 · v2 双包裹格式）
 *
 * 数据模型（v2）：
 *   IndexedDB `workbench` db：
 *     - store: 'meta'  key: 'main' → VaultMeta
 *     - store: 'vault' key: 'main' → VaultPayload（dataKey 加密的用户数据）
 *
 * 密钥结构（双包裹，找回且数据保留的关键）：
 *   dataKey            随机 32B，真正加密用户数据的 AES-256 key
 *   wrappedByPassword  AES-GCM(PBKDF2(password, salt, 600k), dataKey)   —— 日常解锁
 *   wrappedByMnemonic  AES-GCM(SHA-256(mnemonic), dataKey)              —— 找回解锁
 *
 * 安全说明：
 *   - 助记词 256 bits 熵，SHA-256 直接作 key material 无暴力枚举风险，无需慢哈希
 *   - 改密只重新包裹 dataKey（salt 轮换），数据无需重加密；同时清除 wrappedByMnemonic
 *     强制重新留存（旧助记词包裹的仍是同一 dataKey，不清理会成为找回后门）
 *   - 旧 v1 格式（无 format 字段）由 migrateIfNeeded() 自动 wipe（v1 无法解密保留）
 *
 * 依赖：./crypto.js
 */
(function (global) {
  global = global || (typeof globalThis !== 'undefined' ? globalThis : this);
  const Crypto = global.Crypto;
  if (!Crypto) throw new Error('Crypto 未加载，请先引入 core/crypto.js');

  const DB_NAME = 'workbench';
  const DB_VERSION = 1;
  const STORE_META = 'meta';
  const STORE_VAULT = 'vault';
  const META_KEY = 'main';
  const VAULT_KEY = 'main';
  const FORMAT = 'v2';

  // ===== Storage Adapter 接口（可替换，便于测试） =====

  /**
   * 浏览器 IndexedDB 适配器
   */
  function createIDBAdapter(idb) {
    const _idb = idb || (typeof indexedDB !== 'undefined' ? indexedDB : null);
    if (!_idb) throw new Error('IndexedDB 不可用');

    return {
      async open() {
        return new Promise((resolve, reject) => {
          const req = _idb.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META);
            if (!db.objectStoreNames.contains(STORE_VAULT)) db.createObjectStore(STORE_VAULT);
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      },

      async put(storeName, key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const req = tx.objectStore(storeName).put(value, key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        });
      },

      async get(storeName, key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        });
      },

      async remove(storeName, key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const req = tx.objectStore(storeName).delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        });
      },

      async clear(storeName) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          const req = tx.objectStore(storeName).clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        });
      },
    };
  }

  /**
   * 内存适配器（仅测试用）
   */
  function createMemoryAdapter() {
    const data = new Map(); // key = `${storeName}/${key}`
    const k = (s, k) => s + '/' + k;
    return {
      async put(storeName, key, value) { data.set(k(storeName, key), value); },
      async get(storeName, key) { return data.get(k(storeName, key)) || null; },
      async remove(storeName, key) { data.delete(k(storeName, key)); },
      async clear(storeName) {
        for (const k2 of Array.from(data.keys())) if (k2.startsWith(storeName + '/')) data.delete(k2);
      },
    };
  }

  /**
   * 远端缓存适配器工厂（pywebview / HTTP 两条本地通道共用）
   *
   * 共同特征：整库作为一个 JSON 文档读写，内存缓存 + 每次改动整体落盘。
   * vault 体量很小（几百条卡片约几十 KB），整体序列化开销可忽略。
   *
   * @param {{read: () => Promise<string|null>, write: (text:string) => Promise<any>}} io
   */
  function createRemoteCacheAdapter(io) {
    let _cache = null;

    async function load() {
      if (_cache) return _cache;
      const raw = await io.read();
      _cache = raw ? JSON.parse(raw) : {};
      return _cache;
    }
    async function flush() {
      await io.write(JSON.stringify(_cache));
    }
    return {
      async put(storeName, key, value) { const d = await load(); d[storeName] = value; await flush(); },
      async get(storeName, key) { const d = await load(); return d[storeName] || null; },
      async remove(storeName, key) { const d = await load(); delete d[storeName]; await flush(); },
      async clear(storeName) { const d = await load(); delete d[storeName]; await flush(); },
      async reset() { _cache = null; },   // 丢弃内存缓存（重新加载 / 测试用）
    };
  }

  /**
   * 本地 exe 适配器（pywebview）
   *
   * 通过 window.pywebview.api 调用 Python 侧文件读写，
   * 完全绕开浏览器安全策略（FS API / 下载 / 剪贴板限制均不适用）。
   * 数据落点：exe 同目录 data/vault.wb
   */
  function createPywebviewAdapter(api) {
    const _api = api || (global.pywebview && global.pywebview.api) || null;
    if (!_api) throw new Error('pywebview API 不可用');
    return createRemoteCacheAdapter({
      read: () => _api.read_vault(),
      write: text => _api.write_vault(text),
    });
  }

  /**
   * 本地调试服务适配器（HTTP）
   * 配合 `python -m http.server` 之外的简易 Node/Python 本地服务使用，
   * 让浏览器环境也能把数据写到同目录文件（开发期调试通道）。
   */
  function createHttpFileAdapter(baseUrl) {
    const _base = baseUrl || '';
    return createRemoteCacheAdapter({
      read: async () => {
        const r = await fetch(_base + '/api/vault');
        return r.ok ? await r.text() : null;
      },
      write: async text => {
        await fetch(_base + '/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: text,
        });
      },
    });
  }

  /**
   * 云对象存储适配器（Web 版 · 平台托管 COS）
   *
   * ⚠️ 依赖注入：本函数不认识任何 SDK，只认 4 个方法 + 1 个路径解析器，
   *   由 web/app/cloud-auth.js 把已初始化的 SDK storage 句柄传进来
   *   → core 层保持零平台耦合，上游桌面版不受影响。
   *
   * @param {{
   *   pathFor: () => string,
   *   exists:  (path:string) => Promise<boolean>,
   *   download:(path:string) => Promise<any>,   // Blob / 有 .text() 的对象 / string
   *   upload:  (path:string, body:any) => Promise<any>,
   *   update:  (path:string, body:any) => Promise<any>,
   * }} cloud
   * @param {{cache?: object}} [opts] cache = 本地适配器（IDB），只作离线**读取**兜底
   *
   * 平台实测修正（S1 容量实测 · 2026-10-07，详见 web/AGENT-HANDOFF.md §7.2）：
   *   `upload(path, body, {upsert:true})` 对**已存在**对象返回 409 STORAGE_KEY_ALREADY_EXISTS，
   *   upsert 参数不生效。→ 覆盖写必须 exists() → update()/upload()，
   *   并以「捕获 409 转 update」兜底竞态。两条路都在此实现。
   *
   * 同步语义：「解锁 = 同步点」。createRemoteCacheAdapter 懒加载——
   *   首次 get() 才触发 download()，而首次 get 发生在 initStore()（解锁流程起点），
   *   因此每次进入解锁流程必然先拉一次云端最新密文。
   *
   * 离线兜底铁律：云端读失败 → 用本地**真实密文副本**解锁，并把 state.offline 置真，
   *   由 UI 如实提示「离线 / 可能非最新」；**绝不伪造云端状态**。
   *   写入侧在 offline 态**直接抛错**——保存失败要如实报错，不许假装成功。
   */
  function createCloudAdapter(cloud, opts) {
    if (!cloud || typeof cloud.pathFor !== 'function') {
      throw new Error('云存储句柄不可用');
    }
    const _o = opts || {};
    const _cache = _o.cache || null;
    const _path = cloud.pathFor();

    /** 可观测状态（供 UI 如实展示离线态，不参与加密逻辑） */
    const state = { offline: false, lastError: null, path: _path };

    function isAlreadyExists(e) {
      const code = (e && (e.status || e.statusCode || e.code)) || '';
      const msg = String((e && (e.message || e.msg)) || e || '');
      return code === 409 || /STORAGE_KEY_ALREADY_EXISTS|already exists/i.test(msg);
    }

    function asText(body) {
      if (body == null) return null;
      if (typeof body === 'string') return body;
      if (typeof body.text === 'function') return body.text();   // Blob
      return String(body);
    }

    /**
     * 本地密文副本：读写都用 **meta / vault 原布局**（不是另起一个 store）。
     *
     * 为什么这么设计（2026-10-07）：两种离线场景都要能解锁，
     *   ① 有会话但网络断 → 云适配器读失败 → 回落副本（走 cacheGet）
     *   ② 无会话（SDK 拿不到 session）→ pickStorageAdapter 落到纯 IDB 适配器
     * 若副本另存一个 store，场景 ② 里的 IDB 适配器认不出数据 → 误判「首启」→ 像丢数据。
     * 复用 meta/vault 布局后，场景 ② 直接可用，且副本内容仍是**密文**（云端只见密文、本机也只见密文）。
     */
    async function cachePut(text) {
      if (!_cache) return;
      try {
        const doc = JSON.parse(text);
        await _cache.put(STORE_META, META_KEY, doc[STORE_META]);
        await _cache.put(STORE_VAULT, VAULT_KEY, doc[STORE_VAULT]);
      } catch (e) { /* 缓存失败不阻断主流程 */ }
    }
    async function cacheGet() {
      if (!_cache) return null;
      try {
        const m = await _cache.get(STORE_META, META_KEY);
        const v = await _cache.get(STORE_VAULT, VAULT_KEY);
        if (!m || !v) return null;
        return JSON.stringify({ [STORE_META]: m, [STORE_VAULT]: v });
      } catch (e) { return null; }
    }

    /** 云侧读：exists 判存在 → download 取文本（避免靠异常码判「不存在」） */
    async function cloudRead() {
      const has = await cloud.exists(_path);
      if (!has) return null;                       // 云端尚无 vault = 首启
      const body = await cloud.download(_path);
      const text = await asText(body);
      return text || null;
    }

    /** 云侧写：exists → update/upload；409 竞态兜底转 update */
    async function cloudWrite(text) {
      const has = await cloud.exists(_path);
      if (!has) {
        try {
          await cloud.upload(_path, text);
          return;
        } catch (e) {
          if (!isAlreadyExists(e)) throw e;        // 并发下对象已被建 → 改走覆盖
        }
      }
      try {
        await cloud.update(_path, text);
      } catch (e) {
        if (isAlreadyExists(e)) { await cloud.upload(_path, text); return; }
        throw e;
      }
    }

    const adapter = createRemoteCacheAdapter({
      read: async () => {
        try {
          const text = await cloudRead();
          state.offline = false;
          state.lastError = null;
          if (text != null) await cachePut(text);
          return text;
        } catch (e) {
          // 云不可用 → 回落本地真实密文副本；无副本则如实失败
          const cached = await cacheGet();
          state.offline = true;
          state.lastError = e;
          if (cached != null) return cached;
          throw new Error('云端不可用且无本地副本：' + ((e && e.message) || e));
        }
      },
      write: async (text) => {
        // 写路径「自愈」设计（2026-10-07 B5 轮）：
        //   不在 offline 态直接短路，真实尝试云端写入——
        //   · 网络已恢复 → 写成功并复位 offline（自愈；此前一旦 offline 就永远拒写、
        //     只能靠重启页面恢复，是设计漏洞）
        //   · 仍不可达   → 置 offline（供 UI 写守卫 guardWrite 快速拦截）+ 如实抛错
        //   绝对原则不变：不许假成功、不许只写缓存。离线「禁止操作」由 UI 层拦截兜底。
        try {
          await cloudWrite(text);
        } catch (e) {
          state.offline = true;
          state.lastError = e;
          throw e;
        }
        state.offline = false;
        state.lastError = null;
        await cachePut(text);
      },
    });

    adapter.state = state;
    return adapter;
  }

  // ===== VaultStore 实现 =====

  function createVaultStore(adapter) {
    let _adapter = adapter;
    let _unlocked = false;
    let _dataKey = null;         // CryptoKey（AES-GCM，加密用户数据）
    let _dataKeyBytes = null;    // 原始 32B（重新包裹用，lock 时清除）
    let _meta = null;            // current VaultMeta
    let _plain = null;           // decrypted vault payload

    async function exists() {
      const m = await _adapter.get(STORE_META, META_KEY);
      const v = await _adapter.get(STORE_VAULT, VAULT_KEY);
      if (!!m !== !!v) throw new Error('保险箱数据不完整，未修改数据。');
      return !!(m && v);
    }

    /**
     * 旧格式迁移：v1 vault（无 dataKey 双包裹）数据无法解密保留，
     * 自动 wipe 让用户重走创建流程。返回是否执行了迁移。
     */
    async function migrateIfNeeded() {
      const m = await _adapter.get(STORE_META, META_KEY);
      if (m && m.format !== FORMAT) {
        throw new Error('保险箱格式不受支持，未修改数据。');
      }
      return false;
    }

    async function _loadBoth() {
      const meta = await _adapter.get(STORE_META, META_KEY);
      const vault = await _adapter.get(STORE_VAULT, VAULT_KEY);
      if (!meta || !vault) throw new Error('vault 不存在');
      return { meta, vault };
    }

    /** 归一化助记词：trim + 小写 + 单空格连接 */
    function normalizeMnemonic(words) {
      const arr = Array.isArray(words) ? words : String(words).trim().split(/\s+/);
      return arr.map(w => w.trim().toLowerCase()).filter(w => w.length > 0).join(' ');
    }

    /**
     * 初始化 vault（首次启动，v2 双包裹格式）
     * @param {string} password
     * @param {object} initialPlaintextData 任意可序列化数据
     * @returns {Promise<{meta: object, plaintext: object}>}
     */
    async function initialize(password, initialPlaintextData) {
      if (await exists()) throw new Error('vault 已存在');
      const salt = Crypto.randomBytes(Crypto.SALT_BYTES);
      const pwKey = await Crypto.deriveKey(password, salt);

      // dataKey：真正加密数据的密钥
      const dataKeyBytes = Crypto.randomBytes(32);
      const wrappedByPassword = await Crypto.encryptRaw(dataKeyBytes, pwKey);

      const dataKey = await Crypto.importAesKey(dataKeyBytes);
      const enc = await Crypto.encrypt(initialPlaintextData, dataKey);

      const now = Date.now();
      const meta = {
        version: '2.0',
        format: FORMAT,
        kdfAlgo: Crypto.ALGO_KDF_LABEL,
        cipher: Crypto.ALGO_CIPHER_LABEL,
        hmacAlgo: Crypto.ALGO_HMAC_LABEL,
        salt: Crypto.bytesToHex(salt),
        iterations: Crypto.PBKDF2_ITERATIONS,
        createdAt: now,
        updatedAt: now,
        recovery: null,               // 留存后写入 {verifyKey, mnemonicHash, ...}
        wrappedByPassword: wrappedByPassword,
        wrappedByMnemonic: null,      // 留存后写入
      };
      const vault = {
        version: '2.0',
        format: FORMAT,
        iv: enc.iv,
        ciphertext: enc.ciphertext,
        createdAt: now,
        updatedAt: now,
      };

      await _adapter.putMany({meta, vault});

      _meta = meta;
      _dataKey = dataKey;
      _dataKeyBytes = dataKeyBytes;
      _plain = JSON.parse(JSON.stringify(initialPlaintextData)); // deep clone
      _unlocked = true;
      return { meta, plaintext: _plain };
    }

    /**
     * 日常解锁：密码 → 解包裹 dataKey → 解密数据
     */
    async function unlock(password) {
      const { meta, vault } = await _loadBoth();
      if (meta.format !== FORMAT) throw new Error('VAULT_OLD_FORMAT');
      const salt = Crypto.hexToBytes(meta.salt);
      const pwKey = await Crypto.deriveKey(password, salt, meta.iterations);
      let dataKeyBytes;
      try {
        dataKeyBytes = await Crypto.decryptRaw(meta.wrappedByPassword, pwKey);
      } catch (e) {
        throw new Error('密码错误');
      }
      return _admit(meta, vault, dataKeyBytes);
    }

    /**
     * 找回解锁：助记词 → 解包裹 dataKey → 解密数据（数据保留的关键路径）
     * 错误助记词 → AES-GCM 认证失败 → 报「助记词不匹配」
     */
    async function unlockWithMnemonic(mnemonic) {
      const { meta, vault } = await _loadBoth();
      if (meta.format !== FORMAT) throw new Error('VAULT_OLD_FORMAT');
      if (!meta.wrappedByMnemonic) throw new Error('该工作台未留存助记词，无法找回');
      const mkBytes = await Crypto.sha256Bytes(Crypto.strToBytes(normalizeMnemonic(mnemonic)));
      const mk = await Crypto.importAesKey(mkBytes);
      let dataKeyBytes;
      try {
        dataKeyBytes = await Crypto.decryptRaw(meta.wrappedByMnemonic, mk);
      } catch (e) {
        throw new Error('助记词不匹配');
      }
      return _admit(meta, vault, dataKeyBytes);
    }

    /** 共通：持有 dataKey + 解密数据 + 进入解锁态 */
    async function _admit(meta, vault, dataKeyBytes) {
      const dataKey = await Crypto.importAesKey(dataKeyBytes);
      let plaintext;
      try {
        plaintext = await Crypto.decrypt(vault, dataKey);
      } catch (e) {
        throw new Error('数据损坏：密钥正确但数据解密失败');
      }
      _meta = meta;
      _dataKey = dataKey;
      _dataKeyBytes = dataKeyBytes;
      _plain = plaintext;
      _unlocked = true;
      return { meta, plaintext };
    }

    function assertUnlocked() {
      if (!_unlocked) throw new Error('vault 未解锁');
    }

    function getPlaintext() {
      assertUnlocked();
      return _plain;
    }

    function getMeta() {
      assertUnlocked();
      return _meta;
    }

    /**
     * 保存明文数据（dataKey 加密 → 写 IndexedDB）
     */
    async function save(newPlaintext) {
      assertUnlocked();
      // V2.0 P3.6.5: 快照 meta/dataKey,防 lock() 竞态(explore 数据安全审查问题 1)
      // 场景: 保存写盘往返毫秒窗口内用户点"锁定" → lock() 置 _meta=null/_dataKey=null
      // → 原代码 await put(STORE_VAULT) 后读 _meta 拿到 null → put(STORE_META, null)
      // → 下次启动 vault 判不存在 → first_run 覆盖, 旧数据只剩槽位冷备
      // 修复: 快照引用, put 永远写快照(lock 不影响本 save 已持有的引用)
      const meta = _meta;
      const dataKey = _dataKey;
      if (!meta || !dataKey) throw new Error('vault 未解锁');
      _plain = JSON.parse(JSON.stringify(newPlaintext));
      const enc = await Crypto.encrypt(_plain, dataKey);
      const now = Date.now();
      const vault = {
        version: '2.0',
        format: FORMAT,
        iv: enc.iv,
        ciphertext: enc.ciphertext,
        createdAt: meta.updatedAt,
        updatedAt: now,
      };
      meta.updatedAt = now;
      await _adapter.putMany({meta, vault});
      return _plain;
    }

    // ===== 恢复区（助记词留存 / 验证 / 重包裹）=====

    /** 用 meta.recovery.verifyKey（公开随机 32B）计算助记词哈希 */
    async function computeMnemonicHash(meta, mnemonic) {
      const keyBytes = Crypto.hexToBytes(meta.recovery.verifyKey);
      const hmacKey = await Crypto.importHmacKey(keyBytes);
      return Crypto.hmacSha256(hmacKey, normalizeMnemonic(mnemonic));
    }

    /**
     * 留存助记词（需解锁态）：
     * 1. verifyKey + mnemonicHash（公开元数据，供轻量归属校验）
     * 2. wrappedByMnemonic = AES-GCM(SHA-256(mnemonic), dataKey)——找回解数据用
     * 重复留存会覆盖旧包裹（旧助记词随之失效）
     */
    async function setRecovery(mnemonic) {
      assertUnlocked();
      if (!Array.isArray(mnemonic) || mnemonic.length !== 24) throw new Error('必须是 24 词助记词');
      if (!_meta.recovery || !_meta.recovery.verifyKey) {
        _meta.recovery = _meta.recovery || {};
        _meta.recovery.verifyKey = Crypto.bytesToHex(Crypto.randomBytes(Crypto.SALT_BYTES));
      }
      const mnemonicHash = await computeMnemonicHash(_meta, mnemonic);
      const mkBytes = await Crypto.sha256Bytes(Crypto.strToBytes(normalizeMnemonic(mnemonic)));
      const mk = await Crypto.importAesKey(mkBytes);
      const wrappedByMnemonic = await Crypto.encryptRaw(_dataKeyBytes, mk);

      const now = Date.now();
      _meta.recovery.mnemonicHash = mnemonicHash;
      _meta.recovery.mnemonicCreatedAt = now;
      _meta.recovery.mnemonicVersion = 'bip39-24-en';
      _meta.wrappedByMnemonic = wrappedByMnemonic;
      _meta.updatedAt = now;
      await _adapter.put(STORE_META, META_KEY, _meta);
      return _meta.recovery;
    }

    /**
     * 验证助记词是否属于当前 vault（无需解锁，轻量校验）
     * 注意：完整找回走 unlockWithMnemonic（能解数据才算真正验证）
     */
    async function verifyRecovery(mnemonic) {
      const meta = _meta || await _adapter.get(STORE_META, META_KEY);
      if (!meta || !meta.recovery || !meta.recovery.mnemonicHash || !meta.recovery.verifyKey) return false;
      const hash = await computeMnemonicHash(meta, mnemonic);
      return Crypto.constantTimeEqual(hash, meta.recovery.mnemonicHash);
    }

    /**
     * 是否需要留存助记词（未留存 = true）
     */
    async function needsRetention() {
      const meta = _meta || await _adapter.get(STORE_META, META_KEY);
      return !(meta && meta.recovery && meta.recovery.mnemonicHash && meta.wrappedByMnemonic);
    }

    /**
     * 重新包裹 dataKey 到新密码（换 salt；不动 wrappedByMnemonic）
     * 用途：找回流程设置新密码（此时无旧密码可验证）
     */
    async function rewrapPassword(newPassword) {
      assertUnlocked();
      const newSalt = Crypto.randomBytes(Crypto.SALT_BYTES);
      const newPwKey = await Crypto.deriveKey(newPassword, newSalt, _meta.iterations);
      _meta.wrappedByPassword = await Crypto.encryptRaw(_dataKeyBytes, newPwKey);
      const now = Date.now();
      _meta.salt = Crypto.bytesToHex(newSalt);
      _meta.updatedAt = now;
      await _adapter.put(STORE_META, META_KEY, _meta);
      return _meta;
    }

    /**
     * 作废旧助记词包裹（不换密码）
     * 用途：找回流程设置新密码后——找回用的那组词已暴露过一次，必须作废并重新留存
     * 注意：调用前必须已经 rewrapPassword 成功（新密码可解），否则会锁死数据
     */
    async function invalidateMnemonicWrap() {
      assertUnlocked();
      _meta.recovery = null;
      _meta.wrappedByMnemonic = null;
      await _adapter.put(STORE_META, META_KEY, _meta);
      return _meta;
    }

    /**
     * 改密（需解锁态 + 旧密码验证）：
     * 重新包裹 dataKey（数据不重加密）+ 清除 wrappedByMnemonic 强制重新留存
     */
    async function rotateKey(oldPassword, newPassword) {
      assertUnlocked();
      // 验证旧密码：派生 key 解包裹，解出的 dataKey 必须与内存一致
      const oldSalt = Crypto.hexToBytes(_meta.salt);
      const oldPwKey = await Crypto.deriveKey(oldPassword, oldSalt, _meta.iterations);
      try {
        const check = await Crypto.decryptRaw(_meta.wrappedByPassword, oldPwKey);
        if (Crypto.bytesToHex(check) !== Crypto.bytesToHex(_dataKeyBytes)) throw new Error('mismatch');
      } catch (e) {
        throw new Error('旧密码错误');
      }
      await rewrapPassword(newPassword);
      // 改密后旧助记词相关数据全部失效（包裹 + verifyKey/hash），强制重新留存
      // （RECOVERY-ARCH 风险 6：旧 mnemonic 残留 = 找回后门）
      _meta.recovery = null;
      _meta.wrappedByMnemonic = null;
      await _adapter.put(STORE_META, META_KEY, _meta);
      return _meta;
    }

    /**
     * 锁定：清空内存中的 key + plaintext
     */
    function lock() {
      _dataKey = null;
      _dataKeyBytes = null;
      _plain = null;
      _meta = null;
      _unlocked = false;
    }

    function isUnlocked() { return _unlocked; }

    /**
     * 导出：返回 {meta, vault} 序列化的 JSON（不含密码，包裹层已加密）
     */
    async function exportJSON() {
      const meta = await _adapter.get(STORE_META, META_KEY);
      const vault = await _adapter.get(STORE_VAULT, VAULT_KEY);
      if (!meta || !vault) throw new Error('vault 不存在');
      return { meta, vault };
    }

    /**
     * 导入：清空现有 → 写入导入的 JSON
     */
    async function importJSON(data) {
      if (!data || !data.meta || !data.vault) throw new Error('导入数据格式错误');
      await _adapter.putMany({meta:data.meta, vault:data.vault});
      lock();
    }

    /**
     * 清空所有（重置）
     */
    async function wipe() {
      await _adapter.clearAll();
      lock();
    }

    return {
      exists, migrateIfNeeded, initialize, unlock, unlockWithMnemonic,
      save, rotateKey, rewrapPassword, invalidateMnemonicWrap,
      lock, isUnlocked, getPlaintext, getMeta,
      setRecovery, verifyRecovery, needsRetention,
      _normalizeMnemonic: normalizeMnemonic,
      exportJSON, importJSON, wipe,
    };
  }

  global.VaultStore = {
  DB_NAME, DB_VERSION, STORE_META, STORE_VAULT,
  createVaultStore,
  createIDBAdapter,
  createMemoryAdapter,
  createRemoteCacheAdapter,
  createPywebviewAdapter,
  createHttpFileAdapter,
  createCloudAdapter,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = global.VaultStore;
}
})(typeof globalThis !== 'undefined' ? globalThis : this);
