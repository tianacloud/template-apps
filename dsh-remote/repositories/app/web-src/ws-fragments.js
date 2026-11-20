import { concatBytes } from './e2ee.js';
import { CHUNK_SIZE } from './multipath.js';

const FIRST = 1;
const FIN = 2;
const MAX_MESSAGE = 16 << 20;
const encoder = new TextEncoder();

export async function sendFragments(value, send) {
  const bytes = typeof value === 'string' ? encoder.encode(value) :
    value instanceof Uint8Array ? value : new Uint8Array(value);
  if (bytes.length > MAX_MESSAGE) throw new Error('Virtual WebSocket message exceeds 16 MiB');
  for (let offset = 0; offset === 0 || offset < bytes.length; offset += CHUNK_SIZE - 1) {
    const end = Math.min(offset + CHUNK_SIZE - 1, bytes.length);
    const flags = (offset === 0 ? FIRST : 0) | (end === bytes.length ? FIN : 0);
    await send(concatBytes(Uint8Array.of(flags), bytes.subarray(offset, end)));
  }
}

export class FragmentReader {
  constructor() {
    this.parts = [];
    this.size = 0;
  }

  push(kind, packet) {
    const flags = packet[0];
    if (!packet.length || flags > (FIRST | FIN) || packet.length > CHUNK_SIZE ||
        Boolean(flags & FIRST) !== (this.parts.length === 0) ||
        (this.parts.length > 0 && this.kind !== kind) ||
        (!((flags & FIN) === FIN) && packet.length !== CHUNK_SIZE)) {
      throw new Error('Invalid WebSocket message fragments');
    }
    this.kind = kind;
    this.parts.push(packet.subarray(1));
    this.size += packet.length - 1;
    if (this.size > MAX_MESSAGE) throw new Error('Virtual WebSocket message exceeds 16 MiB');
    if (flags & FIN) {
      const result = concatBytes(...this.parts);
      this.parts = [];
      this.size = 0;
      return result;
    }
    return undefined;
  }
}
