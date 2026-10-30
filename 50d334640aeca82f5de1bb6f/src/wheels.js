import { Group } from "three";

export function mountWheel(rolling, position) {
  const steering = new Group();
  steering.position.copy(position);
  steering.add(rolling);
  steering.userData.rolling = rolling;
  return steering;
}

export function rollWheels(model, distance, steeringAngle = 0) {
  for (const wheel of model.userData.wheels) {
    wheel.rotation.y = wheel.position.z > 0 ? steeringAngle : 0;
    wheel.userData.rolling.rotation.x += distance / model.userData.radius;
  }
}
