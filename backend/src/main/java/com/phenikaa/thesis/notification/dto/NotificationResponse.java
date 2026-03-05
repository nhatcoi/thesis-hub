package com.phenikaa.thesis.notification.dto;

import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import lombok.Builder;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        Boolean isRead,
        String referenceType,
        UUID referenceId,
        OffsetDateTime createdAt) {
}
