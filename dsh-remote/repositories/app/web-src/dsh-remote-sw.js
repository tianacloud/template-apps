/** Keyless streaming Service Worker bridge for `@tianacloud/dsh-remote` (zero keys, zero CacheStorage, per-window isolation, cold-restart navToken self-healing, CSP sandbox hardening). */

const portsByClientId = new Map(); // clientId -> { port: MessagePort, pending: Set<(err: Error) => void>, navToken: string }
const navTokenMap = new Map(); // navToken -> windowClientId
const workerOwnerByClientId = new Map(); // workerClientId -> ownerWindowClientId
const pendingClientWakeups = new Map(); // clientId -> Promise<entry | null>
const pendingNavWakeups = new Map(); // navToken -> Promise<{ entry, ownerClientId } | null>
const clientWaiters = new Map(); // clientId -> Set<(entry) => void>
const navWaiters = new Map(); // navToken -> Set<(resolved) => void>

const REBIND_TIMEOUT_MS = 3000;
const NAV_REBIND_TIMEOUT_MS = 2500;
const HEAD_TIMEOUT_MS = 60_000;
const SW_NAV_PARAM = '__dsh_nav';
const LEGACY_SW_NAV_PARAM = '__dsh_sw_nav';
const SW_DL_PARAM = '__dsh_dl';
const SW_NAV_HEADER = 'x-dsh-remote-nav';
const NAV_TOKEN_RE = /^[A-Za-z0-9_-]{24,64}$/u;

const SVG_SANDBOX_CSP = "sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'";
const HTML_SANDBOX_CSP = "sandbox allow-scripts; default-src 'none'; img-src https: data: blob:; style-src https: 'unsafe-inline'; media-src https:; font-src https: data:";

function generateNavToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
}
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); });
function getAppBasePath() {
  try { const p = new URL(self.registration.scope).pathname; return p.endsWith('/') ? p : `${p}/`; } catch { return '/'; }
}
function isTrustedAppUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl) return false;
  try {
    const p = new URL(rawUrl);
    if (p.origin !== self.location.origin) return false;
    const base = getAppBasePath();
    const baseNoSlash = base.length > 1 && base.endsWith('/') ? base.slice(0, -1) : base;
    return p.pathname === baseNoSlash || p.pathname.startsWith(base);
  } catch { return false; }
}
function isTrustedWindowClient(client) {
  return Boolean(client && client.type === 'window' && typeof client.id === 'string' && client.id && isTrustedAppUrl(client.url));
}

function dropClientPort(clientId, reason = 'Service Worker bridge port closed') {
  const entry = portsByClientId.get(clientId);
  if (!entry) return;
  portsByClientId.delete(clientId);
  if (entry.navToken && navTokenMap.get(entry.navToken) === clientId) {
    navTokenMap.delete(entry.navToken);
  }
  for (const [workerId, ownerId] of workerOwnerByClientId.entries()) {
    if (ownerId === clientId) {
      workerOwnerByClientId.delete(workerId);
    }
  }
  const err = new Error(reason);
  for (const failPending of entry.pending) {
    try { failPending(err); } catch { /* ignore */ }
  }
  entry.pending.clear();
  try { entry.port.close(); } catch { /* ignore */ }
}

function resolveClientWaiters(clientId, entry) {
  const waiters = clientWaiters.get(clientId);
  if (!waiters) return;
  clientWaiters.delete(clientId);
  for (const fn of [...waiters]) {
    try { fn(entry); } catch { /* ignore */ }
  }
}

