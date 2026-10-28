/* =========================================================================
 * Service Worker Â· çæ¬åç¼å­ + cache-firstï¼C-01ï¼
 * VERSION å¿é¡»ä¸ assets/js/version.js ç APP_VERSION åæ­¥æåï¼
 *   APP_VERSION = v1.2.8  â  VERSION = 'escalator-sim-v1.2.8'
 * èµæºæ¸åå« assets/images/ ä¸ç´ æå¾ï¼17 å¼ ç»æå¾ + 40 å¼ ææå®æ + 14 å¼ è¯¾ä»¶å¾ï¼
 * ========================================================================= */
const VERSION = 'escalator-sim-v1.2.8';
const IMG = [
  'assets/images/assembly.webp', 'assets/images/brake.webp', 'assets/images/control.webp',
  'assets/images/decoration.webp', 'assets/images/drive.webp', 'assets/images/escalator.webp',
  'assets/images/exploded.webp', 'assets/images/gearbox.webp', 'assets/images/handrail-belt.webp',
  'assets/images/handrail.webp', 'assets/images/rail-guide.webp', 'assets/images/rail-system.webp',
  'assets/images/step.webp', 'assets/images/step-chain.webp', 'assets/images/tension.webp',
  'assets/images/truss.webp', 'assets/images/turning.webp',
  'assets/images/real-brake-1.webp', 'assets/images/real-brake-2.webp', 'assets/images/real-chain-oiler.webp',
  'assets/images/real-comb-1.webp', 'assets/images/real-comb-2.webp', 'assets/images/real-control-cabinet-1.webp',
  'assets/images/real-drive-chain-1.webp', 'assets/images/real-drive-chain-2.webp', 'assets/images/real-drive-machine-1.webp',
  'assets/images/real-drive-machine-2.webp', 'assets/images/real-drive-sprocket-1.webp', 'assets/images/real-drive-sprocket-2.webp',
  'assets/images/real-guide-rail.webp',
  'assets/images/real-handrail-belt-1.webp', 'assets/images/real-handrail-belt-2.webp',
  'assets/images/real-handrail-curve.webp', 'assets/images/real-handrail-drive-1.webp', 'assets/images/real-handrail-drive-2.webp',
  'assets/images/real-handrail-entry.webp', 'assets/images/real-inspection-box.webp', 'assets/images/real-machine-space.webp',
  'assets/images/real-overview-1.webp', 'assets/images/real-overview-2.webp', 'assets/images/real-safety-switch-1.webp',
  'assets/images/real-safety-switch-2.webp', 'assets/images/real-skirt-1.webp', 'assets/images/real-skirt-2.webp',
  'assets/images/real-step-1.webp', 'assets/images/real-step-2.webp', 'assets/images/real-step-chain-1.webp',
  'assets/images/real-step-chain-2.webp', 'assets/images/real-step-return.webp', 'assets/images/real-step-wheel-1.webp',
  'assets/images/real-step-wheel-2.webp', 'assets/images/real-step-wheel-worn.webp', 'assets/images/real-tension-1.webp',
  'assets/images/real-tension-2.webp', 'assets/images/real-tension-switch.webp', 'assets/images/real-truss.webp',
  'assets/images/edu-aux-brake.webp', 'assets/images/edu-chain-switch.webp', 'assets/images/edu-comb-protect.webp',
  'assets/images/edu-control-box.webp', 'assets/images/edu-drive-chain.webp', 'assets/images/edu-drive-machine.webp',
  'assets/images/edu-handrail-entry.webp', 'assets/images/edu-handrail-monitor.webp', 'assets/images/edu-handrail-section.webp',
  'assets/images/edu-overview-3d.webp', 'assets/images/edu-step-sag.webp', 'assets/images/edu-step.webp',
  'assets/images/edu-tension.webp', 'assets/images/edu-truss.webp'
];
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'assets/favicon.svg', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/css/style.css', 'assets/data/data.js',
  'assets/js/schematics.js', 'assets/js/simulations.js',
  'assets/js/version.js', 'assets/js/profile.js', 'assets/js/app.js',
  ...IMG
];
const CORE = ASSETS.slice(0, 13);   // å³é®èµæºå¤±è´¥åå®è£å¤±è´¥ï¼å¾çåè®¸ä¸ªå«ç¼ºå¤±

self.addEventListener('install', e => e.waitUntil(
  caches.open(VERSION).then(c => Promise.all(CORE.map(u => c.add(u)))
    .then(() => Promise.all(IMG.map(u => c.add(u).catch(() => null))))
    .then(() => self.skipWaiting()))));   // æ° SW å®è£å®ç«å³æ¥ç®¡ï¼é¿åæ§ç¼å­æ»ç
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
