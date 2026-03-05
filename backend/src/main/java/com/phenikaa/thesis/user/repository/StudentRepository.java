package com.phenikaa.thesis.user.repository;

import com.phenikaa.thesis.user.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
        Optional<Student> findByStudentCode(String studentCode);

        Optional<Student> findByUserId(UUID userId);

        List<Student> findByMajorId(UUID majorId);

        List<Student> findByEligibleForThesisTrue();

        long countByEligibleForThesis(boolean eligible);

        long countByMajorId(UUID majorId);

        long countByMajorIdAndEligibleForThesis(UUID majorId, boolean eligible);
}
