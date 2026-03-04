# MỤC LỤC

### **1. YÊU CẦU (REQUIREMENTS) ...............................................................................1** 1.1 Đặt vấn đề (Problem statement) ..............................................................................1 Bối cảnh .....................................................................................................1 Mục tiêu .....................................................................................................1 Người dùng mục tiêu .................................................................................1 Lợi ích khi sử dụng phần mềm ..................................................................2 Phạm vi của dự án ......................................................................................3 1.2 Thuật ngữ (Glossary) ...............................................................................................3 1.3 Thông số kỹ thuật bổ sung .......................................................................................4 1.4 Mô hình hóa quy trình nghiệp vụ ............................................................................5 Quy trình nghiệp vụ 1 ................................................................................6 Quy trình nghiệp vụ 2 ................................................................................6 1.5 Mô hình hóa chức năng ...........................................................................................9 Các yêu cầu chức năng ..............................................................................9 Sơ đồ Use-case ...........................................................................................9 1.6 Đặc tả các Use-case ...............................................................................................14 Tên Use-case 1 (Ví dụ UC1.1. Thiết lập thông tin dòng họ) ...................14 Tên Use-case 1 (Ví dụ UC1.2. Thêm mới thành viên) ............................36 **2. PHÂN TÍCH TRƯỜNG HỢP SỬ DỤNG (USE-CASE ANALYSIS) ................37** 2.1 Phân tích kiến trúc hệ thống ..................................................................................37 Kiến trúc mức cao của hệ thống ..............................................................37 Các đối tượng trừu tượng hóa chính của hệ thống (Key abstractions) ....37 2.2 Thực thi trường hợp sử dụng (Use-case relizations) .............................................37 Các biểu đồ tuần tự (Sequence diagrams) ................................................37 Góc nhìn của các lớp trong hệ thống (Views of participating classes) ....37 **3. THIẾT KẾ (USE-CASE DESGIN) ........................................................................38** 3.1 Xác định các thành phần thiết kế (Identify design elements) ................................38 Xác định các lớp (Identify classes) ..........................................................38


### Xác định các hệ thống con và giao diện (Identify subsystems and interfaces) 38 Xác định các gói (Identify packages) .......................................................38 3.2 Thiết kế trường hợp sử dụng (Use-case design) ....................................................38 Thiết kế các biểu đồ tuần tự (Design sequence diagrams) .......................38 Thiết kế biểu đồ lớp (Class diagrams) .....................................................38 3.3 Thiết kế cơ sở dữ liệu (Database design) ...............................................................38 Lược đồ cơ sở dữ liệu ..............................................................................38 Chi tiết các bảng .......................................................................................38 **4. CÀI ĐẶT (IMPLEMENTATION) .........................................................................39** 4.1 Lựa chọn công nghệ ...............................................................................................39 4.2 Cấu trúc mã nguồn .................................................................................................39 **5. KẾT LUẬN ...............................................................................................................40** **TÀI LIỆU THAM KHẢO ...............................................................................................41** **PHỤ LỤC (nếu có) ...........................................................................................................42**


### **1. YÊU CẦU (REQUIREMENTS)** **1.1 Đặt vấn đề (Problem statement)** **Bối cảnh**

Trong môi trường giáo dục đại học hiện nay, đồ án tốt nghiệp là một phần quan trọng và
bắt buộc đối với sinh viên năm cuối. Quy trình quản lý đồ án tốt nghiệp bao gồm nhiều
giai đoạn phức tạp từ đăng ký đề tài, phân công giảng viên hướng dẫn, theo dõi tiến độ
thực hiện, đến tổ chức bảo vệ và lưu trữ kết quả. Tại nhiều trường đại học, quy trình này
vẫn đang được thực hiện thủ công hoặc sử dụng các công cụ rời rạc như Excel, email, và
giấy tờ văn bản.


Việc quản lý thủ công gây ra nhiều bất cập như: khó khăn trong việc theo dõi tiến độ của
hàng trăm đồ án cùng lúc, thông tin bị phân tán không đồng nhất giữa các bên liên quan
(sinh viên, giảng viên, khoa, phòng đào tạo), mất nhiều thời gian trong các công việc
hành chính như đăng ký, phê duyệt, thống kê báo cáo. Đặc biệt, việc lưu trữ và tra cứu
thông tin đồ án sau khi hoàn thành thường không hiệu quả, gây khó khăn khi cần tham
khảo hoặc kiểm tra đạo văn.


Bên cạnh đó, sinh viên cũng gặp nhiều khó khăn trong việc đăng ký đề tài, tìm kiếm
giảng viên hướng dẫn phù hợp, và theo dõi tiến độ của bản thân. Giảng viên hướng dẫn
thiếu công cụ để quản lý nhiều sinh viên cùng lúc, giao việc và theo dõi tiến độ một cách
có hệ thống. Các thành viên hội đồng bảo vệ cũng cần thời gian để chuẩn bị và đánh giá
các đồ án được phân công.

### **Mục tiêu**


Để giải quyết các vấn đề nêu trên, hệ thống được xây dựng nhằm đạt được các mục tiêu
định lượng cụ thể theo chuẩn Planguage như sau:

**BO-1: Rút ngắn thời gian từ lúc đăng ký đến khi hoàn thành phê duyệt đề tài xuống**
**70% trong vòng 1 học kỳ sau khi triển khai.**

**Scale:** Số ngày làm việc trung bình tính từ khi sinh viên nộp đề xuất (Submit) đến khi
nhận được trạng thái phê duyệt cuối cùng (Approved).
**Meter:** Dữ liệu thời gian (Timestamp) ghi nhận trên hệ thống quản lý đồ án.
**Past:** 20 ngày (Theo khảo sát quy trình nộp bản cứng và phê duyệt thủ công năm
2024).
**Goal:** Dưới 6 ngày.
**Stretch:** Dưới 3 ngày.

**BO-2: Giảm tỷ lệ sai sót trong hồ sơ đăng ký và nhập liệu điểm số xuống dưới 2%**
**ngay trong năm đầu vận hành.**

**Scale:** Phần trăm (%) số lượng hồ sơ bị yêu cầu sửa đổi do sai quy định hoặc số
lượng sai lệch điểm số khi đối soát.
**Meter:** Báo cáo tổng hợp trạng thái phê duyệt và lịch sử chỉnh sửa dữ liệu (Audit
Log) từ hệ thống.
**Past:** 15% (Do sinh viên điền sai mẫu hoặc giảng viên nhập liệu thủ công vào bảng
tính).
**Goal:** Dưới 2%.
**Stretch:** Dưới 0.5%.


**BO-3: Cắt giảm 80% chi phí hành chính và vật tư liên quan đến việc in ấn, lưu trữ**
**hồ sơ đồ án giấy.**

**Scale:** Tổng chi phí ước tính mỗi học kỳ bao gồm vật tư tiêu hao (giấy, mực in), chi
phí thuê không gian lưu trữ và giờ công của cán bộ văn phòng khoa.
**Meter:** Thống kê số lượng hồ sơ số hóa trên hệ thống và bảng kê chi phí văn phòng
phẩm thực tế.
**Past:** 100% (Mức chi phí cơ sở hiện tại của quy trình nộp bản cứng).
**Goal:** Giảm xuống còn 20% so với mức cơ sở.
**Stretch:** Giảm xuống còn 5% (Chỉ còn in ấn các văn bản pháp lý bắt buộc).

**BO-4: Tăng mức độ hài lòng của sinh viên và giảng viên đối với công tác quản lý đồ**
**án lên 90%.**

**Scale:** Điểm đánh giá trung bình từ khảo sát người dùng cuối trên thang điểm 5.
**Meter:** Hệ thống khảo sát trực tuyến tích hợp sau mỗi đợt bảo vệ đồ án.
**Past:** 3/5 điểm (Tương đương 60% mức độ hài lòng với quy trình thủ công).
**Goal:** Trên 4.5/5 điểm.
**Stretch:** 4.8/5 điểm.

### **Người dùng mục tiêu**


Hệ thống phục vụ các nhóm đối tượng người dùng chính sau:


**Sinh viên** : Là đối tượng thực hiện đồ án tốt nghiệp, sử dụng hệ thống để đăng ký đề tài,
cập nhật tiến độ, nộp báo cáo và xem kết quả đánh giá.


**Giảng viên hướng dẫn** : Là người trực tiếp hướng dẫn sinh viên, sử dụng hệ thống để
đăng ký đề tài mở, theo dõi sinh viên được phân công, đánh giá quá trình và kết quả đồ
án.


**Thành viên hội đồng** : Bao gồm chủ tịch hội đồng, ủy viên phản biện và thư ký, sử dụng
hệ thống để xem thông tin đồ án được phân công, chấm điểm và nhập nhận xét.


**Trưởng bộ môn/Khoa** : Quản lý và phê duyệt đề tài, phân công giảng viên hướng dẫn, tổ
chức hội đồng bảo vệ và theo dõi tổng quan tình hình đồ án của bộ môn/khoa.


**Phòng Đào tạo** : Quản lý toàn bộ quy trình đồ án của trường, thiết lập lịch trình, thống kê
báo cáo tổng thể và lưu trữ kết quả.

### **Lợi ích khi sử dụng phần mềm**


**Đối với sinh viên** :


  - Dễ dàng tìm kiếm và đăng ký đề tài phù hợp với năng lực và sở thích

  - Theo dõi tiến độ và nhận phản hồi từ giảng viên hướng dẫn kịp thời

  - Nộp báo cáo và tài liệu điện tử thuận tiện, không phụ thuộc vào giấy tờ

  - Nhận thông báo tự động về lịch bảo vệ, kết quả đánh giá


**Đối với giảng viên hướng dẫn** :


  - Quản lý tập trung nhiều sinh viên, theo dõi tiến độ từng người một cách có hệ
thống

  - Tiết kiệm thời gian trong việc đăng ký, phê duyệt và báo cáo hành chính


  - Dễ dàng đánh giá và cho điểm sinh viên với các tiêu chí rõ ràng

  - Lưu trữ lịch sử hướng dẫn để tham khảo và phát triển đề tài trong tương lai


**Đối với đơn vị quản lý (Khoa/Phòng Đào tạo)** :


  - Giảm thiểu công việc giấy tờ, số hóa toàn bộ quy trình

  - Dễ dàng thống kê, báo cáo theo nhiều tiêu chí (theo ngành, theo giảng viên, theo
kỳ...)

  - Nâng cao tính minh bạch và công bằng trong đánh giá

  - Tối ưu hóa việc phân công giảng viên và tổ chức hội đồng

  - Xây dựng kho dữ liệu đồ án để phục vụ công tác kiểm định chất lượng

### **Phạm vi của dự án** **_Phạm vi phát hành đợt đầu_**


**FE-1 (Quản lý thông tin & Đề tài):** Hệ thống cho phép quản lý thông tin người dùng
(sinh viên, giảng viên, cán bộ) và thực hiện quy trình đăng ký đề tài. Sinh viên có thể
chủ động đăng ký, trong khi hệ thống hỗ trợ phân loại đề tài theo lĩnh vực và phê
duyệt danh mục đề tài chính thức.


**FE-2 (Quản lý tiến độ & Quy trình):** Cung cấp công cụ theo dõi quá trình thực hiện
đồ án, cho phép sinh viên nộp báo cáo giai đoạn và nhận phản hồi từ giảng viên
hướng dẫn. Hệ thống hỗ trợ phân công giảng viên và quản lý các mốc thời gian quan
trọng của dự án.


