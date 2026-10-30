# ModelLite

浏览器本地处理 GLB / GLTF 模型，支持体检、减面、贴图压缩、对比和导出。模型不上传。

运行 `npm ci && npm run build`，发布 dist 目录，入口为 `assets/app.js`。GLTF 外部资源需与模型一同选择；压缩网格使用随应用提供的解码器。

支持 Draco 和 Meshopt 压缩网格；为适配受限内容安全策略，解码使用 JavaScript，较大型模型的加载可能较慢。
