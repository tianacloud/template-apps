/**
 * BIP-39 助记词模块（Phase 2）
 * 标准 256 bits 熵 + 8 bits checksum → 24 词
 * 标准 PBKDF2-HMAC-SHA512(mnemonic, "mnemonic"+passphrase, 2048) → 64 bytes seed
 *
 * 浏览器 + Node 双兼容（通过 globalThis）
 */
(function (global) {
  global = global || (typeof globalThis !== 'undefined' ? globalThis : this);
  const WORDLIST = global.BIP39_WORDLIST;
  if (!WORDLIST || WORDLIST.length !== 2048) throw new Error('BIP-39 词表未加载或异常');

  const WORD_TO_INDEX = new Map();
  for (let i = 0; i < WORDLIST.length; i++) WORD_TO_INDEX.set(WORDLIST[i], i);

  const subtle = global.crypto && global.crypto.subtle;
  if (!subtle) throw new Error('Web Crypto API 不可用');

  // ===== 工具 =====
  function bytesToBits(bytes) {
    const bits = [];
    for (const b of bytes) {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    }
    return bits;
  }

  function bitsToBytes(bits) {
    const out = new Uint8Array(Math.ceil(bits.length / 8));
    for (let i = 0; i < out.length; i++) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | (bits[i * 8 + j] || 0);
      out[i] = v;
    }
    return out;
  }

  function bitsToIndices(bits, wordCount) {
    // 每词 11 bits（2048 = 2^11）
    const out = [];
    for (let i = 0; i < wordCount; i++) {
      let idx = 0;
      for (let j = 0; j < 11; j++) idx = (idx << 1) | bits[i * 11 + j];
      out.push(idx);
    }
    return out;
  }

  function indicesToBits(indices) {
    const bits = [];
    for (const idx of indices) {
      for (let j = 10; j >= 0; j--) bits.push((idx >> j) & 1);
    }
    return bits;
  }

  // ===== SHA-256 =====
  async function sha256(data) {
    const hash = await subtle.digest('SHA-256', data);
    return new Uint8Array(hash);
  }

  // ===== 核心 API =====

  /**
   * 生成 24 词助记词（256 bits 熵）
   * @param {Uint8Array} [entropy] 可选：传入指定的熵（用于确定性测试）
   * @returns {Promise<string[]>}
   */
  async function generateMnemonic(entropy) {
    if (!entropy) entropy = global.crypto.getRandomValues(new Uint8Array(32));
    if (entropy.length !== 32) throw new Error('entropy 必须是 32 字节（256 bits）');

    const hash = await sha256(entropy);
    // checksum = SHA256(entropy) 的前 8 bits（ENT/32 = 256/32 = 8）
    const checksumBits = bytesToBits(hash).slice(0, 8);
    const allBits = bytesToBits(entropy).concat(checksumBits); // 264 bits
    const indices = bitsToIndices(allBits, 24);

    return indices.map(i => WORDLIST[i]);
  }

  /**
   * 校验助记词：词数 + 词表 + checksum
   * @param {string[]} words
   * @returns {Promise<boolean>}
   */
  async function validateMnemonic(words) {
    if (!Array.isArray(words) || words.length !== 24) return false;
    // 检查每个词都在词表里
    const indices = [];
    for (const w of words) {
      const idx = WORD_TO_INDEX.get(w);
      if (idx === undefined) return false;
      indices.push(idx);
    }
    const bits = indicesToBits(indices); // 264 bits
    const entropyBits = bits.slice(0, 256);
    const checksumBits = bits.slice(256); // 8 bits
    const entropy = bitsToBytes(entropyBits); // 32 bytes
    const hash = await sha256(entropy);
    const expectedChecksum = bytesToBits(hash).slice(0, 8);
    // 逐位比较
    for (let i = 0; i < 8; i++) {
      if (checksumBits[i] !== expectedChecksum[i]) return false;
    }
    return true;
  }

  /**
   * 助记词 → 32 字节 entropy（用于 HMAC 验证 mnemonicHash）
   * @param {string[]} words
   * @returns {Promise<Uint8Array>}
   */
  async function mnemonicToEntropy(words) {
    if (words.length !== 24) throw new Error('必须是 24 词');
    const indices = words.map(w => {
      const idx = WORD_TO_INDEX.get(w);
      if (idx === undefined) throw new Error('词表外词: ' + w);
      return idx;
    });
    const bits = indicesToBits(indices);
    return bitsToBytes(bits.slice(0, 256));
  }

  /**
   * mnemonic → 64 bytes seed（PBKDF2-HMAC-SHA512, 2048 iter, salt="mnemonic"+passphrase）
   * @param {string[]} words
   * @param {string} [passphrase=''] BIP-39 passphrase（V1 不使用，留接口）
   * @returns {Promise<Uint8Array>}
   */
  async function mnemonicToSeed(words, passphrase = '') {
    const mnemonic = words.join(' ');
    const salt = strToBytes('mnemonic' + passphrase);
    const baseKey = await subtle.importKey('raw', strToBytes(mnemonic), { name: 'PBKDF2' }, false, ['deriveBits']);
    const bits = await subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 2048, hash: 'SHA-512' },
      baseKey,
      512
    );
    return new Uint8Array(bits);
  }

  function strToBytes(s) { return new TextEncoder().encode(s); }

  // ===== 公开 API =====
  global.Bip39 = {
    // 常量
    WORD_COUNT: 24,
    ENTROPY_BITS: 256,
    CHECKSUM_BITS: 8,
    // 字典访问
    WORD_TO_INDEX,
    // 核心
    generateMnemonic,
    validateMnemonic,
    mnemonicToEntropy,
    mnemonicToSeed,
    // 工具（导出供测试）
    _bytesToBits: bytesToBits,
    _bitsToBytes: bitsToBytes,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Bip39;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);