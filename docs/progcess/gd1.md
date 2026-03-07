Dưới đây là **Flow chi tiết Giai đoạn 1: Đăng ký đề tài và thực hiện đồ án tốt nghiệp** được viết theo **logic nghiệp vụ + điều kiện + thời gian + trạng thái hệ thống**. Cách trình bày này thường dùng trong **SRS / SAD / Activity Diagram**.

---

# GIAI ĐOẠN 1: ĐĂNG KÝ ĐỀ TÀI VÀ THỰC HIỆN ĐỒ ÁN

## 1. Bối cảnh tổ chức

Hệ thống đồ án hoạt động trong cấu trúc tổ chức nhiều tầng của trường đại học:

```text
University
└─ School (Trường)
   └─ Faculty (Khoa)
      └─ Major (Ngành)
         └─ Student (Sinh viên)
```

- **Phòng Đào tạo**: cấp University, mở đợt đồ án và quản lý toàn bộ dữ liệu sinh viên theo khóa.
- **School (Trường)**: tập hợp nhiều khoa, nhận báo cáo/tổng hợp tình hình đồ án của các khoa thuộc trường.
- **Faculty/Khoa & Major/Ngành**: nơi Trưởng ngành/Khoa quản lý danh sách sinh viên đủ điều kiện, đề tài, phân công giảng viên.

## 2. Mục tiêu giai đoạn

Giai đoạn này nhằm:

* Xác định **đề tài đồ án**
* Phân công **giảng viên hướng dẫn**
* Phê duyệt **đề cương**
* Cho phép sinh viên **thực hiện đồ án**
* Kiểm tra đủ điều kiện **đăng ký bảo vệ**

---

# 1️⃣ Khởi tạo đợt đồ án

### Actor

- Phòng Đào tạo (PĐT)
- Trường/Khoa/Ngành (tùy quy chế)
- Hệ thống

### Thời gian

- Trước khi bắt đầu học kỳ hoặc ngay đầu học kỳ.

### Flow

1. **Phòng Đào tạo** tạo mới một đợt đồ án tốt nghiệp cấp trường.

Ví dụ:

```
Thesis K20 – HK2 – 2026
```

2. PĐT thiết lập **khung mốc thời gian chung** cho toàn hệ thống:

| Hoạt động            | Khoảng thời gian ví dụ |
| -------------------- | ---------------------- |
| Đăng ký đề tài       | 01/03 – 07/03          |
| Nộp & duyệt đề cương | 08/03 – 21/03          |
| Thực hiện đồ án      | 22/03 – 31/05          |
| Đăng ký bảo vệ       | 01/06 – 07/06          |

3. (Tùy quy chế) Trường/Khoa/Ngành có thể tinh chỉnh chi tiết mốc thời gian, quy định nội bộ trên **cùng một khung đợt**.

4. Hệ thống lưu cấu hình đợt, đặt trạng thái đợt là **ACTIVE**.

5. Hệ thống mở **trạng thái “đăng ký đề tài”** cho sinh viên & giảng viên trong khoảng `topic_reg_start` – `topic_reg_end`.

---

# 2️⃣ Lập danh sách sinh viên làm đồ án

### Actor

- Phòng Đào tạo
- Trưởng ngành
- Hệ thống

### Điều kiện

- Đã có **đợt đồ án ACTIVE**.

### Flow

1. **Phòng Đào tạo** import danh sách **toàn bộ sinh viên của khóa** (file từ hệ thống quản lý đào tạo).
2. Hệ thống lưu dữ liệu vào bảng `Student` (kèm thông tin khoa/ngành, GPA, tín chỉ tích lũy,…).
3. Hệ thống tự động **kiểm tra điều kiện làm đồ án** cho từng sinh viên:

   - GPA ≥ ngưỡng tối thiểu (`majors.min_gpa_for_thesis`).
   - Tín chỉ tích lũy ≥ `majors.required_credits` (hoặc một ngưỡng được cấu hình).
   - Không nợ các môn bắt buộc.

