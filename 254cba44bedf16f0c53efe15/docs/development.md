# 知己开发设计

## 1. 目标与依据

本设计将[产品设计](product.md)转化为前端、数据库、算法和测试的实现约定。首次交付覆盖产品说明中的完整功能，开发顺序按依赖安排，最终以同一完整版本发布。

运行链路：

```text
Tiana Web 静态资源
        ↓
浏览器：界面、事实规则、统计预测、知识选择
        ↓ 官方 SDK + Tiana 运行时鉴权
Tiana DB：个人事实、预测快照、核实结果、偏好
```

一个应用绑定一个个人数据库。数据库保存事实，浏览器根据事实重新计算展示结果。知识内容随应用构建发布。

## 2. 技术选型

| 部分 | 选择 | 用途与取舍 |
|---|---|---|
| 页面 | Vue 3 + TypeScript | 复用每日表单、日期面板和知识卡片；用类型约束空值与预测状态 |
| 构建 | Vite | 输出固定 ES 模块入口，沿用仓库模板构建流程 |
| 路由 | 小型哈希路由模块 | 四个主页面和知识详情，保持 URL 可刷新及浏览器返回 |
| 状态 | Vue 响应式对象与页面草稿 | 应用规模可直接维护事实缓存、查询状态和编辑状态 |
| 数据连接 | `@tianacloud/serverless@0.1.0` | 使用运行时账号鉴权，通过 Hrana v3 参数化 SQL 读写 |
| t 分布 | `@stdlib/stats-base-dists-t-cdf@0.2.3` | CDF 和通过对称性计算的稳定尾部概率 |
| 正态分布 | `@stdlib/stats-base-dists-normal-cdf@0.3.1` | 黄体期离散分布 |
| 图表 | SVG + Vue | 周期折线、等级分布及少量趋势图，便于做文字替代和点击定位 |
| 单元测试 | Vitest | 日期、事实规则、预测、统计和知识选择 |
| 数据库测试 | Node.js 24 `node:sqlite` | 执行真实 schema 和事务约束 |
| 浏览器测试 | Playwright | 日历、编辑、导入、手机和桌面交互 |

TypeScript 和 `.vue` 文件沿用产品说明中的模块职责，工程根部的 `metadata.json`、`source.json`、`schema.sql`、`scripts/build.mjs` 等位置与现有模板一致。依赖在实现时锁定版本并提交锁文件。

### 2.1 Tiana 数据协议

首版数据访问采用 `hrana-v3`，与仓库现有 SQLite 模板保持一致：

- 从 `window.tiana.connection()` 取得实际 origin 和协议。
- 从 `window.tiana.auth` 取得共享 provider。
- 使用 `createTianaFetch({ origin, auth, requestBodyMode: 'buffered' })`。
- 向运行时 origin 下的 `/v3/pipeline` 发送参数化语句或 batch。
- 每次操作在同一请求中关闭 SQL stream。

环境能力要求与协议限制集中见第 21 节。

## 3. 工程结构与模块边界

```text
zhiji/
├── README.md
├── docs/
│   ├── product.md
│   └── development.md
├── metadata.json
├── source.json
├── schema.sql
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── scripts/
│   └── build.mjs
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router.ts
│   ├── types.ts
│   ├── db.ts
│   ├── repository.ts
│   ├── store.ts
│   ├── commands.ts
│   ├── domain/
│   │   ├── dates.ts
│   │   ├── records.ts
│   │   ├── cycles.ts
│   │   ├── probability.ts
│   │   ├── prediction.ts
│   │   ├── fertility.ts
│   │   ├── phase.ts
│   │   ├── evaluation.ts
│   │   ├── statistics.ts
│   │   └── knowledge.ts
│   ├── transfer.ts
│   ├── content/
│   │   └── cards.ts
│   ├── pages/
│   │   ├── TodayPage.vue
│   │   ├── CalendarPage.vue
│   │   ├── InsightsPage.vue
│   │   ├── SettingsPage.vue
│   │   └── KnowledgePage.vue
│   ├── components/
│   │   ├── CalendarGrid.vue
│   │   ├── DayPanel.vue
│   │   ├── PeriodForm.vue
│   │   ├── DailyForm.vue
│   │   ├── PredictionCard.vue
│   │   ├── KnowledgeCard.vue
│   │   ├── TrendChart.vue
│   │   └── ImportPreview.vue
│   └── style.css
└── tests/
    ├── unit/
    ├── sqlite/
    ├── browser/
    └── fixtures/
```

边界约定：

- 页面和组件不拼接 SQL、不计算概率。
- `db.ts` 处理 SDK、协议和结果，不包含月经业务规则。
- `repository.ts` 保存查询及固定 SQL，将数据库行转换为业务对象。
- `commands.ts` 编排事实修改、关联调整、事务及重算。
- `domain/` 是无 DOM、无数据库依赖的纯函数。
- `store.ts` 保存已确认事实和页面加载状态，草稿与事实对象分开。
- `transfer.ts` 调用同一套事实规则和命令保存导入，不旁路数据库约束。

## 4. 核心类型和空值语义

### 4.1 日期与时间

业务日期使用规范化 `YYYY-MM-DD` 字符串，以 `LocalDate` 类型区分；生成时间和写入时间使用 UTC ISO 时间戳。

```ts
type LocalDate = string;
type Timestamp = string;

type Period = {
  id: string;
  startDate: LocalDate;
  endDate: LocalDate | null;
  gapBefore: boolean;
  note: string | null;
  source: 'USER' | 'IMPORT';
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

日期字符串必须经过解析才能进入业务对象。字符串排序仅用于已规范化日期。

### 4.2 每日记录

```ts
type BleedingType = 'NONE' | 'MENSTRUATION' | 'SPOTTING' | 'UNKNOWN';
type FlowLevel = 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';

