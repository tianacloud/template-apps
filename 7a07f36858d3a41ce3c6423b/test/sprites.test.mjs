import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { spriteFix } from "../scripts/jsnes-sprite-fix.mjs";
import { diagnosticROM } from "./fixture.mjs";

const bundle = await build({
  stdin: {
    contents: 'export { NES } from "jsnes";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  format: "esm",
  platform: "node",
  write: false,
  plugins: [spriteFix],
});
const { NES } = await import(
  "data:text/javascript;base64," +
    Buffer.from(bundle.outputFiles[0].text).toString("base64")
);

for (const bank of [0, 1]) {
  for (const flip of [false, true]) {
    test(`8x16 sprites render both tile halves in bank ${bank}, vertical flip ${flip}`, () => {
      const nes = new NES();
      nes.loadROM(diagnosticROM());
      const ppu = nes.ppu;
      ppu.f_spVisibility = 1;
      ppu.f_spriteSize = 1;
      const topTile = bank * 256 + 2;
      ppu.ptTile[topTile].pix.fill(1);
      ppu.ptTile[topTile + 1].pix.fill(2);
      ppu.sprPalette[1] = 0x112233;
      ppu.sprPalette[2] = 0x445566;
      ppu.buffer.fill(0);
      ppu.pixrendered.fill(0xff);
      for (let y = 32; y < 48; y++) {
        ppu.scanlineSpriteCount[y] = 1;
        ppu.scanlineSecondaryOAM.set(
          [31, 2 + bank, flip ? 0x80 : 0, 32],
          y * 32,
        );
      }
      ppu.renderSpritesPartially(32, 16, 0);
      for (let y = 32; y < 48; y++) {
        const first = y < 40 !== flip;
        for (let x = 32; x < 40; x++)
          assert.equal(
            ppu.buffer[y * 256 + x],
            first ? 0x112233 : 0x445566,
            `pixel ${x},${y}`,
          );
      }
    });
  }
}
