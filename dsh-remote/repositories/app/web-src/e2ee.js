/**
 * Shared WebCrypto End-to-End Encryption (E2EE v2) for @tianacloud/dsh-remote.
 *
 * Uses strictly standard WebCrypto APIs (`crypto.subtle`, `crypto.getRandomValues`)
 * so both Node.js (>=22) and modern browsers execute identical cryptography:
 *   - Ephemeral ECDH P-256 per session (Forward Secrecy)
 *   - HKDF-SHA256 + HMAC-SHA256 mutual transcript authentication bound to Host E2EE secret (anti-MITM)
 *   - Directional AES-256-GCM subkeys + deterministic 96-bit nonces (4B HKDF prefix + 8B monotonic seq)
 *   - Strict monotonic sequence checking + GCM AAD binding (anti-replay / anti-reorder)
 */

export const E2EE_PROTOCOL_VERSION = 2;
export const E2EE_ALGORITHM = 'ECDH-P256+HKDF-SHA256+AES-256-GCM';

export const MSG_E2EE_CLIENT_HELLO = 0x02;
export const MSG_E2EE_HOST_HELLO = 0x03;
export const MSG_E2EE_ERROR = 0x04;
export const MSG_E2EE_BOX = 0x30;
export const MSG_E2EE_CTRL = 0x31;
export const MAX_PLAINTEXT_BYTES = 1024 * 1024 - 64;
const MAX_QUEUE_BYTES = 8 * 1024 * 1024;
const MAX_QUEUE_FRAMES = 256;
const MAX_SEQ = 1n << 24n;
const MAX_KEY_BYTES = 32 * 1024 * 1024 * 1024;

const DIR_CLIENT_TO_HOST = 0x01;
const DIR_HOST_TO_CLIENT = 0x02;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const PROTOCOL_SALT = textEncoder.encode('dsh-remote-e2ee-v2');
const AUTH_INFO = textEncoder.encode('handshake-auth');
const C2H_TAG = textEncoder.encode('C2H-HELLO');
const H2C_TAG = textEncoder.encode('H2C-HELLO');
const INFO_C2H_KEY = textEncoder.encode('dsh-remote-e2ee-v2-c2h-key');
const INFO_H2C_KEY = textEncoder.encode('dsh-remote-e2ee-v2-h2c-key');
const INFO_C2H_IV = textEncoder.encode('dsh-remote-e2ee-v2-c2h-iv');
const INFO_H2C_IV = textEncoder.encode('dsh-remote-e2ee-v2-h2c-iv');

function getCrypto() {
  const c = globalThis.crypto;
  if (!c || !c.subtle) {
    throw new Error('WebCrypto API (crypto.subtle) is unavailable in this context (HTTPS or localhost required)');
  }
  return c;
}

export function concatBytes(...parts) {
  let total = 0;
  for (const p of parts) total += p.byteLength;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.byteLength;
  }
  return out;
}

export function base64UrlEncode(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < u8.length; i += 1) {
    bin += String.fromCharCode(u8[i]);
  }
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

export function base64UrlDecode(str) {
  const clean = String(str || '').trim();
  if (!clean || !/^[A-Za-z0-9_-]+$/.test(clean)) {
    throw new Error('Invalid base64url encoding');
  }
  const padLen = (4 - (clean.length % 4)) % 4;
  const b64 = clean.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat(padLen);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

export const PAIRING_KEY_PREFIX = 'dshk1_';

export function normalizePairingKey(secretStr) {
  const clean = String(secretStr || '').trim();
  return clean.startsWith(PAIRING_KEY_PREFIX) ? clean.slice(PAIRING_KEY_PREFIX.length) : clean;
}

export function decodeMasterSecret(secretStr) {
  const bytes = base64UrlDecode(normalizePairingKey(secretStr));
  if (bytes.byteLength !== 32) {
    throw new Error(`Invalid E2EE key length: expected 32 bytes, got ${bytes.byteLength}`);
  }
  return bytes;
}

export function formatPairingKey(secretStr) {
  const normalized = normalizePairingKey(secretStr);
  decodeMasterSecret(normalized);
  return `${PAIRING_KEY_PREFIX}${normalized}`;
}

export function generateE2eeSecretWeb() {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function computeKeyFingerprint(secretStr) {
  const bytes = decodeMasterSecret(secretStr);
  const digest = new Uint8Array(await getCrypto().subtle.digest('SHA-256', bytes));
  const parts = [];
  for (let i = 0; i < 6; i += 2) {
    parts.push(digest[i].toString(16).padStart(2, '0') + digest[i + 1].toString(16).padStart(2, '0'));
  }
  return parts.join(':');
}

async function deriveAuthKey(masterSecretBytes) {
  const subtle = getCrypto().subtle;
  const baseKey = await subtle.importKey('raw', masterSecretBytes, 'HKDF', false, ['deriveKey']);
  return await subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: PROTOCOL_SALT, info: AUTH_INFO },
    baseKey,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify'],
  );
}

