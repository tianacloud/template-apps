# 心屿

心屿是一座随自我探索成长的小岛，提供每日灵感卡、心情贴纸、小确幸罐、手账、答案之书、选择老虎机、生日花、能量测试和秘密探索。邮筒中的便条由规则生成。应用不使用模型服务。

同一个应用安装绑定一份 SQLite：获授权的使用者共享整座小岛与记录，不同安装互相独立。并发更新发生冲突时会提示重新读取，避免覆盖已有记录。天空、音效和唤醒偏好保存在同一安装的 SQLite 数据库中。

使用 Node.js 22 和 npm。按 metadata.json 替换 source.json 中的 SQLite 与 Git 占位符，然后执行 `tiana sqlite shell <SQLite实例ID> -f schema.sql --format json` 和 `npm ci`。将源码提交并同步至绑定 Git，使用 `npm run build -- <完整源码提交号>` 构建。产物入口为 `dist/assets/app.js`，CSS 随模块内嵌；使用 Tiana 运行时的账号鉴权与数据库连接，无需静态凭据。可用 `tiana web serve <WebID> --dir dist --port 4174` 预览。

卡片和便条使用随应用提供的固定词池和规则，仅供娱乐和自我觉察。第三方代码及素材许可见 LICENSE。
