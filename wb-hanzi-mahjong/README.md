# 汉字麻将

面向个人中文学习的汉字组词练习。编辑二至四字词库，开始与三位电脑的牌局，摸牌、组词、碰吃胡，并保存方案和学习报告。

通过 `tiana web init-template wb-hanzi-mahjong --dir my-hanzi-mahjong --json` 取得工程。根据 metadata.json 替换 source.json 中的 SQLite、Git 实例变量，在选定数据库执行 schema.sql。使用支持动态账号鉴权的 Tiana 运行时，数据库需提供 hrana-v3 参数化 SQL。

运行 `npm ci` 和 `npm run build`，固定入口为 assets/app.js。构建输出绑定参数供 Web 配置使用；应用从运行时取得数据库连接与动态鉴权。运行 `npm test` 验证词语多重集、拆分、得分、碰吃与电脑行动规则。可在 src/style.css 调整主题，在 src/rules.js 调整默认词库。此应用为个人使用，数据权限遵循所在个人租户。
