# 睡前聊聊

家长和孩子轮流抽一张问题卡，说说今天的开心、委屈，以及让自己觉得骄傲的事。一起记下回答，也可以随时回看。

## 三个页面

- **抽张卡聊聊**：选择家长或孩子先说，抽卡、填写回答并保存。家长回答可标记为爸爸或妈妈。保存后可以再抽一题，轮到另一方；也可以选「今天就到这儿，晚安」回到主页。不想回答时可以换卡，一轮内尽量不重复抽题。
- **问题库**：分孩子库和家长库，支持搜索、新增、修改和删除。初始包含各 20 张问题卡，话题覆盖学校与朋友、心里的感受、为自己骄傲、家庭和奇思妙想。
- **聊过的时光**：按日期展示回答，支持搜索问题或回答、按爸爸／妈妈／孩子筛选，每页 30 条。保存后的回答不能修改或删除；修改或删除问题卡不会改变历史记录。

界面使用柔和的夜间配色，适配手机和桌面。切换三个页面时，当前未保存的回答仍会保留。

## 运行环境

Node.js 22.12+ 或 24、npm、Tiana CLI。托管运行时提供 `window.tiana.auth` 和 `window.tiana.connection()`，数据库使用 `hrana-v3` 参数化 SQL；账号凭据由 Tiana 管理。应用适合一家人共用设备或应用访问账号，回答人是记录中的身份标签。

## 初始化

按根目录 `metadata.json` 替换 `source.json` 中的 SQLite、Git 占位符。默认新建本次应用的两个实例；用户明确指定已有资源时核实后复用。

先执行表结构，再导入初始问题。`seeds.sql` 只导入问题卡，不创建回答记录。

```sh
tiana sqlite shell <SQLite实例ID> -f schema.sql --format json
tiana sqlite shell <SQLite实例ID> -f seeds.sql --format json
npm ci
```

`schema.sql` 建立问题表、回答表和禁止更新／删除回答的触发器。回答独立保存问题原文、话题、回答人、会话 ID、当地日期及保存时间，因此删除问题不会级联删除回答。初始问题使用固定 ID，重复执行 seeds 不覆盖现有同 ID 问题；seeds 用于初始化，日常启动不会重新灌入已删除的卡片。

## 构建与托管

提交应用源码和锁文件，推送到本次 Tiana Git，并核对远端提交。工作区干净后，从这个提交构建：

```sh
npm run build -- <完整源码commit>
```

构建输出 `dist/assets/app.js`，样式和自绘 SVG 图标内嵌到模块中。控制台的 `TIANA_PROJECT_PARAMS` 包含入口、数据库／Git 绑定和源码提交，供部署时核对；账号凭据不进入产物。

创建托管应用时固定入口并绑定实例，保留返回的 Web ID：

```sh
tiana web create "睡前聊聊" --entry assets/app.js --database-instance-id <SQLite实例ID> --git-instance-id <Git实例ID> --json
tiana web serve <WebID> --dir dist --port 4174 --json
tiana web publish <WebID> --dir dist --json
tiana web status <WebID> --publish-id <发布ID> --json
tiana web status <WebID> --json
```

本地预览通过 CLI 返回的启动链接授权。托管入口需要登录有权访问该应用的 Tiana 账号；三个页面使用哈希路由。发布回执确认上传，当前状态为 `running` 且 `remote_sha256`、`serving_sha256` 与发布回执相同时，当前构建正在提供服务。

## 验证与定制

```sh
npm test
```

测试覆盖轮换、抽卡不重复、问题快照、空库、当地日期，以及问题删除后的回答保留、回答不可修改／删除、回答人约束。数据库测试需要 Python 3 的标准库 SQLite。

`seeds.sql` 保存初始问题，`src/domain.js` 保存话题名称与抽卡规则，`src/style.css` 保存桌面和手机样式，`src/App.vue` 包含三个页面。定制文案和初始问题后照常提交、构建和发布。

## 使用边界

保存和历史查询需要网络连接。未保存的回答保留在当前页面内存中，刷新或关闭页面前需先保存。历史时间按浏览器当地时间显示，聊天日期使用保存时的当地日期。写入结果暂时无法确认时会保留内容和原记录 ID，待连接恢复后核实。
