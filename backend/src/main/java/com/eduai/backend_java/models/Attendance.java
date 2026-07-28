package com.eduai.backend_java.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"studentId", "date", "session"})
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    // Student Details
    private Long studentId;

    // Faculty Details
    private Long facultyId;

    // Class Details
    private String department;

    private Integer year;

    private String section;

    private String subject;

    // Attendance Details
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Session session;

    @Enumerated(EnumType.STRING)
    private Status status;
}