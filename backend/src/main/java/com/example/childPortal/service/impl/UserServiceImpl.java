package com.example.childPortal.service.impl;
import com.example.childPortal.model.User;
import com.example.childPortal.model.Role;
import com.example.childPortal.dto.RegisterRequest;
import com.example.childPortal.dto.LoginResponse;
import com.example.childPortal.dto.PoliceOfficerDTO;
import com.example.childPortal.dto.SocialWorkerDTO;
import com.example.childPortal.repository.UserRepository;
import com.example.childPortal.service.UserService;
import com.example.childPortal.service.PoliceOfficerService;
import com.example.childPortal.service.SocialWorkerService;
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
    private PoliceOfficerService policeOfficerService;

    @Autowired
    private SocialWorkerService socialWorkerService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Override
    public LoginResponse registerUser(RegisterRequest request) {
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            return new LoginResponse(null, null, null, false, "Invalid email format");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, null, null, false, "Email already registered");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(null, null, null, false, "Passwords do not match");
        }

        if (!request.isTermsAccepted()) {
            return new LoginResponse(null, null, null, false, "Must accept terms and conditions");
        }

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

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setOfficialIdFile(request.getOfficialIdFile());
        user.setCertificationFile(request.getCertificationFile());
        user.setTermsAccepted(request.isTermsAccepted());

        if (request.getRole() == Role.PU || request.getRole() == Role.ADMIN) {
            user.setApproved(true);
            user.setStatus("APPROVED");

            if (request.getRole() == Role.PU) {
                sendWelcomeEmail(user.getEmail());
            }
        } else {
            user.setApproved(false);
            user.setStatus("PENDING");
            sendPendingApprovalEmail(user.getEmail());
            notifyAdminForApproval(user);
        }

        User savedUser =userRepository.save(user);
        
        if (request.getRole() == Role.PO) {
        PoliceOfficerDTO officerDTO = new PoliceOfficerDTO();
            officerDTO.setUserId(savedUser.getId());
            officerDTO.setBadgeNumber(request.getBadgeNumber());
            officerDTO.setDepartment(request.getDepartment());
            officerDTO.setRank(request.getRank());
            officerDTO.setStationAddress(request.getStationAddress());
            officerDTO.setIdDocumentUrl(request.getOfficialIdFile());
            policeOfficerService.createPoliceOfficer(officerDTO);
        } else if (request.getRole() == Role.SW) {
            SocialWorkerDTO workerDTO = new SocialWorkerDTO();
            workerDTO.setUserId(savedUser.getId());
            workerDTO.setLicenseNumber(request.getLicenseNumber());
            workerDTO.setSpecializations(request.getSpecializations());
            workerDTO.setOrganization(request.getOrganization());
            workerDTO.setYearsOfExperience(request.getYearsOfExperience());
            workerDTO.setCertificationUrl(request.getCertificationFile());
            socialWorkerService.createSocialWorker(workerDTO);
    }


        if (user.isApproved()) {
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return new LoginResponse(token, user.getEmail(), user.getRole(), true, "Registration completed successfully");
        } else {
            return new LoginResponse(null, user.getEmail(), user.getRole(), false, "Registration submitted - pending approval");
        }
    }

    @Override
        public List<User> getUsersByRole(String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            return userRepository.findByRole(userRole);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

       @Override
    public List<User> getUsersByStatus(String status) {
         return userRepository.findByStatus(status.toUpperCase());
    }
          
    @Override
    public LoginResponse loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return new LoginResponse(null, null, null, false, "Invalid email or password");
        }

        User user = userOpt.get();
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            return new LoginResponse(null, null, null, false, "Account pending admin approval");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.isApproved(), "Login successful");
    }

    @Override
    public List<User> getPendingApprovals() {
        return userRepository.findByStatus("PENDING");
    }

    @Override
    public boolean approveUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApproved(true);
            user.setStatus("APPROVED");
            userRepository.save(user);

            sendApprovalEmail(user.getEmail());
            return true;
        }
        return false;
    }

    @Override
    public boolean rejectUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setStatus("REJECTED");
            userRepository.save(user);
            userRepository.delete(userOpt.get());
            sendRejectionEmail(user.getEmail());
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

    private void sendWelcomeEmail(String email) {
        System.out.println("Welcome email sent to: " + email);
    }

    private void sendPendingApprovalEmail(String email) {
        System.out.println("Pending approval email sent to: " + email);
    }

    private void sendApprovalEmail(String email) {
        System.out.println("Account approved email sent to: " + email);
    }

    private void sendRejectionEmail(String email) {
        System.out.println("Account rejected email sent to: " + email);
    }

    private void notifyAdminForApproval(User user) {
        System.out.println("Admin notified for approval: New " + user.getRole() + " registration from " + user.getEmail());
    }

    @Override
    public LoginResponse loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return new LoginResponse(null, null, null, false, "Invalid email or password"); 
        }
        User user = userOpt.get();
        
        if (!user.isActive()) {
            return new LoginResponse(null, null, null, false, "Account is deactivated");
        }
        
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            return new LoginResponse(null, null, null, false, "Account pending admin approval");
        }
        
        user.setLastLogin(LocalDateTime.now()); 
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getEmail(), user.getRole(), user.isApproved(), "Login successful");
    }
}
