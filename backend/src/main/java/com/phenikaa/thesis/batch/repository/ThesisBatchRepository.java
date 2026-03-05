package com.phenikaa.thesis.batch.repository;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThesisBatchRepository extends JpaRepository<ThesisBatch, UUID>, JpaSpecificationExecutor<ThesisBatch> {

    List<ThesisBatch> findByStatus(BatchStatus status, Sort sort);

    List<ThesisBatch> findByAcademicYearId(UUID academicYearId);

    long countByStatus(BatchStatus status);
}
