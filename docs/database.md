## 1. Tổng quan kiến trúc dữ liệu

Hệ thống sử dụng **PostgreSQL 16** (chạy bằng `docker compose`) để quản lý dữ liệu cho toàn bộ quy trình đồ án tốt nghiệp.

- Kiểu kiến trúc: **quan hệ, chuẩn hóa**, dùng nhiều **ENUM + CHECK constraint** để ràng buộc nghiệp vụ.
- Phân cụm theo 3 giai đoạn nghiệp vụ:
  - **Giai đoạn 1**: Đăng ký đề tài & thực hiện đồ án.
  - **Giai đoạn 2**: Bảo vệ đồ án.
  - **Giai đoạn 3**: Hoàn thiện & lưu trữ hồ sơ.

File schema & seed:

- `database/init.sql` – tạo toàn bộ bảng, kiểu ENUM, index, seed dữ liệu mẫu.

---

## 2. Kết nối & Docker Compose

File `docker-compose.yml`:

- Service: `postgres` (image `postgres:16`)
- Cấu hình:
  - `POSTGRES_USER`: `sad_admin`
  - `POSTGRES_PASSWORD`: `sad_secret_2026`
  - `POSTGRES_DB`: `thesis_management`
  - Mount: `./database/init.sql` → `/docker-entrypoint-initdb.d/01-init.sql`

Thông tin kết nối:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `thesis_management`
- **User**: `sad_admin`
- **Password**: `sad_secret_2026`

Command thường dùng:

```bash
docker compose up -d
docker compose down
docker exec -it sad-postgres psql -U sad_admin -d thesis_management
```

---

## 3. Tổ chức & người dùng

### 3.1. Phân cấp tổ chức

Phản ánh hierarchy:

```text
University → School → Faculty → Major → Student
```

- `universities`:
  - `id`, `code`, `name`
- `schools`:
  - `id`, `university_id → universities`, `code`, `name`
- `faculties`:
  - `id`, `school_id → schools`, `code`, `name`
- `majors`:
  - `id`, `faculty_id → faculties`, `code`, `name`
  - `required_credits`, `min_gpa_for_thesis` (điều kiện ĐATN theo ngành)
- `academic_years`:
  - `id`, `name`, `start_date`, `end_date` (CHECK `end_date > start_date`)

### 3.2. User & role (RBAC) – dùng SSO của trường

Hệ thống **KHÔNG tự xác thực username/password**, mà **uỷ quyền hoàn toàn cho SSO của trường** (ví dụ SAML/OIDC).  
Module Auth nội bộ chỉ giữ **mapping user + vai trò + thông tin nghiệp vụ**.

ENUM:

- `user_role`: `ADMIN`, `TRAINING_DEPT`, `DEPT_HEAD`, `LECTURER`, `STUDENT`
- `user_status`: `ACTIVE`, `LOCKED`, `INACTIVE`

Các bảng:

- `users`:
  - Thông tin định danh nội bộ + mapping sang SSO:
  - `username` – mã đăng nhập nội bộ (thường trùng mã cán bộ/mã SV).
  - `external_id` / `sso_subject` (trong schema DB: có thể dùng trường `username` hoặc bổ sung cột mới) – khóa chính từ SSO (sub / edu-id).
  - `email`, `phone`, `full_name`
  - `role`, `status`, `last_login_at` (ghi nhận lần truy cập gần nhất sau khi SSO callback thành công).
  - **Lưu ý**: các trường `password_hash`, `failed_login_count` không còn dùng cho đăng nhập – có thể bỏ qua trong triển khai thực tế hoặc giữ cho fallback.
- `password_history`:
  - Không dùng trong luồng SSO thông thường (vì mật khẩu do hệ thống SSO quản lý).  
  - Có thể tận dụng nếu hệ thống sau này cho phép **local admin login** song song với SSO.
- `students`:
  - Mở rộng `users` cho sinh viên:
  - `user_id`, `student_code`, `major_id → majors`, `cohort`
  - `gpa`, `accumulated_credits`, `eligible_for_thesis` (điều kiện giai đoạn 1)
- `lecturers`:
  - Mở rộng `users` cho giảng viên:
  - `user_id`, `lecturer_code`, `faculty_id → faculties`
  - `academic_rank`, `academic_degree`, `research_areas`
  - `max_students_per_batch`: số SV tối đa mỗi đợt đồ án.

---

## 4. Đợt đồ án (Thesis Batch)

ENUM:

- `batch_status`: `DRAFT`, `ACTIVE`, `CLOSED`, `ARCHIVED`

`thesis_batches` – do **Phòng Đào tạo** tạo:

- Thông tin chung:
  - `id`, `name`, `academic_year_id → academic_years`, `semester`, `status`
  - `created_by → users`
- Các mốc thời gian quan trọng:
  - `topic_reg_start`, `topic_reg_end` – mở/đóng đăng ký đề tài
  - `outline_start`, `outline_end` – nộp đề cương
  - `implementation_start`, `implementation_end` – thực hiện đồ án
  - `defense_reg_start`, `defense_reg_end` – đăng ký bảo vệ
  - `defense_start`, `defense_end` – tổ chức bảo vệ (giai đoạn 2)
