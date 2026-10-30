# 凌晨三点 · Oncall 指挥台

四场故障指挥演练。每项诊断和处置推进时间，沟通并行；结算评分、复盘及战绩卡。

安装后的各关最高成绩保存在应用绑定的 Tiana SQLite 数据库，获授权访问同一应用时读取同一份成绩。单局临时状态在页面内计算。市场预览只使用当前页面的本地示例，恢复示例不影响安装后的云端数据。

按 metadata.json 设置 SQLite 与 Git 绑定，使用同一 SQLite 执行 schema.sql。运行 `npm ci`、`npm test`，再执行 `npm run build -- <完整提交号>`，产物位于 dist。构建入口为 src/app.js，关卡数据在 src/data.js，演练界面在 src/game.js，云端成绩读写在 src/scores.js 和 src/db.js。应用使用 Tiana 运行时的动态账号鉴权，不配置静态凭据。
