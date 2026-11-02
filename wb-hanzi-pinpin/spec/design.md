# 界面规格

## 1. 设计令牌

```css
--bg:#12122a        --bg-soft:#1c1c3d    --card:#262650     --card-light:#33336b
--text:#f0f0ff      --text-dim:#a8a8d0
--primary:#6c8cff   --primary-dark:#4a6ae0
--success:#4ade80   --warning:#fbbf24    --danger:#f87171   --locked:#a78bfa
--border-subtle:rgba(255,255,255,.08)
--state-idle:#4a4a7a --state-trying:#60a5fa --state-stuck:#fbbf24
--state-help:#f87171 --state-done:#4ade80
--radius:12px       --radius-lg:18px
--shadow:0 4px 20px rgba(0,0,0,.35)
```

- 正文：`"LXGW WenKai", "Kaiti SC", STKaiti, KaiTi, 楷体, …, serif`（楷体为主，衬线兜底）。
- 标题：`"ZCOOL KuaiLe"`，`clamp(2.6rem, 12vw, 3.4rem)`，字距 `3px`，色 `#ffd76a`，`text-shadow: 0 3px 0 rgba(97,20,20,.55), 0 0 26px rgba(251,191,36,.35)`。

## 2. 通用控件

| 元素 | 规格 |
| --- | --- |
| `button` | `padding:12px 18px`，圆角 12，`--primary` 底白字，`font-weight:600`，`white-space:nowrap`，`:active` 缩放 .97，`:disabled` 透明度 .45 |
| `button.ghost` | 透明底，`1px solid --card-light`，`--text-dim` 字 |
| `button.danger` / `.ok` | 红底 / 绿底 |
| `input, textarea, select` | `padding:12px 14px`，`1px solid --card-light`，`--bg-soft` 底，聚焦 `outline:2px solid --primary` |
| `label` | `.85rem`，`--text-dim`，下间距 6px |
| `.card` | `--card` 底，圆角 18，`padding:18px`，`box-shadow` |
| `.page` | `padding:16px`，`max-width:720px` 居中；`.page.wide` 1100px |
| `.muted` / `.tiny` | 灰字 `.85rem` / `.72rem` |

## 3. 首页

- `.home-hero` 居中，`padding:28px 0 20px`；logo 3rem；标题；机构名（字距 2px）；英文名 `.8rem`。
- 圆形徽标 132×132，白底 `padding:5px`，`box-shadow: 0 6px 20px #00000061, 0 0 0 3px #fbbf2447`。
- `.site-stats` 胶囊统计条：`background:#6c8cff14`，`1px solid rgba(108,140,255,.22)`，圆角 999，`.85rem`，数字加粗白色。
- 三张卡：🎒 我是学生 / 👩‍🏫 我是老师 / 🔑 已有游戏室号码；老师卡带 `border-left:3px solid #a78bfa` 与更高阴影。
- 房间号卡：label + 输入框（占位「例如 HSK1L3」）+ 右侧「进入控台」。

## 4. 学生游戏页

- `.student-bar`：`position:sticky;top:0`，`padding:10px 14px`，`background:#1c1c3dd9`，`backdrop-filter:blur(8px)`，底边 `1px solid --card-light`，`z-index:50`。
  - 昵称加粗，`max-width:40vw` 单行省略。
  - `.progress-pill`：`--card-light` 底，圆角 999，`4px 12px`，`.85rem`。
  - `.preview-pill`：紫底紫边，`.72rem`，超前作答时出现。
  - `.timer-pill`：`#f59e0b2e` 底，`rgba(245,158,11,.55)` 边，`#fcd34d` 字，`tabular-nums`。
- `.q-nav`：三枚等宽 ghost 按钮；当前题时「回到当前」为主色实心。
- `.q-head`：居中，`padding:18px 0 10px`；`.q-char-hint` 灰字「· 老师指定了拆法」。
- `.assembly-area`：`height:330px`（≤560px 时 280，≤400px 时 240），`2px dashed rgba(255,255,255,.22)`，圆角 18，`#00000024` 底 + 22px 点阵；中央提示「把部件拖进来 / 自己摆成这个字的样子」；`touch-action:none`。
- `.parts-tray`：`flex`，`gap:12px`，`padding:16px`，`min-height:110px`，`#00000038` 底，圆角 18。
- `.part`：78×88（窄屏 66×76），`--card-light` 底，圆角 12，字 2.4rem（窄屏 2rem），`box-shadow:0 2px 8px #0000004d`；拖拽时跟手（pointermove，rAF 合并），阈值 10px 才算拖动，点一下即取下。
- `.part-frame` / `.part-inner`：包围结构的外框（半透明白虚线）与嵌在框内的部件（缩放 0.6，外框放大 1.55）。
- 提交按钮整行宽，未满时「还差 N 块」且禁用；右侧 ghost「清空重来」。
- `.help-btn`：`position:fixed`，左 16 / 下 20，56×56 圆形，`--danger` 底，1.5rem ✋。
- 答对反馈 `.feedback-correct`：浅色卡（`#f4f7e8` 系）覆盖拼字区，圆角 18，`z-index:10`。
  - 「✓ 答对了！」绿字 `#2f7d32`；进度灰字 `#5b6150`；大字本字 `clamp(6rem, 26vw, 9.5rem)` 色 `#14141f`；拼音 `1.6rem` 色 `#b45309`；英文 `1rem` 色 `#374151`；`日 + 月 = 明` 胶囊（`.reveal-part` 底 `#00000012`，`.reveal-result` 底 `#6c8cff47`，`.reveal-op` 透明度 .5 / 1.4rem）；「2 秒后看下一题」`.78rem`。
  - 底部 4px 进度条 `#00000012`，内部绿色 `#4ade80`，`animation: countdown 2s linear`，`transform: scaleX(1→0)`。
