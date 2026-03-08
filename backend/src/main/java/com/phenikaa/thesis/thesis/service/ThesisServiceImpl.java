package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.dto.ThesisAssignRequest;
import com.phenikaa.thesis.thesis.mapper.ThesisMapper;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import com.phenikaa.thesis.common.exception.BusinessException;
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

@Service
@RequiredArgsConstructor
public class ThesisServiceImpl implements ThesisService {

    private final ThesisRepository thesisRepo;
    private final MajorRepository majorRepository;
    private final ThesisBatchRepository batchRepo;
    private final StudentRepository studentRepo;
    private final ThesisMapper thesisMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ThesisResponse> getStudentThesisOverviews(UUID batchId, String majorCode, UUID facultyId,
            ThesisStatus status, String search, Pageable pageable) {
        Specification<Student> spec = buildStudentSpec(majorCode, search, null, null);
        return studentRepo.findAll(spec, pageable).map(student -> {
            Thesis thesis = batchId != null
                    ? thesisRepo.findByStudentIdAndBatchId(student.getId(), batchId).orElse(null) : null;
            return buildResponse(student, thesis);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ThesisResponse> getUnassignedStudents(UUID batchId, String majorCode, UUID facultyId,
            String search, Pageable pageable) {
        Specification<Student> spec = buildStudentSpec(majorCode, search, batchId, null);
        return studentRepo.findAll(spec, pageable).map(student -> buildResponse(student, null));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ThesisResponse> getTheses(UUID batchId, String majorCode, UUID facultyId,
            ThesisStatus status, String search, Pageable pageable) {
        Specification<Thesis> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (batchId != null) predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            Join<Thesis, Student> studentJoin = root.join("student");
            if (majorCode != null && !majorCode.isBlank())
                predicates.add(cb.equal(studentJoin.get("majorCode"), majorCode));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(studentJoin.get("user").get("firstName")), pattern),
                        cb.like(cb.lower(studentJoin.get("user").get("lastName")), pattern),
                        cb.like(cb.lower(studentJoin.get("studentCode")), pattern)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return thesisRepo.findAll(spec, pageable).map(t -> buildResponse(t.getStudent(), t));
    }

    @Override
    @Transactional(readOnly = true)
    public ThesisResponse getThesisById(UUID id) {
        Thesis thesis = thesisRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đồ án với ID: " + id));
        return buildResponse(thesis.getStudent(), thesis);
    }

    @Override
    @Transactional
    @Auditable(action = "ASSIGN_STUDENT", entityType = "Thesis")
    public void assignStudentsToBatch(ThesisAssignRequest request) {
        ThesisBatch batch = batchRepo.findById(request.getBatchId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy đợt đồ án"));
        for (Student student : studentRepo.findAllById(request.getStudentIds())) {
            if (thesisRepo.existsByStudentIdAndBatchId(student.getId(), batch.getId())) continue;
            thesisRepo.save(Thesis.builder().batch(batch).student(student).status(ThesisStatus.ELIGIBLE_FOR_THESIS).build());
        }
    }

    @Override
    @Transactional
    @Auditable(action = "UNASSIGN_STUDENT", entityType = "Thesis")
    public void deleteThesis(UUID id) {
        if (!thesisRepo.existsById(id)) throw new BusinessException("Không tìm thấy đồ án để gỡ: " + id);
        thesisRepo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThesisResponse> getAdvisingTheses(User user) {
        if (user.getLecturer() == null) return new ArrayList<>();
        return thesisRepo.findByAdvisorId(user.getLecturer().getId())
                .stream().map(t -> buildResponse(t.getStudent(), t)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getMyActiveBatch(User user) {
        if (user == null || user.getStudent() == null) return null;
        List<Thesis> theses = thesisRepo.findByStudentIdAndBatchStatus(user.getStudent().getId(), BatchStatus.ACTIVE);
        if (theses.isEmpty()) return null;
        ThesisBatch batch = theses.get(0).getBatch();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("batchId", batch.getId().toString());
        result.put("batchName", batch.getName());
        result.put("topicRegStart", batch.getTopicRegStart());
        result.put("topicRegEnd", batch.getTopicRegEnd());
        return result;
    }

    // ── Private helpers ──

    private ThesisResponse buildResponse(Student student, Thesis thesis) {
        ThesisResponse response = thesisMapper.studentToBaseResponse(student);
        if (thesis != null) {
            response.setId(thesis.getId());
            response.setTopicId(thesis.getTopic() != null ? thesis.getTopic().getId() : null);
            response.setTopicName(thesis.getTopic() != null ? thesis.getTopic().getTitle() : "Chưa đăng ký");
            response.setBatchId(thesis.getBatch().getId());
            response.setBatchName(thesis.getBatch().getName());
            response.setAdvisorId(thesis.getAdvisor() != null ? thesis.getAdvisor().getId() : null);
            response.setAdvisorName(thesis.getAdvisor() != null
                    ? thesisMapper.fullName(thesis.getAdvisor().getUser()) : "Chưa có");
            response.setStatus(thesis.getStatus());
        } else {
            response.setTopicName("Chưa gán đợt");
        }
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

    private Specification<Student> buildStudentSpec(String majorCode, String search,
            UUID excludeBatchId, UUID includeBatchId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (majorCode != null && !majorCode.isBlank())
                predicates.add(cb.equal(root.get("majorCode"), majorCode));
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("user").get("firstName")), pattern),
                        cb.like(cb.lower(root.get("user").get("lastName")), pattern),
                        cb.like(cb.lower(root.get("studentCode")), pattern)));
            }
            if (excludeBatchId != null) {
                jakarta.persistence.criteria.Subquery<UUID> sub = query.subquery(UUID.class);
                jakarta.persistence.criteria.Root<Thesis> thesisRoot = sub.from(Thesis.class);
                sub.select(thesisRoot.get("student").get("id"));
                sub.where(cb.equal(thesisRoot.get("batch").get("id"), excludeBatchId));
                predicates.add(cb.not(root.get("id").in(sub)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
