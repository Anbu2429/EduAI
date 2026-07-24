package com.eduai.backend_java.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.eduai.backend_java.models.StudentProfile;
import com.eduai.backend_java.services.StudentProfileService;

@RestController
@RequestMapping("/api/student/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentProfileController {

    @Autowired
    private StudentProfileService studentProfileService;

    // ===========================
    // Get Student Profile by User ID
    // ===========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<StudentProfile> getProfileByUserId(@PathVariable Long userId) {
        StudentProfile profile = studentProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    // ===========================
    // Get Student Profile by Profile ID
    // ===========================
    @GetMapping("/{id}")
    public ResponseEntity<StudentProfile> getProfileById(@PathVariable Long id) {
        StudentProfile profile = studentProfileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    // ===========================
    // Get All Student Profiles
    // ===========================
    @GetMapping("/all")
    public ResponseEntity<List<StudentProfile>> getAllProfiles() {
        return ResponseEntity.ok(studentProfileService.getAllProfiles());
    }

    // ===========================
    // Create Student Profile
    // ===========================
    @PostMapping
    public ResponseEntity<StudentProfile> createProfile(@RequestBody StudentProfile studentProfile) {
        StudentProfile savedProfile = studentProfileService.createProfile(studentProfile);
        return new ResponseEntity<>(savedProfile, HttpStatus.CREATED);
    }

    // ===========================
    // Update Student Profile
    // ===========================
    @PutMapping("/{id}")
    public ResponseEntity<StudentProfile> updateProfile(@PathVariable Long id, @RequestBody StudentProfile studentProfile) {
        StudentProfile updatedProfile = studentProfileService.updateProfile(id, studentProfile);
        return ResponseEntity.ok(updatedProfile);
    }

    // ===========================
    // Delete Student Profile
    // ===========================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProfile(@PathVariable Long id) {
        studentProfileService.deleteProfile(id);
        return ResponseEntity.ok("Student Profile Deleted Successfully");
    }

    // ===========================
    // Upload Profile Photo
    // ===========================
    @PostMapping(value = "/upload-photo/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadProfilePhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws Exception {
        String fileName = studentProfileService.uploadProfilePhoto(id, file);
        return ResponseEntity.ok(fileName);
    }
}