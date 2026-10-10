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

六个模板在 source.json 中分别用 SQLITE_INSTANCE_ID 和 GIT_INSTANCE_ID 的随机占位符声明 database_instance_id、git_instance_id。新应用默认由 Agent 创建 SQLite、Git，并将 CLI 回执中的实际 ID 替换进去；用户明确指定已有实例时核实后复用。实例显示名称由 Agent 根据当前需求命名。构建脚本输出的 TIANA_PROJECT_PARAMS 同时包含这两项绑定，供 Agent 配置 MGR Web 项目；schema/seeds 使用相同 SQLite ID。Web 身份由运行时 window.tiana.appId 取得，数据库、入口与 Git 绑定由 MGR Web 项目参数管理。需替换的 SQL 或其他文件也纳入 variables；取值来自本次已核实的资源回执和用户需求。JSON 中占位符放在字符串值中；Agent 修改时正确转义，核对 JSON 和实际绑定。其他模板可以声明自己需要的变量，CLI 原样解压工程。

schema、seeds 可省略，分别指向建表 SQL 和初始数据 SQL。Agent 先替换变量，再执行存在的 schema，随后执行存在的 seeds；未配置或对应文件不存在的项独立跳过。SQL 失败时停止后续发布、核对已完成结果。seeds 使用可公开的合成数据。需要变量的 SQL 文件列入对应变量 files，Agent 按 SQL 语法修改。

pack 从明确的 Git commit 导出选定模板目录，而非读取作者工作区。ZIP 根部 metadata.json 的 source.repository 为本公开仓库地址，source.commit 为导出提交的完整 ID；它们由打包器写入副本。文件按名称排序，ZIP 时间固定，输出 SHA-256 与字节数。MGR 的整数版本在上传时分配，metadata.json 不包含它，也不包含自己 ZIP 的摘要。

公开内容检查覆盖源码、拟推送的新提交、包内全部文件及展示资料。禁止分发 Token、密码、私钥、会话凭据、真实个人／客户数据以及 Tiana 内部地址、架构或运维资料。图片与其他资源须检查实际内容；不能读取或不能确认公开性的文件先处理。检查记录对应真实源码 commit 和 ZIP SHA-256，输出只记录位置和问题类型。
