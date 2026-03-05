package com.phenikaa.thesis.auth.service;

import com.phenikaa.thesis.user.entity.User;
import com.phenikaa.thesis.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Syncs user info from Zitadel token claims into the local users table.
 * Works with both JWT claims and opaque token introspection attributes.
 */
@Service
public class UserSyncService {

    private final UserRepository userRepository;

    public UserSyncService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User syncFromClaims(Map<String, Object> claims) {
        String sub = str(claims, "sub");
        String email = str(claims, "email");
        final String givenName = str(claims, "given_name") != null ? str(claims, "given_name") : "";
        final String familyName = str(claims, "family_name") != null ? str(claims, "family_name") : "";
        final String username = str(claims, "preferred_username") != null
                ? str(claims, "preferred_username")
                : email;

        User user = userRepository.findByExternalId(sub)
                .or(() -> userRepository.findByEmail(email))
                .or(() -> userRepository.findByUsername(username))
                .orElse(null);

        if (user == null) {
            return null; // Let the caller decide how to handle missing user (e.g. blocking login)
        }

        if (user.getExternalId() == null) {
            user.setExternalId(sub);
        }
        user.setFirstName(givenName);
        user.setLastName(familyName);
        user.setLastLoginAt(OffsetDateTime.now());

        return userRepository.save(user);
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }
}
