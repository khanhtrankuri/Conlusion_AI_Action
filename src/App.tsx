import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Clock,
  Headphones,
  Layers,
  Zap,
} from 'lucide-react';
import { ALL_CURRICULUM_DAYS, PHASE2_QUESTIONS } from './data/phase2Questions';
import { PHASE2_PRODUCTION_PLAYBOOKS } from './data/phase2ProductionPlaybooks';
import {
  AttemptRecord,
  ExamResult,
  PhaseId,
  QuizQuestion,
  StudyStatus,
} from './types/curriculum';
import {
  clearAllStudyData,
  cycleStudyStatus,
  getAttemptsMap,
  getBookmarkedIds,
  getExamHistory,
  getInitialDayStatusMap,
  loadAllQuestions,
  saveAttemptsMap,
  saveBookmarkedIds,
  saveDayStatusMap,
  saveExamHistory,
} from './services/studyStore';
import {
  buildDayLecturePlaylist,
  LectureSegment,
} from './services/audioTeacherService';
import { CurriculumView } from './components/CurriculumView';
import { TheoryReaderView } from './components/TheoryReaderView';
import { ExamPreset, TimedExamView } from './components/TimedExamView';
import { AnalyticsView } from './components/AnalyticsView';
import { AudioLecturePlayer } from './components/AudioLecturePlayer';

type ActiveNavTab = 'curriculum' | 'theory' | 'exam' | 'analytics';

