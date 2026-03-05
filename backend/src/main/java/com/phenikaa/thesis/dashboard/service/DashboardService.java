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

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepo;
    private final LecturerRepository lecturerRepo;
    private final ThesisBatchRepository batchRepo;
    private final TopicRepository topicRepo;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(com.phenikaa.thesis.user.entity.User user) {
        // Temporarily return global stats for all roles including DEPT_HEAD
        // until major relationship is restored with DB migration
        return getGlobalStats();
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
