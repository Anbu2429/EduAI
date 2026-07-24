package com.eduai.backend_java.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eduai.backend_java.models.StudentProfile;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    // Find profile using login user ID
    Optional<StudentProfile> findByUserId(Long userId);

    // Find profile using register number
    Optional<StudentProfile> findByRegisterNumber(String registerNumber);

    // Check if register number already exists
    boolean existsByRegisterNumber(String registerNumber);

    // Check if email already exists
    boolean existsByEmail(String email);

}