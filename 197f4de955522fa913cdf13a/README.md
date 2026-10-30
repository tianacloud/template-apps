# 故障复盘报告生成器

填写故障信息、时间线和改进项，选择内部或对外报告视角，检查措辞并导出 Markdown 或 HTML。页面输入保留在内存，刷新会清空；请及时导出。无需数据库。

根据 metadata.json 创建 Git 实例并填写 source.json，执行 `npm ci` 和 `npm run build -- <完整提交号>`，以 `assets/app.js` 为入口发布构建目录。
