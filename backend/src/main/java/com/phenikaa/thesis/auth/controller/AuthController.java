package com.phenikaa.thesis.auth.controller;

import com.phenikaa.thesis.auth.service.UserSyncService;
import com.phenikaa.thesis.common.dto.ApiResponse;
import com.phenikaa.thesis.user.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * Auth API: Angular gửi Bearer token → Backend validate (JWT hoặc opaque) → trả
 * user info.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserSyncService userSyncService;

    public AuthController(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> claims = extractClaims(auth);
        User localUser = userSyncService.syncFromClaims(claims);

        if (localUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Tài khoản không tồn tại trong hệ thống."));
        }

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("sub", claims.get("sub"));
        info.put("preferred_username", claims.get("preferred_username"));
        info.put("email", claims.get("email"));
        info.put("name", claims.get("name"));
        info.put("local_user_id", localUser.getId());
        info.put("local_role", localUser.getRole());
        info.put("roles", auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .sorted().toList());

        return ResponseEntity.ok(ApiResponse.ok(info));
    }

    @GetMapping("/userinfo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> userinfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> claims = extractClaims(auth);
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("sub", claims.get("sub"));
        info.put("email", claims.get("email"));
        info.put("name", claims.get("name"));
        info.put("roles", auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .sorted().toList());

        return ResponseEntity.ok(ApiResponse.ok(info));
    }

    private Map<String, Object> extractClaims(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt.getClaims();
        }
        if (principal instanceof OAuth2AuthenticatedPrincipal oauthPrincipal) {
            return oauthPrincipal.getAttributes();
        }
        return Collections.emptyMap();
    }
}
