package com.phenikaa.thesis.audit.service;

import com.phenikaa.thesis.audit.dto.AuditLogResponse;
import com.phenikaa.thesis.audit.entity.AuditLog;
import com.phenikaa.thesis.audit.mapper.AuditLogMapper;
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

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepo;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepo;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional
    public void log(String action, String entityType, UUID entityId,
                    Map<String, Object> oldValue, Map<String, Object> newValue) {
        User creator = currentUserService.getCurrentUser();
        auditLogRepo.save(AuditLog.builder()
                .user(userRepo.getReferenceById(creator.getId()))
                .action(action).entityType(entityType).entityId(entityId)
                .oldValue(oldValue).newValue(newValue)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getMyHistory() {
        UUID userId = currentUserService.getCurrentUser().getId();
        return auditLogRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::enrichResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getGlobalHistory() {
        return auditLogRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::enrichResponse).toList();
    }

    private AuditLogResponse enrichResponse(AuditLog log) {
        AuditLogResponse base = auditLogMapper.toResponse(log);
        return new AuditLogResponse(
                base.id(), base.userId(), resolveUserName(log.getUser()),
                base.action(), base.entityType(), base.entityId(),
                generateMessage(log), base.oldValue(), base.newValue(),
                base.ipAddress(), base.createdAt());
    }

    private String resolveUserName(User u) {
        if (u == null) return "Hệ thống";
        String name = ((u.getLastName() != null ? u.getLastName() : "") + " "
                + (u.getFirstName() != null ? u.getFirstName() : "")).trim();
        return name.isEmpty() ? u.getUsername() : name;
    }

    private String generateMessage(AuditLog log) {
        Map<String, Object> data = log.getNewValue() != null ? log.getNewValue() : log.getOldValue();
        if (data == null) return "Thao tác trên " + log.getEntityType();

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
                int count = ids instanceof java.util.Collection<?> c ? c.size() : 0;
                yield "Đã gán " + count + " sinh viên vào đợt đồ án";
            }
            case "UNASSIGN_STUDENT" -> "Đã gỡ sinh viên khỏi đợt đồ án (Hồ sơ ID: " + log.getEntityId() + ")";
            case "CREATE_TOPIC" -> "Đã thêm đề tài mới: " + displayName;
            case "UPDATE_TOPIC" -> "Đã cập nhật đề tài: " + displayName;
            case "DELETE_TOPIC" -> "Đã xóa đề tài: " + displayName;
            case "REGISTER_TOPIC" -> "Đã đăng ký đề tài (FCFS): " + displayName;
            case "PROPOSE_TOPIC" -> "Đã đề xuất đề tài mới: " + displayName;
            case "APPROVE_REGISTRATION" -> "Đã duyệt đăng ký đề tài: " + displayName + " cho SV: " + data.get("studentCode");
            case "REJECT_REGISTRATION" -> "Đã từ chối đăng ký đề tài: " + displayName + " của SV: " + data.get("studentCode");

            case "SUBMIT_OUTLINE" -> "Đã nộp đề cương: " + data.get("fileName") + " (Phiên bản " + data.get("version") + ")";
            case "REVIEW_OUTLINE" -> {
                String status = String.valueOf(data.get("status"));
                String res = "APPROVED".equals(status) ? "Đã duyệt" : "Đã từ chối";
                yield res + " đề cương của SV: " + data.get("studentName") + " (" + data.get("studentCode") + ")";
            }
            case "SUBMIT_PROGRESS" -> "Đã cập nhật tiến độ tuần " + data.get("weekNumber") + ": " + data.get("title");
            case "REVIEW_PROGRESS" -> {
                String status = String.valueOf(data.get("status"));
                String res = "REVIEWED".equals(status) ? "Đã nhận xét (Đạt)" : "Đã yêu cầu bổ sung";
                yield res + " tiến độ tuần " + data.get("weekNumber") + " của SV: " + data.get("studentName") + " (" + data.get("studentCode") + ")";
            }

            case "REGISTER_DEFENSE" -> "Đã đăng ký bảo vệ (báo cáo: " + data.get("reportName") + ", code: " + data.get("sourceCodeName") + ", slide: " + data.get("slideName") + ")";
            case "REVIEW_DEFENSE" -> {
                String status = String.valueOf(data.get("status"));
                String res = "APPROVED".equals(status) ? "Đã duyệt" : "Đã từ chối";
                yield res + " đăng ký bảo vệ của SV: " + data.get("studentName") + " (" + data.get("studentCode") + ")";
            }

            default -> "Thao tác " + log.getAction() + " trên " + log.getEntityType() + " (ID: " + log.getEntityId() + ")";
        };
    }
}