function resolveNavWaiters(navToken, resolved) {
  const waiters = navWaiters.get(navToken);
  if (!waiters) return;
  navWaiters.delete(navToken);
  for (const fn of [...waiters]) {
    try { fn(resolved); } catch { /* ignore */ }
  }
}

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  const source = event.source;
  if (!isTrustedWindowClient(source)) return;
  const clientId = source.id;

  if (data.type === 'dsh-remote:sw-bind' && event.ports && event.ports[0]) {
    if (data.clientId && data.clientId !== clientId) return;
    const requestedToken = typeof data.navToken === 'string' && NAV_TOKEN_RE.test(data.navToken)
      ? data.navToken
      : '';
    const navToken = requestedToken || generateNavToken();
    const existingOwner = navTokenMap.get(navToken);
    if (existingOwner && existingOwner !== clientId && portsByClientId.has(existingOwner)) {
      return;
    }

    const port = event.ports[0];
    const prev = portsByClientId.get(clientId);
    if (prev && prev.port !== port) {
      dropClientPort(clientId, 'Service Worker bridge port replaced');
    }
    const entry = { port, pending: new Set(), navToken };
    port.addEventListener?.('messageerror', () => {
      if (portsByClientId.get(clientId) === entry) {
        dropClientPort(clientId, 'Service Worker bridge port message error');
      }
    });
    portsByClientId.set(clientId, entry);
    navTokenMap.set(navToken, clientId);
    port.start?.();
    port.postMessage({ type: 'dsh-remote:sw-bound', clientId, navToken });
    resolveClientWaiters(clientId, entry);
    resolveNavWaiters(navToken, { entry, ownerClientId: clientId });
    return;
  }

  if (data.type === 'dsh-remote:sw-unbind') {
    if (data.clientId && data.clientId !== clientId) return;
    const prevNavToken = portsByClientId.get(clientId)?.navToken || '';
    dropClientPort(clientId, 'Service Worker bridge unbound');
    resolveClientWaiters(clientId, null);
    if (prevNavToken) resolveNavWaiters(prevNavToken, null);
  }
});

function shouldPassthrough(request, url, appBase) {
  if (url.origin !== self.location.origin) return true;
  const pathname = url.pathname;
  const appBaseNoSlash = appBase.length > 1 && appBase.endsWith('/') ? appBase.slice(0, -1) : appBase;

  if (pathname.startsWith(`${appBase}_tiana/`) ||
      pathname.startsWith('/_tiana/') ||
      pathname.startsWith(`${appBase}assets/`) ||
      pathname.startsWith('/brand/') ||
      pathname === '/favicon.ico') {
    return true;
  }
  if (request.mode === 'navigate' && (pathname === appBase || pathname === appBaseNoSlash)) {
    return true;
  }
  if (appBase !== '/' && !pathname.startsWith(appBase) && pathname !== appBaseNoSlash &&
      !pathname.startsWith('/api/') && pathname !== '/api' &&
      !pathname.startsWith('/plugins/') && pathname !== '/plugins') {
    return true;
  }
  return false;
}

function extractNavToken(request, url) {
  const fromQuery = url.searchParams.get(SW_NAV_PARAM) || url.searchParams.get(LEGACY_SW_NAV_PARAM) || '';
  if (fromQuery && NAV_TOKEN_RE.test(fromQuery)) return fromQuery;
  const fromHeader = request.headers.get(SW_NAV_HEADER) || '';
  if (fromHeader && NAV_TOKEN_RE.test(fromHeader)) return fromHeader;
  return '';
}

