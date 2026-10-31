# 职称题库

个人刷题及文档导入工具，题库与进度保存在云端数据库，可导出备份。支持 DOCX、XLSX、CSV、TXT、Markdown 和可提取文本的 PDF；扫描件和特殊字体 PDF 可能无法提取。

创建 Git 和 SQLite 实例并在 source.json 中填入 ID，执行 schema.sql，运行 `npm ci` 和 `npm run build -- <完整提交号>`，将 dist 发布至入口 `assets/app.js`。
