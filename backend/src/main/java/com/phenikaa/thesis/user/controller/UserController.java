package com.phenikaa.thesis.user.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.dto.UserResponse;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINING_DEPT')")
    public ApiResponse<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = userService.createUser(request);
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .roles(user.getRoles().stream()
                        .map(r -> r.getCode())
                        .collect(java.util.stream.Collectors.toSet()))
                .status(user.getStatus())
                .build();
        return ApiResponse.ok("Tạo người dùng thành công", response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINING_DEPT')")
    public ApiResponse<Page<UserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) java.util.UUID facultyId,
            @RequestParam(required = false) java.util.UUID majorId,
            @PageableDefault(size = 50, sort = "username") Pageable pageable) {
        return ApiResponse.ok(userService.getUsers(search, role, facultyId, majorId, pageable));
    }
}
