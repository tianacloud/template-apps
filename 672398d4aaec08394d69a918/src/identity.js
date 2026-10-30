// 身份：优先使用运行时提供的 Tiana 账号标识；运行时未提供时退回本机持久标识，
// 保证同一浏览器内的课堂、字集与拆解覆盖仍然归属稳定。
import { one, run, sql, nowIso } from './db.js';

const LOCAL_KEY = 'hanzi-pinpin:local-id';

function bootstrapData() {
  const node = document.getElementById('tiana-bootstrap-data');
  if (!node) return null;
  try { return JSON.parse(node.textContent || 'null'); } catch { return null; }
}

function pickUser(value) {
  if (!value || typeof value !== 'object') return null;
  // 运行时（window.tiana.user）直接给出 { id, tenantId }；其余环境可能是包装对象。
  const candidates = [value, value.user, value.currentUser, value.account, value.session?.user, value.auth?.user];
  for (const candidate of candidates) {
    const id = candidate?.id || candidate?.userId || candidate?.uid;
    if (typeof id === 'string' && id) {
      return { id, name: candidate.name || candidate.displayName || candidate.nickname || candidate.email || '' };
    }
  }
  const direct = value.userId || value.user_id || value.uid;
  return typeof direct === 'string' && direct ? { id: direct, name: '' } : null;
}

function localId() {
  let id = localStorage.getItem(LOCAL_KEY);
  if (!id) {
    id = `local_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    localStorage.setItem(LOCAL_KEY, id);
  }
  return id;
}

let cached = null;

export async function currentIdentity() {
  if (cached) return cached;
  let identity = null;
  const runtime = window.tiana || {};
  for (const reader of [() => runtime.auth?.getUser?.(), () => runtime.auth?.getSession?.(), () => runtime.user]) {
    try {
      const value = await reader();
      const user = pickUser(value);
      if (user) { identity = { ...user, source: 'tiana' }; break; }
    } catch { /* 运行时未提供该接口时继续尝试下一种 */ }
  }
  if (!identity) {
    const user = pickUser(bootstrapData());
    if (user) identity = { ...user, source: 'tiana' };
  }
  if (!identity) identity = { id: localId(), name: '', source: 'local' };
  cached = identity;
  return identity;
}

export async function ensureTeacher(identity) {
  const existing = await one('SELECT * FROM teachers WHERE id = ?', [identity.id]);
  if (existing) return { id: existing.id, name: existing.display_name || '', createdAt: existing.created_at };
  const name = identity.name || '中文老师';
  await sql('INSERT OR IGNORE INTO teachers (id, display_name, created_at) VALUES (?, ?, ?)',
    [identity.id, name, nowIso()]);
  return { id: identity.id, name, createdAt: nowIso() };
}

export async function renameTeacher(id, name) {
  await run('UPDATE teachers SET display_name = ? WHERE id = ?', [name.slice(0, 24), id]);
}
