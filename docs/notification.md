# Tổng quan Notification

| # | Loại (NotificationType) | Khi nào | Người nhận | Nội dung |
|---|-------------------------|---------|------------|----------|
| 1 | `BATCH_OPENED` | PĐT mở đợt đồ án | SV, GV, TN trong đợt | Đợt ĐATN [tên] đã mở đăng ký |
| 2 | `TOPIC_REGISTERED` | SV đăng ký đề tài (FCFS) | GV tạo đề tài | SV [tên] đã đăng ký đề tài [tên] |
| 3 | `TOPIC_PROPOSED` | SV đề xuất đề tài mới | GVHD mong muốn + TN (theo ngành) | SV [tên] đã đề xuất đề tài [tên] |
| 4 | `TOPIC_APPROVED` | TN duyệt đề xuất | SV đề xuất | Đề tài [tên] đã được phê duyệt |
| 5 | `TOPIC_REJECTED` | TN từ chối đề xuất | SV đề xuất | Đề tài [tên] bị từ chối. Lý do: ... |
| 6 | `ADVISOR_ASSIGNED` | TN duyệt & phân công GV | GVHD được phân công | Bạn được phân công hướng dẫn SV [tên] cho đề tài [tên] |

---

## API gửi thông báo

```java
void sendNotification(
    User recipient,
    NotificationType type,
    String title,
    String message,
    String refType,   // "ThesisBatch", "TOPIC", "Thesis", ...
    UUID refId
);
```

---

## Chi tiết

### 1. BATCH_OPENED
- **Khi nào:** PĐT kích hoạt đợt đồ án (DRAFT → ACTIVE).
- **Người nhận:** SV, GV, TN trong đợt (SV đã được gán vào đợt).
- **Nội dung:** "Đợt ĐATN [tên] đã mở đăng ký"

### 2. TOPIC_REGISTERED
- **Khi nào:** SV đăng ký đề tài có sẵn (FCFS), gán ngay.
- **Người nhận:** GV tạo đề tài (`topic.getProposedBy()`).
- **Nội dung:** "SV [tên] đã đăng ký đề tài [tên]"

### 3. TOPIC_PROPOSED
- **Khi nào:** SV gửi đề xuất đề tài mới.
- **Người nhận:** GVHD mong muốn (nếu SV chọn) + TN theo ngành đề tài.
- **Nội dung:** "SV [tên] đã đề xuất đề tài [tên]"

### 4. TOPIC_APPROVED
- **Khi nào:** TN (hoặc GV) duyệt đề xuất đề tài của SV.
- **Người nhận:** SV đề xuất.
- **Nội dung:** "Đề tài [tên] đã được phê duyệt"

### 5. TOPIC_REJECTED
- **Khi nào:** TN (hoặc GV) từ chối đề xuất đề tài của SV.
- **Người nhận:** SV đề xuất.
- **Nội dung:** "Đề tài [tên] bị từ chối. Lý do: ..."

### 6. ADVISOR_ASSIGNED
- **Khi nào:** TN duyệt đề xuất & phân công GVHD (có thể khác GV SV chọn).
- **Người nhận:** GVHD được phân công.
- **Nội dung:** "Bạn được phân công hướng dẫn SV [tên] cho đề tài [tên]"
