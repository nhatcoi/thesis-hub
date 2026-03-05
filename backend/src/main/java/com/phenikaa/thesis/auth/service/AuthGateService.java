package com.phenikaa.thesis.auth.service;

import com.phenikaa.thesis.auth.dto.AuthCheckResponse;
import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.entity.enums.UserStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthGateService {

    public AuthCheckResponse check(Authentication auth, User localUser) {
        List<String> tokenRoles = extractTokenRoles(auth);

        if (localUser == null) {
            return AuthCheckResponse.deny(
                    "USER_NOT_IN_SYSTEM",
                    "Tài khoản không có trong hệ thống ĐATN",
                    tokenRoles);
        }

        if (localUser.getStatus() != UserStatus.ACTIVE) {
            return AuthCheckResponse.deny(
                    "USER_NOT_ACTIVE",
                    "Tài khoản đang bị khóa/không hoạt động",
                    tokenRoles);
        }

        if (localUser.getRoles() == null || localUser.getRoles().isEmpty()) {
            return AuthCheckResponse.deny(
                    "LOCAL_ROLE_MISSING",
                    "Tài khoản chưa được gán vai trò trong hệ thống",
                    tokenRoles);
        }

        List<String> localRoleNames = localUser.getRoles().stream()
                .map(role -> role.getCode().name())
                .toList();

        // Check if any local role is in token roles
        boolean hasMatch = localRoleNames.stream().anyMatch(tokenRoles::contains);
        if (!hasMatch) {
            return AuthCheckResponse.deny(
                    "ROLE_MISMATCH",
                    "Vai trò SSO không khớp với vai trò trong hệ thống",
                    tokenRoles);
        }

        // Return the first matching role as primary, or just join them
        String primaryRole = localRoleNames.get(0);
        return AuthCheckResponse.allow(localUser.getId(), primaryRole, tokenRoles);
    }

    private List<String> extractTokenRoles(Authentication auth) {
        if (auth == null)
            return List.of();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5).toUpperCase(Locale.ROOT))
                .distinct()
                .sorted()
                .toList();
    }
}
