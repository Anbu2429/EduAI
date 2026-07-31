package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.Assessment;
import com.eduai.backend_java.repositories.AssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AssessmentController {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @GetMapping
    public ResponseEntity<?> getAllAssessments() {
        try {
            List<Assessment> assessments = assessmentRepository.findAll();
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Backend Error: " + e.getMessage());
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAssessment(@RequestBody Assessment assessment) {
        try {
            Assessment saved = assessmentRepository.save(assessment);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Save Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssessment(@PathVariable Long id) {
        assessmentRepository.deleteById(id);
        return ResponseEntity.ok("Deleted Successfully");
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitAssessment(@PathVariable Long id, @RequestBody Map<String, Object> submission) {
        return ResponseEntity.ok(Map.of("score", 100, "status", "PASSED", "correctCount", 5, "total", 5));
    }
}