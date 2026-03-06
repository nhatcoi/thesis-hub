# Bảo vệ đồ án tốt nghiệp

Giai đoạn 2 bắt đầu khi sinh viên đã được giảng viên hướng dẫn **duyệt đăng ký bảo vệ** ở giai đoạn 1 (thesis ở trạng thái `READY_FOR_DEFENSE`) và kết thúc khi **điểm bảo vệ được chốt** cho từng đồ án.

---

## 1. Mục tiêu giai đoạn 2

- Tổ chức **hội đồng bảo vệ** cho từng ngành/đợt.
- **Xếp lịch bảo vệ** (ngày, giờ, phòng, hội đồng) cho từng đồ án.
- Thực hiện buổi bảo vệ, **ghi nhận điểm** và kết quả đạt/không đạt.

Đầu vào:

- Các đồ án có trạng thái `READY_FOR_DEFENSE`.

Đầu ra:

- Điểm bảo vệ (`advisor_score`, `council_score`, `final_score`, `grade`).
- Trạng thái `thesis` sau bảo vệ: `GRADED` → `PASSED` / `FAILED`.

---

## 2. Actor tham gia

- **Phòng Đào tạo (PĐT)**: cấu hình đợt, lịch tổng thể, quy chế đánh giá.
- **Trưởng ngành / Trưởng khoa**: lập hội đồng, phân công đề tài vào hội đồng.
- **Chủ tịch / Thư ký / Phản biện / Uỷ viên hội đồng**.
- **Giảng viên hướng dẫn (GVHD)**.
- **Sinh viên**.

---

## 3. Lập hội đồng & phân công giảng viên (PĐT / Trưởng ngành)

### Thời điểm

- Sau khi chốt danh sách sinh viên đủ điều kiện bảo vệ (`READY_FOR_DEFENSE`).

### Bước nghiệp vụ

1. **Tạo hội đồng bảo vệ** cho từng ngành/đợt:

   - Bảng `councils`:
     - `batch_id` → `thesis_batches`.
     - `name` (VD: Hội đồng ĐATN CNTT K20-1).
     - `major_id` → `majors`.
     - `max_theses` (số đồ án tối đa hội đồng xử lý).

2. **Thêm thành viên hội đồng**:

   - Bảng `council_members`:
     - `council_id` → `councils`.
     - `lecturer_id` → `lecturers`.
     - `role` ∈ {`CHAIR`, `SECRETARY`, `REVIEWER`, `MEMBER`}.

3. **Khóa cấu hình hội đồng**:

   - Khi danh sách thành viên đã đủ, trạng thái hội đồng có thể chuyển sang **LOCKED**, tránh thay đổi trong lúc xếp lịch.

---

## 4. Xếp lịch bảo vệ (PĐT / Thư ký)

### Entity liên quan

- `defense_sessions`: phiên bảo vệ
  - `council_id` → hội đồng.
  - `date`, `start_time`, `end_time`.
  - `room_id` / `room_name`.
- `defense_assignments`: gán từng `thesis` vào một phiên.
  - `thesis_id` → `theses`.
  - `session_id` → `defense_sessions`.
  - `order_in_session` (thứ tự bảo vệ).

### Flow

1. PĐT/Thư ký tạo lịch các phiên bảo vệ:

   - Chọn hội đồng, phòng, ngày giờ, thời lượng mỗi đề tài.

2. Gán từng `thesis` có trạng thái `READY_FOR_DEFENSE` vào một phiên:

   - Kiểm tra không trùng lịch GVHD, SV, phòng (nếu có ràng buộc).
   - Lưu `order_in_session` để in lịch.

3. Hệ thống thông báo cho:

   - Sinh viên: thời gian, phòng, hội đồng.
   - Giảng viên hướng dẫn và thành viên hội đồng: danh sách SV sẽ bảo vệ trong phiên.

---

## 5. Chuẩn bị hồ sơ cho hội đồng

### Actor

- Thư ký hội đồng / PĐT.

### Dữ liệu sử dụng

- Từ Giai đoạn 1:
  - Hồ sơ đăng ký bảo vệ (`defense_registrations`):
    - `report_file`, `source_code`, `slide_file`.
  - Thông tin thesis: tên đề tài, SV, GVHD.

### Nghiệp vụ

- In hoặc xuất danh sách:
  - Danh sách SV theo phiên/hội đồng.
  - Phiếu nhận xét / phiếu điểm (nếu dùng bản giấy).
- Cung cấp đường link/file để hội đồng truy cập:
  - Báo cáo, slide, code, các file minh chứng khác.

---

## 6. Tiến hành buổi bảo vệ

### Actor

- Hội đồng (CHAIR, SECRETARY, REVIEWER, MEMBER).
- Giảng viên hướng dẫn.
- Sinh viên.

### Flow cho mỗi `defense_session`

1. **Điểm danh & khai mạc**:

   - Kiểm tra sự có mặt của SV, GVHD, thành viên hội đồng.

2. **Bảo vệ từng đồ án (theo `order_in_session`)**:

   - SV trình bày (thời lượng X phút).
   - Phản biện nhận xét, đặt câu hỏi.
   - Các thành viên khác đặt câu hỏi bổ sung.
   - SV trả lời, demo sản phẩm (nếu có).

3. **Chấm điểm & nhận xét**:

   - GVHD có thể đã chấm `advisor_score` từ trước hoặc ngay sau buổi bảo vệ.
   - Hội đồng chấm `council_score` (tổng hợp từ từng thành viên hoặc nhập trực tiếp).
   - Thư ký ghi lại:
     - `advisor_score`, `council_score`, `final_score`, `grade`.
     - Nhận xét tổng quan.

4. **Cập nhật trạng thái thesis**:

   - Trong lúc bảo vệ: có thể set `status = DEFENDING`.
   - Sau khi chốt điểm:
     - `status = GRADED`.

---

## 7. Chốt kết quả bảo vệ

### Quy tắc điểm & phân loại

- `final_score` = hàm từ `advisor_score`, `council_score` (VD: 30% GVHD + 70% hội đồng).
- `grade`: A, B, C, D, F (hoặc Xếp loại: Xuất sắc, Giỏi, Khá, Trung bình…).

### Trạng thái sau chấm điểm

- Nếu `final_score` ≥ ngưỡng đạt:
  - `status = PASSED`.
- Nếu `final_score` < ngưỡng đạt:
  - `status = FAILED`.

> Cả `PASSED` và `FAILED` đều là trạng thái **sau bảo vệ**; sẽ được xử lý ở Giai đoạn 3 để hoàn thiện hồ sơ và (nếu đạt) xét tốt nghiệp.

---

## 8. Tóm tắt trạng thái thesis trong Giai đoạn 2

```text
READY_FOR_DEFENSE
  ↓ (xếp hội đồng + lịch)
DEFENDING
  ↓ (chấm điểm)
GRADED
  ↓
PASSED / FAILED
```

Các trạng thái này là cầu nối qua Giai đoạn 3 – Hoàn thiện hồ sơ và lưu trữ. 