async function signHmac(authKey, parts) {
  const sig = await getCrypto().subtle.sign('HMAC', authKey, concatBytes(...parts));
  return new Uint8Array(sig);
}

async function verifyHmac(authKey, parts, macBytes) {
  if (!(macBytes instanceof Uint8Array) || macBytes.byteLength !== 32) return false;
  return await getCrypto().subtle.verify('HMAC', authKey, macBytes, concatBytes(...parts));
}

export const MULTIPATH_CAPABILITIES = 'multipath-v1;assets-v1;ws-fragments-v1';
export function generateLogicalSessionId() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
}

function handshakeContext({ hostId, webId, logicalSessionId, ownerUserId, tenantId }) {
  if (typeof hostId !== 'string' || !hostId || hostId.length > 48 ||
      typeof webId !== 'string' || !webId || webId.length > 128) {
    throw new Error('Invalid E2EE target');
  }
  if (logicalSessionId === undefined) return textEncoder.encode(JSON.stringify([hostId, webId]));
  if (base64UrlDecode(logicalSessionId).length !== 16 ||
      ![ownerUserId, tenantId].every((id) => typeof id === 'string' && id.length > 0 && id.length <= 128)) {
    throw new Error('Invalid E2EE session identity');
  }
  return textEncoder.encode(JSON.stringify([E2EE_PROTOCOL_VERSION, MULTIPATH_CAPABILITIES,
    hostId, webId, logicalSessionId, ownerUserId, tenantId]));
}

async function deriveSessionKeys(masterSecretBytes, ecdhSharedBytes, clientNonce, hostNonce, context, control = false) {
  const subtle = getCrypto().subtle;
  const ikm = concatBytes(ecdhSharedBytes, masterSecretBytes);
  const salt = concatBytes(clientNonce, hostNonce, context);
  const baseKey = await subtle.importKey('raw', ikm, 'HKDF', false, ['deriveKey', 'deriveBits']);

  const info = (value) => control ? concatBytes(value, textEncoder.encode('-control')) : value;
  const [c2hKey, h2cKey, c2hIvBits, h2cIvBits] = await Promise.all([
    subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt, info: info(INFO_C2H_KEY) },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    ),
    subtle.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt, info: info(INFO_H2C_KEY) },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    ),
    subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: info(INFO_C2H_IV) }, baseKey, 32),
    subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: info(INFO_H2C_IV) }, baseKey, 32),
  ]);

  return {
    c2hKey,
    h2cKey,
    c2hIvPrefix: new Uint8Array(c2hIvBits),
    h2cIvPrefix: new Uint8Array(h2cIvBits),
  };
}

function buildAad(dirByte, seq) {
  const out = new Uint8Array(PROTOCOL_SALT.byteLength + 1 + 8);
  out.set(PROTOCOL_SALT, 0);
  out[PROTOCOL_SALT.byteLength] = dirByte;
  new DataView(out.buffer).setBigUint64(PROTOCOL_SALT.byteLength + 1, seq, false);
  return out;
}

function buildIv(prefix4, seq) {
  const iv = new Uint8Array(12);
  iv.set(prefix4, 0);
  new DataView(iv.buffer).setBigUint64(4, seq, false);
  return iv;
}

export class E2EECipherSession {
  constructor({ txKey, txIvPrefix, txDirByte, rxKey, rxIvPrefix, rxDirByte }) {
    this.txKey = txKey;
    this.txIvPrefix = txIvPrefix;
    this.txDirByte = txDirByte;
    this.rxKey = rxKey;
    this.rxIvPrefix = rxIvPrefix;
    this.rxDirByte = rxDirByte;
    this.txSeq = 0n;
    this.rxSeq = 0n;
    this.txBytes = 0;
    this.rxBytes = 0;
    this.txQueue = { tail: Promise.resolve(), bytes: 0, frames: 0 };
    this.rxQueue = { tail: Promise.resolve(), bytes: 0, frames: 0 };
    this.failed = false;
  }

