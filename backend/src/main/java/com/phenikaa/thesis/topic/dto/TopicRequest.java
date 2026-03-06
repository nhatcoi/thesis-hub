package com.phenikaa.thesis.topic.dto;

import com.phenikaa.thesis.topic.entity.enums.TopicSource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class TopicRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private String requirements;

    @NotNull(message = "Số sinh viên tối đa không được để trống")
    @Min(value = 1, message = "Số sinh viên tối đa ít nhất là 1")
    private Integer maxStudents;

    @NotNull(message = "Đợt đồ án không được để trống")
    private UUID batchId;

    private String majorCode;

    private TopicSource source;
}