function resolveTunnelPath(url, appBase) {
  let pathname = url.pathname;
  if (appBase !== '/' && pathname.startsWith(appBase)) {
    pathname = `/${pathname.slice(appBase.length)}`;
  }
  const params = new URLSearchParams(url.search);
  params.delete(SW_NAV_PARAM);
  params.delete(LEGACY_SW_NAV_PARAM);
  params.delete(SW_DL_PARAM);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function hardenHeaders(rawHeaders, downloadParam = '') {
  const headers = new Headers(rawHeaders || {});
  headers.set('x-content-type-options', 'nosniff');
  headers.set('cache-control', 'no-store');
  if (downloadParam) {
    const safeName = downloadParam === '1' ? '' : downloadParam.replace(/[\r\n"\\\/]/gu, '_').slice(0, 180);
    const existing = String(headers.get('content-disposition') || '');
    if (safeName) {
      headers.set('content-disposition', `attachment; filename="${safeName}"`);
    } else if (!/^attachment\b/iu.test(existing)) {
      headers.set('content-disposition', 'attachment');
    }
  }

  const rawType = String(headers.get('content-type') || '');
  const mediaType = rawType.split(';', 1)[0].trim().toLowerCase();

  if (mediaType === 'image/svg+xml') {
    // Append enforces intersection with any stricter upstream CSP while always stripping allow-same-origin
    headers.append('content-security-policy', SVG_SANDBOX_CSP);
  } else if (mediaType === 'text/html' || mediaType === 'application/xhtml+xml') {
    headers.append('content-security-policy', HTML_SANDBOX_CSP);
  }
  return headers;
}

function resolvePortForClientId(targetClientId) {
  if (!targetClientId) return Promise.resolve(null);

  const existing = portsByClientId.get(targetClientId);
  if (existing) return Promise.resolve(existing);

  const inflight = pendingClientWakeups.get(targetClientId);
  if (inflight) return inflight;

  const promise = (async () => {
    let client = null;
    try {
      client = await self.clients.get(targetClientId);
    } catch {
      return null;
    }
    if (!isTrustedWindowClient(client)) {
      return null;
    }
    const alreadyBound = portsByClientId.get(targetClientId);
    if (alreadyBound) return alreadyBound;

    return await new Promise((resolve) => {
      let settled = false;
      let timer = null;
      const finish = (entry) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const set = clientWaiters.get(targetClientId);
        if (set) {
          set.delete(finish);
          if (set.size === 0) clientWaiters.delete(targetClientId);
        }
        resolve(entry || null);
      };
      let set = clientWaiters.get(targetClientId);
      if (!set) {
        set = new Set();
        clientWaiters.set(targetClientId, set);
      }
      set.add(finish);
      timer = setTimeout(() => finish(null), REBIND_TIMEOUT_MS);
      try {
        client.postMessage({ type: 'dsh-remote:sw-request-port', clientId: targetClientId });
      } catch {
        finish(null);
      }
    });
  })().finally(() => {
    if (pendingClientWakeups.get(targetClientId) === promise) {
      pendingClientWakeups.delete(targetClientId);
    }
  });

  pendingClientWakeups.set(targetClientId, promise);
  return promise;
}

function resolvePortByNavToken(navToken) {
  if (!navToken || !NAV_TOKEN_RE.test(navToken)) return Promise.resolve(null);

  const inflight = pendingNavWakeups.get(navToken);
  if (inflight) return inflight;

  const promise = (async () => {
    const ownerClientId = navTokenMap.get(navToken);
    if (ownerClientId) {
      const entry = portsByClientId.get(ownerClientId);
      if (entry && entry.navToken === navToken) {
        let ownerClient = null;
        try {
          ownerClient = await self.clients.get(ownerClientId);
        } catch {
          ownerClient = null;
        }
        if (isTrustedWindowClient(ownerClient)) {
          return { entry, ownerClientId };
        }
        dropClientPort(ownerClientId, 'Service Worker owning window closed');
      }
    }

    // Cold SW restart self-healing: ask controlled in-scope WindowClients to re-bind if they own navToken.
    let windowClients = [];
    try {
      windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: false });
    } catch {
      return null;
    }

    const boundOwnerId = navTokenMap.get(navToken);
    if (boundOwnerId) {
      const boundEntry = portsByClientId.get(boundOwnerId);
      if (boundEntry && boundEntry.navToken === navToken) {
        return { entry: boundEntry, ownerClientId: boundOwnerId };
      }
    }

    const trustedWindows = windowClients.filter((c) => isTrustedWindowClient(c));
    if (trustedWindows.length === 0) return null;

    const resolved = await new Promise((resolve) => {
      let settled = false;
      let timer = null;
      const finish = (val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const set = navWaiters.get(navToken);
        if (set) {
          set.delete(finish);
          if (set.size === 0) navWaiters.delete(navToken);
        }
        resolve(val || null);
      };
      let set = navWaiters.get(navToken);
      if (!set) {
        set = new Set();
        navWaiters.set(navToken, set);
      }
      set.add(finish);
      timer = setTimeout(() => finish(null), NAV_REBIND_TIMEOUT_MS);

      let sentCount = 0;
      for (const win of trustedWindows) {
        try {
          win.postMessage({ type: 'dsh-remote:sw-request-port', requestedNavToken: navToken });
          sentCount += 1;
        } catch {
          // ignore closed window
        }
      }
      if (sentCount === 0) {
        finish(null);
      }
    });

    if (!resolved?.entry || resolved.entry.navToken !== navToken) return null;
    return resolved;
  })().finally(() => {
    if (pendingNavWakeups.get(navToken) === promise) {
      pendingNavWakeups.delete(navToken);
    }
  });

  pendingNavWakeups.set(navToken, promise);
  return promise;
}