**FE-3 (Hội đồng & Chấm điểm):** Hệ thống hỗ trợ tổ chức hội đồng bảo vệ, lập lịch
bảo vệ và phân công đồ án cho các thành viên hội đồng. Giảng viên hướng dẫn và hội
đồng có thể nhập điểm trực tiếp để hệ thống tự động tính toán điểm tổng kết cuối
cùng.


**FE-4 (Lưu trữ & Thống kê):** Tính năng lưu trữ tập trung các sản phẩm cuối cùng
bao gồm báo cáo, slide thuyết trình và mã nguồn. Hệ thống cung cấp khả năng xuất
báo cáo thống kê theo nhiều tiêu chí ra định dạng Excel/PDF cho cán bộ quản lý.


**FE-5 (Thông báo tự động):** Tích hợp tính năng gửi Email và thông báo tự động
(Notification) về các sự kiện quan trọng hoặc khi có thay đổi trạng thái trong quá
trình đăng ký và bảo vệ đồ án.


_**Giới hạn**_


**LI-1 (Kiểm tra đạo văn):** Trong phiên bản này, hệ thống sẽ không tích hợp tính năng
tự động kiểm tra đạo văn. Việc kiểm soát tính trung thực của báo cáo sẽ được thực
hiện thông qua các công cụ bên ngoài nếu cần thiết.


**LI-2 (Kết nối hệ thống hiện hành):** Hệ thống chưa thực hiện kết nối trực tiếp (API)
với hệ thống quản lý sinh viên hiện tại của trường. Các dữ liệu về sinh viên và học vụ
liên quan sẽ được quản lý độc lập trong phạm vi dự án này.


**LI-3 (Tính năng mở rộng):** Các chức năng như hệ thống chat thời gian thực giữa
sinh viên - giảng viên, quản lý tài chính liên quan đến đồ án và các nghiệp vụ học vụ
khác (đăng ký học phần, học phí) nằm ngoài phạm vi phát triển của đợt này.


**1.2** **Thuật ngữ (Glossary)**
































|STT|Thuật ngữ (Tiếng Việt<br>/ Tiếng Anh)|Giải thích ý nghĩa|
|---|---|---|
|1|**Đồ án tốt nghiệp** <br>_(Graduation_<br>_Thesis/Project)_|Bài tập lớn mà sinh viên năm cuối phải thực hiện và<br>bảo vệ để được công nhận tốt nghiệp, thường kéo dài<br>một hoặc hai học kỳ.|
|2|**Đề tài** <br>_(Topic/Subject)_|Chủ đề nghiên cứu hoặc vấn đề cụ thể mà sinh viên<br>sẽ thực hiện trong đồ án tốt nghiệp, do giảng viên đề<br>xuất hoặc sinh viên tự đề xuất.|
|3|**Giảng viên hướng dẫn** <br>_(Supervisor/Advisor)_|Giảng viên có chuyên môn được phân công hướng<br>dẫn sinh viên trong suốt quá trình thực hiện đồ án, từ<br>lập kế hoạch đến hoàn thành.|
|4|**Hội đồng bảo vệ** <br>_(Defense_<br>_Committee/Council)_|Nhóm gồm các giảng viên được thành lập để đánh<br>giá và chấm điểm đồ án của sinh viên thông qua buổi<br>trình bày và bảo vệ.|
|5|**Chủ tịch hội đồng** <br>_(Committee Chair)_|Giảng viên có trình độ và kinh nghiệm, đảm nhiệm<br>vai trò chủ trì buổi bảo vệ và có quyền quyết định<br>cao nhất trong hội đồng.|
|6|**Ủy viên phản biện** <br>_(Reviewer/Examiner)_|Thành viên hội đồng có nhiệm vụ đọc kỹ báo cáo đồ<br>án, đưa ra nhận xét và câu hỏi chuyên sâu để đánh<br>giá chất lượng công trình.|
|7|**Thư ký hội đồng** <br>_(Committee Secretary)_|Thành viên hội đồng phụ trách ghi chép biên bản,<br>tổng hợp điểm và xử lý các công việc hành chính của<br>hội đồng.|
|8|**Tiến độ thực hiện** <br>_(Progress/Milestone)_|Các mốc thời gian và công việc cụ thể mà sinh viên<br>cần hoàn thành trong quá trình làm đồ án, được giảng<br>viên hướng dẫn theo dõi và xác nhận trên hệ thống.|
|9|**Báo cáo đồ án** <br>_(Thesis Report)_|Tài liệu chính thức (file Word/PDF) trình bày đầy đủ<br>nội dung nghiên cứu, phương pháp, kết quả và kết<br>luận của đồ án tốt nghiệp.|
|10|**Phiên bảo vệ** <br>_(Defense Session)_|Buổi trình bày và thuyết trình trước hội đồng, trong<br>đó sinh viên giải trình về công trình của mình và trả<br>lời các câu hỏi từ hội đồng.|
|11|**Đề cương đồ án** <br>_(Thesis_<br>_Proposal/Outline)_|Bản kế hoạch chi tiết về mục tiêu, phạm vi, phương<br>pháp và lịch trình thực hiện đồ án, được phê duyệt<br>trước khi bắt đầu thực hiện chính thức.|
|12|**Biên bản bảo vệ** <br>_(Defense Minutes)_|Văn bản ghi lại diễn biến buổi bảo vệ, điểm số, nhận<br>xét của từng thành viên hội đồng và quyết định cuối<br>cùng về kết quả đồ án.|
|13|**Niên khóa** <br>_(Academic Year)_|_(Bổ sung)_ Khoảng thời gian đào tạo chính thức của<br>một khóa sinh viên, dùng để phân loại và quản lý dữ<br>liệu đồ án theo từng năm học.|


|14|Tỷ lệ đạo văn<br>(Plagiarism Rate)|(Bổ sung) Chỉ số phần trăm trùng lặp nội dung của<br>đồ án với các tài liệu đã có, là tiêu chí quan trọng để<br>quyết định sinh viên có được phép bảo vệ hay không.|
|---|---|---|
|15|**Điều kiện tiên quyết** <br>_(Prerequisite)_|_(Bổ sung)_ Các yêu cầu về số tín chỉ tích lũy hoặc các<br>môn học bắt buộc mà sinh viên phải hoàn thành trước<br>khi được phép đăng ký làm đồ án tốt nghiệp trên hệ<br>thống.|


### **1.3 Thông số kỹ thuật bổ sung** _1.3.1. Yêu cầu phi chức năng (Non-Functional Requirements)_

**Hiệu năng (Performance):**


**NFR-1:** Hệ thống duy trì ổn định với tải trọng tối thiểu 200 người dùng truy cập
đồng thời mà không làm suy giảm hiệu suất xử lý.


**NFR-2:** Tốc độ phản hồi trang (Page Load) không quá 3 giây trong môi trường
mạng tiêu chuẩn.


**NFR-3:** Các tác vụ truy vấn và tìm kiếm dữ liệu phải trả về kết quả trong thời
gian tối đa 2 giây.


**NFR-4:** Hạ tầng hỗ trợ truyền tải và lưu trữ tệp tin báo cáo đồ án với dung lượng
lên đến 50MB mỗi tệp.


**Độ tin cậy và Khả dụng (Reliability & Availability):**


**NFR-5:** Cam kết tỷ lệ sẵn sàng phục vụ của hệ thống (Uptime) đạt mức tối thiểu
99.5%.


**NFR-6:** Thiết lập quy trình sao lưu (Backup) dữ liệu tự động định kỳ hàng ngày.


**NFR-7:** Xây dựng phương án phục hồi dữ liệu (Disaster Recovery) để đảm bảo
toàn vẹn thông tin khi có sự cố hệ thống xảy ra.


**Bảo mật (Security):**


**NFR-8:** Truy cập hệ thống bắt buộc qua định danh cá nhân (Username/Password).
Toàn bộ mật khẩu phải được băm (Hash) bằng các thuật toán bảo mật trước khi
lưu trữ.


**NFR-9:** Áp dụng cơ chế kiểm soát truy cập dựa trên vai trò (RBAC), đảm bảo
người dùng chỉ thao tác trong phạm vi quyền hạn được cấp.


**NFR-10:** Thiết lập ràng buộc dữ liệu: Sinh viên chỉ có quyền truy xuất và cập
nhật hồ sơ đồ án thuộc sở hữu cá nhân.


**NFR-11:** Hệ thống ghi vết (Audit Log) toàn bộ các tác vụ trọng yếu như: đăng ký
đề tài, điều chỉnh điểm số, phê duyệt trạng thái đồ án.


**Khả năng sử dụng (Usability):**


**NFR-12:** Giao diện tối giản, trực quan, tối ưu hóa trải nghiệm cho nhóm người
dùng không chuyên sâu về kỹ thuật.


**NFR-13:** Ngôn ngữ hiển thị mặc định và duy nhất là Tiếng Việt trên toàn bộ các
phân hệ.


**NFR-14:** Đảm bảo tính tương thích hiển thị (Responsive Design) trên đa nền
tảng: Desktop, Tablet và Smartphone.


**NFR-15:** Cung cấp tài liệu hướng dẫn (Help Center) tích hợp trực tiếp cho từng
tính năng nghiệp vụ.

### _1.3.2. Ràng buộc thiết kế và Khả năng mở rộng_


**Ràng buộc kỹ thuật (Technical Constraints):**


**CON-1:** Hệ thống triển khai trên nền tảng Web Application để đơn giản hóa
quá trình phân phối và bảo trì.


**CON-2:** Sử dụng hệ quản trị cơ sở dữ liệu quan hệ tiêu chuẩn (RDBMS) như
MySQL, PostgreSQL hoặc SQL Server.


**CON-3:** Áp dụng chuẩn bảng mã UTF-8 xuyên suốt các tầng dữ liệu để đảm
bảo hiển thị tiếng Việt chính xác.


**Khả năng mở rộng (Scalability):**


**EXT-1:** Kiến trúc hệ thống được thiết kế theo dạng module/component để dễ
dàng tích hợp các tính năng mới.


**EXT-2:** Sẵn sàng cung cấp các giao tiếp (API) để kết nối với hệ thống quản lý
sinh viên của nhà trường khi có nhu cầu.


**EXT-3:** Quy trình cập nhật (Update) phiên bản phải được thực hiện mượt mà,
hạn chế tối đa thời gian dừng hệ thống (Downtime).

### **1.4 Mô hình hóa quy trình nghiệp vụ** **Quy trình Đăng ký đề tài và Phân công hướng dẫn**


Quy trình này mô tả các bước từ khi giảng viên đăng ký đề tài mở hoặc sinh viên tự đề
xuất đề tài, qua các khâu phê duyệt, đăng ký của sinh viên, đến khi được phân công giảng
viên hướng dẫn chính thức.


**BP-1 (Khởi tạo):** Phòng Đào tạo thiết lập cấu hình và mở đợt đăng ký đồ án cho học
kỳ/năm học mới trên hệ thống.


**BP-2 (Đề xuất đề tài):** Giảng viên thực hiện đăng ký danh sách đề tài mở. Hệ thống
cũng cho phép sinh viên tự đề xuất đề tài cá nhân.


**BP-3 (Phê duyệt danh mục):** Trưởng bộ môn hoặc Ban lãnh đạo Khoa tiến hành
xem xét, chỉnh sửa và phê duyệt các đề tài hợp lệ để hiển thị cho sinh viên.


**BP-4 (Nguyện vọng sinh viên):** Sinh viên truy cập danh sách đã phê duyệt, thực hiện
đăng ký các đề tài yêu thích theo thứ tự ưu tiên.


