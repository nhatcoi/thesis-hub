package com.phenikaa.thesis.user.service;

import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.organization.entity.Faculty;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.FacultyRepository;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.dto.UserResponse;
import com.phenikaa.thesis.user.entity.*;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.entity.enums.UserStatus;
import com.phenikaa.thesis.user.mapper.UserMapper;
import com.phenikaa.thesis.user.repository.*;
import com.phenikaa.thesis.audit.annotation.Auditable;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final LecturerRepository lecturerRepository;
    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng: " + id));
        return enrichResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(String search, UserRole role, UUID facultyId, String majorCode, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("username")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern)));
            }
            if (role != null) {
                Join<User, Role> roleJoin = root.join("roles");
                predicates.add(cb.equal(roleJoin.get("code"), role));
            }
            if (majorCode != null && !majorCode.isBlank()) {
                Join<User, Student> studentJoin = root.join("student", jakarta.persistence.criteria.JoinType.LEFT);
                predicates.add(cb.equal(studentJoin.get("majorCode"), majorCode));
            }
            // Prevent duplicates from JOIN fetch
            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("roles", jakarta.persistence.criteria.JoinType.LEFT);
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return userRepository.findAll(spec, pageable).map(this::enrichResponse);
    }

    @Override
    @Transactional
    @Auditable(action = "CREATE_USER", entityType = "User")
    public User createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BusinessException("Tên đăng nhập đã tồn tại: " + request.getUsername());
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BusinessException("Email đã tồn tại: " + request.getEmail());

        Set<Role> roles = request.getRoles().stream()
                .map(rc -> roleRepository.findByCode(rc)
                        .orElseThrow(() -> new BusinessException("Không tìm thấy vai trò: " + rc)))
                .collect(Collectors.toSet());

        User user = User.builder()
                .username(request.getUsername()).externalId(request.getExternalId())
                .email(request.getEmail()).firstName(request.getFirstName())
                .lastName(request.getLastName()).phone(request.getPhone())
                .roles(roles).status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Set<UserRole> roleCodes = request.getRoles();
        if (roleCodes.contains(UserRole.STUDENT)) createStudentProfile(user, request);
        if (roleCodes.contains(UserRole.LECTURER) || roleCodes.contains(UserRole.DEPT_HEAD))
            createLecturerProfile(user, request);

        return user;
    }

    private UserResponse enrichResponse(User user) {
        UserResponse response = userMapper.toBaseResponse(user);
        Set<UserRole> roleCodes = user.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        response.setRoles(roleCodes);

        if (roleCodes.contains(UserRole.STUDENT)) {
            studentRepository.findByUserId(user.getId()).ifPresent(student -> {
                response.setCohort(student.getCohort());
                response.setClassName(student.getClassName());
                if (student.getMajorCode() != null) {
                    response.setMajorCode(student.getMajorCode());
                    majorRepository.findByCode(student.getMajorCode()).ifPresent(m -> {
                        response.setMajorName(m.getName());
                        if (m.getFaculty() != null) {
                            response.setFacultyName(m.getFaculty().getName());
                            response.setFacultyId(m.getFaculty().getId());
                        }
                    });
                }
            });
        }

        if (roleCodes.contains(UserRole.LECTURER) || roleCodes.contains(UserRole.DEPT_HEAD)) {
            lecturerRepository.findByUserId(user.getId()).ifPresent(lecturer -> {
                if (lecturer.getFaculty() != null) {
                    response.setFacultyName(lecturer.getFaculty().getName());
                    response.setFacultyId(lecturer.getFaculty().getId());
                }
                response.setManagedMajorCode(lecturer.getManagedMajorCode());
                if (lecturer.getManagedMajorCode() != null && !lecturer.getManagedMajorCode().isBlank()) {
                    majorRepository.findByCode(lecturer.getManagedMajorCode())
                            .ifPresent(m -> response.setManagedMajorName(m.getName()));
                }
            });
        }
        return response;
    }

    private void createStudentProfile(User user, UserCreateRequest request) {
        if (request.getMajorCode() == null) throw new BusinessException("Sinh viên cần có mã ngành");
        studentRepository.save(Student.builder()
                .user(user).studentCode(user.getUsername())
                .majorCode(request.getMajorCode()).cohort(request.getCohort())
                .className(request.getClassName()).eligibleForThesis(Boolean.TRUE)
                .build());
    }

    private void createLecturerProfile(User user, UserCreateRequest request) {
        if (request.getFacultyCode() == null) throw new BusinessException("Giảng viên/Trưởng ngành cần có mã khoa");
        Faculty faculty = facultyRepository.findByCode(request.getFacultyCode())
                .orElseThrow(() -> new BusinessException("Không tìm thấy khoa: " + request.getFacultyCode()));
        lecturerRepository.save(Lecturer.builder()
                .user(user).lecturerCode(user.getUsername()).faculty(faculty)
                .managedMajorCode(request.getManagedMajorCode())
                .maxStudentsPerBatch(request.getMaxStudentsPerBatch() != null ? request.getMaxStudentsPerBatch() : 5)
                .build());
    }
}
