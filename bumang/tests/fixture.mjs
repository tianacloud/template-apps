// Test fixture: serves the built app and answers SQL with an in-memory SQLite.
// The hosted app uses the Tiana runtime; this file is for local browser tests only.
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { decodeRequestFrameBytes, encodeResponseFrameBytes } from "../node_modules/@tianacloud/serverless/dist/codec.js";

export const ORIGIN = "https://ep-00000000000000000000000000.fixture.test";

function cell(value) {
  if (value === null) return { type: "null" };
  if (typeof value === "number")
    return Number.isInteger(value) ? { type: "integer", value: String(value) } : { type: "float", value };
  return { type: "text", value: String(value) };
}

export function createDatabase(schemaPath) {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(schemaPath, "utf8"));
  let failNext = null;
  function execute(statement) {
    const args = (statement.args ?? []).map((arg) =>
      arg.type === "null" ? null : arg.type === "integer" ? Number(arg.value) : arg.value,
    );
    try {
      const query = db.prepare(statement.sql);
      const columns = query.columns();
      const rows = columns.length ? query.all(...args) : [];
      const changed = columns.length ? 0 : Number(query.run(...args).changes);
      return {
        type: "ok",
        response: {
          type: "execute",
          result: {
            cols: columns.map((column) => ({ name: column.name, decltype: null })),
            rows: rows.map((row) => columns.map((column) => cell(row[column.name]))),
            affected_row_count: changed,
            last_insert_rowid: null,
          },
        },
      };
    } catch (error) {
      return { type: "error", error: { message: error.message } };
    }
  }
  return {
    db,
    // "lost": commit the next write but drop its response.
    failNextWrite(mode) {
      failNext = mode;
    },
    async handle(frame) {
      const request = decodeRequestFrameBytes(new Uint8Array(frame));
      const pipeline = JSON.parse(new TextDecoder().decode(request.body));
      const write = pipeline.requests.some((op) => op.stmt && !/^\s*SELECT/i.test(op.stmt.sql));
      const results = pipeline.requests.map((op) =>
        op.type === "close" ? { type: "ok", response: { type: "close" } } : execute(op.stmt),
      );
      if (write && failNext === "lost") {
        failNext = null;
        throw new Error("fixture response lost");
      }
      const body = Buffer.from(JSON.stringify({ results }));
      return encodeResponseFrameBytes(
        {
          metadata_version: 1,
          request_id: request.metadata.request_id,
          status: 200,
          status_text: "OK",
          headers: [
            { name: "content-type", value: "application/json" },
            { name: "content-length", value: String(body.length) },
          ],
          body_length: body.length,
        },
        body,
      );
    },
  };
}

export async function serve(directory) {
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title></title><script>window.tiana={appId:'fixture-app',auth:{getAccessToken:async()=>'fixture-token'},connection:async()=>({origin:'${ORIGIN}',sql_api:'hrana-v3'})}</script></head><body><div id="app"></div><script type="module" src="/assets/app.js"></script></body></html>`;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://fixture.invalid");
    if (url.pathname === "/") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(html);
      return;
    }
    if (!/^\/assets\/[\w.-]+\.(js|css)$/.test(url.pathname)) return res.writeHead(404).end();
    try {
      res.setHeader("content-type", url.pathname.endsWith(".css") ? "text/css" : "text/javascript");
      res.end(await readFile(path.join(directory, "dist", url.pathname)));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((r) => (server.close(r), server.closeAllConnections())) };
}

// Route the page's SQL traffic to the in-memory database.
export async function connect(page, database) {
  await page.route(`${ORIGIN}/**`, async (route) => {
    try {
      const body = await database.handle(route.request().postDataBuffer());
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/vnd.tiana.fetch.v1",
          "cache-control": "no-store",
          "access-control-allow-origin": "*",
        },
        body: Buffer.from(body),
      });
    } catch {
      await route.abort("failed");
    }
  });
}
