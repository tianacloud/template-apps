# 持仓体检表

录入持仓、成本和现价，查看组合结构、盈亏及风险建议。数据保存在应用数据库，可导出 JSON；不提供自动行情。

运行 `npm ci && npm run build`。按 metadata.json 填入 SQLite 和 Git 实例 ID，初始化 schema.sql，再创建 Web 并发布 dist。
