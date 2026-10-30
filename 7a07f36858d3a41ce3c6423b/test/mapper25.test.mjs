import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mapper25 } from "../scripts/jsnes-mapper25.mjs";

const bundle = await build({
  stdin: {
    contents: 'export { NES } from "jsnes";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  plugins: [mapper25],
});
const { NES } = await import(
  "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].text).toString("base64")
);

function createNES() {
  const rom = new Uint8Array(16 + 4 * 16384 + 4 * 8192);
  rom.set([0x4e, 0x45, 0x53, 0x1a, 4, 4, 0x90, 0x10]);
  for (let bank = 0; bank < 8; bank++)
    rom.fill(bank, 16 + bank * 8192, 16 + (bank + 1) * 8192);
  for (let bank = 0; bank < 32; bank++)
    rom.fill(bank, 16 + 65536 + bank * 1024, 16 + 65536 + (bank + 1) * 1024);
  const nes = new NES();
  nes.loadROM(rom);
  nes.cpu.irqRequested = false;
  return nes;
}

for (const [name, low, high] of [
  ["VRC4b", 2, 1],
  ["VRC4d", 8, 4],
]) {
  test(`${name} switches PRG, split CHR registers and mirroring`, () => {
    const nes = createNES(),
      mapper = nes.mmap;
    mapper.write(0x8000, 3);
    mapper.write(0xa000, 4);
    assert.equal(nes.cpu.mem[0x8000], 3);
    assert.equal(nes.cpu.mem[0xa000], 4);
    assert.equal(nes.cpu.mem[0xc000], 6);
    assert.equal(nes.cpu.mem[0xe000], 7);
    mapper.write(0x9000 | high, 2);
    assert.equal(nes.cpu.mem[0x8000], 6);
    assert.equal(nes.cpu.mem[0xc000], 3);
    mapper.write(0xb000, 5);
    mapper.write(0xb000 | low, 1);
    mapper.write(0xb000 | high, 7);
    assert.equal(nes.ppu.vramMem[0], 21);
    assert.equal(nes.ppu.vramMem[1024], 7);
    mapper.write(0x9000, 3);
    assert.equal(nes.ppu.currentMirroring, nes.rom.SINGLESCREEN_MIRRORING2);
  });
}

test("VRC4 IRQ clocks during blanking, acknowledges and resumes with exact saved prescaler", () => {
  const nes = createNES(),
    mapper = nes.mmap;
  mapper.write(0xf000, 14);
  mapper.write(0xf008, 15);
  mapper.write(0xf004, 3);
  mapper.clockCpuCycles(113);
  assert.equal(mapper.vrc.counter, 254);
  mapper.clockCpuCycles(1);
  assert.equal(mapper.vrc.counter, 255);
  mapper.clockCpuCycles(114);
  assert.equal(mapper.vrc.pending, true);
  mapper.write(0xf00c, 0);
  assert.equal(mapper.vrc.pending, false);
  assert.equal(mapper.vrc.enabled, true);
  const snapshot = JSON.parse(JSON.stringify(nes.toJSON()));
  mapper.clockCpuCycles(341);
  const expected = mapper.toJSON();
  nes.fromJSON(snapshot);
  nes.mmap.clockCpuCycles(341);
  assert.deepEqual(nes.mmap.toJSON(), expected);
  nes.mmap.write(0xf004, 6);
  nes.mmap.clockCpuCycles(2);
  assert.equal(nes.mmap.vrc.pending, true);
  nes.mmap.write(0xf00c, 0);
  assert.equal(nes.mmap.vrc.enabled, false);
});
