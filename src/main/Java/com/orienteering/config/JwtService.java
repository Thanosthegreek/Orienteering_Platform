package com.orienteering.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final Key key;
    private final long ttlMs;

    public JwtService(
            @Value("${app.jwt.secret:change-me-please-change-me-32-bytes-min}") String secret,
            @Value("${app.jwt.ttl-ms:86400000}") long ttlMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttlMs = ttlMs;
    }

    /** Existing method: token with just subject (email). */
    public String generateToken(String subjectEmail) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subjectEmail)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Optional: token including a role claim. */
    public String generateToken(String subjectEmail, String role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subjectEmail)
                .claim("role", role)               // <--- role claim
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + ttlMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Extract the subject (email). */
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /** NEW: Extract the role claim (returns null if missing/invalid). */
    public String extractRole(String token) {
        try {
            return parseClaims(token).get("role", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    /** Basic validation against an expected email. */
    public boolean isValid(String token, String expectedEmail) {
        try {
            Claims claims = parseClaims(token);
            return expectedEmail.equals(claims.getSubject())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException e) {
            return false;
        }
    }

    // ---- helpers ----
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
