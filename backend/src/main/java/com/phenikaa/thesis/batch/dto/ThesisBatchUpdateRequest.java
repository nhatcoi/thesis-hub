package com.phenikaa.thesis.batch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ThesisBatchUpdateRequest(

        @NotBlank
        String name,

        @NotNull
        UUID academicYearId,

        @NotNull
        Integer semester,

        @NotNull
        OffsetDateTime topicRegStart,

        @NotNull
        OffsetDateTime topicRegEnd,

        @NotNull
        OffsetDateTime outlineStart,

        @NotNull
        OffsetDateTime outlineEnd,

        @NotNull
        OffsetDateTime implementationStart,

        @NotNull
        OffsetDateTime implementationEnd,

        @NotNull
        OffsetDateTime defenseRegStart,

        @NotNull
        OffsetDateTime defenseRegEnd,

        OffsetDateTime defenseStart,

        OffsetDateTime defenseEnd
) {
}