**BP-5 (Xét chọn):** Giảng viên dựa trên hồ sơ và năng lực của sinh viên đăng ký để lựa
chọn sinh viên phù hợp nhất với đề tài của mình.


**BP-6 (Chốt danh sách):** Trưởng bộ môn/Khoa kiểm duyệt lại toàn bộ danh sách
phân công để đảm bảo tính công bằng và đúng quy định trước khi phê duyệt cuối
cùng.


**BP-7 (Công bố):** Hệ thống tự động gửi thông báo kết quả phân công qua Email/Ứng
dụng cho cả giảng viên và sinh viên.

### **Quy trình Bảo vệ đồ án và Tổng kết điểm**


Quy trình này mô tả các bước chuẩn bị và tổ chức buổi bảo vệ đồ án, từ việc thành lập
hội đồng, xếp lịch, đến việc chấm điểm và công bố kết quả.


**Các bước chính** :


**BP-8 (Nộp sản phẩm):** Sinh viên hoàn thiện nội dung và nộp báo cáo, mã nguồn,
slide lên hệ thống theo đúng thời hạn quy định.


**BP-9 (Sơ loại):** Giảng viên hướng dẫn trực tiếp đánh giá chất lượng sản phẩm và
nhập điểm thành phần (điểm hướng dẫn).


**BP-10 (Tổ chức Hội đồng):** Trưởng bộ môn/Khoa tiến hành thành lập các Hội đồng
bảo vệ và chỉ định các thành viên tương ứng.


**BP-11 (Lập lịch):** Phòng Đào tạo hoặc Khoa thực hiện phân công đồ án vào các hội
đồng và sắp xếp thời gian, địa điểm bảo vệ.


**BP-12 (Triệu tập):** Hệ thống tự động gửi lịch bảo vệ chi tiết đến sinh viên và các
thành viên trong hội đồng bảo vệ.


**BP-13 (Nghiên cứu hồ sơ):** Thành viên hội đồng truy cập hệ thống để tải và xem
trước nội dung báo cáo đồ án của sinh viên.


**BP-14 (Tổ chức bảo vệ):** Sinh viên thuyết trình và trả lời câu hỏi phản biện trực tiếp
trước hội đồng.


**BP-15 (Đánh giá):** Các thành viên hội đồng nhập điểm số và nhận xét chi tiết vào hệ
thống ngay trong hoặc sau buổi bảo vệ.


**BP-16 (Tổng kết):** Hệ thống tự động áp dụng công thức để tính điểm tổng kết đồ án
dựa trên điểm hướng dẫn và điểm hội đồng.


**BP-17 (Lưu trữ):** Công bố kết quả chính thức cho sinh viên và tự động chuyển dữ
liệu vào hồ sơ lưu trữ điện tử của nhà trường.


### **1.5 Mô hình hóa chức năng** **Các yêu cầu chức năng**

**R1. Quản lý thông tin cơ bản**


**R1.1.** Hệ thống cho phép quản trị viên thêm, sửa, xóa thông tin sinh viên (mã SV,
lớp, khóa, ngành).


**R1.2.** Hệ thống cho phép quản trị viên thêm, sửa, xóa thông tin giảng viên (học hàm,
học vị, hướng nghiên cứu).


**R1.3.** Hệ thống cho phép quản trị viên quản lý thông tin danh mục: khoa, bộ môn,
chuyên ngành, niên khóa.


**R1.4.** Hệ thống cho phép người dùng đăng nhập vào hệ thống với tài khoản được cấp
và phân quyền tương ứng.


**R1.5.** Hệ thống cho phép người dùng đổi mật khẩu và tự cập nhật thông tin liên hệ cá
nhân.


**R2. Quản lý đề tài đồ án**


**R2.1.** Hệ thống cho phép giảng viên đăng ký đề tài mở (kèm mô tả, yêu cầu kiến
thức) cho sinh viên tham khảo.


**R2.2.** Hệ thống cho phép sinh viên tự đề xuất đề tài mới (trong trường hợp sinh viên
đã có ý tưởng và GVHD đồng ý).


**R2.3.** Hệ thống cho phép trưởng bộ môn/khoa xem, xét duyệt hoặc từ chối đề tài dựa
trên tính khả thi và chuyên môn.


**R2.4.** Hệ thống cho phép chỉnh sửa thông tin đề tài (tên, phạm vi) trước khi được phê
duyệt chính thức.


**R2.5.** Hệ thống cho phép tìm kiếm và lọc đề tài theo nhiều tiêu chí (lĩnh vực, tên
giảng viên, trạng thái đề tài).


**R2.6.** Hệ thống lưu trữ lịch sử các đề tài đã thực hiện để tránh trùng lặp ý tưởng.


**R3. Quản lý đăng ký và phân công đồ án**


**R3.1.** Hệ thống cho phép phòng đào tạo/khoa thiết lập và mở đợt đăng ký đồ án cho
từng học kỳ.


**R3.2.** Hệ thống cho phép sinh viên xem danh sách đề tài và thực hiện đăng ký nguyện
vọng theo thứ tự ưu tiên.


**R3.3.** Hệ thống cho phép giảng viên xem danh sách sinh viên đăng ký vào đề tài của
mình và thực hiện lựa chọn/chấp nhận.


**R3.4.** Hệ thống cho phép trưởng bộ môn/khoa phân công giảng viên hướng dẫn cho
sinh viên (đối với các trường hợp chưa có nhóm).


**R3.5.** Hệ thống tự động gửi thông báo kết quả phân công đề tài và GVHD cho các
bên liên quan.


**R3.6.** Hệ thống cho phép điều chỉnh phân công (đổi đề tài, đổi GVHD) trong các
trường hợp đặc biệt có sự đồng ý của cấp quản lý.


**R4. Quản lý tiến độ thực hiện đồ án**


**R4.1.** Hệ thống cho phép giảng viên hướng dẫn thiết lập các mốc tiến độ (milestones)
cho sinh viên thực hiện.


**R4.2.** Hệ thống cho phép sinh viên cập nhật tiến độ công việc hàng tuần/tháng.


**R4.3.** Hệ thống cho phép sinh viên nộp báo cáo giai đoạn (file báo cáo, source code
demo).


**R4.4.** Hệ thống cho phép giảng viên hướng dẫn xem, nhận xét chi tiết và đánh giá
(Đạt/Không đạt) cho từng giai đoạn.


**R4.5.** Hệ thống cảnh báo tự động khi sinh viên chậm tiến độ hoặc không nộp báo cáo
đúng hạn.


**R4.6.** Hệ thống lưu lại lịch sử tương tác, trao đổi giữa sinh viên và giảng viên để làm
minh chứng đánh giá thái độ.


**R5. Quản lý hội đồng bảo vệ và lịch bảo vệ**


**R5.1.** Hệ thống cho phép trưởng bộ môn/khoa ra quyết định thành lập hội đồng bảo
vệ (gồm Chủ tịch, Thư ký, Ủy viên).


**R5.2.** Hệ thống cho phép phân công danh sách sinh viên/đồ án về cho từng hội đồng
cụ thể.


**R5.3.** Hệ thống cho phép xếp lịch bảo vệ (ngày, giờ, phòng, ca bảo vệ) cho từng hội
đồng.


**R5.4.** Hệ thống tự động kiểm tra xung đột lịch trình của giảng viên và tình trạng
phòng học trống.


**R5.5.** Hệ thống gửi thông báo chi tiết lịch bảo vệ cho sinh viên và thành viên hội
đồng.


**R5.6.** Hệ thống cho phép chỉnh sửa lịch bảo vệ và thông báo lại khi có thay đổi đột
xuất.


**R6. Quản lý chấm điểm và đánh giá**


**R6.1.** Hệ thống cho phép giảng viên hướng dẫn nhập điểm quá trình, điểm hướng dẫn
và nhận xét về sinh viên.


**R6.2.** Hệ thống cho phép các thành viên hội đồng (Chủ tịch, Phản biện, Thư ký) nhập
điểm và nhận xét sau buổi bảo vệ.


**R6.3.** Hệ thống tự động tính điểm tổng kết đồ án theo công thức trọng số quy định
của nhà trường.


**R6.4.** Hệ thống cho phép trưởng bộ môn/khoa rà soát và phê duyệt bảng điểm cuối
cùng.


**R6.5.** Hệ thống hiển thị kết quả điểm và xếp loại cho sinh viên tra cứu sau khi đã
công bố.


**R6.6.** Hệ thống hỗ trợ xuất biên bản bảo vệ và phiếu chấm điểm tự động từ dữ liệu đã
nhập.


**R7. Quản lý lưu trữ tài liệu**


**R7.1.** Hệ thống cho phép sinh viên upload bản cứng báo cáo đồ án (PDF/Word) và
slide thuyết trình cuối khóa.


**R7.2.** Hệ thống cho phép sinh viên upload mã nguồn (Source code) hoặc đường dẫn
sản phẩm thực tế.


**R7.3.** Hệ thống thực hiện lưu trữ tập trung các tài liệu, đảm bảo an toàn và khả năng
truy xuất lâu dài.


**R7.4.** Hệ thống cho phép giảng viên và thành viên hội đồng tải xuống tài liệu của sinh
viên để phục vụ việc chấm điểm.


**R7.5.** Hệ thống cho phép tìm kiếm, tham khảo các đồ án đã hoàn thành các khóa
trước theo tên đề tài hoặc GVHD.


**R7.6.** Hệ thống tích hợp trình xem trước (preview) cho các định dạng file phổ biến
(PDF) ngay trên trình duyệt.


**R8. Báo cáo và thống kê**


**R8.1.** Hệ thống cho phép thống kê số lượng đồ án theo năm học, học kỳ, khoa, bộ
môn.


**R8.2.** Hệ thống cho phép thống kê khối lượng hướng dẫn theo từng giảng viên (số
lượng sinh viên, số đề tài, tỷ lệ hoàn thành).


**R8.3.** Hệ thống cho phép thống kê phân bố điểm số của sinh viên (tỷ lệ Xuất sắc,
Giỏi, Khá, Trung bình, Yếu/Kém).


**R8.4.** Hệ thống cho phép xuất các báo cáo thống kê tổng hợp ra định dạng Excel
(.xlsx) hoặc PDF để phục vụ công tác lưu trữ hành chính.


**R8.5.** Hệ thống cho phép thống kê tỷ lệ sinh viên Đạt / Không đạt (Pass/Fail) sau đợt
bảo vệ để đánh giá chất lượng đào tạo.


**R8.6.** Hệ thống tích hợp công cụ hiển thị dữ liệu dưới dạng biểu đồ trực quan (biểu đồ
cột, biểu đồ tròn, biểu đồ đường) ngay trên giao diện Dashboard quản trị.


**R8.7.** Hệ thống cho phép thống kê và phân loại đồ án theo lĩnh vực nghiên cứu/công
nghệ (ví dụ: Web, Mobile, AI/Machine Learning, IoT...) để định hướng chuyên môn
cho các khóa sau.


**R9. Quản lý thông báo**


**R9.1.** Hệ thống tự động gửi email thông báo broadcast khi có đợt đăng ký đồ án mới.


**R9.2.** Hệ thống tự động gửi thông báo kết quả phân công GVHD chính thức cho sinh
viên và giảng viên.


**R9.3.** Hệ thống tự động nhắc nhở sinh viên và GVHD về các mốc tiến độ
(milestones) sắp đến hạn nộp/đánh giá.


