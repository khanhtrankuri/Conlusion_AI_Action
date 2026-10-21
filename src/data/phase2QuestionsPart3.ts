import { QuizQuestion } from '../types/curriculum';

export const PHASE2_QUESTIONS_PART3: QuizQuestion[] = [
  // ==================== DAY 7: TRACKING AND FORECASTING ====================
  {
    id: 'P2_D07_Q01',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Multi-Object Tracking — ByteTrack Two-Stage Association',
    difficulty: 'Thực chiến',
    question:
      'Điểm đột phá của thuật toán ByteTrack giúp giảm mạnh hiện tượng đứt quãng quỹ đạo (Track Fragmentation) và nhảy mã định danh (ID Switch) khi vật thể bị che khuất một phần là gì?',
    options: [
      'A. Không vứt bỏ ngay các hộp phát hiện có điểm tự tin thấp (`τ_low ≤ score < τ_high`, ví dụ 0.1 đến 0.5) mà đưa chúng vào Bước ghép cặp thứ 2 (Second Association) để nối riêng với những quỹ đạo đang tồn tại (Active Tracks) chưa tìm được cặp ở Bước 1.',
      'B. Tăng ngưỡng điểm tự tin lên 0.99 để chỉ giữ lại các hộp hoàn hảo nhất.',
      'C. Không sử dụng Bộ lọc Kalman hay thuật toán Hungarian.',
      'D. Gán chung một mã ID = 1 cho tất cả các phương tiện trên đường.'
    ],
    answer: 'A',
    hint: 'Khi một người đi bộ bị xe khác che khuất một nửa, điểm confidence của Detector tụt từ 0.85 xuống 0.25.',
    formulaRef: 'Match #1: D_high ↔ T_active  ──▶  Match #2: D_low ↔ T_remaining',
    explanation:
      'Đáp án đúng là A. Các tracker cũ lọc bỏ mọi box có điểm < 0.5 ngay từ đầu khiến quỹ đạo bị đứt mỗi khi vật thể bị che khuất nhẹ. ByteTrack nhận ra rằng một box điểm thấp nằm khớp đúng vào vị trí dự đoán Kalman của một Track đang có sẵn nhiều khả năng là vật thể thật bị che khuất chứ không phải nhiễu nền.',
    'A explanation': 'Đúng: Ghép cặp phân tầng 2 bước tận dụng tối đa các phát hiện bị suy giảm độ tự tin do che khuất.',
    'B explanation': 'Sai: Đặt ngưỡng 0.99 sẽ làm mất dấu hầu hết vật thể.',
    'C explanation': 'Sai: ByteTrack vẫn dùng Kalman Filter để dự đoán vị trí và Hungarian để ghép cặp.',
    'D explanation': 'Sai: Mỗi đối tượng phải có một Track ID duy nhất.'
  },
  {
    id: 'P2_D07_Q02',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Tracking Metrics — MOTA vs HOTA',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao chỉ số HOTA (`HOTA = √(DetA × AssA)`) lại được đánh giá là toàn diện và công bằng hơn chỉ số MOTA truyền thống (`MOTA = 1 - ∑(FN + FP + IDSW) / ∑GT`) trong bài toán Multi-Object Tracking?',
    options: [
      'A. Vì trong MOTA, số lượng lỗi phát hiện (FN + FP) thường lớn gấp hàng chục lần số lần nhảy ID (IDSW) nên điểm MOTA bị chi phối nặng bởi chất lượng Detector; còn HOTA lấy trung bình nhân hình học cân bằng giữa Độ chính xác Phát hiện (DetA) và Độ chính xác Liên kết toàn cục (AssA).',
      'B. Vì MOTA không tính đến các vật thể bị bỏ sót (False Negatives).',
      'C. Vì HOTA luôn cho điểm bằng 0 đối với mọi thuật toán.',
      'D. Vì HOTA chỉ tính trên khung hình đầu tiên của video.'
    ],
    answer: 'A',
    hint: 'Trung bình nhân √(DetA · AssA) đòi hỏi cả khả năng tìm đúng vật thể lẫn khả năng giữ đúng ID xuyên suốt thời gian đều phải cao.',
    formulaRef: 'HOTA_α = √( DetA_α · AssA_α )',
    explanation:
      'Đáp án đúng là A. MOTA cộng tuyến tính FN, FP và IDSW, đồng thời chỉ phạt tại đúng khung hình xảy ra đổi ID mà không phạt việc gán sai ID kéo dài sau đó. HOTA đo lường mức độ trùng khớp của cả quỹ đạo dài hạn thông qua AssA.',
    'A explanation': 'Đúng: HOTA cân bằng hoàn hảo giữa Detection và Long-term Association.',
    'B explanation': 'Sai: MOTA có tính FN trong tử số.',
    'C explanation': 'Sai: HOTA nằm trong khoảng [0, 1] (0% đến 100%).',
    'D explanation': 'Sai: HOTA tích hợp trên toàn bộ chuỗi video và nhiều ngưỡng IoU α.'
  },
  {
    id: 'P2_D07_Q03',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Motion Forecasting — Multi-Modality & Winner-Takes-All Loss',
    difficulty: 'Chuyên sâu',
    question:
      'Tại một ngã tư, chiếc xe phía trước có 50% khả năng rẽ trái và 50% khả năng rẽ phải. Nếu ta ép mô hình Dự báo quỹ đạo (Motion Forecasting) chỉ xuất ra K = 1 quỹ đạo duy nhất và huấn luyện bằng hàm L2 (MSE) Loss, mô hình sẽ dự đoán như thế nào và cách khắc phục chuẩn là gì?',
    options: [
      'A. Mô hình sẽ dự đoán trung bình cộng của hai nhánh — tức là một quỹ đạo đi thẳng đâm vào dải phân cách ở giữa ngã tư (Mode Averaging)! Khắc phục bằng cách dự đoán K = 6 kịch bản kèm xác suất và dùng hàm Loss Winner-Takes-All (chỉ tính đạo hàm hồi quy trên nhánh k* gần quỹ đạo thật nhất).',
      'B. Mô hình sẽ tự động chọn đúng nhánh rẽ trái với xác suất 100%.',
      'C. Hàm L2 Loss không bị ảnh hưởng bởi phân phối đa đỉnh.',
      'D. Khắc phục bằng cách xóa bỏ bản đồ làn đường HD Map.'
    ],
    answer: 'A',
    hint: 'Nghiệm tối ưu của hàm mục tiêu E[||Y - Ŷ||²] chính là kỳ vọng toán học E[Y] (trung bình cộng các đỉnh của phân phối).',
    formulaRef: 'minADE_K = min_{k ∈ 1..K} (1/T) ∑_{t=1}^T || Ŷ_t^{(k)} - Y_t^{GT} ||_2',
    explanation:
      'Đáp án đúng là A. Đây là lý do cốt lõi khiến bài toán dự báo quỹ đạo bắt buộc phải được thiết kế đa phương thức (Multi-modal: dự đoán K mode + xác suất p_k) và huấn luyện bằng Variety / Winner-Takes-All Loss kết hợp NLL.',
    'A explanation': 'Đúng: Giải thích chính xác hiện tượng trung bình hóa mode gây nguy hiểm và giải pháp Winner-Takes-All.',
    'B explanation': 'Sai: MSE Loss luôn kéo nghiệm về trung bình trọng tâm của các khả năng.',
    'C explanation': 'Sai: MSE Loss giả định phân phối đơn đỉnh Gaussian (Unimodal).',
    'D explanation': 'Sai: Bản đồ làn đường HD Map lại càng cần thiết để hướng dẫn các nhánh rẽ hợp lệ.'
  },
  {
    id: 'P2_D07_Q04',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Coordinate Normalization — Target-Centric Representation',
    difficulty: 'Thực chiến',
    question:
      'Trong các kiến trúc dự báo quỹ đạo hiện đại (như VectorNet, HiVT, QCNet), tại sao trước khi đưa lịch sử quỹ đạo của tác nhân thứ i và bản đồ xung quanh vào mạng, người ta luôn biến đổi về "Hệ tọa độ gắn với chính tác nhân đó" (Agent-Centric / Target-Centric Normalization tại t = 0)?',
    options: [
      'A. Dịch gốc tọa độ (0, 0) về vị trí hiện tại của tác nhân i và xoay trục X trùng với hướng đầu xe của tác nhân i tại t = 0 giúp biểu diễn đầu vào bất biến với vị trí và góc hướng tuyệt đối trên bản đồ (Roto-translation Invariance), giúp mô hình học nhanh và tổng quát hóa sang các giao lộ mới tốt hơn.',
      'B. Để làm cho vận tốc của mọi phương tiện trên đường đều bằng 0.',
      'C. Vì máy tính không thể lưu trữ các số tọa độ lớn hơn 10.',
      'D. Để xóa bỏ thông tin về các phương tiện lân cận.'
    ],
    answer: 'A',
    hint: 'Một chiếc xe rẽ phải ở giao lộ hướng Bắc hay rẽ phải ở giao lộ hướng Đông đều có cùng một hình học cục bộ trong hệ quy chiếu gắn với chính chiếc xe đó.',
    explanation:
      'Đáp án đúng là A. Nếu để tọa độ toàn cục (Global/Ego coordinates), cùng một hành vi "rẽ phải" ở 4 hướng ngã tư sẽ có tọa độ số học hoàn toàn khác nhau. Chuẩn hóa Target-Centric đưa mọi tác nhân về cùng một tư thế chuẩn tại gốc `(0, 0)` hướng `0°` lúc `t = 0`.',
    'A explanation': 'Đúng: Đảm bảo tính bất biến tịnh tiến và xoay (SE(2) Invariance) cho từng tác nhân được dự báo.',
    'B explanation': 'Sai: Vận tốc độ lớn vẫn được giữ nguyên trong các vector lịch sử.',
    'C explanation': 'Sai: Máy tính lưu số lớn bình thường nhưng mạng nơ-ron tổng quát hóa kém nếu không chuẩn hóa hệ quy chiếu.',
    'D explanation': 'Sai: Các phương tiện lân cận vẫn được giữ lại và biểu diễn bằng vị trí/vận tốc tương đối so với tác nhân i.'
  },
  {
    id: 'P2_D07_Q05',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Track Lifecycle Management — Birth, Coasting & Deletion',
    difficulty: 'Cơ bản',
    question:
      'Trong bộ quản lý vòng đời quỹ đạo (Track Lifecycle Management), hai siêu tham số `N_init` (ví dụ 3 frames) và `Max_Age` (ví dụ 30 frames) có vai trò đối lập nhưng bổ trợ nhau như thế nào?',
    options: [
      'A. `N_init` yêu cầu đối tượng phải được phát hiện liên tiếp ít nhất N_init khung hình mới được xác nhận là Track chính thức (để lọc bỏ nhiễu báo giả FP); còn `Max_Age` cho phép giữ lại và ngoại suy quán tính một Track đã xác nhận tối đa Max_Age khung hình khi bị mất dấu tạm thời trước khi xóa hẳn.',
      'B. `N_init` là số lượng xe tối đa trên đường, còn `Max_Age` là tuổi thọ của cảm biến LiDAR.',
      'C. Cả hai tham số đều nên đặt bằng 0 trong mọi trường hợp.',
      'D. `Max_Age` dùng để xóa ngay lập tức mọi phương tiện vừa dừng đèn đỏ.'
    ],
    answer: 'A',
    hint: 'Trạng thái của một Track đi qua: Tentative (Thử nghiệm < N_init) → Confirmed (Chính thức) → Coasting/Occluded (Mất dấu tạm thời ≤ Max_Age) → Deleted.',
    explanation:
      'Đáp án đúng là A. Đặt `N_init = 3` ngăn một điểm nhiễu xuất hiện chớp nhoáng 1 frame tạo ra chướng ngại vật ảo làm xe phanh gấp; đặt `Max_Age = 20–30` giúp xe không quên mất người đi bộ tạm thời khuất sau cột điện trong 1–2 giây.',
    'A explanation': 'Đúng: Cân bằng giữa việc chống khởi tạo quỹ đạo giả và việc duy trì quỹ đạo qua giai đoạn bị che khuất.',
    'B explanation': 'Sai: Đây là các ngưỡng số lượng khung hình trong thuật toán Tracking.',
    'C explanation': 'Sai: Đặt bằng 0 sẽ gây tràn ngập Track giả và đứt ID liên tục.',
    'D explanation': 'Sai: Phương tiện dừng đèn đỏ vẫn được phát hiện bình thường nên không bị xóa.'
  },
  {
    id: 'P2_D07_Q06',
    phase: 'phase2',
    day: 'P2_D07',
    day_title: 'Day 7: Tracking and Forecasting',
    topic: 'Forecasting Representation — VectorNet vs Rasterized BEV',
    difficulty: 'Thực chiến',
    question:
      'Tại sao các mô hình dự báo quỹ đạo thế hệ mới (như VectorNet, LaneGCN, QCNet) lại chuyển sang biểu diễn bản đồ HD Map và lịch sử quỹ đạo dưới dạng tập hợp các đường gấp khúc vector (Vectorized Polylines) thay vì vẽ tất cả ra một bức ảnh màu nhiều kênh (Rasterized BEV Image) rồi chạy CNN?',
    options: [
      'A. Vì ảnh Raster bị mất độ chính xác tọa độ do rời rạc hóa pixel, lãng phí >90% phép tính tích chập vào các vùng nền trống và có trường nhìn cố định; trong khi biểu diễn đồ thị Vector (Polylines + Graph Attention) bảo toàn tọa độ liên tục chính xác tuyệt đối, gọn nhẹ và nắm bắt trực tiếp cấu trúc liên thông của làn đường.',
      'B. Vì CNN không thể xử lý được ảnh có nhiều hơn 3 kênh.',
      'C. Vì biểu diễn Vector không cần sử dụng thông tin bản đồ làn đường.',
      'D. Vì ảnh Raster chỉ vẽ được các đường thẳng chứ không vẽ được đường cong.'
    ],
    answer: 'A',
    hint: 'Tâm làn đường và quỹ đạo xe bản chất là các đường cong 1 chiều thưa trong không gian 2D.',
    explanation:
      'Đáp án đúng là A. Vẽ bản đồ ra ảnh 500×500 rồi chạy ResNet vừa tốn hàng tỷ FLOPs vào các pixel trống vừa làm mờ cấu trúc đồ thị (làn nào được phép rẽ sang làn nào). Biểu diễn VectorNet coi mỗi vạch làn đường và mỗi lịch sử xe là một chuỗi đoạn thẳng vector đưa thẳng vào Graph Neural Network / Transformer.',
    'A explanation': 'Đúng: Nêu bật 3 ưu thế vượt trội của Vectorized Representation so với Rasterization.',
    'B explanation': 'Sai: CNN xử lý bao nhiêu kênh đầu vào cũng được.',
    'C explanation': 'Sai: VectorNet mã hóa trực tiếp toàn bộ bản đồ HD Map dưới dạng các polyline.',
    'D explanation': 'Sai: Đường cong được xấp xỉ chính xác bằng chuỗi các đoạn vector ngắn nối tiếp.'
  },

  // ==================== DAY 8: BEV & SENSOR FUSION ====================
  {
    id: 'P2_D08_Q01',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: 'View Transformation — Lift-Splat-Shoot (LSS) vs BEVFormer',
    difficulty: 'Chuyên sâu',
    question:
      'Sự khác biệt căn bản về hướng biến đổi không gian giữa hai trường phái chuyển đổi từ ảnh đa Camera 2D sang không gian 3D/BEV là Lift-Splat-Shoot (LSS / BEVDet) và BEVFormer là gì?',
    options: [
      'A. LSS đi theo hướng Bottom-Up ("Push"): dự đoán phân phối xác suất độ sâu rời rạc D cho mỗi pixel 2D để nâng thành đám mây đặc trưng Frustum rồi cộng dồn xuống lưới BEV; còn BEVFormer đi theo hướng Top-Down ("Pull"): khởi tạo các BEV Queries trên lưới mặt đất, nâng lên các điểm trụ 3D, chiếu xuống các ảnh 2D qua ma trận camera rồi dùng Deformable Cross-Attention kéo đặc trưng lên.',
      'B. LSS chỉ sử dụng dữ liệu LiDAR, còn BEVFormer chỉ sử dụng dữ liệu Radar.',
      'C. Cả hai phương pháp đều giả định mọi vật thể trong thế giới có chiều cao Z = 0 như phép chiếu Homography.',
      'D. BEVFormer không cần biết ma trận nội tham số K và ngoại tham số [R|t] của camera.'
    ],
    answer: 'A',
    hint: 'LSS: 2D Pixel × Depth Distribution → 3D Frustum → BEV Splat (Push). BEVFormer: 3D BEV Pillar Reference Points → Project to 2D Image → Deformable Attention (Pull).',
    formulaRef: 'LSS: f_3D(u,v,d) = α_d(u,v) · f_2D(u,v)   |   BEVFormer: SCA(Q_p, P(p, i, j), F_t^i)',
    explanation:
      'Đáp án đúng là A. Đây là hai trụ cột kiến trúc của Camera-to-BEV hiện đại: nhánh LSS (BEVDet, BEVDepth, BEVFusion) cực nhanh khi kết hợp CUDA BEV Pooling và giám sát độ sâu từ LiDAR; nhánh BEVFormer linh hoạt trong việc tổng hợp ngữ cảnh dày đặc cho cả vật thể lẫn phân vùng làn đường.',
    'A explanation': 'Đúng: Phân biệt rõ cơ chế Bottom-Up Depth Lifting (Push) và Top-Down Query Projection (Pull).',
    'B explanation': 'Sai: Cả hai đều là phương pháp biến đổi từ đa Camera sang BEV.',
    'C explanation': 'Sai: Chỉ có Inverse Perspective Mapping (IPM) cổ điển mới giả định mặt đất phẳng Z = 0.',
    'D explanation': 'Sai: BEVFormer dùng trực tiếp K và [R|t] trong hàm chiếu P(p, i, j) để tìm điểm tham chiếu trên từng camera.'
  },
  {
    id: 'P2_D08_Q02',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: 'Multi-Modal Fusion — Why BEVFusion Outperforms Point-Level Painting',
    difficulty: 'Thực chiến',
    question:
      'Tại sao kiến trúc hợp nhất trên không gian BEV (BEVFusion) lại bảo toàn thông tin của cả Camera và LiDAR tốt hơn nhiều so với phương pháp chiếu điểm LiDAR lên ảnh để lấy đặc trưng (Point-Painting) hoặc chiếu ảnh độ sâu sang điểm?',
    options: [
      'A. Vì đám mây điểm LiDAR rất thưa (chỉ < 5% số pixel trên ảnh camera có tia LiDAR chiếu trúng), nên nếu gắn đặc trưng Camera vào điểm LiDAR thì 95% thông tin ngữ nghĩa dày đặc của ảnh (vạch kẻ đường, biển báo, vật thể xa) sẽ bị vứt bỏ; hợp nhất trên lưới BEV chung giữ trọn vẹn cả mật độ ngữ nghĩa của Camera lẫn hình học chính xác của LiDAR.',
      'B. Vì BEVFusion xóa bỏ hoàn toàn nhánh xử lý LiDAR lúc suy luận.',
      'C. Vì Point-Painting không sử dụng ma trận hiệu chuẩn giữa hai cảm biến.',
      'D. Vì trên mặt phẳng BEV các vật thể ở gần có kích thước lớn gấp 100 lần các vật thể ở xa.'
    ],
    answer: 'A',
    hint: 'So sánh "Sensory Asymmetry": Camera cực đặc về ngữ nghĩa nhưng thiếu độ sâu; LiDAR chính xác về 3D nhưng cực thưa.',
    formulaRef: 'F_BEV^fused = Conv_Encoder( Concat( F_BEV^Camera, F_BEV^LiDAR ) )',
    explanation:
      'Đáp án đúng là A. Bài báo BEVFusion (MIT / Lab) chỉ ra rằng việc ép chiếu từ dạng đặc (Camera) sang dạng thưa (LiDAR) gây mất mát 95% đặc trưng ngữ nghĩa (Semantic Loss), còn ép chiếu từ LiDAR sang mặt phẳng phối cảnh Camera lại làm méo cấu trúc hình học 3D. Không gian BEV là mẫu số chung bảo toàn cả hai.',
    'A explanation': 'Đúng: Giải thích sâu sắc bài toán bất đối xứng mật độ giữa Camera và LiDAR.',
    'B explanation': 'Sai: BEVFusion kết hợp song song cả hai nhánh Camera và LiDAR.',
    'C explanation': 'Sai: Mọi phép hợp nhất đều cần ma trận hiệu chuẩn ngoại tham số.',
    'D explanation': 'Sai: Trên mặt phẳng BEV, kích thước vật lý của vật thể được bảo toàn đồng nhất ở mọi khoảng cách.'
  },
  {
    id: 'P2_D08_Q03',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: 'Sensor Characteristics — Camera vs LiDAR vs Radar',
    difficulty: 'Cơ bản',
    question:
      'Trong bộ ba cảm biến chủ đạo của xe tự hành (Camera, LiDAR, Radar sóng milimet), ưu thế vật lý độc nhất của cảm biến Radar giúp bổ sung cho cả Camera và LiDAR là gì?',
    options: [
      'A. Đọc được chữ viết và màu sắc đèn giao thông ở độ phân giải 8K.',
      'B. Bước sóng milimet dài giúp xuyên qua mưa lớn, sương mù, bụi mù, tầm nhìn xa tới >200m và đo trực tiếp vận tốc xuyên tâm tức thời (`v_r`) của mục tiêu chỉ trong 1 khung hình duy nhất nhờ hiệu ứng dịch tần số Doppler.',
      'C. Tạo ra đám mây điểm dày đặc hàng triệu điểm mỗi giây với độ chính xác milimét.',
      'D. Không bao giờ bị nhiễu phản xạ đa đường (multipath clutter) từ mặt đường kim loại.'
    ],
    answer: 'B',
    hint: 'Camera và LiDAR dùng ánh sáng khả kiến / cận hồng ngoại (bước sóng ~905nm–1550nm) bị tán xạ bởi giọt nước mưa/sương mù và phải cần ít nhất 2 khung hình mới suy ra vận tốc.',
    formulaRef: 'f_Doppler = 2 · v_radial · f_0 / c',
    explanation:
      'Đáp án đúng là A? Không, đáp án đúng là B! Sóng điện từ tần số 77 GHz (bước sóng ~3.9 mm) lớn hơn nhiều kích thước hạt sương mù và mưa nên hầu như không bị suy hao thời tiết, đồng thời hiệu ứng Doppler cho vận tốc xuyên tâm trực tiếp ngay ở lần quét đầu tiên.',
    'A explanation': 'Sai: Chỉ có Camera mới đọc được màu sắc và chữ viết.',
    'B explanation': 'Đúng: Hoạt động bền bỉ trong thời tiết khắc nghiệt và đo vận tốc Doppler tức thời.',
    'C explanation': 'Sai: Độ phân giải góc của Radar thấp hơn nhiều so với LiDAR.',
    'D explanation': 'Sai: Nhược điểm của Radar chính là nhiễu phản xạ đa đường và độ phân giải góc thấp.'
  },
  {
    id: 'P2_D08_Q04',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: 'Calibration Sensitivity — Extrinsic Pitch Error',
    difficulty: 'Thực chiến',
    question:
      'Một camera gắn trên nóc xe nhìn về phía trước. Nếu sau một thời gian vận hành qua đường xóc, giá đỡ camera bị lệch góc chúc/ngẩng (Pitch angle error `Δθ = 0.5° ≈ 0.0087 rad`) mà chưa được hiệu chuẩn lại (Online Auto-Calibration), một điểm ở khoảng cách `D = 60 mét` phía trước sẽ bị lệch cao độ/vị trí khoảng bao nhiêu khi chiếu giữa 3D và 2D?',
    options: [
      'A. Chỉ lệch khoảng 0.5 milimét, không ảnh hưởng gì.',
      'B. Độ lệch cao độ ở khoảng cách 60m là `Δz ≈ D · tan(0.5°) ≈ 60 × 0.0087 ≈ 0.52 mét` (và nếu chiếu xuống mặt đường phẳng từ độ cao camera 1.5m thì khoảng cách dọc trên BEV có thể lệch từ 5 đến 15 mét!).',
      'C. Góc lệch chỉ ảnh hưởng tới các vật thể ở cách xe dưới 1 mét.',
      'D. Ma trận nội tham số K tự động triệt tiêu mọi sai số góc gắn kết bên ngoài.'
    ],
    answer: 'B',
    hint: 'Sai số vị trí do lệch góc quay tăng tuyến tính với khoảng cách D: Δh = D · Δθ (rad), và khi giao cắt với mặt đất góc nông thì sai số khoảng cách dọc bị khuếch đại theo 1/tan(α).',
    formulaRef: 'Δz ≈ D · Δθ_rad = 60 × (0.5 × π / 180) ≈ 0.524 m',
    explanation:
      'Đáp án đúng là B. Đây là thách thức kỹ thuật thực tế lớn nhất của Sensor Fusion và Camera-to-BEV: sai số góc quay ngoại tham số `R_{c←l}` dù rất nhỏ (`0.3°–0.5°`) khi nhân với cánh tay đòn 60–80 mét sẽ làm tia nhìn lệch hơn nửa mét theo chiều đứng và lệch hàng chục mét dọc theo mặt đường.',
    'A explanation': 'Sai: Nhầm lẫn giữa góc và khoảng cách ở xa.',
    'B explanation': 'Đúng: Tính toán hình học chính xác cho thấy tầm quan trọng sống còn của Online Extrinsic Calibration và BEV Alignment.',
    'C explanation': 'Sai: Càng ở xa cảm biến, sai số do lệch góc càng bị nhân bội lớn.',
    'D explanation': 'Sai: Nội tham số K nằm bên trong ống kính, không biết được việc giá đỡ bên ngoài bị lệch.'
  },
  {
    id: 'P2_D08_Q05',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: '3D Occupancy Networks — Open-Set Obstacle Perception',
    difficulty: 'Thực chiến',
    question:
      'Tại sao các hệ thống tự hành hiện đại lại bổ sung "3D Occupancy Network" (dự đoán trạng thái chiếm chỗ + ngữ nghĩa của từng ô Voxel 3D trong không gian) bên cạnh mô hình 3D Bounding Box truyền thống?',
    options: [
      'A. Vì 3D Bounding Box bị giới hạn bởi tập danh mục đóng (Closed-set) và hình khối hộp chữ nhật cứng nhắc, trong khi 3D Occupancy biểu diễn chính xác hình học của mọi vật thể có hình dạng bất kỳ (như tay cẩu vươn ra, xe chở cây đổ, đá tảng rơi trên đường) giúp xe tránh va chạm ngay cả với vật thể lạ chưa từng được gán nhãn tên lớp.',
      'B. Vì 3D Occupancy không cần dùng mạng nơ-ron sâu.',
      'C. Vì 3D Bounding Box không thể biểu diễn được xe hơi đi thẳng.',
      'D. Để giảm số chiều không gian từ 3D xuống 1D.'
    ],
    answer: 'A',
    hint: 'Để tránh đâm vào một vật cản lạ giữa đường, câu hỏi quan trọng nhất là "Ô không gian phía trước có bị chiếm chỗ (Occupied) hay không?" chứ không phải "Vật đó tên gọi là gì?".',
    explanation:
      'Đáp án đúng là A. Hộp chữ nhật 3D không thể mô tả phần nhô ra của xe công trình hay rào chắn hình chữ L, và các bộ phát hiện tập đóng dễ bỏ sót vật thể lạ (Out-of-distribution). 3D Occupancy giải quyết triệt để bài toán hình học tổng quát và vật cản mở.',
    'A explanation': 'Đúng: Nêu bật hai lợi ích cốt lõi của 3D Occupancy là General Geometry và Open-set Obstacle Safety.',
    'B explanation': 'Sai: 3D Occupancy Networks là các kiến trúc Transformer/CNN 3D hiện đại.',
    'C explanation': 'Sai: 3D Box rất tốt cho xe hơi tiêu chuẩn nhưng kém với vật thể biến dạng/lạ.',
    'D explanation': 'Sai: Occupancy giữ nguyên không gian 3 chiều `[X, Y, Z]`.'
  },
  {
    id: 'P2_D08_Q06',
    phase: 'phase2',
    day: 'P2_D08',
    day_title: 'Day 8: BEV & Sensor Fusion',
    topic: 'Robustness — Modality Dropout in Multi-Sensor Training',
    difficulty: 'Thực chiến',
    question:
      'Khi huấn luyện mạng hợp nhất đa cảm biến (ví dụ Camera + LiDAR trong BEVFusion), tại sao kỹ thuật "Modality Dropout" (ngắt ngẫu nhiên toàn bộ nhánh Camera hoặc toàn bộ nhánh LiDAR với xác suất p ≈ 0.2 trong lúc train) lại cực kỳ quan trọng?',
    options: [
      'A. Ngăn chặn hiện tượng mạng học phụ thuộc hoàn toàn vào một cảm biến mạnh hơn (như chỉ dựa vào LiDAR để định vị), buộc mạng phải học cách hoạt động bền vững và suy giảm an toàn (Graceful Degradation) khi một trong hai cảm biến bị hỏng, che bẩn hoặc chói nắng trong thực tế.',
      'B. Để xóa vĩnh viễn cảm biến Camera khỏi xe sau khi huấn luyện xong.',
      'C. Vì GPU không thể nhận đồng thời hai tensor đầu vào trong cùng một bước.',
      'D. Để làm cho điểm mAP trên tập Test giảm đi một nửa.'
    ],
    answer: 'A',
    hint: 'Nếu lúc train lúc nào cũng có đủ cả LiDAR và Camera sạch đẹp, mạng dễ bỏ qua việc học ước lượng độ sâu từ Camera.',
    explanation:
      'Đáp án đúng là A. Nếu không có Modality Dropout, trọng số của phần Fusion Head thường dồn hết sự tin cậy vào LiDAR cho tọa độ 3D; đến khi LiDAR bị lỗi phần cứng hoặc bị bùn che khuất trên đường, toàn bộ hệ thống sập về 0% mAP dù 6 Camera vẫn đang hoạt động tốt.',
    'A explanation': 'Đúng: Modality Dropout đảm bảo tính dự phòng an toàn (Redundancy & Fault Tolerance) cho hệ thống đa cảm biến.',
    'B explanation': 'Sai: Lúc suy luận vẫn dùng đầy đủ cả hai cảm biến.',
    'C explanation': 'Sai: GPU xử lý đa nhánh song song bình thường.',
    'D explanation': 'Sai: Modality Dropout giữ nguyên hoặc tăng nhẹ mAP khi đủ cảm biến và tăng vọt mAP khi mất 1 cảm biến.'
  },

  // ==================== DAY 9: DATA & ANNOTATION PIPELINE ====================
  {
    id: 'P2_D09_Q01',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: '4D Auto-Labeling — Non-Causal Hindsight Advantage',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao một hệ thống "4D Auto-Labeling" chạy ngoại tuyến trên máy chủ (Offline Server Pipeline) lại có thể tự động gán nhãn hộp 3D ở khoảng cách 90–120 mét chính xác hơn cả con người gán nhãn trên từng khung hình đơn lẻ?',
    options: [
      'A. Vì hệ thống Offline là phi nhân quả (Non-causal — được phép nhìn vào cả các khung hình trong tương lai `t + 1s .. t + 5s` khi chiếc xe đó đã tiến lại gần cảm biến với hàng nghìn điểm LiDAR rõ nét), sau đó ghép toàn bộ quỹ đạo 4D và ràng buộc kích thước vật thể cứng không đổi để suy ngược lại vị trí chính xác ở khoảng cách 100m.',
      'B. Vì máy chủ có màn hình lớn hơn màn hình của nhân viên gán nhãn.',
      'C. Vì ở khoảng cách 100 mét cảm biến LiDAR có mật độ điểm cao gấp 10 lần ở khoảng cách 5 mét.',
      'D. Vì 4D Auto-Labeling chỉ gán nhãn cho các vật thể đứng yên.'
    ],
    answer: 'A',
    hint: 'Mô hình chạy trên xe (Online) bắt buộc phải nhân quả (chỉ biết quá khứ ≤ t); nhưng bộ tạo nhãn trên Server (Offline) biết toàn bộ cuộn băng từ t - 10s đến t + 10s!',
    explanation:
      'Đáp án đúng là A. Ở cách 100m, một chiếc xe chỉ phản xạ 3–5 điểm LiDAR nên nhìn 1 frame không ai biết chính xác kích thước và tâm hộp. Nhưng nhờ tích hợp cả chuỗi thời gian quá khứ + tương lai (Hindsight Reconstruction) và tối ưu đồ thị toàn cục (Factor Graph Smoothing), máy chủ dựng lại được mô hình 3D đầy đủ và đặt hộp chuẩn xác tuyệt đối cho mọi frame.',
    'A explanation': 'Đúng: Tận dụng tính phi nhân quả (Future Frames) và ràng buộc vật rắn 4D là bí quyết cốt lõi của Data Engine hiện đại.',
    'B explanation': 'Sai: Đây là ưu thế về mặt thông tin toán học, không phải kích thước màn hình.',
    'C explanation': 'Sai: Mật độ LiDAR giảm theo bình phương khoảng cách 1/r².',
    'D explanation': 'Sai: 4D Auto-Labeling theo vết và tối ưu hóa quỹ đạo cho cả các tác nhân chuyển động.'
  },
  {
    id: 'P2_D09_Q02',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: 'Active Learning — Uncertainty & Ensemble Disagreement',
    difficulty: 'Thực chiến',
    question:
      'Khi đội xe thu thập hàng triệu giờ video mỗi tuần nhưng ngân sách kiểm duyệt gán nhãn chỉ xử lý được 0.5% lượng dữ liệu đó, chiến lược Active Learning nào giúp chọn ra tập mẫu mang lại mức tăng hiệu năng mô hình cao nhất?',
    options: [
      'A. Chọn các khung hình có độ bất định cao (High Entropy), có sự bất đồng lớn giữa nhiều mô hình trong một Ensemble (Query-by-Committee / BALD) hoặc có sự mâu thuẫn giữa dự đoán của nhánh Camera và nhánh LiDAR, kết hợp phân cụm Embedding để đảm bảo tính đa dạng (Diversity).',
      'B. Chỉ chọn các khung hình trên đường cao tốc vắng vẻ lúc trời nắng đẹp vì dễ gán nhãn nhất.',
      'C. Luôn chọn 1,000 khung hình đầu tiên của mỗi ngày theo thứ tự thời gian.',
      'D. Chỉ chọn các khung hình mà mô hình hiện tại đã dự đoán đúng với độ tự tin 99.99%.'
    ],
    answer: 'A',
    hint: 'Gán nhãn thêm 100,000 bức ảnh đường thẳng nắng đẹp mà mô hình đã đạt 99.9% không giúp mô hình học thêm được điều gì mới.',
    formulaRef: 'Score(x) = Uncertainty(x) × Diversity_Distance(x, Selected_Set)',
    explanation:
      'Đáp án đúng là A. Kết hợp Uncertainty Sampling (tìm nơi mô hình đang bối rối hoặc bất đồng giữa các cảm biến) với Diversity Sampling trên không gian Embedding (tránh chọn 1,000 frame liên tiếp của cùng 1 cảnh tắc đường) giúp tối đa hóa lượng thông tin thu được trên mỗi đồng chi phí gán nhãn.',
    'A explanation': 'Đúng: Kết hợp Uncertainty + Cross-modal Disagreement + Embedding Diversity là công thức chuẩn của Data Engine.',
    'B explanation': 'Sai: Mẫu dễ không cung cấp tín hiệu đạo hàm hữu ích.',
    'C explanation': 'Sai: Lấy mẫu theo giờ cố định bị thiên lệch thời tiết/địa điểm và trùng lặp cao.',
    'D explanation': 'Sai: Mẫu đã tự tin 99.99% có gradient gần bằng 0.'
  },
  {
    id: 'P2_D09_Q03',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: 'Temporal Label Consistency — Size & Velocity Jitter',
    difficulty: 'Thực chiến',
    question:
      'Nếu một quy trình gán nhãn giao từng khung hình rời rạc của một đoạn video cho những người gán nhãn khác nhau vẽ hộp 3D độc lập, lỗi chất lượng dữ liệu nào sẽ xảy ra và gây hại trực tiếp cho mô hình Dự báo quỹ đạo (Forecasting)?',
    options: [
      'A. Kích thước `(l, w, h)` và tâm hộp của cùng một chiếc xe bị dao động ngẫu nhiên ±15–25cm giữa các khung hình liên tiếp (Temporal Jitter); khi chia cho `Δt = 0.1s`, sai số vị trí 20cm biến thành sai số vận tốc ảo `2.0 m/s` và gia tốc ảo `20 m/s²`, làm hỏng hoàn toàn nhãn vận tốc/quỹ đạo.',
      'B. Không có bất kỳ ảnh hưởng nào vì mô hình tự động bỏ qua tọa độ tâm hộp.',
      'C. Tốc độ huấn luyện mô hình sẽ tăng lên gấp 10 lần.',
      'D. Dung lượng file JSON lưu nhãn sẽ giảm đi một nửa.'
    ],
    answer: 'A',
    hint: 'Phép lấy đạo hàm bậc nhất (v = Δx/Δt) và bậc hai (a = Δv/Δt) khuếch đại nhiễu tần số cao lên gấp 1/Δt và 1/Δt² lần!',
    formulaRef: 'σ_v ≈ √2 · σ_pos / Δt   (Với Δt = 0.05s, lệch vị trí 15cm gây lệch vận tốc > 4 m/s!)',
    explanation:
      'Đáp án đúng là A. Đây là lý do tại sao trong nhận thức tự hành bắt buộc phải gán nhãn theo chuỗi quỹ đạo (Track-level Annotation) với kích thước vật lý `(l, w, h)` cố định cho mỗi Track ID và làm mượt đường cong vị trí/góc hướng theo ràng buộc động học.',
    'A explanation': 'Đúng: Chỉ rõ cơ chế toán học mà nhiễu vị trí giữa các frame phá hủy nhãn vận tốc và gia tốc.',
    'B explanation': 'Sai: Tâm hộp là đầu vào trực tiếp để tính vận tốc và quỹ đạo.',
    'C explanation': 'Sai: Nhãn nhiễu làm mô hình khó hội tụ hơn.',
    'D explanation': 'Sai: Dung lượng file không đổi.'
  },
  {
    id: 'P2_D09_Q04',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: 'Annotation QA/QC — Inter-Annotator Agreement & Automated Rules',
    difficulty: 'Cơ bản',
    question:
      'Trong hệ thống kiểm soát chất lượng gán nhãn (Annotation QA/QC), việc cài đặt các "Quy tắc Kiểm tra Hình học Vật lý Tự động" (Automated Geometric Sanity Checks) trước khi nghiệm thu lô dữ liệu dùng để phát hiện những lỗi nào?',
    options: [
      'A. Phát hiện tự động các hộp 3D bay lơ lửng trên không hoặc chìm dưới mặt đường (Floating/Sunken boxes), hai phương tiện rắn giao cắt xuyên vào nhau (3D IoU > τ), kích thước xe nằm ngoài ngưỡng vật lý hợp lệ, hoặc chiều vận tốc ngược với hướng di chuyển của quỹ đạo.',
      'B. Kiểm tra tốc độ gõ bàn phím của nhân viên gán nhãn.',
      'C. Tự động đổi màu sơn của tất cả các xe trong ảnh sang màu đỏ.',
      'D. Xóa bỏ các khung hình có nhiều hơn 2 phương tiện.'
    ],
    answer: 'A',
    hint: 'Các quy tắc vật lý bất biến (như hai ô tô không thể chiếm cùng một thể tích 3D tại cùng một thời điểm) có thể kiểm tra tự động 100% bằng code.',
    explanation:
      'Đáp án đúng là A. Kiểm định thủ công 100% nhãn rất tốn kém; một cổng Automated Rule-based QC chặn ngay lập tức 80% các lỗi cơ học (lệch mặt đất, hộp chồng lấn, nhảy kích thước, ngược góc hướng 180°) trước khi đưa mẫu sang bước lấy mẫu kiểm toán bởi chuyên gia (Golden Set Audit).',
    'A explanation': 'Đúng: Liệt kê chính xác các bộ quy tắc hình học và động học bất biến trong kiểm định nhãn 3D/4D.',
    'B explanation': 'Sai: Tốc độ gõ phím không phản ánh độ chính xác hình học của nhãn.',
    'C explanation': 'Sai: QA/QC không làm biến đổi dữ liệu cảm biến gốc.',
    'D explanation': 'Sai: Các cảnh đông phương tiện là dữ liệu quan trọng nhất cần giữ lại.'
  },
  {
    id: 'P2_D09_Q05',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: 'Corner Case Mining — Multimodal Embedding Retrieval',
    difficulty: 'Thực chiến',
    question:
      'Sau khi phát hiện mô hình yếu trong tình huống "xe công trường có người cầm cờ điều tiết giao thông ban đêm", làm thế nào để tìm nhanh 5,000 cảnh tương tự từ kho 50 triệu khung hình chưa gán nhãn của đội xe?',
    options: [
      'A. Sử dụng chỉ mục Vector Embedding đa phương thức (như CLIP / SigLIP đã tính sẵn cho các khung hình khi nạp dữ liệu) để truy vấn bằng văn bản (Text-to-Image Search) và tìm láng giềng gần nhất bằng ảnh mẫu (Image-to-Image Similarity Search) trên Vector Database.',
      'B. Thuê 100 người ngồi xem tua từng giây toàn bộ 50 triệu khung hình từ đầu đến cuối.',
      'C. Chọn ngẫu nhiên 5,000 khung hình bất kỳ vì chắc chắn sẽ trúng.',
      'D. Xóa toàn bộ kho dữ liệu cũ và đi quay lại từ đầu.'
    ],
    answer: 'A',
    hint: 'Mỗi khung hình khi đưa về Data Lake đều được chạy qua một mô hình Foundation nhẹ để lưu vector nhúng vào Vector Index.',
    explanation:
      'Đáp án đúng là A. Trong kiến trúc Data Engine hiện đại, mọi đoạn video thu thập về đều được đánh chỉ mục ngữ nghĩa bằng VLM/CLIP Embedding kèm siêu dữ liệu (thời gian ngày/đêm, thời tiết, tốc độ xe, vị trí GPS). Nhờ đó kỹ sư có thể truy vấn tình huống hiếm chỉ trong vài giây.',
    'A explanation': 'Đúng: Semantic Data Mining bằng VLM/CLIP Embedding là công cụ chủ lực để trị bài toán Long-tail.',
    'B explanation': 'Sai: Xem thủ công 50 triệu khung hình là bất khả thi về thời gian và chi phí.',
    'C explanation': 'Sai: Tình huống hiếm chỉ chiếm 0.001% nên lấy mẫu ngẫu nhiên hầu như không tìm thấy.',
    'D explanation': 'Sai: Lãng phí tài nguyên dữ liệu đã thu thập.'
  },
  {
    id: 'P2_D09_Q06',
    phase: 'phase2',
    day: 'P2_D09',
    day_title: 'Day 9: Data & Annotation Pipeline',
    topic: 'Ontology Evolution & Dataset Versioning',
    difficulty: 'Thực chiến',
    question:
      'Khi dự án cập nhật Quy ước gán nhãn (Annotation Ontology Specification — ví dụ tách lớp `Vehicle` chung trước đây thành `Sedan`, `SUV`, `Pickup_Truck`, hoặc thay đổi quy định có bao gồm gương chiếu hậu vào hộp 3D hay không), sai lầm nào cần tuyệt đối tránh?',
    options: [
      'A. Trộn trực tiếp các lô dữ liệu gán theo quy ước cũ và quy ước mới vào cùng một tập Train/Test mà không chạy bước chuẩn hóa / di trú nhãn (Label Migration) và không quản lý phiên bản tập dữ liệu (Dataset Versioning).',
      'B. Ghi rõ số phiên bản quy ước gán nhãn (`ontology_v2.1`) vào siêu dữ liệu của từng lô dữ liệu.',
      'C. Chạy mô hình tự động để cập nhật lại các nhãn cũ theo quy ước mới.',
      'D. Duy trì tập Golden Benchmark nhất quán để so sánh công bằng giữa các thế hệ mô hình.'
    ],
    answer: 'A',
    hint: 'Nếu một nửa tập dữ liệu vẽ hộp bao gồm cả gương chiếu hậu (+25cm chiều rộng) và nửa kia không bao gồm gương, hàm Loss hồi quy chiều rộng và chỉ số IoU ở ngưỡng khắt khe sẽ bị mâu thuẫn nội tại.',
    explanation:
      'Đáp án đúng là A. Bất nhất về quy ước nhãn (Ontology Drift) làm trần độ chính xác của mô hình bị khóa cứng và làm sai lệch hoàn toàn kết quả đánh giá trên tập Test.',
    'A explanation': 'Đúng: Đây là sai lầm quản trị dữ liệu phổ biến gây tụt mAP không rõ nguyên nhân.',
    'B explanation': 'Sai: Đây là thực hành tốt (Best Practice) cần làm.',
    'C explanation': 'Sai: Dùng mô hình hỗ trợ nâng cấp nhãn cũ (Backfill/Relabeling) là quy trình chuẩn.',
    'D explanation': 'Sai: Duy trì Benchmark nhất quán là yêu cầu bắt buộc.'
  }
];
