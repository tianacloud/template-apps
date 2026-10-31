
/* 介绍页渲染：文案、版本号、评测数据全部取自 assets/data/contest.js 的 CONTEST。
 * 数据缺失时保留 HTML 内的静态兜底（作者、免责声明、应用入口），不白屏。 */
(function () {
  var has = (typeof CONTEST !== 'undefined' && CONTEST);
  if (!has) { document.body.className += ' no-data'; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setText(key, val) {
    if (val == null || val === '') return;
    var ns = document.querySelectorAll('[data-t="' + key + '"]'), i;
    for (i = 0; i < ns.length; i++) ns[i].textContent = val;
  }
  function fill(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function paras(text) {
    var arr = String(text || '').split('\n\n'), out = '', i;
    for (i = 0; i < arr.length; i++) { if (arr[i]) out += '<p>' + esc(arr[i]) + '</p>'; }
    return out;
  }

  if (has) {
    var D = CONTEST, M = D.meta, i, j, h;

    document.title = '作品介绍 · ' + M.workName;
    setText('workName', M.workName);
    setText('tagline', M.tagline);
    setText('disclaimer', M.disclaimer);
    setText('techNote', D.techNote);
    setText('authorName', D.author && D.author.name);
    setText('authorOrg', D.author && D.author.org);

    /* 概述：版本 + 详细介绍全文 */
    fill('box-abmeta', esc(M.category) + ' · 组合包 <b>' + esc(M.version) + '</b> · 构建 ' + esc(M.build));
    fill('box-intro', paras(M.introLong));

    /* 界面速览 */
    h = '';
    for (i = 0; i < D.shots.length; i++) {
      h += '<figure><img src="' + esc(D.shots[i].src) + '" width="1000" height="625" loading="lazy" alt="' + esc(D.shots[i].alt) + '">'
        + '<figcaption>' + esc(D.shots[i].cap) + '</figcaption></figure>';
    }
    fill('box-gallery', h);

    h = '';
    for (i = 0; i < D.presentShots.length; i++) {
      h += '<figure><img src="' + esc(D.presentShots[i].src) + '" width="1000" height="625" loading="lazy" alt="' + esc(D.presentShots[i].alt) + '">'
        + '<figcaption>' + esc(D.presentShots[i].cap) + '</figcaption></figure>';
    }
    fill('box-present', h);

    /* 痛点 */
    h = '';
    for (i = 0; i < D.pains.length; i++) {
      h += '<article class="pain-item"><div class="pi-ico">' + esc(D.pains[i].icon) + '</div>'
        + '<h3>' + esc(D.pains[i].t) + '</h3><p>' + esc(D.pains[i].d) + '</p></article>';
    }
    fill('box-pains', h);

    /* 核心功能 */
    h = '';
    for (i = 0; i < D.features.length; i++) {
      var f = D.features[i], li = '';
      for (j = 0; j < f.items.length; j++) li += '<li>' + esc(f.items[j]) + '</li>';
      h += '<article class="feat-item"><div class="fi-ico">' + esc(f.icon) + '</div>'
        + '<h3>' + esc(f.t) + '</h3><ul>' + li + '</ul></article>';
    }
    fill('box-features', h);

    /* 技术说明 */
    h = '';
    for (i = 0; i < D.tech.length; i++) {
      h += '<article class="tech-item"><h3>' + esc(D.tech[i].t) + '</h3><p>' + esc(D.tech[i].d) + '</p></article>';
    }
    fill('box-tech', h);

    /* 版本记录 */
    h = '';
    for (i = 0; i < D.changelog.length; i++) {
      h += '<tr><td data-k="日期">' + esc(D.changelog[i].date) + '</td>'
        + '<td data-k="版本" class="ver-cell">' + esc(D.changelog[i].ver) + '</td>'
        + '<td data-k="主要内容">' + esc(D.changelog[i].item) + '</td></tr>';
    }
    fill('box-changelog', h);

    /* 浏览器矩阵 + 已知限制 */
    h = '';
    for (i = 0; i < D.browserSupport.length; i++) {
      h += '<tr><td data-k="浏览器" class="ver-cell">' + esc(D.browserSupport[i].k) + '</td>'
        + '<td data-k="支持情况">' + esc(D.browserSupport[i].v) + '</td></tr>';
    }
    fill('box-browser', h);

    h = '';
    for (i = 0; i < D.limits.length; i++) h += '<li>' + esc(D.limits[i]) + '</li>';
    fill('box-limits', h);

    /* 合规 */
    h = '';
    for (i = 0; i < D.compliance.length; i++) h += '<li>' + esc(D.compliance[i]) + '</li>';
    fill('box-compliance', h);

    /* 页脚版本行 */
    var vers = [];
    for (i = 0; i < D.apps.length; i++) vers.push(esc(D.apps[i].shortName + ' ' + D.apps[i].version));
    fill('box-footver', esc(M.workName) + ' · 组合包 <b>' + esc(M.version) + '</b>（'
      + vers.join(' ＋ ') + '）· 构建 ' + esc(M.build));
  }

  /* Esc 返回首页（介绍页约定；应用内 Esc 另有其自身逻辑，互不影响） */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') { window.location.href = 'index.html'; }
  });
})();