- Nhiều `CHECK` đảm bảo logic ngày tháng.

Đây là **anchor chính** để filter dữ liệu theo học kỳ/năm.

---

## 5. Giai đoạn 1 – Đăng ký đề tài & thực hiện đồ án

Giai đoạn 1 dùng chủ yếu các bảng:

```text
users, students, lecturers,
thesis_batches, theses,
topics, topic_registrations,
outlines, progress_reports,
defense_registrations,
documents, notifications, audit_logs
```

### 5.1. Topics – Đề tài

ENUM:

- `topic_status`: `AVAILABLE`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `FULL`, `CLOSED`
- `topic_source`: `LECTURER`, `STUDENT`

`topics`:

- `batch_id → thesis_batches`
- `title`, `description`, `requirements`
- `max_students`, `current_students`
- `source` – đề tài do GV hay SV đề xuất
- `status` – dùng trong luồng duyệt đề tài & phân công
- `major_id → majors` – ràng buộc đề tài theo ngành
- `proposed_by → users` – người đề xuất
- `approved_by → users` – Trưởng ngành/Khoa duyệt
- `reject_reason`

### 5.2. Theses – Hồ sơ đồ án (theo từng sinh viên)

ENUM:

- `thesis_status`:
  - Bao phủ toàn bộ **state machine** giai đoạn 1 → 3:
  - `NOT_ELIGIBLE`, `ELIGIBLE_FOR_THESIS`,
  - `TOPIC_PENDING_APPROVAL`, `TOPIC_APPROVED`, `TOPIC_REJECTED`, `TOPIC_ASSIGNED`,
  - `OUTLINE_SUBMITTED`, `OUTLINE_APPROVED`, `OUTLINE_REJECTED`,
  - `IN_PROGRESS`,
  - `DEFENSE_REQUESTED`, `DEFENSE_APPROVED`, `DEFENSE_REJECTED`, `READY_FOR_DEFENSE`,
  - `DEFENDING`, `GRADED`, `PASSED`, `FAILED`, `COMPLETED`.

`theses`:

- `batch_id → thesis_batches`
- `student_id → students` (UNIQUE theo `batch_id`: mỗi SV tối đa 1 đồ án/đợt)
- `topic_id → topics`
- `advisor_id → lecturers`
- `status`
- Các trường điểm (dùng giai đoạn 2–3):
  - `advisor_score`, `council_score`, `final_score`, `grade`
  - `advisor_comment`

### 5.3. Topic Registrations – Đăng ký đề tài

ENUM:

- `registration_status`: `PENDING`, `APPROVED`, `REJECTED`

`topic_registrations`:

- `thesis_id → theses`
- `topic_id → topics`
- `student_id → students`
- `preferred_lecturer_id → lecturers` (case SV đề xuất kèm GV)
- `status`, `reject_reason`
- `reviewed_by → users`, `reviewed_at`

→ Phản ánh các bước:

- SV đăng ký đề tài (hoặc đề xuất đề tài mới).
- GV/Trưởng ngành duyệt → cập nhật `topics.current_students`, `theses.status`.

### 5.4. Outlines – Đề cương

ENUM:

- `outline_status`: `SUBMITTED`, `APPROVED`, `REJECTED`

`outlines`:

- `thesis_id → theses`
- `version` (hỗ trợ nhiều lần nộp – sửa – duyệt)
- `file_path`, `file_name`, `file_size`
- `status` – tương ứng `OUTLINE_SUBMITTED` / `OUTLINE_APPROVED` / `OUTLINE_REJECTED`
- `reviewer_comment`, `reviewed_by → lecturers`, `reviewed_at`, `submitted_at`

### 5.5. Progress Reports – Báo cáo tiến độ

ENUM:

- `progress_evaluation`: `NOT_REVIEWED`, `PASSED`, `FAILED`

`progress_reports`:

- `thesis_id → theses`
- `week_number`, `title`, `description`
- `file_path`
- `evaluation`, `reviewer_comment`, `reviewed_by → lecturers`, `reviewed_at`
- `submitted_at`

→ Lưu toàn bộ **log tiến độ** để GV đánh giá quá trình và làm minh chứng.

### 5.6. Defense Registrations – Đăng ký bảo vệ (kết thúc giai đoạn 1)

ENUM:

- `defense_reg_status`: `REQUESTED`, `APPROVED`, `REJECTED`

`defense_registrations`:

- `thesis_id → theses`
- `report_file`, `source_code`, `slide_file`
- `status`, `reject_reason`
- `reviewed_by → lecturers`, `reviewed_at`, `submitted_at`

→ Phù hợp với UC: SV upload báo cáo + code + slide, GVHD duyệt/từ chối.

---

## 6. Giai đoạn 2 – Bảo vệ đồ án

Giai đoạn 2 quan tâm tới:

