package com.phenikaa.thesis.topic.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.service.BatchService;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.service.MajorService;
import com.phenikaa.thesis.thesis.entity.Thesis;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;
import com.phenikaa.thesis.topic.dto.TopicDetailResponse;
import com.phenikaa.thesis.topic.dto.TopicRequest;
import com.phenikaa.thesis.topic.dto.TopicResponse;
import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.TopicRegistration;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.mapper.TopicMapper;
import com.phenikaa.thesis.topic.repository.TopicRegistrationRepository;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.user.entity.Lecturer;
import com.phenikaa.thesis.user.entity.Student;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import com.phenikaa.thesis.audit.annotation.Auditable;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepo;
    private final BatchService batchService;
    private final MajorService majorService;
    private final UserRepository userRepo;
    private final TopicRegistrationRepository registrationRepo;
    private final ThesisRepository thesisRepo;
    private final TopicMapper topicMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TopicResponse> getMyTopics(User user, UUID batchId, TopicStatus status,
                                            String majorCode, String search, Pageable pageable) {
        Specification<Topic> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("proposedBy").get("id"), user.getId()));
            if (batchId != null) predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (majorCode != null && !majorCode.isBlank()) predicates.add(cb.equal(root.get("majorCode"), majorCode));
            if (search != null && !search.isBlank())
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return topicRepo.findAll(spec, pageable).map(this::enrichTopicResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getAvailableTopics(User user, UUID batchId, String search) {
        String majorCode = (user.getStudent() != null) ? user.getStudent().getMajorCode() : null;
        Specification<Topic> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(root.get("status").in(TopicStatus.AVAILABLE, TopicStatus.APPROVED));
            if (batchId != null) predicates.add(cb.equal(root.get("batch").get("id"), batchId));
            if (majorCode != null && !majorCode.isBlank()) predicates.add(cb.equal(root.get("majorCode"), majorCode));
            if (search != null && !search.isBlank())
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return topicRepo.findAll(spec, Sort.by("createdAt").descending())
                .stream().map(this::enrichTopicResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TopicResponse getTopicById(UUID id) {
        return enrichTopicResponse(findTopic(id));
    }

    @Override
    @Transactional(readOnly = true)
    public TopicDetailResponse getTopicDetail(UUID id) {
        Topic topic = findTopic(id);
        User proposer = topic.getProposedBy();
        Lecturer lecturer = proposer.getLecturer();

        Major major = majorService.findByCode(topic.getMajorCode()).orElse(null);
        String majorName = major != null ? major.getName() : null;
        String facultyName = (major != null && major.getFaculty() != null) ? major.getFaculty().getName() : null;

        if (facultyName == null && lecturer != null && lecturer.getFaculty() != null) {
            facultyName = lecturer.getFaculty().getName();
        }

        List<TopicRegistration> registrations = registrationRepo.findByTopicId(id);
        List<TopicDetailResponse.StudentInfo> registeredStudents = registrations.stream()
                .map(reg -> buildStudentInfo(reg.getStudent(), reg.getStatus(), reg.getCreatedAt(), null))
                .toList();

        List<Thesis> theses = thesisRepo.findByTopicId(id);
        List<TopicDetailResponse.StudentInfo> assignedStudents = theses.stream()
                .map(t -> buildStudentInfo(t.getStudent(), null, null, t.getStatus()))
                .toList();

        int availableSlots = Math.max(0, topic.getMaxStudents() - topic.getCurrentStudents());

        return TopicDetailResponse.builder()
                .id(topic.getId()).title(topic.getTitle())
                .description(topic.getDescription()).requirements(topic.getRequirements())
                .source(topic.getSource()).status(topic.getStatus())
                .rejectReason(topic.getRejectReason()).createdAt(topic.getCreatedAt())
                .majorCode(topic.getMajorCode()).majorName(majorName).facultyName(facultyName)
                .batchId(topic.getBatch().getId()).batchName(topic.getBatch().getName())
                .maxStudents(topic.getMaxStudents()).currentStudents(topic.getCurrentStudents())
                .availableSlots(availableSlots)
                .lecturerId(proposer.getId())
                .lecturerName(topicMapper.fullName(proposer))
                .lecturerCode(lecturer != null ? lecturer.getLecturerCode() : null)
                .lecturerEmail(proposer.getEmail()).lecturerPhone(proposer.getPhone())
                .lecturerFacultyName(lecturer != null && lecturer.getFaculty() != null ? lecturer.getFaculty().getName() : null)
                .registeredStudents(registeredStudents).assignedStudents(assignedStudents)
                .build();
    }

    @Override
    @Transactional
    @Auditable(action = "CREATE_TOPIC", entityType = "Topic")
    public TopicResponse createTopic(User user, TopicRequest req) {
        ThesisBatch batch = batchService.findById(req.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("ThesisBatch", "id", req.getBatchId()));
        Topic topic = Topic.builder()
                .title(req.getTitle()).description(req.getDescription())
                .requirements(req.getRequirements()).maxStudents(req.getMaxStudents())
                .currentStudents(0).batch(batch).majorCode(req.getMajorCode())
                .source(req.getSource() != null ? req.getSource() : TopicSource.LECTURER)
                .status(TopicStatus.AVAILABLE)
                .proposedBy(userRepo.getReferenceById(user.getId()))
                .build();
        return enrichTopicResponse(topicRepo.save(topic));
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_TOPIC", entityType = "Topic")
    public TopicResponse updateTopic(UUID id, User user, TopicRequest req) {
        Topic topic = findTopic(id);
        if (!topic.getProposedBy().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền sửa đề tài này");
        if (topic.getStatus() == TopicStatus.CLOSED)
            throw new BusinessException("Không thể sửa đề tài đã đóng");

        topic.setTitle(req.getTitle()); topic.setDescription(req.getDescription());
        topic.setRequirements(req.getRequirements()); topic.setMaxStudents(req.getMaxStudents());
        topic.setMajorCode(req.getMajorCode());

        if (topic.getStatus() == TopicStatus.REJECTED || topic.getStatus() == TopicStatus.PENDING_APPROVAL) {
            topic.setStatus(TopicStatus.AVAILABLE);
            topic.setRejectReason(null);
        }
        return enrichTopicResponse(topicRepo.save(topic));
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_TOPIC", entityType = "Topic")
    public void deleteTopic(UUID id, User user) {
        Topic topic = findTopic(id);
        if (!topic.getProposedBy().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền xóa đề tài này");
        if (topic.getStatus() == TopicStatus.CLOSED)
            throw new BusinessException("Không thể xóa đề tài đã đóng");
        topicRepo.delete(topic);
    }

    @Override
    @Transactional
    public TopicResponse closeTopic(UUID id, User user) {
        Topic topic = findTopic(id);
        if (!topic.getProposedBy().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền đóng đề tài này");
        topic.setStatus(TopicStatus.CLOSED);
        return enrichTopicResponse(topicRepo.save(topic));
    }

    @Override
    @Transactional
    public TopicResponse reopenTopic(UUID id, User user) {
        Topic topic = findTopic(id);
        if (!topic.getProposedBy().getId().equals(user.getId()))
            throw new BusinessException("Bạn không có quyền mở lại đề tài này");
        topic.setStatus(topic.getCurrentStudents() >= topic.getMaxStudents() ? TopicStatus.FULL : TopicStatus.AVAILABLE);
        return enrichTopicResponse(topicRepo.save(topic));
    }

    private Topic findTopic(UUID id) {
        return topicRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Topic", "id", id));
    }

    private TopicResponse enrichTopicResponse(Topic topic) {
        TopicResponse response = topicMapper.toResponse(topic);
        response.setMajorName(majorService.getMajorName(topic.getMajorCode()));
        return response;
    }

    private TopicDetailResponse.StudentInfo buildStudentInfo(Student s,
            com.phenikaa.thesis.topic.entity.enums.RegistrationStatus regStatus,
            java.time.OffsetDateTime registeredAt,
            com.phenikaa.thesis.thesis.entity.enums.ThesisStatus thesisStatus) {
        return TopicDetailResponse.StudentInfo.builder()
                .studentId(s.getId()).studentName(topicMapper.fullName(s.getUser()))
                .studentCode(s.getStudentCode()).majorCode(s.getMajorCode())
                .majorName(majorService.getMajorName(s.getMajorCode()))
                .registrationStatus(regStatus).registeredAt(registeredAt).thesisStatus(thesisStatus)
                .build();
    }
}
