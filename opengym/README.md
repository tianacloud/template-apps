# openGym · 训练日志

个人训练计划、逐组记录、休息倒计时、训练进度和体重追踪。内置 5,632 个动作，支持中文与英文搜索、器械与肌群筛选、自定义动作、四种入门计划、每周/轮换安排、历史编辑、训练热力图、肌群训练量和个人纪录。可记录并比较进度照片，导入训练 CSV，导出/恢复 JSON 备份。

安装后为空数据，从入门计划或自由训练开始。使用 Tiana 身份和独立 SQLite，适合个人租户，无需自建后端。首次打开动作库或设置，点击“准备素材”，确认个人非商业使用条件后，可在线准备全部图片与动画，或选择已有完整素材文件夹导入。约需 174 MB 云端空间，所需时间取决于网络；可暂停续传。完成后从本应用自己的 Tiana 文件目录读取动作缩略图和循环动画，详情可点击切换静态图，训练中可收起或关闭演示。

## 动作媒体

本工程是 openGym 的 AGPL 分支。图片和视频有单独的许可，完整条件见 [NOTICE.md](NOTICE.md)。原版允许非商业 openGym 分支保留未修改、最大 180 像素的素材并附带该声明，其他用途需另行取得许可。源码包和公共展示不附带媒体文件，也不从原站借链。

符合上述条件的个人部署将素材保存在本应用的 Tiana 文件目录 `exercise-media/v1/`。目录包含 5,632 个动作的 WebP 和 MP4 原文件，其中 5,597 个 MP4 为多帧视频，35 个原文件为单帧，界面以静态图示呈现，按标准 ZIP STORE 分组，`manifest.json` 记录每个原文件的位置和文件包摘要。浏览器按需下载、校验摘要并播放原始内容，最多同时读取三个文件包，缓存限为 32 MiB。文件路径由运行时限定到当前应用，不共享其他安装的数据。

动画使用 MP4Box.js 提取原文件中的 H.264 数据，再用 WebCodecs 解码到 Canvas；不转码或生成替代素材。播放按原始显示时间排序 B 帧，以原时长循环，只保留少量待显示帧；离开可见区域、暂停或关闭时释放解码器与帧。需要支持 H.264 WebCodecs 的浏览器；不支持时保留原图。附加组件许可见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。

`scripts/media/prepare-original-media.py --root DATA_ROOT --source UPSTREAM_SNAPSHOT` 用固定原版提交及 Git 树核对原文件、尺寸和对应动作，并生成目录与完整声明；准备过程需 Python Pillow。`upload-original-media.mjs --root DATA_ROOT --web WEB_ID` 通过 Recode 工具包调用官方 Tiana CLI 上传，保存每次回执，最后上传完整目录。不确定的上传须先对账，不能自动重放。在线准备流程会从固定版本的公开文件逐项读取未修改的原文件，在浏览器内按既有 ZIP STORE 格式复现并校验全部摘要，再通过平台文件 API 保存到当前应用；图片和视频不会在日常播放时借链。已完成的文件先读取核验后复用，保存结果不明确时通过原上传回执核对，不重复写入。上传编号保存在以本应用 ID 隔离的本地进度记录中，不保存凭据。全部素材和版权声明确认后才提交完整目录；暂停、离线或空间不足不会将部分目录显示为完整。缺少素材时，训练记录功能仍可使用。

`validate-original-clips.py --root DATA_ROOT --source UPSTREAM_SNAPSHOT` 用 ffprobe 检查全部视频的编码、像素格式、帧数、时长和尺寸。`validate-original-demux.mjs --root DATA_ROOT --source CLIP_DIRECTORY` 将播放器实际提取的帧数、尺寸和时间信息逐项与 ffprobe 结果比较。`preview-original-media.mjs --root DATA_ROOT --output PREVIEW_DIR` 生成使用实际页面组件、完整目录和原始文件的本地视觉预览；通过回环地址的静态 HTTP 服务打开。该预览使用可公开的合成数据和页面内存，不代表云端持久化验证。

## 安装和开发

从市场安装时，默认保留源码；取消勾选则仅创建应用和数据库。也可由 Agent 执行 `tiana web init-template opengym --dir PROJECT --json` 下载完整工程。

1. 为本次个人应用创建 SQLite、Git 实例，等待就绪。按 metadata.json 将 source.json 中占位符替换为实际回执 ID。
2. 执行 `tiana sqlite shell SQLITE_INSTANCE_ID -f schema.sql --format json` 创建结构，无示例 seed。
3. `npm ci`，运行 `npm test`。提交本工程并同步到本次 Tiana Git，核对远端提交。
4. `npm run build -- FULL_SOURCE_COMMIT` 输出 dist 与 TIANA_PROJECT_PARAMS。创建 Web 时固定 entry 为 `assets/app.js`，绑定本次 SQLite、Git。
5. `tiana web publish WEB_ID --dir dist --json`，按返回 publish_id 核对激活结果。使用实际回执中的应用地址登录。

应用通过 `window.tiana.connection()` 和共享动态 `window.tiana.auth` provider 获取数据库连接。构建产物不包含绑定 ID 或凭据，适用于独立安装。初始化同样只使用当前应用的文件 API，不能访问其他安装的目录。需要支持参数化 SQL 的 hrana-v3 通道。

`npm run showcase` 生成自包含内存示例。预览与完整应用复用页面组件和样式，演示数据仅保留于页面，导入和下载在预览中禁用。封面通过制作工具从同份预览生成。

## 数据规则

以 kg 保存重量，磅仅为显示和输入换算。训练量只统计已完成的非热身力量组。Epley 估算 1RM 仅使用正重量 1–12 次正式组，单次使用实际重量。未完成全部目标不加重，连续三次未达标建议减重 10%。肌群图展示训练量或距上次训练天数，不作医学恢复判断。

训练、计划、体重、照片与设置分别保存在 gym_records 中。revision 防止同记录静默覆盖；丢失写入响应时独立读取 mutation_id 核对，不自动重复写入。出现冲突可先导出本页备份，再读取云端。未保存数据通过页面状态提示。

JSON 导入仅接受本应用备份格式，仅添加新 ID，重复导入跳过已有记录。CSV 支持 FitNotes、Strong、Hevy 常见的日期、动作名称、重量和次数/秒数列；日期支持 ISO、英文月份和日/月/年，先预览再导入。无法匹配的动作作为自定义文本动作保存。

照片先在浏览器重编码、缩小至最长边 1000 像素，再存入数据库。所有个人数据均可在 JSON 备份中导出。

## 许可

应用以 AGPL-3.0 发布；动作资料、样式、入门计划、肌群几何及可选媒体的必要署名和第三方许可见 [NOTICE.md](NOTICE.md)。AGPL 不覆盖第三方动作媒体。设置页提供源码链接和完整版权声明。