type BowelEvent = {
  id: string;
  bristolType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
  straining: boolean | null;
  pain: boolean | null;
  note: string | null;
};

type IntimacyEvent = {
  id: string;
  protection: 'YES' | 'NO' | 'UNSURE' | null;
  discomfort: boolean | null;
  bleedingAfter: boolean | null;
  note: string | null;
};

type Discharge = {
  present: boolean;
  amount: 'LIGHT' | 'MEDIUM' | 'HEAVY' | null;
  colors: string[] | null;
  textures: string[] | null;
  odor: boolean | null;
  itching: boolean | null;
  burning: boolean | null;
};
```

`DailyLog` 包含产品说明的全部日字段，每个可选字段明确可空。标签代码集中定义，中文名称由展示映射提供；白带颜色及质地保留多选。

| 值 | 含义 | 存储 |
|---|---|---|
| `null` | 未记录 | SQL NULL |
| `[]` | 已记录，该项目当天没有事件或标签 | JSON `[]` |
| `0` | 实际填了零，例如疼痛 0 分 | 数值 0 |
| `false` | 明确没有某种感受 | JSON 或整数中的 false／0 |
| `Discharge { present: false }` | 明确无白带 | 对象，其余观察字段为空 |

空备注统一为 `null`。填写了项目后清空，回到未记录状态；明确选择「没有」才写入无／零。列表事件有独立 ID，删除一次事件不影响其他项。

### 4.3 预测结果

```ts
type Prediction =
  | { status: 'NO_HISTORY'; anchorId: string | null }
  | {
      status: 'MEAN_ONLY';
      anchorId: string;
      mean: number;
      sampleCount: number;
      centerDate: LocalDate;
      windowStart: LocalDate;
      windowEnd: LocalDate;
      windowProbability: null;
    }
  | {
      status: 'PROBABILISTIC';
      anchorId: string;
      mean: number;
      sampleStd: number;
      scale: number;
      degreesOfFreedom: number;
      sampleCount: number;
      centerDate: LocalDate;
      windowStart: LocalDate;
      windowEnd: LocalDate;
      windowProbability: number;
      conditionThrough: LocalDate | null;
    };
