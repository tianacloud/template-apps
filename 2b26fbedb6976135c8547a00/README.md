# 成绩分析看板

自定义科目、满分和折算系数，录入考试成绩并查看趋势、对比、得分率与建议。数据保存在应用数据库，可导出或导入 JSON 备份。

安装前为应用创建 Git 实例并在 source.json 中填入实例 ID。运行 `npm ci` 和 `npm run build`，将 dist 发布为入口 `assets/app.js` 的 Web 应用。需要 SQLite 数据库并执行 schema.sql。
