# 模板工程和 metadata.json

模板目录及 ZIP 根部放 metadata.json、README、完整源码、依赖锁文件、自己的构建脚本和 `.gitignore`。SQL 文件按实际需求提供；依赖目录和本地构建 dist 不进入分发 ZIP。

```json
{
  "name": "notes",
  "display_name": "记事本",
  "description": "适合个人笔记应用，包含自动保存、文件夹、置顶和搜索。",
  "variables": [
    {
      "name": "SQLITE_INSTANCE_ID",
      "placeholder": "__TIANA_SQLITE_INSTANCE_ID_f832a54c__",
      "description": "Agent 为本次应用创建或按用户指定复用的 SQLite 实例 ID",
      "files": ["source.json"]
    },
    {
      "name": "GIT_INSTANCE_ID",
      "placeholder": "__TIANA_GIT_INSTANCE_ID_a7c93e5b__",
      "description": "Agent 为本次应用创建或按用户指定复用的 Git 实例 ID",
      "files": ["source.json"]
    }
  ],
  "schema": "schema.sql"
}
```

name 对应模板目录和 MGR 目录名称；display_name 供人阅读，description 帮助 Agent 判断适用范围、主要功能和边界。描述实际功能，构建操作放 README。

variables 的每项记录变量名称、完整占位符、取值说明和全部出现文件。占位符使用 `__TIANA_<变量名>_<随机十六进制串>__`，例如 `__TIANA_GIT_INSTANCE_ID_a7c93e5b__`；制作时生成一次，随源码保存。随机串降低与正常代码重复的可能性。同一变量在不同文件中保持相同占位符，files 是相对于工程根目录的文件路径；metadata.json 中的声明本身不加入 files。validate 核对所有声明位置确实出现占位符，并核对全部工程文件中的出现位置都有记录。

模板在 source.json 中分别用 SQLITE_INSTANCE_ID 和 GIT_INSTANCE_ID 的随机占位符声明 database_instance_id、git_instance_id。新应用默认由 Agent 创建 SQLite、Git，并将 CLI 回执中的实际 ID 替换进去；用户明确指定已有实例时核实后复用。实例显示名称由 Agent 根据当前需求命名。构建脚本输出的 TIANA_PROJECT_PARAMS 同时包含这两项绑定，供 Agent 配置 MGR Web 项目；schema/seeds 使用相同 SQLite ID。Web 身份由运行时 window.tiana.appId 取得，数据库、入口与 Git 绑定由 MGR Web 项目参数管理。需替换的 SQL 或其他文件也纳入 variables；取值来自本次已核实的资源回执和用户需求。JSON 中占位符放在字符串值中；Agent 修改时正确转义，核对 JSON 和实际绑定。其他模板可以声明自己需要的变量，CLI 原样解压工程。

schema、seeds 可省略，分别指向建表 SQL 和初始数据 SQL。Agent 先替换变量，再执行存在的 schema，随后执行存在的 seeds；未配置或对应文件不存在的项独立跳过。SQL 失败时停止后续发布、核对已完成结果。seeds 使用可公开的合成数据。需要变量的 SQL 文件列入对应变量 files，Agent 按 SQL 语法修改。

pack 从明确的 Git commit 导出选定模板目录，而非读取作者工作区。ZIP 根部 metadata.json 的 source.repository 为本公开仓库地址，source.commit 为导出提交的完整 ID；它们由打包器写入副本。文件按名称排序，ZIP 时间固定，输出 SHA-256 与字节数。MGR 的整数版本在上传时分配，metadata.json 不包含它，也不包含自己 ZIP 的摘要。

公开内容检查覆盖源码、拟推送的新提交、包内全部文件及展示资料。禁止分发 Token、密码、私钥、会话凭据、真实个人／客户数据以及 Tiana 内部地址、架构或运维资料。图片与其他资源须检查实际内容；不能读取或不能确认公开性的文件先处理。检查记录对应真实源码 commit 和 ZIP SHA-256，输出只记录位置和问题类型。

## 灵光一闪：展示、源码与可安装产物

每个模板额外提供 `showcase/preview.html`、`showcase/cover.webp`、`showcase/prompt.md`。preview 的 UTF-8 文件大小（压缩前）不超过 500,000 字节；它是自包含的轻量 HTML 预览，使用合成数据、内联 CSS/JS 和内嵌资源；在无账号、无数据库连接的 iframe 中可体验选定的代表流程，复用真实页面结构与样式。恢复示例只重置页面内状态。完整应用保留于源码与安装产物中。模板图标为 256×256 PNG，源码静态资源与构建输出都包含图标。cover 是该预览的 1280×800 WebP 截图，可运行 `node scripts/render-showcase.mjs NAME` 生成。prompt 描述用途、要保留的功能和可继续修改的需求，明确模板名称以及 `tiana web init-template NAME` 拉取源码的入口。

`npm run pack -- NAME COMMIT` 从指定提交导出源码，并在临时目录执行该源码的 `npm ci` 和 `npm run build -- COMMIT`。构建脚本保持现有 `TIANA_PROJECT_PARAMS` 输出，打包器读取 entry；应用通过 `window.tiana.connection()` 取得数据库连接，通过 `window.tiana.appId` 取得 Web 身份。一次编译的 site.tweb 可用于多个独立安装。打包器设置 `TIANA_TEMPLATE_BUILD=1`，使需要检查 source.json 资源回执的构建脚本跳过该检查；模板产物在运行时取得实际绑定，源码包仍保留变量声明。

