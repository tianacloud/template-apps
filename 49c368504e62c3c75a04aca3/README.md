# 资产管理系统

维护设备资产、硬件更换与机房机柜。支持自定义字段、位置与 U 位、查询筛选、CSV、附件和备份。应用使用 Tiana SQLite 和文件存储，获授权使用同一应用的用户共享其数据。

按 metadata.json 替换 SQLite 和 Git 实例占位符；先执行 schema.sql，再执行 seed.sql。安装依赖后通过 `npm run build -- <完整源码提交号>` 构建，输出的 `TIANA_PROJECT_PARAMS` 提供部署绑定。应用运行时需要 Tiana 的账号鉴权、SQLite 和文件能力。

密码字段在列表中掩码显示，但数据库和备份以明文保存。本实验仅使用合成测试密码，请勿输入真实密码。
