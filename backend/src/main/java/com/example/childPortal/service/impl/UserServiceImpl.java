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
    public List<UserManagementDTO> getAllUsersForManagement() {
    List<User> users = userRepository.findAll(); return users.stream()
        .map(this::convertToUserManagementDTO) .collect(Collectors.toList());
    }
    
    @Override
    public UserManagementDTO getUserForManagement(String userId) {
        Optional<User> userOpt = userRepository.findById(userId); if (userOpt.isPresent()) {
            return convertToUserManagementDTO(userOpt.get()); 
        }
        return null; 
    }
    
    @Override
    public boolean deactivateUser(String userId, String reason) {
        Optional<User> userOpt = userRepository.findById(userId); 
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(false); 
            user.setDeactivationReason(reason);
            user.setDeactivationDate(LocalDateTime.now()); 
            userRepository.save(user);
            logUserDeactivation(user, reason); 
            return true;
        }
        return false;
    }
    
    @Override
    public boolean activateUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId); 
        if (userOpt.isPresent()) {
            User user = userOpt.get(); user.setActive(true);
            user.setDeactivationReason(null); user.setDeactivationDate(null); 
            userRepository.save(user);
            logUserActivation(user); 
            return true;
        }
        return false; 
    }
    
    @Override
    public boolean updateUserDetails(String userId, UserUpdateRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId); 
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (updateRequest.getFullName() != null) { 
                user.setFullName(updateRequest.getFullName());
            }
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
                if (!userRepository.existsByEmail(updateRequest.getEmail())) {
                    user.setEmail(updateRequest.getEmail()); } else {
                    throw new RuntimeException("Email already exists");
                }
            }
            if (updateRequest.getPhone() != null) {
                user.setPhone(updateRequest.getPhone()); 
            }
            if (updateRequest.getStatus() != null) {
                user.setStatus(updateRequest.getStatus());
            }
            user.setActive(updateRequest.isActive());
            userRepository.save(user);
            if (user.getRole() == Role.PO && updateRequest.getBadgeNumber() != null) {
                updatePoliceOfficerDetails(userId, updateRequest);
            } else if (user.getRole() == Role.SW && updateRequest.getLicenseNumber() != null) {
                updateSocialWorkerDetails(userId, updateRequest); }
            logUserUpdate(user, updateRequest);
            return true;
        }
        return false; 
    }
    
    @Override
    public List<UserManagementDTO> getUsersByRoleForManagement(Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
            .map(this::convertToUserManagementDTO)
            .collect(Collectors.toList()); 
    }
    
    @Override
    public List<UserManagementDTO> getActiveUsers() {
        List<User> users = userRepository.findAll(); 
        return users.stream()
            .filter(User::isActive) .map(this::convertToUserManagementDTO) .collect(Collectors.toList());
    }
    
    @Override
    public List<UserManagementDTO> getInactiveUsers() {
        List<User> users = userRepository.findAll(); return users.stream()
            .filter(user -> !user.isActive()) .map(this::convertToUserManagementDTO) .collect(Collectors.toList());
    }

    private UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO(); 
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone()); 
        dto.setStatus(user.getStatus()); 
        dto.setActive(user.isActive()); 
        dto.setLastLogin(user.getLastLogin()); 
        dto.setRegistrationDate(user.getSubmissionDate()); 
        dto.setApproved(user.isApproved());
        dto.setDeactivationReason(user.getDeactivationReason()); 
        dto.setDeactivationDate(user.getDeactivationDate());
        
        if (user.getRole() == Role.PO) {
            populatePoliceOfficerDetails(dto, user.getId()); 
        } else if (user.getRole() == Role.SW) {
            populateSocialWorkerDetails(dto, user.getId()); 
        }
        if (user.getRole() == Role.PO) {
            populatePoliceOfficerStatistics(dto, user.getId());
        } else if (user.getRole() == Role.SW) {
            populateSocialWorkerStatistics(dto, user.getId()); 
        } else if (user.getRole() == Role.PU) {
            populatePublicUserStatistics(dto, user.getId());
        }
        return dto; 
    }
    
    private void populatePoliceOfficerDetails(UserManagementDTO dto, String userId) {
        Optional<PoliceOfficer> officerOpt = policeOfficerRepository.findByUserId(userId); 
        if (officerOpt.isPresent()) {
            PoliceOfficer officer = officerOpt.get(); 
            dto.setBadgeNumber(officer.getBadgeNumber()); 
            dto.setDepartment(officer.getDepartment());
            dto.setRank(officer.getRank()); 
            dto.setOrganization(officer.getStationAddress())
                }
    }

    private void populateSocialWorkerDetails(UserManagementDTO dto, String userId) {
        Optional<SocialWorker> workerOpt = socialWorkerRepository.findByUserId(userId); 
        if (workerOpt.isPresent()) {
            SocialWorker worker = workerOpt.get();
            dto.setLicenseNumber(worker.getLicenseNumber()); 
            dto.setSpecializations(worker.getSpecializations()); 
            dto.setOrganization(worker.getOrganization());
            dto.setYearsOfExperience(worker.getYearsOfExperience());
        }
    }
    
    private void populatePoliceOfficerStatistics(UserManagementDTO dto, String userId) {
        List<Case> activeCases = caseRepository.findByAssignedOfficerId(userId).stream()
            .filter(c -> c.getStatus() != Case.CaseStatus.CLOSED && c.getStatus() != Case.CaseStatus.RESOLVED)
            .collect(Collectors.toList()); dto.setActiveCases(activeCases.size());
        List<Case> completedCases = caseRepository.findByAssignedOfficerId(userId).stream()
            .filter(c -> c.getStatus() == Case.CaseStatus.CLOSED || c.getStatus() == Case.CaseStatus.RESOLVED)
            .collect(Collectors.toList()); dto.setCompletedCases(completedCases.size());
    }
    
    private void populateSocialWorkerStatistics(UserManagementDTO dto, String userId) {
        List<HelpRequest> activeHelpRequests = helpRequestRepository.findByAssignedWorkerId(userId).stream()
            .filter(h -> h.getStatus() != HelpRequest.RequestStatus.COMPLETED && h.getStatus() != HelpRequest.RequestStatus.REJECTED)
            .collect(Collectors.toList()); dto.setActiveHelpRequests(activeHelpRequests.size());
        List<ServiceOffer> completedServices = serviceOfferRepository.findByOfferedByUserId(userId).stream()
            .filter(s -> s.getStatus() == ServiceOffer.OfferStatus.COMPLETED)
            .collect(Collectors.toList()); dto.setCompletedServices(completedServices.size());
    }

    private void populatePublicUserStatistics(UserManagementDTO dto, String userId) { // Count cases reported by this user
        List<Case> userCases = caseRepository.findByReporterUserId(userId); dto.setCompletedCases(userCases.size());
        List<HelpRequest> userHelpRequests = helpRequestRepository.findByRequesterUserId(userId);

        dto.setCompletedServices(userHelpRequests.size()); 
    }
    
    private void updatePoliceOfficerDetails(String userId, UserUpdateRequest updateRequest) {
        Optional<PoliceOfficer> officerOpt = policeOfficerRepository.findByUserId(userId); 
        if (officerOpt.isPresent()) {
            PoliceOfficer officer = officerOpt.get();
            if (updateRequest.getBadgeNumber() != null) {
                officer.setBadgeNumber(updateRequest.getBadgeNumber()); }
            if (updateRequest.getDepartment() != null) { 
                officer.setDepartment(updateRequest.getDepartment());
            }
            if (updateRequest.getRank() != null) {
                officer.setRank(updateRequest.getRank()); }
            if (updateRequest.getStationAddress() != null) { 
                officer.setStationAddress(updateRequest.getStationAddress());
            }
            policeOfficerRepository.save(officer); 
        }
    }
    
    private void updateSocialWorkerDetails(String userId, UserUpdateRequest updateRequest) {
        Optional<SocialWorker> workerOpt = socialWorkerRepository.findByUserId(userId);

        if (workerOpt.isPresent()) {
            SocialWorker worker = workerOpt.get();
            if (updateRequest.getLicenseNumber() != null) {
                worker.setLicenseNumber(updateRequest.getLicenseNumber()); 
            }
            if (updateRequest.getSpecializations() != null) { 
                worker.setSpecializations(updateRequest.getSpecializations());
            }
            if (updateRequest.getOrganization() != null) {
                worker.setOrganization(updateRequest.getOrganization()); }
            if (updateRequest.getYearsOfExperience() != null) { 
                worker.setYearsOfExperience(updateRequest.getYearsOfExperience());
            }
            socialWorkerRepository.save(worker); }
    }
    
    private void logUserDeactivation(User user, String reason) {
        System.out.println("User deactivated: " + user.getEmail()); 
        System.out.println("Name: " + user.getFullName());
        System.out.println("Role: " + user.getRole()); 
        System.out.println("Reason: " + reason); System.out.println("Date: " + LocalDateTime.now());
    }

    private void logUserActivation(User user) {
        System.out.println("User activated: " + user.getEmail());
        System.out.println("Name: " + user.getFullName()); 
        System.out.println("Role: " + user.getRole());
        System.out.println("Date: " + LocalDateTime.now());
    }
    
    private void logUserUpdate(User user, UserUpdateRequest updateRequest) {
        System.out.println("User updated: " + user.getEmail());
        System.out.println("Updated fields:");
        if (updateRequest.getFullName() != null) System.out.println(" Name: " + updateRequest.getFullName());
        if (updateRequest.getEmail() != null) System.out.println(" Email: " + updateRequest.getEmail());
        if (updateRequest.getPhone() != null) System.out.println(" Phone: " + updateRequest.getPhone());
        System.out.println("Active status: " + updateRequest.isActive());
    }

}
