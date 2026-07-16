package com.eduai.backend_java.controllers;

import com.eduai.backend_java.services.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    public Map<String, Object> getAdminDashboard() {
        return dashboardService.getAdminDashboardData();
    }

    @GetMapping("/teacher")
    public Map<String, Object> getTeacherDashboard() {
        return dashboardService.getTeacherDashboardData();
    }

    @GetMapping("/student/{studentId}")
    public Map<String, Object> getStudentDashboard(@PathVariable String studentId) {
        return dashboardService.getStudentDashboardData(studentId);
    }
}