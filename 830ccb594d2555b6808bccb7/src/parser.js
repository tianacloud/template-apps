(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const MAX_LINES = 200000;
  const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

  const LEVEL_WORDS = {
    error: 'error', err: 'error', fatal: 'error', panic: 'error', critical: 'error', crit: 'error',
    severe: 'error', emergency: 'error', emerg: 'error', alert: 'error',
    warn: 'warn', warning: 'warn',
    info: 'info', notice: 'info', information: 'info',
    debug: 'debug', trace: 'debug', verbose: 'debug'
  };

  const EXC_RE = /^(?:uncaught\s+)?(?:[a-z][\w$]*\.)*([A-Z][\w$]*(?:Exception|Error|Timeout|Interrupt|Exit|Failure))(?:\s*[:\-]\s*(.*))?$/;

  function pad(n, w) { return String(n).padStart(w || 2, '0'); }

  function stripAnsi(s) {
    return String(s).replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '').replace(/\u001b\][^\u0007]*\u0007/g, '');
  }

  function isFrameLine(line) {
    return /^\s+at\s/.test(line) ||
      /^\s+File\s+"/.test(line) ||
      /^\s+from\s+\S/.test(line) ||
      /^\s*\.\.\.\s*\d*\s*more/.test(line) ||
      /^\s*\^+\s*$/.test(line) ||
      /^\s*~+\s*$/.test(line) ||
      /^\s*Caused by:/.test(line) ||
      /^\s*Suppressed:/.test(line) ||
      /^\s*(?:During handling of the above exception|The above exception was the direct cause)/.test(line) ||
      /^\s+\S+\.go:\d+/.test(line) ||
      /^\s+\[0x[0-9a-fA-F]+\]/.test(line) ||
      /^\s+created by:/.test(line) ||
      /^goroutine \d+ \[/.test(line);
  }

  function inferLevel(line) {
    const s = String(line);
    const notError = /\b(?:0|no)\s+(?:errors?|failures?|failed)\b/i.test(s) || /error[- ]free/i.test(s);
    if (!notError && (
      /\b(?:error|errors|exception|traceback|fatal|panic|severe|critical|failed|failure|failing|fails|fail|oomkilled|aborted)\b/i.test(s) ||
      /UnhandledPromiseRejection/i.test(s) ||
      /\bexit code [1-9]\d*\b/i.test(s) ||
      /\bexit status [1-9]\d*\b/i.test(s) ||
      /\bexited with code [1-9]\d*\b/i.test(s) ||
      /\bSIG(?:KILL|SEGV|ABRT|TERM|BUS)\b/.test(s) ||
      /\bassert(?:ion)?\s+(?:failed|error)\b/i.test(s)
    )) return 'error';
    if (/\bwarn/i.test(s)) return 'warn';
    if (/\b(?:info|notice)\b/i.test(s)) return 'info';
    if (/\b(?:debug|trace|verbose)/i.test(s)) return 'debug';
    return 'other';
  }

  function normalizeLevel(v) {
    if (v == null) return null;
    return LEVEL_WORDS[String(v).toLowerCase()] || null;
  }

  function parseTime(v) {
    if (v == null) return null;
    if (typeof v === 'number') return isFinite(v) ? (v > 1e12 ? v : v * 1000) : null;
    const s = String(v).trim();
    if (!s) return null;
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:[.,](\d{1,9}))?\s*(Z|[+-]\d{2}:?\d{2})?/i);
    if (m) {
      const ms = m[7] ? Number((m[7] + '000').slice(0, 3)) : 0;
      let iso = m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + '.' + pad(ms, 3);
      const off = m[8];
      if (off && off.toUpperCase() !== 'Z') {
        const c = off.replace(':', '');
        iso += c.slice(0, 3) + ':' + c.slice(3);
      } else iso += 'Z';
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d.getTime();
    }
    m = s.match(/^([A-Z][a-z]{2})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (m && MONTHS[m[1]] != null) {
      const now = new Date();
      let d = new Date(Date.UTC(now.getUTCFullYear(), MONTHS[m[1]], Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])));
      if (d.getTime() > now.getTime() + 86400000) {
        d = new Date(Date.UTC(now.getUTCFullYear() - 1, MONTHS[m[1]], Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5])));
      }
      return d.getTime();
    }
    m = s.match(/^(\d{1,2})\/([A-Z][a-z]{2})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s*([+-]\d{4})?/);
    if (m && MONTHS[m[2]] != null) {
      const off = m[7] || '+0000';
      const iso = m[3] + '-' + pad(MONTHS[m[2]] + 1) + '-' + pad(Number(m[1])) + 'T' + m[4] + ':' + m[5] + ':' + m[6] + '.000' + off.slice(0, 3) + ':' + off.slice(3);
      const d = new Date(iso);
      return isNaN(d.getTime()) ? null : d.getTime();
    }
    m = s.match(/^(\d{10,13})$/);
    if (m) { const n = Number(m[1]); return n > 1e12 ? n : n * 1000; }
    return null;
  }

  const STRUCT_KEYS = ['time', 'timestamp', 'ts', '@timestamp', 'eventTime', 'datetime', 'date', '_time',
    'level', 'severity', 'lvl', 'log.level', 'levelname',
    'source', 'service', 'app', 'logger', 'name', 'container', 'pod', 'component',
    'msg', 'message', 'text', 'body', 'log', 'error', 'description'];

  function finishStructured(f, line, no, fmt) {
    const get = function () {
      for (let i = 0; i < arguments.length; i++) {
        const k = arguments[i];
        if (f[k] != null && f[k] !== '') return f[k];
      }
      return undefined;
    };
    const time = parseTime(get('time', 'timestamp', 'ts', '@timestamp', 'eventTime', 'datetime', 'date', '_time'));
    const level = normalizeLevel(get('level', 'severity', 'lvl', 'log.level', 'levelname'));
    const source = get('source', 'service', 'app', 'logger', 'name', 'container', 'pod', 'component') || null;
    let msg = get('msg', 'message', 'text', 'body', 'log', 'error', 'description');
    if (msg == null) {
      const rest = {};
      for (const k in f) if (STRUCT_KEYS.indexOf(k) === -1) rest[k] = f[k];
      msg = Object.keys(rest).length ? JSON.stringify(rest) : line;
    }
    if (typeof msg === 'object') msg = JSON.stringify(msg);
    return {
      i: no, raw: line, time: time, level: level || inferLevel(String(msg) + ' ' + line),
      levelInferred: !level, source: source ? String(source) : null, msg: String(msg), fmt: fmt,
      fields: f, stack: []
    };
  }

  function tryJson(line, no) {
    const t = line.trim();
    if (t[0] !== '{') return null;
    let f;
    try { f = JSON.parse(t); } catch (err) { return null; }
    if (!f || typeof f !== 'object' || Array.isArray(f)) return null;
    return finishStructured(f, line, no, 'json');
  }

  function tryLogfmt(line, no) {
    const re = /([\w.$-]+)=("[^"]*"|'[^']*'|\S+)/g;
    const f = {}; let m; let n = 0;
    while ((m = re.exec(line))) { f[m[1]] = m[2].replace(/^["']|["']$/g, ''); n++; }
    if (n < 2) return null;
    const keys = Object.keys(f).map(function (k) { return k.toLowerCase(); });
    const ok = ['level', 'severity', 'lvl', 'msg', 'message', 'time', 'timestamp', 'ts', 'levelname']
      .some(function (k) { return keys.indexOf(k) !== -1; });
    if (!ok) return null;
    return finishStructured(f, line, no, 'logfmt');
  }

  function tryGha(line, no) {
    const m = line.match(/^([^\t]{1,60})\t([^\t]{1,60})\t(\d{4}-\d{2}-\d{2}T[\d:.]+Z)\s?(.*)$/);
    if (!m) return null;
    let msg = m[4];
    let level = null;
    const em = msg.match(/^##\[(error|warning)\]/i);
    if (em) level = em[1].toLowerCase() === 'error' ? 'error' : 'warn';
    return {
      i: no, raw: line, time: parseTime(m[3]), level: level || inferLevel(msg), levelInferred: !level,
      source: m[1] + ' / ' + m[2], msg: msg, fmt: 'gha', fields: { job: m[1], step: m[2] }, stack: []
    };
  }

  function tryNginxAccess(line, no) {
    const m = line.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*)"\s+(\d{3})\s+(\d+|-)(?:\s+"([^"]*)"\s+"([^"]*)")?\s*$/);
    if (!m) return null;
    const parts = m[5].split(' ');
    const method = parts[0] || ''; const path = parts[1] || ''; const proto = parts[2] || '';
    const status = Number(m[6]);
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    return {
      i: no, raw: line, time: parseTime(m[4]), level: level, levelInferred: false, source: 'nginx',
      msg: method + ' ' + path + ' ' + status, fmt: 'nginx-access',
      fields: { ip: m[1], method: method, path: path, protocol: proto, status: status, bytes: m[7], referer: m[8] || '', ua: m[9] || '' },
      stack: []
    };
  }

  function tryNginxError(line, no) {
    const m = line.match(/^(\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2})\s+\[(\w+)\]\s+(?:(\d+#\d+):\s*)?(?:\*(\d+)\s+)?(.*)$/);
    if (!m) return null;
    const lv = m[2].toLowerCase();
    const level = (lv === 'emerg' || lv === 'alert' || lv === 'crit' || lv === 'error') ? 'error'
      : lv === 'warn' ? 'warn' : lv === 'debug' ? 'debug' : 'info';
    return {
      i: no, raw: line, time: parseTime(m[1]), level: level, levelInferred: false, source: 'nginx',
      msg: m[5], fmt: 'nginx-error', fields: { module: m[3] || '', conn: m[4] || '' }, stack: []
    };
  }

  function trySyslog(line, no) {
    const m = line.match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([\w.\-\/]+)(?:\[(\d+)\])?:\s*(.*)$/);
    if (!m) return null;
    return {
      i: no, raw: line, time: parseTime(m[1]), level: inferLevel(m[5]), levelInferred: true,
      source: m[3], msg: m[5], fmt: 'syslog', fields: { host: m[2], pid: m[4] || '' }, stack: []
    };
  }

  function tryJavaLogback(line, no) {
    const m = line.match(/^(\d{4}-\d{2}-\d{2}[T ][\d:.,]+(?:Z|[+-]\d{2}:?\d{2})?)\s+(\w+)\s+\[([^\]]+)\]\s+([\w.]+)\s+-\s+(.*)$/);
    if (!m) return null;
    const level = normalizeLevel(m[2]) || inferLevel(m[5]);
    return {
      i: no, raw: line, time: parseTime(m[1]), level: level, levelInferred: !normalizeLevel(m[2]),
      source: m[4], msg: m[5], fmt: 'java-logback', fields: { thread: m[3], logger: m[4] }, stack: []
    };
  }

  function tryTimestamped(line, no) {
    const m = line.match(/^\[?(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})?)\]?\s*(.*)$/);
    if (!m) return null;
    let rest = m[2];
    let level = null; let source = null;
    const lm = rest.match(/^\[?(error|warn|warning|info|debug|trace|fatal|notice|critical|severe|panic|verbose)\]?\s*[:\-]?\s*/i);
    if (lm) {
      level = LEVEL_WORDS[lm[1].toLowerCase()] || null;
      rest = rest.slice(lm[0].length);
      const sm = rest.match(/^([\w]+(?:\.[\w]+)+)\s+(.+)$/);
      if (sm) { source = sm[1]; rest = sm[2]; }
    }
    if (!level) {
      const pm = rest.match(/^(\w+)\s+([\w.]+):\s+(.*)$/);
      if (pm && LEVEL_WORDS[pm[1].toLowerCase()]) {
        level = LEVEL_WORDS[pm[1].toLowerCase()]; source = pm[2]; rest = pm[3];
      }
    }
    if (!level) level = inferLevel(rest);
    return {
      i: no, raw: line, time: parseTime(m[1]), level: level, levelInferred: !lm && !source,
      source: source, msg: rest, fmt: 'timestamped', fields: {}, stack: []
    };
  }

  function parseLine(line, no) {
    return tryJson(line, no) || tryGha(line, no) || tryNginxAccess(line, no) || tryNginxError(line, no) ||
      trySyslog(line, no) || tryJavaLogback(line, no) || tryLogfmt(line, no) || tryTimestamped(line, no) ||
      (function () {
        let ev = {
          i: no, raw: line, time: null, level: inferLevel(line), levelInferred: true,
          source: null, msg: line, fmt: 'generic', fields: {}, stack: [], isExc: false
        };
        if (/^UnhandledPromiseRejectionWarning/i.test(line)) { ev.level = 'error'; ev.levelInferred = false; }
        else if (/^(?:DeprecationWarning|ExperimentalWarning)/i.test(line)) { ev.level = 'warn'; ev.levelInferred = false; }
        const em = line.match(EXC_RE);
        if (em) { ev.level = 'error'; ev.levelInferred = false; ev.source = em[1]; ev.isExc = true; }
        return ev;
      })();
  }

  function parseLog(raw) {
    const text = stripAnsi(raw == null ? '' : raw);
    const lines = text.split(/\r?\n/);
    const truncated = lines.length > MAX_LINES;
    const limit = Math.min(lines.length, MAX_LINES);
    const events = [];
    const formats = {};
    let lastEvent = null;
    for (let i = 0; i < limit; i++) {
      const line = lines[i];
      if (!line || !line.trim()) continue;
      if (isFrameLine(line) && lastEvent) {
        lastEvent.stack.push(line);
        lastEvent.raw += '\n' + line;
        continue;
      }
      if (lastEvent && lastEvent.stack.length > 0 && /^[ \t]+\S/.test(line)) {
        lastEvent.stack.push(line);
        lastEvent.raw += '\n' + line;
        continue;
      }
      const ev = parseLine(line, i + 1);
      const isTbMarker = /^Traceback \(most recent call last\)/.test(ev.msg);
      const stackHasExc = lastEvent && lastEvent.stack.some(function (l) { return EXC_RE.test(l.trim()); });
      if (isTbMarker && lastEvent && lastEvent.level === 'error') {
        lastEvent.stack.push(line);
        lastEvent.raw += '\n' + line;
        continue;
      }
      if (ev.isExc && ev.time == null && lastEvent && lastEvent.level === 'error' && !stackHasExc) {
        lastEvent.stack.push(line);
        lastEvent.raw += '\n' + line;
        continue;
      }
      if (ev.source && lastEvent && lastEvent.stack.length && !stackHasExc &&
        lastEvent.stack.some(function (l) { return /^Traceback \(most recent call last\)/.test(l); })) {
        ev.stack = lastEvent.stack.slice();
        lastEvent.stack = [];
      }
      events.push(ev);
      lastEvent = ev;
      formats[ev.fmt] = (formats[ev.fmt] || 0) + 1;
    }
    const levels = { error: 0, warn: 0, info: 0, debug: 0, other: 0 };
    let timeMin = null; let timeMax = null; let timed = 0;
    for (const ev of events) {
      levels[ev.level] = (levels[ev.level] || 0) + 1;
      if (ev.time != null) {
        timed++;
        if (timeMin == null || ev.time < timeMin) timeMin = ev.time;
        if (timeMax == null || ev.time > timeMax) timeMax = ev.time;
      }
    }
    return {
      events: events,
      stats: {
        totalLines: events.length, levels: levels, timeMin: timeMin, timeMax: timeMax,
        timed: timed, formats: formats, truncated: truncated
      }
    };
  }

  return {
    parseLog: parseLog, parseLine: parseLine, parseTime: parseTime, inferLevel: inferLevel,
    normalizeLevel: normalizeLevel, stripAnsi: stripAnsi, isFrameLine: isFrameLine, EXC_RE: EXC_RE
  };
});
