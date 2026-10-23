import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckSquare,
  Eye,
  Headphones,
  Search,
  Square,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  AttemptRecord,
  CurriculumDay,
  PhaseId,
  QuizQuestion,
  StudyStatus,
} from '../types/curriculum';
import { statusToLabel, statusToProgress } from '../services/studyStore';

interface CurriculumViewProps {
  days: CurriculumDay[];
  allQuestions: QuizQuestion[];
  dayStatusMap: Record<string, StudyStatus>;
  attemptsMap: Record<string, AttemptRecord>;
  activePhaseTab: 'phase2' | 'phase1' | 'all';
  onSelectPhaseTab: (tab: 'phase2' | 'phase1' | 'all') => void;
  onToggleDayStatus: (dayId: string) => void;
  onSetDayStatus: (dayId: string, status: StudyStatus) => void;
  onOpenTheory: (dayId: string) => void;
  onStartDayQuiz: (dayId: string, phase: PhaseId, mode: 'quick_quiz' | 'strict_exam') => void;
  onListenDayLecture: (dayId: string) => void;
}

const PHASE1_SPECIAL_TRACKS = [
  {
    id: 'Track 01',
    title: 'Track 01: Big Data, Spark, Kafka & Feature Store Pipeline',
    category: 'Data Engineering & Streaming',
    description: 'Kiến trúc xử lý dữ liệu phân tán, Apache Spark/Kafka, Parquet/Delta Lake và Feature Store cho ML.',
  },
  {
    id: 'Track 02',
    title: 'Track 02: Classical ML, GBDT (XGBoost/LightGBM) & Tabular Modeling',
    category: 'Tabular & Statistical ML',
    description: 'Tối ưu cây quyết định Gradient Boosting, Feature Engineering, Calibration và Imbalanced Learning.',
  },
  {
    id: 'Track 03',
    title: 'Track 03: Deep NLP, Sequence Modeling & Pre-LLM Architectures',
    category: 'NLP & Representation Learning',
    description: 'Word2Vec, BPE, BiLSTM-CRF, Attention cổ điển, BERT/RoBERTa fine-tuning và Cross-Encoder.',
  },
  {
    id: 'Track 04',
    title: 'Track 04: 2D Computer Vision, Detection, Segmentation & Keypoints',
    category: 'Computer Vision Foundation',
    description: 'Anchor-based/Anchor-free Detection, Mask R-CNN, Semantic Segmentation và Pose Estimation.',
  },
  {
    id: 'Track 05',
    title: 'Track 05: Recommender Systems, Two-Tower Retrieval & Ranking',
    category: 'RecSys & Search Ranking',
    description: 'Collaborative Filtering, Two-Tower ANN Retrieval, DeepFM/DLRM Ranking và Multi-Task Debiasing.',
  },
];

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  days,
  allQuestions,
  dayStatusMap,
  attemptsMap,
  activePhaseTab,
  onSelectPhaseTab,
  onToggleDayStatus,
  onSetDayStatus,
  onOpenTheory,
  onStartDayQuiz,
  onListenDayLecture,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'combined' | 'checklist'>('combined');
  const [showReferenceImages, setShowReferenceImages] = useState(false);

  const questionStatsByDay = useMemo(() => {
    const stats: Record<
      string,
      { total: number; attempted: number; correct: number }
    > = {};

    for (const q of allQuestions) {
      if (!stats[q.day]) {
        stats[q.day] = { total: 0, attempted: 0, correct: 0 };
      }
      stats[q.day].total += 1;
      const att = attemptsMap[q.id];
      if (att) {
        stats[q.day].attempted += 1;
        if (att.isCorrect) {
          stats[q.day].correct += 1;
        }
      }
    }
    return stats;
  }, [allQuestions, attemptsMap]);

  const filteredDays = useMemo(() => {
    return days.filter((d) => {
      if (activePhaseTab !== 'all' && d.phase !== activePhaseTab) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.keyIdea.toLowerCase().includes(q) ||
        d.formulas.some((f) => f.name.toLowerCase().includes(q))
      );
    });
  }, [days, activePhaseTab, searchQuery]);

  const phase2Summary = useMemo(() => {
    const p2Days = days.filter((d) => d.phase === 'phase2');
    const completed = p2Days.filter((d) => dayStatusMap[d.id] === 'completed').length;
    const inProg = p2Days.filter(
      (d) => dayStatusMap[d.id] === 'in_progress' || dayStatusMap[d.id] === 'half'
    ).length;
    const avgProgress =
      p2Days.reduce((acc, d) => acc + statusToProgress(dayStatusMap[d.id] || d.defaultStatus), 0) /
      Math.max(1, p2Days.length);
    return { total: p2Days.length, completed, inProg, avgProgress: Math.round(avgProgress) };
  }, [days, dayStatusMap]);

  const phase1Summary = useMemo(() => {
    const p1Days = days.filter((d) => d.phase === 'phase1');
    const completed = p1Days.filter((d) => dayStatusMap[d.id] === 'completed').length;
    const avgProgress =
      p1Days.reduce((acc, d) => acc + statusToProgress(dayStatusMap[d.id] || d.defaultStatus), 0) /
      Math.max(1, p1Days.length);
    return { total: p1Days.length, completed, avgProgress: Math.round(avgProgress) };
  }, [days, dayStatusMap]);

  return (
    <div className="space-y-8 pb-24">
      {/* Hero & Phase Overview Banner */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              HỆ THỐNG ÔN TẬP & GIẢNG DẠY ÂM THANH · VIN20K AI & MACHINE LEARNING
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
              Lộ trình Lý thuyết Chuyên sâu, Giảng viên Âm thanh & Thực chiến Dự án Lớn
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Tích hợp toàn diện <span className="text-slate-200 font-medium">Phase 2 (12 Days · 144 câu hỏi dự án & lý thuyết)</span> về Neural Networks, 2D/3D Vision, Kalman Filter, Point Clouds, BEV Sensor Fusion, VLA, Closed-Loop Evaluation và <span className="text-slate-200 font-medium">Phase 1 (15 Days + 5 Tracks · 2,000 câu hỏi)</span>, kèm tính năng <span className="text-emerald-400 font-medium">Giảng viên Âm thanh & Podcast 2 Chuyên gia</span>.
            </p>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 shrink-0">
            <div>
              <div className="text-xs text-slate-400">Tiến độ Phase 2</div>
              <div className="mt-1 text-xl font-bold font-mono tabular-nums text-emerald-400">
                {phase2Summary.avgProgress}%
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {phase2Summary.completed}/{phase2Summary.total} hoàn tất
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Tiến độ Phase 1</div>
              <div className="mt-1 text-xl font-bold font-mono tabular-nums text-indigo-400">
                {phase1Summary.avgProgress}%
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {phase1Summary.completed}/{phase1Summary.total} hoàn tất
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Ngân hàng câu hỏi</div>
              <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-100">
                {allQuestions.length.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                144 P2 · 2,000 P1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Filter Tabs + Search + View Switcher */}
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectPhaseTab('phase2')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePhaseTab === 'phase2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            Phase 2: CV, 3D, Fusion & VLA (12 Days)
          </button>
          <button
            type="button"
            onClick={() => onSelectPhaseTab('phase1')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePhaseTab === 'phase1'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            Phase 1: LLM, RAG & Agentic AI (15 Days)
          </button>
          <button
            type="button"
            onClick={() => onSelectPhaseTab('all')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activePhaseTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
            }`}
          >
            Tất cả (27 Days)
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm Kalman, PointPillars, BEV, VLA, RAG..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setLayoutMode('combined')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                layoutMode === 'combined'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Thẻ chuyên sâu
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('checklist')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                layoutMode === 'checklist'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Checklist tiến độ
            </button>
          </div>

          {activePhaseTab !== 'phase1' && (
            <button
              type="button"
              onClick={() => setShowReferenceImages((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              {showReferenceImages ? 'Ẩn ảnh gốc Phase 2' : 'Đối chiếu ảnh gốc Phase 2'}
            </button>
          )}
        </div>
      </section>

      {/* Optional Reference Screenshot Drawer */}
      {showReferenceImages && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Ảnh chụp danh mục Phase 2 gốc (Day 1 → Day 12)
            </h2>
            <span className="text-xs text-slate-400">
              Trạng thái mặc định (ĐANG HỌC..., 100%, 50%) đã được đồng bộ vào Checklist bên dưới
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Ảnh 1: Day 1 → Day 10
              </div>
              <img
                src="/assets/aistudio/image_96318eb1.png"
                alt="Phase 2 Curriculum Day 1 to Day 10"
                className="w-full rounded border border-slate-800 object-contain max-h-80"
              />
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Ảnh 2: Day 3 → Day 12
              </div>
              <img
                src="/assets/aistudio/image_b1351016.png"
                alt="Phase 2 Curriculum Day 3 to Day 12"
                className="w-full rounded border border-slate-800 object-contain max-h-80"
              />
            </div>
          </div>
        </section>
      )}

      {/* Interactive Checklist Mode (Matches Screenshot UI + Direct Study/Audio/Quiz Actions) */}
      {layoutMode === 'checklist' ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/80">
          {filteredDays.map((day) => {
            const status = dayStatusMap[day.id] || day.defaultStatus;
            const progress = statusToProgress(status);
            const label = statusToLabel(status);
            const qStat = questionStatsByDay[day.id] || {
              total: 0,
              attempted: 0,
              correct: 0,
            };

            return (
              <div
                key={day.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleDayStatus(day.id)}
                    title="Nhấn để chuyển trạng thái hoàn thành (Chưa học → Đang học → 50% → 100%)"
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                  >
                    {status === 'completed' ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onOpenTheory(day.id)}
                      className="text-left text-base font-medium text-slate-100 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {day.title}
                    </button>
                    <div className="mt-1 text-xs text-slate-400">
                      {day.phase === 'phase2' ? 'Phase 2' : 'Phase 1'} · {day.category} ·{' '}
                      {day.formulas.length} công thức ·{' '}
                      <span className="font-mono tabular-nums">{qStat.total}</span> câu hỏi
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-8 sm:pl-0">
                  <div className="flex flex-col items-end w-32">
                    <button
                      type="button"
                      onClick={() => onToggleDayStatus(day.id)}
                      className={`text-xs font-mono font-semibold tabular-nums cursor-pointer ${
                        status === 'completed'
                          ? 'text-emerald-400'
                          : status === 'half'
                            ? 'text-amber-400'
                            : status === 'in_progress'
                              ? 'text-indigo-400'
                              : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                    <div className="mt-1.5 h-1.5 w-28 rounded-sm bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          status === 'completed'
                            ? 'bg-emerald-500'
                            : status === 'half'
                              ? 'bg-amber-400'
                              : status === 'in_progress'
                                ? 'bg-indigo-500'
                                : 'bg-transparent'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onListenDayLecture(day.id)}
                      title="Nghe giảng âm thanh bài này"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Nghe giảng
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenTheory(day.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs font-medium text-slate-200 hover:border-indigo-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Lý thuyết
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartDayQuiz(day.id, day.phase, 'quick_quiz')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
                    >
                      Quiz nhanh
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        /* Detailed Engineering Cards Grid */
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredDays.map((day) => {
            const status = dayStatusMap[day.id] || day.defaultStatus;
            const progress = statusToProgress(status);
            const label = statusToLabel(status);
            const qStat = questionStatsByDay[day.id] || {
              total: 0,
              attempted: 0,
              correct: 0,
            };
            const accuracy =
              qStat.attempted > 0
                ? Math.round((qStat.correct / qStat.attempted) * 100)
                : null;

            return (
              <article
                key={day.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/75 p-5 hover:border-slate-700 transition-all"
              >
                <div className="space-y-4">
                  {/* Card Top Metadata & Status Bar */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleDayStatus(day.id)}
                        title="Đổi trạng thái học tập"
                        className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                      >
                        {status === 'completed' ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <div className="text-xs font-mono text-slate-400">
                          {day.phase === 'phase2' ? 'PHASE 2 · CV & AUTONOMY' : 'PHASE 1 · LLM & AGENTIC AI'} ·{' '}
                          <span className="text-indigo-400">{day.category}</span>
                        </div>
                        <h3 className="mt-1 text-lg font-semibold text-slate-50 leading-snug">
                          {day.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">{day.subtitle}</p>
                      </div>
                    </div>

                    {/* Right Status + Progress Indicator */}
                    <div className="flex flex-col items-end shrink-0">
                      <select
                        aria-label={`Trạng thái ${day.title}`}
                        value={status}
                        onChange={(e) =>
                          onSetDayStatus(day.id, e.target.value as StudyStatus)
                        }
                        className={`rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs font-mono font-semibold tabular-nums focus:outline-none focus:border-indigo-500 cursor-pointer ${
                          status === 'completed'
                            ? 'text-emerald-400'
                            : status === 'half'
                              ? 'text-amber-400'
                              : status === 'in_progress'
                                ? 'text-indigo-400'
                                : 'text-slate-400'
                        }`}
                      >
                        <option value="not_started">CHƯA HỌC (0%)</option>
                        <option value="in_progress">ĐANG HỌC...</option>
                        <option value="half">50%</option>
                        <option value="completed">100%</option>
                      </select>
                      <div className="mt-1.5 h-1.5 w-28 rounded-sm bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            status === 'completed'
                              ? 'bg-emerald-500'
                              : status === 'half'
                                ? 'bg-amber-400'
                                : status === 'in_progress'
                                  ? 'bg-indigo-500'
                                  : 'bg-transparent'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="mt-1 text-[11px] font-mono text-slate-500">
                        {label}
                      </span>
                    </div>
                  </div>

                  {/* Key Idea Box */}
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {day.keyIdea}
                  </p>

                  {/* Formula & Architecture Preview Strip */}
                  <div className="rounded-lg border border-slate-800/90 bg-slate-950/70 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-300">
                        Công thức trọng tâm ({day.formulas.length})
                      </span>
                      <span className="font-mono text-slate-500">
                        {day.sections.length} chuyên đề · Cẩm nang dự án
                      </span>
                    </div>
                    <div className="font-mono text-xs text-indigo-300 truncate">
                      {day.formulas[0]?.expression}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metadata + Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 font-mono tabular-nums">
                    {qStat.total} câu hỏi · Đã làm {qStat.attempted}/{qStat.total}
                    {accuracy !== null && (
                      <span
                        className={
                          accuracy >= 75
                            ? ' text-emerald-400'
                            : accuracy >= 50
                              ? ' text-amber-400'
                              : ' text-rose-400'
                        }
                      >
                        {' '}
                        · Đúng {accuracy}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onListenDayLecture(day.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      Nghe giảng
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenTheory(day.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-medium text-slate-100 hover:border-indigo-500 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      Lý thuyết & Sơ đồ
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartDayQuiz(day.id, day.phase, 'quick_quiz')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Kiểm tra
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Phase 1 Specialized Tracks (500 extra questions across Track 01 - Track 05) */}
      {(activePhaseTab === 'phase1' || activePhaseTab === 'all') && (
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                5 Chuyên đề Mở rộng Phase 1 (Specialized Engineering Tracks · 500 Câu hỏi)
              </h2>
              <p className="text-xs text-slate-400">
                Bộ câu hỏi chuyên ngành sâu trích xuất từ ngân hàng 2,000 câu của Vin20K Phase 1
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHASE1_SPECIAL_TRACKS.map((track) => {
              const qStat = questionStatsByDay[track.id] || {
                total: 100,
                attempted: 0,
                correct: 0,
              };
              return (
                <div
                  key={track.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-indigo-400">
                      {track.id.toUpperCase()} · {track.category}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {qStat.total} câu · Đã làm {qStat.attempted}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStartDayQuiz(track.id, 'phase1', 'quick_quiz')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Quiz 12 câu
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartDayQuiz(track.id, 'phase1', 'strict_exam')}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Thi 30 câu
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
