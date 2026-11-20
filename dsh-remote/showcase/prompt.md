请基于 Tiana 的「DSH Remote」（`dsh-remote`）官方模板，为我制作一个远程连接本地 DeepSeek Harness（DSH）工作台的 Web 应用。

先读取 Tiana 技能和 CLI 帮助，通过 `tiana web init-template dsh-remote --dir dsh-remote-app --json` 拉取模板源码，完整阅读根目录 `README.md`、`repositories/app/README.md` 和 `metadata.json`。本模板不需要 SQLite 数据库（`database_required: false`），包含前端静态壳层与位于 `repositories/app/functions/relay` 的 Go Relay 后端服务；请使用实际创建的 Function ID 与 Web ID 回执替换 `metadata.json` 中声明的全部占位符，将 Relay Function 发布并绑定到 Web 应用后，在 `repositories/app` 中运行 `npm ci` 和 `npm run build` 构建并发布 Web 应用。

希望保留的核心能力：
- 零公网 IP 远程连接个人电脑上的本地 DSH 工作台，支持本地项目对话、文件访问与已放行的插件界面；
- 浏览器与个人电脑之间采用 `ECDH P-256 + HKDF-SHA256 + AES-256-GCM` 端到端加密；CLI 默认将配对密钥写入系统剪贴板并单独打开不含密钥的干净访问链接（配对密钥不上传云端，中继仅转发密文），若从旧版带 `#rk=`／`#k=` 片段的链接进入，前端读取后立即通过 `history.replaceState` 移除地址栏片段；
- 支持 WebRTC P2P 直连与 Tiana Function Relay 加密中继双通道自动切换；
- 保留首次绑定向导（生成 `npx` 一键配置命令并监听主机上线）、主机离线看板、端到端密钥解锁与在线工作台断线重连轻提示四态界面；
- 保持 Relay Function 通过运行参数动态加载 `DSH_REMOTE_POLICY` 的免重编译绑定机制。

在开始修改前，请先向我确认是否需要定制应用名称、图标、品牌样式或向导文案，再完成构建、发布与可访问性验收，最后提供应用访问地址。
