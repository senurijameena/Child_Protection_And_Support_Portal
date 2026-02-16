package com.example.childPortal.controller;

import com.example.childPortal.model.ContactInquiry;
import com.example.childPortal.repository.ContactInquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactInquiryRepository contactInquiryRepository;

    @PostMapping("/public")
    public ResponseEntity<Map<String, String>> submitInquiry(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String subject = body.get("subject");
        String message = body.get("message");
        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty() || message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", "false", "message", "Name, email, and message are required"));
        }
        ContactInquiry inquiry = new ContactInquiry();
        inquiry.setName(name.trim());
        inquiry.setEmail(email.trim());
        inquiry.setSubject(subject != null ? subject.trim() : "");
        inquiry.setMessage(message.trim());
        contactInquiryRepository.save(inquiry);
        return ResponseEntity.ok(Map.of("success", "true", "message", "Your inquiry has been submitted. We will respond within 2–3 business days."));
    }
}
