
/* ===================================================================
   交互式 3D 地球
   - 经纬度 <-> 三维坐标互转（球面贴图对齐）
   - 射线拾取陆地落点 → 判断是否落在境内 → 飞往
   - 城市标记命中检测 → 弹照片卡片
   =================================================================== */
(function () {
  'use strict';

/* ---------- 兜底：任何异常都不让用户永远卡在加载页 ----------
     必须先于主脚本注册，否则主脚本抛错时监听器还没挂上。*/
  window.__globeFatal = function (msg, line) {
    var ld = document.getElementById('load');
    if (ld) {
      ld.classList.remove('off');
      ld.classList.add('err');
      ld.innerHTML =
        '<div style="max-width:560px;text-align:center;padding:0 24px">'
        + '<div style="font-size:34px;margin-bottom:14px">⚠️</div>'
        + '<p style="color:#ff8a8a;font-size:15px;line-height:1.8">页面初始化失败</p>'
        + '<p style="color:#8ea3c4;font-size:13px;margin-top:12px;line-height:1.8;word-break:break-all">'
        + String(msg).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
          })
        + (line ? '（第 ' + line + ' 行）' : '') + '</p>'
        + '<p style="color:#6b7f9e;font-size:12px;margin-top:16px">'
        + '若为资源加载失败，请确认 assets/ 与 data/ 目录随 index.html 一起存在。</p>'
        + '</div>';
    }
    console.error('[globe-demo] 初始化失败:', msg, line || '');
  };
  window.addEventListener('error', function (e) {
    window.__globeFatal(e.message || '未知错误', e.lineno);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    window.__globeFatal(String((r && r.message) || r || '异步资源加载失败'));
  });
  // 最长 10 秒仍未就绪则强制揭示问题
  setTimeout(function () {
    var ld = document.getElementById('load');
    if (ld && !ld.classList.contains('off') && !ld.classList.contains('err')) {
      window.__globeFatal('初始化超时：可能是外部资源未能载入（请用浏览器控制台查看具体原因）');
    }
  }, 10000);

  const R = 100;                       // 地球半径
  const DEG = Math.PI / 180;

  /* ---------- 坐标互转 ---------- */
  // 与 SphereGeometry 的 UV 对齐：u=0.5 对应经度 0
  function toVec(lat, lon, r) {
    r = r || R;
    const phi = (90 - lat) * DEG;
    const theta = (lon + 180) * DEG;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }
  function toLatLon(v) {
    const n = v.clone().normalize();
    const lat = 90 - Math.acos(n.y) / DEG;
    let lon = (Math.atan2(n.z, -n.x) / DEG) - 180;
    while (lon < -180) lon += 360;
    while (lon > 180) lon -= 360;
    return { lat, lon };
  }

  /* ---------- 场景 ---------- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070f);

  // 星空
  (function stars() {
    const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // 手工生成单位球面上的随机方向
      // （three.js r128 尚无 Vector3.randomDirection，需自行计算）
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = Math.sqrt(x * x + y * y + z * z);
      } while (len < 0.001 || len > 1);
      const k = 900 / len;
      pos[i * 3] = x * k; pos[i * 3 + 1] = y * k; pos[i * 3 + 2] = z * k;
      const t = Math.random();
      const c = t < .7 ? new THREE.Color(0xffffff)
              : t < .88 ? new THREE.Color(0x9fc4ff) : new THREE.Color(0xffd9a8);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({
      size: 1.6, vertexColors: true, transparent: true, opacity: .85
    })));
  })();

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 4000);

  /* 让整个地球刚好铺满视野所需的最小距离。
     竖屏（手机）水平视角更窄，必须拉远相机，否则地球会被裁掉一大块。 */
  function fitDist() {
    const vFov = camera.fov * DEG;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const fov = Math.min(vFov, hFov);      // 取较窄的那个方向为准
    return (R * 1.07) / Math.sin(fov / 2);
  }
  let lastFit = fitDist();

  // 初始机位直接对准中国（约 35°N, 104°E），距离按屏幕自适应
  camera.position.set(-55.5, 160.6, -222.5).setLength(lastFit);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.getElementById('app').appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.42;
  controls.zoomSpeed = 0.75;
  controls.minDistance = R + 4;
  controls.maxDistance = Math.max(700, lastFit * 2.5);

  // 环境光偏冷，托住暗部；主光从左上前方来，与默认视角同侧，
  // 否则地球朝向观众的一面正好背光，山脊阴影和纹理全被压暗
  scene.add(new THREE.AmbientLight(0x7f9ac8, 0.62));
  const sun = new THREE.DirectionalLight(0xfff2dd, 0.95);
  sun.position.set(-250, 300, -300);
  scene.add(sun);

  /* ---------- 地球 ---------- */
  const earth = new THREE.Group();
  scene.add(earth);

  /* 底图用 4K（4096×2048），并叠加高程贴图：
     高程贴图让山脉产生真实的明暗起伏——这是"能看清山脉"的关键，
     单靠颜色贴图在小比例尺下几乎分辨不出山脊走向。 */
  const maxAniso = renderer.capabilities.getMaxAnisotropy
    ? renderer.capabilities.getMaxAnisotropy() : 1;
  const texLoader = new THREE.TextureLoader();
  const dayTex = texLoader.load('' + window.__globeAssets[0] + '');
  const bumpTex = texLoader.load('' + window.__globeAssets[1] + '');
  const specTex = texLoader.load('' + window.__globeAssets[2] + '');
  [dayTex, bumpTex, specTex].forEach(t => {
    t.anisotropy = maxAniso;          // 斜视角下不糊
    t.minFilter = THREE.LinearMipMapLinearFilter;
  });

  const globe = new THREE.Mesh(
    // 分段提高到 144×108：贴图精度上来后，球面本身的棱角也得跟上
    new THREE.SphereGeometry(R, 144, 108),
    new THREE.MeshPhongMaterial({
      map: dayTex, specularMap: specTex,
      bumpMap: bumpTex, bumpScale: 1.0,   // 高程起伏强度
      specular: new THREE.Color(0x223344), shininess: 6
    })
  );
  globe.userData.pick = 'globe';
  earth.add(globe);

  // 大气辉光（uColor 用于点击后的高亮反馈）
  const atmoUniforms = { uColor: { value: new THREE.Color(0x3d8bff) } };
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.14, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 n; void main(){
        n=normalize(normalMatrix*normal);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uColor; varying vec3 n; void main(){
        float i=pow(0.72-dot(normalize(n),vec3(0.0,0.0,1.0)),2.4);
        gl_FragColor=vec4(uColor,i*0.62); }`
    })
  );
  earth.add(atmo);

  /* ---------- 界线绘制（中国省界 + 南海断续线） ---------- */
  let borderGroup = new THREE.Group();
  earth.add(borderGroup);

  // 南海断续线是独立要素（properties.adchar === 'JD'），单独用虚线样式绘制
  function buildBorders() {
    // 清空旧线条
    while (borderGroup.children.length) {
      const o = borderGroup.children.pop();
      o.geometry.dispose();
      o.material.dispose();
      o.parent = null;
    }
    if (!window.CHINA_GEO) return;

    const land = [], dashed = [];
    const polyR = R * 1.006;
    CHINA_GEO.features.forEach(f => {
      const rings = f.geometry.type === 'Polygon'
        ? [f.geometry.coordinates] : f.geometry.coordinates;
      const isDash = f.properties && f.properties.adchar === 'JD';
      const buf = isDash ? dashed : land;
      rings.forEach(poly => poly.forEach(ring => {
        // 逐段成对写入：LineSegments 按每 2 个顶点连线，
        // 若只按顶点顺序推入会漏掉相邻点之间的一半连接（放大后呈虚线感）
        for (let i = 0; i < ring.length - 1; i++) {
          const a = toVec(ring[i][1], ring[i][0], polyR);
          const b = toVec(ring[i + 1][1], ring[i + 1][0], polyR);
          buf.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }));
    });

    if (land.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(land, 3));
      borderGroup.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({
        color: 0x66e6ff, transparent: true, opacity: 0.9
      })));
    }
    if (dashed.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(dashed, 3));
      borderGroup.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({
        color: 0xffd27a, transparent: true, opacity: 0.85
      })));
    }
  }
  buildBorders();

  /* ---------- 水系（河流 + 湖泊）----------
     数据来自 Natural Earth 1:10m，只保留中国及周边并做了抽稀。
     用矢量而不是纯贴图，是因为在这个尺度下所有栅格图的河网都会糊成一团，
     矢量线无论放大到多近都保持锐利。 */
  const waterGroup = new THREE.Group();
  earth.add(waterGroup);

  // 河流按 scalerank 分三档：主干 / 支流 / 细流。
  // halfDeg 是"河宽"（地心角的一半），主干用条带画成有宽度的面，
  // 细流仍用 1px 线——WebGL 里 linewidth 基本不生效，靠线宽做不出粗细层级。
  const RIVER_TIERS = [
    { max: 3, r: R * 1.010, color: 0xbfe6f5, opacity: 0.95, halfDeg: 0.075 },  // 长江、黄河级
    { max: 6, r: R * 1.0085, color: 0x93d6f0, opacity: 0.85, halfDeg: 0.038 }, // 主要支流
    { max: 99, r: R * 1.0070, color: 0x74c8ea, opacity: 0.62, halfDeg: 0 }     // 中小河流
  ];

  const DEG2RAD = Math.PI / 180;

  /* 把折线在球面上扩成条带：每个线段两侧各偏移半个河宽，生成两个三角形。
     偏移方向取切平面内垂直于走向的方向，保证带子贴着球面走。 */
  function ribbonInto(out, pts, radius, halfRad) {
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    const nrm = new THREE.Vector3(), side = new THREE.Vector3();
    const a1 = new THREE.Vector3(), a2 = new THREE.Vector3();
    const b1 = new THREE.Vector3(), b2 = new THREE.Vector3();

    for (let i = 0; i < pts.length - 1; i++) {
      const [la1, lo1] = pts[i], [la2, lo2] = pts[i + 1];
      a.copy(toVec(la1, lo1, radius));
      b.copy(toVec(la2, lo2, radius));
      if (a.distanceTo(b) < 1e-6) continue;

      // a×b 的方向垂直于半径、也垂直于走向，本身就是"侧向"；
      // 再叉乘一次会转回径向，偏移量会被 setLength 完全吃掉（顶点全部重合）
      nrm.copy(a).cross(b);
      if (nrm.lengthSq() < 1e-12) continue;
      nrm.normalize();
      // halfRad 是角度，要乘半径才换算成弧长
      side.copy(nrm).multiplyScalar(radius * halfRad);

      // 顶点沿侧向偏移后重新投回球面，保持半径一致
      a1.copy(a).add(side).setLength(radius);
      a2.copy(a).sub(side).setLength(radius);
      b1.copy(b).add(side).setLength(radius);
      b2.copy(b).sub(side).setLength(radius);

      out.push(a1.x, a1.y, a1.z, a2.x, a2.y, a2.z, b2.x, b2.y, b2.z);
      out.push(a1.x, a1.y, a1.z, b2.x, b2.y, b2.z, b1.x, b1.y, b1.z);
    }
  }

  function buildWater() {
    if (!window.WATER) return;
    const lineBufs = RIVER_TIERS.map(() => []);
    const ribBufs = RIVER_TIERS.map(() => []);

    WATER.rivers.forEach(rv => {
      const p = rv.p;
      const pts = [];
      for (let i = 0; i < p.length; i += 2) pts.push([p[i + 1], p[i]]);
      if (pts.length < 2) return;

      const ti = RIVER_TIERS.findIndex(t => rv.r <= t.max);
      const tier = ti < 0 ? RIVER_TIERS.length - 1 : ti;
      const t = RIVER_TIERS[tier];

      if (t.halfDeg > 0) {
        ribbonInto(ribBufs[tier], pts, t.r, t.halfDeg * DEG2RAD);
      } else {
        const buf = lineBufs[tier];
        let prev = null;
        for (const [la, lo] of pts) {
          const v = toVec(la, lo, t.r);
          if (prev) buf.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
          prev = v;
        }
      }
    });

    RIVER_TIERS.forEach((t, i) => {
      if (ribBufs[i].length) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(ribBufs[i], 3));
        waterGroup.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({
          color: t.color, transparent: true, opacity: t.opacity,
          side: THREE.DoubleSide,
          polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
        })));
      }
      if (lineBufs[i].length) {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(lineBufs[i], 3));
        waterGroup.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({
          color: t.color, transparent: true, opacity: t.opacity
        })));
      }
    });

    // 湖泊：以质心做三角扇填充（湖面近似平面，此近似在视觉上足够）
    const lakeVerts = [];
    const lakeR = R * 1.0075;
    WATER.lakes.forEach(ring => {
      let cx = 0, cy = 0;
      const n = ring.length / 2;
      if (n < 3) return;
      for (let i = 0; i < ring.length; i += 2) { cx += ring[i]; cy += ring[i + 1]; }
      cx /= n; cy /= n;
      const c = toVec(cy, cx, lakeR);
      // 环首尾可能重复，用步长跳过最后一个重复点
      const closed = Math.abs(ring[0] - ring[ring.length - 2]) < 1e-9
                  && Math.abs(ring[1] - ring[ring.length - 1]) < 1e-9;
      const last = closed ? n - 1 : n;
      for (let i = 0; i < last; i++) {
        const j = (i + 1) % last;
        const a = toVec(ring[i * 2 + 1], ring[i * 2], lakeR);
        const b = toVec(ring[j * 2 + 1], ring[j * 2], lakeR);
        lakeVerts.push(c.x, c.y, c.z, a.x, a.y, a.z, b.x, b.y, b.z);
      }
    });

    if (lakeVerts.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(lakeVerts, 3));
      g.computeVertexNormals();
      waterGroup.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({
        color: 0x2a8fc0, transparent: true, opacity: 0.9,
        side: THREE.DoubleSide,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
      })));
    }
  }
  buildWater();

  /* ---------- 云层 ---------- */
  const cloudTex = new THREE.TextureLoader().load('' + window.__globeAssets[3] + '');
  cloudTex.wrapS = THREE.RepeatWrapping;
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.014, 72, 72),
    new THREE.MeshPhongMaterial({
      map: cloudTex, transparent: true, opacity: 0.42,
      depthWrite: false, blending: THREE.NormalBlending
    })
  );
  earth.add(clouds);

  /* ---------- 命中国内测试（返回省级行政区名） ---------- */
  function pointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if ((yi > lat) !== (yj > lat) &&
          lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // 返回所在省级行政区名称；不在境内返回 null
  // 跳过南海断续线（adchar === 'JD'），它是线要素而非陆地
  function locate(lon, lat) {
    if (!window.CHINA_GEO) return null;
    for (const f of CHINA_GEO.features) {
      if (f.properties && f.properties.adchar === 'JD') continue;
      const g = f.geometry;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      for (const poly of polys) {
        if (!poly.length) continue;
        if (pointInRing(lon, lat, poly[0])) {
          let hole = false;
          for (let k = 1; k < poly.length; k++) if (pointInRing(lon, lat, poly[k])) { hole = true; break; }
          if (!hole) return f.properties.name || '中国';
        }
      }
    }
    return null;
  }
  const inChina = (lon, lat) => locate(lon, lat) !== null;

/* ---------- 热点数据 ----------
     kind='eco'      八大生态系统（面板主分组）
     kind='landmark'  补充地标
     面板按钮与地球标记均由本数组生成，坐标只在此处维护一次。
     分类依据：国家林草局《生态产品目录(2024年版)》与《生态产品总值核算规范(试行)》；
     按需求将"淡水"单列，共 8 类生态系统。*/
  const SPOTS = [
    { kind: 'eco', id: 'forest', icon: '🌲',
      color: '#4ade80', eco: '森林生态系统', lat: 50.50, lon: 121.50, name: '大兴安岭森林',
      region: '内蒙古 · 大兴安岭',
      title: '森林生态系统 · 大兴安岭',
      sub: 'FOREST · 50.50°N 121.50°E · 中国森林覆盖率约 23%',
      desc: '以落叶松、白桦构成的寒温带明亮针叶林，是中国北方最重要的天然林屏障。大兴安岭森林面积约 8.35 万平方公里，既有涵养水源、保持水土的功能，也是驼鹿、紫貂、黑嘴松鸡等珍稀物种的家园。',
      facts: [['森林覆盖率', '约 23%'], ['主要树种', '落叶松 · 白桦'], ['生态价值', '北方天然林屏障']],
      photo: '' + window.__globeAssets[4] + '',
      art: 'forest' },

    { kind: 'eco', id: 'grassland', icon: '🌾',
      color: '#a3e635', eco: '草原生态系统', lat: 49.30, lon: 119.00, name: '呼伦贝尔草原',
      region: '内蒙古 · 呼伦贝尔',
      title: '草原生态系统 · 呼伦贝尔',
      sub: 'GRASSLAND · 49.30°N 119.00°E · 全国草原面积约 4 亿公顷',
      desc: '世界著名天然牧场之一，草场辽阔、河曲蜿蜒，被誉为"世界草原"。夏季绿草如茵，羊群如珍珠散落；这里也是蒙古族游牧文化的发祥地，草原生态对气候调节、水源涵养与生物多样性保护至关重要。',
      facts: [['草原总面积', '约 4亿公顷'], ['占国土面积', '约 41.7%'], ['主要家畜', '三河牛 · 蒙古羊']],
      photo: '' + window.__globeAssets[5] + '',
      art: 'grassland' },

    { kind: 'eco', id: 'desert', icon: '🏜',
      color: '#fbbf24', eco: '荒漠生态系统', lat: 38.90, lon: 83.60, name: '塔克拉玛干沙漠',
      region: '新疆 · 塔克拉玛干',
      title: '荒漠生态系统 · 塔克拉玛干',
      sub: 'DESERT · 38.90°N 83.60°E · 中国最大沙漠约 33.76 万 km²',
      desc: '"塔克拉玛干"在维吾尔语中意为"走得进去、出不来的地方"。这里年降水量不足 20 毫米，是中国最大的流动沙漠。沙漠边缘的绿洲与腹地的瀚海共同构成了丝路最传奇的一段风景，也成就了胡杨林与耐旱物种的独特生命策略。',
      facts: [['面积', '约 33.76 万 km²'], ['年降水量', '< 20 mm'], ['所属省份', '新疆维吾尔自治区']],
      photo: '' + window.__globeAssets[6] + '',
      art: 'taklamakan' },

    { kind: 'eco', id: 'wetland', icon: '🦆',
      color: '#38bdf8', eco: '湿地生态系统', lat: 33.70, lon: 102.50, name: '若尔盖高寒湿地',
      region: '四川 · 若尔盖',
      title: '湿地生态系统 · 若尔盖',
      sub: 'WETLAND · 33.70°N 102.50°E · "高原之肾" · 国际重要湿地',
      desc: '中国面积最大的高寒沼泽湿地之一，被称为"川西北高原的绿洲"。这里草甸连绵、河曲如九曲黄河，黑颈鹤等珍稀候鸟在此繁殖越冬。湿地具有涵养水源、调蓄洪水、净化水质和固碳等多种生态功能，被称为"地球之肾"。',
      facts: [['平均海拔', '约 3,400 m'], ['象征物种', '黑颈鹤'], ['功能', '涵养水源 · 固碳']],
      photo: '' + window.__globeAssets[7] + '',
      art: 'wetland' },

    { kind: 'eco', id: 'marine', icon: '🌊',
      color: '#22d3ee', eco: '海洋生态系统', lat: 28.50, lon: 124.00, name: '东海',
      region: '中国东部 · 东海',
      title: '海洋生态系统 · 东海',
      sub: 'MARINE · 28.50°N 124.00°E · 海域面积约 77 万 km²',
      desc: '东海是中国三大边缘海之一，大陆架宽广、水质肥沃。长江、钱塘江等大河在此入海，带来大量营养盐，孕育了舟山渔场等中国最重要的渔场，是带鱼、大黄鱼、小黄鱼、乌贼"四大经济鱼类"的主产区。',
      facts: [['海域面积', '约 77 万 km²'], ['平均水深', '约 370 m'], ['著名渔场', '舟山渔场']],
      photo: '' + window.__globeAssets[8] + '',
      art: 'marine' },

    // 淡水生态拆为两个点位：长江（干流）与洞庭湖（通江湖泊）
    { kind: 'eco', id: 'yangtze', icon: '🛶',
      color: '#818cf8', eco: '淡水生态系统', lat: 31.03, lon: 109.55, name: '长江',
      region: '重庆 · 瞿塘峡',
      title: '淡水生态系统 · 长江三峡',
      sub: 'YANGTZE · 31.03°N 109.55°E · 中国第一长河',
      desc: '长江自唐古拉山奔流东下，横贯中国腹地，全长约 6300 公里，是世界第三长河。瞿塘峡两岸峭壁夹江而立，江面最窄处不足百米，古称"夔门"，为三峡之首。长江流域养育了全国约三分之一的人口，是中国最重要的淡水生态系统之一。',
      facts: [['全长', '约 6,300 km'], ['流域面积', '约 180 万 km²'], ['发源地', '唐古拉山各拉丹冬']],
      photo: '' + window.__globeAssets[9] + '',
      art: 'wetland' },

    { kind: 'eco', id: 'freshwater', icon: '💧',
      color: '#a78bfa', eco: '淡水生态系统', lat: 29.30, lon: 112.95, name: '洞庭湖',
      region: '湖南 · 岳阳',
      title: '淡水生态系统 · 洞庭湖',
      sub: 'DONGTING · 29.30°N 112.95°E · 中国第二大淡水湖',
      desc: '洞庭湖位于湖南省北部，是长江中游最重要的调蓄湖泊，被称为"长江之肾"。湖区水草丰茂、洲滩广阔，是长江江豚、麋鹿、白鹤等珍稀物种的栖息地，也是中国淡水渔业与候鸟越冬的关键区域。',
      facts: [['湖泊面积', '约 2,625 km²'], ['湖泊排名', '中国第二大淡水湖'], ['代表物种', '长江江豚 · 麋鹿']],
      photo: '' + window.__globeAssets[10] + '',
      art: 'wetland' },

    { kind: 'eco', id: 'farmland', icon: '🌾',
      color: '#f59e0b', eco: '农田生态系统', lat: 25.75, lon: 110.13, name: '龙脊梯田',
      region: '广西 · 桂林龙胜',
      title: '农田生态系统 · 龙脊梯田',
      sub: 'FARMLAND · 25.75°N 110.13°E · 全球重要农业文化遗产',
      desc: '龙脊梯田位于广西龙胜各族自治县，始建于元朝，距今已有 650 多年历史。梯田从山脚盘绕至山顶，层层叠叠、垂直落差达 800 多米，是壮族、瑶族先民依山就势开垦出的山地农业生态系统，2018 年入选全球重要农业文化遗产。',
      facts: [['最高海拔', '约 1,180 m'], ['垂直落差', '约 800 m'], ['文化遗产', '全球重要农业文化遗产']],
      photo: '' + window.__globeAssets[11] + '',
      art: 'farmland' },

    { kind: 'eco', id: 'urban', icon: '🏙',
      color: '#f472b6', eco: '城市生态系统', lat: 31.23, lon: 121.47, name: '上海',
      region: '上海 · 长江入海口',
      title: '城市生态系统 · 上海',
      sub: 'URBAN · 31.23°N 121.47°E · 超大城市 · 长江入海口',
      desc: '上海地处长江入海口，是中国最大的经济中心城市。这里高楼密集、人口高度聚集，同时在崇明岛、临港等地保留了滩涂湿地与滨海生态空间，形成了高强度城市化与生态保护并存的典型城市生态系统。',
      facts: [['城市类型', '超大城市'], ['常住人口', '约 2,487 万'], ['生态特色', '崇明世界级生态岛']],
      photo: '' + window.__globeAssets[12] + '',
      art: 'guangzhou' },

    { kind: 'landmark', id: 'beijing', icon: '🏯',
      color: '#f87171', eco: '补充地标', lat: 39.90, lon: 116.41, name: '北京',
      region: '北京 · 中轴线',
      title: '北京 · 故宫与中轴线',
      sub: 'BEIJING · 39.90°N 116.41°E · 中国首都 · 世界文化遗产',
      desc: '三千年建城史、八百年建都史。以故宫为核心的北京中轴线纵贯老城南北，2024 年整体列入《世界遗产名录》。红墙黄瓦的宫殿群与外围的现代都市叠合，构成一座城市在时间长河中的双层剖面。',
      facts: [['建都史', '约 800 年'], ['世界遗产', '中轴线 · 故宫 · 天坛等'], ['常住人口', '约 2,186 万']],
      photo: '' + window.__globeAssets[13] + '',
      art: 'guangzhou' },

    { kind: 'landmark', id: 'newyork', icon: '🗽',
      color: '#94a3b8', eco: '补充地标', lat: 40.71, lon: -74.01, name: '纽约',
      region: '美国 · 纽约',
      title: '纽约 · 曼哈顿',
      sub: 'NEW YORK · 40.71°N 74.01°W · 联合国总部所在地',
      desc: '曼哈顿的天际线是 20 世纪城市化的象征：密集的街区被网格道路切分，中央公园在钢铁丛林中留下一块巨大的绿色。作为全球金融与文化枢纽，纽约与北京共同构成了东西半球的城市对照。',
      facts: [['人口', '约 840 万'], ['建市', '1624 年'], ['标志', '自由女神像 · 中央公园']],
      photo: '' + window.__globeAssets[14] + '',
      art: 'guangzhou' }
  ];

  /* ---------- 标记 DOM：为每个热点动态创建（须在 SPOTS 声明之后）---------- */
  const pinBox = document.getElementById('pins');
  const pinEls = {};
  SPOTS.forEach(s => {
    const el = document.createElement('div');
    el.className = 'pin hide';
    el.innerHTML = `<div class="dot" style="background:${s.color};box-shadow:0 0 0 4px ${s.color}33,0 0 16px ${s.color}"></div>`
                 + `<div class="lb" style="border-color:${s.color}66">${s.name}</div>`;
    pinBox.appendChild(el);
    pinEls[s.id] = el;
  });

  /* ---------- 地球自转下的坐标换算 ----------
     地球整体挂在 earth 组上并会自转，因此"经纬度 → 世界坐标"
     必须叠加 earth.rotation.y，否则标记、飞行、点击判定都会错位。*/
  function geoToWorld(lat, lon, radius, out) {
    const v = out || new THREE.Vector3();
    const p = toVec(lat, lon, radius || R);
    const a = earth.rotation.y;
    if (a) {
      const c = Math.cos(a), s = Math.sin(a);
      v.set(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
    } else {
      v.copy(p);
    }
    return v;
  }
  // 世界坐标 → 经纬度（toVec 的逆运算）
  function worldToGeo(point) {
    const a = earth.rotation.y;
    if (!a) return toLatLon(point);
    const c = Math.cos(a), s = Math.sin(a);
    const lx = point.x * c - point.z * s;
    const lz = point.x * s + point.z * c;
    return toLatLon(new THREE.Vector3(lx, point.y, lz));
  }

  /* ---------- 镜头飞行 ---------- */
  // FOCUS_DIST：聚焦到某个点位的统一倍率（点菜单 / 打开卡片共用，保证观感一致）
  // dist 省略时保持当前相机距离；距离下限做保护，避免飞到地表以下/贴脸
  // 聚焦倍率：相对"铺满视野"的距离取值，保证不同屏幕上的观感比例一致
  const focusDist = () => fitDist() * 0.47;
  const MIN_FLY_DIST = R * 1.2;
  let flight = null;
  function flyTo(lat, lon, dist, ms) {
    const from = camera.position.clone();
    const fromR = from.length();
    const toR = Math.min(controls.maxDistance, Math.max(dist || fromR, MIN_FLY_DIST));
    const toDir = geoToWorld(lat, lon, 1).normalize();
    flight = {
      fromDir: from.clone().normalize(),
      toDir,
      fromR, toR,
      t0: performance.now(), dur: ms || 1500
    };
  }

  function easeInOut(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  /* ---------- 射线拾取 ---------- */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downX = 0, downY = 0, moved = false, downType = 'mouse';

  // 触屏设备：手指按下时的自然位移常超过 10px，容差必须放宽，
  // 否则一次正常"点按"会被判成拖动，导致标记点不开。
  const COARSE = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  const DRAG_TOL = COARSE ? 14 : 6;
  const PIN_HIT_PX = COARSE ? 42 : 26;   // 触屏放大命中范围，手指更好点

  renderer.domElement.addEventListener('pointerdown', e => {
    downX = e.clientX; downY = e.clientY; moved = false;
    downType = e.pointerType || 'mouse';
  });
  renderer.domElement.addEventListener('pointermove', e => {
    const tol = (downType === 'touch' || downType === 'pen') ? 14 : DRAG_TOL;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > tol) moved = true;
    updateReadout(e);
  });
  // 用 pointerup 判定"点按"：移动端 click 事件常被页面手势或合成事件吞掉，
  // pointerup 在触屏与鼠标下都稳定触发。
  renderer.domElement.addEventListener('pointerup', e => {
    if (moved) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // 只响应左键
    handleTap(e.clientX, e.clientY);
  });

  function handleTap(cx, cy) {
    ndc.x = (cx / innerWidth) * 2 - 1;
    ndc.y = -(cy / innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);

    // 优先命中标记：按"屏幕像素距离"取最近的一个
    // （旧做法用射线到点的世界距离 + 宽松阈值，且遇到第一个命中就返回，
    //   当两个标记靠得较近时会打开错误的那个——例如点龙脊梯田却打开洞庭湖）
    let bestSpot = null, bestDist = Infinity;
    for (const s of SPOTS) {
      const wp = geoToWorld(s.lat, s.lon, R);
      const proj = wp.clone().project(camera);
      if (proj.z >= 1) continue;                       // 超出远平面
      // 背面剔除：该点须朝向相机
      const toCam = camera.position.clone().sub(wp).normalize();
      if (wp.clone().normalize().dot(toCam) <= 0) continue;
      const sx = (proj.x * .5 + .5) * innerWidth;
      const sy = (-proj.y * .5 + .5) * innerHeight;
      const d = Math.hypot(cx - sx, cy - sy);
      if (d < PIN_HIT_PX && d < bestDist) { bestDist = d; bestSpot = s; }
    }
    if (bestSpot) { openCard(bestSpot); return; }

    const hit = ray.intersectObject(globe, false)[0];
    if (!hit) return;
    const { lat, lon } = worldToGeo(hit.point);
    const prov = locate(lon, lat);
    if (prov) {
      flyTo(lat, lon, fitDist() * 0.75);
      flash(0x5fe0ff);
      toast(`📍 已抵达 <b>${prov}</b> · ${lat.toFixed(2)}°N, ${Math.abs(lon).toFixed(2)}°${lon < 0 ? 'W' : 'E'}`);
    } else {
      flyTo(lat, lon, fitDist() * 0.75);
      toast(`🌍 已飞抵 · ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    }
  }

  /* ---------- 悬停读数 ---------- */
  const coordEl = document.getElementById('coord');
  const rnameEl = document.getElementById('rname');
  function updateReadout(e) {
    ndc.x = (e.clientX / innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(globe, false)[0];
    if (!hit) { coordEl.textContent = '—'; rnameEl.textContent = ''; return; }
    const { lat, lon } = worldToGeo(hit.point);
    coordEl.textContent = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    const near = SPOTS.find(s => Math.hypot(s.lat - lat, (s.lon - lon) * Math.cos(lat * DEG)) < 6);
    const prov = locate(lon, lat);
    rnameEl.textContent = near ? near.eco : prov ? '🇨🇳 ' + prov : '';
  }

  /* ---------- 图片卡片 ---------- */
  const card = document.getElementById('card');
  const backdrop = document.getElementById('backdrop');
  const cimg = document.getElementById('cimg');
  const ctitle = document.getElementById('ctitle');
  const csub = document.getElementById('csub');
  const cdesc = document.getElementById('cdesc');
  const cbadge = document.getElementById('cbadge');
  const cfacts = document.getElementById('cfacts');
  let artCache = {};
  let activeSpot = null;

  function openCard(s) {
    ctitle.textContent = s.title;
    csub.textContent = s.sub;
    cdesc.textContent = s.desc;
    cbadge.textContent = s.eco;
    cbadge.style.borderColor = s.color + '88';
    cbadge.style.color = s.color;
    cbadge.style.background = s.color + '1a';
    cfacts.innerHTML = s.facts.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join('');

    // 优先使用实拍照片；若缺失或加载失败，回退到内置绘制图
    cimg.onerror = () => {
      if (!artCache[s.art]) artCache[s.art] = window.ILLUSTRATIONS[s.art]();
      cimg.onerror = null;
      cimg.src = artCache[s.art];
    };
    cimg.src = s.photo;

    card.classList.add('on');
    backdrop.classList.add('on');
    flyTo(s.lat, s.lon, focusDist(), 1500);   // 与点菜单同一倍率

    // 标记高亮：非当前项淡出
    activeSpot = s.id;
    SPOTS.forEach(o => pinEls[o.id].classList.toggle('active', o.id === s.id));
  }
  // 统一的关闭入口（关闭按钮 / 点卡片外部 / Esc 都走这里）
  function closeCard() {
    card.classList.remove('on');
    backdrop.classList.remove('on');
    activeSpot = null;
    SPOTS.forEach(o => pinEls[o.id].classList.remove('active'));
  }
  document.getElementById('close').onclick = closeCard;
  backdrop.onclick = closeCard;      // 点击图片范围之外自动关闭

  /* ---------- 提示 ---------- */
  const tip = document.getElementById('tip');
  let tipTimer;
  function toast(msg) {
    tip.innerHTML = msg;
    tip.style.opacity = '1';
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      tip.innerHTML = '💡 点击 <b>八大生态</b>标记 查看实景照片 · 点击中国境内任意位置飞抵';
    }, 2800);
  }

  /* ---------- 闪光反馈：命中后大气短暂变色 ---------- */
  let flashT = 0;
  const BASE_GLOW = new THREE.Color(0x3d8bff);
  function flash(hex) {
    atmoUniforms.uColor.value.set(hex);
    flashT = performance.now();
  }

  /* ---------- 面板：按钮由 SPOTS 生成（坐标只维护一份） ---------- */
  const ecoBox = document.getElementById('ecoBtns');
  const markBox = document.getElementById('markBtns');

  function makeBtn(s, cls) {
    const b = document.createElement('button');
    b.className = cls === 'sub' ? 'btn sbtn' : ('btn' + (cls === 'eco' ? ' eco' : ''));
    b.dataset.fly = `${s.lat},${s.lon}`;
    b.dataset.spot = s.id;
    b.innerHTML = cls === 'sub'
      ? `${s.icon} ${s.name}`
      : `${s.icon} ${s.title.split(' · ')[0]}<small>${s.kind === 'eco' ? s.name : s.region}</small>`;
    return b;
  }

  // 按生态类型归组：只有一个点位的直接出按钮，
  // 多个点位（目前是淡水 → 长江 / 洞庭湖）收成可展开的父项，避免菜单里出现两个同名条目
  const byEco = new Map();
  SPOTS.filter(s => s.kind === 'eco').forEach(s => {
    if (!byEco.has(s.eco)) byEco.set(s.eco, []);
    byEco.get(s.eco).push(s);
  });
  byEco.forEach((list, eco) => {
    if (list.length === 1) {
      ecoBox.appendChild(makeBtn(list[0], 'eco'));
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'grp';
    wrap.dataset.eco = eco;

    const head = document.createElement('button');
    head.className = 'btn eco ghead';
    head.setAttribute('aria-expanded', 'false');
    head.innerHTML = `<span class="gtxt">${list[0].icon} ${eco}`
      + `<small>${list.length} 个地点</small></span><i class="arw">›</i>`;
    // 父项本身不飞，只负责展开 / 收起
    head.onclick = () => {
      const open = wrap.classList.toggle('open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const sub = document.createElement('div');
    sub.className = 'sub';
    list.forEach(s => sub.appendChild(makeBtn(s, 'sub')));

    wrap.appendChild(head);
    wrap.appendChild(sub);
    ecoBox.appendChild(wrap);
  });

  SPOTS.filter(s => s.kind !== 'eco').forEach(s => markBox.appendChild(makeBtn(s, 'landmark')));

  document.querySelectorAll('[data-fly]').forEach(b => {
    b.onclick = () => {
      const [la, lo] = b.dataset.fly.split(',').map(Number);
      // 与打开图片卡片一致：放大到 FOCUS_DIST
      flyTo(la, lo, focusDist());
      const spot = SPOTS.find(s => s.id === b.dataset.spot);
      toast(`🛫 飞往 <b>${spot ? spot.name : b.dataset.spot}</b>`);
    };
  });
  const spin = document.getElementById('spin');
  const bord = document.getElementById('bord');
  const cld = document.getElementById('cld');
  const watr = document.getElementById('watr');
  const pinTg = document.getElementById('pin');
  // 初始可见性完全由复选框状态决定（默认关闭），避免 HTML 与 JS 状态不一致
  borderGroup.visible = bord.checked;
  clouds.visible = cld.checked;
  waterGroup.visible = watr.checked;
  bord.onchange = () => { borderGroup.visible = bord.checked; };
  cld.onchange = () => { clouds.visible = cld.checked; };
  watr.onchange = () => { waterGroup.visible = watr.checked; };

  /* ---------- 侧边菜单收起 / 展开 ---------- */
  const panelEl = document.getElementById('panel');
  const panelToggle = document.getElementById('panelToggle');
  const panelOpen = document.getElementById('panelOpen');
  function setPanel(open) {
    panelEl.classList.toggle('collapsed', !open);
    panelOpen.style.display = open ? 'none' : 'flex';
  }
  panelToggle.onclick = () => setPanel(false);
  panelOpen.onclick = () => setPanel(true);
  setPanel(true);   // 默认展开

  /* ---------- 标记投影（含标签防重叠） ---------- */
  const projV = new THREE.Vector3();
  const worldV = new THREE.Vector3();
  const camDir = new THREE.Vector3();
  const placed = [];

  function updatePins() {
    const camD = camera.position.length();
    placed.length = 0;

    // 先算出所有可见标记的屏幕位置
    const visible = [];
    SPOTS.forEach(s => {
      geoToWorld(s.lat, s.lon, R * 1.01, worldV);
      projV.copy(worldV).project(camera);
      camDir.copy(camera.position).sub(worldV).normalize();
      const front = worldV.clone().normalize().dot(camDir) > 0;
      const x = (projV.x * .5 + .5) * innerWidth;
      const y = (-projV.y * .5 + .5) * innerHeight;
      const el = pinEls[s.id];
      // 拉得太远时才隐藏标记（阈值相对"铺满视野"的距离，窄屏拉远也仍然显示）
      const vis = pinTg.checked && front && projV.z < 1 && camD < fitDist() * 2.2;
      // 小屏全景时只显示圆点，放大后再显示名称，避免十几个标签挤在一起
      const smallScreen = COARSE || innerWidth < 560;
      const labelsOn = !smallScreen || camD < fitDist() * 0.9;
      el.classList.toggle('nolabel', !labelsOn);
      el.classList.toggle('hide', !vis);
      if (vis) visible.push({ s, el, x, y });
    });

    // 按 y 排序后逐个避让：先试正上/正下，再试左右，最后继续外扩
    visible.sort((a, b) => a.y - b.y);
    // [水平方向(-1左/0中/1右), 垂直偏移]
    const SLOTS = [
      [0, 0], [0, 52], [0, -24], [0, 78], [0, -46],
      [-1, 0], [1, 0], [-1, 52], [1, 52], [-1, -24], [1, -24],
      [0, 104], [-1, 78], [1, 78], [0, -68]
    ];
    visible.forEach(v => {
      v.el.style.transform = `translate(${v.x}px,${v.y}px) translate(-50%,-50%)`;
      const lb = v.el.querySelector('.lb');
      const hw = Math.min(74, (v.s.name.length * 11.5 + 20) / 2);
      const baseY = v.y - 30;          // 默认"上方"时标签中心的大致 y
      let dx = 0, dy = 0;
      for (const [sx, sy] of SLOTS) {
        const candX = v.x + sx * (hw + 10);
        const candY = baseY + sy;
        const clash = placed.some(p =>
          Math.abs(candX - p.x) < (hw + p.hw) && Math.abs(candY - p.y) < 21);
        if (!clash) { dx = sx * (hw + 10); dy = sy; break; }
        dx = sx * (hw + 10); dy = sy;   // 全都占满时就近放置
      }
      lb.style.transform = `translateX(calc(-50% + ${dx}px)) translateY(${dy}px)`;
      placed.push({ x: v.x + dx, y: baseY + dy, hw });
    });
  }

  /* ---------- 主循环 ---------- */
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(50, now - last); last = now;

    // 自转（用户操作时暂停）
    // 以"度/秒"为单位换算：滑块 100 时约 20 秒转一圈，默认 22 时较舒缓
    const degPerSec = (spin.value / 100) * 18;
    if (degPerSec > 0 && !flight && !userActive) {
      earth.rotation.y += degPerSec * (dt / 1000) * DEG;
    }

    // 辉光缓慢恢复为常态蓝色
    if (flashT) {
      const k = Math.min(1, (now - flashT) / 900);
      if (k >= 1) { atmoUniforms.uColor.value.copy(BASE_GLOW); flashT = 0; }
      else atmoUniforms.uColor.value.lerp(BASE_GLOW, 0.08);
    }

    // 飞行插值：方向在球面上插值、半径单独插值
    // （若直接用两点线性插值，跨半球飞行时相机会穿过地球内部）
    if (flight) {
      const t = Math.min(1, (now - flight.t0) / flight.dur);
      const k = easeInOut(t);
      const dir = flight.fromDir.clone().lerp(flight.toDir, k);
      if (dir.lengthSq() < 1e-8) dir.copy(flight.toDir);   // 正对跖点时退化处理
      dir.normalize();
      const r = flight.fromR + (flight.toR - flight.fromR) * k;
      camera.position.copy(dir.multiplyScalar(r));
      controls.target.set(0, 0, 0);
      if (t >= 1) flight = null;
    }

    clouds.rotation.y += 0.0012 * dt * 6;
    controls.update();
    updatePins();
    renderer.render(scene, camera);
  }

  let userActive = false, idleTimer;
  const markActive = () => {
    userActive = true;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { userActive = false; }, 2200);
  };
  controls.addEventListener('start', markActive);
  renderer.domElement.addEventListener('wheel', markActive, { passive: true });
  renderer.domElement.addEventListener('pointerdown', markActive);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    // 按"铺满视野"距离的变化等比缩放相机距离，保持原来的取景比例
    // （例如手机横竖屏切换时不会突然被裁掉一块）
    const nf = fitDist();
    if (lastFit > 0 && nf > 0) {
      camera.position.setLength(camera.position.length() * (nf / lastFit));
    }
    lastFit = nf;
    controls.maxDistance = Math.max(700, nf * 2.5);
  });

  addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });

  requestAnimationFrame(loop);
  // 调试/自检钩子（不影响正常使用）
  window.__globe = {
    earth, camera, scene, SPOTS, geoToWorld, worldToGeo, updatePins, flyTo, openCard, setPanel,
    waterGroup, borderGroup, globe,
    // 供测试读取当前飞行计划（不依赖动画帧）
    getFlight() { return flight ? { fromR: flight.fromR, toR: flight.toR } : null; },
    camDist() { return camera.position.length(); },
    setSpin(v) { spin.value = v; },
    setRotation(a) { earth.rotation.y = a; updatePins(); }
  };
  setTimeout(() => {
    document.getElementById('load').classList.add('off');
    flyTo(35, 104, undefined, 2200);   // 开场：转入中国方向（保持初始距离）
  }, 620);
})();
