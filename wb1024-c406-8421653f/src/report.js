(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function (root) {
  'use strict';

  function mdCode(s) {
    return '`' + String(s == null ? '' : s).replace(/`/g, "'").replace(/\n/g, ' ⏎ ') + '`';
  }

  function buildMarkdown(a, opts) {
    opts = opts || {};
    const U = root.SceneOne;
    const L = [];
    const st = a.stats;
    L.push('# 日志诊断报告 · 第一现场 SceneOne');
    L.push('');
    L.push('> 由「第一现场」本地规则引擎生成：所有解析、聚类与诊断均在浏览器内完成，日志未上传任何服务器。');
    L.push('> 报告基于规则匹配给出高概率方向，请结合代码上下文最终确认。');
    L.push('');
    L.push('## 一、概览');
    L.push('- 日志行数：' + st.totalLines + (st.truncated ? '（输入超大，仅分析前 200000 行）' : ''));
    if (st.timeMin != null) {
      L.push('- 时间跨度：' + U.fmtTime(st.timeMin) + ' ~ ' + U.fmtTime(st.timeMax) + '（' + U.fmtSpan(st.timeMax - st.timeMin) + '）');
    } else {
      L.push('- 时间跨度：无有效时间戳（按行序分析）');
    }
    L.push('- 级别分布：错误 ' + st.levels.error + ' · 警告 ' + st.levels.warn + ' · 信息 ' + st.levels.info + ' · 调试 ' + st.levels.debug + ' · 其他 ' + st.levels.other);
    const fmts = Object.keys(st.formats).sort(function (x, y) { return st.formats[y] - st.formats[x]; })
      .map(function (k) { return k + ' ×' + st.formats[k]; }).join('，');
    L.push('- 识别格式：' + (fmts || '—'));
    L.push('');
    L.push('## 二、第一现场（首个错误）');
    if (a.firstScene) {
      const ev = a.firstScene.event;
      L.push('- 位置：第 ' + ev.i + ' 行' + (ev.time != null ? ' · ' + U.fmtTime(ev.time) : ''));
      L.push('- 内容：' + mdCode(U.truncateMiddle(ev.msg, 300)));
      if (ev.stack && ev.stack.length) L.push('- 附带堆栈 ' + ev.stack.length + ' 行（略）');
      const kbs = a.firstScene.kb.slice(0, 2);
      if (kbs.length) {
        for (const kb of kbs) {
          L.push('');
          L.push('### 诊断：' + kb.title + '（' + kb.cat + '）');
          L.push('- 这是什么：' + kb.what);
          L.push('- 常见原因：');
          kb.causes.forEach(function (c, i) { L.push('  ' + (i + 1) + '. ' + c); });
          L.push('- 修复建议：');
          kb.fixes.forEach(function (f, i) { L.push('  ' + (i + 1) + '. ' + f); });
        }
      } else {
        L.push('');
        L.push('未命中内置知识库。建议：以该行作为关键词检索官方文档，并检查其前后 20 行上下文。');
      }
    } else {
      L.push('未发现错误级日志。若认为应有错误，请检查输入是否完整、级别关键词是否被工具折叠。');
    }
    L.push('');
    L.push('## 三、错误聚类 Top 8');
    const ec = a.clusters.filter(function (c) { return c.errorCount + c.warnCount > 0; }).slice(0, 8);
    if (ec.length) {
      L.push('| # | 次数 | 级别 | 首现行 | 聚类模板 | 判定 |');
      L.push('| --- | --- | --- | --- | --- | --- |');
      ec.forEach(function (c, i) {
        const lv = c.errorCount ? '错误' : '警告';
        const judge = c.cascade === 'high' ? '疑似级联（高置信）'
          : c.cascade === 'medium' ? '疑似级联（中置信）'
            : c.cascade === 'low' ? '出现于第一现场之后' : '独立问题';
        L.push('| ' + (i + 1) + ' | ' + c.count + ' | ' + lv + ' | ' + c.firstSeq + ' | ' +
          U.truncateMiddle(c.key, 80).replace(/\|/g, '\\|') + ' | ' + judge + ' |');
      });
    } else {
      L.push('（无错误 / 警告聚类）');
    }
    L.push('');
    L.push('## 四、知识库命中');
    if (a.kbHits.length) {
      a.kbHits.slice(0, 8).forEach(function (h) {
        L.push('- **' + h.item.title + '**（' + h.item.cat + ' · ' + h.item.sev + '）— 关联聚类 ' + h.clusters + ' 个');
      });
    } else {
      L.push('（无命中）');
    }
    L.push('');
    L.push('## 五、关键实体');
    const E = a.entities;
    const sec = function (name, arr) {
      if (!arr.length) return;
      L.push('- ' + name + '：' + arr.map(function (x) { return x.v + (x.n > 1 ? '×' + x.n : ''); }).join('、'));
    };
    sec('异常类', U.topCounts(E.exceptions, 8));
    sec('HTTP 状态码', U.topCounts(E.httpCodes, 8));
    sec('IP', U.topCounts(E.ips, 6));
    sec('端口', U.topCounts(E.ports, 6));
    sec('退出码', U.topCounts(E.exitCodes, 6));
    sec('URL', U.topCounts(E.urls, 5));
    if (!Object.keys(E.exceptions).length && !Object.keys(E.httpCodes).length && !Object.keys(E.ips).length) {
      L.push('- （未抽取到实体）');
    }
    L.push('');
    L.push('## 六、建议处理顺序');
    const fixes = [];
    const seenFix = {};
    for (const h of a.kbHits) {
      for (const f of h.item.fixes) {
        if (seenFix[f]) continue;
        seenFix[f] = 1;
        fixes.push(f);
      }
    }
    if (fixes.length) {
      fixes.slice(0, 8).forEach(function (f, i) { L.push((i + 1) + '. ' + f); });
    } else {
      L.push('1. 从第一现场行开始向上追因；2. 修复后重跑相同场景验证；3. 补充回归用例。');
    }
    L.push('');
    L.push('---');
    L.push('*第一现场 SceneOne · 1024 造物挑战参赛作品 · 使用 WorkBuddy 开发*');
    return L.join('\n');
  }

  return { buildMarkdown: buildMarkdown };
});
