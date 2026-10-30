import { readFile } from "node:fs/promises";

// JSNES 2.1.0: select the even tile pair in the bank chosen by bit 0.
// https://github.com/bfirsh/jsnes/pull/784
export const spriteFix = {
  name: "jsnes-8x16-sprite-address",
  setup(builder) {
    builder.onLoad(
      { filter: /jsnes\/src\/ppu\/index\.js$/ },
      async ({ path }) => {
        const source = await readFile(path, "utf8");
        const incorrect =
          "let top = (sprTile & 1) !== 0 ? topTileNum - 1 + 256 : topTileNum;";
        if (!source.includes(incorrect))
          throw new Error(
            "Review the sprite fix against the installed JSNES source",
          );
        return {
          contents: source.replace(
            incorrect,
            "let top = topTileNum + ((sprTile & 1) !== 0 ? 256 : 0);",
          ),
          loader: "js",
        };
      },
    );
  },
};
