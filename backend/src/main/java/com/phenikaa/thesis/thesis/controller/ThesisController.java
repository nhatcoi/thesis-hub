package com.phenikaa.thesis.thesis.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.thesis.service.ThesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/theses")
@RequiredArgsConstructor
public class ThesisController {

    private final ThesisService thesisService;
    private final com.phenikaa.thesis.common.util.SecurityUtils securityUtils;

    @GetMapping("/advising")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LECTURER', 'DEPT_HEAD')")
    public ApiResponse<java.util.List<ThesisResponse>> getAdvisingTheses() {
        com.phenikaa.thesis.user.entity.User user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Bạn cần đăng nhập để thực hiện thao tác này");
        }
        return ApiResponse.ok(thesisService.getAdvisingTheses(user));
    }

    @GetMapping
    public ApiResponse<Page<ThesisResponse>> getTheses(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) String majorCode,
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) ThesisStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean showAll,
            @RequestParam(defaultValue = "false") boolean unassignedOnly,
            Pageable pageable) {
        if (unassignedOnly) {
            return ApiResponse.ok(thesisService.getUnassignedStudents(batchId, majorCode, facultyId, search, pageable));
        }
        if (showAll) {
            return ApiResponse.ok(
                    thesisService.getStudentThesisOverviews(batchId, majorCode, facultyId, status, search, pageable));
        }
        return ApiResponse.ok(thesisService.getTheses(batchId, majorCode, facultyId, status, search, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ThesisResponse> getThesisById(@PathVariable UUID id) {
        return ApiResponse.ok(thesisService.getThesisById(id));
    }

    @PostMapping("/assign")
    public ApiResponse<Void> assignStudents(@RequestBody com.phenikaa.thesis.thesis.dto.ThesisAssignRequest request) {
        thesisService.assignStudentsToBatch(request);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteThesis(@PathVariable UUID id) {
        thesisService.deleteThesis(id);
        return ApiResponse.ok();
    }
}
