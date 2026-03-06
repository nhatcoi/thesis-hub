package com.phenikaa.thesis.topic.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.common.exception.BusinessException;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import com.phenikaa.thesis.topic.dto.TopicRequest;
import com.phenikaa.thesis.topic.dto.TopicResponse;
import com.phenikaa.thesis.topic.entity.Topic;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.phenikaa.thesis.audit.annotation.Auditable;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepo;
    private final ThesisBatchRepository batchRepo;
    private final MajorRepository majorRepo;
    private final UserRepository userRepo;

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
