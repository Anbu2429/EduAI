package com.eduai.backend_java.services;

import com.eduai.backend_java.models.Attendance;
import com.eduai.backend_java.models.Notification;
import com.eduai.backend_java.models.Session;
import com.eduai.backend_java.models.Status;
import com.eduai.backend_java.models.StudentProfile;
import com.eduai.backend_java.repositories.AttendanceRepository;
import com.eduai.backend_java.repositories.NotificationRepository;
import com.eduai.backend_java.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceAnalyzerService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    public void checkWeeklyPattern(Long studentId) {

        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);

        List<Attendance> attendanceList =
                attendanceRepository.findByStudentIdAndDateBetween(
                        studentId,
                        startOfWeek,
                        endOfWeek
                );

        Map<LocalDate, Attendance> morningMap = new HashMap<>();
        Map<LocalDate, Attendance> afternoonMap = new HashMap<>();

        for (Attendance attendance : attendanceList) {

            if (attendance.getSession() == Session.MORNING) {
                morningMap.put(attendance.getDate(), attendance);
            }

            if (attendance.getSession() == Session.AFTERNOON) {
                afternoonMap.put(attendance.getDate(), attendance);
            }
        }

        int bunkCount = 0;

        for (LocalDate date : morningMap.keySet()) {

            Attendance morning = morningMap.get(date);
            Attendance afternoon = afternoonMap.get(date);

            if (morning != null
                    && afternoon != null
                    && morning.getStatus() == Status.PRESENT
                    && afternoon.getStatus() == Status.ABSENT) {

                bunkCount++;
            }
        }

        System.out.println("Student ID : " + studentId);
        System.out.println("Weekly Afternoon Bunk Count : " + bunkCount);

        // Send alert only after 3 afternoon bunks
        if (bunkCount < 3) {
            return;
        }

        // FIX: Changed findById to findByUserId
        StudentProfile student = studentProfileRepository.findByUserId(studentId).orElse(null);

        if (student == null) {
            return;
        }

        // Prevent duplicate weekly alerts
        boolean alreadySent =
                notificationRepository.existsByStudentIdAndMessageContaining(
                        student.getRegisterNumber(),
                        "Weekly Afternoon Bunk Alert"
                );

        if (alreadySent) {
            System.out.println("Weekly alert already sent.");
            return;
        }

        String fullName = student.getFirstName() + (student.getLastName() != null ? " " + student.getLastName() : "");
        String subject = "EduAI Weekly Attendance Alert";

        String message =
                "Weekly Afternoon Bunk Alert\n\n" +
                "Dear Parent/Tutor/HOD,\n\n" +
                "The student has bunked the AFTERNOON session 3 or more times during this week.\n\n" +
                "Student Name : " + fullName + "\n" +
                "Register Number : " + student.getRegisterNumber() + "\n" +
                "Department : " + student.getDepartment() + "\n" +
                "Year : " + student.getYear() + "\n" +
                "Section : " + (student.getSection() != null ? student.getSection() : "N/A") + "\n\n" +
                "Morning Present + Afternoon Absent Count : " + bunkCount + "\n\n" +
                "Please counsel the student and take necessary action.\n\n" +
                "Regards,\n" +
                "EduAI Attendance System";

        // Parent Alert
        if (student.getParentEmail() != null && !student.getParentEmail().isEmpty()) {
            emailService.sendEmail(
                    student.getParentEmail(),
                    subject,
                    message
            );

            Notification parent = new Notification();
            parent.setStudentId(student.getRegisterNumber());
            parent.setStudentName(fullName);
            parent.setRecipient("Parent");
            parent.setRecipientEmail(student.getParentEmail());
            parent.setMessage(message);
            parent.setStatus("SENT");
            notificationService.saveNotification(parent);
        }

        // Tutor Alert
        if (student.getTutorEmail() != null && !student.getTutorEmail().isEmpty()) {
            emailService.sendEmail(
                    student.getTutorEmail(),
                    subject,
                    message
            );

            Notification tutor = new Notification();
            tutor.setStudentId(student.getRegisterNumber());
            tutor.setStudentName(fullName);
            tutor.setRecipient("Tutor");
            tutor.setRecipientEmail(student.getTutorEmail());
            tutor.setMessage(message);
            tutor.setStatus("SENT");
            notificationService.saveNotification(tutor);
        }

        // HOD Alert
        if (student.getHodEmail() != null && !student.getHodEmail().isEmpty()) {
            emailService.sendEmail(
                    student.getHodEmail(),
                    subject,
                    message
            );

            Notification hod = new Notification();
            hod.setStudentId(student.getRegisterNumber());
            hod.setStudentName(fullName);
            hod.setRecipient("HOD");
            hod.setRecipientEmail(student.getHodEmail());
            hod.setMessage(message);
            hod.setStatus("SENT");
            notificationService.saveNotification(hod);
        }

        System.out.println("Weekly Alert Sent Successfully.");
    }
}