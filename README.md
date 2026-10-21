# Vin20K AI & ML Master Hub — Phase 1 & Phase 2

Ứng dụng web ôn tập lý thuyết chuyên sâu, tra cứu công thức toán học, sơ đồ kiến trúc hệ thống và luyện đề kiểm tra nhanh / thi thử tính giờ nghiêm ngặt cho chương trình **Vin20K AI & Machine Learning (Phase 1 & Phase 2)**.

---

## 1. Tính năng nổi bật

- **Lộ trình Tích hợp Toàn diện (Phase 1 & Phase 2)**:
  - **Phase 2 (12 Days — Computer Vision, 3D, Sensor Fusion & VLA)**:
    - `Day 1`: Neural Network and Training
    - `Day 2`: Deep Learning Architecture for Computer Vision
    - `Day 3`: Track 04 — 2D Perception: Detection, Segmentation & Keypoints
    - `Day 4`: Cảm biến chuỗi khung hình - thời gian (Temporal Sequence & Optical Flow)
    - `Day 5`: Bộ lọc Kalman & Hợp nhất xác suất (KF, EKF, UKF & Mahalanobis Gating)
    - `Day 6`: 3D From Point Clouds (PointNet++, VoxelNet, PointPillars, CenterPoint)
    - `Day 7`: Tracking and Forecasting (3D MOT, Hungarian Matching, Multi-Modal Trajectory)
    - `Day 8`: BEV & Sensor Fusion (LSS, BEVFormer, BEVFusion Camera-LiDAR-Radar)
    - `Day 9`: Data & Annotation Pipeline (Active Learning, Auto-Labeling, Weak Supervision)
    - `Day 10`: Vision-Language Model & VLA (CLIP, LLaVA, RT-2, OpenVLA, Flow Matching)
    - `Day 11`: Synthetic, Simulated & Trajectory Data (NeRF, 3DGS, Sim-to-Real, Domain Randomization)
    - `Day 12`: Replay and Closed-Loop Test (Log-Replay vs Closed-Loop, IDM, Collision Rate)
  - **Phase 1 (15 Days + 5 Chuyên đề Mở rộng — LLM, RAG, Agentic AI & Production)**:
    - Đầy đủ 15 ngày lý thuyết cốt lõi kèm toàn văn giáo trình gốc (`.md`) và **2,000 câu hỏi trắc nghiệm** trải rộng từ xác suất thống kê, Transformer, RAG, Fine-tuning (LoRA/QLoRA, DPO), Multi-Agent đến MLOps/LLMOps.
- **Tài liệu Lý thuyết Chuyên sâu**:
  - Công thức toán học kèm bảng giải thích từng biến số và trực giác kỹ thuật.
  - Sơ đồ kiến trúc hệ thống (ASCII Pipeline Blueprint + đặc tả kích thước Tensor qua 4 tầng xử lý + lưu ý điểm nghẽn Production).
  - Bảng so sánh đánh đổi kỹ thuật (Engineering Trade-offs).
- **Chế độ Kiểm tra Nhanh (Quick Quiz) & Thi thử Tính giờ Nghiêm ngặt (Strict Timed Exam)**:
  - Đồng hồ đếm ngược thời gian thực, tự động thu bài khi hết giờ.
  - Hỗ trợ phím tắt bàn phím (`1-4` hoặc `A-D` chọn đáp án, `←`/`→` chuyển câu, `F` gắn cờ).
  - Giải thích chi tiết cho từng phương án `A`, `B`, `C`, `D`.
- **Thống kê Năng lực & Ngân hàng Câu sai**:
  - Tự động lưu trữ tiến độ học tập (`CHƯA HỌC`, `ĐANG HỌC...`, `50%`, `100%`) và lịch sử làm bài trên `localStorage`.
  - Phát hiện các chủ đề yếu (`< 70%`) và cho phép tạo đề ôn luyện lại riêng những câu từng làm sai.

---

## 2. Yêu cầu hệ thống (Prerequisites)

Trước khi chạy ứng dụng trên máy cá nhân (local), hãy đảm bảo máy bạn đã cài đặt:

- **Node.js**: Phiên bản `>= 18.0.0` (khuyến nghị bản **Node.js 20 LTS** hoặc **22 LTS**). Kiểm tra bằng lệnh:
  ```bash
  node -v
  ```
- **npm**: Đi kèm với Node.js (kiểm tra bằng `npm -v`).
- **Git**: Để clone và quản lý mã nguồn (kiểm tra bằng `git --version`).

---

## 3. Hướng dẫn Clone từ GitHub và Chạy trên Local

### Bước 1: Clone kho lưu trữ (Repository) về máy

Mở Terminal (macOS/Linux) hoặc PowerShell / Git Bash (Windows) và chạy lệnh:

```bash
git clone https://github.com/<TEN_USER_CUA_BAN>/<TEN_REPO_CUA_BAN>.git
cd <TEN_REPO_CUA_BAN>
```

*(Nếu bạn tải mã nguồn dưới dạng file `.zip` từ AI Studio hoặc GitHub, hãy giải nén thư mục và mở Terminal tại thư mục gốc chứa file `package.json`).*

### Bước 2: Cài đặt các thư viện phụ thuộc (Dependencies)

Chạy lệnh sau để cài đặt React 19, Vite, Tailwind CSS, TypeScript và các gói thư viện liên quan:

```bash
npm install
```

### Bước 3: Cấu hình biến môi trường (Tuỳ chọn)

