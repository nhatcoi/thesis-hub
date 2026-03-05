package com.phenikaa.thesis.audit.controller;

import com.phenikaa.thesis.audit.dto.AuditLogResponse;
import com.phenikaa.thesis.audit.service.AuditLogService;
import com.phenikaa.thesis.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/me")
    public ApiResponse<List<AuditLogResponse>> getMyHistory() {
        return ApiResponse.ok(auditLogService.getMyHistory());
    }

    @GetMapping("/global")
    public ApiResponse<List<AuditLogResponse>> getGlobalHistory() {
        // Lấy lịch sử toàn hệ thống
        return ApiResponse.ok(auditLogService.getGlobalHistory());
    }
}
