# 大兜力量池

个人自律打卡与自我奖励应用。每天写一篇手写风日记，记下心情、照片贴纸和完成的任务；任务按金币入账，攒够金币后兑换给自己的小奖励。Vue 3 与 Tailwind CSS 构建界面，Tiana SQLite 保存业务数据，照片保存在 Tiana 文件存储，桌面和手机读到同一份记录。

## 初始化与构建

需要 Node.js 22 及以上、Tiana CLI、支持 `hrana-v3` 的 SQLite 实例及 Git 实例。

1. 根据 `metadata.json`，由 Agent 为本次应用创建 SQLite 和 Git 实例，将实际 ID 填入 `source.json`；用户明确指定已有实例时先核实再复用。
2. 在同一个 SQLite 实例执行 `schema.sql`。本模板不提供种子数据；三个示例任务由应用首次打开时写入。
3. 运行 `npm ci` 安装锁定依赖，将源码提交并推送到本次 Tiana Git。
4. 从已推送的完整源码提交构建：

```sh
npm run build -- <完整源码提交号>
```

构建目录为 `dist`，入口为 `assets/app.js`，图标输出为 `dist/icon.png`。构建输出的 `TIANA_PROJECT_PARAMS` 包含入口、SQLite/Git 绑定及源码提交号，供 Agent 配置本次 Web 应用。使用 `tiana web serve` 预览，使用 `tiana web publish` 发布并核实运行状态；命令参数以安装版本的帮助为准。

账号鉴权和数据库地址来自 Tiana 运行时的 `window.tiana.auth` 与 `window.tiana.connection()`，Vite 开发页本身不提供数据库连接。

## 使用与定制

- 日记页：选择心情、输入正文、为各分类任务加减完成数量，可添加多张照片贴纸（在浏览器内缩放后保存）。顶部实时显示本篇可得金币；保存时按当时的任务金币快照入账，之后修改任务不改写历史。再次编辑同一天会按差额调整总金币，删除日记会扣回该日所得（总金币不低于 0）。
- 来时路月历：切换月份与日期查看或补写日记，小水瓶按当日金币（满 30 为满瓶）显示进度。
- 任务页：学习篇、健身篇、技能篇、自媒体篇四个分类，以及「其他篇」自定义分类；新增、编辑和删除任务。删除的示例任务会在下次打开时补回。
- 兑换页：蓄水瓶以排在第一的未完成目标作为刻度；新增目标、拖动调整未完成目标的顺序、金币足够时确认兑换，已完成目标按兑换时间排在后面。
- 界面文案在 `src/views/` 各页面，分类与示例任务在 `src/data/constants.js`，数据读写集中在 `src/data/repository.js`，样式使用 Tailwind 工具类及 `src/style.css`。

## 验证

```sh
npm test
npm run build:showcase
```

`npm test` 用 Node 内置 SQLite 执行真实 `schema.sql`，验证示例任务补回、保存与重存的金币差额、照片增删排序、删除下限、兑换条件与目标排序。`build:showcase` 生成自包含的 `showcase/preview.html`，使用内存示例数据，不连接数据库。预览页内嵌 ZCOOL XiaoWei 手写字体的常用字子集（SIL Open Font License 1.1，许可见 `src/assets/zcool-xiaowei-OFL.txt`，字符表见同目录 `zcool-xiaowei-preview-chars.txt`）；正式应用从本应用文件存储加载该字体，不可用时回退到楷体等系统字体。

部署验收还需在本次真实 Tiana 实例上验证界面写入、照片上传、刷新后持久化及 Git 远端提交。

## 产品规格

见 [spec/product.md](spec/product.md)。
