import { generateLogicalSessionId, MSG_E2EE_BOX, MSG_E2EE_CTRL } from './e2ee.js';
import { createPath } from './multipath.js';

const STUN_DEFAULT = 'stun:stun.cloudflare.com:3478';
const PROBE_TIMEOUT = 5000;
const MAX_CANDIDATES = 32;
const MAX_SDP = 64 << 10;
const LABEL = 'dsh-remote-v2';

export function normalizeStun(value) {
  if (value === 'none') return [];
  const urls = value ? (Array.isArray(value) ? value : value.split(',')) : [STUN_DEFAULT];
  if (urls.length > 4 || urls.some((url) => !/^stun:(?:[a-z0-9][a-z0-9.-]*|\[[a-f0-9:]+\])(?::[0-9]{1,5})?$/iu.test(url))) {
    throw new Error('Invalid DSH_REMOTE_STUN server configuration');
  }
  return urls;
}

export function normalizeP2pEnabled(value) {
  if (value === false || (typeof value === 'string' && ['0', 'false', 'off', 'none'].includes(value.trim().toLowerCase()))) {
    return false;
  }
  return true;
}

export function localAddress(address) {
  if (typeof address !== 'string' || !address) return false;
  const bare = address.startsWith('[') && address.endsWith(']') ? address.slice(1, -1) : address;
  const lower = bare.toLowerCase();
  if (lower.endsWith('.local') || lower === '::1' || /^f[cd][0-9a-f]{2}:/u.test(lower) ||
      /^fe[89ab][0-9a-f]:/u.test(lower)) return true;
  const v4 = lower.startsWith('::ffff:') ? lower.slice(7) : lower;
  const ip = v4.split('.').map(Number);
  if (ip.length !== 4 || ip.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  return ip[0] === 10 || ip[0] === 127 || (ip[0] === 192 && ip[1] === 168) ||
    (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) ||
    (ip[0] === 100 && ip[1] >= 64 && ip[1] <= 127) || (ip[0] === 169 && ip[1] === 254);
}

function safeCandidate(line, urls) {
  if (typeof line !== 'string' || line.length > 1024 || /[\r\n]/u.test(line)) return false;
  const fields = line.split(/ +/u);
  const [foundation, component, protocol, , address, port, typ, kind] = fields;
  return /^candidate:[A-Za-z0-9+\/]+$/u.test(foundation) && component === '1' &&
    protocol?.toLowerCase() === 'udp' && typeof address === 'string' &&
    /^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-f0-9:]+:[a-f0-9:]+|[-a-z0-9.]+\.local)$/iu.test(address) &&
    /^[1-9][0-9]{0,4}$/u.test(port) && Number(port) <= 65535 &&
    typ === 'typ' && (kind === 'host' || (urls.length > 0 && (kind === 'srflx' || kind === 'prflx'))) &&
    (urls.length > 0 || localAddress(address));
}

function sanitizeSdp(sdp, urls) {
  if (typeof sdp !== 'string' || sdp.length > MAX_SDP) throw new Error('Invalid ICE description size');
  let count = 0;
  const lines = sdp.split(/\r?\n/u).filter((line) => {
    if (!line.startsWith('a=candidate:')) return true;
    ++count;
    return count <= MAX_CANDIDATES && safeCandidate(line.slice(2), urls);
  });
  if (lines.filter((line) => line.startsWith('m=')).length !== 1 ||
      !lines.some((line) => /^m=application \d+ UDP\/DTLS\/SCTP webrtc-datachannel$/u.test(line))) {
    throw new Error('Unsupported WebRTC description');
  }
  return lines.join('\r\n');
}

export class PeerPath {
  constructor(session, { createPeer, sendChannel, initiator, urls, onPath, signalPath, probeTimeout = PROBE_TIMEOUT }) {
    this.session = session;
    this.createPeer = createPeer;
    this.sendChannel = sendChannel;
    this.initiator = initiator;
    this.urls = urls;
    this.onPath = onPath;
    this.signalPath = signalPath;
    this.probeTimeout = probeTimeout;
    this.epoch = 0;
  }

