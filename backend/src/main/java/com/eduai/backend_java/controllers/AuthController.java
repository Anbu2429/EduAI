package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.User;
import com.eduai.backend_java.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String role = credentials.get("role");

        // 1. Hardcoded Admin Credentials
        if ("admin".equals(username) && "admin@1".equals(password) && "Admin".equals(role)) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        // 2. Database Check for Teachers and Students
        User user = userRepository.findByUsernameAndPasswordAndRole(username, password, role);
        if (user != null) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        // 3. Failed Login
        return ResponseEntity.status(401).body(Map.of("error", "Invalid username, password, or role"));
    }

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        try {
            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Account created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Username already exists or database error."));
        }
    }
}