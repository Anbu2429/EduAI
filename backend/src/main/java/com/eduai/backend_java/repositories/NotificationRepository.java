package com.eduai.backend_java.repositories;

import com.eduai.backend_java.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications of one student
    List<Notification> findByStudentId(String studentId);

    // Get notifications by status
    List<Notification> findByStatus(String status);

    // Get notifications sent to Parent/Tutor/HOD
    List<Notification> findByRecipient(String recipient);

    // NEW
    boolean existsByStudentIdAndMessageContaining(
            String studentId,
            String keyword
    );
}