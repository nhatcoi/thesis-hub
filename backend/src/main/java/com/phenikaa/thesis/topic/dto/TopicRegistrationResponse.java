package com.phenikaa.thesis.topic.dto;

import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import com.phenikaa.thesis.topic.entity.enums.TopicSource;
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
    private TopicSource topicSource; // Thêm để phân biệt LECTURER vs STUDENT proposal
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private RegistrationStatus status;
    private String rejectReason;
    private OffsetDateTime createdAt;
}


