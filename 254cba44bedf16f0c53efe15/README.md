# 知己

个人自然月经周期的记录与知识陪伴应用。支持经期日历、身体感受、睡眠、便便和爱爱多次事件、白带观察，以及基于个人历史的日期估计和记录统计。Vue 3 与 TypeScript 构建界面，Tiana SQLite 保存事实、不可变预测快照、核实结果及偏好。

默认从空库开始。日期和阶段是统计估计，不能确认排卵、诊断或用作避孕依据；孕期、产后及激素类药物影响下的周期不适用。知识卡片附来源和审核日期。

## 初始化与构建

需要 Node.js 24、Tiana CLI、支持 `hrana-v3` 的 SQLite 实例及 Git 实例。

1. 根据 `metadata.json`，由 Agent 为本次应用创建 SQLite 和 Git 实例，将实际 ID 填入 `source.json`；用户明确指定已有实例时先核实再复用。
2. 在同一个 SQLite 实例执行 `schema.sql`。本模板不提供种子数据。
3. 运行 `npm ci` 安装锁定依赖，将源码提交并推送到本次 Tiana Git。
4. 从已推送的完整源码提交构建：

```sh
npm run build -- <完整源码提交号>
```

构建目录为 `dist`，入口为 `assets/app.js`。构建输出的 `TIANA_PROJECT_PARAMS` 包含入口、SQLite/Git 绑定及源码提交号，供 Agent 配置本次 Web 应用。使用 `tiana web serve` 预览，使用 `tiana web publish` 发布并核实激活状态；命令参数以安装版本的帮助为准。

账号鉴权和数据库地址来自 Tiana 运行时的 `window.tiana.auth` 与 `window.tiana.connection()`。预览和托管均需建立对应浏览器会话。Vite 开发页本身不提供账号连接或示例数据。

## 使用与定制

- 今天页展示记录状态、个人历史估计和知识陪伴；日历支持日期范围补录及逐日编辑。
- 未填写、明确没有和数值零分别保存。隐藏表单项目保留已有数据。
- 经期修改、关联出血分类、漏记关系及尚未来经确认在同一事务中保存；跨设备修改须核实最新事实后再保存。
- 观察页展示周期、经期和每日记录统计，来源日期可返回原始记录。概率估计从 4 个有效周期开始启用。
- 「我的」支持 JSON 完整备份与导入预览、四份 CSV 导出、偏好设置和个人数据清除。CSV 用于查看，JSON 用于恢复。
- 样式集中在 `src/style.css`；字段标签在 `src/types.ts`；知识卡片在 `src/content/cards.ts`。修改知识需核对来源和审核日期，修改算法需更新算法版本并验证快照核实规则。

## 验证

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
```

单元测试覆盖日期、离散概率与解析尾部、事实关系、快照核实和导入；数据库测试以 Node SQLite 执行真实 schema，并以 SDK 协议夹具验证事务、回滚和保存结果核实。浏览器测试覆盖记录、恢复、并发、响应丢失、手机布局和键盘操作。数学参考数据由 `tests/fixtures/generate-probability.py` 使用 mpmath 独立生成，运行已提交测试不依赖 Python。

部署验收还需在本次真实 Tiana 实例上验证界面写入、刷新持久化、事务中途失败回滚及 Git 远端提交。测试夹具仅用于测试。

## 设计文档

- [产品设计](docs/product.md)：功能、事实规则、预测、统计及使用边界。
- [开发设计](docs/development.md)：数据协议、数据库约束、算法、快照及测试约定。
