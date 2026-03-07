package com.phenikaa.thesis.user.service;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.organization.entity.Faculty;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.FacultyRepository;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.dto.UserResponse;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Role;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.entity.enums.UserStatus;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import com.phenikaa.thesis.user.repository.RoleRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import com.phenikaa.thesis.user.repository.UserRepository;
import com.phenikaa.thesis.audit.annotation.Auditable;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng: " + id));
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, UserRole role, UUID facultyId, String majorCode,
            Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), searchPattern),
                        cb.like(cb.lower(root.get("email")), searchPattern),
                        cb.like(cb.lower(root.get("firstName")), searchPattern),
                        cb.like(cb.lower(root.get("lastName")), searchPattern)));
            }

            if (role != null) {
                Join<User, Role> roleJoin = root.join("roles");
                predicates.add(cb.equal(roleJoin.get("code"), role));
            }

            if (facultyId != null) {
                // Tạm thời comment logic faculty vì mapping thay đổi
            }

            if (majorCode != null && !majorCode.isBlank()) {
                Join<User, Student> studentJoin = root.join("student", jakarta.persistence.criteria.JoinType.LEFT);
                predicates.add(cb.equal(studentJoin.get("majorCode"), majorCode));
            }

            // Chỉ fetch roles khi không phải count query
            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("roles", jakarta.persistence.criteria.JoinType.LEFT);
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    private UserResponse mapToResponse(User user) {
        String facultyName = null;
        String majorName = null;
        UUID userFacultyId = null;
        String majorCode = null;
        String cohort = null;
        String className = null;

        Set<UserRole> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());

        if (roleCodes.contains(UserRole.STUDENT)) {
            Student student = studentRepository.findByUserId(user.getId()).orElse(null);
            if (student != null) {
                cohort = student.getCohort();
                className = student.getClassName();
                if (student.getMajorCode() != null) {
                    majorCode = student.getMajorCode();
                    Major m = majorRepository.findByCode(majorCode).orElse(null);
                    if (m != null) {
                        majorName = m.getName();
                        if (m.getFaculty() != null) {
                            facultyName = m.getFaculty().getName();
                            userFacultyId = m.getFaculty().getId();
                        }
                    }
                }
            }
        }

        String managedMajorName = null;
        String managedMajorCode = null;

        // Multi-role logic: search for profile if has lecturer or head role
        if (roleCodes.contains(UserRole.LECTURER) || roleCodes.contains(UserRole.DEPT_HEAD)) {
            Lecturer lecturer = lecturerRepository.findByUserId(user.getId()).orElse(null);
            if (lecturer != null) {
                if (lecturer.getFaculty() != null) {
                    facultyName = lecturer.getFaculty().getName();
                    userFacultyId = lecturer.getFaculty().getId();
                }
                // Correctly assign managedMajor information if code exists
                managedMajorCode = lecturer.getManagedMajorCode();
                if (managedMajorCode != null && !managedMajorCode.isBlank()) {
                    Major m = majorRepository.findByCode(managedMajorCode).orElse(null);
                    if (m != null) {
                        managedMajorName = m.getName();
                    }
                }
            }
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .roles(roleCodes != null ? roleCodes : new java.util.HashSet<>())
                .status(user.getStatus())
                .facultyName(facultyName)
                .majorName(majorName)
                .facultyId(userFacultyId)
                .managedMajorName(managedMajorName)
                .majorCode(majorCode)
                .managedMajorCode(managedMajorCode)
                .cohort(cohort)
                .className(className)
                .build();
    }

    @Transactional
    @Auditable(action = "CREATE_USER", entityType = "User")
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Tên đăng nhập đã tồn tại: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email đã tồn tại: " + request.getEmail());
        }

        Set<Role> roles = request.getRoles().stream()
                .map(roleCode -> roleRepository.findByCode(roleCode)
                        .orElseThrow(() -> new BusinessException("Không tìm thấy vai trò: " + roleCode)))
                .collect(Collectors.toSet());

        User user = User.builder()
                .username(request.getUsername())
                .externalId(request.getExternalId())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .roles(roles)
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Handle profile based on roles
        Set<UserRole> roleCodes = request.getRoles();
        if (roleCodes.contains(UserRole.STUDENT)) {
            createStudentProfile(user, request);
        }
        if (roleCodes.contains(UserRole.LECTURER) || roleCodes.contains(UserRole.DEPT_HEAD)) {
            createLecturerProfile(user, request);
        }

        return user;
    }

    private void createStudentProfile(User user, UserCreateRequest request) {
        if (request.getMajorCode() == null) {
            throw new BusinessException("Sinh viên cần có mã ngành");
        }
        Student student = Student.builder()
                .user(user)
                .studentCode(user.getUsername())
                .majorCode(request.getMajorCode())
                .cohort(request.getCohort())
                .className(request.getClassName())
                .eligibleForThesis(Boolean.TRUE)
                .build();

        studentRepository.save(student);
    }

    private void createLecturerProfile(User user, UserCreateRequest request) {
        if (request.getFacultyCode() == null) {
            throw new BusinessException("Giảng viên/Trưởng ngành cần có mã khoa");
        }
        Faculty faculty = facultyRepository.findByCode(request.getFacultyCode())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khoa: " + request.getFacultyCode()));

        Lecturer lecturer = Lecturer.builder()
                .user(user)
                .lecturerCode(user.getUsername())
                .faculty(faculty)
                .managedMajorCode(request.getManagedMajorCode())
                .maxStudentsPerBatch(request.getMaxStudentsPerBatch() != null ? request.getMaxStudentsPerBatch() : 5)
                .build();

        lecturerRepository.save(lecturer);
    }
}
