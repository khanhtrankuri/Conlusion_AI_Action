import {
  AttemptRecord,
  CurriculumDay,
  ExamResult,
  PhaseId,
  QuizQuestion,
  StudyStatus,
  TopicAccuracyItem,
} from '../types/curriculum';
import { ALL_CURRICULUM_DAYS, PHASE2_QUESTIONS } from '../data/phase2Questions';

const STORAGE_KEYS = {
  DAY_STATUS: 'vin20k_day_status_v1',
  ATTEMPTS: 'vin20k_attempts_v1',
  BOOKMARKS: 'vin20k_bookmarks_v1',
  EXAM_HISTORY: 'vin20k_exam_history_v1',
};

let cachedPhase1Questions: QuizQuestion[] | null = null;

export async function loadAllQuestions(): Promise<QuizQuestion[]> {
  if (cachedPhase1Questions) {
    return [...PHASE2_QUESTIONS, ...cachedPhase1Questions];
  }

  try {
    const res = await fetch('/data/phase1_questions.json');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const raw = (await res.json()) as Array<Omit<QuizQuestion, 'phase'>>;
    cachedPhase1Questions = raw.map((q) => ({
      ...q,
      id: `P1_${q.id}`,
      phase: 'phase1' as PhaseId,
      difficulty:
        Number(q.id) % 3 === 0
          ? 'Chuyên sâu'
          : Number(q.id) % 2 === 0
            ? 'Thực chiến'
            : 'Cơ bản',
    }));
    return [...PHASE2_QUESTIONS, ...cachedPhase1Questions];
  } catch (err) {
    console.error('Could not load phase1_questions.json, falling back to Phase 2:', err);
    return [...PHASE2_QUESTIONS];
  }
}

export function getInitialDayStatusMap(): Record<string, StudyStatus> {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAY_STATUS);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, StudyStatus>;
      const merged: Record<string, StudyStatus> = {};
      for (const day of ALL_CURRICULUM_DAYS) {
        merged[day.id] = parsed[day.id] || day.defaultStatus;
      }
      return merged;
    }
  } catch (e) {
    console.warn('Error reading day status from localStorage:', e);
  }

  const defaults: Record<string, StudyStatus> = {};
  for (const day of ALL_CURRICULUM_DAYS) {
    defaults[day.id] = day.defaultStatus;
  }
  return defaults;
}

export function saveDayStatusMap(map: Record<string, StudyStatus>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAY_STATUS, JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving day status:', e);
  }
}

export function statusToProgress(status: StudyStatus): number {
  switch (status) {
    case 'completed':
      return 100;
    case 'half':
      return 50;
    case 'in_progress':
      return 25;
    case 'not_started':
    default:
      return 0;
  }
}

export function statusToLabel(status: StudyStatus): string {
  switch (status) {
    case 'completed':
      return '100%';
    case 'half':
      return '50%';
    case 'in_progress':
      return 'ĐANG HỌC...';
    case 'not_started':
    default:
      return 'CHƯA HỌC';
  }
}

export function cycleStudyStatus(current: StudyStatus): StudyStatus {
  const order: StudyStatus[] = ['not_started', 'in_progress', 'half', 'completed'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export function getAttemptsMap(): Record<string, AttemptRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return raw ? (JSON.parse(raw) as Record<string, AttemptRecord>) : {};
  } catch {
    return {};
  }
}

export function saveAttemptsMap(map: Record<string, AttemptRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving attempts:', e);
  }
}

export function getBookmarkedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveBookmarkedIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(ids));
  } catch (e) {
    console.warn('Error saving bookmarks:', e);
  }
}

export function getExamHistory(): ExamResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
    return raw ? (JSON.parse(raw) as ExamResult[]) : [];
  } catch {
    return [];
  }
}

export function saveExamHistory(history: ExamResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.warn('Error saving exam history:', e);
  }
}

export function clearAllStudyData(): void {
  localStorage.removeItem(STORAGE_KEYS.DAY_STATUS);
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
  localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
  localStorage.removeItem(STORAGE_KEYS.EXAM_HISTORY);
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface BuildExamOptions {
  allQuestions: QuizQuestion[];
  phaseFilter: 'all' | 'phase1' | 'phase2';
  dayFilter: string; // 'ALL' or day.id e.g. 'P2_D01', 'Day 01', 'Track 01', etc.
  questionCount: number;
  onlyMistakes?: boolean;
  onlyBookmarked?: boolean;
  attemptsMap?: Record<string, AttemptRecord>;
  bookmarkedIds?: string[];
  shuffle?: boolean;
}

export function buildExamQuestions(opts: BuildExamOptions): QuizQuestion[] {
  let pool = opts.allQuestions;

  if (opts.phaseFilter !== 'all') {
    pool = pool.filter((q) => q.phase === opts.phaseFilter);
  }

  if (opts.dayFilter && opts.dayFilter !== 'ALL') {
    pool = pool.filter((q) => q.day === opts.dayFilter);
  }

  if (opts.onlyMistakes && opts.attemptsMap) {
    const wrongIds = new Set(
      Object.values(opts.attemptsMap)
        .filter((a) => !a.isCorrect)
        .map((a) => a.questionId)
    );
    pool = pool.filter((q) => wrongIds.has(q.id));
  }

  if (opts.onlyBookmarked && opts.bookmarkedIds) {
    const bmSet = new Set(opts.bookmarkedIds);
    pool = pool.filter((q) => bmSet.has(q.id));
  }

  const ordered = opts.shuffle !== false ? shuffleArray(pool) : [...pool];
  return ordered.slice(0, Math.max(1, Math.min(opts.questionCount, ordered.length)));
}

export function computeTopicBreakdown(
  questions: QuizQuestion[],
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>
): TopicAccuracyItem[] {
  const byDay = new Map<
    string,
    { dayId: string; dayTitle: string; phase: PhaseId; total: number; correct: number }
  >();

  for (const q of questions) {
    const existing = byDay.get(q.day) || {
      dayId: q.day,
      dayTitle: q.day_title,
      phase: q.phase,
      total: 0,
      correct: 0,
    };
    existing.total += 1;
    if (answers[q.id] === q.answer) {
      existing.correct += 1;
    }
    byDay.set(q.day, existing);
  }

  return Array.from(byDay.values()).map((item) => ({
    ...item,
    accuracy: item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0,
  }));
}

export function getCurriculumDayForQuestion(dayCode: string): CurriculumDay | undefined {
  return ALL_CURRICULUM_DAYS.find((d) => d.id === dayCode);
}
