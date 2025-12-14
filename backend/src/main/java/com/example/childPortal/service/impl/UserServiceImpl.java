package com.example.childPortal.service.impl;

import com.example.childPortal.dto.*;
import com.example.childPortal.model.*;
import com.example.childPortal.repository.*;
import com.example.childPortal.security.JwtUtil;
import com.example.childPortal.service.UserService;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired 
    private UserRepository userRepository;

    @Autowired
    private PoliceOfficerRepository policeOfficerRepository;

    @Autowired 
    private SocialWorkerRepository socialWorkerRepository;

    @Autowired 
    private PasswordEncoder passwordEncoder;

    @Autowired 
    private JwtUtil jwtUtil;

    @PostConstruct
    public void createDefaultAdmin() {
        try {
            if (!userRepository.findByEmail("admin@gmail.com").isPresent()) {
                User admin = new User();
                admin.setFullName("System Administrator");
                admin.setEmail("admin@gmail.com");
                admin.setPhone("+1234567890");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setActive(true);
                admin.setApproved(true);
                admin.setOfficialIdFile("system_admin");
                admin.setRegistrationDate(LocalDateTime.now());
            
                userRepository.save(admin);
                System.out.println("✅ Default admin created successfully");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to create default admin: " + e.getMessage());
        }
    }

    @Override
    public LoginResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new LoginResponse(null, "Email already exists", false);
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new LoginResponse(null, "Passwords do not match", false);
        }

        if (!request.isTermsAccepted()) {
            return new LoginResponse(null, "You must accept the terms and conditions", false);
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        user.setApproved(false); 
        user.setRegistrationDate(LocalDateTime.now());

        user = userRepository.save(user);
        try {
            if (user.getRole() == Role.PO) {
                PoliceOfficer officer = new PoliceOfficer();
                officer.setUserId(user.getId());
                officer.setBadgeNumber(request.getBadgeNumber());
                officer.setDepartment(request.getDepartment());
                officer.setRank(request.getRank());
                officer.setStationAddress(request.getStationAddress());
                officer.setIdDocumentUrl(request.getIdDocumentUrl());
                policeOfficerRepository.save(officer);
                
            } else if (user.getRole() == Role.SW) {
                SocialWorker worker = new SocialWorker();
                worker.setUserId(user.getId());
                worker.setLicenseNumber(request.getLicenseNumber());
                worker.setOrganization(request.getOrganization());
                worker.setYearsOfExperience(request.getYearsOfExperience() != null ? 
                    Integer.parseInt(request.getYearsOfExperience()) : 0);

                if (request.getSpecializations() != null) {
                    List<String> specializations = Arrays.asList(
                        request.getSpecializations().split(",")
                    );
                    worker.setSpecializations(specializations);
                }
                
                worker.setIdDocumentUrl(request.getCertificationDocumentUrl());
                socialWorkerRepository.save(worker);
            }
            
            return new LoginResponse(null, "Registration successful. Awaiting admin approval.", false);
            
        } catch (Exception e) {
            userRepository.delete(user);
            return new LoginResponse(null, "Registration failed: " + e.getMessage(), false);
        }
    }

    @Override
    public LoginResponse loginUser(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new LoginResponse(null, "Invalid credentials", false);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse(null, "Invalid credentials", false);
        }

        if (!user.isActive()) {
            return new LoginResponse(null, "Account is deactivated", false);
        }

        if (!user.isApproved()) {
            return new LoginResponse(null, "Account pending approval", false);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return new LoginResponse(token, user.getId(), user.getEmail(), user.getRole(), true);
    }

    @Override
    public Optional<User> getUserById(String userId) {
        return userRepository.findById(userId);
    }

    @Override
    public UserDTO getUserProfile(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public List<User> getPendingApprovals() {
        return userRepository.findByApproved(false);
    }

    @Override
    public List<User> getUsersByRole(String role) {
        try {
            Role roleEnum = Role.valueOf(role);
            return userRepository.findByRole(roleEnum);
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
    }

    @Override
    public boolean approveUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setApproved(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean rejectUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return true;
        }
        return false;
    }

    @Override
    public boolean updateUser(String userId, UserDTO userDTO) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setFullName(userDTO.getFullName());
            user.setEmail(userDTO.getEmail());
            user.setPhone(userDTO.getPhone());
            user.setActive(userDTO.isActive());
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean deactivateUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean activateUser(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> getAllUsersAsEntities() {
        return userRepository.findAll();
    }

    @Override
    public List<User> getUsersByStatus(String status) {
        if ("active".equalsIgnoreCase(status)) {
            return userRepository.findByActive(true);
        } else if ("inactive".equalsIgnoreCase(status)) {
            return userRepository.findByActive(false);
        } else if ("pending".equalsIgnoreCase(status)) {
            return userRepository.findByApproved(false);
        } else if ("approved".equalsIgnoreCase(status)) {
            return userRepository.findByApproved(true);
        }
        return Collections.emptyList();
    }

    @Override
    public List<UserManagementDTO> getAllUsersForManagement() {
        return userRepository.findAll().stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserManagementDTO getUserForManagement(String userId) {
        return userRepository.findById(userId)
                .map(this::convertToUserManagementDTO)
                .orElse(null);
    }

    @Override
    public boolean deactivateUser(String userId, String reason) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setActive(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public boolean updateUserDetails(String userId, com.example.childPortal.dto.UserUpdateRequest updateRequest) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
             User user = userOpt.get();
            user.setFullName(updateRequest.getFullName());
            user.setEmail(updateRequest.getEmail());
            user.setPhone(updateRequest.getPhone());
            user.setActive(updateRequest.isActive());

        if (user.getRole() == Role.PO) {
            Optional<PoliceOfficer> officerOpt = policeOfficerRepository.findByUserId(userId);
            if (officerOpt.isPresent()) {
                PoliceOfficer officer = officerOpt.get();
                officer.setBadgeNumber(updateRequest.getBadgeNumber());
                officer.setDepartment(updateRequest.getDepartment());
                officer.setRank(updateRequest.getRank());
                officer.setStationAddress(updateRequest.getStationAddress());
                policeOfficerRepository.save(officer);
            }
        } else if (user.getRole() == Role.SW) {
            Optional<SocialWorker> workerOpt = socialWorkerRepository.findByUserId(userId);
            if (workerOpt.isPresent()) {
                SocialWorker worker = workerOpt.get();
                worker.setLicenseNumber(updateRequest.getLicenseNumber());
                worker.setSpecializations(updateRequest.getSpecializations());
                worker.setOrganization(updateRequest.getOrganization());
                socialWorkerRepository.save(worker);
            }
        }
        
        userRepository.save(user);
        return true;
    }
    return false;
}

    @Override
    public List<UserManagementDTO> getUsersByRoleForManagement(String role) {
        try {
            Role roleEnum = Role.valueOf(role);
            return userRepository.findByRole(roleEnum).stream()
                    .map(this::convertToUserManagementDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return Collections.emptyList();
        }
    }

    @Override
    public List<UserManagementDTO> getActiveUsers() {
        return userRepository.findByActive(true).stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserManagementDTO> getInactiveUsers() {
        return userRepository.findByActive(false).stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserManagementDTO convertToUserManagementDTO(User user) {
        UserManagementDTO dto = new UserManagementDTO();
        dto.setUserId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setApproved(user.isApproved());
        dto.setRegistrationDate(user.getRegistrationDate());
        dto.setLastLogin(user.getLastLogin());

        if (user.getRole() == Role.PO) {
            policeOfficerRepository.findByUserId(user.getId()).ifPresent(officer -> {
                dto.setBadgeNumber(officer.getBadgeNumber());
                dto.setDepartment(officer.getDepartment());
                dto.setRank(officer.getRank());
                dto.setStationAddress(officer.getStationAddress());
            });
        } else if (user.getRole() == Role.SW) {
            socialWorkerRepository.findByUserId(user.getId()).ifPresent(worker -> {
                dto.setLicenseNumber(worker.getLicenseNumber());
                dto.setSpecializations(worker.getSpecializations());
                dto.setOrganization(worker.getOrganization());
                dto.setYearsOfExperience(String.valueOf(worker.getYearsOfExperience()));
            });
        }
        
        return dto;
    }

    @Override
    public Map<String, Long> getUserStatistics() {
        Map<String, Long> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByActive(true).size();
        long pendingApprovals = userRepository.findByApproved(false).size();
        long policeOfficers = userRepository.findByRole(Role.PO).size();
        long socialWorkers = userRepository.findByRole(Role.SW).size();
        long publicUsers = userRepository.findByRole(Role.PU).size();
        long admins = userRepository.findByRole(Role.ADMIN).size();
        
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("pendingApprovals", pendingApprovals);
        stats.put("policeOfficers", policeOfficers);
        stats.put("socialWorkers", socialWorkers);
        stats.put("publicUsers", publicUsers);
        stats.put("admins", admins);
        
        return stats;
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setApproved(user.isApproved());
        dto.setRegistrationDate(user.getRegistrationDate());
        return dto;
    }
}