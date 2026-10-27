const base = new URL('.', import.meta.url);
async function unpack(name) { const r = await fetch(new URL(name, base)); if (!r.ok) throw Error('无法加载应用资源'); return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text(); }
const [html, data] = await Promise.all([unpack('shell.html.gz'), unpack('data.json.gz')]);
window.__wordData = JSON.parse(data);
document.open(); document.write(html); document.close();
for (const name of ['pixi.min.js','unsafe-eval.min.js','live2d.min.js','cubism2.js','runtime.js']) await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = new URL(name,base); script.onload = resolve; script.onerror = reject; document.body.appendChild(script); });
