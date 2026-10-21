import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  FileText,
  Layers,
  Sigma,
  Table2,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  CurriculumDay,
  PhaseId,
  QuizQuestion,
  StudyStatus,
} from '../types/curriculum';
import { statusToLabel, statusToProgress } from '../services/studyStore';

interface TheoryReaderViewProps {
  days: CurriculumDay[];
  activeDayId: string;
  allQuestions: QuizQuestion[];
  dayStatusMap: Record<string, StudyStatus>;
  onSelectDay: (dayId: string) => void;
  onSetDayStatus: (dayId: string, status: StudyStatus) => void;
  onStartDayQuiz: (dayId: string, phase: PhaseId, mode: 'quick_quiz' | 'strict_exam') => void;
}

export const TheoryReaderView: React.FC<TheoryReaderViewProps> = ({
  days,
  activeDayId,
  allQuestions,
  dayStatusMap,
  onSelectDay,
  onSetDayStatus,
  onStartDayQuiz,
}) => {
  const [sidebarPhase, setSidebarPhase] = useState<PhaseId>('phase2');
  const [rawMarkdown, setRawMarkdown] = useState<string | null>(null);
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);
  const [showFullMarkdown, setShowFullMarkdown] = useState(false);

  const activeDay = useMemo(
    () => days.find((d) => d.id === activeDayId) || days[0],
    [days, activeDayId]
  );

  useEffect(() => {
    if (activeDay) {
      setSidebarPhase(activeDay.phase);
    }
  }, [activeDay]);

  useEffect(() => {
    setRawMarkdown(null);
    setShowFullMarkdown(false);
    if (!activeDay?.markdownPath) return;

    let cancelled = false;
    setLoadingMarkdown(true);
    fetch(activeDay.markdownPath)
      .then((res) => (res.ok ? res.text() : Promise.reject(res.statusText)))
      .then((text) => {
        if (!cancelled) {
          setRawMarkdown(text);
          setLoadingMarkdown(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingMarkdown(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeDay]);

  const sidebarDays = useMemo(
    () => days.filter((d) => d.phase === sidebarPhase),
    [days, sidebarPhase]
  );

  const dayQuestions = useMemo(
    () => allQuestions.filter((q) => q.day === activeDay.id),
    [allQuestions, activeDay]
  );

  const currentIdx = useMemo(
    () => days.findIndex((d) => d.id === activeDay.id),
    [days, activeDay]
  );
  const prevDay = currentIdx > 0 ? days[currentIdx - 1] : null;
  const nextDay = currentIdx < days.length - 1 ? days[currentIdx + 1] : null;

  const currentStatus = dayStatusMap[activeDay.id] || activeDay.defaultStatus;
  const currentProgress = statusToProgress(currentStatus);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Curriculum Navigation Sidebar */}
      <aside className="lg:col-span-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4 lg:sticky lg:top-20 space-y-4">
        <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setSidebarPhase('phase2')}
            className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              sidebarPhase === 'phase2'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase 2 (12 Days)
          </button>
          <button
            type="button"
            onClick={() => setSidebarPhase('phase1')}
            className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              sidebarPhase === 'phase1'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase 1 (15 Days)
          </button>
        </div>

        <div className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
          {sidebarDays.map((d) => {
            const st = dayStatusMap[d.id] || d.defaultStatus;
            const isSelected = d.id === activeDay.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDay(d.id)}
                className={`w-full text-left rounded-lg p-2.5 transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-950/80 border border-indigo-500/60 text-white'
                    : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-400">
                    {d.codeLabel}
                  </div>
                  <div className="text-xs font-medium leading-snug line-clamp-2 mt-0.5">
                    {d.title}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono tabular-nums shrink-0 mt-0.5 ${
                    st === 'completed'
                      ? 'text-emerald-400'
                      : st === 'half'
                        ? 'text-amber-400'
                        : st === 'in_progress'
                          ? 'text-indigo-400'
                          : 'text-slate-500'
                  }`}
                >
                  {statusToLabel(st)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Technical Reader Content */}
      <div className="lg:col-span-9 space-y-6">
        {/* Header Card */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              {activeDay.phase === 'phase2'
                ? 'PHASE 2 · COMPUTER VISION, 3D, KALMAN, BEV FUSION & VLA'
                : 'PHASE 1 · LLM, RAG, AGENTIC AI & PRODUCTION ENGINEERING'}{' '}
              · {activeDay.category}
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-400">Trạng thái bài học:</label>
              <select
                value={currentStatus}
                onChange={(e) =>
                  onSetDayStatus(activeDay.id, e.target.value as StudyStatus)
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-mono font-semibold text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="not_started">CHƯA HỌC (0%)</option>
                <option value="in_progress">ĐANG HỌC... (25%)</option>
                <option value="half">ĐẠT 50%</option>
                <option value="completed">HOÀN TẤT 100%</option>
              </select>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 tracking-tight">
              {activeDay.title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">{activeDay.subtitle}</p>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-sm bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                currentStatus === 'completed'
                  ? 'bg-emerald-500'
                  : currentStatus === 'half'
                    ? 'bg-amber-400'
                    : currentStatus === 'in_progress'
                      ? 'bg-indigo-500'
                      : 'bg-transparent'
              }`}
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          {/* Core Thesis Box */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-300">
              NGUYÊN LÝ CỐT LÕI (CORE ARCHITECTURAL THESIS)
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {activeDay.keyIdea}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="text-xs font-mono text-slate-400 tabular-nums">
              {activeDay.formulas.length} công thức toán ·{' '}
              {activeDay.architecture.nodes.length} tầng tensor ·{' '}
              {dayQuestions.length} câu hỏi trắc nghiệm
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onStartDayQuiz(activeDay.id, activeDay.phase, 'quick_quiz')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Kiểm tra nhanh bài này ({Math.min(10, dayQuestions.length)} câu)
              </button>
              <button
                type="button"
                onClick={() =>
                  onStartDayQuiz(activeDay.id, activeDay.phase, 'strict_exam')
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 hover:border-indigo-500 transition-colors cursor-pointer"
              >
                Thi tính giờ toàn bộ Day ({dayQuestions.length} câu)
              </button>
            </div>
          </div>
        </section>

        {/* Section 1: Mathematical Formulas & Variable Breakdown */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Sigma className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              1. Hệ thống Công thức Toán học & Giải thích Biến số
            </h2>
          </div>

          <div className="space-y-4">
            {activeDay.formulas.map((formula, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-indigo-300">
                    Công thức {idx + 1}: {formula.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    MATH SPEC #{idx + 1}
                  </span>
                </div>

                {/* Monospace Expression Block */}
                <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 overflow-x-auto">
                  <code className="text-sm sm:text-base font-mono text-emerald-300 whitespace-pre">
                    {formula.expression}
                  </code>
                </div>

                {/* Variables Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {formula.variables.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="rounded-lg border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-xs"
                    >
                      <span className="font-mono font-semibold text-amber-300">
                        {v.symbol}
                      </span>
                      <span className="text-slate-500 mx-1.5">:</span>
                      <span className="text-slate-300">{v.meaning}</span>
                    </div>
                  ))}
                </div>

                {/* Intuition / Engineering Note */}
                <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                  <span className="font-semibold text-slate-100">
                    Bản chất & Ý nghĩa Thực chiến:{' '}
                  </span>
                  {formula.intuition}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: System Architecture Diagram & Tensor Flow */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              2. Sơ đồ Kiến trúc Hệ thống & Luồng Tensor ({activeDay.architecture.title})
            </h2>
          </div>

          {/* ASCII Blueprint Block */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              SYSTEM PIPELINE BLUEPRINT
            </div>
            <pre className="text-xs sm:text-sm font-mono text-indigo-300 leading-relaxed">
              {activeDay.architecture.asciiDiagram}
            </pre>
          </div>

          {/* 4-Stage Tensor Flow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDay.architecture.nodes.map((node, nIdx) => (
              <div
                key={nIdx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    {node.stage}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {node.tensorSpec}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {node.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {node.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottleneck Warning */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 leading-relaxed">
            <span className="font-mono font-semibold uppercase text-amber-400">
              Điểm nghẽn Production & Lưu ý Tối ưu (Bottleneck Note):{' '}
            </span>
            {activeDay.architecture.bottleneckNote}
          </div>
        </section>

        {/* Section 3: Deep Theory Breakdown */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              3. Phân tích Lý thuyết Chuyên sâu & Kinh nghiệm Hệ thống
            </h2>
          </div>

          <div className="space-y-5">
            {activeDay.sections.map((sec, sIdx) => (
              <article
                key={sec.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3"
              >
                <h3 className="text-base font-semibold text-slate-100">
                  3.{sIdx + 1}. {sec.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {sec.summary}
                </p>
                <ul className="space-y-2 pt-1">
                  {sec.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="font-mono text-indigo-400 mt-0.5">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {sec.productionTip && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-emerald-300">
                    <span className="font-mono font-semibold uppercase text-emerald-400">
                      Production Tip:{' '}
                    </span>
                    {sec.productionTip}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Section 4: Engineering Trade-off Comparison Table */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <Table2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              4. {activeDay.comparisonTable.title}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-300">
                  {activeDay.comparisonTable.headers.map((h, i) => (
                    <th key={i} className="py-3 px-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {activeDay.comparisonTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-4 leading-relaxed ${
                          cIdx === 0
                            ? 'font-mono font-semibold text-indigo-300'
                            : 'text-slate-300'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Optional Section 5: Original Full Lecture Markdown (Phase 1 Course Files) */}
        {activeDay.markdownPath && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    Giáo trình Toàn văn Phase 1 (Full Lecture Notes & Code Labs)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Tài liệu Markdown gốc đầy đủ của {activeDay.codeLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFullMarkdown((prev) => !prev)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500 cursor-pointer"
              >
                {showFullMarkdown
                  ? 'Thu gọn giáo trình gốc'
                  : 'Mở toàn văn giáo trình gốc'}
              </button>
            </div>

            {showFullMarkdown && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 max-h-[600px] overflow-y-auto">
                {loadingMarkdown ? (
                  <div className="text-xs text-slate-400 font-mono">
                    Đang tải nội dung bài giảng...
                  </div>
                ) : rawMarkdown ? (
                  <pre className="text-xs sm:text-sm font-sans text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {rawMarkdown}
                  </pre>
                ) : (
                  <div className="text-xs text-slate-500">
                    Không thể tải tệp giáo trình gốc.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Bottom Prev / Next Day Navigation + Mark Complete CTA */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {prevDay && (
              <button
                type="button"
                onClick={() => onSelectDay(prevDay.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Bài trước: {prevDay.codeLabel}
              </button>
            )}
            {nextDay && (
              <button
                type="button"
                onClick={() => onSelectDay(nextDay.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-indigo-500 cursor-pointer"
              >
                Bài tiếp: {nextDay.codeLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {currentStatus !== 'completed' && (
              <button
                type="button"
                onClick={() => onSetDayStatus(activeDay.id, 'completed')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/40 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Đánh dấu Hoàn tất 100%
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                onStartDayQuiz(activeDay.id, activeDay.phase, 'quick_quiz')
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Làm bài kiểm tra nhanh ngay
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
