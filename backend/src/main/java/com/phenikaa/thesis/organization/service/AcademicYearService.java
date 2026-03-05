package com.phenikaa.thesis.organization.service;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.dto.AcademicYearRequest;
import com.phenikaa.thesis.organization.entity.AcademicYear;
import com.phenikaa.thesis.organization.repository.AcademicYearRepository;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.audit.annotation.Auditable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AcademicYearService {

    private final AcademicYearRepository repo;
    private final ThesisBatchRepository batchRepo;

    public AcademicYearService(AcademicYearRepository repo, ThesisBatchRepository batchRepo) {
        this.repo = repo;
        this.batchRepo = batchRepo;
    }

    @Transactional(readOnly = true)
    public List<AcademicYear> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "startDate"));
    }

    @Transactional(readOnly = true)
    public AcademicYear getById(UUID id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", id));
    }

    @Transactional
    @Auditable(action = "CREATE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public AcademicYear create(AcademicYearRequest req) {
        validateDates(req.startDate(), req.endDate());

        AcademicYear ay = AcademicYear.builder()
                .name(req.name())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .build();

        return repo.save(ay);
    }

    @Transactional
    @Auditable(action = "UPDATE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public AcademicYear update(UUID id, AcademicYearRequest req) {
        AcademicYear ay = getById(id);
        validateDates(req.startDate(), req.endDate());

        ay.setName(req.name());
        ay.setStartDate(req.startDate());
        ay.setEndDate(req.endDate());

        return repo.save(ay);
    }

    @Transactional
    @Auditable(action = "DELETE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public void delete(UUID id) {
        AcademicYear ay = getById(id);

        // Kiểm tra xem đã có đợt đồ án nào sử dụng niên khóa này chưa
        if (!batchRepo.findByAcademicYearId(id).isEmpty()) {
            throw new BusinessException("Không thể xóa niên khóa đã được sử dụng trong đợt đồ án");
        }

        repo.delete(ay);
    }

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (start != null && end != null && !start.isBefore(end)) {
            throw new BusinessException("Ngày bắt đầu phải trước ngày kết thúc niên khóa");
        }
    }
}
