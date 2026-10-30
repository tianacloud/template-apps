// Original NROM diagnostic: update a RAM counter once per vblank and paint a solid screen.
export function diagnosticROM(color = 0x21) {
  const rom = new Uint8Array(16 + 16384 + 8192);
  rom.set([0x4e, 0x45, 0x53, 0x1a, 1, 1]);
  const code = [
    0x78,
    0xd8,
    0xa2,
    0xff,
    0x9a, // SEI, CLD, LDX, TXS
    0xa9,
    0,
    0x8d,
    0,
    0x20,
    0x8d,
    1,
    0x20, // disable PPU
    0x2c,
    2,
    0x20, // reset address latch
    0xa9,
    0x3f,
    0x8d,
    6,
    0x20,
    0xa9,
    0,
    0x8d,
    6,
    0x20, // palette address
    0xa9,
    color,
    0x8d,
    7,
    0x20,
    0x2c,
    2,
    0x20,
    0x10,
    0xfb, // await vblank
    0xe6,
    0, // INC $00
    0x4c,
    0x1f,
    0x80, // loop
  ];
  rom.set(code, 16);
  for (const offset of [0x3ffa, 0x3ffc, 0x3ffe])
    rom.set([0, 0x80], 16 + offset);
  return rom;
}
