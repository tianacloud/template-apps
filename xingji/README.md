# 行迹 · 油耗账本

个人燃油汽车与摩托车的油耗、费用和保养账本。支持多车、加满与亮灯分段计算、漏记处理、加权平均、耗油成本、加油站比较、月度费用、年度按日分摊、收支分类、保养待办、CSV导出及JSON完整备份恢复。桌面和手机均可使用。

使用Tiana身份和运行时SQLite连接，凭据由宿主动态提供。数据按应用ID分开存储；实际访问权限遵循所属租户，适用于个人使用。版本条件写入和原子保存回执防止多页面覆盖，结果不明时先核实，再继续操作。

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run build
npm run showcase
```

先执行 `sql/schema.sql`，没有种子数据，首次打开是空账本。可以创建自己的车辆，或明确载入可公开的合成示例。完整产品规则与验收条件见 [spec/product.md](spec/product.md)。

创建应用时固定入口 `assets/app.js`，绑定本次SQLite和Git。入口导出 `mount(element, runtime)`，运行时提供 `appId`、`auth` 和 `connection()`。构建输出包含入口、许可和256×256的 `icon.png`，不把数据库地址或凭据写入编译产物。`source.json` 是部署参数；模板安装后由Agent填入实际资源ID，构建脚本输出 `TIANA_PROJECT_PARAMS`。

```sh
tiana sqlite shell SQLITE_INSTANCE_ID -f sql/schema.sql --format json
tiana web create 行迹 --entry assets/app.js --database-instance-id SQLITE_INSTANCE_ID --git-instance-id GIT_INSTANCE_ID --json
tiana web serve WEB_ID --dir dist
tiana web publish WEB_ID --dir dist --json
```

资源ID使用本次创建并核实就绪的实际值。发布前提交并推送源码，在干净的确定提交构建，再更新关联源码版本和发布当前产物。

油耗归于一条加油记录开始的行程，最新记录等待下次加油。加满法使用后一次加油量，亮灯法使用前一次加油量，未加满时累计有效阶段，漏记重置累计，平均值按有效里程加权。优惠不影响油量；耗油成本按最近加油的实付单价分配，库存不足时使用最早可知价格估计并注明。实付支出包含最后一箱油。年度费用支持现金和按日分摊两种视图，分摊到下一周年，仅统计已过天数。

JSON导入先校验日期、金额、里程、分类关系、大小和结构，再显示预览，确认后完整替换当前账本。恢复前先导出备份。CSV为UTF-8带BOM，转义逗号、引号和换行，并保护可能被表格软件当作公式的用户文字。

`showcase/preview.html` 复用正式组件和样式，在 `sandbox="allow-scripts"` iframe 内使用内存合成数据，可新增、编辑、搜索、切换页面及恢复示例，不依赖网络、账号或浏览器存储。预览中的下载、导入被明确禁用，安装后的应用提供完整能力。

可以调整界面配色、文案、初始费用分类、车辆字段和统计布局；计算、数据校验与保存边界由测试覆盖。第三方许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
