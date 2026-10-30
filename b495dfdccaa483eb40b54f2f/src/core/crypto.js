/**
 * Crypto 模块（Phase 1）
 * 提供：PBKDF2 密钥派生 / AES-GCM 加解密 / HMAC-SHA256 / 工具函数
 * 浏览器 + Node 双兼容（globalThis 挂全局）
 */

(function (global) {
  const subtle = global.crypto && global.crypto.subtle;
  if (!subtle) throw new Error('Web Crypto API 不可用（需 HTTPS / localhost / Node 18+）');

  // ===== 常量 =====
  const PBKDF2_ITERATIONS = 600000;  // OWASP 2023 推荐
  const KEY_BITS = 256;              // AES-256
  const IV_BYTES = 12;               // AES-GCM 推荐
  const SALT_BYTES = 32;             // 256 bits
  const ALGO_KDF = 'PBKDF2';           // Web Crypto 算法名（hash 单独传）
  const ALGO_CIPHER = 'AES-GCM';        // 长度通过 length 参数传
  const ALGO_HMAC = 'HMAC';             // hash 单独传
  const HASH = 'SHA-256';

  // 元数据：用于序列化时写入 vault meta.json
  const ALGO_KDF_LABEL = 'PBKDF2-SHA256';
  const ALGO_CIPHER_LABEL = 'AES-GCM-256';
  const ALGO_HMAC_LABEL = 'HMAC-SHA256';

  // ===== 字节工具 =====
  function randomBytes(n) {
    const b = new Uint8Array(n);
    global.crypto.getRandomValues(b);
    return b;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    if (hex.length % 2 !== 0) throw new Error('hex 长度必须为偶数');
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  function strToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function bytesToStr(bytes) {
    return new TextDecoder().decode(bytes);
  }

  // ===== PBKDF2 密钥派生 =====
  /**
   * 从密码派生 AES-GCM 加密密钥
   * @param {string} password 用户密码
   * @param {Uint8Array} salt 32 字节盐
   * @param {number} [iterations=600000] PBKDF2 迭代次数
   * @returns {Promise<CryptoKey>}
   */
  async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS) {
    if (typeof password !== 'string') throw new TypeError('password 必须是字符串');
    if (!(salt instanceof Uint8Array)) throw new TypeError('salt 必须是 Uint8Array');
    if (salt.length !== SALT_BYTES) throw new RangeError('salt 必须是 ' + SALT_BYTES + ' 字节');
    const baseKey = await subtle.importKey(
      'raw', strToBytes(password),
      { name: ALGO_KDF, hash: HASH }, false, ['deriveKey']
    );
    return subtle.deriveKey(
      { name: ALGO_KDF, salt, iterations, hash: HASH },
      baseKey,
      { name: ALGO_CIPHER, length: KEY_BITS },
      false,                     // non-extractable
      ['encrypt', 'decrypt']
    );
  }

  // ===== AES-GCM 加密 =====
  /**
   * 加密任意对象（先 JSON.stringify）
   * @param {object|string} plaintext
   * @param {CryptoKey} key
   * @returns {Promise<{iv: string, ciphertext: string}>}  hex 编码
   */
  async function encrypt(plaintext, key) {
    const data = typeof plaintext === 'string' ? strToBytes(plaintext) : strToBytes(JSON.stringify(plaintext));
    const iv = randomBytes(IV_BYTES);
    const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    return { iv: bytesToHex(iv), ciphertext: bytesToHex(new Uint8Array(ct)) };
  }

  /**
   * 解密
   * @param {{iv: string, ciphertext: string}} payload hex 编码
   * @param {CryptoKey} key
   * @returns {Promise<object|string>} 默认 JSON.parse；字符串可指定 asString: true
   */
  async function decrypt(payload, key, asString = false) {
    const iv = hexToBytes(payload.iv);
    const ct = hexToBytes(payload.ciphertext);
    const pt = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    const text = bytesToStr(new Uint8Array(pt));
    return asString ? text : JSON.parse(text);
  }

  // ===== HMAC-SHA256 =====
  /**
   * 用密钥对数据做 HMAC-SHA256，返回 hex
   * @param {CryptoKey} key
   * @param {string|Uint8Array} data
   * @returns {Promise<string>}  hex
   */
  async function hmacSha256(key, data) {
    const bytes = typeof data === 'string' ? strToBytes(data) : data;
    const sig = await subtle.sign('HMAC', key, bytes);
    return bytesToHex(new Uint8Array(sig));
  }

  /**
   * 创建 HMAC 用的密钥（从原始字节）
   * @param {Uint8Array} raw 32 字节
   * @returns {Promise<CryptoKey>}
   */
  async function importHmacKey(raw) {
    return subtle.importKey('raw', raw, { name: ALGO_HMAC, hash: HASH }, false, ['sign']);
  }

  /**
   * 从原始字节导入 AES-GCM 密钥（dataKey 双包裹用）
   * @param {Uint8Array} raw 32 字节
   * @returns {Promise<CryptoKey>}
   */
  async function importAesKey(raw) {
    if (!(raw instanceof Uint8Array) || raw.length !== 32) {
      throw new TypeError('AES key 必须是 32 字节 Uint8Array');
    }
    return subtle.importKey('raw', raw, { name: ALGO_CIPHER }, false, ['encrypt', 'decrypt']);
  }

  /** SHA-256 摘要（助记词 → key material） */
  async function sha256Bytes(bytes) {
    return new Uint8Array(await subtle.digest(HASH, bytes));
  }

  /**
   * 加密原始字节（dataKey 包裹用，区别于 encrypt 的 JSON 序列化）
   * @param {Uint8Array} bytes
   * @param {CryptoKey} key
   * @returns {Promise<{iv: string, ciphertext: string}>} hex 编码
   */
  async function encryptRaw(bytes, key) {
    const iv = randomBytes(IV_BYTES);
    const ct = await subtle.encrypt({ name: ALGO_CIPHER, iv }, key, bytes);
    return { iv: bytesToHex(iv), ciphertext: bytesToHex(new Uint8Array(ct)) };
  }

  /**
   * 解密原始字节（返回 Uint8Array，不 JSON.parse）
   * @param {{iv: string, ciphertext: string}} payload
   * @param {CryptoKey} key
   * @returns {Promise<Uint8Array>}
   */
  async function decryptRaw(payload, key) {
    const iv = hexToBytes(payload.iv);
    const ct = hexToBytes(payload.ciphertext);
    const pt = await subtle.decrypt({ name: ALGO_CIPHER, iv }, key, ct);
    return new Uint8Array(pt);
  }

  /**
   * 从密码派生 HMAC 密钥（与 deriveKey 不同用途）
   * @param {string} password
   * @param {Uint8Array} salt
   * @param {number} [iterations=600000]
   * @returns {Promise<CryptoKey>}
   */
  async function deriveHmacKey(password, salt, iterations = PBKDF2_ITERATIONS) {
    const baseKey = await subtle.importKey('raw', strToBytes(password), { name: ALGO_KDF, hash: HASH }, false, ['deriveKey']);
    return subtle.deriveKey(
      { name: ALGO_KDF, salt, iterations, hash: HASH },
      baseKey,
      { name: ALGO_HMAC, hash: HASH },
      false, ['sign']
    );
  }

  // ===== 工具：常量时间字符串比较（防侧信道） =====
  function constantTimeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  // ===== 公开 API =====
  global.Crypto = {
    // 常量
    PBKDF2_ITERATIONS,
    KEY_BITS,
    IV_BYTES,
    SALT_BYTES,
    ALGO_KDF,
    ALGO_CIPHER,
    ALGO_HMAC,
    ALGO_KDF_LABEL,
    ALGO_CIPHER_LABEL,
    ALGO_HMAC_LABEL,
    // 字节工具
    randomBytes,
    bytesToHex,
    hexToBytes,
    strToBytes,
    bytesToStr,
    // 密码学
    deriveKey,
    encrypt,
    decrypt,
    hmacSha256,
    importHmacKey,
    deriveHmacKey,
    importAesKey,
    sha256Bytes,
    encryptRaw,
    decryptRaw,
    // 工具
    constantTimeEqual,
  };

  // Node 测试兼容：保留 module.exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Crypto;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);