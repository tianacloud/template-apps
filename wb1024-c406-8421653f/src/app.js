(function () {
  'use strict';
  const S = window.SceneOne;
  const $ = function (id) { return document.getElementById(id); };
  const esc = S.esc, fmtTime = S.fmtTime, fmtSpan = S.fmtSpan, fmtNum = S.fmtNum;

  const state = { a: null };
  const LVL_COLOR = { error: 'var(--red)', warn: 'var(--orange)', info: 'var(--accent)', debug: '#6e7681', other: '#6e7681' };

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg || '已复制'); }, function () { fallbackCopy(text, okMsg); });
    } else fallbackCopy(text, okMsg);
  }
  function fallbackCopy(text, okMsg) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg || '已复制'); }
    catch (e) { toast('复制失败，请手动选择复制'); }
    document.body.removeChild(ta);
  }

  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- 输入区 ---------- */
  function updateInputCount() {
    const v = $('logInput').value;
    const lines = v ? v.split(/\r?\n/).length : 0;
    $('inputCount').textContent = fmtNum(lines) + ' 行 · ' + fmtNum(v.length) + ' 字符';
  }

  function initSamples() {
    const box = $('sampleBtns');
    S.SAMPLES.forEach(function (s) {
      const b = document.createElement('button');
      b.className = 'btn small sample-btn';
      b.textContent = s.name;
      b.title = s.desc;
      b.onclick = function () {
        $('logInput').value = s.text;
        updateInputCount();
        runAnalysis();
        toast('已载入样本：' + s.name);
      };
      box.appendChild(b);
    });
  }

  function initDrop() {
    const dz = $('dropzone');
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('dragover'); });
    });
    dz.addEventListener('drop', function (e) {
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      if (f.size > 20 * 1024 * 1024) { toast('文件超过 20MB，请截取关键片段'); return; }
      const r = new FileReader();
      r.onload = function () {
        $('logInput').value = String(r.result || '');
        updateInputCount();
        toast('已读取 ' + f.name + '（' + fmtNum(f.size / 1024) + ' KB），点击开始诊断');
      };
      r.onerror = function () { toast('文件读取失败'); };
      r.readAsText(f);
    });
  }

  /* ---------- 渲染 ---------- */
  function renderOverview(a) {
    const st = a.stats;
    const errRate = st.totalLines ? Math.round(st.levels.error / st.totalLines * 1000) / 10 : 0;
    const fmtKeys = Object.keys(st.formats).sort(function (x, y) { return st.formats[y] - st.formats[x]; });
    const dominant = fmtKeys.length ? fmtKeys[0] : '—';
    const cascadeN = a.clusters.filter(function (c) { return c.cascade; }).length;
    const chips = [
      { k: '日志行数', v: fmtNum(st.totalLines) },
      { k: '时间跨度', v: st.timeMin != null ? fmtSpan(st.timeMax - st.timeMin) : '无时间戳' },
      { k: '错误', v: fmtNum(st.levels.error), cls: 'err' },
      { k: '警告', v: fmtNum(st.levels.warn), cls: 'war' },
      { k: '错误率', v: errRate + '%', cls: errRate > 5 ? 'err' : '' },
      { k: '主格式', v: dominant },
      { k: '疑似级联', v: fmtNum(cascadeN), cls: cascadeN ? 'war' : 'ok' },
      { k: '知识库命中', v: fmtNum(a.kbHits.length), cls: 'ok' }
    ];
    $('overviewChips').innerHTML = chips.map(function (c) {
      return '<span class="chip"><span class="k">' + c.k + '</span><span class="v ' + (c.cls || '') + '">' + esc(c.v) + '</span></span>';
    }).join('');
    $('fmtBadge').textContent = '识别到 ' + fmtKeys.length + ' 种格式：' +
      fmtKeys.map(function (k) { return k + '×' + st.formats[k]; }).join('，') + (st.truncated ? '（输入超大，仅分析前 200000 行）' : '');
  }

  function renderScene(a) {
    const body = $('sceneBody');
    if (!a.firstScene) {
      body.innerHTML = '<div class="scene-line" style="border-left-color:var(--green)">未发现错误级日志。工具按级别关键词（error / exception / failed / 退出码等）判定，若日志被折叠或级别不同，请检查原文。</div>';
      $('cascadeSummary').textContent = '';
      return;
    }
    const ev = a.firstScene.event;
    const rc = a.firstScene.cluster;
    const cascadeN = a.clusters.filter(function (c) { return c.cascade; }).length;
    const conf = a.firstScene.kb.length ? '高' : '中';
    $('cascadeSummary').textContent = '根因置信度：' + conf + ' · 检出 ' + cascadeN + ' 个疑似级联聚类';
    let html = '<div class="scene-meta">' +
      '<span>位置 <b>第 ' + ev.i + ' 行</b></span>' +
      '<span>时间 <b>' + (ev.time != null ? esc(fmtTime(ev.time)) : '无时间戳') + '</b></span>' +
      (ev.source ? '<span>来源 <b>' + esc(ev.source) + '</b></span>' : '') +
      (rc ? '<span>同类出现 <b>' + rc.count + ' 次</b></span>' : '') +
      '</div>';
    html += '<div class="scene-line">' + esc(S.truncateMiddle(ev.msg, 500)) + '</div>';
    const kbs = a.firstScene.kb.slice(0, 2);
    if (kbs.length) {
      html += '<div class="kb-grid" style="margin-top:12px">' + kbs.map(kbCard).join('') + '</div>';
    } else {
      html += '<div style="margin-top:12px;color:var(--muted);font-size:12.5px">未命中内置知识库。建议以该行文本作为关键词检索官方文档，并检查其前后 20 行上下文。</div>';
    }
    const ctx = a.events.filter(function (e) { return Math.abs(e.i - ev.i) <= 3 && e.i !== ev.i; }).sort(function (x, y) { return x.i - y.i; });
    if (ctx.length) {
      const all = ctx.concat([ev]).sort(function (x, y) { return x.i - y.i; });
      html += '<div class="ctx"><div style="padding:5px 10px;font-size:11px;color:var(--muted);border-bottom:1px solid var(--border-soft)">上下文（前后 3 行）</div>' +
        all.map(function (e) {
          return '<div class="ctx-row' + (e.i === ev.i ? ' root' : '') + '"><span class="ln">' + e.i + '</span><span class="txt">' + esc(S.truncateMiddle(e.msg, 220)) + '</span></div>';
        }).join('') + '</div>';
    }
    body.innerHTML = html;
  }

  function kbCard(h) {
    const kb = h.item || h;
    return '<div class="kb-card">' +
      '<h3>' + esc(kb.title) + ' <span class="sev ' + kb.sev + '">' + ({ high: '高危', medium: '关注', low: '提示' })[kb.sev] + '</span> <span class="cat">' + esc(kb.cat) + '</span></h3>' +
      '<div class="what">' + esc(kb.what) + '</div>' +
      '<div class="label">常见原因</div><ul>' + kb.causes.slice(0, 3).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '<div class="label">修复建议</div><ul>' + kb.fixes.slice(0, 4).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      '</div>';
  }

  function renderKb(a) {
    const hits = a.kbHits.slice(0, 6);
    $('kbSub').textContent = '命中 ' + a.kbHits.length + ' 条签名' + (a.kbHits.length ? '，展示前 ' + hits.length + ' 条' : '');
    $('kbGrid').innerHTML = hits.length ? hits.map(kbCard).join('')
      : '<div style="color:var(--muted);font-size:13px">未命中内置知识库。可尝试提供更完整的报错行（含异常类型与关键消息）。</div>';
  }

  function renderClusters(a) {
    const list = a.clusters.filter(function (c) { return c.errorCount + c.warnCount > 0; }).slice(0, 12);
    $('clusterRows').innerHTML = list.length ? list.map(function (c, i) {
      const judge = c.cascade === 'high' ? '<span class="cascade high">疑似级联·高</span>'
        : c.cascade === 'medium' ? '<span class="cascade medium">疑似级联·中</span>'
          : c.cascade === 'low' ? '<span class="cascade low">出现于根因之后</span>' : '独立问题';
      const kbNames = c.kb.slice(0, 2).map(function (k) { return esc(k.title); }).join('；');
      return '<tr><td>' + (i + 1) + '</td><td class="tpl">' + c.count + '</td>' +
        '<td><span class="lvl ' + (c.errorCount ? 'error' : 'warn') + '">' + (c.errorCount ? '错误' : '警告') + '</span></td>' +
        '<td class="tpl">' + c.firstSeq + '</td>' +
        '<td class="tpl">' + esc(S.truncateMiddle(c.key, 100)) + '</td>' +
        '<td>' + judge + '</td><td style="font-size:12px;color:var(--muted)">' + (kbNames || '—') + '</td></tr>';
    }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:18px">无错误 / 警告聚类</td></tr>';
  }

  function renderEntities(a) {
    const E = a.entities;
    const groups = [
      ['异常类', S.topCounts(E.exceptions, 8)],
      ['HTTP 码', S.topCounts(E.httpCodes, 8)],
      ['IP', S.topCounts(E.ips, 6)],
      ['端口', S.topCounts(E.ports, 6)],
      ['退出码', S.topCounts(E.exitCodes, 6)],
      ['URL', S.topCounts(E.urls, 5)]
    ];
    let html = '';
    for (const g of groups) {
      if (!g[1].length) continue;
      html += '<span class="ent"><b>' + g[0] + '</b> ' + g[1].map(function (x) {
        return esc(x.v) + (x.n > 1 ? ' <span class="n">×' + x.n + '</span>' : '');
      }).join(' · ') + '</span>';
    }
    $('entChips').innerHTML = html || '<span style="color:var(--muted);font-size:12.5px">未从错误 / 警告行中抽取到实体</span>';
  }

  function renderTimeline(a) {
    const tl = a.timeline;
    const W = 720, H = 132, padT = 10, padB = 24;
    const n = tl.buckets.length;
    const bw = (W - 8) / n;
    let max = 1;
    tl.buckets.forEach(function (b) { if (b.total > max) max = b.total; });
    let bars = '';
    tl.buckets.forEach(function (b, i) {
      const x = 4 + i * bw;
      let acc = 0;
      ['error', 'warn', 'info', 'debug', 'other'].forEach(function (lv) {
        const v = b[lv] || 0;
        if (!v) return;
        const inner = H - padB - padT;
        const h = inner * (v / max);
        const yy = padT + inner * (1 - (acc + v) / max);
        bars += '<rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + Math.max(1, bw - 1).toFixed(1) +
          '" height="' + Math.max(0.6, h).toFixed(1) + '" fill="' + LVL_COLOR[lv] + '" rx="1">' +
          '<title>' + lv + ' ' + v + ' 条</title></rect>';
        acc += v;
      });
    });
    const axis = tl.mode === 'time'
      ? '<text x="4" y="' + (H - 6) + '" fill="#6e7681" font-size="10" font-family="monospace">' + esc(fmtTime(tl.min)) + '</text>' +
        '<text x="' + (W - 4) + '" y="' + (H - 6) + '" fill="#6e7681" font-size="10" text-anchor="end" font-family="monospace">' + esc(fmtTime(tl.max)) + '</text>'
      : '<text x="4" y="' + (H - 6) + '" fill="#6e7681" font-size="10" font-family="monospace">开头</text>' +
        '<text x="' + (W - 4) + '" y="' + (H - 6) + '" fill="#6e7681" font-size="10" text-anchor="end" font-family="monospace">结尾</text>';
    $('timelineWrap').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="事件时间线">' + bars + axis + '</svg>';
    $('timelineSub').textContent = tl.mode === 'time' ? '按分钟聚合（自动伸缩） · 峰值 ' + max + ' 条/桶' : '无有效时间戳，按行序分桶 · 峰值 ' + max + ' 条/桶';
  }

  function renderLogs() {
    if (!state.a) return;
    const lv = $('levelFilter').value;
    const q = $('logSearch').value.trim();
    const ql = q.toLowerCase();
    const cap = 300;
    let shown = 0;
    let html = '';
    for (const ev of state.a.events) {
      if (lv !== 'all' && ev.level !== lv) continue;
      if (ql && ev.raw.toLowerCase().indexOf(ql) === -1) continue;
      if (shown >= cap) break;
      shown++;
      let msg = ev.msg + (ev.stack && ev.stack.length ? '  ⏎ +' + ev.stack.length + ' 行堆栈' : '');
      let safe = esc(S.truncateMiddle(msg, 400));
      if (q) safe = safe.replace(new RegExp(escapeRegex(esc(q)), 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
      html += '<div class="log-row ' + ev.level + '"><span class="ln">' + ev.i + '</span>' +
        '<span class="tm">' + (ev.time != null ? esc(fmtTime(ev.time)) : '') + '</span>' +
        '<span class="lv lvl ' + ev.level + '">' + ev.level + '</span>' +
        '<span class="msg">' + safe + '</span></div>';
    }
    $('logList').innerHTML = html || '<div style="padding:22px;text-align:center;color:var(--muted)">没有匹配的日志行</div>';
    const filtered = lv !== 'all' || !!q;
    $('logviewSub').textContent = '共 ' + fmtNum(state.a.events.length) + ' 条 · 显示 ' + shown + ' 条' + (filtered ? '（已过滤）' : '') + (shown >= cap ? ' · 仅渲染前 ' + cap + ' 条' : '');
  }

  function renderAll(a) {
    state.a = a;
    $('emptyState').hidden = true;
    $('results').hidden = false;
    renderOverview(a);
    renderScene(a);
    renderTimeline(a);
    renderKb(a);
    renderClusters(a);
    renderEntities(a);
    $('levelFilter').value = 'all';
    $('logSearch').value = '';
    renderLogs();
    $('reportBox').value = S.buildMarkdown(a);
  }

  /* ---------- 主流程 ---------- */
  function runAnalysis() {
    const raw = $('logInput').value;
    if (!raw || !raw.trim()) { toast('请先粘贴日志，或点击样本体验'); return; }
    try {
      const a = S.analyze(raw);
      renderAll(a);
      const t = a.stats;
      toast('诊断完成：' + fmtNum(t.totalLines) + ' 行 · 错误 ' + t.levels.error + ' · 级联 ' +
        a.clusters.filter(function (c) { return c.cascade; }).length);
    } catch (err) {
      console.error(err);
      toast('诊断过程出错：' + (err && err.message ? err.message : '未知错误'));
    }
  }

  function init() {
    initSamples();
    initDrop();
    updateInputCount();
    $('btnAnalyze').onclick = runAnalysis;
    $('btnClear').onclick = function () { $('logInput').value = ''; updateInputCount(); $('logInput').focus(); };
    $('logInput').addEventListener('input', updateInputCount);
    $('logInput').addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runAnalysis(); }
    });
    $('levelFilter').onchange = renderLogs;
    let st = null;
    $('logSearch').addEventListener('input', function () {
      clearTimeout(st);
      st = setTimeout(renderLogs, 180);
    });
    $('btnCopyReport').onclick = function () {
      if (!$('reportBox').value) { toast('请先运行诊断'); return; }
      copyText($('reportBox').value, '报告已复制，可直接贴进 Issue');
    };
    $('btnDownloadReport').onclick = function () {
      if (!$('reportBox').value) { toast('请先运行诊断'); return; }
      const blob = new Blob([$('reportBox').value], { type: 'text/markdown;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'sceneone-report.md';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 500);
      toast('已下载 sceneone-report.md');
    };
    $('btnCopyMasked').onclick = function () {
      const v = $('logInput').value;
      if (!v.trim()) { toast('输入为空'); return; }
      copyText(S.maskSensitive(v), '已复制脱敏日志（IP / 邮箱 / 密钥已掩码）');
    };
    $('btnHelp').onclick = function () { $('helpModal').classList.add('show'); };
    $('btnHelpClose').onclick = function () { $('helpModal').classList.remove('show'); };
    $('helpModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $('helpModal').classList.remove('show'); });
    const hm = (location.hash || '').match(/sample=([\w-]+)/);
    if (hm) {
      const s = S.getSample(hm[1]);
      if (s) {
        $('logInput').value = s.text;
        updateInputCount();
        runAnalysis();
      }
    }
    const fm = (location.hash || '').match(/focus=([\w-]+)/);
    if (fm && $(fm[1])) {
      setTimeout(function () { $(fm[1]).scrollIntoView({ block: 'start' }); }, 350);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