```

经期结束、阶段和排卵参考是独立结果：各自可以可用或未知，不因一个字段为空而隐藏其他有效信息。

## 5. 数据库设计

物理表使用 `zhiji_` 前缀。SQLite JSON 列为 TEXT；可空对象使用 SQL NULL，不混用字符串 `"null"`。日期、标识、枚举和时间戳为 TEXT，布尔为受约束 INTEGER，评分为 INTEGER，睡眠时长为 REAL。

### 5.1 表与索引

| 表 | 字段与关键约束 |
|---|---|
| `zhiji_periods` | `id` 主键；`start_date` UNIQUE NOT NULL；`end_date` 可空；`gap_before` 仅 0／1；`source` 仅 USER／IMPORT；备注和时间戳 |
| `zhiji_daily_logs` | `date` 主键；出血性质、流量、评分、睡眠等标量；颜色、症状、情绪、便便、爱爱、白带等 JSON 列；时间戳 |
| `zhiji_absence_confirmations` | `id` 主键；`anchor_period_id` 引用经期；`through_date`；`created_at`；同锚点同日期唯一 |
| `zhiji_prediction_snapshots` | `id` 主键；锚点标识；算法版本；BASE／CONDITIONAL；生成时间和生成时本地日期；事实版本；输入及输出 JSON；APP／BACKUP 来源 |
| `zhiji_prediction_evaluations` | `snapshot_id` 主键并引用快照；锚点标识；是否为该锚点的基础样本；状态；实际目标标识及日期；绝对误差；核实时间和事实版本 |
| `zhiji_settings` | 固定设置键主键；设置值 JSON；更新时间 |
| `zhiji_state` | 固定 `id=1`；`facts_revision` NOT NULL；`last_write_id`，用于核实一次事实事务 |

索引：

- 经期唯一开始日期索引兼顾排序和范围查询。
- 日记录主键支持日期范围查询。
- 不确定出血使用 `date WHERE bleeding_type='UNKNOWN'` 部分索引。
- 尚未来经确认使用 `(anchor_period_id, through_date)` 唯一索引。
- 快照使用 `(anchor_period_id, generated_at, id)` 索引。
- 快照对 `(anchor_period_id, kind, algorithm_version, facts_revision)` 唯一，避免两个设备为同一事实版本重复生成。
- 核实表对基础样本建立锚点部分唯一索引：`WHERE is_baseline=1 AND status<>'INVALIDATED'`。

首发 schema 固定，没有历史数据迁移需求。数据文件格式版本、算法版本和应用版本分别记录。

### 5.2 经期区间约束

表级约束：

```sql
CHECK (end_date IS NULL OR end_date >= start_date)
CHECK (gap_before IN (0, 1))
```

INSERT 和 UPDATE 分别建立区间检查触发器。对除当前 ID 外的记录，冲突判定为：

```sql
existing.start_date <= COALESCE(NEW.end_date, '9999-12-31')
AND NEW.start_date <= COALESCE(existing.end_date, '9999-12-31')
```

出现冲突用 `RAISE(ABORT, 'ZH_PERIOD_OVERLAP')`。开始日唯一约束另行阻止重复日期。

该判定同时保证：完整区间不重叠、最多一个开放区间、开放区间必须在最后。结束日与另一开始日相同属于重叠；下一次最早可从前次结束日的次日开始。

日期格式、真实公历日期及不晚于今天由统一事实解析器检查。数据库校验规范字符串形状和起止顺序，不用服务器时区决定使用者的「今天」。

### 5.3 每日字段约束

- 出血性质、流量和睡眠质量只允许已定义值或 NULL。
- 疼痛评分为 0～10 整数，睡眠时长为 0～24 小时。
- JSON 列满足 `IS NULL OR json_valid(column)`；数组列要求 JSON 类型为 array，白带要求 object。
- 便型、标签、事件字段及白带各属性通过同一类型解析器验证，导入和界面保存共用。

月经日记录的所属经期通过日期包含关系推导，不存第二份经期 ID。提交事实事务前检查没有落在经期外的 `MENSTRUATION` 日记录，也没有经期范围内未解决的 SPOTTING／UNKNOWN 分类冲突。

### 5.4 引用与不可变快照

- 每条数据库操作在同一 stream 开启 `PRAGMA foreign_keys=ON`。
- 尚未来经确认随锚点经期删除；有意调整经期时先保存经核实的最终确认集合。
- 核实结果随快照删除。
- 快照的锚点和目标历史标识不对经期使用级联外键，删除经期后仍保留当时预测内容。
- 快照主体禁止 UPDATE，修改核实信息只更新核实表。
- 个人数据清除可以 DELETE 快照及其核实结果。

## 6. 日期模块

函数契约：

```ts
parseLocalDate(input: string): LocalDate;
localToday(now: Date): LocalDate;
toDayNumber(date: LocalDate): number;
fromDayNumber(day: number): LocalDate;
addDays(date: LocalDate, days: number): LocalDate;
daysBetween(start: LocalDate, end: LocalDate): number;
roundHalfUp(value: number): number;
```

日序数使用公历日期转换为 UTC 零点的日数，或等价的公历整数算法。输入校验通过年、月、日回读，拒绝 2 月 30 日等自动进位结果。业务不解析 `new Date('YYYY-MM-DD')` 后读取本地日，也不对本地零点时间戳求差。

`localToday` 从本地年月日构造。日期已保存后跨时区打开不改变原记录日期。页面恢复可见和跨过本地午夜时更新今天、昨日、阶段及文案；仅时间经过不产生新的预测事实。

## 7. 查询、缓存与页面状态

### 7.1 首屏查询

同一只读事务取得：

1. `facts_revision`。
2. 全部经期，按开始日期排序。
3. 全部 UNKNOWN 出血日期。
4. 最新锚点的尚未来经确认。
5. 当天日记录和个人偏好。

个人经期数量较小，全部读取使漏记前样本和历史补录判断完整。日状态只加载当天、当前月和观察页所需范围。

快照与核实信息按当前锚点和观察页需求加载；备份导出时再读取完整集合。跨页面复用已加载日期范围，禁止用局部日缓存推断整段历史没有 UNKNOWN 事件。

### 7.2 状态结构

```text
context             运行时连接身份、数据库、事实版本
facts               已确认经期、UNKNOWN 日期、确认事实
dailyByDate         已加载日记录
loadedRanges        已确认读取的日记录范围
derived             当前预测、阶段、统计和知识结果
route               当前页面及日期／范围参数
draft               原始值、编辑值、加载时事实版本
saveStatus          idle / saving / verifying / saved / failed / uncertain
```

草稿不直接修改事实缓存。失败不会清空草稿。页面切换保留活动编辑面板；离开应用或关闭页面时对未保存内容提示。

页面重新可见时读取事实版本；若远端变化，刷新相关事实和派生结果。仍在编辑的草稿保留，下一次保存提示核实远端内容。

### 7.3 路由

- `#/today`
- `#/calendar?date=YYYY-MM-DD`
- `#/insights?cycles=6&days=30`
- `#/settings`
- `#/knowledge/<card-id>`

路由解析校验日期和范围。刷新先恢复路由，再加载所需数据；异步响应不得覆盖之后选择的日期或观察范围。无效路由回到今天页。

## 8. 原子保存与跨设备编辑

### 8.1 命令契约

```ts
type FactCommand =
  | { kind: 'SAVE_PERIOD'; period: Period; relatedAdjustments: RelatedAdjustments }
  | { kind: 'DELETE_PERIOD'; id: string; relatedAdjustments: RelatedAdjustments }
  | { kind: 'SAVE_DAY'; log: DailyLog; relatedAdjustments: RelatedAdjustments }
  | { kind: 'CONFIRM_ABSENCE'; confirmation: AbsenceConfirmation }
  | { kind: 'IMPORT'; plan: ImportPlan }
  | { kind: 'CLEAR_PERSONAL_DATA' };

applyCommand(command: FactCommand, expectedRevision: number): Promise<SaveResult>;
```

`RelatedAdjustments` 是同一操作中用户确认的相邻漏记值、日出血分类和有矛盾的尚未来经确认。它是事实修改内容，不是预测参数。

### 8.2 一次事实事务

1. 解析草稿，构造最终事实集合。
2. 检查日期、区间、相邻关系及分类冲突。
3. 用户完成必要的事实确认。
4. 分配稳定记录 ID 和本次 `writeId`。
5. 在一个 Hrana batch 中锁定事实版本、保存关联修改、检查最终关系并提交。
6. 查询已保存事实，刷新页面。
7. 重算当前预测，核实旧预测；需要时保存新快照。

事实版本用于处理同一个人在两台设备编辑相同历史的实际场景。事务中的版本守卫为：

```sql
UPDATE zhiji_state
SET facts_revision = CASE
      WHEN facts_revision = ? THEN facts_revision + 1
      ELSE NULL
    END,
    last_write_id = ?
WHERE id = 1;
```

