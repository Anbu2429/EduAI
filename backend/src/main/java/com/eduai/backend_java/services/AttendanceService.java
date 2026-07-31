package com.eduai.backend_java.services;

import com.eduai.backend_java.models.Attendance;
import com.eduai.backend_java.models.Notification;
import com.eduai.backend_java.models.Session;
import com.eduai.backend_java.models.Status;
import com.eduai.backend_java.models.StudentProfile;
import com.eduai.backend_java.repositories.AttendanceRepository;
import com.eduai.backend_java.repositories.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AttendanceAnalyzerService attendanceAnalyzerService;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    // Save or Update Attendance (Upsert logic)
    public Attendance saveAttendance(Attendance attendance) {
        Optional<Attendance> existingRecord = attendanceRepository.findByStudentIdAndDateAndSession(
                attendance.getStudentId(),
                attendance.getDate(),
                attendance.getSession()
        );

        Attendance savedAttendance;
        if (existingRecord.isPresent()) {
            Attendance target = existingRecord.get();
            target.setStatus(attendance.getStatus());
            target.setSubject(attendance.getSubject());
            target.setFacultyId(attendance.getFacultyId());
            target.setDepartment(attendance.getDepartment());
            target.setYear(attendance.getYear());
            target.setSection(attendance.getSection());
            savedAttendance = attendanceRepository.save(target);
        } else {
            savedAttendance = attendanceRepository.save(attendance);
        }

        // Send an immediate email alert if the student is marked ABSENT
        if (savedAttendance.getStatus() == Status.ABSENT) {
            sendImmediateAbsentAlert(savedAttendance);
        }

        // Weekly analysis should run only after AFTERNOON attendance is marked
        if (savedAttendance.getSession() == Session.AFTERNOON) {
            attendanceAnalyzerService.checkWeeklyPattern(savedAttendance.getStudentId());
        }

        return savedAttendance;
    }

    // Get attendance filtered by date and session
    public List<Attendance> getAttendanceByDateAndSession(LocalDate date, Session session) {
        return attendanceRepository.findByDateAndSession(date, session);
    }

    // Helper method to verify student profile emails and send immediate absence alerts (Excluding Student)
    private void sendImmediateAbsentAlert(Attendance attendance) {
        StudentProfile student = studentProfileRepository.findByUserId(attendance.getStudentId()).orElse(null);
        if (student == null) {
            System.out.println("Student Profile not found for User ID: " + attendance.getStudentId());
            return;
        }

        String fullName = student.getFirstName() + (student.getLastName() != null ? " " + student.getLastName() : "");
        String subject = "EduAI Attendance Alert: Student Absent";

        String message =
                "Attendance Absence Notification\n\n" +
                "Dear Recipient,\n\n" +
                "This is to inform you that the student has been marked ABSENT for the class session.\n\n" +
                "Student Name : " + fullName + "\n" +
                "Register Number : " + student.getRegisterNumber() + "\n" +
                "Department : " + student.getDepartment() + "\n" +
                "Year : " + student.getYear() + "\n" +
                "Section : " + (student.getSection() != null ? student.getSection() : "N/A") + "\n" +
                "Subject : " + (attendance.getSubject() != null ? attendance.getSubject() : "N/A") + "\n" +
                "Session : " + attendance.getSession() + "\n" +
                "Date : " + attendance.getDate() + "\n\n" +
                "Please ensure regular attendance.\n\n" +
                "Regards,\n" +
                "EduAI Attendance System";

        // 1. Notify Parent
        if (student.getParentEmail() != null && !student.getParentEmail().isEmpty()) {
            emailService.sendEmail(student.getParentEmail(), subject, message);

            Notification parentNotification = new Notification();
            parentNotification.setStudentId(student.getRegisterNumber());
            parentNotification.setStudentName(fullName);
            parentNotification.setRecipient("Parent");
            parentNotification.setRecipientEmail(student.getParentEmail());
            parentNotification.setMessage(message);
            parentNotification.setStatus("SENT");
            notificationService.saveNotification(parentNotification);
        }

        // 2. Notify Tutor
        if (student.getTutorEmail() != null && !student.getTutorEmail().isEmpty()) {
            emailService.sendEmail(student.getTutorEmail(), subject, message);

            Notification tutorNotification = new Notification();
            tutorNotification.setStudentId(student.getRegisterNumber());
            tutorNotification.setStudentName(fullName);
            tutorNotification.setRecipient("Tutor");
            tutorNotification.setRecipientEmail(student.getTutorEmail());
            tutorNotification.setMessage(message);
            tutorNotification.setStatus("SENT");
            notificationService.saveNotification(tutorNotification);
        }

        // 3. Notify HOD
        if (student.getHodEmail() != null && !student.getHodEmail().isEmpty()) {
            emailService.sendEmail(student.getHodEmail(), subject, message);

            Notification hodNotification = new Notification();
            hodNotification.setStudentId(student.getRegisterNumber());
            hodNotification.setStudentName(fullName);
            hodNotification.setRecipient("HOD");
            hodNotification.setRecipientEmail(student.getHodEmail());
            hodNotification.setMessage(message);
            hodNotification.setStatus("SENT");
            notificationService.saveNotification(hodNotification);
        }
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentIdAndDateBetween(
                studentId,
                LocalDate.now().minusMonths(6),
                LocalDate.now()
        );
    }

    public List<Attendance> getTodayAttendance() {
        return attendanceRepository.findByDate(LocalDate.now());
    }
}