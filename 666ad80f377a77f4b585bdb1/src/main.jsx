import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createRoot } from "react-dom/client";
import {
  Images,
  Heart,
  Sun,
  Search,
  Plus,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Download,
  Trash2,
  Check,
  Cloud,
  Mountain,
  PawPrint,
  PanelLeft,
  Grid2X2,
  Grid3X3,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Expand,
  Shrink,
  Folder,
  FolderPlus,
  CheckCircle2,
  Circle,
  Camera,
  Flower2,
  Leaf,
  Waves,
  Plane,
  Coffee,
  Music,
  Bike,
  MapPin,
  TreePine,
  Rainbow,
  Gift,
  Compass,
} from "lucide-react";
import {
  files,
  setFiles,
  loadGroups,
  createGroup,
  assignGroup,
  loadPhotos,
  favorite,
  loadComments,
  comment,
  removeComment,
  removePhoto,
  uploadPhoto,
  initializeStarter,
} from "./data.js";
import { deletePhotoBatch } from "./delete-batch.js";
import "./style.css";
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = new URL("./app.css", import.meta.url).href;
document.head.append(css);
document.title = "时光 · 相册";
const filters = [
  ["all", "所有照片", Images],
  ["favorites", "个人收藏", Heart],
];
const groupIcons = [
  Sun,
  Mountain,
  PawPrint,
  Camera,
  Flower2,
  Leaf,
  Waves,
  Plane,
  Coffee,
  Music,
  Bike,
  MapPin,
  TreePine,
  Rainbow,
  Gift,
  Compass,
];
function groupIcon(name) {
  let hash = 2166136261;
  for (const character of name)
    hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return groupIcons[(hash >>> 0) % groupIcons.length];
}
const dateLabel = (v) =>
  new Date(v).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const sizeLabel = (n) =>
  n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB";
