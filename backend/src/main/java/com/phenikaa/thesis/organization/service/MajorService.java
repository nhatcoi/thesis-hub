package com.phenikaa.thesis.organization.service;

import com.phenikaa.thesis.organization.entity.Major;
import com.phenikaa.thesis.organization.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class MajorService {

    private final MajorRepository majorRepository;

    @Cacheable(value = "majors", key = "#code", unless = "#result == null")
    public Optional<Major> findByCode(String code) {
        log.debug("==> [DB Lookup] Fetching Major from database for code: {}", code);
        if (code == null || code.isBlank()) return Optional.empty();
        return majorRepository.findByCode(code);
    }
    
    public String getMajorName(String code) {
        return findByCode(code).map(Major::getName).orElse(null);
    }
}
