import * as T from "three";
import { VEHICLES } from "./state.js";
import { mountWheel } from "./wheels.js";
import { detailedCar } from "./vehicle-assets.js";
export { person } from "./characters.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export const mat = (color, extra = {}) =>
  new T.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
export const materials = {
  road: mat("#3f4654"),
  sidewalk: mat("#c6b5ac"),
  sand: mat("#e6c7a1"),
  line: mat("#efd5a1"),
  glass: mat("#263e50", { roughness: 0.21, metalness: 0.55 }),
  chrome: mat("#bbc7ce", { roughness: 0.18, metalness: 0.9 }),
  rubber: mat("#161d26"),
  trunk: mat("#8c7863"),
  leaf: mat("#326854", { side: T.DoubleSide }),
  dark: mat("#334750"),
};
export function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}
export function cylinder(rt, rb, h, m, n = 10) {
  const o = new T.Mesh(new T.CylinderGeometry(rt, rb, h, n), m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}
export function batchStatic(group) {
  const buckets = new Map();
  group.updateMatrixWorld(true);
  const moving = [];
  group.traverse((o) => {
    if (!o.isMesh || !o.geometry.attributes.normal || Array.isArray(o.material))
      return;
    const key = o.material.uuid;
    const g = (
      o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()
    ).applyMatrix4(o.matrixWorld);
    if (!g.attributes.uv)
      g.setAttribute(
        "uv",
        new T.Float32BufferAttribute(
          new Float32Array(g.attributes.position.count * 2),
          2,
        ),
      );
    if (!buckets.has(key)) buckets.set(key, { material: o.material, geos: [] });
    buckets.get(key).geos.push(g);
    moving.push(o);
  });
  for (const o of moving) o.removeFromParent();
  const out = new T.Group();
  for (const { material, geos } of buckets.values()) {
    const g = mergeGeometries(geos);
    if (g) {
      const mesh = new T.Mesh(g, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      out.add(mesh);
    }
    for (const geo of geos) geo.dispose();
  }
  return out;
}
export function car(id = "comet", color) {
  const v = VEHICLES.find((v) => v.id === id);
  if (["comet", "sedan", "suv", "pickup", "van"].includes(id))
    return detailedCar(id, color || v.color);
  const g = new T.Group(),
    fixed = new T.Group();
  const paint = new T.MeshPhysicalMaterial({
    color: color || v.color,
    roughness: 0.23,
    metalness: 0.72,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const glass = new T.MeshPhysicalMaterial({
    color: "#24343c",
    metalness: 0.45,
    roughness: 0.08,
    clearcoat: 1,
  });
  const trim = materials.dark,
    chrome = materials.chrome;
  const w = v.width / 2,
    l = v.length / 2,
    h = v.height;
  const tall = ["suv", "van", "pickup"].includes(v.style),
    exotic = ["super", "wedge"].includes(v.style);
  const radius = tall ? 0.49 : 0.38,
    axle = l * 0.64,
    belt = tall ? 1.14 : exotic ? 0.72 : 0.88;
  const add = (o) => (fixed.add(o), o);
  const rounded = (ww, hh, dd, m, x, y, z, r = 0.06) => {
    const o = new T.Mesh(new RoundedBoxGeometry(ww, hh, dd, 3, r), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    return add(o);
  };
  function beam(a, b, r, m) {
    const delta = new T.Vector3(...b).sub(new T.Vector3(...a));
    const o = cylinder(r, r, delta.length(), m, 8);
    o.position.copy(
      new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(0.5),
    );
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
    add(o);
  }
  function cabin(front, back, topFront, topBack, top) {
    const bw = w * 0.87,
      tw = w * 0.72;
    const verts = [
      -bw,
      belt,
      front,
      bw,
      belt,
      front,
      tw,
      top,
      topFront,
      -tw,
      top,
      topFront,
      -tw,
      top,
      topBack,
      tw,
      top,
      topBack,
      bw,
      belt,
      back,
      -bw,
      belt,
      back,
    ];
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
    geo.setIndex([
      0, 1, 2, 0, 2, 3, 1, 6, 5, 1, 5, 2, 6, 7, 4, 6, 4, 5, 7, 0, 3, 7, 3, 4, 3,
      2, 5, 3, 5, 4,
    ]);
    geo.computeVertexNormals();
    add(new T.Mesh(geo, glass));
    rounded(
      tw * 2 + 0.08,
      0.09,
      topFront - topBack + 0.06,
      paint,
      0,
      top + 0.025,
      (topFront + topBack) / 2,
    );
    for (const side of [-1, 1]) {
      beam([side * bw, belt, front], [side * tw, top, topFront], 0.035, paint);
      beam([side * bw, belt, back], [side * tw, top, topBack], 0.06, paint);
      if (v.style === "sedan" || tall)
        beam([side * bw, belt, -0.15], [side * tw, top, -0.15], 0.036, trim);
    }
  }
  // Recessed chassis and wheel-arch side panels keep the wheels clear of the bodywork.
  rounded(w * 1.48, 0.25, l * 1.9, trim, 0, radius * 0.85, 0);
  rounded(w * 1.94, 0.22, l * 1.98, paint, 0, belt - 0.03, 0, 0.1);
  for (const end of [-1, 1])
    rounded(
      w * 1.9,
      belt - 0.33,
      0.38,
      paint,
      0,
      (belt + 0.33) / 2,
      end * (l - 0.16),
      0.09,
    );
  const sideShape = new T.Shape();
  sideShape.moveTo(-l, 0.36);
  sideShape.lineTo(-l, belt);
  sideShape.lineTo(l, belt);
  sideShape.lineTo(l, 0.36);
  sideShape.lineTo(axle + radius + 0.08, 0.36);
  sideShape.absarc(axle, radius, radius + 0.09, 0, Math.PI, false);
  sideShape.lineTo(-axle + radius + 0.09, 0.36);
  sideShape.absarc(-axle, radius, radius + 0.09, 0, Math.PI, false);
  sideShape.lineTo(-l, 0.36);
  const sideGeo = new T.ExtrudeGeometry(sideShape, {
    depth: 0.075,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 16,
  });
  for (const side of [-1, 1]) {
    const panel = new T.Mesh(sideGeo, paint);
    panel.rotation.y = Math.PI / 2;
    panel.position.x = side * (w - 0.05);
    add(panel);
    rounded(0.07, 0.1, axle * 1.18, trim, side * w, 0.31, 0, 0.025);
  }
  if (v.style === "van") {
    rounded(
      w * 1.9,
      h - belt,
      l * 1.16,
      paint,
      0,
      (h + belt) / 2,
      -l * 0.38,
      0.13,
    );
    cabin(l * 0.83, -0.18, l * 0.55, -0.19, h - 0.02);
    for (const side of [-1, 1]) {
      rounded(0.012, 0.018, 1.75, trim, side * (w - 0.01), 1.27, -0.8, 0.005);
      rounded(0.04, 0.045, 0.26, chrome, side * w, 1.15, -0.5, 0.01);
    }
    rounded(
      0.025,
      h - belt - 0.1,
      0.02,
      trim,
      0,
      (h + belt) / 2,
      -l - 0.02,
      0.005,
    );
  } else if (v.style === "pickup") {
    cabin(l * 0.59, -0.15, l * 0.36, -0.35, h - 0.05);
    rounded(w * 1.6, 0.04, l * 0.77, trim, 0, belt - 0.13, -l * 0.53);
    for (const side of [-1, 1])
      rounded(0.17, 0.36, l * 0.94, paint, side * w, belt + 0.02, -l * 0.49);
    rounded(w * 1.95, 0.34, 0.14, paint, 0, belt, -l + 0.03);
    for (let i = -3; i <= 3; i++)
      rounded(
        0.035,
        0.025,
        l * 0.7,
        chrome,
        i * 0.22,
        belt - 0.095,
        -l * 0.52,
        0.01,
      );
  } else if (v.style === "roadster") {
    rounded(w * 1.68, 0.04, 1.65, trim, 0, belt + 0.06, -0.1);
    for (const side of [-1, 1]) {
      rounded(0.59, 0.18, 0.67, mat("#aa7152"), side * 0.46, belt + 0.12, -0.1);
      rounded(
        0.58,
        0.45,
        0.15,
        mat("#aa7152"),
        side * 0.46,
        belt + 0.32,
        -0.45,
      );
      beam(
        [side * w * 0.85, belt, 0.65],
        [side * w * 0.72, h, 0.32],
        0.05,
        paint,
      );
    }
    const screen = box(w * 1.45, 0.47, 0.025, glass, 0, h - 0.22, 0.45);
    screen.rotation.x = -0.5;
    add(screen);
    rounded(w * 1.5, 0.04, 0.06, chrome, 0, h + 0.005, 0.32, 0.015);
  } else if (v.style === "suv") {
    cabin(l * 0.58, -l * 0.87, l * 0.3, -l * 0.79, h - 0.07);
    for (const side of [-1, 1])
      beam(
        [side * w * 0.65, h + 0.08, -l * 0.74],
        [side * w * 0.65, h + 0.08, l * 0.26],
        0.04,
        chrome,
      );
    for (const z of [-1.3, 0.3])
      rounded(w * 1.35, 0.045, 0.055, trim, 0, h + 0.12, z, 0.015);
    const spare = cylinder(0.43, 0.43, 0.22, materials.rubber, 32);
    spare.rotation.x = Math.PI / 2;
    spare.position.set(0, 1.25, -l - 0.08);
    add(spare);
  } else {
    const rear = v.style === "sedan" ? -l * 0.62 : -l * 0.55;
    cabin(
      l * (exotic ? 0.53 : 0.42),
      rear,
      l * 0.13,
      exotic ? -l * 0.24 : -l * 0.36,
      h - 0.06,
    );
    if (v.style === "super") {
      for (const side of [-1, 1]) {
        rounded(0.06, 0.21, 0.7, trim, side * (w + 0.015), 0.64, -0.55);
        rounded(
          0.06,
          0.045,
          0.55,
          chrome,
          side * (w + 0.047),
          0.65,
          -0.55,
          0.012,
        );
      }
      rounded(w * 1.85, 0.09, 0.38, paint, 0, 1.2, -l * 0.86);
      for (const side of [-1, 1])
        rounded(0.07, 0.36, 0.12, trim, side * 0.64, 1.04, -l * 0.86);
    }
    if (v.style === "wedge")
      for (let i = 0; i < 7; i++)
        rounded(
          w * 1.4,
          0.025,
          0.06,
          trim,
          0,
          belt + 0.11,
          -l * 0.5 - i * 0.11,
          0.012,
        );
  }
  for (const side of [-1, 1]) {
    rounded(0.22, 0.11, 0.32, paint, side * (w + 0.06), belt + 0.21, 0.63);
    rounded(
      0.08,
      0.03,
      0.25,
      chrome,
      side * (w + 0.055),
      belt - 0.04,
      -0.2,
      0.01,
    );
    if (v.style === "sedan")
      rounded(
        0.06,
        0.03,
        0.25,
        chrome,
        side * (w + 0.05),
        belt - 0.04,
        -0.98,
        0.01,
      );
  }
  const white = mat("#fff0d4", { emissive: "#ffedc7", emissiveIntensity: 0.7 }),
    red = mat("#a51622", { emissive: "#ff2932", emissiveIntensity: 1.2 });
  for (const side of [-1, 1]) {
    rounded(
      w * 0.55,
      exotic ? 0.075 : 0.16,
      0.07,
      white,
      side * w * 0.63,
      belt - 0.1,
      l + 0.015,
      0.025,
    );
    rounded(
      w * 0.63,
      0.09,
      0.07,
      red,
      side * w * 0.62,
      belt - 0.1,
      -l - 0.018,
      0.025,
    );
    const exhaust = cylinder(0.065, 0.065, 0.16, chrome, 12);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(side * w * 0.73, 0.35, -l - 0.04);
    add(exhaust);
  }
  rounded(w * 1.85, 0.15, 0.14, trim, 0, 0.45, l + 0.035);
  rounded(w * 1.85, 0.14, 0.13, trim, 0, 0.43, -l - 0.035);
  for (let i = 0; i < 3; i++)
    rounded(
      w * 0.83,
      0.02,
      0.03,
      chrome,
      0,
      0.48 + i * 0.055,
      l + 0.112,
      0.005,
    );
  rounded(0.5, 0.15, 0.025, mat("#e9e3cf"), 0, 0.63, -l - 0.105, 0.01);
  const wheels = [];
  for (const z of [-axle, axle])
    for (const side of [-1, 1]) {
      const wheel = new T.Group();
      const tire = new T.Mesh(
        new T.TorusGeometry(radius - 0.105, 0.105, 12, 40),
        materials.rubber,
      );
      tire.rotation.y = Math.PI / 2;
      wheel.add(tire);
      const inner = cylinder(radius - 0.12, radius - 0.12, 0.2, trim, 32);
      inner.rotation.z = Math.PI / 2;
      wheel.add(inner);
      const brake = cylinder(
        radius * 0.61,
        radius * 0.61,
        0.022,
        mat("#7e8284", { metalness: 0.8, roughness: 0.42 }),
        24,
      );
      brake.rotation.z = Math.PI / 2;
      brake.position.x = side * 0.055;
      wheel.add(brake);
      for (let k = 0; k < 10; k++) {
        const spoke = box(
          0.035,
          radius * 0.77,
          0.028,
          chrome,
          side * 0.115,
          0,
          0,
        );
        spoke.rotation.x = (k * Math.PI) / 5;
        spoke.position.y = Math.cos((k * Math.PI) / 5) * radius * 0.36;
        spoke.position.z = Math.sin((k * Math.PI) / 5) * radius * 0.36;
        wheel.add(spoke);
      }
      const rim = new T.Mesh(
        new T.TorusGeometry(radius - 0.115, 0.018, 6, 32),
        chrome,
      );
      rim.rotation.y = Math.PI / 2;
      rim.position.x = side * 0.12;
      wheel.add(rim);
      const steering = mountWheel(
        wheel,
        new T.Vector3(side * (w - 0.015), radius, z),
      );
      g.add(steering);
      wheels.push(steering);
    }
  g.add(batchStatic(fixed));
  g.userData = {
    wheels,
    paint,
    vehicleId: id,
    footprint: { hx: w + 0.2, hz: l + (v.style === "suv" ? 0.26 : 0.15) },
    radius,
  };
  return g;
}
export function palm(height = 10, lean = 0.8) {
  const g = new T.Group();
  for (let i = 0; i < 7; i++) {
    const trunk = cylinder(
      0.18 + (7 - i) * 0.024,
      0.21 + (7 - i) * 0.026,
      height / 7 + 0.08,
      materials.trunk,
      7,
    );
    trunk.position.set(lean * (i / 7) ** 2, ((i + 0.5) * height) / 7, 0);
    trunk.rotation.z = (-lean * i) / (height * 3);
    g.add(trunk);
  }
  for (let k = 0; k < 12; k++) {
    const ang = (k * Math.PI * 2) / 12;
    const vertices = [],
      indices = [];
    for (let j = 0; j <= 40; j++) {
      const t = j / 40,
        r = t * 4.8,
        w = Math.sin(Math.PI * t) * (j % 2 ? 0.08 : 0.62) + 0.008;
      const y = height + Math.sin(t * Math.PI) * 1.3 - t * t * 1.4;
      for (const side of [-1, 1])
        vertices.push(
          lean + Math.sin(ang) * r + Math.cos(ang) * w * side,
          y,
          Math.cos(ang) * r - Math.sin(ang) * w * side,
        );
      if (j < 40) {
        const n = j * 2;
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const mesh = new T.Mesh(geo, materials.leaf);
    mesh.castShadow = true;
    g.add(mesh);
  }
  return g;
}
export function textSign(text, color = "#ffb6d4", bg = "#273c53", width = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, 128);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 7, width - 14, 114);
  ctx.font = "bold 61px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 13;
  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, 67, width - 40);
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  return new T.MeshBasicMaterial({ map: texture, toneMapped: false });
}
