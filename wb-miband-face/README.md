# 表盘工坊

在浏览器中将 GIF 或视频转换为小米手环 11 的动态 `.face` 文件。可调整编码、帧率、截取范围、息屏和文字叠加。素材与生成结果仅在浏览器内处理；不需要数据库。

使用 `tiana web init-template wb-miband-face` 获取源码，按 metadata.json 绑定 Git 实例，执行 `npm ci && npm run build`，以 `assets/app.js` 为 Web 入口发布。生成文件须由用户自行安装到设备。
