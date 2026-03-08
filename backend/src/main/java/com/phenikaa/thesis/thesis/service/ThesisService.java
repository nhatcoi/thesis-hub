package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.ThesisAssignRequest;
import com.phenikaa.thesis.thesis.dto.ThesisResponse;
import com.phenikaa.thesis.thesis.entity.enums.ThesisStatus;
import com.phenikaa.thesis.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ThesisService {
    Page<ThesisResponse> getStudentThesisOverviews(UUID batchId, String majorCode, UUID facultyId, ThesisStatus status, String search, Pageable pageable);
    Page<ThesisResponse> getUnassignedStudents(UUID batchId, String majorCode, UUID facultyId, String search, Pageable pageable);
    Page<ThesisResponse> getTheses(UUID batchId, String majorCode, UUID facultyId, ThesisStatus status, String search, Pageable pageable);
    ThesisResponse getThesisById(UUID id);
    void assignStudentsToBatch(ThesisAssignRequest request);
    void deleteThesis(UUID id);
    List<ThesisResponse> getAdvisingTheses(User user);
    Map<String, Object> getMyActiveBatch(User user);
}
