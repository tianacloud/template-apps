# 卡丁车竞速

个人三维赛车：四种车型、两条赛道、竞速与道具模式、电脑陪赛及个人成绩。需要支持WebGL的浏览器。

使用 `tiana web init-template wb-kart-racing --dir my-app --json` 获取工程。替换metadata.json声明的资源变量，在目标数据库执行schema.sql。npm ci、npm test、npm run build，入口assets/app.js。数据库使用运行时动态账号鉴权与hrana-v3参数化SQL。数据权限遵循所在个人租户。
