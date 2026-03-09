package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.DefenseRegistrationResponse;
import com.phenikaa.thesis.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface DefenseService {
    DefenseRegistrationResponse registerDefense(User user, MultipartFile report, MultipartFile sourceCode, MultipartFile slide, String note);
    DefenseRegistrationResponse getMyDefenseRegistration(User user);
    List<DefenseRegistrationResponse> getMyDefenseHistory(User user);
    List<DefenseRegistrationResponse> getAdvisingDefenses(User user);
    DefenseRegistrationResponse reviewDefense(UUID id, User user, String status, String comment);
}
