export async function mount(root, { files }) {
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL("echarts.min.js", import.meta.url).href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  const { initialize } = await import("./main.js");
  initialize(root, files);
}
