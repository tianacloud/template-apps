export const topics = { school: '学校与朋友', feelings: '心里的感受', proud: '为自己骄傲', family: '我们一家', imagination: '奇思妙想' };
export const responders = { child: '孩子', dad: '爸爸', mom: '妈妈' };
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function nextAudience(audience) { return audience === 'parent' ? 'child' : 'parent'; }
export function drawQuestion(questions, audience, seen, random = Math.random) {
  const deck = questions.filter(q => q.audience === audience);
  let available = deck.filter(q => !seen.has(q.id));
  if (!available.length && deck.length) {
    for (const question of deck) seen.delete(question.id);
    available = deck;
  }
  if (!available.length) return null;
  const question = available[Math.floor(random() * available.length)];
  seen.add(question.id);
  return { ...question };
}
