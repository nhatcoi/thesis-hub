package com.phenikaa.thesis.topic.repository;

import com.phenikaa.thesis.topic.entity.TopicRegistration;
import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TopicRegistrationRepository extends JpaRepository<TopicRegistration, UUID> {
    List<TopicRegistration> findByThesisId(UUID thesisId);

    List<TopicRegistration> findByTopicId(UUID topicId);

    List<TopicRegistration> findByStudentId(UUID studentId);

    List<TopicRegistration> findByStudentIdAndStatus(UUID studentId, RegistrationStatus status);

    List<TopicRegistration> findByTopicIdAndStatus(UUID topicId, RegistrationStatus status);

    boolean existsByStudentIdAndTopicIdAndStatus(UUID studentId, UUID topicId, RegistrationStatus status);

    @Query("SELECT COUNT(tr) > 0 FROM TopicRegistration tr " +
           "WHERE tr.student.id = :studentId AND tr.status = :status " +
           "AND tr.topic.batch.id = :batchId")
    boolean existsByStudentIdAndStatusAndBatchId(
            @Param("studentId") UUID studentId,
            @Param("status") RegistrationStatus status,
            @Param("batchId") UUID batchId);

    @Query("SELECT tr FROM TopicRegistration tr JOIN tr.topic t WHERE t.proposedBy.id = :userId ORDER BY tr.createdAt DESC")
    List<TopicRegistration> findByLecturerId(@Param("userId") UUID userId);

    @Query("SELECT tr FROM TopicRegistration tr JOIN tr.topic t WHERE t.majorCode = :majorCode ORDER BY tr.createdAt DESC")
    List<TopicRegistration> findByMajorCode(@Param("majorCode") String majorCode);
}

