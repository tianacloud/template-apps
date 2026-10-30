# 一页便笺

个人便笺与附件收纳。新建和修改便笺后点击保存，支持链接重开与文本导出；附件区支持多文件上传、刷新后查看和下载原文件。每个文件不超过 10 MiB，便笺和附件列表各显示最近 100 项。安装后为空，不含多人协作、分享或后台任务。

使用 Tiana 身份、SQLite 和应用文件存储。运行时提供 `window.tiana.connection()`、动态授权 provider 和 `context.files`，凭据与环境地址不写入应用。便笺和附件目录保存在 SQLite，原文件保存在本应用的文件目录；没有文件能力时显示未就绪提示。上传结果未知时保留原上传记录，通过“检查未完成上传”回读同一次请求，不重新上传或覆盖文件。

依 metadata.json 替换 source.json 的 SQLite、Git 变量，对本次数据库执行 schema.sql；无 seed。安装依赖后，从确定的完整源码 commit 构建：

```sh
npm ci
npm run build -- FULL_SOURCE_COMMIT
```

产物入口为 assets/app.js，包含 CSS 和 256×256 PNG 图标。showcase/preview.html 为无账号演示，示例仅留在当前页面。数据库通道、样式加载和图标复用本仓库 Apache-2.0 的 notes 基础材料；其余便笺、附件和展示流程位于本工程。
