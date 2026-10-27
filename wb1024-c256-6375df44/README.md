# 周报炼金炉

每行输入一条工作记录，提炼并切换三种周报格式，可复制、下载 Markdown 和保存存档。原料草稿保存在浏览器，存档保存在应用的 SQLite。

创建 SQLite 与 Git 后替换 source.json 中的变量，执行 schema.sql，运行 `npm ci` 和 `npm run build -- <完整提交号>`，以生成的 entry 和实例绑定创建 Web 应用并发布 dist。
