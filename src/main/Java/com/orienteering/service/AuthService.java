package com.orienteering.service;

import com.orienteering.domain.Role;
import com.orienteering.domain.User;
import com.orienteering.dto.AuthRes;
import com.orienteering.dto.LoginReq;
import com.orienteering.dto.RegisterReq;
import com.orienteering.repo.UserRepo;
import com.orienteering.config.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

import static org.springframework.http.HttpStatus.*;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthService(UserRepo userRepo, PasswordEncoder encoder, JwtService jwtService, AuthenticationManager authManager) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.authManager = authManager;
    }

    @Transactional
    public AuthRes register(RegisterReq req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Email already in use");
        }
        Role role = parseRole(req.getRole());

        User u = new User();
        // IMPORTANT: username required by your DB; using email as username
        u.setUsername(req.getEmail());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(role);
        userRepo.save(u);

        String token = jwtService.generateToken(u.getEmail());
        return new AuthRes(token, u.getEmail(), u.getRole().name());
    }

    public AuthRes login(LoginReq req) {
        // authenticate (will check password via PasswordEncoder)
        var authToken = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        authManager.authenticate(authToken);

        // on success issue JWT
        var user = userRepo.findByEmail(req.getEmail()).orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
        String token = jwtService.generateToken(user.getEmail());
        return new AuthRes(token, user.getEmail(), user.getRole().name());
    }

    private Role parseRole(String value) {
        try { return Role.valueOf(value.toUpperCase(Locale.ROOT)); }
        catch (Exception e) { throw new ResponseStatusException(BAD_REQUEST, "role must be USER or ADMIN"); }
    }
}
