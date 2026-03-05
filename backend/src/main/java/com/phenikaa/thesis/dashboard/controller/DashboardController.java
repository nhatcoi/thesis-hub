package com.phenikaa.thesis.dashboard.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.dashboard.dto.DashboardStatsResponse;
import com.phenikaa.thesis.dashboard.service.DashboardService;
import com.phenikaa.thesis.auth.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final CurrentUserService currentUserService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        return ApiResponse.ok(dashboardService.getStats(currentUserService.getCurrentUser()));
    }
}