`facts_revision` 为 NOT NULL。版本不同产生语句错误，后续步骤不执行，事务回滚。客户端保留草稿，重新读取当前记录供用户核实，不静默覆盖另一设备的保存。

设置偏好修改独立保存；统计派生和快照写入不递增事实版本。

### 8.3 Hrana batch

一个 pipeline 包含 `batch` 和 `close`。batch 内顺序为：

```text
PRAGMA foreign_keys=ON
BEGIN IMMEDIATE
事实版本守卫
事实 DML，逐步链接前一步成功条件
最终关系检查
COMMIT，仅当前面所有步骤成功
ROLLBACK，仅 stream 仍不在 autocommit 时
```

每个步骤使用 `condition: { type: 'ok', step: 上一步编号 }` 串联；ROLLBACK 使用 `not(is_autocommit)`。最终关系检查通过受约束语句使违规成为错误，例如在存在孤立月经日记录时将 `facts_revision` 设置为 NULL。

pipeline 的不同 requests 即使前面失败也可能继续执行；普通 `execute` 列表不等于事务。实现必须解析 batch 的 `step_results`、`step_errors` 和 COMMIT 结果，不能只检查 HTTP 200。

`close` 失败不撤销已经确认的 COMMIT。响应缺失、COMMIT 结果缺失或事务级错误未能解释时，进入结果核实，不直接重放。

### 8.4 写入结果核实

独立查询 `zhiji_state` 及操作目标：

- `last_write_id` 等于本次 ID，且目标事实一致：保存成功。
- 目标 ID 的记录及内容明确未写入，事务也已明确回滚：保存失败，可由用户重试。
- 已有后续设备写入，或无法完成读取：保持结果不确定，展示当前远端内容，不能认定原操作一定失败。

导入和整库删除也使用同一事务标识；不为核实整份导入计算摘要。

## 9. 经期修改与关系重建

### 9.1 新增与补录

找到插入位置的前一条 P 和后一条 N。新记录 R 保存 `gapBefore`，若存在 N，则 N 的漏记值对应的是 R→N，而不是原 P→N。

- 原间隔无漏记且只是确认某条错误记录，应按最终事实重新核实。
- 原间隔有漏记时，分别确认 P→R 和 R→N 是否仍有漏记。
- 没有后继时，不需要更新其他漏记属性。

批量导入构造完整排序后的相邻关系，一次核实受影响的间隔，不逐条弹出重复问题。

### 9.2 删除

删除中间记录后，P→N 之间少了一次已知月经：

- 因为不希望保留该次真实月经记录而删除：N 标为有漏记。
- 因为那条记录并非月经而删除：由用户确认 P→N 是否有漏记。

保留同日身体记录，将失去经期覆盖的月经分类转换为用户确认的 NONE、SPOTTING、UNKNOWN 或未记录。删除锚点的尚未来经确认，旧预测快照保留，相关核实结果失效。

### 9.3 调整日期范围

缩短或移动区间可能使原 MENSTRUATION 日记录失去覆盖；扩大区间可能包含原 SPOTTING／UNKNOWN。保存前展示需要核实的日期，确认后统一修改。

批量调整时按最终集合生成 DML：必要时先移除受影响的确认、调整涉及的经期记录，再重新保存已核实确认与每日分类。中间状态不对界面可见；数据库区间约束对每一步生效，最终关系检查对整体生效。

经期范围表达一次事件的整体起止，允许中间某天明确无出血；该天不生成流量统计。

## 10. 周期提取和有效输入

```ts
extractCycles(periods: Period[], unknownDates: LocalDate[]): CycleObservation[];
selectPredictionHistory(cycles: CycleObservation[], anchor: Period): CycleObservation[];
```

处理顺序：

1. 按开始日排序已确认经期。
2. 对相邻经期生成观测，计算日数差。
3. 后继有漏记则标为 GAP；严格位于两个开始日之间存在 UNKNOWN 则标为 UNKNOWN_BLEEDING。
4. 其余正间隔为有效周期。
5. 当前预测采用最新锚点之前最近 12 个有效周期。

无效观测仍可用于日历解释，不进入均值或周期趋势图的连续线。点滴出血不影响周期起点。

预测输入对象包含锚点、选中的周期端点与长度，以及计算有效性所需的出血事实。对象采用固定键顺序、按日期排序的数组序列化，直接比较字段判断是否变化。

新 UNKNOWN 出血位于最新锚点之后时，既有开始预测可保留供参考，但当前阶段与排卵参考暂不确定，旧预测核实等待出血性质确认。

## 11. 月经预测计算

### 11.1 数值函数

```ts
studentTCdf(z: number, degreesOfFreedom: number): number;
studentTSurvival(z: number, degreesOfFreedom: number): number;
normalCdf(z: number): number;
cycleMass(k: number, model: TModel): number;
cycleSurvivalAfter(e: number, model: TModel): number;
windowMass(center: number, radius: number, model: TModel): number;
```

t 分布生存函数使用对称性 `Tν(-z)`，不是在右远尾直接做 `1 − Tν(z)`。标准正态也可通过对称性计算右尾。

定义 `S(x) = Tν((μ − x) / a)`，即连续周期的生存函数，`Z=S(0.5)`。

- 左半区间概率用 CDF 差。
- 右半区间概率用生存函数差。
- 跨中心区间按两侧计算。

遇到正常浮点舍入造成的极小负数可收敛为零；实质性负数、NaN 或归一化异常返回数值错误，不伪造概率。

### 11.2 点预测和概率

默认参数使用产品说明：最近 12 个周期、4 个概率样本门槛、2 天标准差下限、校准系数 1、±3 天窗口。

