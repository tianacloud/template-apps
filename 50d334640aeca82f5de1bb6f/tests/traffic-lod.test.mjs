import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { trafficLod } from "../src/traffic-lod.js";
import { mountWheel, rollWheels } from "../src/wheels.js";
import { vehicleBody } from "../src/physics.js";

function makeDetail() {
  const detail = new T.Group();
  const wheel = mountWheel(new T.Group(), new T.Vector3(1, .4, 1));
  detail.add(wheel);
  detail.userData = { wheels: [wheel], radius: .4, vehicleId: "car", footprint: { hx: 1, hz: 2 } };
  return detail;
}
const vehicle = { color: "#ffffff", width: 2, length: 4, height: 1.5 };

test("distant traffic retains identity, collision and synchronized wheels", () => {
  const detail = makeDetail();
  const model = trafficLod(detail, vehicle);
  model.position.set(12, 0, 25);
  model.rotation.y = .5;
  assert.deepEqual(vehicleBody(model), { x: 12, z: 25, heading: .5, hx: 1, hz: 2 });
  assert.equal(model.userData.vehicleId, "car");
  assert.equal(model.userData.wheels.length, 5);
  rollWheels(model, .4, .2);
  for (const wheel of model.userData.wheels) {
    assert.equal(wheel.userData.rolling.rotation.x, 1);
    assert.equal(wheel.rotation.y, wheel.position.z > 0 ? .2 : 0);
  }
});

test("camera distance selects detailed and low-detail visuals without removing either", () => {
  const detail = makeDetail();
  const model = trafficLod(detail, vehicle, 45);
  const camera = new T.PerspectiveCamera();
  model.updateMatrixWorld(true);
  camera.position.set(0, 0, 10); camera.updateMatrixWorld(true); model.update(camera);
  assert.equal(model.levels[0].object.visible, true);
  assert.equal(model.levels[1].object.visible, false);
  camera.position.set(0, 0, 100); camera.updateMatrixWorld(true); model.update(camera);
  assert.equal(model.levels[0].object.visible, false);
  assert.equal(model.levels[1].object.visible, true);
  camera.position.set(0, 0, 10); camera.updateMatrixWorld(true); model.update(camera);
  assert.equal(model.levels[0].object.visible, true);
});
