/** Browser shell for the authenticated DSH Remote workbench. */

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = () => { let resolve, reject; const promise = new Promise((res, rej) => { resolve = res; reject = rej; }); return { promise, resolve, reject }; };
}
if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any !== 'function') {
  AbortSignal.any = (signals) => {
    const c = new AbortController();
    for (const s of signals) {
      if (!s) continue;
      if (s.aborted) { c.abort(s.reason); return c.signal; }
      s.addEventListener('abort', () => c.abort(s.reason), { once: true });
    }
    return c.signal;
  };
}
(() => {
  const p = (typeof Iterator !== 'undefined' && Iterator.prototype) || Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));
  if (!p) return;
  const def = (k, value) => { if (typeof p[k] !== 'function') Object.defineProperty(p, k, { configurable: true, writable: true, value }); };
  def('map', function* map(fn) { let i = 0; for (const x of this) yield fn(x, i++); });
  def('filter', function* filter(fn) { let i = 0; for (const x of this) if (fn(x, i++)) yield x; });
  def('take', function* take(limit) { let n = Math.max(0, Number(limit) || 0); if (!n) return; for (const x of this) { yield x; if (--n <= 0) return; } });
  def('toArray', function toArray() { return Array.from(this); });
})();

import { clearFrontendCache, clearWebFrontendCache, createFrontendLoader, requestFrontend } from './frontend-loader.js';
import { CHUNK_SIZE, createPath, LEASE_MS, MultipathSession, relayPacer, RELAY_GRACE_MS, RENEW_MS } from './multipath.js';
import { normalizeStun, PeerPath } from './peer-path.js';
import { createShellUI } from './shell-ui.js';
import { FragmentReader, sendFragments } from './ws-fragments.js';
import {
  computeKeyFingerprint,
  createClientHandshake,
  generateLogicalSessionId,
  MSG_E2EE_BOX,
  MSG_E2EE_CLIENT_HELLO,
  MSG_E2EE_CTRL,
  MSG_E2EE_ERROR,
  MSG_E2EE_HOST_HELLO,
  normalizePairingKey,
} from './e2ee.js';

const MSG_CONTROL_JSON = 0x01, MSG_HTTP_REQ_HEAD = 0x10, MSG_HTTP_REQ_BODY = 0x11, MSG_HTTP_REQ_END = 0x12,
  MSG_HTTP_RES_HEAD = 0x13, MSG_HTTP_RES_BODY = 0x14, MSG_HTTP_RES_END = 0x15, MSG_HTTP_ABORT = 0x16, MSG_HTTP_RES_WINDOW = 0x17,
  MSG_WS_OPEN = 0x20, MSG_WS_OPENED = 0x21, MSG_WS_DATA_TEXT = 0x22, MSG_WS_DATA_BIN = 0x23, MSG_WS_CLOSE = 0x24;

const textEncoder = new TextEncoder(), textDecoder = new TextDecoder();
const nativeFetch = typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null;
const nativeEventSource = typeof globalThis.EventSource === 'function' ? globalThis.EventSource : null;
const nativeSwRegister = typeof navigator !== 'undefined' && typeof navigator.serviceWorker?.register === 'function'
  ? navigator.serviceWorker.register.bind(navigator.serviceWorker) : null;

export const MAX_STREAMS = 64;
const SUBRESOURCE_CONCURRENCY = 16, MAX_REQUEST_BYTES = 16 << 20, MAX_RESPONSE_BUFFER_BYTES = 16 << 20,
  DEFAULT_WINDOW_BYTES = 4 << 20, WINDOW_REFILL_THRESHOLD = 512 << 10, RESPONSE_IDLE_TIMEOUT_MS = 300_000,
  MAX_REDIRECT_HOPS = 5, SW_READY_TIMEOUT_MS = 1500, RECONNECT_BANNER_DELAY_MS = 800;

const REDIRECT_BODY_STRIPPED_HEADERS = ['content-type', 'content-length', 'content-encoding', 'content-language', 'content-location'];
const stripBodyHeaders = (headers) => { for (const h of REDIRECT_BODY_STRIPPED_HEADERS) headers.delete(h); };

export function sanitizeCrossOriginHeaders(rawHeaders) {
  const out = new Headers(rawHeaders || {});
  const toDelete = [];
  out.forEach((_value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'authorization' || lower === 'cookie' || lower === 'proxy-authorization' ||
        lower.startsWith('x-tiana-') || lower.startsWith('x-dsh-')) {
      toDelete.push(key);
    }
  });
  for (const key of toDelete) {
    out.delete(key);
  }
  return out;
}

function encodeWindowUpdate(creditBytes) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, creditBytes >>> 0, false);
  return out;
}

function encodeClientFrame(streamId, msgType, payload) {
  const body = payload == null ? new Uint8Array(0)
    : payload instanceof Uint8Array ? payload
    : payload instanceof ArrayBuffer ? new Uint8Array(payload)
    : ArrayBuffer.isView(payload) ? new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
    : textEncoder.encode(typeof payload === 'string' ? payload : JSON.stringify(payload));
  const out = new Uint8Array(5 + body.byteLength);
  new DataView(out.buffer).setUint32(0, streamId >>> 0, false);
  out[4] = msgType & 0xff;
  if (body.byteLength > 0) out.set(body, 5);
  return out;
}

function decodeClientFrame(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (bytes.byteLength < 5) throw new Error(`Invalid tunnel frame length: ${bytes.byteLength}`);
  return { streamId: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false), msgType: bytes[4], payload: bytes.subarray(5) };
}

export function createConcurrencySemaphore(limit = SUBRESOURCE_CONCURRENCY) {
  let active = 0;
  const queue = [];
  const release = () => {
    active = Math.max(0, active - 1);
    while (active < limit && queue.length > 0) {
      const next = queue.shift();
      if (next.cancelled) continue;
      next.signal?.removeEventListener('abort', next.onAbort);
      active += 1;
      next.resolve(release);
      return;
    }
  };
  return {
    acquire(signal) {
      if (signal?.aborted) return Promise.reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      if (active < limit) { active += 1; return Promise.resolve(release); }
      return new Promise((resolve, reject) => {
        const entry = { resolve, reject, signal, cancelled: false, onAbort: null };
        entry.onAbort = () => {
          entry.cancelled = true;
          const idx = queue.indexOf(entry);
          if (idx !== -1) queue.splice(idx, 1);
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        };
        signal?.addEventListener('abort', entry.onAbort, { once: true });
        queue.push(entry);
      });
    },
    get activeCount() { return active; },
    get queuedCount() { return queue.length; },
  };
}

function consumeLegacyPairingHash() {
  let oneTimeSecret = null;
  try {
    const url = new URL(location.href);
    const fragment = new URLSearchParams(url.hash.slice(1));
    let dirty = false;
    if (fragment.has('rk')) { const val = fragment.get('rk')?.trim(); if (val) oneTimeSecret = val; fragment.delete('rk'); dirty = true; }
    if (fragment.has('k')) { fragment.delete('k'); dirty = true; }
    if (dirty) { url.hash = fragment.toString(); history.replaceState(history.state, '', url); }
  } catch { /* ignore */ }
  try { for (const key of Object.keys(localStorage)) { if (key.startsWith('dsh-remote:e2ee:')) localStorage.removeItem(key); } } catch { /* ignore */ }
  return oneTimeSecret;
}

const assetUrl = (relPath) => new URL(relPath, import.meta.url).href;

