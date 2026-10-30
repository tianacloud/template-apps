# 四象限待办助手

按重要性和紧急性整理待办，支持分类、日期、拖拽、搜索、统计和 JSON 导出。任务保存在应用数据库。

安装依赖后执行 `npm run build`，构建结果位于 dist，入口为 assets/app.js。需要源码绑定时在 source.json 中填写 Git 和 SQLite 实例 ID，并通过 schema.sql 初始化数据库。
