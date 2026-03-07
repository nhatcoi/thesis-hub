package com.phenikaa.thesis.audit.service;

import com.phenikaa.thesis.audit.dto.AuditLogResponse;
import com.phenikaa.thesis.audit.entity.AuditLog;
import com.phenikaa.thesis.audit.repository.AuditLogRepository;
import com.phenikaa.thesis.auth.service.CurrentUserService;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepo;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepo;

    @Transactional
    public void log(String action, String entityType, UUID entityId, Map<String, Object> oldValue,
            Map<String, Object> newValue) {
        User creator = currentUserService.getCurrentUser();
        User userRef = userRepo.getReferenceById(creator.getId());

        AuditLog log = AuditLog.builder()
                .user(userRef)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepo.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getMyHistory() {
        UUID userId = currentUserService.getCurrentUser().getId();
        return auditLogRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getGlobalHistory() {
        return auditLogRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        User u = log.getUser();
        String fullUserName = "Hệ thống";
        if (u != null) {
            fullUserName = (u.getLastName() != null ? u.getLastName() : "")
                    + " " + (u.getFirstName() != null ? u.getFirstName() : "");
            if (fullUserName.trim().isEmpty()) {
                fullUserName = u.getUsername();
            }
        }

        return new AuditLogResponse(
                log.getId(),
                u != null ? u.getId() : null,
                fullUserName,
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                generateMessage(log),
                log.getOldValue(),
                log.getNewValue(),
                log.getIpAddress(),
                log.getCreatedAt());
    }

    private String generateMessage(AuditLog log) {
        Map<String, Object> data = log.getNewValue() != null ? log.getNewValue() : log.getOldValue();
        if (data == null)
            return "Thao tác trên " + log.getEntityType();

        String name = String.valueOf(data.getOrDefault("name", ""));
        String title = String.valueOf(data.getOrDefault("title", ""));
        String username = String.valueOf(data.getOrDefault("username", ""));

        String displayName = !name.isEmpty() ? name : title;

        return switch (log.getAction()) {
            case "CREATE_BATCH" -> "Đã tạo đợt đồ án mới: " + name;
            case "UPDATE_BATCH" -> "Đã cập nhật thông tin đợt đồ án: " + name;
            case "ACTIVATE_BATCH" -> "Đã kích hoạt đợt đồ án: " + name;
            case "CLOSE_BATCH" -> "Đã đóng đợt đồ án: " + name;
            case "DELETE_BATCH" -> "Đã xóa đợt đồ án: " + name;
            case "CREATE_USER" -> "Đã thêm người dùng mới: " + (username.isEmpty() ? name : username);
            case "IMPORT_STUDENTS" -> String.format("Đã nhập sinh viên từ file '%s' (Thành công: %s, Thất bại: %s)",
                    data.get("fileName"), data.get("success"), data.get("failure"));
            case "IMPORT_LECTURERS" -> String.format("Đã nhập giảng viên từ file '%s' (Thành công: %s, Thất bại: %s)",
                    data.get("fileName"), data.get("success"), data.get("failure"));
            case "CREATE_ACADEMIC_YEAR" -> "Đã thêm niên khóa mới: " + name;
            case "UPDATE_ACADEMIC_YEAR" -> "Đã cập nhật niên khóa: " + name;
            case "DELETE_ACADEMIC_YEAR" -> "Đã xóa niên khóa: " + name;
            case "ASSIGN_STUDENT" -> {
                Object ids = data.get("studentIds");
                int count = ids instanceof java.util.Collection ? ((java.util.Collection<?>) ids).size() : 0;
                yield "Đã gán " + count + " sinh viên vào đợt đồ án";
            }
            case "UNASSIGN_STUDENT" -> "Đã gỡ sinh viên khỏi đợt đồ án (Hồ sơ ID: " + log.getEntityId() + ")";
            case "CREATE_TOPIC" -> "Đã thêm đề tài mới: " + displayName;
            case "UPDATE_TOPIC" -> "Đã cập nhật đề tài: " + displayName;
            case "DELETE_TOPIC" -> "Đã xóa đề tài: " + displayName;
            case "REGISTER_TOPIC" -> "Đã đăng ký đề tài (FCFS): " + displayName;
            case "PROPOSE_TOPIC" -> "Đã đề xuất đề tài mới: " + displayName;
            case "APPROVE_REGISTRATION" -> "Đã duyệt đăng ký đề tài: " + displayName + " cho sinh viên: " + data.get("studentCode");
            case "REJECT_REGISTRATION" -> "Đã từ chối đăng ký đề tài: " + displayName + " của sinh viên: " + data.get("studentCode");
            default ->
                "Thao tác " + log.getAction() + " trên " + log.getEntityType() + " (ID: " + log.getEntityId() + ")";
        };
    }
}
