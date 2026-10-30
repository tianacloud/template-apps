import test from "node:test";
import assert from "node:assert/strict";
import { NES, Controller } from "jsnes";
import { encodeState, decodeState } from "../src/storage.js";
import { createControls, keyMap } from "../src/controls.js";
import { diagnosticROM } from "./fixture.mjs";

test("save state restores CPU, memory and frame trajectory", async () => {
  let frame;
  const rom = diagnosticROM();
  const nes = new NES({
    onFrame: (value) => {
      frame = Array.from(value);
    },
  });
  nes.loadROM(rom);
  for (let i = 0; i < 60; i++) nes.frame();
  const counter = nes.cpu.mem[0];
  assert.ok(counter > 0);
  const snapshot = await decodeState(await encodeState(nes.toJSON()));
  for (let i = 0; i < 30; i++) nes.frame();
  assert.notEqual(nes.cpu.mem[0], counter);
  const expected = { pc: nes.cpu.REG_PC, counter: nes.cpu.mem[0], frame };
  nes.fromJSON(snapshot);
  for (let i = 0; i < 30; i++) nes.frame();
  assert.equal(nes.cpu.REG_PC, expected.pc);
  assert.equal(nes.cpu.mem[0], expected.counter);
  assert.deepEqual(frame, expected.frame);
});

test("WASD, Tab and both confirmation keys reach the NES controller", () => {
  const nes = new NES(),
    input = createControls(nes),
    state = nes.controllers[1].state;
  for (const [code, button] of Object.entries(keyMap).filter(
    ([, b]) => b < 8,
  )) {
    input.press(code, button);
    assert.equal(state[button], 0x41, code);
    input.release(code);
    assert.equal(state[button], 0x40, code);
  }
  input.press("Enter", keyMap.Enter);
  input.press("Space", keyMap.Space);
  input.release("Enter");
  assert.equal(state[Controller.BUTTON_START], 0x41);
  input.release("Space");
  assert.equal(state[Controller.BUTTON_START], 0x40);
});

for (const [turboKey, normalKey, button] of [
  ["KeyJ", "KeyN", Controller.BUTTON_A],
  ["KeyK", "KeyM", Controller.BUTTON_B],
]) {
  test(`${turboKey} pulses and ${normalKey} holds NES button ${button}`, () => {
    const nes = new NES(),
      input = createControls(nes),
      controller = nes.controllers[1];
    input.press(turboKey, keyMap[turboKey]);
    input.press("KeyD", keyMap.KeyD);
    const pulses = [];
    for (let i = 0; i < 12; i++) {
      controller.clock();
      pulses.push(controller.state[button]);
      assert.equal(controller.state[1 - button], 0x40);
      assert.equal(controller.state[Controller.BUTTON_RIGHT], 0x41);
    }
    assert.deepEqual(
      pulses,
      [0x41, 0x40, 0x41, 0x40, 0x41, 0x40, 0x41, 0x40, 0x41, 0x40, 0x41, 0x40],
    );
    input.press(normalKey, keyMap[normalKey]);
    input.release(turboKey);
    for (let i = 0; i < 12; i++) {
      controller.clock();
      assert.equal(controller.state[button], 0x41);
      assert.equal(controller.state[1 - button], 0x40);
    }
    input.release(normalKey);
    assert.equal(controller.state[button], 0x40);
    input.press(normalKey, keyMap[normalKey]);
    input.releaseAll();
    controller.clock();
    assert.ok(controller.state.every((value) => value === 0x40));
  });
}
