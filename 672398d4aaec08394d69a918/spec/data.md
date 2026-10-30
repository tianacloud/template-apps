# 数据模型

数据库为 SQLite，`schema.sql` 建表，`seeds.sql` 写入共享示例字集。所有时间戳为 ISO 8601 字符串。

## 1. 表

### `teachers`

老师在本应用内的展示信息。主键即 Tiana 用户 ID，不存密码、邮箱或任何凭据。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | TEXT PK | 平台用户 ID |
| `display_name` | TEXT | 课堂内显示的称呼，默认空 |
| `created_at` | TEXT | 首次进入教师端的时间 |

### `rooms`

一个课堂 = 一局游戏。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `code` | TEXT PK | 房间号，老师可见、学生输入；唯一且不可改 |
| `owner_id` | TEXT | 创建者（老师）的用户 ID |
| `name` | TEXT | 课堂名称，学生端显示 |
| `folder` | TEXT | 档案馆分组 |
| `status` | TEXT | `lobby` / `playing` / `ended`，带 CHECK 约束 |
| `round_no` | INTEGER | 轮次，每点一次「下一题」+1 |
| `current_index` | INTEGER | 当前题号（0 起） |
| `max_components` | INTEGER | 部件课堂名的字数上限，默认 3 |
| `radical_names` | TEXT | JSON：部件 → 课堂称呼 |
| `stories` | TEXT | JSON：字 → 组字故事 |
| `created_at` | TEXT | 创建时间 |
| `ended_at` | TEXT | 结束时间，可为空 |

索引：`rooms_owner (owner_id, created_at DESC)`。

### `room_chars`

课堂字表，按 `idx` 顺序即教学顺序。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `room_code` | TEXT | 外键 → `rooms.code`，级联删除 |
| `idx` | INTEGER | 题号，0 起 |
| `char` | TEXT | 汉字 |
| `lesson` | TEXT | 课次标签，可为空 |
| — | PK | `(room_code, idx)` |

### `students`

一次加入即一条记录，昵称在房间内不要求唯一。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | TEXT PK | 随机 ID |
| `room_code` | TEXT | 外键 → `rooms.code`，级联删除 |
| `nickname` | TEXT | 学生自填昵称 |
| `joined_at` | TEXT | 加入时间 |
| `last_seen_at` | TEXT | 最后一次心跳，用于在线判定（20 秒阈值） |
| `help_count` | INTEGER | 求助次数 |
| `help_char` | INTEGER | 最近求助的题号，`-1` 表示无 |

索引：`students_room (room_code, joined_at)`。

### `answers`

一题一条，重复提交走 UPSERT。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `room_code` | TEXT | 房间号 |
| `student_id` | TEXT | 学生 ID |
| `char_index` | INTEGER | 题号 |
| `char` | TEXT | 该题的字（冗余，便于按字统计） |
| `parts` | TEXT | JSON：学生提交的部件序列 |
| `formation` | TEXT | `lr` / `tb` |
| `attempts` | INTEGER | 该题累计尝试次数，≥ 0 |
| `elapsed_ms` | INTEGER | 该题累计用时 |
| `correct` | INTEGER | 0 / 1 |
| `helped` | INTEGER | 0 / 1，是否点过求助 |
| `hint_triggered` | INTEGER | 0 / 1，是否触发过结构提示 |
| `updated_at` | TEXT | 最后一次提交时间 |
| — | PK | `(room_code, student_id, char_index)` |

索引：`answers_room (room_code, updated_at DESC)`。

### `char_sets`

字库。`owner_id = 'seed'` 且 `shared = 1` 的记录为随应用初始化的示例字集。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | TEXT PK | 随机 ID |
| `owner_id` | TEXT | 创建者；`seed` 表示内置 |
| `name` | TEXT | 字集名称 |
| `category` | TEXT | 分类（课次 / 级别） |
| `chars` | TEXT | 汉字串 |
| `shared` | INTEGER | 0 / 1，是否对其他老师可见 |
| `created_at` | TEXT | 创建时间 |

索引：`char_sets_owner (owner_id, created_at DESC)`。

### `char_overrides`

老师对单个字拆法的覆盖，按老师全局生效。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `owner_id` | TEXT | 老师 ID |
| `char` | TEXT | 汉字 |
| `mode` | TEXT | `A` / `B` |
| `parts` | TEXT | JSON：部件数组 |
| `lock_parts` | TEXT | JSON：锁定为整块的部件 |
| `structure` | TEXT | 结构标签 |
| — | PK | `(owner_id, char)` |

### `char_stories`

组字故事，按老师全局生效。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `owner_id` | TEXT | 老师 ID |
| `char` | TEXT | 汉字 |
| `story` | TEXT | 故事文本 |
| — | PK | `(owner_id, char)` |

### `practice_records`

课后练习记录，**不含身份信息**。

| 列 | 类型 | 说明 |
| --- | --- | --- |
| `id` | TEXT PK | 随机 ID |
| `char` | TEXT | 汉字 |
| `correct` | INTEGER | 0 / 1 |
| `attempts` | INTEGER | 尝试次数 |
| `elapsed_ms` | INTEGER | 用时 |
| `created_at` | TEXT | 完成时间 |

索引：`practice_recent (created_at DESC, char)`。

## 2. 初始化数据

`seeds.sql` 写入 4 个共享示例字集（`owner_id='seed'`、`shared=1`），全部用 `INSERT OR IGNORE`，重复执行安全：

| id | 名称 | 分类 | 字数 |
| --- | --- | --- | --- |
| `seed_set_lesson1` | 示例·第 1 课 | 第1课 | 8 |
| `seed_set_lesson2` | 示例·第 2 课 | 第2课 | 9 |
| `seed_set_lesson3` | 示例·第 3 课 | 第3课 | 8 |
| `seed_set_hsk1` | 示例·入门常用 | 入门 | 8 |

示例字集用于让新安装的模板在首次打开时字库不为空；老师可以删除或覆盖。

## 3. 数据归属与共享

- 老师只能看到 `owner_id` 等于自己的课堂、覆盖、故事；`char_sets` 额外可见 `shared = 1` 的记录。
- 学生数据（`students`、`answers`）按 `room_code` 归属，任何知道房间号的人都能加入，这是课堂场景的预期行为。
- 同一安装内的所有授权用户共享同一份数据；不同安装使用各自的 SQLite 实例，互不可见。

## 4. 静态数据

`public/data/hanzi-common.json` 为拆字字典，随应用托管、只读，不入库。字段定义见 [gameplay.md](gameplay.md#21-部件来源)。
