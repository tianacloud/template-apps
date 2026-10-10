# 日历

适合日历和日程管理应用，包含日程录入、分类和时间安排。

本目录是完整可编辑源码工程。新应用默认由 Agent 创建所需的 SQLite 和 Git 实例并等待就绪；用户明确指定已有实例时核实后复用。实例名称由 Agent 根据当前应用命名，绑定使用 CLI 实际返回的实例 ID。

Agent 按 metadata.json 的 variables，将 source.json 中 SQLITE_INSTANCE_ID、GIT_INSTANCE_ID 对应的随机占位符替换为本次实际 ID；所有出现文件都在 files 中列明。按文件语法写入值并核对 JSON。

随后使用 source.json 的 database_instance_id 对应 SQLite 执行 schema；存在 seeds 时在 schema 之后执行。未配置或文件不存在的项跳过。SQL 失败时先处理结果，再继续交付。

执行 npm ci 安装锁定依赖。按公开 tiana-web／tiana-git 技能流程提交完整源码、推送并核验远端引用，取得客户源码的完整 commit，再执行 node scripts/build.mjs <客户源码commit>。构建输出 TIANA_PROJECT_PARAMS 中的 entry、database_instance_id、git_instance_id、source_commit 配置到 MGR Web 项目，其中 SQLite ID 与执行 schema/seeds 的实例一致。输出 dist/ 通过 tiana web serve 预览及 tiana web publish 发布。模板出处 commit 与客户源码 commit 分别记录。

产品资料见 docs/；数据库结构见 schema.sql。作者先在独立目录用自己的实例调试，再将实例绑定参数化为模板。公开前检查源码、拟推送提交和实际 ZIP，移除秘密、真实客户数据及内部资料。
