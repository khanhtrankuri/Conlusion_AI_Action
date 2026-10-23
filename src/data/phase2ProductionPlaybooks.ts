import { ProductionPlaybook } from '../types/curriculum';

export const PHASE2_PRODUCTION_PLAYBOOKS: Record<string, ProductionPlaybook> = {
  P2_D01: {
    dayId: 'P2_D01',
    projectTitle: 'Huấn luyện phân tán Multi-Node Backbone & Tối ưu hoá Mixed-Precision cho Hệ thống Thị giác Lớn',
    systemScaleSpec: 'Dataset 50M ảnh đa camera · Cluster 64x GPU A100/H100 (DDP/FSDP) · Mixed Precision BF16/FP8',
    latencyAndMemorySLA: [
      'Throughput huấn luyện >= 18,000 samples/sec trên 64 GPUs với Scaling Efficiency > 92%.',
      'VRAM Peak < 72GB/GPU nhờ Activation Checkpointing + ZeRO Stage 2 Optimizer State Sharding.',
      'Gradient Norm ổn định < 2.0 xuyên suốt 100k steps, không xảy ra NaN/Inf spike khi chuyển từ Warmup sang Cosine Decay.',
    ],
    architectureDecisions: [
      {
        decision: 'Sử dụng BFloat16 (BF16) thay vì FP16 thuần khi huấn luyện mạng sâu có Attention/Residual lớn',
        rationale: 'BF16 giữ nguyên 8-bit exponent giống FP32 (dynamic range ~10^38), loại bỏ gần như hoàn toàn lỗi tràn số dưới (underflow) của gradient mà không cần Loss Scaling phức tạp.',
        tradeoff: 'Mantissa giảm còn 7-bit (so với 10-bit của FP16), do đó bắt buộc phải giữ Master Weights và phép cộng dồn (Accumulator) ở FP32.',
      },
      {
        decision: 'Tách nhóm tham số (Parameter Groups) trong AdamW: Không áp dụng Weight Decay lên Bias, LayerNorm/BatchNorm γ, β và Positional Embeddings',
        rationale: 'Regularize các tham số dịch chuyển (shift) và chuẩn hoá (scale) làm suy giảm khả năng biểu diễn biên độ đặc trưng và gây mất ổn định ở các tầng sâu.',
        tradeoff: 'Cấu hình optimizer phức tạp hơn khi kết hợp với LARS/LAMB ở batch size cực lớn (> 16k).',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Loss giảm tốt trên tập train nhưng Validation mAP/Accuracy sụt giảm mạnh khi chạy inference với Batch Size = 1',
        rootCause: 'BatchNorm sử dụng running_mean và running_var bị lệch (drift) do per-GPU batch size quá nhỏ (< 4 ảnh/GPU) trong quá trình huấn luyện DDP mà không bật SyncBatchNorm.',
        engineeringFix: 'Bật torch.nn.SyncBatchNorm.convert_sync_batchnorm(model) khi huấn luyện đa GPU, hoặc chuyển sang GroupNorm / LayerNorm / FrozenBN khi fine-tune detector.',
      },
      {
        symptom: 'Gradient Norm đột ngột vọt lên NaN ở step 15,000 khi đào tạo trên dữ liệu thực tế có nhãn nhiễu',
        rootCause: 'Một số mẫu bị gán nhãn sai (corrupted bounding box hoặc outlier cực đoan) tạo ra logit lớn trong Cross-Entropy / Box Regression dẫn đến bùng nổ đạo hàm bậc nhất.',
        engineeringFix: 'Kết hợp Global Gradient Clipping (max_norm = 1.0), Label Smoothing (ε = 0.1) và chuyển sang Smooth L1 / Huber Loss cho nhánh hồi quy.',
      },
    ],
  },
  P2_D02: {
    dayId: 'P2_D02',
    projectTitle: 'Thiết kế Vision Backbone Đa Tỷ Lệ (ConvNeXt / Swin / ViT) Triển khai trên NVIDIA Orin Edge SoC',
    systemScaleSpec: '6 Camera 1080p @ 30 FPS · Phần cứng đích: NVIDIA Drive Orin (254 TOPS INT8) · TensorRT 10 Engine',
    latencyAndMemorySLA: [
      'Tổng thời gian chạy Backbone + FPN cho 6 luồng camera <= 8.5 ms/frame ở chế độ INT8/FP16.',
      'SRAM / L2 Cache Hit Rate > 80% bằng cách hợp nhất (layer fusion) Conv + Bias + ReLU/SiLU.',
      'Độ sụt giảm mAP sau khi lượng tử hoá Post-Training Quantization (PTQ INT8) < 0.4% so với FP32.',
    ],
    architectureDecisions: [
      {
        decision: 'Chọn RepVGG / ConvNeXt-Tiny kết hợp PANet thay vì Vanilla ViT cho tầng trích xuất đặc trưng độ phân giải cao (stride 4, stride 8)',
        rationale: 'Vanilla ViT có độ phức tạp O(N^2) theo số lượng patch và thiếu phép quy nạp cục bộ (locality inductive bias), gây tốn băng thông bộ nhớ (memory-bound) trên phần cứng nhúng.',
        tradeoff: 'Receptive field toàn cục ở các tầng đầu nhỏ hơn ViT; bù đắp bằng cách chỉ dùng Window/Global Attention ở tầng sâu (stride 16, stride 32).',
      },
      {
        decision: 'Thay thế GELU/LayerNorm bằng ReLU/SiLU + BatchNorm (fused) ở các nhánh tốc độ cao trên DLA (Deep Learning Accelerator)',
        rationale: 'Hardware DLA trên SoC tối ưu hoá phần cứng cho phép nhân tích chập 2D và kích hoạt tuyến tính từng khúc; LayerNorm và GELU phải fallback về GPU gây tốn thời gian chuyển ngữ cảnh.',
        tradeoff: 'Cần huấn luyện lại (Quantization-Aware Training - QAT) để giữ nguyên độ chính xác như kiến trúc gốc.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Khi lượng tử hoá ConvNeXt hoặc MobileNet sang INT8, độ chính xác sụt giảm nghiêm trọng (> 5% mAP)',
        rootCause: 'Các lớp Depthwise Separable Convolution có số lượng tham số mỗi kênh rất ít và phân phối kích hoạt (activation distribution) có dải động lệch lớn giữa các kênh (inter-channel outlier).',
        engineeringFix: 'Sử dụng Per-Channel Quantization cho trọng số, kết hợp Entropy/Percentile Calibration (99.99%) và giữ các tầng nhạy cảm (stem + head cuối) ở FP16.',
      },
      {
        symptom: 'Vật thể nhỏ ở khoảng cách > 80m hoàn toàn biến mất trên bản đồ đặc trưng P4/P5',
        rootCause: 'Sau 4 lần hạ mẫu (stride 16/32), vật thể kích thước 12x12 pixel chỉ còn chưa tới 1x1 điểm ảnh trên feature map và bị xoá mờ bởi phép gộp (pooling).',
        engineeringFix: 'Bổ sung nhánh P2 (stride 4) hoặc sử dụng Dilated/Atrous Convolution (dilation=2) ở stage cuối kết hợp Crop-and-Resize ROI trên vùng chân trời (horizon ROI).',
      },
    ],
  },
  P2_D03: {
    dayId: 'P2_D03',
    projectTitle: 'Hệ thống Nhận thức 2D Đa Nhiệm (HydraNet: Detection + Panoptic Segmentation + Keypoints)',
    systemScaleSpec: 'Multi-Task Head trên 1 Shared Backbone · 15 lớp giao thông · Yêu cầu tốc độ tổng <= 15 ms',
    latencyAndMemorySLA: [
      'Shared Backbone + BiFPN: 6.5 ms · Detection Head (Anchor-Free): 2.5 ms · Segmentation Head: 3.0 ms · Keypoints: 2.0 ms.',
      'Không sử dụng CPU-blocking NMS; toàn bộ bước lọc hộp giới hạn chạy bằng Top-K / Matrix NMS trực tiếp trên GPU TensorRT.',
      'IoU làn đường và mặt đường đạt > 91% mIoU cả trong điều kiện bóng đổ phức tạp.',
    ],
    architectureDecisions: [
      {
        decision: 'Sử dụng kiến trúc Shared Backbone + Multi-Head (HydraNet) kết hợp Dynamic Task Weighting (Uncertainty Weighting)',
        rationale: 'Chạy 3 mạng riêng biệt cho Detection, Segmentation và Pose làm tăng gấp 3 lần chi phí tính toán và băng thông đọc ảnh.',
        tradeoff: 'Xảy ra hiện tượng Negative Transfer (gradient của bài toán Segmentation lấn át Detection); giải quyết bằng cân bằng loss theo homoscedastic uncertainty σ_t hoặc GradNorm.',
      },
      {
        decision: 'Áp dụng Task-Aligned Assigner (TAL) + Distribution Focal Loss (DFL) thay vì gán nhãn tĩnh theo ngưỡng IoU cố định',
        rationale: 'Đồng bộ hoá điểm phân loại (classification score) và chất lượng định vị (IoU) giúp hộp có điểm tự tin cao nhất luôn là hộp có vị trí chính xác nhất.',
        tradeoff: 'Cần tính toán ma trận căn chỉnh (alignment metric) động trong quá trình huấn luyện.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Trong đám đông người đi bộ hoặc bãi đỗ xe dày đặc, các đối tượng đứng sát nhau bị mất hộp giới hạn (False Negative)',
        rootCause: 'Greedy NMS truyền thống xoá toàn bộ các hộp lân cận có IoU > 0.5 với hộp điểm cao nhất, vô tình xoá luôn hộp của đối tượng thực sự đứng ngay phía sau.',
        engineeringFix: 'Chuyển sang Soft-NMS (giảm điểm theo hàm Gaussian của IoU) hoặc thiết kế Set-Prediction kiểu DETR / One-to-One Matching để loại bỏ hoàn toàn hậu xử lý NMS.',
      },
      {
        symptom: 'Biên phân đoạn (Segmentation Boundary) quanh chân người đi bộ và cột biển báo bị răng cưa và nhòe',
        rootCause: 'Dự đoán mặt nạ ở độ phân giải 1/8 rồi phóng đại tuyến tính (bilinear upsampling) làm mất tần số không gian cao ở biên vật thể.',
        engineeringFix: 'Tích hợp mô-đun PointRend hoặc kết hợp Boundary/Lovász-Softmax Loss lấy mẫu tập trung tại các điểm có độ không chắc chắn cao dọc theo ranh giới.',
      },
    ],
  },
  P2_D04: {
    dayId: 'P2_D04',
    projectTitle: 'Pipeline Chuỗi Khung Hình Thời Gian (Temporal Video Perception) & Đồng Bộ Hoá Phần Cứng',
    systemScaleSpec: 'Chuỗi lịch sử T = 8 khung hình · Đồng bộ phần cứng PTP/gPTP · Bù chuyển động Ego-Motion 6-DoF',
    latencyAndMemorySLA: [
      'Độ lệch dấu thời gian (Timestamp Skew) giữa các cảm biến và IMU <= 1.0 ms nhờ đồng bộ PTP.',
      'Bộ nhớ đệm đặc trưng lịch sử (Temporal Feature Queue) tiêu thụ < 250 MB VRAM thông qua kỹ thuật Streaming FIFO.',
      'Giảm tỷ lệ nhấp nháy nhận dạng (Flickering / Temporal Jitter) > 65% so với mô hình đơn khung hình.',
    ],
    architectureDecisions: [
      {
        decision: 'Triển khai kiến trúc Streaming Recurrent Feature Queue (lưu trữ tensor đặc trưng đã trích xuất của khung t-1..t-k) thay vì chạy lại Backbone trên toàn bộ cửa sổ video',
        rationale: 'Tái sử dụng đặc trưng từ khung hình trước giúp chi phí suy luận mỗi khung hình mới chỉ tương đương 1.1x mô hình đơn khung hình thay vì gấp T lần.',
        tradeoff: 'Bắt buộc phải thực hiện phép biến đổi không gian (Spatial Warping) cho feature map t-1 theo ma trận chuyển động của xe chủ (ego-motion T_{t-1 -> t}) trước khi hợp nhất.',
      },
      {
        decision: 'Kết hợp Optical Flow / Deformable Temporal Attention để căn chỉnh các đối tượng đang di chuyển độc lập với xe chủ',
        rationale: 'Ego-motion compensation chỉ căn chỉnh đúng bối cảnh tĩnh; các xe đang chạy nhanh sẽ bị lệch vị trí giữa t-1 và t nếu chỉ nhân ma trận ngoại tham.',
        tradeoff: 'Thêm khoảng 1.2 ms độ trễ cho tầng Deformable Attention.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Bóng ma (Ghosting Artifacts) xuất hiện phía sau các phương tiện di chuyển ngang với tốc độ cao',
        rootCause: 'Trạng thái ẩn thời gian (recurrent hidden state) giữ lại đặc trưng cũ tại vị trí quá khứ khi mạng tích luỹ lịch sử với hệ số quên (forget gate) quá thấp.',
        engineeringFix: 'Thêm nhánh Motion Gating / Disocclusion Mask dựa trên sai số tái chiếu (reprojection error) để xoá đặc trưng lịch sử tại các vùng vừa mới lộ ra.',
      },
      {
        symptom: 'Mô hình hoạt động tốt khi xe chạy ở 30 FPS nhưng suy giảm nghiêm trọng khi hệ thống bị rớt khung hình (frame drop xuống 10 FPS)',
        rootCause: 'Mô hình giả định khoảng cách thời gian Δt giữa hai khung hình liên tiếp là hằng số cố định.',
        engineeringFix: 'Nhúng trực tiếp khoảng thời gian thực tế Δt = t_k - t_{k-1} vào Positional Encoding và áp dụng Frame-Drop Augmentation (bỏ ngẫu nhiên 1–3 khung hình) trong lúc huấn luyện.',
      },
    ],
  },
  P2_D05: {
    dayId: 'P2_D05',
    projectTitle: 'Bộ Lọc Kalman Mở Rộng / Không Mùi (EKF/UKF) & Hợp Nhất Xác Suất Bền Vững Cho Hệ Thống Định Vị - Theo Dấu',
    systemScaleSpec: 'Tần số vòng lặp trạng thái: 100 Hz (IMU Prediction) / 20 Hz (Radar & Camera Update) / 10 Hz (LiDAR Update)',
    latencyAndMemorySLA: [
      'Thời gian thực thi 1 chu kỳ Predict + Update cho 200 mục tiêu đồng thời <= 0.8 ms trên CPU thực gian thực (RTOS).',
      'Ma trận hiệp phương sai P_k luôn đối xứng xác định dương (Symmetric Positive Definite - SPD) 100% thời gian vận hành liên tục 1,000 giờ.',
      'Tỷ lệ loại bỏ đo lường nhiễu (Outlier Rejection) đạt > 99.5% nhờ kiểm định Chi-Square trên khoảng cách Mahalanobis.',
    ],
    architectureDecisions: [
      {
        decision: 'Sử dụng công thức cập nhật hiệp phương sai dạng Joseph (Joseph Stabilized Form): P_{k|k} = (I - K_k H_k) P_{k|k-1} (I - K_k H_k)^T + K_k R_k K_k^T',
        rationale: 'Công thức rút gọn P = (I - KH)P rất nhạy với sai số làm tròn dấu phẩy động, dễ làm ma trận P mất tính đối xứng hoặc có trị riêng âm gây nổ bộ lọc (filter divergence).',
        tradeoff: 'Tốn thêm phép nhân ma trận nhưng đảm bảo tuyệt đối tính xác định dương trên phần cứng nhúng.',
      },
      {
        decision: 'Sử dụng mô hình động học CTRV (Constant Turn Rate and Velocity) kết hợp UKF cho các mục tiêu tại giao lộ thay vì KF tuyến tính CV',
        rationale: 'Khi xe rẽ gấp ở ngã tư, mô hình vận tốc thẳng đều (CV) bị trễ pha nghiêm trọng, dẫn đến cổng liên kết (association gate) bị lệch khỏi đo lường thực tế.',
        tradeoff: 'UKF cần tính toán 2n + 1 điểm Sigma (11 điểm cho trạng thái 5 chiều), tăng chi phí tính toán khoảng 2.5 lần so với KF tuyến tính.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Bộ lọc đột ngột ngừng tiếp nhận mọi đo lường mới từ cảm biến (Filter Smugness / Starvation)',
        rootCause: 'Hiệp phương sai nhiễu quá trình Q_k được đặt quá nhỏ, khiến P_{k|k} hội tụ về gần 0; dẫn đến Kalman Gain K_k -> 0 và khoảng cách Mahalanobis vọt lên cực lớn làm từ chối mọi đo lường.',
        engineeringFix: 'Thiết lập ngưỡng sàn cho phương sai trạng thái (Covariance Floor / Fading Memory Filter) và tự động bơm thêm nhiễu Q_k (Covariance Inflation) khi innovation vượt ngưỡng.',
      },
      {
        symptom: 'Góc hướng (Yaw angle ψ) của mục tiêu bị giật nhảy vọt 360 độ khi quay qua mốc ±π radian',
        rootCause: 'Phép trừ tuyến tính y = z - Hx không xử lý tính tuần hoàn của không gian góc S^1 (ví dụ π - (-π) = 2π thay vì 0).',
        engineeringFix: 'Chuẩn hoá mọi phần dư góc (angle residual) trong cả bước tính trung bình Sigma Points và bước tính Innovation bằng hàm wrapToPi(Δψ) = atan2(sin(Δψ), cos(Δψ)).',
      },
    ],
  },
  P2_D06: {
    dayId: 'P2_D06',
    projectTitle: 'Nhận Thức 3D Từ Đám Mây Điểm LiDAR (PointPillars / CenterPoint / Sparse Voxel Backbone)',
    systemScaleSpec: 'LiDAR 64/128 tia (~120,000 điểm/vòng quét @ 10Hz) · Phạm vi [-75m, 75m] · TensorRT INT8 + Custom CUDA Pillar Scatter',
    latencyAndMemorySLA: [
      'Deskewing (bù méo chuyển động) + Voxelization: <= 1.8 ms trên GPU CUDA.',
      '3D/2D Backbone + CenterHead suy luận hoàn chỉnh <= 9.0 ms (đạt tốc độ > 100 Hz, dư tải cho chu kỳ 10 Hz của LiDAR).',
      'NDS (nuScenes Detection Score) >= 68% và 3D AP (IoU 0.7 cho Car) >= 82%.',
    ],
    architectureDecisions: [
      {
        decision: 'Triển khai Dynamic Voxelization (không giới hạn cứng số điểm cố định kèm bộ đệm rỗng) kết hợp Custom CUDA Scatter Kernel cho PointPillars',
        rationale: 'Hard Voxelization tạo ra tensor dày đặc chứa tới 80% số ô rỗng gây lãng phí bộ nhớ và băng thông truyền PCIe/DRAM.',
        tradeoff: 'Cần viết plugin CUDA/TensorRT tuỳ chỉnh cho phép toán PillarFeatureNet và Scatter.',
      },
      {
        decision: 'Sử dụng Center-based 3D Detection (CenterPoint) thay vì Anchor-based 3D boxes cho bài toán đa lớp (Xe hơi, Người đi bộ, Xe đạp)',
        rationale: 'Người đi bộ và người đi xe đạp không có hướng cố định rõ ràng; đại diện vật thể bằng điểm tâm trên mặt phẳng BEV giúp bất biến với phép quay và loại bỏ hàng trăm nghìn 3D anchors.',
        tradeoff: 'Cần bước tinh chỉnh giai đoạn 2 (Second-stage Surface Point Feature RoI Refinement) để đạt độ chính xác kích thước hộp cao nhất cho xe tải dài.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Hộp giới hạn 3D của các phương tiện ở hai bên sườn bị kéo dài bất thường hoặc lệch góc hướng khi xe chủ vừa chạy nhanh vừa đánh lái',
        rootCause: 'LiDAR cơ học mất 100ms để quét hết 1 vòng 360 độ; điểm đầu và điểm cuối vòng quét được thu ở hai vị trí hệ quy chiếu khác nhau (Motion Distortion / Rolling Shutter của LiDAR).',
        engineeringFix: 'Thực hiện Point Cloud Deskewing: nội suy tuyến tính tư thế xe chủ T(t_i) (SLERP cho quaternion quay + LERP cho tịnh tiến) từ dữ liệu IMU 200Hz theo đúng timestamp của từng điểm LiDAR trước khi đưa vào mạng.',
      },
      {
        symptom: 'Trong trời mưa lớn hoặc sương mù, mạng phát hiện hàng loạt hộp giả (False Positives) ngay trước mũi xe',
        rootCause: 'Tia laser bị tán xạ bởi hạt nước mưa và khói xả tạo ra các cụm điểm nhiễu mật độ cao có cường độ phản xạ (intensity) thấp gần cảm biến.',
        engineeringFix: 'Bổ sung bộ lọc tiền xử lý Radius Outlier Removal / Low-Intensity Gate kết hợp huấn luyện với LiDAR Spray & Fog Augmentation.',
      },
    ],
  },
  P2_D07: {
    dayId: 'P2_D07',
    projectTitle: 'Theo Dấu Đa Đối Tượng 3D (3D MOT) & Dự Báo Quỹ Đạo Đa Phương Thức (Multi-Modal Motion Forecasting)',
    systemScaleSpec: 'Theo dấu 150+ tác nhân giao thông · Dự báo K = 6 quỹ đạo tương lai trong chân trời T_pred = 6.0 giây (60 bước)',
    latencyAndMemorySLA: [
      'Data Association (Hungarian + Mahalanobis/GIoU 3D) + Track Lifecycle Management <= 1.5 ms/frame.',
      'Vectorized Scene Transformer (HiVT / QCNet / Wayformer) dự báo đồng thời cho 64 tác nhân <= 12 ms.',
      'minADE_6 <= 0.65m · minFDE_6 <= 1.25m · Miss Rate @ 2m <= 11% · Tỷ lệ đổi ID (ID Switch) < 0.3%.',
    ],
    architectureDecisions: [
      {
        decision: 'Sử dụng chiến lược Liên kết Hai Giai Đoạn (Two-Stage Association - kiểu ByteTrack 3D): Giai đoạn 1 khớp các phát hiện điểm tự tin cao bằng 3D Mahalanobis/GIoU; Giai đoạn 2 cứu các quỹ đạo bị che khuất một phần bằng phát hiện điểm thấp',
        rationale: 'Khi một chiếc xe bị che khuất 70% bởi xe tải, điểm tự tin của Detector giảm từ 0.8 xuống 0.25; nếu dùng ngưỡng cứng 0.5 sẽ làm đứt gãy quỹ đạo (Track Fragmentation).',
        tradeoff: 'Cần kiểm soát chặt điều kiện khởi tạo quỹ đạo mới (chỉ khởi tạo từ phát hiện có score > 0.6 trong 3 khung liên tiếp) để tránh sinh quỹ đạo ma.',
      },
      {
        decision: 'Biểu diễn bản đồ đường cao phân giải (HD Map) và lịch sử quỹ đạo dưới dạng đồ thị vector quy tâm theo từng tác nhân (Agent-Centric Vectorized Graph)',
        rationale: 'Vector hoá thay thế hoàn toàn việc vẽ ảnh Rasterized BEV, giảm 10 lần chi phí tính toán và đảm bảo tính bất biến theo phép tịnh tiến - quay (SE(2) invariance).',
        tradeoff: 'Cần tính toán ma trận chuyển đổi hệ quy chiếu tương đối giữa các cặp tác nhân trong tầng Cross-Attention.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Tất cả K = 6 nhánh quỹ đạo dự báo đều chụm lại thành một đường duy nhất ở giữa ngã tư (Mode Collapse)',
        rootCause: 'Huấn luyện toàn bộ K nhánh bằng hàm lỗi trung bình hoặc cập nhật trọng số cho mọi nhánh như nhau khiến mạng hội tụ về kỳ vọng toán học (mean trajectory).',
        engineeringFix: 'Áp dụng hàm lỗi Winner-Takes-All (WTA): chỉ tính đạo hàm hồi quy vị trí trên nhánh k* có khoảng cách trung bình gần quỹ đạo thực tế nhất, kết hợp huấn luyện phân loại xác suất bằng Cross-Entropy và đa dạng hoá neo đích (Dense Goal Anchors).',
      },
      {
        symptom: 'Quỹ đạo dự báo của xe bên cạnh đi xuyên qua dải phân cách cứng hoặc va chạm phi vật lý với các xe khác',
        rootCause: 'Đầu ra của mạng nơ-ron là các tọa độ tự do (x_t, y_t) không bị ràng buộc bởi động học xe và hình học làn đường.',
        engineeringFix: 'Đưa lớp Kinematic Bicycle Layer vào đầu ra cuối (dự đoán gia tốc a_t và góc lái δ_t rồi tích phân ra x_t, y_t) và bổ sung hàm phạt Off-Road / Social Collision Loss trong quá trình huấn luyện.',
      },
    ],
  },
  P2_D08: {
    dayId: 'P2_D08',
    projectTitle: 'Kiến Trúc BEV & Hợp Nhất Đa Cảm Biến (Camera + LiDAR + Radar BEVFusion)',
    systemScaleSpec: '6 Camera Surround + 1 LiDAR 360° + 5 Radar tầm xa · Lưới BEV 200x200 (0.5m/ô) · Kháng lỗi suy giảm cảm biến',
    latencyAndMemorySLA: [
      'View Transformation (Fast-BEVPoolv2 / Spatio-Temporal Cross-Attention) <= 2.2 ms.',
      'Tổng thời gian chạy toàn bộ pipeline BEVFusion <= 22 ms trên nền tảng tính toán hợp nhất.',
      'Khi mất hoàn toàn tín hiệu LiDAR (hoặc Camera bị chói nắng), hệ thống vẫn duy trì > 70% hiệu năng nhận thức nhờ cơ chế Modality-Agnostic Fusion.',
    ],
    architectureDecisions: [
      {
        decision: 'Hợp nhất ở mức Đặc trưng trong Không gian Chung BEV (Middle Feature-Level BEV Fusion) thay vì hợp nhất đầu ra (Late Fusion) hay gắn màu lên điểm (Point Painting)',
        rationale: 'Camera giàu thông tin ngữ nghĩa dày đặc nhưng thiếu chiều sâu chính xác; LiDAR chính xác hình học 3D nhưng thưa; hợp nhất trong lưới BEV bảo toàn cả ngữ nghĩa lẫn hình học và cho phép suy luận tương tác không gian.',
        tradeoff: 'Nhạy cảm với sai số hiệu chuẩn ngoại tham (Extrinsic Calibration Drift) giữa Camera và LiDAR.',
      },
      {
        decision: 'Pre-compute chỉ số hình học Frustum-to-BEV (BEVPoolv2) khi khởi động và chỉ cập nhật động khi có bù trừ hiệu chuẩn',
        rationale: 'Loại bỏ việc tính toán lại phép chiếu 3D-2D ở mỗi khung hình, tăng tốc bước View Transformation lên hơn 15 lần so với LSS nguyên bản.',
        tradeoff: 'Cần cơ chế hiệu chỉnh trực tuyến (Online Extrinsic Offset Module) khi khung gầm xe bị rung lắc mạnh.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Sau vài tháng vận hành thực tế, hộp giới hạn 3D bị bóng đôi hoặc lệch khoảng 30–50cm tại khoảng cách 40m',
        rootCause: 'Giá đỡ camera bị lệch góc 0.3 độ do rung động cơ học và biến dạng nhiệt, làm đặc trưng Camera chiếu xuống BEV không còn trùng khớp với đặc trưng LiDAR.',
        engineeringFix: 'Tích hợp nhánh Deformable Cross-Modal Alignment (cho phép offset Δu, Δv học được trong lân cận nhỏ) và huấn luyện với Extrinsic Perturbation Augmentation (±1.5 độ quay, ±10cm tịnh tiến).',
      },
      {
        symptom: 'Mô hình phụ thuộc quá mức vào LiDAR (Modality Collapse), dẫn đến mAP sụp đổ về gần 0 khi LiDAR bị che bẩn',
        rootCause: 'Đặc trưng LiDAR dễ học hình học 3D hơn nhiều so với Camera, khiến nhánh Camera nhận gradient rất yếu trong quá trình đồng huấn luyện.',
        engineeringFix: 'Áp dụng Modality Dropout trong khi huấn luyện (30% xác suất tắt ngẫu nhiên nhánh LiDAR, 20% tắt Camera) kèm nhánh giám sát phụ độc lập (Auxiliary Head) cho từng cảm biến.',
      },
    ],
  },
  P2_D09: {
    dayId: 'P2_D09',
    projectTitle: 'Data Engine Quy Mô Lớn, Auto-Labeling 3D/4D & Vòng Lặp Active Learning',
    systemScaleSpec: 'Thu thập 100 TB dữ liệu thô/ngày · Lọc còn 2% kịch bản giá trị cao · Giảm 85% chi phí gán nhãn thủ công',
    latencyAndMemorySLA: [
      'Throughput của Offline 4D Auto-Labeler (sử dụng chuỗi toàn cục Quá khứ + Tương lai): 2.0 giây/khung hình trên Cloud GPU.',
      'Độ đồng thuận liên người gán nhãn (Inter-Annotator Agreement - IoU / Cohen Kappa) >= 0.92.',
      'Tỷ lệ phát hiện nhãn lỗi tự động (Confident Learning Audit Recall) >= 95% trước khi đưa vào tập Golden Validation.',
    ],
    architectureDecisions: [
      {
        decision: 'Sử dụng mô hình Offline Non-Causal 4D Teacher (nhìn cả quá khứ t-N đến tương lai t+N kết hợp Bundle Adjustment) để tự động gán nhãn cho mô hình Online Student',
        rationale: 'Một chiếc xe ở xa 90m tại thời điểm t rất khó gán nhãn, nhưng ở thời điểm t+3 giây nó đã tiến lại gần 20m với đám mây điểm dày đặc; truy vết ngược thời gian (backward tracking) giúp tạo nhãn 3D cực kỳ chính xác ở khoảng cách xa.',
        tradeoff: 'Đòi hỏi pipeline căn chỉnh bản đồ điểm 4D (4D Point Cloud Registration) tốn nhiều tài nguyên tính toán đám mây.',
      },
      {
        decision: 'Kết hợp điểm không chắc chắn (Epistemic Uncertainty / Disagreement) với phân cụm tâm lõi (Coreset Selection trên không gian Embedding) trong Active Learning',
        rationale: 'Nếu chỉ chọn các mẫu có Entropy cao nhất, hệ thống sẽ chọn toàn các khung hình bị nhoè hoặc nằm trong cùng 1 đoạn video lỗi, gây lãng phí ngân sách gán nhãn.',
        tradeoff: 'Cần duy trì cơ sở dữ liệu Vector (Vector DB) cho hàng chục triệu khung hình.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Sau 3 vòng lặp Active Learning + Auto-Labeling, mô hình bắt đầu bỏ sót hoàn toàn một số lớp hiếm hoặc xác nhận sai thành đúng (Confirmation Bias)',
        rootCause: 'Mô hình Teacher tự sinh nhãn giả (Pseudo-labels) có lỗi hệ thống, sau đó Student học lại chính lỗi đó làm khuếch đại độ tự tin sai lệch qua các thế hệ.',
        engineeringFix: 'Bắt buộc định tuyến mọi mẫu có sự bất đồng giữa Ensemble (Camera-only Teacher vs LiDAR-only Teacher) sang con người kiểm duyệt (Human-in-the-Loop) và giữ cố định tập Golden Set 100% do chuyên gia kiểm định.',
      },
      {
        symptom: 'Hiệu năng trên các kịch bản đuôi dài (Long-tail: xe cứu thương, người đẩy xe hàng, công trường) không cải thiện dù đã tăng gấp đôi tổng dữ liệu',
        rootCause: 'Lấy mẫu ngẫu nhiên hoặc theo độ không chắc chắn trung bình vẫn bị áp đảo bởi 99% cảnh đường phố thông thường.',
        engineeringFix: 'Sử dụng VLM / CLIP Text-to-Scene Mining để truy vấn ngữ nghĩa trực tiếp trên kho video thô ("construction cones at night", "overturned truck") nhằm khai thác đúng dữ liệu hiếm.',
      },
    ],
  },
  P2_D10: {
    dayId: 'P2_D10',
    projectTitle: 'Mô Hình Thị Giác - Ngôn Ngữ - Hành Động (VLM / VLA) & Kiến Trúc Hệ Thống Hai Tốc Độ (Dual-System)',
    systemScaleSpec: 'System 2 (VLM Reasoning 3B-7B @ 5 Hz) + System 1 (Flow Matching / Diffusion Action Expert @ 50 Hz) + Safety Shield @ 100 Hz',
    latencyAndMemorySLA: [
      'Thời gian phản hồi vòng lặp điều khiển tần số cao (System 1 Action Policy) <= 15 ms (đảm bảo điều khiển mượt ở 50 Hz).',
      'System 2 VLM suy luận ngữ cảnh phức tạp cập nhật token mục tiêu mỗi 200 ms nhờ INT4 AWQ Quantization + KV-Cache.',
      '0% vi phạm rào chắn an toàn động học nhờ lớp lọc Control Barrier Function (CBF) đặt ở cuối cùng.',
    ],
    architectureDecisions: [
      {
        decision: 'Thiết kế kiến trúc phân cấp Dual-System (System 2 VLM tần số thấp + System 1 Continuous Flow Matching / Action Chunking tần số cao) thay vì dùng LLM sinh trực tiếp từng lệnh điều khiển rời rạc',
        rationale: 'Autoregressive LLM giải mã tuần tự từng token mất 100–300ms và lượng tử hoá hành động thành 256 mức rời rạc gây rung giật (quantization jitter) cho cơ cấu chấp hành.',
        tradeoff: 'Cần đồng bộ hoá biểu diễn tiềm ẩn (latent goal conditioning) giữa System 2 và System 1.',
      },
      {
        decision: 'Dự đoán theo cụm hành động (Action Chunking kích thước H = 16 bước tương lai) kết hợp trung bình hoá hàm mũ theo thời gian (Temporal Ensembling)',
        rationale: 'Ngăn chặn hiện tượng hành vi không nhất quán giữa các bước thời gian liên tiếp và xử lý tốt các trạng thái dừng tạm thời (idle states) trong dữ liệu biểu diễn của con người.',
        tradeoff: 'Tăng nhẹ chiều đầu ra của mạng Flow Matching / Diffusion.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Mô hình VLM sinh ra giải thích bằng ngôn ngữ rất hợp lý ("Tôi đang dừng lại nhường đường cho người đi bộ") nhưng quỹ đạo hành động thực tế lại tăng tốc (Reasoning-Action Hallucination Disconnect)',
        rootCause: 'Nhánh sinh văn bản và nhánh sinh hành động không có ràng buộc nhân quả chặt chẽ; văn bản được sinh sau hoặc chỉ đóng vai trò nhánh phụ.',
        engineeringFix: 'Buộc đầu vào của Action Expert phải chú ý (Cross-Attend) trực tiếp lên các token ngữ nghĩa đã được neo vào tọa độ không gian 3D (Grounded 3D Spatial Tokens) thay vì văn bản tự do.',
      },
      {
        symptom: 'Độ trễ suy luận tăng vọt gấp 4 lần khi truyền nhiều khung hình lịch sử độ phân giải cao vào VLM',
        rootCause: 'Mỗi ảnh 448x448 tạo ra 1,024 visual tokens; 4 khung hình tạo ra > 4,000 tokens làm bùng nổ chi phí Self-Attention O(L^2) trong LLM.',
        tradeoff: '',
        engineeringFix: 'Sử dụng bộ nén Perceiver Resampler / Q-Former hoặc Spatial-Temporal Token Merging (ToMe / Pixel Shuffle 2x2) để nén mỗi khung hình xuống còn 64–128 visual tokens.',
      },
    ],
  },
  P2_D11: {
    dayId: 'P2_D11',
    projectTitle: 'Tái Tạo Cảnh 3D Chân Thực (3D Gaussian Splatting / NeRF) & Sinh Dữ Liệu Ngược Chiều (Counterfactual Simulation)',
    systemScaleSpec: 'Tái tạo Digital Twin từ log thực tế · Kết xuất 3DGS > 100 FPS · Thu hẹp khoảng cách Sim-to-Real cho các kịch bản nguy hiểm',
    latencyAndMemorySLA: [
      'Tốc độ kết xuất cảnh động 3D Gaussian Splatting (Scene Graph: Background + Dynamic Rigid/Deformable Actors) >= 60 FPS ở độ phân giải 1080p.',
      'Sai số hình học bề mặt LiDAR tái tạo (Chamfer Distance) < 4.5 cm và độ chính xác dự đoán tia mất phản xạ (Raydrop Accuracy) > 90%.',
      'Khoảng cách phân phối đặc trưng (FID / Maximum Mean Discrepancy) giữa ảnh thực và ảnh tái tạo giảm > 70% so với đồ hoạ raster truyền thống.',
    ],
    architectureDecisions: [
      {
        decision: 'Tách biệt đồ thị cảnh (Decomposed Scene Graph 3DGS): Nền tĩnh (Static Background Gaussians) riêng và các nút Tác nhân động (Dynamic Actor Gaussian Nodes) gắn vào khung xương/hộp 3D riêng',
        rationale: 'Cho phép chèn thêm phương tiện mới, xoá phương tiện cũ hoặc thay đổi quỹ đạo của cả xe chủ lẫn các xe xung quanh để tạo kịch bản nguy hiểm (Counterfactual Safety Scenarios) từ một log bình thường.',
        tradeoff: 'Cần xử lý bóng đổ động (Dynamic Shadow Casting) và chiếu sáng nhất quán giữa vật thể chèn vào và mặt đường.',
      },
      {
        decision: 'Mô phỏng đồng thời đặc tính vật lý của cảm biến (Camera Rolling Shutter, Lens Distortion, LiDAR Beam Divergence & Raydrop Network)',
        rationale: 'Nếu chỉ kết xuất ảnh RGB lý tưởng bằng Pinhole Camera, mô hình học được sẽ thất bại khi gặp biến dạng thấu kính góc rộng (Fisheye) và nhiễu mất tia LiDAR trên bề mặt kính/nhựa đường ướt.',
        tradeoff: 'Cần калиб (calibrate) chính xác mô hình nội tham của từng loại cảm biến trên đội xe.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Khi dịch chuyển quỹ đạo xe chủ sang làn bên cạnh 2.5 mét trong cảnh 3DGS/NeRF, ảnh kết xuất xuất hiện các đám mây mờ lơ lửng (Floaters) và biến dạng kết cấu mặt đường',
        rootCause: 'Camera thực tế lúc thu thập chỉ đi theo 1 đường thẳng duy nhất (collinear trajectory), dẫn đến bài toán suy biến góc nhìn mới (Novel View Extrapolation Degeneracy).',
        engineeringFix: 'Áp dụng Depth/Normal Priors từ LiDAR (hoặc Foundation Depth Model), bổ sung ràng buộc phẳng cho mặt đường (Planar Road Regularization) và sử dụng Diffusion Prior để khôi phục vùng khuất.',
      },
      {
        symptom: 'Mô hình đạt 98% mAP khi huấn luyện thuần trên dữ liệu mô phỏng nhưng giảm còn 55% khi chạy trên đường thực (Sim-to-Real Gap)',
        rootCause: 'Mạng nơ-ron học vẹt các đặc trưng tần số cao nhân tạo của trình kết xuất (rendering artifacts) thay vì hình dạng vật lý bất biến.',
        engineeringFix: 'Phối trộn dữ liệu theo tỷ lệ vàng (Co-training 80% Real + 20% Targeted Synthetic Long-tail) kết hợp Domain-Adversarial Feature Alignment.',
      },
    ],
  },
  P2_D12: {
    dayId: 'P2_D12',
    projectTitle: 'Kiểm Thử Vòng Kín (Closed-Loop Evaluation), Tác Nhân Phản Ứng (Reactive NPCs) & Cổng An Toàn Trước Triển Khai',
    systemScaleSpec: '10,000 kịch bản kiểm thử tự động trên CI/CD · Tác nhân giao thông thông minh (IDM + Neural Reactive Agents) · Safety Release Gate',
    latencyAndMemorySLA: [
      'Chạy song song 10,000 kịch bản đóng vòng (mỗi kịch bản 20 giây) hoàn tất trong < 45 phút trên cụm Cloud Simulation.',
      'Bắt buộc đạt 0% At-Fault Collision Rate trên bộ kịch bản chuẩn (Golden Safety Suite) trước khi cho phép phát hành OTA lên đội xe.',
      'Chênh lệch hành vi giữa môi trường mô phỏng và chạy thực trên xe (Sim-to-Real Behavioral Correlation) đạt > 90%.',
    ],
    architectureDecisions: [
      {
        decision: 'Đánh giá hệ thống điều khiển và lập kế hoạch (Planner/VLA) bằng Vòng Kín Có Tác Nhân Phản Ứng (Closed-Loop with Reactive NPCs) thay vì chỉ chấm điểm Open-Loop L2 Displacement Error',
        rationale: 'Open-loop L2 thấp chỉ chứng tỏ mô hình nội suy mượt theo hành động quá khứ (Causal Confusion), nhưng hoàn toàn không đo được khả năng tự phục hồi khi sai số tích luỹ đẩy xe lệch khỏi tâm làn đường.',
        tradeoff: 'Chi phí xây dựng trình mô phỏng vòng kín và mô hình hành vi cho các phương tiện xung quanh cao hơn nhiều so với tính MSE trên log tĩnh.',
      },
      {
        decision: 'Kết hợp kịch bản đối kháng có kiểm soát (Controllable Adversarial Scenario Generation) vào cổng kiểm thử CI/CD',
        rationale: 'Lái xe bình thường hàng nghìn km rất hiếm khi gặp tình huống tạt đầu gấp; tối ưu hoá quỹ đạo của NPC để chủ động tìm điểm yếu của Planner nhưng vẫn ràng buộc trong giới hạn vật lý hợp lệ để đánh giá biên độ an toàn.',
        tradeoff: 'Cần bộ lọc trách nhiệm va chạm (Responsibility-Sensitive Safety - RSS) để phân biệt va chạm do lỗi của xe chủ hay va chạm bất khả kháng.',
      },
    ],
    failureModesAndFixes: [
      {
        symptom: 'Trong thử nghiệm Log-Replay không phản ứng, xe chủ giảm tốc hơi sớm hơn log gốc 0.5 giây và bị xe phía sau đâm xuyên qua từ phía đuôi',
        rootCause: 'Xe phía sau trong bản ghi log tĩnh vẫn đi theo tọa độ (x_t, y_t) cũ mà không biết rằng xe chủ ở phía trước đã giảm tốc độ (Non-Reactive Ghost Rear-End Collision).',
        engineeringFix: 'Chuyển các phương tiện theo sau sang chế độ điều khiển phản ứng dọc làn bằng Intelligent Driver Model (IDM) hoặc Closed-Loop Neural Traffic Sim (Waymax / SMART).',
      },
      {
        symptom: 'Mô hình Planner học bắt chước (Imitation Learning) bị tê liệt không chịu phanh khi tiến sát chướng ngại vật (Inertia Problem / Causal Confusion)',
        rootCause: 'Trong tập dữ liệu chuyên gia, vận tốc ở khung t-1 tương quan 99% với vận tốc ở khung t; mô hình học đường tắt bằng cách sao chép vận tốc quá khứ thay vì nhìn chướng ngại vật phía trước.',
        engineeringFix: 'Áp dụng History Dropout / DAgger (Dataset Aggregation), thêm nhiễu vào trạng thái quá khứ khi huấn luyện và đánh giá nghiêm ngặt bằng Closed-Loop Driving Score.',
      },
    ],
  },
};
