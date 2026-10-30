// Builds showcase/preview.html: one self-contained page with inline CSS and JS.
import { build } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

await build({ mode: 'showcase', logLevel: 'warn' });
const css = await readFile('dist-showcase/assets/app.css', 'utf8');
const js = (await readFile('dist-showcase/assets/app.js', 'utf8')).replaceAll('</script', '<\\/script');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>大兜力量池 · 示例体验</title><style>${css}</style></head><body><div id="app"></div><script type="module">${js}</script></body></html>`;
const bytes = Buffer.byteLength(html);
if (bytes > 500000) throw new Error(`preview.html is ${bytes} bytes; the limit is 500,000.`);
await writeFile('showcase/preview.html', html);
console.log(`showcase/preview.html ${bytes} bytes`);
