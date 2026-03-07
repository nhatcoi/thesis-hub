package com.phenikaa.thesis.topic.repository;

import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic> {

    /**
     * Pessimistic write lock — dùng cho FCFS registration.
     * Tránh race condition khi nhiều SV đăng ký cùng 1 đề tài đồng thời.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Topic t WHERE t.id = :id")
    Optional<Topic> findByIdWithLock(@Param("id") UUID id);

    List<Topic> findByBatchId(UUID batchId);

    List<Topic> findByBatchIdAndStatus(UUID batchId, TopicStatus status);

    List<Topic> findByMajorCode(String majorCode);

    long countByStatus(TopicStatus status);

    long countByMajorCode(String majorCode);

    long countByMajorCodeAndStatus(String majorCode, TopicStatus status);

    long countByProposedById(UUID userId);

    long countByProposedByIdAndStatus(UUID userId, TopicStatus status);

    org.springframework.data.domain.Page<Topic> findByProposedByIdOrderByCreatedAtDesc(UUID userId,
            org.springframework.data.domain.Pageable pageable);
}

