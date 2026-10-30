import { loadStorage, writeStorage } from './storage.js';
document.documentElement.dataset.theme="light";
document.body.innerHTML = "\n<div class=\"app\">\n  <header class=\"topbar\">\n    <div class=\"brand\">\n      <div class=\"logo\">1024</div>\n      <div class=\"brand-txt\">\n        <h1>DevKit 1024</h1>\n        <p>程序员效率工具箱 · 12 款纯前端工具</p>\n      </div>\n    </div>\n    <div class=\"search\">\n      <span class=\"ico\">&#128269;</span>\n      <input aria-label=\"搜索工具\" autocomplete=\"off\" id=\"q\" placeholder=\"搜索工具，如 JSON、正则、Cron…\" type=\"search\">\n      <kbd>&#8984;K</kbd>\n    </div>\n    <div class=\"top-actions\">\n      <button class=\"btn btn-mini\" id=\"helpBtn\" type=\"button\">使用说明</button>\n      <button class=\"btn btn-mini\" id=\"themeBtn\" type=\"button\">&#9788; 深色</button>\n    </div>\n  </header>\n  <div class=\"body\">\n    <nav aria-label=\"工具导航\" class=\"sidebar\" id=\"nav\"></nav>\n    <main class=\"main\" data-mode=\"home\" id=\"main\"></main>\n  </div>\n</div>\n\n<div aria-live=\"polite\" id=\"toast\" role=\"status\"></div>\n\n<div class=\"modal-mask\" id=\"help\">\n  <div class=\"modal\">\n    <h3>使用说明</h3>\n    <div class=\"hint-box\">\n      <p><b>工具计算在浏览器中进行。</b>输入与设置保存在此应用的云数据库中，请勿输入不适合保存的秘密。</p>\n      <p><b>键盘快捷键</b></p>\n      <ul>\n        <li><code>⌘K</code> / <code>Ctrl+K</code>：唤起搜索框</li>\n        <li><code>Enter</code>：在搜索框中打开第一个匹配工具</li>\n        <li><code>Esc</code>：清空搜索 / 关闭弹窗</li>\n      </ul>\n      <p><b>数据保存</b></p>\n      <ul>\n        <li>输入框内容、收藏和主题会自动保存在云端，刷新后可继续使用。</li>\n        <li>点击工具右上角的「☆ 收藏」可把它固定到侧边栏顶部的「常用」分组。</li>\n      </ul>\n      <p><b>关于实现</b></p>\n      <ul>\n        <li>MD5 / SHA-1 / SHA-256 / SHA-512 / HMAC 均为本页纯 JavaScript 实现，未使用 Web Crypto，因此离线环境同样可用。</li>\n        <li>进制换算基于 BigInt，可处理远超 Number 安全范围的超大整数。</li>\n        <li>随机数取自 <code>crypto.getRandomValues</code> 密码学随机源。</li>\n      </ul>\n    </div>\n    <button class=\"btn btn-primary close\" id=\"helpClose\" type=\"button\">知道了</button>\n  </div>\n</div>\n\n";

// 本文件由构建脚本自动生成，请勿手工修改

var MD5_K = [
  0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
  0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
  0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
  0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
  0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
  0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
  0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
  0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
  0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
  0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
  0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
  0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
  0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
  0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
  0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
  0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
];

var SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

var SHA256_H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

var SHA512_K = [
  0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn, 0x3956c25bf348b538n, 0x59f111f1b605d019n,
  0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n, 0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n, 0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n,
  0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n, 0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
  0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n, 0xc6e00bf33da88fc2n, 0xd5a79147930aa725n,
  0x06ca6351e003826fn, 0x142929670a0e6e70n, 0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
  0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn, 0xa2bfe8a14cf10364n, 0xa81a664bbc423001n,
  0xc24b8b70d0f89791n, 0xc76c51a30654be30n, 0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n, 0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn,
  0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n, 0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
  0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn, 0xca273eceea26619cn, 0xd186b8c721c0c207n,
  0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n, 0x06f067aa72176fban, 0x0a637dc5a2c898a6n, 0x113f9804bef90daen, 0x1b710b35131c471bn,
  0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bebcn, 0x431d67c49c100d4cn, 0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an,
  0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n,
];

var SHA512_H0 = [
  0x6a09e667f3bcc908n, 0xbb67ae8584caa73bn, 0x3c6ef372fe94f82bn, 0xa54ff53a5f1d36f1n, 0x510e527fade682d1n, 0x9b05688c2b3e6c1fn,
  0x1f83d9abfb41bd6bn, 0x5be0cd19137e2179n,
];



/* ============================================================
 * DevKit 1024 · 核心算法层
 * 纯函数实现，无 DOM 依赖，可单独在 Node 中做正确性验证。
 * ============================================================ */
'use strict';

/* ---------------- 通用工具 ---------------- */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}

function bytesToHex(u8) {
  var out = '';
  for (var i = 0; i < u8.length; i++) {
    var b = u8[i].toString(16);
    out += b.length === 1 ? '0' + b : b;
  }
  return out;
}

function hexToBytes(hex) {
  var clean = String(hex).replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) throw new Error('Hex 长度必须为偶数');
  var out = new Uint8Array(clean.length / 2);
  for (var i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

function utf8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  var out = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 128) out.push(c);
    else if (c < 2048) out.push(192 | (c >> 6), 128 | (c & 63));
    else if (c < 55296 || c > 57343) out.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    else {
      i++;
      var c2 = str.charCodeAt(i);
      var cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(240 | (cp >> 18), 128 | ((cp >> 12) & 63), 128 | ((cp >> 6) & 63), 128 | (cp & 63));
    }
  }
  return new Uint8Array(out);
}

function bytesToUtf8(u8) {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(u8);
  var out = '', i = 0;
  while (i < u8.length) {
    var b = u8[i];
    if (b < 128) { out += String.fromCharCode(b); i += 1; }
    else if (b < 224) { out += String.fromCharCode(((b & 31) << 6) | (u8[i + 1] & 63)); i += 2; }
    else if (b < 240) { out += String.fromCharCode(((b & 15) << 12) | ((u8[i + 1] & 63) << 6) | (u8[i + 2] & 63)); i += 3; }
    else {
      var cp = ((b & 7) << 18) | ((u8[i + 1] & 63) << 12) | ((u8[i + 2] & 63) << 6) | (u8[i + 3] & 63);
      out += String.fromCodePoint(cp); i += 4;
    }
  }
  return out;
}

function b64EncodeBytes(u8) {
  var bin = '';
  for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}

function b64DecodeToBytes(str) {
  var bin = atob(String(str).replace(/\s+/g, ''));
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64Encode(str) { return b64EncodeBytes(utf8Bytes(str)); }
function b64Decode(str) { return bytesToUtf8(b64DecodeToBytes(str)); }

/* ---------------- MD5 ---------------- */

var MD5_S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];

function rotl32(x, n) { return ((x << n) | (x >>> (32 - n))) >>> 0; }

function md5Bytes(msg) {
  var h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  var ml = msg.length;
  var total = Math.ceil((ml + 9) / 64) * 64;
  var buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  var dv = new DataView(buf.buffer);
  var bits = ml * 8;
  dv.setUint32(total - 8, bits >>> 0, true);
  dv.setUint32(total - 4, Math.floor(bits / 4294967296), true);
  var m = new Int32Array(16);
  for (var i = 0; i < total; i += 64) {
    for (var j = 0; j < 16; j++) m[j] = dv.getInt32(i + j * 4, true);
    var a = h[0], b = h[1], c = h[2], d = h[3];
    for (var t = 0; t < 64; t++) {
      var f, g;
      if (t < 16) { f = (b & c) | ((~b) & d); g = t; }
      else if (t < 32) { f = (d & b) | ((~d) & c); g = (5 * t + 1) % 16; }
      else if (t < 48) { f = b ^ c ^ d; g = (3 * t + 5) % 16; }
      else { f = c ^ (b | (~d)); g = (7 * t) % 16; }
      f = f >>> 0;
      var tmp = d;
      d = c;
      c = b;
      b = (b + rotl32((a + f + MD5_K[t] + m[g]) >>> 0, MD5_S[t])) >>> 0;
      a = tmp;
    }
    h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
  }
  var out = new Uint8Array(16);
  var odv = new DataView(out.buffer);
  for (var q = 0; q < 4; q++) odv.setUint32(q * 4, h[q] >>> 0, true);
  return out;
}

/* ---------------- SHA-1 ---------------- */