async function resolvePortForEvent(event, url) {
  const directClientId = event.clientId || '';
  if (directClientId) {
    const existingDirect = portsByClientId.get(directClientId);
    if (existingDirect) return existingDirect;

    const cachedWorkerOwner = workerOwnerByClientId.get(directClientId);
    if (cachedWorkerOwner) {
      const ownerPort = await resolvePortForClientId(cachedWorkerOwner);
      if (ownerPort) return ownerPort;
      workerOwnerByClientId.delete(directClientId);
    }

    const directPort = await resolvePortForClientId(directClientId);
    if (directPort) return directPort;
  }

  const navToken = extractNavToken(event.request, url);
  if (navToken) {
    const dest = event.request.destination || '';
    const referrer = event.request.referrer || '';
    if ((dest === 'iframe' || dest === 'frame') && !isTrustedAppUrl(referrer)) {
      return null;
    }
    if (referrer && (referrer.startsWith('http://') || referrer.startsWith('https://')) && !isTrustedAppUrl(referrer)) {
      return null;
    }
    const resolved = await resolvePortByNavToken(navToken);
    if (resolved?.entry) {
      if (directClientId && directClientId !== resolved.ownerClientId) {
        workerOwnerByClientId.set(directClientId, resolved.ownerClientId);
      }
      return resolved.entry;
    }
    return null;
  }

  if (directClientId) return null;
  const resultingClientId = event.resultingClientId || '';
  if (!resultingClientId) return null;
  return await resolvePortForClientId(resultingClientId);
}

function unavailablePortResponse() {
  return new Response(
    JSON.stringify({ ok: false, error: 'Service Worker tunnel bridge is unavailable for this window' }),
    {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-security-policy': "sandbox; default-src 'none'",
      },
    },
  );
}

