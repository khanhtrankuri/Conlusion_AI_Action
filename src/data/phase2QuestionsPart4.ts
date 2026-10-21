import { QuizQuestion } from '../types/curriculum';

export const PHASE2_QUESTIONS_PART4: QuizQuestion[] = [
  // ==================== DAY 10: VISION - LANGUAGE MODEL & VLA ====================
  {
    id: 'P2_D10_Q01',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'CLIP — Contrastive InfoNCE Loss & Zero-Shot Transfer',
    difficulty: 'Cơ bản',
    question:
      'Trong quá trình huấn luyện mô hình CLIP trên một mini-batch gồm N cặp (Ảnh `v_i`, Văn bản `t_i`), hàm mất mát tương phản đối xứng InfoNCE tối ưu hóa ma trận độ tương đồng Cosine kích thước `N × N` theo mục tiêu nào?',
    options: [
      'A. Cực đại hóa độ tương đồng của N cặp ghép đúng trên đường chéo chính `(v_i, t_i)` đồng thời cực tiểu hóa độ tương đồng của `N² - N` cặp ghép chéo không khớp `(v_i, t_j)` với `i ≠ j`.',
      'B. Làm cho mọi phần tử trong ma trận `N × N` đều bằng 1.0.',
      'C. Chỉ dùng văn bản để tái tạo lại từng điểm ảnh RGB của bức ảnh gốc.',
      'D. Chỉ hoạt động khi kích thước Batch Size N = 1.'
    ],
    answer: 'A',
    hint: 'Trên ma trận N×N, đường chéo chính là các cặp (ảnh, mô tả đúng của ảnh đó), còn ngoài đường chéo là N(N-1) mẫu âm trong cùng batch.',
    formulaRef: 'L = 0.5 · (L_{Image→Text} + L_{Text→Image}) với Softmax theo hàng và theo cột trên ma trận sim(v_i, t_j) / τ',
    explanation:
      'Đáp án đúng là A. Nhờ căn chỉnh trực tiếp không gian nhúng ảnh và văn bản qua hàng trăm triệu cặp dữ liệu với batch size rất lớn (ví dụ N = 32,768), CLIP cho phép nhận diện bất kỳ danh mục mới nào ở chế độ Zero-shot chỉ bằng cách so sánh vector ảnh với vector của câu mô tả `"a photo of a {object}"`.',
    'A explanation': 'Đúng: Nêu chính xác cơ chế đối sánh ma trận N×N của Contrastive Learning trong CLIP.',
    'B explanation': 'Sai: Nếu mọi phần tử đều bằng 1 thì mô hình bị sụp đổ biểu diễn (Representation Collapse).',
    'C explanation': 'Sai: CLIP học trên không gian vector nhúng chứ không sinh lại pixel ảnh.',
    'D explanation': 'Sai: Contrastive Learning với in-batch negatives không thể học được nếu N = 1 (vì không có mẫu âm nào để đẩy ra xa).'
  },
  {
    id: 'P2_D10_Q02',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'VLA Architecture — Action Tokenization in RT-2 / OpenVLA',
    difficulty: 'Chuyên sâu',
    question:
      'Làm thế nào các mô hình Vision-Language-Action (VLA như RT-2, OpenVLA) có thể sử dụng trực tiếp kiến trúc Transformer sinh token của mô hình ngôn ngữ lớn (LLM) để xuất ra lệnh điều khiển liên tục cho robot hoặc quỹ đạo xe tự hành?',
    options: [
      'A. Lượng tử hóa (Discretize / Binning) mỗi chiều hành động liên tục (ví dụ `Δx, Δy, Δz, Δyaw` hoặc các điểm waypoint) thành `B = 256` khoảng giá trị rời rạc đều nhau (hoặc theo phân vị) và ánh xạ mỗi khoảng vào một mã token trong từ điển của LLM (hoặc gắn một Action Head bằng Flow Matching / Diffusion ở đầu ra).',
      'B. Bắt buộc người dùng phải tự gõ lệnh điều khiển bằng bàn phím.',
      'C. Chỉ cho phép robot di chuyển theo 2 hướng là Trái hoặc Phải.',
      'D. Xóa bỏ hoàn toàn bộ mã hóa hình ảnh Vision Encoder.'
    ],
    answer: 'A',
    hint: 'Khi mỗi con số thực liên tục trong đoạn [a_min, a_max] được chia thành 256 mức nguyên 0..255, một vector hành động 7 chiều trở thành một chuỗi gồm đúng 7 tokens!',
    formulaRef: 'bin_d = ⌊ (a_d - a_{min}) / (a_{max} - a_{min}) × 255 ⌋ ∈ {0..255}',
    explanation:
      'Đáp án đúng là A. Bằng cách biểu diễn hành động như một "ngôn ngữ" gồm các token số nguyên rời rạc (hoặc dùng Diffusion Action Expert điều kiện hóa trên trạng thái ẩn của VLM như trong π0 / DriveVLM), mô hình kế thừa trực tiếp khả năng suy luận ngữ nghĩa của VLM để điều khiển vật lý.',
    'A explanation': 'Đúng: Giải thích chuẩn xác cơ chế Action Tokenization và Diffusion/Flow Action Head trong các mô hình VLA.',
    'B explanation': 'Sai: VLA tự động xuất lệnh điều khiển từ ảnh cảm biến và lệnh ngôn ngữ.',
    'C explanation': 'Sai: VLA điều khiển đa bậc tự do liên tục trong không gian 3D.',
    'D explanation': 'Sai: Vision Encoder là thành phần bắt buộc để quan sát môi trường.'
  },
  {
    id: 'P2_D10_Q03',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'System 1 + System 2 Autonomous Driving (DriveVLM-Dual)',
    difficulty: 'Thực chiến',
    question:
      'Một mô hình VLM lớn (7B tham số) có khả năng đọc hiểu biển báo chữ viết tạm thời và suy luận tình huống giao thông phức tạp rất tốt nhưng có độ trễ suy luận 400ms (2.5 Hz), trong khi điều khiển xe an toàn đòi hỏi cập nhật quỹ đạo ở 20 Hz (50ms). Kiến trúc thực tế nào giải quyết mâu thuẫn này?',
    options: [
      'A. Kiến trúc bất đối xứng System 1 + System 2 (Dual-System): Cho nhánh Nhận thức & Quy hoạch BEV/End-to-End truyền thống chạy nhanh ở 20 Hz (System 1 — phản xạ nhanh, chính xác hình học 3D), đồng thời cho VLM chạy bất đồng bộ ở 2–4 Hz (System 2 — suy luận ngữ cảnh, xuất lệnh chiến lược / waypoint dẫn đường để điều kiện hóa System 1).',
      'B. Cho chiếc xe dừng lại hoàn toàn mỗi 400ms để chờ VLM suy nghĩ xong rồi mới đi tiếp.',
      'C. Bỏ hẳn hệ thống tránh va chạm tốc độ cao và chỉ chạy ở 2.5 Hz.',
      'D. Giảm độ phân giải của mọi camera xuống 16×16 pixel.'
    ],
    answer: 'A',
    hint: 'Tương tự tư duy con người (Daniel Kahneman): Hệ thống 1 phản xạ lái xe liên tục hàng mili-giây, Hệ thống 2 phân tích chiến lược khi gặp biển báo lạ hoặc cảnh sát vẫy tay.',
    explanation:
      'Đáp án đúng là A. Đây là kiến trúc chuẩn mực trong các hệ thống VLA tự hành hiện đại (như DriveVLM-Dual): kết hợp tốc độ thời gian thực và độ chính xác 3D của nhánh BEV/End-to-End (System 1) với khả năng hiểu ngữ cảnh đuôi dài của VLM (System 2).',
    'A explanation': 'Đúng: Giải quyết trọn vẹn bài toán độ trễ và độ tin cậy không gian 3D khi đưa VLM lên xe tự hành.',
    'B explanation': 'Sai: Dừng xe liên tục trên đường là bất khả thi.',
    'C explanation': 'Sai: Chạy điều khiển ở 2.5 Hz quá chậm để phản ứng với tình huống cắt đầu đột ngột.',
    'D explanation': 'Sai: Ảnh 16×16 không thể đọc được biển báo hay phát hiện vật thể ở xa.'
  },
  {
    id: 'P2_D10_Q04',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'Visual Token Compression — Q-Former & Pixel Shuffle',
    difficulty: 'Thực chiến',
    question:
      'Khi đưa hình ảnh từ 6 camera độ phân giải cao trên xe vào mô hình VLM, nếu mỗi ảnh sinh ra 1,024 patch tokens (tổng 6,144 visual tokens mỗi frame), thành phần nào trong kiến trúc VLM giúp nén số lượng token thị giác xuống còn 64–256 tokens trước khi đưa vào LLM?',
    options: [
      'A. Bộ kết nối nén Token Thị giác (Visual Token Compressor như Q-Former dùng tập Learnable Queries qua Cross-Attention, Perceiver Resampler, hoặc gộp không gian Pixel Shuffle / C-Abstractor).',
      'B. Tăng kích thước từ điển văn bản của LLM lên gấp 10 lần.',
      'C. Xóa bỏ 5 trong 6 camera trên xe.',
      'D. Thay thế hàm Softmax bằng hàm bậc thang.'
    ],
    answer: 'A',
    hint: 'Độ trễ Prefill (TTFT) và bộ nhớ KV Cache của LLM tỷ lệ với tổng số lượng token đầu vào.',
    formulaRef: 'Z_visual = CrossAttn( Q_learnable [M × D], K_patches [N × D], V_patches [N × D] )  với M ≪ N',
    explanation:
      'Đáp án đúng là A. Hầu hết các patch nền (bầu trời, mặt đường đồng nhất) mang thông tin dư thừa cao. Nén từ N = 1024 patches xuống M = 64 hoặc 128 tokens bằng Q-Former / Spatial Merging giúp giảm chi phí suy luận của LLM đi 8–16 lần mà vẫn giữ được thông tin ngữ nghĩa quan trọng.',
    'A explanation': 'Đúng: Visual Token Compression là kỹ thuật cốt lõi để chạy VLM đa camera hoặc video tốc độ cao.',
    'B explanation': 'Sai: Kích thước từ điển không làm giảm chiều dài chuỗi token ảnh.',
    'C explanation': 'Sai: Làm mất trường nhìn 360 độ quanh xe.',
    'D explanation': 'Sai: Không làm giảm số lượng token.'
  },
  {
    id: 'P2_D10_Q05',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'End-to-End Autonomous Driving — UniAD / VAD Philosophy',
    difficulty: 'Chuyên sâu',
    question:
      'Ưu điểm cốt lõi của kiến trúc Tự hành Toàn trình định hướng Quy hoạch (Planning-oriented End-to-End như UniAD, VAD) so với kiến trúc Phân tách mô-đun cổ điển (Modular Pipeline: Perception → Tracking → Prediction → Planning rời rạc) là gì?',
    options: [
      'A. Truyền các vector đặc trưng truy vấn giàu thông tin (Queries) xuyên suốt các bước thay vì chỉ truyền vài con số tọa độ hộp rời rạc (tránh mất mát thông tin độ bất định và ngữ cảnh), đồng thời cho phép đạo hàm từ hàm Loss của tầng Planning truyền ngược về tận tầng Perception để tối ưu hóa toàn hệ thống cho mục tiêu lái xe an toàn.',
      'B. Không cần sử dụng bất kỳ dữ liệu huấn luyện nào.',
      'C. Loại bỏ hoàn toàn khả năng quan sát các phương tiện xung quanh.',
      'D. Chạy hoàn toàn bằng các câu lệnh if-else viết tay.'
    ],
    answer: 'A',
    hint: 'Trong Modular Pipeline, nếu Perception bỏ sót hộp ở ngưỡng 0.49 (dù có đặc trưng yếu ở 0.48), tầng Planning hoàn toàn mù tịt; còn trong End-to-End, thông tin đặc trưng và độ bất định được truyền liên tục.',
    explanation:
      'Đáp án đúng là A. Tối ưu hóa toàn trình (End-to-End Joint Optimization) ngăn chặn sự tích lũy lỗi qua các giao diện cắt tầng (Information Bottleneck) và giúp mạng tập trung năng lực biểu diễn vào những đối tượng thực sự ảnh hưởng tới quỹ đạo của xe chủ.',
    'A explanation': 'Đúng: Khắc phục cả Information Bottleneck lẫn Misaligned Optimization Objective của kiến trúc rời rạc.',
    'B explanation': 'Sai: Mô hình End-to-End cần lượng dữ liệu quỹ đạo và nhãn phụ trợ rất lớn.',
    'C explanation': 'Sai: UniAD/VAD vẫn có đầy đủ các nhánh Tracking, Mapping và Motion Forecasting trung gian để đảm bảo khả năng giải thích.',
    'D explanation': 'Sai: Đây là kiến trúc mạng học sâu khả vi.'
  },
  {
    id: 'P2_D10_Q06',
    phase: 'phase2',
    day: 'P2_D10',
    day_title: 'Day 10: Vision - Language Model & VLA',
    topic: 'Open-Vocabulary Detection & Auto-Labeling (GroundingDINO + SAM)',
    difficulty: 'Thực chiến',
    question:
      'Sự kết hợp giữa mô hình GroundingDINO (Open-Vocabulary Detector) và SAM (Segment Anything Model) trong pipeline dữ liệu hiện đại giải quyết bài toán gì?',
    options: [
      'A. Cho phép phát hiện hộp giới hạn và tách mặt nạ phân vùng chính xác tới từng pixel cho bất kỳ danh mục đối tượng mới nào chỉ bằng một câu mô tả văn bản (Text Prompt) mà không cần thu thập nhãn thủ công hay huấn luyện lại mô hình từ đầu.',
      'B. Thay thế hoàn toàn cảm biến IMU trên xe.',
      'C. Nén dung lượng video xuống còn 1 byte.',
      'D. Chỉ phân vùng được các bức ảnh y tế chụp X-quang.'
    ],
    answer: 'A',
    hint: 'GroundingDINO nhận (Image + Text Prompt) → xuất 2D Bounding Box; SAM nhận (Image + Bounding Box Prompt) → xuất Pixel-accurate Instance Mask.',
    explanation:
      'Đáp án đúng là A. Khi cần bổ sung một lớp đối tượng mới vào hệ thống (ví dụ "xe giao hàng tự hành nhỏ" hoặc "rào chắn nước"), kỹ sư dùng GroundingDINO + SAM để tự động khởi tạo nhãn hộp và mặt nạ (Zero-shot Pseudo-labeling) trên hàng vạn ảnh chỉ trong vài giờ.',
    'A explanation': 'Đúng: Đây là tổ hợp Foundation Model chuẩn mực nhất cho Open-Vocabulary Detection & Segmentation.',
    'B explanation': 'Sai: Không liên quan đến cảm biến quán tính IMU.',
    'C explanation': 'Sai: Không phải thuật toán nén video.',
    'D explanation': 'Sai: Hoạt động tổng quát trên mọi miền ảnh tự nhiên.'
  },

  // ==================== DAY 11: SYNTHETIC, SIMULATED & TRAJECTORY DATA ====================
  {
    id: 'P2_D11_Q01',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Neural Rendering — NeRF vs 3D Gaussian Splatting (3DGS)',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao công nghệ 3D Gaussian Splatting (3DGS) lại thay thế nhanh chóng NeRF (Neural Radiance Fields) trong việc tái tạo cảnh đường phố 3D từ log thực tế để phục vụ mô phỏng cảm biến thời gian thực?',
    options: [
      'A. Vì NeRF biểu diễn cảnh ẩn trong mạng MLP nên phải lấy mẫu và truy vấn mạng hàng trăm điểm dọc theo mỗi tia sáng (Ray Marching rất chậm); còn 3DGS biểu diễn cảnh tường minh bằng hàng triệu hạt elipsoid Gaussian 3D (có vị trí, hiệp phương sai 3D, độ chắn sáng α và màu Spherical Harmonics) cho phép chiếu và trộn Alpha trực tiếp bằng GPU Rasterizer ở tốc độ >100 FPS.',
      'B. Vì 3DGS không cần bất kỳ bức ảnh nào để tái tạo cảnh 3D.',
      'C. Vì NeRF chỉ tạo ra được ảnh trắng đen 2D.',
      'D. Vì 3DGS không cho phép dịch chuyển hay xoay các phương tiện động trong cảnh.'
    ],
    answer: 'A',
    hint: 'So sánh Implicit Ray Marching (truy vấn MLP triệu lần mỗi ảnh) với Explicit Tile-based Rasterization (chiếu hạt 3D Gaussian xuống 2D).',
    formulaRef: 'C(r) = ∑_{i=1}^N T_i α_i c_i  với  Σ_2D = J W Σ_3D W^T J^T',
    explanation:
      'Đáp án đúng là A. Ngoài tốc độ render thời gian thực (>100 FPS), vì 3DGS là biểu diễn hình học tường minh (Explicit Point/Ellipsoid Cloud), ta có thể dễ dàng tách các hạt Gaussian thuộc về từng chiếc xe theo hộp 3D Track rồi dịch chuyển, xoay, thêm hoặc xóa chiếc xe đó trong kịch bản mô phỏng mới (Dynamic Street Gaussians).',
    'A explanation': 'Đúng: Nêu bật cả ưu thế tốc độ Rasterization lẫn tính dễ biên tập cảnh động (Scene Editing) của 3DGS.',
    'B explanation': 'Sai: 3DGS vẫn cần chuỗi ảnh đa góc nhìn (và LiDAR nếu có) từ log thực tế để tối ưu hóa các hạt Gaussian.',
    'C explanation': 'Sai: NeRF render ảnh màu chân thực nhưng tốc độ chậm.',
    'D explanation': 'Sai: Nhờ biểu diễn tường minh, 3DGS chỉnh sửa vật thể động dễ hơn NeRF rất nhiều.'
  },
  {
    id: 'P2_D11_Q02',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Imitation Learning — Covariate Shift & Trajectory Perturbation',
    difficulty: 'Chuyên sâu',
    question:
      'Khi huấn luyện mô hình lái xe bằng phương pháp Học bắt chước thuần túy (Behavior Cloning) trên hàng triệu giờ dữ liệu chuyên gia lái xe hoàn hảo giữa làn đường, tại sao khi đưa vào chạy thực tế chiếc xe lại dần dần trôi lệch khỏi làn đường rồi đâm vào vỉa hè (Covariate Shift)?',
    options: [
      'A. Vì trong tập dữ liệu chuyên gia chỉ có các trạng thái xe nằm chuẩn giữa làn mà hoàn toàn thiếu các trạng thái xe bị lệch làn; khi mô hình mắc một sai số nhỏ `ε` làm xe hơi lệch sang phải, nó rơi vào vùng phân phối chưa từng thấy lúc train nên tiếp tục ra quyết định sai làm sai số tích lũy bậc hai `O(T²·ε)`. Khắc phục bằng cách làm nhiễu quỹ đạo (Trajectory Perturbation) kèm nhãn đánh lái khôi phục về tâm làn.',
      'B. Vì chuyên gia con người luôn cố tình lái xe lên vỉa hè.',
      'C. Vì hàm mất mát MSE luôn đẩy góc lái về cực đại 90 độ.',
      'D. Vì xe thực tế chạy chậm hơn trong tập dữ liệu.'
    ],
    answer: 'A',
    hint: 'Định lý Ross (DAgger): Học giám sát chuẩn giả định các mẫu i.i.d, nhưng trong điều khiển chuỗi thời gian, hành động ở bước t làm thay đổi phân phối trạng thái đầu vào ở bước t+1.',
    formulaRef: 'Error_BC ~ O(T^2 · ε)   ──(Trajectory Perturbation + Recovery Labels)──▶   O(T · ε)',
    explanation:
      'Đáp án đúng là A. Đây là bài toán kinh điển nhất của End-to-End Driving (từ ALVINN, PilotNet đến các VLA hiện đại): để dạy mô hình biết cách "sửa sai", ta phải tổng hợp các góc nhìn khi xe bị dịch ngang ±0.5m..1.0m hoặc xoay lệch góc (nhờ 3DGS/NeRF hoặc biến đổi hình học BEV) và gán nhãn quỹ đạo uốn mượt quay trở lại tâm làn đường.',
    'A explanation': 'Đúng: Giải thích trọn vẹn bản chất toán học của Covariate Shift và kỹ thuật Trajectory Perturbation.',
    'B explanation': 'Sai: Dữ liệu chuyên gia quá hoàn hảo (luôn ở tâm làn) chính là nguyên nhân khiến mô hình không biết cách xử lý khi bị lệch.',
    'C explanation': 'Sai: MSE có xu hướng dự đoán góc lái gần 0 nếu dữ liệu chủ yếu là đi thẳng.',
    'D explanation': 'Sai: Hiện tượng xảy ra ở mọi tốc độ nếu thiếu dữ liệu khôi phục.'
  },
  {
    id: 'P2_D11_Q03',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Causal Confusion — The Inertia Problem in End-to-End Planning',
    difficulty: 'Thực chiến',
    question:
      'Trong huấn luyện mô hình Quy hoạch chuyển động nhận đầu vào gồm Hình ảnh Camera và Lịch sử vận tốc của chính xe chủ (Ego-status history), hiện tượng "Nhầm lẫn Nhân quả / Học vẹt Quán tính" (Causal Confusion / Copycat Inertia Problem) biểu hiện như thế nào?',
    options: [
      'A. Vì trong 99% thời gian, vận tốc ở giây tiếp theo giống hệt vận tốc ở giây hiện tại, mạng nơ-ron học lối tắt (shortcut) chỉ nhìn vào vận tốc hiện tại của xe mà bỏ qua đèn giao thông và chướng ngại vật trên ảnh — dẫn tới việc xe đang dừng đèn đỏ (`v = 0`) thì đứng im mãi mãi dù đèn đã chuyển xanh, hoặc đang chạy thì không chịu phanh!',
      'B. Chiếc xe luôn tăng tốc lên tối đa bất kể vận tốc hiện tại.',
      'C. Mô hình tự động tắt động cơ khi thấy đèn xanh.',
      'D. Mạng chỉ nhìn vào màu sắc của bầu trời để điều khiển vô-lăng.'
    ],
    answer: 'A',
    hint: 'Biến lịch sử vận tốc Ego có tương quan thống kê quá mạnh và quá dễ học so với việc phải trích xuất ngữ nghĩa từ hàng triệu pixel ảnh.',
    explanation:
      'Đáp án đúng là A. Để chống lại hiện tượng học vẹt quán tính (Causal Confusion), khi huấn luyện các mô hình như UniAD/VAD/VLA, người ta phải áp dụng Ego-Status Dropout (ẩn ngẫu nhiên vận tốc/gia tốc lịch sử của xe chủ), thêm nhiễu vào trạng thái Ego hoặc tăng trọng số mẫu tại các thời điểm chuyển trạng thái (bắt đầu phanh / bắt đầu khởi hành).',
    'A explanation': 'Đúng: Phân tích chính xác nguyên nhân và triệu chứng của bài toán Causal Confusion trong Imitation Learning.',
    'B explanation': 'Sai: Khi v = 0, lối tắt quán tính làm xe dự đoán v_next = 0 mãi mãi.',
    'C explanation': 'Sai: Xe không khởi hành vì phụ thuộc vào biến v_current = 0 chứ không phải vì nhận diện đèn xanh.',
    'D explanation': 'Sai: Lối tắt nằm ở vector trạng thái động học Ego.'
  },
  {
    id: 'P2_D11_Q04',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Sim-to-Real Gap — Appearance Gap vs Content/Behavior Gap',
    difficulty: 'Cơ bản',
    question:
      'Khi sử dụng dữ liệu từ trình mô phỏng đồ họa (như CARLA / Unreal Engine) để huấn luyện AI cho xe tự hành, sự khác biệt giữa "Appearance Gap" (Khoảng cách diện mạo) và "Content / Behavior Gap" (Khoảng cách nội dung & hành vi) là gì?',
    options: [
      'A. Appearance Gap là sự khác biệt ở mức tín hiệu cảm biến (độ chân thực ánh sáng, kết cấu vật liệu, nhiễu CMOS, hiện tượng mất tia LiDAR trên bề mặt đen/ướt); còn Content/Behavior Gap là sự khác biệt ở cấp độ bố cục cảnh và quy luật tương tác giao thông của các phương tiện xung quanh.',
      'B. Appearance Gap chỉ xảy ra với cảm biến GPS, còn Content Gap chỉ xảy ra với cảm biến IMU.',
      'C. Hai khái niệm này hoàn toàn giống nhau và đều tự biến mất nếu tăng độ phân giải màn hình.',
      'D. Trình mô phỏng đồ họa luôn giống thế giới thực 100% ở cả hai khía cạnh.'
    ],
    answer: 'A',
    hint: 'Một bức ảnh có thể rất nét nhưng kết cấu ánh sáng giả (Appearance Gap), hoặc các xe NPC trên đường đi đứng máy móc không giống người thật (Behavior Gap).',
    explanation:
      'Đáp án đúng là A. Để thu hẹp Appearance Gap, ta dùng Neural Rendering (3DGS/NeRF), mô phỏng vật lý tia LiDAR (Ray-drop network) hoặc hợp nhất ở mức biểu diễn trung gian (BEV/Vector). Để thu hẹp Behavior Gap, ta học các mô hình tác nhân giao thông sinh (Generative Traffic Agents) từ dữ liệu thực tế.',
    'A explanation': 'Đúng: Phân tách rõ tầng vật lý cảm biến (Appearance) và tầng phân phối cảnh/hành vi (Content & Behavior).',
    'B explanation': 'Sai: Xuất hiện rõ nhất trên Camera, LiDAR và hành vi các tác nhân.',
    'C explanation': 'Sai: Tăng độ phân giải màn hình không làm hành vi xe NPC thông minh hơn.',
    'D explanation': 'Sai: Luôn tồn tại Sim-to-Real Domain Gap cần xử lý.'
  },
  {
    id: 'P2_D11_Q05',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Generative World Models for Autonomous Driving',
    difficulty: 'Thực chiến',
    question:
      'Một "Mô hình Thế giới" (World Model `p(o_{t+1} | o_{1:t}, a_t)` như GAIA-1, DriveDreamer, OccWorld) đóng vai trò gì trong việc huấn luyện và kiểm thử hệ thống tự hành?',
    options: [
      'A. Học quy luật tiến hóa của môi trường để dự đoán khung cảnh tương lai tiếp theo (video, BEV hoặc 3D Occupancy) dựa trên điều kiện hành động điều khiển `a_t` của xe chủ — cho phép sinh ra các kịch bản giao thông hiếm và đánh giá xem nếu xe chủ chọn rẽ hoặc phanh thì thế giới xung quanh sẽ biến đổi như thế nào.',
      'B. Chỉ dùng để nén file ảnh JPEG nhỏ hơn 2 lần.',
      'C. Thay thế hoàn toàn hệ thống định vị vệ tinh toàn cầu.',
      'D. Chỉ dự đoán thời tiết của tuần sau mà không liên quan đến điều khiển xe.'
    ],
    answer: 'A',
    hint: 'World Model là hàm chuyển tiếp trạng thái học được p(s_{t+1} | s_t, a_t) có điều kiện hóa theo hành động (Action-conditioned).',
    formulaRef: 'ô_{t+1:t+H} ~ p_θ( o_{t+1:t+H} | o_{1:t}, a_{t:t+H-1}, c_{text/map} )',
    explanation:
      'Đáp án đúng là A. Nhờ được điều kiện hóa theo hành động `a_t` (Action-conditioned generation), World Model đóng vai trò như một trình mô phỏng thần kinh học được (Learned Neural Simulator), cho phép kiểm thử các chính sách điều khiển mới hoặc tưởng tượng trước hệ quả của nhiều phương án lái.',
    'A explanation': 'Đúng: Định nghĩa chính xác bản chất Action-conditioned Future Generation của World Models.',
    'B explanation': 'Sai: World Model không phải thuật toán nén file.',
    'C explanation': 'Sai: Không thay thế vệ tinh GPS.',
    'D explanation': 'Sai: Dự đoán trực tiếp cảnh vật và tương tác giao thông ở chân trời vài giây tới.'
  },
  {
    id: 'P2_D11_Q06',
    phase: 'phase2',
    day: 'P2_D11',
    day_title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    topic: 'Validation Discipline — Synthetic Data Rules',
    difficulty: 'Cơ bản',
    question:
      'Khi sử dụng dữ liệu tổng hợp (Synthetic Data / Sim Data) để cải thiện hiệu năng nhận thức trên các lớp đuôi dài, nguyên tắc kỷ luật nào bắt buộc phải tuân thủ đối với tập Validation và Test Benchmark?',
    options: [
      'A. Dữ liệu Synthetic chỉ được đưa vào tập Train (hoặc bộ kiểm thử kịch bản mô phỏng riêng biệt), tuyệt đối KHÔNG trộn dữ liệu Synthetic vào tập Validation/Test dùng để đo lường chất lượng cảm biến thực tế nhằm tránh ảo tưởng điểm cao do mô hình học vẹt đặc trưng đồ họa giả.',
      'B. Thay thế 100% dữ liệu thực tế trong tập Test bằng ảnh vẽ 3D đơn giản.',
      'C. Dùng cùng một cảnh mô phỏng vừa làm tập Train vừa làm tập Test.',
      'D. Không bao giờ kiểm tra mô hình trên dữ liệu cảm biến thật nữa.'
    ],
    answer: 'A',
    hint: 'Mục tiêu cuối cùng là mô hình chạy tốt trên đường phố thật, không phải đạt 100% trên ảnh đồ họa.',
    explanation:
      'Đáp án đúng là A. Nếu trộn ảnh Synthetic vào tập Test chính, điểm mAP tăng lên có thể chỉ do mô hình nhận diện dễ dàng các kết cấu đồ họa của trình render chứ không phản ánh năng lực thực tế trên cảm biến thật.',
    'A explanation': 'Đúng: Giữ tập Real-world Hold-out Test tinh khiết 100% là nguyên tắc bất di bất dịch.',
    'B explanation': 'Sai: Làm mất hoàn toàn giá trị kiểm định thực tế.',
    'C explanation': 'Sai: Vi phạm lỗi Data Leakage nghiêm trọng.',
    'D explanation': 'Sai: Luôn phải đánh giá trên dữ liệu thực tế.'
  },

  // ==================== DAY 12: REPLAY AND CLOSED-LOOP TEST ====================
  {
    id: 'P2_D12_Q01',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Open-Loop vs Closed-Loop Evaluation — The L2 Fallacy',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao một mô hình quy hoạch quỹ đạo đạt sai số khoảng cách `Open-Loop L2 Error` rất thấp (ví dụ 0.3m) trên tập log thu thập sẵn nhưng khi đưa vào chạy `Closed-Loop` (Vòng kín) lại có thể gây tai nạn hoặc đi chệch khỏi đường chỉ sau vài giây?',
    options: [
      'A. Vì trong đánh giá Open-Loop, sau mỗi bước dự đoán hệ thống lại ép đặt vị trí chiếc xe quay về đúng tọa độ của người lái thật trong log nên sai số không bao giờ tích lũy; còn trong Closed-Loop, vị trí xe ở bước `t+1` do chính lệnh lái của mô hình ở bước `t` quyết định, khiến các sai số nhỏ cộng dồn liên tiếp và kiểm tra thực sự khả năng tự hiệu chỉnh của mô hình.',
      'B. Vì trong Closed-Loop cảm biến luôn bị tắt hoàn toàn.',
      'C. Vì Open-Loop L2 Error càng nhỏ thì mô hình càng cố tình đâm vào chướng ngại vật.',
      'D. Vì Closed-Loop chỉ chạy trong thời gian 1 mili-giây.'
    ],
    answer: 'A',
    hint: 'Open-Loop: s_{t+1} = s_{t+1}^{human_log} (Reset mỗi bước). Closed-Loop: s_{t+1} = Dynamics(s_t, π_θ(o_t)) (Tích lũy trạng thái).',
    formulaRef: 'Closed-Loop State Evolution: s_{t+1} = f_{kinematic}(s_t, u_t),  với u_t = π_θ(Render(s_t))',
    explanation:
      'Đáp án đúng là A. Nghiên cứu trên nuPlan và CARLA đã chứng minh sự bất tương quan giữa Open-Loop L2 và Closed-Loop Driving Score: một mô hình chỉ đơn thuần ngoại suy quán tính đường thẳng từ vận tốc hiện tại đạt điểm Open-Loop L2 rất đẹp nhưng đâm ngay ở khúc cua đầu tiên khi chạy Closed-Loop!',
    'A explanation': 'Đúng: Phân biệt rõ bản chất Reset trạng thái của Open-Loop và Tích lũy trạng thái thực thi của Closed-Loop.',
    'B explanation': 'Sai: Closed-Loop cung cấp đầy đủ quan sát cảm biến tương ứng với vị trí mới của xe.',
    'C explanation': 'Sai: L2 thấp không cố tình đâm nhưng bị che khuất lỗi tích lũy và lỗi học vẹt quán tính.',
    'D explanation': 'Sai: Một kịch bản Closed-Loop thường kéo dài 15–60 giây hoặc nhiều km.'
  },
  {
    id: 'P2_D12_Q02',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Non-Reactive Log Replay vs Reactive Traffic Simulation',
    difficulty: 'Thực chiến',
    question:
      'Khi kiểm thử vòng kín (Closed-Loop) cho xe chủ nhưng các phương tiện xung quanh chỉ được phát lại cố định theo tọa độ lịch sử trong log (Non-Reactive Log Replay), hiện tượng lỗi đánh giá "Va chạm giả từ phía sau" (False Rear-End Collision) xảy ra như thế nào?',
    options: [
      'A. Nếu mô hình điều khiển xe chủ đi cẩn thận và chậm hơn người lái trong log một chút, chiếc xe đi phía sau trong log (vốn cứ tiến lên mù quáng theo tọa độ lịch sử cũ mà không biết xe chủ đang ở trước mặt) sẽ đi xuyên qua và đâm vào đuôi xe chủ — khắc phục bằng cách chuyển các xe NPC sang tác nhân có phản ứng (Reactive Agents như IDM).',
      'B. Các xe trong log tự động biến mất ngay khi kịch bản bắt đầu.',
      'C. Xe chủ không thể phanh được trong chế độ Non-Reactive.',
      'D. Mọi chiếc xe đều đi lùi về điểm xuất phát.'
    ],
    answer: 'A',
    hint: 'Trong thực tế, nếu bạn giảm tốc độ nhẹ, xe phía sau sẽ tự giảm tốc theo (Intelligent Driver Model - IDM); nhưng bản ghi lịch sử cứng thì không biết bạn vừa giảm tốc!',
    formulaRef: 'a_{IDM} = a_{max} [ 1 - (v / v_0)^δ - (s^*(v, Δv) / s)^2 ]',
    explanation:
      'Đáp án đúng là A. Đây là hạn chế lớn nhất của Non-Reactive Log Replay: ngay khi quỹ đạo hoặc tốc độ của xe chủ lệch khỏi người lái gốc vài mét, các phương tiện phát lại từ log không phản ứng tương tác nên tạo ra các vụ va chạm vô lý. Dùng Reactive Agents (như IDM hoặc Learned Closed-Loop Agents) giải quyết triệt để vấn đề này.',
    'A explanation': 'Đúng: Mô tả chính xác nguyên nhân gây va chạm giả và vai trò của mô hình phản ứng IDM.',
    'B explanation': 'Sai: Các xe vẫn hiển thị theo tọa độ log.',
    'C explanation': 'Sai: Xe chủ vẫn phanh được nhưng xe sau trong log không phanh theo.',
    'D explanation': 'Sai: Các xe di chuyển theo chiều tiến của log.'
  },
  {
    id: 'P2_D12_Q03',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Composite Driving Score & At-Fault Collision Metrics',
    difficulty: 'Cơ bản',
    question:
      'Tại sao trong bộ chỉ số đánh giá kiểm thử vòng kín (như nuPlan Closed-Loop Score hoặc CARLA Driving Score `DS = Route_Completion × Infraction_Penalty`), điểm tổng hợp phải là PHÉP NHÂN giữa Tiến độ hoàn thành lộ trình (Route Progress) và các Hệ số An toàn/Tuân thủ luật thay vì phép cộng đơn thuần?',
    options: [
      'A. Vì nếu dùng phép cộng, một chính sách "đứng im tại chỗ không nhúc nhích suốt kịch bản" sẽ đạt 100 điểm Không va chạm, 100 điểm Không lệch làn, 100 điểm Êm ái và vẫn có điểm trung bình cộng rất cao; phép nhân đảm bảo nếu Tiến độ = 0% hoặc gây tai nạn nghiêm trọng (hệ số = 0) thì tổng điểm lập tức bằng 0.',
      'B. Vì phép nhân luôn cho kết quả lớn hơn phép cộng.',
      'C. Để cho phép xe vượt đèn đỏ thoải mái miễn là chạy đủ nhanh.',
      'D. Vì máy tính thực hiện phép nhân nhanh hơn phép cộng.'
    ],
    answer: 'A',
    hint: 'Một chiếc xe không bao giờ lăn bánh là chiếc xe không bao giờ tự gây tai nạn, nhưng hoàn toàn vô dụng về mặt chức năng!',
    formulaRef: 'Score = No_At_Fault_Collision × Drivable_Area_Compliance × Weighted_Average(Progress, TTC, Comfort)',
    explanation:
      'Đáp án đúng là A. Cấu trúc điểm nhân phân cấp (Hierarchical Multiplicative Scoring) đặt các điều kiện sống còn (Không gây va chạm At-Fault, Không lao ra ngoài đường, Có di chuyển đúng hướng) làm các thừa số cổng (Multiplier Gates ∈ {0, 1}): vi phạm bất kỳ cổng an toàn nào hoặc đứng yên đều bị điểm 0.',
    'A explanation': 'Đúng: Ngăn chặn chính sách suy biến "đứng im để lấy điểm an toàn tuyệt đối".',
    'B explanation': 'Sai: Nhân các số trong đoạn [0, 1] luôn nhỏ hơn hoặc bằng từng số thành phần.',
    'C explanation': 'Sai: Vượt đèn đỏ bị phạt nhân hệ số giảm điểm nặng hoặc đánh trượt.',
    'D explanation': 'Sai: Lý do nằm ở thiết kế hàm mục tiêu đánh giá hệ thống.'
  },
  {
    id: 'P2_D12_Q04',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Safety & Comfort Metrics — TTC & Jerk',
    difficulty: 'Thực chiến',
    question:
      'Một xe tự hành đang chạy ở vận tốc `v_ego = 25 m/s` bám theo một xe tải phía trước chạy cùng làn ở vận tốc `v_lead = 15 m/s`, khoảng cách hiện tại giữa mũi xe tự hành và đuôi xe tải là `Δd = 15 mét`. Chỉ số Thời gian tới va chạm `TTC (Time-to-Collision)` tại thời điểm này bằng bao nhiêu và có nằm trong vùng nguy hiểm hay không?',
    options: [
      'A. TTC = 1.5 giây — nằm trong vùng nguy hiểm (thường cảnh báo/can thiệp khi TTC < 2.0 giây).',
      'B. TTC = 10.0 giây — hoàn toàn an toàn.',
      'C. TTC = 0.375 giây.',
      'D. TTC = ∞ (vô cùng) vì hai xe chạy cùng chiều.'
    ],
    answer: 'A',
    hint: 'Tính vận tốc tiến lại gần tương đối Δv = v_ego - v_lead = 25 - 15 = 10 m/s, sau đó lấy TTC = Δd / Δv.',
    formulaRef: 'TTC = Δd / (v_{ego} - v_{lead}) = 15 m / (25 - 15 m/s) = 1.5 s',
    explanation:
      'Đáp án đúng là A. Với vận tốc khép khoảng cách là `25 - 15 = 10 m/s` và khoảng cách còn `15 mét`, nếu không phanh ngay thì chỉ sau `15 / 10 = 1.5 giây` hai xe sẽ va chạm. Trong kiểm thử vòng kín, mọi thời điểm có `TTC < 1.5s–2.0s` đều bị ghi nhận là vi phạm biên độ an toàn dọc.',
    'A explanation': 'Đúng: 15m / (25 - 15)m/s = 1.5 giây, vượt ngưỡng cảnh báo an toàn.',
    'B explanation': 'Sai: 10 là hiệu vận tốc m/s chứ không phải thời gian giây.',
    'C explanation': 'Sai: Chia nhầm cho tổng vận tốc (25 + 15 = 40).',
    'D explanation': 'Sai: TTC chỉ tiến ra vô cùng khi v_ego ≤ v_lead (xe sau chạy chậm hơn hoặc bằng xe trước).'
  },
  {
    id: 'P2_D12_Q05',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Vehicle Dynamics & Control — Actuator Delay & Jerk',
    difficulty: 'Thực chiến',
    question:
      'Tại sao trong bộ mô phỏng kiểm thử vòng kín, ta bắt buộc phải mô phỏng cả Độ trễ cơ cấu chấp hành (Actuator Latency ~50–150ms của hệ thống lái/phanh) và giới hạn Độ giật gia tốc (`Jerk = |da/dt|`)?',
    options: [
      'A. Vì nếu bỏ qua độ trễ chấp hành trong mô phỏng, một bộ điều khiển có hệ số khuếch đại cao trông rất mượt khi độ trễ = 0ms nhưng khi đưa lên xe thật (có độ trễ 100ms) sẽ bị vọt lố và dao động lắc lư qua lại (Control Oscillation / Snake Motion) gây mất lái.',
      'B. Vì độ trễ cơ cấu chấp hành giúp xe dừng lại trong 0 mét.',
      'C. Vì Jerk là đạo hàm của vị trí theo không gian.',
      'D. Để làm cho trình mô phỏng chạy chậm hơn.'
    ],
    answer: 'A',
    hint: 'Trong lý thuyết điều khiển tự động, độ trễ thời gian (Time Delay e^{-sτ}) làm giảm biên độ dự trữ pha (Phase Margin) và là nguyên nhân hàng đầu gây mất ổn định vòng kín.',
    formulaRef: 'Jerk = |da(t) / dt| = |d³x(t) / dt³| ≤ J_{max} (m/s³)',
    explanation:
      'Đáp án đúng là A. Một mô hình AI thay đổi lệnh góc lái liên tục `±15°` giữa hai frame hoặc đạp/nhả phanh giật cục sẽ có Jerk cực cao và gây dao động cộng hưởng với độ trễ phần cứng. Mô phỏng chính xác động lực học xe (Bicycle Model + Actuator Delay + Low-pass Filter) giúp phát hiện lỗi này trước khi ra đường thật.',
    'A explanation': 'Đúng: Nêu chính xác hiện tượng mất ổn định vòng kín do độ trễ pha phần cứng.',
    'B explanation': 'Sai: Độ trễ chấp hành làm tăng quãng đường phanh dừng.',
    'C explanation': 'Sai: Jerk là đạo hàm bậc nhất của gia tốc (bậc ba của vị trí) theo thời gian.',
    'D explanation': 'Sai: Mô phỏng động lực học xe chỉ tốn vài micro-giây tính toán.'
  },
  {
    id: 'P2_D12_Q06',
    phase: 'phase2',
    day: 'P2_D12',
    day_title: 'Day 12: Day 12-Replay and closed-loop test',
    topic: 'Safe Deployment — Shadow Mode & Run-Time Safety Shield',
    difficulty: 'Thực chiến',
    question:
      'Trong quy trình đưa một mô hình AI mới lên đội xe thực tế, vai trò của "Chế độ chạy ngầm đối chứng" (Shadow Mode) và "Hàng rào An toàn Thời gian thực" (Run-time Safety Shield / Safety Filter) là gì?',
    options: [
      'A. Shadow Mode cho mô hình mới chạy song song trên xe thật để ghi nhận độ lệch giữa quỹ đạo AI dự đoán và hành vi thực tế mà không can thiệp vào vô-lăng; còn Run-time Safety Shield là lớp kiểm tra toán học tất định đứng cuối cùng để chặn hoặc phanh khẩn cấp nếu quỹ đạo AI xuất ra vi phạm biên va chạm.',
      'B. Shadow Mode nghĩa là chỉ cho xe chạy vào ban đêm khi không có ánh mặt trời.',
      'C. Safety Shield là một mô hình ngôn ngữ lớn thứ hai dùng để viết báo cáo sau khi xe đã va chạm.',
      'D. Khi đã có Shadow Mode thì không cần kiểm thử vòng kín trong mô phỏng nữa.'
    ],
    answer: 'A',
    hint: 'Shadow Mode kiểm chứng trên phân phối thế giới thực với rủi ro bằng 0; Safety Shield bảo vệ biên an toàn cứng khi mô hình chính thức cầm lái.',
    explanation:
      'Đáp án đúng là A. Chuỗi cổng an toàn chuẩn công nghiệp luôn là: (1) Offline Golden Benchmark → (2) Closed-Loop Reactive Simulation → (3) Shadow Mode trên đội xe thực tế → (4) Triển khai từng bước (Canary) dưới sự giám sát của lớp Run-time Safety Shield / Control Barrier Function.',
    'A explanation': 'Đúng: Tóm tắt chuẩn xác quy trình kiểm định và bảo vệ an toàn đa tầng trong thực tế.',
    'B explanation': 'Sai: Shadow Mode là chế độ chạy ẩn không gắn với bộ chấp hành, hoạt động cả ngày lẫn đêm.',
    'C explanation': 'Sai: Safety Shield phải là thuật toán hình học/điều khiển tất định có độ trễ < 5ms để ngăn chặn va chạm trước khi nó xảy ra.',
    'D explanation': 'Sai: Closed-Loop Simulation và Shadow Mode bổ trợ lẫn nhau (Sim test được các ca tai nạn nguy hiểm mà ngoài đời không thường xuyên xảy ra).'
  }
];
