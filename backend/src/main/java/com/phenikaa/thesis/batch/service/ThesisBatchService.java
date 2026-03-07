package com.phenikaa.thesis.batch.service;

import com.phenikaa.thesis.auth.service.CurrentUserService;
import com.phenikaa.thesis.batch.dto.ThesisBatchCreateRequest;
import com.phenikaa.thesis.batch.dto.ThesisBatchResponse;
import com.phenikaa.thesis.batch.dto.ThesisBatchUpdateRequest;
import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.entity.AcademicYear;
import com.phenikaa.thesis.organization.repository.AcademicYearRepository;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import com.phenikaa.thesis.audit.annotation.Auditable;
import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import com.phenikaa.thesis.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ThesisBatchService {

    private final ThesisBatchRepository batchRepo;
    private final AcademicYearRepository academicYearRepo;
    private final UserRepository userRepo;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public ThesisBatchService(ThesisBatchRepository batchRepo,
            AcademicYearRepository academicYearRepo,
            UserRepository userRepo,
            CurrentUserService currentUserService,
            NotificationService notificationService) {
        this.batchRepo = batchRepo;
        this.academicYearRepo = academicYearRepo;
        this.userRepo = userRepo;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    // ── CREATE ────────────────────────────────────────────────────────────
    @Transactional
    @Auditable(action = "CREATE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse createBatch(ThesisBatchCreateRequest req) {
        AcademicYear ay = findAcademicYear(req.academicYearId());
        validateDateRanges(req.topicRegStart(), req.topicRegEnd(),
                req.outlineStart(), req.outlineEnd(),
                req.implementationStart(), req.implementationEnd(),
                req.defenseRegStart(), req.defenseRegEnd(),
                req.defenseStart(), req.defenseEnd());

        User creator = currentUserService.getCurrentUser();
        User managedCreator = userRepo.getReferenceById(creator.getId());

        ThesisBatch batch = ThesisBatch.builder()
                .name(req.name())
                .academicYear(ay)
                .semester(req.semester())
                .status(BatchStatus.DRAFT)
                .createdBy(managedCreator)
                .topicRegStart(req.topicRegStart())
                .topicRegEnd(req.topicRegEnd())
                .outlineStart(req.outlineStart())
                .outlineEnd(req.outlineEnd())
                .implementationStart(req.implementationStart())
                .implementationEnd(req.implementationEnd())
                .defenseRegStart(req.defenseRegStart())
                .defenseRegEnd(req.defenseRegEnd())
                .defenseStart(req.defenseStart())
                .defenseEnd(req.defenseEnd())
                .build();

        return toResponse(batchRepo.save(batch));
    }

    // ── READ (single) ─────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public ThesisBatchResponse getBatch(UUID id) {
        return toResponse(findBatch(id));
    }

    // ── READ (list) ───────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<ThesisBatchResponse> listBatches(String search, BatchStatus status, Pageable pageable) {
        Specification<ThesisBatch> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("academicYear").get("name")), pattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return batchRepo.findAll(spec, pageable).map(this::toResponse);
    }

    // ── UPDATE (only DRAFT batches) ───────────────────────────────────────
    @Transactional
    @Auditable(action = "UPDATE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse updateBatch(UUID id, ThesisBatchUpdateRequest req) {
        ThesisBatch batch = findBatch(id);

        if (batch.getStatus() != BatchStatus.DRAFT) {
            throw new BusinessException("Chì được sửa đợt đồ án ở trạng thái DRAFT");
        }

        AcademicYear ay = findAcademicYear(req.academicYearId());
        validateDateRanges(req.topicRegStart(), req.topicRegEnd(),
                req.outlineStart(), req.outlineEnd(),
                req.implementationStart(), req.implementationEnd(),
                req.defenseRegStart(), req.defenseRegEnd(),
                req.defenseStart(), req.defenseEnd());

        batch.setName(req.name());
        batch.setAcademicYear(ay);
        batch.setSemester(req.semester());
        batch.setTopicRegStart(req.topicRegStart());
        batch.setTopicRegEnd(req.topicRegEnd());
        batch.setOutlineStart(req.outlineStart());
        batch.setOutlineEnd(req.outlineEnd());
        batch.setImplementationStart(req.implementationStart());
        batch.setImplementationEnd(req.implementationEnd());
        batch.setDefenseRegStart(req.defenseRegStart());
        batch.setDefenseRegEnd(req.defenseRegEnd());
        batch.setDefenseStart(req.defenseStart());
        batch.setDefenseEnd(req.defenseEnd());

        return toResponse(batchRepo.save(batch));
    }

    // ── ACTIVATE (DRAFT → ACTIVE) ─────────────────────────────────────────
    @Transactional
    @Auditable(action = "ACTIVATE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse activateBatch(UUID id) {
        ThesisBatch batch = findBatch(id);

        if (batch.getStatus() != BatchStatus.DRAFT) {
            throw new BusinessException(
                    "Chì kích hoạt được đợt đồ án ở trạng thái DRAFT (hiện tại: " + batch.getStatus() + ")");
        }
        batch.setStatus(BatchStatus.ACTIVE);
        ThesisBatch saved = batchRepo.save(batch);

        // Gửi thông báo cho tất cả
        notificationService.sendNotification(saved.getCreatedBy(), NotificationType.BATCH_OPENED,
                "Đợt đồ án mới đã mở",
                "Đợt đồ án '" + saved.getName() + "' đã được kích hoạt. Sinh viên có thể bắt đầu đăng ký đề tài.",
                "ThesisBatch", saved.getId());

        return toResponse(saved);
    }

    // ── CLOSE (ACTIVE → CLOSED) ───────────────────────────────────────────
    @Transactional
    @Auditable(action = "CLOSE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse closeBatch(UUID id) {
        ThesisBatch batch = findBatch(id);

        if (batch.getStatus() != BatchStatus.ACTIVE) {
            throw new BusinessException(
                    "Chì đóng được đợt đồ án ở trạng thái ACTIVE (hiện tại: " + batch.getStatus() + ")");
        }
        batch.setStatus(BatchStatus.CLOSED);
        return toResponse(batchRepo.save(batch));
    }

    // ── DELETE (only DRAFT) ───────────────────────────────────────────────
    @Transactional
    @Auditable(action = "DELETE_BATCH", entityType = "ThesisBatch")
    public void deleteBatch(UUID id) {
        ThesisBatch batch = findBatch(id);

        if (batch.getStatus() != BatchStatus.DRAFT) {
            throw new BusinessException("Chì được xoá đợt đồ án ở trạng thái DRAFT");
        }
        batchRepo.delete(batch);
    }

    // ── helpers ───────────────────────────────────────────────────────────
    private ThesisBatch findBatch(UUID id) {
        return batchRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", id));
    }

    private AcademicYear findAcademicYear(UUID id) {
        return academicYearRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", id));
    }

    private void validateDateRanges(java.time.OffsetDateTime topicRegStart, java.time.OffsetDateTime topicRegEnd,
            java.time.OffsetDateTime outlineStart, java.time.OffsetDateTime outlineEnd,
            java.time.OffsetDateTime implStart, java.time.OffsetDateTime implEnd,
            java.time.OffsetDateTime defRegStart, java.time.OffsetDateTime defRegEnd,
            java.time.OffsetDateTime defStart, java.time.OffsetDateTime defEnd) {

        assertBefore(topicRegStart, topicRegEnd, "Thời gian bắt đầu ĐK đề tài phải trước thời gian kết thúc");
        assertBefore(outlineStart, outlineEnd, "Thời gian bắt đầu đề cương phải trước thời gian kết thúc");
        assertBefore(implStart, implEnd, "Thời gian bắt đầu thực hiện phải trước thời gian kết thúc");
        assertBefore(defRegStart, defRegEnd, "Thời gian bắt đầu ĐK bảo vệ phải trước thời gian kết thúc");

        assertBefore(topicRegEnd, outlineStart, "Giai đoạn ĐK đề tài phải kết thúc trước khi bắt đầu đề cương");
        assertBefore(outlineEnd, implStart, "Giai đoạn đề cương phải kết thúc trước khi bắt đầu thực hiện");
        assertBefore(implEnd, defRegStart, "Giai đoạn thực hiện phải kết thúc trước khi bắt đầu ĐK bảo vệ");

        if (defStart != null && defEnd != null) {
            assertBefore(defStart, defEnd, "Thời gian bắt đầu bảo vệ phải trước thời gian kết thúc");
            assertBefore(defRegEnd, defStart, "Giai đoạn ĐK bảo vệ phải kết thúc trước khi bắt đầu bảo vệ");
        }
    }

    private void assertBefore(java.time.OffsetDateTime from, java.time.OffsetDateTime to, String message) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new BusinessException(message);
        }
    }

    private ThesisBatchResponse toResponse(ThesisBatch b) {
        AcademicYear ay = b.getAcademicYear();
        User creator = b.getCreatedBy();
        return new ThesisBatchResponse(
                b.getId(),
                b.getName(),
                ay != null ? ay.getId() : null,
                ay != null ? ay.getName() : null,
                b.getSemester(),
                b.getStatus(),
                creator != null ? creator.getId() : null,
                creator != null ? (creator.getLastName() + " " + creator.getFirstName()) : null,
                b.getTopicRegStart(),
                b.getTopicRegEnd(),
                b.getOutlineStart(),
                b.getOutlineEnd(),
                b.getImplementationStart(),
                b.getImplementationEnd(),
                b.getDefenseRegStart(),
                b.getDefenseRegEnd(),
                b.getDefenseStart(),
                b.getDefenseEnd(),
                b.getCreatedAt(),
                b.getUpdatedAt());
    }
}
