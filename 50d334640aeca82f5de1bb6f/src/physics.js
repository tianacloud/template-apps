// Oriented footprints are shared by player cars, traffic, parked cars and scenery.
export function overlap(a, b) {
  const aa = a.heading || 0,
    ba = b.heading || 0;
  const ax = { x: Math.cos(aa), z: -Math.sin(aa) },
    az = { x: Math.sin(aa), z: Math.cos(aa) };
  const bx = { x: Math.cos(ba), z: -Math.sin(ba) },
    bz = { x: Math.sin(ba), z: Math.cos(ba) };
  for (const n of [ax, az, bx, bz]) {
    const ra =
      a.hx * Math.abs(ax.x * n.x + ax.z * n.z) +
      a.hz * Math.abs(az.x * n.x + az.z * n.z);
    const rb =
      b.hx * Math.abs(bx.x * n.x + bx.z * n.z) +
      b.hz * Math.abs(bz.x * n.x + bz.z * n.z);
    if (Math.abs((b.x - a.x) * n.x + (b.z - a.z) * n.z) >= ra + rb - 0.00001)
      return false;
  }
  return true;
}
export function blockedBody(body, solids) {
  const s = Math.abs(Math.sin(body.heading || 0)),
    c = Math.abs(Math.cos(body.heading || 0));
  const ex = body.hx * c + body.hz * s,
    ez = body.hx * s + body.hz * c;
  if (
    body.x - ex < -137 ||
    body.x + ex > 154 ||
    body.z - ez < -206 ||
    body.z + ez > 206
  )
    return true;
  return solids.some((b) => overlap(body, b));
}
export function moveBody(body, dx, dz, turn, solids) {
  // Check the swept movement and rotation in small spatial increments, including at low frame rates.
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(dx, dz) / 0.18),
    Math.ceil((Math.abs(turn) * Math.hypot(body.hx, body.hz)) / 0.12),
  );
  const result = { ...body, hit: false };
  for (let i = 0; i < steps; i++) {
    const next = {
      ...result,
      x: result.x + dx / steps,
      z: result.z + dz / steps,
      heading: result.heading + turn / steps,
    };
    if (!blockedBody(next, solids)) {
      Object.assign(result, next);
      continue;
    }
    result.hit = true;
    // Keep contact tangential movement while never committing an intersecting footprint.
    const alongX = { ...result, x: result.x + dx / steps },
      alongZ = { ...result, z: result.z + dz / steps };
    if (Math.abs(dx) > 0 && !blockedBody(alongX, solids)) result.x = alongX.x;
    else if (Math.abs(dz) > 0 && !blockedBody(alongZ, solids))
      result.z = alongZ.z;
  }
  return result;
}
export function vehicleBody(model) {
  return {
    x: model.position.x,
    z: model.position.z,
    heading: model.rotation.y,
    ...model.userData.footprint,
  };
}
