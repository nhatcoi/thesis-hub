# Lưu trữ lỗi (học tập)

Ghi lại các lỗi gặp phải, giải thích ngắn gọn và cách xử lý.

---

## 1. LazyInitializationException — `GET /api/lecturers`

### Lỗi

```
org.hibernate.LazyInitializationException: Could not initialize proxy [User#...] - no session
    at LecturerController.getLecturers(LecturerController.java:47)
```

API trả về 500, message: "Lỗi hệ thống. Vui lòng thử lại sau."

### Giải thích

`Lecturer.getUser()` là lazy proxy. Controller gọi `lecturer.getUser().getFirstName()` ngoài transaction → Hibernate session đã đóng → không lazy load được `User` → LazyInitializationException.

### Fix

Thêm `@Transactional(readOnly = true)` vào `getLecturers()` (hoặc service layer). Spring giữ session mở trong suốt method → lazy load `User` thành công.
