package com.phenikaa.thesis.auth.service;

import com.phenikaa.thesis.user.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CurrentUserService {

    private final UserSyncService userSyncService;

    public CurrentUserService(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in security context");
        }

        Object principal = auth.getPrincipal();

        if (principal instanceof Jwt jwt) {
            return userSyncService.syncFromClaims(jwt.getClaims());
        }
        if (principal instanceof OAuth2AuthenticatedPrincipal oauthPrincipal) {
            return userSyncService.syncFromClaims(oauthPrincipal.getAttributes());
        }

        throw new IllegalStateException("Unsupported principal type: " + principal.getClass());
    }

    public Map<String, Object> getCurrentClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in security context");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof Jwt jwt) return jwt.getClaims();
        if (principal instanceof OAuth2AuthenticatedPrincipal p) return p.getAttributes();
        throw new IllegalStateException("Unsupported principal type");
    }
}
