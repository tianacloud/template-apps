// 运行时定位应用根目录。构建产物入口固定在 <root>/assets/app.js，
// 静态资源（字体、拆字资料）由平台按相对路径从 <root>/ 提供。
// 开发服务器下模块位于 /src/，退回站点根。
export function webRoot() {
  const url = import.meta.url;
  const at = url.lastIndexOf("/assets/");
  return at >= 0 ? url.slice(0, at + 1) : new URL("/", url).href;
}

export function assetUrl(path) {
  return webRoot() + String(path).replace(/^\.?\//, "");
}