4. Hệ thống gán:

   - Nếu **đủ điều kiện**:

     ```
     ELIGIBLE_FOR_THESIS
     ```

   - Nếu **không đủ điều kiện**:

     ```
     NOT_ELIGIBLE
     ```

5. **Trưởng ngành** truy cập màn hình “Danh sách sinh viên đồ án” và chỉ nhìn thấy:

   - Các sinh viên thuộc **ngành mình quản lý**.
   - Ở trạng thái `ELIGIBLE_FOR_THESIS`.

6. Hệ thống **khóa luồng đăng ký đề tài** đối với các sinh viên `NOT_ELIGIBLE` (không cho tham gia giai đoạn 1).

---

# 3️⃣ Giảng viên đăng ký đề tài

### Actor

Giảng viên

### Thời gian

Trong thời gian **mở đăng ký đề tài**.

### Flow

1. Giảng viên tạo đề tài:

```
Tên đề tài
Mô tả
Số lượng sinh viên tối đa
```

2. Hệ thống lưu đề tài.

Trạng thái:

```
AVAILABLE
```

3. Đề tài hiển thị cho sinh viên lựa chọn.

---

# 4️⃣ Sinh viên lựa chọn hoặc đề xuất đề tài

### Actor

Sinh viên

Sinh viên có **2 lựa chọn**.

---

# TRƯỜNG HỢP 1 — Chọn đề tài có sẵn

Flow:

1. Sinh viên xem danh sách đề tài.
2. Sinh viên chọn đề tài.
3. Hệ thống gửi yêu cầu đăng ký cho giảng viên.

Trạng thái:

```
TOPIC_PENDING_APPROVAL
```

4. Giảng viên xem yêu cầu.

### Nếu giảng viên đồng ý

```
TOPIC_APPROVED
```

Sinh viên được gán đề tài.

### Nếu giảng viên từ chối

```
TOPIC_REJECTED
```

Sinh viên phải chọn lại đề tài.

---

# TRƯỜNG HỢP 2 — Sinh viên đề xuất đề tài

Sinh viên có thể:

```
đề xuất đề tài
```

### Case 1: Có đề xuất giảng viên

Flow:

1. Sinh viên gửi đề xuất.
2. Hệ thống gửi yêu cầu đến giảng viên.

### Nếu giảng viên đồng ý

```
TOPIC_APPROVED
```

### Nếu giảng viên từ chối

```
TOPIC_REJECTED
```

Sinh viên phải:

```
đề xuất lại
hoặc chọn đề tài khác
```

---

### Case 2: Không đề xuất giảng viên

Flow:

1. Sinh viên gửi đề tài đề xuất.
2. Hệ thống gửi yêu cầu cho **trưởng ngành**.
3. Trưởng ngành phân công giảng viên hướng dẫn.

Trạng thái:

```
TOPIC_ASSIGNED
```

---

# 5️⃣ Nộp đề cương đồ án

### Actor

Sinh viên

### Điều kiện

```
TOPIC_APPROVED
```

### Thời gian

Trong thời gian **nộp đề cương (2 tuần)**.

### Flow

1. Sinh viên upload file đề cương.
2. Hệ thống lưu đề cương.

Trạng thái:

```
OUTLINE_SUBMITTED
```

---

# 6️⃣ Giảng viên duyệt đề cương

### Actor

Giảng viên hướng dẫn

### Flow

1. Giảng viên xem đề cương.

### Nếu đề cương đạt

```
OUTLINE_APPROVED
```

Sinh viên được phép làm đồ án.

---

### Nếu đề cương chưa đạt

```
OUTLINE_REJECTED
```

Giảng viên ghi nhận xét.

Sinh viên phải:

```
chỉnh sửa đề cương
nộp lại
```

---

# 7️⃣ Sinh viên thực hiện đồ án

### Actor

Sinh viên

### Thời gian

```
8–10 tuần
```

Trong giai đoạn này:

Sinh viên có thể:

```
upload tiến độ
nộp bản demo
```

Giảng viên có thể:

```
đánh giá tiến độ
```

Trạng thái:

```
IN_PROGRESS
```

---

# 8️⃣ Sinh viên đăng ký bảo vệ

### Actor

Sinh viên

### Điều kiện

