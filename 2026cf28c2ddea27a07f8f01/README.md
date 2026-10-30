# 模型选型台

根据硬件与任务筛选和比较模型，查看显存估算与调用示例，导出报告。反馈保存在应用数据库；评分和价格仅供参考。

运行 `npm ci`，替换 source.json 中的 Git 和 SQLite 占位符，执行 schema.sql，再用 `npm run build -- <完整提交号>` 构建。

模型与平台目录由安装器放入 `template-assets/catalog.json`，应用通过文件服务读取。
