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
│  │  └─ Thiết lập khung mốc thời gian chung:
│  │     ├─ Thời gian đăng ký đề tài
│  │     ├─ Thời gian nộp đề cương
│  │     ├─ Thời gian thực hiện đồ án
│  │     └─ Thời gian đăng ký bảo vệ
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
│  │  ├─ Lưu dữ liệu sinh viên (khoa/ngành, GPA, tín chỉ tích lũy,…)
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
│  │  │  └─ Gửi yêu cầu đăng ký đề tài
│  │  ├─ Nghiệp vụ Hệ thống
│  │  │  ├─ Gán trạng thái sinh viên: `TOPIC_PENDING_APPROVAL`
│  │  │  └─ Gửi yêu cầu đến giảng viên sở hữu đề tài
│  │  └─ Nghiệp vụ Giảng viên
│  │     ├─ Xem danh sách yêu cầu sinh viên
│  │     ├─ Quyết định:
│  │     │  ├─ Đồng ý → set `TOPIC_APPROVED`, gán sinh viên vào đề tài
│  │     │  └─ Từ chối → set `TOPIC_REJECTED`
│  │     └─ (Có thể ưu tiên sinh viên theo tiêu chí riêng: điểm, CV…) (implicit)
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









Ví dụ flow thực tế (1 sinh viên – full validate/check):

