# 不忙

用四象限和时间轴安排个人待办。每件事有三个维度：重要、紧急、时间。

- **四象限**：马上做（重要·紧急）、安排做（重要·不紧急）、快速做（紧急·不重要）、放一放（不重要·不紧急）。卡片可拖到其他象限，勾选完成后可撤销，可切换显示已完成。
- **时间轴**：顶部按周横向选日期；中间横排当天「待安排」事项（未定日期的、当天未定时间的，以及今天之前逾期未定时间的）；下方纵向 24 小时。把事项拖进时间轴即定时（15 分钟对齐），可拖动改时间、拉底边改时长、拖回待安排取消定时，或拖到顶部某天改日期。点空白时段新建该时段事项。
- 手机长按约 0.25 秒开始拖动，轻滑仍是滚动；桌面按住拖动。移动端底部导航与新建按钮优先，桌面为顶部切换。

单人使用。不含提醒通知、重复日程、跨天事项、多人协作和外部日历同步。

## 初始化与构建

需要 Node.js 22.5+、Tiana CLI、支持 `hrana-v3` 的 SQLite 实例及 Git 实例。

1. 按 `metadata.json`，由 Agent 为本次应用创建 SQLite 和 Git 实例，将实际 ID 填入 `source.json`；用户明确指定已有实例时先核实再复用。
2. 在同一个 SQLite 实例执行 `schema.sql`。本模板不提供种子数据，首次打开为空。
3. `npm ci` 安装锁定依赖，提交源码并推送到本次 Tiana Git，核对远端引用。
4. 从已推送的完整提交构建：

```sh
node scripts/build.mjs <完整源码提交号>
```

产物在 `dist/`，入口 `assets/app.js`。构建输出的 `TIANA_PROJECT_PARAMS` 含入口、SQLite/Git 绑定和源码提交号，用于创建或更新 Web 项目（`tiana web create … --entry assets/app.js --database-instance-id … --git-instance-id …`）。用 `tiana web serve` 预览、`tiana web publish` 发布并用 `tiana web status` 核对；参数以安装版本的帮助为准。

账号鉴权与数据库地址来自运行时 `window.tiana.auth`、`window.tiana.connection()`；数据按 `window.tiana.appId` 隔离，同库多个应用互不可见。

## 数据

`bumang_tasks` 一张表：标题、备注、`important`/`urgent`（0/1）、`day`（本地日期，可空）、`start_minute`（当天第几分钟，可空，需有日期）、`duration_minutes`（15–1440，不跨午夜）、完成状态与时间。约束写在 `schema.sql`。

拖动和勾选先更新界面再写库；写入失败时读回该行恢复界面。响应丢失时先读回核实，不重复写入。编辑表单等数据库确认后才关闭。

## 定制

- 象限名称、说明：`src/layout.js` 的 `QUADRANTS`；空象限提示：`src/matrix.js`。
- 颜色与布局：`src/style.css` 顶部变量；900px 以上为桌面布局。
- 时长选项：`src/editor.js` 的 `DURATIONS`；拖动对齐粒度：`src/layout.js` 的 `SNAP`。
- 时间轴每分钟 1px（每小时 60px），拖动换算依赖这一比例。

## 测试

```sh
node scripts/build.mjs <完整提交号>
npx playwright install chromium
npm test
```

浏览器测试用内存 SQLite 夹具（`tests/fixture.mjs`）覆盖新建、换象限、完成与撤销、刷新后数据、托盘拖入时间轴、移动、调整时长、拖回托盘、拖到其他日期、手机长按拖动与布局，以及写入响应丢失后的核实。夹具不代替真实 Tiana 实例验收。

## 预览

`showcase/preview.html` 由真实界面代码构建，只把 `src/store.js` 换成内存版 `src/preview-store.js`（示例数据围绕打开时的当前时间生成），并内联全部脚本与样式，可在 `sandbox="allow-scripts"` 中运行，不连接数据库或网络。入口 `src/preview.js` 加入「示例体验」提示条与恢复示例，并代为提交表单（该 sandbox 不允许原生表单提交）。修改界面后重新生成：

```sh
npm run build:preview
```

预览文件与 `showcase/cover.webp` 一并提交；封面在 template-apps 根目录用 `node scripts/render-showcase.mjs bumang` 从同份预览生成。

产品说明见 [docs/product.md](docs/product.md)。
