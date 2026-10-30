// Preview page entry: the same components with in-memory sample data.
import { createApp, h } from 'vue';
import ShowcaseShell from './ShowcaseShell.vue';
import { makeRouter } from './router.js';
import { start } from './store.js';
import { reset } from './data/memory.js';
import { configureFiles } from './files.js';
const previewFiles = new Map();
configureFiles({ async put(path, blob) { previewFiles.set(path, URL.createObjectURL(blob)); }, async getUrl(path) { return previewFiles.get(path); } });
// The preview cannot fetch web fonts, so it embeds a subset of the handwriting face (SIL OFL 1.1).
import previewFont from './assets/zcool-xiaowei-preview.woff2?inline';
import './style.css';

const router = makeRouter(true);
async function restore() { reset(); await start(); await router.replace('/diary'); }
const face = document.createElement('style');
face.textContent = `@font-face{font-family:"ZCOOL XiaoWei";src:url(${previewFont}) format("woff2");font-display:swap}`;
document.head.append(face);
createApp({ render: () => h(ShowcaseShell, { reset: restore }) }).use(router).mount('#app');
router.replace('/diary');
start();
