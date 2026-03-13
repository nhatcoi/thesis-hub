package com.phenikaa.thesis.topic.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.topic.dto.RegistrationApprovalRequest;
import com.phenikaa.thesis.topic.dto.StudentTopicProposalRequest;
import com.phenikaa.thesis.topic.dto.TopicRegistrationResponse;
import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.TopicRegistration;
import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.mapper.TopicMapper;
import com.phenikaa.thesis.topic.validator.TopicRegistrationValidator;
import com.phenikaa.thesis.topic.repository.TopicRegistrationRepository;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.batch.service.BatchService;
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

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicRegistrationServiceImpl implements TopicRegistrationService {

    private final TopicRegistrationRepository registrationRepo;
    private final TopicRepository topicRepo;
    private final BatchService batchService;
    private final ThesisRepository thesisRepo;
    private final LecturerRepository lecturerRepo;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final TopicMapper topicMapper;
    private final TopicRegistrationValidator registrationValidator;

    @Override
    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getMyRegistrations(User user) {
        return registrationRepo.findByLecturerId(user.getId())
                .stream().map(this::enrichRegistrationResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getMajorRegistrations(String majorCode) {
        if (majorCode == null || majorCode.isBlank()) return new ArrayList<>();
        return registrationRepo.findByMajorCode(majorCode)
                .stream().map(this::enrichRegistrationResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicRegistrationResponse> getStudentRegistrations(User user) {
        if (user.getStudent() == null) return new ArrayList<>();
        return registrationRepo.findByStudentId(user.getStudent().getId())
                .stream().map(this::enrichRegistrationResponse).toList();
    }

    @Override
    @Transactional
    public TopicRegistrationResponse registerTopic(User user, UUID topicId) {
        if (user.getStudent() == null)
            throw new BusinessException("Bạn không phải sinh viên, không thể đăng ký đề tài.");
        Student student = user.getStudent();

        if (student.getEligibleForThesis() != null && !student.getEligibleForThesis())
            throw new BusinessException("Bạn chưa đủ điều kiện làm đồ án (chưa đủ tín chỉ hoặc GPA). Vui lòng liên hệ Phòng Đào tạo.");

        Topic topic = topicRepo.findByIdWithLock(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        ThesisBatch batch = topic.getBatch();

        registrationValidator.validateBatchRegistrationWindow(batch);
        registrationValidator.validateTopicRegistrable(topic, student);

        Thesis thesis = thesisRepo.findByStudentIdAndBatchId(student.getId(), batch.getId()).orElse(null);
        if (thesis == null)
            throw new BusinessException("Bạn chưa được gán vào đợt đồ án \"" + batch.getName() + "\". Vui lòng liên hệ Phòng Đào tạo.");
        if (thesis.getTopic() != null)
            throw new BusinessException("Bạn đã có đề tài \"" + thesis.getTopic().getTitle() + "\" trong đợt này. Không thể đăng ký thêm đề tài khác.");
        if (thesis.getStatus() != ThesisStatus.ELIGIBLE_FOR_THESIS && thesis.getStatus() != ThesisStatus.TOPIC_REJECTED)
            throw new BusinessException("Trạng thái đồ án của bạn hiện không cho phép đăng ký đề tài. Trạng thái hiện tại: " + thesis.getStatus() + ".");
        if (registrationRepo.existsByStudentIdAndStatusAndBatchId(student.getId(), RegistrationStatus.APPROVED, batch.getId())
                || registrationRepo.existsByStudentIdAndStatusAndBatchId(student.getId(), RegistrationStatus.PENDING, batch.getId()))
            throw new BusinessException("Bạn đã có một đăng ký đang chờ duyệt hoặc đã được xác nhận.");

        // FCFS — gán ngay
        TopicRegistration reg = TopicRegistration.builder()
                .thesis(thesis).topic(topic).student(student)
                .status(RegistrationStatus.APPROVED).reviewedAt(OffsetDateTime.now())
                .build();
        reg = registrationRepo.save(reg);

        topic.setCurrentStudents(topic.getCurrentStudents() + 1);
        if (topic.getCurrentStudents() >= topic.getMaxStudents()) topic.setStatus(TopicStatus.FULL);
        topicRepo.save(topic);

        thesis.setTopic(topic);
        thesis.setAdvisor(topic.getProposedBy().getLecturer());
        thesis.setStatus(ThesisStatus.TOPIC_ASSIGNED);
        thesisRepo.save(thesis);

        autoRejectStudentPending(student, batch, topic.getTitle());
        notifyLecturerOnRegister(user, student, topic);

        Map<String, Object> logData = Map.of("title", topic.getTitle(), "batchName", batch.getName());
        auditLogService.log("REGISTER_TOPIC", "TOPIC", topic.getId(), null, new HashMap<>(logData));

        return enrichRegistrationResponse(reg);
    }

    @Override
    @Transactional
    public TopicRegistrationResponse proposeTopicByStudent(User user, StudentTopicProposalRequest req) {
        if (user.getStudent() == null)
            throw new BusinessException("Bạn không phải sinh viên, không thể đề xuất đề tài.");
        Student student = user.getStudent();

        if (student.getEligibleForThesis() != null && !student.getEligibleForThesis())
            throw new BusinessException("Bạn chưa đủ điều kiện làm đồ án. Vui lòng liên hệ Phòng Đào tạo.");
 
        ThesisBatch batch = batchService.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", req.getBatchId()));
        registrationValidator.validateBatchRegistrationWindow(batch);

        Thesis thesis = thesisRepo.findByStudentIdAndBatchId(student.getId(), batch.getId()).orElse(null);
        if (thesis == null)
            throw new BusinessException("Bạn chưa được gán vào đợt đồ án \"" + batch.getName() + "\". Vui lòng liên hệ Phòng Đào tạo.");
        if (thesis.getTopic() != null)
            throw new BusinessException("Bạn đã có đề tài \"" + thesis.getTopic().getTitle() + "\" trong đợt này. Không thể đề xuất thêm.");
        if (thesis.getStatus() != ThesisStatus.ELIGIBLE_FOR_THESIS && thesis.getStatus() != ThesisStatus.TOPIC_REJECTED)
            throw new BusinessException("Trạng thái đồ án hiện tại (" + thesis.getStatus() + ") không cho phép đề xuất đề tài.");
        if (registrationRepo.existsByStudentIdAndStatusAndBatchId(student.getId(), RegistrationStatus.APPROVED, batch.getId())
                || registrationRepo.existsByStudentIdAndStatusAndBatchId(student.getId(), RegistrationStatus.PENDING, batch.getId()))
            throw new BusinessException("Bạn đã có một đăng ký đang chờ duyệt hoặc đã được xác nhận.");

        Lecturer preferredLecturer = null;
        if (req.getPreferredLecturerId() != null) {
            preferredLecturer = lecturerRepo.findById(req.getPreferredLecturerId())
                    .orElseThrow(() -> new BusinessException("Giảng viên được chọn không tồn tại trong hệ thống."));
        }

        Topic topic = Topic.builder()
                .title(req.getTitle()).description(req.getDescription())
                .requirements(req.getRequirements()).maxStudents(1).currentStudents(0)
                .batch(batch).majorCode(student.getMajorCode())
                .source(TopicSource.STUDENT).status(TopicStatus.PENDING_APPROVAL).proposedBy(user)
                .build();
        topic = topicRepo.save(topic);

        TopicRegistration reg = TopicRegistration.builder()
                .thesis(thesis).topic(topic).student(student)
                .preferredLecturer(preferredLecturer).status(RegistrationStatus.PENDING)
                .build();

        thesis.setStatus(ThesisStatus.TOPIC_PENDING_APPROVAL);
        thesisRepo.save(thesis);

        Map<String, Object> logData = Map.of("title", topic.getTitle(), "batchName", batch.getName());
        auditLogService.log("PROPOSE_TOPIC", "TOPIC", topic.getId(), null, new HashMap<>(logData));

        notifyLecturersOnProposal(user, student, topic, preferredLecturer);

        return enrichRegistrationResponse(registrationRepo.save(reg));
    }

    @Override
    @Transactional
    public TopicRegistrationResponse approveRegistration(UUID id, User user, RegistrationApprovalRequest req) {
        TopicRegistration reg = registrationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TopicRegistration", "id", id));

        boolean isProposer = reg.getTopic().getProposedBy().getId().equals(user.getId());
        boolean isHeadOfMajor = user.getLecturer() != null
                && user.getLecturer().getManagedMajorCode() != null
                && user.getLecturer().getManagedMajorCode().equals(reg.getTopic().getMajorCode());

        if (!isProposer && !isHeadOfMajor)
            throw new BusinessException("Bạn không có quyền xử lý yêu cầu này.");
        if (reg.getStatus() != RegistrationStatus.PENDING)
            throw new BusinessException("Yêu cầu này đã được xử lý trước đó (trạng thái: " + reg.getStatus() + ").");

        reg.setReviewedBy(user);
        reg.setReviewedAt(OffsetDateTime.now());

        if (req.getStatus() == RegistrationStatus.APPROVED) {
            processApproval(reg, user, req);
            notifyOnApproval(reg, req);
        } else if (req.getStatus() == RegistrationStatus.REJECTED) {
            reg.setStatus(RegistrationStatus.REJECTED);
            reg.setRejectReason(req.getRejectReason());
            notifyStudentOnRejection(reg, req.getRejectReason());
        } else {
            throw new BusinessException("Trạng thái không hợp lệ. Chỉ chấp nhận APPROVED hoặc REJECTED.");
        }

        Map<String, Object> logData = new HashMap<>();
        logData.put("title", reg.getTopic().getTitle());
        logData.put("studentName", topicMapper.fullName(reg.getStudent().getUser()));
        logData.put("studentCode", reg.getStudent().getStudentCode());
        auditLogService.log(
                req.getStatus() == RegistrationStatus.APPROVED ? "APPROVE_REGISTRATION" : "REJECT_REGISTRATION",
                "TOPIC_REGISTRATION", reg.getId(), null, logData);

        return enrichRegistrationResponse(registrationRepo.save(reg));
    }

    // ── Private helpers ──

    private void processApproval(TopicRegistration reg, User reviewer, RegistrationApprovalRequest req) {
        Topic topic = reg.getTopic();
        if (topic.getCurrentStudents() >= topic.getMaxStudents())
            throw new BusinessException("Đề tài đã đủ số lượng sinh viên. Không thể duyệt thêm.");

        Thesis thesis = reg.getThesis();
        if (thesis != null && thesis.getTopic() != null)
            throw new BusinessException("Sinh viên " + reg.getStudent().getStudentCode()
                    + " đã được gán đề tài \"" + thesis.getTopic().getTitle() + "\". Không thể duyệt đăng ký này.");

        reg.setStatus(RegistrationStatus.APPROVED);

        topic.setCurrentStudents(topic.getCurrentStudents() + 1);
        if (topic.getCurrentStudents() >= topic.getMaxStudents()) topic.setStatus(TopicStatus.FULL);
        topicRepo.save(topic);

        if (thesis != null) {
            thesis.setTopic(topic);
            Lecturer advisor = resolveAdvisor(req.getAdvisorId(), topic);
            thesis.setAdvisor(advisor);
            thesis.setStatus(ThesisStatus.TOPIC_ASSIGNED);
            thesisRepo.save(thesis);
        }

        autoRejectStudentPending(reg.getStudent(), topic.getBatch(), topic.getTitle());

        if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
            List<TopicRegistration> remaining = registrationRepo.findByTopicIdAndStatus(topic.getId(), RegistrationStatus.PENDING);
            for (TopicRegistration pending : remaining) {
                pending.setStatus(RegistrationStatus.REJECTED);
                pending.setRejectReason("Tự động từ chối: đề tài đã đủ số lượng sinh viên.");
                pending.setReviewedBy(reviewer);
                pending.setReviewedAt(OffsetDateTime.now());
                registrationRepo.save(pending);
            }
        }
    }

    private Lecturer resolveAdvisor(UUID advisorId, Topic topic) {
        if (advisorId != null)
            return lecturerRepo.findById(advisorId)
                    .orElseThrow(() -> new BusinessException("Không tìm thấy giảng viên được gán."));
        if (topic.getSource() == TopicSource.LECTURER && topic.getProposedBy().getLecturer() != null)
            return topic.getProposedBy().getLecturer();
        return null;
    }



    private void autoRejectStudentPending(Student student, ThesisBatch batch, String topicTitle) {
        List<TopicRegistration> otherPending = registrationRepo.findByStudentIdAndStatus(student.getId(), RegistrationStatus.PENDING);
        for (TopicRegistration other : otherPending) {
            if (other.getTopic().getBatch().getId().equals(batch.getId())) {
                other.setStatus(RegistrationStatus.REJECTED);
                other.setRejectReason("Tự động hủy: bạn đã được gán đề tài \"" + topicTitle + "\".");
                other.setReviewedAt(OffsetDateTime.now());
                registrationRepo.save(other);
            }
        }
    }

    private void notifyLecturerOnRegister(User user, Student student, Topic topic) {
        User lecturerUser = topic.getProposedBy();
        if (lecturerUser != null) {
            notificationService.sendNotification(lecturerUser, NotificationType.TOPIC_REGISTERED,
                    "Sinh viên đăng ký đề tài",
                    "Sinh viên " + topicMapper.fullName(user) + " (" + student.getStudentCode()
                            + ") đã đăng ký đề tài \"" + topic.getTitle() + "\". Đề tài hiện có "
                            + topic.getCurrentStudents() + "/" + topic.getMaxStudents() + " sinh viên.",
                    "TOPIC", topic.getId());
        }
    }

    private void notifyLecturersOnProposal(User studentUser, Student student, Topic topic, Lecturer preferredLecturer) {
        String title = "Đề xuất đề tài mới từ sinh viên";
        String message = "Sinh viên " + topicMapper.fullName(studentUser) + " (" + student.getStudentCode()
                + ") đã đề xuất đề tài mới: \"" + topic.getTitle() + "\".";

        Set<User> recipients = new HashSet<>();
        if (preferredLecturer != null && preferredLecturer.getUser() != null) {
            recipients.add(preferredLecturer.getUser());
        }

        // Notify Head of Major
        if (student.getMajorCode() != null) {
            List<Lecturer> heads = lecturerRepo.findByManagedMajorCode(student.getMajorCode());
            for (Lecturer head : heads) {
                if (head.getUser() != null) {
                    recipients.add(head.getUser());
                }
            }
        }

        for (User recipient : recipients) {
            notificationService.sendNotification(recipient, NotificationType.TOPIC_PROPOSED,
                    title, message, "TOPIC", topic.getId());
        }
    }

    private TopicRegistrationResponse enrichRegistrationResponse(TopicRegistration reg) {
        TopicRegistrationResponse response = topicMapper.toRegistrationResponse(reg);
        response.setAdvisorName(resolveAdvisorName(reg));
        return response;
    }

    private String resolveAdvisorName(TopicRegistration reg) {
        if (reg.getThesis() != null && reg.getThesis().getAdvisor() != null)
            return topicMapper.fullName(reg.getThesis().getAdvisor().getUser());
        if (reg.getTopic().getSource() == TopicSource.LECTURER)
            return topicMapper.fullName(reg.getTopic().getProposedBy());
        if (reg.getPreferredLecturer() != null)
            return topicMapper.fullName(reg.getPreferredLecturer().getUser());
        return null;
    }

    private void notifyOnApproval(TopicRegistration reg, RegistrationApprovalRequest req) {
        Topic topic = reg.getTopic();
        Student student = reg.getStudent();
        String topicTitle = topic.getTitle();

        // 1. Notify student — topic approved
        notificationService.sendNotification(student.getUser(), NotificationType.TOPIC_APPROVED,
                "Đề tài được duyệt",
                "Đề tài \"" + topicTitle + "\" của bạn đã được Trưởng ngành phê duyệt.",
                "TOPIC", topic.getId());

        // 2. Notify advisor — assigned to guide this student
        Lecturer advisor = resolveAdvisor(req.getAdvisorId(), topic);
        if (advisor != null && advisor.getUser() != null) {
            notificationService.sendNotification(advisor.getUser(), NotificationType.ADVISOR_ASSIGNED,
                    "Phân công hướng dẫn đề tài",
                    "Bạn được phân công hướng dẫn sinh viên " + topicMapper.fullName(student.getUser())
                            + " (" + student.getStudentCode() + ") cho đề tài \"" + topicTitle + "\".",
                    "TOPIC", topic.getId());
        }
    }

    private void notifyStudentOnRejection(TopicRegistration reg, String reason) {
        Topic topic = reg.getTopic();
        String message = "Đề tài \"" + topic.getTitle() + "\" của bạn đã bị từ chối.";
        if (reason != null && !reason.isBlank()) {
            message += " Lý do: " + reason;
        }
        notificationService.sendNotification(reg.getStudent().getUser(), NotificationType.TOPIC_REJECTED,
                "Đề tài bị từ chối", message, "TOPIC", topic.getId());
    }
}