**R9.4.** Hệ thống tự động thông báo lịch bảo vệ chi tiết (thời gian, địa điểm) cho các
bên liên quan.


**R9.5.** Hệ thống tự động thông báo kết quả điểm số cuối cùng sau khi đã được Trưởng
bộ môn phê duyệt.


**R9.6.** Hệ thống cho phép người dùng xem lại lịch sử danh sách các thông báo đã nhận
trên giao diện web.


**R10. Quản lý quyền và bảo mật**


**R10.1.** Hệ thống phân quyền chặt chẽ theo vai trò: Admin, Phòng Đào tạo, Trưởng
BM/Khoa, Giảng viên, Sinh viên.


**R10.2.** Hệ thống thực hiện mã hóa mật khẩu người dùng trong cơ sở dữ liệu (sử dụng
thuật toán băm như BCrypt).


**R10.3.** Hệ thống ghi log (nhật ký) toàn bộ các thao tác quan trọng (thêm, sửa, xóa,
phê duyệt) để phục vụ tra soát.


**R10.4.** Hệ thống cho phép Admin khóa/mở khóa tài khoản người dùng trong trường
hợp vi phạm hoặc nghỉ việc/thôi học.


**R10.5.** Hệ thống cung cấp cơ chế phục hồi mật khẩu an toàn thông qua email xác
thực (OTP hoặc Link).


**R10.6.** Hệ thống tự động đăng xuất phiên làm việc (session timeout) sau một khoảng
thời gian người dùng không hoạt động.

### **Sơ đồ Use-case**


### **1.6 Đặc tả các Use-case** **Tên Use-case 1 (Ví dụ UC1.1. Thiết lập thông tin dòng họ)**












|Số và tên UC|UC-01: Đăng nhập hệ thống|Col3|Col4|
|---|---|---|---|
|**Người tạo UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép người dùng xác thực danh tính để truy cập vào hệ<br>thống và thực hiện các chức năng theo phân quyền (Sinh<br>viên, Giảng viên, Admin...).|Cho phép người dùng xác thực danh tính để truy cập vào hệ<br>thống và thực hiện các chức năng theo phân quyền (Sinh<br>viên, Giảng viên, Admin...).|Cho phép người dùng xác thực danh tính để truy cập vào hệ<br>thống và thực hiện các chức năng theo phân quyền (Sinh<br>viên, Giảng viên, Admin...).|
|**Tác**<br>**nhân**<br>**chính**|Người dùng hệ thống (Admin, Giảng viên, Sinh viên, Phòng<br>Đào tạo, Trưởng BM/Khoa).|Người dùng hệ thống (Admin, Giảng viên, Sinh viên, Phòng<br>Đào tạo, Trưởng BM/Khoa).|Người dùng hệ thống (Admin, Giảng viên, Sinh viên, Phòng<br>Đào tạo, Trưởng BM/Khoa).|
|**Tác nhân phụ**<br>**(nếu có)**|Hệ thống cơ sở dữ liệu (Database).|Hệ thống cơ sở dữ liệu (Database).|Hệ thống cơ sở dữ liệu (Database).|
|**Sự kiện kích**<br>**hoạt**|Người dùng truy cập vào trang chủ hoặc mở ứng dụng quản<br>lý đồ án.|Người dùng truy cập vào trang chủ hoặc mở ứng dụng quản<br>lý đồ án.|Người dùng truy cập vào trang chủ hoặc mở ứng dụng quản<br>lý đồ án.|
|**Tiền điều kiện**|1. Người dùng đã được cấp tài khoản trong hệ thống.<br> <br> <br>2. Tài khoản đang ở trạng thái hoạt động.|1. Người dùng đã được cấp tài khoản trong hệ thống.<br> <br> <br>2. Tài khoản đang ở trạng thái hoạt động.|1. Người dùng đã được cấp tài khoản trong hệ thống.<br> <br> <br>2. Tài khoản đang ở trạng thái hoạt động.|
|**Hậu điều kiện**|1. Người dùng truy cập thành công vào Dashboard tương<br>ứng với vai trò.<br> <br> <br>2. Hệ thống khởi tạo phiên làm việc (session).|1. Người dùng truy cập thành công vào Dashboard tương<br>ứng với vai trò.<br> <br> <br>2. Hệ thống khởi tạo phiên làm việc (session).|1. Người dùng truy cập thành công vào Dashboard tương<br>ứng với vai trò.<br> <br> <br>2. Hệ thống khởi tạo phiên làm việc (session).|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị màn hình đăng nhập.<br> <br> <br>2. Người dùng nhập "Tên đăng nhập" và "Mật khẩu".<br> <br> <br>3. Người dùng nhấn nút "Đăng nhập".<br> <br> <br>4. Hệ thống kiểm tra định dạng dữ liệu nhập vào.<br> <br> <br>5. Hệ thống mã hóa mật khẩu nhập vào và so sánh với mật<br>khẩu trong CSDL.|1. Hệ thống hiển thị màn hình đăng nhập.<br> <br> <br>2. Người dùng nhập "Tên đăng nhập" và "Mật khẩu".<br> <br> <br>3. Người dùng nhấn nút "Đăng nhập".<br> <br> <br>4. Hệ thống kiểm tra định dạng dữ liệu nhập vào.<br> <br> <br>5. Hệ thống mã hóa mật khẩu nhập vào và so sánh với mật<br>khẩu trong CSDL.|1. Hệ thống hiển thị màn hình đăng nhập.<br> <br> <br>2. Người dùng nhập "Tên đăng nhập" và "Mật khẩu".<br> <br> <br>3. Người dùng nhấn nút "Đăng nhập".<br> <br> <br>4. Hệ thống kiểm tra định dạng dữ liệu nhập vào.<br> <br> <br>5. Hệ thống mã hóa mật khẩu nhập vào và so sánh với mật<br>khẩu trong CSDL.|


|Col1|6. Hệ thống xác thực thành công và kiểm tra quyền hạn<br>(Role) của người dùng.<br>7. Hệ thống chuyển hướng người dùng đến trang chủ dành<br>riêng cho vai trò đó.<br>8. Hệ thống ghi log thời gian đăng nhập.|
|---|---|
|**Luồng**<br>**thay**<br>**thế**|**A1: Ghi nhớ đăng nhập** <br> <br> <br>1. Tại bước 2, người dùng tích chọn "Ghi nhớ đăng nhập".<br> <br> <br>2. Sau bước 7, hệ thống lưu token xác thực để tự động đăng<br>nhập lần sau.|
|**Các ngoại lệ**|**E1: Sai thông tin đăng nhập** <br> <br> <br>1. Tại bước 5, hệ thống xác thực thất bại.<br> <br> <br>2. Hệ thống hiển thị thông báo "Tên đăng nhập hoặc mật<br>khẩu không đúng".<br> <br> <br>3. Quay lại bước 2.<br> <br> <br>**E2: Tài khoản bị khóa** <br> <br> <br>1. Hệ thống phát hiện tài khoản bị vô hiệu hóa.<br> <br> <br>2. Thông báo "Tài khoản bị khóa. Vui lòng liên hệ Admin".|
|**Độ ưu tiên**|Cao (Bắt buộc).|
|**Các quy tắc**<br>**nghiệp vụ**|1. Mật khẩu phải được mã hóa (Hash) trước khi lưu và so<br>sánh.<br> <br> <br>2. Hệ thống tự động khóa tài khoản nếu nhập sai quá 5 lần<br>liên tiếp.|


|Số và tên UC|UC-02: Đổi mật khẩu|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép người dùng thay đổi mật khẩu đăng nhập để<br>bảo vệ tài khoản cá nhân.|Cho phép người dùng thay đổi mật khẩu đăng nhập để<br>bảo vệ tài khoản cá nhân.|Cho phép người dùng thay đổi mật khẩu đăng nhập để<br>bảo vệ tài khoản cá nhân.|
|**Tác**<br>**nhân**<br>**chính**|Người dùng hệ thống (đã đăng nhập).|Người dùng hệ thống (đã đăng nhập).|Người dùng hệ thống (đã đăng nhập).|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**||||
|**Sự kiện kích**<br>**hoạt**|Người dùng chọn chức năng "Đổi mật khẩu" từ menu tài<br>khoản.|Người dùng chọn chức năng "Đổi mật khẩu" từ menu tài<br>khoản.|Người dùng chọn chức năng "Đổi mật khẩu" từ menu tài<br>khoản.|
|**Tiền**<br>**điều**<br>**kiện**|Người dùng đã đăng nhập thành công vào hệ thống.|Người dùng đã đăng nhập thành công vào hệ thống.|Người dùng đã đăng nhập thành công vào hệ thống.|
|**Hậu**<br>**điều**<br>**kiện**|Mật khẩu mới được cập nhật vào cơ sở dữ liệu (dưới<br>dạng mã hóa).|Mật khẩu mới được cập nhật vào cơ sở dữ liệu (dưới<br>dạng mã hóa).|Mật khẩu mới được cập nhật vào cơ sở dữ liệu (dưới<br>dạng mã hóa).|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị form đổi mật khẩu (Mật khẩu cũ, Mật<br>khẩu mới, Xác nhận mật khẩu mới).<br> <br> <br>2. Người dùng nhập đầy đủ thông tin.<br> <br> <br>3. Người dùng nhấn "Lưu thay đổi".<br> <br> <br>4. Hệ thống kiểm tra "Mật khẩu cũ" có khớp với mật khẩu<br>hiện tại không.<br> <br> <br>5. Hệ thống kiểm tra độ mạnh của "Mật khẩu mới" (độ dài,<br>ký tự đặc biệt).<br> <br>|1. Hệ thống hiển thị form đổi mật khẩu (Mật khẩu cũ, Mật<br>khẩu mới, Xác nhận mật khẩu mới).<br> <br> <br>2. Người dùng nhập đầy đủ thông tin.<br> <br> <br>3. Người dùng nhấn "Lưu thay đổi".<br> <br> <br>4. Hệ thống kiểm tra "Mật khẩu cũ" có khớp với mật khẩu<br>hiện tại không.<br> <br> <br>5. Hệ thống kiểm tra độ mạnh của "Mật khẩu mới" (độ dài,<br>ký tự đặc biệt).<br> <br>|1. Hệ thống hiển thị form đổi mật khẩu (Mật khẩu cũ, Mật<br>khẩu mới, Xác nhận mật khẩu mới).<br> <br> <br>2. Người dùng nhập đầy đủ thông tin.<br> <br> <br>3. Người dùng nhấn "Lưu thay đổi".<br> <br> <br>4. Hệ thống kiểm tra "Mật khẩu cũ" có khớp với mật khẩu<br>hiện tại không.<br> <br> <br>5. Hệ thống kiểm tra độ mạnh của "Mật khẩu mới" (độ dài,<br>ký tự đặc biệt).<br> <br>|


|Col1|6. Hệ thống kiểm tra sự trùng khớp giữa "Mật khẩu mới" và<br>"Xác nhận mật khẩu".<br>7. Hệ thống mã hóa mật khẩu mới và cập nhật vào CSDL.<br>8. Hệ thống thông báo thành công và ghi log thao tác.|
|---|---|
|**Luồng thay**<br>**thế**|Không có.|
|**Các ngoại lệ**|**E1: Sai mật khẩu cũ** <br> <br> <br>1. Tại bước 4, hệ thống phát hiện sai lệch.<br> <br> <br>2. Thông báo "Mật khẩu hiện tại không chính xác".<br> <br> <br>**E2: Xác nhận mật khẩu không khớp** <br> <br> <br>1. Tại bước 6, hai mật khẩu mới không giống nhau.<br> <br> <br>2. Thông báo "Mật khẩu xác nhận không trùng khớp".|
|**Độ ưu tiên**|Trung bình.|
|**Các quy tắc**<br>**nghiệp vụ**|1. Mật khẩu mới không được trùng với 3 lần mật khẩu gần<br>nhất.<br> <br> <br>2. Mật khẩu phải có tối thiểu 8 ký tự, bao gồm chữ hoa,<br>chữ thường và số.|
|**Các**<br>**giả**<br>**thuyết**|Không có.|


