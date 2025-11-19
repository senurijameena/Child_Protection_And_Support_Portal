package com.example.childPortal.service.impl;

import com.example.childPortal.model.User;
import com.example.childPortal.model.Role;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.dto.LoginResponse;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.UserService;
import com.example.childPortal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Override
    public LoginResponse registerUser(RegisterRequest request) {
        // Validate email format
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            return new LoginResponse(null, null, null, false, "Invalid email format");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, null, null, false, "Email already registered");
        }

        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(null, null, null, false, "Passwords do not match");
        }

        // Validate terms acceptance
        if (!request.isTermsAccepted()) {
            return new LoginResponse(null, null, null, false, "Must accept terms and conditions");
        }

        // Role-specific validations
        if (request.getRole() == Role.PO || request.getRole() == Role.SW) {
            if (request.getOfficialIdFile() == null || request.getOfficialIdFile().isEmpty()) {
                return new LoginResponse(null, null, null, false, "Official ID upload required for this role");
            }
        }

        if (request.getRole() == Role.SW) {
            if (request.getCertificationFile() == null || request.getCertificationFile().isEmpty()) {
                return new LoginResponse(null, null, null, false, "Certification upload required for Social Worker");
            }
        }

        // Create user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setOfficialIdFile(request.getOfficialIdFile());
        user.setCertificationFile(request.getCertificationFile());
        user.setTermsAccepted(request.isTermsAccepted());

        // Set approval status
        if (request.getRole() == Role.PU || request.getRole() == Role.ADMIN) {
            user.setApproved(true);
            // Send welcome email for PU
            if (request.getRole() == Role.PU) {
                sendWelcomeEmail(user.getEmail());
            }
        } else {
            user.setApproved(false);
            // Send pending approval email
            sendPendingApprovalEmail(user.getEmail());
            // Notify admin (in real implementation, this would send email/notification)
            notifyAdminForApproval(user);
        }

        userRepository.save(user);

        // Generate token for immediate login if approved
        if (user.isApproved()) {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return new LoginResponse(token, user.getEmail(), user.getRole(), true, "Registration completed successfully");
        } else {
            return new LoginResponse(null, user.getEmail(), user.getRole(), false, "Registration submitted - pending approval");
        }
    }

    @Override
    public LoginResponse loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return new LoginResponse(null, null, null, false, "Invalid email or password");
        }

        User user = userOpt.get();
        
        // Check if user is approved (except for ADMIN)
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            return new LoginResponse(null, null, null, false, "Account pending admin approval");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.isApproved(), "Login successful");
    }

    @Override
    public List<User> getPendingApprovals() {
        return userRepository.findByApproved(false);
    }

    @Override
    public boolean approveUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApproved(true);
            userRepository.save(user);
            
            // Send approval email
            sendApprovalEmail(user.getEmail());
            return true;
        }
        return false;
    }

    @Override
    public boolean rejectUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            // Send rejection email
            sendRejectionEmail(userOpt.get().getEmail());
            return true;
        }
        return false;
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Email simulation methods (in real app, integrate with email service)
    private void sendWelcomeEmail(String email) {
        System.out.println("Welcome email sent to: " + email);
        // Implement actual email sending logic
    }

    private void sendPendingApprovalEmail(String email) {
        System.out.println("Pending approval email sent to: " + email);
        // Implement actual email sending logic
    }

    private void sendApprovalEmail(String email) {
        System.out.println("Account approved email sent to: " + email);
        // Implement actual email sending logic
    }

    private void sendRejectionEmail(String email) {
        System.out.println("Account rejected email sent to: " + email);
        // Implement actual email sending logic
    }

    private void notifyAdminForApproval(User user) {
        System.out.println("Admin notified for approval: New " + user.getRole() + " registration from " + user.getEmail());
        // Implement actual notification logic
    }
}