export async function mount(root, {files}) {
  try {
    if (!files?.get) throw new Error('文件服务未就绪');
    const read = async path => { const r = await files.get('template-assets/'+path); if (!r.ok) throw new Error('素材读取失败'); return r.json(); };
    const [statutes,general] = await Promise.all([read('statutes.json'),read('general-provisions.json')]);
    globalThis.__ecoData = {statutes,general};
    root.innerHTML = '<div id="app"></div>';
    await import('./main.js');
  } catch (error) { root.textContent = '法规资料加载失败，请检查文件服务后重新打开：'+error.message; }
}
