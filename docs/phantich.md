Tôi đã đọc tài liệu **SRS – Phát triển phần mềm quản lý đồ án tốt nghiệp** của bạn. Dưới đây là **phân tích dự án theo góc nhìn Software Analysis (SRS review)** để bạn dễ dùng cho báo cáo / thuyết trình.

---

# 1️⃣ Tổng quan dự án

### Tên hệ thống

**Phần mềm quản lý đồ án tốt nghiệp**

### Vấn đề hiện tại

Theo tài liệu:

* quản lý bằng **Excel + email + giấy tờ**
* thông tin **phân tán**
* khó theo dõi **hàng trăm đồ án**
* mất thời gian hành chính
* khó **tra cứu đồ án cũ**

➡️ Đây là **pain point của hầu hết các trường đại học**. 

---

# 2️⃣ Mục tiêu hệ thống (Business Objectives)

Hệ thống đặt ra **4 mục tiêu định lượng**:

| ID  | Mục tiêu                                                 | Ý nghĩa            |
| --- | -------------------------------------------------------- | ------------------ |
| BO1 | giảm thời gian phê duyệt đề tài từ **20 ngày → <6 ngày** | tăng tốc quy trình |
| BO2 | giảm lỗi hồ sơ từ **15% → <2%**                          | chuẩn hóa dữ liệu  |
| BO3 | giảm **80% chi phí giấy tờ**                             | số hóa quy trình   |
| BO4 | tăng hài lòng người dùng **90%**                         | UX tốt hơn         |

➡️ Điểm tốt: mục tiêu được viết theo **Planguage (Goal engineering)**. 

---

# 3️⃣ Stakeholders (Các bên liên quan)

Hệ thống có **5 actor chính**:

| Actor                | Vai trò                     |
| -------------------- | --------------------------- |
| Sinh viên            | đăng ký đề tài, nộp báo cáo |
| Giảng viên           | hướng dẫn, đánh giá         |
| Hội đồng             | phản biện và chấm           |
| Trưởng ngành / Khoa | phê duyệt đề tài            |
| Phòng đào tạo        | quản lý toàn bộ             |

➡️ Đây là **RBAC multi-role system**. 

---

# 4️⃣ Các module chức năng chính

Hệ thống chia thành **5 phân hệ lớn**.

## 1️⃣ Quản lý người dùng & đề tài

Chức năng:

* quản lý user
* tạo đề tài
* phê duyệt đề tài
* đăng ký đề tài

---

## 2️⃣ Quản lý tiến độ đồ án

Sinh viên:

* nộp báo cáo milestone
* cập nhật tiến độ

Giảng viên:

* review
* comment

---

## 3️⃣ Quản lý hội đồng bảo vệ

Chức năng:

* tạo hội đồng
* phân công phản biện
* lập lịch bảo vệ

---

## 4️⃣ Chấm điểm đồ án

* nhập điểm hướng dẫn
* nhập điểm phản biện
* tính điểm tổng

---

## 5️⃣ Lưu trữ và thống kê

* lưu trữ thesis
* export báo cáo
* thống kê theo khoa / GV

➡️ Đây là **architecture chuẩn của thesis management system**. 

---

# 5️⃣ Business Process

## Quy trình 1: Đăng ký đề tài

Flow:

```
Phòng đào tạo mở đợt đăng ký
        ↓
Giảng viên đề xuất đề tài
        ↓
Khoa phê duyệt
        ↓
Sinh viên đăng ký
        ↓
Giảng viên chọn sinh viên
        ↓
Khoa chốt danh sách
        ↓
Thông báo kết quả
```

➡️ Đây là **workflow approval system**. 

---

## Quy trình 2: Bảo vệ đồ án

Flow:

```
Sinh viên nộp báo cáo
        ↓
GV hướng dẫn chấm
        ↓
Thành lập hội đồng
        ↓
Xếp lịch bảo vệ
        ↓
Sinh viên bảo vệ
        ↓
Hội đồng chấm điểm
        ↓
Công bố kết quả
```

➡️ Đây là **academic defense workflow**. 

---

# 6️⃣ Non-Functional Requirements

### Performance

* 200 user concurrent
* page load < 3s
* query < 2s
* upload file ≤ 50MB

---

### Security

* login username/password
* password hashing
* RBAC
* audit log

---

### Reliability

* uptime ≥ 99.5%
* backup daily
* disaster recovery

---

### Usability

* UI đơn giản
* tiếng Việt
* responsive

➡️ Đây là **chuẩn NFR của web enterprise nhỏ**. 

---

# 7️⃣ Technical Constraints

Các ràng buộc:

* Web application
* RDBMS (MySQL / PostgreSQL / SQL Server)
* UTF-8 encoding

➡️ Kiến trúc hướng **modular system**. 

---

# 8️⃣ Những gì hệ thống KHÔNG làm (Scope Limit)

Không có:

* kiểm tra đạo văn
* kết nối hệ thống sinh viên
* chat realtime
* quản lý tài chính

➡️ Scope được **giới hạn hợp lý cho đồ án**. 

---

# 9️⃣ Kiến trúc hệ thống (đề xuất)

SRS chưa nói rõ nhưng có thể suy ra:

```
Client (Web UI)
        ↓
API Server
        ↓
Business Logic
        ↓
Database
        ↓
File Storage
```

Modules:

```
Auth
User
Topic
Progress
Defense
Evaluation
Notification
Report
```

---

# 🔟 Những điểm mạnh của tài liệu

### 👍 1. Business goal rõ ràng

Có **Past / Goal / Stretch**

→ rất chuẩn SRS.

---

### 👍 2. Phân tích stakeholder đầy đủ

Có đủ actor:

* student
* supervisor
* council
* department
* training office

---

### 👍 3. NFR chi tiết

Có:

* performance
* security
* reliability
* usability

---

# ⚠️ Điểm còn thiếu (nếu muốn làm tốt hơn)

### 1️⃣ Thiếu System Architecture Diagram

Nên thêm:

```
C4 Model
```

---

### 2️⃣ Thiếu ERD Database

Nên có bảng:

```
User
Student
Lecturer
Topic
Registration
Thesis
Defense
Score
Committee
```

---

### 3️⃣ Thiếu State Machine

Ví dụ:

```
Topic status

draft
→ pending
→ approved
→ rejected
```

---

# 📊 Đánh giá tổng thể

| Tiêu chí          | Đánh giá |
| ----------------- | -------- |
| Business analysis | ⭐⭐⭐⭐     |
| Functional scope  | ⭐⭐⭐⭐     |
| NFR               | ⭐⭐⭐⭐     |
| Architecture      | ⭐⭐⭐      |
| Technical depth   | ⭐⭐⭐      |

➡️ **SRS này đạt khoảng 7.5 / 10** (mức đồ án đại học khá tốt).

---

💡 Nếu bạn muốn, tôi có thể tiếp tục phân tích sâu hơn:

* **ERD chuẩn cho hệ thống này** (10 bảng chuẩn đồ án CNTT)
* **Use Case Diagram chuẩn**
* **Architecture chuẩn (DDD / Clean Architecture)**
* **Flow UI của toàn bộ hệ thống**

Cái này cực hữu ích nếu bạn **bảo vệ đồ án**.
