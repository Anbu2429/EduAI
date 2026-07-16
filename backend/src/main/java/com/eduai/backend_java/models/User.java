package com.eduai.backend_java.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "system_users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String role; // "Teacher" or "Student"
}