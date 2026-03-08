package com.phenikaa.thesis.batch.service;

import com.phenikaa.thesis.batch.dto.ThesisBatchCreateRequest;
import com.phenikaa.thesis.batch.dto.ThesisBatchResponse;
import com.phenikaa.thesis.batch.dto.ThesisBatchUpdateRequest;
import com.phenikaa.thesis.batch.entity.enums.BatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ThesisBatchService {
    ThesisBatchResponse createBatch(ThesisBatchCreateRequest req);
    ThesisBatchResponse getBatch(UUID id);
    Page<ThesisBatchResponse> listBatches(String search, BatchStatus status, Pageable pageable);
    ThesisBatchResponse updateBatch(UUID id, ThesisBatchUpdateRequest req);
    ThesisBatchResponse activateBatch(UUID id);
    ThesisBatchResponse closeBatch(UUID id);
    void deleteBatch(UUID id);
}