```text
SCENARIO: Sinh viên K20-CNTT đăng ký và thực hiện đồ án

1. Mở đợt đồ án
   ├─ Phòng Đào tạo
   │  ├─ Tạo đợt: "Thesis K20 – HK2 – 2026"
   │  ├─ Thiết lập:
   │  │  ├─ Đăng ký đề tài: 01/03 → 07/03
   │  │  ├─ Nộp đề cương: 08/03 → 21/03
   │  │  ├─ Thực hiện đồ án: 22/03 → 31/05
   │  │  └─ Đăng ký bảo vệ: 01/06 → 07/06
   │  └─ Submit → Hệ thống validate:
   │     ├─ Ngày kết thúc > ngày bắt đầu cho từng mốc? (OK)
   │     └─ Các mốc không chồng chéo bất hợp lý? (OK)
   └─ Hệ thống
      ├─ Lưu đợt "ACTIVE"
      └─ Mở tính năng đăng ký đề tài cho toàn bộ user hợp lệ

2. Import & xác định sinh viên đủ điều kiện
   ├─ Phòng Đào tạo
   │  ├─ Import file "students_k20.xlsx" (toàn bộ sinh viên K20)
   │  └─ Hệ thống check format file (cột bắt buộc, kiểu dữ liệu) → OK
   └─ Hệ thống
      ├─ Ghi vào bảng Student (faculty, major, GPA, credits,…)
      ├─ Chạy rule eligibility:
      │  ├─ GPA ≥ 2.0 ?
      │  ├─ Số tín chỉ tích lũy ≥ yêu cầu?
      │  └─ Không nợ môn bắt buộc?
      ├─ Nếu đạt → `ELIGIBLE_FOR_THESIS`
      └─ Nếu không đạt → `NOT_ELIGIBLE` (không cho đi tiếp)

3. Trưởng ngành CNTT xem danh sách
   ├─ Trưởng ngành CNTT
   │  └─ Mở màn "Danh sách sinh viên đồ án – Ngành CNTT – K20"
   └─ Hệ thống
      ├─ Lọc Student.major = CNTT AND eligible_for_thesis = true
      └─ Hiển thị, ví dụ: SV001, SV002, …, SV120

4. Giảng viên đăng ký đề tài
   ├─ Giảng viên A (CNTT)
   │  ├─ Tạo đề tài:
   │  │  ├─ Tên: "Hệ thống quản lý đồ án tốt nghiệp"
   │  │  ├─ Mô tả: ...
   │  │  └─ Số SV tối đa: 3
   │  ├─ Bấm "Lưu"
   │  └─ Hệ thống validate:
   │     ├─ Tên không rỗng? (OK)
   │     ├─ Số SV tối đa > 0? (OK)
   │     ├─ Trong thời gian mở đăng ký đề tài? (OK)
   │     └─ Không trùng hệt tên/thesis code đã có? (cảnh báo nếu có)
   └─ Hệ thống
      ├─ Lưu đề tài `AVAILABLE`
      └─ Hiện trong danh sách đề tài CNTT cho sinh viên

5. Sinh viên chọn đề tài
   ├─ Sinh viên SV001 (K20-CNTT, eligible)
   │  ├─ Đăng nhập → Dashboard "Đồ án tốt nghiệp"
   │  ├─ Mở "Danh sách đề tài"
   │  ├─ Hệ thống chỉ show:
   │  │  ├─ Đề tài thuộc ngành CNTT
   │  │  └─ Đề tài đang `AVAILABLE` trong đợt ACTIVE
   │  ├─ SV001 chọn đề tài của Giảng viên A
   │  └─ Bấm "Đăng ký"
   └─ Hệ thống
      ├─ Kiểm tra:
      │  ├─ SV001 `ELIGIBLE_FOR_THESIS`? (YES)
      │  ├─ Trong thời gian đăng ký đề tài? (YES)
      │  ├─ Đề tài còn slot trống (dưới 3 SV)? (YES)
      │  └─ SV001 chưa có đề tài nào khác được duyệt? (YES)
      ├─ Gán trạng thái SV001: `TOPIC_PENDING_APPROVAL`
      └─ Tạo yêu cầu cho Giảng viên A duyệt

6. Giảng viên A duyệt đăng ký đề tài
   ├─ Giảng viên A
   │  ├─ Mở màn "Danh sách yêu cầu đăng ký đề tài"
   │  ├─ Thấy yêu cầu của SV001 cho đề tài X
   │  ├─ Xem thông tin SV001 (GPA, số tín chỉ, hướng quan tâm…)
   │  └─ Chọn "Chấp nhận"
   └─ Hệ thống
      ├─ Check:
      │  ├─ Đề tài vẫn `AVAILABLE`? (YES)
      │  ├─ Chưa vượt quá số SV tối đa? (YES)
      ├─ Set:
      │  ├─ SV001 → `TOPIC_APPROVED`
      │  └─ Gán GVHD = Giảng viên A
      └─ Gửi thông báo cho SV001 + cập nhật slot còn lại của đề tài

7. SV001 nộp đề cương
   ├─ SV001
   │  ├─ Kiểm tra trạng thái: `TOPIC_APPROVED` (đã có)
   │  ├─ Trong khoảng 08/03–21/03
   │  ├─ Upload file "DeCuong_SV001.pdf"
   │  └─ Bấm "Nộp đề cương"
   └─ Hệ thống
      ├─ Validate:
      │  ├─ File không rỗng, dung lượng < 50MB? (YES)
      │  ├─ Định dạng đúng (PDF/Word)? (YES)
      │  └─ Đúng thời gian nộp đề cương? (YES)
      ├─ Lưu file gắn với hồ sơ đồ án SV001
      └─ Set trạng thái: `OUTLINE_SUBMITTED`

8. GVHD duyệt đề cương
   ├─ Giảng viên A (GVHD)
   │  ├─ Mở "Đề cương chờ duyệt"
   │  ├─ Xem file đề cương của SV001
   │  ├─ Nếu nội dung ổn:
   │  │  └─ Bấm "Duyệt đề cương"
   │  └─ Nếu chưa ổn (case khác):
   │     ├─ Bấm "Từ chối"
   │     └─ Nhập nhận xét chi tiết
   └─ Hệ thống
      ├─ Nếu duyệt:
      │  ├─ Set `OUTLINE_APPROVED`
      │  └─ Cho phép SV001 bước sang giai đoạn thực hiện
      └─ Nếu từ chối:
         ├─ Set `OUTLINE_REJECTED`
         ├─ Gửi thông báo + nhận xét cho SV001
         └─ Không cho SV001 chuyển sang thực hiện cho đến khi được duyệt

9. SV001 thực hiện đồ án
   ├─ SV001
   │  ├─ Trong khoảng 22/03–31/05
   │  ├─ Định kỳ (ví dụ mỗi tuần):
   │  │  ├─ Cập nhật mô tả công việc đã làm
   │  │  └─ Upload demo/ảnh chụp kết quả
   ├─ Giảng viên A
   │  ├─ Xem lịch sử cập nhật
   │  ├─ Đánh dấu từng lần: Đạt/Không đạt
   │  └─ Ghi nhận xét định hướng
   └─ Hệ thống
      ├─ Set trạng thái tổng thể: `IN_PROGRESS`
      ├─ Lưu log chi tiết (thời gian, nội dung, người cập nhật)
      └─ Có thể gửi email/notification nhắc deadline quan trọng

10. SV001 đăng ký bảo vệ
    ├─ Điều kiện:
    │  ├─ Đã trong/đến giai đoạn "Đăng ký bảo vệ"
    │  └─ GVHD đồng ý là "đã hoàn thành về mặt nội bộ" (quy ước)
    ├─ SV001
    │  ├─ Upload:
    │  │  ├─ Báo cáo cuối (.pdf)
    │  │  ├─ Source code (.zip hoặc link repo)
    │  │  └─ Slide (.pptx/.pdf)
    │  └─ Bấm "Đăng ký bảo vệ"
    └─ Hệ thống
       ├─ Validate:
       │  ├─ Đủ 3 loại file bắt buộc? (YES)
       │  ├─ Dung lượng/định dạng hợp lệ? (YES)
       │  └─ Trong thời gian đăng ký bảo vệ? (YES)
       ├─ Lưu bộ hồ sơ bảo vệ
       └─ Set `DEFENSE_REQUESTED`

11. GVHD duyệt đăng ký bảo vệ
    ├─ Giảng viên A
    │  ├─ Mở "Yêu cầu đăng ký bảo vệ"
    │  ├─ Xem:
    │  │  ├─ Báo cáo cuối
    │  │  ├─ Kết quả chạy thử
    │  │  └─ Tiến độ/lịch sử làm việc
    │  ├─ Nếu đạt:
    │  │  └─ Bấm "Duyệt cho bảo vệ"
    │  └─ Nếu chưa đạt:
    │     ├─ Bấm "Từ chối"
    │     └─ Nhập lý do (thiếu tính năng, sai yêu cầu,…)
    └─ Hệ thống
       ├─ Nếu duyệt:
       │  ├─ Set `DEFENSE_APPROVED`
       │  ├─ Đánh dấu `READY_FOR_DEFENSE`
       │  └─ Đưa SV001 vào danh sách chờ xếp Hội đồng (Giai đoạn 2)
       └─ Nếu từ chối:
          ├─ Set `DEFENSE_REJECTED`
          ├─ Gửi thông báo + lý do cho SV001
          └─ Cho phép SV001 chỉnh sửa và đăng ký lại trong hạn
```

