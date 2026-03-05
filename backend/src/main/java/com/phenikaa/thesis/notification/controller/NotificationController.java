package com.phenikaa.thesis.notification.controller;

import com.phenikaa.thesis.auth.service.CurrentUserService;
import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.notification.dto.NotificationResponse;
import com.phenikaa.thesis.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        return ApiResponse.ok(notificationService.getMyNotifications(currentUserService.getCurrentUser().getId()));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.ok(notificationService.getUnreadCount(currentUserService.getCurrentUser().getId()));
    }

    @PostMapping("/{id}/read")
    public ApiResponse<?> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id, currentUserService.getCurrentUser().getId());
        return ApiResponse.ok("Marked as read");
    }

    @PostMapping("/read-all")
    public ApiResponse<?> markAllAsRead() {
        notificationService.markAllAsRead(currentUserService.getCurrentUser().getId());
        return ApiResponse.ok("Marked all as read");
    }
}
