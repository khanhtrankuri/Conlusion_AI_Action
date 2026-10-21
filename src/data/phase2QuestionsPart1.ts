import { QuizQuestion } from '../types/curriculum';

export const PHASE2_QUESTIONS_PART1: QuizQuestion[] = [
  // ==================== DAY 1: NEURAL NETWORK AND TRAINING ====================
  {
    id: 'P2_D01_Q01',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Optimization — Adam vs AdamW',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao trong huấn luyện các mô hình thị giác hiện đại (ViT, Swin, ConvNeXt), bộ tối ưu AdamW (Decoupled Weight Decay) lại giúp tổng quát hóa tốt hơn so với việc cộng trực tiếp số hạng phạt L2 (λ/2 ||θ||²) vào hàm Loss khi dùng Adam?',
    options: [
      'A. Vì AdamW loại bỏ hoàn toàn việc tính moment bậc 2 (v_t) nên tiết kiệm một nửa bộ nhớ GPU.',
      'B. Vì trong Adam chuẩn, gradient của số hạng L2 bị chia cho √(v_t) khiến các trọng số có gradient lớn bị suy giảm ít hơn mức cần thiết.',
      'C. Vì AdamW bắt buộc tốc độ học (learning rate) phải tăng tuyến tính vô hạn theo số epoch.',
      'D. Vì cộng L2 vào hàm Loss làm đạo hàm bậc nhất của hàm kích hoạt ReLU luôn bằng 0.'
    ],
    answer: 'B',
    hint: 'Xem xét công thức cập nhật θ_t khi đạo hàm λ·θ bị đưa vào bên trong m_t và v_t.',
    formulaRef: 'θ_t = θ_{t-1} - η_t [ m̂_t / (√v̂_t + ε) + λ θ_{t-1} ]',
    explanation:
      'Đáp án đúng là B. Khi gộp L2 regularization vào hàm Loss trong Adam, đại lượng λ·θ đi vào cả m_t và v_t rồi bị chia cho √(v_t). AdamW tách rời bước suy giảm trọng số (-η_t·λ·θ) ra khỏi phân số thích nghi gradient.',
    'A explanation': 'Sai: AdamW vẫn duy trì đầy đủ cả moment bậc 1 (m_t) và moment bậc 2 (v_t).',
    'B explanation': 'Đúng: Tách rời Weight Decay khỏi mẫu số √(v_t) giúp mọi trọng số đều bị suy giảm theo đúng tỉ lệ λ đồng nhất.',
    'C explanation': 'Sai: AdamW thường kết hợp với lịch trình Warmup ngắn rồi giảm dần theo hàm Cosine.',
    'D explanation': 'Sai: Số hạng L2 phạt trên trọng số W chứ không làm triệt tiêu đạo hàm của hàm ReLU.'
  },
  {
    id: 'P2_D01_Q02',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Mixed Precision Training — FP16 vs BF16',
    difficulty: 'Thực chiến',
    question:
      'Khi huấn luyện mạng sâu với độ chính xác hỗn hợp (AMP) sử dụng định dạng FP16, tại sao ta bắt buộc phải dùng Dynamic Loss Scaling (nhân Loss với hệ số S trước khi backward) nhưng với BF16 thì thường không cần?',
    options: [
      'A. Vì FP16 không có bit dấu (sign bit) nên không biểu diễn được gradient âm.',
      'B. Vì FP16 chỉ có 5 bit số mũ (exponent) nên dải động hẹp, các gradient nhỏ dễ bị làm tròn về 0 (underflow); còn BF16 có 8 bit số mũ giống hệt FP32.',
      'C. Vì nhân Loss với hệ số S giúp giảm kích thước bộ nhớ của các tensor kích hoạt đi S lần.',
      'D. Vì BF16 sử dụng 32 bit bộ nhớ cho mỗi con số nên không bao giờ bị tràn số.'
    ],
    answer: 'B',
    hint: 'So sánh cấu trúc bit (Sign - Exponent - Mantissa) giữa FP32 (1-8-23), FP16 (1-5-10) và BF16 (1-8-7).',
    formulaRef: 'L_scaled = S × L ;  g_unscaled = g_scaled / S',
    explanation:
      'Đáp án đúng là B. FP16 chỉ dành 5 bit cho phần mũ nên các giá trị gradient nhỏ dưới ~6×10^-8 sẽ bị underflow về 0. Nhân Loss với S = 2^16 đẩy toàn bộ gradient dịch lên vùng biểu diễn được của FP16.',
    'A explanation': 'Sai: Cả FP16, BF16 và FP32 đều có 1 bit dấu.',
    'B explanation': 'Đúng: BF16 giữ nguyên 8 bit số mũ như FP32 nên có dải động cực rộng, hầu như không bị underflow gradient.',
    'C explanation': 'Sai: Loss Scaling chỉ thay đổi giá trị số học của đạo hàm chứ không nén kích thước bộ nhớ.',
    'D explanation': 'Sai: BF16 vẫn là định dạng 16-bit (1 bit dấu, 8 bit mũ, 7 bit định trị).'
  },
  {
    id: 'P2_D01_Q03',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Normalization — BatchNorm vs GroupNorm/LayerNorm',
    difficulty: 'Thực chiến',
    question:
      'Khi huấn luyện mô hình 3D Object Detection hoặc Video Perception có độ phân giải rất cao khiến mỗi GPU chỉ chứa được Batch Size = 1 hoặc 2, việc giữ nguyên lớp BatchNorm (BN) cục bộ trên từng GPU sẽ gây ra hậu quả gì?',
    options: [
      'A. Mô hình tự động chuyển sang chế độ suy luận (eval mode) và đóng băng trọng số.',
      'B. Ước lượng trung bình μ_B và phương sai σ_B^2 trên batch quá nhỏ bị nhiễu loạn mạnh giữa các bước, làm quá trình huấn luyện không hội tụ và lệch hẳn so với thống kê lúc suy luận.',
      'C. Số lượng tham số γ và β của lớp BatchNorm tăng lên theo hàm mũ.',
      'D. Tốc độ truyền dữ liệu qua PCIe bị giảm đi một nửa do BatchNorm chặn luồng CPU.'
    ],
    answer: 'B',
    hint: 'BatchNorm tính trung bình và phương sai trên tập mẫu trong cùng một mini-batch của mỗi GPU.',
    formulaRef: 'y = γ (x - μ_B) / √(σ_B^2 + ε) + β',
    explanation:
      'Đáp án đúng là B. Khi batch size trên mỗi GPU chỉ là 1–2 mẫu, thống kê (μ_B, σ_B²) không còn đại diện cho phân phối toàn cục. Giải pháp thực tế là dùng SyncBatchNorm, GroupNorm hoặc LayerNorm.',
    'A explanation': 'Sai: PyTorch không tự động chuyển sang eval mode khi batch nhỏ.',
    'B explanation': 'Đúng: Phương sai ước lượng từ 1–2 mẫu có sai số thống kê rất lớn, làm hỏng gradient.',
    'C explanation': 'Sai: Số tham số γ, β chỉ phụ thuộc vào số kênh C (2×C tham số).',
    'D explanation': 'Sai: BatchNorm chạy hoàn toàn trên nhân GPU.'
  },
  {
    id: 'P2_D01_Q04',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Weight Initialization — Kaiming He Init',
    difficulty: 'Cơ bản',
    question:
      'Với một tầng tuyến tính có n_in đầu vào sử dụng hàm kích hoạt ReLU, khởi tạo Kaiming (He Initialization) lấy trọng số từ phân phối chuẩn có phương sai Var(W) bằng bao nhiêu để giữ phương sai tín hiệu kích hoạt không đổi qua các tầng?',
    options: [
      'A. Var(W) = 1 / n_in',
      'B. Var(W) = 2 / n_in',
      'C. Var(W) = 1 / (n_in + n_out)',
      'D. Var(W) = 0 (khởi tạo toàn bộ trọng số bằng 0)'
    ],
    answer: 'B',
    hint: 'Hàm ReLU(z) = max(0, z) triệt tiêu một nửa miền giá trị âm nên làm giảm một nửa phương sai ở mỗi tầng.',
    formulaRef: 'W ~ N(0, 2 / n_in)',
    explanation:
      'Đáp án đúng là B. Do ReLU đặt mọi giá trị âm về 0, phương sai đầu ra bị giảm đi một nửa so với đầu vào tuyến tính. Do đó cần nhân hệ số 2 vào tử số: Var(W) = 2 / n_in.',
    'A explanation': 'Sai: 1/n_in là khởi tạo LeCun/Xavier cho hàm kích hoạt tuyến tính quanh 0.',
    'B explanation': 'Đúng: Hệ số 2 bù đắp chính xác phần năng lượng bị cắt bỏ ở nửa miền âm của ReLU.',
    'C explanation': 'Sai: Đây là dạng trung bình điều hòa của Xavier Initialization.',
    'D explanation': 'Sai: Khởi tạo W = 0 làm mọi nơ-ron học cùng một đặc trưng giống hệt nhau.'
  },
  {
    id: 'P2_D01_Q05',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Regularization — Label Smoothing & Calibration',
    difficulty: 'Chuyên sâu',
    question:
      'Với bài toán phân loại K = 10 lớp và hệ số Label Smoothing ε = 0.1, nhãn mục tiêu y_true của lớp đúng (c = y) và của mỗi lớp sai (c ≠ y) sẽ được biến đổi từ vector one-hot [1, 0, ..., 0] thành giá trị nào?',
    options: [
      'A. Lớp đúng = 0.90 ; mỗi lớp sai = 0.10',
      'B. Lớp đúng = 0.91 ; mỗi lớp sai = 0.01',
      'C. Lớp đúng = 0.80 ; mỗi lớp sai = 0.02',
      'D. Lớp đúng = 1.00 ; mỗi lớp sai = 0.01'
    ],
    answer: 'B',
    hint: 'Áp dụng công thức ỹ_c = (1 - ε)·1_{c=y} + ε / K sao cho tổng xác suất của K = 10 lớp vẫn đúng bằng 1.0.',
    formulaRef: 'ỹ_c = (1 - ε) + ε/K = 0.9 + 0.1/10 = 0.91 (lớp đúng) ;  ε/K = 0.01 (9 lớp sai)',
    explanation:
      'Đáp án đúng là B. Theo công thức chuẩn ỹ = (1 - ε)·y_onehot + ε/K: với ε = 0.1 và K = 10, mỗi lớp nhận thêm 0.1/10 = 0.01. Lớp đúng có giá trị 0.9 + 0.01 = 0.91, và 9 lớp sai mỗi lớp có giá trị 0.01.',
    'A explanation': 'Sai: Tổng xác suất sẽ vượt quá 1.0.',
    'B explanation': 'Đúng: 0.91 cho lớp đúng và 0.01 cho 9 lớp còn lại, tổng xác suất bảo toàn bằng 1.0.',
    'C explanation': 'Sai: Tương ứng với ε = 0.22 chứ không phải 0.1.',
    'D explanation': 'Sai: Tổng xác suất vượt quá 1.0.'
  },
  {
    id: 'P2_D01_Q06',
    phase: 'phase2',
    day: 'P2_D01',
    day_title: 'Day 1: Neural network and Training',
    topic: 'Numerical Stability — LogSumExp & Sanity Check',
    difficulty: 'Thực chiến',
    question:
      'Tại sao trong PyTorch ta luôn dùng `F.cross_entropy(logits, target)` nhận trực tiếp logits thô thay vì tự tính `torch.softmax` rồi lấy `-torch.log`, và bài test "Overfit trên 1 Mini-batch" trước khi train dùng để làm gì?',
    options: [
      'A. Gộp chung giúp áp dụng thủ thuật Log-Sum-Exp trừ đi max(z) để chống tràn số / log(0) = NaN; còn Overfit 1 mini-batch giúp xác minh pipeline dữ liệu, hàm loss và đạo hàm không có bug.',
      'B. Vì hàm tự viết chỉ chạy được trên CPU.',
      'C. Vì Softmax chỉ dùng được cho bài toán 2 lớp.',
      'D. Overfit 1 mini-batch dùng để đo tốc độ mạng Internet.'
    ],
    answer: 'A',
    hint: 'Xét đẳng thức log(∑ exp(z_j)) = c + log(∑ exp(z_j - c)) với c = max_j(z_j).',
    formulaRef: 'log softmax(z_i) = (z_i - c) - log ∑_j exp(z_j - c)',
    explanation:
      'Đáp án đúng là A. Log-Sum-Exp ngăn chặn lỗi NaN khi xác suất một lớp quá nhỏ làm tròn về 0, còn việc ép mạng học thuộc lòng 1 mini-batch (8–16 mẫu) về Loss ≈ 0 là bước Sanity Check bắt buộc trước khi chạy huấn luyện lớn.',
    'A explanation': 'Đúng: Kết hợp hai nguyên tắc kỹ thuật cốt lõi trong huấn luyện mạng sâu.',
    'B explanation': 'Sai: Cả hai cách đều chạy trên GPU.',
    'C explanation': 'Sai: Softmax tổng quát cho K lớp bất kỳ.',
    'D explanation': 'Sai: Overfit 1 batch kiểm tra tính đúng đắn của thuật toán và dữ liệu.'
  },

  // ==================== DAY 2: DEEP LEARNING ARCHITECTURE FOR CV ====================
  {
    id: 'P2_D02_Q01',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'CNN Geometry — Output Size & Receptive Field',
    difficulty: 'Cơ bản',
    question:
      'Một bản đồ đặc trưng đầu vào có kích thước 64×64 đi qua một tầng tích chập 2D có Kernel K = 3, Padding P = 1, Dilation D = 2 và Stride S = 2. Kích thước không gian (H_out × W_out) của bản đồ đặc trưng đầu ra là bao nhiêu?',
    options: [
      'A. 32 × 32',
      'B. 31 × 31',
      'C. 64 × 64',
      'D. 30 × 30'
    ],
    answer: 'B',
    hint: 'Áp dụng công thức H_out = ⌊(H_in + 2P - D(K - 1) - 1) / S⌋ + 1.',
    formulaRef: 'H_out = ⌊(64 + 2(1) - 2(3 - 1) - 1) / 2⌋ + 1 = ⌊61 / 2⌋ + 1 = 31',
    explanation:
      'Đáp án đúng là B. Khi Dilation D = 2 và K = 3, kích thước bộ lọc mở rộng thành 5×5. Với Padding P = 1, tử số là 64 + 2 - 4 - 1 = 61. Chia nguyên cho Stride 2 được 30, cộng 1 bằng 31×31.',
    'A explanation': 'Sai: Chỉ đạt 32×32 khi Padding P = 2 (khi D=2) hoặc D = 1 (khi P=1).',
    'B explanation': 'Đúng: ⌊(64 + 2 - 4 - 1)/2⌋ + 1 = 31.',
    'C explanation': 'Sai: Stride S = 2 đã thu nhỏ kích thước không gian đi xấp xỉ 2 lần.',
    'D explanation': 'Sai: Quên cộng 1 trong công thức tính kích thước đầu ra.'
  },
  {
    id: 'P2_D02_Q02',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'ResNet — Residual Connection & Gradient Flow',
    difficulty: 'Cơ bản',
    question:
      'Lý do toán học cốt lõi giúp liên kết tắt (Identity Skip Connection: y = F(x) + x) trong ResNet giải quyết triệt để hiện tượng suy thoái đạo hàm khi mạng sâu tới hơn 100 tầng là gì?',
    options: [
      'A. Vì phép cộng làm giảm số kênh của tensor đi một nửa sau mỗi tầng.',
      'B. Vì đạo hàm ∂y/∂x = I + ∂F/∂x luôn chứa ma trận đơn vị I, cho phép tín hiệu đạo hàm ∂L/∂y truyền cộng tính trực tiếp từ tầng cuối về các tầng đầu mà không bị nhân suy giảm liên tiếp.',
      'C. Vì ResNet loại bỏ hoàn toàn các hàm kích hoạt phi tuyến trong mạng.',
      'D. Vì liên kết tắt biến mọi tầng tích chập thành tầng Fully Connected toàn cục.'
    ],
    answer: 'B',
    hint: 'Lấy đạo hàm của y = x + F(x) theo x bằng quy tắc chuỗi.',
    formulaRef: '∂L / ∂x_l = (∂L / ∂x_L) · (I + ∂/∂x_l ∑_{i=l}^{L-1} F(x_i))',
    explanation:
      'Đáp án đúng là B. Trong ResNet, đạo hàm phân tách thành một đường cao tốc truyền thẳng ∂L/∂x_L qua ma trận đơn vị I và một nhánh đi qua các tầng tích chập, bảo đảm gradient không bị triệt tiêu.',
    'A explanation': 'Sai: Phép cộng từng phần tử giữ nguyên số kênh của tensor.',
    'B explanation': 'Đúng: Số hạng đơn vị I bảo đảm gradient luôn chảy thông suốt qua mọi khối Residual.',
    'C explanation': 'Sai: ResNet vẫn sử dụng ReLU sau mỗi tầng tích chập.',
    'D explanation': 'Sai: ResNet vẫn là mạng tích chập hoàn toàn.'
  },
  {
    id: 'P2_D02_Q03',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'Efficient CNN — Depthwise Separable Convolution',
    difficulty: 'Thực chiến',
    question:
      'So với một lớp tích chập chuẩn (Standard Conv) có kích thước kernel K×K = 3×3, số kênh vào C_in = 128 và số kênh ra C_out = 128, việc thay bằng Depthwise Separable Convolution (3×3 Depthwise + 1×1 Pointwise) giảm chi phí tính toán (FLOPs) đi xấp xỉ bao nhiêu lần?',
    options: [
      'A. Giảm khoảng 2 lần',
      'B. Giảm khoảng 8 đến 9 lần',
      'C. Giảm đúng 128 lần',
      'D. Không giảm FLOPs mà chỉ giảm dung lượng lưu trữ ổ cứng'
    ],
    answer: 'B',
    hint: 'Tính tỷ số: (K² · C_in + C_in · C_out) / (K² · C_in · C_out) = 1/C_out + 1/K².',
    formulaRef: 'Ratio = 1 / C_out + 1 / K^2 = 1/128 + 1/9 ≈ 1/8.4',
    explanation:
      'Đáp án đúng là B. Với K = 3 và C_out = 128, tỷ số chi phí giữa Depthwise Separable Conv và Standard Conv là 1/128 + 1/9 ≈ 0.119, tức tiết kiệm ~8.4 lần FLOPs.',
    'A explanation': 'Sai: Với K = 3, mức tiết kiệm gần bằng K² = 9 lần.',
    'B explanation': 'Đúng: Công thức rút gọn 1/C_out + 1/K² với K=3 cho mức giảm 8–9 lần.',
    'C explanation': 'Sai: Còn phải cộng chi phí của lớp 1×1 Pointwise.',
    'D explanation': 'Sai: Giảm đồng thời cả số lượng tham số lẫn số phép tính FLOPs.'
  },
  {
    id: 'P2_D02_Q04',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'Vision Transformer — ViT vs Swin Transformer',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao kiến trúc Swin Transformer lại phù hợp làm Backbone đa năng cho Object Detection và Semantic Segmentation trên ảnh độ phân giải cao hơn nhiều so với Vision Transformer (ViT) gốc?',
    options: [
      'A. Vì Swin Transformer không sử dụng cơ chế Self-Attention mà quay lại dùng hoàn toàn mạng MLP.',
      'B. Vì Swin tính Self-Attention trong các cửa sổ cục bộ cố định M×M kết hợp dịch chuyển cửa sổ (Shifted Windows) và giảm dần độ phân giải qua Patch Merging, giúp độ phức tạp tính toán chỉ tăng tuyến tính O(HW) và tạo ra bản đồ đặc trưng đa tỉ lệ giống FPN.',
      'C. Vì ViT gốc không thể xử lý ảnh màu 3 kênh RGB.',
      'D. Vì Swin Transformer không cần huấn luyện trước (Pre-training).'
    ],
    answer: 'B',
    hint: 'So sánh độ phức tạp O((HW)²) của Global Attention trong ViT với O(M²·HW) phân cấp của Swin.',
    formulaRef: 'Ω(W-MSA) = 4(HW)C^2 + 2 M^2 (HW) C  (Tuyến tính theo số pixel HW)',
    explanation:
      'Đáp án đúng là B. Swin xây dựng tháp đặc trưng phân cấp (1/4, 1/8, 1/16, 1/32) và giới hạn Attention trong cửa sổ M×M kèm dịch cửa sổ giữa các tầng liên tiếp, giữ chi phí tuyến tính theo số lượng pixel.',
    'A explanation': 'Sai: Swin vẫn là kiến trúc dựa trên Multi-Head Self-Attention.',
    'B explanation': 'Đúng: Cấu trúc phân cấp đa tỉ lệ + độ phức tạp tuyến tính O(HW) giúp Swin cắm trực tiếp vào FPN/Detection.',
    'C explanation': 'Sai: ViT xử lý ảnh RGB bình thường.',
    'D explanation': 'Sai: Swin vẫn cần huấn luyện trọng số.'
  },
  {
    id: 'P2_D02_Q05',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'Multi-Scale Representation — Feature Pyramid Network (FPN)',
    difficulty: 'Thực chiến',
    question:
      'Trong kiến trúc Feature Pyramid Network (FPN), tại sao trước và sau khi cộng nhánh Top-Down (đã phóng đại 2×) với nhánh nối ngang (Lateral Connection), người ta sử dụng lần lượt một lớp Conv 1×1 và một lớp Conv 3×3?',
    options: [
      'A. Lớp 1×1 để đồng nhất số kênh (ví dụ về 256 kênh) từ các tầng Backbone khác nhau; lớp 3×3 sau khi cộng để khử hiện tượng răng cưa chồng phổ (aliasing effect) do phép nội suy Upsampling gây ra.',
      'B. Lớp 1×1 để tăng kích thước ảnh lên gấp đôi; lớp 3×3 để xóa các vật thể nhỏ.',
      'C. Cả hai lớp chỉ dùng để đổi định dạng dữ liệu từ FP32 sang INT8.',
      'D. Để thay thế hoàn toàn phần Backbone phía trước.'
    ],
    answer: 'A',
    hint: 'Các tầng C2..C5 của ResNet có số kênh khác nhau (256..2048) và phép Nearest Neighbor Upsample tạo ra các khối pixel lặp lại.',
    formulaRef: 'P_l = Conv_{3×3}( Conv_{1×1}(C_l) + Upsample_{2×}(P_{l+1}) )',
    explanation:
      'Đáp án đúng là A. Lateral 1×1 Conv chiếu các tầng C2..C5 về cùng số chiều chuẩn (C = 256). Sau khi cộng với bản đồ phóng đại từ tầng trên, lớp 3×3 Conv làm mượt đặc trưng và triệt tiêu nhiễu khối do bước Upsample.',
    'A explanation': 'Đúng: Đây là thiết kế chuẩn mực của Lin et al. trong bài báo FPN.',
    'B explanation': 'Sai: Conv 1×1 không làm thay đổi kích thước không gian H×W.',
    'C explanation': 'Sai: Không liên quan đến lượng tử hóa kiểu dữ liệu.',
    'D explanation': 'Sai: FPN là phần Neck đứng sau Backbone.'
  },
  {
    id: 'P2_D02_Q06',
    phase: 'phase2',
    day: 'P2_D02',
    day_title: 'Day 2: Deeplearning Architecture for Computer Vision',
    topic: 'Inductive Bias — Translation Equivariance vs ConvNeXt',
    difficulty: 'Chuyên sâu',
    question:
      'Phát biểu nào sau đây đúng khi nói về tính "Đồng biến tịnh tiến" (Translation Equivariance) của lớp Convolution và cải tiến của kiến trúc ConvNeXt?',
    options: [
      'A. Lớp Convolution có tính Đồng biến (vật thể dịch chuyển trên ảnh thì kích hoạt tương ứng trên feature map cũng dịch chuyển theo); và ConvNeXt hiện đại hóa ResNet bằng Depthwise Conv 7×7, Inverted Bottleneck, GELU và LayerNorm.',
      'B. Lớp Convolution xóa bỏ mọi thông tin tọa độ vị trí của vật thể ngay từ tầng đầu tiên.',
      'C. ConvNeXt thay thế toàn bộ lớp tích chập bằng mạng hồi quy LSTM.',
      'D. Chỉ khi dùng Stride S = 16 thì CNN mới có tính đồng biến.'
    ],
    answer: 'A',
    hint: 'Equivariance: f(Shift(x)) = Shift(f(x)) — cực kỳ quan trọng cho bài toán định vị.',
    formulaRef: 'Conv(Shift(I)) = Shift(Conv(I))',
    explanation:
      'Đáp án đúng là A. Chia sẻ trọng số bộ lọc giúp CNN bảo toàn tương quan vị trí không gian (Equivariance), còn ConvNeXt kết hợp ưu điểm tốc độ của CNN với triết lý thiết kế của Vision Transformer (7×7 Depthwise Conv + Inverted Bottleneck).',
    'A explanation': 'Đúng: Tóm tắt chuẩn xác bản chất hình học của CNN và kiến trúc ConvNeXt.',
    'B explanation': 'Sai: Chỉ có Global Pooling ở cuối mạng mới gom toàn cục tạo tính bất biến.',
    'C explanation': 'Sai: ConvNeXt là mạng thuần tích chập.',
    'D explanation': 'Sai: Stride lớn thực tế làm giảm độ mịn của tính đồng biến.'
  },

  // ==================== DAY 3: 2D PERCEPTION (DETECTION, SEGMENTATION, KEYPOINTS) ====================
  {
    id: 'P2_D03_Q01',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'Bounding Box Loss — IoU vs GIoU / CIoU',
    difficulty: 'Thực chiến',
    question:
      'Khi sử dụng trực tiếp hàm `L_IoU = 1 - IoU(A, B)` để huấn luyện hồi quy tọa độ hộp giới hạn, nhược điểm chí mạng xảy ra khi hộp dự đoán A và hộp nhãn thật B hoàn toàn không giao nhau (A ∩ B = ∅) là gì?',
    options: [
      'A. Giá trị IoU luôn bằng 0 và L_IoU luôn bằng hằng số 1 bất kể hai hộp nằm sát cạnh nhau hay cách nhau cả màn hình, dẫn đến đạo hàm ∂L_IoU / ∂A = 0 khiến hộp dự đoán không thể dịch chuyển về phía hộp thật.',
      'B. Giá trị IoU sẽ tiến ra âm vô cùng (-∞) làm tràn bộ nhớ GPU.',
      'C. Thuật toán NMS sẽ tự động xóa cả hộp nhãn thật.',
      'D. Mô hình chỉ dự đoán được các hộp hình vuông có tỉ lệ cạnh 1:1.'
    ],
    answer: 'A',
    hint: 'Để tối ưu hóa bằng Gradient Descent, hàm Loss phải giảm liên tục khi hộp A tiến lại gần hộp B ngay cả trước khi chúng chạm nhau.',
    formulaRef: 'GIoU = IoU - |C \\ (A ∪ B)| / |C|  ∈ (-1, 1]',
    explanation:
      'Đáp án đúng là A. Khi A ∩ B = ∅, IoU = 0 là hằng số nên gradient bằng 0. GIoU khắc phục bằng cách thêm số hạng phạt diện tích vùng trống trong hộp bao nhỏ nhất C chứa cả A và B.',
    'A explanation': 'Đúng: Mất hoàn toàn tín hiệu đạo hàm khi hai hộp rời nhau là lý do phải dùng GIoU/DIoU/CIoU.',
    'B explanation': 'Sai: IoU luôn bị chặn trong đoạn [0, 1].',
    'C explanation': 'Sai: NMS chỉ chạy lúc hậu xử lý trên các hộp dự đoán.',
    'D explanation': 'Sai: IoU tính được cho hình chữ nhật có tỉ lệ bất kỳ.'
  },
  {
    id: 'P2_D03_Q02',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'Focal Loss — Class Imbalance in One-Stage Detectors',
    difficulty: 'Cơ bản',
    question:
      'Trong công thức Focal Loss `FL(p_t) = -α_t (1 - p_t)^γ log(p_t)` với γ = 2, nếu một điểm lưới thuộc vùng nền dễ (Easy Negative) được mô hình dự đoán đúng với độ tự tin p_t = 0.99, hệ số điều biến `(1 - p_t)^γ` sẽ làm giảm trọng số đóng góp vào Loss của mẫu này đi bao nhiêu lần so với Cross-Entropy chuẩn?',
    options: [
      'A. Giảm đi 2 lần',
      'B. Giảm đi 100 lần',
      'C. Giảm đi 10,000 lần ((1 - 0.99)^2 = 0.01^2 = 0.0001)',
      'D. Tăng trọng số lên gấp 100 lần'
    ],
    answer: 'C',
    hint: 'Thay p_t = 0.99 và γ = 2 vào biểu thức (1 - p_t)^γ.',
    formulaRef: '(1 - 0.99)^2 = (0.01)^2 = 10^{-4}',
    explanation:
      'Đáp án đúng là C. Với p_t = 0.99 và γ = 2, hệ số (1 - p_t)^γ = 0.0001, tức làm nhỏ đóng góp Loss của mẫu nền dễ đi 10,000 lần, giúp mạng tập trung học các mẫu vật thể khó.',
    'A explanation': 'Sai: γ = 2 nằm ở số mũ chứ không phải phép chia đôi.',
    'B explanation': 'Sai: 100 lần ứng với γ = 1.',
    'C explanation': 'Đúng: (0.01)² = 0.0001 (giảm 10,000 lần).',
    'D explanation': 'Sai: Hệ số (1 - p_t)^γ luôn nhỏ hơn 1.'
  },
  {
    id: 'P2_D03_Q03',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'End-to-End Detection — DETR & Hungarian Matching',
    difficulty: 'Chuyên sâu',
    question:
      'Cơ chế nào giúp kiến trúc DETR (Detection Transformer) và YOLOv10 loại bỏ hoàn toàn bước hậu xử lý Non-Maximum Suppression (NMS) lúc suy luận?',
    options: [
      'A. Chỉ cho phép mô hình phát hiện tối đa 1 vật thể duy nhất trong mỗi bức ảnh.',
      'B. Sử dụng phép ghép cặp một-đối-một (One-to-One Bipartite Matching qua thuật toán Hungarian) trong lúc huấn luyện, phạt nặng mọi dự đoán thứ hai trùng vào cùng một vật thể thật để buộc mô hình tự triệt tiêu các hộp dư thừa.',
      'C. Gộp tất cả các hộp dự đoán trên ảnh thành một hộp lớn bao quanh toàn màn hình.',
      'D. Dùng bộ lọc Kalman để xóa các hộp trùng nhau.'
    ],
    answer: 'B',
    hint: 'One-to-Many assignment bắt buộc cần NMS, trong khi One-to-One assignment gán duy nhất 1 query cho mỗi GT.',
    formulaRef: 'σ̂ = argmin_{σ ∈ S_N} ∑_{i=1}^N L_{match}(y_i, ŷ_{σ(i)})',
    explanation:
      'Đáp án đúng là B. DETR dùng Hungarian Matching gán đúng 1 Object Query cho mỗi vật thể và đẩy các Query còn lại về lớp "No Object" (∅), loại bỏ hoàn toàn nhu cầu dùng NMS.',
    'A explanation': 'Sai: DETR khởi tạo N = 100 hoặc 300 Object Queries để phát hiện hàng trăm vật thể cùng lúc.',
    'B explanation': 'Đúng: One-to-One assignment trong hàm loss là chìa khóa tạo nên khả năng End-to-End NMS-free.',
    'C explanation': 'Sai: Gộp hộp làm hỏng hoàn toàn vị trí từng đối tượng.',
    'D explanation': 'Sai: Kalman Filter là bộ lọc theo thời gian.'
  },
  {
    id: 'P2_D03_Q04',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'Segmentation Taxonomy — Semantic vs Instance vs Panoptic',
    difficulty: 'Cơ bản',
    question:
      'Trong hệ thống nhận thức cho xe tự hành, sự khác biệt cốt lõi giữa Semantic Segmentation, Instance Segmentation và Panoptic Segmentation là gì?',
    options: [
      'A. Semantic gán nhãn lớp cho mọi pixel nhưng không tách từng chiếc xe riêng lẻ; Instance tách riêng từng đối tượng đếm được (Things như Xe #1, Xe #2) nhưng bỏ qua vùng nền (Stuff như mặt đường); Panoptic hợp nhất cả hai bằng cách vừa phân vùng vùng nền Stuff vừa tách từng cá thể Things.',
      'B. Semantic chỉ chạy trên ảnh trắng đen, còn Instance chạy trên ảnh màu.',
      'C. Panoptic Segmentation chỉ vẽ hộp chữ nhật chứ không phân loại tới từng pixel.',
      'D. Instance Segmentation chỉ phân biệt được tối đa 2 lớp.'
    ],
    answer: 'A',
    hint: 'Nhớ công thức: Panoptic = Stuff (Semantic) + Things (Instance).',
    formulaRef: 'PQ = SQ (Segmentation Quality) × RQ (Recognition Quality)',
    explanation:
      'Đáp án đúng là A. Xe tự hành vừa cần biết vùng mặt đường có thể lái được (Stuff) vừa cần tách biệt từng người đi bộ và từng chiếc xe (Things). Panoptic Segmentation hợp nhất cả hai.',
    'A explanation': 'Đúng: Định nghĩa chuẩn xác sự phân chia giữa Stuff, Things và sự hợp nhất trong Panoptic.',
    'B explanation': 'Sai: Cả ba bài toán đều xử lý ảnh đầu vào đa kênh.',
    'C explanation': 'Sai: Panoptic gán nhãn lớp và Instance ID tới từng điểm ảnh.',
    'D explanation': 'Sai: Instance Segmentation phân loại đa lớp kèm tách biệt từng cá thể.'
  },
  {
    id: 'P2_D03_Q05',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'Keypoints & RoIAlign — Spatial Precision',
    difficulty: 'Thực chiến',
    question:
      'Tại sao trong Mask R-CNN người ta thay RoIPooling bằng RoIAlign, và trong ước lượng Keypoints người ta ưu tiên dự đoán 2D Gaussian Heatmap thay vì dùng tầng FC hồi quy trực tiếp tọa độ (x, y)?',
    options: [
      'A. RoIAlign loại bỏ bước làm tròn tọa độ nguyên bằng nội suy song tuyến tính (Bilinear Interpolation); còn 2D Heatmap giữ nguyên tính đồng biến không gian 2D và cung cấp tín hiệu giám sát mượt quanh điểm khớp.',
      'B. Vì cả hai kỹ thuật này đều không cần sử dụng GPU.',
      'C. Vì tầng FC không thể xuất ra các con số thực.',
      'D. Để giảm độ phân giải ảnh xuống 1×1 pixel.'
    ],
    answer: 'A',
    hint: 'Cả bài toán Mask và Keypoint đều đòi hỏi độ chính xác định vị ở mức điểm ảnh / dưới điểm ảnh (sub-pixel accuracy).',
    formulaRef: 'H_k(u, v) = exp( - ((u - x_k)^2 + (v - y_k)^2) / (2 σ^2) )',
    explanation:
      'Đáp án đúng là A. Làm tròn tọa độ trong RoIPooling hoặc nén phẳng bản đồ đặc trưng thành vector 1D để hồi quy tọa độ đều phá vỡ cấu trúc căn chỉnh không gian 2D chính xác.',
    'A explanation': 'Đúng: Nêu bật cơ chế bảo toàn độ chính xác hình học 2D của RoIAlign và Gaussian Heatmap.',
    'B explanation': 'Sai: Cả hai đều chạy trên GPU.',
    'C explanation': 'Sai: Tầng FC xuất số thực được nhưng mất tính cục bộ không gian 2D.',
    'D explanation': 'Sai: Ngược lại, cả hai đều giữ độ phân giải không gian cao.'
  },
  {
    id: 'P2_D03_Q06',
    phase: 'phase2',
    day: 'P2_D03',
    day_title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    topic: 'Decoupled Head & Crowded NMS Failure',
    difficulty: 'Thực chiến',
    question:
      'Tại sao YOLOX/YOLOv8 tách riêng nhánh Classification và Regression (Decoupled Head), và tại sao Greedy NMS truyền thống lại gây bỏ sót vật thể khi hai người đi bộ đứng che khuất nhau (IoU thật = 0.65 > ngưỡng NMS 0.50)?',
    options: [
      'A. Decoupled Head giải quyết xung đột giữa đặc trưng bất biến ở tâm (cho Classification) và đặc trưng nhạy biên ở cạnh (cho Regression); còn Greedy NMS xóa cứng hộp điểm thấp hơn khi hai vật thể cùng lớp đứng sát nhau (khắc phục bằng Soft-NMS hoặc DETR).',
      'B. Vì nhánh Regression chỉ hoạt động khi có 1 vật thể duy nhất.',
      'C. Vì Greedy NMS luôn giữ lại các hộp có điểm thấp nhất.',
      'D. Vì Decoupled Head tự động xóa hết các vật thể bị che khuất.'
    ],
    answer: 'A',
    hint: 'Classification cần biết "Đây là cái gì", Localization cần biết "Biên giới chính xác ở đâu".',
    explanation:
      'Đáp án đúng là A. Tách Decoupled Head giải quyết xung đột gradient giữa phân loại và định vị, còn Soft-NMS/DETR khắc phục lỗi xóa nhầm vật thể thật trong cảnh đám đông chồng lấn.',
    'A explanation': 'Đúng: Giải thích chính xác hai nguyên lý thiết kế quan trọng của bộ phát hiện 2D hiện đại.',
    'B explanation': 'Sai: Nhánh Regression dự đoán cho mọi điểm lưới dương.',
    'C explanation': 'Sai: Greedy NMS giữ hộp điểm cao nhất và xóa các hộp điểm thấp hơn chồng lấn với nó.',
    'D explanation': 'Sai: Decoupled Head tăng độ chính xác phát hiện trong mọi tình huống.'
  }
];