export default function App() {
  const [activeNav, setActiveNav] = useState<ActiveNavTab>('curriculum');
  const [activePhaseTab, setActivePhaseTab] = useState<'phase2' | 'phase1' | 'all'>('phase2');
  const [activeTheoryDayId, setActiveTheoryDayId] = useState<string>('P2_D01');

  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>(PHASE2_QUESTIONS);
  const [dayStatusMap, setDayStatusMap] = useState<Record<string, StudyStatus>>(() =>
    getInitialDayStatusMap()
  );
  const [attemptsMap, setAttemptsMap] = useState<Record<string, AttemptRecord>>(() =>
    getAttemptsMap()
  );
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    getBookmarkedIds()
  );
  const [examHistory, setExamHistory] = useState<ExamResult[]>(() =>
    getExamHistory()
  );
  const [examPreset, setExamPreset] = useState<ExamPreset | null>(null);

  // Audio Lecture Player State
  const [audioPlaylist, setAudioPlaylist] = useState<LectureSegment[]>([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState<number>(0);
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    loadAllQuestions().then((loaded) => {
      if (mounted) {
        setAllQuestions(loaded);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handlePlayAudioPlaylist = useCallback(
    (playlist: LectureSegment[], startIndex = 0) => {
      if (playlist.length === 0) return;
      setAudioPlaylist(playlist);
      setActiveAudioIndex(Math.max(0, Math.min(startIndex, playlist.length - 1)));
      setIsAudioOpen(true);
    },
    []
  );

  const handleListenDayLecture = useCallback(
    (dayId: string) => {
      const targetDay =
        ALL_CURRICULUM_DAYS.find((d) => d.id === dayId) || ALL_CURRICULUM_DAYS[0];
      const playbook = PHASE2_PRODUCTION_PLAYBOOKS[targetDay.id] || null;
      const playlist = buildDayLecturePlaylist(targetDay, playbook);
      setActiveTheoryDayId(targetDay.id);
      setActiveNav('theory');
      handlePlayAudioPlaylist(playlist, 0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handlePlayAudioPlaylist]
  );

  const handleToggleDayStatus = useCallback((dayId: string) => {
    setDayStatusMap((prev) => {
      const current = prev[dayId] || 'not_started';
      const next = cycleStudyStatus(current);
      const updated = { ...prev, [dayId]: next };
      saveDayStatusMap(updated);
      return updated;
    });
  }, []);

  const handleSetDayStatus = useCallback((dayId: string, status: StudyStatus) => {
    setDayStatusMap((prev) => {
      const updated = { ...prev, [dayId]: status };
      saveDayStatusMap(updated);
      return updated;
    });
  }, []);

  const handleOpenTheory = useCallback((dayId: string) => {
    setActiveTheoryDayId(dayId);
    setActiveNav('theory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStartDayQuiz = useCallback(
    (dayId: string, phase: PhaseId, mode: 'quick_quiz' | 'strict_exam') => {
      const isQuick = mode === 'quick_quiz';
      setExamPreset({
        mode: isQuick ? 'quick_quiz' : 'strict_exam',
        phaseFilter: phase,
        dayFilter: dayId,
        questionCount: isQuick ? 12 : 30,
        timeLimitMinutes: isQuick ? 18 : 35,
        instantFeedback: isQuick,
        autoStart: true,
      });
      setActiveNav('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleLaunchGlobalQuickQuiz = useCallback(() => {
    const targetPhase = activePhaseTab === 'all' ? 'phase2' : activePhaseTab;
    setExamPreset({
      mode: 'quick_quiz',
      phaseFilter: targetPhase,
      dayFilter: 'ALL',
      questionCount: 12,
      timeLimitMinutes: 18,
      instantFeedback: true,
      autoStart: true,
    });
    setActiveNav('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePhaseTab]);

  const handleStartMistakeRetest = useCallback(() => {
    setExamPreset({
      mode: 'mistake_retest',
      phaseFilter: 'all',
      dayFilter: 'ALL',
      questionCount: 15,
      timeLimitMinutes: 20,
      instantFeedback: true,
      autoStart: true,
    });
    setActiveNav('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRecordAttempt = useCallback(
    (questionId: string, selectedAnswer: 'A' | 'B' | 'C' | 'D', isCorrect: boolean) => {
      setAttemptsMap((prev) => {
        const updated: Record<string, AttemptRecord> = {
          ...prev,
          [questionId]: {
            questionId,
            selectedAnswer,
            isCorrect,
            timestamp: Date.now(),
          },
        };
        saveAttemptsMap(updated);
        return updated;
      });
    },
    []
  );

  const handleToggleBookmark = useCallback((questionId: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(questionId);
      const updated = exists
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId];
      saveBookmarkedIds(updated);
      return updated;
    });
  }, []);

  const handleSaveExamResult = useCallback((result: ExamResult) => {
    setExamHistory((prev) => {
      const updated = [result, ...prev];
      saveExamHistory(updated);
      return updated;
    });
  }, []);

  const handleResetAllProgress = useCallback(() => {
    clearAllStudyData();
    setDayStatusMap(getInitialDayStatusMap());
    setAttemptsMap({});
    setBookmarkedIds([]);
    setExamHistory([]);
  }, []);

  const clearPreset = useCallback(() => {
    setExamPreset(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Top Bar: 3 Distinct Zones (Brand | 4 Nav Links | 1 Primary CTA) */}
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8 overflow-x-auto">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveNav('curriculum')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm">
              V20
            </div>
            <span className="font-bold tracking-tight text-slate-100 text-sm sm:text-base">
              Vin20K AI · Phase 1 & 2
            </span>
          </button>

          {/* Zone 2: Primary Navigation Links (4 items) */}
          <nav className="flex items-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveNav('curriculum')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeNav === 'curriculum'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Lộ trình học
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('theory')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeNav === 'theory'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Lý thuyết & Sơ đồ
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('exam')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeNav === 'exam'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Thi thử & Quiz
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('analytics')}
              className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                activeNav === 'analytics'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Thống kê năng lực
            </button>
          </nav>

          {/* Zone 3: Single Primary Action CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleLaunchGlobalQuickQuiz}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Kiểm tra nhanh 12 câu
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeNav === 'curriculum' && (
          <CurriculumView
            days={ALL_CURRICULUM_DAYS}
            allQuestions={allQuestions}
            dayStatusMap={dayStatusMap}
            attemptsMap={attemptsMap}
            activePhaseTab={activePhaseTab}
            onSelectPhaseTab={setActivePhaseTab}
            onToggleDayStatus={handleToggleDayStatus}
            onSetDayStatus={handleSetDayStatus}
            onOpenTheory={handleOpenTheory}
            onStartDayQuiz={handleStartDayQuiz}
            onListenDayLecture={handleListenDayLecture}
          />
        )}

        {activeNav === 'theory' && (
          <TheoryReaderView
            days={ALL_CURRICULUM_DAYS}
            activeDayId={activeTheoryDayId}
            allQuestions={allQuestions}
            dayStatusMap={dayStatusMap}
            onSelectDay={setActiveTheoryDayId}
            onSetDayStatus={handleSetDayStatus}
            onStartDayQuiz={handleStartDayQuiz}
            onPlayAudioPlaylist={handlePlayAudioPlaylist}
          />
        )}

        {activeNav === 'exam' && (
          <TimedExamView
            allQuestions={allQuestions}
            days={ALL_CURRICULUM_DAYS}
            attemptsMap={attemptsMap}
            bookmarkedIds={bookmarkedIds}
            initialPreset={examPreset}
            onClearPreset={clearPreset}
            onRecordAttempt={handleRecordAttempt}
            onToggleBookmark={handleToggleBookmark}
            onSaveExamResult={handleSaveExamResult}
            onOpenTheoryDay={handleOpenTheory}
            onPlayAudioPlaylist={handlePlayAudioPlaylist}
          />
        )}

        {activeNav === 'analytics' && (
          <AnalyticsView
            days={ALL_CURRICULUM_DAYS}
            allQuestions={allQuestions}
            dayStatusMap={dayStatusMap}
            attemptsMap={attemptsMap}
            bookmarkedIds={bookmarkedIds}
            examHistory={examHistory}
            onOpenTheoryDay={handleOpenTheory}
            onStartDayQuiz={handleStartDayQuiz}
            onStartMistakeRetest={handleStartMistakeRetest}
            onResetAllProgress={handleResetAllProgress}
          />
        )}
      </main>

      {/* Persistent Bottom Audio Lecture Player */}
      {isAudioOpen && audioPlaylist.length > 0 && (
        <AudioLecturePlayer
          playlist={audioPlaylist}
          activeIndex={activeAudioIndex}
          isPlayingRequested={isAudioOpen}
          onChangeIndex={setActiveAudioIndex}
          onClose={() => setIsAudioOpen(false)}
        />
      )}
    </div>
  );
}
