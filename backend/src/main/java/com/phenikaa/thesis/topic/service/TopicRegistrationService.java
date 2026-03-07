package com.phenikaa.thesis.topic.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.topic.dto.RegistrationApprovalRequest;
import com.phenikaa.thesis.topic.dto.StudentTopicProposalRequest;
import com.phenikaa.thesis.topic.dto.TopicRegistrationResponse;
import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.TopicRegistration;
import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.repository.TopicRegistrationRepository;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import com.phenikaa.thesis.notification.service.NotificationService;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import com.phenikaa.thesis.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicRegistrationService {

    private final TopicRegistrationRepository registrationRepo;
    private final TopicRepository topicRepo;
    private final ThesisBatchRepository batchRepo;
    private final com.phenikaa.thesis.thesis.repository.ThesisRepository thesisRepo;
    private final LecturerRepository lecturerRepo;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    // ────────────────────────────────────────────────────────────────
    // READ
    // ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getMyRegistrations(User user) {
        return registrationRepo.findByLecturerId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getMajorRegistrations(String majorCode) {
        if (majorCode == null || majorCode.isBlank()) {
            return new java.util.ArrayList<>();
        }
        return registrationRepo.findByMajorCode(majorCode)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getStudentRegistrations(User user) {
        if (user.getStudent() == null) {
            return new java.util.ArrayList<>();
        }
        return registrationRepo.findByStudentId(user.getStudent().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ────────────────────────────────────────────────────────────────
    // REGISTER  (Student → Đăng ký đề tài)
    // ────────────────────────────────────────────────────────────────

    @Transactional
    public TopicRegistrationResponse registerTopic(User user, UUID topicId) {

        // ── 1. Phải là sinh viên ──
        if (user.getStudent() == null) {
            throw new BusinessException("Bạn không phải sinh viên, không thể đăng ký đề tài.");
        }
        Student student = user.getStudent();

        // ── 2. Sinh viên phải đủ điều kiện làm đồ án ──
        if (student.getEligibleForThesis() != null && !student.getEligibleForThesis()) {
            throw new BusinessException("Bạn chưa đủ điều kiện làm đồ án (chưa đủ tín chỉ hoặc GPA). Vui lòng liên hệ Phòng Đào tạo.");
        }

        // ── 3. Đề tài phải tồn tại — dùng pessimistic lock để tránh race condition ──
        Topic topic = topicRepo.findByIdWithLock(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        ThesisBatch batch = topic.getBatch();

        // ── 4. Batch phải đang ACTIVE ──
        if (batch.getStatus() != BatchStatus.ACTIVE) {
            throw new BusinessException("Đợt đồ án \"" + batch.getName() + "\" hiện không hoạt động. Không thể đăng ký.");
        }

        // ── 5. Phải trong thời hạn đăng ký đề tài (topicRegStart ≤ hôm nay ≤ topicRegEnd) ──
        LocalDate today = LocalDate.now();
        if (today.isBefore(batch.getTopicRegStart())) {
            throw new BusinessException("Chưa đến thời hạn đăng ký đề tài. Đăng ký mở từ ngày " + batch.getTopicRegStart() + ".");
        }
        if (today.isAfter(batch.getTopicRegEnd())) {
            throw new BusinessException("Đã hết thời hạn đăng ký đề tài. Hạn chót là ngày " + batch.getTopicRegEnd() + ".");
        }

        // ── 6. Đề tài phải ở trạng thái cho phép đăng ký (AVAILABLE / APPROVED) ──
        if (topic.getStatus() != TopicStatus.AVAILABLE && topic.getStatus() != TopicStatus.APPROVED) {
            String reason;
            switch (topic.getStatus()) {
                case FULL:    reason = "Đề tài đã đủ số lượng sinh viên."; break;
                case CLOSED:  reason = "Đề tài đã đóng, không nhận đăng ký."; break;
                case REJECTED: reason = "Đề tài đã bị từ chối, không thể đăng ký."; break;
                case PENDING_APPROVAL: reason = "Đề tài đang chờ duyệt, chưa thể đăng ký."; break;
                default:      reason = "Đề tài không ở trạng thái cho phép đăng ký.";
            }
            throw new BusinessException(reason);
        }

        // ── 7. Đề tài còn slot? (FCFS — first-come-first-served) ──
        if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
            throw new BusinessException("Đề tài đã đủ " + topic.getMaxStudents() + " sinh viên, không còn chỗ trống.");
        }

        // ── 8. Ngành của SV phải phù hợp với đề tài (nếu đề tài giới hạn ngành) ──
        if (topic.getMajorCode() != null && !topic.getMajorCode().isBlank()) {
            if (!topic.getMajorCode().equals(student.getMajorCode())) {
                throw new BusinessException("Đề tài này chỉ dành cho ngành " + topic.getMajorCode()
                        + ". Ngành của bạn (" + student.getMajorCode() + ") không phù hợp.");
            }
        }

        // ── 9. SV phải có bản ghi Thesis trong đợt này ──
        Thesis thesis = thesisRepo.findByStudentIdAndBatchId(student.getId(), batch.getId()).orElse(null);
        if (thesis == null) {
            throw new BusinessException("Bạn chưa được gán vào đợt đồ án \"" + batch.getName() + "\". Vui lòng liên hệ Phòng Đào tạo.");
        }

        // ── 10. Thesis chưa có đề tài — SV chưa được gán đề tài nào ──
        if (thesis.getTopic() != null) {
            throw new BusinessException("Bạn đã có đề tài \"" + thesis.getTopic().getTitle() + "\" trong đợt này. "
                    + "Không thể đăng ký thêm đề tài khác.");
        }

        // ── 11. Thesis status phải phù hợp (ELIGIBLE_FOR_THESIS hoặc TOPIC_REJECTED) ──
        if (thesis.getStatus() != ThesisStatus.ELIGIBLE_FOR_THESIS
                && thesis.getStatus() != ThesisStatus.TOPIC_REJECTED) {
            throw new BusinessException("Trạng thái đồ án của bạn hiện không cho phép đăng ký đề tài. "
                    + "Trạng thái hiện tại: " + thesis.getStatus() + ".");
        }

        // ── 12. SV chưa có registration APPROVED trong cùng BATCH ──
        if (registrationRepo.existsByStudentIdAndStatusAndBatchId(
                student.getId(), RegistrationStatus.APPROVED, batch.getId())) {
            throw new BusinessException("Bạn đã có đăng ký được xác nhận trong đợt này. Không thể đăng ký thêm.");
        }

        // ════════════════════════════════════════════════════════════════
        // FCFS — GÁN NGAY, KHÔNG CHỜ DUYỆT
        // ════════════════════════════════════════════════════════════════

        // ── Tạo registration với status = APPROVED (gán tức thì) ──
        TopicRegistration reg = TopicRegistration.builder()
                .thesis(thesis)
                .topic(topic)
                .student(student)
                .status(RegistrationStatus.APPROVED)
                .reviewedAt(OffsetDateTime.now())
                .build();
        reg = registrationRepo.save(reg);

        // ── Cập nhật Topic: tăng slot, đánh FULL nếu hết chỗ ──
        topic.setCurrentStudents(topic.getCurrentStudents() + 1);
        if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
            topic.setStatus(TopicStatus.FULL);
        }
        topicRepo.save(topic);

        // ── Cập nhật Thesis: gán topic + advisor + chuyển trạng thái ──
        thesis.setTopic(topic);
        thesis.setAdvisor(topic.getProposedBy().getLecturer());
        thesis.setStatus(ThesisStatus.TOPIC_ASSIGNED);
        thesisRepo.save(thesis);

        // ── Auto-reject các PENDING registrations KHÁC của SV trong cùng BATCH ──
        List<TopicRegistration> otherPending = registrationRepo
                .findByStudentIdAndStatus(student.getId(), RegistrationStatus.PENDING);
        for (TopicRegistration other : otherPending) {
            if (other.getTopic().getBatch().getId().equals(batch.getId())) {
                other.setStatus(RegistrationStatus.REJECTED);
                other.setRejectReason("Tự động hủy: bạn đã được gán đề tài \"" + topic.getTitle() + "\".");
                other.setReviewedAt(OffsetDateTime.now());
                registrationRepo.save(other);
            }
        }

        // ── Gửi notification cho Giảng viên hướng dẫn ──
        User lecturerUser = topic.getProposedBy();
        if (lecturerUser != null) {
            String studentFullName = (user.getLastName() != null ? user.getLastName() : "") + " "
                    + (user.getFirstName() != null ? user.getFirstName() : "");
            notificationService.sendNotification(
                    lecturerUser,
                    NotificationType.TOPIC_REGISTERED,
                    "Sinh viên đăng ký đề tài",
                    "Sinh viên " + studentFullName.trim()
                            + " (" + student.getStudentCode() + ") đã đăng ký đề tài \""
                            + topic.getTitle() + "\". Đề tài hiện có "
                            + topic.getCurrentStudents() + "/" + topic.getMaxStudents() + " sinh viên.",
                    "TOPIC",
                    topic.getId()
            );
        }

        // ── Log history ──
        java.util.Map<String, Object> logData = new java.util.HashMap<>();
        logData.put("title", topic.getTitle());
        logData.put("batchName", batch.getName());
        auditLogService.log("REGISTER_TOPIC", "TOPIC", topic.getId(), null, logData);

        return mapToResponse(reg);
    }

    // ────────────────────────────────────────────────────────────────
    // PROPOSE  (Student → Đề xuất đề tài mới)
    // ────────────────────────────────────────────────────────────────

    @Transactional
    public TopicRegistrationResponse proposeTopicByStudent(User user, StudentTopicProposalRequest req) {

        // ── 1. Phải là sinh viên ──
        if (user.getStudent() == null) {
            throw new BusinessException("Bạn không phải sinh viên, không thể đề xuất đề tài.");
        }
        Student student = user.getStudent();

        // ── 2. Sinh viên phải đủ điều kiện làm đồ án ──
        if (student.getEligibleForThesis() != null && !student.getEligibleForThesis()) {
            throw new BusinessException("Bạn chưa đủ điều kiện làm đồ án. Vui lòng liên hệ Phòng Đào tạo.");
        }

        // ── 3. Batch phải tồn tại + ACTIVE ──
        ThesisBatch batch = batchRepo.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", req.getBatchId()));

        if (batch.getStatus() != BatchStatus.ACTIVE) {
            throw new BusinessException("Đợt đồ án \"" + batch.getName() + "\" hiện không hoạt động.");
        }

        // ── 4. Trong thời hạn đăng ký đề tài ──
        LocalDate today = LocalDate.now();
        if (today.isBefore(batch.getTopicRegStart())) {
            throw new BusinessException("Chưa đến thời hạn đăng ký đề tài. Đăng ký mở từ ngày " + batch.getTopicRegStart() + ".");
        }
        if (today.isAfter(batch.getTopicRegEnd())) {
            throw new BusinessException("Đã hết thời hạn đăng ký đề tài. Hạn chót là ngày " + batch.getTopicRegEnd() + ".");
        }

        // ── 5. SV phải có Thesis record trong đợt ──
        Thesis thesis = thesisRepo.findByStudentIdAndBatchId(student.getId(), batch.getId()).orElse(null);
        if (thesis == null) {
            throw new BusinessException("Bạn chưa được gán vào đợt đồ án \"" + batch.getName() + "\". Vui lòng liên hệ Phòng Đào tạo.");
        }

        // ── 6. Thesis chưa có đề tài ──
        if (thesis.getTopic() != null) {
            throw new BusinessException("Bạn đã có đề tài \"" + thesis.getTopic().getTitle()
                    + "\" trong đợt này. Không thể đề xuất thêm.");
        }

        // ── 7. Thesis status phù hợp ──
        if (thesis.getStatus() != ThesisStatus.ELIGIBLE_FOR_THESIS
                && thesis.getStatus() != ThesisStatus.TOPIC_REJECTED) {
            throw new BusinessException("Trạng thái đồ án hiện tại (" + thesis.getStatus()
                    + ") không cho phép đề xuất đề tài.");
        }

        // ── 8. Chưa có registration APPROVED trong batch ──
        if (registrationRepo.existsByStudentIdAndStatusAndBatchId(
                student.getId(), RegistrationStatus.APPROVED, batch.getId())) {
            throw new BusinessException("Bạn đã có đăng ký được duyệt trong đợt này. Không thể đề xuất thêm.");
        }

        // ── 9. Resolve preferred lecturer (nhánh 2.1 vs 2.2) ──
        Lecturer preferredLecturer = null;
        if (req.getPreferredLecturerId() != null) {
            preferredLecturer = lecturerRepo.findById(req.getPreferredLecturerId())
                    .orElseThrow(() -> new BusinessException("Giảng viên được chọn không tồn tại trong hệ thống."));
        }

        // ── 10. Tạo Topic mới (source = STUDENT, status = PENDING_APPROVAL) ──
        Topic topic = Topic.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .requirements(req.getRequirements())
                .maxStudents(1) // SV đề xuất mặc định 1 slot cho chính mình
                .currentStudents(0)
                .batch(batch)
                .majorCode(student.getMajorCode()) // Tự lấy ngành của SV
                .source(TopicSource.STUDENT)
                .status(TopicStatus.PENDING_APPROVAL)
                .proposedBy(user) // Người đề xuất là chính SV
                .build();
        topic = topicRepo.save(topic);

        // ── 11. Tạo TopicRegistration PENDING + gắn preferredLecturer ──
        TopicRegistration reg = TopicRegistration.builder()
                .thesis(thesis)
                .topic(topic)
                .student(student)
                .preferredLecturer(preferredLecturer)
                .status(RegistrationStatus.PENDING)
                .build();

        // ── 12. Cập nhật thesis status ──
        thesis.setStatus(ThesisStatus.TOPIC_PENDING_APPROVAL);
        thesisRepo.save(thesis);

        // ── Log history ──
        java.util.Map<String, Object> logData = new java.util.HashMap<>();
        logData.put("title", topic.getTitle());
        logData.put("batchName", batch.getName());
        auditLogService.log("PROPOSE_TOPIC", "TOPIC", topic.getId(), null, logData);

        return mapToResponse(registrationRepo.save(reg));
    }

    // ────────────────────────────────────────────────────────────────
    // APPROVE / REJECT  (Lecturer → Duyệt đăng ký)
    // ────────────────────────────────────────────────────────────────

    @Transactional
    public TopicRegistrationResponse approveRegistration(UUID id, User user, RegistrationApprovalRequest req) {
        TopicRegistration reg = registrationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TopicRegistration", "id", id));

        // ── Quyền: chỉ giảng viên đề xuất đề tài mới được duyệt ──
        // ── Check quyền ──
        boolean isProposer = reg.getTopic().getProposedBy().getId().equals(user.getId());
        boolean isHeadOfMajor = user.getLecturer() != null 
                && user.getLecturer().getManagedMajorCode() != null 
                && user.getLecturer().getManagedMajorCode().equals(reg.getTopic().getMajorCode());

        // Lecturers can only approve topics they proposed.
        // Heads can approve topics in their major.
        if (!isProposer && !isHeadOfMajor) {
            throw new BusinessException("Bạn không có quyền xử lý yêu cầu này.");
        }

        // ── Registration phải đang PENDING ──
        if (reg.getStatus() != RegistrationStatus.PENDING) {
            throw new BusinessException("Yêu cầu này đã được xử lý trước đó (trạng thái: " + reg.getStatus() + ").");
        }

        reg.setReviewedBy(user);
        reg.setReviewedAt(OffsetDateTime.now());

        if (req.getStatus() == RegistrationStatus.APPROVED) {
            // ── Validate lại trước khi approve ──
            Topic topic = reg.getTopic();

            // Check slot
            if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
                throw new BusinessException("Đề tài đã đủ số lượng sinh viên. Không thể duyệt thêm.");
            }

            // Check thesis chưa bị gán đề tài khác (có thể đã approve ở nơi khác giữa lúc PENDING)
            Thesis thesis = reg.getThesis();
            if (thesis != null && thesis.getTopic() != null) {
                throw new BusinessException("Sinh viên " + reg.getStudent().getStudentCode()
                        + " đã được gán đề tài \"" + thesis.getTopic().getTitle()
                        + "\". Không thể duyệt đăng ký này.");
            }

            // ── Approve đăng ký ──
            reg.setStatus(RegistrationStatus.APPROVED);

            // Update topic counts
            topic.setCurrentStudents(topic.getCurrentStudents() + 1);
            if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
                topic.setStatus(TopicStatus.FULL);
            }
            topicRepo.save(topic);

            // Update thesis: gán topic + advisor + chuyển trạng thái
            if (thesis != null) {
                thesis.setTopic(topic);
                
                // Determine advisor
                Lecturer advisor = null;
                if (req.getAdvisorId() != null) {
                    advisor = lecturerRepo.findById(req.getAdvisorId())
                        .orElseThrow(() -> new BusinessException("Không tìm thấy giảng viên được gán."));
                } else if (topic.getSource() == TopicSource.LECTURER) {
                    advisor = topic.getProposedBy().getLecturer();
                }

                if (advisor == null && topic.getSource() == TopicSource.LECTURER) {
                    // Fallback to topic proposer if they are lecturer
                    advisor = topic.getProposedBy().getLecturer();
                }

                thesis.setAdvisor(advisor);
                thesis.setStatus(ThesisStatus.TOPIC_ASSIGNED);
                thesisRepo.save(thesis);
            }

            // ── Auto-reject các PENDING registrations KHÁC của SV này trong cùng BATCH ──
            // (SV đã có đề tài → không cần giữ các đăng ký khác)
            List<TopicRegistration> otherPendingOfStudent = registrationRepo
                    .findByStudentIdAndStatus(reg.getStudent().getId(), RegistrationStatus.PENDING);
            for (TopicRegistration other : otherPendingOfStudent) {
                if (!other.getId().equals(reg.getId())
                        && other.getTopic().getBatch().getId().equals(topic.getBatch().getId())) {
                    other.setStatus(RegistrationStatus.REJECTED);
                    other.setRejectReason("Tự động từ chối: sinh viên đã được duyệt đề tài \"" + topic.getTitle() + "\".");
                    other.setReviewedBy(user);
                    other.setReviewedAt(OffsetDateTime.now());
                    registrationRepo.save(other);
                }
            }

            // ── Auto-reject PENDING registrations của đề tài nếu đã đầy slot ──
            if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
                List<TopicRegistration> remainingPending = registrationRepo
                        .findByTopicIdAndStatus(topic.getId(), RegistrationStatus.PENDING);
                for (TopicRegistration pending : remainingPending) {
                    pending.setStatus(RegistrationStatus.REJECTED);
                    pending.setRejectReason("Tự động từ chối: đề tài đã đủ số lượng sinh viên.");
                    pending.setReviewedBy(user);
                    pending.setReviewedAt(OffsetDateTime.now());
                    registrationRepo.save(pending);
                }
            }

        } else if (req.getStatus() == RegistrationStatus.REJECTED) {
            reg.setStatus(RegistrationStatus.REJECTED);
            reg.setRejectReason(req.getRejectReason());
        } else {
            throw new BusinessException("Trạng thái không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED.");
        }

        // ── Log history ──
        java.util.Map<String, Object> logData = new java.util.HashMap<>();
        logData.put("title", reg.getTopic().getTitle());
        logData.put("studentName", reg.getStudent().getUser().getLastName() + " " + reg.getStudent().getUser().getFirstName());
        logData.put("studentCode", reg.getStudent().getStudentCode());

        auditLogService.log(
                req.getStatus() == RegistrationStatus.APPROVED ? "APPROVE_REGISTRATION" : "REJECT_REGISTRATION",
                "TOPIC_REGISTRATION", reg.getId(), null, logData);

        return mapToResponse(registrationRepo.save(reg));
    }

    // ────────────────────────────────────────────────────────────────
    // MAPPER
    // ────────────────────────────────────────────────────────────────

    private TopicRegistrationResponse mapToResponse(TopicRegistration reg) {
        User u = reg.getStudent().getUser();
        String studentName = (u.getLastName() != null ? u.getLastName() : "") + " "
                + (u.getFirstName() != null ? u.getFirstName() : "");

        return TopicRegistrationResponse.builder()
                .id(reg.getId())
                .topicId(reg.getTopic().getId())
                .topicTitle(reg.getTopic().getTitle())
                .topicSource(reg.getTopic().getSource())
                .studentId(reg.getStudent().getId())
                .studentName(studentName.trim())
                .studentCode(reg.getStudent().getStudentCode())
                .status(reg.getStatus())
                .rejectReason(reg.getRejectReason())
                .createdAt(reg.getCreatedAt())
                .build();
    }
}
