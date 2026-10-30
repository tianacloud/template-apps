import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MediaPreparation, createOriginalPack, MEDIA_PREFIX, packEntries, sha256} from '../src/media-preparation.js';

async function fixture({lostResponse = false, uncertainPrepare = false, afterPut} = {}) {
  // Independent Python zipfile fixtures hold opaque synthetic bytes, not art.
  const text = await readFile(new URL('./fixtures/preparation-index.json', import.meta.url), 'utf8');
  const index = JSON.parse(text), originals = new Map(), objects = new Map(), requests = [], puts = [], receipts = new Map();
  for (const pack of index.packs) originals.set(pack.path, new Uint8Array(await readFile(new URL('./fixtures/preparation-' + pack.kind + '.zip', import.meta.url))));
  const values = new Map(), storage = {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
  let uploaded = 0, lost = false;
  const files = {
    async get(path) { requests.push(['get', path]); return objects.has(path) ? new Response(objects.get(path)) : new Response('', {status: 404}); },
    async list(path) { requests.push(['list', path]); return {items: [...objects.keys()].map(path => ({path})), cursor: null}; },
    async put(path, blob, options) {
      assert.equal(options.overwrite, undefined); assert.ok(options.requestId); puts.push(path);
      if (uncertainPrepare) throw Object.assign(new Error('lost prepare response'), {status: 0});
      const id = 'fixture-upload-' + (++uploaded); options.onPrepared({id});
      objects.set(path, new Uint8Array(await blob.arrayBuffer())); receipts.set(id, {id, completed: true});
      afterPut?.(path);
      if (lostResponse && !lost) { lost = true; throw Object.assign(new Error('lost completion response'), {uploadId: id, status: 0}); }
      return {id, completed: true};
    },
    async uploadStatus(id) { requests.push(['status', id]); return receipts.get(id); },
    async completeUpload(id) { requests.push(['complete', id]); return receipts.get(id); },
  };
  let sourceRequests = 0;
  const config = {appId: 'synthetic-app-A', index, manifestText: text, notices: {original: 'Synthetic legal notice\n', media: 'Synthetic media notice\n'}, storage,
    async fetchAsset(entry, kind) { sourceRequests++; const id = kind === 'still' ? 0 : 1, pack = originals.get(index.packs[id].path); return pack.slice(entry.offset, entry.offset + entry.size); }};
  return {files, config, originals, objects, requests, puts, index, storage, values, sourceRequests: () => sourceRequests};
}

test('browser ZIP STORE reproduction matches independently generated original packs byte for byte', async () => {
  const f = await fixture();
  for (let i = 0; i < 2; i++) {
    const bytes = await createOriginalPack(f.index, i, f.config.fetchAsset);
    assert.deepEqual(bytes, f.originals.get(f.index.packs[i].path)); assert.equal(await sha256(bytes), f.index.packs[i].sha256);
    assert.deepEqual(packEntries(f.index, i).map(e => e.id), ['0001', '10003']);
  }
});

test('fresh initialization stores notices and all original packs before advertising the complete catalogue', async () => {
  const f = await fixture(); let ready = 0;
  const p = new MediaPreparation(f.files, {...f.config, onReady: () => ready++});
  await p.run({accepted: true});
  assert.equal(p.snapshot().status, 'done'); assert.equal(p.snapshot().assets, 4); assert.equal(ready, 1);
  assert.equal(f.puts.at(-1), MEDIA_PREFIX + 'manifest.json'); assert.equal(f.puts.length, 5);
  assert.equal(await (await f.files.get(MEDIA_PREFIX + 'manifest.json')).text(), f.config.manifestText);
  assert.ok(f.puts.every(path => path.startsWith(MEDIA_PREFIX))); assert.equal(f.sourceRequests(), 4);
});

test('a committed upload with a lost response is reconciled by its saved receipt without repeating put', async () => {
  const f = await fixture({lostResponse: true}), p = new MediaPreparation(f.files, f.config);
  await p.run({accepted: true});
  assert.equal(p.snapshot().status, 'done'); assert.equal(new Set(f.puts).size, 5); assert.equal(f.puts.length, 5);
  assert.ok(f.requests.some(([method]) => method === 'status'));
  assert.equal(JSON.parse(f.values.get(p.key)).pending, null);
});

test('an uncertain preparation without an upload ID stops and never replays a write', async () => {
  const f = await fixture({uncertainPrepare: true}), p = new MediaPreparation(f.files, f.config);
  await assert.rejects(p.run({accepted: true})); assert.equal(f.puts.length, 1); assert.equal(p.snapshot().pending, true);
  const resumed = new MediaPreparation(f.files, f.config);
  await assert.rejects(resumed.run({accepted: true}), /回执/); assert.equal(f.puts.length, 1);
  assert.equal(f.objects.has(MEDIA_PREFIX + 'manifest.json'), false);
});

test('pause keeps the complete catalogue hidden and a new page resumes without uploading completed packs again', async () => {
  let p;
  const f = await fixture({afterPut: path => { if (path.includes('/still-')) p.pause(); }});
  p = new MediaPreparation(f.files, f.config); await p.run({accepted: true});
  assert.equal(p.snapshot().status, 'paused'); assert.equal(f.objects.has(MEDIA_PREFIX + 'manifest.json'), false);
  const resumed = new MediaPreparation(f.files, f.config); await resumed.run({accepted: true});
  assert.equal(resumed.snapshot().status, 'done'); assert.equal(f.puts.length, 5); assert.equal(f.sourceRequests(), 4);
});

test('an existing different file is retained and never overwritten or advertised as complete', async () => {
  const f = await fixture(), target = f.index.packs[0]; f.objects.set(MEDIA_PREFIX + target.path, new Uint8Array(target.bytes));
  const p = new MediaPreparation(f.files, f.config); await assert.rejects(p.run({accepted: true}), /同名素材/);
  assert.ok(!f.puts.includes(MEDIA_PREFIX + target.path)); assert.equal(f.objects.has(MEDIA_PREFIX + 'manifest.json'), false);
});

test('local-folder import requires every file before writing and preserves exact original contents', async () => {
  const f = await fixture(), p = new MediaPreparation(f.files, f.config), targets = await p.targets();
  const local = targets.map(t => ({name: t.name, async arrayBuffer() { return t.content || f.originals.get(t.name); }}));
  await assert.rejects(p.run({accepted: true, directoryFiles: local.slice(1)}), /缺少/); assert.equal(f.puts.length, 0);
  await p.run({accepted: true, directoryFiles: local}); assert.equal(p.snapshot().status, 'done'); assert.equal(f.sourceRequests(), 0);
  for (const pack of f.index.packs) assert.deepEqual(f.objects.get(MEDIA_PREFIX + pack.path), f.originals.get(pack.path));
});

test('separate app contexts cannot reuse another app journal or access its media', async () => {
  const a = await fixture(), b = await fixture();
  const first = new MediaPreparation(a.files, a.config); await first.run({accepted: true});
  const second = new MediaPreparation(b.files, {...b.config, appId: 'synthetic-app-B', storage: a.storage});
  assert.equal(second.journal.pending, null); assert.deepEqual(second.journal.completed, {});
  assert.equal(b.objects.size, 0); await second.run({accepted: true}); assert.equal(b.puts.length, 5);
});

test('initialization cannot write until the usage condition is explicitly accepted', async () => {
  const f = await fixture(), p = new MediaPreparation(f.files, f.config);
  await assert.rejects(p.run(), /个人非商业/); assert.equal(f.puts.length, 0); assert.equal(f.requests.length, 0);
});

test('a failed source request stops the remaining download queue before reporting failure', async () => {
  const index = {packs: [{kind: 'still'}], items: Object.fromEntries(Array.from({length: 20}, (_, i) => [String(i + 1).padStart(4, '0'), [[0, 40 + i, 1], null]]))};
  let requests = 0;
  await assert.rejects(createOriginalPack(index, 0, async entry => {
    requests++; if (entry.id === '0001') throw new Error('source unavailable');
    await new Promise(resolve => setTimeout(resolve, 5)); return new Uint8Array(1);
  }), /source unavailable/);
  await new Promise(resolve => setTimeout(resolve, 15)); assert.ok(requests <= 6);
});

test('a finished preparation remains complete when its progress is reopened', async () => {
  const f = await fixture(), first = new MediaPreparation(f.files, f.config); await first.run({accepted: true});
  const reopened = new MediaPreparation(f.files, f.config);
  assert.equal(reopened.snapshot().status, 'done'); assert.equal(reopened.snapshot().assets, 4);
  assert.equal(f.puts.length, 5); assert.equal(reopened.snapshot().pending, false);
});
