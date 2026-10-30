// Konami VRC4b/VRC4d (iNES 25).
// Register wiring: https://www.nesdev.org/wiki/VRC4
// IRQ counter: https://www.nesdev.org/wiki/VRC_IRQ
export function createMapper25(Mapper0) {
  return class Mapper25 extends Mapper0 {
    static mapperName = "Konami VRC4";

    constructor(nes) {
      super(nes);
      this.vrc = {
        prg: [0, 1],
        chr: Array.from({ length: 8 }, (_, i) => i),
        swap: 0,
        latch: 0,
        counter: 0,
        prescaler: 341,
        enabled: false,
        afterAck: false,
        cycleMode: false,
        pending: false,
      };
    }

    syncPRG() {
      const fixed = this.nes.rom.romCount * 2 - 2;
      this.load8kRomBank(this.vrc.swap ? fixed : this.vrc.prg[0], 0x8000);
      this.load8kRomBank(this.vrc.prg[1], 0xa000);
      this.load8kRomBank(this.vrc.swap ? this.vrc.prg[0] : fixed, 0xc000);
      this.load8kRomBank(fixed + 1, 0xe000);
    }

    loadROM() {
      this.syncPRG();
      this.loadCHRROM();
      this.loadBatteryRam();
      this.nes.cpu.requestIrq(this.nes.cpu.IRQ_RESET);
    }

    write(address, value) {
      if (address < 0x8000) return super.write(address, value);
      const sub = this.nes.rom.isNES2 ? this.nes.rom.header[8] >> 4 : 0;
      const a0 =
        (sub === 1
          ? address >> 1
          : sub === 2
            ? address >> 3
            : (address >> 1) | (address >> 3)) & 1;
      const a1 =
        (sub === 1
          ? address
          : sub === 2
            ? address >> 2
            : address | (address >> 2)) & 1;
      const reg = (address & 0xf000) | (a1 << 1) | a0;
      const state = this.vrc;
      switch (reg & 0xf000) {
        case 0x8000:
        case 0xa000:
          state.prg[(reg >> 13) & 1] = value & 31;
          this.syncPRG();
          break;
        case 0x9000:
          if (reg === 0x9000) {
            const rom = this.nes.rom;
            this.nes.ppu.setMirroring(
              [
                rom.VERTICAL_MIRRORING,
                rom.HORIZONTAL_MIRRORING,
                rom.SINGLESCREEN_MIRRORING,
                rom.SINGLESCREEN_MIRRORING2,
              ][value & 3],
            );
          } else if (reg === 0x9002) {
            state.swap = value & 2;
            this.syncPRG();
          }
          break;
        case 0xb000:
        case 0xc000:
        case 0xd000:
        case 0xe000: {
          const bank = ((reg >> 12) - 11) * 2 + ((reg >> 1) & 1);
          state.chr[bank] =
            reg & 1
              ? (state.chr[bank] & 15) | ((value & 31) << 4)
              : (state.chr[bank] & 0x1f0) | (value & 15);
          this.load1kVromBank(state.chr[bank], bank * 1024);
          break;
        }
        case 0xf000:
          if (reg === 0xf000) state.latch = (state.latch & 0xf0) | (value & 15);
          else if (reg === 0xf001)
            state.latch = (state.latch & 15) | ((value & 15) << 4);
          else if (reg === 0xf002) {
            state.pending = false;
            state.enabled = !!(value & 2);
            state.afterAck = !!(value & 1);
            state.cycleMode = !!(value & 4);
            state.prescaler = 341;
            if (state.enabled) state.counter = state.latch;
          } else {
            state.pending = false;
            state.enabled = state.afterAck;
          }
      }
    }

    clockCpuCycles(cycles) {
      const state = this.vrc;
      if (state.enabled) {
        let ticks = cycles;
        if (!state.cycleMode) {
          state.prescaler -= cycles * 3;
          ticks = 0;
          while (state.prescaler <= 0) {
            state.prescaler += 341;
            ticks++;
          }
        }
        while (ticks-- > 0) {
          if (state.counter === 255) {
            state.counter = state.latch;
            state.pending = true;
          } else state.counter++;
        }
      }
      if (state.pending && this.nes.cpu.F_INTERRUPT === 0)
        this.nes.cpu.requestIrq(this.nes.cpu.IRQ_NORMAL);
    }

    toJSON() {
      return {
        ...super.toJSON(),
        vrc: { ...this.vrc, prg: [...this.vrc.prg], chr: [...this.vrc.chr] },
      };
    }

    fromJSON(state) {
      super.fromJSON(state);
      this.vrc = {
        ...state.vrc,
        prg: [...state.vrc.prg],
        chr: [...state.vrc.chr],
      };
    }
  };
}
