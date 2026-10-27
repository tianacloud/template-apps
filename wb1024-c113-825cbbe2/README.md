# 丫宝的减脂工作台 · 清爽版

记录饮食、运动与身体数据，查看每日四餐、热量收支、手账与趋势。记录保存在应用绑定的 SQLite；个人资料、草稿和饮水计数保存在当前浏览器。计算仅作日常参考。

在 `source.json` 填入本应用 SQLite 和 Git 实例，先执行 `schema.sql`，然后运行 `npm ci` 和 `npm run build -- <完整源码提交>`。部署入口为 `assets/app.js`，运行时使用 Tiana 动态身份和数据库连接。
