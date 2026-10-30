# PromptLab · 提示词体检优化器

输入提示词并开始体检，查看八维评分及建议，追加补强片段或复制结构化专业版。输入保存在应用数据库。

运行 `npm ci && npm run build`，输出 `dist`，入口为 `assets/app.js`。安装源码时在 `source.json` 填入本应用的 Git 和 SQLite 实例 ID，先执行 schema.sql 初始化数据库。数据库通过应用运行时连接。
