package com.eduai.backend_java.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "student_profile")
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Login Account Reference
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User user;

    // Academic Details
    @Column(nullable = false, unique = true)
    private String registerNumber;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer semester;

    private String section;

    private Double cgpa;

    // Personal Details
    @Column(nullable = false)
    private String firstName;

    private String lastName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String gender;

    private LocalDate dateOfBirth;

    @Column(length = 500)
    private String address;

    // Profile Information
    private String profilePhoto;

    @Column(length = 1000)
    private String bio;

    // Professional Information
    @Column(length = 1000)
    private String skills;

    private String github;

    private String linkedin;

    private String portfolio;

    private String resume;

    // Placement
    private String placementStatus;

    // Audit Fields
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}