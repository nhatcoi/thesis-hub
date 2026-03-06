package com.phenikaa.thesis.common.util;

import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Map<String, Object> claims = extractClaims(auth);
        String sub = (String) claims.get("sub");
        String email = (String) claims.get("email");
        String username = (String) claims.get("preferred_username");

        return userRepository.findByExternalId(sub)
                .or(() -> userRepository.findByEmail(email))
                .or(() -> userRepository.findByUsername(username))
                .orElse(null);
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
