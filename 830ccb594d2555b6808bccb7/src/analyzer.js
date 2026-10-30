(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function (root) {
  'use strict';

  const STOP = new Set(['error', 'errors', 'warning', 'failed', 'failure', 'exception', 'server', 'client',
    'request', 'response', 'http', 'https', 'null', 'undefined', 'the', 'with', 'from', 'that', 'this',
    'while', 'could', 'cannot', 'found', 'message', 'value', 'object', 'function', 'process', 'completed',
    'started', 'running', 'thread', 'connection', 'connecting', 'connected', 'listener', 'exceeded']);

  function normalizeMsg(msg) {
    return String(msg == null ? '' : msg)
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<uuid>')
      .replace(/\b\d{4}-\d{2}-\d{2}[T ][\d:.,]+(?:Z|[+-]\d{2}:?\d{2})?/gi, '<ts>')
      .replace(/https?:\/\/[^\s"'<>)\]]+/g, '<url>')
      .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, '<email>')
      .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '<ip>')
      .replace(/\b0x[0-9a-fA-F]+\b/g, '<hex>')
      .replace(/\b[0-9a-f]{16,}\b/gi, '<hex>')
      .replace(/(?:[\/\\][\w.\-${}]+){2,}/g, '<path>')
      .replace(/\b\d+(?:\.\d+){2,}\b/g, '<ver>')
      .replace(/\b\d{3,}\b/g, '<num>')
      .replace(/\b\d+\b/g, '<n>')
      .replace(/"[^"]*"/g, '"<str>"')
      .replace(/'[^']*'/g, "'<str>'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokens(s) {
    const set = new Set();
    String(s == null ? '' : s).toLowerCase().split(/[^\w$.]+/).forEach(function (t) {
      if (t.length >= 5 && !STOP.has(t)) set.add(t);
    });
    return set;
  }

  function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    a.forEach(function (t) { if (b.has(t)) inter++; });
    return inter / (a.size + b.size - inter);
  }

  function exceptionClass(msg) {
    const m = String(msg).match(root.SceneOne.EXC_RE);
    return m ? m[1] : null;
  }

  function clusterEvents(events) {
    const map = new Map();
    const seqToKey = new Map();
    let matchCalls = 0;
    for (const ev of events) {
      const key = normalizeMsg(ev.msg) + ' § ' + (ev.source || '');
      let c = map.get(key);
      if (!c) {
        c = {
          key: key, count: 0, firstSeq: ev.i, lastSeq: ev.i, firstTime: ev.time, lastTime: ev.time,
          sample: ev, level: ev.level, errorCount: 0, warnCount: 0, kb: [], kbIds: [], cascade: null,
          kbIdSet: new Set()
        };
        map.set(key, c);
      }
      c.count++;
      c.lastSeq = ev.i;
      if (ev.time != null) { c.lastTime = ev.time; if (c.firstTime == null) c.firstTime = ev.time; }
      if (ev.level === 'error') c.errorCount++;
      if (ev.level === 'warn') c.warnCount++;
      if ((ev.level === 'error' || ev.level === 'warn') && matchCalls < 20000) {
        matchCalls++;
        const hits = root.SceneOne.matchAll(ev.raw);
        for (const h of hits) c.kbIdSet.add(h.item.id);
      }
      seqToKey.set(ev.i, key);
    }
    const rank = { high: 3, medium: 2, low: 1 };
    const byId = root.SceneOne.byId();
    const list = Array.from(map.values());
    for (const c of list) {
      const items = Array.from(c.kbIdSet).map(function (id) { return byId[id]; }).filter(Boolean);
      items.sort(function (a, b) {
        return (rank[b.sev] - rank[a.sev]) || (a.id < b.id ? -1 : 1);
      });
      c.kb = items.slice(0, 5);
      c.kbIds = c.kb.map(function (k) { return k.id; });
    }
    list.sort(function (a, b) {
      return (b.errorCount - a.errorCount) || (b.warnCount - a.warnCount) || (b.count - a.count);
    });
    return { list: list, seqToKey: seqToKey };
  }

  function findFirstScene(events, clusters) {
    const errs = events.filter(function (e) { return e.level === 'error'; });
    if (!errs.length) return null;
    let root = errs[0];
    for (const e of errs) {
      const ta = root.time == null ? Infinity : root.time;
      const tb = e.time == null ? Infinity : e.time;
      if (tb < ta || (tb === ta && e.i < root.i)) root = e;
    }
    const rootCluster = clusters.seqToKey.has(root.i)
      ? clusters.list.find(function (c) { return c.key === clusters.seqToKey.get(root.i); }) : null;
    return { event: root, cluster: rootCluster, kb: rootCluster ? rootCluster.kb : [] };
  }

  function markCascade(clusters, first) {
    if (!first || !first.cluster) return;
    const rc = first.cluster;
    const rt = tokens(rc.sample.msg);
    const rexc = exceptionClass(rc.sample.msg);
    for (const c of clusters.list) {
      c.cascade = null;
      if (c.errorCount === 0 || c === rc) continue;
      const sharedKb = c.kbIds.some(function (id) { return rc.kbIds.indexOf(id) !== -1; });
      const sameExc = rexc && exceptionClass(c.sample.msg) === rexc;
      if (sharedKb || sameExc) c.cascade = 'high';
      else if (jaccard(rt, tokens(c.sample.msg)) > 0.4) c.cascade = 'medium';
      else if ((c.firstTime != null && first.event.time != null && c.firstTime >= first.event.time) || c.firstSeq > first.event.i) c.cascade = 'low';
    }
  }

  function extractEntities(events) {
    const out = {
      ips: {}, ports: {}, urls: {}, emails: {}, exceptions: {},
      httpCodes: {}, exitCodes: {}, paths: {}
    };
    const bump = function (obj, k) { if (k) obj[k] = (obj[k] || 0) + 1; };
    for (const ev of events) {
      if (ev.level !== 'error' && ev.level !== 'warn') continue;
      const text = ev.raw;
      let m;
      const reIp = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
      while ((m = reIp.exec(text))) bump(out.ips, m[0]);
      const reUrl = /https?:\/\/[^\s"'<>)\]]+/g;
      while ((m = reUrl.exec(text))) bump(out.urls, m[0].replace(/[.,;:]+$/, ''));
      const reMail = /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g;
      while ((m = reMail.exec(text))) bump(out.emails, m[0]);
      const reExc = /\b[A-Z][\w$]*(?:Exception|Error)\b/g;
      while ((m = reExc.exec(text))) bump(out.exceptions, m[0]);
      const reHttp = /\bHTTP\/1\.[01]"?\s+(\d{3})/g;
      while ((m = reHttp.exec(text))) bump(out.httpCodes, m[1]);
      const reExit = /\bexit (?:code|status) (\d+)/gi;
      while ((m = reExit.exec(text))) bump(out.exitCodes, m[1]);
      const rePort1 = /\bport\s+(\d{2,5})\b/gi;
      while ((m = rePort1.exec(text))) bump(out.ports, m[1]);
      const rePort2 = /(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d{2,5})/gi;
      while ((m = rePort2.exec(text))) bump(out.ports, m[1]);
      const rePort3 = /\b\d{1,3}(?:\.\d{1,3}){3}:(\d{2,5})/g;
      while ((m = rePort3.exec(text))) bump(out.ports, m[1]);
      const rePath = /(?:[\/][\w.\-]+){2,}/g;
      while ((m = rePath.exec(text))) bump(out.paths, m[0]);
      if (ev.fields && ev.fields.status) bump(out.httpCodes, String(ev.fields.status));
    }
    return out;
  }

  function topCounts(obj, n) {
    return Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; })
      .slice(0, n || 10).map(function (k) { return { v: k, n: obj[k] }; });
  }

  function buildTimeline(events) {
    const timed = events.filter(function (e) { return e.time != null; });
    if (timed.length >= 2) {
      let min = timed[0].time; let max = timed[0].time;
      for (const e of timed) { if (e.time < min) min = e.time; if (e.time > max) max = e.time; }
      const span = Math.max(1, max - min);
      const n = Math.min(48, Math.max(8, Math.ceil(span / 60000)));
      const bucketMs = span / n;
      const buckets = [];
      for (let i = 0; i < n; i++) {
        buckets.push({ t0: min + i * bucketMs, error: 0, warn: 0, info: 0, debug: 0, other: 0, total: 0 });
      }
      for (const e of timed) {
        let idx = Math.floor((e.time - min) / bucketMs);
        if (idx >= n) idx = n - 1;
        if (idx < 0) idx = 0;
        const b = buckets[idx];
        b[e.level] = (b[e.level] || 0) + 1;
        b.total++;
      }
      return { mode: 'time', min: min, max: max, buckets: buckets };
    }
    const n = Math.min(24, Math.max(4, events.length));
    const buckets = [];
    for (let i = 0; i < n; i++) buckets.push({ t0: i, error: 0, warn: 0, info: 0, debug: 0, other: 0, total: 0 });
    events.forEach(function (e, i) {
      let idx = Math.floor(i / Math.max(1, events.length) * n);
      if (idx >= n) idx = n - 1;
      const b = buckets[idx];
      b[e.level] = (b[e.level] || 0) + 1;
      b.total++;
    });
    return { mode: 'seq', buckets: buckets };
  }

  function collectKbHits(clusters) {
    const seen = {};
    const hits = [];
    for (const c of clusters.list) {
      if (c.errorCount === 0 && c.warnCount === 0) continue;
      for (const item of c.kb) {
        if (seen[item.id]) { seen[item.id].clusters++; continue; }
        seen[item.id] = { item: item, clusters: 1 };
        hits.push(seen[item.id]);
      }
    }
    const rank = { high: 3, medium: 2, low: 1 };
    hits.sort(function (a, b) {
      return (rank[b.item.sev] - rank[a.item.sev]) || (b.clusters - a.clusters);
    });
    return hits;
  }

  function analyze(raw) {
    const parsed = root.SceneOne.parseLog(raw);
    const clusters = clusterEvents(parsed.events);
    const first = findFirstScene(parsed.events, clusters);
    markCascade(clusters, first);
    const entities = extractEntities(parsed.events);
    const timeline = buildTimeline(parsed.events);
    const kbHits = collectKbHits(clusters);
    return {
      events: parsed.events, stats: parsed.stats, clusters: clusters.list, seqToKey: clusters.seqToKey,
      firstScene: first, entities: entities, timeline: timeline, kbHits: kbHits
    };
  }

  return {
    analyze: analyze, normalizeMsg: normalizeMsg, clusterEvents: clusterEvents,
    findFirstScene: findFirstScene, markCascade: markCascade, extractEntities: extractEntities,
    buildTimeline: buildTimeline, collectKbHits: collectKbHits, tokens: tokens, jaccard: jaccard,
    topCounts: topCounts, exceptionClass: exceptionClass
  };
});
