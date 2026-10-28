for (const type of ['click','change','focus']) document.addEventListener(type, event => {
  const el = event.target.closest('[data-on'+type+']');
  if (!el) return;
  let command = el.getAttribute('data-on'+type);
  const prefix = 'event.stopPropagation();';
  if (command.startsWith(prefix)) { event.stopPropagation(); command = command.slice(prefix.length); }
  if (command === 'this.select()') { el.select(); return; }
  const match = command.match(/^(Onb|App|Add|Me|Sheet|Sample)\.([A-Za-z]+)\((.*)\)$/);
  if (!match) return;
  const args = match[3] ? (match[3].match(/'(?:\\.|[^'])*'|this\.value|-?\d+(?:\.\d+)?/g) || []).map(x => x === 'this.value' ? el.value : x[0] === "'" ? x.slice(1,-1).replace(/\\'/g,"'") : Number(x)) : [];
  window[match[1]][match[2]](...args);
}, true);
