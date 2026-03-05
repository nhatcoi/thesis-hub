package com.phenikaa.thesis.user.repository;

import com.phenikaa.thesis.user.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer, UUID> {
    Optional<Lecturer> findByLecturerCode(String lecturerCode);

    Optional<Lecturer> findByUserId(UUID userId);

    List<Lecturer> findByFacultyId(UUID facultyId);

    long countByFacultyId(UUID facultyId);
}
