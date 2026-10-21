import { CurriculumDay } from '../types/curriculum';

export const PHASE2_CURRICULUM: CurriculumDay[] = [
  {
    id: 'P2_D01',
    phase: 'phase2',
    dayNumber: 1,
    codeLabel: 'Day 1',
    title: 'Day 1: Neural network and Training',
    subtitle: 'MLP, Backpropagation, Optimization (AdamW), Normalization & Mixed Precision Training',
    category: 'Nền tảng Deep Learning & Huấn luyện',
    defaultStatus: 'in_progress',
    defaultProgress: 35,
    keyIdea:
      'Huấn luyện mạng nơ-ron sâu là bài toán tối ưu phi lồi trên không gian hàng tỷ tham số; kiểm soát độ lớn gradient (Initialization, Normalization, Residual) và lịch trình cập nhật trọng số (AdamW + Warmup Cosine) quyết định sự hội tụ và khả năng tổng quát hóa.',
    formulas: [
      {
        name: 'Lan truyền ngược (Chain Rule & Gradient theo Trọng số)',
        expression: '∂L / ∂W^(l) = δ^(l) · (a^(l-1))^T ,   với δ^(l) = ((W^(l+1))^T δ^(l+1)) ⊙ σ\'(z^(l))',
        variables: [
          { symbol: 'z^(l) = W^(l) a^(l-1) + b^(l)', meaning: 'Vector tiền kích hoạt (pre-activation) tại tầng thứ l' },
          { symbol: 'a^(l) = σ(z^(l))', meaning: 'Đầu ra kích hoạt (activation) tại tầng l' },
          { symbol: 'δ^(l) = ∂L / ∂z^(l)', meaning: 'Sai số cục bộ (error signal) truyền ngược về tầng l' },
          { symbol: '⊙', meaning: 'Phép nhân từng phần tử (Hadamard product)' }
        ],
        intuition:
          'Nếu đạo hàm σ\'(z) < 1 (như Sigmoid đạt tối đa 0.25) nhân liên tiếp qua L tầng sẽ gây triệt tiêu đạo hàm (Vanishing Gradient). Ngược lại nếu giá trị riêng lớn nhất của W > 1 sẽ gây bùng nổ đạo hàm (Exploding Gradient).'
      },
      {
        name: 'Cập nhật AdamW (Decoupled Weight Decay)',
        expression: 'θ_{t} = θ_{t-1} - η_t · [ m̂_t / (√(v̂_t) + ε) + λ · θ_{t-1} ]',
        variables: [
          { symbol: 'm̂_t = m_t / (1 - β_1^t)', meaning: 'Moment bậc 1 (trung bình động có hiệu chỉnh thiên lệch của gradient)' },
          { symbol: 'v̂_t = v_t / (1 - β_2^t)', meaning: 'Moment bậc 2 (trung bình động bình phương gradient, ước lượng phương sai)' },
          { symbol: 'λ · θ_{t-1}', meaning: 'Weight decay tách rời khỏi bước chia thích nghi √(v̂_t)' },
          { symbol: 'η_t', meaning: 'Learning rate tại bước t (thường điều khiển bởi Warmup + Cosine Annealing)' }
        ],
        intuition:
          'Trong Adam chuẩn, cộng L2 regularization vào hàm loss khiến các trọng số có gradient lớn bị phạt ít hơn do bị chia cho √(v̂_t). AdamW tách riêng bước suy giảm trọng số λ·θ khỏi phần thích nghi gradient, giúp mô hình Vision và Transformer tổng quát hóa vượt trội.'
      },
      {
        name: 'Kaiming (He) Initialization & Batch / Layer Normalization',
        expression: 'W ~ N(0, 2 / n_{in})   |   y_i = γ · (x_i - μ_B) / √(σ_B^2 + ε) + β',
        variables: [
          { symbol: 'n_{in}', meaning: 'Số lượng kết nối đầu vào (fan-in) của một nơ-ron' },
          { symbol: '2 / n_{in}', meaning: 'Phương sai khởi tạo bù lại việc hàm ReLU triệt tiêu nửa miền âm' },
          { symbol: 'μ_B, σ_B^2', meaning: 'Trung bình và phương sai tính theo Batch (BatchNorm) hoặc theo Channel/Token (LayerNorm)' },
          { symbol: 'γ, β', meaning: 'Tham số scale và shift học được để bảo toàn năng lực biểu diễn' }
        ],
        intuition:
          'Giữ phương sai của tín hiệu kích hoạt Var(a^(l)) ≈ Var(a^(l-1)) và phương sai gradient ổn định qua hàng trăm tầng. Khi batch size nhỏ (như huấn luyện 3D Detection / Video), BatchNorm bị nhiễu thống kê nên phải thay bằng SyncBN, GroupNorm hoặc LayerNorm.'
      }
    ],
    architecture: {
      title: 'Luồng Huấn luyện Mixed-Precision (FP16/BF16) & Gradient Accumulation',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Master Weights FP32] ──(Cast)──▶ [Working Weights FP16/BF16]             │
│                                              │                             │
│                                              ▼                             │
│  [Mini-Batch x_i] ──────────▶ [Forward Pass: MatMul/Conv FP16]             │
│                                              │                             │
│                                              ▼                             │
│                               [Loss L (FP32) × Scale S]                    │
│                                              │                             │
│                                              ▼                             │
│                               [Backward Pass: Scaled Grad FP16]            │
│                                              │                             │
│                                              ▼                             │
│  [AdamW Step on FP32] ◀──(Clip & Unscale / S)── [Check Inf/NaN Grad]       │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1',
          title: 'Forward & Activation Caching',
          tensorSpec: 'Input: [B, C, H, W] (BF16/FP16) → Activations lưu trong VRAM',
          description: 'Tính toán tích nhân ma trận trên Tensor Cores tốc độ cao; các tensor kích hoạt trung gian chiếm phần lớn bộ nhớ GPU và có thể giảm nhờ Activation Checkpointing.'
        },
        {
          stage: 'Stage 2',
          title: 'Loss Scaling (Tránh Underflow FP16)',
          tensorSpec: 'L_scaled = S · L(y, ŷ), với S = 2^16 động',
          description: 'Với FP16 (dải biểu diễn hẹp), gradient nhỏ dễ bị làm tròn về 0 (underflow). Nhân Loss với hệ số S đẩy gradient lên vùng biểu diễn an toàn trước khi backward.'
        },
        {
          stage: 'Stage 3',
          title: 'Unscale & Gradient Clipping',
          tensorSpec: 'g ← g / S ; nếu ||g||_2 > τ thì g ← g · (τ / ||g||_2)',
          description: 'Chia lại gradient cho S, kiểm tra NaN/Inf. Áp dụng Global Norm Clipping (thường τ = 1.0) để chặn các cú sốc gradient đột biến từ dữ liệu nhiễu.'
        },
        {
          stage: 'Stage 4',
          title: 'Master Weight Update (FP32)',
          tensorSpec: 'θ_FP32 ← θ_FP32 - η · Δθ_AdamW',
          description: 'Nếu cập nhật trực tiếp trên FP16, lượng cập nhật η·g quá nhỏ so với độ lớn trọng số sẽ gây mất mát chính xác (swamping). Do đó luôn giữ bản sao Master Weights ở FP32.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Bộ nhớ VRAM không bị chiếm nhiều bởi trọng số mà bởi Activations lưu chờ Backward (tỷ lệ thuận với Batch Size × Độ phân giải) và trạng thái Optimizer (AdamW tốn thêm 8 bytes/tham số cho m_t và v_t ở FP32).'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Hàm kích hoạt (Activations) & Hiện tượng Dying ReLU',
        summary: 'Sự tiến hóa từ Sigmoid/Tanh sang ReLU, LeakyReLU, GELU và Swish/SiLU trong các kiến trúc hiện đại.',
        bullets: [
          'Sigmoid & Tanh bão hòa ở hai đầu (|z| lớn → đạo hàm tiến về 0), làm tê liệt các tầng đầu của mạng sâu.',
          'ReLU(z) = max(0, z) có đạo hàm bằng 1 trên miền dương giúp hội tụ nhanh gấp nhiều lần, nhưng nếu learning rate quá lớn đẩy trọng số vào vùng z < 0 với mọi mẫu, nơ-ron sẽ có gradient = 0 vĩnh viễn (Dying ReLU).',
          'GELU(z) = z · Φ(z) và SiLU(z) = z · σ(z) trơn tại lân cận 0, cho phép một lượng nhỏ gradient âm đi qua, là chuẩn mực trong ViT, ConvNeXt và LLM.'
        ],
        productionTip: 'Khi huấn luyện mạng phát hiện vật thể trên thiết bị biên (Edge NPU/TensorRT), ưu tiên ReLU hoặc SiLU vì được phần cứng hỗ trợ ghép tầng (Conv+BN+ReLU fusion) không tốn thêm băng thông bộ nhớ.'
      },
      {
        id: 'sec-2',
        title: '2. Chiến lược Learning Rate: Warmup & Cosine Annealing',
        summary: 'Cách điều phối tốc độ học để vượt qua điểm yên ngựa (saddle points) và hội tụ vào cực tiểu phẳng (flat minima).',
        bullets: [
          'Linear Warmup: Trong 500–2000 bước đầu, ước lượng phương sai v_t của Adam chưa ổn định; tăng dần LR từ 0 lên η_max ngăn mạng phát tán ngay từ epoch đầu.',
          'Cosine Decay: Hạ LR mượt theo hàm cosin η_t = η_min + 0.5(η_max - η_min)(1 + cos(π·t/T)), duy trì tốc độ học đủ lớn ở giữa quá trình để thoát khỏi cực tiểu nhọn (sharp minima).',
          'Linear Scaling Rule: Khi tăng tổng Batch Size lên k lần (nhờ Multi-GPU DDP), cần nhân Learning Rate cơ sở lên √k (với AdamW) hoặc k (với SGD) kèm theo kéo dài giai đoạn Warmup.'
        ]
      },
      {
        id: 'sec-3',
        title: '3. Regularization & Chống Overfitting trong Thị giác máy tính',
        summary: 'Kết hợp phạt trọng số, biến đổi cấu trúc mạng và làm giàu nhãn dữ liệu.',
        bullets: [
          'Dropout vs DropPath (Stochastic Depth): Dropout ngắt ngẫu nhiên từng nơ-ron (hiệu quả cho tầng FC), trong khi DropPath ngắt toàn bộ nhánh Residual của một khối Transformer/ResNet theo xác suất tăng dần theo chiều sâu.',
          'Label Smoothing: Thay nhãn cứng one-hot [0, 1, 0] bằng [(ε/K), 1 - ε + (ε/K), (ε/K)] để ngăn mô hình đẩy logits lên vô cùng và giúp hiệu chỉnh xác suất (calibration) tốt hơn.',
          'Mixup & CutMix: Trộn tuyến tính hai ảnh hoặc cắt ghép vùng ảnh kèm trộn nhãn theo tỷ lệ diện tích, buộc mạng học đặc trưng phân bố thay vì học vẹt một chi tiết cục bộ.'
        ]
      },
      {
        id: 'sec-4',
        title: '4. Chẩn đoán đường cong Loss & Debugging quá trình huấn luyện',
        summary: 'Quy trình thực chiến để phát hiện lỗi dữ liệu, lỗi hàm Loss hoặc cấu hình siêu tham số sai.',
        bullets: [
          'Bước kiểm tra bắt buộc (Sanity Check): Cho mô hình overfit trên đúng 1 mini-batch (8–16 mẫu). Nếu training loss không giảm về sát 0 sau vài trăm bước, chắc chắn có bug trong pipeline nhãn, hàm loss hoặc chiều tensor.',
          'Loss xuất hiện NaN đột ngột: Kiểm tra phép chia cho 0, log(0) trong Cross-Entropy (phải dùng LogSumExp thông qua F.cross_entropy nhận trực tiếp logits), hoặc nhãn bounding box bị suy biến (x1 >= x2).',
          'Validation Loss tăng trong khi Training Loss giảm sâu: Dấu hiệu Overfitting cổ điển — cần tăng Weight Decay, thêm DropPath/Augmentation hoặc áp dụng Early Stopping.'
        ]
      }
    ],
    comparisonTable: {
      title: 'So sánh các Kỹ thuật Chuẩn hóa (Normalization Layers) trong Deep Learning',
      headers: ['Kỹ thuật', 'Trục tính (μ, σ²)', 'Phụ thuộc Batch Size', 'Ứng dụng tối ưu'],
      rows: [
        ['BatchNorm (BN)', 'Tính trên (B, H, W) cho mỗi kênh C', 'Phụ thuộc mạnh (kém khi B < 8)', 'CNN phân loại ảnh với batch lớn, dễ gộp (fuse) vào lớp Conv khi suy luận'],
        ['SyncBatchNorm', 'Đồng bộ (B_total, H, W) qua mọi GPU', 'Thấp (nhưng tốn băng thông liên GPU)', 'Huấn luyện phân tán Object Detection / Segmentation đa GPU'],
        ['GroupNorm (GN)', 'Chia C kênh thành G nhóm trên mỗi mẫu', 'Độc lập hoàn toàn với Batch Size', 'Nhánh Detection Head (FCOS, Mask R-CNN) khi batch size mỗi GPU = 1 hoặc 2'],
        ['LayerNorm (LN)', 'Tính trên toàn bộ kênh C của từng token', 'Độc lập hoàn toàn với Batch Size', 'Kiến trúc Transformer (ViT, Swin, DETR, LLM) và chuỗi thời gian']
      ]
    }
  },
  {
    id: 'P2_D02',
    phase: 'phase2',
    dayNumber: 2,
    codeLabel: 'Day 2',
    title: 'Day 2: Deeplearning Architecture for Computer Vision',
    subtitle: 'CNN Inductive Bias, ResNet, FPN, Vision Transformer (ViT), Swin Transformer & ConvNeXt',
    category: 'Kiến trúc Thị giác Máy tính',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'CNN sở hữu thiên kiến quy nạp mạnh về tính cục bộ và bất biến tịnh tiến giúp học hiệu quả trên tập dữ liệu vừa phải, trong khi Vision Transformer mở rộng trường nhìn toàn cục (Global Receptive Field) và phân cấp đa tỉ lệ (Swin/FPN) để thống trị các bài toán nhận thức phức tạp.',
    formulas: [
      {
        name: 'Kích thước Feature Map & Trường nhìn hiệu dụng (Receptive Field)',
        expression: 'H_{out} = ⌊(H_{in} + 2P - D·(K - 1) - 1) / S⌋ + 1   |   RF_l = RF_{l-1} + (K_l - 1) · ∏_{i=1}^{l-1} S_i',
        variables: [
          { symbol: 'K, S, P, D', meaning: 'Kích thước Kernel, Stride (bước nhảy), Padding và Dilation rate' },
          { symbol: 'RF_l', meaning: 'Kích thước vùng điểm ảnh đầu vào có ảnh hưởng tới 1 điểm trên feature map tầng l' },
          { symbol: '∏ S_i', meaning: 'Tích lũy hệ số thu nhỏ không gian (downsampling stride) của các tầng trước' }
        ],
        intuition:
          'Xếp chồng hai lớp Conv 3×3 (tổng 18C² tham số) cho cùng Receptive Field 5×5 như một lớp Conv 5×5 (25C² tham số) nhưng tiết kiệm 28% chi phí tính toán và tăng thêm một tầng phi tuyến.'
      },
      {
        name: 'Liên kết Tắt (Residual Learning — ResNet)',
        expression: 'y = F(x, {W_i}) + W_s · x   ⟹   ∂L / ∂x = (∂L / ∂y) · (I + ∂F / ∂x)',
        variables: [
          { symbol: 'F(x, {W_i})', meaning: 'Nhánh tích chập học phần dư (residual mapping)' },
          { symbol: 'W_s · x', meaning: 'Nhánh tắt (Identity shortcut hoặc 1×1 Conv nếu đổi số chiều/stride)' },
          { symbol: 'I', meaning: 'Ma trận đơn vị đảm bảo đạo hàm truyền thẳng từ tầng cuối về tầng đầu mà không bị suy giảm' }
        ],
        intuition:
          'Nhờ số hạng cộng I trong đạo hàm, ngay cả khi trọng số nhánh F(x) tiến về 0, tín hiệu gradient ∂L/∂y vẫn truyền nguyên vẹn qua hàng trăm tầng mà không bị triệt tiêu.'
      },
      {
        name: 'Độ phức tạp Self-Attention (ViT) vs Windowed Attention (Swin)',
        expression: 'Ω(MSA_Global) = 4(HW)C^2 + 2(HW)^2 C   |   Ω(W-MSA) = 4(HW)C^2 + 2 M^2 (HW) C',
        variables: [
          { symbol: 'HW', meaning: 'Tổng số patch/token của ảnh (ví dụ ảnh 1024×1024 với patch 16×16 có HW = 4096)' },
          { symbol: 'M', meaning: 'Kích thước cửa sổ cố định trong Swin Transformer (thường M = 7)' },
          { symbol: 'C', meaning: 'Số chiều vector đặc trưng (embedding dimension)' }
        ],
        intuition:
          'Self-attention toàn cục của ViT tăng bậc hai O((HW)²) theo độ phân giải ảnh, gây tràn bộ nhớ khi làm Detection/Segmentation ảnh độ phân giải cao. Swin giới hạn attention trong cửa sổ M×M và dịch cửa sổ (Shifted Window) ở tầng kế tiếp để đạt độ phức tạp tuyến tính O(HW).'
      }
    ],
    architecture: {
      title: 'Kiến trúc Backbone Phân cấp kết hợp Feature Pyramid Network (FPN)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Input Image H×W×3]                                                       │
│        │                                                                   │
│        ▼                                                                   │
│  [Stage C2: H/4 × W/4] ───(1×1 Lateral)───▶ [P2: Chi tiết vật thể nhỏ]     │
│        │                                           ▲                       │
│        ▼                                     (Upsample 2×)                 │
│  [Stage C3: H/8 × W/8] ───(1×1 Lateral)───▶ [P3: Vật thể trung bình]       │
│        │                                           ▲                       │
│        ▼                                     (Upsample 2×)                 │
│  [Stage C4: H/16×W/16] ───(1×1 Lateral)───▶ [P4: Ngữ nghĩa + Không gian]   │
│        │                                           ▲                       │
│        ▼                                     (Upsample 2×)                 │
│  [Stage C5: H/32×W/32] ───(1×1 Lateral)───▶ [P5: Ngữ nghĩa mức cao]        │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stem & C2 (Stride 4)',
          title: 'Trích xuất cạnh, góc và kết cấu tần số cao',
          tensorSpec: '[B, 256, H/4, W/4]',
          description: 'Giữ độ phân giải không gian cao nhất để định vị chính xác biên vật thể nhưng ngữ nghĩa còn thấp.'
        },
        {
          stage: 'Mid-Stages C3–C4 (Stride 8–16)',
          title: 'Tích hợp hình dạng bộ phận và quan hệ cục bộ',
          tensorSpec: '[B, 512..1024, H/8..H/16, W/8..W/16]',
          description: 'Phần lớn năng lực tính toán (FLOPs) tập trung tại Stage C4 (ví dụ ResNet-50 đặt 6 khối Bottleneck ở C4).'
        },
        {
          stage: 'Deep Stage C5 (Stride 32)',
          title: 'Biểu diễn ngữ nghĩa toàn cục (High-Level Semantics)',
          tensorSpec: '[B, 2048, H/32, W/32]',
          description: 'Trường nhìn bao phủ toàn ảnh giúp phân loại chính xác danh mục đối tượng nhưng mất chi tiết tọa độ điểm.'
        },
        {
          stage: 'Top-Down FPN Neck',
          title: 'Hợp nhất Đa tỉ lệ (Multi-Scale Feature Fusion)',
          tensorSpec: 'P2..P5 đồng nhất C = 256 kênh',
          description: 'Truyền ngữ nghĩa mạnh từ P5 xuống P2 qua đường Top-Down và cộng với đặc trưng độ phân giải cao qua nhánh nối ngang 1×1.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Tầng P2 (H/4 × W/4) có số lượng điểm lưới gấp 64 lần tầng P5, nếu đưa trực tiếp vào Detection Head sẽ làm tăng vọt độ trễ suy luận. Các hệ thống thời gian thực thường chỉ dùng P3, P4, P5.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Thiên kiến quy nạp (Inductive Bias) của CNN vs Vision Transformer',
        summary: 'Tại sao CNN học nhanh trên tập nhỏ trong khi ViT vượt trội khi có Pre-training quy mô lớn.',
        bullets: [
          'CNN có 2 giả định cứng trong kiến trúc: Tính cục bộ (Locality — các pixel lân cận có tương quan cao) và Tính đồng변 tịnh tiến (Translation Equivariance — dịch chuyển vật thể trên ảnh chỉ làm dịch chuyển tương ứng trên feature map nhờ chia sẻ trọng số bộ lọc).',
          'ViT cắt ảnh thành các patch 16×16, chiếu tuyến tính thành chuỗi token và cộng Positional Embedding. ViT không giả định sẵn tính cục bộ, do đó cần dữ liệu lớn (JFT/ImageNet-21K) hoặc kỹ thuật tự giám sát (MAE, DINOv2) để tự học cấu trúc không gian.',
          'Depthwise Separable Convolution (MobileNet, ConvNeXt) tách tích chập không gian từng kênh (Depthwise) và tích chập trộn kênh 1×1 (Pointwise), giảm chi phí tính toán từ K²·C_in·C_out xuống còn K²·C_in + C_in·C_out (giảm ~8–9 lần với kernel 3×3).'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Tiến hóa từ ResNet sang ConvNeXt & Swin Transformer',
        summary: 'Hiện đại hóa CNN bằng triết lý thiết kế của Vision Transformer.',
        bullets: [
          'Inverted Bottleneck: Thay vì thu hẹp kênh rồi mở rộng như ResNet (C → C/4 → C), MobileNetV2 và ConvNeXt mở rộng kênh gấp 4 lần ở giữa (C → 4C → C) tương tự khối MLP của Transformer.',
          'Large Kernel (7×7 Depthwise Conv): Mở rộng vùng cảm nhận trên mỗi khối mà không làm nổ tham số nhờ thực hiện trên từng kênh riêng biệt.',
          'Swin Transformer giải quyết bài toán đa tỉ lệ bằng Patch Merging (gộp 2×2 patch lân cận để giảm nửa độ phân giải và nhân đôi số kênh), cho phép cắm trực tiếp vào FPN, Mask R-CNN hoặc BEVusion.'
        ],
        productionTip: 'Trên phần cứng xe tự hành (NVIDIA Orin / TensorRT), ConvNeXt hoặc ResNet-FPN đã lượng tử hóa INT8 thường đạt thông lượng FPS/Watt cao và ổn định hơn ViT thuần túy vì không bị nghẽn ở phép tính Softmax ma trận lớn.'
      }
    ],
    comparisonTable: {
      title: 'Đối chiếu các Kiến trúc Backbone Thị giác Máy tính Chủ đạo',
      headers: ['Kiến trúc', 'Cơ chế Trích xuất Đặc trưng', 'Độ phức tạp theo Độ phân giải', 'Ưu thế Triển khai Thực tế'],
      rows: [
        ['ResNet (50/101)', 'Conv 3×3 + Bottleneck + Residual', 'Tuyến tính O(HW)', 'Chuẩn mực công nghiệp, dễ lượng tử hóa INT8, tốc độ ổn định trên mọi phần cứng'],
        ['MobileNetV3 / EfficientNet', 'Depthwise Separable Conv + SE Attention', 'Tuyến tính O(HW) siêu nhẹ', 'Thiết bị di động, camera biên công suất thấp, độ trễ < 5ms'],
        ['ViT (Vision Transformer)', 'Patch 16×16 + Global Multi-Head Attention', 'Bậc hai O((HW)²)', 'Foundation Model đa phương thức (CLIP, VLM), biểu diễn toàn cục cực mạnh'],
        ['Swin Transformer', 'Shifted Window Attention + Patch Merging', 'Tuyến tính O(HW)', 'Backbone đa năng mạnh nhất cho 2D/3D Object Detection, Segmentation & BEV'],
        ['ConvNeXt', '7×7 Depthwise Conv + Inverted Bottleneck', 'Tuyến tính O(HW)', 'Đạt độ chính xác ngang Swin nhưng giữ nguyên sự đơn giản thuần tích chập']
      ]
    }
  },
  {
    id: 'P2_D03',
    phase: 'phase2',
    dayNumber: 3,
    codeLabel: 'Day 3',
    title: 'Day 3: Track04-2d-perception-detection-segmentation-keypoints',
    subtitle: 'Object Detection (YOLO, DETR), Semantic/Instance/Panoptic Segmentation & Keypoint Estimation',
    category: 'Nhận thức 2D (Detection, Segmentation, Pose)',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Nhận thức 2D hợp nhất ba bài toán: định vị hộp giới hạn (Detection), phân lớp tới từng điểm ảnh (Segmentation) và ước lượng cấu trúc khớp (Keypoints); chìa khóa nằm ở cách gán nhãn dương/âm (Label Assignment), hàm loss hình học (GIoU/Focal/Dice) và cơ chế loại bỏ dự đoán trùng lặp (NMS vs Hungarian Matching).',
    formulas: [
      {
        name: 'Generalized IoU (GIoU) Loss cho Hộp giới hạn',
        expression: 'IoU = |A ∩ B| / |A ∪ B|   |   GIoU = IoU - |C \\ (A ∪ B)| / |C|   |   L_{GIoU} = 1 - GIoU',
        variables: [
          { symbol: 'A, B', meaning: 'Hộp dự đoán (Predicted Box) và hộp nhãn thật (Ground-Truth Box)' },
          { symbol: 'C', meaning: 'Hộp bao nhỏ nhất (Smallest Enclosing Convex Box) chứa cả A và B' },
          { symbol: '|C \\ (A ∪ B)|', meaning: 'Diện tích phần trống trong hộp bao C không thuộc A hay B' }
        ],
        intuition:
          'Nếu hai hộp A và B không giao nhau, IoU = 0 dẫn đến đạo hàm bằng 0 (không biết kéo hộp A về hướng nào). GIoU phạt diện tích vùng trống trong hộp bao chung C, cung cấp gradient liên tục ngay cả khi hai hộp ở xa nhau.'
      },
      {
        name: 'Focal Loss (Giải quyết mất cân bằng lớp Tiền cảnh - Hậu cảnh)',
        expression: 'FL(p_t) = - α_t · (1 - p_t)^γ · log(p_t)',
        variables: [
          { symbol: 'p_t', meaning: 'Xác suất mô hình dự đoán cho lớp đúng (p_t gần 1 nghĩa là mẫu dễ)' },
          { symbol: '(1 - p_t)^γ', meaning: 'Hệ số điều biến giảm mạnh trọng số của hàng chục nghìn mẫu nền dễ (thường γ = 2)' },
          { symbol: 'α_t', meaning: 'Trọng số cân bằng tần suất giữa lớp dương và lớp âm (thường α = 0.25)' }
        ],
        intuition:
          'Trong One-Stage Detector, 99.9% vị trí trên lưới là nền (background) dễ phân biệt. Nếu dùng Cross-Entropy thường, tổng đạo hàm của hàng vạn mẫu nền nhỏ sẽ lấn át hoàn toàn vài mẫu vật thể. Focal Loss triệt tiêu đóng góp của mẫu đã dự đoán đúng (p_t → 1) để tập trung vào mẫu khó.'
      },
      {
        name: 'Dice Loss (Segmentation) & Đối sánh lưỡng phân Hungarian (DETR)',
        expression: 'L_{Dice} = 1 - (2 ∑ p_i g_i + ε) / (∑ p_i + ∑ g_i + ε)   |   σ̂ = argmin_{σ ∈ S_N} ∑_{i=1}^N L_{match}(y_i, ŷ_{σ(i)})',
        variables: [
          { symbol: 'p_i, g_i', meaning: 'Xác suất dự đoán và nhãn thật tại pixel thứ i của mặt nạ phân vùng' },
          { symbol: 'σ ∈ S_N', meaning: 'Hoán vị ghép cặp 1-đối-1 giữa N Object Queries và tập nhãn thật' }
        ],
        intuition:
          'Dice Loss tối ưu trực tiếp độ chồng lấp F1 trên mặt nạ pixel nên không bị lệch khi vật thể rất nhỏ so với nền. Trong khi đó, phép ghép cặp 1-1 Hungarian trong DETR buộc mỗi vật thể chỉ có đúng 1 query chiến thắng, loại bỏ hoàn toàn bước hậu xử lý NMS.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Nhận thức Đa tác vụ 2D (Multi-Task Perception Head)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Backbone + FPN Neck (P2, P3, P4, P5)]                                    │
│        │                                                                   │
│        ├──▶ [Decoupled Detection Head] ──▶ (Cls Branch + Reg/DFL Branch)   │
│        │                                                                   │
│        ├──▶ [Instance/Panoptic Seg Head] ─▶ (Mask Prototypes × Coeffs)     │
│        │                                                                   │
│        └──▶ [Keypoint Estimation Head] ───▶ (2D Gaussian Heatmaps + Offset)│
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Nhánh 1: Detection',
          title: 'Decoupled Classification & Box Regression',
          tensorSpec: 'Cls: [B, H×W, N_classes], Box: [B, H×W, 4]',
          description: 'Tách riêng nhánh phân loại (cần đặc trưng bất biến ở tâm vật thể) và nhánh hồi quy tọa độ (cần đặc trưng nhạy với biên giới hạn) giúp tăng mAP thêm 1.5–2%.'
        },
        {
          stage: 'Nhánh 2: Segmentation',
          title: 'Semantic + Instance = Panoptic Segmentation',
          tensorSpec: 'Stuff (mặt đường, bầu trời) + Things (xe, người đi bộ)',
          description: 'Semantic gán nhãn lớp cho mỗi pixel nhưng không tách từng cá thể cùng lớp; Instance tách từng chiếc xe riêng lẻ; Panoptic hợp nhất cả hai trên một bản đồ duy nhất.'
        },
        {
          stage: 'Nhánh 3: Keypoints',
          title: 'Top-Down vs Bottom-Up Pose Estimation',
          tensorSpec: 'Heatmaps: [B, K_joints, H/4, W/4] + Part Affinity Fields',
          description: 'Biểu diễn mỗi khớp bằng phân phối Gaussian 2D quanh tọa độ thật giúp mạng dễ học không gian hơn nhiều so với hồi quy trực tiếp tọa độ (x, y) bằng tầng FC.'
        },
        {
          stage: 'Post-Processing',
          title: 'Non-Maximum Suppression (NMS) vs Set Prediction',
          tensorSpec: 'Giữ box điểm cao nhất, loại các box có IoU > τ_NMS',
          description: 'NMS truyền thống dễ xóa nhầm vật thể thật khi hai người/xe đứng sát nhau (Crowded Scene); Soft-NMS hoặc DETR giải quyết triệt để hạn chế này.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Trong bài toán Keypoint Heatmap, sai số lượng tử hóa (quantization error) do heatmap có độ phân giải bằng 1/4 ảnh gốc gây lệch 2–4 pixel; cần dự đoán thêm vector Sub-pixel Offset hoặc dùng SimCC (tách trục X, Y 1D) để đạt độ chính xác cao mà nhẹ bộ nhớ.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Anchor-based vs Anchor-free & Chiến lược Dynamic Label Assignment',
        summary: 'Cách gán các điểm lưới (grid cells) làm mẫu dương (Positive Samples) trong các bộ phát hiện hiện đại.',
        bullets: [
          'Anchor-based (Faster R-CNN, RetinaNet, YOLOv5): Đặt sẵn nhiều hộp mẫu có tỉ lệ khung hình (aspect ratio) cố định tại mỗi điểm lưới; nhạy cảm với siêu tham số thiết kế anchor.',
          'Anchor-free (FCOS, CenterNet, YOLOv8/v10): Dự đoán trực tiếp khoảng cách (l, t, r, b) từ điểm lưới bên trong vật thể tới 4 cạnh hộp hoặc phát hiện điểm tâm vật thể.',
          'Task-Aligned Assigner (TAL / SimOTA): Chọn mẫu dương động dựa trên điểm kết hợp t = s^α · u^β (với s là điểm phân loại và u là IoU hộp dự đoán), đảm bảo điểm lưới vừa phân loại đúng vừa có khung hộp chính xác nhất.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Phân biệt Semantic, Instance và Panoptic Segmentation',
        summary: 'Chọn đúng bài toán phân vùng điểm ảnh cho hệ thống xe tự hành và robot.',
        bullets: [
          'Semantic Segmentation (DeepLabv3+, SegFormer): Phân loại từng pixel thuộc lớp nào (Làn đường, Vỉa hè, Xe cộ). Đánh giá bằng chỉ số mIoU = (1/C) ∑ TP / (TP + FP + FN).',
          'Instance Segmentation (Mask R-CNN, YOLACT, Mask2Former): Phân biệt từng đối tượng đếm được (Car #1, Car #2). Đánh giá bằng Mask AP trên ngưỡng IoU từ 0.50 đến 0.95.',
          'Panoptic Segmentation: Kết hợp vùng nền không đếm được (Stuff) và đối tượng đếm được (Things), đánh giá bằng chỉ số Panoptic Quality: PQ = SQ (Segmentation Quality) × RQ (Recognition Quality).'
        ]
      },
      {
        id: 'sec-3',
        title: '3. Ước lượng Điểm mốc (Keypoints) & Object Keypoint Similarity (OKS)',
        summary: 'Định vị khớp xương người, điểm mốc làn đường và góc xe 3D chiếu lên ảnh 2D.',
        bullets: [
          'Top-Down (Detect-then-Pose như HRNet, ViTPose): Phát hiện hộp từng đối tượng trước rồi cắt ảnh đưa vào mạng tìm khớp. Độ chính xác rất cao nhưng thời gian chạy tăng tuyến tính theo số người trong ảnh.',
          'Bottom-Up (OpenPose, HigherHRNet): Tìm tất cả khớp của mọi người trong 1 lượt chạy rồi ghép nối các khớp về từng cá thể (Grouping). Tốc độ cố định bất kể đám đông.',
          'Chỉ số đánh giá OKS (Object Keypoint Similarity) đóng vai trò tương tự IoU: OKS = ∑ exp(-d_i² / (2 s² κ_i²)) · δ(v_i > 0) / ∑ δ(v_i > 0), chuẩn hóa khoảng cách lệch d_i theo diện tích đối tượng s² và hằng số độ khó của từng khớp κ_i.'
        ],
        productionTip: 'Khi huấn luyện Keypoint bằng Heatmap Gaussian, luôn nhân đôi trọng số loss cho các khớp bị che khuất một phần (occluded joints) và sử dụng Dark-Pose (giải tích cực đại hàm Taylor bậc 2 trên heatmap) để khử sai số rời rạc khi giải mã tọa độ.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Họ Mô hình Nhận thức 2D trong Production',
      headers: ['Họ Mô hình', 'Cơ chế Cốt lõi', 'Yêu cầu NMS', 'Ưu / Nhược điểm Thực chiến'],
      rows: [
        ['Faster / Mask R-CNN', 'Two-Stage: RPN + RoIAlign', 'Có (cả ở RPN và Head)', 'Chính xác với vật thể nhỏ/mặt nạ chi tiết, nhưng cấu trúc 2 giai đoạn có độ trễ cao hơn'],
        ['YOLO Series (v8/v10/v11)', 'One-Stage Anchor-free + CSP/PANet + TAL', 'Không cần ở YOLOv10 (Dual Assign)', 'Tối ưu cực tốt cho TensorRT/Edge, cân bằng tốt nhất giữa FPS và mAP'],
        ['DETR / RT-DETR', 'Object Queries + Deformable Attention + Hungarian', 'Không (End-to-End)', 'Không phụ thuộc ngưỡng NMS thủ công, xử lý tốt cảnh vật thể chồng lấp dày đặc'],
        ['Mask2Former', 'Masked Cross-Attention với Query đa nhiệm', 'Không', 'Một kiến trúc thống nhất giải quyết cả Semantic, Instance và Panoptic Segmentation']
      ]
    }
  },
  {
    id: 'P2_D04',
    phase: 'phase2',
    dayNumber: 4,
    codeLabel: 'Day 4',
    title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    subtitle: 'Temporal Perception, Optical Flow, 3D CNN, ConvLSTM, Video Transformers & Sensor Time Sync',
    category: 'Nhận thức Chuỗi Thời gian & Đồng bộ Cảm biến',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Một khung hình đơn lẻ không thể quan sát vận tốc, gia tốc hay vật thể tạm thời bị che khuất; mô hình hóa chuỗi khung hình - thời gian đòi hỏi đồng bộ phần cứng chính xác (Hardware Timestamp/PTP), bù chuyển động của chính xe (Ego-motion Compensation) và cơ chế tích lũy đặc trưng lịch sử.',
    formulas: [
      {
        name: 'Giả thiết Độ sáng Không đổi & Phương trình Optical Flow',
        expression: 'I(x, y, t) = I(x + Δx, y + Δy, t + Δt)   ⟹   I_x · u + I_y · v + I_t = 0',
        variables: [
          { symbol: 'I_x, I_y, I_t', meaning: 'Đạo hàm riêng của cường độ sáng theo không gian (x, y) và thời gian t' },
          { symbol: '(u, v) = (dx/dt, dy/dt)', meaning: 'Vector vận tốc chuyển động điểm ảnh (Optical Flow) trên mặt phẳng ảnh' }
        ],
        intuition:
          'Một phương trình có 2 ẩn (u, v) dẫn đến bài toán Aperture Problem (chỉ xác định được chuyển động vuông góc với biên). Các mạng hiện đại như RAFT giải quyết bằng cách dựng ma trận tương quan 4D (4D All-Pairs Correlation Volume) và cập nhật lặp trường flow bằng GRU.'
      },
      {
        name: 'Bù chuyển động Ego-Motion giữa các Khung hình Liên tiếp',
        expression: 'p_{t-1 → t} = T_{ego, t ← t-1} · p_{t-1} ,   với   T_{ego} = [ R_{Δt}  |  t_{Δt} ;  0  |  1 ] ∈ SE(3)',
        variables: [
          { symbol: 'p_{t-1}', meaning: 'Tọa độ 3D của điểm/đặc trưng tại thời điểm lịch sử t - 1' },
          { symbol: 'T_{ego, t ← t-1}', meaning: 'Ma trận biến đổi cứng 6 bậc tự do (Pose biến thiên của xe chủ lấy từ IMU/Odometry)' },
          { symbol: 'R_{Δt}, t_{Δt}', meaning: 'Ma trận quay 3×3 và vector tịnh tiến 3×1 của xe trong khoảng Δt' }
        ],
        intuition:
          'Nếu cộng trực tiếp feature map ở thời điểm t-1 vào thời điểm t mà không nhân ma trận bù chuyển động của xe chủ T_{ego}, các vật thể đứng yên sẽ bị nhòe (ghosting/blur) do chính xe đang di chuyển.'
      },
      {
        name: 'Hiệu chỉnh Méo Rolling Shutter & Nội suy Thời gian Cảm biến',
        expression: 't(r) = t_{frame} + r · τ_{line}   |   p̃_i(t_{ref}) = p_i(t_i) + v_{ego} · (t_{ref} - t_i)',
        variables: [
          { symbol: 'r, τ_{line}', meaning: 'Chỉ số hàng ảnh thứ r và thời gian phơi sáng chênh lệch giữa hai hàng liên tiếp' },
          { symbol: 't_{ref}', meaning: 'Mốc thời gian chuẩn chung để quy chiếu mọi điểm LiDAR/Camera về cùng một lát cắt' }
        ],
        intuition:
          'Camera Rolling Shutter đọc từng dòng từ trên xuống dưới (chênh nhau 10–30ms), còn LiDAR quay 360° mất 100ms. Nếu xe chạy 20m/s (72km/h), trong 100ms xe đã đi được 2 mét — không khử méo thời gian (Motion Deskewing) sẽ làm biến dạng hoàn toàn hình học vật thể.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Tích lũy Đặc trưng Thời gian (Recurrent Temporal Feature Queue)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Frame t-2] ──▶ [Backbone] ──▶ [F_{t-2}] ──(Warp by Ego-Pose)──┐          │
│  [Frame t-1] ──▶ [Backbone] ──▶ [F_{t-1}] ──(Warp by Ego-Pose)──┼──┐       │
│  [Frame t  ] ──▶ [Backbone] ──▶ [F_{t}  ] ──────────────────────┼──┼──┐    │
│                                                                 ▼  ▼  ▼    │
│                                       [Temporal Fusion: ConvGRU / CrossAttn]│
│                                                         │                  │
│                                                         ▼                  │
│                                       [Temporally-Consistent Perception]   │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Hardware Sync',
          title: 'Đồng bộ Xung nhịp PTP / GPS PPS',
          tensorSpec: 'Δt_sync < 1ms giữa Camera, LiDAR và IMU',
          description: 'Gán nhãn thời gian tại thời điểm phơi sáng thật (Mid-exposure timestamp) thay vì thời điểm gói tin tới CPU (Arrival timestamp).'
        },
        {
          stage: 'Stage 2: Spatial Alignment',
          title: 'Căn chỉnh Hệ quy chiếu (Ego-Motion Warping)',
          tensorSpec: 'Grid Sample F_{t-1} theo ma trận T_{t ← t-1}',
          description: 'Đưa toàn bộ đặc trưng lịch sử về hệ tọa độ gắn với xe tại thời điểm hiện tại t trước khi trộn đặc trưng.'
        },
        {
          stage: 'Stage 3: Temporal Aggregation',
          title: 'Hợp nhất Chuỗi (3D Conv / ConvGRU / Temporal Attention)',
          tensorSpec: '[B, T, C, H, W] → [B, C, H, W]',
          description: 'Học vận tốc ẩn của các vật thể động và khôi phục thông tin cho các vật thể bị che khuất tạm thời ở khung hình t.'
        },
        {
          stage: 'Stage 4: Streaming Inference',
          title: 'Bộ đệm Trạng thái (Memory Queue / Hidden State)',
          tensorSpec: 'Chỉ chạy Backbone cho Frame t mới nhất',
          description: 'Trong thực tế, không bao giờ chạy lại Backbone cho T khung hình cũ ở mỗi bước; luôn lưu F_{t-1} trong Ring Buffer để độ trễ suy luận giữ nguyên như mô hình đơn khung hình.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Sai số từ IMU/Odometry tích lũy theo thời gian (Drift). Nếu ghép chuỗi lịch sử quá dài (T > 8 giây) mà chỉ dựa vào Odometry cục bộ sẽ làm lệch vị trí đặc trưng; cần cơ chế cổng quên (Forget Gate trong ConvGRU) hoặc trọng số Attention giảm dần.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Tại sao Nhận thức Chuỗi Thời gian là Bắt buộc trong Hệ thống Tự hành?',
        summary: 'Ba bài toán bất khả thi nếu chỉ nhìn từng bức ảnh độc lập.',
        bullets: [
          'Ước lượng vận tốc & hướng di chuyển từ Camera: Một ảnh tĩnh không cho biết chiếc xe phía trước đang đứng yên hay đang phanh gấp; chuỗi từ 2–4 khung hình liên tiếp cho phép suy ra vector vận tốc trực tiếp.',
          'Xử lý che khuất tạm thời (Temporary Occlusion): Người đi bộ khuất sau xe tải trong 0.5 giây vẫn được duy trì sự tồn tại trong bộ nhớ không gian - thời gian (Spatio-Temporal Memory).',
          'Ổn định dự đoán (Temporal Flickering Suppression): Khử hiện tượng hộp giới hạn hoặc nhãn phân vùng nhấp nháy liên tục giữa các khung hình liền kề.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Các Kiến trúc Mô hình hóa Thời gian: 3D CNN, ConvLSTM, Optical Flow & Video Transformer',
        summary: 'Ưu nhược điểm của từng phương pháp kết합 chiều thời gian T vào không gian (H, W).',
        bullets: [
          '2D CNN + Late Temporal Pooling / LSTM: Trích xuất vector 1D cho mỗi khung hình rồi đưa vào LSTM; nhẹ nhưng làm mất hoàn toàn tương quan chuyển động cục bộ ở mức điểm ảnh.',
          '3D CNN (I3D, SlowFast) & (2+1)D Conv: Tích chập khối 3 chiều (k_t × k_h × k_w); tách thành tích chập không gian 1×k×k nối tiếp tích chập thời gian k_t×1×1 giúp giảm tham số và dễ tối ưu hóa.',
          'ConvLSTM / ConvGRU: Thay phép nhân ma trận trong cổng LSTM bằng phép tích chập không gian, giữ nguyên cấu trúc bản đồ đặc trưng [C, H, W] qua các bước thời gian.',
          'Divided Space-Time Attention (TimeSformer, VideoSwin): Áp dụng Attention theo trục thời gian và không gian tách biệt để tránh chi phí bậc hai O((T·H·W)²).'
        ],
        productionTip: 'Luôn kiểm tra hiện tượng "Timestamp Jitter" và "Frame Drop" khi chạy thực tế: Mô hình thời gian phải nhận thêm đầu vào Δt thực tế (ví dụ nhúng Δt vào Positional Encoding) thay vì giả định cứng khoảng cách giữa hai frame luôn cố định là 33.3ms (30 FPS).'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Phương pháp Kết hợp Thông tin Thời gian (Temporal Modeling)',
      headers: ['Phương pháp', 'Cấu trúc Tensor Lưu trữ', 'Chi phí Tính toán Suy luận', 'Độ bền vững với Chuyển động Lớn'],
      rows: [
        ['Frame Stacking (Ghép kênh)', '[B, T×C, H, W]', 'Rất thấp (chỉ tăng kênh lớp đầu)', 'Kém nếu không bù Ego-motion, tầm nhìn thời gian ngắn'],
        ['3D CNN / (2+1)D Conv', '[B, C, T, H, W]', 'Cao (phải trượt cửa sổ trên nhiều frame)', 'Tốt cho nhận dạng hành động ngắn hạn (Action Recognition)'],
        ['ConvGRU + Ego-Motion Warp', 'Hidden State [B, C, H, W]', 'Thấp (Streaming O(1) mỗi frame)', 'Rất tốt, chuẩn mực trong BEV4D / StreamPETR / VideoBEV'],
        ['Temporal Cross-Attention', 'Memory Bank K, V qua T bước', 'Trung bình (linh hoạt chọn điểm lấy mẫu)', 'Xuất sắc vì Deformable Attention tự tìm vị trí vật thể đã di chuyển']
      ]
    }
  },
  {
    id: 'P2_D05',
    phase: 'phase2',
    dayNumber: 5,
    codeLabel: 'Day 5',
    title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    subtitle: 'Bayes Filter, Linear Kalman Filter, EKF, UKF, Mahalanobis Distance & Probabilistic Sensor Fusion',
    category: 'Ước lượng Trạng thái & Hợp nhất Xác suất',
    defaultStatus: 'completed',
    defaultProgress: 100,
    keyIdea:
      'Mọi cảm biến vật lý đều chứa nhiễu; Bộ lọc Kalman là bộ ước lượng tuyến tính tối ưu theo nghĩa bình phương tối thiểu (MMSE), kết hợp dự đoán động học (Prediction) và phép đo cảm biến (Measurement Update) thông qua ma trận hiệp phương sai độ bất định.',
    formulas: [
      {
        name: 'Bước Dự đoán (Prediction Step — Time Update)',
        expression: 'x̂_{k|k-1} = F_k x̂_{k-1|k-1} + B_k u_k   |   P_{k|k-1} = F_k P_{k-1|k-1} F_k^T + Q_k',
        variables: [
          { symbol: 'x̂_{k|k-1}', meaning: 'Trạng thái tiên nghiệm (a priori state) dự đoán tại bước k trước khi có phép đo mới' },
          { symbol: 'F_k', meaning: 'Ma trận chuyển tiếp trạng thái (State Transition Matrix, ví dụ mô hình Constant Velocity)' },
          { symbol: 'P_{k|k-1}', meaning: 'Ma trận hiệp phương sai độ bất định tiên nghiệm (luôn phình to thêm do nhiễu quá trình Q_k)' },
          { symbol: 'Q_k', meaning: 'Ma trận hiệp phương sai nhiễu quá trình (Process Noise Covariance — mô hình hóa gia tốc ngẫu nhiên)' }
        ],
        intuition:
          'Khi chỉ dự đoán bằng mô hình toán học mà chưa nhìn cảm biến, độ bất định P bắt buộc phải tăng lên (do cộng thêm Q_k dương xác định).'
      },
      {
        name: 'Bước Cập nhật Đo lường & Hệ số Kalman Gain (Measurement Update)',
        expression: 'ỹ_k = z_k - H_k x̂_{k|k-1}  |  S_k = H_k P_{k|k-1} H_k^T + R_k  |  K_k = P_{k|k-1} H_k^T S_k^{-1}  |  x̂_{k|k} = x̂_{k|k-1} + K_k ỹ_k',
        variables: [
          { symbol: 'ỹ_k', meaning: 'Phần dư đổi mới (Innovation / Measurement Residual) giữa phép đo z_k và giá trị kỳ vọng' },
          { symbol: 'S_k', meaning: 'Hiệp phương sai của phần dư đổi mới (Innovation Covariance)' },
          { symbol: 'R_k', meaning: 'Ma trận hiệp phương sai nhiễu cảm biến (Measurement Noise Covariance)' },
          { symbol: 'K_k', meaning: 'Hệ số Kalman Gain quyết định tin vào dự đoán động học hay tin vào phép đo cảm biến hơn' }
        ],
        intuition:
          'Nếu cảm biến cực kỳ chính xác (R_k → 0), K_k → H_k^{-1} nên trạng thái hậu nghiệm bám sát phép đo z_k. Ngược lại nếu cảm biến nhiễu nặng (R_k → ∞), K_k → 0 nên bộ lọc bỏ qua phép đo và giữ nguyên dự đoán động học.'
      },
      {
        name: 'Cập nhật Hiệp phương sai Joseph Form & Khoảng cách Mahalanobis (Gating)',
        expression: 'P_{k|k} = (I - K_k H_k) P_{k|k-1} (I - K_k H_k)^T + K_k R_k K_k^T   |   d_M^2 = ỹ_k^T S_k^{-1} ỹ_k ≤ χ^2_{df, α}',
        variables: [
          { symbol: 'd_M^2', meaning: 'Bình phương khoảng cách Mahalanobis chuẩn hóa theo ma trận bất định S_k' },
          { symbol: 'χ^2_{df, α}', meaning: 'Ngưỡng phân phối Chi-bình phương (ví dụ với df = 2 bậc tự do, mức tin cậy 95% có ngưỡng ≈ 5.99)' }
        ],
        intuition:
          'Công thức rút gọn P = (I - KH)P rất dễ mất tính đối xứng và xác định dương do sai số làm tròn số thực dấu phẩy động; dạng tổng đối xứng Joseph Form bảo toàn tính xác định dương tuyệt đối. Khoảng cách Mahalanobis giúp loại bỏ các phép đo ngoại lai (Outlier Rejection / Gating) trước khi cập nhật.'
      }
    ],
    architecture: {
      title: 'Chu trình Đệ quy Bayes & Hợp nhất Đa cảm biến Không đồng bộ (Async EKF/UKF)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Trạng thái x̂_{k-1}, P_{k-1}]                                             │
│               │                                                            │
│               ▼  (IMU / Motion Model @ 100Hz: F_k, Q_k)                    │
│  [Dự đoán Tiên nghiệm x̂_{k|k-1}, P_{k|k-1}]                                │
│               │                                                            │
│               ▼  (Phép đo z_k từ LiDAR / Radar / Camera + R_k)             │
│  [Cổng kiểm tra Mahalanobis: ỹ_k^T S_k^{-1} ỹ_k ≤ γ]                       │
│         ├── (Quá ngưỡng: Outlier) ──▶ [Bác bỏ phép đo nhiễu]               │
│         ▼   (Hợp lệ)                                                       │
│  [Tính Kalman Gain K_k & Cập nhật Hậu nghiệm x̂_{k|k}, P_{k|k}]             │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: State Definition',
          title: 'Thiết kế Vector Trạng thái & Mô hình Động học',
          tensorSpec: 'x = [p_x, p_y, v, ψ, ψ̇]^T (Mô hình CTRV)',
          description: 'Chọn mô hình Constant Velocity (CV), Constant Acceleration (CA) hoặc Constant Turn Rate and Velocity (CTRV) tùy theo đặc trưng chuyển động của phương tiện.'
        },
        {
          stage: 'Stage 2: Non-Linear Handling',
          title: 'Tuyến tính hóa Jacobian (EKF) hoặc Điểm Sigma (UKF)',
          tensorSpec: 'F_k = ∂f/∂x , H_k = ∂h/∂x  hoặc  2n+1 Sigma Points',
          description: 'Radar đo trong hệ tọa độ cực (khoảng cách r, góc phương vị θ, vận tốc xuyên tâm ṙ). Phép đổi sang tọa độ Đề-các (x, y) là phi tuyến nên bắt buộc dùng EKF hoặc UKF.'
        },
        {
          stage: 'Stage 3: Measurement Gating',
          title: 'Kiểm định Chi-Square bằng Khoảng cách Mahalanobis',
          tensorSpec: 'd_M² = (z - h(x̂))^T S^{-1} (z - h(x̂))',
          description: 'Khác với khoảng cách Euclid coi mọi hướng đều như nhau, Mahalanobis tính đến hình elip bất định S_k của cả quỹ đạo lẫn cảm biến.'
        },
        {
          stage: 'Stage 4: Probabilistic Fusion',
          title: 'Cập nhật Tuần tự Đa Cảm biến (Sequential Sensor Update)',
          tensorSpec: 'Tích của 2 phân phối Gaussian là 1 Gaussian có phương sai nhỏ hơn cả hai',
          description: 'Khi kết hợp LiDAR (đo vị trí chính xác) và Radar (đo vận tốc Doppler chính xác), elip bất định hậu nghiệm co nhỏ lại theo cả hai chiều.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Trong EKF với góc hướng (yaw angle ψ), phép trừ phần dư góc (ψ_meas - ψ_pred) nếu không chuẩn hóa về khoảng (-π, π] sẽ tạo ra bước nhảy vọt 2π tại ranh giới ±180°, làm nổ ma trận hiệp phương sai ngay lập tức.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Hợp nhất Xác suất (Probabilistic Fusion) của hai phép đo Gaussian',
        summary: 'Tại sao hợp nhất hai cảm biến luôn cho phương sai nhỏ hơn từng cảm biến thành phần.',
        bullets: [
          'Giả sử cảm biến 1 đo vị trí x₁ ~ N(μ₁, σ₁²) và cảm biến 2 đo x₂ ~ N(μ₂, σ₂²) độc lập. Khi hợp nhất theo quy tắc Bayes, phân phối hậu nghiệm có trung bình μ_fused = (σ₂² μ₁ + σ₁² μ₂) / (σ₁² + σ₂²) và phương sai 1/σ_fused² = 1/σ₁² + 1/σ₂².',
          'Hệ quả toán học quan trọng: σ_fused² = (σ₁² σ₂²) / (σ₁² + σ₂²) luôn nhỏ hơn min(σ₁², σ₂²). Tức là ngay cả khi ghép một cảm biến kém chính xác hơn vào một cảm biến tốt, nếu biết đúng phương sai của nó thì ước lượng tổng hợp vẫn tốt hơn.',
          'Log-Odds Occupancy Grid Mapping: Để cập nhật xác suất p(m_i | z_{1:t}) của một ô lưới có vật cản, ta cộng dồn đại lượng Log-Odds l(x) = log(p(x) / (1 - p(x))) để tránh phép nhân/chia số thực cực nhỏ và khử hoàn toàn nguy cơ tràn số.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. So sánh KF, EKF, UKF và Particle Filter',
        summary: 'Khi nào phép khai triển Taylor bậc 1 của EKF thất bại và cách UKF khắc phục.',
        bullets: [
          'Extended Kalman Filter (EKF) xấp xỉ hàm phi tuyến f(x), h(x) bằng khai triển Taylor bậc 1 quanh điểm ước lượng hiện tại (tính ma trận đạo hàm riêng Jacobian). Nếu hàm có độ cong lớn hoặc bước thời gian Δt dài, xấp xỉ tuyến tính gây sai lệch trung bình và có thể làm bộ lọc phân kỳ.',
          'Unscented Kalman Filter (UKF) dùng phép biến đổi Unscented: chọn 2n + 1 điểm đại diện có trọng số (Sigma Points) quanh trung bình, đẩy trực tiếp các điểm này qua hàm phi tuyến gốc rồi tính lại trung bình và hiệp phương sai mới — đạt độ chính xác tới bậc 2–3 mà không cần tính đạo hàm Jacobian.',
          'Particle Filter (Monte Carlo Localization) dùng hàng nghìn hạt ngẫu nhiên để biểu diễn phân phối đa đỉnh (Multi-modal / Non-Gaussian), rất mạnh khi robot chưa biết vị trí ban đầu (Kidnapped Robot Problem) nhưng tốn tài nguyên tính toán theo số chiều trạng thái.'
        ],
        productionTip: 'Luôn giám sát chỉ số NIS (Normalized Innovation Squared): ε_k = ỹ_k^T S_k^{-1} ỹ_k. Nếu trung bình NIS thực tế lớn hơn nhiều so với kỳ vọng lý thuyết của phân phối Chi-square, nghĩa là bạn đang đặt ma trận nhiễu Q_k hoặc R_k quá nhỏ (bộ lọc quá tự tin / overconfident).'
      }
    ],
    comparisonTable: {
      title: 'Bảng Đối chiếu các Bộ lọc Ước lượng Trạng thái Xác suất',
      headers: ['Bộ lọc', 'Giả định Mô hình & Nhiễu', 'Cơ chế Truyền Độ bất định', 'Chi phí Tính toán & Độ phức tạp'],
      rows: [
        ['Linear Kalman Filter (KF)', 'Tuyến tính hoàn toàn, nhiễu Gaussian', 'Biến đổi ma trận chính xác F·P·F^T', 'O(n³), cực nhanh, tối ưu tuyệt đối cho hệ tuyến tính'],
        ['Extended KF (EKF)', 'Phi tuyến nhẹ, nhiễu Gaussian', 'Khai triển Taylor bậc 1 (Ma trận Jacobian)', 'O(n³), nhanh nhưng dễ phân kỳ nếu phi tuyến mạnh'],
        ['Unscented KF (UKF)', 'Phi tuyến mạnh (CTRV, Radar), Gaussian', '2n + 1 điểm Sigma qua hàm gốc', 'Cùng bậc O(n³), chính xác hơn EKF, không cần tính đạo hàm'],
        ['Particle Filter (PF)', 'Phi tuyến tùy ý, nhiễu đa đỉnh (Non-Gaussian)', 'Lấy mẫu Monte Carlo có trọng số (N hạt)', 'Rất cao O(N_particles), bị lời nguyền số chiều khi n > 6']
      ]
    }
  },
  {
    id: 'P2_D06',
    phase: 'phase2',
    dayNumber: 6,
    codeLabel: 'Day 6',
    title: 'Day 6: 3D From Point Clouds',
    subtitle: 'LiDAR Representation, PointNet/PointNet++, VoxelNet, PointPillars, CenterPoint & 3D Oriented IoU',
    category: 'Nhận thức 3D & Đám mây Điểm (Point Clouds)',
    defaultStatus: 'half',
    defaultProgress: 50,
    keyIdea:
      'Đám mây điểm LiDAR có tính thưa (Sparse), không có thứ tự (Unordered) và mật độ thay đổi theo khoảng cách; các kiến trúc 3D hiện đại chuyển từ xử lý điểm trực tiếp (PointNet) sang lượng tử hóa thành Voxel/Pillar kết hợp tích chập thưa (Sparse Conv) hoặc chiếu xuống mặt phẳng BEV để đạt tốc độ thời gian thực.',
    formulas: [
      {
        name: 'Bất biến Hoán vị trong PointNet (Symmetric Function)',
        expression: 'f({x_1, x_2, ..., x_n}) ≈ γ ( MAX_{i=1..n} { h(x_i) } )',
        variables: [
          { symbol: '{x_1, ..., x_n}', meaning: 'Tập hợp n điểm 3D không có thứ tự, mỗi điểm x_i = [x, y, z, intensity]' },
          { symbol: 'h : R^d → R^C', meaning: 'Mạng MLP chia sẻ trọng số (Shared MLP / 1×1 Conv) áp dụng độc lập lên từng điểm' },
          { symbol: 'MAX', meaning: 'Hàm đối xứng Channel-wise Max Pooling gom thông tin toàn cục bất kể thứ tự điểm' },
          { symbol: 'γ', meaning: 'Mạng MLP hậu xử lý dự đoán nhãn phân loại hoặc ghép nối để phân vùng điểm' }
        ],
        intuition:
          'Vì đám mây điểm là một tập hợp (set), việc đổi thứ tự lưu trữ điểm thứ i và điểm thứ j không được làm thay đổi kết quả đầu ra. Phép Max Pooling trên từng kênh đảm bảo tính bất biến hoán vị tuyệt đối.'
      },
      {
        name: 'Lượng tử hóa Voxel / Pillar & Tham số Hộp 3D (7-DoF Bounding Box)',
        expression: 'idx_x = ⌊(x - x_{min}) / v_x⌋ ,  idx_y = ⌊(y - y_{min}) / v_y⌋  |  B_{3D} = (x_c, y_c, z_c, l, w, h, ψ)',
        variables: [
          { symbol: 'v_x, v_y, v_z', meaning: 'Kích thước một ô Voxel theo 3 trục (PointPillars đặt v_z = toàn bộ chiều cao Z)' },
          { symbol: '(x_c, y_c, z_c)', meaning: 'Tọa độ tâm hộp 3D trong hệ quy chiếu LiDAR' },
          { symbol: '(l, w, h)', meaning: 'Chiều dài (length), chiều rộng (width), chiều cao (height) của vật thể' },
          { symbol: 'ψ (yaw)', meaning: 'Góc hướng đầu xe quanh trục thẳng đứng Z (thường mã hóa bằng (sin ψ, cos ψ))' }
        ],
        intuition:
          'PointPillars loại bỏ việc chia nhỏ trục Z (tạo các cột thẳng đứng Pillar), nhờ đó tránh hoàn toàn phép tích chập 3D đắt đỏ và chuyển thẳng sang tích chập 2D tốc độ cao trên mặt phẳng BEV.'
      },
      {
        name: '3D Oriented IoU (Giao trên Hợp của Hộp Xoay 3D)',
        expression: 'IoU_{3D} = (Area_{BEV_Intersection}(B_1, B_2) × Overlap_Z(B_1, B_2)) / (Vol(B_1) + Vol(B_2) - Intersection_{3D})',
        variables: [
          { symbol: 'Area_{BEV_Intersection}', meaning: 'Diện tích đa giác giao nhau của 2 hình chữ nhật xoay trên mặt phẳng (x, y) tính bằng thuật toán Sutherland-Hodgman' },
          { symbol: 'Overlap_Z', meaning: 'Đoạn giao nhau 1 chiều theo trục cao độ Z: max(0, min(z1_max, z2_max) - max(z1_min, z2_min))' }
        ],
        intuition:
          'Trong không gian 3D tự hành (giả định mặt đường phẳng chỉ xoay quanh trục Z), phép tính giao của hai hình hộp xoay 3D được tách thành tích của diện tích giao 2D có hướng trên mặt đất (BEV Rotated IoU) nhân với độ chồng lấp chiều cao Z.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Phát hiện 3D Thời gian thực (PointPillars / CenterPoint Pipeline)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Raw Point Cloud (N × 4: x, y, z, r)]                                     │
│        │                                                                   │
│        ▼  (Pillarization / Voxelization)                                   │
│  [Non-Empty Pillars (P × N_pts × 9)] ──▶ [PointNet MLP + MaxPool (P × C)]  │
│        │                                                                   │
│        ▼  (Scatter back to 2D Grid)                                        │
│  [BEV Pseudo-Image (C × H_bev × W_bev)]                                    │
│        │                                                                   │
│        ▼  (2D CNN Backbone + FPN Neck)                                     │
│  [CenterPoint Head: Center Heatmap + Sub-voxel Offset + Size + (sinψ,cosψ)]│
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Pillar Encoding',
          title: 'Tăng cường Đặc trưng Điểm & Gom nhóm Cột',
          tensorSpec: 'Mỗi điểm: [x, y, z, r, x_c, y_c, z_c, x_p, y_p] (9 chiều)',
          description: 'Bổ sung độ lệch của điểm so với trọng tâm các điểm trong cột (x_c, y_c, z_c) và độ lệch so với tâm hình học của cột (x_p, y_p).'
        },
        {
          stage: 'Stage 2: BEV Scatter',
          title: 'Tạo Ảnh Giả (Pseudo-Image) trên Mặt phẳng Chim bay',
          tensorSpec: '[B, 64, H_bev, W_bev] (ví dụ 496 × 432)',
          description: '90–95% các cột trong không gian là trống rỗng; chỉ xử lý P cột có điểm rồi điền ngược về lưới 2D giúp tiết kiệm tính toán tối đa.'
        },
        {
          stage: 'Stage 3: 2D/Sparse Backbone',
          title: 'Mở rộng Trường nhìn Không gian trên Mặt đất',
          tensorSpec: 'Multi-scale BEV Feature Map [B, 384, H/2, W/2]',
          description: 'Trên mặt phẳng BEV, kích thước vật lý của xe hơi là không đổi dù ở gần hay ở xa cảm biến (không bị biến dạng phối cảnh như ảnh camera).'
        },
        {
          stage: 'Stage 4: Center-based 3D Head',
          title: 'Phát hiện Tâm & Hồi quy Định hướng Không cần Anchor xoay',
          tensorSpec: 'Heatmap [B, K_cls, H, W] + Reg [dx, dy, z, log(l,w,h), sinψ, cosψ, vx, vy]',
          description: 'CenterPoint đại diện mỗi vật thể bằng điểm tâm 2D trên BEV, loại bỏ việc phải đặt hàng loạt anchor xoay theo các góc 0°, 45°, 90°.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Vật thể ở xa (50–80m) hoặc người đi bộ chỉ nhận được 3–10 tia LiDAR phản xạ. Để tăng mật độ điểm mà không giảm tốc độ, kỹ thuật chuẩn trong thực tế là ghép nối (concatenate) các đám mây điểm của 5–10 khung hình liên tiếp đã bù Ego-motion kèm theo kênh độ trễ thời gian Δt.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Đặc tính Hình học của Đám mây điểm LiDAR & Phép biến đổi Tọa độ',
        summary: 'Xử lý tính thưa, bất biến hoán vị và chuyển đổi hệ quy chiếu LiDAR – Camera – Ego.',
        bullets: [
          'Tính thưa không đồng đều (Non-uniform Sparsity): LiDAR quét bằng chùm tia phân kỳ theo góc, do đó mật độ điểm giảm tỉ lệ nghịch với bình phương khoảng cách (1/r²).',
          'Không biến dạng phối cảnh (Metric Scale Preservation): Một chiếc xe dài 4.5m ở cách 10m hay 60m đều có chiều dài đúng 4.5m trong không gian 3D, giúp việc học kích thước hộp 3D ổn định hơn nhiều so với 2D.',
          'Submanifold Sparse Convolution (SpConv): Khi dùng Voxel 3D, nếu áp dụng tích chập 3D chuẩn sẽ làm lan truyền đặc trưng sang các ô trống xung quanh (Submanifold Dilation), chỉ sau 3 tầng toàn bộ không gian thành đặc (dense). Submanifold Sparse Conv chỉ tính đầu ra tại đúng các ô voxel ban đầu có điểm.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Mã hóa Góc hướng (Heading/Yaw Encoding) & Khử điểm gián đoạn',
        summary: 'Tại sao không bao giờ hồi quy trực tiếp góc ψ ∈ [-π, π] bằng L1/L2 Loss.',
        bullets: [
          'Hiện tượng Boundary Discontinuity: Góc -179° (-0.99π) và +179° (+0.99π) thực chất chỉ lệch nhau 2°, nhưng nếu tính hiệu trực tiếp |ψ_pred - ψ_gt| sẽ cho sai số khổng lồ gần 2π và kéo đạo hàm đi ngược chiều qua góc 0°.',
          'Giải pháp 1 — Mã hóa lượng giác (sin ψ, cos ψ): Hồi quy 2 giá trị liên tục u = sin(ψ) và v = cos(ψ), khi suy luận khôi phục bằng atan2(u, v). Hàm này liên tục tuần hoàn trên toàn miền.',
          'Giải pháp 2 — Phân loại Chia thùng kết hợp Phần dư (Heading Bin Classification + Residual) hoặc Sin-Error Loss: L_dir = |sin(ψ_pred - ψ_gt)| kết hợp một nhánh phân loại chiều thuận/ngược (Direction Classifier 0/1).'
        ],
        productionTip: 'Kỹ thuật Ground-Truth Copy-Paste Augmentation (GT-Sampling): Cắt đám mây điểm bên trong các hộp 3D của những lớp hiếm (Xe đạp, Người đi bộ, Xe công trình) từ toàn bộ tập train rồi dán vào khung cảnh hiện tại (có kiểm tra va chạm trên BEV), giúp tăng mAP của các lớp ít mẫu lên 8–15%.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Kiến trúc Nhận thức 3D từ Point Cloud',
      headers: ['Kiến trúc', 'Biểu diễn Đầu vào', 'Toán tử Trích xuất Chính', 'Đặc điểm Tốc độ & Độ chính xác'],
      rows: [
        ['PointNet / PointNet++', 'Raw Points (N × 3)', 'Shared MLP + FPS + Ball Query + MaxPool', 'Bảo toàn tọa độ chính xác tuyệt đối nhưng FPS (Farthest Point Sampling) chậm khi N > 50,000'],
        ['VoxelNet / SECOND', '3D Voxels (D × H × W)', '3D Sparse & Submanifold Convolution', 'Độ chính xác 3D rất cao, giữ được cấu trúc phân tầng theo chiều cao Z'],
        ['PointPillars', '2D Vertical Pillars (H × W)', 'PointNet nhỏ trong cột + 2D CNN chuẩn', 'Nhanh nhất (60–100+ Hz trên GPU/TensorRT), không cần thư viện Sparse Conv phức tạp'],
        ['CenterPoint', 'Voxel hoặc Pillar → BEV', 'Keypoint Heatmap Tâm vật thể + Hồi quy thuộc tính', 'Loại bỏ hoàn toàn Anchor xoay 3D, cực kỳ hiệu quả cho cả Detection và Tracking']
      ]
    }
  },
  {
    id: 'P2_D07',
    phase: 'phase2',
    dayNumber: 7,
    codeLabel: 'Day 7',
    title: 'Day 7: Tracking and Forecasting',
    subtitle: 'Multi-Object Tracking (SORT, ByteTrack, AB3DMOT), HOTA/MOTA & Multi-Modal Trajectory Forecasting',
    category: 'Theo vết Đa đối tượng & Dự báo Quỹ đạo',
    defaultStatus: 'completed',
    defaultProgress: 100,
    keyIdea:
      'Tracking gắn kết các phát hiện rời rạc qua thời gian thành quỹ đạo có định danh duy nhất (Track ID) và vận tốc ổn định; Forecasting tiếp nối bằng cách dự đoán phân phối đa kịch bản (Multi-modal Trajectories) của các tác nhân xung quanh trong 3–8 giây tới dựa trên tương tác xã hội và bản đồ làn đường.',
    formulas: [
      {
        name: 'Ma trận Chi phí Ghép cặp (Data Association Cost Matrix)',
        expression: 'C_{i, j} = w_{geom} · (1 - GIoU_{3D}(T_i, D_j)) + w_{motion} · d_M(T_i, D_j) + w_{app} · (1 - cos(f_i, f_j))',
        variables: [
          { symbol: 'T_i, D_j', meaning: 'Quỹ đạo thứ i (đã dự đoán lên bước t) và Phát hiện mới thứ j tại bước t' },
          { symbol: 'GIoU_{3D}(T_i, D_j)', meaning: 'Độ tương đồng hình học không gian (hoặc khoảng cách tâm L2 trên BEV)' },
          { symbol: 'd_M(T_i, D_j)', meaning: 'Khoảng cách xác suất Mahalanobis từ Bộ lọc Kalman' },
          { symbol: 'cos(f_i, f_j)', meaning: 'Độ tương đồng ngoại hình (Re-ID Embedding cosine similarity)' }
        ],
        intuition:
          'Ma trận chi phí C_{i,j} được đưa vào thuật toán Hungarian (Kuhn-Munkres) để tìm phép ghép cặp có tổng chi phí nhỏ nhất trong thời gian đa thức O(N³).'
      },
      {
        name: 'Chỉ số Đánh giá Tracking: MOTA vs HOTA',
        expression: 'MOTA = 1 - ∑_t (FN_t + FP_t + IDSW_t) / ∑_t GT_t   |   HOTA = √(DetA · AssA)',
        variables: [
          { symbol: 'FN_t, FP_t', meaning: 'Số vật thể bỏ sót (False Negative) và báo giả (False Positive) tại frame t' },
          { symbol: 'IDSW_t', meaning: 'Số lần nhảy/đổi nhầm mã định danh (Identity Switches)' },
          { symbol: 'DetA, AssA', meaning: 'Độ chính xác Phát hiện (Detection Accuracy) và Độ chính xác Liên kết dài hạn (Association Accuracy)' }
        ],
        intuition:
          'MOTA cộng tuyến tính FN, FP và IDSW nên bị chi phối nặng bởi chất lượng Detector hơn là chất lượng liên kết quỹ đạo. HOTA lấy trung bình nhân hình học giữa DetA và AssA, đánh giá công bằng cả khả năng tìm đúng vật thể lẫn giữ đúng ID xuyên suốt.'
      },
      {
        name: 'Chỉ số Dự báo Quỹ đạo Đa kịch bản: minADE_K & minFDE_K',
        expression: 'minADE_K = min_{k ∈ 1..K} (1 / T) ∑_{t=1}^T || Ŷ_t^{(k)} - Y_t^{GT} ||_2   |   minFDE_K = min_{k ∈ 1..K} || Ŷ_T^{(k)} - Y_T^{GT} ||_2',
        variables: [
          { symbol: 'K', meaning: 'Số kịch bản quỹ đạo tương lai mà mô hình dự đoán (ví dụ K = 6 khả năng: đi thẳng, rẽ trái, chuyển làn...)' },
          { symbol: 'Ŷ_t^{(k)}', meaning: 'Vị trí 2D (x, y) dự đoán ở bước tương lai t của kịch bản thứ k' },
          { symbol: 'T', meaning: 'Chân trời dự báo (Prediction Horizon, thường T = 30 bước tương ứng 3 giây hoặc 80 bước = 8 giây)' }
        ],
        intuition:
          'Tương lai của giao thông mang tính đa phương thức (Multi-modal): tại ngã tư xe có thể đi thẳng hoặc rẽ phải. Nếu ép mô hình dự đoán 1 quỹ đạo duy nhất bằng MSE Loss, mô hình sẽ dự đoán trung bình cộng của 2 nhánh — đâm thẳng vào dải phân cách giữa đường!'
      }
    ],
    architecture: {
      title: 'Kiến trúc ByteTrack (Two-Stage Association) & VectorNet/HiVT Trajectory Forecasting',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Detections tại frame t]                                                  │
│     ├── (Score ≥ τ_high) ──▶ [Match #1 với Active Tracks (Kalman Pred)]    │
│     └── (τ_low ≤ Score < τ_high) ──▶ [Match #2 với Unmatched Tracks]       │
│                                              │                             │
│                                              ▼                             │
│  [Lịch sử Quỹ đạo 2s (Agent Polyline)] + [Bản đồ Làn đường HD Map Polyline]│
│                                              │                             │
│                                              ▼                             │
│  [Agent-Agent Social Interaction + Agent-Lane Cross-Attention]             │
│                                              │                             │
│                                              ▼                             │
│  [Multi-Modal Decoder: K=6 Quỹ đạo {(x_t, y_t, σ_x, σ_y)}_k + Xác suất p_k]│
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: ByteTrack Association',
          title: 'Tận dụng Box Điểm thấp khi Bị che khuất',
          tensorSpec: 'Match 1 (High-score boxes) → Match 2 (Low-score boxes)',
          description: 'Khi một người đi bộ bị che khuất một nửa, điểm tự tin của Detector giảm từ 0.8 xuống 0.3. Thay vì vứt bỏ mọi box < 0.5, ByteTrack dùng các box điểm thấp này để ghép riêng với những Track đang có sẵn nhưng chưa tìm thấy cặp ở bước 1.'
        },
        {
          stage: 'Stage 2: Track Lifecycle',
          title: 'Quản lý Vòng đời Quỹ đạo (Birth / Active / Coasting / Death)',
          tensorSpec: 'N_init = 3 frames xác nhận, Max_Age = 30 frames nhớ tạm',
          description: 'Tránh tạo Track ảo từ 1 frame nhiễu (cần xuất hiện liên tiếp N_init lần) và không xóa ngay Track khi mất dấu tạm thời (cho phép dự đoán quán tính tối đa Max_Age bước).'
        },
        {
          stage: 'Stage 3: Vectorized Scene Graph',
          title: 'Mã hóa Đồ thị Vector (VectorNet / LaneGCN)',
          tensorSpec: 'Agent History [N_a, T_h, D] + Map Lanes [N_m, L, D]',
          description: 'Biểu diễn quỹ đạo lịch sử và tâm làn đường dưới dạng chuỗi các đoạn vector có hướng thay vì vẽ ra ảnh Raster (giúp tiết kiệm tính toán và giữ độ chính xác tọa độ).'
        },
        {
          stage: 'Stage 4: Winner-Takes-All Loss',
          title: 'Huấn luyện Đa Kịch bản không Sụp đổ Mode',
          tensorSpec: 'L = L_cls(p, k*) + L_reg(Ŷ^{(k*)}, Y^{GT}) với k* là nhánh gần GT nhất',
          description: 'Chỉ tính đạo hàm hồi quy tọa độ cho đúng 1 nhánh dự đoán k* có khoảng cách tới quỹ đạo thật nhỏ nhất (Winner-Takes-All), giúp K nhánh tự phân화 thành K ý định lái xe khác nhau.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Sự lan truyền lỗi (Cascaded Error) từ Tracking sang Forecasting — nếu một chiếc xe bị nhảy ID (ID Switch) hoặc ước lượng vận tốc Kalman bị giật do hộp 3D nhấp nháy kích thước, vector vận tốc đầu vào của mô hình Forecasting sẽ sai lệch nghiêm trọng, dẫn đến dự báo quỹ đạo văng khỏi làn đường.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Tracking-by-Detection (SORT, DeepSORT, ByteTrack, AB3DMOT) vs End-to-End Tracking',
        summary: 'Cách liên kết đối tượng qua thời gian trong không gian 2D và 3D.',
        bullets: [
          'SORT & AB3DMOT: Kết hợp dự đoán Kalman Filter và ghép cặp Hungarian bằng IoU (2D hoặc 3D) / khoảng cách tâm Mahalanobis. Trong không gian 3D (AB3DMOT), các vật thể không chồng lấp chiều sâu như trên ảnh 2D nên chỉ cần Kalman 3D + 3D IoU đã đạt tốc độ cực cao.',
          'DeepSORT: Bổ sung mạng CNN trích xuất vector đặc trưng ngoại hình (Appearance Re-ID feature) kết hợp Matching Cascade (ưu tiên các track vừa mới xuất hiện ở frame liền trước) để giảm mạnh ID Switch sau khi khuất bóng.',
          'Query-based End-to-End Tracking (TrackFormer, MOTR, MUTR3D): Duy trì tập "Track Queries" truyền từ frame t-1 sang frame t cùng với "Newborn Object Queries" mới, tự học cả phát hiện và liên kết bằng Attention.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Dự báo Quỹ đạo (Motion Forecasting): Tương tác Xã hội & Ràng buộc Bản đồ',
        summary: 'Dự đoán chuyển động tương lai dựa trên ý định, vật lý và hình học đường giao thông.',
        bullets: [
          'Target-Centric Normalization: Luôn dịch gốc tọa độ về vị trí hiện tại (t=0) của chính tác nhân cần dự báo và xoay trục X trùng với hướng di chuyển hiện tại của tác nhân đó. Điều này giúp mô hình bất biến với vị trí/hướng tuyệt đối trên bản đồ.',
          'Biểu diễn đầu ra xác suất (Gaussian Mixture Model — GMM): Tại mỗi bước tương lai t của kịch bản k, dự đoán phân phối Gaussian hai biến N(μ_x, μ_y, σ_x, σ_y, ρ) và huấn luyện bằng Negative Log-Likelihood (NLL) để định lượng độ bất định tăng dần theo thời gian.',
          'Kinematic Feasibility: Đảm bảo quỹ đạo dự đoán không vi phạm giới hạn vật lý của phương tiện (bán kính vòng quay tối thiểu của mô hình xe đạp Bicycle Model, gia tốc dọc và gia tốc hướng tâm tối đa).'
        ],
        productionTip: 'Khi đánh giá Forecasting, ngoài minADE/minFDE bắt buộc phải theo dõi chỉ số Miss Rate (MR — tỷ lệ phần trăm trường hợp không có bất kỳ kịch bản nào trong K kịch bản nằm trong bán kính 2.0m so với vị trí thật ở giây thứ T) và Off-Road Rate (tỷ lệ quỹ đạo dự đoán lao lên vỉa hè).'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Phương pháp Theo vết (MOT) và Dự báo Quỹ đạo (Forecasting)',
      headers: ['Thuật toán', 'Bài toán', 'Tín hiệu Liên kết / Biểu diễn', 'Điểm mạnh Cốt lõi'],
      rows: [
        ['ByteTrack', '2D/3D Multi-Object Tracking', 'Ghép cặp 2 bước (High-score rồi Low-score boxes)', 'Khôi phục xuất sắc các vật thể bị che khuất có điểm confidence thấp'],
        ['AB3DMOT / SimpleTrack', '3D LiDAR Tracking', '3D Kalman Filter + 3D GIoU / Khoảng cách BEV', 'Siêu nhẹ (chạy trên CPU < 2ms), không cần học sâu cho bước ghép cặp'],
        ['VectorNet / HiVT', 'Motion Forecasting', 'Đồ thị Polyline cục bộ + Phân cấp Tương tác', 'Tốc độ suy luận nhanh cho hàng chục phương tiện cùng lúc, độ chính xác cao'],
        ['Wayformer / QCNet', 'Query-based Forecasting', 'Anchor-free / Anchor-based Mode Queries + Detr-style', 'Dự báo quỹ đạo dài hạn (6–8 giây) mượt mà với khả năng bám làn đường chuẩn xác']
      ]
    }
  },
  {
    id: 'P2_D08',
    phase: 'phase2',
    dayNumber: 8,
    codeLabel: 'Day 8',
    title: 'Day 8: BEV & Sensor Fusion',
    subtitle: 'Camera-to-BEV (Lift-Splat-Shoot, BEVFormer), LiDAR-Camera-Radar BEVFusion & Calibration',
    category: 'Không gian Chim bay (BEV) & Hợp nhất Đa cảm biến',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Mặt phẳng Chim bay (Bird’s-Eye-View — BEV) là không gian quy chiếu thống nhất lý tưởng để hợp nhất thông tin ngữ nghĩa giàu màu sắc từ nhiều Camera xung quanh (2D Perspective) với độ chính xác hình học 3D của LiDAR và vận tốc xuyên tâm của Radar, đồng thời kết nối trực tiếp với tầng Quy hoạch chuyển động (Planning).',
    formulas: [
      {
        name: 'Phép Chiếu Phối cảnh Camera 3D → 2D & Nâng Ngược 2D → 3D (Lift-Splat-Shoot)',
        expression: 'z_c · [u, v, 1]^T = K · (R_{c←e} · P_{ego} + t_{c←e})   |   f_{3D}(u, v, d) = α_d(u, v) · f_{2D}(u, v)',
        variables: [
          { symbol: 'K ∈ R^{3×3}', meaning: 'Ma trận nội tham số Camera (Focal length f_x, f_y và tâm quang học c_x, c_y)' },
          { symbol: '[R_{c←e} | t_{c←e}] ∈ SE(3)', meaning: 'Ma trận ngoại tham số (Extrinsics) chuyển từ hệ tọa độ xe sang hệ tọa độ Camera' },
          { symbol: 'α_d(u, v)', meaning: 'Phân phối xác suất độ sâu rời rạc tại pixel (u, v) trên D mốc khoảng cách (Softmax theo trục D)' },
          { symbol: 'f_{3D}(u, v, d)', meaning: 'Tích ngoài (Outer product) nâng vector đặc trưng 2D thành đám mây đặc trưng hình chóp cụt (Frustum)' }
        ],
        intuition:
          'Từ 3D chiếu xuống ảnh 2D là ánh xạ duy nhất, nhưng từ 1 pixel (u, v) nâng ngược lên 3D là bài toán suy biến (vì thiếu độ sâu z_c). LSS giải quyết bằng cách dự đoán phân phối xác suất độ sâu α_d trên từng tia nhìn rồi cộng dồn (Splat/Voxel Pooling) xuống ô lưới BEV.'
      },
      {
        name: 'Spatial Cross-Attention trong BEVFormer (Truy vấn từ 3D chiếu xuống 2D)',
        expression: 'SCA(Q_p, F_t) = (1 / |V_{hit}|) ∑_{i ∈ V_{hit}} ∑_{j=1}^{N_{ref}} DeformAttn(Q_p, P(p, i, j), F_t^i)',
        variables: [
          { symbol: 'Q_p', meaning: 'Truy vấn học được (BEV Query) tại ô lưới p = (x, y) trên mặt phẳng BEV' },
          { symbol: 'P(p, i, j)', meaning: 'Phép chiếu điểm 3D (x, y, z_j) ở độ cao trụ thứ j lên mặt phẳng ảnh của camera thứ i' },
          { symbol: 'V_{hit}', meaning: 'Tập các camera có vùng nhìn chứa điểm chiếu P(p, i, j)' }
        ],
        intuition:
          'Thay vì đoán độ sâu từ ảnh 2D đẩy lên 3D (Bottom-Up dễ sai lệch khi ước lượng độ sâu sai), BEVFormer làm theo chiều Top-Down: khởi tạo sẵn lưới BEV 3D, chiếu các điểm 3D đó xuống các camera xung quanh thông qua ma trận K, R, t rồi dùng Deformable Attention kéo đặc trưng ảnh lên.'
      },
      {
        name: 'Hợp nhất Đa phương thức trên Không gian BEV (BEVFusion)',
        expression: 'F_{BEV}^{fused} = Conv_{3×3} ( Concat( F_{BEV}^{Camera}, F_{BEV}^{LiDAR}, F_{BEV}^{Radar} ) )',
        variables: [
          { symbol: 'F_{BEV}^{Camera}', meaning: 'Đặc trưng BEV từ 6–8 camera bao quanh (giàu ngữ nghĩa màu sắc, vạch kẻ đường, đèn tín hiệu)' },
          { symbol: 'F_{BEV}^{LiDAR}', meaning: 'Đặc trưng BEV từ PointPillars/VoxelNet (chính xác khoảng cách và hình dáng 3D)' },
          { symbol: 'F_{BEV}^{Radar}', meaning: 'Đặc trưng BEV từ sóng milimet 4D Radar (hoạt động xuyên mưa/sương mù và đo trực tiếp vận tốc v_r)' }
        ],
        intuition:
          'Nếu ép điểm LiDAR chiếu lên ảnh Camera (Point-level Fusion), 90% thông tin ngữ nghĩa của các pixel không có tia LiDAR chiếu trúng sẽ bị vứt bỏ. Ngược lại, đưa cả hai về chung lưới BEV bảo toàn trọn vẹn cả mật độ ngữ nghĩa của Camera lẫn cấu trúc hình học của LiDAR.'
      }
    ],
    architecture: {
      title: 'Kiến trúc BEVFusion (Multi-Camera + LiDAR + Temporal BEV Memory)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [6× Surround Cameras] ──▶ [Image Backbone] ──▶ [View Transform: LSS / SCA]│
│                                                            │               │
│                                                            ▼               │
│                                                   [Camera BEV Feature]     │
│                                                            │               │
│  [LiDAR Point Cloud] ────▶ [Voxel/Pillar Enc] ──▶ [LiDAR BEV Feature]      │
│                                                            │               │
│                                                            ▼               │
│                                             [Unified BEV Fusion Encoder]   │
│                                                    ├──▶ [3D Object Det]    │
│                                                    └──▶ [BEV Map Seg]      │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Camera Stream',
          title: 'Trích xuất Đặc trưng Đa Camera & Dự đoán Độ sâu',
          tensorSpec: '[B, 6, 3, H, W] → Frustum [B, 6, C, D, H/16, W/16]',
          description: 'BEVDepth sử dụng điểm LiDAR chiếu lên ảnh làm nhãn độ sâu thật (Explicit Depth Supervision) khi huấn luyện để giúp mạng dự đoán phân phối độ sâu α_d sắc nét hơn.'
        },
        {
          stage: 'Stage 2: BEV Pooling',
          title: 'Tích hợp Cột Hình chóp cụt xuống Lưới Mặt đất',
          tensorSpec: 'CUDA Precomputed Prefix-Sum Pooling → [B, C_cam, H_bev, W_bev]',
          description: 'Vì cấu trúc hình học của camera gắn trên xe là cố định, chỉ số ô lưới BEV của mỗi điểm frustum có thể tính trước (Precomputation), giúp tăng tốc bước BEV Pooling lên gấp 40 lần.'
        },
        {
          stage: 'Stage 3: Modality Alignment',
          title: 'Trộn Đặc trưng LiDAR + Camera + Radar trên cùng Lưới',
          tensorSpec: '[B, C_cam + C_lidar, H_bev, W_bev] → [B, 256, H_bev, W_bev]',
          description: 'Sử dụng khối tích chập bù lệch không gian để khắc phục sai số hiệu chuẩn (Calibration Extrinsic Drift) nhỏ giữa Camera và LiDAR khi xe rung lắc.'
        },
        {
          stage: 'Stage 4: Multi-Task BEV Heads',
          title: 'Đầu ra Thống nhất cho 3D Detection, HD Map & Occupancy',
          tensorSpec: '3D Boxes + Drivable Area + Lane Divider + Pedestrian Crossing',
          description: 'Từ một bản đồ đặc trưng BEV duy nhất, hệ thống giải quyết đồng thời phát hiện vật thể 3D và phân vùng bản đồ làn đường vector hóa.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Độ nhạy với sai số hiệu chuẩn ngoại tham số (Extrinsic Calibration Pitch/Roll Error). Chỉ cần giá đỡ camera bị lệch góc chúc/ngẩng (Pitch) 0.5 độ do va ổ gà, phép chiếu điểm ở khoảng cách 60 mét sẽ lệch tới hơn 5 mét trên mặt phẳng BEV!'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Phân loại Early Fusion, Middle (Feature/BEV) Fusion và Late Fusion',
        summary: 'Tại sao ngành công nghiệp xe tự hành chuyển dịch từ Late Fusion sang BEV Middle Fusion.',
        bullets: [
          'Late Fusion (Object-level Fusion): Mỗi cảm biến (Camera, LiDAR, Radar) tự chạy bộ phát hiện độc lập rồi hợp nhất danh sách hộp bằng Kalman Filter. Ưu điểm: mô-đun hóa, một cảm biến hỏng hệ thống vẫn chạy (Graceful Degradation). Nhược điểm: mất hoàn toàn thông tin mức thấp (một vật thể hơi mờ trên cả Camera và LiDAR đều bị lọc bỏ trước khi kịp gặp nhau).',
          'Early / Point-Painting Fusion: Tô màu điểm LiDAR bằng nhãn ngữ nghĩa 2D từ Camera trước khi đưa vào mạng 3D. Bị giới hạn bởi độ thưa của LiDAR và hiện tượng nhòe viền (boundary bleeding) khi chiếu.',
          'BEV Middle Fusion (BEVFusion, TransFusion): Chuyển mọi cảm biến về chung không gian biểu diễn BEV rồi mới hợp nhất đặc trưng sâu, cho phép mạng tận dụng đồng thời cả tín hiệu yếu của từng cảm biến.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. 3D Occupancy Networks — Bước tiến vượt qua giới hạn Hộp 3D',
        summary: 'Xử lý các vật thể có hình dạng bất kỳ (Open-set Obstacles) không nằmใน tập nhãn huấn luyện.',
        bullets: [
          'Hạn chế của 3D Bounding Box: Hộp hình chữ nhật không thể biểu diễn chính xác xe cần cẩu đang vươn tay nâng, xe chở hàng cồngkềnh, tảng đá rơi hay rào chắn biến dạng.',
          '3D Semantic Occupancy (OccNet, SurroundOcc, TPVFormer): Chia không gian 3D quanh xe thành lưới Voxel mịn (ví dụ 200×200×16 ô, mỗi ô 0.5m) và dự đoán xác suất từng ô bị chiếm chỗ (Occupied vs Free) kèm nhãn ngữ nghĩa và vector vận tốc (Occupancy Flow).',
          'Đảm bảo an toàn tuyệt đối cho tầng Planning: Dù mô hình không nhận diện được tên gọi của một chướng ngại vật lạ trên đường, chỉ cần ô Voxel đó có trạng thái Occupied = 1 là xe tự hành sẽ tự động phanh hoặc đánh lái tránh.'
        ],
        productionTip: 'Khi huấn luyện BEVFusion, bắt buộc phải áp dụng kỹ thuật Modality Dropout (ngắt ngẫu nhiên nhánh Camera hoặc nhánh LiDAR với xác suất 15–20% trong lúc train) để tránh việc mạng phụ thuộc hoàn toàn vào LiDAR và bị sập khi một cảm biến bị che bẩn.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Phương pháp Biến đổi Không gian Camera-to-BEV & Sensor Fusion',
      headers: ['Phương pháp', 'Cơ chế Biến đổi 2D → BEV', 'Phụ thuộc Ước lượng Độ sâu', 'Đặc điểm Triển khai Thực tế'],
      rows: [
        ['IPM (Inverse Perspective Mapping)', 'Phép chiếu đồng phẳng Homography (Giả định Z = 0)', 'Không', 'Cực nhanh cho vạch kẻ đường phẳng, nhưng làm kéo giãn biến dạng mọi vật thể có chiều cao > 0'],
        ['Lift-Splat-Shoot (LSS) / BEVDet', 'Dự đoán phân phối độ sâu α_d (Bottom-Up Push)', 'Phụ thuộc trực tiếp vào chất lượng Depth Net', 'Nhanh nhờ CUDA BEV Pooling, rất mạnh khi được giám sát độ sâu từ LiDAR (BEVDepth)'],
        ['BEVFormer', 'BEV Queries + Deformable Cross-Attention (Top-Down Pull)', 'Học ẩn qua Attention tại nhiều cao độ Z', 'Biểu diễn ngữ cảnh dày đặc tốt hơn LSS cho cả 3D Box lẫn phân vùng làn đường HD Map'],
        ['BEVFusion', 'LSS Camera BEV + Voxel LiDAR BEV Concat', 'Bù trừ lẫn nhau giữa 2 nhánh', 'Độ chính xác SOTA trên nuScenes, bền vững trong cả điều kiện đêm tối và mưa sương']
      ]
    }
  },
  {
    id: 'P2_D09',
    phase: 'phase2',
    dayNumber: 9,
    codeLabel: 'Day 9',
    title: 'Day 9: Data & Annotation Pipeline',
    subtitle: 'Data-Centric AI, 4D Auto-Labeling, Active Learning, Corner Case Mining & QA/QC Metrics',
    category: 'Kỹ thuật Dữ liệu & Chuỗi Gán nhãn Tự động',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Trong các hệ thống AI công nghiệp, kiến trúc mô hình chỉ quyết định 20% thành công còn 80% nằm ở Data Engine: thu thập đúng tình huống hiếm (Long-tail Corner Cases), tự động gán nhãn 4D ngoại tuyến bằng mô hình lớn sử dụng cả thông tin tương lai (Non-causal Offline Perception) và kiểm định chất lượng nhãn nghiêm ngặt.',
    formulas: [
      {
        name: 'Hàm Thu thập Active Learning (Entropy & Đội hình Bất đồng — Ensemble Disagreement)',
        expression: 'H(y | x) = - ∑_{c=1}^C p(y=c | x) log p(y=c | x)   |   BALD(x) = H(E_θ[p(y|x, θ)]) - E_θ[H(p(y|x, θ))]',
        variables: [
          { symbol: 'H(y | x)', meaning: 'Độ bất định Shannon Entropy của dự đoán tại mẫu x' },
          { symbol: 'BALD(x)', meaning: 'Thông tin tương hỗ (Mutual Information) đo độ bất đồng ý kiến giữa M mô hình trong một Ensemble' }
        ],
        intuition:
          'Thay vì gửi ngẫu nhiên 1 triệu khung hình đường vắng đi gán nhãn tốn kém, Active Learning tính điểm bất định và độ bất đồng giữa các mô hình để chỉ lọc ra 1% khung hình khó nhất (trời mưa đêm, công trường, vật thể lạ) đưa vào luồng gán nhãn.'
      },
      {
        name: 'Độ Đồng thuận Giữa những Người gán nhãn (Cohen’s Kappa & 3D Label Consistency)',
        expression: 'κ = (p_o - p_e) / (1 - p_e)   |   e_{velocity}(t) = || (p_{t+1} - p_{t-1}) / (2Δt) - v_t^{box} ||_2',
        variables: [
          { symbol: 'p_o', meaning: 'Tỷ lệ đồng thuận thực tế quan sát được giữa 2 nhóm gán nhãn độc lập trên tập Golden Set' },
          { symbol: 'p_e', meaning: 'Xác suất đồng thuận ngẫu nhiên theo phân phối tần suất nhãn' },
          { symbol: 'e_{velocity}(t)', meaning: 'Sai số nhất quán động học giữa đạo hàm vị trí hộp qua thời gian và vận tốc gán nhãn' }
        ],
        intuition:
          'Nếu gán nhãn từng khung hình độc lập, kích thước (l, w, h) của cùng một chiếc xe sẽ bị người gán nhãn vẽ lệch nhau 10–20cm giữa frame t và frame t+1, tạo ra gia tốc ảo khổng lồ làm hỏng mô hình Tracking/Forecasting.'
      }
    ],
    architecture: {
      title: 'Vòng lặp Data Engine & Hệ thống Gán nhãn Tự động 4D Ngoại tuyến (4D Auto-Labeling)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Đội xe Thu thập / Triggered Shadow Mode Logs]                            │
│        │                                                                   │
│        ▼  (Active Learning + VLM/Embedding Mining)                         │
│  [Tập Tình huống Hiếm (Corner Cases / Hard Examples)]                      │
│        │                                                                   │
│        ▼  (4D Offline Reconstruction: Ghép toàn bộ chuỗi quá khứ + tương lai)│
│  [Foundation Model / Heavy Offline Detector + Multi-Pass Smoothing]        │
│        │                                                                   │
│        ▼  (Auto-QC Rule Check + Human-in-the-Loop Audit cho nhãn độ tin cậy thấp)│
│  [Golden Versioned Dataset] ──▶ [Huấn luyện Mô hình Nhẹ Thời gian thực]    │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Fleet Triggering',
          title: 'Khai phá Dữ liệu Thông minh tại Biên (Edge Triggers)',
          tensorSpec: 'Trigger khi: Phanh gấp | Disengagement | Camera-LiDAR bất đồng',
          description: 'Không lưu toàn bộ video thô; xe chỉ đóng gói 15 giây dữ liệu quanh thời điểm phát hiện bất thường hoặc khi dự đoán của mô hình khác biệt với hành vi người lái (Shadow Mode).'
        },
        {
          stage: 'Stage 2: 4D Reconstruction',
          title: 'Tích hợp Đa Lát cắt Thời gian (Non-Causal Offline Fusion)',
          tensorSpec: 'Ghép 100 frames LiDAR (t - 5s đến t + 5s) bằng SLAM/ICP',
          description: 'Khi chạy trên xe (Online), mô hình chỉ được nhìn quá khứ; nhưng khi gán nhãn trên Server (Offline), bộ Auto-labeler được phép nhìn cả tương lai khi chiếc xe đó đã tiến lại gần để suy ngược lại hộp 3D chính xác ở khoảng cách 100m.'
        },
        {
          stage: 'Stage 3: Track Optimization',
          title: 'Cố định Kích thước Vật lý & Làm mượt Quỹ đạo Toàn cục',
          tensorSpec: 'Một Track ID = 1 bộ kích thước cứng (l, w, h) duy nhất',
          description: 'Giải bài toán tối ưu đồ thị toàn cục (Factor Graph Optimization) trên toàn bộ quỹ đạo của đối tượng để khử nhiễu vị trí và góc hướng.'
        },
        {
          stage: 'Stage 4: Automated QA/QC',
          title: 'Kiểm định Tự động bằng Luật Vật lý & Tập Chuẩn (Golden Set)',
          tensorSpec: 'Phát hiện hộp lơ lửng (Floating Box), hộp xuyên mặt đường, hộp chồng lấn',
          description: 'Tự động bác bỏ các lô nhãn vi phạm hình học 3D (ví dụ đáy xe cách mặt đất > 15cm hoặc hai ô tô giao nhau với 3D IoU > 0.05).'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Gán nhãn thủ công 1 khung cảnh 3D LiDAR + 6 Camera mất từ 15 đến 30 phút của con người. Chuyển sang 4D Auto-labeling (máy gán nhãn 90%, người chỉ duyệt và sửa 10% ca khó) giúp tăng thông lượng lên gấp 50 lần và nhất quán hơn theo thời gian.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Tại sao Gán nhãn 4D (Không gian 3D + Thời gian) Vượt trội hơn Gán nhãn 3D Từng Frame?',
        summary: 'Tận dụng thông tin tương lai (Hindsight) và ràng buộc vật thể cứng (Rigid-body Constraint).',
        bullets: [
          'Ở khoảng cách 80 mét, một chiếc xe chỉ có 5 điểm LiDAR — con người nhìn frame đơn lẻ không thể biết chính xác chiều dài của xe. Nhưng 3 giây sau chiếc xe đó đi ngang qua cảm biến với 2,000 điểm LiDAR rõ nét.',
          'Hệ thống 4D Auto-labeling gom toàn bộ điểm của đối tượng qua suốt thời gian xuất hiện để dựng mô hình 3D hoàn chỉnh của chiếc xe đó, sau đó đặt ngược lại hộp chuẩn xác vào cả những frame ở xa 80–120 mét.',
          'Loại bỏ hoàn toàn hiện tượng "Size Jitter" (chiều dài xe co giãn giữa các frame) và cung cấp nhãn vận tốc/gia tốc thật cực kỳ mượt mà để huấn luyện mô hình Tracking & Forecasting.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Xử lý Phân phối Đuôi dài (Long-Tail Distribution) & Khai phá bằng Embedding',
        summary: 'Cách tìm kiếm các kịch bản hiếm trong hàng triệu giờ dữ liệu chưa gán nhãn.',
        bullets: [
          'Text-to-Scene Retrieval bằng CLIP/VLM: Nhúng toàn bộ khung hình kho dữ liệu vào Vector Database để kỹ sư có thể tìm kiếm trực tiếp bằng câu truy vấn tự nhiên như "xe cứu thương bật đèn đi ngược chiều trong mưa" hoặc "người đi xe lăn qua vạch sang đường".',
          'Hard Negative Mining: Tự động thu thập các vùng nền mà mô hình hiện tại nhận nhầm thành vật thể với độ tự tin cao (False Positives) để đưa vào tập huấn luyện vòng tiếp theo.',
          'Data Versioning & Lineage (DVC / LakeFS / Iceberg): Mọi phiên bản mô hình đưa lên Production phải truy vết được chính xác nó được huấn luyện trên phiên bản tập dữ liệu nào và bộ quy tắc gán nhãn (Ontology Spec) nào.'
        ],
        productionTip: 'Khi thay đổi quy ước gán nhãn (ví dụ: có tính gương chiếu hậu vào chiều rộng hộp 3D của ô tô hay không), tuyệt đối không được trộn lẫn dữ liệu theo quy ước cũ và mới mà không chạy bước chuẩn hóa lại, nếu không mAP ở ngưỡng IoU 0.7 sẽ sụt giảm thảm hại.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Phương pháp Xây dựng Tập Dữ liệu Nhận thức (Annotation Strategies)',
      headers: ['Phương pháp', 'Tốc độ & Chi phí', 'Độ Nhất quán Thời gian', 'Chất lượng ở Khoảng cách Xa (>60m)'],
      rows: [
        ['Thủ công từng Frame 3D', 'Rất chậm & đắt đỏ ($3–$8 / frame)', 'Thấp (kích thước và góc hướng dễ bị rung)', 'Kém vì người gán nhãn không nhìn rõ vài điểm thưa'],
        ['Thủ công theo Chuỗi (Track-level)', 'Trung bình (dùng nội suy tuyến tính)', 'Khá (nhưng vẫn sai khi xe chuyển hướng)', 'Trung bình'],
        ['Teacher-Student Pseudo-Label', 'Rất nhanh (chạy mô hình đơn frame lớn)', 'Trung bình (cần hậu xử lý Kalman)', 'Khá nhưng bị giới hạn bởi thông tin tại thời điểm t'],
        ['4D Offline Auto-Labeling + HITL', 'Nhanh gấp 50× & chi phí tối ưu', 'Rất cao (tối ưu đồ thị toàn cục + kích thước cứng)', 'Xuất sắc nhờ nhìn trước tương lai (Non-causal Hindsight)']
      ]
    }
  },
  {
    id: 'P2_D10',
    phase: 'phase2',
    dayNumber: 10,
    codeLabel: 'Day 10',
    title: 'Day 10: Vision - Language Model & VLA',
    subtitle: 'CLIP Contrastive Learning, Multimodal LLM (LLaVA), Vision-Language-Action (RT-2, OpenVLA) & End-to-End Driving',
    category: 'Mô hình Thị giác - Ngôn ngữ - Hành động (VLM & VLA)',
    defaultStatus: 'completed',
    defaultProgress: 100,
    keyIdea:
      'Vision-Language Models (VLM) căn chỉnh biểu diễn thị giác với không gian ngữ nghĩa ngôn ngữ tự nhiên để mang lại khả năng suy luận mở (Open-Vocabulary & Commonsense Reasoning); Vision-Language-Action (VLA) tiến thêm một bước bằng cách mã hóa trực tiếp hành động điều khiển hoặc quỹ đạo thành chuỗi token, khép kín vòng lặp từ cảm biến đến hành động.',
    formulas: [
      {
        name: 'Hàm Loss Tương phản Đối xứng InfoNCE (CLIP Contrastive Learning)',
        expression: 'L_{I→T} = - (1 / N) ∑_{i=1}^N log [ exp(sim(v_i, t_i) / τ) / ∑_{j=1}^N exp(sim(v_i, t_j) / τ) ]',
        variables: [
          { symbol: 'v_i, t_i', meaning: 'Vector nhúng đã chuẩn hóa L2 của ảnh thứ i và mô tả văn bản tương ứng thứ i' },
          { symbol: 'sim(v, t) = v^T t', meaning: 'Độ tương đồng Cosine giữa vector ảnh và vector văn bản' },
          { symbol: 'τ', meaning: 'Tham số nhiệt độ (learnable temperature) điều chỉnh độ sắc nét của phân phối Softmax' },
          { symbol: 'N', meaning: 'Kích thước Batch rất lớn (ví dụ N = 32,768 cặp ảnh–văn bản để có đủ mẫu âm chất lượng)' }
        ],
        intuition:
          'Kéo các cặp (ảnh, mô tả đúng) trên đường chéo chính lại gần nhau và đẩy toàn bộ N² - N cặp ghép chéo ra xa trên mặt cầu đơn vị, giúp mô hình nhận diện bất kỳ khái niệm mới nào bằng văn bản (Zero-shot Transfer) mà không cần cố định danh sách lớp.'
      },
      {
        name: 'Rời rạc hóa Hành động (Action Tokenization trong RT-2 / OpenVLA)',
        expression: 'b_d = ⌊ ((a_d - a_{d,min}) / (a_{d,max} - a_{d,min})) × (B - 1) ⌋ ∈ {0, 1, ..., B - 1}   (với B = 256 bins)',
        variables: [
          { symbol: 'a_d ∈ R', meaning: 'Giá trị hành động liên tục chiều thứ d (ví dụ Δx, Δy, Δz, Δroll, Δpitch, Δyaw, gripper hoặc điểm quỹ đạo)' },
          { symbol: 'b_d', meaning: 'Mã token rời rạc được ánh xạ vào 256 token trong từ điển của LLM' },
          { symbol: 'p(a_{1:T} | I_t, L_cmd)', meaning: 'Xác suất sinh chuỗi hành động tự hồi quy hoặc qua đầu Diffusion / Flow Matching' }
        ],
        intuition:
          'Bằng cách lượng tử hóa mỗi chiều điều khiển liên tục thành 256 mức rời rạc, bài toán điều khiển robot / phương tiện được chuyển thành bài toán dự đoán token tiếp theo trên cùng một kiến trúc Transformer duy nhất.'
      },
      {
        name: 'Hợp nhất Đa phương thức qua Bộ kết nối (Vision-to-LLM Projector / Q-Former)',
        expression: 'Z_v = W_{proj} · Encoder_{ViT}(I) ∈ R^{M × d_{LLM}}   |   H = LLM( Concat(Z_v, Embed(T_{prompt})) )',
        variables: [
          { symbol: 'Encoder_{ViT}(I)', meaning: 'Chuỗi đặc trưng patch thị giác từ bộ mã hóa ảnh (CLIP-ViT hoặc SigLIP)' },
          { symbol: 'W_{proj} / Perceiver', meaning: 'Bộ chiếu MLP hoặc bộ nén Cross-Attention (Q-Former) giảm số lượng token ảnh M để giảm độ trễ' },
          { symbol: 'd_{LLM}', meaning: 'Số chiều không gian ẩn của mô hình ngôn ngữ lớn' }
        ],
        intuition:
          'Chi phí suy luận của LLM phụ thuộc vào tổng số token đầu vào. Nếu đưa 4 khung hình độ phân giải cao (mỗi khung 1024 token ảnh) thẳng vào LLM sẽ làm chậm hệ thống; dùng Q-Former hoặc Pixel Shuffle nén xuống 64–128 token mỗi ảnh giúp chạy thời gian thực.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Vision-Language-Action (VLA) & Hệ thống Tự hành Dual-System (System 1 + System 2)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Multi-Camera / BEV Features] ──▶ [Visual Token Compressor (Q-Former)]    │
│                                                  │                         │
│  [Navigation Goal / Driving Prompt] ─────────────┼──▶ [VLM / VLA Backbone] │
│                                                  │         │               │
│        ┌─────────────────────────────────────────┘         │               │
│        ▼ (System 2: Tần số thấp 2–5Hz)                     ▼ (System 1: 20Hz)│
│  [Scene Reasoning / Meta-Action (Nhường đường, Rẽ)] ──▶ [Trajectory Head]  │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Vision Encoding',
          title: 'Mã hóa Thị giác Mở (SigLIP / DINOv2 / BEV Tokens)',
          tensorSpec: '2D Patches + 3D Position Embedding → Visual Tokens',
          description: 'Kết hợp bộ mã hóa ngữ nghĩa toàn cục (CLIP/SigLIP) với đặc trưng hình học 3D để mô hình vừa hiểu biển báo chữ viết vừa biết chính xác khoảng cách mét.'
        },
        {
          stage: 'Stage 2: Token Compression',
          title: 'Nén Token Thị giác (Q-Former / Spatial Pooling)',
          tensorSpec: 'Từ 2304 patches nén xuống 128–256 Query Tokens',
          description: 'Giữ lại các token chứa thông tin quan trọng cho việc điều khiển (đèn giao thông, người chỉ đường, biển báo tạm) để giữ độ trễ TTFT dưới 100ms.'
        },
        {
          stage: 'Stage 3: System 2 (VLM Slow)',
          title: 'Suy luận Ngữ cảnh Phức tạp & Giải thích Quyết định',
          tensorSpec: 'Chain-of-Thought: Nhận diện cảnh → Dự đoán rủi ro → Quyết định chiến lược',
          description: 'Xử lý các tình huống đuôi dài (Long-tail): ví dụ cảnh sát giao thông vẫy tay cho phép đi qua đèn đỏ, hoặc biển báo công trường viết bằng chữ trên bảng điện tử.'
        },
        {
          stage: 'Stage 4: System 1 (Fast Action)',
          title: 'Sinh Quỹ đạo Liên tục & Kiểm tra An toàn (Diffusion / MLP Action Head)',
          tensorSpec: 'Waypoints {(x_t, y_t, ψ_t)}_{t=1..T} @ 20Hz + Safety Shield',
          description: 'Thay vì chỉ dùng token rời rạc có sai số lượng tử hóa, các VLA hiện đại (như π0, DriveVLM-Dual) gắn thêm một Action Expert nhẹ bằng Flow Matching / Diffusion để xuất quỹ đạo mượt tốc độ cao.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: VLM/VLA thuần túy giải mã tự hồi quy (Autoregressive token-by-token) có độ trễ quá lớn (300–800ms) và có nguy cơ ảo giác không gian (Spatial Hallucination). Do đó kiến trúc thực tế trên xe tự hành luôn dùng mô hình bất đối xứng: System 1 (End-to-End BEV Planner chạy nhanh 20Hz) kết hợp System 2 (VLM chạy 2–4Hz cung cấp điều kiện hướng dẫn cấp cao).'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Từ Phân loại Tập đóng (Closed-Set) sang Nhận thức Từ vựng Mở (Open-Vocabulary)',
        summary: 'Cách CLIP, GroundingDINO và SAM phá vỡ giới hạn danh sách nhãn cố định.',
        bullets: [
          'Mô hình truyền thống chỉ nhận biết đúng K lớp đã định nghĩa lúc train (ví dụ 10 lớp nuScenes); nếu gặp xe trượt patin, đàn gia súc hay cây đổ sẽ bị bỏ sót hoặc gán sai.',
          'Open-Vocabulary Detection (GLIP, GroundingDINO) thay thế ma trận trọng số phân loại cố định W_cls bằng tích vô hướng giữa vector đặc trưng vùng ảnh và vector nhúng văn bản từ Text Encoder.',
          'Kết hợp GroundingDINO (tìm hộp từ mô tả văn bản) + SAM (Segment Anything Model — tách mặt nạ chính xác từ hộp gợi ý) tạo thành công cụ tự động gán nhãn mạnh mẽ cho mọi danh mục mới mà không cần huấn luyện lại.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Kiến trúc End-to-End Autonomous Driving (UniAD, VAD) vs VLA (RT-2, OpenVLA, DriveVLM)',
        summary: 'Sự hội tụ giữa nhận thức, dự báo, quy hoạch và ngôn ngữ.',
        bullets: [
          'Modular Pipeline truyền thống mất mát thông tin ở giao diện giữa các mô-đun (Perception chỉ truyền sang Planning vài con số tọa độ hộp, làm mất thông tin ánh mắt người đi bộ hay đèn xi-nhan lập lòe).',
          'UniAD & VAD (Vectorized Autonomous Driving): Truyền toàn bộ truy vấn đặc trưng (Track Queries, Map Queries, Motion Queries) xuyên suốt đến tận mô-đun Planning và huấn luyện chung bằng một hàm Loss tổng hợp có đạo hàm toàn trình.',
          'VLA bổ sung kho tri thức thường thức thế giới (World Knowledge) của LLM vào hệ thống End-to-End, giúp xe hiểu được các tình huống ngữ nghĩa phức tạp chưa từng xuất hiện trong dữ liệu lái xe.'
        ],
        productionTip: 'Không bao giờ nối trực tiếp đầu ra token của VLA xuống bộ chấp hành phanh/lái (Actuators) mà không đi qua một lớp Safety Filter / Model Predictive Control (MPC) tất định để kiểm tra biên va chạm và giới hạn gia tốc vật lý.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Thế hệ Kiến trúc VLM, VLA và Tự hành End-to-End',
      headers: ['Kiến trúc', 'Đầu vào & Biểu diễn', 'Đầu ra Điều khiển', 'Ưu thế & Giới hạn Thực tế'],
      rows: [
        ['CLIP / SigLIP', 'Cặp (Ảnh, Văn bản)', 'Vector nhúng chung (Contrastive)', 'Tìm kiếm dữ liệu đuôi dài, phân loại Zero-shot cực nhanh, nhưng yếu về định vị tọa độ chi tiết'],
        ['LLaVA / Qwen-VL', 'ViT + Projector + LLM', 'Chuỗi văn bản suy luận / Toạ độ hộp 2D', 'Hiểu ngữ cảnh phức tạp, đọc biển báo chữ viết, giải thích hành vi nhưng độ trễ cao'],
        ['UniAD / VAD', 'Multi-Camera → BEV Queries + Vector Map', 'Quỹ đạo quy hoạch 3s + Nhận thức đầy đủ', 'Chạy thời gian thực (~15–20 FPS), tối ưu hóa toàn trình hướng mục tiêu quy hoạch (Planning-oriented)'],
        ['RT-2 / OpenVLA / DriveVLM', 'Vision + Instruction → VLM + Action Head', 'Action Tokens hoặc Flow-Matching Waypoints', 'Khả năng tổng quát hóa sang nhiệm vụ và môi trường mới vượt trội nhờ tri thức nền của VLM']
      ]
    }
  },
  {
    id: 'P2_D11',
    phase: 'phase2',
    dayNumber: 11,
    codeLabel: 'Day 11',
    title: 'Day 11: Synthetic, Simulated & Trajectory Data',
    subtitle: 'Sim-to-Real Domain Gap, NeRF, 3D Gaussian Splatting (3DGS), World Models & Trajectory Perturbation',
    category: 'Dữ liệu Tổng hợp, Mô phỏng 3DGS & Quỹ đạo',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Dữ liệu lái xe thực tế chứa 99.9% thời gian đi thẳng an toàn và thiếu hụt trầm trọng dữ liệu tai nạn / nguy hiểm; kết hợp tái tạo trường bức xạ chân thực (NeRF / 3D Gaussian Splatting), mô hình thế giới sinh (World Models) và làm nhiễu quỹ đạo (Trajectory Perturbation) giúp huấn luyện mô hình biết cách tự khôi phục khi đi lệch làn.',
    formulas: [
      {
        name: 'Tích phân Thể tích trong NeRF vs Alpha-Blending trong 3D Gaussian Splatting (3DGS)',
        expression: 'C(r) = ∑_{i=1}^N T_i · α_i · c_i ,   với   T_i = ∏_{j=1}^{i-1} (1 - α_j)   và   Σ_{3D} = R S S^T R^T',
        variables: [
          { symbol: 'C(r)', meaning: 'Màu sắc điểm ảnh tổng hợp dọc theo tia nhìn r thông qua trộn Alpha tuần tự từ gần tới xa' },
          { symbol: 'T_i', meaning: 'Hệ số truyền qua tích lũy (Transmittance — xác suất tia sáng đi tới hạt thứ i mà chưa bị chắn)' },
          { symbol: 'Σ_{3D} = R S S^T R^T', meaning: 'Ma trận hiệp phương sai 3D của elipsoid Gaussian phân tích qua ma trận quay R và ma trận tỉ lệ dương S' }
        ],
        intuition:
          'NeRF phải truy vấn mạng MLP tại hàng trăm điểm dọc theo mỗi tia sáng nên tốc độ render rất chậm (< 1 FPS). 3D Gaussian Splatting biểu diễn cảnh bằng hàng triệu hạt Gaussian 3D tường minh và chiếu thẳng lên màn hình bằng Rasterizer GPU (Tile-based Splatting), đạt > 100 FPS ở độ phân giải cao.'
      },
      {
        name: 'Hiệu tượng Dịch chuyển Phân phối (Covariate Shift / Ross’s Theorem trong Imitation Learning)',
        expression: 'J(π_θ) - J(π^*) ≤ T^2 · ε   (Học hành vi thuần túy — Behavior Cloning)   vs   O(T · ε)   (Khi có dữ liệu khôi phục DAgger / Perturbation)',
        variables: [
          { symbol: 'ε', meaning: 'Xác suất sai số trung bình một bước của chính sách học được π_θ trên phân phối dữ liệu chuyên gia' },
          { symbol: 'T', meaning: 'Độ dài chuỗi thời gian điều khiển (Horizon)' },
          { symbol: 'T^2 · ε', meaning: 'Sai số tích lũy bậc hai do xe đi lệch khỏi quỹ đạo chuẩn rơi vào vùng trạng thái chưa từng thấy khi train' }
        ],
        intuition:
          'Dữ liệu chuyên gia lái xe chỉ toàn cảnh xe nằm chính giữa làn đường. Khi mô hình tự lái mắc một sai số nhỏ ε khiến xe hơi lệch sang phải, nó nhìn thấy góc ảnh lệch làn chưa từng có trong tập train nên lại đánh lái sai thêm, làm sai số nhân lên theo hàm bậc hai O(T²). Làm nhiễu quỹ đạo (Trajectory Perturbation + 3DGS View Synthesis) dạy mô hình cách đánh lái quay về tâm làn.'
      }
    ],
    architecture: {
      title: 'Kiến trúc Tái tạo Cảnh Động 4D (Dynamic Street Gaussians) & Tổng hợp Kịch bản Phản thực tế',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [Log Thực tế: Multi-Camera + LiDAR + 3D Track Boxes]                      │
│        │                                                                   │
│        ├──▶ [Static Background 3D Gaussians (Mặt đường, Tòa nhà, Cây cối)] │
│        └──▶ [Dynamic Object 3D Gaussians gắn theo từng Track ID (Xe, Người)]│
│                                      │                                     │
│                                      ▼  (Chỉnh sửa Đồ thị Cảnh / Perturb)  │
│  [Dịch vị trí Ego lệch ±1.0m | Chèn xe cắt đầu | Đổi thời tiết/ánh sáng]   │
│                                      │                                     │
│                                      ▼  (Differentiable Rasterizer + Raycast)│
│  [Ảnh Camera Mới Chân thực + Đám mây điểm LiDAR Mô phỏng + Nhãn Tự động]   │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Scene Decomposition',
          title: 'Tách Nền Tĩnh và Các Tác nhân Động (Scene Graph 3DGS)',
          tensorSpec: 'G_total = G_background ∪ { T_k(t) · G_actor_k }_{k=1..M}',
          description: 'Mỗi chiếc xe trên đường được tái tạo trong hệ tọa độ cục bộ riêng của nó và đặt vào cảnh thông qua ma trận chuyển động T_k(t).'
        },
        {
          stage: 'Stage 2: Counterfactual Editing',
          title: 'Biên tập Kịch bản Phản thực tế ("Điều gì xảy ra nếu...")',
          tensorSpec: 'Thay đổi quỹ đạo T_k(t) để tạo tình huống suýt va chạm (Near-Miss)',
          description: 'Từ 1 đoạn log lái xe bình thường, ta có thể điều khiển chiếc xe ở làn bên cạnh đột ngột tạt đầu xe chủ để sinh dữ liệu huấn luyện phanh khẩn cấp.'
        },
        {
          stage: 'Stage 3: Trajectory Perturbation',
          title: 'Dịch chuyển Điểm nhìn Xe chủ & Tính Quỹ đạo Khôi phục',
          tensorSpec: 'Dịch Ego sang ngang Δy = +0.8m → Render ảnh mới + Tạo nhãn lái về Δy = 0',
          description: 'Nhờ 3DGS cho phép render từ góc nhìn mới (Novel View Synthesis), ta có ngay bức ảnh chân thực khi xe bị lệch làn kèm theo nhãn quỹ đạo đúng để quay lại giữa làn.'
        },
        {
          stage: 'Stage 4: Domain Adaptation',
          title: 'Thu hẹp Khoảng cách Mô phỏng – Thực tế (Sim-to-Real Alignment)',
          tensorSpec: 'Sensor Physics Modeling: LiDAR Ray-Drop, Rolling Shutter, Lens Flare',
          description: 'Mô phỏng cả đặc tính vật lý của cảm biến (tia LiDAR bị hấp thụ trên bề mặt sơn đen hoặc mặt đường ướt) để mô hình không học vẹt đặc trưng đồ họa giả.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Khi dịch chuyển vị trí xe chủ quá xa khỏi quỹ đạo thu thập gốc (> 2.5 mét), các vùng bị che khuất chưa từng được camera quét qua sẽ lộ ra khoảng trống hoặc nhiễu mờ trong 3DGS. Các hệ thống hiện đại kết hợp thêm Diffusion Prior (như StreetCrafter / DriveDreamer) để điền đầy các vùng khuất này một cách hợp lý.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Hai tầng Khoảng cách Mô phỏng – Thực tế (Appearance Gap vs Content/Behavior Gap)',
        summary: 'Tại sao đồ họa game truyền thống (CARLA/Unreal) chưa đủ để thay thế dữ liệu thật.',
        bullets: [
          'Appearance Gap (Khoảng cách Diện mạo mức Pixel): Sự khác biệt về phản xạ ánh sáng, nhiễu cảm biến CMOS, độ nhòe chuyển động và đặc tính phản xạ tia LiDAR giữa công cụ render CG và cảm biến thực tế.',
          'Content & Behavior Gap (Khoảng cách Phân phối Hành vi): Trong trình mô phỏng cổ điển, các xe NPC di chuyển theo quy tắc cứng nhắc và đơn điệu, không phản ánh được sự đa dạng, bất ngờ và văn hóa giao thông thực tế.',
          'Giải pháp Neural Reconstruction (UniSim, StreetGaussians): Khởi tạo thế giới mô phỏng trực tiếp từ các đoạn log cảm biến thực tế thay vì vẽ bằng tay 3D mesh, vừa giữ được 100% độ chân thực quang học vừa cho phép chỉnh sửa tương tác.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Generative World Models & Tăng cường Dữ liệu Quỹ đạo (Trajectory Augmentation)',
        summary: 'Dự đoán trạng thái tương lai của thế giới dưới tác động của hành động điều khiển.',
        bullets: [
          'World Model p(s_{t+1}, o_{t+1} | s_t, a_t): Nhận trạng thái hiện tại s_t và hành động của xe chủ a_t (tăng tốc, đánh lái) để sinh ra khung cảnh tương lai tiếp theo dưới dạng video, BEV hoặc 3D Occupancy.',
          'Chống Học vẹt Quán tính (Causal Confusion / Inertia Problem): Nếu mô hình规划 nhận cả vận tốc hiện tại của xe chủ làm đầu vào, nó rất dễ học lối tắt "xe đang có vận tốc = 0 thì cứ tiếp tục đứng yên" và không bao giờ chịu khởi hành khi đèn xanh bật! Giải pháp là Dropout lịch sử trạng thái Ego hoặc thêm nhiễu vào quỹ đạo quá khứ.'
        ],
        productionTip: 'Không bao giờ đánh giá mô hình trên tập Validation bằng dữ liệu Synthetic: Dữ liệu tổng hợp và mô phỏng chỉ dùng để mở rộng tập Train hoặc kiểm thử kịch bản hiếm; tập Test chuẩn (Benchmark) cho Perception phải luôn chứa dữ liệu cảm biến thực tế 100%.'
      }
    ],
    comparisonTable: {
      title: 'So sánh các Nguồn Dữ liệu Mô phỏng & Tổng hợp trong AI Tự hành',
      headers: ['Công nghệ', 'Độ chân thực Cảm biến (Photorealism)', 'Khả năng Thay đổi Góc nhìn / Hành động', 'Tốc độ Tổng hợp & Ứng dụng'],
      rows: [
        ['Game Engine (CARLA / Unreal)', 'Trung bình (cần Domain Adaptation)', 'Tuyệt đối (điều khiển 100% cảnh & thời tiết)', 'Nhanh, tốt để kiểm thử logic điều khiển và kịch bản cực đoan'],
        ['NeRF (UniSim / Block-NeRF)', 'Rất cao (tái tạo từ log thật)', 'Tốt trong phạm vi ±2m quanh quỹ đạo gốc', 'Chậm khi render độ phân giải cao, tốn thời gian tối ưu mỗi cảnh'],
        ['3D Gaussian Splatting (3DGS)', 'Rất cao & sắc nét chi tiết', 'Rất tốt (dễ tách ghép vật thể động theo Track)', 'Thời gian thực (>100 FPS), chuẩn mực mới cho Closed-loop Re-simulation'],
        ['Video / Occupancy World Models', 'Cao (sinh thêm được cả vùng bị khuất)', 'Linh hoạt theo điều kiện hành động & prompt', 'Đang phát triển mạnh để sinh các kịch bản hiếm hoàn toàn mới']
      ]
    }
  },
  {
    id: 'P2_D12',
    phase: 'phase2',
    dayNumber: 12,
    codeLabel: 'Day 12',
    title: 'Day 12: Day 12-Replay and closed-loop test',
    subtitle: 'Open-Loop Log Replay vs Closed-Loop Evaluation, Reactive Traffic Agents, Safety Metrics & Shadow Mode',
    category: 'Kiểm thử Vòng kín & Đánh giá Hệ thống Thực tế',
    defaultStatus: 'not_started',
    defaultProgress: 0,
    keyIdea:
      'Đánh giá vòng hở (Open-Loop Log Replay) có thể cho sai số L2 cực thấp nhưng xe vẫn đâm ngay khi chạy thật vì thiếu sự tích lũy sai số theo thời gian và phản ứng qua lại của môi trường; Kiểm thử vòng kín (Closed-Loop Evaluation) với các tác nhân giao thông phản ứng (Reactive Agents) là cổng kiểm định bắt buộc trước khi triển khai.',
    formulas: [
      {
        name: 'Sự Bất đồng giữa Open-Loop L2 Error và Closed-Loop Driving Score',
        expression: 's_{t+1} = f_{kinematic}(s_t, π_θ(o_t))   |   DS = RC × ∏_{k ∈ Penalties} (p_k)^{n_k}',
        variables: [
          { symbol: 's_{t+1} = f(s_t, π_θ(o_t))', meaning: 'Trong vòng kín, vị trí của xe ở bước t+1 do chính hành động mô hình sinh ra ở bước t quyết định (không được đặt lại về quỹ đạo người lái)' },
          { symbol: 'RC (Route Completion)', meaning: 'Tỷ lệ phần trăm quãng đường nhiệm vụ hoàn thành (0% đến 100%)' },
          { symbol: '∏ (p_k)^{n_k}', meaning: 'Hệ số phạt nhân tích lũy cho các lỗi: va chạm người đi bộ (0.50), va chạm xe (0.60), vượt đèn đỏ (0.70), đi chệch làn đường' }
        ],
        intuition:
          'Trong Open-Loop, nếu tại t=1 mô hình lái lệch 0.2m nhưng sang t=2 hệ thống lại ép đặt chiếc xe quay về đúng vị trí người lái thật để chấm tiếp, sai số không bao giờ tích lũy. Trong Closed-Loop, độ lệch 0.2m đó làm thay đổi góc nhìn o_2 ở bước tiếp theo và kiểm tra thực sự khả năng tự sửa sai của mô hình.'
      },
      {
        name: 'Mô hình Tác nhân Phản ứng IDM (Intelligent Driver Model) & Chỉ số An toàn TTC / Comfort',
        expression: 'a_{IDM} = a_{max} [ 1 - (v / v_0)^δ - (s^*(v, Δv) / s)^2 ]   |   TTC = Δd / (v_{ego} - v_{lead})   |   Jerk = |da / dt|',
        variables: [
          { symbol: 'a_{IDM}', meaning: 'Gia tốc của xe NPC phía sau phản ứng tự nhiên khi xe chủ phanh hoặc chuyển làn' },
          { symbol: 's^*(v, Δv)', meaning: 'Khoảng cách an toàn mong muốn phụ thuộc vào vận tốc hiện tại v và vận tốc tiến lại gần Δv' },
          { symbol: 'TTC (Time-to-Collision)', meaning: 'Thời gian tới khi va chạm nếu hai xe giữ nguyên vận tốc (ngưỡng cảnh báo nguy hiểm thường TTC < 1.5s–2.0s)' },
          { symbol: 'Jerk = |da/dt|', meaning: 'Độ giật gia tốc (m/s³) đo mức độ êm ái của hành khách (ngưỡng thoải mái thường Jerk < 2.0–4.0 m/s³)' }
        ],
        intuition:
          'Nếu chỉ phát lại vị trí cố định của các xe khác từ log (Non-reactive Log Replay), khi xe chủ chủ động đi chậm lại nhường đường thì xe phía sau trong log (vốn đi theo quỹ đạo cũ) sẽ đâm xuyên từ phía sau vào xe chủ — gây ra lỗi va chạm giả (False Collision).'
      }
    ],
    architecture: {
      title: 'Kiến trúc Kiểm thử Vòng kín (Closed-Loop Simulator + Reactive Agents + Safety Shield)',
      asciiDiagram: `┌────────────────────────────────────────────────────────────────────────────┐
│  [World State s_t: Ego Pose + Reactive NPC Agents (IDM / Learned Sim)]     │
│        │                                                                   │
│        ▼  (3DGS Sensor Rendering / Synthetic Vector Perturbation)          │
│  [Simulated Sensor Observations o_t (Cameras, LiDAR, IMU)]                 │
│        │                                                                   │
│        ▼                                                                   │
│  [System Under Test: Perception → Prediction → Planning / VLA Policy π_θ]  │
│        │                                                                   │
│        ▼  (Control Command u_t = [Steer δ, Accel a] + Vehicle Dynamics)    │
│  [Cập nhật Ego State s_{t+1} & Phản ứng của các Xe xung quanh] ──(Loop)──▶ │
└────────────────────────────────────────────────────────────────────────────┘`,
      nodes: [
        {
          stage: 'Stage 1: Scenario Bank',
          title: 'Ngân hàng Kịch bản Phân tầng (Nominal, Hard Logs, Adversarial)',
          tensorSpec: 'nuPlan / Waymax / Custom Safety-Critical Scenarios',
          description: 'Bao gồm các đoạn log thực tế, các tình huống được tái tạo từ sự cố trên đường và các kịch bản đối kháng (xe tạt đầu, người băng qua đường khuất tầm nhìn).'
        },
        {
          stage: 'Stage 2: Reactive Traffic',
          title: 'Mô phỏng Giao thông Có Phản ứng (IDM / Closed-Loop Multi-Agent)',
          tensorSpec: 'NPC cập nhật hành động theo vị trí mới của Ego tại mỗi bước 100ms',
          description: 'Các phương tiện xung quanh biết giảm tốc nhường đường hoặc chuyển làn phản ứng lại quyết định của xe chủ, loại bỏ hiện tượng va chạm giả của Log Replay tĩnh.'
        },
        {
          stage: 'Stage 3: Vehicle Dynamics',
          title: 'Mô hình Động lực học Xe & Độ trễ Cơ cấu Chấp hành',
          tensorSpec: 'Kinematic/Dynamic Bicycle Model + Actuator Delay (50–150ms)',
          description: 'Mô phỏng cả độ trễ từ lúc máy tính ra lệnh phanh đến khi áp suất thủy lực thực sự hãm bánh xe để phát hiện hiện tượng dao động điều khiển (Control Oscillation).'
        },
        {
          stage: 'Stage 4: Multi-Metric Evaluator',
          title: 'Chấm điểm Toàn diện: An toàn, Tiến độ, Luật lệ & Độ êm ái',
          tensorSpec: 'No At-Fault Collision + Drivable Area Compliance + TTC + Jerk',
          description: 'Một mô hình đứng yên tại chỗ sẽ đạt 0% va chạm nhưng bị 0 điểm Route Progress; hệ thống chấm điểm nhân tổ hợp để bắt buộc xe vừa an toàn vừa hoàn thành hành trình.'
        }
      ],
      bottleneckNote:
        'Điểm nghẽn thực tế: Khoảng cách giữa Kiểm thử cấp Mô-đun (Module-level Metric như mAP, minADE) và Kiểm thử cấp Hệ thống (System-level Driving Score). Tăng 2% mAP cho các vật thể ở cách 90m bên ngoài làn đường hầu như không làm thay đổi chất lượng lái, nhưng bỏ sót 1 khung hình của chiếc xe cắt mặt ở khoảng cách 12m sẽ gây tai nạn ngay lập tức.'
    },
    sections: [
      {
        id: 'sec-1',
        title: '1. Open-Loop (Vòng hở) vs Closed-Loop (Vòng kín): Tại sao L2 Error thấp vẫn gây tai nạn?',
        summary: 'Hiểu bản chất sự lệch phân phối trạng thái khi đưa mô hình vào vòng lặp điều khiển thực tế.',
        bullets: [
          'Open-Loop Evaluation: Tại mỗi thời điểm t, hệ thống nạp trạng thái thật của người lái s_t^{expert}, yêu cầu mô hình dự đoán quỹ đạo 3 giây tiếp theo rồi đo khoảng cách L2 với quỹ đạo người lái. Tuy nhiên sang bước t+1, vị trí xe lại được reset về s_{t+1}^{expert}.',
          'Closed-Loop Evaluation: Vị trí của xe tại bước t+1 được tính bằng việc thực thi lệnh lái của chính mô hình tại bước t thông qua bộ mô phỏng động lực học. Mọi sai số nhỏ đều tích lũy sang các bước sau.',
          'Non-Reactive Log Replay vs Reactive Closed-Loop: Trong Log Replay vòng kín nhưng các xe khác không phản ứng (Non-reactive), nếu xe chủ đi chậm hơn người lái thật 5 giây, toàn bộ bối cảnh giao thông xung quanh đã trôi qua theo lịch sử cũ và không còn ăn khớp với thực tế.'
        ]
      },
      {
        id: 'sec-2',
        title: '2. Quy trình Triển khai An toàn: Shadow Mode, Safety Cage & Regression Testing',
        summary: 'Các cổng kiểm định (Release Gates) trước khi cập nhật mô hình lên đội xe thực tế.',
        bullets: [
          'Golden Regression Suite: Bộ hàng nghìn kịch bản sự cố lịch sử (Historical Incident Scenarios); bất kỳ mô hình mới nào dù có điểm trung bình cao hơn nhưng làm hỏng dù chỉ 1 kịch bản an toàn cốt lõi cũng bị chặn tự động trong CI/CD.',
          'Shadow Mode (Chế độ Chạy ngầm đối chứng): Mô hình mới chạy song song trên phần cứng xe thật, nhận đầy đủ dữ liệu cảm biến thời gian thực và xuất ra quyết định lái nhưng không điều khiển vô-lăng; hệ thống đo độ lệch (Divergence) giữa mô hình mới và người lái/mô hình đang chạy chính thức.',
          'Run-time Safety Envelope (Hàng rào An toàn Thời gian thực): Một lớp kiểm tra hình học và vật lý độc lập, đơn giản, có thể chứng minh toán học (Verifiable) luôn nằm cuối cùng để cắt quyền điều khiển hoặc kích hoạt phanh khẩn cấp AEB nếu quỹ đạo từ mạng AI vi phạm ngưỡng TTC tối thiểu.'
        ],
        productionTip: 'Luôn phân loại va chạm thành "At-Fault Collision" (Va chạm do lỗi của xe chủ — ví dụ đâm đuôi xe trước hoặc chuyển làn ẩu) và "Non-At-Fault Collision" (Xe khác đâm từ phía sau khi xe chủ đang dừng đèn đỏ đúng luật) để đánh giá chính xác chất lượng bộ điều khiển.'
      }
    ],
    comparisonTable: {
      title: 'Ma trận So sánh các Phương thức Kiểm thử & Đánh giá Hệ thống AI Tự hành',
      headers: ['Phương thức Kiểm thử', 'Cập nhật Vị trí Xe chủ', 'Hành vi Xe xung quanh (NPC)', 'Khả năng Phát hiện Lỗi Tích lũy'],
      rows: [
        ['Open-Loop Evaluation', 'Reset về vị trí Log thật mỗi bước', 'Phát lại cố định từ Log', 'Không (chỉ đo độ giống quỹ đạo tức thời trong 1 bước)'],
        ['Closed-Loop Non-Reactive Replay', 'Cập nhật theo lệnh điều khiển của AI', 'Phát lại cố định từ Log (không nhường đường)', 'Có cho xe chủ, nhưng dễ sinh va chạm giả từ phía sau'],
        ['Closed-Loop Reactive Simulation', 'Cập nhật theo lệnh điều khiển của AI', 'Phản ứng động (IDM / Learned Traffic Agents)', 'Rất cao, đánh giá chuẩn xác cả an toàn, giao tiếp lẫn tiến độ'],
        ['Closed-Loop 3DGS Sensor Sim', 'Cập nhật theo AI + Render lại ảnh/LiDAR', 'Phản ứng động + Tái tạo cảm biến góc nhìn mới', 'Toàn diện nhất: kiểm thử khép kín từ Pixel cảm biến đến Lệnh lái']
      ]
    }
  }
];
