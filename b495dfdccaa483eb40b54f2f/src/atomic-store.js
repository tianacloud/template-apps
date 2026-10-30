// The row contains only encrypted vault and key-wrapping metadata. All changes
// to the pair are one conditional statement; a stale reader cannot overwrite it.
export function createAtomicStore(sql, randomId = () => crypto.randomUUID()) {
  let snapshot, tail = Promise.resolve(), blocked = false;
  const clone = x => x == null ? x : structuredClone(x);
  async function read() {
    const { rows } = await sql('SELECT revision, write_id, payload FROM custos_vault WHERE id = 1');
    if (!rows.length) return { revision: null, writeId: null, data: {} };
    const r = rows[0];
    return { revision: Number(r.revision), writeId: r.write_id, data: r.payload ? JSON.parse(r.payload) : {} };
  }
  async function load() { if (!snapshot) snapshot = await read(); return snapshot; }
  async function change(update) {
    if (blocked) throw new Error('保险箱状态未确认或已在其他设备更改，请重新加载后检查。');
    const old = await load();
    const data = clone(old.data); update(data);
    const payload = Object.keys(data).length ? JSON.stringify(data) : null;
    const id = randomId();
    try {
      const result = old.revision === null
        ? await sql('INSERT OR IGNORE INTO custos_vault (id, revision, write_id, payload) VALUES (1, 1, ?, ?)', [id, payload])
        : await sql('UPDATE custos_vault SET revision = revision + 1, write_id = ?, payload = ? WHERE id = 1 AND revision = ?', [id, payload, old.revision]);
      if (result.affectedRows !== 1) { blocked = true; throw new Error('保险箱已在其他设备更改，请重新加载后检查。'); }
    } catch (e) {
      // A lost response can follow a successful write. Never replay it: read the
      // write ID to identify this exact attempt; if unresolved, freeze writes.
      if (blocked) throw e;
      let actual;
      try { actual = await read(); } catch { blocked = true; throw new Error('保存结果无法确认，请重新加载后检查。'); }
      if (actual.writeId !== id || JSON.stringify(actual.data) !== JSON.stringify(data)) {
        blocked = true;
        throw new Error('保存未确认或发生冲突，请重新加载后检查。');
      }
    }
    snapshot = {revision: old.revision === null ? 1 : old.revision + 1, writeId: id, data};
  }
  function enqueue(update) {
    const p = tail.then(() => change(update));
    tail = p.catch(() => {});
    return p;
  }
  return {
    async get(store) { await tail; return clone((await load()).data[store] ?? null); },
    put(store, key, value) { return enqueue(d => { d[store] = clone(value); }); },
    putMany(values) { return enqueue(d => { for (const [store,value] of Object.entries(values)) d[store] = clone(value); }); },
    clearAll() { return enqueue(d => { delete d.meta; delete d.vault; }); },
    async reset() { await tail; if (blocked) throw new Error('请重新加载页面以检查保险箱。'); snapshot = undefined; },
  };
}
