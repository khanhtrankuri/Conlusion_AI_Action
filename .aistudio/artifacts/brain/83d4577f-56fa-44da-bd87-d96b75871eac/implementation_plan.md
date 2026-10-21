# AI & Machine Learning Master Study & Timed Exam Hub (Phase 1 & Phase 2)

Hệ thống ôn tập lý thuyết chuyên sâu và luyện thi trắc nghiệm tính giờ toàn diện cho chương trình AI & Học máy: tích hợp trọn vẹn **Phase 1 (15 Day LLM, RAG, Agentic AI & Production)** và **Phase 2 (12 Day Deep Learning, Computer Vision, Kalman Filter, 3D Point Clouds, BEV Sensor Fusion & VLA)** cùng công cụ phân tích năng lực theo từng chủ đề.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Kế hoạch dưới đây đã được thiết kế chuẩn xác dựa trên 3 lựa chọn bạn đã xác nhận. Vui lòng xem qua cấu trúc chương trình và luồng tính năng trước khi nhấn **Proceed** để bắt đầu xây dựng ứng dụng.

- **Confirmed Decision 1 — Tổ chức chương trình 2 Phase độc lập**: Tích hợp đầy đủ **Phase 1** (15 Day LLM/Agentic Systems + 5 chuyên đề nâng cao) và **Phase 2** (12 Day Neural Networks, Computer Vision, Kalman Filter, 3D Point Clouds, Tracking, BEV & Sensor Fusion, VLM/VLA, Closed-Loop Test) theo từng phân khu (Tab) rõ ràng, cho phép chuyển đổi mượt mà hoặc thi tổng hợp liên Phase.
- **Confirmed Decision 2 — Học liệu lý thuyết chuyên sâu kèm công thức & sơ đồ kiến trúc**: Mỗi Day được biên soạn thành tài liệu kỹ thuật chuyên sâu gồm: Bản chất toán học & công thức cốt lõi (Backpropagation, Cross-Entropy, Focal Loss, IoU/GIoU, phương trình dự đoán – cập nhật Kalman Filter, PointNet/Voxel, BEV Lifting, RRF, Token Economics), sơ đồ luồng kiến trúc hệ thống (Architecture Diagrams) và bảng ma trận quyết định kỹ thuật (Trade-off Matrix).
- **Confirmed Decision 3 — Kiểm tra nhanh & Thi thử tính giờ nghiêm ngặt kèm thống kê năng lực**: Hỗ trợ cả **Kiểm tra nhanh (Quick Quiz 10–25 câu)** để rà soát kiến thức vừa học lẫn **Thi thử tính giờ nghiêm ngặt (Strict Timed Exam)** có đồng hồ đếm ngược, tự động khóa và chấm bài khi hết giờ, giải thích chi tiết từng phương án chọn và báo cáo thống kê năng lực đa chiều theo từng Day/chủ đề.

---

### 1. Overview & Core Concept

- **What It Does**: Cung cấp một không gian học tập và khảo thí chuyên nghiệp giúp người học nắm vững lý thuyết cốt lõi, công thức toán học và kiến trúc hệ thống của cả hai giai đoạn đào tạo AI hiện đại:
  - **Phase 1 — LLM, RAG & Agentic AI (15 Days + 5 Chuyên đề)**: Từ nền tảng Token Economy, ReAct, Context/Harness Engineering, AI PRD, Vector Store, Hybrid RAG, Multi-Agent (MCP/A2A/LangGraph), Data Observability, Guardrails đến Production Deployment & Evaluation.
  - **Phase 2 — Deep Learning, 2D/3D Vision, Sensor Fusion & VLA (12 Days)**:
    - *Day 1*: Neural Network & Training (MLP, Activation, Backpropagation, Vanishing/Exploding Gradient, AdamW, Cosine Annealing, Mixed Precision, Regularization)
    - *Day 2*: Deep Learning Architecture for Computer Vision (CNN, ResNet Residual Connections, FPN, Vision Transformer ViT, Swin Transformer, ConvNeXt)
    - *Day 3*: 2D Perception — Detection, Segmentation & Keypoints (Anchor-based vs Anchor-free, YOLO, DETR/Hungarian Matching, Semantic/Instance/Panoptic Segmentation, Keypoint Heatmap vs Regression)
    - *Day 4*: Cảm biến chuỗi khung hình - thời gian (Temporal Modeling, Optical Flow, 3D CNN, ConvLSTM, Video Transformer, Rolling Shutter & Time Synchronization)
    - *Day 5*: Bộ lọc Kalman & Hợp nhất xác suất (Bayes Filter, Linear KF, Extended Kalman Filter EKF, Unscented Kalman Filter UKF, Mahalanobis Distance, Hungarian Data Association)
    - *Day 6*: 3D From Point Clouds (Biểu diễn LiDAR Point Cloud, PointNet/PointNet++, VoxelNet, PointPillars, CenterPoint, 3D IoU & Oriented Bounding Box)
    - *Day 7*: Tracking and Forecasting (Multi-Object Tracking SORT/ByteTrack/AB3DMOT, ID Switch, MOTA/MOTP/HOTA, Motion Forecasting Multi-modal Trajectory, Social Pooling & VectorNet)
    - *Day 8*: BEV & Sensor Fusion (Early/Middle/Late Fusion, Camera-to-BEV Lift-Splat-Shoot, BEVFormer Spatial-Temporal Cross-Attention, BEVFusion Camera + LiDAR + Radar)
    - *Day 9*: Data & Annotation Pipeline (Active Learning, Auto-labeling 2D/3D, 4D Spatio-Temporal Labeling, Inter-Annotator Agreement, Data Curation & Corner Case Mining)
    - *Day 10*: Vision-Language Model & VLA (CLIP Contrastive Learning, LLaVA/Flamingo, Vision-Language-Action Models RT-2/OpenVLA, Action Tokenization, End-to-End Autonomous Driving)
    - *Day 11*: Synthetic, Simulated & Trajectory Data (Domain Gap & Sim-to-Real Transfer, NeRF & 3D Gaussian Splatting cho Sensor Simulation, Generative World Models, Trajectory Augmentation)
    - *Day 12*: Replay & Closed-Loop Test (Log Replay Open-Loop vs Closed-Loop Evaluation, Reactive Traffic Agents, Collision Rate/Off-road Metrics, Safety Filter & Shadow Mode)
