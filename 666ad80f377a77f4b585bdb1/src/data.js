import { sql, verifiedWrite } from "./db.js";
let mountedFiles;
export function setFiles(value) { mountedFiles = value; }
export const files = () => {
  if (!mountedFiles && !window.tiana?.files)
    throw new Error("文件服务尚未就绪，请重新打开相册。");
  return mountedFiles || window.tiana.files;
};
export async function loadPhotos({ before, filter = "all", search = "" } = {}) {
  const terms = [],
    args = [];
  if (filter === "favorites") terms.push("favorite=1");
  if (filter.startsWith("group:")) {
    terms.push("category=?");
    args.push(filter.slice(6));
  }
  if (search) {
    terms.push("title LIKE ?");
    args.push("%" + search + "%");
  }
  if (before) {
    terms.push("(created_at < ? OR (created_at=? AND id<?))");
    args.push(before.created_at, before.created_at, before.id);
  }
  const { rows } = await sql(
    `SELECT * FROM photos ${terms.length ? "WHERE " + terms.join(" AND ") : ""} ORDER BY created_at DESC,id DESC LIMIT 100`,
    args,
  );
  return rows.map((p) => ({
    ...p,
    width: Number(p.width),
    height: Number(p.height),
    bytes: Number(p.bytes),
    favorite: Number(p.favorite) === 1,
  }));
}
export async function loadGroups() {
  return (await sql("SELECT name,title FROM photo_groups ORDER BY title,name"))
    .rows;
}
export async function createGroup(title) {
  const group = { name: crypto.randomUUID(), title };
  await verifiedWrite(
    () =>
      sql("INSERT INTO photo_groups(name,title) VALUES(?,?)", [
        group.name,
        group.title,
      ]),
    () => sql("SELECT name FROM photo_groups WHERE name=?", [group.name]),
    (r) => r.rows[0]?.name === group.name,
  );
  return group;
}
export async function assignGroup(ids, category) {
  const placeholders = ids.map(() => "?").join(",");
  await verifiedWrite(
    () =>
      sql(`UPDATE photos SET category=? WHERE id IN (${placeholders})`, [
        category,
        ...ids,
      ]),
    () =>
      sql(`SELECT id,category FROM photos WHERE id IN (${placeholders})`, ids),
    (r) =>
      r.rows.length === ids.length &&
      r.rows.every((p) => p.category === category),
  );
}
export async function favorite(photo, value) {
  await verifiedWrite(
    () =>
      sql("UPDATE photos SET favorite=? WHERE id=?", [value ? 1 : 0, photo.id]),
    () => sql("SELECT favorite FROM photos WHERE id=?", [photo.id]),
    (r) => Number(r.rows[0]?.favorite) === (value ? 1 : 0),
  );
}
export async function loadComments(id) {
  return (
    await sql(
      "SELECT * FROM comments WHERE photo_id=? ORDER BY created_at,id LIMIT 100",
      [id],
    )
  ).rows;
}
export async function comment(photoId, body, author) {
  const row = {
    id: crypto.randomUUID(),
    photo_id: photoId,
    body,
    author,
    created_at: new Date().toISOString(),
  };
  await verifiedWrite(
    () =>
      sql(
        "INSERT INTO comments(id,photo_id,body,author,created_at) VALUES(?,?,?,?,?)",
        Object.values(row),
      ),
    () => sql("SELECT id FROM comments WHERE id=?", [row.id]),
    (r) => r.rows[0]?.id === row.id,
  );
  return row;
}
export async function removeComment(id) {
  await verifiedWrite(
    () => sql("DELETE FROM comments WHERE id=?", [id]),
    () => sql("SELECT id FROM comments WHERE id=?", [id]),
    (r) => r.rows.length === 0,
  );
}
export async function removePhoto(p) {
  for (const path of new Set([
    p.original_path,
    p.thumbnail_path,
    p.preview_path,
  ]))
    await files().delete(path);
  await sql("DELETE FROM comments WHERE photo_id=?", [p.id]);
  await verifiedWrite(
    () => sql("DELETE FROM photos WHERE id=?", [p.id]),
    () => sql("SELECT id FROM photos WHERE id=?", [p.id]),
    (r) => r.rows.length === 0,
  );
}
async function resize(image, max, quality) {
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("无法生成缩略图。"))),
      "image/jpeg",
      quality,
    ),
  );
}
export async function uploadPhoto(blob, options = {}, progress = () => {}) {
  let image;
  try {
    image = await createImageBitmap(blob);
  } catch {
    throw new Error("无法读取这张图片，请使用 JPEG、PNG 或 WebP 图片。");
  }
  const id = options.id || crypto.randomUUID(),
    prefix = "photos/" + id;
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "jpg";
  const photo = {
    id,
    title: options.title || blob.name?.replace(/\.[^.]+$/, "") || "新的瞬间",
    original_path: prefix + "/original." + ext,
    thumbnail_path: prefix + "/thumb.jpg",
    preview_path: prefix + "/preview.jpg",
    width: image.width,
    height: image.height,
    bytes: blob.size,
    category: options.category || "日常",
    favorite: false,
    created_at: options.created_at || new Date().toISOString(),
    attribution: options.author || null,
    source_url: options.source || null,
  };
  let thumb, preview;
  try {
    thumb = await resize(image, 640, 0.8);
    preview = await resize(image, 2400, 0.88);
  } finally {
    image.close();
  }
  const items = [[photo.original_path, blob]];
  for (const [key, resized] of [
    ["thumbnail_path", thumb],
    ["preview_path", preview],
  ]) {
    if (blob.type !== "image/gif" && resized.size >= blob.size) {
      photo[key] = photo.original_path;
    } else {
      items.push([photo[key], resized]);
    }
  }
  for (let i = 0; i < items.length; i++) {
    await files().put(...items[i], {
      onProgress: (n, total) =>
        progress((i + n / Math.max(total, 1)) / items.length),
    });
    progress((i + 1) / items.length);
  }
  const values = [
    photo.id,
    photo.title,
    photo.original_path,
    photo.thumbnail_path,
    photo.preview_path,
    photo.width,
    photo.height,
    photo.bytes,
    photo.category,
    0,
    photo.created_at,
    photo.attribution,
    photo.source_url,
  ];
  await verifiedWrite(
    () =>
      sql(
        "INSERT INTO photos(id,title,original_path,thumbnail_path,preview_path,width,height,bytes,category,favorite,created_at,attribution,source_url) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        values,
      ),
    () => sql("SELECT id FROM photos WHERE id=?", [id]),
    (r) => r.rows[0]?.id === id,
  );
  return photo;
}
export async function initializeStarter(onProgress) {
  const claimed = await sql(
    "INSERT INTO album_settings(key,value) VALUES('starter-v1','started') ON CONFLICT(key) DO NOTHING RETURNING key",
  );
  if (!claimed.rows.length) return;
  const response = await files().get("template-assets/starter/manifest.json");
  if (!response.ok)
    throw new Error("示例照片暂时无法读取，你可以直接上传自己的照片。");
  const photos = await response.json();
  let failures = 0;
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    onProgress({ current: i, total: photos.length, title: p.title });
    try {
      const r = await files().get("template-assets/starter/" + p.file);
      if (!r.ok) throw new Error("示例图片未读取");
      await uploadPhoto(
        await r.blob(),
        {
          ...p,
          id: "starter-" + p.id,
          created_at: new Date(Date.UTC(2026, 8, 21 - i, 9)).toISOString(),
        },
        (fraction) =>
          onProgress({
            current: i + fraction,
            total: photos.length,
            title: p.title,
          }),
      );
    } catch {
      failures++;
    }
  }
  await sql("UPDATE album_settings SET value='done' WHERE key='starter-v1'");
  if (failures)
    throw new Error(
      `${failures} 张示例照片未能导入。已导入的照片已保存，你也可以上传自己的照片。`,
    );
}
