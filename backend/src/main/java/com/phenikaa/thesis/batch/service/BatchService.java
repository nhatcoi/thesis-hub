package com.phenikaa.thesis.batch.service;

import com.phenikaa.thesis.batch.entity.ThesisBatch;
import com.phenikaa.thesis.batch.repository.ThesisBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final ThesisBatchRepository batchRepository;

    @Cacheable(value = "batches", key = "#id", unless = "#result == null")
    public Optional<ThesisBatch> findById(UUID id) {
        return batchRepository.findById(id);
    }
}
