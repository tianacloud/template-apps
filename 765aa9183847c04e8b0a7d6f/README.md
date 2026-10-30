# 营养计算器

记录饮食，查看每日热量和宏量营养素、管理食物库与目标。数据保存在应用数据库，可通过 JSON 导入导出备份。

安装：`tiana web init-template 765aa9183847c04e8b0a7d6f --dir nutrition`，按 metadata 替换 Git 和 SQLite 实例变量并执行 schema.sql。运行 `npm ci` 与 `npm run build -- <完整提交号>` 构建，入口为 `assets/app.js`。
