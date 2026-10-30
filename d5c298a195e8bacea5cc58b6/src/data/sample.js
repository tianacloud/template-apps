// Synthetic sample records for the preview page, dated relative to today.
import { BUILT_IN_TASKS } from './constants.js';
import { dateKey } from '../utils.js';

const art = (bg, emoji) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="${bg}"/><circle cx="48" cy="52" r="26" fill="#fff" opacity=".55"/><text x="48" y="62" font-size="30" text-anchor="middle">${emoji}</text></svg>`);

export function sample() {
  const day = offset => { const d = new Date(); d.setDate(d.getDate() - offset); return dateKey(d); };
  const at = offset => Date.now() - offset * 86400000;
  const tasks = [
    ...BUILT_IN_TASKS.map(t => ({ ...t })),
    { id: 'sample-run', name: '跑步30分钟', coins: 4, isBuiltIn: false, category: '健身篇' },
    { id: 'sample-guitar', name: '练琴20分钟', coins: 3, isBuiltIn: false, category: '技能篇' },
  ];
  const snap = (task, count) => ({ taskId: task.id, taskName: task.name, coins: task.coins, category: task.category, count });
  const entry = (offset, mood, content, picks, photos = []) => {
    const snapshots = picks.map(([i, n]) => snap(tasks[i], n));
    const quantities = Object.fromEntries(snapshots.map(s => [s.taskId, s.count]));
    return { id: `sample-diary-${offset}`, date: day(offset), content, mood, completedTaskIds: Object.keys(quantities), quantities, snapshots,
      earnedCoins: snapshots.reduce((sum, s) => sum + s.coins * s.count, 0), photos, createdAt: at(offset), updatedAt: at(offset) };
  };
  const diaries = [
    entry(3, 'calm', '<span class="font-serif">早上背了单词，晚上把错题本整理了一遍。</span>', [[0, 1], [2, 1]]),
    entry(2, 'excited', '<span class="font-serif">卷子拿了高分！奖励自己去公园跑了一圈。</span>', [[1, 1], [3, 1]], [{ id: 'p-sample-1', dataUrl: art('#FFE7CF', '🏃') }]),
    entry(1, 'happy', '<span class="font-serif">网课听完两节，练琴也终于弹顺了一小段。</span>', [[0, 2], [4, 1]], [{ id: 'p-sample-2', dataUrl: art('#E5E1EE', '🎸') }]),
  ];
  const earned = diaries.reduce((sum, d) => sum + d.earnedCoins, 0);
  return {
    totalCoins: earned,
    tasks,
    diaries,
    rewards: [
      { id: 'sample-reward-1', name: '一杯奶茶', requiredCoins: 30, redeemed: false, createdAt: at(5) },
      { id: 'sample-reward-2', name: '一本新书', requiredCoins: 60, redeemed: false, createdAt: at(4) },
    ],
  };
}
