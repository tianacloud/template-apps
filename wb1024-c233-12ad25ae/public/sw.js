/* ===== 宝贝升级乐园 · Service Worker =====
   应用外壳缓存：断网也能打开并使用全部核心功能（数据本来就在 localStorage）。
*/
var CACHE = 'bls-shell-v5';
var ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './app.js',
  './bank/catalog.js',
  './mathbank.js',
  './bank/cn-catalog.js',
  './chinabank.js',
  // 人教版英语题库（单词 / 常用表达法 / 谚语 / 不规则动词 / 语音，3-6 年级）
  './bank/en-catalog.js',
  './engbank.js',
  './modules.js',
  './pet.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  // 人教版数学题库（6 个年级分片，共约 370KB，装一次就永久离线可用）
  './bank/math-g1.js',
  './bank/math-g2.js',
  './bank/math-g3.js',
  './bank/math-g4.js',
  './bank/math-g5.js',
  './bank/math-g6.js',
  // 人教版语文题库（古诗文 / 日积月累 / 词语表，6 个年级分片，共约 86KB）
  './bank/cn-g1.js',
  './bank/cn-g2.js',
  './bank/cn-g3.js',
  './bank/cn-g4.js',
  './bank/cn-g5.js',
  './bank/cn-g6.js',
  // 人教版英语题库分片（3-6 年级 + 通用：不规则动词 / 语音）
  './bank/en-g3.js',
  './bank/en-g4.js',
  './bank/en-g5.js',
  './bank/en-g6.js',
  './bank/en-common.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(ASSETS.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { /* 单个失败不影响安装 */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 导航请求：网络优先，失败回退到缓存的 index.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  // 静态资源：缓存优先 + 后台更新
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