|Số và tên UC|UC-03: Cập nhật thông tin cá nhân|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép người dùng tự chỉnh sửa các thông tin liên hệ<br>cơ bản (Email, Số điện thoại, Địa chỉ) để đảm bảo thông<br>tin liên lạc chính xác.|Cho phép người dùng tự chỉnh sửa các thông tin liên hệ<br>cơ bản (Email, Số điện thoại, Địa chỉ) để đảm bảo thông<br>tin liên lạc chính xác.|Cho phép người dùng tự chỉnh sửa các thông tin liên hệ<br>cơ bản (Email, Số điện thoại, Địa chỉ) để đảm bảo thông<br>tin liên lạc chính xác.|
|**Tác**<br>**nhân**<br>**chính**|Người dùng hệ thống.|Người dùng hệ thống.|Người dùng hệ thống.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**||||
|**Sự kiện kích**<br>**hoạt**|Người dùng chọn chức năng "Thông tin cá nhân" -><br>"Chỉnh sửa".|Người dùng chọn chức năng "Thông tin cá nhân" -><br>"Chỉnh sửa".|Người dùng chọn chức năng "Thông tin cá nhân" -><br>"Chỉnh sửa".|
|**Tiền**<br>**điều**<br>**kiện**|Người dùng đã đăng nhập vào hệ thống.|Người dùng đã đăng nhập vào hệ thống.|Người dùng đã đăng nhập vào hệ thống.|
|**Hậu**<br>**điều**<br>**kiện**|Thông tin cá nhân mới được lưu trữ và hiển thị trên hồ<br>sơ.|Thông tin cá nhân mới được lưu trữ và hiển thị trên hồ<br>sơ.|Thông tin cá nhân mới được lưu trữ và hiển thị trên hồ<br>sơ.|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị thông tin cá nhân hiện tại của người<br>dùng.<br> <br> <br>2. Người dùng chọn "Chỉnh sửa".<br> <br> <br>3. Hệ thống cho phép sửa các trường: Số điện thoại, Email<br>cá nhân, Địa chỉ (Các trường như Mã số, Họ tên bị khóa).<br> <br> <br>4. Người dùng nhập thông tin mới và nhấn "Lưu".<br> <br> <br>5. Hệ thống kiểm tra định dạng Email và Số điện thoại.<br> <br> <br>6. Hệ thống lưu thay đổi vào CSDL.<br> <br> <br>7. Hệ thống thông báo "Cập nhật thành công" và ghi log.|1. Hệ thống hiển thị thông tin cá nhân hiện tại của người<br>dùng.<br> <br> <br>2. Người dùng chọn "Chỉnh sửa".<br> <br> <br>3. Hệ thống cho phép sửa các trường: Số điện thoại, Email<br>cá nhân, Địa chỉ (Các trường như Mã số, Họ tên bị khóa).<br> <br> <br>4. Người dùng nhập thông tin mới và nhấn "Lưu".<br> <br> <br>5. Hệ thống kiểm tra định dạng Email và Số điện thoại.<br> <br> <br>6. Hệ thống lưu thay đổi vào CSDL.<br> <br> <br>7. Hệ thống thông báo "Cập nhật thành công" và ghi log.|1. Hệ thống hiển thị thông tin cá nhân hiện tại của người<br>dùng.<br> <br> <br>2. Người dùng chọn "Chỉnh sửa".<br> <br> <br>3. Hệ thống cho phép sửa các trường: Số điện thoại, Email<br>cá nhân, Địa chỉ (Các trường như Mã số, Họ tên bị khóa).<br> <br> <br>4. Người dùng nhập thông tin mới và nhấn "Lưu".<br> <br> <br>5. Hệ thống kiểm tra định dạng Email và Số điện thoại.<br> <br> <br>6. Hệ thống lưu thay đổi vào CSDL.<br> <br> <br>7. Hệ thống thông báo "Cập nhật thành công" và ghi log.|


|Luồng thay<br>thế|A1: Hủy bỏ thay đổi<br>1. Tại bước 4, người dùng nhấn "Hủy".<br>2. Hệ thống hoàn tác dữ liệu về trạng thái ban đầu và<br>thoát chế độ sửa.|
|---|---|
|**Các ngoại lệ**|**E1: Sai định dạng Email/SĐT** <br> <br> <br>1. Tại bước 5, dữ liệu không hợp lệ.<br> <br> <br>2. Hệ thống báo lỗi cụ thể tại trường bị sai.|
|**Độ ưu tiên**|Thấp.|
|**Các quy tắc**<br>**nghiệp vụ**|1. Sinh viên/Giảng viên không được phép tự đổi Mã số và<br>Họ tên (phải liên hệ Admin/Phòng Đào tạo).<br> <br> <br>2. Email phải là duy nhất trong hệ thống.|
|**Các**<br>**giả**<br>**thuyết**|Người dùng chịu trách nhiệm về tính chính xác của thông<br>tin liên hệ.|














|Số và tên UC|UC-2.1: Mở đợt đăng ký đồ án|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép Phòng Đào tạo thiết lập các mốc thời gian<br>quan trọng cho kỳ đồ án (thời gian nộp đề tài, thời gian<br>đăng ký của sinh viên, thời gian bảo vệ dự kiến).|Cho phép Phòng Đào tạo thiết lập các mốc thời gian<br>quan trọng cho kỳ đồ án (thời gian nộp đề tài, thời gian<br>đăng ký của sinh viên, thời gian bảo vệ dự kiến).|Cho phép Phòng Đào tạo thiết lập các mốc thời gian<br>quan trọng cho kỳ đồ án (thời gian nộp đề tài, thời gian<br>đăng ký của sinh viên, thời gian bảo vệ dự kiến).|
|**Tác**<br>**nhân**<br>**chính**|Phòng Đào tạo.|Phòng Đào tạo.|Phòng Đào tạo.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**||||


|Sự kiện kích<br>hoạt|Nhân viên Phòng Đào tạo chọn chức năng "Quản lý đợt<br>đăng ký" vào đầu mỗi học kỳ.|
|---|---|
|**Tiền**<br>**điều**<br>**kiện**|1. Đăng nhập với quyền Phòng Đào tạo.<br> <br> <br>2. Danh mục niên khóa/học kỳ đã được khởi tạo.|
|**Hậu**<br>**điều**<br>**kiện**|1. Đợt đăng ký được kích hoạt.<br> <br> <br>2. Hệ thống gửi thông báo broadcast đến toàn thể giảng<br>viên và sinh viên (R9.1).|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị danh sách các đợt đăng ký cũ.<br> <br> <br>2. Người dùng nhấn "Tạo đợt mới".<br> <br> <br>3. Hệ thống hiển thị form nhập: Tên đợt, Học kỳ, Ngày bắt<br>đầu/kết thúc đăng ký đề tài, Ngày bắt đầu/kết thúc sinh viên<br>đăng ký.<br> <br> <br>4. Người dùng nhập dữ liệu và nhấn "Lưu".<br> <br> <br>5. Hệ thống kiểm tra tính hợp lệ của thời gian (Ngày kết thúc<br>> Ngày bắt đầu).<br> <br> <br>6. Hệ thống lưu cấu hình vào CSDL.<br> <br> <br>7. Hệ thống ghi log thao tác quan trọng này.<br> <br> <br>8. Hệ thống kích hoạt trạng thái "Đang mở" cho đợt đăng<br>ký.|
|**Luồng thay**<br>**thế**|**A1: Chỉnh sửa đợt đăng ký** <br> <br> <br>1. Người dùng chọn đợt đang mở và sửa lại mốc thời gian<br>(gia hạn).|


|Col1|2. Hệ thống cập nhật và thông báo lại cho người dùng<br>liên quan.|
|---|---|
|**Các ngoại lệ**|**E1: Lỗi logic thời gian** <br> <br> <br>1. Tại bước 5, người dùng nhập Ngày kết thúc < Ngày bắt<br>đầu.<br> <br> <br>2. Hệ thống báo lỗi "Thời gian không hợp lệ".|
|**Độ ưu tiên**|Cao.|
|**Các quy tắc**<br>**nghiệp vụ**|Chỉ được phép có 01 đợt đăng ký ở trạng thái "Active"<br>(Đang mở) cho cùng một loại đồ án trong một thời điểm.|
|**Các**<br>**giả**<br>**thuyết**|Không có.|














|Số và tên UC|UC-2.2: Phân công đồ án vào Hội đồng|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Phân chia danh sách các đồ án đủ điều kiện bảo vệ vào<br>các Hội đồng chuyên môn tương ứng đã được thành lập<br>trước đó.|Phân chia danh sách các đồ án đủ điều kiện bảo vệ vào<br>các Hội đồng chuyên môn tương ứng đã được thành lập<br>trước đó.|Phân chia danh sách các đồ án đủ điều kiện bảo vệ vào<br>các Hội đồng chuyên môn tương ứng đã được thành lập<br>trước đó.|
|**Tác**<br>**nhân**<br>**chính**|Phòng Đào tạo.|Phòng Đào tạo.|Phòng Đào tạo.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Trưởng Khoa (có thể tham gia tham vấn).|Trưởng Khoa (có thể tham gia tham vấn).|Trưởng Khoa (có thể tham gia tham vấn).|
|**Sự kiện kích**<br>**hoạt**|Sau khi kết thúc giai đoạn phản biện và có danh sách<br>sinh viên đủ điều kiện bảo vệ.|Sau khi kết thúc giai đoạn phản biện và có danh sách<br>sinh viên đủ điều kiện bảo vệ.|Sau khi kết thúc giai đoạn phản biện và có danh sách<br>sinh viên đủ điều kiện bảo vệ.|
|**Tiền**<br>**điều**<br>**kiện**|1. Các Hội đồng bảo vệ đã được Trưởng bộ môn/Khoa<br>thành lập (UC-3.3).<br> <br>|1. Các Hội đồng bảo vệ đã được Trưởng bộ môn/Khoa<br>thành lập (UC-3.3).<br> <br>|1. Các Hội đồng bảo vệ đã được Trưởng bộ môn/Khoa<br>thành lập (UC-3.3).<br> <br>|


|Col1|2. Sinh viên đã hoàn thành đóng học phí và nộp báo cáo<br>đúng hạn.|
|---|---|
|**Hậu**<br>**điều**<br>**kiện**|Danh sách sinh viên được gán cụ thể vào từng Hội đồng.|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị danh sách Hội đồng và danh sách Đồ<br>án chưa phân công.<br> <br> <br>2. Người dùng chọn một Hội đồng.<br> <br> <br>3. Người dùng tích chọn các Đồ án phù hợp (cùng chuyên<br>môn) và nhấn "Gán".<br> <br> <br>4. Hệ thống kiểm tra sức chứa của Hội đồng (Ví dụ: tối đa<br>20 sinh viên/buổi).<br> <br> <br>5. Hệ thống lưu kết quả phân công.<br> <br> <br>6. Hệ thống cập nhật trạng thái của sinh viên thành "Đã<br>xếp hội đồng".|
|**Luồng thay**<br>**thế**|**A1: Phân công tự động** <br> <br> <br>1. Người dùng chọn "Phân công tự động theo chuyên<br>ngành".<br> <br> <br>2. Hệ thống tự động gán sinh viên vào hội đồng có<br>chuyên môn tương ứng.|
|**Các ngoại lệ**|**E1: Hội đồng quá tải** <br> <br> <br>1. Số lượng sinh viên gán vào vượt quá quy định.<br> <br> <br>2. Hệ thống cảnh báo và yêu cầu tạo thêm hội đồng hoặc<br>xếp sang buổi khác.|
|**Độ ưu tiên**|Cao.|


