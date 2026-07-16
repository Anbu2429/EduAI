package com.eduai.backend_java.repositories;

import com.eduai.backend_java.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query to check if credentials match
    User findByUsernameAndPasswordAndRole(String username, String password, String role);
}