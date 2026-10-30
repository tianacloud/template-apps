# 如实

面向美容顾问的面诊、话术与方案工具。客户资料、待办和设置保存在应用数据库。设置中可导出 JSON。

使用 `tiana web init-template dd55e93e93985fe609def6f2` 获取源码，在 source.json 中填写 Git 和 SQLite 实例 ID，执行 schema.sql 初始化数据库，执行 `npm ci` 和 `npm run build -- <完整提交号>` 构建。角色切换仅为界面视角，不能作为账号权限隔离。
