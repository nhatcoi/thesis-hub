package com.phenikaa.thesis.organization.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.organization.entity.Faculty;
import com.phenikaa.thesis.organization.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
@RequiredArgsConstructor
public class FacultyController {
    private final FacultyRepository facultyRepository;

    @GetMapping
    public ApiResponse<List<Faculty>> getAll() {
        return ApiResponse.ok(facultyRepository.findAll());
    }
}
