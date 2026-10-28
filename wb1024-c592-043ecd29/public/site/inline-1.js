
/* 主页渲染：所有文案与版本号取自 assets/data/contest.js 的全局对象 CONTEST。
 * 数据缺失（typeof CONTEST === 'undefined'）时直接退出，页面保留 HTML 内的静态兜底内容，不白屏。 */
(function () {
  if (typeof CONTEST === 'undefined' || !CONTEST) { document.body.className += ' no-data'; return; }
  var D = CONTEST, M = D.meta;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setText(key, val) {
    if (val == null || val === '') return;
    var ns = document.querySelectorAll('[data-t="' + key + '"]'), i;
    for (i = 0; i < ns.length; i++) ns[i].textContent = val;
  }
  function box(id) { return document.getElementById(id); }
  function fill(id, html) { var el = box(id); if (el) el.innerHTML = html; }

  /* --- 页级元数据 --- */
  if (M.workName) document.title = M.workName + ' · ' + (M.tagline || '');
  var md = document.querySelector('meta[name="description"]');
  if (md && M.intro30) md.setAttribute('content', M.intro30 + '。' + (M.tagline || ''));

  /* --- hero --- */
  setText('enName', M.enName);
  setText('workName', M.workName);
  setText('tagline', M.tagline);
  setText('intro30', M.intro30);
  setText('heroBadge', D.hero && D.hero.badge);
  setText('heroHint', D.hero && D.hero.hint);
  setText('disclaimer', M.disclaimer);
  setText('stepsNote', D.stepsNote);
  var ctas = document.querySelectorAll('[data-cta]');
  for (var i = 0; i < ctas.length; i++) {
    var c = D.hero && D.hero.ctas && D.hero.ctas[ctas[i].getAttribute('data-cta')];
    if (!c) continue;
    ctas[i].textContent = c.label;
    if (c.href) ctas[i].setAttribute('href', c.href);
  }

  /* --- ② quick --- */
  var qTheme = ['q-blue', 'q-cyan', 'q-green'], q = '', i;
  for (i = 0; i < D.quick.length; i++) {
    var it = D.quick[i];
    q += '<article class="qcard ' + (qTheme[i] || 'q-blue') + '">'
      + '<div class="q-icon">' + esc(it.icon) + '</div>'
      + '<div class="q-num">' + esc(it.num) + '</div>'
      + '<div class="q-numlabel">' + esc(it.numLabel) + '</div>'
      + '<h3>' + esc(it.title) + '</h3>'
      + '<p>' + esc(it.desc) + '</p></article>';
  }
  fill('box-quick', q);

  /* --- ③ apps（替换 HTML 内的静态兜底卡片） --- */
  var a = '';
  for (i = 0; i < D.apps.length; i++) {
    var ap = D.apps[i], isEs = ap.id === 'escalator';
    var b = '';
    for (var j = 0; j < ap.bullets.length; j++) b += '<li>' + esc(ap.bullets[j]) + '</li>';
    a += '<article class="card app-card ' + (isEs ? 'is-es' : 'is-el') + '">'
      + (ap.shot ? '<div class="app-shot"><img src="' + esc(ap.shot) + '" width="1000" height="625" loading="lazy" alt="' + esc(ap.shotAlt || ap.title) + '"></div>' : '')
      + '<div class="app-body">'
      + '<div class="icon">' + esc(ap.icon) + '</div>'
      + '<h3>' + esc(ap.title) + '</h3>'
      + '<p class="app-ver">应用版本 <b>' + esc(ap.version) + '</b> · 构建 ' + esc(ap.build) + '</p>'
      + '<ul>' + b + '</ul>'
      + '<a class="btn ' + (isEs ? 'btn-accent' : 'btn-primary') + ' app-go" href="' + esc(ap.path) + '">' + esc(ap.cta) + '</a>'
      + '</div></article>';
  }
  fill('box-apps', a);

  /* --- ④ points --- */
  var p = '';
  for (i = 0; i < D.points.length; i++) {
    p += '<article class="point-item"><span class="pi-icon">' + esc(D.points[i].icon) + '</span>'
      + '<span class="pi-text">' + esc(D.points[i].text) + '</span></article>';
  }
  fill('box-points', p);

  /* --- ⑤ specs --- */
  var s = '';
  for (i = 0; i < D.specs.length; i++) {
    s += '<tr><th scope="row">' + esc(D.specs[i].k) + '</th><td>' + esc(D.specs[i].v) + '</td></tr>';
  }
  fill('box-specs', s);

  /* --- ⑥ steps --- */
  var st = '';
  for (i = 0; i < D.steps.length; i++) {
    st += '<article class="step-item"><div class="step-n">' + esc(D.steps[i].n) + '</div>'
      + '<h3>' + esc(D.steps[i].t) + '</h3><p>' + esc(D.steps[i].d) + '</p></article>';
  }
  fill('box-steps', st);

  /* --- ⑦ foot --- */
  var tg = '';
  for (i = 0; i < M.tags.length; i++) tg += '<span>' + esc(M.tags[i]) + '</span>';
  fill('box-tags', tg);

  var vers = [];
  for (i = 0; i < D.apps.length; i++) vers.push(esc(D.apps[i].shortName + ' ' + D.apps[i].version));
  fill('box-footver', esc(M.workName) + ' · 组合包 <b>' + esc(M.version) + '</b>（'
    + vers.join(' ＋ ') + '）· 构建 ' + esc(M.build));

  fill('box-author', esc(D.author.name) + ' · ' + esc(D.author.org) + '　｜　' + esc(M.category));
})();
