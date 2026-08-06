package com.eduai.backend_java.repositories;

import com.eduai.backend_java.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsernameAndPasswordAndRole(String username, String password, String role);
    
    List<User> findByRole(String role);
    
    // NEW: Finds students that match a specific department, year, and class section!
    List<User> findByRoleAndDepartmentAndYearAndClassSection(String role, String department, String year, String classSection);
}