package com.phenikaa.thesis.organization.service;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.dto.AcademicYearRequest;
import com.phenikaa.thesis.organization.entity.AcademicYear;
import com.phenikaa.thesis.organization.repository.AcademicYearRepository;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.audit.annotation.Auditable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcademicYearServiceImpl implements AcademicYearService {

    private final AcademicYearRepository repo;
    private final ThesisBatchRepository batchRepo;

    @Override
    @Transactional(readOnly = true)
    public List<AcademicYear> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "startDate"));
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicYear getById(UUID id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("AcademicYear", "id", id));
    }

    @Override
    @Transactional
    @Auditable(action = "CREATE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public AcademicYear create(AcademicYearRequest req) {
        validateDates(req.startDate(), req.endDate());
        return repo.save(AcademicYear.builder().name(req.name()).startDate(req.startDate()).endDate(req.endDate()).build());
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public AcademicYear update(UUID id, AcademicYearRequest req) {
        AcademicYear ay = getById(id);
        validateDates(req.startDate(), req.endDate());
        ay.setName(req.name()); ay.setStartDate(req.startDate()); ay.setEndDate(req.endDate());
        return repo.save(ay);
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_ACADEMIC_YEAR", entityType = "AcademicYear")
    public void delete(UUID id) {
        AcademicYear ay = getById(id);
        if (!batchRepo.findByAcademicYearId(id).isEmpty())
            throw new BusinessException("Không thể xóa niên khóa đã được sử dụng trong đợt đồ án");
        repo.delete(ay);
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && !start.isBefore(end))
            throw new BusinessException("Ngày bắt đầu phải trước ngày kết thúc niên khóa");
    }
}
