package com.phenikaa.thesis.user.service;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.organization.entity.Faculty;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.FacultyRepository;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.entity.enums.UserStatus;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Tên đăng nhập đã tồn tại: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .externalId(request.getExternalId())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Handle profile based on role
        if (request.getRole() == UserRole.STUDENT) {
            createStudentProfile(user, request);
        } else if (request.getRole() == UserRole.LECTURER || request.getRole() == UserRole.DEPT_HEAD) {
            createLecturerProfile(user, request);
        }

        return user;
    }

    private void createStudentProfile(User user, UserCreateRequest request) {
        if (request.getMajorCode() == null) {
            throw new BusinessException("Sinh viên cần có mã ngành");
        }
        Major major = majorRepository.findByCode(request.getMajorCode())
                .orElseThrow(() -> new BusinessException("Không tìm thấy ngành: " + request.getMajorCode()));

        Student student = Student.builder()
                .user(user)
                .studentCode(user.getUsername())
                .major(major)
                .cohort(request.getCohort() != null ? request.getCohort() : "N/A")
                .gpa(request.getGpa())
                .accumulatedCredits(request.getAccumulatedCredits() != null ? request.getAccumulatedCredits() : 0)
                .eligibleForThesis(false) // Default, will be recalculated if needed
                .build();

        // Simple eligibility check
        if (student.getAccumulatedCredits() >= major.getRequiredCredits() &&
                student.getGpa() != null && student.getGpa().compareTo(major.getMinGpaForThesis()) >= 0) {
            student.setEligibleForThesis(true);
        }

        studentRepository.save(student);
    }

    private void createLecturerProfile(User user, UserCreateRequest request) {
        if (request.getFacultyCode() == null) {
            throw new BusinessException("Giảng viên/Trưởng bộ môn cần có mã khoa");
        }
        Faculty faculty = facultyRepository.findByCode(request.getFacultyCode())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khoa: " + request.getFacultyCode()));

        Lecturer lecturer = Lecturer.builder()
                .user(user)
                .lecturerCode(user.getUsername())
                .faculty(faculty)
                .academicRank(request.getAcademicRank())
                .academicDegree(request.getAcademicDegree())
                .researchAreas(request.getResearchAreas())
                .maxStudentsPerBatch(request.getMaxStudentsPerBatch() != null ? request.getMaxStudentsPerBatch() : 5)
                .build();

        lecturerRepository.save(lecturer);
    }
}
