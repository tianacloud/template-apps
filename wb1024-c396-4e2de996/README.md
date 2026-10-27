# 牛马每日待办

每天记录任务，勾选完成、删除任务，查看进度并顺延之前未完成的任务。数据保存于应用绑定的 SQLite。

创建 SQLite 和 Git 实例，替换 source.json 的变量，执行 schema.sql 初始化表；执行 npm ci 后以 `npm run build -- <完整提交号>` 构建。部署 Web 时绑定相同数据库和 Git，入口为 assets/app.js。
