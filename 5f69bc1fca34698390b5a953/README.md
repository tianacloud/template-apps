# 打工人小账本

个人收支记录、分类统计、日历查询和多账本；数据保存在应用的 SQLite 数据库，可通过 JSON、CSV 和 Excel 搬账。

填写 source.json 中 Git 与 SQLite 实例 ID，执行 schema.sql 和 seed.sql，再运行 `npm ci && npm run build -- <完整源码提交>`。产物位于 dist。
