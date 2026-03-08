package com.phenikaa.thesis.thesis.service;

import com.phenikaa.thesis.thesis.dto.OutlineResponse;
import com.phenikaa.thesis.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface OutlineService {
    OutlineResponse submitOutline(User user, MultipartFile file);
    List<OutlineResponse> getMyOutlines(User user);
    List<OutlineResponse> getAdvisingOutlines(User user);
    OutlineResponse reviewOutline(UUID outlineId, User user, String status, String comment);
}
