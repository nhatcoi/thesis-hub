package com.phenikaa.thesis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.authentication.OpaqueTokenAuthenticationProvider;
import org.springframework.security.oauth2.server.resource.introspection.NimbusOpaqueTokenIntrospector;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    static final String ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

    private final CorsConfigurationSource corsConfigurationSource;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${zitadel.introspection.client-id}")
    private String introspectionClientId;

    @Value("${zitadel.introspection.client-secret}")
    private String introspectionClientSecret;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
        this.corsConfigurationSource = corsConfigurationSource;
    }

    private static final String[] PUBLIC_PATHS = {
            "/actuator/health",
            "/actuator/info",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/ws/**",
            "/uploads/**",
            "/error"
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationManagerResolver(tokenAuthManagerResolver()));
        return http.build();
    }

    /**
     * Supports both JWT and opaque tokens:
     * - Token has dots (xxx.yyy.zzz) → validate as JWT locally via JWKS
     * - Token is opaque → validate via Zitadel introspection endpoint
     */
    @Bean
    public AuthenticationManagerResolver<HttpServletRequest> tokenAuthManagerResolver() {
        AuthenticationManager jwtAuth = jwtAuthManager();
        AuthenticationManager opaqueAuth = opaqueAuthManager();

        return request -> {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                long dotCount = token.chars().filter(c -> c == '.').count();
                if (dotCount == 2) {
                    return jwtAuth;
                }
            }
            return opaqueAuth;
        };
    }

    private AuthenticationManager jwtAuthManager() {
        JwtDecoder decoder = JwtDecoders.fromIssuerLocation(issuerUri);
        JwtAuthenticationProvider provider = new JwtAuthenticationProvider(decoder);

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> extractAuthorities(jwt.getClaimAsMap(ROLES_CLAIM)));
        provider.setJwtAuthenticationConverter(converter);

        return new ProviderManager(provider);
    }

    private AuthenticationManager opaqueAuthManager() {
        String introspectUri = issuerUri + "/oauth/v2/introspect";
        NimbusOpaqueTokenIntrospector delegate = new NimbusOpaqueTokenIntrospector(
                introspectUri, introspectionClientId, introspectionClientSecret);

        OpaqueTokenIntrospector withRoles = token -> {
            OAuth2AuthenticatedPrincipal p = delegate.introspect(token);
            Collection<GrantedAuthority> authorities = extractAuthorities(p.getAttribute(ROLES_CLAIM));
            return new DefaultOAuth2AuthenticatedPrincipal(
                    p.getName(), p.getAttributes(), authorities);
        };

        return new ProviderManager(new OpaqueTokenAuthenticationProvider(withRoles));
    }

    @SuppressWarnings("unchecked")
    private static Collection<GrantedAuthority> extractAuthorities(Object rolesObj) {
        if (!(rolesObj instanceof Map<?, ?> roles) || roles.isEmpty()) {
            return Collections.emptyList();
        }
        return roles.keySet().stream()
                .map(k -> new SimpleGrantedAuthority("ROLE_" + k.toString().toUpperCase()))
                .collect(Collectors.toList());
    }
}
