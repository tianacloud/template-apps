// Resolve user-selected local resources in memory when the host disallows data/blob fetches.
const localBlobs = new Map();
const makeURL = URL.createObjectURL.bind(URL), revokeURL = URL.revokeObjectURL.bind(URL);
URL.createObjectURL = blob => { const url = makeURL(blob); localBlobs.set(url, blob); return url; };
URL.revokeObjectURL = url => { localBlobs.delete(url); revokeURL(url); };
const networkFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = (input, options) => {
  const url = typeof input === 'string' ? input : input.url;
  if (localBlobs.has(url)) return Promise.resolve(new Response(localBlobs.get(url)));
  if (url.startsWith('data:')) {
    const comma = url.indexOf(',');
    const header = url.slice(5, comma), body = url.slice(comma + 1);
    const bytes = /;base64/i.test(header) ? Uint8Array.from(atob(body), c => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(body));
    return Promise.resolve(new Response(bytes, {headers:{'Content-Type': header.split(';')[0] || 'text/plain'}}));
  }
  return networkFetch(input, options);
};
