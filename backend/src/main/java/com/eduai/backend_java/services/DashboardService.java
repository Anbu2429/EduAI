package com.eduai.backend_java.services;

import com.eduai.backend_java.models.StudentResult;
import com.eduai.backend_java.repositories.StudentResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DashboardService {

    @Autowired
    private StudentResultRepository repository;

    // --- ADMIN DATA ---
    public Map<String, Object> getAdminDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        long totalStudents = repository.count();
        Double avgPlacement = repository.calculateOverallPlacementRate();
        long activeAlerts = repository.findByAttendanceLessThan(75.0).size();

        data.put("totalStudents", totalStudents);
        // Handle empty database scenario gracefully
        data.put("overallPlacementRate", avgPlacement != null ? String.format("%.1f%%", avgPlacement) : "0%");
        data.put("activeAlerts", activeAlerts);
        data.put("systemStatus", "Live & Connected to MySQL");
        
        return data;
    }

    // --- TEACHER DATA ---
    public Map<String, Object> getTeacherDashboardData() {
        Map<String, Object> data = new HashMap<>();
        data.put("assignedClasses", List.of("AI & DS Batch 6"));
        
        // Fetch real students with low attendance
        List<StudentResult> atRiskStudents = repository.findByAttendanceLessThan(75.0);
        List<Map<String, String>> alerts = new ArrayList<>();
        
        for (StudentResult student : atRiskStudents) {
            alerts.add(Map.of(
                "student", student.getName() + " (" + student.getStudentId() + ")",
                "issue", "Critical: Attendance is at " + student.getAttendance() + "%"
            ));
        }
        
        data.put("attendanceAlerts", alerts.isEmpty() ? List.of(Map.of("student", "None", "issue", "All students have good attendance")) : alerts);
        return data;
    }

    // --- STUDENT DATA ---
    public Map<String, Object> getStudentDashboardData(String studentId) {
        Map<String, Object> data = new HashMap<>();
        
        Optional<StudentResult> studentOpt = repository.findByStudentId(studentId);
        
        if (studentOpt.isPresent()) {
            StudentResult student = studentOpt.get();
            data.put("studentId", student.getStudentId());
            data.put("name", student.getName());
            data.put("currentAttendance", student.getAttendance() + "%");
            data.put("averageAssessmentScore", student.getAssessmentScore());
            data.put("readinessScore", student.getReadinessScore() + "%");
            data.put("prediction", student.getPrediction());
            data.put("shapExplanation", student.getShapExplanation());
        } else {
            data.put("error", "Student record not found. Please run the AI Pipeline first.");
        }
        
        return data;
    }
}