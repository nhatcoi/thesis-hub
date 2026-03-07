package com.phenikaa.thesis.user.dto;

import com.phenikaa.thesis.user.entity.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserCreateRequest {
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    private String externalId;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Tên không được để trống")
    private String firstName;

    @NotBlank(message = "Họ không được để trống")
    private String lastName;

    private String phone;

    @NotNull(message = "Vai trò không được để trống")
    private java.util.Set<UserRole> roles;

    // Student specific fields
    private String majorCode;
    private String cohort;
    private String className;

    // Lecturer specific fields
    private String facultyCode;
    private String managedMajorCode;
    private Integer maxStudentsPerBatch;
}
