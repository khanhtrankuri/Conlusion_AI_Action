import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Play,
  RotateCcw,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  AttemptRecord,
  CurriculumDay,
  ExamResult,
  PhaseId,
  QuizQuestion,
  StudyStatus,
} from '../types/curriculum';
import { statusToLabel } from '../services/studyStore';

interface AnalyticsViewProps {
  days: CurriculumDay[];
  allQuestions: QuizQuestion[];
  dayStatusMap: Record<string, StudyStatus>;
  attemptsMap: Record<string, AttemptRecord>;
  bookmarkedIds: string[];
  examHistory: ExamResult[];
  onOpenTheoryDay: (dayId: string) => void;
  onStartDayQuiz: (dayId: string, phase: PhaseId, mode: 'quick_quiz' | 'strict_exam') => void;
  onStartMistakeRetest: () => void;
  onResetAllProgress: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  days,
  allQuestions,
  dayStatusMap,
  attemptsMap,
  bookmarkedIds,
  examHistory,
  onOpenTheoryDay,
  onStartDayQuiz,
  onStartMistakeRetest,
  onResetAllProgress,
}) => {
  const [matrixPhase, setMatrixPhase] = useState<'phase2' | 'phase1' | 'all'>('phase2');
  const [bankFilter, setBankFilter] = useState<'mistakes' | 'bookmarks'>('mistakes');
  const [confirmReset, setConfirmReset] = useState(false);

  const attemptList = useMemo(() => Object.values(attemptsMap), [attemptsMap]);
  const totalAttempted = attemptList.length;
  const totalCorrect = attemptList.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const wrongQuestions = useMemo(() => {
    const wrongSet = new Set(
      attemptList.filter((a) => !a.isCorrect).map((a) => a.questionId)
    );
    return allQuestions.filter((q) => wrongSet.has(q.id));
  }, [allQuestions, attemptList]);

  const bookmarkedQuestions = useMemo(() => {
    const bmSet = new Set(bookmarkedIds);
    return allQuestions.filter((q) => bmSet.has(q.id));
  }, [allQuestions, bookmarkedIds]);

  const topicCompetencyRows = useMemo(() => {
    const rows = days
      .filter((d) => matrixPhase === 'all' || d.phase === matrixPhase)
      .map((d) => {
        const qs = allQuestions.filter((q) => q.day === d.id);
        let attempted = 0;
        let correct = 0;
        for (const q of qs) {
          const att = attemptsMap[q.id];
          if (att) {
            attempted += 1;
            if (att.isCorrect) correct += 1;
          }
        }
        const accuracy =
          attempted > 0 ? Math.round((correct / attempted) * 100) : null;
        const status = dayStatusMap[d.id] || d.defaultStatus;
        return {
          day: d,
          totalQuestions: qs.length,
          attempted,
          correct,
          accuracy,
          status,
        };
      });
    return rows;
  }, [days, matrixPhase, allQuestions, attemptsMap, dayStatusMap]);

  const weakTopics = useMemo(
    () =>
      topicCompetencyRows.filter(
        (r) => r.accuracy !== null && r.accuracy < 70
      ),
    [topicCompetencyRows]
  );

  const handleExportReport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      overallAccuracy,
      totalAttempted,
      totalCorrect,
      dayStatusMap,
      examHistory,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vin20k_ai_study_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-mono uppercase text-slate-400">
            ĐỘ CHÍNH XÁC TỔNG THỂ
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-emerald-400">
            {overallAccuracy}%
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono tabular-nums">
            Đúng {totalCorrect} / {totalAttempted} câu đã làm
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-mono uppercase text-slate-400">
            TIẾN ĐỘ HOÀN THÀNH BÀI HỌC
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-indigo-400">
            {days.filter((d) => dayStatusMap[d.id] === 'completed').length}/
            {days.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Bài học đạt trạng thái 100%
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-mono uppercase text-slate-400">
            CÂU HỎI CẦN ÔN LẠI (SAI / ĐÃ LƯU)
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-amber-400">
            {wrongQuestions.length} · {bookmarkedQuestions.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {wrongQuestions.length} câu sai · {bookmarkedQuestions.length} câu đã lưu
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="text-xs font-mono uppercase text-slate-400">
            SỐ CA THI ĐÃ HOÀN TẤT
          </div>
          <div className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-100">
            {examHistory.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Lưu trữ tự động trên trình duyệt
          </div>
        </div>
      </section>

      {/* Weak Topics Warning Callout */}
      {weakTopics.length > 0 && (
        <section className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Phát hiện {weakTopics.length} chủ đề có độ chính xác dưới 70% cần củng cố lý thuyết
            </div>
            {wrongQuestions.length > 0 && (
              <button
                type="button"
                onClick={onStartMistakeRetest}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-slate-950 cursor-pointer"
              >
                Thi lại các câu sai ngay ({wrongQuestions.length} câu)
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakTopics.map((wt) => (
              <div
                key={wt.day.id}
                className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {wt.day.title}
                  </div>
                  <div className="text-[11px] font-mono text-rose-400 tabular-nums">
                    Độ chính xác: {wt.accuracy}% ({wt.correct}/{wt.attempted} câu)
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenTheoryDay(wt.day.id)}
                    className="px-2.5 py-1 rounded border border-slate-700 bg-slate-900 text-xs text-slate-200 hover:border-indigo-500 cursor-pointer"
                  >
                    Lý thuyết
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onStartDayQuiz(wt.day.id, wt.day.phase, 'quick_quiz')
                    }
                    className="px-2.5 py-1 rounded bg-indigo-600 text-xs text-white hover:bg-indigo-500 cursor-pointer"
                  >
                    Luyện lại
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Competency Matrix by Curriculum Day */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Thống kê Năng lực Chuyên sâu theo từng Bài học (Day Competency Matrix)
            </h2>
            <p className="text-xs text-slate-400">
              Theo dõi tỷ lệ trả lời đúng, số câu đã luyện và trạng thái hoàn thành lý thuyết của từng Day
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(
              [
                { id: 'phase2', label: 'Phase 2 (12 Days)' },
                { id: 'phase1', label: 'Phase 1 (15 Days)' },
                { id: 'all', label: 'Tất cả (27 Days)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMatrixPhase(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  matrixPhase === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-xs">
                <th className="py-3 px-3">BÀI HỌC / CHỦ ĐỀ</th>
                <th className="py-3 px-3">TRẠNG THÁI LÝ THUYẾT</th>
                <th className="py-3 px-3">TIẾN ĐỘ LUYỆN ĐỀ</th>
                <th className="py-3 px-3">ĐỘ CHÍNH XÁC</th>
                <th className="py-3 px-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {topicCompetencyRows.map((row) => (
                <tr key={row.day.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-100">
                      {row.day.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {row.day.phase === 'phase2' ? 'Phase 2' : 'Phase 1'} ·{' '}
                      {row.day.category}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs tabular-nums">
                    <span
                      className={
                        row.status === 'completed'
                          ? 'text-emerald-400 font-semibold'
                          : row.status === 'half'
                            ? 'text-amber-400 font-semibold'
                            : row.status === 'in_progress'
                              ? 'text-indigo-400 font-semibold'
                              : 'text-slate-500'
                      }
                    >
                      {statusToLabel(row.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs tabular-nums text-slate-300">
                    {row.attempted} / {row.totalQuestions} câu
                  </td>
                  <td className="py-3.5 px-3">
                    {row.accuracy !== null ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-24 h-2 rounded-sm bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              row.accuracy >= 75
                                ? 'bg-emerald-500'
                                : row.accuracy >= 50
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                            }`}
                            style={{ width: `${row.accuracy}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${
                            row.accuracy >= 75
                              ? 'text-emerald-400'
                              : row.accuracy >= 50
                                ? 'text-amber-400'
                                : 'text-rose-400'
                          }`}
                        >
                          {row.accuracy}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">
                        Chưa làm bài
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenTheoryDay(row.day.id)}
                        className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:border-indigo-500 cursor-pointer"
                      >
                        Đọc bài
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onStartDayQuiz(row.day.id, row.day.phase, 'quick_quiz')
                        }
                        className="px-2.5 py-1 rounded bg-indigo-600 text-xs text-white hover:bg-indigo-500 cursor-pointer"
                      >
                        Kiểm tra
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mistake & Bookmark Bank */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBankFilter('mistakes')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                bankFilter === 'mistakes'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              Ngân hàng Câu làm sai ({wrongQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setBankFilter('bookmarks')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                bankFilter === 'bookmarks'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              Câu hỏi Đã lưu ({bookmarkedQuestions.length})
            </button>
          </div>

          {wrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={onStartMistakeRetest}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Mở Đề Luyện Lại Các Câu Sai
            </button>
          )}
        </div>

        {(bankFilter === 'mistakes' ? wrongQuestions : bookmarkedQuestions)
          .length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {bankFilter === 'mistakes'
              ? 'Hiện chưa có câu trả lời sai nào. Hãy bắt đầu một bài Kiểm tra nhanh hoặc Thi thử tính giờ!'
              : 'Bạn chưa lưu câu hỏi nào. Nhấn nút "Lưu câu hỏi" trong lúc làm bài để đánh dấu các câu hay.'}
          </div>
        ) : (
          <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
            {(bankFilter === 'mistakes'
              ? wrongQuestions
              : bookmarkedQuestions
            )
              .slice(0, 30)
              .map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>
                      {q.phase === 'phase2' ? 'PHASE 2' : 'PHASE 1'} · {q.day_title} ·{' '}
                      {q.topic}
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      Đáp án đúng: {q.answer}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100">
                    {q.question}
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-mono text-indigo-400">Giải thích: </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Exam History & Data Export / Reset */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-100">
            Lịch sử Các Ca Thi & Quản lý Dữ liệu Học tập
          </h2>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-500 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất báo cáo JSON
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Đặt lại tiến độ
              </button>
            ) : (
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllProgress();
                    setConfirmReset(false);
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  Xác nhận xoá
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 cursor-pointer"
                >
                  Huỷ
                </button>
              </div>
            )}
          </div>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-xs text-slate-400 py-4">
            Chưa có lịch sử ca thi nào được ghi nhận.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examHistory.map((ex) => (
              <div
                key={ex.id}
                className="rounded-lg border border-slate-800 bg-slate-950/70 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {ex.title}
                  </div>
                  <div className="text-xs font-mono text-slate-400 tabular-nums mt-0.5">
                    {new Date(ex.completedAt).toLocaleString('vi-VN')} · Đúng{' '}
                    {ex.correctCount}/{ex.totalQuestions} câu
                  </div>
                </div>
                <div
                  className={`text-lg font-mono font-bold tabular-nums shrink-0 ${
                    ex.score100 >= 80
                      ? 'text-emerald-400'
                      : ex.score100 >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {ex.score100}đ
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