function sha1Bytes(msg) {
  var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  var ml = msg.length;
  var total = Math.ceil((ml + 9) / 64) * 64;
  var buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  var dv = new DataView(buf.buffer);
  var bits = ml * 8;
  dv.setUint32(total - 8, Math.floor(bits / 4294967296), false);
  dv.setUint32(total - 4, bits >>> 0, false);
  var w = new Int32Array(80);
  for (var i = 0; i < total; i += 64) {
    for (var t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4, false);
    for (var t2 = 16; t2 < 80; t2++) {
      var v = w[t2 - 3] ^ w[t2 - 8] ^ w[t2 - 14] ^ w[t2 - 16];
      w[t2] = (v << 1) | (v >>> 31);
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];
    for (var t3 = 0; t3 < 80; t3++) {
      var f, k;
      if (t3 < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
      else if (t3 < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (t3 < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      var temp = (((a << 5) | (a >>> 27)) + (f >>> 0) + e + k + w[t3]) >>> 0;
      e = d; d = c; c = ((b << 30) | (b >>> 2)) >>> 0; b = a; a = temp;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0; H[4] = (H[4] + e) >>> 0;
  }
  var out = new Uint8Array(20);
  var odv = new DataView(out.buffer);
  for (var q2 = 0; q2 < 5; q2++) odv.setUint32(q2 * 4, H[q2] >>> 0, false);
  return out;
}

/* ---------------- SHA-256 ---------------- */

function sha256Bytes(msg) {
  var H = SHA256_H0.slice();
  var ml = msg.length;
  var total = Math.ceil((ml + 9) / 64) * 64;
  var buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  var dv = new DataView(buf.buffer);
  var bits = ml * 8;
  dv.setUint32(total - 8, Math.floor(bits / 4294967296), false);
  dv.setUint32(total - 4, bits >>> 0, false);
  var w = new Int32Array(64);
  for (var i = 0; i < total; i += 64) {
    for (var t = 0; t < 16; t++) w[t] = dv.getInt32(i + t * 4, false);
    for (var t2 = 16; t2 < 64; t2++) {
      var s0 = (rotr32(w[t2 - 15], 7) ^ rotr32(w[t2 - 15], 18) ^ (w[t2 - 15] >>> 3)) >>> 0;
      var s1 = (rotr32(w[t2 - 2], 17) ^ rotr32(w[t2 - 2], 19) ^ (w[t2 - 2] >>> 10)) >>> 0;
      w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) >>> 0;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (var t3 = 0; t3 < 64; t3++) {
      var S1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
      var ch = ((e & f) ^ ((~e) & g)) >>> 0;
      var tmp1 = (h + S1 + ch + SHA256_K[t3] + w[t3]) >>> 0;
      var S0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
      var maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      var tmp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + tmp1) >>> 0; d = c; c = b; b = a; a = (tmp1 + tmp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  var out = new Uint8Array(32);
  var odv = new DataView(out.buffer);
  for (var q3 = 0; q3 < 8; q3++) odv.setUint32(q3 * 4, H[q3] >>> 0, false);
  return out;
}

function rotr32(x, n) { return ((x >>> n) | (x << (32 - n))) >>> 0; }

/* ---------------- SHA-512（BigInt 实现，无外部依赖） ---------------- */

var M64 = 0xffffffffffffffffn;

function rotr64(x, n) { return ((x >> n) | (x << (64n - n))) & M64; }

function sha512Bytes(msg) {
  var H = SHA512_H0.slice();
  var ml = msg.length;
  var total = Math.ceil((ml + 17) / 128) * 128;
  var buf = new Uint8Array(total);
  buf.set(msg);
  buf[ml] = 0x80;
  var dv = new DataView(buf.buffer);
  var bits = BigInt(ml) * 8n;
  dv.setUint32(total - 16, 0, false);
  dv.setUint32(total - 12, 0, false);
  dv.setUint32(total - 8, Number((bits >> 32n) & 0xffffffffn), false);
  dv.setUint32(total - 4, Number(bits & 0xffffffffn), false);
  var w = new Array(80);
  for (var i = 0; i < total; i += 128) {
    for (var t = 0; t < 16; t++) {
      w[t] = (BigInt(dv.getUint32(i + t * 8, false)) << 32n) | BigInt(dv.getUint32(i + t * 8 + 4, false));
    }
    for (var t2 = 16; t2 < 80; t2++) {
      var x1 = w[t2 - 15], x2 = w[t2 - 2];
      var s0 = rotr64(x1, 1n) ^ rotr64(x1, 8n) ^ (x1 >> 7n);
      var s1 = rotr64(x2, 19n) ^ rotr64(x2, 61n) ^ (x2 >> 6n);
      w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) & M64;
    }
    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (var t3 = 0; t3 < 80; t3++) {
      var S1 = rotr64(e, 14n) ^ rotr64(e, 18n) ^ rotr64(e, 41n);
      var ch = (e & f) ^ ((~e) & g);
      var tmp1 = (h + S1 + ch + SHA512_K[t3] + w[t3]) & M64;
      var S0 = rotr64(a, 28n) ^ rotr64(a, 34n) ^ rotr64(a, 39n);
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var tmp2 = (S0 + maj) & M64;
      h = g; g = f; f = e; e = (d + tmp1) & M64; d = c; c = b; b = a; a = (tmp1 + tmp2) & M64;
    }
    H[0] = (H[0] + a) & M64; H[1] = (H[1] + b) & M64; H[2] = (H[2] + c) & M64; H[3] = (H[3] + d) & M64;
    H[4] = (H[4] + e) & M64; H[5] = (H[5] + f) & M64; H[6] = (H[6] + g) & M64; H[7] = (H[7] + h) & M64;
  }
  var out = new Uint8Array(64);
  var odv = new DataView(out.buffer);
  for (var q4 = 0; q4 < 8; q4++) {
    var v = H[q4];
    odv.setUint32(q4 * 8, Number((v >> 32n) & 0xffffffffn), false);
    odv.setUint32(q4 * 8 + 4, Number(v & 0xffffffffn), false);
  }
  return out;
}

/* ---------------- HMAC ---------------- */

function hmacBytes(hashFn, blockSize, keyBytes, msgBytes) {
  var k = keyBytes;
  if (k.length > blockSize) k = hashFn(k);
  var kb = new Uint8Array(blockSize);
  kb.set(k);
  var ipad = new Uint8Array(blockSize + msgBytes.length);
  var i;
  for (i = 0; i < blockSize; i++) ipad[i] = kb[i] ^ 0x36;
  ipad.set(msgBytes, blockSize);
  var inner = hashFn(ipad);
  var opad = new Uint8Array(blockSize + inner.length);
  for (i = 0; i < blockSize; i++) opad[i] = kb[i] ^ 0x5c;
  opad.set(inner, blockSize);
  return hashFn(opad);
}

var HASH_ALGOS = {
  'MD5': { fn: md5Bytes, block: 64 },
  'SHA-1': { fn: sha1Bytes, block: 64 },
  'SHA-256': { fn: sha256Bytes, block: 64 },
  'SHA-512': { fn: sha512Bytes, block: 128 }
};

function computeHash(algo, text, outFmt, hmacKey) {
  var conf = HASH_ALGOS[algo];
  if (!conf) throw new Error('不支持的算法：' + algo);
  var body = utf8Bytes(text);
  var raw;
  if (hmacKey) {
    raw = hmacBytes(conf.fn, conf.block, utf8Bytes(hmacKey), body);
  } else {
    raw = conf.fn(body);
  }
  return outFmt === 'base64' ? b64EncodeBytes(raw) : bytesToHex(raw);
}

/* ---------------- JSON ---------------- */

function jsonEscapeHtml(text) {
  var re = /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}\[\],:])/g;
  var out = '', last = 0, m;
  while ((m = re.exec(text)) !== null) {
    out += escapeHtml(text.slice(last, m.index));
    var tok = m[0];
    if (m[1] !== undefined) {
      var isKey = /^\s*:/.test(text.slice(re.lastIndex));
      out += '<span class="' + (isKey ? 'tk-key' : 'tk-str') + '">' + escapeHtml(tok) + '</span>';
    } else if (m[2] !== undefined) {
      out += '<span class="tk-num">' + escapeHtml(tok) + '</span>';
    } else if (m[3] !== undefined) {
      out += '<span class="tk-kw">' + tok + '</span>';
    } else {
      out += '<span class="tk-pun">' + escapeHtml(tok) + '</span>';
    }
    last = re.lastIndex;
  }
  out += escapeHtml(text.slice(last));
  return out;
}

function jsonPathGet(root, path) {
  var p = String(path).trim();
  if (!p) throw new Error('请填写取值路径');
  p = p.replace(/^\$/, '').replace(/^\./, '');
  if (!p) return root;
  var tokens = [];
  var i = 0;
  while (i < p.length) {
    var ch = p[i];
    if (ch === '.') { i++; continue; }
    if (ch === '[') {
      var close = p.indexOf(']', i);
      if (close < 0) throw new Error('路径缺少 ]');
      var inner = p.slice(i + 1, close).trim();
      if (/^-?\d+$/.test(inner)) tokens.push(parseInt(inner, 10));
      else if (/^["'].*["']$/.test(inner)) tokens.push(inner.slice(1, -1));
      else throw new Error('不支持的片段：[' + inner + ']');
      i = close + 1;
      continue;
    }
    var j = i;
    while (j < p.length && p[j] !== '.' && p[j] !== '[') j++;
    tokens.push(p.slice(i, j));
    i = j;
  }
  var cur = root;
  for (var t = 0; t < tokens.length; t++) {
    if (cur === null || cur === undefined) throw new Error('路径在第 ' + (t + 1) + ' 段取到空值');
    cur = cur[tokens[t]];
  }
  return cur;
}

function sortJsonDeep(v) {
  if (Array.isArray(v)) return v.map(sortJsonDeep);
  if (v && typeof v === 'object') {
    var keys = Object.keys(v).sort();
    var o = {};
    keys.forEach(function (k) { o[k] = sortJsonDeep(v[k]); });
    return o;
  }
  return v;
}

/* ---------------- 正则 ---------------- */

function regexEscapeHtml(text, ranges) {
  var out = '', last = 0;
  ranges.forEach(function (r) {
    if (r.start > last) out += escapeHtml(text.slice(last, r.start));
    var seg = text.slice(r.start, r.end);
    if (seg.length === 0) {
      out += '<span class="rx-empty"></span>';
    } else {
      out += '<span class="rx-hit' + (r.group === undefined ? '' : ' rx-g' + (r.group % 5)) + '">' + escapeHtml(seg) + '</span>';
    }
    last = r.end;
  });
  out += escapeHtml(text.slice(last));
  return out;
}

function regexScan(pattern, flags, text) {
  var safeFlags = String(flags || '').replace(/[^gimsuy]/g, '');
  var re = new RegExp(pattern, safeFlags);
  var ranges = [];
  var count = 0;
  var global = safeFlags.indexOf('g') >= 0;
  var single = new RegExp(pattern, safeFlags.replace(/[gy]/g, ''));
  var m;
  if (global) {
    re.lastIndex = 0;
    var guard = 0;
    while ((m = re.exec(text)) !== null && guard < 20000) {
      guard++;
      ranges.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1) });
      count++;
      if (m[0].length === 0) re.lastIndex++;
      if (re.lastIndex > text.length) break;
    }
  } else {
    m = single.exec(text);
    if (m) {
      ranges.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1) });
      count = 1;
    }
  }
  return { ranges: ranges, count: count, first: ranges.length ? ranges[0] : null, regexp: re };
}

/* ---------------- 时间 ---------------- */

var TZ_LIST = [
  { id: 'Asia/Shanghai', label: '北京 / CST' },
  { id: 'Asia/Tokyo', label: '东京 / JST' },
  { id: 'Asia/Kolkata', label: '班加罗尔 / IST' },
  { id: 'Europe/London', label: '伦敦 / GMT' },
  { id: 'Europe/Berlin', label: '柏林 / CET' },
  { id: 'America/New_York', label: '纽约 / EST' },
  { id: 'America/Los_Angeles', label: '洛杉矶 / PST' },
  { id: 'UTC', label: '协调世界时 / UTC' }
];

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function formatDate(date, tz) {
  try {
    var fmt = new Intl.DateTimeFormat('zh-CN', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    return fmt.format(date).replace(/\//g, '-');
  } catch (e) {
    return date.toISOString().replace('T', ' ').slice(0, 19);
  }
}

function tzOffsetLabel(tz, date) {
  try {
    var fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    var parts = fmt.formatToParts(date);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].type === 'timeZoneName') return parts[i].value;
    }
  } catch (e) { /* ignore */ }
  return '';
}

function relativeTime(ms) {
  var diff = Date.now() - ms;
  var abs = Math.abs(diff);
  var units = [
    [31536000000, '年'], [2592000000, '个月'], [604800000, '周'],
    [86400000, '天'], [3600000, '小时'], [60000, '分钟'], [1000, '秒']
  ];
  for (var i = 0; i < units.length; i++) {
    if (abs >= units[i][0]) {
      var n = Math.floor(abs / units[i][0]);
      return diff >= 0 ? n + units[i][1] + '前' : n + units[i][1] + '后';
    }
  }
  return '刚刚';
}

/* ---------------- Cron ---------------- */

var DOW_NAMES = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
var MON_NAMES = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 };

function parseCronField(raw, min, max, nameMap) {
  var s = String(raw).trim();
  if (s === '' || s === '*' || s === '?') return { values: null, text: '每' };
  var values = {};
  var parts = s.split(',');
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].trim().toUpperCase();
    if (!part) continue;
    var step = 1;
    var slash = part.indexOf('/');
    if (slash >= 0) {
      step = parseInt(part.slice(slash + 1), 10);
      if (!step || step < 1) throw new Error('步长非法：' + part);
      part = part.slice(0, slash);
    }
    var start, end;
    if (part === '*' || part === '') { start = min; end = max; }
    else if (part.indexOf('-') > 0) {
      var seg = part.split('-');
      start = toNum(seg[0], nameMap);
      end = toNum(seg[1], nameMap);
    } else {
      start = toNum(part, nameMap);
      end = (slash >= 0) ? max : start;
    }
    if (isNaN(start) || isNaN(end)) throw new Error('无法解析：' + raw);
    if (start > end) throw new Error('范围起点大于终点：' + raw);
    if (start < min || end > max) throw new Error('取值越界（' + min + '-' + max + '）：' + raw);
    for (var v = start; v <= end; v += step) values[v] = true;
  }
  var list = Object.keys(values).map(Number).sort(function (a, b) { return a - b; });
  if (!list.length) throw new Error('空集合：' + raw);
  return { values: list, text: describeList(list, stepText(s)) };
}

function toNum(token, nameMap) {
  var t = String(token).trim().toUpperCase();
  if (nameMap && nameMap[t] !== undefined) return nameMap[t];
  var n = parseInt(t, 10);
  if (isNaN(n)) throw new Error('非法取值：' + token);
  return n;
}

function stepText(s) { return s; }

function describeList(list, _raw) {
  if (list.length === 1) return String(list[0]);
  if (list.length <= 6) return list.join(', ');
  return list[0] + ' - ' + list[list.length - 1] + '（共 ' + list.length + ' 个）';
}

function parseCron(expr) {
  var parts = String(expr).trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) throw new Error('Cron 需要 5 段（分 时 日 月 周）或 6 段（秒 分 时 日 月 周）');
  var hasSec = parts.length === 6;
  var idx = hasSec ? 0 : -1;
  var sec = hasSec ? parseCronField(parts[0], 0, 59, null) : { values: [0], text: '0' };
  var min = parseCronField(parts[idx + 1], 0, 59, null);
  var hour = parseCronField(parts[idx + 2], 0, 23, null);
  var dom = parseCronField(parts[idx + 3], 1, 31, null);
  var month = parseCronField(parts[idx + 4], 1, 12, MON_NAMES);
  var dow = parseCronField(parts[idx + 5], 0, 6, DOW_NAMES);
  return { hasSec: hasSec, sec: sec, min: min, hour: hour, dom: dom, month: month, dow: dow };
}

function expandRange(values, min, max) {
  if (values) return values;
  var out = [];
  for (var i = min; i <= max; i++) out.push(i);
  return out;
}

function cronNextTimes(expr, count, from, maxDays) {
  var f = parseCron(expr);
  var limit = maxDays || 3650;
  var out = [];
  var base = from ? new Date(from.getTime()) : new Date();
  base.setMilliseconds(0);
  if (!f.hasSec) base.setSeconds(60, 0); else base.setSeconds(base.getSeconds() + 1);
  var secs = expandRange(f.sec.values, 0, 59);
  var mins = expandRange(f.min.values, 0, 59);
  var hours = expandRange(f.hour.values, 0, 23);
  var months = f.month.values;
  var doms = f.dom.values, dows = f.dow.values;
  var domRestricted = doms !== null;
  var dowRestricted = dows !== null;
  for (var d = 0; d <= limit && out.length < count; d++) {
    var cursor = new Date(base.getFullYear(), base.getMonth(), base.getDate() + d, 0, 0, 0, 0);
    var y = cursor.getFullYear(), mo = cursor.getMonth(), da = cursor.getDate();
    var jsMonth = mo + 1;
    var jsDow = cursor.getDay();
    if (months && months.indexOf(jsMonth) < 0) continue;
    var dayOk;
    if (domRestricted && dowRestricted) dayOk = doms.indexOf(da) >= 0 || dows.indexOf(jsDow) >= 0;
    else if (domRestricted) dayOk = doms.indexOf(da) >= 0;
    else if (dowRestricted) dayOk = dows.indexOf(jsDow) >= 0;
    else dayOk = true;
    if (!dayOk) continue;
    for (var hi = 0; hi < hours.length && out.length < count; hi++) {
      for (var mi = 0; mi < mins.length && out.length < count; mi++) {
        for (var si = 0; si < secs.length && out.length < count; si++) {
          var cand = new Date(y, mo, da, hours[hi], mins[mi], secs[si], 0);
          if (cand.getTime() < base.getTime()) continue;
          out.push(cand);
        }
      }
    }
  }
  return { times: out, fields: f };
}

function cronDescribe(expr) {
  var f = parseCron(expr);
  var dowText = f.dow.values ? '周 ' + f.dow.text : '';
  var domText = f.dom.values ? '每月 ' + f.dom.text + ' 日' : '';
  var dayText = (domText && dowText) ? (domText + ' 或 ' + dowText) : (domText || dowText || '每天');
  var t = '在 ' + dayText + '的 ' + f.hour.text + ' 时 ' + f.min.text + ' 分';
  if (f.hasSec) t += ' ' + f.sec.text + ' 秒';
  t += ' 执行';
  if (f.month.values) t += '（仅 ' + f.month.text + ' 月）';
  return t;
}