输出的 `.install.zip` 固定包含：

```text
source.zip             # 同一 commit 的完整源码，metadata 写入公开来源
site.tweb              # web.yaml + data/ 下的编译静态资源
showcase/preview.html
showcase/cover.webp
showcase/prompt.md
install.json           # 构建入口与 SQL 变量清单
schema.sql             # metadata.schema 存在时收录
seed.sql               # metadata.seeds 存在时收录
```

打包器从构建结果生成 site.tweb，沿用 Web 制品的 16 MiB 压缩／解压大小和 4096 个资源上限；如果构建输出 icon.png，MGR 同时提取它作为独立应用图标。install.json 由打包器生成，包含完整 metadata、明确的 database_required 和来自本次构建的 entry。database_required 在各模板 metadata.json 中声明，不通过 SQL 文件是否存在推断；纯前端填写 false。SQL 变量，只从源码 variables 中收录实际 SQL 文件使用的 WEB_ID、SQLITE_INSTANCE_ID、APP_NAME；文件名映射到包内 schema.sql/seed.sql。

上传时只交付 install.zip。MGR 解包保存 source.zip、site.tweb、独立 preview.html、cover.webp、install.json 和提供的 SQL／图标；prompt 入目录数据库。外层 install.zip 不作为运行时存储对象保留。灵光一闪直接读取独立 HTML，CLI 仍下载 source.zip。

一键安装为用户创建 SQLite 和 Web，将数据库 ID 绑定到 Web 参数，然后依次尝试 schema 和 seed，最后由 OSS 复制同一 site.tweb 到 Web 存储。SQL 占位符只写在字符串字面量内，安装器转义替换值中的单引号。schema 优先 `CREATE TABLE IF NOT EXISTS`，seed 尽量使用稳定主键配合 `INSERT OR IGNORE` 等幂等写法。SQL 语句报错会记录后继续，制作时须自行执行、复查真实结果；传输或材料读取失败会使任务重试。

发布前同时验证源码方式与一键安装方式。showcase 的示例数据不等同于真实初始数据，安装后的数据只由 schema、seed 及应用已实现的初始化逻辑决定。

## 可选素材文件（格式版本 2）

需要素材的模板在 metadata.json 声明 `"file_seeds":"template-files"`，并将全部素材
放入 `template-files/`。未声明时不允许夹带该目录；已声明时必须包含 1 至 256 个
普通文件，累计不超过 16 MiB。拒绝软链接、特殊文件、文件与目录冲突、绝对路径、
点路径、反斜线、控制字符和百分号编码路径。素材不参与变量替换。

打包器从同一个确定提交读取源码与素材。source.zip 保留 `template-files/<path>`，
install.zip 另含 `files/<path>`，两者字节完全相同。install.json 包含
`format_version: 2`、`requires: ["template_files_v1"]` 和以下 files 对象：

```json
{"version":1,"root":"template-assets/","entries":[{"path":"images/cover.webp","size":24576,"sha256":"<实际字节的64位小写SHA-256>","content_type":"image/webp"}]}
```

entries 按路径 UTF-8 字节排序。打包回执的 file_manifest_sha256 对 install.json 中
files 对象的原始 UTF-8 字节计算，不对重新序列化结果计算。回执还记录文件数和总字节。
无素材包省略新版本、能力及 files 字段，继续原安装步骤。

源码包和单项材料上限为 16 MiB，安装包上限 32 MiB，外层及嵌套归档累计解压不超过
128 MiB、5,000 项。素材满足自身限制仍须通过整体归档限制。

干净构建不得复制素材到 dist，也不得将素材重新内嵌到 JavaScript。打包器拒绝素材
目录、相同文件字节及可识别的原始字节/base64 嵌入；任意变换后的素材仍需通过实际
验收核对。静态小图片优化后、编码前不超过 16,384 字节时应实际内嵌到 JavaScript；
其余按应用需求使用文件存储。市场预览保持自包含，不访问作者或安装用户的文件。

应用和数据库记录使用 `template-assets/<path>`，通过 context.files 的 get、getUrl、
bindImage 访问。不得保存作者文件 URL、租户 ID 或文件访问 Token。安装响应取得 Web ID
后，本地开发先用 `tiana file put` 上传到 `<web-id>/template-assets/<path>` 并检查回执，
再预览。`tiana web init-template` 仍仅下载解压源码，不修改云端资源。

发布前验证保留源码及直接安装两种模式的桌面和手机路径，保存任务、真实对象摘要、
Git 初始内容、数据库相对路径及浏览器读取结果。检查刷新、重新打开、另一授权会话、
跨租户拒绝与安装隔离。使用独立模板，不修改已验收的 Oncall 模板。

新格式发布须等待服务端兼容版 C 已覆盖全部安装节点，以及完整功能、Gaia 续装和
终止清理、同频异常扫描告警验收完成。此打包器实现本身不代表云端已支持新格式。
