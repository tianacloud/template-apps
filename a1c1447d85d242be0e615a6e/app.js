/* 剁手冷静期 · 单页应用 */
export function startApp(store, files, urls, initial) {
  'use strict';

  /* ---------------- 常量 ---------------- */
  const HOUR = 3600 * 1000;
  const TOTAL = 72;
  const TAU = 18;
  const END_TEMP = 2;

  const PRESETS = [
    { name: '白色跑鞋', price: 899, img: 'template-assets/images/c3f7b7b46c5544ed.jpg', excuse: '限时折扣', fate: '偶尔用' },
    { name: '客制化键盘', price: 1280, img: 'template-assets/images/c113688d03be180a.jpg', excuse: '最后一件', fate: '柜子里' },
    { name: '拍立得相机', price: 649, img: 'template-assets/images/a3aad3b175f5120d.jpg', excuse: '就是想', fate: '柜子里' },
    { name: '露营折叠椅', price: 459, img: 'template-assets/images/81e8d5ca56b51251.jpg', excuse: '凑单', fate: '挂闲鱼' }
  ];
  const EXCUSES = ['限时折扣', '凑单', '最后一件', '就是想'];
  const FATES = ['天天用', '偶尔用', '柜子里', '挂闲鱼'];

  /* ---------------- 状态 ---------------- */
  const state = {
    view: 'record',
    ff: 0,
    items: [],
    currentId: null,
    form: { img: '', name: '', price: '', temp: 7, excuse: '', fate: '' }
  };

  const $ = id => document.getElementById(id);
  const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------------- 工具 ---------------- */
  function money(n) {
    return '¥' + Number(n || 0).toLocaleString('zh-CN');
  }
  function unitCost(n) {
    const v = Number(n) / 30;
    return v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  }
  function virtualNow() {
    return Date.now() + state.ff * HOUR;
  }
  function elapsedOf(it) {
    return Math.max(0, Math.min(TOTAL, (virtualNow() - it.createdAt) / HOUR));
  }
  function tempOf(it, el2) {
    const e = el2 == null ? elapsedOf(it) : el2;
    return END_TEMP + (Number(it.temp) - END_TEMP) * Math.exp(-e / TAU);
  }
  function statusOf(it) {
    if (it.status === 'kept' || it.status === 'bought') return 'done';
    return elapsedOf(it) >= TOTAL ? 'due' : 'cooling';
  }
  function hm(hours) {
    const total = Math.max(0, Math.round(hours * 60));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }
  function tempWord(v) {
    if (v >= 9) return '手在抖';
    if (v >= 7) return '很想';
    if (v >= 5) return '有点想要';
    if (v >= 3) return '冷静了些';
    return '清醒了';
  }
  function fateClause(it) {
    const map = {
      '天天用': '你说它第 30 天会天天用',
      '偶尔用': '你说它第 30 天只是偶尔用',
      '柜子里': '你说它第 30 天会躺在柜子里',
      '挂闲鱼': '你说它第 30 天会挂上闲鱼'
    };
    return map[it.fate] || ('你说它第 30 天会在' + it.fate);
  }
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.classList.remove('on'), 2200);
  }

  /* ---------------- 存储 ---------------- */
  function persist(list) {
    store.save({items: list || state.items, ff: state.ff});
  }
  function loadStore() {
    state.ff = Number(initial.ff) || 0;
    return Array.isArray(initial.items) ? initial.items : [];
  }
  let uploading = false;
  function imgUrl(path) { return urls.get(path) || ''; }

  /* ---------------- 演示数据 ---------------- */
  function demoItems() {
    const vn = virtualNow();
    return [
      { id: 'd1', name: '客制化键盘', price: 1280, img: 'template-assets/images/c113688d03be180a.jpg', temp: 10, excuse: '最后一件', fate: '柜子里', createdAt: vn },
      { id: 'd2', name: '拍立得相机', price: 649, img: 'template-assets/images/a3aad3b175f5120d.jpg', temp: 8, excuse: '就是想', fate: '柜子里', createdAt: vn - 12 * HOUR },
      { id: 'd3', name: '露营折叠椅', price: 459, img: 'template-assets/images/81e8d5ca56b51251.jpg', temp: 6, excuse: '凑单', fate: '挂闲鱼', createdAt: vn - 80 * HOUR, status: 'kept', settleTemp: 2 }
    ];
  }

  /* ---------------- 路由 ---------------- */
  function go(view, id) {
    state.view = view;
    if (id !== undefined) state.currentId = id;

    ['record', 'cooling', 'settle', 'report'].forEach(v => {
      const s = $('v-' + v);
      if (s) s.hidden = (v !== view);
    });

    document.querySelectorAll('.nav button').forEach(b => {
      b.classList.toggle('on', b.dataset.go === view || (view === 'settle' && b.dataset.go === 'cooling'));
    });

    if (view === 'cooling') renderCooling();
    if (view === 'settle') renderSettle(id || state.currentId);
    if (view === 'report') renderReport();
    if (view === 'record') renderStats();

    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ---------------- 顶部统计 ---------------- */
  function summarize() {
    const items = state.items;
    const kept = items.filter(i => i.status === 'kept');
    const bought = items.filter(i => i.status === 'bought');
    const hold = items.filter(i => i.status !== 'bought').reduce((s, i) => s + Number(i.price || 0), 0);
    const settled = kept.length + bought.length;
    const rate = settled ? Math.round(kept.length / settled * 100) : null;
    const tally = {};
    items.forEach(i => { if (i.fate) tally[i.fate] = (tally[i.fate] || 0) + 1; });
    let fate = null, max = 0;
    Object.keys(tally).forEach(k => { if (tally[k] > max) { max = tally[k]; fate = k; } });
    return { items, kept, bought, hold, rate, fate, settled };
  }

  function renderStats() {
    const s = summarize();
    $('statHold').textContent = s.hold ? money(s.hold) : '¥0';
    $('statRate').textContent = s.rate == null ? '—' : s.rate + '%';
    $('statFate').textContent = s.fate || '—';
  }

  /* ---------------- 01 记一笔 ---------------- */
  function initRecord() {
    // 预设
    const pr = $('presets');
    PRESETS.forEach((p, i) => {
      const b = el('button', 'pthumb');
      b.type = 'button';
      b.innerHTML = '<img src="' + imgUrl(p.img) + '" alt="' + esc(p.name) + '">' +
        '<span class="pname">' + esc(p.name) + '</span>';
      b.addEventListener('click', () => {
        state.form.img = p.img;
        state.form.name = p.name;
        state.form.price = String(p.price);
        state.form.excuse = p.excuse;
        state.form.fate = p.fate;
        $('phImg').src = imgUrl(p.img);
        $('photo').classList.add('has');
        $('fName').value = p.name;
        $('fPrice').value = p.price.toLocaleString('zh-CN');
        document.querySelectorAll('#excuseChips .chip').forEach(x => x.classList.toggle('on', x.textContent === p.excuse));
        document.querySelectorAll('#fateChips .chip').forEach(x => x.classList.toggle('on', x.textContent === p.fate));
        syncUnit();
        pr.querySelectorAll('.pthumb').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
      });
      pr.appendChild(b);
    });

    // 图片上传
    const file = $('file');
    $('photo').addEventListener('click', () => file.click());
    $('phBtn').addEventListener('click', e => { e.stopPropagation(); file.click(); });
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) { toast('请选择图片'); return; }
      const path = 'uploads/' + crypto.randomUUID() + '.jpg';
      if (uploading) { toast('图片正在上传'); return; }
      uploading = true;
      const previous = state.form.img;
      state.form.img = '';
      try {
        const bitmap = await createImageBitmap(f);
        const k = Math.min(1, 640 / Math.max(bitmap.width, bitmap.height));
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(bitmap.width * k)); cv.height = Math.max(1, Math.round(bitmap.height * k));
        cv.getContext('2d').drawImage(bitmap, 0, 0, cv.width, cv.height); bitmap.close();
        const blob = await new Promise(resolve => cv.toBlob(resolve, 'image/jpeg', 0.82));
        if (!blob) throw Error('图片处理失败');
        await files.put(path, blob);
        const url = await files.getUrl(path); urls.set(path, url);
        state.form.img = path; $('phImg').src = url;
        $('photo').classList.add('has');
        document.querySelectorAll('.pthumb').forEach(x => x.classList.remove('on'));
      } catch (e) { state.form.img = previous; toast('图片上传结果未知，请检查连接'); } finally { uploading = false; }
    });

    // 名称
    $('fName').addEventListener('input', e => { state.form.name = e.target.value.trim(); });

    // 价格
    const priceIn = $('fPrice');
    priceIn.addEventListener('focus', () => { priceIn.value = state.form.price.replace(/[^\d]/g, ''); });
    priceIn.addEventListener('input', () => {
      let d = priceIn.value.replace(/[^\d]/g, '').slice(0, 7);
      state.form.price = d;
      priceIn.value = d;
      syncUnit();
    });
    priceIn.addEventListener('blur', () => {
      const d = state.form.price;
      priceIn.value = d ? Number(d).toLocaleString('zh-CN') : '';
    });

    // 温度
    const cells = $('cells');
    for (let i = 0; i < 10; i++) {
      const c = el('i');
      c.addEventListener('click', () => { state.form.temp = i + 1; syncTemp(); });
      cells.appendChild(c);
    }

    // 借口
    const ec = $('excuseChips');
    EXCUSES.forEach(t => {
      const c = el('button', 'chip');
      c.type = 'button';
      c.textContent = t;
      c.addEventListener('click', () => {
        state.form.excuse = (state.form.excuse === t) ? '' : t;
        ec.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.textContent === state.form.excuse));
      });
      ec.appendChild(c);
    });

    // 结局
    const fc = $('fateChips');
    FATES.forEach(t => {
      const c = el('button', 'chip');
      c.type = 'button';
      c.textContent = t;
      c.addEventListener('click', () => {
        state.form.fate = t;
        fc.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x.textContent === t));
      });
      fc.appendChild(c);
    });

    // 提交
    $('submitBtn').addEventListener('click', submitRecord);

    syncTemp();
    syncUnit();
  }

  function syncTemp() {
    const v = state.form.temp;
    $('cells').querySelectorAll('i').forEach((c, i) => c.classList.toggle('on', i < v));
    $('tempHint').textContent = v + ' / 10 · ' + tempWord(v);
  }

  function syncUnit() {
    const d = state.form.price.replace(/[^\d]/g, '');
    $('unit').textContent = d && Number(d) > 0
      ? '按用 30 次算，单次成本 ¥' + unitCost(d)
      : '按用 30 次算，单次成本 —';
  }

  function submitRecord() {
    if (uploading) { toast('请等待图片上传完成'); return; }
    const d = state.form.price.replace(/[^\d]/g, '');
    if (!d || Number(d) <= 0) { toast('先填个金额'); $('fPrice').focus(); return; }
    if (!state.form.fate) { toast('还没选「第 30 天它会在哪」'); return; }

    const now = virtualNow();
    const rec = {
      id: 'r' + now,
      name: state.form.name || '',
      img: state.form.img || '',
      price: Number(d),
      temp: state.form.temp,
      excuse: state.form.excuse || '',
      fate: state.form.fate,
      createdAt: now
    };
    state.items.push(rec);
    persist();

    // 重置表单
    state.form = { img: '', name: '', price: '', temp: 7, excuse: '', fate: '' };
    $('phImg').removeAttribute('src');
    $('photo').classList.remove('has');
    $('fName').value = '';
    $('fPrice').value = '';
    document.querySelectorAll('.pthumb').forEach(x => x.classList.remove('on'));
    document.querySelectorAll('#excuseChips .chip, #fateChips .chip').forEach(x => x.classList.remove('on'));
    syncTemp(); syncUnit();

    toast('已锁进冷静舱 · 72 小时后见');
    go('cooling', rec.id);
  }

  /* ---------------- 02 冷静舱 ---------------- */
  function renderCooling() {
    const list = $('items');
    list.innerHTML = '';
    const items = state.items.slice().sort((a, b) => {
      const sa = statusOf(a), sb = statusOf(b);
      if (sa === 'due' && sb !== 'due') return -1;
      if (sb === 'due' && sa !== 'due') return 1;
      return elapsedOf(b) - elapsedOf(a);
    });

    $('coolCount').textContent = items.length + ' 件';

    if (!items.length) {
      $('detail').innerHTML =
        '<div class="empty"><div class="e1">冷静舱是空的</div>' +
        '<div class="e2">记下一件想买的东西，它会在这里待满 72 小时。中间你什么都不用做。</div>' +
        '<div style="display:flex;gap:10px">' +
          '<button class="primary" data-go="record" type="button">去记一笔</button>' +
          '<button class="ghost" id="seedDemo" type="button">看演示 · 放 3 件进来</button>' +
        '</div></div>';
      bindGo($('detail'));
      const sd = $('seedDemo');
      if (sd) sd.addEventListener('click', seedDemo);
      return;
    }

    if (!state.currentId || !items.some(i => i.id === state.currentId)) {
      state.currentId = items[0].id;
    }

    items.forEach(it => {
      const st = statusOf(it);
      const e = elapsedOf(it);
      const b = el('button', 'item' + (it.id === state.currentId ? ' on' : '') + (st === 'due' ? ' due' : ''));
      b.type = 'button';
      const pic = it.img
        ? '<img src="' + esc(imgUrl(it.img)) + '" alt="">'
        : '<div class="nopic">?</div>';
      const tail = st === 'done'
        ? (it.status === 'kept' ? '已忍住' : '买了')
        : (st === 'due' ? '该决定了' : hm(TOTAL - e) + ' 后');
      b.innerHTML = pic +
        '<div class="ib"><div class="in">' + esc(it.name || '未命名') + '</div>' +
        '<div class="im">' + money(it.price) + ' · ' + tail + '</div>' +
        '<div class="bar"><i style="width:' + Math.round(e / TOTAL * 100) + '%;' +
        (st === 'done' ? 'background:#55595F' : '') + '"></i></div></div>';
      b.addEventListener('click', () => { state.currentId = it.id; renderCooling(); });
      list.appendChild(b);
    });

    renderDetail(items.find(i => i.id === state.currentId));
  }

  function renderDetail(it) {
    const box = $('detail');
    if (!it) { box.innerHTML = ''; return; }

    const st = statusOf(it);
    const e = elapsedOf(it);
    const cur = tempOf(it);
    const remain = TOTAL - e;

    const ringPct = st === 'done' ? 1 : Math.min(1, e / TOTAL);
    const C = 2 * Math.PI * 88;
    const arcColor = st === 'done' ? '#55595F' : (st === 'due' ? '#2ED3A3' : '#F5A524');
    const bigText = st === 'done' ? '已结束' : (st === 'due' ? '时间到' : hm(remain));

    const info = st === 'done'
      ? (it.status === 'kept' ? '你忍住了' : '你买了')
      : (st === 'due' ? '该做决定了' : '还要冷静');

    const quote = it.excuse
      ? '「' + esc(it.excuse) + '」'
      : '你当时没写理由';

    const rows = [
      { h: 0, t: '记下它 · 当时 ' + it.temp + ' 分' + (it.excuse ? '，理由是「' + it.excuse + '」' : '') },
      { h: 24, t: '第一次提醒：' + fateClause(it) },
      { h: 48, t: '温度掉到 ' + Math.round(tempOf(it, 48)) + ' 分' },
      { h: TOTAL, t: st === 'done' ? (it.status === 'kept' ? '到期 · 你选了不买' : '到期 · 你还是买了') : '到期，该做决定了' }
    ];

    let actions = '';
    if (st === 'cooling') {
      actions =
        '<div class="dt-foot"><div class="quote">你当初说 ' + quote + '</div>' +
        '<button class="ghost" id="buyNow">按住 1.2 秒 · 我现在就要买</button></div>';
    } else if (st === 'due') {
      actions =
        '<div class="dt-foot"><div class="quote">你当初说 ' + quote + '</div>' +
        '<button class="primary" id="toSettle">去结算</button></div>';
    } else {
      actions =
        '<div class="dt-foot"><div class="quote">你当初说 ' + quote + '</div>' +
        '<button class="ghost" data-go="report">看战报</button></div>';
    }

    const log =
      '<div class="log"><div class="logh">这 ' + Math.round(e) + ' 小时里发生了什么</div>' +
      rows.map(r => {
        const cls = e >= r.h ? 'done' : (r.h === TOTAL && st === 'due' ? 'now' : '');
        return '<div class="logrow ' + cls + '"><span>' + r.h + 'h</span><p>' + esc(r.t) + '</p></div>';
      }).join('') +
      '</div>';

    box.innerHTML =
      '<div class="dt-top">' +
        '<div class="ringcol">' +
          '<div class="ringbox">' +
            '<svg width="200" height="200" viewBox="0 0 200 200">' +
              '<circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="6"/>' +
              '<circle cx="100" cy="100" r="88" fill="none" stroke="' + arcColor + '" stroke-width="6" ' +
                'stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" ' +
                'stroke-dashoffset="' + (C * (1 - ringPct)).toFixed(1) + '" transform="rotate(-90 100 100)"/>' +
            '</svg>' +
            '<div class="c"><b>' + bigText + '</b><span>' + info + '</span></div>' +
          '</div>' +
          '<button class="ff" id="ffBtn" type="button">演示：快进 4 小时' +
            (state.ff ? ' · 已 +' + state.ff + 'h' : '') + '</button>' +
        '</div>' +
        '<div>' +
          '<div class="micro" style="margin-bottom:12px"><em>03</em>' +
            (st === 'due' ? '等待结算' : st === 'done' ? '已经结束' : '冷却中') + '</div>' +
          '<div class="dt-title">' + esc(it.name || '那件 ' + money(it.price) + ' 的东西') + '</div>' +
          '<div class="dt-money">' + money(it.price) + '<small>每次 ¥' + unitCost(it.price) + '</small></div>' +
          '<div class="dt-meta">' +
            '<div><span>当时想要</span><b>' + it.temp + ' / 10</b></div>' +
            '<div><span>现在温度</span><b style="color:' + (cur <= 4 ? '#2ED3A3' : '#F5A524') + '">' +
              Math.round(cur) + ' / 10 · ' + tempWord(cur) + '</b></div>' +
            '<div><span>第 30 天</span><b>' + esc(it.fate) + '</b></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="dt-curve">' +
        '<div class="h"><span>欲望温度</span><b>' + it.temp + ' 分 → ' + Math.round(cur) + ' 分</b></div>' +
        curveSVG(it, e) +
        '<div class="curve-ticks"><span>0 时</span><span>24 时</span><span>48 时</span><span>72 时</span></div>' +
      '</div>' +
      actions + log;

    // 事件
    bindGo(box);
    const ffBtn = $('ffBtn');
    if (ffBtn) ffBtn.addEventListener('click', fastForward);
    const buy = $('buyNow');
    if (buy) holdToConfirm(buy, () => {
      it.status = 'bought';
      it.settleTemp = Math.round(cur);
      persist();
      toast('记下了。战报里它会算进冷静率的分母');
      renderCooling(); renderStats();
    });
    const ts = $('toSettle');
    if (ts) ts.addEventListener('click', () => go('settle', it.id));

    maybeAsk(it);
  }

  function curveSVG(it, elapsed) {
    const W = 600, H = 90, X0 = 6, X1 = 594, Y0 = 8, Y1 = 74;
    const base = Number(it.temp);
    const px = t => X0 + (t / TOTAL) * (X1 - X0);
    const py = v => Y0 + (1 - (v - END_TEMP) / (Math.max(base, 10) - END_TEMP)) * (Y1 - Y0);
    const tempAt = t => END_TEMP + (base - END_TEMP) * Math.exp(-t / TAU);

    function path(to) {
      const n = Math.max(2, Math.round(to / 1.5));
      let d = 'M' + px(0).toFixed(1) + ',' + py(tempAt(0)).toFixed(1);
      for (let i = 1; i <= n; i++) {
        const t = to * i / n;
        d += ' L' + px(t).toFixed(1) + ',' + py(tempAt(t)).toFixed(1);
      }
      return d;
    }
    const cx = px(elapsed).toFixed(1), cy = py(tempAt(elapsed)).toFixed(1);

    return '<svg width="100%" height="90" viewBox="0 0 600 90" preserveAspectRatio="none">' +
      '<line x1="0" y1="83" x2="600" y2="83" stroke="rgba(255,255,255,.06)" stroke-width="1" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + path(TOTAL) + '" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="1.5" ' +
        'stroke-dasharray="3 5" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + path(Math.max(elapsed, 0.1)) + '" fill="none" stroke="#F5A524" stroke-width="2" ' +
        'stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#F5A524"/>' +
      '</svg>';
  }

  /* 按住确认 */
  function holdToConfirm(btn, done) {
    const label = btn.textContent;
    let timer = null, raf = null, start = 0;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    const fill = el('span');
    fill.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(245,165,36,.22);transition:none;';
    btn.appendChild(fill);

    function stop(reset) {
      clearTimeout(timer); cancelAnimationFrame(raf);
      timer = null;
      if (reset) { fill.style.width = '0'; btn.textContent = label; btn.appendChild(fill); }
    }
    btn.onpointerdown = e => {
      e.preventDefault();
      start = performance.now();
      btn.textContent = '松开会取消…';
      btn.appendChild(fill);
      const tick = () => {
        const p = Math.min(1, (performance.now() - start) / 1200);
        fill.style.width = (p * 100) + '%';
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      timer = setTimeout(() => {
        stop(false);
        btn.textContent = label;
        done();
      }, 1200);
    };
    btn.onpointerup = () => stop(true);
    btn.onpointerleave = () => { if (timer) stop(true); };
  }

  /* ---------------- 第 24 小时提醒（弹窗） ---------------- */
  let askItem = null;

  function maybeAsk(it) {
    if (!it || state.view !== 'cooling') return;
    if (statusOf(it) !== 'cooling') return;
    if (elapsedOf(it) < 24) return;
    if (it.asked24) return;
    openAsk(it);
  }

  function openAsk(it) {
    askItem = it;
    $('modalQ').textContent = fateClause(it) + '。现在还想买吗？';
    $('modalSub').textContent = '距离到期还有 ' + Math.round(TOTAL - elapsedOf(it)) + ' 小时';
    $('modal').hidden = false;
  }

  function closeAsk(answer) {
    const it = askItem;
    askItem = null;
    $('modal').hidden = true;
    if (it) { it.asked24 = true; persist(); }
    if (answer === 'no') toast('很好，那它继续待着');
    else if (answer === 'yes') toast('那就再等一会儿');
    if (answer) renderCooling();
  }

  function initAsk() {
    $('modalNo').addEventListener('click', () => closeAsk('no'));
    $('modalYes').addEventListener('click', () => closeAsk('yes'));
    $('modal').querySelectorAll('[data-close]').forEach(n =>
      n.addEventListener('click', () => closeAsk(null)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('modal').hidden) closeAsk(null);
    });
  }

  /* ---------------- 03 结算 + 砍借口 ---------------- */
  function renderSettle(id) {
    const it = state.items.find(i => i.id === id) || state.items[0];
    const view = $('v-settle');
    if (!it) { go('cooling'); return; }
    state.currentId = it.id;

    const cur = tempOf(it);
    const pic = it.img
      ? '<img src="' + esc(imgUrl(it.img)) + '" alt="">'
      : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#55595F;font-size:13px">没有图</div>';

    view.innerHTML =
      '<div class="stl">' +
        '<div class="stl-l">' +
          '<div class="micro"><em>03</em>结算</div>' +
          '<div class="stl-img">' + pic + '</div>' +
          '<div class="stl-id"><h3>' + esc(it.name || '那件东西') + '</h3><b>' + money(it.price) + '</b></div>' +
        '</div>' +
        '<div class="stl-r">' +
          '<div class="stl-kicker">72 小时到了</div>' +
          '<div class="stl-quote">' + (it.excuse ? '「' + esc(it.excuse) + '」' : '你当时没写理由。') + '</div>' +
          '<div class="stl-compare">' +
            '<div><span>你当初说它第 30 天</span><b>' + esc(it.fate) + '</b></div>' +
            '<div><span>按用 30 次算</span><b class="amber">¥' + unitCost(it.price) + ' / 次</b></div>' +
            '<div><span>当时的想要 → 现在</span><b class="teal">' + it.temp + ' → ' + Math.round(cur) + '</b></div>' +
          '</div>' +
          '<div class="verdict" id="verdict">' +
            '<div class="k">这两句话放在一起</div>' +
            '<div class="v" id="verdictText"></div>' +
            '<div class="s" id="verdictSub"></div>' +
          '</div>' +
          '<div class="stl-actions" id="stlActions">' +
            '<button class="primary" id="keepIt" disabled>算了，不买了</button>' +
            '<button class="ghost" id="stillWant" disabled>我还是想要</button>' +
            '<button class="link" id="alreadyBought">已经买了</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stl-foot">「72 小时不会让你不想要它，只会让你看清自己到底想要它的哪一部分。」</div>';

    state.stlItem = it;
    openChop(it);

    $('keepIt').addEventListener('click', () => decide('kept'));
    $('stillWant').addEventListener('click', () => decide('bought'));
    $('alreadyBought').addEventListener('click', () => decide('bought'));
  }

  function decide(kind) {
    const it = state.stlItem;
    if (!it) return;
    it.status = kind;
    it.settleTemp = Math.round(tempOf(it));
    persist();
    toast(kind === 'kept' ? '记下一笔：¥' + Number(it.price).toLocaleString('zh-CN') + ' 没花出去' : '记下了，它会进冷静率的分母');
    go('report');
  }

  function verdictFor(it, cur) {
    const fate = it.fate, ex = it.excuse;
    if (fate === '挂闲鱼') return ['你买它的那一刻，就知道会卖掉它。', '二手价通常撑不住冲动时的出价。'];
    if ((fate === '柜子里') && cur <= 4) return ['你已经替它写好结局了。', '温度从 ' + it.temp + ' 掉到 ' + Math.round(cur) + '，只有你在原地。'];
    if ((fate === '柜子里') && cur >= 8) return ['你很想买，但连你自己都不觉得它会留下。', '这不是需求，是此刻的情绪。'];
    if (fate === '天天用' && (ex === '限时折扣' || ex === '明天涨价')) return ['天天用的东西，不需要打折才买。', '折扣只是让你提前决定。'];
    if (fate === '偶尔用' && Number(it.price) > 1000) return ['「偶尔」用的东西，值 ' + money(it.price) + ' 吗？', '按 30 次算，每次 ' + unitCost(it.price) + ' 元。'];
    if (!fate && ex === '凑单') return ['为了省运费，花了更多。', ''];
    return ['想要的理由，和你写在纸上的未必是同一个。', '再等一分钟，看看这个念头还在不在。'];
  }

  /* 砍借口 */
  let chopFinishRef = null;

  function freshZone() {
    const old = $('chopzone');
    const z = document.createElement('div');
    z.id = 'chopzone';
    z.className = 'chopzone';
    const h = document.createElement('div');
    h.className = 'hint';
    h.id = 'chopHint';
    h.textContent = '按住拖动，划过它们';
    z.appendChild(h);
    old.parentNode.replaceChild(z, old);
    return z;
  }

  function openChop(it) {
    $('chopCount').textContent = '0 / 4';
    $('chopTitle').textContent = it && it.name ? '把「' + it.name + '」的理由划掉' : '把它们划掉';
    $('chopModal').hidden = false;
    mountChop(it);
  }

  function closeChop() {
    $('chopModal').hidden = true;
    if (chopFinishRef) chopFinishRef();
  }

  function initChopModal() {
    $('chopModal').querySelectorAll('[data-chop-close]').forEach(n =>
      n.addEventListener('click', closeChop));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('chopModal').hidden) closeChop();
    });
  }

  function mountChop(it) {
    const zone = freshZone();
    const fx = $('chopfx');
    const hint = $('chopHint');
    const ctx = fx.getContext('2d');

    const words = [];
    if (it.excuse) words.push(it.excuse);
    ['限时折扣', '凑单', '最后一件', '就是想'].forEach(w => { if (words.indexOf(w) < 0 && words.length < 4) words.push(w); });

    let chips = [], chopped = 0, dragging = false, pts = [], done = false;
    const TRAIL = 240;

    function size() {
      const r = zone.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      fx.width = Math.round(r.width * dpr);
      fx.height = Math.round(r.height * dpr);
      fx.style.width = r.width + 'px';
      fx.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      zone.querySelectorAll('.chip-f').forEach(n => n.remove());
      chips = []; chopped = 0; done = false; pts = [];
      size();
      const r = zone.getBoundingClientRect();
      const POS = [[0.26, 0.28], [0.72, 0.3], [0.3, 0.68], [0.7, 0.66]];
      words.forEach((w, i) => {
        const n = el('div', 'chip-f' + (i === 0 ? ' big' : ''));
        n.textContent = w;
        zone.appendChild(n);
        const cw = n.offsetWidth, ch = n.offsetHeight;
        const c = {
          n, w: cw, h: ch,
          x: Math.max(6, r.width * POS[i][0] - cw / 2),
          y: Math.max(6, r.height * POS[i][1] - ch / 2),
          vx: (Math.random() < .5 ? -1 : 1) * (0.18 + Math.random() * .14),
          vy: (Math.random() < .5 ? -1 : 1) * (0.12 + Math.random() * .1),
          alive: true
        };
        n.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
        chips.push(c);
      });
    }

    function loop() {
      if (!document.body.contains(zone)) return;
      const r = zone.getBoundingClientRect();
      chips.forEach(c => {
        if (!c.alive) return;
        c.x += c.vx; c.y += c.vy;
        if (c.x < 4) { c.x = 4; c.vx = Math.abs(c.vx); }
        if (c.x + c.w > r.width - 4) { c.x = r.width - 4 - c.w; c.vx = -Math.abs(c.vx); }
        if (c.y < 4) { c.y = 4; c.vy = Math.abs(c.vy); }
        if (c.y + c.h > r.height - 4) { c.y = r.height - 4 - c.h; c.vy = -Math.abs(c.vy); }
        c.n.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)';
      });
      drawTrail();
      requestAnimationFrame(loop);
    }

    function drawTrail() {
      const now = performance.now();
      pts = pts.filter(p => now - p.t < TRAIL);
      ctx.clearRect(0, 0, zone.clientWidth, zone.clientHeight);
      if (pts.length < 2) return;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const k = 1 - (now - b.t) / TRAIL;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(245,165,36,' + (0.9 * k).toFixed(3) + ')';
        ctx.lineWidth = 1 + 3.5 * k;
        ctx.stroke();
      }
    }

    function local(e) {
      const r = zone.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() };
    }

    function chop(c) {
      c.alive = false;
      c.n.style.visibility = 'hidden';
      const x = c.x, y = c.y, txt = c.n.textContent, big = c.n.classList.contains('big');
      c.n.remove();
      ['top', 'bot'].forEach(kind => {
        const h = el('div', 'chip-f cut' + (big ? ' big' : ''));
        h.textContent = txt;
        h.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        h.style.clipPath = kind === 'top' ? 'inset(0 0 52% 0)' : 'inset(48% 0 0 0)';
        h.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), opacity .5s';
        zone.appendChild(h);
        requestAnimationFrame(() => {
          h.style.transform = kind === 'top'
            ? 'translate(' + (x - 18) + 'px,' + (y - 40) + 'px) rotate(-10deg)'
            : 'translate(' + (x + 20) + 'px,' + (y + 52) + 'px) rotate(7deg)';
          h.style.opacity = '0';
        });
        setTimeout(() => h.remove(), 680);
      });
      chopped++;
      $('chopCount').textContent = chopped + ' / ' + chips.length;
      if (chopped >= chips.length) finish();
    }

    function finish() {
      if (done) return;
      done = true;
      hint.classList.remove('hide');
      hint.textContent = chopped >= chips.length ? (chopped + ' 条理由，全划掉了') : '先不划了，直接看结论';
      const cur = tempOf(it);
      const v = verdictFor(it, cur);
      $('verdictText').textContent = v[0];
      $('verdictSub').textContent = v[1] || '';
      setTimeout(() => {
        $('verdict').classList.add('on');
        $('keepIt').disabled = false;
        $('stillWant').disabled = false;
      }, 320);
      setTimeout(() => { $('chopModal').hidden = true; }, 620);
    }
    chopFinishRef = finish;

    zone.addEventListener('pointerdown', e => {
      dragging = true;
      hint.classList.add('hide');
      pts = [local(e)];
      if (zone.setPointerCapture) zone.setPointerCapture(e.pointerId);
    });
    zone.addEventListener('pointermove', e => {
      if (!dragging) return;
      const p = local(e);
      const last = pts[pts.length - 1];
      if (last) {
        for (let i = 0; i <= 8; i++) {
          const x = last.x + (p.x - last.x) * i / 8;
          const y = last.y + (p.y - last.y) * i / 8;
          chips.forEach(c => {
            if (c.alive && x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) chop(c);
          });
        }
      }
      pts.push(p);
      if (pts.length > 40) pts.shift();
    });
    const up = () => { dragging = false; };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);

    build();
    loop();
  }

  /* ---------------- 04 战报 ---------------- */
  function renderReport() {
    const s = summarize();
    $('repHold').textContent = money(s.hold);
    $('repLede').textContent = s.items.length
      ? '从 ' + s.items.length + ' 件想买的东西里，你认真考虑完 ' + s.settled + ' 件。剩下的还在冷静。'
      : '还没有记录。先去记一笔，72 小时后回来收账。';

    $('repStats').innerHTML =
      '<div><span>锁进冷静舱</span><b>' + s.items.length + ' 件</b></div>' +
      '<div><span>真的没买</span><b style="color:#2ED3A3">' + s.kept.length + ' 件</b></div>' +
      '<div><span>冷静率</span><b>' + (s.rate == null ? '—' : s.rate + '%') + '</b></div>';

    $('repItems').innerHTML = s.items.length
      ? s.items.map(it => {
          const cls = it.status === 'kept' ? 'kept' : it.status === 'bought' ? 'bought' : '';
          const tag = it.status === 'kept' ? '忍住' : it.status === 'bought' ? '买了' : '冷静中';
          const pic = it.img ? '<img src="' + esc(imgUrl(it.img)) + '" alt="">' : '<div class="nopic">?</div>';
          return '<div class="repitem">' + pic +
            '<div class="rb"><div class="rn">' + esc(it.name || '那件 ' + money(it.price) + ' 的东西') + '</div>' +
            '<div class="rd">' + esc(it.fate) + ' · ' + tag + '</div></div>' +
            '<div class="rp ' + cls + '">' + money(it.price) + '</div></div>';
        }).join('')
      : '<div class="repitem" style="color:#55595F;font-size:12px">还没有记录</div>';

    drawPoster(s);
    $('exportBtn').onclick = () => {
      const c = $('poster');
      const a = document.createElement('a');
      a.download = '剁手冷静期-战报.png';
      a.href = c.toDataURL('image/png');
      a.click();
      toast('图片已保存');
    };
  }

  function drawPoster(s) {
    const c = $('poster');
    const g = c.getContext('2d');
    const W = c.width, H = c.height;
    const SANS = '"PingFang SC","Microsoft YaHei",sans-serif';
    const SERIF = '"Songti SC","Source Han Serif SC",serif';

    g.fillStyle = '#0B0D11';
    g.fillRect(0, 0, W, H);

    // 顶部标记
    g.fillStyle = '#F5A524';
    g.fillRect(80, 96, 44, 44);
    g.fillStyle = '#1A1200';
    g.font = '500 26px ' + SANS;
    g.textBaseline = 'middle';
    g.fillText('剁', 92, 119);

    g.fillStyle = '#ECEDEF';
    g.font = '500 30px ' + SANS;
    g.textBaseline = 'alphabetic';
    g.fillText('剁手冷静期', 146, 118);
    g.fillStyle = '#55595F';
    g.font = '400 20px ' + SANS;
    g.fillText('冷静报告', 146, 148);

    // 大数字
    g.fillStyle = '#55595F';
    g.font = '400 22px ' + SANS;
    g.fillText('我按住了', 80, 300);

    g.fillStyle = '#2ED3A3';
    g.font = '500 128px ' + SANS;
    g.fillText('¥' + Number(s.hold || 0).toLocaleString('zh-CN'), 74, 420);

    // 分割线
    g.strokeStyle = 'rgba(255,255,255,.1)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(80, 490); g.lineTo(W - 80, 490); g.stroke();

    // 三个统计
    const cols = [
      ['锁进冷静舱', s.items.length + ' 件'],
      ['真的没买', s.kept.length + ' 件'],
      ['冷静率', (s.rate == null ? '—' : s.rate + '%')]
    ];
    cols.forEach((col, i) => {
      const x = 80 + i * 253;
      g.fillStyle = '#55595F';
      g.font = '400 20px ' + SANS;
      g.fillText(col[0], x, 546);
      g.fillStyle = i === 1 ? '#2ED3A3' : '#ECEDEF';
      g.font = '500 40px ' + SANS;
      g.fillText(col[1], x, 596);
    });

    // 最惊险的一件
    const scariest = s.items.slice().sort((a, b) => Number(b.price) - Number(a.price))[0];
    if (scariest) {
      g.fillStyle = '#55595F';
      g.font = '400 20px ' + SANS;
      g.fillText('最惊险的一件', 80, 700);
      g.fillStyle = '#ECEDEF';
      g.font = '400 28px ' + SERIF;
      g.fillText((scariest.name || '那件东西') + ' · ¥' + Number(scariest.price).toLocaleString('zh-CN'), 80, 748);
      if (scariest.excuse) {
        g.fillStyle = '#8A8F99';
        g.font = '400 24px ' + SERIF;
        g.fillText('当初的理由：「' + scariest.excuse + '」', 80, 794);
      }
    }

    // 一句收尾
    g.strokeStyle = 'rgba(255,255,255,.07)';
    g.lineWidth = 1;
    g.beginPath(); g.moveTo(80, 860); g.lineTo(W - 80, 860); g.stroke();

    g.fillStyle = '#6B7078';
    g.font = '400 26px ' + SERIF;
    g.fillText('你没有变得不想买，你只是多等了 72 小时。', 80, 918);

    // 底部
    g.fillStyle = '#7A7F88';
    g.font = '400 20px ' + SANS;
    g.fillText('冲动是热的，冷却不用你管。', 80, H - 190);

    g.fillStyle = '#6B7078';
    g.font = '400 20px ' + SANS;
    g.fillText('#剁手冷静期', 80, H - 120);

    const d = new Date();
    g.fillStyle = '#4A4E57';
    g.font = '400 18px ' + SANS;
    g.fillText(d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0'), W - 220, H - 120);
  }

  /* ---------------- 演示：放 3 件进来 ---------------- */
  function seedDemo() {
    state.items = demoItems();
    state.currentId = 'd1';
    persist();
    renderCooling();
    renderStats();
    toast('已放入 3 件演示记录 · 数据保存在云端');
  }

  /* ---------------- 演示：快进 4 小时 ---------------- */
  function fastForward() {
    if (!state.items.length) {
      seedDemo();
      return;
    }

    const cur = state.items.find(i => i.id === state.currentId) || state.items[0];
    if (cur && statusOf(cur) !== 'cooling') {
      toast('这件已经到期了，点右边的「去结算」');
      return;
    }

    state.ff += 4;
    persist();
    renderCooling();
    renderStats();
    setTimeout(() => toast('快进 4 小时 · 现在是 T+' + state.ff + 'h'), 60);
  }

  /* ---------------- DEV 重置 ---------------- */
  function initDevReset() {
    const b = $('devReset');
    if (!b) return;
    let armed = false, tm = null;

    b.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        b.classList.add('arm');
        b.textContent = '再点一次 · 清空所有记录';
        tm = setTimeout(() => {
          armed = false;
          b.classList.remove('arm');
          b.textContent = 'DEV · 重置数据';
        }, 3200);
        return;
      }
      clearTimeout(tm);
      state.items = []; state.ff = 0; state.currentId = null; persist(); renderStats(); go('record'); toast('已清空记录');
    });
  }

  /* ---------------- 导航绑定 ---------------- */
  function bindGo(root) {
    (root || document).querySelectorAll('[data-go]').forEach(b => {
      if (b._go) return;
      b._go = true;
      b.addEventListener('click', () => go(b.dataset.go));
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    state.items = loadStore();
    state.currentId = state.items[0] ? state.items[0].id : null;
    initRecord();
    initAsk();
    initChopModal();
    initDevReset();
    bindGo(document);
    renderStats();
    go('record');
  }

  boot();
}
