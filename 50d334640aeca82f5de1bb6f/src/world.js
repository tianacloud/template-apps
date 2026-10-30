import { rollWheels } from "./wheels.js";
import * as T from "three";
import { VEHICLES } from "./state.js";
import { moveBody, blockedBody, vehicleBody } from "./physics.js";
import { animatePerson } from "./characters.js";
import {
  mat,
  box,
  cylinder,
  palm,
  car,
  person,
  textSign,
  batchStatic,
  materials as M,
} from "./models.js";
export const ROAD_X = [-120, -40, 40, 120],
  ROAD_Z = [-160, -80, 0, 80, 160];
export const GARAGE = { x: 107, z: 16 };
export const JOBS = [
  {
    id: "delivery",
    title: "落日快递",
    subtitle: "把唱片送到海滨俱乐部",
    type: "送货",
    reward: 450,
    time: 120,
    points: [
      [120, -80],
      [40, -80],
      [40, 80],
    ],
  },
  {
    id: "race",
    title: "海岸午夜线",
    subtitle: "穿过 6 个检查点，跑赢倒计时",
    type: "竞速",
    reward: 800,
    time: 95,
    points: [
      [120, -80],
      [120, -160],
      [40, -160],
      [40, 0],
      [-40, 0],
      [-40, -80],
    ],
  },
  {
    id: "escape",
    title: "热力追踪",
    subtitle: "甩开巡逻车，抵达北岸安全屋",
    type: "追逐",
    reward: 650,
    time: 100,
    points: [
      [40, 0],
      [40, -80],
      [-120, -80],
      [-120, -160],
    ],
  },
];
export function createWorld(scene, assetBase) {
  const staticGroup = new T.Group(),
    colliders = [],
    traffic = [],
    parked = [],
    pedestrians = [];
  let seed = 83215;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const add = (o) => (staticGroup.add(o), o);
  scene.background = new T.Color("#b4cfde");
  scene.fog = new T.FogExp2("#b8c9d0", 0.0019);
  const sky = new T.Mesh(
    new T.SphereGeometry(1600, 32, 24),
    new T.ShaderMaterial({
      side: T.BackSide,
      depthWrite: false,
      uniforms: {},
      vertexShader:
        "varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec3 v;void main(){float h=normalize(v).y;vec3 c=mix(vec3(.83,.86,.84),vec3(.23,.47,.69),smoothstep(-.02,.7,h));c=mix(vec3(.66,.74,.78),c,smoothstep(-.4,.0,h));gl_FragColor=vec4(c,1.);}",
    }),
  );
  scene.add(sky);
  const sun = new T.Mesh(
    new T.SphereGeometry(9, 24, 16),
    new T.MeshBasicMaterial({
      color: "#ffdb9a",
      fog: false,
      toneMapped: false,
    }),
  );
  sun.position.set(330, 230, -800);
  scene.add(sun);
  const hemi = new T.HemisphereLight("#c4e0f2", "#8c8876", 1.9);
  scene.add(hemi);
  const sunlight = new T.DirectionalLight("#ffe5be", 3.0);
  sunlight.position.set(100, 110, -100);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, {
    left: -105,
    right: 105,
    top: 105,
    bottom: -105,
    near: 1,
    far: 360,
  });
  sunlight.shadow.bias = -0.0005;
  sunlight.shadow.normalBias = 0.08;
  scene.add(sunlight, sunlight.target);
  add(box(360, 0.45, 450, mat("#bdb6a2"), 0, -0.3, 0));
  add(box(75, 0.25, 460, M.sand, 198, -0.18, 0));
  const ocean = new T.Mesh(
    new T.PlaneGeometry(1600, 2200),
    new T.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader:
        "varying vec3 p;void main(){p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}",
      fragmentShader:
        "varying vec3 p;uniform float time;void main(){float a=sin(p.x*.13+p.z*.18-time*.8);float b=sin(p.x*.32-p.z*.12+time*.5);float w=pow(max(0.,a*b),12.);vec3 c=mix(vec3(.12,.37,.43),vec3(.36,.65,.66),.5+.5*a*.25);float glow=exp(-pow((p.z+100.)/180.,2.));c+=vec3(1.,.55,.3)*w*(.15+glow*.7);gl_FragColor=vec4(c,1.);}",
    }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(1035, -0.32, 0);
  scene.add(ocean);
  const textureLoader = new T.TextureLoader();
  const roadMap = textureLoader.load(
    assetBase("textures/asphalt.jpg"),
  );
  const normal = textureLoader.load(
    assetBase("textures/asphalt-normal.jpg"),
  );
  for (const t of [roadMap, normal]) {
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = 8;
  }
  roadMap.colorSpace = T.SRGBColorSpace;
  const road = mat("#949b9f", {
    map: roadMap,
    normalMap: normal,
    normalScale: new T.Vector2(0.3, 0.3),
    roughness: 0.94,
  });
  for (const x of ROAD_X) add(box(17, 0.1, 410, road, x, 0.02, 0));
  for (const z of ROAD_Z) add(box(270, 0.1, 17, road, 0, 0.025, z));
  // Lanes and junction crossings are geometry, so they remain crisp at street level.
  for (const x of ROAD_X)
    for (let z = -198; z < 201; z += 9) {
      if (ROAD_Z.some((v) => Math.abs(v - z) < 12)) continue;
      add(box(0.12, 0.015, 3.8, M.line, x, 0.09, z));
      for (const side of [-1, 1])
        add(box(0.12, 0.015, 6.6, M.sidewalk, x + side * 7, 0.09, z));
    }
  for (const z of ROAD_Z)
    for (let x = -132; x < 134; x += 9) {
      if (ROAD_X.some((v) => Math.abs(v - x) < 12)) continue;
      add(box(3.8, 0.015, 0.12, M.line, x, 0.1, z));
    }
  for (const x of ROAD_X)
    for (const z of ROAD_Z)
      for (const sign of [-1, 1])
        for (let j = -5; j <= 5; j += 2) {
          add(box(1, 0.02, 3, M.sidewalk, x + j, 0.1, z + sign * 11));
          add(box(3, 0.02, 1, M.sidewalk, x + sign * 11, 0.1, z + j));
        }
  const palette = [
    "#e7b9b1",
    "#b1c6b6",
    "#efc99d",
    "#bcc5cb",
    "#dba6ae",
    "#d2d0ba",
  ];
  const wallCanvas = document.createElement("canvas");
  wallCanvas.width = wallCanvas.height = 128;
  const wc = wallCanvas.getContext("2d");
  wc.fillStyle = "#eeeeee";
  wc.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 3000; i++) {
    wc.fillStyle = `rgba(50,40,30,${rand() * 0.06})`;
    wc.fillRect(rand() * 128, rand() * 128, 1, 1);
  }
  const wallTexture = new T.CanvasTexture(wallCanvas);
  wallTexture.wrapS = wallTexture.wrapT = T.RepeatWrapping;
  wallTexture.repeat.set(4, 4);
  wallTexture.colorSpace = T.SRGBColorSpace;
  const trims = palette.map((c) => mat(c, { map: wallTexture }));
  const cream = mat("#f2debe"),
    windowMat = mat("#6c929b", { metalness: 0.72, roughness: 0.23 }),
    awning = mat("#da8d9b");
  for (let ix = 0; ix < 3; ix++)
    for (let iz = 0; iz < 4; iz++) {
      const cx = (ROAD_X[ix] + ROAD_X[ix + 1]) / 2,
        cz = (ROAD_Z[iz] + ROAD_Z[iz + 1]) / 2;
      add(box(62, 0.32, 62, M.sidewalk, cx, 0.12, cz));
      for (let bx = 0; bx < 2; bx++)
        for (let bz = 0; bz < 2; bz++) {
          const x = cx + (bx ? 16 : -16),
            z = cz + (bz ? 16 : -16),
            w = 22 + rand() * 5,
            d = 21 + rand() * 4,
            h = 9 + Math.floor(rand() * 5) * 4;
          const material = trims[Math.floor(rand() * trims.length)];
          add(box(w, h, d, material, x, h / 2 + 0.3, z));
          colliders.push({
            x,
            z,
            hx: w / 2 + 0.32,
            hz: d / 2 + 0.32,
            height: h,
          });
          add(box(w + 0.8, 0.35, d + 0.8, cream, x, h + 0.45, z));
          add(box(w - 1.4, 0.4, d - 1.4, M.sidewalk, x, h + 0.8, z));
          add(box(3, 1.2, 3, M.dark, x + 4, h + 1.3, z));
          for (let y = 3.4; y < h - 1; y += 3.6) {
            for (const side of [-1, 1]) {
              add(
                box(
                  w + 0.16,
                  1.8,
                  0.12,
                  windowMat,
                  x,
                  y,
                  z + side * (d / 2 + 0.03),
                ),
              );
              add(
                box(
                  0.12,
                  1.8,
                  d + 0.16,
                  windowMat,
                  x + side * (w / 2 + 0.03),
                  y,
                  z,
                ),
              );
              add(
                box(w + 0.8, 0.16, 0.45, cream, x, y - 1, z + (side * d) / 2),
              );
            }
            for (let k = -w / 2 + 2; k < w / 2; k += 3.8) {
              add(box(0.25, 2.1, 0.17, material, x + k, y, z + d / 2 + 0.1));
              add(box(0.25, 2.1, 0.17, material, x + k, y, z - d / 2 - 0.1));
            }
          }
          for (const side of [-1, 1]) {
            add(box(w, 0.22, 2, awning, x, 2.9, z + side * (d / 2 + 0.75)));
            for (let k = -w / 2 + 2; k < w / 2; k += 4.5)
              add(
                box(
                  2.8,
                  2.2,
                  0.18,
                  windowMat,
                  x + k,
                  1.5,
                  z + side * (d / 2 + 0.1),
                ),
              );
          }
          for (let y = 3.4; y < h - 1; y += 3.6)
            for (let k = -d / 2 + 2; k < d / 2; k += 3.8) {
              for (const side of [-1, 1]) {
                add(
                  box(
                    0.19,
                    2.1,
                    0.22,
                    material,
                    x + side * (w / 2 + 0.1),
                    y,
                    z + k,
                  ),
                );
                add(
                  box(
                    0.22,
                    0.06,
                    3.5,
                    cream,
                    x + side * (w / 2 + 0.1),
                    y,
                    z + k,
                  ),
                );
              }
            }
          // Ground-floor colonnades, setback entrances, and roof parapets break up the facades.
          for (const side of [-1, 1]) {
            add(
              box(
                w + 0.35,
                0.55,
                0.3,
                material,
                x,
                h + 0.75,
                z + (side * d) / 2,
              ),
            );
            for (let k = -w / 2 + 1; k < w / 2; k += 5)
              add(
                box(
                  0.4,
                  2.8,
                  0.4,
                  cream,
                  x + k,
                  1.55,
                  z + side * (d / 2 + 1.5),
                ),
              );
          }
          if ((ix + iz + bx + bz) % 3 === 0) {
            const tower = box(
              2.4,
              h + 1,
              2.5,
              cream,
              x - w / 2 + 2,
              (h + 1) / 2,
              z + d / 2 + 0.5,
            );
            add(tower);
            const sign = new T.Mesh(
              new T.PlaneGeometry(9, 2.25),
              textSign(
                ["PALMS", "RIVIERA", "OCEAN", "MOTEL", "RADIO 88"][
                  Math.floor(rand() * 5)
                ],
              ),
            );
            sign.position.set(x, h - 1, z + d / 2 + 0.14);
            add(sign);
          }
        }
    }
  // Warm shop interiors and street furniture along the hotel frontages.
  const warmGlass = mat("#dfb781", {
    emissive: "#c78d52",
    emissiveIntensity: 0.25,
  });
  for (let z = -140; z < 160; z += 80) {
    for (let x = 60; x < 100; x += 12) {
      add(box(4, 2.1, 0.12, warmGlass, x, 1.55, z + 28));
      const table = cylinder(0.9, 0.9, 0.1, M.trunk, 16);
      table.position.set(x, 0.9, z + 31);
      colliders.push({ x, z: z + 31, hx: 2, hz: 1, height: 1.2 });
      add(table);
      const stand = cylinder(0.07, 0.09, 0.85, M.dark, 8);
      stand.position.set(x, 0.45, z + 31);
      add(stand);
      for (const d of [-1, 1]) {
        add(box(0.7, 0.1, 0.7, cream, x + d * 1.4, 0.5, z + 31));
        add(box(0.7, 0.7, 0.1, cream, x + d * 1.4, 0.85, z + 31.3));
      }
    }
  }
  for (let z = -175; z < 190; z += 35) {
    const planter = cylinder(0.65, 0.5, 0.7, cream, 12);
    planter.position.set(132, 0.55, z);
    colliders.push({ x: 132, z, hx: 0.7, hz: 0.7, height: 1.8 });
    add(planter);
    const bush = new T.Mesh(new T.IcosahedronGeometry(0.95, 1), M.leaf);
    bush.position.set(132, 1.25, z);
    add(bush);
  }
  for (let i = 0; i < 22; i++) {
    const x = -190 + i * 17,
      h = 25 + rand() * 58,
      z = -260 - rand() * 45;
    add(
      box(
        9 + rand() * 12,
        h,
        12,
        mat(["#9ba2b1", "#b2a1ab", "#98a6af"][i % 3]),
        x,
        h / 2,
        z,
      ),
    );
  }
  // Ocean Drive has a long planted promenade with low art-deco hotels on one side.
  add(box(23, 0.32, 416, M.sidewalk, 140, 0.12, 0));
  add(box(1, 0.4, 420, cream, 154, 0.25, 0));
  for (let z = -192; z < 205; z += 18) {
    for (const x of [135, 150]) {
      const p = palm(9 + rand() * 3, (rand() - 0.5) * 2);
      p.position.set(x, 0.3, z + (x === 150 ? 6 : 0));
      colliders.push({ x, z: p.position.z, hx: 0.45, hz: 0.45, height: 9 });
      p.rotation.y = rand() * 6;
      add(p);
    }
    add(box(2, 0.25, 0.7, mat("#9c7769"), 145, 0.8, z));
    colliders.push({ x: 145, z, hx: 1.05, hz: 0.4, height: 1 });
    for (const x of [144.4, 145.6]) add(box(0.13, 0.8, 0.6, M.dark, x, 0.4, z));
  }
  for (let ix = 0; ix < 3; ix++)
    for (let iz = 0; iz < 4; iz++) {
      const x = (ROAD_X[ix] + ROAD_X[ix + 1]) / 2,
        z = (ROAD_Z[iz] + ROAD_Z[iz + 1]) / 2;
      for (const side of [-1, 1]) {
        const p = palm(8 + rand() * 2, 0.8);
        p.position.set(x + side * 28, 0.3, z);
        colliders.push({ x: p.position.x, z, hx: 0.45, hz: 0.45, height: 8 });
        add(p);
      }
    }
  const lampMat = mat("#e2ddc4", { emissive: "#ffd79c", emissiveIntensity: 2 });
  for (const x of ROAD_X)
    for (let z = -190; z < 200; z += 40) {
      const pole = cylinder(0.08, 0.12, 6, M.dark, 6);
      pole.position.set(x + 10, 3, z);
      colliders.push({ x: x + 10, z, hx: 0.18, hz: 0.18, height: 6 });
      add(pole);
      add(box(1.9, 0.08, 0.1, M.dark, x + 9.2, 6, z));
      add(box(0.75, 0.12, 0.38, lampMat, x + 8.5, 5.95, z));
    }
  for (let z = -150; z < 190; z += 26) {
    const x = 175 + rand() * 26;
    const umbrella = new T.Mesh(
      new T.ConeGeometry(3.6, 1.4, 10),
      mat(z % 3 === 0 ? "#e8a2a8" : "#f2dfc0"),
    );
    umbrella.position.set(x, 3, z);
    add(umbrella);
    const pole = cylinder(0.05, 0.05, 2.8, cream, 6);
    pole.position.set(x, 1.4, z);
    add(pole);
    add(box(1, 0.2, 2.4, awning, x + 1, 0.28, z + 1));
  }
  // Small marina at the south end, with moored sailboats.
  add(box(54, 0.5, 5, mat("#a98c79"), 180, 0.15, 190));
  for (let i = 0; i < 5; i++) {
    const hull = box(3, 0.7, 8, cream, 199 + (i % 2) * 9, 0.1, 166 + i * 12);
    hull.rotation.y = 0.15;
    add(hull);
    const mast = cylinder(0.055, 0.075, 11, cream, 6);
    mast.position.set(hull.position.x, 5.5, hull.position.z);
    add(mast);
    const sailGeo = new T.BufferGeometry();
    sailGeo.setAttribute(
      "position",
      new T.Float32BufferAttribute([0, 0, 0, 0, 8, 0, 0, 0, 4], 3),
    );
    sailGeo.computeVertexNormals();
    const sail = new T.Mesh(sailGeo, mat("#f5e7d5", { side: T.DoubleSide }));
    sail.position.set(hull.position.x, 1.3, hull.position.z);
    add(sail);
  }
  // Garage and its illuminated apron.
  const garage = new T.Group();
  garage.add(box(17, 6, 11, trims[1], 104, 3, 26));
  garage.add(box(17.8, 0.4, 12, cream, 104, 6.2, 26));
  garage.add(box(10, 4, 0.2, M.dark, 104, 2.1, 20.45));
  for (let y = 0.5; y < 4; y += 0.4)
    garage.add(box(9.7, 0.05, 0.22, M.chrome, 104, y, 20.3));
  const gs = new T.Mesh(
    new T.PlaneGeometry(13, 2.5),
    textSign("COAST CUSTOMS", "#87f4da"),
  );
  gs.position.set(104, 5.4, 20.25);
  gs.rotation.y = Math.PI;
  garage.add(gs);
  staticGroup.add(garage);
  colliders.push({ x: 104, z: 26, hx: 8.5, hz: 5.5, height: 6 });
  staticGroup.updateMatrixWorld(true);
  staticGroup.traverse((o) => {
    if (o.isMesh && o.material === road) {
      const pos = o.geometry.attributes.position,
        uv = o.geometry.attributes.uv,
        p = new T.Vector3();
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        uv.setXY(i, p.x * 0.18, p.z * 0.18);
      }
    }
  });
  scene.add(batchStatic(staticGroup));
  for (let i = 0; i < 16; i++) {
    const id = VEHICLES[i % VEHICLES.length].id,
      model = car(id);
    const vertical = i % 2 === 0,
      direction = i % 4 < 2 ? 1 : -1;
    model.position.set(
      vertical
        ? ROAD_X[Math.floor(i / 4)] + direction * 4
        : -115 + (i % 8) * 29,
      0,
      vertical
        ? -165 + (i % 4) * 90
        : ROAD_Z[Math.floor(i / 4)] - direction * 4,
    );
    model.rotation.y = vertical
      ? direction > 0
        ? 0
        : Math.PI
      : direction > 0
        ? Math.PI / 2
        : -Math.PI / 2;
    if (
      blockedBody(
        vehicleBody(model),
        colliders.concat(traffic.map((t) => vehicleBody(t.model))),
      )
    )
      continue;
    scene.add(model);
    traffic.push({ model, vertical, direction, speed: 6 + rand() * 3 });
  }
  for (let i = 0; i < 8; i++) {
    const model = car(VEHICLES[i].id);
    model.position.set(127, 0, -140 + i * 39);
    model.rotation.y = Math.PI;
    if (
      blockedBody(
        vehicleBody(model),
        colliders.concat(traffic.map((t) => vehicleBody(t.model))),
      )
    )
      continue;
    scene.add(model);
    parked.push({ model });
  }
  for (let i = 0; i < 16; i++) {
    const model = person();
    model.position.set(i < 12 ? 140 : ROAD_X[i % 4] + 11, 0, -185 + i * 23);
    scene.add(model);
    pedestrians.push({ model, speed: 0.7 + rand() * 0.5 });
  }
  return {
    colliders,
    traffic,
    parked,
    pedestrians,
    sunlight,
    ocean,
    sky,
    update(dt, time, player, playerCar, police) {
      ocean.material.uniforms.time.value = time;
      sunlight.position.set(player.x + 85, 110, player.z - 95);
      sunlight.target.position.set(player.x, 0, player.z);
      const extras = [
        vehicleBody(playerCar),
        ...(police?.visible ? [vehicleBody(police)] : []),
      ];
      if (!player.driving) extras.push({ ...player, hx: 0.4, hz: 0.4 });
      for (const t of traffic) {
        const p = t.model.position,
          body = vehicleBody(t.model);
        const solids = colliders.concat(
          extras,
          parked.map((v) => vehicleBody(v.model)),
          traffic.filter((v) => v !== t).map((v) => vehicleBody(v.model)),
        );
        const nearPedestrian =
          !player.driving && Math.hypot(player.x - p.x, player.z - p.z) < 8;
        const speed = nearPedestrian ? 0 : t.speed;
        const moved = moveBody(
          body,
          Math.sin(body.heading) * speed * dt,
          Math.cos(body.heading) * speed * dt,
          0,
          solids,
        );
        p.set(moved.x, 0, moved.z);
        const edge = t.vertical ? Math.abs(p.z) > 198 : Math.abs(p.x) > 130;
        if (edge) {
          const next = {
            ...body,
            x: t.vertical ? p.x : -Math.sign(p.x) * 128,
            z: t.vertical ? -Math.sign(p.z) * 197 : p.z,
          };
          if (!blockedBody(next, solids)) p.set(next.x, 0, next.z);
        }
        rollWheels(t.model, (moved.hit ? 0 : speed) * dt);
      }
      for (const p of pedestrians) {
        const heading = p.model.rotation.y;
        const moved = moveBody(
          {
            x: p.model.position.x,
            z: p.model.position.z,
            heading,
            hx: 0.28,
            hz: 0.28,
          },
          Math.sin(heading) * dt * p.speed,
          Math.cos(heading) * dt * p.speed,
          0,
          colliders.concat(
            extras,
            traffic.map((t) => vehicleBody(t.model)),
            parked.map((t) => vehicleBody(t.model)),
          ),
        );
        p.model.position.set(moved.x, 0, moved.z);
        if (moved.hit) p.model.rotation.y += Math.PI;
        animatePerson(p.model, dt, moved.hit ? "idle" : "walk", p.speed);
      }
    },
  };
}
