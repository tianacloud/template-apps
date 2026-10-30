# 软考中项 · 刷题练习

系统集成项目管理工程师备考应用。提供刷题、案例分析、计算题、模拟考试及知识背诵，答题进度自动保存在应用数据库中，同步码可在同一应用的设备间同步进度。

为应用创建 SQLite 和 Git 实例，替换 source.json 中的实例占位符，执行 schema.sql；运行 npm ci 和 npm run build 构建。应用使用 Tiana 运行时身份和数据库连接，并从当前应用的文件目录读取 template-assets/question-bank.json。市场安装会自动准备题库文件；手动部署时需将 template-files/question-bank.json 放入该目录。
