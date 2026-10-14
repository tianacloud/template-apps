// Browser-only data adapter; application components and styles remain the production build.
const ready = (async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(showcase.schema);
  if (showcase.seed) db.run(showcase.seed);
  const submit = (form, button) => {
    if (form.noValidate || form.checkValidity())
      form.dispatchEvent(
        new SubmitEvent("submit", {
          bubbles: true,
          cancelable: true,
          submitter: button,
        }),
      );
    else form.reportValidity();
  };
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest?.("button,input");
      if (button?.form && button.type === "submit") {
        event.preventDefault();
        submit(button.form, button);
      }
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        event.target.tagName === "INPUT" &&
        event.target.form
      ) {
        event.preventDefault();
        submit(
          event.target.form,
          event.target.form.querySelector("[type=submit]"),
        );
      }
    },
    true,
  );
  const today = new Date().toISOString().slice(0, 10),
    stamp = new Date().toISOString();
  const examples = {
    calendar: [
      [
        "INSERT INTO calendar_events VALUES(?,?,?,?,?,?,?,?,?)",
        [
          "preview",
          "walk",
          "午后散步",
          today,
          "15:00",
          "16:00",
          "生活",
          "河边",
          "带上相机，看看秋天的颜色。",
        ],
      ],
    ],
    notes: [
      [
        "INSERT INTO notebook_notes VALUES(?,?,?,?,?,?,?)",
        [
          "preview",
          "weekend",
          "周末的小计划",
          "去逛一家书店，再找个地方喝杯咖啡。",
          "生活",
          1,
          Date.now(),
        ],
      ],
      [
        "INSERT INTO notebook_notes VALUES(?,?,?,?,?,?,?)",
        [
          "preview",
          "ideas",
          "想做的小工具",
          "记下灵光一闪的想法。试着编辑这篇笔记，或者新建一篇。",
          "工作",
          0,
          Date.now() - 1000,
        ],
      ],
    ],
    ledger: [
      [
        "INSERT INTO ledger_entries VALUES(?,?,?,?,?,?,?,?)",
        ["preview", "coffee", "午后咖啡", 2800, "expense", "餐饮", today, ""],
      ],
      [
        "INSERT INTO ledger_entries VALUES(?,?,?,?,?,?,?,?)",
        ["preview", "income", "本月收入", 1200000, "income", "工资", today, ""],
      ],
      [
        "INSERT INTO ledger_entries VALUES(?,?,?,?,?,?,?,?)",
        ["preview", "book", "一本新书", 6800, "expense", "购物", today, ""],
      ],
    ],
    study: [
      ["INSERT INTO study_profile VALUES(?,?)", ["main", "学习者"]],
      [
        "INSERT INTO study_tasks VALUES(?,?,?,?,?,?)",
        ["read", "main", "读完一章，整理三个收获", "阅读", 25, null],
      ],
      [
        "INSERT INTO study_tasks VALUES(?,?,?,?,?,?)",
        ["words", "main", "复习 20 个单词", "语言", 15, null],
      ],
    ],
    bumang: [
      [
        "INSERT INTO bumang_tasks(app_id,id,title,note,important,urgent,day,start_minute,duration_minutes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [
          "preview",
          "plan",
          "整理本周计划",
          "可以拖动到不同象限，或安排到时间轴。",
          1,
          0,
          null,
          null,
          60,
          stamp,
          stamp,
        ],
      ],
      [
        "INSERT INTO bumang_tasks(app_id,id,title,note,important,urgent,day,start_minute,duration_minutes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        [
          "preview",
          "walk",
          "出去走一走",
          "给自己留一点放松的时间。",
          0,
          0,
          today,
          960,
          30,
          stamp,
          stamp,
        ],
      ],
    ],
  };
  for (const [sql, args] of examples[showcase.name] || []) db.run(sql, args);
  const memory = () => {
    const m = new Map();
    return {
      getItem: (k) => m.get(String(k)) ?? null,
      setItem: (k, v) => m.set(String(k), String(v)),
      removeItem: (k) => m.delete(String(k)),
      clear: () => m.clear(),
      key: (i) => [...m.keys()][i] ?? null,
      get length() {
        return m.size;
      },
    };
  };
  for (const key of ["localStorage", "sessionStorage"])
    Object.defineProperty(window, key, { value: memory(), configurable: true });
  const appendChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = (node) =>
    node.tagName === "LINK" && node.rel === "stylesheet"
      ? node
      : appendChild(node);
  const append = document.head.append.bind(document.head);
  document.head.append = (...nodes) =>
    append(
      ...nodes.filter(
        (node) => !(node.tagName === "LINK" && node.rel === "stylesheet"),
      ),
    );
  const NativeURL = window.URL;
  window.URL = class extends NativeURL {
    constructor(url, base) {
      let resolved;
      try {
        resolved = new NativeURL(url, base);
      } catch {
        resolved = new NativeURL(url, "https://preview.invalid/");
      }
      super(showcase.assets[resolved.pathname] || resolved.href);
    }
  };
  const files = new Map(),
    blobURLs = new WeakMap();
  const asData = (blob) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  const objectURL = NativeURL.createObjectURL.bind(NativeURL),
    objectBlobs = new Map();
  window.URL.createObjectURL = (blob) => {
    if (blobURLs.has(blob)) return blobURLs.get(blob);
    const url = objectURL(blob);
    objectBlobs.set(url, blob);
    return url;
  };
  const revoke = NativeURL.revokeObjectURL.bind(NativeURL);
  window.URL.revokeObjectURL = (url) => {
    objectBlobs.delete(url);
    revoke(url);
  };
  if (showcase.name === "sunlit-album") {
    const manifest = await (
      await fetch(showcase.assets["/starter/manifest.json"])
    ).json();
    for (const photo of manifest) {
      const uri = showcase.assets["/starter/" + photo.file];
      if (!uri) continue;
      const blob = await (await fetch(uri)).blob();
      files.set("example/" + photo.id, blob);
      blobURLs.set(blob, uri);
      db.run(
        "INSERT INTO photos(id,title,original_path,thumbnail_path,preview_path,width,height,bytes,category,favorite,created_at,attribution,source_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [
          photo.id,
          photo.title,
          ...Array(3).fill("example/" + photo.id),
          1200,
          800,
          blob.size,
          photo.category,
          0,
          stamp,
          photo.author,
          photo.source,
        ],
      );
    }
  }

  window.tiana = {
    appId: "preview",
    auth: {
      getAccessToken: async () => "preview",
      refreshAccessToken: async () => "preview",
    },
    connection: async () => ({
      origin: "https://ep-01j5c9m7q2v8x4k6n3r0t1w2yz.example.test",
      sql_api: "hrana-v3",
    }),
    files: {
      put: async (key, blob, options = {}) => {
        files.set(key, blob);
        blobURLs.set(blob, await asData(blob));
        options.onProgress?.(blob.size, blob.size);
        return { upload_id: options.uploadId, status: "completed" };
      },
      get: async (key) => {
        const blob = files.get(key);
        const response = new Response(blob || "", { status: blob ? 200 : 404 });
        if (blob) response.blob = async () => blob;
        return response;
      },
      bindImage: async (img, key) => {
        const blob = files.get(key);
        if (!blob) throw Error("示例图片不存在");
        img.src = blobURLs.get(blob) || (await asData(blob));
        return () => {
          img.removeAttribute("src");
        };
      },
      delete: async (key) => {
        files.delete(key);
      },
      uploadStatus: async () => ({ status: "completed" }),
      completeUpload: async () => ({ status: "completed" }),
    },
  };
  const cell = (v) =>
    v === null
      ? { type: "null" }
      : typeof v === "number"
        ? {
            type: Number.isInteger(v) ? "integer" : "float",
            value: Number.isInteger(v) ? String(v) : v,
          }
        : { type: "text", value: String(v) };
  const execute = (stmt) => {
    let s = db.prepare(stmt.sql);
    try {
      s.bind(
        (stmt.args || []).map((a) =>
          a.type === "null"
            ? null
            : a.type === "integer" || a.type === "float"
              ? Number(a.value)
              : a.value,
        ),
      );
      const rows = [];
      while (s.step()) rows.push(s.get().map(cell));
      return {
        cols: s.getColumnNames().map((name) => ({ name })),
        rows,
        affected_row_count: db.getRowsModified(),
        last_insert_rowid: "1",
      };
    } finally {
      s.free();
    }
  };
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof NativeURL
          ? input.href
          : input.url;
    if (objectBlobs.has(url)) return new Response(objectBlobs.get(url));
    if (url.startsWith("data:")) return nativeFetch(input, init);
    if (url.includes("_tiana/session"))
      return Response.json({
        user: {
          user_id: "preview-user",
          display_name: "体验用户",
          username: "preview",
        },
        tenant: { tenant_id: "preview" },
      });
    if (url.includes("/v3/pipeline")) {
      const body = JSON.parse(init.body ?? (await input.text()));
      const results = [];
      for (const request of body.requests) {
        try {
          if (request.type === "execute")
            results.push({
              type: "ok",
              response: { type: "execute", result: execute(request.stmt) },
            });
          else if (request.type === "batch") {
            const step_results = [],
              step_errors = [];
            for (const step of request.batch.steps) {
              try {
                step_results.push(execute(step.stmt));
                step_errors.push(null);
              } catch (e) {
                step_results.push(null);
                step_errors.push({ message: e.message, code: "SQLITE_ERROR" });
              }
            }
            results.push({
              type: "ok",
              response: {
                type: "batch",
                result: { step_results, step_errors },
              },
            });
          } else results.push({ type: "ok", response: { type: request.type } });
        } catch (e) {
          console.error("Preview SQL:", e.message);
          results.push({
            type: "error",
            error: { message: e.message, code: "SQLITE_ERROR" },
          });
        }
      }
      return Response.json({ results, baton: null, base_url: null });
    }
    return new Response("示例体验不连接外部服务", { status: 404 });
  };
  const badge = document.createElement("div");
  badge.style.cssText =
    "position:fixed;z-index:2147483647;bottom:8px;right:8px;padding:6px 10px;border-radius:9px;background:#fffef8ed;color:#70736b;font:11px/1.4 system-ui;box-shadow:0 1px 6px #0001";
  badge.textContent = "示例体验 · 数据仅保留在本页 ";
  const reset = document.createElement("button");
  reset.textContent = "恢复示例";
  reset.style.cssText =
    "border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer;font:inherit";
  reset.onclick = () => location.reload();
  badge.append(reset);
  document.body.append(badge);
})();
