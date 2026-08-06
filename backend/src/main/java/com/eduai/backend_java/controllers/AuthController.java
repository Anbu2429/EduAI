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
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // ================================
    // LOGIN (Returns Department Routing Data)
    // ================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> credentials, HttpServletRequest request) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        String role = credentials.get("role");

        if ("admin".equals(username) && "admin@1".equals(password) && "Admin".equals(role)) {
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", 0L);
            session.setAttribute("role", role);

            return ResponseEntity.ok(
                Map.of("status", "success", "id", 0, "username", username, "role", role)
            );
        }

        User user = userRepository.findByUsernameAndPasswordAndRole(username, password, role);

        if (user != null) {
            HttpSession session = request.getSession(true);
            session.setAttribute("userId", user.getId());
            session.setAttribute("role", user.getRole());

            // Send full routing details to frontend
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("department", user.getDepartment() != null ? user.getDepartment() : "");
            response.put("year", user.getYear() != null ? user.getYear() : "");
            response.put("classSection", user.getClassSection() != null ? user.getClassSection() : "");

            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }

    // ================================
    // GET CURRENT USER (Returns Department Routing Data)
    // ================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No active session. Please log in."));
        }

        Long userId = (Long) session.getAttribute("userId");
        
        if (userId == 0L) {
             return ResponseEntity.ok(Map.of("id", 0, "username", "admin", "role", "Admin"));
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("department", user.getDepartment() != null ? user.getDepartment() : "");
        response.put("year", user.getYear() != null ? user.getYear() : "");
        response.put("classSection", user.getClassSection() != null ? user.getClassSection() : "");

        return ResponseEntity.ok(response);
    }

    // ================================
    // SMART CLASS ROSTER FOR TEACHER ATTENDANCE
    // ================================
    @GetMapping("/class-roster")
    public ResponseEntity<?> getClassRoster(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not logged in"));
        }

        Long userId = (Long) session.getAttribute("userId");
        User teacher = userRepository.findById(userId).orElse(null);

        if (teacher == null || !"Teacher".equals(teacher.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only teachers can access class rosters"));
        }

        // Get all students and filter them based on the Teacher's assigned department
        List<User> allStudents = userRepository.findByRole("Student");
        List<User> myStudents = new ArrayList<>();

        for (User student : allStudents) {
            // Check if department matches (or if teacher is assigned to "All")
            boolean matchDept = teacher.getDepartment() == null || teacher.getDepartment().isEmpty() 
                    || teacher.getDepartment().equalsIgnoreCase("All") 
                    || teacher.getDepartment().equalsIgnoreCase(student.getDepartment());

            // Check if year matches (or if teacher is assigned to "All Years")
            boolean matchYear = teacher.getYear() == null || teacher.getYear().isEmpty() 
                    || teacher.getYear().equalsIgnoreCase("All") || teacher.getYear().equalsIgnoreCase("All Years") 
                    || teacher.getYear().equalsIgnoreCase(student.getYear());

            // Check if section matches (or if teacher is assigned to "All")
            boolean matchClass = teacher.getClassSection() == null || teacher.getClassSection().isEmpty() 
                    || teacher.getClassSection().equalsIgnoreCase("All") 
                    || teacher.getClassSection().equalsIgnoreCase(student.getClassSection());

            if (matchDept && matchYear && matchClass) {
                myStudents.add(student);
            }
        }

        return ResponseEntity.ok(myStudents);
    }

    // ================================
    // CHANGE PASSWORD
    // ================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Please log in first."));
        }

        Long userId = (Long) session.getAttribute("userId");
        String newPassword = body.get("newPassword");

        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password cannot be empty."));
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found."));
        }

        user.setPassword(newPassword.trim());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Password updated successfully!"));
    }

    // ================================
    // LOGOUT
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
                    if (updatedUser.getDepartment() != null) user.setDepartment(updatedUser.getDepartment());
                    if (updatedUser.getYear() != null) user.setYear(updatedUser.getYear());
                    if (updatedUser.getClassSection() != null) user.setClassSection(updatedUser.getClassSection());
                    
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("status", "success"));
                })
                .orElse(ResponseEntity.status(404).body((Map) Map.of("error", "User not found")));
    }

    // ================================
    // SMART BULK UPLOAD (MAPPED TO 5 COLUMNS EXACTLY)
    // ================================
    @PostMapping("/bulk-upload")
    public ResponseEntity<?> bulkUploadUsers(@RequestParam("file") MultipartFile file) {
        List<Map<String,String>> logs = new ArrayList<>();
        int count = 0;

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();
            
            List<User> existingUsers = userRepository.findAll();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header row

                // READ EXACTLY 5 COLUMNS BASED ON YOUR EXCEL FILE (No Password column)
                String role = formatter.formatCellValue(row.getCell(0)).trim();         // A: Role
                String username = formatter.formatCellValue(row.getCell(1)).trim();     // B: Username
                String department = formatter.formatCellValue(row.getCell(2)).trim();   // C: Department
                String year = formatter.formatCellValue(row.getCell(3)).trim();         // D: Year
                String classSection = formatter.formatCellValue(row.getCell(4)).trim(); // E: ClassSection

                // Skip empty rows
                if (username.isEmpty() && role.isEmpty()) continue;

                // ALWAYS AUTO-GENERATE PASSWORD (e.g., student01@skct.edu.in -> student01123)
                String prefix = username.contains("@") ? username.split("@")[0] : username;
                String password = prefix + "123";

                // Standardize Roles
                if (role.equalsIgnoreCase("teacher") || role.equalsIgnoreCase("faculty")) {
                    role = "Teacher";
                } else if (role.equalsIgnoreCase("admin")) {
                    role = "Admin";
                } else {
                    role = "Student";
                }

                try {
                    final String searchUsername = username;
                    
                    // Update if exists, otherwise create new
                    User userToSave = existingUsers.stream()
                            .filter(u -> u.getUsername().equalsIgnoreCase(searchUsername))
                            .findFirst()
                            .orElse(new User());

                    userToSave.setRole(role);
                    userToSave.setUsername(username);
                    userToSave.setPassword(password);
                    userToSave.setDepartment(department);
                    userToSave.setYear(year);
                    userToSave.setClassSection(classSection);

                    userRepository.save(userToSave); 
                    count++;

                    // Log output will show the generated password to the Admin
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
                    .body(Map.of("error", "Invalid Excel file format. Please ensure it has 5 columns (Role, Username, Department, Year, ClassSection)."));
        }
    }
}