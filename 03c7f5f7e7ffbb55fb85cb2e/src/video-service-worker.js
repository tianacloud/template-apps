// Temporary, in-memory media bridge for hosting policies that disallow blob: media.
const files = new Map();
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  const { action, id, file } = event.data || {};
  if (action === 'put' && id && file instanceof Blob) files.set(id, file);
  if (action === 'delete') files.delete(id);
  event.ports[0]?.postMessage({ ok: true });
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const prefix = new URL('__local_video__/', self.registration.scope).pathname;
  if (url.origin !== self.location.origin || !url.pathname.startsWith(prefix)) return;
  event.respondWith((async () => {
    const file = files.get(url.pathname.slice(prefix.length));
    if (!file) return new Response('Local video expired; please select it again.', {status: 404});
    const headers = {'Content-Type': file.type || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store'};
    const range = event.request.headers.get('Range');
    if (!range) return new Response(file, {headers: {...headers, 'Content-Length': String(file.size)}});
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) return new Response(null, {status: 416, headers: {'Content-Range': `bytes */${file.size}`}});
    const start = Number(match[1]), end = match[2] ? Math.min(Number(match[2]), file.size - 1) : file.size - 1;
    if (start > end || start >= file.size) return new Response(null, {status: 416, headers: {'Content-Range': `bytes */${file.size}`}});
    return new Response(file.slice(start, end + 1), {status: 206, headers: {...headers, 'Content-Range': `bytes ${start}-${end}/${file.size}`, 'Content-Length': String(end - start + 1)}});
  })());
});
