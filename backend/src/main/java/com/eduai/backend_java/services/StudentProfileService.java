package com.eduai.backend_java.services;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.eduai.backend_java.models.StudentProfile;

public interface StudentProfileService {
    StudentProfile getProfileByUserId(Long userId);
    StudentProfile getProfileById(Long id);
    List<StudentProfile> getAllProfiles();
    StudentProfile createProfile(StudentProfile studentProfile);
    StudentProfile updateProfile(Long id, StudentProfile studentProfile);
    void deleteProfile(Long id);
    String uploadProfilePhoto(Long id, MultipartFile file) throws Exception;
}