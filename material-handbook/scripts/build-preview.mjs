import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const cover = await readFile(new URL('../template-files/images/cover.webp', import.meta.url));
const css = await readFile(new URL('../src/style.css', import.meta.url), 'utf8');
const bundle = await build({ entryPoints: ['src/preview.js'], bundle: true, write: false, format: 'iife', target: 'es2022', minify: true, loader: { '.svg': 'dataurl' },
  define: { PREVIEW_MATERIALS: JSON.stringify({ 'template-assets/images/cover.webp': `data:image/webp;base64,${cover.toString('base64')}` }) } });
const script = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>素材手册 · 示例体验</title><style>${css}\n.guide-overlay{position:fixed;inset:0;background:#193b3a66;display:grid;place-items:center;padding:20px;z-index:10}.guide-sheet{background:#fffdf7;border-radius:18px;max-width:440px;padding:30px;box-shadow:0 20px 60px #193b3a44}.guide-sheet p{font-size:14px;line-height:1.8}.guide-sheet small{display:block;color:#6b7e6e;line-height:1.7;margin:20px 0}</style></head><body><div class="preview-toolbar"><span>示例体验<small>本页笔记仅用于体验</small></span><button id="reset-preview" disabled>恢复示例</button></div><div id="app"></div><script>${script}</script></body></html>`;
if (Buffer.byteLength(html) > 500000) throw new Error('Showcase exceeds the 500,000 byte budget');
await mkdir(new URL('../showcase/', import.meta.url), { recursive: true });
await writeFile(new URL('../showcase/preview.html', import.meta.url), html);
console.log(JSON.stringify({ preview_bytes: Buffer.byteLength(html), self_contained: true }));
