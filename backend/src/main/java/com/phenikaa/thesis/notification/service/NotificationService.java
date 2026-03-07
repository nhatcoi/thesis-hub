package com.phenikaa.thesis.notification.service;

import com.phenikaa.thesis.notification.dto.NotificationResponse;
import com.phenikaa.thesis.notification.entity.Notification;
import com.phenikaa.thesis.notification.entity.enums.NotificationType;
import com.phenikaa.thesis.notification.repository.NotificationRepository;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID userId) {
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepo.countByRecipientIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Access Denied");
        }

        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepo.findByRecipientIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(unread);
    }

    /**
     * Save notification to DB + push real-time via WebSocket.
     */
    @Transactional
    public void sendNotification(User recipient, NotificationType type, String title, String message, String refType,
            UUID refId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .referenceType(refType)
                .referenceId(refId)
                .build();
        notification = notificationRepo.save(notification);

        // Build response DTO
        NotificationResponse response = toResponse(notification);

        // Push real-time to the specific user via WebSocket
        // Client subscribes to: /topic/notifications/{userId}
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + recipient.getId().toString(),
                    response
            );
            log.debug("Sent real-time notification to user {}: {}", recipient.getId(), title);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification to user {}: {}", recipient.getId(), e.getMessage());
            // Non-critical: notification is already saved in DB
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .referenceType(n.getReferenceType())
                .referenceId(n.getReferenceId())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
