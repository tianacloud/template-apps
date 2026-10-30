# 本周工作台

按日期和优先级管理任务，支持图片附件、完成统计及 JSON 导入导出。数据保存在应用的 SQLite 和文件目录。共享应用的授权用户可访问同一工作台。

按照 metadata.json 设置 Git 和 SQLite 实例，执行 schema.sql 初始化数据库，再运行 `npm ci` 和 `npm run build -- <完整提交号>`。
