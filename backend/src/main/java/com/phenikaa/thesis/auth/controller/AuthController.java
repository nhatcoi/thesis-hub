package com.phenikaa.thesis.auth.controller;

import com.phenikaa.thesis.auth.dto.AuthCheckResponse;
import com.phenikaa.thesis.auth.service.AuthGateService;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserSyncService userSyncService;
    private final AuthGateService authGateService;
    private final com.phenikaa.thesis.user.service.UserService userService;

    public AuthController(UserSyncService userSyncService, AuthGateService authGateService,
            com.phenikaa.thesis.user.service.UserService userService) {
        this.userSyncService = userSyncService;
        this.authGateService = authGateService;
        this.userService = userService;
    }

    // Check điều kiện "được vào hệ thống" (không auto-create user)
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<AuthCheckResponse>> check() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> claims = extractClaims(auth);
        User localUser = userSyncService.syncFromClaims(claims); // chỉ update lastLoginAt nếu có
        AuthCheckResponse result = authGateService.check(auth, localUser);

        if (!result.allowed()) {
            return ResponseEntity.status(403).body(ApiResponse.ok(result));
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> claims = extractClaims(auth);
        User localUser = userSyncService.syncFromClaims(claims);
        AuthCheckResponse gate = authGateService.check(auth, localUser);
        if (!gate.allowed()) {
            return ResponseEntity.status(403).body(ApiResponse.error(gate.message()));
        }

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("sub", claims.get("sub"));
        info.put("preferred_username", claims.get("preferred_username"));
        info.put("email", claims.get("email"));
        info.put("name", claims.get("name"));
        info.put("local_user_id", localUser.getId());

        com.phenikaa.thesis.user.dto.UserResponse userDetails = userService.getById(localUser.getId());

        info.put("local_roles", userDetails.getRoles().stream()
                .map(Enum::name)
                .collect(java.util.stream.Collectors.toList()));
        info.put("facultyId", userDetails.getFacultyId());
        info.put("facultyName", userDetails.getFacultyName());
        info.put("majorId", userDetails.getMajorId());
        info.put("majorName", userDetails.getMajorName());
        info.put("managedMajorId", userDetails.getManagedMajorId());
        info.put("managedMajorName", userDetails.getManagedMajorName());
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
