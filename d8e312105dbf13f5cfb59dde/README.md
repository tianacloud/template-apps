# 程序员解压所

五个在浏览器里运行的轻量互动：粉碎文字、今日黄历、橡皮鸭、甩锅话术和许愿池。愿望、计数和音效设置保存在应用数据库。

创建 Git 和 SQLite 实例，按 metadata.json 替换 source.json 中的占位符，并在 SQLite 执行 schema.sql。安装依赖 `npm ci`，以完整源码提交执行 `npm run build -- <commit>`，构建输出位于 dist，入口为 app.js。可修改话术、颜色和交互内容。
