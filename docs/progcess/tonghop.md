```text
TỔ CHỨC QUẢN LÝ (HIERARCHY)
University
└─ School (Trường)
   └─ Faculty (Khoa)
      └─ Major (Ngành)
         └─ Student (Sinh viên)

GIAI ĐOẠN 1: ĐĂNG KÝ ĐỀ TÀI & THỰC HIỆN ĐỒ ÁN
├─ 1. Khởi tạo đợt đồ án
│  ├─ Actor: Phòng Đào tạo, Trường/Khoa/Ngành, Hệ thống
│  ├─ Nghiệp vụ Phòng Đào tạo
│  │  ├─ Tạo đợt đồ án mới cấp trường (tên, học kỳ, năm, khóa)
│  │  └─ Thiết lập khung mốc thời gian chi tiết (bao gồm cả giờ/phút - TIMESTAMPTZ):
│  │     ├─ Thời gian đăng ký đề tài (Start/End)
│  │     ├─ Thời gian nộp đề cương (Start/End)
│  │     ├─ Thời gian thực hiện đồ án (Start/End)
│  │     └─ Thời gian đăng ký bảo vệ (Start/End)
│  ├─ Nghiệp vụ Trường/Khoa/Ngành
│  │  └─ (Tùy quy chế) Có thể tinh chỉnh mốc thời gian, quy định chi tiết theo ngành
│  └─ Nghiệp vụ Hệ thống
│     ├─ Lưu cấu hình đợt đồ án
│     ├─ Mở trạng thái "đăng ký đề tài" cho sinh viên & giảng viên
│     └─ Áp dụng kiểm tra hạn thời gian ở các bước sau (deadline‑based)

├─ 2. Lập danh sách sinh viên làm đồ án
│  ├─ Actor: Phòng Đào tạo, Trưởng ngành, Hệ thống
│  ├─ Nghiệp vụ Phòng Đào tạo
│  │  └─ Import danh sách **toàn bộ sinh viên của khóa** từ hệ thống đào tạo (file, form…)
│  ├─ Nghiệp vụ Hệ thống
│  │  ├─ Lưu dữ liệu sinh viên (khoa/ngành, lớp học, khóa, GPA, tín chỉ tích lũy,…)
│  │  ├─ Kiểm tra điều kiện làm đồ án (GPA, tín chỉ, nợ môn bắt buộc…)
│  │  ├─ Gán trạng thái:
│  │  │  ├─ `ELIGIBLE_FOR_THESIS` nếu đủ điều kiện (ứng viên làm đồ án)
│  │  │  └─ `NOT_ELIGIBLE` nếu không đủ điều kiện
│  │  └─ Chặn sinh viên `NOT_ELIGIBLE` khỏi luồng đăng ký đề tài (không cho đi tiếp giai đoạn 1)
│  └─ Nghiệp vụ Trưởng ngành
│     ├─ Xem danh sách sinh viên thuộc **ngành mình quản lý** ở trạng thái `ELIGIBLE_FOR_THESIS`
│     └─ Chọn / duyệt danh sách sinh viên chính thức tham gia từng **đợt đồ án** (có thể loại bớt, khóa tham gia)

├─ 3. Giảng viên đăng ký đề tài
│  ├─ Actor: Giảng viên, Hệ thống
│  ├─ Nghiệp vụ Giảng viên
│  │  ├─ Tạo mới đề tài:
│  │  │  ├─ Tên đề tài
│  │  │  ├─ Mô tả
│  │  │  └─ Số lượng sinh viên tối đa
│  │  └─ (Có thể cập nhật/chỉnh sửa đề tài trong thời gian mở đăng ký) (implicit)
│  └─ Nghiệp vụ Hệ thống
│     ├─ Lưu đề tài ở trạng thái `AVAILABLE`
│     ├─ Hiển thị danh sách đề tài cho sinh viên đủ điều kiện
│     └─ Ẩn/khóa đề tài nếu đã đủ số lượng sinh viên (implicit rule)

├─ 4. Sinh viên lựa chọn hoặc đề xuất đề tài
│  ├─ Actor: Sinh viên, Giảng viên, Trưởng ngành, Hệ thống
│  ├─ Điều kiện chung: sinh viên ở trạng thái `ELIGIBLE_FOR_THESIS`
│  ├─ Trường hợp 1: Chọn đề tài có sẵn
│  │  ├─ Nghiệp vụ Sinh viên
│  │  │  ├─ Xem danh sách đề tài `AVAILABLE`
│  │  │  └─ Đăng ký đề tài (ai đăng ký trước được ưu tiên)
│  │  └─ Nghiệp vụ Hệ thống
│  │     ├─ Kiểm tra đề tài còn slot, trong thời hạn đăng ký
│  │     ├─ Gán ngay sinh viên vào đề tài (không chờ duyệt)
│  │     ├─ Gán trạng thái `TOPIC_ASSIGNED`, gán GVHD từ đề tài
│  │     └─ Tự động hủy các đăng ký PENDING khác của sinh viên trong cùng đợt
│  └─ Trường hợp 2: Sinh viên đề xuất đề tài mới
│     ├─ Nhánh 2.1: Có đề xuất giảng viên
│     │  ├─ Nghiệp vụ Sinh viên
│     │  │  ├─ Nhập thông tin đề tài đề xuất
│     │  │  └─ Chỉ định giảng viên mong muốn
│     │  ├─ Nghiệp vụ Hệ thống
│     │  │  └─ Gửi yêu cầu đề tài + đề xuất GV đến giảng viên đó
│     │  └─ Nghiệp vụ Giảng viên
│     │     ├─ Xem đề xuất đề tài của sinh viên
│     │     ├─ Đồng ý → `TOPIC_APPROVED`, sinh viên có đề tài + GVHD
│     │     └─ Từ chối → `TOPIC_REJECTED`, sinh viên phải đề xuất/chọn lại
│     └─ Nhánh 2.2: Không đề xuất giảng viên
│        ├─ Nghiệp vụ Sinh viên
│        │  └─ Gửi mô tả đề tài lên hệ thống, không chọn GV
│        ├─ Nghiệp vụ Hệ thống
│        │  └─ Đẩy yêu cầu lên Trưởng ngành/phần quản lý
│        └─ Nghiệp vụ Trưởng ngành
│           ├─ Xem danh sách đề tài sinh viên đề xuất
│           ├─ Chọn & phân công một giảng viên phù hợp
│           └─ Làm cho hồ sơ ở trạng thái `TOPIC_ASSIGNED` (được gán GVHD)

├─ 5. Nộp đề cương đồ án
│  ├─ Actor: Sinh viên, Hệ thống
│  ├─ Điều kiện: đề tài của sinh viên ở trạng thái `TOPIC_APPROVED`
│  ├─ Nghiệp vụ Sinh viên
│  │  ├─ Chuẩn bị đề cương theo mẫu/khuôn sẵn (implicit)
│  │  └─ Upload file đề cương (PDF/Word) trong khung 2 tuần
│  └─ Nghiệp vụ Hệ thống
│     ├─ Lưu file đề cương gắn với hồ sơ đồ án
│     ├─ Gán trạng thái: `OUTLINE_SUBMITTED`
│     └─ (Có thể gửi thông báo cho giảng viên hướng dẫn) (implicit)
|  bắn noti cho GV

├─ 6. Giảng viên duyệt đề cương
│  ├─ Actor: Giảng viên hướng dẫn, Sinh viên, Hệ thống
│  ├─ Nghiệp vụ Giảng viên hướng dẫn
│  │  ├─ Xem nội dung đề cương sinh viên gửi
│  │  ├─ Đánh giá tính khả thi, phạm vi, phương pháp, kế hoạch
│  │  ├─ Nếu đạt:
│  │  │  └─ Duyệt đề cương → `OUTLINE_APPROVED` (cho phép triển khai)
│  │  └─ Nếu chưa đạt:
│  │     ├─ Đánh dấu `OUTLINE_REJECTED`
│  │     └─ Ghi nhận xét, yêu cầu chỉnh sửa
│  ├─ Nghiệp vụ Sinh viên
│  │  ├─ Xem nhận xét khi bị `OUTLINE_REJECTED`
│  │  └─ Chỉnh sửa đề cương & nộp lại cho đến khi được duyệt
│  └─ Nghiệp vụ Hệ thống
│     ├─ Cập nhật trạng thái `OUTLINE_APPROVED` / `OUTLINE_REJECTED`
│     └─ Lưu toàn bộ lịch sử phiên bản đề cương (implicit tốt cho audit)
| bắn noti cho SV

├─ 7. Sinh viên thực hiện đồ án
│  ├─ Actor: Sinh viên, Giảng viên hướng dẫn, Hệ thống
│  ├─ Điều kiện: `OUTLINE_APPROVED`
│  ├─ Nghiệp vụ Sinh viên
│  │  ├─ Thực hiện công việc theo kế hoạch 8–10 tuần
│  │  ├─ Định kỳ:
│  │  │  ├─ Cập nhật tiến độ (mô tả công việc đã làm)
│  │  │  └─ Upload bản demo, bản chạy thử, tài liệu trung gian
│  ├─ Nghiệp vụ Giảng viên hướng dẫn
│  │  ├─ Theo dõi tiến độ từng sinh viên/nhóm
│  │  ├─ Đưa nhận xét từng mốc (đạt/không đạt, cần bổ sung gì)
│  │  └─ Đánh giá mức độ hoàn thành theo thời gian
│  └─ Nghiệp vụ Hệ thống
│     ├─ Gán trạng thái tổng thể: `IN_PROGRESS`
│     ├─ Lưu log các lần cập nhật tiến độ, nhận xét
│     └─ (Có thể nhắc deadline/mốc quan trọng qua thông báo) (implicit)

├─ 8. Sinh viên đăng ký bảo vệ
│  ├─ Actor: Sinh viên, Hệ thống
│  ├─ Điều kiện: sinh viên "đã hoàn thành đồ án" theo yêu cầu nội bộ GV (implicit)
│  ├─ Nghiệp vụ Sinh viên
│  │  ├─ Chuẩn bị bộ hồ sơ cuối:
│  │  │  ├─ Báo cáo cuối
│  │  │  ├─ Source code
│  │  │  └─ Slide trình bày
│  │  └─ Upload đầy đủ hồ sơ & gửi yêu cầu "Đăng ký bảo vệ"
│  └─ Nghiệp vụ Hệ thống
│     ├─ Kiểm tra đủ bộ file bắt buộc (báo cáo, code, slide)
│     ├─ Lưu trữ hồ sơ bảo vệ gắn với đồ án
│     └─ Gán trạng thái hồ sơ: `DEFENSE_REQUESTED`

├─ 9. Giảng viên duyệt đăng ký bảo vệ
│  ├─ Actor: Giảng viên hướng dẫn, Sinh viên, Hệ thống
│  ├─ Nghiệp vụ Giảng viên hướng dẫn
│  │  ├─ Xem:
│  │  │  ├─ Báo cáo cuối
│  │  │  └─ Kết quả & chất lượng đồ án (chạy thử, tính hoàn thiện…)
│  │  ├─ Nếu đạt yêu cầu:
│  │  │  └─ Duyệt → `DEFENSE_APPROVED` (đủ điều kiện sang giai đoạn 2)
│  │  └─ Nếu chưa đạt:
│  │     ├─ Đánh dấu `DEFENSE_REJECTED`
│  │     └─ Yêu cầu sinh viên chỉnh sửa, hoàn thiện thêm
│  ├─ Nghiệp vụ Sinh viên
│  │  ├─ Nhận thông báo kết quả duyệt đăng ký bảo vệ
│  │  ├─ Nếu `DEFENSE_REJECTED`: chỉnh sửa đồ án theo góp ý
│  │  └─ Đăng ký lại bảo vệ sau khi đã chỉnh sửa
│  └─ Nghiệp vụ Hệ thống
│     ├─ Cập nhật trạng thái `DEFENSE_APPROVED` / `DEFENSE_REJECTED`
│     └─ Khi `DEFENSE_APPROVED`: đánh dấu đủ điều kiện chuyển sang giai đoạn 2

└─ 10. Trạng thái tổng & kết thúc giai đoạn 1
   ├─ Actor: Hệ thống (chính), Sinh viên, Giảng viên
   ├─ Chuỗi trạng thái chính:
   │  ├─ `ELIGIBLE_FOR_THESIS`
   │  ├─ `TOPIC_PENDING_APPROVAL`
   │  ├─ `TOPIC_APPROVED`
   │  ├─ `OUTLINE_SUBMITTED`
   │  ├─ `OUTLINE_APPROVED`
   │  ├─ `IN_PROGRESS`
   │  ├─ `DEFENSE_REQUESTED`
   │  └─ `DEFENSE_APPROVED` → `READY_FOR_DEFENSE`
   ├─ Nghiệp vụ Hệ thống
   │  ├─ Tự động chuyển đổi trạng thái theo hành động của sinh viên & giảng viên
   │  ├─ Ngăn truy cập các bước trái quy trình (ví dụ chưa `OUTLINE_APPROVED` thì không được đăng ký bảo vệ)
   │  └─ Chuẩn bị dữ liệu đầu vào cho Giai đoạn 2 (bảo vệ đồ án)
   └─ Điều kiện kết thúc giai đoạn 1
      └─ Khi sinh viên đạt `READY_FOR_DEFENSE` và được chuyển sang Giai đoạn 2

GIAI ĐOẠN 2: BẢO VỆ ĐỒ ÁN
├─ Đầu vào: Các thesis có trạng thái `READY_FOR_DEFENSE`
├─ Đầu ra: Điểm bảo vệ, trạng thái `GRADED` → `PASSED` / `FAILED`

├─ 1. Lập hội đồng & phân công giảng viên
│  ├─ Actor: PĐT, Trưởng ngành
│  ├─ Nghiệp vụ PĐT / Trưởng ngành
│  │  ├─ Tạo hội đồng bảo vệ (tên, ngành/đợt, max_theses)
│  │  ├─ Thêm thành viên: CHAIR, SECRETARY, REVIEWER, MEMBER
│  │  └─ Khóa cấu hình hội đồng (LOCKED) khi đã đủ thành viên
│  └─ Nghiệp vụ Hệ thống
│     ├─ Lưu `councils`, `council_members`
│     └─ Kiểm tra không trùng GVHD/SV trong cùng phiên

├─ 2. Xếp lịch bảo vệ
│  ├─ Actor: PĐT, Thư ký hội đồng
│  ├─ Nghiệp vụ PĐT / Thư ký
│  │  ├─ Tạo phiên bảo vệ: council, phòng, ngày giờ, thời lượng
│  │  └─ Gán từng thesis `READY_FOR_DEFENSE` vào phiên (order_in_session)
│  ├─ Nghiệp vụ Hệ thống
│  │  ├─ Lưu `defense_sessions`, `defense_assignments`
│  │  └─ Kiểm tra không trùng lịch GVHD, SV, phòng
│  └─ Thông báo
│     ├─ SV: thời gian, phòng, hội đồng
│     └─ GVHD + thành viên hội đồng: danh sách SV bảo vệ trong phiên

├─ 3. Chuẩn bị hồ sơ cho hội đồng
│  ├─ Actor: Thư ký hội đồng, PĐT
│  ├─ Nghiệp vụ
│  │  ├─ In/xuất danh sách SV theo phiên, phiếu nhận xét/điểm
│  │  └─ Cung cấp link/file: báo cáo, slide, code cho hội đồng
│  └─ Dữ liệu: từ hồ sơ đăng ký bảo vệ (report, code, slide)

├─ 4. Tiến hành buổi bảo vệ
│  ├─ Actor: Hội đồng, GVHD, Sinh viên
│  ├─ Flow cho mỗi phiên
│  │  ├─ Điểm danh & khai mạc (SV, GVHD, hội đồng có mặt)
│  │  ├─ Bảo vệ từng đồ án (theo order_in_session)
│  │  │  ├─ SV trình bày → Phản biện/ủy viên đặt câu hỏi → SV trả lời, demo
│  │  │  └─ Gán trạng thái `DEFENDING` trong lúc bảo vệ
│  │  └─ Chấm điểm & nhận xét
│  │     ├─ GVHD: `advisor_score`
│  │     ├─ Hội đồng: `council_score`
│  │     ├─ Thư ký ghi: `final_score`, `grade`, nhận xét
│  │     └─ Gán trạng thái `GRADED`
│  └─ Nghiệp vụ Hệ thống
│     └─ Lưu điểm, cập nhật thesis status

├─ 5. Chốt kết quả bảo vệ
│  ├─ Actor: Hệ thống, PĐT
│  ├─ Quy tắc
│  │  ├─ `final_score` = hàm(advisor_score, council_score) theo quy chế
│  │  └─ `grade`: A, B, C, D, F (hoặc Xuất sắc, Giỏi, Khá, TB…)
│  ├─ Trạng thái sau chấm điểm
│  │  ├─ `final_score` ≥ ngưỡng → `PASSED`
│  │  └─ `final_score` < ngưỡng → `FAILED`
│  └─ Chuỗi: `READY_FOR_DEFENSE` → `DEFENDING` → `GRADED` → `PASSED`/`FAILED`

GIAI ĐOẠN 3: HOÀN THIỆN HỒ SƠ & LƯU TRỮ
├─ Đầu vào: Thesis `PASSED` / `FAILED`
├─ Đầu ra: Hồ sơ hoàn thiện, trạng thái `COMPLETED`, lưu trữ lâu dài

├─ 1. Nộp bản cuối sau bảo vệ (Final Submission)
│  ├─ Actor: Sinh viên, GVHD, Chủ tịch hội đồng
│  ├─ Bối cảnh
│  │  └─ Hội đồng có thể yêu cầu sửa báo cáo, bổ sung phụ lục, cập nhật code
│  ├─ Nghiệp vụ Hệ thống / Hội đồng
│  │  └─ Ghi nhận yêu cầu chỉnh sửa (advisor_comment, fix_required_notes)
│  ├─ Nghiệp vụ Sinh viên
│  │  └─ Upload bản đã sửa: final_report, final_slide, final_source_code
│  │     Trạng thái: `PENDING_FIX` → `FIX_SUBMITTED`
│  ├─ Nghiệp vụ GVHD / Chủ tịch hội đồng
│  │  ├─ Xem file đã nộp, đối chiếu yêu cầu
│  │  ├─ Duyệt → `FIX_APPROVED` (bản chính thức)
│  │  └─ Từ chối → `FIX_REJECTED` (SV chỉnh sửa lại)
│  └─ Nghiệp vụ Hệ thống
│     └─ Khi `FIX_APPROVED`: chốt bộ file Final, không cho nộp thêm (trừ mở lại bởi PĐT/GVHD)

├─ 2. Chốt kết quả & cập nhật trạng thái thesis
│  ├─ Actor: PĐT, Hệ thống
│  ├─ Điều kiện
│  │  ├─ Đã có điểm (final_score, grade)
│  │  ├─ Trạng thái `PASSED` / `FAILED`
│  │  └─ Hồ sơ final `FIX_APPROVED` (nếu có yêu cầu sửa)
│  ├─ Nghiệp vụ Hệ thống
│  │  ├─ Cập nhật thesis: `GRADED` → `PASSED`/`FAILED` → `COMPLETED`
│  │  ├─ Ghi `completed_at`
│  │  └─ Log thao tác chốt điểm, xác nhận hoàn thiện

├─ 3. Cập nhật trạng thái sinh viên & xét tốt nghiệp
│  ├─ Actor: PĐT, Hệ thống đào tạo
│  ├─ Cách 1 (chỉ lưu thesis)
│  │  └─ Hệ thống khác đọc thesis `COMPLETED` + `PASSED` để xét tốt nghiệp
│  └─ Cách 2 (lưu student_status)
│     ├─ Thesis `COMPLETED` + `PASSED` → `student_status = THESIS_COMPLETED`
│     └─ PĐT chốt tốt nghiệp → `student_status = GRADUATED`

└─ 4. Lưu trữ & tra cứu hồ sơ đồ án
   ├─ Nội dung lưu trữ (mỗi thesis)
   │  ├─ Thông tin: SV, đề tài, GVHD, đợt, ngành, khóa
   │  ├─ File: báo cáo, slide, code, biên bản, phiếu điểm
   │  └─ Kết quả: advisor_score, council_score, final_score, grade, completed_at
   ├─ Tra cứu
   │  ├─ PĐT / Khoa / Ngành: theo năm, đợt, ngành, GVHD, xếp loại; thống kê, báo cáo
   │  ├─ Giảng viên: xem đồ án đã hướng dẫn, tham khảo
   │  └─ Sinh viên (tùy chính sách): danh sách đề tài khóa trước, link báo cáo mẫu
   └─ Chuỗi trạng thái GĐ1→GĐ3
      GĐ1: ELIGIBLE_FOR_THESIS → TOPIC_* → OUTLINE_* → IN_PROGRESS
           → DEFENSE_REQUESTED → DEFENSE_APPROVED → READY_FOR_DEFENSE
      GĐ2: READY_FOR_DEFENSE → DEFENDING → GRADED → PASSED / FAILED
      GĐ3: PASSED / FAILED → (hoàn thiện hồ sơ) → COMPLETED → (xét TN) GRADUATED
```




