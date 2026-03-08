package com.phenikaa.thesis.organization.service;

import com.phenikaa.thesis.organization.dto.AcademicYearRequest;
import com.phenikaa.thesis.organization.entity.AcademicYear;

import java.util.List;
import java.util.UUID;

public interface AcademicYearService {
    List<AcademicYear> getAll();
    AcademicYear getById(UUID id);
    AcademicYear create(AcademicYearRequest req);
    AcademicYear update(UUID id, AcademicYearRequest req);
    void delete(UUID id);
}
