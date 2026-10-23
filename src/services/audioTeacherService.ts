import {
  CurriculumDay,
  MathFormula,
  ProductionPlaybook,
  QuizQuestion,
  TheorySection,
} from '../types/curriculum';

export type AudioEngineMode = 'gemini_tts' | 'gemini_podcast' | 'browser_speech';
export type GeminiVoiceName = 'Kore' | 'Charon' | 'Puck' | 'Fenrir' | 'Zephyr';

export interface LectureSegment {
  id: string;
  title: string;
  subtitle: string;
  scriptText: string;
  podcastTurns?: Array<{ speaker: 'GiangVien' | 'KySu'; text: string }>;
}

// Convert math notation into natural spoken Vietnamese for smooth narration
export function humanizeMathForSpeech(text: string): string {
  return text
    .replace(/∑/g, ' tổng sigma ')
    .replace(/∏/g, ' tích pi ')
    .replace(/∇/g, ' đạo hàm gradient ')
    .replace(/∂/g, ' đạo hàm riêng ')
    .replace(/≈/g, ' xấp xỉ bằng ')
    .replace(/≠/g, ' khác ')
    .replace(/≤/g, ' nhỏ hơn hoặc bằng ')
    .replace(/≥/g, ' lớn hơn hoặc bằng ')
    .replace(/∈/g, ' thuộc tập ')
    .replace(/∉/g, ' không thuộc ')
    .replace(/∩/g, ' giao với ')
    .replace(/∪/g, ' hợp với ')
    .replace(/⊂/g, ' là tập con của ')
    .replace(/→/g, ' suy ra ')
    .replace(/↔/g, ' tương đương ')
    .replace(/⊗/g, ' tích tensor với ')
    .replace(/⊕/g, ' cộng đặc trưng với ')
    .replace(/·/g, ' nhân ')
    .replace(/×/g, ' nhân ')
    .replace(/√/g, ' căn bậc hai của ')
    .replace(/∞/g, ' vô cùng ')
    .replace(/α/g, ' alpha ')
    .replace(/β/g, ' beta ')
    .replace(/γ/g, ' gamma ')
    .replace(/δ/g, ' delta ')
    .replace(/Δ/g, ' độ biến thiên delta ')
    .replace(/ε/g, ' epsilon ')
    .replace(/θ/g, ' theta ')
    .replace(/λ/g, ' lambda ')
    .replace(/μ/g, ' muy ')
    .replace(/π/g, ' pi ')
    .replace(/σ/g, ' sigma ')
    .replace(/τ/g, ' tau ')
    .replace(/ψ/g, ' góc hướng psi ')
    .replace(/ω/g, ' omega ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildFormulaLectureScript(formula: MathFormula, index: number): string {
  const varsText = formula.variables
    .map((v) => `Biến ${humanizeMathForSpeech(v.symbol)} biểu thị ${v.meaning}.`)
    .join(' ');
  return `Công thức số ${index + 1}: ${formula.name}. Biểu thức toán học là: ${humanizeMathForSpeech(
    formula.expression
  )}. Trong đó: ${varsText} Về mặt bản chất và trực giác kỹ thuật: ${humanizeMathForSpeech(
    formula.intuition
  )}`;
}

export function buildSectionLectureScript(sec: TheorySection, index: number): string {
  const bulletsText = sec.bullets
    .map((b, i) => `Điểm chính thứ ${i + 1}: ${humanizeMathForSpeech(b)}`)
    .join(' ');
  const tipText = sec.productionTip
    ? `Lưu ý thực chiến khi triển khai Production: ${humanizeMathForSpeech(sec.productionTip)}`
    : '';
  return `Chuyên đề lý thuyết ${index + 1}: ${sec.title}. ${humanizeMathForSpeech(
    sec.summary
  )} ${bulletsText} ${tipText}`;
}

export function buildDayLecturePlaylist(
  day: CurriculumDay,
  playbook?: ProductionPlaybook | null
): LectureSegment[] {
  const segments: LectureSegment[] = [];

  // 1. Overview & Core Thesis
  const introScript = `Chào mừng bạn đến với bài giảng chuyên sâu ${day.codeLabel}: ${
    day.title
  }, thuộc phân nhóm ${day.category}. Mục tiêu trọng tâm của bài học hôm nay là ${
    day.subtitle
  }. Nguyên lý cốt lõi bạn cần nắm vững trước khi đi vào thiết kế hệ thống là: ${humanizeMathForSpeech(
    day.keyIdea
  )}`;

  segments.push({
    id: `${day.id}_seg_intro`,
    title: 'Phần 1: Tổng quan & Nguyên lý Cốt lõi',
    subtitle: day.title,
    scriptText: introScript,
    podcastTurns: [
      {
        speaker: 'GiangVien',
        text: `Chào mừng các bạn kỹ sư! Hôm nay chúng ta cùng mổ xẻ bài học ${day.title}. Điểm cốt lõi nhất của chủ đề này là gì? ${humanizeMathForSpeech(
          day.keyIdea
        )}`,
      },
      {
        speaker: 'KySu',
        text: `Đúng vậy. Trong các dự án thực tế quy mô lớn thuộc mảng ${day.category}, nếu không nắm chắc nguyên lý này ngay từ khâu thiết kế kiến trúc, hệ thống sẽ gặp điểm nghẽn nghiêm trọng về độ trễ và độ chính xác khi đưa lên phần cứng biên.`,
      },
    ],
  });

  // 2. Mathematical Formulas
  const formulasScript = day.formulas
    .map((f, i) => buildFormulaLectureScript(f, i))
    .join(' Tiếp theo, ');

  segments.push({
    id: `${day.id}_seg_math`,
    title: `Phần 2: Giảng giải ${day.formulas.length} Công thức Toán học`,
    subtitle: day.formulas.map((f) => f.name).join(' · '),
    scriptText: `Bây giờ chúng ta đi sâu vào nền tảng toán học của ${day.title}. ${formulasScript}`,
    podcastTurns: day.formulas.flatMap((f, idx) => [
      {
        speaker: 'GiangVien' as const,
        text: `Hãy xét công thức số ${idx + 1}, ${f.name}: ${humanizeMathForSpeech(
          f.expression
        )}. Các thành phần biến số ở đây bao gồm: ${f.variables
          .map((v) => `${humanizeMathForSpeech(v.symbol)} là ${v.meaning}`)
          .join('; ')}.`,
      },
      {
        speaker: 'KySu' as const,
        text: `Ý nghĩa thực chiến của công thức này rất quan trọng: ${humanizeMathForSpeech(
          f.intuition
        )}`,
      },
    ]),
  });

  // 3. System Architecture & Tensor Flow
  const archNodesText = day.architecture.nodes
    .map(
      (n, idx) =>
        `Tầng thứ ${idx + 1}, ${n.stage} (${n.title}), có kích thước tensor là ${humanizeMathForSpeech(
          n.tensorSpec
        )}: ${humanizeMathForSpeech(n.description)}`
    )
    .join(' ');
  const archScript = `Tiếp theo là phần phân tích sơ đồ kiến trúc hệ thống: ${
    day.architecture.title
  }. Luồng biến đổi dữ liệu đi qua ${
    day.architecture.nodes.length
  } tầng xử lý chính. ${archNodesText} Đặc biệt, hãy lưu ý điểm nghẽn khi triển khai thực tế: ${humanizeMathForSpeech(
    day.architecture.bottleneckNote
  )}`;

  segments.push({
    id: `${day.id}_seg_arch`,
    title: 'Phần 3: Sơ đồ Kiến trúc & Luồng Tensor',
    subtitle: day.architecture.title,
    scriptText: archScript,
    podcastTurns: [
      {
        speaker: 'GiangVien',
        text: `Về mặt kiến trúc hệ thống trong ${day.architecture.title}, dữ liệu sẽ biến đổi qua các tầng tensor như thế nào? ${archNodesText}`,
      },
      {
        speaker: 'KySu',
        text: `Khi đưa đường ống này vào chạy thời gian thực, điểm nghẽn lớn nhất mà các kỹ sư cần tối ưu là: ${humanizeMathForSpeech(
          day.architecture.bottleneckNote
        )}`,
      },
    ],
  });

  // 4. Deep Theory Sections
  const theoryScript = day.sections
    .map((s, i) => buildSectionLectureScript(s, i))
    .join(' Chuyển sang phần tiếp theo: ');

  segments.push({
    id: `${day.id}_seg_theory`,
    title: 'Phần 4: Phân tích Lý thuyết Chuyên sâu',
    subtitle: day.sections.map((s) => s.title).join(' · '),
    scriptText: theoryScript,
    podcastTurns: day.sections.flatMap((s) => [
      {
        speaker: 'GiangVien' as const,
        text: `Trong chuyên đề ${s.title}, ${humanizeMathForSpeech(
          s.summary
        )} Cụ thể: ${humanizeMathForSpeech(s.bullets.join(' '))}`,
      },
      {
        speaker: 'KySu' as const,
        text: s.productionTip
          ? `Mẹo thực chiến từ dự án cho phần này là: ${humanizeMathForSpeech(
              s.productionTip
            )}`
          : `Đây là kiến thức nền tảng giúp lựa chọn đánh đổi chính xác trong bảng thiết kế hệ thống.`,
      },
    ]),
  });

  // 5. Production Playbook (if available)
  if (playbook) {
    const slaText = playbook.latencyAndMemorySLA.join(' ');
    const adrText = playbook.architectureDecisions
      .map(
        (a, i) =>
          `Quyết định kiến trúc số ${i + 1}: ${a.decision}. Lý do: ${a.rationale} Đánh đổi kỹ thuật: ${a.tradeoff}`
      )
      .join(' ');
    const failText = playbook.failureModesAndFixes
      .map(
        (fm, i) =>
          `Tình huống lỗi thực địa số ${i + 1}: Khi gặp hiện tượng ${fm.symptom}, nguyên nhân gốc rễ là do ${fm.rootCause} Giải pháp khắc phục triệt để là: ${fm.engineeringFix}`
      )
      .join(' ');

    const playbookScript = `Phần 5: Cẩm nang thực chiến dự án lớn: ${
      playbook.projectTitle
    }. Quy mô hệ thống mục tiêu là ${playbook.systemScaleSpec}. Các chỉ tiêu SLA cần đạt gồm: ${humanizeMathForSpeech(
      slaText
    )} ${humanizeMathForSpeech(adrText)} Về kinh nghiệm chẩn đoán và sửa lỗi trên thực địa: ${humanizeMathForSpeech(
      failText
    )}`;

    segments.push({
      id: `${day.id}_seg_playbook`,
      title: 'Phần 5: Thực chiến Dự án Lớn & Chẩn đoán Lỗi',
      subtitle: playbook.projectTitle,
      scriptText: playbookScript,
      podcastTurns: [
        {
          speaker: 'GiangVien',
          text: `Bây giờ hãy áp dụng toàn bộ lý thuyết trên vào dự án thực tế: ${playbook.projectTitle} với quy mô ${playbook.systemScaleSpec}. Đâu là các quyết định kiến trúc quan trọng nhất?`,
        },
        {
          speaker: 'KySu',
          text: `${humanizeMathForSpeech(adrText)} Ngoài ra, trên thực địa chúng tôi từng xử lý các lỗi rất điển hình: ${humanizeMathForSpeech(
            failText
          )}`,
        },
      ],
    });
  }

  return segments;
}

export function buildQuestionLectureScript(
  q: QuizQuestion,
  includeExplanation: boolean
): LectureSegment {
  const scenarioPart = q.projectScenario
    ? `Bối cảnh dự án thực tế: ${humanizeMathForSpeech(q.projectScenario)}. `
    : '';
  const optionsPart = q.options
    .map((opt) => humanizeMathForSpeech(opt))
    .join('. ');

  let explanationPart = '';
  if (includeExplanation) {
    const perOpt = (['A', 'B', 'C', 'D'] as const)
      .map((letter) => {
        const key = `${letter} explanation` as
          | 'A explanation'
          | 'B explanation'
          | 'C explanation'
          | 'D explanation';
        return q[key] ? `Về phương án ${letter}: ${humanizeMathForSpeech(q[key]!)}` : '';
      })
      .filter(Boolean)
      .join(' ');

    explanationPart = ` Đáp án chính xác là phương án ${
      q.answer
    }. Giải thích chuyên sâu: ${humanizeMathForSpeech(
      q.explanation
    )} ${perOpt}`;
  } else {
    explanationPart = ` Gợi ý tư duy kỹ thuật: ${humanizeMathForSpeech(q.hint)}`;
  }

  const fullText = `Câu hỏi chuyên đề ${q.topic}, thuộc ${
    q.day_title
  }. ${scenarioPart} Nội dung câu hỏi như sau: ${humanizeMathForSpeech(
    q.question
  )} Các phương án lựa chọn gồm: ${optionsPart}.${explanationPart}`;

  return {
    id: `q_audio_${q.id}_${includeExplanation ? 'exp' : 'stem'}`,
    title: includeExplanation
      ? `Giảng giải Đáp án: ${q.topic}`
      : `Đọc Câu hỏi & Gợi ý: ${q.topic}`,
    subtitle: q.day_title,
    scriptText: fullText,
    podcastTurns: [
      {
        speaker: 'GiangVien',
        text: `${scenarioPart} Câu hỏi đặt ra là: ${humanizeMathForSpeech(
          q.question
        )}`,
      },
      {
        speaker: 'KySu',
        text: includeExplanation
          ? `Đáp án chuẩn xác ở đây là ${q.answer}. Lý do kỹ thuật cốt lõi là: ${humanizeMathForSpeech(
              q.explanation
            )}`
          : `Hãy chú ý gợi ý quan trọng này trước khi chốt đáp án: ${humanizeMathForSpeech(
              q.hint
            )}`,
      },
    ],
  };
}
