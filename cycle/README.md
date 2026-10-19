# 周期

给需要定期做的小事设个间隔，做完记一次。适合记录家务、绿植养护和个人日常，界面优先适配手机，也支持桌面。

## 使用

- 自定义事件名称、间隔天数、首次提醒日期、图标、颜色和多个标签。首页默认显示未归档的全部事件，可按标签、到期状态筛选，也可按名称搜索。
- 下次提醒日期为最近一次完成日期加上间隔天数；没有完成记录时使用首次提醒日期。首页按提醒日期排序，并显示逾期、今天到期和剩余天数。
- 点击事件查看历史，使用悬浮按钮添加完成记录。完成时间精确到分钟，可补记过去的记录；耗时按整数分钟填写，备注和照片选填。每条记录最多 6 张照片，单张不超过 10 MB，支持 JPG、PNG、WebP 和 GIF。
- 完成记录可编辑、删除，同一天可以记多次。修改后重新计算次数、耗时和下次提醒。
- 天视图按最近 7 天逐日统计；周视图按周一至周日逐日统计；月视图展示整月每天的次数；年视图展示每月次数；自定义范围包含开始与结束日期，按天统计。没有完成的日期显示为零。历史列表跟随所选时间范围，每次加载 40 条。
- 标签可创建、重命名和删除。归档事件不进入首页的全部事件，历史和照片保留，可从归档页恢复。

## 安装与构建

需要 Node.js 20.19+、Tiana CLI 1.0.4+，以及支持账号鉴权和文件存储的 Web 运行环境。

```sh
tiana web init-template cycle --dir my-cycle
cd my-cycle
```

按 `metadata.json` 创建并核实 SQLite、Git 实例，在 `source.json` 替换全部变量。应用通过运行时的 `window.tiana.connection()`、`window.tiana.auth` 连接数据库，照片使用 `window.tiana.files`，凭据由平台提供。

先执行 `schema.sql`，再执行 `seed.sql`：

```sh
tiana sqlite shell <SQLite实例ID> -f schema.sql --format json
tiana sqlite shell <SQLite实例ID> -f seed.sql --format json
npm ci
```

`seed.sql` 提供 6 件合成日常、4 个标签和 21 条示例完成记录，可重复执行。需要空白应用时跳过 seed。schema 与 seed 独立，不会在页面加载时自动写入示例。

提交源码，推送到自己的 Tiana Git 并核对远端引用后，从该提交构建：

```sh
npm run build -- <完整源码提交号>
```

构建输出 `dist/assets/app.js`、`dist/assets/app.css` 和 `dist/icon.png`，并报告 `TIANA_PROJECT_PARAMS`。创建 Web 时固定入口为 `assets/app.js`，绑定 SQLite 和 Git，再使用 `tiana web publish <WebID> --dir dist --json` 发布。运行时绑定不写入编译产物，可原样安装到不同实例。

## 验证与预览

```sh
npm test
npx playwright install chromium
npm run showcase
npm run test:browser
```

SQL 安装测试需要 Python 3。日期测试覆盖到期计算、跨月、闰年、日期范围、每日多次记录和空日期；浏览器测试在 `sandbox="allow-scripts"` iframe 中验证新建、搜索、标签、备注、照片、统计、归档恢复和手机布局。

`npm run showcase` 从同一应用组件和样式生成 `showcase/preview.html`，仅将数据层替换为页面内合成数据。预览自包含，不依赖账号、网络或浏览器存储。`showcase/cover.webp` 为同份预览的截图。构建出的真实应用不包含演示数据层。

真实实例验证可先用 `tiana web serve <WebID> --dir dist --port 4192 --json` 启动预览，将启动回执保存在工程之外，再运行 `node tests/live.mjs <启动回执文件>`。该测试会创建一件日常、写入两条记录和一张照片，最后归档该事件；请使用专用测试数据库。测试不输出授权链接。

## 使用范围

提醒在应用内显示，关闭网页后不会发送系统推送。完成时间按填写的本地日期和分钟保存；同一应用的成员共用事件与记录。删除记录或移除照片后，文件存储中的原图仍保留。照片功能需要平台文件服务可用。
