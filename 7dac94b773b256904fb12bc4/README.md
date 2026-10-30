# 日积

个人项目推进、日程安排与投入复盘。把目标拆成模块和任务，在日历里安排时间，记录实际用时，再根据自己的节奏校准估算。

包含今日概览、月/周日历、项目与任务池、部分完成、重复事项、每日随记、统计和 CSV/ICS 导出。每日建议与当日冻结目标分开保存；预计完成日不改日程；智能安排先预览、确认后提交。桌面和手机共用同一套数据。

使用 Tiana 身份和 SQLite。安装后工作区为空；展示页里的内容是独立的合成示例。无团队、邀请、分享或独立账号。请在已确认只有本人有效成员、未开放加入的个人租户中使用；访问权限由 Tiana 服务端执行，前端过滤不是授权边界。

## 安装与运行

需要 Node.js 22.22.2 或更新版本、npm，以及已登录的公开 Tiana CLI。

1. 运行 `tiana web list-template --json` 查询可用目录。模板进入目录后可用 `tiana web init-template 7dac94b773b256904fb12bc4 --dir my-7dac94b773b256904fb12bc4 --json` 拉取；尚未进入目录时使用源码包。
2. 为应用创建 SQLite、Git 实例；已有任务恢复时复用已经创建的资源，用户明确指定已有实例时核对后复用。等待资源可用，将实际 ID 填入 `source.json`。参数化源码的全部占位符见 `metadata.json`。
3. 初始化数据库，保留 CLI 返回结果：

   ```sh
   tiana sqlite shell SQLITE_INSTANCE_ID -f sql/schema.sql --format json
   ```

   SQL 可重复执行，不会清空已有数据。出现错误时先查询已执行结果，不盲目重放写入。

4. 安装依赖并验证：

   ```sh
   npm ci --ignore-scripts
   npm run check
   npm test
   npm run build
   ```

   构建输出 `dist/assets/app.js`、`dist/icon.png`，并报告 `TIANA_PROJECT_PARAMS`。运行时从 Tiana 取得实际连接，编译文件不包含实例绑定或静态凭据。

5. 创建 Web 项目，准确记录回执中的 Web ID：

   ```sh
   tiana web create 日积 --entry assets/app.js --database-instance-id SQLITE_INSTANCE_ID --git-instance-id GIT_INSTANCE_ID --json
   tiana web serve WEB_ID --dir dist --port 4174 --json
   ```

   打开 CLI 的临时预览授权链接。入口与数据库/Git 绑定在创建时固定；后续使用同一 Web ID。本地预览与真实数据库连通，不能作为无需登录的公开站点。

6. 将源码与锁文件提交、推送至该应用的 Tiana Git，核对远端提交。从确定提交干净构建，再发布：

   ```sh
   tiana web publish WEB_ID --dir dist --json
   tiana web status WEB_ID --publish-id PUBLISH_ID --json
   tiana web status WEB_ID --json
   ```

   上传完成后，还需确认当前状态为 `running`，且远端、正在服务的摘要均与本次归档一致。发布结果未知时只查询状态，不自动重发。

## 数据与编辑

`riji_workspaces` 保存每个应用的一份版本化工作区文档，`riji_receipts` 保存原子操作回执。完整业务更新通过版本条件一次提交，校准和批量安排不会留下部分修改。另一个页面修改数据后，陈旧编辑会被拒绝；重新读取并重新打开编辑窗口后再操作。

网络中断时应用先查询操作回执。尚无法确认的写入会阻止后续保存，使用“核实保存结果”检查，不重复提交。业务记录存放在 SQLite，当前草稿保留在内存；浏览器 sessionStorage 只记录尚待核实的操作 ID，不保存凭据。

数据库结构、交互规则与验收条件见 [产品规格](spec/product.md)。个人任务适合此文档存储模型；单工作区最多 20,000 条安排、5,000 条项目任务及 6 MiB 文档，达到上限时先导出并整理。

## 可定制部分

- `src/style.css`：配色、排版和响应式布局。
- `src/screens.tsx`、`src/editors.tsx`：页面与表单。
- `src/planning.ts`、`src/advanced.ts`：分配、冻结、校准和预测。
- `src/actions.ts`：业务操作与校验。
- `src/storage.ts`：Tiana 动态鉴权、参数化 SQL、版本检查及写入核实。
- `src/dates.ts`：业务日、容量和已明确年份的节假日表。

展示页使用相同组件、样式和业务逻辑，只有存储替换为页面内的合成示例；运行 `npm run showcase` 生成自包含 `showcase/preview.html`。恢复示例只重置当前页的内存。展示页在 `sandbox="allow-scripts"` 中运行，导出按钮标明安装后使用。

不将 Token 写入源码或构建变量，不实现自定义身份、后台服务或自动重放写入。使用公开 `@tianacloud/serverless` 的动态 auth provider；缺少所需运行时能力时显示连接错误。