/* ---------------- 文本 Diff ---------------- */

function diffLines(aText, bText, opts) {
  var o = opts || {};
  var norm = function (s) {
    var v = s;
    if (o.ignoreCase) v = v.toLowerCase();
    if (o.ignoreSpace) v = v.replace(/\s+/g, '');
    return v;
  };
  var a = aText.replace(/\r\n/g, '\n').split('\n');
  var b = bText.replace(/\r\n/g, '\n').split('\n');
  var start = 0;
  while (start < a.length && start < b.length && norm(a[start]) === norm(b[start])) start++;
  var endA = a.length - 1, endB = b.length - 1;
  while (endA >= start && endB >= start && norm(a[endA]) === norm(b[endB])) { endA--; endB--; }
  var A = a.slice(start, endA + 1);
  var B = b.slice(start, endB + 1);
  var mid = [];
  if (A.length && B.length) {
    if (A.length * B.length > 400000) {
      mid = A.map(function (l) { return { type: 'del', text: l }; })
        .concat(B.map(function (l) { return { type: 'add', text: l }; }));
    } else {
      mid = lcsDiff(A, B, norm);
    }
  } else {
    mid = A.map(function (l) { return { type: 'del', text: l }; })
      .concat(B.map(function (l) { return { type: 'add', text: l }; }));
  }
  var out = [];
  var i;
  for (i = 0; i < start; i++) out.push({ type: 'eq', text: a[i], ln: i + 1, rn: i + 1 });
  var ln = start, rn = start;
  for (i = 0; i < mid.length; i++) {
    var it = mid[i];
    if (it.type === 'eq') { ln++; rn++; out.push({ type: 'eq', text: it.text, ln: ln, rn: rn }); }
    else if (it.type === 'del') { ln++; out.push({ type: 'del', text: it.text, ln: ln, rn: null }); }
    else { rn++; out.push({ type: 'add', text: it.text, ln: null, rn: rn }); }
  }
  for (i = endA + 1; i < a.length; i++) { ln++; rn++; out.push({ type: 'eq', text: a[i], ln: ln, rn: rn }); }
  return out;
}

function lcsDiff(A, B, norm) {
  var n = A.length, m = B.length;
  var dp = [];
  var i, j;
  for (i = 0; i <= n; i++) {
    dp.push(new Uint32Array(m + 1));
  }
  for (i = n - 1; i >= 0; i--) {
    for (j = m - 1; j >= 0; j--) {
      if (norm(A[i]) === norm(B[j])) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  var out = [];
  i = 0; j = 0;
  while (i < n && j < m) {
    if (norm(A[i]) === norm(B[j])) { out.push({ type: 'eq', text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: 'del', text: A[i] }); i++; }
    else { out.push({ type: 'add', text: B[j] }); j++; }
  }
  while (i < n) { out.push({ type: 'del', text: A[i] }); i++; }
  while (j < m) { out.push({ type: 'add', text: B[j] }); j++; }
  return out;
}

/* ---------------- 进制转换 ---------------- */

var BASE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

function convertBase(input, fromBase, toBase) {
  var s = String(input).trim().replace(/[\s_,]/g, '');
  if (!s) throw new Error('请输入数值');
  var fb = parseInt(fromBase, 10), tb = parseInt(toBase, 10);
  if (!(fb >= 2 && fb <= 36) || !(tb >= 2 && tb <= 36)) throw new Error('进制需在 2 - 36 之间');
  var neg = false;
  if (s[0] === '-') { neg = true; s = s.slice(1); }
  var val = 0n;
  var base = BigInt(fb);
  for (var i = 0; i < s.length; i++) {
    var d = BASE_ALPHABET.indexOf(s[i].toLowerCase());
    if (d < 0 || d >= fb) throw new Error('含有不属于 ' + fb + ' 进制的字符：' + s[i]);
    val = val * base + BigInt(d);
  }
  var tb2 = BigInt(tb);
  var out = '';
  if (val === 0n) out = '0';
  while (val > 0n) {
    out = BASE_ALPHABET[Number(val % tb2)] + out;
    val = val / tb2;
  }
  return (neg && out !== '0' ? '-' : '') + out;
}

/* ---------------- 颜色 ---------------- */

function clampNum(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function normalizeHex(str) {
  var s = String(str).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (!/^[0-9a-fA-F]{6}$/.test(s)) throw new Error('HEX 颜色需为 #RGB 或 #RRGGBB');
  return '#' + s.toLowerCase();
}

function hexToRgb(hex) {
  var s = normalizeHex(hex).slice(1);
  return {
    r: parseInt(s.substr(0, 2), 16),
    g: parseInt(s.substr(2, 2), 16),
    b: parseInt(s.substr(4, 2), 16)
  };
}

function rgbToHex(r, g, b) {
  var h = function (v) { var x = clampNum(Math.round(v), 0, 255).toString(16); return x.length === 1 ? '0' + x : x; };
  return '#' + h(r) + h(g) + h(b);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h = 0, s = 0, l = (max + min) / 2;
  var d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 3600) / 10, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360; s = clampNum(s, 0, 100) / 100; l = clampNum(l, 0, 100) / 100;
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  var m = l - c / 2;
  var rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return { r: Math.round((rgb[0] + m) * 255), g: Math.round((rgb[1] + m) * 255), b: Math.round((rgb[2] + m) * 255) };
}

function srgbChannel(v) {
  var x = v / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function relLuminance(rgb) {
  return 0.2126 * srgbChannel(rgb.r) + 0.7152 * srgbChannel(rgb.g) + 0.0722 * srgbChannel(rgb.b);
}

function contrastRatio(hexA, hexB) {
  var l1 = relLuminance(hexToRgb(hexA));
  var l2 = relLuminance(hexToRgb(hexB));
  var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function colorScale(hex) {
  var hsl = rgbToHsl(hexToRgb(hex).r, hexToRgb(hex).g, hexToRgb(hex).b);
  var stops = [95, 90, 80, 70, 60, 50, 45, 40, 30, 20, 10];
  var labels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  return stops.map(function (l, i) {
    var c = hslToRgb(hsl.h, hsl.s, l);
    return { label: labels[i], hex: rgbToHex(c.r, c.g, c.b) };
  });
}

function harmonyColors(hex) {
  var c = hexToRgb(hex);
  var hsl = rgbToHsl(c.r, c.g, c.b);
  var mk = function (dh) {
    var v = hslToRgb(hsl.h + dh, hsl.s, hsl.l);
    return rgbToHex(v.r, v.g, v.b);
  };
  return {
    complementary: [mk(180)],
    analogous: [mk(-30), mk(30)],
    triadic: [mk(120), mk(240)],
    split: [mk(150), mk(210)]
  };
}

function readableTextColor(hex) {
  return relLuminance(hexToRgb(hex)) > 0.4 ? '#111827' : '#ffffff';
}

/* ---------------- JWT ---------------- */

function decodeJwt(token) {
  var t = String(token).trim().replace(/^Bearer\s+/i, '');
  var parts = t.split('.');
  if (parts.length < 2) throw new Error('JWT 至少应包含 header.payload 两段');
  var b64 = function (s) {
    var pad = s.replace(/-/g, '+').replace(/_/g, '/');
    while (pad.length % 4) pad += '=';
    return bytesToUtf8(b64DecodeToBytes(pad));
  };
  var header = JSON.parse(b64(parts[0]));
  var payload = JSON.parse(b64(parts[1]));
  var signature = parts.length > 2 ? parts[2] : null;
  var claims = {};
  ['exp', 'iat', 'nbf'].forEach(function (k) {
    if (typeof payload[k] === 'number') {
      claims[k] = { raw: payload[k], date: new Date(payload[k] * 1000), iso: formatDate(new Date(payload[k] * 1000), TZ_LIST[0].id) };
    }
  });
  return { header: header, payload: payload, signature: signature, claims: claims };
}

/* ---------------- URL ---------------- */

function parseUrl(str) {
  var u = new URL(String(str).trim());
  var params = [];
  u.searchParams.forEach(function (v, k) { params.push({ key: k, value: v }); });
  return {
    href: u.href, protocol: u.protocol, host: u.host, hostname: u.hostname,
    port: u.port, pathname: u.pathname, search: u.search, hash: u.hash,
    origin: u.origin, params: params
  };
}

function parseQuery(str) {
  var s = String(str).trim().replace(/^[?]/, '');
  var out = [];
  if (!s) return out;
  s.split('&').forEach(function (pair) {
    if (!pair) return;
    var eq = pair.indexOf('=');
    var k = eq < 0 ? pair : pair.slice(0, eq);
    var v = eq < 0 ? '' : pair.slice(eq + 1);
    var dec;
    try { dec = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) { dec = v; }
    var dk;
    try { dk = decodeURIComponent(k.replace(/\+/g, ' ')); } catch (e) { dk = k; }
    out.push({ key: dk, value: dec });
  });
  return out;
}

function buildQuery(pairs, encode) {
  return pairs.filter(function (p) { return p.key; }).map(function (p) {
    var k = encode ? encodeURIComponent(p.key) : p.key;
    var v = encode ? encodeURIComponent(p.value) : p.value;
    return k + '=' + v;
  }).join('&');
}

/* ---------------- UUID / 随机 ---------------- */

function uuidV4() {
  var b = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  var h = bytesToHex(b);
  return h.substr(0, 8) + '-' + h.substr(8, 4) + '-' + h.substr(12, 4) + '-' + h.substr(16, 4) + '-' + h.substr(20, 12);
}

var AMBIGUOUS = 'il1IoO0';

function randomPassword(opts) {
  var o = opts || {};
  var len = clampNum(o.length || 16, 1, 256);
  var lower = 'abcdefghijkmnopqrstuvwxyz';
  var upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  var digits = '23456789';
  var symbols = '!@#$%^&*()-_=+[]{};:,.?';
  var pool = '';
  if (o.lower !== false) pool += lower;
  if (o.upper) pool += upper;
  if (o.digit) pool += digits;
  if (o.symbol) pool += symbols;
  if (!pool) pool = lower + digits;
  if (o.noAmbiguous) {
    pool = pool.split('').filter(function (c) { return AMBIGUOUS.indexOf(c) < 0; }).join('');
    if (!pool) pool = 'abcdefghijkmnpqrstuvwxyz23456789';
  }
  var pick = function () {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return pool[buf[0] % pool.length];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };
  var out = '';
  var guard = 0;
  while (out.length < len && guard < len * 200) {
    guard++;
    out += pick();
  }
  return out;
}

function passwordStrength(pw) {
  var s = String(pw);
  var score = 0;
  if (s.length >= 8) score += 1;
  if (s.length >= 12) score += 1;
  if (s.length >= 16) score += 1;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score += 1;
  if (/\d/.test(s)) score += 1;
  if (/[^A-Za-z0-9]/.test(s)) score += 1;
  if (/(.)\1{2,}/.test(s)) score -= 1;
  if (/^(?:123456|000000|111111|password|passwd|admin|qwerty|abc123|letmein|iloveyou)/i.test(s)) score = Math.min(score, 1);
  score = clampNum(score, 0, 6);
  var pool = 0;
  if (/[a-z]/.test(s)) pool += 26;
  if (/[A-Z]/.test(s)) pool += 26;
  if (/\d/.test(s)) pool += 10;
  if (/[^A-Za-z0-9]/.test(s)) pool += 24;
  var entropy = s.length ? Math.round(s.length * Math.log2(pool || 1)) : 0;
  var levels = ['极弱', '很弱', '偏弱', '中等', '较强', '很强', '极强'];
  return { score: score, level: levels[score], entropy: entropy };
}

/* ---------------- 编码转换 ---------------- */

function unicodeEscape(str) {
  var out = '';
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    out += c > 127 ? '\\u' + ('0000' + c.toString(16)).slice(-4) : str[i];
  }
  return out;
}

function unicodeUnescape(str) {
  return String(str).replace(/\\u([0-9a-fA-F]{4})/g, function (_m, g) {
    return String.fromCharCode(parseInt(g, 16));
  }).replace(/\\x([0-9a-fA-F]{2})/g, function (_m, g) {
    return String.fromCharCode(parseInt(g, 16));
  });
}

function htmlEntities(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    if (c === '&') return '&amp;';
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '"') return '&quot;';
    return '&#39;';
  });
}

function htmlUnescape(str) {
  return String(str)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, function (_m, d) { return String.fromCharCode(parseInt(d, 10)); })
    .replace(/&amp;/g, '&');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    escapeHtml: escapeHtml, bytesToHex: bytesToHex, hexToBytes: hexToBytes,
    md5Bytes: md5Bytes, sha1Bytes: sha1Bytes, sha256Bytes: sha256Bytes, sha512Bytes: sha512Bytes,
    computeHash: computeHash, hmacBytes: hmacBytes,
    b64Encode: b64Encode, b64Decode: b64Decode,
    jsonEscapeHtml: jsonEscapeHtml, jsonPathGet: jsonPathGet, sortJsonDeep: sortJsonDeep,
    regexEscapeHtml: regexEscapeHtml, regexScan: regexScan,
    formatDate: formatDate, relativeTime: relativeTime, tzOffsetLabel: tzOffsetLabel, TZ_LIST: TZ_LIST,
    parseCron: parseCron, cronNextTimes: cronNextTimes, cronDescribe: cronDescribe,
    diffLines: diffLines, convertBase: convertBase,
    hexToRgb: hexToRgb, rgbToHex: rgbToHex, rgbToHsl: rgbToHsl, hslToRgb: hslToRgb,
    contrastRatio: contrastRatio, colorScale: colorScale, harmonyColors: harmonyColors,
    readableTextColor: readableTextColor, normalizeHex: normalizeHex,
    decodeJwt: decodeJwt, parseUrl: parseUrl, parseQuery: parseQuery, buildQuery: buildQuery,
    uuidV4: uuidV4, randomPassword: randomPassword, passwordStrength: passwordStrength,
    unicodeEscape: unicodeEscape, unicodeUnescape: unicodeUnescape,
    htmlEntities: htmlEntities, htmlUnescape: htmlUnescape, utf8Bytes: utf8Bytes
  };
}



