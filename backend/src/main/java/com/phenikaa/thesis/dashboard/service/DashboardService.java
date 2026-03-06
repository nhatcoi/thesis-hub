package com.phenikaa.thesis.dashboard.service;

import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import com.phenikaa.thesis.dashboard.dto.DashboardStatsResponse;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import com.phenikaa.thesis.topic.repository.TopicRepository;
import com.phenikaa.thesis.user.repository.LecturerRepository;
import com.phenikaa.thesis.user.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.thesis.repository.ThesisRepository;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepo;
    private final LecturerRepository lecturerRepo;
    private final ThesisBatchRepository batchRepo;
    private final TopicRepository topicRepo;
    private final ThesisRepository thesisRepo;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(User user) {
        boolean isLecturer = user.getRoles().stream().anyMatch(r -> r.getCode().equals("LECTURER"));
        boolean isDeptHead = user.getRoles().stream().anyMatch(r -> r.getCode().equals("DEPT_HEAD"));

        if (isLecturer && !isDeptHead) {
            return getLecturerStats(user);
        }

        return getGlobalStats();
    }

    private DashboardStatsResponse getLecturerStats(User user) {
        Map<String, Long> topicsByStatus = new HashMap<>();
        for (TopicStatus status : TopicStatus.values()) {
            topicsByStatus.put(status.name(), topicRepo.countByProposedByIdAndStatus(user.getId(), status));
        }

        long advisingCount = 0;
        if (user.getLecturer() != null) {
            advisingCount = thesisRepo.countByAdvisorId(user.getLecturer().getId());
        }

        return DashboardStatsResponse.builder()
                .totalTopics(topicRepo.countByProposedById(user.getId()))
                .totalAdvisingTheses(advisingCount)
                .topicsByStatus(topicsByStatus)
                .build();
    }

    private DashboardStatsResponse getGlobalStats() {
        Map<String, Long> batchesByStatus = new HashMap<>();
        for (BatchStatus status : BatchStatus.values()) {
            batchesByStatus.put(status.name(), batchRepo.countByStatus(status));
        }

        Map<String, Long> topicsByStatus = new HashMap<>();
        for (TopicStatus status : TopicStatus.values()) {
            topicsByStatus.put(status.name(), topicRepo.countByStatus(status));
        }

        return DashboardStatsResponse.builder()
                .totalStudents(studentRepo.count())
                .totalLecturers(lecturerRepo.count())
                .totalBatches(batchRepo.count())
                .totalTopics(topicRepo.count())
                .batchesByStatus(batchesByStatus)
                .topicsByStatus(topicsByStatus)
                .eligibleStudents(studentRepo.countByEligibleForThesis(true))
                .ineligibleStudents(studentRepo.countByEligibleForThesis(false))
                .build();
    }
}
