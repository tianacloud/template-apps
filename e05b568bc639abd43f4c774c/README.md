# 周报工坊

四区整理事项、按周归档、模板载入、统计与文本复制，支持 JSON 备份迁移。

使用 `npm ci`、`npm run build -- COMMIT` 构建，入口 `assets/app.js`，图标 `icon.png`。创建 SQLite 与 Git 后填写 source.json 的变量，执行 schema.sql，再创建绑定两项资源的 Web。应用使用平台动态鉴权与运行时连接。刷新重新读取云端记录，写入冲突时按提示重新读取。导入将替换所有周，建议先导出备份。