  async seal(plaintextBytes) {
    const pt = plaintextBytes instanceof Uint8Array ? plaintextBytes : new Uint8Array(plaintextBytes);
    if (this.failed || pt.byteLength > MAX_PLAINTEXT_BYTES ||
        this.txSeq >= MAX_SEQ || this.txBytes + pt.byteLength > MAX_KEY_BYTES) {
      this.failed = true;
      throw new Error('E2EE send budget exceeded');
    }
    const seq = ++this.txSeq;
    this.txBytes += pt.byteLength;
    const iv = buildIv(this.txIvPrefix, seq);
    const aad = buildAad(this.txDirByte, seq);
    const ct = new Uint8Array(
      await getCrypto().subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
        this.txKey,
        pt,
      ),
    );
    const out = new Uint8Array(8 + ct.byteLength);
    new DataView(out.buffer).setBigUint64(0, seq, false);
    out.set(ct, 8);
    return out;
  }

  async openPacket(boxBytes) {
    const raw = boxBytes instanceof Uint8Array ? boxBytes : new Uint8Array(boxBytes);
    if (this.failed || raw.byteLength > MAX_PLAINTEXT_BYTES + 24 ||
        raw.byteLength < 24 || this.rxBytes + raw.byteLength - 24 > MAX_KEY_BYTES) {
      throw new Error('Invalid E2EE receive budget');
    }
    const seq = new DataView(raw.buffer, raw.byteOffset, 8).getBigUint64(0, false);
    if (seq === 0n || seq > MAX_SEQ) throw new Error('Invalid E2EE sequence');
    const iv = buildIv(this.rxIvPrefix, seq);
    const aad = buildAad(this.rxDirByte, seq);
    const pt = new Uint8Array(await getCrypto().subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, this.rxKey, raw.subarray(8),
    ));
    if (this.rxBytes + pt.byteLength > MAX_KEY_BYTES) {
      this.failed = true;
      throw new Error('E2EE receive budget exceeded');
    }
    this.rxBytes += pt.byteLength;
    return pt;
  }

  async open(boxBytes) {
    if (boxBytes.byteLength < 24) throw new Error('Invalid E2EE box length');
    const seq = new DataView(boxBytes.buffer ?? boxBytes, boxBytes.byteOffset ?? 0, 8).getBigUint64(0, false);
    if (seq !== this.rxSeq + 1n) throw new Error('E2EE replay, missing or out-of-order frame');
    const plaintext = await this.openPacket(boxBytes);
    if (seq !== this.rxSeq + 1n) throw new Error('Concurrent E2EE sequence change');
    this.rxSeq = seq;
    return plaintext;
  }

  enqueue(queue, size, run) {
    if (this.failed || queue.frames >= MAX_QUEUE_FRAMES || queue.bytes + size > MAX_QUEUE_BYTES) {
      this.failed = true;
      return Promise.reject(new Error('E2EE queue limit exceeded'));
    }
    queue.frames++;
    queue.bytes += size;
    const next = queue.tail.then(run).catch((err) => {
      this.failed = true;
      throw err;
    }).finally(() => {
      queue.frames--;
      queue.bytes -= size;
    });
    queue.tail = next.catch(() => {});
    return next;
  }

  enqueueSend(plaintextBytes, sendBoxFn) {
    return this.enqueue(this.txQueue, plaintextBytes.byteLength, async () => {
      const box = await this.seal(plaintextBytes);
      sendBoxFn(box);
    });
  }

  enqueueReceive(boxBytes, onPlaintextFn) {
    return this.enqueue(this.rxQueue, boxBytes.byteLength, async () => {
      const pt = await this.open(boxBytes);
      await onPlaintextFn(pt);
    });
  }
}

async function createCiphers(secret, shared, clientNonce, hostNonce, context, client, logicalSessionId) {
  function cipher(keys, domain) {
    return new E2EECipherSession({
      txKey: client ? keys.c2hKey : keys.h2cKey,
      txIvPrefix: client ? keys.c2hIvPrefix : keys.h2cIvPrefix,
      txDirByte: (client ? DIR_CLIENT_TO_HOST : DIR_HOST_TO_CLIENT) + domain,
      rxKey: client ? keys.h2cKey : keys.c2hKey,
      rxIvPrefix: client ? keys.h2cIvPrefix : keys.c2hIvPrefix,
      rxDirByte: (client ? DIR_HOST_TO_CLIENT : DIR_CLIENT_TO_HOST) + domain,
    });
  }
  const derive = (control) => deriveSessionKeys(secret, shared, clientNonce, hostNonce, context, control);
  const data = cipher(await derive(false), 0);
  if (logicalSessionId) {
    data.control = cipher(await derive(true), 2);
    data.logicalSessionId = logicalSessionId;
  }
  return data;
}

