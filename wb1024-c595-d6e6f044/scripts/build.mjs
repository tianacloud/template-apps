import {cp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true}); await mkdir('dist/assets',{recursive:true});
await cp('src','dist/hall',{recursive:true}); await cp('public/icon.png','dist/icon.png');
for (const page of ['','life/','dynasty/','office/','gongdou/','groupchat/','doom/']) {
  const file=`dist/hall/${page}index.html`; let html=await readFile(file,'utf8'); let count=0, pending=[];
  html=html.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi,(all,attrs='',body)=>{
    if (/\bsrc\s*=/.test(attrs) || !body.trim()) return all;
    const name=`inline-${++count}.js`; pending.push(writeFile(`dist/hall/${page}${name}`,body)); return `<script src="./${name}"></script>`;
  });
  await Promise.all(pending); await writeFile(file,html);
}
const entry = String.raw`const status = document.createElement('div');
status.id = 'simulator-status'; status.setAttribute('role', 'status');
status.style.cssText = 'position:fixed;inset:0;z-index:2;padding:40px;text-align:center;background:#eee8dd;color:#43392f;font:16px sans-serif';
status.textContent = '正在加载模拟器大厅…'; document.body.append(status);
const frame = document.createElement('iframe');
frame.id = 'simulator-frame'; frame.title = '模拟器大厅';
frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0';
document.body.append(frame);
const hallRoot = new URL('../hall/', import.meta.url);
const pages = new Set(['index.html', 'life/index.html', 'dynasty/index.html', 'office/index.html', 'gongdou/index.html', 'groupchat/index.html', 'doom/index.html']);
let navigation = 0;
function showError() { status.hidden = false; status.textContent = '页面加载失败，请检查连接后重新打开。'; }
async function openPage(url) {
  const target = new URL(url, hallRoot);
  if (target.pathname.endsWith('/')) target.pathname += 'index.html';
  if (target.origin !== hallRoot.origin || !pages.has(target.pathname.slice(hallRoot.pathname.length)) || !target.pathname.startsWith(hallRoot.pathname)) throw Error('页面地址无效');
  const sequence = ++navigation;
  status.hidden = false; status.textContent = '正在加载…';
  let html;
  try {
    const response = await fetch(target.href);
    if (!response.ok) throw Error('页面读取失败');
    html = await response.text();
  } catch (error) {
    if (sequence !== navigation) return;
    throw error;
  }
  if (sequence !== navigation) return;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Resolve local scripts/assets before srcdoc inherits the platform entry URL.
  doc.querySelectorAll('[src], link[href]').forEach(element => {
    const attribute = element.hasAttribute('src') ? 'src' : 'href';
    element.setAttribute(attribute, new URL(element.getAttribute(attribute), target).href);
  });
  frame.onload = () => {
    if (sequence !== navigation) return;
    const page = frame.contentDocument;
    if (!page) { showError(); return; }
    page.addEventListener('click', event => {
      const link = event.target.closest?.('a[href]');
      if (!link || link.hasAttribute('download') || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute('href');
      if (!href || !/^(?:\.\.?\/|(?:life|dynasty|office|gongdou|groupchat|doom)\/)/.test(href)) return;
      event.preventDefault();
      openPage(new URL(href, target)).catch(showError);
    }, true);
    status.hidden = true;
  };
  // Keep the authorized platform document mounted while loading its own assets.
  frame.srcdoc = '<!doctype html>\n' + doc.documentElement.outerHTML;
}
openPage(new URL('index.html', hallRoot)).catch(showError);
`;
await writeFile('dist/assets/app.js', entry);
console.log('TIANA_PROJECT_PARAMS '+JSON.stringify({entry:'assets/app.js',git_instance_id:JSON.parse(await readFile('source.json','utf8')).git_instance_id}));
