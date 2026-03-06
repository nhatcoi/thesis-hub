package com.phenikaa.thesis.topic.dto;

import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TopicResponse {
    private UUID id;
    private String title;
    private String description;
    private String requirements;
    private Integer maxStudents;
    private Integer currentStudents;
    private TopicSource source;
    private TopicStatus status;
    private String majorCode;
    private String majorName;
    private UUID batchId;
    private String batchName;
    private UUID proposedById;
    private String proposedByName;
    private String rejectReason;
    private java.time.OffsetDateTime createdAt;
}
