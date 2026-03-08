package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import com.phenikaa.thesis.notification.service.NotificationService;
import com.phenikaa.thesis.thesis.dto.OutlineResponse;
import com.phenikaa.thesis.thesis.entity.Outline;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.OutlineStatus;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.mapper.OutlineMapper;
import com.phenikaa.thesis.thesis.repository.OutlineRepository;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.thesis.util.OutlineFileStorage;
import com.phenikaa.thesis.thesis.validator.OutlineValidator;
import com.phenikaa.thesis.audit.annotation.Auditable;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OutlineServiceImpl implements OutlineService {

    private final OutlineRepository outlineRepo;
    private final ThesisRepository thesisRepo;
    private final NotificationService notificationService;
    private final OutlineMapper outlineMapper;
    private final OutlineValidator outlineValidator;
    private final OutlineFileStorage fileStorage;

    @Override
    @Transactional
    @Auditable(action = "SUBMIT_OUTLINE", entityType = "Outline")
    public OutlineResponse submitOutline(User user, MultipartFile file) {
        outlineValidator.validateStudent(user);

        Thesis thesis = findActiveThesis(user);
        outlineValidator.validateThesisStatus(thesis);
        outlineValidator.validateOutlinePeriod(thesis.getBatch());
        outlineValidator.validateFile(file);

        int nextVersion = resolveNextVersion(thesis);
        String savedPath = fileStorage.save(file, thesis.getId(), nextVersion);

        Outline outline = buildOutline(thesis, file, savedPath, nextVersion);
        outlineRepo.save(outline);

        thesis.setStatus(ThesisStatus.OUTLINE_SUBMITTED);
        thesisRepo.save(thesis);

        notifyAdvisor(thesis, user, nextVersion);

        return outlineMapper.toResponse(outline);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutlineResponse> getMyOutlines(User user) {
        if (user.getStudent() == null) return List.of();

        Thesis thesis = thesisRepo.findByStudentIdAndBatchStatus(
                user.getStudent().getId(), BatchStatus.ACTIVE)
                .stream().findFirst().orElse(null);
        if (thesis == null) return List.of();

        return outlineRepo.findByThesisIdOrderByVersionDesc(thesis.getId())
                .stream().map(outlineMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutlineResponse> getAdvisingOutlines(User user) {
        if (user.getLecturer() == null) return List.of();
        return outlineRepo.findByAdvisorId(user.getLecturer().getId())
                .stream().map(outlineMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @Auditable(action = "REVIEW_OUTLINE", entityType = "Outline")
    public OutlineResponse reviewOutline(UUID outlineId, User user, String status, String comment) {
        if (user.getLecturer() == null)
            throw new BusinessException("Chỉ giảng viên mới có thể duyệt đề cương.");

        Outline outline = outlineRepo.findById(outlineId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đề cương với ID: " + outlineId));

        // Check advisor is the reviewer
        Thesis thesis = outline.getThesis();
        if (thesis.getAdvisor() == null || !thesis.getAdvisor().getId().equals(user.getLecturer().getId()))
            throw new BusinessException("Bạn không phải GVHD của sinh viên này.");

        if (outline.getStatus() != OutlineStatus.SUBMITTED)
            throw new BusinessException("Đề cương này đã được xử lý (trạng thái: " + outline.getStatus() + ").");

        OutlineStatus outlineStatus = "APPROVED".equals(status) ? OutlineStatus.APPROVED : OutlineStatus.REJECTED;
        outline.setStatus(outlineStatus);
        outline.setReviewerComment(comment);
        outline.setReviewedBy(user.getLecturer());
        outline.setReviewedAt(OffsetDateTime.now());
        outlineRepo.save(outline);

        // Update thesis status
        thesis.setStatus(outlineStatus == OutlineStatus.APPROVED
                ? ThesisStatus.OUTLINE_APPROVED : ThesisStatus.OUTLINE_REJECTED);
        thesisRepo.save(thesis);

        // Notify student
        notifyStudent(thesis, user, outlineStatus, comment);

        return outlineMapper.toResponse(outline);
    }

    // ── Private helpers ──

    private Thesis findActiveThesis(User user) {
        return thesisRepo.findByStudentIdAndBatchStatus(
                user.getStudent().getId(), BatchStatus.ACTIVE)
                .stream().findFirst()
                .orElseThrow(() -> new BusinessException("Bạn chưa tham gia đợt đồ án nào đang hoạt động."));
    }

    private int resolveNextVersion(Thesis thesis) {
        List<Outline> existing = outlineRepo.findByThesisIdOrderByVersionDesc(thesis.getId());
        return existing.isEmpty() ? 1 : existing.get(0).getVersion() + 1;
    }

    private Outline buildOutline(Thesis thesis, MultipartFile file, String savedPath, int version) {
        return Outline.builder()
                .thesis(thesis)
                .version(version)
                .filePath(savedPath)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .status(OutlineStatus.SUBMITTED)
                .submittedAt(OffsetDateTime.now())
                .build();
    }

    private void notifyAdvisor(Thesis thesis, User student, int version) {
        if (thesis.getAdvisor() == null || thesis.getAdvisor().getUser() == null) return;

        String studentName = (student.getLastName() + " " + student.getFirstName()).trim();
        String topicTitle = thesis.getTopic() != null ? thesis.getTopic().getTitle() : "N/A";

        notificationService.sendNotification(
                thesis.getAdvisor().getUser(),
                NotificationType.OUTLINE_REVIEWED,
                "Sinh viên nộp đề cương",
                "Sinh viên " + studentName + " (" + student.getStudent().getStudentCode()
                        + ") đã nộp đề cương v" + version + " cho đề tài \"" + topicTitle + "\".",
                "OUTLINE", thesis.getId());
    }

    private void notifyStudent(Thesis thesis, User reviewer, OutlineStatus status, String comment) {
        User studentUser = thesis.getStudent().getUser();
        String topicTitle = thesis.getTopic() != null ? thesis.getTopic().getTitle() : "N/A";

        if (status == OutlineStatus.APPROVED) {
            notificationService.sendNotification(studentUser, NotificationType.OUTLINE_REVIEWED,
                    "Đề cương được duyệt",
                    "Đề cương cho đề tài \"" + topicTitle + "\" đã được GVHD duyệt. Bạn có thể bắt đầu triển khai.",
                    "OUTLINE", thesis.getId());
        } else {
            String msg = "Đề cương cho đề tài \"" + topicTitle + "\" cần chỉnh sửa.";
            if (comment != null && !comment.isBlank()) msg += " Nhận xét: " + comment;
            notificationService.sendNotification(studentUser, NotificationType.OUTLINE_REVIEWED,
                    "Đề cương cần chỉnh sửa", msg, "OUTLINE", thesis.getId());
        }
    }
}
