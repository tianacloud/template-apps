export function initialize(root, files) {
document.head.insertAdjacentHTML("beforeend", "<style>\n      :root {\n        --bg: #f7f8fa;\n        --panel: #ffffff;\n        --ink: #1f2329;\n        --sub: #6b7280;\n        --line: #e5e7eb;\n        --accent: #1a9850;\n        --accent2: #2563eb;\n      }\n      * {\n        box-sizing: border-box;\n      }\n      html,\n      body, #app {\n        margin: 0;\n        height: 100%;\n        background: var(--bg);\n        color: var(--ink);\n        font-family:\n          -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"PingFang SC\",\n          \"Microsoft YaHei\", sans-serif;\n      }\n      header {\n        padding: 14px 20px;\n        border-bottom: 1px solid var(--line);\n        background: var(--panel);\n      }\n      header h1 {\n        margin: 0;\n        font-size: 18px;\n        font-weight: 600;\n      }\n      header p {\n        margin: 4px 0 0;\n        font-size: 12px;\n        color: var(--sub);\n      }\n      .wrap {\n        display: flex;\n        height: calc(100% - 58px);\n      }\n      .side {\n        width: 300px;\n        flex: 0 0 300px;\n        padding: 16px;\n        overflow: auto;\n        border-right: 1px solid var(--line);\n        background: var(--panel);\n      }\n      .main {\n        flex: 1;\n        position: relative;\n      }\n      #map {\n        position: absolute;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 300px;\n      }\n      .bottom {\n        position: absolute;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        height: 300px;\n        display: flex;\n        flex-direction: column;\n        background: var(--panel);\n        border-top: 1px solid var(--line);\n      }\n      .tabs {\n        display: flex;\n        gap: 8px;\n        padding: 8px 12px 0;\n      }\n      .tab {\n        border: 1px solid var(--line);\n        background: #fff;\n        border-radius: 8px 8px 0 0;\n        padding: 6px 14px;\n        cursor: pointer;\n        font-size: 13px;\n        color: var(--sub);\n      }\n      .tab.on {\n        background: var(--accent2);\n        color: #fff;\n        border-color: var(--accent2);\n        font-weight: 600;\n      }\n      #cal {\n        flex: 1;\n        position: relative;\n        box-sizing: border-box;\n        padding: 6px 12px 2px;\n      }\n      #cal h3 {\n        margin: 0 0 2px;\n        font-size: 12px;\n        font-weight: 600;\n        color: var(--ink);\n      }\n      #cal footer {\n        position: static;\n        text-align: left;\n        margin: 2px 0 0;\n      }\n      .block {\n        margin-bottom: 18px;\n      }\n      .block h3 {\n        margin: 0 0 8px;\n        font-size: 13px;\n        font-weight: 600;\n        color: var(--ink);\n      }\n      .seg {\n        display: flex;\n        border: 1px solid var(--line);\n        border-radius: 8px;\n        overflow: hidden;\n      }\n      .seg button {\n        flex: 1;\n        border: 0;\n        background: #fff;\n        padding: 8px 0;\n        font-size: 13px;\n        cursor: pointer;\n        color: var(--sub);\n      }\n      .seg button.on {\n        background: var(--accent);\n        color: #fff;\n        font-weight: 600;\n      }\n      .row {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin: 6px 0;\n        font-size: 12px;\n        color: var(--sub);\n      }\n      .row label {\n        flex: 0 0 84px;\n      }\n      .row input[type=\"range\"] {\n        flex: 1;\n      }\n      .row .val {\n        flex: 0 0 48px;\n        text-align: right;\n        font-variant-numeric: tabular-nums;\n        color: var(--ink);\n      }\n      .datebar {\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        margin: 6px 0 2px;\n      }\n      .datebar .dlabel {\n        font-size: 20px;\n        font-weight: 700;\n        font-variant-numeric: tabular-nums;\n      }\n      .btns {\n        display: flex;\n        gap: 8px;\n        margin-top: 8px;\n      }\n      .btns button {\n        flex: 1;\n        border: 1px solid var(--line);\n        background: #fff;\n        border-radius: 8px;\n        padding: 8px 0;\n        cursor: pointer;\n        font-size: 13px;\n      }\n      .btns button.primary {\n        background: var(--accent2);\n        color: #fff;\n        border-color: var(--accent2);\n      }\n      .top {\n        font-size: 12px;\n        color: var(--sub);\n        line-height: 1.9;\n      }\n      .top b {\n        color: var(--ink);\n        font-weight: 600;\n      }\n      .tag {\n        display: inline-block;\n        width: 10px;\n        height: 10px;\n        border-radius: 2px;\n        margin-right: 4px;\n        vertical-align: middle;\n      }\n      .hint {\n        font-size: 11px;\n        color: var(--sub);\n        line-height: 1.6;\n        margin-top: 6px;\n      }\n      .layer-row {\n        flex-wrap: wrap;\n        gap: 12px;\n      }\n      .layer-row label {\n        flex: 0 0 auto;\n        display: inline-flex;\n        align-items: center;\n        gap: 4px;\n        cursor: pointer;\n      }\n      .layer-row input {\n        margin: 0;\n      }\n      .seg {\n        display: flex;\n        gap: 6px;\n      }\n      .seg button {\n        flex: 1;\n        border: 1px solid var(--line);\n        background: #fff;\n        border-radius: 8px;\n        padding: 8px 0;\n        cursor: pointer;\n        font-size: 13px;\n      }\n      .seg button.on {\n        background: var(--accent2);\n        color: #fff;\n        border-color: var(--accent2);\n      }\n      footer {\n        position: absolute;\n        right: 14px;\n        bottom: 10px;\n        font-size: 11px;\n        color: var(--sub);\n        text-align: right;\n      }\n    \n@media (max-width: 700px) { html, body { height: auto; min-height: 100%; } .wrap { display: flex; flex-direction: column; height: auto; } .side { width: 100%; flex: none; overflow: visible; border-right: 0; border-bottom: 1px solid var(--line); } .main { flex: none; width: 100%; height: 700px; } #map { bottom: 300px; } .row input[type=range] { min-width: 0; } }</style>");
root.innerHTML = "\n    <header>\n      <h1>中国 365 天宜居 / 宜旅行地图</h1>\n      <p>\n        基于 Open-Meteo 历史天气（2021–2025 年日均温与降雨，按日历日 5\n        年均值）。拖动滑块与开关即可实时重算。\n      </p>\n    </header>\n    <div class=\"wrap\">\n      <aside class=\"side\">\n        <div class=\"block\">\n          <h3>维度</h3>\n          <div class=\"seg\" id=\"metric\">\n            <button data-m=\"livability\" class=\"on\">宜居</button>\n            <button data-m=\"travel\">宜旅行</button>\n          </div>\n          <div class=\"hint\" id=\"metricHint\"></div>\n        </div>\n\n          <div class=\"block\">\n            <h3>评分模式</h3>\n            <div class=\"seg\" id=\"mode\">\n              <button data-mode=\"relative\" class=\"on\">相对适宜度</button>\n              <button data-mode=\"absolute\">绝对舒适度</button>\n            </div>\n            <div class=\"hint\" id=\"modeHint\"></div>\n          </div>\n\n          <div class=\"block\">\n            <h3>日期</h3>\n          <div class=\"datebar\">\n            <span class=\"dlabel\" id=\"dateLabel\">1月1日</span>\n          </div>\n          <div class=\"row\">\n            <label>年内第几天</label>\n            <input type=\"range\" id=\"day\" min=\"1\" max=\"365\" value=\"1\" />\n            <span class=\"val\" id=\"dayVal\">1</span>\n          </div>\n          <div class=\"btns\">\n            <button id=\"play\" class=\"primary\">▶ 播放全年</button>\n            <button id=\"reset\">恢复默认</button>\n          </div>\n          <div class=\"row\">\n            <label>播放速度</label>\n            <input type=\"range\" id=\"speed\" min=\"1\" max=\"12\" value=\"4\" />\n            <span class=\"val\" id=\"speedVal\">4×</span>\n          </div>\n        </div>\n\n        <div class=\"block\">\n          <h3>舒适温度区间（℃）</h3>\n          <div class=\"row\">\n            <label>下限</label>\n            <input type=\"range\" id=\"tmin\" min=\"-5\" max=\"30\" value=\"20\" />\n            <span class=\"val\" id=\"tminVal\">20</span>\n          </div>\n          <div class=\"row\">\n            <label>上限</label>\n            <input type=\"range\" id=\"tmax\" min=\"5\" max=\"40\" value=\"25\" />\n            <span class=\"val\" id=\"tmaxVal\">25</span>\n          </div>\n        </div>\n\n        <div class=\"block\">\n          <h3>降雨权重</h3>\n          <div class=\"row\">\n            <label>雨 vs 温</label>\n            <input type=\"range\" id=\"wrain\" min=\"0\" max=\"80\" value=\"30\" />\n            <span class=\"val\" id=\"wrainVal\">0.30</span>\n          </div>\n          <div class=\"hint\">\n            权重越高，降雨对评分的影响越大（相对温度）。宜居默认偏温度，宜旅行默认更怕雨。\n          </div>\n        </div>\n\n        <div class=\"block\">\n          <h3>自然地理</h3>\n          <div class=\"row layer-row\">\n            <label><input type=\"checkbox\" id=\"lyRivers\" checked /> 河流</label>\n            <label><input type=\"checkbox\" id=\"lyLakes\" checked /> 湖泊</label>\n            <label><input type=\"checkbox\" id=\"lyMountains\" checked /> 山脉</label>\n          </div>\n          <div class=\"hint\">\n            河流为蓝色折线，湖泊为蓝点，山脉为棕色三角（带名称标注），可单独显隐。\n          </div>\n        </div>\n\n        <div class=\"block\">\n          <h3>当日最适宜（Top 10）</h3>\n          <div class=\"top\" id=\"topList\">加载中…</div>\n        </div>\n      </aside>\n      <div class=\"main\">\n        <div id=\"map\"></div>\n        <div class=\"bottom\">\n          <div class=\"tabs\">\n            <button id=\"tabCal\" class=\"tab on\">全年日历</button>\n            <button id=\"tabRank\" class=\"tab\">年度总榜</button>\n          </div>\n          <div id=\"cal\">\n            <h3>全年每日全国 Top 10（悬停看名单 · 点击定位到当天）</h3>\n            <footer>\n              数据源：Open-Meteo Historical Archive · 底图：DataV.GeoAtlas\n            </footer>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    ";

      const PRESET = {
        livability: {
          Wt: 7, // 温度钟形宽度 σ（℃）：越小越严格，舒适区内也有梯度
          k: 12, // 降雨惩罚尺度（mm）：越大越容忍雨
          w: 0.3,
          label: "宜居",
          hint: "宜居偏重气候温和稳定：温度钟形较窄（严格），降雨容忍度较高（雨天可室内活动）。",
        },
        travel: {
          Wt: 12,
          k: 8,
          w: 0.5,
          label: "宜旅行",
          hint: "宜旅行更能容忍温度波动（钟形更宽），但更怕雨：降雨惩罚更陡（雨天直接影响出行）。",
        },
      };
      const COLOR = [
        "#b40426",
        "#f46d43",
        "#fdae61",
        "#fee08b",
        "#a6d96a",
        "#66bd63",
        "#1a9850",
      ];

      const state = {
        day: 1,
        metric: "livability",
        tmin: 20,
        tmax: 25,
        w: 0.3,
        playing: false,
        speed: 4,
        mode: "relative",
        view: "cal", // 'cal' 全年日历 | 'rank' 年度总榜
        layers: { rivers: true, lakes: true, mountains: true },
      };
      let DATA = null,
        chart = null,
        chart2 = null,
        timer = null,
        cityPoints = [],
        GEO_FEATURES = null,
        CAL_TOP = null, // 按天缓存的 Top10：{ day: [{name,score,T,P}] }
        calKey = null, // 参数指纹，变化才重算全年日历
        calReady = false,
        rawStore = null, // 每城每日原始舒适度 0-1 矩阵（与 mode 无关）
        rawKey = null,
        dayStats = null, // 每城每日最终分 0-100 矩阵（依赖 mode）
        dayStatsKey = null,
        rankCache = null, // 城市年度累计分排序结果（Top 全量）
        rankKey = null,
        bottomView = null; // 当前底部视图，用于切换时强制重绘

      // 参数指纹：原始舒适度只依赖 维度/温度区间/降雨权重
      function sigParams() {
        return [state.metric, state.tmin, state.tmax, state.w].join(",");
      }
      // 含评分模式：影响归一化，日历与年度榜都用它
      function sigMode() {
        return state.mode + "|" + sigParams();
      }

      function doyToDate(d) {
        const x = new Date(2001, 0, 1);
        x.setDate(x.getDate() + d - 1);
        return x.getMonth() + 1 + "月" + x.getDate() + "日";
      }
      // 当天对应的 ISO 日期（用 2021 非闰年铺满 365 天，仅作日历坐标）
      function dayToISO(d) {
        const x = new Date(2021, 0, 1);
        x.setDate(x.getDate() + d - 1);
        const m = String(x.getMonth() + 1).padStart(2, "0");
        const dd = String(x.getDate()).padStart(2, "0");
        return "2021-" + m + "-" + dd;
      }
      // 温度舒适度：以舒适区间中心为峰的洛伦兹钟形 1/(1+z²)
      // 中心最舒适、向两边平滑下降，舒适区内也有梯度、区间外不再硬归零
      function tempBell(T, a, b, sigma) {
        if (T == null) return null;
        const mid = (a + b) / 2;
        const z = (T - mid) / sigma;
        return 1 / (1 + z * z);
      }
      // 降雨舒适度：0 雨=1，雨越多越低（惩罚随 k 递减）
      function rainSuit(P, k) {
        return 1 / (1 + (P == null ? 0 : P) / k);
      }
      // 原始舒适度 0-1（未归一化），温度缺失返回 null
      function rawComfort(c, day, a, b, sigma, w, metric) {
        const T = c.T[day - 1];
        if (T == null) return null;
        const P = c.P[day - 1];
        const p = PRESET[metric];
        const ts = tempBell(T, a, b, sigma);
        const rs = rainSuit(P, p.k);
        return (1 - w) * ts + w * rs;
      }

      function layerSeries() {
        const gf = GEO_FEATURES || { rivers: [], lakes: [], mountains: [] };
        return [
          {
            name: "rivers",
            type: "lines",
            coordinateSystem: "geo",
            polyline: true,
            silent: true,
            zlevel: 3,
            lineStyle: { color: "#2b6cb0", width: 1.6, opacity: 0.75, curveness: 0 },
            data: state.layers.rivers
              ? gf.rivers.map((r) => ({ name: r.name, coords: r.coords }))
              : [],
          },
          {
            name: "lakes",
            type: "scatter",
            coordinateSystem: "geo",
            symbol: "circle",
            symbolSize: 7,
            zlevel: 4,
            itemStyle: { color: "#1c64f2", borderColor: "#fff", borderWidth: 0.6, opacity: 0.9 },
            label: { show: true, formatter: "{b}", position: "right", fontSize: 10, color: "#1c3f8f" },
            data: state.layers.lakes
              ? gf.lakes.map((l) => ({ name: l.name, value: l.coord }))
              : [],
          },
          {
            name: "mountains",
            type: "scatter",
            coordinateSystem: "geo",
            symbol: "triangle",
            symbolSize: 10,
            zlevel: 4,
            itemStyle: { color: "#8a5a2b", borderColor: "#fff", borderWidth: 0.6 },
            label: { show: true, formatter: "{b}", position: "top", fontSize: 10, color: "#6b4423" },
            data: state.layers.mountains
              ? gf.mountains.map((m) => ({ name: m.name, value: m.coord }))
              : [],
          },
        ];
      }

      function render() {
        if (!DATA) return;
        const day = state.day;
        const a = state.tmin,
          b = state.tmax;
        const p = PRESET[state.metric];
        const w = state.w;
        const sigma = p.Wt; // Wt 现在表示钟形宽度 σ
        // 1) 当天每个城市的原始舒适度 0-1
        const arr = DATA.cities.map((c) => {
          const raw = rawComfort(c, day, a, b, sigma, w, state.metric);
          return { name: c.name, raw, T: c.T[day - 1], P: c.P[day - 1] };
        });
        // 2) 相对模式：按当天所有城市排名做百分位数归一化（0-100）
        let rankMap = null;
        if (state.mode === "relative") {
          const valid = arr
            .filter((x) => x.raw != null)
            .sort((x, y) => x.raw - y.raw);
          const n = valid.length;
          rankMap = new Map();
          valid.forEach((x, i) =>
            rankMap.set(x.name, n > 1 ? (i / (n - 1)) * 100 : 50),
          );
        }
        const scoreOf = (x) =>
          x.raw == null
            ? null
            : state.mode === "relative"
              ? rankMap.get(x.name)
              : x.raw * 100;
        const mapData = arr.map((x) => ({ name: x.name, value: scoreOf(x) }));
        // 年度总榜视图：地图叠加 Top30 醒目标注
        const annualTop = state.view === "rank" ? annualTopPoints(30) : [];
        chart.setOption({
          series: [
            { data: mapData },
            { data: cityPoints },
            ...layerSeries(),
            {
              name: "年度Top30",
              type: "scatter",
              coordinateSystem: "geo",
              data: annualTop.map((c) => ({
                name: c.name,
                value: [c.lon, c.lat],
                total: c.total,
              })),
              symbolSize: 13,
              itemStyle: {
                color: "#e8590c",
                borderColor: "#fff",
                borderWidth: 1.2,
              },
              label: {
                show: true,
                formatter: (p) => p.name,
                position: "right",
                fontSize: 11,
                fontWeight: "bold",
                color: "#c2410c",
              },
              zlevel: 6,
              tooltip: { show: true },
            },
          ],
          visualMap: [
            {
              seriesIndex: 0,
              min: 0,
              max: 100,
              text: [
                state.mode === "relative" ? "相对最适宜" : "最适宜",
                state.mode === "relative" ? "相对最不宜" : "最不宜",
              ],
            },
          ],
          graphic: [{ id: "dateBig", style: { text: doyToDate(state.day) } }],
        });
        // top list
        const ranked = arr
          .filter((x) => x.raw != null)
          .map((x) => ({ n: x.name, s: Math.round(scoreOf(x)), T: x.T, P: x.P }))
          .sort((x, y) => y.s - x.s)
          .slice(0, 10);
        document.getElementById("topList").innerHTML = ranked
          .map(
            (x, i) =>
              `<div><span class="tag" style="background:${COLOR[Math.min(6, Math.floor((x.s / 100) * 6))]}"></span>` +
              `<b>${i + 1}. ${x.n}</b> &nbsp;${x.s}分 · ${x.T}℃ · 雨${x.P}mm</div>`,
          )
          .join("");
        document.getElementById("dateLabel").textContent = doyToDate(state.day);
        refreshBottom();
      }

      // 全年日历热力图：每格=当天最优城市分数，悬停列 Top10，点击定位
      function refreshCalendar() {
        if (!DATA || !chart2) return;
        const key = sigMode();
        if (key === calKey && calReady) return; // 参数没变，跳过全年重算
        calKey = key;
        const a = state.tmin,
          b = state.tmax;
        const p = PRESET[state.metric];
        const w = state.w;
        const sigma = p.Wt;
        const days = DATA.days || 365;
        const top = {};
        const cells = [];
        for (let day = 1; day <= days; day++) {
          const arr = DATA.cities
            .map((c) => {
              const raw = rawComfort(c, day, a, b, sigma, w, state.metric);
              return { name: c.name, raw, T: c.T[day - 1], P: c.P[day - 1] };
            })
            .filter((x) => x.raw != null);
          let scores = null;
          if (state.mode === "relative") {
            const valid = arr.slice().sort((x, y) => x.raw - y.raw);
            const n = valid.length;
            scores = new Map();
            valid.forEach((x, i) =>
              scores.set(x.name, n > 1 ? (i / (n - 1)) * 100 : 50),
            );
          }
          const ranked = arr.slice().sort((x, y) => y.raw - x.raw);
          const top10 = ranked.slice(0, 10).map((x) => ({
            name: x.name,
            score:
              state.mode === "relative"
                ? Math.round(scores.get(x.name))
                : Math.round(x.raw * 100),
            T: x.T,
            P: x.P,
          }));
          top[day] = top10;
          cells.push([dayToISO(day), top10[0].score, day - 1]);
        }
        CAL_TOP = top;
        calReady = true;
        chart2.setOption(
          {
            tooltip: {
              formatter: (pp) => {
                const day = pp.data[2] + 1;
                const list = CAL_TOP[day];
                return (
                  "<b>" +
                  doyToDate(day) +
                  "</b> 全国 Top 10<br/>" +
                  list
                    .map(
                      (x, i) =>
                        i +
                        1 +
                        ". " +
                        x.name +
                        " " +
                        x.score +
                        "分 " +
                        x.T +
                        "℃ 雨" +
                        x.P +
                        "mm",
                    )
                    .join("<br/>")
                );
              },
            },
            visualMap: {
              min: 0,
              max: 100,
              calculable: true,
              orient: "horizontal",
              left: "center",
              bottom: 0,
              itemHeight: 80,
              text: [
                state.mode === "relative" ? "相对最适宜" : "最适宜",
                state.mode === "relative" ? "相对最不宜" : "最不宜",
              ],
              inRange: { color: COLOR },
              formatter: (v) => Math.round(v),
            },
            calendar: {
              top: 44,
              left: 28,
              right: 12,
              cellSize: ["auto", 13],
              range: "2021",
              itemStyle: { borderWidth: 0.5, borderColor: "#fff" },
              yearLabel: { show: false },
              dayLabel: { firstDay: 1, nameMap: ["日", "一", "二", "三", "四", "五", "六"] },
              monthLabel: { nameMap: "cn" },
            },
            series: [{ type: "heatmap", coordinateSystem: "calendar", data: cells }],
          },
          true,
        );
      }

      // —— 年度总榜：每城“每日适宜度分 × 365 天”累加 ——
      // 原始舒适度矩阵只依赖 维度/温度区间/降雨权重（与 mode 无关），单独缓存
      function ensureRaw() {
        const k = sigParams();
        if (k === rawKey && rawStore) return;
        rawKey = k;
        const cities = DATA.cities,
          N = DATA.days || 365;
        const a = state.tmin,
          b = state.tmax,
          sigma = PRESET[state.metric].Wt,
          w = state.w;
        rawStore = cities.map((c) => {
          const out = new Array(N);
          for (let d = 0; d < N; d++)
            out[d] = rawComfort(c, d + 1, a, b, sigma, w, state.metric);
          return out;
        });
      }
      // 每日最终分 0-100（相对模式按当天排名归一化，绝对模式直接 ×100）
      function ensureDayStats() {
        ensureRaw();
        const k = sigMode();
        if (k === dayStatsKey && dayStats) return;
        dayStatsKey = k;
        const cities = DATA.cities,
          N = DATA.days || 365,
          n = cities.length;
        dayStats = new Array(N);
        for (let d = 0; d < N; d++) {
          const arr = [];
          for (let ci = 0; ci < n; ci++) {
            const r = rawStore[ci][d];
            if (r != null) arr.push([ci, r]);
          }
          const m = {};
          if (state.mode === "absolute") {
            arr.forEach(([ci, r]) => (m[ci] = r * 100));
          } else {
            const sorted = arr.slice().sort((x, y) => x[1] - y[1]);
            const cnt = sorted.length;
            sorted.forEach(([ci], i) => (m[ci] = cnt > 1 ? (i / (cnt - 1)) * 100 : 50));
          }
          dayStats[d] = m;
        }
      }
      // 年度 Top N 城市（带经纬度），供地图标注
      function annualTopPoints(n) {
        ensureDayStats();
        const cities = DATA.cities, N = DATA.days || 365;
        const totals = cities
          .map((c, ci) => {
            let sum = 0, cnt = 0;
            for (let d = 0; d < N; d++) {
              const sc = dayStats[d][ci];
              if (sc != null) { sum += sc; cnt++; }
            }
            return { name: c.name, ci, total: sum, days: cnt, avg: cnt ? sum / cnt : 0 };
          })
          .filter((x) => x.days > 0)
          .sort((x, y) => y.total - x.total)
          .slice(0, n)
          .map((x) => ({
            name: x.name, total: x.total, avg: x.avg, days: x.days,
            lon: cities[x.ci].lon, lat: cities[x.ci].lat,
          }));
        return totals;
      }
      function refreshRank() {
        if (!DATA || !chart2) return;
        const key = sigMode();
        if (key !== rankKey || !rankCache) {
          rankKey = key;
          ensureDayStats();
          const cities = DATA.cities,
            N = DATA.days || 365,
            n = cities.length;
          const totals = cities.map((c, ci) => {
            let sum = 0,
              cnt = 0;
            for (let d = 0; d < N; d++) {
              const sc = dayStats[d][ci];
              if (sc != null) {
                sum += sc;
                cnt++;
              }
            }
            return { name: c.name, total: sum, days: cnt, avg: cnt ? sum / cnt : 0 };
          }).filter((x) => x.days > 0);
          totals.sort((x, y) => y.total - x.total);
          rankCache = totals;
        }
        const top = rankCache.slice(0, 30);
        const maxT = top.length ? top[0].total : 1;
        chart2.setOption(
          {
            title: {
              text:
                "全国城市年度累计适宜度（" +
                (state.mode === "relative" ? "相对分" : "绝对分") +
                " × 365 天）Top 30",
              left: "center",
              top: 6,
              textStyle: { fontSize: 13, fontWeight: 600, color: "#1f2329" },
            },
            grid: { left: 92, right: 64, top: 34, bottom: 8 },
            tooltip: {
              trigger: "axis",
              axisPointer: { type: "shadow" },
              formatter: (ps) => {
                const x = top[ps[0].dataIndex];
                return (
                  "<b>" +
                  x.name +
                  "</b><br/>年度累计 <b>" +
                  Math.round(x.total) +
                  "</b><br/>日均 " +
                  x.avg.toFixed(1) +
                  " · 有数据 " +
                  x.days +
                  " 天"
                );
              },
            },
            xAxis: {
              type: "value",
              name: "年度累计分",
              nameTextStyle: { fontSize: 11, color: "#6b7280" },
              axisLabel: { formatter: (v) => Math.round(v / 1000) + "k" },
            },
            yAxis: {
              type: "category",
              inverse: true,
              data: top.map((x) => x.name),
              axisLabel: { fontSize: 11 },
            },
            series: [
              {
                type: "bar",
                barWidth: "62%",
                data: top.map((x) => ({
                  value: Math.round(x.total),
                  itemStyle: {
                    color: COLOR[Math.min(6, Math.floor((x.total / maxT) * 6))],
                  },
                })),
                label: {
                  show: true,
                  position: "right",
                  fontSize: 11,
                  color: "#1f2329",
                  formatter: (p) => Math.round(p.value),
                },
              },
            ],
          },
          true,
        );
      }
      function refreshBottom() {
        if (!DATA || !chart2) return;
        const h3 = document.querySelector("#cal h3");
        const ft = document.querySelector("#cal footer");
        if (state.view === "rank") {
          if (h3) h3.style.display = "none";
          if (ft) ft.style.display = "none";
          refreshRank();
        } else {
          if (h3) h3.style.display = "";
          if (ft) ft.style.display = "";
          if (bottomView !== "cal") calReady = false; // 从榜单切回，强制重绘日历
          refreshCalendar();
        }
        bottomView = state.view;
      }

      function gotoDay(day) {
        const days = DATA ? DATA.days || 365 : 365;
        day = Math.max(1, Math.min(days, day));
        state.day = day;
        document.getElementById("day").value = day;
        document.getElementById("dayVal").textContent = day;
        render();
      }

      function fullOption() {
        return {
          geo: {
            map: "china",
            roam: true,
            zoom: 1.15,
            scaleLimit: { min: 1, max: 8 },
            label: { show: false },
            itemStyle: {
              borderColor: "#cfd6dd",
              borderWidth: 0.4,
              areaColor: "#eef0f2",
            },
            emphasis: {
              label: { show: false },
              itemStyle: { borderColor: "#333", borderWidth: 1 },
            },
          },
          tooltip: {
            trigger: "item",
            formatter: (p) => {
              if (p.seriesName === "年度Top30")
                return `<b>${p.name}</b><br/>年度累计 <b>${Math.round(p.data.total)}</b>`;
              if (p.seriesType === "scatter") return p.name;
              if (p.value == null || isNaN(p.value))
                return p.name + "<br/>无数据";
              const label =
                state.mode === "relative" ? "相对适宜度" : "绝对舒适度";
              const sub =
                state.mode === "relative"
                  ? "<br/><span style=\"color:#888\">相对当天全国排名（0–100）</span>"
                  : "";
              return `${p.name}<br/>${label}：<b>${p.value}</b>${sub}`;
            },
          },
          visualMap: [
            {
              seriesIndex: 0,
              min: 0,
              max: 100,
              calculable: true,
              left: 20,
              bottom: 30,
              text: ["最适宜", "最不宜"],
              inRange: { color: COLOR },
              formatter: (v) => Math.round(v),
            },
          ],
          graphic: [
            {
              id: "dateBig",
              type: "text",
              left: "center",
              top: 22,
              style: {
                text: "1月1日",
                fontSize: 42,
                fontWeight: "bold",
                fill: "#1f2329",
                stroke: "#ffffff",
                lineWidth: 6,
                textAlign: "center",
                textVerticalAlign: "middle",
              },
            },
          ],
          series: [
            {
              name: "score",
              type: "map",
              geoIndex: 0,
              data: [],
              itemStyle: { areaColor: "transparent" },
              emphasis: {
                label: { show: false },
                itemStyle: { borderColor: "#333", borderWidth: 1 },
              },
            },
            {
              name: "cities",
              type: "scatter",
              coordinateSystem: "geo",
              data: cityPoints,
              symbolSize: 3.4,
              itemStyle: { color: "#3a3a3a", opacity: 0.5 },
              emphasis: {
                scale: 1.8,
                itemStyle: { color: "#111", opacity: 1 },
              },
              zlevel: 2,
              tooltip: { show: false },
            },
          ],
        };
      }

      function bind() {
        document.querySelectorAll("#metric button").forEach(
          (b) =>
            (b.onclick = () => {
              document
                .querySelectorAll("#metric button")
                .forEach((x) => x.classList.remove("on"));
              b.classList.add("on");
              state.metric = b.dataset.m;
              const p = PRESET[state.metric];
              state.w = p.w;
              document.getElementById("wrain").value = Math.round(p.w * 100);
              document.getElementById("wrainVal").textContent = p.w.toFixed(2);
              document.getElementById("metricHint").textContent = p.hint;
              render();
            }),
        );
        document.querySelectorAll("#mode button").forEach(
          (b) =>
            (b.onclick = () => {
              document
                .querySelectorAll("#mode button")
                .forEach((x) => x.classList.remove("on"));
              b.classList.add("on");
              state.mode = b.dataset.mode;
              document.getElementById("modeHint").textContent =
                state.mode === "relative"
                  ? "按当天所有城市排名归一化（0–100），区分度最高，适合“今天去哪最舒服”。"
                  : "基于温度与降雨的绝对舒适度（0–100），反映当天实际气候宜人程度，适合看全国整体。";
              render();
            }),
        );
        const link = (id, key, fmt) => {
          const el = document.getElementById(id);
          el.oninput = () => {
            state[key] = +el.value;
            document.getElementById(id + "Val").textContent = fmt
              ? fmt(+el.value)
              : el.value;
            render();
          };
        };
        link("day", "day");
        link("tmin", "tmin");
        link("tmax", "tmax", (v) => v);
        link("speed", "speed", (v) => v + "×");
        document.getElementById("wrain").oninput = function () {
          state.w = +this.value / 100;
          document.getElementById("wrainVal").textContent = (
            +this.value / 100
          ).toFixed(2);
          render();
        };
        ["rivers", "lakes", "mountains"].forEach((k) => {
          const el = document.getElementById(
            k === "rivers" ? "lyRivers" : k === "lakes" ? "lyLakes" : "lyMountains",
          );
          el.onchange = () => {
            state.layers[k] = el.checked;
            render();
          };
        });
        document.getElementById("play").onclick = () => {
          state.playing = !state.playing;
          document.getElementById("play").textContent = state.playing
            ? "⏸ 暂停"
            : "▶ 播放全年";
          if (state.playing) {
            timer = setInterval(() => {
              state.day = (state.day % 365) + 1;
              document.getElementById("day").value = state.day;
              document.getElementById("dayVal").textContent = state.day;
              render();
            }, 1000 / state.speed);
          } else clearInterval(timer);
        };
        const setBottom = (v) => {
          state.view = v;
          document.getElementById("tabCal").classList.toggle("on", v === "cal");
          document.getElementById("tabRank").classList.toggle("on", v === "rank");
          refreshBottom();
        };
        document.getElementById("tabCal").onclick = () => setBottom("cal");
        document.getElementById("tabRank").onclick = () => setBottom("rank");
        document.getElementById("reset").onclick = () => {
          Object.assign(state, {
            day: 1,
            metric: "livability",
            tmin: 20,
            tmax: 25,
            w: 0.3,
            speed: 4,
            mode: "relative",
            playing: false,
            layers: { rivers: true, lakes: true, mountains: true },
          });
          ["lyRivers", "lyLakes", "lyMountains"].forEach(id => { document.getElementById(id).checked = true; });
          setBottom("cal");
          clearInterval(timer);
          document.getElementById("day").value = 1;
          document.getElementById("dayVal").textContent = 1;
          document.getElementById("tmin").value = 20;
          document.getElementById("tminVal").textContent = 20;
          document.getElementById("tmax").value = 25;
          document.getElementById("tmaxVal").textContent = 25;
          document.getElementById("wrain").value = 30;
          document.getElementById("wrainVal").textContent = "0.30";
          document.getElementById("speed").value = 4;
          document.getElementById("speedVal").textContent = "4×";
          document
            .querySelectorAll("#metric button")
            .forEach((x) =>
              x.classList.toggle("on", x.dataset.m === "livability"),
            );
          document.getElementById("metricHint").textContent =
            PRESET.livability.hint;
          document
            .querySelectorAll("#mode button")
            .forEach((x) => x.classList.toggle("on", x.dataset.mode === "relative"));
          document.getElementById("modeHint").textContent =
            "按当天所有城市排名归一化（0–100），区分度最高，适合“今天去哪最舒服”。";
          document.getElementById("play").textContent = "▶ 播放全年";
          render();
        };
      }

      files.get("template-assets/china-geo.json")
        .then((r) => { if (!r.ok) throw new Error("素材读取失败"); return r.json(); })
        .then((geo) => {
          echarts.registerMap("china", geo);
          chart = echarts.init(document.getElementById("map"));
          chart.setOption(fullOption());
          return files.get("template-assets/geo-features.json");
        })
        .then((r) => { if (!r.ok) throw new Error("素材读取失败"); return r.json(); })
        .then((gf) => {
          GEO_FEATURES = gf;
          render(); // draw rivers/lakes/mountains immediately
          return files.get("template-assets/data.json");
        })
        .then((r) => { if (!r.ok) throw new Error("素材读取失败"); return r.json(); })
        .then((d) => {
          DATA = d;
          cityPoints = DATA.cities.map((c) => ({
            name: c.name,
            value: [c.lon, c.lat],
          }));
          chart2 = echarts.init(document.getElementById("cal"));
          chart2.on("click", (pp) => {
            if (pp.data && pp.data[2] != null) gotoDay(pp.data[2] + 1);
          });
          bind();
          document.getElementById("metricHint").textContent =
            PRESET.livability.hint;
          document.getElementById("modeHint").textContent =
            "按当天所有城市排名归一化（0–100），区分度最高，适合“今天去哪最舒服”。";
          render();
          window.addEventListener("resize", () => {
            chart.resize();
            chart2.resize();
          });
        })
        .catch((e) => {
          document.getElementById("topList").textContent = "加载失败：" + e;
          console.error(e);
        });
    
}
