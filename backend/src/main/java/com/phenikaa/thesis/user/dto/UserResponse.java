package com.phenikaa.thesis.user.dto;

import com.phenikaa.thesis.user.entity.enums.UserRole;
import com.phenikaa.thesis.user.entity.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private java.util.Set<UserRole> roles;
    private UserStatus status;
    // Thông tin đơn vị/học thuật (nếu có)
    private String facultyName;
    private String majorName;
    private java.util.UUID facultyId;
    private java.util.UUID majorId;
}
