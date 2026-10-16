# Tiana Web 模板应用

每个顶层模板目录都是完整、可编辑的应用源码工程：two-to-three、study、whiteboard、ledger、notes、calendar、team-building、neon-coast、sunlit-album、nes-loader。team-building 是团建聚餐应用，支持餐厅候选、投票、活动安排、评论与历史复制；使用要求见[应用说明](team-building/README.md)。前六个模板的原始工程来自 agent-skills 提交 `8da60f0` 中对应 `skills/tiana-*/assets/app/`，模板专属参考资料随工程迁入 docs/。

Tiana 自有代码统一采用 [Apache-2.0](LICENSE) 许可证；第三方代码与素材遵循各模板保留的许可及署名说明。

neon-coast 是带 SQLite 云端存档的单人 3D 城市驾驶游戏，包含街头任务、车库购车、引擎升级与键盘／触控操作；使用要求见[游戏说明](neon-coast/README.md)。

sunlit-album 是轻盈的照片相册，支持文件存储、自动缩略图、轮播、收藏和评论；使用要求见[应用说明](sunlit-album/README.md)。

nes-loader 是支持 ROM 文件上传、独立 SQLite 存档、卡带搜索与整理、键盘及手机摇杆的红白机模拟器，包含默认图标，不附带游戏 ROM；使用要求见[应用说明](nes-loader/README.md)。

客户 Agent 每次应用任务运行 `tiana web list-template --json`，根据 name／description 选择合适起点。`tiana web init-template <name> --dir <目录> --json` 下载 MGR 配置的私有 OSS 包并原样解压；Agent 根据根目录 metadata.json 替换变量、初始化数据库、定制应用并交付。模板的 MGR 版本由上传时自动分配，客户 CLI 按名称取得当前可用包。

baby-growth 是面向新生儿家庭的「宝贝成长记」，提供宝宝档案、身高体重曲线和卫健委标准参考、辅食日历、家庭收支、每日事项、疫苗、乳牙萌出和成长里程碑；以手机为主，兼容桌面。使用要求见[应用说明](baby-growth/README.md)。

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


bedtime-talk（睡前聊聊）提供亲子问题卡与对话记录；zhiji（知己）提供个人周期与身体感受记录。本次以各自已公开来源提交 `2a572775` 和 `d9eaac38` 收入统一材料构建。

## 灵光一闪发布材料

每个模板的 `showcase/` 提供独立 HTML 示例、WebP 封面和做同款提示词。先核对预览，再运行 `node scripts/render-showcase.mjs NAME` 更新截图；将源码和展示材料提交后，运行 `npm run pack -- NAME COMMIT` 生成 `.install.zip`。上传此包到 Gaia，编辑分组／标签／提示词后发布。包结构及一键安装说明见 [FORMAT.md](FORMAT.md#灵光一闪展示源码与可安装产物)。

### 从实际应用生成可操作预览

运行 `node scripts/build-live-showcase.mjs <模板名>`，先在 `dist/live-showcases/` 生成仅供本地提取界面的真实应用演示。再运行 `node scripts/build-light-showcase.mjs <模板名> ...`，从实际渲染页面提取结构、样式和选中的展示状态，生成可发布的轻量预览。页面内交互由 `scripts/light-showcase-runtime.js` 维护；大型游戏展示真实界面与操作指南，完整游戏通过安装体验。

发布的 `showcase/preview.html` 压缩前不超过 500,000 字节，所有展示资源自包含；恢复示例直接重置页内状态。使用 `node scripts/check-live-showcases.mjs <模板名> ...` 在 Console 的 sandbox/CSP 下检查展示、选定流程、连续恢复及手机布局，并生成同份预览的封面。结果保存在 `dist/showcase-validation/`。完整应用的安装构建仍使用原应用源码；图标统一为 `public/icon.png`，256×256 PNG，构建根目录输出 `icon.png`。
