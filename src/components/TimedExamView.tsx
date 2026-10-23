import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  AttemptRecord,
  CurriculumDay,
  ExamResult,
  PhaseId,
  QuestionCategory,
  QuizQuestion,
} from '../types/curriculum';
import {
  buildExamQuestions,
  categoryToLabel,
  computeTopicBreakdown,
} from '../services/studyStore';
import {
  buildQuestionLectureScript,
  LectureSegment,
} from '../services/audioTeacherService';

export interface ExamPreset {
  mode: 'strict_exam' | 'quick_quiz' | 'day_drill' | 'mistake_retest';
  phaseFilter: 'all' | 'phase1' | 'phase2';
  dayFilter: string;
  categoryFilter?: QuestionCategory;
  questionCount: number;
  timeLimitMinutes: number;
  instantFeedback: boolean;
  autoStart?: boolean;
}

interface TimedExamViewProps {
  allQuestions: QuizQuestion[];
  days: CurriculumDay[];
  attemptsMap: Record<string, AttemptRecord>;
  bookmarkedIds: string[];
  initialPreset: ExamPreset | null;
  onClearPreset: () => void;
  onRecordAttempt: (questionId: string, selected: 'A' | 'B' | 'C' | 'D', isCorrect: boolean) => void;
  onToggleBookmark: (questionId: string) => void;
  onSaveExamResult: (result: ExamResult) => void;
  onOpenTheoryDay: (dayId: string) => void;
  onPlayAudioPlaylist: (playlist: LectureSegment[], startIndex?: number) => void;
}

