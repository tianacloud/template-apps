/* =========================================================================
 * Service Worker Â· çæ¬åç¼å­ + cache-firstï¼C-01ï¼
 * VERSION å¿é¡»ä¸ assets/js/version.js ç APP_VERSION åæ­¥æåï¼
 *   APP_VERSION = v1.4.0  â  VERSION = 'elevator-sim-v1.4.0'
 * èµæºæ¸åå« assets/images/ ä¸å®ç©ç§çï¼AI ç¤ºæ + çå®æ¸²æï¼
 * ========================================================================= */
const VERSION = 'elevator-sim-v1.4.0';
/* å®ç©å¾çæ¸åï¼v1.4.0ï¼ï¼22 å¼ ç¨æ·æä¾ççå®ç»ææ¸²æå¾ + 36 å¼  AI çææå­¦ç¤ºæå¾ */
const IMG = [
  'assets/images/real-el-guide-joint.jpg',
  'assets/images/real-el-guide-hollow.jpg',
  'assets/images/real-el-balance-system.jpg',
  'assets/images/real-el-car-system.jpg',
  'assets/images/real-el-control-cabinet.jpg',
  'assets/images/real-el-door-operator.jpg',
  'assets/images/real-el-door-panels.jpg',
  'assets/images/real-el-door-system.jpg',
  'assets/images/real-el-drive-cabinet.jpg',
  'assets/images/real-el-drive-machine.jpg',
  'assets/images/real-el-guide-bracket.jpg',
  'assets/images/real-el-guide-clip.jpg',
  'assets/images/real-el-guide-shoe.jpg',
  'assets/images/real-el-guide-system.jpg',
  'assets/images/real-el-guide-t-rail.jpg',
  'assets/images/real-el-machine-oiler.jpg',
  'assets/images/real-el-machine-rope-gripper.jpg',
  'assets/images/real-el-safety-buffer.jpg',
  'assets/images/real-el-safety-clamp.jpg',
  'assets/images/real-el-safety-governor.jpg',
  'assets/images/real-el-safety-limit.jpg',
  'assets/images/real-el-traction-system.jpg',
  'assets/images/real-traction-machine-1.jpg',
  'assets/images/real-traction-machine-roomless-1.jpg',
  'assets/images/real-traction-sheave-1.jpg',
  'assets/images/real-traction-rope-head-1.jpg',
  'assets/images/real-traction-deflector-1.jpg',
  'assets/images/real-traction-machine-room-1.jpg',
  'assets/images/real-drive-motor-1.jpg',
  'assets/images/real-drive-brake-1.jpg',
  'assets/images/real-drive-encoder-1.jpg',
  'assets/images/real-guide-rail-1.jpg',
  'assets/images/real-guide-bracket-1.jpg',
  'assets/images/real-guide-shoe-1.jpg',
  'assets/images/real-guide-joint-1.jpg',
  'assets/images/real-balance-counterweight-1.jpg',
  'assets/images/real-balance-chain-1.jpg',
  'assets/images/real-balance-block-1.jpg',
  'assets/images/real-car-frame-1.jpg',
  'assets/images/real-car-floor-load-1.jpg',
  'assets/images/real-car-interior-1.jpg',
  'assets/images/real-car-top-sheave-1.jpg',
  'assets/images/real-door-car-door-1.jpg',
  'assets/images/real-door-landing-lock-1.jpg',
  'assets/images/real-door-knife-1.jpg',
  'assets/images/real-door-threshold-1.jpg',
  'assets/images/real-control-cabinet-1.jpg',
  'assets/images/real-control-car-op-1.jpg',
  'assets/images/real-control-hall-box-1.jpg',
  'assets/images/real-control-inspection-1.jpg',
  'assets/images/real-control-estop-1.jpg',
  'assets/images/real-drive-vvvf-1.jpg',
  'assets/images/real-safety-governor-1.jpg',
  'assets/images/real-safety-clamp-1.jpg',
  'assets/images/real-safety-buffer-1.jpg',
  'assets/images/real-safety-buffer-2.jpg',
  'assets/images/real-safety-limit-1.jpg',
  'assets/images/real-safety-door-contact-1.jpg'
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
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
