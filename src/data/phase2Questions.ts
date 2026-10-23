import { CurriculumDay, QuizQuestion } from '../types/curriculum';
import { PHASE1_CURRICULUM } from './phase1Curriculum';
import { PHASE2_CURRICULUM } from './phase2Curriculum';
import { PHASE2_QUESTIONS_PART1 } from './phase2QuestionsPart1';
import { PHASE2_QUESTIONS_PART2 } from './phase2QuestionsPart2';
import { PHASE2_QUESTIONS_PART3 } from './phase2QuestionsPart3';
import { PHASE2_QUESTIONS_PART4 } from './phase2QuestionsPart4';
import { PHASE2_PROJECT_QUESTIONS_PART1 } from './phase2ProjectQuestionsPart1';
import { PHASE2_PROJECT_QUESTIONS_PART2 } from './phase2ProjectQuestionsPart2';
import { PHASE2_PROJECT_QUESTIONS_PART3 } from './phase2ProjectQuestionsPart3';
import { PHASE2_PROJECT_QUESTIONS_PART4 } from './phase2ProjectQuestionsPart4';

const corePhase2WithCategory: QuizQuestion[] = [
  ...PHASE2_QUESTIONS_PART1,
  ...PHASE2_QUESTIONS_PART2,
  ...PHASE2_QUESTIONS_PART3,
  ...PHASE2_QUESTIONS_PART4,
].map((q, idx) => ({
  ...q,
  questionCategory:
    q.questionCategory ||
    (idx % 3 === 0
      ? 'theory_math'
      : idx % 3 === 1
        ? 'architecture'
        : 'production_project'),
}));

export const PHASE2_QUESTIONS: QuizQuestion[] = [
  ...corePhase2WithCategory,
  ...PHASE2_PROJECT_QUESTIONS_PART1,
  ...PHASE2_PROJECT_QUESTIONS_PART2,
  ...PHASE2_PROJECT_QUESTIONS_PART3,
  ...PHASE2_PROJECT_QUESTIONS_PART4,
];

export const ALL_CURRICULUM_DAYS: CurriculumDay[] = [
  ...PHASE2_CURRICULUM,
  ...PHASE1_CURRICULUM,
];

export { PHASE1_CURRICULUM, PHASE2_CURRICULUM };
