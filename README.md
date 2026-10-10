# Tiana Web 模板应用

每个顶层模板目录都是完整、可编辑的应用源码工程：two-to-three、study、whiteboard、ledger、notes、calendar、team-building。team-building 是团建聚餐应用，支持餐厅候选、投票、活动安排、评论与历史复制；使用要求见[应用说明](team-building/README.md)。前六个模板的原始工程来自 agent-skills 提交 `8da60f0` 中对应 `skills/tiana-*/assets/app/`，按 MIT 许可迁移，模板专属参考资料随工程迁入 docs/。

客户 Agent 每次应用任务运行 `tiana web list-template --json`，根据 name／description 选择合适起点。`tiana web init-template <name> --dir <目录> --json` 下载 MGR 配置的私有 OSS 包并原样解压；Agent 根据根目录 metadata.json 替换变量、初始化数据库、定制应用并交付。模板的 MGR 版本由上传时自动分配，客户 CLI 按名称取得当前可用包。

## 制作和维护

1. 在独立工程中，用自己的 SQLite、Git 和 Web 应用调试产品功能。
2. 把工程整理到一个模板目录。按 [FORMAT.md](FORMAT.md) 将实际绑定改为带随机串的占位符，记录全部出现文件，编写适用说明和 SQL 初始化入口。
3. 在独立副本替换自己的实际值，验证数据库初始化、构建与关键业务。
4. 检查源码、文档、拟推送提交和最终 ZIP 适合公网查看。秘密、真实客户数据和 Tiana 内部资料须清理；不能只检查当前文件而忽略拟推送历史。
5. 提交模板源码，然后从该完整 commit 导出分发 ZIP。把已检查包通过 Gaia 上传，内部配置租户调试草稿，验证后点击发布，再用普通租户检查。

```sh
npm ci
npm run validate -- ledger
npm test
npm run test:apps
npm run pack -- ledger <完整模板源码commit>
```

打包输出 `dist/<name>/<commit>.zip` 和同名 JSON 回执，包含 source_commit、size、sha256。包内 source.commit 由打包器补齐，源码 metadata.json 不填写自己的 commit。重复打包同一提交得到同一字节摘要；客户应用源码提交由构建脚本输出，通过 MGR Web 项目管理命令保存。

Gaia 将 ZIP 同步交给 MGR，30 秒超时，失败后人工重试。上传更新同名草稿、版本递增；发布替换旧发布记录。OSS 对象为 private，客户端下载使用 MGR 生成的 15 分钟签名链接。

## 验证范围

打包测试验证确定提交导出、元信息与所有占位符位置、ZIP 内容及确定性；应用测试使用 SQLite／HTTP 和浏览器夹具验证模板构建及日常应用业务。夹具成功不能代替真实 Tiana 实例、OSS、Gaia、CLI 和宿主 Agent 验收。
