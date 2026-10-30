# 上岸体质

备考任务、刷题记录、错题和身体指标的个人作战台。数据保存在应用数据库，可导出 JSON 备份；导入会覆盖当前记录。计时需保持页面运行。血压与 BMI 仅作记录提示。

用 `tiana web init-template 3a139390a3d3af5a039c7858 --dir 项目目录` 获取源码，按 metadata.json 填写 Git 和 SQLite 实例 ID，执行 schema.sql，运行 `npm ci` 与 `npm run build -- <完整源码提交号>`。构建产物位于 dist，入口为 assets/app.js。
