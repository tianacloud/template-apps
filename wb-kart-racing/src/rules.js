function installRules() {
  (function(global) {
    var KART = global.KART || (global.KART = {});
    var CFG = {
      segLen: 8,
      // 每段赛道长度（米）
      roadHalfWidth: 7,
      // 路面半宽（米）→ 赛道全宽 14 m
      rumbleWidth: 0.8,
      // 路肩宽度（米）
      fov: 100,
      // 相机视场角
      cameraHeight: 2.4,
      // 相机离地高度（米）
      drawDistance: 240,
      // 绘制段数
      laps: 3,
      // 默认圈数
      maxCars: 8,
      // 标准参赛人数
      centrifugal: 0.06,
      // 离心力系数（与真实曲率 κ 配合：dx = v²·κ/halfWidth·C）
      offroadLimit: 1,
      // 超出该归一化横向位置即出界
      offroadReset: 2,
      // 出界多少秒后自动复位
      offroadSpeed: 0.35,
      // 出界时极速系数
      invincibleAfterHit: 2,
      // 受击后无敌时长
      controlWindow: 5,
      // 连环控制判定窗口（秒）
      controlLimit: 2,
      // 窗口内最多被控次数
      resetInvincible: 2,
      // 复位后无敌时长
      startBoostWindow: 0.25,
      // 完美起步判定窗口（GO 后）
      falseStartWindow: 0.3,
      // 抢跑判定窗口（GO 前）
      slipstreamDist: 15,
      // 尾流触发距离（米）
      slipstreamTime: 1.2,
      // 尾流触发需持续时间
      rubberGap: 0.15,
      // 橡皮筋触发：落后进度比例
      catchupGap: 30,
      // 追赶加速触发：落后秒数
      /* 转向线性化：键盘/触屏只给 ±1 数字量，按固定速率斜坡逼近成连续模拟量 */
      steerAttack: 6,
      // 打方向速率（1/秒）→ 0 → 满舵约 0.17 s
      steerRelease: 9,
      // 回正速率（1/秒）→ 满舵 → 0 约 0.11 s
      /* 刹车与刹车漂移 */
      brakeDecel: 20,
      // 直线刹车减速度（m/s²）
      brakeDriftDecel: 7,
      // 刹车漂移时减速度（保住动量，才蓄得出涡轮）
      driftMinSpeed: 11,
      // 进入漂移的最低速度（m/s）
      driftMinSteer: 0.15
      // 进入漂移的最小转向量
    };
    CFG.cameraDepth = 1 / Math.tan(CFG.fov / 2 * Math.PI / 180);
    CFG.playerZOffset = CFG.cameraHeight * CFG.cameraDepth;
    function cornerFactor(handling) {
      return 0.42 + 0.62 * handling;
    }
    var KART_SPECS = [
      {
        id: "bean",
        name: "\u8C46\u8C46\u9F99 Q-Bean",
        tag: "\u5B89\u5168\u5BB9\u9519",
        shape: "round",
        desc: "\u64CD\u63A7\u5929\u82B1\u677F\uFF0C\u649E\u4E86\u4E5F\u4E0D\u98DE\uFF0C\u7B2C\u4E00\u6B21\u73A9\u5C31\u9009\u5B83\u3002\u76F4\u9053\u5403\u4E8F\uFF0C\u5F2F\u9053\u51E0\u4E4E\u4E0D\u6389\u901F\u3002",
        maxSpeed: 35,
        displayMax: 20,
        zeroTo60: 6.8,
        accel: 4.2,
        handling: 0.92,
        stability: 0.96,
        weight: 118,
        colors: { primary: "#FFD23F", secondary: "#FFFFFF", accent: "#FF6FA5", detail: "#45C4FF" }
      },
      {
        id: "nixie",
        name: "\u9713\u7FBD Nixie",
        tag: "\u8D70\u7EBF\u7075\u5DE7",
        shape: "teardrop",
        desc: "\u64CD\u63A7\u4E0E\u901F\u5EA6\u5747\u8861\uFF0C\u7A84\u8DEF\u3001\u5207\u5F2F\u3001\u94BB\u6377\u5F84\u6700\u8212\u670D\u3002",
        maxSpeed: 38.5,
        displayMax: 35.6,
        zeroTo60: 4.2,
        accel: 5.2,
        handling: 0.88,
        stability: 0.78,
        weight: 142,
        colors: { primary: "#F49FB6", secondary: "#FFFFFF", accent: "#C9963F", detail: "#A8E6CF" }
      },
      {
        id: "hammer",
        name: "\u91CD\u9524 Hammer",
        tag: "\u9AD8\u901F\u6297\u538B",
        shape: "wide",
        desc: "236 kg \u7684\u79FB\u52A8\u8DEF\u969C\uFF0C\u649E\u4EBA\u51E0\u4E4E\u4E0D\u6389\u901F\uFF0C\u4F46\u63A8\u5934\u660E\u663E\uFF0C\u5165\u5F2F\u8981\u65E9\u3002",
        maxSpeed: 41,
        displayMax: 43.9,
        zeroTo60: 3.4,
        accel: 6.2,
        handling: 0.56,
        stability: 0.92,
        weight: 236,
        colors: { primary: "#1F2430", secondary: "#4A5262", accent: "#FF6A1F", detail: "#8D95A6" }
      },
      {
        id: "zipray",
        name: "\u75BE\u5F71 Zipray",
        tag: "\u7206\u53D1\u6781\u9650",
        shape: "wedge",
        desc: "\u6781\u901F\u52A0\u901F\u53CC\u9AD8\uFF0C\u7A33\u5B9A\u6700\u4F4E\uFF0C\u51B2\u699C\u9996\u9009\uFF0C\u65B0\u624B\u614E\u9009\u3002",
        maxSpeed: 46.7,
        displayMax: 46.7,
        zeroTo60: 3,
        accel: 7,
        handling: 0.72,
        stability: 0.6,
        weight: 158,
        colors: { primary: "#E8FF47", secondary: "#141821", accent: "#00E5FF", detail: "#FF2D95" }
      }
    ];
    KART_SPECS.forEach(function(s) {
      s.corner = cornerFactor(s.handling);
      s.grip = 7 + 11 * s.handling + 2 * s.stability;
      s.steerRate = 0.7 + 1.6 * s.handling;
      s.topKmh = Math.round(s.displayMax * 3.6);
      s.speedScale = s.displayMax / s.maxSpeed;
    });
    var BOOSTS = {
      start: { mul: 1.35, time: 3 },
      mini: { mul: 1.12, time: 1 },
      strong: { mul: 1.2, time: 1.6 },
      super: { mul: 1.28, time: 2.2 },
      pad: { mul: 1.25, time: 1.5 },
      trick: { mul: 1.1, time: 1 },
      catchup: { mul: 1.15, time: 5 },
      rocket: { mul: 1.3, time: 3 },
      star: { mul: 1.2, time: 8 },
      hook: { mul: 1.25, time: 3 }
    };
    var DRIFT_TIERS = [
      { min: 2.2, boost: "super", label: "\u8D85\u7EA7\u6DA1\u8F6E" },
      { min: 1.4, boost: "strong", label: "\u5F3A\u5316\u6DA1\u8F6E" },
      { min: 0.6, boost: "mini", label: "\u8FF7\u4F60\u6DA1\u8F6E" }
    ];
    var ITEMS = {
      missile: { name: "\u8FFD\u8E2A\u5BFC\u5F39", short: "\u5BFC", color: "#FF4B4B", kind: "attack" },
      banana: { name: "\u9999\u8549\u76AE", short: "\u8549", color: "#FFD23F", kind: "trap" },
      rocket: { name: "\u706B\u7BAD\u51B2\u523A", short: "\u7BAD", color: "#45C4FF", kind: "boost" },
      star: { name: "\u65E0\u654C\u661F", short: "\u661F", color: "#FFE45E", kind: "defense" },
      bolt: { name: "\u95EA\u7535", short: "\u7535", color: "#B56BFF", kind: "attack" },
      ink: { name: "\u58A8\u6C41\u5F39", short: "\u58A8", color: "#2B2F3A", kind: "interrupt" },
      hook: { name: "\u78C1\u529B\u94A9", short: "\u94A9", color: "#00E5FF", kind: "movement" },
      bomb: { name: "\u5DE8\u578B\u70B8\u5F39", short: "\u5F39", color: "#FF6A1F", kind: "attack" }
    };
    var ITEM_WEIGHTS = {
      leading: { missile: 10, banana: 30, rocket: 12, star: 2, bolt: 1, ink: 12, hook: 18, bomb: 15 },
      middle: { missile: 25, banana: 15, rocket: 20, star: 8, bolt: 6, ink: 16, hook: 10, bomb: 20 },
      trailing: { missile: 12, banana: 3, rocket: 18, star: 22, bolt: 20, ink: 10, hook: 8, bomb: 7 }
    };
    var RANK_POINTS = [15, 12, 10, 8, 6, 4, 2, 1];
    var SCORE_BONUS = { finish: 3, fastestLap: 2, clean: 1 };
    var GRADE = [
      { grade: "S", test: function(r) {
        return r.rank === 1 && r.wallHits <= 2;
      } },
      { grade: "A", test: function(r) {
        return r.rank <= 3;
      } },
      { grade: "B", test: function(r) {
        return r.rank <= 6;
      } },
      { grade: "C", test: function() {
        return true;
      } }
    ];
    var AI_NAMES = ["\u963F\u5CA9", "\u5C0F\u6EE1", "\u96F7\u9706", "\u7CD6\u8C46", "\u75BE\u98CE", "\u94C1\u86CB", "\u661F\u91CE", "\u963F\u5F7B", "\u6A59\u5B50", "\u9EA6\u9EA6"];
    KART.CFG = CFG;
    KART.KART_SPECS = KART_SPECS;
    KART.BOOSTS = BOOSTS;
    KART.DRIFT_TIERS = DRIFT_TIERS;
    KART.ITEMS = ITEMS;
    KART.ITEM_WEIGHTS = ITEM_WEIGHTS;
    KART.RANK_POINTS = RANK_POINTS;
    KART.SCORE_BONUS = SCORE_BONUS;
    KART.GRADE = GRADE;
    KART.AI_NAMES = AI_NAMES;
    KART.specById = function(id) {
      for (var i = 0; i < KART_SPECS.length; i++) if (KART_SPECS[i].id === id) return KART_SPECS[i];
      return KART_SPECS[0];
    };
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var STEP = 4;
    var SLOT = 8;
    function wrap(v, len) {
      return (v % len + len) % len;
    }
    var TRACK_STEPS = {
      silverstone: [
        { s: 250 },
        { r: 90, a: -70 },
        // T1 高速右弯
        { s: 80 },
        { r: 28, a: -75, dy: 3 },
        // T2 发夹弯（半径 28 m，重车必减速）
        { s: 60 },
        { r: 42, a: 45 },
        // S 弯（左）
        { r: 42, a: -45 },
        // S 弯（右）
        { s: 200, dy: 12 },
        // 后场长直道（上坡）
        { r: 55, a: -60, dy: -4 },
        // T5 上坡盲弯
        { s: 90, dy: -10 },
        { r: 40, a: -50 },
        // 隧道段
        { s: 60 },
        { r: 110, a: -60, dy: -2 },
        // 看台大弯
        { s: 55 },
        { r: 32, a: -55 },
        // T8 减速弯
        { s: 140 }
      ],
      neon: [
        { s: 200 },
        { r: 55, a: -90 },
        // 中央十字路口
        { s: 50 },
        { r: 35, a: 95 },
        // 巷弄 S 弯
        { r: 35, a: -95 },
        { s: 60, dy: 8 },
        // 天桥坡道
        { r: 45, a: -70, dy: -8 },
        { s: 40 },
        { r: 30, a: 60 },
        { r: 30, a: -60 },
        { s: 90, dy: -6 },
        // 地下停车场
        { r: 40, a: -75 },
        { s: 160 },
        // 河滨长直道
        { r: 60, a: -65 },
        { s: 45 },
        { r: 38, a: 70 },
        { r: 38, a: -70 },
        { s: 70, dy: 6 },
        { r: 75, a: -60, dy: -6 },
        // 高架下坡
        { s: 110 }
      ]
    };
    function integrate(steps, angleScale) {
      var pts = [], x = 0, z = 0, y = 0, heading = 0, s = 0, i, j;
      pts.push({ x, y, z, heading, s: 0 });
      for (i = 0; i < steps.length; i++) {
        var st = steps[i];
        if (st.s != null) {
          var n = Math.max(1, Math.round(st.s / STEP));
          var dy = (st.dy || 0) / n;
          for (j = 0; j < n; j++) {
            x += Math.sin(heading) * STEP;
            z += Math.cos(heading) * STEP;
            y += dy;
            s += STEP;
            pts.push({ x, y, z, heading, s });
          }
        } else {
          var arc = Math.abs(st.a) * Math.PI / 180 * st.r;
          var m = Math.max(3, Math.round(arc / STEP));
          var dAng = st.a * Math.PI / 180 * (angleScale || 1) / m;
          var segLen = arc / m;
          var dy2 = (st.dy || 0) / m;
          for (j = 0; j < m; j++) {
            heading += dAng;
            x += Math.sin(heading) * segLen;
            z += Math.cos(heading) * segLen;
            y += dy2;
            s += segLen;
            pts.push({ x, y, z, heading, s });
          }
        }
      }
      return pts;
    }
    function buildCenterline(steps) {
      var probe = integrate(steps, 1);
      var total = probe[probe.length - 1].heading;
      var target = (total < 0 ? -1 : 1) * Math.PI * 2;
      var angleScale = Math.abs(total) > 0.01 ? target / total : 1;
      var pts = integrate(steps, angleScale);
      var last = pts[pts.length - 1], S = last.s || 1;
      var ex = last.x, ez = last.z, ey = last.y;
      for (var i = 0; i < pts.length; i++) {
        var t = pts[i].s / S;
        pts[i].x -= ex * t;
        pts[i].z -= ez * t;
        pts[i].y -= ey * t;
      }
      var n = pts.length;
      for (i = 0; i < n; i++) {
        var a = pts[(i - 1 + n) % n].heading, b = pts[(i + 1) % n].heading;
        var d = b - a;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        pts[i].kappa = d / (2 * STEP);
      }
      var smooth = new Array(n);
      for (i = 0; i < n; i++) {
        var sum = 0;
        for (var k = -2; k <= 2; k++) sum += pts[(i + k + n) % n].kappa;
        smooth[i] = sum / 5;
      }
      for (i = 0; i < n; i++) pts[i].kappa = smooth[i];
      for (i = 0; i < n; i++) {
        var pn = pts[(i + 1) % n];
        pts[i].slope = (pn.y - pts[i].y) / STEP;
      }
      pts.pop();
      return pts;
    }
    function Track(name, theme, pts, slots) {
      this.name = name;
      this.theme = theme;
      this.points = pts;
      this.slots = slots;
      this.length = pts.length * STEP;
      this.halfWidth = CFG.roadHalfWidth;
      this.checkpoints = [0.25, 0.5, 0.75];
      this.path2d = buildPath2D(pts);
    }
    Track.prototype.indexAt = function(s) {
      return Math.floor(wrap(s, this.length) / STEP) % this.points.length;
    };
    Track.prototype.slotIndexAt = function(s) {
      return Math.floor(wrap(s, this.length) / SLOT) % this.slots.length;
    };
    Track.prototype.slotAt = function(s) {
      return this.slots[this.slotIndexAt(s)];
    };
    Track.prototype.wrap = function(s) {
      return wrap(s, this.length);
    };
    Track.prototype.gap = function(a, b) {
      var d = wrap(a - b, this.length);
      return d > this.length / 2 ? d - this.length : d;
    };
    Track.prototype.sample = function(s) {
      var L = this.length;
      var t = wrap(s, L) / STEP;
      var i = Math.floor(t) % this.points.length;
      var f = t - Math.floor(t);
      var a = this.points[i], b = this.points[(i + 1) % this.points.length];
      var dh = b.heading - a.heading;
      while (dh > Math.PI) dh -= Math.PI * 2;
      while (dh < -Math.PI) dh += Math.PI * 2;
      return {
        x: a.x + (b.x - a.x) * f,
        y: a.y + (b.y - a.y) * f,
        z: a.z + (b.z - a.z) * f,
        heading: a.heading + dh * f,
        kappa: a.kappa + (b.kappa - a.kappa) * f,
        slope: a.slope + (b.slope - a.slope) * f,
        s
      };
    };
    Track.prototype.worldPos = function(s, off, out) {
      var p = this.sample(s);
      var rx = -Math.cos(p.heading), rz = Math.sin(p.heading);
      out = out || {};
      out.x = p.x + rx * off * this.halfWidth;
      out.y = p.y;
      out.z = p.z + rz * off * this.halfWidth;
      out.heading = p.heading;
      out.kappa = p.kappa;
      out.slope = p.slope;
      return out;
    };
    Track.prototype.heightAt = function(s) {
      return this.sample(s).y;
    };
    function buildPath2D(pts) {
      var minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, i;
      for (i = 0; i < pts.length; i++) {
        minX = Math.min(minX, pts[i].x);
        maxX = Math.max(maxX, pts[i].x);
        minZ = Math.min(minZ, pts[i].z);
        maxZ = Math.max(maxZ, pts[i].z);
      }
      var w = Math.max(1, maxX - minX), h = Math.max(1, maxZ - minZ);
      return pts.map(function(p) {
        return { x: (p.x - minX) / w, y: (p.z - minZ) / h };
      });
    }
    function hashRnd(seed) {
      var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    }
    function buildingHeight(seed) {
      var r = hashRnd(seed);
      if (r < 0.24) return 4.5 + hashRnd(seed + 1) * 3.5;
      if (r < 0.62) return 8.5 + hashRnd(seed + 2) * 8.5;
      if (r < 0.9) return 17.5 + hashRnd(seed + 3) * 9.5;
      return 28 + hashRnd(seed + 4) * 12;
    }
    function buildSlots(pts, theme) {
      var L = pts.length * STEP;
      var count = Math.floor(L / SLOT);
      var slots = [];
      for (var i = 0; i < count; i++) {
        slots.push({ index: i, s: i * SLOT, boost: null, jump: 0, itemBoxes: [], tunnel: false, decor: [] });
      }
      var n = slots.length, i2;
      function put(from, to, fn) {
        for (var k2 = from; k2 < to; k2++) fn(slots[(k2 % n + n) % n]);
      }
      if (theme === "city") {
        put(6, 11, function(sl) {
          sl.boost = [0];
        });
        put(Math.round(n * 0.3), Math.round(n * 0.3) + 2, function(sl) {
          sl.jump = 1;
        });
        put(Math.round(n * 0.52), Math.round(n * 0.52) + 4, function(sl) {
          sl.boost = [-0.5, 0.5];
        });
        put(Math.round(n * 0.86), Math.round(n * 0.86) + 4, function(sl) {
          sl.boost = [0];
        });
        put(Math.round(n * 0.56), Math.round(n * 0.62), function(sl) {
          sl.tunnel = true;
        });
        for (i2 = 8; i2 < n; i2 += i2 > n * 0.5 ? 9 : 13) {
          slots[i2].itemBoxes = [{ x: -0.45, respawn: 0 }, { x: 0.45, respawn: 0 }];
        }
        for (i2 = 0; i2 < n; i2 += 2) {
          var k = i2 * 2;
          slots[i2].decor.push({
            type: "building",
            side: -1,
            off: 2.4 + i2 % 3 * 0.5,
            scale: 1,
            w: 2.6 + hashRnd(k + 3) * 3.4,
            dp: 2.4 + hashRnd(k + 5) * 3.2,
            hh: buildingHeight(k + 11),
            rot: (hashRnd(k + 7) - 0.5) * 0.22
          });
          slots[i2].decor.push({
            type: "building",
            side: 1,
            off: 2.3 + (i2 + 1) % 3 * 0.5,
            scale: 1,
            w: 2.6 + hashRnd(k + 131) * 3.4,
            dp: 2.4 + hashRnd(k + 137) * 3.2,
            hh: buildingHeight(k + 139),
            rot: (hashRnd(k + 133) - 0.5) * 0.22
          });
        }
        for (i2 = 3; i2 < n; i2 += 6) {
          var kb = i2 * 3;
          slots[i2].decor.push({
            type: "building",
            side: i2 % 4 < 2 ? -1 : 1,
            off: 4.6 + hashRnd(kb + 2) * 2.2,
            scale: 1,
            w: 3.4 + hashRnd(kb + 8) * 4.6,
            dp: 3.2 + hashRnd(kb + 9) * 4.2,
            hh: 16 + hashRnd(kb + 4) * 22,
            rot: (hashRnd(kb + 10) - 0.5) * 0.3
          });
        }
        for (i2 = 3; i2 < n; i2 += 5) {
          slots[i2].decor.push({ type: "neon", side: i2 % 2 ? 1 : -1, off: 1.6, scale: 1 });
        }
        for (i2 = Math.round(n * 0.4); i2 < Math.round(n * 0.5); i2 += 4) {
          slots[i2].decor.push({ type: "cone", side: 1, off: 1.12, scale: 1 });
        }
      } else {
        put(4, 9, function(sl) {
          sl.boost = [-0.45, 0.45];
        });
        put(Math.round(n * 0.3), Math.round(n * 0.3) + 2, function(sl) {
          sl.jump = 1;
        });
        put(Math.round(n * 0.31), Math.round(n * 0.31) + 4, function(sl) {
          sl.boost = [0];
        });
        put(Math.round(n * 0.58), Math.round(n * 0.66), function(sl) {
          sl.tunnel = true;
        });
        put(Math.round(n * 0.9), Math.round(n * 0.9) + 4, function(sl) {
          sl.boost = [-0.4, 0.4];
        });
        for (i2 = 10; i2 < n; i2 += i2 > n * 0.5 ? 10 : 14) {
          slots[i2].itemBoxes = [{ x: -0.5, respawn: 0 }, { x: 0.5, respawn: 0 }];
        }
        for (i2 = 0; i2 < n; i2 += 2) {
          slots[i2].decor.push({ type: "tree", side: -1, off: 1.9 + i2 % 4 * 0.35, scale: 0.8 + i2 % 5 * 0.18 });
          slots[i2].decor.push({
            type: i2 % 7 === 0 ? "tirewall" : "tree",
            side: 1,
            off: 1.85 + (i2 + 2) % 4 * 0.35,
            scale: 0.75 + (i2 + 1) % 5 * 0.2
          });
        }
        for (i2 = Math.round(n * 0.7); i2 < Math.round(n * 0.86); i2 += 3) {
          slots[i2].decor.push({ type: "grandstand", side: -1, off: 2.9, scale: 1 });
        }
      }
      return slots;
    }
    KART.buildTrack = function(id) {
      var def = TRACK_STEPS[id] ? id : "silverstone";
      var theme = def === "neon" ? "city" : "circuit";
      var pts = buildCenterline(TRACK_STEPS[def]);
      var slots = buildSlots(pts, theme);
      var name = def === "neon" ? "\u661F\u6E2F\u57CE\u9713\u8679\u73AF\u7EBF" : "\u94F6\u77F3\u6E7E\u56FD\u9645\u8D5B\u9053";
      return new Track(name, theme, pts, slots);
    };
    KART.TRACK_STEPS = TRACK_STEPS;
    KART.TRACK_LIST = [
      { id: "silverstone", name: "\u94F6\u77F3\u6E7E\u56FD\u9645\u8D5B\u9053", theme: "circuit", difficulty: 2, desc: "\u5BBD\u9614\u9AD8\u901F\uFF0C\u8003\u9A8C\u8D70\u7EBF\u4E0E\u6F02\u79FB\u84C4\u529B" },
      { id: "neon", name: "\u661F\u6E2F\u57CE\u9713\u8679\u73AF\u7EBF", theme: "city", difficulty: 4, desc: "\u7A84\u8DEF\u6025\u5F2F\uFF0C\u8003\u9A8C\u53CD\u5E94\u4E0E\u63A7\u8F66" }
    ];
    KART.Track = Track;
    KART.TRACK_CONST = { STEP, SLOT };
    KART.util = { wrap };
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var BOOSTS = KART.BOOSTS;
    var DRIFT_TIERS = KART.DRIFT_TIERS;
    function clamp(v, a, b) {
      return v < a ? a : v > b ? b : v;
    }
    function kmh(v) {
      return v * 3.6;
    }
    function dispKmh(car) {
      return car.speed * 3.6 * (car.spec.speedScale || 1);
    }
    function createCar(spec, opts) {
      opts = opts || {};
      return {
        id: opts.id || spec.id,
        name: opts.name || spec.name,
        spec,
        isPlayer: !!opts.isPlayer,
        grid: opts.grid || 0,
        z: -(opts.grid || 0) * 5,
        // 沿赛道距离（发车格在起点线后方错开）
        x: opts.x || 0,
        speed: 0,
        lap: 0,
        cpIndex: 0,
        finished: false,
        finishTime: 0,
        rank: 1,
        progress: 0,
        lapTimes: [],
        lastLapAt: 0,
        bestLap: 0,
        drifting: false,
        driftTime: 0,
        driftDir: 0,
        driftVisual: 0,
        steerInput: 0,
        // 线性化后的连续转向输入（-1 ~ 1）
        brakeDrift: false,
        // 当前是否由刹车触发的漂移
        steerVisual: 0,
        boosts: [],
        lastSlotIdx: -1,
        offroad: false,
        offroadTime: 0,
        airTime: 0,
        jumpY: 0,
        jumpTotal: 1,
        jumpPeak: 0,
        slipTimer: 0,
        slipstream: false,
        rubber: 1,
        catchupCd: 0,
        spinTimer: 0,
        stunTimer: 0,
        shrinkTimer: 0,
        slowTimer: 0,
        inkTimer: 0,
        invincible: 0,
        controlLog: [],
        collideCd: 0,
        item: null,
        itemRoll: 0,
        itemCooldown: 0,
        hook: null,
        starHitCd: 0,
        wallHits: 0,
        hitCount: 0,
        driftBoosts: 0,
        padsHit: 0,
        braking: false,
        events: []
      };
    }
    function addBoost(car, kind) {
      var def = BOOSTS[kind];
      if (!def) return;
      for (var i = 0; i < car.boosts.length; i++) {
        if (car.boosts[i].kind === kind) {
          car.boosts[i].time = Math.max(car.boosts[i].time, def.time);
          car.boosts[i].mul = def.mul;
          return;
        }
      }
      car.boosts.push({ kind, mul: def.mul, time: def.time, total: def.time });
    }
    function activeBoost(car) {
      var mul = 1;
      for (var i = 0; i < car.boosts.length; i++) mul = Math.max(mul, car.boosts[i].mul);
      return mul;
    }
    function tickBoosts(car, dt) {
      for (var i = car.boosts.length - 1; i >= 0; i--) {
        car.boosts[i].time -= dt;
        if (car.boosts[i].time <= 0) car.boosts.splice(i, 1);
      }
    }
    var CONTROL_EFFECTS = { spin: 1, stun: 1, bomb: 1 };
    function applyHit(car, effect, ctx) {
      if (car.finished) return false;
      if (car.invincible > 0) return false;
      var now = ctx && ctx.time || 0;
      car.controlLog = car.controlLog.filter(function(t) {
        return now - t <= CFG.controlWindow;
      });
      if (CONTROL_EFFECTS[effect] && car.controlLog.length >= CFG.controlLimit) return false;
      switch (effect) {
        case "spin":
          car.spinTimer = 1.5;
          car.speed *= 0.3;
          break;
        case "stun":
          car.stunTimer = 1.2;
          break;
        case "shrink":
          if (car.shrinkTimer > 0) return false;
          car.shrinkTimer = 8;
          break;
        case "slow":
          car.slowTimer = Math.max(car.slowTimer, 3);
          break;
        case "ink":
          car.inkTimer = 5;
          car.slowTimer = Math.max(car.slowTimer, 2);
          break;
        case "bomb":
          car.spinTimer = 1.5;
          car.speed *= 0.35;
          car.slowTimer = Math.max(car.slowTimer, 3);
          break;
        default:
          return false;
      }
      car.driftTime = 0;
      car.drifting = false;
      car.hitCount++;
      car.controlLog.push(now);
      if (CONTROL_EFFECTS[effect] || effect === "ink") car.invincible = CFG.invincibleAfterHit;
      if (car.events) car.events.push({ text: "\u88AB\u51FB\u4E2D\uFF01", t: 0, color: "#FF4B4B" });
      return true;
    }
    function rampSteer(cur, target, dt) {
      var diff = target - cur;
      if (Math.abs(diff) < 1e-4) return target;
      var rate = Math.abs(target) > Math.abs(cur) ? CFG.steerAttack : CFG.steerRelease;
      var step = rate * dt;
      if (Math.abs(diff) <= step) return target;
      return cur + (diff > 0 ? step : -step);
    }
    function updateCar(car, dt, input, ctx) {
      var track = ctx.track, spec = car.spec, i;
      input = input || {};
      ctx.time = ctx.time || 0;
      tickBoosts(car, dt);
      car.invincible = Math.max(0, car.invincible - dt);
      car.spinTimer = Math.max(0, car.spinTimer - dt);
      car.stunTimer = Math.max(0, car.stunTimer - dt);
      car.shrinkTimer = Math.max(0, car.shrinkTimer - dt);
      car.slowTimer = Math.max(0, car.slowTimer - dt);
      car.inkTimer = Math.max(0, car.inkTimer - dt);
      car.itemCooldown = Math.max(0, car.itemCooldown - dt);
      car.catchupCd = Math.max(0, car.catchupCd - dt);
      car.starHitCd = Math.max(0, car.starHitCd - dt);
      car.collideCd = Math.max(0, car.collideCd - dt);
      if (car.finished) {
        coastAfterFinish(car, dt, track);
        return;
      }
      var locked = car.spinTimer > 0 || car.stunTimer > 0;
      var p = track.sample(car.z);
      var speedPct = clamp(car.speed / spec.maxSpeed, 0, 1.4);
      var steerTarget = locked || car.airTime > 0 || car.hook ? 0 : clamp(input.steer || 0, -1, 1);
      car.steerInput = rampSteer(car.steerInput || 0, steerTarget, dt);
      var steer = car.steerInput;
      var target = spec.maxSpeed * activeBoost(car);
      var kappa = Math.abs(p.kappa);
      var vCorner = Math.sqrt(spec.grip / Math.max(6e-4, kappa));
      var cornerLimit = Math.min(spec.maxSpeed, vCorner);
      if (car.shrinkTimer > 0) target *= 0.6;
      if (car.slowTimer > 0) target *= 0.65;
      if (car.inkTimer > 0 && !car.isPlayer) target *= 0.8;
      target *= car.rubber;
      if (car.speedCap) target = Math.min(target, car.speedCap);
      if (car.slipstream) target *= car.rubber > 1.001 ? 1.12 : 1.08;
      if (p.slope > 0) target *= clamp(1 - p.slope * 0.55, 0.82, 1);
      else target *= clamp(1 - p.slope * 0.25, 1, 1.08);
      if (car.offroad) target *= CFG.offroadSpeed;
      if (!locked) {
        if (input.brake) {
          var brakeDriftNow = !car.offroad && car.speed >= CFG.driftMinSpeed && Math.abs(car.steerInput) > CFG.driftMinSteer;
          car.speed -= (brakeDriftNow ? CFG.brakeDriftDecel : CFG.brakeDecel) * dt;
          if (car.speed < -6) car.speed = -6;
        } else if (input.throttle) {
          if (car.speed < target) {
            var a = spec.accel * (1 - 0.55 * (car.speed / Math.max(1, target)));
            car.speed = Math.min(target, car.speed + Math.max(0.6, a) * dt);
          } else {
            car.speed = Math.max(target, car.speed - (car.speed - target) * 1.4 * dt - 1.2 * dt);
          }
        } else {
          car.speed = Math.max(0, car.speed - 6 * dt);
        }
      } else {
        car.speed = Math.max(0, car.speed - 12 * dt);
        if (car.spinTimer > 0) car.x += Math.sin(ctx.time * 18) * 0.6 * dt;
      }
      if (car.speed < 0 && !input.brake) car.speed = 0;
      car.braking = !!input.brake && !locked;
      if (!car.offroad && car.speed > cornerLimit) {
        car.speed -= (car.speed - cornerLimit) * (car.drifting ? 0.9 : 2.4) * dt;
      }
      if (car.hook) {
        car.hook.time -= dt;
        var d = track.gap(car.hook.target.z + 3, car.z);
        car.z += clamp(d, -60 * dt, 90 * dt);
        car.x += (car.hook.target.x - car.x) * 2.5 * dt;
        if (car.hook.time <= 0) {
          addBoost(car, "hook");
          car.hook = null;
          car.events.push({ text: "\u78C1\u529B\u94A9\u8D85\u8D8A\uFF01", t: 0, color: "#00E5FF" });
        }
      }
      car.brakeDrift = false;
      if (!locked && car.airTime <= 0 && !car.hook) {
        var rate = spec.steerRate * (0.35 + 0.65 * Math.min(1, speedPct));
        if (car.drifting) rate *= 1.7;
        if (car.shrinkTimer > 0) rate *= 0.85;
        car.x += steer * rate * dt;
        var canDrift = car.speed >= CFG.driftMinSpeed && Math.abs(steer) > CFG.driftMinSteer;
        var wantDrift = canDrift && (!!input.drift || !!input.brake && !car.offroad);
        if (wantDrift) {
          if (!car.drifting) {
            car.drifting = true;
            car.driftTime = 0;
            car.driftDir = steer > 0 ? 1 : -1;
          } else car.driftTime += dt;
          car.driftVisual += (car.driftDir * 0.9 - car.driftVisual) * 6 * dt;
        } else if (car.drifting) {
          releaseDrift(car, ctx);
        }
        if (!wantDrift) car.driftVisual += (0 - car.driftVisual) * 8 * dt;
        car.brakeDrift = car.drifting && !!input.brake;
        var cf = car.speed * car.speed * p.kappa / CFG.roadHalfWidth * CFG.centrifugal;
        car.x += cf * dt * (car.drifting ? 0.5 : 1) * (1 + (1 - spec.stability) * 0.35);
      }
      var targetSteer = locked || car.airTime > 0 ? 0 : car.steerInput;
      car.steerVisual += (targetSteer - car.steerVisual) * Math.min(1, 10 * dt);
      if (car.airTime > 0) {
        car.airTime -= dt;
        car.jumpY = Math.max(0, Math.sin((1 - car.airTime / car.jumpTotal) * Math.PI) * car.jumpPeak);
        if (car.airTime <= 0) {
          car.jumpY = 0;
          addBoost(car, "trick");
          car.events.push({ text: "\u7279\u6280\u843D\u5730\u52A0\u901F\uFF01", t: 0, color: "#A8E6CF" });
        }
      }
      var absX = Math.abs(car.x);
      if (absX > CFG.offroadLimit) {
        if (!car.offroad) {
          car.offroad = true;
          car.wallHits++;
          car.drifting = false;
          car.driftTime = 0;
          car.speed *= 0.6;
          car.events.push({ text: "\u51B2\u51FA\u8D5B\u9053\uFF01", t: 0, color: "#FF6A1F" });
        }
        car.offroadTime += dt;
        car.x = clamp(car.x, -1.45, 1.45);
        if (car.airTime <= 0) car.speed = Math.min(car.speed, spec.maxSpeed * CFG.offroadSpeed);
        if (car.offroadTime >= CFG.offroadReset || absX > 1.45) resetToTrack(car, ctx);
      } else if (car.offroad) {
        car.offroad = false;
        car.offroadTime = 0;
      }
      if (!car.hook) car.z += car.speed * dt;
      var slotIdx = track.slotIndexAt(car.z);
      if (slotIdx !== car.lastSlotIdx) {
        car.lastSlotIdx = slotIdx;
        onEnterSlot(car, track.slots[slotIdx], ctx);
      }
      var L = track.length;
      var pct = (car.z % L + L) % L / L;
      if (car.cpIndex < track.checkpoints.length && pct >= track.checkpoints[car.cpIndex]) car.cpIndex++;
      while (car.z >= L) {
        car.z -= L;
        if (car.cpIndex >= track.checkpoints.length) {
          var t = ctx.time - car.lastLapAt;
          car.lapTimes.push(t);
          if (!car.bestLap || t < car.bestLap) car.bestLap = t;
          car.lastLapAt = ctx.time;
          car.lap++;
          car.cpIndex = 0;
          if (car.lap >= (ctx.totalLaps || CFG.laps)) {
            car.finished = true;
            car.finishTime = ctx.time;
          }
        }
      }
      car.progress = car.lap * L + car.z;
      updateSlipstream(car, ctx, dt);
      updateRubber(car, ctx, dt);
      for (i = car.events.length - 1; i >= 0; i--) {
        car.events[i].t += dt;
        if (car.events[i].t > 1.6) car.events.splice(i, 1);
      }
    }
    function releaseDrift(car, ctx) {
      car.drifting = false;
      var tier = null;
      for (var i = 0; i < DRIFT_TIERS.length; i++) {
        if (car.driftTime >= DRIFT_TIERS[i].min) {
          tier = DRIFT_TIERS[i];
          break;
        }
      }
      car.driftTime = 0;
      if (!tier) return;
      addBoost(car, tier.boost);
      car.driftBoosts++;
      car.events.push({
        text: tier.label + "\uFF01",
        t: 0,
        color: tier.boost === "super" ? "#B56BFF" : tier.boost === "strong" ? "#FF6A1F" : "#45C4FF"
      });
    }
    function onEnterSlot(car, slot, ctx) {
      var i;
      if (slot.boost && car.airTime <= 0) {
        for (i = 0; i < slot.boost.length; i++) {
          if (Math.abs(car.x - slot.boost[i]) < 0.28) {
            addBoost(car, "pad");
            car.padsHit++;
            car.events.push({ text: "\u52A0\u901F\u5E26\uFF01", t: 0, color: "#45C4FF" });
            break;
          }
        }
      }
      if (slot.jump && car.speed > car.spec.maxSpeed * 0.45) {
        car.airTime = 0.55 + 0.35 * Math.min(1, car.speed / car.spec.maxSpeed);
        car.jumpTotal = car.airTime;
        car.jumpPeak = 1.6 + 2.2 * Math.min(1, car.speed / car.spec.maxSpeed);
      }
      if (ctx.itemsEnabled && slot.itemBoxes && slot.itemBoxes.length && car.item === null && car.itemCooldown <= 0) {
        for (i = 0; i < slot.itemBoxes.length; i++) {
          var box = slot.itemBoxes[i];
          if (box.respawn > 0) continue;
          if (Math.abs(car.x - box.x) < 0.3) {
            box.respawn = 3;
            car.item = KART.rollItem(car.rank, ctx.totalCars || CFG.maxCars);
            car.itemRoll = 0.6;
            break;
          }
        }
      }
    }
    function updateSlipstream(car, ctx, dt) {
      var track = ctx.track, best = null, bestGap = CFG.slipstreamDist;
      for (var i = 0; i < ctx.cars.length; i++) {
        var o = ctx.cars[i];
        if (o === car) continue;
        var g = track.gap(o.z, car.z);
        if (g > 0 && g < bestGap && Math.abs(o.x - car.x) < 0.4) {
          var diff = Math.abs(o.speed - car.speed) / Math.max(1, o.speed);
          if (diff < 0.1) {
            best = o;
            bestGap = g;
          }
        }
      }
      if (best) car.slipTimer = Math.min(CFG.slipstreamTime + 1, car.slipTimer + dt);
      else car.slipTimer = Math.max(0, car.slipTimer - dt * 2);
      car.slipstream = car.slipTimer >= CFG.slipstreamTime;
    }
    function updateRubber(car, ctx, dt) {
      var leader = ctx.leaderProgress || 0;
      var L = ctx.track.length;
      var gapPct = (leader - car.progress) / L;
      if (gapPct > CFG.rubberGap) {
        car.rubber = Math.min(1.1, 1.06 + Math.floor((gapPct - CFG.rubberGap) / 0.05) * 0.01);
      } else car.rubber = 1;
      var seconds = (leader - car.progress) / Math.max(10, car.spec.maxSpeed * 0.7);
      if (seconds > CFG.catchupGap && car.catchupCd <= 0) {
        addBoost(car, "catchup");
        car.catchupCd = 20;
        car.events.push({ text: "\u8FFD\u8D76\u52A0\u901F\uFF01", t: 0, color: "#FFD23F" });
      }
    }
    function resetToTrack(car, ctx) {
      car.x = clamp(car.x, -0.6, 0.6);
      car.offroad = false;
      car.offroadTime = 0;
      car.speed = car.spec.maxSpeed * 0.5;
      car.invincible = Math.max(car.invincible, CFG.resetInvincible);
      car.drifting = false;
      car.driftTime = 0;
      car.events.push({ text: "\u5DF2\u590D\u4F4D", t: 0, color: "#FFFFFF" });
    }
    function coastAfterFinish(car, dt, track) {
      car.speed = Math.max(0, car.speed - 8 * dt);
      car.z += car.speed * dt;
      car.progress = car.lap * track.length + car.z;
    }
    function resolveCollisions(cars, track, ctx) {
      for (var i = 0; i < cars.length; i++) {
        for (var j = i + 1; j < cars.length; j++) {
          var a = cars[i], b = cars[j];
          if (a.finished || b.finished) continue;
          if (a.collideCd > 0 || b.collideCd > 0) continue;
          var dz = track.gap(a.z, b.z);
          if (Math.abs(dz) > 4.2) continue;
          var dx = b.x - a.x;
          if (Math.abs(dx) > 0.3) continue;
          var ma = a.spec.weight, mb = b.spec.weight;
          var rel = Math.abs(a.speed - b.speed);
          var k = 0.02 * rel / CFG.roadHalfWidth;
          var pushA = mb / (ma + mb) * k, pushB = ma / (ma + mb) * k;
          var sign = dx >= 0 ? 1 : -1;
          var aPower = a.invincible > 0 && hasPowerBoost(a);
          var bPower = b.invincible > 0 && hasPowerBoost(b);
          a.collideCd = b.collideCd = 0.35;
          a.x -= sign * pushA;
          b.x += sign * pushB;
          if (!aPower) a.speed *= ma >= mb ? 0.92 : 0.87;
          if (!bPower) b.speed *= mb >= ma ? 0.92 : 0.87;
          if (aPower && !bPower && a.starHitCd <= 0) {
            applyHit(b, "spin", ctx);
            a.starHitCd = 1;
          }
          if (bPower && !aPower && b.starHitCd <= 0) {
            applyHit(a, "spin", ctx);
            b.starHitCd = 1;
          }
          if (b.shrinkTimer > 0 && !aPower && ma > mb * 1.3) {
            applyHit(b, "spin", ctx);
            a.speed *= 0.95;
          }
          if (a.shrinkTimer > 0 && !bPower && mb > ma * 1.3) {
            applyHit(a, "spin", ctx);
            b.speed *= 0.95;
          }
          if (!a.drifting) a.driftTime = 0;
          if (!b.drifting) b.driftTime = 0;
        }
      }
    }
    function hasPowerBoost(car) {
      for (var i = 0; i < car.boosts.length; i++) {
        if (car.boosts[i].kind === "star" || car.boosts[i].kind === "rocket") return true;
      }
      return false;
    }
    function updateRanks(cars) {
      var sorted = cars.slice().sort(function(a, b) {
        if (a.finished !== b.finished) return a.finished ? -1 : 1;
        if (a.finished && b.finished) return a.finishTime - b.finishTime;
        return b.progress - a.progress;
      });
      for (var i = 0; i < sorted.length; i++) sorted[i].rank = i + 1;
      return sorted;
    }
    function formatTime(t) {
      if (t == null || !isFinite(t)) return "--:--.---";
      var m = Math.floor(t / 60), s = Math.floor(t % 60), ms = Math.floor(t * 1e3 % 1e3);
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "." + ("00" + ms).slice(-3);
    }
    KART.physics = {
      createCar,
      updateCar,
      addBoost,
      activeBoost,
      applyHit,
      resolveCollisions,
      updateRanks,
      resetToTrack,
      releaseDrift,
      formatTime,
      kmh,
      dispKmh,
      clamp
    };
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var ITEMS = KART.ITEMS;
    var W = KART.ITEM_WEIGHTS;
    var P = KART.physics;
    function groupOf(rank) {
      if (rank <= 2) return W.leading;
      if (rank <= 5) return W.middle;
      return W.trailing;
    }
    function rollItem(rank, total) {
      var table = groupOf(rank || 4);
      var keys = Object.keys(table), sum = 0, i;
      for (i = 0; i < keys.length; i++) sum += table[keys[i]];
      var r = Math.random() * sum;
      for (i = 0; i < keys.length; i++) {
        r -= table[keys[i]];
        if (r <= 0) return keys[i];
      }
      return keys[0];
    }
    function nearestAhead(car, ctx) {
      var best = null, bestGap = Infinity;
      for (var i = 0; i < ctx.cars.length; i++) {
        var o = ctx.cars[i];
        if (o === car || o.finished) continue;
        var g = ctx.track.gap(o.z, car.z);
        if (g > 0 && g < bestGap) {
          bestGap = g;
          best = o;
        }
      }
      return best;
    }
    function useItem(car, ctx) {
      var id = car.item;
      if (!id) return;
      car.item = null;
      car.itemCooldown = 0.4;
      var t, i;
      switch (id) {
        case "missile": {
          t = nearestAhead(car, ctx);
          ctx.projectiles.push({
            kind: "missile",
            owner: car,
            target: t,
            z: car.z + 4,
            x: car.x,
            speed: Math.max(car.speed + 12, 40),
            life: 2.5
          });
          car.events.push({ text: "\u5BFC\u5F39\u53D1\u5C04\uFF01", t: 0, color: "#FF4B4B" });
          break;
        }
        case "banana": {
          ctx.bananas.push({ z: car.z - 6, x: car.x, life: 30, owner: car });
          break;
        }
        case "rocket": {
          P.addBoost(car, "rocket");
          car.invincible = Math.max(car.invincible, 3);
          car.events.push({ text: "\u706B\u7BAD\u51B2\u523A\uFF01", t: 0, color: "#45C4FF" });
          break;
        }
        case "star": {
          P.addBoost(car, "star");
          car.invincible = Math.max(car.invincible, 8);
          car.events.push({ text: "\u65E0\u654C\u661F\uFF01", t: 0, color: "#FFE45E" });
          break;
        }
        case "bolt": {
          var targets = ctx.cars.filter(function(o) {
            return o !== car && !o.finished && o.rank < car.rank;
          });
          if (targets.length === 0) {
            var back = null, bg = Infinity;
            ctx.cars.forEach(function(o) {
              if (o === car || o.finished) return;
              var g = ctx.track.gap(car.z, o.z);
              if (g > 0 && g < bg) {
                bg = g;
                back = o;
              }
            });
            if (back) targets = [back];
          }
          targets.forEach(function(o) {
            P.applyHit(o, "shrink", ctx);
          });
          car.events.push({ text: "\u95EA\u7535\uFF01", t: 0, color: "#B56BFF" });
          break;
        }
        case "ink": {
          ctx.cars.forEach(function(o) {
            if (o !== car && !o.finished && o.rank < car.rank) P.applyHit(o, "ink", ctx);
          });
          car.events.push({ text: "\u58A8\u6C41\u5F39\uFF01", t: 0, color: "#8D95A6" });
          break;
        }
        case "hook": {
          t = nearestAhead(car, ctx);
          if (t) {
            car.hook = { target: t, time: 1.5 };
            car.events.push({ text: "\u78C1\u529B\u94A9\uFF01", t: 0, color: "#00E5FF" });
          } else {
            P.addBoost(car, "hook");
          }
          break;
        }
        case "bomb": {
          ctx.bombs.push({ z: car.z + 30, x: car.x, fuse: 3, owner: car });
          car.events.push({ text: "\u5DE8\u578B\u70B8\u5F39\uFF01", t: 0, color: "#FF6A1F" });
          break;
        }
      }
      if (ctx.onItemUsed) ctx.onItemUsed(car, id);
    }
    function updateItems(ctx, dt) {
      var i, j, o;
      for (i = ctx.projectiles.length - 1; i >= 0; i--) {
        var p = ctx.projectiles[i];
        p.life -= dt;
        p.z += p.speed * dt;
        if (p.target && !p.target.finished) {
          var g = ctx.track.gap(p.target.z, p.z);
          if (g > 0) {
            p.x += (p.target.x - p.x) * Math.min(1, 4 * dt);
            if (g < 6 && Math.abs(p.x - p.target.x) < 0.55) {
              P.applyHit(p.target, "spin", ctx);
              ctx.projectiles.splice(i, 1);
              continue;
            }
          }
        }
        if (p.life <= 0) ctx.projectiles.splice(i, 1);
      }
      for (i = ctx.bananas.length - 1; i >= 0; i--) {
        var b = ctx.bananas[i];
        b.life -= dt;
        if (b.life <= 0) {
          ctx.bananas.splice(i, 1);
          continue;
        }
        for (j = 0; j < ctx.cars.length; j++) {
          o = ctx.cars[j];
          if (o.finished || o === b.owner && b.life > 29.5) continue;
          if (Math.abs(ctx.track.gap(o.z, b.z)) < 4 && Math.abs(o.x - b.x) < 0.3 && o.airTime <= 0) {
            if (P.applyHit(o, "spin", ctx)) {
              ctx.bananas.splice(i, 1);
              break;
            }
          }
        }
      }
      for (i = ctx.bombs.length - 1; i >= 0; i--) {
        var bo = ctx.bombs[i];
        bo.fuse -= dt;
        if (bo.fuse > 0) continue;
        for (j = 0; j < ctx.cars.length; j++) {
          o = ctx.cars[j];
          if (o.finished) continue;
          if (Math.abs(ctx.track.gap(o.z, bo.z)) < 12) P.applyHit(o, "bomb", ctx);
        }
        ctx.explosions.push({ z: bo.z, x: bo.x, t: 0 });
        ctx.bombs.splice(i, 1);
      }
      for (i = ctx.explosions.length - 1; i >= 0; i--) {
        ctx.explosions[i].t += dt;
        if (ctx.explosions[i].t > 0.8) ctx.explosions.splice(i, 1);
      }
      var slots = ctx.track.slots;
      for (i = 0; i < slots.length; i++) {
        var boxes = slots[i].itemBoxes;
        if (!boxes || !boxes.length) continue;
        for (j = 0; j < boxes.length; j++) {
          if (boxes[j].respawn > 0) boxes[j].respawn = Math.max(0, boxes[j].respawn - dt);
        }
      }
    }
    KART.rollItem = rollItem;
    KART.items = { useItem, updateItems, nearestAhead, groupOf };
    KART.ITEMS = ITEMS;
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var P = KART.physics;
    var clamp = P.clamp;
    var CURVE_SCALE = 110;
    function initAI(car, level) {
      car.aiSkill = level == null ? 0.9 : level;
      car.aiCap = car.spec.maxSpeed * (0.82 + 0.18 * car.aiSkill);
      car.speedCap = car.aiCap;
      car.aiWobble = Math.random() * Math.PI * 2;
      car.itemThink = 0.6 + Math.random() * 1.6;
      car.aiDriftHold = 0;
      return car;
    }
    function aiInput(car, ctx) {
      var track = ctx.track, spec = car.spec;
      var look = 16 + car.speed * 0.85;
      var pAhead = track.sample(car.z + look);
      var pNow = track.sample(car.z + 5);
      var curve = pAhead.kappa * CURVE_SCALE;
      var targetX = 0;
      if (curve > 0.4) targetX = -0.4;
      else if (curve < -0.4) targetX = 0.4;
      car.aiWobble += 0.01;
      targetX += Math.sin(car.aiWobble) * 0.1;
      var i, o, g;
      for (i = 0; i < ctx.cars.length; i++) {
        o = ctx.cars[i];
        if (o === car) continue;
        g = track.gap(o.z, car.z);
        if (g > 0 && g < 14 && Math.abs(o.x - car.x) < 0.34) targetX += car.x >= o.x ? 0.45 : -0.45;
      }
      for (i = 0; i < ctx.bananas.length; i++) {
        g = track.gap(ctx.bananas[i].z, car.z);
        if (g > 0 && g < 18 && Math.abs(ctx.bananas[i].x - car.x) < 0.3) {
          targetX += car.x >= ctx.bananas[i].x ? 0.5 : -0.5;
        }
      }
      targetX = clamp(targetX, -0.78, 0.78);
      var steer = clamp((targetX - car.x) * 2.4, -1, 1);
      var vCorner = Math.sqrt(spec.grip / Math.max(6e-4, Math.abs(pAhead.kappa)));
      var brake = car.speed > vCorner * 1.12 && Math.abs(curve) > 1.2;
      var wantDrift = Math.abs(pNow.kappa) > 0.01 && car.speed > spec.maxSpeed * 0.45 && Math.abs(steer) > 0.2;
      if (wantDrift) car.aiDriftHold = 0.35;
      else car.aiDriftHold = Math.max(0, car.aiDriftHold - 0.05);
      var throttle = true;
      if (brake) throttle = false;
      if (car.speed > car.aiCap * 1.02 && !brake) throttle = car.speed < car.aiCap * 1.15;
      return { steer, throttle, brake, drift: car.aiDriftHold > 0, useItem: false };
    }
    function aiUseItem(car, ctx) {
      if (!car.item || car.itemCooldown > 0) return false;
      car.itemThink -= ctx.dt || 0.016;
      if (car.itemThink > 0) return false;
      var track = ctx.track;
      var id = car.item;
      var ahead = KART.items.nearestAhead(car, ctx);
      var gapAhead = ahead ? track.gap(ahead.z, car.z) : Infinity;
      var straight = Math.abs(track.sample(car.z + 25).kappa) < 0.014;
      var use = false;
      switch (id) {
        case "missile":
          use = !!ahead && gapAhead < 90 && straight;
          break;
        case "banana": {
          var chased = ctx.cars.some(function(o) {
            if (o === car || o.finished) return false;
            var g = track.gap(car.z, o.z);
            return g > 0 && g < 30;
          });
          use = chased || Math.random() < 0.4;
          break;
        }
        case "rocket":
          use = straight;
          break;
        case "star":
          use = car.rank >= 4 || car.lap >= (ctx.totalLaps || 3) - 1;
          break;
        case "bolt":
          use = car.rank >= 4;
          break;
        case "ink":
          use = car.rank >= 3;
          break;
        case "hook":
          use = !!ahead && gapAhead < 45;
          break;
        case "bomb":
          use = !!ahead && gapAhead < 60;
          break;
      }
      if (use) car.itemThink = 0.8 + Math.random() * 2;
      return use;
    }
    KART.ai = { initAI, aiInput, aiUseItem };
  })(typeof window !== "undefined" ? window : globalThis);
  (function(global) {
    var KART = global.KART;
    var CFG = KART.CFG;
    var P = KART.physics;
    var AI = KART.ai;
    function createRace(opts) {
      opts = opts || {};
      var track = KART.buildTrack(opts.trackId || "silverstone");
      var mode = opts.mode || "race";
      var cars = [];
      var playerSpec = KART.specById(opts.kartId || "nixie");
      var slot = opts.playerSlot == null ? 4 : opts.playerSlot;
      var gridOrder = [7, 5, 3, 1, 0, 2, 4, 6];
      var player = P.createCar(playerSpec, {
        name: opts.playerName || "\u4F60",
        isPlayer: true,
        grid: gridOrder[slot],
        id: "player"
      });
      for (var i = 0; i < CFG.maxCars; i++) {
        if (i === slot) {
          cars.push(player);
          continue;
        }
        var spec = KART.KART_SPECS[(i + 1) % KART.KART_SPECS.length];
        var c = P.createCar(spec, {
          name: KART.AI_NAMES[i % KART.AI_NAMES.length],
          grid: gridOrder[i],
          id: "ai" + i
        });
        AI.initAI(c, opts.aiLevel == null ? 0.88 : opts.aiLevel + (Math.random() * 0.1 - 0.05));
        cars.push(c);
      }
      cars.forEach(function(c2, i2) {
        c2.x = i2 % 2 === 0 ? -0.45 : 0.45;
      });
      return {
        track,
        cars,
        player,
        mode,
        itemsEnabled: mode === "item",
        totalLaps: opts.laps || CFG.laps,
        time: 0,
        countdown: 3,
        goFlash: 0,
        leaderProgress: 0,
        projectiles: [],
        bananas: [],
        bombs: [],
        explosions: [],
        endTimer: -1,
        state: "countdown",
        results: null,
        onEvent: opts.onEvent || function() {
        },
        fastestLap: 0,
        fastestCar: null
      };
    }
    function stepRace(race, dt, playerInput) {
      if (race.state === "finished" || race.state === "finishing") return;
      if (race.countdown > 0) {
        race.countdown -= dt;
        if (race.countdown > 0) return;
        race.countdown = 0;
        race.state = "racing";
      }
      advance(race, dt, playerInput);
      var allFinished = race.cars.every(function(x) {
        return x.finished;
      });
      if (allFinished) {
        finishRace(race);
        return;
      }
      var leaderDone = race.cars.some(function(x) {
        return x.finished;
      });
      if (leaderDone && race.endTimer < 0) race.endTimer = 60;
      if (race.player.finished && race.endTimer > 6) race.endTimer = 6;
      if (race.endTimer > 0) {
        race.endTimer -= dt;
        if (race.endTimer <= 0) finishRace(race);
      }
    }
    function contextOf(race) {
      return {
        track: race.track,
        cars: race.cars,
        time: race.time,
        dt: 1 / 60,
        totalLaps: race.totalLaps,
        totalCars: race.cars.length,
        itemsEnabled: race.itemsEnabled,
        projectiles: race.projectiles,
        bananas: race.bananas,
        bombs: race.bombs,
        explosions: race.explosions,
        leaderProgress: race.leaderProgress
      };
    }
    function advance(race, dt, playerInput) {
      race.time += dt;
      race.goFlash = Math.max(0, race.goFlash - dt);
      var ctx = contextOf(race);
      var i, car, input;
      var lead = -Infinity;
      for (i = 0; i < race.cars.length; i++) lead = Math.max(lead, race.cars[i].progress);
      ctx.leaderProgress = lead;
      race.leaderProgress = lead;
      for (i = 0; i < race.cars.length; i++) {
        car = race.cars[i];
        if (car.isPlayer) {
          input = playerInput || { steer: 0, throttle: true };
          if (input.useItem && race.itemsEnabled) {
            KART.pendingItemSfx = car.item;
            KART.items.useItem(car, ctx);
            input.useItem = false;
          }
        } else {
          input = AI.aiInput(car, ctx);
          if (race.itemsEnabled && AI.aiUseItem(car, ctx)) KART.items.useItem(car, ctx);
        }
        P.updateCar(car, dt, input, ctx);
        if (car.itemRoll > 0) car.itemRoll = Math.max(0, car.itemRoll - dt);
      }
      P.resolveCollisions(race.cars, race.track, ctx);
      if (race.itemsEnabled) KART.items.updateItems(ctx, dt);
      P.updateRanks(race.cars);
      for (i = 0; i < race.cars.length; i++) {
        car = race.cars[i];
        if (car.bestLap && (!race.fastestLap || car.bestLap < race.fastestLap)) {
          race.fastestLap = car.bestLap;
          race.fastestCar = car;
        }
      }
    }
    function finishRace(race) {
      race.state = "finishing";
      var ctx = contextOf(race), guard = 0;
      while (race.cars.some(function(x) {
        return !x.finished;
      }) && guard++ < 90 * 60) {
        ctx.time = race.time;
        advance(race, 1 / 60, AI.aiInput(race.player, ctx));
      }
      race.state = "finished";
      var sorted = P.updateRanks(race.cars);
      race.results = sorted.map(function(c, i) {
        var pts = (KART.RANK_POINTS[i] || 0) + (c.finished ? KART.SCORE_BONUS.finish : 0);
        if (race.fastestCar === c && race.fastestLap) pts += KART.SCORE_BONUS.fastestLap;
        if (c.finished && c.wallHits < 3) pts += KART.SCORE_BONUS.clean;
        var rec = {
          car: c,
          rank: i + 1,
          name: c.name,
          kart: c.spec.name,
          time: c.finished ? c.finishTime : null,
          bestLap: c.bestLap || 0,
          wallHits: c.wallHits,
          driftBoosts: c.driftBoosts,
          points: pts,
          dnf: !c.finished
        };
        for (var g = 0; g < KART.GRADE.length; g++) {
          if (KART.GRADE[g].test(rec)) {
            rec.grade = KART.GRADE[g].grade;
            break;
          }
        }
        return rec;
      });
      race.playerResult = race.results.filter(function(r) {
        return r.car.isPlayer;
      })[0];
      race.onEvent("finished", race);
    }
    KART.createRace = createRace;
    KART.stepRace = stepRace;
    KART.finishRace = finishRace;
  })(typeof window !== "undefined" ? window : globalThis);
  return (typeof window !== "undefined" ? window : globalThis).KART;
}
export {
  installRules
};
