export async function mount(root, {files}) {
  try {
    const [cssResponse, manifestResponse] = await Promise.all([fetch(new URL('./style.css',import.meta.url)),fetch(new URL('./font-manifest.json',import.meta.url))]);
    if (!cssResponse.ok || !manifestResponse.ok) throw new Error('样式加载失败');
    let css=await cssResponse.text();
    const paths=await manifestResponse.json();
    for (const path of paths) {
      const response=await files.get('template-assets/'+path);
      if (!response.ok) throw new Error('字体加载失败');
      const url=URL.createObjectURL(await response.blob());
      css=css.replaceAll('FORMA_FONT_'+path.split('/')[1].split('.')[0],url);
    }
    const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
    await import('./viewer.js');
  } catch (error) { root.textContent='应用素材加载失败，请检查网络后重新打开。'; console.error(error); }
}
