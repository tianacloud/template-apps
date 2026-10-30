# 码农急救包

固定词典黑话翻译、娱乐许可证图片与随机符签。

安装时按 metadata.json 配置 source.json 的 SQLite 和 Git 实例变量。执行 `npm ci`，再从已核验的完整源码提交运行 `npm run build -- <commit>`；入口为 `assets/app.js`。

`npm run showcase` 生成自包含示例体验，数据仅在本页保留。完整应用在浏览器中完成词典解读、许可证绘制和 PNG 下载，抽签累计次数保存在应用数据库。其他输入和签发结果关闭页面后恢复初始状态。

本应用使用 SQLite 保存累计次数，安装时配置 SQLite 和 Git 绑定。
