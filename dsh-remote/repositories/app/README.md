# DSH Remote 应用源码仓库

本目录是 `dsh-remote` 模板的前后端共享工程仓库，同时包含托管在 Tiana Web 的浏览器壳层（`web-src/`）与部署在 Tiana Function 的零依赖 Go Relay 后端服务（`functions/relay/`）。

## 工程结构

- `web-src/`：浏览器端托管壳层源码，包括入口模块 `dsh-remote-entry.mjs`、Service Worker `dsh-remote-sw.js`、四态交互界面 `shell-ui.js`、端到端加密 `e2ee.js`、WebRTC/Relay 多路径传输 `multipath.js` 与 `peer-path.js`、前端资源加载器 `frontend-loader.js` 及分片读写 `ws-fragments.js`。
- `remote-config.json`：运行时读取的托管配置文件，包含 Relay Function ID、Web ID、默认主机 ID（初始为空，由 Relay 动态策略下发）及应用标题。
- `icon.png`：256×256 PNG 应用图标，构建时输出至 `dist/icon.png`。
- `build.mjs`：纯 Node.js 标准库构建脚本，无第三方构建依赖。
- `functions/relay/`：零第三方依赖的 Go Relay 服务（`go.mod` 与 `main.go`），负责应用所有者身份校验、WebSocket 信令／密文转发及基于运行参数 `DSH_REMOTE_POLICY` 的动态绑定策略。

## 构建前端产物

需要 Node.js 24+。在当前目录执行：

```sh
npm ci
npm run build
```

执行成功后：

- `dist/` 目录生成完整静态文件，包含全部 `web-src/` 模块、`remote-config.json` 与 `icon.png`。
- 标准输出打印 `TIANA_PROJECT_PARAMS {"entry":"dsh-remote-entry.mjs"}` 供平台打包器与 CLI 识别入口文件。

## 部署说明

1. 将本仓库中的 `/functions/relay` 目录作为 Go Function 发布，并绑定到对应的 Tiana Web 应用。
2. 确保 `remote-config.json` 中的 `functionId`、`webId` 以及 `functions/relay/main.go` 中的 `defaultWebID` 已替换为当前应用的实际 ID。
3. 发布 `dist/` 为 Web 静态产物后，打开应用并按向导在个人电脑终端运行 `npx` 绑定命令即可写入动态策略并建立加密连接。
