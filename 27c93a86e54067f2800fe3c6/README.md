# 日有回响 · DayEcho

一个暖色系的个人计划应用。把截止日倒推成每天的小步，在日历中安排任务，记录实际投入，留下每天的回响。

## 功能

- 桌面三栏工作台：导航、连续双月日历、可拖拽的任务池；支持周视图、月份跳转和侧栏收起。
- 手机周日期条、可展开的月历、当天事项、底部导航和个人工具页。
- 计划项目、模块与任务；五类可编辑的项目预设、任务批量录入、自定义颜色。
- 截止日倒推、每日安全线、容量设置、部分完成、实际用时、撤销、估算校准和智能排期预览。
- 可搜索筛选的事项、每日随记自动保存、数据统计与回响之书。
- CSV、ICS、完整 JSON 备份；回响之书支持浏览器打印或另存为 PDF。
- 五种主题，包括夜间模式；新建快捷键 N。

应用的云端版本使用 Tiana 账号与 SQLite，写入带版本检查，并发修改时保留草稿；提交结果不明时核实操作回执，不自动重复写入。运行时要求动态 `window.tiana.auth`、`connection()` 与 Hrana v3。

## 本地运行

需要 Node.js 22.22.2 或更新版本。

```sh
npm ci
npm run build
npm run preview
```

打开 `http://localhost:4182`。本地预览将业务数据保存在当前浏览器，可刷新继续使用。它是独立工作区；云端入口使用真实数据库。`PORT` 可更换预览端口。

`showcase/preview.html` 是自包含的可交互演示，使用合成数据与页面内状态。可直接打开，或运行 `npm run showcase` 重新生成。

## 构建与发布

根部 `metadata.json` 声明全部变量，`source.json` 使用随机占位符保存 SQLite / Git 绑定和固定入口。安装时为新应用创建资源并按 metadata.json 完整替换变量，再执行结构 SQL；不需要业务种子数据。随后执行：

```sh
tiana sqlite shell SQLITE_ID -f sql/schema.sql --format json
npm run build
tiana web create '日有回响' --entry assets/app.js --database-instance-id SQLITE_ID --git-instance-id GIT_ID --json
tiana web serve WEB_ID --dir dist --port 4174
tiana web publish WEB_ID --dir dist --json
tiana web status WEB_ID --json
```

`dist/assets/app.js` 在平台 Bootstrap 初始化后自行启动；平台提供 HTML、身份和动态数据库连接。`dist` 不包含应用 HTML 或凭据。`.preview` 单独保存本地入口与浏览器存储版本，不参与云端发布。

数据库初始为空，不灌入演示业务数据。`sql/schema.sql` 使用幂等建表和触发器。数据库以应用 ID 保存工作区文档；平台租户授权提供数据访问边界。

## 检查与目录

```sh
npm run check
npm test
```

`src/workbench.tsx` 包含日历、今日、手机工具页、回响之书和导出；`src/screens.tsx` 包含项目、事项与统计；`src/planning.ts` 与 `advanced.ts` 实现规划规则；`src/storage.ts` 实现云端持久化。功能与数值规则详见 `spec/product.md`。

生产依赖与许可见 `THIRD_PARTY_NOTICES.md`。界面图标由 SVG 绘制，应用图标位于 `public/icon.png`。
