请用 Tiana CLI 拉取 374c88c5823fb7cbc7cd4e8a 模板源码，创建「时策 · 时间管理」。个人日程、倒数日、农历日历、习惯打卡与日常记录工具，支持中文时间解析、待办购物、记账和前台计时。数据保存于本应用的个人数据库。为此应用创建或复用我明确指定的 SQLite 与 Git，填写绑定并构建发布。

源码入口：`tiana web init-template 374c88c5823fb7cbc7cd4e8a --dir ./374c88c5823fb7cbc7cd4e8a-app --json`。目标目录应不存在；读取下载工程的 metadata.json，创建或复用我明确指定的 SQLite/Git，替换全部实例绑定并执行已配置的 schema 与合成 seeds，再构建和发布。