|Các quy tắc<br>nghiệp vụ|1. Giảng viên hướng dẫn không được ngồi trong hội đồng<br>chấm chính sinh viên của mình (nếu quy chế trường quy<br>định).<br>2. Đồ án thuộc chuyên ngành nào phải vào hội đồng<br>chuyên ngành đó.|
|---|---|
|**Các**<br>**giả**<br>**thuyết**|Dữ liệu về chuyên ngành của đồ án và hội đồng đã được<br>nhập chính xác.|














|Số và tên UC|UC-2.3: Xếp lịch bảo vệ (Thời gian, Địa điểm)|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Xác định thời gian cụ thể (Ca, Ngày) và địa điểm (Phòng<br>học) cho các buổi bảo vệ của từng Hội đồng.|Xác định thời gian cụ thể (Ca, Ngày) và địa điểm (Phòng<br>học) cho các buổi bảo vệ của từng Hội đồng.|Xác định thời gian cụ thể (Ca, Ngày) và địa điểm (Phòng<br>học) cho các buổi bảo vệ của từng Hội đồng.|
|**Tác**<br>**nhân**<br>**chính**|Phòng Đào tạo.|Phòng Đào tạo.|Phòng Đào tạo.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Hệ thống quản lý phòng học (nếu tích hợp).|Hệ thống quản lý phòng học (nếu tích hợp).|Hệ thống quản lý phòng học (nếu tích hợp).|
|**Sự kiện kích**<br>**hoạt**|Sau khi đã phân công đồ án vào hội đồng (UC-2.2).|Sau khi đã phân công đồ án vào hội đồng (UC-2.2).|Sau khi đã phân công đồ án vào hội đồng (UC-2.2).|
|**Tiền**<br>**điều**<br>**kiện**|Danh sách hội đồng đã có đủ sinh viên.|Danh sách hội đồng đã có đủ sinh viên.|Danh sách hội đồng đã có đủ sinh viên.|
|**Hậu**<br>**điều**<br>**kiện**|1. Lịch bảo vệ được ban hành.<br> <br> <br>2. Giảng viên và Sinh viên nhận được thông báo lịch chi<br>tiết (R9.4).|1. Lịch bảo vệ được ban hành.<br> <br> <br>2. Giảng viên và Sinh viên nhận được thông báo lịch chi<br>tiết (R9.4).|1. Lịch bảo vệ được ban hành.<br> <br> <br>2. Giảng viên và Sinh viên nhận được thông báo lịch chi<br>tiết (R9.4).|
|**Luồng thông**<br>**thường**|1. Người dùng chọn Hội đồng cần xếp lịch.<br> <br> <br>2. Hệ thống hiển thị danh sách phòng trống và lịch biểu.<br> <br> <br>3. Người dùng chọn Ngày, Ca bảo vệ và Phòng.|1. Người dùng chọn Hội đồng cần xếp lịch.<br> <br> <br>2. Hệ thống hiển thị danh sách phòng trống và lịch biểu.<br> <br> <br>3. Người dùng chọn Ngày, Ca bảo vệ và Phòng.|1. Người dùng chọn Hội đồng cần xếp lịch.<br> <br> <br>2. Hệ thống hiển thị danh sách phòng trống và lịch biểu.<br> <br> <br>3. Người dùng chọn Ngày, Ca bảo vệ và Phòng.|


|Col1|4. Hệ thống kiểm tra xung đột: Phòng có trống không?<br>Thành viên hội đồng có bị trùng lịch dạy không? (R5.4).<br>5. Nếu không trùng, hệ thống cho phép "Lưu lịch".<br>6. Hệ thống gửi thông báo đến các thành viên liên quan.<br>7. Hệ thống ghi log thao tác.|
|---|---|
|**Luồng thay**<br>**thế**|Không có.|
|**Các ngoại lệ**|**E1: Xung đột lịch/Phòng** <br> <br> <br>1. Tại bước 4, hệ thống phát hiện trùng lặp.<br> <br> <br>2. Hệ thống hiển thị cảnh báo đỏ: "Phòng X đã có lớp<br>học" hoặc "Giảng viên A đang bận".|
|**Độ ưu tiên**|Cao.|
|**Các quy tắc**<br>**nghiệp vụ**|Không được xếp lịch quá giới hạn thời gian của đợt bảo<br>vệ (đã thiết lập ở UC-2.1).|
|**Các**<br>**giả**<br>**thuyết**|Dữ liệu về tình trạng phòng học là chính xác theo thời<br>gian thực.|














|Số và tên UC|UC-2.4: Thống kê số liệu đồ án toàn trường|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Xem các biểu đồ và số liệu tổng hợp về tình hình thực<br>hiện đồ án của toàn trường (Số lượng đề tài, tỷ lệ<br>Đạt/Hỏng, phân bố điểm).|Xem các biểu đồ và số liệu tổng hợp về tình hình thực<br>hiện đồ án của toàn trường (Số lượng đề tài, tỷ lệ<br>Đạt/Hỏng, phân bố điểm).|Xem các biểu đồ và số liệu tổng hợp về tình hình thực<br>hiện đồ án của toàn trường (Số lượng đề tài, tỷ lệ<br>Đạt/Hỏng, phân bố điểm).|


|Tác nhân<br>chính|Phòng Đào tạo, Ban Giám hiệu (Admin).|
|---|---|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Không.|
|**Sự kiện kích**<br>**hoạt**|Người dùng truy cập Dashboard thống kê.|
|**Tiền**<br>**điều**<br>**kiện**|Đăng nhập với quyền hạn cấp Trường.|
|**Hậu**<br>**điều**<br>**kiện**|Không có (chỉ xem).|
|**Luồng thông**<br>**thường**|1. Người dùng chọn menu "Thống kê".<br> <br> <br>2. Hệ thống hiển thị Dashboard với các widget: Tổng số đồ<br>án, Biểu đồ tròn tỷ lệ điểm, Biểu đồ cột số lượng theo Khoa.<br> <br> <br>3. Người dùng chọn bộ lọc (Năm học, Học kỳ).<br> <br> <br>4. Hệ thống truy vấn và hiển thị lại dữ liệu theo bộ lọc.<br> <br> <br>5. Thời gian phản hồi hiển thị biểu đồ phải < 3 giây.|
|**Luồng thay**<br>**thế**|Không có.|
|**Các ngoại lệ**|**E1: Không có dữ liệu** <br> <br> <br>1. Hệ thống không tìm thấy dữ liệu cho kỳ học đã chọn.<br> <br> <br>2. Hiển thị thông báo "Chưa có dữ liệu".|
|**Độ ưu tiên**|Trung bình.|
|**Các quy tắc**<br>**nghiệp vụ**|Dữ liệu thống kê phải đảm bảo tính chính xác và cập nhật<br>theo thời gian thực (Real-time) hoặc độ trễ cho phép tối<br>đa 1 giờ.|


|Số và tên UC|UC-2.5: Xuất báo cáo tổng hợp|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Trích xuất dữ liệu danh sách đồ án, điểm số, và kết quả<br>bảo vệ ra các định dạng file lưu trữ (Excel, PDF) để phục<br>vụ công tác hành chính.|Trích xuất dữ liệu danh sách đồ án, điểm số, và kết quả<br>bảo vệ ra các định dạng file lưu trữ (Excel, PDF) để phục<br>vụ công tác hành chính.|Trích xuất dữ liệu danh sách đồ án, điểm số, và kết quả<br>bảo vệ ra các định dạng file lưu trữ (Excel, PDF) để phục<br>vụ công tác hành chính.|
|**Tác**<br>**nhân**<br>**chính**|Phòng Đào tạo.|Phòng Đào tạo.|Phòng Đào tạo.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Không.|Không.|Không.|
|**Sự kiện kích**<br>**hoạt**|Khi cần lưu trữ hồ sơ cuối kỳ hoặc báo cáo lên cấp trên.|Khi cần lưu trữ hồ sơ cuối kỳ hoặc báo cáo lên cấp trên.|Khi cần lưu trữ hồ sơ cuối kỳ hoặc báo cáo lên cấp trên.|
|**Tiền**<br>**điều**<br>**kiện**|Có dữ liệu để xuất.|Có dữ liệu để xuất.|Có dữ liệu để xuất.|
|**Hậu**<br>**điều**<br>**kiện**|File báo cáo được tải xuống thiết bị người dùng.|File báo cáo được tải xuống thiết bị người dùng.|File báo cáo được tải xuống thiết bị người dùng.|
|**Luồng thông**<br>**thường**|1. Người dùng chọn chức năng "Xuất báo cáo".<br> <br> <br>2. Hệ thống yêu cầu chọn loại báo cáo (Danh sách điểm,<br>Danh sách hội đồng, Tổng hợp kết quả).<br> <br> <br>3. Người dùng chọn định dạng file (Excel .xlsx hoặc PDF).<br> <br> <br>4. Hệ thống xử lý dữ liệu và tạo file.<br> <br> <br>5. Hệ thống kích hoạt hộp thoại tải xuống (Download).|1. Người dùng chọn chức năng "Xuất báo cáo".<br> <br> <br>2. Hệ thống yêu cầu chọn loại báo cáo (Danh sách điểm,<br>Danh sách hội đồng, Tổng hợp kết quả).<br> <br> <br>3. Người dùng chọn định dạng file (Excel .xlsx hoặc PDF).<br> <br> <br>4. Hệ thống xử lý dữ liệu và tạo file.<br> <br> <br>5. Hệ thống kích hoạt hộp thoại tải xuống (Download).|1. Người dùng chọn chức năng "Xuất báo cáo".<br> <br> <br>2. Hệ thống yêu cầu chọn loại báo cáo (Danh sách điểm,<br>Danh sách hội đồng, Tổng hợp kết quả).<br> <br> <br>3. Người dùng chọn định dạng file (Excel .xlsx hoặc PDF).<br> <br> <br>4. Hệ thống xử lý dữ liệu và tạo file.<br> <br> <br>5. Hệ thống kích hoạt hộp thoại tải xuống (Download).|


|Luồng thay<br>thế|Không có.|
|---|---|
|**Các ngoại lệ**|**E1: Lỗi tạo file** <br> <br> <br>1. Hệ thống gặp lỗi trong quá trình render file.<br> <br> <br>2. Thông báo "Lỗi hệ thống, vui lòng thử lại sau".|
|**Độ ưu tiên**|Trung bình.|
|**Các quy tắc**<br>**nghiệp vụ**|File xuất ra phải tuân thủ bảng mã UTF-8 để hiển thị đúng<br>Tiếng Việt.|
|**Các**<br>**giả**<br>**thuyết**|Không.|