async function handleTunneledFetch(request, tunnelPath, portEntry, downloadParam = '') {
  const method = (request.method || 'GET').toUpperCase();
  const headersObj = {};
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() === SW_NAV_HEADER) return;
    headersObj[key] = value;
  });

  let bodyBuf = null;
  if (method !== 'GET' && method !== 'HEAD') {
    bodyBuf = await request.arrayBuffer();
  }

  return await new Promise((resolveResponse, rejectResponse) => {
    const channel = new MessageChannel();
    const reqPort = channel.port1;
    let settled = false;
    let closed = false;
    let streamController = null;
    let pendingPulls = 0;
    let headTimer = null;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      clearTimeout(headTimer);
      headTimer = null;
      portEntry.pending.delete(failRequest);
      request.signal?.removeEventListener('abort', onAbort);
      try { reqPort.close(); } catch { /* ignore */ }
    };

    const failRequest = (err) => {
      cleanup();
      if (!settled) {
        settled = true;
        rejectResponse(err);
      } else if (streamController) {
        try { streamController.error(err); } catch { /* ignore */ }
      }
    };

    const sendAbort = () => {
      if (!closed) {
        try { reqPort.postMessage({ type: 'abort' }); } catch { /* ignore */ }
      }
      cleanup();
    };

    const onAbort = () => {
      sendAbort();
      failRequest(new DOMException('Aborted', 'AbortError'));
    };

    if (request.signal?.aborted) {
      onAbort();
      return;
    }
    request.signal?.addEventListener('abort', onAbort, { once: true });
    portEntry.pending.add(failRequest);

    headTimer = setTimeout(() => {
      sendAbort();
      failRequest(new Error('Tunneled subresource response header timed out'));
    }, HEAD_TIMEOUT_MS);

    const requestPull = () => {
      if (closed) return;
      while (pendingPulls < 4) {
        pendingPulls += 1;
        try { reqPort.postMessage({ type: 'pull' }); } catch { break; }
      }
    };

    reqPort.onmessageerror = () => {
      sendAbort();
      failRequest(new Error('Service Worker bridge port message error'));
    };

    reqPort.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'head') {
        if (settled) return;
        clearTimeout(headTimer);
        headTimer = null;
        const status = Number(msg.status) || 200;
        const headers = hardenHeaders(msg.headers, downloadParam);
        const emptyBody = status === 204 || status === 205 || status === 304 || method === 'HEAD';

        if (emptyBody) {
          settled = true;
          cleanup();
          resolveResponse(new Response(null, { status, statusText: msg.statusText || '', headers }));
          return;
        }

        const bodyStream = new ReadableStream({
          start(controller) {
            streamController = controller;
            requestPull();
          },
          pull() {
            requestPull();
          },
          cancel() {
            sendAbort();
          },
        });

        settled = true;
        resolveResponse(new Response(bodyStream, {
          status,
          statusText: msg.statusText || '',
          headers,
        }));
        return;
      }

      if (msg.type === 'chunk') {
        if (pendingPulls > 0) pendingPulls -= 1;
        const bytes = msg.data instanceof Uint8Array ? msg.data : new Uint8Array(msg.data);
        if (streamController && !closed) {
          try {
            streamController.enqueue(bytes);
            reqPort.postMessage({ type: 'consumed', bytes: bytes.byteLength });
          } catch {
            sendAbort();
            return;
          }
          if ((streamController.desiredSize ?? 0) > 0) {
            requestPull();
          }
        }
        return;
      }

      if (msg.type === 'end') {
        if (streamController && !closed) {
          try { streamController.close(); } catch { /* ignore */ }
        }
        cleanup();
        return;
      }

      if (msg.type === 'error') {
        failRequest(new Error(msg.message || 'Tunneled subresource fetch failed'));
      }
    };

    reqPort.start?.();
    const transfer = [channel.port2];
    if (bodyBuf && bodyBuf.byteLength > 0) transfer.push(bodyBuf);
    try {
      portEntry.port.postMessage({
        type: 'fetch',
        method,
        path: tunnelPath,
        headers: headersObj,
        body: bodyBuf,
        redirect: request.redirect || 'follow',
        mode: request.mode || 'cors',
      }, transfer);
    } catch (err) {
      failRequest(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const appBase = getAppBasePath();
  if (shouldPassthrough(event.request, url, appBase)) {
    return;
  }
  const downloadParam = url.searchParams.get(SW_DL_PARAM) || '';
  const tunnelPath = resolveTunnelPath(url, appBase);
  event.respondWith((async () => {
    const portEntry = await resolvePortForEvent(event, url);
    if (!portEntry) {
      return unavailablePortResponse();
    }
    return await handleTunneledFetch(event.request, tunnelPath, portEntry, downloadParam);
  })());
});
