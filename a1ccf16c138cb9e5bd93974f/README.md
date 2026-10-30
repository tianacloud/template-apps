# 双十一优惠监控

记录商品、平台、当前价和目标价，手动更新现价并查看达标状态。清单保存在应用数据库；不自动获取电商价格或发送后台通知。

使用 `tiana web init-template a1ccf16c138cb9e5bd93974f --dir DIR` 获取源码，按 metadata.json 配置 Git 和 SQLite 并执行 schema.sql 后运行 `npm ci` 和 `npm run build -- COMMIT`。
