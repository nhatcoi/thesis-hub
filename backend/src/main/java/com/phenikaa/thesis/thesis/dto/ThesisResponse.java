package com.phenikaa.thesis.thesis.dto;

import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ThesisResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private String studentFirstName;
    private String studentLastName;
    private String studentCode;

    private UUID topicId;
    private String topicName;

    private UUID batchId;
    private String batchName;

    private UUID advisorId;
    private String advisorName;

    private ThesisStatus status;
}
