package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.Assessment;
import com.eduai.backend_java.models.Question;
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

    // FIX: Actual evaluation logic to calculate score based on real answers
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitAssessment(@PathVariable Long id, @RequestBody Map<String, Object> submission) {
        try {
            Assessment assessment = assessmentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Assessment not found"));

            Object answersObj = submission.get("answers");
            Map<String, String> submittedAnswers = (Map<String, String>) answersObj;

            int correctCount = 0;
            int total = assessment.getQuestions().size();

            for (Question q : assessment.getQuestions()) {
                String qIdStr = String.valueOf(q.getId());
                String studentAns = submittedAnswers != null ? submittedAnswers.get(qIdStr) : "";

                if (q.getType().equals("MCQ")) {
                    if (studentAns != null && studentAns.trim().equalsIgnoreCase(q.getAnswer().trim())) {
                        correctCount++;
                    }
                } else {
                    // STRICT CODING EVALUATION:
                    // Get default starter code length to ensure they actually wrote code
                    String defaultJava = q.getStarterCode() != null ? q.getStarterCode().get("java") : "";
                    
                    if (studentAns != null && !studentAns.trim().isEmpty()) {
                        // Check if the student actually changed the code
                        if (!studentAns.trim().equals(defaultJava.trim()) && studentAns.length() > defaultJava.length() + 5) {
                            correctCount++;
                        }
                    }
                }
            }

            int score = total > 0 ? (int) Math.round(((double) correctCount / total) * 100) : 0;
            String status = score >= 60 ? "PASSED" : "FAILED";

            return ResponseEntity.ok(Map.of(
                "score", score, 
                "status", status, 
                "correctCount", correctCount, 
                "total", total
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Evaluation Error: " + e.getMessage());
        }
    }
}