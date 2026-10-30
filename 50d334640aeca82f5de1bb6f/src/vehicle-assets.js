import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { mountWheel } from "./wheels.js";
import { VEHICLES } from "./state.js";
const assets = new Map();
export async function loadVehicles(assetBlobs) {
  const loader = new GLTFLoader();
  await Promise.all(
    ["comet", "sedan", "suv", "pickup", "van"].map(async (id) => {
      const file = id === "comet" ? "concept" : id;
      const blob = assetBlobs.get(`vehicles/${file}.glb.bin`);
      const bytes = await new Response(
        blob.stream().pipeThrough(new DecompressionStream("gzip")),
      ).arrayBuffer();
      const { scene } = await loader.parseAsync(bytes, "");
      assets.set(id, scene);
    }),
  );
}
export function detailedCar(id, color) {
  const vehicle = VEHICLES.find((v) => v.id === id);
  const root = new T.Group(),
    source = assets.get(id).clone(true);
  if (id !== "comet") source.rotation.y = Math.PI / 2;
  const remove = [];
  source.traverse((o) => {
    if (/License|Emblem/.test(o.name)) remove.push(o);
  });
  for (const o of remove) o.removeFromParent();
  source.updateMatrixWorld(true);
  const bounds = new T.Box3().setFromObject(source),
    size = bounds.getSize(new T.Vector3()),
    center = bounds.getCenter(new T.Vector3());
  const scale = vehicle.length / size.z;
  const normalize = new T.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(
      new T.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z),
    );
  const wheels = [],
    materials = new Map();
  const materialFor = (m) => {
    if (!materials.has(m.uuid)) {
      let copy = m.clone();
      if (copy.name.startsWith("Paint 1") || copy.name === "paint") {
        copy = new T.MeshPhysicalMaterial({
          name: m.name,
          clearcoat: 1,
          clearcoatRoughness: 0.15,
        });
        copy.color.set(color);
        copy.metalness = 0.65;
        copy.roughness = 0.3;
        copy.iridescence = 0;
        copy.normalMap = null;
      }
      if (copy.name === "Glass") {
        copy.transmission = 0;
        copy.color.set("#46606b");
        copy.metalness = 0.6;
        copy.roughness = 0.16;
        copy.transparent = false;
        copy.opacity = 1;
      }
      if (/glass/i.test(copy.name) && id !== "comet") {
        copy.map = null;
        copy.color.set("#627980");
        copy.metalness = 0.3;
        copy.roughness = 0.1;
        copy.transparent = true;
        copy.opacity = 0.52;
        copy.depthWrite = false;
      }
      materials.set(m.uuid, copy);
    }
    return materials.get(m.uuid);
  };
  function bake(objects, offset = new T.Vector3()) {
    const buckets = new Map(),
      group = new T.Group();
    for (const o of objects) {
      const mat = materialFor(o.material),
        key = mat.uuid;
      let geo = o.geometry.index
        ? o.geometry.toNonIndexed()
        : o.geometry.clone();
      // Decode normalized/interleaved attributes before baking world transforms.
      for (const name of ["position", "normal", "uv"]) {
        const attribute = geo.getAttribute(name);
        if (!attribute) continue;
        const values = new Float32Array(attribute.count * attribute.itemSize);
        for (let i = 0; i < attribute.count; i++)
          for (let c = 0; c < attribute.itemSize; c++)
            values[i * attribute.itemSize + c] = attribute.getComponent(i, c);
        geo.setAttribute(
          name,
          new T.BufferAttribute(values, attribute.itemSize),
        );
      }
      geo.applyMatrix4(normalize.clone().multiply(o.matrixWorld));
      geo.translate(-offset.x, -offset.y, -offset.z);
      if (!geo.getAttribute("uv"))
        geo.setAttribute(
          "uv",
          new T.Float32BufferAttribute(
            new Float32Array(geo.getAttribute("position").count * 2),
            2,
          ),
        );
      for (const name of Object.keys(geo.attributes))
        if (!["position", "normal", "uv"].includes(name))
          geo.deleteAttribute(name);
      if (!buckets.has(key)) buckets.set(key, { mat, geos: [] });
      buckets.get(key).geos.push(geo);
    }
    for (const { mat, geos } of buckets.values()) {
      const geo = mergeGeometries(geos);
      for (const g of geos) g.dispose();
      const mesh = new T.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    return group;
  }
  const wheelMeshes = new Set();
  let radius;
  if (id === "comet") {
    for (const name of [
      "WheelFrontL",
      "WheelFrontR",
      "WheelRearL",
      "WheelRearR",
    ]) {
      const node = source.getObjectByName(name),
        objects = [];
      node.traverse((o) => {
        if (o.isMesh) {
          objects.push(o);
          wheelMeshes.add(o);
        }
      });
      const pivot = node
        .getWorldPosition(new T.Vector3())
        .applyMatrix4(normalize);
      const rolling = bake(objects, pivot);
      if (name.includes("Front"))
        for (const mesh of rolling.children) mesh.geometry.rotateY(Math.PI / 6);
      const steering = mountWheel(rolling, pivot);
      root.add(steering);
      wheels.push(steering);
    }
    radius = 0.38 * scale;
  } else {
    const tires = [],
      rotating = [],
      calipers = [];
    source.traverse((o) => {
      if (!o.isMesh) return;
      if (/Sculpted_tyre/.test(o.name)) tires.push(o);
      if (/^107_reused_|Brake_rotor/.test(o.name)) rotating.push(o);
      if (/Brake_caliper/.test(o.name)) calipers.push(o);
    });
    const centers = tires.map((o) =>
      new T.Box3().setFromObject(o).getCenter(new T.Vector3()),
    );
    const closest = (o) => {
      const center = new T.Box3().setFromObject(o).getCenter(new T.Vector3());
      return centers.reduce(
        (best, p, i) =>
          center.distanceToSquared(p) < center.distanceToSquared(centers[best])
            ? i
            : best,
        0,
      );
    };
    for (let i = 0; i < tires.length; i++) {
      const objects = rotating.filter((o) => closest(o) === i);
      const brakes = calipers.filter((o) => closest(o) === i);
      for (const o of [...objects, ...brakes]) wheelMeshes.add(o);
      const pivot = centers[i].clone().applyMatrix4(normalize);
      const steering = mountWheel(bake(objects, pivot), pivot);
      steering.add(bake(brakes, pivot));
      root.add(steering);
      wheels.push(steering);
    }
    radius =
      (new T.Box3().setFromObject(tires[0]).getSize(new T.Vector3()).y *
        scale) /
      2;
  }
  const body = [];
  source.traverse((o) => {
    if (o.isMesh && !wheelMeshes.has(o)) body.push(o);
  });
  root.add(bake(body));
  const finalSize = new T.Box3().setFromObject(root).getSize(new T.Vector3());
  root.userData = {
    wheels,
    paint: [...materials.values()].find(
      (m) => m.name.startsWith("Paint 1") || m.name === "paint",
    ),
    vehicleId: id,
    footprint: {
      hx: finalSize.x / 2 + 0.05,
      hz: vehicle.length / 2 + 0.05,
    },
    radius,
  };
  return root;
}
