package com.phenikaa.thesis.topic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class StudentTopicProposalRequest {

    @NotBlank(message = "Tiêu đề đề tài không được để trống")
    private String title;

    private String description;

    private String requirements;

    @NotNull(message = "Đợt đồ án không được để trống")
    private UUID batchId;

    /**
     * Nhánh 2.1: SV chỉ định GV mong muốn (nullable).
     * Nhánh 2.2: Để null → đẩy lên Trưởng ngành.
     */
    private UUID preferredLecturerId;
}