- **Target Audience / Persona**: Kỹ sư AI/ML, chuyên viên phát triển sản phẩm AI và học viên chương trình AI chuyên sâu cần hệ thống hóa lý thuyết toán - kiến trúc và rèn luyện phản xạ giải đề dưới áp lực thời gian thực.
- **Key Value**: Thay thế việc đọc rời rạc nhiều nguồn bằng một hệ thống duy nhất kết hợp **Giáo trình công thức & kiến trúc chuẩn hóa** + **Ngân hàng câu hỏi phân tích sâu từng đáp án** + **Bản đồ năng lực cá nhân hóa**.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Chọn Phase & Lộ trình Day**: Tại màn hình chính, người dùng chuyển đổi giữa tab `Phase 1: LLM & Agentic AI (15 Days)` và `Phase 2: Vision, 3D, Fusion & VLA (12 Days)` (hoặc xem `Tất cả 27 Days`). Mỗi Day hiển thị tiến độ đọc lý thuyết, tỷ lệ làm đúng và mức độ thành thạo (`100%`, `50%`, `ĐANG HỌC...` đồng bộ trực quan với giao diện học tập của bạn).
  2. **Đọc Tài liệu Lý thuyết Chuyên sâu (Deep-Dive Study View)**: Khi mở một Day, giao diện chia 2 cột: mục lục điều hướng nhanh bên trái và nội dung chuyên sâu bên phải gồm: *Tóm tắt cốt lõi*, *Công thức toán học & Giải thích biến số*, *Sơ đồ kiến trúc hệ thống (Interactive/Structured Block Diagrams)*, *Bảng so sánh Trade-off*, và nút chuyển sang **Kiểm tra nhanh Day này** ngay lập tức.
  3. **Kiểm tra nhanh & Thi thử tính giờ nghiêm ngặt (Quick Quiz & Strict Timed Exam)**:
     - *Quick Quiz (Kiểm tra nhanh)*: Chọn nhanh 10, 15 hoặc 20 câu theo Day đang học hoặc theo nhóm chủ đề để kiểm tra tức thì trong 10–15 phút.
     - *Strict Timed Exam (Đề thi chuẩn bấm giờ)*: Cấu hình đề thi (theo Phase 1, Phase 2, hoặc Tổng hợp; số lượng 20 / 40 / 60 / 100 câu; thời gian nghiêm ngặt). Đồng hồ đếm ngược cố định góc trên, bản đồ câu hỏi (Question Navigator) đánh dấu câu đã làm / câu gắn cờ xem lại (Flag), tự động nộp bài khi về `00:00`.
  4. **Chấm điểm, Giải thích từng phương án & Thống kê năng lực (Analytics & Mistake Review)**: Sau khi nộp bài, hệ thống hiển thị điểm số, thời gian hoàn thành, phân tích tỷ lệ đúng theo từng Day/chủ đề, giải thích chi tiết vì sao đáp án đúng và vì sao các phương án nhiễu lại sai, đồng thời tự động lưu các câu trả lời sai vào **Kho câu sai (Mistake Bank)** để luyện lại.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Technical Precision & Academic Clarity — giao diện tối (Dark Technical Slate) sắc nét, tập trung tối đa vào khả năng đọc công thức, sơ đồ kiến trúc và bảng dữ liệu mật độ cao mà không gây mỏi mắt.
  - *Color Palette & Mood* (Tuân thủ quy tắc 60-30-10):
    - **60% Dominant Canvas**: Deep Slate (`#020617` / `bg-slate-950`) và bề mặt chính (`#0F172A` / `bg-slate-900`).
    - **30% Structural Surfaces**: Khung nội dung, bảng công thức và sơ đồ kiến trúc với đường viền mảnh 1px (`border-slate-800`), chữ chính trắng sáng (`#F8FAFC`) và chữ phụ xám lạnh (`#94A3B8`).
    - **10% Semantic Accents**: Indigo (`#6366F1`) cho Phase 1 & điều hướng chính; Cyan/Sky (`#0EA5E9`) cho Phase 2 (CV/3D/Autonomous); Emerald (`#10B981`) cho trạng thái hoàn thành 100% / đáp án đúng; Amber (`#F59E0B`) cho cảnh báo thời gian / câu gắn cờ; Rose (`#F43F5E`) cho câu trả lời sai cần ôn lại.
  - *Typography & Hierarchy*:
    - Display & Body: `Plus Jakarta Sans` (rõ ràng, hiện đại, hỗ trợ tiếng Việt hoàn hảo).
    - Formulas, Code & Timer Telemetry: `JetBrains Mono` kết hợp `tabular-nums` cho toàn bộ đồng hồ đếm ngược, công thức toán học, chỉ số phần trăm và bảng thống kê điểm số.
  - *Component Styling & Layout*:
    - **Top Bar Contract (3-Zone Header)**: Zone 1 là tên ứng dụng (`Vin20K AI Master Hub`), Zone 2 gồm 4 liên kết điều hướng một dòng (`Lộ trình học`, `Lý thuyết chuyên sâu`, `Thi thử & Kiểm tra`, `Thống kê năng lực`), Zone 3 là 1 nút hành động chính (`Bắt đầu Kiểm tra Nhanh`).
    - **Zero-Pill Metadata**: Toàn bộ thông tin phụ trên thẻ bài học (số câu hỏi, thời lượng, chủ đề) được trình bày bằng văn bản sạch phân tách bởi dấu `·` thay vì lạm dụng các hộp thuốc (pill badges) rườm rà.
