package com.phenikaa.thesis.thesis.repository;

import com.phenikaa.thesis.thesis.entity.Thesis;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ThesisRepository extends JpaRepository<Thesis, UUID>, JpaSpecificationExecutor<Thesis> {
    Page<Thesis> findByBatchId(UUID batchId, Pageable pageable);

    long countByBatchId(UUID batchId);

    boolean existsByStudentIdAndBatchId(UUID studentId, UUID batchId);

    java.util.Optional<Thesis> findByStudentIdAndBatchId(UUID studentId, UUID batchId);

    long countByAdvisorId(UUID advisorId);

    java.util.List<Thesis> findByAdvisorId(UUID advisorId);

    java.util.List<Thesis> findByTopicId(UUID topicId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT t FROM Thesis t JOIN FETCH t.batch b WHERE t.student.id = :studentId AND b.status = :batchStatus")
    java.util.List<Thesis> findByStudentIdAndBatchStatus(
            @org.springframework.data.repository.query.Param("studentId") UUID studentId,
            @org.springframework.data.repository.query.Param("batchStatus") com.phenikaa.thesis.batch.entity.enums.BatchStatus batchStatus);
}
