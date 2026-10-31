(() => {
  const base = new URL('../site/', document.currentScript.src);
  function bind(el) {
    for (const attr of ['src', 'href']) {
      const raw = el.getAttribute?.(attr);
      if (!raw || /^(data:|blob:|https?:)/i.test(raw)) continue;
      let path;
      try { const url = new URL(raw, document.baseURI); if (!url.href.startsWith(base.href)) continue; path = decodeURIComponent(url.href.slice(base.href.length)); } catch { continue; }
      const map = window.parent.classroomAssets;
      const resolved = map?.[path] || map?.[path.replace(/\.png$/i, '.webp')];
      if (resolved) el.setAttribute(attr, resolved);
    }
  }
  function scan(node) { if (node.nodeType !== 1) return; bind(node); node.querySelectorAll('[src],[href]').forEach(bind); }
  new MutationObserver(records => records.forEach(r => { if (r.type === 'attributes') bind(r.target); else r.addedNodes.forEach(scan); })).observe(document, {subtree:true,childList:true,attributes:true,attributeFilter:['src','href']});
  document.addEventListener('DOMContentLoaded', () => scan(document.documentElement));
})();
