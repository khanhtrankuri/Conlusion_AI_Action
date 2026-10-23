export type PhaseId = 'phase1' | 'phase2';

export type StudyStatus = 'completed' | 'half' | 'in_progress' | 'not_started';

export type QuestionCategory =
  | 'all'
  | 'theory_math'
  | 'architecture'
  | 'production_project'
  | 'debugging_edge_case';

export interface MathFormula {
  name: string;
  expression: string;
  variables: Array<{
    symbol: string;
    meaning: string;
  }>;
  intuition: string;
}

export interface ArchitectureNode {
  stage: string;
  title: string;
  tensorSpec: string;
  description: string;
}

export interface ArchitectureDiagram {
  title: string;
  asciiDiagram: string;
  nodes: ArchitectureNode[];
  bottleneckNote: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface TheorySection {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  productionTip?: string;
}

export interface ProductionPlaybook {
  dayId: string;
  projectTitle: string;
  systemScaleSpec: string;
  latencyAndMemorySLA: string[];
  architectureDecisions: Array<{
    decision: string;
    rationale: string;
    tradeoff: string;
  }>;
  failureModesAndFixes: Array<{
    symptom: string;
    rootCause: string;
    engineeringFix: string;
  }>;
}

export interface CurriculumDay {
  id: string;
  phase: PhaseId;
  dayNumber: number;
  codeLabel: string;
  title: string;
  subtitle: string;
  category: string;
  defaultStatus: StudyStatus;
  defaultProgress: number;
  keyIdea: string;
  formulas: MathFormula[];
  architecture: ArchitectureDiagram;
  sections: TheorySection[];
  comparisonTable: ComparisonTable;
  markdownPath?: string;
}

export interface QuizQuestion {
  id: string;
  phase: PhaseId;
  day: string;
  day_title: string;
  topic: string;
  difficulty?: 'Cơ bản' | 'Thực chiến' | 'Chuyên sâu';
  questionCategory?: Exclude<QuestionCategory, 'all'>;
  projectScenario?: string;
  question: string;
  options: string[];
  answer: 'A' | 'B' | 'C' | 'D';
  hint: string;
  explanation: string;
  'A explanation'?: string;
  'B explanation'?: string;
  'C explanation'?: string;
  'D explanation'?: string;
  formulaRef?: string;
}

export interface AttemptRecord {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timestamp: number;
}

export interface TopicAccuracyItem {
  dayId: string;
  dayTitle: string;
  phase: PhaseId;
  total: number;
  correct: number;
  accuracy: number;
}

export interface ExamResult {
  id: string;
  title: string;
  mode: 'strict_exam' | 'quick_quiz' | 'day_drill' | 'mistake_retest';
  phaseFilter: 'all' | 'phase1' | 'phase2';
  totalQuestions: number;
  correctCount: number;
  score100: number;
  timeLimitSeconds: number;
  timeElapsedSeconds: number;
  autoSubmitted: boolean;
  completedAt: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  questionIds: string[];
  flaggedIds: string[];
  topicBreakdown: TopicAccuracyItem[];
}
