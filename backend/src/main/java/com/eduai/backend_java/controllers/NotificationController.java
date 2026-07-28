package com.eduai.backend_java.controllers;

import com.eduai.backend_java.models.Notification;
import com.eduai.backend_java.services.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Save Notification
    @PostMapping
    public Notification saveNotification(@RequestBody Notification notification) {
        return notificationService.saveNotification(notification);
    }

    // Get All Notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // Get Notifications by Student ID
    @GetMapping("/student/{studentId}")
    public List<Notification> getNotificationsByStudentId(@PathVariable String studentId) {
        return notificationService.getNotificationsByStudentId(studentId);
    }

    // Get Notifications by Recipient
    @GetMapping("/recipient/{recipient}")
    public List<Notification> getNotificationsByRecipient(@PathVariable String recipient) {
        return notificationService.getNotificationsByRecipient(recipient);
    }

    // Get Notifications by Status
    @GetMapping("/status/{status}")
    public List<Notification> getNotificationsByStatus(@PathVariable String status) {
        return notificationService.getNotificationsByStatus(status);
    }

    // Update Notification Status
    @PutMapping("/{id}/status")
    public Notification updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        return notificationService.updateStatus(id, body.get("status"));
    }

    // Delete Notification
    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id) {

        notificationService.deleteNotification(id);

        return "Notification deleted successfully.";
    }
}