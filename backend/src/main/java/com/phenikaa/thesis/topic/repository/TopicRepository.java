package com.phenikaa.thesis.topic.repository;

import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {
    List<Topic> findByBatchId(UUID batchId);

    List<Topic> findByBatchIdAndStatus(UUID batchId, TopicStatus status);

    List<Topic> findByMajorId(UUID majorId);

    long countByStatus(TopicStatus status);

    long countByMajorId(UUID majorId);

    long countByMajorIdAndStatus(UUID majorId, TopicStatus status);
}