```
đã hoàn thành đồ án
```

### Flow

1. Sinh viên upload:

```
báo cáo cuối
source code
slide
```

2. Sinh viên gửi **đăng ký bảo vệ**.

Trạng thái:

```
DEFENSE_REQUESTED
```

---

# 9️⃣ Giảng viên duyệt đăng ký bảo vệ

### Actor

Giảng viên hướng dẫn

### Flow

Giảng viên xem:

```
báo cáo
kết quả đồ án
```

---

### Nếu đồng ý

```
DEFENSE_APPROVED
```

Sinh viên đủ điều kiện bảo vệ.

Chuyển sang:

```
GIAI ĐOẠN 2
```

---

### Nếu không đồng ý

```
DEFENSE_REJECTED
```

Sinh viên phải:

```
chỉnh sửa đồ án
```

và **đăng ký lại**.

---

# 🔟 Trạng thái toàn bộ đồ án

```
ELIGIBLE_FOR_THESIS
↓
TOPIC_PENDING_APPROVAL
↓
TOPIC_APPROVED
↓
OUTLINE_SUBMITTED
↓
OUTLINE_APPROVED
↓
IN_PROGRESS
↓
DEFENSE_REQUESTED
↓
DEFENSE_APPROVED
```

---

# 11️⃣ Tóm tắt timeline giai đoạn 1

| Tuần      | Hoạt động             |
| --------- | --------------------- |
| Tuần 1    | đăng ký đề tài        |
| Tuần 2–3  | nộp và duyệt đề cương |
| Tuần 4–12 | thực hiện đồ án       |
| Tuần 13   | đăng ký bảo vệ        |

---

# 12️⃣ Kết thúc giai đoạn 1

Giai đoạn 1 kết thúc khi:

```
sinh viên được giảng viên duyệt bảo vệ
```

Trạng thái:

```
READY_FOR_DEFENSE
```

Sau đó hệ thống chuyển sang:

```
GIAI ĐOẠN 2
Bảo vệ đồ án
```

---

💡 Nếu bạn muốn, mình có thể làm thêm **3 thứ cực quan trọng cho đồ án này**:

1️⃣ **Activity Diagram chuẩn cho Giai đoạn 1 (rất quan trọng khi nộp đồ án)**
2️⃣ **Use Case Diagram full hệ thống**
3️⃣ **Database schema chuẩn cho hệ thống quản lý đồ án**

Mấy phần này sẽ giúp đồ án của bạn **trông giống hệ thống thật chứ không phải CRUD app**.



----------- CODING ------------
Tính năng **"Khởi tạo đợt đồ án"** đã được phát triển hoàn chỉnh. Tổng hợp:

---

### Các file đã tạo/cập nhật

**1. Auth Layer (mới)**
- `UserSyncService.java` -- Sync user OIDC (Zitadel) vào bảng `users` local mỗi khi login. Tìm theo `external_id` hoặc `email`, nếu chưa có thì tạo mới.
- `CurrentUserService.java` -- Resolve user hiện tại từ Security Context, hỗ trợ cả 2 flow:
  - **Session** (OAuth2 Login) → `OidcUser` → sync & trả User
  - **JWT** (Bearer token) → tìm User theo `external_id`
- `AuthController.java` -- Cập nhật `/api/auth/me` để trả thêm `local_user_id` và `local_role` sau khi sync.

**2. ThesisBatch & Student Enhancements (Cập nhật)**

| Tính năng | Backend | Frontend |
|---|---|---|
| Mốc thời gian đợt | `TIMESTAMPTZ` / `OffsetDateTime` | `datetime-local`, hiển thị `HH:mm` |
| Hồ sơ sinh viên | Thêm `class_name` (lớp học) | Hiển thị + form nhập lớp học |
| UI Giảng viên | API detect active batch | Hiển thị timeline + giới hạn tạo đề tài |

**3. Validation & Fixes**
- Kiểm tra ngày bắt đầu < ngày kết thúc (Time-aware với `OffsetDateTime`)
- Sửa lỗi fetch roles pagination trong `UserService` (sử dụng `distinct` trong Specification)
- Sửa lỗi khoảng trắng trong tham số sort frontend (`sort=username,asc`)
- Chế độ state machine: `DRAFT → ACTIVE → CLOSED`

