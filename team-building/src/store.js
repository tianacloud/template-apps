import { sql } from "./db.js";
import { changeEvent, searchTerms } from "./domain.js";
const encode = (e) =>
  JSON.stringify({
    ...e,
    searchTerms: searchTerms(e.options.map((o) => o.name).join(" ")),
  });
export function createStore(execute = sql) {
  const read = async (id) => {
    const r = await execute(
      "SELECT doc, revision FROM dining_events WHERE id=?",
      [id],
    );
    if (!r.rows[0]) throw new Error("找不到这个活动。");
    return {
      event: JSON.parse(r.rows[0].doc),
      revision: Number(r.rows[0].revision),
    };
  };
  return {
    read,
    async list(before = null, active = false) {
      const filters = [];
      const args = [];
      if (active) filters.push("status='active'");
      if (before) {
        filters.push("(created_at, id) < (?, ?)");
        args.push(before.created_at, before.id);
      }
      const r = await execute(
        `SELECT id, json_extract(doc,'$.title') AS title, json_extract(doc,'$.time') AS time, status, created_at FROM dining_events ${filters.length ? "WHERE " + filters.join(" AND ") : ""} ORDER BY created_at DESC, id DESC LIMIT 20`,
        args,
      );
      return r.rows;
    },
    async create(event) {
      const doc = encode(event);
      try {
        await execute(
          "INSERT INTO dining_events(id,doc,revision) VALUES (?,?,1)",
          [event.id, doc],
        );
      } catch (error) {
        const actual = await read(event.id).catch(() => null);
        if (!actual || encode(actual.event) !== doc) throw error;
      }
      return read(event.id);
    },
    async change(id, actor, action) {
      const current = await read(id);
      const event = changeEvent(current.event, actor, action);
      const doc = encode(event);
      try {
        const r = await execute(
          "UPDATE dining_events SET doc=?,revision=revision+1 WHERE id=? AND revision=? AND status='active' RETURNING revision",
          [doc, id, current.revision],
        );
        if (!r.rows.length)
          throw new Error("活动刚刚有新变化，请查看最新内容后再提交。");
        return { event, revision: Number(r.rows[0].revision) };
      } catch (error) {
        const actual = await read(id).catch(() => null);
        if (actual && encode(actual.event) === doc) return actual;
        throw error;
      }
    },
    async search(query, offset = 0) {
      const chars = [...new Set(searchTerms(query).split(" ").filter(Boolean))];
      if (!chars.length) return { options: [], more: false };
      const r = await execute(
        "SELECT rowid FROM dining_search WHERE dining_search MATCH ? ORDER BY rowid DESC LIMIT 20 OFFSET ?",
        [chars.map((c) => `"${c}"`).join(" AND "), offset],
      );
      if (!r.rows.length) return { options: [], more: false };
      const ids = r.rows.map((r) => Number(r.rowid));
      const events = await execute(
        `SELECT doc FROM dining_events WHERE rowid IN (${ids.map(() => "?").join(",")})`,
        ids,
      );
      return {
        options: events.rows.flatMap((r) => {
          const e = JSON.parse(r.doc);
          return e.options
            .filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
            .map((o) => ({ ...o, eventTitle: e.title, eventId: e.id }));
        }),
        more: r.rows.length === 20,
      };
    },
    async profile(user) {
      const r = await execute(
        "SELECT id,name,avatar,color FROM dining_profiles WHERE id=?",
        [user.id],
      );
      return r.rows[0] || user;
    },
    async saveProfile(p) {
      await execute(
        "INSERT INTO dining_profiles(id,name,avatar,color) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,avatar=excluded.avatar,color=excluded.color",
        [p.id, p.name, p.avatar || "", p.color || "mint"],
      );
      return p;
    },
    async profiles(ids) {
      if (!ids.length) return [];
      const r = await execute(
        `SELECT id,name,avatar,color FROM dining_profiles WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids,
      );
      return r.rows;
    },
  };
}
export const store = createStore();
export async function currentUser() {
  const response = await fetch(`./_tiana/session`, {
    credentials: "same-origin",
  });
  if (!response.ok) throw new Error("无法读取 Tiana 登录账号，请重新登录。");
  const data = await response.json();
  if (!data.user?.user_id) throw new Error("当前会话未提供 Tiana 用户身份。");
  return {
    id: data.user.user_id,
    name: data.user.display_name || data.user.username,
    avatar: "",
    color: "mint",
  };
}
