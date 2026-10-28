
    // 默认数据：基于用户 2026-08-13 配置
    // __DATA_START__（保存到源文件时此区块会被最新数据覆盖，勿手动改行）
    const defaultData = {
      __v: 1791520132481,
      budget: 7500,
      components: [
        {"id":"ex_cpu","category":"CPU","name":"示例 CPU（如 i5-12600KF）","model":"盒装 / 10核","price":1601,"owned":false,"platform":"京东","note":"示例行：按你的实际型号替换。锁价前多查几个渠道比价。","alternative":{"name":"示例 竞品 CPU","price":1739,"saving":-138,"reason":"示例替代，按需填写","rating":"4.5"}},
        {"id":"ex_mb","category":"主板","name":"示例 B760M 主板","model":"M-ATX / DDR4","price":729,"owned":false,"platform":"京东","note":"示例行：确认接口与机箱尺寸匹配。","alternative":null},
        {"id":"ex_gpu","category":"显卡","name":"示例 显卡（如 RX 9060 XT 16G）","model":"双风扇 / 16G","price":3299,"owned":false,"platform":"电商","note":"示例行：大显存更耐未来；下单前核对最新渠道价。","alternative":{"name":"示例 竞品显卡","price":3979,"saving":-830,"reason":"示例替代","rating":"4.5"}},
        {"id":"ex_ram","category":"内存","name":"示例 DDR4 32G","model":"2×16G 双通道","price":1046,"owned":false,"platform":"京东","note":"示例行：双通道优于单条。","alternative":null},
        {"id":"ex_psu","category":"电源","name":"示例 650W 金牌","model":"ATX3.1 / 全模组","price":340,"owned":false,"platform":"京东","note":"示例行：足额大牌，保命件不省。","alternative":null},
        {"id":"ex_case","category":"机箱","name":"示例 M-ATX 机箱","model":"网孔散热版","price":148,"owned":false,"platform":"京东","note":"示例行：网孔版散热优于海景房。","alternative":null},
        {"id":"ex_fan","category":"机箱风扇","name":"示例 机箱风扇 ×3","model":"前2进风 + 后1出风","price":45.9,"owned":false,"platform":"京东","note":"示例行：网孔机箱通常0自带风扇，需补3把建风道（前板2进+后板1出）；参考价利民TL-C12CX3三联包；与CPU散热器同品牌一致；走主板1分3 PWM物理分线勿用杂牌集线器。","alternative":{"name":"示例 静压扇 ×3","price":165,"saving":-119.1,"reason":"风量更大更静，小箱普通扇已够","rating":"4.7"}},
        {"id":"ex_mon","category":"显示器","name":"示例 27寸 高刷显示器","model":"AH-IPS / 240Hz","price":800,"owned":false,"platform":"电商","note":"示例行：电竞选高刷，设计选广色域。","alternative":null},
        {"id":"ex_acc","category":"其他","name":"示例 装机杂项（常被漏买）","model":"显示线/分线/系统盘","price":115,"owned":false,"platform":"京东","note":"示例行：装机最易漏的小件——① 二手/洋垃圾屏常不配显示线，需自购 DP1.4 或 HDMI2.0（高刷屏必须）；② 多风扇需 1分3 PWM 物理分线（勿用杂牌集线器烧主板口）；③ 新机需 Windows 安装盘+激活（OEM 密钥不可迁移）。下单前对照此三项。","alternative":null}
      ]
    };
    // __DATA_END__

    // 加载本地数据
    let appData = loadData();
    let currentSection = 'overview';

    function loadData() {
      try {
        const saved = localStorage.getItem('pc_build_list_v1');
        if (saved) {
          const data = JSON.parse(saved);
          delete data.userName; // 清理历史遗留的个人信息字段
          // 版本比较：defaultData 更新（__v 更大）时以源文件数据为准，覆盖旧 localStorage
          if (!data.__v || data.__v < (defaultData.__v || 0)) {
            return JSON.parse(JSON.stringify(defaultData));
          }
          return data;
        }
      } catch (e) {}
      return JSON.parse(JSON.stringify(defaultData));
    }

    function saveData() {
      localStorage.setItem('pc_build_list_v1', JSON.stringify(appData));
      const now = new Date();
      document.getElementById('last-save').textContent = '自动保存：' + now.toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
      showToast('已自动保存');
    }

    function debounce(fn, ms) {
      let t;
      return function() {
        clearTimeout(t);
        t = setTimeout(fn, ms);
      };
    }

    const autoSave = debounce(saveData, 600);

    const TEMPLATE_SEED = JSON.parse(JSON.stringify(defaultData.components));

    async function standaloneHTML() {
      const base = window.__standaloneAssetBase;
      const [css, js] = await Promise.all([fetch(base + 'app.css').then(r => r.text()), fetch(base + 'logic.js').then(r => r.text())]);
      const body = window.__standaloneBody.replaceAll('__SSD_URL__', window.__standaloneBase);
      return '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style></head><body>' + body + '<scr' + 'ipt>' + js + '</scr' + 'ipt></body></html>';
    }
    // 下载一份干净模板副本（示例数据，供他人本地使用）
    async function downloadTemplateCopy() {
      appData.__v = Date.now();
      const jsonStr = JSON.stringify(Object.assign({}, appData, { components: JSON.parse(JSON.stringify(TEMPLATE_SEED)) }), null, 2);
      let html = window.__standaloneBody ? await standaloneHTML() : '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const re = /(\/\/\s*__DATA_START__[\s\S]*?\/\/\s*__DATA_END__)/;
      if (!re.test(html)) { showToast('未找到数据标记，下载失败'); return; }
      const newBlock = '// __DATA_START__\n    const defaultData = ' + jsonStr + ';\n    // __DATA_END__';
      html = html.replace(re, newBlock);
      downloadFile(html, '装机购物单工作台.html', 'text/html;charset=utf-8');
      showToast('已下载干净模板副本（含示例数据）');
    }


    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function showSection(id, el) {
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      document.querySelectorAll('.nav-list a').forEach(a => a.classList.remove('active'));
      if (el) el.classList.add('active');
      currentSection = id;
      revealActive();
      if (id === 'overview' || id === 'charts') {
        requestAnimationFrame(() => { drawAllCharts(); });
      }
    }

    // 主题自适应取色（供 canvas 图表使用）
    function themeColors() {
      const cs = getComputedStyle(document.documentElement);
      const g = k => (cs.getPropertyValue(k) || '').trim();
      return {
        text: g('--text') || '#2c2c2c',
        textMuted: g('--text-muted') || '#6e6e6e',
        card: g('--bg-card') || '#fffdf7',
        border: g('--border') || '#e0d8c8',
        emerald: g('--emerald') || '#2d7a5e',
        orange: g('--orange') || '#f5a623',
        purple: g('--purple') || '#8b5cf6'
      };
    }

    // 滚动进度条
    function onScrollProgress() {
      const el = document.getElementById('scroll-progress');
      if (!el) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? (window.scrollY / h) * 100 : 0;
      el.style.width = Math.max(0, Math.min(100, p)) + '%';
    }

    // 暗色仪表盘开关
    function toggleDark() {
      const on = document.getElementById('dark-toggle').checked;
      document.body.classList.toggle('dark-dashboard', on);
      if (!appData.theme) appData.theme = {};
      appData.theme.dark = on;
      autoSave();
      drawAllCharts();
    }

    // 入场动画：当前 section 内的 .reveal 逐级上浮
    function revealActive() {
      const sec = document.getElementById(currentSection);
      if (!sec) return;
      sec.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.animationDelay = (i * 0.09) + 's';
        el.classList.add('in');
      });
    }

    // 攒机节奏时间线：IntersectionObserver 错峰淡入
    function setupTimeline() {
      const items = document.querySelectorAll('.tl-item');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) {
        items.forEach(el => el.classList.add('in'));
        return;
      }
      const io = new IntersectionObserver((ents) => {
        ents.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      items.forEach((el, i) => { el.style.animationDelay = (i * 0.12) + 's'; io.observe(el); });
    }

    // 预算消耗曲线：内联 SVG + 渐变面积 + 路径绘制动画 + hover tooltip
    const SPEND = [
      { m: '已购基准', v: 1506 },
      { m: '8月', v: 4655 },
      { m: '9月', v: 6256 },
      { m: '11月', v: 7572 }
    ];
    function buildSpendCurve() {
      const svg = document.getElementById('spendCurve');
      if (!svg) return;
      const C = themeColors();
      const W = 600, H = 260, pl = 46, pr = 18, pt = 24, pb = 40;
      const cw = W - pl - pr, ch = H - pt - pb;
      const maxV = 8000;
      const xs = i => pl + (cw * i) / (SPEND.length - 1);
      const ys = v => pt + ch * (1 - v / maxV);
      let line = '';
      SPEND.forEach((p, i) => { line += (i === 0 ? 'M' : 'L') + ` ${xs(i).toFixed(1)} ${ys(p.v).toFixed(1)} `; });
      const area = `M ${xs(0).toFixed(1)} ${ys(SPEND[0].v).toFixed(1)} ` +
        SPEND.map((p, i) => `L ${xs(i).toFixed(1)} ${ys(p.v).toFixed(1)}`).join(' ') +
        ` L ${xs(SPEND.length - 1).toFixed(1)} ${pt + ch} Z`;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dots = SPEND.map((p, i) => `<circle cx="${xs(i).toFixed(1)}" cy="${ys(p.v).toFixed(1)}" r="5" fill="${C.card}" stroke="${C.orange}" stroke-width="3"></circle>`).join('');
      const xLabels = SPEND.map((p, i) => `<text x="${xs(i).toFixed(1)}" y="${pt + ch + 18}" fill="${C.textMuted}" font-size="12" text-anchor="middle">${p.m}</text>`).join('');
      const vLabels = SPEND.map((p, i) => `<text x="${xs(i).toFixed(1)}" y="${(ys(p.v) - 12).toFixed(1)}" fill="${C.text}" font-size="11" text-anchor="middle">¥${p.v.toLocaleString()}</text>`).join('');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.innerHTML = `
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${C.purple}"/><stop offset="100%" stop-color="${C.orange}"/>
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${C.purple}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${C.orange}" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <line x1="${pl}" y1="${pt + ch}" x2="${W - pr}" y2="${pt + ch}" stroke="${C.border}" stroke-width="1"/>
        <line x1="${pl}" y1="${pt}" x2="${pl}" y2="${pt + ch}" stroke="${C.border}" stroke-width="1"/>
        <path d="${area}" fill="url(#areaGrad)"/>
        <path id="spendLine" d="${line}" fill="none" stroke="url(#lineGrad)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
        ${xLabels}
        ${vLabels}
      `;
      const path = svg.querySelector('#spendLine');
      if (path && !reduce) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        requestAnimationFrame(() => {
          path.style.transition = 'stroke-dashoffset 1.4s ease';
          path.style.strokeDashoffset = 0;
        });
      }
      const tip = document.getElementById('spendTip');
      svg.onmousemove = (e) => {
        const r = svg.getBoundingClientRect();
        const relX = (e.clientX - r.left) / r.width * W;
        let best = 0, bd = 1e9;
        SPEND.forEach((p, i) => { const d = Math.abs(xs(i) - relX); if (d < bd) { bd = d; best = i; } });
        const p = SPEND[best];
        tip.innerHTML = `<b>${p.m}</b><br>累计已花 ¥${p.v.toLocaleString()}`;
        tip.style.left = (xs(best) / W * r.width) + 'px';
        tip.style.top = (ys(p.v) / H * r.height - 8) + 'px';
        tip.classList.add('show');
      };
      svg.onmouseleave = () => tip.classList.remove('show');
    }

    // 计算汇总
    function getSummary() {
      const total = appData.components.reduce((s, c) => s + (Number(c.price) || 0), 0);
      const ownedTotal = appData.components.filter(c => c.owned).reduce((s, c) => s + (Number(c.price) || 0), 0);
      const remaining = total - ownedTotal;
      const ownedCount = appData.components.filter(c => c.owned).length;
      const progress = Math.min(100, Math.round((total / appData.budget) * 100));
      return { total, ownedTotal, remaining, ownedCount, progress };
    }

    function updateDashboard() {
      const s = getSummary();
      document.getElementById('stat-total').textContent = '¥' + s.total.toLocaleString();
      document.getElementById('stat-remaining').textContent = '¥' + s.remaining.toLocaleString();
      document.getElementById('stat-owned').textContent = s.ownedCount;
      document.getElementById('stat-progress').textContent = s.progress + '%';
      document.querySelector('.badge.owned').textContent = '已买 ' + s.ownedCount + ' 件';
      document.querySelector('.badge.budget').textContent = '总预算 ¥' + appData.budget.toLocaleString();
    }

    // 渲染表格
    function renderTable() {
      const tbody = document.getElementById('table-body');
      const kw = (document.getElementById('search-input')?.value || '').toLowerCase();
      const filtered = appData.components.filter(c =>
        c.name.toLowerCase().includes(kw) ||
        c.model.toLowerCase().includes(kw) ||
        c.category.toLowerCase().includes(kw)
      );

      tbody.innerHTML = filtered.map(c => {
        const altHtml = c.alternative ? `
          <div class="alt-box">
            <strong>替代推荐：</strong>${c.alternative.name} ¥${c.alternative.price.toLocaleString()}
            <span style="color:var(--emerald); font-weight:700;">省 ¥${Math.abs(c.alternative.saving)}</span><br>
            <span style="color:var(--text-muted);">${c.alternative.reason} · 好评 ${c.alternative.rating}</span>
          </div>
        ` : '';
        return `
          <tr class="${c.owned ? 'owned' : ''}" data-id="${c.id}">
            <td><input type="checkbox" ${c.owned ? 'checked' : ''} data-change="toggleOwned('${c.id}')"></td>
            <td>
              <div class="component-name">${c.name} ${c.owned ? '<span class="owned-tag">✓ 已买</span>' : ''}</div>
              <div class="component-model">${c.model}</div>
            </td>
            <td class="price"><input type="number" class="num-input" value="${c.price}" data-change="updatePrice('${c.id}', this.value)"></td>
            <td><span class="platform-tag">${c.platform}</span></td>
            <td>
              <textarea class="note-input" rows="2" data-change="updateNote('${c.id}', this.value)">${c.note || ''}</textarea>
              ${altHtml}
            </td>
            <td>
              <div class="row-actions">
                <button class="sm ghost" data-click="openEditor('${c.id}')">编辑</button>
                <button class="sm danger" data-click="deleteComponent('${c.id}')">删除</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
      updateDashboard();
      drawAllCharts();
      renderRatioTable();
      renderAltTable();
    }

    function toggleOwned(id) {
      const c = appData.components.find(x => x.id === id);
      if (c) { c.owned = !c.owned; autoSave(); renderTable(); }
    }

    function updatePrice(id, val) {
      const c = appData.components.find(x => x.id === id);
      if (c) { c.price = parseFloat(val) || 0; autoSave(); renderTable(); }
    }

    function updateNote(id, val) {
      const c = appData.components.find(x => x.id === id);
      if (c) { c.note = val; autoSave(); }
    }

    // ---- 配件新增 / 编辑 / 删除 ----
    let editingId = null;

    function genId() {
      return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function openEditor(id) {
      editingId = id;
      const c = id ? appData.components.find(x => x.id === id) : null;
      document.getElementById('editor-title').textContent = c ? '编辑配件' : '新增配件';
      document.getElementById('ed-category').value = c ? c.category : '';
      document.getElementById('ed-name').value = c ? c.name : '';
      document.getElementById('ed-model').value = c ? c.model : '';
      document.getElementById('ed-price').value = c ? c.price : '';
      document.getElementById('ed-platform').value = c ? c.platform : '';
      document.getElementById('ed-note').value = c ? (c.note || '') : '';
      document.getElementById('ed-owned').checked = c ? !!c.owned : false;
      const alt = c ? c.alternative : null;
      document.getElementById('ed-alt-name').value = alt ? alt.name : '';
      document.getElementById('ed-alt-price').value = alt ? alt.price : '';
      document.getElementById('ed-alt-reason').value = alt ? alt.reason : '';
      document.getElementById('editor-mask').classList.add('show');
    }

    function closeEditor() {
      document.getElementById('editor-mask').classList.remove('show');
      editingId = null;
    }

    function saveEditor() {
      const category = document.getElementById('ed-category').value.trim() || '其他';
      const name = document.getElementById('ed-name').value.trim();
      if (!name) { showToast('请填写配件名称'); return; }
      const price = parseFloat(document.getElementById('ed-price').value) || 0;
      const model = document.getElementById('ed-model').value.trim();
      const platform = document.getElementById('ed-platform').value.trim() || '待定';
      const note = document.getElementById('ed-note').value.trim();
      const owned = document.getElementById('ed-owned').checked;
      const altName = document.getElementById('ed-alt-name').value.trim();
      const altPrice = parseFloat(document.getElementById('ed-alt-price').value) || 0;
      const altReason = document.getElementById('ed-alt-reason').value.trim();
      const alternative = altName
        ? { name: altName, price: altPrice, saving: price - altPrice, reason: altReason, rating: '4.5' }
        : null;

      if (editingId) {
        const c = appData.components.find(x => x.id === editingId);
        if (c) Object.assign(c, { category, name, model, price, owned, platform, note, alternative });
      } else {
        appData.components.push({ id: genId(), category, name, model, price, owned, platform, note, alternative });
      }
      autoSave();
      closeEditor();
      // 切到购物清单并刷新
      const navEl = document.querySelector('.nav-list a[data-target="list"]') || null;
      if (typeof showSection === 'function') showSection('list', navEl);
      renderTable();
      showToast(editingId ? '已更新配件' : '已新增配件');
    }

    function deleteComponent(id) {
      const c = appData.components.find(x => x.id === id);
      if (!c) return;
      if (!confirm('确认删除「' + c.name + '」？此操作不可撤销。')) return;
      appData.components = appData.components.filter(x => x.id !== id);
      autoSave();
      renderTable();
      showToast('已删除配件');
    }

    // Canvas 图表
    function setupCanvas(id, ratio = 2) {
      const canvas = document.getElementById(id);
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);
      return { canvas, ctx, w: rect.width, h: rect.height };
    }

    function drawPieChart() {
      const { ctx, w, h } = setupCanvas('pieChart');
      const C = themeColors();
      const items = appData.components.filter(c => !c.owned && c.price > 0);
      const total = items.reduce((s, c) => s + c.price, 0);
      if (!total) { ctx.fillText('暂无未购配件', w/2 - 30, h/2); return; }

      const colors = ['#2d7a5e','#e8890c','#4aa383','#f5a623','#2274a5','#d95d39','#6b5b95','#88b04b','#f7cac9','#92a8d1'];
      const cx = w / 2, cy = h / 2, r = Math.max(0, Math.min(w, h) / 2 - 40);
      let start = -Math.PI / 2;

      items.forEach((c, i) => {
        const ang = (c.price / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + ang);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        // 标签
        const mid = start + ang / 2;
        const lx = cx + Math.cos(mid) * (r + 24);
        const ly = cy + Math.sin(mid) * (r + 24);
        ctx.fillStyle = C.text;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(c.category, lx, ly);
        ctx.fillText('¥' + c.price, lx, ly + 14);
        start += ang;
      });

      // 中心洞
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = C.card;
      ctx.fill();
      ctx.fillStyle = C.emerald;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('剩余预算', cx, cy - 6);
      ctx.fillText('¥' + total.toLocaleString(), cx, cy + 14);
    }

    function drawBarChart() {
      const { ctx, w, h } = setupCanvas('barChart');
      const C = themeColors();
      const items = appData.components.filter(c => c.price > 0);
      const max = Math.max(...items.map(c => c.price), 1);
      const padding = { top: 30, right: 20, bottom: 60, left: 50 };
      const chartW = w - padding.left - padding.right;
      const chartH = h - padding.top - padding.bottom;
      const barW = Math.min(40, chartW / items.length - 10);

      // 轴线
      ctx.strokeStyle = C.border;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, h - padding.bottom);
      ctx.lineTo(w - padding.right, h - padding.bottom);
      ctx.stroke();

      items.forEach((c, i) => {
        const x = padding.left + 10 + i * (chartW / items.length) + (chartW / items.length - barW) / 2;
        const bh = (c.price / max) * chartH;
        const y = h - padding.bottom - bh;
        ctx.fillStyle = c.owned ? C.emerald : C.orange;
        ctx.fillRect(x, y, barW, bh);

        ctx.fillStyle = C.text;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('¥' + c.price, x + barW/2, y - 6);

        ctx.save();
        ctx.translate(x + barW/2, h - padding.bottom + 14);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(c.category, 0, 0);
        ctx.restore();
      });
    }

    function drawDetailPieChart() {
      const canvas = document.getElementById('detailPieChart');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const items = appData.components.filter(c => c.price > 0);
      const total = items.reduce((s, c) => s + c.price, 0);
      const cx = rect.width / 2, cy = rect.height / 2 - 10;
      const r = Math.max(0, Math.min(rect.width, rect.height) / 2 - 50);
      const colors = ['#2d7a5e','#e8890c','#4aa383','#f5a623','#2274a5','#d95d39','#6b5b95','#88b04b','#f7cac9','#92a8d1','#955251','#b565a7'];
      let start = -Math.PI / 2;

      items.forEach((c, i) => {
        const ang = (c.price / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, start, start + ang);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#fffdf7';
        ctx.stroke();

        const pct = ((c.price / total) * 100).toFixed(1) + '%';
        const mid = start + ang / 2;
        const tx = cx + Math.cos(mid) * (r * 0.7);
        const ty = cy + Math.sin(mid) * (r * 0.7);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pct, tx, ty);
        start += ang;
      });

      // 图例
      let ly = 18;
      const lw = rect.width / 2 + r + 30;
      items.forEach((c, i) => {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(lw, ly, 12, 12);
        ctx.fillStyle = '#2c2c2c';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(c.category + ' ¥' + c.price.toLocaleString(), lw + 18, ly + 10);
        ly += 22;
      });
    }

    function drawAltBarChart() {
      const canvas = document.getElementById('altBarChart');
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const items = appData.components.filter(c => c.alternative && c.price > 0 && c.alternative.price > 0);
      const pairs = items.map(c => [c.price, c.alternative.price]);
      const max = Math.max(...pairs.flat(), 1);
      const padding = { top: 30, right: 20, bottom: 60, left: 50 };
      const chartW = rect.width - padding.left - padding.right;
      const chartH = rect.height - padding.top - padding.bottom;
      const groupW = chartW / items.length;
      const barW = Math.min(24, groupW / 3);

      // 轴线
      ctx.strokeStyle = '#e0d8c8';
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, rect.height - padding.bottom);
      ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom);
      ctx.stroke();

      // 图例
      ctx.fillStyle = '#e8890c'; ctx.fillRect(padding.left, 10, 12, 12);
      ctx.fillStyle = '#2c2c2c'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('当前选择', padding.left + 18, 20);
      ctx.fillStyle = '#2d7a5e'; ctx.fillRect(padding.left + 90, 10, 12, 12);
      ctx.fillStyle = '#2c2c2c'; ctx.fillText('替代方案', padding.left + 108, 20);

      items.forEach((c, i) => {
        const x = padding.left + i * groupW + groupW / 2 - barW;
        const h1 = (c.price / max) * chartH;
        const h2 = (c.alternative.price / max) * chartH;
        const y1 = rect.height - padding.bottom - h1;
        const y2 = rect.height - padding.bottom - h2;

        ctx.fillStyle = '#e8890c'; ctx.fillRect(x - barW/2, y1, barW, h1);
        ctx.fillStyle = '#2d7a5e'; ctx.fillRect(x + barW/2, y2, barW, h2);

        ctx.fillStyle = '#2c2c2c'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('¥' + c.price, x, y1 - 4);
        ctx.fillText('¥' + c.alternative.price, x + barW, y2 - 4);

        ctx.save();
        ctx.translate(x + barW/2, rect.height - padding.bottom + 14);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(c.category, 0, 0);
        ctx.restore();
      });
    }

    function drawAllCharts() {
      drawPieChart();
      drawBarChart();
      buildSpendCurve();
    }

    // 占比表：从 appData 动态生成（price>0 的配件按价降序）
    function renderRatioTable() {
      const tbody = document.getElementById('ratioTableBody');
      const foot = document.getElementById('ratioTableFoot');
      const note = document.getElementById('ratioNote');
      if (!tbody) return;
      const items = appData.components.filter(c => Number(c.price) > 0).sort((a, b) => b.price - a.price);
      const total = items.reduce((s, c) => s + Number(c.price), 0);
      if (!total) { tbody.innerHTML = ''; if (foot) foot.innerHTML = ''; if (note) note.textContent = ''; return; }
      tbody.innerHTML = items.map(c => {
        const pct = c.price / total * 100;
        const label = (c.category + ' ' + (c.name.split(' ')[0] || '')).trim();
        return `<tr><td class="component-name">${esc(label)}</td><td class="price">¥${c.price.toLocaleString()}</td><td class="price">${pct.toFixed(1)}%</td><td><div style="height:14px;border-radius:7px;background:linear-gradient(90deg,#e8890c,#2d7a5e);width:${pct.toFixed(1)}%;"></div></td></tr>`;
      }).join('');
      if (foot) foot.innerHTML = `<tr><td><strong>合计（实价配件）</strong></td><td class="price"><strong>¥${total.toLocaleString()}</strong></td><td class="price"><strong>100%</strong></td><td></td></tr>`;
      const top = items[0];
      const topPct = (top.price / total * 100).toFixed(1);
      if (note) note.textContent = `基数为已纳入清单的实价配件合计 ¥${total.toLocaleString()}（不含已复用/套装内含的零价散件）。${top.category}一项独占 ${topPct}%，是装机最大头支出。`;
    }

    // 替代表：从 appData.alternative 动态生成（仅有 alternative 的配件）
    function renderAltTable() {
      const tbody = document.getElementById('altTableBody');
      const note = document.getElementById('altNote');
      if (!tbody) return;
      const items = appData.components.filter(c => c.alternative && Number(c.price) > 0);
      if (!items.length) { tbody.innerHTML = ''; if (note) note.textContent = ''; return; }
      tbody.innerHTML = items.map(c => {
        const a = c.alternative;
        const isSave = a.saving > 0;
        const diffTxt = isSave ? `省¥${a.saving}` : `贵¥${Math.abs(a.saving)}`;
        const altColor = isSave ? 'var(--emerald)' : '#d95d39';
        return `<tr><td class="component-name">${esc(c.category)}</td><td class="price" style="color:#e8890c;">¥${c.price.toLocaleString()}</td><td class="price" style="color:${altColor};">¥${a.price.toLocaleString()}<br><span style="font-size:11px;color:var(--text-muted);">${esc(a.name)}</span></td><td class="price" style="color:${altColor};">${diffTxt}</td><td class="component-model">${esc(a.reason)}</td></tr>`;
      }).join('');
      if (note) note.textContent = '橙色=当前选择，绿色=更便宜替代（省¥X），红色=更贵替代。仅展示存在可替代方案的配件。';
    }

    // 保存到源文件：把当前 appData 写回 HTML 的 defaultData 区块，下载覆盖
    async function saveToSourceFile() {
      appData.__v = Date.now();
      saveData();
      const jsonStr = JSON.stringify(appData, null, 2);
      let html = window.__standaloneBody ? await standaloneHTML() : '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
      const re = /(\/\/\s*__DATA_START__[\s\S]*?\/\/\s*__DATA_END__)/;
      if (!re.test(html)) { showToast('未找到数据标记，保存失败'); return; }
      const newBlock = '// __DATA_START__\n    const defaultData = ' + jsonStr + ';\n    // __DATA_END__';
      html = html.replace(re, newBlock);
      downloadFile(html, '装机购物单工作台.html', 'text/html;charset=utf-8');
      showToast('已生成新版HTML，请用下载的文件覆盖源文件');
    }

    // 导出
    function exportCSV() {
      const rows = [['配件','型号','价格','已拥有','平台','备注']];
      appData.components.forEach(c => {
        rows.push([c.category, c.name + ' ' + c.model, c.price, c.owned ? '是' : '否', c.platform, (c.note || '').replace(/\n/g, ' ')]);
      });
      const csv = '\uFEFF' + rows.map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
      downloadFile(csv, '装机购物清单.csv', 'text/csv;charset=utf-8;');
    }

    function exportExcel() {
      let html = '<table border="1"><tr><th>配件</th><th>型号</th><th>价格</th><th>已拥有</th><th>平台</th><th>备注</th></tr>';
      appData.components.forEach(c => {
        html += `<tr><td>${esc(c.category)}</td><td>${esc(c.name + ' ' + c.model)}</td><td>${c.price}</td><td>${c.owned?'是':'否'}</td><td>${esc(c.platform)}</td><td>${esc(c.note||'')}</td></tr>`;
      });
      html += '</table>';
      downloadFile(html, '装机购物清单.xls', 'application/vnd.ms-excel');
    }

    function exportJSON() {
      const json = JSON.stringify(appData, null, 2);
      downloadFile(json, '装机清单备份.json', 'application/json');
    }

    function importJSON(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.components && Array.isArray(data.components)) {
            appData = data;
            saveData();
            renderTable();
            updateTheme();
            showToast('JSON 恢复成功');
          } else {
            alert('文件格式不正确');
          }
        } catch (err) {
          alert('解析失败：' + err.message);
        }
      };
      reader.readAsText(file);
    }

    function downloadFile(content, filename, mime) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function esc(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function resetData() {
      if (!confirm('确定恢复默认数据？当前编辑将被覆盖。')) return;
      appData = JSON.parse(JSON.stringify(defaultData));
      saveData();
      renderTable();
      updateTheme();
      showToast('已恢复默认');
    }

    // 主题
    function updateTheme() {
      const primary = document.getElementById('primary-color').value;
      const accent = document.getElementById('accent-color').value;
      document.documentElement.style.setProperty('--emerald', primary);
      document.documentElement.style.setProperty('--emerald-light', lighten(primary, 20));
      document.documentElement.style.setProperty('--emerald-pale', hexToRgba(primary, 0.12));
      document.documentElement.style.setProperty('--orange', accent);
      document.documentElement.style.setProperty('--orange-light', lighten(accent, 20));
      document.getElementById('primary-hex').textContent = primary;
      document.getElementById('accent-hex').textContent = accent;
      appData.theme = { primary, accent };
      autoSave();
      drawAllCharts();
    }

    function lighten(hex, percent) {
      const num = parseInt(hex.replace('#',''), 16);
      const r = Math.min(255, (num >> 16) + percent);
      const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
      const b = Math.min(255, (num & 0x0000FF) + percent);
      return '#' + (0x1000000 + r*0x10000 + g*0x100 + b).toString(16).slice(1);
    }

    function hexToRgba(hex, alpha) {
      const num = parseInt(hex.replace('#',''), 16);
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // 问候语
    function setGreeting() {
      const hour = new Date().getHours();
      let greet = '早上好';
      if (hour >= 11 && hour < 13) greet = '中午好';
      else if (hour >= 13 && hour < 18) greet = '下午好';
      else if (hour >= 18) greet = '晚上好';
      document.getElementById('greeting-text').textContent = `${greet}，今天装机进度如何？`;
    }

    // 初始化
    function init() {
      if (appData.theme) {
        document.getElementById('primary-color').value = appData.theme.primary || '#2d7a5e';
        document.getElementById('accent-color').value = appData.theme.accent || '#f5a623';
        if (appData.theme.dark) document.body.classList.add('dark-dashboard');
      }
      const dt = document.getElementById('dark-toggle');
      if (dt) dt.checked = !!(appData.theme && appData.theme.dark);
      setGreeting();
      afterData();
    }

    function afterData() {
      renderTable();
      updateTheme();
      setupTimeline();
      onScrollProgress();
      window.addEventListener('scroll', onScrollProgress, { passive: true });
      window.addEventListener('resize', () => { drawAllCharts(); buildSpendCurve(); });
      revealActive();
    }

    init();
  
    function dispatchAction(event) {
      const el = event.target.closest('[data-' + event.type + ']');
      if (!el) return;
      const action = el.getAttribute('data-' + event.type);
      const m = action.match(/^([A-Za-z]+)\((.*)\)$/);
      if (action === 'if(event.target===this)closeEditor()') { if (event.target === el) closeEditor(); return; }
      if (!m) return;
      const name = m[1], arg = m[2].match(/^'([^']*)'/)?.[1];
      const noArgs = {closeEditor, downloadTemplateCopy, exportCSV, exportExcel, exportJSON, renderTable, resetData, saveEditor, saveToSourceFile, toggleDark, updateTheme};
      if (name === 'showSection') showSection(arg, el);
      else if (name === 'importJSON') importJSON(event);
      else if (name === 'openEditor') openEditor(arg || null);
      else if (name === 'deleteComponent') deleteComponent(arg);
      else if (name === 'toggleOwned') toggleOwned(arg);
      else if (name === 'updatePrice') updatePrice(arg, el.value);
      else if (name === 'updateNote') updateNote(arg, el.value);
      else if (noArgs[name]) noArgs[name]();
    }
    ['click','change','input'].forEach(type => document.addEventListener(type, dispatchAction));
