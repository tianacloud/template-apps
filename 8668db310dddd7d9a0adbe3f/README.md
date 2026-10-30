# DailyBuild 交付前线

登记构建与现场升级任务，跟踪阶段、记录日志并生成 Bash 交付脚本。脚本示例须按现场条件检查和修改后才执行；页面不远程执行操作。应用共享同一数据库。

填写 source.json 中的 SQLite 和 Git 实例 ID，先在 SQLite 上执行 schema.sql；运行 `npm ci` 和 `npm run build`，将 dist 发布到绑定这些实例的 Web。
