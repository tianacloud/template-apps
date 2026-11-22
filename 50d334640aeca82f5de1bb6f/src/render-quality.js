// Adjust only rendering resolution when sustained frame times are slow. The
// scene, materials, lighting, shadows and simulation remain unchanged.
export function createRenderQuality(maxRatio) {
  const ratios = [maxRatio, maxRatio * 0.75, maxRatio * 0.5];
  let level = 0, slow = 0, fast = 0;
  return {
    get ratio() { return ratios[level]; },
    sample(milliseconds) {
      if (!Number.isFinite(milliseconds) || milliseconds <= 0) return false;
      slow = milliseconds > 120 ? slow + 1 : 0;
      fast = milliseconds < 30 ? fast + 1 : 0;
      if (slow >= 5 && level < ratios.length - 1) {
        level++; slow = fast = 0; return true;
      }
      if (fast >= 180 && level > 0) {
        level--; slow = fast = 0; return true;
      }
      return false;
    },
    resetSamples() { slow = fast = 0; },
  };
}
