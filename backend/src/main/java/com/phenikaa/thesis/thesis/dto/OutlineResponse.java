package com.phenikaa.thesis.thesis.dto;

import com.phenikaa.thesis.thesis.entity.enums.OutlineStatus;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class OutlineResponse {
    private UUID id;
    private UUID thesisId;
    private Integer version;
    private String fileName;
    private Long fileSize;
    private OutlineStatus status;
    private String reviewerComment;
    private String reviewerName;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime submittedAt;
    // For lecturer view
    private String studentName;
    private String studentCode;
    private String topicTitle;
    private String publicUrl;
}
