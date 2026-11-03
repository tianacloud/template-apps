import * as T from "three";
import { mountWheel } from "./wheels.js";
import { batchStatic } from "./models.js";

// Distant traffic keeps its motion, footprint and recognizable silhouette. The
// original detailed model is always used near the camera and on vehicle takeover.
export function trafficLod(detail, vehicle, distance = 45) {
  const low = new T.Group(), body = new T.Group();
  const paint = new T.MeshStandardMaterial({ color: vehicle.color, roughness: 0.3, metalness: 0.65 });
  const glass = new T.MeshStandardMaterial({ color: "#627980", roughness: 0.18, metalness: 0.3 });
  const rubber = new T.MeshStandardMaterial({ color: "#161d26", roughness: 0.8 });
  const light = new T.MeshStandardMaterial({ color: "#fff0d4", emissive: "#ffedc7", emissiveIntensity: 0.7 });
  const rear = new T.MeshStandardMaterial({ color: "#a51622", emissive: "#ff2932", emissiveIntensity: 1.2 });
  const addBox = (width, height, length, material, x, y, z) => {
    const mesh = new T.Mesh(new T.BoxGeometry(width, height, length), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    body.add(mesh);
  };
  const w = vehicle.width, l = vehicle.length, h = vehicle.height;
  addBox(w, h * 0.36, l, paint, 0, h * 0.35, 0);
  addBox(w * 0.82, h * 0.34, l * 0.46, glass, 0, h * 0.7, -l * 0.06);
  addBox(w * 0.86, h * 0.06, l * 0.48, paint, 0, h * 0.9, -l * 0.06);
  for (const side of [-1, 1]) {
    addBox(w * 0.22, 0.12, 0.05, light, side * w * 0.31, h * 0.4, l / 2);
    addBox(w * 0.22, 0.12, 0.05, rear, side * w * 0.31, h * 0.4, -l / 2);
  }
  low.add(batchStatic(body));
  const lowWheels = [];
  const radius = detail.userData.radius;
  const tireGeometry = new T.CylinderGeometry(radius, radius, w * 0.12, 10);
  tireGeometry.rotateZ(Math.PI / 2);
  for (const x of [-w * 0.46, w * 0.46]) for (const z of [-l * 0.31, l * 0.31]) {
    const tire = new T.Mesh(tireGeometry, rubber);
    tire.castShadow = true;
    const wheel = mountWheel(tire, new T.Vector3(x, radius, z));
    low.add(wheel);
    lowWheels.push(wheel);
  }
  const lod = new T.LOD();
  lod.addLevel(detail, 0);
  lod.addLevel(low, distance, 0.1);
  lod.userData = { ...detail.userData, wheels: [...detail.userData.wheels, ...lowWheels] };
  return lod;
}
