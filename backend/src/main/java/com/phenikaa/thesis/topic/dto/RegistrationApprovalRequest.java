package com.phenikaa.thesis.topic.dto;

import com.phenikaa.thesis.topic.entity.enums.RegistrationStatus;
import lombok.Data;

@Data
public class RegistrationApprovalRequest {
    private RegistrationStatus status;
    private String rejectReason;
    private java.util.UUID advisorId;
}
