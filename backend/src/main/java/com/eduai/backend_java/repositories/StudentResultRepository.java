package com.eduai.backend_java.repositories;

import com.eduai.backend_java.models.StudentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResultRepository extends JpaRepository<StudentResult, Long> {
    
    Optional<StudentResult> findByStudentId(String studentId);

    List<StudentResult> findByAttendanceLessThan(Double attendanceThreshold);

    @Query("SELECT AVG(s.readinessScore) FROM StudentResult s")
    Double calculateOverallPlacementRate();
}