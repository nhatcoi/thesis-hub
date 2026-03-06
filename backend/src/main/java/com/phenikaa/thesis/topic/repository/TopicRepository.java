package com.phenikaa.thesis.topic.repository;

import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic> {
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
