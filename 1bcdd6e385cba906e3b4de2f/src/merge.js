// Apply only the changes made in this session to the latest persisted state.
// A single SQL statement serializes concurrent changes; the last committed
// operation for the same question or favorite wins, including a removal.
const text = value => ({type:'text', value:String(value)});
const integer = value => ({type:'integer', value:String(value)});
const path = (group, key) => `$.${group}.${JSON.stringify(key)}`;
export function makeUpdate(before, after) {
  const sets = [], removes = [];
  for (const group of ['archive', 'favorites']) {
    const old = before[group] || {}, next = after[group] || {};
    for (const key of new Set([...Object.keys(old), ...Object.keys(next)])) {
      if (JSON.stringify(old[key]) === JSON.stringify(next[key])) continue;
      if (!Object.hasOwn(next, key)) removes.push(path(group, key));
      else sets.push([path(group, key), JSON.stringify(next[key])]);
    }
  }
  const deltas = ['answered','correct','rounds'].map(k => [k, Number(after.stats?.[k] || 0) - Number(before.stats?.[k] || 0)]).filter(([,n]) => n !== 0);
  if (before.theme !== after.theme) sets.push(['$.theme', JSON.stringify(after.theme)]);
  if (!sets.length && !removes.length && !deltas.length) return null;
  const args = [text(JSON.stringify(after))];
  let expression = 'progress.payload';
  if (deltas.length) {
    const pieces = deltas.map(([key, delta]) => {
      args.push(text(`$.stats.${key}`), text(`$.stats.${key}`), integer(delta));
      return `?, COALESCE(json_extract(progress.payload, ?), 0) + ?`;
    });
    expression = `json_set(${expression}, ${pieces.join(', ')})`;
  }
  if (sets.length) {
    const pieces = sets.map(([key,value]) => { args.push(text(key), text(value)); return '?, json(?)'; });
    expression = `json_set(${expression}, ${pieces.join(', ')})`;
  }
  if (removes.length) {
    removes.forEach(key => args.push(text(key)));
    expression = `json_remove(${expression}, ${removes.map(() => '?').join(', ')})`;
  }
  return {sql:`INSERT INTO progress (id,payload) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET payload=${expression}`, args};
}