```text
N=0     → NO_HISTORY
1≤N≤3   → μ、half-up 中心、7 天窗口、概率空
N≥4     → μ、样本 s、ν=N−1、a=max(s,2)√(1+1/N)、离散 t 模型
```

整数概率和尾部：

```text
p(k) = [F(k+0.5) − F(k−0.5)] / Z，k≥1
P(K>e) = S(e+0.5) / Z
```

基本中心使用 `roundHalfUp(μ)`。窗口概率求和时忽略 k≤0，显示范围仍为中心前后 3 个日历日。小样本的标准差为空或仅用于内部计算，不用零伪装成已经测得完全稳定。

### 11.3 有界概率与尾部

数学模型以参数表示，可按任意整数日求概率。月历只请求当前可见日期和固定窗口需要的概率；不为了展示一页月历生成数万天的数组。

计算尾部边界时先扩大上界，再二分到满足 `P(K>H)≤10⁻⁶` 的整数 H。该边界用于记录数值支持和核实截断误差，不要求界面绘制所有日期。

快照保存中心周边和本次日历展示范围的有界日概率表、表起止、表外左右概率，以及数学支持上界 H。表不重新归一化；窗口和其他日期通过快照参数精确重算。

## 12. 经期长度、排卵和易孕

### 12.1 经期长度

已闭合经期按开始日期排序，选最近 6 次。持续天数包含首尾。中位数 half-up 后用于当前及下次预计结束日。

结束未知的记录不参与持续时间样本；没有样本返回未知，1～2 次附少量样本标签。预测结束日过期后保留值供核实，不写入真实结束日。

### 12.2 黄体期权重

模块初始化时计算 h=6～20 的正态半天区间概率并归一化为 q(h)，后续复用。群体均值 12.4、标准差 2.4 随算法版本固定。

### 12.3 排卵分布的解析归一化

有效组合要求 k≥h。有效总质量可直接计算：

```text
V = Σ q(h) × P(K≥h)
  = Σ q(h) × S(h−0.5) / Z
```

任意排卵偏移 o≥0：

```text
pO(o) = Σ q(h) × p(o+h) / V
```

这样无需枚举无限周期长度即可正确归一化。排卵右尾也可解析计算：

```text
P(O>u) = Σ q(h) × P(K>u+h) / V
```

按该尾部函数选择支持边界，使误差相对于有效总质量满足 10⁻⁶。存储或展示有限日期不改变 V。

基本模型的排卵峰值在各 h 分量峰值之间搜索；每个分量在离开自身整数峰值后单调下降，搜索区间取 `max(0,floor(μ−20)−1)` 到 `max(0,ceil(μ−6)+1)`。直接逐日求 pO，平局取较早日期。小周期导致边界为零时仍计算有效质量，不人为将排卵钳制到某个固定周期日。

### 12.4 易孕参考

可见日 d 的值为 `pO(d)+...+pO(d+5)`。色阶依据当前参考范围内的相对值，图例注明「日历估计的相对可能性」。示意窗口为排卵峰值日前 5 天到当天，只展示当前周期开始日及以后。

1～3 个有效周期只输出「下次估计开始日减 12 天」的粗略日期与示意窗口，没有概率色阶。粗略日期必须落在当前周期内部，否则返回未知。

## 13. 尚未来经确认与阶段

### 13.1 条件更新

有效确认日期必须早于或等于昨日。当前锚点采用最晚有效 `throughDate`，令 e 为锚点到该日的偏移：

```text
pConditional(k) = p(k) / P(K>e)，k>e
pConditional(k) = 0，k≤e
```

在基本整数峰值及 e+1 附近计算候选，选择条件概率最大的日期，平局取较早值。窗口求条件概率之和。只有 MEAN_ONLY 时保留明确确认事实，返回无法进行条件日期更新的展示状态。

尚未来经确认不会改变历史周期 μ 和 s。新经期开始后，旧锚点确认不再约束当前预测。

条件排卵使用条件 K 分布和同一 q(h) 重算：

```text
Vc = Σ q(h) × P(K≥max(h,e+1)) / P(K>e)
pOc(o) = Σ q(h) × pConditional(o+h) / Vc，o≥0
```

条件截断改变分量峰值和支持起点，因此峰值搜索改用 `M=max(μ,e+1)`，在 `max(0,floor(M−20)−1)` 到 `max(0,ceil(M−6)+1)` 之间计算，不能继续搜索旧的排卵参考日期附近。

条件排卵的有效性与解释仍是日历模型。条件周期的尾部支持使用 `P(K>H)/P(K>e)` 确定；条件排卵尾部由各 h 的条件生存概率求和确定，不能沿用原来的小图表作为完整支持。

### 13.2 阶段状态

```ts
type PhaseResult = {
  phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION_REFERENCE' | 'LUTEAL' | 'UNKNOWN';
  source: 'RECORDED' | 'ESTIMATED' | 'UNKNOWN';
  cycleDay: number | null;
  expectedBoundary: LocalDate | null;
  reason: string | null;
};
```

优先级：

1. 今天落在已记录完整经期内：MENSTRUAL，RECORDED。
2. 进行中经期的开始日有实际记录：展示周期日及结束尚未填写。预计结束已过时，若当天没有明确月经出血记录，阶段为 UNKNOWN 并提示核实结束；有当天明确记录时仍可显示经期。没有持续时间样本且今天晚于开始日时，阶段也不把未填写结束当作仍在出血的证据。
3. 最新锚点后有 UNKNOWN 出血：UNKNOWN。
4. 月经窗口已过且没有覆盖截至昨日的明确尚未来经确认：UNKNOWN；旧估计仍可查看。
5. 排卵参考可用且经期结束已知：按经期后、排卵峰值±1 天、其后至下次估计分期。
6. 其余为 UNKNOWN，选择一般知识。

