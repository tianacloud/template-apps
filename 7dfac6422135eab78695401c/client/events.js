for (const type of ['click','change','focus']) root.addEventListener(type, async event => {
  const el = event.target.closest('[data-on'+type+']');
  if (!el) return;
  let command = el.getAttribute('data-on'+type);
  const prefix = 'event.stopPropagation();';
  if (command.startsWith(prefix)) { event.stopPropagation(); command = command.slice(prefix.length); }
  if (command === 'this.select()') { el.select(); return; }
  const match = command.match(/^(Onb|App|Add|Me|Sheet|Sample)\.([A-Za-z]+)\((.*)\)$/);
  if (!match) return;
  const args = match[3] ? (match[3].match(/'(?:\\.|[^'])*'|this\.value|-?\d+(?:\.\d+)?/g) || []).map(x => x === 'this.value' ? el.value : x[0] === "'" ? x.slice(1,-1).replace(/\\'/g,"'") : Number(x)) : [];
  if (busy) return;
  if (Store.failed) { alert('保存结果未确认，请刷新后检查数据。'); return; }
  busy = true;
  try { await window[match[1]][match[2]](...args); await Store.flush(); }
  catch (error) { console.error('保存未确认', error); alert('操作未能确认保存，请刷新后检查数据。'); }
  finally { busy = false; }
}, {capture: true, signal: eventController.signal});
