package com.phenikaa.thesis.batch.service;

import com.phenikaa.thesis.auth.service.CurrentUserService;
import com.phenikaa.thesis.batch.dto.ThesisBatchCreateRequest;
import com.phenikaa.thesis.batch.dto.ThesisBatchResponse;
import com.phenikaa.thesis.batch.dto.ThesisBatchUpdateRequest;
import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.batch.mapper.ThesisBatchMapper;
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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ThesisBatchServiceImpl implements ThesisBatchService {

    private final ThesisBatchRepository batchRepo;
    private final AcademicYearRepository academicYearRepo;
    private final UserRepository userRepo;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final ThesisBatchMapper batchMapper;

    @Override
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
        ThesisBatch batch = ThesisBatch.builder()
                .name(req.name())
                .academicYear(ay)
                .semester(req.semester())
                .status(BatchStatus.DRAFT)
                .createdBy(userRepo.getReferenceById(creator.getId()))
                .topicRegStart(req.topicRegStart()).topicRegEnd(req.topicRegEnd())
                .outlineStart(req.outlineStart()).outlineEnd(req.outlineEnd())
                .implementationStart(req.implementationStart()).implementationEnd(req.implementationEnd())
                .defenseRegStart(req.defenseRegStart()).defenseRegEnd(req.defenseRegEnd())
                .defenseStart(req.defenseStart()).defenseEnd(req.defenseEnd())
                .build();

        return toResponse(batchRepo.save(batch));
    }

    @Override
    @Transactional(readOnly = true)
    public ThesisBatchResponse getBatch(UUID id) {
        return toResponse(findBatch(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ThesisBatchResponse> listBatches(String search, BatchStatus status, Pageable pageable) {
        Specification<ThesisBatch> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
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

    @Override
    @Transactional
    @Auditable(action = "UPDATE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse updateBatch(UUID id, ThesisBatchUpdateRequest req) {
        ThesisBatch batch = findBatch(id);
        if (batch.getStatus() != BatchStatus.DRAFT)
            throw new BusinessException("Chỉ được sửa đợt đồ án ở trạng thái DRAFT");

        AcademicYear ay = findAcademicYear(req.academicYearId());
        validateDateRanges(req.topicRegStart(), req.topicRegEnd(),
                req.outlineStart(), req.outlineEnd(),
                req.implementationStart(), req.implementationEnd(),
                req.defenseRegStart(), req.defenseRegEnd(),
                req.defenseStart(), req.defenseEnd());

        batch.setName(req.name()); batch.setAcademicYear(ay); batch.setSemester(req.semester());
        batch.setTopicRegStart(req.topicRegStart()); batch.setTopicRegEnd(req.topicRegEnd());
        batch.setOutlineStart(req.outlineStart()); batch.setOutlineEnd(req.outlineEnd());
        batch.setImplementationStart(req.implementationStart()); batch.setImplementationEnd(req.implementationEnd());
        batch.setDefenseRegStart(req.defenseRegStart()); batch.setDefenseRegEnd(req.defenseRegEnd());
        batch.setDefenseStart(req.defenseStart()); batch.setDefenseEnd(req.defenseEnd());

        return toResponse(batchRepo.save(batch));
    }

    @Override
    @Transactional
    @Auditable(action = "ACTIVATE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse activateBatch(UUID id) {
        ThesisBatch batch = findBatch(id);
        if (batch.getStatus() != BatchStatus.DRAFT)
            throw new BusinessException("Chỉ kích hoạt được đợt ở trạng thái DRAFT (hiện tại: " + batch.getStatus() + ")");

        batch.setStatus(BatchStatus.ACTIVE);
        ThesisBatch saved = batchRepo.save(batch);
        notificationService.sendNotification(saved.getCreatedBy(), NotificationType.BATCH_OPENED,
                "Đợt đồ án mới đã mở",
                "Đợt đồ án '" + saved.getName() + "' đã được kích hoạt.",
                "ThesisBatch", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    @Auditable(action = "CLOSE_BATCH", entityType = "ThesisBatch")
    public ThesisBatchResponse closeBatch(UUID id) {
        ThesisBatch batch = findBatch(id);
        if (batch.getStatus() != BatchStatus.ACTIVE)
            throw new BusinessException("Chỉ đóng được đợt ở trạng thái ACTIVE (hiện tại: " + batch.getStatus() + ")");
        batch.setStatus(BatchStatus.CLOSED);
        return toResponse(batchRepo.save(batch));
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_BATCH", entityType = "ThesisBatch")
    public void deleteBatch(UUID id) {
        ThesisBatch batch = findBatch(id);
        if (batch.getStatus() != BatchStatus.DRAFT)
            throw new BusinessException("Chỉ được xoá đợt đồ án ở trạng thái DRAFT");
        batchRepo.delete(batch);
    }

    private ThesisBatch findBatch(UUID id) {
        return batchRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", id));
    }

    private AcademicYear findAcademicYear(UUID id) {
        return academicYearRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", id));
    }

    private ThesisBatchResponse toResponse(ThesisBatch b) {
        ThesisBatchResponse base = batchMapper.toResponse(b);
        User creator = b.getCreatedBy();
        String creatorName = creator != null ? (creator.getLastName() + " " + creator.getFirstName()).trim() : null;
        return new ThesisBatchResponse(base.id(), base.name(), base.academicYearId(), base.academicYearName(),
                base.semester(), base.status(), base.createdById(), creatorName,
                base.topicRegStart(), base.topicRegEnd(), base.outlineStart(), base.outlineEnd(),
                base.implementationStart(), base.implementationEnd(), base.defenseRegStart(), base.defenseRegEnd(),
                base.defenseStart(), base.defenseEnd(), base.createdAt(), base.updatedAt());
    }

    private void validateDateRanges(OffsetDateTime topicRegStart, OffsetDateTime topicRegEnd,
            OffsetDateTime outlineStart, OffsetDateTime outlineEnd,
            OffsetDateTime implStart, OffsetDateTime implEnd,
            OffsetDateTime defRegStart, OffsetDateTime defRegEnd,
            OffsetDateTime defStart, OffsetDateTime defEnd) {
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

    private void assertBefore(OffsetDateTime from, OffsetDateTime to, String message) {
        if (from != null && to != null && !from.isBefore(to)) throw new BusinessException(message);
    }
}