阶段剩余时间使用预计边界的日期差，标为大致参考；不生成负数倒计时。回看历史日时优先展示该日真实经期和状态，历史阶段推算注明是当前历史数据的参考，不冒充当日在线判断。

## 14. 预测快照与平均误差

### 14.1 保存内容

快照主体包括：

```text
id / anchorPeriodId / kind / algorithmVersion
factsRevision / generatedAt / generatedLocalDate / origin
input:
  锚点开始日期、相关历史端点、gap 事实、UNKNOWN 事实、有效长度
  基本模型参数、明确确认日期（条件快照）
output:
  中心、窗口、窗口概率、样本数
  概率表及其边界和尾部
  经期长度及排卵参考所需参数
```

经期结束相关输入单独归类；只改变结束日期时可以刷新预计结束，但不使原本不依赖结束日期的开始预测误差失效。

初次打开有有效数据时，或相关事实修改后，生成当前最新锚点的快照。不为导入历史逐个旧锚点生成快照。仅窗口查看范围改变不创建另一条预测。

先直接比较最新快照的算法版本及模型输入；相同则复用，否则插入新快照。插入事务核对 `facts_revision` 仍与计算时一致；若变化，刷新事实重算。相同版本的竞争插入以唯一键核实已有快照。

### 14.2 快照不可覆盖

预测内容只插入不更新。当前最新值由事实重新计算，旧快照保留用于核实。评估状态和实际结果存入独立表，允许变化。

事实保存成功而快照保存失败时，页面仍显示已保存记录。恢复后使用真实生成时间保存快照，不把晚生成的预测写成早期成绩。

### 14.3 基础样本

每个锚点选择第一次有中心日期的 BASE 快照作为基础样本。条件快照不进入平均误差。

记录只提供实际开始日期，没有开始时刻，因此采用保守规则：快照的 `generatedLocalDate` 必须严格早于目标实际开始日。同一天生成与开始的先后无法核实，不计入平均误差。生成时本地日期随快照固定，跨设备或时区读取不重算。

### 14.4 核实状态

| 状态 | 条件 | 是否计入 |
|---|---|---|
| PENDING | 没有可确认下一次开始，或间隔仍有 UNKNOWN | 否 |
| EVALUATED | 有下一条连续确认经期，输入仍有效且生成日更早 | 是 |
| SKIPPED_GAP | 目标记录前有漏记 | 否 |
| INVALIDATED | 锚点或开始预测输入被更正、目标先于预测生成 | 否 |

每次核实时，按快照锚点截止日期从当前事实重新提取其开始预测输入，与保存输入直接比较。未来目标不进入模型输入。修改快照之外的日常字段不使结果失效。核实表记录具体原因；因模型输入更正而失效的旧基础样本不自动复活，后续符合条件的预测作为新基础样本。

目标是锚点后的第一条确认经期。补录、更正目标或解除 UNKNOWN 后重新核实。删除已核实目标会使旧结果退出统计，而不是保留旧误差。

开始预测输入已更正且目标还没发生时，原基础样本失效，当前更正后的首条 BASE 可成为新基础样本。部分唯一索引保证每个锚点只存在一个未失效基础样本。

### 14.5 平均误差

```text
MAE = Σ |实际开始日 − 预测中心日| / EVALUATED 基础样本数
```

显示一位小数及核实次数；没有样本显示空状态。列表、页面和卡片不展示其他预测成绩。

核实结果的事实版本用于识别陈旧结果。观察页读取当前事实后重新核实需要更新的快照；结果计算完成再呈现平均误差，不先展示已经失效的数据库缓存值。

## 15. 统计与个人观察

### 15.1 统计接口

```ts
cycleStatistics(cycles: CycleObservation[], range: CycleRange): CycleStatistics;
periodStatistics(periods: Period[], range: CycleRange): PeriodStatistics;
dailyStatistics(logs: DailyLog[], range: DateRange): DailyStatistics;
buildObservations(data: ObservationInput): Observation[];
```

每项结果包括值、样本数、覆盖范围和来源日期或记录 ID。先计算原始数值，再在展示层做小数和百分比格式化。

### 15.2 分母与周期日

- 症状或情绪的分母是填写该项目的日期数，`[]` 进入分母但不增加任何标签计数。
- 流量分布只统计填写流量的日期；经期区间的缺失日没有默认流量。
- 疼痛 0 分参与均值，未填不参与。
- 排便和爱爱次数来自数组长度；空列表计 0，NULL 不计为 0。
- 每种便型只统计实际填写便型的事件，同时保留已记录事件总数作覆盖说明。
- 白带无进入项目覆盖，有时才统计其具体属性；每个属性使用自己的已填分母。
- 一个日期允许多种颜色或情绪，类别比例之和可以超过 100%，图表不误用互斥饼图。

周期日由最近一条不晚于该日的确认开始日计算，加 1。若下一个开始日前标记有漏记，该断点间的每日记录不用于周期位置归类，但仍保留在按日统计中。

### 15.3 比较规则

- 周期与经期长度：最近 3 个有效样本对之前 3 个。
- 每日状态：截至今天的最近 30 天对之前 30 天，各项目每段至少 7 个有效记录日。
- 疼痛与周期日关系：至少覆盖 3 个无漏记、可定位周期，按周期日展示覆盖数；不把仅填经期两天的记录解释为整个周期没有其他疼痛。

观察对象包含模板 ID、计算值、范围、样本量和来源。知识文案使用占位值渲染，不自由生成统计结论。

## 16. 知识内容和选择

### 16.1 内容类型

