package com.phenikaa.thesis.thesis.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.common.util.SecurityUtils;
import com.phenikaa.thesis.thesis.dto.OutlineResponse;
import com.phenikaa.thesis.thesis.service.OutlineService;
import com.phenikaa.thesis.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/outlines")
@RequiredArgsConstructor
public class OutlineController {

    private final OutlineService outlineService;
    private final SecurityUtils securityUtils;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<OutlineResponse>> submitOutline(
            @RequestParam("file") MultipartFile file) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(outlineService.submitOutline(user, file)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<OutlineResponse>>> getMyOutlines() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(outlineService.getMyOutlines(user)));
    }

    @GetMapping("/advising")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ResponseEntity<ApiResponse<List<OutlineResponse>>> getAdvisingOutlines() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(outlineService.getAdvisingOutlines(user)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ResponseEntity<ApiResponse<OutlineResponse>> reviewOutline(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(
                outlineService.reviewOutline(id, user, body.get("status"), body.get("comment"))));
    }
}