  async start() {
    if (!this.initiator || this.current || this.session.closed) return;
    const state = this.begin(this.epoch + 1);
    this.bindChannel(state, state.pc.createDataChannel(LABEL, { ordered: true }));
    try {
      const offer = await state.pc.createOffer();
      await state.pc.setLocalDescription(offer);
      await this.sendDescription(state, 'p2p_offer');
    } catch {
      await this.stop(state);
    }
  }

  begin(epoch) {
    const pc = this.createPeer({ iceServers: this.urls.map((urls) => ({ urls })) });
    const state = {
      pc, epoch, count: 0, incoming: 0, queued: [], outgoing: [],
      remoteReady: false, localReady: false, heard: Date.now(), probe: generateLogicalSessionId(),
    };
    this.epoch = epoch;
    this.current = state;
    state.timer = setTimeout(() => void this.stop(state), this.probeTimeout);
    pc.onconnectionstatechange = () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) void this.stop(state);
    };
    pc.onicecandidate = ({ candidate }) => {
      if (this.current !== state || !candidate || state.count >= MAX_CANDIDATES ||
          !safeCandidate(candidate.candidate, this.urls)) return;
      state.count++;
      const row = {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      };
      if (state.localReady) void this.signal(state, 'p2p_candidate', { candidate: row }).catch(() => this.stop(state));
      else state.outgoing.push(row);
    };
    if (!this.initiator) pc.ondatachannel = ({ channel }) => this.bindChannel(state, channel);
    return state;
  }

  signal(state, type, fields) {
    return this.session.control({ type, epoch: state.epoch, ...fields }, this.signalPath());
  }

  async sendDescription(state, type) {
    if (this.current !== state) return;
    const sdp = sanitizeSdp(state.pc.localDescription.sdp, this.urls);
    // Candidates gathered synchronously by werift are already in SDP.
    const embedded = new Set(sdp.split('\r\n').filter((row) => row.startsWith('a=candidate:')).map((row) => row.slice(2)));
    if (!await this.signal(state, type, { sdp })) throw new Error('Relay signaling is unavailable');
    if (this.current !== state) return;
    for (const candidate of state.outgoing.splice(0)) {
      if (!embedded.has(candidate.candidate)) await this.signal(state, 'p2p_candidate', { candidate });
    }
    state.localReady = true;
  }

  bindChannel(state, channel) {
    if (this.current !== state || state.channel || channel.label !== LABEL || !channel.ordered ||
        channel.maxRetransmits != null || channel.maxPacketLifeTime != null) {
      channel.close();
      return;
    }
    state.channel = channel;
    channel.binaryType = 'arraybuffer';
    channel.bufferedAmountLowThreshold = 128 << 10;
    const path = state.path = createPath({
      ready: () => this.current === state && channel.readyState === 'open',
      send: (kind, payload) => {
        const packet = new Uint8Array(1 + payload.length);
        packet[0] = kind;
        packet.set(payload, 1);
        this.sendChannel(channel, packet);
      },
      bufferedAmount: () => channel.bufferedAmount,
      close: () => void this.stop(state),
      highWater: 512 << 10,
    });
    channel.onmessage = ({ data }) => {
      if (typeof data === 'string') return;
      const bytes = new Uint8Array(data);
      if (bytes[0] === MSG_E2EE_CTRL || bytes[0] === MSG_E2EE_BOX) this.session.receive(bytes[0], bytes.subarray(1), path);
    };
    channel.onopen = () => {
      const limit = state.pc.sctp?.maxMessageSize;
      if (typeof limit === 'number' && limit > 0 && limit < (33 << 10)) {
        void this.stop(state);
        return;
      }
      if (this.urls.length === 0) {
        const iceConn = state.pc.sctp?.dtlsTransport?.iceTransport?.connection ?? state.pc.dtlsTransports?.[0]?.iceTransport?.connection;
        const remotes = iceConn?._remoteCandidates ?? [];
        const nomHost = iceConn?.nominated?.remoteCandidate?.host ?? iceConn?.nominated?.remoteAddr?.[0];
        if (remotes.some((c) => !localAddress(c?.host)) || (nomHost !== undefined && !localAddress(nomHost))) {
          void this.stop(state);
          return;
        }
      }
      const probe = () => {
        if (Date.now() - state.heard >= 4000) {
          void this.stop(state);
          return;
        }
        void this.session.control({ type: 'path_probe', epoch: state.epoch, probe: state.probe }, path)
          .catch(() => this.stop(state));
      };
      probe();
      state.heartbeat = setInterval(probe, 2000);
    };
    channel.onclose = channel.onerror = () => void this.stop(state);
    if (channel.readyState === 'open') channel.onopen();
  }

  async handle(message, path) {
    const { type, epoch } = message;
    if (!Number.isSafeInteger(epoch) || epoch <= 0) return;
    let state = this.current;
    if (type === 'p2p_offer' && !this.initiator && !state && epoch > this.epoch && path === this.signalPath()) {
      const sdp = sanitizeSdp(message.sdp, this.urls);
      state = this.begin(epoch);
      try {
        await state.pc.setRemoteDescription({ type: 'offer', sdp });
        await this.flushCandidates(state);
        const answer = await state.pc.createAnswer();
        await state.pc.setLocalDescription(answer);
        await this.sendDescription(state, 'p2p_answer');
      } catch {
        await this.stop(state);
      }
      return;
    }
    if (!state || state.epoch !== epoch) return;
    if (type === 'p2p_answer' && this.initiator && !state.remoteReady && path === this.signalPath() && !state.answering) {
      state.answering = true;
      try {
        await state.pc.setRemoteDescription({ type: 'answer', sdp: sanitizeSdp(message.sdp, this.urls) });
        await this.flushCandidates(state);
      } catch {
        await this.stop(state);
      }
    } else if (type === 'p2p_candidate' && path === this.signalPath()) {
      const remote = message.candidate;
      if (!safeCandidate(remote?.candidate, this.urls) || ++state.incoming > MAX_CANDIDATES ||
          (remote.sdpMLineIndex != null && remote.sdpMLineIndex !== 0)) return;
      if (state.remoteReady) await state.pc.addIceCandidate(remote);
      else state.queued.push(remote);
    } else if (path === state.path && typeof message.probe === 'string' && /^[A-Za-z0-9_-]{22}$/u.test(message.probe)) {
      if (type === 'path_probe') {
        state.incomingProbe = true;
        await this.session.control({ type: 'path_probe_ack', epoch, probe: message.probe }, path);
      } else if (type === 'path_probe_ack' && message.probe === state.probe) {
        state.heard = Date.now();
        state.ack = true;
      }
      if (this.current === state && state.incomingProbe && state.ack && !state.promoted) {
        state.promoted = true;
        clearTimeout(state.timer);
        this.session.setP2P(path);
        this.onPath?.(true);
      }
    }
  }

  async flushCandidates(state) {
    state.remoteReady = true;
    for (const candidate of state.queued.splice(0)) await state.pc.addIceCandidate(candidate);
  }

  async stop(state = this.current) {
    if (!state || this.current !== state) return;
    this.current = null;
    clearTimeout(state.timer);
    clearInterval(state.heartbeat);
    state.pc.onicecandidate = state.pc.onconnectionstatechange = state.pc.ondatachannel = null;
    if (state.channel) {
      state.channel.onopen = state.channel.onmessage = state.channel.onclose = state.channel.onerror = null;
      state.channel.close();
    }
    if (state.promoted) {
      this.session.setP2P(null);
      this.onPath?.(false);
    }
    await state.pc.close();
  }
}
