package com.phenikaa.thesis.topic.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.topic.dto.TopicDetailResponse;
import com.phenikaa.thesis.topic.dto.TopicRequest;
import com.phenikaa.thesis.topic.dto.TopicResponse;
import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.TopicRegistration;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.repository.TopicRegistrationRepository;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.phenikaa.thesis.audit.annotation.Auditable;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepo;
    private final ThesisBatchRepository batchRepo;
    private final MajorRepository majorRepo;
    private final UserRepository userRepo;
    private final TopicRegistrationRepository registrationRepo;
    private final ThesisRepository thesisRepo;

    @Transactional(readOnly = true)
    public Page<TopicResponse> getMyTopics(User user, UUID batchId, TopicStatus status, String majorCode, String search,
            Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Topic> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            predicates.add(cb.equal(root.get("proposedBy").get("id"), user.getId()));

            if (batchId != null) {
                predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.equal(root.get("majorCode"), majorCode));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return topicRepo.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public java.util.List<TopicResponse> getAvailableTopics(User user, UUID batchId, String search) {
        String majorCode = (user.getStudent() != null) ? user.getStudent().getMajorCode() : null;

        org.springframework.data.jpa.domain.Specification<Topic> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            // Only AVAILABLE or APPROVED topics that still have slots
            predicates.add(root.get("status").in(TopicStatus.AVAILABLE, TopicStatus.APPROVED));

            if (batchId != null) {
                predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            }
            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.equal(root.get("majorCode"), majorCode));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        return topicRepo.findAll(spec, org.springframework.data.domain.Sort.by("createdAt").descending())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TopicResponse getTopicById(UUID id) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));
        return mapToResponse(topic);
    }

    @Transactional(readOnly = true)
    public TopicDetailResponse getTopicDetail(UUID id) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        User proposer = topic.getProposedBy();
        Lecturer lecturer = proposer.getLecturer();

        // Resolve major + faculty
        String majorName = null;
        String facultyName = null;
        if (topic.getMajorCode() != null) {
            Major major = majorRepo.findByCode(topic.getMajorCode()).orElse(null);
            if (major != null) {
                majorName = major.getName();
                if (major.getFaculty() != null) {
                    facultyName = major.getFaculty().getName();
                }
            }
        }
        // If no majorCode on topic, try to get faculty from lecturer
        if (facultyName == null && lecturer != null && lecturer.getFaculty() != null) {
            facultyName = lecturer.getFaculty().getName();
        }

        // Registered students (TopicRegistration)
        List<TopicRegistration> registrations = registrationRepo.findByTopicId(id);
        List<TopicDetailResponse.StudentInfo> registeredStudents = registrations.stream()
                .map(reg -> {
                    Student s = reg.getStudent();
                    String sMajorName = null;
                    if (s.getMajorCode() != null) {
                        sMajorName = majorRepo.findByCode(s.getMajorCode()).map(Major::getName).orElse(null);
                    }
                    return TopicDetailResponse.StudentInfo.builder()
                            .studentId(s.getId())
                            .studentName(s.getUser().getLastName() + " " + s.getUser().getFirstName())
                            .studentCode(s.getStudentCode())
                            .majorCode(s.getMajorCode())
                            .majorName(sMajorName)
                            .registrationStatus(reg.getStatus())
                            .registeredAt(reg.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        // Assigned students (Thesis with topic = this)
        List<Thesis> theses = thesisRepo.findByTopicId(id);
        List<TopicDetailResponse.StudentInfo> assignedStudents = theses.stream()
                .map(thesis -> {
                    Student s = thesis.getStudent();
                    String sMajorName = null;
                    if (s.getMajorCode() != null) {
                        sMajorName = majorRepo.findByCode(s.getMajorCode()).map(Major::getName).orElse(null);
                    }
                    return TopicDetailResponse.StudentInfo.builder()
                            .studentId(s.getId())
                            .studentName(s.getUser().getLastName() + " " + s.getUser().getFirstName())
                            .studentCode(s.getStudentCode())
                            .majorCode(s.getMajorCode())
                            .majorName(sMajorName)
                            .thesisStatus(thesis.getStatus())
                            .build();
                })
                .collect(Collectors.toList());

        int availableSlots = Math.max(0, topic.getMaxStudents() - topic.getCurrentStudents());

        return TopicDetailResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .requirements(topic.getRequirements())
                .source(topic.getSource())
                .status(topic.getStatus())
                .rejectReason(topic.getRejectReason())
                .createdAt(topic.getCreatedAt())
                // Phạm vi
                .majorCode(topic.getMajorCode())
                .majorName(majorName)
                .facultyName(facultyName)
                .batchId(topic.getBatch().getId())
                .batchName(topic.getBatch().getName())
                .maxStudents(topic.getMaxStudents())
                .currentStudents(topic.getCurrentStudents())
                .availableSlots(availableSlots)
                // Giảng viên
                .lecturerId(proposer.getId())
                .lecturerName(proposer.getLastName() + " " + proposer.getFirstName())
                .lecturerCode(lecturer != null ? lecturer.getLecturerCode() : null)
                .lecturerEmail(proposer.getEmail())
                .lecturerPhone(proposer.getPhone())
                .lecturerFacultyName(lecturer != null && lecturer.getFaculty() != null
                        ? lecturer.getFaculty().getName() : null)
                // Danh sách SV
                .registeredStudents(registeredStudents)
                .assignedStudents(assignedStudents)
                .build();
    }

    @Transactional
    @Auditable(action = "CREATE_TOPIC", entityType = "Topic")
    public TopicResponse createTopic(User user, TopicRequest req) {
        ThesisBatch batch = batchRepo.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", req.getBatchId()));

        User proposedBy = userRepo.getReferenceById(user.getId());

        Topic topic = Topic.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .requirements(req.getRequirements())
                .maxStudents(req.getMaxStudents())
                .currentStudents(0)
                .batch(batch)
                .majorCode(req.getMajorCode())
                .source(req.getSource() != null ? req.getSource() : TopicSource.LECTURER)
                .status(TopicStatus.AVAILABLE)
                .proposedBy(proposedBy)
                .build();

        return mapToResponse(topicRepo.save(topic));
    }

    @Transactional
    @Auditable(action = "UPDATE_TOPIC", entityType = "Topic")
    public TopicResponse updateTopic(UUID id, User user, TopicRequest req) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        if (!topic.getProposedBy().getId().equals(user.getId())) {
            throw new BusinessException("Bạn không có quyền sửa đề tài này");
        }

        if (topic.getStatus() == TopicStatus.CLOSED) {
            throw new BusinessException("Không thể sửa đề tài đã đóng");
        }

        topic.setTitle(req.getTitle());
        topic.setDescription(req.getDescription());
        topic.setRequirements(req.getRequirements());
        topic.setMaxStudents(req.getMaxStudents());
        topic.setMajorCode(req.getMajorCode());

        // When updated, status returns to AVAILABLE if it was rejected or pending
        if (topic.getStatus() == TopicStatus.REJECTED || topic.getStatus() == TopicStatus.PENDING_APPROVAL) {
            topic.setStatus(TopicStatus.AVAILABLE);
            topic.setRejectReason(null);
        }

        return mapToResponse(topicRepo.save(topic));
    }

    @Transactional
    @Auditable(action = "DELETE_TOPIC", entityType = "Topic")
    public void deleteTopic(UUID id, User user) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        if (!topic.getProposedBy().getId().equals(user.getId())) {
            throw new BusinessException("Bạn không có quyền xóa đề tài này");
        }

        if (topic.getStatus() == TopicStatus.CLOSED) {
            throw new BusinessException("Không thể xóa đề tài đã đóng");
        }

        topicRepo.delete(topic);
    }

    @Transactional
    public TopicResponse closeTopic(UUID id, User user) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        if (!topic.getProposedBy().getId().equals(user.getId())) {
            throw new BusinessException("Bạn không có quyền đóng đề tài này");
        }

        topic.setStatus(TopicStatus.CLOSED);
        return mapToResponse(topicRepo.save(topic));
    }

    @Transactional
    public TopicResponse reopenTopic(UUID id, User user) {
        Topic topic = topicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));

        if (!topic.getProposedBy().getId().equals(user.getId())) {
            throw new BusinessException("Bạn không có quyền mở lại đề tài này");
        }

        if (topic.getCurrentStudents() >= topic.getMaxStudents()) {
            topic.setStatus(TopicStatus.FULL);
        } else {
            topic.setStatus(TopicStatus.AVAILABLE);
        }
        return mapToResponse(topicRepo.save(topic));
    }

    private TopicResponse mapToResponse(Topic topic) {
        TopicResponse response = TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .requirements(topic.getRequirements())
                .maxStudents(topic.getMaxStudents())
                .currentStudents(topic.getCurrentStudents())
                .source(topic.getSource())
                .status(topic.getStatus())
                .majorCode(topic.getMajorCode())
                .batchId(topic.getBatch().getId())
                .batchName(topic.getBatch().getName())
                .proposedById(topic.getProposedBy().getId())
                .proposedByName(topic.getProposedBy().getLastName() + " " + topic.getProposedBy().getFirstName())
                .rejectReason(topic.getRejectReason())
                .createdAt(topic.getCreatedAt())
                .build();

        if (topic.getMajorCode() != null) {
            majorRepo.findByCode(topic.getMajorCode()).ifPresent(m -> response.setMajorName(m.getName()));
        }

        return response;
    }
}