```ts
type KnowledgeCard = {
  id: string;
  title: string;
  summary: string;
  paragraphs: string[];
  topics: string[];
  phases: PhaseResult['phase'][];
  suggestions: string[];
  careNotices: string[];
  sources: { title: string; url: string }[];
  reviewedAt: LocalDate;
};
```

内容使用结构化纯文本，Vue 默认转义显示。个人备注也按文本显示。健康提示不从未经审核的标签组合即时生成。

### 16.2 决定性选择

- 已记录月经选择经期照护主文案。
- 有估计阶段选择对应阶段主文案。
- UNKNOWN 使用一般照护或记录方法。
- 主题卡片根据已记录感受选取，按内容定义的固定主题顺序取最多 3 张。
- 同主题多篇按日序数对卡片数取模轮换，排序固定。
- 需要医疗求助的知识提示先展示，其规则随内容明确登记。

卡片展开状态为页面 UI 状态，不写入健康事实。知识详情可通过固定 card ID 深链接访问。每张卡片有来源及审核日期。

## 17. 导入、导出与删除

### 17.1 备份格式

```ts
type BackupV1 = {
  format: 'zhiji';
  formatVersion: 1;
  exportedAt: Timestamp;
  periods: Period[];
  dailyLogs: DailyLog[];
  absenceConfirmations: AbsenceConfirmation[];
  predictionSnapshots?: PredictionSnapshot[];
  predictionEvaluations?: PredictionEvaluation[];
  settings?: Record<string, unknown>;
};
```

JSON 保留 NULL、空数组和布尔值。用户原始记录导入可省略快照、核实信息和设置。导出在同一只读事务取得一致事实和相关快照；导出后清理浏览器临时下载对象。

### 17.2 合并策略

自然键为经期开始日、日记录日期、确认的锚点加日期；快照按 ID 核对内容。

- 同键同内容：跳过。
- 同键不同内容：用户明确选择保留或采用导入值。
- 同经期 ID 但开始日不同：视为修改冲突，不创建两条同 ID 记录。
- 日期范围重叠：必须先处理。
- 关联记录 ID 改变：在导入计划中统一重映射。
- 相同快照 ID 但主体不同：冲突，不覆盖不可变主体。

比较使用业务字段，不因写入时间不同产生假冲突。预览保存读取时的事实版本；用户确认导入时若远端版本变化，重新预览，不套用过期计划。

### 17.3 导入事务

预览先在内存建立最终事实集合，通过与日历相同的规则。按最终集合调整受影响的确认、经期和每日状态，恢复正确引用，在一个 batch 中写入。

SQLite 立即区间约束要求调整顺序不得产生暂时重叠；涉及移动多段区间时，先删除受影响经期及确认，再按新集合重新插入同 ID 经期，最后恢复已核实确认。快照不随经期删除，原先的相关核实结果由最终事实重新核实。

备份里的核实结果不是最终权威；恢复后使用快照、当前事实和生成日期重新核实。缺少输入、无法匹配锚点或无法核实目标的快照不参与平均误差。

### 17.4 CSV

导出四类记录：经期、每日状态、排便事件、爱爱事件。事件明细带日期和事件 ID。采用 UTF-8、RFC 4180 引号规则；每日状态明确输出是否填写项目及其值，让零、无、空白可区分。CSV 用于查看，JSON 用于完整恢复。

### 17.5 删除

确认后在单次事务中清除核实结果、快照、确认、每日记录、经期和设置，递增事实版本并保留本次事务标识。成功后重置 UI 和事实缓存，显示空库首页。

## 18. 界面实现细节

- `CalendarGrid` 使用日序数生成 6×7 日期格，月份切换不更改选中日的事实。
- `DayPanel` 接收日期及只读事实，提交完整命令；手机为底部面板，桌面为侧栏。
- `PeriodForm` 控制开始、结束、范围和关联事实确认，不展示统计影响说明。
- `DailyForm` 使用字段组，事件列表通过 ID 维护；隐藏组不清空已有值。
- `PredictionCard` 按结果类型渲染，概率字段为 NULL 时不显示百分比占位。
- `KnowledgeCard` 使用按钮及 `aria-expanded`，展开正文保持键盘焦点合理。
- `TrendChart` 同时提供文字摘要和明细列表，点击节点打开对应记录。
- `ImportPreview` 展示冲突日期及两份内容，所有选择完成后才允许提交。

默认小屏为纵向布局，宽屏约 960px 及以上使用侧栏和双列；触控目标不小于 44px。日期范围既支持触控逐次选起止日，也支持键盘和日期输入，不依赖拖拽。

## 19. 测试设计

每组测试对应具体业务失败：约束失效会保存错误事实；数学失效会生成错误日期或概率；保存流程失效会丢输入或重复记录；托管链路失效会导致实际不能使用。

### 19.1 日期和数学

| 测试 | 预期 |
|---|---|
| 跨年、2024 闰日、不同本地时区 | 相同日历日差不变 |
| 不存在日期、未来事实 | 拒绝保存 |
| 周期 28、29、27、28 | μ=28，s=√(2/3)，启用下限 2 |
| 四个完全相同周期 | 中心正确，窗口概率小于 1 |
| 0／1／3／4／12／13 个样本 | 正确结果类型及最后 12 个取样 |
| 左尾、右尾、跨中心窗口 | 与独立高精度参考值一致 |
| 正整数离散分布 | 质量加解析尾部约等于 1 |
| 明确截至 e 日尚未来经 | k≤e 质量为零，条件质量加尾部约等于 1 |
| 排卵有效质量 | 与小规模直接枚举对照一致 |
| 基本及条件排卵峰值搜索 | 与完整参考支持枚举相同，延迟确认后不误用旧峰值范围 |
| 易孕值 | 等于六个对应排卵质量之和 |

