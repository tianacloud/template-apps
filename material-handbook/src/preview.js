import { mountHandbook } from './view.js';
import examples from './examples.json';

const materials = PREVIEW_MATERIALS;
let cleanup = () => {};
const button = document.querySelector('#reset-preview');
async function reset() {
  button.disabled = true; cleanup();
  const rows = structuredClone(examples);
  const store = {
    all: async () => structuredClone(rows),
    read: async id => structuredClone(rows.find(row => row.id === id)),
    async save(item, note, mutationId) {
      const index = rows.findIndex(row => row.id === item.id);
      if (index < 0 || rows[index].revision !== item.revision) return null;
      rows[index] = { ...rows[index], note, revision: String(BigInt(item.revision) + 1n), last_mutation_id: mutationId };
      return structuredClone(rows[index]);
    },
  };
  const files = {
    async bindImage(image, path) {
      if (!materials[path]) throw new Error('Example material missing');
      image.src = materials[path];
      return () => image.removeAttribute('src');
    },
  };
  const previewGuide = () => {
    const panel = document.createElement('div'); panel.className = 'guide-overlay';
    panel.innerHTML = '<section class="guide-sheet" role="dialog" aria-modal="true" aria-labelledby="guide-heading"><span class="eyebrow">FIELD NOTES</span><h2 id="guide-heading">一份轻量阅读指南</h2><p>从一张图片开始。</p><p>记下一个值得保留的细节。</p><p>下次打开时，再向前走一小步。</p><small>示例展示指南摘要，安装后的手册可下载完整 PDF。</small><button class="primary" type="button">继续阅读手册</button></section>';
    const close = () => panel.remove(); panel.querySelector('button').addEventListener('click', close);
    document.body.append(panel); panel.querySelector('button').focus();
  };
  cleanup = await mountHandbook(document.querySelector('#app'), { store, files, previewGuide });
  button.disabled = false;
}
button.addEventListener('click', () => {
  document.querySelector('.guide-overlay')?.remove();
  void reset();
});
void reset();
