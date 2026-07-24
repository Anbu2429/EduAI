package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.User;
import com.eduai.backend_java.repositories.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ================================
    // LOGIN (RESTORED ORIGINAL LOGIC + SESSIONS)
    // ================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> credentials, HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String role = credentials.get("role");

        // 💡 RESTORED: ADMIN LOGIN BYPASS
        if ("admin".equals(username) && "admin@1".equals(password) && "Admin".equals(role)) {
            // Create Session
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", 0L);
            session.setAttribute("role", role);

            // Return full data for React state
            return ResponseEntity.ok(
                Map.of(
                    "status", "success",
                    "id", 0,
                    "username", username,
                    "role", role
                )
            );
        }

        User user = userRepository.findByUsernameAndPasswordAndRole(username, password, role);

        if (user != null) {
            // Create Session for database user
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", user.getId());
            session.setAttribute("role", user.getRole());

            // 💡 RESTORED: Return full data for React state
            return ResponseEntity.ok(
                Map.of(
                    "status", "success",
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "role", user.getRole()
                )
            );
        }

        return ResponseEntity
                .status(401)
                .body(Map.of("error", "Invalid credentials"));
    }

    // ================================
    // GET CURRENT USER (READS SESSION)
    // ================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No active session. Please log in."));
        }

        Long userId = (Long) session.getAttribute("userId");
        
        // Handle Admin "me" check
        if (userId == 0L) {
             return ResponseEntity.ok(Map.of(
                "id", 0,
                "username", "admin",
                "role", "Admin"
            ));
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "role", user.getRole()
        ));
    }

    // ================================
    // CHANGE PASSWORD (FOR LOGGED-IN USERS)
    // ================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, HttpServletRequest request) {
        // 1. Check if user is logged in
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please log in first."));
        }

        Long userId = (Long) session.getAttribute("userId");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password cannot be empty."));
        }

        // 2. Find the user in the database
        User user = userRepository.findById(userId).orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found."));
        }

        // 3. Update password and save
        user.setPassword(newPassword.trim());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "status", "success", 
            "message", "Password updated successfully!"
        ));
    }

    // ================================
    // LOGOUT (DESTROYS SESSION)
    // ================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); 
        }
        return ResponseEntity.ok(Map.of("status", "success", "message", "Logged out"));
    }

    // ================================
    // CREATE USER
    // ================================
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        try {
            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Account created"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
    }

    // ================================
    // GET USERS BY ROLE
    // ================================
    @GetMapping("/users/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    // ================================
    // DELETE USER
    // ================================
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Deleted successfully"));
    }

    // ================================
    // UPDATE USER
    // ================================
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setUsername(updatedUser.getUsername());
                    if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                        user.setPassword(updatedUser.getPassword());
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("status", "success"));
                })
                .orElse(ResponseEntity.status(404).body((Map) Map.of("error", "User not found")));
    }

    // ================================
    // SMART BULK UPLOAD (FIXES GHOST USERS & DUPLICATES)
    // ================================
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        List<Map<String,String>> logs = new ArrayList<>();
        int count = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            
            // 💡 Fetch all existing users so we can update broken ones instead of crashing
            List<User> existingUsers = userRepository.findAll();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header row

                // Read columns safely
                String col0 = formatter.formatCellValue(row.getCell(0)).trim(); // Expected: Role
                String col1 = formatter.formatCellValue(row.getCell(1)).trim(); // Expected: Username
                String col2 = formatter.formatCellValue(row.getCell(2)).trim(); // Expected: Password

                String role = "Student"; // 💡 Default fallback if they forget the role
                String username = "";
                String password = col2;

                // Handle cases where the user accidentally puts Usernames in Column A
                if (col1.isEmpty() && !col0.isEmpty()) {
                    username = col0; 
                } else if (!col1.isEmpty()) {
                    username = col1;
                    if (!col0.isEmpty()) role = col0;
                }

                if (username.isEmpty()) continue;

                // Auto-generate password if left blank in Excel
                if (password.isEmpty()) {
                    password = "EduAI@" + ((int) (Math.random() * 9000) + 1000);
                }

                // Force exact casing for Roles so React can read them
                if (role.equalsIgnoreCase("teacher")) role = "Teacher";
                else if (role.equalsIgnoreCase("admin")) role = "Admin";
                else role = "Student";

                try {
                    final String searchUsername = username;
                    
                    // 💡 THE FIX: Check if user exists. If yes, update them. If no, create new.
                    User userToSave = existingUsers.stream()
                            .filter(u -> u.getUsername().equalsIgnoreCase(searchUsername))
                            .findFirst()
                            .orElse(new User());

                    userToSave.setRole(role);
                    userToSave.setUsername(username);
                    userToSave.setPassword(password);

                    userRepository.save(userToSave); 
                    count++;

                    logs.add(Map.of(
                        "username", username, 
                        "password", password, 
                        "status", "Success"
                    ));
                } catch (Exception e) {
                    System.out.println("❌ FAILED TO SAVE USER: " + username);
                    logs.add(Map.of(
                        "username", username, 
                        "status", "Failed - Database Error"
                    ));
                }
            }

            return ResponseEntity.ok(
                Map.of("status", "success", "count", count, "data", logs)
            );

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Invalid Excel file format. Please use the template."));
        }
    }
}