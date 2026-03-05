package com.phenikaa.thesis.user.service.importing;

import com.phenikaa.thesis.organization.entity.Faculty;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.FacultyRepository;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.user.dto.importing.LecturerImportRow;
import com.phenikaa.thesis.user.dto.importing.StudentImportRow;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Role;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import com.phenikaa.thesis.user.repository.RoleRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Helper service xử lý từng dòng import trong transaction riêng biệt
 * (REQUIRES_NEW).
 * Giúp tránh lỗi rollback-only khi một dòng thất bại nhưng các dòng khác vẫn
 * thành công.
 */
@Service
@RequiredArgsConstructor
public class UserImportRowProcessor {

        private final UserRepository userRepository;
        private final StudentRepository studentRepository;
        private final LecturerRepository lecturerRepository;
        private final MajorRepository majorRepository;
        private final FacultyRepository facultyRepository;
        private final RoleRepository roleRepository;

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void processStudentRow(StudentImportRow row) {
                Major major = majorRepository.findByCode(row.getMajorCode())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngành: " + row.getMajorCode()));

                User user = saveOrUpdateUser(row.getUsername(), row.getExternalId(), row.getEmail(),
                                row.getFirstName(), row.getLastName(), UserRole.STUDENT);

                Student student = studentRepository.findByStudentCode(row.getUsername())
                                .orElseGet(() -> studentRepository.findByUserId(user.getId())
                                                .orElse(new Student()));

                student.setUser(user);
                student.setStudentCode(row.getUsername());
                student.setMajor(major);
                student.setCohort(row.getCohort());
                // PĐT chịu trách nhiệm lọc đủ điều kiện trước khi import
                student.setEligibleForThesis(Boolean.TRUE);

                studentRepository.save(student);
        }

        @Transactional(propagation = Propagation.REQUIRES_NEW)
        public void processLecturerRow(LecturerImportRow row) {
                Faculty faculty = facultyRepository.findByCode(row.getFacultyCode())
                                .orElseThrow(() -> new RuntimeException(
                                                "Không tìm thấy khoa: " + row.getFacultyCode()));

                User user = saveOrUpdateUser(row.getUsername(), row.getExternalId(), row.getEmail(),
                                row.getFirstName(), row.getLastName(), UserRole.LECTURER);

                Lecturer lecturer = lecturerRepository.findByLecturerCode(row.getUsername())
                                .orElseGet(() -> lecturerRepository.findByUserId(user.getId())
                                                .orElse(new Lecturer()));

                lecturer.setUser(user);
                lecturer.setLecturerCode(row.getUsername());
                lecturer.setFaculty(faculty);
                lecturer.setManagedMajorCode(row.getManagedMajorCode());
                lecturer.setMaxStudentsPerBatch(
                                row.getMaxStudentsPerBatch() != null ? row.getMaxStudentsPerBatch() : 5);

                lecturerRepository.save(lecturer);
        }

        private User saveOrUpdateUser(String username, String externalId, String email,
                        String firstName, String lastName, UserRole role) {
                User user = userRepository.findByUsername(username)
                                .orElse(new User());

                user.setUsername(username);
                user.setExternalId(externalId != null && !externalId.isBlank() ? externalId : user.getExternalId());
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);

                Role roleEntity = roleRepository.findByCode(role)
                                .orElseThrow(() -> new RuntimeException("Role not found: " + role));
                user.getRoles().add(roleEntity);

                // Gán trạng thái mặc định ACTIVE cho user mới
                if (user.getStatus() == null) {
                        user.setStatus(com.phenikaa.thesis.user.entity.enums.UserStatus.ACTIVE);
                }

                return userRepository.save(user);
        }
}
