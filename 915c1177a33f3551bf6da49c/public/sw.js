const CACHE='iron-planner-shell-v2';
const SHELL=['./offline.html','./offline-bootstrap.js','./app.js','./app.css','../icon.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;if(url.pathname.includes('/offline-media/')){event.respondWith(caches.open('iron-planner-media-v1').then(cache=>cache.match(event.request)).then(hit=>hit||new Response('',{status:404})));return;}if(SHELL.some(path=>new URL(path,self.location).pathname===url.pathname)){event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));}});
