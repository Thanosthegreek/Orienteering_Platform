// src/main/java/com/orienteering/config/JwtAuthFilter.java
package com.orienteering.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        // Allow preflight through
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        // Only bypass JWT processing for login/register.
        if ("/api/auth/login".equals(uri) || "/api/auth/register".equals(uri)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            boolean valid = (username != null) && jwtService.isValid(token, username);

            if (valid && SecurityContextHolder.getContext().getAuthentication() == null) {
                String role = jwtService.extractRole(token); // may be null
                List<SimpleGrantedAuthority> auths = (role != null && !role.isBlank())
                        ? List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        : Collections.emptyList();

                var principal = User.withUsername(username)
                        .password("") // unused
                        .authorities(auths)
                        .build();

                var auth = new UsernamePasswordAuthenticationToken(principal, null, auths);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ignored) {
            // swallow; protected endpoints will still 401/403 as needed
        }

        chain.doFilter(request, response);
    }
}
