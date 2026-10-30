# 青班 · 轮班日历

个人排班日历：多份班表、手动排班与备注、共享及本表专用班次、循环和附加规则、预览后生成、历史周期识别与续排、月周统计，以及 CSV/JSON 导入和 CSV/ICS/JSON 导出。适用于个人 Tiana 租户。

使用 Tiana 身份及运行时 SQLite 连接。数据在 SQLite 中保存，页面只缓存当前工作区；版本条件写入与数据库操作回执用于处理多标签页冲突和结果未知。规格见 [spec/product.md](spec/product.md)。

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run showcase
```

`dist/assets/app.js` 导出平台 Bootstrap 使用的 `mount`，构建根目录包含 `icon.png`。创建 Web 应用时固定入口为 `assets/app.js`，绑定本次 SQLite 和 Git 实例；应用消费宿主提供的 `connection()`、动态 `auth` 和 `appId`，不在源码中配置凭据。

数据库先执行 [sql/schema.sql](sql/schema.sql)。没有示例数据种子；首次打开时幂等建立当前应用的空工作区，用户自行创建班表。共享实例的表以应用 ID 分区；实际访问权限由平台租户控制，适用于已限制访问的个人租户。

```sh
tiana sqlite shell SQLITE_INSTANCE_ID -f sql/schema.sql --format json
tiana web create 青班 --entry assets/app.js --database-instance-id SQLITE_INSTANCE_ID --git-instance-id GIT_INSTANCE_ID --json
tiana web publish WEB_ID --dir dist --json
```

替换上述资源 ID 为本次应用实际创建并核对就绪的资源。发布前将确定的源码提交推送到绑定的 Git 实例，并检查平台当前发布状态及摘要。

`showcase/preview.html` 是自包含的合成数据演示，与应用复用页面结构和交互，数据仅留在本页。它可在 `sandbox="allow-scripts"` iframe 中运行，不需要数据库或账号，不能用于持久数据。

CSV 表头为 `date,shift`，可附 `start,end,end_offset,color,note`。日期严格为 YYYY-MM-DD，休息写“休息”。CSV 新建班表，JSON 完整替换须确认；先导出备份再恢复。ICS 使用浮动本地时间，跨日结束正确，日历中的导入副本不会自动更新。

可在源码调整配色、默认班次、文字和布局，保留相应验证。核心日期和规则边界由 `tests/scheduling.test.ts` 覆盖，SQLite 条件写入与响应丢失由 `tests/storage.test.ts` 覆盖。