|Số và tên UC|UC-3.1: Phê duyệt đề tài đồ án|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép Trưởng bộ môn/Khoa xem xét nội dung các đề<br>tài do Giảng viên hoặc Sinh viên đề xuất và đưa ra quyết<br>định chấp thuận hoặc từ chối dựa trên tính khả thi và<br>chuyên môn.|Cho phép Trưởng bộ môn/Khoa xem xét nội dung các đề<br>tài do Giảng viên hoặc Sinh viên đề xuất và đưa ra quyết<br>định chấp thuận hoặc từ chối dựa trên tính khả thi và<br>chuyên môn.|Cho phép Trưởng bộ môn/Khoa xem xét nội dung các đề<br>tài do Giảng viên hoặc Sinh viên đề xuất và đưa ra quyết<br>định chấp thuận hoặc từ chối dựa trên tính khả thi và<br>chuyên môn.|
|**Tác**<br>**nhân**<br>**chính**|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**||||
|**Sự kiện kích**<br>**hoạt**|Sau khi Giảng viên/Sinh viên hoàn tất việc gửi đề xuất đề<br>tài lên hệ thống.|Sau khi Giảng viên/Sinh viên hoàn tất việc gửi đề xuất đề<br>tài lên hệ thống.|Sau khi Giảng viên/Sinh viên hoàn tất việc gửi đề xuất đề<br>tài lên hệ thống.|
|**Tiền**<br>**điều**<br>**kiện**|1. Đăng nhập với quyền Trưởng Bộ môn/Khoa.<br> <br>|1. Đăng nhập với quyền Trưởng Bộ môn/Khoa.<br> <br>|1. Đăng nhập với quyền Trưởng Bộ môn/Khoa.<br> <br>|


|Col1|2. Có danh sách đề tài ở trạng thái "Chờ duyệt".|
|---|---|
|**Hậu**<br>**điều**<br>**kiện**|1. Đề tài chuyển sang trạng thái "Đã duyệt" (có thể đăng ký)<br>hoặc "Từ chối".<br> <br> <br>2. Hệ thống gửi thông báo kết quả cho người đề xuất.|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị danh sách các đề tài đang chờ phê<br>duyệt.<br> <br> <br>2. Người dùng chọn xem chi tiết một đề tài (Tên, Mô tả, Yêu<br>cầu kiến thức).<br> <br> <br>3. Người dùng đánh giá và nhấn nút "Phê duyệt".<br> <br> <br>4. Hệ thống cập nhật trạng thái đề tài thành "Đã duyệt".<br> <br> <br>5. Hệ thống ghi log thao tác phê duyệt.<br> <br> <br>6. Hệ thống gửi thông báo tự động cho tác giả đề tài.|
|**Luồng thay**<br>**thế**|**A1: Từ chối đề tài** <br> <br> <br>1. Tại bước 3, người dùng nhấn "Từ chối".<br> <br> <br>2. Hệ thống hiển thị hộp thoại yêu cầu nhập "Lý do từ chối".<br> <br> <br>3. Người dùng nhập lý do và xác nhận.<br> <br> <br>4. Hệ thống cập nhật trạng thái "Bị từ chối" kèm lý do.|
|**Các ngoại lệ**|**E1: Đề tài trùng lặp** <br> <br> <br>1. Hệ thống cảnh báo nếu tên đề tài trùng với các đề tài đã<br>có trong kho lưu trữ.<br> <br>|


|Col1|2. Người dùng xem xét cảnh báo và quyết định có duyệt<br>hay không.|
|---|---|
|**Độ ưu tiên**|Cao.|
|**Các quy tắc**<br>**nghiệp vụ**|Chỉ có Trưởng bộ môn/Khoa mới có quyền duyệt đề tài<br>thuộc phạm vi quản lý của đơn vị mình.|
|**Các**<br>**giả**<br>**thuyết**|Không.|














|Số và tên UC|UC-3.2: Phân công GVHD (Thủ công)|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Phân công Giảng viên hướng dẫn cho các sinh viên hoặc<br>nhóm sinh viên chưa tìm được người hướng dẫn sau đợt<br>đăng ký, hoặc điều chỉnh phân công trong trường hợp<br>đặc biệt.|Phân công Giảng viên hướng dẫn cho các sinh viên hoặc<br>nhóm sinh viên chưa tìm được người hướng dẫn sau đợt<br>đăng ký, hoặc điều chỉnh phân công trong trường hợp<br>đặc biệt.|Phân công Giảng viên hướng dẫn cho các sinh viên hoặc<br>nhóm sinh viên chưa tìm được người hướng dẫn sau đợt<br>đăng ký, hoặc điều chỉnh phân công trong trường hợp<br>đặc biệt.|
|**Tác**<br>**nhân**<br>**chính**|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Không.|Không.|Không.|
|**Sự kiện kích**<br>**hoạt**|Kết thúc đợt đăng ký tự do, vẫn còn sinh viên chưa có<br>GVHD.|Kết thúc đợt đăng ký tự do, vẫn còn sinh viên chưa có<br>GVHD.|Kết thúc đợt đăng ký tự do, vẫn còn sinh viên chưa có<br>GVHD.|
|**Tiền**<br>**điều**<br>**kiện**|Danh sách sinh viên chưa có GVHD và danh sách GV<br>còn chỉ tiêu hướng dẫn.|Danh sách sinh viên chưa có GVHD và danh sách GV<br>còn chỉ tiêu hướng dẫn.|Danh sách sinh viên chưa có GVHD và danh sách GV<br>còn chỉ tiêu hướng dẫn.|
|**Hậu**<br>**điều**<br>**kiện**|Sinh viên được gán GVHD chính thức trên hệ thống.|Sinh viên được gán GVHD chính thức trên hệ thống.|Sinh viên được gán GVHD chính thức trên hệ thống.|
|**Luồng thông**<br>**thường**|1. Hệ thống hiển thị danh sách sinh viên chưa có<br>nhóm/GVHD.<br> <br> <br>2. Người dùng chọn một hoặc nhiều sinh viên.|1. Hệ thống hiển thị danh sách sinh viên chưa có<br>nhóm/GVHD.<br> <br> <br>2. Người dùng chọn một hoặc nhiều sinh viên.|1. Hệ thống hiển thị danh sách sinh viên chưa có<br>nhóm/GVHD.<br> <br> <br>2. Người dùng chọn một hoặc nhiều sinh viên.|


|Col1|3. Hệ thống hiển thị danh sách Giảng viên khả dụng (kèm số<br>lượng đang hướng dẫn).<br>4. Người dùng chọn GVHD và nhấn "Phân công".<br>5. Hệ thống kiểm tra số lượng tối đa của giảng viên.<br>6. Hệ thống lưu kết quả phân công và gửi thông báo cho<br>cả hai bên.|
|---|---|
|**Luồng thay**<br>**thế**|**A1: Thay đổi GVHD** <br> <br> <br>1. Người dùng tìm kiếm sinh viên đã có GVHD.<br> <br> <br>2. Chọn chức năng "Chuyển GVHD".<br> <br> <br>3. Chọn GV mới và nhập lý do thay đổi.|
|**Các ngoại lệ**|**E1: Giảng viên quá tải** <br> <br> <br>1. Tại bước 5, nếu số lượng hướng dẫn vượt quá quy định.<br> <br> <br>2. Hệ thống cảnh báo "Giảng viên đã đủ chỉ tiêu" (nhưng<br>cho phép ghi đè nếu có quyền Admin/Trưởng khoa xác<br>nhận).|
|**Độ ưu tiên**|Cao.|
|**Các quy tắc**<br>**nghiệp vụ**|Phân công phải đảm bảo cân đối khối lượng công việc<br>giữa các giảng viên trong bộ môn.|
|**Các**<br>**giả**<br>**thuyết**|Không.|


|Số và tên UC|UC-3.3: Thành lập Hội đồng bảo vệ|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Tạo lập các hội đồng chấm đồ án, bao gồm việc chỉ định<br>các thành viên giữ vai trò Chủ tịch, Thư ký, và Ủy<br>viên/Phản biện.|Tạo lập các hội đồng chấm đồ án, bao gồm việc chỉ định<br>các thành viên giữ vai trò Chủ tịch, Thư ký, và Ủy<br>viên/Phản biện.|Tạo lập các hội đồng chấm đồ án, bao gồm việc chỉ định<br>các thành viên giữ vai trò Chủ tịch, Thư ký, và Ủy<br>viên/Phản biện.|
|**Tác**<br>**nhân**<br>**chính**|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**||||
|**Sự kiện kích**<br>**hoạt**|Chuẩn bị cho đợt bảo vệ đồ án cuối kỳ.|Chuẩn bị cho đợt bảo vệ đồ án cuối kỳ.|Chuẩn bị cho đợt bảo vệ đồ án cuối kỳ.|
|**Tiền**<br>**điều**<br>**kiện**|Có danh sách giảng viên sẵn sàng tham gia hội đồng.|Có danh sách giảng viên sẵn sàng tham gia hội đồng.|Có danh sách giảng viên sẵn sàng tham gia hội đồng.|
|**Hậu**<br>**điều**<br>**kiện**|Hội đồng được tạo thành công với mã định danh và danh<br>sách thành viên đầy đủ.|Hội đồng được tạo thành công với mã định danh và danh<br>sách thành viên đầy đủ.|Hội đồng được tạo thành công với mã định danh và danh<br>sách thành viên đầy đủ.|
|**Luồng thông**<br>**thường**|1. Người dùng chọn chức năng "Quản lý Hội đồng" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống yêu cầu nhập: Tên Hội đồng, Địa điểm dự kiến<br>(nếu có).<br> <br> <br>3. Người dùng tìm kiếm và thêm thành viên vào hội đồng.<br> <br> <br>4. Với mỗi thành viên, người dùng gán vai trò: Chủ tịch, Thư<br>ký, Ủy viên.<br> <br> <br>5. Hệ thống kiểm tra tính hợp lệ của cơ cấu hội đồng.<br> <br> <br>6. Người dùng nhấn "Lưu".<br> <br>|1. Người dùng chọn chức năng "Quản lý Hội đồng" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống yêu cầu nhập: Tên Hội đồng, Địa điểm dự kiến<br>(nếu có).<br> <br> <br>3. Người dùng tìm kiếm và thêm thành viên vào hội đồng.<br> <br> <br>4. Với mỗi thành viên, người dùng gán vai trò: Chủ tịch, Thư<br>ký, Ủy viên.<br> <br> <br>5. Hệ thống kiểm tra tính hợp lệ của cơ cấu hội đồng.<br> <br> <br>6. Người dùng nhấn "Lưu".<br> <br>|1. Người dùng chọn chức năng "Quản lý Hội đồng" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống yêu cầu nhập: Tên Hội đồng, Địa điểm dự kiến<br>(nếu có).<br> <br> <br>3. Người dùng tìm kiếm và thêm thành viên vào hội đồng.<br> <br> <br>4. Với mỗi thành viên, người dùng gán vai trò: Chủ tịch, Thư<br>ký, Ủy viên.<br> <br> <br>5. Hệ thống kiểm tra tính hợp lệ của cơ cấu hội đồng.<br> <br> <br>6. Người dùng nhấn "Lưu".<br> <br>|


|Col1|7. Hệ thống lưu thông tin hội đồng vào CSDL.|
|---|---|
|**Luồng thay**<br>**thế**|**A1: Sao chép hội đồng cũ** <br> <br> <br>1. Người dùng chọn "Tạo từ đợt trước".<br> <br> <br>2. Hệ thống sao chép cấu trúc thành viên của kỳ trước<br>để chỉnh sửa nhanh.|
|**Các ngoại lệ**|**E1: Thiếu thành phần bắt buộc** <br> <br> <br>1. Tại bước 6, nếu hội đồng thiếu Chủ tịch hoặc Thư ký.<br> <br> <br>2. Hệ thống báo lỗi "Cấu trúc hội đồng chưa hợp lệ".|
|**Độ ưu tiên**|Trung bình.|
|**Các quy tắc**<br>**nghiệp vụ**|Một hội đồng thường phải có tối thiểu 3 thành viên (hoặc<br>5 tùy quy chế).|
|**Các**<br>**giả**<br>**thuyết**|Không.|




