**4. Response bọc trong `ApiResponse`** -- trả JSON chuẩn `{ success, message, data, timestamp }` cho tất cả API.

Backend đã build thành công và đang chạy tại `http://localhost:8080`. Swagger UI truy cập tại `http://localhost:8080/swagger-ui.html`.


------ UI ----
APP ROOT
├─ Đăng nhập (SSO Zitadel)
│  ├─ Chọn vai trò (nếu user có nhiều role)
│  └─ Chuyển về Dashboard theo vai trò chính
│
├─ Dashboard
│  ├─ Thông tin đợt đồ án hiện tại (ACTIVE / tên / mốc thời gian)
│  ├─ Trạng thái đồ án của người dùng (nếu là sinh viên)
│  └─ Menu điều hướng theo role (PĐT / Trưởng ngành / Giảng viên / Sinh viên)
│
├─ Phòng Đào tạo (PĐT)
│  ├─ Quản lý đợt đồ án
│  │  ├─ Danh sách đợt đồ án
│  │  │  ├─ Tạo mới đợt (tên, khóa, HK, năm)
│  │  │  ├─ Thiết lập mốc thời gian:
│  │  │  │  ├─ Đăng ký đề tài
│  │  │  │  ├─ Nộp đề cương
│  │  │  │  ├─ Thực hiện đồ án
│  │  │  │  └─ Đăng ký bảo vệ
│  │  │  └─ Đổi trạng thái: DRAFT → ACTIVE → CLOSED (theo rule)
│  │  └─ Chi tiết 1 đợt:
│  │     ├─ Timeline, trạng thái
│  │     └─ Thống kê nhanh (số SV eligible, số đề tài, …)
│  │
│  └─ Import sinh viên
│     ├─ Upload file (students_xxx.xlsx)
│     ├─ Map cột → preview dữ liệu
│     ├─ Validate (format, thiếu cột)
│     └─ Kết quả:
│        ├─ Danh sách SV + trạng thái: ELIGIBLE_FOR_THESIS / NOT_ELIGIBLE
│        └─ Xuất log lỗi (nếu có)
│
├─ Trưởng ngành
│  ├─ Danh sách sinh viên đồ án (theo ngành)
│  │  ├─ Filter: đợt, khóa, trạng thái eligibility
│  │  ├─ Xem chỉ sinh viên ELIGIBLE_FOR_THESIS
│  │  └─ Xem chi tiết 1 SV:
│  │     ├─ Thông tin học tập (GPA, tín chỉ, nợ môn)
│  │     └─ Trạng thái đồ án hiện tại (nếu đã vào flow)
│  │
│  └─ Quản lý đề tài sinh viên đề xuất (không chỉ định GV)
│     ├─ Danh sách đề tài đề xuất
│     ├─ Xem chi tiết (mô tả, SV đề xuất)
│     └─ Phân công giảng viên:
│        └─ Chọn GV → set TOPIC_ASSIGNED
│
├─ Giảng viên
│  ├─ Quản lý đề tài của tôi
│  │  ├─ Tự động nhận diện Đợt ĐATN đang hoạt động (ACTIVE)
│  │  ├─ Hiển thị timeline: Thời gian đăng ký đề tài (giờ:phút)
│  │  ├─ Trạng thái đăng ký: Đang mở / Chưa mở / Đã kết thúc
│  │  ├─ Danh sách đề tài: Lọc theo trạng thái, ngành học
│  │  ├─ Chỉ cho phép "Tạo đề tài mới" khi trong hạn đăng ký
│  │  └─ Xem số SV đã nhận / còn slot
│  │
│  ├─ Yêu cầu đăng ký đề tài
│  │  ├─ Danh sách yêu cầu (TOPIC_PENDING_APPROVAL)
│  │  ├─ Xem chi tiết SV (GPA, credits, ghi chú)
│  │  └─ Quyết định:
│  │     ├─ Chấp nhận → TOPIC_APPROVED (gán SV vào đề tài)
│  │     └─ Từ chối → TOPIC_REJECTED
│  │
│  ├─ Duyệt đề cương
│  │  ├─ Danh sách đề cương chờ duyệt (OUTLINE_SUBMITTED)
│  │  ├─ Xem file đề cương + lịch sử nộp
│  │  └─ Quyết định:
│  │     ├─ Duyệt → OUTLINE_APPROVED
│  │     └─ Từ chối → OUTLINE_REJECTED + nhập nhận xét
│  │
│  ├─ Theo dõi tiến độ đồ án
│  │  ├─ Danh sách SV/nhóm đang IN_PROGRESS
│  │  ├─ Timeline cập nhật tiến độ (log: ngày, nội dung, file demo)
│  │  └─ Nhập nhận xét từng mốc (đạt/không đạt, góp ý)
│  │
│  └─ Duyệt đăng ký bảo vệ
│     ├─ Danh sách yêu cầu DEFENSE_REQUESTED
│     ├─ Xem hồ sơ:
│     │  ├─ Báo cáo cuối
│     │  ├─ Source code
│     │  └─ Slide
│     └─ Quyết định:
│        ├─ Duyệt → DEFENSE_APPROVED + READY_FOR_DEFENSE
│        └─ Từ chối → DEFENSE_REJECTED + lý do
│
└─ Sinh viên
   ├─ Dashboard đồ án của tôi
   │  ├─ Thông tin đợt + mốc thời gian chi tiết (ngày giờ)
   │  ├─ Timeline các giai đoạn theo tuần (1–13)
   │  ├─ Trạng thái hiện tại:
   │  │  ├─ ELIGIBLE_FOR_THESIS
   │  │  ├─ TOPIC_PENDING_APPROVAL / APPROVED / REJECTED
   │  │  ├─ OUTLINE_SUBMITTED / APPROVED / REJECTED
   │  │  ├─ IN_PROGRESS
   │  │  ├─ DEFENSE_REQUESTED
   │  │  └─ DEFENSE_APPROVED / REJECTED
   │  └─ Checklist việc cần làm tiếp theo
   │
   ├─ Đăng ký / đề xuất đề tài
   │  ├─ Tab 1: Chọn đề tài có sẵn
   │  │  ├─ Danh sách đề tài AVAILABLE (lọc theo ngành)
   │  │  ├─ Xem chi tiết đề tài
   │  │  └─ Nút "Đăng ký" → tạo TOPIC_PENDING_APPROVAL
   │  └─ Tab 2: Đề xuất đề tài mới
   │     ├─ Form mô tả đề tài
   │     ├─ Chọn:
   │     │  ├─ Có đề xuất giảng viên → gửi cho GV đó
   │     │  └─ Không đề xuất → gửi cho Trưởng ngành
   │     └─ Xem trạng thái: TOPIC_APPROVED / REJECTED / ASSIGNED
   │
   ├─ Nộp & sửa đề cương
   │  ├─ Upload đề cương (OUTLINE_SUBMITTED)
   │  ├─ Xem trạng thái duyệt + nhận xét
   │  └─ Nộp lại khi OUTLINE_REJECTED
   │
   ├─ Cập nhật tiến độ đồ án
   │  ├─ Tạo bản ghi tiến độ (mô tả, file đính kèm)
   │  ├─ Xem lịch sử tiến độ + nhận xét GV
   │  └─ Thông tin trạng thái tổng: IN_PROGRESS
   │
   ├─ Đăng ký bảo vệ
   │  ├─ Upload:
   │  │  ├─ Báo cáo cuối
   │  │  ├─ Source code
   │  │  └─ Slide
   │  ├─ Nút "Gửi đăng ký bảo vệ" → DEFENSE_REQUESTED
   │  └─ Xem kết quả duyệt: DEFENSE_APPROVED / DEFENSE_REJECTED + lý do
   │
   └─ Thông báo & lịch sử
      ├─ Danh sách thông báo (đề tài được duyệt, đề cương bị từ chối, nhắc deadline…)
      └─ Lọc theo loại (đề tài / đề cương / tiến độ / bảo vệ)