/* ============================================================
 * DevKit 1024 · 交互层
 * ============================================================ */
'use strict';

(function () {

  /* ---------------- 基础工具 ---------------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = String(text);
    return e;
  }

  function mkBtn(label, fn, cls) {
    var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show';
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; }, 1800);
  }

  function copyText(text, label) {
    if (!text) { toast('没有可复制的内容'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast((label || '内容') + '已复制到剪贴板');
      }, function () { fallbackCopy(text, label); });
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'readonly');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var okDone = false;
    try { okDone = document.execCommand('copy'); } catch (e) { okDone = false; }
    document.body.removeChild(ta);
    toast(okDone ? ((label || '内容') + '已复制到剪贴板') : '复制失败，请手动选择内容');
  }

  var savedValues = Object.create(null);
  function store(key, val) {
    if (val === undefined) return Object.prototype.hasOwnProperty.call(savedValues, key) ? savedValues[key] : null;
    savedValues[key] = val;
    writeStorage(key, val).catch(function () { toast('保存失败或结果未知，请重新打开并检查'); });
    return null;
  }

  var cleanups = [];
  function onCleanup(fn) { cleanups.push(fn); }
  function runCleanups() {
    cleanups.forEach(function (f) { try { f(); } catch (e) { /* ignore */ } });
    cleanups = [];
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments, self = this;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, wait || 150);
    };
  }

  /* ---------------- 表单构件 ---------------- */

  function mkTextarea(o) {
    o = o || {};
    var wrap = el('div', 'field');
    var head = el('div', 'field-head');
    head.appendChild(el('label', 'field-label', o.label || ''));
    if (o.hint) head.appendChild(el('span', 'field-hint', o.hint));
    var ta = document.createElement('textarea');
    ta.className = 'ta' + (o.mono === false ? '' : ' mono');
    ta.rows = o.rows || 8;
    ta.placeholder = o.placeholder || '';
    ta.setAttribute('spellcheck', 'false');
    ta.value = o.value || '';
    wrap.appendChild(head);
    wrap.appendChild(ta);
    if (o.key) {
      var saved = store(o.key);
      if (saved !== null && saved !== undefined && saved !== '') ta.value = saved;
      ta.addEventListener('input', debounce(function () { store(o.key, ta.value); }, 400));
    }
    return { wrap: wrap, ta: ta, head: head };
  }

  function mkInput(o) {
    o = o || {};
    var i = document.createElement('input');
    i.className = 'inp' + (o.mono ? ' mono' : '');
    i.type = o.type || 'text';
    if (o.placeholder) i.placeholder = o.placeholder;
    if (o.value !== undefined) i.value = o.value;
    if (o.min !== undefined) i.min = o.min;
    if (o.max !== undefined) i.max = o.max;
    if (o.step !== undefined) i.step = o.step;
    return i;
  }

  function mkOut(o) {
    o = o || {};
    var wrap = el('div', 'field');
    var head = el('div', 'field-head');
    head.appendChild(el('label', 'field-label', o.label || '输出'));
    var btns = el('div', 'field-btns');
    var pre = el('pre', 'out mono');
    if (o.minHeight) pre.style.minHeight = o.minHeight;
    var copyBtn = mkBtn('复制', function () { copyText(pre.textContent, '结果'); }, 'btn-mini');
    btns.appendChild(copyBtn);
    if (o.extra) o.extra.forEach(function (b) { btns.appendChild(b); });
    head.appendChild(btns);
    wrap.appendChild(head);
    wrap.appendChild(pre);
    return {
      wrap: wrap, pre: pre, head: head,
      setText: function (t) { pre.textContent = (t === undefined || t === null) ? '' : String(t); },
      getText: function () { return pre.textContent; }
    };
  }

  function mkSelect(options, value, onChange) {
    var s = document.createElement('select');
    s.className = 'inp';
    options.forEach(function (o) {
      var opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      s.appendChild(opt);
    });
    s.value = value;
    if (onChange) s.addEventListener('change', function () { onChange(s.value); });
    return s;
  }

  function mkCheck(label, checked, onChange) {
    var lab = el('label', 'check');
    var i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = !!checked;
    lab.appendChild(i);
    lab.appendChild(el('span', null, label));
    if (onChange) i.addEventListener('change', function () { onChange(i.checked); });
    return { wrap: lab, input: i };
  }

  function mkPanel(title) {
    var p = el('div', 'panel');
    if (title) p.appendChild(el('div', 'panel-title', title));
    return p;
  }

  function setStatus(node, kind, text) {
    node.className = 'status' + (kind ? ' ' + kind : '');
    node.textContent = text;
  }

  function mkRow(children) {
    var r = el('div', 'row');
    children.forEach(function (c) { r.appendChild(c); });
    return r;
  }

  function mkKv(pairs) {
    var dl = el('dl', 'kv');
    pairs.forEach(function (p) {
      dl.appendChild(el('dt', null, p[0]));
      dl.appendChild(el('dd', null, p[1]));
    });
    return dl;
  }

  /* ---------------- 收藏 ---------------- */

  function favList() {
    var raw = store('favs');
    try { return JSON.parse(raw || '[]') || []; } catch (e) { return []; }
  }
  function isFav(id) { return favList().indexOf(id) >= 0; }
  function toggleFav(id) {
    var list = favList();
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    store('favs', JSON.stringify(list));
    renderNav();
    toast(isFav(id) ? '已加入常用工具' : '已移出常用工具');
  }

  /* ---------------- 工具头 ---------------- */

  function mkHead(tool, rightBtns) {
    var head = el('div', 'tool-head');
    var left = el('div', 'th-left');
    left.appendChild(el('div', 'th-ico', tool.icon));
    var txt = el('div');
    txt.appendChild(el('h2', null, tool.name));
    txt.appendChild(el('p', null, tool.desc));
    left.appendChild(txt);
    head.appendChild(left);
    var right = el('div', 'th-right');
    (rightBtns || []).forEach(function (b) { right.appendChild(b); });
    var favBtn = mkBtn(isFav(tool.id) ? '★ 常用' : '☆ 收藏', function () {
      toggleFav(tool.id);
      favBtn.textContent = isFav(tool.id) ? '★ 常用' : '☆ 收藏';
    }, 'btn-mini');
    right.appendChild(favBtn);
    head.appendChild(right);
    return head;
  }

  /* ============================================================
   * 工具 1 · JSON
   * ============================================================ */
  function buildJson(host) {
    var input = mkTextarea({
      label: 'JSON / JS 对象输入', mono: true, rows: 14, key: 'json.in',
      placeholder: '在此粘贴 JSON 文本…'
    });
    var out = mkOut({ label: '格式化结果', minHeight: '260px' });
    var status = el('div', 'status');
    var pathInp = mkInput({ mono: true, placeholder: '$.data.items[0].name' });
    var pathOut = mkOut({ label: '取值结果', minHeight: '48px' });

    var lastObj = null;

    function parseInput() {
      var t = input.ta.value.trim();
      if (!t) { lastObj = null; setStatus(status, '', '等待输入…'); out.setText(''); return null; }
      try {
        lastObj = JSON.parse(t);
        setStatus(status, 'ok', '✓ JSON 合法 · 顶层类型为 ' + (Array.isArray(lastObj) ? 'array' : typeof lastObj));
        return lastObj;
      } catch (e) {
        lastObj = null;
        setStatus(status, 'err', '✗ ' + e.message);
        return null;
      }
    }

    function renderIndent(space) {
      var o = parseInput();
      if (o === null) return;
      out.pre.innerHTML = jsonEscapeHtml(JSON.stringify(o, null, space));
    }

    function fmt(space, sort) {
      var o = parseInput();
      if (o === null) return;
      if (sort) o = sortJsonDeep(o);
      var txt = JSON.stringify(o, null, space);
      out.pre.innerHTML = jsonEscapeHtml(txt);
      setStatus(status, 'ok', '✓ 已格式化 · ' + txt.length + ' 字符 / ' + txt.split('\n').length + ' 行');
    }

    var actions = mkRow([
      mkBtn('格式化 2 空格', function () { fmt(2, false); }, 'btn-primary'),
      mkBtn('格式化 4 空格', function () { fmt(4, false); }),
      mkBtn('压缩', function () { fmt(0, false); }),
      mkBtn('键名排序', function () { fmt(2, true); }),
      mkBtn('加引号转义', function () {
        out.setText(JSON.stringify(input.ta.value));
        setStatus(status, 'ok', '✓ 已生成 JSON 字符串字面量');
      }),
      mkBtn('去除转义', function () {
        try {
          var v = JSON.parse(input.ta.value.trim());
          out.setText(typeof v === 'string' ? v : JSON.stringify(v, null, 2));
          setStatus(status, 'ok', '✓ 已还原');
        } catch (e2) { setStatus(status, 'err', '✗ ' + e2.message); }
      }),
      mkBtn('示例', function () {
        input.ta.value = JSON.stringify({
          project: 'DevKit 1024', version: '1.0.0', stars: 1024,
          tools: [{ name: 'JSON', hot: true }, { name: 'Cron', hot: false }],
          meta: { author: '开发者', tags: ['dev', 'tool'], released: '2026-01-01' }
        }, null, 2);
        fmt(2, false);
      }),
      mkBtn('清空', function () { input.ta.value = ''; out.setText(''); pathOut.setText(''); setStatus(status, '', '已清空'); })
    ]);

    var pathRow = mkRow([
      mkBtn('按路径取值', function () {
        var o = parseInput();
        if (o === null) return;
        try {
          var v = jsonPathGet(o, pathInp.value);
          var txt = typeof v === 'string' ? v : JSON.stringify(v, null, 2);
          pathOut.setText(txt === undefined ? '(undefined)' : txt);
        } catch (e) { pathOut.setText('✗ ' + e.message); }
      }),
      mkBtn('复制路径值', function () { copyText(pathOut.getText(), '取值结果'); })
    ]);

    var p1 = mkPanel('输入');
    p1.appendChild(input.wrap);
    p1.appendChild(actions);
    p1.appendChild(status);

    var p2 = mkPanel('输出');
    var io = el('div', 'io');
    io.appendChild(out.wrap);
    var rightCol = el('div', 'field');
    rightCol.appendChild(el('label', 'field-label', '路径取值'));
    rightCol.appendChild(pathInp);
    rightCol.appendChild(el('div', 'hint-box', '支持 a.b[0].c、$.a.items[2]、["key with space"] 三种写法'));
    rightCol.appendChild(pathRow);
    rightCol.appendChild(pathOut.wrap);
    io.appendChild(rightCol);
    p2.appendChild(io);

    host.appendChild(mkHead(TOOL_MAP.json, [mkBtn('格式化', function () { fmt(2, false); }, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    input.ta.addEventListener('input', debounce(function () { renderIndent(2); }, 400));
    if (!input.ta.value.trim()) {
      input.ta.value = JSON.stringify({
        project: 'DevKit 1024', version: '1.0.0', stars: 1024,
        tools: [{ name: 'JSON', hot: true }, { name: 'Cron', hot: false }],
        meta: { author: '开发者', tags: ['dev', 'tool'], released: '2026-01-01' }
      }, null, 2);
      pathInp.value = '$.tools[1].name';
    }
    fmt(2, false);
    try { pathOut.setText(String(jsonPathGet(JSON.parse(input.ta.value), pathInp.value))); } catch (e) { /* ignore */ }
  }

  /* ============================================================
   * 工具 2 · 正则实验室
   * ============================================================ */
  var REGEX_PRESETS = [
    ['邮箱', '[\\w.+-]+@[\\w-]+\\.[\\w.]+'],
    ['手机号', '1[3-9]\\d{9}'],
    ['IPv4', '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b'],
    ['URL', 'https?://[^\\s]+'],
    ['日期', '\\d{4}-\\d{2}-\\d{2}'],
    ['中文', '[\\u4e00-\\u9fa5]+'],
    ['HTML 标签', '<[^>]+>'],
    ['整数或小数', '-?\\d+(?:\\.\\d+)?'],
    ['十六进制色', '#[0-9a-fA-F]{6}'],
    ['身份证', '\\d{17}[\\dXx]'],
    ['重复单词', '\\b(\\w+)\\s+\\1\\b'],
    ['行首空白', '^\\s+']
  ];

  function buildRegex(host) {
    var patInp = mkInput({ mono: true, placeholder: '正则表达式，如 (\\d{4})-(\\d{2})' });
    var flagInp = mkInput({ mono: true, value: 'g' });
    flagInp.style.maxWidth = '80px';
    var text = mkTextarea({
      label: '待匹配文本', mono: true, rows: 8, key: 'regex.text',
      value: '订单号 2026-1024 创建于 2026-10-22，联系邮箱 dev@example.com，备用 hi@example.com'
    });
    var preview = el('pre', 'out mono');
    preview.style.minHeight = '150px';
    var listBox = el('div', 'result-list');
    var repInp = mkInput({ mono: true, placeholder: '替换模板，可用 $1 $2 或 $<name>' });
    var repOut = mkOut({ label: '替换结果', minHeight: '80px' });
    var status = el('div', 'status');

    function run() {
      var p = patInp.value;
      if (!p) { setStatus(status, '', '请填写正则表达式'); preview.textContent = ''; listBox.innerHTML = ''; return; }
      try {
        var r = regexScan(p, flagInp.value, text.ta.value);
        preview.innerHTML = regexEscapeHtml(text.ta.value, r.ranges);
        listBox.innerHTML = '';
        if (!r.count) {
          listBox.appendChild(el('div', 'status warn', '没有匹配到任何内容'));
        } else {
          var head = el('div', 'status ok', '✓ 共匹配 ' + r.count + ' 处');
          listBox.appendChild(head);
          var tbl = el('table', 'tbl');
          var thead = el('thead');
          var htr = el('tr');
          ['#', '位置', '匹配内容', '捕获组'].forEach(function (t) { htr.appendChild(el('th', null, t)); });
          thead.appendChild(htr);
          tbl.appendChild(thead);
          var tbody = el('tbody');
          r.ranges.slice(0, 60).forEach(function (rg, i) {
            var tr = el('tr');
            tr.appendChild(el('td', null, String(i + 1)));
            tr.appendChild(el('td', 'mono', rg.start + '-' + rg.end));
            tr.appendChild(el('td', 'mono', rg.text || '(空)'));
            tr.appendChild(el('td', 'mono', rg.groups && rg.groups.length ? rg.groups.join(' | ') : '—'));
            tbody.appendChild(tr);
          });
          tbl.appendChild(tbody);
          listBox.appendChild(tbl);
          if (r.count > 60) listBox.appendChild(el('div', 'field-hint', '仅展示前 60 条'));
        }
        setStatus(status, 'ok', '✓ 正则语法有效');
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
        preview.textContent = text.ta.value;
      }
    }

    function doReplace() {
      var p = patInp.value;
      if (!p) { toast('请先填写正则表达式'); return; }
      try {
        var flags = String(flagInp.value || '').replace(/[^gimsuy]/g, '');
        var re = new RegExp(p, flags);
        repOut.setText(text.ta.value.replace(re, repInp.value));
      } catch (e) { repOut.setText('✗ ' + e.message); }
    }

    var patRow = mkRow([
      mkBtn('匹配', run, 'btn-primary'),
      mkBtn('执行替换', doReplace),
      mkBtn('复制替换结果', function () { copyText(repOut.getText(), '替换结果'); }),
      mkBtn('清空', function () { patInp.value = ''; preview.textContent = ''; listBox.innerHTML = ''; repOut.setText(''); })
    ]);

    var chips = el('div', 'chips');
    REGEX_PRESETS.forEach(function (p) {
      chips.appendChild(mkBtn(p[0], function () { patInp.value = p[1]; run(); }, 'chip'));
    });

    var p1 = mkPanel('正则');
    var patField = el('div', 'field');
    patField.appendChild(el('label', 'field-label', '表达式 / 修饰符'));
    patField.appendChild(mkRow([patInp, flagInp]));
    patField.appendChild(el('div', 'field-hint', '修饰符支持 g（全局）i（忽略大小写）m（多行）s（单行）u（Unicode）y（粘性）'));
    p1.appendChild(patField);
    p1.appendChild(patRow);
    p1.appendChild(status);

    var p2 = mkPanel('文本与结果');
    var io = el('div', 'io');
    var leftCol = el('div', 'field');
    leftCol.appendChild(el('label', 'field-label', '待匹配文本'));
    leftCol.appendChild(text.ta);
    var pvHead = el('div', 'field-head');
    pvHead.appendChild(el('label', 'field-label', '高亮预览'));
    leftCol.appendChild(pvHead);
    leftCol.appendChild(preview);
    leftCol.appendChild(el('label', 'field-label', '替换为'));
    leftCol.appendChild(repInp);
    leftCol.appendChild(repOut.wrap);
    io.appendChild(leftCol);
    io.appendChild(listBox);
    p2.appendChild(io);

    var p3 = mkPanel('常用表达式速查');
    p3.appendChild(chips);

    host.appendChild(mkHead(TOOL_MAP.regex, [mkBtn('立即匹配', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    host.appendChild(p3);
    [patInp, flagInp].forEach(function (n) { n.addEventListener('input', debounce(run, 250)); });
    text.ta.addEventListener('input', debounce(run, 250));
    if (!patInp.value) patInp.value = '(\\d{4})-(\\d{2})-(\\d{2})';
    run();
  }

  /* ============================================================
   * 工具 3 · 时间戳
   * ============================================================ */
  function buildTime(host) {
    var tsInp = mkInput({ mono: true, placeholder: '如 1798761600 或 1798761600000' });
    var dtInp = mkInput({ type: 'datetime-local' });
    var status = el('div', 'status');
    var out = mkOut({ label: '转换结果', minHeight: '300px' });
    var nowBox = el('div', 'status ok');

    function nowStamp() {
      var d = new Date();
      nowBox.textContent = '当前时间戳：' + Math.floor(d.getTime() / 1000) + '（秒） / ' + d.getTime() + '（毫秒）　' + formatDate(d, TZ_LIST[0].id);
    }

    function renderFromTs() {
      var raw = tsInp.value.trim();
      if (!raw) { setStatus(status, '', '请输入时间戳'); out.setText(''); return; }
      var num = Number(raw);
      if (!isFinite(num)) { setStatus(status, 'err', '✗ 时间戳必须是数字'); return; }
      var ms = Math.abs(num) < 1e11 ? num * 1000 : num;
      var d = new Date(ms);
      if (isNaN(d.getTime())) { setStatus(status, 'err', '✗ 无法解析为有效时间'); return; }
      var lines = [];
      lines.push('时间戳（秒）    : ' + Math.floor(ms / 1000));
      lines.push('时间戳（毫秒）  : ' + ms);
      lines.push('本地时间        : ' + padAll(d));
      lines.push('ISO 8601        : ' + d.toISOString());
      lines.push('UTC             : ' + formatDate(d, 'UTC'));
      lines.push('相对现在        : ' + relativeTime(ms));
      lines.push('');
      lines.push('—— 全球主要时区 ——');
      TZ_LIST.forEach(function (tz) {
        lines.push(pad(tz.label, 16) + formatDate(d, tz.id) + '  ' + tzOffsetLabel(tz.id, d));
      });
      out.setText(lines.join('\n'));
      setStatus(status, 'ok', '✓ 已解析（自动识别秒 / 毫秒）');
      dtInp.value = toLocalInput(d);
    }

    function toLocalInput(d) {
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
        'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    }

    function padAll(d) {
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
        pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    }

    function renderFromDate() {
      if (!dtInp.value) { setStatus(status, 'err', '请选择日期时间'); return; }
      var d = new Date(dtInp.value);
      if (isNaN(d.getTime())) { setStatus(status, 'err', '✗ 无效的日期'); return; }
      var lines = [];
      lines.push('时间戳（秒）    : ' + Math.floor(d.getTime() / 1000));
      lines.push('时间戳（毫秒）  : ' + d.getTime());
      lines.push('ISO 8601        : ' + d.toISOString());
      lines.push('UTC             : ' + formatDate(d, 'UTC'));
      lines.push('相对现在        : ' + relativeTime(d.getTime()));
      out.setText(lines.join('\n'));
      tsInp.value = String(Math.floor(d.getTime() / 1000));
      setStatus(status, 'ok', '✓ 已转换为时间戳');
    }

    var p1 = mkPanel('转换');
    var f1 = el('div', 'field');
    f1.appendChild(el('label', 'field-label', '时间戳 → 日期时间'));
    f1.appendChild(mkRow([tsInp, mkBtn('解析', renderFromTs, 'btn-primary'), mkBtn('填入当前', function () {
      tsInp.value = String(Math.floor(Date.now() / 1000));
      renderFromTs();
    })]));
    p1.appendChild(f1);
    var f2 = el('div', 'field');
    f2.appendChild(el('label', 'field-label', '日期时间 → 时间戳'));
    f2.appendChild(mkRow([dtInp, mkBtn('转换', renderFromDate)]));
    p1.appendChild(f2);
    p1.appendChild(status);

    var p2 = mkPanel('结果');
    p2.appendChild(nowBox);
    p2.appendChild(out.wrap);

    host.appendChild(mkHead(TOOL_MAP.time, [mkBtn('解析当前', function () {
      tsInp.value = String(Math.floor(Date.now() / 1000));
      renderFromTs();
    }, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    nowStamp();
    var timer = setInterval(nowStamp, 1000);
    onCleanup(function () { clearInterval(timer); });
    tsInp.value = String(Math.floor(Date.now() / 1000));
    renderFromTs();
  }

  function pad(s, n) {
    s = String(s);
    while (s.length < n) s += ' ';
    return s;
  }

  /* ============================================================
   * 工具 4 · 编码转换
   * ============================================================ */
  function buildEncode(host) {
    var input = mkTextarea({
      label: '原文', mono: true, rows: 8, key: 'encode.in',
      value: 'Hello 1024 开发者！https://example.com/docs?name=开发者&v=1'
    });
    var out = mkOut({ label: '转换结果', minHeight: '200px' });

    function apply(label, fn) {
      try {
        out.setText(fn(input.ta.value));
        setStatus(status, 'ok', '✓ ' + label + '完成 · ' + out.getText().length + ' 字符');
      } catch (e) {
        setStatus(status, 'err', '✗ ' + label + '失败：' + e.message);
      }
    }

    var status = el('div', 'status');

    var p1 = mkPanel('操作');
    p1.appendChild(el('div', 'field-hint', '转换在浏览器内完成，输入会保存到云端'));
    p1.appendChild(mkRow([
      mkBtn('URL 编码', function () { apply('URL 编码', function (s) { return encodeURIComponent(s); }); }, 'btn-primary'),
      mkBtn('URL 解码', function () { apply('URL 解码', function (s) { return decodeURIComponent(s.replace(/\+/g, ' ')); }); }),
      mkBtn('Base64 编码', function () { apply('Base64 编码', b64Encode); }),
      mkBtn('Base64 解码', function () { apply('Base64 解码', b64Decode); }),
      mkBtn('Hex 编码', function () { apply('Hex 编码', function (s) { return bytesToHex(utf8Bytes(s)); }); }),
      mkBtn('Hex 解码', function () { apply('Hex 解码', function (s) { return bytesToUtf8(hexToBytes(s)); }); }),
      mkBtn('Unicode 转义', function () { apply('Unicode 转义', unicodeEscape); }),
      mkBtn('Unicode 还原', function () { apply('Unicode 还原', unicodeUnescape); }),
      mkBtn('HTML 转义', function () { apply('HTML 转义', htmlEntities); }),
      mkBtn('HTML 反转义', function () { apply('HTML 反转义', htmlUnescape); }),
      mkBtn('结果回填输入', function () { input.ta.value = out.getText(); }),
      mkBtn('清空', function () { input.ta.value = ''; out.setText(''); })
    ]));
    p1.appendChild(status);

    var p2 = mkPanel('文本');
    var io = el('div', 'io');
    io.appendChild(input.wrap);
    io.appendChild(out.wrap);
    p2.appendChild(io);

    host.appendChild(mkHead(TOOL_MAP.encode, [mkBtn('Base64 编码', function () { apply('Base64 编码', b64Encode); }, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    apply('Base64 编码', b64Encode);
  }

  /* ============================================================
   * 工具 5 · 哈希
   * ============================================================ */
  function buildHash(host) {
    var input = mkTextarea({
      label: '原文', mono: true, rows: 7, key: 'hash.in', value: '1024'
    });
    var keyInp = mkInput({ mono: true, placeholder: 'HMAC 密钥（留空则计算普通摘要）' });
    var algoSel = mkSelect([
      { value: 'MD5', label: 'MD5' }, { value: 'SHA-1', label: 'SHA-1' },
      { value: 'SHA-256', label: 'SHA-256' }, { value: 'SHA-512', label: 'SHA-512' }
    ], 'SHA-256');
    var fmtSel = mkSelect([{ value: 'hex', label: 'Hex（十六进制）' }, { value: 'base64', label: 'Base64' }], 'hex');
    var out = mkOut({ label: '摘要结果', minHeight: '110px' });
    var status = el('div', 'status');

    function run() {
      var t = input.ta.value;
      if (!t) { out.setText(''); setStatus(status, '', '等待输入…'); return; }
      if (t.length > 400000) { setStatus(status, 'err', '✗ 输入过大（> 400K 字符），请精简后再试'); return; }
      try {
        var t0 = (performance && performance.now) ? performance.now() : Date.now();
        var res = computeHash(algoSel.value, t, fmtSel.value, keyInp.value || null);
        var t1 = (performance && performance.now) ? performance.now() : Date.now();
        out.setText(res);
        setStatus(status, 'ok', '✓ ' + (keyInp.value ? 'HMAC-' : '') + algoSel.value + ' · ' +
          res.length + ' 字符 · 耗时 ' + (t1 - t0).toFixed(2) + 'ms · 输入 ' + utf8Bytes(t).length + ' 字节');
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
      }
    }

    var upperBtn = mkBtn('转大写', function () {
      out.setText(out.getText().toUpperCase());
    });

    var p1 = mkPanel('配置');
    p1.appendChild(mkRow([
      el('span', 'field-label', '算法'), algoSel,
      el('span', 'field-label', '输出'), fmtSel,
      mkBtn('计算', run, 'btn-primary'),
      mkBtn('示例', function () { input.ta.value = '1024 开发者'; run(); }),
      mkBtn('清空', function () { input.ta.value = ''; keyInp.value = ''; out.setText(''); })
    ]));
    var kf = el('div', 'field');
    kf.appendChild(el('label', 'field-label', 'HMAC 密钥（可选）'));
    kf.appendChild(keyInp);
    p1.appendChild(kf);
    p1.appendChild(el('div', 'hint-box', 'MD5 / SHA-1 / SHA-256 / SHA-512 与 HMAC 均为本页纯 JS 实现，不依赖任何外部库和网络请求，断网可用。'));

    var p2 = mkPanel('文本');
    var io = el('div', 'io');
    io.appendChild(input.wrap);
    var rightCol = el('div', 'field');
    rightCol.appendChild(out.head);
    out.head.appendChild(upperBtn);
    rightCol.appendChild(out.pre);
    rightCol.appendChild(status);
    io.appendChild(rightCol);
    p2.appendChild(io);

    host.appendChild(mkHead(TOOL_MAP.hash, [mkBtn('计算', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    input.ta.addEventListener('input', debounce(run, 300));
    keyInp.addEventListener('input', debounce(run, 300));
    [algoSel, fmtSel].forEach(function (s) { s.addEventListener('change', run); });
    run();
  }

  /* ============================================================
   * 工具 6 · 生成器（UUID / 密码）
   * ============================================================ */
  function buildGen(host) {
    var countInp = mkInput({ type: 'number', value: '5', min: '1', max: '200' });
    countInp.style.maxWidth = '90px';
    var upperChk = mkCheck('大写', false);
    var dashChk = mkCheck('保留连字符', true);
    var uuidOut = el('div', 'result-list');

    function genUuid() {
      var n = Math.max(1, Math.min(200, parseInt(countInp.value, 10) || 1));
      uuidOut.innerHTML = '';
      for (var i = 0; i < n; i++) {
        var u = uuidV4();
        if (!dashChk.input.checked) u = u.replace(/-/g, '');
        if (upperChk.input.checked) u = u.toUpperCase();
        var row = el('div', 'result-item');
        row.appendChild(el('span', 'ri-txt', u));
        row.appendChild(mkBtn('复制', (function (v) {
          return function () { copyText(v, 'UUID'); };
        })(u), 'btn-mini'));
        uuidOut.appendChild(row);
      }
    }

    var lenInp = mkInput({ type: 'number', value: '16', min: '4', max: '128' });
    lenInp.style.maxWidth = '90px';
    var pwCount = mkInput({ type: 'number', value: '5', min: '1', max: '50' });
    pwCount.style.maxWidth = '90px';
    var cUpper = mkCheck('大写字母', true);
    var cDigit = mkCheck('数字', true);
    var cSymbol = mkCheck('符号', true);
    var cAmb = mkCheck('排除易混字符 (il1O0)', true);
    var pwOut = el('div', 'result-list');
    var strength = el('div', 'status');

    function genPw() {
      var n = Math.max(1, Math.min(50, parseInt(pwCount.value, 10) || 1));
      var len = Math.max(4, Math.min(128, parseInt(lenInp.value, 10) || 16));
      pwOut.innerHTML = '';
      var first = null;
      for (var i = 0; i < n; i++) {
        var p = randomPassword({
          length: len, upper: cUpper.input.checked, digit: cDigit.input.checked,
          symbol: cSymbol.input.checked, noAmbiguous: cAmb.input.checked
        });
        if (first === null) first = p;
        var row = el('div', 'result-item');
        row.appendChild(el('span', 'ri-txt', p));
        row.appendChild(mkBtn('复制', (function (v) {
          return function () { copyText(v, '密码'); };
        })(p), 'btn-mini'));
        pwOut.appendChild(row);
      }
      if (first !== null) {
        var s = passwordStrength(first);
        var pct = Math.round(s.score / 6 * 100);
        var color = s.score >= 4 ? 'var(--ok)' : (s.score >= 3 ? 'var(--warn)' : 'var(--err)');
        strength.innerHTML = '';
        var bar = el('div', 'meter');
        var fill = el('i');
        fill.style.width = pct + '%';
        fill.style.background = color;
        bar.appendChild(fill);
        var txt = el('div', null, '强度：' + s.level + '（' + s.score + '/6）· 估算熵 ' + s.entropy + ' bit');
        strength.appendChild(txt);
        strength.appendChild(bar);
        strength.className = 'status';
      }
    }

    var p1 = mkPanel('UUID v4');
    p1.appendChild(mkRow([el('span', 'field-label', '数量'), countInp, upperChk.wrap, dashChk.wrap,
      mkBtn('生成', genUuid, 'btn-primary'),
      mkBtn('复制全部', function () {
        var all = Array.prototype.map.call(uuidOut.querySelectorAll('.ri-txt'), function (n) { return n.textContent; }).join('\n');
        copyText(all, 'UUID 列表');
      })]));
    p1.appendChild(uuidOut);

    var p2 = mkPanel('随机密码');
    p2.appendChild(mkRow([el('span', 'field-label', '长度'), lenInp, el('span', 'field-label', '数量'), pwCount,
      mkBtn('生成', genPw, 'btn-primary'),
      mkBtn('复制全部', function () {
        var all = Array.prototype.map.call(pwOut.querySelectorAll('.ri-txt'), function (n) { return n.textContent; }).join('\n');
        copyText(all, '密码列表');
      })]));
    p2.appendChild(mkRow([cUpper.wrap, cDigit.wrap, cSymbol.wrap, cAmb.wrap]));
    p2.appendChild(strength);
    p2.appendChild(pwOut);
    p2.appendChild(el('div', 'hint-box', '随机数取自浏览器 crypto.getRandomValues（真随机源），不上传、不落盘。'));

    host.appendChild(mkHead(TOOL_MAP.gen, [mkBtn('生成全部', function () { genUuid(); genPw(); }, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    genUuid();
    genPw();
  }

  /* ============================================================
   * 工具 7 · Cron
   * ============================================================ */
  var CRON_PRESETS = [
    ['每分钟', '* * * * *'],
    ['每 5 分钟', '*/5 * * * *'],
    ['每天 9:00', '0 9 * * *'],
    ['工作日 9:30', '30 9 * * 1-5'],
    ['每周一 3:00', '0 3 * * 1'],
    ['每月 1 号', '0 0 1 * *'],
    ['每季首日', '0 0 1 1,4,7,10 *'],
    ['每天 8/12/18 点', '0 8,12,18 * * *'],
    ['含秒：每 30 秒', '*/30 * * * * *']
  ];

  function buildCron(host) {
    var inp = mkInput({ mono: true, value: '0 9 * * 1-5', placeholder: '分 时 日 月 周' });
    var status = el('div', 'status');
    var descBox = el('div', 'status ok');
    var fieldBox = el('div', 'result-list');
    var nextBox = el('div', 'result-list');

    function run() {
      fieldBox.innerHTML = '';
      nextBox.innerHTML = '';
      var expr = inp.value.trim();
      if (!expr) { setStatus(status, '', '请输入 Cron 表达式'); return; }
      try {
        var f = parseCron(expr);
        setStatus(status, 'ok', '✓ 语法正确（' + (f.hasSec ? '6 段：含秒' : '5 段：标准') + '）');
        descBox.textContent = '含义：' + cronDescribe(expr);
        var names = [['秒', f.sec], ['分', f.min], ['时', f.hour], ['日', f.dom], ['月', f.month], ['周', f.dow]];
        names.forEach(function (n) {
          if (!f.hasSec && n[0] === '秒') return;
          var row = el('div', 'result-item');
          row.appendChild(el('span', null, n[0]));
          var v = n[1].values;
          row.appendChild(el('span', 'ri-txt', v ? v.join(', ') : '*（任意）'));
          fieldBox.appendChild(row);
        });
        var res = cronNextTimes(expr, 5, new Date());
        if (!res.times.length) {
          nextBox.appendChild(el('div', 'status warn', '未来 10 年内没有匹配的执行时间，请检查表达式'));
        } else {
          res.times.forEach(function (d, i) {
            var row = el('div', 'result-item');
            row.appendChild(el('span', null, '#' + (i + 1)));
            row.appendChild(el('span', 'ri-txt', formatDate(d, TZ_LIST[0].id) + '　(' + relativeTime(d.getTime()) + ')'));
            nextBox.appendChild(row);
          });
        }
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
        descBox.textContent = '含义：—';
      }
    }

    var chips = el('div', 'chips');
    CRON_PRESETS.forEach(function (p) {
      chips.appendChild(mkBtn(p[0] + '  ' + p[1], function () { inp.value = p[1]; run(); }, 'chip'));
    });

    var p1 = mkPanel('表达式');
    p1.appendChild(mkRow([inp, mkBtn('解析', run, 'btn-primary')]));
    p1.appendChild(status);
    p1.appendChild(descBox);
    p1.appendChild(el('div', 'hint-box', '格式：<code>分 时 日 月 周</code>，可加秒变成 6 段。支持 <code>*</code> <code>*/n</code> <code>a-b</code> <code>a,b</code>，月份可用 JAN-DEC、星期可用 SUN-SAT。'));

    var p2 = mkPanel('字段拆解 / 未来 5 次执行');
    var io = el('div', 'io');
    io.appendChild(fieldBox);
    io.appendChild(nextBox);
    p2.appendChild(io);

    var p3 = mkPanel('常用示例');
    p3.appendChild(chips);

    host.appendChild(mkHead(TOOL_MAP.cron, [mkBtn('解析', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    host.appendChild(p3);
    inp.addEventListener('input', debounce(run, 300));
    run();
  }

  /* ============================================================
   * 工具 8 · 颜色
   * ============================================================ */
  function buildColor(host) {
    var hexInp = mkInput({ mono: true, value: '#4f46e5' });
    var picker = mkInput({ type: 'color', value: '#4f46e5' });
    picker.style.maxWidth = '56px';
    picker.style.padding = '2px';
    var fgInp = mkInput({ mono: true, value: '#ffffff' });
    var bigSw = el('div', 'big-swatch');
    var kvBox = el('div');
    var contrastBox = el('div', 'status');
    var scaleBox = el('div', 'swatches');
    var harmonyBox = el('div', 'swatches');
    var status = el('div', 'status');

    function swatch(hex, label) {
      var s = el('div', 'swatch');
      var c = el('div', 'sw-color');
      c.style.background = hex;
      var m = el('div', 'sw-meta');
      m.appendChild(el('b', null, label || ''));
      m.appendChild(el('span', null, hex));
      s.appendChild(c);
      s.appendChild(m);
      s.title = '点击复制 ' + hex;
      s.addEventListener('click', function () { copyText(hex, '色值'); });
      return s;
    }

    function run() {
      var hex;
      try {
        hex = normalizeHex(hexInp.value);
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
        return;
      }
      hexInp.value = hex;
      picker.value = hex;
      bigSw.style.background = hex;
      bigSw.style.color = readableTextColor(hex);
      bigSw.textContent = hex.toUpperCase();
      var rgb = hexToRgb(hex);
      var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      kvBox.innerHTML = '';
      kvBox.appendChild(mkKv([
        ['HEX', hex.toUpperCase()],
        ['RGB', 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')'],
        ['RGBA', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)'],
        ['HSL', 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)'],
        ['INT', String((rgb.r << 16) | (rgb.g << 8) | rgb.b)]
      ]));
      scaleBox.innerHTML = '';
      colorScale(hex).forEach(function (s) { scaleBox.appendChild(swatch(s.hex, s.label)); });
      harmonyBox.innerHTML = '';
      var hm = harmonyColors(hex);
      harmonyBox.appendChild(swatch(hm.complementary[0], '互补'));
      hm.analogous.forEach(function (c, i) { harmonyBox.appendChild(swatch(c, i === 0 ? '类似 -30' : '类似 +30')); });
      hm.triadic.forEach(function (c, i) { harmonyBox.appendChild(swatch(c, i === 0 ? '三角 A' : '三角 B')); });
      hm.split.forEach(function (c, i) { harmonyBox.appendChild(swatch(c, i === 0 ? '分裂 A' : '分裂 B')); });
      runContrast(hex);
      setStatus(status, 'ok', '✓ 已解析 ' + hex);
    }

    function runContrast(bg) {
      var fg;
      try { fg = normalizeHex(fgInp.value); } catch (e) {
        contrastBox.className = 'status err';
        contrastBox.textContent = '✗ 前景色 ' + e.message;
        return;
      }
      fgInp.value = fg;
      var r = contrastRatio(bg, fg);
      var rr = Math.round(r * 100) / 100;
      var kind = rr >= 7 ? 'ok' : (rr >= 4.5 ? 'ok' : (rr >= 3 ? 'warn' : 'err'));
      contrastBox.className = 'status ' + kind;
      contrastBox.textContent = '对比度 ' + rr + ' : 1　·　正文 AA(4.5) ' + (rr >= 4.5 ? '通过' : '未通过') +
        '　AAA(7) ' + (rr >= 7 ? '通过' : '未通过') + '　大字号 AA(3) ' + (rr >= 3 ? '通过' : '未通过');
    }

    var p1 = mkPanel('颜色');
    p1.appendChild(mkRow([picker, hexInp, mkBtn('解析', run, 'btn-primary'),
      mkBtn('随机', function () {
        var h = rgbToHex(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));
        hexInp.value = h; run();
      }),
      mkBtn('示例', function () { hexInp.value = '#4f46e5'; run(); })]));
    p1.appendChild(bigSw);
    p1.appendChild(kvBox);
    p1.appendChild(status);

    var p2 = mkPanel('对比度检查（WCAG 2.1）');
    p2.appendChild(mkRow([el('span', 'field-label', '前景 / 文字色'), fgInp,
      mkBtn('检查', function () { run(); }, 'btn-primary'),
      mkBtn('自动取最佳文字色', function () { fgInp.value = readableTextColor(normalizeHex(hexInp.value)); run(); })]));
    p2.appendChild(contrastBox);

    var p3 = mkPanel('色阶（点击复制）');
    p3.appendChild(scaleBox);
    var p4 = mkPanel('协调色（点击复制）');
    p4.appendChild(harmonyBox);

    host.appendChild(mkHead(TOOL_MAP.color, [mkBtn('解析', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    host.appendChild(p3);
    host.appendChild(p4);
    hexInp.addEventListener('input', debounce(run, 250));
    fgInp.addEventListener('input', debounce(function () { runContrast(normalizeHex(hexInp.value)); }, 250));
    picker.addEventListener('input', function () { hexInp.value = picker.value; run(); });
    run();
  }

  /* ============================================================
   * 工具 9 · 文本 Diff
   * ============================================================ */
  function buildDiff(host) {
    var a = mkTextarea({ label: '原文 A', mono: true, rows: 10, key: 'diff.a', value: 'function hello() {\n  console.log("v1");\n  return 1;\n}' });
    var b = mkTextarea({ label: '新文 B', mono: true, rows: 10, key: 'diff.b', value: 'function hello(name) {\n  console.log("v2", name);\n  return 2;\n}' });
    var cIgnoreSpace = mkCheck('忽略空白差异', false);
    var cIgnoreCase = mkCheck('忽略大小写', false);
    var status = el('div', 'status');
    var view = el('div', 'diff-out');
    view.style.minHeight = '160px';

    function run() {
      view.innerHTML = '';
      var rows = diffLines(a.ta.value, b.ta.value, {
        ignoreSpace: cIgnoreSpace.input.checked,
        ignoreCase: cIgnoreCase.input.checked
      });
      var add = 0, del = 0, eq = 0;
      rows.forEach(function (r) {
        if (r.type === 'add') add++;
        else if (r.type === 'del') del++;
        else eq++;
        var line = el('div', 'diff-line ' + r.type);
        line.appendChild(el('span', 'dl-no', (r.ln === null ? '' : r.ln) + ' / ' + (r.rn === null ? '' : r.rn)));
        line.appendChild(el('span', 'dl-sign', r.type === 'add' ? '+' : (r.type === 'del' ? '-' : ' ')));
        line.appendChild(el('span', 'dl-txt', r.text || ' '));
        view.appendChild(line);
      });
      setStatus(status, 'ok', '✓ 共 ' + rows.length + ' 行：新增 ' + add + ' · 删除 ' + del + ' · 未变 ' + eq);
    }

    var p1 = mkPanel('配置');
    p1.appendChild(mkRow([cIgnoreSpace.wrap, cIgnoreCase.wrap,
      mkBtn('对比', run, 'btn-primary'),
      mkBtn('交换 A / B', function () {
        var t = a.ta.value; a.ta.value = b.ta.value; b.ta.value = t; run();
      }),
      mkBtn('示例', function () {
        a.ta.value = '{\n  "name": "devkit",\n  "version": "0.9.0",\n  "tools": 10\n}';
        b.ta.value = '{\n  "name": "devkit",\n  "version": "1.0.0",\n  "tools": 12,\n  "author": "1024"\n}';
        run();
      }),
      mkBtn('清空', function () { a.ta.value = ''; b.ta.value = ''; view.innerHTML = ''; })]));
    p1.appendChild(status);

    var p2 = mkPanel('文本');
    var io = el('div', 'io');
    io.appendChild(a.wrap);
    io.appendChild(b.wrap);
    p2.appendChild(io);

    var p3 = mkPanel('差异视图');
    p3.appendChild(view);
    p3.appendChild(el('div', 'hint-box', '行号格式为「原文行 / 新文行」，基于 LCS 最长公共子序列计算。'));

    host.appendChild(mkHead(TOOL_MAP.diff, [mkBtn('对比', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    host.appendChild(p3);
    run();
  }

  /* ============================================================
   * 工具 10 · JWT
   * ============================================================ */
  function buildJwt(host) {
    var input = mkTextarea({
      label: 'JWT Token', mono: true, rows: 5, key: 'jwt.in',
      placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDI0In0.xxx'
    });
    var status = el('div', 'status');
    var headOut = mkOut({ label: 'Header', minHeight: '80px' });
    var bodyOut = mkOut({ label: 'Payload', minHeight: '140px' });
    var claimBox = el('div', 'result-list');
    var sigBox = el('div', 'status');

    function run() {
      var t = input.ta.value.trim();
      claimBox.innerHTML = '';
      if (!t) { setStatus(status, '', '请输入 Token'); return; }
      try {
        var j = decodeJwt(t);
        headOut.pre.innerHTML = jsonEscapeHtml(JSON.stringify(j.header, null, 2));
        bodyOut.pre.innerHTML = jsonEscapeHtml(JSON.stringify(j.payload, null, 2));
        var now = Date.now();
        var items = [];
        if (j.claims.iat) items.push(['签发时间 iat', j.claims.iat.iso + '（' + relativeTime(j.claims.iat.date.getTime()) + '）']);
        if (j.claims.nbf) items.push(['生效时间 nbf', j.claims.nbf.iso + '（' + (j.claims.nbf.date.getTime() > now ? '尚未生效' : '已生效') + '）']);
        if (j.claims.exp) {
          var exp = j.claims.exp;
          var leftMs = exp.date.getTime() - now;
          var state = leftMs <= 0 ? '已过期（' + relativeTime(exp.date.getTime()) + '）' : '剩余 ' + humanLeft(leftMs);
          items.push(['过期时间 exp', exp.iso + '　' + state]);
        } else {
          items.push(['过期时间 exp', '未设置']);
        }
        if (typeof j.payload.iss === 'string') items.push(['签发者 iss', j.payload.iss]);
        if (typeof j.payload.sub === 'string') items.push(['主体 sub', j.payload.sub]);
        if (typeof j.payload.aud !== 'undefined') items.push(['受众 aud', String(j.payload.aud)]);
        if (Array.isArray(j.payload.scopes) || typeof j.payload.scope === 'string') items.push(['权限 scope', String(j.payload.scope || j.payload.scopes)]);
        items.forEach(function (it) {
          var row = el('div', 'result-item');
          row.appendChild(el('span', null, it[0]));
          row.appendChild(el('span', 'ri-txt', it[1]));
          claimBox.appendChild(row);
        });
        sigBox.className = j.signature ? 'status' : 'status warn';
        sigBox.textContent = j.signature
          ? '签名段（Signature）：' + j.signature.slice(0, 60) + (j.signature.length > 60 ? '…（共 ' + j.signature.length + ' 字符）' : '') + '　—　本工具只做解码，不校验签名。'
          : '该 Token 没有签名段（alg 可能为 none），请勿在生产环境信任。';
        var alg = j.header && j.header.alg;
        setStatus(status, 'ok', '✓ 解析成功 · 算法 ' + (alg || '未知') + ' · ' + Object.keys(j.payload).length + ' 个声明');
      } catch (e) {
        setStatus(status, 'err', '✗ 解析失败：' + e.message);
        headOut.setText('');
        bodyOut.setText('');
        sigBox.textContent = '';
      }
    }

    function fillSample() {
      var h = b64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '').replace(/\+/g, '-').split('/').join('_');
      var exp = Math.floor(Date.now() / 1000) + 3600 * 24 * 7;
      var p = b64Encode(JSON.stringify({ sub: '1024', name: '开发者', role: 'admin', iat: Math.floor(Date.now() / 1000), exp: exp })).replace(/=+$/, '').replace(/\+/g, '-').split('/').join('_');
      input.ta.value = h + '.' + p + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    }

    var p1 = mkPanel('Token');
    p1.appendChild(input.wrap);
    p1.appendChild(mkRow([
      mkBtn('解析', run, 'btn-primary'),
      mkBtn('示例', function () {
        fillSample();
        run();
      }),
      mkBtn('清空', function () { input.ta.value = ''; headOut.setText(''); bodyOut.setText(''); claimBox.innerHTML = ''; sigBox.textContent = ''; })
    ]));
    p1.appendChild(status);

    var p2 = mkPanel('解析结果');
    var io = el('div', 'io');
    io.appendChild(headOut.wrap);
    io.appendChild(bodyOut.wrap);
    p2.appendChild(io);
    p2.appendChild(claimBox);
    p2.appendChild(sigBox);
    p2.appendChild(el('div', 'hint-box', '全程在本地解码；JWT 是 Base64 编码而非加密，请勿在 Payload 中存放敏感信息。'));

    host.appendChild(mkHead(TOOL_MAP.jwt, [mkBtn('解析', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    input.ta.addEventListener('input', debounce(run, 350));
    if (!input.ta.value.trim()) fillSample();
    run();
  }

  function humanLeft(ms) {
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var hh = Math.floor((s % 86400) / 3600);
    var mm = Math.floor((s % 3600) / 60);
    if (d > 0) return d + ' 天 ' + hh + ' 小时';
    if (hh > 0) return hh + ' 小时 ' + mm + ' 分';
    return mm + ' 分 ' + (s % 60) + ' 秒';
  }

  /* ============================================================
   * 工具 11 · 进制转换
   * ============================================================ */
  var BASES = [
    { value: '2', label: '二进制 (2)' }, { value: '8', label: '八进制 (8)' },
    { value: '10', label: '十进制 (10)' }, { value: '16', label: '十六进制 (16)' },
    { value: '32', label: '三十二进制 (32)' }, { value: '36', label: '三十六进制 (36)' }
  ];

  function buildBase(host) {
    var inp = mkInput({ mono: true, value: '1024' });
    var fromSel = mkSelect(BASES, '10');
    var toSel = mkSelect(BASES, '16');
    var out = mkOut({ label: '转换结果', minHeight: '90px' });
    var status = el('div', 'status');
    var allBox = el('div', 'result-list');

    function run() {
      try {
        var res = convertBase(inp.value, fromSel.value, toSel.value);
        out.setText(res);
        setStatus(status, 'ok', '✓ ' + inp.value.trim() + ' (' + fromSel.value + ') = ' + res + ' (' + toSel.value + ')');
        allBox.innerHTML = '';
        BASES.forEach(function (bs) {
          var v;
          try { v = convertBase(inp.value, fromSel.value, bs.value); } catch (e) { v = '—'; }
          var row = el('div', 'result-item');
          row.appendChild(el('span', null, 'Base ' + bs.value));
          row.appendChild(el('span', 'ri-txt', v));
          row.appendChild(mkBtn('复制', (function (x) { return function () { copyText(x, 'Base ' + bs.value); }; })(v), 'btn-mini'));
          allBox.appendChild(row);
        });
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
        out.setText('');
        allBox.innerHTML = '';
      }
    }

    var p1 = mkPanel('转换');
    p1.appendChild(mkRow([inp, el('span', 'field-label', '从'), fromSel, el('span', 'field-label', '到'), toSel,
      mkBtn('转换', run, 'btn-primary'),
      mkBtn('互换进制', function () {
        var t = fromSel.value; fromSel.value = toSel.value; toSel.value = t; run();
      })]));
    p1.appendChild(status);

    var p2 = mkPanel('结果 / 各进制一览');
    var io = el('div', 'io');
    io.appendChild(out.wrap);
    io.appendChild(allBox);
    p2.appendChild(io);
    p2.appendChild(el('div', 'hint-box', '基于 BigInt 实现，支持任意大整数（远超 Number 安全范围），不会精度丢失。'));

    host.appendChild(mkHead(TOOL_MAP.base, [mkBtn('转换', run, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    inp.addEventListener('input', debounce(run, 250));
    [fromSel, toSel].forEach(function (s) { s.addEventListener('change', run); });
    run();
  }

  /* ============================================================
   * 工具 12 · URL / QueryString
   * ============================================================ */
  function buildUrl(host) {
    var urlInp = mkInput({ mono: true, value: 'https://example.com/docs?name=%E5%BC%80%E5%8F%91%E8%80%85&page=2&tag=dev#top' });
    var urlBox = el('div');
    var status = el('div', 'status');

    function parseNow() {
      urlBox.innerHTML = '';
      try {
        var u = parseUrl(urlInp.value);
        urlBox.appendChild(mkKv([
          ['origin', u.origin], ['protocol', u.protocol], ['host', u.host],
          ['port', u.port || '(默认)'], ['pathname', u.pathname],
          ['search', u.search || '(空)'], ['hash', u.hash || '(空)']
        ]));
        if (u.params.length) {
          urlBox.appendChild(el('div', 'field-label', '查询参数'));
          var tbl = el('table', 'tbl');
          var thead = el('thead');
          var htr = el('tr');
          ['Key', 'Value', ''].forEach(function (t) { htr.appendChild(el('th', null, t)); });
          thead.appendChild(htr);
          tbl.appendChild(thead);
          var tb = el('tbody');
          u.params.forEach(function (p) {
            var tr = el('tr');
            tr.appendChild(el('td', 'mono', p.key));
            tr.appendChild(el('td', 'mono', p.value));
            var td = el('td');
            td.appendChild(mkBtn('复制值', (function (v) { return function () { copyText(v, '参数值'); }; })(p.value), 'btn-mini'));
            tr.appendChild(td);
            tb.appendChild(tr);
          });
          tbl.appendChild(tb);
          urlBox.appendChild(tbl);
        }
        setStatus(status, 'ok', '✓ URL 解析成功 · ' + u.params.length + ' 个查询参数');
      } catch (e) {
        setStatus(status, 'err', '✗ ' + e.message);
      }
    }

    var qsInput = mkTextarea({
      label: 'QueryString', mono: true, rows: 5, key: 'url.qs',
      value: 'name=开发者&page=2&tag=dev&tag=tool&empty='
    });
    var kvBox = el('div', 'result-list');
    var qsOut = mkOut({ label: '生成结果', minHeight: '70px' });
    var encodeChk = mkCheck('生成时转义（encodeURIComponent）', true);

    function toTable() {
      kvBox.innerHTML = '';
      var pairs = parseQuery(qsInput.ta.value);
      if (!pairs.length) { kvBox.appendChild(el('div', 'status warn', '没有解析到参数')); return; }
      pairs.forEach(function (p) {
        var row = el('div', 'row');
        var k = mkInput({ mono: true, value: p.key });
        var v = mkInput({ mono: true, value: p.value });
        k.className += ' grow';
        v.className += ' grow';
        row.appendChild(k);
        row.appendChild(v);
        row.appendChild(mkBtn('删除', function () { row.parentNode.removeChild(row); }, 'btn-mini'));
        kvBox.appendChild(row);
      });
    }

    function fromTable() {
      var pairs = [];
      Array.prototype.forEach.call(kvBox.querySelectorAll('.row'), function (row) {
        var ins = row.querySelectorAll('input');
        if (ins.length >= 2) pairs.push({ key: ins[0].value, value: ins[1].value });
      });
      var q = buildQuery(pairs, encodeChk.input.checked);
      qsOut.setText(q);
      qsInput.ta.value = q;
      var json = {};
      pairs.forEach(function (p) {
        if (Object.prototype.hasOwnProperty.call(json, p.key)) {
          if (!Array.isArray(json[p.key])) json[p.key] = [json[p.key]];
          json[p.key].push(p.value);
        } else json[p.key] = p.value;
      });
      jsonOut.setText(JSON.stringify(json, null, 2));
    }

    var jsonOut = mkOut({ label: 'JSON 形式', minHeight: '70px' });

    var p1 = mkPanel('URL 解析');
    p1.appendChild(mkRow([urlInp, mkBtn('解析', parseNow, 'btn-primary'),
      mkBtn('复制 URL', function () { copyText(urlInp.value, 'URL'); })]));
    p1.appendChild(status);
    p1.appendChild(urlBox);

    var p2 = mkPanel('QueryString ↔ 键值表 ↔ JSON');
    var io = el('div', 'io');
    var leftCol = el('div', 'field');
    leftCol.appendChild(el('label', 'field-label', 'QueryString 原文'));
    leftCol.appendChild(qsInput.ta);
    leftCol.appendChild(mkRow([
      mkBtn('解析为表格', toTable, 'btn-primary'),
      mkBtn('从表格生成', fromTable, 'btn-primary'),
      mkBtn('新增一行', function () {
        var row = el('div', 'row');
        var k = mkInput({ mono: true, value: 'key' });
        var v = mkInput({ mono: true, value: 'value' });
        k.className += ' grow';
        v.className += ' grow';
        row.appendChild(k); row.appendChild(v);
        row.appendChild(mkBtn('删除', function () { row.parentNode.removeChild(row); }, 'btn-mini'));
        kvBox.appendChild(row);
      }),
      encodeChk.wrap
    ]));
    leftCol.appendChild(qsOut.wrap);
    io.appendChild(leftCol);
    var rightCol = el('div', 'field');
    rightCol.appendChild(el('label', 'field-label', '键值表（可编辑）'));
    rightCol.appendChild(kvBox);
    rightCol.appendChild(jsonOut.wrap);
    io.appendChild(rightCol);
    p2.appendChild(io);

    host.appendChild(mkHead(TOOL_MAP.url, [mkBtn('解析 URL', parseNow, 'btn-primary')]));
    host.appendChild(p1);
    host.appendChild(p2);
    urlInp.addEventListener('input', debounce(parseNow, 300));
    parseNow();
    toTable();
    fromTable();
  }

  /* ============================================================
   * 工具清单
   * ============================================================ */
  var TOOLS = [
    { id: 'json', name: 'JSON 格式化', group: '数据处理', icon: '{}', desc: '格式化、压缩、校验、按路径取值，实时语法高亮', build: buildJson },
    { id: 'diff', name: '文本差异对比', group: '数据处理', icon: '≠', desc: '基于 LCS 的行级 Diff，支持忽略空白与大小写', build: buildDiff },
    { id: 'base', name: '进制转换', group: '数据处理', icon: '0x', desc: '2 / 8 / 10 / 16 / 32 / 36 进制互转，BigInt 无精度损失', build: buildBase },
    { id: 'url', name: 'URL 与 QueryString', group: '数据处理', icon: '?', desc: 'URL 结构解析、查询参数 ↔ 键值表 ↔ JSON 互转', build: buildUrl },
    { id: 'encode', name: '编码转换', group: '编码与安全', icon: 'Aa', desc: 'URL / Base64 / Hex / Unicode / HTML 实体，双向转换', build: buildEncode },
    { id: 'hash', name: '哈希与 HMAC', group: '编码与安全', icon: '#', desc: 'MD5、SHA-1/256/512 与 HMAC，纯 JS 实现，断网可用', build: buildHash },
    { id: 'jwt', name: 'JWT 解析', group: '编码与安全', icon: '🔑', desc: '解码 Header / Payload，自动换算签发与过期时间', build: buildJwt },
    { id: 'time', name: '时间戳转换', group: '时间与调度', icon: '⏱', desc: '秒 / 毫秒互转，八时区对照，相对时间一屏看完', build: buildTime },
    { id: 'cron', name: 'Cron 表达式', group: '时间与调度', icon: '⏰', desc: '语义化解释、字段拆解、未来 5 次执行时间预测', build: buildCron },
    { id: 'color', name: '颜色与对比度', group: '设计与生成', icon: '◑', desc: 'HEX/RGB/HSL 互转、WCAG 对比度、色阶与协调色', build: buildColor },
    { id: 'gen', name: 'UUID 与密码生成', group: '设计与生成', icon: '⚄', desc: '加密级随机的 UUID v4 与可配置强度的安全密码', build: buildGen },
    { id: 'regex', name: '正则实验室', group: '文本处理', icon: '.*', desc: '实时高亮、捕获组表格、批量替换与常用表达式速查', build: buildRegex }
  ];

  var TOOL_MAP = {};
  TOOLS.forEach(function (t) { TOOL_MAP[t.id] = t; });

  var GROUPS = [];
  TOOLS.forEach(function (t) {
    if (GROUPS.indexOf(t.group) < 0) GROUPS.push(t.group);
  });

  /* ---------------- 侧边栏 ---------------- */
  function renderNav() {
    var nav = document.getElementById('nav');
    nav.innerHTML = '';
    var cur = currentId();

    var favs = favList();
    if (favs.length) {
      var g = el('div', 'nav-group');
      g.appendChild(el('div', 'nav-group-title', '常用'));
      favs.forEach(function (id) {
        var t = TOOL_MAP[id];
        if (t) g.appendChild(navItem(t, cur));
      });
      nav.appendChild(g);
    }

    GROUPS.forEach(function (name) {
      var g = el('div', 'nav-group');
      g.appendChild(el('div', 'nav-group-title', name));
      TOOLS.filter(function (t) { return t.group === name; }).forEach(function (t) {
        g.appendChild(navItem(t, cur));
      });
      nav.appendChild(g);
    });
    applyFilter(document.getElementById('q').value);
  }

  function navItem(t, cur) {
    var item = el('div', 'nav-item' + (cur === t.id ? ' active' : ''));
    item.appendChild(el('span', 'ni-ico', t.icon));
    item.appendChild(el('span', 'ni-name', t.name));
    var star = el('span', 'star' + (isFav(t.id) ? ' on' : ''), isFav(t.id) ? '★' : '☆');
    star.title = '收藏 / 取消收藏';
    star.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleFav(t.id);
    });
    item.appendChild(star);
    item.addEventListener('click', function () { location.hash = '#' + t.id; });
    item.dataset.id = t.id;
    item.dataset.key = (t.name + ' ' + t.desc + ' ' + t.group + ' ' + t.id).toLowerCase();
    return item;
  }

  function applyFilter(q) {
    q = (q || '').trim().toLowerCase();
    var items = document.querySelectorAll('.nav-item');
    Array.prototype.forEach.call(items, function (it) {
      it.classList.toggle('hidden', q ? it.dataset.key.indexOf(q) < 0 : false);
    });
    var groups = document.querySelectorAll('.nav-group');
    Array.prototype.forEach.call(groups, function (g) {
      var visible = Array.prototype.filter.call(g.querySelectorAll('.nav-item'), function (i) { return !i.classList.contains('hidden'); });
      g.style.display = visible.length ? '' : 'none';
    });
    var main = document.getElementById('main');
    if (q && main.dataset.mode === 'home') renderHome(q);
  }

  /* ---------------- 首页 / 路由 ---------------- */
  function currentId() {
    var h = (location.hash || '').replace(/^#/, '');
    return TOOL_MAP[h] ? h : '';
  }

  function renderHome(filter) {
    var main = document.getElementById('main');
    main.dataset.mode = 'home';
    main.innerHTML = '';
    var wrap = el('div', 'wrap');

    var hero = el('div', 'hero');
    hero.appendChild(el('h2', null, 'DevKit 1024 · 程序员效率工具箱'));
    hero.appendChild(el('p', null, '12 款开发工具，计算在浏览器中完成；输入与设置保存在云端。'));
    var tags = el('div', 'hero-tags');
    ['JSON', '正则', '哈希', '时间戳', 'Cron', 'Diff', 'JWT', '进制', 'URL', '颜色', '随机', '编码'].forEach(function (t) {
      tags.appendChild(el('span', 'hero-tag', t));
    });
    hero.appendChild(tags);
    wrap.appendChild(hero);

    var q = (filter || '').trim().toLowerCase();
    var list = TOOLS.filter(function (t) {
      if (!q) return true;
      return (t.name + ' ' + t.desc + ' ' + t.group + ' ' + t.id).toLowerCase().indexOf(q) >= 0;
    });

    if (!list.length) {
      wrap.appendChild(el('div', 'status warn', '没有匹配「' + filter + '」的工具'));
    }

    var grid = el('div', 'cards');
    list.forEach(function (t) {
      var card = el('div', 'card');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      var top = el('div', 'card-top');
      top.appendChild(el('div', 'card-ico', t.icon));
      top.appendChild(el('h3', null, t.name));
      card.appendChild(top);
      card.appendChild(el('p', null, t.desc));
      card.appendChild(el('div', 'badge', '#' + t.group + (isFav(t.id) ? '  ★' : '')));
      card.addEventListener('click', function () { location.hash = '#' + t.id; });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.hash = '#' + t.id; }
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    var foot = el('footer', 'foot');
    foot.appendChild(el('div', null, 'DevKit 1024 · 程序员效率工具箱'));
    foot.appendChild(el('div', null, '按 ⌘K / Ctrl+K 唤起搜索，Esc 返回全部工具'));
    wrap.appendChild(foot);
    main.appendChild(wrap);
    main.scrollTop = 0;
  }

  function renderTool(id) {
    var main = document.getElementById('main');
    main.dataset.mode = 'tool';
    runCleanups();
    main.innerHTML = '';
    var wrap = el('div', 'wrap');
    var t = TOOL_MAP[id];
    try {
      t.build(wrap);
    } catch (e) {
      wrap.appendChild(el('div', 'status err', '工具加载失败：' + e.message));
    }
    var back = mkBtn('← 全部工具', function () { location.hash = ''; }, 'btn-mini');
    back.style.marginTop = '18px';
    wrap.appendChild(back);
    main.appendChild(wrap);
    main.scrollTop = 0;
    document.title = t.name + ' · DevKit 1024';
  }

  function route() {
    var id = currentId();
    if (id) renderTool(id); else renderHome('');
    renderNav();
    if (!id) document.title = 'DevKit 1024 · 程序员效率工具箱';
  }

  /* ---------------- 帮助弹窗 ---------------- */
  function toggleHelp(show) {
    var m = document.getElementById('help');
    if (show === undefined) m.classList.toggle('show');
    else m.classList.toggle('show', !!show);
  }

  /* ---------------- 主题 ---------------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    var b = document.getElementById('themeBtn');
    b.textContent = t === 'dark' ? '☀ 浅色' : '☾ 深色';
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    var saved = store('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var asked = null;
    try {
      asked = new URLSearchParams(window.location.search).get('theme');
    } catch (e) { asked = null; }
    applyTheme(asked === 'dark' || asked === 'light' ? asked : (saved || (prefersDark ? 'dark' : 'light')));

    document.getElementById('themeBtn').addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme');
      var next = now === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store('theme', next);
    });

    var q = document.getElementById('q');
    q.addEventListener('input', debounce(function () { applyFilter(q.value); }, 120));
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { q.value = ''; applyFilter(''); q.blur(); }
      if (e.key === 'Enter') {
        var first = document.querySelector('.nav-item:not(.hidden)');
        if (first) location.hash = '#' + first.dataset.id;
      }
    });

    document.getElementById('helpBtn').addEventListener('click', function () { toggleHelp(true); });
    document.getElementById('helpClose').addEventListener('click', function () { toggleHelp(false); });
    document.getElementById('help').addEventListener('click', function (e) {
      if (e.target === document.getElementById('help')) toggleHelp(false);
    });

    document.addEventListener('keydown', function (e) {
      var meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        q.focus();
        q.select();
      }
      if (e.key === 'Escape') toggleHelp(false);
    });

    window.addEventListener('hashchange', route);
    route();
  }

  async function start() {
    try { savedValues = await loadStorage(); init(); }
    catch (e) {
      document.querySelector('.app').innerHTML = '<div class="wrap"><div class="status err">云端数据加载失败，请检查登录和网络后刷新重试。</div></div>';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

