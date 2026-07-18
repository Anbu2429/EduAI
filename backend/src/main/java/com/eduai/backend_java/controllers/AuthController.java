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

    // 1. Endpoint for Logging In
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String role = credentials.get("role");

        // Hardcoded Master Admin Account
        if ("admin".equals(username) && "admin@1".equals(password) && "Admin".equals(role)) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        // Database Check for Teachers and Students
        User user = userRepository.findByUsernameAndPasswordAndRole(username, password, role);
        if (user != null) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials or wrong role selected."));
    }

    // 2. Endpoint for Admin to Create New Users
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        try {
            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Account for " + newUser.getUsername() + " created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Username already exists in the database."));
        }
    }
    // --- NEW ADMIN CRUD ENDPOINTS ---

    // 1. GET: Fetch all users by role
    @GetMapping("/users/{role}")
    public ResponseEntity<java.util.List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    // 2. DELETE: Remove a user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "success", "message", "User deleted successfully."));
    }

    // 3. PUT: Edit a user's username or password
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            
            // Only update the password if the admin typed a new one
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());
            }
            
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("status", "success", "message", "User updated successfully."));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found.")));
    }
}