# 篮场纪事

单人 3D 篮球游戏：快速比赛、热身、故事、球员收藏和赛季。进度保存在应用数据库。需要支持 WebGL 的浏览器。

安装模板后将 `source.json` 的 Git 和 SQLite 实例占位符替换为本应用实例 ID。执行 `npm ci`，然后 `npm run build -- <完整 Git 提交号>`；发布 `dist`，入口 `assets/app.js`。需要 SQLite 数据库并先执行 schema.sql。随模板安装的图片和字体位于应用文件目录。桌面用 WASD 移动、空格投篮、E 传球、Q 切换、F 抢断、Shift 冲刺；手机使用屏幕控件。
