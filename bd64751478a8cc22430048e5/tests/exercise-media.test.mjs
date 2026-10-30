import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ExerciseMedia} from '../src/exercise-media.js';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
function fixture({count = 1, label = 'A', delay = 0} = {}) {
  const packs = [], contents = new Map(), payloads = [];
  for (const kind of ['still', 'clip']) for (let i = 0; i < count; i++) {
    // Opaque binary transport fixture. Real ZIP layout and all original media
    // slices are independently verified by prepare-original-media.py.
    const payload = Buffer.from(`${label}:${kind}:${i}\0\r\n`);
    const bytes = Buffer.concat([Buffer.alloc(40), payload]);
    const path = `${kind}-${sha(bytes).slice(0,20)}.zip`;
    packs.push({path, bytes: bytes.length, sha256: sha(bytes), kind});
    contents.set(path, bytes); payloads.push(payload);
  }
  const items = Object.fromEntries(Array.from({length: 5632}, (_, i) => [String(i+1).padStart(4,'0'), [[i % count,40,payloads[i%count].length],[count+i%count,40,payloads[count+i%count].length]]]));
  const index = {version:1, exerciseCount:5632, packs, items};
  const calls = [], urls = new Map(), revoked = [];
  let active = 0, maxActive = 0, nextURL = 0;
  const files = {async get(path) {
    calls.push(path);
    if (path.endsWith('manifest.json')) return Response.json(index);
    active++; maxActive = Math.max(maxActive, active);
    try { if (delay) await new Promise(r=>setTimeout(r,delay)); return new Response(contents.get(path.split('/').at(-1))); }
    finally { active--; }
  }};
  const options = {createURL(blob) { const key = 'blob:test-'+label+'-'+(++nextURL); urls.set(key,blob); return key; }, revokeURL(url) { revoked.push(url); }};
  return {index, contents, payloads, calls, files, urls, revoked, options, maxActive:()=>maxActive};
}

test('original stills retain their bytes and MP4 bytes need no blob media URL', async () => {
  const f=fixture(), media=new ExerciseMedia(f.files,f.options);
  const still=await media.acquire('0001'), clip=await media.acquire('0001','clip');
  assert.deepEqual(Buffer.from(await f.urls.get(still.url).arrayBuffer()),f.payloads[0]);
  assert.deepEqual(Buffer.from(clip.bytes),f.payloads[1]);
  assert.equal(f.urls.get(still.url).type,'image/webp');
  assert.equal(clip.url,null); assert.equal(f.urls.size,1);
  still.release(); clip.release();
});

test('concurrent thumbnails share one download and keep active object URLs alive', async () => {
  const f=fixture({delay:5}),media=new ExerciseMedia(f.files,f.options);
  const [a,b,c]=await Promise.all([media.acquire('0001'),media.acquire('0001'),media.acquire('0002')]);
  assert.equal(a.url,b.url);assert.notEqual(a.url,c.url);
  assert.equal(f.calls.filter(x=>x.endsWith('.zip')).length,1);
  a.release();a.release();assert.equal(f.revoked.length,0);
  b.release();assert.deepEqual(f.revoked,[a.url]);c.release();
});

test('download corruption is rejected and a later explicit retry can recover', async () => {
  const f=fixture(),pack=f.index.packs[0],original=f.contents.get(pack.path);
  f.contents.set(pack.path,Buffer.alloc(original.length,9));
  const media=new ExerciseMedia(f.files,f.options);
  await assert.rejects(media.acquire('0001'),/校验/);
  assert.equal(f.urls.size,0);
  f.contents.set(pack.path,original);
  const lease=await media.acquire('0001');assert.ok(lease.url);lease.release();
  assert.equal(f.calls.filter(x=>x.endsWith('.zip')).length,2);
});

test('a bad catalogue path or out-of-range payload never triggers a pack request', async () => {
  const f=fixture();f.index.packs[0].path='../outside.zip';
  await assert.rejects(new ExerciseMedia(f.files,f.options).acquire('0001'),/无效/);
  assert.equal(f.calls.length,1);
  const g=fixture();g.index.items['0001'][0][1]=99999;
  await assert.rejects(new ExerciseMedia(g.files,g.options).acquire('0001'),/越界/);
  assert.equal(g.calls.length,1);
});

test('partial catalogues cannot be treated as the complete library', async () => {
  const f=fixture();delete f.index.items['0001'];
  await assert.rejects(new ExerciseMedia(f.files,f.options).acquire('0002'),/不完整/);
  assert.equal(f.calls.length,1);
});

test('pack eviction does not revoke an image still displayed by a component', async () => {
  const f=fixture({count:3}),media=new ExerciseMedia(f.files,{...f.options,cacheBytes:60});
  const a=await media.acquire('0001');
  const b=await media.acquire('0002');b.release();
  const c=await media.acquire('0003');c.release();
  assert.ok(!f.revoked.includes(a.url));
  assert.ok(media.packs.size<=1);
  const again=await media.acquire('0001');assert.equal(again.url,a.url);
  again.release();a.release();assert.ok(f.revoked.includes(a.url));
});

test('separate app contexts never share downloaded media or object URLs', async () => {
  const a=fixture({label:'tenant-A'}),b=fixture({label:'tenant-B'});
  const first=new ExerciseMedia(a.files,a.options),second=new ExerciseMedia(b.files,b.options);
  const x=await first.acquire('0001'),y=await second.acquire('0001');
  assert.notEqual(x.url,y.url);
  assert.notDeepEqual(await a.urls.get(x.url).text(),await b.urls.get(y.url).text());
  first.dispose();assert.deepEqual(b.revoked,[]);y.release();
});

test('pack downloads stay bounded even when many visible images start together', async () => {
  const f=fixture({count:7,delay:10}),media=new ExerciseMedia(f.files,f.options);
  const leases=await Promise.all(Array.from({length:7},(_,i)=>media.acquire(String(i+1).padStart(4,'0'))));
  assert.equal(f.maxActive(),3);assert.equal(media.running,0);
  leases.forEach(x=>x.release());media.dispose();
});

test('a context disposed during a download cannot create a stale object URL', async () => {
  const f=fixture({delay:15}),media=new ExerciseMedia(f.files,f.options);
  const pending=media.acquire('0001');
  await new Promise(r=>setTimeout(r,5));media.dispose();
  await assert.rejects(pending,/关闭/);assert.equal(f.urls.size,0);
});
