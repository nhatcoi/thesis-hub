package com.phenikaa.thesis.topic.dto;

import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class TopicRegistrationResponse {
    private UUID id;
    private UUID topicId;
    private String topicTitle;
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private RegistrationStatus status;
    private String rejectReason;
    private OffsetDateTime createdAt;
}
