# 汉字拼拼乐 · 拆字重组课堂游戏

给中文课堂的拆字重组集体游戏。老师把一课的生字录进课堂，学生在手机或电脑上把打乱的部件拼回目标字；老师在大屏上实时看到谁已对、谁卡住、谁求助，课后拿到逐字的成绩报告。

## 功能

- **拆字**：输入任意汉字即按随应用托管的拆字资料自动拆成部件，给出结构与拼音、释义；独体字自动标记为不可拆。
- **课堂**：房间号即入口，学生输昵称加入，无需注册；老师可切题、结束本局。
- **拼字**：拖拽部件到拼字区，按左右或上下摆好再提交；系统按部件多重集、摆放顺序与结构标签判对错；包围结构按内外位置判定。
- **状态墙**：五态（未开始 / 进行中 / 卡住 / 求助 / 已对）实时网格。
- **成绩报告**：班级四指标、个人榜、按字查（卡住 / 求助 / 第 3 次才对 / 提示后仍错）、导出 CSV。
- **排行榜**：全部课堂或本课堂 × 累计 / 本周 / 本月，按分数、答对数、用时排序。
- **课后练习**：本课生字或自定义字表，匿名记录练习数据，老师端按 7/30/90 天查看。
- **字库**：按课次或级别分类的字集，可导入、共享、删除。
- **拆解覆盖 / 组字故事 / 教学顺序与课次**：老师可覆盖任一个字的拆法（含整块锁定），按老师全局生效。

## 技术栈

- 前端：原生 ES 模块 + Vite 库模式构建，无框架。
- 数据：Tiana SQLite，通过 `@tianacloud/serverless` 的 `createTianaFetch` + hrana-v3 pipeline 访问。
- 身份：Tiana 运行时登录态。
- 静态数据：`template-files/data/hanzi-common.json`（拆字字典）。
- 字体：LXGW WenKai、ZCOOL KuaiLe，均为 SIL OFL 1.1，随应用托管。

## 安装与构建

```sh
npm ci
npm run build -- <SOURCE_COMMIT>
```

`npm run build` 需要 `source.json` 中的 `database_instance_id` 与 `git_instance_id` 已是真实值；在模板参数化状态下构建需设置 `TIANA_TEMPLATE_BUILD=1` 跳过该校验。构建产出 `dist/`，其中包含 `assets/app.js`、`assets/app.css`、`icon.png`，并在标准输出打印 `TIANA_PROJECT_PARAMS`。

## 初始化

1. 创建 SQLite 实例，执行 `schema.sql`，再执行 `seeds.sql`。
2. 创建 Git 实例，把本目录源码推送上去。
3. 把两个实例 ID 写入 `source.json`。
4. 构建并把 `dist/` 发布为 Web 项目，入口为 `assets/app.js`。

## 可定制部分

| 项 | 位置 |
| --- | --- |
| 站点名称与副标题 | `src/main.js` 的首页 hero、`metadata.json` |
| 机构名与徽标 | `src/main.js` 的 `.school-brand`、`src/brand-badge.svg` |
| 设计令牌（配色、圆角、阴影） | `src/style.css` 的 `:root` |
| 内置示例字集 | `seeds.sql` |
| 拆字字典 | `template-files/data/hanzi-common.json` |
| 部件课堂名上限 | `rooms.max_components` 默认 3，控台可改 |

## 目录

```
src/
  main.js        路由与教师端全部页面
  play.js        学生游戏页
  practice.js    课后练习
  board.js       拼字板与判分
  hanzi.js       拆字字典与拆解计划
  store.js       数据访问
  db.js          SQLite 传输层
  identity.js    运行时身份
  ui.js          通用 UI 工具
  leaderboard.js 排行榜渲染
  style.css      全部样式
  web-root.js    资源根路径解析
template-files/
  data/hanzi-common.json  拆字字典
  fonts/                  字体文件与许可
public/
  icon.png                256×256 应用图标
spec/                     产品、玩法、界面、数据、验收规格
tests/                    判分与拆字的单元测试
```

## 测试

```sh
npm test
```

覆盖拆字解析（IDS 树、叶子、包围结构识别）、拆解计划生成、拼字判分（多重集、顺序、结构、包围位置）与计分规则。

## 许可

字体遵循各自的 SIL OFL 1.1，许可原文见 `template-files/fonts/`。拆字字典为基于 Unicode 表意文字描述序列的公开事实数据。
