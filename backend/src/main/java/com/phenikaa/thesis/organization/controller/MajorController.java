package com.phenikaa.thesis.organization.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.organization.entity.Major;
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
    public ApiResponse<List<Major>> getAll() {
        return ApiResponse.ok(majorRepository.findAll());
    }
}
