import { Controller } from "jsnes";

export const keyMap = {
  KeyA: Controller.BUTTON_LEFT,
  KeyD: Controller.BUTTON_RIGHT,
  KeyW: Controller.BUTTON_UP,
  KeyS: Controller.BUTTON_DOWN,
  Tab: Controller.BUTTON_SELECT,
  Space: Controller.BUTTON_START,
  Enter: Controller.BUTTON_START,
  KeyJ: Controller.BUTTON_TURBO_A,
  KeyK: Controller.BUTTON_TURBO_B,
  KeyN: Controller.BUTTON_A,
  KeyM: Controller.BUTTON_B,
};
export function createControls(nes) {
  const held = new Map();
  return {
    press(source, button) {
      if (held.has(source)) return;
      held.set(source, button);
      nes.buttonDown(1, button);
    },
    release(source) {
      const button = held.get(source);
      held.delete(source);
      if (button !== undefined && ![...held.values()].includes(button))
        nes.buttonUp(1, button);
    },
    releaseAll() {
      held.clear();
      for (let button = 0; button <= Controller.BUTTON_TURBO_B; button++)
        nes.buttonUp(1, button);
    },
  };
}
