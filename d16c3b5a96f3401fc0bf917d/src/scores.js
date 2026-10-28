export function createScoreStore(execute, appId) {
  if (typeof appId !== 'string' || !appId.trim()) throw new Error('应用身份未就绪，请重新打开应用。');
  async function load() {
    const result = await execute('SELECT scenario_id, total, grade, mttr, impact, ts FROM oncall_scores WHERE app_id = ?', [appId]);
    return Object.fromEntries(result.rows.map(row => [row.scenario_id, {
      total: Number(row.total), grade: row.grade, mttr: Number(row.mttr),
      impact: Number(row.impact), ts: Number(row.ts),
    }]));
  }
  async function save(scenarioId, record) {
    if (!['pool', 'avalanche', 'oom', 'payblackhole'].includes(scenarioId) ||
        ![record.total, record.mttr, record.impact, record.ts].every(Number.isSafeInteger) ||
        record.total < 0 || record.total > 100 || record.mttr < 0 || record.impact < 0 ||
        !['S', 'A', 'B', 'C', 'D'].includes(record.grade)) throw new Error('成绩内容无效，未保存。');
    try {
      await execute(`INSERT INTO oncall_scores (app_id, scenario_id, total, grade, mttr, impact, ts)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (app_id, scenario_id) DO UPDATE SET
          total = excluded.total, grade = excluded.grade, mttr = excluded.mttr,
          impact = excluded.impact, ts = excluded.ts
        WHERE excluded.total > oncall_scores.total`,
      [appId, scenarioId, record.total, record.grade, record.mttr, record.impact, record.ts]);
    } catch (error) {
      // Verify a possibly committed write without replay or local fallback.
      const actual = await load();
      if (actual[scenarioId]?.total >= record.total) return actual;
      throw error;
    }
    return load();
  }
  return {load, save};
}
