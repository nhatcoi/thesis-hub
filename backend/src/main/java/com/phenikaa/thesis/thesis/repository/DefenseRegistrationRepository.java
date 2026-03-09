package com.phenikaa.thesis.thesis.repository;

import com.phenikaa.thesis.thesis.entity.DefenseRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DefenseRegistrationRepository extends JpaRepository<DefenseRegistration, UUID> {
    List<DefenseRegistration> findByThesisIdOrderBySubmittedAtDesc(UUID thesisId);
    Optional<DefenseRegistration> findFirstByThesisIdOrderBySubmittedAtDesc(UUID thesisId);

    @Query("SELECT d FROM DefenseRegistration d WHERE d.thesis.advisor.id = :advisorId ORDER BY d.submittedAt DESC")
    List<DefenseRegistration> findByAdvisorId(@Param("advisorId") UUID advisorId);
}
