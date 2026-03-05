package com.phenikaa.thesis.batch.controller;

import com.phenikaa.thesis.batch.dto.ThesisBatchCreateRequest;
import com.phenikaa.thesis.batch.dto.ThesisBatchResponse;
import com.phenikaa.thesis.batch.dto.ThesisBatchUpdateRequest;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import com.phenikaa.thesis.batch.service.ThesisBatchService;
import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.config.SecurityRoles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/batches")
public class ThesisBatchController {

    private final ThesisBatchService thesisBatchService;

    public ThesisBatchController(ThesisBatchService thesisBatchService) {
        this.thesisBatchService = thesisBatchService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + SecurityRoles.ADMIN + "','" + SecurityRoles.TRAINING_DEPT + "')")
    public ResponseEntity<ApiResponse<ThesisBatchResponse>> create(
            @Valid @RequestBody ThesisBatchCreateRequest request) {
        ThesisBatchResponse resp = thesisBatchService.createBatch(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo đợt đồ án thành công", resp));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ThesisBatchResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(thesisBatchService.getBatch(id)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<org.springframework.data.domain.Page<ThesisBatchResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BatchStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = org.springframework.data.domain.Sort.by(
                sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                        ? org.springframework.data.domain.Sort.Direction.ASC
                        : org.springframework.data.domain.Sort.Direction.DESC,
                sortParts[0]);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);
        return ApiResponse.ok(thesisBatchService.listBatches(search, status, pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + SecurityRoles.ADMIN + "','" + SecurityRoles.TRAINING_DEPT + "')")
    public ResponseEntity<ApiResponse<ThesisBatchResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ThesisBatchUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.ok("Cập nhật đợt đồ án thành công", thesisBatchService.updateBatch(id, request)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('" + SecurityRoles.ADMIN + "','" + SecurityRoles.TRAINING_DEPT + "')")
    public ResponseEntity<ApiResponse<ThesisBatchResponse>> activate(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Kích hoạt đợt đồ án thành công", thesisBatchService.activateBatch(id)));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('" + SecurityRoles.ADMIN + "','" + SecurityRoles.TRAINING_DEPT + "')")
    public ResponseEntity<ApiResponse<ThesisBatchResponse>> close(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Đóng đợt đồ án thành công", thesisBatchService.closeBatch(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + SecurityRoles.ADMIN + "','" + SecurityRoles.TRAINING_DEPT + "')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        thesisBatchService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.ok("Xoá đợt đồ án thành công", null));
    }
}
