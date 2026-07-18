package com.eduai.backend_java.repositories;

import com.eduai.backend_java.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// THIS IS THE MISSING LINE THAT CAUSED THE CRASH:
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByUsernameAndPasswordAndRole(String username, String password, String role);
    
    // Now Java knows what a "List" is!
    List<User> findByRole(String role);
}