- **Interactive Feedback & Motion**:
  - Chuyển đổi tức thì ($\le 150\text{ms}$) giữa các câu hỏi bằng chuột hoặc phím tắt bàn phím (`1-4` hoặc `A-D` để chọn đáp án, `←/→` để chuyển câu, `F` để gắn cờ câu hỏi).
  - Cảnh báo trực quan trên đồng hồ đếm ngược khi thời gian còn dưới 20% và dưới 1 phút.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Kết hợp dữ liệu thực tế từ Phase 1 với bộ dữ liệu biên soạn chuyên sâu cho Phase 2**
  - *Chosen Approach*: Tải và tích hợp ngân hàng câu hỏi & bài giảng của Phase 1 (từ hệ thống gốc bạn cung cấp) đồng thời biên soạn mới đầy đủ, chi tiết toàn bộ 12 Day của Phase 2 (bài giảng lý thuyết chuyên sâu, công thức toán, sơ đồ kiến trúc và bộ câu hỏi trắc nghiệm tình huống kỹ thuật chuẩn Production/Autonomous AI).
  - *Why*: Đảm bảo bạn không mất bất kỳ kiến thức nào của Phase 1 trong khi có ngay bộ học liệu và câu hỏi chất lượng cao, sát thực tế cho toàn bộ 12 Day của Phase 2 như trong ảnh chụp màn hình.
  - *Alternatives Considered*: Chỉ tạo khung trống cho Phase 2 (bị loại vì bạn cần ôn tập ngay kiến thức chuyên sâu và làm bài kiểm tra thực tế).
- **Decision 2: Tách biệt rõ 2 chế độ "Luyện tập phản hồi ngay" và "Thi thử tính giờ nghiêm ngặt"**
  - *Chosen Approach*: Trong chế độ **Thi thử / Kiểm tra nhanh tính giờ**, đáp án và lời giải được ẩn hoàn toàn cho đến khi nộp bài hoặc hết giờ để rèn tâm lý phòng thi thực tế; bên cạnh đó vẫn hỗ trợ chế độ **Ôn tập theo Day** để xem giải thích ngay sau từng câu khi mới học lý thuyết.
  - *Why*: Đáp ứng đúng yêu cầu thi thử tính giờ nghiêm ngặt của bạn mà vẫn giữ được sự linh hoạt khi mới bắt đầu đọc một Day mới.
