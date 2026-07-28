package com.eduai.backend_java.services;

import com.eduai.backend_java.models.Notification;
import com.eduai.backend_java.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Save Notification
    public Notification saveNotification(Notification notification) {

        notification.setSentDate(LocalDateTime.now());

        if (notification.getStatus() == null || notification.getStatus().isEmpty()) {
            notification.setStatus("PENDING");
        }

        return notificationRepository.save(notification);
    }

    // Get All Notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get Notifications by Student ID
    public List<Notification> getNotificationsByStudentId(String studentId) {
        return notificationRepository.findByStudentId(studentId);
    }

    // Get Notifications by Recipient
    public List<Notification> getNotificationsByRecipient(String recipient) {
        return notificationRepository.findByRecipient(recipient);
    }

    // Get Notifications by Status
    public List<Notification> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatus(status);
    }

    // Update Notification Status
    public Notification updateStatus(Long id, String status) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setStatus(status);

        return notificationRepository.save(notification);
    }

    // Delete Notification
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}