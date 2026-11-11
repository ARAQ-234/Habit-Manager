package com.habitmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendReminderEmail(String to, String habitTitle, String scheduledTime) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("⏰ Habit Reminder: " + habitTitle);
            message.setText("Hello,\n\nIt's time to work on your habit: " + habitTitle +
                    "\n\nScheduled time: " + scheduledTime +
                    "\n\nStay consistent!\n\n- Habit Manager");
            mailSender.send(message);
            logger.info("Reminder email sent successfully");
            return true;
        } catch (Exception e) {
            logger.warn("Reminder email delivery failed ({})", e.getClass().getSimpleName());
            return false;
        }
    }

    public boolean sendPasswordResetEmail(String to, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Reset your Habit Manager password");
            message.setText("We received a request to reset your password. Use this one-time link within 20 minutes:\n\n"
                    + resetLink + "\n\nIf you did not request this, you can ignore this email.");
            mailSender.send(message);
            return true;
        } catch (Exception exception) {
            logger.warn("Password reset email delivery failed ({})", exception.getClass().getSimpleName());
            return false;
        }
    }
}