- **Decision 3: Lưu trữ trạng thái học tập bền vững trên trình duyệt (LocalStorage Engine)**
  - *Chosen Approach*: Lưu toàn bộ trạng thái hoàn thành từng Day (`100%`, `50%`, `ĐANG HỌC...`), lịch sử các lần thi thử, thống kê năng lực theo chủ đề, câu hỏi đánh dấu (Bookmark) và kho câu làm sai vào `localStorage` kèm tính năng Xuất/Nhập file sao lưu JSON.
  - *Why*: Tốc độ phản hồi 0ms, không bị mất tiến độ khi tải lại trang và hoạt động mượt mà mọi lúc.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           TOP BAR NAVIGATION (3-ZONE)                        │
│  [Vin20K AI Master Hub]     [Lộ trình · Lý thuyết · Thi thử · Thống kê] [CTA]│
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  CURRICULUM & DAY   │     │  DEEP-DIVE THEORY   │     │ STRICT TIMED EXAM &  │
│  TRACKER VIEW       │────▶│  READER VIEW        │────▶│ QUICK QUIZ ENGINE    │
│  - Phase 1 (15 Days)│     │  - Concept Breakdown│     │  - Exam Configurator │
│  - Phase 2 (12 Days)│     │  - Math & Formulas  │     │  - Countdown Timer   │
│  - Status: 100%/50% │     │  - System Diagrams  │     │  - Question Palette  │
│    / ĐANG HỌC...    │     │  - Trade-off Tables │     │  - Auto-Submit @ 0s  │
└──────────┬──────────┘     └──────────┬──────────┘     └───────────┬──────────┘
           │                           │                            │
           └───────────────────────────┼────────────────────────────┘
                                       ▼
                        ┌─────────────────────────────┐
                        │  COMPETENCY ANALYTICS &     │
                        │  MISTAKE REVIEW ENGINE      │
                        │  - Mastery Breakdown by Day │
                        │  - Weak-Topic Detection     │
                        │  - Option-by-Option Explain │
                        │  - Mistake Retest Queue     │
                        └──────────────┬──────────────┘
                                       ▼
                        ┌─────────────────────────────┐
                        │  UNIFIED DATA & STATE STORE │
                        │  - Phase 1 + Phase 2 Corpus │
                        │  - LocalStorage Sync Engine │
                        └─────────────────────────────┘
```

- **Data Model & State**:
  - `CurriculumDay`: `{ id, phase: 1 | 2, dayNumber, title, status: 'completed' | 'in_progress' | 'not_started', masteryPercent, summary, formulas[], architectureDiagram, sections[], comparisonTable, keyTakeaways[] }`
  - `QuizQuestion`: `{ id, phase: 1 | 2, dayId, dayTitle, topic, difficulty: 'CoBan' | 'ThucChien' | 'ChuyenSau', scenario, question, options: { A, B, C, D }, correctAnswer, explanation, optionBreakdowns, formulaHint }`
  - `ExamSession`: `{ id, mode: 'quick_quiz' | 'strict_exam' | 'mistake_review', phaseFilter, selectedDays[], timeLimitSeconds, remainingSeconds, answers: Record<questionId, choice>, flaggedIds[], startedAt, completedAt, score, topicBreakdown }`
- **Interactive Component & State Mapping**:
  - **Phase & Day Selector**: Bộ lọc chuyển đổi giữa `Phase 2 (12 Days - Trọng tâm mới)`, `Phase 1 (15 Days + Bonus)` và `Tất cả`; tìm kiếm trực tiếp theo từ khóa kỹ thuật (ví dụ: `Kalman`, `PointPillars`, `BEV`, `VLA`, `RAG`, `MCP`); nút cập nhật trạng thái học (`ĐANG HỌC...`, `50%`, `100%`) hoặc tự động cập nhật theo điểm kiểm tra.
  - **Theory Reader**: Thanh điều hướng mục lục bên trái, khối hiển thị công thức toán học đóng khung rõ ràng kèm chú giải từng ký hiệu, sơ đồ kiến trúc từng bước (Input $\to$ Backbone $\to$ Neck/Fusion $\to$ Head $\to$ Loss), và nút khởi tạo bài kiểm tra nhanh riêng cho Day đang đọc.
  - **Timed Exam Runner**: Bộ đếm ngược thời gian thực (`setInterval` chính xác theo timestamp chống trôi giờ khi chuyển tab), lưới chuyển câu hỏi nhanh, chế độ khóa đáp án khi hết giờ, và màn hình tổng kết phân tích chi tiết từng câu đúng/sai.
  - **Competency Analytics**: Biểu đồ thanh ngang và ma trận năng lực đối chiếu điểm số của từng Day trong Phase 1 và Phase 2, tự động đề xuất 3 Day có tỷ lệ sai cao nhất để người học ưu tiên ôn tập lại.
