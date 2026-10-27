const CACHE='qinghe-offline-v2';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['app.html','app.js'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.url.startsWith(self.registration.scope))event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});
