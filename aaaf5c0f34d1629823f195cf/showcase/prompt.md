请基于模板 aaaf5c0f34d1629823f195cf 制作适合我的「AD门诊评估」。先用 `tiana web init-template aaaf5c0f34d1629823f195cf --dir PROJECT_DIR --json` 拉取完整源码，读取 metadata.json 和 spec/product.md，创建本次应用自己的 SQLite 和 Git，填写变量后初始化 schema.sql 与 seed.sql。保留现有核心流程、动态账号连接与移动布局，按我的需要调整内容和样式。

源码入口：`tiana web init-template aaaf5c0f34d1629823f195cf --dir ./aaaf5c0f34d1629823f195cf-app --json`。目标目录应不存在；读取下载工程的 metadata.json，创建或复用我明确指定的 SQLite/Git，替换全部实例绑定并执行已配置的 schema 与合成 seeds，再构建和发布。
