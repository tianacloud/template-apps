# 需求变更模拟器

45秒8×8绘图挑战，支持五色绘画、残留清理、需求自动变更、还原度计分和个人历史记录。

使用 `tiana web init-template 5f160caf4d830722a3b64dff --dir my-app --json` 获取工程。按 metadata.json 替换资源变量，执行 schema.sql，运行 npm ci 和 npm run build。固定入口 assets/app.js，连接使用运行时动态账号鉴权与 hrana-v3 参数化 SQL。仅供个人使用，数据权限遵循所在个人租户。
