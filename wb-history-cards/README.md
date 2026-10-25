# 微危历史策略卡牌

在局势迷雾中运用手牌，权衡实力、妄念与行动时机。15剧本、21英雄，支持个人存档和战绩。历史背景与游戏推演分别理解。

使用 `tiana web init-template wb-history-cards --dir my-app --json` 获取工程。替换metadata.json声明的变量，在目标数据库执行schema.sql，运行npm ci与npm run build。固定入口assets/app.js，使用动态账号鉴权与hrana-v3参数化SQL，数据权限遵循个人租户。npm test验证核心规则。
