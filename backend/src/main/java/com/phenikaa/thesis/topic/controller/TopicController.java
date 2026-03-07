package com.phenikaa.thesis.topic.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.common.util.SecurityUtils;
import com.phenikaa.thesis.topic.dto.TopicDetailResponse;
import com.phenikaa.thesis.topic.dto.TopicRequest;
import com.phenikaa.thesis.topic.dto.TopicResponse;
import com.phenikaa.thesis.topic.service.TopicService;
import com.phenikaa.thesis.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.phenikaa.thesis.topic.entity.enums.TopicStatus;

import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final SecurityUtils securityUtils;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ApiResponse<Page<TopicResponse>> getMyTopics(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) TopicStatus status,
            @RequestParam(required = false) String majorCode,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.getMyTopics(user, batchId, status, majorCode, search, pageable));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('STUDENT')")
    public ApiResponse<List<TopicResponse>> getAvailableTopics(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) String search) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.getAvailableTopics(user, batchId, search));
    }

    @GetMapping("/{id}")
    public ApiResponse<TopicResponse> getTopicById(@PathVariable UUID id) {
        return ApiResponse.ok(topicService.getTopicById(id));
    }

    @GetMapping("/{id}/detail")
    public ApiResponse<TopicDetailResponse> getTopicDetail(@PathVariable UUID id) {
        return ApiResponse.ok(topicService.getTopicDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TopicResponse> createTopic(@Valid @RequestBody TopicRequest request) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.createTopic(user, request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ApiResponse<TopicResponse> updateTopic(
            @PathVariable UUID id,
            @Valid @RequestBody TopicRequest request) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.updateTopic(id, user, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(@PathVariable UUID id) {
        User user = getCurrentUser();
        topicService.deleteTopic(id, user);
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ApiResponse<TopicResponse> closeTopic(@PathVariable UUID id) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.closeTopic(id, user));
    }

    @PatchMapping("/{id}/reopen")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ApiResponse<TopicResponse> reopenTopic(@PathVariable UUID id) {
        User user = getCurrentUser();
        return ApiResponse.ok(topicService.reopenTopic(id, user));
    }

    private User getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new AccessDeniedException("User not found in system");
        }
        return user;
    }
}
