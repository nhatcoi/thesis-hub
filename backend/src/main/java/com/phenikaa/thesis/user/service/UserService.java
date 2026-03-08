package com.phenikaa.thesis.user.service;

import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.dto.UserResponse;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {
    UserResponse getById(UUID id);
    Page<UserResponse> getUsers(String search, UserRole role, UUID facultyId, String majorCode, Pageable pageable);
    User createUser(UserCreateRequest request);
}
