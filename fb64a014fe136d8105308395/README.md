# 建筑消防给水计算器

输入建筑概况和消防、生活给水参数，计算流量、水池、分区及泵扬程，导出 Word 或打印。结果须由设计人复核。主题设置保存在 Tiana 数据库；计算参数为临时状态。

安装：`tiana web init-template fb64a014fe136d8105308395 --dir PROJECT`，替换 source.json 的 Git 和 SQLite 实例占位符，并执行 schema.sql，执行 `npm ci && npm run build`。
