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
}