- `.hint-box`：`#fbbf241f` 底，左侧 3px `--warning`，`.9rem/1.6`。
- `.warn-box`：`#f871711f` 底，左侧 3px `--danger`，标题红色居中。
- `.info-box`：`#4ade8014` 底，左侧 3px `--success`。
- `.lb-section`：`margin-top:22px`，`padding-top:16px`，上边框 `--card-light`。
  - `.lb-chip` 胶囊筛选，选中主色实心。
  - `.lb-row`：`padding:10px 14px`，`#ffffff0d` 底，`1px solid rgba(255,255,255,.08)`，圆角 12。
  - `.lb-rank` 30×30 圆：1 金 `#f5c542`、2 银 `#cdd3da`、3 铜 `#d9914b`；分数右对齐金色 `#ffd479`。

## 5. 教师控台

- 头部：`h1 教师控台`；副行「游戏室号码 **XXXX** · 唯一 ID，不可改 · 第 N 轮 · 进行中」。
- 课堂名称输入 + 「保存名称」。
- 练习链接卡：`🔗 本课课后练习链接` + 说明 + 只读输入框（全 URL）+ 「复制」「试一下」。
- `.teacher-tabs`：横向滚动，按钮 `9px 14px`、`.9rem`、`--card` 底灰字，`.active` 主色白字；六项：📝 课堂设置 / 🟢 状态墙 / 📊 成绩报告 / 🏆 排行榜 / 🏠 自主练习 / ⚙️ 全局配置。
- 课堂设置：生字表大 textarea；本轮字表（`.char-chip` 带 A/B 角标 + 结构小字 + 右上 ✕）；教学顺序与课次；部件课堂名（N2 起）；组字故事（N3 起）；底部「保存设置」/「▶️ 保存并开始上课」，上课后追加 上一题 / 下一题 / 结束本局。
- 状态墙：当前题目大字 + 「第 1 / 4 题」+ ← →；统计行「N 人在线 · 🟢 n 已对 · 🟡 n 卡住 · 🔴 n 求助 · ⚪ n 进行中」；`.wall-grid` 自适应 96px 列，`.wall-cell` 五态配色，显示昵称 + 「N 对」；底部「结束本局并生成报告」。
- 成绩报告：`.metric-grid` 四格（参与人数 / 平均正确率 / 攻下字数 / 求助次数）；个人榜表；按字查 / 按人查切换；刷新；⬇️ 导出 CSV；按字表列：字 / 课次 / 正确率 / 卡住 / 求助 / 第 3 次才对 / 提示后仍错。
- 排行榜：标题 + 计分说明 + 范围/周期筛选 + 列表。
- 自主练习：隐私说明 + 7/30/90 天 + 四格指标 + 课后最难练的字 + 数据留存。
- 全局配置：已保存的组字故事 + 已覆盖的拆解 + 刷新。

## 6. 档案馆 / 字库

- 档案馆：标题 + 说明 + 返回 + 刷新 + 批量管理 + 排序（创建时间 / 房间号，升降序）+ 分组（共享 / 我的）+ 文件夹（未归类 N 个）+ 行（房间号 + 名称 + 时间 · N 字 · 状态 + 打开控台 + 导出）。
- 字库：标题 + 说明 + 字集列表（N）+ 导入新字集 + 分组（我的 / 共享）+ 字集卡（名称 + 分类 + 字数）+ 右侧字表预览（字块带模式角标）。

## 7. 响应式

| 断点 | 变化 |
| --- | --- |
| ≤ 560px | 页面单列，卡片全宽；`.assembly-area` 280px；`.part` 66×76 / 2rem；统计条换行居中 |
| ≤ 400px | `.assembly-area` 240px |
| 桌面 | `.page` 720px 居中，流式布局，无侧边栏 |

## 8. 动效

| 元素 | 参数 |
| --- | --- |
| 按钮按下 | `transform: scale(.97)`，100ms |
| 部件选中 | `scale(1.05)` |
| 拖拽 | 跟手，`pointermove` + rAF 合并，无过渡 |
| 答对反馈卡 | 出现后 2.6s 自动切题；底部进度条 2s 线性收缩 |
| toast | 固定底部 90px 居中，淡入淡出 |

`prefers-reduced-motion: reduce` 时关闭缩放与倒计时动画，保留状态切换。
