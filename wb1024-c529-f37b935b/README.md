# 喵邻圈

济宁猫友共用的猫咪地图与邻里圈。按区县查看喂食、领养、求助和提醒，记录照片、绝育状态、打卡与收藏，阅读养猫知识和维护猫档案。地图是示意地图，非导航服务。获得应用分享权限的成员共用数据。

使用 `tiana web init-template wb1024-c529-f37b935b --dir <目录>` 下载工程，按 metadata.json 填入新建或指定的 SQLite、Git 实例，先在 SQLite 执行 schema.sql，再 `npm ci`、`npm run build`。部署时使用构建输出的入口及绑定，应用使用运行时身份连接数据库。
