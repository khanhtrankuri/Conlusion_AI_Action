import { CurriculumDay, QuizQuestion } from '../types/curriculum';
import { PHASE1_CURRICULUM } from './phase1Curriculum';
import { PHASE2_CURRICULUM } from './phase2Curriculum';
import { PHASE2_QUESTIONS_PART1 } from './phase2QuestionsPart1';
import { PHASE2_QUESTIONS_PART2 } from './phase2QuestionsPart2';
import { PHASE2_QUESTIONS_PART3 } from './phase2QuestionsPart3';
import { PHASE2_QUESTIONS_PART4 } from './phase2QuestionsPart4';

export const PHASE2_QUESTIONS: QuizQuestion[] = [
  ...PHASE2_QUESTIONS_PART1,
  ...PHASE2_QUESTIONS_PART2,
  ...PHASE2_QUESTIONS_PART3,
  ...PHASE2_QUESTIONS_PART4,
];

export const ALL_CURRICULUM_DAYS: CurriculumDay[] = [
  ...PHASE2_CURRICULUM,
  ...PHASE1_CURRICULUM,
];

export { PHASE1_CURRICULUM, PHASE2_CURRICULUM };
