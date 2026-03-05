package com.phenikaa.thesis.organization.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/majors")
@RequiredArgsConstructor
public class MajorController {
    private final MajorRepository majorRepository;

    @GetMapping
    public ApiResponse<List<com.phenikaa.thesis.organization.dto.MajorResponse>> getAll() {
        List<com.phenikaa.thesis.organization.dto.MajorResponse> responses = majorRepository.findAll().stream()
                .map(m -> com.phenikaa.thesis.organization.dto.MajorResponse.builder()
                        .id(m.getId())
                        .code(m.getCode())
                        .name(m.getName())
                        .facultyId(m.getFaculty() != null ? m.getFaculty().getId() : null)
                        .build())
                .toList();
        return ApiResponse.ok(responses);
    }
}
