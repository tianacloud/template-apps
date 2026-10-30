# 老李的世界online

记录经历、培养技能和宠物、安排每日任务。玩家档案和进度保存在应用 SQLite，预设图片通过应用文件存储读取。

在 `source.json` 填入应用所绑定的 SQLite 和 Git 实例，执行 `schema.sql`，运行 `npm ci` 后以 `npm run build -- <完整提交号>` 构建。运行时通过 Tiana 账号鉴权和数据库连接工作。模板安装器将预设图片放在应用的 `template-assets/img/` 目录。
