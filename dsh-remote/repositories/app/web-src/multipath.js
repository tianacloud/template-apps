import { base64UrlDecode, concatBytes, MSG_E2EE_BOX, MSG_E2EE_CTRL } from './e2ee.js';

const WINDOW = 128;
const WINDOW_BYTES = 2 << 20;
const MAX_QUEUE_BYTES = 8 << 20;
const MAX_QUEUE_FRAMES = 256;
export const CHUNK_SIZE = 32 << 10;
export const RELAY_GRACE_MS = 30_000;
export const LEASE_MS = 2 * 60 * 60 * 1000;
export const RENEW_MS = 110 * 60 * 1000;
const MAX_BOX = CHUNK_SIZE + 30;
const MAX_CONTROL = 66 << 10;
const CONTROL_MASK = (1n << 64n) - 1n;
const encode = new TextEncoder();
const decode = new TextDecoder();

function seqOf(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, 8).getBigUint64(0);
}

export function sessionPrefix(id) {
  return base64UrlDecode(id);
}

export class MultipathSession {
  constructor({ cipher, onData, onControl, onClose, onStall, leaseMs = LEASE_MS, initialLeaseMs }) {
    this.cipher = cipher;
    this.prefix = sessionPrefix(cipher.logicalSessionId);
    this.onData = onData;
    this.onControl = onControl;
    this.onClose = onClose;
    this.onStall = onStall;
    this.leaseMs = Math.min(leaseMs, LEASE_MS);
    this.unacked = new Map();
    this.unackedBytes = 0;
    this.queue = [];
    this.queueBytes = 0;
    this.received = new Map();
    this.verifying = new Set();
    this.controlVerifying = new Set();
    this.controlHigh = 0n;
    this.controlBits = 0n;
    this.controlTail = Promise.resolve();
    this.controlPending = 0;
    this.delivered = 0n;
    this.acknowledged = 0n;
    this.lastAck = 0n;
    this.closed = false;
    this.lastProgress = Date.now();
    this.lastRetransmit = this.lastProgress;
    this.renewLease(initialLeaseMs ?? this.leaseMs);
    this.ackWatcher = setInterval(() => {
      if (!this.unacked.size || Date.now() - this.lastProgress < 500) return;
      this.lastProgress = Date.now();
      if (this.lastProgress - this.lastRetransmit >= 1000) {
        this.lastRetransmit = this.lastProgress;
        for (const packet of this.unacked.values()) packet.sent = false;
        this.schedule();
      }
      if (++this.stalls >= 6) {
        this.stalls = 0;
        this.onStall?.(this.primary);
      }
      void this.control({ type: 'ack_req' }).catch(() => {});
    }, 250);
    this.stalls = 0;
  }

  renewLease(durationMs = this.leaseMs) {
    if (this.closed) return;
    clearTimeout(this.lease);
    const granted = Math.max(1, Math.min(this.leaseMs, Number.isFinite(durationMs) ? Math.floor(durationMs) : this.leaseMs));
    this.expiresAt = Date.now() + granted;
    this.lease = setTimeout(() => this.close(new Error('授权租期已到期')), granted);
  }

  live() {
    if (this.closed) return false;
    if (Date.now() < this.expiresAt) return true;
    this.close(new Error('授权租期已到期'));
    return false;
  }

  setRelay(path, reschedule = true) {
    this.relay = path;
    if (reschedule) this.selectPath();
  }

  setP2P(path) {
    this.p2p = path;
    this.selectPath();
  }

  selectPath() {
    const path = this.p2p?.ready() ? this.p2p : this.relay?.ready() ? this.relay : null;
    if (this.primary !== path) {
      this.primary = path;
      for (const packet of this.unacked.values()) packet.sent = false;
      this.lastProgress = Date.now();
      this.stalls = 0;
    }
    this.schedule();
  }

  schedule(delay = 0) {
    if (this.closed || this.pumping || this.scheduled) return;
    this.scheduled = setTimeout(() => {
      this.scheduled = null;
      void this.pump().catch((err) => this.close(err));
    }, delay);
  }