|Số và tên UC|UC-3.5: Xem thống kê cấp Khoa|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Xem các báo cáo thống kê chi tiết trong phạm vi Khoa/Bộ<br>môn (Tình hình đăng ký đề tài của các bộ môn, tiến độ<br>thực hiện của sinh viên trong khoa).|Xem các báo cáo thống kê chi tiết trong phạm vi Khoa/Bộ<br>môn (Tình hình đăng ký đề tài của các bộ môn, tiến độ<br>thực hiện của sinh viên trong khoa).|Xem các báo cáo thống kê chi tiết trong phạm vi Khoa/Bộ<br>môn (Tình hình đăng ký đề tài của các bộ môn, tiến độ<br>thực hiện của sinh viên trong khoa).|
|**Tác**<br>**nhân**<br>**chính**|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|Trưởng Bộ môn/Khoa.|
|**Tác**<br>**nhân**<br>**phụ (nếu có)**|Không.|Không.|Không.|
|**Sự kiện kích**<br>**hoạt**|Khi cần theo dõi tiến độ hoặc làm báo cáo định kỳ.|Khi cần theo dõi tiến độ hoặc làm báo cáo định kỳ.|Khi cần theo dõi tiến độ hoặc làm báo cáo định kỳ.|


|Tiền điều<br>kiện|Đăng nhập đúng quyền hạn.|
|---|---|
|**Hậu**<br>**điều**<br>**kiện**|Không.|
|**Luồng thông**<br>**thường**|1. Người dùng truy cập Dashboard thống kê.<br> <br> <br>2. Hệ thống hiển thị các chỉ số: Số lượng sinh viên chưa có<br>đề tài, Số lượng đề tài của từng bộ môn, Tỷ lệ nộp báo cáo<br>đúng hạn.<br> <br> <br>3. Người dùng lọc theo "Bộ môn" hoặc "Niên khóa".<br> <br> <br>4. Hệ thống cập nhật biểu đồ hiển thị.<br> <br> <br>5. Thời gian tải trang thống kê không quá 3 giây.|
|**Luồng thay**<br>**thế**|Không.|
|**Các ngoại lệ**|Không.|
|**Độ ưu tiên**|Thấp.|
|**Các quy tắc**<br>**nghiệp vụ**|Trưởng Khoa xem được toàn bộ Bộ môn; Trưởng Bộ<br>môn chỉ xem được số liệu của Bộ môn mình.|
|**Các**<br>**giả**<br>**thuyết**|Không.|














|Số và tên UC|UC-4.1: Đăng ký đề tài mở (Đề xuất đề tài cho SV)|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|


|Tác nhân<br>chính|Giảng viên.|
|---|---|
|**Sự kiện kích**<br>**hoạt**|Khi Phòng Đào tạo mở đợt "Đăng ký đề tài" (UC-2.1).|
|**Tiền**<br>**điều**<br>**kiện**|1. Giảng viên đã đăng nhập hệ thống.<br> <br> <br>2. Đợt đăng ký đang ở trạng thái "Mở" cho Giảng viên.|
|**Hậu**<br>**điều**<br>**kiện**|Đề tài được lưu vào hệ thống ở trạng thái "Chờ duyệt"<br>(bởi Trưởng bộ môn).|
|**Luồng thông**<br>**thường**|1. Giảng viên chọn chức năng "Quản lý đề tài" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống hiển thị form nhập: Tên đề tài, Mô tả chi tiết,<br>Yêu cầu kiến thức/kỹ năng, Số lượng sinh viên tối đa.<br> <br> <br>3. Giảng viên nhập đầy đủ thông tin.<br> <br> <br>4. Giảng viên nhấn "Lưu đề xuất".<br> <br> <br>5. Hệ thống kiểm tra tính hợp lệ (không bỏ trống trường bắt<br>buộc).<br> <br> <br>6. Hệ thống lưu đề tài và đặt trạng thái là "Chờ duyệt".<br> <br> <br>7. Hệ thống thông báo "Đăng ký thành công, vui lòng chờ<br>duyệt".|
|**Luồng thay**<br>**thế**|**A1: Hủy bỏ** <br> <br> <br>Giảng viên nhấn "Hủy" -> Hệ thống không lưu dữ liệu.|
|**Các ngoại lệ**|**E1: Hết hạn đăng ký** <br> <br>|


|Col1|Hệ thống thông báo "Đợt đăng ký đã kết thúc" và khóa<br>chức năng thêm mới.|
|---|---|
|**Độ ưu tiên**|Cao.|
|**Quy**<br>**tắc**<br>**nghiệp vụ**|Đề tài sau khi được Trưởng bộ môn duyệt (UC-3.1) mới<br>hiển thị cho sinh viên thấy.|




















|Số và tên UC|UC-4.1: Đăng ký đề tài mở (Đề xuất đề tài cho SV)|Col3|Col4|
|---|---|---|---|
|**Người**<br>**tạo**<br>**UC**|Admin|**Người**<br>**tạo**<br>**UC**|Admin|
|**Mô tả**|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|Cho phép Giảng viên tạo mới các đề tài nghiên cứu (kèm<br>mô tả và yêu cầu kiến thức) để sinh viên có thể tham<br>khảo và đăng ký thực hiện.|
|**Tác**<br>**nhân**<br>**chính**|Giảng viên.|Giảng viên.|Giảng viên.|
|**Sự kiện kích**<br>**hoạt**|Khi Phòng Đào tạo mở đợt "Đăng ký đề tài" (UC-2.1).|Khi Phòng Đào tạo mở đợt "Đăng ký đề tài" (UC-2.1).|Khi Phòng Đào tạo mở đợt "Đăng ký đề tài" (UC-2.1).|
|**Tiền**<br>**điều**<br>**kiện**|1. Giảng viên đã đăng nhập hệ thống.<br> <br> <br>2. Đợt đăng ký đang ở trạng thái "Mở" cho Giảng viên.|1. Giảng viên đã đăng nhập hệ thống.<br> <br> <br>2. Đợt đăng ký đang ở trạng thái "Mở" cho Giảng viên.|1. Giảng viên đã đăng nhập hệ thống.<br> <br> <br>2. Đợt đăng ký đang ở trạng thái "Mở" cho Giảng viên.|
|**Hậu**<br>**điều**<br>**kiện**|Đề tài được lưu vào hệ thống ở trạng thái "Chờ duyệt"<br>(bởi Trưởng bộ môn).|Đề tài được lưu vào hệ thống ở trạng thái "Chờ duyệt"<br>(bởi Trưởng bộ môn).|Đề tài được lưu vào hệ thống ở trạng thái "Chờ duyệt"<br>(bởi Trưởng bộ môn).|
|**Luồng thông**<br>**thường**|1. Giảng viên chọn chức năng "Quản lý đề tài" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống hiển thị form nhập: Tên đề tài, Mô tả chi tiết,<br>Yêu cầu kiến thức/kỹ năng, Số lượng sinh viên tối đa.<br> <br> <br>3. Giảng viên nhập đầy đủ thông tin.<br> <br> <br>4. Giảng viên nhấn "Lưu đề xuất".<br> <br>|1. Giảng viên chọn chức năng "Quản lý đề tài" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống hiển thị form nhập: Tên đề tài, Mô tả chi tiết,<br>Yêu cầu kiến thức/kỹ năng, Số lượng sinh viên tối đa.<br> <br> <br>3. Giảng viên nhập đầy đủ thông tin.<br> <br> <br>4. Giảng viên nhấn "Lưu đề xuất".<br> <br>|1. Giảng viên chọn chức năng "Quản lý đề tài" -> "Thêm<br>mới".<br> <br> <br>2. Hệ thống hiển thị form nhập: Tên đề tài, Mô tả chi tiết,<br>Yêu cầu kiến thức/kỹ năng, Số lượng sinh viên tối đa.<br> <br> <br>3. Giảng viên nhập đầy đủ thông tin.<br> <br> <br>4. Giảng viên nhấn "Lưu đề xuất".<br> <br>|


|Col1|5. Hệ thống kiểm tra tính hợp lệ (không bỏ trống trường bắt<br>buộc).<br>6. Hệ thống lưu đề tài và đặt trạng thái là "Chờ duyệt".<br>7. Hệ thống thông báo "Đăng ký thành công, vui lòng chờ<br>duyệt".|
|---|---|
|**Luồng thay**<br>**thế**|**A1: Hủy bỏ** <br> <br> <br>Giảng viên nhấn "Hủy" -> Hệ thống không lưu dữ liệu.|
|**Các ngoại lệ**|**E1: Hết hạn đăng ký** <br> <br> <br>Hệ thống thông báo "Đợt đăng ký đã kết thúc" và khóa<br>chức năng thêm mới.|
|**Độ ưu tiên**|Cao.|
|**Quy**<br>**tắc**<br>**nghiệp vụ**|Đề tài sau khi được Trưởng bộ môn duyệt (UC-3.1) mới<br>hiển thị cho sinh viên thấy.|


### _Giao diện minh họa: Xây dựng giao diện minh họa theo luồng sự kiện đã mô tả_ _trong phần trên. Lưu ý trong giao diện minh họa có dữ liệu minh họa. Nên sử dụng_ _các công cụ tạo giao diện mock-up như https://balsamiq.com/wireframes/ hoặc_ _https://www.figma.com/_ **Tên Use-case 1 (Ví dụ UC1.2. Thêm mới thành viên)** …


### **2. PHÂN TÍCH TRƯỜNG HỢP SỬ DỤNG (USE-CASE ANALYSIS)** **2.1 Phân tích kiến trúc hệ thống** **Kiến trúc mức cao của hệ thống** **Các đối tượng trừu tượng hóa chính của hệ thống (Key abstractions)** Xây dựng mô hình cấu trúc của hệ thống (xem bài 5 mô hình hóa cấu trúc) **2.2 Thực thi trường hợp sử dụng (Use-case relizations)** **Các biểu đồ tuần tự (Sequence diagrams)** **Góc nhìn của các lớp trong hệ thống (Views of participating classes)**


### **3. THIẾT KẾ (USE-CASE DESGIN)** **3.1 Xác định các thành phần thiết kế (Identify design elements)** **Xác định các lớp (Identify classes)** **Xác định các hệ thống con và giao diện (Identify subsystems and** **interfaces)** **Xác định các gói (Identify packages)** **3.2 Thiết kế trường hợp sử dụng (Use-case design)** **Thiết kế các biểu đồ tuần tự (Design sequence diagrams)** **Thiết kế biểu đồ lớp (Class diagrams)** **3.3 Thiết kế cơ sở dữ liệu (Database design)** **Lược đồ cơ sở dữ liệu** **Chi tiết các bảng**


### **4. CÀI ĐẶT (IMPLEMENTATION)** **4.1 Lựa chọn công nghệ** **4.2 Cấu trúc mã nguồn**


### **5. KẾT LUẬN**


### **TÀI LIỆU THAM KHẢO** [1] Khoa HTTT, Slide bài giảng môn học Phân tích thiết kế phần mềm, 2024.


# **PHỤ LỤC (nếu có)**


