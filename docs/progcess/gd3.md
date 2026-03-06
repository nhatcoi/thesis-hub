# Hoàn thiện hồ sơ sau bảo vệ để lưu trữ

Giai đoạn 3 bắt đầu sau khi sinh viên **đã bảo vệ xong và có điểm chính thức** (thesis ở trạng thái `PASSED` / `FAILED`) và kết thúc khi:

- Hồ sơ đồ án được **hoàn thiện** (bản báo cáo cuối, code, slide…),
- Kết quả được **chốt để xét tốt nghiệp**,
- Hồ sơ được **lưu trữ lâu dài**.

---

## 1. Mục tiêu giai đoạn 3

- Thu thập và chuẩn hóa **hồ sơ đồ án cuối cùng** sau bảo vệ.
- Ghi nhận **kết quả bảo vệ chính thức** (điểm, xếp loại).
- Cập nhật trạng thái **thesis** và (nếu cần) **trạng thái sinh viên** để phục vụ xét tốt nghiệp.
- Lưu trữ hồ sơ để:
  - Tra cứu nội bộ (GV, Khoa, PĐT),
  - Tham khảo cho sinh viên khóa sau (nếu chính sách cho phép),
  - Phục vụ kiểm định / thanh tra.

---

## 2. Actor tham gia

- **Sinh viên**: nộp bản chỉnh sửa sau bảo vệ (nếu có yêu cầu).
- **Giảng viên hướng dẫn**: duyệt bản hoàn thiện, xác nhận đã sửa lỗi theo góp ý.
- **Chủ tịch / Thư ký hội đồng**: xác nhận điểm cuối cùng, ký biên bản.
- **Phòng Đào tạo**: chốt kết quả, cập nhật vào hệ thống xét tốt nghiệp, tổ chức lưu trữ.

---

## 3. Nộp bản cuối sau bảo vệ (Final Submission)

### Bối cảnh

- Sau buổi bảo vệ, hội đồng có thể yêu cầu:
  - Sửa nội dung báo cáo,
  - Bổ sung phụ lục, tài liệu,
  - Cập nhật code, hướng dẫn sử dụng…

### Flow

1. **Ghi nhận yêu cầu chỉnh sửa**

   - Trong biên bản bảo vệ hoặc phần nhận xét:
     - Hội đồng / GVHD ghi **các điểm cần chỉnh sửa**.
   - Hệ thống có thể lưu vào:
     - Trường `advisor_comment` trong `theses`,
     - Hoặc một bảng `final_submissions` / `defense_registrations` mở rộng với trường `fix_required_notes`.

2. **Sinh viên chỉnh sửa và nộp bản cuối**

   - Sinh viên upload:
     - `final_report_file` (báo cáo đã chỉnh sửa),
     - `final_slide_file`,
     - `final_source_code` (mã nguồn cuối, hoặc link repo),
     - Các file bổ sung (nếu có).
   - Trạng thái nộp:

   ```text
   PENDING_FIX      (mới tạo yêu cầu chỉnh sửa)
   FIX_SUBMITTED   (SV đã nộp bản sửa)
   ```

3. **Giảng viên/hội đồng duyệt bản đã sửa**

   - GVHD hoặc Chủ tịch hội đồng:
     - Xem file đã nộp,
     - Đối chiếu với yêu cầu chỉnh sửa.
   - Kết quả:

   ```text
   FIX_APPROVED    → Hồ sơ được chấp nhận làm bản chính thức
   FIX_REJECTED    → Cần SV chỉnh sửa lại (quay về FIX_SUBMITTED nhiều vòng)
   ```

4. **Chốt bản chính thức**

   - Khi trạng thái là `FIX_APPROVED`:
     - Đánh dấu bộ file này là **Final** cho thesis.
     - Không cho phép SV nộp thêm (trừ khi mở lại bởi PĐT/GVHD).

---

## 4. Chốt kết quả & cập nhật trạng thái thesis

### Dữ liệu chấm điểm

- `advisor_score`: điểm GVHD.
- `council_score`: điểm hội đồng.
- `final_score`: điểm tổng hợp theo quy chế.
- `grade`: xếp loại.

### Nghiệp vụ

