import { createTianaFetch } from "@tianacloud/serverless";

export async function openStorage() {
  const appId = window.tiana.appId;
  const connection = await window.tiana.connection();
  if (connection.sql_api !== "hrana-v3")
    throw new Error("当前数据库未提供 hrana-v3 接口");
  const sqlFetch = createTianaFetch({
    origin: connection.origin,
    auth: window.tiana.auth,
    requestBodyMode: "buffered",
  });
  async function execute(sql, args = []) {
    const response = await sqlFetch(`${connection.origin}/v3/pipeline`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql,
              args: args.map((value) =>
                typeof value === "number"
                  ? { type: "integer", value: String(value) }
                  : { type: "text", value },
              ),
              want_rows: true,
            },
          },
          { type: "close" },
        ],
      }),
    });
    if (!response.ok)
      throw new Error("数据库连接失败；如正在存档，请先刷新存档列表确认结果");
    const body = await response.json();
    const statement = body.results?.[0];
    if (statement?.type !== "ok" || statement.response?.type !== "execute")
      throw new Error(
        statement?.error?.message || "数据库未确认结果，请刷新存档列表核对",
      );
    const result = statement.response.result;
    return result.rows.map((row) =>
      Object.fromEntries(
        result.cols.map((col, i) => [col.name, row[i].value ?? null]),
      ),
    );
  }
  return {
    listGames: (before, query = "") =>
      execute(
        "SELECT rom_hash,title,file_path,size_bytes,added_at,pinned,use_count FROM nes_games WHERE app_id=? AND instr(lower(title),lower(?)) > 0" +
          (before
            ? " AND (pinned,use_count,added_at,rom_hash) < (?,?,?,?)"
            : "") +
          " ORDER BY pinned DESC,use_count DESC,added_at DESC,rom_hash DESC LIMIT 25",
        before
          ? [
              appId,
              query,
              Number(before.pinned),
              Number(before.use_count),
              before.added_at,
              before.rom_hash,
            ]
          : [appId, query],
      ),
    game: async (hash) =>
      (
        await execute(
          "SELECT rom_hash,title,file_path,size_bytes,added_at,pinned,use_count FROM nes_games WHERE app_id=? AND rom_hash=?",
          [appId, hash],
        )
      )[0],
    add: (game) =>
      execute(
        "INSERT INTO nes_games (app_id,rom_hash,title,file_path,size_bytes,added_at) VALUES (?,?,?,?,?,?)",
        [
          appId,
          game.rom_hash,
          game.title,
          game.file_path,
          game.size_bytes,
          game.added_at,
        ],
      ),
    recordUse: (hash) =>
      execute(
        "UPDATE nes_games SET use_count=use_count+1 WHERE app_id=? AND rom_hash=?",
        [appId, hash],
      ),
    setPinned: (hash, pinned) =>
      execute("UPDATE nes_games SET pinned=? WHERE app_id=? AND rom_hash=?", [
        pinned ? 1 : 0,
        appId,
        hash,
      ]),
    rename: (hash, title) =>
      execute("UPDATE nes_games SET title=? WHERE app_id=? AND rom_hash=?", [
        title,
        appId,
        hash,
      ]),
    removeSaves: (hash) =>
      execute("DELETE FROM nes_save_slots WHERE app_id=? AND rom_hash=?", [
        appId,
        hash,
      ]),
    removeGame: (hash) =>
      execute("DELETE FROM nes_games WHERE app_id=? AND rom_hash=?", [
        appId,
        hash,
      ]),
    lastGame: async () => (await execute("SELECT last_game FROM nes_settings WHERE app_id=?", [appId]))[0]?.last_game,
    setLastGame: (hash) => execute("INSERT INTO nes_settings(app_id,last_game) VALUES(?,?) ON CONFLICT(app_id) DO UPDATE SET last_game=excluded.last_game", [appId, hash || ""]),
    list: (hash) =>
      execute(
        "SELECT slot,state_path,screenshot_path,saved_at FROM nes_save_slots WHERE app_id=? AND rom_hash=? ORDER BY slot LIMIT 3",
        [appId, hash],
      ),
    get: async (hash, slot) =>
      (
        await execute(
          "SELECT state_path,screenshot_path,saved_at FROM nes_save_slots WHERE app_id=? AND rom_hash=? AND slot=?",
          [appId, hash, slot],
        )
      )[0],
    save: (hash, slot, statePath, screenshotPath, savedAt) =>
      execute(
        "INSERT INTO nes_save_slots (app_id,rom_hash,slot,state_path,screenshot_path,saved_at) VALUES (?,?,?,?,?,?) ON CONFLICT(app_id,rom_hash,slot) DO UPDATE SET state_path=excluded.state_path,screenshot_path=excluded.screenshot_path,saved_at=excluded.saved_at",
        [appId, hash, slot, statePath, screenshotPath, savedAt],
      ),
  };
}

export async function encodeState(state) {
  const stream = new Blob([JSON.stringify(state)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export async function decodeState(encoded) {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return JSON.parse(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
    ).text(),
  );
}
