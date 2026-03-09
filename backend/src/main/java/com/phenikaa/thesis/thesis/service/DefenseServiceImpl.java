package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.audit.annotation.Auditable;
import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import com.phenikaa.thesis.notification.service.NotificationService;
import com.phenikaa.thesis.thesis.dto.DefenseRegistrationResponse;
import com.phenikaa.thesis.thesis.entity.DefenseRegistration;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.DefenseRegStatus;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.mapper.DefenseRegistrationMapper;
import com.phenikaa.thesis.thesis.repository.DefenseRegistrationRepository;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefenseServiceImpl implements DefenseService {

    private final DefenseRegistrationRepository defenseRepo;
    private final ThesisRepository thesisRepo;
    private final NotificationService notificationService;
    private final DefenseRegistrationMapper defenseMapper;

    @Override
    @Transactional
    @Auditable(action = "REGISTER_DEFENSE", entityType = "DefenseRegistration")
    public DefenseRegistrationResponse registerDefense(User user, MultipartFile report,
            MultipartFile sourceCode, MultipartFile slide, String note) {
        if (user.getStudent() == null)
            throw new BusinessException("Chỉ sinh viên mới có thể đăng ký bảo vệ.");

        Thesis thesis = thesisRepo.findByStudentIdAndBatchStatus(user.getStudent().getId(), BatchStatus.ACTIVE)
                .stream().findFirst()
                .orElseThrow(() -> new BusinessException("Bạn chưa tham gia đợt đồ án nào."));

        // Validate status — must be IN_PROGRESS
        if (thesis.getStatus() != ThesisStatus.IN_PROGRESS)
            throw new BusinessException("Đồ án chưa ở trạng thái thực hiện. Trạng thái: " + thesis.getStatus());

        // Validate defense registration period
        ThesisBatch batch = thesis.getBatch();
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(batch.getDefenseRegStart()))
            throw new BusinessException("Chưa đến giai đoạn xét duyệt bảo vệ. Bắt đầu từ: " + batch.getDefenseRegStart());
        if (now.isAfter(batch.getDefenseRegEnd()))
            throw new BusinessException("Đã kết thúc giai đoạn xét duyệt bảo vệ.");

        // Validate files
        if (report == null || report.isEmpty())
            throw new BusinessException("Vui lòng tải lên báo cáo cuối.");
        if (sourceCode == null || sourceCode.isEmpty())
            throw new BusinessException("Vui lòng tải lên source code.");
        if (slide == null || slide.isEmpty())
            throw new BusinessException("Vui lòng tải lên slide trình bày.");

        UUID thesisId = thesis.getId();
        String reportPath = saveFile(report, thesisId, "report");
        String sourceCodePath = saveFile(sourceCode, thesisId, "sourcecode");
        String slidePath = saveFile(slide, thesisId, "slide");

        DefenseRegistration reg = DefenseRegistration.builder()
                .thesis(thesis)
                .reportPath(reportPath).reportName(report.getOriginalFilename()).reportSize(report.getSize())
                .sourceCodePath(sourceCodePath).sourceCodeName(sourceCode.getOriginalFilename()).sourceCodeSize(sourceCode.getSize())
                .slidePath(slidePath).slideName(slide.getOriginalFilename()).slideSize(slide.getSize())
                .status(DefenseRegStatus.SUBMITTED)
                .note(note)
                .submittedAt(now)
                .build();
        defenseRepo.save(reg);

        // Update thesis status
        thesis.setStatus(ThesisStatus.DEFENSE_REQUESTED);
        thesisRepo.save(thesis);

        // Notify advisor
        if (thesis.getAdvisor() != null && thesis.getAdvisor().getUser() != null) {
            String studentName = (user.getLastName() + " " + user.getFirstName()).trim();
            notificationService.sendNotification(
                    thesis.getAdvisor().getUser(), NotificationType.DEFENSE_REGISTRATION_SUBMITTED,
                    "SV đăng ký bảo vệ",
                    "SV " + studentName + " đã đăng ký bảo vệ. Vui lòng kiểm tra hồ sơ (báo cáo, code, slide).",
                    "DEFENSE", reg.getId());
        }

        return defenseMapper.toResponse(reg);
    }

    @Override
    @Transactional(readOnly = true)
    public DefenseRegistrationResponse getMyDefenseRegistration(User user) {
        if (user.getStudent() == null) return null;
        Thesis thesis = thesisRepo.findByStudentIdAndBatchStatus(user.getStudent().getId(), BatchStatus.ACTIVE)
                .stream().findFirst().orElse(null);
        if (thesis == null) return null;
        return defenseRepo.findFirstByThesisIdOrderBySubmittedAtDesc(thesis.getId())
                .map(defenseMapper::toResponse).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DefenseRegistrationResponse> getMyDefenseHistory(User user) {
        if (user.getStudent() == null) return List.of();
        Thesis thesis = thesisRepo.findByStudentIdAndBatchStatus(user.getStudent().getId(), BatchStatus.ACTIVE)
                .stream().findFirst().orElse(null);
        if (thesis == null) return List.of();
        return defenseRepo.findByThesisIdOrderBySubmittedAtDesc(thesis.getId())
                .stream().map(defenseMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DefenseRegistrationResponse> getAdvisingDefenses(User user) {
        if (user.getLecturer() == null) return List.of();
        return defenseRepo.findByAdvisorId(user.getLecturer().getId())
                .stream().map(defenseMapper::toResponse).toList();
    }

    @Override
    @Transactional
    @Auditable(action = "REVIEW_DEFENSE", entityType = "DefenseRegistration")
    public DefenseRegistrationResponse reviewDefense(UUID id, User user, String status, String comment) {
        if (user.getLecturer() == null)
            throw new BusinessException("Chỉ giảng viên mới có thể duyệt đăng ký bảo vệ.");

        DefenseRegistration reg = defenseRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy hồ sơ đăng ký bảo vệ."));

        Thesis thesis = reg.getThesis();
        if (thesis.getAdvisor() == null || !thesis.getAdvisor().getId().equals(user.getLecturer().getId()))
            throw new BusinessException("Bạn không phải GVHD của sinh viên này.");

        if (reg.getStatus() != DefenseRegStatus.SUBMITTED)
            throw new BusinessException("Hồ sơ này đã được xử lý (trạng thái: " + reg.getStatus() + ").");

        DefenseRegStatus regStatus = "APPROVED".equals(status) ? DefenseRegStatus.APPROVED : DefenseRegStatus.REJECTED;
        reg.setStatus(regStatus);
        reg.setReviewerComment(comment);
        reg.setReviewedBy(user.getLecturer());
        reg.setReviewedAt(OffsetDateTime.now());
        defenseRepo.save(reg);

        // Update thesis status
        thesis.setStatus(regStatus == DefenseRegStatus.APPROVED
                ? ThesisStatus.DEFENSE_APPROVED : ThesisStatus.DEFENSE_REJECTED);
        thesisRepo.save(thesis);

        // Notify student
        User studentUser = thesis.getStudent().getUser();
        if (regStatus == DefenseRegStatus.APPROVED) {
            notificationService.sendNotification(studentUser, NotificationType.DEFENSE_REVIEWED,
                    "Đăng ký bảo vệ được duyệt",
                    "Đăng ký bảo vệ của bạn đã được duyệt. Đã đủ điều kiện sang giai đoạn 2.",
                    "DEFENSE", reg.getId());
        } else {
            String msg = "Đăng ký bảo vệ chưa được chấp nhận.";
            if (comment != null && !comment.isBlank()) msg += " Lý do: " + comment + ".";
            msg += " Vui lòng chỉnh sửa và nộp lại.";
            notificationService.sendNotification(studentUser, NotificationType.DEFENSE_REVIEWED,
                    "Đăng ký bảo vệ bị từ chối", msg, "DEFENSE", reg.getId());
        }

        return defenseMapper.toResponse(reg);
    }

    // ── File helper ──
    private String saveFile(MultipartFile file, UUID thesisId, String type) {
        try {
            Path baseDir = Paths.get(System.getProperty("user.dir"), "uploads", "defense", thesisId.toString());
            Files.createDirectories(baseDir);
            String fileName = type + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = baseDir.resolve(fileName);
            file.transferTo(filePath.toFile());
            return filePath.toString();
        } catch (IOException e) {
            throw new BusinessException("Lỗi khi lưu file " + type + ": " + e.getMessage());
        }
    }
}