function IconButton({
  label,
  children,
  onClick,
  active,
  disabled,
  className = "",
}) {
  return (
    <button
      type="button"
      className={"icon-button " + (active ? "active " : "") + className}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function PhotoImage({
  path,
  alt = "",
  className = "",
  eager = false,
  onLoad,
  ...rest
}) {
  const ref = useRef();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let unbind,
      alive = true;
    const controller = new AbortController();
    setLoaded(false);
    setFailed(false);
    files()
      .bindImage(ref.current, path, { signal: controller.signal })
      .then((fn) => {
        if (alive) unbind = fn;
        else fn();
      })
      .catch((e) => {
        if (alive && e.name !== "AbortError") setFailed(true);
      });
    return () => {
      alive = false;
      controller.abort();
      unbind?.();
    };
  }, [path]);
  return (
    <>
      <img
        ref={ref}
        alt={alt}
        className={className + " " + (loaded ? "loaded" : "loading")}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={(e) => {
          setLoaded(true);
          setFailed(false);
          onLoad?.(e);
        }}
        onError={() => setFailed(true)}
        draggable={false}
        {...rest}
      />
      {failed && <span className="image-error">图片暂时无法加载</span>}
    </>
  );
}
function Comments({ photo, onClose, notify }) {
  const [rows, setRows] = useState([]),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    setLoading(true);
    loadComments(photo.id)
      .then((r) => alive.current && setRows(r))
      .catch((e) => notify(e.message))
      .finally(() => alive.current && setLoading(false));
    return () => {
      alive.current = false;
    };
  }, [photo.id]);
  async function send(e) {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch(
        new URL(
          `/web/${encodeURIComponent(window.tiana.appId)}/_tiana/session`,
          location.origin,
        ),
        { credentials: "same-origin", headers: { "X-Tiana-Bootstrap": "1" } },
      );
      if (!response.ok) throw new Error("登录状态未确认，请刷新页面。");
      const session = await response.json();
      const author =
        session.user?.display_name ||
        session.user?.username ||
        session.user?.label ||
        "相册成员";
      const row = await comment(photo.id, draft.trim(), author);
      if (alive.current) {
        setRows((r) => [...r, row]);
        setDraft("");
      }
    } catch (e) {
      notify(e.message);
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function remove(row) {
    try {
      await removeComment(row.id);
      setRows((r) => r.filter((x) => x.id !== row.id));
    } catch (e) {
      notify(e.message);
    }
  }
  return (
    <aside className="comments" aria-label="照片评论">
      <div className="comments-head">
        <div>
          <h3>这一刻的心情</h3>
          <p>{rows.length ? `${rows.length} 条评论` : "给这张照片留句话吧"}</p>
        </div>
        <IconButton label="关闭评论" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      <div className="comment-list">
        {loading ? (
          <div className="quiet">
            <LoaderCircle className="spin" size={22} />
          </div>
        ) : rows.length ? (
          rows.map((row) => (
            <article className="comment" key={row.id}>
              <div className="avatar">{row.author.slice(0, 1)}</div>
              <div className="comment-content">
                <div className="comment-meta">
                  <strong>{row.author}</strong>
                  <button onClick={() => remove(row)} aria-label="删除评论">
                    <Trash2 size={13} />
                  </button>
                </div>
                <p>{row.body}</p>
                <time>{dateLabel(row.created_at)}</time>
              </div>
            </article>
          ))
        ) : (
          <div className="comment-empty">
            <MessageCircle size={34} strokeWidth={1.2} />
            <h4>照片之外，还有故事。</h4>
            <p>
              记录当时的心情，
              <br />
              或说说你喜欢它的理由。
            </p>
          </div>
        )}
      </div>
      <form onSubmit={send}>
        <textarea
          aria-label="评论内容"
          placeholder="写下这一刻…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
        <div>
          <span>让回忆多一点温度</span>
          <button aria-label="发送评论" disabled={busy || !draft.trim()}>
            {busy ? (
              <LoaderCircle className="spin" size={18} />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>
      </form>
    </aside>
  );
}
function usePreviewCache(photos, index, zoom) {
  const cache = useRef(new Map()),
    [url, setUrl] = useState(""),
    [error, setError] = useState(false);
  useEffect(
    () => () => {
      for (const item of cache.current.values()) {
        item.cancelled = true;
        if (item.url) URL.revokeObjectURL(item.url);
      }
      cache.current.clear();
    },
    [],
  );
  useEffect(() => {
    let alive = true;
    setUrl("");
    setError(false);
    const wanted = new Set(
      [0, -1, 1].map(
        (n) =>
          photos[(index + n + photos.length) % photos.length]?.preview_path,
      ),
    );
    const current = zoom
      ? photos[index].original_path
      : photos[index].preview_path;
    wanted.add(current);
    for (const [path, item] of cache.current) {
      if (!wanted.has(path)) {
        item.cancelled = true;
        if (item.url) URL.revokeObjectURL(item.url);
        cache.current.delete(path);
      }
    }
    const load = (path) => {
      if (cache.current.has(path)) return cache.current.get(path).promise;
      const item = { cancelled: false, url: null };
      item.promise = files()
        .get(path)
        .then((r) => r.blob())
        .then(async (blob) => {
          if (item.cancelled) return null;
          const src = URL.createObjectURL(blob);
          item.url = src;
          const image = new Image();
          image.src = src;
          await image.decode();
          return src;
        })
        .catch((e) => {
          if (item.url) URL.revokeObjectURL(item.url);
          if (cache.current.get(path) === item) cache.current.delete(path);
          throw e;
        });
      cache.current.set(path, item);
      return item.promise;
    };
    load(current)
      .then((src) => {
        if (alive) setUrl(src || "");
      })
      .catch(() => {
        if (alive) setError(true);
      });
    for (const path of wanted)
      if (path && path !== current) load(path).catch(() => {});
    return () => {
      alive = false;
    };
  }, [photos, index, zoom]);
  return { url, error };
}
function Viewer({
  photos,
  id,
  setId,
  onClose,
  onFavorite,
  onDelete,
  notify,
  toast,
  autoPlay = false,
  fullscreen,
  enterFullscreen,
  toggleFullscreen,
  onGroup,
}) {
  const index = Math.max(
      0,
      photos.findIndex((p) => p.id === id),
    ),
    photo = photos[index];
  const [comments, setComments] = useState(false),
    [playing, setPlaying] = useState(autoPlay),
    [zoom, setZoom] = useState(false),
    [direction, setDirection] = useState(1),
    [ready, setReady] = useState(false);
  const touch = useRef(null),
    film = useRef(),
    dialog = useRef();
  const preview = usePreviewCache(photos, index, zoom);
  useLayoutEffect(() => {
    // Keep the dialog above its fullscreen host in the browser top layer.
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, [fullscreen]);
  const step = useCallback(
    (delta) => {
      if (photos.length < 2) return;
      setDirection(delta);
      setZoom(false);
      setId(photos[(index + delta + photos.length) % photos.length].id);
    },
    [photos, index, setId],
  );
  useEffect(() => {
    setReady(false);
    setZoom(false);
    film.current?.querySelector('[aria-current="true"]')?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [id]);
  useEffect(() => {
    if (!playing || comments || zoom || !ready || photos.length < 2) return;
    const t = setTimeout(() => step(1), 5000);
    return () => clearTimeout(t);
  }, [playing, comments, zoom, ready, step, photos.length]);
  async function download() {
    try {
      const r = await files().get(photo.original_path);
      const blob = await r.blob(),
        url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.title + "." + photo.original_path.split(".").pop();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("已开始下载");
    } catch (e) {
      notify(e.message);
    }
  }
  return (
    <dialog
      ref={dialog}
      className={
        "viewer " +
        (comments ? "with-comments " : "") +
        (playing ? "is-playing" : "")
      }
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="viewer-main">
        <header className="viewer-header">
          <div className="viewer-heading">
            <IconButton label="关闭照片" onClick={onClose}>
              <X size={21} />
            </IconButton>
            <div>
              <strong>{photo.title}</strong>
              <small>
                {dateLabel(photo.created_at)}
                <span>
                  {" "}
                  · {index + 1} / {photos.length}
                </span>
              </small>
            </div>
          </div>
          <div className="viewer-actions">
            <IconButton
              label={photo.favorite ? "取消收藏" : "收藏照片"}
              active={photo.favorite}
              onClick={() => onFavorite(photo)}
            >
              <Heart
                size={21}
                fill={photo.favorite ? "currentColor" : "none"}
              />
            </IconButton>
            <IconButton
              label="查看评论"
              active={comments}
              onClick={() => {
                setComments((x) => !x);
                setPlaying(false);
              }}
            >
              <MessageCircle size={21} />
            </IconButton>
            <span className="divider" />
            <IconButton
              label={playing ? "暂停轮播" : "开始轮播"}
              active={playing}
              onClick={() => {
                if (!playing) {
                  setZoom(false);
                  enterFullscreen();
                }
                setPlaying((x) => !x);
                setComments(false);
              }}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </IconButton>
            <IconButton
              label={fullscreen ? "退出全屏" : "进入全屏"}
              onClick={toggleFullscreen}
            >
              {fullscreen ? <Shrink size={20} /> : <Expand size={20} />}
            </IconButton>
            <IconButton
              label="设置照片分组"
              onClick={() => {
                setPlaying(false);
                onGroup(photo);
              }}
            >
              <Folder size={20} />
            </IconButton>
            <IconButton label="下载原图" onClick={download}>
              <Download size={20} />
            </IconButton>
            <IconButton
              label="删除照片"
              onClick={() => {
                setPlaying(false);
                onDelete(photo);
              }}
            >
              <Trash2 size={19} />
            </IconButton>
          </div>
        </header>
        <div
          className={"stage " + (zoom ? "zoomed" : "")}
          role={playing ? "button" : undefined}
          tabIndex={playing ? 0 : undefined}
          aria-label={playing ? "暂停轮播" : undefined}
          onClick={() => {
            if (playing) setPlaying(false);
          }}
          onKeyDown={(e) => {
            if (playing && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setPlaying(false);
            }
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "touch")
              touch.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            if (!touch.current || zoom) return;
            const dx = e.clientX - touch.current.x,
              dy = e.clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
              setPlaying(false);
              step(dx < 0 ? 1 : -1);
            }
          }}
        >
          <div className="ambient" key={photo.id + "ambient"}>
            <PhotoImage path={photo.thumbnail_path} eager />
          </div>
          <IconButton
            label="上一张"
            className="previous"
            onClick={() => {
              setPlaying(false);
              step(-1);
            }}
            disabled={photos.length < 2}
          >
            <ChevronLeft size={30} />
          </IconButton>
          <div
            key={photo.id}
            className={
              "photo-frame " + (direction < 0 ? "from-left" : "from-right")
            }
          >
            <PhotoImage
              path={photo.thumbnail_path}
              className="preview-underlay"
              eager
            />
            <img
              src={preview.url || undefined}
              alt={photo.title}
              className={"full-photo " + (preview.url ? "loaded" : "loading")}
              style={
                zoom ? { width: photo.width, height: photo.height } : undefined
              }
              draggable={false}
              onLoad={() => setReady(true)}
            />
            {preview.error && (
              <span className="image-error">
                图片暂时无法加载，请稍后重新打开。
              </span>
            )}
          </div>
          <IconButton
            label="下一张"
            className="next"
            onClick={() => {
              setPlaying(false);
              step(1);
            }}
            disabled={photos.length < 2}
          >
            <ChevronRight size={30} />
          </IconButton>
          <div className="photo-info">
            <span>
              {photo.width} × {photo.height} <i /> {sizeLabel(photo.bytes)}
            </span>
            <IconButton
              label={zoom ? "适应窗口" : "查看原图尺寸"}
              active={zoom}
              onClick={() => {
                setZoom((x) => !x);
                setPlaying(false);
              }}
            >
              {zoom ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </IconButton>
          </div>
        </div>
        <footer className="viewer-footer">
          <div className="filmstrip" ref={film}>
            {photos.map((p, i) => (
              <button
                key={p.id}
                aria-label={"切换到 " + p.title}
                aria-current={p.id === photo.id}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setPlaying(false);
                  setId(p.id);
                }}
              >
                <PhotoImage path={p.thumbnail_path} alt="" />
                {p.favorite && <Heart size={10} fill="currentColor" />}
              </button>
            ))}
          </div>
          <div className="viewer-caption">
            {playing ? (
              <>
                <span className="play-dot" />
                正在播放 · 每张 5 秒
              </>
            ) : (
              <>
                <Sun size={13} /> 留住眼前的小美好
              </>
            )}
          </div>
          {playing && ready && !comments && !zoom && (
            <div className="slide-progress" key={id} />
          )}
        </footer>
      </div>
      {comments && (
        <Comments
          key={photo.id}
          photo={photo}
          onClose={() => setComments(false)}
          notify={notify}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </dialog>
  );
}
function ConfirmDelete({ photos, onCancel, onConfirm, busy, progress }) {
  const ref = useRef();
  useEffect(() => {
    ref.current.showModal();
  }, []);
  const done = progress && !busy;
  return (
    <dialog
      className="confirm"
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div className="delete-symbol">
        <Trash2 size={25} />
      </div>
      <h3>
        {busy
          ? "正在删除照片…"
          : done
            ? "删除处理完成"
            : photos.length === 1
              ? "删除这张照片？"
              : `删除选中的 ${photos.length} 张照片？`}
      </h3>
      {!progress && (
        <p>
          {photos.length === 1 ? `「${photos[0].title}」` : "选中的照片"}
          及其评论会被永久删除。
        </p>
      )}
      {progress && (
        <div className="delete-progress" role="status" aria-live="polite">
          <progress
            aria-label="删除进度"
            value={progress.completed}
            max={progress.total}
          />
          <p>
            已处理 {progress.completed} / {progress.total} 张 ·{" "}
            {Math.round((progress.completed / progress.total) * 100)}%
          </p>
          <p>
            已删除 {progress.succeeded} 张
            {progress.failed > 0 && `，失败 ${progress.failed} 张`}
          </p>
          {progress.failed > 0 && (
            <p className="delete-error">
              {progress.error}。未删除的照片会保留，可重试。
            </p>
          )}
        </div>
      )}
      <div className="confirm-actions">
        <button className="secondary" disabled={busy} onClick={onCancel}>
          {done ? "完成" : "取消"}
        </button>
        {(!done || progress.failed > 0) && (
          <button className="danger" disabled={busy} onClick={onConfirm}>
            {busy
              ? "正在删除…"
              : done
                ? "重试失败项"
                : photos.length === 1
                  ? "删除照片"
                  : "确认删除"}
          </button>
        )}
      </div>
    </dialog>
  );
}
function GroupDialog({ groups, ids, initial, onClose, onSave, onCreated }) {
  const ref = useRef();
  const [creating, setCreating] = useState(!ids),
    [title, setTitle] = useState(""),
    [category, setCategory] = useState(initial || "日常"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    ref.current.showModal();
  }, []);
  async function submit(e) {
    e.preventDefault();
    if (busy || (creating && !title.trim())) return;
    setBusy(true);
    setError("");
    try {
      let group;
      if (creating) {
        group = await createGroup(title.trim());
        onCreated(group);
        setCategory(group.name);
        setCreating(false);
      }
      const target = group?.name || category;
      if (ids) await assignGroup(ids, target);
      onSave(group, target);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={ref}
      className="confirm group-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="group-symbol">
          <FolderPlus size={26} />
        </div>
        <h3>{ids ? `设置 ${ids.length} 张照片的分组` : "新建分组"}</h3>
        <p>
          {ids
            ? "每张照片归入一个分组，所有照片中始终可见。"
            : "给一段回忆，起一个喜欢的名字。"}
        </p>
        {ids && (
          <label className="group-field">
            照片分组
            <select
              aria-label="照片分组"
              disabled={busy}
              value={creating ? "__new" : category}
              onChange={(e) => {
                setCreating(e.target.value === "__new");
                if (e.target.value !== "__new") setCategory(e.target.value);
              }}
            >
              <option value="日常">不分组</option>
              {groups.map((g) => (
                <option key={g.name} value={g.name}>
                  {g.title}
                </option>
              ))}
              <option value="__new">＋ 新建分组…</option>
            </select>
          </label>
        )}
        {creating && (
          <label className="group-field">
            分组名称
            <input
              autoFocus
              aria-label="分组名称"
              placeholder="例如：周末散步"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </label>
        )}
        {error && (
          <p className="group-error" role="alert">
            {error}
          </p>
        )}
        <div className="confirm-actions">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            取消
          </button>
          <button
            type="submit"
            className="primary"
            disabled={busy || (creating && !title.trim())}
          >
            {busy ? "保存中…" : ids ? "保存分组" : "创建分组"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
function App() {
  const [photos, setPhotos] = useState([]),
    [filter, setFilter] = useState("all"),
    [groups, setGroups] = useState([]),
    [groupDialog, setGroupDialog] = useState(null),
    [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState(new Set()),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [current, setCurrent] = useState(null),
    [autoplay, setAutoplay] = useState(false),
    [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement)),
    [sidebar, setSidebar] = useState(false),
    [density, setDensity] = useState(3),
    [progress, setProgress] = useState(null),
    [toDelete, setToDelete] = useState(null),
    [deleting, setDeleting] = useState(false),
    [deleteProgress, setDeleteProgress] = useState(null),
    [more, setMore] = useState(false),
    [drag, setDrag] = useState(false),
    [width, setWidth] = useState(900);
  const input = useRef(),
    wall = useRef(),
    viewerHost = useRef(),
    ownsFullscreen = useRef(false),
    favoriteBusy = useRef(new Set()),
    initialized = useRef(false),
    request = useRef(0),
    uploading = useRef(false);
  const notify = useCallback((msg) => {
    setToast(msg);
  }, []);
  useEffect(() => {
    const changed = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement) ownsFullscreen.current = false;
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  const enterFullscreen = useCallback(async () => {
    if (document.fullscreenElement) return;
    if (!document.fullscreenEnabled) {
      notify("当前浏览器不支持系统全屏，已使用沉浸模式");
      return;
    }
    try {
      await viewerHost.current.requestFullscreen();
      ownsFullscreen.current = true;
    } catch {
      notify("未能进入全屏，请点击全屏按钮重试");
    }
  }, [notify]);
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) return enterFullscreen();
    try {
      await document.exitFullscreen();
    } catch {
      notify("未能退出全屏，请重试");
    }
  }, [enterFullscreen, notify]);
  useEffect(() => {
    if (!current && fullscreen && ownsFullscreen.current) {
      document.exitFullscreen().catch(() => notify("未能退出全屏，请重试"));
    }
  }, [current, fullscreen, notify]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 220);
    return () => clearTimeout(t);
  }, [search]);
  const refresh = useCallback(async () => {
    const seq = ++request.current;
    setLoading(true);
    setError("");
    try {
      const [rows, groupRows] = await Promise.all([
        loadPhotos({ filter, search: query }),
        loadGroups(),
      ]);
      if (seq === request.current) {
        setPhotos(rows);
        setGroups(groupRows);
        setMore(rows.length === 100);
      }
    } catch (e) {
      if (seq === request.current) setError(e.message);
    } finally {
      if (seq === request.current) setLoading(false);
    }
  }, [filter, query]);
  useEffect(() => {
    if (initialized.current) {
      refresh();
      return;
    }
    initialized.current = true;
    (async () => {
      try {
        await initializeStarter((p) =>
          setProgress({
            label: "正在准备你的第一本相册",
            detail: p.title,
            fraction: p.current / p.total,
          }),
        );
      } catch (e) {
        notify(e.message);
      } finally {
        setProgress(null);
        refresh();
      }
    })();
  }, [refresh]);
  useEffect(() => {
    if (!wall.current) return;
    const obs = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    obs.observe(wall.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const read = () => {
      const hash = decodeURIComponent(location.hash.slice(1));
      setCurrent(hash.startsWith("photo/") ? hash.slice(6) : null);
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);
  const open = useCallback(
    (id, play = false) => {
      if (play) enterFullscreen();
      setAutoplay(play);
      location.hash = "photo/" + encodeURIComponent(id);
      setCurrent(id);
    },
    [enterFullscreen],
  );
  const close = useCallback(() => {
    history.replaceState(null, "", location.pathname + location.search);
    setCurrent(null);
    setAutoplay(false);
  }, []);
  const changePhoto = useCallback((id) => {
    history.replaceState(null, "", "#photo/" + encodeURIComponent(id));
    setCurrent(id);
  }, []);
  useEffect(() => {
    setSelecting(false);
    setSelected(new Set());
  }, [filter, query]);
  function selectPhoto(id) {
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function groupSaved(group, category) {
    const ids = groupDialog.ids;
    if (ids) {
      setPhotos((rows) =>
        rows.map((p) => (ids.includes(p.id) ? { ...p, category } : p)),
      );
      setSelected(new Set());
      setSelecting(false);
      if (filter.startsWith("group:") && filter !== "group:" + category)
        close();
      refresh();
      notify("照片分组已保存");
    } else {
      setFilter("group:" + group.name);
      setSidebar(false);
      setSearch("");
      notify("分组已创建，可以添加照片了");
    }
    setGroupDialog(null);
  }
  async function toggle(p) {
    if (favoriteBusy.current.has(p.id)) return;
    favoriteBusy.current.add(p.id);
    const next = !p.favorite;
    setPhotos((rows) =>
      rows.map((r) => (r.id === p.id ? { ...r, favorite: next } : r)),
    );
    try {
      await favorite(p, next);
    } catch (e) {
      setPhotos((rows) =>
        rows.map((r) => (r.id === p.id ? { ...r, favorite: !next } : r)),
      );
      notify(e.message);
    } finally {
      favoriteBusy.current.delete(p.id);
    }
  }
  async function upload(items) {
    if (uploading.current || progress) return;
    const selected = Array.from(items).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!selected.length) {
      notify("请选择图片文件");
      return;
    }
    uploading.current = true;
    let success = 0;
    for (let i = 0; i < selected.length; i++) {
      const f = selected[i];
      setProgress({
        label: `正在导入 ${i + 1} / ${selected.length}`,
        detail: f.name,
        fraction: 0,
      });
      try {
        const p = await uploadPhoto(
          f,
          { category: filter.startsWith("group:") ? filter.slice(6) : "日常" },
          (fraction) =>
            setProgress({
              label: `正在导入 ${i + 1} / ${selected.length}`,
              detail: f.name,
              fraction,
            }),
        );
        setPhotos((rows) => [p, ...rows]);
        success++;
      } catch (e) {
        notify(f.name + "：" + e.message);
      }
    }
    uploading.current = false;
    setProgress(null);
    notify(`已导入 ${success} 张照片`);
    setSearch("");
    refresh();
  }
  function requestDelete(rows) {
    setDeleteProgress(null);
    setToDelete(rows);
  }
  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    const pending = toDelete;
    setDeleteProgress({
      total: pending.length,
      completed: 0,
      succeeded: 0,
      failed: 0,
    });
    try {
      const failures = await deletePhotoBatch(
        pending,
        removePhoto,
        (photo, error, progress) => {
          if (!error) {
            setPhotos((rows) => rows.filter((p) => p.id !== photo.id));
            setSelected((ids) => {
              const next = new Set(ids);
              next.delete(photo.id);
              return next;
            });
            if (current === photo.id) close();
          }
          setDeleteProgress(progress);
        },
      );
      setToDelete(failures);
      if (pending.length === 1 && failures.length === 0) {
        setToDelete(null);
        notify("照片已删除");
      }
    } finally {
      setDeleting(false);
    }
  }
  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const rows = await loadPhotos({
        filter,
        search: query,
        before: photos.at(-1),
      });
      setPhotos((p) => [...p, ...rows]);
      setMore(rows.length === 100);
    } catch (e) {
      notify(e.message);
    } finally {
      setLoading(false);
    }
  }
  const shown =
    filter === "favorites" ? photos.filter((p) => p.favorite) : photos;
  const columns = width < 560 ? 2 : density;
  const rows = [];
  for (let i = 0; i < shown.length; i += columns)
    rows.push(shown.slice(i, i + columns));
  const activeGroup = groups.find((g) => "group:" + g.name === filter);
  const title =
    activeGroup?.title ||
    filters.find((f) => f[0] === filter)?.[1] ||
    "照片分组";
  return (
    <div
      className="app-shell"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDrag(true);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
    >
      <aside className={"sidebar " + (sidebar ? "is-open" : "")}>
        <div className="brand">
          <div className="brand-icon">
            <Sun size={25} />
          </div>
          <div>
            时光<span>TIME ALBUM</span>
          </div>
          <IconButton
            className="mobile-only"
            label="关闭侧栏"
            onClick={() => setSidebar(false)}
          >
            <X size={19} />
          </IconButton>
        </div>
        <div className="sidebar-label">资料库</div>
        <nav>
          {filters.slice(0, 2).map(([key, label, Icon]) => (
            <button
              key={key}
              className={filter === key ? "selected" : ""}
              onClick={() => {
                setFilter(key);
                setSidebar(false);
              }}
            >
              <Icon
                size={18}
                fill={
                  key === "favorites" && filter === key
                    ? "currentColor"
                    : "none"
                }
              />
              <span>{label}</span>
              {key === filter && (
                <span className="nav-count">{shown.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-label second groups-heading">
          <span>生活的切片</span>
          <IconButton label="新建分组" onClick={() => setGroupDialog({})}>
            <Plus size={16} />
          </IconButton>
        </div>
        <nav aria-label="照片分组">
          {groups.map((group) => {
            const key = "group:" + group.name;
            const Icon = groupIcon(group.name);
            return (
              <button
                key={key}
                className={filter === key ? "selected" : ""}
                onClick={() => {
                  setFilter(key);
                  setSidebar(false);
                }}
              >
                <Icon size={18} />
                <span>{group.title}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <div className="little-sun">
            <Sun size={25} strokeWidth={1.5} />
          </div>
          <strong>平凡的一天，也闪闪发光。</strong>
          <p>
            把喜欢的瞬间，
            <br />
            留给以后的自己。
          </p>
        </div>
        <footer className="sidebar-footer">
          <Cloud size={16} />
          <span>照片与心情，安心收藏</span>
        </footer>
      </aside>
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="收起菜单"
          onClick={() => setSidebar(false)}
        />
      )}
      <main>
        <header className="toolbar">
          <div className="toolbar-left">
            <IconButton
              label="切换侧栏"
              className="mobile-only"
              onClick={() => setSidebar((x) => !x)}
            >
              <PanelLeft size={20} />
            </IconButton>
            <span className="breadcrumb">
              我的相册 <ChevronRight size={13} /> <strong>{title}</strong>
            </span>
          </div>
          <div className="toolbar-right">
            <label className="search">
              <Search size={16} />
              <input
                aria-label="搜索照片"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索照片"
              />
              {search && (
                <button aria-label="清除搜索" onClick={() => setSearch("")}>
                  <X size={13} />
                </button>
              )}
            </label>
            <span className="divider" />
            <IconButton
              label="播放照片"
              disabled={!shown.length}
              onClick={() => open(shown[0].id, true)}
            >
              <Play size={19} />
            </IconButton>
            <button
              className="primary upload-button"
              disabled={!!progress}
              onClick={() => input.current.click()}
            >
              <Plus size={18} />
              <span>添加照片</span>
            </button>
          </div>
        </header>
        <section className="library">
          <div className="library-heading">
            <div>
              <div className="eyebrow">
                <span /> YOUR LITTLE COLLECTION
              </div>
              <h1>{query ? "搜索结果" : title}</h1>
              <p>
                {filter === "favorites"
                  ? "那些让你忍不住多看一眼的瞬间。"
                  : filter === "group:宠物"
                    ? "有它们的日子，总是暖洋洋的。"
                    : filter === "group:风景"
                      ? "把山川、海风和晴天，装进相册。"
                      : "把平常的日子，过成值得收藏的瞬间。"}
              </p>
            </div>
            <div className="view-controls">
              <button
                className="secondary selection-toggle"
                onClick={() => {
                  setSelecting(!selecting);
                  setSelected(new Set());
                }}
              >
                {selecting ? "完成" : "选择照片"}
              </button>
              <span>{shown.length} 张照片</span>
              <div className="view-segment">
                <IconButton
                  label="舒展视图"
                  active={density === 3}
                  onClick={() => setDensity(3)}
                >
                  <Grid2X2 size={16} />
                </IconButton>
                <IconButton
                  label="紧凑视图"
                  active={density === 4}
                  onClick={() => setDensity(4)}
                >
                  <Grid3X3 size={17} />
                </IconButton>
              </div>
            </div>
          </div>
          <div className="section-title">
            <span>
              {query
                ? "与「" + query + "」有关"
                : filter === "favorites"
                  ? "心动收藏"
                  : "时光碎片"}
            </span>
            <span>
              {filter === "favorites" ? <Heart size={14} /> : <Sun size={14} />}{" "}
              {query ? "按名称查找" : "由近到远"}
            </span>
          </div>
          {selecting && (
            <div className="selection-bar">
              <span>已选 {selected.size} 张</span>
              <button
                className="secondary"
                onClick={() =>
                  setSelected(
                    selected.size === shown.length
                      ? new Set()
                      : new Set(shown.map((p) => p.id)),
                  )
                }
              >
                {selected.size === shown.length ? "取消全选" : "选择本页"}
              </button>
              <button
                className="primary"
                disabled={!selected.size}
                onClick={() => setGroupDialog({ ids: [...selected] })}
              >
                <Folder size={16} />
                加入分组
              </button>
              <button
                className="danger"
                disabled={!selected.size || deleting}
                onClick={() =>
                  requestDelete(shown.filter((photo) => selected.has(photo.id)))
                }
              >
                <Trash2 size={16} />
                批量删除
              </button>
            </div>
          )}
          <div ref={wall} className="photo-wall">
            {error ? (
              <div className="empty">
                <Cloud size={35} />
                <h3>暂时没能打开相册</h3>
                <p>{error}</p>
                <button className="secondary" onClick={refresh}>
                  重新加载
                </button>
              </div>
            ) : loading && !photos.length ? (
              <div className="skeleton-grid">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} />
                ))}
              </div>
            ) : !shown.length ? (
              <div className="empty">
                <Images size={43} strokeWidth={1.2} />
                <h3>
                  {filter === "favorites"
                    ? "喜欢的瞬间，会在这里相遇。"
                    : query
                      ? "没有找到这张照片"
                      : "新的故事，从一张照片开始。"}
                </h3>
                <p>
                  {filter === "favorites"
                    ? "点一下照片上的爱心，把喜欢留住。"
                    : query
                      ? "换个关键词试试看。"
                      : "添加照片，让日常变成回忆。"}
                </p>
                {filter === "all" && !query && (
                  <button
                    className="primary"
                    onClick={() => input.current.click()}
                  >
                    <Plus size={17} />
                    添加照片
                  </button>
                )}
              </div>
            ) : (
              rows.map((row, i) => {
                const sum = row.reduce((s, p) => s + p.width / p.height, 0);
                const natural =
                  (width - (row.length - 1) * (width < 560 ? 9 : 12)) / sum;
                const height =
                  row.length === columns ? natural : Math.min(natural, 360);
                return (
                  <div
                    className="photo-row"
                    key={row[0].id}
                    style={{ height: height + 43 }}
                  >
                    {row.map((p) => (
                      <article
                        className={
                          "photo-card " +
                          (selected.has(p.id) ? "photo-selected" : "")
                        }
                        key={p.id}
                        style={{
                          width: (height * p.width) / p.height,
                          animationDelay: Math.min(i * 65, 260) + "ms",
                        }}
                      >
                        <button
                          className="photo-open"
                          aria-label={(selecting ? "选择 " : "查看 ") + p.title}
                          aria-pressed={
                            selecting ? selected.has(p.id) : undefined
                          }
                          onClick={() =>
                            selecting ? selectPhoto(p.id) : open(p.id)
                          }
                          style={{ height }}
                        >
                          <PhotoImage
                            path={p.thumbnail_path}
                            alt={p.title}
                            eager={i < 2}
                          />
                          <span className="photo-shade" />
                          <span className="photo-category">
                            {groups.find((g) => g.name === p.category)?.title ||
                              "日常"}
                          </span>
                          {selecting && (
                            <span className="selection-mark">
                              {selected.has(p.id) ? (
                                <CheckCircle2 size={25} fill="currentColor" />
                              ) : (
                                <Circle size={25} />
                              )}
                            </span>
                          )}
                        </button>
                        <button
                          className={
                            "favorite-button " +
                            (p.favorite ? "is-favorite" : "")
                          }
                          aria-label={
                            (p.favorite ? "取消收藏 " : "收藏 ") + p.title
                          }
                          aria-pressed={p.favorite}
                          onClick={() => toggle(p)}
                        >
                          <Heart
                            size={17}
                            fill={p.favorite ? "currentColor" : "none"}
                          />
                        </button>
                        <div className="photo-label">
                          <strong>{p.title}</strong>
                          <span>
                            {new Date(p.created_at).toLocaleDateString(
                              "zh-CN",
                              { month: "numeric", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                );
              })
            )}
          </div>
          {more && (
            <button
              className="load-more secondary"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "正在加载…" : "查看更多照片"}
            </button>
          )}
          {!loading && shown.length > 0 && (
            <footer className="library-footer">
              <span className="fine-line" />
              <span>
                <Sun size={14} />
                {more ? "更多回忆，在下一页" : "美好的瞬间，都在这里了"}
              </span>
              <span className="fine-line" />
            </footer>
          )}
        </section>
      </main>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <div ref={viewerHost} className="viewer-host">
        {current && photos.some((p) => p.id === current) && (
          <Viewer
            photos={shown.some((p) => p.id === current) ? shown : photos}
            id={current}
            setId={changePhoto}
            onClose={close}
            onFavorite={toggle}
            onDelete={(photo) => requestDelete([photo])}
            notify={notify}
            toast={toast}
            autoPlay={autoplay}
            fullscreen={fullscreen}
            enterFullscreen={enterFullscreen}
            toggleFullscreen={toggleFullscreen}
            onGroup={(p) =>
              setGroupDialog({ ids: [p.id], initial: p.category })
            }
          />
        )}
        {groupDialog && (
          <GroupDialog
            groups={groups}
            ids={groupDialog.ids}
            initial={groupDialog.initial}
            onClose={() => setGroupDialog(null)}
            onSave={groupSaved}
            onCreated={(group) => setGroups((rows) => [...rows, group])}
          />
        )}
        {toDelete && (
          <ConfirmDelete
            photos={toDelete}
            progress={deleteProgress}
            busy={deleting}
            onCancel={() => setToDelete(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
      {progress && (
        <div className="upload-progress" role="status">
          <div className="progress-icon">
            <ImagePlus size={23} />
          </div>
          <div>
            <strong>{progress.label}</strong>
            <p>{progress.detail}</p>
            <div className="progress-track">
              <i style={{ width: progress.fraction * 100 + "%" }} />
            </div>
          </div>
          <span>{Math.round(progress.fraction * 100)}%</span>
        </div>
      )}
      {toast && !current && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {drag && (
        <div
          className="drop-overlay"
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setDrag(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrag(false);
            upload(e.dataTransfer.files);
          }}
        >
          <div>
            <ImagePlus size={46} strokeWidth={1.2} />
            <h2>把美好，放进来。</h2>
            <p>松开鼠标，即可添加照片</p>
          </div>
        </div>
      )}
    </div>
  );
}
export function mount(element, context) {
  setFiles(context.files);
  const root = createRoot(element);
  root.render(<App />);
  return () => root.unmount();
}
