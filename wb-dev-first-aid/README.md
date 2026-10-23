# 码农急救包

固定词典黑话翻译、娱乐许可证图片与随机符签。

安装时按 metadata.json 配置 source.json 的 Git 实例变量。执行 `npm ci`，再从已核验的完整源码提交运行 `npm run build -- <commit>`；入口为 `assets/app.js`。

`npm run showcase` 生成自包含示例体验，数据仅在本页保留。完整应用在浏览器中完成词典解读、许可证绘制和 PNG 下载，抽签累计次数保存在当前浏览器。其他输入和签发结果关闭页面后恢复初始状态。

本应用无核心数据库需求，metadata 声明 database_required=false；只配置 Git 源码绑定，不要求创建 SQLite。