async function fetchConfig() {
  const resp = await nativeFetch(assetUrl('./remote-config.json'), { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Failed to load remote-config.json (HTTP ${resp.status})`);
  return await resp.json();
}

function resolveRedirectTarget(currentPath, locationHeader) {
  if (typeof locationHeader !== 'string' || !locationHeader.trim()) return null;
  const trimmed = locationHeader.trim();
  const base = new URL(currentPath, 'https://dsh.local');
  let resolved;
  try {
    resolved = new URL(trimmed, base);
  } catch {
    return null;
  }
  if (resolved.origin === 'https://dsh.local') {
    return { kind: 'tunnel', path: `${resolved.pathname}${resolved.search}` };
  }
  if (typeof location !== 'undefined' && resolved.origin === location.origin) {
    const appBase = new URL('./', location.href).pathname;
    let p = resolved.pathname;
    if (appBase !== '/' && p.startsWith(appBase)) p = `/${p.slice(appBase.length)}`;
    return { kind: 'tunnel', path: `${p}${resolved.search}` };
  }
  if ((resolved.protocol === 'http:' || resolved.protocol === 'https:') &&
      ['127.0.0.1', '[::1]', 'localhost'].includes(resolved.hostname)) {
    return { kind: 'tunnel', path: `${resolved.pathname}${resolved.search}` };
  }
  if (resolved.protocol === 'https:') {
    return { kind: 'external', url: resolved.href };
  }
  return null;
}

export class TunnelClient {
  constructor(openRelay, target, onState, onRevoked, checkSession = null, options = {}) {
    this.openRelay = openRelay;
    this.target = target;
    this.onState = onState;
    this.onRevoked = onRevoked;
    this.checkSession = checkSession;
    this.onHostOnline = options.onHostOnline || null;
    this.onHostChanged = options.onHostChanged || null;
    this.refreshTarget = options.refreshTarget || null;
    this.onKeyRotated = options.onKeyRotated || null;
    this.onRtt = options.onRtt || null;
    this.p2pEnabled = true;
    this.nextStreamId = 1;
    this.httpStreams = new Map();
    this.wsStreams = new Map();
    this.legs = new Set();
    this.lifecycle = new AbortController();
    this.closed = false;
    this.rttMs = null;
    this.rttTimer = null;
    this.subresourceSemaphore = createConcurrencySemaphore(options.subresourceConcurrency ?? SUBRESOURCE_CONCURRENCY);
  }

  failActiveStreams(err, wsCode = 1006, wsReason = 'Tunnel error') {
    for (const entry of this.httpStreams.values()) entry.fail(err);
    this.httpStreams.clear();
    for (const sock of this.wsStreams.values()) sock._remoteClose(wsCode, wsReason, false);
    this.wsStreams.clear();
  }

  async connect(renew = false, { allowStandby = false } = {}) {
    const signal = AbortSignal.any([this.lifecycle.signal, AbortSignal.timeout(10_000)]);
    const ws = await this.openRelay(renew, signal, this.target.hostId);
    if (signal.aborted) {
      ws.close();
      signal.throwIfAborted();
    }
    ws.binaryType = 'arraybuffer';
    const welcome = Promise.withResolvers();
    const leg = { ws, welcome, challenge: null, welcomeMsg: null };
    const pace = relayPacer();
    this.legs.add(leg);
    leg.path = createPath({
      ready: () => ws.readyState === 1 && this.legs.has(leg),
      send: (type, data) => {
        if ((type === MSG_E2EE_BOX || type === MSG_E2EE_CTRL) && !pace(type)) return false;
        ws.send(encodeClientFrame(0, type, data));
        return true;
      },
      close: () => ws.close(4008),
      bufferedAmount: () => ws.bufferedAmount,
    });
    leg.path.leg = leg;
    const abort = () => ws.close();
    signal.addEventListener('abort', abort, { once: true });
    ws.addEventListener('message', (event) => {
      if (!(event.data instanceof ArrayBuffer) || !this.legs.has(leg)) return;
      let frame;
      try { frame = decodeClientFrame(event.data); } catch { return; }
      if (frame.streamId !== 0) return;
      const { msgType, payload } = frame;
      if (msgType === MSG_E2EE_CTRL || msgType === MSG_E2EE_BOX) {
        this.transport?.receive(msgType, payload, leg.path);
      } else if (msgType === MSG_CONTROL_JSON || msgType === MSG_E2EE_ERROR) {
        let msg;
        try { msg = JSON.parse(textDecoder.decode(payload)); } catch { return; }
        if (msgType === MSG_E2EE_ERROR) {
          const error = Object.assign(new Error('远程主机拒绝当前连接'), { code: msg.code });
          leg.handshake?.reject(error);
          leg.binding?.reject(error);
        } else if (msg.type === 'welcome') {
          leg.welcomeMsg = msg;
          const { challenge, user } = msg;
          if (msg.paired === false) {
            if (allowStandby) {
              leg.challenge = challenge || null;
              welcome.resolve(msg);
            } else {
              welcome.reject(Object.assign(new Error('应用尚未绑定主机'), { code: 'UNPAIRED', welcome: msg }));
            }
            return;
          }
          if (!/^[A-Za-z0-9_-]{22}$/u.test(challenge) ||
              user?.userId !== this.target.ownerUserId ||
              user?.tenantId !== this.target.tenantId ||
              user?.webId !== this.target.webId) {
            welcome.reject(new Error('远程主机连接身份不匹配'));
            return;
          }
          if (msg.configuredHost?.hostId) {
            this.target.hostId = msg.configuredHost.hostId;
            this.target.hostName = msg.configuredHost.hostName || msg.configuredHost.hostId;
            if (msg.configuredHost.hostDigest) {
              this.target.hostDigest = msg.configuredHost.hostDigest;
            }
            this.onHostChanged?.(msg.configuredHost);
          }
          if (!msg.selectedHostId || (this.target.hostId && msg.selectedHostId !== this.target.hostId)) {
            if (allowStandby) {
              leg.challenge = challenge;
              welcome.resolve(msg);
            } else {
              welcome.reject(Object.assign(new Error('远程主机离线或连接身份不匹配'), { code: 'HOST_OFFLINE', welcome: msg }));
            }
          } else {
            leg.challenge = challenge;
            welcome.resolve(msg);
          }
        } else if (msg.type === 'host_online') {
          if (msg.hostId) {
            this.target.hostId = msg.hostId;
            this.target.hostName = msg.hostName || msg.hostId;
          } else if (msg.hostName) {
            this.target.hostName = msg.hostName;
          }
          if (msg.hostDigest) {
            this.target.hostDigest = msg.hostDigest;
          }
          this.onHostChanged?.(msg);
          this.onHostOnline?.(msg);
        } else if (msg.type === 'host_disconnected') {
          ws.close();
        }
      } else if (msgType === MSG_E2EE_HOST_HELLO) {
        leg.handshake?.resolve(payload);
      }
    });
    ws.addEventListener('close', () => {
      this.legs.delete(leg);
      const error = new Error('Relay 连接已断开');
      welcome.reject(error);
      leg.handshake?.reject(error);
      leg.binding?.reject(error);
      if (this.leg === leg) {
        this.leg = null;
        this.transport?.setRelay(null);
        this.onState(this.transport?.p2p ? 'P2P' : '正在重连');
        this.armGrace();
        if (!this.closed) this.scheduleReconnect();
      }
    }, { once: true });
    try {
      await welcome.promise;
      return leg;
    } catch (error) {
      ws.close();
      throw error;
    } finally {
      signal.removeEventListener('abort', abort);
    }
  }

  async exchange(leg, slot, send, timeout = 5000) {
    const pending = leg[slot] = Promise.withResolvers();
    const timer = setTimeout(() => pending.reject(new Error('远程认证响应超时')), timeout);
    try {
      await Promise.all([Promise.resolve().then(send), pending.promise]);
      return await pending.promise;
    } finally {
      clearTimeout(timer);
      leg[slot] = null;
    }
  }

  async authenticate(leg, secret) {
    const normalizedSecret = normalizePairingKey(secret);
    let handshake;
    try {
      handshake = await createClientHandshake(normalizedSecret, { ...this.target, logicalSessionId: generateLogicalSessionId() });
    } catch (cause) {
      throw Object.assign(new Error('配对密钥无效', { cause }), { code: 'INVALID_KEY' });
    }
    const payload = await this.exchange(leg, 'handshake', () => leg.path.send(MSG_E2EE_CLIENT_HELLO, handshake.helloPayload));
    const cipher = await handshake.finalize(payload);
    if (!leg.path.ready() || this.closed) throw new Error('加密握手已取消');

    this.retire(new Error('远程会话已更换，未确认的操作结果未知'));
    const transport = new MultipathSession({
      cipher,
      leaseMs: this.target.leaseMs ?? LEASE_MS,
      onData: (bytes) => {
        if (this.transport === transport) return this.dispatchAppFrame(decodeClientFrame(bytes));
      },
      onControl: (message, path) => this.handleControl(message, path),
      onStall: (path) => path?.close(),
      onClose: (reason) => {
        if (this.transport !== transport) return;
        const hardExpired = Date.now() >= transport.expiresAt;
        this.retire(reason);
        this.onState('远程会话已结束');
        if (hardExpired) {
          this.close(reason);
          void Promise.resolve(this.checkSession?.()).then((valid) => {
            if (valid === false) return this.onRevoked(reason);
          }).catch(() => {});
        } else if (!this.closed) this.scheduleReconnect();
      },
    });
    this.transport = transport;
    this.leg = leg;
    transport.setRelay(leg.path);
    this.secret = normalizedSecret;
    if (this.refreshManifest) await this.refreshManifest();
    this.onState('Relay');
    this.scheduleRenewal();
    this.startRttProbes();
    if (this.p2pEnabled && this.stun) this.startPeer(this.stun);
    return await computeKeyFingerprint(normalizedSecret);
  }

  startRttProbes() {
    clearInterval(this.rttTimer);
    const sendPing = () => {
      if (this.closed || !this.transport) return;
      void this.transport.control({ type: 'rtt_ping', ts: Date.now(), lastRttMs: this.rttMs }).catch(() => {});
    };
    sendPing();
    this.rttTimer = setInterval(sendPing, 10_000);
    this.rttTimer.unref?.();
  }

  startPeer(stun) {
    if (!this.p2pEnabled) return;
    this.stun = normalizeStun(stun);
    if (typeof RTCPeerConnection !== 'function' || !this.transport || this.peer) return;
    this.peer = new PeerPath(this.transport, {
      createPeer: (config) => new RTCPeerConnection(config),
      sendChannel: (channel, bytes) => channel.send(bytes),
      initiator: true,
      urls: this.stun,
      signalPath: () => this.leg?.path,
      onPath: (available) => {
        this.onState(available ? 'P2P' : this.leg ? 'Relay' : '正在重连');
        this.armGrace();
      },
    });
    void this.peer.start();
  }

  async handleControl(message, path) {
    const leg = path.leg;
    if (message?.type === 'lease_sync' && Number.isFinite(message.leaseMs) && message.leaseMs > 0) {
      this.transport?.renewLease(message.leaseMs);
      this.scheduleRenewal(message.leaseMs);
    } else if (message?.type === 'bound_relay_leg' && leg?.binding && message.challenge === leg.challenge) {
      leg.binding.resolve(message);
    } else if (message?.type === 'rtt_pong' && Number.isFinite(message.ts)) {
      this.rttMs = Math.max(0, Date.now() - message.ts);
      this.onRtt?.(this.rttMs);
    } else if (message?.type === 'session_closed') {
      const code = Number(message.code) || 1000;
      const reason = String(message.reason || '');
      if (code === 4001 || reason === 'key_rotated') {
        const err = Object.assign(new Error('主机已轮换配对密钥'), { code: 'KEY_ROTATED', closeCode: 4001 });
        this.close(err);
        await this.onKeyRotated?.(err);
      } else {
        this.retire(new Error('主机断开了当前会话'));
        if (!this.closed) this.scheduleReconnect();
      }
    } else if (this.p2pEnabled) {
      await this.peer?.handle(message, path);
    }
  }

  armGrace() {
    clearTimeout(this.graceTimer);
    if (this.transport && !this.leg && !this.transport.p2p) {
      const transport = this.transport;
      this.graceTimer = setTimeout(() => transport.close(), RELAY_GRACE_MS);
    }
  }

  scheduleRenewal(grantedMs = this.target.leaseMs ?? LEASE_MS) {
    clearTimeout(this.renewTimer);
    const baseRenew = this.target.renewMs ?? RENEW_MS;
    const proportional = Math.max(1000, Math.floor(grantedMs * (11 / 12)));
    this.renewTimer = setTimeout(() => void this.reconnect(true), Math.min(baseRenew, proportional));
  }

  scheduleReconnect() {
    if (this.reconnectTimer || this.closed) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.leg) void this.reconnect(false);
    }, 1000);
  }

  async reconnect(renew) {
    if (this.reconnecting || this.closed || !this.secret) return;
    this.reconnecting = true;
    let next;
    try {
      if (this.refreshTarget) {
        try { await this.refreshTarget(); } catch { /* ignore transient poll failure */ }
      }
      const dialedHostId = this.target.hostId;
      try {
        next = await this.connect(renew);
      } catch (err) {
        if (err?.code === 'HOST_OFFLINE' && this.target.hostId && this.target.hostId !== dialedHostId) {
          next = await this.connect(renew);
        } else {
          throw err;
        }
      }
      const transport = this.transport;
      if (transport) {
        try {
          const result = await this.exchange(next, 'binding', () => transport.control({
            type: renew ? 'lease_renew' : 'bind_relay_leg', challenge: next.challenge,
          }, next.path));
          if (this.transport !== transport || !next.path.ready()) throw new Error('远程会话已结束');
          if (renew && !result.renewed) throw new Error('远程续租未获确认');
          const old = this.leg;
          this.leg = next;
          transport.setRelay(next.path);
          clearTimeout(this.graceTimer);
          if (old !== next) old?.ws.close();
          this.onState(transport.p2p ? 'P2P' : 'Relay');
          if (renew) {
            transport.renewLease(result.leaseMs);
            this.scheduleRenewal(result.leaseMs);
          }
          return;
        } catch (error) {
          if (error.code !== 'GENERATION_UNKNOWN') throw error;
        }
      }
      await this.authenticate(next, this.secret);
    } catch (error) {
      next?.ws.close();
      if (error.code === 'AUTH_FAILED' && this.onKeyRotated) {
        this.close(error);
        await this.onKeyRotated(error);
        return;
      }
      if ([401, 403].includes(error.status) || error.code === 'AUTH_FAILED' || error.code === 'FORBIDDEN') {
        this.close(error);
        await this.onRevoked(error);
        return;
      }
      const sessionValid = await Promise.resolve(this.checkSession?.()).catch(() => null);
      if (sessionValid === false) {
        this.close(error);
        await this.onRevoked(error);
        return;
      }
      if (renew && !this.closed) {
        clearTimeout(this.renewTimer);
        this.renewTimer = setTimeout(() => void this.reconnect(true), 5000);
      } else {
        this.scheduleReconnect();
      }
    } finally {
      this.reconnecting = false;
    }
  }

  retire(error) {
    const old = this.transport;
    this.transport = null;
    const leg = this.leg;
    this.leg = null;
    leg?.ws.close();
    clearTimeout(this.graceTimer);
    clearInterval(this.rttTimer);
    this.failActiveStreams(error, 1006, 'Remote generation ended');
    void this.peer?.stop().catch(() => {});
    this.peer = null;
    old?.close(error);
  }

  async lock() {
    await this.transport?.control({ type: 'close_session' }).catch(() => {});
    this.close();
  }

  close(error = new Error('远程连接已关闭')) {
    if (this.closed) return;
    this.closed = true;
    this.secret = undefined;
    this.lifecycle.abort(error);
    clearTimeout(this.renewTimer);
    clearTimeout(this.reconnectTimer);
    clearInterval(this.rttTimer);
    this.retire(error);
    for (const leg of this.legs) leg.ws.close();
  }

  sendAppFrame(streamId, msgType, payload, signal, generation = this.transport) {
    if (!generation || this.transport !== generation || this.closed) {
      return Promise.reject(new Error('远程会话已中断，未确认的操作结果未知'));
    }
    return generation.send(encodeClientFrame(streamId, msgType, payload), signal);
  }

  dispatchAppFrame({ streamId, msgType, payload }) {
    if (msgType >= MSG_HTTP_REQ_HEAD && msgType <= MSG_HTTP_RES_WINDOW) {
      const entry = this.httpStreams.get(streamId);
      if (!entry) return;
      if (msgType === MSG_HTTP_RES_HEAD) {
        let meta;
        try {
          meta = JSON.parse(textDecoder.decode(payload));
        } catch (err) {
          entry.fail(err);
          this.httpStreams.delete(streamId);
          return;
        }
        entry.resolveHead(meta);
      } else if (msgType === MSG_HTTP_RES_BODY) {
        entry.pushBody(payload);
      } else if (msgType === MSG_HTTP_RES_END) {
        entry.finishBody();
        this.httpStreams.delete(streamId);
      } else if (msgType === MSG_HTTP_ABORT) {
        const reason = payload.byteLength > 0 ? textDecoder.decode(payload) : 'HTTP stream aborted';
        entry.fail(new Error(reason));
        this.httpStreams.delete(streamId);
      }
      return;
    }

    if (msgType >= MSG_WS_OPEN && msgType <= MSG_WS_CLOSE) {
      const sock = this.wsStreams.get(streamId);
      if (!sock) return;
      if (msgType === MSG_WS_OPENED) {
        let info = {};
        if (payload.byteLength > 0) {
          try { info = JSON.parse(textDecoder.decode(payload)); } catch { /* ignore */ }
        }
        sock._remoteOpen(info);
      } else if (msgType === MSG_WS_DATA_TEXT || msgType === MSG_WS_DATA_BIN) {
        const bytes = sock._fragments.push(msgType, payload);
        if (bytes) sock._remoteMessage(msgType === MSG_WS_DATA_TEXT ? textDecoder.decode(bytes) : bytes.buffer);
      } else if (msgType === MSG_WS_CLOSE) {
        let info = { code: 1000, reason: '', wasClean: true };
        if (payload.byteLength > 0) {
          try { info = { ...info, ...JSON.parse(textDecoder.decode(payload)) }; } catch { /* ignore */ }
        }
        this.wsStreams.delete(streamId);
        sock._remoteClose(info.code, info.reason, Boolean(info.wasClean));
      }
    }
  }

  async fetch(pathAndQuery, init = {}) {
    const redirectMode = init.redirect || 'follow';
    let currentPath = pathAndQuery;
    let currentMethod = (init.method || 'GET').toUpperCase();
    let currentHeaders = new Headers(init.headers || {});
    let currentBody = init.body;
    let bodyIsUnreplayableStream = false;

    if (currentMethod !== 'GET' && currentMethod !== 'HEAD') {
      const sourceReq = init._sourceRequest;
      if (sourceReq && currentBody === undefined && sourceReq.body !== null) {
        if (init.signal?.aborted) {
          throw init.signal.reason ?? new DOMException('Aborted', 'AbortError');
        }
        const buf = await sourceReq.arrayBuffer();
        if (buf.byteLength > MAX_REQUEST_BYTES) {
          throw new Error('Remote request body is too large');
        }
        currentBody = new Uint8Array(buf);
      } else if (typeof ReadableStream !== 'undefined' && currentBody instanceof ReadableStream) {
        bodyIsUnreplayableStream = true;
      } else if (currentBody !== undefined && currentBody !== null) {
        const tmpReq = new Request('https://dsh.local/', {
          method: currentMethod,
          headers: currentHeaders,
          body: currentBody,
        });
        tmpReq.headers.forEach((v, k) => {
          if (!currentHeaders.has(k)) currentHeaders.set(k, v);
        });
        const buf = await tmpReq.arrayBuffer();
        if (buf.byteLength > MAX_REQUEST_BYTES) {
          throw new Error('Remote request body is too large');
        }
        currentBody = new Uint8Array(buf);
      }
    }

    const fetchExternal = init._externalFetch || nativeFetch;

    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
      const resp = await this._fetchSingle(currentPath, {
        ...init,
        _sourceRequest: undefined,
        method: currentMethod,
        body: currentBody,
        headers: currentHeaders,
      });

      const isRedirect = resp.status === 301 || resp.status === 302 || resp.status === 303 ||
        resp.status === 307 || resp.status === 308;
      if (!isRedirect) return resp;

      if (redirectMode === 'error') {
        await resp.body?.cancel().catch(() => {});
        throw new TypeError(`Unexpected redirect response (${resp.status})`);
      }
      if (redirectMode === 'manual') return resp;

      const loc = resp.headers.get('location');
      if (!loc) return resp;

      if (hop >= MAX_REDIRECT_HOPS) {
        await resp.body?.cancel().catch(() => {});
        throw new TypeError('Too many redirects');
      }

      const target = resolveRedirectTarget(currentPath, loc);
      if (!target) return resp;
      await resp.body?.cancel().catch(() => {});

      const shouldRewriteToGet = (resp.status === 303 && currentMethod !== 'GET' && currentMethod !== 'HEAD') ||
        ((resp.status === 301 || resp.status === 302) && currentMethod !== 'GET' && currentMethod !== 'HEAD');

      if (shouldRewriteToGet) {
        currentMethod = 'GET';
        currentBody = undefined;
        bodyIsUnreplayableStream = false;
        stripBodyHeaders(currentHeaders);
      } else if ((resp.status === 307 || resp.status === 308) && bodyIsUnreplayableStream) {
        throw new TypeError('Cannot follow 307/308 redirect with non-replayable ReadableStream body');
      }

      if (target.kind === 'external') {
        if (!fetchExternal) throw new Error('External redirect unavailable without native fetch');
        let extUrl = target.url;
        let extHeaders = sanitizeCrossOriginHeaders(currentHeaders);
        let extMethod = currentMethod;
        let extBody = currentBody;

        if (!init._externalFetch) {
          return await fetchExternal(extUrl, {
            method: extMethod,
            headers: extHeaders,
            body: extMethod === 'GET' || extMethod === 'HEAD' ? undefined : extBody,
            credentials: 'omit',
            signal: init.signal,
            redirect: (MAX_REDIRECT_HOPS - (hop + 1)) === 0 ? 'error' : 'follow',
          });
        }

        for (let extHop = hop + 1; extHop <= MAX_REDIRECT_HOPS; extHop += 1) {
          const remainingAfterThis = MAX_REDIRECT_HOPS - extHop;
          const extResp = await fetchExternal(extUrl, {
            method: extMethod,
            headers: extHeaders,
            body: extMethod === 'GET' || extMethod === 'HEAD' ? undefined : extBody,
            credentials: 'omit',
            signal: init.signal,
            redirect: remainingAfterThis === 0 ? 'error' : 'manual',
          });
          if (extResp.type === 'opaqueredirect') {
            if (extMethod !== 'GET' && extMethod !== 'HEAD') {
              throw new TypeError('Cannot follow opaque redirect for non-idempotent request');
            }
            return await fetchExternal(extUrl, {
              method: extMethod,
              headers: extHeaders,
              body: undefined,
              credentials: 'omit',
              signal: init.signal,
              redirect: 'follow',
            });
          }
          const isExtRedirect = extResp.status === 301 || extResp.status === 302 || extResp.status === 303 ||
            extResp.status === 307 || extResp.status === 308;
          const extLoc = extResp.headers.get('location');
          if (!isExtRedirect || !extLoc) return extResp;
          if (extHop >= MAX_REDIRECT_HOPS) {
            await extResp.body?.cancel().catch(() => {});
            throw new TypeError('Too many redirects');
          }
          const nextExt = new URL(extLoc, extUrl);
          if (nextExt.protocol !== 'https:') return extResp;
          await extResp.body?.cancel().catch(() => {});
          if ((extResp.status === 303 || extResp.status === 301 || extResp.status === 302) &&
              extMethod !== 'GET' && extMethod !== 'HEAD') {
            extMethod = 'GET';
            extBody = undefined;
            stripBodyHeaders(extHeaders);
          }
          if (nextExt.origin !== new URL(extUrl).origin) {
            extHeaders = sanitizeCrossOriginHeaders(extHeaders);
          }
          extUrl = nextExt.href;
        }
        throw new TypeError('Too many redirects');
      }
      currentPath = target.path;
    }
    throw new TypeError('Too many redirects');
  }

  async _fetchSingle(pathAndQuery, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    const signal = init.signal;
    const useSubresourceQueue = Boolean(init.subresource && (method === 'GET' || method === 'HEAD'));
    const releasePermit = useSubresourceQueue ? await this.subresourceSemaphore.acquire(signal) : null;

    let permitReleased = false;
    const freePermit = () => {
      if (releasePermit && !permitReleased) {
        permitReleased = true;
        releasePermit();
      }
    };

    try {
      if (this.closed || !this.transport) {
        throw new Error('dsh-remote: tunnel is not connected');
      }
      if (this.nextStreamId > 0xffffffff || this.httpStreams.size + this.wsStreams.size >= MAX_STREAMS) {
        throw new Error('Too many remote streams');
      }
      if (typeof pathAndQuery !== 'string') throw new TypeError('远程请求需要相对路径');
      if (!pathAndQuery.startsWith('/')) pathAndQuery = '/' + pathAndQuery;
      const streamId = this.nextStreamId++;
      const generation = this.transport;

      const normalizedReq = new Request(new URL(pathAndQuery, 'https://dsh.local').href, {
        method,
        headers: init.headers,
        body: method === 'GET' || method === 'HEAD' ? undefined : init.body,
        duplex: 'half',
      });

      const headersObj = {};
      normalizedReq.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      let bodyBytes = new Uint8Array(0);
      const abortReason = () => signal?.reason ?? new DOMException('Aborted', 'AbortError');
      if (signal?.aborted) {
        normalizedReq.body?.cancel(abortReason()).catch(() => {});
        throw abortReason();
      }
      if (method !== 'GET' && method !== 'HEAD' && normalizedReq.body) {
        const reader = normalizedReq.body.getReader();
        const cancelStreamNonBlocking = (reason) => {
          reader.cancel(reason).catch(() => {});
        };
        const onUploadAbort = () => {
          cancelStreamNonBlocking(abortReason());
        };
        signal?.addEventListener('abort', onUploadAbort, { once: true });
        const chunks = [];
        let size = 0;
        try {
          for (;;) {
            if (signal?.aborted) throw abortReason();
            const { done, value } = await reader.read();
            if (signal?.aborted) throw abortReason();
            if (done) break;
            size += value.byteLength;
            if (size > MAX_REQUEST_BYTES) throw new Error('Remote request body is too large');
            chunks.push(value);
          }
        } catch (err) {
          if (!signal?.aborted) cancelStreamNonBlocking(err);
          throw err;
        } finally {
          signal?.removeEventListener('abort', onUploadAbort);
          try { reader.releaseLock(); } catch { /* ignore */ }
        }
        bodyBytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bodyBytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
      }

      const tunnel = this;
      if (tunnel.transport !== generation) throw new Error('远程会话已结束，操作未提交');
      const send = (type, payload) => tunnel.sendAppFrame(streamId, type, payload, signal, generation);

      const requestedWindow = init.windowBytes !== undefined
        ? init.windowBytes
        : (tunnel.target.windowBytes ?? DEFAULT_WINDOW_BYTES);

      return await new Promise((resolveResponse, rejectResponse) => {
        let settled = false;
        let bodyController = null;
        let streamClosed = false;
        let ended = false;
        let bufferedBytes = 0;
        let flowControlEnabled = false;
        let peerWindowRemaining = Number.isInteger(requestedWindow) && requestedWindow > 0 ? requestedWindow : 0;
        let pendingWindowCredit = 0;
        let windowSendInFlight = false;
        let windowRetryTimer = null;
        const pendingChunks = [];
        let idleTimer = null;

        const isBackpressurePaused = () => {
          if (!flowControlEnabled || streamClosed || ended) return false;
          if (tunnel.closed || tunnel.transport !== generation) return false;
          const consumerFull = bodyController !== null && (bodyController.desiredSize ?? 1) <= 0;
          return consumerFull || peerWindowRemaining <= 0;
        };

        const refreshIdleTimer = () => {
          clearTimeout(idleTimer);
          idleTimer = null;
          if (streamClosed || ended) return;
          if (isBackpressurePaused()) return;
          idleTimer = setTimeout(() => {
            if (isBackpressurePaused()) return;
            tunnel.httpStreams.delete(streamId);
            void tunnel.sendAppFrame(streamId, MSG_HTTP_ABORT, 'response idle timeout', undefined, generation).catch(() => {});
            fail(new Error('Remote HTTP response timed out'));
          }, tunnel.target.responseIdleMs ?? RESPONSE_IDLE_TIMEOUT_MS);
        };

        const cleanup = () => {
          clearTimeout(idleTimer);
          idleTimer = null;
          clearTimeout(windowRetryTimer);
          windowRetryTimer = null;
          pendingChunks.length = 0;
          bufferedBytes = 0;
          if (signal && onAbort) {
            signal.removeEventListener('abort', onAbort);
          }
          freePermit();
        };

        const fail = (err) => {
          cleanup();
          if (!settled) {
            settled = true;
            rejectResponse(err);
          } else if (bodyController && !streamClosed) {
            streamClosed = true;
            try { bodyController.error(err); } catch { /* ignore */ }
          }
        };

        const maybeSendWindowCredit = () => {
          clearTimeout(windowRetryTimer);
          windowRetryTimer = null;
          if (!flowControlEnabled || streamClosed || ended || windowSendInFlight || pendingWindowCredit <= 0) return;
          const maxRefill = Math.max(0, requestedWindow - peerWindowRemaining);
          if (maxRefill <= 0) return;
          const threshold = Math.min(WINDOW_REFILL_THRESHOLD, Math.max(1, Math.floor(requestedWindow / 2)));
          if (pendingWindowCredit < threshold && pendingChunks.length > 0 && peerWindowRemaining > 0) return;
          const credit = Math.min(pendingWindowCredit, maxRefill);
          if (credit <= 0) return;
          windowSendInFlight = true;
          let enqueued = false;
          void tunnel.sendAppFrame(streamId, MSG_HTTP_RES_WINDOW, encodeWindowUpdate(credit), undefined, generation)
            .then(() => {
              enqueued = true;
              pendingWindowCredit = Math.max(0, pendingWindowCredit - credit);
              peerWindowRemaining = Math.min(requestedWindow, peerWindowRemaining + credit);
            })
            .catch(() => {
            })
            .finally(() => {
              windowSendInFlight = false;
              if (!streamClosed && !ended && pendingWindowCredit > 0) {
                const stillRoom = Math.max(0, requestedWindow - peerWindowRemaining);
                if (stillRoom > 0 && (pendingWindowCredit >= threshold || peerWindowRemaining === 0)) {
                  if (enqueued) {
                    queueMicrotask(maybeSendWindowCredit);
                  } else if (!windowRetryTimer) {
                    windowRetryTimer = setTimeout(() => {
                      windowRetryTimer = null;
                      maybeSendWindowCredit();
                    }, 10);
                  }
                }
              }
            });
        };

        const flushToStream = () => {
          while (bodyController && !streamClosed && pendingChunks.length > 0 && (bodyController.desiredSize ?? 1) > 0) {
            const next = pendingChunks.shift();
            bufferedBytes -= next.byteLength;
            bodyController.enqueue(next);
            if (flowControlEnabled) {
              pendingWindowCredit += next.byteLength;
            }
          }
          maybeSendWindowCredit();
          refreshIdleTimer();
          if (ended && pendingChunks.length === 0 && bodyController && !streamClosed) {
            streamClosed = true;
            cleanup();
            try { bodyController.close(); } catch { /* ignore */ }
          }
        };

        refreshIdleTimer();

        const maxBuf = tunnel.target.maxResponseBufferBytes ?? MAX_RESPONSE_BUFFER_BYTES;
        const streamHighWater = Math.min(256 * 1024, maxBuf);

        const entry = {
          resolveHead(meta) {
            if (settled) return;
            flowControlEnabled = Boolean(meta.flowControl && requestedWindow > 0);
            refreshIdleTimer();
            const status = Number(meta.status) || 200;
            const headers = new Headers(meta.headers || {});
            const emptyBody = status === 204 || status === 205 || status === 304 || method === 'HEAD';
            const stream = emptyBody ? null : new ReadableStream({
              start(controller) {
                bodyController = controller;
                flushToStream();
              },
              pull() {
                flushToStream();
              },
              cancel: () => {
                streamClosed = true;
                cleanup();
                tunnel.httpStreams.delete(streamId);
                void tunnel.sendAppFrame(streamId, MSG_HTTP_ABORT, 'cancelled', undefined, generation).catch(() => {});
              },
            }, { highWaterMark: streamHighWater, size: (chunk) => chunk.byteLength });
            if (emptyBody) {
              streamClosed = true;
              cleanup();
            }
            const response = new Response(stream, {
              status,
              statusText: meta.statusText || '',
              headers,
            });
            settled = true;
            resolveResponse(response);
          },
          pushBody(chunk) {
            if (streamClosed || ended) return;
            if (flowControlEnabled) {
              peerWindowRemaining = Math.max(0, peerWindowRemaining - chunk.byteLength);
            }
            const inStreamQueue = bodyController ? Math.max(0, streamHighWater - (bodyController.desiredSize ?? 0)) : 0;
            if (inStreamQueue + bufferedBytes + chunk.byteLength > maxBuf) {
              tunnel.httpStreams.delete(streamId);
              void tunnel.sendAppFrame(streamId, MSG_HTTP_ABORT, 'response buffer exceeded', undefined, generation).catch(() => {});
              fail(new Error('Remote HTTP response buffer exceeded'));
              return;
            }
            const copy = new Uint8Array(chunk);
            pendingChunks.push(copy);
            bufferedBytes += copy.byteLength;
            flushToStream();
          },
          finishBody() {
            if (!settled) { fail(new Error('Remote response was incomplete')); return; }
            ended = true;
            flushToStream();
          },
          fail,
        };

        const onAbort = (reason) => {
          tunnel.httpStreams.delete(streamId);
          void tunnel.sendAppFrame(streamId, MSG_HTTP_ABORT, 'aborted', undefined, generation).catch(() => {});
          fail(signal?.reason || (reason instanceof Error ? reason : new DOMException('Aborted', 'AbortError')));
        };

        if (signal?.aborted) {
          onAbort();
          return;
        }
        if (signal) {
          signal.addEventListener('abort', onAbort, { once: true });
        }

        tunnel.httpStreams.set(streamId, entry);

        void (async () => {
          try {
            const reqHead = {
              method,
              path: pathAndQuery,
              headers: headersObj,
              ...(Number.isInteger(requestedWindow) && requestedWindow > 0 ? { windowBytes: requestedWindow } : {}),
            };
            await send(MSG_HTTP_REQ_HEAD, JSON.stringify(reqHead));
            for (let offset = 0; offset < bodyBytes.byteLength; offset += CHUNK_SIZE) {
              if (tunnel.closed || !tunnel.httpStreams.has(streamId)) return;
              await send(MSG_HTTP_REQ_BODY, bodyBytes.subarray(offset, offset + CHUNK_SIZE));
            }
            if (!tunnel.closed && tunnel.httpStreams.has(streamId)) {
              await send(MSG_HTTP_REQ_END);
            }
          } catch (err) {
            tunnel.httpStreams.delete(streamId);
            fail(err instanceof Error ? err : new Error(String(err)));
          }
        })();
      });
    } catch (err) {
      freePermit();
      throw err;
    }
  }

  createWebSocket(targetUrl) {
    if (this.nextStreamId > 0xffffffff || this.httpStreams.size + this.wsStreams.size >= MAX_STREAMS) {
      throw new Error('Too many remote streams');
    }
    const streamId = this.nextStreamId++;
    const parsed = new URL(targetUrl, location.href);
    let pathAndQuery = `${parsed.pathname}${parsed.search}`;
    const appBase = new URL('./', location.href).pathname;
    if (pathAndQuery.startsWith(appBase)) {
      pathAndQuery = `/${pathAndQuery.slice(appBase.length)}`;
    }
    const sock = new TunnelWebSocket(this, streamId, targetUrl, pathAndQuery);
    this.wsStreams.set(streamId, sock);
    if (this.closed || !this.transport) {
      this.wsStreams.delete(streamId);
      queueMicrotask(() => sock._remoteClose(1006, 'Tunnel disconnected', false));
    } else {
      void this.sendAppFrame(streamId, MSG_WS_OPEN, JSON.stringify({ path: pathAndQuery })).catch(() => {
        this.wsStreams.delete(streamId);
        sock._remoteClose(1006, 'E2EE send failed', false);
      });
    }
    return sock;
  }
}

export function createTunnelEventSource(tunnelFetch, options = {}) {
  const baseHref = options.baseHref || (typeof location !== 'undefined' ? location.href : 'https://dsh.local/');
  const NativeES = options.NativeEventSource !== undefined ? options.NativeEventSource : nativeEventSource;
  const appBasePath = options.appBasePath ?? new URL('./', baseHref).pathname;

  class TunnelEventSource extends EventTarget {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSED = 2;

    constructor(rawUrl, init = {}) {
      super();
      const parsed = new URL(String(rawUrl), baseHref);
      const baseOrigin = new URL(baseHref).origin;
      const lowerPath = parsed.pathname.toLowerCase();
      const lowerBase = appBasePath.toLowerCase();
      const isPlatformReserved = lowerPath.startsWith('/_tiana/') ||
        lowerPath === '/_tiana' ||
        lowerPath.startsWith(`${lowerBase}_tiana/`) ||
        lowerPath === `${lowerBase}_tiana`;

      if (parsed.origin !== baseOrigin || isPlatformReserved) {
        if (NativeES) {
          return new NativeES(parsed.href, init);
        }
        throw new Error(isPlatformReserved
          ? 'Platform EventSource endpoint requires native EventSource'
          : 'Cross-origin EventSource is unavailable');
      }

      this.CONNECTING = 0;
      this.OPEN = 1;
      this.CLOSED = 2;
      this._url = parsed.href;
      this._withCredentials = Boolean(init?.withCredentials);
      this._readyState = 0;
      this._retryMs = 3000;
      this._lastEventId = '';
      this._abortController = null;
      this._reconnectTimer = null;
      this.onopen = null;
      this.onmessage = null;
      this.onerror = null;

      let tunnelPath = `${parsed.pathname}${parsed.search}`;
      if (appBasePath !== '/' && tunnelPath.startsWith(appBasePath)) {
        tunnelPath = `/${tunnelPath.slice(appBasePath.length)}`;
      }
      this._tunnelPath = tunnelPath;
      void this._connect();
    }

    get url() { return this._url; }
    get withCredentials() { return this._withCredentials; }
    get readyState() { return this._readyState; }

    _emit(type, event) {
      this.dispatchEvent(event);
      const handler = type === 'open' ? this.onopen : type === 'error' ? this.onerror : type === 'message' ? this.onmessage : null;
      if (typeof handler === 'function') {
        handler.call(this, event);
      }
    }

    _failPermanently() {
      if (this._readyState === 2) return;
      this._readyState = 2;
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
      this._abortController?.abort();
      this._abortController = null;
      this._emit('error', new Event('error'));
    }

    _scheduleReconnect() {
      if (this._readyState === 2) return;
      this._readyState = 0;
      this._emit('error', new Event('error'));
      if (this._readyState === 2) return;
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = setTimeout(() => {
        this._reconnectTimer = null;
        if (this._readyState !== 2) void this._connect();
      }, this._retryMs);
    }

    async _connect() {
      if (this._readyState === 2) return;
      const ac = new AbortController();
      this._abortController = ac;
      const headers = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-store',
      };
      if (this._lastEventId) {
        headers['Last-Event-ID'] = this._lastEventId;
      }

      let resp;
      try {
        resp = await tunnelFetch(this._tunnelPath, {
          method: 'GET',
          headers,
          signal: ac.signal,
          redirect: 'follow',
        });
      } catch {
        if (this._readyState === 2) return;
        this._scheduleReconnect();
        return;
      }

      if (this._readyState === 2) {
        await resp.body?.cancel().catch(() => {});
        return;
      }

      const contentType = String(resp.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase();
      if (resp.status !== 200 || contentType !== 'text/event-stream' || !resp.body) {
        await resp.body?.cancel().catch(() => {});
        this._failPermanently();
        return;
      }

      this._readyState = 1;
      this._emit('open', new Event('open'));
      if (this._readyState === 2) {
        await resp.body?.cancel().catch(() => {});
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let firstChunk = true;
      let skipLeadingLF = false;
      let eventType = '';
      let dataLines = [];
      let pendingLastEventId = this._lastEventId;

      const dispatchEventBuffer = () => {
        if (this._readyState === 2) return;
        this._lastEventId = pendingLastEventId;
        if (dataLines.length === 0) {
          eventType = '';
          return;
        }
        const type = eventType || 'message';
        const data = dataLines.join('\n');
        eventType = '';
        dataLines = [];
        const ev = new MessageEvent(type, {
          data,
          origin: new URL(this._url).origin,
          lastEventId: this._lastEventId,
        });
        if (this._readyState === 2) return;
        this._emit(type, ev);
      };

      const processLine = (line) => {
        if (this._readyState === 2) return;
        if (line === '') {
          dispatchEventBuffer();
          return;
        }
        if (line.startsWith(':')) {
          return; // SSE comment / keepalive
        }
        const colon = line.indexOf(':');
        let field;
        let value;
        if (colon === -1) {
          field = line;
          value = '';
        } else {
          field = line.slice(0, colon);
          value = line.slice(colon + 1);
          if (value.startsWith(' ')) value = value.slice(1);
        }
        if (field === 'data') {
          dataLines.push(value);
        } else if (field === 'event') {
          eventType = value;
        } else if (field === 'id') {
          if (!value.includes('\0')) {
            pendingLastEventId = value;
          }
        } else if (field === 'retry') {
          if (/^[0-9]+$/u.test(value)) {
            this._retryMs = Number.parseInt(value, 10);
          }
        }
      };

      const consumeText = (rawText) => {
        let text = rawText;
        if (skipLeadingLF && text.length > 0) {
          skipLeadingLF = false;
          if (text.charCodeAt(0) === 10) {
            text = text.slice(1);
          }
        }
        if (!text) return;
        buffer += text;
        let start = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          if (this._readyState === 2) break;
          const ch = buffer.charCodeAt(i);
          if (ch === 10) { // \n
            processLine(buffer.slice(start, i));
            start = i + 1;
          } else if (ch === 13) { // \r (standalone CR or start of CRLF)
            processLine(buffer.slice(start, i));
            if (this._readyState === 2) {
              start = i + 1;
              break;
            }
            if (i + 1 < buffer.length) {
              if (buffer.charCodeAt(i + 1) === 10) i += 1;
            } else {
              skipLeadingLF = true;
            }
            start = i + 1;
          }
        }
        buffer = buffer.slice(start);
      };

      try {
        while (this._readyState !== 2) {
          const { done, value } = await reader.read();
          if (done) {
            const tail = decoder.decode();
            if (tail) consumeText(tail);
            break;
          }
          let text = decoder.decode(value, { stream: true });
          if (firstChunk) {
            firstChunk = false;
            if (text.startsWith('\uFEFF')) text = text.slice(1);
          }
          consumeText(text);
        }
      } catch {
      } finally {
        try { await reader.cancel(); } catch { /* ignore */ }
        try { reader.releaseLock(); } catch { /* ignore */ }
      }

      if (this._readyState !== 2) {
        this._scheduleReconnect();
      }
    }

    close() {
      if (this._readyState === 2) return;
      this._readyState = 2;
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
      this._abortController?.abort();
      this._abortController = null;
    }
  }

  return TunnelEventSource;
}

class TunnelWebSocket extends EventTarget {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(tunnel, streamId, url, pathAndQuery) {
    super();
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;
    this._tunnel = tunnel;
    this._generation = tunnel.transport;
    this._fragments = new FragmentReader();
    this._streamId = streamId;
    this.url = url;
    this._path = pathAndQuery;
    this.readyState = 0;
    this.protocol = '';
    this.extensions = '';
    this.bufferedAmount = 0;
    this._sendQueue = Promise.resolve();
    this._pendingFrames = 0;
    this.binaryType = 'blob';
    this.onopen = null;
    this.onmessage = null;
    this.onerror = null;
    this.onclose = null;
  }

  _emit(type, event) {
    this.dispatchEvent(event);
    const handler = this[`on${type}`];
    if (typeof handler === 'function') {
      handler.call(this, event);
    }
  }

  _remoteOpen(info = {}) {
    if (this.readyState !== 0) return;
    this.readyState = 1;
    if (info.protocol) this.protocol = String(info.protocol);
    this._emit('open', new Event('open'));
  }

  _remoteMessage(data) {
    if (this.readyState !== 1) return;
    let payload = data;
    if (data instanceof ArrayBuffer && this.binaryType === 'blob') {
      payload = new Blob([data]);
    }
    this._emit('message', new MessageEvent('message', { data: payload }));
  }

  _remoteClose(code = 1000, reason = '', wasClean = true) {
    if (this.readyState === 3) return;
    const wasConnecting = this.readyState === 0;
    this.readyState = 3;
    if (wasConnecting && !wasClean) {
      this._emit('error', new Event('error'));
    }
    this._emit('close', new CloseEvent('close', { code, reason, wasClean }));
  }

  send(data) {
    if (this.readyState !== 1) {
      throw new DOMException('WebSocket is not open', 'InvalidStateError');
    }
    const size = typeof data === 'string' ? textEncoder.encode(data).byteLength : data.size ?? data.byteLength;
    if (!Number.isSafeInteger(size) || size > 16 * 1024 * 1024 ||
        this.bufferedAmount + size > 16 * 1024 * 1024 || this._pendingFrames >= 256) {
      this.close(4008, 'Remote socket buffer exceeded');
      return;
    }

    this.bufferedAmount += size;
    this._pendingFrames++;
    this._sendQueue = this._sendQueue.then(async () => {
      if (this.readyState === 3) return;
      const type = typeof data === 'string' ? MSG_WS_DATA_TEXT : MSG_WS_DATA_BIN;
      const payload = data instanceof Blob ? await data.arrayBuffer() : data;
      if (this.readyState === 3) return;
      await sendFragments(payload, (part) => this._tunnel.sendAppFrame(this._streamId, type, part, undefined, this._generation));
    }).catch(() => {
      this._tunnel.wsStreams.delete(this._streamId);
      this._remoteClose(1006, '远程消息发送失败', false);
    }).finally(() => {
      this.bufferedAmount -= size;
      this._pendingFrames--;
    });
  }

  close(code = 1000, reason = '') {
    if (this.readyState === 2 || this.readyState === 3) return;
    this.readyState = 2;
    this._sendQueue = this._sendQueue.then(async () => {
      if (this.readyState === 3) return;
      await this._tunnel.sendAppFrame(this._streamId, MSG_WS_CLOSE, JSON.stringify({ code, reason }), undefined, this._generation);
      this._tunnel.wsStreams.delete(this._streamId);
      this._remoteClose(code, reason, true);
    }).catch(() => this._remoteClose(1006, '远程会话已结束', false));
  }
}

function installModuleLoaderQueue() {
  const pendingQueue = [];
  globalThis.__ModuleLoader__ = {
    mode: 'queue',
    pendingQueue,
    load(registration) {
      pendingQueue.push(registration);
    },
    create(options) {
      if (this.mode !== 'queue') {
        throw new Error('client-modules: window.__ModuleLoader__.create called after module-system boot');
      }
      const clientModulesId = '@deepseek-ai/dsh-client-modules';
      const index = pendingQueue.findIndex((r) => r.id === clientModulesId);
      const registration = pendingQueue[index];
      if (registration === undefined) {
        throw new Error(`client-modules: HTML did not preload ${clientModulesId}/client.js`);
      }
      pendingQueue.splice(index, 1);
      const exports = registration.factory((specifier) => {
        throw new Error(`client-modules: ${clientModulesId}/client.js requested external "${specifier}" before the module system existed`);
      });
      if (typeof exports !== 'object' || exports === null || typeof exports.createClientModuleSystem !== 'function' || typeof exports.apply !== 'function') {
        throw new Error(`client-modules: ${clientModulesId}/client.js did not export the bootstrap module face`);
      }
      return exports.createClientModuleSystem(this, { id: registration.id, exports }, options);
    },
  };
}

function guardPluginServiceWorkers() {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
  try {
    Object.defineProperty(navigator.serviceWorker, 'register', {
      configurable: true,
      writable: true,
      value() {
        return Promise.reject(
          new DOMException('Plugin Service Worker registration is disabled in dsh-remote', 'NotSupportedError'),
        );
      },
    });
  } catch {
  }
}

async function setupServiceWorkerBridge(tunnel, appBasePath, signal) {
  if (!nativeSwRegister || typeof navigator === 'undefined' || !navigator.serviceWorker) {
    return { active: false, unbind: () => {}, getNavToken: () => '' };
  }
  const swUrl = assetUrl('./dsh-remote-sw.js');
  const bridgeAbort = new AbortController();
  const tabNavToken = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  let swPort = null;
  let workerTarget = null;
  let inFlightAttach = null;
  let currentNavToken = tabNavToken;
  let tornDown = false;

  const onParentAbort = () => unbind();
  signal?.addEventListener('abort', onParentAbort, { once: true });

  const unbind = () => {
    if (tornDown) return;
    tornDown = true; currentNavToken = ''; inFlightAttach = null;
    signal?.removeEventListener('abort', onParentAbort);
    bridgeAbort.abort();
    try { workerTarget?.postMessage({ type: 'dsh-remote:sw-unbind' }); } catch { /* ignore */ }
    try { swPort?.close(); } catch { /* ignore */ }
    swPort = null; workerTarget = null;
  };

  const attachWorker = (worker, ackTimeoutMs = SW_READY_TIMEOUT_MS) => {
    if (!worker || tornDown || signal?.aborted || tunnel.closed) {
      return Promise.resolve(false);
    }
    if (inFlightAttach && workerTarget === worker) {
      return inFlightAttach;
    }
    workerTarget = worker;
    const channel = new MessageChannel();
    if (swPort) {
      try { swPort.close(); } catch { /* ignore */ }
    }
    const port = channel.port1;
    swPort = port;

    const p = new Promise((resolveAck) => {
      let ackSettled = false;
      const settleAck = (ok) => {
        if (ackSettled) return;
        ackSettled = true;
        if (inFlightAttach === p) inFlightAttach = null;
        clearTimeout(ackTimer);
        bridgeAbort.signal.removeEventListener('abort', onBridgeAbort);
        resolveAck(ok);
      };
      const onBridgeAbort = () => settleAck(false);
      bridgeAbort.signal.addEventListener('abort', onBridgeAbort, { once: true });
      const ackTimer = setTimeout(() => settleAck(false), ackTimeoutMs);

      port.onmessageerror = () => {
        if (swPort === port) {
          try { port.close(); } catch { /* ignore */ }
          swPort = null;
        }
        settleAck(false);
      };

      port.onmessage = (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'dsh-remote:sw-bound') {
          if (typeof msg.navToken === 'string' && msg.navToken) currentNavToken = msg.navToken;
          settleAck(true);
          return;
        }
        if (msg.type !== 'fetch' || !event.ports || !event.ports[0]) return;
        const reqPort = event.ports[0];
        const ac = new AbortController();
        let reader = null;
        let pullDemand = 0;
        let reading = false;
        let aborted = false;

        const finish = () => {
          aborted = true;
          ac.abort();
          try { reader?.cancel().catch(() => {}); } catch { /* ignore */ }
          try { reqPort.close(); } catch { /* ignore */ }
        };

        const pump = async () => {
          if (reading || !reader || aborted) return;
          reading = true;
          try {
            while (pullDemand > 0 && !aborted) {
              const { done, value } = await reader.read();
              if (aborted) break;
              if (done) {
                reqPort.postMessage({ type: 'end' });
                finish();
                return;
              }
              pullDemand -= 1;
              const copy = new Uint8Array(value);
              reqPort.postMessage({ type: 'chunk', data: copy }, [copy.buffer]);
            }
          } catch (err) {
            if (!aborted) {
              try { reqPort.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) }); } catch { /* ignore */ }
              finish();
            }
          } finally {
            reading = false;
          }
        };

        reqPort.onmessageerror = () => finish();
        reqPort.onmessage = (ev) => {
          const sub = ev.data;
          if (!sub) return;
          if (sub.type === 'abort') {
            finish();
          } else if (sub.type === 'pull') {
            pullDemand += 1;
            void pump();
          }
        };
        reqPort.start?.();

        void (async () => {
          try {
            const resp = await tunnel.fetch(msg.path, {
              method: msg.method,
              headers: msg.headers,
              body: msg.body && msg.body.byteLength > 0 ? msg.body : undefined,
              redirect: msg.redirect || 'follow',
              signal: ac.signal,
              subresource: msg.method === 'GET' || msg.method === 'HEAD',
            });
            if (aborted) {
              await resp.body?.cancel().catch(() => {});
              return;
            }
            const headersOut = {};
            resp.headers.forEach((v, k) => { headersOut[k] = v; });
            reqPort.postMessage({
              type: 'head',
              status: resp.status,
              statusText: resp.statusText,
              headers: headersOut,
            });
            if (!resp.body || msg.method === 'HEAD' || resp.status === 204 || resp.status === 205 || resp.status === 304) {
              reqPort.postMessage({ type: 'end' });
              finish();
              return;
            }
            reader = resp.body.getReader();
            void pump();
          } catch (err) {
            if (!aborted) {
              try { reqPort.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) }); } catch { /* ignore */ }
              finish();
            }
          }
        })();
      };
      port.start?.();
      try {
        worker.postMessage({ type: 'dsh-remote:sw-bind', navToken: tabNavToken }, [channel.port2]);
      } catch {
        settleAck(false);
      }
    });
    inFlightAttach = p;
    return p;
  };

  let raceTimer = null;
  const setupAbort = new AbortController();
  const onParentOrBridgeAbort = () => setupAbort.abort();
  bridgeAbort.signal.addEventListener('abort', onParentOrBridgeAbort, { once: true });

  try {
    const bound = await Promise.race([
      (async () => {
        const reg = await nativeSwRegister(swUrl, { scope: appBasePath, updateViaCache: 'none' });
        if (setupAbort.signal.aborted || tornDown) return false;
        if (!navigator.serviceWorker.controller) {
          await new Promise((resolve) => {
            const onDone = () => {
              navigator.serviceWorker.removeEventListener('controllerchange', onDone);
              setupAbort.signal.removeEventListener('abort', onDone);
              resolve();
            };
            navigator.serviceWorker.addEventListener('controllerchange', onDone, { once: true });
            setupAbort.signal.addEventListener('abort', onDone, { once: true });
            if (navigator.serviceWorker.controller || setupAbort.signal.aborted) onDone();
          });
        }
        if (setupAbort.signal.aborted || tornDown) return false;
        const controller = navigator.serviceWorker.controller || reg.active;
        if (!controller) return false;
        const acked = await attachWorker(controller, SW_READY_TIMEOUT_MS);
        if (!acked || setupAbort.signal.aborted || tornDown) return false;

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (navigator.serviceWorker.controller && !tornDown && !signal?.aborted) {
            void attachWorker(navigator.serviceWorker.controller, 2500);
          }
        }, { signal: bridgeAbort.signal });
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'dsh-remote:sw-request-port' && !tornDown && !signal?.aborted && !tunnel.closed) {
            const reqTok = event.data.requestedNavToken;
            if (reqTok && reqTok !== tabNavToken) return;
            const target = navigator.serviceWorker.controller || event.source || reg.active;
            if (target && typeof target.postMessage === 'function') {
              void attachWorker(target, 2500);
            }
          }
        }, { signal: bridgeAbort.signal });
        navigator.serviceWorker.startMessages?.();
        return Boolean(navigator.serviceWorker.controller);
      })(),
      new Promise((resolve) => {
        raceTimer = setTimeout(() => {
          setupAbort.abort();
          resolve(false);
        }, SW_READY_TIMEOUT_MS);
      }),
    ]);
    clearTimeout(raceTimer);
    raceTimer = null;
    bridgeAbort.signal.removeEventListener('abort', onParentOrBridgeAbort);
    if (!bound) {
      unbind();
      return { active: false, unbind: () => {}, getNavToken: () => '' };
    }
    return { active: true, unbind, getNavToken: () => (tornDown ? '' : currentNavToken) };
  } catch {
    clearTimeout(raceTimer);
    bridgeAbort.signal.removeEventListener('abort', onParentOrBridgeAbort);
    unbind();
    return { active: false, unbind: () => {}, getNavToken: () => '' };
  }
}

let activeSwNavRewriter = null;
let activeWorkerContext = null;
let iframeNavHooksInstalled = false;
let workerHooksInstalled = false;
const blobRegistry = new Map();
const nativeCreateObjectURL = typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
  ? URL.createObjectURL.bind(URL)
  : null;
const nativeRevokeObjectURL = typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function'
  ? URL.revokeObjectURL.bind(URL)
  : null;
const NativeWorker = typeof globalThis.Worker === 'function' ? globalThis.Worker : null;

function buildWorkerPrelude(navToken, origin, appBasePath) {
  const baseNoSlash = appBasePath.length > 1 && appBasePath.endsWith('/') ? appBasePath.slice(0, -1) : appBasePath;
  return `(()=>{const T=${JSON.stringify(navToken)},O=${JSON.stringify(origin)},B=${JSON.stringify(appBasePath)},BN=${JSON.stringify(baseNoSlash)},BH=O+B;` +
    'const skip=(p)=>p.startsWith("/_tiana/")||p.startsWith(B+"_tiana/")||p.startsWith(B+"assets/")||p.startsWith("/brand/")||p==="/favicon.ico";' +
    'const rw=(r)=>{try{const u=new URL(String(r),BH);if((u.protocol!=="http:"&&u.protocol!=="https:")||u.origin!==O||skip(u.pathname))return r;' +
    'if(B!=="/"&&!u.pathname.startsWith(B)&&u.pathname!==BN){const np=BN+(u.pathname.startsWith("/")?u.pathname:"/"+u.pathname);if(skip(np))return r;u.pathname=np;}' +
    'u.searchParams.set("__dsh_nav",T);return u.href;}catch{return r;}};' +
    'if(typeof self.fetch==="function"){const nf=self.fetch.bind(self);self.fetch=(i,n)=>{' +
    'if(typeof i==="string"||i instanceof URL)return nf(rw(i),n);' +
    'if(i instanceof Request){const next=rw(i.url);return next===i.url?nf(i,n):nf(new Request(next,i),n);}return nf(i,n);};}' +
    'if(typeof self.XMLHttpRequest==="function"){const po=self.XMLHttpRequest.prototype.open;self.XMLHttpRequest.prototype.open=function(m,u,...a){return po.call(this,m,rw(u),...a);};}' +
    '})();';
}

function installSwScopeAlignment(appBasePath, signal, getNavToken) {
  if (typeof document === 'undefined') return;
  const appBaseNoSlash = appBasePath.length > 1 && appBasePath.endsWith('/') ? appBasePath.slice(0, -1) : appBasePath;

  const isPlatformOrPassthroughPath = (pathname) => (
    pathname === appBasePath ||
    pathname === appBaseNoSlash ||
    pathname.startsWith(`${appBasePath}_tiana/`) ||
    pathname.startsWith('/_tiana/') ||
    pathname.startsWith(`${appBasePath}assets/`) ||
    pathname.startsWith('/brand/') ||
    pathname === '/favicon.ico'
  );

  const rewriteIfNeeded = (rawUrl) => {
    if (typeof rawUrl !== 'string' || !rawUrl) return rawUrl;
    let parsed;
    try {
      parsed = new URL(rawUrl, location.href);
    } catch {
      return rawUrl;
    }
    if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.origin !== location.origin) {
      return rawUrl;
    }
    let pathname = parsed.pathname;
    if (isPlatformOrPassthroughPath(pathname)) {
      return rawUrl;
    }
    if (appBasePath !== '/' && !pathname.startsWith(appBasePath) && pathname !== appBaseNoSlash) {
      pathname = `${appBaseNoSlash}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
      if (isPlatformOrPassthroughPath(pathname)) {
        return rawUrl;
      }
    }
    const navToken = typeof getNavToken === 'function' ? getNavToken() : '';
    const params = new URLSearchParams(parsed.search);
    if (navToken) {
      params.set('__dsh_nav', navToken);
    }
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}${parsed.hash}`;
  };

  activeSwNavRewriter = rewriteIfNeeded;
  activeWorkerContext = { appBasePath, getNavToken, rewriteIfNeeded };
  signal?.addEventListener('abort', () => {
    if (activeSwNavRewriter === rewriteIfNeeded) activeSwNavRewriter = null;
    if (activeWorkerContext?.getNavToken === getNavToken) activeWorkerContext = null;
  }, { once: true });

  document.addEventListener('click', (ev) => {
    const anchor = ev.target?.closest?.('a[download]');
    if (!anchor) return;
    const rawHref = anchor.getAttribute('href');
    if (!rawHref || rawHref.startsWith('blob:') || rawHref.startsWith('data:')) return;
    const next = rewriteIfNeeded(rawHref);
    if (!next || next === rawHref) return;
    ev.preventDefault();
    const dlUrl = new URL(next, location.href);
    dlUrl.searchParams.set('__dsh_dl', (anchor.getAttribute('download') || '').trim() || '1');
    const f = document.createElement('iframe');
    f.style.display = 'none';
    f.setAttribute('aria-hidden', 'true');
    f.src = dlUrl.href;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 60_000);
  }, { capture: true, signal });

  if (!iframeNavHooksInstalled && typeof HTMLIFrameElement !== 'undefined') {
    iframeNavHooksInstalled = true;
    const desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'src');
    if (desc?.set && desc.configurable) {
      Object.defineProperty(HTMLIFrameElement.prototype, 'src', {
        configurable: true,
        enumerable: desc.enumerable,
        get: desc.get,
        set(val) {
          const next = activeSwNavRewriter ? activeSwNavRewriter(String(val)) : String(val);
          return desc.set.call(this, next);
        },
      });
    }
    const origSetAttr = HTMLIFrameElement.prototype.setAttribute;
    HTMLIFrameElement.prototype.setAttribute = function setAttribute(name, value) {
      if (String(name).toLowerCase() === 'src') {
        const next = activeSwNavRewriter ? activeSwNavRewriter(String(value)) : String(value);
        return origSetAttr.call(this, name, next);
      }
      return origSetAttr.call(this, name, value);
    };
  }

  if (!workerHooksInstalled && NativeWorker && nativeCreateObjectURL && nativeRevokeObjectURL) {
    workerHooksInstalled = true;
    URL.createObjectURL = function createObjectURL(obj) {
      const url = nativeCreateObjectURL(obj);
      if (obj instanceof Blob) {
        if (blobRegistry.size > 256) {
          const oldest = blobRegistry.keys().next().value;
          if (oldest) blobRegistry.delete(oldest);
        }
        blobRegistry.set(url, obj);
      }
      return url;
    };
    URL.revokeObjectURL = function revokeObjectURL(url) {
      blobRegistry.delete(String(url));
      return nativeRevokeObjectURL(url);
    };
    globalThis.Worker = function DshRemoteWorker(scriptURL, options) {
      const ctx = activeWorkerContext;
      const navToken = ctx?.getNavToken?.() || '';
      if (!navToken) return new NativeWorker(scriptURL, options);
      const raw = scriptURL instanceof URL ? scriptURL.href : String(scriptURL);
      const prelude = buildWorkerPrelude(navToken, location.origin, ctx.appBasePath);
      const origBlob = blobRegistry.get(raw);
      if (origBlob) {
        const wrappedBlob = new Blob([prelude, '\n', origBlob], { type: origBlob.type || 'text/javascript' });
        const wrappedUrl = nativeCreateObjectURL(wrappedBlob);
        const w = new NativeWorker(wrappedUrl, options);
        const t = setTimeout(() => { try { nativeRevokeObjectURL(wrappedUrl); } catch { /* ignore */ } }, 10_000);
        t.unref?.();
        return w;
      }
      try {
        const parsed = new URL(raw, location.href);
        if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === location.origin) {
          const rewritten = ctx.rewriteIfNeeded(parsed.href);
          const abs = new URL(rewritten, location.href).href;
          const loaderLine = options?.type === 'module'
            ? `import ${JSON.stringify(abs)};`
            : `importScripts(${JSON.stringify(abs)});`;
          const wrappedBlob = new Blob([prelude, '\n', loaderLine], { type: 'text/javascript' });
          const wrappedUrl = nativeCreateObjectURL(wrappedBlob);
          const w = new NativeWorker(wrappedUrl, options);
          const t = setTimeout(() => { try { nativeRevokeObjectURL(wrappedUrl); } catch { /* ignore */ } }, 10_000);
          t.unref?.();
          return w;
        }
      } catch {
      }
      return new NativeWorker(scriptURL, options);
    };
    globalThis.Worker.prototype = NativeWorker.prototype;
  }
}

let bypassWrappedFetch = 0;

function wrapGlobalFetch(tunnelFetch, loadAsset) {
  const appBasePath = new URL('./', location.href).pathname;
  const appRootNoSlash = appBasePath.length > 1 && appBasePath.endsWith('/') ? appBasePath.slice(0, -1) : appBasePath;
  const assetsBase = new URL('./', import.meta.url).pathname;

  globalThis.fetch = (input, init) => {
    if (bypassWrappedFetch > 0) return nativeFetch(input, init);
    const rawUrl = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input instanceof Request
          ? input.url
          : String(input);

    let parsed;
    try {
      parsed = new URL(rawUrl, location.href);
    } catch {
      return nativeFetch(input, init);
    }

    if (parsed.protocol === 'blob:' && parsed.origin === location.origin) {
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      const requestSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
      const asset = loadAsset(parsed.href, method, requestSignal);
      if (asset) return asset;
    }
    if (parsed.protocol !== 'blob:' && parsed.origin === location.origin) {
      let path = parsed.pathname;
      const isTianaAsset = path.startsWith(assetsBase);
      const isTianaInternal = path.startsWith(`${appBasePath}_tiana/`) || path.startsWith('/_tiana/') || path === appBasePath || path === appRootNoSlash;
      if (!isTianaAsset && !isTianaInternal) {
        if (appBasePath.endsWith('/') && path.startsWith(appBasePath)) {
          path = `/${path.slice(appBasePath.length)}`;
        }
        const mergedInit = input instanceof Request
          ? {
              method: init?.method || input.method,
              headers: init?.headers || input.headers,
              body: init?.body !== undefined ? init.body : undefined,
              _sourceRequest: init?.body === undefined ? input : undefined,
              signal: init?.signal || input.signal,
              redirect: init?.redirect || input.redirect,
            }
          : init;
        return tunnelFetch(`${path}${parsed.search}`, mergedInit);
      }
    }

    return nativeFetch(input, init);
  };
}

function endpoint(name) {
  return new URL('_tiana/' + name, new URL('./', location.href));
}

async function verifyOwner(config, signal) {
  const reply = await nativeFetch(endpoint('session'), {
    credentials: 'same-origin', cache: 'no-store', signal,
  });
  if (!reply.ok) throw Object.assign(new Error('无法确认 Tiana 应用身份'), { status: reply.status });
  const session = await reply.json();
  if (session.is_app_owner !== true ||
      (session.web_id !== undefined && session.web_id !== config.webId) ||
      typeof session.user?.user_id !== 'string' || !session.user.user_id ||
      typeof session.tenant_id !== 'string' || !session.tenant_id ||
      (typeof session.app_tenant_id === 'string' && session.app_tenant_id !== '' && session.app_tenant_id !== session.tenant_id)) {
    throw Object.assign(new Error('仅应用所有者可以连接 DSH'), { status: 403 });
  }
  return {
    webId: config.webId,
    hostId: config.defaultHostId || '',
    ownerUserId: session.user.user_id,
    tenantId: session.tenant_id,
  };
}

async function waitForSocket(ws, signal) {
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      ws.removeEventListener('open', open);
      ws.removeEventListener('error', failed);
      ws.removeEventListener('close', failed);
      signal.removeEventListener('abort', abort);
      if (error) {
        ws.close();
        reject(error);
      } else resolve(ws);
    };
    const open = () => finish();
    const failed = () => finish(new Error('无法连接 Relay'));
    const abort = () => finish(signal.reason);
    ws.addEventListener('open', open, { once: true });
    ws.addEventListener('error', failed, { once: true });
    ws.addEventListener('close', failed, { once: true });
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}

async function openRelaySocket(tianaContext, config, hostId, renew, signal) {
  const clientPath = hostId ? '/client?' + new URLSearchParams({ host_id: hostId }) : '/client';
  if (tianaContext?.functions?.websocket && config.functionId && !renew) {
    return tianaContext.functions.websocket(config.functionId, clientPath, { signal });
  }
  if (config.functionId && tianaContext?.functions?.websocket) {
    const headers = { 'X-Tiana-Bootstrap': '1', 'X-Request-ID': 'req-' + crypto.randomUUID(), 'Content-Type': 'application/json' };
    const proof = document.cookie.split('; ').find((item) => item.startsWith('__Host-tiana_site_csrf='));
    if (proof) headers['X-CSRF-Token'] = decodeURIComponent(proof.slice(proof.indexOf('=') + 1));
    const reply = await nativeFetch(endpoint('function-connection'), {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', headers, signal,
      body: JSON.stringify({ instance_id: config.functionId }),
    });
    if (!reply.ok) throw Object.assign(new Error('应用续租未获授权'), { status: reply.status });
    const grant = await reply.json();
    const origin = new URL(grant.origin);
    if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' ||
        origin.search || origin.hash || typeof grant.token !== 'string' || !grant.token) {
      throw new Error('后端授权响应无效');
    }
    const url = new URL(clientPath, origin);
    url.protocol = 'wss:';
    url.searchParams.set('access_token', grant.token);
    return waitForSocket(new WebSocket(url), signal);
  }
  if (config.localRelayUrl) {
    const url = new URL(clientPath, config.localRelayUrl);
    if (!['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname)) throw new Error('测试 Relay 必须使用回环地址');
    url.protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol;
    return waitForSocket(new WebSocket(url), signal);
  }
  throw new Error('应用缺少 Relay 配置');
}

async function pollRelayInfo(tianaContext, config, signal) {
  const pollSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(3000)]) : AbortSignal.timeout(3000);
  try {
    if (typeof tianaContext?.functions?.fetch === 'function' && config.functionId) {
      for (const ep of ['/status', '/info']) {
        let pending;
        bypassWrappedFetch += 1;
        try {
          pending = tianaContext.functions.fetch(config.functionId, ep, { cache: 'no-store', signal: pollSignal });
        } finally {
          bypassWrappedFetch -= 1;
        }
        const resp = await pending;
        if (resp.ok) return await resp.json();
      }
    }
    if (config.localRelayUrl) {
      for (const ep of ['/status', '/info']) {
        const url = new URL(ep, config.localRelayUrl);
        const resp = await nativeFetch(url, { cache: 'no-store', signal: pollSignal });
        if (resp.ok) return await resp.json();
      }
    }
  } catch {
  }
  return null;
}

function ensureRootElement() {
  const existingApp = document.getElementById('app');
  if (existingApp) {
    existingApp.remove();
  }
  let root = document.getElementById('root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'root';
    document.body.prepend(root);
  }
  return root;
}

export function keyName(identity) {
  return 'dsh-remote:v2:key:' + [identity.webId, identity.ownerUserId, identity.hostId].join(':');
}

export function purgeWebKeys(webId, keepKey = null, storage = globalThis.localStorage) {
  if (!webId || !storage) return 0;
  let removed = 0;
  try {
    const prefix = `dsh-remote:v2:key:${webId}:`;
    const toRemove = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix) && k !== keepKey) toRemove.push(k);
    }
    for (const k of toRemove) {
      storage.removeItem(k);
      removed++;
    }
  } catch {
  }
  return removed;
}

export function readStoredKey(key, { local = globalThis.localStorage } = {}) {
  try {
    const loc = local?.getItem(key);
    if (loc) return { secret: loc, remembered: true };
  } catch { /* ignore */ }
  return { secret: null, remembered: false };
}

export function writeStoredKey(key, value, { remember = false, session = globalThis.sessionStorage, local = globalThis.localStorage } = {}) {
  try { session?.removeItem(key); } catch { /* ignore */ }
  try { local?.removeItem(key); } catch { /* ignore */ }
  if (!value || !remember) return;
  try {
    local?.setItem(key, value);
  } catch {
  }
}

async function runRemoteSession(container, tianaContext, shellUI, options = {}) {
  const lifetime = new AbortController();
  const signal = lifetime.signal;
  const oneTimeHashKey = options._skipHashConsume ? null : consumeLegacyPairingHash();
  let loader;
  let tunnel;
  let identity;
  let channel;
  let swBridge = { active: false, unbind: () => {} };
  let reconnectBanner = null;
  let reconnectDelayTimer = null;
  let currentStateLabel = '连接中';
  let currentFingerprint = '';
  let currentRemembered = false;
  let inMemorySecret = null;
  let lockedOut = false;
  const subscribers = new Set();

  const emitSnapshot = () => {
    const snap = getStatusSnapshot();
    for (const fn of subscribers) {
      try { fn(snap); } catch { /* ignore */ }
    }
  };

  const getStatusSnapshot = () => ({
    isRemote: true,
    transportState: currentStateLabel,
    transport: currentStateLabel === 'P2P' ? 'p2p' : 'relay',
    rttMs: tunnel?.rttMs ?? null,
    hostId: identity?.hostId || '',
    hostName: identity?.hostName || identity?.hostId || '',
    webId: identity?.webId || '',
    fingerprint: currentFingerprint,
    remembered: currentRemembered,
    swActive: Boolean(swBridge.active),
  });

  const applyAuthoritativeHost = (info) => {
    if (!info || !identity) return;
    if (info.hostId) {
      identity.hostId = info.hostId;
      identity.hostName = info.hostName || info.hostId;
    } else if (info.hostName) {
      identity.hostName = info.hostName;
    }
    if (info.hostDigest) {
      identity.hostDigest = info.hostDigest;
    }
    if (tunnel?.target) {
      if (identity.hostId) tunnel.target.hostId = identity.hostId;
      if (identity.hostName) tunnel.target.hostName = identity.hostName;
      if (identity.hostDigest) tunnel.target.hostDigest = identity.hostDigest;
    }
  };

  const close = () => {
    lifetime.abort(new Error('远程工作台已关闭'));
    clearTimeout(reconnectDelayTimer);
    inMemorySecret = null;
    swBridge.unbind();
    tunnel?.close();
    loader?.close();
    reconnectBanner?.remove();
    try { channel?.close(); } catch { /* ignore */ }
  };

  addEventListener('pagehide', close, { once: true });
  addEventListener('pageshow', (event) => {
    if (event.persisted && signal.aborted) location.reload();
  });

  try {
    shellUI.showLoading('正在连接本地 DSH 主机…', '正在核验 Tiana 应用归属与端到端加密通道。');
    const config = await fetchConfig();
    const { webId } = config;
    if (!webId || (tianaContext?.appId && tianaContext.appId !== webId)) {
      throw new Error('缺少当前应用标识配置');
    }
    try {
      identity = await verifyOwner(config, signal);
    } catch (error) {
      if ([401, 403].includes(error.status)) {
        purgeWebKeys(webId, null, globalThis.localStorage);
        purgeWebKeys(webId, null, globalThis.sessionStorage);
        await clearWebFrontendCache(webId);
      }
      throw error;
    }

    const lockPulseStorageKey = `dsh-remote:v2:lock-pulse:${webId}`;

    const lockAndReturnToUnlock = async ({ broadcast = false, sendHostLock = false, notice = '' } = {}) => {
      if (lockedOut) return;
      lockedOut = true;
      inMemorySecret = null;
      currentRemembered = false;
      purgeWebKeys(webId, null, globalThis.localStorage);
      purgeWebKeys(webId, null, globalThis.sessionStorage);

      if (broadcast) {
        try { channel?.postMessage({ type: 'dsh-remote:lock', appId: webId }); } catch { /* ignore */ }
        try {
          globalThis.localStorage?.setItem(lockPulseStorageKey, String(Date.now()));
          globalThis.localStorage?.removeItem(lockPulseStorageKey);
        } catch { /* ignore */ }
      }

      swBridge.unbind();
      if (sendHostLock && tunnel) {
        await tunnel.lock().catch(() => {});
      }
      close();
      shellUI.destroyAll();
      await clearWebFrontendCache(webId).catch(() => {});
      const rootNode = document.getElementById('root');
      if (rootNode) rootNode.replaceChildren();

      void shellUI.promptUnlock({
        hostId: identity?.hostId,
        hostName: identity?.hostName,
        errorMessage: notice,
        defaultRemember: true,
      }).then((nextUnlock) => {
        void runRemoteSession(container, tianaContext, shellUI, {
          ...options,
          _skipHashConsume: true,
          _initialSecret: nextUnlock.secret,
          _initialRemember: nextUnlock.remember,
        });
      });
    };

    try {
      if (typeof BroadcastChannel === 'function') {
        channel = new BroadcastChannel('dsh-remote:v2:' + webId);
        channel.addEventListener('message', (event) => {
          const msg = event.data;
          if (!msg || typeof msg !== 'object') return;
          if ((msg.type === 'dsh-remote:lock' && (!msg.appId || msg.appId === webId)) ||
              msg.type === 'purge' || msg.type === 'rotate') {
            void lockAndReturnToUnlock({
              broadcast: false,
              sendHostLock: false,
              notice: msg.notice || '工作台已在其他标签页锁定，请重新输入配对密钥解锁。',
            });
          }
        }, { signal });
      }
    } catch {
      channel = null;
    }

    const forget = () => lockAndReturnToUnlock({
      broadcast: true,
      sendHostLock: true,
      notice: '',
    });

    const clearCacheAndReload = async () => {
      swBridge.unbind();
      await clearWebFrontendCache(webId);
      location.reload();
    };

    const handleKeyRotated = () => lockAndReturnToUnlock({
      broadcast: true,
      sendHostLock: false,
      notice: '主机已轮换配对密钥，请输入新的配对密钥重新解锁。',
    });

    const revoked = () => lockAndReturnToUnlock({
      broadcast: true,
      sendHostLock: false,
      notice: 'Tiana 应用会话已失效，请重新验证后解锁。',
    });

    const checkSession = async () => {
      try {
        const current = await verifyOwner(config, AbortSignal.any([signal, AbortSignal.timeout(5000)]));
        return current.ownerUserId === identity.ownerUserId && current.tenantId === identity.tenantId;
      } catch (error) {
        if ([401, 403].includes(error?.status)) return false;
        return null;
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      void checkSession().then((valid) => {
        if (valid === false) return revoked();
      });
    }, { signal });

    let hostOnlineResolver = null;
    const onStateChange = (label) => {
      const prev = currentStateLabel;
      currentStateLabel = label;
      emitSnapshot();
      if (!reconnectBanner) return;
      if (label === '正在重连') {
        clearTimeout(reconnectDelayTimer);
        reconnectDelayTimer = setTimeout(() => {
          if (currentStateLabel === '正在重连') reconnectBanner?.showReconnecting();
        }, RECONNECT_BANNER_DELAY_MS);
      } else if (label === 'P2P' || label === 'Relay') {
        clearTimeout(reconnectDelayTimer);
        if (prev === '正在重连') reconnectBanner.showRecovered();
        else reconnectBanner.hide();
      }
    };

    const initialInfo = await pollRelayInfo(tianaContext, config, signal);
    if (initialInfo?.paired && initialInfo?.hostId) {
      applyAuthoritativeHost(initialInfo);
    }

    tunnel = new TunnelClient(
      (renew, relaySignal, targetHostId) => openRelaySocket(tianaContext, config, targetHostId || identity.hostId, renew, relaySignal),
      { ...identity, renewMs: options?.renewalMs, leaseMs: options?.leaseMs },
      onStateChange,
      revoked,
      checkSession,
      {
        onHostChanged: (info) => {
          applyAuthoritativeHost(info);
          emitSnapshot();
        },
        onHostOnline: (msg) => {
          applyAuthoritativeHost(msg);
          emitSnapshot();
          hostOnlineResolver?.(msg);
        },
        refreshTarget: async () => {
          try {
            const latestInfo = await pollRelayInfo(tianaContext, config, signal);
            if (latestInfo?.paired && latestInfo?.hostId) {
              applyAuthoritativeHost(latestInfo);
              emitSnapshot();
            }
          } catch {
          }
        },
        onKeyRotated: handleKeyRotated,
        onRtt: () => emitSnapshot(),
      },
    );

    const OFFLINE_BACKOFF_STEPS = [2000, 5000, 10_000];
    let offlineBackoffIdx = 0;
    let leg = null;

    while (!signal.aborted) {
      leg = await tunnel.connect(false, { allowStandby: true });
      const w = leg.welcomeMsg || {};

      if (w.paired === false) {
        offlineBackoffIdx = 0;
        shellUI.showOnboarding({ webId, tenantId: identity.tenantId });
        const detected = await new Promise((resolve) => {
          let done = false;
          const finish = (info) => {
            if (done) return;
            done = true;
            clearInterval(pollTimer);
            hostOnlineResolver = null;
            resolve(info);
          };
          hostOnlineResolver = (msg) => finish(msg);
          const pollTimer = setInterval(async () => {
            if (signal.aborted) { finish(null); return; }
            const info = await pollRelayInfo(tianaContext, config, signal);
            if (info?.paired && info?.hostId) {
              applyAuthoritativeHost(info);
              if (info.hostConnected) {
                finish(info);
              }
            }
          }, 3000);
          leg.ws.addEventListener('close', () => setTimeout(() => finish({ reconnect: true }), 1500), { once: true });
          signal.addEventListener('abort', () => finish(null), { once: true });
        });
        leg.ws.close();
        if (signal.aborted) return;
        if (detected?.hostId) {
          applyAuthoritativeHost(detected);
          shellUI.markHostOnlineDetected(identity.hostName);
          await new Promise((r) => setTimeout(r, 450));
        }
        continue;
      }

      if (w.configuredHost?.hostId) {
        const previousHostId = identity.hostId;
        applyAuthoritativeHost(w.configuredHost);
        if (!w.selectedHostId && w.hostConnected && previousHostId && previousHostId !== identity.hostId) {
          leg.ws.close();
          continue;
        }
      }

      if (!w.selectedHostId) {
        shellUI.showHostOffline({
          webId,
          tenantId: identity.tenantId,
          hostId: identity.hostId,
          hostName: identity.hostName,
        });
        const delayMs = OFFLINE_BACKOFF_STEPS[Math.min(offlineBackoffIdx, OFFLINE_BACKOFF_STEPS.length - 1)];
        offlineBackoffIdx = Math.min(offlineBackoffIdx + 1, OFFLINE_BACKOFF_STEPS.length - 1);
        await new Promise((resolve) => {
          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', onVisible);
            hostOnlineResolver = null;
            resolve();
          };
          const onVisible = () => {
            if (document.visibilityState === 'visible') finish();
          };
          hostOnlineResolver = finish;
          const timer = setTimeout(finish, delayMs);
          document.addEventListener('visibilitychange', onVisible);
          leg.ws.addEventListener('close', finish, { once: true });
          signal.addEventListener('abort', finish, { once: true });
        });
        leg.ws.close();
        if (signal.aborted) return;
        const latestInfo = await pollRelayInfo(tianaContext, config, signal);
        if (latestInfo?.paired && latestInfo?.hostId) {
          applyAuthoritativeHost(latestInfo);
        }
        continue;
      }

      offlineBackoffIdx = 0;
      break;
    }

    const key = keyName(identity);
    purgeWebKeys(webId, key, globalThis.localStorage);
    purgeWebKeys(webId, null, globalThis.sessionStorage);

    let saved = readStoredKey(key);
    let secret = options._initialSecret || oneTimeHashKey || saved.secret;
    let remember = options._initialSecret !== undefined
      ? Boolean(options._initialRemember)
      : (saved.remembered || true);
    let noticeMsg = '';

    addEventListener('storage', (event) => {
      if (event.key === null || event.key === lockPulseStorageKey) {
        void lockAndReturnToUnlock({
          broadcast: false,
          sendHostLock: false,
          notice: '工作台已在其他标签页锁定，请重新输入配对密钥解锁。',
        });
        return;
      }
      if (event.key === key && event.newValue === null && currentRemembered) {
        if (keyName(identity) !== event.key) return;
        void pollRelayInfo(tianaContext, config, signal).then((latest) => {
          const latestKey = latest?.paired && latest?.hostId ? keyName({ ...identity, hostId: latest.hostId }) : '';
          if (latestKey && latestKey !== event.key) {
            applyAuthoritativeHost(latest);
            emitSnapshot();
            return;
          }
          void lockAndReturnToUnlock({
            broadcast: false,
            sendHostLock: false,
            notice: '工作台已在其他标签页锁定，请重新输入配对密钥解锁。',
          });
        });
      }
    }, { signal });
    addEventListener('online', () => {
      if (tunnel?.p2pEnabled && tunnel.stun && tunnel.leg) void tunnel.peer?.start();
    }, { signal });

    for (;;) {
      if (!secret) {
        const res = await shellUI.promptUnlock({
          hostId: identity.hostId,
          hostName: identity.hostName,
          errorMessage: noticeMsg,
          defaultRemember: true,
        });
        secret = res.secret;
        remember = res.remember;
      }
      shellUI.showLoading('正在建立端到端加密隧道…', `正在验证本地主机 "${identity.hostName || identity.hostId}"。`);
      try {
        if (!leg.path.ready()) leg = await tunnel.connect();
        currentFingerprint = await tunnel.authenticate(leg, secret);
        break;
      } catch (error) {
        if (!['AUTH_FAILED', 'INVALID_KEY'].includes(error.code)) throw error;
        writeStoredKey(key, null);
        await clearFrontendCache(identity);
        noticeMsg = '配对密钥无效或主机已轮换密钥，请核对后重新输入。';
        secret = null;
      }
    }

    signal.throwIfAborted();
    const normalizedSecret = normalizePairingKey(secret);
    currentRemembered = Boolean(remember);
    inMemorySecret = normalizedSecret;
    writeStoredKey(key, normalizedSecret, { remember: currentRemembered });
    secret = null;

    shellUI.showLoading('正在同步工作台组件…', '正在加载 DSH 前端与已启用的客户端插件。');

    const tunnelFetch = (url, init) => tunnel.fetch(url, init);
    const frontend = await requestFrontend(tunnelFetch, signal);
    tunnel.refreshManifest = () => requestFrontend(tunnelFetch, signal);
    if (frontend.session?.userId !== identity.ownerUserId || frontend.session?.tenantId !== identity.tenantId) {
      throw new Error('远程前端清单与应用身份不匹配');
    }
    if (frontend.host?.hostName) identity.hostName = frontend.host.hostName;
    tunnel.p2pEnabled = frontend.p2pEnabled !== false;
    if (tunnel.p2pEnabled) tunnel.startPeer(frontend.iceServers);

    loader = await createFrontendLoader(frontend, identity, tunnelFetch, signal);
    await loader.prepare();

    const appBasePath = new URL('./', location.href).pathname;
    swBridge = await setupServiceWorkerBridge(tunnel, appBasePath, signal);
    if (swBridge.active) {
      installSwScopeAlignment(appBasePath, signal, swBridge.getNavToken);
    }

    wrapGlobalFetch(tunnelFetch, loader.fetchAssetUrl);
    globalThis.__DSH_FILE_UPLOAD__ = { fetch: globalThis.fetch };
    globalThis.EventSource = createTunnelEventSource(tunnelFetch, { appBasePath });
    guardPluginServiceWorkers();
    installModuleLoaderQueue();

    globalThis.__DSH_BOOT__ = frontend.boot;
    globalThis.__DSH_IMPORT_CORE__ = loader.importCore;
    globalThis.__DSH_TRANSPORT__ = {
      ownsHost: true,
      streamBaseUrl: new URL('./', location.href).href,
      fetch: tunnelFetch,
      createWebSocket: (url) => tunnel.createWebSocket(url),
      loadBundle: loader.loadBundle,
      resolveAsset: loader.resolveAsset,
    };
    globalThis.__DSH_REMOTE_SHELL__ = {
      isRemote: true,
      getStatusSnapshot,
      getSnapshot: getStatusSnapshot,
      subscribe(fn) {
        subscribers.add(fn);
        return () => subscribers.delete(fn);
      },
      clearFrontendCache: clearCacheAndReload,
      lockAndForget: forget,
    };

    document.title = config.appTitle || 'DSH Remote';
    const theme = frontend.theme;
    if (['light', 'dark', 'system'].includes(theme?.preference)) {
      document.documentElement.dataset.dsThemeSource = theme.preference;
      const mq = matchMedia('(prefers-color-scheme: dark)');
      const applyDark = () => {
        document.body.toggleAttribute('data-ds-dark-theme', theme.preference === 'dark' ||
          (theme.preference === 'system' && mq.matches));
      };
      applyDark();
      mq.addEventListener?.('change', applyDark, { signal });
      for (const [name, value] of Object.entries(theme.cssVars ?? {})) {
        if (/^--[a-z0-9_-]{1,120}$/iu.test(name) && typeof value === 'string' && value.length <= 4096) {
          document.body.style.setProperty(name, value);
        }
      }
    }

    await loader.install();
    shellUI.destroy();
    ensureRootElement();
    reconnectBanner = shellUI.mountReconnectBanner({
      hostName: identity.hostName || identity.hostId,
      onLock: forget,
    });
    if (!swBridge.active) {
      shellUI.mountNoSwBanner();
    }
    emitSnapshot();
    await loader.importCore(frontend.entry);
  } catch (error) {
    close();
    shellUI.showError('DSH 远程工作台无法启动', error instanceof Error ? error.message : String(error));
  }
}

export function mount(appContainer, tianaContext, options) {
  const container = appContainer || document.getElementById('app') || document.body;
  const shellUI = createShellUI(container);
  void runRemoteSession(container, tianaContext, shellUI, options);
}

if (typeof window !== 'undefined' && !window.tiana && document.getElementById('app')) {
  mount(document.getElementById('app'), null);
}
