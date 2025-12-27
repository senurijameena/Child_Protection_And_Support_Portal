package com.example.childPortal.service;
import com.example.childPortal.model.Notification;
import com.example.childPortal.model.User;
import com.example.childPortal.repository.UserRepository; 
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.beans.factory.annotation.Value; 
import org.springframework.mail.javamail.JavaMailSender; 
import org.springframework.mail.javamail.MimeMessageHelper; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.mail.MessagingException; 
import jakarta.mail.internet.MimeMessage; 
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

