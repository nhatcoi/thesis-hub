package com.phenikaa.thesis.user.controller;

import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.user.dto.UserCreateRequest;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<User> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = userService.createUser(request);
        return ApiResponse.ok("Tạo người dùng thành công", user);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINING_DEPT')")
    public ApiResponse<java.util.List<User>> getAllUsers() {
        return ApiResponse.ok(userService.getAllUsers());
    }
}
