# 时差保安

比较两座城市当前时间，查看适合联系的时段。城市、主题和时制偏好保存在应用数据库；没有消息发送或提醒功能。

按 metadata.json 填入 Git 和 SQLite 实例 ID，并执行 schema.sql，再以 `npm ci` 和 `npm run build -- <完整源码提交号>` 构建。入口为 `assets/app.js`，构建输出包含应用图标。时区和夏令时取自浏览器的 Intl 数据。可在 client 目录调整城市资料、界面和文案。
