# 待办管理

使用多个列表整理个人任务，支持子任务、置顶、星标、归档恢复、图片和 Markdown 导出。任务数据保存在应用数据库，图片保存在应用文件存储。

安装依赖 `npm ci`，运行 `npm run build -- <完整源码提交号>`，将 dist 发布为 Tiana Web。按 metadata 配置数据库并执行 schema.sql；source.json 中的数据库与 Git 实例占位符在创建应用时替换为实际实例 ID。
