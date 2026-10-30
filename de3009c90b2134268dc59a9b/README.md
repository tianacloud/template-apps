# 文书档案工作台

整理档案匣、资料、状态和密级，支持搜索、二维码、拍照识别、日志和备份。档案数据保存在应用数据库，照片保存在应用文件目录。

安装依赖 `npm ci`，运行 `npm run build` 生成 `dist`。在 source.json 配置 Git 和 SQLite 实例 ID，初始化 schema.sql。Web 入口为 `assets/app.js`。识别模型来自 Tesseract tessdata_fast，采用 Apache-2.0 许可。
