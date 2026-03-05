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

    @GetMapping
    public ApiResponse<Page<ThesisResponse>> getTheses(
            @RequestParam(required = false) UUID batchId,
            @RequestParam(required = false) UUID majorId,
            @RequestParam(required = false) UUID facultyId,
            @RequestParam(required = false) ThesisStatus status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ApiResponse.ok(thesisService.getTheses(batchId, majorId, facultyId, status, search, pageable));
    }
}
