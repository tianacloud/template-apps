// Substeps keep collision and steering stable while allowing slow renderers to
// advance more than one 100 ms simulation step per rendered frame. Bound the
// catch-up after long stalls rather than teleporting across the city.
export function simulationSteps(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return [];
  const duration = Math.min(milliseconds / 1000, 1.5);
  const count = Math.ceil(duration / 0.05);
  return Array(count).fill(duration / count);
}
