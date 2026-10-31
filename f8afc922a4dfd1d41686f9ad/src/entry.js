export async function mount(root, { files }) {
  const urls = [];
  try {
    const paths = ["template-assets/images/image-00.jpg", "template-assets/images/image-01.jpg", "template-assets/images/image-02.jpg", "template-assets/images/image-03.png", "template-assets/images/image-04.jpg", "template-assets/images/image-05.jpg", "template-assets/images/image-06.jpg", "template-assets/images/image-07.jpg", "template-assets/images/image-08.jpg", "template-assets/images/image-09.jpg", "template-assets/images/image-10.jpg", "template-assets/images/image-11.jpg", "template-assets/images/image-12.jpg", "template-assets/images/image-13.jpg", "template-assets/images/image-14.jpg"];
    const read = async path => {
      const response = await files.get(path);
      if (!response.ok) throw new Error(`无法读取素材: ${path}`);
      return response;
    };
    window.__globeAssets = await Promise.all(paths.map(async path => {
      const url = URL.createObjectURL(await (await read(path)).blob());
      urls.push(url);
      return url;
    }));
    [window.CHINA_GEO, window.WATER] = await Promise.all(
      ['template-assets/data/china.json', 'template-assets/data/water.json'].map(async path => (await read(path)).json())
    );
    const base = new URL('.', import.meta.url);
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('style.css', base); document.head.append(css);
    root.innerHTML = await fetch(new URL('body.html', base)).then(r => { if (!r.ok) throw new Error('页面资源加载失败'); return r.text(); });
    for (const i of [0, 1, 4, 5, 6]) await new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.charset = 'utf-8'; script.src = new URL(i + '.js', base);
      script.onload = resolve; script.onerror = reject; document.body.append(script);
    });
    return () => { urls.forEach(URL.revokeObjectURL); css.remove(); };
  } catch (error) {
    urls.forEach(URL.revokeObjectURL);
    root.textContent = '素材加载失败，请检查文件访问后重新打开。';
    console.error(error);
  }
}
