package com.phenikaa.thesis.audit.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO đại diện cho một bản ghi lịch sử thao tác để trả về cho Frontend.
 */
public record AuditLogResponse(
                UUID id,
                UUID userId,
                String userName,
                String action,
                String entityType,
                UUID entityId,
                String message,
                Map<String, Object> oldValue,
                Map<String, Object> newValue,
                String ipAddress,
                OffsetDateTime createdAt) {
}
