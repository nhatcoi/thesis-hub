package com.phenikaa.thesis.thesis.repository;

import com.phenikaa.thesis.thesis.entity.Outline;
import com.phenikaa.thesis.thesis.entity.enums.OutlineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutlineRepository extends JpaRepository<Outline, UUID> {
    List<Outline> findByThesisIdOrderByVersionDesc(UUID thesisId);

    @Query("SELECT o FROM Outline o JOIN FETCH o.thesis t JOIN FETCH t.student s JOIN FETCH s.user " +
           "WHERE t.advisor.id = :advisorId ORDER BY o.submittedAt DESC")
    List<Outline> findByAdvisorId(@Param("advisorId") UUID advisorId);
}
