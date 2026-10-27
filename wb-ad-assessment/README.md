# AD 门诊评估

个人使用的特应性皮炎评估记录工具，提供诊前问卷、POEM、瘙痒 NRS、治疗经历、SCORAD 和纵向随访。所有评分均展示输入与计算过程，不自动生成诊断或用药建议。

用 `tiana web init-template wb-ad-assessment --dir PROJECT_DIR --json` 下载工程。按 metadata.json 创建本次应用自己的 SQLite 和 Git，填写 source.json 后依次执行 schema.sql、seed.sql。示例记录均为合成数据。固定入口为 `assets/app.js`，账号与数据库连接由平台运行时提供。

运行 `npm ci`、`npm test`。源码提交后使用 `npm run build -- FULL_COMMIT` 构建；`npm run build:local` 为本地编译检查，`npm run preview:build` 制作页面内示例预览。核心计算与验收要求见 spec/product.md。

POEM ©Copyright University of Nottingham 2004。保留所有权利。问卷采用 POEM 自我完成简体中文（中国）2025 年 1 月 30 日版的题目和作答文本。无法回答时可留空：仅一题缺答按 0 分计入总分，两题及以上缺答不计算总分；备份保留原始缺答，CSV 的分值留空并附缺答题数。个人非商业用途与商业用途适用不同许可条件，免费分发不构成非商业认定；使用及分发前须核对实际用途与权利人的许可条件。SCORAD 评分依据 European Task Force on Atopic Dermatitis 的 A/5 + 7B/2 + C 规则，干燥体征在非炎症皮肤上评定。量表辅助记录不能替代医生的临床判断。
