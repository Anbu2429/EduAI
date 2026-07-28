package com.eduai.backend_java.controllers;

import com.eduai.backend_java.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:3000")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/test")
    public String sendTestEmail() {

        emailService.sendEmail(
                "gokulrathi2005l@gmail.com",
                "EduAI Test Email",
                "Congratulations! Your Spring Boot email service is working successfully."
        );

        return "Test email sent successfully!";
    }
}