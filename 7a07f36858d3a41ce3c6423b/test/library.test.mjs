import test from "node:test";
import assert from "node:assert/strict";
import { deleteGame } from "../src/library.js";

for (const failure of ["file", "saves", "record", "none"]) {
  test(`deletion retries converge after ${failure} failure, including lost acknowledgments`, async () => {
    let file = true,
      saves = true,
      record = true,
      failed = false;
    const game = { file_path: "roms/test.nes", rom_hash: "test" };
    function fail(stage) {
      if (failure === stage && !failed) {
        failed = true;
        throw new Error("Network failure");
      }
    }
    const files = {
      delete: async (path) => {
        assert.equal(path, game.file_path);
        if (!file)
          throw Object.assign(new Error("Missing"), { code: "FILE_NOT_FOUND" });
        file = false;
        fail("file");
      },
    };
    const storage = {
      removeSaves: async (hash) => {
        assert.equal(hash, game.rom_hash);
        assert.equal(file, false);
        saves = false;
        fail("saves");
      },
      removeGame: async (hash) => {
        assert.equal(hash, game.rom_hash);
        assert.equal(saves, false);
        record = false;
        fail("record");
      },
    };
    if (failure !== "none") {
      await assert.rejects(deleteGame(storage, files, game), /Network failure/);
      if (failure !== "record") assert.equal(record, true);
    }
    await deleteGame(storage, files, game);
    await deleteGame(storage, files, game);
    assert.deepEqual([file, saves, record], [false, false, false]);
  });
}
test("real storage errors leave records available for retry", async () => {
  const error = Object.assign(new Error("Storage unavailable"), {
    code: "FILE_UNAVAILABLE",
  });
  await assert.rejects(
    deleteGame(
      {
        removeSaves() {
          assert.fail("must retain saves");
        },
        removeGame() {
          assert.fail("must retain file path");
        },
      },
      {
        delete() {
          throw error;
        },
      },
      { file_path: "roms/test.nes" },
    ),
    error,
  );
});
