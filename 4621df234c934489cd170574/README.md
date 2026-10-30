# 通勤决策台

输入时间安排、天气和最多八条路线的固定耗时与波动，模拟到岗概率并比较路线。配置保存在应用数据库；不会自动获取路况或天气。

安装依赖：`npm ci`。在 `source.json` 填入新建的 Git 实例 ID，再运行 `npm run build -- <完整提交号>`。在 SQLite 实例执行 schema.sql，并在 source.json 填入 SQLite 实例 ID。
