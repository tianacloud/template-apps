# DSH Remote

DSH Remote 是 Tiana 的托管 Web + Function 组合应用模板，用于在浏览器中安全、低延迟地远程访问个人电脑上运行的本地 DeepSeek Harness（DSH）工作台，无需公网 IP 或端口映射。

## 核心能力

- **端到端加密（E2EE）**：浏览器与本地 DSH 主机之间直接执行 `ECDH P-256 + HKDF-SHA256 + AES-256-GCM` 握手与帧加密；CLI 引导默认将 `dshk1_...` 配对密钥写入系统剪贴板并单独打开不含密钥的干净访问 URL（配对密钥不上传云端存储，云端中继仅转发密文）；若通过旧版含 `#rk=` 或 `#k=` 片段的链接进入，网页壳层会在单次读取 `rk`（如存在）后立即调用 `history.replaceState` 从地址栏移除 `rk` 与 `k` 片段。
- **WebRTC P2P / Relay 双通道**：优先协商 WebRTC DataChannel 点对点直连，受限网络环境自动无缝回退至 Tiana Function 加密中继。
- **四态壳层交互体验**：内置首次绑定向导（Onboarding）、主机离线看板（Host Offline）、端到端密钥解锁（Unlock）与在线工作台断线重连轻提示胶囊，适配桌面浏览器、移动浏览器与小程序容器。
- **免重编译动态绑定**：Relay Function 启动时从运行配置动态读取 `DSH_REMOTE_POLICY`，本机通过 `@tianacloud/dsh-remote` CLI 完成绑定或换绑时无需重新编译前端静态包。

## 目录结构

```text
dsh-remote/
├── metadata.json               # 模板元信息、共享仓库、Relay Function 与变量清单
├── README.md                   # 本模板说明
├── showcase/
│   ├── preview.html            # 自包含交互式预览（纯内存示例状态）
│   ├── cover.webp              # 1280×800 封面图
│   └── prompt.md               # 做同款提示词
└── repositories/
    └── app/                    # 前端壳层与 Go Relay Function 共享仓库
        ├── build.mjs           # 零依赖 Node 构建脚本
        ├── package.json
        ├── package-lock.json
        ├── icon.png            # 256×256 应用图标
        ├── remote-config.json  # 运行时前端配置（含 Relay Function ID 与 Web ID 变量）
        ├── web-src/            # 浏览器壳层、E2EE、WebRTC/Relay 多路径与四态 UI 源码
        └── functions/
            └── relay/          # 零第三方依赖 Go Relay 后端服务源码
```

## 快速开始

### 方式一：应用市场一键安装

在 Tiana 应用市场安装 **DSH Remote** 后直接打开应用，按页面首次绑定向导在个人电脑终端运行提示的 `npx` 命令即可完成本机 DSH 环境配置与云端绑定。

### 方式二：基于源码定制开发

需要 Node.js 24+、Go 1.24+ 及 Tiana CLI。

1. 使用 Tiana CLI 拉取模板源码：

```sh
tiana web init-template dsh-remote --dir dsh-remote-app --json
```

2. 查看 `metadata.json` 中的变量清单，创建或关联 Web 应用与 Relay Function（源码目录为 `/functions/relay`），将实际回执中的实例 ID 替换到 `repositories/app/remote-config.json` 与 `repositories/app/functions/relay/main.go` 对应占位符处。
3. 进入 `repositories/app/` 安装并构建前端静态产物：

```sh
cd repositories/app
npm ci
npm run build
```

构建产物输出至 `repositories/app/dist/`，入口文件为 `dsh-remote-entry.mjs`，同时输出 `icon.png` 与 `remote-config.json`。详细开发与验证步骤见 [repositories/app/README.md](repositories/app/README.md)。

## 使用边界

- 本模板无需 SQLite 数据库（`database_required: false`）。
- 个人电脑端需具备 `Node.js >= 24.9.0`；执行向导命令时，若本机尚未安装 DSH 会自动安装并启用所需插件，已有 DSH 实例则会保留既有工作区与对话记录。
- 每个 DSH Remote 应用实例对应绑定一台个人电脑（支持通过 `--rebind` 换绑）；如需同时连接多台电脑，可在 Tiana 中安装多个应用实例分别命名区分。
