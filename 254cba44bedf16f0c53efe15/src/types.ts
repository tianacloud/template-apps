export type LocalDate = string;
export type Timestamp = string;
export type Period = {
  id: string; startDate: LocalDate; endDate: LocalDate | null; gapBefore: boolean;
  note: string | null; source: 'USER' | 'IMPORT'; createdAt: Timestamp; updatedAt: Timestamp;
};
export type BowelEvent = {
  id: string; bristolType: number | null; straining: boolean | null; pain: boolean | null; note: string | null;
};
export type IntimacyEvent = {
  id: string; protection: 'YES' | 'NO' | 'UNSURE' | null;
  discomfort: boolean | null; bleedingAfter: boolean | null; note: string | null;
};
export type Discharge = {
  present: boolean; amount: FlowLevel | null; colors: string[] | null; textures: string[] | null;
  odor: boolean | null; itching: boolean | null; burning: boolean | null;
};
export type BleedingType = 'NONE' | 'MENSTRUATION' | 'SPOTTING' | 'UNKNOWN';
export type FlowLevel = 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
export type DailyLog = {
  date: LocalDate; bleedingType: BleedingType | null; flowLevel: FlowLevel | null;
  bloodColors: string[] | null; painScore: number | null; painLocations: string[] | null;
  symptoms: string[] | null; moods: string[] | null; sleepHours: number | null;
  sleepQuality: 'POOR' | 'FAIR' | 'GOOD' | null; bowelEvents: BowelEvent[] | null;
  intimacyEvents: IntimacyEvent[] | null; discharge: Discharge | null; note: string | null;
  createdAt: Timestamp; updatedAt: Timestamp;
};
export type AbsenceConfirmation = { id: string; anchorPeriodId: string; throughDate: LocalDate; createdAt: Timestamp };
export type BleedingFact = Pick<DailyLog, 'date' | 'bleedingType'>;
export type Facts = { periods: Period[]; bleeding: BleedingFact[]; absences: AbsenceConfirmation[] };
export type CycleObservation = {
  fromId: string; toId: string; startDate: LocalDate; endDate: LocalDate; length: number;
  exclusion: 'GAP' | 'UNKNOWN_BLEEDING' | null;
};
export type ModelInput = { anchorId: string; anchorDate: LocalDate; periods: { id: string; startDate: LocalDate; gapBefore: boolean }[]; unknownDates: LocalDate[]; lengths: number[] };
export type TModel = { mean: number; sampleStd: number; scale: number; df: number; n: number; conditionOffset: number | null };
export type Prediction = {
  status: 'NO_HISTORY' | 'MEAN_ONLY' | 'PROBABILISTIC'; anchorId: string | null; anchorDate: LocalDate | null;
  input: ModelInput | null; model: TModel | null; sampleCount: number; mean: number | null;
  centerDate: LocalDate | null; windowStart: LocalDate | null; windowEnd: LocalDate | null;
  windowProbability: number | null; conditionThrough: LocalDate | null; conditionUnavailable: boolean;
  interrupted: boolean;
};
export type DurationEstimate = { days: number; sampleCount: number; currentEnd: LocalDate | null; nextEnd: LocalDate | null } | null;
export type FertilityEstimate = { peakDate: LocalDate; windowStart: LocalDate; windowEnd: LocalDate; probabilistic: boolean; validMass: number; supportUpper: number; tail: number } | null;
export type PhaseResult = {
  phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATION_REFERENCE' | 'LUTEAL' | 'UNKNOWN';
  source: 'RECORDED' | 'ESTIMATED' | 'UNKNOWN'; cycleDay: number | null; expectedBoundary: LocalDate | null; reason: string | null;
};
export type Snapshot = {
  id: string; anchorPeriodId: string; kind: 'BASE' | 'CONDITIONAL'; algorithmVersion: string;
  factsRevision: number; generatedAt: Timestamp; generatedLocalDate: LocalDate; origin: 'APP' | 'BACKUP';
  input: ModelInput; output: { prediction: Prediction; duration: DurationEstimate; fertility: FertilityEstimate;
    probabilities: { date: LocalDate; probability: number }[]; tableStart: LocalDate | null; tableEnd: LocalDate | null;
    leftTail: number; rightTail: number; supportUpper: number | null };
};
export type Evaluation = {
  snapshotId: string; anchorPeriodId: string; isBaseline: boolean;
  status: 'PENDING' | 'EVALUATED' | 'SKIPPED_GAP' | 'INVALIDATED';
  reason: string | null; targetPeriodId: string | null; targetDate: LocalDate | null;
  absoluteError: number | null; evaluatedAt: Timestamp; factsRevision: number;
};
export type Settings = { hiddenGroups?: string[] };
export type Backup = {
  format: 'zhiji'; formatVersion: 1; exportedAt: Timestamp; periods: Period[]; dailyLogs: DailyLog[];
  absenceConfirmations: AbsenceConfirmation[]; predictionSnapshots?: Snapshot[];
  predictionEvaluations?: Evaluation[]; settings?: Settings;
};
export type KnowledgeCard = {
  id: string; title: string; summary: string; paragraphs: string[]; topics: string[];
  phases: PhaseResult['phase'][]; suggestions: string[]; careNotices: string[];
  sources: { title: string; url: string }[]; reviewedAt: LocalDate;
};
export const APP_VERSION = '1.0.0';
export const ALGORITHM_VERSION = '1.0.0';
export const labels: Record<string, string> = {
  NONE: '无', MENSTRUATION: '月经', SPOTTING: '点滴出血', UNKNOWN: '不确定', LIGHT: '少', MEDIUM: '中', HEAVY: '多',
  PINK: '粉红', RED: '鲜红', DARK_RED: '暗红', BROWN: '褐色', OTHER: '其他',
  ABDOMEN: '小腹', BACK: '腰背', HEAD: '头部', BREAST: '乳房', BLOATING: '腹胀', BREAST_TENDERNESS: '乳房胀痛',
  HEADACHE: '头痛', FATIGUE: '疲劳', BACKACHE: '腰酸', NAUSEA: '恶心', ACNE: '痘痘',
  CALM: '平静', HAPPY: '愉快', LOW: '低落', ANXIOUS: '焦虑', IRRITABLE: '易怒',
  POOR: '差', FAIR: '一般', GOOD: '好', YES: '有', NO: '没有', UNSURE: '不确定',
  CLEAR: '透明', WHITE: '乳白', YELLOW: '偏黄', GREEN: '偏绿', BLOODY: '带血',
  THIN: '稀薄', WATERY: '水样', STICKY: '黏稠', STRETCHY: '可拉丝', CLUMPY: '块状',
  MENSTRUAL: '月经期', FOLLICULAR: '卵泡期', OVULATION_REFERENCE: '排卵附近', LUTEAL: '黄体期',
};
export const groups = [
  ['bleeding', '出血'], ['pain', '疼痛'], ['symptoms', '身体感受'], ['moods', '情绪'],
  ['sleep', '睡眠'], ['bowel', '便便'], ['intimacy', '爱爱'], ['discharge', '白带'],
] as const;
