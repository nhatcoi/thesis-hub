package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.user.entity.Student;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ThesisService {

    private final ThesisRepository thesisRepo;

    @Transactional(readOnly = true)
    public Page<ThesisResponse> getTheses(UUID batchId, UUID majorId, UUID facultyId, ThesisStatus status,
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

            if (majorId != null) {
                predicates.add(cb.equal(studentJoin.get("major").get("id"), majorId));
            } else if (facultyId != null) {
                predicates.add(cb.equal(studentJoin.get("major").get("faculty").get("id"), facultyId));
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

    private ThesisResponse mapToResponse(Thesis thesis) {
        return ThesisResponse.builder()
                .id(thesis.getId())
                .studentId(thesis.getStudent().getId())
                .studentName(thesis.getStudent().getUser().getLastName() + " "
                        + thesis.getStudent().getUser().getFirstName())
                .studentFirstName(thesis.getStudent().getUser().getFirstName())
                .studentLastName(thesis.getStudent().getUser().getLastName())
                .studentCode(thesis.getStudent().getStudentCode())
                .topicId(thesis.getTopic() != null ? thesis.getTopic().getId() : null)
                .topicName(thesis.getTopic() != null ? thesis.getTopic().getTitle() : "Chưa có đề tài")
                .batchId(thesis.getBatch().getId())
                .batchName(thesis.getBatch().getName())
                .advisorId(thesis.getAdvisor() != null ? thesis.getAdvisor().getId() : null)
                .advisorName(
                        thesis.getAdvisor() != null
                                ? thesis.getAdvisor().getUser().getLastName() + " "
                                        + thesis.getAdvisor().getUser().getFirstName()
                                : "Chưa có")
                .status(thesis.getStatus())
                .build();
    }
}