概率参考值使用独立工具预先生成的公开合成参数夹具；测试运行不请求外部服务。尾部容差与浮点计算容差分开断言。

### 19.2 SQLite 和事务

- 执行完整 schema 后直接 SQL 插入重复开始日、重叠区间、第二开放区间，确认被拒绝。
- UPDATE 同样触发区间约束。
- 日评分、JSON 类型和枚举约束拒绝错误值。
- 两个命令使用相同事实版本，仅一个成功，另一不覆盖。
- 批次中间语句失败后，前面事实修改及版本增量回滚。
- 导入多段调整和删除保留每日状态的最终关系正确。
- 快照主体 UPDATE 被拒绝，核实结果可更新。

### 19.3 业务与快照

- 漏记只排除跨断点间隔，之后的周期可用。
- 点滴不成为锚点；UNKNOWN 阻断相邻周期，解除后恢复。
- 补录和删除重新建立正确漏记关系。
- 普通情绪编辑不创建另一条开始预测。
- 输入更正使相关基础样本失效，目标更正更新误差。
- 同一天生成与实际开始不计入；条件更新不增加基础样本数。
- 导入历史只生成当前预测，不产生历史在线成绩。
- 删除目标后旧误差退出统计。
- 缺失与显式无在统计和备份中始终不同。

### 19.4 浏览器与数据访问

本地 HTTP／SQLite 夹具模拟符合真实 SDK framing 的 Hrana 通道，验证表单读写和批次，不在真实失败后自动切换夹具。

覆盖：新用户、经期开始结束、补录、每日多次事件、修改删除、预测逾期、知识展开、导入冲突、CSV／JSON 下载、刷新和路由返回。

故障覆盖：发送前失败、事务明确失败、COMMIT 后响应丢失、核实读取失败、慢查询后切换日期、保存中重复点击、手机与桌面草稿版本冲突。

### 19.5 真实托管验收

使用制作任务创建的真实 Tiana SQLite／Git／Web 资源和合成数据验证：

1. 运行时 provider、Hrana 参数绑定和 batch 事务可用。
2. 应用写入并刷新后持久化。
3. 手机及桌面可阅读、填写和导出。
4. 真实导入中途失败不留下部分事实。
5. 正式构建入口、源码 commit、资源绑定与发布内容一致。

本地夹具结果与真实环境结果分别记录。

## 20. 实施顺序与构建交付

| 步骤 | 实现内容 | 完成依据 |
|---|---|---|
| 1 | 工程、类型、日期模块、schema、Hrana 事务 | 日期和数据库约束测试通过；真实事务契约成立 |
| 2 | 日历、经期和每日记录、保存核实 | 核心记录闭环、刷新持久化、关系调整通过 |
| 3 | 周期、t 概率、持续时间、条件预测、排卵与阶段 | 确定性数学测试和逾期交互通过 |
| 4 | 快照、核实、MAE、观察统计 | 样本不重复、输入修订正确、统计缺失语义正确 |
| 5 | 知识内容、今日页面、响应式与可访问性 | 文案状态正确、手机与键盘流程通过 |
| 6 | 导入导出、删除、完整回归、模板参数化 | 备份恢复、事务导入和真实托管验收通过 |

构建沿用仓库模式：`scripts/build.mjs <完整源码commit>` 验证绑定、构建 `dist/assets/app.js` 及样式，输出 `TIANA_PROJECT_PARAMS`。入口自行加载 CSS，资源引用保持相对路径。固定入口在首次创建 Web 时指定。

模板元信息声明 SQLite 和 Git 参数化绑定，schema 指向根部 `schema.sql`。生产库从空库初始化；测试夹具保存在 `tests/fixtures/`，不灌入用户数据库。

源码及锁文件推送到制作任务的 Tiana Git，构建对应明确 commit。公开模板提交、打包、GitHub PR 和 Gaia 发布遵循仓库格式与制作技能流程，记录实际结果。

## 21. 能力要求、限制与参考

### 21.1 运行能力

- 运行时需提供账号 auth provider 及 connection；凭据仅在内存中由 SDK 使用。
- 首版要求 `sql_api='hrana-v3'`，支持参数化 execute、batch 条件、事务、SQLite JSON 和约束触发器。
- 已公开的 `tiana-http` 指引尚未明确用户输入参数绑定契约；该协议不能直接替代本设计的数据通道。目标环境只有此协议时，需要先取得并验证正式参数及事务契约，再开展真实 CRUD 接入。
- Hrana 规范成立不代表目标部署已实现全部能力；真实数据库验收必须验证中途失败回滚，不只验证成功批次。
- 云端写入依赖网络；当前页面草稿没有跨浏览器的离线恢复保证。
- 在线预测只能核实日期级事实，无法区分同一天实际开始和生成预测的先后，因此同日样本不计入 MAE。
- 阶段、排卵和易孕计算的健康适用边界沿用产品说明。

### 21.2 参考

- [产品设计](product.md)。功能与交互依据。
- [仓库模板格式](../../FORMAT.md)。工程、变量和构建交付约定。
- [Hrana v3 协议](https://github.com/tursodatabase/libsql/blob/main/docs/HRANA_3_SPEC.md)。HTTP pipeline、batch 条件、结果和 stream 语义。
- [Tiana 公开技能](https://github.com/tianacloud/agent-skills)。Web 托管、SDK 鉴权、SQLite 连接和模板制作方式。
- [Student's t CDF 实现](https://github.com/stdlib-js/stats-base-dists-t-cdf)。CDF 与对称尾部计算。
- [正态 CDF 实现](https://github.com/stdlib-js/stats-base-dists-normal-cdf)。黄体期离散权重计算。
