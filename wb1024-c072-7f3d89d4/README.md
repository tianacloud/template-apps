# CET-6 词汇训练营

按题型、数量、词汇级别和顺序训练，支持归档重刷、收藏、查词和学习统计。进度存储于应用绑定的 SQLite 中。

按 metadata.json 配置 SQLite 与 Git 实例，执行 schema.sql 初始化，再运行 `npm ci && npm run build`。应用使用 Tiana 运行时认证与数据库连接。
