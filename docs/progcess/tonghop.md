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
```




