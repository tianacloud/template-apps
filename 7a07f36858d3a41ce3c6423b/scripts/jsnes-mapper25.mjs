import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const mapper25 = {
  name: "jsnes-vrc4",
  setup(builder) {
    builder.onLoad(
      { filter: /jsnes\/src\/mappers\/index\.js$/ },
      async ({ path }) => {
        const source = await readFile(path, "utf8");
        const mapper = fileURLToPath(
          new URL("../src/mapper25.js", import.meta.url),
        );
        return {
          contents:
            `import { createMapper25 } from ${JSON.stringify(mapper)};\n` +
            source.replace(
              "0: Mapper0,",
              "0: Mapper0,\n 25: createMapper25(Mapper0),",
            ),
          loader: "js",
        };
      },
    );
    builder.onLoad({ filter: /jsnes\/src\/nes\.js$/ }, async ({ path }) => {
      let source = await readFile(path, "utf8");
      for (const [anchor, cycles] of [
        ["cycles = cpu.emulate();", "cycles"],
        ["papu.clockFrameCounter(chunk);", "chunk"],
      ]) {
        if (!source.includes(anchor))
          throw new Error(
            "Review VRC4 clock integration against installed JSNES",
          );
        source = source.replace(
          anchor,
          `${anchor}\n          this.mmap.clockCpuCycles?.(${cycles});`,
        );
      }
      return { contents: source, loader: "js" };
    });
  },
};
