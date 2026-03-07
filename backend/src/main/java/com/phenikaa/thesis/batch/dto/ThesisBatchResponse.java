package com.phenikaa.thesis.batch.dto;

import com.phenikaa.thesis.batch.entity.enums.BatchStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ThesisBatchResponse(
        UUID id,
        String name,
        UUID academicYearId,
        String academicYearName,
        Integer semester,
        BatchStatus status,
        UUID createdById,
        String createdByName,
        OffsetDateTime topicRegStart,
        OffsetDateTime topicRegEnd,
        OffsetDateTime outlineStart,
        OffsetDateTime outlineEnd,
        OffsetDateTime implementationStart,
        OffsetDateTime implementationEnd,
        OffsetDateTime defenseRegStart,
        OffsetDateTime defenseRegEnd,
        OffsetDateTime defenseStart,
        OffsetDateTime defenseEnd,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
