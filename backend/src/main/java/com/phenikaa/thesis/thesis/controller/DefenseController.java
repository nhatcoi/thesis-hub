package com.phenikaa.thesis.thesis.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.common.util.SecurityUtils;
import com.phenikaa.thesis.thesis.dto.DefenseRegistrationResponse;
import com.phenikaa.thesis.thesis.service.DefenseService;
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
@RequestMapping("/api/defense")
@RequiredArgsConstructor
public class DefenseController {

    private final DefenseService defenseService;
    private final SecurityUtils securityUtils;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<DefenseRegistrationResponse>> registerDefense(
            @RequestParam("report") MultipartFile report,
            @RequestParam("sourceCode") MultipartFile sourceCode,
            @RequestParam("slide") MultipartFile slide,
            @RequestParam(value = "note", required = false) String note) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(defenseService.registerDefense(user, report, sourceCode, slide, note)));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<DefenseRegistrationResponse>> getMyDefenseRegistration() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(defenseService.getMyDefenseRegistration(user)));
    }

    @GetMapping("/me/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<DefenseRegistrationResponse>>> getMyDefenseHistory() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(defenseService.getMyDefenseHistory(user)));
    }

    @GetMapping("/advising")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ResponseEntity<ApiResponse<List<DefenseRegistrationResponse>>> getAdvisingDefenses() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(defenseService.getAdvisingDefenses(user)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ResponseEntity<ApiResponse<DefenseRegistrationResponse>> reviewDefense(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(
                defenseService.reviewDefense(id, user, body.get("status"), body.get("comment"))));
    }
}