  send(body, signal) {
    if (!this.live() || this.queue.length >= MAX_QUEUE_FRAMES || this.queueBytes + body.length > MAX_QUEUE_BYTES ||
        body.length > MAX_BOX - 24) {
      return Promise.reject(new Error('远程发送队列已关闭或超过上限'));
    }
    if (signal?.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject) => {
      const item = { body, resolve, reject, signal };
      item.abort = () => {
        const index = this.queue.indexOf(item);
        if (index === -1) return;
        this.queue.splice(index, 1);
        this.queueBytes -= body.length;
        reject(signal.reason);
      };
      signal?.addEventListener('abort', item.abort, { once: true });
      this.queue.push(item);
      this.queueBytes += body.length;
      this.schedule();
    });
  }

  async pump() {
    if (this.pumping || !this.live()) return;
    this.pumping = true;
    let retry = false;
    try {
      while (!this.closed) {
        const path = this.primary;
        if (!path?.ready()) break;
        if (this.controlPending || path.bufferedAmount() > path.highWater) {
          retry = true;
          break;
        }
        let packet = [...this.unacked.values()].find((entry) => !entry.sent);
        if (!packet) {
          const item = this.queue[0];
          if (!item || this.unacked.size >= WINDOW ||
              this.unackedBytes + item.body.length + 24 > WINDOW_BYTES) break;
          this.queue.shift();
          this.queueBytes -= item.body.length;
          item.signal?.removeEventListener('abort', item.abort);
          let bytes;
          try {
            bytes = await this.cipher.seal(item.body);
          } catch (err) {
            item.reject(err);
            throw err;
          }
          if (this.closed) {
            item.reject(new Error('远程连接已结束，操作结果未知'));
            break;
          }
          packet = { bytes, sent: false };
          this.unacked.set(seqOf(bytes), packet);
          this.unackedBytes += bytes.length;
          item.resolve(true);
        }
        if (path !== this.primary || !path.ready()) continue;
        if (this.controlPending) {
          retry = true;
          break;
        }
        try {
          if (path.send(MSG_E2EE_BOX, packet.bytes) === false) {
            retry = true;
            break;
          }
          packet.sent = true;
        } catch {
          path.close();
          break;
        }
      }
    } finally {
      this.pumping = false;
      if (retry) this.schedule(10);
    }
  }

  control(message, path = this.primary) {
    if (!this.live() || !path?.ready()) return Promise.resolve(false);
    if (this.controlPending >= 64) return Promise.reject(new Error('远程控制队列超过上限'));
    const bytes = encode.encode(JSON.stringify(message));
    if (bytes.length > MAX_CONTROL - 40) return Promise.reject(new Error('远程控制消息超过上限'));
    this.controlPending++;
    const send = this.controlTail.then(async () => {
      if (this.closed || !path.ready()) return false;
      if (path.bufferedAmount() > path.highWater + MAX_CONTROL) return false;
      const box = await this.cipher.control.seal(bytes);
      if (this.closed || !path.ready()) return false;
      try {
        return path.send(MSG_E2EE_CTRL, concatBytes(this.prefix, box)) !== false;
      } catch {
        path.close();
        return false;
      }
    }).finally(() => {
      this.controlPending--;
      this.schedule();
    });
    this.controlTail = send.catch((err) => this.close(err));
    return send;
  }

  sendAck(path = this.primary) {
    clearTimeout(this.ackTimer);
    this.ackTimer = null;
    const delivered = this.delivered;
    void this.control({ type: 'ack', seq: String(delivered) }, path).then((sent) => {
      if (sent && delivered > this.lastAck) this.lastAck = delivered;
    }).catch(() => {});
  }

  receive(kind, packet, path) {
    if (!this.live() || !path.accept(packet.length)) return;
    if (kind === MSG_E2EE_CTRL) {
      void this.receiveControl(packet, path).catch(() => path.invalid());
    } else if (kind === MSG_E2EE_BOX && (path === this.relay || path === this.p2p)) {
      void this.receiveData(packet, path).catch(() => path.invalid());
    }
  }

  async receiveControl(packet, path) {
    if (packet.length < 40 || packet.length > MAX_CONTROL ||
        this.prefix.some((byte, i) => packet[i] !== byte)) return;
    const box = packet.subarray(16);
    const nonce = seqOf(box);
    const replayed = () => nonce === 0n || this.controlHigh >= nonce + 64n ||
      (nonce <= this.controlHigh && Boolean(this.controlBits & (1n << (this.controlHigh - nonce))));
    if (replayed() || this.controlVerifying.has(nonce) || this.controlVerifying.size >= 64) return;
    this.controlVerifying.add(nonce);
    try {
      const bytes = await this.cipher.control.openPacket(box);
      if (this.closed || replayed() || !path.ready()) return;
      if (nonce > this.controlHigh) {
        const step = nonce - this.controlHigh;
        this.controlBits = step >= 64n ? 1n : ((this.controlBits << step) | 1n) & CONTROL_MASK;
        this.controlHigh = nonce;
      } else {
        this.controlBits |= 1n << (this.controlHigh - nonce);
      }
      const message = JSON.parse(decode.decode(bytes));
      if (path !== this.relay && path !== this.p2p && !['bind_relay_leg', 'bound_relay_leg', 'lease_renew', 'path_probe', 'path_probe_ack'].includes(message.type)) return;
      if (message.type === 'ack') {
        if (!/^[0-9]{1,20}$/u.test(message.seq)) return;
        const ack = BigInt(message.seq);
        if (ack < this.acknowledged || ack > this.cipher.txSeq) return;
        if (ack === this.acknowledged) return;
        this.stalls = 0;
        this.acknowledged = ack;
        this.lastProgress = Date.now();
        this.lastRetransmit = this.lastProgress;
        for (const [seq, entry] of this.unacked) {
          if (seq > ack) break;
          this.unacked.delete(seq);
          this.unackedBytes -= entry.bytes.length;
        }
        this.schedule();
      } else if (message.type === 'ack_req') {
        this.sendAck(path);
      } else {
        await this.onControl?.(message, path);
      }
    } finally {
      this.controlVerifying.delete(nonce);
    }
  }

  async receiveData(packet, path) {
    if (packet.length < 29 || packet.length > MAX_BOX) return;
    const seq = seqOf(packet);
    if (seq <= this.delivered || seq > this.delivered + BigInt(WINDOW) ||
        this.received.has(seq) || this.verifying.has(seq)) return;
    this.verifying.add(seq);
    try {
      const plaintext = await this.cipher.openPacket(packet);
      if (this.closed) return;
      this.received.set(seq, plaintext);
      await this.deliver();

    } finally {
      this.verifying.delete(seq);
    }
  }

  async deliver() {
    if (this.delivering) return;
    this.delivering = true;
    try {
      while (!this.closed && this.received.has(this.delivered + 1n)) {
        const next = this.delivered + 1n;
        await this.onData(this.received.get(next));
        if (this.closed) return;
        this.received.delete(next);
        this.delivered = next;
      }
      if (this.delivered - this.lastAck >= 16n) this.sendAck();
      else if (this.delivered > this.lastAck && !this.ackTimer) {
        this.ackTimer = setTimeout(() => this.sendAck(), 20);
      }
    } catch (error) {
      this.close(error);
    } finally {
      this.delivering = false;
    }
  }

  close(reason = new Error('远程连接中断，未确认的操作结果未知')) {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.scheduled);
    clearTimeout(this.ackTimer);
    clearTimeout(this.lease);
    clearInterval(this.ackWatcher);
    for (const item of this.queue) {
      item.signal?.removeEventListener('abort', item.abort);
      item.reject(reason);
    }
    this.queue.length = 0;
    this.unacked.clear();
    this.unackedBytes = 0;
    this.queueBytes = 0;
    this.received.clear();
    this.onClose?.(reason);
  }
}

// Each Relay socket sees one shared pacing budget across its logical streams.
export function relayPacer() {
  let tokens = 64;
  let last = performance.now();
  return (type) => {
    const now = performance.now();
    tokens = Math.min(64, tokens + (now - last) * 0.3);
    last = now;
    if (tokens < (type === MSG_E2EE_CTRL ? 1 : 9)) return false;
    tokens--;
    return true;
  };
}

export function createPath({ send, ready, bufferedAmount, close, highWater = 256 << 10 }) {
  let start = Date.now();
  let count = 0;
  let size = 0;
  let invalid = 0;
  return {
    send, ready, bufferedAmount, close, highWater,
    accept(length) {
      if (Date.now() - start >= 1000) {
        start = Date.now();
        count = 0;
        size = 0;
      }
      size += length;
      return ++count <= 512 && size <= (32 << 20);
    },
    invalid() {
      if (++invalid >= 4) close();
    },
  };
}
