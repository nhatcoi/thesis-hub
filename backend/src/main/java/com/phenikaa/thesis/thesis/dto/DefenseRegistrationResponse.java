package com.phenikaa.thesis.thesis.dto;

import com.phenikaa.thesis.thesis.entity.enums.DefenseRegStatus;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class DefenseRegistrationResponse {
    private UUID id;
    private UUID thesisId;
    private String reportName;
    private Long reportSize;
    private String reportUrl;
    private String sourceCodeName;
    private Long sourceCodeSize;
    private String sourceCodeUrl;
    private String slideName;
    private Long slideSize;
    private String slideUrl;
    private DefenseRegStatus status;
    private String note;
    private String reviewerComment;
    private String reviewerName;
    private OffsetDateTime reviewedAt;
    private OffsetDateTime submittedAt;
    // For lecturer view
    private String studentName;
    private String studentCode;
    private String topicTitle;
}