Ứng dụng hoạt động hoàn toàn offline/client-side với toàn bộ ngân hàng câu hỏi và giáo trình nằm sẵn trong `src/data/` và `public/data/`. Nếu cần cấu hình biến môi trường, bạn có thể sao chép từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

### Bước 4: Khởi chạy máy chủ phát triển (Development Server)

```bash
npm run dev
```

Sau khi chạy lệnh trên, mở trình duyệt và truy cập địa chỉ:

- **URL Local**: [http://localhost:3000](http://localhost:3000)

### Bước 5: Kiểm tra kiểu dữ liệu (Type-check) & Build bản Production

Để kiểm tra lỗi cú pháp TypeScript:

```bash
npm run lint
```

Để đóng gói ứng dụng ra thư mục `dist/` phục vụ triển khai thực tế:

```bash
npm run build
```

Để chạy thử bản build production ngay trên máy local:

```bash
npm run preview
```

---

## 4. Hướng dẫn Đẩy (Push) Mã Nguồn lên GitHub

Nếu bạn vừa tải dự án về máy hoặc vừa chỉnh sửa thêm và muốn đẩy (push) lên GitHub cá nhân, hãy thực hiện theo một trong hai trường hợp dưới đây:

### Trường hợp A: Dự án chưa khởi tạo Git (Tải từ AI Studio về máy)

1. **Tạo một Repository mới trên GitHub**:
   - Truy cập [https://github.com/new](https://github.com/new).
   - Đặt tên repository (ví dụ: `vin20k-ai-phase1-phase2-quiz`).
   - Để trống phần *Add a README file* / *.gitignore* rồi nhấn **Create repository**.

2. **Khởi tạo Git tại thư mục dự án trên máy local và Push lên GitHub**:
   ```bash
   # 1. Khởi tạo Git repository
   git init

   # 2. Đổi tên nhánh mặc định thành main
   git branch -M main

   # 3. Thêm toàn bộ file vào vùng chờ (Staging)
   git add .

   # 4. Tạo bản ghi commit đầu tiên
   git commit -m "feat: initial release of Vin20K AI Phase 1 & Phase 2 study and quiz app"

   # 5. Liên kết với kho lưu trữ trên GitHub của bạn
   git remote add origin https://github.com/<TEN_USER_CUA_BAN>/vin20k-ai-phase1-phase2-quiz.git

   # 6. Đẩy code lên nhánh main
   git push -u origin main
   ```

### Trường hợp B: Dự án đã Clone từ GitHub về và bạn muốn cập nhật thay đổi mới

Sau khi chỉnh sửa nội dung hoặc thêm câu hỏi mới:

```bash
# 1. Kiểm tra các file đã thay đổi
git status

# 2. Thêm các file thay đổi vào staging
git add .

# 3. Tạo commit với ghi chú rõ ràng
git commit -m "update: cap nhat noi dung on tap va ngan hang cau hoi"

# 4. Push lên nhánh hiện tại trên GitHub
git push origin main
```

---

## 5. Triển khai nhanh lên Vercel (Tuỳ chọn)

Sau khi đã push mã nguồn lên GitHub, bạn có thể triển khai miễn phí lên **Vercel** chỉ trong 1 phút:

1. Đăng nhập [https://vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Nhấn **Add New...** → **Project** → Chọn repository `vin20k-ai-phase1-phase2-quiz`.
3. Giữ nguyên thiết lập mặc định của Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Nhấn **Deploy** để nhận đường link chia sẻ trực tuyến.

---

## 6. Cấu trúc thư mục dự án

```text
├── public/
│   ├── assets/aistudio/          # Ảnh chụp lộ trình Phase 2 gốc để đối chiếu
│   └── data/
│       ├── phase1_questions.json # Ngân hàng 2,000 câu hỏi trắc nghiệm Phase 1
│       └── phase1_course/        # Toàn văn 15 file giáo trình Markdown gốc của Phase 1
├── src/
│   ├── components/
│   │   ├── CurriculumView.tsx    # Giao diện lộ trình học (Thẻ chuyên sâu & Checklist tiến độ)
│   │   ├── TheoryReaderView.tsx  # Trình đọc lý thuyết, công thức toán & sơ đồ kiến trúc
│   │   ├── TimedExamView.tsx     # Động cơ thi thử tính giờ nghiêm ngặt & kiểm tra nhanh
│   │   └── AnalyticsView.tsx     # Ma trận thống kê năng lực & ngân hàng câu trả lời sai
│   ├── data/
│   │   ├── phase1Curriculum.ts   # Lý thuyết, công thức & sơ đồ của 15 Days Phase 1
│   │   ├── phase2Curriculum.ts   # Lý thuyết, công thức & sơ đồ của 12 Days Phase 2
│   │   ├── phase2Questions*.ts   # Ngân hàng câu hỏi trắc nghiệm chuyên sâu Phase 2
│   │   └── phase2Questions.ts    # Hợp nhất dữ liệu lộ trình và câu hỏi
│   ├── services/
│   │   └── studyStore.ts         # Quản lý dữ liệu, tạo đề ngẫu nhiên và lưu trữ localStorage
│   ├── types/
│   │   └── curriculum.ts         # Định nghĩa kiểu dữ liệu TypeScript
│   ├── App.tsx                   # Khung điều hướng chính của ứng dụng
│   ├── index.css                 # Cấu hình giao diện Tailwind CSS
│   └── main.tsx                  # Điểm khởi chạy React
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
