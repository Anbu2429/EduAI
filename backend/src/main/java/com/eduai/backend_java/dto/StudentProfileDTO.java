package com.eduai.backend_java.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class StudentProfileDTO {

    private Long id;

    private Long userId;

    private String registerNumber;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String gender;

    private LocalDate dateOfBirth;

    private String address;

    private String department;

    private Integer year;

    private Integer semester;

    private String section;

    private Double cgpa;

    private String profilePhoto;

    private String bio;

    private String skills;

    private String github;

    private String linkedin;

    private String portfolio;

    private String resume;

    private String placementStatus;
}