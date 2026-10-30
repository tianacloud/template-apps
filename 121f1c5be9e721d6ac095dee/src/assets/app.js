/* ============================================================
   公共脚本：导航 / 格式化 / ECharts 统一视觉
   ============================================================ */
(function () {
  const NAV = [
    ['index.html',      '总览',   'OVERVIEW'],
    ['computer.html',   '计算机类', 'COMPUTER'],
    ['majors.html',     '专业',   'MAJORS'],
    ['regions.html',    '地域',   'REGIONS'],
    ['departments.html','部门',   'DEPTS'],
    ['cooccur.html',    '并列大类', 'CO-OCCUR'],
    ['exclusive.html',  '单一专业', 'EXCLUSIVE']
  ];

  window.App = {
    /* 渲染顶部导航（active = 当前页文件名） */
    nav(active) {
      const el = document.getElementById('nav');
      if (!el) return;
      el.className = 'nav';
      el.innerHTML =
        '<div class="nav-in">' +
          '<a class="logo" href="index.html" style="text-decoration:none;color:inherit">' +
            '<span class="emblem">国</span>' +
            '<span><b>国考数据 2027</b><br><span>NATIONAL CIVIL SERVICE</span></span>' +
          '</a>' +
          '<div class="menu">' +
            NAV.map(([href, zh]) =>
              `<a href="${href}" class="${href === active ? 'on' : ''}">${zh}</a>`).join('') +
          '</div>' +
        '</div>';
    },

    /* 千分位 */
    fmt(n) {
      if (n === null || n === undefined) return '—';
      return Number(n).toLocaleString('en-US');
    },
    pct(v, d) { return (v === null || v === undefined) ? '—' : Number(v).toFixed(d === undefined ? 2 : d) + '%'; },

    /* ECharts 统一配色 */
    PAL: ['#4A86FF', '#D4A95A', '#4FD1C5', '#8FAEFF', '#E8C88A',
          '#2F9E96', '#9B7BE0', '#C0524A', '#5B7FA8', '#A8B6CC'],

    /* 统一 tooltip */
    tip(extra) {
      return Object.assign({
        backgroundColor: 'rgba(10,22,40,.95)',
        borderColor: 'rgba(212,169,90,.35)',
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: '#E8EDF7', fontSize: 12.5 },
        extraCssText: 'border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.5);backdrop-filter:blur(6px)'
      }, extra || {});
    },

    /* 统一类目轴 / 数值轴 */
    catAxis(extra) {
      return Object.assign({
        type: 'category',
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.12)' } },
        axisTick: { show: false },
        axisLabel: { color: '#94A6C0', fontSize: 11.5, interval: 0 }
      }, extra || {});
    },
    valAxis(extra) {
      return Object.assign({
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,.055)' } },
        axisLabel: { color: '#63758F', fontSize: 11 }
      }, extra || {});
    },

    /* 渐变柱 */
    grad(c1, c2) {
      return new echarts.graphic.LinearGradient(0, 0, 1, 0,
        [{ offset: 0, color: c1 }, { offset: 1, color: c2 }]);
    },

    /* 横向条形图（最常用） */
    barH(el, data, opt) {
      opt = opt || {};
      const max = Math.max.apply(null, data.map(d => d.v));
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          trigger: 'axis', axisPointer: { type: 'shadow' },
          formatter: p => {
            const d = data[p[0].dataIndex];
            return `<b style="color:#F0D9A6">${d.k}</b><br>` +
                   (opt.unit || '招录人数') + '：<b>' + App.fmt(d.v) + '</b>' +
                   (d.pos !== undefined ? '<br>职位数：' + App.fmt(d.pos) : '') +
                   (d.pct !== undefined ? '<br>占比：' + App.pct(d.pct) : '');
          }
        }),
        grid: { left: 8, right: 58, top: 6, bottom: 6, containLabel: true },
        xAxis: this.valAxis({ max: opt.max || max, axisLabel: { show: false }, splitLine: { show: false } }),
        yAxis: this.catAxis({
          inverse: true, data: data.map(d => d.k),
          axisLabel: { color: '#C6D2E6', fontSize: 12, width: opt.labelW || 110, overflow: 'truncate' }
        }),
        series: [{
          type: 'bar', barWidth: opt.barW || 14,
          data: data.map(d => d.v),
          itemStyle: {
            borderRadius: 4,
            color: p => (opt.gold && p.dataIndex === 0)
              ? this.grad('#A8843C', '#D4A95A')
              : this.grad('#2A5FD6', '#4A86FF')
          },
          label: {
            show: true, position: 'right', distance: 8,
            color: '#E8EDF7', fontSize: 11.5, fontFamily: 'monospace',
            formatter: p => App.fmt(p.value) + (opt.suffix || '')
          }
        }]
      });
      return c;
    },

    /* 环形图 */
    donut(el, data, opt) {
      opt = opt || {};
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          trigger: 'item',
          formatter: p => `<b style="color:#F0D9A6">${p.name}</b><br>${App.fmt(p.value)} 人 · ${p.percent}%`
        }),
        legend: {
          orient: opt.orient || 'vertical', right: 8, top: 'center', itemWidth: 10, itemHeight: 10,
          textStyle: { color: '#94A6C0', fontSize: 11.5 }, itemGap: 12
        },
        series: [{
          type: 'pie', radius: opt.radius || ['52%', '74%'], center: opt.center || ['38%', '50%'],
          avoidLabelOverlap: true, itemStyle: { borderColor: '#0B1B30', borderWidth: 2 },
          label: opt.label === false ? { show: false } : {
            show: true, formatter: '{b}\n{d}%', color: '#C6D2E6', fontSize: 11, lineHeight: 15
          },
          labelLine: { lineStyle: { color: 'rgba(255,255,255,.2)' } },
          data: data.map((d, i) => ({
            name: d.k, value: d.v,
            itemStyle: { color: d.color || this.PAL[i % this.PAL.length] }
          }))
        }],
        graphic: opt.centerText ? [{
          type: 'group', left: (opt.center ? opt.center[0] : '38%'), top: 'middle', z: 10,
          children: [
            { type: 'text', style: { text: opt.centerText, fill: '#F0D9A6', fontSize: 20,
              fontFamily: 'monospace', fontWeight: 700, textAlign: 'center', textVerticalAlign: 'middle' } },
            { type: 'text', y: 24, style: { text: opt.centerSub || '', fill: '#63758F',
              fontSize: 11, textAlign: 'center', textVerticalAlign: 'middle' } }
          ]
        }] : []
      });
      return c;
    },

    /* 南丁格尔玫瑰 */
    rose(el, data) {
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({ trigger: 'item', formatter: p => `<b style="color:#F0D9A6">${p.name}</b><br>${App.fmt(p.value)} 人 · ${p.percent}%` }),
        legend: { orient: 'vertical', right: 6, top: 'center', textStyle: { color: '#94A6C0', fontSize: 11.5 }, itemWidth: 10, itemHeight: 10 },
        series: [{
          type: 'pie', radius: [24, 108], center: ['36%', '52%'], roseType: 'area',
          itemStyle: { borderRadius: 5, borderColor: '#0B1B30', borderWidth: 2 },
          label: { color: '#C6D2E6', fontSize: 11, formatter: '{b} {d}%' },
          labelLine: { lineStyle: { color: 'rgba(255,255,255,.18)' }, length: 8, length2: 8 },
          data: data.map((d, i) => ({ name: d.k, value: d.v, itemStyle: { color: d.color || this.PAL[i % this.PAL.length] } }))
        }]
      });
      return c;
    },

    /* 矩形树图 */
    treemap(el, data) {
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          formatter: p => `<b style="color:#F0D9A6">${p.name}</b><br>招录 ${App.fmt(p.value)} 人` +
            (p.data.pos ? '<br>职位 ' + App.fmt(p.data.pos) : '') +
            (p.data.pct ? '<br>占比 ' + App.pct(p.data.pct) : '')
        }),
        series: [{
          type: 'treemap', roam: false, nodeClick: false, breadcrumb: { show: false },
          width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0,
          itemStyle: { borderColor: '#0B1B30', borderWidth: 1.5, gapWidth: 1.5 },
          label: { color: '#0B1B30', fontSize: 12, fontWeight: 700, formatter: p => p.name + '\n' + App.fmt(p.value) },
          data: data.map((d, i) => ({
            name: d.k, value: d.v, pos: d.pos, pct: d.pct,
            itemStyle: { color: d.color || this.PAL[i % this.PAL.length] }
          }))
        }]
      });
      return c;
    },

    /* 漏斗 */
    funnel(el, data, opt) {
      opt = opt || {};
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          trigger: 'item',
          formatter: p => `<b style="color:#F0D9A6">${p.name}</b><br>${App.fmt(p.value)} 人 · ${App.fmt(p.data.pos)} 职位<br>占全国 ${App.pct(p.data.pct)}`
        }),
        series: [{
          type: 'funnel', left: '8%', right: '8%', top: 20, bottom: 20,
          minSize: '22%', maxSize: '100%', sort: 'descending', gap: 4,
          label: {
            position: 'inside', color: '#0B1B30', fontSize: 13, fontWeight: 700,
            formatter: p => p.name
          },
          labelLine: { show: false },
          itemStyle: { borderColor: '#0B1B30', borderWidth: 2 },
          data: data.map((d, i) => ({
            name: d.k, value: d.v, pos: d.pos, pct: d.pct,
            itemStyle: { color: ['#D4A95A', '#4A86FF', '#2F9E96'][i] || this.PAL[i] }
          }))
        }, {
          type: 'funnel', left: '8%', right: '8%', top: 20, bottom: 20,
          minSize: '22%', maxSize: '100%', sort: 'descending', gap: 4, z: 5,
          label: {
            position: 'right', color: '#F0D9A6', fontSize: 13, fontFamily: 'monospace', fontWeight: 700,
            formatter: p => App.fmt(p.value) + ' 人'
          },
          itemStyle: { opacity: 0 },
          data: data.map(d => ({ name: d.k, value: d.v }))
        }]
      });
      return c;
    },

    /* 关系图（共现） */
    graph(el, nodes, links, opt) {
      opt = opt || {};
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          formatter: p => p.dataType === 'edge'
            ? `${p.data.source} ＋ ${p.data.target}<br>共现于 <b style="color:#F0D9A6">${App.fmt(p.data.value)}</b> 个职位`
            : `<b style="color:#F0D9A6">${p.name}</b><br>与之共现的专业：${p.data.n || '—'}`
        }),
        series: [{
          type: 'graph', layout: 'force', roam: true, draggable: true,
          force: { repulsion: opt.repulsion || 260, edgeLength: opt.edgeLength || 110, gravity: .08 },
          symbolSize: p => Math.max(16, Math.sqrt(p.v || 20) * (opt.scale || 3.2)),
          edgeSymbol: ['none', 'none'],
          label: {
            show: true, position: 'right', color: '#C6D2E6', fontSize: 11.5,
            formatter: p => p.name
          },
          lineStyle: {
            color: 'source', opacity: .38, curveness: .12,
            width: p => Math.min(5, 0.6 + (p.data ? p.data.value : 0) / (opt.wDiv || 900))
          },
          emphasis: { focus: 'adjacency', lineStyle: { width: 5, opacity: .85 } },
          data: nodes, links: links
        }]
      });
      return c;
    },

    /* 热力矩阵 */
    heat(el, xNames, yNames, cells, max) {
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          position: 'top',
          formatter: p => `${yNames[p.value[1]]} ＋ ${xNames[p.value[0]]}<br>共现 <b style="color:#F0D9A6">${App.fmt(p.value[2])}</b> 个职位`
        }),
        grid: { left: 96, right: 24, top: 16, bottom: 76 },
        xAxis: { type: 'category', data: xNames, splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,.015)', 'transparent'] } },
                 axisLabel: { color: '#94A6C0', fontSize: 10.5, rotate: 42, interval: 0 },
                 axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } }, axisTick: { show: false } },
        yAxis: { type: 'category', data: yNames, splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,.015)', 'transparent'] } },
                 axisLabel: { color: '#94A6C0', fontSize: 10.5, width: 88, overflow: 'truncate' },
                 axisLine: { lineStyle: { color: 'rgba(255,255,255,.1)' } }, axisTick: { show: false } },
        visualMap: {
          min: 0, max: max, calculable: true, orient: 'horizontal', left: 'center', bottom: 6,
          itemWidth: 12, itemHeight: 90,
          textStyle: { color: '#63758F', fontSize: 11 },
          inRange: { color: ['#0E2138', '#1B3C6B', '#2A5FD6', '#4A86FF', '#8FAEFF'] }
        },
        series: [{
          type: 'heatmap', data: cells, progressive: 0,
          itemStyle: { borderColor: '#0B1B30', borderWidth: 1 },
          emphasis: { itemStyle: { borderColor: '#D4A95A', borderWidth: 1.5 } }
        }]
      });
      return c;
    },

    /* 地图 */
    map(el, data, opt) {
      opt = opt || {};
      if (!window.CHINA_GEO) return null;
      if (!echarts.getMap('china')) echarts.registerMap('china', window.CHINA_GEO);
      const max = Math.max.apply(null, data.map(d => d.v));
      const c = echarts.init(document.getElementById(el));
      c.setOption({
        tooltip: this.tip({
          trigger: 'item',
          formatter: p => {
            const d = data.find(x => x.k === p.name);
            if (!d) return `<b style="color:#F0D9A6">${p.name}</b><br>暂无招录数据`;
            return `<b style="color:#F0D9A6">${p.name}</b><br>招录 ${App.fmt(d.v)} 人<br>职位 ${App.fmt(d.pos)} 个<br>占全国 ${App.pct(100 * d.v / App.GK.meta.hc, 1)}`;
          }
        }),
        visualMap: {
          min: 0, max: max, left: 18, bottom: 24, calculable: true, itemWidth: 11, itemHeight: 110,
          text: ['高', '低'], textStyle: { color: '#94A6C0', fontSize: 11 },
          inRange: { color: ['#102540', '#163C6B', '#1F55A0', '#2F76D6', '#4A86FF', '#8FB6FF'] }
        },
        series: [{
          type: 'map', map: 'china', roam: false, zoom: 1.18,
          center: opt.center || undefined,
          itemStyle: {
            areaColor: '#14263E', borderColor: 'rgba(212,169,90,.35)', borderWidth: .7,
            shadowColor: 'rgba(0,0,0,.5)', shadowBlur: 12, shadowOffsetY: 4
          },
          emphasis: {
            itemStyle: { areaColor: '#D4A95A', borderColor: '#F0D9A6', borderWidth: 1 },
            label: { color: '#12203A', fontWeight: 700 }
          },
          label: { show: false },
          data: data.map(d => ({ name: d.k, value: d.v, pos: d.pos }))
        }]
      });
      return c;
    },

    /* 表格渲染：rows = [{k,pos,hc,pct}] */
    table(el, rows, opt) {
      opt = opt || {};
      const max = Math.max.apply(null, rows.map(r => r.v !== undefined ? r.v : r.hc));
      const tb = document.querySelector('#' + el + ' tbody');
      if (!tb) return;
      tb.innerHTML = rows.map((r, i) => {
        const v = r.v !== undefined ? r.v : r.hc;
        const cls = i === 0 ? 'g1' : i === 1 ? 'g2' : i === 2 ? 'g3' : '';
        return `<tr>
          <td class="rk"><i class="${cls}">${i + 1}</i></td>
          <td>${r.k}${r.tag ? ' <span class="tag ' + (r.tagCls || 'gold') + '">' + r.tag + '</span>' : ''}</td>
          ${r.cat ? `<td style="color:var(--txt3)">${r.cat}</td>` : ''}
          <td class="n">${App.fmt(r.pos)}</td>
          <td class="n"><b>${App.fmt(v)}</b></td>
          <td style="width:${opt.barW || 160}px">
            <div class="bar-wrap"><div class="bar"><i class="${opt.gold && i === 0 ? 'gold' : ''}" style="width:${100 * v / max}%"></i></div>
            <span class="v">${r.pct !== undefined ? App.pct(r.pct, 1) : ''}</span></div>
          </td>
        </tr>`;
      }).join('');
    },

    /* 自适应：可传数组，也可传函数（图表会重建时传函数） */
    auto(charts) {
      window.addEventListener('resize', () => {
        const cs = typeof charts === 'function' ? charts() : charts;
        (cs || []).forEach(c => c && c.resize());
      });
    }
  };
  window.App.GK = window.GK || {};
})();
