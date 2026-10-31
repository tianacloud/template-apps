# 1024 内存合并

在 4×4 棋盘上用方向键、WASD 或手势移动并合并数字；点击 BUG 修复，达到 1024 获胜。提供撤销、音效和战绩卡片下载。最高分和音效设置保存在应用的 SQLite 数据库。

使用 `npm ci && npm run build` 构建。将 `source.json` 中的 Git 和 SQLite 占位符替换为本应用的实例 ID，并在该 SQLite 实例执行 `schema.sql`。应用运行时通过 Tiana 连接读取设置。
