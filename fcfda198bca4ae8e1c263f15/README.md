# 恋爱日记

记录两人的昵称、日期、照片和故事，按时间回看，导出 JSON 备份或独立 HTML 回忆短片。记录保存在应用数据库，照片保存在应用文件目录。多个会话同时编辑时，遇到冲突请重新打开并核对后再修改。

运行 `npm ci && npm run build` 构建。按照 metadata.json 替换 `source.json` 中的 Git 和 SQLite 占位符，并执行 `schema.sql` 初始化数据库。旧浏览器版本可先导出 JSON 备份，再在新应用导入。
