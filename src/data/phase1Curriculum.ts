import { CurriculumDay } from '../types/curriculum';

export const PHASE1_CURRICULUM: CurriculumDay[] = [
  {
    id: 'Day 01',
    phase: 'phase1',
    dayNumber: 1,
    codeLabel: 'Day 01',
    title: 'Day 01: Nền tảng AI, LLM và Token Economy',
    subtitle: 'AI Taxonomy, Scaled Dot-Product Attention, Pre-training/SFT/DPO & Token Cost Modeling',
    category: 'Giai đoạn 1: Nền tảng & Xác định sản phẩm',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day01_course.md',
    keyIdea:
      'LLM là mô hình tự hồi quy dự đoán phân phối xác suất của token tiếp theo; chất lượng sản phẩm thực tế phụ thuộc vào cách quản trị ngữ cảnh (Context), kinh tế học Token (Token Economy), công cụ (Tools) và lớp vỏ điều phối (Harness).',
    formulas: [
      {
        name: 'Scaled Dot-Product Attention & Xác suất Tự hồi quy',
        expression: 'Attention(Q, K, V) = softmax( (Q K^T) / √d_k + M ) · V   |   P(w_{1:T}) = ∏_{t=1}^T P(w_t | w_{<t})',
        variables: [
          { symbol: 'Q, K, V', meaning: 'Ma trận Truy vấn (Query), Khóa (Key) và Giá trị (Value) chiếu từ các token đầu vào' },
          { symbol: '√d_k', meaning: 'Hệ số chuẩn hóa giữ phương sai tích vô hướng bằng 1 để tránh bão hòa hàm Softmax' },
          { symbol: 'M', meaning: 'Causal Mask (-∞ ở nửa trên đường chéo) ngăn token hiện tại nhìn trước tương lai' }
        ],
        intuition:
          'Chi phí tính toán Attention tăng bậc hai O(N²) theo chiều dài chuỗi token N, còn bộ nhớ KV Cache tăng tuyến tính theo N × số tầng × kích thước batch.'
      },
      {
        name: 'Phương trình Chi phí Token & Độ trễ Suy luận (Latency)',
        expression: 'Cost_{req} = (N_{in} · P_{in} + N_{out} · P_{out}) / 10^6   |   T_{total} = TTFT(N_{in}) + N_{out} × TPOT',
        variables: [
          { symbol: 'N_{in}, N_{out}', meaning: 'Số lượng token đầu vào (System + History + RAG) và số token sinh ra (Output + Reasoning)' },
          { symbol: 'TTFT', meaning: 'Time-To-First-Token (giai đoạn Prefill xử lý song song toàn bộ N_{in})' },
          { symbol: 'TPOT', meaning: 'Time-Per-Output-Token (giai đoạn Decode sinh tuần tự từng token, bị giới hạn bởi băng thông bộ nhớ)' }
        ],
        intuition:
          'Token đầu ra (Output token) thường đắt gấp 3–5 lần và gây độ trễ lớn hơn nhiều so với Token đầu vào; kiểm soát độ dài đầu ra và dùng Prompt Caching cho phần System/Context cố định giúp giảm tới 70% chi phí.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Tổng thể Hệ thống Agentic LLM (Model + Context + Tools + Harness)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [User Input] ──▶ [Tokenizer (BPE)] ──▶ [Prompt Cache + Dynamic Context]   │
│                                                       │                    │
│                                                       ▼                    │
│  [Harness: Budget / Auth / Loop Guard] ◀──▶ [LLM Transformer (Prefill+KV)] │
│                     │                                                      │
│                     ▼                                                      │
│  [Structured Output / Tool Call Execution] ──▶ [Streaming Response (SSE)]  │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Tokenization',
          title: 'Phân tách BPE (Byte-Pair Encoding)',
          tensorSpec: 'Text → Token IDs [1, N_in]',
          description: 'Tiếng Việt có dấu thường tốn nhiều token hơn tiếng Anh (khoảng 1.3–1.8 token/từ); luôn đo token thực tế bằng tokenizer thay vì đếm ký tự.'
        },
        {
          stage: 'Stage 2: Training Lifecycle',
          title: 'Pre-training → SFT → RLHF / DPO Alignment',
          tensorSpec: 'Base Model → Instruct Model → Aligned Model',
          description: 'Pre-training nạp kiến thức tổng quát; SFT dạy định dạng tuân thủ chỉ dẫn; DPO/RLHF căn chỉnh an toàn và giảm hành vi độc hại.'
        },
        {
          stage: 'Stage 3: Inference Control',
          title: 'Điều khiển Lấy mẫu (Temperature, Top-p, JSON Schema)',
          tensorSpec: 'p_i = exp(z_i / T) / ∑ exp(z_j / T)',
          description: 'Đặt Temperature → 0 cho các tác vụ trích xuất dữ liệu, phân loại và gọi hàm cần tính nhất quán cao.'
        },
        {
          stage: 'Stage 4: Telemetry',
          title: 'Giám sát Token Usage, TTFT & Cost per Task',
          tensorSpec: 'Log: {model, prompt_tokens, cached_tokens, completion_tokens, latency_ms}',
          description: 'Theo dõi chi phí trên mỗi tác vụ hoàn thành thành công (Cost per Resolved Task) thay vì chỉ nhìn đơn giá 1 triệu token.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Trong vòng lặp Agent nhiều bước, toàn bộ lịch sử hội thoại và kết quả gọi tool được gửi lặp lại qua mỗi lượt khiến số lượng Input Token tăng theo cấp số cộng O(K²).'
    },
    sections: [
      {
        id: 'p1-d1-s1',
        title: '1. Phân biệt Discriminative AI, Generative AI và Agentic AI',
        summary: 'Chọn đúng cấp độ công nghệ cho bài toán thực tế.',
        bullets: [
          'Discriminative AI học ranh giới quyết định P(y|x) để phân loại hoặc dự đoán số học có cấu trúc.',
          'Generative AI ước lượng phân phối dữ liệu để sinh văn bản, mã nguồn, âm thanh hoặc hình ảnh mới.',
          'Agentic AI kết hợp LLM với trạng thái (State), công cụ (Tools) và vòng lặp kiểm soát (Harness) để tự lập kế hoạch và hoàn thành mục tiêu nhiều bước.'
        ]
      },
      {
        id: 'p1-d1-s2',
        title: '2. Kinh tế học Token (Token Economy) & Chiến lược Phân tầng Model',
        summary: 'Tối ưu hóa bộ ba Chất lượng – Độ trễ – Chi phí.',
        bullets: [
          'Model Routing / Cascading: Dùng mô hình nhỏ tốc độ cao (Flash / Mini) cho 80% tác vụ phân loại, tóm tắt và định tuyến; chỉ chuyển tiếp lên mô hình suy luận lớn (Pro / Reasoning) khi độ phức tạp cao.',
          'Prompt Caching: Đặt toàn bộ System Prompt, định nghĩa Tool Schema và tài liệu tĩnh lên đầu prompt để tận dụng bộ nhớ đệm KV Cache ở phía nhà cung cấp.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Giai đoạn Huấn luyện và Tùy biến LLM',
      headers: ['Giai đoạn / Kỹ thuật', 'Dữ liệu Cần thiết', 'Mục tiêu Cốt lõi', 'Khi nào Áp dụng trong Sản phẩm'],
      rows: [
        ['Pre-training', 'Hàng nghìn tỷ token văn bản thô', 'Học biểu diễn ngôn ngữ & tri thức nền', 'Do các phòng lab nền tảng thực hiện'],
        ['SFT (Supervised Fine-Tuning)', '1,000 – 100,000 cặp (Instruction, Output)', 'Học định dạng trả lời, giọng văn và tác vụ hẹp', 'Khi cần ép định dạng đặc thù hoặc thu nhỏ xuống model nhỏ'],
        ['DPO / RLHF', 'Cặp phản hồi ưu tiên (Chosen vs Rejected)', 'Căn chỉnh hành vi, độ trung thực và an toàn', 'Khi muốn giảm tỷ lệ bịa đặt hoặc điều chỉnh phong cách'],
        ['RAG + In-Context Learning', 'Kho tài liệu cập nhật thời gian thực', 'Cung cấp tri thức mới có trích dẫn nguồn', 'Mặc định ưu tiên số 1 cho tri thức doanh nghiệp thay đổi liên tục']
      ]
    }
  },
  {
    id: 'Day 02',
    phase: 'phase1',
    dayNumber: 2,
    codeLabel: 'Day 02',
    title: 'Day 02: Chọn đúng bài toán kinh doanh cho AI',
    subtitle: 'AI Suitability Matrix, Automation Spectrum, Stage-Gate Lifecycle & Problem Statement',
    category: 'Giai đoạn 1: Nền tảng & Xác định sản phẩm',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day02_course.md',
    keyIdea:
      'Không phải bài toán nào cũng cần LLM hay Agent; luôn bắt đầu từ điểm nghẽn quy trình, định lượng giá trị kinh doanh và chọn mức tự động hóa tối thiểu (Rule → ML cổ điển → Copilot → Agent) có tỷ số lợi ích trên rủi ro cao nhất.',
    formulas: [
      {
        name: 'Giá trị Kỳ vọng Ròng của Tính năng AI (Risk-Adjusted AI Value)',
        expression: 'E[Value] = P_{success} × V_{gain} - (1 - P_{success}) × C_{failure} - C_{compute} - C_{HITL}',
        variables: [
          { symbol: 'P_{success}', meaning: 'Tỷ lệ mô hình xử lý đúng đáp ứng ngưỡng chất lượng nghiệm thu' },
          { symbol: 'V_{gain}', meaning: 'Giá trị thời gian/chi phí tiết kiệm được trên mỗi giao dịch thành công' },
          { symbol: 'C_{failure}', meaning: 'Chi phí khắc phục hậu quả khi mô hình sai (rủi ro pháp lý, mất khách hàng, làm lại)' },
          { symbol: 'C_{HITL}', meaning: 'Chi phí con người kiểm duyệt (Human-in-the-Loop) cho các ca độ tự tin thấp' }
        ],
        intuition:
          'Nếu chi phí một lần sai C_{failure} rất lớn (ví dụ tự động chuyển tiền hoặc xóa dữ liệu) trong khi P_{success} = 95%, giá trị kỳ vọng E[Value] sẽ âm nếu chạy tự động hoàn toàn — bắt buộc phải chuyển sang mô hình Copilot (gợi ý để người duyệt).'
      }
    ],
    architecture: {
      title: 'Phễu Thẩm định Bài toán & Cổng Quyết định (AI Stage-Gate Funnel)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Quy trình Nghiệp vụ] ──▶ [Kiểm tra: Quy tắc cứng / SQL giải quyết được?] │
│                                  ├── (Có) ──▶ [Dùng Phần mềm Truyền thống] │
│                                  ▼   (Không — Dữ liệu phi cấu trúc/ngữ nghĩa)│
│                       [Đánh giá Mức độ Chấp nhận Sai số & Dữ liệu Sẵn có]  │
│                                  │                                         │
│                                  ▼                                         │
│     [Chọn Mức Tự động hóa: Assisted (Copilot) vs Semi-Auto vs Autonomous]  │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Gate 1: Problem Fit',
          title: 'Loại bỏ 4 Bẫy AI Phổ biến',
          tensorSpec: 'Tránh: Giải pháp tìm bài toán | Tự động hóa 100% sớm',
          description: 'Xác định rõ Actor, Pain Point, Baseline hiện tại và Metric thành công trước khi bàn về việc chọn model nào.'
        },
        {
          stage: 'Gate 2: Data Readiness',
          title: 'Kiểm tra 5 Câu hỏi Sẵn sàng Dữ liệu',
          tensorSpec: 'Quyền truy cập + Độ sạch + Độ trễ + Nhãn + Bảo mật PII',
          description: 'Không có dữ liệu chuẩn làm Ground Truth thì không thể đo lường hay cải tiến mô hình.'
        },
        {
          stage: 'Gate 3: Architecture Split',
          title: 'Tách Phần Tất định (Deterministic) và Phần Xác suất (Probabilistic)',
          tensorSpec: 'Code thường xử lý tính toán/quyền; LLM chỉ xử lý ngôn ngữ',
          description: 'Không bao giờ dùng LLM để cộng hóa đơn hay kiểm tra quyền truy cập khi một hàm code 5 dòng làm chính xác 100%.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Thất bại phổ biến nhất là cố dùng AI tự động hóa toàn trình một quy trình có yêu cầu chính xác 99.99% ngay từ ngày đầu thay vì thiết kế giao diện Copilot tăng tốc cho nhân viên từ 10 phút xuống 1 phút.'
    },
    sections: [
      {
        id: 'p1-d2-s1',
        title: '1. Phổ Tự động hóa (Automation Spectrum) & Phân rã Trách nhiệm',
        summary: 'Đặt con người vào đúng vị trí trong vòng lặp quyết định.',
        bullets: [
          'Level 0 (No AI / Rule-based): Quy trình cố định, đầu vào có cấu trúc rõ ràng.',
          'Level 1 (Information Retrieval & Summarization): Tóm tắt và tìm kiếm thông tin, người dùng tự ra quyết định.',
          'Level 2 (Copilot / Draft & Approve): AI soạn thảo phương án hoặc điền sẵn tham số, con người nhấn xác nhận trước khi thực thi.',
          'Level 3 (Conditional Autonomy with Guardrails): AI tự động thực thi các giao dịch rủi ro thấp (dưới hạn mức) và chuyển các ca ngoại lệ sang người duyệt.'
        ]
      }
    ],
    comparisonTable: {
      title: 'Ma trận Chọn Công nghệ theo Bản chất Bài toán',
      headers: ['Loại Bài toán', 'Đặc điểm Dữ liệu & Yêu cầu', 'Giải pháp Khuyến nghị', 'Lý do Không dùng Agent phức tạp'],
      rows: [
        ['Tính phí, kiểm tra điều kiện hợp lệ', 'Dữ liệu có cấu trúc, logic rõ ràng 100%', 'Rule Engine / Code truyền thống', 'Rẻ hơn 1000 lần, độ trễ < 1ms, không bao giờ ảo giác'],
        ['Dự báo nhu cầu, chấm điểm tín dụng', 'Bảng số liệu lịch sử (Tabular Data)', 'XGBoost / LightGBM / Chuỗi thời gian', 'Chính xác hơn, dễ giải thích (SHAP) và kiểm định hơn LLM'],
        ['Tra cứu chính sách & tóm tắt hồ sơ', 'Văn bản dài, tài liệu PDF/Wiki nội bộ', 'RAG Pipeline + Reranker', 'Luồng cố định, kiểm soát tốt độ trễ và trích dẫn nguồn'],
        ['Xử lý sự cố đa hệ thống cần tra cứu động', 'Phải gọi chuỗi API phụ thuộc kết quả trung gian', 'ReAct / LangGraph Agent + HITL', 'Cần khả năng tự chọn bước tiếp theo dựa trên Observation']
      ]
    }
  },
  {
    id: 'Day 03',
    phase: 'phase1',
    dayNumber: 3,
    codeLabel: 'Day 03',
    title: 'Day 03: Từ chatbot đến agent: ReAct và tool calling',
    subtitle: 'ReAct Loop (Thought-Action-Observation), Tool Schema Design, Function Calling & Safety Boundaries',
    category: 'Giai đoạn 1: Nền tảng & Xác định sản phẩm',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day03_course.md',
    keyIdea:
      'Agent khác Chatbot ở khả năng tương tác với môi trường bên ngoài qua Tool Calling và tự điều chỉnh kế hoạch dựa trên kết quả quan sát trung gian (Observation); mỗi Tool phải có hợp đồng dữ liệu chặt chẽ (JSON Schema), tính bất biến (Idempotency) và giới hạn quyền tối thiểu.',
    formulas: [
      {
        name: 'Xác suất Thành công Chuỗi Bước Gọi Tool & Chi phí Nhân bội',
        expression: 'P_{chain} = ∏_{k=1}^M p_k = p^M   |   Latency_{agent} = ∑_{k=1}^M (T_{LLM, k} + T_{tool, k})',
        variables: [
          { symbol: 'p_k', meaning: 'Xác suất bước suy luận và gọi tool thứ k thành công (ví dụ p = 0.92)' },
          { symbol: 'M', meaning: 'Số bước lặp trong chu trình ReAct (Thought → Action → Observation)' }
        ],
        intuition:
          'Nếu mỗi bước của Agent đạt độ chính xác 90% (p = 0.9), một tác vụ cần chuỗi 7 bước liên tiếp chỉ còn xác suất thành công 0.9^7 ≈ 47.8%! Do đó luôn phải giảm số bước M bằng cách gộp các thao tác tất định vào trong một Coarse-grained Tool.'
      }
    ],
    architecture: {
      title: 'Chu trình ReAct (Reasoning + Acting) và Thực thi Tool An toàn',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [User Goal] ──▶ [LLM: Thought (Phân tích) + Action (Tên Tool & Args JSON)]│
│                                                       │                    │
│                                                       ▼                    │
│  [Harness Validator: Kiểm tra JSON Schema + RBAC + Rate Limit + Dry-Run]   │
│                                                       │                    │
│                                                       ▼                    │
│  [Tool Execution (API/DB)] ──▶ [Observation (Tóm tắt gọn + Mã lỗi rõ)] ────┘
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Thought & Action',
          title: 'Lập luận & Sinh Yêu cầu Gọi Hàm Có Cấu trúc',
          tensorSpec: 'ToolCall = { name: string, arguments: Record<string, any> }',
          description: 'Model không trực tiếp chạy code; nó chỉ sinh ra đối tượng JSON mô tả hàm muốn gọi để ứng dụng kiểm duyệt.'
        },
        {
          stage: 'Stage 2: Schema Validation',
          title: 'Kiểm định Tham số bằng Pydantic / Zod trước khi Chạy',
          tensorSpec: 'Strict Type, Enum Constraints, Min/Max Range',
          description: 'Nếu model truyền sai kiểu dữ liệu, trả về thông báo lỗi có cấu trúc trong Observation để model tự sửa ở vòng lặp kế tiếp.'
        },
        {
          stage: 'Stage 3: Observation Trimming',
          title: 'Cắt gọn Kết quả Trả về từ Tool',
          tensorSpec: 'Giới hạn Observation ≤ 1,000–2,000 tokens',
          description: 'Không bao giờ đổ nguyên một bảng SQL 10,000 dòng vào context; chỉ trả về các trường cần thiết và phân trang rõ ràng.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Cung cấp quá nhiều Tool (ví dụ > 20–30 tools cùng lúc) hoặc mô tả các tool chồng chéo nhau khiến LLM chọn nhầm công cụ và tốn hàng nghìn token định nghĩa schema ở mỗi lượt.'
    },
    sections: [
      {
        id: 'p1-d3-s1',
        title: '1. Nguyên tắc Thiết kế Tool Schema Chuẩn Production (Pokayoke for LLMs)',
        summary: 'Thiết kế giao diện công cụ sao cho mô hình khó mắc lỗi nhất.',
        bullets: [
          'Đặt tên hàm và tham số tự giải thích kèm chuỗi mô tả rõ "Khi nào dùng" và "Khi nào KHÔNG dùng".',
          'Dùng kiểu Enum giới hạn tập giá trị hợp lệ thay vì chuỗi tự do; tách biệt các tool chỉ đọc (Read-only) và các tool có tác dụng phụ ghi/xóa (Write/Mutating tools).',
          'Đảm bảo tính Idempotency (Gọi lại cùng một mã yêu cầu không gây trùng lặp giao dịch) cho mọi tool cập nhật dữ liệu.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Prompting Thuần, Workflow Cố định và ReAct Agent',
      headers: ['Kiến trúc', 'Luồng Điều khiển', 'Độ trễ & Chi phí', 'Trường hợp Sử dụng Tối ưu'],
      rows: [
        ['Single-Turn LLM / CoT', 'Một lần gọi duy nhất', 'Thấp nhất & dự đoán được 100%', 'Phân loại, trích xuất JSON, dịch thuật, tóm tắt văn bản'],
        ['Deterministic Workflow / DAG', 'Code cố định thứ tự các bước gọi LLM/API', 'Trung bình, rất ổn định', 'Quy trình nghiệp vụ đã biết rõ các bước tuần tự (ví dụ ETL + RAG)'],
        ['ReAct / Tool-Calling Agent', 'LLM tự quyết định bước tiếp theo theo kết quả', 'Cao & biến thiên theo số vòng lặp', 'Bài toán mở cần khám phá dữ liệu, gỡ lỗi hoặc tra cứu đa nguồn động']
      ]
    }
  },
  {
    id: 'Day 04',
    phase: 'phase1',
    dayNumber: 4,
    codeLabel: 'Day 04',
    title: 'Day 04: Context, loop và harness engineering',
    subtitle: '4-Layer Agent Architecture, Loop Termination, Checkpointing & Context Compaction',
    category: 'Giai đoạn 1: Nền tảng & Xác định sản phẩm',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day04_course.md',
    keyIdea:
      'Mô hình chỉ là bộ suy luận không trạng thái (Stateless Reasoner); toàn bộ độ tin cậy của hệ thống nằm ở lớp Harness: quản lý cửa sổ ngữ cảnh, điều kiện dừng vòng lặp, lưu điểm khôi phục (Checkpointing) và ngăn chặn thực thi lặp vô hạn.',
    formulas: [
      {
        name: 'Điều kiện Dừng Vòng lặp & Ngân sách Ngữ cảnh (Harness Budget Invariant)',
        expression: 'Stop(t) = (t ≥ T_{max}) ∨ (Cost(1..t) ≥ B_{max}) ∨ (Hash(Action_t) == Hash(Action_{t-1})) ∨ (Done == true)',
        variables: [
          { symbol: 'T_{max}', meaning: 'Số bước lặp tối đa cho phép của một phiên chạy Agent (ví dụ max_steps = 10)' },
          { symbol: 'B_{max}', meaning: 'Trần ngân sách token/chi phí hoặc thời gian chờ tối đa (Timeout)' },
          { symbol: 'Hash(Action_t)', meaning: 'Phát hiện Agent bị kẹt gọi đi gọi lại cùng một tool với cùng tham số (Loop Trap)' }
        ],
        intuition:
          'Không bao giờ tin tưởng LLM sẽ tự sinh token kết thúc đúng lúc; lớp Harness bên ngoài bắt buộc phải cưỡng chế dừng khi chạm ngưỡng bước lặp, ngân sách hoặc phát hiện vòng lặp trùng lặp.'
      }
    ],
    architecture: {
      title: 'Bốn Lớp Kiến trúc của Hệ thống Agent & Quản lý Trạng thái Bền vững',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  Lớp 1: [Context Compiler] (System Rules + Working State + Compact History)│
│  Lớp 2: [Inference Engine] (Stateless LLM Call + Structured Output)        │
│  Lớp 3: [Harness Controller] (Max Steps, Loop Detector, Permission Gate)   │
│  Lớp 4: [State Persistence] (Checkpoint Store, Episodic & Semantic Memory) │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Layer 1: Context',
          title: 'Biên dịch Ngữ cảnh Tối ưu (Context Engineering)',
          tensorSpec: 'Tránh hiệu ứng Lost-in-the-Middle khi context quá dài',
          description: 'Đặt thông tin quan trọng nhất ở đầu và cuối prompt; nén lịch sử cũ bằng tóm tắt có cấu trúc (Rolling Summary).'
        },
        {
          stage: 'Layer 3: Harness',
          title: 'Bộ Điều phối Vòng lặp & Cổng An toàn',
          tensorSpec: 'Retry with Exponential Backoff + Circuit Breaker',
          description: 'Bắt lỗi mạng/API, giới hạn số lần thử lại và chuyển sang trạng thái chờ con người duyệt khi gặp thao tác nhạy cảm.'
        },
        {
          stage: 'Layer 4: Checkpointer',
          title: 'Lưu Trạng thái Từng Bước (Durable Execution)',
          tensorSpec: 'State Snapshot sau mỗi node (Thread ID + Checkpoint ID)',
          description: 'Nếu hệ thống sập ở bước thứ 5, có thể khôi phục chính xác từ bước 4 (Resume) hoặc tua lại (Time-travel debugging) mà không mất tiền chạy lại từ đầu.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Hiện tượng Context Rot (Suy thoái ngữ cảnh) — khi nhồi toàn bộ log lỗi và lịch sử dài vào cửa sổ ngữ cảnh, model bị phân tán sự chú ý và bắt đầu lặp lại các lỗi cũ.'
    },
    sections: [
      {
        id: 'p1-d4-s1',
        title: '1. Kỹ thuật Nén Ngữ cảnh (Context Compaction) & Phân tầng Bộ nhớ',
        summary: 'Duy trì hiệu năng suy luận qua các phiên làm việc kéo dài.',
        bullets: [
          'Working Memory (Scratchpad): Trạng thái tác vụ hiện tại được giữ dưới dạng đối tượng JSON gọn gàng thay vì văn bản hội thoại lan man.',
          'Episodic Memory: Lưu lại các phiên giải quyết thành công trước đây để lấy làm ví dụ Few-shot động.',
          'Semantic Memory: Kho tri thức sự kiện và tùy chọn của người dùng được lưu trữ lâu dài trong cơ sở dữ liệu.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Chiến lược Quản lý Lịch sử Ngữ cảnh',
      headers: ['Chiến lược', 'Cơ chế Hoạt động', 'Chi phí Token', 'Rủi ro Cần Lưu ý'],
      rows: [
        ['Full Append (Nối toàn bộ)', 'Giữ nguyên mọi tin nhắn từ đầu phiên', 'Tăng bậc hai O(T²), rất đắt', 'Tràn context window và giảm độ chính xác do nhiễu'],
        ['Sliding Window (Cửa sổ trượt)', 'Chỉ giữ K lượt trao đổi gần nhất', 'Cố định O(K)', 'Quên mất mục tiêu ban đầu hoặc ràng buộc ở lượt đầu tiên'],
        ['Structured State + Summary', 'Lưu State JSON cố định + Tóm tắt phần cũ', 'Thấp & ổn định', 'Cần thiết kế schema State giữ đủ các biến quan trọng']
      ]
    }
  },
  {
    id: 'Day 05',
    phase: 'phase1',
    dayNumber: 5,
    codeLabel: 'Day 05',
    title: 'Day 05: Product thinking và yêu cầu cho AI product',
    subtitle: 'Probabilistic PRD, Acceptance Criteria (Precision/Recall), UX for Uncertainty & Feedback Loops',
    category: 'Giai đoạn 1: Nền tảng & Xác định sản phẩm',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day05_course.md',
    keyIdea:
      'Sản phẩm AI có đầu ra mang tính xác suất thay vì đúng/sai nhị phân; một tài liệu PRD cho AI bắt buộc phải định nghĩa ngưỡng chấp nhận theo phân phối (Precision, Recall, Latency P95), thiết kế UX cho trường hợp mô hình không chắc chắn và cài đặt vòng lặp thu thập phản hồi ngay trên giao diện.',
    formulas: [
      {
        name: 'Đánh đổi Precision – Recall & Điểm F_β theo Trọng số Nghiệp vụ',
        expression: 'Precision = TP / (TP + FP)   |   Recall = TP / (TP + FN)   |   F_β = (1 + β^2) · (Precision · Recall) / (β^2 · Precision + Recall)',
        variables: [
          { symbol: 'FP (False Positive)', meaning: 'Báo động giả / Gợi ý sai làm phiền người dùng hoặc gây hành động sai' },
          { symbol: 'FN (False Negative)', meaning: 'Bỏ sót trường hợp quan trọng (ví dụ bỏ sót giao dịch gian lận hoặc điều khoản rủi ro)' },
          { symbol: 'β', meaning: 'Hệ số ưu tiên: chọn β = 0.5 nếu cần ưu tiên Precision (tránh nói sai), chọn β = 2.0 nếu cần ưu tiên Recall (không được bỏ sót)' }
        ],
        intuition:
          'Mọi mô hình xác suất đều có ngưỡng cắt τ (Threshold): tăng τ sẽ làm tăng Precision nhưng giảm Recall. PRD phải chỉ rõ bài toán sợ lỗi FP hơn hay sợ lỗi FN hơn.'
      }
    ],
    architecture: {
      title: 'Vòng lặp Phản hồi Sản phẩm AI (Product Flywheel & Graceful Fallback UX)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Model Prediction + Confidence Score / Citation]                          │
│         ├── (Confidence Cao) ──▶ [Hiển thị Kết quả + Trích dẫn nguồn]      │
│         └── (Confidence Thấp) ─▶ [UX Fallback: Nêu rõ giới hạn / Chuyển người]│
│                                                  │                         │
│                                                  ▼                         │
│  [Implicit Signal (Edit/Copy/Accept) + Explicit Feedback] ──▶ [Eval Set]   │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Calibration UX',
          title: 'Hiển thị Độ tin cậy & Nguồn trích dẫn',
          tensorSpec: 'Inline Citations + Highlighted Source Spans',
          description: 'Giúp người dùng kiểm chứng kết quả trong 3 giây thay vì phải đọc lại toàn bộ tài liệu gốc.'
        },
        {
          stage: 'Stage 2: Implicit Telemetry',
          title: 'Thu thập Tín hiệu Hành vi Ẩn (Implicit Feedback)',
          tensorSpec: 'Acceptance Rate | Edit Distance | Time-to-Decision',
          description: 'Người dùng rất ít bấm nút Like/Dislike; tỷ lệ họ giữ nguyên văn bản AI gợi ý (hoặc khoảng cách chỉnh sửa Levenshtein) mới là thước đo chất lượng trung thực nhất.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Viết tiêu chí nghiệm thu kiểu "AI phải trả lời thông minh và chính xác" là vô nghĩa trong kỹ thuật; phải chuyển thành "Đạt Faithfulness ≥ 95% trên bộ Golden Set 200 câu và Latency P95 ≤ 2.5s".'
    },
    sections: [
      {
        id: 'p1-d5-s1',
        title: '1. Cấu trúc chuẩn của một AI PRD (Product Requirements Document)',
        summary: '6 thành phần bắt buộc khác biệt với PRD phần mềm truyền thống.',
        bullets: [
          '1. JTBD & User Persona; 2. Golden Evaluation Dataset (Tập dữ liệu nghiệm thu chuẩn); 3. Ngưỡng chỉ số chất lượng (Quality Metrics) & Độ trễ (P50/P95); 4. Kịch bản Fallback khi model sai hoặc timeout; 5. Thiết kế thu thập phản hồi (Feedback Loop); 6. Phân tầng rủi ro & Guardrails.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Phần mềm Truyền thống và Sản phẩm AI Xác suất',
      headers: ['Khía cạnh', 'Phần mềm Truyền thống (Deterministic)', 'Sản phẩm AI (Probabilistic)'],
      rows: [
        ['Hành vi Hệ thống', 'Đầu vào giống nhau → Đầu ra luôn cố định', 'Phụ thuộc ngữ cảnh, có xác suất sai số và trôi dạt'],
        ['Kiểm thử Nghiệm thu', 'Unit Test / Integration Test (Pass/Fail 100%)', 'Benchmark trên tập Eval Set theo ngưỡng thống kê'],
        ['Xử lý Lỗi trên UI', 'Báo mã lỗi kỹ thuật (400/500)', 'Cơ chế tự sửa, hiển thị nguồn trích dẫn và nút chỉnh sửa nhanh']
      ]
    }
  },
  {
    id: 'Day 06',
    phase: 'phase1',
    dayNumber: 6,
    codeLabel: 'Day 06',
    title: 'Day 06: Quản lý sản phẩm và dự án AI',
    subtitle: 'Scientific Agile, PoC vs MVE vs MVP, 3-Scenario ROI Modeling & Stakeholder Management',
    category: 'Giai đoạn 2: Xây hệ thống & Dữ liệu',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day06_course.md',
    keyIdea:
      'Dự án AI mang tính thực nghiệm khoa học với độ bất định dữ liệu cao; cần quản lý theo các vòng thử nghiệm giới hạn thời gian (Time-boxed Experiments), kiểm chứng giả thuyết bằng MVE (Minimum Viable Evaluation) trước khi đầu tư xây dựng hạ tầng lớn.',
    formulas: [
      {
        name: 'Mô hình ROI Ba Kịch bản & Tổng Chi phí Sở hữu (TCO của Hệ thống AI)',
        expression: 'ROI = (Annual_Benefit - TCO) / TCO   |   TCO = C_{build} + C_{API/GPU} + C_{data_ops} + C_{monitoring/retrain}',
        variables: [
          { symbol: 'C_{build}', meaning: 'Chi phí kỹ sư ban đầu để tích hợp, làm sạch dữ liệu và xây dựng bộ đánh giá' },
          { symbol: 'C_{API/GPU}', meaning: 'Chi phí biến đổi (COGS) tăng tuyến tính theo lưu lượng người dùng và độ dài ngữ cảnh' },
          { symbol: 'C_{monitoring/retrain}', meaning: 'Chi phí duy trì vận hành, gán nhãn bổ sung và cập nhật khi dữ liệu trôi dạt' }
        ],
        intuition:
          'Khác với phần mềm truyền thống có chi phí biên gần bằng 0, mỗi lượt người dùng gọi AI đều tốn chi phí suy luận trực tiếp; nếu không tính trần chi phí ở kịch bản lưu lượng tăng vọt (Bear/Base/Bull case), biên lợi nhuận có thể bị âm.'
      }
    ],
    architecture: {
      title: 'Lộ trình Giảm thiểu Rủi ro: Từ Wizard of Oz / MVE đến Production MVP',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Giả thuyết Giá trị] ──▶ [MVE: 50–100 mẫu thật + Prompt/Eval Script]      │
│                                    │                                       │
│                                    ▼  (Đạt ngưỡng khả thi kỹ thuật)        │
│  [PoC / Wizard of Oz (Kiểm chứng UX)] ──▶ [MVP Production (Có Guardrails)] │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: MVE',
          title: 'Minimum Viable Evaluation (Kiểm chứng Cốt lõi trong 2–3 ngày)',
          tensorSpec: 'Chưa viết UI — chỉ chạy tập mẫu thật qua Notebook/Eval',
          description: 'Xác định ngay xem model hiện đại nhất + prompt tốt nhất có giải quyết nổi bài toán trên dữ liệu thật của công ty hay không.'
        },
        {
          stage: 'Stage 2: MVP',
          title: 'Minimum Viable Product (Đóng gói Luồng Hoàn chỉnh)',
          tensorSpec: 'UI + Telemetry + Fallback + Cost Cap',
          description: 'Triển khai cho một nhóm người dùng thực tế nhỏ (Canary/Beta) để thu thập dữ liệu sử dụng thật.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Dành 2 tháng xây dựng giao diện đẹp và kiến trúc microservice phức tạp trước khi kiểm tra xem LLM có đọc hiểu đúng tài liệu chuyên ngành của dự án hay không.'
    },
    sections: [
      {
        id: 'p1-d6-s1',
        title: '1. Phân biệt rõ PoC, MVE và MVP trong Quản trị Dự án AI',
        summary: 'Đặt tiêu chí hoàn thành (Definition of Done) dựa trên bằng chứng định lượng.',
        bullets: [
          'MVE (Minimum Viable Evaluation): Bộ dữ liệu kiểm thử đại diện + kịch bản chấm điểm tự động để chứng minh tính khả thi mức mô hình.',
          'PoC (Proof of Concept): Bản mẫu kỹ thuật chứng minh khả năng tích hợp luồng dữ liệu.',
          'MVP (Minimum Viable Product): Sản phẩm tối thiểu chạy thật với người dùng cuối, có giám sát, bảo mật và cơ chế xử lý lỗi.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Quản lý Dự án Phần mềm Truyền thống và Dự án AI (Scientific Agile)',
      headers: ['Tiêu chí', 'Agile Phần mềm Truyền thống', 'Scientific Agile cho AI'],
      rows: [
        ['Đơn vị Công việc', 'User Story tính năng giao diện', 'Giả thuyết thực nghiệm (Hypothesis) giới hạn thời gian (Time-boxed)'],
        ['Definition of Done (DoD)', 'Code chạy đúng spec, qua hết test', 'Đạt ngưỡng chỉ số trên tập Eval mà không làm giảm chỉ số an toàn/độ trễ'],
        ['Ước lượng Tiến độ', 'Story Points khá tuyến tính', 'Phân tách rõ phần kỹ thuật chắc chắn và phần nghiên cứu/dữ liệu bất định']
      ]
    }
  },
  {
    id: 'Day 07',
    phase: 'phase1',
    dayNumber: 7,
    codeLabel: 'Day 07',
    title: 'Day 07: Nền tảng dữ liệu: embedding, chunking và vector store',
    subtitle: 'Dense Embeddings, Chunking Strategies, Cosine/Dot/L2 Distance, HNSW Index & Metadata Filtering',
    category: 'Giai đoạn 2: Xây hệ thống & Dữ liệu',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day07_course.md',
    keyIdea:
      'Chất lượng của hệ thống truy xuất (RAG) bị chặn trên bởi chất lượng chuẩn bị dữ liệu: chia đoạn bảo toàn ngữ cảnh (Semantic/Structure-aware Chunking), làm giàu siêu dữ liệu (Metadata Enrichment) và cấu hình chỉ mục đồ thị HNSW hợp lý.',
    formulas: [
      {
        name: 'Độ Tương đồng Cosine, Tích vô hướng (Inner Product) & Khoảng cách Euclid',
        expression: 'cos(u, v) = (u · v) / (||u||_2 ||v||_2)   |   Nếu ||u||_2 = ||v||_2 = 1  thì  ||u - v||_2^2 = 2 - 2(u · v)',
        variables: [
          { symbol: 'u, v ∈ R^d', meaning: 'Vector nhúng của câu truy vấn (Query) và đoạn tài liệu (Chunk)' },
          { symbol: '||u||_2 = 1', meaning: 'Khi các vector đã được chuẩn hóa độ dài đơn vị (L2-normalized), xếp hạng theo Cosine, Dot Product và Euclid là hoàn toàn tương đương' }
        ],
        intuition:
          'Chuẩn hóa L2 toàn bộ vector trước khi lưu vào Vector DB cho phép dùng phép nhân vô hướng (Inner Product) trực tiếp bằng tập lệnh SIMD/AVX, nhanh hơn đáng kể so với tính căn bậc hai của Cosine.'
      }
    ],
    architecture: {
      title: 'Pipeline Tiền xử lý Tài liệu, Chunking & Đánh chỉ mục Vector HNSW',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Tài liệu Gốc (PDF/HTML/Doc)] ──▶ [Document Parser (Giữ Bảng & Tiêu đề)]  │
│                                                  │                         │
│                                                  ▼                         │
│  [Structure-Aware Chunking + Context Header + Metadata (Ngày, Quyền, Mục)] │
│                                                  │                         │
│                                                  ▼                         │
│  [Embedding Model] ──▶ [Vector Store: Pre-filter Metadata + HNSW Graph]    │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Parsing & Cleaning',
          title: 'Bóc tách Cấu trúc & Bảo toàn Bảng biểu',
          tensorSpec: 'Chuyển bảng thành Markdown/JSON thay vì cắt ngang dòng',
          description: 'Lỗi phổ biến nhất làm hỏng RAG là cắt đứt dòng tiêu đề của bảng khỏi các dòng dữ liệu bên dưới.'
        },
        {
          stage: 'Stage 2: Contextual Chunking',
          title: 'Gắn Tiêu đề Phân cấp vào Từng Chunk',
          tensorSpec: 'Chunk = "[Tài liệu: Quy chế X > Mục 3.2] " + Nội dung đoạn',
          description: 'Giúp đoạn văn không bị mất ngữ cảnh khi đứng độc lập (ví dụ biết rõ chữ "Nó" hay "Mức phạt trên" đang nói về điều khoản nào).'
        },
        {
          stage: 'Stage 3: HNSW Indexing',
          title: 'Chỉ mục Hierarchical Navigable Small World',
          tensorSpec: 'Tham số: M (số cạnh nối), efConstruction, efSearch',
          description: 'Tìm kiếm xấp xỉ láng giềng gần nhất (ANN) với độ phức tạp logarit O(log N) thay vì quét vét cạn O(N).'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Khi đổi mô hình Embedding sang phiên bản mới (hoặc đổi số chiều vector), không gian hình học thay đổi hoàn toàn nên bắt buộc phải Re-index (nhúng lại) toàn bộ kho dữ liệu.'
    },
    sections: [
      {
        id: 'p1-d7-s1',
        title: '1. Chiến lược Chunking & Quản trị Siêu dữ liệu (Metadata Filtering)',
        summary: 'Kết hợp lọc cứng theo thuộc tính và tìm kiếm mềm theo vector.',
        bullets: [
          'Fixed-size vs Recursive Character vs Document-Structure Chunking: Luôn ưu tiên tách theo ranh giới tiêu đề Markdown/HTML và đoạn văn tự nhiên kèm độ gối (Overlap 10–15%).',
          'Pre-filtering vs Post-filtering: Lọc theo quyền truy cập (RBAC `tenant_id`, `department`) và hiệu lực thời gian (`status = active`) bắt buộc phải thực hiện trước hoặc tích hợp ngay trong quá trình duyệt chỉ mục để không trả về kết quả rỗng.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Loại Chỉ mục Vector (Vector Indexing Algorithms)',
      headers: ['Loại Chỉ mục', 'Độ chính xác (Recall)', 'Tốc độ Truy vấn', 'Mức Tiêu thụ Bộ nhớ RAM'],
      rows: [
        ['Flat (Exact Brute-Force)', '100% tuyệt đối', 'Chậm O(N) khi N > 100,000', 'Thấp (chỉ lưu vector gốc)'],
        ['IVF-PQ (Inverted File + Quantization)', 'Trung bình – Khá', 'Rất nhanh', 'Rất thấp (nén vector mạnh, tiết kiệm RAM)'],
        ['HNSW (Đồ thị Phân tầng)', 'Rất cao (95–99%+)', 'Cực nhanh O(log N)', 'Cao (tốn RAM lưu các tầng liên kết đồ thị)']
      ]
    }
  },
  {
    id: 'Day 08',
    phase: 'phase1',
    dayNumber: 8,
    codeLabel: 'Day 08',
    title: 'Day 08: RAG: từ truy xuất đến câu trả lời có căn cứ',
    subtitle: 'Hybrid Search (Dense + BM25), Reciprocal Rank Fusion (RRF), Cross-Encoder Reranking & RAGAS',
    category: 'Giai đoạn 2: Xây hệ thống & Dữ liệu',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day08_course.md',
    keyIdea:
      'RAG chuẩn Production không chỉ là tìm kiếm vector đơn thuần: kết hợp tìm kiếm ngữ nghĩa (Dense) với từ khóa chính xác (BM25 Sparse) qua công thức hợp nhất hạng RRF, xếp hạng lại bằng Cross-Encoder Reranker và kiểm định chất lượng bằng bộ tứ chỉ số RAGAS.',
    formulas: [
      {
        name: 'Thuật toán Hợp nhất Thứ hạng Nghịch đảo (Reciprocal Rank Fusion — RRF)',
        expression: 'RRF_Score(d ∈ D) = ∑_{m ∈ {Dense, BM25}} 1 / (k + rank_m(d)) ,   (thường chọn hằng số làm mượt k = 60)',
        variables: [
          { symbol: 'rank_m(d)', meaning: 'Thứ hạng (1, 2, 3...) của tài liệu d trong danh sách kết quả của bộ truy xuất m' },
          { symbol: 'k = 60', meaning: 'Hằng số điều tiết ngăn một bộ truy xuất đơn lẻ chi phối tuyệt đối và không cần chuẩn hóa thang điểm khác nhau giữa BM25 và Cosine' }
        ],
        intuition:
          'Điểm BM25 nằm trong khoảng [0, ∞) còn điểm Cosine nằm trong [-1, 1] nên không thể cộng tuyến tính trực tiếp mà không hiệu chỉnh phân phối. RRF chỉ dựa trên thứ hạng (Rank) nên cực kỳ bền vững và không cần tuning trọng số phức tạp.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Advanced Hybrid RAG 4 Giai đoạn (Rewrite → Hybrid Retrieve → Rerank → Grounded Generate)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [User Query] ──▶ [Query Rewriting / HyDE / Metadata Extraction]           │
│                          ├──▶ [Dense Vector Search (Top-50)] ──┐           │
│                          └──▶ [Sparse BM25 Keyword (Top-50)] ──┼──▶ [RRF]  │
│                                                                │           │
│  [Grounded Answer + Citations] ◀── [Cross-Encoder Reranker (Top-5)] ◀──────┘
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Query Transformation',
          title: 'Làm rõ Truy vấn & Phân rã Câu hỏi Đa ý (Sub-queries)',
          tensorSpec: 'Multi-turn Coreference Resolution + HyDE',
          description: 'Viết lại câu hỏi ngắn dựa trên lịch sử hội thoại (ví dụ đổi "Chi phí của nó là bao nhiêu?" thành "Chi phí gói Enterprise của sản phẩm X là bao nhiêu?").'
        },
        {
          stage: 'Stage 2: Hybrid Retrieval',
          title: 'Kết hợp Ngữ nghĩa (Dense) & Mã định danh Chính xác (BM25)',
          tensorSpec: 'Dense bắt đồng nghĩa; BM25 bắt mã lỗi, tên riêng, số hiệu điều luật',
          description: 'Đảm bảo Recall@50 cao nhất cho cả câu hỏi khái niệm lẫn câu hỏi tra cứu mã sản phẩm cụ thể.'
        },
        {
          stage: 'Stage 3: Cross-Encoder Reranking',
          title: 'Chấm điểm Tương tác Sâu Từng cặp (Query, Document)',
          tensorSpec: 'Cross-Encoder(Concat(q, d)) → Điểm liên quan [0, 1]',
          description: 'Bi-Encoder nén câu hỏi và tài liệu độc lập nên mất tương tác từ-đối-từ; Cross-Encoder đưa cả hai vào chung chuỗi Self-Attention để lọc từ 50 ứng viên xuống 5 đoạn chuẩn xác nhất.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Nếu giai đoạn Retrieval không lấy lên được đoạn văn chứa đáp án (Context Recall = 0), mọi nỗ lực tinh chỉnh Prompt ở bước Generation phía sau đều vô ích.'
    },
    sections: [
      {
        id: 'p1-d8-s1',
        title: '1. Chẩn đoán Hệ thống RAG bằng Bộ tứ Chỉ số RAGAS',
        summary: 'Tách biệt lỗi của bộ Truy xuất (Retriever) và lỗi của bộ Sinh (Generator).',
        bullets: [
          'Context Precision & Context Recall (Đánh giá Retriever): Các đoạn lấy lên có chứa đầy đủ thông tin cần thiết và xếp đoạn đúng lên đầu hay không?',
          'Faithfulness (Độ trung thực — Đánh giá Generator): Câu trả lời chỉ dựa trên ngữ cảnh được cung cấp hay tự bịa thêm thông tin bên ngoài?',
          'Answer Relevancy (Độ sát câu hỏi): Câu trả lời có giải quyết trực diện đúng trọng tâm câu hỏi của người dùng hay không?'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Bi-Encoder (Embedding) và Cross-Encoder (Reranker)',
      headers: ['Tiêu chí', 'Bi-Encoder (Vector Embedding)', 'Cross-Encoder (Reranker)'],
      rows: [
        ['Cơ chế Tính toán', 'Mã hóa Query và Doc thành 2 vector độc lập', 'Đưa cặp [Query, Doc] vào cùng mạng Transformer'],
        ['Tính trước (Pre-computation)', 'Tính và lưu trước toàn bộ vector tài liệu', 'Không thể tính trước, phải chạy trực tiếp lúc truy vấn'],
        ['Vị trí trong Pipeline', 'Vòng 1: Lọc nhanh từ 10 triệu xuống 50 đoạn', 'Vòng 2: Chấm điểm tinh từ 50 đoạn lấy ra Top 5']
      ]
    }
  },
  {
    id: 'Day 09',
    phase: 'phase1',
    dayNumber: 9,
    codeLabel: 'Day 09',
    title: 'Day 09: Multi-agent, MCP, A2A và LangGraph',
    subtitle: 'Supervisor-Worker Pattern, Model Context Protocol (MCP), Agent-to-Agent (A2A) & LangGraph StateGraph',
    category: 'Giai đoạn 2: Xây hệ thống & Dữ liệu',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day09_course.md',
    keyIdea:
      'Khi một Agent đơn lẻ phải gánh quá nhiều công cụ và hướng dẫn trái ngược nhau, hiệu năng suy luận sẽ sụt giảm; tách thành các Agent chuyên biệt điều phối qua đồ thị trạng thái tường minh (LangGraph StateGraph), chuẩn hóa kết nối công cụ bằng MCP và giao tiếp liên tác nhân qua A2A giúp hệ thống mở rộng bền vững.',
    formulas: [
      {
        name: 'Hàm Chuyển tiếp Đồ thị Trạng thái (StateGraph Transition & Reducer)',
        expression: 'S_{t+1} = Reducer( S_t, Node_i(S_t) ) ,   Next_Node = Conditional_Edge(S_{t+1})',
        variables: [
          { symbol: 'S_t', meaning: 'Trạng thái chung có kiểu tường minh (Typed State Schema) chia sẻ giữa các nút trong đồ thị' },
          { symbol: 'Reducer', meaning: 'Quy tắc hợp nhất cập nhật từ các nhánh chạy song song (ví dụ nối danh sách `operator.add` hoặc ghi đè)' },
          { symbol: 'Conditional_Edge', meaning: 'Hàm định tuyến kiểm tra trạng thái S_{t+1} để quyết định rẽ nhánh sang bước tiếp theo hoặc kết thúc' }
        ],
        intuition:
          'Thay vì để các Agent nói chuyện tự do dễ rơi vào vòng lặp tán gẫu vô tận, StateGraph kiểm soát luồng chuyển tiếp bằng các cạnh điều kiện tất định.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Điều phối Đa tác nhân với LangGraph, MCP và Human-in-the-Loop Breakpoint',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Supervisor / Router Node]                                                │
│       ├──▶ [Researcher Agent] ──(MCP Client)──▶ [MCP Servers: DB / Docs]   │
│       ├──▶ [Coder / Analyst Agent] ───────────▶ [Sandbox Execution]        │
│       └──▶ [Human-in-the-Loop Interrupt] ─────▶ [Approve / Edit State]     │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Protocol 1: MCP',
          title: 'Model Context Protocol (Kết nối Agent ↔ Tools/Data)',
          tensorSpec: 'Primitives: Tools (Model-controlled) | Resources | Prompts',
          description: 'Chuẩn hóa giao diện JSON-RPC để viết một MCP Server một lần và cắm vào bất kỳ ứng dụng Agent nào (tương tự cổng USB-C cho AI).'
        },
        {
          stage: 'Protocol 2: A2A',
          title: 'Agent-to-Agent Protocol (Giao tiếp Agent ↔ Agent)',
          tensorSpec: 'Agent Card (Capabilities) + Task Lifecycle + Artifacts',
          description: 'Cho phép các Agent độc lập (khác framework hoặc khác bộ phận) khám phá năng lực của nhau và ủy quyền tác vụ dài hạn.'
        },
        {
          stage: 'Control: HITL Interrupt',
          title: 'Điểm Ngắt Chờ Duyệt (interrupt_before / Command Resume)',
          tensorSpec: 'Tạm dừng đồ thị, giải phóng tài nguyên chờ người dùng xác nhận',
          description: 'Khi người dùng duyệt hoặc sửa tham số, đồ thị tiếp tục chạy từ đúng điểm tạm dừng nhờ Checkpointer.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Hiệu ứng "Telephone Game" (Tam sao thất bản) — khi Agent A tóm tắt chuyển cho Agent B rồi sang Agent C, các chi tiết định lượng quan trọng dễ bị rơi rụng nếu không truyền qua trường dữ liệu có cấu trúc trong Shared State.'
    },
    sections: [
      {
        id: 'p1-d9-s1',
        title: '1. Khi nào thực sự cần Multi-Agent và sự phối hợp giữa MCP với A2A',
        summary: 'Phân rã trách nhiệm hợp lý mà không làm phình to độ trễ.',
        bullets: [
          'Chỉ tách Multi-Agent khi: (1) Số lượng tool vượt quá 15–20 làm giảm độ chính xác chọn tool; (2) Cần tách ngữ cảnh riêng biệt để bảo mật hoặc giảm nhiễu; (3) Có các tác vụ con độc lập có thể chạy song song (Map-Reduce / Fan-out).',
          'MCP là giao thức theo chiều dọc (Agent gọi xuống Công cụ & Dữ liệu), trong khi A2A là giao thức theo chiều ngang (Agent ngang hàng phối hợp và bàn giao công việc cho Agent khác).'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Mô hình Phối hợp Đa tác nhân (Multi-Agent Topologies)',
      headers: ['Mô hình', 'Cơ chế Điều phối', 'Ưu điểm', 'Nhược điểm'],
      rows: [
        ['Supervisor – Worker', 'Một Agent điều phối trung tâm giao việc cho các Worker', 'Dễ kiểm soát, trạng thái tập trung, dễ gỡ lỗi', 'Supervisor có thể thành điểm nghẽn nếu quá nhiều bước'],
        ['Hierarchical (Phân cấp)', 'Supervisor cấp cao điều phối các nhóm Supervisor cấp dưới', 'Mở rộng tốt cho hệ thống doanh nghiệp lớn', 'Độ trễ cao do nhiều tầng trung gian'],
        ['DAG / Sequential Graph', 'Chuyển tiếp theo luồng cố định có điều kiện rẽ nhánh', 'Chi phí thấp nhất, hành vi dự đoán được', 'Ít linh hoạt hơn với các yêu cầu hoàn toàn bất ngờ']
      ]
    }
  },
  {
    id: 'Day 10',
    phase: 'phase1',
    dayNumber: 10,
    codeLabel: 'Day 10',
    title: 'Day 10: Data pipeline và data observability',
    subtitle: 'Batch vs Streaming Ingestion, 6 Data Quality Dimensions, 5 Observability Pillars, Apache Iceberg & Drift',
    category: 'Giai đoạn 2: Xây hệ thống & Dữ liệu',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day10_course.md',
    keyIdea:
      'Lỗi nguy hiểm nhất trong hệ thống AI là lỗi âm thầm (Silent Data Failure): dịch vụ không báo mã lỗi 500 nhưng dữ liệu nguồn bị rỗng, lệch cấu trúc hoặc trôi dạt phân phối khiến mô hình đưa ra câu trả lời sai một cách đầy tự tin.',
    formulas: [
      {
        name: 'Chỉ số Ổn định Quần thể (PSI — Population Stability Index) Phát hiện Data Drift',
        expression: 'PSI = ∑_{b=1}^B (P_b - Q_b) × ln(P_b / Q_b)',
        variables: [
          { symbol: 'P_b, Q_b', meaning: 'Tỷ lệ phần trăm mẫu rơi vào khoảng giá trị (bin) thứ b trên dữ liệu Thực tế mới (P) so với dữ liệu Chuẩn ban đầu (Q)' }
        ],
        intuition:
          'Quy ước công nghiệp: PSI < 0.1 (Phân phối ổn định); 0.1 ≤ PSI < 0.25 (Có dịch chuyển nhẹ cần theo dõi); PSI ≥ 0.25 (Trôi dạt dữ liệu nghiêm trọng — cần cảnh báo và cập nhật lại dữ liệu/mô hình).'
      }
    ],
    architecture: {
      title: 'Kiến trúc Data Pipeline Có Hợp đồng Dữ liệu (Data Contract) & Quan sát 5 Trụ cột',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Sources: DB / CDC / Docs] ──▶ [Data Contract Gate (Schema & Null Check)] │
│                                        ├── (Vi phạm) ──▶ [Dead-Letter Queue]│
│                                        ▼   (Hợp lệ)                        │
│  [Apache Iceberg Lakehouse (Time Travel)] ──▶ [Incremental Vector Sync]    │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Pillar 1–5',
          title: 'Năm Trụ cột Data Observability',
          tensorSpec: 'Freshness | Volume | Schema | Distribution | Lineage',
          description: 'Giám sát tự động độ tươi mới, sự sụt giảm đột ngột số bản ghi, thay đổi kiểu cột, dịch chuyển phân phối và phả hệ dữ liệu.'
        },
        {
          stage: 'Storage: Iceberg',
          title: 'Định dạng Bảng Mở Apache Iceberg',
          tensorSpec: 'ACID Transactions + Snapshot Isolation + Schema Evolution',
          description: 'Cho phép tái lập chính xác trạng thái dữ liệu tại bất kỳ thời điểm lịch sử nào (Time Travel) để phục vụ kiểm toán và huấn luyện lại.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Nếu trang web nguồn đổi giao diện HTML khiến trình cào dữ liệu lấy về toàn chuỗi rỗng và ghi đè thẳng vào Vector Store, toàn bộ tri thức của RAG sẽ bị xóa trắng nếu thiếu cổng kiểm tra độ dài và số lượng tối thiểu (Circuit Breaker).'
    },
    sections: [
      {
        id: 'p1-d10-s1',
        title: '1. Sáu Chiều Chất lượng Dữ liệu & Phòng chống Silent Failures',
        summary: 'Đảm bảo tính toàn vẹn trước khi dữ liệu chạm tới mô hình.',
        bullets: [
          '6 chiều chất lượng: Completeness (Đầy đủ), Accuracy (Chính xác), Consistency (Nhất quán), Timeliness (Kịp thời), Validity (Hợp lệ định dạng), Uniqueness (Không trùng lặp).',
          'Cập nhật Vector Store theo cơ chế Blue-Green / Shadow Index hoặc kiểm tra Hash nội dung để chỉ nhúng lại các đoạn thực sự thay đổi.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Pipeline Xử lý Theo Lô (Batch) và Thời gian thực (Streaming)',
      headers: ['Tiêu chí', 'Batch Pipeline (Định kỳ)', 'Streaming / CDC Pipeline'],
      rows: [
        ['Độ trễ Dữ liệu (Freshness)', 'Từ vài giờ đến 1 ngày', 'Vài giây đến vài phút'],
        ['Chi phí & Độ phức tạp Vận hành', 'Đơn giản, dễ chạy lại toàn bộ khi lỗi', 'Cao (cần quản lý trạng thái bất đồng bộ, thứ tự sự kiện)'],
        ['Ứng dụng trong AI', 'Cập nhật kho tài liệu quy định, báo cáo định kỳ', 'Cập nhật tồn kho, giá cả, trạng thái đơn hàng tức thời']
      ]
    }
  },
  {
    id: 'Day 11',
    phase: 'phase1',
    dayNumber: 11,
    codeLabel: 'Day 11',
    title: 'Day 11: Guardrails, HITL và Responsible AI',
    subtitle: 'Defense-in-Depth, Direct/Indirect Prompt Injection, PII Presidio Masking & Output Grounding',
    category: 'Giai đoạn 3: An toàn, Production & Đánh giá',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day11_course.md',
    keyIdea:
      'System Prompt không phải là biên giới bảo mật; bảo vệ ứng dụng AI đòi hỏi kiến trúc phòng thủ chiều sâu (Defense-in-Depth): lọc đầu vào, cách ly dữ liệu bên thứ ba (chống Indirect Prompt Injection), ẩn danh PII hai chiều, giới hạn quyền công cụ ở mức hệ thống và kiểm duyệt đầu ra.',
    formulas: [
      {
        name: 'Xác suất Lọt Lưới qua Nhiều Lớp Bảo vệ Độc lập (Defense-in-Depth)',
        expression: 'P_{breach} = P_{input_bypass} × P_{model_misalign} × P_{tool_policy_fail} × P_{output_filter_miss}',
        variables: [
          { symbol: 'P_{input_bypass}', meaning: 'Xác suất bộ phân loại đầu vào bỏ lọt câu lệnh tấn công' },
          { symbol: 'P_{tool_policy_fail}', meaning: 'Xác suất lớp kiểm tra quyền (RBAC / Policy Engine) cho phép thao tác trái phép' }
        ],
        intuition:
          'Ngay cả khi kẻ tấn công đánh lừa được LLM thông qua tài liệu nhiễm độc (P_{model_misalign} = 1), nếu lớp thực thi Tool kiểm tra quyền cứng bằng token xác thực của người dùng (P_{tool_policy_fail} = 0), cuộc tấn công vẫn bị chặn đứng.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Phòng thủ Chiều sâu 4 Vành đai (4-Ring AI Guardrails)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [User Input] ──▶ [Ring 1: Input Guard (Injection Classifier + PII Mask)]  │
│                                      │                                     │
│                                      ▼                                     │
│  [Ring 2: Context Delimiters (Tách biệt Chỉ dẫn Hệ thống & Dữ liệu Ngoài)] │
│                                      │                                     │
│                                      ▼                                     │
│  [Ring 3: Deterministic Tool Policy + HITL Gate cho hành động nhạy cảm]    │
│                                      │                                     │
│                                      ▼                                     │
│  [Ring 4: Output Guard (Hallucination / Citation Check + PII Leak Check)]  │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Ring 1: Input & PII',
          title: 'Che giấu Thông tin Định danh Cá nhân (PII Tokenization)',
          tensorSpec: 'Thay "0912345678" bằng "<PHONE_1>" trước khi gửi ra LLM',
          description: 'Lưu bảng ánh xạ trong bộ nhớ phiên an toàn để khôi phục lại khi hiển thị nếu cần, tuyệt đối không để lộ dữ liệu nhạy cảm cho bên thứ ba.'
        },
        {
          stage: 'Ring 2: Indirect Injection',
          title: 'Cách ly Dữ liệu Không tin cậy (Email, Web, CV tải lên)',
          tensorSpec: 'Đóng gói dữ liệu ngoài trong thẻ XML riêng và hạn chế quyền gọi Tool',
          description: 'Chặn kịch bản tài liệu PDF ứng viên cài dòng chữ ẩn yêu cầu Agent tự động gửi email trúng tuyển hoặc rò rỉ dữ liệu nội bộ.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Chạy tất cả các lớp Guardrail bằng LLM lớn sẽ làm nhân đôi độ trễ; cần sử dụng kết hợp Regex/Presidio tốc độ cao và các mô hình phân loại nhỏ (như Llama-Guard / DeBERTa < 30ms) chạy song song với luồng chính.'
      },
    sections: [
      {
        id: 'p1-d11-s1',
        title: '1. Phân biệt Direct Prompt Injection và Indirect Prompt Injection',
        summary: 'Hai bề mặt tấn công đặc trưng của ứng dụng LLM.',
        bullets: [
          'Direct Prompt Injection (Jailbreak): Chính người dùng đang chat cố tình nhập câu lệnh bẻ khóa để vượt qua giới hạn chủ đề hoặc lấy System Prompt.',
          'Indirect Prompt Injection: Người dùng hoàn toàn bình thường, nhưng dữ liệu mà Agent đọc vào (trang web, email gửi đến, tài liệu RAG) có chứa mã độc ngôn ngữ tự nhiên điều khiển Agent thực hiện hành vi nguy hiểm.'
        ]
      }
    ],
    comparisonTable: {
      title: 'Phân tầng Rủi ro Hành động của Agent & Cơ chế Kiểm soát',
      headers: ['Cấp độ Rủi ro', 'Ví dụ Thao tác Công cụ', 'Cơ chế Kiểm soát Bắt buộc'],
      rows: [
        ['Thấp (Read-only nội bộ)', 'Tra cứu tài liệu hướng dẫn công khai', 'Tự động thực thi + Ghi log'],
        ['Trung bình (Ghi nháp)', 'Tạo bản nháp email hoặc tạo ticket hỗ trợ', 'Thực thi giới hạn tốc độ (Rate Limit) + Cho phép hoàn tác (Undo)'],
        ['Cao / Không thể đảo ngược', 'Hoàn tiền, xóa bản ghi, gửi email hàng loạt', 'Bắt buộc tạm dừng chờ Con người Xác nhận (Human-in-the-Loop)']
      ]
    }
  },
  {
    id: 'Day 12',
    phase: 'phase1',
    dayNumber: 12,
    codeLabel: 'Day 12',
    title: 'Day 12: Đưa agent lên production',
    subtitle: 'Multi-stage Docker, Cold Start Optimization, AI API Gateway, Token Rate Limiting & Circuit Breaker',
    category: 'Giai đoạn 3: An toàn, Production & Đánh giá',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day12_course.md',
    keyIdea:
      'Đưa ứng dụng AI từ máy cá nhân lên môi trường thực tế đòi hỏi giải quyết bài toán kết nối kéo dài (SSE/WebSocket), giới hạn hạn mức theo Token thay vì chỉ đếm số Request, cô lập lỗi nhà cung cấp bằng Circuit Breaker và tối ưu hóa kích thước ảnh Docker để giảm thời gian khởi động lạnh.',
    formulas: [
      {
        name: 'Thuật toán Token Bucket cho Giới hạn Tốc độ theo Token (TPM Rate Limiting)',
        expression: 'Tokens_t = min(B_{cap}, Tokens_{t-1} + r · Δt)   |   Cho phép Request nếu N_{est} ≤ Tokens_t',
        variables: [
          { symbol: 'B_{cap}', meaning: 'Dung lượng tối đa của xô (Burst capacity theo số token)' },
          { symbol: 'r', meaning: 'Tốc độ nạp lại token mỗi giây (Tokens per second)' },
          { symbol: 'N_{est}', meaning: 'Số token ước lượng của yêu cầu hiện tại (cập nhật lại số thực tế sau khi hoàn tất)' }
        ],
        intuition:
          'Nếu chỉ giới hạn 10 requests/phút (RPM), một người dùng gửi 10 request mà mỗi request dài 100,000 tokens sẽ làm cạn sạch hạn mức toàn hệ thống. AI Gateway bắt buộc phải giới hạn đồng thời cả RPM, TPM và ngân sách USD theo từng người dùng.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Triển khai Production (AI Gateway + Multi-Provider Failover + Async Worker)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Client] ──(HTTPS/SSE)──▶ [API Gateway: Auth + Token Rate Limit + Budget] │
│                                                  │                         │
│                                                  ▼                         │
│  [Stateless App Containers] ──▶ [AI Router + Circuit Breaker]              │
│                                      ├── (Primary) ──▶ [Model Provider A]  │
│                                      └── (Fallback) ─▶ [Model Provider B]  │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Containerization',
          title: 'Multi-Stage Docker Build & Pre-baked Artifacts',
          tensorSpec: 'python:3.11-slim + uv + Non-root user',
          description: 'Tải sẵn các bộ Tokenizer (tiktoken) hoặc model nhỏ vào trong ảnh Docker lúc build để container không phải tải lại từ internet mỗi khi scale-out.'
        },
        {
          stage: 'Stage 2: Health Checks',
          title: 'Tách biệt /healthz (Liveness) và /ready (Readiness)',
          tensorSpec: 'Liveness: Kiểm tra tiến trình | Readiness: Kiểm tra kết nối DB/Cache',
          description: 'Không bao giờ gọi thử LLM API thật bên trong endpoint `/healthz` được gọi mỗi 5 giây vì sẽ gây tốn tiền vô ích và làm khởi động lại toàn bộ cụm khi nhà cung cấp LLM bị chậm.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Các lệnh gọi LLM kéo dài 5–30 giây; nếu dùng worker đồng bộ truyền thống (Synchronous WSGI), chỉ vài chục yêu cầu đồng thời sẽ khóa cứng toàn bộ luồng xử lý — bắt buộc phải dùng kiến trúc bất đồng bộ (AsyncIO) và hàng đợi tác vụ nền.'
    },
    sections: [
      {
        id: 'p1-d12-s1',
        title: '1. Circuit Breaker, Retry Jitter và Đa nhà cung cấp (Multi-Provider Fallback)',
        summary: 'Đảm bảo độ sẵn sàng cao (High Availability) khi API mô hình bên ngoài gặp sự cố.',
        bullets: [
          'Exponential Backoff with Full Jitter: Khi gặp lỗi 429 (Rate Limit) hoặc 503, chờ một khoảng ngẫu nhiên trong [0, base × 2^attempt] để tránh hiện tượng đàn gia súc (Thundering Herd) cùng đập lại vào server.',
          'Circuit Breaker (Closed → Open → Half-Open): Khi tỷ lệ lỗi của nhà cung cấp A vượt ngưỡng 50% trong 30 giây, ngắt mạch ngay lập tức để chuyển lưu lượng sang mô hình dự phòng B mà không bắt người dùng chờ hết thời gian timeout.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh Liveness Probe (/healthz) và Readiness Probe (/ready)',
      headers: ['Thuộc tính', 'Liveness Probe (/healthz)', 'Readiness Probe (/ready)'],
      rows: [
        ['Mục đích', 'Kiểm tra tiến trình ứng dụng có bị treo (Deadlock) không', 'Kiểm tra container đã sẵn sàng nhận lưu lượng mới chưa'],
        ['Hành động khi Thất bại', 'Khởi động lại (Restart) container', 'Tạm ngắt lưu lượng khỏi Load Balancer, không xóa container'],
        ['Nội dung Kiểm tra', 'Cực nhẹ (trả về 200 OK ngay lập tức)', 'Kiểm tra kết nối tới Database, Redis và nạp cấu hình xong']
      ]
    }
  },
  {
    id: 'Day 13',
    phase: 'phase1',
    dayNumber: 13,
    codeLabel: 'Day 13',
    title: 'Day 13: Monitoring, logging và observability',
    subtitle: 'Distributed Tracing (OpenTelemetry), Span Hierarchy, Percentile Latency (P50/P95/P99) & Alerting',
    category: 'Giai đoạn 3: An toàn, Production & Đánh giá',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day13_course.md',
    keyIdea:
      'Trong hệ thống Agent đa bước, một dòng log văn bản rời rạc không thể cho biết tại sao câu trả lời bị sai hay chậm; cần sử dụng Distributed Tracing (Trace → Spans) gắn theo `trace_id` để quan sát toàn bộ cây thực thi từ Query Rewrite, Vector Retrieval, Reranking, LLM Calls cho tới Tool Execution.',
    formulas: [
      {
        name: 'Phân vị Độ trễ Đuôi (Tail Latency Percentiles: P50, P95, P99)',
        expression: 'P_k = Giá trị độ trễ mà k% số yêu cầu hoàn thành nhanh hơn hoặc bằng nó   (P_{99} ≫ Mean Latency)',
        variables: [
          { symbol: 'P_{50} (Median)', meaning: 'Trải nghiệm của người dùng điển hình ở mức trung vị' },
          { symbol: 'P_{95}, P_{99}', meaning: 'Trải nghiệm của 5% và 1% yêu cầu chậm nhất (thường rơi vào các câu hỏi khó cần Agent lặp nhiều vòng)' }
        ],
        intuition:
          'Độ trễ trung bình (Mean) che giấu các trường hợp cực đoan; trong hệ thống AI, chính 5% yêu cầu phức tạp nhất ở đuôi P95/P99 lại là những tác vụ quan trọng nhất của khách hàng.'
      }
    ],
    architecture: {
      title: 'Cây Truy vết Phân tán (OpenTelemetry Trace & Span Tree cho AI Agent)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Trace ID: tr-89f2a] Total: 2,420 ms | Cost: $0.0042                      │
│   ├── [Span 1: Input Guard & PII Redaction] (18 ms)                        │
│   ├── [Span 2: Hybrid Retrieval (Dense + BM25)] (140 ms)                   │
│   ├── [Span 3: Cross-Encoder Reranker] (92 ms)                             │
│   ├── [Span 4: LLM Step 1 — Tool Selection] (850 ms | TTFT: 310 ms)        │
│   ├── [Span 5: Tool Call — OrderDB Lookup] (220 ms)                        │
│   └── [Span 6: LLM Step 2 — Final Streaming Response] (1,100 ms)           │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Layer 1: Metrics',
          title: 'Chỉ số Tổng hợp Thời gian thực (Prometheus / Grafana)',
          tensorSpec: 'RPS, Error Rate, TTFT P95, Token/sec, Cost/hour',
          description: 'Cho biết hệ thống đang có triệu chứng bất thường ở đâu ngay lập tức.'
        },
        {
          stage: 'Layer 2: Traces',
          title: 'Chuỗi Span Phân cấp (Langfuse / Arize Phoenix / OTel)',
          tensorSpec: 'trace_id + parent_span_id + latency_ms + token_counts',
          description: 'Cho phép khoanh vùng chính xác bước nào (RAG, Tool hay LLM) đang làm chậm hoặc làm sai kết quả.'
        },
        {
          stage: 'Layer 3: Sanitized Logs',
          title: 'Nhật ký Có Cấu trúc (Structured JSON Logs đã lọc PII)',
          tensorSpec: 'Không bao giờ ghi API Key hay dữ liệu nhạy cảm thô ra log',
          description: 'Phục vụ kiểm toán và tái hiện lại đúng phiên bản prompt (`prompt_version`) đã chạy.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Ghi log đồng bộ (Blocking I/O) toàn bộ nội dung prompt/response lớn trên luồng chính sẽ làm tăng độ trễ phản hồi; luôn đẩy dữ liệu quan sát qua hàng đợi bất đồng bộ (Async Batch Exporter).'
    },
    sections: [
      {
        id: 'p1-d13-s1',
        title: '1. Ba Trụ cột Observability (Metrics, Logs, Traces) Đặc thù cho Hệ thống AI',
        summary: 'Theo dõi cả sức khỏe hạ tầng lẫn chất lượng ngữ nghĩa.',
        bullets: [
          'System Telemetry: Tỷ lệ lỗi HTTP 429/5xx, độ trễ TTFT/TPOT, tỷ lệ trúng bộ nhớ đệm (Cache Hit Ratio).',
          'Semantic & Quality Telemetry: Tỷ lệ truy xuất không ra kết quả (Empty Retrieval), tỷ lệ kích hoạt Guardrail, điểm chấm tự động mẫu ngẫu nhiên (Online Async LLM-as-a-Judge trên 5% lưu lượng thật).'
        ]
      }
    ],
    comparisonTable: {
      title: 'Phân biệt vai trò của Metrics, Logs và Distributed Traces',
      headers: ['Trụ cột', 'Câu hỏi Trả lời', 'Chi phí Lưu trữ', 'Ví dụ Cụ thể trong AI App'],
      rows: [
        ['Metrics (Số liệu)', 'Có vấn đề gì đang xảy ra không?', 'Rất thấp (chuỗi thời gian nén)', 'Độ trễ P95 tăng vọt từ 2s lên 9s lúc 10:00 sáng'],
        ['Traces (Truy vết)', 'Vấn đề nằm ở bước nào trong luồng?', 'Trung bình (có thể lấy mẫu)', 'Span gọi Reranker bị nghẽn mất 7.2s trong tổng 9s'],
        ['Logs (Nhật ký)', 'Chi tiết lỗi cụ thể tại bước đó là gì?', 'Cao nếu lưu toàn bộ văn bản', 'Payload chi tiết cho thấy tài liệu thứ 14 chứa ký tự lỗi']
      ]
    }
  },
  {
    id: 'Day 14',
    phase: 'phase1',
    dayNumber: 14,
    codeLabel: 'Day 14',
    title: 'Day 14: Evaluation và benchmarking cho AI',
    subtitle: 'Golden Dataset, Deterministic Assert vs LLM-as-a-Judge, Pairwise Bias & CI/CD Eval Gates',
    category: 'Giai đoạn 3: An toàn, Production & Đánh giá',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day14_course.md',
    keyIdea:
      'Mọi thay đổi về Prompt, mô hình hay chiến lược Chunking đều là phỏng đoán mù quáng nếu không có hệ thống Evaluation tự động; kết hợp kiểm tra tất định (Code-based Assertions) với LLM-as-a-Judge có Rubric thang điểm rõ ràng và hiệu chỉnh theo chuyên gia con người.',
    formulas: [
      {
        name: 'Hiệu chỉnh Độ Lệch của Bộ chấm Tự động (Rogan-Gladen Bias Correction cho LLM-as-a-Judge)',
        expression: 'θ̂ = (p̂ + q_0 - 1) / (q_1 + q_0 - 1) ,   với   q_1 = P(Judge=1 | Human=1),   q_0 = P(Judge=0 | Human=0)',
        variables: [
          { symbol: 'p̂', meaning: 'Tỷ lệ đạt (Pass rate) thô do mô hình LLM-as-a-Judge chấm trên tập kiểm thử' },
          { symbol: 'q_1, q_0', meaning: 'Độ nhạy (Sensitivity) và Độ đặc hiệu (Specificity) của LLM Judge khi đối chiếu với nhãn của chuyên gia con người trên tập mẫu chuẩn' },
          { symbol: 'θ̂', meaning: 'Ước lượng tỷ lệ chất lượng thực sự sau khi đã khử sai số thiên lệch của bộ chấm' }
        ],
        intuition:
          'LLM-as-a-Judge không hoàn hảo 100%; đo độ nhạy q_1 và độ đặc hiệu q_0 của nó trên 100 mẫu do con người chấm chuẩn giúp ta tính được khoảng tin cậy chính xác trên hàng nghìn mẫu tự động.'
      }
    ],
    architecture: {
      title: 'Pipeline Kiểm thử Hồi quy Tự động cho AI (CI/CD Evaluation Gate)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [PR: Thay đổi Prompt / Model / RAG Config]                                │
│               │                                                            │
│               ▼                                                            │
│  [Chạy Golden Eval Suite (Normal + Edge Cases + Adversarial Red-Team)]     │
│               ├──▶ [Tier 1: Code Assertions (JSON, Regex, Citation, Latency)]│
│               └──▶ [Tier 2: Calibrated LLM-as-a-Judge (Rubric 0/1)]        │
│                                      │                                     │
│                                      ▼                                     │
│               [So sánh với Baseline: Chặn Merge nếu tụt ngưỡng]            │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Tier 1: Deterministic',
          title: 'Kiểm tra Tất định bằng Code (Nhanh, Miễn phí, 100% Chính xác)',
          tensorSpec: 'JSON Schema Valid | Keyword Match | SQL Syntax | Latency',
          description: 'Luôn ưu tiên kiểm tra bằng code cho mọi thuộc tính có thể xác định tường minh trước khi gọi đến LLM Judge.'
        },
        {
          stage: 'Tier 2: Model Judge',
          title: 'Chấm điểm Ngữ nghĩa bằng Rubric Phân tách',
          tensorSpec: 'Thang nhị phân (Pass/Fail) hoặc 1–3 kèm giải thích trước khi cho điểm',
          description: 'Tránh thang điểm 1–100 mơ hồ; yêu cầu Judge viết lýận đối chiếu từng tiêu chí rồi mới kết luận điểm số.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Các thiên kiến của LLM-as-a-Judge — Verbosity Bias (thích câu trả lời dài dòng dù rỗng tuếch), Position Bias (ưu tiên phương án đứng đầu A hơn B) và Self-Enhancement Bias (ưu tiên văn phong của chính họ model đó). Khắc phục bằng cách đảo vị trí (A, B) ↔ (B, A) khi chấm cặp.'
    },
    sections: [
      {
        id: 'p1-d14-s1',
        title: '1. Xây dựng Tập Golden Evaluation Dataset & Phân tích Lỗi (Error Analysis)',
        summary: 'Quy trình cải tiến chất lượng dựa trên phân loại nguyên nhân gốc rễ.',
        bullets: [
          'Cấu trúc bộ Golden Set: 50% kịch bản phổ biến (Happy Paths), 30% kịch bản phức tạp/nhiều điều kiện (Hard Cases), và 20% kịch bản đối kháng/ngoài phạm vi (Adversarial & Out-of-scope).',
          'Đóng băng tập Test (Hold-out Benchmark) và cập nhật định kỳ bằng cách bổ sung các trường hợp lỗi thực tế thu thập từ môi trường Production.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Phương pháp Đánh giá Hệ thống AI',
      headers: ['Phương pháp', 'Tốc độ & Chi phí', 'Độ Tin cậy', 'Phạm vi Áp dụng Tốt nhất'],
      rows: [
        ['Code / Heuristic Assertions', 'Tức thì (< 1ms) & Miễn phí', 'Tuyệt đối cho cấu trúc', 'Kiểm tra định dạng JSON, tham số gọi hàm, độ dài, từ cấm'],
        ['Reference-based Metrics (ROUGE/Exact)', 'Rất nhanh & Rẻ', 'Thấp với câu trả lời diễn đạt đa dạng', 'Trích xuất thực thể ngắn, phân loại nhãn cố định'],
        ['LLM-as-a-Judge (Có Rubric)', 'Trung bình (tốn phí API)', 'Cao khi đã hiệu chỉnh với người', 'Đánh giá độ trung thực (Faithfulness), giọng văn, suy luận mở'],
        ['Human Expert Review', 'Chậm & Đắt nhất', 'Tiêu chuẩn vàng (Ground Truth)', 'Xây dựng bộ mẫu chuẩn ban đầu và hiệu chỉnh định kỳ cho LLM Judge']
      ]
    }
  },
  {
    id: 'Day 15',
    phase: 'phase1',
    dayNumber: 15,
    codeLabel: 'Day 15',
    title: 'Day 15: Production, chi phí và định hướng chuyên sâu',
    subtitle: 'Semantic Caching, Model Distillation, Quantization (AWQ/GPTQ), Unit Economics & System Synthesis',
    category: 'Giai đoạn 3: An toàn, Production & Đánh giá',
    defaultStatus: 'completed',
    defaultProgress: 100,
    markdownPath: '/data/phase1_course/day15_course.md',
    keyIdea:
      'Vận hành hệ thống AI ở quy mô lớn đòi hỏi tối ưu hóa kinh tế đơn vị (Unit Economics): kết hợp bộ nhớ đệm đa tầng (Exact & Semantic Cache), chưng cất tri thức từ mô hình lớn sang mô hình nhỏ chuyên biệt (Distillation/SFT), lượng tử hóa trọng số và thiết kế kiến trúc lai tiến hóa bền vững.',
    formulas: [
      {
        name: 'Chi phí Hiệu dụng với Bộ nhớ đệm Đa tầng & Định tuyến Mô hình (Cascaded Routing)',
        expression: 'C_{eff} = (1 - h_{cache}) × [ r_{small} · C_{small} + (1 - r_{small}) · C_{large} ]',
        variables: [
          { symbol: 'h_{cache}', meaning: 'Tỷ lệ truy vấn được phục vụ trực tiếp từ Exact/Semantic Cache (chi phí suy luận ≈ 0)' },
          { symbol: 'r_{small}', meaning: 'Tỷ lệ truy vấn được giải quyết hoàn chỉnh bởi mô hình nhỏ chi phí thấp' },
          { symbol: 'C_{small}, C_{large}', meaning: 'Chi phí trung bình một lần gọi của mô hình nhỏ và mô hình lớn' }
        ],
        intuition:
          'Nếu Semantic Cache chặn được 30% câu hỏi lặp lại (h = 0.3) và Router chuyển 70% số còn lại cho model nhỏ rẻ hơn 15 lần, tổng chi phí vận hành giảm đi gần 80% trong khi chất lượng tổng thể giữ nguyên.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Tối ưu Chi phí & Độ trễ Toàn diện (Cache → Router → Distilled Small Model / Frontier LLM)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Incoming Request] ──▶ [L1 Exact Cache / L2 Semantic Cache (Sim ≥ 0.96)]  │
│                                │ (Cache Miss)                              │
│                                ▼                                           │
│                      [Complexity & Intent Router]                          │
│                        ├── (75% Tác vụ Chuẩn) ──▶ [Distilled / Small Model]│
│                        └── (25% Suy luận Khó) ──▶ [Frontier Reasoning LLM] │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Optimization 1',
          title: 'Prompt Caching & Semantic Caching',
          tensorSpec: 'Ngưỡng tương đồng cực cao (≥ 0.95–0.97) kèm kiểm tra thực thể',
          description: 'Cẩn trọng với Semantic Cache: hai câu "Chính sách hoàn tiền gói Basic" và "Chính sách hoàn tiền gói Pro" có vector rất gần nhau nhưng câu trả lời hoàn toàn khác nhau!'
        },
        {
          stage: 'Optimization 2',
          title: 'Knowledge Distillation & LoRA Fine-Tuning',
          tensorSpec: 'Dùng Frontier LLM sinh nhãn chuẩn → Tinh chỉnh model 7B/8B',
          description: 'Khi một tác vụ hẹp đã ổn định và chạy hàng triệu lần mỗi ngày, chưng cất xuống mô hình nhỏ giúp giảm cả độ trễ lẫn chi phí.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Tối ưu hóa sớm (Premature Optimization) bằng cách tự thuê GPU chạy mô hình mã nguồn mở ngay từ khi sản phẩm chưa có người dùng sẽ tốn chi phí nhân sự vận hành và GPU nhàn rỗi cao hơn nhiều lần so với dùng Serverless API.'
    },
    sections: [
      {
        id: 'p1-d15-s1',
        title: '1. Lộ trình Tối ưu hóa Chi phí theo Giai đoạn Phát triển Sản phẩm',
        summary: 'Chọn chiến lược hạ tầng phù hợp với lưu lượng thực tế.',
        bullets: [
          'Giai đoạn 1 (Tìm Product-Market Fit): Dùng mô hình thương mại mạnh nhất qua API để kiểm chứng chất lượng tối đa và ra mắt nhanh nhất.',
          'Giai đoạn 2 (Tăng trưởng): Tối ưu độ dài Prompt, bật Prompt Caching, cắt gọn kết quả Tool/RAG và áp dụng Model Routing (Small + Large).',
          'Giai đoạn 3 (Quy mô lớn): Thu thập dữ liệu thực tế đã được kiểm duyệt để chưng cất (Distill/LoRA) xuống mô hình nhỏ chuyên biệt chạy bằng vLLM / TensorRT-LLM với lượng tử hóa FP8/INT4.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Kỹ thuật Tối ưu Chi phí và Tốc độ Suy luận AI',
      headers: ['Kỹ thuật', 'Mức Giảm Chi phí', 'Tác động Độ trễ', 'Rủi ro & Điều kiện Áp dụng'],
      rows: [
        ['Prompt Caching (KV Cache)', 'Giảm 50–75% phí Input', 'Giảm mạnh TTFT', 'Yêu cầu giữ cố định phần đầu của Prompt (System + Tools + Few-shot)'],
        ['Model Routing (Phân luồng)', 'Giảm 50–80% tổng phí', 'Nhanh hơn trung bình 2–3×', 'Cần bộ phân loại độ khó chính xác để không gửi nhầm câu khó vào model nhỏ'],
        ['Quantization (FP16 → INT8/INT4)', 'Giảm 50–70% VRAM GPU', 'Tăng thông lượng tokens/s', 'Có thể giảm nhẹ độ chính xác trên các bài toán suy luận toán học nhiều bước']
      ]
    }
  }
];
