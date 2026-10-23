# 考公备考助手

五模块专项练习、错题回顾、写作素材与学习分析。

使用 Tiana 运行时身份与连接。安装时按 metadata.json 替换 source.json 的实例变量，先执行 schema（若有）。执行 `npm ci`，再从已核验的源码提交运行 `npm run build -- <commit>`；固定入口为 `assets/app.js`。不向源码填写凭据。

`npm run showcase` 生成自包含示例体验，示例数据仅在页面中保留。完整应用的记录保存到绑定的 SQLite。
