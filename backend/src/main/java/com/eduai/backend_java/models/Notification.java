package com.eduai.backend_java.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student Details
    private String studentId;
    private String studentName;

    // Parent / Tutor / HOD
    private String recipient;

    // Email Address
    private String recipientEmail;

    @Column(columnDefinition = "TEXT")
    private String message;

    // SENT / PENDING / FAILED
    private String status;

    private LocalDateTime sentDate;
}