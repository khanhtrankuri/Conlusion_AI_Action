import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FastForward,
  Headphones,
  Loader2,
  Mic,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  X,
} from 'lucide-react';
import {
  AudioEngineMode,
  GeminiVoiceName,
  LectureSegment,
} from '../services/audioTeacherService';

interface AudioLecturePlayerProps {
  playlist: LectureSegment[];
  activeIndex: number;
  isPlayingRequested: boolean;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
}

const audioUrlCache = new Map<string, string>();

function splitIntoChunks(text: string, maxLen = 200): string[] {
  const rawSentences = text.split(/(?<=[.!?।;:])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const s of rawSentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length <= maxLen) {
        current = s;
      } else {
        // Hard split very long clause
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen));
        }
        current = '';
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

export const AudioLecturePlayer: React.FC<AudioLecturePlayerProps> = ({
  playlist,
  activeIndex,
  isPlayingRequested,
  onChangeIndex,
  onClose,
}) => {
  const [engineMode, setEngineMode] = useState<AudioEngineMode>('browser_speech');
  const [voiceName, setVoiceName] = useState<GeminiVoiceName>('Kore');
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speechIndexRef = useRef<number>(0);
  const isCancelledRef = useRef<boolean>(false);
  const playbackRateRef = useRef<number>(1.0);

  const currentSegment = playlist[activeIndex] || playlist[0];

  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (htmlAudioRef.current) {
      htmlAudioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const stopAllPlayback = useCallback(() => {
    isCancelledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoadingAI(false);
  }, []);

  const advanceToNextOrStop = useCallback(() => {
    if (activeIndex < playlist.length - 1) {
      onChangeIndex(activeIndex + 1);
    } else {
      setIsPlaying(false);
      setAudioProgress(100);
    }
  }, [activeIndex, playlist.length, onChangeIndex]);

  // Browser Web Speech API runner (chunks sentences to prevent browser 15s cutoff)
  const playWithBrowserSpeech = useCallback(
    (segment: LectureSegment, startChunk = 0) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setErrorBanner('Trình duyệt của bạn không hỗ trợ Web Speech API.');
        return;
      }

      window.speechSynthesis.cancel();
      isCancelledRef.current = false;

      const textToRead =
        engineMode === 'gemini_podcast' && segment.podcastTurns
          ? segment.podcastTurns
              .map(
                (t) =>
                  `${
                    t.speaker === 'GiangVien' ? 'Giảng viên:' : 'Kỹ sư trưởng:'
                  } ${t.text}`
              )
              .join(' ')
          : segment.scriptText;

      const chunks = splitIntoChunks(textToRead, 180);
      speechQueueRef.current = chunks;
      speechIndexRef.current = startChunk;
      setCurrentSentenceIdx(startChunk);
      setIsPlaying(true);

      const voices = window.speechSynthesis.getVoices();
      const viVoice =
        voices.find((v) => v.lang.toLowerCase().includes('vi')) ||
        voices.find((v) => v.lang.toLowerCase().includes('en')) ||
        null;

      const speakNextChunk = (idx: number) => {
        if (isCancelledRef.current) return;
        if (idx >= chunks.length) {
          setAudioProgress(100);
          advanceToNextOrStop();
          return;
        }

        setCurrentSentenceIdx(idx);
        setAudioProgress(Math.round(((idx + 1) / chunks.length) * 100));

        const utter = new SpeechSynthesisUtterance(chunks[idx]);
        if (viVoice) {
          utter.voice = viVoice;
          utter.lang = viVoice.lang;
        } else {
          utter.lang = 'vi-VN';
        }
        utter.rate = playbackRateRef.current;

        utter.onend = () => {
          if (!isCancelledRef.current) {
            speakNextChunk(idx + 1);
          }
        };
        utter.onerror = () => {
          if (!isCancelledRef.current) {
            speakNextChunk(idx + 1);
          }
        };

        window.speechSynthesis.speak(utter);
      };

      speakNextChunk(startChunk);
    },
    [engineMode, advanceToNextOrStop]
  );

  // Gemini TTS / Podcast AI runner via Server API
  const playWithGeminiAI = useCallback(
    async (segment: LectureSegment, mode: 'gemini_tts' | 'gemini_podcast') => {
      stopAllPlayback();
      isCancelledRef.current = false;
      setErrorBanner(null);
      setIsLoadingAI(true);
      setAudioProgress(0);

      const cacheKey = `${mode}_${voiceName}_${segment.id}`;
      let audioObjectUrl = audioUrlCache.get(cacheKey);

      try {
        if (!audioObjectUrl) {
          const endpoint =
            mode === 'gemini_podcast' ? '/api/tts-podcast' : '/api/tts';
          const payload =
            mode === 'gemini_podcast'
              ? {
                  turns: segment.podcastTurns || [
                    { speaker: 'GiangVien', text: segment.scriptText },
                    {
                      speaker: 'KySu',
                      text: 'Hãy áp dụng nguyên lý này vào thiết kế hệ thống thực tế.',
                    },
                  ],
                }
              : {
                  text: segment.scriptText,
                  voiceName,
                };

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(
              errJson.error || `Không thể kết nối Gemini TTS (HTTP ${res.status})`
            );
          }

          const data = (await res.json()) as {
            audioBase64: string;
            mimeType: string;
          };

          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], {
            type: data.mimeType || 'audio/wav',
          });
          audioObjectUrl = URL.createObjectURL(blob);
          audioUrlCache.set(cacheKey, audioObjectUrl);
        }

        if (isCancelledRef.current) return;

        const audio = new Audio(audioObjectUrl);
        audio.playbackRate = playbackRateRef.current;
        htmlAudioRef.current = audio;

        audio.ontimeupdate = () => {
          if (audio.duration > 0) {
            setAudioProgress(
              Math.round((audio.currentTime / audio.duration) * 100)
            );
          }
        };

        audio.onended = () => {
          if (!isCancelledRef.current) {
            advanceToNextOrStop();
          }
        };

        audio.onerror = () => {
          setIsLoadingAI(false);
          setIsPlaying(false);
          setErrorBanner('Lỗi phát file âm thanh AI, tự động chuyển sang giọng đọc trình duyệt.');
          playWithBrowserSpeech(segment, 0);
        };

        setIsLoadingAI(false);
        setIsPlaying(true);
        await audio.play();
      } catch (err: unknown) {
        if (isCancelledRef.current) return;
        setIsLoadingAI(false);
        setErrorBanner(
          'Đang dùng giọng đọc Trình duyệt Tức thì (cấu hình GEMINI_API_KEY nếu muốn dùng giọng Studio AI).'
        );
        setEngineMode('browser_speech');
        playWithBrowserSpeech(segment, 0);
      }
    },
    [voiceName, stopAllPlayback, advanceToNextOrStop, playWithBrowserSpeech]
  );

  const startCurrentSegment = useCallback(() => {
    if (!currentSegment) return;
    if (engineMode === 'browser_speech') {
      playWithBrowserSpeech(currentSegment, 0);
    } else {
      playWithGeminiAI(currentSegment, engineMode);
    }
  }, [currentSegment, engineMode, playWithBrowserSpeech, playWithGeminiAI]);

  useEffect(() => {
    if (isPlayingRequested && currentSegment) {
      startCurrentSegment();
    }
    return () => {
      stopAllPlayback();
    };
  }, [currentSegment?.id, isPlayingRequested, engineMode, voiceName]);

  const handleTogglePlayPause = () => {
    if (isLoadingAI) return;

    if (isPlaying) {
      if (engineMode === 'browser_speech') {
        isCancelledRef.current = true;
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (engineMode === 'browser_speech') {
        playWithBrowserSpeech(currentSegment, currentSentenceIdx);
      } else if (htmlAudioRef.current && htmlAudioRef.current.src) {
        htmlAudioRef.current.play();
        setIsPlaying(true);
      } else {
        startCurrentSegment();
      }
    }
  };

  if (!currentSegment) return null;

  const displayChunks = splitIntoChunks(currentSegment.scriptText, 180);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-5xl rounded-xl border border-indigo-500/50 bg-slate-900/95 backdrop-blur shadow-2xl">
      {/* Optional Live Transcript & Podcast Dialogue Drawer */}
      {showTranscript && (
        <div className="border-b border-slate-800 p-4 max-h-64 overflow-y-auto space-y-3 bg-slate-950/90 rounded-t-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400">
              BẢN GHI LỜI GIẢNG TRỰC TIẾP (LIVE AUDIO LECTURE TRANSCRIPT)
            </span>
            <button
              type="button"
              onClick={() => setShowTranscript(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Thu gọn
            </button>
          </div>

          {engineMode === 'gemini_podcast' && currentSegment.podcastTurns ? (
            <div className="space-y-2.5">
              {currentSegment.podcastTurns.map((turn, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 text-xs leading-relaxed ${
                    turn.speaker === 'GiangVien'
                      ? 'border-indigo-500/30 bg-indigo-950/20 text-indigo-100'
                      : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-100'
                  }`}
                >
                  <span className="font-mono font-bold uppercase mr-2">
                    {turn.speaker === 'GiangVien'
                      ? 'Giảng viên Học thuật (Kore):'
                      : 'Kỹ sư Trưởng Hệ thống (Charon):'}
                  </span>
                  {turn.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
              {displayChunks.map((chunk, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    if (engineMode === 'browser_speech') {
                      playWithBrowserSpeech(currentSegment, idx);
                    }
                  }}
                  className={`inline mr-1.5 px-1 py-0.5 rounded transition-colors cursor-pointer ${
                    idx === currentSentenceIdx && isPlaying
                      ? 'bg-indigo-600/40 text-white font-medium'
                      : 'text-slate-300 hover:text-slate-100'
                  }`}
                >
                  {chunk}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Line */}
      <div className="h-1 w-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${audioProgress}%` }}
        />
      </div>

      {errorBanner && (
        <div className="px-4 py-1.5 bg-amber-950/60 border-b border-amber-500/30 text-[11px] text-amber-200 flex items-center justify-between">
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={() => setErrorBanner(null)}
            className="text-amber-400 hover:text-white ml-2 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Controls Bar */}
      <div className="p-3.5 sm:px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Active Lecture Title & Part Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            {isLoadingAI ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Headphones className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-indigo-400">
                GIẢNG VIÊN ÂM THANH ({activeIndex + 1}/{playlist.length})
              </span>
              {isPlaying && (
                <span className="text-[11px] font-mono text-emerald-400">
                  · ĐANG GIẢNG BÀI
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-100 truncate">
              {currentSegment.title}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {currentSegment.subtitle}
            </div>
          </div>
        </div>

        {/* Center: Transport Controls (Prev / Play-Pause / Stop / Next) */}
        <div className="flex items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            disabled={activeIndex <= 0}
            onClick={() => onChangeIndex(Math.max(0, activeIndex - 1))}
            title="Phần trước"
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlayPause}
            disabled={isLoadingAI}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo giọng AI...
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Tạm dừng
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Tiếp tục nghe
              </>
            )}
          </button>

          <button
            type="button"
            onClick={stopAllPlayback}
            title="Dừng hẳn"
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 cursor-pointer"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            type="button"
            disabled={activeIndex >= playlist.length - 1}
            onClick={() =>
              onChangeIndex(Math.min(playlist.length - 1, activeIndex + 1))
            }
            title="Phần tiếp theo"
            className="p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 disabled:opacity-40 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Engine Mode, Voice, Speed & Transcript Toggle */}
        <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
          {/* Audio Engine Selector */}
          <select
            aria-label="Chế độ Giọng giảng"
            value={engineMode}
            onChange={(e) => setEngineMode(e.target.value as AudioEngineMode)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="browser_speech">
              ⚡ Giọng giảng Tức thì (0ms · Offline)
            </option>
            <option value="gemini_tts">
              🎙️ Giảng viên AI Studio (Gemini TTS)
            </option>
            <option value="gemini_podcast">
              👥 Podcast 2 Chuyên gia (Giảng viên & Kỹ sư)
            </option>
          </select>

          {/* Voice Persona Selector when in Gemini TTS mode */}
          {engineMode === 'gemini_tts' && (
            <select
              aria-label="Chọn giọng AI"
              value={voiceName}
              onChange={(e) => setVoiceName(e.target.value as GeminiVoiceName)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Kore">Giọng Kore (Rõ ràng)</option>
              <option value="Charon">Giọng Charon (Trầm ấm)</option>
              <option value="Puck">Giọng Puck (Năng động)</option>
              <option value="Fenrir">Giọng Fenrir (Chuyên gia)</option>
              <option value="Zephyr">Giọng Zephyr (Mượt mà)</option>
            </select>
          )}

          {/* Speed Selector */}
          <select
            aria-label="Tốc độ đọc"
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-mono tabular-nums text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value={0.85}>0.85x</option>
            <option value={1.0}>1.0x</option>
            <option value={1.15}>1.15x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
          </select>

          {/* Transcript Toggle */}
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-500 cursor-pointer"
          >
            {showTranscript ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
            Lời giảng
          </button>

          {/* Close Player */}
          <button
            type="button"
            onClick={() => {
              stopAllPlayback();
              onClose();
            }}
            title="Đóng trình giảng âm thanh"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
