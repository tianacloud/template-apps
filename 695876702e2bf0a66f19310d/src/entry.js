export async function mount(root, context) {
  try {
    if (!context.files?.getUrl) throw new Error('文件服务尚未就绪');
    const names = ['bean', 'nixie', 'hammer', 'zipray'];
    const urls = await Promise.all(names.map(name => context.files.getUrl(`template-assets/karts/${name}.png`)));
    window.__kartImages = Object.fromEntries(names.map((name, index) => [name, urls[index]]));
    root.innerHTML = '<div id="app"></div>';
    await import('./main.js');
  } catch (error) {
    root.textContent = `赛车素材加载失败：${error.message}。请检查文件服务后重新打开。`;
  }
}
