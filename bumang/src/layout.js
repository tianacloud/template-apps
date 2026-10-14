// Side-by-side columns for overlapping timeline blocks.
export function columns(blocks) {
  const sorted = [...blocks].sort((a, b) => a.start - b.start || b.duration - a.duration || (a.id < b.id ? -1 : 1));
  const placed = new Map();
  let cluster = [], clusterEnd = -1, lanes = [];
  const flush = () => {
    for (const item of cluster) placed.get(item.id).lanes = lanes.length;
    cluster = [];
    lanes = [];
  };
  for (const block of sorted) {
    if (block.start >= clusterEnd) flush();
    let lane = lanes.findIndex((end) => end <= block.start);
    if (lane < 0) lane = lanes.push(0) - 1;
    lanes[lane] = block.start + block.duration;
    clusterEnd = Math.max(clusterEnd, lanes[lane]);
    cluster.push(block);
    placed.set(block.id, { lane, lanes: 1 });
  }
  flush();
  return placed;
}
export const QUADRANTS = [
  { key: "q1", important: true, urgent: true, name: "马上做", tags: "重要 · 紧急" },
  { key: "q2", important: true, urgent: false, name: "安排做", tags: "重要 · 不紧急" },
  { key: "q3", important: false, urgent: true, name: "快速做", tags: "紧急 · 不重要" },
  { key: "q4", important: false, urgent: false, name: "放一放", tags: "不重要 · 不紧急" },
];
export const quadrantOf = (task) => QUADRANTS.find((q) => q.important === task.important && q.urgent === task.urgent);
export const SNAP = 15;
export const snap = (minute, step = SNAP) => Math.round(minute / step) * step;
export const clampStart = (start, duration) => Math.max(0, Math.min(1440 - duration, start));