function formatSeconds(totalSec: number): string {
  const clamped = Math.max(0, totalSec);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const TimedExamView: React.FC<TimedExamViewProps> = ({
  allQuestions,
  days,
  attemptsMap,
  bookmarkedIds,
  initialPreset,
  onClearPreset,
  onRecordAttempt,
  onToggleBookmark,
  onSaveExamResult,
  onOpenTheoryDay,
  onPlayAudioPlaylist,
}) => {
  // Configurator state
  const [examMode, setExamMode] = useState<'strict_exam' | 'quick_quiz' | 'mistake_retest'>('strict_exam');
  const [phaseFilter, setPhaseFilter] = useState<'all' | 'phase1' | 'phase2'>('phase2');
  const [dayFilter, setDayFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<QuestionCategory>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(25);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(false);

  // Active session state
  const [sessionState, setSessionState] = useState<'config' | 'running' | 'submitted'>('config');
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(1500);
  const [totalLimitSeconds, setTotalLimitSeconds] = useState<number>(1500);
  const [lastResult, setLastResult] = useState<ExamResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'flagged'>('all');

  const submitRef = useRef<(auto: boolean) => void>(() => {});

  // Available Day options for the selected phase
  const availableDayOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of allQuestions) {
      if (phaseFilter !== 'all' && q.phase !== phaseFilter) continue;
      if (!map.has(q.day)) {
        map.set(q.day, q.day_title);
      }
    }
    return Array.from(map.entries());
  }, [allQuestions, phaseFilter]);

  const startSessionWithParams = useCallback(
    (params: {
      mode: 'strict_exam' | 'quick_quiz' | 'day_drill' | 'mistake_retest';
      phase: 'all' | 'phase1' | 'phase2';
      day: string;
      category?: QuestionCategory;
      count: number;
      minutes: number;
      instant: boolean;
    }) => {
      const built = buildExamQuestions({
        allQuestions,
        phaseFilter: params.phase,
        dayFilter: params.day,
        categoryFilter: params.category || 'all',
        questionCount: params.count,
        onlyMistakes: params.mode === 'mistake_retest',
        attemptsMap,
        bookmarkedIds,
        shuffle: true,
      });

      if (built.length === 0) {
        return;
      }

      const limitSec = Math.max(60, params.minutes * 60);
      setActiveQuestions(built);
      setCurrentIndex(0);
      setAnswers({});
      setFlaggedIds([]);
      setRevealedHints({});
      setTotalLimitSeconds(limitSec);
      setRemainingSeconds(limitSec);
      setInstantFeedback(params.instant);
      setLastResult(null);
      setReviewFilter('all');
      setSessionState('running');
    },
    [allQuestions, attemptsMap, bookmarkedIds]
  );

  useEffect(() => {
    if (!initialPreset || allQuestions.length === 0) return;

    setExamMode(
      initialPreset.mode === 'mistake_retest'
        ? 'mistake_retest'
        : initialPreset.mode === 'quick_quiz'
          ? 'quick_quiz'
          : 'strict_exam'
    );
    setPhaseFilter(initialPreset.phaseFilter);
    setDayFilter(initialPreset.dayFilter);
    setCategoryFilter(initialPreset.categoryFilter || 'all');
    setQuestionCount(initialPreset.questionCount);
    setTimeLimitMinutes(initialPreset.timeLimitMinutes);
    setInstantFeedback(initialPreset.instantFeedback);

    if (initialPreset.autoStart) {
      startSessionWithParams({
        mode: initialPreset.mode,
        phase: initialPreset.phaseFilter,
        day: initialPreset.dayFilter,
        category: initialPreset.categoryFilter || 'all',
        count: initialPreset.questionCount,
        minutes: initialPreset.timeLimitMinutes,
        instant: initialPreset.instantFeedback,
      });
    }
    onClearPreset();
  }, [initialPreset, allQuestions.length, startSessionWithParams, onClearPreset]);

  const handleSubmitExam = useCallback(
    (autoSubmitted: boolean) => {
      if (sessionState !== 'running' || activeQuestions.length === 0) return;

      let correctCount = 0;
      for (const q of activeQuestions) {
        const chosen = answers[q.id];
        if (chosen) {
          const isRight = chosen === q.answer;
          if (isRight) correctCount += 1;
          onRecordAttempt(q.id, chosen, isRight);
        }
      }

      const score100 = Math.round((correctCount / activeQuestions.length) * 100);
      const breakdown = computeTopicBreakdown(activeQuestions, answers);
      const elapsed = Math.max(1, totalLimitSeconds - remainingSeconds);

      const titlePrefix =
        examMode === 'quick_quiz'
          ? 'Kiểm tra nhanh'
          : examMode === 'mistake_retest'
            ? 'Ôn tập câu sai'
            : 'Thi thử nghiêm ngặt';
      const scopeLabel =
        dayFilter !== 'ALL'
          ? dayFilter
          : phaseFilter === 'phase2'
            ? 'Phase 2 (CV/3D/VLA)'
            : phaseFilter === 'phase1'
              ? 'Phase 1 (LLM/RAG/Agent)'
              : 'Tổng hợp Phase 1 & 2';

      const result: ExamResult = {
        id: `exam_${Date.now()}`,
        title: `${titlePrefix} · ${scopeLabel}`,
        mode: examMode,
        phaseFilter,
        totalQuestions: activeQuestions.length,
        correctCount,
        score100,
        timeLimitSeconds: totalLimitSeconds,
        timeElapsedSeconds: autoSubmitted ? totalLimitSeconds : elapsed,
        autoSubmitted,
        completedAt: new Date().toISOString(),
        answers: { ...answers },
        questionIds: activeQuestions.map((q) => q.id),
        flaggedIds: [...flaggedIds],
        topicBreakdown: breakdown,
      };

      setLastResult(result);
      onSaveExamResult(result);
      setSessionState('submitted');
    },
    [
      sessionState,
      activeQuestions,
      answers,
      totalLimitSeconds,
      remainingSeconds,
      examMode,
      dayFilter,
      phaseFilter,
      flaggedIds,
      onRecordAttempt,
      onSaveExamResult,
    ]
  );

  useEffect(() => {
    submitRef.current = handleSubmitExam;
  }, [handleSubmitExam]);

  useEffect(() => {
    if (sessionState !== 'running') return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          submitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [sessionState]);

  const currentQuestion = activeQuestions[currentIndex];

  const handleSelectOption = useCallback(
    (letter: 'A' | 'B' | 'C' | 'D') => {
      if (!currentQuestion || sessionState !== 'running') return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: letter }));
      if (instantFeedback) {
        onRecordAttempt(
          currentQuestion.id,
          letter,
          letter === currentQuestion.answer
        );
      }
    },
    [currentQuestion, sessionState, instantFeedback, onRecordAttempt]
  );

  const handleToggleFlag = useCallback((qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  }, []);

  useEffect(() => {
    if (sessionState !== 'running' || !currentQuestion) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') handleSelectOption('A');
      else if (key === '2' || key === 'B') handleSelectOption('B');
      else if (key === '3' || key === 'C') handleSelectOption('C');
      else if (key === '4' || key === 'D') handleSelectOption('D');
      else if (e.key === 'ArrowRight') {
        setCurrentIndex((idx) => Math.min(activeQuestions.length - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((idx) => Math.max(0, idx - 1));
      } else if (key === 'F') {
        handleToggleFlag(currentQuestion.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sessionState, currentQuestion, activeQuestions.length, handleSelectOption, handleToggleFlag]);

  const mistakePoolCount = useMemo(
    () => Object.values(attemptsMap).filter((a) => !a.isCorrect).length,
    [attemptsMap]
  );

  // ============================================================================
  // VIEW 1: EXAM CONFIGURATOR
  // ============================================================================
  if (sessionState === 'config') {
    const candidatePoolSize = buildExamQuestions({
      allQuestions,
      phaseFilter,
      dayFilter,
      categoryFilter,
      questionCount: 9999,
      onlyMistakes: examMode === 'mistake_retest',
      attemptsMap,
      bookmarkedIds,
      shuffle: false,
    }).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
            TRUNG TÂM KIỂM TRA NHANH, THI THỬ & THỰC CHIẾN DỰ ÁN LỚN
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
            Cấu hình Ca Thi & Luyện Tập Kỹ Sư Chuyên Sâu
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Lựa chọn giữa <span className="text-slate-200 font-medium">Thi thử tính giờ nghiêm ngặt</span>, <span className="text-slate-200 font-medium">Kiểm tra nhanh (Quick Quiz)</span> giải thích tức thì từng phương án A/B/C/D, hoặc lọc chuyên biệt theo <span className="text-emerald-400 font-medium">Tình huống Thực chiến Dự án Lớn (Production System Design & Debugging)</span>.
          </p>
        </section>

        {/* Step 1: Select Assessment Mode */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => {
              setExamMode('strict_exam');
              setInstantFeedback(false);
              setQuestionCount(24);
              setTimeLimitMinutes(30);
            }}
            className={`text-left rounded-xl border p-5 transition-all cursor-pointer ${
              examMode === 'strict_exam'
                ? 'border-indigo-500 bg-indigo-950/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-mono text-indigo-400">STRICT MODE</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-100">
              Thi thử tính giờ nghiêm ngặt
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Đồng hồ đếm ngược chuẩn, ẩn lời giải và gợi ý trong lúc làm bài, tự động nộp khi hết giờ và xuất báo cáo năng lực.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setExamMode('quick_quiz');
              setInstantFeedback(true);
              setQuestionCount(12);
              setTimeLimitMinutes(18);
            }}
            className={`text-left rounded-xl border p-5 transition-all cursor-pointer ${
              examMode === 'quick_quiz'
                ? 'border-indigo-500 bg-indigo-950/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400">INSTANT FEEDBACK</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-100">
              Kiểm tra nhanh (Quick Quiz)
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Hiển thị ngay kết quả Đúng/Sai và phân tích chi tiết vì sao từng đáp án A, B, C, D đúng hoặc sai sau mỗi câu.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setExamMode('mistake_retest');
              setPhaseFilter('all');
              setDayFilter('ALL');
              setCategoryFilter('all');
              setInstantFeedback(true);
              setQuestionCount(Math.min(15, Math.max(5, mistakePoolCount)));
              setTimeLimitMinutes(20);
            }}
            className={`text-left rounded-xl border p-5 transition-all cursor-pointer ${
              examMode === 'mistake_retest'
                ? 'border-indigo-500 bg-indigo-950/30'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-mono tabular-nums text-amber-400">
                {mistakePoolCount} CÂU SAI
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-100">
              Luyện lại câu trả lời sai
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Tự động lọc những câu hỏi bạn từng làm sai trong các lần thi trước để xoá lỗ hổng kiến thức.
            </p>
          </button>
        </section>

        {/* Step 2: Parameters Form */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phase Scope */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                1. Phạm vi Học phần (Phase)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'phase2', label: 'Phase 2 (144 câu)' },
                    { id: 'phase1', label: 'Phase 1 (2000 câu)' },
                    { id: 'all', label: 'Cả 2 Phase' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPhaseFilter(item.id);
                      setDayFilter('ALL');
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      phaseFilter === item.id
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Day / Track Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                2. Chọn Bài học / Chuyên đề cụ thể
              </label>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">
                  Tất cả bài học trong phạm vi đã chọn ({candidatePoolSize} câu khả dụng)
                </option>
                {availableDayOptions.map(([code, title]) => (
                  <option key={code} value={code}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Category Filter (Theory vs Production Project vs Debugging) */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                3. Trọng tâm Câu hỏi (Lý thuyết Toán học vs Thực chiến Dự án Lớn & Debugging)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {(
                  [
                    { id: 'all', label: 'Tất cả thể loại' },
                    { id: 'production_project', label: 'Dự án Lớn (Production)' },
                    { id: 'debugging_edge_case', label: 'Chẩn đoán Lỗi & Edge Case' },
                    { id: 'architecture', label: 'Kiến trúc & Tối ưu' },
                    { id: 'theory_math', label: 'Lý thuyết & Toán học' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      categoryFilter === cat.id
                        ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                4. Số lượng câu hỏi
              </label>
              <div className="flex flex-wrap gap-2">
                {[12, 18, 24, 36, 50, 72, 144].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setQuestionCount(cnt);
                      setTimeLimitMinutes(
                        examMode === 'strict_exam'
                          ? Math.ceil(cnt * 1.2)
                          : Math.ceil(cnt * 1.5)
                      );
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold tabular-nums border transition-colors cursor-pointer ${
                      questionCount === cnt
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {cnt} câu
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400">
                5. Thời gian làm bài (Phút)
              </label>
              <div className="flex flex-wrap gap-2">
                {[15, 25, 35, 45, 60, 90, 120].map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setTimeLimitMinutes(min)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold tabular-nums border transition-colors cursor-pointer ${
                      timeLimitMinutes === min
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {min} phút
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono tabular-nums">
              Ngân hàng phù hợp bộ lọc:{' '}
              <span className="text-slate-100 font-semibold">{candidatePoolSize}</span> câu · Sẽ lấy ngẫu nhiên{' '}
              <span className="text-indigo-400 font-semibold">
                {Math.min(questionCount, candidatePoolSize)}
              </span>{' '}
              câu · Thời gian:{' '}
              <span className="text-emerald-400 font-semibold">{timeLimitMinutes} phút</span>
            </div>

            <button
              type="button"
              disabled={candidatePoolSize === 0}
              onClick={() =>
                startSessionWithParams({
                  mode: examMode,
                  phase: phaseFilter,
                  day: dayFilter,
                  category: categoryFilter,
                  count: questionCount,
                  minutes: timeLimitMinutes,
                  instant: examMode !== 'strict_exam',
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {examMode === 'strict_exam'
                ? 'Bắt đầu Ca Thi Tính Giờ'
                : 'Bắt đầu Kiểm Tra Nhanh'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: ACTIVE EXAM / QUIZ RUNNER
  // ============================================================================
  if (sessionState === 'running' && currentQuestion) {
    const selectedAnswer = answers[currentQuestion.id];
    const isFlagged = flaggedIds.includes(currentQuestion.id);
    const isBookmarked = bookmarkedIds.includes(currentQuestion.id);
    const answeredCount = Object.keys(answers).length;
    const showSolutionNow = instantFeedback && Boolean(selectedAnswer);

    return (
      <div className="space-y-6">
        {/* Sticky Exam Telemetry Bar */}
        <header className="sticky top-16 z-20 rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              {instantFeedback ? 'QUICK QUIZ · GIẢI THÍCH TỨC THÌ' : 'STRICT TIMED EXAM'}
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              Câu <strong className="text-slate-100">{currentIndex + 1}</strong> /{' '}
              {activeQuestions.length} · Đã trả lời{' '}
              <strong className="text-emerald-400">{answeredCount}</strong>/
              {activeQuestions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Clock */}
            <div
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-mono text-sm font-bold tabular-nums ${
                remainingSeconds <= 30
                  ? 'border-rose-500/60 bg-rose-950/60 text-rose-300'
                  : remainingSeconds <= 120
                    ? 'border-amber-500/60 bg-amber-950/60 text-amber-300'
                    : 'border-slate-700 bg-slate-950 text-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatSeconds(remainingSeconds)}
            </div>

            <button
              type="button"
              onClick={() => handleSubmitExam(false)}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Nộp bài & Chấm điểm
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Question Workspace (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
              {/* Question Metadata Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div className="text-xs font-mono text-slate-400">
                  <span className="text-indigo-400 font-semibold">
                    {currentQuestion.phase === 'phase2' ? 'PHASE 2' : 'PHASE 1'}
                  </span>{' '}
                  · {currentQuestion.day_title} ·{' '}
                  <span className="text-emerald-400">
                    {categoryToLabel(currentQuestion.questionCategory)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onPlayAudioPlaylist(
                        [
                          buildQuestionLectureScript(
                            currentQuestion,
                            showSolutionNow
                          ),
                        ],
                        0
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {showSolutionNow ? 'Nghe giảng đáp án' : 'Nghe đọc đề'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isFlagged
                        ? 'border-amber-500/60 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {isFlagged ? 'Đã gắn cờ' : 'Gắn cờ (F)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBookmark(currentQuestion.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'border-indigo-500/60 bg-indigo-950/40 text-indigo-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {isBookmarked ? 'Đã lưu' : 'Lưu câu hỏi'}
                  </button>
                </div>
              </div>

              {/* Project Scenario Context Box (if present) */}
              {currentQuestion.projectScenario && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs sm:text-sm text-amber-200 leading-relaxed">
                  <span className="font-mono font-semibold uppercase text-amber-400">
                    Tình huống Dự án Thực tế (Project Case Study):{' '}
                  </span>
                  {currentQuestion.projectScenario}
                </div>
              )}

              {/* Question Stem */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400">
                  Chủ đề kỹ thuật: <span className="text-slate-200">{currentQuestion.topic}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-50 leading-relaxed">
                  Câu {currentIndex + 1}: {currentQuestion.question}
                </h2>
                {currentQuestion.formulaRef && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-indigo-300">
                    Công thức liên quan: {currentQuestion.formulaRef}
                  </div>
                )}
              </div>

              {/* 4 Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((optText, idx) => {
                  const letter = (['A', 'B', 'C', 'D'] as const)[idx];
                  const isSelected = selectedAnswer === letter;
                  const isCorrectOption = currentQuestion.answer === letter;

                  let cardStyle =
                    'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-slate-700';
                  if (showSolutionNow) {
                    if (isCorrectOption) {
                      cardStyle =
                        'border-emerald-500/80 bg-emerald-950/30 text-emerald-100';
                    } else if (isSelected && !isCorrectOption) {
                      cardStyle =
                        'border-rose-500/80 bg-rose-950/30 text-rose-100';
                    }
                  } else if (isSelected) {
                    cardStyle =
                      'border-indigo-500 bg-indigo-950/40 text-white';
                  }

                  const perOptionExpKey = `${letter} explanation` as
                    | 'A explanation'
                    | 'B explanation'
                    | 'C explanation'
                    | 'D explanation';
                  const optionExplanation = currentQuestion[perOptionExpKey];

                  return (
                    <div key={letter} className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectOption(letter)}
                        className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer flex items-start justify-between gap-3 ${cardStyle}`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-mono font-bold shrink-0 mt-0.5 ${
                              showSolutionNow && isCorrectOption
                                ? 'bg-emerald-500 text-slate-950'
                                : showSolutionNow && isSelected && !isCorrectOption
                                  ? 'bg-rose-500 text-white'
                                  : isSelected
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm leading-relaxed">
                            {optText.replace(/^[A-D]\.\s*/, '')}
                          </span>
                        </div>

                        {showSolutionNow && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {showSolutionNow && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>

                      {/* Per-option explanation in Instant Feedback mode */}
                      {showSolutionNow && optionExplanation && (
                        <div className="ml-9 rounded-lg border border-slate-800/80 bg-slate-950/90 px-3.5 py-2 text-xs text-slate-300 leading-relaxed">
                          <span className="font-mono font-semibold text-slate-400">
                            Phân tích {letter}:{' '}
                          </span>
                          {optionExplanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Hint Button (Available in Quick Quiz mode) */}
              {instantFeedback && (
                <div className="pt-2">
                  {!revealedHints[currentQuestion.id] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedHints((prev) => ({
                          ...prev,
                          [currentQuestion.id]: true,
                        }))
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Xem gợi ý kỹ thuật (Hint)
                    </button>
                  ) : (
                    <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/20 p-3.5 text-xs text-indigo-200 leading-relaxed">
                      <span className="font-mono font-semibold uppercase text-indigo-400">
                        Gợi ý:{' '}
                      </span>
                      {currentQuestion.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Full Explanation Box in Quick Quiz mode */}
              {showSolutionNow && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2">
                  <div className="text-xs font-mono font-semibold uppercase text-emerald-400">
                    GIẢI THÍCH TRỌNG TÂM (ĐÁP ÁN ĐÚNG: {currentQuestion.answer})
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Prev / Next Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Câu trước (←)
                </button>

                <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                  Phím tắt: 1-4 hoặc A-D để chọn · ←/→ chuyển câu · F gắn cờ
                </span>

                {currentIndex < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((i) =>
                        Math.min(activeQuestions.length - 1, i + 1)
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
                  >
                    Câu tiếp theo (→)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmitExam(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    Hoàn thành & Nộp bài
                  </button>
                )}
              </div>
            </article>
          </div>

          {/* Question Palette Navigator (Right 4 cols) */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4 lg:sticky lg:top-36">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                Bảng Điều Hướng Câu Hỏi
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {answeredCount}/{activeQuestions.length} đã chọn
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
              {activeQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const flagged = flaggedIds.includes(q.id);
                const isCurr = idx === currentIndex;

                let btnClass =
                  'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700';
                if (instantFeedback && ans) {
                  btnClass =
                    ans === q.answer
                      ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-300'
                      : 'border-rose-500/60 bg-rose-950/50 text-rose-300';
                } else if (ans) {
                  btnClass =
                    'border-indigo-500/60 bg-indigo-950/60 text-indigo-200';
                }
                if (flagged) {
                  btnClass += ' ring-1 ring-amber-400';
                }
                if (isCurr) {
                  btnClass += ' ring-2 ring-white';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono font-semibold tabular-nums transition-all cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Đã trả lời:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {answeredCount} câu
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chưa trả lời:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {activeQuestions.length - answeredCount} câu
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gắn cờ xem lại:</span>
                <span className="font-mono tabular-nums text-amber-400">
                  {flaggedIds.length} câu
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSessionState('config')}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 cursor-pointer"
            >
              Huỷ ca thi & Quay lại Cấu hình
            </button>
          </aside>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: POST-EXAM DIAGNOSTIC REPORT & DETAILED EXPLANATIONS
  // ============================================================================
  if (sessionState === 'submitted' && lastResult) {
    const filteredReviewQuestions = activeQuestions.filter((q) => {
      if (reviewFilter === 'wrong') {
        return lastResult.answers[q.id] !== q.answer;
      }
      if (reviewFilter === 'flagged') {
        return lastResult.flaggedIds.includes(q.id);
      }
      return true;
    });

    return (
      <div className="space-y-8">
        {/* Top Score Summary Banner */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
                BÁO CÁO KẾT QUẢ & PHÂN TÍCH NĂNG LỰC ·{' '}
                {lastResult.autoSubmitted ? 'TỰ ĐỘNG THU BÀI (HẾT GIỜ)' : 'ĐÃ NỘP BÀI'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                {lastResult.title}
              </h1>
              <p className="text-sm text-slate-400">
                Hoàn thành lúc{' '}
                {new Date(lastResult.completedAt).toLocaleTimeString('vi-VN')} · Thời gian làm bài:{' '}
                <span className="font-mono text-slate-200">
                  {formatSeconds(lastResult.timeElapsedSeconds)}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
              <div>
                <div className="text-xs text-slate-400">Điểm quy đổi</div>
                <div
                  className={`mt-1 text-2xl font-bold font-mono tabular-nums ${
                    lastResult.score100 >= 80
                      ? 'text-emerald-400'
                      : lastResult.score100 >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {lastResult.score100}/100
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Số câu đúng</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-100">
                  {lastResult.correctCount}/{lastResult.totalQuestions}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Câu sai / Bỏ trống</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-rose-400">
                  {lastResult.totalQuestions - lastResult.correctCount}
                </div>
              </div>
            </div>
          </div>

          {/* Topic Breakdown Inside Exam */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Thống kê độ chính xác theo Bài học / Chủ đề trong đề thi này
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {lastResult.topicBreakdown.map((tb) => (
                <div
                  key={tb.dayId}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">
                      {tb.dayTitle}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums mt-0.5">
                      Đúng {tb.correct}/{tb.total} câu
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-mono font-bold tabular-nums ${
                        tb.accuracy >= 75
                          ? 'text-emerald-400'
                          : tb.accuracy >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {tb.accuracy}%
                    </span>
                    {days.some((d) => d.id === tb.dayId) && (
                      <button
                        type="button"
                        onClick={() => onOpenTheoryDay(tb.dayId)}
                        title="Mở lý thuyết bài này"
                        className="p-1.5 rounded border border-slate-800 bg-slate-900 text-indigo-400 hover:border-indigo-500 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Tất cả ({activeQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('wrong')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  reviewFilter === 'wrong'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Câu làm sai / Chưa làm (
                {lastResult.totalQuestions - lastResult.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('flagged')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  reviewFilter === 'flagged'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Câu gắn cờ ({lastResult.flaggedIds.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSessionState('config')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tạo Đề Thi Mới
            </button>
          </div>
        </section>

        {/* Detailed Question-by-Question Solution Breakdown */}
        <section className="space-y-4">
          {filteredReviewQuestions.map((q, idx) => {
            const userAns = lastResult.answers[q.id];
            const isCorrect = userAns === q.answer;
            const hasTheoryDay = days.some((d) => d.id === q.day);

            return (
              <article
                key={q.id}
                className="rounded-xl border border-slate-800 bg-slate-900/75 p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-mono text-slate-400">
                    <span
                      className={
                        isCorrect
                          ? 'text-emerald-400 font-semibold'
                          : 'text-rose-400 font-semibold'
                      }
                    >
                      {isCorrect ? 'ĐÚNG' : userAns ? `SAI (Chọn ${userAns})` : 'BỎ TRỐNG'}
                    </span>{' '}
                    · Đáp án chuẩn: <strong className="text-emerald-300">{q.answer}</strong> ·{' '}
                    {q.day_title} ·{' '}
                    <span className="text-indigo-400">
                      {categoryToLabel(q.questionCategory)}
                    </span>
                  </div>

                  {hasTheoryDay && (
                    <button
                      type="button"
                      onClick={() => onOpenTheoryDay(q.day)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Ôn lại lý thuyết & Playbook {q.day}
                    </button>
                  )}
                </div>

                {q.projectScenario && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-950/15 px-3.5 py-2 text-xs text-amber-200 leading-relaxed">
                    <span className="font-mono font-semibold text-amber-400">
                      Tình huống Dự án:{' '}
                    </span>
                    {q.projectScenario}
                  </div>
                )}

                <h3 className="text-base font-semibold text-slate-100 leading-relaxed">
                  {idx + 1}. {q.question}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const letter = (['A', 'B', 'C', 'D'] as const)[oIdx];
                    const isRightOpt = q.answer === letter;
                    const isUserOpt = userAns === letter;
                    const expKey = `${letter} explanation` as
                      | 'A explanation'
                      | 'B explanation'
                      | 'C explanation'
                      | 'D explanation';

                    return (
                      <div
                        key={letter}
                        className={`rounded-lg border p-3 text-xs space-y-1.5 ${
                          isRightOpt
                            ? 'border-emerald-500/60 bg-emerald-950/25 text-emerald-100'
                            : isUserOpt
                              ? 'border-rose-500/60 bg-rose-950/25 text-rose-100'
                              : 'border-slate-800 bg-slate-950/60 text-slate-300'
                        }`}
                      >
                        <div className="font-medium">{opt}</div>
                        {q[expKey] && (
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                            {q[expKey]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 leading-relaxed">
                  <span className="font-mono font-semibold text-indigo-400">
                    Giải thích tổng hợp:{' '}
                  </span>
                  {q.explanation}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    );
  }

  return null;
};
