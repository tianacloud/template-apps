import { cards } from '../content/cards';
import type { DailyLog, PhaseResult } from '../types';
import { toDayNumber } from './dates';

export function chooseKnowledge(date: string, phase: PhaseResult, log?: DailyLog) {
  const topical = new Set<string>();
  if (log?.painScore !== null && log?.painScore !== undefined && log.painScore > 0) topical.add('pain');
  if (log?.bleedingType || log?.flowLevel) topical.add('bleeding');
  if (log?.discharge) topical.add('discharge');
  if (log?.bowelEvents !== null && log?.bowelEvents !== undefined) topical.add('bowel');
  if (log?.intimacyEvents !== null && log?.intimacyEvents !== undefined) topical.add('intimacy');
  if (log?.sleepQuality || log?.sleepHours !== null && log?.sleepHours !== undefined) topical.add('sleep');
  if (log?.moods?.length) topical.add('moods');
  const candidates = cards.filter(c => c.phases.includes(phase.phase));
  const main = candidates[toDayNumber(date) % candidates.length] ?? cards.find(c => c.id === 'recording')!;
  const care = log && ((log.painScore ?? 0) >= 7 || log.bleedingType === 'SPOTTING' || log.bleedingType === 'UNKNOWN'
    || log.intimacyEvents?.some(e => e.discomfort || e.bleedingAfter) || log.discharge?.odor || log.discharge?.itching || log.discharge?.burning);
  const relevant = cards.filter(c => c.id !== main.id && c.topics.some(t => topical.has(t)));
  if (care) relevant.sort((a,b) => Number(b.careNotices.length > 0) - Number(a.careNotices.length > 0));
  return { main, cards: [main, ...relevant.slice(0, 2)], careNotices: care ? relevant.flatMap(c => c.careNotices).slice(0, 2) : [] };
}
