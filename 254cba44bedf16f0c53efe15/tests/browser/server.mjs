import { build } from 'vite';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
await build({ build: { outDir: 'test-results/browser-dist' } });
const directory = resolve('test-results/browser-dist');
const html = `<!doctype html><html lang="zh-CN"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="app"></div><script>window.tiana={appId:'fixture-app',auth:{getAccessToken:async()=> 'fixture-only'},connection:async()=>({origin:'https://ep-00000000000000000000000000.fixture.test',sql_api:'hrana-v3'})}</script><script type="module" src="/assets/app.js"></script></html>`;
createServer(async (req,res) => {
  if (req.url === '/') { res.setHeader('content-type','text/html; charset=utf-8'); res.end(html); return; }
  if (!/^\/assets\/[a-zA-Z0-9._-]+\.(js|css)$/.test(req.url ?? '')) { res.writeHead(404).end(); return; }
  try { res.setHeader('content-type',req.url.endsWith('.css') ? 'text/css' : 'text/javascript'); res.end(await readFile(directory + req.url)); }
  catch { res.writeHead(404).end(); }
}).listen(4189,'127.0.0.1');
