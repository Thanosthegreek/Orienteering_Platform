// src/main/java/com/orienteering/web/AuthController.java
package com.orienteering.web;

import com.orienteering.dto.AuthRes;
import com.orienteering.dto.LoginReq;
import com.orienteering.dto.RegisterReq;
import com.orienteering.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/login")
    public ResponseEntity<AuthRes> login(@RequestBody LoginReq req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthRes> register(@RequestBody RegisterReq req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }
        return ResponseEntity.ok(Map.of("email", auth.getName()));
    }
}
