# 以剑开局

俯视角生存动作游戏。选择职业、难度和命途，拾取经验并搭配随机卡牌，挑战关卡首领。支持键盘和触摸，游戏进度保存在绑定的 SQLite 数据库中。

安装依赖 `npm ci`。配置 `source.json` 的 SQLite 和 Git 实例 ID，执行 `schema.sql` 初始化表后运行 `npm run build`。将 `dist` 发布到入口为 `assets/app.js` 的 Tiana Web；需要支持动态鉴权的运行时和 Hrana SQL 协议。