```text
theses (status READY_FOR_DEFENSE → DEFENDING → GRADED),
councils, council_members,
rooms, defense_sessions, defense_assignments,
scores, score_approval,
documents, notifications, audit_logs
```

### 6.1. Councils & thành viên

ENUM:

- `council_member_role`: `CHAIR`, `SECRETARY`, `REVIEWER`, `MEMBER`

`councils`:

- `batch_id → thesis_batches`
- `name`, `major_id → majors`
- `max_theses`, `created_by → users`

`council_members`:

- `council_id → councils`
- `lecturer_id → lecturers`
- `role`
- UNIQUE `(council_id, lecturer_id)`

### 6.2. Defense Sessions & Assignments

`rooms`:

- `code`, `name`, `capacity`, `building`

`defense_sessions`:

- `council_id → councils`
- `room_id → rooms`
- `defense_date`, `start_time`, `end_time`

`defense_assignments`:

- `session_id → defense_sessions`
- `thesis_id → theses`
- `slot_order`, `slot_start`, `slot_end`
- UNIQUE `(thesis_id, session_id)`

→ Dùng cho quy trình: lập hội đồng, xếp lịch bảo vệ, tránh xung đột phòng & thời gian.

### 6.3. Scores – Chấm điểm

ENUM:

- `score_type`: `ADVISOR`, `CHAIR`, `REVIEWER`, `SECRETARY`, `MEMBER`

`scores`:

- `thesis_id → theses`
- `scorer_id → lecturers`
- `score_type`, `score`, `comment`, `scored_at`
- UNIQUE `(thesis_id, scorer_id, score_type)`

`score_approval`:

- 1–1 với `theses` (UNIQUE `thesis_id`)
- `final_score`, `grade`
- `approved_by → users` (Trưởng ngành/Khoa), `approved_at`

---

## 7. Giai đoạn 3 – Hoàn thiện & lưu trữ hồ sơ

Giai đoạn 3 chủ yếu:

- Chốt trạng thái `theses` (`GRADED` → `PASSED` / `FAILED` → `COMPLETED`).
- Lưu trữ tài liệu & biên bản.
- Thống kê/báo cáo.

### 7.1. Documents – Lưu trữ tài liệu

ENUM:

- `document_type`:
  - `OUTLINE`, `PROGRESS_REPORT`,
  - `FINAL_REPORT`, `SOURCE_CODE`, `SLIDE`,
  - `DEFENSE_MINUTES`, `OTHER`

`documents`:

- `thesis_id → theses`
- `doc_type`, `file_name`, `file_path`, `file_size`, `mime_type`
- `uploaded_by → users`, `uploaded_at`

### 7.2. Notifications & Audit Logs

ENUM:

- `notification_type`:
  - `BATCH_OPENED`, `TOPIC_APPROVED`, `TOPIC_REJECTED`,
  - `ADVISOR_ASSIGNED`, `OUTLINE_REVIEWED`,
  - `PROGRESS_REMINDER`, `DEFENSE_SCHEDULED`,
  - `SCORE_PUBLISHED`, `GENERAL`

`notifications`:

- `recipient_id → users`
- `type`, `title`, `message`, `is_read`
- `reference_type`, `reference_id` (liên kết mềm đến entity)
- `created_at`

`audit_logs`:

- `user_id → users`
- `action`, `entity_type`, `entity_id`
- `old_value`, `new_value` (JSONB)
- `ip_address`, `created_at`

→ Đáp ứng yêu cầu: **RBAC, audit log, thông báo tự động, minh bạch & truy vết**.

---

## 8. Mapping nhanh Giai đoạn → Bảng

### Giai đoạn 1 – Đăng ký đề tài & thực hiện

- Tổ chức & người dùng: `universities`, `schools`, `faculties`, `majors`, `users`, `students`, `lecturers`
- Đợt & eligibility: `academic_years`, `thesis_batches`, `theses`
- Đề tài & đăng ký: `topics`, `topic_registrations`
- Đề cương & tiến độ: `outlines`, `progress_reports`
- Đăng ký bảo vệ: `defense_registrations`
- Hỗ trợ: `documents`, `notifications`, `audit_logs`

### Giai đoạn 2 – Bảo vệ đồ án

- Hội đồng & lịch: `councils`, `council_members`, `rooms`, `defense_sessions`, `defense_assignments`
- Chấm điểm: `scores`, `score_approval`
- Vẫn dùng: `theses`, `documents`, `notifications`, `audit_logs`

### Giai đoạn 3 – Hoàn thiện & lưu trữ

- Trạng thái & điểm cuối: `theses`, `score_approval`
- Lưu trữ: `documents`
- Thống kê/báo cáo: dùng **query/view** trên các bảng trên (không cần bảng mới).

---

Tài liệu này đủ để:

- Vẽ **ERD** (diagram từ `init.sql`).
- Mapping trực tiếp sang **repository/entity** trong backend.
- Trình bày **phần Thiết kế CSDL** trong đồ án (có thể cắt bớt chi tiết index nếu cần ngắn gọn trong báo cáo). 