export async function createClientHandshake(secretStr, target) {
  const context = handshakeContext(target);
  const c = getCrypto();
  const masterSecretBytes = decodeMasterSecret(secretStr);
  const authKey = await deriveAuthKey(masterSecretBytes);
  const kp = await c.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const clientPubRaw = new Uint8Array(await c.subtle.exportKey('raw', kp.publicKey));
  const clientNonce = new Uint8Array(16);
  c.getRandomValues(clientNonce);

  const mac = await signHmac(authKey, [C2H_TAG, clientNonce, clientPubRaw, context]);
  const helloPayload = textEncoder.encode(
    JSON.stringify({
      v: E2EE_PROTOCOL_VERSION,
      clientPub: base64UrlEncode(clientPubRaw),
      ...(target.logicalSessionId && {
        capabilities: MULTIPATH_CAPABILITIES, logicalSessionId: target.logicalSessionId,
      }),
      clientNonce: base64UrlEncode(clientNonce),
      mac: base64UrlEncode(mac),
    }),
  );

  return {
    helloPayload,
    async finalize(hostHelloPayload) {
      const msg = JSON.parse(textDecoder.decode(hostHelloPayload));
      if (msg?.v !== E2EE_PROTOCOL_VERSION ||
          (target.logicalSessionId && (msg.capabilities !== MULTIPATH_CAPABILITIES ||
            msg.logicalSessionId !== target.logicalSessionId))) {
        throw new Error(`Unsupported E2EE protocol version: ${msg?.v}`);
      }
      const hostPubRaw = base64UrlDecode(msg.hostPub);
      const hostNonce = base64UrlDecode(msg.hostNonce);
      const hostMac = base64UrlDecode(msg.mac);
      if (hostNonce.byteLength !== 16 || hostPubRaw.byteLength !== 65) {
        throw new Error('Malformed E2EE host hello parameters');
      }
      const valid = await verifyHmac(
        authKey,
        [H2C_TAG, clientNonce, clientPubRaw, hostNonce, hostPubRaw, context],
        hostMac,
      );
      if (!valid) {
        throw new Error('E2EE host authentication failed (possible MITM or mismatched key)');
      }

      const hostPubKey = await c.subtle.importKey(
        'raw',
        hostPubRaw,
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        [],
      );
      const ecdhShared = new Uint8Array(
        await c.subtle.deriveBits({ name: 'ECDH', public: hostPubKey }, kp.privateKey, 256),
      );
      return createCiphers(masterSecretBytes, ecdhShared, clientNonce, hostNonce, context, true, target.logicalSessionId);
    },
  };
}

export async function respondHostHandshake(secretStr, clientHelloPayload, target) {
  const context = handshakeContext(target);
  const c = getCrypto();
  const masterSecretBytes = decodeMasterSecret(secretStr);
  const authKey = await deriveAuthKey(masterSecretBytes);
  const msg = JSON.parse(textDecoder.decode(clientHelloPayload));
  if (msg?.v !== E2EE_PROTOCOL_VERSION ||
          (target.logicalSessionId && (msg.capabilities !== MULTIPATH_CAPABILITIES ||
            msg.logicalSessionId !== target.logicalSessionId))) {
    throw new Error(`Unsupported E2EE protocol version: ${msg?.v}`);
  }
  const clientPubRaw = base64UrlDecode(msg.clientPub);
  const clientNonce = base64UrlDecode(msg.clientNonce);
  const clientMac = base64UrlDecode(msg.mac);
  if (clientNonce.byteLength !== 16 || clientPubRaw.byteLength !== 65) {
    throw new Error('Malformed E2EE client hello parameters');
  }
  const valid = await verifyHmac(authKey, [C2H_TAG, clientNonce, clientPubRaw, context], clientMac);
  if (!valid) {
    const err = new Error('Invalid E2EE key or handshake authentication failed');
    err.code = 'AUTH_FAILED';
    throw err;
  }

  const clientPubKey = await c.subtle.importKey(
    'raw',
    clientPubRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const kp = await c.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const hostPubRaw = new Uint8Array(await c.subtle.exportKey('raw', kp.publicKey));
  const hostNonce = new Uint8Array(16);
  c.getRandomValues(hostNonce);

  const ecdhShared = new Uint8Array(
    await c.subtle.deriveBits({ name: 'ECDH', public: clientPubKey }, kp.privateKey, 256),
  );
  const hostMac = await signHmac(authKey, [
    H2C_TAG,
    clientNonce,
    clientPubRaw,
    hostNonce,
    hostPubRaw,
    context,
  ]);

  const hostHelloPayload = textEncoder.encode(
    JSON.stringify({
      v: E2EE_PROTOCOL_VERSION,
      hostPub: base64UrlEncode(hostPubRaw),
      ...(target.logicalSessionId && {
        capabilities: MULTIPATH_CAPABILITIES, logicalSessionId: target.logicalSessionId,
      }),
      hostNonce: base64UrlEncode(hostNonce),
      mac: base64UrlEncode(hostMac),
    }),
  );

  const cipher = await createCiphers(masterSecretBytes, ecdhShared, clientNonce, hostNonce, context, false, target.logicalSessionId);
  return { hostHelloPayload, cipher };
}
