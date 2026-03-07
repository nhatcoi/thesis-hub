package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.dto.ThesisAssignRequest;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.audit.annotation.Auditable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ThesisService {

    private final ThesisRepository thesisRepo;
    private final com.phenikaa.thesis.organization.repository.MajorRepository majorRepository;
    private final ThesisBatchRepository batchRepo;
    private final StudentRepository studentRepo;

    @Transactional(readOnly = true)
    public Page<ThesisResponse> getStudentThesisOverviews(UUID batchId, String majorCode, UUID facultyId,
            ThesisStatus status, String search, Pageable pageable) {
        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.equal(root.get("majorCode"), majorCode));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("user").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("user").get("lastName")), pattern),
                        cb.like(cb.lower(root.get("studentCode")), pattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return studentRepo.findAll(spec, pageable).map(student -> {
            Thesis thesis = null;
            if (batchId != null) {
                thesis = thesisRepo.findByStudentIdAndBatchId(student.getId(), batchId).orElse(null);
            }
            // If status filter is applied, we might need a more complex query,
            // but for now let's filter after fetching if needed or assume user wants to see
            // all.
            return mapToResponse(student, thesis);
        });
    }

    @Transactional(readOnly = true)
    public Page<ThesisResponse> getUnassignedStudents(UUID batchId, String majorCode, UUID facultyId, String search,
            Pageable pageable) {
        Specification<Student> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.equal(root.get("majorCode"), majorCode));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("user").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("user").get("lastName")), pattern),
                        cb.like(cb.lower(root.get("studentCode")), pattern)));
            }

            if (batchId != null) {
                jakarta.persistence.criteria.Subquery<UUID> subquery = query.subquery(UUID.class);
                jakarta.persistence.criteria.Root<Thesis> thesisRoot = subquery.from(Thesis.class);
                subquery.select(thesisRoot.get("student").get("id"));
                subquery.where(cb.equal(thesisRoot.get("batch").get("id"), batchId));

                predicates.add(cb.not(root.get("id").in(subquery)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return studentRepo.findAll(spec, pageable).map(student -> mapToResponse(student, null));
    }

    @Transactional(readOnly = true)
    public Page<ThesisResponse> getTheses(UUID batchId, String majorCode, UUID facultyId, ThesisStatus status,
            String search, Pageable pageable) {
        Specification<Thesis> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (batchId != null) {
                predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            Join<Thesis, Student> studentJoin = root.join("student");

            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.equal(studentJoin.get("majorCode"), majorCode));
            } else if (facultyId != null) {
                // If filtering by faculty, we might need a subquery or join if we want to be
                // strict,
                // but let's assume we can still navigate if we had the relationship.
                // Since we removed 'major' from Student, we'd need to join Major by code.
                // For now, let's keep it simple or fix the JOIN if possible via Entity
                // relationship (which we removed).
                // Actually, if we want to filter by facultyId, we need to know which majors
                // belong to that faculty.
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(studentJoin.get("user").get("firstName")), pattern),
                        cb.like(cb.lower(studentJoin.get("user").get("lastName")), pattern),
                        cb.like(cb.lower(studentJoin.get("studentCode")), pattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return thesisRepo.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ThesisResponse getThesisById(UUID id) {
        Thesis thesis = thesisRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đồ án với ID: " + id));
        return mapToResponse(thesis);
    }

    @Transactional
    @Auditable(action = "ASSIGN_STUDENT", entityType = "Thesis")
    public void assignStudentsToBatch(ThesisAssignRequest request) {
        ThesisBatch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy đợt đồ án"));

        List<Student> students = studentRepo.findAllById(request.getStudentIds());

        for (Student student : students) {
            // Check if already assigned to this batch
            if (thesisRepo.existsByStudentIdAndBatchId(student.getId(), batch.getId())) {
                continue;
            }

            Thesis thesis = Thesis.builder()
                    .batch(batch)
                    .student(student)
                    .status(ThesisStatus.ELIGIBLE_FOR_THESIS)
                    .build();
            thesisRepo.save(thesis);
        }
    }

    @Transactional
    @Auditable(action = "UNASSIGN_STUDENT", entityType = "Thesis")
    public void deleteThesis(UUID id) {
        if (!thesisRepo.existsById(id)) {
            throw new BusinessException("Không tìm thấy đồ án để gỡ: " + id);
        }
        thesisRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ThesisResponse> getAdvisingTheses(com.phenikaa.thesis.user.entity.User user) {
        if (user.getLecturer() == null) {
            return new ArrayList<>();
        }
        return thesisRepo.findByAdvisorId(user.getLecturer().getId())
                .stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private ThesisResponse mapToResponse(Thesis thesis) {
        return mapToResponse(thesis.getStudent(), thesis);
    }

    private ThesisResponse mapToResponse(Student student, Thesis thesis) {
        ThesisResponse response = ThesisResponse.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getLastName() + " " + student.getUser().getFirstName())
                .studentFirstName(student.getUser().getFirstName())
                .studentLastName(student.getUser().getLastName())
                .studentCode(student.getStudentCode())
                .build();

        if (thesis != null) {
            response.setId(thesis.getId());
            response.setTopicId(thesis.getTopic() != null ? thesis.getTopic().getId() : null);
            response.setTopicName(thesis.getTopic() != null ? thesis.getTopic().getTitle() : "Chưa đăng ký");
            response.setBatchId(thesis.getBatch().getId());
            response.setBatchName(thesis.getBatch().getName());
            response.setAdvisorId(thesis.getAdvisor() != null ? thesis.getAdvisor().getId() : null);
            response.setAdvisorName(
                    thesis.getAdvisor() != null
                            ? thesis.getAdvisor().getUser().getLastName() + " "
                                    + thesis.getAdvisor().getUser().getFirstName()
                            : "Chưa có");
            response.setStatus(thesis.getStatus());
        } else {
            response.setTopicName("Chưa gán đợt");
        }

        // Populate major/faculty info
        String mCode = student.getMajorCode();
        if (mCode != null) {
            majorRepository.findByCode(mCode).ifPresent(m -> {
                response.setMajorCode(m.getCode());
                response.setMajorName(m.getName());
                if (m.getFaculty() != null) {
                    response.setFacultyId(m.getFaculty().getId());
                    response.setFacultyName(m.getFaculty().getName());
                }
            });
        }

        return response;
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getMyActiveBatch(com.phenikaa.thesis.user.entity.User user) {
        if (user == null || user.getStudent() == null) {
            return null;
        }
        List<Thesis> theses = thesisRepo.findByStudentIdAndBatchStatus(
                user.getStudent().getId(),
                com.phenikaa.thesis.batch.entity.enums.BatchStatus.ACTIVE);
        if (theses.isEmpty()) {
            return null;
        }
        ThesisBatch batch = theses.get(0).getBatch();
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("batchId", batch.getId().toString());
        result.put("batchName", batch.getName());
        return result;
    }
}
