package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.User;
import com.eduai.backend_java.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- 1. LOGIN ENDPOINT ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String role = credentials.get("role");

        if ("admin".equals(username) && "admin@1".equals(password) && "Admin".equals(role)) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        User user = userRepository.findByUsernameAndPasswordAndRole(username, password, role);
        if (user != null) {
            return ResponseEntity.ok(Map.of("status", "success", "username", username, "role", role));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials or wrong role selected."));
    }

    // --- 2. CREATE SINGLE USER ---
    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        try {
            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Account for " + newUser.getUsername() + " created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Username already exists."));
        }
    }

    // --- 3. GET USERS BY ROLE ---
    @GetMapping("/users/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    // --- 4. DELETE USER ---
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "success", "message", "User deleted successfully."));
    }

    // --- 5. UPDATE USER ---
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(updatedUser.getPassword());
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("status", "success", "message", "User updated successfully."));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "User not found.")));
    }

    // --- 6. BULK UPLOAD & AUTO-CREDENTIAL LOGIC ---
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        List<Map<String, String>> credentialsLog = new ArrayList<>();
        int count = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip the header row (Row 0)

                String role = formatter.formatCellValue(row.getCell(0)).trim();
                String username = formatter.formatCellValue(row.getCell(1)).trim();
                String password = formatter.formatCellValue(row.getCell(2)).trim();

                // Skip completely empty rows
                if (username.isEmpty() || role.isEmpty()) continue;

                // AUTO-CREDENTIAL LOGIC: If password is empty, generate a random one
                if (password.isEmpty()) {
                    int randomPin = (int) ((Math.random() * 9000) + 1000); // Generates 1000 - 9999
                    password = "EduAI@" + randomPin;
                }

                try {
                    User newUser = new User();
                    newUser.setRole(role);
                    newUser.setUsername(username);
                    newUser.setPassword(password);
                    userRepository.save(newUser);
                    count++;

                    // Add to our log of successful creations
                    credentialsLog.add(Map.of(
                            "Role", role,
                            "Username", username,
                            "Password", password,
                            "Status", "Success"
                    ));
                } catch (Exception e) {
                    // If username already exists, log the failure
                    credentialsLog.add(Map.of(
                            "Role", role,
                            "Username", username,
                            "Password", "N/A",
                            "Status", "Failed - Username Already Exists"
                    ));
                }
            }
            
            // Return the count and the full log of generated credentials back to React
            return ResponseEntity.ok(Map.of(
                    "status", "success", 
                    "message", count + " accounts successfully processed!",
                    "data", credentialsLog
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", "Error processing file. Make sure it is a valid .xlsx file."));
        }
    }
}