# Downtown Beatdown · 街头激斗

基于 [Quiver 的 Downtown Beatdown](https://github.com/quiver-dev/template-beat-em-up) 制作的单人浏览器改编版。JavaScript + Canvas 绘制原作角色与街景；三片街区、两轮敌人波次、三段连击、跳跃飞踢、Tax Man Boss、实时合成音效与配乐，支持键盘和触屏。

SQLite 保存一个应用共享的单人存档，包括角色位置、血量、敌人状态、波次、分数、最高分、通关次数和声音设置。街区切换、暂停与结算自动保存，也能手动保存。刷新后选“继续上次游戏”。一个 SQLite 实例对应一个共享存档，不是多人游戏，也不提供不同账号的独立角色。

## 安装与构建

需要 Node.js 22+。项目包含完整浏览器源码和已经处理的图片，常规构建无需 Godot 或 Git LFS。

1. 根据 `metadata.json`，为新应用创建 SQLite、Git 实例，替换 `source.json` 中全部占位符；用户明确指定复用时使用其指定实例。
2. 用实际 SQLite ID 初始化：`tiana sqlite shell SQLITE_INSTANCE_ID -f schema.sql --format json`。没有 seeds 文件。
3. `npm ci`，运行 `npm test`。
4. 把应用源码提交并推送到本次 Tiana Git，核对远端完整 commit。
5. `npm run build -- VERIFIED_SOURCE_COMMIT`。构建输出 `dist` 和 `TIANA_PROJECT_PARAMS`，其中入口为 `assets/app.js`，绑定来自 `source.json`。
6. 用相同 SQLite/Git ID 创建 Web 项目：`tiana web create "Downtown Beatdown" --entry assets/app.js --database-instance-id SQLITE_INSTANCE_ID --git-instance-id GIT_INSTANCE_ID --json`。
7. 将 `template-files/images/` 中的素材上传到该 Web 的 `template-assets/images/`；市场安装会自动准备。
8. `tiana web serve WEB_ID --dir dist --port 4178` 验证真实读写，然后 `tiana web publish WEB_ID --dir dist --json`，按回执检查发布及 serving 状态，并在控制台启用应用。

连接与身份由 Tiana Bootstrap 的 `window.tiana.connection()`、`window.tiana.auth` 提供，不在前端配置凭据。SQL 使用运行时 hrana-v3 接口。数据库写入结果不明时界面提供“重新读取”，请先核对存档再重试。

## 操作

- 方向键 / WASD：移动；X / J：攻击，连续按打出三段连击。
- C / K / 空格：跳跃；空中攻击为飞踢。
- Esc：暂停/继续。手机使用方向与攻击/跳跃按钮，建议横屏。
- 同一水平战斗通道且朝向敌人才能击中。Boss 蓄力有提示，跳跃或移开可避开攻击。
- 存档保存战斗数据；粒子、音效和画面震动属于瞬时表现，不保存。

## 定制

- `src/game.js`：血量、移动速度、伤害、波次、Boss、存档数据。
- `src/render.js`：街景、动画选择与画面效果。
- `src/main.js` / `src/style.css`：界面与输入；`src/audio.js`：原创合成声音。
- `assets/manifest.json`：素材来源、SHA-256、动画帧和许可信息。
- `schema.sql`：单表主键存档。初始化不会覆盖已有存档。

本版重新实现战斗和场景编排，并非原始 Godot 项目的完整移植。当前关卡是三片改编街区，没有多人联机、原作编辑器或完整的 Godot AI 状态机。小图片内嵌构建，大图片由本应用的文件存储读取，不依赖外部素材 CDN。

## 素材再生成

上游固定 commit 为 `ba9542d79b013b6446af1501f74dea3fcde0dcfc`。安装 Git LFS 后克隆上游，checkout 此 commit 并 `git lfs pull`，然后：

```sh
npm run prepare-assets -- /path/to/template-beat-em-up
```

脚本选择原角色动画和场景图片、缩小到 50%、转为 WebP，按 16 KiB 分配到内嵌图片与安装素材目录，并更新清单和 Quiver 原始许可。源图不会作为 LFS 指针混入成品。没有包含或需要上游的 Impact 字体。

## 署名和授权

原作与美术：**Quiver / Downtown Beatdown**。上游代码 MIT；上游声明美术、音乐、音效采用 **CC BY 4.0**。本版使用其中的美术，未使用上游音频或字体；新增代码 MIT，声音由新增代码实时合成。Tiana SDK 为 Apache-2.0。

具体作者署名、来源、改动、许可及免责声明见 [ATTRIBUTION.md](ATTRIBUTION.md) 与 `licenses/`。游戏底部及“署名、许可与改动说明”面板提供可见署名；构建包含许可文件。继续改编和分发时保留这些说明并补充自己的改动，不要把 Quiver 的素材当成 MIT 素材或声称获得其背书。
