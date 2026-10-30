import test from "node:test";
import assert from "node:assert/strict";
import { Group, Vector3 } from "three";
import { mountWheel, rollWheels } from "../src/wheels.js";

test("steering keeps each wheel axle fixed while its rim rolls forwards and backwards", () => {
  const car = new Group();
  const wheels = [-1, 1].flatMap((z) =>
    [-1, 1].map((x) => {
      const wheel = mountWheel(new Group(), new Vector3(x, 0.35, z));
      car.add(wheel);
      return wheel;
    }),
  );
  car.userData = { wheels, radius: 0.35 };
  for (const steering of [-0.4, 0, 0.4]) {
    for (const distance of [0.13, 0.6, -0.4, 2, -6, 12]) {
      rollWheels(car, distance, steering);
      car.updateMatrixWorld(true);
      for (const wheel of wheels) {
        const expected = new Vector3(1, 0, 0).applyAxisAngle(
          new Vector3(0, 1, 0),
          wheel.position.z > 0 ? steering : 0,
        );
        const axle = new Vector3(1, 0, 0).transformDirection(
          wheel.userData.rolling.matrixWorld,
        );
        assert.ok(axle.distanceTo(expected) < 1e-12);
        assert.ok(
          wheel.userData.rolling
            .getWorldPosition(new Vector3())
            .distanceTo(wheel.position) < 1e-12,
        );
      }
    }
  }
});
