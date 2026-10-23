export const ALG_TABLE = { R: [[1, 0, 0], 1, 90], L: [[-1, 0, 0], 1, 90], U: [[0, -1, 0], 1, 90], D: [[0, 1, 0], 1, 90], F: [[0, 0, 1], 1, 90], B: [[0, 0, -1], 1, 90], M: [[-1, 0, 0], 0, 90], E: [[0, 1, 0], 0, 90], S: [[0, 0, 1], 0, 90], x: [[1, 0, 0], 0, 90, "w"], y: [[0, -1, 0], 0, 90, "w"], z: [[0, 0, 1], 0, 90, "w"] };

export function expandAlg(tokens) {
    const root = [];
    const stack = [root];
    let i = 0;
    while (i < tokens.length) {
      const tk = tokens[i];
      const cur = stack[stack.length - 1];
      if (tk === "(") {
        stack.push([]);
        i++;
      } else if (tk === ")") {
        if (stack.length > 1) {
          const grp = stack.pop();
          let n = 1;
          if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
            n = Math.min(Math.max(+tokens[i + 1], 1), 99);
            i++;
          }
          for (let k = 0; k < n; k++) stack[stack.length - 1].push(...grp);
        } else {
          root.push(tk);
        }
        i++;
      } else if (/^\d+$/.test(tk)) {
        cur.push(tk);
        i++;
      } else if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
        const n = Math.min(Math.max(+tokens[i + 1], 1), 99);
        for (let k = 0; k < n; k++) cur.push(tk);
        i += 2;
      } else {
        cur.push(tk);
        i++;
      }
    }
    while (stack.length > 1) root.push(...stack.pop());
    return root;
  }

export function tokenizeAlg(text) {
    const raw = String(text).replace(/[’`´‵ʻʹ′]/g, "'").replace(/[²]/g, "2").replace(/\)(\d+)/g, ") $1").replace(/([UDLRFBMESXYZudlrfmbesxyz]w?(?:2'|'2|2|')?)([3-9]\d*)/g, "$1 $2").replace(/[()]/g, " $& ").replace(/[,;/|.\-+，；、]+/g, " ").replace(/([UDLRFBMESXYZudlrfmbesxyz]w?(?:2'|'2|2|')?)/gi, "$1 ").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
    return expandAlg(raw);
  }

export function parseAlg(text) {
    const out = [], bad = [];
    for (const raw of tokenizeAlg(text)) {
      const m = /^([UDLRFBMESXYZ])(W?)(2[']?|[']?2?)?$/i.exec(raw);
      if (!m) {
        bad.push(raw);
        continue;
      }
      const low = m[1].toLowerCase();
      const isFace = "udlrfb".indexOf(low) >= 0;
      const isW = m[2] !== "" || isFace && m[1] === m[1].toLowerCase();
      const key = low === "x" || low === "y" || low === "z" ? low : low.toUpperCase();
      const base = ALG_TABLE[key];
      if (!base) {
        bad.push(raw);
        continue;
      }
      if (isW && (base[3] || base[1] === 0)) {
        bad.push(raw);
        continue;
      }
      const suf = m[3] || "";
      const twice = suf.indexOf("2") >= 0;
      const prime = suf.indexOf("'") >= 0;
      const deg = base[2] * (prime ? -1 : 1) * (twice ? 2 : 1);
      const tok = (isW ? key + "w" : key) + (twice ? "2" : prime ? "\u2032" : "");
      out.push({ a: base[0], sigma: base[1], deg, abs: base[0], whole: !!base[3], tok, wide: isW });
    }
    return { out, bad };
  }
