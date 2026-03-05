package com.phenikaa.thesis.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalStudents;
    private long totalLecturers;
    private long totalTopics;
    private long totalBatches;

    private Map<String, Long> topicsByStatus;
    private Map<String, Long> batchesByStatus;
    private long eligibleStudents;
    private long ineligibleStudents;

    // Thống kê theo Khoa/Ngành nếu cần mở rộng sau này
}