1. **Kiểm tra đầy đủ dữ liệu**

   - Đã có:
     - Điểm (`final_score`, `grade`),
     - Trạng thái bảo vệ (`PASSED` / `FAILED`),
     - Hồ sơ final đã `FIX_APPROVED` (nếu có yêu cầu sửa).

2. **Đặt trạng thái thesis là `COMPLETED`**

   - Cập nhật:

   ```text
   GRADED → PASSED / FAILED → COMPLETED
   ```

   - Ghi `completed_at` (ngày hoàn tất).

3. **Ghi log / lịch sử**

   - Ghi vào `audit_logs` thao tác:
     - Chốt điểm,
     - Xác nhận hoàn thiện hồ sơ.

---

## 5. Cập nhật trạng thái sinh viên & xét tốt nghiệp

Tùy mức độ tích hợp với hệ thống quản lý đào tạo chính, có hai cách:

### Cách 1 – Hệ thống đồ án chỉ lưu trạng thái đồ án

- `students` chỉ giữ thông tin học vụ cơ bản.
- Hệ thống khác (Quản lý đào tạo) sẽ đọc:
  - `theses` với `status = COMPLETED` + `PASSED`,
  - và sử dụng để xét tốt nghiệp.

### Cách 2 – Hệ thống đồ án lưu thêm trạng thái sinh viên

- Bổ sung vào `students`:

```text
student_status:
  - IN_BATCH          (đang trong đợt đồ án)
  - THESIS_COMPLETED  (đã hoàn thành đồ án)
  - GRADUATED         (đã công nhận tốt nghiệp)
```

- Khi thesis `COMPLETED` và `PASSED`:
  - Set `student_status = THESIS_COMPLETED`.
- Khi PĐT chốt tốt nghiệp (có thể từ hệ thống khác):
  - Set `student_status = GRADUATED`.

---

## 6. Lưu trữ & tra cứu hồ sơ đồ án

### Nội dung cần lưu trữ

Cho mỗi `thesis`:

- Thông tin chung:
  - Sinh viên (họ tên, mã SV, ngành, khóa).
  - Tên đề tài, GVHD, đợt đồ án (năm học, học kỳ, ngành).
- Hồ sơ file:
  - Báo cáo cuối (PDF),
  - Slide,
  - Source code (zip hoặc link repo),
  - Biên bản bảo vệ, phiếu điểm, nhận xét.
- Kết quả:
  - `advisor_score`, `council_score`, `final_score`, `grade`,
  - `status = COMPLETED`, `completed_at`.

### Nghiệp vụ tra cứu

- **PĐT / Khoa / Ngành**:
  - Tra cứu theo năm, đợt, khoa, ngành, GVHD, xếp loại.
  - Lấy dữ liệu phục vụ:
    - Thống kê số lượng đề tài,
    - Phân bố điểm, tỷ lệ pass/fail,
    - Báo cáo cho Ban giám hiệu / kiểm định.

- **Giảng viên**:
  - Xem lại các đồ án đã hướng dẫn,
  - Lấy báo cáo/code để tham khảo, giới thiệu cho SV mới.

- **Sinh viên (nội bộ)**:
  - (Tùy chính sách) xem danh sách đề tài khóa trước:
    - Tên đề tài, tóm tắt, GVHD, năm, xếp loại,
    - Link báo cáo mẫu (nếu được phép).

---

## 7. Tóm tắt luồng trạng thái từ Giai đoạn 1 → 3

```text
GĐ1: ELIGIBLE_FOR_THESIS
     → TOPIC_* → OUTLINE_* → IN_PROGRESS
     → DEFENSE_REQUESTED → DEFENSE_APPROVED
     → READY_FOR_DEFENSE

GĐ2: READY_FOR_DEFENSE → DEFENDING → GRADED → PASSED / FAILED

GĐ3: PASSED / FAILED → (HOÀN THIỆN HỒ SƠ) → COMPLETED
      → (tích hợp hệ đào tạo) → GRADUATED
```

Giai đoạn 3 giúp đảm bảo **hồ sơ đồ án đầy đủ, kết quả rõ ràng, dữ liệu được lưu trữ chuẩn hóa**, sẵn sàng phục vụ cho **thống kê, kiểm định và tham khảo học thuật**. 