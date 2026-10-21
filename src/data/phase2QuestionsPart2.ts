import { QuizQuestion } from '../types/curriculum';

export const PHASE2_QUESTIONS_PART2: QuizQuestion[] = [
  // ==================== DAY 4: CẢM BIẾN CHUỖI KHUNG HÌNH - THỜI GIAN ====================
  {
    id: 'P2_D04_Q01',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Temporal Fusion — Ego-Motion Compensation',
    difficulty: 'Thực chiến',
    question:
      'Trong hệ thống nhận thức chuỗi thời gian trên xe tự hành, chuyện gì sẽ xảy ra nếu ta ghép hoặc cộng trực tiếp bản đồ đặc trưng ở khung hình trước `F_{t-1}` vào khung hình hiện tại `F_t` mà quên áp dụng phép biến đổi bù chuyển động của xe chủ (Ego-motion Warping `T_{ego, t ← t-1}`)?',
    options: [
      'A. Các vật thể đứng yên (cột đèn, vỉa hè, xe đỗ) sẽ bị lệch vị trí giữa hai khung hình khi xe chủ di chuyển hoặc đánh lái, tạo ra hiệu ứng bóng ma (ghosting) và làm mô hình dự đoán vận tốc giả cho các vật tĩnh.',
      'B. Mô hình sẽ chạy nhanh gấp đôi vì bỏ qua được phép nhân ma trận.',
      'C. Chỉ có màu sắc của bầu trời bị thay đổi, còn tọa độ hộp 3D hoàn toàn chính xác.',
      'D. Hệ tọa độ của xe tại thời điểm t-1 và thời điểm t luôn trùng khít nhau ngay cả khi xe chạy ở tốc độ 100 km/h.'
    ],
    answer: 'A',
    hint: 'Mỗi bản đồ đặc trưng F_{t-1} được biểu diễn trong hệ tọa độ gắn với vị trí xe chủ tại thời điểm t-1.',
    formulaRef: 'p_{t} = R_{t ← t-1} · p_{t-1} + t_{t ← t-1}',
    explanation:
      'Đáp án đúng là A. Khi xe chủ di chuyển và đánh lái giữa hai frame, toàn bộ cảnh vật trong hệ tọa độ gắn với xe đã dịch chuyển ngược lại. Bắt buộc phải dùng pose từ IMU/Odometry để xoay và tịnh tiến `F_{t-1}` về hệ quy chiếu của thời điểm `t` trước khi hợp nhất.',
    'A explanation': 'Đúng: Bù Ego-motion là điều kiện tiên quyết để tách biệt chuyển động của xe chủ khỏi chuyển động thật của các đối tượng xung quanh.',
    'B explanation': 'Sai: Bỏ bước warp làm hỏng hoàn toàn chất lượng nhận thức.',
    'C explanation': 'Sai: Tọa độ không gian của mọi vật thể ở t-1 đều bị lệch.',
    'D explanation': 'Sai: Ở 100 km/h (~27.8 m/s), chỉ sau 100ms hệ tọa độ xe đã dịch đi gần 2.8 mét.'
  },
  {
    id: 'P2_D04_Q02',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Optical Flow — Brightness Constancy & Aperture Problem',
    difficulty: 'Cơ bản',
    question:
      'Phương trình cơ bản của dòng quang học (Optical Flow) `I_x · u + I_y · v + I_t = 0` gặp phải "Bài toán lỗ mở" (Aperture Problem) vì nguyên nhân toán học nào?',
    options: [
      'A. Vì tại mỗi điểm ảnh chỉ có 1 phương trình tuyến tính nhưng lại có tới 2 ẩn số là hai thành phần vận tốc (u, v), do đó khi nhìn cục bộ chỉ xác định được thành phần chuyển động vuông góc với biên độ sáng (dọc theo hướng gradient ∇I).',
      'B. Vì đạo hàm theo thời gian I_t luôn bằng 0 với mọi video.',
      'C. Vì máy ảnh số không thể chụp được quá 10 khung hình mỗi giây.',
      'D. Vì phương trình này chỉ nghiệm đúng khi toàn bộ bức ảnh có màu đen tuyệt đối.'
    ],
    answer: 'A',
    hint: 'Viết lại phương trình dưới dạng tích vô hướng: (∇I)^T · [u, v]^T = -I_t.',
    formulaRef: '∇I · v_flow = -I_t',
    explanation:
      'Đáp án đúng là A. Vì (∇I)^T · v = -I_t chỉ là 1 phương trình vô hướng cho 2 ẩn (u, v), mọi thành phần chuyển động trượt dọc theo cạnh đều không làm thay đổi cường độ sáng cục bộ.',
    'A explanation': 'Đúng: Hệ thiếu phương trình khiến chỉ đo được Normal Flow dọc theo ∇I nếu chỉ nhìn 1 điểm.',
    'B explanation': 'Sai: Khi có chuyển động, cường độ sáng tại pixel thay đổi nên I_t ≠ 0.',
    'C explanation': 'Sai: Camera hiện đại hoạt động ở 30–120+ FPS.',
    'D explanation': 'Sai: Nếu ảnh đen tuyệt đối thì I_x = I_y = I_t = 0.'
  },
  {
    id: 'P2_D04_Q03',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Sensor Synchronization — Rolling Shutter & LiDAR Motion Distortion',
    difficulty: 'Chuyên sâu',
    question:
      'Một xe tự hành đang chạy thẳng với vận tốc 20 m/s (72 km/h) sử dụng LiDAR cơ học quay 360° ở tần số 10 Hz (mỗi vòng quét mất 100 ms). Nếu không thực hiện khử méo chuyển động (Motion Deskewing) cho đám mây điểm trong một vòng quét, sai số hình học giữa điểm đầu vòng quét và điểm cuối vòng quét sẽ lớn cỡ nào?',
    options: [
      'A. Sai số chỉ khoảng 0.1 milimét nên có thể bỏ qua hoàn toàn.',
      'B. Giữa tia đầu tiên (t = 0 ms) và tia cuối cùng (t = 100 ms) của cùng một khung LiDAR, chiếc xe đã di chuyển được Δd = 20 m/s × 0.1 s = 2.0 mét, làm bức tường phẳng hoặc các phương tiện xung quanh bị kéo lệch/xoắn tới 2 mét.',
      'C. Đám mây điểm chỉ bị giảm độ sáng phản xạ (intensity) chứ tọa độ (x, y, z) không bị ảnh hưởng.',
      'D. LiDAR tự động dừng xe lại trong 100 ms mỗi khi quét.'
    ],
    answer: 'B',
    hint: 'Tính quãng đường xe đi được trong thời gian hoàn thành 1 vòng quét Δt = 1 / 10Hz = 0.1 giây.',
    formulaRef: 'p_deskewed(t_ref) = T_{t_ref ← t_i} · p_raw(t_i)',
    explanation:
      'Đáp án đúng là B. Ở vận tốc 20 m/s, gốc tọa độ cảm biến đã tịnh tiến 2.0 mét từ đầu vòng tới cuối vòng. Do đó bắt buộc phải nội suy pose của xe theo từng nhãn thời gian `t_i` của từng điểm để quy toàn bộ điểm về mốc thời gian chuẩn `t_ref`.',
    'A explanation': 'Sai: Sai số lên tới hàng mét chứ không phải milimét.',
    'B explanation': 'Đúng: 20 m/s × 0.1s = 2.0 mét là sai số cực lớn đối với bài toán định vị và phát hiện 3D.',
    'C explanation': 'Sai: Chính tọa độ hình học (x, y, z) bị biến dạng trực tiếp.',
    'D explanation': 'Sai: Xe di chuyển liên tục trong khi cảm biến quét.'
  },
  {
    id: 'P2_D04_Q04',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Streaming Temporal Inference — Memory Queue Design',
    difficulty: 'Thực chiến',
    question:
      'Khi triển khai mô hình nhận thức thời gian sử dụng T = 8 khung hình lịch sử lên phần cứng xe tự hành chạy ở 20 FPS, kiến trúc suy luận nào sau đây tránh việc phải tính toán lại Backbone 8 lần ở mỗi bước thời gian?',
    options: [
      'A. Kiến trúc Streaming / Recurrent Feature Queue: Tại bước t, chỉ chạy Backbone đúng 1 lần cho khung hình mới nhất I_t để lấy F_t, sau đó đọc các bản đồ đặc trưng lịch sử {F_{t-7}, ..., F_{t-1}} đã lưu sẵn trong bộ đệm vòng (Ring Buffer VRAM) ra để bù Ego-motion và hợp nhất.',
      'B. Lưu 8 bức ảnh JPEG ra ổ cứng rồi đọc lại cả 8 ảnh đưa vào Backbone ở mỗi chu kỳ 50ms.',
      'C. Chỉ chạy mô hình mỗi 8 giây một lần.',
      'D. Giảm độ phân giải ảnh xuống 8×8 pixel.'
    ],
    answer: 'A',
    hint: 'Đặc trưng Backbone của khung hình t-1 đã được tính xong ở chu kỳ trước đó 50ms.',
    explanation:
      'Đáp án đúng là A. Khi chạy thực tế liên tục (Streaming Inference), việc lưu lại tensor đặc trưng trung gian F_t trong bộ đệm vòng giúp chi phí tính toán của mô hình chuỗi thời gian gần như ngang bằng với mô hình đơn khung hình.',
    'A explanation': 'Đúng: Tái sử dụng đặc trưng từ Ring Buffer giúp độ trễ suy luận là O(1) theo chiều dài lịch sử T.',
    'B explanation': 'Sai: Chạy lại Backbone 8 lần làm tăng độ trễ và tiêu thụ điện năng lên gấp 8 lần.',
    'C explanation': 'Sai: Hệ thống điều khiển xe cần cập nhật nhận thức liên tục ở 10–20+ Hz.',
    'D explanation': 'Sai: Ảnh 8×8 pixel không thể nhận diện được vật thể giao thông.'
  },
  {
    id: 'P2_D04_Q05',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Spatio-Temporal Architectures — ConvGRU & Hardware Timestamp',
    difficulty: 'Cơ bản',
    question:
      'Điểm khác biệt quan trọng giữa ConvGRU/ConvLSTM so với LSTM truyền thống và nguyên tắc gắn nhãn thời gian cảm biến (Timestamping) đúng trong hệ thống nhúng là gì?',
    options: [
      'A. ConvGRU/ConvLSTM thay phép nhân ma trận bằng phép tích chập 2D để bảo toàn cấu trúc không gian [C, H, W]; và hệ thống bắt buộc phải dùng Hardware Mid-Exposure Timestamp đồng bộ qua PTP/PPS thay vì thời gian gói tin đến hệ điều hành.',
      'B. ConvLSTM duỗi phẳng mọi ảnh thành vector 1 chiều.',
      'C. Chỉ cần dùng thời gian khi hàm Python đọc ảnh từ ổ cứng là đủ chính xác.',
      'D. ConvGRU không có cổng cập nhật trạng thái.'
    ],
    answer: 'A',
    hint: 'Thời gian gói tin đến CPU bị trễ ngẫu nhiên 15–50ms do ISP và OS scheduling jitter.',
    formulaRef: 'i_t = σ(W_{xi} * X_t + W_{hi} * H_{t-1} + b_i)',
    explanation:
      'Đáp án đúng là A. Tích chập 2D trong cổng hồi quy giữ nguyên bản đồ không gian 2D, còn Hardware Timestamp tại thời điểm phơi sáng thật loại bỏ hoàn toàn sai số độ trễ truyền tải phần mềm.',
    'A explanation': 'Đúng: Nêu chuẩn xác kiến trúc không gian - thời gian của ConvGRU và tiêu chuẩn đồng bộ phần cứng.',
    'B explanation': 'Sai: LSTM thường mới duỗi phẳng thành vector 1D.',
    'C explanation': 'Sai: Thời gian phần mềm bị trễ và dao động mạnh (jitter).',
    'D explanation': 'Sai: ConvGRU có đầy đủ Update Gate và Reset Gate.'
  },
  {
    id: 'P2_D04_Q06',
    phase: 'phase2',
    day: 'P2_D04',
    day_title: 'Day 4: Cảm biến chuỗi khung hình - thời gian',
    topic: 'Video Transformers & Frame Drop Resilience',
    difficulty: 'Chuyên sâu',
    question:
      'Làm thế nào Divided Space-Time Attention giảm độ phức tạp O(T²·N²) của Video Transformer, và cách thiết kế mô hình để ước lượng vận tốc không bị sai gấp 3 lần khi có hiện tượng rớt khung hình (Frame Drop làm Δt tăng từ 50ms lên 150ms)?',
    options: [
      'A. Tách riêng bước Temporal Attention O(T²N) và Spatial Attention O(TN²) nối tiếp nhau; đồng thời truyền tường minh khoảng thời gian thực tế `Δt = t_curr - t_prev` vào bước ngoại suy vị trí và Positional Encoding.',
      'B. Xóa bỏ toàn bộ các khung hình lịch sử và luôn giả định cứng Δt = 50ms.',
      'C. Chỉ giữ lại 1 patch duy nhất cho mỗi khung hình.',
      'D. Đảo ngược thứ tự các khung hình khi rớt mạng.'
    ],
    answer: 'A',
    hint: 'Vận tốc v = Δx / Δt; nếu không truyền Δt thực tế, quãng đường Δx tăng gấp 3 khi rớt frame sẽ bị hiểu nhầm là vận tốc tăng gấp 3.',
    formulaRef: 'Complexity: O(T^2 N^2) → O(T N (T + N))  ;   p̂_t = p_{t-1} + v_{t-1} · Δt_actual',
    explanation:
      'Đáp án đúng là A. Phân rã trục Không gian và Thời gian giúp giảm chi phí bậc hai, còn nhúng `Δt` thực tế giúp mô hình bất biến với hiện tượng rớt frame hoặc biến thiên FPS.',
    'A explanation': 'Đúng: Giải quyết cả bài toán chi phí tính toán lẫn độ bền vững thời gian thực.',
    'B explanation': 'Sai: Giả định cứng Δt = 50ms gây nhảy vọt vận tốc ảo khi rớt frame.',
    'C explanation': 'Sai: Làm mất toàn bộ thông tin không gian.',
    'D explanation': 'Sai: Đảo ngược thứ tự làm vận tốc ngược chiều.'
  },

  // ==================== DAY 5: BỘ LỌC KALMAN & HỢP NHẤT XÁC SUẤT ====================
  {
    id: 'P2_D05_Q01',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Kalman Filter — Prediction vs Update Uncertainty',
    difficulty: 'Cơ bản',
    question:
      'Trong chu trình của Bộ lọc Kalman, ma trận hiệp phương sai độ bất định của trạng thái `P` thay đổi như thế nào qua Bước Dự đoán (Prediction Step) và Bước Cập nhật Đo lường (Measurement Update Step)?',
    options: [
      'A. Ở Bước Dự đoán, độ bất định `P_{k|k-1}` luôn TĂNG lên (do cộng thêm nhiễu quá trình `Q_k`); còn ở Bước Cập nhật Đo lường, độ bất định `P_{k|k}` luôn GIẢM xuống (do kết hợp thêm thông tin từ phép đo cảm biến).',
      'B. Ở cả hai bước, độ bất định `P` đều tăng lên vô hạn.',
      'C. Ở Bước Dự đoán độ bất định giảm về 0, còn ở Bước Cập nhật độ bất định tăng lên.',
      'D. Ma trận `P` là hằng số cố định không bao giờ thay đổi theo thời gian.'
    ],
    answer: 'A',
    hint: 'So sánh P_{k|k-1} = F P_{k-1|k-1} F^T + Q_k và P_{k|k} = (I - K_k H_k) P_{k|k-1}.',
    formulaRef: 'Predict: P_{k|k-1} = F P F^T + Q  (Phình to)   |   Update: P_{k|k} = (I - K H) P_{k|k-1}  (Co nhỏ)',
    explanation:
      'Đáp án đúng là A. Khi ngoại suy theo thời gian mà chưa có phép đo mới, sai số động học tích lũy làm elip bất định phình to ra (`+ Q_k`). Khi nhận được phép đo từ cảm biến, thông tin mới thu hẹp vùng nghi ngờ nên elip bất định co nhỏ lại.',
    'A explanation': 'Đúng: Phản ánh bản chất vật lý và lý thuyết thông tin Bayes của bộ lọc trạng thái.',
    'B explanation': 'Sai: Nếu hệ thống khả quan sát, P sẽ hội tụ về trạng thái cân bằng ổn định.',
    'C explanation': 'Sai: Ngược lại hoàn toàn với bản chất toán học của bộ lọc.',
    'D explanation': 'Sai: P được cập nhật động ở mỗi bước thời gian.'
  },
  {
    id: 'P2_D05_Q02',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Probabilistic Fusion — Two 1D Gaussian Sensors',
    difficulty: 'Thực chiến',
    question:
      'Để đo khoảng cách tới chiếc xe phía trước, cảm biến LiDAR cho kết quả `z_1 = 40.0 m` với phương sai nhiễu `σ_1² = 1.0 m²`, đồng thời cảm biến Radar cho kết quả `z_2 = 45.0 m` với phương sai nhiễu `σ_2² = 4.0 m²`. Khi hợp nhất xác suất tối ưu hai phép đo Gaussian độc lập này, khoảng cách ước lượng `μ_fused` và phương sai hậu nghiệm `σ_fused²` bằng bao nhiêu?',
    options: [
      'A. μ_fused = 42.5 m ;  σ_fused² = 2.5 m²',
      'B. μ_fused = 41.0 m ;  σ_fused² = 0.8 m²',
      'C. μ_fused = 44.0 m ;  σ_fused² = 5.0 m²',
      'D. μ_fused = 40.0 m ;  σ_fused² = 1.0 m²'
    ],
    answer: 'B',
    hint: 'Áp dụng công thức: μ_fused = (σ_2² z_1 + σ_1² z_2) / (σ_1² + σ_2²) và σ_fused² = (σ_1² σ_2²) / (σ_1² + σ_2²).',
    formulaRef: 'μ = (4×40 + 1×45)/(1 + 4) = 41.0 m  ;  σ² = (1×4)/(1 + 4) = 0.8 m²',
    explanation:
      'Đáp án đúng là B. LiDAR có phương sai nhỏ hơn 4 lần so với Radar nên có trọng số tin cậy gấp 4 lần: μ_fused = (4/5)×40 + (1/5)×45 = 41.0 m. Phương sai sau hợp nhất là σ_fused² = (1×4)/(1+4) = 0.8 m², nhỏ hơn cả phương sai của LiDAR đơn lẻ (1.0 m²).',
    'A explanation': 'Sai: Lấy trung bình cộng đơn thuần bỏ qua độ chính xác khác nhau của 2 cảm biến.',
    'B explanation': 'Đúng: Tính toán chính xác theo công thức hợp nhất hai phân phối Gaussian.',
    'C explanation': 'Sai: Ngược trọng số và cộng sai phương sai.',
    'D explanation': 'Sai: Bỏ phí hoàn toàn thông tin bổ sung từ cảm biến thứ hai.'
  },
  {
    id: 'P2_D05_Q03',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Non-Linear Filtering — EKF vs UKF',
    difficulty: 'Chuyên sâu',
    question:
      'Tại sao khi hợp nhất phép đo của cảm biến Radar (đo khoảng cách `r`, góc phương vị `θ`, vận tốc Doppler `ṙ` trong tọa độ cực) vào trạng thái Đề-các `(p_x, p_y, v_x, v_y)`, bộ lọc Unscented Kalman Filter (UKF) lại chính xác và ổn định hơn Extended Kalman Filter (EKF) khi độ bất định góc `θ` lớn?',
    options: [
      'A. Vì EKF dùng khai triển Taylor bậc 1 (ma trận đạo hàm Jacobian) tại một điểm duy nhất nên làm biến dạng phân phối khi đổi từ tọa độ cực sang Đề-các; trong khi UKF truyền 2n+1 điểm đại diện (Sigma Points) trực tiếp qua hàm lượng giác phi tuyến gốc, bảo toàn chính xác trung bình và hiệp phương sai tới bậc 2–3.',
      'B. Vì UKF không sử dụng ma trận hiệp phương sai.',
      'C. Vì EKF chỉ hoạt động được với trạng thái 1 chiều.',
      'D. Vì UKF biến phép đo của Radar thành ảnh màu RGB.'
    ],
    answer: 'A',
    hint: 'Phép biến đổi x = r·cos(θ), y = r·sin(θ) là phi tuyến mạnh theo góc θ.',
    formulaRef: 'UKF: 2n + 1 Sigma Points  χ_i = x̂ ± √((n + λ) P)',
    explanation:
      'Đáp án đúng là A. Tuyến tính hóa bậc 1 trong EKF gây sai lệch kỳ vọng khi hàm có độ cong lớn. UKF lấy mẫu tất định 2n+1 điểm Sigma, đẩy thẳng qua hàm phi tuyến rồi tính lại thống kê mà không cần tính đạo hàm Jacobian.',
    'A explanation': 'Đúng: Nêu bật bản chất toán học của Unscented Transform so với xấp xỉ Jacobian bậc 1.',
    'B explanation': 'Sai: UKF vẫn tính toán và cập nhật ma trận hiệp phương sai P đầy đủ.',
    'C explanation': 'Sai: EKF dùng cho vector trạng thái n chiều bất kỳ.',
    'D explanation': 'Sai: UKF là bộ lọc ước lượng trạng thái toán học.'
  },
  {
    id: 'P2_D05_Q04',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Outlier Rejection — Mahalanobis Distance Gating',
    difficulty: 'Thực chiến',
    question:
      'Trước khi đưa một phép đo mới `z_k` vào cập nhật Bộ lọc Kalman, tại sao ta phải kiểm tra cổng (Measurement Gating) bằng bình phương khoảng cách Mahalanobis `d_M² = (z_k - H x̂)^T S_k^{-1} (z_k - H x̂) ≤ γ` thay vì chỉ dùng khoảng cách Euclid thông thường?',
    options: [
      'A. Vì khoảng cách Mahalanobis chuẩn hóa độ lệch theo ma trận hiệp phương sai phần dư `S_k = H P H^T + R`, tạo ra cổng hình elip co giãn theo đúng hướng và mức độ bất định thực tế của cả quỹ đạo lẫn cảm biến và tuân theo phân phối Chi-bình phương (`χ²`).',
      'B. Vì khoảng cách Euclid không thể tính được trong không gian 2 chiều.',
      'C. Vì khoảng cách Mahalanobis luôn luôn bằng 0 với mọi phép đo.',
      'D. Để tránh việc phải sử dụng ma trận nhiễu cảm biến R_k.'
    ],
    answer: 'A',
    hint: 'Khoảng cách Mahalanobis tính bằng đơn vị "số lần độ lệch chuẩn" theo từng phương chính của hình elip bất định S_k.',
    formulaRef: 'd_M^2 = ỹ_k^T S_k^{-1} ỹ_k ~ χ^2_{df}',
    explanation:
      'Đáp án đúng là A. Mahalanobis tự động mở rộng hoặc thu hẹp vùng chấp nhận dựa trên `S_k` và cho phép chọn ngưỡng `γ` theo xác suất thống kê (ví dụ mức tin cậy 95% hoặc 99% của phân phối χ²).',
    'A explanation': 'Đúng: Chuẩn hóa theo hiệp phương sai S_k giúp bác bỏ nhiễu ngoại lai (Outliers) chính xác về mặt xác suất.',
    'B explanation': 'Sai: Khoảng cách Euclid tính dễ dàng nhưng coi mọi hướng và mọi mức độ bất định như nhau.',
    'C explanation': 'Sai: d_M² ≥ 0 và chỉ bằng 0 khi phép đo trùng khít với dự đoán.',
    'D explanation': 'Sai: S_k = H P H^T + R_k sử dụng trực tiếp R_k.'
  },
  {
    id: 'P2_D05_Q05',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Numerical Stability — Joseph Form & Angle Wrapping',
    difficulty: 'Chuyên sâu',
    question:
      'Khi lập trình EKF/UKF thực tế, tại sao phải dùng công thức Joseph `P = (I - KH)P(I - KH)^T + KRK^T` và bọc góc phần dư `ỹ_ψ = atan2(sin Δψ, cos Δψ)` khi trạng thái chứa góc hướng `ψ ∈ (-π, π]`?',
    options: [
      'A. Dạng Joseph bảo toàn tính đối xứng và xác định dương của ma trận hiệp phương sai trước sai số làm tròn dấu phẩy động; còn bọc góc ngăn lỗi nhảy bậc 358° khi góc vượt qua ranh giới ±180° (ví dụ từ +179° sang -179°).',
      'B. Vì công thức rút gọn P = (I - KH)P chỉ dùng được cho số nguyên.',
      'C. Vì hàm atan2 luôn trả về giá trị bằng 0.',
      'D. Để giảm kích thước ma trận P xuống 1×1.'
    ],
    answer: 'A',
    hint: 'Hiệu đại số (-179°) - (+179°) = -358° trong khi độ lệch góc thực sự trên vòng tròn chỉ là +2°.',
    formulaRef: 'P_{k|k} = (I - K H) P_{k|k-1} (I - K H)^T + K R K^T',
    explanation:
      'Đáp án đúng là A. Hai lỗi làm sập Bộ lọc Kalman phổ biến nhất trong thực tế là mất tính xác định dương của ma trận P (khắc phục bằng Joseph Form) và quên chuẩn hóa hiệu góc về khoảng (-π, π].',
    'A explanation': 'Đúng: Giải quyết đồng thời cả tính ổn định đại số tuyến tính lẫn tính tuần hoàn hình học của góc.',
    'B explanation': 'Sai: Công thức rút gọn vẫn dùng số thực nhưng dễ mất đối xứng do sai số làm tròn.',
    'C explanation': 'Sai: atan2 trả về góc chính xác trong khoảng (-π, π].',
    'D explanation': 'Sai: Kích thước ma trận P vẫn giữ nguyên n×n.'
  },
  {
    id: 'P2_D05_Q06',
    phase: 'phase2',
    day: 'P2_D05',
    day_title: 'Day 5: Bộ lọc kalman & hợp nhất xác suất',
    topic: 'Observability & NIS Consistency Check',
    difficulty: 'Thực chiến',
    question:
      'Nhờ đâu Bộ lọc Kalman ước lượng được vận tốc `(v_x, v_y)` dù cảm biến chỉ đo vị trí `(p_x, p_y)`, và nếu chỉ số NIS (`ε_k = ỹ_k^T S_k^{-1} ỹ_k`) lớn hơn nhiều ngưỡng Chi-bình phương thì ta cần điều chỉnh gì?',
    options: [
      'A. Ma trận chuyển tiếp `F` tạo ra hiệp phương sai chéo `Cov(p, v) ≠ 0` giúp suy ra vận tốc từ chuỗi vị trí; còn NIS quá cao báo hiệu bộ lọc đang quá tự tin (Overconfident — ước lượng `S_k` quá nhỏ) nên cần tăng ma trận nhiễu `Q` hoặc `R`.',
      'B. Bộ lọc không thể ước lượng được vận tốc nếu không có cảm biến Doppler.',
      'C. Khi NIS quá cao ta phải giảm ma trận `Q` và `R` về 0.',
      'D. NIS luôn cố định bằng 1 bất kể giá trị của `Q` và `R`.'
    ],
    answer: 'A',
    hint: 'Khi tử số ỹ_k² lớn mà mẫu số S_k = HPH^T + R lại nhỏ thì NIS vọt lên rất cao.',
    formulaRef: 'E[ε_k] = E[ỹ_k^T S_k^{-1} ỹ_k] = dim(z_k)',
    explanation:
      'Đáp án đúng là A. Liên kết động học `p_k = p_{k-1} + v·Δt` trong `F` làm hệ thống khả quan sát đối với vận tốc; còn giám sát NIS giúp hiệu chỉnh đúng quy mô phương sai nhiễu `Q` và `R`.',
    'A explanation': 'Đúng: Nắm vững cả tính khả quan sát (Observability) và kiểm định tính nhất quán (Consistency) của Kalman Filter.',
    'B explanation': 'Sai: Suy ra vận tốc từ chuỗi vị trí là ứng dụng cơ bản nhất của Kalman Filter.',
    'C explanation': 'Sai: Giảm Q, R về 0 làm S_k càng nhỏ và NIS càng nổ lớn hơn.',
    'D explanation': 'Sai: NIS phụ thuộc trực tiếp vào tỷ số giữa sai số thực tế và hiệp phương sai dự đoán.'
  },

  // ==================== DAY 6: 3D FROM POINT CLOUDS ====================
  {
    id: 'P2_D06_Q01',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: 'PointNet — Permutation Invariance',
    difficulty: 'Cơ bản',
    question:
      'Đám mây điểm 3D (Point Cloud) bản chất là một tập hợp không có thứ tự (Unordered Set). Trong kiến trúc PointNet, thành phần toán học nào chịu trách nhiệm đảm bảo đầu ra của mạng không thay đổi khi ta hoán vị ngẫu nhiên thứ tự của N điểm đầu vào?',
    options: [
      'A. Sử dụng lớp tích chập 2D trượt theo thứ tự chỉ số mảng.',
      'B. Áp dụng mạng MLP chia sẻ trọng số (Shared MLP) độc lập lên từng điểm rồi gom toàn cục bằng một hàm đối xứng là Channel-wise Max Pooling: `f({x_1, ..., x_n}) = γ( MAX_i h(x_i) )`.',
      'C. Bắt buộc sắp xếp các điểm theo thứ tự bảng chữ cái của màu sắc.',
      'D. Dùng mạng hồi quy RNN đọc lần lượt từ điểm thứ 1 đến điểm thứ N.'
    ],
    answer: 'B',
    hint: 'Hàm đối xứng (Symmetric Function) là hàm có giá trị không đổi dưới mọi phép hoán vị các đối số.',
    formulaRef: 'f({x_1, ..., x_n}) = γ ( MAX_{i=1..n} { h(x_i) } )',
    explanation:
      'Đáp án đúng là B. Shared MLP xử lý từng điểm như nhau và phép Max Pooling dọc theo chiều N tạo ra vector đặc trưng toàn cục hoàn toàn bất biến với thứ tự lưu trữ điểm.',
    'A explanation': 'Sai: Tích chập trượt theo chỉ số mảng phụ thuộc trực tiếp vào thứ tự sắp xếp điểm.',
    'B explanation': 'Đúng: Shared MLP + Symmetric Max Pooling là định lý nền tảng của PointNet.',
    'C explanation': 'Sai: Không tồn tại thứ tự sắp xếp tuyến tính ổn định trong 3D khi vật thể xoay.',
    'D explanation': 'Sai: RNN phụ thuộc mạnh vào thứ tự chuỗi đầu vào.'
  },
  {
    id: 'P2_D06_Q02',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: 'PointPillars vs VoxelNet — Real-Time 3D Detection',
    difficulty: 'Thực chiến',
    question:
      'Tại sao kiến trúc PointPillars lại đạt tốc độ suy luận thời gian thực cao hơn đáng kể trên phần cứng nhúng (như NVIDIA Orin / TensorRT) so với VoxelNet truyền thống?',
    options: [
      'A. Vì PointPillars lượng tử hóa không gian thành các cột thẳng đứng (Pillars — không chia nhỏ theo trục cao độ Z), nhờ đó loại bỏ hoàn toàn các lớp Tích chập 3D (3D Convolution) đắt đỏ và chuyển thẳng sang xử lý bằng Tích chập 2D chuẩn trên mặt phẳng giả ảnh BEV.',
      'B. Vì PointPillars chỉ giữ lại đúng 10 điểm LiDAR cho mỗi khung cảnh.',
      'C. Vì PointPillars không dự đoán chiều cao h và tọa độ z của hộp 3D.',
      'D. Vì VoxelNet chỉ chạy được trên CPU một nhân.'
    ],
    answer: 'A',
    hint: 'So sánh lưới Voxel 3D (D × H × W) cần 3D Conv với lưới Pillar 2D (1 × H × W) tạo ra một Pseudo-Image [C, H, W].',
    formulaRef: 'Pillar Feature Net → Scatter to 2D Pseudo-Image [B, C, H_bev, W_bev] → 2D CNN Backbone',
    explanation:
      'Đáp án đúng là A. PointPillars gom toàn bộ điểm trong cột thẳng đứng bằng một PointNet nhỏ thành vector C chiều, rải về lưới 2D [C, H, W] rồi dùng 2D CNN tiêu chuẩn cực nhanh trên GPU/TensorRT.',
    'A explanation': 'Đúng: Chuyển từ 3D Conv sang 2D BEV Pseudo-Image là chìa khóa tốc độ của PointPillars.',
    'B explanation': 'Sai: PointPillars xử lý hàng chục nghìn điểm LiDAR mỗi khung hình.',
    'C explanation': 'Sai: Mỗi điểm đầu vào vẫn giữ tọa độ z thật nên mạng vẫn hồi quy đầy đủ hộp 3D 7 bậc tự do.',
    'D explanation': 'Sai: VoxelNet chạy trên GPU.'
  },
  {
    id: 'P2_D06_Q03',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: 'Sparse Convolution — Submanifold Dilation Problem',
    difficulty: 'Chuyên sâu',
    question:
      'Trong mạng 3D Voxel (như SECOND / CenterPoint-Voxel), tại sao người ta phải sử dụng "Submanifold Sparse Convolution (SSC)" cho phần lớn các tầng thay vì dùng Sparse Convolution thông thường?',
    options: [
      'A. Vì Sparse Convolution thông thường tính toán đầu ra trên mọi ô voxel trống có lân cận K×K×K chạm tới một voxel có điểm, làm số lượng voxel hoạt động nở rộng nhanh chóng sau mỗi tầng (Submanifold Dilation) và làm mất tính thưa; còn SSC chỉ tính đầu ra tại đúng các tọa độ voxel ban đầu có điểm.',
      'B. Vì SSC không sử dụng bất kỳ trọng số học được nào.',
      'C. Vì Sparse Convolution thông thường xóa hết các điểm thuộc về xe hơi.',
      'D. Vì SSC chỉ áp dụng được cho dữ liệu văn bản.'
    ],
    answer: 'A',
    hint: 'Nếu mỗi tầng kernel 3×3×3 làm dày vùng biên thêm 1 lớp voxel xung quanh, chỉ sau vài tầng toàn bộ không gian 3D sẽ biến thành đặc (dense).',
    explanation:
      'Đáp án đúng là A. Submanifold Sparse Conv giữ nguyên tập chỉ số các ô hoạt động (Active Sites) khi stride = 1, bảo toàn tính thưa (sparsity) và độ sắc nét hình học 3D qua nhiều tầng.',
    'A explanation': 'Đúng: Ngăn chặn hiện tượng nở đặc trưng (Submanifold Dilation) làm tràn bộ nhớ và mờ biên vật thể.',
    'B explanation': 'Sai: SSC vẫn học bộ lọc trọng số K×K×K như tích chập chuẩn.',
    'C explanation': 'Sai: Không xóa điểm của bất kỳ lớp nào.',
    'D explanation': 'Sai: SSC được thiết kế chuyên biệt cho dữ liệu không gian thưa 2D/3D/4D.'
  },
  {
    id: 'P2_D06_Q04',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: 'CenterPoint & Heading Encoding (sin ψ, cos ψ)',
    difficulty: 'Thực chiến',
    question:
      'Tại sao kiến trúc CenterPoint lại biểu diễn đối tượng bằng điểm tâm trên BEV thay vì 3D Anchor xoay, và tại sao góc hướng `ψ` được hồi quy qua cặp `(sin ψ, cos ψ)` thay vì giá trị góc trực tiếp `ψ ∈ [-π, π]`?',
    options: [
      'A. Điểm tâm bất biến với góc xoay nên không cần đặt anchor theo nhiều hướng; còn cặp `(sin ψ, cos ψ)` liên tục tuần hoàn trên vòng tròn đơn vị nên khử hoàn toàn bước nhảy gián đoạn tại ranh giới `±π`.',
      'B. Vì CenterPoint không dự đoán góc hướng của xe.',
      'C. Vì hàm sin và cos luôn bằng 1 với mọi góc.',
      'D. Để chỉ phát hiện các chiếc xe đang đi lùi.'
    ],
    answer: 'A',
    hint: 'Điểm không có hướng nên bất biến khi xoay; còn trên vòng tròn đơn vị, góc -179° và +179° có giá trị (sin ψ, cos ψ) nằm sát nhau.',
    formulaRef: 'Center Heatmap + Reg: (Δx, Δy, z, log(l,w,h), sinψ, cosψ, v_x, v_y)',
    explanation:
      'Đáp án đúng là A. CenterPoint biến bài toán phát hiện 3D thành tìm đỉnh cực đại trên Heatmap tâm kèm hồi quy thuộc tính liên tục `(sin ψ, cos ψ)`, vừa nhanh vừa loại bỏ hoàn toàn điểm gián đoạn góc.',
    'A explanation': 'Đúng: Kết hợp hai thiết kế thanh lịch nhất trong 3D Object Detection hiện đại.',
    'B explanation': 'Sai: CenterPoint dự đoán góc hướng rất chính xác qua nhánh Regression.',
    'C explanation': 'Sai: sin²ψ + cos²ψ = 1.',
    'D explanation': 'Sai: Phát hiện mọi hướng 360°.'
  },
  {
    id: 'P2_D06_Q05',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: '3D Geometry — Oriented 3D Bounding Box IoU',
    difficulty: 'Cơ bản',
    question:
      'Hai hộp giới hạn 3D có cùng kích thước `l = 4.0m, w = 2.0m, h = 2.0m` (thể tích mỗi hộp = 16 m³) và cùng góc hướng `ψ = 0°`. Hộp 1 có tâm tại `(0, 0, 0)` và Hộp 2 có tâm tại `(2.0, 0, 1.0)`. Giá trị `3D IoU` giữa hai hộp này bằng bao nhiêu?',
    options: [
      'A. 1 / 7 ≈ 0.143',
      'B. 1 / 2 = 0.500',
      'C. 1 / 3 ≈ 0.333',
      'D. 0.000'
    ],
    answer: 'A',
    hint: 'Tính độ chồng lấp theo từng trục: ΔX = 4.0 - 2.0 = 2.0m ; ΔY = 2.0 - 0 = 2.0m ; ΔZ = 2.0 - 1.0 = 1.0m.',
    formulaRef: 'V_inter = 2.0 × 2.0 × 1.0 = 4 m³  ;  V_union = 16 + 16 - 4 = 28 m³  ;  IoU_3D = 4 / 28 = 1/7',
    explanation:
      'Đáp án đúng là A. Diện tích giao trên mặt phẳng BEV là `2.0m × 2.0m = 4.0 m²`. Độ chồng lấp chiều cao Z là `1.0m`. Thể tích giao 3D là `4.0 m³`, thể tích hợp là `16 + 16 - 4 = 28 m³`, suy ra `3D IoU = 4/28 = 1/7 ≈ 0.143`.',
    'A explanation': 'Đúng: V_inter = 4 m³, V_union = 28 m³ → IoU = 4/28 = 1/7.',
    'B explanation': 'Sai: Nhầm lẫn với độ chồng lấp của 1 trục đơn lẻ.',
    'C explanation': 'Sai: 1/3 là giá trị BEV 2D IoU khi chưa nhân độ lệch chiều cao trục Z.',
    'D explanation': 'Sai: Hai hộp vẫn giao nhau một khối 2m × 2m × 1m.'
  },
  {
    id: 'P2_D06_Q06',
    phase: 'phase2',
    day: 'P2_D06',
    day_title: 'Day 6: 3D From Point Clouds',
    topic: 'Multi-Sweep Accumulation & GT-Paste Augmentation',
    difficulty: 'Thực chiến',
    question:
      'Tại sao khi ghép nối 10 vòng quét LiDAR liên tiếp (Multi-sweep Accumulation) đã bù Ego-motion, ta bắt buộc phải gắn thêm kênh độ trễ thời gian `Δt` cho mỗi điểm (`[x, y, z, r, Δt]`)?',
    options: [
      'A. Để mạng phân biệt được điểm nào thuộc thời điểm hiện tại (`Δt = 0` — nơi đặt hộp 3D) và dùng vệt dịch chuyển của các điểm lịch sử (`Δt > 0`) để suy ra trực tiếp vector vận tốc của vật thể mà không bị dự đoán hộp dài gấp đôi do bóng mờ chuyển động.',
      'B. Vì cảm biến LiDAR chỉ gửi dữ liệu mỗi 10 giây một lần.',
      'C. Để xóa bỏ toàn bộ các điểm thuộc về mặt đường.',
      'D. Vì nếu không có `Δt` thì tọa độ `x, y, z` đều bằng 0.'
    ],
    answer: 'A',
    hint: 'Nếu ghép 10 sweeps mà không có kênh Δt, chiếc xe đang chạy sẽ tạo thành một vệt dài khiến mạng tưởng chiếc xe dài gấp đôi.',
    formulaRef: 'Point Feature: p_i = [x_i, y_i, z_i, intensity_i, Δt_i]^T',
    explanation:
      'Đáp án đúng là A. Kênh `Δt` biến vệt nhòe chuyển động qua 0.5 giây thành thông tin quý giá giúp mạng vừa định vị hộp đúng tại mốc `Δt = 0` vừa ước lượng vận tốc `(v_x, v_y)` chính xác.',
    'A explanation': 'Đúng: Vừa làm dày mật độ điểm ở xa vừa cung cấp tín hiệu vận tốc từ chuỗi đám mây điểm.',
    'B explanation': 'Sai: LiDAR quét ở tần số 10–20Hz.',
    'C explanation': 'Sai: Không liên quan đến việc xóa mặt đường.',
    'D explanation': 'Sai: x, y, z là tọa độ không gian độc lập.'
  }
];
