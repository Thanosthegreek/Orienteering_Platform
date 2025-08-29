// src/main/java/com/orienteering/config/JwtAuthFilter.java
package com.orienteering.config;

import com.orienteering.config.JwtService; // adjust import if your JwtService is elsewhere
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    // explicit constructor instead of @RequiredArgsConstructor
    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                String email = jwtService.extractUsername(token);   // "sub"
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // If you stored a role claim in the token, you can pull it too:
                    String role = null;
                    try { role = jwtService.extractRole(token); } catch (Exception ignored) {}

                    List<GrantedAuthority> authorities =
                            (role == null) ? Collections.emptyList()
                                    : List.of(new SimpleGrantedAuthority("ROLE_" + role));

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(email, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException ex) {
                // Invalid/expired token -> leave context empty; downstream will 401/403 as configured
            }
        }

        filterChain.doFilter(request, response);
    }
}
